/* features/web/incidents — WEB-08 «Incidencias de emisión de boletas» (spec §10.4, §14.2–14.4,
 * §16.5, FR-017, JRN-07, AT-14…AT-16, AT-28).
 *
 * Stage module: render(stageEl, ctx) is called on every store change while the incidents
 * process view is active. The module keeps its DOM per stageEl (WeakMap) and re-renders only
 * the regions whose part of `incidentsModel` changed (toolbar, table, detail, form modal),
 * always through dom.preserveFocus. Every visible string comes from the pack (tracking.*,
 * presentation.ui, messages) through the selector; nothing is written with innerHTML. */
Primus.module('features/web/incidents', function (require) {
  'use strict';

  var cache = typeof WeakMap === 'function' ? new WeakMap() : null;
  var FORM_ID = 'incident';
  var TABLE_ID = 'incidents';
  var SEARCH_DEBOUNCE_MS = 120;
  var CREATE_FIELDS = ['subject', 'description', 'process', 'responsible', 'dueDate', 'status'];
  var CLOSE_FIELDS = ['resolution'];
  /* form field id → command payload / state key */
  var VALUE_KEY = { subject: 'subject', description: 'description', responsible: 'responsibleId', dueDate: 'dueDate', status: 'status', resolution: 'resolution' };

  function jsonOf(value) {
    try { return JSON.stringify(value === undefined ? null : value); } catch (e) { return String(Math.random()); }
  }

  function packCore() {
    try { return require('core/pack'); } catch (e) { return null; }
  }

  function typeLabelOf(type) {
    var core = packCore();
    return core && typeof core.typeLabel === 'function' ? core.typeLabel(type) : type;
  }

  function typeIconOf(type) {
    var core = packCore();
    return core && typeof core.typeIcon === 'function' ? core.typeIcon(type) : type;
  }

  function create(stageEl, ctx) {
    var dom = ctx.dom || require('core/dom');
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var format = ctx.format || ctx.store.format;
    var store = ctx.store;
    var h = dom.h;

    var inst = {
      root: null,
      regions: {},
      keys: {},
      modal: null,
      modalKey: null,
      modalBody: null,
      modalOpener: null,
      closingSilently: false,
      confirmOpen: false,
      formError: null,
      searchTimer: null,
      announcedCount: null,
      ctx: ctx
    };

    function uiText(key, fallback) {
      var table = inst.ctx.ui || (inst.ctx.pack && inst.ctx.pack.ui) || {};
      var v = table[key];
      if (v === null || v === undefined) return fallback === undefined ? key : fallback;
      return v;
    }

    function dispatch(type, payload) {
      if (typeof inst.ctx.dispatch === 'function') return inst.ctx.dispatch(type, payload);
      return store.dispatch(type, payload);
    }

    function msgText(id, params) {
      if (format && typeof format.msgText === 'function') return format.msgText(id, params);
      var m = format.msg(id, params);
      return typeof m === 'string' ? m : (m && m.text) || id;
    }

    function missingText() { return format.missing(); }

    /* ---------- toasts / announcements ---------- */

    function notifySaved() {
      var text = msgText('MSG-09');
      dispatch('pushToast', { text: text, tone: 'success', messageId: 'MSG-09' });
      dom.announce(text);
    }

    /* ---------- entity links ---------- */

    function entityLink(ref, extra) {
      if (!ref) return null;
      var opts = Object.assign({
        entity: { id: ref.id, name: ref.name, type: ref.type },
        typeLabel: ref.typeLabel || typeLabelOf(ref.type),
        icon: ref.icon || typeIconOf(ref.type),
        showType: true,
        onOpen: function () { dispatch('selectEntity', { entityId: ref.id }); }
      }, extra || {});
      return molecules.entityLink(opts);
    }

    /* ---------- toolbar (filters, search, actions) ---------- */

    function actionButton(action, extra) {
      if (!action) return null;
      var opts = Object.assign({
        label: action.label,
        testid: action.id,
        focusKey: 'action:' + action.id,
        disabled: !action.enabled,
        onClick: function () { runAction(action); }
      }, extra || {});
      return atoms.button(opts);
    }

    function runAction(action) {
      if (!action || !action.enabled || !action.command) return;
      if (action.command.type === 'openForm') {
        inst.modalOpener = currentFocusKey();
        openForm(action.command.payload);
        return;
      }
      dispatch(action.command.type, action.command.payload);
    }

    function currentFocusKey() {
      var active = typeof document !== 'undefined' ? document.activeElement : null;
      if (active && inst.root && inst.root.contains(active)) {
        return active.getAttribute('data-focus-key') || null;
      }
      return null;
    }

    function openForm(payload) {
      var result = dispatch('openForm', payload);
      if (result.ok) { inst.formError = null; return result; }
      if (result.error && result.error.code === 'dirty') {
        confirmDiscard(function () { dispatch('openForm', Object.assign({}, payload, { discard: true })); });
        return result;
      }
      if (result.error && result.error.message) dom.announce(result.error.message);
      return result;
    }

    function scheduleQuery(value) {
      var timers = store.timers;
      if (timers && typeof timers.set === 'function') {
        if (inst.searchTimer !== null) timers.clear(inst.searchTimer);
        inst.searchTimer = timers.set(function () {
          inst.searchTimer = null;
          dispatch('setIncidentQuery', { query: value });
        }, SEARCH_DEBOUNCE_MS, 'ui:incidents-search');
      } else {
        dispatch('setIncidentQuery', { query: value });
      }
    }

    function clearQuery() {
      var timers = store.timers;
      if (timers && inst.searchTimer !== null) { timers.clear(inst.searchTimer); inst.searchTimer = null; }
      dispatch('setIncidentQuery', { query: '' });
    }

    function buildSearch(model) {
      var field = molecules.searchField({
        id: 'incident-search',
        testid: 'incident-search',
        clearTestid: 'incident-search-clear',
        resultsTestid: 'incident-search-results',
        label: uiText('search'),
        placeholder: model.searchPlaceholder || uiText('searchPlaceholder'),
        value: model.query || '',
        resultsText: model.countText || ' ',
        onInput: function (value) { scheduleQuery(value); },
        onClear: function () {
          clearQuery();
          if (field.control) field.control.value = '';
          var clearBtn = field.querySelector('.search-field__clear');
          if (clearBtn) clearBtn.hidden = true;
        }
      });
      field.classList.add('records__search');
      return field;
    }

    function syncSearch(model) {
      var field = inst.regions.search;
      if (!field) return;
      var input = field.control;
      var active = typeof document !== 'undefined' ? document.activeElement : null;
      if (input && active !== input && input.value !== (model.query || '')) input.value = model.query || '';
      var clearBtn = field.querySelector('.search-field__clear');
      if (clearBtn) clearBtn.hidden = !(input && input.value);
      var results = field.querySelector('.search-field__results');
      if (results) dom.setText(results, model.countText || '');
    }

    function buildFilters(model) {
      var buttons = (model.filters || []).map(function (f) {
        return atoms.button({
          label: f.label,
          variant: 'ghost',
          size: 'sm',
          pressed: !!f.selected,
          testid: f.testid || ('incident-filter-' + f.id),
          focusKey: 'filter:' + f.id,
          extraClass: 'records__filter',
          onClick: function () { dispatch('setIncidentFilter', { filterId: f.id }); }
        });
      });
      return h('div', { class: 'records__filters', role: 'group', 'aria-label': uiText('appliedFilters', 'Filtros') }, buttons);
    }

    function buildActions(model) {
      var a = model.actions || {};
      var reasonId = null;
      var reasonEl = null;
      if (!model.canTrack && model.permissionReason) {
        reasonId = 'incident-permission-reason';
        reasonEl = h('p', { class: 'panel-note text-sm', id: reasonId, 'data-testid': 'incident-permission-reason' },
          icons.icon('lock', { extraClass: 'panel-note__icon' }), ' ', model.permissionReason);
      }
      function extras(action, iconName, variant) {
        var o = { icon: iconName, variant: variant || 'secondary', size: 'sm' };
        if (!action.enabled && reasonId) o.attrs = { 'aria-describedby': reasonId, title: model.permissionReason };
        else if (!action.enabled && action.reason) o.disabledReason = action.reason;
        else if (!action.enabled && !model.selectedId) o.attrs = { title: uiText('emptySelection') };
        return o;
      }
      return h('div', { class: 'records__toolbar' },
        h('div', { class: 'cluster cluster--sm' },
          actionButton(a.create, extras(a.create || {}, 'plus', 'primary')),
          actionButton(a.edit, extras(a.edit || {}, 'edit')),
          actionButton(a.close, extras(a.close || {}, 'check'))),
        reasonEl);
    }

    /* ---------- table ---------- */

    function statusNode(row) {
      var tone = row.status === 'closed' ? 'neutral' : row.status === 'inProgress' ? 'brand' : 'info';
      return molecules.statusLabel({ label: row.statusLabel, tone: tone });
    }

    function noticeNode(notice) {
      if (!notice) return dom.text(missingText());
      return atoms.badge({ label: notice.label, tone: notice.tone || 'neutral', icon: notice.alert ? undefined : false });
    }

    function buildTable(model) {
      var columns = (model.columns || []).map(function (c) {
        return { id: c.id, label: c.label, sortable: c.sortable !== false, testid: 'incident-sort-' + c.id };
      });
      var rows = (model.rows || []).map(function (r) {
        return {
          key: r.id,
          testid: r.testid || ('incident-' + r.id),
          focusKey: 'row:' + r.id,
          selected: !!r.selected,
          isDemo: !!r.isDemo,
          entityId: null,
          onSelect: function () { dispatch('selectIncident', { id: r.selected ? null : r.id }); },
          cells: [
            { text: r.id, mono: true },
            { text: r.subject },
            { text: r.processName },
            { text: r.responsibleName },
            { node: statusNode(r) },
            { text: r.dueDateText },
            { node: noticeNode(r.notice) }
          ]
        };
      });
      var table = molecules.table({
        id: 'incidents-table',
        testid: 'incidents-table',
        caption: model.title || '',
        captionHidden: true,
        columns: columns,
        rows: rows,
        sort: model.sort && model.sort.column ? model.sort : null,
        cardMode: true,
        onSort: function (columnId, direction) { dispatch('setTableSort', { tableId: TABLE_ID, column: columnId, direction: direction }); },
        emptyText: model.empty ? model.empty.text : uiText('noData')
      });
      var parts = [table];
      if (model.empty && model.empty.action) {
        var act = model.empty.action;
        parts.push(molecules.emptyState({
          text: model.empty.text,
          icon: 'filter',
          compact: true,
          action: {
            label: act.label,
            testid: 'incident-clear-filters',
            onClick: function () {
              if (act.command) dispatch(act.command.type, act.command.payload);
              if (act.secondary) dispatch(act.secondary.type, act.secondary.payload);
              clearQuery();
            }
          }
        }));
      }
      return h('div', { class: 'records__table stack stack--sm' }, parts);
    }

    /* ---------- detail ---------- */

    function buildDetail(model) {
      var inc = model.selected;
      if (!inc) {
        return h('div', { class: 'inspector' },
          h('div', { class: 'inspector__empty' },
            molecules.emptyState({ text: uiText('emptySelection'), icon: 'incident', compact: true })));
      }
      var facts = [
        { label: uiText('id'), value: inc.id, mono: true },
        { label: uiText('status'), value: statusNode(inc) },
        { label: uiText('created', 'Creada'), value: inc.createdAtText },
        { label: uiText('dueDate'), value: inc.dueDateText },
        { label: uiText('notices', 'Avisos'), value: noticeNode(inc.notice) },
        { label: uiText('closed', 'Cerrada'), value: inc.status === 'closed' ? inc.closedAtText : null },
        { label: (model.texts && model.texts.resolutionLabel) || uiText('resolution', 'Resultado de atención'), value: inc.status === 'closed' ? inc.resolutionText : null }
      ];
      var links = [];
      if (model.process) links.push(entityLink(model.process, { relationLabel: uiText('process') }));
      if (inc.responsible) links.push(entityLink(inc.responsible, { relationLabel: uiText('responsible') }));
      (inc.gaps || []).forEach(function (g) { links.push(entityLink(g, { relationLabel: uiText('gaps') })); });
      return h('div', { class: 'inspector', 'data-testid': 'incident-detail', 'data-record-id': inc.id },
        h('div', { class: 'inspector__header' },
          h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon(typeIconOf('incident')), ' ', typeLabelOf('incident')),
          h('h3', { class: 'inspector__title', tabindex: '-1', 'data-focus-key': 'incident-detail-title' }, inc.subject),
          h('p', { class: 'inspector__subtitle mono' }, inc.id),
          inc.isDemo ? h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: uiText('labelDemoExample'), tone: 'demo' })) : null),
        h('section', { class: 'inspector__section' },
          h('h4', { class: 'inspector__section-title' }, uiText('description')),
          h('p', { class: 'wrap-any' }, inc.description || missingText())),
        h('section', { class: 'inspector__section' },
          h('h4', { class: 'inspector__section-title' }, uiText('facts')),
          molecules.keyValue({ rows: facts, missingText: missingText() })),
        h('section', { class: 'inspector__section' },
          h('h4', { class: 'inspector__section-title' }, uiText('relatedEntities')),
          links.length ? h('div', { class: 'inspector__links' }, links) : h('p', { class: 'muted' }, msgText('MSG-10'))));
    }

    /* ---------- form modal ---------- */

    function fieldSpec(form, id) {
      var list = (form && form.fields) || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return { id: id, label: id };
    }

    function fieldIds(form) {
      return form.mode === 'close' ? CLOSE_FIELDS : CREATE_FIELDS;
    }

    function valueOf(form, id) {
      var key = VALUE_KEY[id];
      var v = key ? form.values[key] : undefined;
      return v === null || v === undefined ? '' : v;
    }

    function errorOf(form, id) {
      var key = VALUE_KEY[id] || id;
      return (form.errors && (form.errors[key] || form.errors[id])) || null;
    }

    function updateValue(id, value) {
      dispatch('updateForm', { formId: FORM_ID, field: VALUE_KEY[id] || id, value: value });
    }

    function counter(value, spec) {
      if (!spec || typeof spec.max !== 'number') return null;
      return h('div', { class: 'form__counter', 'aria-hidden': 'true' }, String(String(value || '').length) + '/' + spec.max);
    }

    function hintFor(spec) {
      if (!spec) return null;
      if (spec.format) return spec.format;
      if (typeof spec.min === 'number' && typeof spec.max === 'number') return msgText('MSG-05', { min: spec.min, max: spec.max });
      return null;
    }

    function buildField(model, form, id) {
      var spec = fieldSpec(form, id);
      var inputId = 'incident-field-' + id;
      var focusKey = 'field:incident:' + id;
      var error = errorOf(form, id);
      var value = valueOf(form, id);
      var control;
      if (id === 'process') {
        return h('div', { class: 'field' },
          h('span', { class: 'field__label' }, h('span', { class: 'field__label-text' }, spec.label)),
          h('div', { class: 'form__readonly', 'data-testid': 'incident-field-process' }, form.processName || model.processId));
      }
      if (id === 'status' && form.mode !== 'edit') {
        var initialLabel = (model.statusLabels || {})[value] || value;
        return h('div', { class: 'field' },
          h('span', { class: 'field__label' }, h('span', { class: 'field__label-text' }, spec.label)),
          h('div', { class: 'form__readonly', 'data-testid': 'incident-field-status' }, initialLabel));
      }
      if (id === 'subject') {
        control = atoms.input({ id: inputId, value: value, testid: inputId, focusKey: focusKey, invalid: !!error,
          onInput: function (v) { updateValue(id, v); } });
      } else if (id === 'description' || id === 'resolution') {
        control = atoms.textarea({ id: inputId, value: value, rows: 4, testid: inputId, focusKey: focusKey, invalid: !!error,
          onInput: function (v) { updateValue(id, v); } });
      } else if (id === 'responsible') {
        control = atoms.select({ id: inputId, value: value, options: model.responsibleOptions || [], testid: inputId, focusKey: focusKey, invalid: !!error,
          onChange: function (v) { updateValue(id, v); } });
      } else if (id === 'status') {
        control = atoms.select({ id: inputId, value: value, options: model.statusOptions || [], testid: inputId, focusKey: focusKey, invalid: !!error,
          onChange: function (v) { updateValue(id, v); } });
      } else if (id === 'dueDate') {
        control = atoms.input({ id: inputId, type: 'text', value: value, testid: inputId, focusKey: focusKey, invalid: !!error,
          placeholder: spec.format || 'YYYY-MM-DD', pattern: '\\d{4}-\\d{2}-\\d{2}', inputmode: 'numeric', maxlength: 10,
          onInput: function (v) { updateValue(id, v); } });
      } else {
        control = atoms.input({ id: inputId, value: value, testid: inputId, focusKey: focusKey, invalid: !!error,
          onInput: function (v) { updateValue(id, v); } });
      }
      var wrapper = h('div', null, control, (id === 'subject' || id === 'description' || id === 'resolution') ? counter(value, spec) : null);
      return atoms.field({ id: inputId, label: spec.label, hint: hintFor(spec), error: error, required: !!spec.required, control: wrapper });
    }

    function buildFormBody(model) {
      var form = model.form;
      var children = [];
      if (model.badge) children.push(h('div', { class: 'cluster cluster--sm' }, atoms.badge({ label: model.badge, tone: 'demo' })));
      if (form.mode !== 'create' && model.selected) {
        children.push(h('p', { class: 'form__legend' }, model.selected.id + ' · ' + model.selected.subject));
      }
      if (inst.formError) {
        children.push(h('div', { class: 'form__errors', 'data-testid': 'incident-form-error' },
          molecules.notice({ text: inst.formError.text, tone: 'danger', role: 'alert',
            action: inst.formError.action ? { label: inst.formError.action.label, onClick: inst.formError.action.onClick } : null })));
      }
      var ids = fieldIds(form);
      var fields = ids.map(function (id) { return buildField(model, form, id); });
      children.push(h('div', { class: 'form__row' }, fields.slice(0, 2)));
      if (fields.length > 2) children.push(h('div', { class: 'form__row' }, fields.slice(2)));
      return h('form', { class: 'form', novalidate: true, on: { submit: function (event) { event.preventDefault(); save(); } } }, children);
    }

    function formTitle(model) {
      var texts = model.texts || {};
      var form = model.form;
      if (form.mode === 'edit') return (texts.editIncident || uiText('edit')) + (model.selected ? ' · ' + model.selected.id : '');
      if (form.mode === 'close') return texts.closeIncident || uiText('close');
      return texts.newIncident || uiText('create');
    }

    function focusFirstInvalid() {
      if (!inst.modal || !inst.modalBody) return;
      var target = inst.modalBody.querySelector('[aria-invalid="true"]');
      if (target && typeof target.focus === 'function') {
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
      }
    }

    function save() {
      var model = currentModel();
      var form = model && model.form;
      if (!form) return;
      var v = form.values || {};
      var result;
      if (form.mode === 'close') {
        result = dispatch('closeIncident', { id: form.recordId, resolution: v.resolution });
      } else if (form.mode === 'edit') {
        result = dispatch('updateIncident', { id: form.recordId, subject: v.subject, description: v.description, responsibleId: v.responsibleId, dueDate: v.dueDate, status: v.status });
      } else {
        result = dispatch('createIncident', { subject: v.subject, description: v.description, responsibleId: v.responsibleId, dueDate: v.dueDate });
      }
      if (result.ok) {
        inst.formError = null;
        notifySaved();
        return;
      }
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
      inst.formError = {
        text: err.message || msgText('MSG-12'),
        action: err.cta && err.cta.command ? { label: err.cta.label || err.action, onClick: function () { dispatch(err.cta.command, {}); } } : null
      };
      update(inst.ctx);
      dom.announce(inst.formError.text);
    }

    function confirmDiscard(onDiscard) {
      if (inst.confirmOpen) return;
      var texts = uiText('discardChanges', {});
      inst.confirmOpen = true;
      molecules.confirm({
        id: 'incident-discard',
        testid: 'incident-discard',
        title: (texts && texts.title) || '¿Descartar los cambios sin guardar?',
        text: '',
        confirmLabel: (texts && texts.discard) || 'Descartar',
        cancelLabel: (texts && texts.keep) || 'Seguir editando',
        confirmTestid: 'incident-discard-confirm',
        cancelTestid: 'incident-discard-cancel',
        danger: true,
        onConfirm: function () { inst.confirmOpen = false; onDiscard(); },
        onCancel: function () { inst.confirmOpen = false; }
      });
    }

    function requestCancel() {
      var result = dispatch('closeForm', { formId: FORM_ID });
      if (result.ok) return;
      if (result.error && result.error.code === 'dirty') {
        confirmDiscard(function () { dispatch('closeForm', { formId: FORM_ID, discard: true }); });
      }
    }

    function openModal(model) {
      var form = model.form;
      inst.modalKey = form.id + ':' + form.mode + ':' + (form.recordId || '');
      var api = molecules.modal({
        id: 'incident-form',
        testid: form.testid || 'incident-form',
        title: formTitle(model),
        eyebrow: typeLabelOf('incident'),
        size: 'md',
        hideClose: true,
        body: buildFormBody(model),
        actions: [
          { label: model.cancelLabel || uiText('cancel'), variant: 'secondary', testid: 'incident-cancel', onClick: function () { requestCancel(); } },
          { label: model.saveLabel || uiText('save'), variant: 'primary', icon: 'check', testid: 'incident-save', onClick: function () { save(); } }
        ],
        onClose: function () {
          var wasSilent = inst.closingSilently;
          inst.closingSilently = false;
          inst.modal = null;
          inst.modalBody = null;
          inst.modalKey = null;
          if (!wasSilent) {
            /* closed by the component itself (defensive): keep the store consistent */
            var state = store.getState();
            if (state.web && state.web.incidents && state.web.incidents.form) dispatch('closeForm', { formId: FORM_ID, discard: true });
          }
          restoreOpenerFocus();
        }
      });
      /* Escape must go through the dirty check before the dialog closes itself. */
      api.el.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' && event.key !== 'Esc') return;
        event.preventDefault();
        event.stopPropagation();
        requestCancel();
      }, true);
      inst.modal = api;
      inst.modalBody = api.dialog.querySelector('.modal__body');
      api.open();
    }

    function closeModalSilently() {
      if (!inst.modal) return;
      inst.closingSilently = true;
      inst.modal.close('store');
    }

    function restoreOpenerFocus() {
      var key = inst.modalOpener;
      inst.modalOpener = null;
      if (!key || !inst.root || typeof document === 'undefined') return;
      var active = document.activeElement;
      if (active && inst.root.contains(active)) return;
      var target = inst.root.querySelector('[data-focus-key="' + key.replace(/"/g, '\\"') + '"]');
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }

    function syncModal(model) {
      var form = model.form;
      if (!form) {
        if (inst.modal) closeModalSilently();
        inst.formError = null;
        inst.keys.form = null;
        return;
      }
      var key = form.id + ':' + form.mode + ':' + (form.recordId || '');
      if (inst.modal && inst.modalKey !== key) closeModalSilently();
      if (!inst.modal) {
        openModal(model);
        inst.keys.form = jsonOf([form, inst.formError]);
        return;
      }
      var next = jsonOf([form, inst.formError]);
      if (next === inst.keys.form) return;
      inst.keys.form = next;
      var body = inst.modalBody;
      if (!body) return;
      dom.preserveFocus(body, function () { dom.replace(body, buildFormBody(model)); });
    }

    /* ---------- restricted ---------- */

    function buildRestricted(model) {
      var notice = model.notice || {};
      var m = format.msg('MSG-02');
      var text = notice.text || (typeof m === 'string' ? m : m.text);
      var actionLabel = notice.action || (typeof m === 'object' && m.action) || uiText('backToOrganization');
      return h('div', { class: 'records records--restricted' },
        molecules.notice({ text: text, tone: 'warning', testid: 'web-notice',
          action: { label: actionLabel, testid: 'web-notice-action', onClick: function () { dispatch('backToOrganization', {}); } } }));
    }

    /* ---------- model + render ---------- */

    function currentModel() {
      if (typeof inst.ctx.select === 'function') return inst.ctx.select('incidentsModel');
      return store.select('incidentsModel');
    }

    function buildHeader(model) {
      return h('div', { class: 'records__header' },
        h('div', { class: 'stack stack--xs' },
          h('h2', { class: 'records__title', tabindex: '-1', 'data-focus-key': 'stage-heading:incidents', 'data-testid': 'incidents-title' }, model.title || ''),
          h('div', { class: 'cluster cluster--sm' },
            model.badge ? atoms.badge({ label: model.badge, tone: 'demo' }) : null,
            model.dateLabel ? h('span', { class: 'text-sm muted', 'data-testid': 'incidents-date' }, icons.icon('calendar'), ' ', model.dateLabel) : null)));
    }

    function mountRoot(model) {
      inst.regions = {};
      if (!model.permitted) {
        inst.root = buildRestricted(model);
        inst.keys = { restricted: jsonOf(model.notice) };
        dom.replace(stageEl, inst.root);
        return;
      }
      inst.regions.header = buildHeader(model);
      inst.regions.actions = buildActions(model);
      inst.regions.filters = buildFilters(model);
      inst.regions.search = buildSearch(model);
      inst.regions.table = buildTable(model);
      inst.regions.summary = h('p', { class: 'records__summary', 'data-testid': 'incidents-count' }, model.countText || '');
      inst.regions.detail = buildDetail(model);
      inst.regions.list = h('div', { class: 'records__list' },
        inst.regions.header,
        inst.regions.actions,
        h('div', { class: 'records__toolbar' }, inst.regions.filters, inst.regions.search),
        inst.regions.summary,
        inst.regions.table);
      inst.regions.detailWrap = h('aside', { class: 'records__detail', 'aria-label': typeLabelOf('incident') }, inst.regions.detail);
      inst.root = h('div', { class: 'records records--incidents', 'data-testid': 'incidents-view' }, inst.regions.list, inst.regions.detailWrap);
      inst.keys = {
        permitted: true,
        actions: jsonOf([model.actions, model.canTrack, model.permissionReason, model.selectedId]),
        filters: jsonOf(model.filters),
        table: tableKey(model),
        count: model.countText,
        detail: jsonOf([model.selected, model.process])
      };
      inst.announcedCount = model.countText;
      dom.replace(stageEl, inst.root);
      syncModal(model);
    }

    function tableKey(model) {
      return jsonOf([model.sort, model.empty, (model.rows || []).map(function (r) {
        return [r.id, r.subject, r.processName, r.responsibleName, r.statusLabel, r.dueDateText, r.notice && r.notice.id, r.selected];
      })]);
    }

    function swap(regionName, nextEl) {
      var prev = inst.regions[regionName];
      if (prev && prev.parentNode) prev.parentNode.replaceChild(nextEl, prev);
      inst.regions[regionName] = nextEl;
    }

    function update(nextCtx) {
      inst.ctx = nextCtx || inst.ctx;
      var model = currentModel();
      if (!inst.root || inst.root.parentNode !== stageEl || !!model.permitted !== !!inst.keys.permitted) {
        mountRoot(model);
        return;
      }
      if (!model.permitted) {
        var rk = jsonOf(model.notice);
        if (rk !== inst.keys.restricted) mountRoot(model);
        return;
      }
      dom.preserveFocus(inst.root, function () {
        var k;
        k = jsonOf([model.actions, model.canTrack, model.permissionReason, model.selectedId]);
        if (k !== inst.keys.actions) { inst.keys.actions = k; swap('actions', buildActions(model)); }
        k = jsonOf(model.filters);
        if (k !== inst.keys.filters) { inst.keys.filters = k; swap('filters', buildFilters(model)); }
        syncSearch(model);
        k = tableKey(model);
        if (k !== inst.keys.table) {
          inst.keys.table = k;
          dom.preserveScroll(inst.regions.table, function () { swap('table', buildTable(model)); });
        }
        if (model.countText !== inst.keys.count) {
          inst.keys.count = model.countText;
          dom.setText(inst.regions.summary, model.countText || '');
        }
        k = jsonOf([model.selected, model.process]);
        if (k !== inst.keys.detail) {
          inst.keys.detail = k;
          dom.preserveScroll(inst.regions.detailWrap, function () { swap('detail', buildDetail(model)); });
        }
      });
      if (model.countText !== inst.announcedCount) {
        inst.announcedCount = model.countText;
        if (model.query || model.filter !== 'all') dom.announce(model.countText);
      }
      syncModal(model);
    }

    inst.update = update;
    inst.destroy = function () {
      closeModalSilently();
      if (store.timers && inst.searchTimer !== null) store.timers.clear(inst.searchTimer);
    };
    return inst;
  }

  function render(stageEl, ctx) {
    if (!stageEl || !ctx || !ctx.store) return null;
    var inst = cache ? cache.get(stageEl) : stageEl.__primusIncidents;
    if (!inst || inst.store !== ctx.store) {
      if (inst && typeof inst.destroy === 'function') inst.destroy();
      inst = create(stageEl, ctx);
      inst.store = ctx.store;
      if (cache) cache.set(stageEl, inst); else stageEl.__primusIncidents = inst;
    }
    inst.update(ctx);
    return inst;
  }

  return { id: 'incidents', render: render };
});
