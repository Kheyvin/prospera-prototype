'use strict';
/* Shared harness for contract and interaction tests: loads the runtime (tolerating UI files
 * that are still being written), resolves the Próspera pack and creates a store with a
 * manual scheduler so timed tool results are delivered only when the test says so.
 * See CONTRACTS.md §1, docs/store.md §4 and docs/desktop-engine.md §2. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadRuntime, ROOT } = require('./load.js');

const SPEC_PATH = path.resolve(ROOT, '..', 'prototype-prospera', 'spec.md');

/* Manual scheduler: timers are queued and fired by the test (`flush`, `runNext`). */
function createManualScheduler() {
  const queue = [];
  const scheduler = {
    set(fn, ms) {
      const handle = { fn, ms, fired: false };
      queue.push(handle);
      return handle;
    },
    clear(handle) {
      const index = queue.indexOf(handle);
      if (index !== -1) queue.splice(index, 1);
    },
    pending() { return queue.length; },
    runNext() {
      const handle = queue.shift();
      if (!handle) return false;
      handle.fired = true;
      handle.fn();
      return true;
    },
    flush() {
      let count = 0;
      while (scheduler.runNext()) count += 1;
      return count;
    },
    queue
  };
  return scheduler;
}

function createHarness(options = {}) {
  const P = loadRuntime({ allowMissing: true });
  const pack = P.loadPack();
  const scheduler = options.scheduler || createManualScheduler();
  const storeCore = P.require('core/store');
  const store = storeCore.createStore({ pack, scheduler, strict: true, reducedMotion: false });

  /* dispatch that asserts success and returns the result */
  function ok(type, payload) {
    const r = store.dispatch(type, payload);
    assert.equal(r.ok, true, `dispatch ${type} failed: ${JSON.stringify(r.error)}`);
    return r.result;
  }

  /* dispatch that asserts failure and returns the error */
  function fail(type, payload) {
    const r = store.dispatch(type, payload);
    assert.equal(r.ok, false, `dispatch ${type} unexpectedly succeeded: ${JSON.stringify(r.result)}`);
    return r.error;
  }

  function state() { return store.getState(); }

  function session(id = 'SES-BOLETAS') { return store.getState().desktop.sessions[id]; }

  function logicalIds(id = 'SES-BOLETAS') { return session(id).events.map((e) => e.logicalId); }

  function snapshot() { return JSON.stringify(store.getState()); }

  return { P, pack, raw: pack.raw, store, scheduler, ok, fail, state, session, logicalIds, snapshot, graph: store.graph, permissions: store.permissions };
}

function readSpec() {
  return fs.readFileSync(SPEC_PATH, 'utf8');
}

module.exports = { createHarness, createManualScheduler, readSpec, SPEC_PATH, ROOT };
