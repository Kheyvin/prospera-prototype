/* Analyst studio — review panel (R-01 / R-02).
 * Renders `desktopModel.review` (docs/desktop-engine.md §6, spec §10.5 DESK-02/DESK-03):
 * heading, review text, responsible/scope facts, before/after diff (T-02 cells for SCN-01,
 * diff rows table for SCN-02), pending list, references, the editable «Instrucción propuesta»
 * with counter + «Restaurar texto propuesto», the optional «Nota de revisión», the
 * «Motivo del rechazo» field revealed by the first click on «Rechazar con motivo», and the
 * approve / reject / cancel / resume actions. Every state change goes through commands
 * (setReviewField, restoreReviewText, resolveReview, resumeReview); validation errors come
 * back on the model (`review.errors`) and the first invalid field receives focus.
 * Factory: createReviewPanel(ctx) → { el, update(model) }. No DOM work at factory time. */
Primus.module('components/analyst/review', function () {
  'use strict';

  var FIELD_IDS = { instruction: 'review-instruction', note: 'review-note', reason: 'review-reason' };
  var NOTICE_TONES = { approved: 'success', rejected: 'warning', canceled: 'info' };

  function interpolate(template, params) {
    var out = template === null || template === undefined ? '' : String(template);
    if (!params) return out;
    return out.replace(/\{(\w+)\}/g, function (match, key) {
      return params[key] === undefined || params[key] === null ? match : String(params[key]);
    });
  }

  function createReviewPanel(ctx) {
    var dom = ctx.dom;
    var atoms = ctx.atoms;
    var molecules = ctx.molecules;
    var icons = ctx.icons;
    var format = ctx.format;
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var h = dom.h;

    function t(key, fallback, params) {
      var value = ui[key];
      var str = typeof value === 'string' && value ? value : fallback;
      return params ? interpolate(str, params) : str;
    }

    function missing() {
      return format && typeof format.missing === 'function' ? format.missing() : t('noData', 'Sin dato proporcionado');
    }

    function dispatch(type, payload) {
      if (ctx.store && typeof ctx.store.dispatch === 'function') return ctx.store.dispatch(type, payload);
      return ctx.dispatch(type, payload);
    }

    function announce(text) {
      if (text && typeof dom.announce === 'function') dom.announce(text);
    }

    var local = {
      key: null,            // structural key of the last full render
      requestId: null,      // review being rendered (effective id)
      state: null,          // last review.state seen (for announcements)
      rejecting: false,     // reason field revealed by the first «Rechazar con motivo» click
      busy: false,          // a dispatch is in flight
      lastError: null,      // { text, cta } from a failed dispatch
      pendingFocus: null,   // field id to focus after the next render
      model: null
    };
    var refs = {};

    var el = h('section', {
      class: 'review studio-side__section',
      'data-testid': 'review',
      'aria-labelledby': 'review-title',
      hidden: true
    });

    /* ── helpers ──────────────────────────────────────────────────────── */

    function formLabelsFor(review) {
      /* Labels of the SCN-02 form fields (R-02 shows the submitted values as facts). */
      var labels = {};
      var scenario = null;
      var pack = ctx.pack || {};
      if (pack.scenarios && typeof pack.scenarios.get === 'function') scenario = pack.scenarios.get(review.scenarioId) || null;
      if (!scenario) {
        var raw = pack.raw || pack;
        var list = Array.isArray(raw.scenarios) ? raw.scenarios : [];
        for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === review.scenarioId) scenario = list[i];
      }
      if (!scenario) return labels;
      (scenario.events || []).forEach(function (event) {
        if (!event || event.kind !== 'form-request') return;
        (event.fields || []).forEach(function (field) { if (field && field.id) labels[field.id] = field.label; });
      });
      return labels;
    }

    function detailText(review) {
      /* The approval-request text repeats the heading as its first sentence; show the rest. */
      var text = review.text || '';
      var title = review.title || '';
      if (!text || text === title) return null;
      if (title && text.indexOf(title) === 0) {
        var rest = text.slice(title.length).replace(/^[\s.:;·-]+/, '');
        return rest || null;
      }
      return text;
    }

    function counterText(value, max) {
      var n = value === null || value === undefined ? 0 : String(value).length;
      return t('characterCount', '{n} de {max} caracteres', { n: n, max: max });
    }

    function structureKey(review, paused, pausedMessage) {
      var fields = review.fields || {};
      var proposed = review.diff ? review.diff.proposed : null;
      return JSON.stringify({
        requestId: review.requestId,
        state: review.state,
        title: review.title,
        text: review.text,
        responsible: review.responsibleLabel,
        scope: review.scopeLabel,
        pendingLabel: review.pendingLabel,
        referencesLabel: review.referencesLabel,
        errors: review.errors,
        instructionField: review.instructionField,
        noteField: review.noteField,
        reasonField: review.reasonField,
        editable: review.editable,
        edited: review.edited,
        restorable: review.diff ? fields.instruction !== proposed : false,
        diffBefore: review.diff ? review.diff.before : null,
        versionNote: review.diff ? review.diff.versionNote : null,
        diffRows: review.diff
          ? (review.diffRows || []).map(function (r) { return { id: r.id, key: r.key, label: r.label, before: r.before }; })
          : review.diffRows,
        hasInstruction: fields.instruction !== null && fields.instruction !== undefined,
        hasNote: fields.note !== null && fields.note !== undefined,
        result: fields.result, backingReference: fields.backingReference, confirmation: fields.confirmation,
        pending: review.pending,
        references: review.references,
        actions: review.actions,
        enabled: review.enabled,
        notice: review.notice,
        paused: paused, pausedMessage: pausedMessage,
        rejecting: local.rejecting,
        busy: local.busy,
        lastError: local.lastError
      });
    }

    function focusControl(id) {
      var target = el.querySelector('[id="' + id + '"]');
      if (target && typeof target.focus === 'function') {
        try { target.focus(); } catch (e) { /* detached */ }
        return true;
      }
      return false;
    }

    function controlIdOf(field) {
      return FIELD_IDS[field] || ('review-' + field);
    }

    function rerender() {
      if (local.model) update(local.model);
    }

    function run(type, payload, after) {
      if (local.busy) return null;
      local.busy = true;
      local.lastError = null;
      var result = null;
      try {
        rerender();
        result = dispatch(type, payload);
      } finally {
        local.busy = false;
      }
      if (result && result.ok === false) {
        var err = result.error || {};
        local.lastError = { text: err.message || err.text || missing(), cta: err.cta || null };
        announce(local.lastError.text);
      } else if (typeof after === 'function') {
        after(result ? result.result : null);
      }
      rerender();
      if (local.pendingFocus) {
        if (focusControl(controlIdOf(local.pendingFocus))) local.pendingFocus = null;
      }
      return result;
    }

    /* ── actions ──────────────────────────────────────────────────────── */

    function setField(sessionId, field, value) {
      dispatch('setReviewField', { sessionId: sessionId, field: field, value: value });
    }

    function approve(sessionId, review) {
      run('resolveReview', { sessionId: sessionId, decision: 'approve' }, function (result) {
        if (!result) return;
        if (result.applied === false) {
          local.pendingFocus = result.firstErrorField || null;
          announce(review.fieldsMessage || (format && format.msg ? format.msg('MSG-15') : ''));
        } else {
          announce(result.message || (review.messages && review.messages.approved) || '');
        }
      });
    }

    function reject(sessionId, review) {
      if (!local.rejecting) {
        local.rejecting = true;
        local.pendingFocus = 'reason';
        rerender();
        if (focusControl(FIELD_IDS.reason)) local.pendingFocus = null;
        return;
      }
      run('resolveReview', { sessionId: sessionId, decision: 'reject' }, function (result) {
        if (!result) return;
        if (result.applied === false) {
          local.pendingFocus = result.firstErrorField || 'reason';
          announce(review.fieldsMessage || '');
        } else {
          local.rejecting = false;
          announce(result.message || (review.messages && review.messages.rejected) || '');
        }
      });
    }

    function cancel(sessionId, review) {
      run('resolveReview', { sessionId: sessionId, decision: 'cancel' }, function (result) {
        local.rejecting = false;
        announce((result && result.message) || (review.messages && review.messages.canceled) || '');
      });
    }

    function resume(sessionId) {
      run('resumeReview', { sessionId: sessionId }, function () {
        local.pendingFocus = 'instruction';
        announce(t('resumeReview', 'Retomar revisión'));
      });
    }

    function restore(sessionId) {
      run('restoreReviewText', { sessionId: sessionId }, function () {
        local.pendingFocus = 'instruction';
      });
    }

    /* ── rendering ────────────────────────────────────────────────────── */

    function diffCell(label, value, after, badge) {
      var cell = h('div', { class: ['review__diff-cell', after ? 'review__diff-cell--after' : null] },
        h('span', { class: 'review__diff-label' }, label),
        h('p', { class: 'review__diff-text' }, value === null || value === undefined || value === '' ? missing() : value),
        badge || null);
      return cell;
    }

    function renderDiffSection(review) {
      var children = [];
      if (review.diff) {
        var row = (review.diffRows || [])[0] || null;
        var editedBadge = atoms.badge({ label: t('labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' });
        editedBadge.hidden = !review.edited;
        refs.editedBadge = editedBadge;
        var afterCell = diffCell(t('after', 'Después'), review.diff.after, true, editedBadge);
        refs.afterText = afterCell.querySelector('.review__diff-text');
        children.push(h('div', { class: 'review__section' },
          row ? h('h4', { class: 'inspector__section-title' }, row.label) : null,
          h('div', { class: 'review__diff' },
            diffCell(t('before', 'Antes'), review.diff.before, false, null),
            afterCell),
          review.diff.versionNote ? h('p', { class: 'panel-note text-sm' }, review.diff.versionNote) : null));
      } else if (review.diffRows && review.diffRows.length) {
        children.push(molecules.table({
          id: 'review-diff',
          caption: t('proposedChanges', 'Cambios propuestos'),
          columns: [
            { id: 'label', label: t('change', 'Cambio'), rowHeader: true },
            { id: 'before', label: t('before', 'Antes') },
            { id: 'after', label: t('after', 'Después') }
          ],
          rows: review.diffRows.map(function (r) {
            return {
              key: r.id,
              className: r.unchanged ? 'is-unchanged' : null,
              cells: [
                { text: r.label },
                { text: r.before === null || r.before === undefined || r.before === '' ? missing() : String(r.before) },
                { text: r.after === null || r.after === undefined || r.after === '' ? missing() : String(r.after) }
              ]
            };
          }),
          sort: null,
          dense: true,
          cardMode: true,
          emptyText: missing()
        }));
        var fields = review.fields || {};
        var labels = formLabelsFor(review);
        var rows = [];
        if (fields.result !== undefined && fields.result !== null) rows.push({ label: labels.result || t('result', 'Resultado'), value: fields.result });
        if (fields.backingReference !== undefined && fields.backingReference !== null) rows.push({ label: labels.backingReference || t('backingReference', 'Respaldo interno'), value: fields.backingReference });
        if (rows.length) children.push(molecules.keyValue({ rows: rows, missingText: missing() }));
      }
      return children;
    }

    function renderList(title, items) {
      if (!items || !items.length) return null;
      return h('div', { class: 'review__section' },
        h('h4', { class: 'inspector__section-title' }, title),
        molecules.list({ ariaLabel: title, items: items.map(function (item, index) { return { key: index, node: item }; }) }));
    }

    function referenceText(ref) {
      var text = ref.id + ' · ' + (ref.title || ref.id);
      if (ref.section) text += ' (' + ref.section + ')';
      return text;
    }

    function textField(opts) {
      /* opts: { field, def, value, required, optional, error, rows, sessionId, onKeydown } */
      var id = FIELD_IDS[opts.field];
      var control = atoms.textarea({
        id: id,
        testid: id,
        focusKey: 'review:' + opts.field,
        value: opts.value,
        rows: opts.rows,
        maxlength: opts.def && opts.def.max !== undefined ? opts.def.max : null,
        invalid: !!opts.error,
        onInput: function (value) { setField(opts.sessionId, opts.field, value); },
        onKeydown: opts.onKeydown
      });
      refs[opts.field] = control;
      var fieldEl = atoms.field({
        id: id,
        label: opts.def ? opts.def.label : opts.field,
        hint: counterText(opts.value, opts.def ? opts.def.max : 0),
        error: opts.error || null,
        required: !!opts.required,
        optional: !!opts.optional,
        control: control
      });
      refs[opts.field + 'Counter'] = fieldEl.querySelector('#' + id + '-hint');
      return fieldEl;
    }

    function render(model, review, paused, pausedMessage) {
      refs = {};
      dom.clear(el);
      var sessionId = model.sessionId;
      var pending = review.state === 'pending';
      var canceled = review.state === 'canceled';
      var resolved = review.state === 'approved' || review.state === 'rejected';
      var errors = review.errors || {};
      var errorKeys = Object.keys(errors).filter(function (k) { return !!errors[k]; });
      var fields = review.fields || {};
      var detail = detailText(review);

      el.classList.toggle('review--resolved', resolved);
      el.classList.toggle('review--canceled', canceled);

      /* Header */
      var facts = [];
      if (review.responsibleLabel) facts.push({ label: t('responsible', 'Responsable'), value: review.responsibleLabel });
      if (review.scopeLabel) facts.push({ label: t('scope', 'Alcance'), value: review.scopeLabel });
      el.appendChild(h('div', { class: 'review__header' },
        h('span', { class: 'eyebrow' }, t('review', 'Revisión') + ' · ' + (review.logicalRequestId || review.requestId)),
        h('h3', { class: 'review__title', id: 'review-title', tabindex: '-1', 'data-focus-key': 'review:title' }, review.title || t('review', 'Revisión')),
        detail ? h('p', { class: 'review__text' }, detail) : null,
        facts.length ? molecules.keyValue({ rows: facts, missingText: missing(), inline: true }) : null));

      /* Outcome notice (approved / rejected / canceled) */
      if (review.notice) {
        el.appendChild(molecules.notice({
          text: review.notice,
          tone: NOTICE_TONES[review.state] || 'info',
          role: 'status',
          testid: 'review-notice'
        }));
      }
      if (canceled) {
        el.appendChild(h('div', { class: 'review__actions' },
          atoms.button({
            label: review.actions && review.actions.resume ? review.actions.resume : t('resumeReview', 'Retomar revisión'),
            variant: 'primary', size: 'sm', icon: 'play', testid: 'review-resume', focusKey: 'review:resume',
            disabled: !(review.enabled && review.enabled.resume) || local.busy, busy: local.busy,
            onClick: function () { resume(sessionId); }
          })));
      }

      /* Diff, pending items and references */
      renderDiffSection(review).forEach(function (node) { if (node) el.appendChild(node); });
      var pendingList = renderList(review.pendingLabel || t('pendingItems', 'Pendientes'), review.pending);
      if (pendingList) el.appendChild(pendingList);
      var refList = renderList(review.referencesLabel || t('sources', 'Fuentes'), (review.references || []).map(referenceText));
      if (refList) el.appendChild(refList);

      /* Editable fields (pending review only) */
      if (pending) {
        var form = h('div', { class: 'form review__form' });
        if (review.editable && review.instructionField && fields.instruction !== null && fields.instruction !== undefined) {
          form.appendChild(textField({ field: 'instruction', def: review.instructionField, value: fields.instruction, required: true, error: errors.instruction, rows: 6, sessionId: sessionId }));
          var restorable = review.diff ? fields.instruction !== review.diff.proposed : false;
          form.appendChild(h('div', { class: 'cluster cluster--sm' },
            atoms.button({
              label: review.instructionField.restore || t('restore', 'Restaurar'),
              variant: 'ghost', size: 'sm', icon: 'reset', testid: 'review-restore', focusKey: 'review:restore',
              disabled: !restorable || local.busy,
              onClick: function () { restore(sessionId); }
            })));
        }
        if (review.noteField && fields.note !== null && fields.note !== undefined) {
          form.appendChild(textField({ field: 'note', def: review.noteField, value: fields.note, optional: true, error: errors.note, rows: 3, sessionId: sessionId }));
        }
        if (review.reasonField && (local.rejecting || errors.reason)) {
          form.appendChild(h('div', { id: 'review-reason-field' },
            textField({
              field: 'reason', def: review.reasonField, value: fields.reason || '', required: true, error: errors.reason, rows: 3, sessionId: sessionId,
              onKeydown: function (event) {
                if (event.key !== 'Escape' || errors.reason) return;
                event.preventDefault();
                event.stopPropagation();
                local.rejecting = false;
                rerender();
                var btn = el.querySelector('[data-focus-key="review:reject"]');
                if (btn) btn.focus();
              }
            })));
        }
        if (errorKeys.length) {
          form.appendChild(h('div', { class: 'form__errors' },
            molecules.notice({ text: review.fieldsMessage || (format && format.msg ? format.msg('MSG-15') : ''), tone: 'danger', role: 'alert', testid: 'review-errors' })));
        }
        if (paused && pausedMessage) {
          form.appendChild(molecules.notice({ text: pausedMessage, tone: 'info', role: 'status' }));
        }
        if (local.lastError) {
          form.appendChild(molecules.notice({
            text: local.lastError.text, tone: 'danger', role: 'alert', testid: 'review-error',
            action: local.lastError.cta && local.lastError.cta.command ? {
              label: local.lastError.cta.label,
              onClick: function () { dispatch(local.lastError.cta.command.type, local.lastError.cta.command.payload || {}); }
            } : null,
            onDismiss: function () { local.lastError = null; rerender(); }
          }));
        }
        el.appendChild(form);

        var enabled = review.enabled || {};
        var actions = review.actions || {};
        el.appendChild(h('div', { class: 'review__actions' },
          atoms.button({
            label: actions.approve || t('confirm', 'Confirmar'), variant: 'primary', icon: 'check', testid: 'review-approve', focusKey: 'review:approve',
            disabled: !enabled.approve || local.busy, busy: local.busy,
            onClick: function () { approve(sessionId, review); }
          }),
          atoms.button({
            label: actions.reject || t('reject', 'Rechazar'), variant: 'danger', testid: 'review-reject', focusKey: 'review:reject',
            expanded: review.reasonField ? local.rejecting : null, controls: review.reasonField && local.rejecting ? 'review-reason-field' : null,
            disabled: !enabled.reject || local.busy,
            onClick: function () { reject(sessionId, review); }
          }),
          atoms.button({
            label: actions.cancel || t('cancel', 'Cancelar'), variant: 'ghost', testid: 'review-cancel', focusKey: 'review:cancel',
            disabled: !enabled.cancel || local.busy,
            onClick: function () { cancel(sessionId, review); }
          })));
      }
    }

    function patch(review) {
      /* Value-only changes (typing): keep the DOM, update values and counters. */
      var fields = review.fields || {};
      ['instruction', 'note', 'reason'].forEach(function (field) {
        var control = refs[field];
        if (!control) return;
        var value = fields[field] === null || fields[field] === undefined ? '' : String(fields[field]);
        if (control.value !== value) control.value = value;
        var counter = refs[field + 'Counter'];
        var def = field === 'instruction' ? review.instructionField : field === 'note' ? review.noteField : review.reasonField;
        if (counter) dom.setText(counter, counterText(value, def ? def.max : 0));
      });
      if (refs.afterText && review.diff) dom.setText(refs.afterText, review.diff.after || missing());
      if (refs.editedBadge) refs.editedBadge.hidden = !review.edited;
    }

    /* ── public ───────────────────────────────────────────────────────── */

    function update(model) {
      local.model = model || null;
      var review = model && model.review ? model.review : null;
      if (!review) {
        if (!el.hidden || el.firstChild) {
          dom.clear(el);
          el.hidden = true;
        }
        local.key = null;
        local.requestId = null;
        local.state = null;
        local.rejecting = false;
        local.lastError = null;
        local.pendingFocus = null;
        refs = {};
        return;
      }
      if (review.requestId !== local.requestId) {
        local.requestId = review.requestId;
        local.rejecting = false;
        local.lastError = null;
        local.state = null;
      }
      if (review.state !== 'pending') local.rejecting = false;
      var playback = model.playback || {};
      var paused = playback.status === 'paused';
      var pausedMessage = paused ? playback.pausedMessage || null : null;
      var key = structureKey(review, paused, pausedMessage);
      if (key !== local.key) {
        local.key = key;
        dom.preserveScroll(el, function () {
          dom.preserveFocus(el, function () { render(model, review, paused, pausedMessage); });
        });
        el.hidden = false;
      } else {
        patch(review);
      }
      if (local.state !== review.state) {
        if (local.state === null && review.state === 'pending') {
          announce((model.footer && model.footer.pendingReview) || t('statusAwaitingReview', 'Revisión pendiente del analista'));
        }
        local.state = review.state;
      }
      if (local.pendingFocus && focusControl(controlIdOf(local.pendingFocus))) local.pendingFocus = null;
    }

    return { el: el, update: update };
  }

  return { createReviewPanel: createReviewPanel };
});
