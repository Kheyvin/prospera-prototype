/* features/web/compare — «Comparar versiones» (spec WEB-06 comparison, FR-014, JRN-05).
 * Two columns «AS-IS documentado» / «TO-BE propuesto» (paired cards below 768 px through the
 * .twin-compare CSS), the five prescribed rows, the TO-BE selector (TO-BE 2 / TO-BE 3 when
 * it exists), the TO-BE 1 notice (incomplete, never publishable), the recorded diff of demo
 * versions («Comparar con base») or the source summary for references, and the footer. */
Primus.module('features/web/compare', function (require) {
  'use strict';

  var caches = new WeakMap();

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ }
    return fallback;
  }
  function json(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function run(ctx, command) {
    if (!command) return null;
    if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') return ctx.navigate(command.payload && command.payload.target ? command.payload.target : command.payload);
    return ctx.dispatch(command.type, command.payload || {});
  }

  function versionCard(ctx, v, label, extra) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    if (!v) return atoms.card({ title: label, headingLevel: 3, quiet: true, children: [h('p', { class: 'muted' }, t(ctx, 'noData'))] });
    var badges = [atoms.badge({ label: v.typeLabel, tone: 'neutral', icon: false })];
    if (v.stateLabel) badges.push(atoms.badge({ label: v.stateLabel, tone: v.isDemo ? 'demo' : (v.state === 'proposed' ? 'proposed' : 'neutral') }));
    if (v.isCurrentAsIs) badges.push(atoms.badge({ label: v.currentLabel, tone: 'brand', icon: false }));
    if (v.adoptionLabel) badges.push(atoms.badge({ label: v.adoptionLabel, tone: 'demo' }));
    return atoms.card({ title: label, subtitle: v.label, headingLevel: 3, id: 'compare-' + v.id, children: [h('div', { class: 'stack stack--sm' },
      h('div', { class: 'cluster cluster--sm' }, badges),
      ctx.molecules.keyValue({ missingText: ctx.format.missing(), rows: [{ label: t(ctx, 'summary', 'Resumen'), value: v.summary }, { label: t(ctx, 'date', 'Fecha') + ' · ' + t(ctx, 'responsible', 'Responsable'), value: v.publishedAtText ? v.publishedAtText + ' · ' + (v.publishedBy || ctx.format.missing()) : null }, { label: t(ctx, 'sources', 'Fuentes'), value: v.sources.map(function (s) { return s.id; }).join(' · ') || null }] }),
      extra || null)] });
  }

  function body(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms, molecules = ctx.molecules;
    if (!model.process) return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, molecules.emptyState({ text: t(ctx, 'selectProcess'), icon: 'process' }));
    if (!model.available) {
      var u = model.unavailable || {};
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, molecules.notice({ text: u.text || t(ctx, 'noData'), tone: 'warning', role: 'alert', testid: 'compare-unavailable', action: u.notice && u.notice.cta ? { label: u.notice.cta.label, onClick: function () { run(ctx, u.notice.cta.command); } } : null }));
    }
    var selector = model.options.length > 1 ? h('div', { class: 'twin-versionbar' }, h('div', { class: 'twin-versionbar__group', role: 'group', 'aria-label': t(ctx, 'toBeExplainer', 'Así se propone trabajar') },
      h('span', { class: 'twin-versionbar__label' }, t(ctx, 'versionTypeToBe', 'TO-BE')),
      model.options.map(function (o) { return atoms.button({ label: o.label, variant: o.selected ? 'secondary' : 'ghost', size: 'sm', pressed: !!o.selected, testid: 'compare-option-' + o.id, focusKey: 'compare:option:' + o.id, icon: o.isDemo ? 'flag' : 'version', onClick: function () { if (!o.selected) run(ctx, o.command); } }); }))) : null;
    var table = molecules.table({ id: 'compare-table', testid: 'compare-table', caption: model.title, captionHidden: true, rowHeaders: true,
      columns: [{ id: 'label', label: t(ctx, 'change', 'Aspecto'), rowHeader: true }, { id: 'asIs', label: model.columns[0] || t(ctx, 'versionTypeAsIs') }, { id: 'toBe', label: model.columns[1] || t(ctx, 'versionTypeToBe') }],
      rows: model.rows.map(function (r, i) { return { key: i, cells: [{ text: r.label }, { text: r.asIs }, { text: r.toBe }] }; }), sort: null, cardMode: true, emptyText: t(ctx, 'noData') });
    var diff = model.baseDiff ? atoms.card({ title: model.baseDiff.label, headingLevel: 3, id: 'compare-diff', children: [h('div', { class: 'stack stack--sm', 'data-testid': 'compare-diff' },
      h('p', { class: 'text-sm muted' }, t(ctx, 'baseVersion', 'Versión base') + ': ' + (model.baseDiff.baseVersionId || ctx.format.missing())),
      model.baseDiff.rows.map(function (r) { return h('div', { class: 'review__diff' }, h('div', { class: 'review__diff-cell' }, h('span', { class: 'review__diff-label' }, t(ctx, 'before', 'Antes') + ' · ' + r.label), h('p', { class: 'review__diff-text' }, r.before || ctx.format.missing())), h('div', { class: 'review__diff-cell review__diff-cell--after' }, h('span', { class: 'review__diff-label' }, t(ctx, 'after', 'Después')), h('p', { class: 'review__diff-text' }, r.after || ctx.format.missing()))); }),
      model.baseDiff.notes.length ? h('ul', { class: 'list' }, model.baseDiff.notes.map(function (n) { return h('li', { class: 'list__item' }, n); })) : null,
      model.baseDiff.pending.length ? h('div', null, h('h4', { class: 'inspector__section-title' }, t(ctx, 'pendingItems', 'Pendientes')), h('ul', { class: 'list' }, model.baseDiff.pending.map(function (p) { return h('li', { class: 'list__item' }, atoms.badge({ label: t(ctx, 'pendingValidation', 'Por validar'), tone: 'warning', icon: false }), ' ', p); }))) : null)] }) : null;
    var summary = model.sourceSummary ? atoms.card({ title: t(ctx, 'sourceSummary', 'Resumen de la fuente'), headingLevel: 3, quiet: true, id: 'compare-source-summary', children: [h('div', { class: 'stack stack--sm', 'data-testid': 'compare-source-summary' },
      molecules.keyValue({ missingText: ctx.format.missing(), rows: [{ label: t(ctx, 'summary', 'Resumen'), value: model.sourceSummary.summary }, { label: t(ctx, 'change', 'Cambio'), value: model.sourceSummary.changeLabel }, { label: t(ctx, 'sources', 'Fuentes'), value: model.sourceSummary.sources.map(function (s) { return s.id + ' · ' + s.title; }).join(' · ') || null }] }),
      model.sourceSummary.pending.length ? h('ul', { class: 'list' }, model.sourceSummary.pending.map(function (p) { return h('li', { class: 'list__item' }, p); })) : null)] }) : null;
    var toBe1 = model.toBe1 ? molecules.notice({ tone: 'info', testid: 'compare-tobe1', title: model.toBe1.version.label, text: h('span', null, model.toBe1.message || '', model.toBe1.items.length ? h('ul', { class: 'list' }, model.toBe1.items.map(function (i) { return h('li', { class: 'list__item' }, i); })) : null, ' ', atoms.badge({ label: t(ctx, 'notPublishable', 'No publicable en la demo'), tone: 'warning', icon: false })) }) : null;
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'stack stack--md', 'data-testid': 'compare' },
      selector,
      h('div', { class: 'twin-compare' }, h('div', { class: 'twin-compare__column' }, versionCard(ctx, model.asIs, model.columns[0] || t(ctx, 'versionTypeAsIs'))), h('div', { class: 'twin-compare__column' }, versionCard(ctx, model.toBe, model.columns[1] || t(ctx, 'versionTypeToBe')))),
      table,
      model.footer ? h('p', { class: 'panel-note', 'data-testid': 'compare-footer' }, model.footer) : null,
      diff, summary, toBe1));
  }

  function header(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var icons = { 'open-flow': 'process', 'view-sheet': 'document', history: 'history' };
    return h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'compare-title' }, model.title || t(ctx, 'compareVersions')),
        h('p', { class: 'twin-stage__subtitle' }, model.process ? model.process.name : '')),
      model.process ? h('div', { class: 'twin-stage__controls' }, (model.actions || []).map(function (a) { return atoms.button({ label: a.label, variant: 'ghost', size: 'sm', icon: icons[a.id] || null, testid: 'compare-action-' + a.id, focusKey: 'compare:action:' + a.id, disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason || null : null, onClick: function () { run(ctx, a.command); } }); })) : null);
  }

  function render(stageEl, ctx) {
    var model = ctx.select('compareModel');
    var dom = ctx.dom;
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.root)) {
      cache = { root: dom.h('div', { class: 'twin-compare-stage twin-stage__fill' }), keys: {}, header: dom.h('div'), body: dom.h('div', { class: 'twin-stage__fill' }) };
      cache.root.appendChild(cache.header); cache.root.appendChild(cache.body);
      stageEl.appendChild(cache.root);
      caches.set(stageEl, cache);
    }
    var hk = json({ t: model.title, p: model.process && model.process.id, a: model.actions });
    if (hk !== cache.keys.header) { cache.keys.header = hk; dom.preserveFocus(cache.root, function () { dom.replace(cache.header, header(ctx, model)); }); }
    var bk = json(model);
    if (bk !== cache.keys.body) { cache.keys.body = bk; dom.preserveScroll(cache.body.firstChild, function () { dom.preserveFocus(cache.root, function () { dom.replace(cache.body, body(ctx, model)); }); }); }
  }

  return { id: 'compare', render: render };
});
