/* main.js — bootstrap of the portable prototype (CONTRACTS §1, §10, §13; spec §8, §14.3,
 * §14.4, §15, FR-001/002/025, JRN-11).
 *
 * The only file that touches the DOM at load time: it reads the embedded pack from
 * #primus-pack, validates and resolves it (MSG-13 on failure), creates the store, builds the
 * feature ctx, mounts header / tabbar / about / reset / notices / toasts, mounts every feature
 * exactly once into its panel and keeps panels alive when hidden (state, scroll, drafts and
 * cameras persist). It also owns the cross-cutting behaviours: focusReturn after a
 * navigation, 5 s toast timers through store.timers, per-tab scroll preservation
 * (setScroll), visibilitychange → pauseScenario, and the global keyboard shortcut
 * Ctrl/Cmd+K (focus the web search). Escape handling belongs to the owning components. */
(function () {
  'use strict';

  var FATAL_TEXT = 'Error de contenido: referencia no válida'; // MSG-13 fallback when the pack itself cannot be parsed
  var TOAST_MS = 5000;
  var TOAST_TAG = 'toast';
  var HEADING_PREFIX = 'tabpanel-heading:';

  function byId(id) { return document.getElementById(id); }

  function tryRequire(id) {
    if (!Primus.has(id)) return null;
    try { return Primus.require(id); } catch (e) { console.error('main: cannot load module ' + id, e); return null; }
  }

  /* Visible, pack-independent failure (spec MSG-13). Nothing else is mounted. */
  function renderFatal(text) {
    var main = byId('primus-main') || document.body;
    while (main.firstChild) main.removeChild(main.firstChild);
    var box = document.createElement('div');
    box.className = 'notice notice--danger';
    box.setAttribute('role', 'alert');
    box.setAttribute('data-testid', 'fatal-error');
    var p = document.createElement('p');
    p.className = 'notice__text';
    p.textContent = text;
    box.appendChild(p);
    main.appendChild(box);
    var tabs = byId('primus-tabs');
    if (tabs) tabs.hidden = true;
  }

  function readPack() {
    var script = byId('primus-pack');
    var raw = script ? script.textContent : '';
    var packObject = null;
    try {
      packObject = JSON.parse(raw);
    } catch (e) {
      console.error('main: the embedded pack is not valid JSON', e);
      return { ok: false, text: FATAL_TEXT };
    }
    if (!packObject || typeof packObject !== 'object') return { ok: false, text: FATAL_TEXT };
    var msg13 = packObject.messages && typeof packObject.messages['MSG-13'] === 'string' ? packObject.messages['MSG-13'] : FATAL_TEXT;

    var validator = tryRequire('schemas/pack-validator');
    if (validator && typeof validator.validatePack === 'function') {
      try {
        var verdict = validator.validatePack(packObject);
        if (verdict && verdict.ok === false) {
          console.error('main: pack validation failed', verdict.errors);
          return { ok: false, text: msg13 };
        }
      } catch (e) {
        console.error('main: pack validator threw', e);
        return { ok: false, text: msg13 };
      }
    }

    var packCore = tryRequire('core/pack');
    if (!packCore || typeof packCore.resolvePack !== 'function') return { ok: false, text: msg13 };
    try {
      return { ok: true, pack: packCore.resolvePack(packObject) };
    } catch (e) {
      console.error('main: resolvePack failed', e);
      return { ok: false, text: msg13 };
    }
  }

  function boot() {
    var read = readPack();
    if (!read.ok) { renderFatal(read.text); return; }
    var pack = read.pack;

    var storeCore = Primus.require('core/store');
    var dom = Primus.require('core/dom');
    var atoms = Primus.require('ds/atoms');
    var molecules = Primus.require('ds/molecules');
    var icons = Primus.require('ds/icons');
    var store = storeCore.createStore({ pack: pack });

    atoms.setTexts(pack.ui);

    var texts = pack.texts || {};
    if (typeof texts.windowTitle === 'string' && texts.windowTitle) document.title = texts.windowTitle;

    var ctx = {
      store: store,
      pack: pack,
      graph: store.graph,
      permissions: store.permissions,
      format: store.format,
      dom: dom,
      atoms: atoms,
      molecules: molecules,
      icons: icons,
      ui: pack.ui || {},
      navigate: function (target) { return store.dispatch('navigateTo', { target: target }); },
      select: function () { return store.select.apply(store, arguments); },
      dispatch: function (type, payload) { return store.dispatch(type, payload === undefined ? {} : payload); }
    };

    var appEl = byId('primus-app');
    var headerHost = byId('primus-header');
    var tabsHost = byId('primus-tabs');
    var mainEl = byId('primus-main');
    var toastsHost = byId('primus-toasts');
    var tabIds = (texts.tabs || []).map(function (t) { return t.id; });

    /* ── Shell components ─────────────────────────────────────────────── */

    var header = Primus.require('components/shell/header').createHeader(ctx);
    header.regions.forEach(function (region) { headerHost.appendChild(region); });

    var tabbar = Primus.require('components/shell/tabbar').createTabbar(ctx);
    tabsHost.appendChild(tabbar.el);

    var notices = Primus.require('components/shell/notices').createNotices(ctx);
    mainEl.insertBefore(notices.el, mainEl.firstChild);

    var about = Primus.require('components/shell/about').createAbout(ctx);
    var resetDialog = Primus.require('components/shell/reset').createResetDialog(ctx);

    /* ── Panels and features (mounted exactly once; never unmounted) ──── */

    var panels = {};
    tabIds.forEach(function (tabId) {
      var panel = byId('panel-' + tabId);
      if (!panel) {
        panel = dom.h('section', { id: 'panel-' + tabId, role: 'tabpanel', 'aria-labelledby': 'tab-' + tabId, tabindex: '0', hidden: true });
        mainEl.appendChild(panel);
      }
      panels[tabId] = panel;
      var feature = tryRequire('features/' + tabId);
      if (!feature || typeof feature.mount !== 'function') {
        console.error('main: feature module features/' + tabId + ' is missing; panel left empty');
        return;
      }
      try {
        feature.mount(panel, ctx);
      } catch (e) {
        console.error('main: feature features/' + tabId + ' failed to mount', e);
      }
    });

    function showPanels(activeTab) {
      tabIds.forEach(function (tabId) {
        var panel = panels[tabId];
        if (!panel) return;
        var hidden = tabId !== activeTab;
        if (panel.hidden !== hidden) panel.hidden = hidden;
      });
    }

    /* ── Per-tab scroll preservation (FR-002) ─────────────────────────── */

    var currentTab = store.getState().app.activeTab;

    /* The scroll container of narrative tabs is #primus-main (web/desktop panels fill it and
       scroll internally, so their position is kept by their own DOM). The previous tab's
       position is read before the panels are swapped and stored through setScroll. */
    function saveScroll(tabId, top) {
      if (!tabId || store.isDispatching()) return;
      var saved = (store.getState().app.scroll || {})[tabId] || 0;
      if (Math.round(top) === saved) return;
      store.dispatch('setScroll', { tabId: tabId, top: top });
    }

    function restoreScroll(state, tabId) {
      var top = (state.app.scroll && state.app.scroll[tabId]) || 0;
      if (mainEl.scrollTop !== top) mainEl.scrollTop = top;
    }

    /* ── focusReturn (navigateTo, inspector close, …) ─────────────────── */

    function focusTarget(focusKey) {
      var target = null;
      try {
        target = document.querySelector('[data-focus-key="' + focusKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]');
      } catch (e) { target = null; }
      if (!target && focusKey.indexOf(HEADING_PREFIX) === 0) {
        var tabId = focusKey.slice(HEADING_PREFIX.length);
        var panel = panels[tabId];
        if (panel) {
          target = panel.querySelector('h1, h2, h3') || panel;
          if (target !== panel && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        }
      }
      if (!target || (target.closest && target.closest('[hidden]'))) return false;
      try { target.focus({ preventScroll: false }); } catch (e) { try { target.focus(); } catch (e2) { return false; } }
      return document.activeElement === target;
    }

    function handleFocusReturn(state) {
      var fr = state.app.focusReturn;
      if (!fr || typeof fr.focusKey !== 'string' || !fr.focusKey) return;
      if (store.isDispatching()) return;
      focusTarget(fr.focusKey);
      store.dispatch('setFocusReturn', { focusReturn: null });
    }

    /* ── Toasts (5 s auto-dismiss through store.timers) ───────────────── */

    var toastTimers = {};
    var lastToastsJson = null;

    /* store.timers collapses every delay to 0 ms under reduced motion (right for scenario
       steps, wrong for a toast the user must be able to read). In that case a plain timeout
       bound to the current timer generation is used, so a reset still invalidates it. */
    function scheduleToast(fn, ms) {
      var reduced = typeof store.timers.isReducedMotion === 'function' && store.timers.isReducedMotion();
      if (!reduced) return { kind: 'store', id: store.timers.set(fn, ms, TOAST_TAG) };
      var generation = store.timers.generation();
      var handle = window.setTimeout(function () {
        if (store.timers.generation() !== generation) return;
        fn();
      }, ms);
      return { kind: 'raw', id: handle };
    }

    function cancelToast(handle) {
      if (!handle) return;
      if (handle.kind === 'store') store.timers.clear(handle.id);
      else window.clearTimeout(handle.id);
    }

    function renderToasts(state) {
      var list = state.app.toasts || [];
      var json = JSON.stringify(list);
      if (json === lastToastsJson) return;
      lastToastsJson = json;
      dom.preserveFocus(toastsHost, function () {
        dom.replace(toastsHost, molecules.toasts({
          toasts: list,
          dismissLabel: ctx.ui.closeNotice,
          onDismiss: function (id) { store.dispatch('dismissToast', { id: id }); }
        }));
      });
      var present = {};
      list.forEach(function (toast) {
        present[toast.id] = true;
        if (toastTimers[toast.id]) return;
        toastTimers[toast.id] = scheduleToast(function () {
          delete toastTimers[toast.id];
          var still = (store.getState().app.toasts || []).some(function (t) { return t.id === toast.id; });
          if (still) store.dispatch('dismissToast', { id: toast.id });
        }, TOAST_MS);
      });
      Object.keys(toastTimers).forEach(function (id) {
        if (present[id]) return;
        cancelToast(toastTimers[id]);
        delete toastTimers[id];
      });
    }

    /* ── Store subscription (after features so they render first) ─────── */

    function render(state, info) {
      var activeTab = state.app.activeTab;
      var wasReset = !!(info && info.result && info.result.reset === true);
      if (activeTab !== currentTab) {
        var previous = currentTab;
        var previousTop = mainEl.scrollTop;
        currentTab = activeTab;
        showPanels(activeTab);
        restoreScroll(state, activeTab);
        if (!wasReset) saveScroll(previous, previousTop);
      } else if (wasReset) {
        showPanels(activeTab);
        restoreScroll(state, activeTab);
      }
      header.update(state);
      tabbar.update(state);
      notices.update(state);
      renderToasts(state);
      about.update(state);
      resetDialog.update(state);
      handleFocusReturn(state);
    }

    var initialState = store.getState();
    showPanels(initialState.app.activeTab);
    render(initialState, { type: 'init' });
    store.subscribe(function (state, info) { render(state, info); });

    /* ── Hidden tab pauses running playback (FR-024, spec §8) ─────────── */

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'hidden') return;
      var sessions = store.getState().desktop.sessions || {};
      Object.keys(sessions).forEach(function (sessionId) {
        var playback = sessions[sessionId] && sessions[sessionId].playback;
        if (playback && playback.status === 'running') {
          store.dispatch('pauseScenario', { sessionId: sessionId, reason: 'hidden' });
        }
      });
    });

    /* ── Global keyboard: Ctrl/Cmd+K focuses the web search on the web tab ─ */

    document.addEventListener('keydown', function (event) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      if (event.key !== 'k' && event.key !== 'K') return;
      if (store.getState().app.activeTab !== 'web') return;
      if (appEl && appEl.querySelector('.modal-backdrop.is-open')) return;
      var panel = panels.web;
      var search = panel && (panel.querySelector('[data-testid="web-search"]') || panel.querySelector('input[type="search"]'));
      if (!search) return;
      if (search.tagName !== 'INPUT') search = search.querySelector('input') || search;
      event.preventDefault();
      try { search.focus(); } catch (e) { /* ignore */ }
      if (typeof search.select === 'function') { try { search.select(); } catch (e2) { /* ignore */ } }
    });

    /* ── Errors are reported, never swallowed silently ─────────────────── */

    window.addEventListener('error', function (event) {
      console.error('PRIMUS: error no controlado', event.error || event.message);
    });
    window.addEventListener('unhandledrejection', function (event) {
      console.error('PRIMUS: promesa rechazada sin control', event.reason);
    });

    if (appEl) appEl.setAttribute('data-ready', 'true');
    window.Primus.app = { store: store, ctx: ctx };
  }

  function start() {
    try {
      boot();
    } catch (e) {
      console.error('main: bootstrap failed', e);
      renderFatal(FATAL_TEXT);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
