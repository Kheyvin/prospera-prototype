/* features/desktop/scenario-ui — scenario playback controls, the SCN-02 preparation form and
 * the artifact preview of the analyst studio (spec DESK-02/DESK-03, FR-019…021/023, AT-20…24).
 *
 * createPlaybackControls(ctx) → { el, update(model) }: status, «Continuar» / «Detener» /
 *   «Reintentar» / «Reiniciar escenario» (confirmed: discards the staged proposal) and the
 *   discreet «Probar recuperación» menu available before a run starts.
 * createScenarioForm(ctx) → { el, update(model) }: the «Preparación del nuevo AS-IS» form
 *   (result, backing reference, fictional-confirmation checkbox, «Preparar cambio»).
 * createArtifactPreview(ctx) → { el, update(model) }: «proceso-boletas.yml · representación
 *   de ejemplo», generated from state by core/versions (never a divergent copy). */
Primus.module('features/desktop/scenario-ui', function (require) {
  'use strict';

  var dom = require('core/dom');

  function uiOf(ctx) {
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    return function (key, fallback) { return typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback; };
  }
  function dispatcher(ctx) { return function (type, payload) { return typeof ctx.dispatch === 'function' ? ctx.dispatch(type, payload) : ctx.store.dispatch(type, payload); }; }

  var STATUS_TONE = { idle: 'neutral', running: 'info', paused: 'warning', stopped: 'neutral', 'awaiting-review': 'warning', failed: 'danger', completed: 'success' };

  /* ---------- playback controls ---------- */

  function createPlaybackControls(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var ui = uiOf(ctx);
    var dispatch = dispatcher(ctx);
    var lastKey = null;
    var confirmOpen = false;
    var el = h('div', { class: 'studio-playback cluster cluster--sm', role: 'group', 'aria-label': ui('playback', 'Reproducción del escenario'), 'data-testid': 'scenario-controls' });

    function statusLabel(pb) {
      var labels = { idle: ui('statusIdle', 'Sin escenario en curso'), running: ui('statusRunning', 'En curso'), paused: ui('statusPaused', 'Pausado'), stopped: ui('statusStopped', 'Detenido'), 'awaiting-review': ui('statusAwaitingReview', 'Revisión pendiente del analista'), failed: ui('statusFailed', 'Paso fallido'), completed: ui('statusCompleted', 'Completado') };
      return labels[pb.status] || pb.status;
    }

    function restart(model) {
      if (confirmOpen) return;
      var text = model.playback.labels.restartConfirm;
      var go = function () { var r = dispatch('restartScenario', { sessionId: model.sessionId }); if (r && r.ok === false && r.error) dom.announce(r.error.message || ''); };
      if (!text) { go(); return; }
      confirmOpen = true;
      molecules.confirm({ id: 'scenario-restart-confirm', testid: 'scenario-restart-confirm', title: text, text: '', confirmLabel: model.playback.labels.restart, cancelLabel: ui('cancel', 'Cancelar'), confirmTestid: 'scenario-restart-confirm-ok', cancelTestid: 'scenario-restart-confirm-cancel', danger: true,
        onConfirm: function () { confirmOpen = false; go(); }, onCancel: function () { confirmOpen = false; } });
    }

    function run(type, model) {
      var r = dispatch(type, { sessionId: model.sessionId });
      if (r && r.ok === false && r.error && r.error.message) dom.announce(r.error.message);
    }

    function render(model) {
      var pb = model.playback;
      var items = [];
      items.push(molecules.statusLabel({ label: (pb.scenarioTitle ? pb.scenarioTitle + ' · ' : '') + statusLabel(pb), tone: STATUS_TONE[pb.status] || 'neutral', icon: pb.processing ? 'spinner' : null }));
      if (pb.scenarioId && pb.totalSteps) items.push(h('span', { class: 'text-xs muted', 'data-testid': 'scenario-progress' }, Math.min(pb.stepIndex, pb.totalSteps) + ' / ' + pb.totalSteps));
      items.push(atoms.button({ label: pb.labels.continue, variant: 'primary', size: 'sm', icon: 'play', testid: 'scenario-continue', focusKey: 'playback:continue', disabled: !pb.canContinue, onClick: function () { run('continueScenario', model); } }));
      items.push(atoms.button({ label: pb.labels.stop, variant: 'secondary', size: 'sm', icon: 'stop', testid: 'scenario-stop', focusKey: 'playback:stop', disabled: !pb.canStop, onClick: function () { run('stopScenario', model); } }));
      if (pb.canRetry) items.push(atoms.button({ label: pb.labels.retry, variant: 'secondary', size: 'sm', icon: 'retry', testid: 'scenario-retry', focusKey: 'playback:retry', onClick: function () { run('retryScenario', model); } }));
      items.push(atoms.button({ label: pb.labels.restart, variant: 'ghost', size: 'sm', icon: 'reset', testid: 'scenario-restart', focusKey: 'playback:restart', disabled: !pb.canRestart, onClick: function () { restart(model); } }));
      if (pb.errorModes.length && !model.readOnly) {
        var selected = pb.errorModes.filter(function (m) { return m.selected; })[0] || null;
        items.push(molecules.disclosure({ id: 'error-modes', testid: 'error-modes', summary: (pb.errorModesLabel || ui('errorModes', 'Probar recuperación')) + (selected ? ' · ' + selected.label : ''), open: !!selected,
          content: h('div', { class: 'cluster cluster--sm' }, pb.errorModes.map(function (m) {
            return atoms.button({ label: m.label, variant: 'ghost', size: 'sm', icon: 'warning', pressed: !!m.selected, testid: 'error-mode-' + m.id, focusKey: 'playback:error-mode:' + m.id,
              onClick: function () { var r = dispatch('setErrorMode', { sessionId: model.sessionId, errorMode: m.selected ? null : m.id }); if (r && r.ok === false && r.error) dom.announce(r.error.message || ''); } });
          })) }));
      }
      dom.replace(el, items);
    }

    function update(model) {
      if (!model) return;
      var key = JSON.stringify({ s: model.sessionId, pb: model.playback, ro: model.readOnly });
      if (key === lastKey) return;
      lastKey = key;
      dom.preserveFocus(el, function () { render(model); });
    }

    return { el: el, update: update };
  }

  /* ---------- SCN-02 form ---------- */

  function createScenarioForm(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var format = ctx.format || (ctx.store && ctx.store.format);
    var ui = uiOf(ctx);
    var dispatch = dispatcher(ctx);
    var local = { key: null, controls: {}, pendingFocus: null, model: null };
    var el = h('section', { class: 'studio-side__section form scenario-form', 'data-testid': 'scenario-form', 'aria-labelledby': 'scenario-form-title', hidden: true });

    function msgText(id) { var m = format.msg(id); return typeof m === 'string' ? m : (m && m.text) || id; }

    function submit(model) {
      var r = dispatch('submitScenarioForm', { sessionId: model.sessionId });
      if (r && r.ok === false && r.error) { dom.announce(r.error.message || ''); return; }
      var res = r && r.result;
      if (res && res.applied === false) { local.pendingFocus = res.firstErrorField || null; dom.announce(msgText(res.messageId || 'MSG-15')); }
      else dom.announce(ui('formPrepared', 'Propuesta preparada. Revisa el cambio en el panel de revisión'));
    }

    function field(model, f) {
      var id = f.testid || ('scn2-' + f.id);
      var control;
      if (f.type === 'readonly') return h('div', { class: 'field' }, h('span', { class: 'field__label' }, h('span', { class: 'field__label-text' }, f.label)), h('div', { class: 'form__readonly', 'data-testid': id }, f.value === null || f.value === undefined ? format.missing() : String(f.value)));
      if (f.type === 'checkbox') {
        control = atoms.checkbox({ id: id, label: f.label, checked: !!f.value, testid: id, focusKey: 'scn2:' + f.id, disabled: !model.form.enabled, invalid: !!f.error, onChange: function (checked) { dispatch('setScenarioFormField', { sessionId: model.sessionId, field: f.id, value: checked }); } });
        local.controls[f.id] = control.controlEl || control;
        return h('div', { class: ['field', f.error ? 'is-invalid' : null] }, control, f.error ? h('p', { class: 'field__error', id: id + '-error', role: 'alert' }, f.error) : null);
      }
      if (f.type === 'textarea') control = atoms.textarea({ id: id, value: f.value || '', rows: 3, testid: id, focusKey: 'scn2:' + f.id, maxlength: f.max || null, disabled: !model.form.enabled, invalid: !!f.error, onInput: function (v) { dispatch('setScenarioFormField', { sessionId: model.sessionId, field: f.id, value: v }); } });
      else control = atoms.input({ id: id, value: f.value || '', testid: id, focusKey: 'scn2:' + f.id, maxlength: f.max || null, disabled: !model.form.enabled, invalid: !!f.error, onInput: function (v) { dispatch('setScenarioFormField', { sessionId: model.sessionId, field: f.id, value: v }); } });
      local.controls[f.id] = control;
      return atoms.field({ id: id, label: f.label, hint: typeof f.min === 'number' && typeof f.max === 'number' ? format.interpolate(msgText('MSG-05'), { min: f.min, max: f.max }) : null, error: f.error || null, required: !!f.required, control: control });
    }

    function render(model) {
      var form = model.form;
      local.controls = {};
      var errorKeys = Object.keys(form.errors || {}).filter(function (k) { return !!form.errors[k]; });
      dom.replace(el,
        h('h3', { class: 'studio-side__title', id: 'scenario-form-title' }, form.title),
        form.note ? h('p', { class: 'panel-note text-sm' }, form.note) : null,
        h('form', { class: 'stack stack--sm', novalidate: true, on: { submit: function (event) { event.preventDefault(); if (form.enabled) submit(model); } } },
          form.fields.map(function (f) { return field(model, f); }),
          errorKeys.length ? h('div', { class: 'form__errors' }, molecules.notice({ text: msgText('MSG-15'), tone: 'danger', role: 'alert', testid: 'scn2-errors' })) : null,
          form.submitted ? molecules.notice({ text: ui('formSubmitted', 'Cambio preparado. Revisa y publica desde el panel de revisión'), tone: 'success', role: 'status', testid: 'scn2-submitted' }) : null,
          h('div', { class: 'form__actions' }, atoms.button({ label: form.submit.label, variant: 'primary', icon: 'check', type: 'submit', testid: form.submit.testid || 'scn2-prepare', focusKey: 'scn2:submit', disabled: !form.enabled, onClick: function (event) { event.preventDefault(); if (form.enabled) submit(model); } }))));
    }

    function update(model) {
      local.model = model;
      var form = model && model.form;
      if (!form) { if (!el.hidden) { dom.clear(el); el.hidden = true; } local.key = null; return; }
      var key = JSON.stringify({ s: model.sessionId, e: form.eventId, f: form.fields.map(function (f) { return [f.id, f.error, f.type === 'checkbox' ? f.value : null, f.type === 'readonly' ? f.value : null]; }), en: form.enabled, sub: form.submitted, errs: form.errors });
      if (key !== local.key) {
        local.key = key;
        dom.preserveFocus(el, function () { render(model); });
        el.hidden = false;
      } else {
        form.fields.forEach(function (f) {
          var c = local.controls[f.id];
          if (!c || f.type === 'checkbox') return;
          var active = typeof document !== 'undefined' ? document.activeElement : null;
          var v = f.value === null || f.value === undefined ? '' : String(f.value);
          if (active !== c && c.value !== v) c.value = v;
        });
      }
      if (local.pendingFocus && local.controls[local.pendingFocus]) { try { local.controls[local.pendingFocus].focus(); } catch (e) { /* ignore */ } local.pendingFocus = null; }
    }

    return { el: el, update: update };
  }

  /* ---------- artifact preview ---------- */

  function createArtifactPreview(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var icons = ctx.icons || require('ds/icons');
    var ui = uiOf(ctx);
    var lastKey = null;
    var el = h('section', { class: 'studio-side__section artifact-preview', 'data-testid': 'artifact-preview', 'aria-labelledby': 'artifact-title', hidden: true });

    function update(model) {
      var a = model && model.artifact;
      if (!a) { if (!el.hidden) { dom.clear(el); el.hidden = true; } lastKey = null; return; }
      var key = JSON.stringify(a);
      if (key === lastKey) return;
      lastKey = key;
      dom.replace(el,
        h('h3', { class: 'studio-side__title artifact-preview__title', id: 'artifact-title' }, icons.icon('document'), ' ', a.title),
        h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: a.stateLabel, tone: a.state === 'published' ? 'success' : 'proposed', icon: false }), a.edited ? atoms.badge({ label: ui('labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' }) : null, h('span', { class: 'mono text-xs muted' }, a.versionId)),
        h('pre', { class: 'artifact-preview__code mono', tabindex: '0', 'data-testid': 'artifact-yaml', 'aria-label': a.title }, a.yaml));
      el.hidden = false;
    }

    return { el: el, update: update };
  }

  return { createPlaybackControls: createPlaybackControls, createScenarioForm: createScenarioForm, createArtifactPreview: createArtifactPreview };
});
