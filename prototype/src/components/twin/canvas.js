/* components/twin/canvas — shared camera layer for every canvas-based stage (CONTRACTS §9,
 * spec §14.3). A canvas is `.canvas` (viewport, tabindex=0, role=group) > `.canvas__layer`
 * (CSS transform from state.camera[contextKey]) > `<svg class="canvas__edges">` + absolutely
 * positioned `.node` buttons. The component never reads permissions: it renders what the
 * stage module gives it. Nothing here touches the DOM at factory time. */
Primus.module('components/twin/canvas', function (require) {
  'use strict';

  var dom = require('core/dom');
  var h = dom.h;
  var svgEl = dom.svg;

  /* Mirrors ds/extensions.css (design-system.md §7). */
  var GEOMETRY = Object.freeze({
    nodeMinWidth: 176,
    nodeMaxWidth: 240,
    nodeMinHeight: 56,
    nodeGap: 24,
    decisionSize: 112,
    eventSize: 56,
    chipHeight: 28,
    laneHeight: 168,
    laneLabelWidth: 144,
    bandLabelWidth: 160,
    bandMinHeight: 120,
    fitPadding: 24,
    panStep: 40,
    scaleStep: 0.1,
    scaleMin: 0.5,
    scaleMax: 2
  });

  var markerCounter = 0;

  function isFn(v) { return typeof v === 'function'; }
  function num(v, fallback) { return typeof v === 'number' && isFinite(v) ? v : fallback; }
  function round1(v) { return Math.round(v * 10) / 10; }
  function clampScale(s) { return Math.min(GEOMETRY.scaleMax, Math.max(GEOMETRY.scaleMin, round1(s))); }
  function scaleText(scale) { return Math.round(scale * 100) + ' %'; }

  function uiText(ctx, key, fallback) {
    var ui = (ctx && (ctx.ui || (ctx.pack && ctx.pack.ui))) || {};
    return ui[key] || fallback;
  }

  function dispatchOf(ctx) {
    if (ctx && isFn(ctx.dispatch)) return function (type, payload) { return ctx.dispatch(type, payload); };
    if (ctx && ctx.store && isFn(ctx.store.dispatch)) return function (type, payload) { return ctx.store.dispatch(type, payload); };
    return function () { return { ok: false, error: { code: 'no-store' } }; };
  }

  function stateOf(ctx) {
    if (ctx && ctx.state) return ctx.state;
    if (ctx && ctx.store && isFn(ctx.store.getState)) return ctx.store.getState();
    return null;
  }

  function reducedMotion() {
    try {
      return typeof window !== 'undefined' && window && isFn(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  /* ---------- createCanvas ---------- */

  /* createCanvas({ contextKey, label, ctx, testid }) → { el, layer, edges, setSize, syncCamera, fit, destroy, ... } */
  function createCanvas(options) {
    var opts = options || {};
    var ctx = opts.ctx || {};
    var atoms = ctx.atoms || require('ds/atoms');
    var dispatch = dispatchOf(ctx);
    var contextKey = opts.contextKey || null;
    var content = { width: num(opts.width, 0), height: num(opts.height, 0) };
    var camera = { x: 0, y: 0, scale: 1 };
    var drag = null;
    var destroyed = false;
    var listeners = [];

    var edges = svgEl('svg', { class: 'canvas__edges', 'aria-hidden': 'true', focusable: 'false', width: '0', height: '0' });
    var layer = h('div', { class: 'canvas__layer' }, edges);
    var scaleLabel = h('span', { class: 'canvas__toolbar-zoom', 'aria-live': 'polite', 'data-testid': 'camera-scale' }, scaleText(1));
    var zoomOutBtn = atoms.iconButton({ icon: 'zoomOut', ariaLabel: uiText(ctx, 'zoomOut', 'Alejar'), size: 'sm', testid: 'zoom-out', focusKey: 'camera:zoom-out', onClick: function () { zoom(-GEOMETRY.scaleStep); } });
    var zoomInBtn = atoms.iconButton({ icon: 'zoomIn', ariaLabel: uiText(ctx, 'zoomIn', 'Acercar'), size: 'sm', testid: 'zoom-in', focusKey: 'camera:zoom-in', onClick: function () { zoom(GEOMETRY.scaleStep); } });
    var fitBtn = atoms.button({ label: uiText(ctx, 'fitView', 'Ajustar vista'), icon: 'fit', variant: 'ghost', size: 'sm', testid: 'fit-view', focusKey: 'camera:fit', onClick: function () { fit(); } });
    var resetBtn = atoms.button({ label: uiText(ctx, 'resetCamera', 'Restablecer cámara'), icon: 'reset', variant: 'ghost', size: 'sm', testid: 'reset-camera', focusKey: 'camera:reset', onClick: function () { reset(); } });
    var toolbar = h('div', { class: ['canvas__toolbar', opts.toolbarTop ? 'canvas__toolbar--top' : null], role: 'group', 'aria-label': uiText(ctx, 'cameraControls', 'Controles de cámara') },
      zoomOutBtn, scaleLabel, zoomInBtn, fitBtn, resetBtn);
    var message = h('div', { class: 'canvas__message', hidden: true });
    var el = h('div', {
      class: ['canvas', opts.extraClass || null],
      tabindex: '0',
      role: 'group',
      'aria-label': opts.label || uiText(ctx, 'canvas', 'Lienzo'),
      'data-testid': opts.testid || 'web-canvas',
      'data-context-key': contextKey,
      'data-focus-key': 'canvas:' + (contextKey || 'main')
    }, layer, message, toolbar);

    function listen(target, type, fn, options) {
      target.addEventListener(type, fn, options);
      listeners.push(function () { target.removeEventListener(type, fn, options); });
    }

    /* The viewport is overflow:hidden, but focusing a node (keyboard, scrollIntoView) still
     * scrolls it and leaves the diagram shifted. Turn that scroll into a camera pan instead. */
    listen(el, 'scroll', function () {
      var dx = el.scrollLeft, dy = el.scrollTop;
      if (!dx && !dy) return;
      el.scrollLeft = 0; el.scrollTop = 0;
      /* Jump immediately so the element stays where the browser just scrolled it to. */
      applyTransform({ x: camera.x - dx, y: camera.y - dy, scale: camera.scale }, true);
      if (contextKey) pan(-dx, -dy); else camera = { x: camera.x - dx, y: camera.y - dy, scale: camera.scale };
    });

    function applyTransform(cam, immediate) {
      var prev = layer.style.transition;
      if (immediate || reducedMotion()) layer.style.transition = 'none';
      layer.style.transform = 'translate(' + Math.round(cam.x) + 'px, ' + Math.round(cam.y) + 'px) scale(' + cam.scale + ')';
      if (immediate || reducedMotion()) {
        // force style flush so the next transition change does not animate the jump
        void layer.offsetWidth; // eslint-disable-line no-void
        layer.style.transition = prev || '';
      }
      dom.setText(scaleLabel, scaleText(cam.scale));
      el.setAttribute('data-scale', String(cam.scale));
    }

    function viewportSize() {
      return { width: el.clientWidth || num(opts.viewportWidth, 800), height: el.clientHeight || num(opts.viewportHeight, 600) };
    }

    function cameraPayload(cam) {
      return { contextKey: contextKey, x: Math.round(cam.x), y: Math.round(cam.y), scale: clampScale(cam.scale) };
    }

    function setSize(width, height) {
      content.width = Math.max(0, num(width, 0));
      content.height = Math.max(0, num(height, 0));
      layer.style.width = content.width + 'px';
      layer.style.height = content.height + 'px';
      edges.setAttribute('width', String(content.width));
      edges.setAttribute('height', String(content.height));
      edges.setAttribute('viewBox', '0 0 ' + content.width + ' ' + content.height);
      return content;
    }

    function syncCamera(state) {
      if (!contextKey) { applyTransform({ x: 0, y: 0, scale: 1 }); return camera; }
      var s = state || stateOf(ctx);
      var cam = (s && s.camera && s.camera[contextKey]) || { x: 0, y: 0, scale: 1 };
      camera = { x: num(cam.x, 0), y: num(cam.y, 0), scale: clampScale(num(cam.scale, 1)) };
      if (!drag) applyTransform(camera);
      return camera;
    }

    function setContextKey(key) {
      contextKey = key || null;
      el.setAttribute('data-context-key', contextKey || '');
      el.setAttribute('data-focus-key', 'canvas:' + (contextKey || 'main'));
      syncCamera();
    }

    function zoom(delta, cx, cy) {
      if (!contextKey) return null;
      var vp = viewportSize();
      var payload = { contextKey: contextKey, delta: delta, cx: num(cx, vp.width / 2), cy: num(cy, vp.height / 2) };
      return dispatch('zoomCamera', payload);
    }

    function fit() {
      if (!contextKey) return null;
      var vp = viewportSize();
      var cw = content.width || layer.scrollWidth || 1;
      var ch = content.height || layer.scrollHeight || 1;
      return dispatch('fitCamera', { contextKey: contextKey, contentWidth: cw, contentHeight: ch, viewportWidth: vp.width, viewportHeight: vp.height, padding: GEOMETRY.fitPadding });
    }

    function reset() {
      if (!contextKey) return null;
      return dispatch('resetCamera', { contextKey: contextKey });
    }

    function pan(dx, dy) {
      if (!contextKey) return null;
      return dispatch('setCamera', cameraPayload({ x: camera.x + dx, y: camera.y + dy, scale: camera.scale }));
    }

    function setMessage(textValue) {
      if (!textValue) { message.hidden = true; dom.clear(message); return; }
      dom.replace(message, dom.isNode(textValue) ? textValue : h('p', null, String(textValue)));
      message.hidden = false;
    }

    /* Pan only starts from empty background: the viewport, the layer itself or the edge svg. */
    function isBackground(target) {
      if (!target) return false;
      if (target === el || target === layer || target === edges) return true;
      if (target.closest) {
        if (target.closest('.node, .node-expand, .node-chip, button, a, input, select, textarea, .canvas__toolbar, .canvas__message')) return false;
        var owner = target.closest('.canvas__edges, .canvas__layer, .canvas');
        return owner === edges || owner === layer || owner === el;
      }
      return false;
    }

    function onPointerDown(event) {
      if (opts.staticCamera || !contextKey) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (!isBackground(event.target)) return;
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, originX: camera.x, originY: camera.y, moved: false };
      el.classList.add('is-panning');
      try { el.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
      event.preventDefault();
    }

    function onPointerMove(event) {
      if (!drag || event.pointerId !== drag.id) return;
      var dx = event.clientX - drag.startX;
      var dy = event.clientY - drag.startY;
      if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      drag.moved = true;
      applyTransform({ x: drag.originX + dx, y: drag.originY + dy, scale: camera.scale }, true);
    }

    function endDrag(event) {
      if (!drag || (event && event.pointerId !== undefined && event.pointerId !== drag.id)) return;
      var d = drag;
      drag = null;
      el.classList.remove('is-panning');
      try { el.releasePointerCapture(d.id); } catch (e) { /* ignore */ }
      if (d.moved && event) {
        var dx = event.clientX - d.startX;
        var dy = event.clientY - d.startY;
        var result = dispatch('setCamera', cameraPayload({ x: d.originX + dx, y: d.originY + dy, scale: camera.scale }));
        if (!result || !result.ok) applyTransform(camera, true);
      } else {
        applyTransform(camera, true);
      }
    }

    function onWheel(event) {
      // The wheel scrolls the page unless the gesture is intentional (Ctrl/⌘ + wheel).
      if (!(event.ctrlKey || event.metaKey) || !contextKey) return;
      event.preventDefault();
      var rect = el.getBoundingClientRect();
      zoom(event.deltaY < 0 ? GEOMETRY.scaleStep : -GEOMETRY.scaleStep, event.clientX - rect.left, event.clientY - rect.top);
    }

    function onKeyDown(event) {
      if (event.target !== el || !contextKey) return;
      var step = event.shiftKey ? GEOMETRY.panStep * 3 : GEOMETRY.panStep;
      var handled = true;
      switch (event.key) {
        case 'ArrowLeft': pan(step, 0); break;
        case 'ArrowRight': pan(-step, 0); break;
        case 'ArrowUp': pan(0, step); break;
        case 'ArrowDown': pan(0, -step); break;
        case '+': case '=': case 'Add': zoom(GEOMETRY.scaleStep); break;
        case '-': case '_': case 'Subtract': zoom(-GEOMETRY.scaleStep); break;
        case '0': reset(); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    }

    listen(el, 'pointerdown', onPointerDown);
    listen(el, 'pointermove', onPointerMove);
    listen(el, 'pointerup', endDrag);
    listen(el, 'pointercancel', endDrag);
    listen(el, 'lostpointercapture', function () { if (drag) endDrag(null); });
    listen(el, 'wheel', onWheel, { passive: false });
    listen(el, 'keydown', onKeyDown);
    listen(el, 'dragstart', function (event) { if (isBackground(event.target)) event.preventDefault(); });

    if (content.width || content.height) setSize(content.width, content.height);
    syncCamera();

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach(function (off) { off(); });
      listeners = [];
      drag = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    return {
      el: el,
      layer: layer,
      edges: edges,
      toolbar: toolbar,
      setSize: setSize,
      getSize: function () { return { width: content.width, height: content.height }; },
      syncCamera: syncCamera,
      getCamera: function () { return { x: camera.x, y: camera.y, scale: camera.scale }; },
      setContextKey: setContextKey,
      getContextKey: function () { return contextKey; },
      fit: fit,
      reset: reset,
      zoom: zoom,
      pan: pan,
      setMessage: setMessage,
      viewportSize: viewportSize,
      destroy: destroy
    };
  }

  /* ---------- nodeButton ---------- */

  function badgeList(atoms, badges) {
    if (!badges) return [];
    var list = Array.isArray(badges) ? badges : [badges];
    return list.filter(Boolean).map(function (b) {
      if (dom.isNode(b)) return b;
      if (typeof b === 'string') return atoms.badge({ label: b });
      return atoms.badge({ label: b.label, tone: b.tone || 'neutral', icon: b.icon });
    });
  }

  /* nodeButton({ id, type, title, subtitle, meta, badges, testid, selected, related, dimmed, external,
   *              proposed, collective, versionId, onSelect, onActivate, extraClass, describedBy, icon, count }) */
  function nodeButton(spec) {
    var s = spec || {};
    var atoms = require('ds/atoms');
    var icons = require('ds/icons');
    var packCore = Primus.has('core/pack') ? require('core/pack') : null;
    var type = s.type || 'activity';
    var iconName = s.icon || (packCore && packCore.typeIcon ? packCore.typeIcon(type) : type);
    var typeLabel = s.typeLabel || (packCore && packCore.typeLabel ? packCore.typeLabel(type) : null);
    var id = s.id || null;
    var focusKey = s.focusKey || ('node:' + (s.versionId ? s.versionId + ':' : '') + (id || ''));
    var classes = ['node', 'node--' + type,
      s.external ? 'node--external' : null,
      s.proposed ? 'node--proposed' : null,
      s.compact ? 'node--compact' : null,
      s.wide ? 'node--wide' : null,
      s.selected ? 'is-selected' : null,
      s.related ? 'is-related' : null,
      s.dimmed ? 'is-dimmed' : null,
      s.root ? 'is-root' : null,
      s.expanded ? 'is-expanded' : null,
      s.unavailable ? 'is-unavailable' : null,
      s.isDemo ? 'is-demo' : null,
      s.extraClass || null];
    var iconEl = s.icon === false ? null : (dom.isNode(iconName) ? iconName : icons.icon(String(iconName), { extraClass: 'node__icon', label: typeLabel || null }));
    var children = [
      h('span', { class: 'node__head' },
        iconEl,
        h('span', { class: 'node__name' }, s.title || id || ''),
        s.count !== undefined && s.count !== null && s.count !== '' ? h('span', { class: 'node__count' }, String(s.count)) : null),
      s.subtitle ? h('span', { class: 'node__subtitle' }, s.subtitle) : null,
      s.meta ? h('span', { class: 'node__meta' }, s.meta) : null,
      s.showId && id ? h('span', { class: 'node__id' }, id) : null
    ];
    var badges = badgeList(atoms, s.badges);
    if (s.collective && s.collectiveLabel) badges.push(atoms.badge({ label: s.collectiveLabel, tone: 'neutral' }));
    if (badges.length) children.push(h('span', { class: 'node__badges' }, badges));
    var el = h('button', {
      type: 'button',
      class: classes,
      'data-entity-id': id,
      'data-version-id': s.versionId || null,
      'data-node-kind': s.kind || null,
      'data-focus-key': focusKey,
      'data-testid': s.testid || (id ? 'node-' + (s.versionId ? s.versionId + '-' : '') + id : null),
      'aria-pressed': s.selected ? 'true' : 'false',
      'aria-describedby': s.describedBy || null,
      'aria-label': s.ariaLabel || null,
      title: s.tooltip || null,
      style: s.x !== undefined || s.y !== undefined ? { left: num(s.x, 0), top: num(s.y, 0), width: s.width !== undefined ? s.width : null, height: s.height !== undefined ? s.height : null } : null,
      on: {
        click: function (event) { if (isFn(s.onSelect)) s.onSelect(event, s); },
        dblclick: function (event) { if (isFn(s.onActivate)) { event.preventDefault(); s.onActivate(event, s); } }
      }
    }, children);
    return el;
  }

  /* ---------- geometry helpers ---------- */

  function rectOf(geometry, id) {
    if (!geometry) return null;
    var r = typeof geometry.get === 'function' ? geometry.get(id) : geometry[id];
    if (!r) return null;
    return { x: num(r.x, 0), y: num(r.y, 0), w: num(r.w !== undefined ? r.w : r.width, GEOMETRY.nodeMinWidth), h: num(r.h !== undefined ? r.h : r.height, GEOMETRY.nodeMinHeight) };
  }

  function center(r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }

  /* Picks exit/entry anchors and returns an orthogonal (or curved) path with its label position. */
  function routeEdge(from, to, edge, router) {
    var fc = center(from);
    var tc = center(to);
    var pts;
    if (edge.loop) {
      // Backward edge: leave from the side, travel around the nodes and come back in from the top.
      var out = GEOMETRY.nodeGap;
      var goLeft = tc.x <= fc.x;
      var x1 = goLeft ? from.x - out : from.x + from.w + out;
      var bottomY = Math.max(from.y + from.h, to.y + to.h) + out;
      var x2 = goLeft ? to.x - out : to.x + to.w + out;
      var sameRow = Math.abs(fc.y - tc.y) < GEOMETRY.nodeMinHeight;
      if (sameRow) {
        pts = [
          { x: goLeft ? from.x : from.x + from.w, y: fc.y },
          { x: x1, y: fc.y },
          { x: x1, y: bottomY },
          { x: x2, y: bottomY },
          { x: x2, y: tc.y },
          { x: goLeft ? to.x + to.w : to.x, y: tc.y }
        ];
      } else {
        pts = [
          { x: fc.x, y: from.y + from.h },
          { x: fc.x, y: bottomY },
          { x: tc.x + (goLeft ? -1 : 1) * (to.w / 2 + out), y: bottomY },
          { x: tc.x + (goLeft ? -1 : 1) * (to.w / 2 + out), y: tc.y },
          { x: goLeft ? to.x + to.w : to.x, y: tc.y }
        ];
      }
      return { points: pts, label: { x: (pts[1].x + pts[2].x) / 2, y: pts[2].y - 6 } };
    }
    var dx = tc.x - fc.x;
    var dy = tc.y - fc.y;
    var horizontal = Math.abs(dx) >= Math.abs(dy) && !(to.x < from.x + from.w && to.x + to.w > from.x);
    var start;
    var end;
    if (horizontal) {
      var rightwards = dx >= 0;
      start = { x: rightwards ? from.x + from.w : from.x, y: fc.y };
      end = { x: rightwards ? to.x : to.x + to.w, y: tc.y };
      if (router === 'curve') {
        var mx = (start.x + end.x) / 2;
        return { points: [start, end], curve: ['M', start.x, start.y, 'C', mx, start.y, mx, end.y, end.x, end.y], label: { x: mx, y: (start.y + end.y) / 2 - 6 } };
      }
      var midX = (start.x + end.x) / 2;
      pts = Math.abs(start.y - end.y) < 1 ? [start, end] : [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
      return { points: pts, label: { x: midX, y: Math.min(start.y, end.y) + Math.abs(start.y - end.y) / 2 - 6 } };
    }
    var downwards = dy >= 0;
    start = { x: fc.x, y: downwards ? from.y + from.h : from.y };
    end = { x: tc.x, y: downwards ? to.y : to.y + to.h };
    if (router === 'curve') {
      var my = (start.y + end.y) / 2;
      return { points: [start, end], curve: ['M', start.x, start.y, 'C', start.x, my, end.x, my, end.x, end.y], label: { x: (start.x + end.x) / 2 + 8, y: my } };
    }
    var midY = (start.y + end.y) / 2;
    pts = Math.abs(start.x - end.x) < 1 ? [start, end] : [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
    return { points: pts, label: { x: (start.x + end.x) / 2 + (Math.abs(start.x - end.x) < 1 ? 8 : 0), y: midY - 6 } };
  }

  function pathData(route) {
    if (route.curve) return route.curve.map(function (v) { return typeof v === 'number' ? Math.round(v * 10) / 10 : v; }).join(' ');
    return route.points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + (Math.round(p.x * 10) / 10) + ' ' + (Math.round(p.y * 10) / 10); }).join(' ');
  }

  function ensureMarkers(svg) {
    var prefix = svg.getAttribute('data-marker-prefix');
    if (!prefix) {
      markerCounter += 1;
      prefix = 'edge-marker-' + markerCounter;
      svg.setAttribute('data-marker-prefix', prefix);
    }
    var defs = svgEl('defs', null);
    ['default', 'related', 'selected', 'muted'].forEach(function (kind) {
      defs.appendChild(svgEl('marker', { id: prefix + '-' + kind, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse', markerUnits: 'strokeWidth' },
        svgEl('path', { class: ['edge-marker', kind !== 'default' ? 'edge-marker--' + kind : null], d: 'M 0 0 L 10 5 L 0 10 z' })));
    });
    return { defs: defs, prefix: prefix };
  }

  /* drawEdges(svg, edges, geometry, { router: 'orthogonal'|'curve' }) */
  function drawEdges(svg, edgeList, geometry, options) {
    var opts = options || {};
    var router = opts.router === 'curve' ? 'curve' : 'orthogonal';
    dom.clear(svg);
    var markers = ensureMarkers(svg);
    svg.appendChild(markers.defs);
    var drawn = [];
    (Array.isArray(edgeList) ? edgeList : []).forEach(function (edge) {
      if (!edge) return;
      var from = rectOf(geometry, edge.from);
      var to = rectOf(geometry, edge.to);
      if (!from || !to) return;
      var route = routeEdge(from, to, edge, edge.router || router);
      var markerKind = edge.selected ? 'selected' : (edge.related ? 'related' : (edge.dimmed || edge.muted ? 'muted' : 'default'));
      var group = svgEl('g', { class: 'edge-group', 'data-edge-id': edge.id || null, 'data-from': edge.from, 'data-to': edge.to });
      group.appendChild(svgEl('path', {
        class: ['edge',
          edge.related ? 'edge--related' : null,
          edge.selected ? 'edge--selected' : null,
          edge.loop ? 'edge--loop' : null,
          edge.inferred ? 'edge--inferred' : null,
          edge.proposed ? 'edge--proposed' : null,
          edge.dashed && !edge.loop && !edge.inferred ? 'edge--exchange' : null,
          edge.dimmed ? 'edge--dimmed' : null,
          edge.group ? 'edge--group' : null,
          edge.groupLine ? 'edge--group-line' : null,
          edge.extraClass || null],
        d: pathData(route),
        'marker-end': edge.arrow === false ? null : 'url(#' + markers.prefix + '-' + markerKind + ')'
      }));
      if (edge.label) {
        var labelText = String(edge.label);
        var width = Math.round(labelText.length * 6.6 + 12);
        var height = 18;
        var lx = Math.round(route.label.x);
        var ly = Math.round(route.label.y);
        group.appendChild(svgEl('rect', { class: 'edge-label__bg', x: lx - width / 2, y: ly - height + 4, width: width, height: height, rx: 4 }));
        group.appendChild(svgEl('text', { class: ['edge-label', edge.dimmed || edge.muted ? 'edge-label--muted' : null], x: lx, y: ly, 'text-anchor': 'middle' }, labelText));
      }
      svg.appendChild(group);
      drawn.push({ id: edge.id, points: route.points });
    });
    return drawn;
  }

  /* measure(layer) → Map(id → { x, y, w, h }) from the rendered .node elements. */
  function measure(layer) {
    var map = new Map();
    if (!layer || !layer.querySelectorAll) return map;
    var nodes = layer.querySelectorAll('.node[data-entity-id], .node[data-node-id], [data-measure-id]');
    Array.prototype.forEach.call(nodes, function (node) {
      var id = node.getAttribute('data-measure-id') || node.getAttribute('data-node-id') || node.getAttribute('data-entity-id');
      if (!id) return;
      var vid = node.getAttribute('data-version-id');
      var key = node.getAttribute('data-measure-id') ? id : id;
      var rect = {
        x: parseFloat(node.style.left) || 0,
        y: parseFloat(node.style.top) || 0,
        w: node.offsetWidth || parseFloat(node.style.width) || GEOMETRY.nodeMinWidth,
        h: node.offsetHeight || parseFloat(node.style.height) || GEOMETRY.nodeMinHeight
      };
      map.set(key, rect);
      if (vid && !map.has(vid + ':' + id)) map.set(vid + ':' + id, rect);
    });
    return map;
  }

  function placeNode(el, pos) {
    if (!el || !pos) return;
    el.style.left = Math.round(num(pos.x, 0)) + 'px';
    el.style.top = Math.round(num(pos.y, 0)) + 'px';
    if (pos.w !== undefined && pos.w !== null) el.style.width = Math.round(pos.w) + 'px';
    if (pos.h !== undefined && pos.h !== null && pos.fixedHeight) el.style.height = Math.round(pos.h) + 'px';
  }

  /* twoPassLayout(layer, nodesSpec, layoutFn) — nodesSpec: [{ id, el, w?, h? }] (or plain elements
   * with data-entity-id). layoutFn(sizes: Map(id → {w,h}), pass) → { nodes: [{ id, x, y, w?, h? }],
   * width, height, edges? } (or just the nodes array). Pass 1 renders at preliminary positions,
   * measures the wrapped heights, pass 2 re-runs the layout with the measured sizes. Returns the
   * geometry Map (id → {x,y,w,h}) with `.layout` holding the second layout result. */
  function twoPassLayout(layer, nodesSpec, layoutFn) {
    var specs = (Array.isArray(nodesSpec) ? nodesSpec : []).map(function (n) {
      if (dom.isNode(n)) return { id: n.getAttribute('data-measure-id') || n.getAttribute('data-entity-id'), el: n };
      return n;
    }).filter(function (n) { return n && n.el && n.id; });
    var byId = new Map();
    specs.forEach(function (s) { byId.set(s.id, s.el); if (!s.el.parentNode) layer.appendChild(s.el); });

    function normalize(result) {
      if (Array.isArray(result)) return { nodes: result, width: 0, height: 0 };
      return result || { nodes: [], width: 0, height: 0 };
    }

    function apply(result) {
      (result.nodes || []).forEach(function (n) {
        var el = byId.get(n.id);
        if (el) placeNode(el, n);
      });
    }

    var sizes = new Map();
    specs.forEach(function (s) { sizes.set(s.id, { w: num(s.w, GEOMETRY.nodeMinWidth), h: num(s.h, GEOMETRY.nodeMinHeight) }); });
    var first = normalize(layoutFn(sizes, 1));
    apply(first);
    var measured = measure(layer);
    var sizes2 = new Map();
    specs.forEach(function (s) {
      var m = measured.get(s.id);
      sizes2.set(s.id, m ? { w: m.w, h: m.h } : sizes.get(s.id));
    });
    var second = normalize(layoutFn(sizes2, 2));
    apply(second);
    var geometry = new Map();
    (second.nodes || []).forEach(function (n) {
      var size = sizes2.get(n.id) || { w: GEOMETRY.nodeMinWidth, h: GEOMETRY.nodeMinHeight };
      geometry.set(n.id, { x: num(n.x, 0), y: num(n.y, 0), w: num(n.w, size.w), h: num(n.h, size.h) });
    });
    var bounds = contentBounds(geometry);
    geometry.layout = second;
    geometry.width = Math.max(num(second.width, 0), bounds.width);
    geometry.height = Math.max(num(second.height, 0), bounds.height);
    return geometry;
  }

  function contentBounds(geometry, padding) {
    var pad = num(padding, GEOMETRY.nodeGap);
    var maxX = 0;
    var maxY = 0;
    geometry.forEach(function (r) {
      maxX = Math.max(maxX, r.x + r.w);
      maxY = Math.max(maxY, r.y + r.h);
    });
    return { width: maxX ? maxX + pad : 0, height: maxY ? maxY + pad : 0 };
  }

  return {
    GEOMETRY: GEOMETRY,
    createCanvas: createCanvas,
    nodeButton: nodeButton,
    drawEdges: drawEdges,
    measure: measure,
    twoPassLayout: twoPassLayout,
    placeNode: placeNode,
    contentBounds: contentBounds,
    routeEdge: routeEdge,
    clampScale: clampScale,
    scaleText: scaleText
  };
});
