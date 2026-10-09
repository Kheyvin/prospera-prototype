/* features/web/relations — strategic «Relaciones» stage (spec §8 representations, §9.1
 * traversal policies, ux.md §4 «Show connections», FR-011). A root entity (web.relationsRootId)
 * in the middle-left and its typed related groups as labelled rows to the right; one edge per
 * declared relation with its Spanish relation phrase; inferred relations dashed with the
 * «Relación propuesta» badge. Without a root the stage offers a selector of candidate
 * entities. Hidden layers and area filters are explained, never silently applied. */
Primus.module('features/web/relations', function (require) {
  'use strict';

  var caches = new WeakMap();
  var PAD = 32, ROW_GAP = 32, ITEM_GAP = 24, ROOT_GAP = 160, LABEL_H = 28, MAX_ROW_W = 760, DEFAULT_W = 200, DEFAULT_H = 56;

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ }
    return fallback;
  }
  function json(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function stateOf(ctx) { return ctx.state || ctx.store.getState(); }
  function canvasApi(ctx) { return ctx.canvas || require('components/twin/canvas'); }
  function isKeyboard(event) { return !!event && (event.type === 'keydown' || event.type === 'keyup' || (event.type === 'click' && event.detail === 0)); }
  function run(ctx, command) { if (!command) return null; return ctx.dispatch(command.type, command.payload || {}); }

  function searchSet(ctx, state) {
    var s = state.web && state.web.search;
    if (!s || !s.open || !(s.query || '').trim()) return null;
    var set = new Set();
    (ctx.select('searchResults').results || []).forEach(function (r) { set.add(r.id); });
    return set;
  }

  function sizeOf(el) { var w = el.offsetWidth || 0, h = el.offsetHeight || 0; return { w: w || DEFAULT_W, h: h || DEFAULT_H, measured: !!(w && h) }; }
  function place(el, x, y) { el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px'; }

  function itemRef(it) { return it.kind === 'version' ? { id: it.version.id, name: it.version.label, type: 'version', typeLabel: it.version.typeLabel, icon: 'version', versionRef: it.version } : it.entity; }

  function nodeFor(ctx, api, it, model, search) {
    var ref = itemRef(it);
    var badges = [];
    if (it.badge) badges.push({ label: it.badge, tone: 'proposed' });
    if (ref.proposed) badges.push({ label: t(ctx, 'labelProposed', 'Propuesto · por validar'), tone: 'proposed' });
    if (it.kind === 'version' && it.version.isDemo) badges.push({ label: t(ctx, 'labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' });
    var focusKey = 'node:' + (it.versionId ? it.versionId + ':' : '') + ref.id;
    return api.nodeButton({
      id: ref.id, type: ref.type, title: ref.name, badges: badges, meta: it.note || null, versionId: it.versionId || null,
      subtitle: [it.relationLabel, it.kind === 'version' ? it.version.stateLabel : null].filter(Boolean).join(' · ') || null,
      testid: 'node-' + ref.id, focusKey: focusKey, selected: model.selectedId === ref.id, related: true,
      dimmed: search ? !search.has(ref.id) : false, external: !!ref.external, proposed: !!ref.proposed,
      onSelect: function (event) { if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: focusKey }); run(ctx, it.command); }
    });
  }

  function layout(cache, model) {
    var nodes = cache.nodes;
    var sizes = new Map();
    var allMeasured = true;
    nodes.forEach(function (entry, id) { var s = sizeOf(entry.el); if (!s.measured) allMeasured = false; sizes.set(id, s); });
    cache.layoutDirty = !allMeasured;
    var rootSize = sizes.get('root') || { w: DEFAULT_W, h: DEFAULT_H };
    var x0 = PAD + rootSize.w + ROOT_GAP;
    var y = PAD;
    var geometry = new Map();
    var labels = [];
    var maxRight = x0;
    model.groups.forEach(function (g, gi) {
      /* Group label sits above its first row so the root→item edges never cross it. */
      var groupTop = y;
      y += LABEL_H;
      var x = x0, rowTop = y, rowH = 0;
      g.items.forEach(function (it) {
        var id = itemRef(it).id;
        var s = sizes.get('item:' + id) || { w: DEFAULT_W, h: DEFAULT_H };
        if (x > x0 && x + s.w > x0 + MAX_ROW_W) { y = rowTop + rowH + ITEM_GAP; rowTop = y; rowH = 0; x = x0; }
        geometry.set('item:' + id, { x: x, y: y, w: s.w, h: s.h, entityId: id });
        rowH = Math.max(rowH, s.h);
        maxRight = Math.max(maxRight, x + s.w);
        x += s.w + ITEM_GAP;
      });
      labels.push({ gi: gi, x: x0, y: groupTop, h: LABEL_H, label: g.label, count: g.items.length });
      y = rowTop + rowH + ROW_GAP;
    });
    var height = Math.max(y - ROW_GAP + PAD, PAD * 2 + rootSize.h);
    geometry.set('root', { x: PAD, y: PAD, w: rootSize.w, h: rootSize.h });
    return { geometry: geometry, labels: labels, width: maxRight + PAD, height: height };
  }

  /* Nodes measure 0 while the host is hidden (and shrink-to-fit while the layer is still
   * narrow); retry on the next frame until every node reports a real size. */
  function scheduleRelayout(ctx, cache, model) {
    if (!cache.layoutDirty || cache.relayoutPending || typeof requestAnimationFrame !== 'function') return;
    cache.relayoutPending = true;
    cache.relayoutTries = (cache.relayoutTries || 0) + 1;
    requestAnimationFrame(function () {
      cache.relayoutPending = false;
      if (cache.mode !== 'canvas' || !cache.canvas || !cache.lastModel) return;
      if (cache.relayoutTries > 20) return;
      applyLayout(ctx, cache, cache.lastModel);
    });
  }

  function applyLayout(ctx, cache, model) {
    var lay = layout(cache, model);
    if (!cache.layoutDirty) cache.relayoutTries = 0;
    cache.nodes.forEach(function (entry, id) { var g = lay.geometry.get(id); if (g) place(entry.el, g.x, g.y); });
    cache.labelEls.forEach(function (el, i) { var l = lay.labels[i]; if (l) { place(el, l.x, l.y); el.style.height = l.h + 'px'; } });
    scheduleRelayout(ctx, cache, model);
    var edgeGeom = new Map();
    lay.geometry.forEach(function (g, id) { edgeGeom.set(id, g); });
    var specs = [];
    model.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        var id = itemRef(it).id;
        specs.push({ id: 'line:' + id, from: 'root', to: 'item:' + id, label: null, related: true, inferred: !!it.inferred, dashed: !!it.derived, selected: model.selectedId === id, router: 'curve' });
      });
    });
    cache.canvas.setSize(lay.width, lay.height);
    try { cache.api.drawEdges(cache.canvas.edges, specs, edgeGeom, { router: 'curve' }); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
  }

  function buildCanvasNodes(ctx, cache, model, search) {
    var h = ctx.dom.h;
    var layer = cache.canvas.layer;
    Array.prototype.slice.call(layer.children).forEach(function (c) { if (c !== cache.canvas.edges) layer.removeChild(c); });
    cache.nodes = new Map();
    cache.labelEls = [];
    var root = model.root;
    var rootEl = cache.api.nodeButton({ id: root.id, type: root.type, title: root.name, root: true, selected: model.selectedId === root.id, proposed: !!root.proposed, external: !!root.external, testid: 'node-' + root.id, focusKey: 'node:' + root.id,
      badges: root.proposed ? [{ label: t(ctx, 'labelProposed', 'Propuesto · por validar'), tone: 'proposed' }] : [], extraClass: 'node--wide',
      onSelect: function (event) { if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: 'node:' + root.id }); ctx.dispatch('selectEntity', { entityId: root.id }); } });
    rootEl.setAttribute('data-measure-id', 'root');
    layer.appendChild(rootEl);
    cache.nodes.set('root', { el: rootEl });
    model.groups.forEach(function (g) {
      var label = h('div', { class: 'canvas__label canvas__label--group text-sm muted' }, h('span', { class: 'canvas__label-text' }, h('span', null, g.label), h('span', { class: 'section-title__count' }, ' · ' + g.items.length)));
      layer.appendChild(label);
      cache.labelEls.push(label);
      g.items.forEach(function (it) {
        var el = nodeFor(ctx, cache.api, it, model, search);
        var id = itemRef(it).id;
        el.setAttribute('data-measure-id', 'item:' + id);
        layer.appendChild(el);
        cache.nodes.set('item:' + id, { el: el });
      });
    });
    applyLayout(ctx, cache, model);
  }

  function buildList(ctx, model, search) {
    var listMod = require('components/twin/entitylist');
    var groups = [{ id: 'root', title: model.rootLabel, items: [{ ref: model.root, root: true, selected: model.selectedId === model.root.id, testid: 'node-' + model.root.id }] }];
    model.groups.forEach(function (g) {
      groups.push({ id: g.id, title: g.label, count: g.items.length, items: g.items.map(function (it) {
        var ref = itemRef(it);
        return { ref: ref, relationLabel: it.relationLabel, badge: it.badge || null, note: it.note || null, versionId: it.versionId || null, command: it.command, selected: model.selectedId === ref.id, related: true, dimmed: search ? !search.has(ref.id) : false, testid: 'node-' + ref.id };
      }) });
    });
    return listMod.entityList(ctx, { testid: 'web-list', groups: groups });
  }

  function rootPicker(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms, molecules = ctx.molecules;
    var byType = {};
    model.candidates.forEach(function (c) { (byType[c.typePlural] = byType[c.typePlural] || []).push(c); });
    var options = [{ value: '', label: t(ctx, 'selectRelationsRoot', 'Elige un elemento para ver sus relaciones') }];
    Object.keys(byType).forEach(function (plural) { byType[plural].forEach(function (c) { options.push({ value: c.id, label: plural + ' · ' + c.name }); }); });
    return h('div', { class: 'twin-sheet' }, h('div', { class: 'twin-sheet__main stack stack--md' },
      molecules.emptyState({ text: model.prompt || t(ctx, 'noData'), icon: 'graph', testid: 'relations-empty' }),
      atoms.field({ id: 'relations-root-select', label: t(ctx, 'viewConnections', 'Ver conexiones'), control: atoms.select({ id: 'relations-root-select', testid: 'relations-root-select', focusKey: 'relations:root-select', value: '', options: options,
        onChange: function (value) { if (value) ctx.dispatch('setRelationsRoot', { entityId: value }); } }) })));
  }

  function buildChrome(stageEl, ctx) {
    var h = ctx.dom.h;
    var cache = { api: canvasApi(ctx), nodes: new Map(), labelEls: [], canvas: null, structure: null, stateKey: null, chromeKey: null, mode: null };
    cache.title = h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web' }, '');
    cache.note = h('p', { class: 'twin-stage__note' }, '');
    cache.controls = h('div', { class: 'twin-stage__controls' });
    cache.notices = h('div', { class: 'twin-notices' });
    cache.header = h('div', { class: 'twin-stage__header' }, h('div', { class: 'twin-stage__heading' }, cache.title, cache.note), cache.controls);
    cache.body = h('div', { class: 'twin-stage__body twin-stage__body--canvas' });
    cache.legend = h('div', { class: 'legend' });
    cache.footer = h('div', { class: 'twin-stage__footer' }, cache.legend);
    stageEl.appendChild(cache.header); stageEl.appendChild(cache.notices); stageEl.appendChild(cache.body); stageEl.appendChild(cache.footer);
    return cache;
  }

  function renderChrome(ctx, cache, model) {
    var dom = ctx.dom, atoms = ctx.atoms, molecules = ctx.molecules, h = dom.h;
    var key = json({ r: model.rootId, l: model.rootLabel, af: model.areaFilterNotice, hidden: model.hiddenRelatedNotice, empty: model.empty, groups: model.groups.length });
    if (key === cache.chromeKey) return;
    cache.chromeKey = key;
    dom.setText(cache.title, model.root ? model.root.name : t(ctx, 'repRelations', 'Relaciones'));
    dom.setText(cache.note, model.root ? (model.rootLabel + ' · ' + model.root.typeLabel) : t(ctx, 'repRelations', 'Relaciones'));
    dom.preserveFocus(cache.controls, function () {
      dom.replace(cache.controls, model.root ? atoms.button({ label: model.clearAction.label, variant: 'secondary', size: 'sm', icon: 'close', testid: 'relations-clear', focusKey: 'relations:clear', onClick: function () { run(ctx, model.clearAction.command); } }) : null);
    });
    var items = [];
    if (model.areaFilterNotice) items.push(molecules.notice({ text: model.areaFilterNotice.text, tone: 'warning', testid: 'relations-area-notice', action: { label: model.areaFilterNotice.action.label, testid: 'relations-area-clear', onClick: function () { run(ctx, model.areaFilterNotice.action.command); } } }));
    if (model.hiddenRelatedNotice) {
      var hn = model.hiddenRelatedNotice;
      items.push(molecules.notice({ text: hn.text, tone: 'info', testid: 'relations-hidden-layer', action: hn.actions[0] ? { label: hn.actions[0].label, testid: 'relations-show-layer', onClick: function () { run(ctx, hn.actions[0].command); } } : null }));
    }
    if (model.root && model.empty) items.push(molecules.notice({ text: model.empty, tone: 'info', testid: 'relations-empty-notice' }));
    dom.replace(cache.notices, items);
    dom.replace(cache.legend,
      h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--related', 'aria-hidden': 'true' }), t(ctx, 'declaredRelation', 'Relación declarada')),
      h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--proposed', 'aria-hidden': 'true' }), t(ctx, 'proposedRelation', 'Relación propuesta')));
  }

  function ensureCanvas(ctx, cache, model) {
    if (cache.canvas && cache.body.contains(cache.canvas.el) && cache.canvasKey === model.cameraKey) return;
    if (cache.canvas) cache.canvas.destroy();
    cache.canvas = cache.api.createCanvas({ contextKey: model.cameraKey, label: t(ctx, 'repRelations', 'Relaciones') + ' · ' + model.root.name, ctx: ctx, testid: 'web-canvas' });
    cache.canvasKey = model.cameraKey;
    cache.body.className = 'twin-stage__body twin-stage__body--canvas';
    ctx.dom.replace(cache.body, cache.canvas.el);
    cache.structure = null;
    if (typeof ResizeObserver === 'function') {
      if (cache.observer) cache.observer.disconnect();
      cache.observer = new ResizeObserver(function () { if (cache.mode === 'canvas' && cache.layoutDirty && cache.lastModel) applyLayout(ctx, cache, cache.lastModel); });
      cache.observer.observe(cache.canvas.el);
    }
  }

  function render(stageEl, ctx) {
    var model = ctx.select('relationsModel');
    var state = stateOf(ctx);
    var dom = ctx.dom;
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.body)) {
      if (cache && cache.canvas) cache.canvas.destroy();
      if (cache && cache.observer) cache.observer.disconnect();
      cache = buildChrome(stageEl, ctx);
      caches.set(stageEl, cache);
    }
    cache.lastModel = model;
    renderChrome(ctx, cache, model);
    var search = searchSet(ctx, state);

    if (!model.root) {
      var pk = json(['picker', model.candidates.map(function (c) { return c.id; })]);
      if (cache.structure !== pk || cache.mode !== 'picker') {
        cache.structure = pk; cache.mode = 'picker';
        if (cache.canvas) { cache.canvas.destroy(); cache.canvas = null; }
        cache.body.className = 'twin-stage__body twin-stage__body--scroll';
        dom.preserveFocus(stageEl, function () { dom.replace(cache.body, rootPicker(ctx, model)); });
      }
      return;
    }

    if (model.listMode) {
      var lk = json({ r: model.rootId, g: model.groups.map(function (g) { return [g.id, g.items.map(function (i) { return i.id; })]; }), sel: model.selectedId, s: search ? Array.from(search) : null });
      if (cache.mode !== 'list' || cache.structure !== lk) {
        cache.structure = lk; cache.mode = 'list';
        if (cache.canvas) { cache.canvas.destroy(); cache.canvas = null; }
        cache.body.className = 'twin-stage__body twin-stage__body--scroll';
        dom.preserveScroll(cache.body, function () { dom.preserveFocus(stageEl, function () { dom.replace(cache.body, buildList(ctx, model, search)); }); });
      }
      return;
    }

    cache.mode = 'canvas';
    ensureCanvas(ctx, cache, model);
    var structure = json({ r: model.rootId, g: model.groups.map(function (g) { return [g.id, g.label, g.items.map(function (i) { return [i.id, i.relationLabel, i.badge, i.note, i.versionId]; })]; }) });
    var stateKey = json({ sel: model.selectedId, s: search ? Array.from(search) : null });
    if (structure !== cache.structure) {
      cache.structure = structure; cache.stateKey = stateKey;
      dom.preserveFocus(stageEl, function () { buildCanvasNodes(ctx, cache, model, search); });
    } else {
      if (stateKey !== cache.stateKey) {
        cache.stateKey = stateKey;
        cache.nodes.forEach(function (entry, key) {
          var id = key === 'root' ? model.rootId : key.slice(5);
          entry.el.classList.toggle('is-selected', model.selectedId === id);
          entry.el.setAttribute('aria-pressed', model.selectedId === id ? 'true' : 'false');
          entry.el.classList.toggle('is-dimmed', !!search && !search.has(id));
        });
        applyLayout(ctx, cache, model);
      } else if (cache.layoutDirty) applyLayout(ctx, cache, model);
    }
    cache.canvas.syncCamera(state);
  }

  return { id: 'relations', render: render };
});
