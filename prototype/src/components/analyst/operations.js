/* components/analyst/operations — «Operaciones» mode of the studio (spec DESK-02 «Operaciones
 * muestra los mismos eventos como filas», ux.md §6 Terminal/Chat). A dense table with the
 * columns «Secuencia», «Operación», «Estado», «Fuente» (codes READ_EVIDENCE, CHECK_MODEL,
 * STAGE_VERSION, PUBLISH_DEMO_VERSION only); «Abrir resultado» expands the same tool card as
 * the conversation (toggleTool shares the cursor). No shell, no fake command text. */
Primus.module('components/analyst/operations', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createOperations(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var toolcard = require('components/analyst/toolcard');
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var lastKey = null;

    function ui(key, fallback) { return typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback; }
    function dispatch(type, payload) { return typeof ctx.dispatch === 'function' ? ctx.dispatch(type, payload) : ctx.store.dispatch(type, payload); }

    var tableHost = h('div', { class: 'operations__table' });
    var detailHost = h('div', { class: 'operations__detail stack stack--sm' });
    var el = h('div', { class: 'operations', 'data-testid': 'operations' }, tableHost, detailHost);

    function statusTone(status) { return status === 'failed' ? 'danger' : status === 'running' ? 'info' : 'success'; }

    function render(model) {
      var cols = model.operationsColumns || [];
      var expanded = model.session.expandedTools || {};
      var rows = model.operations.map(function (op) {
        var isOpen = !!(expanded[op.eventId] || (op.callId && expanded[op.callId]));
        return { key: op.eventId || op.sequence, testid: 'operation-' + (op.logicalId || op.sequence), focusKey: 'operation:' + (op.eventId || op.sequence), className: op.status === 'failed' ? 'is-failed' : null,
          cells: [{ text: String(op.sequence), mono: true }, { node: h('span', { class: 'stack stack--xs' }, h('code', { class: 'mono' }, op.operation), op.label ? h('span', { class: 'text-sm muted' }, op.label) : null) }, { node: molecules.statusLabel({ label: op.statusLabel || op.status, tone: statusTone(op.status), icon: op.status === 'running' ? 'spinner' : null }) }, { text: op.sourceLabel || '—', mono: true }],
          actions: op.eventId ? atoms.button({ label: isOpen ? ui('closeResult', 'Cerrar resultado') : ui('openResult', 'Abrir resultado'), variant: 'ghost', size: 'sm', icon: isOpen ? 'chevronUp' : 'chevronDown', expanded: isOpen, testid: 'operation-toggle-' + (op.logicalId || op.sequence), focusKey: 'operation-toggle:' + (op.eventId || op.sequence),
            onClick: function () { dispatch('toggleTool', { sessionId: model.sessionId, eventId: op.eventId, expanded: !isOpen }); } }) : null };
      });
      dom.replace(tableHost, molecules.table({ id: 'operations-table', testid: 'operations-table', caption: ui('operationsCaption', 'Operaciones de la sesión'), captionHidden: true, dense: true, cardMode: true, sort: null,
        columns: [{ id: 'sequence', label: cols[0] || '#', width: 'sm' }, { id: 'operation', label: cols[1] || 'Operación' }, { id: 'status', label: cols[2] || 'Estado' }, { id: 'source', label: cols[3] || 'Fuente' }],
        rows: rows, emptyText: ui('operationsEmpty', 'Aún no hay operaciones en esta sesión. Inicia un escenario desde la conversación'), actionsColumn: { label: ui('actions', 'Acciones') } }));

      var byId = {};
      model.events.forEach(function (ev) { byId[ev.id] = ev; });
      var cards = model.operations.filter(function (op) { return op.eventId && (expanded[op.eventId] || (op.callId && expanded[op.callId])); }).map(function (op) {
        var start = byId[op.eventId];
        if (!start) return null;
        var result = op.resultEventId ? byId[op.resultEventId] : null;
        var error = (op.eventIds || []).map(function (id) { return byId[id]; }).filter(function (e) { return e && e.kind === 'error'; })[0] || null;
        return toolcard.toolCard({ event: start, result: result && result.kind === 'tool-result' ? result : null, error: error, expanded: true, idPrefix: 'ops-', testid: 'ops-tool-' + (op.callId || op.logicalId), eventTestid: 'ops-event-' + (start.logicalId || op.sequence), ui: function (k, f) { return ui(k, f); },
          onToggle: function (next) { dispatch('toggleTool', { sessionId: model.sessionId, eventId: op.eventId, expanded: next }); } });
      }).filter(Boolean);
      dom.replace(detailHost, cards);
    }

    function update(model) {
      if (!model) return;
      var key = JSON.stringify({ s: model.sessionId, ops: model.operations, x: model.session.expandedTools, cols: model.operationsColumns });
      if (key === lastKey) return;
      lastKey = key;
      dom.preserveFocus(el, function () { render(model); });
    }

    return { el: el, update: update };
  }

  return { createOperations: createOperations };
});
