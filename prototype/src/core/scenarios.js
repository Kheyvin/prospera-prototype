/* core/scenarios — deterministic playback engine for the desktop sessions (CONTRACTS §5.9,
 * spec §10.5 DESK-02/03/04, annex B).
 *
 * The engine owns the session state under state.desktop.sessions[sessionId]:
 *   events[]   emitted transcript events { id, logicalId, sequence, kind, at, status, payload }
 *   playback   { status, scenarioId, runOrdinal, stepIndex, pendingEventIds, errorMode, failedEventId,
 *                scheduledEventId, timerId, generation, pausedFrom, pauseReason, errorModeConsumed }
 *   review     the pending/resolved review of the current run (R-01 / R-02)
 *   form       the SCN-02 preparation form (form-request event)
 * Every function receives the mutable draft state of a command; failures are thrown as
 * CommandError-like errors (code/message/field/messageId) that core/commands/desktop passes
 * through ctx.fail. Validation errors of review/form fields are stored on the session
 * (review.errors / form.errors) and reported with { applied: false } so the UI can show them
 * inline (MSG-15) without losing the typed values.
 *
 * Timed tool results go through store.timers (tagged 'session:<id>') and come back through
 * dispatch('deliverTimedEvent'); a delivery is ignored when the generation, run ordinal or
 * playback status no longer match, so nothing advances hidden, after a reset or twice.
 *
 * Also hosts the desktop selectors (desktopModel, scenarioAvailability, operationsRows,
 * artifactPreview) re-exported by core/selectors. No DOM access. */
Primus.module('core/scenarios', function (require) {
  'use strict';

  var PLAYBACK_STATUSES = ['idle', 'running', 'paused', 'stopped', 'awaiting-review', 'failed', 'completed'];
  var REVIEW_STATES = ['pending', 'approved', 'rejected', 'canceled'];
  var REVIEW_FIELDS = ['instruction', 'note', 'reason'];
  var START_STATUSES = ['idle', 'completed'];
  var TIMER_TAG = 'session:';
  var OPERATION_KINDS = ['tool-start', 'tool-result', 'artifact-proposal', 'approval-result', 'error'];
  var MSG_PAUSED = 'MSG-19';
  var MSG_PROCESSING = 'MSG-14';
  var MSG_REVIEW_FIELDS = 'MSG-15';
  var MSG_REQUIRED = 'MSG-04';
  var MSG_LENGTH = 'MSG-05';
  var MSG_CONTENT_ERROR = 'MSG-13';

  /* ---------- generic helpers ---------- */

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }

  function recordIn(list, id) {
    if (!Array.isArray(list) || id === null || id === undefined) return undefined;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return undefined;
  }

  function mapGet(collection, id) {
    if (!collection || id === null || id === undefined) return undefined;
    if (typeof collection.get === 'function') return collection.get(id);
    return recordIn(Array.isArray(collection) ? collection : [], id);
  }

  function mapValues(collection) {
    if (!collection) return [];
    if (typeof collection.values === 'function' && !Array.isArray(collection)) return Array.from(collection.values());
    if (Array.isArray(collection)) return collection.slice();
    return Object.keys(collection).map(function (k) { return collection[k]; });
  }

  function failure(code, message, extra) {
    var err = new Error(message || code);
    err.code = code;
    err.name = 'CommandError';
    err.isCommandError = true;
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k] !== undefined) err[k] = extra[k]; });
    return err;
  }

  function sanitize(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  }

  function trimmed(value) { return sanitize(value).trim(); }

  function normalizeText(value) {
    return require('core/format').normalize(value);
  }

  function effectiveEventId(scenarioId, runOrdinal, eventId) {
    return eventId + '#' + runOrdinal;
  }

  function effectiveRequestId(scenarioId, runOrdinal, requestId) {
    return requestId + '#' + runOrdinal;
  }

  function hasEvent(session, id) {
    var events = session.events || [];
    for (var i = 0; i < events.length; i++) if (events[i].id === id) return true;
    return false;
  }

  function lengthError(format, field, value, min, max, required) {
    var text = trimmed(value);
    if (!text) {
      if (required) return { field: field, messageId: MSG_REQUIRED, message: format.msgText(MSG_REQUIRED) };
      return null;
    }
    var len = text.length;
    if ((typeof min === 'number' && len < min) || (typeof max === 'number' && len > max)) {
      return { field: field, messageId: MSG_LENGTH, message: format.msgText(MSG_LENGTH, { min: min, max: max }), params: { min: min, max: max } };
    }
    return null;
  }

  /* ---------- engine factory ---------- */

  function createScenarioEngine(store) {
    var pack = store && store.pack;
    var versionsApi = null;
    var formatApi = null;

    function versions() {
      if (store.versions && typeof store.versions.publishDemoVersion === 'function') return store.versions;
      if (!versionsApi) versionsApi = require('core/versions').createVersions(store);
      return versionsApi;
    }

    function format() {
      if (store.format && typeof store.format.msgText === 'function') return store.format;
      if (!formatApi) formatApi = require('core/format').createFormat(pack);
      return formatApi;
    }

    function permissions() { return store.permissions || null; }

    function now() { return typeof store.now === 'function' ? store.now() : null; }

    function timersAvailable() {
      return !!(store.timers && typeof store.timers.set === 'function');
    }

    function clearSessionTimers(sessionId) {
      if (store.timers && typeof store.timers.clearAll === 'function') store.timers.clearAll(TIMER_TAG + sessionId);
    }

    /* ---------- pack access ---------- */

    function desktopOf() { return raw(pack).desktop || {}; }

    function uiOf() {
      if (pack && pack.ui) return pack.ui;
      var r = raw(pack);
      return (r.presentation && r.presentation.ui) || {};
    }

    function uiText(key, fallback) {
      var value = uiOf()[key];
      return value === null || value === undefined ? (fallback === undefined ? key : fallback) : value;
    }

    function scenarioOf(id) {
      if (!pack) return undefined;
      if (pack.scenarios && typeof pack.scenarios.get === 'function') return pack.scenarios.get(id);
      return recordIn(raw(pack).scenarios || [], id);
    }

    function allScenarios() {
      if (pack && pack.scenarios && typeof pack.scenarios.values === 'function') return Array.from(pack.scenarios.values());
      return raw(pack).scenarios || [];
    }

    function workspaceOf(id) {
      if (pack && pack.workspaces && typeof pack.workspaces.get === 'function') return pack.workspaces.get(id);
      return recordIn(desktopOf().workspaces || [], id);
    }

    function allWorkspaces() {
      if (pack && pack.workspaces && typeof pack.workspaces.values === 'function') return Array.from(pack.workspaces.values());
      return desktopOf().workspaces || [];
    }

    function sessionRecordOf(id) {
      if (pack && pack.sessions && typeof pack.sessions.get === 'function') return pack.sessions.get(id);
      return recordIn(desktopOf().sessions || [], id);
    }

    function workspaceOfSession(sessionId) {
      var record = sessionRecordOf(sessionId);
      if (record && record.workspaceId) return workspaceOf(record.workspaceId);
      var list = allWorkspaces();
      for (var i = 0; i < list.length; i++) if (list[i].sessionId === sessionId) return list[i];
      return undefined;
    }

    function sessionScenarios(sessionId) {
      return allScenarios().filter(function (sc) { return sc && sc.sessionId === sessionId; });
    }

    function evidenceOf(id) {
      if (pack && pack.evidence && typeof pack.evidence.get === 'function') return pack.evidence.get(id);
      return recordIn(desktopOf().evidence || [], id);
    }

    function sourceOf(id) {
      if (pack && pack.sources && typeof pack.sources.get === 'function') return pack.sources.get(id);
      return recordIn(raw(pack).sources || [], id);
    }

    function entityOf(id) {
      if (!pack) return undefined;
      if (pack.entities && typeof pack.entities.get === 'function') return pack.entities.get(id);
      var r = raw(pack);
      return recordIn((r.organization && r.organization.entities) || [], id);
    }

    function trackingOf() { return raw(pack).tracking || {}; }

    function eventDef(scenario, logicalId) {
      return recordIn((scenario && scenario.events) || [], logicalId);
    }

    function eventDefByKind(scenario, kind, requestId) {
      var events = (scenario && scenario.events) || [];
      for (var i = 0; i < events.length; i++) {
        if (events[i].kind !== kind) continue;
        if (requestId && events[i].requestId !== requestId) continue;
        return events[i];
      }
      return null;
    }

    function errorModeOf(scenario, id) {
      return recordIn((scenario && scenario.errorModes) || [], id);
    }

    function completedCta(scenario) {
      var def = eventDefByKind(scenario, 'completed');
      return def && def.cta ? def.cta : null;
    }

    /* ---------- state access ---------- */

    function sessionOf(state, sessionId) {
      var session = state && state.desktop && state.desktop.sessions ? state.desktop.sessions[sessionId] : null;
      if (!session) throw failure('unknown-session', 'Sesión desconocida: ' + sessionId, { field: 'sessionId' });
      return session;
    }

    function playbackOf(session) {
      if (!session.playback) {
        session.playback = { status: 'idle', scenarioId: null, runOrdinal: 0, stepIndex: 0, pendingEventIds: [], errorMode: null, failedEventId: null };
      }
      var pb = session.playback;
      if (!Array.isArray(pb.pendingEventIds)) pb.pendingEventIds = [];
      if (pb.scheduledEventId === undefined) pb.scheduledEventId = null;
      if (pb.errorModeConsumed === undefined) pb.errorModeConsumed = false;
      return pb;
    }

    function currentScenario(session) {
      var pb = playbackOf(session);
      return pb.scenarioId ? scenarioOf(pb.scenarioId) : null;
    }

    function resolveVersion(state, versionId) {
      return versions().resolveVersion(state, versionId);
    }

    function versionExists(state, versionId) { return !!resolveVersion(state, versionId); }

    function profileRole(state) {
      var perms = permissions();
      if (perms && typeof perms.role === 'function') return perms.role(state);
      var r = raw(pack);
      var profile = recordIn((r.demo && r.demo.profiles) || [], state.app && state.app.profileId);
      return profile ? profile.accessRole : null;
    }

    function can(state, action, extra) {
      var perms = permissions();
      if (!perms || typeof perms.can !== 'function') return { ok: true };
      return perms.can(state, action, extra || {}) || { ok: true };
    }

    function canSeeVersion(state, versionId) {
      var perms = permissions();
      if (!perms || typeof perms.canSeeVersion !== 'function') return true;
      return !!perms.canSeeVersion(state, versionId);
    }

    function isVisible(state, entityId) {
      var perms = permissions();
      if (!perms || typeof perms.isVisible !== 'function') return true;
      return !!perms.isVisible(state, entityId);
    }

    function analystCta() {
      return { label: uiText('useAnalystProfile', 'Usar perfil de analista'), command: { type: 'useAnalystProfile', payload: {} } };
    }

    function reviewBlocks(session) {
      return !!(session.review && (session.review.state === 'pending' || session.review.state === 'canceled'));
    }

    /* ---------- availability (preconditions) ---------- */

    function checkPrecondition(state, scenario, pre) {
      var fmt = format();
      var desktop = desktopOf();
      switch (pre.check) {
        case 'profileRole':
          if (profileRole(state) === pre.value) return null;
          return { code: 'profileRole', text: pre.message || desktop.readOnlyMessage || fmt.msgText('MSG-03'), cta: analystCta() };
        case 'versionExists':
          if (versionExists(state, pre.value)) return null;
          return {
            code: 'versionExists',
            versionId: pre.value,
            text: pre.message || fmt.msgText(MSG_CONTENT_ERROR),
            cta: pre.cta ? {
              label: pre.cta.label,
              scenarioId: pre.cta.scenarioId || null,
              command: pre.cta.scenarioId ? { type: 'startScenario', payload: { sessionId: scenario.sessionId, scenarioId: pre.cta.scenarioId } } : null
            } : null
          };
        case 'versionAbsent':
          if (!versionExists(state, pre.value)) return null;
          var cta = completedCta(scenario);
          return {
            code: 'versionAbsent',
            versionId: pre.value,
            text: pre.message || scenario.repeatMessage || fmt.msgText(MSG_CONTENT_ERROR),
            cta: cta && canSeeVersion(state, pre.value) ? { label: cta.label, command: { type: 'navigateTo', payload: { target: cta.target } } } : null
          };
        case 'projectExists':
          if (recordIn(state.demo.projects, pre.value)) return null;
          return { code: 'projectExists', projectId: pre.value, text: pre.message || fmt.msgText(MSG_CONTENT_ERROR), cta: null };
        case 'noPendingReview':
          var session = state.desktop && state.desktop.sessions ? state.desktop.sessions[scenario.sessionId] : null;
          if (!session || !reviewBlocks(session)) return null;
          return {
            code: 'noPendingReview',
            text: pre.message || (desktop.footer && desktop.footer.pendingReview) || null,
            cta: session.review.state === 'canceled'
              ? { label: uiText('resumeReview', 'Retomar revisión'), command: { type: 'resumeReview', payload: { sessionId: scenario.sessionId } } }
              : null
          };
        default:
          return null;
      }
    }

    function availability(state, scenarioId) {
      var scenario = scenarioOf(scenarioId);
      if (!scenario) return { ok: false, scenarioId: scenarioId, reasons: [{ code: 'unknown-scenario', text: format().msgText(MSG_CONTENT_ERROR), cta: null }] };
      var reasons = [];
      (scenario.preconditions || []).forEach(function (pre) {
        var reason = checkPrecondition(state, scenario, pre);
        if (reason) reasons.push(reason);
      });
      return { ok: reasons.length === 0, scenarioId: scenarioId, reasons: reasons };
    }

    function sessionBusy(session) {
      return START_STATUSES.indexOf(playbackOf(session).status) === -1;
    }

    /* ---------- event emission ---------- */

    function payloadOf(def) {
      var payload = clone(def) || {};
      delete payload.id;
      delete payload.sequence;
      delete payload.kind;
      return payload;
    }

    function markToolStart(session, callId, runOrdinal, status) {
      if (!callId) return null;
      var events = session.events || [];
      for (var i = events.length - 1; i >= 0; i--) {
        var ev = events[i];
        if (ev.kind === 'tool-start' && ev.payload && ev.payload.callId === callId && ev.runOrdinal === runOrdinal) {
          ev.status = status;
          return ev;
        }
      }
      return null;
    }

    function pushEvent(session, event) {
      if (!Array.isArray(session.events)) session.events = [];
      if (hasEvent(session, event.id)) return null;
      session.events.push(event);
      if (!session.atLatest) session.unread = (session.unread || 0) + 1;
      return event;
    }

    function syntheticEvent(sessionId, session, kind, logicalKey, payload) {
      session.syntheticSeq = (session.syntheticSeq || 0) + 1;
      var seq = session.syntheticSeq;
      return {
        id: sessionId + ':' + logicalKey + '#' + seq,
        logicalId: logicalKey + '-' + seq,
        sequence: null,
        kind: kind,
        at: now(),
        status: 'done',
        scenarioId: null,
        runOrdinal: null,
        synthetic: true,
        payload: payload || {}
      };
    }

    function openReview(state, sessionId, session, scenario, def, eventId) {
      var pb = playbackOf(session);
      var staging = scenario.diff && state.demo.staging ? state.demo.staging[scenario.diff.versionId] : null;
      var form = session.form && session.form.scenarioId === scenario.id && session.form.runOrdinal === pb.runOrdinal ? session.form : null;
      var fields = { instruction: null, note: '', reason: '' };
      if (scenario.diff) fields.instruction = (staging && typeof staging.instruction === 'string') ? staging.instruction : scenario.diff.after;
      if (form) {
        fields.result = form.fields.result;
        fields.backingReference = form.fields.backingReference;
        fields.confirmation = form.fields.confirmation;
      }
      session.review = {
        requestId: effectiveRequestId(scenario.id, pb.runOrdinal, def.requestId),
        logicalRequestId: def.requestId,
        eventId: eventId,
        scenarioId: scenario.id,
        runOrdinal: pb.runOrdinal,
        state: 'pending',
        decision: null,
        fields: fields,
        errors: {},
        notice: null,
        openedAt: now(),
        resolvedAt: null,
        versionId: null
      };
      pb.status = 'awaiting-review';
    }

    function openForm(state, sessionId, session, scenario, def, eventId) {
      var pb = playbackOf(session);
      var projectId = scenario.projectId || null;
      var values = {};
      (def.fields || []).forEach(function (field) {
        if (field.projectId) projectId = field.projectId;
        if (field.type === 'readonly') return;
        values[field.id] = field.prefill !== undefined ? field.prefill : (field.type === 'checkbox' ? false : '');
      });
      var project = projectId ? recordIn(state.demo.projects, projectId) : null;
      var labels = trackingOf().projectStatusLabels || {};
      session.form = {
        eventId: eventId,
        logicalEventId: def.id,
        scenarioId: scenario.id,
        runOrdinal: pb.runOrdinal,
        title: def.title || null,
        note: def.note || null,
        projectId: projectId,
        projectStatus: project ? project.status : null,
        projectStatusLabel: project ? (labels[project.status] || project.status) : null,
        fields: values,
        errors: {},
        submitted: false,
        submittedAt: null
      };
    }

    function deliver(state, sessionId, session, scenario, def, overrides) {
      var pb = playbackOf(session);
      var id = effectiveEventId(scenario.id, pb.runOrdinal, def.id);
      if (hasEvent(session, id)) return null;

      var mode = pb.errorMode ? errorModeOf(scenario, pb.errorMode) : null;
      if (mode && mode.replacesEventId === def.id && !pb.errorModeConsumed) {
        var errorEvent = {
          id: effectiveEventId(scenario.id, pb.runOrdinal, def.id + '-error'),
          logicalId: def.id + '-error',
          sequence: def.sequence,
          kind: 'error',
          at: now(),
          status: 'failed',
          scenarioId: scenario.id,
          runOrdinal: pb.runOrdinal,
          payload: {
            text: mode.text,
            statusLabel: mode.text,
            errorModeId: mode.id,
            errorModeLabel: mode.label,
            replacesEventId: def.id,
            callId: def.callId || null,
            operation: def.operation || null,
            sourceIds: def.sourceIds ? def.sourceIds.slice() : [],
            evidenceIds: def.evidenceIds ? def.evidenceIds.slice() : []
          }
        };
        markToolStart(session, def.callId, pb.runOrdinal, 'failed');
        pb.status = 'failed';
        pb.failedEventId = def.id;
        pb.errorModeConsumed = true;
        pb.scheduledEventId = null;
        pb.timerId = null;
        return pushEvent(session, errorEvent);
      }

      var event = {
        id: id,
        logicalId: def.id,
        sequence: def.sequence,
        kind: def.kind,
        at: now(),
        status: def.kind === 'tool-start' ? 'running' : 'done',
        scenarioId: scenario.id,
        runOrdinal: pb.runOrdinal,
        payload: Object.assign(payloadOf(def), overrides || {})
      };

      switch (def.kind) {
        case 'tool-result':
          markToolStart(session, def.callId, pb.runOrdinal, 'done');
          break;
        case 'artifact-proposal':
          if (scenario.diff) {
            var staged = versions().stageVersion(state, {
              scenarioId: scenario.id,
              instruction: scenario.diff.after,
              note: '',
              runOrdinal: pb.runOrdinal,
              sessionId: sessionId
            });
            event.payload.versionId = staged.versionId;
            event.payload.staged = true;
            event.payload.baseVersionId = staged.baseVersionId;
          }
          break;
        case 'approval-request':
          openReview(state, sessionId, session, scenario, def, id);
          break;
        case 'form-request':
          openForm(state, sessionId, session, scenario, def, id);
          break;
        case 'completed':
          pb.status = 'completed';
          pb.scheduledEventId = null;
          pb.timerId = null;
          break;
        default:
          break;
      }
      return pushEvent(session, event);
    }

    function schedule(state, sessionId, session, scenario, def) {
      var pb = playbackOf(session);
      var generation = state.demo.generation;
      var runOrdinal = pb.runOrdinal;
      pb.scheduledEventId = def.id;
      var timerId = store.timers.set(function () {
        store.dispatch('deliverTimedEvent', { sessionId: sessionId, eventId: def.id, generation: generation, runOrdinal: runOrdinal });
      }, def.delayMs || 0, TIMER_TAG + sessionId);
      pb.timerId = timerId === undefined ? null : timerId;
      return def.id;
    }

    /* Delivers queued logical events in order. Stops at the first delayed one (scheduling it)
     * unless `inline` is set; `deliverFirst` forces the head (its timer already fired). */
    function drainPending(state, sessionId, session, scenario, opts) {
      var pb = playbackOf(session);
      var inline = !!(opts && opts.inline);
      var force = !!(opts && opts.deliverFirst);
      var delivered = [];
      while (pb.pendingEventIds.length) {
        var logicalId = pb.pendingEventIds[0];
        var def = eventDef(scenario, logicalId);
        if (!def) { pb.pendingEventIds.shift(); continue; }
        if (!inline && !force && def.delayMs > 0 && timersAvailable()) {
          schedule(state, sessionId, session, scenario, def);
          break;
        }
        force = false;
        pb.pendingEventIds.shift();
        var event = deliver(state, sessionId, session, scenario, def);
        if (event) delivered.push(event.id);
        if (pb.status !== 'running') break;
      }
      return delivered;
    }

    function emitStep(state, sessionId, session, scenario) {
      var pb = playbackOf(session);
      var steps = scenario.steps || [];
      if (pb.stepIndex >= steps.length) return [];
      var step = steps[pb.stepIndex];
      pb.stepIndex += 1;
      step.forEach(function (logicalId) { pb.pendingEventIds.push(logicalId); });
      return drainPending(state, sessionId, session, scenario, {});
    }

    function stepsRemaining(session, scenario) {
      var pb = playbackOf(session);
      return !!scenario && pb.stepIndex < (scenario.steps || []).length;
    }

    function formOpen(session) {
      return !!(session.form && !session.form.submitted);
    }

    /* ---------- playback commands ---------- */

    function start(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var scenario = scenarioOf(p.scenarioId);
      if (!scenario) throw failure('unknown-scenario', 'Escenario desconocido: ' + p.scenarioId, { field: 'scenarioId' });
      if (scenario.sessionId !== sessionId) {
        throw failure('scenario-session-mismatch', 'El escenario pertenece a otra sesión', { field: 'scenarioId', text: desktopOf().unsupported || null });
      }
      var pb = playbackOf(session);
      if (sessionBusy(session)) {
        throw failure('session-busy', pb.status === 'paused' ? format().msgText(MSG_PAUSED) : 'La sesión tiene un escenario en curso', {
          messageId: pb.status === 'paused' ? MSG_PAUSED : undefined
        });
      }
      var avail = availability(state, scenario.id);
      if (!avail.ok) {
        var first = avail.reasons[0];
        throw failure('scenario-unavailable', first.text || 'Escenario no disponible', { reasons: avail.reasons, cta: first.cta || null, details: { reasons: avail.reasons } });
      }
      var errorMode = p.errorMode !== undefined ? p.errorMode : pb.errorMode;
      if (errorMode !== null && errorMode !== undefined && !errorModeOf(scenario, errorMode)) {
        throw failure('unknown-error-mode', 'Modo de error desconocido: ' + errorMode, { field: 'errorMode' });
      }
      if (!state.demo.runOrdinals) state.demo.runOrdinals = {};
      var runOrdinal = (state.demo.runOrdinals[scenario.id] || 0) + 1;
      state.demo.runOrdinals[scenario.id] = runOrdinal;
      clearSessionTimers(sessionId);
      session.playback = {
        status: 'running',
        scenarioId: scenario.id,
        runOrdinal: runOrdinal,
        stepIndex: 0,
        pendingEventIds: [],
        errorMode: errorMode || null,
        errorModeConsumed: false,
        failedEventId: null,
        scheduledEventId: null,
        timerId: null,
        generation: state.demo.generation,
        pausedFrom: null,
        pauseReason: null,
        startedAt: now()
      };
      session.review = null;
      session.form = null;
      if (scenario.trigger && normalizeText(session.draft) === normalizeText(scenario.trigger.prompt)) session.draft = '';
      var emitted = emitStep(state, sessionId, session, scenario);
      return { sessionId: sessionId, scenarioId: scenario.id, runOrdinal: runOrdinal, emitted: emitted, status: session.playback.status };
    }

    function continueStep(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var pb = playbackOf(session);
      var scenario = currentScenario(session);
      if (!scenario) throw failure('no-scenario', 'No hay un escenario en esta sesión', { field: 'sessionId' });
      var result = { sessionId: sessionId, scenarioId: scenario.id, emitted: [], resumed: false, waiting: null };

      if (pb.status === 'paused') {
        pb.status = pb.pausedFrom || 'running';
        pb.pausedFrom = null;
        pb.pauseReason = null;
        result.resumed = true;
        if (pb.status !== 'running') { result.status = pb.status; return result; }
      } else if (pb.status === 'stopped') {
        pb.status = 'running';
        result.resumed = true;
      } else if (pb.status !== 'running') {
        throw failure('cannot-continue', 'No se puede continuar en el estado ' + pb.status, { status: pb.status });
      }

      if (pb.scheduledEventId) {
        clearSessionTimers(sessionId);
        pb.scheduledEventId = null;
        pb.timerId = null;
      }
      if (pb.pendingEventIds.length) {
        result.emitted = drainPending(state, sessionId, session, scenario, { inline: true });
      } else if (formOpen(session)) {
        result.waiting = 'form';
      } else if (stepsRemaining(session, scenario)) {
        result.emitted = emitStep(state, sessionId, session, scenario);
      } else if (session.review && session.review.state === 'pending') {
        pb.status = 'awaiting-review';
        result.waiting = 'review';
      } else {
        result.waiting = 'none';
      }
      result.status = pb.status;
      return result;
    }

    function stop(state, payload) {
      var p = payload || {};
      var session = sessionOf(state, p.sessionId);
      var pb = playbackOf(session);
      if (pb.status !== 'running' && pb.status !== 'paused') {
        throw failure('cannot-stop', 'No se puede detener en el estado ' + pb.status, { status: pb.status });
      }
      clearSessionTimers(p.sessionId);
      pb.scheduledEventId = null;
      pb.timerId = null;
      pb.pausedFrom = null;
      pb.pauseReason = null;
      pb.status = 'stopped';
      return { sessionId: p.sessionId, status: 'stopped', pendingEventIds: pb.pendingEventIds.slice() };
    }

    function pause(state, payload) {
      var p = payload || {};
      var session = sessionOf(state, p.sessionId);
      var pb = playbackOf(session);
      if (pb.status !== 'running' && pb.status !== 'awaiting-review') return { sessionId: p.sessionId, paused: false, status: pb.status };
      clearSessionTimers(p.sessionId);
      pb.pausedFrom = pb.status;
      pb.pauseReason = p.reason || 'hidden';
      pb.scheduledEventId = null;
      pb.timerId = null;
      pb.status = 'paused';
      return { sessionId: p.sessionId, paused: true, status: 'paused', reason: pb.pauseReason, messageId: MSG_PAUSED };
    }

    function resume(state, payload) {
      return continueStep(state, payload);
    }

    function retry(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var pb = playbackOf(session);
      var scenario = currentScenario(session);
      if (pb.status !== 'failed' || !pb.failedEventId || !scenario) {
        throw failure('cannot-retry', 'No hay un paso fallido que reintentar', { status: pb.status });
      }
      var def = eventDef(scenario, pb.failedEventId);
      if (!def) throw failure('unknown-event', 'Evento desconocido: ' + pb.failedEventId);
      pb.errorMode = null;
      pb.failedEventId = null;
      pb.status = 'running';
      if (pb.pendingEventIds.indexOf(def.id) === -1) pb.pendingEventIds.unshift(def.id);
      markToolStart(session, def.callId, pb.runOrdinal, 'running');
      var emitted = drainPending(state, sessionId, session, scenario, {});
      return { sessionId: sessionId, retried: def.id, emitted: emitted, scheduled: pb.scheduledEventId, status: pb.status };
    }

    function restart(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      clearSessionTimers(sessionId);
      var removedStaging = [];
      if (state.demo.staging) {
        Object.keys(state.demo.staging).forEach(function (versionId) {
          var entry = state.demo.staging[versionId];
          var published = state.demo.versions && state.demo.versions[versionId];
          if (!published && (!entry.sessionId || entry.sessionId === sessionId)) {
            delete state.demo.staging[versionId];
            removedStaging.push(versionId);
          }
        });
      }
      session.events = [];
      session.review = null;
      session.form = null;
      session.expandedTools = {};
      session.unread = 0;
      session.atLatest = true;
      session.playback = { status: 'idle', scenarioId: null, runOrdinal: 0, stepIndex: 0, pendingEventIds: [], errorMode: null, errorModeConsumed: false, failedEventId: null, scheduledEventId: null, timerId: null, generation: state.demo.generation, pausedFrom: null, pauseReason: null };
      return { sessionId: sessionId, status: 'idle', removedStaging: removedStaging };
    }

    function setErrorMode(state, payload) {
      var p = payload || {};
      var session = sessionOf(state, p.sessionId);
      var pb = playbackOf(session);
      if (START_STATUSES.indexOf(pb.status) === -1) {
        throw failure('error-mode-locked', 'El modo de error solo se elige antes de iniciar', { status: pb.status });
      }
      var id = p.errorMode === undefined ? null : p.errorMode;
      if (id !== null) {
        var known = sessionScenarios(p.sessionId).some(function (sc) { return !!errorModeOf(sc, id); });
        if (!known) throw failure('unknown-error-mode', 'Modo de error desconocido: ' + id, { field: 'errorMode' });
      }
      pb.errorMode = id;
      return { sessionId: p.sessionId, errorMode: id };
    }

    function deliverTimedEvent(state, payload) {
      var p = payload || {};
      var session = state.desktop && state.desktop.sessions ? state.desktop.sessions[p.sessionId] : null;
      if (!session) return { delivered: false, reason: 'unknown-session' };
      var pb = playbackOf(session);
      if (p.generation !== undefined && p.generation !== null && p.generation !== state.demo.generation) return { delivered: false, reason: 'stale-generation' };
      if (pb.status !== 'running') return { delivered: false, reason: 'not-running', status: pb.status };
      if (p.runOrdinal !== undefined && p.runOrdinal !== null && p.runOrdinal !== pb.runOrdinal) return { delivered: false, reason: 'stale-run' };
      if (!pb.scheduledEventId || pb.scheduledEventId !== p.eventId || pb.pendingEventIds[0] !== p.eventId) return { delivered: false, reason: 'not-scheduled' };
      var scenario = currentScenario(session);
      if (!scenario) return { delivered: false, reason: 'no-scenario' };
      if (hasEvent(session, effectiveEventId(scenario.id, pb.runOrdinal, p.eventId))) {
        pb.pendingEventIds.shift();
        pb.scheduledEventId = null;
        pb.timerId = null;
        return { delivered: false, reason: 'already-delivered' };
      }
      pb.scheduledEventId = null;
      pb.timerId = null;
      var emitted = drainPending(state, p.sessionId, session, scenario, { deliverFirst: true });
      return { delivered: emitted.length > 0, emitted: emitted, status: pb.status };
    }

    /* ---------- composer ---------- */

    function submitDraft(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var desktop = desktopOf();
      var text = trimmed(p.text !== undefined ? p.text : session.draft);
      if (!text) throw failure('empty-draft', 'No hay texto que enviar', { field: 'draft' });
      var readOnly = can(state, 'maintainModel');
      if (!readOnly.ok) {
        throw failure('read-only', desktop.readOnlyMessage || readOnly.text, { messageId: readOnly.messageId || 'MSG-03', cta: analystCta(), action: readOnly.action });
      }
      var normalized = normalizeText(text);
      var match = null;
      sessionScenarios(sessionId).forEach(function (sc) {
        if (!match && sc.trigger && normalizeText(sc.trigger.prompt) === normalized) match = sc;
      });
      if (match) {
        var avail = availability(state, match.id);
        if (avail.ok && !sessionBusy(session)) {
          session.draft = text;
          var started = start(state, { sessionId: sessionId, scenarioId: match.id });
          return { sessionId: sessionId, started: true, scenarioId: match.id, runOrdinal: started.runOrdinal, emitted: started.emitted };
        }
        var reason = avail.reasons[0] || null;
        var busyText = playbackOf(session).status === 'paused' ? format().msgText(MSG_PAUSED) : null;
        var reply = syntheticEvent(sessionId, session, 'assistant-message', 'note', {
          text: (reason && reason.text) || busyText || desktop.unsupported || null,
          unavailable: true,
          scenarioId: match.id,
          reasons: avail.reasons,
          cta: reason ? reason.cta || null : null
        });
        pushEvent(session, reply);
        return { sessionId: sessionId, started: false, unavailable: true, scenarioId: match.id, eventId: reply.id, reasons: avail.reasons };
      }
      var unsupported = syntheticEvent(sessionId, session, 'assistant-message', 'note', {
        text: desktop.unsupported || null,
        unsupported: true,
        draft: text
      });
      pushEvent(session, unsupported);
      return { sessionId: sessionId, started: false, unsupported: true, eventId: unsupported.id };
    }

    /* ---------- review ---------- */

    function reviewOf(state, sessionId, requirePending) {
      var session = sessionOf(state, sessionId);
      var review = session.review;
      if (!review) throw failure('no-review', 'No hay una revisión en esta sesión', { field: 'sessionId' });
      if (requirePending && review.state !== 'pending') {
        throw failure('review-resolved', 'La revisión ya fue resuelta', { state: review.state, requestId: review.requestId });
      }
      return review;
    }

    function stagingFor(state, scenario) {
      if (!scenario || !scenario.diff || !state.demo.staging) return null;
      return state.demo.staging[scenario.diff.versionId] || null;
    }

    function setReviewField(state, payload) {
      var p = payload || {};
      var review = reviewOf(state, p.sessionId, true);
      var scenario = scenarioOf(review.scenarioId);
      var field = p.field;
      if (REVIEW_FIELDS.indexOf(field) === -1) throw failure('unknown-field', 'Campo de revisión desconocido: ' + field, { field: 'field' });
      if (field === 'instruction' && !(scenario && scenario.diff)) throw failure('field-not-editable', 'Esta revisión no edita la instrucción', { field: field });
      var value = sanitize(p.value);
      review.fields[field] = value;
      if (review.errors) delete review.errors[field];
      if (field === 'instruction') {
        var staging = stagingFor(state, scenario);
        if (staging) {
          staging.instruction = value.trim();
          staging.edited = staging.instruction !== scenario.diff.after;
          staging.note = review.fields.note || '';
        }
      } else if (field === 'note') {
        var st = stagingFor(state, scenario);
        if (st) st.note = value.trim();
      }
      return { sessionId: p.sessionId, field: field, value: value };
    }

    function restoreReviewText(state, payload) {
      var p = payload || {};
      var review = reviewOf(state, p.sessionId, true);
      var scenario = scenarioOf(review.scenarioId);
      if (!scenario || !scenario.diff) throw failure('field-not-editable', 'Esta revisión no edita la instrucción');
      review.fields.instruction = scenario.diff.after;
      if (review.errors) delete review.errors.instruction;
      var staging = stagingFor(state, scenario);
      if (staging) { staging.instruction = scenario.diff.after; staging.edited = false; }
      return { sessionId: p.sessionId, instruction: scenario.diff.after };
    }

    function reviewMessages(scenario) {
      var m = (scenario.review && scenario.review.messages) || {};
      var o = (scenario.outcome && scenario.outcome.messages) || {};
      return { approved: m.approved || o.approved || null, rejected: m.rejected || o.rejected || null, canceled: m.canceled || o.canceled || null };
    }

    function pushToast(state, text, messageId) {
      if (!text || !state.app) return null;
      if (!Array.isArray(state.app.toasts)) state.app.toasts = [];
      var id = 'toast-' + (state.demo.clock || 0) + '-' + (state.app.toasts.length + 1);
      var toast = { id: id, text: text, tone: 'success' };
      if (messageId) toast.messageId = messageId;
      state.app.toasts.push(toast);
      while (state.app.toasts.length > 5) state.app.toasts.shift();
      return toast;
    }

    function storeErrors(target, errors) {
      target.errors = {};
      var first = null;
      errors.forEach(function (e) {
        if (!e) return;
        target.errors[e.field] = e.message;
        if (!first) first = e;
      });
      return first;
    }

    function finishApproval(state, sessionId, session, scenario, review, version, def) {
      var pb = playbackOf(session);
      var messages = reviewMessages(scenario);
      review.state = 'approved';
      review.decision = 'approve';
      review.resolvedAt = now();
      review.versionId = version ? version.id : null;
      review.errors = {};
      review.notice = messages.approved || null;
      var resultDef = eventDefByKind(scenario, 'approval-result', review.logicalRequestId) || def;
      pb.status = 'running';
      if (resultDef) {
        deliver(state, sessionId, session, scenario, resultDef, {
          decision: 'approved',
          versionId: version ? version.id : null,
          message: messages.approved || null,
          edited: !!(version && version.edited)
        });
      }
      var completedDef = eventDefByKind(scenario, 'completed');
      if (completedDef) deliver(state, sessionId, session, scenario, completedDef, { versionId: version ? version.id : null });
      pb.status = 'completed';
      pb.scheduledEventId = null;
      if (!state.demo.applied) state.demo.applied = {};
      state.demo.applied[scenario.id] = true;
      if (scenario.outcome && scenario.outcome.toast) pushToast(state, scenario.outcome.toast, null);
      if (version && state.web && state.web.processId === version.processId) state.web.newVersionNotice = { versionId: version.id };
    }

    function resolveReview(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var review = reviewOf(state, sessionId, true);
      var pb = playbackOf(session);
      var scenario = scenarioOf(review.scenarioId);
      if (!scenario) throw failure('unknown-scenario', 'Escenario desconocido: ' + review.scenarioId);
      if (pb.status === 'paused') throw failure('session-paused', format().msgText(MSG_PAUSED), { messageId: MSG_PAUSED });
      if (pb.status !== 'awaiting-review') throw failure('review-not-active', 'La revisión no está activa en el estado ' + pb.status, { status: pb.status });
      if (p.fields && typeof p.fields === 'object') {
        Object.keys(p.fields).forEach(function (k) {
          review.fields[k] = typeof p.fields[k] === 'string' ? sanitize(p.fields[k]) : p.fields[k];
        });
      }
      var decision = p.decision;
      var messages = reviewMessages(scenario);
      var fmt = format();
      var rv = scenario.review || {};

      if (decision === 'cancel') {
        review.state = 'canceled';
        review.decision = 'cancel';
        review.resolvedAt = now();
        review.errors = {};
        review.notice = messages.canceled || null;
        return { sessionId: sessionId, decision: 'canceled', applied: true, message: messages.canceled || null, requestId: review.requestId };
      }

      if (decision === 'reject') {
        var reasonField = rv.reasonField || { min: 5, max: 300 };
        var reasonError = lengthError(fmt, 'reason', review.fields.reason, reasonField.min, reasonField.max, true);
        if (reasonError) {
          storeErrors(review, [reasonError]);
          return { sessionId: sessionId, decision: 'reject', applied: false, errors: clone(review.errors), firstErrorField: 'reason', messageId: MSG_REVIEW_FIELDS };
        }
        var reason = trimmed(review.fields.reason);
        review.fields.reason = reason;
        review.state = 'rejected';
        review.decision = 'reject';
        review.resolvedAt = now();
        review.errors = {};
        review.notice = messages.rejected || null;
        pb.status = 'running';
        var rejectDef = eventDefByKind(scenario, 'approval-result', review.logicalRequestId);
        if (rejectDef) {
          deliver(state, sessionId, session, scenario, rejectDef, {
            decision: 'rejected',
            reason: reason,
            statusLabel: messages.rejected || null,
            message: messages.rejected || null
          });
        }
        pushEvent(session, syntheticEvent(sessionId, session, 'assistant-message', review.logicalRequestId + '-rejected', {
          text: messages.rejected || null,
          decision: 'rejected',
          reason: reason,
          requestId: review.requestId
        }));
        if (scenario.diff && state.demo.staging && state.demo.staging[scenario.diff.versionId] && !(state.demo.versions && state.demo.versions[scenario.diff.versionId])) {
          delete state.demo.staging[scenario.diff.versionId];
        }
        pb.status = 'completed';
        pb.scheduledEventId = null;
        return { sessionId: sessionId, decision: 'rejected', applied: true, reason: reason, message: messages.rejected || null, requestId: review.requestId, logAction: 'Rechazar propuesta' };
      }

      if (decision !== 'approve') throw failure('invalid-decision', 'Decisión no válida: ' + decision, { field: 'decision' });

      var permission = can(state, 'publish');
      if (!permission.ok) {
        throw failure('forbidden', permission.text || desktopOf().readOnlyMessage, { messageId: permission.messageId || 'MSG-03', action: permission.action, cta: permission.cta || analystCta() });
      }

      var errors = [];
      var version = null;
      if (scenario.diff) {
        var instructionField = rv.instructionField || { min: 20, max: 600 };
        var noteField = rv.noteField || { min: 0, max: 300 };
        errors.push(lengthError(fmt, 'instruction', review.fields.instruction, instructionField.min, instructionField.max, true));
        errors.push(lengthError(fmt, 'note', review.fields.note, noteField.min, noteField.max, false));
        var first = storeErrors(review, errors.filter(Boolean));
        if (first) return { sessionId: sessionId, decision: 'approve', applied: false, errors: clone(review.errors), firstErrorField: first.field, messageId: MSG_REVIEW_FIELDS };
        if (!resolveVersion(state, scenario.diff.baseVersionId)) {
          throw failure('unknown-version', 'Versión base no encontrada: ' + scenario.diff.baseVersionId, { field: 'baseVersionId', messageId: MSG_CONTENT_ERROR });
        }
        var existing = state.demo.versions && state.demo.versions[scenario.diff.versionId];
        if (existing && !(state.demo.requestIds && state.demo.requestIds[review.requestId])) {
          throw failure('version-exists', scenario.repeatMessage || 'La versión ya existe', { versionId: scenario.diff.versionId });
        }
        version = versions().publishDemoVersion(state, {
          requestId: review.requestId,
          scenarioId: scenario.id,
          instruction: trimmed(review.fields.instruction),
          note: trimmed(review.fields.note),
          actorProfileId: state.app ? state.app.profileId : null,
          runOrdinal: review.runOrdinal
        });
        review.fields.instruction = version.diff ? version.diff.after : trimmed(review.fields.instruction);
      } else {
        var formDef = eventDefByKind(scenario, 'form-request');
        var fieldDefs = (formDef && formDef.fields) || [];
        var confirmationDef = recordIn(fieldDefs, 'confirmation');
        var resultDefn = recordIn(fieldDefs, 'result') || { min: 10, max: 500 };
        var referenceDefn = recordIn(fieldDefs, 'backingReference') || { min: 5, max: 120 };
        if (confirmationDef && review.fields.confirmation !== true) errors.push({ field: 'confirmation', messageId: MSG_REQUIRED, message: fmt.msgText(MSG_REQUIRED) });
        errors.push(lengthError(fmt, 'result', review.fields.result, resultDefn.min, resultDefn.max, true));
        errors.push(lengthError(fmt, 'backingReference', review.fields.backingReference, referenceDefn.min, referenceDefn.max, true));
        var firstErr = storeErrors(review, errors.filter(Boolean));
        if (firstErr) return { sessionId: sessionId, decision: 'approve', applied: false, errors: clone(review.errors), firstErrorField: firstErr.field, messageId: MSG_REVIEW_FIELDS };
        var outcome = scenario.outcome && scenario.outcome.version;
        var originId = outcome && (outcome.originVersionId || outcome.baseVersionId);
        if (originId && !resolveVersion(state, originId)) {
          var preReason = null;
          (scenario.preconditions || []).forEach(function (c) {
            if (c.check === 'versionExists' && c.value === originId) preReason = checkPrecondition(state, scenario, c);
          });
          throw failure('unknown-version', (preReason && preReason.text) || ('Versión de origen no encontrada: ' + originId), {
            field: 'originVersionId',
            messageId: preReason ? undefined : MSG_CONTENT_ERROR,
            cta: preReason ? preReason.cta : null
          });
        }
        var target = outcome && state.demo.versions && state.demo.versions[outcome.id];
        if (target && !(state.demo.requestIds && state.demo.requestIds[review.requestId])) {
          throw failure('version-exists', scenario.repeatMessage || 'La versión ya existe', { versionId: outcome.id });
        }
        version = versions().promoteDemoVersion(state, {
          requestId: review.requestId,
          scenarioId: scenario.id,
          projectId: scenario.projectId || (session.form && session.form.projectId) || null,
          result: trimmed(review.fields.result),
          backingReference: trimmed(review.fields.backingReference),
          actorProfileId: state.app ? state.app.profileId : null,
          runOrdinal: review.runOrdinal
        });
      }
      finishApproval(state, sessionId, session, scenario, review, version, null);
      return { sessionId: sessionId, decision: 'approved', applied: true, versionId: version ? version.id : null, requestId: review.requestId, message: messages.approved || null, toast: scenario.outcome && scenario.outcome.toast ? scenario.outcome.toast : null };
    }

    function resumeReview(state, payload) {
      var p = payload || {};
      var session = sessionOf(state, p.sessionId);
      var review = reviewOf(state, p.sessionId, false);
      if (review.state !== 'canceled') throw failure('review-not-canceled', 'Solo se retoma una revisión cancelada', { state: review.state });
      var pb = playbackOf(session);
      if (pb.status === 'paused') throw failure('session-paused', format().msgText(MSG_PAUSED), { messageId: MSG_PAUSED });
      review.state = 'pending';
      review.decision = null;
      review.notice = null;
      review.resolvedAt = null;
      review.errors = {};
      pb.status = 'awaiting-review';
      return { sessionId: p.sessionId, requestId: review.requestId, state: 'pending' };
    }

    /* ---------- SCN-02 form ---------- */

    function formOf(state, sessionId) {
      var session = sessionOf(state, sessionId);
      if (!session.form) throw failure('no-form', 'No hay un formulario en esta sesión', { field: 'sessionId' });
      return session.form;
    }

    function formFieldDefs(form) {
      var scenario = scenarioOf(form.scenarioId);
      var def = scenario ? eventDef(scenario, form.logicalEventId) : null;
      return (def && def.fields) || [];
    }

    function setFormField(state, payload) {
      var p = payload || {};
      var form = formOf(state, p.sessionId);
      if (form.submitted) throw failure('form-submitted', 'El formulario ya fue enviado');
      var def = recordIn(formFieldDefs(form), p.field);
      if (!def || def.type === 'readonly') throw failure('unknown-field', 'Campo de formulario desconocido: ' + p.field, { field: 'field' });
      var value = def.type === 'checkbox' ? !!p.value : sanitize(p.value);
      form.fields[p.field] = value;
      if (form.errors) delete form.errors[p.field];
      return { sessionId: p.sessionId, field: p.field, value: value };
    }

    function submitForm(state, payload) {
      var p = payload || {};
      var sessionId = p.sessionId;
      var session = sessionOf(state, sessionId);
      var form = formOf(state, sessionId);
      var pb = playbackOf(session);
      if (form.submitted) throw failure('form-submitted', 'El formulario ya fue enviado');
      if (pb.status === 'paused') throw failure('session-paused', format().msgText(MSG_PAUSED), { messageId: MSG_PAUSED });
      if (pb.status !== 'running') throw failure('form-not-active', 'El formulario no está activo en el estado ' + pb.status, { status: pb.status });
      var scenario = scenarioOf(form.scenarioId);
      if (!scenario) throw failure('unknown-scenario', 'Escenario desconocido: ' + form.scenarioId);
      var defs = formFieldDefs(form);
      if (p.fields && typeof p.fields === 'object') {
        Object.keys(p.fields).forEach(function (k) {
          var d = recordIn(defs, k);
          if (!d || d.type === 'readonly') return;
          form.fields[k] = d.type === 'checkbox' ? !!p.fields[k] : sanitize(p.fields[k]);
        });
      }
      var fmt = format();
      var errors = [];
      defs.forEach(function (d) {
        if (d.type === 'readonly') return;
        var value = form.fields[d.id];
        if (d.type === 'checkbox') {
          if (d.required && value !== true) errors.push({ field: d.id, messageId: MSG_REQUIRED, message: fmt.msgText(MSG_REQUIRED) });
          return;
        }
        var err = lengthError(fmt, d.id, value, d.min, d.max, !!d.required);
        if (err) errors.push(err);
      });
      if (errors.length) {
        var first = storeErrors(form, errors);
        return { sessionId: sessionId, submitted: false, applied: false, errors: clone(form.errors), firstErrorField: first.field, messageId: MSG_REVIEW_FIELDS };
      }
      defs.forEach(function (d) { if (d.type !== 'readonly' && d.type !== 'checkbox') form.fields[d.id] = trimmed(form.fields[d.id]); });
      form.errors = {};
      form.submitted = true;
      form.submittedAt = now();
      var emitted = [];
      var emits = (scenario.formSubmission && scenario.formSubmission.emits) || [];
      emits.forEach(function (logicalId) {
        var def = eventDef(scenario, logicalId);
        if (!def) return;
        var overrides = {};
        if (def.kind === 'tool-result' && Array.isArray(def.diffSpec)) {
          overrides.diffRows = versions().describePromotion(state, {
            scenarioId: scenario.id,
            projectId: form.projectId || scenario.projectId,
            result: form.fields.result,
            backingReference: form.fields.backingReference
          });
          overrides.formValues = clone(form.fields);
        }
        var event = deliver(state, sessionId, session, scenario, def, overrides);
        if (event) emitted.push(event.id);
      });
      return { sessionId: sessionId, submitted: true, applied: true, emitted: emitted, status: pb.status };
    }

    /* ---------- operations rows ---------- */

    function sourceLabelOf(ids) {
      var list = (ids || []).filter(Boolean);
      return list.length ? list.join(' · ') : null;
    }

    function operationsRows(session) {
      var events = (session && session.events) || [];
      var rows = [];
      var byCall = {};
      events.forEach(function (ev) {
        if (OPERATION_KINDS.indexOf(ev.kind) === -1 || !ev.payload || !ev.payload.operation) return;
        var callKey = ev.payload.callId ? ev.runOrdinal + ':' + ev.payload.callId : null;
        if (callKey && byCall[callKey]) {
          var row = byCall[callKey];
          row.eventIds.push(ev.id);
          row.resultEventId = ev.id;
          row.status = ev.kind === 'error' ? 'failed' : (ev.status === 'running' ? 'running' : 'done');
          row.statusLabel = ev.payload.statusLabel || row.statusLabel;
          row.text = ev.payload.text || row.text;
          row.sourceIds = ev.payload.sourceIds && ev.payload.sourceIds.length ? ev.payload.sourceIds.slice() : row.sourceIds;
          row.sourceLabel = sourceLabelOf(row.sourceIds);
          row.kind = ev.kind;
          row.decision = ev.payload.decision || row.decision;
          return;
        }
        var fresh = {
          sequence: ev.sequence,
          operation: ev.payload.operation,
          status: ev.kind === 'error' ? 'failed' : ev.status,
          statusLabel: ev.payload.statusLabel || null,
          sourceIds: ev.payload.sourceIds ? ev.payload.sourceIds.slice() : [],
          sourceLabel: sourceLabelOf(ev.payload.sourceIds),
          eventId: ev.id,
          logicalId: ev.logicalId,
          eventIds: [ev.id],
          resultEventId: ev.kind === 'tool-start' ? null : ev.id,
          callId: ev.payload.callId || null,
          kind: ev.kind,
          label: ev.payload.label || ev.payload.title || null,
          text: ev.payload.text || null,
          decision: ev.payload.decision || null,
          runOrdinal: ev.runOrdinal,
          scenarioId: ev.scenarioId
        };
        if (callKey) byCall[callKey] = fresh;
        rows.push(fresh);
      });
      return rows;
    }

    return {
      availability: availability,
      start: start,
      continueStep: continueStep,
      stop: stop,
      pause: pause,
      resume: resume,
      retry: retry,
      restart: restart,
      setErrorMode: setErrorMode,
      deliverTimedEvent: deliverTimedEvent,
      submitDraft: submitDraft,
      submitForm: submitForm,
      setFormField: setFormField,
      setReviewField: setReviewField,
      restoreReviewText: restoreReviewText,
      resolveReview: resolveReview,
      resumeReview: resumeReview,
      effectiveEventId: effectiveEventId,
      effectiveRequestId: effectiveRequestId,
      operationsRows: operationsRows,
      sessionScenarios: sessionScenarios,
      workspaceOfSession: workspaceOfSession,
      scenarioOf: scenarioOf,
      workspaceOf: workspaceOf,
      trackingOf: trackingOf,
      evidenceOf: evidenceOf,
      sourceOf: sourceOf,
      entityOf: entityOf,
      uiText: uiText,
      desktopOf: desktopOf,
      can: can,
      canSeeVersion: canSeeVersion,
      isVisible: isVisible,
      playbackOf: playbackOf,
      stepsRemaining: stepsRemaining,
      formOpen: formOpen,
      versions: versions,
      format: format,
      TIMER_TAG: TIMER_TAG
    };
  }

  /* ---------- desktop selectors (ctx = { state, pack, graph, permissions, format, store }) ---------- */

  var engineCache = typeof WeakMap === 'function' ? new WeakMap() : null;

  function engineFor(ctx) {
    var store = ctx && ctx.store;
    if (store && store.scenarios && typeof store.scenarios.availability === 'function') return store.scenarios;
    if (ctx && ctx.scenarios && typeof ctx.scenarios.availability === 'function') return ctx.scenarios;
    if (!store) throw new Error('core/scenarios: selectors need ctx.store');
    if (engineCache) {
      var cached = engineCache.get(store);
      if (cached) return cached;
      var created = createScenarioEngine(store);
      engineCache.set(store, created);
      return created;
    }
    return createScenarioEngine(store);
  }

  function typeLabelOf(type) {
    try {
      var packModule = require('core/pack');
      if (packModule && typeof packModule.typeLabel === 'function') return packModule.typeLabel(type);
    } catch (e) { /* core/pack not loaded */ }
    return type || null;
  }

  function entityLinkTarget(engine, ctx, entity, versionId) {
    if (!entity) return null;
    if (entity.type === 'activity') {
      var attrs = entity.attributes || {};
      var vid = versionId || attrs.versionId || null;
      var version = vid ? engine.versions().resolveVersion(ctx.state, vid) : null;
      return { tab: 'web', web: { level: 'operational', processId: version ? version.processId : null, processView: 'flow', versionId: vid, activityKey: attrs.key || entity.id } };
    }
    return { tab: 'web', web: { selectEntityId: entity.id } };
  }

  function renderEvent(engine, ctx, session, ev, readOnly) {
    var state = ctx.state;
    var payload = ev.payload || {};
    var fmt = engine.format();
    var links = (payload.links || []).map(function (id) {
      var entity = engine.entityOf(id);
      var versionId = entity && entity.type === 'activity' && entity.attributes ? entity.attributes.versionId : null;
      var visible = !!entity && engine.isVisible(state, id) && (!versionId || engine.canSeeVersion(state, versionId));
      return {
        entityId: id,
        name: entity ? entity.name : id,
        type: entity ? entity.type : null,
        typeLabel: entity ? typeLabelOf(entity.type) : null,
        visible: visible,
        target: visible ? entityLinkTarget(engine, ctx, entity, versionId) : null
      };
    });
    var evidence = (payload.evidenceIds || []).map(function (id) {
      var record = engine.evidenceOf(id);
      if (!record) return null;
      var hidden = record.restrictedTo === 'TO-BE' && !engine.can(state, 'viewDraftsToBe').ok;
      if (record.versionId && !engine.canSeeVersion(state, record.versionId)) hidden = true;
      return hidden ? null : { id: record.id, label: record.label, stateLabel: record.stateLabel || null, sourceId: record.sourceId || null };
    }).filter(Boolean);
    var sources = (payload.sourceIds || []).map(function (id) {
      var source = engine.sourceOf(id);
      return { id: id, title: source ? source.title : id, section: source ? source.section || null : null };
    });
    var model = {
      id: ev.id,
      logicalId: ev.logicalId,
      sequence: ev.sequence,
      kind: ev.kind,
      status: ev.status,
      at: ev.at,
      atLabel: ev.at ? fmt.time(ev.at) : null,
      scenarioId: ev.scenarioId,
      runOrdinal: ev.runOrdinal,
      synthetic: !!ev.synthetic,
      isAnalyst: ev.kind === 'analyst-message',
      isAssistant: ev.kind === 'assistant-message' || ev.kind === 'completed' || ev.kind === 'error',
      isTool: ev.kind === 'tool-start' || ev.kind === 'tool-result',
      isError: ev.kind === 'error',
      text: payload.text || null,
      label: payload.label || null,
      title: payload.title || null,
      statusLabel: payload.statusLabel || null,
      callId: payload.callId || null,
      operation: payload.operation || null,
      evidence: evidence,
      sources: sources,
      sourceIds: payload.sourceIds ? payload.sourceIds.slice() : [],
      links: links,
      pending: payload.pending ? payload.pending.slice() : [],
      versionId: payload.versionId || payload.stagesVersionId || null,
      requestId: payload.requestId || null,
      decision: payload.decision || null,
      reason: payload.reason || null,
      message: payload.message || null,
      cta: payload.cta ? clone(payload.cta) : null,
      unsupported: !!payload.unsupported,
      unavailable: !!payload.unavailable,
      reasons: payload.reasons ? clone(payload.reasons) : null,
      diffRows: payload.diffRows ? clone(payload.diffRows) : null,
      replacesEventId: payload.replacesEventId || null,
      errorModeLabel: payload.errorModeLabel || null,
      expanded: !!(session.expandedTools && (session.expandedTools[ev.id] || (payload.callId && session.expandedTools[payload.callId]))),
      formEventId: ev.kind === 'form-request' ? ev.id : null,
      hidden: false
    };
    if (readOnly && (ev.kind === 'artifact-proposal' || ev.kind === 'approval-request' || ev.kind === 'form-request')) model.hidden = true;
    if (model.cta && model.versionId && !engine.canSeeVersion(state, model.versionId)) model.cta = null;
    return model;
  }

  function reviewModel(engine, ctx, session, scenario) {
    var review = session.review;
    if (!review || !scenario) return null;
    var state = ctx.state;
    var rv = scenario.review || {};
    var fmt = engine.format();
    var requestDef = null;
    (scenario.events || []).forEach(function (e) { if (e.kind === 'approval-request' && e.requestId === review.logicalRequestId) requestDef = e; });
    var staging = scenario.diff && state.demo.staging ? state.demo.staging[scenario.diff.versionId] : null;
    var diffRows = null;
    var pending = [];
    var references = [];
    if (scenario.diff) {
      var described = engine.versions().describeStaging(scenario, { instruction: review.fields.instruction, note: review.fields.note }, state);
      diffRows = described.diffRows;
      pending = described.versionDraft.pending.slice();
      references = described.versionDraft.sourceIds.slice();
    } else {
      var resultEvent = null;
      (session.events || []).forEach(function (e) { if (e.runOrdinal === review.runOrdinal && e.scenarioId === scenario.id && e.payload && e.payload.diffRows) resultEvent = e; });
      diffRows = resultEvent ? clone(resultEvent.payload.diffRows) : null;
      var originId = scenario.outcome && scenario.outcome.version ? (scenario.outcome.version.originVersionId || scenario.outcome.version.baseVersionId) : null;
      var origin = originId ? engine.versions().resolveVersion(state, originId) : null;
      pending = origin && origin.pending ? origin.pending.slice() : [];
      references = scenario.outcome && scenario.outcome.version && scenario.outcome.version.sourceIds ? scenario.outcome.version.sourceIds.slice() : [];
    }
    var pendingState = review.state === 'pending';
    var paused = session.playback && session.playback.status === 'paused';
    var actions = Object.assign({}, rv.actions || {}, requestDef && requestDef.actions ? requestDef.actions : {});
    return {
      requestId: review.requestId,
      logicalRequestId: review.logicalRequestId,
      eventId: review.eventId,
      scenarioId: scenario.id,
      runOrdinal: review.runOrdinal,
      state: review.state,
      decision: review.decision,
      title: rv.title || (requestDef ? requestDef.text : null),
      text: requestDef ? requestDef.text : null,
      responsibleLabel: rv.responsibleLabel || null,
      scopeLabel: rv.scopeLabel || null,
      pendingLabel: rv.pendingLabel || null,
      referencesLabel: rv.referencesLabel || null,
      fields: clone(review.fields),
      errors: clone(review.errors || {}),
      instructionField: rv.instructionField ? clone(rv.instructionField) : null,
      noteField: rv.noteField ? clone(rv.noteField) : null,
      reasonField: rv.reasonField ? clone(rv.reasonField) : null,
      editable: !!scenario.diff,
      edited: !!(staging && staging.edited),
      diffRows: diffRows,
      diff: scenario.diff ? { activityKey: scenario.diff.activityKey, before: scenario.diff.before, after: review.fields.instruction, proposed: scenario.diff.after, versionNote: scenario.diff.versionNote || null } : null,
      pending: pending,
      references: references.map(function (id) { var s = engine.sourceOf(id); return { id: id, title: s ? s.title : id, section: s ? s.section || null : null }; }),
      actions: { approve: actions.approve || null, reject: actions.reject || null, cancel: actions.cancel || null, resume: engine.uiText('resumeReview', 'Retomar revisión') },
      enabled: {
        approve: pendingState && !paused,
        reject: pendingState && !paused,
        cancel: pendingState && !paused,
        resume: review.state === 'canceled' && !paused
      },
      notice: review.notice || null,
      messages: clone(rv.messages || (scenario.outcome && scenario.outcome.messages) || {}),
      versionId: review.versionId || null,
      resolvedAt: review.resolvedAt || null,
      fieldsMessageId: 'MSG-15',
      fieldsMessage: fmt.msgText('MSG-15')
    };
  }

  function formModel(engine, ctx, session, scenario) {
    var form = session.form;
    if (!form || !scenario) return null;
    var def = null;
    (scenario.events || []).forEach(function (e) { if (e.id === form.logicalEventId) def = e; });
    var defs = (def && def.fields) || [];
    var state = ctx.state;
    var project = null;
    var projects = state.demo.projects || [];
    for (var i = 0; i < projects.length; i++) if (projects[i].id === form.projectId) project = projects[i];
    var statusLabels = engine.trackingOf().projectStatusLabels || {};
    var projectStatusLabel = project ? (statusLabels[project.status] || project.status) : form.projectStatusLabel;
    var paused = session.playback && session.playback.status === 'paused';
    return {
      eventId: form.eventId,
      logicalEventId: form.logicalEventId,
      scenarioId: scenario.id,
      runOrdinal: form.runOrdinal,
      title: form.title,
      note: form.note,
      projectId: form.projectId,
      projectStatus: project ? project.status : form.projectStatus,
      projectStatusLabel: projectStatusLabel,
      submitted: !!form.submitted,
      enabled: !form.submitted && !paused,
      fields: defs.map(function (d) {
        var value = d.type === 'readonly' ? projectStatusLabel : form.fields[d.id];
        return {
          id: d.id,
          type: d.type,
          label: d.label,
          value: value === undefined ? (d.type === 'checkbox' ? false : '') : value,
          min: d.min !== undefined ? d.min : null,
          max: d.max !== undefined ? d.max : null,
          required: !!d.required,
          readonly: d.type === 'readonly',
          testid: d.testid || null,
          error: form.errors && form.errors[d.id] ? form.errors[d.id] : null
        };
      }),
      submit: def && def.submit ? clone(def.submit) : null,
      errors: clone(form.errors || {}),
      values: clone(form.fields)
    };
  }

  function artifactModel(engine, ctx, sessionId, session, readOnly) {
    if (readOnly) return null;
    var state = ctx.state;
    var scenarios = engine.sessionScenarios(sessionId);
    var result = null;
    scenarios.forEach(function (sc) {
      if (!sc.artifact || !sc.diff) return;
      var versionId = sc.diff.versionId;
      var published = state.demo.versions && state.demo.versions[versionId];
      var staging = state.demo.staging && state.demo.staging[versionId];
      if (published && (!staging || staging.sessionId === sessionId || !staging.sessionId)) {
        result = { title: sc.artifact.title, versionId: versionId, state: 'published', stateLabel: sc.artifact.stateAfter, edited: !!published.edited, yaml: engine.versions().artifactYaml(published, { state: state }), scenarioId: sc.id };
      } else if (staging && (!staging.sessionId || staging.sessionId === sessionId)) {
        result = { title: sc.artifact.title, versionId: versionId, state: 'staged', stateLabel: sc.artifact.stateBefore, edited: !!staging.edited, yaml: engine.versions().artifactYaml(staging, { state: state }), scenarioId: sc.id };
      }
    });
    return result;
  }

  function playbackModel(engine, ctx, sessionId, session, readOnly) {
    var state = ctx.state;
    var pb = engine.playbackOf(session);
    var scenario = pb.scenarioId ? engine.scenarioOf(pb.scenarioId) : null;
    var fmt = engine.format();
    var idle = START_STATUSES.indexOf(pb.status) !== -1;
    var navigation = state.desktop && state.desktop.navigation ? state.desktop.navigation : null;
    var scenarios = engine.sessionScenarios(sessionId).map(function (sc) {
      var avail = engine.availability(state, sc.id);
      var available = avail.ok && idle && !readOnly;
      return {
        id: sc.id,
        title: sc.title,
        triggerLabel: sc.trigger ? sc.trigger.label : sc.title,
        prompt: sc.trigger ? sc.trigger.prompt : null,
        available: available,
        reasons: avail.reasons,
        reason: avail.reasons.length ? avail.reasons[0].text : null,
        cta: avail.reasons.length ? avail.reasons[0].cta || null : null,
        applied: !!(state.demo.applied && state.demo.applied[sc.id]),
        suggested: !!(navigation && navigation.scenarioId === sc.id),
        errorModes: (sc.errorModes || []).map(function (m) { return { id: m.id, label: m.label, scenarioId: sc.id }; }),
        errorModesLabel: sc.errorModesLabel || null
      };
    });
    var hasNext = pb.pendingEventIds.length > 0 || engine.stepsRemaining(session, scenario) || engine.formOpen(session);
    var processing = !!pb.scheduledEventId;
    var canContinue = !readOnly && (
      pb.status === 'paused' ||
      (pb.status === 'stopped' && hasNext) ||
      (pb.status === 'running' && !processing && pb.pendingEventIds.length === 0 && engine.stepsRemaining(session, scenario) && !engine.formOpen(session))
    );
    var errorModes = [];
    if (idle) scenarios.forEach(function (sc) { sc.errorModes.forEach(function (m) { errorModes.push(Object.assign({}, m, { selected: pb.errorMode === m.id })); }); });
    var errorMenu = engine.desktopOf().errorMenu || {};
    return {
      status: pb.status,
      scenarioId: pb.scenarioId,
      scenarioTitle: scenario ? scenario.title : null,
      runOrdinal: pb.runOrdinal,
      stepIndex: pb.stepIndex,
      totalSteps: scenario ? (scenario.steps || []).length : 0,
      pendingEventIds: pb.pendingEventIds.slice(),
      processing: processing,
      processingText: fmt.msgText(MSG_PROCESSING),
      pausedMessage: pb.status === 'paused' ? fmt.msgText(MSG_PAUSED) : null,
      pauseReason: pb.status === 'paused' ? pb.pauseReason || null : null,
      failedEventId: pb.failedEventId || null,
      errorMode: pb.errorMode || null,
      errorModes: errorModes,
      errorModesLabel: errorMenu.label || (scenarios[0] && scenarios[0].errorModesLabel) || null,
      canStart: scenarios.filter(function (s) { return s.available; }).map(function (s) { return s.id; }),
      scenarios: scenarios,
      canContinue: canContinue,
      canStop: !readOnly && (pb.status === 'running' || pb.status === 'paused'),
      canRetry: !readOnly && pb.status === 'failed',
      canRestart: !readOnly && (pb.status !== 'idle' || (session.events || []).length > 0),
      canPause: pb.status === 'running' || pb.status === 'awaiting-review',
      labels: {
        start: engine.uiText('start', 'Iniciar'),
        continue: engine.uiText('continue', 'Continuar'),
        stop: errorMenu.stop || engine.uiText('stop', 'Detener'),
        retry: errorMenu.retry || engine.uiText('retry', 'Reintentar'),
        restart: errorMenu.restart || engine.uiText('restartScenario', 'Reiniciar escenario'),
        restartConfirm: errorMenu.restartConfirm || null
      }
    };
  }

  function chipsFor(engine, ctx, workspace) {
    var state = ctx.state;
    var chips = (workspace.chips || []).slice();
    if (!workspace.processId || !state.demo.versions) return chips;
    var latest = null;
    Object.keys(state.demo.versions).forEach(function (id) {
      var v = state.demo.versions[id];
      if (v && v.processId === workspace.processId && engine.canSeeVersion(state, id)) latest = v;
    });
    if (latest && latest.label && chips.length) chips[chips.length - 1] = latest.label;
    return chips;
  }

  function evidenceList(engine, ctx, workspace) {
    var state = ctx.state;
    var hidden = 0;
    var canToBe = engine.can(state, 'viewDraftsToBe').ok;
    var list = (workspace.evidenceIds || []).map(function (id) {
      var record = engine.evidenceOf(id);
      if (!record) return null;
      if (record.restrictedTo === 'TO-BE' && !canToBe) { hidden += 1; return null; }
      if (record.versionId && !engine.canSeeVersion(state, record.versionId)) { hidden += 1; return null; }
      var source = record.sourceId ? engine.sourceOf(record.sourceId) : null;
      return {
        id: record.id,
        label: record.label,
        referenceLabel: record.referenceLabel || null,
        stateLabel: record.stateLabel || null,
        summary: (record.summary || []).slice(),
        sourceId: record.sourceId || null,
        source: source ? { id: source.id, title: source.title, section: source.section || null, date: source.date || null, kind: source.kind || null } : null,
        versionId: record.versionId || null,
        entityIds: (record.entityIds || []).filter(function (eid) { return engine.isVisible(state, eid); }),
        restrictedTo: record.restrictedTo || null,
        open: state.desktop && state.desktop.evidenceOpenId === record.id
      };
    }).filter(Boolean);
    return { items: list, hiddenCount: hidden };
  }

  function desktopModel(ctx, sessionId) {
    var engine = engineFor(ctx);
    var state = ctx.state;
    var desktop = engine.desktopOf();
    var fmt = engine.format();
    var workspace = sessionId ? engine.workspaceOfSession(sessionId) : null;
    if (!sessionId || !workspace) {
      /* No session given: fall back to the selected workspace's session. */
      var wsId = state.desktop ? state.desktop.workspaceId : null;
      workspace = wsId ? engine.workspaceOf(wsId) : null;
      sessionId = workspace ? workspace.sessionId : null;
    }
    if (!workspace || !sessionId) return null;
    var session = state.desktop && state.desktop.sessions ? state.desktop.sessions[sessionId] : null;
    if (!session) return null;
    var readOnly = !engine.can(state, 'maintainModel').ok;
    var scenario = session.playback && session.playback.scenarioId ? engine.scenarioOf(session.playback.scenarioId) : null;
    var reviewScenario = session.review ? engine.scenarioOf(session.review.scenarioId) : scenario;
    var formScenario = session.form ? engine.scenarioOf(session.form.scenarioId) : scenario;
    var events = (session.events || []).map(function (ev) { return renderEvent(engine, ctx, session, ev, readOnly); });
    var review = readOnly ? null : reviewModel(engine, ctx, session, reviewScenario);
    var form = readOnly ? null : formModel(engine, ctx, session, formScenario);
    var evidence = evidenceList(engine, ctx, workspace);
    var pendingReview = !!(review && review.state === 'pending');
    var workspaces = ((ctx.pack && ctx.pack.raw) || ctx.pack || {}).desktop ? (((ctx.pack && ctx.pack.raw) || ctx.pack).desktop.workspaces || []) : [];
    return {
      sessionId: sessionId,
      workspaceId: workspace.id,
      workspace: {
        id: workspace.id,
        label: workspace.label,
        statusLabel: workspace.statusLabel || null,
        processId: workspace.processId || null,
        processName: workspace.processId && engine.entityOf(workspace.processId) ? engine.entityOf(workspace.processId).name : null,
        evidenceIds: (workspace.evidenceIds || []).slice(),
        scenarioIds: (workspace.scenarioIds || []).slice(),
        welcome: workspace.welcome || null,
        welcomeActions: clone(workspace.welcomeActions || [])
      },
      workspaces: workspaces.map(function (w) {
        var s = state.desktop && state.desktop.sessions ? state.desktop.sessions[w.sessionId] : null;
        var pbs = s && s.playback ? s.playback.status : 'idle';
        return {
          id: w.id,
          label: w.label,
          sessionId: w.sessionId,
          statusLabel: w.statusLabel || null,
          selected: w.id === workspace.id,
          playbackStatus: pbs,
          unread: s ? s.unread || 0 : 0,
          pendingReview: !!(s && s.review && s.review.state === 'pending'),
          needsAttention: pbs === 'awaiting-review' || pbs === 'failed' || pbs === 'paused'
        };
      }),
      chips: chipsFor(engine, ctx, workspace),
      session: {
        mode: session.mode || 'chat',
        draft: session.draft || '',
        unread: session.unread || 0,
        atLatest: session.atLatest !== false,
        expandedTools: clone(session.expandedTools || {}),
        eventCount: events.length
      },
      modes: clone(desktop.modes || []),
      events: events,
      review: review,
      form: form,
      operations: engine.operationsRows(session),
      operationsColumns: (desktop.operationsColumns || []).slice(),
      artifact: artifactModel(engine, ctx, sessionId, session, readOnly),
      playback: playbackModel(engine, ctx, sessionId, session, readOnly),
      footer: {
        sessionOnly: desktop.footer ? desktop.footer.sessionOnly || null : null,
        pendingReview: pendingReview && desktop.footer ? desktop.footer.pendingReview || null : null
      },
      readOnly: readOnly,
      readOnlyMessage: readOnly ? desktop.readOnlyMessage || fmt.msgText('MSG-03') : null,
      readOnlyCta: readOnly ? { label: engine.uiText('useAnalystProfile', 'Usar perfil de analista'), command: { type: 'useAnalystProfile', payload: {} } } : null,
      evidence: evidence.items,
      evidenceHiddenCount: evidence.hiddenCount,
      evidenceNotice: evidence.hiddenCount > 0 ? desktop.employeeToBeMessage || null : null,
      evidenceOpenId: state.desktop ? state.desktop.evidenceOpenId || null : null,
      evidencePicker: desktop.evidencePicker ? clone(desktop.evidencePicker) : null,
      composer: Object.assign({ enabled: !readOnly }, clone(desktop.composer || {})),
      unsupportedMessage: desktop.unsupported || null,
      texts: {
        title: desktop.title || null,
        intro: desktop.intro || null,
        disclaimer: desktop.disclaimer || null,
        regions: clone(desktop.regions || {}),
        newMessages: session.unread ? fmt.ui('newMessages', { n: session.unread }) : null,
        jumpToLatest: engine.uiText('jumpToLatest', 'Ir al último mensaje'),
        processing: fmt.msgText(MSG_PROCESSING)
      },
      unread: session.unread || 0,
      navigation: state.desktop && state.desktop.navigation ? clone(state.desktop.navigation) : null
    };
  }

  function scenarioAvailability(ctx, scenarioId) {
    var engine = engineFor(ctx);
    var result = engine.availability(ctx.state, scenarioId);
    var scenario = engine.scenarioOf(scenarioId);
    result.scenario = scenario ? { id: scenario.id, title: scenario.title, sessionId: scenario.sessionId, workspaceId: scenario.workspaceId, trigger: clone(scenario.trigger || null) } : null;
    if (scenario) {
      var session = ctx.state.desktop && ctx.state.desktop.sessions ? ctx.state.desktop.sessions[scenario.sessionId] : null;
      result.sessionBusy = !!(session && START_STATUSES.indexOf(engine.playbackOf(session).status) === -1);
      result.readOnly = !engine.can(ctx.state, 'maintainModel').ok;
      result.canStart = result.ok && !result.sessionBusy && !result.readOnly;
    }
    return result;
  }

  function operationsRowsSelector(ctx, sessionId) {
    var engine = engineFor(ctx);
    var session = ctx.state.desktop && ctx.state.desktop.sessions ? ctx.state.desktop.sessions[sessionId] : null;
    return session ? engine.operationsRows(session) : [];
  }

  function artifactPreview(ctx, sessionId) {
    var engine = engineFor(ctx);
    var session = ctx.state.desktop && ctx.state.desktop.sessions ? ctx.state.desktop.sessions[sessionId] : null;
    if (!session) return null;
    var readOnly = !engine.can(ctx.state, 'maintainModel').ok;
    return artifactModel(engine, ctx, sessionId, session, readOnly);
  }

  return {
    createScenarioEngine: createScenarioEngine,
    effectiveEventId: effectiveEventId,
    effectiveRequestId: effectiveRequestId,
    selectors: {
      desktopModel: desktopModel,
      scenarioAvailability: scenarioAvailability,
      operationsRows: operationsRowsSelector,
      artifactPreview: artifactPreview
    },
    PLAYBACK_STATUSES: PLAYBACK_STATUSES,
    REVIEW_STATES: REVIEW_STATES,
    TIMER_TAG: TIMER_TAG
  };
});
