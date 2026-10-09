'use strict';
/* Contract tests for core/store (CONTRACTS §5.6; docs/store.md §1-§4, §6). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../helpers/harness.js');

test('dispatching an unknown command returns ok:false with code unknown-command', () => {
  const h = createHarness();
  const r = h.store.dispatch('doesNotExist', {});
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'unknown-command');
  assert.equal(h.store.hasCommand('doesNotExist'), false);
  assert.ok(h.store.commandNames().length > 50);
});

test('a failing command leaves the committed state deep-equal and notifies nobody', () => {
  const h = createHarness();
  h.ok('useAnalystProfile');
  const before = h.snapshot();
  let notified = 0;
  const unsubscribe = h.store.subscribe(() => { notified += 1; });
  const err = h.fail('createIncident', { subject: 'x', description: 'short', responsibleId: 'RL-ADMIN', dueDate: 'bad' });
  assert.equal(err.code, 'validation');
  assert.equal(h.snapshot(), before, 'no partial mutation');
  assert.equal(notified, 0);
  unsubscribe();
  /* a non-CommandError exception inside a command is also rolled back (non-strict store) */
  const { createStore } = h.P.require('core/store');
  const loose = createStore({ pack: h.pack, scheduler: h.scheduler });
  loose.registerSelector('noop', () => true);
  const cmds = h.P.require('core/commands').commands;
  const originalSetDepth = cmds.setDepth;
  const beforeLoose = JSON.stringify(loose.getState());
  const originalError = console.error;
  console.error = () => {};
  try {
    const r = loose.dispatch('setDepth', { depth: 'areas' });
    assert.equal(r.ok, true);
    assert.equal(loose.getState().web.depth, 'areas');
  } finally {
    console.error = originalError;
    cmds.setDepth = originalSetDepth;
  }
  assert.notEqual(JSON.stringify(loose.getState()), beforeLoose);
});

test('changed slices are reported per top-level key and subscribers receive them', () => {
  const h = createHarness();
  const seen = [];
  h.store.subscribe((state, info) => seen.push([info.type, info.changed.slice()]));
  let r = h.store.dispatch('enterArea', { areaId: 'A-AF' });
  assert.deepEqual(r.changed, ['web']);
  r = h.store.dispatch('setCamera', { contextKey: 'area:A-AF', x: 10, y: 20, scale: 1.2 });
  assert.deepEqual(r.changed, ['camera']);
  r = h.store.dispatch('selectTab', { tabId: 'desktop' });
  assert.deepEqual(r.changed, ['app']);
  r = h.store.dispatch('setDraft', { sessionId: 'SES-BOLETAS', text: 'hola' });
  assert.deepEqual(r.changed, ['desktop']);
  r = h.store.dispatch('setDraft', { sessionId: 'SES-BOLETAS', text: 'hola' });
  assert.deepEqual(r.changed, [], 'identical value → nothing changed');
  r = h.store.dispatch('useAnalystProfile');
  assert.ok(r.changed.includes('app'));
  r = h.store.dispatch('createDemoUser', { username: 'persona.prueba', role: 'manager', positionId: null });
  assert.ok(r.changed.includes('demo'));
  assert.deepEqual(seen.map((x) => x[0]), ['enterArea', 'setCamera', 'selectTab', 'setDraft', 'setDraft', 'useAnalystProfile', 'createDemoUser']);
  assert.deepEqual(seen[0][1], ['web']);
});

test('reset restores the initial state, bumps the generation and cancels stale timers', () => {
  const h = createHarness();
  h.ok('enterProcess', { processId: 'PR-BOLETAS', view: 'flow' });
  h.ok('useAnalystProfile');
  h.ok('setDraft', { sessionId: 'SES-BOLETAS', text: 'borrador' });
  h.ok('createDemoUser', { username: 'persona.prueba', role: 'manager', positionId: null });
  let fired = 0;
  h.store.timers.set(() => { fired += 1; }, 500, 'session:SES-BOLETAS');
  assert.equal(h.store.timers.pending(), 1);
  assert.equal(h.store.hasUnsavedWork(), true);
  const generationBefore = h.store.timers.generation();
  const r = h.ok('resetDemo', { force: true });
  assert.equal(r.reset, true);
  assert.equal(r.generation, generationBefore + 1);
  assert.equal(h.store.timers.generation(), generationBefore + 1);
  assert.equal(h.store.timers.pending(), 0, 'reset clears every timer');
  h.scheduler.flush();
  assert.equal(fired, 0, 'a stale callback never runs');
  const s = h.state();
  assert.equal(s.demo.generation, generationBefore + 1);
  const expected = h.store.createInitialState();
  expected.demo.generation = s.demo.generation;
  const actual = JSON.parse(JSON.stringify(s));
  assert.equal(actual.app.toasts.length, 1);
  assert.equal(actual.app.toasts[0].messageId, 'MSG-20');
  assert.equal(actual.app.toasts[0].text, h.pack.messages['MSG-20']);
  actual.app.toasts = [];
  assert.deepEqual(actual, expected);
  assert.equal(h.store.hasUnsavedWork(), false);
  assert.equal(h.state().demo.clock, 0);
  assert.equal(h.state().demo.counters.account, 4, 'ids are reseeded');
});

test('the logical clock advances one second per tick and per logged action', () => {
  const h = createHarness();
  assert.equal(h.store.clockStart, h.raw.demo.clockStart);
  assert.equal(h.store.now(), '2026-10-06T10:00:00-05:00');
  assert.equal(h.store.tick(), '2026-10-06T10:00:01-05:00');
  assert.equal(h.store.now(), '2026-10-06T10:00:01-05:00');
  assert.equal(h.state().demo.clock, 1);
  h.ok('useAnalystProfile');
  h.ok('createDemoUser', { username: 'persona.prueba', role: 'manager', positionId: null });
  assert.equal(h.state().demo.clock, 2);
  assert.equal(h.state().demo.log[0].at, '2026-10-06T10:00:02-05:00');
  assert.equal(h.state().demo.log[0].seq, 1);
  assert.equal(h.state().demo.log[0].profileId, 'U-ADMIN');
  assert.equal(h.store.businessDate, '2026-10-06');
});

test('getVersion returns pack versions with resolved activities and allVersions keeps pack order', () => {
  const h = createHarness();
  const asIs = h.store.getVersion('V-ASIS-01');
  assert.equal(asIs.id, 'V-ASIS-01');
  assert.equal(asIs.type, 'AS-IS');
  assert.deepEqual(Object.keys(asIs.activities), ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08']);
  assert.equal(asIs.activities['A-03'].name, 'Verificar abono y documentos');
  assert.ok(Object.isFrozen(asIs), 'pack versions are frozen');
  const toBe = h.store.getVersion('V-TOBE-02');
  assert.deepEqual(Object.keys(toBe.activities), ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08']);
  assert.equal(h.store.getVersion('V-TOBE-01').flowId, 'FLOW-TOBE1');
  assert.equal(h.store.getVersion('V-NOPE'), undefined);
  assert.equal(h.store.getVersion('V-TOBE-03'), undefined, 'demo versions do not exist until a scenario creates them');
  assert.deepEqual(h.store.allVersions('PR-BOLETAS').map((v) => v.id), ['V-ASIS-01', 'V-TOBE-01', 'V-TOBE-02']);
  assert.deepEqual(h.store.allVersions('PR-01'), []);
  assert.equal(h.store.allVersions().length, 3);
});

test('selectors are registered and select() throws on unknown names', () => {
  const h = createHarness();
  for (const name of ['currentContext', 'breadcrumbs', 'inspectorModel', 'orgChartModel', 'processMapModel', 'incidentsModel', 'projectsModel', 'securityModel', 'searchResults', 'desktopModel', 'scenarioAvailability', 'hasUnsavedWork']) {
    assert.equal(typeof h.store.selectors[name], 'function', name);
  }
  assert.throws(() => h.store.select('nope'), /unknown selector/);
  assert.equal(h.store.select('hasUnsavedWork'), false);
  const ctx = h.store.select('currentContext');
  assert.equal(ctx.level, 'strategic');
  assert.equal(ctx.representation, 'orgchart');
});

test('reentrant dispatch from inside a command is refused', () => {
  const h = createHarness();
  const cmds = h.P.require('core/commands').commands;
  cmds.__probeReentrant = (ctx) => h.store.dispatch('openAbout');
  try {
    const r = h.store.dispatch('__probeReentrant');
    assert.equal(r.ok, true);
    assert.equal(r.result.ok, false);
    assert.equal(r.result.error.code, 'reentrant-dispatch');
    assert.equal(h.state().app.aboutOpen, false);
  } finally {
    delete cmds.__probeReentrant;
  }
});
