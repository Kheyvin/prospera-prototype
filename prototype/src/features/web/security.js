/* features/web/security — WEB-10 «Usuarios y accesos» (spec §10.4, §16.6, FR-016, JRN-12,
 * AT-27). Admin-only module: the test-account table with «Crear usuario» / «Editar acceso» /
 * «Desactivar» / «Eliminar usuario de prueba» (confirmations through molecules.confirm, last
 * active admin blocked by the command store), the session audit log (sequence, demo date,
 * actor profile, action, result) and the informative access matrix of §5.2. Other profiles
 * see «Esta vista requiere un perfil administrador» and a way back. */
Primus.module('features/web/security', function (require) {
  'use strict';

  var cache = typeof WeakMap === 'function' ? new WeakMap() : null;
  var FORM_ID = 'account';
  var FIELDS = ['username', 'role', 'position'];
  var VALUE_KEY = { username: 'username', role: 'role', position: 'positionId' };

  function jsonOf(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }

  function create(stageEl, ctx) {
    var dom = ctx.dom, atoms = ctx.atoms, molecules = ctx.molecules, icons = ctx.icons, format = ctx.format, store = ctx.store, h = dom.h;
    var inst = { root: null, regions: {}, keys: {}, modal: null, modalKey: null, modalBody: null, closingSilently: false, confirmOpen: false, formError: null, ctx: ctx };

    function uiText(key, fallback) {
      var table = inst.ctx.ui || (inst.ctx.pack && inst.ctx.pack.ui) || {};
      var v = table[key];
      if (v === null || v === undefined) { try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ } return fallback === undefined ? key : fallback; }
      return v;
    }
    function dispatch(type, payload) { return typeof inst.ctx.dispatch === 'function' ? inst.ctx.dispatch(type, payload) : store.dispatch(type, payload); }
    function msgText(id, params) { var m = format.msg(id, params); return typeof m === 'string' ? m : (m && m.text) || id; }
    function missingText() { return format.missing(); }
    function notifySaved() { var text = msgText('MSG-09'); dispatch('pushToast', { text: text, tone: 'success', messageId: 'MSG-09' }); dom.announce(text); }
    function currentModel() { return typeof inst.ctx.select === 'function' ? inst.ctx.select('securityModel') : store.select('securityModel'); }

    /* ---------- nav ---------- */

    function buildNav(model) {
      var tabs = molecules.tabs({ id: 'security-views', mode: 'local', selectedId: model.view, ariaLabel: model.title || uiText('usersAndAccess'),
        tabs: model.views.map(function (v) { return { id: v.id, label: v.label, testid: 'security-view-' + v.id, focusKey: 'security:view:' + v.id }; }),
        onSelect: function (id) { dispatch('setSecurityView', { view: id }); } });
      inst.panelAttrs = tabs.panelAttrs;
      return h('div', { class: 'security__nav' }, tabs.el,
        h('div', { class: 'cluster cluster--sm' }, atoms.button({ label: uiText('backToOrganization'), variant: 'ghost', size: 'sm', icon: 'back', testid: 'security-back', focusKey: 'security:back', onClick: function () { dispatch('backToOrganization', {}); } })));
    }

    function buildHeader(model) {
      return h('div', { class: 'records__header' }, h('div', { class: 'stack stack--xs' },
        h('h2', { class: 'records__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'security-title' }, model.title || ''),
        model.intro ? h('p', { class: 'text-sm muted' }, model.intro) : null,
        model.note ? h('p', { class: 'panel-note' }, icons.icon('info'), ' ', model.note) : null));
    }

    /* ---------- accounts ---------- */

    function confirmAction(text, testid, onConfirm) {
      if (inst.confirmOpen) return;
      inst.confirmOpen = true;
      molecules.confirm({ id: testid, testid: testid, title: text, text: '', confirmLabel: uiText('confirm'), cancelLabel: uiText('cancel'), confirmTestid: testid + '-confirm', cancelTestid: testid + '-cancel', danger: true,
        onConfirm: function () { inst.confirmOpen = false; onConfirm(); }, onCancel: function () { inst.confirmOpen = false; } });
    }

    function runAccountAction(row, action) {
      if (!action.enabled) return;
      if (action.command.type === 'openForm') { openForm(action.command.payload); return; }
      var text = action.id === 'account-delete' ? row.confirmTexts['delete'] : row.confirmTexts.deactivate;
      var go = function () {
        var r = dispatch(action.command.type, action.command.payload);
        if (r.ok) notifySaved(); else if (r.error && r.error.message) { dom.announce(r.error.message); dispatch('pushToast', { text: r.error.message, tone: 'danger', messageId: r.error.messageId || null }); }
      };
      if (text) confirmAction(text, action.id + '-' + row.id, go); else go();
    }

    function accountActions(row) {
      return h('div', { class: 'cluster cluster--sm' }, ['edit', 'deactivate', 'delete'].map(function (k) {
        var a = row.actions[k];
        if (!a) return null;
        return atoms.button({ label: a.label, variant: 'ghost', size: 'sm', icon: k === 'edit' ? 'edit' : k === 'deactivate' ? 'lock' : 'trash', testid: a.id + '-' + row.id, focusKey: 'account-action:' + k + ':' + row.id,
          disabled: !a.enabled, disabledReason: !a.enabled && a.reason ? a.reason : null, onClick: function () { runAccountAction(row, a); } });
      }));
    }

    function buildAccounts(model) {
      var cols = model.accountColumns;
      var rows = model.accounts.map(function (a) {
        return { key: a.id, testid: a.testid, focusKey: 'row:' + a.id, selected: !!a.selected, isDemo: !!a.isTest, onSelect: function () { dispatch('selectAccount', { id: a.selected ? null : a.id }); },
          cells: [{ text: a.id, mono: true }, { text: a.username, mono: true }, { text: a.roleLabel }, { node: a.position ? molecules.entityLink({ entity: { id: a.position.id, name: a.position.name, type: 'position' }, typeLabel: a.position.typeLabel, icon: 'position', compact: true, testid: 'account-position-' + a.id, onOpen: function () { dispatch('selectEntity', { entityId: a.position.id }); } }) : dom.text(a.positionName) }, { node: molecules.statusLabel({ label: a.statusLabel, tone: a.active ? 'success' : 'neutral' }) }],
          actions: accountActions(a) };
      });
      var create = model.actions.create;
      return h('div', { class: 'stack stack--sm', 'data-testid': 'security-accounts' },
        h('div', { class: 'records__toolbar' }, atoms.button({ label: create.label, variant: 'primary', size: 'sm', icon: 'plus', testid: 'account-new', focusKey: 'action:account-new', disabled: !create.enabled, disabledReason: !create.enabled ? create.reason : null, onClick: function () { openForm(create.command.payload); } }),
          model.credentialNote ? h('p', { class: 'panel-note text-sm' }, icons.icon('lock'), ' ', model.credentialNote) : null),
        molecules.table({ id: 'accounts-table', testid: 'accounts-table', caption: model.title || '', captionHidden: true,
          columns: [{ id: 'id', label: cols[0] || uiText('id') }, { id: 'username', label: cols[1] || uiText('name') }, { id: 'role', label: cols[2] || uiText('role') }, { id: 'position', label: cols[3] || uiText('position') }, { id: 'status', label: cols[4] || uiText('status') }],
          rows: rows, sort: null, cardMode: true, emptyText: uiText('noData'), actionsColumn: { label: uiText('actions') } }));
    }

    /* ---------- audit ---------- */

    function buildAudit(model) {
      var cols = model.auditColumns;
      var rows = model.audit.slice().reverse().map(function (e) {
        return { key: e.seq, testid: e.testid, cells: [{ text: String(e.seq), mono: true }, { text: e.atText }, { text: e.profileLabel }, { text: e.action }, { text: e.result || missingText() }] };
      });
      return h('div', { class: 'stack stack--sm', 'data-testid': 'security-audit' },
        molecules.table({ id: 'audit-table', testid: 'audit-table', caption: cols.join(' · '), captionHidden: true,
          columns: [{ id: 'seq', label: cols[0] || '#' }, { id: 'at', label: cols[1] || uiText('date') }, { id: 'profile', label: cols[2] || uiText('profile') }, { id: 'action', label: cols[3] || uiText('actions') }, { id: 'result', label: cols[4] || uiText('result') }],
          rows: rows, sort: null, cardMode: true, dense: true, emptyText: model.auditEmpty || uiText('noData') }));
    }

    /* ---------- access matrix (informative) ---------- */

    function buildMatrix(model) {
      var demo = (inst.ctx.pack && inst.ctx.pack.raw && inst.ctx.pack.raw.demo) || {};
      var matrix = Array.isArray(demo.accessMatrix) ? demo.accessMatrix : [];
      if (!matrix.length) return null;
      var roles = ['admin', 'manager', 'employee', 'owner'];
      var labels = { admin: model.roleLabels.admin || 'admin', manager: model.roleLabels.manager || 'manager', employee: model.roleLabels.employee || 'employee', owner: uiText('ownerProfile', 'Responsable de proceso') };
      function cell(v, row) { return v === true ? h('span', { class: 'security__matrix-yes' }, icons.icon('check'), ' ', uiText('yes')) : h('span', { class: 'security__matrix-no' }, row.note && !roles.some(function (r) { return row[r]; }) ? row.note : uiText('no')); }
      return h('details', { class: 'security__matrix disclosure', 'data-testid': 'access-matrix' },
        h('summary', { class: 'disclosure__summary' }, uiText('accessMatrix', 'Matriz de acceso de la demo')),
        molecules.table({ id: 'access-matrix', caption: uiText('accessMatrix', 'Matriz de acceso de la demo'), captionHidden: true, dense: true, cardMode: true, sort: null, emptyText: uiText('noData'),
          columns: [{ id: 'action', label: uiText('actions'), rowHeader: true }].concat(roles.map(function (r) { return { id: r, label: labels[r] }; })),
          rows: matrix.map(function (row) { return { key: row.action, cells: [{ text: row.label }].concat(roles.map(function (r) { return { node: cell(row[r], row) }; })) }; }) }));
    }

    /* ---------- form ---------- */

    function fieldSpec(form, id) { var list = (form && form.fields) || []; for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return { id: id, label: uiText(id, id) }; }
    function valueOf(form, id) { var v = form.values[VALUE_KEY[id]]; return v === null || v === undefined ? '' : v; }
    function errorOf(form, id) { var key = VALUE_KEY[id]; return (form.errors && (form.errors[key] || form.errors[id])) || null; }
    function updateValue(id, value) { dispatch('updateForm', { formId: FORM_ID, field: VALUE_KEY[id], value: id === 'position' ? (value || null) : value }); }

    function buildField(model, form, id) {
      var spec = fieldSpec(form, id);
      var inputId = 'account-field-' + id;
      var focusKey = 'field:account:' + id;
      var error = errorOf(form, id);
      var value = valueOf(form, id);
      var control, hint = null;
      if (id === 'username') { control = atoms.input({ id: inputId, value: value, testid: inputId, focusKey: focusKey, invalid: !!error, disabled: form.mode === 'edit', readOnly: form.mode === 'edit', autocomplete: 'off', onInput: function (v) { updateValue(id, v); } }); hint = spec.rule || null; }
      else if (id === 'role') control = atoms.select({ id: inputId, value: value, options: model.roleOptions, testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (v) { updateValue(id, v); } });
      else control = atoms.select({ id: inputId, value: value || '', options: model.positionOptions.map(function (o) { return { value: o.value === null ? '' : o.value, label: o.label }; }), testid: inputId, focusKey: focusKey, invalid: !!error, onChange: function (v) { updateValue(id, v); } });
      return atoms.field({ id: inputId, label: spec.label, hint: hint, error: error, required: !!spec.required, control: control });
    }

    function buildFormBody(model) {
      var form = model.form;
      var children = [];
      if (model.credentialNote) children.push(h('p', { class: 'panel-note text-sm' }, model.credentialNote));
      if (inst.formError) children.push(h('div', { class: 'form__errors', 'data-testid': 'account-form-error' }, molecules.notice({ text: inst.formError.text, tone: 'danger', role: 'alert' })));
      var fields = FIELDS.map(function (id) { return buildField(model, form, id); });
      children.push(h('div', { class: 'form__row' }, fields));
      return h('form', { class: 'form', novalidate: true, on: { submit: function (event) { event.preventDefault(); save(); } } }, children);
    }

    function save() {
      var model = currentModel();
      var form = model && model.form;
      if (!form) return;
      var v = form.values || {};
      var result = form.mode === 'edit' ? dispatch('updateDemoUser', { id: form.recordId, role: v.role, positionId: v.positionId || null }) : dispatch('createDemoUser', { username: v.username, role: v.role, positionId: v.positionId || null });
      if (result.ok) { inst.formError = null; notifySaved(); return; }
      var err = result.error || {};
      if (err.code === 'validation' || err.code === 'last-admin' || err.field) {
        var errors = err.errors || {};
        if (!Object.keys(errors).length && err.field) errors[err.field] = err.message;
        if (!Object.keys(errors).length) errors.role = err.message;
        dispatch('setFormErrors', { formId: FORM_ID, errors: errors });
        inst.formError = null;
        update(inst.ctx);
        var target = inst.modalBody && inst.modalBody.querySelector('[aria-invalid="true"]');
        if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
        dom.announce(err.message || msgText('MSG-15'));
        return;
      }
      inst.formError = { text: err.message || msgText('MSG-12') };
      update(inst.ctx);
      dom.announce(inst.formError.text);
    }

    function confirmDiscard(onDiscard) {
      if (inst.confirmOpen) return;
      var texts = uiText('discardChanges', {}) || {};
      inst.confirmOpen = true;
      molecules.confirm({ id: 'account-discard', testid: 'account-discard', title: texts.title || '¿Descartar los cambios sin guardar?', text: '', confirmLabel: texts.discard || 'Descartar', cancelLabel: texts.keep || 'Seguir editando', danger: true,
        onConfirm: function () { inst.confirmOpen = false; onDiscard(); }, onCancel: function () { inst.confirmOpen = false; } });
    }

    function openForm(payload) {
      var result = dispatch('openForm', payload);
      if (result.ok) { inst.formError = null; return; }
      if (result.error && result.error.code === 'dirty') confirmDiscard(function () { dispatch('openForm', Object.assign({}, payload, { discard: true })); });
      else if (result.error && result.error.message) dom.announce(result.error.message);
    }

    function requestCancel() {
      var result = dispatch('closeForm', { formId: FORM_ID });
      if (result.ok) return;
      if (result.error && result.error.code === 'dirty') confirmDiscard(function () { dispatch('closeForm', { formId: FORM_ID, discard: true }); });
    }

    function openModal(model) {
      var form = model.form;
      inst.modalKey = form.id + ':' + form.mode + ':' + (form.recordId || '');
      var api = molecules.modal({ id: 'account-form', testid: 'account-form', title: form.mode === 'edit' ? (model.selected ? model.selected.username : uiText('edit')) : model.actions.create.label, eyebrow: uiText('usersAndAccess'), size: 'md', hideClose: true, body: buildFormBody(model),
        actions: [
          { label: model.cancelLabel || uiText('cancel'), variant: 'secondary', testid: 'account-cancel', onClick: function () { requestCancel(); } },
          { label: model.saveLabel || uiText('save'), variant: 'primary', icon: 'check', testid: 'account-save', onClick: function () { save(); } }
        ],
        onClose: function () {
          var silent = inst.closingSilently;
          inst.closingSilently = false; inst.modal = null; inst.modalBody = null; inst.modalKey = null;
          if (!silent) { var state = store.getState(); if (state.web && state.web.security && state.web.security.form) dispatch('closeForm', { formId: FORM_ID, discard: true }); }
        } });
      api.el.addEventListener('keydown', function (event) { if (event.key !== 'Escape' && event.key !== 'Esc') return; event.preventDefault(); event.stopPropagation(); requestCancel(); }, true);
      inst.modal = api;
      inst.modalBody = api.dialog.querySelector('.modal__body');
      api.open();
    }

    function closeModalSilently() { if (!inst.modal) return; inst.closingSilently = true; inst.modal.close('store'); }

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
      return h('div', { class: 'security security--restricted' }, molecules.notice({ text: model.restricted || notice.text || msgText('MSG-02'), tone: 'warning', role: 'alert', testid: 'web-notice',
        action: { label: notice.action || uiText('backToOrganization'), testid: 'web-notice-action', onClick: function () { dispatch('backToOrganization', {}); } } }));
    }

    function buildView(model) {
      var attrs = inst.panelAttrs ? inst.panelAttrs(model.view) : {};
      return h('div', Object.assign({ class: 'security__view' }, attrs), model.view === 'audit' ? buildAudit(model) : buildAccounts(model));
    }

    function mountRoot(model) {
      inst.regions = {};
      if (!model.permitted) { inst.root = buildRestricted(model); inst.keys = { restricted: jsonOf([model.notice, model.restricted]) }; dom.replace(stageEl, inst.root); return; }
      inst.regions.header = buildHeader(model);
      inst.regions.nav = buildNav(model);
      inst.regions.view = buildView(model);
      inst.regions.matrix = buildMatrix(model) || h('div');
      inst.root = h('div', { class: 'security', 'data-testid': 'security-view' }, inst.regions.header, inst.regions.nav, inst.regions.view, inst.regions.matrix);
      inst.keys = { permitted: true, nav: jsonOf([model.view, model.views]), view: viewKey(model) };
      dom.replace(stageEl, inst.root);
      syncModal(model);
    }

    function viewKey(model) { return jsonOf([model.view, model.accounts, model.audit, model.actions, model.auditEmpty, model.credentialNote]); }
    function swap(name, next) { var prev = inst.regions[name]; if (prev && prev.parentNode) prev.parentNode.replaceChild(next, prev); inst.regions[name] = next; }

    function update(nextCtx) {
      inst.ctx = nextCtx || inst.ctx;
      var model = currentModel();
      if (!inst.root || inst.root.parentNode !== stageEl || !!model.permitted !== !!inst.keys.permitted) { mountRoot(model); return; }
      if (!model.permitted) { var rk = jsonOf([model.notice, model.restricted]); if (rk !== inst.keys.restricted) mountRoot(model); return; }
      dom.preserveFocus(inst.root, function () {
        var k = jsonOf([model.view, model.views]);
        if (k !== inst.keys.nav) { inst.keys.nav = k; swap('nav', buildNav(model)); }
        k = viewKey(model);
        if (k !== inst.keys.view) { inst.keys.view = k; dom.preserveScroll(inst.root, function () { swap('view', buildView(model)); }); }
      });
      syncModal(model);
    }

    inst.update = update;
    inst.destroy = function () { closeModalSilently(); };
    return inst;
  }

  function render(stageEl, ctx) {
    if (!stageEl || !ctx || !ctx.store) return null;
    var inst = cache ? cache.get(stageEl) : stageEl.__primusSecurity;
    if (!inst || inst.store !== ctx.store) {
      if (inst && typeof inst.destroy === 'function') inst.destroy();
      inst = create(stageEl, ctx);
      inst.store = ctx.store;
      if (cache) cache.set(stageEl, inst); else stageEl.__primusSecurity = inst;
    }
    inst.update(ctx);
    return inst;
  }

  return { id: 'security', render: render };
});
