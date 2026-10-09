'use strict';
/* Contract tests for core/commands/security (CONTRACTS §6 "Security"; spec WEB-10, §16.6,
 * AT-27, JRN-12; docs/desktop-engine.md §7). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../helpers/harness.js');

function accounts(h) { return h.state().demo.accounts; }

test('AT-27: a duplicate username is blocked with MSG-07, ignoring case and surrounding spaces', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const before = h.snapshot();
  for (const username of ['demo.analista', 'DEMO.ANALISTA', '  demo.analista  ', ' Demo.Analista ']) {
    const err = h.fail('createDemoUser', { username, role: 'manager', positionId: null });
    assert.equal(err.code, 'validation', username);
    assert.equal(err.field, 'username');
    assert.equal(err.messageId, 'MSG-07');
    assert.equal(err.message, h.pack.messages['MSG-07']);
    assert.equal(err.errors.username, h.pack.messages['MSG-07']);
  }
  assert.equal(h.snapshot(), before, 'no partial records');
  assert.equal(accounts(h).length, 3);
  assert.equal(h.state().demo.log.length, 0);
});

test('AT-27: deleting or deactivating the only active admin is blocked with MSG-08', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const before = h.snapshot();
  const del = h.fail('deleteDemoUser', { id: 'ACCOUNT-01' });
  assert.equal(del.messageId, 'MSG-08');
  assert.equal(del.message, h.pack.messages['MSG-08']);
  const deact = h.fail('deactivateDemoUser', { id: 'ACCOUNT-01' });
  assert.equal(deact.messageId, 'MSG-08');
  const demote = h.fail('updateDemoUser', { id: 'ACCOUNT-01', role: 'manager', positionId: null });
  assert.equal(demote.messageId, 'MSG-08');
  assert.equal(demote.field, 'role');
  assert.equal(h.snapshot(), before);
  assert.equal(accounts(h).find((a) => a.id === 'ACCOUNT-01').status, 'active');
  /* with a second active admin the first one can be deactivated, then the second becomes the last */
  const created = h.ok('createDemoUser', { username: 'segundo.admin', role: 'admin', positionId: null });
  assert.equal(created.id, 'ACCOUNT-04');
  assert.equal(h.ok('deactivateDemoUser', { id: 'ACCOUNT-01' }).status, 'inactive');
  assert.equal(h.fail('deactivateDemoUser', { id: 'ACCOUNT-01' }).code, 'already-inactive');
  assert.equal(h.fail('deleteDemoUser', { id: 'ACCOUNT-04' }).messageId, 'MSG-08');
  assert.equal(h.fail('deactivateDemoUser', { id: 'ACCOUNT-04' }).messageId, 'MSG-08');
  const model = h.store.select('securityModel');
  assert.equal(model.permitted, true);
  assert.equal(model.accounts.length, 4);
});

test('creating an employee without a position fails (MSG-04); invalid usernames and roles are rejected', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const before = h.snapshot();
  const err = h.fail('createDemoUser', { username: 'nuevo.empleado', role: 'employee', positionId: null });
  assert.equal(err.code, 'validation');
  assert.equal(err.field, 'positionId');
  assert.equal(err.messageId, 'MSG-04');
  assert.equal(h.fail('createDemoUser', { username: 'nuevo.empleado', role: 'employee', positionId: 'P-03' }).messageId, 'MSG-13', 'a person is not a position');
  assert.equal(h.fail('createDemoUser', { username: 'ab', role: 'manager', positionId: null }).messageId, 'MSG-05');
  const bad = h.fail('createDemoUser', { username: 'con espacios', role: 'manager', positionId: null });
  assert.equal(bad.field, 'username');
  assert.equal(bad.message, h.raw.security.form.fields.username.rule);
  assert.equal(h.fail('createDemoUser', { username: 'nuevo.empleado', role: 'owner', positionId: null }).field, 'role');
  assert.equal(h.fail('createDemoUser', { username: '', role: 'manager', positionId: null }).messageId, 'MSG-04');
  assert.equal(h.snapshot(), before);
  const ok = h.ok('createDemoUser', { username: '  Nuevo.Empleado ', role: 'employee', positionId: 'J-07' });
  assert.equal(ok.record.username, 'nuevo.empleado', 'trimmed and lowercased');
  assert.equal(ok.record.isTest, true);
  assert.equal(ok.record.status, 'active');
  assert.equal('password' in ok.record, false);
});

test('non-admin profiles cannot manage accounts (MSG-03)', () => {
  const h = createHarness();
  for (const profileId of ['U-MANAGER', 'U-EMPLOYEE', 'U-OWNER']) {
    h.ok('selectAccessProfile', { profileId });
    const err = h.fail('createDemoUser', { username: 'persona.prueba', role: 'manager', positionId: null });
    assert.equal(err.code, 'forbidden', profileId);
    assert.equal(err.messageId, 'MSG-03');
    assert.equal(h.fail('deleteDemoUser', { id: 'ACCOUNT-03' }).messageId, 'MSG-03');
    const model = h.store.select('securityModel');
    assert.equal(model.permitted, false);
    assert.equal(model.restricted, h.raw.security.restricted);
  }
  assert.equal(accounts(h).length, 3);
});

test('JRN-12: create → edit role → deactivate → delete writes one log entry per action and keeps the log after delete', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const created = h.ok('createDemoUser', { username: 'usuario.ficticio', role: 'employee', positionId: 'J-07' });
  const id = created.id;
  const upd = h.ok('updateDemoUser', { id, role: 'manager', positionId: null });
  assert.deepEqual(upd.changed, ['role', 'positionId']);
  assert.equal(accounts(h).find((a) => a.id === id).role, 'manager');
  assert.equal(h.fail('updateDemoUser', { id, role: 'employee', positionId: null }).field, 'positionId');
  assert.equal(h.ok('deactivateDemoUser', { id }).status, 'inactive');
  assert.equal(accounts(h).find((a) => a.id === id).deactivatedAt, h.raw.demo.businessDate);
  const del = h.ok('deleteDemoUser', { id });
  assert.equal(del.deleted, true);
  assert.equal(accounts(h).some((a) => a.id === id), false);
  assert.equal(h.fail('deleteDemoUser', { id }).code, 'unknown-record');
  const log = h.state().demo.log;
  assert.deepEqual(log.map((l) => l.action), ['Crear usuario', 'Editar acceso', 'Desactivar usuario', 'Eliminar usuario de prueba']);
  assert.deepEqual(log.map((l) => l.seq), [1, 2, 3, 4]);
  assert.deepEqual(log.map((l) => l.at), ['2026-10-06T10:00:01-05:00', '2026-10-06T10:00:02-05:00', '2026-10-06T10:00:03-05:00', '2026-10-06T10:00:04-05:00']);
  for (const entry of log) {
    assert.equal(entry.profileId, 'U-ADMIN');
    assert.equal(entry.result, `${id} · usuario.ficticio`);
  }
  const audit = h.store.select('securityModel');
  assert.equal(audit.audit.length, 4, 'the audit view lists every entry');
  /* canonical demo profiles are untouched by account edits */
  assert.deepEqual([...h.pack.profiles.keys()], ['U-ADMIN', 'U-MANAGER', 'U-EMPLOYEE', 'U-OWNER']);
  /* a non-test account cannot be deleted */
  h.state().demo.accounts.push({ id: 'ACCOUNT-REAL', username: 'cuenta.fuente', role: 'manager', positionId: null, status: 'active', isTest: false });
  assert.equal(h.fail('deleteDemoUser', { id: 'ACCOUNT-REAL' }).code, 'not-test-account');
});
