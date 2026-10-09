/* features/web/flow — process flow stage (spec §10.4 WEB-04 / WEB-06, FR-012, AT-11/AT-12).
 *
 * Stage module for `web.processView === 'flow'` without an activity key. It renders
 * `select('flowModel')`: version buttons, the «Tipo de pago» variant selector of the AS-IS
 * flow, the swimlane canvas (lanes = roles, Cliente actor above the lanes, sequence
 * columns, decision diamonds, loop edges routed below the lanes, multi-role groups with
 * their subtasks, the SPERANT chip), the list-mode alternative, the legend and notes, the
 * «Contexto adicional de la fuente» disclosures and the «Documentos por tipo de pago»
 * panel of TO-BE 2. The DOM is cached per stage element and re-rendered by region when
 * the corresponding part of the model changes. No animation, no durations. */
Primus.module('features/web/flow', function (require) {
  'use strict';

  /* Geometry mirrors ds/extensions.css (CONTRACTS §9). */
  var G = {
    nodeMinWidth: 176, nodeMaxWidth: 240, nodeMinHeight: 56, gap: 24,
    decision: 112, event: 56, laneHeight: 168, laneLabel: 144,
    columnGap: 64, padX: 32, padY: 24, actorHeight: 128, frameHead: 32, framePad: 12,
    loopGap: 36, loopStep: 26, bottomPad: 40
  };

  var instances = new WeakMap();

  /* ---------- small helpers ---------- */

  function fallbacks() {
    try { return require('core/selectors').UI_FALLBACKS || {}; } catch (e) { return {}; }
  }

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    var fb = fallbacks();
    if (fb[key] !== undefined) return fb[key];
    return fallback;
  }

  function json(value) {
    try { return JSON.stringify(value === undefined ? null : value); } catch (e) { return String(Math.random()); }
  }

  function dispatchCommand(ctx, command) {
    if (!command) return null;
    if (typeof command === 'string') return ctx.dispatch(command, {});
    return ctx.dispatch(command.type, command.payload || {});
  }

  function isKeyboardEvent(ev) {
    if (!ev) return false;
    if (ev.type === 'keydown' || ev.type === 'keyup') return true;
    return ev.type === 'click' && ev.detail === 0;
  }

  function entityLink(ctx, ref, options) {
    var o = options || {};
    var m = ctx.molecules;
    return m.entityLink({
      entity: { id: ref.id, name: ref.name, type: ref.type },
      typeLabel: ref.typeLabel,
      icon: ref.icon || ref.type,
      relationLabel: o.relationLabel || null,
      versionId: o.versionId || null,
      testid: o.testid || ('link-' + ref.id),
      badge: o.badge || null,
      compact: o.compact !== false,
      showType: !!o.showType,
      selected: !!o.selected,
      focusKey: o.focusKey || ('link:' + ref.id),
      onOpen: function (entity, ev) {
        if (o.onOpen) return o.onOpen(entity, ev);
        if (isKeyboardEvent(ev)) ctx.dispatch('setFocusReturn', { focusKey: o.focusKey || ('link:' + ref.id) });
        return ctx.dispatch('selectEntity', { entityId: ref.id, versionId: o.versionId || undefined });
      }
    });
  }

  function selectCommand(ctx, command, focusKey, ev) {
    if (isKeyboardEvent(ev) && focusKey) ctx.dispatch('setFocusReturn', { focusKey: focusKey });
    return dispatchCommand(ctx, command);
  }

  function listOf(ctx, items, mapFn, extra) {
    var h = ctx.dom.h;
    var li = items.map(function (item, i) { return h('li', { class: 'list__item' }, mapFn(item, i)); });
    return h(extra && extra.ordered ? 'ol' : 'ul', { class: ['list', extra && extra.className], 'aria-label': extra && extra.label }, li);
  }

  /* ---------- pure layout ---------- */

  function nonLoopPreds(edges) {
    var map = {};
    edges.forEach(function (e) { if (!e.loop) (map[e.to] = map[e.to] || []).push(e.from); });
    return map;
  }

  /* Column of every node: longest path over non-loop edges, then loop-only targets get a
   * column of their own right after the decision that feeds them (later columns shift). */
  function computeColumns(nodes, edges) {
    var cols = {};
    var preds = nonLoopPreds(edges);
    var ids = nodes.map(function (n) { return n.id; });
    var visiting = {};
    function col(id) {
      if (cols[id] !== undefined) return cols[id];
      if (visiting[id]) return 0;
      visiting[id] = true;
      var p = preds[id] || [];
      var c = 0;
      p.forEach(function (pid) { if (ids.indexOf(pid) !== -1) c = Math.max(c, col(pid) + 1); });
      visiting[id] = false;
      cols[id] = c;
      return c;
    }
    ids.forEach(col);
    var loopOnly = ids.filter(function (id) {
      var hasIn = edges.some(function (e) { return e.to === id; });
      return hasIn && !(preds[id] && preds[id].length);
    });
    loopOnly.sort(function (a, b) {
      var sa = edges.filter(function (e) { return e.to === a; })[0];
      var sb = edges.filter(function (e) { return e.to === b; })[0];
      return (sa ? cols[sa.from] : 0) - (sb ? cols[sb.from] : 0);
    });
    loopOnly.forEach(function (id) {
      var src = edges.filter(function (e) { return e.to === id; })[0];
      var target = src ? cols[src.from] + 1 : cols[id];
      ids.forEach(function (other) { if (other !== id && cols[other] >= target) cols[other] += 1; });
      cols[id] = target;
    });
    return cols;
  }

  function defaultSize(kind) {
    if (kind === 'decision') return { w: G.decision, h: G.decision };
    if (kind === 'start' || kind === 'end' || kind === 'event') return { w: G.event, h: G.event };
    return { w: G.nodeMinWidth, h: G.nodeMinHeight };
  }

  /* Returns the full geometry: lanes, actor row, node boxes, group frames, loop routes. */
  function layoutFlow(model, sizes) {
    var lanes = model.lanes || [];
    var nodes = model.nodes || [];
    var edges = model.edges || [];
    var groups = {};
    (model.groups || []).forEach(function (g) { groups[g.id] = g; });
    var cols = computeColumns(nodes, edges);
    var laneIndex = {};
    lanes.forEach(function (l, i) { laneIndex[l.id] = i; });

    function size(id, kind) {
      var s = sizes && sizes.get ? sizes.get(id) : null;
      var d = defaultSize(kind);
      return { w: s && s.w ? s.w : d.w, h: s && s.h ? s.h : d.h };
    }

    /* Items to place: ordinary nodes and the subtasks of group nodes. */
    var items = [];
    nodes.forEach(function (n) {
      var group = n.group && groups[n.id] && groups[n.id].subtasks && groups[n.id].subtasks.length ? groups[n.id] : null;
      if (group) {
        group.subtasks.forEach(function (s) {
          items.push({ id: s.id, kind: 'subtask', laneId: s.laneId || n.laneId, col: cols[n.id], size: size(s.id, 'task'), groupId: n.id });
        });
      } else {
        items.push({ id: n.id, kind: n.kind, laneId: n.laneId, col: cols[n.id], size: size(n.id, n.kind) });
      }
    });

    /* Column widths. */
    var colCount = 0;
    items.forEach(function (it) { colCount = Math.max(colCount, it.col + 1); });
    var colW = [];
    for (var c = 0; c < colCount; c++) colW[c] = 0;
    items.forEach(function (it) {
      var extra = it.groupId ? G.framePad * 2 : 0;
      colW[it.col] = Math.max(colW[it.col], it.size.w + extra);
    });
    var colX = [];
    var x = G.laneLabel + G.padX;
    for (c = 0; c < colCount; c++) { colX[c] = x; x += colW[c] + G.columnGap; }
    var contentRight = colCount ? colX[colCount - 1] + colW[colCount - 1] + G.padX : G.laneLabel + G.padX * 2;

    /* Lane heights (grow with measured nodes and group frames). */
    var laneH = lanes.map(function () { return G.laneHeight; });
    items.forEach(function (it) {
      var li = laneIndex[it.laneId];
      if (li === undefined) return;
      var need = it.size.h + G.padY * 2 + (it.groupId ? G.frameHead * 2 : 0);
      laneH[li] = Math.max(laneH[li], need);
    });

    var actorH = model.externalActor && model.externalActor.visible !== false ? G.actorHeight : 0;
    var laneY = [];
    var y = actorH;
    lanes.forEach(function (l, i) { laneY[i] = y; y += laneH[i]; });
    var lanesBottom = y;

    /* Node boxes. */
    var geometry = new Map();
    items.forEach(function (it) {
      var li = laneIndex[it.laneId];
      var top = li === undefined ? actorH : laneY[li];
      var hgt = li === undefined ? G.laneHeight : laneH[li];
      var cx = colX[it.col] + colW[it.col] / 2;
      geometry.set(it.id, { x: Math.round(cx - it.size.w / 2), y: Math.round(top + (hgt - it.size.h) / 2), w: it.size.w, h: it.size.h, kind: it.kind, laneId: it.laneId, col: it.col, groupId: it.groupId || null });
    });

    /* Group frames spanning the lanes of their subtasks. */
    var frames = [];
    nodes.forEach(function (n) {
      var g = groups[n.id];
      if (!(n.group && g && g.subtasks && g.subtasks.length)) return;
      var boxes = g.subtasks.map(function (s) { return geometry.get(s.id); }).filter(Boolean);
      if (!boxes.length) return;
      var minX = Math.min.apply(null, boxes.map(function (b) { return b.x; })) - G.framePad;
      var maxX = Math.max.apply(null, boxes.map(function (b) { return b.x + b.w; })) + G.framePad;
      var minY = Math.min.apply(null, boxes.map(function (b) { return b.y; })) - G.frameHead;
      var maxY = Math.max.apply(null, boxes.map(function (b) { return b.y + b.h; })) + G.framePad;
      var box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY, kind: 'group', col: cols[n.id], laneId: n.laneId };
      geometry.set(n.id, box);
      frames.push({ id: n.id, box: box });
    });

    /* Cliente actor above the lanes, centred over its exchange nodes. */
    var actor = null;
    if (actorH) {
      var ex = (model.externalActor.exchanges || []).map(function (e) { return geometry.get(e.nodeId); }).filter(Boolean);
      var s = size(model.externalActor.entity.id, 'actor');
      var cxA = ex.length ? ex.reduce(function (sum, b) { return sum + b.x + b.w / 2; }, 0) / ex.length : G.laneLabel + G.padX + s.w / 2;
      actor = { x: Math.round(Math.max(G.laneLabel + G.padX, cxA - s.w / 2)), y: Math.round((actorH - s.h) / 2), w: s.w, h: s.h, kind: 'actor' };
      geometry.set(model.externalActor.entity.id, actor);
    }

    /* Backward loop edges routed below the lanes. */
    var loops = [];
    var loopIndex = 0;
    edges.forEach(function (e) {
      var a = geometry.get(e.from);
      var b = geometry.get(e.to);
      if (!a || !b) return;
      if (!(e.loop && a.x > b.x)) return;
      var ly = lanesBottom + G.loopGap + loopIndex * G.loopStep;
      loopIndex += 1;
      var x1 = a.x + a.w / 2;
      var x2 = b.x + b.w / 2;
      loops.push({ id: e.id, points: [{ x: x1, y: a.y + a.h }, { x: x1, y: ly }, { x: x2, y: ly }, { x: x2, y: b.y + b.h }] });
    });
    var height = lanesBottom + (loopIndex ? G.loopGap + loopIndex * G.loopStep : 0) + G.bottomPad;

    return {
      cols: cols, colX: colX, colW: colW, lanes: lanes.map(function (l, i) { return { id: l.id, y: laneY[i], h: laneH[i] }; }),
      actorHeight: actorH, actor: actor, geometry: geometry, frames: frames, loops: loops,
      width: Math.max(contentRight, G.laneLabel + G.padX * 2 + G.nodeMinWidth), height: height, lanesBottom: lanesBottom
    };
  }

  /* ---------- canvas rendering ---------- */

  function nodeSpec(ctx, model, n, inst) {
    var a = n.activity;
    var type = n.kind === 'task' ? 'activity' : n.kind;
    var subtitle = null;
    if (a && a.roles && a.roles.length) subtitle = a.roles.map(function (r) { return r.name; }).join(' · ');
    var badges = [];
    if (n.restricted) badges.push({ label: t(ctx, 'restricted', 'Acceso restringido'), tone: 'warning' });
    if (a && a.entity && a.entity.isDemo) badges.push({ label: t(ctx, 'labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' });
    var focusKey = 'flow-node:' + n.id;
    return {
      id: n.id, type: type, title: n.label, subtitle: subtitle, meta: n.kind === 'task' ? n.id : null, badges: badges,
      testid: n.testid, selected: !!n.selected, versionId: n.versionId,
      related: !!model.selectedNodeId && !n.selected && (model.edges || []).some(function (e) { return e.highlighted && (e.from === n.id || e.to === n.id); }),
      describedBy: inst.legendId,
      onSelect: function (ev) { return selectCommand(ctx, n.command, focusKey, ev); },
      onActivate: function () { return n.activity ? dispatchCommand(ctx, n.instructionCommand) : dispatchCommand(ctx, n.command); }
    };
  }

  function subtaskSpec(ctx, model, group, s) {
    var groupNode = (model.nodes || []).filter(function (n) { return n.id === group.id; })[0];
    var focusKey = 'flow-node:' + s.id;
    return {
      id: s.id, type: 'activity', title: s.name, subtitle: s.role ? s.role.name : null, meta: s.id, badges: [],
      testid: s.testid || ('node-' + s.id), selected: !!(groupNode && groupNode.selected), versionId: groupNode ? groupNode.versionId : null,
      extraClass: 'node--compact',
      onSelect: function (ev) { return groupNode ? selectCommand(ctx, groupNode.command, focusKey, ev) : null; },
      onActivate: function () { return groupNode ? dispatchCommand(ctx, groupNode.instructionCommand) : null; }
    };
  }

  function makeNode(ctx, spec) {
    var el = ctx.canvas.nodeButton(spec);
    if (el && !el.getAttribute('data-focus-key')) el.setAttribute('data-focus-key', 'flow-node:' + spec.id);
    return el;
  }

  function laneElement(ctx, lane) {
    var h = ctx.dom.h;
    var roleLink = lane.role ? entityLink(ctx, lane.role, { testid: 'lane-role-' + lane.role.id, focusKey: 'lane-role:' + lane.id, compact: true }) : null;
    return h('div', { class: 'lane', 'data-lane-id': lane.id },
      h('div', { class: 'lane__label' },
        h('span', null, lane.label),
        roleLink ? h('span', { class: 'lane__label-role' }, roleLink) : null),
      h('div', { class: 'lane__body' }));
  }

  function actorLane(ctx, model) {
    var h = ctx.dom.h;
    return h('div', { class: 'lane lane--external', 'data-lane-id': 'external-actor' },
      h('div', { class: 'lane__label' },
        h('span', null, model.externalActor.label),
        h('span', { class: 'lane__label-role' }, t(ctx, 'externalExchange', 'Intercambio con el cliente'))),
      h('div', { class: 'lane__body' }));
  }

  function place(el, box) {
    el.style.left = Math.round(box.x) + 'px';
    el.style.top = Math.round(box.y) + 'px';
    if (box.w !== undefined && el.classList.contains('lane')) el.style.width = Math.round(box.w) + 'px';
    if (box.h !== undefined && el.classList.contains('lane')) el.style.height = Math.round(box.h) + 'px';
  }

  function measureNodes(ctx, layer, els) {
    var sizes = null;
    if (ctx.canvas && typeof ctx.canvas.measure === 'function') {
      try { sizes = ctx.canvas.measure(layer); } catch (e) { sizes = null; }
    }
    var out = new Map();
    Object.keys(els).forEach(function (id) {
      var el = els[id];
      var m = sizes && sizes.get ? sizes.get(id) : null;
      var w = m && m.w ? m.w : el.offsetWidth;
      var h = m && m.h ? m.h : el.offsetHeight;
      if (w && h) out.set(id, { w: w, h: h });
    });
    return out;
  }

  function structureKey(model) {
    return json({
      cameraKey: model.cameraKey,
      lanes: (model.lanes || []).map(function (l) { return [l.id, l.label, l.role ? l.role.id : null]; }),
      nodes: (model.nodes || []).map(function (n) { return [n.id, n.kind, n.laneId, n.label, n.activity && n.activity.roles.map(function (r) { return r.name; }), n.restricted]; }),
      edges: (model.edges || []).map(function (e) { return [e.id, e.from, e.to, e.label, e.loop, e.inferred]; }),
      groups: (model.groups || []).map(function (g) { return [g.id, g.subtasks.map(function (s) { return [s.id, s.name, s.laneId, s.role && s.role.name]; })]; }),
      actor: model.externalActor && [model.externalActor.label, model.externalActor.visible, model.externalActor.exchanges],
      chip: model.systemChip && [model.systemChip.label, model.systemChip.betweenNodeIds, model.systemChip.system && model.systemChip.system.name]
    });
  }

  function buildEdgeSpecs(model, layout) {
    var loopPoints = {};
    layout.loops.forEach(function (l) { loopPoints[l.id] = l.points; });
    var specs = (model.edges || []).map(function (e) {
      var spec = { id: e.id, from: e.from, to: e.to, label: e.label || null, loop: !!e.loop, inferred: !!e.inferred, dashed: !!e.inferred, selected: !!e.highlighted, related: !!e.highlighted };
      if (loopPoints[e.id]) spec.points = loopPoints[e.id];
      return spec;
    });
    if (layout.actor && model.externalActor) {
      var actorId = model.externalActor.entity.id;
      model.externalActor.exchanges.forEach(function (x, i) {
        var from = x.direction === 'in' ? actorId : x.nodeId;
        var to = x.direction === 'in' ? x.nodeId : actorId;
        specs.push({ id: 'X-' + x.nodeId + '-' + x.direction + '-' + i, from: from, to: to, label: x.label, dashed: true, exchange: true, selected: model.selectedNodeId === x.nodeId, related: model.selectedNodeId === x.nodeId });
      });
    }
    return specs;
  }

  function chipElement(ctx, model, layout) {
    var h = ctx.dom.h;
    var chip = model.systemChip;
    if (!chip || !chip.betweenNodeIds || chip.betweenNodeIds.length < 2) return null;
    var a = layout.geometry.get(chip.betweenNodeIds[0]);
    var b = layout.geometry.get(chip.betweenNodeIds[1]);
    if (!a || !b) return null;
    var cx = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
    var cy = (a.y + a.h / 2 + b.y + b.h / 2) / 2;
    var label = (chip.system ? chip.system.name + ' · ' : '') + chip.label;
    var button = chip.system
      ? h('button', { type: 'button', class: 'node-chip', 'data-testid': 'node-' + chip.system.id, 'data-entity-id': chip.system.id, 'data-focus-key': 'flow-chip:' + chip.system.id,
          title: t(ctx, 'labelProposed', 'Propuesto · por validar'),
          on: { click: function (ev) { selectCommand(ctx, { type: 'selectEntity', payload: { entityId: chip.system.id } }, 'flow-chip:' + chip.system.id, ev); } } },
          ctx.icons.icon('system'), label, ctx.atoms.badge({ label: t(ctx, 'labelProposed', 'Propuesto · por validar'), tone: 'proposed', icon: false }))
      : h('span', { class: 'node-chip' }, ctx.icons.icon('system'), label);
    var wrap = h('div', { class: 'canvas__label canvas__label--chip' }, button);
    wrap.style.left = Math.round(cx - 110) + 'px';
    wrap.style.top = Math.round(cy - G.chipHeight) + 'px';
    return wrap;
  }

  function renderCanvasLayer(ctx, inst, model) {
    var dom = ctx.dom;
    var canvas = inst.canvas;
    var layer = canvas.layer;
    var edgesSvg = canvas.edges;
    var key = structureKey(model);
    var needMeasure = inst.structureKey !== key || !inst.layout;

    /* Clear everything but the edges svg. */
    Array.prototype.slice.call(layer.childNodes).forEach(function (child) { if (child !== edgesSvg) layer.removeChild(child); });

    var els = {};
    var groupsById = {};
    (model.groups || []).forEach(function (g) { groupsById[g.id] = g; });

    /* Node buttons (preliminary positions). */
    var nodeEls = [];
    (model.nodes || []).forEach(function (n) {
      var g = n.group && groupsById[n.id] && groupsById[n.id].subtasks.length ? groupsById[n.id] : null;
      if (g) {
        g.subtasks.forEach(function (s) { var el = makeNode(ctx, subtaskSpec(ctx, model, g, s)); els[s.id] = el; nodeEls.push(el); });
      } else {
        var el = makeNode(ctx, nodeSpec(ctx, model, n, inst)); els[n.id] = el; nodeEls.push(el);
      }
    });
    if (model.externalActor && model.externalActor.visible !== false) {
      var actorRef = model.externalActor.entity;
      var actorEl = makeNode(ctx, {
        id: actorRef.id, type: 'actor', title: model.externalActor.label || actorRef.name, subtitle: actorRef.typeLabel, meta: null, badges: [],
        testid: 'node-' + actorRef.id, selected: model.selectedNodeId === actorRef.id || (ctx.state && ctx.state.web.selection && ctx.state.web.selection.entityId === actorRef.id), external: true, versionId: null,
        onSelect: function (ev) { return selectCommand(ctx, { type: 'selectEntity', payload: { entityId: actorRef.id } }, 'flow-node:' + actorRef.id, ev); }
      });
      els[actorRef.id] = actorEl; nodeEls.push(actorEl);
    }
    nodeEls.forEach(function (el) { layer.appendChild(el); });

    /* Measure and lay out. */
    if (needMeasure) {
      var sizes = measureNodes(ctx, layer, els);
      inst.layout = layoutFlow(model, sizes);
      inst.structureKey = key;
    }
    var layout = inst.layout;

    /* Lanes under the edges svg; group frames after lanes; chip and nodes on top. */
    var before = edgesSvg && edgesSvg.parentNode === layer ? edgesSvg : null;
    if (layout.actor) {
      var ext = actorLane(ctx, model);
      place(ext, { x: 0, y: 0, w: layout.width, h: layout.actorHeight });
      layer.insertBefore(ext, before);
    }
    (model.lanes || []).forEach(function (lane, i) {
      var el = laneElement(ctx, lane);
      var lg = layout.lanes[i];
      place(el, { x: 0, y: lg.y, w: layout.width, h: lg.h });
      if (model.selectedNodeId) {
        var selNode = (model.nodes || []).filter(function (n) { return n.id === model.selectedNodeId; })[0];
        if (selNode && selNode.laneIds && selNode.laneIds.indexOf(lane.id) !== -1) el.classList.add('lane--highlight');
      }
      layer.insertBefore(el, before);
    });
    layout.frames.forEach(function (f) {
      var gNode = (model.nodes || []).filter(function (n) { return n.id === f.id; })[0];
      if (!gNode) return;
      var frame = makeNode(ctx, {
        id: gNode.id, type: 'group', title: gNode.id + ' · ' + gNode.label, subtitle: t(ctx, 'subtasks', 'Subtareas') + ': ' + (groupsById[gNode.id] ? groupsById[gNode.id].subtasks.map(function (s) { return s.id; }).join(' · ') : ''),
        meta: null, badges: [], testid: gNode.testid, selected: !!gNode.selected, versionId: gNode.versionId, extraClass: 'node--wide node--group',
        onSelect: function (ev) { return selectCommand(ctx, gNode.command, 'flow-node:' + gNode.id, ev); },
        onActivate: function () { return dispatchCommand(ctx, gNode.instructionCommand); }
      });
      if (!frame.getAttribute('data-focus-key')) frame.setAttribute('data-focus-key', 'flow-node:' + gNode.id);
      frame.style.left = Math.round(f.box.x) + 'px';
      frame.style.top = Math.round(f.box.y) + 'px';
      frame.style.width = Math.round(f.box.w) + 'px';
      frame.style.height = Math.round(f.box.h) + 'px';
      frame.style.minWidth = '0';
      frame.style.maxWidth = 'none';
      layer.insertBefore(frame, nodeEls[0] || null);
    });
    var chip = chipElement(ctx, model, layout);
    if (chip) layer.insertBefore(chip, nodeEls[0] || null);

    Object.keys(els).forEach(function (id) {
      var box = layout.geometry.get(id);
      if (box) place(els[id], box);
    });

    /* Edges (svg below the nodes). */
    if (edgesSvg && typeof ctx.canvas.drawEdges === 'function') {
      try {
        ctx.canvas.drawEdges(edgesSvg, buildEdgeSpecs(model, layout), layout.geometry, { router: 'orthogonal' });
      } catch (e) { if (typeof console !== 'undefined') console.error(e); }
    }
    if (typeof canvas.setSize === 'function') canvas.setSize(layout.width, layout.height);
    dom.setAttrs(layer, { 'aria-label': t(ctx, 'canvas', 'Lienzo') + ' · ' + (model.flow ? model.flow.title : '') });
  }

  function ensureCanvas(ctx, inst, model) {
    if (inst.canvas && inst.canvasKey === model.cameraKey) return inst.canvas;
    if (inst.canvas && typeof inst.canvas.destroy === 'function') { try { inst.canvas.destroy(); } catch (e) { /* ignore */ } }
    inst.canvas = ctx.canvas.createCanvas({ contextKey: model.cameraKey, label: (model.flow ? model.flow.title : t(ctx, 'canvas', 'Lienzo')) + ' · ' + (model.version ? model.version.label : ''), ctx: ctx, testid: 'web-canvas' });
    inst.canvasKey = model.cameraKey;
    inst.layout = null;
    inst.structureKey = null;
    inst.fitted = false;
    return inst.canvas;
  }

  function canvasModelKey(model) {
    return json({ s: structureKey(model), sel: model.selectedNodeId, hl: (model.edges || []).filter(function (e) { return e.highlighted; }).map(function (e) { return e.id; }), layers: model.layers });
  }

  /* ---------- list mode ---------- */

  function nodeRef(n) {
    if (n.activity && n.activity.entity) return n.activity.entity;
    return { id: n.id, name: n.label, type: n.kind, typeLabel: n.typeLabel, icon: n.icon };
  }

  function listView(ctx, model) {
    var h = ctx.dom.h;
    var cols = computeColumns(model.nodes || [], model.edges || []);
    var laneIdx = {};
    (model.lanes || []).forEach(function (l, i) { laneIdx[l.id] = i; });
    var ordered = (model.nodes || []).slice().sort(function (a, b) {
      return (cols[a.id] - cols[b.id]) || ((laneIdx[a.laneId] || 0) - (laneIdx[b.laneId] || 0));
    });
    var labelOf = {};
    ordered.forEach(function (n) { labelOf[n.id] = n.label; });
    var laneLabel = {};
    (model.lanes || []).forEach(function (l) { laneLabel[l.id] = l.label; });
    var groupsById = {};
    (model.groups || []).forEach(function (g) { groupsById[g.id] = g; });

    function outcomes(n) {
      var outs = (model.edges || []).filter(function (e) { return e.from === n.id; });
      if (!outs.length) return null;
      return h('ul', { class: 'list list--plain text-sm' }, outs.map(function (e) {
        var backward = cols[e.to] <= cols[n.id];
        var parts = [];
        if (e.label) parts.push(e.label + ' → ');
        else parts.push('→ ');
        parts.push(labelOf[e.to] || e.to);
        if (backward) parts.push(' (' + t(ctx, 'returnsTo', 'vuelve a') + ' ' + e.to + ')');
        if (e.inferred) parts.push(' · ' + t(ctx, 'confidenceInferred', 'Inferido'));
        return h('li', { class: ['list__item', e.loop && 'muted'] }, parts.join(''));
      }));
    }

    var rows = ordered.map(function (n, i) {
      var ref = nodeRef(n);
      var g = n.group && groupsById[n.id] && groupsById[n.id].subtasks.length ? groupsById[n.id] : null;
      var link = entityLink(ctx, ref, {
        testid: n.testid, versionId: n.versionId, selected: !!n.selected, focusKey: 'flow-node:' + n.id, showType: true,
        onOpen: function (entity, ev) { return selectCommand(ctx, n.command, 'flow-node:' + n.id, ev); }
      });
      var meta = [laneLabel[n.laneId] || n.laneId];
      if (n.activity && n.activity.roles.length) meta.push(n.activity.roles.map(function (r) { return r.name; }).join(' · '));
      var exchanges = n.exchanges && n.exchanges.length && model.externalActor ? h('p', { class: 'text-sm muted' }, n.exchanges.map(function (x) { return model.externalActor.label + (x.direction === 'in' ? ' → ' : ' ← ') + x.label; }).join(' · ')) : null;
      var instr = n.activity ? ctx.atoms.button({ label: t(ctx, 'viewInstruction', 'Ver instrucción'), variant: 'ghost', size: 'sm', icon: 'activity', testid: 'instruction-' + n.versionId + '-' + n.id, onClick: function () { dispatchCommand(ctx, n.instructionCommand); } }) : null;
      var sub = g ? h('ul', { class: 'list entity-list__tree' }, g.subtasks.map(function (s) {
        return h('li', { class: 'list__item entity-list__row' },
          h('span', { class: 'mono text-xs muted' }, s.id),
          h('span', null, s.name),
          s.role ? entityLink(ctx, s.role, { testid: 'link-' + s.id + '-' + s.role.id, focusKey: 'flow-sub-role:' + s.id, relationLabel: t(ctx, 'executor', 'Ejecutor') }) : null,
          s.instruction ? h('span', { class: 'text-sm muted' }, ' · ' + s.instruction) : null);
      })) : null;
      return h('li', { class: 'entity-list__step', 'data-entity-id': n.id, 'data-version-id': n.versionId },
        h('span', { class: 'entity-list__step-number' }, String(i + 1)),
        h('div', { class: 'stack stack--xs' },
          h('div', { class: 'entity-list__row' }, link, instr),
          h('p', { class: 'text-sm muted' }, meta.join(' · ')),
          exchanges, sub, outcomes(n)));
    });
    var chip = model.systemChip ? h('p', { class: 'panel-note' }, ctx.icons.icon('system'), ' ', (model.systemChip.system ? model.systemChip.system.name + ' · ' : '') + model.systemChip.label + ' (' + model.systemChip.betweenNodeIds.join(' → ') + ')') : null;
    return h('div', { class: 'entity-list', 'data-testid': 'flow-list' },
      h('div', { class: 'entity-list__group' },
        h('h3', { class: 'entity-list__group-title' }, t(ctx, 'flowSteps', 'Pasos del flujo')),
        h('ol', { class: 'list list--plain stack stack--sm', 'aria-label': t(ctx, 'flowSteps', 'Pasos del flujo') }, rows),
        chip));
  }

  /* ---------- shared panels (also used by features/web/instruction) ---------- */

  function documentsPanel(ctx, d, options) {
    if (!d) return null;
    var h = ctx.dom.h;
    var o = options || {};
    var variants = d.variants.map(function (v) {
      return h('section', { class: 'twin-sheet__section', 'data-variant-id': v.id },
        h('h4', { class: 'section-title' }, v.label, v.selected && o.showSelected !== false ? ctx.atoms.badge({ label: t(ctx, 'selectedVariant', 'Variante seleccionada'), tone: 'brand', icon: false }) : null),
        listOf(ctx, v.items, function (item) { return item; }, { label: v.label }),
        v.observation ? h('p', { class: 'panel-note' }, v.observation) : null,
        v.documents && v.documents.length ? h('div', { class: 'cluster cluster--sm' }, v.documents.map(function (doc) { return entityLink(ctx, doc, { testid: 'docs-' + v.id + '-' + doc.id, focusKey: 'docs:' + v.id + ':' + doc.id }); })) : null);
    });
    var naming = d.namingStandard.length ? h('section', { class: 'twin-sheet__section' },
      h('h4', { class: 'section-title' }, t(ctx, 'namingStandard', 'Estándar de nombres')),
      h('ul', { class: 'list' }, d.namingStandard.map(function (n) { return h('li', { class: 'list__item' }, h('code', { class: 'mono' }, n)); })),
      d.namingNote ? h('p', { class: 'panel-note' }, ctx.atoms.badge({ label: d.namingNote, tone: 'demo', icon: false })) : null) : null;
    var controls = d.controls.length ? h('section', { class: 'twin-sheet__section' },
      h('h4', { class: 'section-title' }, t(ctx, 'describedControls', 'Controles descritos')),
      h('div', { class: 'cluster cluster--sm' }, d.controls.map(function (c) { return ctx.atoms.badge({ label: c, tone: 'neutral', icon: false }); })),
      d.controlsNote ? h('p', { class: 'panel-note' }, d.controlsNote) : null) : null;
    return ctx.atoms.card({ title: d.title || t(ctx, 'documents', 'Documentos'), headingLevel: o.headingLevel || 3, id: o.id || 'documents-by-variant', children: [h('div', { class: 'stack stack--md' }, variants, naming, controls)], quiet: true });
  }

  function contextPanel(ctx, context) {
    if (!context || !context.items || !context.items.length) return null;
    var h = ctx.dom.h;
    var items = context.items.map(function (c, i) {
      return ctx.molecules.disclosure({ id: 'flow-context-' + i, summary: c.title, content: h('p', { class: 'text-sm' }, c.text), testid: 'flow-context-' + i, focusKey: 'flow-context:' + i });
    });
    return ctx.atoms.card({ title: context.title || t(ctx, 'previousContext', 'Contexto previo'), headingLevel: 3, id: 'flow-context', quiet: true, children: [h('div', { class: 'stack stack--sm' }, items)] });
  }

  function notesPanel(ctx, model) {
    var h = ctx.dom.h;
    var blocks = [];
    if (model.notes && model.notes.length) blocks.push(h('section', { class: 'twin-sheet__section' }, h('h4', { class: 'section-title' }, t(ctx, 'notes', 'Notas')), listOf(ctx, model.notes, function (n) { return n; })));
    if (model.sourceNotes && model.sourceNotes.length) blocks.push(h('section', { class: 'twin-sheet__section' }, h('h4', { class: 'section-title' }, t(ctx, 'sourceNotes', 'Notas de la fuente')), listOf(ctx, model.sourceNotes, function (n) { return n; })));
    if (model.versionNotes && model.versionNotes.length) blocks.push(h('section', { class: 'twin-sheet__section' }, h('h4', { class: 'section-title' }, t(ctx, 'version', 'Versión') + ' · ' + t(ctx, 'notes', 'Notas')), listOf(ctx, model.versionNotes, function (n) { return n; })));
    if (model.pending && model.pending.length) blocks.push(h('section', { class: 'twin-sheet__section' }, h('h4', { class: 'section-title' }, t(ctx, 'pendingItems', 'Pendientes')), listOf(ctx, model.pending, function (n) { return h('span', null, ctx.atoms.badge({ label: t(ctx, 'pendingValidation', 'Por validar'), tone: 'warning', icon: false }), ' ', n); })));
    if (model.provenance && model.provenance.sources && model.provenance.sources.length) {
      blocks.push(h('section', { class: 'twin-sheet__section' }, h('h4', { class: 'section-title' }, model.provenance.label || t(ctx, 'sources', 'Fuentes')),
        listOf(ctx, model.provenance.sources, function (s) { return h('span', null, h('span', { class: 'mono text-xs' }, s.id), ' · ' + s.title + (s.section ? ' (' + s.section + ')' : '')); })));
    }
    if (!blocks.length) return null;
    return ctx.atoms.card({ title: t(ctx, 'notesAndSources', 'Notas y fuentes'), headingLevel: 3, id: 'flow-notes', quiet: true, children: [h('div', { class: 'stack stack--md' }, blocks)] });
  }

  function legendElement(ctx, model, id) {
    var h = ctx.dom.h;
    var items = (model.legend || []).map(function (label, i) {
      var swatch = /inferid/i.test(label) ? 'legend__swatch--loop' : 'legend__swatch--default-line';
      return h('span', { class: 'legend__item' }, h('span', { class: ['legend__swatch', swatch], 'aria-hidden': 'true' }), label);
    });
    if (model.nodes && model.nodes.some(function (n) { return n.kind === 'decision'; })) items.push(h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--decision', 'aria-hidden': 'true' }), ctx.pack && ctx.pack.typeLabel ? ctx.pack.typeLabel('decision') : t(ctx, 'decision', 'Decisión')));
    if (model.externalActor) items.push(h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--external', 'aria-hidden': 'true' }), model.externalActor.label));
    if (model.systemChip) items.push(h('span', { class: 'legend__item' }, h('span', { class: 'legend__swatch legend__swatch--proposed', 'aria-hidden': 'true' }), model.systemChip.label));
    if (!items.length) return null;
    return h('div', { class: 'legend', id: id, 'data-testid': 'flow-legend' }, h('span', { class: 'legend__title' }, t(ctx, 'legend', 'Leyenda')), items);
  }

  /* ---------- regions ---------- */

  function headerRegion(ctx, model) {
    var h = ctx.dom.h;
    /* Demo versions inherit the base flow (V-ASIS-02 ← FLOW-TOBE2): their heading is the version
       itself, never the base flow's «TO-BE 2» title (spec DESK-03: «Ver nuevo AS-IS» opens V-ASIS-02). */
    var demoVersion = !!(model.version && model.version.isDemo);
    var title = demoVersion ? model.explainer : (model.flow ? model.flow.title : model.explainer);
    var subtitle = demoVersion ? model.version.label : (model.flow ? model.flow.subtitle : (model.version ? model.version.label : null));
    var badges = [];
    if (model.adoptionBadge) badges.push(ctx.atoms.badge({ label: model.adoptionBadge.label, tone: model.adoptionBadge.tone || 'demo' }));
    if (model.derivedNote) badges.push(ctx.atoms.badge({ label: model.derivedNote, tone: 'proposed' }));
    if (model.version && model.version.isDemo && !model.adoptionBadge) badges.push(ctx.atoms.badge({ label: model.version.stateLabel || t(ctx, 'labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' }));
    var controls = (model.actions || []).map(function (a) {
      return ctx.atoms.button({ label: a.label, variant: 'ghost', size: 'sm', icon: a.id === 'history' ? 'history' : (a.id === 'compare' ? 'compare' : 'document'), testid: 'flow-action-' + a.id, disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason : null, onClick: function () { dispatchCommand(ctx, a.command); } });
    });
    return h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'flow-title' }, title),
        subtitle ? h('p', { class: 'twin-stage__subtitle', 'data-testid': 'flow-subtitle' }, subtitle) : null,
        model.process && model.process.name ? h('p', { class: 'twin-stage__note' }, model.process.name) : null,
        badges.length ? h('div', { class: 'cluster cluster--sm' }, badges) : null),
      controls.length ? h('div', { class: 'twin-stage__controls' }, controls) : null);
  }

  function versionbarRegion(ctx, model) {
    var h = ctx.dom.h;
    var versions = (model.versions || []).map(function (v) {
      return ctx.atoms.button({ label: v.label, variant: v.selected ? 'secondary' : 'ghost', size: 'sm', pressed: !!v.selected, testid: v.testid, focusKey: 'version:' + v.id, title: v.stateLabel || null,
        icon: v.isDemo ? 'flag' : 'version', onClick: function () { if (!v.selected) ctx.dispatch('setVersion', { versionId: v.id }); } });
    });
    var variants = (model.variants || []).map(function (v) {
      return ctx.atoms.button({ label: v.label, variant: v.selected ? 'secondary' : 'ghost', size: 'sm', pressed: !!v.selected, testid: v.testid, focusKey: 'variant:' + v.id, title: v.available ? null : v.message,
        onClick: function () { if (!v.selected) ctx.dispatch('setPaymentVariant', { variant: v.id }); } });
    });
    return h('div', { class: 'twin-versionbar' },
      versions.length ? h('div', { class: 'twin-versionbar__group', role: 'group', 'aria-label': t(ctx, 'version', 'Versión') },
        h('span', { class: 'twin-versionbar__label' }, t(ctx, 'version', 'Versión')), versions) : null,
      variants.length ? h('div', { class: 'twin-versionbar__group', role: 'group', 'aria-label': model.variantSelectorLabel },
        h('span', { class: 'twin-versionbar__label' }, model.variantSelectorLabel), variants) : null);
  }

  function noticesRegion(ctx, model) {
    var h = ctx.dom.h;
    var items = [];
    if (model.readOnly && model.readOnlyLabel) items.push(ctx.molecules.notice({ text: model.readOnlyLabel, tone: 'warning', icon: 'lock', testid: 'flow-readonly' }));
    if (model.newVersionNotice) {
      var nv = model.newVersionNotice;
      items.push(ctx.molecules.notice({ text: nv.text, tone: 'info', testid: 'new-version-notice', action: { label: nv.action, testid: 'new-version-view', onClick: function () { dispatchCommand(ctx, nv.command); } }, onDismiss: function () { ctx.dispatch('dismissNewVersionNotice', {}); }, dismissLabel: t(ctx, 'closeNotice', 'Cerrar aviso') }));
    }
    if (model.originVersion) items.push(h('p', { class: 'panel-note' }, t(ctx, 'derivedFrom', 'Derivada de') + ': ', ctx.atoms.button({ label: model.originVersion.label, variant: 'ghost', size: 'sm', icon: 'version', testid: 'flow-origin-' + model.originVersion.id, onClick: function () { ctx.dispatch('setVersion', { versionId: model.originVersion.id }); } })));
    if (!items.length) return null;
    return h('div', { class: 'twin-notices' }, items);
  }

  function restrictedBody(ctx, model) {
    var n = model.notice || {};
    var cta = n.cta || null;
    return ctx.dom.h('div', { class: 'twin-stage__body twin-stage__body--scroll' },
      ctx.molecules.notice({ text: n.text || ctx.format.msg('MSG-02').text, tone: 'warning', testid: 'flow-restricted', role: 'alert',
        action: cta ? { label: cta.label || n.action, testid: 'flow-restricted-action', onClick: function () { dispatchCommand(ctx, cta.command); } } : (n.action ? { label: n.action, testid: 'flow-restricted-action', onClick: function () { ctx.dispatch('backToOrganization', {}); } } : null) }));
  }

  function incompleteBody(ctx, model) {
    var h = ctx.dom.h;
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' },
      h('div', { class: 'twin-sheet' },
        h('div', { class: 'twin-sheet__main' },
          ctx.atoms.card({ title: model.version ? model.version.label : model.explainer, eyebrow: model.version ? model.version.stateLabel : null, headingLevel: 3, id: 'flow-incomplete', children: [
            h('div', { class: 'stack stack--sm', 'data-testid': 'flow-incomplete' },
              h('p', null, model.message),
              listOf(ctx, model.items || [], function (item) { return item; }, { label: model.version ? model.version.label : null }),
              h('p', { class: 'panel-note' }, ctx.atoms.badge({ label: t(ctx, 'notPublishable', 'No publicable en la demo'), tone: 'warning', icon: false })))] })),
        h('div', { class: 'twin-sheet__aside' }, notesPanel(ctx, model))));
  }

  function unavailableBody(ctx, model) {
    var h = ctx.dom.h;
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' },
      h('div', { class: 'twin-sheet' },
        h('div', { class: 'twin-sheet__main' },
          ctx.molecules.emptyState({ text: model.variantMessage || t(ctx, 'noData', 'No hay información disponible para esta vista'), icon: 'info', testid: 'flow-variant-unavailable',
            action: { label: t(ctx, 'toBeExplainer', 'Así se propone trabajar') + ' · TO-BE', icon: 'forward', variant: 'secondary', testid: 'flow-variant-go-tobe', onClick: function () {
              var tobe = (model.versions || []).filter(function (v) { return v.type === 'TO-BE' && v.state !== 'incomplete-draft'; });
              if (tobe.length) ctx.dispatch('setVersion', { versionId: tobe[tobe.length - 1].id });
            } } })),
        h('div', { class: 'twin-sheet__aside' }, contextPanel(ctx, model.context), notesPanel(ctx, model))));
  }

  function panelsRegion(ctx, model) {
    var h = ctx.dom.h;
    var docs = model.documentsByVariant ? documentsPanel(ctx, model.documentsByVariant, { id: 'flow-documents', showSelected: !!(model.variants && model.variants.length) }) : null;
    var context = contextPanel(ctx, model.context);
    var notes = notesPanel(ctx, model);
    if (!docs && !context && !notes) return null;
    return h('div', { class: 'twin-sheet', 'data-testid': 'flow-panels' },
      h('div', { class: 'twin-sheet__main' }, docs, context),
      h('div', { class: 'twin-sheet__aside' }, notes));
  }

  function footerRegion(ctx, model, inst) {
    var h = ctx.dom.h;
    var legend = legendElement(ctx, model, inst.legendId);
    if (!legend) return null;
    return h('div', { class: 'twin-stage__footer' }, legend);
  }

  /* ---------- instance ---------- */

  function createInstance(ctx, stageEl) {
    var h = ctx.dom.h;
    var uid = Math.random().toString(36).slice(2, 8);
    var inst = {
      root: null, header: h('div'), versionbar: h('div'), notices: h('div'), body: h('div', { class: 'twin-stage__body twin-stage__body--scroll', 'data-testid': 'flow-body' }), footer: h('div'),
      keys: {}, canvas: null, canvasKey: null, layout: null, structureKey: null, legendId: 'flow-legend-' + uid, canvasHost: null, panelsHost: null, listHost: null, mode: null, fitted: false, lastAnnounced: null
    };
    inst.root = h('div', { class: 'twin-flow stack', 'data-testid': 'flow-stage' }, inst.header, inst.versionbar, inst.notices, inst.body, inst.footer);
    stageEl.appendChild(inst.root);
    return inst;
  }

  function region(ctx, inst, name, part, build) {
    var key = json(part);
    if (inst.keys[name] === key) return false;
    inst.keys[name] = key;
    ctx.dom.preserveFocus(inst.root, function () { ctx.dom.replace(inst[name], build()); });
    return true;
  }

  function canvasHeight(stageEl) {
    var hgt = stageEl && stageEl.clientHeight ? stageEl.clientHeight : 0;
    return Math.max(360, Math.round(hgt * 0.68));
  }

  function renderBody(ctx, inst, model, stageEl) {
    var h = ctx.dom.h;
    var dom = ctx.dom;
    var mode = model.restricted ? 'restricted' : (!model.version ? 'empty' : (model.incomplete ? 'incomplete' : (!model.variantAvailable ? 'unavailable' : (model.listMode ? 'list' : 'canvas'))));
    var bodyKey = json({ mode: mode, v: model.version && model.version.id, variant: model.variant, msg: model.variantMessage, items: model.items, message: model.message, notice: model.notice, empty: model.empty });

    if (mode !== 'canvas' && mode !== 'list') {
      if (inst.keys.body === bodyKey) return;
      inst.keys.body = bodyKey;
      inst.mode = mode;
      if (inst.canvas && typeof inst.canvas.destroy === 'function') { try { inst.canvas.destroy(); } catch (e) { /* ignore */ } }
      inst.canvas = null; inst.canvasKey = null; inst.canvasHost = null; inst.listHost = null; inst.panelsHost = null;
      dom.preserveFocus(inst.root, function () {
        var el = mode === 'restricted' ? restrictedBody(ctx, model) : (mode === 'incomplete' ? incompleteBody(ctx, model) : (mode === 'unavailable' ? unavailableBody(ctx, model) : h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, ctx.molecules.emptyState({ text: model.empty || t(ctx, 'selectProcess', 'Selecciona un proceso'), icon: 'process' }))));
        dom.replace(inst.body, el.childNodes.length ? Array.prototype.slice.call(el.childNodes) : el);
      });
      if (mode === 'unavailable' && model.variantMessage) dom.announce(model.variantMessage);
      if (mode === 'incomplete' && model.message) dom.announce(model.message);
      return;
    }

    /* Canvas or list: hosts are kept between renders. */
    if (inst.mode !== mode || inst.keys.body !== bodyKey || !inst.panelsHost) {
      var rebuild = inst.mode !== mode || !inst.panelsHost;
      inst.mode = mode;
      inst.keys.body = bodyKey;
      if (rebuild) {
        dom.preserveFocus(inst.root, function () {
          inst.canvasHost = mode === 'canvas' ? h('div', { class: 'twin-flow__canvas', 'data-testid': 'flow-canvas-host' }) : null;
          inst.listHost = mode === 'list' ? h('div', { class: 'twin-flow__list' }) : null;
          inst.panelsHost = h('div', { class: 'twin-flow__panels' });
          dom.replace(inst.body, inst.canvasHost, inst.listHost, inst.panelsHost);
          inst.keys.panels = null;
          inst.keys.list = null;
          inst.keys.canvas = null;
        });
        if (mode === 'list' && inst.canvas) { try { inst.canvas.destroy(); } catch (e) { /* ignore */ } inst.canvas = null; inst.canvasKey = null; }
      }
    }

    if (mode === 'list') {
      var listKey = json({ nodes: model.nodes, edges: model.edges, groups: model.groups, lanes: model.lanes, actor: model.externalActor, chip: model.systemChip, sel: model.selectedNodeId });
      if (inst.keys.list !== listKey) {
        inst.keys.list = listKey;
        dom.preserveFocus(inst.root, function () { dom.preserveScroll(inst.body, function () { dom.replace(inst.listHost, listView(ctx, model)); }); });
      }
    } else {
      var canvas = ensureCanvas(ctx, inst, model);
      if (canvas.el.parentNode !== inst.canvasHost) {
        dom.replace(inst.canvasHost, canvas.el);
        inst.keys.canvas = null;
      }
      inst.canvasHost.style.height = canvasHeight(stageEl) + 'px';
      inst.canvasHost.style.minHeight = '360px';
      var cKey = canvasModelKey(model);
      if (inst.keys.canvas !== cKey) {
        inst.keys.canvas = cKey;
        dom.preserveFocus(inst.root, function () { renderCanvasLayer(ctx, inst, model); });
        if (!inst.fitted && !model.camera && typeof canvas.fit === 'function') {
          inst.fitted = true;
          /* design.md: text is never shrunk to make everything fit. Centre the diagram only when it
           * fits at 100 %; otherwise open at 100 % on the start event and let the user pan. */
          try {
            var size = canvas.getSize ? canvas.getSize() : null;
            var vp = canvas.viewportSize ? canvas.viewportSize() : null;
            var fits = size && vp && size.width + 48 <= vp.width && size.height + 48 <= vp.height;
            if (fits) canvas.fit(); else if (typeof canvas.reset === 'function') canvas.reset();
          } catch (e) { /* ignore */ }
        }
      }
      if (typeof canvas.syncCamera === 'function') canvas.syncCamera(ctx.state || ctx.store.getState());
    }

    var panelsKey = json({ docs: model.documentsByVariant, context: model.context, notes: model.notes, sourceNotes: model.sourceNotes, versionNotes: model.versionNotes, pending: model.pending, prov: model.provenance });
    if (inst.keys.panels !== panelsKey) {
      inst.keys.panels = panelsKey;
      dom.preserveFocus(inst.root, function () { dom.preserveScroll(inst.body, function () { dom.replace(inst.panelsHost, panelsRegion(ctx, model)); }); });
    }
  }

  function render(stageEl, ctx) {
    var model = ctx.select('flowModel');
    if (!model) return;
    var inst = instances.get(stageEl);
    if (!inst || inst.root.parentNode !== stageEl) {
      if (inst && inst.canvas && typeof inst.canvas.destroy === 'function') { try { inst.canvas.destroy(); } catch (e) { /* ignore */ } }
      inst = createInstance(ctx, stageEl);
      instances.set(stageEl, inst);
    }
    region(ctx, inst, 'header', { flow: model.flow, explainer: model.explainer, version: model.version && [model.version.id, model.version.label, model.version.stateLabel, model.version.isDemo], process: model.process && model.process.name, adoption: model.adoptionBadge, derived: model.derivedNote, actions: model.actions, restricted: model.restricted }, function () { return headerRegion(ctx, model); });
    region(ctx, inst, 'versionbar', { versions: (model.versions || []).map(function (v) { return [v.id, v.label, v.selected, v.stateLabel, v.isDemo]; }), variants: model.variants, label: model.variantSelectorLabel }, function () { return versionbarRegion(ctx, model); });
    region(ctx, inst, 'notices', { ro: model.readOnly, rol: model.readOnlyLabel, nv: model.newVersionNotice, origin: model.originVersion && model.originVersion.id }, function () { return noticesRegion(ctx, model); });
    renderBody(ctx, inst, model, stageEl);
    region(ctx, inst, 'footer', { legend: model.legend, hasDecision: (model.nodes || []).some(function (n) { return n.kind === 'decision'; }), actor: model.externalActor && model.externalActor.label, chip: model.systemChip && model.systemChip.label, mode: inst.mode }, function () { return (inst.mode === 'canvas' || inst.mode === 'list') ? footerRegion(ctx, model, inst) : null; });
  }

  return {
    id: 'flow',
    render: render,
    documentsPanel: documentsPanel,
    contextPanel: contextPanel,
    layoutFlow: layoutFlow,
    computeColumns: computeColumns,
    helpers: { t: t, entityLink: entityLink, dispatchCommand: dispatchCommand, selectCommand: selectCommand, isKeyboardEvent: isKeyboardEvent, listOf: listOf, json: json }
  };
});
