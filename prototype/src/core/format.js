/* core/format — dates, missing values, messages, text normalization (CONTRACTS §5.2).
 *
 * Pure: no DOM, no Date.now(). ISO date strings are parsed by hand so the business date
 * never shifts with the viewer's time zone. */
Primus.module('core/format', function () {
  'use strict';

  var DEFAULT_MISSING = 'Sin dato proporcionado';
  var DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

  function rawOf(pack) {
    return (pack && pack.raw) || pack || {};
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function parseIso(value) {
    if (typeof value !== 'string') return null;
    var m = DATE_RE.exec(value.trim());
    if (!m) return null;
    return {
      year: m[1], month: m[2], day: m[3],
      hour: m[4] || null, minute: m[5] || null, second: m[6] || null,
      offset: m[7] || null,
      hasTime: !!m[4]
    };
  }

  function isValidCalendarDate(value) {
    var p = parseIso(value);
    if (!p) return false;
    var y = +p.year;
    var mo = +p.month;
    var d = +p.day;
    if (mo < 1 || mo > 12 || d < 1) return false;
    var days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d <= days[mo - 1];
  }

  function interpolate(template, params) {
    if (template === null || template === undefined) return '';
    var str = String(template);
    if (!params || typeof params !== 'object') return str;
    return str.replace(/\{([A-Za-z0-9_]+)\}/g, function (match, name) {
      var value = params[name];
      return value === null || value === undefined ? match : String(value);
    });
  }

  function normalize(value) {
    if (value === null || value === undefined) return '';
    var str = String(value);
    try { str = str.normalize('NFD'); } catch (e) { /* older engines */ }
    return str.replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function plural(n, one, many) {
    var count = typeof n === 'number' && isFinite(n) ? n : 0;
    return count + ' ' + (count === 1 ? one : many);
  }

  function isMissingValue(value) {
    return value === null || value === undefined || value === '' ||
      (typeof value === 'number' && isNaN(value));
  }

  function createCollator(locale) {
    try {
      if (typeof Intl !== 'undefined' && Intl.Collator) {
        return new Intl.Collator(locale, { sensitivity: 'base', numeric: true, ignorePunctuation: false });
      }
    } catch (e) { /* unknown locale → fallback below */ }
    return { compare: function (a, b) { return a < b ? -1 : a > b ? 1 : 0; } };
  }

  function createFormat(pack) {
    var raw = rawOf(pack);
    var messages = (pack && pack.messages) || raw.messages || {};
    var ui = (pack && pack.ui) || (raw.presentation && raw.presentation.ui) || {};
    var locale = (raw.client && raw.client.locale) || 'es-PE';
    var collator = createCollator(locale);
    var collatorEs = createCollator('es');

    function messageText(entry) {
      if (entry === null || entry === undefined) return null;
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'object' && typeof entry.text === 'string') return entry.text;
      return String(entry);
    }

    function missing() {
      return messageText(messages['MSG-16']) || DEFAULT_MISSING;
    }

    /* msg('MSG-05', { min, max }) → string; msg('MSG-02') → { text, action } */
    function msg(id, params) {
      var entry = messages[id];
      if (entry === null || entry === undefined) return id;
      if (typeof entry === 'string') return interpolate(entry, params);
      if (typeof entry === 'object') {
        var out = { id: id, text: interpolate(entry.text, params) };
        if (entry.action !== undefined) out.action = interpolate(entry.action, params);
        Object.keys(entry).forEach(function (key) {
          if (key !== 'text' && key !== 'action' && out[key] === undefined) out[key] = entry[key];
        });
        return out;
      }
      return String(entry);
    }

    /* Plain text of a message regardless of its shape. */
    function msgText(id, params) {
      var value = msg(id, params);
      return typeof value === 'string' ? value : value.text;
    }

    /* Generic chrome label from presentation.ui; falls back to the key so gaps are visible. */
    function uiText(key, params) {
      var entry = ui[key];
      if (entry === null || entry === undefined) return key;
      if (typeof entry === 'string') return interpolate(entry, params);
      return entry;
    }

    function date(iso) {
      if (isMissingValue(iso)) return missing();
      var p = parseIso(iso);
      if (!p) return String(iso);
      return p.day + '/' + p.month + '/' + p.year;
    }

    function time(iso) {
      if (isMissingValue(iso)) return missing();
      var p = parseIso(iso);
      if (!p || !p.hasTime) return missing();
      return p.hour + ':' + p.minute + ':' + (p.second || '00');
    }

    function dateTime(iso) {
      if (isMissingValue(iso)) return missing();
      var p = parseIso(iso);
      if (!p) return String(iso);
      var d = p.day + '/' + p.month + '/' + p.year;
      return p.hasTime ? d + ' ' + p.hour + ':' + p.minute + ':' + (p.second || '00') : d;
    }

    function nullable(value) {
      return isMissingValue(value) ? missing() : value;
    }

    function compare(a, b) {
      var aMissing = isMissingValue(a);
      var bMissing = isMissingValue(b);
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      var result = collator.compare(String(a), String(b));
      if (result === 0 && collator !== collatorEs) result = collatorEs.compare(String(a), String(b));
      return result;
    }

    function compareDates(a, b) {
      var aMissing = isMissingValue(a);
      var bMissing = isMissingValue(b);
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      var sa = String(a);
      var sb = String(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    }

    function compareNumbers(a, b) {
      var aMissing = isMissingValue(a);
      var bMissing = isMissingValue(b);
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      return Number(a) - Number(b);
    }

    function list(values, separator) {
      var sep = separator === undefined ? ' · ' : separator;
      return (values || []).filter(function (v) { return !isMissingValue(v); }).map(String).join(sep);
    }

    return {
      missing: missing,
      msg: msg,
      msgText: msgText,
      ui: uiText,
      date: date,
      time: time,
      dateTime: dateTime,
      nullable: nullable,
      isMissing: isMissingValue,
      normalize: normalize,
      plural: plural,
      interpolate: interpolate,
      compare: compare,
      compareDates: compareDates,
      compareNumbers: compareNumbers,
      isValidDate: isValidCalendarDate,
      parseIso: parseIso,
      list: list,
      locale: locale
    };
  }

  return {
    createFormat: createFormat,
    normalize: normalize,
    interpolate: interpolate,
    plural: plural,
    parseIso: parseIso,
    isValidDate: isValidCalendarDate,
    pad2: pad2,
    DEFAULT_MISSING: DEFAULT_MISSING
  };
});
