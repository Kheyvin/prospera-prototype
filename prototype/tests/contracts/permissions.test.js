'use strict';
/* Contract tests for core/permissions (CONTRACTS §5.5; spec §5.2 matrix, §16.4 version-bound
 * visibility). States are built from createInitialState and patched per profile. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntime } = require('../helpers/load.js');

const P = loadRuntime({ allowMissing: true });
const pack = P.loadPack();
const storeCore = P.require('core/store');
const permissions = P.require('core/permissions').createPermissions(pack);

function stateFor(profileId, patch) {
  const s = storeCore.createInitialState(pack);
  s.app.profileId = profileId;
  if (patch) Object.assign(s.web, patch);
  return s;
}

const range = (prefix, n) => Array.from({ length: n }, (_, i) => prefix + (i < 9 ? '0' : '') + (i + 1));

test('U-MANAGER sees everything but cannot publish (MSG-03)', () => {
  const s = stateFor('U-MANAGER');
  assert.equal(permissions.role(s), 'manager');
  assert.equal(permissions.visibleEntityIds(s), null);
  for (const id of ['A-MKT', 'J-06', 'T-01', 'GAP-01', 'POL-01']) assert.equal(permissions.isVisible(s, id), true, id);
  assert.equal(permissions.canSeeVersion(s, 'V-TOBE-02'), true);
  assert.equal(permissions.can(s, 'viewAll').ok, true);
  const publish = permissions.can(s, 'publish');
  assert.equal(publish.ok, false);
  assert.equal(publish.messageId, 'MSG-03');
  assert.equal(publish.text, pack.messages['MSG-03'].text);
  assert.equal(publish.action, pack.messages['MSG-03'].action);
  assert.equal(permissions.can(s, 'maintainModel').ok, false);
  assert.equal(permissions.can(s, 'trackProcess', { processId: 'PR-BOLETAS' }).messageId, 'MSG-03');
  assert.equal(permissions.can(s, 'manageAccounts').messageId, 'MSG-03');
  assert.equal(permissions.can(s, 'viewSecurity').ok, false, 'security requires admin');
  assert.equal(permissions.can(s, 'viewSecurity').messageId, 'MSG-02');
});

test('U-ADMIN has every permission', () => {
  const s = stateFor('U-ADMIN');
  for (const action of ['viewAll', 'viewSecurity', 'viewAudit', 'viewDraftsToBe', 'maintainModel', 'publish', 'trackProcess', 'manageAccounts']) {
    assert.equal(permissions.can(s, action, { processId: 'PR-BOLETAS' }).ok, true, action);
  }
});

test('U-EMPLOYEE sees only the listed set plus AS-IS activities and their resources', () => {
  const s = stateFor('U-EMPLOYEE');
  const visible = permissions.visibleEntityIds(s);
  assert.ok(visible instanceof Set);
  for (const id of ['A-MKT', 'J-06', 'A-PRO', 'J-01', 'P-01', 'GAP-01', 'OBJ-01', 'SYS-SPERANT', 'MP-AF-X']) {
    assert.equal(permissions.isVisible(s, id) && pack.entities.has(id), false, `${id} must be hidden`);
  }
  assert.equal(permissions.canSeeVersion(s, 'V-TOBE-02'), false);
  assert.equal(permissions.canSeeVersion(s, 'V-TOBE-01'), false);
  assert.equal(permissions.canSeeVersion(s, 'V-ASIS-01'), true);
  assert.deepEqual([...permissions.visibleVersionIds(s)], ['V-ASIS-01']);
  const track = permissions.can(s, 'trackProcess', { processId: 'PR-BOLETAS' });
  assert.equal(track.ok, false);
  assert.equal(track.messageId, 'MSG-03');
  assert.equal(permissions.can(s, 'viewTracking').ok, false);
  assert.equal(permissions.can(s, 'viewDraftsToBe').ok, false);
  /* activity visibility derives from the authorized version types (AS-IS), not from the id list */
  for (const id of range('A-', 8)) assert.equal(permissions.isVisible(s, id), true, `${id} is an AS-IS activity`);
  for (const id of range('T-', 8)) assert.equal(permissions.isVisible(s, id), false, `${id} belongs to a TO-BE version`);
  for (const id of ['RL-ADMIN', 'SYS-DRIVE', 'DOC-BOLETA', 'ACTOR-CLIENTE', 'PR-BOLETAS', 'A-AF', 'A-COM', 'J-08', 'P-03']) {
    assert.equal(permissions.isVisible(s, id), true, id);
  }
  assert.equal(permissions.can(s, 'viewEntity', { entityId: 'A-MKT' }).messageId, 'MSG-02');
  assert.equal(permissions.can(s, 'viewVersion', { versionId: 'V-TOBE-02' }).messageId, 'MSG-02');
  assert.equal(permissions.can(s, 'viewSecurity').ok, false);
});

test('U-EMPLOYEE sees an adopted demo AS-IS (and its T-* activities) but never V-TOBE-03', () => {
  const s = stateFor('U-EMPLOYEE');
  s.demo.versions['V-TOBE-03'] = { id: 'V-TOBE-03', processId: 'PR-BOLETAS', type: 'TO-BE', baseVersionId: 'V-TOBE-02', isDemo: true };
  s.demo.versions['V-ASIS-02'] = { id: 'V-ASIS-02', processId: 'PR-BOLETAS', type: 'AS-IS', baseVersionId: 'V-TOBE-03', originVersionId: 'V-TOBE-03', isDemo: true, activities: Object.fromEntries(Object.entries(pack.baseActivities('V-TOBE-02')).map(([k, a]) => [k, JSON.parse(JSON.stringify(a))])) };
  s.demo.currentAsIsVersionId = 'V-ASIS-02';
  assert.equal(permissions.canSeeVersion(s, 'V-ASIS-02'), true);
  assert.equal(permissions.canSeeVersion(s, 'V-TOBE-03'), false);
  assert.equal(permissions.isVisible(s, 'T-02'), true, 'T-02 is reachable through the adopted AS-IS');
  assert.equal(permissions.isVisible(s, 'SYS-SPERANT'), true, 'resources of a visible AS-IS activity become visible');
});

test('U-OWNER can track PR-BOLETAS, sees TO-BE versions and tracking, but cannot publish', () => {
  const s = stateFor('U-OWNER');
  assert.equal(permissions.role(s), 'employee');
  assert.equal(permissions.isOwner(s, 'PR-BOLETAS'), true);
  assert.equal(permissions.isOwner(s, 'PR-01'), false);
  assert.equal(permissions.can(s, 'trackProcess', { processId: 'PR-BOLETAS' }).ok, true);
  assert.equal(permissions.can(s, 'trackProcess', { processId: 'PR-01' }).ok, false);
  assert.equal(permissions.canSeeVersion(s, 'V-TOBE-02'), true);
  assert.equal(permissions.can(s, 'viewDraftsToBe').ok, true);
  assert.equal(permissions.can(s, 'viewTracking').ok, true);
  assert.equal(permissions.can(s, 'publish').messageId, 'MSG-03');
  assert.equal(permissions.can(s, 'manageAccounts').ok, false);
  assert.equal(permissions.can(s, 'viewSecurity').ok, false);
  assert.equal(permissions.isVisible(s, 'A-MKT'), false);
  for (const id of range('T-', 8)) assert.equal(permissions.isVisible(s, id), true, id);
});

test('adjustContext resets an employee from PR-01 to PR-BOLETAS with the adjusted notice', () => {
  const s = stateFor('U-EMPLOYEE', { level: 'operational', processId: 'PR-01', areaId: 'A-MKT', versionId: 'V-ASIS-01', processView: 'sheet' });
  const patch = permissions.adjustContext(s);
  assert.ok(patch, 'a patch is required when the context is not visible');
  assert.equal(patch.processId, 'PR-BOLETAS');
  assert.equal(patch.areaId, null);
  assert.equal(patch.notice, pack.ui.viewAdjusted);
  assert.equal(patch.compareVersionId, null, 'V-TOBE-02 is not visible to the employee');
  /* visible context → no patch */
  assert.equal(permissions.adjustContext(stateFor('U-EMPLOYEE', { level: 'operational', processId: 'PR-BOLETAS', areaId: 'A-AF', versionId: 'V-ASIS-01', compareVersionId: null })), null);
  assert.equal(permissions.adjustContext(stateFor('U-MANAGER', { level: 'operational', processId: 'PR-01', areaId: 'A-MKT' })), null);
  /* hidden version → patch back to the visible AS-IS */
  const v = permissions.adjustContext(stateFor('U-EMPLOYEE', { level: 'operational', processId: 'PR-BOLETAS', versionId: 'V-TOBE-02', compareVersionId: null }));
  assert.equal(v.versionId, 'V-ASIS-01');
  /* security module → twin */
  const sec = permissions.adjustContext(stateFor('U-MANAGER', { module: 'security' }));
  assert.equal(sec.module, 'twin');
});

test('matrixFor exposes the access matrix row for the active role', () => {
  const rows = permissions.matrixFor(stateFor('U-OWNER'));
  assert.ok(rows.length > 0);
  const viewAll = rows.find((r) => r.action === 'viewAll');
  assert.equal(viewAll.allowed, false);
  assert.equal(permissions.matrixFor(stateFor('U-ADMIN')).every((r) => r.allowed === true), true);
});
