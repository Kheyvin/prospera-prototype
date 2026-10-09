/* core/commands/desktop — workspaces, drafts, modes, playback, reviews and forms of the
 * analyst studio (CONTRACTS §6 "Desktop", spec §10.5).
 *
 * Thin command layer over core/scenarios: every command resolves the session, delegates to
 * the engine (ctx.scenarios, or the store's instance) and converts engine errors into
 * CommandErrors through ctx.fail so the store rolls the draft back. Logged actions
 * (rejections) are written here because the engine has no ctx. */
Primus.module('core/commands/desktop', function (require) {
  'use strict';

  var PAUSE_REASONS = ['hidden', 'tab', 'workspace', 'profile', 'manual'];
  var REJECT_ACTION = 'Rechazar propuesta';

  var engineCache = typeof WeakMap === 'function' ? new WeakMap() : null;

  function web() { return require('core/commands/web').helpers; }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }
  function desktopOf(pack) { return raw(pack).desktop || {}; }

  function recordIn(list, id) {
    if (!Array.isArray(list) || id === null || id === undefined) return undefined;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return undefined;
  }

  function sanitize(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  }

  function engineOf(ctx) {
    if (ctx.scenarios && typeof ctx.scenarios.start === 'function') return ctx.scenarios;
    var store = ctx.store;
    if (store && store.scenarios && typeof store.scenarios.start === 'function') return store.scenarios;
    if (!store) throw new Error('core/commands/desktop: ctx.store is required');
    if (engineCache) {
      var cached = engineCache.get(store);
      if (cached) return cached;
      var created = require('core/scenarios').createScenarioEngine(store);
      engineCache.set(store, created);
      return created;
    }
    return require('core/scenarios').createScenarioEngine(store);
  }

  /* Runs an engine call and re-throws its failures through ctx.fail (keeps code/field/messageId). */
  function run(ctx, fn) {
    try {
      return fn();
    } catch (err) {
      if (err && err.isCommandError && typeof ctx.fail === 'function' && !(err.name === 'CommandError' && err.fromFail)) {
        ctx.fail(err.code || 'error', err.message, {
          field: err.field,
          messageId: err.messageId,
          action: err.action,
          cta: err.cta,
          details: err.details || (err.reasons ? { reasons: err.reasons } : undefined),
          reasons: err.reasons,
          status: err.status
        });
      }
      throw err;
    }
  }

  function workspaceOf(ctx, id) {
    var pack = ctx.pack;
    if (pack && pack.workspaces && typeof pack.workspaces.get === 'function') return pack.workspaces.get(id);
    return recordIn(desktopOf(pack).workspaces || [], id);
  }

  function workspaceOfSession(ctx, sessionId) {
    var pack = ctx.pack;
    var list = pack && pack.workspaces && typeof pack.workspaces.values === 'function' ? Array.from(pack.workspaces.values()) : (desktopOf(pack).workspaces || []);
    for (var i = 0; i < list.length; i++) if (list[i].sessionId === sessionId) return list[i];
    return undefined;
  }

  function requireSessionId(ctx, payload) {
    var sessionId = payload && typeof payload.sessionId === 'string' ? payload.sessionId : null;
    if (!sessionId) {
      var workspace = ctx.state.desktop ? workspaceOf(ctx, ctx.state.desktop.workspaceId) : null;
      sessionId = workspace ? workspace.sessionId : null;
    }
    if (!sessionId) ctx.fail('invalid-payload', 'Falta el campo sessionId', { field: 'sessionId' });
    return sessionId;
  }

  function sessionOf(ctx, sessionId) {
    var session = ctx.state.desktop && ctx.state.desktop.sessions ? ctx.state.desktop.sessions[sessionId] : null;
    if (!session) ctx.fail('unknown-session', 'Sesión desconocida: ' + sessionId, { field: 'sessionId' });
    return session;
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

  function evidenceOf(ctx, id) {
    var pack = ctx.pack;
    if (pack && pack.evidence && typeof pack.evidence.get === 'function') return pack.evidence.get(id);
    return recordIn(desktopOf(pack).evidence || [], id);
  }

  var commands = {

    /* selectWorkspace {workspaceId}: pauses the previous session's running playback */
    selectWorkspace: function (ctx, payload) {
      var id = payload && payload.workspaceId;
      var workspace = workspaceOf(ctx, id);
      if (!workspace) ctx.fail('unknown-workspace', 'Espacio desconocido: ' + id, { field: 'workspaceId' });
      var desktop = ctx.state.desktop;
      if (desktop.workspaceId === workspace.id) return { workspaceId: workspace.id, sessionId: workspace.sessionId, changed: false, paused: [] };
      var previous = workspaceOf(ctx, desktop.workspaceId);
      var paused = previous && previous.sessionId ? web().pauseSessions(ctx, 'workspace', ['running'], [previous.sessionId]) : [];
      desktop.workspaceId = workspace.id;
      desktop.navigation = null;
      return { workspaceId: workspace.id, sessionId: workspace.sessionId, changed: true, paused: paused };
    },

    /* setSessionMode {sessionId, mode}: chat | ops; drafts, cursor and review are untouched */
    setSessionMode: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      var modes = (desktopOf(ctx.pack).modes || []).map(function (m) { return m.id; });
      if (!modes.length) modes = ['chat', 'ops'];
      var mode = payload && payload.mode;
      if (modes.indexOf(mode) === -1) ctx.fail('invalid-mode', 'Modo desconocido: ' + mode, { field: 'mode' });
      session.mode = mode;
      return { sessionId: sessionId, mode: mode };
    },

    /* setDraft {sessionId, text}: per-session composer draft */
    setDraft: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      session.draft = sanitize(payload ? payload.text : '');
      return { sessionId: sessionId, draft: session.draft };
    },

    /* submitDraft {sessionId}: trigger prompt → start; anything else → unsupported reply, draft kept */
    submitDraft: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.submitDraft(ctx.state, { sessionId: sessionId, text: payload ? payload.text : undefined }); });
    },

    startScenario: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var scenarioId = payload && payload.scenarioId;
      if (!scenarioId) ctx.fail('invalid-payload', 'Falta el campo scenarioId', { field: 'scenarioId' });
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.start(ctx.state, { sessionId: sessionId, scenarioId: scenarioId, errorMode: payload.errorMode }); });
    },

    continueScenario: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.continueStep(ctx.state, { sessionId: sessionId }); });
    },

    stopScenario: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.stop(ctx.state, { sessionId: sessionId }); });
    },

    /* pauseScenario {sessionId?, reason}: hidden tab / workspace switch / profile change; no-op when nothing runs */
    pauseScenario: function (ctx, payload) {
      var p = payload || {};
      var reason = typeof p.reason === 'string' && p.reason ? p.reason : 'hidden';
      if (PAUSE_REASONS.indexOf(reason) === -1) reason = 'hidden';
      var engine = engineOf(ctx);
      var sessions = ctx.state.desktop && ctx.state.desktop.sessions ? ctx.state.desktop.sessions : {};
      var ids = p.sessionId ? [p.sessionId] : Object.keys(sessions);
      var paused = [];
      ids.forEach(function (sessionId) {
        if (!sessions[sessionId]) {
          if (p.sessionId) ctx.fail('unknown-session', 'Sesión desconocida: ' + sessionId, { field: 'sessionId' });
          return;
        }
        var result = run(ctx, function () { return engine.pause(ctx.state, { sessionId: sessionId, reason: reason }); });
        if (result && result.paused) paused.push(sessionId);
      });
      return { paused: paused, reason: reason, messageId: paused.length ? 'MSG-19' : null };
    },

    retryScenario: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.retry(ctx.state, { sessionId: sessionId }); });
    },

    /* restartScenario {sessionId}: discards transcript, review, form and unpublished staging (UI confirms first) */
    restartScenario: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.restart(ctx.state, { sessionId: sessionId }); });
    },

    setErrorMode: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      var mode = payload && payload.errorMode !== undefined ? payload.errorMode : null;
      return run(ctx, function () { return engine.setErrorMode(ctx.state, { sessionId: sessionId, errorMode: mode }); });
    },

    /* toggleTool {sessionId, eventId}: expands/collapses a tool card (eventId or callId) */
    toggleTool: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      var eventId = payload && payload.eventId;
      if (typeof eventId !== 'string' || !eventId) ctx.fail('invalid-payload', 'Falta el campo eventId', { field: 'eventId' });
      if (!session.expandedTools || typeof session.expandedTools !== 'object') session.expandedTools = {};
      var next = payload.expanded !== undefined ? !!payload.expanded : !session.expandedTools[eventId];
      if (next) session.expandedTools[eventId] = true; else delete session.expandedTools[eventId];
      return { sessionId: sessionId, eventId: eventId, expanded: next };
    },

    setReviewField: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.setReviewField(ctx.state, { sessionId: sessionId, field: payload.field, value: payload.value }); });
    },

    restoreReviewText: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.restoreReviewText(ctx.state, { sessionId: sessionId }); });
    },

    /* resolveReview {sessionId, decision: approve|reject|cancel, fields?} */
    resolveReview: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      var decision = payload && payload.decision;
      if (['approve', 'reject', 'cancel'].indexOf(decision) === -1) ctx.fail('invalid-decision', 'Decisión no válida: ' + decision, { field: 'decision' });
      var engine = engineOf(ctx);
      var review = session.review;
      var result = run(ctx, function () { return engine.resolveReview(ctx.state, { sessionId: sessionId, decision: decision, fields: payload.fields }); });
      if (result && result.decision === 'rejected' && result.applied) {
        appendLog(ctx, REJECT_ACTION, (review ? review.logicalRequestId : 'R') + ' · ' + result.reason);
      }
      return result;
    },

    resumeReview: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.resumeReview(ctx.state, { sessionId: sessionId }); });
    },

    setScenarioFormField: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.setFormField(ctx.state, { sessionId: sessionId, field: payload.field, value: payload.value }); });
    },

    submitScenarioForm: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      sessionOf(ctx, sessionId);
      var engine = engineOf(ctx);
      return run(ctx, function () { return engine.submitForm(ctx.state, { sessionId: sessionId, fields: payload ? payload.fields : undefined }); });
    },

    /* openEvidence {evidenceId|null}: closed list; TO-BE evidence needs viewDraftsToBe */
    openEvidence: function (ctx, payload) {
      var id = payload && payload.evidenceId !== undefined && payload.evidenceId !== '' ? payload.evidenceId : null;
      if (id === null) {
        ctx.state.desktop.evidenceOpenId = null;
        return { evidenceId: null };
      }
      var record = evidenceOf(ctx, id);
      if (!record) ctx.fail('unknown-evidence', 'Evidencia desconocida: ' + id, { field: 'evidenceId' });
      var h = web();
      if (record.restrictedTo === 'TO-BE') h.assertCan(ctx, 'viewDraftsToBe');
      if (record.versionId) {
        if (ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, record.versionId)) {
          h.failPermission(ctx, h.can(ctx, 'viewVersion', { versionId: record.versionId }));
        }
      }
      ctx.state.desktop.evidenceOpenId = record.id;
      return { evidenceId: record.id };
    },

    setAtLatest: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      var atLatest = !!(payload && payload.atLatest);
      session.atLatest = atLatest;
      if (atLatest) session.unread = 0;
      return { sessionId: sessionId, atLatest: atLatest, unread: session.unread || 0 };
    },

    markRead: function (ctx, payload) {
      var sessionId = requireSessionId(ctx, payload);
      var session = sessionOf(ctx, sessionId);
      session.unread = 0;
      session.atLatest = true;
      return { sessionId: sessionId, unread: 0 };
    },

    /* deliverTimedEvent {sessionId, eventId, generation, runOrdinal}: timer callback; never fails */
    deliverTimedEvent: function (ctx, payload) {
      var p = payload || {};
      if (!p.sessionId || !p.eventId) return { delivered: false, reason: 'invalid-payload' };
      var engine = engineOf(ctx);
      return engine.deliverTimedEvent(ctx.state, p);
    }
  };

  return {
    commands: commands,
    PAUSE_REASONS: PAUSE_REASONS,
    helpers: { engineOf: engineOf, workspaceOfSession: workspaceOfSession }
  };
});
