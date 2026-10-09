'use strict';
/* Contract tests for core/commands/tracking (CONTRACTS §6 "Tracking"; spec WEB-08/WEB-09,
 * AT-15, AT-16, AT-17; docs/desktop-engine.md §7). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../helpers/harness.js');

const VALID = { subject: 'Comprobante sin número de departamento', description: 'El comprobante recibido no indica a qué bien corresponde el pago', responsibleId: 'RL-VENTAS', dueDate: '2026-10-12' };

function rows(h) { return h.store.select('incidentsModel').rows; }

test('AT-15: U-OWNER creates a valid incident → INC-DEMO-04 with an on-time notice, then closes INC-DEMO-01', () => {
  const h = createHarness();
  h.ok('selectAccessProfile', { profileId: 'U-OWNER' });
  const before = rows(h).find((r) => r.id === 'INC-DEMO-01');
  assert.equal(before.notice.id, 'overdue');
  assert.equal(before.notice.label, h.raw.tracking.noticeLabels.overdue);

  const created = h.ok('createIncident', VALID);
  assert.equal(created.id, 'INC-DEMO-04');
  const record = h.state().demo.incidents.find((i) => i.id === 'INC-DEMO-04');
  assert.equal(record.status, 'open');
  assert.equal(record.processId, 'PR-BOLETAS');
  assert.equal(record.isDemo, true);
  assert.equal(record.createdAt, h.raw.demo.businessDate);
  assert.equal(record.createdBy, 'U-OWNER');
  assert.equal(record.createdAtClock, '2026-10-06T10:00:00-05:00');
  assert.deepEqual(record.sourceIds, ['S-DEMO']);
  assert.equal(h.state().demo.counters.incident, 5);
  const row = rows(h).find((r) => r.id === 'INC-DEMO-04');
  assert.ok(row, 'the new record is listed');
  assert.equal(row.notice.id, 'onTime');
  assert.equal(row.notice.label, h.raw.tracking.noticeLabels.onTime);
  assert.equal(h.state().web.incidents.selectionId, 'INC-DEMO-04');
  assert.equal(h.state().web.incidents.form, null);
  const log = h.state().demo.log;
  assert.equal(log.length, 1);
  assert.equal(log[0].action, 'Crear incidencia');
  assert.equal(log[0].profileId, 'U-OWNER');
  assert.ok(log[0].result.startsWith('INC-DEMO-04'));

  /* a second one gets the next counter */
  assert.equal(h.ok('createIncident', Object.assign({}, VALID, { subject: 'Segunda incidencia de prueba' })).id, 'INC-DEMO-05');

  const closed = h.ok('closeIncident', { id: 'INC-DEMO-01', resolution: 'Convenio firmado y expediente completo' });
  assert.equal(closed.status, 'closed');
  const inc = h.state().demo.incidents.find((i) => i.id === 'INC-DEMO-01');
  assert.equal(inc.status, 'closed');
  assert.equal(inc.closedAt, h.raw.demo.businessDate);
  assert.equal(inc.resolution, 'Convenio firmado y expediente completo');
  assert.equal(inc.dueDate, '2026-10-04', 'the due date stays');
  const after = rows(h).find((r) => r.id === 'INC-DEMO-01');
  assert.equal(after.notice.id, 'closed', 'Vencido disappears after closing');
  assert.notEqual(after.notice.label, h.raw.tracking.noticeLabels.overdue);
  assert.equal(h.fail('closeIncident', { id: 'INC-DEMO-01', resolution: 'Otra resolución válida' }).code, 'already-closed');
  assert.equal(h.fail('updateIncident', { id: 'INC-DEMO-01', subject: 'Nuevo asunto' }).code, 'incident-closed');
  assert.equal(h.state().demo.log.map((l) => l.action).join(','), 'Crear incidencia,Crear incidencia,Cerrar incidencia');
});

test('AT-16: an invalid due date fails with MSG-06 and inserts nothing; empty subject → MSG-04', () => {
  const h = createHarness();
  h.ok('selectAccessProfile', { profileId: 'U-OWNER' });
  const before = h.snapshot();
  const err = h.fail('createIncident', Object.assign({}, VALID, { dueDate: '2026-13-45' }));
  assert.equal(err.code, 'validation');
  assert.equal(err.field, 'dueDate');
  assert.equal(err.messageId, 'MSG-06');
  assert.equal(err.message, h.pack.messages['MSG-06']);
  assert.equal(err.errors.dueDate, h.pack.messages['MSG-06']);
  assert.equal(h.snapshot(), before, 'zero insertions, no log entry');
  assert.equal(h.state().demo.incidents.length, 3);

  const err2 = h.fail('createIncident', Object.assign({}, VALID, { subject: '   ', dueDate: 'not-a-date' }));
  assert.equal(err2.field, 'subject', 'first invalid field in form order');
  assert.equal(err2.messageId, 'MSG-04');
  assert.equal(err2.errors.subject, h.pack.messages['MSG-04']);
  assert.equal(err2.errors.dueDate, h.pack.messages['MSG-06']);
  assert.equal(h.snapshot(), before);

  const err3 = h.fail('createIncident', Object.assign({}, VALID, { subject: 'abc', description: 'corta' }));
  assert.equal(err3.messageId, 'MSG-05');
  assert.equal(err3.errors.subject, 'Escribe entre 5 y 100 caracteres');
  assert.equal(err3.errors.description, 'Escribe entre 10 y 500 caracteres');
  assert.equal(h.fail('createIncident', Object.assign({}, VALID, { dueDate: '2026-02-30' })).messageId, 'MSG-06', 'calendar validity');
  assert.equal(h.fail('createIncident', Object.assign({}, VALID, { responsibleId: 'J-01' })).field, 'responsibleId');
  assert.equal(h.fail('closeIncident', { id: 'INC-DEMO-02', resolution: 'corta' }).messageId, 'MSG-05');
  assert.equal(h.snapshot(), before);
});

test('U-MANAGER cannot create or edit incidents (MSG-03) and the model exposes the disabled reason', () => {
  const h = createHarness();
  const before = h.snapshot();
  const err = h.fail('createIncident', VALID);
  assert.equal(err.code, 'forbidden');
  assert.equal(err.messageId, 'MSG-03');
  assert.equal(err.message, h.pack.messages['MSG-03'].text);
  assert.equal(err.action, h.pack.messages['MSG-03'].action);
  assert.equal(h.fail('closeIncident', { id: 'INC-DEMO-01', resolution: 'Resolución suficientemente larga' }).messageId, 'MSG-03');
  assert.equal(h.fail('openForm', { formId: 'incident', mode: 'create' }).messageId, 'MSG-03');
  assert.equal(h.snapshot(), before);
  const model = h.store.select('incidentsModel');
  assert.equal(model.canTrack, false);
  assert.equal(model.actions.create.enabled, false);
  assert.equal(model.actions.create.reason, h.raw.tracking.texts.trackingPermissionRequired);
  h.ok('selectAccessProfile', { profileId: 'U-EMPLOYEE' });
  assert.equal(h.fail('createIncident', VALID).messageId, 'MSG-03');
});

test('AT-17: editing PM-01 through the form and cancelling applies nothing; closeProject needs confirmed', () => {
  const h = createHarness();
  h.ok('selectAccessProfile', { profileId: 'U-OWNER' });
  h.ok('openForm', { formId: 'project', recordId: 'PM-01' });
  let form = h.state().web.projects.form;
  assert.equal(form.mode, 'edit');
  assert.equal(form.dirty, false);
  h.ok('updateForm', { formId: 'project', field: 'objective', value: 'Objetivo modificado en el formulario' });
  form = h.state().web.projects.form;
  assert.equal(form.dirty, true);
  const dirty = h.fail('closeForm', { formId: 'project' });
  assert.equal(dirty.code, 'dirty');
  assert.equal(dirty.formId, 'project');
  h.ok('closeForm', { formId: 'project', discard: true });
  assert.equal(h.state().web.projects.form, null);
  const pm = h.state().demo.projects.find((p) => p.id === 'PM-01');
  assert.equal(pm.objective, h.raw.tracking.projects[0].objective, 'cancel saves nothing');
  assert.equal(pm.status, 'inProgress');
  assert.equal(h.state().demo.log.length, 0);

  const err = h.fail('closeProject', { id: 'PM-01', result: 'Resultado de cierre suficientemente largo' });
  assert.equal(err.code, 'validation');
  assert.equal(err.field, 'confirmed');
  assert.equal(err.messageId, 'MSG-04');
  assert.equal(h.state().demo.projects[0].status, 'inProgress');
  const closed = h.ok('closeProject', { id: 'PM-01', result: 'Resultado de cierre suficientemente largo', confirmed: true });
  assert.equal(closed.status, 'concluded');
  const after = h.state().demo.projects[0];
  assert.equal(after.status, 'concluded');
  assert.equal(after.closedAt, h.raw.demo.businessDate);
  assert.equal(after.result, 'Resultado de cierre suficientemente largo');
  assert.equal(after.targetVersionId, 'V-TOBE-02', 'closing never publishes or changes the version');
  assert.deepEqual(Object.keys(h.state().demo.versions), [], 'closing a project never creates an AS-IS');
  assert.equal(h.state().demo.currentAsIsVersionId, 'V-ASIS-01');
  assert.equal(h.fail('closeProject', { id: 'PM-01', result: 'Otro resultado largo', confirmed: true }).code, 'already-concluded');
  assert.equal(h.fail('updateProject', { id: 'PM-01', objective: 'Objetivo modificado otra vez' }).code, 'project-concluded');
  assert.equal(h.state().demo.log[h.state().demo.log.length - 1].action, 'Marcar concluido');
});

test('«Preparar nuevo AS-IS» is not available before the project closes and never for the owner', () => {
  const h = createHarness();
  h.ok('selectAccessProfile', { profileId: 'U-OWNER' });
  let model = h.store.select('projectsModel');
  assert.equal(model.actions.prepareAsIs.enabled, false);
  assert.equal(model.actions.prepareAsIs.reason, h.pack.messages['MSG-03'].text, 'only the admin prepares a new AS-IS');
  h.ok('useAnalystProfile');
  model = h.store.select('projectsModel');
  assert.equal(model.actions.prepareAsIs.enabled, false);
  assert.equal(model.actions.prepareAsIs.reason, h.raw.tracking.texts.closeHint);
  assert.equal(model.actions.simulateClose.command.type, 'navigateTo');
  assert.equal(model.actions.simulateClose.command.payload.target.desktop.scenarioId, 'SCN-02');
  const avail = h.store.select('scenarioAvailability', 'SCN-02');
  assert.equal(avail.ok, false, 'SCN-02 is blocked until V-TOBE-03 exists');
});

test('createProject validates the target version and startProject moves planned → inProgress', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const base = { name: 'Proyecto de prueba', objective: 'Objetivo de prueba suficientemente largo', responsibleId: 'RL-ADMIN', dueDate: '2026-11-01' };
  assert.equal(h.fail('createProject', Object.assign({}, base, { targetVersionId: 'V-TOBE-01' })).field, 'targetVersionId', 'incomplete draft is not publishable');
  assert.equal(h.fail('createProject', Object.assign({}, base, { targetVersionId: 'V-ASIS-01' })).field, 'targetVersionId');
  assert.equal(h.fail('createProject', Object.assign({}, base, { targetVersionId: 'V-TOBE-03' })).messageId, 'MSG-13', 'V-TOBE-03 does not exist yet');
  assert.equal(h.fail('createProject', Object.assign({}, base, { responsibleId: 'RL-CONT', targetVersionId: 'V-TOBE-02' })).field, 'responsibleId');
  const created = h.ok('createProject', Object.assign({}, base, { targetVersionId: 'V-TOBE-02' }));
  assert.equal(created.id, 'PM-DEMO-02');
  assert.equal(created.record.status, 'planned');
  assert.equal(created.record.startDate, null);
  assert.equal(h.ok('startProject', { id: 'PM-DEMO-02' }).status, 'inProgress');
  assert.equal(h.state().demo.projects[1].startDate, h.raw.demo.businessDate);
  assert.equal(h.fail('startProject', { id: 'PM-DEMO-02' }).code, 'invalid-transition');
  assert.equal(h.fail('updateProject', { id: 'PM-DEMO-02', status: 'concluded' }).field, 'status');
  assert.deepEqual(h.state().demo.log.map((l) => l.action), ['Crear proyecto', 'Iniciar proyecto']);
});
