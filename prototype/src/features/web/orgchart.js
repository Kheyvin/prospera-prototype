/* features/web/orgchart — strategic stage: organization chart (spec §9.2, WEB-01, AT-04).
 *
 * render(stageEl, ctx) is called on every store change while the stage is active. The
 * module keeps its DOM per stageEl (WeakMap) and updates incrementally: the canvas (camera)
 * survives every change; nodes are rebuilt only when the visible tree changes, otherwise
 * only their state classes are updated. Layout is absolute (two-pass: render, measure,
 * position); columns grow with their content so nothing overlaps. Lines are grouping
 * connectors only (organization → areas, area → its positions, position → occupants);
 * never between positions (spec: "no replicar líneas ambiguas entre puestos"). */
Primus.module('features/web/orgchart', function (require) {
  'use strict';

  var caches = new WeakMap();

  var PAD = 24;          // layer padding around the content
  var GAP_X = 32;        // gap between area columns
  var GAP_Y = 12;        // vertical gap between stacked boxes
  var INDENT = 24;       // indent of positions under their area, occupants under their position
  var ROOT_GAP = 36;     // vertical room for the «Gerencia General» edge
  var BAR_GAP = 28;      // distance between the top block and the horizontal bar / the areas
  var EXPAND = 28;       // .node-expand size
  var DEFAULT_W = 200;
  var DEFAULT_H = 56;

  /* ---------- helpers ---------- */

  function ui(ctx, key, fallback) {
    var table = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var v = table[key];
    return v === undefined || v === null ? fallback : v;
  }

  function canvasApi(ctx) {
    return ctx.canvas || require('components/twin/canvas');
  }

  function stateOf(ctx) { return ctx.state || ctx.store.getState(); }

  function sigReplacer(key, value) {
    if (key === 'entity' || key === 'attributes' || key === 'description' || key === 'candidates' || key === 'sources' || key === 'provenance') return undefined;
    return value;
  }

  function signature(value) { return JSON.stringify(value, sigReplacer); }

  function isEvent(v) { return !!(v && typeof v === 'object' && typeof v.type === 'string' && 'target' in v); }

  function eventOf(a, b) { return isEvent(a) ? a : (isEvent(b) ? b : null); }

  function isKeyboard(event) {
    if (!event) return false;
    if (event.type === 'keydown' || event.type === 'keyup') return true;
    return event.type === 'click' && event.detail === 0;
  }

  /* Search lens: set of matching entity ids while the search is open, else null. */
  function searchSet(ctx, state) {
    var s = state.web && state.web.search;
    if (!s || !s.open || !(s.query || '').trim()) return null;
    var results = ctx.select('searchResults');
    var set = new Set();
    (results.results || []).forEach(function (r) { set.add(r.id); });
    return set;
  }

  /* Rect of an element relative to the canvas layer (offset chain; unaffected by transforms). */
  function rectIn(el, layer) {
    var x = 0;
    var y = 0;
    var node = el;
    while (node && node !== layer) {
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return { x: x, y: y, w: el.offsetWidth || 0, h: el.offsetHeight || 0 };
  }

  function sizeOf(el) {
    var w = el.offsetWidth || 0;
    var h = el.offsetHeight || 0;
    return { w: w > 0 ? w : DEFAULT_W, h: h > 0 ? h : DEFAULT_H, measured: w > 0 && h > 0 };
  }

  function place(el, x, y) {
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
  }

  function svgPath(ctx, d, cls) {
    return ctx.dom.svg('path', { class: cls, d: d });
  }

  /* ---------- selection ---------- */

  function selectEntity(ctx, id, event, focusKey) {
    if (isKeyboard(event) && ctx.store.hasCommand && ctx.store.hasCommand('setFocusReturn')) {
      ctx.dispatch('setFocusReturn', { focusKey: focusKey });
    }
    ctx.dispatch('selectEntity', { entityId: id });
  }

  /* ---------- flat tree of the visible chart ---------- */

  function treeItems(model) {
    var items = [];
    function push(item) { items.push(item); return item; }
    var org = model.root && model.root.organization;
    if (org) push({ id: org.id, kind: 'organization', ref: org, selected: !!model.root.selected, expandable: false });
    var rootPos = model.root && model.root.position;
    if (rootPos) {
      push({ id: rootPos.id, kind: 'position', ref: rootPos.position, node: rootPos, parentId: org ? org.id : null, root: true,
        selected: !!rootPos.selected, highlighted: !!rootPos.highlighted, expandable: !!rootPos.expandable, expanded: !!rootPos.expanded,
        forced: model.depth === 'people' });
      if (rootPos.showOccupants) rootPos.occupants.forEach(function (o) {
        push({ id: o.id, kind: 'occupant', ref: o, parentId: rootPos.id, selected: model.selectedId === o.id,
          highlighted: !!(model.highlight && model.highlight.entityIds.indexOf(o.id) !== -1) });
      });
    }
    model.areas.forEach(function (area) {
      push({ id: area.id, kind: 'area', ref: area.area, node: area, selected: !!area.selected, highlighted: !!area.highlighted, neighbor: !!area.neighbor,
        expandable: !!area.expandable, expanded: !!area.expanded, forced: model.depth !== 'areas' });
      if (!area.showPositions) return;
      area.positions.forEach(function (pos) {
        push({ id: pos.id, kind: 'position', ref: pos.position, node: pos, parentId: area.id, selected: !!pos.selected, highlighted: !!pos.highlighted,
          expandable: !!pos.expandable, expanded: !!pos.expanded, forced: model.depth === 'people' });
        if (!pos.showOccupants) return;
        pos.occupants.forEach(function (o) {
          push({ id: o.id, kind: 'occupant', ref: o, parentId: pos.id, selected: model.selectedId === o.id,
            highlighted: !!(model.highlight && model.highlight.entityIds.indexOf(o.id) !== -1) });
        });
      });
    });
    return items;
  }

  function structureKey(model) {
    return JSON.stringify({ depth: model.depth, list: model.listMode, items: treeItems(model).map(function (i) { return [i.id, i.kind, i.parentId || null, i.expandable ? (i.expanded ? 1 : 0) : -1, i.forced ? 1 : 0]; }) });
  }

  function stateFlags(item, model, search) {
    var hl = model.highlight;
    var inSearch = search ? search.has(item.id) : true;
    var hlDim = hl ? !(item.highlighted || item.neighbor || hl.rootId === item.id) : false;
    return {
      selected: !!item.selected,
      related: !!(hl && item.highlighted && hl.rootId !== item.id),
      root: !!(hl && hl.rootId === item.id),
      neighbor: !!item.neighbor,
      dimmed: !inSearch || hlDim
    };
  }

  function applyFlags(el, flags) {
    el.classList.toggle('is-selected', flags.selected);
    el.classList.toggle('is-related', flags.related);
    el.classList.toggle('is-root', flags.root);
    el.classList.toggle('is-neighbor', flags.neighbor);
    el.classList.toggle('is-dimmed', flags.dimmed);
    el.setAttribute('aria-pressed', flags.selected ? 'true' : 'false');
  }

  /* ---------- node factory ---------- */

  function nodeSpec(ctx, item, model, search) {
    var ref = item.ref;
    var flags = stateFlags(item, model, search);
    var spec = {
      id: ref.id, type: ref.type, title: ref.name, testid: 'node-' + ref.id,
      selected: flags.selected, related: flags.related, dimmed: flags.dimmed,
      external: !!ref.external, proposed: !!ref.proposed, badges: [],
      onSelect: function (a, b) { selectEntity(ctx, ref.id, eventOf(a, b), 'node:' + ref.id); }
    };
    if (item.kind === 'position') {
      var n = item.node;
      spec.collective = !!n.collective;
      if (n.external) {
        spec.subtitle = n.externalLabel || model.externalLabel || 'Servicio externo';
        spec.extraClass = 'node--external';
      }
      if (n.collective || n.occupants.length > 1) {
        spec.meta = ctx.format.interpolate(ui(ctx, 'countOccupants', '{n} ocupantes'), { n: n.occupants.length });
      }
    } else if (item.kind === 'occupant') {
      if (ref.external) {
        spec.type = 'external';
        spec.subtitle = model.externalLabel || 'Servicio externo';
        spec.extraClass = 'node--external';
      }
    } else if (item.kind === 'area') {
      var a = item.node;
      if (a.supportLabel) spec.badges.push({ label: a.supportLabel, tone: 'brand' });
      spec.meta = a.counts.positionsText + ' · ' + a.counts.peopleText + (a.counts.externals ? ' · ' + a.counts.externalsText : '');
    }
    return spec;
  }

  function makeNode(ctx, api, spec) {
    var el = api.nodeButton(spec);
    if (!el.getAttribute('data-entity-id')) el.setAttribute('data-entity-id', spec.id);
    if (!el.getAttribute('data-focus-key')) el.setAttribute('data-focus-key', 'node:' + spec.id);
    if (!el.getAttribute('data-testid')) el.setAttribute('data-testid', spec.testid);
    if (spec.extraClass) el.classList.add(spec.extraClass);
    return el;
  }

  function expandButton(ctx, item, controlsId) {
    var label = (item.expanded ? ui(ctx, 'collapse', 'Contraer') : ui(ctx, 'expand', 'Expandir')) + ': ' + item.ref.name;
    return ctx.dom.h('button', {
      type: 'button', class: 'node-expand', 'aria-expanded': item.expanded ? 'true' : 'false', 'aria-label': label, title: label,
      'aria-controls': controlsId || null, 'data-testid': 'expand-' + item.id, 'data-focus-key': 'expand:' + item.id,
      on: { click: function () { ctx.dispatch('toggleExpand', { entityId: item.id }); } }
    }, ctx.icons.icon('chevronRight'));
  }

  /* ---------- canvas layout ---------- */

  function buildCanvasNodes(ctx, cache, model, search) {
    var api = cache.api;
    var layer = cache.canvas.layer;
    var items = treeItems(model);
    var dom = ctx.dom;
    // Remove previous nodes/expanders (keep the edges svg).
    Array.prototype.slice.call(layer.children).forEach(function (child) {
      if (child !== cache.canvas.edges) layer.removeChild(child);
    });
    cache.nodes = new Map();
    items.forEach(function (item) {
      var spec = nodeSpec(ctx, item, model, search);
      var el = makeNode(ctx, api, spec);
      applyFlags(el, stateFlags(item, model, search));
      layer.appendChild(el);
      var entry = { item: item, el: el, expand: null };
      if (item.expandable && !item.forced) {
        entry.expand = expandButton(ctx, item, null);
        layer.appendChild(entry.expand);
      }
      cache.nodes.set(item.id, entry);
    });
    dom.clear(cache.canvas.edges);
    layoutCanvas(ctx, cache, model);
  }

  function layoutCanvas(ctx, cache, model) {
    var nodes = cache.nodes;
    if (!nodes || !nodes.size) return;
    var edges = cache.canvas.edges;
    var dom = ctx.dom;
    var allMeasured = true;
    var sizes = new Map();
    nodes.forEach(function (entry, id) {
      var s = sizeOf(entry.el);
      if (!s.measured) allMeasured = false;
      sizes.set(id, s);
    });
    cache.layoutDirty = !allMeasured;

    var geometry = new Map();
    var lines = [];
    function set(id, x, y) { var s = sizes.get(id); geometry.set(id, { x: x, y: y, w: s.w, h: s.h }); }

    // Columns (areas).
    var cols = model.areas.map(function (area) {
      var width = sizes.get(area.id).w;
      var positions = area.showPositions ? area.positions : [];
      positions.forEach(function (pos) {
        width = Math.max(width, INDENT + sizes.get(pos.id).w);
        if (pos.showOccupants) pos.occupants.forEach(function (o) { width = Math.max(width, 2 * INDENT + sizes.get(o.id).w); });
      });
      return { area: area, width: width + (positions.length ? EXPAND / 2 : 0) };
    });
    var totalWidth = 0;
    cols.forEach(function (c, i) { c.x = PAD + totalWidth; totalWidth += c.width + (i < cols.length - 1 ? GAP_X : 0); });
    var contentWidth = Math.max(totalWidth, 2 * DEFAULT_W);
    var centerX = PAD + contentWidth / 2;

    // Top block: organization, root position, its occupants.
    var y = PAD;
    var org = model.root && model.root.organization;
    var rootPos = model.root && model.root.position;
    if (org) { set(org.id, centerX - sizes.get(org.id).w / 2, y); y += sizes.get(org.id).h; }
    var topBlockBottomId = org ? org.id : null;
    if (rootPos && nodes.has(rootPos.id)) {
      if (org) y += ROOT_GAP;
      set(rootPos.id, centerX - sizes.get(rootPos.id).w / 2, y);
      y += sizes.get(rootPos.id).h;
      topBlockBottomId = rootPos.id;
      if (org) {
        var gO = geometry.get(org.id);
        var gR = geometry.get(rootPos.id);
        lines.push({ kind: 'edge', d: 'M' + (gR.x + gR.w / 2) + ',' + gR.y + ' L' + (gO.x + gO.w / 2) + ',' + (gO.y + gO.h), label: model.root.edgeLabel, lx: gR.x + gR.w / 2 + 8, ly: (gR.y + gO.y + gO.h) / 2 + 4 });
      }
      if (rootPos.showOccupants) {
        var occY = y + GAP_Y;
        var baseX = geometry.get(rootPos.id).x;
        var busX = baseX + INDENT / 2;
        var lastCenter = null;
        rootPos.occupants.forEach(function (o) {
          if (!nodes.has(o.id)) return;
          set(o.id, baseX + INDENT, occY);
          var g = geometry.get(o.id);
          lastCenter = g.y + g.h / 2;
          lines.push({ kind: 'group', d: 'M' + busX + ',' + lastCenter + ' L' + g.x + ',' + lastCenter });
          occY += g.h + GAP_Y;
        });
        if (lastCenter !== null) {
          var gp = geometry.get(rootPos.id);
          lines.push({ kind: 'group', d: 'M' + busX + ',' + (gp.y + gp.h) + ' L' + busX + ',' + lastCenter });
          y = occY - GAP_Y;
        }
      }
    }

    // Bar and areas.
    var barY = y + BAR_GAP;
    var areasTop = barY + BAR_GAP;
    if (cols.length && topBlockBottomId) {
      var gTop = geometry.get(topBlockBottomId);
      var startX = cols[0].x + sizes.get(cols[0].area.id).w / 2;
      var endX = cols[cols.length - 1].x + sizes.get(cols[cols.length - 1].area.id).w / 2;
      var cx = gTop.x + gTop.w / 2;
      lines.push({ kind: 'group', d: 'M' + cx + ',' + (y + (rootPos && rootPos.showOccupants && nodes.has(rootPos.id) ? 0 : 0)) + ' L' + cx + ',' + barY });
      lines.push({ kind: 'group', d: 'M' + Math.min(startX, cx) + ',' + barY + ' L' + Math.max(endX, cx) + ',' + barY });
    }
    var maxBottom = areasTop;
    cols.forEach(function (col) {
      var area = col.area;
      set(area.id, col.x, areasTop);
      var gA = geometry.get(area.id);
      lines.push({ kind: 'group', d: 'M' + (gA.x + gA.w / 2) + ',' + barY + ' L' + (gA.x + gA.w / 2) + ',' + gA.y });
      var yy = gA.y + gA.h + GAP_Y + 4;
      var busX = col.x + INDENT / 2;
      var lastPosCenter = null;
      if (area.showPositions) area.positions.forEach(function (pos) {
        if (!nodes.has(pos.id)) return;
        set(pos.id, col.x + INDENT, yy);
        var gP = geometry.get(pos.id);
        lastPosCenter = gP.y + gP.h / 2;
        lines.push({ kind: 'group', d: 'M' + busX + ',' + lastPosCenter + ' L' + gP.x + ',' + lastPosCenter });
        yy += gP.h + GAP_Y;
        if (pos.showOccupants) {
          var busX2 = col.x + INDENT + INDENT / 2;
          var lastOcc = null;
          pos.occupants.forEach(function (o) {
            if (!nodes.has(o.id)) return;
            set(o.id, col.x + 2 * INDENT, yy);
            var gO2 = geometry.get(o.id);
            lastOcc = gO2.y + gO2.h / 2;
            lines.push({ kind: 'group', d: 'M' + busX2 + ',' + lastOcc + ' L' + gO2.x + ',' + lastOcc });
            yy += gO2.h + GAP_Y;
          });
          if (lastOcc !== null) lines.push({ kind: 'group', d: 'M' + busX2 + ',' + (gP.y + gP.h) + ' L' + busX2 + ',' + lastOcc });
        }
      });
      if (lastPosCenter !== null) lines.push({ kind: 'group', d: 'M' + busX + ',' + (gA.y + gA.h) + ' L' + busX + ',' + lastPosCenter });
      maxBottom = Math.max(maxBottom, yy);
    });

    // Apply geometry.
    nodes.forEach(function (entry, id) {
      var g = geometry.get(id);
      if (!g) return;
      place(entry.el, g.x, g.y);
      if (entry.expand) place(entry.expand, g.x + g.w - EXPAND / 2, g.y + g.h / 2 - EXPAND / 2);
    });
    var width = PAD + contentWidth + PAD + EXPAND;
    var height = maxBottom + PAD;

    // Edges.
    dom.clear(edges);
    edges.setAttribute('width', String(Math.ceil(width)));
    edges.setAttribute('height', String(Math.ceil(height)));
    edges.setAttribute('viewBox', '0 0 ' + Math.ceil(width) + ' ' + Math.ceil(height));
    lines.forEach(function (line) {
      edges.appendChild(svgPath(ctx, line.d, line.kind === 'group' ? 'edge edge--group-line' : 'edge'));
      if (line.label) edges.appendChild(dom.svg('text', { class: 'edge-label', x: line.lx, y: line.ly }, line.label));
    });
    if (typeof cache.canvas.setSize === 'function') cache.canvas.setSize(width, height);
    cache.geometry = geometry;
  }

  function updateCanvasStates(ctx, cache, model, search) {
    var items = treeItems(model);
    items.forEach(function (item) {
      var entry = cache.nodes && cache.nodes.get(item.id);
      if (!entry) return;
      applyFlags(entry.el, stateFlags(item, model, search));
    });
  }

  /* ---------- list mode ---------- */

  function buildList(ctx, cache, model, search) {
    var dom = ctx.dom;
    var molecules = ctx.molecules;
    var hl = model.highlight;

    function link(ref, extra) {
      var flags = stateFlags(extra.item, model, search);
      var el = molecules.entityLink({
        entity: ref, typeLabel: ref.typeLabel, icon: ref.icon, testid: 'node-' + ref.id, focusKey: 'node:' + ref.id,
        selected: flags.selected, meta: extra.meta || null, badge: extra.badge || null,
        onOpen: function (entity, event) { selectEntity(ctx, ref.id, event, 'node:' + ref.id); }
      });
      el.setAttribute('aria-pressed', flags.selected ? 'true' : 'false');
      if (flags.related) el.classList.add('is-related');
      if (flags.root) el.classList.add('is-root');
      if (flags.dimmed) el.classList.add('is-dimmed');
      return el;
    }

    function row(item, ref, extra, children) {
      var listId = 'orglist-' + item.id;
      var rowEl = dom.h('div', { class: 'entity-list__row' },
        item.expandable && !item.forced ? expandButton(ctx, item, listId) : null,
        link(ref, { item: item, meta: extra.meta, badge: extra.badge }));
      var li = dom.h('li', { 'data-entity-id': item.id }, rowEl,
        children && children.length ? dom.h('ul', { class: 'entity-list__tree', id: listId, role: 'list' }, children) : null);
      return li;
    }

    function occupantRows(occupants, parentId) {
      return occupants.map(function (o) {
        var item = { id: o.id, kind: 'occupant', ref: o, parentId: parentId, selected: model.selectedId === o.id, highlighted: !!(hl && hl.entityIds.indexOf(o.id) !== -1) };
        return row(item, o, { badge: o.external ? (model.externalLabel || 'Servicio externo') : null }, []);
      });
    }

    function positionRows(positions, parentId, forced) {
      return positions.map(function (pos) {
        var item = { id: pos.id, kind: 'position', ref: pos.position, node: pos, parentId: parentId, selected: !!pos.selected, highlighted: !!pos.highlighted, expandable: !!pos.expandable, expanded: !!pos.expanded, forced: forced };
        var meta = pos.collective || pos.occupants.length > 1 ? ctx.format.interpolate(ui(ctx, 'countOccupants', '{n} ocupantes'), { n: pos.occupants.length }) : null;
        return row(item, pos.position, { meta: meta, badge: pos.external ? (pos.externalLabel || model.externalLabel || 'Servicio externo') : null },
          pos.showOccupants ? occupantRows(pos.occupants, pos.id) : []);
      });
    }

    var orgChildren = [];
    if (model.root && model.root.position) orgChildren = orgChildren.concat(positionRows([model.root.position], model.root.organization ? model.root.organization.id : null, model.depth === 'people'));
    model.areas.forEach(function (area) {
      var item = { id: area.id, kind: 'area', ref: area.area, node: area, selected: !!area.selected, highlighted: !!area.highlighted, neighbor: !!area.neighbor, expandable: !!area.expandable, expanded: !!area.expanded, forced: model.depth !== 'areas' };
      orgChildren.push(row(item, area.area, { meta: area.counts.positionsText + ' · ' + area.counts.peopleText, badge: area.supportLabel || null },
        area.showPositions ? positionRows(area.positions, area.id, model.depth === 'people') : []));
    });

    var tree;
    if (model.root && model.root.organization) {
      var orgItem = { id: model.root.organization.id, kind: 'organization', ref: model.root.organization, selected: !!model.root.selected };
      tree = dom.h('ul', { class: 'entity-list__tree', role: 'list' }, row(orgItem, model.root.organization, {}, orgChildren));
    } else {
      tree = dom.h('ul', { class: 'entity-list__tree', role: 'list' }, orgChildren);
    }
    return dom.h('div', { class: 'entity-list', 'data-testid': 'web-list' },
      dom.h('section', { class: 'entity-list__group' },
        dom.h('h3', { class: 'entity-list__group-title' }, model.title),
        model.note ? dom.h('p', { class: 'panel-note' }, model.note) : null,
        tree));
  }

  /* ---------- stage chrome ---------- */

  function buildChrome(stageEl, ctx) {
    var dom = ctx.dom;
    var cache = { api: canvasApi(ctx), nodes: null, canvas: null, structure: null, stateKey: null, chromeKey: null, listEl: null, mode: null };
    cache.title = dom.h('h2', { class: 'twin-stage__title', tabindex: '-1' }, '');
    cache.note = dom.h('p', { class: 'twin-stage__note' }, '');
    cache.controls = dom.h('div', { class: 'twin-stage__controls' });
    cache.header = dom.h('div', { class: 'twin-stage__header' },
      dom.h('div', { class: 'twin-stage__heading' }, cache.title, cache.note),
      cache.controls);
    cache.body = dom.h('div', { class: 'twin-stage__body twin-stage__body--canvas' });
    cache.legend = dom.h('div', { class: 'legend' });
    cache.counts = dom.h('div', { class: 'counts', 'data-testid': 'orgchart-counts' });
    cache.footer = dom.h('div', { class: 'twin-stage__footer' }, cache.legend, cache.counts);
    stageEl.appendChild(cache.header);
    stageEl.appendChild(cache.body);
    stageEl.appendChild(cache.footer);
    return cache;
  }

  function renderChrome(ctx, cache, model) {
    var dom = ctx.dom;
    var atoms = ctx.atoms;
    var key = JSON.stringify({ t: model.title, n: model.note, l: model.legend, x: model.externalLabel, c: model.counts, hl: model.highlight ? model.highlight.label : null, exp: model.expandedIds.length, areas: model.areas.length });
    if (key === cache.chromeKey) return;
    cache.chromeKey = key;
    dom.setText(cache.title, model.title);
    dom.setText(cache.note, model.note || '');
    cache.note.hidden = !model.note;

    dom.preserveFocus(cache.controls, function () {
      dom.replace(cache.controls,
        atoms.button({ label: model.actions.expandAll.label, variant: 'ghost', size: 'sm', icon: 'plus', testid: 'expand-all', focusKey: 'orgchart:expand-all',
          onClick: function () { ctx.dispatch(model.actions.expandAll.command.type, model.actions.expandAll.command.payload); } }),
        atoms.button({ label: model.actions.collapseAll.label, variant: 'ghost', size: 'sm', icon: 'minus', testid: 'collapse-all', focusKey: 'orgchart:collapse-all',
          disabled: !model.expandedIds.length,
          onClick: function () { ctx.dispatch(model.actions.collapseAll.command.type, model.actions.collapseAll.command.payload); } }),
        model.highlight ? atoms.button({ label: model.highlight.clearAction.label, variant: 'secondary', size: 'sm', icon: 'close', testid: 'orgchart-clear-relations', focusKey: 'orgchart:clear-relations',
          onClick: function () { ctx.dispatch(model.highlight.clearAction.command.type, model.highlight.clearAction.command.payload); } }) : null);
    });

    dom.replace(cache.legend,
      model.legend ? dom.h('span', { class: 'legend__item' }, dom.h('span', { class: 'legend__swatch legend__swatch--default-line' }), model.legend) : null,
      model.externalLabel ? dom.h('span', { class: 'legend__item' }, dom.h('span', { class: 'legend__swatch legend__swatch--external' }), model.externalLabel) : null,
      model.highlight ? dom.h('span', { class: 'legend__item' }, dom.h('span', { class: 'legend__swatch legend__swatch--related' }), model.highlight.label) : null);

    var c = model.counts;
    dom.replace(cache.counts,
      dom.h('span', { class: 'counts__item' }, c.areasText),
      dom.h('span', { class: 'counts__item' }, c.positionsText),
      dom.h('span', { class: 'counts__item' }, c.peopleText),
      dom.h('span', { class: 'counts__item' }, c.externalsText));
  }

  function ensureCanvas(ctx, cache, model) {
    if (cache.canvas && cache.body.contains(cache.canvas.el)) return;
    if (cache.canvas && typeof cache.canvas.destroy === 'function') cache.canvas.destroy();
    cache.canvas = cache.api.createCanvas({ contextKey: model.cameraKey || 'orgchart', label: ui(ctx, 'repOrgchart', 'Organigrama') + ' · ' + model.title, ctx: ctx, testid: 'web-canvas' });
    cache.body.className = 'twin-stage__body twin-stage__body--canvas';
    ctx.dom.replace(cache.body, cache.canvas.el);
    cache.structure = null;
    cache.nodes = null;
    if (typeof ResizeObserver === 'function' && !cache.observer) {
      cache.observer = new ResizeObserver(function () {
        if (cache.mode === 'canvas' && cache.layoutDirty && cache.lastModel) layoutCanvas(ctx, cache, cache.lastModel);
      });
      cache.observer.observe(cache.canvas.el);
    } else if (cache.observer) {
      cache.observer.disconnect();
      cache.observer.observe(cache.canvas.el);
    }
  }

  /* ---------- entry point ---------- */

  function render(stageEl, ctx) {
    var model = ctx.select('orgChartModel');
    var state = stateOf(ctx);
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.body)) {
      if (cache && cache.canvas && typeof cache.canvas.destroy === 'function') cache.canvas.destroy();
      if (cache && cache.observer) cache.observer.disconnect();
      cache = buildChrome(stageEl, ctx);
      caches.set(stageEl, cache);
    }
    cache.lastModel = model;
    renderChrome(ctx, cache, model);
    var search = searchSet(ctx, state);
    var dom = ctx.dom;

    if (model.listMode) {
      var listKey = signature({ m: model, s: search ? Array.from(search) : null });
      if (cache.mode !== 'list' || listKey !== cache.listKey) {
        cache.listKey = listKey;
        cache.mode = 'list';
        cache.body.className = 'twin-stage__body twin-stage__body--scroll';
        dom.preserveScroll(cache.body, function () {
          dom.preserveFocus(stageEl, function () {
            dom.replace(cache.body, buildList(ctx, cache, model, search));
          });
        });
        cache.structure = null;
        cache.nodes = null;
      }
      return;
    }

    cache.mode = 'canvas';
    ensureCanvas(ctx, cache, model);
    var structure = structureKey(model);
    var stateKey = signature({ sel: model.selectedId, hl: model.highlight ? [model.highlight.rootId, model.highlight.entityIds, model.highlight.neighbors] : null, s: search ? Array.from(search) : null });
    if (structure !== cache.structure) {
      cache.structure = structure;
      cache.stateKey = stateKey;
      dom.preserveFocus(stageEl, function () { buildCanvasNodes(ctx, cache, model, search); });
    } else {
      if (stateKey !== cache.stateKey) {
        cache.stateKey = stateKey;
        updateCanvasStates(ctx, cache, model, search);
      }
      if (cache.layoutDirty) layoutCanvas(ctx, cache, model);
    }
    if (typeof cache.canvas.syncCamera === 'function') cache.canvas.syncCamera(state);
  }

  return { id: 'orgchart', render: render, treeItems: treeItems };
});
