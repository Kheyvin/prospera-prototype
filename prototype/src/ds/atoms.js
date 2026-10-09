/* ds/atoms — atoms of the PRENTER portable bank (CONTRACTS §8).
 *
 * Every factory returns a DOM element built with core/dom (no innerHTML, no store access)
 * and accepts a plain options object with the exact names of CONTRACTS §8. Nothing here
 * touches `document` at factory time, so the module loads in Node.
 *
 * Generic chrome strings the atoms need (close, remove, sources…) have Spanish defaults
 * that match `pack.presentation.ui`; main.js may override them once with
 * atoms.setTexts(pack.presentation.ui) so the whole bank stays data-driven. */
Primus.module('ds/atoms', function (require) {
  'use strict';

  var dom = require('core/dom');
  var icons = require('ds/icons');

  var VARIANTS = { primary: true, secondary: true, ghost: true, danger: true };
  var SIZES = { sm: true, md: true, lg: true };
  var TONES = { neutral: true, brand: true, success: true, warning: true, danger: true, proposed: true, demo: true, info: true };

  /* Automatic glyph per tone so status is never colour-only (design.md §3). */
  var TONE_ICONS = { success: 'check', warning: 'warning', danger: 'error', demo: 'flag', proposed: 'edit', info: 'info' };

  /* Generic chrome labels; keys mirror pack.presentation.ui where one exists. */
  var TEXTS = {
    close: 'Cerrar',
    remove: 'Quitar',
    clearSearch: 'Limpiar búsqueda',
    sources: 'Fuentes',
    viewSources: 'Ver fuentes',
    required: 'Obligatorio',
    optional: 'Opcional',
    sortAscending: 'Orden ascendente',
    sortDescending: 'Orden descendente',
    sortBy: 'Ordenar por {column}',
    expand: 'Expandir',
    collapse: 'Contraer',
    actions: 'Acciones',
    notices: 'Avisos',
    closeNotice: 'Cerrar aviso',
    breadcrumbs: 'Ruta de navegación',
    menu: 'Menú',
    select: 'Seleccionar'
  };

  var uid = 0;

  function nextId(prefix) {
    return (prefix || 'ds') + '-' + (++uid);
  }

  function setTexts(map) {
    if (!map || typeof map !== 'object') return TEXTS;
    Object.keys(TEXTS).forEach(function (key) {
      if (typeof map[key] === 'string' && map[key]) TEXTS[key] = map[key];
    });
    return TEXTS;
  }

  function text(key, params) {
    var value = TEXTS[key] || key;
    if (!params) return value;
    return value.replace(/\{([A-Za-z0-9_]+)\}/g, function (m, name) {
      return params[name] === undefined || params[name] === null ? m : String(params[name]);
    });
  }

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function isNode(value) {
    return dom.isNode(value);
  }

  /* Accepts an icon name, a Node or null. */
  function iconNode(spec, extraClass) {
    if (!spec && spec !== 0) return null;
    if (isNode(spec)) {
      if (extraClass) spec.classList.add(extraClass);
      return spec;
    }
    return icons.icon(String(spec), { extraClass: extraClass || null });
  }

  function applyExtras(el, opts) {
    if (!el || !opts) return el;
    if (opts.testid) el.setAttribute('data-testid', String(opts.testid));
    if (opts.focusKey) el.setAttribute('data-focus-key', String(opts.focusKey));
    if (opts.attrs && typeof opts.attrs === 'object') dom.setAttrs(el, opts.attrs, false);
    return el;
  }

  function bool(value) {
    return value ? 'true' : 'false';
  }

  /* ── Button ──────────────────────────────────────────────────────────── */

  function button(options) {
    var opts = options || {};
    var variant = VARIANTS[opts.variant] ? opts.variant : 'secondary';
    var size = SIZES[opts.size] ? opts.size : 'md';
    var label = str(opts.label);
    var iconOnly = !!opts.iconOnly;
    var ariaLabel = str(opts.ariaLabel) || (iconOnly ? label : '');
    if (iconOnly && !ariaLabel) {
      throw new Error('atoms.button: iconOnly requires ariaLabel (or a label used as the accessible name)');
    }
    var disabled = !!opts.disabled;
    var busy = !!opts.busy;
    var reason = str(opts.disabledReason);
    var reasonId = reason ? nextId('btn-reason') : null;

    var attrs = {
      type: opts.type || 'button',
      class: ['btn', 'btn--' + variant, 'btn--' + size, iconOnly ? 'btn--icon-only' : null,
        disabled ? 'is-disabled' : null, busy ? 'is-busy' : null, opts.pressed ? 'is-pressed' : null, opts.extraClass || null],
      id: opts.id || null,
      'aria-disabled': disabled || busy ? 'true' : null,
      'aria-busy': busy ? 'true' : null,
      'aria-label': iconOnly ? ariaLabel : (str(opts.ariaLabel) || null),
      'aria-pressed': opts.pressed === undefined || opts.pressed === null ? null : bool(opts.pressed),
      'aria-expanded': opts.expanded === undefined || opts.expanded === null ? null : bool(opts.expanded),
      'aria-controls': opts.controls || null,
      'aria-describedby': reasonId,
      'aria-haspopup': opts.haspopup || null,
      title: !iconOnly && disabled && reason ? reason : (iconOnly && opts.title !== false ? ariaLabel : (opts.title || null)),
      name: opts.name || null,
      value: opts.value === undefined ? null : opts.value,
      on: {
        click: function (event) {
          if (disabled || busy) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          if (typeof opts.onClick === 'function') opts.onClick(event);
        }
      }
    };

    var children = [];
    if (busy) {
      children.push(icons.icon('spinner', { extraClass: 'btn__icon btn__spinner' }));
    } else if (opts.icon) {
      children.push(iconNode(opts.icon, 'btn__icon'));
    }
    if (!iconOnly && label) children.push(dom.h('span', { class: 'btn__label' }, label));
    if (iconOnly && !opts.icon && !busy) children.push(dom.h('span', { class: 'btn__label' }, label));

    var el = dom.h.apply(null, ['button', attrs].concat(children));
    applyExtras(el, opts);

    if (reason) {
      var wrap = dom.h('span', { class: ['btn-wrap', opts.wrapClass || null] },
        el,
        dom.h('span', { class: 'btn__reason', id: reasonId }, reason));
      wrap.control = el;
      return wrap;
    }
    return el;
  }

  function iconButton(options) {
    var opts = options || {};
    return button({
      label: opts.ariaLabel,
      ariaLabel: opts.ariaLabel,
      icon: opts.icon,
      iconOnly: true,
      variant: opts.variant || 'ghost',
      size: opts.size || 'md',
      onClick: opts.onClick,
      pressed: opts.pressed,
      expanded: opts.expanded,
      controls: opts.controls,
      disabled: opts.disabled,
      disabledReason: opts.disabledReason,
      busy: opts.busy,
      testid: opts.testid,
      focusKey: opts.focusKey,
      id: opts.id,
      type: opts.type,
      title: opts.title,
      extraClass: ['icon-btn', opts.extraClass || null],
      attrs: opts.attrs
    });
  }

  /* ── Badge / chip ────────────────────────────────────────────────────── */

  function badge(options) {
    var opts = options || {};
    var tone = TONES[opts.tone] ? opts.tone : 'neutral';
    var iconSpec = opts.icon === false ? null : (opts.icon || TONE_ICONS[tone] || null);
    var el = dom.h('span', { class: ['badge', 'badge--' + tone, opts.extraClass || null] },
      iconSpec ? iconNode(iconSpec, 'badge__icon') : null,
      dom.h('span', { class: 'badge__label' }, str(opts.label)));
    return applyExtras(el, opts);
  }

  function chip(options) {
    var opts = options || {};
    var label = str(opts.label);
    var selected = !!opts.selected;
    var interactive = typeof opts.onClick === 'function';
    var removable = typeof opts.onRemove === 'function';
    var content = [
      opts.icon ? iconNode(opts.icon, 'chip__icon') : null,
      dom.h('span', { class: 'chip__label' }, label)
    ];
    var el;
    if (interactive && !removable) {
      el = dom.h.apply(null, ['button', {
        type: 'button',
        class: ['chip', 'chip--interactive', selected ? 'is-selected' : null, opts.extraClass || null],
        'aria-pressed': bool(selected),
        on: { click: function (event) { opts.onClick(event); } }
      }].concat(content));
      return applyExtras(el, opts);
    }
    var main = interactive
      ? dom.h.apply(null, ['button', {
        type: 'button', class: 'chip__main', 'aria-pressed': bool(selected),
        on: { click: function (event) { opts.onClick(event); } }
      }].concat(content))
      : dom.h.apply(null, ['span', { class: 'chip__main' }].concat(content));
    el = dom.h('span', {
      class: ['chip', interactive ? 'chip--interactive' : null, removable ? 'chip--removable' : null,
        selected ? 'is-selected' : null, opts.extraClass || null]
    }, main,
    removable ? button({
      icon: 'close', iconOnly: true, ariaLabel: (opts.removeLabel || text('remove')) + ' ' + label,
      variant: 'ghost', size: 'sm', extraClass: 'chip__remove', testid: opts.removeTestid,
      onClick: function (event) { opts.onRemove(event); }
    }) : null);
    return applyExtras(el, opts);
  }

  /* ── Card ────────────────────────────────────────────────────────────── */

  function headingTag(level) {
    var n = parseInt(level, 10);
    if (!n || n < 1 || n > 6) n = 3;
    return 'h' + n;
  }

  function card(options) {
    var opts = options || {};
    var tag = opts.as === 'article' || opts.as === 'div' || opts.as === 'section' ? opts.as : 'section';
    var titleId = opts.title ? (opts.id ? opts.id + '-title' : nextId('card-title')) : null;
    var header = null;
    if (opts.title || opts.subtitle || opts.eyebrow) {
      header = dom.h('div', { class: 'card__header' },
        opts.eyebrow ? dom.h('span', { class: 'eyebrow card__eyebrow' }, str(opts.eyebrow)) : null,
        opts.title ? dom.h(headingTag(opts.headingLevel), { class: 'card__title', id: titleId }, opts.title) : null,
        opts.subtitle ? dom.h('p', { class: 'card__subtitle' }, opts.subtitle) : null);
    }
    var el = dom.h(tag, {
      class: ['card', opts.quiet ? 'card--quiet' : null, opts.raised ? 'card--raised' : null,
        opts.selected ? 'is-selected' : null, opts.extraClass || null],
      id: opts.id || null,
      'aria-labelledby': tag === 'div' ? null : titleId,
      'aria-current': opts.selected && opts.current ? 'true' : null
    },
    header,
    dom.h('div', { class: 'card__body' }, opts.children),
    opts.actions ? dom.h('div', { class: 'card__actions cluster' }, opts.actions) : null);
    return applyExtras(el, opts);
  }

  /* ── Form controls ───────────────────────────────────────────────────── */

  function findControl(control, id) {
    if (!control) return null;
    if (isNode(control)) {
      if (control.id === id || !control.querySelector) return control;
      return control.querySelector('[id="' + String(id).replace(/"/g, '\\"') + '"]') || control;
    }
    return null;
  }

  function appendDescribedBy(el, id) {
    if (!el || !id) return;
    var current = el.getAttribute('aria-describedby');
    var parts = current ? current.split(/\s+/) : [];
    if (parts.indexOf(id) === -1) parts.push(id);
    el.setAttribute('aria-describedby', parts.join(' '));
  }

  /* field({ id, label, hint?, error?, required?, control }) */
  function field(options) {
    var opts = options || {};
    var id = str(opts.id) || nextId('field');
    var hintId = opts.hint ? id + '-hint' : null;
    var errorId = opts.error ? id + '-error' : null;
    var control = opts.control;
    var controlEl = findControl(control, id);
    if (controlEl && controlEl.setAttribute) {
      if (hintId) appendDescribedBy(controlEl, hintId);
      if (errorId) {
        appendDescribedBy(controlEl, errorId);
        controlEl.setAttribute('aria-invalid', 'true');
      } else {
        controlEl.removeAttribute('aria-invalid');
      }
      if (opts.required) controlEl.setAttribute('aria-required', 'true');
      if (!controlEl.id) controlEl.id = id;
    }
    var el = dom.h('div', {
      class: ['field', opts.error ? 'is-invalid' : null, opts.required ? 'is-required' : null,
        opts.inline ? 'field--inline' : null, opts.extraClass || null]
    },
    dom.h('label', { class: 'field__label', for: id },
      dom.h('span', { class: 'field__label-text' }, str(opts.label)),
      opts.required ? dom.h('span', { class: 'field__required' },
        dom.h('span', { 'aria-hidden': 'true' }, '*'),
        dom.h('span', { class: 'sr-only' }, ' ' + (opts.requiredText || text('required')))) : null,
      opts.optional ? dom.h('span', { class: 'field__optional muted' }, ' (' + (opts.optionalText || text('optional')) + ')') : null),
    hintId ? dom.h('div', { class: 'field__hint', id: hintId }, str(opts.hint)) : null,
    dom.h('div', { class: 'field__control' }, control),
    errorId ? dom.h('div', { class: 'field__error', id: errorId },
      icons.icon('error', { extraClass: 'field__error-icon' }),
      dom.h('span', { class: 'field__error-text' }, str(opts.error))) : null);
    return applyExtras(el, opts);
  }

  function input(options) {
    var opts = options || {};
    var el = dom.h('input', {
      class: ['input', opts.size === 'sm' ? 'input--sm' : null, opts.extraClass || null],
      id: opts.id || null,
      type: opts.type || 'text',
      value: opts.value === undefined || opts.value === null ? '' : opts.value,
      placeholder: opts.placeholder || null,
      maxlength: opts.maxlength === undefined || opts.maxlength === null ? null : opts.maxlength,
      minlength: opts.minlength === undefined || opts.minlength === null ? null : opts.minlength,
      min: opts.min === undefined || opts.min === null ? null : opts.min,
      max: opts.max === undefined || opts.max === null ? null : opts.max,
      pattern: opts.pattern || null,
      name: opts.name || null,
      autocomplete: opts.autocomplete || 'off',
      spellcheck: opts.spellcheck === undefined ? null : (opts.spellcheck ? 'true' : 'false'),
      inputmode: opts.inputmode || null,
      disabled: !!opts.disabled,
      readOnly: !!opts.readOnly,
      'aria-label': opts.ariaLabel || null,
      'aria-invalid': opts.invalid ? 'true' : null,
      on: {
        input: function (event) { if (typeof opts.onInput === 'function') opts.onInput(event.target.value, event); },
        change: function (event) { if (typeof opts.onChange === 'function') opts.onChange(event.target.value, event); },
        keydown: function (event) { if (typeof opts.onKeydown === 'function') opts.onKeydown(event); }
      }
    });
    return applyExtras(el, opts);
  }

  function textarea(options) {
    var opts = options || {};
    var el = dom.h('textarea', {
      class: ['textarea', opts.mono ? 'mono' : null, opts.extraClass || null],
      id: opts.id || null,
      rows: opts.rows || 4,
      maxlength: opts.maxlength === undefined || opts.maxlength === null ? null : opts.maxlength,
      placeholder: opts.placeholder || null,
      name: opts.name || null,
      disabled: !!opts.disabled,
      readOnly: !!opts.readOnly,
      'aria-label': opts.ariaLabel || null,
      'aria-invalid': opts.invalid ? 'true' : null,
      on: {
        input: function (event) { if (typeof opts.onInput === 'function') opts.onInput(event.target.value, event); },
        keydown: function (event) { if (typeof opts.onKeydown === 'function') opts.onKeydown(event); }
      }
    });
    el.value = opts.value === undefined || opts.value === null ? '' : String(opts.value);
    return applyExtras(el, opts);
  }

  function select(options) {
    var opts = options || {};
    var value = opts.value === undefined || opts.value === null ? '' : String(opts.value);
    var optionEls = (opts.options || []).map(function (o) {
      var v = o.value === undefined || o.value === null ? '' : String(o.value);
      return dom.h('option', { value: v, disabled: !!o.disabled, selected: v === value }, str(o.label));
    });
    var el = dom.h.apply(null, ['select', {
      class: ['select', opts.size === 'sm' ? 'select--sm' : null, opts.extraClass || null],
      id: opts.id || null,
      name: opts.name || null,
      disabled: !!opts.disabled,
      'aria-label': opts.ariaLabel || null,
      'aria-invalid': opts.invalid ? 'true' : null,
      on: {
        change: function (event) { if (typeof opts.onChange === 'function') opts.onChange(event.target.value, event); }
      }
    }].concat(optionEls));
    el.value = value;
    return applyExtras(el, opts);
  }

  function checkbox(options) {
    var opts = options || {};
    var id = opts.id || nextId('checkbox');
    var inputEl = dom.h('input', {
      type: 'checkbox',
      class: 'checkbox__input',
      id: id,
      name: opts.name || null,
      checked: !!opts.checked,
      disabled: !!opts.disabled,
      'aria-invalid': opts.invalid ? 'true' : null,
      'aria-describedby': opts.describedBy || null,
      on: {
        change: function (event) { if (typeof opts.onChange === 'function') opts.onChange(event.target.checked, event); }
      }
    });
    if (opts.testid) inputEl.setAttribute('data-testid', String(opts.testid));
    if (opts.focusKey) inputEl.setAttribute('data-focus-key', String(opts.focusKey));
    var el = dom.h('label', { class: ['checkbox', opts.extraClass || null], for: id },
      inputEl,
      dom.h('span', { class: 'checkbox__box', 'aria-hidden': 'true' }, icons.icon('check', { extraClass: 'checkbox__check' })),
      dom.h('span', { class: 'checkbox__label' }, str(opts.label)));
    if (opts.attrs) dom.setAttrs(el, opts.attrs, false);
    /* <label>.control is a read-only DOM getter; expose the input under another name. */
    el.controlEl = inputEl;
    return el;
  }

  /* ── Feedback atoms ──────────────────────────────────────────────────── */

  function spinner(options) {
    var opts = options || {};
    var el = dom.h('span', { class: ['spinner', opts.extraClass || null], role: 'status' },
      icons.icon('spinner', { extraClass: 'spinner__icon' }),
      dom.h('span', { class: opts.labelHidden ? 'sr-only' : 'spinner__label' }, str(opts.label)));
    return applyExtras(el, opts);
  }

  function divider(options) {
    var opts = options || {};
    return dom.h('hr', { class: ['divider', opts.extraClass || null] });
  }

  function kbd(value) {
    return dom.h('kbd', { class: 'kbd' }, str(value));
  }

  /* ── Provenance ──────────────────────────────────────────────────────── */

  /* Tone per exact spec label (§13). Unknown labels render neutral. */
  var LABEL_TONES = {
    'Fuente del cliente': 'brand',
    'Síntesis de las fuentes': 'neutral',
    'Relación por validar': 'warning',
    'Relación propuesta': 'proposed',
    'Propuesto · por validar': 'proposed',
    'Ejemplo de demostración': 'demo',
    'Sin dato proporcionado': 'neutral'
  };

  function labelTone(label) {
    return LABEL_TONES[label] || 'neutral';
  }

  function sourceText(source, id) {
    if (!source) return str(id);
    var parts = [str(source.id || id)];
    if (source.title) parts.push(str(source.title));
    var line = parts.join(' · ');
    if (source.section) line += ' (' + str(source.section) + ')';
    return line;
  }

  /* provenance({ labels, confidence, sourceIds, sources: Map, onOpenSources? }) */
  function provenance(options) {
    var opts = options || {};
    var labels = Array.isArray(opts.labels) ? opts.labels : [];
    var sourceIds = Array.isArray(opts.sourceIds) ? opts.sourceIds : [];
    var sources = opts.sources;
    function lookup(id) {
      if (!sources) return null;
      if (typeof sources.get === 'function') return sources.get(id) || null;
      return sources[id] || null;
    }
    var badges = labels.map(function (label) {
      return badge({ label: label, tone: labelTone(label) });
    });
    var items = sourceIds.map(function (id) {
      return dom.h('li', { class: 'provenance__source', 'data-source-id': id }, sourceText(lookup(id), id));
    });
    var sourcesLabel = opts.sourcesLabel || text('sources');
    var el = dom.h('div', {
      class: ['provenance', opts.confidence ? 'provenance--' + String(opts.confidence) : null,
        opts.dataState ? 'provenance--state-' + String(opts.dataState) : null, opts.extraClass || null],
      'data-confidence': opts.confidence || null
    },
    badges.length ? dom.h('div', { class: 'provenance__labels cluster cluster--sm' }, badges) : null,
    items.length ? dom.h('div', { class: 'provenance__sources' },
      dom.h('span', { class: 'provenance__sources-label' }, sourcesLabel + ':'),
      dom.h.apply(null, ['ul', { class: 'provenance__list' }].concat(items))) : null,
    typeof opts.onOpenSources === 'function' && items.length ? button({
      label: opts.openLabel || text('viewSources'), variant: 'ghost', size: 'sm', icon: 'document',
      onClick: opts.onOpenSources, testid: opts.openTestid, extraClass: 'provenance__open'
    }) : null);
    return applyExtras(el, opts);
  }

  return {
    button: button,
    iconButton: iconButton,
    badge: badge,
    chip: chip,
    card: card,
    field: field,
    input: input,
    textarea: textarea,
    select: select,
    checkbox: checkbox,
    spinner: spinner,
    divider: divider,
    kbd: kbd,
    provenance: provenance,
    labelTone: labelTone,
    iconNode: iconNode,
    setTexts: setTexts,
    text: text,
    nextId: nextId,
    applyExtras: applyExtras,
    VARIANTS: Object.keys(VARIANTS),
    SIZES: Object.keys(SIZES),
    TONES: Object.keys(TONES)
  };
});
