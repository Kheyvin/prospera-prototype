/* components/twin/contextbar — breadcrumbs, back actions, profile selector, search and list
 * toggle of the twin (spec §8, §14.2, WEB-01; CONTRACTS §7.2, §11).
 *
 * createContextbar(ctx) → { el, update(state) }. Reads `select('currentContext')`,
 * `select('breadcrumbs')`, `select('profile')` and `select('searchResults')`. The search
 * input is debounced (≤ 150 ms) through store.timers; results are a keyboard-operable list
 * of entity links (Enter opens the inspector); Escape with text clears the search (handled
 * by the search molecule). Result counts are announced through dom.announce. */
Primus.module('components/twin/contextbar', function (require) {
  'use strict';

  var dom = require('core/dom');
  var SEARCH_DEBOUNCE_MS = 120;

  function createContextbar(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var fallbacks = (function () { try { return require('core/selectors').UI_FALLBACKS || {}; } catch (e) { return {}; } })();
    var store = ctx.store;
    var keys = {};
    var searchTimer = null;
    var announced = null;
    var railOpen = false;

    function t(key, fallback) {
      var v = ui[key];
      if (v !== undefined && v !== null && typeof v !== 'object') return v;
      if (fallbacks[key] !== undefined) return fallbacks[key];
      return fallback === undefined ? key : fallback;
    }

    function dispatch(type, payload) {
      if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload || {});
      return store.dispatch(type, payload || {});
    }

    function isKeyboard(event) {
      if (!event) return false;
      if (event.type === 'keydown' || event.type === 'keyup') return true;
      return event.type === 'click' && event.detail === 0;
    }

    var navEl = h('div', { class: 'twin-contextbar__nav' });
    var profileEl = h('div', { class: 'twin-contextbar__profile' });
    var searchEl = h('div', { class: 'twin-contextbar__search' });
    var resultsEl = h('div', { class: 'twin-search-results', id: 'web-search-results-panel', hidden: true });
    var toolsEl = h('div', { class: 'twin-contextbar__tools' });
    var el = h('div', { class: 'twin-contextbar', role: 'navigation', 'aria-label': t('breadcrumbs', 'Ruta de navegación') }, navEl, profileEl, searchEl, toolsEl, resultsEl);

    /* ---------- nav: rail toggle, back, breadcrumbs, level label ---------- */

    function renderNav(context, crumbs) {
      var items = crumbs.map(function (c) {
        return { label: c.label, testid: c.testid, onClick: c.target ? function () { if (typeof ctx.navigate === 'function') ctx.navigate(c.target); else dispatch('navigateTo', { target: c.target }); } : null };
      });
      var canBack = context.canBack || context.canBackToOrganization || context.module === 'security';
      dom.replace(navEl,
        atoms.iconButton({ icon: 'menu', ariaLabel: t('moduleNavigation', 'Navegación del módulo'), variant: 'secondary', extraClass: 'twin-rail__toggle', testid: 'rail-toggle', focusKey: 'contextbar:rail-toggle',
          expanded: railOpen, controls: 'twin-rail', onClick: function () { if (typeof ctx.onToggleRail === 'function') ctx.onToggleRail(); } }),
        atoms.iconButton({ icon: 'back', ariaLabel: t('back', 'Volver'), testid: 'context-back', focusKey: 'contextbar:back', disabled: !canBack,
          onClick: function () { dispatch('contextBack', {}); } }),
        atoms.iconButton({ icon: 'home', ariaLabel: t('backToOrganization', 'Volver al inicio de la organización'), testid: 'back-to-org', focusKey: 'contextbar:home', disabled: !context.canBackToOrganization,
          onClick: function () { dispatch('backToOrganization', {}); } }),
        h('div', { class: 'twin-contextbar__crumbs' }, molecules.breadcrumbs({ ariaLabel: t('breadcrumbs', 'Ruta de navegación'), items: items })),
        h('span', { class: 'twin-contextbar__level badge badge--neutral', 'data-testid': 'context-level' }, context.module === 'security' ? context.securityLabel : context.levelLabel));
    }

    /* ---------- profile ---------- */

    function renderProfile(profile) {
      dom.replace(profileEl,
        h('label', { class: 'text-sm muted', for: 'profile-select' }, profile.selectorLabel || t('profileSelector', 'Simular acceso como')),
        atoms.select({ id: 'profile-select', testid: 'profile-select', focusKey: 'contextbar:profile', value: profile.id || '', size: 'sm',
          options: profile.options.map(function (o) { return { value: o.id, label: o.label }; }),
          onChange: function (value) { if (value && value !== profile.id) dispatch('selectAccessProfile', { profileId: value }); } }));
    }

    /* ---------- search ---------- */

    var searchField = null;

    function scheduleQuery(value) {
      var timers = store.timers;
      if (timers && typeof timers.set === 'function') {
        if (searchTimer !== null) timers.clear(searchTimer);
        searchTimer = timers.set(function () { searchTimer = null; dispatch('setSearch', { query: value }); }, SEARCH_DEBOUNCE_MS, 'ui:web-search');
      } else {
        dispatch('setSearch', { query: value });
      }
    }

    function clearQuery() {
      if (store.timers && searchTimer !== null) { store.timers.clear(searchTimer); searchTimer = null; }
      dispatch('clearSearch', {});
    }

    function buildSearch(search) {
      searchField = molecules.searchField({
        id: 'web-search', testid: 'web-search', clearTestid: 'web-search-clear', resultsTestid: 'web-search-results',
        label: search.label || t('search', 'Buscar'), placeholder: search.placeholder || t('searchPlaceholder', 'Buscar por nombre, tipo o ID'),
        value: search.query || '', resultsText: search.query && search.query.trim() ? search.text : ' ',
        controls: 'web-search-results-panel', expanded: !!search.open,
        onInput: function (value) { scheduleQuery(value); },
        onClear: function () { clearQuery(); if (searchField.control) searchField.control.value = ''; },
        onKeydown: function (event) {
          if (event.key === 'ArrowDown' && !resultsEl.hidden) {
            var first = resultsEl.querySelector('.entity-link, .checkbox input, button');
            if (first) { event.preventDefault(); first.focus(); }
          }
        }
      });
      searchField.control.setAttribute('data-focus-key', 'contextbar:search');
      dom.replace(searchEl, searchField);
    }

    function syncSearch(search) {
      if (!searchField) { buildSearch(search); return; }
      var input = searchField.control;
      var active = typeof document !== 'undefined' ? document.activeElement : null;
      if (input && active !== input && input.value !== (search.query || '')) input.value = search.query || '';
      var clearBtn = searchField.querySelector('.search-field__clear');
      if (clearBtn) clearBtn.hidden = !(input && input.value);
      var results = searchField.querySelector('.search-field__results');
      if (results) dom.setText(results, search.query && search.query.trim() ? search.text : '');
      if (input) input.setAttribute('aria-expanded', search.open ? 'true' : 'false');
    }

    function renderResults(search) {
      if (!search.open || !(search.query || '').trim()) {
        resultsEl.hidden = true;
        dom.clear(resultsEl);
        return;
      }
      var list = search.results.map(function (r) {
        var focusKey = 'search-result:' + r.id;
        return h('li', { class: 'list__item' }, molecules.entityLink({
          entity: { id: r.id, name: r.name, type: r.type }, typeLabel: r.typeLabel, icon: r.icon, showType: true, compact: true,
          testid: 'search-result-' + r.id, focusKey: focusKey, versionId: r.versionId || null,
          meta: r.matchedOn && r.matchedOn !== 'name' ? r.matchedOn : null,
          onOpen: function (entity, event) {
            if (isKeyboard(event) && store.hasCommand && store.hasCommand('setFocusReturn')) dispatch('setFocusReturn', { focusKey: focusKey });
            dispatch(r.command.type, r.command.payload);
          }
        }));
      });
      var versionsToggle = atoms.checkbox({ id: 'web-search-versions', label: search.includeVersionsLabel || t('searchIncludeVersions', 'Versiones'), checked: !!search.includeVersions, testid: 'web-search-versions', focusKey: 'contextbar:search-versions',
        onChange: function (checked) { dispatch('setSearchIncludeVersions', { on: checked }); } });
      var empty = search.empty ? molecules.emptyState({ text: search.empty.text, compact: true, icon: 'search', testid: 'web-search-empty',
        action: search.empty.action ? { label: search.empty.action.label, testid: 'web-search-clear-filters', onClick: function () { dispatch(search.empty.action.command.type, search.empty.action.command.payload); clearQuery(); if (searchField && searchField.control) searchField.control.value = ''; } } : null }) : null;
      dom.replace(resultsEl,
        h('div', { class: 'twin-search-results__header cluster cluster--between' },
          h('span', { class: 'text-sm', id: 'web-search-results-title' }, (search.resultsLabel || t('searchResultsLabel', 'Resultados de búsqueda')) + ' · ' + search.text),
          h('div', { class: 'cluster cluster--sm' }, versionsToggle,
            atoms.button({ label: search.clearLabel || t('clearSearch', 'Limpiar búsqueda'), variant: 'ghost', size: 'sm', icon: 'close', testid: 'web-search-clear-results', onClick: function () { clearQuery(); if (searchField && searchField.control) searchField.control.value = ''; } }))),
        list.length ? h('ul', { class: 'list list--plain twin-search-results__list', role: 'list', 'aria-labelledby': 'web-search-results-title' }, list) : empty);
      resultsEl.hidden = false;
    }

    /* ---------- tools ---------- */

    function renderTools(context) {
      dom.replace(toolsEl,
        context.areaFilter ? atoms.chip({ label: t('filterByArea', 'Filtrar por área') + ': ' + (context.areas.filter(function (a) { return a.id === context.areaFilter; })[0] || {}).label, icon: 'filter', removeLabel: t('removeAreaFilter', 'Quitar filtro de área'), removeTestid: 'web-area-filter-clear', onRemove: function () { dispatch('setAreaFilter', { areaId: null }); } }) : null,
        context.module !== 'security' && context.level === 'strategic' && context.representation === 'relations' ? atoms.select({ id: 'web-area-filter', testid: 'web-area-filter', ariaLabel: t('filterByArea', 'Filtrar por área'), size: 'sm', value: context.areaFilter || '',
          options: [{ value: '', label: t('allAreas', 'Todas las áreas') }].concat(context.areas.map(function (a) { return { value: a.id, label: a.label }; })),
          onChange: function (value) { dispatch('setAreaFilter', { areaId: value || null }); } }) : null,
        context.module !== 'security' ? atoms.iconButton({ icon: context.listMode ? 'map' : 'list', ariaLabel: context.listMode ? t('mapView', 'Ver como mapa') : t('listView', 'Ver como lista'), pressed: !!context.listMode, testid: 'web-list-toggle', focusKey: 'contextbar:list-toggle',
          onClick: function () { dispatch('setListMode', { on: !context.listMode }); } }) : null);
    }

    /* ---------- update ---------- */

    function update(state, options) {
      var o = options || {};
      if (typeof o.railOpen === 'boolean') railOpen = o.railOpen;
      var context, crumbs, profile, search;
      try {
        context = ctx.select('currentContext');
        crumbs = ctx.select('breadcrumbs');
        profile = ctx.select('profile');
        search = ctx.select('searchResults');
      } catch (e) { return; }
      dom.preserveFocus(el, function () {
        var k = JSON.stringify({ c: crumbs, l: context.levelLabel, m: context.module, b: context.canBack, o: context.canBackToOrganization, r: railOpen });
        if (k !== keys.nav) { keys.nav = k; renderNav(context, crumbs); }
        k = JSON.stringify({ id: profile.id, options: profile.options });
        if (k !== keys.profile) { keys.profile = k; renderProfile(profile); }
        syncSearch(search);
        k = JSON.stringify({ q: search.query, open: search.open, results: search.results.map(function (r) { return [r.id, r.name, r.versionId]; }), v: search.includeVersions, e: search.empty });
        if (k !== keys.results) { keys.results = k; renderResults(search); }
        k = JSON.stringify({ m: context.module, l: context.level, r: context.representation, list: context.listMode, af: context.areaFilter, areas: context.areas });
        if (k !== keys.tools) { keys.tools = k; renderTools(context); }
      });
      if (search.open && (search.query || '').trim() && search.text !== announced) {
        announced = search.text;
        dom.announce(search.text);
      } else if (!search.open) {
        announced = null;
      }
    }

    function focusSearch() {
      if (searchField && searchField.control) { try { searchField.control.focus(); } catch (e) { /* ignore */ } }
    }

    function destroy() {
      if (store.timers && searchTimer !== null) store.timers.clear(searchTimer);
    }

    return { el: el, update: update, focusSearch: focusSearch, destroy: destroy };
  }

  return { createContextbar: createContextbar };
});
