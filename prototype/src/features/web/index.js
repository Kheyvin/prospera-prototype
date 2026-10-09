/* features/web — tab 4 «Prototipo web», the TwinWorkspace (spec §8, §10.4, §14.3, §15;
 * CONTRACTS §7, §10, §13; design-system.md §10.1).
 *
 * mount(panelEl, ctx) builds the twin layout once: rail (levels / representations / depth /
 * layers / security entry), context bar (back, breadcrumbs, profile, search, list toggle),
 * notices, the process-view tabs and one stage host per stage module (orgchart, processmap,
 * relations, areaspace, processsheet, flow, instruction, compare, incidents, projects,
 * security), the complementary inspector and the overlays (history, documents, sources).
 * The active stage is derived from state.web; only the active host is rendered and shown,
 * hidden hosts keep their DOM (cameras, scroll, forms). Rendering happens only while the
 * panel is visible; a change that arrives while the tab is hidden is applied when the tab
 * becomes active (after the shell has unhidden the panel). Escape: top overlay → focused
 * search → inspector → relation focus, never a jump across levels. */
Primus.module('features/web', function (require) {
  'use strict';

  var STAGES = ['orgchart', 'processmap', 'relations', 'areaspace', 'processsheet', 'flow', 'instruction', 'compare', 'incidents', 'projects', 'security'];

  function stageFor(web) {
    if (!web) return 'orgchart';
    if (web.module === 'security') return 'security';
    if (web.level === 'tactical') return 'areaspace';
    if (web.level === 'operational') {
      if (!web.processId) return 'processsheet';
      if (web.processView === 'flow') return web.activityKey ? 'instruction' : 'flow';
      if (web.processView === 'compare') return 'compare';
      if (web.processView === 'incidents') return 'incidents';
      if (web.processView === 'projects') return 'projects';
      return 'processsheet';
    }
    if (web.representation === 'processmap') return 'processmap';
    if (web.representation === 'relations') return 'relations';
    return 'orgchart';
  }

  return {
    id: 'web',
    stageFor: stageFor,

    mount: function (panelEl, ctx) {
      var dom = ctx.dom;
      var h = dom.h;
      var atoms = ctx.atoms;
      var molecules = ctx.molecules;
      var store = ctx.store;
      var ui = ctx.ui || {};
      var fallbacks = (function () { try { return require('core/selectors').UI_FALLBACKS || {}; } catch (e) { return {}; } })();
      var canvasApi = require('components/twin/canvas');

      function t(key, fallback) {
        var v = ui[key];
        if (v !== undefined && v !== null && typeof v !== 'object') return v;
        if (fallbacks[key] !== undefined) return fallbacks[key];
        return fallback === undefined ? key : fallback;
      }
      function dispatch(type, payload) { return ctx.dispatch(type, payload || {}); }

      panelEl.classList.add('panel--fill');
      var railOpen = false;

      /* Stage ctx: the stage modules receive the feature ctx plus the shared canvas API and
         the current state (mutated in place so cached references stay valid). */
      var stageCtx = Object.assign({}, ctx, { canvas: canvasApi, state: store.getState() });

      /* ---------- shell parts ---------- */

      var rail = require('components/twin/rail').createRail(Object.assign({}, ctx, { onCloseRail: function () { setRailOpen(false); } }));
      rail.el.id = 'twin-rail';
      var contextbar = require('components/twin/contextbar').createContextbar(Object.assign({}, ctx, { onToggleRail: function () { setRailOpen(!railOpen); } }));
      var inspector = require('components/twin/inspector').createInspector(ctx);
      var overlays = require('components/twin/history').createOverlays(ctx);

      var noticesEl = h('div', { class: 'twin-notices', hidden: true });
      var tabsEl = h('div', { class: 'twin-process-tabs', hidden: true });
      var hosts = {};
      var stageBody = h('div', { class: 'twin-stage__hosts' });
      STAGES.forEach(function (id) {
        hosts[id] = h('div', { class: 'twin-stage__host', 'data-stage': id, hidden: true });
        stageBody.appendChild(hosts[id]);
      });
      var stageEl = h('div', { class: 'twin-stage', 'data-testid': 'twin-stage' }, noticesEl, tabsEl, stageBody);

      var railBackdrop = h('button', { type: 'button', class: 'twin-rail__backdrop', 'aria-label': t('close', 'Cerrar'), tabindex: '-1', on: { click: function () { setRailOpen(false); } } });
      var inspectorBackdrop = h('button', { type: 'button', class: 'twin-inspector__backdrop', 'aria-label': t('closeInspector', 'Cerrar ficha'), tabindex: '-1', on: { click: function () { dispatch('closeInspector'); } } });
      var inspectorAside = h('aside', { class: 'twin-inspector', 'data-testid': 'inspector', 'aria-label': t('inspector', 'Inspector') }, h('div', { class: 'twin-inspector__inner' }, inspector.el));

      var twin = h('div', { class: 'twin', 'data-testid': 'twin' }, railBackdrop, rail.el, contextbar.el, stageEl, inspectorBackdrop, inspectorAside);
      dom.replace(panelEl, twin);

      function setRailOpen(open) {
        railOpen = !!open;
        twin.classList.toggle('is-rail-open', railOpen);
        contextbar.update(store.getState(), { railOpen: railOpen });
        if (railOpen) dom.focusFirst(rail.el);
      }

      /* ---------- notices + process tabs ---------- */

      var noticeKey = null;
      function renderNotices(state) {
        var n = state.web.notice;
        var key = JSON.stringify(n);
        if (key === noticeKey) return;
        noticeKey = key;
        dom.preserveFocus(noticesEl, function () {
          dom.clear(noticesEl);
          if (n && n.text) {
            noticesEl.appendChild(molecules.notice({
              text: n.text, tone: n.tone || (n.kind === 'restricted' ? 'warning' : 'info'), testid: 'web-notice', role: n.kind === 'restricted' ? 'alert' : 'status',
              action: n.action ? { label: n.action, testid: 'web-notice-action', onClick: function () { if (n.command && n.command.type) dispatch(n.command.type, n.command.payload || {}); else dispatch('backToOrganization'); dispatch('dismissNotice'); } } : null,
              onDismiss: function () { dispatch('dismissNotice'); }, dismissLabel: t('closeNotice', 'Cerrar aviso')
            }));
            dom.announce(n.text);
          }
          noticesEl.hidden = !(n && n.text);
        });
      }

      var tabsKey = null;
      function renderTabs(context) {
        var show = context.module !== 'security' && context.level === 'operational' && !!context.processId;
        var key = JSON.stringify(show ? context.processViews.map(function (v) { return [v.id, v.label, v.selected, v.enabled, v.reason]; }) : null);
        if (key === tabsKey) return;
        tabsKey = key;
        dom.preserveFocus(tabsEl, function () {
          dom.clear(tabsEl);
          tabsEl.hidden = !show;
          if (!show) return;
          var tabs = molecules.tabs({ id: 'process-views', mode: 'local', singlePanel: true, selectedId: context.processView, ariaLabel: t('process', 'Proceso') + ' · ' + (context.process ? context.process.name : ''),
            tabs: context.processViews.map(function (v) { return { id: v.id, label: v.label, testid: v.testid, focusKey: 'process-view:' + v.id, disabled: !v.enabled }; }),
            onSelect: function (id) { var v = context.processViews.filter(function (x) { return x.id === id; })[0]; if (v && v.enabled && !v.selected) dispatch('setProcessView', { view: id }); } });
          Array.prototype.forEach.call(tabs.el.querySelectorAll('[role="tab"]'), function (tab) {
            var id = tab.getAttribute('data-tab-id') || (tab.id || '').replace('process-views-tab-', '');
            var v = context.processViews.filter(function (x) { return x.id === id; })[0];
            if (v && !v.enabled && v.reason) tab.setAttribute('title', v.reason);
          });
          tabsEl.appendChild(tabs.el);
        });
      }

      /* ---------- stage routing ---------- */

      var activeStage = null;
      var panelAttrsKey = null;
      /* The visible host doubles as the tabpanel of the selected process-view tab (one panel at a time). */
      function syncPanelAttrs(state, id) {
        var web = state.web;
        var show = web.module !== 'security' && web.level === 'operational' && !!web.processId;
        var key = show ? id + ':' + web.processView : null;
        if (key === panelAttrsKey) return;
        panelAttrsKey = key;
        STAGES.forEach(function (s) {
          var host = hosts[s];
          if (show && s === id) {
            host.id = 'process-views-panel-' + web.processView;
            host.setAttribute('role', 'tabpanel');
            host.setAttribute('aria-labelledby', 'process-views-tab-' + web.processView);
          } else {
            host.removeAttribute('id');
            host.removeAttribute('role');
            host.removeAttribute('aria-labelledby');
          }
        });
      }
      function renderStage(state) {
        var id = stageFor(state.web);
        if (activeStage !== id) {
          STAGES.forEach(function (s) { hosts[s].hidden = s !== id; });
          activeStage = id;
          stageBody.setAttribute('data-active-stage', id);
        }
        syncPanelAttrs(state, id);
        var mod = null;
        try { mod = Primus.has('features/web/' + id) ? Primus.require('features/web/' + id) : null; } catch (e) { console.error('features/web: stage ' + id + ' failed to load', e); mod = null; }
        if (!mod || typeof mod.render !== 'function') {
          if (!hosts[id].firstChild) hosts[id].appendChild(molecules.emptyState({ text: t('noData', 'No hay información disponible para esta vista'), icon: 'warning' }));
          return;
        }
        try { mod.render(hosts[id], stageCtx); } catch (e) { console.error('features/web: stage ' + id + ' failed to render', e); }
      }

      /* ---------- full render ---------- */

      var lastSelectionOpen = null;
      function render(state) {
        stageCtx.state = state;
        var context;
        try { context = ctx.select('currentContext'); } catch (e) { context = null; }
        twin.classList.toggle('twin--security', state.web.module === 'security');
        twin.classList.toggle('twin--no-inspector', state.web.module === 'security');
        inspectorAside.hidden = state.web.module === 'security';
        rail.update(state);
        contextbar.update(state, { railOpen: railOpen });
        renderNotices(state);
        if (context) renderTabs(context);
        renderStage(state);
        inspector.update(state);
        var open = !!state.web.selection && state.web.module !== 'security';
        if (open !== lastSelectionOpen) { lastSelectionOpen = open; twin.classList.toggle('is-inspector-open', open); }
        overlays.update(state);
      }

      function visible() { return !panelEl.hidden && !(panelEl.closest && panelEl.closest('[hidden]')); }

      var pending = false;
      function scheduleRender() {
        if (pending) return;
        pending = true;
        Promise.resolve().then(function () {
          pending = false;
          var state = store.getState();
          if (state.app.activeTab !== 'web' || !visible()) return;
          render(state);
        });
      }

      var dirty = true;
      store.subscribe(function (state, info) {
        if (state.app.activeTab !== 'web') { dirty = true; return; }
        if (visible()) { render(state); dirty = false; return; }
        /* Tab just selected: the shell unhides the panel after this listener. */
        dirty = false;
        scheduleRender();
      });

      var initial = store.getState();
      if (initial.app.activeTab === 'web' && visible()) { render(initial); dirty = false; }
      else scheduleRender();

      /* Re-render when the panel becomes visible for any reason (e.g. the shell re-shows it). */
      if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(function () { if (dirty && visible() && store.getState().app.activeTab === 'web') { dirty = false; render(store.getState()); } });
        ro.observe(panelEl);
      }

      /* ---------- Escape chain (spec §14.3) ---------- */

      panelEl.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' && event.key !== 'Esc') return;
        if (event.defaultPrevented) return;
        if (document.querySelector('#primus-overlays .modal-backdrop')) return;         // top overlay closes itself
        var active = document.activeElement;
        if (active && active.closest && active.closest('.search-field') && active.value) return; // search molecule clears itself
        if (railOpen) { event.preventDefault(); setRailOpen(false); return; }
        var state = store.getState();
        if (active && inspector.el.contains(active)) return;                               // inspector handles its own Escape
        if (state.web.selection) { event.preventDefault(); dispatch('closeInspector'); return; }
        if (state.web.highlightRootId) { event.preventDefault(); dispatch('setHighlightRoot', { entityId: null }); return; }
        if (state.web.search && state.web.search.open) { event.preventDefault(); dispatch('clearSearch'); }
      });
    }
  };
});
