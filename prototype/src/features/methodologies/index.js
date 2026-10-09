/* features/methodologies — tab 3 «Metodologías aplicadas» (spec §10.3, FR-005; CONTRACTS §13).
 *
 * Three groups (applied → reference → excluded) of method cards: name, status label, the
 * useful question as a prominent line, usage text, scope mapping chips, evidence and limit,
 * «Ver ejemplo» when an example target exists and the optional external reference, which is
 * the only <a> in the application (rel="noopener", target="_blank"). No logos, no claims of
 * full framework implementation: every string comes from pack.methodologies. */
Primus.module('features/methodologies', function () {
  'use strict';

  var ID = 'methodologies';
  var FOCUS_KEY = 'tabpanel-heading:' + ID;

  /* Status badge per group: text + distinct glyph (never colour only). */
  var GROUP_STYLE = {
    applied: { tone: 'success', icon: 'check' },
    reference: { tone: 'info', icon: 'info' },
    excluded: { tone: 'neutral', icon: 'minus' }
  };

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function mount(panelEl, ctx) {
    var dom = ctx.dom;
    var atoms = ctx.atoms;
    var molecules = ctx.molecules;
    var icons = ctx.icons;
    var format = ctx.format;
    var store = ctx.store;
    var pack = ctx.pack;
    var h = dom.h;
    var methodologies = pack.methodologies || (pack.raw && pack.raw.methodologies) || {};
    var scope = pack.scope || (pack.raw && pack.raw.scope) || {};
    var ui = ctx.ui || pack.ui || {};
    var groups = Array.isArray(methodologies.groups) ? methodologies.groups : [];
    var items = Array.isArray(methodologies.items) ? methodologies.items : [];
    var scopeById = {};
    (Array.isArray(scope.items) ? scope.items : []).forEach(function (item) { scopeById[item.id] = item; });

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

    /* ── Cards ──────────────────────────────────────────────────────────── */

    function renderExternalReference(item, ref) {
      if (!ref || !ref.url || !ref.label) return null;
      var label = str(ref.label);
      return h('a', {
        class: 'external-link',
        href: str(ref.url),
        target: '_blank',
        rel: 'noopener',
        'aria-label': t('externalReference', 'Abrir referencia externa') + ': ' + label,
        'data-testid': 'method-reference-' + item.id
      },
      icons.icon('externalLink', { extraClass: 'external-link__icon' }),
      ' ',
      h('span', { class: 'external-link__label' }, label));
    }

    function renderScopeChips(item) {
      var ids = Array.isArray(item.scopeItemIds) ? item.scopeItemIds : [];
      if (!ids.length) return null;
      return h('div', { class: 'record-card__meta', 'data-testid': 'method-scope-' + item.id },
        h('span', { class: 'text-sm muted' }, t('relatedScope', 'Alcance relacionado') + ':'),
        ids.map(function (scopeId) {
          var sc = scopeById[scopeId];
          return atoms.chip({
            label: scopeId,
            icon: 'link',
            attrs: { title: sc ? str(sc.title) : null, 'data-scope-ref': scopeId }
          });
        }));
    }

    function renderItem(item, selection) {
      var style = GROUP_STYLE[item.group] || { tone: 'neutral', icon: null };
      var sourceIds = Array.isArray(item.sourceIds) ? item.sourceIds : [];
      var actions = [];

      if (item.example && item.example.target) {
        actions.push(atoms.button({
          label: str(item.example.label || t('viewInWeb', 'Ver ejemplo')),
          variant: 'primary',
          size: 'sm',
          icon: 'forward',
          testid: 'method-example-' + item.id,
          focusKey: 'method-example:' + item.id,
          onClick: function () {
            dispatch('selectMethod', { id: item.id });
            navigate(item.example.target);
          }
        }));
      }
      var external = renderExternalReference(item, item.externalReference);
      if (external) actions.push(external);

      var card = atoms.card({
        as: 'article',
        id: 'method-' + item.id,
        eyebrow: item.id,
        title: str(item.name),
        headingLevel: 4,
        selected: selection === item.id,
        current: true,
        testid: 'method-' + item.id,
        attrs: { 'data-group': item.group, 'data-method-id': item.id },
        children: h('div', { class: 'record-card' },
          item.statusLabel ? h('div', { class: 'record-card__meta' },
            h('span', { class: 'sr-only' }, t('status', 'Estado') + ': '),
            atoms.badge({ label: str(item.statusLabel), tone: style.tone, icon: style.icon, attrs: { 'data-group': item.group } })) : null,
          item.question ? h('p', { class: 'record-card__question', 'data-testid': 'method-question-' + item.id }, str(item.question)) : null,
          item.usage ? h('p', { class: 'record-card__usage' }, str(item.usage)) : null,
          renderScopeChips(item),
          molecules.keyValue({
            rows: [
              { label: t('evidence', 'Evidencia'), value: item.evidence },
              { label: t('limit', 'Límite'), value: item.limit }
            ],
            missingText: format.missing()
          }),
          sourceIds.length ? atoms.provenance({
            sourceIds: sourceIds,
            sources: pack.sources,
            sourcesLabel: t('sources', 'Fuentes'),
            extraClass: 'record-card__sources'
          }) : null),
        actions: actions.length ? actions : null
      });
      var title = card.querySelector('.card__title');
      if (title) {
        title.setAttribute('tabindex', '-1');
        title.setAttribute('data-focus-key', 'method-item:' + item.id);
      }
      return card;
    }

    function renderGroup(group, selection) {
      var groupItems = items.filter(function (item) { return item.group === group.id; });
      if (!groupItems.length) return null;
      var titleId = 'method-group-' + group.id + '-title';
      return h('section', {
        class: 'narrative__section',
        'aria-labelledby': titleId,
        'data-testid': 'method-group-' + group.id,
        'data-group': group.id
      },
      h('h3', { class: 'narrative__section-title', id: titleId },
        str(group.label), ' ',
        h('span', { class: 'section-title__count text-sm muted tabular' }, countText(groupItems.length))),
      h('div', { class: 'narrative__grid narrative__grid--wide' },
        groupItems.map(function (item) { return renderItem(item, selection); })));
    }

    function renderFooter() {
      var lines = [];
      if (methodologies.referencesNote) lines.push(str(methodologies.referencesNote));
      (Array.isArray(methodologies.footer) ? methodologies.footer : []).forEach(function (line) { lines.push(str(line)); });
      if (methodologies.c4Note) lines.push(str(methodologies.c4Note));
      if (!lines.length) return null;
      return h('footer', { class: 'narrative__footer stack stack--sm', 'data-testid': 'method-footer' },
        lines.map(function (line, index) { return h('p', { 'data-footer-line': index }, line); }));
    }

    /* ── Static structure ───────────────────────────────────────────────── */

    var heading = h('h2', { class: 'narrative__title', tabindex: '-1', 'data-focus-key': FOCUS_KEY, id: 'methodologies-title' }, str(methodologies.title));
    var groupsEl = h('div', { class: 'stack stack--lg', 'data-testid': 'method-groups' });

    var page = h('div', { class: 'narrative', 'data-testid': 'methodologies-page' },
      h('header', { class: 'narrative__header' },
        heading,
        methodologies.intro ? h('p', { class: 'narrative__intro' }, str(methodologies.intro)) : null),
      groupsEl,
      renderFooter());

    dom.replace(panelEl, page);

    /* ── Render loop ────────────────────────────────────────────────────── */

    var lastKey = null;

    function buildModel(state) {
      var app = state.app || {};
      return { selection: app.methodSelection || null };
    }

    function render(state) {
      var model = buildModel(state);
      var key = JSON.stringify(model);
      if (key === lastKey) return;
      dom.preserveScroll(panelEl, function () {
        dom.preserveFocus(panelEl, function () {
          if (lastKey === null) {
            dom.replace(groupsEl, groups.map(function (group) { return renderGroup(group, model.selection); }));
          } else {
            /* Only the selection changed: toggle the outline in place, keep the DOM. */
            var cards = groupsEl.querySelectorAll('[data-method-id]');
            for (var i = 0; i < cards.length; i++) {
              var selected = cards[i].getAttribute('data-method-id') === model.selection;
              cards[i].classList.toggle('is-selected', selected);
              if (selected) cards[i].setAttribute('aria-current', 'true'); else cards[i].removeAttribute('aria-current');
            }
          }
        });
      });
      lastKey = key;
    }

    /* After navigateTo to this tab: focus the selected method (or the heading) and consume
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
        if (current.app.methodSelection) {
          target = panelEl.querySelector('[data-focus-key="method-item:' + current.app.methodSelection + '"]');
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

  return { id: ID, mount: mount, GROUP_STYLE: GROUP_STYLE };
});
