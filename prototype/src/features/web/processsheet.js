/* features/web/processsheet — operational «Ficha» of a process (spec WEB-03, §9.3 portfolio
 * sheets, §9.5 objective/indicator, FR-013/026). Renders `select('processSheetModel')`:
 * description and characterization, owner/participants, variants, the version bar, the SIPOC
 * synthesis, the responsibilities (RACI) table with «— No proporcionado», documents, current
 * and proposed systems, policy, objective + indicator (always «Sin medición»), gaps,
 * provenance and the action row. Portfolio processes (PR-01…10) show their common sheet text
 * and an explained, disabled «Abrir flujo». */
Primus.module('features/web/processsheet', function (require) {
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

  function link(ctx, ref, extra) {
    var o = extra || {};
    var focusKey = o.focusKey || ('sheet-link:' + ref.id);
    return ctx.molecules.entityLink({
      entity: { id: ref.id, name: ref.name, type: ref.type }, typeLabel: ref.typeLabel, icon: ref.icon || ref.type, showType: o.showType !== false, compact: o.compact !== false,
      relationLabel: o.relationLabel || null, meta: o.meta || null, badge: o.badge || null, versionId: o.versionId || null, testid: o.testid || ('sheet-link-' + ref.id), focusKey: focusKey,
      onOpen: function (entity, event) {
        if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: focusKey });
        if (o.command) run(ctx, o.command); else ctx.dispatch('selectEntity', o.versionId ? { entityId: ref.id, versionId: o.versionId } : { entityId: ref.id });
      }
    });
  }

  function section(ctx, id, title, children) {
    return ctx.dom.h('section', { class: 'twin-sheet__section', 'data-testid': 'sheet-' + id, 'aria-labelledby': 'sheet-' + id + '-title' },
      ctx.dom.h('h3', { class: 'twin-sheet__section-title', id: 'sheet-' + id + '-title' }, title), children);
  }

  function badgeFor(ctx, b) { return ctx.atoms.badge({ label: b.label, tone: b.tone || (ctx.atoms.labelTone ? ctx.atoms.labelTone(b.label) : 'neutral') }); }

  function hiddenLayer(ctx, hl) {
    if (!hl) return null;
    return ctx.molecules.notice({ text: hl.text, tone: 'info', action: { label: hl.action.label, onClick: function () { run(ctx, hl.action.command); } } });
  }

  function buildHeader(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var badges = (model.badges || []).map(function (b) { return badgeFor(ctx, b); });
    if (model.version && model.version.isDemo) badges.push(atoms.badge({ label: model.version.adoptionLabel || model.version.stateLabel || t(ctx, 'labelDemoExample'), tone: 'demo' }));
    var actions = (model.actions || []).filter(function (a) { return a.id !== 'view-sheet'; });
    var reasons = [];
    var reasonIds = {};
    actions.forEach(function (a) { if (a.enabled === false && a.reason && reasons.indexOf(a.reason) === -1) reasons.push(a.reason); });
    /* One shared explanation per distinct reason (not one line per disabled button); the «no
     * detail» notice below the header already carries that reason, so it is not repeated. */
    var reasonEls = reasons.map(function (r, i) {
      if (model.openFlowUnavailable && r === model.openFlowUnavailable) { reasonIds[r] = 'sheet-no-flow-notice'; return null; }
      var id = 'sheet-actions-reason-' + i; reasonIds[r] = id;
      return h('p', { class: 'btn__reason', id: id, 'data-testid': 'sheet-actions-reason' }, r);
    });
    var controls = actions.map(function (a) {
      var icon = { 'open-flow': 'process', compare: 'compare', incidents: 'incident', projects: 'project', history: 'history', sources: 'document', connections: 'link' }[a.id] || null;
      var disabled = a.enabled === false;
      return atoms.button({ label: a.label, variant: a.id === 'open-flow' ? 'primary' : 'ghost', size: 'sm', icon: icon, testid: 'sheet-action-' + a.id, focusKey: 'sheet:action:' + a.id,
        disabled: disabled, title: disabled ? a.reason || null : null, attrs: disabled && a.reason ? { 'aria-describedby': reasonIds[a.reason] } : null, onClick: function () { run(ctx, a.command); } });
    });
    return h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'sheet-title' }, model.title),
        h('p', { class: 'twin-stage__subtitle' }, [model.explainer, model.version ? model.version.label : null].filter(Boolean).join(' · ')),
        badges.length ? h('div', { class: 'cluster cluster--sm' }, badges) : null),
      controls.length ? h('div', { class: 'twin-stage__controls twin-stage__controls--wrap' }, controls, reasonEls) : null);
  }

  function versionBar(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    if (!model.versions || !model.versions.length) return null;
    return h('div', { class: 'twin-versionbar' }, h('div', { class: 'twin-versionbar__group', role: 'group', 'aria-label': t(ctx, 'version', 'Versión') },
      h('span', { class: 'twin-versionbar__label' }, t(ctx, 'version', 'Versión')),
      model.versions.map(function (v) {
        return atoms.button({ label: v.label, variant: v.selected ? 'secondary' : 'ghost', size: 'sm', pressed: !!v.selected, testid: v.testid, focusKey: 'version:' + v.id, title: v.stateLabel || null, icon: v.isDemo ? 'flag' : 'version',
          onClick: function () { if (!v.selected) ctx.dispatch('setVersion', { versionId: v.id }); } });
      })));
  }

  function notices(ctx, model) {
    var h = ctx.dom.h, molecules = ctx.molecules;
    var items = [];
    if (model.readOnly && model.readOnlyLabel) items.push(molecules.notice({ text: model.readOnlyLabel, tone: 'warning', icon: 'lock', testid: 'sheet-readonly' }));
    if (model.newVersionNotice) items.push(molecules.notice({ text: model.newVersionNotice.text, tone: 'info', testid: 'new-version-notice', action: { label: model.newVersionNotice.action, testid: 'new-version-view', onClick: function () { run(ctx, model.newVersionNotice.command); } }, onDismiss: function () { ctx.dispatch('dismissNewVersionNotice', {}); } }));
    if (model.openFlowUnavailable) items.push(molecules.notice({ attrs: { id: 'sheet-no-flow-notice' }, text: model.openFlowUnavailable, tone: 'info', testid: 'sheet-no-flow' }));
    return items.length ? h('div', { class: 'twin-notices' }, items) : null;
  }

  function sipocTable(ctx, s) {
    if (!s || !s.rows || !s.rows.length) return null;
    var h = ctx.dom.h;
    var cols = s.columns.length ? s.columns : [t(ctx, 'suppliers', 'Proveedores'), t(ctx, 'inputs', 'Entradas'), t(ctx, 'process', 'Proceso'), t(ctx, 'outputs', 'Salidas'), t(ctx, 'customers', 'Destinatarios')];
    var keys = ['suppliers', 'inputs', 'process', 'outputs', 'customers'];
    return section(ctx, 'sipoc', 'SIPOC', [
      s.label ? h('p', { class: 'panel-note' }, ctx.atoms.badge({ label: s.label, tone: 'brand', icon: false })) : null,
      ctx.molecules.table({ id: 'sheet-sipoc', testid: 'sheet-sipoc-table', caption: 'SIPOC', captionHidden: true, columns: cols.map(function (c, i) { return { id: keys[i] || String(i), label: c }; }),
        rows: s.rows.map(function (r, i) { return { key: i, cells: keys.map(function (k, ci) { return { text: r[k] || r[cols[ci]] || ctx.format.missing(), className: k === 'process' ? 'sipoc__column--process' : null }; }) }; }), sort: null, cardMode: true, dense: true, emptyText: t(ctx, 'noData') })
    ]);
  }

  function raciTable(ctx, r, model) {
    if (!r) return null;
    var h = ctx.dom.h;
    var columns = [{ id: 'activity', label: t(ctx, 'activities', 'Actividades'), rowHeader: true }].concat(r.columns.map(function (c) { return { id: c.roleId, label: c.label }; }));
    var rows = r.rows.map(function (row) {
      return { key: row.key, cells: [{ node: link(ctx, row.activity, { versionId: row.versionId, testid: 'sheet-raci-' + row.key, focusKey: 'sheet-raci:' + row.key }) }].concat(row.cells.map(function (c) {
        return { node: c.value ? h('span', { class: 'raci__mark', 'aria-label': t(ctx, 'raciResponsible', 'Responsable (R)') }, c.value) : h('span', { class: 'raci__missing' }, c.text), className: c.value ? null : 'is-missing' };
      })) };
    });
    return section(ctx, 'raci', r.label, [
      r.ownerNote ? h('p', { class: 'text-sm' }, r.ownerNote) : null,
      h('div', { class: 'cluster cluster--sm' }, r.columns.map(function (c) { return link(ctx, c.entity, { testid: 'sheet-raci-role-' + c.roleId, focusKey: 'sheet-raci-role:' + c.roleId }); })),
      ctx.molecules.table({ id: 'sheet-raci', testid: 'sheet-raci-table', caption: r.label, captionHidden: true, columns: columns, rows: rows, sort: null, cardMode: true, dense: true, emptyText: t(ctx, 'noData') }),
      r.note ? h('p', { class: 'panel-note' }, r.note) : null
    ]);
  }

  function indicatorBlock(ctx, ind) {
    if (!ind) return null;
    var h = ctx.dom.h;
    return h('div', { class: 'stack stack--sm', 'data-testid': 'sheet-indicator' },
      h('div', { class: 'cluster cluster--sm' }, link(ctx, ind.entity, { command: ind.command }), badgeFor(ctx, ind.badge)),
      ctx.molecules.metric({ label: t(ctx, 'value', 'Valor'), value: ind.value, missingText: ind.noMeasurement || ind.valueText, target: ind.targetText, proposed: true }),
      ctx.molecules.keyValue({ missingText: ctx.format.missing(), rows: [{ label: t(ctx, 'formula', 'Fórmula'), value: ind.formula }, { label: t(ctx, 'target', 'Meta'), value: ind.targetText }, { label: t(ctx, 'measuredAt', 'Fecha de medición'), value: ind.measuredAtText }] }));
  }

  function mainColumn(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var facts = [];
    if (model.detailed) {
      facts.push({ label: t(ctx, 'start', 'Inicio'), value: model.start });
      facts.push({ label: t(ctx, 'end', 'Fin'), value: model.end });
      facts.push({ label: t(ctx, 'time', 'Tiempos'), value: model.timeText });
    }
    var variants = model.variants.items.length ? h('ul', { class: 'list' }, model.variants.items.map(function (v) { return h('li', { class: 'list__item' }, v.label, v.note ? h('span', { class: 'text-sm muted' }, ' · ' + v.note) : null); })) : null;
    return [
      section(ctx, 'description', t(ctx, 'summary', 'Resumen'), [
        h('p', { 'data-testid': 'sheet-description' }, model.description),
        model.extraText ? h('p', null, model.extraText) : null,
        model.note ? h('p', { class: 'panel-note' }, model.note) : null,
        facts.length ? ctx.molecules.keyValue({ rows: facts, missingText: ctx.format.missing() }) : null,
        model.detailed ? h('div', { class: 'stack stack--xs' }, h('span', { class: 'text-sm muted' }, model.variants.label), variants || h('p', { class: 'muted' }, model.variants.text)) : null]),
      section(ctx, 'participants', t(ctx, 'participants', 'Participantes'), [
        ctx.molecules.keyValue({ missingText: ctx.format.missing(), rows: [
          { label: model.owner.label, value: model.owner.entity ? link(ctx, model.owner.entity, { testid: 'sheet-owner' }) : model.owner.text },
          { label: model.participants.label, value: model.participants.text }
        ] }),
        h('div', { class: 'cluster cluster--sm' },
          model.participants.actor ? link(ctx, model.participants.actor, { relationLabel: t(ctx, 'externalActor', 'Actor externo') }) : null,
          model.participants.roles.map(function (r) { return link(ctx, r, { relationLabel: t(ctx, 'rolInProcess', 'Rol en el proceso') }); }),
          model.participants.areas.map(function (a) { return link(ctx, a, { relationLabel: t(ctx, 'participant', 'Participante') }); })),
        model.macroprocess ? h('div', { class: 'cluster cluster--sm' }, link(ctx, model.macroprocess, { relationLabel: t(ctx, 'macroprocess', 'Macroproceso') }), badgeFor(ctx, model.macroprocess.badge)) : null]),
      sipocTable(ctx, model.sipoc),
      raciTable(ctx, model.raci, model)
    ];
  }

  function asideColumn(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var docs = model.documents;
    var sys = model.systems;
    return [
      section(ctx, 'documents', docs.label, [
        hiddenLayer(ctx, docs.hiddenLayer),
        docs.items.length ? h('div', { class: 'inspector__links' }, docs.items.map(function (d) { return link(ctx, d, { command: d.command, meta: d.text }); })) : (docs.hiddenLayer ? null : h('p', { class: 'muted' }, ctx.format.missing()))]),
      section(ctx, 'systems', sys.label, [
        hiddenLayer(ctx, sys.hiddenLayer),
        sys.current.length ? h('div', { class: 'inspector__links' }, sys.current.map(function (s) { return link(ctx, s, { meta: s.statusLabel }); })) : (sys.hiddenLayer ? null : h('p', { class: 'muted' }, ctx.format.missing())),
        sys.proposed.length ? h('div', { class: 'stack stack--xs' },
          h('span', { class: 'text-sm muted' }, sys.proposedLabel),
          h('div', { class: 'inspector__links' }, sys.proposed.map(function (s) { return link(ctx, s, { meta: s.statusLabel, badge: { label: t(ctx, 'labelProposed'), tone: 'proposed' } }); })),
          sys.proposedTarget ? atoms.button({ label: t(ctx, 'toBeExplainer', 'Así se propone trabajar'), variant: 'ghost', size: 'sm', icon: 'forward', testid: 'sheet-proposed-tools', onClick: function () { run(ctx, { type: 'navigateTo', payload: { target: sys.proposedTarget } }); } }) : null) : null]),
      model.policy ? section(ctx, 'policy', model.policy.label, [h('div', { class: 'cluster cluster--sm' }, link(ctx, model.policy.entity, { relationLabel: model.policy.relationLabel, command: model.policy.command }), model.policy.badge ? atoms.badge({ label: model.policy.badge, tone: 'proposed' }) : null)]) : null,
      model.objective ? section(ctx, 'objective', model.objective.label, [
        h('div', { class: 'cluster cluster--sm' }, link(ctx, model.objective.entity, { command: model.objective.command }), badgeFor(ctx, model.objective.badge)),
        model.objective.description ? h('p', { class: 'text-sm' }, model.objective.description) : null,
        model.indicator ? h('h4', { class: 'inspector__section-title' }, model.indicator.label) : null,
        indicatorBlock(ctx, model.indicator)]) : null,
      section(ctx, 'gaps', model.gaps.label, [model.gaps.items.length ? h('div', { class: 'inspector__links' }, model.gaps.items.map(function (g) { return link(ctx, g, { command: g.command, meta: g.noteText }); })) : h('p', { class: 'muted' }, ctx.format.msg('MSG-10'))]),
      section(ctx, 'provenance', t(ctx, 'provenance', 'Proveniencia'), [atoms.provenance({ labels: model.provenance.labels, confidence: model.provenance.confidence, dataState: model.provenance.dataState, sourceIds: model.provenance.sourceIds, sources: ctx.pack.sources, sourcesLabel: model.provenance.label })])
    ];
  }

  function body(ctx, model) {
    var h = ctx.dom.h;
    if (model.restricted) {
      var n = model.notice || {};
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, ctx.molecules.notice({ text: n.text || ctx.format.msg('MSG-02').text, tone: 'warning', role: 'alert', testid: 'sheet-restricted', action: { label: n.action || t(ctx, 'backToOrganization'), testid: 'sheet-restricted-action', onClick: function () { ctx.dispatch('backToOrganization', {}); } } }));
    }
    if (!model.process) {
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'twin-sheet' }, h('div', { class: 'twin-sheet__main stack stack--md' },
        ctx.molecules.emptyState({ text: model.empty, icon: 'process', testid: 'sheet-empty' }),
        ctx.atoms.field({ id: 'sheet-process-select', label: t(ctx, 'selectProcess', 'Selecciona un proceso'), control: ctx.atoms.select({ id: 'sheet-process-select', testid: 'sheet-process-select', focusKey: 'sheet:process-select', value: '', options: [{ value: '', label: t(ctx, 'selectProcess') }].concat(model.processes.map(function (p) { return { value: p.id, label: p.label }; })), onChange: function (v) { if (v) ctx.dispatch('enterProcess', { processId: v, view: 'sheet' }); } }) }))));
    }
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, notices(ctx, model), h('div', { class: 'twin-sheet', 'data-testid': 'process-sheet' }, h('div', { class: 'twin-sheet__main' }, mainColumn(ctx, model)), h('div', { class: 'twin-sheet__aside' }, asideColumn(ctx, model))));
  }

  function render(stageEl, ctx) {
    var model = ctx.select('processSheetModel');
    var dom = ctx.dom;
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.root)) {
      cache = { root: dom.h('div', { class: 'twin-processsheet twin-stage__fill' }), keys: {}, header: dom.h('div'), versions: dom.h('div'), body: dom.h('div', { class: 'twin-stage__fill' }) };
      cache.root.appendChild(cache.header); cache.root.appendChild(cache.versions); cache.root.appendChild(cache.body);
      stageEl.appendChild(cache.root);
      caches.set(stageEl, cache);
    }
    var hk = json({ t: model.title, b: model.badges, e: model.explainer, v: model.version && [model.version.id, model.version.label, model.version.isDemo], a: model.actions, p: !!model.process });
    if (hk !== cache.keys.header) { cache.keys.header = hk; dom.preserveFocus(cache.root, function () { dom.replace(cache.header, model.process && !model.restricted ? buildHeader(ctx, model) : dom.h('div', { class: 'twin-stage__header' }, dom.h('div', { class: 'twin-stage__heading' }, dom.h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web' }, model.title || t(ctx, 'selectProcess'))))); }); }
    var vk = json(model.versions && model.versions.map(function (v) { return [v.id, v.label, v.selected, v.isDemo]; }));
    if (vk !== cache.keys.versions) { cache.keys.versions = vk; dom.preserveFocus(cache.root, function () { dom.replace(cache.versions, model.process && !model.restricted ? versionBar(ctx, model) : null); }); }
    var bk = json(model);
    if (bk !== cache.keys.body) { cache.keys.body = bk; dom.preserveScroll(cache.body.firstChild, function () { dom.preserveFocus(cache.root, function () { dom.replace(cache.body, body(ctx, model)); }); }); }
  }

  return { id: 'processsheet', render: render };
});
