/* features/architecture — tab 1 «Arquitectura de la solución» (spec §10.1, FR-003, JRN-01, AT-02).
 *
 * Renders pack.solution as a light C4 container diagram composed with HTML + an SVG edge
 * overlay (no camera): zone boxes, the PRIMUS boundary inside each zone, actor glyphs, node
 * buttons, the eight directed edges with arrow markers and labels, a list-mode equivalent
 * (table + connection lists) and a complementary inspector. Selection and list mode live in
 * state.app (setArchitectureSelection / setArchitectureListMode); «Ver conexiones» is a local
 * highlight toggle. Every visible string comes from the pack (solution.json / presentation.ui);
 * the few generic fallbacks are listed in the integrator report. */
Primus.module('features/architecture', function () {
  'use strict';

  var KIND_CLASS = { application: 'node--component', store: 'node--store', external: 'node--external' };
  var LABEL_LINE_CHARS = 26;
  var LABEL_LINE_HEIGHT = 14;
  var EDGE_GAP = 3;
  var PAIR_OFFSET = 14;
  var MARKER_PREFIX = 'arch-marker-';

  function asArray(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v === null || v === undefined ? '' : String(v); }

  /* Wraps an edge label into lines of about LABEL_LINE_CHARS characters (word boundaries). */
  function wrapLabel(label) {
    var words = str(label).split(/\s+/).filter(Boolean);
    var lines = [];
    var current = '';
    words.forEach(function (word) {
      if (current && (current + ' ' + word).length > LABEL_LINE_CHARS) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  /* Cubic bezier route between two boxes; `shift` offsets parallel edges perpendicular to the route. */
  function route(a, b, shift) {
    var dx = (b.x + b.w / 2) - (a.x + a.w / 2);
    var dy = (b.y + b.h / 2) - (a.y + a.h / 2);
    var horizontal = Math.abs(dx) >= Math.abs(dy);
    var start, end, c1, c2;
    if (horizontal) {
      var sy = a.y + a.h / 2 + shift;
      var ey = b.y + b.h / 2 + shift;
      start = { x: dx >= 0 ? a.x + a.w + EDGE_GAP : a.x - EDGE_GAP, y: sy };
      end = { x: dx >= 0 ? b.x - EDGE_GAP : b.x + b.w + EDGE_GAP, y: ey };
      var mx = start.x + (end.x - start.x) / 2;
      c1 = { x: mx, y: start.y };
      c2 = { x: mx, y: end.y };
    } else {
      var sx = a.x + a.w / 2 + shift;
      var ex = b.x + b.w / 2 + shift;
      start = { x: sx, y: dy >= 0 ? a.y + a.h + EDGE_GAP : a.y - EDGE_GAP };
      end = { x: ex, y: dy >= 0 ? b.y - EDGE_GAP : b.y + b.h + EDGE_GAP };
      var my = start.y + (end.y - start.y) / 2;
      c1 = { x: start.x, y: my };
      c2 = { x: end.x, y: my };
    }
    var mid = {
      x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8,
      y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8
    };
    var d = 'M' + r(start.x) + ' ' + r(start.y) + ' C' + r(c1.x) + ' ' + r(c1.y) + ', ' + r(c2.x) + ' ' + r(c2.y) + ', ' + r(end.x) + ' ' + r(end.y);
    return { d: d, mid: mid };
  }

  function r(n) { return Math.round(n * 10) / 10; }

  function relativeRect(el, origin) {
    var b = el.getBoundingClientRect();
    return { x: b.left - origin.left, y: b.top - origin.top, w: b.width, h: b.height };
  }

  function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

  return {
    id: 'architecture',

    mount: function (panelEl, ctx) {
      var dom = ctx.dom;
      var h = dom.h;
      var svg = dom.svg;
      var atoms = ctx.atoms;
      var molecules = ctx.molecules;
      var icons = ctx.icons;
      var store = ctx.store;
      var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
      var sol = (ctx.pack && ctx.pack.solution) || {};
      var labels = sol.labels || {};
      var zones = asArray(sol.zones);
      var nodes = asArray(sol.nodes);
      var edges = asArray(sol.edges);
      var actors = asArray(sol.actors);
      var lifecycle = sol.lifecycle || {};
      var ctas = asArray(sol.ctas);
      var boundary = sol.systemBoundary || {};
      var boundaryLabel = str(boundary.label || labels.system || 'PRIMUS');

      var nodeById = {};
      nodes.forEach(function (n) { nodeById[n.id] = n; });
      var zoneById = {};
      zones.forEach(function (z) { zoneById[z.id] = z; });
      var inBoundary = {};
      asArray(boundary.nodeIds).forEach(function (id) { inBoundary[id] = true; });

      /* Generic chrome strings: pack.ui first, then a Spanish fallback (reported to the integrator). */
      function text(key, fallback) {
        if (labels[key]) return str(labels[key]);
        if (ui[key]) return str(ui[key]);
        return fallback;
      }
      var T = {
        viewConnections: text('viewConnections', 'Ver conexiones'),
        listView: text('listView', 'Ver como lista'),
        responsibility: text('responsibility', 'Responsabilidad'),
        location: text('location', 'Ubicación'),
        state: text('state', 'Estado'),
        decision: text('decision', 'Detalle adicional'),
        inputs: text('inputs', 'Entradas'),
        outputs: text('outputs', 'Salidas'),
        connections: text('connections', 'Conexiones'),
        actors: text('actors', 'Actores'),
        outsideSystem: text('outsideSystem', 'Fuera de PRIMUS'),
        legend: text('legend', 'Leyenda'),
        noInputs: text('noInputs', 'Sin conexiones entrantes'),
        noOutputs: text('noOutputs', 'Sin conexiones salientes'),
        inspector: str(ui.inspector || 'Inspector'),
        closeInspector: str(ui.closeInspector || 'Cerrar ficha'),
        facts: str(ui.facts || 'Datos'),
        diagram: str(ui.architectureDiagram || 'Diagrama de arquitectura'),
        parts: str(ui.architectureParts || 'Partes de la solución'),
        emptyInspector: str(sol.emptyInspector || 'Selecciona una parte para conocer su función'),
        proposed: str(sol.stateLabel || 'Propuesto')
      };
      var listColumns = asArray(labels.listColumns);
      var COLUMN_FALLBACK = [T.parts, T.location, T.state, T.decision, T.responsibility, T.inputs, T.outputs];

      /* ── Derived data ────────────────────────────────────────────────── */
      function edgesOf(nodeId) {
        return edges.filter(function (e) { return e.from === nodeId || e.to === nodeId; });
      }
      function actorsTargeting(nodeId) {
        return actors.filter(function (a) { return asArray(a.targetNodeIds).indexOf(nodeId) !== -1; });
      }
      function nodeName(id) { var n = nodeById[id]; return n ? str(n.name) : str(id); }
      function zoneLabel(node) { var z = node && zoneById[node.zoneId]; return z ? str(z.label) : ''; }

      function selectionId(state) { return (state.app && state.app.architectureSelection) || null; }
      function listMode(state) { return !!(state.app && state.app.architectureListMode); }

      var local = { connectionsOn: false };

      function buildModel(state) {
        return { selection: selectionId(state), listMode: listMode(state), connections: local.connectionsOn };
      }

      function highlight(model) {
        var sel = model.selection;
        var on = !!(sel && model.connections);
        var relatedNodes = {};
        var relatedEdges = {};
        if (on) {
          edgesOf(sel).forEach(function (e) {
            relatedEdges[e.id] = true;
            relatedNodes[e.from === sel ? e.to : e.from] = true;
          });
        }
        return { on: on, selection: sel, nodes: relatedNodes, edges: relatedEdges };
      }

      /* ── Dispatch helpers ────────────────────────────────────────────── */
      function dispatch(type, payload) {
        if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload);
        return store.dispatch(type, payload);
      }
      function navigate(target) {
        if (typeof ctx.navigate === 'function') return ctx.navigate(target);
        return dispatch('navigateTo', { target: target });
      }
      function select(nodeId) {
        var current = selectionId(store.getState());
        var next = current === nodeId ? null : nodeId;
        dispatch('setArchitectureSelection', { nodeId: next });
        var node = next && nodeById[next];
        if (node) dom.announce(str(node.name) + ' · ' + str(node.subtitle) + ' · ' + str(node.locationLabel));
      }
      function deselect(returnFocusTo) {
        dispatch('setArchitectureSelection', { nodeId: null });
        if (returnFocusTo) {
          var target = panelEl.querySelector('[data-focus-key="arch:' + returnFocusTo + '"]');
          if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
        }
      }

      /* ── Static header ───────────────────────────────────────────────── */
      var heading = h('h2', {
        class: 'narrative__title', id: 'architecture-title', tabindex: '-1',
        'data-focus-key': 'tabpanel-heading:architecture'
      }, str(sol.title));

      var header = h('div', { class: 'narrative__header' },
        heading,
        sol.intro ? h('p', { class: 'narrative__intro' }, str(sol.intro)) : null);

      /* ── Toolbar ─────────────────────────────────────────────────────── */
      var stageId = 'architecture-stage';
      var listToggle = atoms.button({
        label: T.listView, variant: 'secondary', size: 'sm', icon: 'list',
        pressed: false, controls: stageId, testid: 'arch-list-toggle', focusKey: 'arch-list-toggle',
        onClick: function () {
          var on = !listMode(store.getState());
          dispatch('setArchitectureListMode', { on: on });
          dom.announce(on ? T.listView : str(ui.mapView || T.diagram));
        }
      });
      var toolbar = h('div', { class: 'narrative__toolbar' },
        h('span', { class: 'text-sm muted' }, str(labels.zones || T.location) + ': ' + zones.map(function (z) { return str(z.label); }).join(' · ')),
        h('div', { class: 'cluster cluster--sm' }, listToggle));

      /* ── Node button (diagram) ───────────────────────────────────────── */
      function nodeButton(node) {
        var pending = node.decision === 'pending';
        var el = h('button', {
          type: 'button',
          class: ['node', KIND_CLASS[node.kind] || 'node--component', pending ? 'node--pending' : null],
          'data-entity-id': node.id,
          'data-focus-key': 'arch:' + node.id,
          'data-testid': 'arch-node-' + node.id,
          'aria-pressed': 'false',
          on: { click: function () { select(node.id); } }
        },
        h('span', { class: 'node__head' },
          icons.icon(node.icon || 'system', { extraClass: 'node__icon' }),
          h('span', { class: 'node__name' }, str(node.name)),
          node.secondaryIcon ? icons.icon(node.secondaryIcon, { extraClass: 'node__icon' }) : null),
        node.subtitle ? h('span', { class: 'node__subtitle' }, str(node.subtitle)) : null,
        node.locationLabel ? h('span', { class: 'node__meta' }, str(node.locationLabel)) : null,
        h('span', { class: 'node__badges' },
          atoms.badge({ label: str(node.stateLabel || T.proposed), tone: 'proposed' }),
          pending ? atoms.badge({ label: str(node.decisionLabel), tone: 'warning', icon: false }) : null));
        return el;
      }

      function actorChip(actor) {
        return atoms.chip({
          label: str(actor.label), icon: 'person',
          attrs: { 'data-actor-id': actor.id, 'data-focus-key': 'arch-actor:' + actor.id }
        });
      }

      function zoneBox(zone) {
        var own = nodes.filter(function (n) { return n.zoneId === zone.id; });
        var inside = own.filter(function (n) { return inBoundary[n.id]; });
        var outside = own.filter(function (n) { return !inBoundary[n.id]; });
        var zoneActors = actors.filter(function (a) {
          var first = nodeById[asArray(a.targetNodeIds)[0]];
          return first && first.zoneId === zone.id;
        });
        var kindClass = zone.kind === 'external' ? 'zone--external' : (zone.kind === 'vps' ? 'zone--vps' : null);
        var kindIcon = zone.kind === 'external' ? 'cloud' : (zone.kind === 'vps' ? 'database' : 'monitor');
        return h('div', { class: ['zone', kindClass, 'stack', 'stack--sm'], 'data-zone-id': zone.id, role: 'group', 'aria-label': str(zone.label) },
          h('span', { class: 'zone__label' }, icons.icon(kindIcon), str(zone.label)),
          zone.note ? h('p', { class: 'text-xs muted' }, str(zone.note)) : null,
          zoneActors.length ? h('div', { class: 'stack stack--xs' },
            h('span', { class: 'eyebrow' }, T.actors),
            h('div', { class: 'cluster cluster--sm', role: 'list', 'aria-label': T.actors },
              zoneActors.map(function (a) { var c = actorChip(a); c.setAttribute('role', 'listitem'); return c; }))) : null,
          inside.length ? h('div', { class: 'boundary', role: 'group', 'aria-label': boundaryLabel },
            h('div', { class: 'boundary__label' }, boundaryLabel),
            h('div', { class: 'zone__body' }, inside.map(nodeButton))) : null,
          outside.length ? h('div', { class: 'stack stack--xs' },
            h('span', { class: 'eyebrow' }, T.outsideSystem),
            h('div', { class: 'zone__body' }, outside.map(nodeButton))) : null);
      }

      /* VPS zone first, the other zones stacked in the second cell: adjacency holds in the
       * two-column layout (web/desktop → service leftwards, Claude → AI downwards) and in the
       * single-column stack below 768 px (VPS, user device, AI), so no edge crosses a zone. */
      function diagramGrid() {
        var vps = zones.filter(function (z) { return z.kind === 'vps'; });
        var rest = zones.filter(function (z) { return z.kind !== 'vps'; });
        var cells = [];
        vps.forEach(function (z) { cells.push(zoneBox(z)); });
        if (rest.length) cells.push(h('div', { class: 'stack' }, rest.map(zoneBox)));
        return h('div', { class: 'arch-grid' }, cells);
      }

      var edgeLayer = svg('svg', { class: 'canvas__edges', 'aria-hidden': 'true', width: '0', height: '0' });
      var figure = h('div', {
        class: 'narrative__figure', role: 'group', 'aria-label': T.diagram, 'data-testid': 'arch-diagram'
      }, edgeLayer, diagramGrid());

      /* ── Edge drawing (after layout) ─────────────────────────────────── */
      function marker(name) {
        return svg('marker', {
          id: MARKER_PREFIX + name, markerWidth: '10', markerHeight: '8', refX: '9', refY: '4',
          orient: 'auto', markerUnits: 'userSpaceOnUse'
        }, svg('path', { d: 'M0 0 L10 4 L0 8 z', class: ['edge-marker', name === 'default' ? null : 'edge-marker--' + name] }));
      }

      function labelNode(mid, label, muted) {
        var lines = wrapLabel(label);
        var textEl = svg('text', {
          class: ['edge-label', muted ? 'edge-label--muted' : null],
          x: r(mid.x), y: r(mid.y - ((lines.length - 1) * LABEL_LINE_HEIGHT) / 2 + 4),
          'text-anchor': 'middle'
        }, lines.map(function (line, i) {
          return svg('tspan', { x: r(mid.x), dy: i === 0 ? '0' : String(LABEL_LINE_HEIGHT) }, line);
        }));
        return textEl;
      }

      var drawScheduled = false;
      function scheduleDraw() {
        if (drawScheduled) return;
        drawScheduled = true;
        var raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : function (fn) { return setTimeout(fn, 0); };
        raf(function () { drawScheduled = false; draw(); });
      }

      function draw() {
        if (!figure.isConnected || figure.closest('[hidden]')) return;
        var origin = figure.getBoundingClientRect();
        if (!origin.width || !origin.height) return;
        var model = lastModel || buildModel(store.getState());
        var hl = highlight(model);
        var width = Math.round(figure.clientWidth || origin.width);
        var height = Math.round(figure.scrollHeight || origin.height);
        dom.setAttrs(edgeLayer, { width: String(width), height: String(height), style: { width: width, height: height } }, true);

        var rects = {};
        var buttons = figure.querySelectorAll('.node[data-entity-id]');
        for (var i = 0; i < buttons.length; i++) rects[buttons[i].getAttribute('data-entity-id')] = relativeRect(buttons[i], origin);
        var actorRects = {};
        var chips = figure.querySelectorAll('[data-actor-id]');
        for (var j = 0; j < chips.length; j++) actorRects[chips[j].getAttribute('data-actor-id')] = relativeRect(chips[j], origin);

        var children = [svg('defs', null, marker('default'), marker('related'), marker('muted'), marker('selected'))];

        actors.forEach(function (actor) {
          var from = actorRects[actor.id];
          if (!from) return;
          asArray(actor.targetNodeIds).forEach(function (targetId) {
            var to = rects[targetId];
            if (!to) return;
            var related = hl.on && hl.selection === targetId;
            var dimmed = hl.on && !related;
            var path = route(from, to, 0);
            children.push(svg('path', {
              d: path.d,
              class: ['edge', 'edge--exchange', related ? 'edge--related' : null, dimmed ? 'edge--dimmed' : null],
              'marker-end': 'url(#' + MARKER_PREFIX + (related ? 'related' : 'muted') + ')',
              'data-actor-id': actor.id
            }));
          });
        });

        var pairs = {};
        edges.forEach(function (e) { var k = pairKey(e.from, e.to); pairs[k] = (pairs[k] || 0) + 1; });
        var pairSeen = {};
        var labelNodes = [];
        edges.forEach(function (e) {
          var from = rects[e.from];
          var to = rects[e.to];
          if (!from || !to) return;
          var k = pairKey(e.from, e.to);
          var shift = 0;
          if (pairs[k] > 1) {
            pairSeen[k] = (pairSeen[k] || 0) + 1;
            shift = pairSeen[k] === 1 ? -PAIR_OFFSET : PAIR_OFFSET;
          }
          var related = !!hl.edges[e.id];
          var dimmed = hl.on && !related;
          var path = route(from, to, shift);
          children.push(svg('path', {
            d: path.d,
            class: ['edge', related ? 'edge--related' : null, dimmed ? 'edge--dimmed' : null],
            'marker-end': 'url(#' + MARKER_PREFIX + (related ? 'related' : 'default') + ')',
            'data-edge-id': e.id
          }));
          labelNodes.push({ mid: path.mid, label: e.label, muted: dimmed });
        });
        /* Labels on top of every line, each with a background plate measured after insertion. */
        var labelGroup = svg('g', { class: 'arch-edge-labels' });
        children.push(labelGroup);
        dom.replace(edgeLayer, children);
        labelNodes.forEach(function (item) {
          var textEl = labelNode(item.mid, item.label, item.muted);
          labelGroup.appendChild(textEl);
          var box = null;
          try { box = textEl.getBBox(); } catch (err) { box = null; }
          if (box && box.width) {
            var plate = svg('rect', {
              class: 'edge-label__bg', x: r(box.x - 4), y: r(box.y - 2), width: r(box.width + 8), height: r(box.height + 4), rx: '4'
            });
            labelGroup.insertBefore(plate, textEl);
          }
        });
      }

      /* Edge classes follow the model without rebuilding the diagram. */
      function applyDiagramState(model) {
        var hl = highlight(model);
        var buttons = figure.querySelectorAll('.node[data-entity-id]');
        for (var i = 0; i < buttons.length; i++) {
          var btn = buttons[i];
          var id = btn.getAttribute('data-entity-id');
          var selected = id === model.selection;
          btn.classList.toggle('is-selected', selected);
          btn.classList.toggle('is-related', !!hl.nodes[id]);
          btn.classList.toggle('is-dimmed', hl.on && !selected && !hl.nodes[id]);
          btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
        }
        scheduleDraw();
      }

      /* ── List mode ───────────────────────────────────────────────────── */
      function textList(items, emptyText) {
        if (!items.length) return h('span', { class: 'muted' }, emptyText);
        return molecules.list({ plain: true, items: items.map(function (t, i) { return { key: i, node: str(t) }; }) });
      }

      function listView(model) {
        var columnIds = ['part', 'location', 'state', 'decision', 'responsibility', 'inputs', 'outputs'];
        var columns = columnIds.map(function (cid, i) {
          return { id: cid, label: str(listColumns[i] || COLUMN_FALLBACK[i]), rowHeader: i === 0 };
        });
        var rows = nodes.map(function (node) {
          var pending = node.decision === 'pending';
          return {
            key: node.id,
            entityId: node.id,
            selected: node.id === model.selection,
            testid: 'arch-node-' + node.id,
            focusKey: 'arch:' + node.id,
            onSelect: function () { select(node.id); },
            cells: [
              { node: h('span', { class: 'stack stack--xs' },
                h('span', { class: 'cluster cluster--sm' }, icons.icon(node.icon || 'system'), h('strong', null, str(node.name))),
                h('span', { class: 'text-xs muted' }, str(node.subtitle))) },
              { text: str(node.locationLabel) },
              { node: atoms.badge({ label: str(node.stateLabel || T.proposed), tone: 'proposed' }) },
              { node: h('span', { class: 'stack stack--xs' },
                atoms.badge({ label: str(node.decisionLabel), tone: pending ? 'warning' : 'info', icon: false }),
                node.decisionNote ? h('span', { class: 'text-xs muted' }, str(node.decisionNote)) : null) },
              { text: str(node.description) },
              { node: textList(asArray(node.inputs), T.noInputs) },
              { node: textList(asArray(node.outputs), T.noOutputs) }
            ]
          };
        });
        var table = molecules.table({
          id: 'arch-table', caption: T.parts, columns: columns, rows: rows, cardMode: true,
          testid: 'arch-table', emptyText: str(ui.noData || T.emptyInspector)
        });
        var actorItems = actors.map(function (a) {
          return { key: a.id, node: str(a.label) + ' → ' + asArray(a.targetNodeIds).map(nodeName).join(', ') };
        });
        var hl = highlight(model);
        var edgeItems = edges.map(function (e) {
          var touches = e.from === model.selection || e.to === model.selection;
          return {
            key: e.id,
            className: hl.edges[e.id] ? 'is-related' : null,
            node: h('span', { class: 'cluster cluster--sm' },
              h('span', { class: 'mono text-xs muted' }, str(e.id)),
              h('span', { class: touches ? null : 'muted' }, nodeName(e.from) + ' → ' + nodeName(e.to) + ' · ' + str(e.label)))
          };
        });
        return h('div', { class: 'stack', 'data-testid': 'arch-list' },
          table,
          h('section', { class: 'stack stack--sm', 'aria-labelledby': 'arch-list-actors' },
            h('h3', { class: 'inspector__section-title', id: 'arch-list-actors' }, T.actors),
            molecules.list({ plain: true, items: actorItems })),
          h('section', { class: 'stack stack--sm', 'aria-labelledby': 'arch-list-edges' },
            h('h3', { class: 'inspector__section-title', id: 'arch-list-edges' }, T.connections),
            molecules.list({ plain: true, items: edgeItems })));
      }

      /* ── Legend, notes, caption ──────────────────────────────────────── */
      var legendItems = asArray(sol.legend);
      var legend = legendItems.length ? h('div', { class: 'legend', role: 'list', 'aria-label': T.legend },
        h('span', { class: 'legend__title' }, T.legend),
        legendItems.map(function (item, i) {
          var swatch = i === 0 ? 'legend__swatch--default-line' : (i === legendItems.length - 1 ? 'legend__swatch--proposed' : null);
          return h('span', { class: 'legend__item', role: 'listitem' },
            swatch ? h('span', { class: ['legend__swatch', swatch], 'aria-hidden': 'true' }) : null,
            str(item));
        })) : null;
      var notes = asArray(sol.notes);
      var notesEl = notes.length ? molecules.list({
        plain: true, extraClass: 'narrative__footer',
        items: notes.map(function (n, i) { return { key: i, node: str(n) }; })
      }) : null;
      var caption = sol.caption ? h('p', { class: 'narrative__caption' }, str(sol.caption)) : null;

      /* ── Inspector ───────────────────────────────────────────────────── */
      function connectionLinks(node) {
        var items = [];
        edgesOf(node.id).forEach(function (e) {
          var outgoing = e.from === node.id;
          var other = nodeById[outgoing ? e.to : e.from];
          if (!other) return;
          items.push(molecules.entityLink({
            entity: { id: other.id, name: str(other.name) },
            icon: other.icon || 'system',
            typeLabel: str(other.subtitle),
            relationLabel: (outgoing ? '→ ' : '← ') + str(e.label),
            meta: str(e.id),
            testid: 'arch-link-' + other.id,
            focusKey: 'arch-link:' + e.id,
            onOpen: function () { select(other.id); }
          }));
        });
        return items;
      }

      function inspectorContent(model) {
        var node = model.selection && nodeById[model.selection];
        if (!node) {
          return h('div', { class: 'inspector' },
            molecules.emptyState({ text: T.emptyInspector, icon: 'info', compact: true, testid: 'arch-inspector-empty' }));
        }
        var pending = node.decision === 'pending';
        var connected = edgesOf(node.id).length + actorsTargeting(node.id).length;
        return h('div', { class: 'inspector' },
          h('div', { class: 'inspector__header' },
            h('div', { class: 'inspector__nav' },
              h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon(node.icon || 'system'), str(node.subtitle)),
              atoms.iconButton({
                icon: 'close', ariaLabel: T.closeInspector, testid: 'arch-inspector-close', size: 'sm',
                onClick: function () { deselect(node.id); }
              })),
            h('h3', { class: 'inspector__title', tabindex: '-1', 'data-testid': 'arch-inspector-heading', 'data-focus-key': 'arch-inspector-heading' }, str(node.name)),
            zoneLabel(node) ? h('p', { class: 'inspector__subtitle' }, zoneLabel(node)) : null,
            h('div', { class: 'cluster cluster--sm' },
              atoms.badge({ label: str(node.stateLabel || T.proposed), tone: 'proposed' }),
              atoms.badge({ label: str(node.decisionLabel), tone: pending ? 'warning' : 'info', icon: false }))),
          h('section', { class: 'inspector__section' },
            h('h4', { class: 'inspector__section-title' }, T.responsibility),
            h('p', null, str(node.description))),
          h('section', { class: 'inspector__section' },
            h('h4', { class: 'inspector__section-title' }, T.facts),
            molecules.keyValue({
              missingText: ctx.format.missing(),
              rows: [
                { label: T.location, value: node.locationNote
                  ? h('span', { class: 'stack stack--xs' }, h('span', null, str(node.locationLabel)), h('span', { class: 'text-xs muted' }, str(node.locationNote)))
                  : str(node.locationLabel) },
                { label: T.state, value: str(node.stateLabel || T.proposed) },
                { label: T.decision, value: node.decisionNote
                  ? h('span', { class: 'stack stack--xs' }, h('span', null, str(node.decisionLabel)), h('span', { class: 'text-xs muted' }, str(node.decisionNote)))
                  : str(node.decisionLabel) }
              ]
            })),
          h('section', { class: 'inspector__section' },
            h('h4', { class: 'inspector__section-title' }, T.inputs),
            textList(asArray(node.inputs), T.noInputs)),
          h('section', { class: 'inspector__section' },
            h('h4', { class: 'inspector__section-title' }, T.outputs),
            textList(asArray(node.outputs), T.noOutputs)),
          h('section', { class: 'inspector__section' },
            h('h4', { class: 'inspector__section-title' }, T.connections + ' · ' + connected),
            h('div', { class: 'inspector__links' }, connectionLinks(node))),
          h('div', { class: 'inspector__actions' },
            atoms.button({
              label: T.viewConnections, variant: 'secondary', size: 'sm', icon: 'link',
              pressed: model.connections, testid: 'arch-connections', focusKey: 'arch-connections',
              onClick: function () {
                local.connectionsOn = !local.connectionsOn;
                update(store.getState(), true);
                var count = edgesOf(node.id).length;
                dom.announce(local.connectionsOn ? T.connections + ' · ' + count : T.viewConnections + ' · ' + str(ui.no || 'No'));
              }
            })));
      }

      var inspectorEl = h('aside', {
        class: 'narrative__inspector', role: 'complementary', 'aria-label': T.inspector, 'data-testid': 'arch-inspector'
      }, inspectorContent(buildModel(store.getState())));

      /* ── Lifecycle panel, CTAs ───────────────────────────────────────── */
      var steps = asArray(lifecycle.steps);
      var lifecycleEl = (lifecycle.title || steps.length) ? h('section', { class: 'narrative__section', 'aria-labelledby': 'architecture-lifecycle' },
        h('h3', { class: 'narrative__section-title', id: 'architecture-lifecycle' }, str(lifecycle.title)),
        h('ol', { class: 'narrative__steps' }, steps.map(function (s) { return h('li', null, str(s)); })),
        lifecycle.note ? h('p', { class: 'narrative__footer' }, str(lifecycle.note)) : null) : null;

      var ctasEl = ctas.length ? h('div', { class: 'narrative__ctas' }, ctas.map(function (cta, i) {
        var target = cta.target || {};
        return atoms.button({
          label: str(cta.label), variant: target.tab === 'web' ? 'primary' : 'secondary',
          icon: target.tab === 'web' ? 'map' : 'forward',
          testid: 'arch-cta-' + str(cta.id || target.tab || i),
          onClick: function () { navigate(target); }
        });
      })) : null;

      /* ── Assembly ────────────────────────────────────────────────────── */
      var stage = h('div', { class: 'narrative__stage', id: stageId }, toolbar, figure, caption, legend, notesEl);
      var split = h('div', { class: 'narrative__split' }, stage, inspectorEl);
      var root = h('div', { class: 'narrative', 'data-testid': 'architecture' }, header, split, lifecycleEl, ctasEl);
      dom.replace(panelEl, root);

      /* Escape: close the inspector (deselect) when no dialog is open; focus returns to the node. */
      dom.onKey(panelEl, {
        Escape: function () {
          var state = store.getState();
          if (state.app.modal || state.app.aboutOpen) return false;
          var sel = selectionId(state);
          if (!sel) return false;
          deselect(sel);
          return true;
        }
      });

      /* ── Updates ─────────────────────────────────────────────────────── */
      var lastModel = null;
      var currentListEl = null;

      function update(state, force) {
        var model = buildModel(state);
        var json = JSON.stringify(model);
        var prev = lastModel;
        if (!force && prev && JSON.stringify(prev) === json) return;
        lastModel = model;

        listToggle.setAttribute('aria-pressed', model.listMode ? 'true' : 'false');
        listToggle.classList.toggle('is-pressed', model.listMode);

        if (model.listMode) {
          figure.hidden = true;
          dom.preserveFocus(stage, function () {
            var next = listView(model);
            if (currentListEl) stage.replaceChild(next, currentListEl); else stage.insertBefore(next, figure.nextSibling);
            currentListEl = next;
          });
        } else {
          if (currentListEl) { stage.removeChild(currentListEl); currentListEl = null; }
          figure.hidden = false;
          applyDiagramState(model);
        }

        var selectionChanged = !prev || prev.selection !== model.selection || prev.connections !== model.connections;
        if (selectionChanged || force) {
          dom.preserveScroll(inspectorEl, function () {
            dom.preserveFocus(inspectorEl, function () {
              dom.replace(inspectorEl, inspectorContent(model));
            });
          });
        }
      }

      function maybeFocusHeading(state) {
        var fr = state.app && state.app.focusReturn;
        if (!fr || fr.focusKey !== 'tabpanel-heading:architecture') return;
        if (state.app.activeTab !== 'architecture') return;
        var raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : function (fn) { return setTimeout(fn, 0); };
        raf(function () {
          if (panelEl.hidden || panelEl.closest('[hidden]')) return;
          try { heading.focus({ preventScroll: false }); } catch (err) { /* ignore */ }
          var current = store.getState().app.focusReturn;
          if (current && current.focusKey === 'tapanel-heading:architecture') return;
          if (current && current.focusKey === 'tabpanel-heading:architecture' && store.hasCommand && store.hasCommand('setFocusReturn')) {
            dispatch('setFocusReturn', { focusReturn: null });
          }
          scheduleDraw();
        });
      }

      update(store.getState());
      store.subscribe(function (state, info) {
        var changed = (info && info.changed) || [];
        if (changed.indexOf('app') === -1) return;
        update(state);
        if (info.type === 'selectTab' || info.type === 'navigateTo') scheduleDraw();
        maybeFocusHeading(state);
      });

      /* Redraw edges whenever the figure's size changes (panel shown, viewport resized, zoom). */
      if (typeof ResizeObserver === 'function') {
        var observer = new ResizeObserver(function () { scheduleDraw(); });
        observer.observe(figure);
      } else if (typeof window !== 'undefined') {
        window.addEventListener('resize', scheduleDraw);
      }
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(scheduleDraw, function () {});
      }
      scheduleDraw();
    }
  };
});
