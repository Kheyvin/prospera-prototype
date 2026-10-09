/* core/commands/app — shell-level commands: tabs, access profile, about, modal, toasts,
 * reset, cross-tab navigation, narrative tab selections (CONTRACTS §6 "App", §7.5).
 *
 * This module precedes core/commands/web in the manifest, so the shared helpers are
 * required lazily inside each command. Commands mutate ctx.state (the draft) directly and
 * report validation failures through ctx.fail (CommandError → store rolls back). */
Primus.module('core/commands/app', function (require) {
  'use strict';

  var TOAST_TONES = ['neutral', 'info', 'success', 'warning', 'danger'];
  var TOAST_LIMIT = 5;
  var RUNNING_STATUSES = ['running'];
  var PROFILE_PAUSE_STATUSES = ['running', 'awaiting-review'];

  function web() { return require('core/commands/web').helpers; }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }

  function tabs(pack) {
    var r = raw(pack);
    var list = (pack && pack.texts && pack.texts.tabs) || (r.presentation && r.presentation.tabs) || [];
    return list.map(function (t) { return t.id; });
  }

  function profiles(pack) {
    if (pack && pack.profiles && typeof pack.profiles.values === 'function') return Array.from(pack.profiles.values());
    var r = raw(pack);
    return (r.demo && r.demo.profiles) || [];
  }

  function profileOf(pack, id) {
    if (pack && pack.profiles && typeof pack.profiles.get === 'function') return pack.profiles.get(id);
    return profiles(pack).filter(function (p) { return p.id === id; })[0];
  }

  function solutionNodes(pack) {
    var r = raw(pack);
    return (r.solution && r.solution.nodes) || [];
  }

  function scopeOf(pack) { return raw(pack).scope || {}; }
  function methodologiesOf(pack) { return raw(pack).methodologies || {}; }

  function workspaceOf(pack, id) {
    if (pack && pack.workspaces && typeof pack.workspaces.get === 'function') return pack.workspaces.get(id);
    var r = raw(pack);
    return web().recordIn((r.desktop && r.desktop.workspaces) || [], id);
  }

  function scenarioOf(pack, id) {
    if (pack && pack.scenarios && typeof pack.scenarios.get === 'function') return pack.scenarios.get(id);
    return web().recordIn(raw(pack).scenarios || [], id);
  }

  function requireString(ctx, payload, field, code) {
    var value = payload ? payload[field] : undefined;
    if (typeof value !== 'string' || !value) ctx.fail(code || 'invalid-payload', 'Falta el campo ' + field, { field: field });
    return value;
  }

  function assertTab(ctx, tabId) {
    if (tabs(ctx.pack).indexOf(tabId) === -1) ctx.fail('unknown-tab', 'Pestaña desconocida: ' + tabId, { field: 'tabId' });
    return tabId;
  }

  function roleOf(ctx) {
    if (ctx.permissions && typeof ctx.permissions.role === 'function') return ctx.permissions.role(ctx.state);
    var profile = profileOf(ctx.pack, ctx.state.app.profileId);
    return profile ? profile.accessRole : null;
  }

  function leaveTab(ctx, fromTab, toTab) {
    if (fromTab === 'desktop' && toTab !== 'desktop') {
      return web().pauseSessions(ctx, 'tab', RUNNING_STATUSES);
    }
    return [];
  }

  function adjustedNotice(ctx) {
    return { kind: 'adjusted', tone: 'info', text: web().uiText(ctx.pack, 'viewAdjusted', 'La vista se ajustó al perfil seleccionado') };
  }

  /* Re-validates the whole web context against the new profile; never grants anything. */
  function sanitizeWebForProfile(ctx) {
    var h = web();
    var state = ctx.state;
    var w = state.web;
    var adjusted = false;

    var patch = null;
    if (ctx.permissions && typeof ctx.permissions.adjustContext === 'function') {
      patch = ctx.permissions.adjustContext(state);
    }
    if (patch && typeof patch === 'object') {
      var notice = patch.notice;
      Object.keys(patch).forEach(function (key) {
        if (key === 'notice') return;
        w[key] = patch[key];
      });
      if (typeof notice === 'string') w.notice = { kind: 'adjusted', tone: 'info', text: notice };
      else if (notice && typeof notice === 'object') w.notice = Object.assign({ kind: 'adjusted', tone: 'info' }, notice);
      adjusted = true;
    }

    if (w.module === 'security' && h.check(ctx, 'viewSecurity')) {
      w.module = 'twin';
      adjusted = true;
    }
    if (h.check(ctx, 'viewSecurity')) {
      w.security.form = null;
      w.security.selectionId = null;
    }
    if (w.areaId && !h.isVisible(ctx, w.areaId)) { w.areaId = null; adjusted = true; }
    if (w.processId && !h.isVisible(ctx, w.processId)) {
      w.processId = null;
      w.activityKey = null;
      adjusted = true;
    }
    if (w.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, w.versionId)) {
      w.versionId = (w.processId && h.visibleVersionFor(ctx, w.processId, null)) || state.demo.currentAsIsVersionId;
      w.activityKey = null;
      adjusted = true;
    }
    if (w.compareVersionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, w.compareVersionId)) {
      w.compareVersionId = null;
    }
    if (w.selection) {
      var sel = w.selection;
      var hidden = (h.entityOf(ctx.pack, sel.entityId) && !h.isVisible(ctx, sel.entityId)) ||
        (sel.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, sel.versionId));
      if (hidden) h.closeInspector(w);
      else w.inspectorHistory = w.inspectorHistory.filter(function (s) {
        return !(h.entityOf(ctx.pack, s.entityId) && !h.isVisible(ctx, s.entityId)) &&
          !(s.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, s.versionId));
      });
    }
    ['highlightRootId', 'relationsRootId', 'areaFilter'].forEach(function (key) {
      if (w[key] && !h.isVisible(ctx, w[key])) { w[key] = null; adjusted = true; }
    });
    if (w.overlay) {
      var o = w.overlay;
      if ((o.entityId && h.entityOf(ctx.pack, o.entityId) && !h.isVisible(ctx, o.entityId)) ||
          (o.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, o.versionId))) {
        w.overlay = null;
      }
    }
    if (w.newVersionNotice && w.newVersionNotice.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' &&
        !ctx.permissions.canSeeVersion(state, w.newVersionNotice.versionId)) {
      w.newVersionNotice = null;
    }
    var trackProcessId = w.processId || h.defaultProcessId(ctx.pack);
    if (h.check(ctx, 'trackProcess', { processId: trackProcessId })) {
      w.incidents.form = null;
      w.projects.form = null;
    }
    if (h.check(ctx, 'manageAccounts')) w.security.form = null;
    w.contextHistory = w.contextHistory.filter(function (snap) {
      if (snap.module === 'security' && h.check(ctx, 'viewSecurity')) return false;
      if (snap.areaId && !h.isVisible(ctx, snap.areaId)) return false;
      if (snap.processId && !h.isVisible(ctx, snap.processId)) return false;
      if (snap.versionId && ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(state, snap.versionId)) return false;
      return true;
    });
    if (adjusted && !(w.notice && w.notice.kind === 'adjusted')) w.notice = adjustedNotice(ctx);
    if (adjusted) h.applyHistoricalNotice(ctx, w);
    return adjusted;
  }

  function switchProfile(ctx, profileId) {
    var profile = profileOf(ctx.pack, profileId);
    if (!profile) ctx.fail('unknown-profile', 'Perfil desconocido: ' + profileId, { field: 'profileId' });
    var state = ctx.state;
    if (state.app.profileId === profileId) return { profileId: profileId, changed: false, adjusted: false, paused: [] };
    state.app.profileId = profileId;
    var adjusted = sanitizeWebForProfile(ctx);
    var paused = [];
    if (roleOf(ctx) !== 'admin') paused = web().pauseSessions(ctx, 'profile', PROFILE_PAUSE_STATUSES);
    if (state.desktop) state.desktop.evidenceOpenId = state.desktop.evidenceOpenId || null;
    return { profileId: profileId, changed: true, adjusted: adjusted, paused: paused };
  }

  function performReset(ctx) {
    var store = ctx.store;
    var generation = typeof store.timers.bump === 'function' ? store.timers.bump() : store.timers.generation();
    var next = store.createInitialState();
    next.demo.generation = generation;
    next.app.toasts.push({ id: ctx.uid('toast'), text: ctx.format.msgText('MSG-20'), tone: 'success', messageId: 'MSG-20' });
    ctx.replaceState(next);
    return { reset: true, generation: generation };
  }

  function applyDesktopTarget(ctx, target) {
    var t = target || {};
    var desktop = ctx.state.desktop;
    var result = { workspaceId: desktop.workspaceId };
    if (t.workspaceId) {
      var workspace = workspaceOf(ctx.pack, t.workspaceId);
      if (!workspace) ctx.fail('unknown-workspace', 'Espacio desconocido: ' + t.workspaceId, { field: 'workspaceId' });
      if (desktop.workspaceId !== t.workspaceId) {
        var previous = workspaceOf(ctx.pack, desktop.workspaceId);
        if (previous && previous.sessionId) web().pauseSessions(ctx, 'workspace', RUNNING_STATUSES, [previous.sessionId]);
        desktop.workspaceId = t.workspaceId;
      }
      result.workspaceId = t.workspaceId;
    }
    if (t.scenarioId && !scenarioOf(ctx.pack, t.scenarioId)) ctx.fail('unknown-scenario', 'Escenario desconocido: ' + t.scenarioId, { field: 'scenarioId' });
    if (t.projectId && !web().recordIn(ctx.state.demo.projects, t.projectId)) ctx.fail('unknown-record', 'Proyecto no encontrado: ' + t.projectId, { field: 'projectId' });
    desktop.navigation = { scenarioId: t.scenarioId || null, projectId: t.projectId || null };
    if (t.projectId) ctx.state.web.projects.selectionId = t.projectId;
    result.navigation = desktop.navigation;
    return result;
  }

  function applyArchitectureTarget(ctx, target) {
    var t = target || {};
    if (t.nodeId !== undefined && t.nodeId !== null) {
      if (!web().recordIn(solutionNodes(ctx.pack), t.nodeId)) ctx.fail('unknown-node', 'Componente desconocido: ' + t.nodeId, { field: 'nodeId' });
      ctx.state.app.architectureSelection = t.nodeId;
    }
    return { nodeId: ctx.state.app.architectureSelection };
  }

  function applyScopeTarget(ctx, target) {
    var t = target || {};
    var scope = scopeOf(ctx.pack);
    var app = ctx.state.app;
    var item = null;
    if (t.itemId) {
      item = web().recordIn(scope.items || [], t.itemId);
      if (!item) ctx.fail('unknown-item', 'Elemento de alcance desconocido: ' + t.itemId, { field: 'itemId' });
    }
    if (t.filter) {
      var filters = (scope.filters || []).map(function (f) { return f.id; });
      if (filters.indexOf(t.filter) === -1) ctx.fail('invalid-filter', 'Filtro de alcance desconocido: ' + t.filter, { field: 'filter' });
      app.scopeFilter = t.filter;
    }
    if (item) {
      if (app.scopeFilter !== 'all' && item.disposition !== app.scopeFilter) app.scopeFilter = 'all';
      app.scopeSelection = item.id;
    }
    return { itemId: app.scopeSelection, filter: app.scopeFilter };
  }

  function applyMethodologiesTarget(ctx, target) {
    var t = target || {};
    if (t.itemId) {
      if (!web().recordIn(methodologiesOf(ctx.pack).items || [], t.itemId)) ctx.fail('unknown-item', 'Metodología desconocida: ' + t.itemId, { field: 'itemId' });
      ctx.state.app.methodSelection = t.itemId;
    }
    return { itemId: ctx.state.app.methodSelection };
  }

  var commands = {

    selectTab: function (ctx, payload) {
      var tabId = assertTab(ctx, requireString(ctx, payload, 'tabId'));
      var app = ctx.state.app;
      if (app.activeTab === tabId) return { tabId: tabId, changed: false };
      var paused = leaveTab(ctx, app.activeTab, tabId);
      app.activeTab = tabId;
      return { tabId: tabId, changed: true, paused: paused };
    },

    selectAccessProfile: function (ctx, payload) {
      var profileId = requireString(ctx, payload, 'profileId');
      return switchProfile(ctx, profileId);
    },

    useAnalystProfile: function (ctx, payload) {
      var list = profiles(ctx.pack);
      var admin = (payload && payload.profileId && profileOf(ctx.pack, payload.profileId)) ||
        list.filter(function (p) { return p.accessRole === 'admin'; })[0];
      if (!admin) ctx.fail('unknown-profile', 'No hay un perfil de analista en el pack', { field: 'profileId' });
      var result = switchProfile(ctx, admin.id);
      result.analyst = true;
      return result;
    },

    openAbout: function (ctx) {
      ctx.state.app.aboutOpen = true;
      return { aboutOpen: true };
    },

    closeAbout: function (ctx) {
      ctx.state.app.aboutOpen = false;
      return { aboutOpen: false };
    },

    openModal: function (ctx, payload) {
      var modal = payload && payload.modal ? payload.modal : payload;
      if (!modal || typeof modal !== 'object' || typeof modal.kind !== 'string' || !modal.kind) {
        ctx.fail('invalid-payload', 'El modal necesita un kind', { field: 'modal' });
      }
      ctx.state.app.modal = JSON.parse(JSON.stringify(modal));
      return { modal: ctx.state.app.modal };
    },

    closeModal: function (ctx) {
      ctx.state.app.modal = null;
      return { modal: null };
    },

    pushToast: function (ctx, payload) {
      var text = requireString(ctx, payload, 'text');
      var tone = payload.tone || 'neutral';
      if (TOAST_TONES.indexOf(tone) === -1) ctx.fail('invalid-tone', 'Tono de aviso no válido: ' + tone, { field: 'tone' });
      var toast = { id: ctx.uid('toast'), text: text, tone: tone };
      if (payload.messageId) toast.messageId = payload.messageId;
      var toasts = ctx.state.app.toasts;
      toasts.push(toast);
      while (toasts.length > TOAST_LIMIT) toasts.shift();
      return { id: toast.id };
    },

    dismissToast: function (ctx, payload) {
      var id = requireString(ctx, payload, 'id');
      var toasts = ctx.state.app.toasts;
      var before = toasts.length;
      ctx.state.app.toasts = toasts.filter(function (t) { return t.id !== id; });
      return { id: id, removed: before !== ctx.state.app.toasts.length };
    },

    requestReset: function (ctx) {
      if (ctx.store.hasUnsavedWork(ctx.state)) {
        ctx.state.app.modal = { kind: 'reset-confirm' };
        return { confirmRequired: true, reset: false };
      }
      return performReset(ctx);
    },

    resetDemo: function (ctx, payload) {
      if (!(payload && payload.force) && ctx.store.hasUnsavedWork(ctx.state)) {
        ctx.state.app.modal = { kind: 'reset-confirm' };
        return { confirmRequired: true, reset: false };
      }
      return performReset(ctx);
    },

    navigateTo: function (ctx, payload) {
      var target = payload && payload.target ? payload.target : payload;
      if (!target || typeof target !== 'object') ctx.fail('invalid-target', 'Destino de navegación no válido', { field: 'target' });
      var tab = assertTab(ctx, requireString(ctx, target, 'tab', 'invalid-target'));
      var app = ctx.state.app;
      var h = web();
      var result = { tab: tab, applied: true };

      if (tab === 'web') {
        var resolved = h.resolveWebTarget(ctx, target.web || {});
        if (!resolved.ok && resolved.restricted) {
          ctx.state.web.notice = h.restrictedNotice(ctx, resolved.restricted);
          leaveTab(ctx, app.activeTab, tab);
          app.activeTab = tab;
          app.focusReturn = { focusKey: 'tabpanel-heading:' + tab };
          return { tab: tab, applied: false, restricted: true, messageId: ctx.state.web.notice.messageId };
        }
        if (!resolved.ok) {
          var msg12 = ctx.format.msg('MSG-12');
          ctx.fail('invalid-target', typeof msg12 === 'string' ? msg12 : msg12.text, { messageId: 'MSG-12', reason: resolved.reason });
        }
        result.web = h.applyWebTarget(ctx, resolved);
      } else if (tab === 'desktop') {
        result.desktop = applyDesktopTarget(ctx, target.desktop);
      } else if (tab === 'architecture') {
        result.architecture = applyArchitectureTarget(ctx, target.architecture);
      } else if (tab === 'scope') {
        result.scope = applyScopeTarget(ctx, target.scope);
      } else if (tab === 'methodologies') {
        result.methodologies = applyMethodologiesTarget(ctx, target.methodologies);
      }

      leaveTab(ctx, app.activeTab, tab);
      app.activeTab = tab;
      app.focusReturn = { focusKey: 'tabpanel-heading:' + tab };
      return result;
    },

    setFocusReturn: function (ctx, payload) {
      var value = payload ? (payload.focusReturn !== undefined ? payload.focusReturn : payload.focusKey) : null;
      if (value === null || value === undefined || value === '') { ctx.state.app.focusReturn = null; return { focusReturn: null }; }
      if (typeof value === 'string') ctx.state.app.focusReturn = { focusKey: value };
      else if (typeof value === 'object' && typeof value.focusKey === 'string') ctx.state.app.focusReturn = JSON.parse(JSON.stringify(value));
      else ctx.fail('invalid-payload', 'focusReturn no válido', { field: 'focusReturn' });
      return { focusReturn: ctx.state.app.focusReturn };
    },

    setScroll: function (ctx, payload) {
      var tabId = assertTab(ctx, requireString(ctx, payload, 'tabId'));
      var top = payload.top;
      if (typeof top !== 'number' || !isFinite(top)) ctx.fail('invalid-payload', 'Posición de scroll no válida', { field: 'top' });
      ctx.state.app.scroll[tabId] = Math.max(0, Math.round(top));
      return { tabId: tabId, top: ctx.state.app.scroll[tabId] };
    },

    setArchitectureSelection: function (ctx, payload) {
      var nodeId = payload && payload.nodeId !== undefined && payload.nodeId !== '' ? payload.nodeId : null;
      if (nodeId !== null && !web().recordIn(solutionNodes(ctx.pack), nodeId)) {
        ctx.fail('unknown-node', 'Componente desconocido: ' + nodeId, { field: 'nodeId' });
      }
      ctx.state.app.architectureSelection = nodeId;
      return { nodeId: nodeId };
    },

    setArchitectureListMode: function (ctx, payload) {
      var on = !!(payload && payload.on);
      ctx.state.app.architectureListMode = on;
      return { listMode: on };
    },

    setScopeFilter: function (ctx, payload) {
      var filterId = requireString(ctx, payload, 'filterId');
      var filters = (scopeOf(ctx.pack).filters || []).map(function (f) { return f.id; });
      if (filters.indexOf(filterId) === -1) ctx.fail('invalid-filter', 'Filtro de alcance desconocido: ' + filterId, { field: 'filterId' });
      ctx.state.app.scopeFilter = filterId;
      return { filter: filterId };
    },

    selectScopeItem: function (ctx, payload) {
      var id = payload && payload.id !== undefined && payload.id !== '' ? payload.id : null;
      if (id !== null && !web().recordIn(scopeOf(ctx.pack).items || [], id)) {
        ctx.fail('unknown-item', 'Elemento de alcance desconocido: ' + id, { field: 'id' });
      }
      ctx.state.app.scopeSelection = id;
      return { id: id };
    },

    selectMethod: function (ctx, payload) {
      var id = payload && payload.id !== undefined && payload.id !== '' ? payload.id : null;
      if (id !== null && !web().recordIn(methodologiesOf(ctx.pack).items || [], id)) {
        ctx.fail('unknown-item', 'Metodología desconocida: ' + id, { field: 'id' });
      }
      ctx.state.app.methodSelection = id;
      return { id: id };
    }
  };

  return {
    commands: commands,
    helpers: {
      tabs: tabs,
      profiles: profiles,
      profileOf: profileOf,
      sanitizeWebForProfile: sanitizeWebForProfile
    }
  };
});
