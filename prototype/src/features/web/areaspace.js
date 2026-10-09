/* features/web/areaspace — tactical «Espacio del área» stage (spec WEB-02, FR-007, JRN-02,
 * AT-05). A scrolling page with the five regions in the prescribed order: summary, positions,
 * «Procesos documentados», «Situaciones observadas» and «Incidencias y proyectos» (only when
 * the profile may see tracking). No gauges, no aggregate compliance, no invented process links:
 * areas without a detailed process show the pack's «noDetail» message. Opening a flow changes
 * the level to operational and keeps the tactical origin in the context history. */
Primus.module('features/web/areaspace', function (require) {
  'use strict';

  var caches = new WeakMap();

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ }
    return fallback;
  }
  function json(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function isKeyboard(event) { return !!event && (event.type === 'keydown' || event.type === 'keyup' || (event.type === 'click' && event.detail === 0)); }
  function run(ctx, command) {
    if (!command) return null;
    if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') return ctx.navigate(command.payload && command.payload.target ? command.payload.target : command.payload);
    return ctx.dispatch(command.type, command.payload || {});
  }

  function entityLink(ctx, ref, extra) {
    var o = extra || {};
    var focusKey = o.focusKey || ('node:' + ref.id);
    return ctx.molecules.entityLink({
      entity: { id: ref.id, name: ref.name, type: ref.type }, typeLabel: ref.typeLabel, icon: ref.icon || ref.type, showType: o.showType !== false, compact: !!o.compact,
      relationLabel: o.relationLabel || null, meta: o.meta || null, badge: o.badge || null, selected: !!o.selected, testid: o.testid || ('node-' + ref.id), focusKey: focusKey,
      onOpen: function (entity, event) {
        if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: focusKey });
        if (o.command) run(ctx, o.command); else ctx.dispatch('selectEntity', { entityId: ref.id });
      }
    });
  }

  function actionButton(ctx, a, extra) {
    var o = extra || {};
    return ctx.atoms.button({ label: a.label, variant: o.variant || 'secondary', size: 'sm', icon: o.icon || null, testid: o.testid || a.testid, focusKey: 'areaspace:' + (o.testid || a.testid),
      disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason || null : null, onClick: function () { run(ctx, a.command); } });
  }

  function sectionCard(ctx, section, children, extra) {
    return ctx.atoms.card({ title: section.title, headingLevel: 3, id: 'areaspace-' + section.id, children: children, quiet: !!(extra && extra.quiet) });
  }

  function summarySection(ctx, section, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var c = section.counts;
    return sectionCard(ctx, section, [
      h('div', { class: 'stack stack--sm' },
        section.badges.length || section.supportLabel ? h('div', { class: 'cluster cluster--sm' }, section.badges.map(function (b) { return atoms.badge({ label: b.label, tone: b.tone }); })) : null,
        section.description ? h('p', null, section.description) : h('p', { class: 'muted' }, ctx.format.missing()),
        h('div', { class: 'counts' }, h('span', { class: 'counts__item' }, c.positionsText), h('span', { class: 'counts__item' }, c.peopleText), c.externals ? h('span', { class: 'counts__item' }, c.externalsText) : null),
        model.neighbors && model.neighbors.length ? h('div', { class: 'stack stack--xs' }, h('span', { class: 'text-sm muted' }, t(ctx, 'neighborAreas', 'Áreas relacionadas por los procesos documentados')), h('div', { class: 'cluster cluster--sm' }, model.neighbors.map(function (n) { return entityLink(ctx, n, { compact: true, testid: 'areaspace-neighbor-' + n.id }); }))) : null,
        atoms.provenance({ labels: section.provenance.labels, confidence: section.provenance.confidence, dataState: section.provenance.dataState, sourceIds: section.provenance.sourceIds, sources: ctx.pack.sources, sourcesLabel: section.provenance.label }))
    ]);
  }

  function positionsSection(ctx, section, model) {
    var h = ctx.dom.h;
    var rows = section.positions.map(function (p) {
      var meta = p.occupancyNote || null;
      var badge = p.external ? (p.externalLabel || t(ctx, 'externalService', 'Servicio externo')) : null;
      var occupants = p.occupants.map(function (o) { return h('li', null, entityLink(ctx, o, { compact: true, meta: o.external ? (p.externalLabel || null) : null })); });
      var roles = p.roles.map(function (r) { return h('li', null, entityLink(ctx, r, { compact: true, relationLabel: t(ctx, 'rolInProcess', 'Rol en el proceso') })); });
      return h('li', { 'data-entity-id': p.id },
        h('div', { class: 'entity-list__row' }, entityLink(ctx, p.position, { meta: meta, badge: badge ? { label: badge, tone: 'neutral' } : null, selected: model.selectedId === p.id })),
        occupants.length || roles.length ? h('ul', { class: 'entity-list__tree', role: 'list' }, occupants, roles) : null);
    });
    return sectionCard(ctx, section, [rows.length ? h('div', { class: 'entity-list' }, h('ul', { class: 'entity-list__tree', role: 'list' }, rows)) : h('p', { class: 'muted' }, t(ctx, 'noData'))]);
  }

  function processesSection(ctx, section, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var cards = section.cards.map(function (c) {
      return atoms.card({
        as: 'article', headingLevel: 4, title: c.name, subtitle: c.ownerText, id: 'areaspace-process-' + c.id, selected: model.selectedId === c.id,
        children: [h('div', { class: 'stack stack--sm' }, c.statusText ? h('p', { class: 'text-sm' }, c.statusText) : null, h('div', { class: 'cluster cluster--sm' }, entityLink(ctx, c.process, { compact: true, relationLabel: c.role === 'owned' ? t(ctx, 'owner', 'Dueño') : t(ctx, 'participant', 'Participante'), testid: 'node-' + c.id })))],
        actions: c.actions.map(function (a, i) { return actionButton(ctx, a, { variant: i === 0 ? 'secondary' : 'primary', icon: a.id === 'open-flow' ? 'process' : 'document', testid: 'areaspace-' + a.id + '-' + c.id }); })
      });
    });
    return sectionCard(ctx, section, [cards.length ? h('div', { class: 'stack stack--sm' }, cards) : h('p', { class: 'muted', 'data-testid': 'areaspace-no-detail' }, section.noDetail)]);
  }

  function gapsSection(ctx, section) {
    var h = ctx.dom.h;
    return sectionCard(ctx, section, [section.gaps.length ? h('div', { class: 'inspector__links' }, section.gaps.map(function (g) { return entityLink(ctx, g, { meta: g.noteText, command: g.command }); })) : h('p', { class: 'muted' }, section.empty)]);
  }

  function trackingSection(ctx, section) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var s = section.summary;
    return sectionCard(ctx, section, [h('div', { class: 'stack stack--sm' },
      h('div', { class: 'counts' },
        h('span', { class: 'counts__item' }, t(ctx, 'processViewIncidents', 'Incidencias') + ': ' + section.incidentsText),
        s.incidents.overdue ? atoms.badge({ label: t(ctx, 'overdue', 'Vencidas') + ': ' + s.incidents.overdue, tone: 'danger' }) : null,
        s.incidents.dueSoon ? atoms.badge({ label: t(ctx, 'dueSoon', 'Por vencer') + ': ' + s.incidents.dueSoon, tone: 'warning' }) : null,
        h('span', { class: 'counts__item' }, t(ctx, 'processViewProjects', 'Proyectos de mejora') + ': ' + section.projectsText)),
      h('div', { class: 'cluster cluster--sm' }, section.actions.map(function (a) { return actionButton(ctx, a, { icon: a.id === 'incidents' ? 'incident' : 'project', testid: 'areaspace-' + a.id }); })))]);
  }

  function body(ctx, model) {
    var h = ctx.dom.h;
    if (model.restricted) {
      var n = model.notice || {};
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, ctx.molecules.notice({ text: n.text || ctx.format.msg('MSG-02').text, tone: 'warning', role: 'alert', testid: 'areaspace-restricted', action: { label: n.action || t(ctx, 'backToOrganization'), testid: 'areaspace-restricted-action', onClick: function () { ctx.dispatch('backToOrganization', {}); } } }));
    }
    if (!model.area) {
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'twin-sheet' }, h('div', { class: 'twin-sheet__main stack stack--md' },
        ctx.molecules.emptyState({ text: model.empty, icon: 'area', testid: 'areaspace-empty' }),
        ctx.atoms.field({ id: 'areaspace-select', label: t(ctx, 'selectArea', 'Selecciona un área'), control: ctx.atoms.select({ id: 'areaspace-select', testid: 'areaspace-select', focusKey: 'areaspace:select', value: '', options: [{ value: '', label: t(ctx, 'selectArea') }].concat(model.areas.map(function (a) { return { value: a.id, label: a.label }; })), onChange: function (v) { if (v) ctx.dispatch('enterArea', { areaId: v }); } }) }))));
    }
    var sections = model.sections.map(function (s) {
      switch (s.kind) {
        case 'summary': return summarySection(ctx, s, model);
        case 'positions': return positionsSection(ctx, s, model);
        case 'processes': return processesSection(ctx, s, model);
        case 'gaps': return gapsSection(ctx, s);
        case 'tracking': return trackingSection(ctx, s);
        default: return null;
      }
    });
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'twin-sheet twin-sheet--single', 'data-testid': 'areaspace' }, h('div', { class: 'twin-sheet__main' }, sections)));
  }

  function header(ctx, model) {
    var h = ctx.dom.h;
    var controls = model.area ? (model.actions || []).map(function (a) { return actionButton(ctx, a, { variant: a.id === 'focus-area' || a.id === 'clear-relations' ? 'secondary' : 'ghost', icon: a.id === 'history' ? 'history' : (a.id === 'clear-relations' ? 'close' : 'graph'), testid: 'areaspace-' + a.id }); }) : [];
    return h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'areaspace-title' }, model.title),
        h('p', { class: 'twin-stage__note' }, t(ctx, 'areaSpace', 'Espacio del área') + (model.area ? ' · ' + model.area.typeLabel : ''))),
      controls.length ? h('div', { class: 'twin-stage__controls' }, controls) : null);
  }

  function render(stageEl, ctx) {
    var model = ctx.select('areaSpaceModel');
    var dom = ctx.dom;
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.root)) {
      cache = { root: dom.h('div', { class: 'twin-areaspace twin-stage__fill' }), keys: {} };
      cache.header = dom.h('div'); cache.body = dom.h('div', { class: 'twin-stage__fill' });
      cache.root.appendChild(cache.header); cache.root.appendChild(cache.body);
      stageEl.appendChild(cache.root);
      caches.set(stageEl, cache);
    }
    var hk = json({ t: model.title, a: model.area && model.area.id, actions: model.actions });
    if (hk !== cache.keys.header) { cache.keys.header = hk; dom.preserveFocus(cache.root, function () { dom.replace(cache.header, header(ctx, model)); }); }
    var bk = json(model);
    if (bk !== cache.keys.body) { cache.keys.body = bk; dom.preserveScroll(cache.body.firstChild, function () { dom.preserveFocus(cache.root, function () { dom.replace(cache.body, body(ctx, model)); }); }); }
  }

  return { id: 'areaspace', render: render };
});
