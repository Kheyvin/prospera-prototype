/* core/commands/web — twin navigation, selection, inspector history, camera, search,
 * filters, expansion, overlays, tables and forms (CONTRACTS §6 "Web", §7).
 *
 * Every command receives ctx = { state (mutable draft), pack, graph, permissions, format,
 * versions, scenarios, store, log, fail } and mutates ctx.state directly. Validation
 * failures go through ctx.fail(code, message, extra) which throws a CommandError; the
 * store discards the draft, so no partial mutation ever reaches the committed state.
 *
 * The `helpers` export is shared with core/commands/app (navigateTo, profile switching). */
Primus.module('core/commands/web', function (require) {
  'use strict';

  var MODULES = ['twin', 'security'];
  var DEFAULT_LEVELS = ['strategic', 'tactical', 'operational'];
  var DEFAULT_REPRESENTATIONS = ['orgchart', 'processmap', 'relations'];
  var DEFAULT_DEPTHS = ['areas', 'positions', 'people'];
  var DEFAULT_PROCESS_VIEWS = ['sheet', 'flow', 'compare', 'incidents', 'projects'];
  var OVERLAY_KINDS = ['history', 'document', 'policy', 'sources', 'version', 'connections'];
  var SECURITY_VIEWS = ['accounts', 'audit'];
  var SELECTION_KINDS = ['entity', 'flowNode'];
  var SORT_DIRECTIONS = ['asc', 'desc'];
  var FORM_SLICES = { incident: 'incidents', project: 'projects', account: 'security' };
  var FORM_MODES = ['create', 'edit', 'close'];
  var SCALE_MIN = 0.5;
  var SCALE_MAX = 2.0;
  var SCALE_STEP = 0.1;
  var CONTEXT_HISTORY_LIMIT = 50;
  var INSPECTOR_HISTORY_LIMIT = 50;
  var QUERY_MAX_LENGTH = 120;

  /* ---------- pack access (tolerant to resolved packs with Maps and to raw objects) ---------- */

  var entityIndexCache = typeof WeakMap === 'function' ? new WeakMap() : null;

  function raw(pack) { return (pack && pack.raw) || pack || {}; }

  function mapGet(collection, id) {
    if (!collection || id === null || id === undefined) return undefined;
    if (typeof collection.get === 'function') return collection.get(id);
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i++) if (collection[i] && collection[i].id === id) return collection[i];
      return undefined;
    }
    return collection[id];
  }

  function mapValues(collection) {
    if (!collection) return [];
    if (typeof collection.values === 'function' && !Array.isArray(collection)) return Array.from(collection.values());
    if (Array.isArray(collection)) return collection.slice();
    return Object.keys(collection).map(function (k) { return collection[k]; });
  }

  function entityOf(pack, id) {
    if (!pack || id === null || id === undefined) return undefined;
    if (pack.entities && typeof pack.entities.get === 'function') return pack.entities.get(id);
    var r = raw(pack);
    var list = (r.organization && r.organization.entities) || [];
    if (entityIndexCache) {
      var index = entityIndexCache.get(pack);
      if (!index) {
        index = {};
        list.forEach(function (e) { if (e && e.id) index[e.id] = e; });
        entityIndexCache.set(pack, index);
      }
      return index[id];
    }
    return mapGet(list, id);
  }

  function allEntities(pack) {
    if (pack && pack.entities && typeof pack.entities.values === 'function') return Array.from(pack.entities.values());
    var r = raw(pack);
    return (r.organization && r.organization.entities) || [];
  }

  function viewsOf(pack) {
    if (pack && pack.views) return pack.views;
    var r = raw(pack);
    return (r.organization && r.organization.views) || {};
  }

  function uiOf(pack) {
    if (pack && pack.ui) return pack.ui;
    var r = raw(pack);
    return (r.presentation && r.presentation.ui) || {};
  }

  function uiText(pack, key, fallback) {
    var value = uiOf(pack)[key];
    if (value === null || value === undefined) return fallback === undefined ? key : fallback;
    return value;
  }

  function trackingOf(pack) { return raw(pack).tracking || {}; }

  function flowOf(pack, flowId) {
    if (!flowId) return undefined;
    if (pack && pack.flows && typeof pack.flows.get === 'function') return pack.flows.get(flowId);
    var r = raw(pack);
    return r.organization && r.organization.flows ? r.organization.flows[flowId] : undefined;
  }

  function levels(pack) { return viewsOf(pack).levels || DEFAULT_LEVELS; }
  function representations(pack) { return viewsOf(pack).representations || DEFAULT_REPRESENTATIONS; }
  function depths(pack) { return viewsOf(pack).depths || DEFAULT_DEPTHS; }
  function processViews(pack) { return viewsOf(pack).processViews || DEFAULT_PROCESS_VIEWS; }
  function layerIds(pack) { return (viewsOf(pack).layers || []).map(function (l) { return l.id; }); }
  function defaultProcessId(pack) { return viewsOf(pack).defaultProcessId || null; }

  function defaultContext(pack) {
    var dc = viewsOf(pack).defaultContext || {};
    return {
      level: dc.level || 'strategic',
      representation: dc.representation || 'orgchart',
      depth: dc.depth || 'positions',
      rootId: dc.rootId || null
    };
  }

  /* ---------- camera keys and context snapshots (CONTRACTS §7.1, §7.3) ---------- */

  function cameraKey(web) {
    if (!web) return null;
    if (web.module === 'security') return null;
    if (web.level === 'strategic') {
      if (web.representation === 'relations') return 'relations:' + (web.relationsRootId || '');
      return web.representation === 'processmap' ? 'processmap' : 'orgchart';
    }
    if (web.level === 'tactical') return web.areaId ? 'area:' + web.areaId : null;
    if (web.level === 'operational') {
      if (web.processView === 'flow' && web.versionId) return 'flow:' + web.versionId + ':' + (web.paymentVariant || '');
      return null;
    }
    return null;
  }

  function snapshot(web) {
    return {
      module: web.module,
      level: web.level,
      representation: web.representation,
      areaId: web.areaId,
      processId: web.processId,
      processView: web.processView,
      versionId: web.versionId,
      paymentVariant: web.paymentVariant,
      activityKey: web.activityKey,
      depth: web.depth,
      expanded: Object.assign({}, web.expanded || {}),
      listMode: !!web.listMode,
      highlightRootId: web.highlightRootId,
      relationsRootId: web.relationsRootId,
      areaFilter: web.areaFilter,
      cameraKey: cameraKey(web)
    };
  }

  function pushContext(web) {
    web.contextHistory.push(snapshot(web));
    if (web.contextHistory.length > CONTEXT_HISTORY_LIMIT) web.contextHistory.shift();
  }

  function restoreContext(web, snap) {
    web.module = snap.module || 'twin';
    web.level = snap.level;
    web.representation = snap.representation;
    web.areaId = snap.areaId;
    web.processId = snap.processId;
    web.processView = snap.processView;
    web.versionId = snap.versionId;
    web.paymentVariant = snap.paymentVariant;
    web.activityKey = snap.activityKey;
    web.depth = snap.depth;
    web.expanded = Object.assign({}, snap.expanded || {});
    web.listMode = !!snap.listMode;
    web.highlightRootId = snap.highlightRootId === undefined ? null : snap.highlightRootId;
    web.relationsRootId = snap.relationsRootId === undefined ? null : snap.relationsRootId;
    web.areaFilter = snap.areaFilter === undefined ? null : snap.areaFilter;
  }

  function sameContext(a, b) {
    return a.module === b.module && a.level === b.level && a.representation === b.representation &&
      a.areaId === b.areaId && a.processId === b.processId && a.processView === b.processView &&
      a.versionId === b.versionId && a.activityKey === b.activityKey;
  }

  function closeInspector(web) {
    web.selection = null;
    web.inspectorHistory = [];
  }

  function clearHistoricalNotice(web) {
    if (web.notice && web.notice.kind === 'historical') web.notice = null;
  }

  function applyHistoricalNotice(ctx, web) {
    var version = web.versionId ? versionOf(ctx, web.versionId) : null;
    if (version && version.type === 'AS-IS' && web.versionId !== ctx.state.demo.currentAsIsVersionId) {
      web.notice = { kind: 'historical', tone: 'info', text: uiText(ctx.pack, 'historicalReadOnly', 'Versión histórica · solo lectura') };
    } else {
      clearHistoricalNotice(web);
    }
  }

  /* ---------- permissions ---------- */

  function failPermission(ctx, check, code) {
    var cta = check && check.cta ? check.cta : null;
    ctx.fail(code || 'forbidden', (check && check.text) || 'Acción no permitida para este perfil', {
      messageId: check && check.messageId,
      action: check && check.action,
      cta: cta
    });
  }

  var READ_ACTIONS = ['viewAll', 'viewEntity', 'viewVersion', 'viewSecurity', 'viewAudit', 'viewDraftsToBe'];

  /* Wraps permissions.can; a denial always carries messageId (MSG-02 read / MSG-03 write), text and action. */
  function can(ctx, action, extra) {
    if (!ctx.permissions || typeof ctx.permissions.can !== 'function') return { ok: true };
    var result = ctx.permissions.can(ctx.state, action, extra || {});
    if (!result) return { ok: true };
    if (result.ok) return result;
    if (!result.messageId || !result.text) {
      var messageId = result.messageId || (READ_ACTIONS.indexOf(action) !== -1 ? 'MSG-02' : 'MSG-03');
      var msg = ctx.format && typeof ctx.format.msg === 'function' ? ctx.format.msg(messageId) : null;
      result = Object.assign({}, result, {
        messageId: messageId,
        text: result.text || (msg && typeof msg === 'object' ? msg.text : msg) || null,
        action: result.action || (msg && typeof msg === 'object' ? msg.action : null) || null
      });
    }
    return result;
  }

  function assertCan(ctx, action, extra) {
    var check = can(ctx, action, extra);
    if (!check.ok) failPermission(ctx, check);
    return check;
  }

  function isVisible(ctx, entityId) {
    if (!ctx.permissions || typeof ctx.permissions.isVisible !== 'function') return true;
    return !!ctx.permissions.isVisible(ctx.state, entityId);
  }

  function assertEntity(ctx, id, expectedType, code) {
    var entity = entityOf(ctx.pack, id);
    if (!entity) ctx.fail(code || 'unknown-entity', 'Elemento no encontrado: ' + id, { field: 'entityId' });
    if (expectedType && entity.type !== expectedType) {
      ctx.fail(code || 'unknown-entity', 'El elemento ' + id + ' no es de tipo ' + expectedType, { field: 'entityId' });
    }
    return entity;
  }

  function assertVisibleEntity(ctx, id, expectedType, code) {
    var entity = assertEntity(ctx, id, expectedType, code);
    assertCan(ctx, 'viewEntity', { entityId: id });
    return entity;
  }

  function versionOf(ctx, versionId) {
    if (!versionId) return undefined;
    return ctx.store.getVersion(versionId, ctx.state);
  }

  function assertVersion(ctx, versionId) {
    var version = versionOf(ctx, versionId);
    if (!version) ctx.fail('unknown-version', 'Versión no encontrada: ' + versionId, { field: 'versionId' });
    return version;
  }

  function assertVisibleVersion(ctx, versionId) {
    var version = assertVersion(ctx, versionId);
    if (ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, versionId)) {
      failPermission(ctx, can(ctx, 'viewVersion', { versionId: versionId }));
    } else {
      assertCan(ctx, 'viewVersion', { versionId: versionId });
    }
    return version;
  }

  function versionActivities(version) {
    return (version && version.activities) || {};
  }

  function flowNode(ctx, version, nodeId) {
    var flow = version ? flowOf(ctx.pack, version.flowId) : null;
    if (!flow || !Array.isArray(flow.nodes)) return undefined;
    for (var i = 0; i < flow.nodes.length; i++) if (flow.nodes[i].id === nodeId) return flow.nodes[i];
    return undefined;
  }

  function flowVariants(ctx, version) {
    var flow = version ? flowOf(ctx.pack, version.flowId) : null;
    return flow && Array.isArray(flow.variants) ? flow.variants : [];
  }

  function allFlowVariantIds(pack) {
    var ids = {};
    var flows = pack && pack.flows && typeof pack.flows.values === 'function' ? Array.from(pack.flows.values()) : mapValues((raw(pack).organization || {}).flows);
    flows.forEach(function (flow) {
      (flow && flow.variants || []).forEach(function (v) { ids[v.id] = true; });
    });
    return Object.keys(ids);
  }

  function ensureVariant(ctx, web) {
    var version = versionOf(ctx, web.versionId);
    var variants = flowVariants(ctx, version);
    if (!variants.length) return;
    var known = variants.some(function (v) { return v.id === web.paymentVariant; });
    if (!known) {
      var flow = flowOf(ctx.pack, version.flowId);
      web.paymentVariant = (flow && flow.defaultVariant) || variants[0].id;
    }
  }

  function processOf(ctx, processId) {
    return assertEntity(ctx, processId, 'process', 'unknown-process');
  }

  function processAreaId(ctx, processId) {
    if (!processId || !ctx.graph || typeof ctx.graph.processArea !== 'function') return null;
    var area = ctx.graph.processArea(processId);
    if (!area) return null;
    return typeof area === 'string' ? area : area.id || null;
  }

  function visibleVersionFor(ctx, processId, preferredId) {
    var candidates = [];
    if (preferredId) candidates.push(preferredId);
    var current = ctx.state.demo.currentAsIsVersionId;
    if (current) candidates.push(current);
    ctx.store.allVersions(processId, ctx.state).forEach(function (v) { candidates.push(v.id); });
    for (var i = 0; i < candidates.length; i++) {
      var v = versionOf(ctx, candidates[i]);
      if (!v || v.processId !== processId) continue;
      if (ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, v.id)) continue;
      return v.id;
    }
    return null;
  }

  /* ---------- desktop playback pausing (shared with app commands) ---------- */

  function pauseSessions(ctx, reason, statuses, sessionIds) {
    var sessions = (ctx.state.desktop && ctx.state.desktop.sessions) || {};
    var paused = [];
    Object.keys(sessions).forEach(function (sessionId) {
      if (sessionIds && sessionIds.indexOf(sessionId) === -1) return;
      var playback = sessions[sessionId] && sessions[sessionId].playback;
      if (!playback || statuses.indexOf(playback.status) === -1) return;
      playback.pausedFrom = playback.status;
      playback.status = 'paused';
      playback.pauseReason = reason;
      if (ctx.store && ctx.store.timers && typeof ctx.store.timers.clearAll === 'function') {
        ctx.store.timers.clearAll('session:' + sessionId);
      }
      paused.push(sessionId);
    });
    return paused;
  }

  /* ---------- navigation targets (CONTRACTS §7.5) ---------- */

  function normalizeCommandRef(command) {
    if (!command) return null;
    if (typeof command === 'string') return { type: command, payload: {} };
    if (typeof command === 'object' && typeof command.type === 'string') return { type: command.type, payload: command.payload || {} };
    return null;
  }

  function restrictedNotice(ctx, check) {
    var msg = ctx.format.msg('MSG-02');
    var text = (check && check.text) || (typeof msg === 'string' ? msg : msg.text);
    var action = (check && check.action) || (typeof msg === 'object' ? msg.action : null) || null;
    var cta = check && check.cta ? check.cta : null;
    return {
      kind: 'restricted',
      tone: 'warning',
      messageId: (check && check.messageId) || 'MSG-02',
      text: text,
      action: cta && cta.label ? cta.label : action,
      command: normalizeCommandRef(cta && cta.command) || { type: 'backToOrganization', payload: {} }
    };
  }

  function check(ctx, action, extra) {
    var result = can(ctx, action, extra);
    return result.ok ? null : result;
  }

  /* Validates a `web` navigation target. Returns { ok: true, patch } or { ok: false, restricted, reason }. */
  function resolveWebTarget(ctx, target) {
    var t = target || {};
    var web = ctx.state.web;
    var pack = ctx.pack;
    var patch = {};
    var denied = null;

    patch.module = t.module || (t.securityView ? 'security' : 'twin');
    if (MODULES.indexOf(patch.module) === -1) return { ok: false, reason: 'invalid-module' };
    if (patch.module === 'security') {
      denied = check(ctx, 'viewSecurity');
      if (denied) return { ok: false, restricted: denied };
      if (t.securityView && SECURITY_VIEWS.indexOf(t.securityView) === -1) return { ok: false, reason: 'invalid-view' };
      patch.securityView = t.securityView || web.security.view;
    }

    if (t.areaId) {
      var area = entityOf(pack, t.areaId);
      if (!area || area.type !== 'area') return { ok: false, reason: 'unknown-area' };
      denied = check(ctx, 'viewEntity', { entityId: t.areaId });
      if (denied) return { ok: false, restricted: denied };
      patch.areaId = t.areaId;
    }

    var version = null;
    if (t.versionId) {
      version = versionOf(ctx, t.versionId);
      if (!version) return { ok: false, reason: 'unknown-version' };
      if (ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, t.versionId)) {
        return { ok: false, restricted: can(ctx, 'viewVersion', { versionId: t.versionId }) };
      }
      denied = check(ctx, 'viewVersion', { versionId: t.versionId });
      if (denied) return { ok: false, restricted: denied };
      patch.versionId = t.versionId;
    }

    var processId = t.processId || (version ? version.processId : null);
    if (processId) {
      var process = entityOf(pack, processId);
      if (!process || process.type !== 'process') return { ok: false, reason: 'unknown-process' };
      denied = check(ctx, 'viewEntity', { entityId: processId });
      if (denied) return { ok: false, restricted: denied };
      patch.processId = processId;
      if (!patch.versionId) {
        var preferred = web.processId === processId ? web.versionId : null;
        patch.versionId = visibleVersionFor(ctx, processId, preferred);
        version = patch.versionId ? versionOf(ctx, patch.versionId) : null;
      }
    }

    if (t.activityKey) {
      if (!version) return { ok: false, reason: 'unknown-version' };
      var isActivity = !!versionActivities(version)[t.activityKey];
      var node = isActivity ? null : flowNode(ctx, version, t.activityKey);
      if (!isActivity && !node) return { ok: false, reason: 'unknown-activity' };
      if (isActivity && entityOf(pack, t.activityKey)) {
        denied = check(ctx, 'viewEntity', { entityId: t.activityKey });
        if (denied) return { ok: false, restricted: denied };
      }
      patch.activityKey = t.activityKey;
    }

    if (t.selectEntityId) {
      var selectVersionId = null;
      if (version && versionActivities(version)[t.selectEntityId]) {
        selectVersionId = version.id;
        if (entityOf(pack, t.selectEntityId)) {
          denied = check(ctx, 'viewEntity', { entityId: t.selectEntityId });
          if (denied) return { ok: false, restricted: denied };
        }
      } else if (version && flowNode(ctx, version, t.selectEntityId)) {
        selectVersionId = version.id;
      } else {
        if (!entityOf(pack, t.selectEntityId)) return { ok: false, reason: 'unknown-entity' };
        denied = check(ctx, 'viewEntity', { entityId: t.selectEntityId });
        if (denied) return { ok: false, restricted: denied };
      }
      patch.selection = { entityId: t.selectEntityId, kind: 'entity' };
      if (selectVersionId) {
        patch.selection.versionId = selectVersionId;
        if (!versionActivities(version)[t.selectEntityId]) patch.selection.kind = 'flowNode';
      }
    }

    ['highlightRootId', 'relationsRootId'].forEach(function (key) {
      if (!t[key] || denied) return;
      if (!entityOf(pack, t[key])) { denied = { reason: 'unknown-entity' }; return; }
      var d = check(ctx, 'viewEntity', { entityId: t[key] });
      if (d) { denied = d; return; }
      patch[key] = t[key];
    });
    if (denied) return denied.reason ? { ok: false, reason: denied.reason } : { ok: false, restricted: denied };

    if (t.overlay) {
      var overlay = t.overlay;
      if (!overlay || OVERLAY_KINDS.indexOf(overlay.kind) === -1) return { ok: false, reason: 'invalid-overlay' };
      if (overlay.entityId) {
        if (!entityOf(pack, overlay.entityId)) return { ok: false, reason: 'unknown-entity' };
        denied = check(ctx, 'viewEntity', { entityId: overlay.entityId });
        if (denied) return { ok: false, restricted: denied };
      }
      if (overlay.versionId) {
        if (!versionOf(ctx, overlay.versionId)) return { ok: false, reason: 'unknown-version' };
        denied = check(ctx, 'viewVersion', { versionId: overlay.versionId });
        if (denied) return { ok: false, restricted: denied };
      }
      patch.overlay = { kind: overlay.kind, entityId: overlay.entityId || null, versionId: overlay.versionId || null };
    }

    if (t.areaFilter) {
      if (!entityOf(pack, t.areaFilter)) return { ok: false, reason: 'unknown-area' };
      patch.areaFilter = t.areaFilter;
    }

    patch.level = t.level || (patch.activityKey || patch.processId ? 'operational' : patch.areaId ? 'tactical' : 'strategic');
    if (levels(pack).indexOf(patch.level) === -1) return { ok: false, reason: 'invalid-level' };
    if (patch.level === 'operational' && !patch.processId) {
      if (web.processId) patch.processId = web.processId;
    }
    if (patch.level === 'tactical' && !patch.areaId) {
      patch.areaId = web.areaId || processAreaId(ctx, patch.processId || web.processId);
    }
    if (patch.level === 'operational' && !patch.areaId) {
      patch.areaId = processAreaId(ctx, patch.processId || web.processId) || web.areaId || null;
    }

    patch.representation = t.representation || (patch.relationsRootId ? 'relations' : web.representation);
    if (representations(pack).indexOf(patch.representation) === -1) return { ok: false, reason: 'invalid-representation' };

    if (t.depth) {
      if (depths(pack).indexOf(t.depth) === -1) return { ok: false, reason: 'invalid-depth' };
      patch.depth = t.depth;
    }

    patch.processView = t.processView || (patch.activityKey ? 'flow' : (patch.processId && patch.processId === web.processId ? web.processView : 'sheet'));
    if (processViews(pack).indexOf(patch.processView) === -1) return { ok: false, reason: 'invalid-view' };
    if (patch.activityKey && patch.processView !== 'flow') patch.processView = 'flow';

    if (t.paymentVariant) {
      var variants = version ? flowVariants(ctx, version) : [];
      var ok = variants.length ? variants.some(function (v) { return v.id === t.paymentVariant; }) : allFlowVariantIds(pack).indexOf(t.paymentVariant) !== -1;
      if (!ok) return { ok: false, reason: 'invalid-variant' };
      patch.paymentVariant = t.paymentVariant;
    }

    if (typeof t.listMode === 'boolean') patch.listMode = t.listMode;
    return { ok: true, patch: patch };
  }

  /* Applies a resolved web target: pushes the previous context, closes the inspector, sets fields. */
  function applyWebTarget(ctx, resolved) {
    var web = ctx.state.web;
    var patch = resolved.patch;
    pushContext(web);
    closeInspector(web);
    web.module = patch.module;
    if (patch.module === 'security' && patch.securityView) web.security.view = patch.securityView;
    web.level = patch.level;
    web.representation = patch.representation;
    if (patch.depth) web.depth = patch.depth;
    web.areaId = patch.areaId !== undefined ? patch.areaId : (patch.level === 'strategic' ? web.areaId : web.areaId);
    web.processId = patch.processId !== undefined ? patch.processId : (patch.level === 'operational' ? web.processId : web.processId);
    web.processView = patch.processView;
    if (patch.versionId) web.versionId = patch.versionId;
    web.activityKey = patch.activityKey || null;
    if (patch.paymentVariant) web.paymentVariant = patch.paymentVariant;
    web.highlightRootId = patch.highlightRootId !== undefined ? patch.highlightRootId : (patch.representation === 'processmap' ? web.highlightRootId : null);
    web.relationsRootId = patch.relationsRootId !== undefined ? patch.relationsRootId : web.relationsRootId;
    if (patch.areaFilter !== undefined) web.areaFilter = patch.areaFilter;
    if (patch.listMode !== undefined) web.listMode = patch.listMode;
    web.overlay = patch.overlay || null;
    if (patch.selection) web.selection = patch.selection;
    ensureVariant(ctx, web);
    web.notice = null;
    applyHistoricalNotice(ctx, web);
    return patch;
  }

  /* ---------- small payload helpers ---------- */

  function requireString(ctx, payload, field, code) {
    var value = payload ? payload[field] : undefined;
    if (typeof value !== 'string' || !value) ctx.fail(code || 'invalid-payload', 'Falta el campo ' + field, { field: field });
    return value;
  }

  function optionalId(payload, field) {
    var value = payload ? payload[field] : undefined;
    return value === undefined || value === '' ? null : value;
  }

  function assertEnum(ctx, value, list, code, field) {
    if (list.indexOf(value) === -1) ctx.fail(code, 'Valor no válido para ' + field + ': ' + value, { field: field });
    return value;
  }

  function round1(n) { return Math.round(n * 10) / 10; }

  function clampScale(scale) {
    if (typeof scale !== 'number' || !isFinite(scale)) return 1;
    return Math.min(SCALE_MAX, Math.max(SCALE_MIN, round1(scale)));
  }

  function finiteNumber(ctx, value, field) {
    if (typeof value !== 'number' || !isFinite(value)) ctx.fail('invalid-camera', 'Valor numérico no válido: ' + field, { field: field });
    return value;
  }

  function recordIn(list, id) {
    if (!Array.isArray(list) || id === null || id === undefined) return undefined;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return undefined;
  }

  function cloneValues(values) {
    return JSON.parse(JSON.stringify(values));
  }

  function formSlice(ctx, formId) {
    var slice = FORM_SLICES[formId];
    if (!slice) ctx.fail('unknown-form', 'Formulario desconocido: ' + formId, { field: 'formId' });
    return ctx.state.web[slice];
  }

  function latestToBeVersionId(ctx, processId) {
    var versions = ctx.store.allVersions(processId, ctx.state).filter(function (v) {
      return v.type === 'TO-BE' && (v.state === 'proposed' || v.state === 'published-demo');
    });
    return versions.length ? versions[versions.length - 1].id : null;
  }

  function defaultFormValues(ctx, formId, mode, record) {
    var tracking = trackingOf(ctx.pack);
    var processId = (record && record.processId) || defaultProcessId(ctx.pack);
    if (formId === 'incident') {
      if (mode === 'close') return { resolution: '' };
      if (mode === 'edit') {
        return {
          subject: record.subject || '', description: record.description || '',
          responsibleId: record.responsibleId || '', dueDate: record.dueDate || '',
          status: record.status === 'inProgress' ? 'inProgress' : 'open'
        };
      }
      return {
        subject: '', description: '', processId: processId,
        responsibleId: (tracking.responsibleOptions && tracking.responsibleOptions[0]) || '',
        dueDate: '', status: 'open'
      };
    }
    if (formId === 'project') {
      if (mode === 'close') return { result: '', confirmed: false };
      if (mode === 'edit') {
        return {
          objective: record.objective || '', responsibleId: record.responsibleId || '',
          dueDate: record.dueDate || '', status: record.status === 'inProgress' ? 'inProgress' : 'planned'
        };
      }
      return {
        name: '', objective: '', processId: processId,
        responsibleId: (tracking.projectResponsibleOptions && tracking.projectResponsibleOptions[0]) || '',
        dueDate: '', targetVersionId: latestToBeVersionId(ctx, processId)
      };
    }
    if (formId === 'account') {
      if (mode === 'edit') return { username: record.username || '', role: record.role || 'employee', positionId: record.positionId || null };
      return { username: '', role: 'employee', positionId: null };
    }
    return {};
  }

  function formPermission(ctx, formId, record) {
    if (formId === 'account') return assertCan(ctx, 'manageAccounts');
    var processId = (record && record.processId) || defaultProcessId(ctx.pack) || ctx.state.web.processId;
    return assertCan(ctx, 'trackProcess', { processId: processId });
  }

  function recordListFor(ctx, formId) {
    if (formId === 'incident') return ctx.state.demo.incidents;
    if (formId === 'project') return ctx.state.demo.projects;
    return ctx.state.demo.accounts;
  }

  /* ---------- commands ---------- */

  var commands = {

    setModule: function (ctx, payload) {
      var module = assertEnum(ctx, payload && payload.module, MODULES, 'invalid-module', 'module');
      var web = ctx.state.web;
      if (module === 'security') assertCan(ctx, 'viewSecurity');
      if (web.module === module) return { module: module };
      web.module = module;
      closeInspector(web);
      web.overlay = null;
      return { module: module };
    },

    setLevel: function (ctx, payload) {
      var level = assertEnum(ctx, payload && payload.level, levels(ctx.pack), 'invalid-level', 'level');
      var web = ctx.state.web;
      if (web.module !== 'twin') web.module = 'twin';
      if (web.level === level && !web.activityKey) return { level: level };
      pushContext(web);
      closeInspector(web);
      web.level = level;
      web.activityKey = null;
      web.overlay = null;
      if (level === 'operational') {
        if (web.processId && !entityOf(ctx.pack, web.processId)) web.processId = null;
        if (!web.processId) web.processView = 'sheet';
      } else if (level === 'tactical') {
        if (!web.areaId) web.areaId = processAreaId(ctx, web.processId);
        if (web.areaId && !isVisible(ctx, web.areaId)) web.areaId = null;
      }
      clearHistoricalNotice(web);
      return { level: level, processId: web.processId, areaId: web.areaId };
    },

    setRepresentation: function (ctx, payload) {
      var representation = assertEnum(ctx, payload && payload.representation, representations(ctx.pack), 'invalid-representation', 'representation');
      var web = ctx.state.web;
      if (web.module !== 'twin') web.module = 'twin';
      if (web.level === 'strategic' && web.representation === representation) return { representation: representation };
      pushContext(web);
      closeInspector(web);
      web.level = 'strategic';
      web.representation = representation;
      web.activityKey = null;
      web.overlay = null;
      if (representation !== 'processmap') web.highlightRootId = null;
      clearHistoricalNotice(web);
      return { representation: representation };
    },

    setDepth: function (ctx, payload) {
      var depth = assertEnum(ctx, payload && payload.depth, depths(ctx.pack), 'invalid-depth', 'depth');
      ctx.state.web.depth = depth;
      return { depth: depth };
    },

    toggleExpand: function (ctx, payload) {
      var entityId = requireString(ctx, payload, 'entityId');
      assertEntity(ctx, entityId);
      var expanded = ctx.state.web.expanded;
      var next = payload.on !== undefined ? !!payload.on : !expanded[entityId];
      if (next) expanded[entityId] = true; else delete expanded[entityId];
      return { entityId: entityId, expanded: next };
    },

    expandAll: function (ctx) {
      var expanded = {};
      allEntities(ctx.pack).forEach(function (entity) {
        if ((entity.type === 'area' || entity.type === 'position' || entity.type === 'organization') && isVisible(ctx, entity.id)) expanded[entity.id] = true;
      });
      ctx.state.web.expanded = expanded;
      return { count: Object.keys(expanded).length };
    },

    collapseAll: function (ctx) {
      ctx.state.web.expanded = {};
      return { count: 0 };
    },

    enterArea: function (ctx, payload) {
      var areaId = requireString(ctx, payload, 'areaId');
      assertVisibleEntity(ctx, areaId, 'area', 'unknown-area');
      var web = ctx.state.web;
      pushContext(web);
      closeInspector(web);
      web.module = 'twin';
      web.level = 'tactical';
      web.areaId = areaId;
      web.activityKey = null;
      web.overlay = null;
      clearHistoricalNotice(web);
      return { areaId: areaId };
    },

    enterProcess: function (ctx, payload) {
      var processId = requireString(ctx, payload, 'processId');
      processOf(ctx, processId);
      assertCan(ctx, 'viewEntity', { entityId: processId });
      var web = ctx.state.web;
      var view = payload.view || payload.processView || 'sheet';
      assertEnum(ctx, view, processViews(ctx.pack), 'invalid-view', 'view');
      var versionId = null;
      if (payload.versionId) {
        var version = assertVisibleVersion(ctx, payload.versionId);
        if (version.processId !== processId) ctx.fail('invalid-version', 'La versión no pertenece al proceso', { field: 'versionId' });
        versionId = version.id;
      } else {
        versionId = visibleVersionFor(ctx, processId, web.processId === processId ? web.versionId : null);
      }
      pushContext(web);
      closeInspector(web);
      web.module = 'twin';
      web.level = 'operational';
      web.processId = processId;
      web.processView = view;
      web.activityKey = null;
      web.overlay = null;
      if (versionId) web.versionId = versionId;
      if (!web.areaId) web.areaId = processAreaId(ctx, processId);
      ensureVariant(ctx, web);
      applyHistoricalNotice(ctx, web);
      return { processId: processId, view: view, versionId: web.versionId };
    },

    setProcessView: function (ctx, payload) {
      var view = assertEnum(ctx, payload && payload.view, processViews(ctx.pack), 'invalid-view', 'view');
      var web = ctx.state.web;
      if (!web.processId) ctx.fail('no-process', uiText(ctx.pack, 'selectProcess', 'Selecciona un proceso'));
      if (web.level !== 'operational') {
        pushContext(web);
        web.level = 'operational';
      }
      closeInspector(web);
      web.processView = view;
      web.activityKey = null;
      web.overlay = null;
      return { view: view };
    },

    setVersion: function (ctx, payload) {
      var versionId = requireString(ctx, payload, 'versionId');
      var version = assertVisibleVersion(ctx, versionId);
      var web = ctx.state.web;
      if (web.processId && version.processId !== web.processId) {
        ctx.fail('invalid-version', 'La versión no pertenece al proceso seleccionado', { field: 'versionId' });
      }
      web.versionId = versionId;
      if (!web.processId) web.processId = version.processId;
      if (web.activityKey && !versionActivities(version)[web.activityKey] && !flowNode(ctx, version, web.activityKey)) web.activityKey = null;
      if (web.selection && web.selection.versionId && web.selection.versionId !== versionId) closeInspector(web);
      ensureVariant(ctx, web);
      applyHistoricalNotice(ctx, web);
      if (web.newVersionNotice && web.newVersionNotice.versionId === versionId) web.newVersionNotice = null;
      return { versionId: versionId, historical: !!(web.notice && web.notice.kind === 'historical') };
    },

    setCompareVersion: function (ctx, payload) {
      var versionId = requireString(ctx, payload, 'versionId');
      var version = assertVisibleVersion(ctx, versionId);
      var web = ctx.state.web;
      if (web.processId && version.processId !== web.processId) {
        ctx.fail('invalid-version', 'La versión no pertenece al proceso seleccionado', { field: 'versionId' });
      }
      web.compareVersionId = versionId;
      return { compareVersionId: versionId };
    },

    setPaymentVariant: function (ctx, payload) {
      var variant = requireString(ctx, payload, 'variant');
      var web = ctx.state.web;
      var version = versionOf(ctx, web.versionId);
      var variants = flowVariants(ctx, version);
      var ids = variants.length ? variants.map(function (v) { return v.id; }) : allFlowVariantIds(ctx.pack);
      assertEnum(ctx, variant, ids, 'invalid-variant', 'variant');
      web.paymentVariant = variant;
      var entry = variants.filter(function (v) { return v.id === variant; })[0];
      return { variant: variant, available: entry ? entry.available !== false : true };
    },

    openInstruction: function (ctx, payload) {
      var versionId = requireString(ctx, payload, 'versionId');
      var key = requireString(ctx, payload, 'key');
      var version = assertVisibleVersion(ctx, versionId);
      var activity = versionActivities(version)[key];
      var node = activity ? null : flowNode(ctx, version, key);
      if (!activity && !node) ctx.fail('unknown-activity', 'Actividad no encontrada: ' + key, { field: 'key' });
      if (activity && entityOf(ctx.pack, key)) assertCan(ctx, 'viewEntity', { entityId: key });
      var web = ctx.state.web;
      pushContext(web);
      closeInspector(web);
      web.module = 'twin';
      web.level = 'operational';
      web.processId = version.processId;
      web.processView = 'flow';
      web.versionId = versionId;
      web.activityKey = key;
      web.overlay = null;
      ensureVariant(ctx, web);
      applyHistoricalNotice(ctx, web);
      return { versionId: versionId, key: key, nodeKind: activity ? 'task' : node.kind };
    },

    backToFlow: function (ctx) {
      var web = ctx.state.web;
      if (!web.activityKey) return { activityKey: null };
      web.activityKey = null;
      web.processView = 'flow';
      closeInspector(web);
      var top = web.contextHistory[web.contextHistory.length - 1];
      if (top && sameContext(top, snapshot(web))) web.contextHistory.pop();
      return { activityKey: null };
    },

    contextBack: function (ctx) {
      var web = ctx.state.web;
      closeInspector(web);
      web.overlay = null;
      if (web.contextHistory.length) {
        var snap = web.contextHistory.pop();
        restoreContext(web, snap);
        if (snap.module === 'security') {
          var denied = check(ctx, 'viewSecurity');
          if (denied) web.module = 'twin';
        }
        if (web.areaId && !isVisible(ctx, web.areaId)) web.areaId = null;
        if (web.processId && !isVisible(ctx, web.processId)) { web.processId = null; web.activityKey = null; }
        if (web.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, web.versionId)) {
          web.versionId = web.processId ? visibleVersionFor(ctx, web.processId, null) || ctx.state.demo.currentAsIsVersionId : ctx.state.demo.currentAsIsVersionId;
          web.activityKey = null;
        }
        ensureVariant(ctx, web);
        applyHistoricalNotice(ctx, web);
        return { restored: true, cameraKey: snap.cameraKey };
      }
      if (web.module === 'security') { web.module = 'twin'; return { restored: false, parent: 'twin' }; }
      if (web.level === 'operational' && web.activityKey) {
        web.activityKey = null;
        return { restored: false, parent: 'flow' };
      }
      if (web.level === 'operational') {
        var areaId = web.areaId || processAreaId(ctx, web.processId);
        if (areaId && isVisible(ctx, areaId)) {
          web.level = 'tactical';
          web.areaId = areaId;
          clearHistoricalNotice(web);
          return { restored: false, parent: 'tactical' };
        }
        web.level = 'strategic';
        clearHistoricalNotice(web);
        return { restored: false, parent: 'strategic' };
      }
      if (web.level === 'tactical') {
        web.level = 'strategic';
        return { restored: false, parent: 'strategic' };
      }
      return { restored: false, atRoot: true };
    },

    backToOrganization: function (ctx) {
      var web = ctx.state.web;
      var dc = defaultContext(ctx.pack);
      web.contextHistory = [];
      closeInspector(web);
      web.module = 'twin';
      web.level = dc.level;
      web.representation = dc.representation;
      web.depth = dc.depth;
      web.areaId = null;
      web.processId = null;
      web.processView = 'sheet';
      web.versionId = ctx.state.demo.currentAsIsVersionId;
      web.activityKey = null;
      web.relationsRootId = null;
      web.highlightRootId = null;
      web.expanded = {};
      web.areaFilter = null;
      web.overlay = null;
      web.notice = null;
      return { rootId: dc.rootId };
    },

    selectEntity: function (ctx, payload) {
      var entityId = requireString(ctx, payload, 'entityId');
      var versionId = optionalId(payload, 'versionId');
      var kind = payload.kind || 'entity';
      assertEnum(ctx, kind, SELECTION_KINDS, 'invalid-kind', 'kind');
      var web = ctx.state.web;
      if (versionId) {
        var version = assertVisibleVersion(ctx, versionId);
        var activity = versionActivities(version)[entityId];
        var node = activity ? null : flowNode(ctx, version, entityId);
        if (!activity && !node) ctx.fail('unknown-entity', 'Elemento no encontrado en la versión: ' + entityId, { field: 'entityId' });
        if (activity && entityOf(ctx.pack, entityId)) assertCan(ctx, 'viewEntity', { entityId: entityId });
        if (!activity) kind = 'flowNode';
      } else {
        assertVisibleEntity(ctx, entityId);
      }
      var selection = { entityId: entityId, kind: kind };
      if (versionId) selection.versionId = versionId;
      var current = web.selection;
      var same = current && current.entityId === entityId && (current.versionId || null) === (versionId || null);
      if (same) { web.selection = selection; return { selection: selection, pushed: false }; }
      if (current && payload.followLink) {
        web.inspectorHistory.push(current);
        if (web.inspectorHistory.length > INSPECTOR_HISTORY_LIMIT) web.inspectorHistory.shift();
      } else {
        web.inspectorHistory = [];
      }
      web.selection = selection;
      return { selection: selection, pushed: !!(current && payload.followLink) };
    },

    inspectorBack: function (ctx) {
      var web = ctx.state.web;
      if (!web.inspectorHistory.length) return { selection: web.selection, atRoot: true };
      web.selection = web.inspectorHistory.pop();
      return { selection: web.selection, atRoot: web.inspectorHistory.length === 0 };
    },

    closeInspector: function (ctx) {
      closeInspector(ctx.state.web);
      return { selection: null };
    },

    setHighlightRoot: function (ctx, payload) {
      var entityId = optionalId(payload, 'entityId');
      if (entityId) assertVisibleEntity(ctx, entityId);
      ctx.state.web.highlightRootId = entityId;
      return { highlightRootId: entityId };
    },

    setRelationsRoot: function (ctx, payload) {
      var entityId = requireString(ctx, payload, 'entityId');
      assertVisibleEntity(ctx, entityId);
      var web = ctx.state.web;
      var contextChanges = web.level !== 'strategic' || web.representation !== 'relations' || web.module !== 'twin';
      if (contextChanges) {
        pushContext(web);
        closeInspector(web);
        web.module = 'twin';
        web.level = 'strategic';
        web.representation = 'relations';
        web.activityKey = null;
        web.overlay = null;
        clearHistoricalNotice(web);
      }
      web.relationsRootId = entityId;
      return { relationsRootId: entityId };
    },

    clearRelationsRoot: function (ctx) {
      ctx.state.web.relationsRootId = null;
      return { relationsRootId: null };
    },

    toggleLayer: function (ctx, payload) {
      var layerId = assertEnum(ctx, payload && payload.layerId, layerIds(ctx.pack), 'invalid-layer', 'layerId');
      var layers = ctx.state.web.layers;
      layers[layerId] = payload.on !== undefined ? !!payload.on : !layers[layerId];
      return { layerId: layerId, on: layers[layerId] };
    },

    setSearch: function (ctx, payload) {
      var query = payload && payload.query !== undefined && payload.query !== null ? String(payload.query) : '';
      query = query.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, QUERY_MAX_LENGTH);
      var search = ctx.state.web.search;
      search.query = query;
      search.open = query.trim().length > 0;
      return { query: query, open: search.open };
    },

    setSearchTypes: function (ctx, payload) {
      var types = payload && Array.isArray(payload.types) ? payload.types : [];
      var known = null;
      try {
        var packCore = require('core/pack');
        if (packCore && packCore.ENTITY_TYPES) known = Object.keys(packCore.ENTITY_TYPES);
      } catch (e) { known = null; }
      var cleaned = [];
      types.forEach(function (type) {
        if (typeof type !== 'string' || !type) ctx.fail('invalid-type', 'Tipo de entidad no válido', { field: 'types' });
        if (known && known.indexOf(type) === -1 && type !== 'version') ctx.fail('invalid-type', 'Tipo de entidad no válido: ' + type, { field: 'types' });
        if (cleaned.indexOf(type) === -1) cleaned.push(type);
      });
      ctx.state.web.search.types = cleaned;
      return { types: cleaned };
    },

    setSearchIncludeVersions: function (ctx, payload) {
      var on = !!(payload && payload.on);
      ctx.state.web.search.includeVersions = on;
      return { includeVersions: on };
    },

    setSearchOpen: function (ctx, payload) {
      var open = !!(payload && payload.open);
      ctx.state.web.search.open = open;
      return { open: open };
    },

    clearSearch: function (ctx) {
      var search = ctx.state.web.search;
      search.query = '';
      search.open = false;
      return { query: '' };
    },

    setAreaFilter: function (ctx, payload) {
      var areaId = optionalId(payload, 'areaId');
      if (areaId) assertVisibleEntity(ctx, areaId, 'area', 'unknown-area');
      ctx.state.web.areaFilter = areaId;
      return { areaFilter: areaId };
    },

    clearFilters: function (ctx) {
      var web = ctx.state.web;
      web.areaFilter = null;
      web.search.query = '';
      web.search.open = false;
      web.search.types = [];
      web.search.includeVersions = false;
      Object.keys(web.layers).forEach(function (id) { web.layers[id] = true; });
      return { cleared: true };
    },

    setListMode: function (ctx, payload) {
      var on = !!(payload && payload.on);
      ctx.state.web.listMode = on;
      return { listMode: on };
    },

    setCamera: function (ctx, payload) {
      var key = requireString(ctx, payload, 'contextKey', 'invalid-camera');
      var x = finiteNumber(ctx, payload.x, 'x');
      var y = finiteNumber(ctx, payload.y, 'y');
      var scale = clampScale(payload.scale === undefined ? 1 : finiteNumber(ctx, payload.scale, 'scale'));
      ctx.state.camera[key] = { x: Math.round(x), y: Math.round(y), scale: scale };
      return ctx.state.camera[key];
    },

    zoomCamera: function (ctx, payload) {
      var key = requireString(ctx, payload, 'contextKey', 'invalid-camera');
      var current = ctx.state.camera[key] || { x: 0, y: 0, scale: 1 };
      var delta = payload.steps !== undefined ? finiteNumber(ctx, payload.steps, 'steps') * SCALE_STEP : finiteNumber(ctx, payload.delta === undefined ? SCALE_STEP : payload.delta, 'delta');
      var next = clampScale(current.scale + delta);
      var x = current.x;
      var y = current.y;
      if (typeof payload.cx === 'number' && typeof payload.cy === 'number' && isFinite(payload.cx) && isFinite(payload.cy) && current.scale > 0) {
        var ratio = next / current.scale;
        x = Math.round(payload.cx - (payload.cx - current.x) * ratio);
        y = Math.round(payload.cy - (payload.cy - current.y) * ratio);
      }
      ctx.state.camera[key] = { x: x, y: y, scale: next };
      return ctx.state.camera[key];
    },

    fitCamera: function (ctx, payload) {
      var key = requireString(ctx, payload, 'contextKey', 'invalid-camera');
      var cw = finiteNumber(ctx, payload.contentWidth, 'contentWidth');
      var ch = finiteNumber(ctx, payload.contentHeight, 'contentHeight');
      var vw = finiteNumber(ctx, payload.viewportWidth, 'viewportWidth');
      var vh = finiteNumber(ctx, payload.viewportHeight, 'viewportHeight');
      var padding = typeof payload.padding === 'number' && isFinite(payload.padding) ? Math.max(0, payload.padding) : 24;
      if (cw <= 0 || ch <= 0 || vw <= 0 || vh <= 0) ctx.fail('invalid-camera', 'Geometría no válida para ajustar la vista', { field: 'contentWidth' });
      var available = Math.min(Math.max(vw - 2 * padding, 1) / cw, Math.max(vh - 2 * padding, 1) / ch);
      var scale = Math.floor(available * 10 + 1e-9) / 10;
      scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
      var fitsX = cw * scale + 2 * padding <= vw;
      var fitsY = ch * scale + 2 * padding <= vh;
      var x = fitsX ? Math.round((vw - cw * scale) / 2) : padding;
      var y = fitsY ? Math.round((vh - ch * scale) / 2) : padding;
      ctx.state.camera[key] = { x: x, y: y, scale: scale };
      return ctx.state.camera[key];
    },

    resetCamera: function (ctx, payload) {
      var key = requireString(ctx, payload, 'contextKey', 'invalid-camera');
      delete ctx.state.camera[key];
      return { contextKey: key, x: 0, y: 0, scale: 1 };
    },

    openOverlay: function (ctx, payload) {
      var kind = assertEnum(ctx, payload && payload.kind, OVERLAY_KINDS, 'invalid-overlay', 'kind');
      var entityId = optionalId(payload, 'entityId');
      var versionId = optionalId(payload, 'versionId');
      if (entityId && entityOf(ctx.pack, entityId)) {
        assertCan(ctx, 'viewEntity', { entityId: entityId });
      } else if (entityId) {
        var version = versionId ? assertVisibleVersion(ctx, versionId) : null;
        if (!version || (!versionActivities(version)[entityId] && !flowNode(ctx, version, entityId))) {
          ctx.fail('unknown-entity', 'Elemento no encontrado: ' + entityId, { field: 'entityId' });
        }
      }
      if (versionId) assertVisibleVersion(ctx, versionId);
      ctx.state.web.overlay = { kind: kind, entityId: entityId, versionId: versionId };
      return ctx.state.web.overlay;
    },

    closeOverlay: function (ctx) {
      ctx.state.web.overlay = null;
      return { overlay: null };
    },

    setNotice: function (ctx, payload) {
      if (!payload || typeof payload.text !== 'string' || !payload.text) ctx.fail('invalid-payload', 'Falta el texto del aviso', { field: 'text' });
      ctx.state.web.notice = {
        kind: payload.kind || 'custom',
        tone: payload.tone || 'info',
        text: payload.text,
        action: payload.action || null,
        command: normalizeCommandRef(payload.command),
        messageId: payload.messageId || null
      };
      return ctx.state.web.notice;
    },

    dismissNotice: function (ctx) {
      ctx.state.web.notice = null;
      return { notice: null };
    },

    dismissNewVersionNotice: function (ctx) {
      ctx.state.web.newVersionNotice = null;
      return { newVersionNotice: null };
    },

    setTableSort: function (ctx, payload) {
      var tableId = requireString(ctx, payload, 'tableId');
      var direction = payload.direction === undefined ? 'asc' : payload.direction;
      var web = ctx.state.web;
      if (direction === null || payload.column === null) {
        delete web.tableSort[tableId];
        if (tableId === 'incidents') web.incidents.sort = null;
        return { tableId: tableId, sort: null };
      }
      var column = requireString(ctx, payload, 'column');
      assertEnum(ctx, direction, SORT_DIRECTIONS, 'invalid-direction', 'direction');
      web.tableSort[tableId] = { column: column, direction: direction };
      if (tableId === 'incidents') web.incidents.sort = { column: column, direction: direction };
      return { tableId: tableId, sort: web.tableSort[tableId] };
    },

    setSecurityView: function (ctx, payload) {
      var view = assertEnum(ctx, payload && payload.view, SECURITY_VIEWS, 'invalid-view', 'view');
      assertCan(ctx, 'viewSecurity');
      var web = ctx.state.web;
      if (web.module !== 'security') {
        web.module = 'security';
        closeInspector(web);
        web.overlay = null;
      }
      web.security.view = view;
      return { view: view };
    },

    selectAccount: function (ctx, payload) {
      var id = optionalId(payload, 'id');
      if (id && !recordIn(ctx.state.demo.accounts, id)) ctx.fail('unknown-record', 'Cuenta no encontrada: ' + id, { field: 'id' });
      ctx.state.web.security.selectionId = id;
      return { selectionId: id };
    },

    setIncidentFilter: function (ctx, payload) {
      var filters = (trackingOf(ctx.pack).incidentFilters || []).map(function (f) { return f.id; });
      if (!filters.length) filters = ['all', 'open', 'closed', 'overdue', 'dueSoon'];
      var filterId = assertEnum(ctx, payload && payload.filterId, filters, 'invalid-filter', 'filterId');
      ctx.state.web.incidents.filter = filterId;
      return { filter: filterId };
    },

    setIncidentQuery: function (ctx, payload) {
      var query = payload && payload.query !== undefined && payload.query !== null ? String(payload.query) : '';
      query = query.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, QUERY_MAX_LENGTH);
      ctx.state.web.incidents.query = query;
      return { query: query };
    },

    selectIncident: function (ctx, payload) {
      var id = optionalId(payload, 'id');
      if (id && !recordIn(ctx.state.demo.incidents, id)) ctx.fail('unknown-record', 'Incidencia no encontrada: ' + id, { field: 'id' });
      ctx.state.web.incidents.selectionId = id;
      return { selectionId: id };
    },

    selectProject: function (ctx, payload) {
      var id = optionalId(payload, 'id');
      if (id && !recordIn(ctx.state.demo.projects, id)) ctx.fail('unknown-record', 'Proyecto no encontrado: ' + id, { field: 'id' });
      ctx.state.web.projects.selectionId = id;
      return { selectionId: id };
    },

    openForm: function (ctx, payload) {
      var formId = requireString(ctx, payload, 'formId');
      var slice = formSlice(ctx, formId);
      var recordId = payload.recordId || (payload.record && typeof payload.record === 'object' ? payload.record.id : payload.record) || null;
      var record = null;
      if (recordId) {
        record = recordIn(recordListFor(ctx, formId), recordId);
        if (!record) ctx.fail('unknown-record', 'Registro no encontrado: ' + recordId, { field: 'recordId' });
      }
      var mode = payload.mode || (record ? 'edit' : 'create');
      assertEnum(ctx, mode, FORM_MODES, 'invalid-mode', 'mode');
      if (mode !== 'create' && !record) ctx.fail('unknown-record', 'El modo ' + mode + ' requiere un registro', { field: 'recordId' });
      if (mode === 'close' && formId === 'account') ctx.fail('invalid-mode', 'Las cuentas no se cierran', { field: 'mode' });
      formPermission(ctx, formId, record);
      if (slice.form && slice.form.dirty && !payload.discard) {
        ctx.fail('dirty', uiText(ctx.pack, 'discardChanges', {}).title || '¿Descartar los cambios sin guardar?', { formId: formId });
      }
      var values = defaultFormValues(ctx, formId, mode, record);
      if (payload.values && typeof payload.values === 'object') Object.assign(values, cloneValues(payload.values));
      slice.form = {
        id: formId,
        mode: mode,
        recordId: recordId,
        values: values,
        initial: cloneValues(values),
        errors: {},
        dirty: false
      };
      if (recordId) slice.selectionId = recordId;
      return { formId: formId, mode: mode, recordId: recordId };
    },

    updateForm: function (ctx, payload) {
      var formId = requireString(ctx, payload, 'formId');
      var field = requireString(ctx, payload, 'field');
      var slice = formSlice(ctx, formId);
      var form = slice.form;
      if (!form) ctx.fail('form-not-open', 'No hay un formulario abierto', { formId: formId });
      var value = payload.value;
      if (value === undefined) value = '';
      if (typeof value === 'string') value = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
      form.values[field] = value;
      delete form.errors[field];
      form.dirty = JSON.stringify(form.values) !== JSON.stringify(form.initial);
      return { formId: formId, field: field, dirty: form.dirty };
    },

    setFormErrors: function (ctx, payload) {
      var formId = requireString(ctx, payload, 'formId');
      var slice = formSlice(ctx, formId);
      var form = slice.form;
      if (!form) ctx.fail('form-not-open', 'No hay un formulario abierto', { formId: formId });
      if (payload.errors && typeof payload.errors === 'object') {
        form.errors = cloneValues(payload.errors);
      } else if (typeof payload.field === 'string') {
        if (payload.message) form.errors[payload.field] = String(payload.message); else delete form.errors[payload.field];
      } else {
        form.errors = {};
      }
      return { formId: formId, errors: form.errors };
    },

    closeForm: function (ctx, payload) {
      var formId = requireString(ctx, payload, 'formId');
      var slice = formSlice(ctx, formId);
      var form = slice.form;
      if (!form) return { formId: formId, closed: false };
      if (form.dirty && !payload.discard) {
        ctx.fail('dirty', uiText(ctx.pack, 'discardChanges', {}).title || '¿Descartar los cambios sin guardar?', { formId: formId });
      }
      slice.form = null;
      return { formId: formId, closed: true };
    }
  };

  return {
    commands: commands,
    helpers: {
      raw: raw,
      mapGet: mapGet,
      mapValues: mapValues,
      entityOf: entityOf,
      allEntities: allEntities,
      viewsOf: viewsOf,
      uiOf: uiOf,
      uiText: uiText,
      trackingOf: trackingOf,
      flowOf: flowOf,
      levels: levels,
      representations: representations,
      depths: depths,
      processViews: processViews,
      defaultContext: defaultContext,
      defaultProcessId: defaultProcessId,
      cameraKey: cameraKey,
      snapshot: snapshot,
      pushContext: pushContext,
      restoreContext: restoreContext,
      closeInspector: closeInspector,
      applyHistoricalNotice: applyHistoricalNotice,
      can: can,
      check: check,
      assertCan: assertCan,
      failPermission: failPermission,
      isVisible: isVisible,
      versionOf: versionOf,
      visibleVersionFor: visibleVersionFor,
      pauseSessions: pauseSessions,
      resolveWebTarget: resolveWebTarget,
      applyWebTarget: applyWebTarget,
      restrictedNotice: restrictedNotice,
      normalizeCommandRef: normalizeCommandRef,
      recordIn: recordIn,
      clampScale: clampScale
    },
    constants: {
      MODULES: MODULES,
      OVERLAY_KINDS: OVERLAY_KINDS,
      SECURITY_VIEWS: SECURITY_VIEWS,
      SELECTION_KINDS: SELECTION_KINDS,
      SORT_DIRECTIONS: SORT_DIRECTIONS,
      FORM_SLICES: FORM_SLICES,
      FORM_MODES: FORM_MODES,
      SCALE_MIN: SCALE_MIN,
      SCALE_MAX: SCALE_MAX,
      SCALE_STEP: SCALE_STEP,
      QUERY_MAX_LENGTH: QUERY_MAX_LENGTH
    }
  };
});
