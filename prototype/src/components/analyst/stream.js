/* components/analyst/stream — the conversation stream of the analyst studio (spec DESK-01…04,
 * ux.md §6 «Conversation stream», FR-022/023, AT-21/22). Renders desktopModel.events: analyst
 * and assistant turns, tool cards (tool-start + tool-result/error merged by callId through
 * components/analyst/toolcard), artifact proposals, approval requests/results, form requests,
 * completion messages with their CTA, the WS-ORG welcome, the processing spinner («Procesando
 * paso de demostración») and the paused notice. Auto-scrolls only while the reader is at the
 * latest message; otherwise shows «{n} mensajes nuevos» and «Ir al último mensaje». Announces
 * completed tools and review requests, never every token. */
Primus.module('components/analyst/stream', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createStream(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var toolcard = require('components/analyst/toolcard');
    var format = ctx.format || (ctx.store && ctx.store.format);
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var local = { key: null, sessionId: null, lastEventIds: [], announced: {}, suppressScroll: false };

    function ui(key, fallback) { return typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback; }
    function dispatch(type, payload) { return typeof ctx.dispatch === 'function' ? ctx.dispatch(type, payload) : ctx.store.dispatch(type, payload); }
    function navigate(target) { if (typeof ctx.navigate === 'function') return ctx.navigate(target); return dispatch('navigateTo', { target: target }); }
    function missing() { return format && format.missing ? format.missing() : 'Sin dato proporcionado'; }

    var listEl = h('div', { class: 'studio-stream__list stack stack--md', role: 'log', 'aria-live': 'off', 'aria-relevant': 'additions' });
    var statusEl = h('div', { class: 'studio-stream__status', hidden: true });
    var jumpEl = h('div', { class: 'studio-stream__jump', hidden: true });
    var el = h('div', { class: 'studio-stream', 'data-testid': 'studio-stream', tabindex: '0' }, listEl, statusEl, jumpEl);

    /* ---------- scroll tracking ---------- */

    function atBottom() { return el.scrollHeight - el.scrollTop - el.clientHeight < 24; }

    el.addEventListener('scroll', function () {
      if (local.suppressScroll) return;
      var model = local.model;
      if (!model) return;
      var bottom = atBottom();
      if (bottom !== model.session.atLatest) dispatch('setAtLatest', { sessionId: model.sessionId, atLatest: bottom });
    });

    function scrollToLatest() {
      local.suppressScroll = true;
      el.scrollTop = el.scrollHeight;
      local.suppressScroll = false;
    }

    /* ---------- renderers ---------- */

    function entityLinks(links) {
      if (!links || !links.length) return null;
      return h('div', { class: 'turn__links cluster cluster--sm' }, links.map(function (l) {
        if (!l.visible || !l.target) return atoms.chip({ label: l.name + (l.typeLabel ? ' · ' + l.typeLabel : ''), icon: l.type });
        return molecules.entityLink({ entity: { id: l.entityId, name: l.name, type: l.type }, typeLabel: l.typeLabel, icon: l.type, compact: true, showType: true, testid: 'stream-link-' + l.entityId, focusKey: 'stream-link:' + l.entityId,
          onOpen: function () { navigate(l.target); } });
      }));
    }

    function turn(ev, who, extraClass, children) {
      return h('article', { class: ['turn', 'turn--' + who, extraClass || null], 'data-testid': 'event-' + ev.logicalId, 'data-event-id': ev.id, 'data-kind': ev.kind },
        h('header', { class: 'turn__who' }, icons.icon(who === 'analyst' ? 'user' : 'terminal'), h('span', { class: 'turn__who-name' }, who === 'analyst' ? ui('analystLabel', 'Analista') : ui('assistantLabel', 'Claude Code · Simulado')), ev.atLabel ? h('time', { class: 'turn__time', datetime: ev.at }, ev.atLabel) : null),
        h('div', { class: 'turn__body' }, children));
    }

    function renderEvent(ev, model, byCall) {
      switch (ev.kind) {
        case 'analyst-message':
          return turn(ev, 'analyst', null, h('p', null, ev.text));
        case 'assistant-message': {
          var cls = ev.unsupported || ev.unavailable ? 'turn--unsupported' : null;
          return turn(ev, 'assistant', cls, [
            h('p', null, ev.text),
            ev.reasons && ev.reasons.length ? h('ul', { class: 'list' }, ev.reasons.map(function (r) { return h('li', { class: 'list__item' }, r.text || r); })) : null,
            ev.cta && ev.cta.command ? atoms.button({ label: ev.cta.label, variant: 'secondary', size: 'sm', testid: 'stream-cta-' + ev.logicalId, onClick: function () { dispatch(ev.cta.command.type, ev.cta.command.payload || {}); } }) : null,
            ev.decision === 'rejected' && ev.reason ? h('p', { class: 'text-sm muted' }, ui('reason', 'Motivo') + ': ' + ev.reason) : null,
            entityLinks(ev.links)
          ]);
        }
        case 'tool-start': {
          var pair = byCall[ev.callId] || {};
          return toolcard.toolCard({ event: ev, result: pair.result || null, error: pair.error || null, expanded: !!(model.session.expandedTools[ev.id] || model.session.expandedTools[ev.callId]), ui: function (k, f) { return ui(k, f); }, missingText: missing(),
            onToggle: function (next) { dispatch('toggleTool', { sessionId: model.sessionId, eventId: ev.id, expanded: next }); } });
        }
        case 'tool-result': case 'error':
          return null; // merged into the tool card
        case 'artifact-proposal':
          if (ev.hidden) return null;
          return h('article', { class: 'turn turn--assistant', 'data-testid': 'event-' + ev.logicalId, 'data-event-id': ev.id, 'data-kind': ev.kind },
            h('header', { class: 'turn__who' }, icons.icon('version'), h('span', { class: 'turn__who-name' }, ui('assistantLabel', 'Claude Code · Simulado')), ev.atLabel ? h('time', { class: 'turn__time', datetime: ev.at }, ev.atLabel) : null),
            h('div', { class: 'turn__body' }, h('p', { class: 'turn__title' }, ev.title || ev.text), h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: ui('stagedLabel', 'Propuesta en preparación'), tone: 'proposed' }), ev.versionId ? h('span', { class: 'mono text-xs' }, ev.versionId + (ev.baseVersionId ? ' ← ' + ev.baseVersionId : '')) : null),
              h('p', { class: 'text-sm muted' }, ui('artifactHint', 'La vista previa del artefacto y la comparación están en el panel lateral'))));
        case 'approval-request':
          if (ev.hidden) return null;
          return h('article', { class: ['approval', model.review && model.review.state !== 'pending' ? 'approval--' + model.review.state : null], 'data-testid': 'event-' + ev.logicalId, 'data-event-id': ev.id, 'data-kind': ev.kind, role: 'status' },
            h('p', { class: 'approval__title' }, icons.icon('warning'), ' ', ev.title || ui('reviewRequest', 'Revisión pendiente')),
            h('p', { class: 'approval__text' }, ev.text),
            h('p', { class: 'text-sm muted' }, ui('reviewHint', 'Resuelve la revisión en el panel lateral: publicar, rechazar con motivo o cancelar')));
        case 'approval-result':
          return h('article', { class: ['approval', 'approval--' + (ev.decision === 'approved' ? 'approved' : 'rejected')], 'data-testid': 'event-' + ev.logicalId, 'data-event-id': ev.id, 'data-kind': ev.kind, role: 'status' },
            h('p', { class: 'approval__title' }, icons.icon(ev.decision === 'approved' ? 'check' : 'close'), ' ', ev.statusLabel || ev.message || ev.decision),
            ev.message && ev.message !== ev.statusLabel ? h('p', { class: 'approval__text' }, ev.message) : null,
            ev.reason ? h('p', { class: 'approval__text' }, ui('reason', 'Motivo') + ': ' + ev.reason) : null,
            ev.versionId ? h('p', { class: 'text-sm mono' }, ev.versionId) : null);
        case 'form-request':
          if (ev.hidden) return null;
          return h('article', { class: 'turn turn--assistant', 'data-testid': 'event-' + ev.logicalId, 'data-event-id': ev.id, 'data-kind': ev.kind },
            h('header', { class: 'turn__who' }, icons.icon('edit'), h('span', { class: 'turn__who-name' }, ui('assistantLabel', 'Claude Code · Simulado')), ev.atLabel ? h('time', { class: 'turn__time', datetime: ev.at }, ev.atLabel) : null),
            h('div', { class: 'turn__body' }, h('p', { class: 'turn__title' }, ev.title || ev.text), h('p', { class: 'text-sm muted' }, ui('formHint', 'Completa el formulario de preparación en el panel lateral'))));
        case 'completed':
          return turn(ev, 'assistant', 'turn--completed', [
            h('p', null, icons.icon('check'), ' ', ev.text),
            ev.cta && ev.cta.target ? atoms.button({ label: ev.cta.label, variant: 'primary', size: 'sm', icon: 'forward', testid: 'desktop-cta-web', focusKey: 'stream:cta:' + ev.logicalId, onClick: function () { navigate(ev.cta.target); } }) : (ev.cta && ev.cta.label ? h('p', { class: 'text-sm muted' }, ev.cta.label) : null)
          ]);
        default:
          return turn(ev, 'assistant', null, h('p', null, ev.text || ''));
      }
    }

    function welcome(model) {
      var ws = model.workspace;
      if (!ws.welcome) return null;
      return h('div', { class: 'studio-stream__welcome', 'data-testid': 'studio-welcome' },
        h('p', null, ws.welcome),
        ws.welcomeActions && ws.welcomeActions.length ? h('div', { class: 'cluster cluster--sm' }, ws.welcomeActions.map(function (a, i) { return atoms.button({ label: a.label, variant: 'secondary', size: 'sm', testid: 'welcome-action-' + i, onClick: function () { navigate(a.target); } }); })) : null);
    }

    function intro(model) {
      if (model.events.length || model.workspace.welcome) return null;
      return h('div', { class: 'studio-stream__welcome', 'data-testid': 'studio-intro' }, h('p', null, model.texts.intro || ''),
        model.readOnly ? molecules.notice({ text: model.readOnlyMessage, tone: 'info', testid: 'studio-readonly', action: model.readOnlyCta ? { label: model.readOnlyCta.label, testid: 'use-analyst-profile', onClick: function () { dispatch(model.readOnlyCta.command.type, model.readOnlyCta.command.payload || {}); } } : null }) : null);
    }

    function render(model) {
      var byCall = {};
      model.events.forEach(function (ev) {
        if (ev.kind === 'tool-result' && ev.callId) (byCall[ev.callId] = byCall[ev.callId] || {}).result = ev;
        if (ev.kind === 'error' && ev.callId) (byCall[ev.callId] = byCall[ev.callId] || {}).error = ev;
      });
      var nodes = [welcome(model), intro(model)];
      model.events.forEach(function (ev) { var n = renderEvent(ev, model, byCall); if (n) nodes.push(n); });
      dom.replace(listEl, nodes);
    }

    function renderStatus(model) {
      var pb = model.playback;
      var items = [];
      if (pb.processing) items.push(atoms.spinner({ label: pb.processingText || model.texts.processing }));
      if (pb.status === 'paused' && pb.pausedMessage) items.push(molecules.notice({ text: pb.pausedMessage, tone: 'info', role: 'status', testid: 'scenario-paused' }));
      if (pb.status === 'stopped') items.push(molecules.notice({ text: ui('statusStopped', 'Detenido'), tone: 'neutral', role: 'status', testid: 'scenario-stopped' }));
      if (pb.status === 'failed') items.push(molecules.notice({ text: ui('statusFailed', 'Paso fallido. Reintenta para continuar'), tone: 'danger', role: 'alert', testid: 'scenario-failed' }));
      dom.replace(statusEl, items);
      statusEl.hidden = !items.length;
    }

    function renderJump(model) {
      var show = !model.session.atLatest && model.events.length > 0;
      jumpEl.hidden = !show;
      if (!show) { dom.clear(jumpEl); return; }
      dom.replace(jumpEl, atoms.button({ label: (model.texts.newMessages ? model.texts.newMessages + ' · ' : '') + model.texts.jumpToLatest, variant: 'secondary', size: 'sm', icon: 'arrowDown', testid: 'jump-to-latest', focusKey: 'stream:jump',
        onClick: function () { scrollToLatest(); dispatch('markRead', { sessionId: model.sessionId }); } }));
    }

    function announceChanges(model) {
      var seen = local.announced[model.sessionId] || (local.announced[model.sessionId] = {});
      model.events.forEach(function (ev) {
        if (seen[ev.id]) return;
        seen[ev.id] = true;
        if (!local.firstRenderDone) return;
        if (ev.kind === 'tool-result' && ev.status !== 'failed') dom.announce((ev.label || ev.operation || '') + ': ' + (ev.statusLabel || ''));
        else if (ev.kind === 'error') dom.announce(ev.text || '');
        else if (ev.kind === 'completed') dom.announce(ev.text || '');
      });
    }

    function update(model) {
      if (!model) return;
      local.model = model;
      var sessionChanged = model.sessionId !== local.sessionId;
      local.sessionId = model.sessionId;
      var key = JSON.stringify({ s: model.sessionId, e: model.events, x: model.session.expandedTools, ro: model.readOnly, w: model.workspace.welcome, review: model.review && model.review.state });
      var newCount = model.events.length;
      var grew = newCount > (local.lastCount || 0) && !sessionChanged;
      if (key !== local.key) {
        local.key = key;
        dom.preserveFocus(el, function () { render(model); });
      }
      renderStatus(model);
      renderJump(model);
      announceChanges(model);
      if (sessionChanged || (grew && model.session.atLatest) || model.playback.processing) {
        if (sessionChanged || model.session.atLatest) scrollToLatest();
      }
      local.lastCount = newCount;
      local.firstRenderDone = true;
    }

    return { el: el, update: update, scrollToLatest: scrollToLatest };
  }

  return { createStream: createStream };
});
