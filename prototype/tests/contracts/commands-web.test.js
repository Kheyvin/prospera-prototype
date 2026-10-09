'use strict';
/* Contract tests for core/commands/web and navigateTo (CONTRACTS §6, §7; docs/store.md §5, §8.2).
 * JRN-02 of spec §11: organización → área → proceso → actividad → instrucción, and back. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../helpers/harness.js');

function contextOf(web) {
  return { module: web.module, level: web.level, representation: web.representation, areaId: web.areaId, processId: web.processId, processView: web.processView, versionId: web.versionId, activityKey: web.activityKey, paymentVariant: web.paymentVariant };
}

test('JRN-02: enterArea → enterProcess (flow) → openInstruction and contextBack twice restores process then area', () => {
  const h = createHarness();
  assert.deepEqual(h.ok('enterArea', { areaId: 'A-AF' }), { areaId: 'A-AF' });
  let w = h.state().web;
  assert.equal(w.level, 'tactical');
  assert.equal(w.areaId, 'A-AF');
  assert.equal(w.contextHistory.length, 1);

  const entered = h.ok('enterProcess', { processId: 'PR-BOLETAS', view: 'flow' });
  assert.deepEqual(entered, { processId: 'PR-BOLETAS', view: 'flow', versionId: 'V-ASIS-01' });
  w = h.state().web;
  assert.equal(w.level, 'operational');
  assert.equal(w.processView, 'flow');
  assert.equal(w.areaId, 'A-AF');
  assert.equal(w.paymentVariant, 'separacion');
  assert.equal(w.contextHistory.length, 2);

  const opened = h.ok('openInstruction', { versionId: 'V-ASIS-01', key: 'A-03' });
  assert.deepEqual(opened, { versionId: 'V-ASIS-01', key: 'A-03', nodeKind: 'task' });
  w = h.state().web;
  assert.equal(w.activityKey, 'A-03');
  assert.equal(w.processView, 'flow');
  assert.equal(w.contextHistory.length, 3);
  const instruction = h.store.select('instructionModel', 'V-ASIS-01', 'A-03');
  assert.ok(instruction, 'instruction model exists');
  const crumbs = h.store.select('breadcrumbs');
  assert.ok(crumbs.length >= 3);
  assert.equal(crumbs[crumbs.length - 1].target, null, 'last crumb has no target');

  let back = h.ok('contextBack');
  assert.equal(back.restored, true);
  assert.equal(back.cameraKey, 'flow:V-ASIS-01:separacion');
  w = h.state().web;
  assert.equal(w.activityKey, null);
  assert.equal(w.level, 'operational');
  assert.equal(w.processId, 'PR-BOLETAS');
  assert.equal(w.processView, 'flow');
  assert.equal(w.contextHistory.length, 2);

  back = h.ok('contextBack');
  assert.equal(back.restored, true);
  assert.equal(back.cameraKey, 'area:A-AF');
  w = h.state().web;
  assert.equal(w.level, 'tactical');
  assert.equal(w.areaId, 'A-AF');
  assert.equal(w.processId, null);
  assert.equal(w.contextHistory.length, 1);

  back = h.ok('contextBack');
  w = h.state().web;
  assert.equal(w.level, 'strategic');
  assert.equal(w.areaId, null);
  assert.equal(w.contextHistory.length, 0);
  /* empty history → logical parent, never an error */
  const atRoot = h.ok('contextBack');
  assert.ok(atRoot.atRoot === true || atRoot.parent !== undefined || atRoot.restored === false);
});

test('enterProcess validates the view and the version; openInstruction validates the activity', () => {
  const h = createHarness();
  assert.equal(h.fail('enterProcess', { processId: 'PR-NOPE' }).code, 'unknown-process');
  assert.equal(h.fail('enterProcess', { processId: 'PR-BOLETAS', view: 'nope' }).code, 'invalid-view');
  assert.equal(h.fail('enterProcess', { processId: 'PR-BOLETAS', versionId: 'V-NOPE' }).code, 'unknown-version');
  assert.equal(h.fail('enterArea', { areaId: 'A-NOPE' }).code, 'unknown-area');
  assert.equal(h.fail('openInstruction', { versionId: 'V-ASIS-01', key: 'T-02' }).code, 'unknown-activity');
  assert.equal(h.fail('setProcessView', { view: 'flow' }).code, 'no-process');
  h.ok('enterProcess', { processId: 'PR-BOLETAS', view: 'sheet', versionId: 'V-TOBE-02' });
  assert.equal(h.state().web.versionId, 'V-TOBE-02');
  assert.equal(h.fail('setPaymentVariant', { variant: 'nope' }).code, 'invalid-variant');
  assert.equal(h.fail('setLevel', { level: 'nope' }).code, 'invalid-level');
  assert.equal(h.fail('setRepresentation', { representation: 'nope' }).code, 'invalid-representation');
  assert.equal(h.fail('setDepth', { depth: 'nope' }).code, 'invalid-depth');
});

test('selectEntity / followLink / inspectorBack keep their own history without touching the context', () => {
  const h = createHarness();
  h.ok('enterProcess', { processId: 'PR-BOLETAS', view: 'flow' });
  const ctxBefore = contextOf(h.state().web);
  let r = h.ok('selectEntity', { entityId: 'A-03', versionId: 'V-ASIS-01' });
  assert.deepEqual(r, { selection: { entityId: 'A-03', kind: 'entity', versionId: 'V-ASIS-01' }, pushed: false });
  r = h.ok('selectEntity', { entityId: 'RL-ADMIN', followLink: true });
  assert.equal(r.pushed, true);
  r = h.ok('selectEntity', { entityId: 'J-03', followLink: true });
  assert.equal(r.pushed, true);
  assert.equal(h.state().web.inspectorHistory.length, 2);
  assert.deepEqual(h.state().web.inspectorHistory.map((s) => s.entityId), ['A-03', 'RL-ADMIN']);
  r = h.ok('inspectorBack');
  assert.equal(r.selection.entityId, 'RL-ADMIN');
  assert.equal(r.atRoot, false);
  r = h.ok('inspectorBack');
  assert.equal(r.selection.entityId, 'A-03');
  assert.equal(r.atRoot, true);
  assert.equal(h.state().web.inspectorHistory.length, 0);
  assert.deepEqual(contextOf(h.state().web), ctxBefore, 'inspector navigation does not change the context');
  assert.equal(h.state().web.contextHistory.length, 1);
  h.ok('closeInspector');
  assert.equal(h.state().web.selection, null);
  assert.equal(h.fail('selectEntity', { entityId: 'NOPE' }).code, 'unknown-entity');
  assert.equal(h.fail('selectEntity', { entityId: 'A-03', kind: 'weird' }).code, 'invalid-kind');
  /* flow node selection (decision) */
  r = h.ok('selectEntity', { entityId: 'A-G1', versionId: 'V-ASIS-01', kind: 'flowNode' });
  assert.equal(r.selection.kind, 'flowNode');
  /* selecting without followLink replaces the selection and drops history */
  h.ok('selectEntity', { entityId: 'RL-ADMIN', followLink: true });
  h.ok('selectEntity', { entityId: 'SYS-DRIVE' });
  assert.equal(h.state().web.inspectorHistory.length, 0);
});

test('navigateTo with a target the employee cannot see leaves the context unchanged and sets the restricted notice', () => {
  const h = createHarness();
  h.ok('selectAccessProfile', { profileId: 'U-EMPLOYEE' });
  h.ok('enterArea', { areaId: 'A-AF' });
  const before = contextOf(h.state().web);
  const history = h.state().web.contextHistory.length;
  const r = h.ok('navigateTo', { target: { tab: 'web', web: { level: 'tactical', areaId: 'A-MKT' } } });
  assert.equal(r.applied, false);
  assert.equal(r.restricted, true);
  assert.equal(r.messageId, 'MSG-02');
  const w = h.state().web;
  assert.deepEqual(contextOf(w), before);
  assert.equal(w.contextHistory.length, history, 'no context snapshot pushed');
  assert.equal(w.notice.kind, 'restricted');
  assert.equal(w.notice.messageId, 'MSG-02');
  assert.equal(w.notice.text, h.pack.messages['MSG-02'].text);
  assert.equal(typeof w.notice.action, 'string');
  assert.equal(w.notice.command.type, 'backToOrganization');
  assert.equal(h.state().app.activeTab, 'web');
  /* also for versions and processes */
  const v = h.ok('navigateTo', { target: { tab: 'web', web: { level: 'operational', processId: 'PR-BOLETAS', processView: 'flow', versionId: 'V-TOBE-02' } } });
  assert.equal(v.restricted, true);
  assert.deepEqual(contextOf(h.state().web), before);
  const p = h.ok('navigateTo', { target: { tab: 'web', web: { level: 'operational', processId: 'PR-01' } } });
  assert.equal(p.restricted, true);
  /* the notice action restores a permitted view */
  h.ok(w.notice.command.type, w.notice.command.payload);
  assert.equal(h.state().web.notice, null);
  assert.equal(h.state().web.level, 'strategic');
  /* unknown ids → invalid-target with MSG-12 */
  const bad = h.fail('navigateTo', { target: { tab: 'web', web: { areaId: 'A-NOPE' } } });
  assert.equal(bad.code, 'invalid-target');
  assert.equal(bad.messageId, 'MSG-12');
});

test('navigateTo applies a visible target, pushes context, selects the tab and sets focusReturn', () => {
  const h = createHarness();
  const r = h.ok('navigateTo', { target: { tab: 'web', web: { level: 'operational', processId: 'PR-BOLETAS', processView: 'flow', versionId: 'V-TOBE-02', activityKey: 'T-02', selectEntityId: 'SYS-DRIVE' } } });
  assert.equal(r.applied, true);
  assert.equal(r.tab, 'web');
  const s = h.state();
  assert.equal(s.app.activeTab, 'web');
  assert.deepEqual(s.app.focusReturn, { focusKey: 'tabpanel-heading:web' });
  assert.equal(s.web.processId, 'PR-BOLETAS');
  assert.equal(s.web.versionId, 'V-TOBE-02');
  assert.equal(s.web.activityKey, 'T-02');
  assert.equal(s.web.areaId, 'A-AF', 'area derived from the process owner');
  assert.equal(s.web.selection.entityId, 'SYS-DRIVE');
  assert.equal(s.web.contextHistory.length, 1);
  const d = h.ok('navigateTo', { target: { tab: 'desktop', desktop: { workspaceId: 'WS-BOLETAS', scenarioId: 'SCN-02', projectId: 'PM-01' } } });
  assert.equal(d.tab, 'desktop');
  assert.deepEqual(h.state().desktop.navigation, { scenarioId: 'SCN-02', projectId: 'PM-01' });
  const a = h.ok('navigateTo', { target: { tab: 'architecture', architecture: { nodeId: 'C-GRAPH' } } });
  assert.equal(a.tab, 'architecture');
  assert.equal(h.state().app.architectureSelection, 'C-GRAPH');
  assert.equal(h.fail('navigateTo', { target: { tab: 'nope' } }).code, 'unknown-tab');
});

test('camera: scale clamps to 0.5..2.0 in 0.1 steps, coordinates are integers, fit and reset', () => {
  const h = createHarness();
  assert.deepEqual(h.ok('setCamera', { contextKey: 'orgchart', x: 10.4, y: -3.6, scale: 9 }), { x: 10, y: -4, scale: 2 });
  assert.deepEqual(h.ok('setCamera', { contextKey: 'orgchart', x: 1, y: 2, scale: 0.01 }), { x: 1, y: 2, scale: 0.5 });
  assert.deepEqual(h.ok('setCamera', { contextKey: 'orgchart', x: 0, y: 0, scale: 1.26 }), { x: 0, y: 0, scale: 1.3 });
  assert.deepEqual(h.state().camera.orgchart, { x: 0, y: 0, scale: 1.3 });
  let z = h.ok('zoomCamera', { contextKey: 'orgchart', delta: 5 });
  assert.equal(z.scale, 2);
  z = h.ok('zoomCamera', { contextKey: 'orgchart', delta: -5 });
  assert.equal(z.scale, 0.5);
  z = h.ok('zoomCamera', { contextKey: 'orgchart', steps: 1 });
  assert.equal(z.scale, 0.6);
  const fit = h.ok('fitCamera', { contextKey: 'processmap', contentWidth: 2000, contentHeight: 1000, viewportWidth: 800, viewportHeight: 600, padding: 0 });
  assert.equal(fit.scale, 0.5, 'largest 0.1 step that fits, clamped at 0.5');
  const fitBig = h.ok('fitCamera', { contextKey: 'area:A-AF', contentWidth: 100, contentHeight: 100, viewportWidth: 800, viewportHeight: 600, padding: 0 });
  assert.equal(fitBig.scale, 2, 'never above 2.0');
  h.ok('resetCamera', { contextKey: 'orgchart' });
  assert.equal(h.state().camera.orgchart, undefined);
  assert.equal(h.fail('setCamera', { contextKey: '', x: 0, y: 0 }).code, 'invalid-camera');
  assert.equal(h.fail('setCamera', { contextKey: 'orgchart', x: 'a', y: 0 }).code, 'invalid-camera');
});

test('search state: query is kept for typing, open follows the trimmed query, clearSearch resets', () => {
  const h = createHarness();
  let r = h.ok('setSearch', { query: '  boletas ' });
  assert.equal(r.open, true);
  assert.equal(h.state().web.search.open, true);
  r = h.ok('setSearch', { query: '   ' });
  assert.equal(h.state().web.search.open, false);
  h.ok('setSearch', { query: 'x'.repeat(200) + '\u0007' });
  assert.equal(h.state().web.search.query.length, 120);
  assert.equal(h.fail('setSearchTypes', { types: ['nope'] }).code, 'invalid-type');
  h.ok('setSearchTypes', { types: ['process', 'version'] });
  h.ok('setSearchIncludeVersions', { on: true });
  h.ok('clearSearch');
  const s = h.state().web.search;
  assert.equal(s.query, '');
  assert.equal(s.open, false);
  assert.deepEqual(s.types, ['process', 'version'], 'clearSearch only clears the query');
  h.ok('clearFilters');
  assert.deepEqual(h.state().web.search, { query: '', types: [], includeVersions: false, open: false });
});

test('security module and version switching obey permissions', () => {
  const h = createHarness();
  const err = h.fail('setModule', { module: 'security' });
  assert.equal(err.code, 'forbidden');
  assert.equal(err.messageId, 'MSG-02');
  assert.equal(h.state().web.module, 'twin');
  h.ok('useAnalystProfile');
  h.ok('setSecurityView', { view: 'audit' });
  assert.equal(h.state().web.module, 'security');
  assert.equal(h.state().web.security.view, 'audit');
  h.ok('selectAccessProfile', { profileId: 'U-MANAGER' });
  assert.equal(h.state().web.module, 'twin', 'profile switch leaves the security module');
  h.ok('selectAccessProfile', { profileId: 'U-EMPLOYEE' });
  h.ok('enterProcess', { processId: 'PR-BOLETAS' });
  const v = h.fail('setVersion', { versionId: 'V-TOBE-02' });
  assert.equal(v.code, 'forbidden');
  assert.equal(v.messageId, 'MSG-02');
  assert.equal(h.state().web.versionId, 'V-ASIS-01');
});
