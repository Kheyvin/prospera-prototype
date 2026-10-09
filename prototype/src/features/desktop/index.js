/* features/desktop — tab 5 «Prototipo de escritorio», the AnalystStudio (spec §10.5,
 * DESK-01…04, FR-019…024, JRN-06/08/10; design-system.md §10.2).
 *
 * mount(panelEl, ctx) builds the studio once: frame (title + permanent «Claude Code ·
 * Simulado» disclaimer), workspace roster, context chips, the local «Conversación» /
 * «Operaciones» tabs with the playback controls, the stream or the operations table, the
 * composer dock and the status footer; the side panel holds evidence, the SCN-02 form, the
 * review panel (R-01 / R-02) and the artifact preview. Everything renders
 * `select('desktopModel')` and writes through commands. Rendering happens only while the
 * panel is visible; the shell pauses running playback when the tab is hidden. */
Primus.module('features/desktop', function (require) {
  'use strict';

  return {
    id: 'desktop',

    mount: function (panelEl, ctx) {
      var dom = ctx.dom;
      var h = dom.h;
      var molecules = ctx.molecules;
      var icons = ctx.icons;
      var store = ctx.store;
      var ui = ctx.ui || {};
      function t(key, fallback) { return typeof ui[key] === 'string' && ui[key] ? ui[key] : fallback; }
      function dispatch(type, payload) { return ctx.dispatch(type, payload || {}); }

      panelEl.classList.add('panel--fill');

      var roster = require('components/analyst/roster').createRoster(ctx);
      var chips = require('components/analyst/contextchips').createChips(ctx);
      var stream = require('components/analyst/stream').createStream(ctx);
      var operations = require('components/analyst/operations').createOperations(ctx);
      var composer = require('components/analyst/composer').createComposer(ctx);
      var evidence = require('components/analyst/evidence').createEvidence(ctx);
      var review = require('components/analyst/review').createReviewPanel(ctx);
      var scenarioUi = require('features/desktop/scenario-ui');
      var playback = scenarioUi.createPlaybackControls(ctx);
      var scenarioForm = scenarioUi.createScenarioForm(ctx);
      var artifact = scenarioUi.createArtifactPreview(ctx);

      var desktopPack = (ctx.pack.raw && ctx.pack.raw.desktop) || {};
      var titleEl = h('h2', { class: 'studio-frame__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:desktop', 'data-testid': 'studio-title' }, icons.icon('window'), ' ', desktopPack.title || '');
      var frame = h('div', { class: 'studio-frame' }, titleEl, h('span', { class: 'studio-frame__spacer' }), h('span', { class: 'studio-frame__disclaimer', 'data-testid': 'studio-disclaimer' }, icons.icon('flag'), ' ', desktopPack.disclaimer || ''));

      var tabsHost = h('div', { class: 'studio-tabs__list' });
      var tabsEl = h('div', { class: 'studio-tabs' }, tabsHost, playback.el);
      var streamPanel = h('div', { class: 'studio-main__panel', 'data-mode': 'chat' }, stream.el);
      var opsPanel = h('div', { class: 'studio-main__panel', 'data-mode': 'ops', hidden: true }, operations.el);
      var footer = h('div', { class: 'studio-footer', 'data-testid': 'studio-footer' });
      var main = h('div', { class: 'studio-main' }, chips.el, tabsEl, streamPanel, opsPanel, composer.el, footer);

      var sideTitle = h('h3', { class: 'studio-side__title sr-only', id: 'studio-side-title' }, desktopPack.regions && desktopPack.regions.panel ? desktopPack.regions.panel : t('sources', 'Fuentes'));
      var navNote = h('div', { class: 'studio-side__section', hidden: true, 'data-testid': 'studio-navigation-note' });
      var side = h('aside', { class: 'studio-side', 'aria-labelledby': 'studio-side-title' }, sideTitle, navNote, review.el, scenarioForm.el, artifact.el, evidence.el);

      var studio = h('div', { class: 'studio', 'data-testid': 'studio' }, frame, roster.el, main, side);
      dom.replace(panelEl, studio);

      /* ---------- regions ---------- */

      var tabsKey = null;
      var tabsApi = null;
      function renderTabs(model) {
        var key = JSON.stringify({ m: model.session.mode, modes: model.modes, s: model.sessionId });
        if (key === tabsKey) return;
        tabsKey = key;
        dom.preserveFocus(tabsHost, function () {
          tabsApi = molecules.tabs({ id: 'studio-mode', mode: 'local', selectedId: model.session.mode, ariaLabel: desktopPack.regions && desktopPack.regions.conversation ? desktopPack.regions.conversation : t('menu', 'Modo'),
            tabs: model.modes.map(function (m) { return { id: m.id, label: m.label, testid: 'mode-' + m.id, focusKey: 'studio:mode:' + m.id }; }),
            onSelect: function (id) { if (id !== model.session.mode) dispatch('setSessionMode', { sessionId: model.sessionId, mode: id }); } });
          dom.replace(tabsHost, tabsApi.el);
          var chatAttrs = tabsApi.panelAttrs('chat');
          var opsAttrs = tabsApi.panelAttrs('ops');
          dom.setAttrs(streamPanel, { id: chatAttrs.id, role: 'tabpanel', 'aria-labelledby': chatAttrs['aria-labelledby'] });
          dom.setAttrs(opsPanel, { id: opsAttrs.id, role: 'tabpanel', 'aria-labelledby': opsAttrs['aria-labelledby'] });
        });
        streamPanel.hidden = model.session.mode !== 'chat';
        opsPanel.hidden = model.session.mode !== 'ops';
      }

      var footerKey = null;
      function renderFooter(model) {
        var key = JSON.stringify(model.footer);
        if (key === footerKey) return;
        footerKey = key;
        dom.replace(footer,
          h('span', { class: 'studio-footer__item' }, icons.icon('lock'), ' ', model.footer.sessionOnly || ''),
          model.footer.pendingReview ? [h('span', { class: 'studio-footer__sep', 'aria-hidden': 'true' }, '·'), h('span', { class: 'studio-footer__item is-pending', 'data-testid': 'studio-footer-pending' }, icons.icon('warning'), ' ', model.footer.pendingReview)] : null);
      }

      var navKey = null;
      function renderNavigationNote(model) {
        var nav = model.navigation;
        var key = JSON.stringify([nav, model.playback.scenarios.map(function (s) { return [s.id, s.available, s.reason]; })]);
        if (key === navKey) return;
        navKey = key;
        if (!nav || !nav.scenarioId) { navNote.hidden = true; dom.clear(navNote); return; }
        var sc = model.playback.scenarios.filter(function (s) { return s.id === nav.scenarioId; })[0];
        if (!sc) { navNote.hidden = true; dom.clear(navNote); return; }
        dom.replace(navNote, molecules.notice({ text: (nav.projectId ? nav.projectId + ' · ' : '') + sc.title + (!sc.available && sc.reason ? ' · ' + sc.reason : ''), tone: 'info', testid: 'studio-suggested', title: t('suggestedScenario', 'Escenario sugerido'),
          action: sc.available ? { label: sc.triggerLabel, testid: 'studio-suggested-start', onClick: function () { dispatch('startScenario', { sessionId: model.sessionId, scenarioId: sc.id }); } } : (sc.cta && sc.cta.command ? { label: sc.cta.label, testid: 'studio-suggested-cta', onClick: function () { dispatch(sc.cta.command.type, sc.cta.command.payload || {}); } } : null) }));
        navNote.hidden = false;
      }

      function render(state) {
        var model;
        try { model = ctx.select('desktopModel'); } catch (e) { console.error('features/desktop: desktopModel failed', e); model = null; }
        if (!model) return;
        roster.update(model);
        chips.update(model);
        renderTabs(model);
        playback.update(model);
        if (model.session.mode === 'ops') operations.update(model); else stream.update(model);
        composer.update(model);
        renderFooter(model);
        renderNavigationNote(model);
        review.update(model);
        scenarioForm.update(model);
        artifact.update(model);
        evidence.update(model);
        studio.classList.toggle('studio--readonly', !!model.readOnly);
      }

      function visible() { return !panelEl.hidden && !(panelEl.closest && panelEl.closest('[hidden]')); }

      var pending = false;
      function scheduleRender() {
        if (pending) return;
        pending = true;
        Promise.resolve().then(function () {
          pending = false;
          var state = store.getState();
          if (state.app.activeTab !== 'desktop' || !visible()) return;
          render(state);
        });
      }

      var dirty = true;
      store.subscribe(function (state) {
        if (state.app.activeTab !== 'desktop') { dirty = true; return; }
        if (visible()) { render(state); dirty = false; return; }
        dirty = false;
        scheduleRender();
      });
      var initial = store.getState();
      if (initial.app.activeTab === 'desktop' && visible()) { render(initial); dirty = false; } else scheduleRender();
      if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(function () { if (dirty && visible() && store.getState().app.activeTab === 'desktop') { dirty = false; render(store.getState()); } });
        ro.observe(panelEl);
      }
    }
  };
});
