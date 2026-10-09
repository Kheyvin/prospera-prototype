/* schemas/pack-validator — structural validation of the merged client pack
 * (CONTRACTS §4, §4.11). Dependency-free: runs in Node (build) and in the browser bundle.
 *
 * Usage:
 *   Primus.require('schemas/pack-validator').validatePack(rawMergedPack)
 *   require('./schemas/pack-validator.js').validatePack(rawMergedPack)   // Node, no Primus
 * Result: { ok: boolean, errors: [{ path, message }] }. Enumerations are duplicated here on
 * purpose so the validator never depends on core/pack (which loads after it). */
(function (root, factory) {
  'use strict';
  var api = factory();
  var registry = (typeof Primus !== 'undefined' && Primus) || (root && root.Primus);
  if (registry && typeof registry.module === 'function') {
    if (!(typeof registry.has === 'function' && registry.has('schemas/pack-validator'))) {
      registry.module('schemas/pack-validator', function () { return api; });
    }
  }
  if (typeof module !== 'undefined' && module && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var TOP_LEVEL = ['schemaVersion', 'specVersion', 'client', 'presentation', 'demo', 'messages', 'sources', 'solution',
    'scope', 'methodologies', 'organization', 'tracking', 'security', 'desktop', 'scenarios'];
  var REQUIRED_TOP = TOP_LEVEL.filter(function (k) { return k !== 'specVersion'; });
  var TABS = ['architecture', 'scope', 'methodologies', 'web', 'desktop'];
  var LEVELS = ['strategic', 'tactical', 'operational'];
  var REPRESENTATIONS = ['orgchart', 'processmap', 'relations'];
  var DEPTHS = ['areas', 'positions', 'people'];
  var PROCESS_VIEWS = ['sheet', 'flow', 'compare', 'incidents', 'projects'];
  var LAYERS = ['people', 'systems', 'documents'];
  var UI_KEYS = ['close', 'back', 'backToMap', 'backToOrganization', 'search', 'searchPlaceholder', 'clearSearch', 'results',
    'clearFilters', 'showAll', 'cancel', 'save', 'confirm', 'edit', 'continue', 'start', 'stop', 'retry', 'restartScenario',
    'resumeReview', 'history', 'sources', 'viewInWeb', 'viewConnections', 'clearRelationFocus', 'showRelationsOfObjective',
    'focusArea', 'openAreaSpace', 'openFlow', 'viewSheet', 'compareVersions', 'viewIncidents', 'viewProjects', 'viewInstruction',
    'backToFlow', 'listView', 'mapView', 'zoomIn', 'zoomOut', 'fitView', 'resetCamera', 'moduleNavigation', 'profileSelector',
    'useAnalystProfile', 'levelStrategic', 'levelTactical', 'levelOperational', 'repOrgchart', 'repProcessMap', 'repRelations',
    'depthAreas', 'depthPositions', 'depthPeople', 'usersAndAccess', 'discardChanges', 'resetConfirm', 'viewVersion',
    'compareWithBase', 'newVersionNotice', 'viewNewVersion', 'historicalReadOnly', 'viewAdjusted', 'restricted', 'newMessages',
    'jumpToLatest', 'processing', 'selectProcess', 'noDetail', 'externalReference'];
  var MESSAGE_IDS = [];
  for (var mi = 1; mi <= 20; mi++) MESSAGE_IDS.push('MSG-' + (mi < 10 ? '0' : '') + mi);
  var ACCESS_ROLES = ['admin', 'manager', 'employee'];
  var DATA_MODES = ['synthetic', 'client-provided', 'mixed'];
  var SOURCE_KINDS = ['instruction', 'proposal', 'email', 'orgchart', 'case', 'model', 'metadata', 'scope-deck', 'policy', 'demo', 'vision', 'contract'];
  var ENTITY_TYPES = ['organization', 'area', 'macroprocess', 'process', 'activity', 'role', 'position', 'person',
    'externalProvider', 'externalActor', 'system', 'document', 'policy', 'objective', 'indicator', 'gap'];
  var RESERVED_TYPES = ['incident', 'project', 'version'];
  var RELATION_TYPES = ['parteDe', 'perteneceA', 'ocupa', 'prestaServicioComo', 'desempeña', 'agrupadoEn', 'tieneDueñoÁrea',
    'participaEn', 'ejecuta', 'usa', 'requiere', 'produce', 'contribuyeA', 'mide', 'orienta', 'afecta', 'proponeVersión', 'gerenciaGeneral'];
  /* Expected endpoint types (spec §9.1 direction). `version`/`project` endpoints are records. */
  var RELATION_ENDPOINTS = {
    parteDe: [['area', 'activity'], ['organization', 'process']],
    perteneceA: [['position'], ['area', 'organization']],
    ocupa: [['person'], ['position']],
    prestaServicioComo: [['externalProvider', 'person'], ['position']],
    'desempeña': [['position'], ['role']],
    agrupadoEn: [['process'], ['macroprocess']],
    'tieneDueñoÁrea': [['process'], ['area']],
    participaEn: [['area'], ['process']],
    ejecuta: [['role'], ['activity']],
    usa: [['activity'], ['system']],
    requiere: [['activity'], ['document']],
    produce: [['activity'], ['document']],
    contribuyeA: [['process'], ['objective']],
    mide: [['indicator'], ['objective']],
    orienta: [['policy'], ['process']],
    afecta: [['gap', 'incident', 'project'], ['process']],
    'proponeVersión': [['project'], ['version']],
    gerenciaGeneral: [['position'], ['organization']]
  };
  var CONFIDENCES = ['confirmed', 'inferred', 'unverified'];
  var DATA_STATES = ['known', 'missing', 'not-applicable', 'proposed'];
  var PROVENANCE_LABELS = ['Fuente del cliente', 'Síntesis de las fuentes', 'Relación por validar', 'Propuesto · por validar',
    'Ejemplo de demostración', 'Sin dato proporcionado'];
  var VERSION_TYPES = ['AS-IS', 'TO-BE'];
  var VERSION_STATES = ['documented', 'incomplete-draft', 'proposed', 'published-demo', 'adopted-demo'];
  var FLOW_NODE_KINDS = ['start', 'end', 'task', 'decision'];
  var SYSTEM_STATUSES = ['current', 'proposed', 'unknown'];
  var PERSON_KINDS = ['internal', 'externalPerson', 'externalOrganization', 'externalActor'];
  var DISPOSITIONS = ['included', 'excluded', 'future', 'undecided'];
  var COVERAGES = ['interactive', 'illustrated', 'not-demonstrated'];
  var DECISIONS = ['defined', 'pending'];
  var INCIDENT_STATUSES = ['open', 'inProgress', 'closed'];
  var PROJECT_STATUSES = ['planned', 'inProgress', 'concluded'];
  var ACCOUNT_STATUSES = ['active', 'inactive'];
  var EVENT_KINDS = ['analyst-message', 'assistant-message', 'tool-start', 'tool-result', 'artifact-proposal', 'approval-request',
    'approval-result', 'form-request', 'error', 'completed'];
  var OPERATIONS = ['READ_EVIDENCE', 'CHECK_MODEL', 'STAGE_VERSION', 'PUBLISH_DEMO_VERSION'];
  var PRECONDITION_CHECKS = ['profileRole', 'versionExists', 'versionAbsent', 'noPendingReview', 'projectExists'];
  var OVERLAY_KINDS = ['history', 'document', 'policy', 'sources', 'version', 'connections'];
  var SECURITY_VIEWS = ['accounts', 'audit'];
  var EVIDENCE_RESTRICTIONS = [null, 'AS-IS', 'TO-BE'];
  var FORM_FIELD_TYPES = ['readonly', 'text', 'textarea', 'checkbox'];
  var USERNAME_RE = /^[a-z0-9._-]{3,40}$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var FORBIDDEN = [
    { text: '/home/', ci: false }, { text: 'C:\\', ci: false }, { text: 'file://', ci: true }, { text: 'http://', ci: true },
    { text: '<script', ci: true }, { text: 'javascript:', ci: true }
  ];
  var HTTPS_ALLOWED_PATH = /^methodologies\.items\[\d+\]\.externalReference\.url$/;
  /* Small enum-like id lists that are scoped to their owner and excluded from global uniqueness. */

  function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function isString(v) { return typeof v === 'string'; }
  function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0; }
  function isBool(v) { return typeof v === 'boolean'; }
  function isNullOr(v, pred) { return v === null || v === undefined || pred(v); }
  function isDate(v) { return isString(v) && DATE_RE.test(v) && validCalendar(v); }
  function validCalendar(v) {
    var y = +v.slice(0, 4), m = +v.slice(5, 7), d = +v.slice(8, 10);
    if (m < 1 || m > 12 || d < 1) return false;
    var days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d <= days[m - 1];
  }

  function validatePack(raw) {
    var errors = [];
    function err(path, message) { errors.push({ path: path, message: message }); }
    function result() { return { ok: errors.length === 0, errors: errors }; }

    if (!isObject(raw)) { err('', 'El pack debe ser un objeto JSON'); return result(); }

    /* ---------- id registry and reference helpers ---------- */
    var ids = new Map();
    function registerId(id, path, kind) {
      if (!isNonEmptyString(id)) { err(path, 'id obligatorio (cadena no vacía)'); return false; }
      if (ids.has(id)) { err(path, 'id duplicado «' + id + '» (ya usado en ' + ids.get(id).path + ')'); return false; }
      ids.set(id, { path: path, kind: kind });
      return true;
    }

    function expectEnum(value, list, path, label) {
      if (list.indexOf(value) === -1) { err(path, (label || 'valor') + ' no válido: ' + JSON.stringify(value) + ' (esperado: ' + list.join(' | ') + ')'); return false; }
      return true;
    }
    function expectString(value, path, label) {
      if (!isNonEmptyString(value)) { err(path, (label || 'texto') + ' obligatorio'); return false; }
      return true;
    }
    function expectStringOrNull(value, path, label) {
      if (!isNullOr(value, isString)) { err(path, (label || 'texto') + ' debe ser cadena o null'); return false; }
      return true;
    }
    function expectBool(value, path, label) {
      if (!isBool(value)) { err(path, (label || 'valor') + ' debe ser booleano'); return false; }
      return true;
    }
    function expectArray(value, path, label) {
      if (!Array.isArray(value)) { err(path, (label || 'lista') + ' debe ser un arreglo'); return false; }
      return true;
    }
    function expectObject(value, path, label) {
      if (!isObject(value)) { err(path, (label || 'objeto') + ' obligatorio'); return false; }
      return true;
    }
    function uniqueWithin(list, path, keyName) {
      var seen = new Set();
      (list || []).forEach(function (item, i) {
        var key = item && item[keyName || 'id'];
        if (key === undefined || key === null) return;
        if (seen.has(key)) err(path + '[' + i + '].' + (keyName || 'id'), 'id repetido en la lista: ' + key);
        seen.add(key);
      });
    }

    /* ---------- schemaVersion / top-level ---------- */
    Object.keys(raw).forEach(function (key) {
      if (TOP_LEVEL.indexOf(key) === -1) err(key, 'Clave de nivel superior desconocida');
    });
    REQUIRED_TOP.forEach(function (key) {
      if (raw[key] === undefined || raw[key] === null) err(key, 'Sección obligatoria ausente');
    });
    if (raw.schemaVersion !== 1) err('schemaVersion', 'schemaVersion debe ser el entero 1');
    if (raw.specVersion !== undefined && !isNonEmptyString(raw.specVersion)) err('specVersion', 'specVersion debe ser una cadena');

    /* ---------- client ---------- */
    var client = raw.client;
    if (expectObject(client, 'client')) {
      ['id', 'name', 'locale', 'timeZone', 'currency', 'classification'].forEach(function (k) { expectString(client[k], 'client.' + k); });
      if (Array.isArray(client.id)) err('client.id', 'client.id debe ser un único identificador (hay más de un cliente)');
      expectEnum(client.dataMode, DATA_MODES, 'client.dataMode', 'dataMode');
    }

    /* ---------- presentation ---------- */
    var presentation = raw.presentation;
    var tabIds = TABS.slice();
    if (expectObject(presentation, 'presentation')) {
      ['productName', 'windowTitle', 'title', 'subtitle', 'noscript'].forEach(function (k) { expectString(presentation[k], 'presentation.' + k); });
      if (expectArray(presentation.badges, 'presentation.badges')) presentation.badges.forEach(function (b, i) { expectString(b, 'presentation.badges[' + i + ']'); });
      if (expectObject(presentation.actions, 'presentation.actions')) ['viewWeb', 'reset', 'about'].forEach(function (k) { expectString(presentation.actions[k], 'presentation.actions.' + k); });
      if (expectObject(presentation.about, 'presentation.about')) ['title', 'text', 'button'].forEach(function (k) { expectString(presentation.about[k], 'presentation.about.' + k); });
      if (expectArray(presentation.tabs, 'presentation.tabs')) {
        if (presentation.tabs.length !== 5) err('presentation.tabs', 'Deben existir exactamente cinco pestañas');
        presentation.tabs.forEach(function (tab, i) {
          if (!isObject(tab)) { err('presentation.tabs[' + i + ']', 'pestaña no válida'); return; }
          if (tab.id !== TABS[i]) err('presentation.tabs[' + i + '].id', 'orden fijo de pestañas: se esperaba «' + TABS[i] + '»');
          expectString(tab.label, 'presentation.tabs[' + i + '].label');
        });
      }
      if (expectObject(presentation.ui, 'presentation.ui')) {
        UI_KEYS.forEach(function (k) {
          var v = presentation.ui[k];
          if (k === 'discardChanges') { if (!isObject(v) || !isNonEmptyString(v.title) || !isNonEmptyString(v.keep) || !isNonEmptyString(v.discard)) err('presentation.ui.discardChanges', 'objeto {title, keep, discard} obligatorio'); return; }
          if (k === 'resetConfirm') { if (!isObject(v) || !isNonEmptyString(v.title) || !isNonEmptyString(v.cancel) || !isNonEmptyString(v.confirm)) err('presentation.ui.resetConfirm', 'objeto {title, cancel, confirm} obligatorio'); return; }
          if (!isNonEmptyString(v)) err('presentation.ui.' + k, 'clave de interfaz obligatoria');
        });
      }
    }

    /* ---------- messages ---------- */
    var messages = raw.messages;
    if (expectObject(messages, 'messages')) {
      MESSAGE_IDS.forEach(function (id) {
        var m = messages[id];
        if (m === undefined) { err('messages.' + id, 'mensaje obligatorio ausente'); return; }
        if (isObject(m)) { expectString(m.text, 'messages.' + id + '.text'); if (m.action !== undefined) expectStringOrNull(m.action, 'messages.' + id + '.action'); }
        else expectString(m, 'messages.' + id);
      });
    }

    /* ---------- sources ---------- */
    var sourceIds = new Set();
    if (expectArray(raw.sources, 'sources')) {
      raw.sources.forEach(function (s, i) {
        var p = 'sources[' + i + ']';
        if (!isObject(s)) { err(p, 'fuente no válida'); return; }
        if (registerId(s.id, p + '.id', 'source')) sourceIds.add(s.id);
        expectString(s.title, p + '.title');
        expectEnum(s.kind, SOURCE_KINDS, p + '.kind', 'kind');
        expectBool(s.clientVisible, p + '.clientVisible');
        expectStringOrNull(s.section, p + '.section');
        expectStringOrNull(s.date, p + '.date');
        expectStringOrNull(s.modelModifiedAt, p + '.modelModifiedAt');
        if (s.modelModifiedAt && ['S-ASIS', 'S-TOBE1', 'S-TOBE2'].indexOf(s.id) === -1) err(p + '.modelModifiedAt', 'modelModifiedAt solo se admite en S-ASIS/S-TOBE1/S-TOBE2');
      });
    }
    function checkSourceIds(list, path, required) {
      if (list === undefined || list === null) { if (required) err(path, 'sourceIds obligatorio'); return; }
      if (!expectArray(list, path)) return;
      list.forEach(function (id, i) { if (!sourceIds.has(id)) err(path + '[' + i + ']', 'fuente no encontrada: ' + id); });
    }

    /* ---------- organization: entities ---------- */
    var organization = raw.organization;
    var entityById = new Map();
    var entityType = function (id) { var e = entityById.get(id); return e ? e.type : null; };
    var versionById = new Map();
    var knownVersionIds = new Set();
    var flowsObj = {};
    var activityByKey = new Map();
    var subtaskByActivity = new Map();
    var variantIds = new Set();

    if (expectObject(organization, 'organization')) {
      if (expectArray(organization.entities, 'organization.entities')) {
        organization.entities.forEach(function (e, i) {
          var p = 'organization.entities[' + i + ']';
          if (!isObject(e)) { err(p, 'entidad no válida'); return; }
          if (registerId(e.id, p + '.id', 'entity')) entityById.set(e.id, e);
          if (RESERVED_TYPES.indexOf(e.type) !== -1) err(p + '.type', 'el tipo «' + e.type + '» no se almacena en entities');
          else expectEnum(e.type, ENTITY_TYPES, p + '.type', 'type');
          expectString(e.name, p + '.name');
          if (e.description !== undefined) expectStringOrNull(e.description, p + '.description');
          if (e.isDemo !== undefined) expectBool(e.isDemo, p + '.isDemo');
          if (e.labels !== undefined && expectArray(e.labels, p + '.labels')) {
            e.labels.forEach(function (l, j) { expectEnum(l, PROVENANCE_LABELS, p + '.labels[' + j + ']', 'etiqueta de proveniencia'); });
          }
          if (e.attributes !== undefined && !isObject(e.attributes)) err(p + '.attributes', 'attributes debe ser un objeto');
          checkProvenance(e.provenance, p + '.provenance');
        });
      }
      if (expectArray(organization.versions, 'organization.versions')) {
        organization.versions.forEach(function (v, i) {
          if (isObject(v) && isNonEmptyString(v.id)) { versionById.set(v.id, v); knownVersionIds.add(v.id); }
        });
      }
      if (isObject(organization.flows)) flowsObj = organization.flows;
    }

    function checkProvenance(prov, path) {
      if (!expectObject(prov, path)) return;
      checkSourceIds(prov.sourceIds, path + '.sourceIds', true);
      expectEnum(prov.confidence, CONFIDENCES, path + '.confidence', 'confidence');
      expectEnum(prov.dataState, DATA_STATES, path + '.dataState', 'dataState');
      if (prov.observedAt !== undefined) expectStringOrNull(prov.observedAt, path + '.observedAt');
    }

    function checkEntityRef(id, path, types, optional) {
      if (id === null || id === undefined) { if (!optional) err(path, 'referencia obligatoria'); return false; }
      if (!entityById.has(id)) { err(path, 'entidad no encontrada: ' + id); return false; }
      if (types && types.indexOf(entityType(id)) === -1) { err(path, 'se esperaba ' + types.join('|') + ' y «' + id + '» es ' + entityType(id)); return false; }
      return true;
    }
    function checkEntityRefs(list, path, types, optional) {
      if (list === undefined || list === null) { if (!optional) err(path, 'lista de referencias obligatoria'); return; }
      if (!expectArray(list, path)) return;
      list.forEach(function (id, i) { checkEntityRef(id, path + '[' + i + ']', types); });
    }

    /* Scenario outcome versions are created at runtime; their ids resolve for targets/references. */
    var scenarioOutcomeVersions = new Map();
    if (Array.isArray(raw.scenarios)) {
      raw.scenarios.forEach(function (sc) {
        if (isObject(sc) && isObject(sc.outcome) && isObject(sc.outcome.version) && isNonEmptyString(sc.outcome.version.id)) {
          scenarioOutcomeVersions.set(sc.outcome.version.id, sc.outcome.version);
          knownVersionIds.add(sc.outcome.version.id);
        }
      });
    }
    function checkVersionRef(id, path, optional, packOnly) {
      if (id === null || id === undefined) { if (!optional) err(path, 'versionId obligatorio'); return false; }
      if (packOnly ? !versionById.has(id) : !knownVersionIds.has(id)) { err(path, 'versión no encontrada: ' + id); return false; }
      return true;
    }

    /* second pass over entities: type-specific attributes and parent graph */
    if (organization && Array.isArray(organization.entities)) {
      organization.entities.forEach(function (e, i) {
        if (!isObject(e) || !entityById.has(e.id)) return;
        var p = 'organization.entities[' + i + ']';
        var a = e.attributes || {};
        if (e.parentId !== undefined && e.parentId !== null) {
          checkEntityRef(e.parentId, p + '.parentId', ['organization', 'area']);
        }
        if (e.areaId !== undefined && e.areaId !== null) checkEntityRef(e.areaId, p + '.areaId', ['area', 'organization']);
        switch (e.type) {
          case 'position':
            if (e.areaId === undefined || e.areaId === null) err(p + '.areaId', 'los puestos llevan areaId');
            if (a.collective !== undefined) expectBool(a.collective, p + '.attributes.collective');
            if (a.external !== undefined) expectBool(a.external, p + '.attributes.external');
            break;
          case 'person':
          case 'externalProvider':
          case 'externalActor':
            expectEnum(a.kind, PERSON_KINDS, p + '.attributes.kind', 'kind');
            if (a.positionId !== undefined) checkEntityRef(a.positionId, p + '.attributes.positionId', ['position'], true);
            break;
          case 'activity':
            if (checkVersionRef(a.versionId, p + '.attributes.versionId', false, true)) {
              var key = a.key || e.id;
              if (!activityByKey.has(key)) activityByKey.set(key, []);
              activityByKey.get(key).push({ entity: e, versionId: a.versionId, path: p });
            }
            if (a.key !== undefined && a.key !== e.id) err(p + '.attributes.key', 'en las versiones base key debe ser igual al id');
            if (a.nodeKind !== undefined && a.nodeKind !== 'task') err(p + '.attributes.nodeKind', 'nodeKind de actividad debe ser «task»');
            checkEntityRefs(a.roleIds, p + '.attributes.roleIds', ['role']);
            checkEntityRefs(a.systemIds, p + '.attributes.systemIds', ['system']);
            if (expectObject(a.documentIds, p + '.attributes.documentIds')) {
              checkEntityRefs(a.documentIds.requires, p + '.attributes.documentIds.requires', ['document']);
              checkEntityRefs(a.documentIds.produces, p + '.attributes.documentIds.produces', ['document']);
            }
            if (a.actorIds !== undefined) checkEntityRefs(a.actorIds, p + '.attributes.actorIds', ['externalActor'], true);
            if (a.documentIdsByVariant !== undefined && expectObject(a.documentIdsByVariant, p + '.attributes.documentIdsByVariant')) {
              Object.keys(a.documentIdsByVariant).forEach(function (variant) { checkEntityRefs(a.documentIdsByVariant[variant], p + '.attributes.documentIdsByVariant.' + variant, ['document']); });
            }
            if (a.time !== undefined && a.time !== null) err(p + '.attributes.time', 'time debe ser null (sin dato proporcionado)');
            if (a.subtasks !== undefined && expectArray(a.subtasks, p + '.attributes.subtasks')) {
              var subIds = [];
              a.subtasks.forEach(function (s, j) {
                var sp = p + '.attributes.subtasks[' + j + ']';
                if (!isObject(s)) { err(sp, 'subtarea no válida'); return; }
                if (registerId(s.id, sp + '.id', 'subtask')) subIds.push(s.id);
                expectString(s.name, sp + '.name');
                expectString(s.instruction, sp + '.instruction');
                checkEntityRef(s.roleId, sp + '.roleId', ['role']);
              });
              subtaskByActivity.set(e.id, subIds);
            }
            break;
          case 'role':
            checkEntityRefs(a.positionIds, p + '.attributes.positionIds', ['position']);
            break;
          case 'system':
            expectEnum(a.status, SYSTEM_STATUSES, p + '.attributes.status', 'status');
            expectString(a.statusLabel, p + '.attributes.statusLabel');
            if (a.connected !== undefined && a.connected !== false) err(p + '.attributes.connected', 'connected debe ser false');
            break;
          case 'document':
            if (a.hasFile !== undefined && a.hasFile !== false) err(p + '.attributes.hasFile', 'hasFile debe ser false');
            if (a.contentRef !== undefined && a.contentRef !== null) checkEntityRef(a.contentRef, p + '.attributes.contentRef', ['policy', 'document']);
            break;
          case 'policy':
            if (a.signaturePositionId !== undefined) checkEntityRef(a.signaturePositionId, p + '.attributes.signaturePositionId', ['position'], true);
            if (a.commitments !== undefined) expectArray(a.commitments, p + '.attributes.commitments');
            if (a.body !== undefined) expectArray(a.body, p + '.attributes.body');
            break;
          case 'indicator':
            ['value', 'numerator', 'denominator', 'target', 'measuredAt'].forEach(function (k) {
              if (a[k] !== undefined && a[k] !== null) err(p + '.attributes.' + k, k + ' debe ser null (sin medición)');
            });
            break;
          case 'gap':
            ['severity', 'cost', 'frequency'].forEach(function (k) {
              if (a[k] !== undefined && a[k] !== null) err(p + '.attributes.' + k, k + ' debe ser null');
            });
            break;
          case 'process':
            if (a.variants !== undefined && expectArray(a.variants, p + '.attributes.variants')) {
              a.variants.forEach(function (v, j) { if (!isObject(v) || !isNonEmptyString(v.id) || !isNonEmptyString(v.label)) err(p + '.attributes.variants[' + j + ']', 'variante {id, label, note} no válida'); });
            }
            break;
          default: break;
        }
      });
      /* parent cycles */
      organization.entities.forEach(function (e, i) {
        if (!isObject(e) || !e.parentId) return;
        var seen = new Set([e.id]);
        var cur = entityById.get(e.parentId);
        var guard = 0;
        while (cur && guard++ < 10000) {
          if (seen.has(cur.id)) { err('organization.entities[' + i + '].parentId', 'ciclo en la jerarquía parentId que incluye «' + cur.id + '»'); break; }
          seen.add(cur.id);
          cur = cur.parentId ? entityById.get(cur.parentId) : null;
        }
      });
    }

    /* ---------- organization: relations ---------- */
    var trackingProjectIds = new Set();
    if (raw.tracking && Array.isArray(raw.tracking.projects)) raw.tracking.projects.forEach(function (pr) { if (isObject(pr) && isNonEmptyString(pr.id)) trackingProjectIds.add(pr.id); });
    var trackingIncidentIds = new Set();
    if (raw.tracking && Array.isArray(raw.tracking.incidents)) raw.tracking.incidents.forEach(function (inc) { if (isObject(inc) && isNonEmptyString(inc.id)) trackingIncidentIds.add(inc.id); });

    function endpointType(id) {
      if (entityById.has(id)) return entityType(id);
      if (knownVersionIds.has(id)) return 'version';
      if (trackingProjectIds.has(id)) return 'project';
      if (trackingIncidentIds.has(id)) return 'incident';
      return null;
    }

    if (organization && expectArray(organization.relations, 'organization.relations')) {
      organization.relations.forEach(function (r, i) {
        var p = 'organization.relations[' + i + ']';
        if (!isObject(r)) { err(p, 'relación no válida'); return; }
        registerId(r.id, p + '.id', 'relation');
        if (!expectEnum(r.type, RELATION_TYPES, p + '.type', 'tipo de relación')) return;
        var ft = endpointType(r.from);
        var tt = endpointType(r.to);
        if (!ft) err(p + '.from', 'origen no encontrado: ' + r.from);
        if (!tt) err(p + '.to', 'destino no encontrado: ' + r.to);
        var expected = RELATION_ENDPOINTS[r.type];
        if (ft && expected && expected[0].indexOf(ft) === -1) err(p + '.from', 'la relación ' + r.type + ' parte de ' + expected[0].join('|') + ', no de ' + ft);
        if (tt && expected && expected[1].indexOf(tt) === -1) err(p + '.to', 'la relación ' + r.type + ' llega a ' + expected[1].join('|') + ', no a ' + tt);
        if (r.type === 'parteDe' && ft === 'activity') err(p + '.type', 'parteDe entre actividad y proceso no se almacena como relación (attributes.versionId + flujo)');
        if (r.inferred !== undefined) expectBool(r.inferred, p + '.inferred');
        if (r.label !== undefined) expectStringOrNull(r.label, p + '.label');
        checkProvenance(r.provenance, p + '.provenance');
      });
    }

    /* ---------- organization: flows ---------- */
    var flowIds = new Set();
    var flowNodeIds = new Map(); // flowId → Set(nodeId)
    var flowTaskNodes = new Map(); // flowId → [nodeId]
    Object.keys(flowsObj).forEach(function (flowKey) {
      var f = flowsObj[flowKey];
      var p = 'organization.flows.' + flowKey;
      if (!isObject(f)) { err(p, 'flujo no válido'); return; }
      if (f.id !== flowKey) err(p + '.id', 'el id del flujo debe coincidir con su clave');
      if (registerId(f.id, p + '.id', 'flow')) flowIds.add(f.id);
      checkEntityRef(f.processId, p + '.processId', ['process']);
      expectString(f.title, p + '.title');
      expectString(f.subtitle, p + '.subtitle');
      var laneIds = new Set();
      if (expectArray(f.lanes, p + '.lanes')) {
        uniqueWithin(f.lanes, p + '.lanes');
        f.lanes.forEach(function (lane, i) {
          var lp = p + '.lanes[' + i + ']';
          if (!isObject(lane)) { err(lp, 'carril no válido'); return; }
          if (expectString(lane.id, lp + '.id')) laneIds.add(lane.id);
          expectString(lane.label, lp + '.label');
          checkEntityRef(lane.roleId, lp + '.roleId', ['role']);
        });
      }
      var nodeIds = new Set();
      var taskNodes = [];
      var nodeKinds = {};
      if (expectArray(f.nodes, p + '.nodes')) {
        uniqueWithin(f.nodes, p + '.nodes');
        f.nodes.forEach(function (n, i) {
          var np = p + '.nodes[' + i + ']';
          if (!isObject(n)) { err(np, 'nodo no válido'); return; }
          if (expectString(n.id, np + '.id')) { nodeIds.add(n.id); nodeKinds[n.id] = n.kind; }
          expectEnum(n.kind, FLOW_NODE_KINDS, np + '.kind', 'kind');
          if (laneIds.size && !laneIds.has(n.laneId)) err(np + '.laneId', 'carril no encontrado en el flujo: ' + n.laneId);
          if (Array.isArray(n.laneIds)) n.laneIds.forEach(function (l, j) { if (!laneIds.has(l)) err(np + '.laneIds[' + j + ']', 'carril no encontrado: ' + l); });
          if (n.kind === 'task') {
            taskNodes.push(n.id);
            var variants = activityByKey.get(n.id) || [];
            var matching = variants.filter(function (entry) { var v = versionById.get(entry.versionId); return v && v.flowId === f.id; });
            if (!matching.length) err(np + '.id', 'nodo de tarea sin entidad de actividad «' + n.id + '» en una versión que use el flujo ' + f.id);
          } else {
            expectString(n.label, np + '.label');
          }
        });
      }
      flowNodeIds.set(f.id, nodeIds);
      flowTaskNodes.set(f.id, taskNodes);
      if (expectArray(f.edges, p + '.edges')) {
        uniqueWithin(f.edges, p + '.edges');
        var adjacency = {};
        var indegree = {};
        nodeIds.forEach(function (id) { adjacency[id] = []; indegree[id] = 0; });
        f.edges.forEach(function (edge, i) {
          var ep = p + '.edges[' + i + ']';
          if (!isObject(edge)) { err(ep, 'arista no válida'); return; }
          registerId(edge.id, ep + '.id', 'flowEdge');
          var okFrom = nodeIds.has(edge.from);
          var okTo = nodeIds.has(edge.to);
          if (!okFrom) err(ep + '.from', 'nodo no encontrado en el flujo: ' + edge.from);
          if (!okTo) err(ep + '.to', 'nodo no encontrado en el flujo: ' + edge.to);
          if (edge.loop !== undefined) expectBool(edge.loop, ep + '.loop');
          if (edge.inferred !== undefined) expectBool(edge.inferred, ep + '.inferred');
          if (edge.label !== undefined) expectStringOrNull(edge.label, ep + '.label');
          if (okFrom && okTo && edge.loop !== true) { adjacency[edge.from].push(edge.to); indegree[edge.to]++; }
        });
        /* non-loop edges must form a DAG: a cycle without loop:true is an error */
        var queue = Object.keys(indegree).filter(function (id) { return indegree[id] === 0; });
        var visited = 0;
        while (queue.length) {
          var cur = queue.shift();
          visited++;
          adjacency[cur].forEach(function (next) { if (--indegree[next] === 0) queue.push(next); });
        }
        if (visited !== nodeIds.size) err(p + '.edges', 'las aristas sin loop:true forman un ciclo; marca los retornos con loop:true');
      }
      if (f.externalActor !== undefined && f.externalActor !== null && expectObject(f.externalActor, p + '.externalActor')) {
        checkEntityRef(f.externalActor.entityId, p + '.externalActor.entityId', ['externalActor']);
        if (expectArray(f.externalActor.exchanges, p + '.externalActor.exchanges')) {
          f.externalActor.exchanges.forEach(function (x, i) {
            var xp = p + '.externalActor.exchanges[' + i + ']';
            if (!isObject(x)) { err(xp, 'intercambio no válido'); return; }
            if (!nodeIds.has(x.nodeId)) err(xp + '.nodeId', 'nodo no encontrado: ' + x.nodeId);
            expectEnum(x.direction, ['in', 'out'], xp + '.direction', 'direction');
            expectString(x.label, xp + '.label');
          });
        }
      }
      if (f.variants !== undefined && expectArray(f.variants, p + '.variants')) {
        uniqueWithin(f.variants, p + '.variants');
        f.variants.forEach(function (v, i) {
          var vp = p + '.variants[' + i + ']';
          if (!isObject(v)) { err(vp, 'variante no válida'); return; }
          if (expectString(v.id, vp + '.id')) variantIds.add(v.id);
          expectString(v.label, vp + '.label');
          expectBool(v.available, vp + '.available');
          if (v.available === false) expectString(v.message, vp + '.message');
        });
        if (f.variants.length && !f.variants.some(function (v) { return v.id === f.defaultVariant; })) err(p + '.defaultVariant', 'defaultVariant debe ser una variante del flujo');
      }
      if (f.groups !== undefined && expectArray(f.groups, p + '.groups')) {
        f.groups.forEach(function (g, i) {
          var gp = p + '.groups[' + i + ']';
          if (!isObject(g)) { err(gp, 'grupo no válido'); return; }
          if (!nodeIds.has(g.id) || nodeKinds[g.id] !== 'task') err(gp + '.id', 'el grupo debe referenciar un nodo de tarea del flujo: ' + g.id);
          var subs = subtaskByActivity.get(g.id) || [];
          if (expectArray(g.subtaskIds, gp + '.subtaskIds')) g.subtaskIds.forEach(function (sid, j) { if (subs.indexOf(sid) === -1) err(gp + '.subtaskIds[' + j + ']', 'subtarea no encontrada en ' + g.id + ': ' + sid); });
        });
      }
      if (f.systemChip !== undefined && f.systemChip !== null && expectObject(f.systemChip, p + '.systemChip')) {
        if (expectArray(f.systemChip.betweenNodeIds, p + '.systemChip.betweenNodeIds')) f.systemChip.betweenNodeIds.forEach(function (id, i) { if (!nodeIds.has(id)) err(p + '.systemChip.betweenNodeIds[' + i + ']', 'nodo no encontrado: ' + id); });
        checkEntityRef(f.systemChip.systemId, p + '.systemChip.systemId', ['system']);
        expectString(f.systemChip.label, p + '.systemChip.label');
      }
      if (f.documentsByVariant !== undefined && f.documentsByVariant !== null && expectObject(f.documentsByVariant, p + '.documentsByVariant')) {
        var d = f.documentsByVariant;
        if (expectArray(d.variants, p + '.documentsByVariant.variants')) {
          d.variants.forEach(function (v, i) {
            var vp = p + '.documentsByVariant.variants[' + i + ']';
            if (!isObject(v)) { err(vp, 'variante documental no válida'); return; }
            if (expectString(v.id, vp + '.id')) variantIds.add(v.id);
            expectString(v.label, vp + '.label');
            expectArray(v.items, vp + '.items');
            if (v.documentIds !== undefined) checkEntityRefs(v.documentIds, vp + '.documentIds', ['document'], true);
          });
        }
        if (d.activityKeys !== undefined && expectArray(d.activityKeys, p + '.documentsByVariant.activityKeys')) d.activityKeys.forEach(function (k, i) { if (!nodeIds.has(k)) err(p + '.documentsByVariant.activityKeys[' + i + ']', 'nodo no encontrado: ' + k); });
        if (d.namingStandard !== undefined) expectArray(d.namingStandard, p + '.documentsByVariant.namingStandard');
        if (d.controls !== undefined) expectArray(d.controls, p + '.documentsByVariant.controls');
      }
      if (f.incomplete === true) {
        expectString(f.message, p + '.message');
        expectArray(f.items, p + '.items');
      }
      ['legend', 'notes', 'context'].forEach(function (k) { if (f[k] !== undefined) expectArray(f[k], p + '.' + k); });
    });

    /* ---------- organization: versions ---------- */
    if (organization && Array.isArray(organization.versions)) {
      organization.versions.forEach(function (v, i) {
        var p = 'organization.versions[' + i + ']';
        if (!isObject(v)) { err(p, 'versión no válida'); return; }
        registerId(v.id, p + '.id', 'version');
        checkEntityRef(v.processId, p + '.processId', ['process']);
        expectEnum(v.type, VERSION_TYPES, p + '.type', 'type');
        expectString(v.label, p + '.label');
        expectEnum(v.state, VERSION_STATES, p + '.state', 'state');
        expectString(v.stateLabel, p + '.stateLabel');
        if (!flowIds.has(v.flowId)) err(p + '.flowId', 'flujo no encontrado: ' + v.flowId);
        if (v.baseVersionId !== undefined && v.baseVersionId !== null) {
          checkVersionRef(v.baseVersionId, p + '.baseVersionId', false, true);
          if (v.baseVersionId === v.id) err(p + '.baseVersionId', 'una versión no puede ser su propia base');
        }
        expectStringOrNull(v.publishedAt, p + '.publishedAt');
        expectStringOrNull(v.publishedBy, p + '.publishedBy');
        if (!v.isDemo && (v.publishedAt || v.publishedBy)) err(p + '.publishedAt', 'las referencias entregadas no llevan publicación ni responsable');
        expectString(v.summary, p + '.summary');
        expectString(v.changeLabel, p + '.changeLabel');
        checkSourceIds(v.sourceIds, p + '.sourceIds', true);
        if (v.publishable !== undefined) expectBool(v.publishable, p + '.publishable');
        if (v.isDemo !== undefined) expectBool(v.isDemo, p + '.isDemo');
        ['pending', 'notes'].forEach(function (k) { if (v[k] !== undefined) expectArray(v[k], p + '.' + k); });
        if (v.activityOverrides !== undefined && expectObject(v.activityOverrides, p + '.activityOverrides')) {
          Object.keys(v.activityOverrides).forEach(function (key) {
            var baseId = v.baseVersionId || v.id;
            var entries = activityByKey.get(key) || [];
            if (!entries.some(function (en) { return en.versionId === baseId; })) err(p + '.activityOverrides.' + key, 'la clave no existe en la versión base ' + baseId);
          });
        }
        /* every activity entity of this version must be a task node of its flow */
        var taskSet = new Set(flowTaskNodes.get(v.flowId) || []);
        activityByKey.forEach(function (entries, key) {
          entries.forEach(function (en) {
            if (en.versionId === v.id && flowIds.has(v.flowId) && !taskSet.has(key)) err(en.path + '.attributes.versionId', 'la actividad «' + key + '» no tiene nodo de tarea en el flujo ' + v.flowId);
          });
        });
      });
      var current = organization.currentAsIsVersionId;
      if (!checkVersionRef(current, 'organization.currentAsIsVersionId', false, true)) { /* reported */ }
      else if (versionById.get(current).type !== 'AS-IS') err('organization.currentAsIsVersionId', 'debe apuntar a una versión AS-IS');
    }

    /* ---------- organization: views ---------- */
    var views = organization ? organization.views : null;
    var levels = LEVELS, representations = REPRESENTATIONS, depths = DEPTHS, processViews = PROCESS_VIEWS;
    if (organization && expectObject(views, 'organization.views')) {
      if (expectArray(views.levels, 'organization.views.levels')) {
        if (views.levels.length !== 3 || LEVELS.some(function (l, i) { return views.levels[i] !== l; })) err('organization.views.levels', 'deben ser exactamente tres niveles: ' + LEVELS.join(', '));
      }
      if (expectArray(views.representations, 'organization.views.representations')) views.representations.forEach(function (r, i) { expectEnum(r, REPRESENTATIONS, 'organization.views.representations[' + i + ']', 'representación'); });
      if (expectArray(views.depths, 'organization.views.depths')) views.depths.forEach(function (d, i) { expectEnum(d, DEPTHS, 'organization.views.depths[' + i + ']', 'profundidad'); });
      if (expectObject(views.defaultContext, 'organization.views.defaultContext')) {
        expectEnum(views.defaultContext.level, LEVELS, 'organization.views.defaultContext.level', 'level');
        expectEnum(views.defaultContext.representation, REPRESENTATIONS, 'organization.views.defaultContext.representation', 'representation');
        expectEnum(views.defaultContext.depth, DEPTHS, 'organization.views.defaultContext.depth', 'depth');
        checkEntityRef(views.defaultContext.rootId, 'organization.views.defaultContext.rootId', ['organization']);
      }
      checkEntityRef(views.defaultProcessId, 'organization.views.defaultProcessId', ['process']);
      if (expectArray(views.processViews, 'organization.views.processViews')) views.processViews.forEach(function (v, i) { expectEnum(v, PROCESS_VIEWS, 'organization.views.processViews[' + i + ']', 'vista de proceso'); });
      if (expectObject(views.map, 'organization.views.map') && expectArray(views.map.bands, 'organization.views.map.bands')) {
        uniqueWithin(views.map.bands, 'organization.views.map.bands');
        views.map.bands.forEach(function (b, i) {
          var bp = 'organization.views.map.bands[' + i + ']';
          if (!isObject(b)) { err(bp, 'banda no válida'); return; }
          expectString(b.id, bp + '.id');
          expectString(b.label, bp + '.label');
          if (b.entityIds !== undefined) checkEntityRefs(b.entityIds, bp + '.entityIds', null, true);
          if (b.entityIds === undefined && !isNonEmptyString(b.message)) err(bp, 'una banda sin entityIds necesita message');
        });
      }
      if (expectArray(views.layers, 'organization.views.layers')) {
        uniqueWithin(views.layers, 'organization.views.layers');
        views.layers.forEach(function (l, i) { if (!isObject(l)) { err('organization.views.layers[' + i + ']', 'capa no válida'); return; } expectEnum(l.id, LAYERS, 'organization.views.layers[' + i + '].id', 'capa'); expectString(l.label, 'organization.views.layers[' + i + '].label'); });
      }
      if (expectObject(views.sipoc, 'organization.views.sipoc')) { expectString(views.sipoc.label, 'organization.views.sipoc.label'); expectArray(views.sipoc.rows, 'organization.views.sipoc.rows'); }
      if (expectObject(views.raci, 'organization.views.raci')) { expectString(views.raci.note, 'organization.views.raci.note'); expectString(views.raci.missing, 'organization.views.raci.missing'); }
      if (expectObject(views.compare, 'organization.views.compare')) {
        if (expectArray(views.compare.columns, 'organization.views.compare.columns') && views.compare.columns.length !== 2) err('organization.views.compare.columns', 'la comparación tiene dos columnas');
        if (expectArray(views.compare.rows, 'organization.views.compare.rows')) views.compare.rows.forEach(function (r, i) { if (!isObject(r) || !isNonEmptyString(r.label) || !isNonEmptyString(r.asIs) || !isNonEmptyString(r.toBe)) err('organization.views.compare.rows[' + i + ']', 'fila {label, asIs, toBe} obligatoria'); });
        expectString(views.compare.footer, 'organization.views.compare.footer');
      }
      if (expectObject(views.history, 'organization.views.history')) {
        if (expectArray(views.history.columns, 'organization.views.history.columns') && views.history.columns.length !== 7) err('organization.views.history.columns', 'el histórico tiene siete columnas');
        ['initialReference', 'notProvided', 'processNote', 'activityNote'].forEach(function (k) { expectString(views.history[k], 'organization.views.history.' + k); });
      }
      if (expectObject(views.instruction, 'organization.views.instruction')) {
        if (expectArray(views.instruction.sections, 'organization.views.instruction.sections') && views.instruction.sections.length !== 9) err('organization.views.instruction.sections', 'la instrucción tiene nueve secciones');
        expectString(views.instruction.disclaimer, 'organization.views.instruction.disclaimer');
      }
      if (expectObject(views.areaSpace, 'organization.views.areaSpace')) {
        if (expectArray(views.areaSpace.sections, 'organization.views.areaSpace.sections') && views.areaSpace.sections.length !== 5) err('organization.views.areaSpace.sections', 'el espacio del área tiene cinco secciones');
        expectString(views.areaSpace.noDetail, 'organization.views.areaSpace.noDetail');
        if (expectObject(views.areaSpace.processCard, 'organization.views.areaSpace.processCard')) { expectString(views.areaSpace.processCard.owner, 'organization.views.areaSpace.processCard.owner'); expectString(views.areaSpace.processCard.status, 'organization.views.areaSpace.processCard.status'); }
      }
      if (expectObject(views.orgchart, 'organization.views.orgchart')) ['legend', 'note', 'externalLabel'].forEach(function (k) { expectString(views.orgchart[k], 'organization.views.orgchart.' + k); });
    }

    /* ---------- demo / profiles ---------- */
    var demo = raw.demo;
    var profileIds = new Set();
    if (expectObject(demo, 'demo')) {
      if (!isDate(demo.businessDate)) err('demo.businessDate', 'fecha YYYY-MM-DD válida obligatoria');
      if (!isDate(demo.dueSoonUntil)) err('demo.dueSoonUntil', 'fecha YYYY-MM-DD válida obligatoria');
      else if (isDate(demo.businessDate) && demo.dueSoonUntil < demo.businessDate) err('demo.dueSoonUntil', 'dueSoonUntil no puede ser anterior a businessDate');
      expectString(demo.clockStart, 'demo.clockStart');
      expectEnum(demo.initialTab, tabIds, 'demo.initialTab', 'initialTab');
      if (expectArray(demo.profiles, 'demo.profiles')) {
        demo.profiles.forEach(function (pr, i) {
          var p = 'demo.profiles[' + i + ']';
          if (!isObject(pr)) { err(p, 'perfil no válido'); return; }
          if (registerId(pr.id, p + '.id', 'profile')) profileIds.add(pr.id);
          expectString(pr.label, p + '.label');
          expectEnum(pr.accessRole, ACCESS_ROLES, p + '.accessRole', 'accessRole');
          if (pr.positionId !== undefined) checkEntityRef(pr.positionId, p + '.positionId', ['position'], true);
          if (pr.personId !== undefined) checkEntityRef(pr.personId, p + '.personId', ['person'], true);
          if (pr.areaId !== undefined) checkEntityRef(pr.areaId, p + '.areaId', ['area'], true);
          if (expectObject(pr.grants, p + '.grants')) {
            checkEntityRefs(pr.grants.processOwnerOf, p + '.grants.processOwnerOf', ['process']);
            expectBool(pr.grants.canMaintainModel, p + '.grants.canMaintainModel');
            if (pr.accessRole !== 'admin' && pr.grants.canMaintainModel === true) err(p + '.grants.canMaintainModel', 'solo admin puede mantener el modelo');
          }
          if (expectObject(pr.visibility, p + '.visibility')) {
            expectBool(pr.visibility.all, p + '.visibility.all');
            if (pr.visibility.all === false) {
              checkEntityRefs(pr.visibility.entityIds, p + '.visibility.entityIds', null);
              if (expectArray(pr.visibility.versionTypes, p + '.visibility.versionTypes')) pr.visibility.versionTypes.forEach(function (t, j) { expectEnum(t, VERSION_TYPES, p + '.visibility.versionTypes[' + j + ']', 'tipo de versión'); });
              expectBool(pr.visibility.tracking, p + '.visibility.tracking');
            }
            if (pr.visibility.all === true && pr.accessRole === 'employee') err(p + '.visibility.all', 'un perfil employee no consulta toda la organización');
          }
        });
      }
      if (!profileIds.has(demo.initialProfileId)) err('demo.initialProfileId', 'perfil inicial no encontrado: ' + demo.initialProfileId);
      if (expectArray(demo.accessMatrix, 'demo.accessMatrix')) {
        demo.accessMatrix.forEach(function (row, i) {
          var p = 'demo.accessMatrix[' + i + ']';
          if (!isObject(row)) { err(p, 'fila no válida'); return; }
          expectString(row.action, p + '.action');
          expectString(row.label, p + '.label');
          ['admin', 'manager', 'employee', 'owner'].forEach(function (k) { expectBool(row[k], p + '.' + k); });
        });
      }
    }

    /* ---------- navigation targets (§7.5) ---------- */
    var scopeItemIds = new Set();
    var methodIds = new Set();
    var solutionNodeIds = new Set();
    var scopeFilterIds = new Set();
    var workspaceIds = new Set();
    var scenarioIds = new Set();
    if (isObject(raw.scope)) {
      if (Array.isArray(raw.scope.items)) raw.scope.items.forEach(function (it) { if (isObject(it) && isNonEmptyString(it.id)) scopeItemIds.add(it.id); });
      if (Array.isArray(raw.scope.filters)) raw.scope.filters.forEach(function (f) { if (isObject(f) && isNonEmptyString(f.id)) scopeFilterIds.add(f.id); });
    }
    if (isObject(raw.methodologies) && Array.isArray(raw.methodologies.items)) raw.methodologies.items.forEach(function (it) { if (isObject(it) && isNonEmptyString(it.id)) methodIds.add(it.id); });
    if (isObject(raw.solution) && Array.isArray(raw.solution.nodes)) raw.solution.nodes.forEach(function (n) { if (isObject(n) && isNonEmptyString(n.id)) solutionNodeIds.add(n.id); });
    if (isObject(raw.desktop) && Array.isArray(raw.desktop.workspaces)) raw.desktop.workspaces.forEach(function (w) { if (isObject(w) && isNonEmptyString(w.id)) workspaceIds.add(w.id); });
    if (Array.isArray(raw.scenarios)) raw.scenarios.forEach(function (s) { if (isObject(s) && isNonEmptyString(s.id)) scenarioIds.add(s.id); });

    var allActivityKeys = new Set();
    activityByKey.forEach(function (entries, key) { allActivityKeys.add(key); });
    flowNodeIds.forEach(function (set) { set.forEach(function (id) { allActivityKeys.add(id); }); });

    function checkTarget(target, path) {
      if (!isObject(target)) { err(path, 'destino de navegación no válido'); return; }
      if (!expectEnum(target.tab, tabIds, path + '.tab', 'tab')) return;
      var w = target.web;
      if (w !== undefined && w !== null) {
        if (!isObject(w)) { err(path + '.web', 'web debe ser un objeto'); return; }
        if (w.module !== undefined) expectEnum(w.module, ['twin', 'security'], path + '.web.module', 'module');
        if (w.level !== undefined) expectEnum(w.level, levels, path + '.web.level', 'level');
        if (w.representation !== undefined) expectEnum(w.representation, representations, path + '.web.representation', 'representation');
        if (w.depth !== undefined) expectEnum(w.depth, depths, path + '.web.depth', 'depth');
        if (w.processView !== undefined) expectEnum(w.processView, processViews, path + '.web.processView', 'processView');
        if (w.processId !== undefined) checkEntityRef(w.processId, path + '.web.processId', ['process']);
        if (w.areaId !== undefined) checkEntityRef(w.areaId, path + '.web.areaId', ['area']);
        if (w.areaFilter !== undefined) checkEntityRef(w.areaFilter, path + '.web.areaFilter', ['area']);
        if (w.versionId !== undefined) checkVersionRef(w.versionId, path + '.web.versionId');
        if (w.paymentVariant !== undefined && !variantIds.has(w.paymentVariant)) err(path + '.web.paymentVariant', 'variante no encontrada: ' + w.paymentVariant);
        if (w.activityKey !== undefined && !allActivityKeys.has(w.activityKey)) err(path + '.web.activityKey', 'actividad o nodo no encontrado: ' + w.activityKey);
        if (w.selectEntityId !== undefined && !entityById.has(w.selectEntityId) && !allActivityKeys.has(w.selectEntityId)) err(path + '.web.selectEntityId', 'entidad no encontrada: ' + w.selectEntityId);
        if (w.highlightRootId !== undefined) checkEntityRef(w.highlightRootId, path + '.web.highlightRootId');
        if (w.relationsRootId !== undefined) checkEntityRef(w.relationsRootId, path + '.web.relationsRootId');
        if (w.securityView !== undefined) expectEnum(w.securityView, SECURITY_VIEWS, path + '.web.securityView', 'securityView');
        if (w.listMode !== undefined) expectBool(w.listMode, path + '.web.listMode');
        if (w.overlay !== undefined && w.overlay !== null) {
          if (!isObject(w.overlay)) err(path + '.web.overlay', 'overlay debe ser un objeto');
          else {
            expectEnum(w.overlay.kind, OVERLAY_KINDS, path + '.web.overlay.kind', 'overlay.kind');
            if (w.overlay.entityId !== undefined && w.overlay.entityId !== null && !entityById.has(w.overlay.entityId) && !allActivityKeys.has(w.overlay.entityId)) err(path + '.web.overlay.entityId', 'entidad no encontrada: ' + w.overlay.entityId);
            if (w.overlay.versionId !== undefined) checkVersionRef(w.overlay.versionId, path + '.web.overlay.versionId', true);
          }
        }
      }
      var d = target.desktop;
      if (d !== undefined && d !== null) {
        if (!isObject(d)) { err(path + '.desktop', 'desktop debe ser un objeto'); return; }
        if (d.workspaceId !== undefined && !workspaceIds.has(d.workspaceId)) err(path + '.desktop.workspaceId', 'espacio no encontrado: ' + d.workspaceId);
        if (d.scenarioId !== undefined && !scenarioIds.has(d.scenarioId)) err(path + '.desktop.scenarioId', 'escenario no encontrado: ' + d.scenarioId);
        if (d.projectId !== undefined && !trackingProjectIds.has(d.projectId)) err(path + '.desktop.projectId', 'proyecto no encontrado: ' + d.projectId);
      }
      var a = target.architecture;
      if (a !== undefined && a !== null) {
        if (!isObject(a)) err(path + '.architecture', 'architecture debe ser un objeto');
        else if (a.nodeId !== undefined && !solutionNodeIds.has(a.nodeId)) err(path + '.architecture.nodeId', 'componente no encontrado: ' + a.nodeId);
      }
      var s = target.scope;
      if (s !== undefined && s !== null) {
        if (!isObject(s)) err(path + '.scope', 'scope debe ser un objeto');
        else {
          if (s.itemId !== undefined && !scopeItemIds.has(s.itemId)) err(path + '.scope.itemId', 'elemento de alcance no encontrado: ' + s.itemId);
          if (s.filter !== undefined && !scopeFilterIds.has(s.filter)) err(path + '.scope.filter', 'filtro no encontrado: ' + s.filter);
        }
      }
      var m = target.methodologies;
      if (m !== undefined && m !== null) {
        if (!isObject(m)) err(path + '.methodologies', 'methodologies debe ser un objeto');
        else if (m.itemId !== undefined && !methodIds.has(m.itemId)) err(path + '.methodologies.itemId', 'metodología no encontrada: ' + m.itemId);
      }
    }

    /* ---------- solution ---------- */
    var solution = raw.solution;
    if (expectObject(solution, 'solution')) {
      ['title', 'intro', 'caption', 'emptyInspector'].forEach(function (k) { expectString(solution[k], 'solution.' + k); });
      var zoneIds = new Set();
      if (expectArray(solution.zones, 'solution.zones')) solution.zones.forEach(function (z, i) {
        var p = 'solution.zones[' + i + ']';
        if (!isObject(z)) { err(p, 'zona no válida'); return; }
        if (registerId(z.id, p + '.id', 'zone')) zoneIds.add(z.id);
        expectString(z.label, p + '.label');
        expectString(z.kind, p + '.kind');
      });
      if (expectArray(solution.nodes, 'solution.nodes')) solution.nodes.forEach(function (n, i) {
        var p = 'solution.nodes[' + i + ']';
        if (!isObject(n)) { err(p, 'componente no válido'); return; }
        registerId(n.id, p + '.id', 'solutionNode');
        expectString(n.name, p + '.name');
        if (!zoneIds.has(n.zoneId)) err(p + '.zoneId', 'zona no encontrada: ' + n.zoneId);
        expectString(n.state, p + '.state');
        expectEnum(n.decision, DECISIONS, p + '.decision', 'decision');
        expectString(n.decisionLabel, p + '.decisionLabel');
        expectString(n.description, p + '.description');
        expectArray(n.inputs, p + '.inputs');
        expectArray(n.outputs, p + '.outputs');
      });
      if (expectArray(solution.edges, 'solution.edges')) solution.edges.forEach(function (e, i) {
        var p = 'solution.edges[' + i + ']';
        if (!isObject(e)) { err(p, 'arista no válida'); return; }
        registerId(e.id, p + '.id', 'solutionEdge');
        if (!solutionNodeIds.has(e.from)) err(p + '.from', 'componente no encontrado: ' + e.from);
        if (!solutionNodeIds.has(e.to)) err(p + '.to', 'componente no encontrado: ' + e.to);
        if ((e.to === 'C-GRAPH' || e.to === 'C-SEC') && e.from !== 'C-API') err(p + '.from', 'solo C-API puede conectar con ' + e.to);
        expectString(e.label, p + '.label');
      });
      if (expectObject(solution.systemBoundary, 'solution.systemBoundary')) {
        expectString(solution.systemBoundary.label, 'solution.systemBoundary.label');
        if (expectArray(solution.systemBoundary.nodeIds, 'solution.systemBoundary.nodeIds')) solution.systemBoundary.nodeIds.forEach(function (id, i) { if (!solutionNodeIds.has(id)) err('solution.systemBoundary.nodeIds[' + i + ']', 'componente no encontrado: ' + id); });
      }
      if (expectArray(solution.actors, 'solution.actors')) solution.actors.forEach(function (a, i) {
        var p = 'solution.actors[' + i + ']';
        if (!isObject(a)) { err(p, 'actor no válido'); return; }
        registerId(a.id, p + '.id', 'solutionActor');
        expectString(a.label, p + '.label');
        if (expectArray(a.targetNodeIds, p + '.targetNodeIds')) a.targetNodeIds.forEach(function (id, j) { if (!solutionNodeIds.has(id)) err(p + '.targetNodeIds[' + j + ']', 'componente no encontrado: ' + id); });
      });
      ['legend', 'notes'].forEach(function (k) { expectArray(solution[k], 'solution.' + k); });
      if (expectObject(solution.lifecycle, 'solution.lifecycle')) { expectString(solution.lifecycle.title, 'solution.lifecycle.title'); expectArray(solution.lifecycle.steps, 'solution.lifecycle.steps'); expectString(solution.lifecycle.note, 'solution.lifecycle.note'); }
      if (expectArray(solution.ctas, 'solution.ctas')) solution.ctas.forEach(function (c, i) { if (!isObject(c)) { err('solution.ctas[' + i + ']', 'cta no válida'); return; } expectString(c.label, 'solution.ctas[' + i + '].label'); checkTarget(c.target, 'solution.ctas[' + i + '].target'); });
    }

    /* ---------- scope ---------- */
    var scope = raw.scope;
    if (expectObject(scope, 'scope')) {
      expectString(scope.title, 'scope.title');
      expectString(scope.intro, 'scope.intro');
      if (expectArray(scope.filters, 'scope.filters')) {
        uniqueWithin(scope.filters, 'scope.filters');
        scope.filters.forEach(function (f, i) { if (!isObject(f)) { err('scope.filters[' + i + ']', 'filtro no válido'); return; } expectEnum(f.id, ['all'].concat(DISPOSITIONS), 'scope.filters[' + i + '].id', 'filtro'); expectString(f.label, 'scope.filters[' + i + '].label'); });
      }
      if (scope.initialFilter !== undefined && !scopeFilterIds.has(scope.initialFilter)) err('scope.initialFilter', 'filtro no encontrado: ' + scope.initialFilter);
      if (expectObject(scope.coverageLabels, 'scope.coverageLabels')) COVERAGES.forEach(function (c) { expectString(scope.coverageLabels[c], 'scope.coverageLabels.' + c); });
      if (expectObject(scope.dispositionLabels, 'scope.dispositionLabels')) DISPOSITIONS.forEach(function (d) { expectString(scope.dispositionLabels[d], 'scope.dispositionLabels.' + d); });
      if (expectArray(scope.items, 'scope.items')) scope.items.forEach(function (it, i) {
        var p = 'scope.items[' + i + ']';
        if (!isObject(it)) { err(p, 'elemento no válido'); return; }
        registerId(it.id, p + '.id', 'scopeItem');
        expectString(it.title, p + '.title');
        expectString(it.description, p + '.description');
        expectEnum(it.disposition, DISPOSITIONS, p + '.disposition', 'disposition');
        expectEnum(it.coverage, COVERAGES, p + '.coverage', 'coverage');
        if (it.disposition === 'excluded' && it.coverage === 'interactive') err(p + '.coverage', 'un elemento fuera de alcance no puede ser interactivo');
        if (it.target !== undefined && it.target !== null) checkTarget(it.target, p + '.target');
        checkSourceIds(it.sourceIds, p + '.sourceIds', true);
        if (it.dependencyItemIds !== undefined && expectArray(it.dependencyItemIds, p + '.dependencyItemIds')) it.dependencyItemIds.forEach(function (id, j) { if (!scopeItemIds.has(id)) err(p + '.dependencyItemIds[' + j + ']', 'elemento de alcance no encontrado: ' + id); });
        if (it.acceptance !== undefined && !isString(it.acceptance) && !Array.isArray(it.acceptance)) err(p + '.acceptance', 'acceptance debe ser texto o lista');
      });
      if (expectObject(scope.deliverables, 'scope.deliverables')) { expectString(scope.deliverables.title, 'scope.deliverables.title'); expectArray(scope.deliverables.items, 'scope.deliverables.items'); }
      if (expectObject(scope.clientContributions, 'scope.clientContributions')) { expectString(scope.clientContributions.title, 'scope.clientContributions.title'); expectArray(scope.clientContributions.items, 'scope.clientContributions.items'); }
      if (expectObject(scope.empty, 'scope.empty')) { expectString(scope.empty.text, 'scope.empty.text'); expectString(scope.empty.action, 'scope.empty.action'); }
      expectString(scope.viewInDemo, 'scope.viewInDemo');
    }

    /* ---------- methodologies ---------- */
    var methodologies = raw.methodologies;
    if (expectObject(methodologies, 'methodologies')) {
      expectString(methodologies.title, 'methodologies.title');
      expectString(methodologies.intro, 'methodologies.intro');
      var groupIds = new Set();
      if (expectArray(methodologies.groups, 'methodologies.groups')) {
        uniqueWithin(methodologies.groups, 'methodologies.groups');
        methodologies.groups.forEach(function (g, i) { if (!isObject(g)) { err('methodologies.groups[' + i + ']', 'grupo no válido'); return; } if (expectString(g.id, 'methodologies.groups[' + i + '].id')) groupIds.add(g.id); expectString(g.label, 'methodologies.groups[' + i + '].label'); });
      }
      if (expectArray(methodologies.items, 'methodologies.items')) methodologies.items.forEach(function (it, i) {
        var p = 'methodologies.items[' + i + ']';
        if (!isObject(it)) { err(p, 'metodología no válida'); return; }
        registerId(it.id, p + '.id', 'method');
        expectString(it.name, p + '.name');
        if (!groupIds.has(it.group)) err(p + '.group', 'grupo no encontrado: ' + it.group);
        ['statusLabel', 'usage'].forEach(function (k) { expectString(it[k], p + '.' + k); });
        /* excluded/reference methods may state "no evidence" explicitly with null */
        ['question', 'evidence', 'limit'].forEach(function (k) {
          if (it.group === 'applied') expectString(it[k], p + '.' + k); else expectStringOrNull(it[k], p + '.' + k);
        });
        if (expectArray(it.scopeItemIds, p + '.scopeItemIds')) it.scopeItemIds.forEach(function (id, j) { if (!scopeItemIds.has(id)) err(p + '.scopeItemIds[' + j + ']', 'elemento de alcance no encontrado: ' + id); });
        checkSourceIds(it.sourceIds, p + '.sourceIds', true);
        if (it.example !== undefined && it.example !== null) {
          if (!isObject(it.example)) err(p + '.example', 'example debe ser null o {label, target}');
          else { expectString(it.example.label, p + '.example.label'); checkTarget(it.example.target, p + '.example.target'); }
        }
        if (it.externalReference !== undefined && it.externalReference !== null) {
          if (!isObject(it.externalReference)) err(p + '.externalReference', 'externalReference debe ser null o {label, url}');
          else {
            expectString(it.externalReference.label, p + '.externalReference.label');
            if (!isString(it.externalReference.url) || it.externalReference.url.indexOf('https://') !== 0) err(p + '.externalReference.url', 'la referencia externa debe usar https://');
          }
        }
      });
      expectArray(methodologies.footer, 'methodologies.footer');
    }

    /* ---------- tracking ---------- */
    var tracking = raw.tracking;
    if (expectObject(tracking, 'tracking')) {
      ['incidentsTitle', 'badge', 'dateLabel', 'projectsTitle'].forEach(function (k) { expectString(tracking[k], 'tracking.' + k); });
      if (tracking.processId !== undefined) checkEntityRef(tracking.processId, 'tracking.processId', ['process']);
      if (expectArray(tracking.incidentFilters, 'tracking.incidentFilters')) {
        uniqueWithin(tracking.incidentFilters, 'tracking.incidentFilters');
        tracking.incidentFilters.forEach(function (f, i) { if (!isObject(f)) { err('tracking.incidentFilters[' + i + ']', 'filtro no válido'); return; } expectEnum(f.id, ['all', 'open', 'closed', 'overdue', 'dueSoon'], 'tracking.incidentFilters[' + i + '].id', 'filtro'); expectString(f.label, 'tracking.incidentFilters[' + i + '].label'); });
      }
      if (expectObject(tracking.incidentStatusLabels, 'tracking.incidentStatusLabels')) INCIDENT_STATUSES.forEach(function (s) { expectString(tracking.incidentStatusLabels[s], 'tracking.incidentStatusLabels.' + s); });
      if (expectObject(tracking.noticeLabels, 'tracking.noticeLabels')) ['overdue', 'dueSoon', 'onTime', 'closed'].forEach(function (s) { expectString(tracking.noticeLabels[s], 'tracking.noticeLabels.' + s); });
      if (expectObject(tracking.projectStatusLabels, 'tracking.projectStatusLabels')) PROJECT_STATUSES.forEach(function (s) { expectString(tracking.projectStatusLabels[s], 'tracking.projectStatusLabels.' + s); });
      var responsible = new Set();
      if (expectArray(tracking.responsibleOptions, 'tracking.responsibleOptions')) tracking.responsibleOptions.forEach(function (id, i) { if (checkEntityRef(id, 'tracking.responsibleOptions[' + i + ']', ['role', 'area'])) responsible.add(id); });
      var projectResponsible = new Set();
      if (expectArray(tracking.projectResponsibleOptions, 'tracking.projectResponsibleOptions')) tracking.projectResponsibleOptions.forEach(function (id, i) { if (checkEntityRef(id, 'tracking.projectResponsibleOptions[' + i + ']', ['role', 'area'])) projectResponsible.add(id); });
      if (expectArray(tracking.incidents, 'tracking.incidents')) tracking.incidents.forEach(function (inc, i) {
        var p = 'tracking.incidents[' + i + ']';
        if (!isObject(inc)) { err(p, 'incidencia no válida'); return; }
        registerId(inc.id, p + '.id', 'incident');
        expectString(inc.subject, p + '.subject');
        expectString(inc.description, p + '.description');
        checkEntityRef(inc.processId, p + '.processId', ['process']);
        if (checkEntityRef(inc.responsibleId, p + '.responsibleId', ['role', 'area']) && responsible.size && !responsible.has(inc.responsibleId)) err(p + '.responsibleId', 'responsable fuera de responsibleOptions');
        expectEnum(inc.status, INCIDENT_STATUSES, p + '.status', 'status');
        if (!isDate(inc.createdAt)) err(p + '.createdAt', 'fecha YYYY-MM-DD válida obligatoria');
        if (!isDate(inc.dueDate)) err(p + '.dueDate', 'fecha YYYY-MM-DD válida obligatoria');
        if (!isNullOr(inc.closedAt, isDate)) err(p + '.closedAt', 'closedAt debe ser fecha o null');
        if (inc.status === 'closed') { if (!isDate(inc.closedAt)) err(p + '.closedAt', 'una incidencia cerrada lleva closedAt'); if (!isNonEmptyString(inc.resolution)) err(p + '.resolution', 'una incidencia cerrada lleva resolución'); }
        else { if (inc.closedAt) err(p + '.closedAt', 'solo las incidencias cerradas llevan closedAt'); if (inc.resolution) err(p + '.resolution', 'solo las incidencias cerradas llevan resolución'); }
        if (inc.isDemo !== true) err(p + '.isDemo', 'los registros de seguimiento son ficticios: isDemo debe ser true');
        checkSourceIds(inc.sourceIds, p + '.sourceIds', true);
        if (inc.gapIds !== undefined) checkEntityRefs(inc.gapIds, p + '.gapIds', ['gap'], true);
      });
      if (expectArray(tracking.projects, 'tracking.projects')) tracking.projects.forEach(function (pr, i) {
        var p = 'tracking.projects[' + i + ']';
        if (!isObject(pr)) { err(p, 'proyecto no válido'); return; }
        registerId(pr.id, p + '.id', 'project');
        expectString(pr.name, p + '.name');
        expectString(pr.objective, p + '.objective');
        checkEntityRef(pr.processId, p + '.processId', ['process']);
        if (pr.gapIds !== undefined) checkEntityRefs(pr.gapIds, p + '.gapIds', ['gap'], true);
        if (checkEntityRef(pr.responsibleId, p + '.responsibleId', ['role', 'area']) && projectResponsible.size && !projectResponsible.has(pr.responsibleId)) err(p + '.responsibleId', 'responsable fuera de projectResponsibleOptions');
        if (!isNullOr(pr.startDate, isDate)) err(p + '.startDate', 'fecha YYYY-MM-DD o null');
        if (!isDate(pr.dueDate)) err(p + '.dueDate', 'fecha YYYY-MM-DD válida obligatoria');
        expectEnum(pr.status, PROJECT_STATUSES, p + '.status', 'status');
        checkVersionRef(pr.targetVersionId, p + '.targetVersionId');
        if (pr.backingReference !== undefined) expectStringOrNull(pr.backingReference, p + '.backingReference');
        if (pr.result !== undefined) expectStringOrNull(pr.result, p + '.result');
        if (pr.status !== 'concluded' && (pr.result || pr.backingReference)) err(p + '.status', 'resultado y respaldo solo existen en proyectos concluidos');
        if (pr.isDemo !== true) err(p + '.isDemo', 'los proyectos de la demo son ficticios: isDemo debe ser true');
        if (pr.commitments !== undefined && expectArray(pr.commitments, p + '.commitments')) pr.commitments.forEach(function (c, j) { if (!isObject(c) || !isNonEmptyString(c.label) || !isNonEmptyString(c.status)) err(p + '.commitments[' + j + ']', 'compromiso {label, status} obligatorio'); });
        if (pr.followUp !== undefined) expectArray(pr.followUp, p + '.followUp');
      });
      if (tracking.prepareAsIsTarget !== undefined && tracking.prepareAsIsTarget !== null) checkTarget(tracking.prepareAsIsTarget, 'tracking.prepareAsIsTarget');
      if (expectObject(tracking.texts, 'tracking.texts')) ['closeHint', 'closeConfirm', 'simulateClose', 'prepareAsIs', 'trackingPermissionRequired'].forEach(function (k) { expectString(tracking.texts[k], 'tracking.texts.' + k); });
    }

    /* ---------- security ---------- */
    var securityRaw = raw.security;
    if (expectObject(securityRaw, 'security')) {
      ['title', 'intro', 'note', 'credentialNote', 'deleteConfirm', 'restricted', 'auditEmpty'].forEach(function (k) { expectString(securityRaw[k], 'security.' + k); });
      var activeAdmins = 0;
      var usernames = new Set();
      if (expectArray(securityRaw.accounts, 'security.accounts')) securityRaw.accounts.forEach(function (acc, i) {
        var p = 'security.accounts[' + i + ']';
        if (!isObject(acc)) { err(p, 'cuenta no válida'); return; }
        registerId(acc.id, p + '.id', 'account');
        if (!isString(acc.username) || !USERNAME_RE.test(acc.username)) err(p + '.username', 'nombre de acceso de 3–40 caracteres [a-z0-9._-]');
        else { var key = acc.username.trim().toLowerCase(); if (usernames.has(key)) err(p + '.username', 'usuario duplicado: ' + acc.username); usernames.add(key); }
        expectEnum(acc.role, ACCESS_ROLES, p + '.role', 'role');
        if (acc.positionId !== undefined) checkEntityRef(acc.positionId, p + '.positionId', ['position'], true);
        if (acc.role === 'employee' && !acc.positionId) err(p + '.positionId', 'un colaborador requiere puesto');
        expectEnum(acc.status, ACCOUNT_STATUSES, p + '.status', 'status');
        expectBool(acc.isTest, p + '.isTest');
        if (acc.password !== undefined) err(p + '.password', 'no se embeben contraseñas');
        if (acc.role === 'admin' && acc.status === 'active') activeAdmins++;
      });
      if (Array.isArray(securityRaw.accounts) && activeAdmins === 0) err('security.accounts', 'debe existir al menos un administrador activo');
    }

    /* ---------- desktop ---------- */
    var desktop = raw.desktop;
    var sessionIds = new Set();
    var evidenceIds = new Set();
    if (expectObject(desktop, 'desktop')) {
      ['title', 'intro', 'disclaimer', 'unsupported', 'readOnlyMessage'].forEach(function (k) { expectString(desktop[k], 'desktop.' + k); });
      if (expectObject(desktop.composer, 'desktop.composer')) ['label', 'placeholder', 'submit'].forEach(function (k) { expectString(desktop.composer[k], 'desktop.composer.' + k); });
      if (expectObject(desktop.footer, 'desktop.footer')) ['sessionOnly', 'pendingReview'].forEach(function (k) { expectString(desktop.footer[k], 'desktop.footer.' + k); });
      if (expectArray(desktop.modes, 'desktop.modes')) { uniqueWithin(desktop.modes, 'desktop.modes'); desktop.modes.forEach(function (m, i) { if (!isObject(m)) { err('desktop.modes[' + i + ']', 'modo no válido'); return; } expectEnum(m.id, ['chat', 'ops'], 'desktop.modes[' + i + '].id', 'modo'); expectString(m.label, 'desktop.modes[' + i + '].label'); }); }
      if (expectArray(desktop.operationsColumns, 'desktop.operationsColumns') && desktop.operationsColumns.length !== 4) err('desktop.operationsColumns', 'operaciones tiene cuatro columnas');
      if (expectArray(desktop.sessions, 'desktop.sessions')) desktop.sessions.forEach(function (s, i) { if (!isObject(s)) { err('desktop.sessions[' + i + ']', 'sesión no válida'); return; } if (registerId(s.id, 'desktop.sessions[' + i + '].id', 'session')) sessionIds.add(s.id); if (!workspaceIds.has(s.workspaceId)) err('desktop.sessions[' + i + '].workspaceId', 'espacio no encontrado: ' + s.workspaceId); });
      if (expectArray(desktop.evidence, 'desktop.evidence')) desktop.evidence.forEach(function (ev, i) {
        var p = 'desktop.evidence[' + i + ']';
        if (!isObject(ev)) { err(p, 'evidencia no válida'); return; }
        if (registerId(ev.id, p + '.id', 'evidence')) evidenceIds.add(ev.id);
        if (!sourceIds.has(ev.sourceId)) err(p + '.sourceId', 'fuente no encontrada: ' + ev.sourceId);
        if (ev.versionId !== undefined) checkVersionRef(ev.versionId, p + '.versionId', true, true);
        expectString(ev.label, p + '.label');
        expectString(ev.stateLabel, p + '.stateLabel');
        expectArray(ev.summary, p + '.summary');
        if (ev.entityIds !== undefined) checkEntityRefs(ev.entityIds, p + '.entityIds', null, true);
        if (EVIDENCE_RESTRICTIONS.indexOf(ev.restrictedTo === undefined ? null : ev.restrictedTo) === -1) err(p + '.restrictedTo', 'restrictedTo debe ser null, AS-IS o TO-BE');
      });
      if (expectArray(desktop.workspaces, 'desktop.workspaces')) desktop.workspaces.forEach(function (w, i) {
        var p = 'desktop.workspaces[' + i + ']';
        if (!isObject(w)) { err(p, 'espacio no válido'); return; }
        registerId(w.id, p + '.id', 'workspace');
        expectString(w.label, p + '.label');
        expectString(w.statusLabel, p + '.statusLabel');
        if (!sessionIds.has(w.sessionId)) err(p + '.sessionId', 'sesión no encontrada: ' + w.sessionId);
        if (w.processId !== undefined) checkEntityRef(w.processId, p + '.processId', ['process'], true);
        if (expectArray(w.evidenceIds, p + '.evidenceIds')) w.evidenceIds.forEach(function (id, j) { if (!evidenceIds.has(id)) err(p + '.evidenceIds[' + j + ']', 'evidencia no encontrada: ' + id); });
        if (expectArray(w.scenarioIds, p + '.scenarioIds')) w.scenarioIds.forEach(function (id, j) { if (!scenarioIds.has(id)) err(p + '.scenarioIds[' + j + ']', 'escenario no encontrado: ' + id); });
        if (w.chips !== undefined) expectArray(w.chips, p + '.chips');
        if (w.welcome !== undefined) expectStringOrNull(w.welcome, p + '.welcome');
        if (w.welcomeActions !== undefined && expectArray(w.welcomeActions, p + '.welcomeActions')) w.welcomeActions.forEach(function (a, j) { if (!isObject(a)) { err(p + '.welcomeActions[' + j + ']', 'acción no válida'); return; } expectString(a.label, p + '.welcomeActions[' + j + '].label'); checkTarget(a.target, p + '.welcomeActions[' + j + '].target'); });
      });
      if (expectObject(desktop.evidencePicker, 'desktop.evidencePicker')) expectString(desktop.evidencePicker.label, 'desktop.evidencePicker.label');
    }

    /* ---------- scenarios ---------- */
    if (expectArray(raw.scenarios, 'scenarios')) raw.scenarios.forEach(function (sc, i) {
      var p = 'scenarios[' + i + ']';
      if (!isObject(sc)) { err(p, 'escenario no válido'); return; }
      registerId(sc.id, p + '.id', 'scenario');
      expectString(sc.title, p + '.title');
      if (!sessionIds.has(sc.sessionId)) err(p + '.sessionId', 'sesión no encontrada: ' + sc.sessionId);
      if (!workspaceIds.has(sc.workspaceId)) err(p + '.workspaceId', 'espacio no encontrado: ' + sc.workspaceId);
      if (sc.processId !== undefined) checkEntityRef(sc.processId, p + '.processId', ['process'], true);
      if (sc.projectId !== undefined && sc.projectId !== null && !trackingProjectIds.has(sc.projectId)) err(p + '.projectId', 'proyecto no encontrado: ' + sc.projectId);
      if (expectObject(sc.trigger, p + '.trigger')) { expectString(sc.trigger.label, p + '.trigger.label'); expectString(sc.trigger.prompt, p + '.trigger.prompt'); }
      if (expectArray(sc.preconditions, p + '.preconditions')) sc.preconditions.forEach(function (pc, j) {
        var pp = p + '.preconditions[' + j + ']';
        if (!isObject(pc)) { err(pp, 'precondición no válida'); return; }
        if (!expectEnum(pc.check, PRECONDITION_CHECKS, pp + '.check', 'check')) return;
        if (pc.check === 'profileRole') expectEnum(pc.value, ACCESS_ROLES, pp + '.value', 'rol');
        if (pc.check === 'versionExists' || pc.check === 'versionAbsent') checkVersionRef(pc.value, pp + '.value');
        if (pc.check === 'projectExists' && !trackingProjectIds.has(pc.value)) err(pp + '.value', 'proyecto no encontrado: ' + pc.value);
        if (pc.message !== undefined) expectStringOrNull(pc.message, pp + '.message');
        if (pc.cta !== undefined && pc.cta !== null) { if (!isObject(pc.cta)) err(pp + '.cta', 'cta no válida'); else { expectString(pc.cta.label, pp + '.cta.label'); if (pc.cta.scenarioId !== undefined && !scenarioIds.has(pc.cta.scenarioId)) err(pp + '.cta.scenarioId', 'escenario no encontrado: ' + pc.cta.scenarioId); if (pc.cta.target !== undefined) checkTarget(pc.cta.target, pp + '.cta.target'); } }
      });
      var eventIds = new Set();
      var toolStarts = {};
      var toolResults = {};
      var lastSeq = -Infinity;
      if (expectArray(sc.events, p + '.events')) sc.events.forEach(function (ev, j) {
        var ep = p + '.events[' + j + ']';
        if (!isObject(ev)) { err(ep, 'evento no válido'); return; }
        if (registerId(ev.id, ep + '.id', 'event')) eventIds.add(ev.id);
        if (typeof ev.sequence !== 'number' || !(ev.sequence > lastSeq)) err(ep + '.sequence', 'sequence debe ser numérica y estrictamente creciente');
        if (typeof ev.sequence === 'number') lastSeq = ev.sequence;
        if (!expectEnum(ev.kind, EVENT_KINDS, ep + '.kind', 'kind')) return;
        if (ev.operation !== undefined) expectEnum(ev.operation, OPERATIONS, ep + '.operation', 'operation');
        if (ev.sourceIds !== undefined) checkSourceIds(ev.sourceIds, ep + '.sourceIds');
        if (ev.evidenceIds !== undefined && expectArray(ev.evidenceIds, ep + '.evidenceIds')) ev.evidenceIds.forEach(function (id, k) { if (!evidenceIds.has(id)) err(ep + '.evidenceIds[' + k + ']', 'evidencia no encontrada: ' + id); });
        if (ev.links !== undefined && expectArray(ev.links, ep + '.links')) ev.links.forEach(function (id, k) { if (!entityById.has(id)) err(ep + '.links[' + k + ']', 'entidad no encontrada: ' + id); });
        if (ev.delayMs !== undefined && (typeof ev.delayMs !== 'number' || ev.delayMs < 0)) err(ep + '.delayMs', 'delayMs debe ser un número ≥ 0');
        switch (ev.kind) {
          case 'analyst-message': case 'assistant-message': case 'error': case 'completed':
            expectString(ev.text, ep + '.text');
            if (ev.cta !== undefined && ev.cta !== null) { if (!isObject(ev.cta)) err(ep + '.cta', 'cta no válida'); else { expectString(ev.cta.label, ep + '.cta.label'); checkTarget(ev.cta.target, ep + '.cta.target'); } }
            break;
          case 'tool-start':
            expectString(ev.callId, ep + '.callId'); expectEnum(ev.operation, OPERATIONS, ep + '.operation', 'operation'); expectString(ev.label, ep + '.label'); expectString(ev.statusLabel, ep + '.statusLabel');
            if (ev.callId) { if (toolStarts[ev.callId]) err(ep + '.callId', 'callId repetido en tool-start: ' + ev.callId); toolStarts[ev.callId] = ev.id; }
            break;
          case 'tool-result':
            expectString(ev.callId, ep + '.callId'); expectEnum(ev.operation, OPERATIONS, ep + '.operation', 'operation'); expectString(ev.text, ep + '.text'); expectString(ev.statusLabel, ep + '.statusLabel');
            if (ev.callId) { if (toolResults[ev.callId]) err(ep + '.callId', 'callId repetido en tool-result: ' + ev.callId); toolResults[ev.callId] = ev.id; }
            if (ev.pending !== undefined) expectArray(ev.pending, ep + '.pending');
            break;
          case 'artifact-proposal':
            expectEnum(ev.operation, OPERATIONS, ep + '.operation', 'operation'); expectString(ev.title, ep + '.title'); checkVersionRef(ev.stagesVersionId, ep + '.stagesVersionId');
            break;
          case 'approval-request':
            expectString(ev.requestId, ep + '.requestId'); expectString(ev.text, ep + '.text');
            break;
          case 'approval-result':
            expectString(ev.requestId, ep + '.requestId'); expectEnum(ev.operation, OPERATIONS, ep + '.operation', 'operation');
            break;
          case 'form-request':
            expectString(ev.title, ep + '.title');
            if (expectArray(ev.fields, ep + '.fields')) { uniqueWithin(ev.fields, ep + '.fields'); ev.fields.forEach(function (f, k) { var fp = ep + '.fields[' + k + ']'; if (!isObject(f)) { err(fp, 'campo no válido'); return; } expectString(f.id, fp + '.id'); expectEnum(f.type, FORM_FIELD_TYPES, fp + '.type', 'type'); expectString(f.label, fp + '.label'); if (f.projectId !== undefined && !trackingProjectIds.has(f.projectId)) err(fp + '.projectId', 'proyecto no encontrado: ' + f.projectId); }); }
            if (expectObject(ev.submit, ep + '.submit')) expectString(ev.submit.label, ep + '.submit.label');
            break;
          default: break;
        }
      });
      Object.keys(toolStarts).forEach(function (callId) { if (!toolResults[callId]) err(p + '.events', 'tool-start sin tool-result para callId ' + callId); });
      if (expectArray(sc.steps, p + '.steps')) sc.steps.forEach(function (step, j) { if (!Array.isArray(step)) { err(p + '.steps[' + j + ']', 'cada paso es una lista de ids de evento'); return; } step.forEach(function (id, k) { if (!eventIds.has(id)) err(p + '.steps[' + j + '][' + k + ']', 'evento no encontrado: ' + id); }); });
      if (sc.errorModes !== undefined && expectArray(sc.errorModes, p + '.errorModes')) { uniqueWithin(sc.errorModes, p + '.errorModes'); sc.errorModes.forEach(function (em, j) { var mp = p + '.errorModes[' + j + ']'; if (!isObject(em)) { err(mp, 'modo de error no válido'); return; } expectString(em.id, mp + '.id'); expectString(em.label, mp + '.label'); expectString(em.text, mp + '.text'); if (!eventIds.has(em.replacesEventId)) err(mp + '.replacesEventId', 'evento no encontrado: ' + em.replacesEventId); }); }
      if (sc.formSubmission !== undefined && expectObject(sc.formSubmission, p + '.formSubmission')) { if (!eventIds.has(sc.formSubmission.eventId)) err(p + '.formSubmission.eventId', 'evento no encontrado: ' + sc.formSubmission.eventId); if (expectArray(sc.formSubmission.emits, p + '.formSubmission.emits')) sc.formSubmission.emits.forEach(function (id, k) { if (!eventIds.has(id)) err(p + '.formSubmission.emits[' + k + ']', 'evento no encontrado: ' + id); }); }
      if (expectObject(sc.review, p + '.review')) {
        expectString(sc.review.requestId, p + '.review.requestId');
        expectString(sc.review.title, p + '.review.title');
        expectString(sc.review.responsibleLabel, p + '.review.responsibleLabel');
        ['instructionField', 'noteField', 'reasonField'].forEach(function (k) { var f = sc.review[k]; if (f === undefined) return; if (!isObject(f) || !isNonEmptyString(f.label) || typeof f.min !== 'number' || typeof f.max !== 'number' || f.min > f.max) err(p + '.review.' + k, 'campo {label, min, max} no válido'); });
        if (expectObject(sc.review.actions, p + '.review.actions')) ['approve', 'reject', 'cancel'].forEach(function (k) { expectString(sc.review.actions[k], p + '.review.actions.' + k); });
        if (expectObject(sc.review.messages, p + '.review.messages')) ['rejected', 'canceled'].forEach(function (k) { expectString(sc.review.messages[k], p + '.review.messages.' + k); });
        var hasRequest = Array.isArray(sc.events) && sc.events.some(function (ev) { return isObject(ev) && ev.kind === 'approval-request' && ev.requestId === sc.review.requestId; });
        if (!hasRequest) err(p + '.review.requestId', 'no hay un evento approval-request con requestId ' + sc.review.requestId);
      }
      if (sc.diff !== undefined && sc.diff !== null && expectObject(sc.diff, p + '.diff')) {
        checkVersionRef(sc.diff.versionId, p + '.diff.versionId');
        checkVersionRef(sc.diff.baseVersionId, p + '.diff.baseVersionId');
        if (sc.diff.activityKey !== undefined) { var entries = activityByKey.get(sc.diff.activityKey) || []; if (!entries.some(function (en) { return en.versionId === sc.diff.baseVersionId; })) err(p + '.diff.activityKey', 'la clave ' + sc.diff.activityKey + ' no existe en la versión base ' + sc.diff.baseVersionId); }
        expectString(sc.diff.before, p + '.diff.before'); expectString(sc.diff.after, p + '.diff.after');
        checkSourceIds(sc.diff.sourceIds, p + '.diff.sourceIds', true);
        if (sc.diff.confidence !== undefined) expectEnum(sc.diff.confidence, CONFIDENCES, p + '.diff.confidence', 'confidence');
        if (sc.diff.dataState !== undefined) expectEnum(sc.diff.dataState, DATA_STATES, p + '.diff.dataState', 'dataState');
        if (sc.diff.pending !== undefined) expectArray(sc.diff.pending, p + '.diff.pending');
        if (isObject(sc.outcome) && isObject(sc.outcome.version) && sc.diff.versionId !== sc.outcome.version.id) err(p + '.diff.versionId', 'diff.versionId debe coincidir con outcome.version.id');
      }
      if (expectObject(sc.outcome, p + '.outcome')) {
        var ov = sc.outcome.version;
        if (expectObject(ov, p + '.outcome.version')) {
          registerId(ov.id, p + '.outcome.version.id', 'version');
          if (versionById.has(ov.id)) err(p + '.outcome.version.id', 'la versión de resultado ya existe en el pack: ' + ov.id);
          expectEnum(ov.type, VERSION_TYPES, p + '.outcome.version.type', 'type');
          expectEnum(ov.state, VERSION_STATES, p + '.outcome.version.state', 'state');
          ['label', 'stateLabel', 'summary', 'changeLabel', 'publishedBy'].forEach(function (k) { expectString(ov[k], p + '.outcome.version.' + k); });
          if (ov.processId !== undefined) checkEntityRef(ov.processId, p + '.outcome.version.processId', ['process']);
          checkVersionRef(ov.baseVersionId, p + '.outcome.version.baseVersionId');
          if (ov.originVersionId !== undefined) checkVersionRef(ov.originVersionId, p + '.outcome.version.originVersionId', true);
          if (ov.sourceIds !== undefined) checkSourceIds(ov.sourceIds, p + '.outcome.version.sourceIds');
          if (ov.isDemo !== undefined && ov.isDemo !== true) err(p + '.outcome.version.isDemo', 'las versiones creadas por escenarios son de demo');
        }
        if (sc.outcome.projectUpdates !== undefined && expectArray(sc.outcome.projectUpdates, p + '.outcome.projectUpdates')) sc.outcome.projectUpdates.forEach(function (pu, j) {
          var up = p + '.outcome.projectUpdates[' + j + ']';
          if (!isObject(pu)) { err(up, 'actualización no válida'); return; }
          if (!trackingProjectIds.has(pu.projectId)) err(up + '.projectId', 'proyecto no encontrado: ' + pu.projectId);
          if (expectObject(pu.set, up + '.set')) {
            if (pu.set.targetVersionId !== undefined) checkVersionRef(pu.set.targetVersionId, up + '.set.targetVersionId');
            if (pu.set.status !== undefined) expectEnum(pu.set.status, PROJECT_STATUSES, up + '.set.status', 'status');
          }
        });
        expectString(sc.outcome.logAction, p + '.outcome.logAction');
      }
      if (sc.artifact !== undefined && sc.artifact !== null && expectObject(sc.artifact, p + '.artifact')) ['title', 'stateBefore', 'stateAfter'].forEach(function (k) { expectString(sc.artifact[k], p + '.artifact.' + k); });
    });

    /* ---------- forbidden substrings (whole pack) ---------- */
    (function walk(value, path) {
      if (typeof value === 'string') {
        FORBIDDEN.forEach(function (rule) {
          var hay = rule.ci ? value.toLowerCase() : value;
          var needle = rule.ci ? rule.text.toLowerCase() : rule.text;
          if (hay.indexOf(needle) !== -1) err(path, 'cadena prohibida «' + rule.text + '»');
        });
        if (value.toLowerCase().indexOf('https://') !== -1 && !HTTPS_ALLOWED_PATH.test(path)) err(path, 'https:// solo se admite en methodologies.items[].externalReference.url');
        return;
      }
      if (Array.isArray(value)) { value.forEach(function (v, i) { walk(v, path + '[' + i + ']'); }); return; }
      if (isObject(value)) { Object.keys(value).forEach(function (k) { walk(value[k], path ? path + '.' + k : k); }); }
    })(raw, '');

    return result();
  }

  return {
    validatePack: validatePack,
    constants: {
      TOP_LEVEL: TOP_LEVEL, TABS: TABS, LEVELS: LEVELS, REPRESENTATIONS: REPRESENTATIONS, DEPTHS: DEPTHS,
      PROCESS_VIEWS: PROCESS_VIEWS, UI_KEYS: UI_KEYS, MESSAGE_IDS: MESSAGE_IDS, ACCESS_ROLES: ACCESS_ROLES,
      SOURCE_KINDS: SOURCE_KINDS, ENTITY_TYPES: ENTITY_TYPES, RELATION_TYPES: RELATION_TYPES, RELATION_ENDPOINTS: RELATION_ENDPOINTS,
      CONFIDENCES: CONFIDENCES, DATA_STATES: DATA_STATES, PROVENANCE_LABELS: PROVENANCE_LABELS, VERSION_TYPES: VERSION_TYPES,
      VERSION_STATES: VERSION_STATES, FLOW_NODE_KINDS: FLOW_NODE_KINDS, DISPOSITIONS: DISPOSITIONS, COVERAGES: COVERAGES,
      INCIDENT_STATUSES: INCIDENT_STATUSES, PROJECT_STATUSES: PROJECT_STATUSES, ACCOUNT_STATUSES: ACCOUNT_STATUSES,
      EVENT_KINDS: EVENT_KINDS, OPERATIONS: OPERATIONS, PRECONDITION_CHECKS: PRECONDITION_CHECKS, OVERLAY_KINDS: OVERLAY_KINDS,
      FORBIDDEN: FORBIDDEN.map(function (r) { return r.text; })
    }
  };
});
