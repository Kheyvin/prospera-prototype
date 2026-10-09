'use strict';
/* Interaction journeys without a DOM (spec §11 JRN-02/03/06/08/09/11; annex B AT-05, AT-06,
 * AT-18…AT-24, AT-29). Every step is a command dispatched through the store; every assertion
 * reads a selector, exactly as the features do. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../helpers/harness.js');

const SES = 'SES-BOLETAS';

function runScenario1ToReview(h) {
  h.ok('selectTab', { tabId: 'desktop' });
  h.ok('useAnalystProfile', {});
  h.ok('startScenario', { sessionId: SES, scenarioId: 'SCN-01' });
  for (let i = 0; i < 10; i++) {
    const r = h.store.dispatch('continueScenario', { sessionId: SES });
    h.scheduler.flush();
    if (!r.ok || h.session().playback.status === 'awaiting-review') break;
  }
  assert.equal(h.session().playback.status, 'awaiting-review');
}

test('JRN-02 · organización → área → proceso → actividad → instrucción, y Volver restaura cada contexto (AT-05)', () => {
  const h = createHarness();
  h.ok('selectTab', { tabId: 'web' });
  assert.equal(h.store.select('orgChartModel').areas.length, 6);
  h.ok('selectEntity', { entityId: 'A-AF' });
  const inspector = h.store.select('inspectorModel');
  assert.equal(inspector.header.name, 'Administración y Finanzas');
  const openArea = inspector.actions.find((a) => a.id === 'open-area');
  h.ok(openArea.command.type, openArea.command.payload);
  const area = h.store.select('areaSpaceModel');
  assert.equal(area.title, 'Administración y Finanzas');
  const card = area.sections.find((s) => s.kind === 'processes').cards.find((c) => c.id === 'PR-BOLETAS');
  const openFlow = card.actions.find((a) => a.id === 'open-flow');
  assert.equal(openFlow.enabled, true);
  h.ok(openFlow.command.type, openFlow.command.payload);
  const flow = h.store.select('flowModel');
  assert.equal(flow.version.id, 'V-ASIS-01');
  assert.equal(flow.nodes.filter((n) => n.kind === 'task').length, 8);
  h.ok('selectEntity', { entityId: 'A-03', versionId: 'V-ASIS-01' });
  const act = h.store.select('inspectorModel');
  const instr = act.actions.find((a) => a.id === 'instruction');
  h.ok(instr.command.type, instr.command.payload);
  const ins = h.store.select('instructionModel');
  assert.equal(ins.title, 'Verificar abono y documentos');
  assert.equal(ins.sections.length, 9);
  assert.equal(ins.sections.find((s) => s.id === 'time').text, 'Sin dato proporcionado');
  assert.equal(h.store.select('breadcrumbs').length, 4);
  h.ok('contextBack', {});
  assert.equal(h.state().web.activityKey, null);
  assert.equal(h.state().web.processView, 'flow');
  h.ok('contextBack', {});
  assert.equal(h.state().web.level, 'tactical');
  assert.equal(h.state().web.areaId, 'A-AF');
});

test('JRN-03 · actividad → rol → puesto → persona y Back del inspector no cambian el contexto (AT-06)', () => {
  const h = createHarness();
  h.ok('navigateTo', { target: { tab: 'web', web: { level: 'operational', processId: 'PR-BOLETAS', processView: 'flow', versionId: 'V-ASIS-01' } } });
  const before = JSON.stringify({ level: h.state().web.level, processId: h.state().web.processId, camera: h.state().camera });
  h.ok('selectEntity', { entityId: 'A-03', versionId: 'V-ASIS-01' });
  h.ok('selectEntity', { entityId: 'RL-ADMIN', followLink: true });
  h.ok('selectEntity', { entityId: 'J-03', followLink: true });
  h.ok('selectEntity', { entityId: 'P-03', followLink: true });
  assert.equal(h.store.select('inspectorModel').header.name, 'Xyomara Vanessa Medina Huaraya');
  const related = h.store.select('inspectorModel').related.groups.map((g) => g.label);
  assert.ok(related.length > 0);
  h.ok('inspectorBack', {});
  h.ok('inspectorBack', {});
  assert.equal(h.store.select('inspectorModel').header.id, 'RL-ADMIN');
  h.ok('closeInspector', {});
  assert.equal(h.state().web.selection, null);
  assert.equal(JSON.stringify({ level: h.state().web.level, processId: h.state().web.processId, camera: h.state().camera }), before);
});

test('JRN-04 · foco de relaciones del objetivo se conserva al abrir un sistema y se limpia explícitamente (AT-08)', () => {
  const h = createHarness();
  h.ok('navigateTo', { target: { tab: 'web', web: { level: 'strategic', representation: 'processmap' } } });
  h.ok('setHighlightRoot', { entityId: 'OBJ-01' });
  const map = h.store.select('processMapModel');
  assert.equal(map.highlight.rootId, 'OBJ-01');
  assert.ok(map.highlight.entityIds.includes('PR-BOLETAS'));
  assert.ok(map.highlight.entityIds.includes('SYS-DRIVE'));
  h.ok('selectEntity', { entityId: 'SYS-DRIVE' });
  assert.equal(h.store.select('processMapModel').highlight.rootId, 'OBJ-01');
  h.ok('closeInspector', {});
  assert.equal(h.store.select('processMapModel').highlight.rootId, 'OBJ-01');
  h.ok('setHighlightRoot', { entityId: null });
  assert.equal(h.store.select('processMapModel').highlight, null);
  h.ok('setSearch', { query: 'xyomara' });
  assert.equal(h.store.select('searchResults').count, 1);
  h.ok('setSearch', { query: 'zzzz-no-existe' });
  assert.equal(h.store.select('searchResults').count, 0);
  assert.ok(h.store.select('searchResults').empty);
});

test('JRN-06 · SCN-01: rechazar no crea versión; cancelar conserva la propuesta; publicar crea V-TOBE-03 una sola vez (AT-18…AT-20)', () => {
  const h = createHarness();
  runScenario1ToReview(h);
  h.ok('setReviewField', { sessionId: SES, field: 'reason', value: 'Motivo de prueba' });
  h.ok('resolveReview', { sessionId: SES, decision: 'reject' });
  assert.equal(h.state().demo.versions['V-TOBE-03'], undefined);
  assert.ok(h.state().demo.log.some((e) => e.action === 'Rechazar propuesta'));
  runScenario1ToReview(h);
  h.ok('resolveReview', { sessionId: SES, decision: 'cancel' });
  assert.equal(h.session().review.state, 'canceled');
  assert.ok(h.state().demo.staging['V-TOBE-03']);
  h.ok('resumeReview', { sessionId: SES });
  h.ok('setReviewField', { sessionId: SES, field: 'instruction', value: 'Comparar los documentos recibidos con los requisitos del tipo de pago y verificar firmas.' });
  const first = h.ok('resolveReview', { sessionId: SES, decision: 'approve' });
  assert.equal(first.versionId, 'V-TOBE-03');
  const second = h.store.dispatch('resolveReview', { sessionId: SES, decision: 'approve' });
  assert.equal(second.ok, false);
  assert.equal(Object.keys(h.state().demo.versions).length, 1);
  const v3 = h.store.getVersion('V-TOBE-03');
  assert.match(v3.activities['T-02'].attributes.instruction, /^Comparar los documentos recibidos/);
  assert.equal(h.state().demo.projects.find((p) => p.id === 'PM-01').targetVersionId, 'V-TOBE-03');
  assert.equal(h.store.select('desktopModel', SES).artifact.state, 'published');
});

test('JRN-08 · SCN-02 bloqueado sin TO-BE 3; con casilla sin marcar no cambia nada; aprobado crea V-ASIS-02 y concluye PM-01 (AT-23, AT-24)', () => {
  const h = createHarness();
  h.ok('selectTab', { tabId: 'desktop' });
  h.ok('useAnalystProfile', {});
  const blocked = h.fail('startScenario', { sessionId: SES, scenarioId: 'SCN-02' });
  assert.equal(blocked.code, 'scenario-unavailable');
  runScenario1ToReview(h);
  h.ok('resolveReview', { sessionId: SES, decision: 'approve' });
  h.ok('startScenario', { sessionId: SES, scenarioId: 'SCN-02' });
  const invalid = h.ok('submitScenarioForm', { sessionId: SES });
  assert.equal(invalid.applied, false);
  assert.equal(h.state().demo.projects.find((p) => p.id === 'PM-01').status, 'inProgress');
  h.ok('setScenarioFormField', { sessionId: SES, field: 'confirmation', value: true });
  assert.equal(h.ok('submitScenarioForm', { sessionId: SES }).applied, true);
  h.ok('resolveReview', { sessionId: SES, decision: 'approve' });
  assert.equal(h.state().demo.currentAsIsVersionId, 'V-ASIS-02');
  assert.equal(h.state().demo.projects.find((p) => p.id === 'PM-01').status, 'concluded');
  assert.ok(h.store.getVersion('V-ASIS-01'), 'AS-IS 1 is kept');
  const completed = h.store.select('desktopModel', SES).events.filter((e) => e.kind === 'completed').pop();
  h.ok('navigateTo', { target: completed.cta.target });
  assert.equal(h.state().web.versionId, 'V-ASIS-02');
  assert.equal(h.store.select('flowModel').version.label, 'AS-IS 2 · adopción simulada');
  h.ok('selectAccessProfile', { profileId: 'U-EMPLOYEE' });
  const history = h.store.select('historyModel', 'PR-BOLETAS');
  const ids = history.rows.map((r) => r.versionId);
  assert.ok(ids.includes('V-ASIS-02') && ids.includes('V-ASIS-01'));
  assert.ok(!ids.includes('V-TOBE-03'), 'AT-25: the employee cannot see the TO-BE proposal');
});

test('JRN-09 · U-EMPLOYEE se ajusta a boletas, no ve seguridad ni resultados ajenos (AT-10)', () => {
  const h = createHarness();
  h.ok('navigateTo', { target: { tab: 'web', web: { level: 'operational', processId: 'PR-01', processView: 'sheet' } } });
  h.ok('selectAccessProfile', { profileId: 'U-EMPLOYEE' });
  assert.equal(h.state().web.processId, 'PR-BOLETAS');
  assert.equal(h.state().web.notice.kind, 'adjusted');
  h.ok('setSearch', { query: 'Flor de María' });
  assert.equal(h.store.select('searchResults').count, 0);
  assert.equal(h.store.select('currentContext').securityAllowed, false);
  assert.equal(h.store.select('securityModel').permitted, false);
  assert.equal(h.fail('setSecurityView', { view: 'accounts' }).messageId, 'MSG-02');
  assert.equal(h.fail('createIncident', { subject: 'Prueba cinco', description: 'Descripción de prueba', responsibleId: 'RL-VENTAS', dueDate: '2026-10-20' }).messageId, 'MSG-03');
});

test('JRN-11 · reiniciar con trabajo pendiente pide confirmación y vuelve al fixture (AT-29)', () => {
  const h = createHarness();
  runScenario1ToReview(h);
  h.ok('setDraft', { sessionId: 'SES-ORG', text: 'borrador propio' });
  const r = h.ok('requestReset', {});
  assert.equal(r.confirmRequired, true);
  h.ok('closeModal', {});
  assert.equal(h.session().review.state, 'pending');
  assert.equal(h.session('SES-ORG').draft, 'borrador propio');
  h.ok('resetDemo', { force: true });
  assert.equal(h.state().app.activeTab, 'architecture');
  assert.equal(h.state().app.profileId, 'U-MANAGER');
  assert.equal(h.session().events.length, 0);
  assert.deepEqual(h.state().demo.versions, {});
  assert.equal(h.scheduler.pending(), 0);
});
