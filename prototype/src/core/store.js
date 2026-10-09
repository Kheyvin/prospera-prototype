/* core/store — state container: initial state, dispatch with rollback, subscriptions,
 * selectors, logical clock, timers with generation ids, version lookup (CONTRACTS §5.6).
 *
 * The store is the only place where state changes. A command receives a structured clone
 * of the committed state (the draft), mutates it, and the store commits the draft only when
 * the command returns normally. A CommandError (ctx.fail) or any other exception discards
 * the draft, so no partial mutation ever reaches the committed state.
 *
 * Loads in Node without a DOM: every browser API (window.matchMedia, setTimeout) is
 * guarded and can be replaced through createStore options. */
Primus.module('core/store', function (require) {
  'use strict';

  var SLICES = ['app', 'web', 'camera', 'desktop', 'demo'];
  var DEFAULT_CLOCK_START = '2026-10-06T10:00:00-05:00';
  var DEFAULT_LAYERS = ['people', 'systems', 'documents'];
  var REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  var MAX_RESOLVE_DEPTH = 8;

  /* ---------- small utilities ---------- */

  function hasModule(id) {
    return typeof Primus !== 'undefined' && !!Primus && typeof Primus.has === 'function' && Primus.has(id);
  }

  function tryRequire(id) {
    return hasModule(id) ? require(id) : null;
  }

  function clone(value) {
    if (value === undefined || value === null) return value;
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (e) { /* non-cloneable → JSON below */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function rawOf(pack) {
    return (pack && pack.raw) || pack || {};
  }

  /* Values of a Map, an array or a plain object (insertion order preserved). */
  function values(collection) {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection.slice();
    if (typeof collection.values === 'function') return Array.from(collection.values());
    if (typeof collection === 'object') return Object.keys(collection).map(function (k) { return collection[k]; });
    return [];
  }

  function getIn(collection, id) {
    if (!collection || id === null || id === undefined) return undefined;
    if (typeof collection.get === 'function' && !Array.isArray(collection)) return collection.get(id);
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i++) if (collection[i] && collection[i].id === id) return collection[i];
      return undefined;
    }
    return collection[id];
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function warn(message, err) {
    if (typeof console !== 'undefined' && console && typeof console.error === 'function') {
      if (err !== undefined) console.error(message, err); else console.error(message);
    }
  }

  /* ---------- logical clock (spec §14.1: fixed business date, +1 s per logged action) ---------- */

  function parseClockStart(iso) {
    var formatCore = require('core/format');
    var p = formatCore.parseIso(iso) || formatCore.parseIso(DEFAULT_CLOCK_START);
    var baseMs = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour || 0), +(p.minute || 0), +(p.second || 0));
    var offset = p.offset || '-05:00';
    if (/^[+-]\d{4}$/.test(offset)) offset = offset.slice(0, 3) + ':' + offset.slice(3);
    return { baseMs: baseMs, offset: offset, startIso: iso || DEFAULT_CLOCK_START };
  }

  /* ISO string `seconds` after the clock start, keeping the pack's UTC offset (no local time zone). */
  function isoAt(base, seconds) {
    var count = typeof seconds === 'number' && isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    var d = new Date(base.baseMs + count * 1000);
    return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()) +
      'T' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds()) + base.offset;
  }

  /* ---------- timers with generation ids (CONTRACTS §3, §5.6) ---------- */

  function defaultScheduler() {
    if (typeof setTimeout !== 'function') {
      return { set: function () { return null; }, clear: function () {} };
    }
    return {
      set: function (fn, ms) { return setTimeout(fn, ms); },
      clear: function (handle) { if (handle !== null && handle !== undefined) clearTimeout(handle); }
    };
  }

  /* createTimers({ scheduler?, reducedMotion?, generation? })
   *   set(fn, ms, tag) → id      fn receives { id, tag, generation }; 0 ms under reduced motion
   *   clear(id) → boolean
   *   clearAll(tag?) → count     no tag = every pending timer
   *   generation() → number      bump() clears everything and returns the next generation
   *   pending(tag?) → count      isReducedMotion() → boolean */
  function createTimers(options) {
    var opts = options || {};
    var scheduler = opts.scheduler || defaultScheduler();
    var registry = new Map();
    var seq = 0;
    var generation = typeof opts.generation === 'number' ? opts.generation : 1;
    var reducedOverride = opts.reducedMotion;
    var mediaQuery = null;
    var mediaChecked = false;

    function isReducedMotion() {
      if (typeof reducedOverride === 'boolean') return reducedOverride;
      if (typeof reducedOverride === 'function') return !!reducedOverride();
      if (!mediaChecked) {
        mediaChecked = true;
        try {
          if (typeof window !== 'undefined' && window && typeof window.matchMedia === 'function') {
            mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
          }
        } catch (e) { mediaQuery = null; }
      }
      return !!(mediaQuery && mediaQuery.matches);
    }

    function set(fn, ms, tag) {
      if (typeof fn !== 'function') throw new Error('store.timers.set: fn must be a function');
      var id = ++seq;
      var tagValue = tag && typeof tag === 'object' ? tag.tag : tag;
      var delay = isReducedMotion() ? 0 : Math.max(0, Number(ms) || 0);
      var entry = { id: id, tag: tagValue === undefined ? null : tagValue, generation: generation, handle: null, fn: fn };
      registry.set(id, entry);
      entry.handle = scheduler.set(function () {
        if (registry.get(id) !== entry) return;          // cleared meanwhile
        registry.delete(id);
        if (entry.generation !== generation) return;     // stale after reset
        fn({ id: id, tag: entry.tag, generation: entry.generation });
      }, delay);
      return id;
    }

    function clear(id) {
      var entry = registry.get(id);
      if (!entry) return false;
      registry.delete(id);
      try { scheduler.clear(entry.handle); } catch (e) { /* ignore */ }
      return true;
    }

    function clearAll(tag) {
      var count = 0;
      Array.from(registry.keys()).forEach(function (id) {
        var entry = registry.get(id);
        if (tag !== undefined && tag !== null && entry.tag !== tag) return;
        if (clear(id)) count += 1;
      });
      return count;
    }

    function bump() {
      clearAll();
      generation += 1;
      return generation;
    }

    function pending(tag) {
      var count = 0;
      registry.forEach(function (entry) {
        if (tag === undefined || tag === null || entry.tag === tag) count += 1;
      });
      return count;
    }

    function list() {
      return Array.from(registry.values()).map(function (entry) {
        return { id: entry.id, tag: entry.tag, generation: entry.generation };
      });
    }

    return {
      set: set,
      clear: clear,
      clearAll: clearAll,
      generation: function () { return generation; },
      bump: bump,
      pending: pending,
      list: list,
      isReducedMotion: isReducedMotion
    };
  }

  /* ---------- initial state (CONTRACTS §5.6) ---------- */

  function sessionState() {
    return {
      mode: 'chat',
      draft: '',
      events: [],
      playback: { status: 'idle', scenarioId: null, runOrdinal: 0, stepIndex: 0, pendingEventIds: [], errorMode: null, failedEventId: null },
      review: null,
      expandedTools: {},
      unread: 0,
      atLatest: true,
      form: null
    };
  }

  function pickCompareVersion(versions, processId) {
    var toBe = versions.filter(function (v) {
      return v && v.type === 'TO-BE' && (!processId || v.processId === processId);
    });
    var usable = toBe.filter(function (v) { return v.state !== 'incomplete-draft'; });
    var pick = usable.length ? usable[usable.length - 1] : (toBe.length ? toBe[toBe.length - 1] : null);
    return pick ? pick.id : null;
  }

  function createInitialState(pack) {
    var raw = rawOf(pack);
    var demoCfg = raw.demo || {};
    var presentation = raw.presentation || {};
    var tabIds = (presentation.tabs || []).map(function (t) { return t.id; });
    var org = raw.organization || {};
    var views = (pack && pack.views) || org.views || {};
    var dc = views.defaultContext || {};
    var tracking = raw.tracking || {};
    var security = raw.security || {};
    var desktop = raw.desktop || {};

    var initialTab = demoCfg.initialTab && tabIds.indexOf(demoCfg.initialTab) !== -1 ? demoCfg.initialTab : (tabIds[0] || 'architecture');
    var profiles = values((pack && pack.profiles) || demoCfg.profiles);
    var profileId = demoCfg.initialProfileId || (profiles[0] && profiles[0].id) || null;
    var currentAsIs = org.currentAsIsVersionId || null;
    var defaultProcessId = views.defaultProcessId || null;
    var packVersions = values((pack && pack.versions) || org.versions);
    var compareVersionId = pickCompareVersion(packVersions, defaultProcessId);

    var layerIds = views.layers && views.layers.length ? views.layers.map(function (l) { return l.id; }) : DEFAULT_LAYERS;
    var layers = {};
    layerIds.forEach(function (id) { layers[id] = true; });

    var variantDefault = 'separacion';
    var flows = values((pack && pack.flows) || org.flows);
    var asIsVersion = currentAsIs ? getIn((pack && pack.versions) || org.versions, currentAsIs) : null;
    var asIsFlow = asIsVersion ? getIn((pack && pack.flows) || org.flows, asIsVersion.flowId) : null;
    if (asIsFlow && asIsFlow.defaultVariant) variantDefault = asIsFlow.defaultVariant;
    else if (flows[0] && flows[0].defaultVariant) variantDefault = flows[0].defaultVariant;

    var incidents = clone(tracking.incidents || []);
    var projects = clone(tracking.projects || []);
    var accounts = clone(security.accounts || []);

    var sessions = {};
    values((pack && pack.sessions) || desktop.sessions).forEach(function (s) {
      if (s && s.id) sessions[s.id] = sessionState();
    });
    var workspaces = values((pack && pack.workspaces) || desktop.workspaces);
    var workspaceId = demoCfg.initialWorkspaceId || (workspaces[0] && workspaces[0].id) || null;

    return {
      app: {
        activeTab: initialTab,
        profileId: profileId,
        aboutOpen: false,
        modal: null,
        toasts: [],
        notices: [],
        focusReturn: null,
        architectureSelection: null,
        architectureListMode: false,
        scopeFilter: 'all',
        scopeSelection: null,
        methodSelection: null,
        scroll: {}
      },
      web: {
        module: 'twin',
        level: dc.level || 'strategic',
        representation: dc.representation || 'orgchart',
        depth: dc.depth || 'positions',
        areaId: null,
        processId: null,
        processView: 'sheet',
        versionId: currentAsIs,
        compareVersionId: compareVersionId,
        paymentVariant: variantDefault,
        activityKey: null,
        relationsRootId: null,
        selection: null,
        inspectorHistory: [],
        highlightRootId: null,
        expanded: {},
        layers: layers,
        search: { query: '', types: [], includeVersions: false, open: false },
        areaFilter: null,
        listMode: false,
        contextHistory: [],
        overlay: null,
        notice: null,
        newVersionNotice: null,
        security: { view: 'accounts', selectionId: null, form: null },
        incidents: { filter: 'all', query: '', sort: null, form: null, selectionId: null },
        projects: { selectionId: projects[0] ? projects[0].id : null, form: null },
        tableSort: {}
      },
      camera: {},
      desktop: {
        workspaceId: workspaceId,
        evidenceOpenId: null,
        navigation: null,
        sessions: sessions
      },
      demo: {
        clock: 0,
        versions: {},
        currentAsIsVersionId: currentAsIs,
        staging: {},
        incidents: incidents,
        projects: projects,
        accounts: accounts,
        log: [],
        counters: { incident: incidents.length + 1, project: projects.length + 1, account: accounts.length + 1 },
        applied: {},
        requestIds: {},
        runOrdinals: {},
        generation: 1
      }
    };
  }

  /* ---------- errors ---------- */

  function FallbackCommandError(code, message, extra) {
    this.name = 'CommandError';
    this.isCommandError = true;
    this.code = code || 'error';
    this.message = message || code || 'Command failed';
    if (extra && typeof extra === 'object') {
      var self = this;
      Object.keys(extra).forEach(function (key) { if (extra[key] !== undefined) self[key] = extra[key]; });
    }
  }
  FallbackCommandError.prototype = Object.create(Error.prototype);
  FallbackCommandError.prototype.constructor = FallbackCommandError;

  function isCommandError(err) {
    return !!err && (err.isCommandError === true || err.name === 'CommandError');
  }

  var ERROR_SKIP_KEYS = { name: true, message: true, stack: true, isCommandError: true, code: true };

  /* { code, message, field?, messageId?, action?, cta?, formId?, ... } from a thrown error. */
  function serializeError(err) {
    if (isCommandError(err)) {
      var out = { code: err.code || 'error', message: err.message || err.code || 'Command failed' };
      Object.keys(err).forEach(function (key) {
        if (ERROR_SKIP_KEYS[key] || out[key] !== undefined) return;
        var value = err[key];
        if (typeof value === 'function') return;
        out[key] = value;
      });
      return out;
    }
    return { code: 'internal-error', message: (err && err.message) || String(err) };
  }

  /* ---------- store ---------- */

  function createStore(options) {
    var opts = options || {};
    var pack = opts.pack;
    if (!pack || typeof pack !== 'object') throw new Error('createStore: a resolved pack is required');
    if (!pack.raw || !pack.entities) {
      var packCore = tryRequire('core/pack');
      if (packCore && typeof packCore.resolvePack === 'function') pack = packCore.resolvePack(pack);
    }
    var raw = rawOf(pack);
    var demoCfg = raw.demo || {};
    var org = raw.organization || {};

    var formatCore = require('core/format');
    var format = formatCore.createFormat(pack);
    var graphCore = tryRequire('core/graph');
    var graph = graphCore && typeof graphCore.createGraph === 'function' ? graphCore.createGraph(pack) : null;
    var permissionsCore = tryRequire('core/permissions');
    var permissions = permissionsCore && typeof permissionsCore.createPermissions === 'function' ? permissionsCore.createPermissions(pack) : null;

    var commandsCore = null;
    var CommandError = FallbackCommandError;
    var strict = !!opts.strict;

    var timers = opts.timers || createTimers({ scheduler: opts.scheduler, reducedMotion: opts.reducedMotion, generation: opts.generation });
    var clockBase = parseClockStart(demoCfg.clockStart);

    var state = createInitialState(pack);
    state.demo.generation = timers.generation();
    var sliceJson = snapshotSlices(state);
    var baseline = {
      incidents: JSON.stringify(state.demo.incidents),
      projects: JSON.stringify(state.demo.projects),
      accounts: JSON.stringify(state.demo.accounts),
      currentAsIsVersionId: state.demo.currentAsIsVersionId
    };

    var listeners = [];
    var dispatching = false;
    var draftRef = null;              // { state } while a command runs
    var createdTimerIds = null;       // timers scheduled by the running command (cleared on rollback)
    var uidSeq = 0;
    var packVersionCache = new Map();
    var selectorMap = {};
    var store = {};

    function snapshotSlices(s) {
      var out = {};
      SLICES.forEach(function (key) { out[key] = JSON.stringify(s[key]); });
      return out;
    }

    function activeState() {
      return draftRef ? draftRef.state : state;
    }

    function commandRegistry() {
      if (!commandsCore) {
        commandsCore = tryRequire('core/commands');
        if (commandsCore && typeof commandsCore.CommandError === 'function') CommandError = commandsCore.CommandError;
      }
      return commandsCore;
    }

    /* --- timers facade: records ids scheduled inside a command so a rollback can cancel them --- */

    var timersApi = {};
    Object.keys(timers).forEach(function (key) { timersApi[key] = timers[key]; });
    timersApi.set = function (fn, ms, tag) {
      var id = timers.set(fn, ms, tag);
      if (createdTimerIds) createdTimerIds.push(id);
      return id;
    };

    /* --- clock --- */

    function now(s) {
      var target = s || activeState();
      return isoAt(clockBase, target && target.demo ? target.demo.clock : 0);
    }

    function tick(s) {
      var target = s || activeState();
      target.demo.clock = (typeof target.demo.clock === 'number' && isFinite(target.demo.clock) ? target.demo.clock : 0) + 1;
      if (target === state && !draftRef) sliceJson.demo = JSON.stringify(state.demo);
      return isoAt(clockBase, target.demo.clock);
    }

    function appendLog(s, action, result) {
      var entry = {
        seq: s.demo.log.length + 1,
        at: tick(s),
        profileId: s.app.profileId,
        action: action === null || action === undefined ? '' : String(action),
        result: result === undefined ? null : (typeof result === 'object' && result !== null ? clone(result) : result)
      };
      s.demo.log.push(entry);
      return entry;
    }

    /* --- versions --- */

    function packVersionOf(versionId) {
      return getIn(pack.versions || org.versions, versionId);
    }

    function baseActivitiesOf(versionId) {
      if (typeof pack.baseActivities === 'function') return pack.baseActivities(versionId) || {};
      var out = {};
      values(pack.entities || org.entities).forEach(function (entity) {
        if (!entity || entity.type !== 'activity') return;
        var attrs = entity.attributes || {};
        if (attrs.versionId !== versionId) return;
        out[attrs.key || entity.id] = entity;
      });
      return out;
    }

    function mergeActivity(base, override) {
      if (!override || typeof override !== 'object') return base;
      var merged = Object.assign({}, base, override);
      if (base && base.attributes && override.attributes) {
        merged.attributes = Object.assign({}, base.attributes, override.attributes);
      }
      return merged;
    }

    function applyOverrides(activities, overrides) {
      if (!overrides || typeof overrides !== 'object') return activities;
      Object.keys(overrides).forEach(function (key) {
        activities[key] = activities[key] ? mergeActivity(activities[key], overrides[key]) : clone(overrides[key]);
      });
      return activities;
    }

    /* Pack versions: own activity entities + activityOverrides; cached (pack is immutable). */
    function resolvedPackVersion(version) {
      var cached = packVersionCache.get(version.id);
      if (cached) return cached;
      var own = baseActivitiesOf(version.id);
      var activities = {};
      Object.keys(own).forEach(function (key) { activities[key] = own[key]; });
      applyOverrides(activities, version.activityOverrides);
      var resolved = Object.assign({}, version, { activities: Object.freeze(activities) });
      Object.freeze(resolved);
      packVersionCache.set(version.id, resolved);
      return resolved;
    }

    /* Demo versions: their own snapshot, or (when absent) the base version's activities + overrides. */
    function resolvedDemoVersion(version, s, depth) {
      if (version.activities && typeof version.activities === 'object') return version;
      var activities = {};
      if (version.baseVersionId && version.baseVersionId !== version.id && depth < MAX_RESOLVE_DEPTH) {
        var base = getVersionAt(version.baseVersionId, s, depth + 1);
        if (base && base.activities) activities = clone(base.activities);
      } else {
        var own = baseActivitiesOf(version.id);
        Object.keys(own).forEach(function (key) { activities[key] = own[key]; });
      }
      applyOverrides(activities, version.activityOverrides);
      return Object.assign({}, version, { activities: activities });
    }

    function getVersionAt(versionId, s, depth) {
      if (!versionId) return undefined;
      var target = s || activeState();
      var demoVersion = target && target.demo && target.demo.versions ? target.demo.versions[versionId] : undefined;
      if (demoVersion) return resolvedDemoVersion(demoVersion, target, depth || 0);
      var packVersion = packVersionOf(versionId);
      return packVersion ? resolvedPackVersion(packVersion) : undefined;
    }

    function getVersion(versionId, s) {
      return getVersionAt(versionId, s, 0);
    }

    function demoVersionsOrdered(s) {
      var map = (s && s.demo && s.demo.versions) || {};
      var list = Object.keys(map).map(function (key, index) { return { v: map[key], index: index }; }).filter(function (x) { return !!x.v; });
      list.sort(function (a, b) {
        var sa = typeof a.v.createdSeq === 'number' ? a.v.createdSeq : null;
        var sb = typeof b.v.createdSeq === 'number' ? b.v.createdSeq : null;
        if (sa !== null && sb !== null && sa !== sb) return sa - sb;
        return a.index - b.index;
      });
      return list.map(function (x) { return x.v; });
    }

    function allVersions(processId, s) {
      var target = s || activeState();
      var fromPack = values(pack.versions || org.versions).filter(function (v) {
        return v && (!processId || v.processId === processId);
      }).map(resolvedPackVersion);
      var fromDemo = demoVersionsOrdered(target).filter(function (v) {
        return !processId || v.processId === processId;
      }).map(function (v) { return resolvedDemoVersion(v, target, 0); });
      return fromPack.concat(fromDemo);
    }

    /* --- unsaved work (spec §14.3: changes, drafts, staging, test versions) --- */

    function hasUnsavedWork(s) {
      var target = s || activeState();
      if (!target) return false;
      var demo = target.demo || {};
      var web = target.web || {};
      var desktop = target.desktop || {};
      if (Object.keys(demo.versions || {}).length) return true;
      if (Object.keys(demo.staging || {}).length) return true;
      if ((demo.log || []).length) return true;
      if (Object.keys(demo.applied || {}).length) return true;
      if (demo.currentAsIsVersionId !== baseline.currentAsIsVersionId) return true;
      if (JSON.stringify(demo.incidents) !== baseline.incidents) return true;
      if (JSON.stringify(demo.projects) !== baseline.projects) return true;
      if (JSON.stringify(demo.accounts) !== baseline.accounts) return true;
      var forms = [web.incidents && web.incidents.form, web.projects && web.projects.form, web.security && web.security.form];
      if (forms.some(function (f) { return f && f.dirty; })) return true;
      var sessions = desktop.sessions || {};
      return Object.keys(sessions).some(function (id) {
        var session = sessions[id];
        if (!session) return false;
        if (typeof session.draft === 'string' && session.draft.trim()) return true;
        if (session.events && session.events.length) return true;
        if (session.review) return true;
        if (session.form) return true;
        return !!(session.playback && session.playback.status && session.playback.status !== 'idle');
      });
    }

    /* --- command context --- */

    function buildContext(draft) {
      var ctx = {
        state: draft,
        pack: pack,
        graph: graph,
        permissions: permissions,
        format: format,
        versions: store.versions,
        scenarios: store.scenarios,
        store: store,
        timers: timersApi,
        log: function (action, result) { return appendLog(ctx.state, action, result); },
        fail: function (code, message, extra) { throw new CommandError(code, message, extra); },
        uid: function (prefix) { return (prefix || 'id') + '-' + (++uidSeq); },
        now: function () { return now(ctx.state); },
        tick: function () { return tick(ctx.state); },
        replaceState: function (next) {
          if (!next || typeof next !== 'object' || SLICES.some(function (key) { return !next[key] || typeof next[key] !== 'object'; })) {
            throw new CommandError('invalid-state', 'El estado de reemplazo no tiene la forma esperada');
          }
          ctx.state = next;
          draftRef.state = next;
          return next;
        }
      };
      return ctx;
    }

    function failure(error) {
      return { ok: false, error: error };
    }

    /* --- dispatch --- */

    function dispatch(type, payload) {
      if (typeof type !== 'string' || !type) return failure({ code: 'unknown-command', message: 'Comando desconocido' });
      var registry = commandRegistry();
      var command = registry && registry.commands ? registry.commands[type] : null;
      if (typeof command !== 'function') return failure({ code: 'unknown-command', message: 'Comando desconocido: ' + type });
      if (dispatching) return failure({ code: 'reentrant-dispatch', message: 'No se puede ejecutar «' + type + '» dentro de otro comando' });

      dispatching = true;
      var draft = clone(state);
      draftRef = { state: draft };
      createdTimerIds = [];
      var ctx = buildContext(draft);
      var result;
      var thrown = null;
      try {
        result = command(ctx, payload === undefined || payload === null ? {} : payload);
      } catch (err) {
        thrown = err;
      } finally {
        dispatching = false;
      }

      var scheduled = createdTimerIds;
      createdTimerIds = null;

      if (thrown) {
        scheduled.forEach(function (id) { timers.clear(id); });
        draftRef = null;
        if (!isCommandError(thrown)) {
          warn('core/store: command «' + type + '» threw', thrown);
          if (strict) throw thrown;
        }
        return failure(serializeError(thrown));
      }

      var next = draftRef.state;
      draftRef = null;
      var nextJson = snapshotSlices(next);
      var changed = SLICES.filter(function (key) { return nextJson[key] !== sliceJson[key]; });
      state = next;
      sliceJson = nextJson;
      var info = { type: type, payload: payload === undefined ? null : payload, changed: changed, result: result };
      notify(info);
      return { ok: true, result: result, changed: changed };
    }

    function notify(info) {
      var current = listeners.slice();
      for (var i = 0; i < current.length; i++) {
        try {
          current[i](state, info);
        } catch (err) {
          warn('core/store: subscriber failed after «' + info.type + '»', err);
          if (strict) throw err;
        }
      }
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') throw new Error('store.subscribe: listener must be a function');
      listeners.push(listener);
      var active = true;
      return function unsubscribe() {
        if (!active) return;
        active = false;
        var index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    }

    /* --- selectors (CONTRACTS §5.7) --- */

    function selectorContext(s) {
      return { state: s, pack: pack, graph: graph, permissions: permissions, format: format, store: store, versions: store.versions, scenarios: store.scenarios };
    }

    function select(name) {
      var fn = selectorMap[name];
      if (typeof fn !== 'function') throw new Error('store.select: unknown selector «' + name + '»');
      var args = Array.prototype.slice.call(arguments, 1);
      return fn.apply(null, [selectorContext(activeState())].concat(args));
    }

    function selectWith(s, name) {
      var fn = selectorMap[name];
      if (typeof fn !== 'function') throw new Error('store.select: unknown selector «' + name + '»');
      var args = Array.prototype.slice.call(arguments, 2);
      return fn.apply(null, [selectorContext(s || activeState())].concat(args));
    }

    function registerSelector(name, fn) {
      if (typeof name !== 'string' || !name || typeof fn !== 'function') throw new Error('store.registerSelector: name and fn are required');
      selectorMap[name] = fn;
      return store;
    }

    function hasCommand(type) {
      var registry = commandRegistry();
      return !!(registry && registry.commands && typeof registry.commands[type] === 'function');
    }

    function commandNames() {
      var registry = commandRegistry();
      return registry && registry.commands ? Object.keys(registry.commands) : [];
    }

    function destroy() {
      timers.clearAll();
      listeners = [];
    }

    /* --- assemble --- */

    store.pack = pack;
    store.graph = graph;
    store.permissions = permissions;
    store.format = format;
    store.timers = timersApi;
    store.versions = null;
    store.scenarios = null;
    store.businessDate = demoCfg.businessDate || null;
    store.clockStart = clockBase.startIso;
    store.getState = function () { return state; };
    store.dispatch = dispatch;
    store.subscribe = subscribe;
    store.select = select;
    store.selectWith = selectWith;
    store.registerSelector = registerSelector;
    store.selectors = selectorMap;
    store.now = function () { return now(); };
    store.tick = function () { return tick(); };
    store.getVersion = getVersion;
    store.allVersions = allVersions;
    store.reset = function () { return dispatch('resetDemo', { force: true }); };
    store.createInitialState = function () { return createInitialState(pack); };
    store.hasUnsavedWork = hasUnsavedWork;
    store.hasCommand = hasCommand;
    store.commandNames = commandNames;
    store.isDispatching = function () { return dispatching; };
    store.clone = clone;
    store.snapshot = function () { return clone(state); };
    store.destroy = destroy;

    var versionsCore = tryRequire('core/versions');
    if (versionsCore && typeof versionsCore.createVersions === 'function') store.versions = versionsCore.createVersions(store);
    var scenariosCore = tryRequire('core/scenarios');
    if (scenariosCore && typeof scenariosCore.createScenarioEngine === 'function') store.scenarios = scenariosCore.createScenarioEngine(store);

    var selectorsCore = tryRequire('core/selectors');
    if (selectorsCore && selectorsCore.selectors && typeof selectorsCore.selectors === 'object') {
      Object.keys(selectorsCore.selectors).forEach(function (name) {
        if (typeof selectorsCore.selectors[name] === 'function') selectorMap[name] = selectorsCore.selectors[name];
      });
    }
    if (typeof selectorMap.hasUnsavedWork !== 'function') {
      selectorMap.hasUnsavedWork = function (ctx) { return hasUnsavedWork(ctx.state); };
    }

    commandRegistry();
    return store;
  }

  return {
    createStore: createStore,
    createInitialState: createInitialState,
    createTimers: createTimers,
    sessionState: sessionState,
    isoAt: isoAt,
    parseClockStart: parseClockStart,
    serializeError: serializeError,
    isCommandError: isCommandError,
    clone: clone,
    SLICES: SLICES.slice()
  };
});
