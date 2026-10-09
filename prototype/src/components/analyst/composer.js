/* components/analyst/composer — the composer dock of the studio (spec DESK-04, ux.md §6
 * «Dock/status»): scenario shortcut buttons (scenario-start-<id>, the preferred route), the
 * editable draft («Solicitud del analista», kept per session), explicit submit, and the
 * read-only explanation with «Usar perfil de analista» for non-admin profiles. Submitting goes
 * through submitDraft: only the exact trigger prompts start a scenario; anything else gets the
 * honest «respuestas preparadas» reply and keeps the draft. Ctrl/⌘+Enter submits. */
Primus.module('components/analyst/composer', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createComposer(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var local = { key: null, textarea: null, sessionId: null, lastError: null };

    function ui(key, fallback) { return typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback; }
    function dispatch(type, payload) { return typeof ctx.dispatch === 'function' ? ctx.dispatch(type, payload) : ctx.store.dispatch(type, payload); }

    var scenariosEl = h('div', { class: 'studio-composer__scenarios cluster cluster--sm', role: 'group', 'aria-label': ui('scenarios', 'Escenarios guiados') });
    var rowEl = h('div', { class: 'studio-composer__row' });
    var noteEl = h('div', { class: 'studio-composer__note', hidden: true });
    var el = h('div', { class: 'studio-composer', 'data-testid': 'studio-composer' }, scenariosEl, noteEl, rowEl);

    function startScenario(model, sc) {
      if (!sc.available) return;
      var r = dispatch('startScenario', { sessionId: model.sessionId, scenarioId: sc.id });
      if (r && r.ok === false && r.error && r.error.message) { local.lastError = r.error.message; dom.announce(r.error.message); rerender(); }
    }

    function submit(model) {
      if (!model.composer.enabled) return;
      var r = dispatch('submitDraft', { sessionId: model.sessionId });
      if (r && r.ok === false && r.error) {
        var text = r.error.message || r.error.text || '';
        if (r.error.code === 'empty-draft') text = ui('emptyDraft', 'Escribe una solicitud o elige un escenario');
        local.lastError = text;
        dom.announce(text);
        rerender();
        return;
      }
      local.lastError = null;
      if (r && r.result && r.result.unsupported && model.unsupportedMessage) dom.announce(model.unsupportedMessage);
      if (local.textarea) { try { local.textarea.focus(); } catch (e) { /* ignore */ } }
    }

    function renderScenarios(model) {
      var pb = model.playback;
      dom.replace(scenariosEl, pb.scenarios.map(function (sc) {
        var reason = !sc.available ? (sc.applied && !sc.reason ? ui('scenarioApplied', 'Este escenario ya se aplicó') : sc.reason) : null;
        var btn = atoms.button({ label: sc.triggerLabel, variant: sc.suggested ? 'primary' : 'secondary', size: 'sm', icon: 'play', testid: 'scenario-start-' + sc.id, focusKey: 'composer:scenario:' + sc.id,
          disabled: !sc.available, disabledReason: reason, title: sc.prompt || null, onClick: function () { startScenario(model, sc); } });
        var cta = !sc.available && sc.cta && sc.cta.command ? atoms.button({ label: sc.cta.label, variant: 'ghost', size: 'sm', icon: 'forward', testid: 'scenario-cta-' + sc.id, focusKey: 'composer:scenario-cta:' + sc.id, onClick: function () { dispatch(sc.cta.command.type, sc.cta.command.payload || {}); } }) : null;
        return h('span', { class: 'cluster cluster--sm' }, btn, cta);
      }));
    }

    function renderRow(model) {
      var c = model.composer;
      local.textarea = atoms.textarea({ id: 'composer', testid: 'composer', focusKey: 'composer:draft', value: model.session.draft || '', rows: 2, placeholder: c.placeholder || '', disabled: !c.enabled, maxlength: 600,
        onInput: function (text) { dispatch('setDraft', { sessionId: model.sessionId, text: text }); },
        onKeydown: function (event) { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); submit(model); } } });
      var field = atoms.field({ id: 'composer', label: c.label || ui('composerLabel', 'Solicitud del analista'), control: local.textarea, hint: c.enabled ? ui('composerHint', 'Ctrl + Enter envía la solicitud') : null });
      field.classList.add('studio-composer__field');
      dom.replace(rowEl, field,
        h('div', { class: 'studio-composer__controls' },
          atoms.button({ label: c.submit || ui('send', 'Enviar'), variant: 'primary', icon: 'send', testid: 'composer-submit', focusKey: 'composer:submit', disabled: !c.enabled, disabledReason: !c.enabled ? model.readOnlyMessage : null, onClick: function () { submit(model); } })));
    }

    function renderNote(model) {
      var items = [];
      if (model.readOnly && model.readOnlyMessage) items.push(molecules.notice({ text: model.readOnlyMessage, tone: 'info', testid: 'composer-readonly', action: model.readOnlyCta ? { label: model.readOnlyCta.label, testid: 'use-analyst-profile', onClick: function () { dispatch(model.readOnlyCta.command.type, model.readOnlyCta.command.payload || {}); } } : null }));
      if (local.lastError) items.push(molecules.notice({ text: local.lastError, tone: 'warning', role: 'alert', testid: 'composer-error', onDismiss: function () { local.lastError = null; rerender(); } }));
      dom.replace(noteEl, items);
      noteEl.hidden = !items.length;
    }

    function rerender() { if (local.model) { local.key = null; update(local.model); } }

    function update(model) {
      if (!model) return;
      local.model = model;
      var key = JSON.stringify({ s: model.sessionId, sc: model.playback.scenarios, c: model.composer, ro: model.readOnly, msg: model.readOnlyMessage, err: local.lastError });
      if (key !== local.key) {
        local.key = key;
        dom.preserveFocus(el, function () { renderScenarios(model); renderNote(model); renderRow(model); });
      } else if (local.textarea) {
        var active = typeof document !== 'undefined' ? document.activeElement : null;
        var draft = model.session.draft || '';
        if (active !== local.textarea && local.textarea.value !== draft) local.textarea.value = draft;
      }
      if (model.sessionId !== local.sessionId) { local.sessionId = model.sessionId; local.lastError = null; if (local.textarea) local.textarea.value = model.session.draft || ''; }
    }

    return { el: el, update: update, focus: function () { if (local.textarea) local.textarea.focus(); } };
  }

  return { createComposer: createComposer };
});
