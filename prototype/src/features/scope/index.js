/* features/scope — tab 2 «Alcance del proyecto» (spec §10.2, FR-004, AT-03; CONTRACTS §13).
 *
 * Renders the scope items of the pack grouped by disposition (included → excluded → future →
 * undecided, then by ID), filtered by state.app.scopeFilter. Every visible string comes from
 * pack.scope or pack.presentation.ui. No progress percentages, no timeline. The only local UI
 * state is which detail disclosures are open; everything else lives in the store. */
Primus.module('features/scope', function () {
  'use strict';

  var ID = 'scope';
  var FOCUS_KEY = 'tabpanel-heading:' + ID;

  /* Disposition and coverage badges use different tones AND different glyphs so the two
   * facts never read alike (design.md: status is always text + shape). */
  var DISPOSITION_STYLE = {
    included: { tone: 'success', icon: 'check' },
    excluded: { tone: 'neutral', icon: 'close' },
    future: { tone: 'info', icon: 'clock' },
    undecided: { tone: 'warning', icon: 'warning' }
  };
  var COVERAGE_STYLE = {
    interactive: { tone: 'brand', icon: 'play' },
    illustrated: { tone: 'info', icon: 'eye' },
    'not-demonstrated': { tone: 'neutral', icon: 'dot' }
  };

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  /* SC-01 … SC-20: numeric suffix first, then text. */
  function compareIds(a, b) {
    var sa = str(a);
    var sb = str(b);
    var ma = /(\d+)\s*$/.exec(sa);
    var mb = /(\d+)\s*$/.exec(sb);
    if (ma && mb && sa.slice(0, ma.index) === sb.slice(0, mb.index)) {
      return parseInt(ma[1], 10) - parseInt(mb[1], 10);
    }
    return sa < sb ? -1 : (sa > sb ? 1 : 0);
  }

  function mount(panelEl, ctx) {
    var dom = ctx.dom;
    var atoms = ctx.atoms;
    var molecules = ctx.molecules;
    var format = ctx.format;
    var store = ctx.store;
    var pack = ctx.pack;
    var h = dom.h;
    var scope = pack.scope || (pack.raw && pack.raw.scope) || {};
    var ui = ctx.ui || pack.ui || {};
    var labels = scope.labels || {};
    var dispositionLabels = scope.dispositionLabels || {};
    var coverageLabels = scope.coverageLabels || {};
    var filters = Array.isArray(scope.filters) ? scope.filters : [];
    var items = (Array.isArray(scope.items) ? scope.items : []).slice().sort(function (a, b) { return compareIds(a.id, b.id); });
    var itemById = {};
    items.forEach(function (item) { itemById[item.id] = item; });
    var groupOrder = Array.isArray(scope.groupOrder) && scope.groupOrder.length ? scope.groupOrder : Object.keys(dispositionLabels);

    var dispatch = typeof ctx.dispatch === 'function'
      ? ctx.dispatch
      : function (type, payload) { return store.dispatch(type, payload); };
    var navigate = typeof ctx.navigate === 'function'
      ? ctx.navigate
      : function (target) { return store.dispatch('navigateTo', { target: target }); };

    function t(key, fallback) {
      return typeof ui[key] === 'string' && ui[key] ? ui[key] : fallback;
    }

    function countText(n) {
      return format.interpolate(t('countItems', '{n} elementos'), { n: n });
    }

    /* Local UI state (not in the store): open detail disclosures per item. */
    var openDetails = {};

    /* ── Model ──────────────────────────────────────────────────────────── */

    function buildModel(state) {
      var app = state.app || {};
      var filter = app.scopeFilter || 'all';
      var selection = app.scopeSelection || null;
      var seen = {};
      var groups = [];
      function addGroup(gid) {
        if (seen[gid]) return;
        seen[gid] = true;
        var ids = items
          .filter(function (item) { return item.disposition === gid && (filter === 'all' || item.disposition === filter); })
          .map(function (item) { return item.id; });
        if (ids.length) groups.push({ id: gid, label: dispositionLabels[gid] || gid, items: ids });
      }
      groupOrder.forEach(addGroup);
      items.forEach(function (item) { addGroup(item.disposition); });
      var total = groups.reduce(function (sum, g) { return sum + g.items.length; }, 0);
      var open = Object.keys(openDetails).filter(function (id) { return openDetails[id]; }).sort();
      return { filter: filter, selection: selection, groups: groups, total: total, open: open };
    }

    /* ── Static regions ─────────────────────────────────────────────────── */

    var heading = h('h2', { class: 'narrative__title', tabindex: '-1', 'data-focus-key': FOCUS_KEY, id: 'scope-title' }, str(scope.title));
    var toolbarEl = h('div', {
      class: 'narrative__toolbar',
      role: 'group',
      'aria-label': t('filterScope', 'Filtrar por disposición'),
      'data-testid': 'scope-filters'
    });
    var listEl = h('div', { class: 'stack stack--lg', 'data-testid': 'scope-list' });

    function staticList(block, idPrefix) {
      if (!block || !Array.isArray(block.items) || !block.items.length) return null;
      var titleId = idPrefix + '-title';
      return h('section', { class: 'narrative__section', 'aria-labelledby': titleId, 'data-testid': idPrefix },
        h('h3', { class: 'narrative__section-title', id: titleId }, str(block.title)),
        h('div', { class: 'narrative__prose prose' },
          molecules.list({
            labelledBy: titleId,
            items: block.items.map(function (line, index) { return { key: index, node: str(line) }; })
          })));
    }

    var page = h('div', { class: 'narrative', 'data-testid': 'scope-page' },
      h('header', { class: 'narrative__header' },
        heading,
        scope.intro ? h('p', { class: 'narrative__intro' }, str(scope.intro)) : null),
      toolbarEl,
      listEl,
      staticList(scope.deliverables, 'scope-deliverables'),
      staticList(scope.clientContributions, 'scope-contributions'));

    dom.replace(panelEl, page);

    /* ── Toolbar (filters) ──────────────────────────────────────────────── */

    function filterLabel(filterId) {
      var f = filters.filter(function (x) { return x.id === filterId; })[0];
      return f ? str(f.label) : str(filterId);
    }

    function announceFilter(state) {
      var model = buildModel(state);
      var text = model.total
        ? filterLabel(model.filter) + ' · ' + countText(model.total)
        : str(scope.empty && scope.empty.text);
      dom.announce(text);
    }

    function setFilter(filterId) {
      var result = dispatch('setScopeFilter', { filterId: filterId });
      if (result && result.ok) announceFilter(store.getState());
      return result;
    }

    function renderToolbar(model) {
      dom.replace(toolbarEl,
        h('div', { class: 'cluster cluster--sm' }, filters.map(function (f) {
          var pressed = model.filter === f.id;
          return atoms.button({
            label: str(f.label),
            variant: pressed ? 'primary' : 'secondary',
            size: 'sm',
            pressed: pressed,
            testid: 'scope-filter-' + f.id,
            focusKey: 'scope-filter:' + f.id,
            onClick: function () { setFilter(f.id); }
          });
        })),
        h('p', { class: 'text-sm muted tabular', 'data-testid': 'scope-count' }, countText(model.total)));
    }

    /* ── Cards ──────────────────────────────────────────────────────────── */

    function labelledBadge(prefix, label, style, extraClass, dataAttrs) {
      return h('span', { class: ['record-card__badge', extraClass] },
        h('span', { class: 'sr-only' }, prefix + ': '),
        atoms.badge({ label: label, tone: style.tone, icon: style.icon, attrs: dataAttrs }));
    }

    function renderDetails(item, model) {
      var sourceIds = Array.isArray(item.sourceIds) ? item.sourceIds : [];
      var content = [
        molecules.keyValue({
          rows: [{ label: labels.acceptance || 'Criterio de entrega futura', value: item.acceptance }],
          missingText: format.missing()
        }),
        sourceIds.length ? atoms.provenance({
          sourceIds: sourceIds,
          sources: pack.sources,
          sourcesLabel: labels.sources || t('sources', 'Fuentes'),
          extraClass: 'record-card__sources'
        }) : null,
        item.detail ? h('p', { class: 'record-card__detail', 'data-testid': 'scope-detail-text-' + item.id }, str(item.detail)) : null
      ];
      return molecules.disclosure({
        id: 'scope-detail-' + item.id,
        summary: labels.detail || 'Detalle',
        open: model.open.indexOf(item.id) !== -1,
        testid: 'scope-detail-' + item.id,
        focusKey: 'scope-detail:' + item.id,
        content: content,
        onToggle: function (next) {
          openDetails[item.id] = !!next;
          if (next && model.selection !== item.id) dispatch('selectScopeItem', { id: item.id });
          render(store.getState());
        }
      });
    }

    function renderItem(item, model) {
      var disposition = DISPOSITION_STYLE[item.disposition] || { tone: 'neutral', icon: null };
      var coverage = COVERAGE_STYLE[item.coverage] || { tone: 'neutral', icon: null };
      var dependencyIds = Array.isArray(item.dependencyItemIds) ? item.dependencyItemIds : [];
      var selected = model.selection === item.id;

      var meta = h('div', { class: 'record-card__meta' },
        labelledBadge(labels.disposition || 'Disposición', dispositionLabels[item.disposition] || str(item.disposition),
          disposition, 'record-card__disposition', { 'data-disposition': item.disposition }),
        labelledBadge(labels.coverage || 'Cobertura', coverageLabels[item.coverage] || str(item.coverage),
          coverage, 'record-card__coverage', { 'data-coverage': item.coverage }));

      var dependencyValue = dependencyIds.length
        ? h('span', { class: 'cluster cluster--sm' },
          h('span', null, str(item.dependency)),
          dependencyIds.map(function (depId) {
            var dep = itemById[depId];
            return atoms.chip({ label: depId, icon: 'link', attrs: { title: dep ? str(dep.title) : null, 'data-scope-ref': depId } });
          }))
        : item.dependency;

      var facts = molecules.keyValue({
        rows: [
          { label: labels.dependency || 'Dependencia', value: dependencyValue },
          { label: labels.evidence || 'Evidencia', value: item.sourceLabel }
        ],
        missingText: format.missing()
      });

      var actions = [];
      if (item.target) {
        actions.push(atoms.button({
          label: str(scope.viewInDemo || t('viewInWeb', 'Ver en la demo')),
          variant: 'primary',
          size: 'sm',
          icon: 'forward',
          testid: 'scope-view-' + item.id,
          focusKey: 'scope-view:' + item.id,
          onClick: function () {
            dispatch('selectScopeItem', { id: item.id });
            navigate(item.target);
          }
        }));
      }
      if (item.targetNote) {
        actions.push(h('p', { class: 'text-sm muted record-card__note' }, str(item.targetNote)));
      }

      var card = atoms.card({
        as: 'article',
        id: 'scope-item-' + item.id,
        eyebrow: item.id,
        title: str(item.title),
        headingLevel: 4,
        selected: selected,
        current: true,
        testid: 'scope-item-' + item.id,
        attrs: { 'data-disposition': item.disposition, 'data-coverage': item.coverage, 'data-scope-id': item.id },
        children: h('div', { class: 'record-card' },
          item.description ? h('p', { class: 'record-card__description' }, str(item.description)) : null,
          meta,
          facts,
          renderDetails(item, model)),
        actions: actions.length ? actions : null
      });
      var title = card.querySelector('.card__title');
      if (title) {
        title.setAttribute('tabindex', '-1');
        title.setAttribute('data-focus-key', 'scope-item:' + item.id);
      }
      return card;
    }

    function renderGroup(group, model) {
      var titleId = 'scope-group-' + group.id + '-title';
      return h('section', {
        class: 'narrative__section',
        'aria-labelledby': titleId,
        'data-testid': 'scope-group-' + group.id,
        'data-disposition': group.id
      },
      h('h3', { class: 'narrative__section-title', id: titleId },
        str(group.label), ' ',
        h('span', { class: 'section-title__count text-sm muted tabular' }, countText(group.items.length))),
      h('div', { class: 'narrative__grid narrative__grid--wide' },
        group.items.map(function (id) { return renderItem(itemById[id], model); })));
    }

    function renderList(model) {
      if (!model.total) {
        dom.replace(listEl, molecules.emptyState({
          text: str(scope.empty && scope.empty.text),
          icon: 'filter',
          testid: 'scope-empty',
          action: {
            label: str((scope.empty && scope.empty.action) || t('showAll', 'Mostrar todo')),
            testid: 'scope-show-all',
            onClick: function () { setFilter('all'); }
          }
        }));
        return;
      }
      dom.replace(listEl, model.groups.map(function (group) { return renderGroup(group, model); }));
    }

    /* ── Render loop ────────────────────────────────────────────────────── */

    var lastToolbar = null;
    var lastList = null;

    function render(state) {
      var model = buildModel(state);
      var toolbarKey = JSON.stringify({ filter: model.filter, total: model.total });
      var listKey = JSON.stringify(model);
      if (toolbarKey === lastToolbar && listKey === lastList) return;
      dom.preserveScroll(panelEl, function () {
        dom.preserveFocus(panelEl, function () {
          if (toolbarKey !== lastToolbar) renderToolbar(model);
          if (listKey !== lastList) renderList(model);
        });
      });
      lastToolbar = toolbarKey;
      lastList = listKey;
    }

    /* After navigateTo to this tab: focus the selected item (or the heading) and consume
     * app.focusReturn. Runs in a microtask so the shell has un-hidden the panel first. */
    function maybeFocus(state, info) {
      if (!info || info.type !== 'navigateTo') return;
      if (!state.app || state.app.activeTab !== ID) return;
      var fr = state.app.focusReturn;
      if (!fr || fr.focusKey !== FOCUS_KEY) return;
      Promise.resolve().then(function () {
        var current = store.getState();
        if (!current.app || current.app.activeTab !== ID) return;
        var target = null;
        if (current.app.scopeSelection) {
          target = panelEl.querySelector('[data-focus-key="scope-item:' + current.app.scopeSelection + '"]');
        }
        if (!target) target = heading;
        if (typeof target.scrollIntoView === 'function') {
          try { target.scrollIntoView({ block: 'start' }); } catch (e) { /* ignore */ }
        }
        try { target.focus(); } catch (e) { /* ignore */ }
        if (current.app.focusReturn && current.app.focusReturn.focusKey === FOCUS_KEY) {
          dispatch('setFocusReturn', { focusReturn: null });
        }
      });
    }

    render(store.getState());
    var unsubscribe = store.subscribe(function (state, info) {
      render(state);
      maybeFocus(state, info);
    });

    return {
      el: page,
      render: function () { render(store.getState()); },
      destroy: function () { if (typeof unsubscribe === 'function') unsubscribe(); }
    };
  }

  return { id: ID, mount: mount, compareIds: compareIds, DISPOSITION_STYLE: DISPOSITION_STYLE, COVERAGE_STYLE: COVERAGE_STYLE };
});
