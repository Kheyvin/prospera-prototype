/* components/shell/tabbar — the five presentation tabs (spec §8, §14.3; ux.md §1).
 *
 * createTabbar(ctx) → { el, update(state) }. Wraps molecules.tabs in presentation mode with
 * manual activation (Arrow keys move focus, Home/End, Enter/Space select, Tab leaves). Tab
 * element ids are `tab-<id>` and panels `panel-<id>` to match shell.html. Selecting a tab
 * dispatches selectTab; update(state) mirrors app.activeTab onto the existing buttons
 * (aria-selected, roving tabindex, .is-selected) without rebuilding, so focus is kept. */
Primus.module('components/shell/tabbar', function (require) {
  'use strict';

  var molecules = require('ds/molecules');

  function createTabbar(ctx) {
    var pack = ctx.pack || {};
    var raw = pack.raw || {};
    var texts = pack.texts || raw.presentation || {};
    var ui = ctx.ui || pack.ui || {};
    var tabs = Array.isArray(texts.tabs) ? texts.tabs : [];
    var state = ctx.store && typeof ctx.store.getState === 'function' ? ctx.store.getState() : null;
    var initial = state && state.app ? state.app.activeTab : (tabs[0] && tabs[0].id);

    var tabsApi = molecules.tabs({
      id: 'primus-tablist',
      mode: 'presentation',
      ariaLabel: ui.presentationSections || 'Secciones de la presentación',
      selectedId: initial,
      tabElementId: function (id) { return 'tab-' + id; },
      panelElementId: function (id) { return 'panel-' + id; },
      tabs: tabs.map(function (tab) {
        return { id: tab.id, label: tab.label, testid: 'tab-' + tab.id, focusKey: 'tab:' + tab.id };
      }),
      onSelect: function (tabId) {
        ctx.dispatch('selectTab', { tabId: tabId });
      }
    });

    var el = tabsApi.el;
    var buttons = Array.prototype.slice.call(el.querySelectorAll('[role="tab"]'));
    var lastTab = initial;

    function update(nextState) {
      var active = nextState && nextState.app ? nextState.app.activeTab : null;
      if (active === lastTab) return;
      lastTab = active;
      buttons.forEach(function (btn) {
        var selected = btn.getAttribute('data-tab-id') === active;
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
        btn.setAttribute('tabindex', selected ? '0' : '-1');
        btn.classList.toggle('is-selected', selected);
      });
    }

    return {
      el: el,
      update: update,
      panelAttrs: tabsApi.panelAttrs,
      tabElementId: tabsApi.tabElementId,
      panelElementId: tabsApi.panelElementId,
      tabIds: tabs.map(function (tab) { return tab.id; })
    };
  }

  return { createTabbar: createTabbar };
});
