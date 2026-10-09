/* ds/molecules — molecules of the PRENTER portable bank (CONTRACTS §8).
 *
 * Tabs, breadcrumbs, search field, entity link, status label, metric, table,
 * disclosure, modal/confirm, toasts, empty state, notice, list, key-value. Everything is
 * built with core/dom; factories never read the store. Modal is the only molecule that
 * queries DOM outside its own element (#primus-overlays and #primus-app, as CONTRACTS §13
 * allows). No DOM work at factory time. */
Primus.module('ds/molecules', function (require) {
  'use strict';

  var dom = require('core/dom');
  var icons = require('ds/icons');
  var atoms = require('ds/atoms');

  var OVERLAYS_ID = 'primus-overlays';
  var APP_ID = 'primus-app';
  var LIVE_ID = 'primus-live';
  var TOASTS_ID = 'primus-toasts';

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function bool(value) {
    return value ? 'true' : 'false';
  }

  function text(key, params) {
    return atoms.text(key, params);
  }

  function applyExtras(el, opts) {
    return atoms.applyExtras(el, opts);
  }

  /* ── Tabs ────────────────────────────────────────────────────────────── */

  /* tabs({ id, tabs: [{ id, label, testid?, icon?, disabled? }], selectedId, onSelect, mode, orientation })
   * → { el, panelAttrs(tabId) }. Manual activation: arrows move focus, Enter/Space (native
   * click) select, Home/End jump. One tab stop (roving tabindex). */
  function tabs(options) {
    var opts = options || {};
    var id = str(opts.id) || atoms.nextId('tabs');
    var items = Array.isArray(opts.tabs) ? opts.tabs : [];
    var mode = opts.mode === 'local' ? 'local' : 'presentation';
    var vertical = opts.orientation === 'vertical';
    var tabElementId = typeof opts.tabElementId === 'function' ? opts.tabElementId : function (tabId) { return id + '-tab-' + tabId; };
    var panelElementId = typeof opts.panelElementId === 'function' ? opts.panelElementId : function (tabId) { return id + '-panel-' + tabId; };
    var selectedId = opts.selectedId;
    var hasSelected = items.some(function (t) { return t.id === selectedId; });
    var buttons = [];

    function focusIndex(index) {
      var enabled = buttons.filter(function (b) { return b.getAttribute('aria-disabled') !== 'true'; });
      if (!enabled.length) return;
      var n = enabled.length;
      var target = enabled[((index % n) + n) % n];
      target.focus();
    }

    function onKeydown(event) {
      var enabled = buttons.filter(function (b) { return b.getAttribute('aria-disabled') !== 'true'; });
      var current = enabled.indexOf(event.currentTarget);
      var next = (vertical && event.key === 'ArrowDown') || (!vertical && event.key === 'ArrowRight') ? current + 1
        : (vertical && event.key === 'ArrowUp') || (!vertical && event.key === 'ArrowLeft') ? current - 1
          : event.key === 'Home' ? 0
            : event.key === 'End' ? enabled.length - 1
              : null;
      if (next === null) return;
      event.preventDefault();
      focusIndex(next);
    }

    items.forEach(function (tab, index) {
      var selected = hasSelected ? tab.id === selectedId : index === 0;
      var disabled = !!tab.disabled;
      var btn = dom.h('button', {
        type: 'button',
        role: 'tab',
        class: ['tab', selected ? 'is-selected' : null, disabled ? 'is-disabled' : null],
        id: tabElementId(tab.id),
        'aria-selected': bool(selected),
        'aria-controls': panelElementId(tab.id),
        'aria-disabled': disabled ? 'true' : null,
        tabindex: selected ? '0' : '-1',
        'data-tab-id': tab.id,
        'data-testid': tab.testid || null,
        'data-focus-key': tab.focusKey || ('tab:' + tab.id),
        on: {
          click: function (event) {
            if (disabled) { event.preventDefault(); return; }
            if (typeof opts.onSelect === 'function') opts.onSelect(tab.id, event);
          },
          keydown: onKeydown
        }
      },
      tab.icon ? atoms.iconNode(tab.icon, 'tab__icon') : null,
      dom.h('span', { class: 'tab__label' }, str(tab.label)),
      tab.badge ? dom.h('span', { class: 'tab__badge' }, str(tab.badge)) : null);
      buttons.push(btn);
    });

    var el = dom.h.apply(null, ['div', {
      class: ['tabs', 'tabs--' + mode, vertical ? 'tabs--vertical' : null, opts.extraClass || null],
      id: id,
      role: 'tablist',
      'aria-label': opts.ariaLabel || null,
      'aria-labelledby': opts.labelledBy || null,
      'aria-orientation': vertical ? 'vertical' : null
    }].concat(buttons));
    applyExtras(el, opts);

    function panelAttrs(tabId) {
      return {
        id: panelElementId(tabId),
        role: 'tabpanel',
        'aria-labelledby': tabElementId(tabId),
        tabindex: '0'
      };
    }

    return { el: el, panelAttrs: panelAttrs, tabElementId: tabElementId, panelElementId: panelElementId };
  }

  /* ── Breadcrumbs ─────────────────────────────────────────────────────── */

  function breadcrumbs(options) {
    var opts = options || {};
    var items = Array.isArray(opts.items) ? opts.items : [];
    var lis = items.map(function (item, index) {
      var last = index === items.length - 1;
      var clickable = typeof item.onClick === 'function' && !last;
      var content = clickable
        ? dom.h('button', {
          type: 'button', class: 'breadcrumbs__link',
          'data-testid': item.testid || ('breadcrumb-' + index),
          on: { click: function (event) { item.onClick(event); } }
        }, str(item.label))
        : dom.h('span', {
          class: ['breadcrumbs__current', last ? null : 'breadcrumbs__static'],
          'aria-current': last ? 'page' : null,
          'data-testid': item.testid || ('breadcrumb-' + index)
        }, str(item.label));
      return dom.h('li', { class: 'breadcrumbs__item' },
        index > 0 ? icons.icon('chevronRight', { extraClass: 'breadcrumbs__sep' }) : null,
        content);
    });
    var el = dom.h('nav', { class: ['breadcrumbs', opts.extraClass || null], 'aria-label': opts.ariaLabel || text('breadcrumbs') },
      dom.h.apply(null, ['ol', { class: 'breadcrumbs__list' }].concat(lis)));
    return applyExtras(el, opts);
  }

  /* ── Search field ────────────────────────────────────────────────────── */

  function searchField(options) {
    var opts = options || {};
    var id = str(opts.id) || atoms.nextId('search');
    var resultsId = id + '-results';
    var value = str(opts.value);
    var inputEl = atoms.input({
      id: id,
      type: 'search',
      value: value,
      placeholder: opts.placeholder || null,
      onInput: opts.onInput,
      onKeydown: function (event) {
        if (event.key === 'Escape' && event.target.value && typeof opts.onClear === 'function') {
          event.preventDefault();
          event.stopPropagation();
          opts.onClear(event);
        }
        if (typeof opts.onKeydown === 'function') opts.onKeydown(event);
      },
      testid: opts.testid,
      focusKey: opts.focusKey || ('search:' + id),
      extraClass: 'search-field__input',
      autocomplete: 'off',
      attrs: { 'aria-describedby': opts.resultsText ? resultsId : null, 'aria-controls': opts.controls || null, 'aria-expanded': opts.expanded === undefined ? null : bool(opts.expanded) }
    });
    var clearBtn = typeof opts.onClear === 'function' ? atoms.iconButton({
      icon: 'close',
      ariaLabel: opts.clearLabel || text('clearSearch'),
      size: 'sm',
      onClick: function (event) { opts.onClear(event); },
      testid: opts.clearTestid,
      extraClass: 'search-field__clear'
    }) : null;
    if (clearBtn && !value) clearBtn.hidden = true;
    var el = dom.h('div', { class: ['search-field', opts.extraClass || null], role: opts.role === false ? null : 'search' },
      dom.h('label', { class: ['search-field__label', opts.labelVisible ? null : 'sr-only'], for: id }, str(opts.label)),
      dom.h('div', { class: 'search-field__box' },
        icons.icon('search', { extraClass: 'search-field__icon' }),
        inputEl,
        clearBtn),
      opts.resultsText ? dom.h('div', { class: 'search-field__results', id: resultsId, 'data-testid': opts.resultsTestid || null }, str(opts.resultsText)) : null);
    el.control = inputEl;
    return el;
  }

  /* ── Entity link / status / metric ───────────────────────────────────── */

  /* entityLink({ entity, typeLabel, icon, relationLabel?, onOpen, versionId?, testid?, badge? }) */
  function entityLink(options) {
    var opts = options || {};
    var entity = opts.entity || {};
    var name = str(opts.label || entity.name || entity.label || entity.id);
    var typeLabel = str(opts.typeLabel);
    var iconSpec = opts.icon || entity.type || null;
    var iconEl = iconSpec ? (dom.isNode(iconSpec) ? iconSpec : icons.icon(String(iconSpec), { label: typeLabel || null })) : null;
    if (iconEl) iconEl.classList.add('entity-link__icon');
    var el = dom.h('button', {
      type: 'button',
      class: ['entity-link', opts.compact ? 'entity-link--compact' : null, opts.selected ? 'is-selected' : null, opts.extraClass || null],
      'data-entity-id': entity.id || null,
      'data-version-id': opts.versionId || null,
      'data-testid': opts.testid || (entity.id ? 'inspector-link-' + entity.id : null),
      'data-focus-key': opts.focusKey || null,
      'aria-current': opts.selected ? 'true' : null,
      'aria-describedby': opts.describedBy || null,
      title: opts.title || null,
      on: { click: function (event) { if (typeof opts.onOpen === 'function') opts.onOpen(entity, event); } }
    },
    iconEl,
    dom.h('span', { class: 'entity-link__text' },
      dom.h('span', { class: 'entity-link__name' }, name),
      typeLabel && opts.showType ? dom.h('span', { class: 'entity-link__type' }, typeLabel) : null,
      opts.relationLabel ? dom.h('span', { class: 'entity-link__relation' }, str(opts.relationLabel)) : null,
      opts.meta ? dom.h('span', { class: 'entity-link__meta' }, str(opts.meta)) : null),
    opts.badge ? (dom.isNode(opts.badge) ? opts.badge : atoms.badge(typeof opts.badge === 'string' ? { label: opts.badge } : opts.badge)) : null,
    icons.icon('chevronRight', { extraClass: 'entity-link__chevron' }));
    if (opts.attrs) dom.setAttrs(el, opts.attrs, false);
    return el;
  }

  function statusLabel(options) {
    var opts = options || {};
    var tone = atoms.TONES.indexOf(opts.tone) !== -1 ? opts.tone : 'neutral';
    var iconSpec = opts.icon === false ? null : opts.icon || null;
    var el = dom.h('span', { class: ['status-label', 'status-label--' + tone, opts.extraClass || null] },
      iconSpec ? atoms.iconNode(iconSpec, 'status-label__icon') : dom.h('span', { class: 'status-label__mark', 'aria-hidden': 'true' }),
      dom.h('span', { class: 'status-label__text' }, str(opts.label)));
    return applyExtras(el, opts);
  }

  /* metric({ label, value, unit?, date?, target?, missingText }) — null value → missingText. */
  function metric(options) {
    var opts = options || {};
    var missing = opts.value === null || opts.value === undefined || opts.value === '';
    var metaParts = [];
    if (opts.date) metaParts.push(dom.h('span', { class: 'metric__date' }, str(opts.date)));
    if (opts.target) metaParts.push(dom.h('span', { class: 'metric__target' }, str(opts.target)));
    var meta = [];
    metaParts.forEach(function (node, i) {
      if (i > 0) meta.push(dom.h('span', { class: 'metric__sep', 'aria-hidden': 'true' }, ' · '));
      meta.push(node);
    });
    var el = dom.h('div', { class: ['metric', missing ? 'metric--missing' : null, opts.proposed ? 'metric--proposed' : null, opts.extraClass || null] },
      dom.h('span', { class: 'metric__label' }, str(opts.label)),
      dom.h('span', { class: 'metric__reading' },
        dom.h('span', { class: ['metric__value', missing ? null : 'mono'] }, missing ? str(opts.missingText) : str(opts.value)),
        !missing && opts.unit ? dom.h('span', { class: 'metric__unit' }, ' ' + str(opts.unit)) : null),
      meta.length ? dom.h.apply(null, ['span', { class: 'metric__meta' }].concat(meta)) : null);
    return applyExtras(el, opts);
  }

  /* ── Table ───────────────────────────────────────────────────────────── */

  function cellContent(cell) {
    if (cell === null || cell === undefined) return '';
    if (dom.isNode(cell)) return cell;
    if (typeof cell === 'object') {
      if (cell.node !== undefined && cell.node !== null) return cell.node;
      return str(cell.text);
    }
    return str(cell);
  }

  /* table({ id, caption, columns, rows, sort, onSort, emptyText, cardMode?, actionsColumn?, dense? }) */
  function table(options) {
    var opts = options || {};
    var id = str(opts.id) || atoms.nextId('table');
    var captionId = id + '-caption';
    var columns = Array.isArray(opts.columns) ? opts.columns : [];
    var rows = Array.isArray(opts.rows) ? opts.rows : [];
    var sort = opts.sort || null;
    var actionsColumn = opts.actionsColumn || null;
    var colCount = columns.length + (actionsColumn ? 1 : 0);

    var ths = columns.map(function (col) {
      var sorted = sort && sort.column === col.id;
      var direction = sorted ? (sort.direction === 'desc' ? 'descending' : 'ascending') : null;
      var content;
      if (col.sortable) {
        var nextDirection = sorted && sort.direction !== 'desc' ? 'desc' : 'asc';
        content = dom.h('button', {
          type: 'button',
          class: ['table__sort', sorted ? 'is-sorted' : null],
          'data-testid': col.testid || null,
          'data-focus-key': 'sort:' + id + ':' + col.id,
          title: text('sortBy', { column: str(col.label) }),
          on: { click: function (event) { if (typeof opts.onSort === 'function') opts.onSort(col.id, nextDirection, event); } }
        },
        dom.h('span', { class: 'table__sort-label' }, str(col.label)),
        icons.icon(sorted ? (sort.direction === 'desc' ? 'sortDesc' : 'sortAsc') : 'sort', { extraClass: 'table__sort-icon' }),
        dom.h('span', { class: 'sr-only' }, ' ' + (sorted ? (sort.direction === 'desc' ? text('sortDescending') : text('sortAscending')) : '')));
      } else {
        content = str(col.label);
      }
      return dom.h('th', {
        scope: 'col',
        class: [col.width ? 'table__col--' + col.width : null, col.align === 'end' ? 'table__cell--end' : null],
        'aria-sort': col.sortable ? (direction || 'none') : null,
        'data-column': col.id
      }, content);
    });
    if (actionsColumn) {
      ths.push(dom.h('th', { scope: 'col', class: 'table__actions-head' },
        actionsColumn.label ? str(actionsColumn.label) : dom.h('span', { class: 'sr-only' }, text('actions'))));
    }

    var trs;
    if (!rows.length) {
      trs = [dom.h('tr', { class: 'table__empty' },
        dom.h('td', { colspan: String(colCount || 1) }, str(opts.emptyText)))];
    } else {
      trs = rows.map(function (row, rowIndex) {
        var key = row.key === undefined || row.key === null ? String(rowIndex) : String(row.key);
        var cells = (row.cells || []).map(function (cell, i) {
          var col = columns[i] || {};
          var content = cellContent(cell);
          var isSelector = i === 0 && typeof row.onSelect === 'function';
          if (isSelector) {
            content = dom.h('button', {
              type: 'button',
              class: 'table__select',
              'aria-current': row.selected ? 'true' : null,
              'data-testid': row.testid || null,
              'data-focus-key': row.focusKey || ('row:' + id + ':' + key),
              on: { click: function (event) { row.onSelect(row, event); } }
            }, content);
          }
          var tag = i === 0 && (col.rowHeader || opts.rowHeaders) ? 'th' : 'td';
          return dom.h(tag, {
            scope: tag === 'th' ? 'row' : null,
            class: [cell && cell.className ? cell.className : null, col.align === 'end' ? 'table__cell--end' : null, cell && cell.mono ? 'mono' : null],
            'data-label': str(col.label)
          }, content);
        });
        if (actionsColumn) {
          var actionsNode = typeof actionsColumn.render === 'function' ? actionsColumn.render(row) : row.actions || null;
          cells.push(dom.h('td', { class: 'table__actions', 'data-label': str(actionsColumn.label || text('actions')) }, actionsNode));
        }
        return dom.h.apply(null, ['tr', {
          class: [row.selected ? 'is-selected' : null, row.className || null, row.isDemo ? 'is-demo' : null],
          'data-key': key,
          'data-entity-id': row.entityId || null,
          'data-testid': row.onSelect ? null : (row.testid || null)
        }].concat(cells));
      });
    }

    var tableEl = dom.h('table', {
      class: ['table', opts.cardMode ? 'table--cards' : null, opts.dense ? 'table--dense' : null, opts.extraClass || null],
      id: id
    },
    dom.h('caption', { class: ['table__caption', opts.captionHidden ? 'sr-only' : null], id: captionId }, str(opts.caption)),
    dom.h('thead', null, dom.h.apply(null, ['tr', null].concat(ths))),
    dom.h.apply(null, ['tbody', null].concat(trs)));

    var el = dom.h('div', {
      class: ['table-wrap', opts.wrapClass || null],
      role: 'region',
      'aria-labelledby': captionId,
      tabindex: '0',
      'data-testid': opts.testid || null
    }, tableEl);
    el.table = tableEl;
    return el;
  }

  /* ── Disclosure ──────────────────────────────────────────────────────── */

  /* disclosure({ id, summary, content, open?, onToggle? }) — controlled when onToggle is given. */
  function disclosure(options) {
    var opts = options || {};
    var id = str(opts.id) || atoms.nextId('disclosure');
    var open = !!opts.open;
    var controlled = typeof opts.onToggle === 'function';
    var contentId = id + '-content';
    var buttonId = id + '-button';
    var content = dom.h('div', { class: 'disclosure__content', id: contentId, role: 'region', 'aria-labelledby': buttonId, hidden: !open }, opts.content);
    var btn = dom.h('button', {
      type: 'button',
      class: 'disclosure__summary',
      id: buttonId,
      'aria-expanded': bool(open),
      'aria-controls': contentId,
      'data-testid': opts.testid || null,
      'data-focus-key': opts.focusKey || ('disclosure:' + id),
      on: {
        click: function (event) {
          var next = btn.getAttribute('aria-expanded') !== 'true';
          if (controlled) {
            opts.onToggle(next, event);
            return;
          }
          btn.setAttribute('aria-expanded', bool(next));
          content.hidden = !next;
          el.classList.toggle('is-open', next);
        }
      }
    },
    icons.icon('chevronRight', { extraClass: 'disclosure__chevron' }),
    dom.h('span', { class: 'disclosure__label' }, opts.summary),
    opts.meta ? dom.h('span', { class: 'disclosure__meta' }, opts.meta) : null);
    var el = dom.h('div', { class: ['disclosure', open ? 'is-open' : null, opts.extraClass || null], id: id },
      dom.h('div', { class: 'disclosure__header' }, btn, opts.aside || null),
      content);
    if (opts.attrs) dom.setAttrs(el, opts.attrs, false);
    return el;
  }

  /* ── Modal / confirm ─────────────────────────────────────────────────── */

  function docOrNull() {
    return typeof document === 'undefined' ? null : document;
  }

  function overlaysRoot() {
    var d = docOrNull();
    if (!d) return null;
    var root = d.getElementById(OVERLAYS_ID);
    if (!root) {
      root = d.createElement('div');
      root.id = OVERLAYS_ID;
      (d.body || d.documentElement).appendChild(root);
    }
    return root;
  }

  /* Marks everything except the overlays (and the live region) inert; returns a restore fn. */
  function inertBackground() {
    var d = docOrNull();
    if (!d) return function () {};
    var changed = [];
    var app = d.getElementById(APP_ID);
    var siblings = [];
    if (app) {
      Array.prototype.forEach.call(app.children, function (child) { siblings.push(child); });
      if (d.body) Array.prototype.forEach.call(d.body.children, function (child) { if (child !== app && child.tagName !== 'SCRIPT') siblings.push(child); });
    } else if (d.body) {
      Array.prototype.forEach.call(d.body.children, function (child) { siblings.push(child); });
    }
    siblings.forEach(function (node) {
      if (node.id === OVERLAYS_ID || node.id === LIVE_ID || node.tagName === 'SCRIPT') return;
      if (node.hasAttribute('inert')) return;
      node.setAttribute('inert', '');
      changed.push(node);
    });
    return function restore() {
      changed.forEach(function (node) { node.removeAttribute('inert'); });
    };
  }

  /* modal({ id, title, body, actions, onClose, size?, describedBy?, testid? }) → { el, open(), close(), isOpen() } */
  function modal(options) {
    var opts = options || {};
    var id = str(opts.id) || atoms.nextId('modal');
    var titleId = id + '-title';
    var bodyId = id + '-body';
    var size = opts.size === 'sm' || opts.size === 'lg' || opts.size === 'sheet' ? opts.size : 'md';
    var api = { el: null, open: open, close: close, isOpen: isOpen };
    var state = { open: false, release: null, restoreInert: null, returnFocus: null };

    var closeBtn = atoms.iconButton({
      icon: 'close',
      ariaLabel: opts.closeLabel || text('close'),
      onClick: function () { close('close-button'); },
      testid: opts.closeTestid || (id + '-close'),
      extraClass: 'modal__close'
    });

    var actionButtons = (Array.isArray(opts.actions) ? opts.actions : []).map(function (action) {
      return atoms.button({
        label: action.label,
        variant: action.variant || 'secondary',
        icon: action.icon,
        disabled: action.disabled,
        disabledReason: action.disabledReason,
        busy: action.busy,
        testid: action.testid,
        type: action.type,
        onClick: function (event) { if (typeof action.onClick === 'function') action.onClick(event, api); }
      });
    });

    var dialog = dom.h('div', {
      class: ['modal', 'modal--' + size, opts.extraClass || null],
      role: opts.role === 'alertdialog' ? 'alertdialog' : 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': opts.describedBy || bodyId,
      tabindex: '-1',
      id: id,
      'data-testid': opts.testid || null
    },
    dom.h('div', { class: 'modal__header' },
      dom.h('div', { class: 'modal__heading' },
        opts.eyebrow ? dom.h('span', { class: 'eyebrow modal__eyebrow' }, str(opts.eyebrow)) : null,
        dom.h('h2', { class: 'modal__title', id: titleId }, str(opts.title))),
      opts.hideClose ? null : closeBtn),
    dom.h('div', { class: 'modal__body', id: bodyId }, opts.body),
    actionButtons.length ? dom.h.apply(null, ['div', { class: 'modal__actions' }].concat(actionButtons)) : null);

    var el = dom.h('div', { class: ['modal-backdrop', 'modal-backdrop--' + size], 'data-modal-id': id }, dialog);
    api.el = el;
    api.dialog = dialog;

    function onKeydown(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        event.stopPropagation();
        close('escape');
      }
    }

    function initialFocus() {
      var body = dialog.querySelector('.modal__body');
      var target = (opts.initialFocus && dialog.querySelector(opts.initialFocus)) ||
        (body && dom.focusables(body)[0]) ||
        dom.focusables(dialog).filter(function (n) { return n !== closeBtn; })[0] ||
        closeBtn;
      try { target.focus({ preventScroll: true }); } catch (e) { try { target.focus(); } catch (e2) { /* no focus */ } }
      if (docOrNull() && document.activeElement !== target) { try { dialog.focus(); } catch (e3) { /* ignore */ } }
    }

    function open() {
      if (state.open) return api;
      var root = overlaysRoot();
      if (!root) return api;
      state.open = true;
      state.returnFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
      root.appendChild(el);
      state.restoreInert = inertBackground();
      state.release = dom.trapFocus(dialog);
      dialog.addEventListener('keydown', onKeydown);
      el.classList.add('is-open');
      initialFocus();
      if (typeof opts.onOpen === 'function') opts.onOpen(api);
      return api;
    }

    function close(reason) {
      if (!state.open) return api;
      state.open = false;
      dialog.removeEventListener('keydown', onKeydown);
      if (state.release) { state.release(); state.release = null; }
      if (state.restoreInert) { state.restoreInert(); state.restoreInert = null; }
      if (el.parentNode) el.parentNode.removeChild(el);
      var target = state.returnFocus;
      state.returnFocus = null;
      var d = docOrNull();
      if (target && d && d.contains(target) && !target.closest('[hidden]')) {
        try { target.focus({ preventScroll: true }); } catch (e) { try { target.focus(); } catch (e2) { /* ignore */ } }
      } else if (d) {
        var main = d.getElementById('primus-main');
        if (main && !dom.focusFirst(main)) { try { main.focus(); } catch (e3) { /* ignore */ } }
      }
      if (typeof opts.onClose === 'function') opts.onClose(reason || 'close', api);
      return api;
    }

    function isOpen() {
      return state.open;
    }

    return api;
  }

  /* confirm({ title, text, confirmLabel, cancelLabel, danger?, onConfirm, onCancel }) — opens immediately. */
  function confirm(options) {
    var opts = options || {};
    var decided = false;
    var api = modal({
      id: opts.id,
      testid: opts.testid,
      title: opts.title,
      size: opts.size || 'sm',
      role: 'alertdialog',
      eyebrow: opts.eyebrow,
      body: dom.h('p', { class: 'modal__text' }, str(opts.text)),
      closeLabel: opts.closeLabel,
      closeTestid: opts.closeTestid,
      initialFocus: opts.focusConfirm ? '[data-modal-role="confirm"]' : '[data-modal-role="cancel"]',
      actions: [
        { label: opts.cancelLabel, variant: 'secondary', testid: opts.cancelTestid,
          onClick: function () { decided = true; api.close('cancel'); if (typeof opts.onCancel === 'function') opts.onCancel(); } },
        { label: opts.confirmLabel, variant: opts.danger ? 'danger' : 'primary', testid: opts.confirmTestid,
          onClick: function () { decided = true; api.close('confirm'); if (typeof opts.onConfirm === 'function') opts.onConfirm(); } }
      ],
      onClose: function (reason) {
        if (!decided && typeof opts.onCancel === 'function') opts.onCancel(reason);
        if (typeof opts.onClose === 'function') opts.onClose(reason);
      }
    });
    var actionEls = api.dialog.querySelectorAll('.modal__actions .btn');
    if (actionEls[0]) actionEls[0].setAttribute('data-modal-role', 'cancel');
    if (actionEls[1]) actionEls[1].setAttribute('data-modal-role', 'confirm');
    if (opts.open !== false) api.open();
    return api;
  }

  /* ── Toasts / notices / empty state ──────────────────────────────────── */

  /* toasts({ toasts: [{ id, text, tone }], onDismiss }) → <ul class="toast-list"> (mount inside #primus-toasts). */
  function toasts(options) {
    var opts = options || {};
    var items = (Array.isArray(opts.toasts) ? opts.toasts : []).map(function (toast) {
      var tone = atoms.TONES.indexOf(toast.tone) !== -1 ? toast.tone : 'info';
      var iconName = { success: 'check', warning: 'warning', danger: 'error', info: 'info' }[tone] || 'info';
      return dom.h('li', {
        class: ['toast', 'toast--' + tone],
        role: tone === 'danger' ? 'alert' : 'status',
        'data-toast-id': toast.id,
        'data-testid': 'toast'
      },
      icons.icon(iconName, { extraClass: 'toast__icon' }),
      dom.h('span', { class: 'toast__text' }, str(toast.text)),
      typeof opts.onDismiss === 'function' ? atoms.iconButton({
        icon: 'close', ariaLabel: opts.dismissLabel || text('closeNotice'), size: 'sm', extraClass: 'toast__dismiss',
        testid: 'toast-dismiss',
        onClick: function () { opts.onDismiss(toast.id); }
      }) : null);
    });
    return dom.h.apply(null, ['ul', { class: ['toast-list', opts.extraClass || null] }].concat(items));
  }

  function emptyState(options) {
    var opts = options || {};
    var el = dom.h('div', { class: ['empty-state', opts.compact ? 'empty-state--compact' : null, opts.extraClass || null] },
      opts.icon === false ? null : icons.icon(opts.icon || 'info', { extraClass: 'empty-state__icon' }),
      dom.h('p', { class: 'empty-state__text' }, str(opts.text)),
      opts.detail ? dom.h('p', { class: 'empty-state__detail muted' }, str(opts.detail)) : null,
      opts.action ? atoms.button({
        label: opts.action.label, variant: opts.action.variant || 'secondary', size: 'md', icon: opts.action.icon,
        testid: opts.action.testid, onClick: opts.action.onClick, extraClass: 'empty-state__action'
      }) : null);
    return applyExtras(el, opts);
  }

  function notice(options) {
    var opts = options || {};
    var tone = atoms.TONES.indexOf(opts.tone) !== -1 ? opts.tone : 'info';
    var iconName = opts.icon || { success: 'check', warning: 'warning', danger: 'error', info: 'info', brand: 'info', neutral: 'info', demo: 'flag', proposed: 'edit' }[tone] || 'info';
    var el = dom.h('div', {
      class: ['notice', 'notice--' + tone, opts.extraClass || null],
      role: opts.role || (tone === 'danger' ? 'alert' : 'status')
    },
    icons.icon(iconName, { extraClass: 'notice__icon' }),
    dom.h('div', { class: 'notice__body' },
      opts.title ? dom.h('p', { class: 'notice__title' }, str(opts.title)) : null,
      dom.h('p', { class: 'notice__text' }, opts.text),
      opts.action ? atoms.button({
        label: opts.action.label, variant: opts.action.variant || 'secondary', size: 'sm', testid: opts.action.testid,
        onClick: opts.action.onClick, extraClass: 'notice__action'
      }) : null),
    typeof opts.onDismiss === 'function' ? atoms.iconButton({
      icon: 'close', ariaLabel: opts.dismissLabel || text('closeNotice'), size: 'sm', extraClass: 'notice__dismiss',
      testid: opts.dismissTestid, onClick: opts.onDismiss
    }) : null);
    return applyExtras(el, opts);
  }

  /* ── List / key-value ────────────────────────────────────────────────── */

  function list(options) {
    var opts = options || {};
    var items = (Array.isArray(opts.items) ? opts.items : []).map(function (item, index) {
      return dom.h('li', { class: ['list__item', item.className || null], 'data-key': item.key === undefined ? String(index) : String(item.key) }, item.node);
    });
    var el = dom.h.apply(null, [opts.ordered ? 'ol' : 'ul', {
      class: ['list', opts.plain ? 'list--plain' : null, opts.inline ? 'list--inline' : null, opts.extraClass || null],
      'aria-label': opts.ariaLabel || null,
      'aria-labelledby': opts.labelledBy || null
    }].concat(items));
    return applyExtras(el, opts);
  }

  function keyValue(options) {
    var opts = options || {};
    var rows = (Array.isArray(opts.rows) ? opts.rows : []).map(function (row) {
      var value = row.value;
      var missing = value === null || value === undefined || value === '';
      return dom.h('div', { class: ['key-value__row', missing ? 'is-missing' : null, row.className || null] },
        dom.h('dt', { class: 'key-value__label' }, str(row.label)),
        dom.h('dd', { class: ['key-value__value', row.mono ? 'mono' : null] }, missing ? str(opts.missingText) : value));
    });
    var el = dom.h.apply(null, ['dl', { class: ['key-value', opts.inline ? 'key-value--inline' : null, opts.extraClass || null] }].concat(rows));
    return applyExtras(el, opts);
  }

  return {
    tabs: tabs,
    breadcrumbs: breadcrumbs,
    searchField: searchField,
    entityLink: entityLink,
    statusLabel: statusLabel,
    metric: metric,
    table: table,
    disclosure: disclosure,
    modal: modal,
    confirm: confirm,
    toasts: toasts,
    emptyState: emptyState,
    notice: notice,
    list: list,
    keyValue: keyValue,
    setTexts: atoms.setTexts,
    OVERLAYS_ID: OVERLAYS_ID,
    TOASTS_ID: TOASTS_ID
  };
});
