/* core/commands/security — demo accounts and the local audit log (CONTRACTS §6 "Security",
 * spec §10.4 WEB-10, §16.6, FR-016).
 *
 * Accounts are fictitious test records: no passwords, no e-mail. Rules: username
 * /^[a-z0-9._-]{3,40}$/ after trim + lowercase; duplicates are rejected ignoring case and
 * surrounding spaces (MSG-07); employees need a position; the last active administrator can
 * never be deactivated, demoted or deleted (MSG-08); only isTest accounts can be deleted; every
 * action is logged. Validation failures throw before any mutation. */
Primus.module('core/commands/security', function (require) {
  'use strict';

  var USERNAME_RE = /^[a-z0-9._-]{3,40}$/;
  var ROLES = ['admin', 'manager', 'employee'];
  var ACTIONS = {
    create: 'Crear usuario',
    update: 'Editar acceso',
    deactivate: 'Desactivar usuario',
    delete: 'Eliminar usuario de prueba'
  };

  function web() { return require('core/commands/web').helpers; }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }
  function securityOf(pack) { return raw(pack).security || {}; }
  function businessDate(pack) {
    var demo = raw(pack).demo || {};
    return demo.businessDate || null;
  }

  function recordIn(list, id) {
    if (!Array.isArray(list) || id === null || id === undefined) return undefined;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return undefined;
  }

  function sanitize(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  }

  function normalizeUsername(value) {
    return sanitize(value).trim().toLowerCase();
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function nextId(ctx) {
    var counters = ctx.state.demo.counters || (ctx.state.demo.counters = {});
    var n = typeof counters.account === 'number' ? counters.account : 1;
    counters.account = n + 1;
    return 'ACCOUNT-' + pad2(n);
  }

  function usernameRule(ctx) {
    var form = securityOf(ctx.pack).form;
    var field = form && form.fields && form.fields.username;
    return {
      min: field && typeof field.min === 'number' ? field.min : 3,
      max: field && typeof field.max === 'number' ? field.max : 40,
      text: (field && field.rule) || null
    };
  }

  function requiredError(ctx, field) {
    return { field: field, code: 'required', messageId: 'MSG-04', message: ctx.format.msgText('MSG-04') };
  }

  function failValidation(ctx, errors) {
    var list = errors.filter(Boolean);
    if (!list.length) return;
    var first = list[0];
    var map = {};
    list.forEach(function (e) { if (!map[e.field]) map[e.field] = e.message; });
    ctx.fail('validation', first.message, {
      field: first.field,
      messageId: first.messageId || undefined,
      params: first.params || undefined,
      errors: map,
      details: { errors: map, params: first.params || null, reason: first.code }
    });
  }

  function assertManage(ctx) {
    return web().assertCan(ctx, 'manageAccounts');
  }

  function appendLog(ctx, action, result) {
    if (typeof ctx.log === 'function') return ctx.log(action, result);
    var state = ctx.state;
    var log = state.demo.log || (state.demo.log = []);
    var last = log.length ? log[log.length - 1] : null;
    var store = ctx.store || {};
    var at = typeof store.tick === 'function' ? store.tick() : (typeof store.now === 'function' ? store.now() : null);
    var entry = { seq: last && typeof last.seq === 'number' ? last.seq + 1 : log.length + 1, at: at, profileId: state.app ? state.app.profileId : null, action: action, result: result };
    log.push(entry);
    return entry;
  }

  function nowOf(ctx) {
    var store = ctx.store || {};
    return typeof store.now === 'function' ? store.now() : null;
  }

  function accountOf(ctx, id) {
    var record = recordIn(ctx.state.demo.accounts, id);
    if (!record) ctx.fail('unknown-record', 'Cuenta no encontrada: ' + id, { field: 'id' });
    return record;
  }

  function activeAdmins(ctx, excludeId) {
    return (ctx.state.demo.accounts || []).filter(function (a) {
      return a && a.role === 'admin' && a.status === 'active' && a.id !== excludeId;
    });
  }

  function lastAdminError(ctx) {
    return { field: 'role', code: 'last-admin', messageId: 'MSG-08', message: ctx.format.msgText('MSG-08') };
  }

  function usernameError(ctx, value, excludeId) {
    var rule = usernameRule(ctx);
    var username = normalizeUsername(value);
    if (!username) return requiredError(ctx, 'username');
    if (username.length < rule.min || username.length > rule.max) {
      return { field: 'username', code: 'length', messageId: 'MSG-05', message: ctx.format.msgText('MSG-05', { min: rule.min, max: rule.max }), params: { min: rule.min, max: rule.max } };
    }
    if (!USERNAME_RE.test(username)) {
      return { field: 'username', code: 'invalid-username', messageId: null, message: rule.text || 'Nombre de acceso no válido' };
    }
    var duplicate = (ctx.state.demo.accounts || []).some(function (a) {
      return a && a.id !== excludeId && normalizeUsername(a.username) === username;
    });
    if (duplicate) return { field: 'username', code: 'duplicate', messageId: 'MSG-07', message: ctx.format.msgText('MSG-07') };
    return null;
  }

  function roleError(ctx, value) {
    var role = sanitize(value).trim();
    if (!role) return requiredError(ctx, 'role');
    if (ROLES.indexOf(role) === -1) return { field: 'role', code: 'invalid-role', messageId: null, message: 'Rol no válido: ' + role };
    return null;
  }

  function positionError(ctx, role, positionId) {
    var id = positionId === null || positionId === undefined ? null : sanitize(positionId).trim() || null;
    if (!id) return role === 'employee' ? requiredError(ctx, 'positionId') : null;
    var entity = web().entityOf(ctx.pack, id);
    if (!entity || entity.type !== 'position') {
      return { field: 'positionId', code: 'unknown-position', messageId: 'MSG-13', message: ctx.format.msgText('MSG-13') };
    }
    return null;
  }

  function closeWebForm(ctx, selectionId) {
    var w = ctx.state.web;
    if (!w || !w.security) return;
    w.security.form = null;
    if (selectionId !== undefined) w.security.selectionId = selectionId;
  }

  function publicRecord(record) {
    return JSON.parse(JSON.stringify(record));
  }

  var commands = {

    /* createDemoUser {username, role, positionId|null} → ACCOUNT-0N, active, isTest */
    createDemoUser: function (ctx, payload) {
      var p = payload || {};
      assertManage(ctx);
      var role = sanitize(p.role).trim();
      failValidation(ctx, [
        usernameError(ctx, p.username, null),
        roleError(ctx, p.role),
        ROLES.indexOf(role) !== -1 ? positionError(ctx, role, p.positionId) : null
      ]);
      var positionId = p.positionId === null || p.positionId === undefined ? null : sanitize(p.positionId).trim() || null;
      var record = {
        id: nextId(ctx),
        username: normalizeUsername(p.username),
        role: role,
        positionId: positionId,
        status: 'active',
        isTest: true,
        isDemo: true,
        createdAt: businessDate(ctx.pack),
        createdBy: ctx.state.app ? ctx.state.app.profileId : null,
        createdAtClock: nowOf(ctx),
        updatedAt: null
      };
      ctx.state.demo.accounts.push(record);
      closeWebForm(ctx, record.id);
      appendLog(ctx, ACTIONS.create, record.id + ' · ' + record.username);
      return { id: record.id, record: publicRecord(record) };
    },

    /* updateDemoUser {id, role, positionId|null}: edits access; never the username */
    updateDemoUser: function (ctx, payload) {
      var p = payload || {};
      assertManage(ctx);
      var record = accountOf(ctx, p.id);
      var role = p.role === undefined ? record.role : sanitize(p.role).trim();
      var positionGiven = p.positionId !== undefined;
      var positionId = positionGiven ? (p.positionId === null ? null : sanitize(p.positionId).trim() || null) : record.positionId;
      var errors = [roleError(ctx, role)];
      if (ROLES.indexOf(role) !== -1) errors.push(positionError(ctx, role, positionId));
      if (record.role === 'admin' && record.status === 'active' && role !== 'admin' && activeAdmins(ctx, record.id).length === 0) {
        errors.push(lastAdminError(ctx));
      }
      failValidation(ctx, errors);
      var changed = [];
      if (role !== record.role) { record.role = role; changed.push('role'); }
      if (positionId !== record.positionId) { record.positionId = positionId; changed.push('positionId'); }
      record.updatedAt = nowOf(ctx);
      closeWebForm(ctx, record.id);
      appendLog(ctx, ACTIONS.update, record.id + ' · ' + record.username);
      return { id: record.id, changed: changed, record: publicRecord(record) };
    },

    /* deactivateDemoUser {id}: active → inactive; never the last active admin (MSG-08) */
    deactivateDemoUser: function (ctx, payload) {
      var p = payload || {};
      assertManage(ctx);
      var record = accountOf(ctx, p.id);
      if (record.status !== 'active') ctx.fail('already-inactive', 'La cuenta ya está desactivada', { field: 'id' });
      if (record.role === 'admin' && activeAdmins(ctx, record.id).length === 0) {
        var err = lastAdminError(ctx);
        ctx.fail('last-admin', err.message, { field: 'id', messageId: err.messageId, errors: { id: err.message }, details: { errors: { id: err.message } } });
      }
      record.status = 'inactive';
      record.deactivatedAt = businessDate(ctx.pack);
      record.updatedAt = nowOf(ctx);
      closeWebForm(ctx, record.id);
      appendLog(ctx, ACTIONS.deactivate, record.id + ' · ' + record.username);
      return { id: record.id, status: record.status };
    },

    /* deleteDemoUser {id}: removes an isTest account; the audit log is kept */
    deleteDemoUser: function (ctx, payload) {
      var p = payload || {};
      assertManage(ctx);
      var record = accountOf(ctx, p.id);
      if (!record.isTest) ctx.fail('not-test-account', 'Solo se eliminan cuentas de prueba', { field: 'id' });
      if (record.role === 'admin' && record.status === 'active' && activeAdmins(ctx, record.id).length === 0) {
        var err = lastAdminError(ctx);
        ctx.fail('last-admin', err.message, { field: 'id', messageId: err.messageId, errors: { id: err.message }, details: { errors: { id: err.message } } });
      }
      ctx.state.demo.accounts = ctx.state.demo.accounts.filter(function (a) { return a.id !== record.id; });
      var w = ctx.state.web;
      if (w && w.security) {
        w.security.form = null;
        if (w.security.selectionId === record.id) w.security.selectionId = null;
      }
      appendLog(ctx, ACTIONS.delete, record.id + ' · ' + record.username);
      return { id: record.id, deleted: true, username: record.username };
    }
  };

  return {
    commands: commands,
    ACTIONS: ACTIONS,
    USERNAME_RE: USERNAME_RE,
    ROLES: ROLES,
    helpers: {
      normalizeUsername: normalizeUsername,
      activeAdmins: activeAdmins
    }
  };
});
