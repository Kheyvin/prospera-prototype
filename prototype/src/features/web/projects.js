/* features/web/projects — WEB-09 «Proyectos de mejora» (spec §10.4, §16.5, FR-018, JRN-08,
 * AT-17). Stage module with the project list, the detail (reason/gaps, responsible, dates,
 * status, proposed version, commitments, backing reference, follow-up), the actions
 * «Nuevo proyecto» / «Iniciar» / «Editar seguimiento» / «Marcar concluido» /
 * «Preparar nuevo AS-IS» (admin only, explained when disabled) and the PM-01 shortcut
 * «Simular cierre y preparar nuevo AS-IS» which only navigates to the desktop. Forms are
 * modal; every save is a validated command; closing a project never publishes a version. */
Primus.module('features/web/projects', function (require) {
  'use strict';

  var cache = typeof WeakMap === 'function' ? new WeakMap() : null;
  var FORM_ID = 'project';
  var CREATE_FIELDS = ['name', 'objective', 'process', 'responsible', 'dueDate', 'targetVersion'];
  var EDIT_FIELDS = ['objective', 'responsible', 'dueDate', 'status'];
  var CLOSE_FIELDS = ['result', 'confirmed'];
  var VALUE_KEY = { name: 'name', objective: 'objective', responsible: 'responsibleId', dueDate: 'dueDate', targetVersion: 'targetVersionId', status: 'status', result: 'result', confirmed: 'confirmed' };

  function jsonOf(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function packCore() { try { return require('core/pack'); } catch (e) { return null; } }
  function typeLabelOf(type) { var c = packCore(); return c && c.typeLabel ? c.typeLabel(type) : type; }
  function typeIconOf(type) { var c = packCore(); return c && c.typeIcon ? c.typeIcon(type) : type; }

  function create(stageEl, ctx) {
    var dom = ctx.dom, atoms = ctx.atoms, molecules = ctx.molecules, icons = ctx.icons, format = ctx.format, store = ctx.store, h = dom.h;
    var inst = { root: null, regions: {}, keys: {}, modal: null, modalKey: null, modalBody: null, modalOpener: null, closingSilently: false, confirmOpen: false, formError: null, ctx: ctx };

    function uiText(key, fallback) {
      var table = inst.ctx.ui || (inst.ctx.pack && inst.ctx.pack.ui) || {};
      var v = table[key];
      if (v === null || v === undefined) { try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ } return fallback === undefined ? key : fallback; }
      return v;
    }
    function dispatch(type, payload) { return typeof inst.ctx.dispatch === 'function' ? inst.ctx.dispatch(type, payload) : store.dispatch(type, payload); }
    function run(command) {
      if (!command) return null;
      if (command.type === 'navigateTo' && typeof inst.ctx.navigate === 'function') return inst.ctx.navigate(command.payload && command.payload.target ? command.payload.target : command.payload);
      return dispatch(command.type, command.payload || {});
    }
    function msgText(id, params) { var m = format.msg(id, params); return typeof m === 'string' ? m : (m && m.text) || id; }
    function missingText() { return format.missing(); }
    function notifySaved() { var text = msgText('MSG-09'); dispatch('pushToast', { text: text, tone: 'success', messageId: 'MSG-09' }); dom.announce(text); }

    function entityLink(ref, extra) {
      if (!ref) return null;
      return molecules.entityLink(Object.assign({ entity: { id: ref.id, name: ref.name, type: ref.type }, typeLabel: ref.typeLabel || typeLabelOf(ref.type), icon: ref.icon || typeIconOf(ref.type), showType: true, compact: true, testid: 'project-link-' + ref.id,
        onOpen: function () { dispatch('selectEntity', { entityId: ref.id }); } }, extra || {}));
    }

    function currentFocusKey() {
      var active = typeof document !== 'undefined' ? document.activeElement : null;
      return active && inst.root && inst.root.contains(active) ? active.getAttribute('data-focus-key') || null : null;
    }

    function openForm(payload) {
      var result = dispatch('openForm', payload);
      if (result.ok) { inst.formError = null; return result; }
      if (result.error && result.error.code === 'dirty') { confirmDiscard(function () { dispatch('openForm', Object.assign({}, payload, { discard: true })); }); return result; }
      if (result.error && result.error.message) dom.announce(result.error.message);
      return result;
    }

    function runAction(action) {
      if (!action || !action.enabled || !action.command) return;
      if (action.command.type === 'openForm') { inst.modalOpener = currentFocusKey(); openForm(action.command.payload); return; }
      var result = run(action.command);
      if (result && result.ok && action.command.type === 'startProject') notifySaved();
      if (result && result.ok === false && result.error && result.error.message) dom.announce(result.error.message);
    }

    function actionButton(action, extra) {
      if (!action) return null;
      var o = extra || {};
      var opts = { label: action.label, testid: action.id, focusKey: 'action:' + action.id, disabled: !action.enabled, icon: o.icon || null, variant: o.variant || 'secondary', size: 'sm', onClick: function () { runAction(action); } };
      if (!action.enabled && action.reason) opts.disabledReason = action.reason;
      return atoms.button(opts);
    }

    /* ---------- list ---------- */

    function statusNode(p) {
      var tone = p.status === 'concluded' ? 'success' : p.status === 'inProgress' ? 'brand' : 'neutral';
      return molecules.statusLabel({ label: p.statusLabel, tone: tone });
    }

    function buildList(model) {
      var rows = (model.projects || []).map(function (p) {
        return { key: p.id, testid: p.testid, focusKey: 'row:' + p.id, selected: !!p.selected, isDemo: !!p.isDemo, onSelect: function () { dispatch('selectProject', { id: p.selected ? null : p.id }); },
          cells: [{ text: p.id, mono: true }, { text: p.name }, { text: p.responsibleName }, { node: statusNode(p) }, { text: p.dueDateText }, { text: p.targetVersionLabel }] };
      });
      return h('div', { class: 'records__table' }, molecules.table({ id: 'projects-table', testid: 'projects-table', caption: model.title || '', captionHidden: true,
        columns: [{ id: 'id', label: uiText('id') }, { id: 'name', label: uiText('name') }, { id: 'responsible', label: uiText('responsible') }, { id: 'status', label: uiText('status') }, { id: 'dueDate', label: uiText('dueDate') }, { id: 'targetVersion', label: uiText('targetVersion') }],
        rows: rows, sort: null, cardMode: true, emptyText: model.empty ? model.empty.text : uiText('noData') }));
    }

    function buildActions(model) {
      var a = model.actions || {};
      var reasonEl = !model.canTrack && model.permissionReason ? h('p', { class: 'panel-note text-sm', id: 'project-permission-reason', 'data-testid': 'project-permission-reason' }, icons.icon('lock'), ' ', model.permissionReason) : null;
      return h('div', { class: 'records__toolbar' },
        h('div', { class: 'cluster cluster--sm' },
          actionButton(a.create, { icon: 'plus', variant: 'primary' }),
          actionButton(a.start, { icon: 'play' }),
          actionButton(a.edit, { icon: 'edit' }),
          actionButton(a.close, { icon: 'check' })),
        reasonEl);
    }

    /* ---------- detail ---------- */

    function buildDetail(model) {
      var d = model.detail;
      if (!d) return h('div', { class: 'inspector' }, h('div', { class: 'inspector__empty' }, molecules.emptyState({ text: uiText('emptySelection'), icon: 'project', compact: true })));
      var p = d.project;
      var sections = d.sections.map(function (s) {
        var content;
        switch (s.kind) {
          case 'gaps': content = [s.gaps.length ? h('div', { class: 'inspector__links' }, s.gaps.map(function (g) { return entityLink(g); })) : h('p', { class: 'muted' }, missingText()), s.note ? h('p', { class: 'panel-note' }, s.note) : null]; break;
          case 'facts': content = molecules.keyValue({ rows: s.facts.map(function (f) { return { label: f.label, value: f.value }; }), missingText: missingText() }); break;
          case 'version': content = [s.version ? molecules.entityLink({ entity: { id: s.version.id, name: s.version.label, type: 'version' }, typeLabel: s.version.typeLabel, icon: 'version', compact: true, meta: s.version.stateLabel, testid: 'project-version-' + s.version.id, badge: s.version.isDemo ? { label: uiText('labelDemoExample'), tone: 'demo' } : null,
            onOpen: function () { run({ type: 'enterProcess', payload: { processId: model.processId, view: 'flow', versionId: s.version.id } }); } }) : h('p', null, s.text)]; break;
          case 'commitments': content = s.items.length ? h('ul', { class: 'list' }, s.items.map(function (c) { return h('li', { class: 'list__item' }, c.label, ' · ', atoms.badge({ label: c.status, tone: 'neutral', icon: false })); })) : h('p', { class: 'muted' }, missingText()); break;
          case 'followUp': content = s.items.length ? h('ul', { class: 'timeline list' }, s.items.map(function (f) { return h('li', { class: 'list__item timeline__item' }, typeof f === 'string' ? f : [(f.at ? format.dateTime(f.at) + ' · ' : ''), f.text || f.label || f.action || jsonOf(f)]); })) : h('p', { class: 'muted' }, s.empty); break;
          default: content = [h('p', { class: s.text === missingText() ? 'muted' : null }, s.kind === 'text' && s.status ? statusNode(p) : s.text), s.entity ? h('div', null, entityLink(s.entity)) : null, s.result !== undefined && s.id === 'backing' ? molecules.keyValue({ rows: [{ label: uiText('result', 'Resultado'), value: s.result }], missingText: missingText() }) : null, s.note ? h('p', { class: 'panel-note' }, s.note) : null];
        }
        return h('section', { class: 'inspector__section', 'data-testid': 'project-section-' + s.id }, h('h4', { class: 'inspector__section-title' }, s.title), content);
      });
      var prep = model.actions.prepareAsIs;
      var sim = model.actions.simulateClose;
      var notes = model.prepareNotes || {};
      return h('div', { class: 'inspector', 'data-testid': 'project-detail', 'data-record-id': p.id },
        h('div', { class: 'inspector__header' },
          h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon(typeIconOf('project')), ' ', typeLabelOf('project')),
          h('h3', { class: 'inspector__title', tabindex: '-1', 'data-focus-key': 'project-detail-title' }, p.name),
          h('p', { class: 'inspector__subtitle mono' }, p.id + ' · ' + p.processName),
          h('div', { class: 'cluster cluster--sm' }, p.isDemo ? atoms.badge({ label: uiText('labelDemoExample'), tone: 'demo' }) : null, statusNode(p))),
        h('section', { class: 'inspector__section' }, h('h4', { class: 'inspector__section-title' }, uiText('objective', 'Objetivo')), h('p', { class: 'wrap-any' }, p.objective || missingText())),
        sections,
        h('div', { class: 'inspector__actions stack stack--sm' },
          h('div', { class: 'cluster cluster--sm' },
            sim ? actionButton(sim, { icon: 'send', variant: 'primary' }) : null,
            prep ? actionButton(prep, { icon: 'forward', variant: sim ? 'secondary' : 'primary' }) : null),
          notes.publishNote ? h('p', { class: 'panel-note text-sm' }, notes.publishNote) : null,
          notes.backingNote ? h('p', { class: 'panel-note text-sm' }, notes.backingNote) : null));
    }

    /* ---------- form ---------- */

    function fieldSpec(form, id) { var list = (form && form.fields) || []; for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return { id: id, label: uiText(id, id) }; }
    function fieldIds(form) { return form.mode === 'close' ? CLOSE_FIELDS : form.mode === 'edit' ? EDIT_FIELDS : CREATE_FIELDS; }
    function valueOf(form, id) { var key = VALUE_KEY[id]; var v = key ? form.values[key] : undefined; return v === null || v === undefined ? '' : v; }
    function errorOf(form, id) { var key = VALUE_KEY[id] || id; return (form.errors && (form.errors[key] || form.errors[id])) || null; }
    function updateValue(id, value) { dispatch('updateForm', { formId: FORM_ID, field: VALUE_KEY[id] || id, value: value }); }
    function counter(value, spec) { return spec && typeof spec.max === 'number' ? h('div', { class: 'form__counter', 'aria-hidden': 'true' }, String(String(value || '').length) + '/' + spec.max) : null; }
    function hintFor(spec) { if (!spec) return null; if (spec.format) return spec.format; if (typeof spec.min === 'number' && typeof spec.max === 'number') return msgText('MSG-05', { min: spec.min, max: spec.max }); return null; }

    function buildField(model, form, id) {
      var spec = fieldSpec(form, id);
      var inputId = 'project-field-' + id;
      var focusKey = 'field:project:' + id;
      var error = errorOf(form, id);
      var value = valueOf(form, id);
      var control;
      if (id === 'process') return h('div', { class: 'field' }, h('span', { class: 'field__label' }, h('span', { class: 'field__label-text' }, spec.label)), h('div', { class: 'form__readonly', 'data-testid': 'project-field-process' }, form.processName || model.processId));
      if (id === 'confirmed') {
        var box = atoms.checkbox({ id: inputId, label: form.closeConfirm || spec.label || uiText('confirm'), checked: !!form.values.confirmed, testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (checked) { updateValue(id, checked); } });
        return h('div', { class: 'field' }, box, error ? h('p', { class: 'field__error', id: inputId + '-error' }, icons.icon('error'), ' ', error) : null);
      }
      if (id === 'name') control = atoms.input({ id: inputId, value: value, testid: inputId, focusKey: focusKey, invalid: !!error, onInput: function (v) { updateValue(id, v); } });
      else if (id === 'objective' || id === 'result') control = atoms.textarea({ id: inputId, value: value, rows: 4, testid: inputId, focusKey: focusKey, invalid: !!error, onInput: function (v) { updateValue(id, v); } });
      else if (id === 'responsible') control = atoms.select({ id: inputId, value: value, options: model.responsibleOptions || [], testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (v) { updateValue(id, v); } });
      else if (id === 'status') control = atoms.select({ id: inputId, value: value, options: model.statusOptions || [], testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (v) { updateValue(id, v); } });
      else if (id === 'targetVersion') control = atoms.select({ id: inputId, value: value, options: (form.versionOptions || model.versionOptions || []).map(function (v) { return { value: v.id, label: v.label }; }), testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (v) { updateValue(id, v); } });
      else if (id === 'dueDate') control = atoms.input({ id: inputId, type: 'date', value: value, testid: inputId, focusKey: focusKey, invalid: !!error, placeholder: spec.format || null, pattern: '\\d{4}-\\d{2}-\\d{2}', inputmode: 'numeric', onInput: function (v) { updateValue(id, v); } });
      else control = atoms.input({ id: inputId, value: value, testid: inputId, focusKey: focusKey, invalid: !!error, onInput: function (v) { updateValue(id, v); } });
      var wrapper = h('div', null, control, (id === 'name' || id === 'objective' || id === 'result') ? counter(value, spec) : null);
      return atoms.field({ id: inputId, label: spec.label, hint: hintFor(spec), error: error, required: !!spec.required, control: wrapper });
    }

    function buildFormBody(model) {
      var form = model.form;
      var children = [];
      if (model.badge) children.push(h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: model.badge, tone: 'demo' })));
      if (form.mode !== 'create' && model.selected) children.push(h('p', { class: 'form__legend' }, model.selected.id + ' · ' + model.selected.name));
      if (form.mode === 'close' && model.texts && model.texts.closeHint) children.push(h('p', { class: 'panel-note' }, model.texts.closeHint));
      if (inst.formError) children.push(h('div', { class: 'form__errors', 'data-testid': 'project-form-error' }, molecules.notice({ text: inst.formError.text, tone: 'danger', role: 'alert', action: inst.formError.action || null })));
      var fields = fieldIds(form).map(function (id) { return buildField(model, form, id); });
      children.push(h('div', { class: 'form__row' }, fields.slice(0, 2)));
      if (fields.length > 2) children.push(h('div', { class: 'form__row' }, fields.slice(2)));
      return h('form', { class: 'form', novalidate: true, on: { submit: function (event) { event.preventDefault(); save(); } } }, children);
    }

    function formTitle(model) {
      var texts = model.texts || {};
      var form = model.form;
      if (form.mode === 'edit') return (texts.editProject || uiText('edit')) + (model.selected ? ' · ' + model.selected.id : '');
      if (form.mode === 'close') return texts.closeProject || uiText('close');
      return texts.newProject || uiText('create');
    }

    function focusFirstInvalid() {
      if (!inst.modalBody) return;
      var target = inst.modalBody.querySelector('[aria-invalid="true"]');
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }
    }

    function save() {
      var model = currentModel();
      var form = model && model.form;
      if (!form) return;
      var v = form.values || {};
      var result;
      if (form.mode === 'close') result = dispatch('closeProject', { id: form.recordId, result: v.result, confirmed: v.confirmed === true });
      else if (form.mode === 'edit') result = dispatch('updateProject', { id: form.recordId, objective: v.objective, responsibleId: v.responsibleId, dueDate: v.dueDate, status: v.status });
      else result = dispatch('createProject', { name: v.name, objective: v.objective, responsibleId: v.responsibleId, dueDate: v.dueDate, targetVersionId: v.targetVersionId });
      if (result.ok) { inst.formError = null; notifySaved(); return; }
      var err = result.error || {};
      if (err.code === 'validation') {
        var errors = err.errors || {};
        if (!Object.keys(errors).length && err.field) errors[err.field] = err.message;
        dispatch('setFormErrors', { formId: FORM_ID, errors: errors });
        inst.formError = null;
        update(inst.ctx);
        focusFirstInvalid();
        dom.announce(err.message || msgText('MSG-15'));
        return;
      }
      inst.formError = { text: err.message || msgText('MSG-12'), action: err.cta && err.cta.command ? { label: err.cta.label || err.action, onClick: function () { run(err.cta.command); } } : null };
      update(inst.ctx);
      dom.announce(inst.formError.text);
    }

    function confirmDiscard(onDiscard) {
      if (inst.confirmOpen) return;
      var texts = uiText('discardChanges', {}) || {};
      inst.confirmOpen = true;
      molecules.confirm({ id: 'project-discard', testid: 'project-discard', title: texts.title || '¿Descartar los cambios sin guardar?', text: '', confirmLabel: texts.discard || 'Descartar', cancelLabel: texts.keep || 'Seguir editando', confirmTestid: 'project-discard-confirm', cancelTestid: 'project-discard-cancel', danger: true,
        onConfirm: function () { inst.confirmOpen = false; onDiscard(); }, onCancel: function () { inst.confirmOpen = false; } });
    }

    function requestCancel() {
      var result = dispatch('closeForm', { formId: FORM_ID });
      if (result.ok) return;
      if (result.error && result.error.code === 'dirty') confirmDiscard(function () { dispatch('closeForm', { formId: FORM_ID, discard: true }); });
    }

    function openModal(model) {
      var form = model.form;
      inst.modalKey = form.id + ':' + form.mode + ':' + (form.recordId || '');
      var api = molecules.modal({ id: 'project-form', testid: form.testid || 'project-form', title: formTitle(model), eyebrow: typeLabelOf('project'), size: 'md', hideClose: true, body: buildFormBody(model),
        actions: [
          { label: model.cancelLabel || uiText('cancel'), variant: 'secondary', testid: 'project-cancel', onClick: function () { requestCancel(); } },
          { label: model.saveLabel || uiText('save'), variant: 'primary', icon: 'check', testid: 'project-save', onClick: function () { save(); } }
        ],
        onClose: function () {
          var silent = inst.closingSilently;
          inst.closingSilently = false; inst.modal = null; inst.modalBody = null; inst.modalKey = null;
          if (!silent) { var state = store.getState(); if (state.web && state.web.projects && state.web.projects.form) dispatch('closeForm', { formId: FORM_ID, discard: true }); }
          restoreOpenerFocus();
        } });
      api.el.addEventListener('keydown', function (event) { if (event.key !== 'Escape' && event.key !== 'Esc') return; event.preventDefault(); event.stopPropagation(); requestCancel(); }, true);
      inst.modal = api;
      inst.modalBody = api.dialog.querySelector('.modal__body');
      api.open();
    }

    function closeModalSilently() { if (!inst.modal) return; inst.closingSilently = true; inst.modal.close('store'); }

    function restoreOpenerFocus() {
      var key = inst.modalOpener; inst.modalOpener = null;
      if (!key || !inst.root || typeof document === 'undefined') return;
      var active = document.activeElement;
      if (active && inst.root.contains(active)) return;
      var target = inst.root.querySelector('[data-focus-key="' + key.replace(/"/g, '\\"') + '"]');
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }

    function syncModal(model) {
      var form = model.form;
      if (!form) { if (inst.modal) closeModalSilently(); inst.formError = null; inst.keys.form = null; return; }
      var key = form.id + ':' + form.mode + ':' + (form.recordId || '');
      if (inst.modal && inst.modalKey !== key) closeModalSilently();
      if (!inst.modal) { openModal(model); inst.keys.form = jsonOf([form, inst.formError]); return; }
      var next = jsonOf([form, inst.formError]);
      if (next === inst.keys.form) return;
      inst.keys.form = next;
      if (inst.modalBody) dom.preserveFocus(inst.modalBody, function () { dom.replace(inst.modalBody, buildFormBody(model)); });
    }

    /* ---------- restricted / render ---------- */

    function buildRestricted(model) {
      var notice = model.notice || {};
      var m = format.msg('MSG-02');
      return h('div', { class: 'records records--restricted' }, molecules.notice({ text: notice.text || (typeof m === 'string' ? m : m.text), tone: 'warning', testid: 'web-notice', action: { label: notice.action || (typeof m === 'object' && m.action) || uiText('backToOrganization'), testid: 'web-notice-action', onClick: function () { dispatch('backToOrganization', {}); } } }));
    }

    function currentModel() { return typeof inst.ctx.select === 'function' ? inst.ctx.select('projectsModel') : store.select('projectsModel'); }

    function buildHeader(model) {
      return h('div', { class: 'records__header' }, h('div', { class: 'stack stack--xs' },
        h('h2', { class: 'records__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'projects-title' }, model.title || ''),
        h('div', { class: 'cluster cluster--sm' }, model.badge ? atoms.badge({ label: model.badge, tone: 'demo' }) : null, model.dateLabel ? h('span', { class: 'text-sm muted' }, icons.icon('calendar'), ' ', model.dateLabel) : null)));
    }

    function mountRoot(model) {
      inst.regions = {};
      if (!model.permitted) { inst.root = buildRestricted(model); inst.keys = { restricted: jsonOf(model.notice) }; dom.replace(stageEl, inst.root); return; }
      inst.regions.header = buildHeader(model);
      inst.regions.actions = buildActions(model);
      inst.regions.table = buildList(model);
      inst.regions.detail = buildDetail(model);
      inst.regions.list = h('div', { class: 'records__list' }, inst.regions.header, inst.regions.actions, inst.regions.table);
      inst.regions.detailWrap = h('aside', { class: 'records__detail', 'aria-label': typeLabelOf('project') }, inst.regions.detail);
      inst.root = h('div', { class: 'records records--projects', 'data-testid': 'projects-view' }, inst.regions.list, inst.regions.detailWrap);
      inst.keys = { permitted: true, actions: jsonOf([model.actions, model.canTrack, model.permissionReason, model.selectedId]), table: jsonOf(model.projects.map(function (p) { return [p.id, p.name, p.statusLabel, p.dueDateText, p.targetVersionLabel, p.selected, p.responsibleName]; })), detail: jsonOf([model.detail, model.actions.prepareAsIs, model.actions.simulateClose, model.prepareNotes]) };
      dom.replace(stageEl, inst.root);
      syncModal(model);
    }

    function swap(name, next) { var prev = inst.regions[name]; if (prev && prev.parentNode) prev.parentNode.replaceChild(next, prev); inst.regions[name] = next; }

    function update(nextCtx) {
      inst.ctx = nextCtx || inst.ctx;
      var model = currentModel();
      if (!inst.root || inst.root.parentNode !== stageEl || !!model.permitted !== !!inst.keys.permitted) { mountRoot(model); return; }
      if (!model.permitted) { var rk = jsonOf(model.notice); if (rk !== inst.keys.restricted) mountRoot(model); return; }
      dom.preserveFocus(inst.root, function () {
        var k = jsonOf([model.actions, model.canTrack, model.permissionReason, model.selectedId]);
        if (k !== inst.keys.actions) { inst.keys.actions = k; swap('actions', buildActions(model)); }
        k = jsonOf(model.projects.map(function (p) { return [p.id, p.name, p.statusLabel, p.dueDateText, p.targetVersionLabel, p.selected, p.responsibleName]; }));
        if (k !== inst.keys.table) { inst.keys.table = k; dom.preserveScroll(inst.regions.table, function () { swap('table', buildList(model)); }); }
        k = jsonOf([model.detail, model.actions.prepareAsIs, model.actions.simulateClose, model.prepareNotes]);
        if (k !== inst.keys.detail) { inst.keys.detail = k; dom.preserveScroll(inst.regions.detailWrap, function () { swap('detail', buildDetail(model)); }); }
      });
      syncModal(model);
    }

    inst.update = update;
    inst.destroy = function () { closeModalSilently(); };
    return inst;
  }

  function render(stageEl, ctx) {
    if (!stageEl || !ctx || !ctx.store) return null;
    var inst = cache ? cache.get(stageEl) : stageEl.__primusProjects;
    if (!inst || inst.store !== ctx.store) {
      if (inst && typeof inst.destroy === 'function') inst.destroy();
      inst = create(stageEl, ctx);
      inst.store = ctx.store;
      if (cache) cache.set(stageEl, inst); else stageEl.__primusProjects = inst;
    }
    inst.update(ctx);
    return inst;
  }

  return { id: 'projects', render: render };
});
