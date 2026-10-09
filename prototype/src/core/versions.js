/* core/versions — version snapshots for the desktop scenarios (CONTRACTS §5.8, spec §10.5,
 * §16.4).
 *
 * Creates the two demo versions that do not exist in the pack:
 *   - V-TOBE-03 (publishDemoVersion): clone of V-TOBE-02 with the T-02 instruction replaced
 *     by the reviewed text, provenance inferred/proposed, pending list inherited.
 *   - V-ASIS-02 (promoteDemoVersion): clone of V-TOBE-03 adopted as AS-IS, PM-01 concluded,
 *     currentAsIsVersionId moved — one atomic mutation on the draft state.
 * Both are idempotent by effective requestId (spec §14.1). Every text comes from the
 * scenario record in the pack (`outcome`, `diff`, `artifact`), never from code.
 *
 * Pure with respect to the DOM: safe to load in Node. Functions receive the mutable draft
 * state of a command; errors are thrown as Error objects with `code`/`field`/`messageId`
 * so a command can convert them through ctx.fail. */
Primus.module('core/versions', function () {
  'use strict';

  var EDIT_SOURCE_ID = 'S-DEMO';
  var LABEL_PROPOSED = 'Propuesto · por validar';
  var LABEL_DEMO = 'Ejemplo de demostración';
  var DEFAULT_ADOPTION_LABEL = 'AS-IS de demostración · adopción simulada';
  var DEFAULT_DERIVED_LABEL = 'Derivada de una propuesta';
  var YAML_INDENT = '  ';

  /* ---------- generic helpers ---------- */

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }

  function mapGet(collection, id) {
    if (!collection || id === null || id === undefined) return undefined;
    if (typeof collection.get === 'function') return collection.get(id);
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i++) if (collection[i] && collection[i].id === id) return collection[i];
      return undefined;
    }
    return collection[id];
  }

  function mapValues(collection) {
    if (!collection) return [];
    if (typeof collection.values === 'function' && !Array.isArray(collection)) return Array.from(collection.values());
    if (Array.isArray(collection)) return collection.slice();
    return Object.keys(collection).map(function (k) { return collection[k]; });
  }

  function recordIn(list, id) {
    if (!Array.isArray(list)) return undefined;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return undefined;
  }

  function failure(code, message, extra) {
    var err = new Error(message || code);
    err.code = code;
    err.isCommandError = true;
    err.name = 'CommandError';
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k] !== undefined) err[k] = extra[k]; });
    return err;
  }

  function uniq(list) {
    var out = [];
    (list || []).forEach(function (v) { if (v !== null && v !== undefined && out.indexOf(v) === -1) out.push(v); });
    return out;
  }

  function trimString(value) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim() : '';
  }

  /* ---------- YAML scalar rendering (spec §10.5: escape quotes/newlines) ---------- */

  function yamlNeedsQuotes(str) {
    if (str === '') return true;
    if (/[:#"'\\\n\r\t]/.test(str)) return true;
    if (/^[\s\-?,\[\]{}&*!|>%@`]/.test(str)) return true;
    if (/^\s|\s$/.test(str)) return true;
    if (/^(true|false|null|~|yes|no|on|off)$/i.test(str)) return true;
    if (/^[-+]?(\d[\d_]*\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(str)) return true;
    return false;
  }

  function yamlScalar(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return isFinite(value) ? String(value) : 'null';
    var str = String(value);
    if (!yamlNeedsQuotes(str)) return str;
    return '"' + str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t') + '"';
  }

  function yamlFlowList(values) {
    return '[' + (values || []).map(yamlScalar).join(', ') + ']';
  }

  /* ---------- factory ---------- */

  function createVersions(store) {
    var pack = store && store.pack;

    function packRaw() { return raw(pack); }

    function entityOf(id) {
      if (!pack) return undefined;
      if (pack.entities && typeof pack.entities.get === 'function') return pack.entities.get(id);
      var r = packRaw();
      return recordIn((r.organization && r.organization.entities) || [], id);
    }

    function allEntities() {
      if (pack && pack.entities && typeof pack.entities.values === 'function') return Array.from(pack.entities.values());
      var r = packRaw();
      return (r.organization && r.organization.entities) || [];
    }

    function scenarioOf(id) {
      if (!pack) return undefined;
      if (pack.scenarios && typeof pack.scenarios.get === 'function') return pack.scenarios.get(id);
      return recordIn(packRaw().scenarios || [], id);
    }

    function allScenarios() {
      if (pack && pack.scenarios && typeof pack.scenarios.values === 'function') return Array.from(pack.scenarios.values());
      return packRaw().scenarios || [];
    }

    function packVersion(id) {
      if (!pack) return undefined;
      if (pack.versions && typeof pack.versions.get === 'function') return pack.versions.get(id);
      var r = packRaw();
      return recordIn((r.organization && r.organization.versions) || [], id);
    }

    function trackingOf() { return packRaw().tracking || {}; }

    function businessDate() {
      var d = packRaw().demo;
      return (d && d.businessDate) || null;
    }

    function sourceOf(id) {
      if (pack && pack.sources && typeof pack.sources.get === 'function') return pack.sources.get(id);
      return recordIn(packRaw().sources || [], id);
    }

    function currentState(state) {
      if (state) return state;
      return typeof store.getState === 'function' ? store.getState() : null;
    }

    function now() {
      return typeof store.now === 'function' ? store.now() : null;
    }

    function tick() {
      if (typeof store.tick === 'function') return store.tick();
      return now();
    }

    /* Resolves a version from the draft state first (demo versions created in this dispatch),
     * then through the store, then from the pack. */
    function resolveVersion(state, versionId) {
      if (!versionId) return undefined;
      var s = currentState(state);
      if (s && s.demo && s.demo.versions && s.demo.versions[versionId]) return s.demo.versions[versionId];
      if (typeof store.getVersion === 'function') {
        var v = store.getVersion(versionId, s || undefined);
        if (v) return v;
      }
      return packVersion(versionId);
    }

    function baseActivitiesOf(versionId) {
      var out = {};
      if (pack && typeof pack.baseActivities === 'function') {
        var m = pack.baseActivities(versionId);
        if (m && typeof m.forEach === 'function' && !Array.isArray(m) && typeof m.get === 'function') {
          m.forEach(function (activity, key) { out[key] = clone(activity); });
          return out;
        }
        if (m && typeof m === 'object') {
          Object.keys(m).forEach(function (key) { out[key] = clone(m[key]); });
          return out;
        }
      }
      allEntities().forEach(function (e) {
        if (!e || e.type !== 'activity' || !e.attributes || e.attributes.versionId !== versionId) return;
        out[e.attributes.key || e.id] = clone(e);
      });
      return out;
    }

    /* Fully resolved { key → activity } map for a version (pack or demo-created). */
    function activitiesOf(version) {
      if (!version) return {};
      if (version.activities && typeof version.activities === 'object' && Object.keys(version.activities).length) {
        return clone(version.activities);
      }
      var acts = baseActivitiesOf(version.id);
      var overrides = version.activityOverrides || {};
      Object.keys(overrides).forEach(function (key) {
        if (!acts[key]) return;
        var patch = overrides[key] || {};
        acts[key].attributes = Object.assign({}, acts[key].attributes || {}, patch.attributes || {});
        Object.keys(patch).forEach(function (k) { if (k !== 'attributes') acts[key][k] = clone(patch[k]); });
      });
      return acts;
    }

    function processOwnerAreaId(processId) {
      var graph = store && store.graph;
      if (graph && typeof graph.processArea === 'function') {
        try {
          var area = graph.processArea(processId);
          if (area) return typeof area === 'string' ? area : area.id || null;
        } catch (e) { /* fall through to relations */ }
      }
      var relations = [];
      if (pack && pack.relationsFrom && typeof pack.relationsFrom.get === 'function') relations = pack.relationsFrom.get(processId) || [];
      else {
        var r = packRaw();
        relations = ((r.organization && r.organization.relations) || []).filter(function (rel) { return rel && rel.from === processId; });
      }
      for (var i = 0; i < relations.length; i++) {
        if (relations[i] && relations[i].type === 'tieneDueñoÁrea') return relations[i].to;
      }
      var process = entityOf(processId);
      return (process && process.attributes && process.attributes.ownerAreaId) || null;
    }

    function projectStatusLabel(status) {
      var labels = trackingOf().projectStatusLabels || {};
      return labels[status] || status || null;
    }

    function scenarioForVersion(versionId) {
      var list = allScenarios();
      for (var i = 0; i < list.length; i++) {
        var sc = list[i];
        if (sc && sc.outcome && sc.outcome.version && sc.outcome.version.id === versionId) return sc;
      }
      return undefined;
    }

    function scenarioFor(ref) {
      if (!ref) return undefined;
      if (typeof ref === 'string') return scenarioOf(ref) || scenarioForVersion(ref);
      if (ref.scenarioId) return scenarioOf(ref.scenarioId);
      if (ref.id && scenarioOf(ref.id)) return scenarioOf(ref.id);
      return scenarioForVersion(ref.versionId || ref.id);
    }

    function appendLog(state, profileId, action, result) {
      var log = state.demo.log || (state.demo.log = []);
      var last = log.length ? log[log.length - 1] : null;
      var seq = last && typeof last.seq === 'number' ? last.seq + 1 : log.length + 1;
      var at = tick();
      var entry = { seq: seq, at: at, profileId: profileId || (state.app && state.app.profileId) || null, action: action, result: result };
      log.push(entry);
      return entry;
    }

    function appendFollowUp(project, entry) {
      if (!project) return;
      if (!Array.isArray(project.followUp)) project.followUp = [];
      project.followUp.push(entry);
    }

    function applyProjectUpdates(state, scenario, params, at, profileId, actionLabel) {
      var updates = (scenario.outcome && scenario.outcome.projectUpdates) || [];
      var touched = [];
      updates.forEach(function (u) {
        var project = recordIn(state.demo.projects, u.projectId);
        if (!project) throw failure('unknown-record', 'Proyecto no encontrado: ' + u.projectId, { field: 'projectId' });
        Object.keys(u.set || {}).forEach(function (key) {
          var value = u.set[key];
          if (typeof value === 'string') {
            value = value.replace(/\{([A-Za-z0-9_]+)\}/g, function (m, name) {
              return params && params[name] !== undefined && params[name] !== null ? String(params[name]) : m;
            });
          }
          project[key] = value;
        });
        if (u.set && u.set.status === 'concluded' && !project.closedAt) project.closedAt = businessDate();
        appendFollowUp(project, { at: at, profileId: profileId, action: actionLabel, versionId: scenario.outcome.version.id });
        touched.push(project.id);
      });
      return touched;
    }

    /* ---------- staging (SCN-01 E09) ---------- */

    function stagingDraft(scenario, fields, state) {
      var diff = scenario.diff || {};
      var outcome = (scenario.outcome && scenario.outcome.version) || {};
      var instruction = fields && typeof fields.instruction === 'string' && trimString(fields.instruction) ? trimString(fields.instruction) : diff.after;
      var note = fields && typeof fields.note === 'string' ? trimString(fields.note) : '';
      var edited = instruction !== diff.after;
      var base = resolveVersion(state, diff.baseVersionId);
      var activities = activitiesOf(base);
      var activity = activities[diff.activityKey] || null;
      var sourceIds = uniq((diff.sourceIds || []).concat(edited ? [EDIT_SOURCE_ID] : []));
      return {
        versionId: outcome.id || diff.versionId,
        scenarioId: scenario.id,
        processId: outcome.processId || (base && base.processId) || scenario.processId || null,
        type: outcome.type || (base && base.type) || null,
        baseVersionId: diff.baseVersionId,
        activityKey: diff.activityKey,
        activityName: activity ? activity.name : null,
        roleIds: activity && activity.attributes ? (activity.attributes.roleIds || []).slice() : [],
        before: diff.before,
        after: diff.after,
        instruction: instruction,
        note: note,
        edited: edited,
        versionNote: diff.versionNote || null,
        pending: (diff.pending || (base && base.pending) || []).slice(),
        sourceIds: sourceIds,
        confidence: diff.confidence || 'inferred',
        dataState: diff.dataState || 'proposed',
        label: outcome.label || null,
        stateLabel: outcome.stateLabel || null
      };
    }

    function diffRowsFor(draft) {
      var label = draft.activityKey && draft.activityName ? draft.activityKey + ' · ' + draft.activityName : (draft.activityKey || null);
      return [{ id: 'instruction', key: draft.activityKey, label: label, before: draft.before, after: draft.instruction, edited: draft.edited }];
    }

    function describeStaging(scenario, fields, state) {
      var sc = typeof scenario === 'string' ? scenarioOf(scenario) : scenario;
      if (!sc) throw failure('unknown-scenario', 'Escenario desconocido', { field: 'scenarioId' });
      var s = currentState(state);
      var draft = stagingDraft(sc, fields || {}, s);
      return {
        versionDraft: draft,
        diffRows: diffRowsFor(draft),
        artifactYaml: artifactYaml(draft, { state: s })
      };
    }

    function stageVersion(state, payload) {
      var p = payload || {};
      var sc = scenarioOf(p.scenarioId);
      if (!sc || !sc.diff) throw failure('unknown-scenario', 'Escenario desconocido: ' + p.scenarioId, { field: 'scenarioId' });
      var draft = stagingDraft(sc, p, state);
      var entry = Object.assign({}, draft, {
        state: 'staged',
        stagedAt: now(),
        runOrdinal: p.runOrdinal !== undefined ? p.runOrdinal : null,
        sessionId: p.sessionId || sc.sessionId || null,
        publishedVersionId: null
      });
      if (!state.demo.staging) state.demo.staging = {};
      state.demo.staging[entry.versionId] = entry;
      return entry;
    }

    /* ---------- publish (SCN-01 R-01 approve) ---------- */

    function publishDemoVersion(state, payload) {
      var p = payload || {};
      var sc = scenarioOf(p.scenarioId);
      if (!sc || !sc.diff || !sc.outcome || !sc.outcome.version) {
        throw failure('unknown-scenario', 'Escenario desconocido: ' + p.scenarioId, { field: 'scenarioId' });
      }
      var diff = sc.diff;
      var outcome = sc.outcome.version;
      var targetId = outcome.id;
      var requestId = p.requestId || null;
      if (!state.demo.requestIds) state.demo.requestIds = {};
      if (!state.demo.versions) state.demo.versions = {};

      /* Idempotency: a resolved requestId or an existing target never publishes twice. */
      if (requestId && state.demo.requestIds[requestId] && state.demo.versions[targetId]) return state.demo.versions[targetId];
      if (state.demo.versions[targetId]) {
        if (requestId) state.demo.requestIds[requestId] = true;
        return state.demo.versions[targetId];
      }

      var base = resolveVersion(state, diff.baseVersionId);
      if (!base) throw failure('unknown-version', 'Versión base no encontrada: ' + diff.baseVersionId, { field: 'baseVersionId' });
      var instruction = typeof p.instruction === 'string' ? trimString(p.instruction) : '';
      if (!instruction) throw failure('invalid-instruction', 'La instrucción propuesta está vacía', { field: 'instruction', messageId: 'MSG-04' });
      var note = typeof p.note === 'string' ? trimString(p.note) : '';
      var edited = instruction !== diff.after;
      var profileId = p.actorProfileId || (state.app && state.app.profileId) || null;

      var activities = activitiesOf(base);
      Object.keys(activities).forEach(function (key) {
        var a = activities[key];
        a.attributes = Object.assign({}, a.attributes || {}, { versionId: targetId, key: a.attributes && a.attributes.key ? a.attributes.key : key });
      });
      var target = activities[diff.activityKey];
      if (!target) throw failure('unknown-activity', 'Actividad no encontrada en la versión base: ' + diff.activityKey, { field: 'activityKey' });
      var activitySources = uniq((diff.sourceIds || []).concat(edited ? [EDIT_SOURCE_ID] : []));
      target.attributes.instruction = instruction;
      target.attributes.whatToDo = instruction;
      target.description = instruction;
      target.provenance = {
        sourceIds: activitySources,
        confidence: diff.confidence || 'inferred',
        observedAt: null,
        dataState: diff.dataState || 'proposed'
      };
      target.labels = uniq([LABEL_PROPOSED].concat(edited ? [LABEL_DEMO] : []));
      target.isDemo = true;
      target.edited = edited;

      var at = tick();
      var versionSources = uniq((diff.sourceIds || []).concat(edited ? [EDIT_SOURCE_ID] : []));
      var version = Object.assign(clone(base), {
        id: targetId,
        processId: outcome.processId || base.processId,
        type: outcome.type || base.type,
        label: outcome.label,
        state: outcome.state || 'published-demo',
        stateLabel: outcome.stateLabel,
        flowId: base.flowId,
        baseVersionId: diff.baseVersionId,
        originVersionId: null,
        publishedAt: at,
        publishedBy: outcome.publishedBy || null,
        publishedByProfileId: profileId,
        summary: outcome.summary,
        changeLabel: outcome.changeLabel,
        sourceIds: versionSources,
        provenance: {
          sourceIds: versionSources,
          confidence: diff.confidence || 'inferred',
          observedAt: null,
          dataState: diff.dataState || 'proposed'
        },
        labels: uniq([LABEL_PROPOSED].concat(edited ? [LABEL_DEMO] : [])),
        publishable: false,
        isDemo: true,
        pending: (base.pending || diff.pending || []).slice(),
        notes: uniq((base.notes || []).concat(diff.versionNote ? [diff.versionNote] : [])),
        reviewNote: note || null,
        edited: edited,
        activityOverrides: {},
        activities: activities,
        diff: {
          activityKey: diff.activityKey,
          before: diff.before,
          after: instruction,
          proposed: diff.after,
          versionNote: diff.versionNote || null
        },
        scenarioId: sc.id,
        requestId: requestId,
        runOrdinal: p.runOrdinal !== undefined ? p.runOrdinal : null
      });
      version.activityOverrides[diff.activityKey] = {
        attributes: { instruction: instruction, whatToDo: instruction },
        provenance: clone(target.provenance),
        labels: target.labels.slice()
      };

      state.demo.versions[targetId] = version;
      if (requestId) state.demo.requestIds[requestId] = true;
      if (state.demo.staging && state.demo.staging[targetId]) {
        state.demo.staging[targetId].state = 'published';
        state.demo.staging[targetId].publishedVersionId = targetId;
        state.demo.staging[targetId].instruction = instruction;
        state.demo.staging[targetId].edited = edited;
        state.demo.staging[targetId].sourceIds = versionSources;
      }
      var actionLabel = sc.outcome.logAction || 'Publicar versión de demo';
      applyProjectUpdates(state, sc, {}, at, profileId, actionLabel);
      var logEntry = appendLog(state, profileId, actionLabel, targetId + ' · ' + (outcome.changeLabel || outcome.label || ''));
      version.publishedAt = logEntry.at || version.publishedAt;
      return version;
    }

    /* ---------- promotion (SCN-02) ---------- */

    function promotionScenario(projectId) {
      var list = allScenarios();
      for (var i = 0; i < list.length; i++) {
        var sc = list[i];
        if (!sc || !sc.outcome || !sc.outcome.version) continue;
        if (sc.outcome.version.setCurrentAsIs && (!projectId || sc.projectId === projectId)) return sc;
      }
      return undefined;
    }

    function formEventOf(scenario) {
      var events = (scenario && scenario.events) || [];
      for (var i = 0; i < events.length; i++) if (events[i].kind === 'form-request') return events[i];
      return null;
    }

    function diffSpecEventOf(scenario) {
      var events = (scenario && scenario.events) || [];
      for (var i = 0; i < events.length; i++) if (Array.isArray(events[i].diffSpec)) return events[i];
      return null;
    }

    function describePromotion(state, payload) {
      var p = payload || {};
      var s = currentState(state);
      var sc = (p.scenarioId && scenarioOf(p.scenarioId)) || promotionScenario(p.projectId);
      if (!sc) throw failure('unknown-scenario', 'Escenario de promoción no encontrado', { field: 'scenarioId' });
      var projectId = p.projectId || sc.projectId;
      var project = recordIn(s.demo.projects, projectId);
      if (!project) throw failure('unknown-record', 'Proyecto no encontrado: ' + projectId, { field: 'projectId' });
      var outcome = sc.outcome.version;
      var params = {
        projectStatus: projectStatusLabel(project.status),
        projectId: project.id,
        result: typeof p.result === 'string' ? trimString(p.result) : (project.result || ''),
        backingReference: typeof p.backingReference === 'string' ? trimString(p.backingReference) : (project.backingReference || ''),
        versionId: outcome.id,
        originVersionId: outcome.originVersionId || outcome.baseVersionId,
        currentAsIs: s.demo.currentAsIsVersionId
      };
      function fill(value) {
        if (value === null || value === undefined) return null;
        if (typeof value !== 'string') return value;
        return value.replace(/\{([A-Za-z0-9_]+)\}/g, function (m, name) {
          return params[name] !== undefined && params[name] !== null ? String(params[name]) : m;
        });
      }
      var specEvent = diffSpecEventOf(sc);
      var rows = [];
      if (specEvent) {
        specEvent.diffSpec.forEach(function (row, index) {
          var before = fill(row.from);
          var after = fill(row.to);
          /* "before" always reflects the current state, never a literal from the script:
           * a backing reference already registered, or an AS-IS pointer already moved. */
          if (row.from === null && typeof row.to === 'string' && row.to.indexOf('{backingReference}') !== -1 && project.backingReference) {
            before = project.backingReference;
          }
          if (typeof row.from === 'string' && row.from === outcome.id) before = s.demo.currentAsIsVersionId;
          if (typeof row.from === 'string' && /^V-/.test(row.from) && row.to === outcome.id && s.demo.currentAsIsVersionId) {
            before = s.demo.currentAsIsVersionId;
          }
          rows.push({ id: 'row-' + (index + 1), label: row.label, before: before, after: after, unchanged: before === after });
        });
      }
      return rows;
    }

    function promoteDemoVersion(state, payload) {
      var p = payload || {};
      var sc = (p.scenarioId && scenarioOf(p.scenarioId)) || promotionScenario(p.projectId);
      if (!sc || !sc.outcome || !sc.outcome.version) throw failure('unknown-scenario', 'Escenario de promoción no encontrado', { field: 'scenarioId' });
      var outcome = sc.outcome.version;
      var targetId = outcome.id;
      var originId = outcome.originVersionId || outcome.baseVersionId;
      var projectId = p.projectId || sc.projectId;
      var requestId = p.requestId || null;
      if (!state.demo.requestIds) state.demo.requestIds = {};
      if (!state.demo.versions) state.demo.versions = {};

      if (requestId && state.demo.requestIds[requestId] && state.demo.versions[targetId]) return state.demo.versions[targetId];
      if (state.demo.versions[targetId]) {
        if (requestId) state.demo.requestIds[requestId] = true;
        return state.demo.versions[targetId];
      }

      /* Validate everything before touching the draft (single commit). */
      var origin = resolveVersion(state, originId);
      if (!origin) throw failure('unknown-version', 'Versión de origen no encontrada: ' + originId, { field: 'originVersionId', messageId: 'MSG-13' });
      var project = recordIn(state.demo.projects, projectId);
      if (!project) throw failure('unknown-record', 'Proyecto no encontrado: ' + projectId, { field: 'projectId' });
      var result = typeof p.result === 'string' ? trimString(p.result) : '';
      var backingReference = typeof p.backingReference === 'string' ? trimString(p.backingReference) : '';
      if (!result) throw failure('invalid-result', 'El resultado de la mejora es obligatorio', { field: 'result', messageId: 'MSG-04' });
      if (!backingReference) throw failure('invalid-reference', 'La referencia de respaldo interno es obligatoria', { field: 'backingReference', messageId: 'MSG-04' });
      var profileId = p.actorProfileId || (state.app && state.app.profileId) || null;

      var activities = activitiesOf(origin);
      Object.keys(activities).forEach(function (key) {
        var a = activities[key];
        a.attributes = Object.assign({}, a.attributes || {}, { versionId: targetId, key: a.attributes && a.attributes.key ? a.attributes.key : key });
      });

      var at = tick();
      var sourceIds = uniq((outcome.sourceIds || origin.sourceIds || []).concat([EDIT_SOURCE_ID]));
      var version = Object.assign(clone(origin), {
        id: targetId,
        processId: outcome.processId || origin.processId,
        type: outcome.type || 'AS-IS',
        label: outcome.label,
        state: outcome.state || 'adopted-demo',
        stateLabel: outcome.stateLabel,
        flowId: origin.flowId,
        baseVersionId: outcome.baseVersionId || originId,
        originVersionId: originId,
        adoptionLabel: outcome.adoptionLabel || DEFAULT_ADOPTION_LABEL,
        derivedLabel: outcome.derivedLabel || DEFAULT_DERIVED_LABEL,
        publishedAt: at,
        publishedBy: outcome.publishedBy || null,
        publishedByProfileId: profileId,
        summary: outcome.summary,
        changeLabel: outcome.changeLabel,
        sourceIds: sourceIds,
        provenance: {
          sourceIds: sourceIds,
          confidence: 'inferred',
          observedAt: null,
          dataState: 'proposed'
        },
        labels: uniq([LABEL_DEMO]),
        publishable: false,
        isDemo: true,
        pending: (origin.pending || []).slice(),
        notes: (origin.notes || []).slice(),
        reviewNote: null,
        activityOverrides: clone(origin.activityOverrides || {}),
        activities: activities,
        adoption: { projectId: project.id, result: result, backingReference: backingReference, previousAsIsVersionId: state.demo.currentAsIsVersionId },
        scenarioId: sc.id,
        requestId: requestId,
        runOrdinal: p.runOrdinal !== undefined ? p.runOrdinal : null
      });

      /* Atomic mutation: version + project + pointer + log on the same draft. */
      state.demo.versions[targetId] = version;
      if (requestId) state.demo.requestIds[requestId] = true;
      var actionLabel = sc.outcome.logAction || 'Publicar nuevo AS-IS de demo';
      applyProjectUpdates(state, sc, { result: result, backingReference: backingReference }, at, profileId, actionLabel);
      if (outcome.setCurrentAsIs !== false) state.demo.currentAsIsVersionId = targetId;
      var logEntry = appendLog(state, profileId, actionLabel, targetId + ' · ' + (outcome.changeLabel || outcome.label || ''));
      version.publishedAt = logEntry.at || version.publishedAt;
      return version;
    }

    /* ---------- artifact YAML (spec §10.5, exact key order) ---------- */

    function artifactYaml(versionLike, options) {
      var opts = options || {};
      var s = currentState(opts.state);
      var v = versionLike || {};
      var sc = scenarioFor(v) || scenarioForVersion(v.versionId || v.id);
      var artifact = (sc && sc.artifact) || {};
      var diff = (sc && sc.diff) || {};
      var versionId = v.versionId || v.id || diff.versionId || null;
      var published = !!(s && s.demo && s.demo.versions && versionId && s.demo.versions[versionId]) || v.state === 'published-demo' || v.state === 'published';
      var baseId = v.baseVersionId || diff.baseVersionId || null;
      var base = baseId ? resolveVersion(s, baseId) : null;
      var processId = v.processId || (base && base.processId) || (sc && sc.processId) || null;
      var process = processId ? entityOf(processId) : null;
      var type = v.type || (base && base.type) || null;
      var estado = published ? (artifact.stateAfter || 'publicada-en-demo') : (artifact.stateBefore || 'propuesta-en-demo');
      var activityKey = v.activityKey || diff.activityKey || null;
      var activity = null;
      if (v.activities && activityKey && v.activities[activityKey]) activity = v.activities[activityKey];
      else if (base && activityKey) activity = activitiesOf(base)[activityKey] || null;
      var activityName = v.activityName || (activity && activity.name) || null;
      var roleIds = (v.roleIds && v.roleIds.length) ? v.roleIds : (activity && activity.attributes && activity.attributes.roleIds) || [];
      var instruction = v.instruction !== undefined ? v.instruction
        : (activity && activity.attributes && activity.attributes.instruction) || diff.after || null;
      var sourceIds = v.sourceIds || (v.provenance && v.provenance.sourceIds) || diff.sourceIds || [];
      var pending = v.pending || diff.pending || (base && base.pending) || [];
      var lines = [];
      lines.push('id: ' + yamlScalar(processId));
      lines.push('nombre: ' + yamlScalar(process ? process.name : null));
      lines.push('version: ' + yamlScalar(versionId));
      lines.push('tipo: ' + yamlScalar(type));
      lines.push('estado: ' + yamlScalar(estado));
      lines.push('version_base: ' + yamlScalar(baseId));
      lines.push('dueno_area: ' + yamlScalar(processId ? processOwnerAreaId(processId) : null));
      lines.push('actividad:');
      lines.push(YAML_INDENT + 'id: ' + yamlScalar(activityKey));
      lines.push(YAML_INDENT + 'nombre: ' + yamlScalar(activityName));
      lines.push(YAML_INDENT + 'responsable: ' + yamlScalar(roleIds.length ? roleIds[0] : null));
      lines.push(YAML_INDENT + 'instruccion: ' + yamlScalar(instruction));
      lines.push('fuentes: ' + yamlFlowList(sourceIds));
      lines.push('pendientes:');
      pending.forEach(function (item) { lines.push(YAML_INDENT + '- ' + yamlScalar(item)); });
      return lines.join('\n');
    }

    function artifactTitle(ref) {
      var sc = scenarioFor(ref);
      return sc && sc.artifact ? sc.artifact.title : null;
    }

    return {
      describeStaging: describeStaging,
      stageVersion: stageVersion,
      publishDemoVersion: publishDemoVersion,
      describePromotion: describePromotion,
      promoteDemoVersion: promoteDemoVersion,
      artifactYaml: artifactYaml,
      artifactTitle: artifactTitle,
      resolveVersion: resolveVersion,
      activitiesOf: activitiesOf,
      processOwnerAreaId: processOwnerAreaId,
      sourceOf: sourceOf,
      scenarioFor: scenarioFor
    };
  }

  return {
    createVersions: createVersions,
    yamlScalar: yamlScalar,
    yamlNeedsQuotes: yamlNeedsQuotes,
    EDIT_SOURCE_ID: EDIT_SOURCE_ID,
    LABEL_PROPOSED: LABEL_PROPOSED,
    LABEL_DEMO: LABEL_DEMO
  };
});
