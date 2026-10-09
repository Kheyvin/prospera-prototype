/* components/twin/history — overlays of the twin: «Histórico» (WEB-07, FR-032, AT-13),
 * document / policy content (spec §9.4, §16.3, FR-027), «Fuentes», read-only version summary
 * and connections. Bound to state.web.overlay through `select('overlayModel')`.
 *
 * createOverlays(ctx) → { update(state), isOpen() }. One molecules.modal per open overlay
 * (id/testid history-dialog for the history); closing the dialog dispatches closeOverlay;
 * the store closing the overlay (navigation, profile change) closes the dialog silently.
 * Row actions («Ver versión», «Comparar con base») close the overlay before navigating. */
Primus.module('components/twin/history', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createOverlays(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var format = ctx.format || (ctx.store && ctx.store.format);
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var fallbacks = (function () { try { return require('core/selectors').UI_FALLBACKS || {}; } catch (e) { return {}; } })();
    var current = null;      // { api, key, body }
    var closingSilently = false;

    function t(key, fallback) {
      var v = ui[key];
      if (v !== undefined && v !== null && typeof v !== 'object') return v;
      if (fallbacks[key] !== undefined) return fallbacks[key];
      return fallback === undefined ? key : fallback;
    }

    function missing() { return format && typeof format.missing === 'function' ? format.missing() : 'Sin dato proporcionado'; }

    function dispatch(type, payload) {
      if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload || {});
      return ctx.store.dispatch(type, payload || {});
    }

    function run(command) {
      if (!command) return null;
      if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') {
        var target = command.payload && command.payload.target ? command.payload.target : command.payload;
        return ctx.navigate(target);
      }
      return dispatch(command.type, command.payload || {});
    }

    function closeThenRun(command) {
      closeSilently();
      dispatch('closeOverlay', {});
      run(command);
    }

    function entityLink(ref, extra) {
      var o = extra || {};
      return molecules.entityLink({
        entity: { id: ref.id, name: ref.name, type: ref.type }, typeLabel: ref.typeLabel, icon: ref.icon || ref.type, showType: true, compact: true,
        relationLabel: o.relationLabel || null, badge: o.badge || null, versionId: o.versionId || null, testid: 'overlay-link-' + ref.id,
        onOpen: function () { closeThenRun(o.command || { type: 'selectEntity', payload: { entityId: ref.id, followLink: true } }); }
      });
    }

    function restricted(model) {
      var n = (model && model.notice) || {};
      return molecules.notice({ text: n.text || (format ? (typeof format.msg('MSG-02') === 'string' ? format.msg('MSG-02') : format.msg('MSG-02').text) : ''), tone: 'warning', role: 'alert', testid: 'overlay-restricted' });
    }

    /* ---------- history ---------- */

    function historyBody(model) {
      if (!model) return [molecules.emptyState({ text: t('noData', 'No hay información disponible para esta vista'), compact: true })];
      if (model.restricted) return [restricted(model)];
      var cols = model.columns;
      var columns = [
        { id: 'label', label: cols[0] || t('version', 'Versión'), rowHeader: true },
        { id: 'type', label: cols[1] || t('type', 'Tipo') },
        { id: 'state', label: cols[2] || t('status', 'Estado') },
        { id: 'publishedAt', label: cols[3] || t('date', 'Fecha') },
        { id: 'publishedBy', label: cols[4] || t('responsible', 'Responsable') },
        { id: 'change', label: cols[5] || t('change', 'Cambio') },
        { id: 'source', label: cols[6] || t('source', 'Fuente') }
      ];
      var rows = model.rows.map(function (r) {
        var badges = [];
        if (r.isDemo) badges.push(atoms.badge({ label: t('labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' }));
        if (r.isCurrentAsIs) badges.push(atoms.badge({ label: t('currentVersion', 'Versión actual'), tone: 'brand', icon: false }));
        if (r.adoptionLabel) badges.push(atoms.badge({ label: r.adoptionLabel, tone: 'demo' }));
        if (r.derivedLabel) badges.push(atoms.badge({ label: r.derivedLabel, tone: 'proposed' }));
        var labelNode = h('div', { class: 'stack stack--xs' }, h('span', { class: r.versionId ? 'mono' : null }, r.label || (r.versionId || model.initialReference || missing())), badges.length ? h('span', { class: 'cluster cluster--sm' }, badges) : null);
        var stateNode = molecules.statusLabel({ label: r.stateLabel || missing(), tone: r.isDemo ? 'demo' : (r.state === 'documented' ? 'success' : r.state === 'incomplete-draft' ? 'warning' : r.state === 'proposed' ? 'proposed' : 'neutral') });
        return {
          key: r.versionId || 'initial', testid: r.testid, focusKey: 'history-row:' + (r.versionId || 'initial'), className: r.current ? 'is-current' : null, isDemo: !!r.isDemo,
          cells: [{ node: labelNode }, { text: r.typeLabel || missing() }, { node: stateNode }, { text: r.publishedAtText }, { text: r.publishedByText }, { text: r.changeText }, { text: r.sourceLabel }],
          actions: r.actions.length ? h('div', { class: 'cluster cluster--sm' }, r.actions.map(function (a) {
            return atoms.button({ label: a.label, variant: 'ghost', size: 'sm', icon: a.id === 'view-version' ? 'eye' : 'compare', testid: 'history-' + a.id + '-' + (r.versionId || 'initial'), disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason || null : null,
              onClick: function () { closeThenRun(a.command); } });
          })) : null
        };
      });
      return [
        model.note ? h('p', { class: 'panel-note', 'data-testid': 'history-note' }, model.note) : null,
        molecules.table({ id: 'history-table', testid: 'history-table', caption: model.title, captionHidden: true, columns: columns, rows: rows, sort: null, dense: true, cardMode: true, emptyText: model.empty || t('noData'), actionsColumn: { label: t('actions', 'Acciones') } })
      ];
    }

    /* ---------- document / policy ---------- */

    function documentBody(model) {
      if (!model) return [molecules.emptyState({ text: t('noData'), compact: true })];
      if (model.restricted) return [restricted(model)];
      var prov = atoms.provenance({ labels: model.provenance.labels, confidence: model.provenance.confidence, dataState: model.provenance.dataState, sourceIds: model.provenance.sourceIds, sources: ctx.pack.sources, sourcesLabel: model.provenance.label });
      if (model.kind === 'policy') {
        return [
          h('div', { class: 'policy-text prose', 'data-testid': 'policy-text' },
            h('p', { class: 'text-sm muted' }, t('date', 'Fecha') + ': ' + model.dateLabel),
            model.body.map(function (p) { return h('p', null, p); }),
            model.commitments.length ? h('ol', null, model.commitments.map(function (c) { return h('li', null, c); })) : null,
            model.closing.map(function (p) { return h('p', null, p); }),
            model.signature ? h('p', { class: 'policy-text__signature' }, model.signature) : null,
            model.signatureNote ? h('p', { class: 'panel-note' }, model.signatureNote, model.signaturePosition ? [' ', entityLink(model.signaturePosition)] : null) : null),
          model.fileMessage ? h('p', { class: 'panel-note' }, icons.icon('document'), ' ', model.fileMessage) : null,
          prov
        ];
      }
      return [
        h('div', { class: 'prose', 'data-testid': 'document-text' }, model.paragraphs.map(function (p) { return h('p', null, p); })),
        model.fileMessage ? h('p', { class: 'panel-note' }, icons.icon('document'), ' ', model.fileMessage) : null,
        model.links ? h('div', { class: 'cluster cluster--sm' },
          model.links.flow ? atoms.button({ label: t('openFlow', 'Abrir flujo'), variant: 'secondary', size: 'sm', icon: 'process', testid: 'document-open-flow', onClick: function () { closeThenRun({ type: 'navigateTo', payload: { target: { tab: 'web', web: { module: 'twin', level: 'operational', processId: ctx.pack.defaultProcessId, processView: 'flow' } } } }); } }) : null,
          model.links.compare ? atoms.button({ label: t('compareVersions', 'Comparar versiones'), variant: 'secondary', size: 'sm', icon: 'compare', testid: 'document-compare', onClick: function () { closeThenRun({ type: 'navigateTo', payload: { target: { tab: 'web', web: { module: 'twin', level: 'operational', processId: ctx.pack.defaultProcessId, processView: 'compare' } } } }); } }) : null) : null,
        prov
      ];
    }

    /* ---------- sources ---------- */

    function sourcesBody(model) {
      if (!model) return [molecules.emptyState({ text: t('noData'), compact: true })];
      if (model.restricted) return [restricted(model)];
      var p = model.provenance || {};
      var rows = [];
      if (p.labels && p.labels.length) rows.push({ label: t('status', 'Estado'), value: h('span', { class: 'cluster cluster--sm' }, p.labels.map(function (l) { return atoms.badge({ label: l, tone: atoms.labelTone ? atoms.labelTone(l) : 'neutral' }); })) });
      if (p.confidenceLabel) rows.push({ label: t('confidence', 'Confianza'), value: p.confidenceLabel });
      if (p.observedAtText) rows.push({ label: t('date', 'Fecha'), value: p.observedAtText });
      var list = model.sources.length ? h('ul', { class: 'list', 'data-testid': 'sources-list' }, model.sources.map(function (s) {
        return h('li', { class: 'list__item' }, h('div', { class: 'stack stack--xs' },
          h('span', null, h('span', { class: 'mono text-xs' }, s.id), ' · ', s.title, s.section ? h('span', { class: 'muted' }, ' (' + s.section + ')') : null),
          s.note ? h('span', { class: 'text-sm muted' }, s.note) : null,
          s.dateText ? h('span', { class: 'text-sm muted' }, t('date', 'Fecha') + ': ' + s.dateText) : null,
          s.modelModifiedAtText ? h('span', { class: 'text-sm muted' }, s.modelModifiedAtLabel + ': ' + s.modelModifiedAtText) : null));
      })) : h('p', { class: 'muted' }, missing());
      return [rows.length ? molecules.keyValue({ rows: rows, missingText: missing(), inline: true }) : null, list];
    }

    /* ---------- version (read-only summary) ---------- */

    function versionBody(model) {
      if (!model || !model.version) return [molecules.emptyState({ text: t('noData'), compact: true })];
      var v = model.version;
      return [
        h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: v.typeLabel, tone: 'neutral', icon: false }), v.stateLabel ? atoms.badge({ label: v.stateLabel, tone: v.isDemo ? 'demo' : 'neutral' }) : null, v.readOnlyLabel ? atoms.badge({ label: v.readOnlyLabel, tone: 'warning', icon: false }) : null),
        molecules.keyValue({ missingText: missing(), rows: [
          { label: t('summary', 'Resumen'), value: v.summary },
          { label: t('change', 'Cambio'), value: v.changeLabel },
          { label: t('date', 'Fecha'), value: v.publishedAtText },
          { label: t('responsible', 'Responsable'), value: v.publishedBy },
          { label: t('sources', 'Fuentes'), value: v.sources.map(function (s) { return s.id + ' · ' + s.title; }).join(' · ') || null }
        ] }),
        v.pending.length ? h('div', null, h('h4', { class: 'inspector__section-title' }, t('pendingItems', 'Pendientes')), h('ul', { class: 'list' }, v.pending.map(function (p) { return h('li', { class: 'list__item' }, p); }))) : null,
        h('div', { class: 'cluster cluster--sm' }, atoms.button({ label: t('viewVersion', 'Ver versión'), variant: 'secondary', size: 'sm', icon: 'eye', testid: 'overlay-view-version', onClick: function () { closeThenRun({ type: 'enterProcess', payload: { processId: v.processId, view: 'flow', versionId: v.id } }); } }))
      ];
    }

    /* ---------- connections ---------- */

    function connectionsBody(model) {
      if (!model) return [molecules.emptyState({ text: t('noData'), compact: true })];
      var groups = (model.groups || []).map(function (g) {
        return h('section', { class: 'inspector__section' }, h('h4', { class: 'inspector__section-title' }, g.label),
          h('div', { class: 'inspector__links' }, g.items.map(function (it) {
            if (it.kind === 'version') return entityLink({ id: it.version.id, name: it.version.label, type: 'version', typeLabel: it.version.typeLabel, icon: 'version' }, { relationLabel: it.relationLabel, command: it.command });
            return entityLink(it.entity, { relationLabel: it.relationLabel, badge: it.badge ? { label: it.badge, tone: 'proposed' } : null, versionId: it.versionId, command: it.command });
          })));
      });
      return [groups.length ? groups : h('p', { class: 'muted' }, model.empty || missing())];
    }

    /* ---------- modal lifecycle ---------- */

    function titleOf(overlay) {
      var m = overlay.model || {};
      if (overlay.kind === 'history') return m.title || t('history', 'Histórico');
      if (overlay.kind === 'document' || overlay.kind === 'policy') return m.title || t('viewAvailableContent', 'Ver contenido disponible');
      if (overlay.kind === 'sources') return m.title || t('sources', 'Fuentes');
      if (overlay.kind === 'version') return m.version ? m.version.label : t('version', 'Versión');
      if (overlay.kind === 'connections') return t('viewConnections', 'Ver conexiones');
      return t('noDetail', 'Detalle');
    }

    function bodyOf(overlay) {
      var m = overlay.model;
      switch (overlay.kind) {
        case 'history': return historyBody(m);
        case 'document': case 'policy': return documentBody(m);
        case 'sources': return sourcesBody(m);
        case 'version': return versionBody(m);
        case 'connections': return connectionsBody(m);
        default: return [molecules.emptyState({ text: t('noData'), compact: true })];
      }
    }

    function open(overlay) {
      var key = overlay.kind + ':' + (overlay.entityId || '') + ':' + (overlay.versionId || '');
      var testid = overlay.kind === 'history' ? 'history-dialog' : overlay.kind + '-dialog';
      var body = h('div', { class: 'stack stack--md overlay-panel' }, bodyOf(overlay));
      var api = molecules.modal({
        id: testid, testid: testid, title: titleOf(overlay), size: overlay.kind === 'history' ? 'lg' : 'md',
        eyebrow: overlay.kind === 'history' ? t('history', 'Histórico') : (overlay.kind === 'sources' ? t('sources', 'Fuentes') : null),
        body: body, closeLabel: overlay.closeLabel || t('close', 'Cerrar'), closeTestid: testid + '-close',
        actions: [{ label: overlay.closeLabel || t('close', 'Cerrar'), variant: 'secondary', testid: testid + '-ok', onClick: function (event, m) { m.close('ok'); } }],
        onClose: function () {
          var silent = closingSilently;
          closingSilently = false;
          current = null;
          if (!silent) {
            var state = ctx.store.getState();
            if (state.web && state.web.overlay) dispatch('closeOverlay', {});
          }
        }
      });
      current = { api: api, key: key, body: body, json: JSON.stringify(overlay) };
      api.open();
    }

    function closeSilently() {
      if (!current) return;
      closingSilently = true;
      var c = current;
      current = null;
      c.api.close('store');
    }

    function update(state) {
      var overlay = null;
      try { overlay = ctx.select('overlayModel'); } catch (e) { overlay = null; }
      if (!overlay) { if (current) closeSilently(); return; }
      var key = overlay.kind + ':' + (overlay.entityId || '') + ':' + (overlay.versionId || '');
      if (current && current.key !== key) closeSilently();
      if (!current) { open(overlay); return; }
      var json = JSON.stringify(overlay);
      if (json === current.json) return;
      current.json = json;
      dom.preserveFocus(current.body, function () { dom.replace(current.body, bodyOf(overlay)); });
    }

    return { update: update, isOpen: function () { return !!current; }, close: closeSilently };
  }

  return { createOverlays: createOverlays };
});
