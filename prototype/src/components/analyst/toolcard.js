/* components/analyst/toolcard — ToolEventCard of the analyst studio (design.md §3: queued,
 * running, succeeded, failed, awaiting approval). One card per operation call: the
 * tool-start event gives the label and targets, the paired tool-result (same callId) gives
 * the result text, pending list or diff rows; an error event marks the card as failed.
 *
 * toolCard({ event, result?, error?, expanded, onToggle(next), ui, testid?, eventTestid?,
 *            actions?: Node[], missingText? }) → <article class="tool-card">
 *   The summary is a native button with aria-expanded / aria-controls; the body is hidden
 *   until expanded. data-testid: tool-<callId> on the card, event-<logicalId> on the header
 *   (start event) and on the result region (result event). */
Primus.module('components/analyst/toolcard', function (require) {
  'use strict';

  var dom = require('core/dom');
  var atoms = require('ds/atoms');
  var molecules = require('ds/molecules');
  var icons = require('ds/icons');

  var OPERATION_ICONS = {
    READ_EVIDENCE: 'document',
    CHECK_MODEL: 'check',
    STAGE_VERSION: 'version',
    PUBLISH_DEMO_VERSION: 'send'
  };

  var KIND_ICONS = {
    'artifact-proposal': 'version',
    'form-request': 'edit',
    'approval-result': 'check'
  };

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function textOf(ui, key, fallback) {
    if (typeof ui === 'function') {
      var out = ui(key, fallback);
      return out === undefined || out === null ? fallback : out;
    }
    if (ui && typeof ui[key] === 'string' && ui[key]) return ui[key];
    return fallback;
  }

  function statusOf(event, result, error) {
    if (error || (event && event.status === 'failed') || (result && result.status === 'failed')) return 'failed';
    if (result) return result.status === 'running' ? 'running' : 'done';
    if (event && event.status === 'running') return 'running';
    if (event && event.kind === 'tool-start') return 'running';
    return 'done';
  }

  function toneOf(status) {
    return status === 'failed' ? 'danger' : status === 'running' ? 'info' : 'success';
  }

  function sourcesObject(list) {
    var out = {};
    (Array.isArray(list) ? list : []).forEach(function (source) {
      if (source && source.id) out[source.id] = source;
    });
    return out;
  }

  function diffValue(value, missingText) {
    var missing = value === null || value === undefined || value === '';
    return dom.h('span', { class: ['tool-card__diff-value', missing ? 'is-missing muted' : null] }, missing ? str(missingText) : str(value));
  }

  function toolCard(options) {
    var opts = options || {};
    var event = opts.event || {};
    var result = opts.result || null;
    var error = opts.error || null;
    var ui = opts.ui || {};
    var expanded = !!opts.expanded;
    var status = statusOf(event, result, error);
    var callId = event.callId || (result && result.callId) || null;
    var baseId = 'tool-' + String(opts.idPrefix || '') + String(callId || event.id || 'event').replace(/[^A-Za-z0-9_-]/g, '-');
    var bodyId = baseId + '-body';
    var summaryId = baseId + '-summary';
    var label = str(event.label || event.title || (result && result.label) || event.operation || '');
    var statusLabel = error ? str(error.statusLabel || error.text)
      : result ? str(result.statusLabel || (status === 'done' ? '' : ''))
        : str(event.statusLabel || '');
    var iconName = OPERATION_ICONS[event.operation] || KIND_ICONS[event.kind] || 'terminal';
    var missingText = opts.missingText || textOf(ui, 'missing', 'Sin dato proporcionado');

    /* ── Body sections ──────────────────────────────────────────────── */
    var sections = [];
    var evidence = Array.isArray(event.evidence) ? event.evidence : [];
    if (evidence.length) {
      sections.push(dom.h('div', { class: 'tool-card__section tool-card__targets' },
        dom.h('span', { class: 'tool-card__section-title eyebrow' }, textOf(ui, 'toolTargets', 'Evidencia revisada')),
        dom.h('ul', { class: 'cluster cluster--sm list list--plain list--inline', role: 'list' }, evidence.map(function (item) {
          return dom.h('li', null, atoms.chip({ label: item.label, icon: 'document' }));
        }))));
    }
    var sourceIds = Array.isArray(event.sourceIds) && event.sourceIds.length ? event.sourceIds
      : (result && Array.isArray(result.sourceIds) ? result.sourceIds : []);
    var sources = sourcesObject((event.sources && event.sources.length) ? event.sources : (result ? result.sources : []));
    if (sourceIds.length) {
      sections.push(atoms.provenance({ labels: [], sourceIds: sourceIds, sources: sources, sourcesLabel: textOf(ui, 'sources', 'Fuentes'), extraClass: 'tool-card__sources' }));
    }
    var resultEvent = result || (event.kind !== 'tool-start' && event.text ? event : null);
    if (resultEvent && resultEvent.text) {
      sections.push(dom.h('div', {
        class: 'tool-card__section tool-card__result',
        'data-testid': resultEvent !== event && resultEvent.logicalId ? 'event-' + resultEvent.logicalId : null,
        'data-event-id': resultEvent !== event ? resultEvent.id || null : null
      },
      dom.h('span', { class: 'tool-card__section-title eyebrow' }, textOf(ui, 'toolResult', 'Resultado')),
      dom.h('p', { class: 'tool-card__text' }, str(resultEvent.text))));
    }
    var pending = resultEvent && Array.isArray(resultEvent.pending) ? resultEvent.pending : [];
    if (pending.length) {
      sections.push(dom.h('div', { class: 'tool-card__section tool-card__pending' },
        dom.h('span', { class: 'tool-card__section-title eyebrow' }, textOf(ui, 'pendingItems', 'Pendientes')),
        dom.h('ul', { class: 'list' }, pending.map(function (item) { return dom.h('li', { class: 'list__item' }, str(item)); }))));
    }
    var diffRows = resultEvent && Array.isArray(resultEvent.diffRows) ? resultEvent.diffRows : [];
    if (diffRows.length) {
      sections.push(dom.h('div', { class: 'tool-card__section tool-card__diff' },
        dom.h('span', { class: 'tool-card__section-title eyebrow' }, textOf(ui, 'changes', 'Cambios')),
        molecules.keyValue({
          missingText: missingText,
          rows: diffRows.map(function (row) {
            return {
              label: str(row.label),
              value: dom.h('span', { class: ['tool-card__diff-row', row.unchanged ? 'is-unchanged' : null] },
                diffValue(row.before, missingText),
                dom.h('span', { class: 'tool-card__diff-arrow', 'aria-hidden': 'true' }, ' → '),
                dom.h('span', { class: 'sr-only' }, ' ' + textOf(ui, 'diffTo', 'pasa a') + ' '),
                diffValue(row.after, missingText))
            };
          })
        })));
    }
    if (error && error.text) {
      sections.push(dom.h('div', { class: 'tool-card__section tool-card__error' },
        dom.h('span', { class: 'tool-card__section-title eyebrow' }, textOf(ui, 'errorLabel', 'Error')),
        dom.h('p', { class: 'tool-card__text' }, str(error.text))));
    }
    if (!sections.length) {
      sections.push(dom.h('p', { class: 'tool-card__text muted' }, textOf(ui, 'toolNoDetail', 'Sin detalle adicional para esta operación')));
    }

    var body = dom.h('div', { class: 'tool-card__body', id: bodyId, role: 'region', 'aria-labelledby': summaryId, hidden: !expanded }, sections);

    var summary = dom.h('button', {
      type: 'button',
      class: 'tool-card__summary',
      id: summaryId,
      'aria-expanded': expanded ? 'true' : 'false',
      'aria-controls': bodyId,
      'data-focus-key': 'tool:' + String(opts.idPrefix || '') + String(callId || event.id || ''),
      on: {
        click: function (e) {
          var next = summary.getAttribute('aria-expanded') !== 'true';
          if (typeof opts.onToggle === 'function') {
            opts.onToggle(next, e);
            return;
          }
          summary.setAttribute('aria-expanded', next ? 'true' : 'false');
          body.hidden = !next;
          el.classList.toggle('is-open', next);
        }
      }
    },
    icons.icon(expanded ? 'chevronDown' : 'chevronRight', { extraClass: 'tool-card__chevron' }),
    icons.icon(iconName, { extraClass: 'tool-card__icon' }),
    dom.h('span', { class: 'tool-card__label' }, label),
    statusLabel ? molecules.statusLabel({
      label: statusLabel,
      tone: toneOf(status),
      icon: status === 'running' ? 'spinner' : null,
      extraClass: 'tool-card__status'
    }) : null);

    var header = dom.h('div', {
      class: 'tool-card__header',
      'data-testid': opts.eventTestid || (event.logicalId ? 'event-' + event.logicalId : null),
      'data-event-id': event.id || null
    }, summary, Array.isArray(opts.actions) && opts.actions.length ? dom.h('div', { class: 'tool-card__actions cluster cluster--sm' }, opts.actions) : null);

    var el = dom.h('article', {
      class: ['tool-card', 'tool-card--' + status, expanded ? 'is-open' : null, opts.extraClass || null],
      'data-testid': opts.testid || (callId ? 'tool-' + callId : null),
      'data-call-id': callId,
      'data-operation': event.operation || null,
      'data-status': status
    }, header, body);
    el.summary = summary;
    el.body = body;
    return el;
  }

  return { toolCard: toolCard, statusOf: statusOf, OPERATION_ICONS: OPERATION_ICONS };
});
