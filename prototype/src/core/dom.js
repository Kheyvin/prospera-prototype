/* core/dom — DOM construction and focus/scroll helpers (CONTRACTS §5.1).
 *
 * Loads in Node without touching `document`: every function that needs a DOM resolves
 * it lazily through doc() and throws a clear error when none is available. No innerHTML
 * is used anywhere; text always becomes text nodes. */
Primus.module('core/dom', function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var LIVE_REGION_ID = 'primus-live';

  /* Style keys accepted by the `style` attr: computed geometry only (CONTRACTS §3). */
  var GEOMETRY_STYLE = {
    transform: true, transformOrigin: true,
    left: true, top: true, right: true, bottom: true,
    width: true, height: true,
    minWidth: true, minHeight: true, maxWidth: true, maxHeight: true
  };

  /* Attributes that are presence-only booleans. */
  var BOOLEAN_ATTRS = {
    disabled: true, hidden: true, readonly: true, readOnly: true, required: true,
    multiple: true, autofocus: true, open: true, inert: true, novalidate: true, autoplay: true, controls: true
  };

  /* Attributes that must be set as element properties to reflect live state. */
  var PROPERTY_ATTRS = { checked: true, selected: true, indeterminate: true };

  var FOCUSABLE_SELECTOR = [
    'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])', 'textarea:not([disabled])', 'summary', 'iframe', 'audio[controls]',
    'video[controls]', '[contenteditable="true"]', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function doc() {
    if (typeof document === 'undefined' || !document) {
      throw new Error('core/dom: no DOM available (document is undefined); call this only in the browser');
    }
    return document;
  }

  function isNode(value) {
    return !!value && typeof value === 'object' && typeof value.nodeType === 'number' && typeof value.nodeName === 'string';
  }

  function isAttrs(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value) && !isNode(value);
  }

  function text(value) {
    return doc().createTextNode(value === null || value === undefined ? '' : String(value));
  }

  function classString(value) {
    if (value === null || value === undefined || value === false) return '';
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) {
      return value.map(classString).filter(Boolean).join(' ');
    }
    if (typeof value === 'object') {
      return Object.keys(value).filter(function (k) { return !!value[k]; }).join(' ');
    }
    return String(value);
  }

  function appendChildren(el, children) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child === null || child === undefined || child === false || child === true) continue;
      if (Array.isArray(child)) { appendChildren(el, child); continue; }
      if (isNode(child)) { el.appendChild(child); continue; }
      el.appendChild(text(child));
    }
  }

  function applyStyle(el, style) {
    if (!style || typeof style !== 'object') return;
    Object.keys(style).forEach(function (key) {
      if (!GEOMETRY_STYLE[key]) return; // non-geometry styles belong in CSS classes
      var value = style[key];
      if (value === null || value === undefined || value === false) { el.style[key] = ''; return; }
      el.style[key] = typeof value === 'number' && key !== 'transform' ? value + 'px' : String(value);
    });
  }

  function applyHandlers(el, on) {
    if (!on || typeof on !== 'object') return;
    Object.keys(on).forEach(function (eventName) {
      var handler = on[eventName];
      if (typeof handler === 'function') el.addEventListener(eventName, handler);
    });
  }

  function applyDataset(el, dataset) {
    if (!dataset || typeof dataset !== 'object') return;
    Object.keys(dataset).forEach(function (key) {
      var value = dataset[key];
      if (value === null || value === undefined || value === false) return;
      el.dataset[key] = String(value);
    });
  }

  /* Applies an attrs object to an existing element (HTML or SVG). */
  function setAttrs(el, attrs, svgMode) {
    if (!attrs) return el;
    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];
      if (key === 'class' || key === 'className') {
        var cls = classString(value);
        if (cls) el.setAttribute('class', cls); else el.removeAttribute('class');
        return;
      }
      if (key === 'style') { applyStyle(el, value); return; }
      if (key === 'on') { applyHandlers(el, value); return; }
      if (key === 'dataset') { applyDataset(el, value); return; }
      if (key === 'ref') { if (typeof value === 'function') value(el); return; }
      if (key === 'text') { el.appendChild(text(value)); return; }
      if (/^on[A-Z]/.test(key) && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
        return;
      }
      if (value === null || value === undefined) { el.removeAttribute(key); return; }
      if (key === 'for' || key === 'htmlFor') { el.setAttribute('for', String(value)); return; }
      if (key === 'tabindex' || key === 'tabIndex') { el.setAttribute('tabindex', String(value)); return; }
      if (!svgMode && key === 'value') {
        if ('value' in el) el.value = value; else el.setAttribute('value', String(value));
        return;
      }
      if (!svgMode && PROPERTY_ATTRS[key]) {
        el[key] = !!value;
        if (key !== 'indeterminate') { if (value) el.setAttribute(key, ''); else el.removeAttribute(key); }
        return;
      }
      if (BOOLEAN_ATTRS[key]) {
        var attrName = key === 'readOnly' ? 'readonly' : key;
        if (value) el.setAttribute(attrName, ''); else el.removeAttribute(attrName);
        return;
      }
      if (value === false) { el.removeAttribute(key); return; }
      if (value === true) { el.setAttribute(key, key.indexOf('aria-') === 0 ? 'true' : ''); return; }
      el.setAttribute(key, String(value));
    });
    return el;
  }

  function build(el, attrs, rest, svgMode) {
    var children = rest;
    if (!isAttrs(attrs) && attrs !== null && attrs !== undefined) {
      children = [attrs].concat(rest);
      attrs = null;
    }
    setAttrs(el, attrs, svgMode);
    appendChildren(el, children);
    return el;
  }

  /* h('button', { class: 'btn', on: { click: fn } }, 'Cerrar') */
  function h(tag, attrs) {
    var rest = Array.prototype.slice.call(arguments, 2);
    return build(doc().createElement(tag), attrs, rest, false);
  }

  /* svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: '...' })) */
  function svg(tag, attrs) {
    var rest = Array.prototype.slice.call(arguments, 2);
    return build(doc().createElementNS(SVG_NS, tag), attrs, rest, true);
  }

  function clear(el) {
    if (!el) return el;
    while (el.firstChild) el.removeChild(el.firstChild);
    return el;
  }

  function replace(el) {
    var children = Array.prototype.slice.call(arguments, 1);
    clear(el);
    appendChildren(el, children);
    return el;
  }

  function setText(el, value) {
    if (!el) return el;
    el.textContent = value === null || value === undefined ? '' : String(value);
    return el;
  }

  function on(el, eventName, handler, options) {
    el.addEventListener(eventName, handler, options);
    return function () { el.removeEventListener(eventName, handler, options); };
  }

  function escapeAttrValue(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function layoutAvailable(d) {
    try {
      return !!(d.body && typeof d.body.getClientRects === 'function' && d.body.getClientRects().length > 0);
    } catch (e) { return false; }
  }

  function isRendered(el, withLayout) {
    if (el.closest && el.closest('[hidden]')) return false;
    if (el.closest && el.closest('[inert]')) return false;
    if (!withLayout) return true;
    try {
      if (el.getClientRects().length === 0 && !el.offsetWidth && !el.offsetHeight) return false;
    } catch (e) { /* ignore */ }
    return true;
  }

  function focusables(el) {
    if (!el || typeof el.querySelectorAll !== 'function') return [];
    var d = doc();
    var withLayout = layoutAvailable(d);
    var list = Array.prototype.slice.call(el.querySelectorAll(FOCUSABLE_SELECTOR));
    return list.filter(function (node) { return isRendered(node, withLayout); });
  }

  function safeFocus(node, options) {
    if (!node || typeof node.focus !== 'function') return false;
    try { node.focus(options || { preventScroll: true }); } catch (e) { try { node.focus(); } catch (e2) { return false; } }
    return doc().activeElement === node;
  }

  function focusFirst(el) {
    var list = focusables(el);
    if (list.length) { safeFocus(list[0]); return list[0]; }
    return null;
  }

  function focusLast(el) {
    var list = focusables(el);
    if (list.length) { safeFocus(list[list.length - 1]); return list[list.length - 1]; }
    return null;
  }

  function readSelection(node) {
    try {
      if (typeof node.selectionStart === 'number' && typeof node.selectionEnd === 'number') {
        return { start: node.selectionStart, end: node.selectionEnd };
      }
    } catch (e) { /* some input types throw */ }
    return null;
  }

  function writeSelection(node, sel) {
    if (!sel) return;
    try { if (typeof node.setSelectionRange === 'function') node.setSelectionRange(sel.start, sel.end); } catch (e) { /* ignore */ }
  }

  /* Runs renderFn and brings focus back to the element that had it (by data-focus-key or id). */
  function preserveFocus(container, renderFn) {
    var d = doc();
    var active = d.activeElement;
    var key = null;
    var id = null;
    var selection = null;
    if (active && container && typeof container.contains === 'function' && container.contains(active)) {
      key = active.getAttribute && active.getAttribute('data-focus-key');
      id = active.id || null;
      selection = readSelection(active);
    }
    var result = typeof renderFn === 'function' ? renderFn() : undefined;
    if (key || id) {
      var target = null;
      if (key) target = container.querySelector('[data-focus-key="' + escapeAttrValue(key) + '"]');
      if (!target && id) target = container.querySelector('[id="' + escapeAttrValue(id) + '"]');
      if (target && d.activeElement !== target) {
        safeFocus(target);
        writeSelection(target, selection);
      }
    }
    return result;
  }

  function preserveScroll(el, renderFn) {
    if (!el) return typeof renderFn === 'function' ? renderFn() : undefined;
    var top = el.scrollTop;
    var left = el.scrollLeft;
    var result = typeof renderFn === 'function' ? renderFn() : undefined;
    if (el.scrollTop !== top) el.scrollTop = top;
    if (el.scrollLeft !== left) el.scrollLeft = left;
    return result;
  }

  var lastAnnounced = null;

  function liveRegion() {
    var d = doc();
    var region = d.getElementById(LIVE_REGION_ID);
    if (!region) {
      region = d.createElement('div');
      region.id = LIVE_REGION_ID;
      region.className = 'sr-only';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      (d.body || d.documentElement).appendChild(region);
    }
    return region;
  }

  /* Writes to the polite live region; identical consecutive texts are not repeated. */
  function announce(message) {
    var value = message === null || message === undefined ? '' : String(message);
    if (!value) return false;
    if (value === lastAnnounced) return false;
    lastAnnounced = value;
    liveRegion().textContent = value;
    return true;
  }

  function resetAnnouncer() { lastAnnounced = null; }

  /* Keeps Tab / Shift+Tab inside dialogEl and pulls stray focus back in. Returns release(). */
  function trapFocus(dialogEl) {
    var d = doc();
    function onKeydown(event) {
      if (event.key !== 'Tab') return;
      var list = focusables(dialogEl);
      if (!list.length) {
        event.preventDefault();
        safeFocus(dialogEl);
        return;
      }
      var first = list[0];
      var last = list[list.length - 1];
      var current = d.activeElement;
      var inside = dialogEl.contains(current);
      if (event.shiftKey) {
        if (!inside || current === first || current === dialogEl) { event.preventDefault(); safeFocus(last); }
      } else if (!inside || current === last) {
        event.preventDefault();
        safeFocus(first);
      }
    }
    function onFocusIn(event) {
      if (dialogEl.contains(event.target)) return;
      var list = focusables(dialogEl);
      safeFocus(list.length ? list[0] : dialogEl);
    }
    dialogEl.addEventListener('keydown', onKeydown);
    d.addEventListener('focusin', onFocusIn);
    return function release() {
      dialogEl.removeEventListener('keydown', onKeydown);
      d.removeEventListener('focusin', onFocusIn);
    };
  }

  var KEY_ALIASES = { Space: ' ', Spacebar: ' ', Esc: 'Escape', Left: 'ArrowLeft', Right: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown' };

  /* onKey(el, { Escape: fn, Enter: fn, ' ': fn }) — handler(event); return false to keep the default. */
  function onKey(el, map) {
    function handler(event) {
      var key = KEY_ALIASES[event.key] || event.key;
      var fn = map[key];
      if (typeof fn !== 'function' && KEY_ALIASES[key] === undefined) {
        Object.keys(KEY_ALIASES).some(function (alias) {
          if (KEY_ALIASES[alias] === key && typeof map[alias] === 'function') { fn = map[alias]; return true; }
          return false;
        });
      }
      if (typeof fn !== 'function') return;
      var outcome = fn(event);
      if (outcome !== false) event.preventDefault();
    }
    el.addEventListener('keydown', handler);
    return function () { el.removeEventListener('keydown', handler); };
  }

  function hasDom() { return typeof document !== 'undefined' && !!document; }

  return {
    h: h,
    svg: svg,
    text: text,
    clear: clear,
    replace: replace,
    setText: setText,
    setAttrs: setAttrs,
    on: on,
    preserveFocus: preserveFocus,
    preserveScroll: preserveScroll,
    focusFirst: focusFirst,
    focusLast: focusLast,
    focusables: focusables,
    announce: announce,
    resetAnnouncer: resetAnnouncer,
    trapFocus: trapFocus,
    onKey: onKey,
    isNode: isNode,
    hasDom: hasDom,
    classString: classString,
    LIVE_REGION_ID: LIVE_REGION_ID,
    SVG_NS: SVG_NS
  };
});
