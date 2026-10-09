/* ds/icons — inline SVG icon registry (CONTRACTS §8).
 *
 * icon(name, { label?, size? }) returns an <svg class="icon icon--<name>"> built with
 * core/dom.svg (never innerHTML). Icons are 24 × 24 line glyphs with a 1.5 px stroke in
 * currentColor; decorative by default (aria-hidden) and, when a label is given, exposed as
 * role="img" with a <title>. Unknown names fall back to a neutral circle and mark the
 * element with data-icon-missing so the catalog and tests can spot the gap. No DOM work
 * happens at factory time. */
Primus.module('ds/icons', function (require) {
  'use strict';

  var dom = require('core/dom');

  var STROKE_WIDTH = 1.5;
  var DEFAULT_VIEWBOX = '0 0 24 24';

  /* Each entry is a path "d" string (several subpaths allowed) or an array of primitives
   * { tag, attrs }. Paths are drawn with fill none, stroke currentColor. */
  var ICONS = {
    /* ── Entity types (spec §13 glyph vocabulary) ── */
    organization: 'M4 21V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16M2 21h20M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M8.5 16h2M13.5 16h2M10 21v-3h4v3',
    building: 'M4 21V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16M2 21h20M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M8.5 16h2M13.5 16h2M10 21v-3h4v3',
    area: 'M9 11.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5zM2.5 20a6.5 6.5 0 0 1 13 0M16 5.4a3.25 3.25 0 0 1 0 6.1M21.5 20a6.5 6.5 0 0 0-4.5-6.2',
    macroprocess: 'M2.5 7h8.5l3.5 5-3.5 5H2.5l3.5-5zM13 7h4.5l4 5-4 5H13l3.5-5z',
    process: 'M3 6.5h11l5 5.5-5 5.5H3l4.5-5.5z',
    activity: 'M5.5 5.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM7.5 10h9M7.5 14h6',
    role: 'M3.5 5.5h17a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM8.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 16a3.5 3.5 0 0 1 7 0M14.5 9.5h4M14.5 13.5h3',
    position: 'M6.5 11V5.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2V11M3.5 11h17v4h-17zM6 15v5.5M18 15v5.5',
    person: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
    user: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
    external: 'M9.5 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 21a7 7 0 0 1 11.5-5.3M15 15.5h6.5M18.5 12.5l3 3-3 3',
    externalProvider: 'M9.5 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 21a7 7 0 0 1 11.5-5.3M15 15.5h6.5M18.5 12.5l3 3-3 3',
    externalActor: 'M9.5 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 21a7 7 0 0 1 11.5-5.3M15 15.5h6.5M18.5 12.5l3 3-3 3',
    system: 'M3.5 4.5h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1zM8.5 20h7M12 16.5V20',
    monitor: 'M3.5 4.5h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1zM8.5 20h7M12 16.5V20',
    document: 'M6 2.5h7.5l5 5v14H6zM13.5 2.5v5h5M9 13h6M9 17h6',
    policy: 'M12 2.5l8 3v6c0 4.8-3.4 8.6-8 10.5-4.6-1.9-8-5.7-8-10.5v-6zM9 12l2 2 4-4',
    shield: 'M12 2.5l8 3v6c0 4.8-3.4 8.6-8 10.5-4.6-1.9-8-5.7-8-10.5v-6z',
    objective: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    indicator: 'M3 16.5L16.5 3 21 7.5 7.5 21zM7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2',
    gap: 'M12 3.5l9.5 17h-19zM12 10v4.5M12 17.5h.01',
    warning: 'M12 3.5l9.5 17h-19zM12 10v4.5M12 17.5h.01',
    incident: 'M5 21.5V3.5M5 4h12.5l-2.5 4 2.5 4H5',
    flag: 'M5 21.5V3.5M5 4h12.5l-2.5 4 2.5 4H5',
    project: 'M3 6.5a1 1 0 0 1 1-1h5.5l2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    folder: 'M3 6.5a1 1 0 0 1 1-1h5.5l2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    version: 'M20.5 12.5L12.5 20.5l-9-9V4h7.5l9.5 8.5zM7.5 7.5h.01',

    /* ── Flow node kinds ── */
    decision: 'M12 3l9 9-9 9-9-9z',
    event: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    start: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10 9l5 3-5 3z',
    end: [
      { tag: 'path', attrs: { d: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z' } },
      { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3.5, fill: 'currentColor', stroke: 'none' } }
    ],

    /* ── Navigation and actions ── */
    close: 'M6 6l12 12M18 6L6 18',
    back: 'M19 12H5M11 18l-6-6 6-6',
    forward: 'M5 12h14M13 6l6 6-6 6',
    arrowUp: 'M12 19V5M5 12l7-7 7 7',
    arrowDown: 'M12 5v14M5 12l7 7 7-7',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5L16 16',
    zoomIn: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5L16 16M11 8v6M8 11h6',
    zoomOut: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5L16 16M8 11h6',
    fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    reset: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 3.5V9H9',
    chevronDown: 'M6 9l6 6 6-6',
    chevronRight: 'M9 6l6 6-6 6',
    chevronUp: 'M6 15l6-6 6 6',
    chevronLeft: 'M15 6l-6 6 6 6',
    check: 'M5 12.5l4.5 4.5L19 7',
    error: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9l-6 6M9 9l6 6',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16v-4.5M12 8.5h.01',
    list: 'M8.5 6h12M8.5 12h12M8.5 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    map: 'M9 3.5L3 6v14.5l6-2.5 6 2.5 6-2.5V3.5L15 6 9 3.5zM9 3.5V18M15 6v14.5',
    menu: 'M3.5 6h17M3.5 12h17M3.5 18h17',
    externalLink: 'M14 4h6v6M20 4l-9 9M18.5 13.5V19a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5',
    play: 'M7 4.5l12 7.5-12 7.5z',
    pause: 'M8 5v14M16 5v14',
    stop: 'M6.5 6.5h11v11h-11z',
    retry: 'M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 3.5V9H15',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    edit: 'M4 20h4.5L19.5 9l-4.5-4.5L4 15.5zM13 6.5l4.5 4.5',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9.5 7V4h5v3',
    lock: 'M5.5 11h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7.5a4 4 0 0 1 8 0V11',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
    database: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    window: 'M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 9h19M6 6.8h.01M8.5 6.8h.01',
    terminal: 'M4.5 17l6-5-6-5M12.5 19h7',
    cloud: 'M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5A3.75 3.75 0 0 1 17.5 18.5z',
    graph: 'M6 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8.5 5.5h7M7.2 7.6l3.6 6.3M16.8 7.6l-3.6 6.3',
    history: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 3.5V9H9M12 7.5V12l3 2',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2',
    send: 'M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
    calendar: 'M3.5 5.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 10h19M8 3v4M16 3v4',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    compare: 'M12 3v18M3.5 6h6v12h-6zM14.5 6h6v12h-6z',
    table: 'M3.5 5h17v14h-17zM3.5 10h17M3.5 14.5h17M9.5 5v14',
    sort: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',
    sortAsc: 'M12 19V5M6 11l6-6 6 6',
    sortDesc: 'M12 5v14M6 13l6 6 6-6',
    home: 'M3 11l9-8 9 8M5 10v10h14V10',
    eye: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    circle: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    dot: [{ tag: 'circle', attrs: { cx: 12, cy: 12, r: 3.5, fill: 'currentColor', stroke: 'none' } }],
    spinner: 'M12 3a9 9 0 0 1 9 9'
  };

  var FALLBACK = 'circle';
  var uid = 0;

  function has(name) {
    return Object.prototype.hasOwnProperty.call(ICONS, name);
  }

  function names() {
    return Object.keys(ICONS);
  }

  function sizeValue(size) {
    if (size === null || size === undefined || size === false) return null;
    if (typeof size === 'number') return size + 'px';
    return String(size);
  }

  function primitives(def) {
    if (typeof def === 'string') return [{ tag: 'path', attrs: { d: def } }];
    return def;
  }

  /* icon('area') → decorative svg; icon('area', { label: 'Área' }) → role="img" with <title>. */
  function icon(name, options) {
    var opts = options || {};
    var known = has(name);
    var def = ICONS[known ? name : FALLBACK];
    var label = opts.label === null || opts.label === undefined ? '' : String(opts.label);
    var size = sizeValue(opts.size);
    var attrs = {
      class: ['icon', 'icon--' + (known ? name : FALLBACK), opts.extraClass || null],
      viewBox: DEFAULT_VIEWBOX,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': String(STROKE_WIDTH),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      focusable: 'false'
    };
    if (size) {
      attrs.width = size;
      attrs.height = size;
      attrs.style = { width: size, height: size };
    }
    if (!known) attrs['data-icon-missing'] = name === null || name === undefined ? '' : String(name);
    var children = [];
    if (label) {
      var titleId = 'icon-title-' + (++uid);
      attrs.role = 'img';
      attrs['aria-labelledby'] = titleId;
      children.push(dom.svg('title', { id: titleId }, label));
    } else {
      attrs['aria-hidden'] = 'true';
    }
    primitives(def).forEach(function (p) {
      children.push(dom.svg(p.tag, p.attrs));
    });
    return dom.svg.apply(null, ['svg', attrs].concat(children));
  }

  return {
    icon: icon,
    has: has,
    names: names,
    STROKE_WIDTH: STROKE_WIDTH,
    FALLBACK: FALLBACK
  };
});
