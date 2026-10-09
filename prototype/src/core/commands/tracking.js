/* core/commands/tracking — incidents and improvement projects (CONTRACTS §6 "Tracking",
 * spec §10.4 WEB-08 / WEB-09, §16.5, FR-017/FR-018).
 *
 * Every command checks `trackProcess` through permissions, validates the whole payload and
 * fails with a CommandError before touching the draft. Validation errors carry
 * { code: 'validation', field, messageId, params, errors } where `errors` maps every invalid
 * field to its exact message text (MSG-04/05/06), so the UI can show inline errors and focus
 * the first one. Records are session-only, isDemo, created on the fixed business date, and
 * every change is logged with a Spanish action label. */
Primus.module('core/commands/tracking', function (require) {
  'use strict';

  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var INCIDENT_EDITABLE = ['open', 'inProgress'];
  var PROJECT_EDITABLE = ['planned', 'inProgress'];
  var DEMO_SOURCE = 'S-DEMO';
  var ACTIONS = {
    createIncident: 'Crear incidencia',
    updateIncident: 'Editar incidencia',
    closeIncident: 'Cerrar incidencia',
    createProject: 'Crear proyecto',
    startProject: 'Iniciar proyecto',
    updateProject: 'Editar seguimiento',
    closeProject: 'Marcar concluido'
  };
  var RULES = {
    subject: { min: 5, max: 100 },
    description: { min: 10, max: 500 },
    resolution: { min: 10, max: 500 },
    name: { min: 5, max: 100 },
    objective: { min: 10, max: 500 },
    result: { min: 10, max: 500 }
  };

  function web() { return require('core/commands/web').helpers; }

  function raw(pack) { return (pack && pack.raw) || pack || {}; }
  function trackingOf(pack) { return raw(pack).tracking || {}; }
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

  function trimmed(value) { return sanitize(value).trim(); }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function processIdOf(ctx) {
    return trackingOf(ctx.pack).processId || web().defaultProcessId(ctx.pack) || null;
  }

  function nextId(ctx, counterKey, prefix) {
    var counters = ctx.state.demo.counters || (ctx.state.demo.counters = {});
    var n = typeof counters[counterKey] === 'number' ? counters[counterKey] : 1;
    counters[counterKey] = n + 1;
    return prefix + pad2(n);
  }

  function ruleFor(ctx, formKey, field) {
    var form = trackingOf(ctx.pack)[formKey];
    var rule = form && form.fields && form.fields[field];
    var fallback = RULES[field] || {};
    return {
      min: rule && typeof rule.min === 'number' ? rule.min : fallback.min,
      max: rule && typeof rule.max === 'number' ? rule.max : fallback.max
    };
  }

  function requiredError(ctx, field) {
    return { field: field, code: 'required', messageId: 'MSG-04', message: ctx.format.msgText('MSG-04') };
  }

  function lengthError(ctx, field, value, rule, required) {
    var text = trimmed(value);
    if (!text) return required ? requiredError(ctx, field) : null;
    if ((typeof rule.min === 'number' && text.length < rule.min) || (typeof rule.max === 'number' && text.length > rule.max)) {
      return {
        field: field, code: 'length', messageId: 'MSG-05',
        message: ctx.format.msgText('MSG-05', { min: rule.min, max: rule.max }),
        params: { min: rule.min, max: rule.max }
      };
    }
    return null;
  }

  function dateError(ctx, field, value, required) {
    var text = trimmed(value);
    if (!text) return required ? requiredError(ctx, field) : null;
    var valid = DATE_RE.test(text) && (typeof ctx.format.isValidDate === 'function' ? ctx.format.isValidDate(text) : true);
    if (!valid) return { field: field, code: 'invalid-date', messageId: 'MSG-06', message: ctx.format.msgText('MSG-06') };
    return null;
  }

  function optionError(ctx, field, value, options) {
    var text = trimmed(value);
    if (!text) return requiredError(ctx, field);
    if (options.indexOf(text) === -1) return { field: field, code: 'invalid-option', messageId: null, message: 'Opción no válida para ' + field };
    return null;
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

  function assertTracking(ctx, processId) {
    return web().assertCan(ctx, 'trackProcess', { processId: processId });
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

  function closeWebForm(ctx, slice, recordId) {
    var w = ctx.state.web;
    if (!w || !w[slice]) return;
    w[slice].form = null;
    if (recordId) w[slice].selectionId = recordId;
  }

  function followUp(ctx, project, action, detail) {
    if (!Array.isArray(project.followUp)) project.followUp = [];
    project.followUp.push({ at: nowOf(ctx), profileId: ctx.state.app ? ctx.state.app.profileId : null, action: action, detail: detail || null });
  }

  function incidentOf(ctx, id) {
    var record = recordIn(ctx.state.demo.incidents, id);
    if (!record) ctx.fail('unknown-record', 'Incidencia no encontrada: ' + id, { field: 'id' });
    return record;
  }

  function projectOf(ctx, id) {
    var record = recordIn(ctx.state.demo.projects, id);
    if (!record) ctx.fail('unknown-record', 'Proyecto no encontrado: ' + id, { field: 'id' });
    return record;
  }

  function targetVersionError(ctx, processId, versionId) {
    var id = trimmed(versionId);
    if (!id) return requiredError(ctx, 'targetVersionId');
    var version = ctx.store && typeof ctx.store.getVersion === 'function' ? ctx.store.getVersion(id, ctx.state) : null;
    if (!version) return { field: 'targetVersionId', code: 'unknown-version', messageId: 'MSG-13', message: ctx.format.msgText('MSG-13') };
    if (version.processId !== processId || version.type !== 'TO-BE' || version.state === 'incomplete-draft') {
      return { field: 'targetVersionId', code: 'invalid-version', messageId: null, message: 'La versión propuesta no es publicable' };
    }
    if (ctx.permissions && typeof ctx.permissions.canSeeVersion === 'function' && !ctx.permissions.canSeeVersion(ctx.state, id)) {
      return { field: 'targetVersionId', code: 'invalid-version', messageId: 'MSG-02', message: ctx.format.msgText('MSG-02') };
    }
    return null;
  }

  var commands = {

    /* createIncident {subject, description, responsibleId, dueDate} → INC-DEMO-0N, status open */
    createIncident: function (ctx, payload) {
      var p = payload || {};
      var processId = processIdOf(ctx);
      assertTracking(ctx, processId);
      var tracking = trackingOf(ctx.pack);
      var options = tracking.responsibleOptions || [];
      failValidation(ctx, [
        lengthError(ctx, 'subject', p.subject, ruleFor(ctx, 'incidentForm', 'subject'), true),
        lengthError(ctx, 'description', p.description, ruleFor(ctx, 'incidentForm', 'description'), true),
        optionError(ctx, 'responsibleId', p.responsibleId, options),
        dateError(ctx, 'dueDate', p.dueDate, true)
      ]);
      var record = {
        id: nextId(ctx, 'incident', 'INC-DEMO-'),
        subject: trimmed(p.subject),
        description: trimmed(p.description),
        processId: processId,
        responsibleId: trimmed(p.responsibleId),
        status: (tracking.incidentForm && tracking.incidentForm.initialStatus) || 'open',
        createdAt: businessDate(ctx.pack),
        dueDate: trimmed(p.dueDate),
        closedAt: null,
        resolution: null,
        isDemo: true,
        sourceIds: [DEMO_SOURCE],
        gapIds: [],
        createdBy: ctx.state.app ? ctx.state.app.profileId : null,
        createdAtClock: nowOf(ctx),
        updatedAt: null
      };
      ctx.state.demo.incidents.push(record);
      closeWebForm(ctx, 'incidents', record.id);
      appendLog(ctx, ACTIONS.createIncident, record.id + ' · ' + record.subject);
      return { id: record.id, record: JSON.parse(JSON.stringify(record)) };
    },

    /* updateIncident {id, subject?, description?, responsibleId?, dueDate?, status?: open|inProgress} */
    updateIncident: function (ctx, payload) {
      var p = payload || {};
      var record = incidentOf(ctx, p.id);
      assertTracking(ctx, record.processId);
      if (record.status === 'closed') ctx.fail('incident-closed', 'Una incidencia cerrada no se edita', { field: 'id' });
      var tracking = trackingOf(ctx.pack);
      var errors = [];
      if (p.subject !== undefined) errors.push(lengthError(ctx, 'subject', p.subject, ruleFor(ctx, 'incidentForm', 'subject'), true));
      if (p.description !== undefined) errors.push(lengthError(ctx, 'description', p.description, ruleFor(ctx, 'incidentForm', 'description'), true));
      if (p.responsibleId !== undefined) errors.push(optionError(ctx, 'responsibleId', p.responsibleId, tracking.responsibleOptions || []));
      if (p.dueDate !== undefined) errors.push(dateError(ctx, 'dueDate', p.dueDate, true));
      if (p.status !== undefined) {
        var editable = tracking.incidentEditableStatuses || INCIDENT_EDITABLE;
        if (p.status === 'closed') {
          errors.push({ field: 'status', code: 'invalid-status', messageId: null, message: 'Pasar a Cerrada requiere el formulario de resolución' });
        } else if (editable.indexOf(p.status) === -1) {
          errors.push({ field: 'status', code: 'invalid-status', messageId: null, message: 'Estado no válido: ' + p.status });
        }
      }
      failValidation(ctx, errors);
      var changed = [];
      if (p.subject !== undefined && trimmed(p.subject) !== record.subject) { record.subject = trimmed(p.subject); changed.push('subject'); }
      if (p.description !== undefined && trimmed(p.description) !== record.description) { record.description = trimmed(p.description); changed.push('description'); }
      if (p.responsibleId !== undefined && trimmed(p.responsibleId) !== record.responsibleId) { record.responsibleId = trimmed(p.responsibleId); changed.push('responsibleId'); }
      if (p.dueDate !== undefined && trimmed(p.dueDate) !== record.dueDate) { record.dueDate = trimmed(p.dueDate); changed.push('dueDate'); }
      if (p.status !== undefined && p.status !== record.status) { record.status = p.status; changed.push('status'); }
      record.updatedAt = nowOf(ctx);
      closeWebForm(ctx, 'incidents', record.id);
      appendLog(ctx, ACTIONS.updateIncident, record.id + ' · ' + record.subject);
      return { id: record.id, changed: changed, record: JSON.parse(JSON.stringify(record)) };
    },

    /* closeIncident {id, resolution} → status closed, closedAt = business date */
    closeIncident: function (ctx, payload) {
      var p = payload || {};
      var record = incidentOf(ctx, p.id);
      assertTracking(ctx, record.processId);
      if (record.status === 'closed') ctx.fail('already-closed', 'La incidencia ya está cerrada', { field: 'id' });
      failValidation(ctx, [lengthError(ctx, 'resolution', p.resolution, ruleFor(ctx, 'incidentForm', 'resolution'), true)]);
      record.status = 'closed';
      record.resolution = trimmed(p.resolution);
      record.closedAt = businessDate(ctx.pack);
      record.closedBy = ctx.state.app ? ctx.state.app.profileId : null;
      record.updatedAt = nowOf(ctx);
      closeWebForm(ctx, 'incidents', record.id);
      appendLog(ctx, ACTIONS.closeIncident, record.id + ' · ' + record.subject);
      return { id: record.id, status: record.status, record: JSON.parse(JSON.stringify(record)) };
    },

    /* createProject {name, objective, responsibleId, dueDate, targetVersionId} → PM-DEMO-0N, planned */
    createProject: function (ctx, payload) {
      var p = payload || {};
      var processId = processIdOf(ctx);
      assertTracking(ctx, processId);
      var tracking = trackingOf(ctx.pack);
      failValidation(ctx, [
        lengthError(ctx, 'name', p.name, ruleFor(ctx, 'projectForm', 'name'), true),
        lengthError(ctx, 'objective', p.objective, ruleFor(ctx, 'projectForm', 'objective'), true),
        optionError(ctx, 'responsibleId', p.responsibleId, tracking.projectResponsibleOptions || []),
        dateError(ctx, 'dueDate', p.dueDate, true),
        targetVersionError(ctx, processId, p.targetVersionId)
      ]);
      var record = {
        id: nextId(ctx, 'project', 'PM-DEMO-'),
        name: trimmed(p.name),
        objective: trimmed(p.objective),
        processId: processId,
        gapIds: [],
        responsibleId: trimmed(p.responsibleId),
        responsibleNote: null,
        startDate: null,
        dueDate: trimmed(p.dueDate),
        closedAt: null,
        status: (tracking.projectForm && tracking.projectForm.initialStatus) || 'planned',
        targetVersionId: trimmed(p.targetVersionId),
        backingReference: null,
        result: null,
        isDemo: true,
        sourceIds: [DEMO_SOURCE],
        note: null,
        commitments: [],
        followUp: [],
        createdAt: businessDate(ctx.pack),
        createdBy: ctx.state.app ? ctx.state.app.profileId : null,
        createdAtClock: nowOf(ctx),
        updatedAt: null
      };
      ctx.state.demo.projects.push(record);
      followUp(ctx, record, ACTIONS.createProject, record.id);
      closeWebForm(ctx, 'projects', record.id);
      appendLog(ctx, ACTIONS.createProject, record.id + ' · ' + record.name);
      return { id: record.id, record: JSON.parse(JSON.stringify(record)) };
    },

    /* startProject {id}: planned → inProgress */
    startProject: function (ctx, payload) {
      var p = payload || {};
      var record = projectOf(ctx, p.id);
      assertTracking(ctx, record.processId);
      if (record.status !== 'planned') ctx.fail('invalid-transition', 'Solo un proyecto planificado puede iniciarse', { field: 'status', status: record.status });
      record.status = 'inProgress';
      if (!record.startDate) record.startDate = businessDate(ctx.pack);
      record.updatedAt = nowOf(ctx);
      followUp(ctx, record, ACTIONS.startProject, null);
      closeWebForm(ctx, 'projects', record.id);
      appendLog(ctx, ACTIONS.startProject, record.id + ' · ' + record.name);
      return { id: record.id, status: record.status };
    },

    /* updateProject {id, objective?, responsibleId?, dueDate?, status?: planned|inProgress} */
    updateProject: function (ctx, payload) {
      var p = payload || {};
      var record = projectOf(ctx, p.id);
      assertTracking(ctx, record.processId);
      if (record.status === 'concluded') ctx.fail('project-concluded', 'Un proyecto concluido no se edita', { field: 'id' });
      var tracking = trackingOf(ctx.pack);
      var errors = [];
      if (p.objective !== undefined) errors.push(lengthError(ctx, 'objective', p.objective, ruleFor(ctx, 'projectForm', 'objective'), true));
      if (p.responsibleId !== undefined) errors.push(optionError(ctx, 'responsibleId', p.responsibleId, tracking.projectResponsibleOptions || []));
      if (p.dueDate !== undefined) errors.push(dateError(ctx, 'dueDate', p.dueDate, true));
      if (p.status !== undefined) {
        var editable = tracking.projectEditableStatuses || PROJECT_EDITABLE;
        if (p.status === 'concluded') errors.push({ field: 'status', code: 'invalid-status', messageId: null, message: 'Concluir requiere el formulario de cierre' });
        else if (editable.indexOf(p.status) === -1) errors.push({ field: 'status', code: 'invalid-status', messageId: null, message: 'Estado no válido: ' + p.status });
      }
      failValidation(ctx, errors);
      var changed = [];
      if (p.objective !== undefined && trimmed(p.objective) !== record.objective) { record.objective = trimmed(p.objective); changed.push('objective'); }
      if (p.responsibleId !== undefined && trimmed(p.responsibleId) !== record.responsibleId) { record.responsibleId = trimmed(p.responsibleId); changed.push('responsibleId'); }
      if (p.dueDate !== undefined && trimmed(p.dueDate) !== record.dueDate) { record.dueDate = trimmed(p.dueDate); changed.push('dueDate'); }
      if (p.status !== undefined && p.status !== record.status) {
        record.status = p.status;
        if (p.status === 'inProgress' && !record.startDate) record.startDate = businessDate(ctx.pack);
        changed.push('status');
      }
      record.updatedAt = nowOf(ctx);
      followUp(ctx, record, ACTIONS.updateProject, changed.join(', ') || null);
      closeWebForm(ctx, 'projects', record.id);
      appendLog(ctx, ACTIONS.updateProject, record.id + ' · ' + record.name);
      return { id: record.id, changed: changed, record: JSON.parse(JSON.stringify(record)) };
    },

    /* closeProject {id, result, confirmed: true} → concluded (never publishes a version) */
    closeProject: function (ctx, payload) {
      var p = payload || {};
      var record = projectOf(ctx, p.id);
      assertTracking(ctx, record.processId);
      if (record.status === 'concluded') ctx.fail('already-concluded', 'El proyecto ya está concluido', { field: 'id' });
      var errors = [];
      errors.push(lengthError(ctx, 'result', p.result, ruleFor(ctx, 'projectForm', 'result'), true));
      if (p.confirmed !== true) errors.push(requiredError(ctx, 'confirmed'));
      failValidation(ctx, errors);
      record.status = 'concluded';
      record.result = trimmed(p.result);
      record.closedAt = businessDate(ctx.pack);
      record.closedBy = ctx.state.app ? ctx.state.app.profileId : null;
      record.closeConfirmation = trackingOf(ctx.pack).texts ? trackingOf(ctx.pack).texts.closeConfirm || null : null;
      record.updatedAt = nowOf(ctx);
      followUp(ctx, record, ACTIONS.closeProject, record.result);
      closeWebForm(ctx, 'projects', record.id);
      appendLog(ctx, ACTIONS.closeProject, record.id + ' · ' + record.name);
      return { id: record.id, status: record.status, record: JSON.parse(JSON.stringify(record)) };
    }
  };

  return {
    commands: commands,
    ACTIONS: ACTIONS,
    helpers: {
      lengthError: lengthError,
      dateError: dateError,
      failValidation: failValidation,
      appendLog: appendLog,
      trimmed: trimmed,
      nextId: nextId,
      businessDate: businessDate
    }
  };
});
