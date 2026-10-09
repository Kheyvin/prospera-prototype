/* features/web/processmap — strategic «Mapa de procesos» stage (spec §9.3, WEB-01 «Mapa»,
 * FR-011, JRN-04, AT-08). Bands (objective, direction, business, support, people, systems)
 * are flex rows inside the camera layer; declared relations between map entities are drawn
 * in the edge SVG from the measured node boxes. The objective traversal («Mostrar relaciones
 * del objetivo») is a highlight set computed by the selector: related nodes/edges get the
 * 2 px treatment, the rest is dimmed but visible. No band is fabricated: bands without data
 * show their message. List mode renders the same entities per band. */
Primus.module('features/web/processmap', function (require) {
  'use strict';

  var caches = new WeakMap();
  var MIN_WIDTH = 720;
  var BAND_CLASS = { objective: 'band--objective', direction: 'band--direction', business: 'band--business', support: 'band--support', people: 'band--people', systems: 'band--systems' };

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ }
    return fallback;
  }

  function json(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function stateOf(ctx) { return ctx.state || ctx.store.getState(); }
  function canvasApi(ctx) { return ctx.canvas || require('components/twin/canvas'); }

  function isKeyboard(event) {
    if (!event) return false;
    if (event.type === 'keydown' || event.type === 'keyup') return true;
    return event.type === 'click' && event.detail === 0;
  }

  function searchSet(ctx, state) {
    var s = state.web && state.web.search;
    if (!s || !s.open || !(s.query || '').trim()) return null;
    var set = new Set();
    (ctx.select('searchResults').results || []).forEach(function (r) { set.add(r.id); });
    return set;
  }

  function rectIn(el, layer) {
    var x = 0, y = 0, node = el;
    while (node && node !== layer) { x += node.offsetLeft || 0; y += node.offsetTop || 0; node = node.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth || 0, h: el.offsetHeight || 0 };
  }

  function selectEntity(ctx, id, event) {
    if (isKeyboard(event) && ctx.store.hasCommand && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: 'node:' + id });
    ctx.dispatch('selectEntity', { entityId: id });
  }

  function flags(e, model, search) {
    var hl = model.highlight;
    return {
      selected: !!e.selected,
      related: !!(hl && e.highlighted && hl.rootId !== e.id),
      root: !!(hl && hl.rootId === e.id),
      dimmed: (search ? !search.has(e.id) : false) || (!!hl && !e.highlighted && hl.rootId !== e.id)
    };
  }

  function applyFlags(el, f) {
    el.classList.toggle('is-selected', f.selected);
    el.classList.toggle('is-related', f.related);
    el.classList.toggle('is-root', f.root);
    el.classList.toggle('is-dimmed', f.dimmed);
    el.setAttribute('aria-pressed', f.selected ? 'true' : 'false');
  }

  function nodeFor(ctx, api, e, model, search) {
    var badges = [];
    if (e.proposed) badges.push({ label: t(ctx, 'labelProposed', 'Propuesto · por validar'), tone: 'proposed' });
    if (e.isDemo) badges.push({ label: t(ctx, 'labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' });
    var el = api.nodeButton({
      id: e.id, type: e.type, title: e.name, badges: badges, proposed: !!e.proposed, testid: 'node-' + e.id,
      meta: e.type === 'process' && e.attributes && e.attributes.detailed ? t(ctx, 'processDetailed', 'Con detalle') : null,
      onSelect: function (event) { selectEntity(ctx, e.id, event); }
    });
    applyFlags(el, flags(e, model, search));
    return el;
  }

  /* ---------- canvas ---------- */

  function buildBands(ctx, cache, model, search) {
    var h = ctx.dom.h;
    cache.nodes = new Map();
    var bands = model.bands.map(function (band) {
      var body;
      if (band.message && !band.entities.length) body = h('div', { class: 'band__body' }, h('p', { class: 'band__message' }, band.message));
      else if (!band.entities.length) body = h('div', { class: 'band__body' }, h('p', { class: 'band__message' }, t(ctx, 'noData', 'No hay información disponible para esta vista')));
      else body = h('div', { class: 'band__body' }, band.entities.map(function (e) { var el = nodeFor(ctx, cache.api, e, model, search); cache.nodes.set(e.id, { el: el, entity: e }); return el; }));
      var hl = model.highlight;
      var dimmed = !!hl && band.entities.length > 0 && !band.entities.some(function (e) { return e.highlighted || hl.rootId === e.id; });
      return h('section', { class: ['band', BAND_CLASS[band.id] || null, dimmed ? 'is-dimmed' : null], 'data-band-id': band.id, 'aria-label': band.label },
        h('div', { class: 'band__label' }, h('span', { class: 'band__title' }, band.label), band.subtitle ? h('span', { class: 'band__subtitle' }, band.subtitle) : null),
        body);
    });
    return h('div', { class: 'bands', 'data-testid': 'processmap-bands' }, bands, model.capabilitiesNote ? h('p', { class: 'panel-note' }, model.capabilitiesNote) : null);
  }

  function drawLines(ctx, cache, model) {
    var canvas = cache.canvas;
    if (!canvas || !cache.bandsEl) return;
    var layer = canvas.layer;
    var geometry = new Map();
    cache.nodes.forEach(function (entry, id) { geometry.set(id, rectIn(entry.el, layer)); });
    var hl = model.highlight;
    var specs = model.lines.map(function (l) {
      return { id: l.id, from: l.from, to: l.to, label: l.highlighted ? l.label : null, related: !!l.highlighted, selected: false, dimmed: !!hl && !l.highlighted, inferred: !!l.inferred, dashed: !!l.derived, router: 'curve' };
    });
    var width = Math.max(cache.bandsEl.offsetWidth || 0, MIN_WIDTH);
    var height = cache.bandsEl.offsetHeight || 0;
    canvas.setSize(width, height);
    try { cache.api.drawEdges(canvas.edges, specs, geometry, { router: 'curve' }); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
  }

  function ensureCanvas(ctx, cache, model) {
    if (cache.canvas && cache.body.contains(cache.canvas.el)) return;
    if (cache.canvas) cache.canvas.destroy();
    cache.canvas = cache.api.createCanvas({ contextKey: model.cameraKey || 'processmap', label: t(ctx, 'repProcessMap', 'Mapa de procesos') + ' · ' + model.title, ctx: ctx, testid: 'web-canvas' });
    cache.body.className = 'twin-stage__body twin-stage__body--canvas';
    ctx.dom.replace(cache.body, cache.canvas.el);
    cache.structure = null;
    if (typeof ResizeObserver === 'function') {
      if (cache.observer) cache.observer.disconnect();
      cache.observer = new ResizeObserver(function () { if (cache.mode === 'canvas' && cache.lastModel) { sizeBands(cache); drawLines(ctx, cache, cache.lastModel); } });
      cache.observer.observe(cache.canvas.el);
    }
  }

  function sizeBands(cache) {
    if (!cache.bandsEl || !cache.canvas) return;
    var vp = cache.canvas.el.clientWidth || 0;
    cache.bandsEl.style.width = Math.max(vp, MIN_WIDTH) + 'px';
  }

  /* ---------- list ---------- */

  function buildList(ctx, model, search) {
    var listMod = require('components/twin/entitylist');
    return listMod.entityList(ctx, {
      testid: 'web-list', title: model.title,
      groups: model.bands.map(function (band) {
        return { id: band.id, title: band.label, subtitle: band.subtitle, message: band.entities.length ? null : (band.message || t(ctx, 'noData')), items: band.entities.map(function (e) {
          var f = flags(e, model, search);
          return { ref: e, selected: f.selected, related: f.related, root: f.root, dimmed: f.dimmed, badge: e.proposed ? t(ctx, 'labelProposed', 'Propuesto · por validar') : null, testid: 'node-' + e.id, focusKey: 'node:' + e.id };
        }) };
      })
    });
  }

  /* ---------- chrome ---------- */

  function buildChrome(stageEl, ctx) {
    var h = ctx.dom.h;
    var cache = { api: canvasApi(ctx), nodes: new Map(), canvas: null, structure: null, stateKey: null, chromeKey: null, mode: null, bandsEl: null };
    cache.title = h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web' }, '');
    cache.note = h('p', { class: 'twin-stage__note' }, '');
    cache.controls = h('div', { class: 'twin-stage__controls' });
    cache.header = h('div', { class: 'twin-stage__header' }, h('div', { class: 'twin-stage__heading' }, cache.title, cache.note), cache.controls);
    cache.body = h('div', { class: 'twin-stage__body twin-stage__body--canvas' });
    cache.legend = h('div', { class: 'legend' });
    cache.counts = h('div', { class: 'counts', 'data-testid': 'processmap-counts' });
    cache.footer = h('div', { class: 'twin-stage__footer' }, cache.legend, cache.counts);
    stageEl.appendChild(cache.header); stageEl.appendChild(cache.body); stageEl.appendChild(cache.footer);
    return cache;
  }

  function renderChrome(ctx, cache, model) {
    var dom = ctx.dom, atoms = ctx.atoms, h = dom.h;
    var key = json({ t: model.title, c: model.counts, hl: model.highlight && [model.highlight.rootId, model.highlight.label], empty: model.empty, cap: model.capabilitiesNote });
    if (key === cache.chromeKey) return;
    cache.chromeKey = key;
    dom.setText(cache.title, model.title);
    dom.setText(cache.note, t(ctx, 'repProcessMap', 'Mapa de procesos'));
    dom.preserveFocus(cache.controls, function () {
      dom.replace(cache.controls, model.highlight ? atoms.button({ label: model.highlight.clearAction.label, variant: 'secondary', size: 'sm', icon: 'close', testid: 'processmap-clear-relations', focusKey: 'processmap:clear-relations',
        onClick: function () { ctx.dispatch(model.highlight.clearAction.command.type, model.highlight.clearAction.command.payload); } }) : null);
    });
    dom.replace(cache.legend,
      h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--objective', 'aria-hidden': 'true' }), t(ctx, 'labelProposed', 'Propuesto · por validar')),
      h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--default-line', 'aria-hidden': 'true' }), t(ctx, 'declaredRelation', 'Relación declarada')),
      model.highlight ? h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--related', 'aria-hidden': 'true' }), model.highlight.label) : null);
    dom.replace(cache.counts, h('span', { class: 'counts__item' }, model.counts.detailedText), h('span', { class: 'counts__item' }, model.counts.summaryText));
  }

  /* ---------- entry ---------- */

  function render(stageEl, ctx) {
    var model = ctx.select('processMapModel');
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

    if (model.empty && !model.bands.some(function (b) { return b.entities.length; })) {
      var ek = json(['empty', model.empty]);
      if (cache.structure !== ek) { cache.structure = ek; cache.mode = 'empty'; cache.body.className = 'twin-stage__body twin-stage__body--scroll'; dom.replace(cache.body, ctx.molecules.emptyState({ text: model.empty, icon: 'map', testid: 'processmap-empty' })); cache.canvas = null; }
      return;
    }

    if (model.listMode) {
      var lk = json({ b: model.bands.map(function (b) { return [b.id, b.entities.map(function (e) { return [e.id, e.selected, e.highlighted]; })]; }), hl: model.highlight && model.highlight.rootId, s: search ? Array.from(search) : null });
      if (cache.mode !== 'list' || lk !== cache.structure) {
        cache.structure = lk; cache.mode = 'list';
        cache.body.className = 'twin-stage__body twin-stage__body--scroll';
        dom.preserveScroll(cache.body, function () { dom.preserveFocus(stageEl, function () { dom.replace(cache.body, buildList(ctx, model, search)); }); });
        cache.canvas = null; cache.bandsEl = null;
      }
      return;
    }

    cache.mode = 'canvas';
    ensureCanvas(ctx, cache, model);
    var structure = json({ b: model.bands.map(function (b) { return [b.id, b.label, b.subtitle, b.message, b.entities.map(function (e) { return [e.id, e.name, e.proposed]; })]; }), cap: model.capabilitiesNote });
    var stateKey = json({ sel: model.selectedId, hl: model.highlight && [model.highlight.rootId, model.highlight.entityIds], s: search ? Array.from(search) : null, lines: model.lines.map(function (l) { return [l.id, l.highlighted]; }) });
    if (structure !== cache.structure) {
      cache.structure = structure; cache.stateKey = stateKey;
      dom.preserveFocus(stageEl, function () {
        var layer = cache.canvas.layer;
        Array.prototype.slice.call(layer.children).forEach(function (c) { if (c !== cache.canvas.edges) layer.removeChild(c); });
        cache.bandsEl = buildBands(ctx, cache, model, search);
        layer.appendChild(cache.bandsEl);
        sizeBands(cache);
        drawLines(ctx, cache, model);
      });
    } else if (stateKey !== cache.stateKey) {
      cache.stateKey = stateKey;
      model.bands.forEach(function (band) {
        var hl = model.highlight;
        var dimmedBand = !!hl && band.entities.length > 0 && !band.entities.some(function (e) { return e.highlighted || hl.rootId === e.id; });
        var bandEl = cache.bandsEl && cache.bandsEl.querySelector('[data-band-id="' + band.id + '"]');
        if (bandEl) bandEl.classList.toggle('is-dimmed', dimmedBand);
        band.entities.forEach(function (e) { var entry = cache.nodes.get(e.id); if (entry) applyFlags(entry.el, flags(e, model, search)); });
      });
      drawLines(ctx, cache, model);
    }
    cache.canvas.syncCamera(state);
  }

  return { id: 'processmap', render: render };
});
