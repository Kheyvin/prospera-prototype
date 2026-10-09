/* core/pack — merge, resolve and index the client pack (CONTRACTS §2, §4, §5.3).
 *
 * Pure: no DOM, no Date.now(). Runs in Node (test loader) and in the browser bundle.
 * `mergePackFiles` applies the §2 merge rule; `resolvePack` builds the frozen, indexed
 * pack object every other core module works with. Type labels, icons and relation
 * phrases live here (renderer registry), not in the pack. */
Primus.module('core/pack', function () {
  'use strict';

  /* ---------- renderer registry: entity types, relation phrases, vocabularies ---------- */

  var ENTITY_TYPES = {
    organization: { label: 'Organización', plural: 'Organizaciones', icon: 'organization' },
    area: { label: 'Área', plural: 'Áreas', icon: 'area' },
    macroprocess: { label: 'Macroproceso', plural: 'Macroprocesos', icon: 'macroprocess' },
    process: { label: 'Proceso', plural: 'Procesos', icon: 'process' },
    activity: { label: 'Actividad', plural: 'Actividades', icon: 'activity' },
    role: { label: 'Rol', plural: 'Roles', icon: 'role' },
    position: { label: 'Puesto', plural: 'Puestos', icon: 'position' },
    person: { label: 'Persona', plural: 'Personas', icon: 'person' },
    externalProvider: { label: 'Proveedor externo', plural: 'Proveedores externos', icon: 'external' },
    externalActor: { label: 'Actor externo', plural: 'Actores externos', icon: 'external' },
    system: { label: 'Sistema', plural: 'Sistemas', icon: 'system' },
    document: { label: 'Documento', plural: 'Documentos', icon: 'document' },
    policy: { label: 'Política', plural: 'Políticas', icon: 'policy' },
    objective: { label: 'Objetivo propuesto', plural: 'Objetivos propuestos', icon: 'objective' },
    indicator: { label: 'Indicador propuesto', plural: 'Indicadores propuestos', icon: 'indicator' },
    gap: { label: 'Brecha', plural: 'Brechas', icon: 'gap' },
    incident: { label: 'Incidencia', plural: 'Incidencias', icon: 'incident' },
    project: { label: 'Proyecto', plural: 'Proyectos', icon: 'project' },
    version: { label: 'Versión', plural: 'Versiones', icon: 'version' },
    decision: { label: 'Decisión', plural: 'Decisiones', icon: 'decision' },
    event: { label: 'Evento', plural: 'Eventos', icon: 'event' },
    start: { label: 'Inicio', plural: 'Inicios', icon: 'start' },
    end: { label: 'Fin', plural: 'Fines', icon: 'end' }
  };

  /* The 19 domain types that may appear in organization.entities (incident/project/version
   * are reserved for the inspector registry and live in tracking/versions). */
  var ENTITY_TYPE_IDS = ['organization', 'area', 'macroprocess', 'process', 'activity', 'role', 'position',
    'person', 'externalProvider', 'externalActor', 'system', 'document', 'policy', 'objective', 'indicator',
    'gap', 'incident', 'project', 'version'];
  var STORED_ENTITY_TYPES = ENTITY_TYPE_IDS.filter(function (t) { return t !== 'incident' && t !== 'project' && t !== 'version'; });

  var FLOW_NODE_KINDS = ['start', 'end', 'task', 'decision'];

  var RELATION_TYPES = ['parteDe', 'perteneceA', 'ocupa', 'prestaServicioComo', 'desempeña', 'agrupadoEn',
    'tieneDueñoÁrea', 'participaEn', 'ejecuta', 'usa', 'requiere', 'produce', 'contribuyeA', 'mide', 'orienta',
    'afecta', 'proponeVersión', 'gerenciaGeneral'];

  /* Spanish phrase per relation type, read from each endpoint. `out` is the phrase shown on
   * the `from` entity (from → to); `in` is the phrase shown on the `to` entity. */
  var RELATION_LABELS = {
    parteDe: { out: 'parte de', in: 'incluye' },
    perteneceA: { out: 'pertenece a', in: 'tiene el puesto' },
    ocupa: { out: 'ocupa', in: 'ocupado por' },
    prestaServicioComo: { out: 'presta servicio como', in: 'servicio prestado por' },
    desempeña: { out: 'desempeña', in: 'desempeñado por' },
    agrupadoEn: { out: 'agrupado en', in: 'agrupa' },
    tieneDueñoÁrea: { out: 'tiene como área dueña', in: 'es dueña de' },
    participaEn: { out: 'participa en', in: 'cuenta con la participación de' },
    ejecuta: { out: 'ejecuta', in: 'ejecutada por' },
    usa: { out: 'usa', in: 'usado por' },
    requiere: { out: 'requiere', in: 'requerido por' },
    produce: { out: 'produce', in: 'producido por' },
    contribuyeA: { out: 'contribuye a', in: 'recibe la contribución de' },
    mide: { out: 'mide', in: 'medido por' },
    orienta: { out: 'orienta', in: 'orientado por' },
    afecta: { out: 'afecta', in: 'afectado por' },
    proponeVersión: { out: 'propone la versión', in: 'propuesta por' },
    gerenciaGeneral: { out: 'Gerencia General', in: 'Gerencia General' }
  };

  /* Exact provenance vocabulary of spec §13. */
  var PROVENANCE_LABELS = ['Fuente del cliente', 'Síntesis de las fuentes', 'Relación por validar',
    'Propuesto · por validar', 'Ejemplo de demostración', 'Sin dato proporcionado'];
  var CONFIDENCES = ['confirmed', 'inferred', 'unverified'];
  var DATA_STATES = ['known', 'missing', 'not-applicable', 'proposed'];
  var VERSION_TYPES = ['AS-IS', 'TO-BE'];
  var VERSION_STATES = ['documented', 'incomplete-draft', 'proposed', 'published-demo', 'adopted-demo'];

  /* Canvas layers (views.layers ids) → entity types they govern. */
  var LAYER_TYPES = {
    people: ['person', 'externalProvider', 'externalActor', 'role', 'position'],
    systems: ['system'],
    documents: ['document', 'policy']
  };

  function typeLabel(type) {
    var t = ENTITY_TYPES[type];
    return t ? t.label : (type ? String(type) : '');
  }

  function typePlural(type) {
    var t = ENTITY_TYPES[type];
    return t ? t.plural : typeLabel(type);
  }

  function typeIcon(type) {
    var t = ENTITY_TYPES[type];
    return t ? t.icon : 'activity';
  }

  function relationLabel(type, direction) {
    var entry = RELATION_LABELS[type];
    if (!entry) return type ? String(type) : '';
    return direction === 'in' ? entry.in : entry.out;
  }

  function layerOfType(type) {
    var layers = Object.keys(LAYER_TYPES);
    for (var i = 0; i < layers.length; i++) {
      if (LAYER_TYPES[layers[i]].indexOf(type) !== -1) return layers[i];
    }
    return null;
  }

  /* ---------- merge (CONTRACTS §2) ---------- */

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function mergeValue(a, b, path) {
    if (a === undefined) return b;
    if (b === undefined) return a;
    if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
    if (isPlainObject(a) && isPlainObject(b)) {
      var out = {};
      Object.keys(a).forEach(function (key) { out[key] = a[key]; });
      Object.keys(b).forEach(function (key) {
        out[key] = key in out ? mergeValue(out[key], b[key], path + '.' + key) : b[key];
      });
      return out;
    }
    if (a === b) return a;
    throw new Error('Pack merge conflict at ' + path + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
  }

  /* Deep-merges the pack files: top-level keys are merged (objects key by key, arrays
   * concatenated); a scalar present in two files with different values throws. */
  function mergePackFiles(objects) {
    var merged = {};
    (objects || []).forEach(function (obj, index) {
      if (!isPlainObject(obj)) throw new Error('Pack file #' + (index + 1) + ' is not a JSON object');
      Object.keys(obj).forEach(function (key) {
        merged[key] = key in merged ? mergeValue(merged[key], obj[key], key) : obj[key];
      });
    });
    return merged;
  }

  /* ---------- freeze ---------- */

  function deepFreeze(value, seen) {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return value;
    seen.add(value);
    if (!Object.isFrozen(value)) Object.freeze(value);
    Object.keys(value).forEach(function (key) { deepFreeze(value[key], seen); });
    return value;
  }

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function listToMap(list, keyName) {
    var map = new Map();
    (list || []).forEach(function (item) {
      if (item && item[keyName || 'id'] !== undefined && item[keyName || 'id'] !== null) map.set(item[keyName || 'id'], item);
    });
    return map;
  }

  function objectToMap(obj) {
    var map = new Map();
    if (!isPlainObject(obj)) return map;
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (isPlainObject(value) && value.id === undefined) value = Object.assign({ id: key }, value);
      map.set(key, value);
    });
    return map;
  }

  /* ---------- resolve (CONTRACTS §5.3) ---------- */

  function resolvePack(packObject) {
    if (!isPlainObject(packObject)) throw new Error('resolvePack: the merged pack must be an object');
    var raw = packObject;
    var presentation = raw.presentation || {};
    var organization = raw.organization || {};
    var demo = raw.demo || {};
    var desktop = raw.desktop || {};
    var views = organization.views || {};

    var entities = listToMap(organization.entities);
    var relations = listToMap(organization.relations);
    var relationsFrom = new Map();
    var relationsTo = new Map();
    relations.forEach(function (rel) {
      if (!relationsFrom.has(rel.from)) relationsFrom.set(rel.from, []);
      relationsFrom.get(rel.from).push(rel);
      if (!relationsTo.has(rel.to)) relationsTo.set(rel.to, []);
      relationsTo.get(rel.to).push(rel);
    });
    var byType = new Map();
    entities.forEach(function (entity) {
      if (!byType.has(entity.type)) byType.set(entity.type, []);
      byType.get(entity.type).push(entity);
    });

    var sources = listToMap(raw.sources);
    var flows = objectToMap(organization.flows);

    /* Base activities: key → activity entity, grouped by attributes.versionId. */
    var activitiesByVersion = new Map();
    var activityByKey = new Map();
    (byType.get('activity') || []).forEach(function (activity) {
      var attrs = activity.attributes || {};
      var versionId = attrs.versionId;
      var key = attrs.key || activity.id;
      if (!versionId) return;
      if (!activitiesByVersion.has(versionId)) activitiesByVersion.set(versionId, {});
      activitiesByVersion.get(versionId)[key] = activity;
      if (!activityByKey.has(key)) activityByKey.set(key, []);
      activityByKey.get(key).push(activity);
    });

    function baseActivities(versionId) {
      var map = activitiesByVersion.get(versionId);
      var out = {};
      if (map) Object.keys(map).forEach(function (key) { out[key] = map[key]; });
      return out;
    }

    /* Versions: pack versions get a resolved `activities` snapshot. Derived pack versions
     * (baseVersionId set) inherit the base snapshot and apply activityOverrides on a clone. */
    var rawVersions = Array.isArray(organization.versions) ? organization.versions : [];
    var versions = new Map();
    var pendingVersions = rawVersions.slice();
    var guard = 0;
    while (pendingVersions.length && guard < 1000) {
      guard++;
      var next = [];
      pendingVersions.forEach(function (version) {
        if (version.baseVersionId && !versions.has(version.baseVersionId) && rawVersions.some(function (v) { return v.id === version.baseVersionId; })) {
          next.push(version);
          return;
        }
        var resolved = Object.assign({}, version);
        var activities = {};
        var own = activitiesByVersion.get(version.id);
        if (own) Object.keys(own).forEach(function (key) { activities[key] = own[key]; });
        if (version.baseVersionId && versions.has(version.baseVersionId)) {
          var base = versions.get(version.baseVersionId).activities || {};
          Object.keys(base).forEach(function (key) { if (!activities[key]) activities[key] = base[key]; });
          if (!resolved.flowId) resolved.flowId = versions.get(version.baseVersionId).flowId;
        }
        var overrides = version.activityOverrides || {};
        Object.keys(overrides).forEach(function (key) {
          var original = activities[key];
          if (!original) return;
          var copy = clone(original);
          copy.attributes = Object.assign({}, copy.attributes || {}, clone(overrides[key]));
          activities[key] = copy;
        });
        resolved.activities = activities;
        versions.set(version.id, resolved);
      });
      pendingVersions = next;
    }
    pendingVersions.forEach(function (version) {
      var resolved = Object.assign({}, version, { activities: baseActivities(version.id) });
      versions.set(version.id, resolved);
    });

    var profiles = listToMap(demo.profiles);
    var scenarios = listToMap(raw.scenarios);
    var workspaces = listToMap(desktop.workspaces);
    var sessions = listToMap(desktop.sessions);
    var evidence = listToMap(desktop.evidence);

    var pack = {
      raw: raw,
      schemaVersion: raw.schemaVersion,
      specVersion: raw.specVersion,
      client: raw.client || {},
      texts: presentation,
      ui: presentation.ui || {},
      messages: raw.messages || {},
      demo: demo,
      views: views,
      sources: sources,
      entities: entities,
      relations: relations,
      relationsFrom: relationsFrom,
      relationsTo: relationsTo,
      byType: byType,
      flows: flows,
      versions: versions,
      profiles: profiles,
      scenarios: scenarios,
      workspaces: workspaces,
      sessions: sessions,
      evidence: evidence,
      tracking: raw.tracking || {},
      security: raw.security || {},
      desktop: desktop,
      solution: raw.solution || {},
      scope: raw.scope || {},
      methodologies: raw.methodologies || {},
      currentAsIsVersionId: organization.currentAsIsVersionId || null,
      defaultProcessId: views.defaultProcessId || null,
      baseActivities: baseActivities,
      activityEntities: function (key) { return (activityByKey.get(key) || []).slice(); },
      entity: function (id) { return entities.get(id); },
      source: function (id) { return sources.get(id); },
      version: function (id) { return versions.get(id); },
      flow: function (id) { return flows.get(id); },
      profile: function (id) { return profiles.get(id); },
      entitiesOfType: function (type) { return (byType.get(type) || []).slice(); },
      typeLabel: typeLabel,
      typeIcon: typeIcon,
      relationLabel: relationLabel
    };

    var seen = new WeakSet();
    deepFreeze(raw, seen);
    versions.forEach(function (version) { deepFreeze(version, seen); });
    Object.freeze(pack);
    return pack;
  }

  return {
    ENTITY_TYPES: ENTITY_TYPES,
    ENTITY_TYPE_IDS: ENTITY_TYPE_IDS,
    STORED_ENTITY_TYPES: STORED_ENTITY_TYPES,
    FLOW_NODE_KINDS: FLOW_NODE_KINDS,
    RELATION_TYPES: RELATION_TYPES,
    RELATION_LABELS: RELATION_LABELS,
    PROVENANCE_LABELS: PROVENANCE_LABELS,
    CONFIDENCES: CONFIDENCES,
    DATA_STATES: DATA_STATES,
    VERSION_TYPES: VERSION_TYPES,
    VERSION_STATES: VERSION_STATES,
    LAYER_TYPES: LAYER_TYPES,
    typeLabel: typeLabel,
    typePlural: typePlural,
    typeIcon: typeIcon,
    relationLabel: relationLabel,
    layerOfType: layerOfType,
    mergePackFiles: mergePackFiles,
    resolvePack: resolvePack,
    deepFreeze: function (value) { return deepFreeze(value, new WeakSet()); },
    isPlainObject: isPlainObject
  };
});
