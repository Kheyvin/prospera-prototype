/* core/selectors — pure view-model selectors registered into the store (CONTRACTS §5.7).
 *
 * Every selector is `(ctx, ...args)` with ctx = { state, pack, graph, permissions, format,
 * store }. Results are plain data (no DOM, no functions except none): features render them.
 * Visibility (permissions), layers and search filters are applied here, never in features.
 * The exact output shape of every selector is documented in docs/selectors.md.
 *
 * Desktop selectors (desktopModel, scenarioAvailability, operationsRows, artifactPreview)
 * are implemented by core/scenarios and re-exported through a lazy require. */
Primus.module('core/selectors', function (require) {
  'use strict';

  var packCore = require('core/pack');

  /* Generic labels consumed by selectors that are not in CONTRACTS §4.2; a pack may override
   * any of them through presentation.ui (documented in schemas/client-pack.schema.md). */
  var UI_FALLBACKS = {
    owner: 'Dueño', participants: 'Participantes', variants: 'Variantes', start: 'Inicio', end: 'Fin', time: 'Tiempos',
    objective: 'Objetivo', indicator: 'Indicador', documents: 'Documentos', systems: 'Sistemas', currentSystems: 'Sistemas actuales',
    policy: 'Política', gaps: 'Situaciones observadas', responsibilities: 'Responsabilidades', formula: 'Fórmula', value: 'Valor',
    target: 'Meta', measuredAt: 'Fecha de medición', date: 'Fecha', signature: 'Firma', commitments: 'Compromisos',
    content: 'Contenido', laneLabel: 'Carril en el diagrama', positions: 'Puestos', occupants: 'Ocupantes', people: 'Personas',
    processes: 'Procesos', activities: 'Actividades', roles: 'Roles', versions: 'Versiones', summary: 'Resumen',
    mission: 'Misión', vision: 'Visión', decisionCondition: 'Condición', decisionOutcomes: 'Salidas', relatedFlow: 'Flujo relacionado',
    executor: 'Ejecutor', whatToDo: 'Qué hacer', control: 'Control', output: 'Resultado esperado', instruction: 'Instrucción',
    area: 'Área', position: 'Puesto', role: 'Rol', process: 'Proceso', version: 'Versión', macroprocess: 'Macroproceso',
    confidenceConfirmed: 'Confirmado', confidenceInferred: 'Inferido', confidenceUnverified: 'No verificado',
    modelModifiedAt: 'Última modificación del archivo de modelado', sourceNodes: 'Nodos del modelo fuente',
    derivedFromProposal: 'Derivada de una propuesta', variantNote: 'Nota de la variante', externalExchange: 'Intercambio con el cliente',
    subtasks: 'Subtareas', pendingItems: 'Pendientes', notes: 'Notas', sourceNotes: 'Notas de la fuente', previousContext: 'Contexto previo',
    status: 'Estado', state: 'Estado', created: 'Creada', closed: 'Cerrada', resolution: 'Resultado de atención', result: 'Resultado',
    backingReference: 'Respaldo interno', targetVersion: 'Versión propuesta', dates: 'Fechas', reason: 'Motivo / brechas',
    followUp: 'Histórico de seguimiento', unassigned: 'Sin asignar', provenance: 'Proveniencia', confidence: 'Confianza',
    relatedWork: 'Trabajo asociado', proposedRelation: 'Relación propuesta', proposedTools: 'Herramientas propuestas',
    viewAvailableContent: 'Ver contenido disponible', hiddenLayer: 'Hay elementos relacionados en una capa oculta', showLayer: 'Mostrar capa',
    noMatches: 'No encontramos coincidencias con estos filtros', noData: 'No hay información disponible para esta vista',
    emptySelection: 'Selecciona un elemento para ver su ficha', rootOutsideArea: 'El foco de relaciones está fuera del área seleccionada',
    removeAreaFilter: 'Quitar filtro de área', labelDemoExample: 'Ejemplo de demostración', labelProposed: 'Propuesto · por validar',
    countAreas: '{n} áreas', countPositions: '{n} puestos', countPeople: '{n} personas', countExternals: '{n} servicios externos',
    countItems: '{n} elementos', historyOf: 'Histórico de {name}', sourcesOf: 'Fuentes de {name}', connectionsOf: 'Conexiones de {name}',
    relationsRoot: 'Foco de relaciones: {name}', versionTypeAsIs: 'AS-IS', versionTypeToBe: 'TO-BE', currentVersion: 'Versión actual',
    asIsExplainer: 'Así está documentado', toBeExplainer: 'Así se propone trabajar', paymentType: 'Tipo de pago', layers: 'Capas',
    expand: 'Expandir', collapse: 'Contraer', expandAll: 'Expandir todo', collapseAll: 'Contraer todo', usersAndAccess: 'Usuarios y accesos',
    processViewSheet: 'Ficha', processViewFlow: 'Flujo', processViewCompare: 'Comparar versiones', processViewIncidents: 'Incidencias',
    processViewProjects: 'Proyectos de mejora', areaSpace: 'Espacio del área', selectArea: 'Selecciona un área',
    rolInProcess: 'Rol en el proceso', accessProfile: 'Perfil de acceso', openInspector: 'Abrir ficha', closeInspector: 'Cerrar ficha',
    inspectorBack: 'Ficha anterior', breadcrumbs: 'Ruta de navegación', inspector: 'Inspector', readOnly: 'Solo lectura',
    noProcessDetail: 'No se proporcionó el detalle de actividades de este proceso'
  };

  var LAYER_TYPES = packCore.LAYER_TYPES;
  var TONE_BY_LABEL = {
    'Fuente del cliente': 'neutral', 'Síntesis de las fuentes': 'brand', 'Relación por validar': 'warning',
    'Propuesto · por validar': 'proposed', 'Ejemplo de demostración': 'demo', 'Sin dato proporcionado': 'neutral'
  };
  var LEVEL_UI = { strategic: 'levelStrategic', tactical: 'levelTactical', operational: 'levelOperational' };
  var REP_UI = { orgchart: 'repOrgchart', processmap: 'repProcessMap', relations: 'repRelations' };
  var DEPTH_UI = { areas: 'depthAreas', positions: 'depthPositions', people: 'depthPeople' };
  var VIEW_UI = { sheet: 'processViewSheet', flow: 'processViewFlow', compare: 'processViewCompare', incidents: 'processViewIncidents', projects: 'processViewProjects' };
  var NOTICE_RANK = { overdue: 0, dueSoon: 1, onTime: 2, closed: 2 };

  /* ---------- generic helpers ---------- */

  function asArray(v) { return Array.isArray(v) ? v.slice() : (v === null || v === undefined ? [] : [v]); }
  function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function uniqueBy(list, keyFn) {
    var seen = new Set();
    return list.filter(function (item) { var k = keyFn(item); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  function ui(ctx, key) {
    var table = ctx.pack.ui || {};
    var v = table[key];
    if (v === undefined || v === null) return UI_FALLBACKS[key] !== undefined ? UI_FALLBACKS[key] : key;
    return v;
  }
  function uiFmt(ctx, key, params) { return ctx.format.interpolate(ui(ctx, key), params); }
  function msg(ctx, id) { return ctx.format.msg(id); }
  function msgText(ctx, id, params) {
    var m = ctx.format.msg(id, params);
    return typeof m === 'string' ? m : (m && m.text) || id;
  }
  function missing(ctx) { return ctx.format.missing(); }
  function nullable(ctx, v) { return ctx.format.nullable(v); }
  function web(ctx) { return (ctx.state && ctx.state.web) || {}; }
  function demo(ctx) { return (ctx.state && ctx.state.demo) || {}; }
  function views(ctx) { return ctx.pack.views || {}; }
  function tracking(ctx) { return ctx.pack.tracking || {}; }
  function trackingTexts(ctx) { return tracking(ctx).texts || {}; }
  function security(ctx) { return ctx.pack.security || {}; }

  function visibleSet(ctx) { return ctx.permissions.visibleEntityIds(ctx.state); }
  function visible(ctx, id) { return ctx.permissions.isVisible(ctx.state, id); }
  function canSee(ctx, versionId) { return ctx.permissions.canSeeVersion(ctx.state, versionId); }
  function can(ctx, action, extra) { return ctx.permissions.can(ctx.state, action, extra || {}); }
  function role(ctx) { return ctx.permissions.role(ctx.state); }
  function currentAsIsId(ctx) { return demo(ctx).currentAsIsVersionId || ctx.pack.currentAsIsVersionId; }
  function demoVersions(ctx) { return demo(ctx).versions || {}; }

  function getVersion(ctx, id) {
    if (!id) return undefined;
    if (ctx.store && typeof ctx.store.getVersion === 'function') return ctx.store.getVersion(id, ctx.state);
    return ctx.permissions.versionById(ctx.state, id);
  }

  function allVersions(ctx, processId) {
    if (ctx.store && typeof ctx.store.allVersions === 'function') return asArray(ctx.store.allVersions(processId, ctx.state));
    return ctx.permissions.allVersions(ctx.state).filter(function (v) { return !processId || v.processId === processId; });
  }

  function visibleVersions(ctx, processId) {
    return allVersions(ctx, processId).filter(function (v) { return v && canSee(ctx, v.id); });
  }

  function layerOn(ctx, type) {
    var layer = packCore.layerOfType(type);
    if (!layer) return true;
    var layers = web(ctx).layers || {};
    return layers[layer] !== false;
  }

  function entityRef(ctx, entity) {
    if (!entity) return null;
    return {
      id: entity.id,
      type: entity.type,
      typeLabel: packCore.typeLabel(entity.type),
      typePlural: packCore.typePlural(entity.type),
      icon: packCore.typeIcon(entity.type),
      name: entity.name,
      description: entity.description || null,
      labels: asArray(entity.labels),
      isDemo: !!entity.isDemo,
      proposed: !!(entity.attributes && entity.attributes.proposed) || (entity.provenance && entity.provenance.dataState === 'proposed') || false,
      external: !!(entity.attributes && entity.attributes.external) || entity.type === 'externalProvider' || entity.type === 'externalActor',
      areaId: entity.areaId || null,
      attributes: entity.attributes || {},
      entity: entity,
      testid: 'node-' + entity.id
    };
  }

  function refById(ctx, id) { return entityRef(ctx, ctx.graph.entity(id)); }

  function refs(ctx, list, filterVisible) {
    return asArray(list).filter(function (e) { return e && (!filterVisible || (visible(ctx, e.id) && layerOn(ctx, e.type))); }).map(function (e) { return entityRef(ctx, e); });
  }

  function versionRef(ctx, version) {
    if (!version) return null;
    var current = currentAsIsId(ctx);
    var isAsIs = version.type === 'AS-IS';
    var historical = isAsIs && version.id !== current;
    var originVisible = version.originVersionId ? canSee(ctx, version.originVersionId) : null;
    return {
      id: version.id,
      label: version.label || version.id,
      type: version.type || null,
      typeLabel: isAsIs ? ui(ctx, 'versionTypeAsIs') : ui(ctx, 'versionTypeToBe'),
      state: version.state || null,
      stateLabel: version.stateLabel || null,
      summary: version.summary || null,
      changeLabel: version.changeLabel || null,
      processId: version.processId || null,
      flowId: version.flowId || null,
      baseVersionId: version.baseVersionId || null,
      originVersionId: version.originVersionId || null,
      originVisible: originVisible,
      derivedLabel: version.originVersionId && !originVisible ? (version.derivedLabel || ui(ctx, 'derivedFromProposal')) : null,
      adoptionLabel: version.adoptionLabel || null,
      publishedAt: version.publishedAt || null,
      publishedAtText: version.publishedAt ? ctx.format.dateTime(version.publishedAt) : null,
      publishedBy: version.publishedBy || null,
      sourceIds: asArray(version.sourceIds),
      sources: ctx.graph.sourceRefs(version.sourceIds),
      pending: asArray(version.pending),
      notes: asArray(version.notes),
      publishable: !!version.publishable,
      isDemo: !!version.isDemo,
      isCurrentAsIs: version.id === current,
      currentLabel: version.id === current ? ui(ctx, 'currentVersion') : null,
      historical: historical,
      readOnly: historical,
      readOnlyLabel: historical ? ui(ctx, 'historicalReadOnly') : null,
      visible: canSee(ctx, version.id),
      testid: 'version-' + version.id
    };
  }

  function badges(ctx, entity) {
    var out = [];
    var seen = new Set();
    function add(label, tone) { if (!label || seen.has(label)) return; seen.add(label); out.push({ label: label, tone: tone || 'neutral' }); }
    asArray(entity.labels).forEach(function (l) { add(l, TONE_BY_LABEL[l] || 'neutral'); });
    if (entity.isDemo) add(ui(ctx, 'labelDemoExample'), 'demo');
    var a = entity.attributes || {};
    if (a.supportLabel) add(a.supportLabel, 'brand');
    if (entity.type === 'system' && a.statusLabel) add(a.statusLabel, a.status === 'current' ? 'neutral' : 'proposed');
    if (entity.type === 'position' && a.external) add((views(ctx).orgchart || {}).externalLabel || 'Servicio externo', 'neutral');
    return out;
  }

  function confidenceLabel(ctx, confidence) {
    if (confidence === 'confirmed') return ui(ctx, 'confidenceConfirmed');
    if (confidence === 'inferred') return ui(ctx, 'confidenceInferred');
    if (confidence === 'unverified') return ui(ctx, 'confidenceUnverified');
    return null;
  }

  function provenanceOf(ctx, entity, extraSourceIds) {
    var p = (entity && entity.provenance) || {};
    var ids = asArray(p.sourceIds).concat(asArray(extraSourceIds));
    ids = ids.filter(function (id, i) { return ids.indexOf(id) === i; });
    return {
      labels: asArray(entity && entity.labels),
      confidence: p.confidence || null,
      confidenceLabel: confidenceLabel(ctx, p.confidence),
      dataState: p.dataState || null,
      observedAt: p.observedAt || null,
      observedAtText: p.observedAt ? ctx.format.date(p.observedAt) : missing(ctx),
      isDemo: !!(entity && entity.isDemo),
      sourceIds: ids,
      sources: ctx.graph.sourceRefs(ids).map(function (s) {
        var src = ctx.pack.sources.get(s.id);
        return Object.assign(s, { modelModifiedAt: src && src.modelModifiedAt ? src.modelModifiedAt : null, modelModifiedAtText: src && src.modelModifiedAt ? ctx.format.dateTime(src.modelModifiedAt) : null, note: src ? src.note || null : null, clientVisible: src ? src.clientVisible !== false : true });
      }),
      label: ui(ctx, 'sources')
    };
  }

  function action(id, label, command, enabled, reason) {
    return { id: id, label: label, enabled: enabled !== false, reason: enabled === false ? (reason || null) : null, command: command || null, testid: 'inspector-action-' + id };
  }

  function navTarget(webPatch) { return { type: 'navigateTo', payload: { target: { tab: 'web', web: webPatch } } }; }

  function fact(label, value, extra) { return Object.assign({ label: label, value: value === undefined ? null : value }, extra || {}); }

  function onProcessMap(ctx) { var w = web(ctx); return w.module !== 'security' && w.level === 'strategic' && w.representation === 'processmap'; }

  /* ---------- versions of a selection / activity ---------- */

  function versionForActivity(ctx, entity, preferredId) {
    var key = ctx.graph.activityKey(entity);
    var candidates = [];
    if (preferredId) candidates.push(preferredId);
    if (web(ctx).versionId) candidates.push(web(ctx).versionId);
    var own = ctx.graph.activityVersionId(entity);
    if (own) candidates.push(own);
    for (var i = 0; i < candidates.length; i++) {
      var v = getVersion(ctx, candidates[i]);
      if (v && canSee(ctx, v.id) && (v.activities || {})[key]) return v;
    }
    var all = ctx.permissions.allVersions(ctx.state);
    for (var j = 0; j < all.length; j++) { if (canSee(ctx, all[j].id) && (all[j].activities || {})[key]) return all[j]; }
    return own ? getVersion(ctx, own) : undefined;
  }

  function resolvedActivity(ctx, version, key) {
    return version ? (ctx.graph.resolveActivity(version, key, demoVersions(ctx)) || null) : null;
  }

  /* ---------- selectors: basics ---------- */

  function sVisibleIds(ctx) { return visibleSet(ctx); }
  function sEntityVisible(ctx, id) { return visible(ctx, id); }
  function sCan(ctx, actionId, extra) { return can(ctx, actionId, extra); }

  function sProfile(ctx) {
    var p = ctx.permissions.profile(ctx.state);
    var options = [];
    ctx.pack.profiles.forEach(function (pr) { options.push({ id: pr.id, label: pr.label, accessRole: pr.accessRole, selected: !!p && pr.id === p.id }); });
    return {
      id: p ? p.id : null,
      label: p ? p.label : null,
      accessRole: p ? p.accessRole : null,
      roleLabel: p ? ((security(ctx).roleLabels || {})[p.accessRole] || p.accessRole) : null,
      positionId: p ? p.positionId || null : null,
      position: p && p.positionId ? refById(ctx, p.positionId) : null,
      personId: p ? p.personId || null : null,
      person: p && p.personId ? refById(ctx, p.personId) : null,
      areaId: p ? p.areaId || null : null,
      area: p && p.areaId ? refById(ctx, p.areaId) : null,
      grants: p ? p.grants || {} : {},
      visibility: p ? p.visibility || {} : {},
      description: p ? p.description || null : null,
      isAdmin: role(ctx) === 'admin',
      isOwner: ctx.permissions.isOwner(ctx.state),
      options: options,
      selectorLabel: ui(ctx, 'profileSelector'),
      analystLabel: ui(ctx, 'useAnalystProfile'),
      matrix: ctx.permissions.matrixFor(ctx.state)
    };
  }

  function contextTitle(ctx) {
    var w = web(ctx);
    var org = (ctx.graph.ofType('organization') || [])[0];
    if (w.module === 'security') return ui(ctx, 'usersAndAccess');
    if (w.level === 'operational' && w.processId) {
      if (w.activityKey) {
        var v = getVersion(ctx, w.versionId);
        var act = resolvedActivity(ctx, v, w.activityKey);
        if (act) return act.name;
        var node = ctx.graph.flowNode(ctx.graph.flowForVersion(v, demoVersions(ctx)), w.activityKey);
        if (node) return node.label;
      }
      var p = ctx.graph.entity(w.processId);
      return p ? p.name : ui(ctx, 'selectProcess');
    }
    if (w.level === 'operational') return ui(ctx, 'selectProcess');
    if (w.level === 'tactical') { var a = ctx.graph.entity(w.areaId); return a ? a.name : ui(ctx, 'selectArea'); }
    return org ? org.name : ctx.pack.client.name;
  }

  function sCurrentContext(ctx) {
    var w = web(ctx);
    var version = getVersion(ctx, w.versionId);
    var processEntity = w.processId ? ctx.graph.entity(w.processId) : null;
    var areaEntity = w.areaId ? ctx.graph.entity(w.areaId) : null;
    var activity = w.activityKey && version ? resolvedActivity(ctx, version, w.activityKey) : null;
    var flow = version ? ctx.graph.flowForVersion(version, demoVersions(ctx)) : null;
    var node = w.activityKey && !activity ? ctx.graph.flowNode(flow, w.activityKey) : null;
    var levels = views(ctx).levels || ['strategic', 'tactical', 'operational'];
    var reps = views(ctx).representations || ['orgchart', 'processmap', 'relations'];
    var depths = views(ctx).depths || ['areas', 'positions', 'people'];
    var pviews = views(ctx).processViews || ['sheet', 'flow', 'compare', 'incidents', 'projects'];
    var processDetailed = !!(processEntity && processEntity.attributes && processEntity.attributes.detailed);
    var trackingOk = can(ctx, 'viewTracking', { processId: w.processId }).ok;
    var cameraKey = null;
    if (w.module !== 'security') {
      if (w.level === 'strategic') cameraKey = w.representation === 'relations' ? 'relations:' + (w.relationsRootId || '') : (w.representation === 'processmap' ? 'processmap' : 'orgchart');
      else if (w.level === 'tactical') cameraKey = w.areaId ? 'area:' + w.areaId : null;
      else if (w.level === 'operational' && w.processView === 'flow' && w.versionId) cameraKey = 'flow:' + w.versionId + ':' + (w.paymentVariant || '');
    }
    return {
      module: w.module || 'twin',
      level: w.level, levelLabel: ui(ctx, LEVEL_UI[w.level] || 'level'),
      levels: levels.map(function (l) { return { id: l, label: ui(ctx, LEVEL_UI[l] || l), selected: l === w.level, testid: 'web-level-' + l }; }),
      representation: w.representation, representationLabel: ui(ctx, REP_UI[w.representation] || 'representation'),
      representations: reps.map(function (r) { return { id: r, label: ui(ctx, REP_UI[r] || r), selected: r === w.representation, testid: 'web-rep-' + r }; }),
      depth: w.depth,
      depths: depths.map(function (d) { return { id: d, label: ui(ctx, DEPTH_UI[d] || d), selected: d === w.depth, testid: 'web-depth-' + d }; }),
      areaId: w.areaId || null, area: entityRef(ctx, areaEntity),
      areas: ctx.graph.areas().filter(function (a) { return visible(ctx, a.id); }).map(function (a) { return { id: a.id, label: a.name, selected: a.id === w.areaId }; }),
      processId: w.processId || null, process: entityRef(ctx, processEntity), processDetailed: processDetailed,
      processes: ctx.graph.ofType('process').filter(function (p) { return visible(ctx, p.id); }).map(function (p) { return { id: p.id, label: p.name, detailed: !!(p.attributes && p.attributes.detailed), selected: p.id === w.processId }; }),
      processView: w.processView,
      processViews: pviews.map(function (v) {
        var enabled = !!w.processId && (v === 'sheet' || (processDetailed && (v === 'flow' || v === 'compare')) || ((v === 'incidents' || v === 'projects') && processDetailed && trackingOk));
        var reason = null;
        if (w.processId && !enabled) reason = (v === 'incidents' || v === 'projects') && !trackingOk ? can(ctx, 'viewTracking', { processId: w.processId }).text : (processEntity && processEntity.attributes && processEntity.attributes.openFlowUnavailable) || msgText(ctx, 'MSG-11');
        return { id: v, label: ui(ctx, VIEW_UI[v] || v), selected: v === w.processView, enabled: enabled, reason: reason, testid: 'process-view-' + v };
      }),
      versionId: w.versionId || null, version: versionRef(ctx, version),
      versions: processEntity ? visibleVersions(ctx, processEntity.id).map(function (v) { return Object.assign(versionRef(ctx, v), { selected: v.id === w.versionId }); }) : [],
      compareVersionId: w.compareVersionId || null,
      paymentVariant: w.paymentVariant || null,
      activityKey: w.activityKey || null,
      activity: activity ? Object.assign(entityRef(ctx, activity), { key: ctx.graph.activityKey(activity), versionId: version.id }) : null,
      flowNode: node ? { id: node.id, kind: node.kind, label: node.label || null, typeLabel: packCore.typeLabel(node.kind) } : null,
      selection: w.selection || null,
      inspectorOpen: !!w.selection,
      inspectorHistoryLength: asArray(w.inspectorHistory).length,
      relationsRootId: w.relationsRootId || null,
      highlightRootId: w.highlightRootId || null,
      overlay: w.overlay || null,
      notice: w.notice || null,
      newVersionNotice: w.newVersionNotice ? { versionId: w.newVersionNotice.versionId, text: ui(ctx, 'newVersionNotice'), action: ui(ctx, 'viewNewVersion'), command: { type: 'setVersion', payload: { versionId: w.newVersionNotice.versionId } } } : null,
      listMode: !!w.listMode,
      layers: (views(ctx).layers || []).map(function (l) { return { id: l.id, label: l.label, on: !(w.layers && w.layers[l.id] === false), testid: 'layer-' + l.id }; }),
      areaFilter: w.areaFilter || null,
      search: w.search || { query: '', types: [], includeVersions: false, open: false },
      title: contextTitle(ctx),
      organizationName: ((ctx.graph.ofType('organization') || [])[0] || {}).name || ctx.pack.client.name,
      cameraKey: cameraKey,
      camera: cameraKey && ctx.state.camera ? ctx.state.camera[cameraKey] || null : null,
      canBack: asArray(w.contextHistory).length > 0,
      canBackToOrganization: !(w.level === 'strategic' && w.representation === (views(ctx).defaultContext || {}).representation && !w.areaId && !w.processId && w.module !== 'security'),
      readOnly: !!(version && version.type === 'AS-IS' && version.id !== currentAsIsId(ctx)),
      readOnlyLabel: ui(ctx, 'historicalReadOnly'),
      securityAllowed: can(ctx, 'viewSecurity').ok,
      securityLabel: ui(ctx, 'usersAndAccess'),
      securityView: (w.security || {}).view || 'accounts',
      welcome: msgText(ctx, 'MSG-01'),
      explainer: version ? (version.type === 'AS-IS' ? ui(ctx, 'asIsExplainer') : ui(ctx, 'toBeExplainer')) : null
    };
  }

  function sBreadcrumbs(ctx) {
    var w = web(ctx);
    var org = (ctx.graph.ofType('organization') || [])[0];
    var crumbs = [];
    var dc = views(ctx).defaultContext || {};
    crumbs.push({ id: org ? org.id : 'ORG', label: org ? org.name : ctx.pack.client.name, target: { tab: 'web', web: { module: 'twin', level: 'strategic', representation: dc.representation || 'orgchart' } } });
    if (w.module === 'security') {
      crumbs.push({ id: 'security', label: ui(ctx, 'usersAndAccess'), target: null });
    } else if (w.level === 'tactical' || w.level === 'operational') {
      var areaId = w.areaId || (w.processId ? (ctx.graph.processArea(w.processId) || {}).id : null);
      var area = areaId ? ctx.graph.entity(areaId) : null;
      if (area && visible(ctx, area.id)) crumbs.push({ id: area.id, label: area.name, target: { tab: 'web', web: { module: 'twin', level: 'tactical', areaId: area.id } } });
      if (w.level === 'operational' && w.processId) {
        var process = ctx.graph.entity(w.processId);
        if (process) crumbs.push({ id: process.id, label: process.name, target: { tab: 'web', web: { module: 'twin', level: 'operational', processId: process.id, processView: w.activityKey ? 'flow' : (w.processView || 'sheet'), versionId: w.versionId || undefined } } });
        if (w.activityKey) {
          var version = getVersion(ctx, w.versionId);
          var act = resolvedActivity(ctx, version, w.activityKey);
          var node = act ? null : ctx.graph.flowNode(ctx.graph.flowForVersion(version, demoVersions(ctx)), w.activityKey);
          var label = act ? (ctx.graph.activityKey(act) + ' · ' + act.name) : (node ? (node.id + ' · ' + (node.label || node.kind)) : w.activityKey);
          crumbs.push({ id: w.activityKey, label: label, target: null });
        }
      } else if (w.level === 'operational') {
        crumbs.push({ id: 'process-select', label: ui(ctx, 'selectProcess'), target: null });
      }
    }
    crumbs[crumbs.length - 1].target = null;
    return crumbs.map(function (c, i) { return Object.assign(c, { testid: 'breadcrumb-' + i, current: i === crumbs.length - 1 }); });
  }

  /* ---------- inspector ---------- */

  function relatedGroups(ctx, entity, version) {
    var conn = ctx.graph.connections(entity.id, { version: version || null, currentAsIsVersionId: currentAsIsId(ctx), demoVersions: demoVersions(ctx), versions: entity.type === 'process' ? visibleVersions(ctx, entity.id) : undefined });
    var hiddenLayers = new Set();
    var groups = [];
    conn.groups.forEach(function (g) {
      var items = [];
      g.items.forEach(function (it) {
        if (it.kind === 'version') {
          if (!canSee(ctx, it.version.id)) return;
          items.push({ id: it.id, kind: 'version', entity: null, version: versionRef(ctx, it.version), relationLabel: it.relationLabel, inferred: false, derived: false, versionId: it.version.id, note: null, badge: null,
            command: { type: 'setVersion', payload: { versionId: it.version.id } }, testid: 'inspector-link-' + it.id });
          return;
        }
        if (!visible(ctx, it.entity.id)) return;
        if (it.versionId && !canSee(ctx, it.versionId)) return;
        if (!layerOn(ctx, it.entity.type)) { hiddenLayers.add(packCore.layerOfType(it.entity.type)); return; }
        var payload = { entityId: it.entity.id, followLink: true };
        if (it.versionId && it.entity.type === 'activity') payload.versionId = it.versionId;
        items.push({ id: it.entity.id, kind: 'entity', entity: entityRef(ctx, it.entity), version: null, relationLabel: it.relationLabel, inferred: !!it.inferred, derived: !!it.derived, versionId: it.versionId || null, note: it.note || null,
          badge: it.inferred ? ui(ctx, 'proposedRelation') : null, command: { type: 'selectEntity', payload: payload }, testid: 'inspector-link-' + it.entity.id });
      });
      if (items.length) groups.push({ id: g.id, type: g.type, label: g.type === 'activity' && (entity.type === 'person' || entity.type === 'externalProvider' || entity.type === 'role') ? ui(ctx, 'relatedWork') : g.label, items: items, entities: items.map(function (i) { return i.entity || i.version; }) });
    });
    var hidden = Array.from(hiddenLayers).filter(Boolean);
    return {
      groups: groups,
      entityIds: conn.entityIds,
      relationIds: conn.relationIds,
      hiddenRelatedNotice: hidden.length ? { text: ui(ctx, 'hiddenLayer'), layers: hidden, actions: hidden.map(function (layerId) { var l = (views(ctx).layers || []).filter(function (x) { return x.id === layerId; })[0]; return { label: ui(ctx, 'showLayer') + (l ? ' · ' + l.label : ''), layerId: layerId, command: { type: 'toggleLayer', payload: { layerId: layerId, on: true } } }; }) } : null,
      empty: groups.length ? null : msgText(ctx, 'MSG-10')
    };
  }

  function commonActions(ctx, entity, version) {
    var list = [];
    var vid = version ? version.id : undefined;
    list.push(action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: entity.id, versionId: vid } }));
    list.push(action('sources', ui(ctx, 'viewSources'), { type: 'openOverlay', payload: { kind: 'sources', entityId: entity.id, versionId: vid } }));
    list.push(action('connections', ui(ctx, 'viewConnections'), { type: 'setRelationsRoot', payload: { entityId: entity.id } }));
    return list;
  }

  function highlightAction(ctx, entity, labelKey) {
    var w = web(ctx);
    if (w.highlightRootId === entity.id) return action('clear-relations', ui(ctx, 'clearRelationFocus'), { type: 'setHighlightRoot', payload: { entityId: null } });
    var onMap = w.module !== 'security' && w.level === 'strategic' && (w.representation === 'processmap' || (entity.type === 'area' && w.representation === 'orgchart'));
    var command = onMap ? { type: 'setHighlightRoot', payload: { entityId: entity.id } } : navTarget({ module: 'twin', level: 'strategic', representation: 'processmap', highlightRootId: entity.id });
    return action(entity.type === 'area' ? 'focus-area' : 'show-relations', ui(ctx, labelKey), command);
  }

  function processActions(ctx, process, versionId) {
    var detailed = !!(process.attributes && process.attributes.detailed);
    var a = process.attributes || {};
    var flowReason = a.openFlowUnavailable || msgText(ctx, 'MSG-11');
    var trackCheck = can(ctx, 'viewTracking', { processId: process.id });
    var w = web(ctx);
    var vid = versionId || (w.processId === process.id ? w.versionId : undefined) || undefined;
    var list = [];
    if (!(w.level === 'operational' && w.processId === process.id && w.processView === 'sheet')) list.push(action('view-sheet', ui(ctx, 'viewSheet'), { type: 'enterProcess', payload: { processId: process.id, view: 'sheet', versionId: vid } }));
    list.push(action('open-flow', ui(ctx, 'openFlow'), { type: 'enterProcess', payload: { processId: process.id, view: 'flow', versionId: vid } }, detailed, flowReason));
    list.push(action('compare', ui(ctx, 'compareVersions'), { type: 'enterProcess', payload: { processId: process.id, view: 'compare' } }, detailed, flowReason));
    list.push(action('incidents', ui(ctx, 'viewIncidents'), { type: 'enterProcess', payload: { processId: process.id, view: 'incidents' } }, detailed && trackCheck.ok, detailed ? trackCheck.text : flowReason));
    list.push(action('projects', ui(ctx, 'viewProjects'), { type: 'enterProcess', payload: { processId: process.id, view: 'projects' } }, detailed && trackCheck.ok, detailed ? trackCheck.text : flowReason));
    return list;
  }

  function processCharacterization(ctx, process, version) {
    var a = process.attributes || {};
    var owner = ctx.graph.processArea(process.id);
    var participants = ctx.graph.processParticipants(process.id);
    var objective = ctx.graph.processObjectives(process.id)[0];
    var indicator = objective ? ctx.graph.objectiveIndicators(objective.id)[0] : null;
    var sections = [];
    sections.push({ id: 'ownership', title: ui(ctx, 'owner'), kind: 'facts', facts: [
      fact(ui(ctx, 'owner'), owner ? owner.name : (a.ownerLabel || missing(ctx)), { entity: owner && visible(ctx, owner.id) ? entityRef(ctx, owner) : null }),
      fact(ui(ctx, 'participants'), a.participantsText || (participants.length ? participants.map(function (p) { return p.name; }).join(', ') : missing(ctx)), { entities: refs(ctx, participants, true) })
    ] });
    if (a.detailed) {
      sections.push({ id: 'characterization', title: ui(ctx, 'summary'), kind: 'facts', facts: [
        fact(ui(ctx, 'start'), nullable(ctx, a.start)),
        fact(ui(ctx, 'end'), nullable(ctx, a.end)),
        fact(ui(ctx, 'variants'), asArray(a.variants).length ? asArray(a.variants).map(function (v) { return v.label; }).join(' · ') : missing(ctx), { items: asArray(a.variants).map(function (v) { return { id: v.id, label: v.label, note: v.note || null }; }) }),
        fact(ui(ctx, 'time'), nullable(ctx, a.timeText))
      ], note: a.note || null });
    } else {
      sections.push({ id: 'characterization', title: ui(ctx, 'summary'), kind: 'text', text: a.sheetText || missing(ctx), extra: a.extraText || null });
    }
    if (objective && visible(ctx, objective.id)) {
      sections.push({ id: 'objective', title: ui(ctx, 'objective'), kind: 'objective',
        objective: { entity: entityRef(ctx, objective), badge: { label: (objective.attributes && objective.attributes.label) || ui(ctx, 'labelProposed'), tone: 'proposed' }, description: objective.description || null, command: { type: 'selectEntity', payload: { entityId: objective.id, followLink: true } } },
        indicator: indicator && visible(ctx, indicator.id) ? indicatorFacts(ctx, indicator) : null });
    }
    return sections;
  }

  function indicatorFacts(ctx, indicator) {
    var a = indicator.attributes || {};
    return {
      entity: entityRef(ctx, indicator),
      badge: { label: a.label || ui(ctx, 'labelProposed'), tone: 'proposed' },
      formula: a.formula || missing(ctx),
      value: a.value === null || a.value === undefined ? null : a.value,
      valueText: a.value === null || a.value === undefined ? (a.noMeasurement || msgText(ctx, 'MSG-17')) : String(a.value),
      noMeasurement: a.value === null || a.value === undefined ? (a.noMeasurement || msgText(ctx, 'MSG-17')) : null,
      target: a.target === null || a.target === undefined ? null : a.target,
      targetText: a.target === null || a.target === undefined ? (a.targetLabel || 'Meta por definir') : String(a.target),
      measuredAt: a.measuredAt || null,
      measuredAtText: a.measuredAt ? ctx.format.date(a.measuredAt) : missing(ctx),
      numerator: a.numerator === undefined ? null : a.numerator,
      denominator: a.denominator === undefined ? null : a.denominator,
      facts: [fact(ui(ctx, 'formula'), a.formula || missing(ctx)), fact(ui(ctx, 'value'), a.value === null || a.value === undefined ? (a.noMeasurement || msgText(ctx, 'MSG-17')) : String(a.value)), fact(ui(ctx, 'target'), a.target === null || a.target === undefined ? (a.targetLabel || 'Meta por definir') : String(a.target)), fact(ui(ctx, 'measuredAt'), a.measuredAt ? ctx.format.date(a.measuredAt) : missing(ctx))],
      command: { type: 'selectEntity', payload: { entityId: indicator.id, followLink: true } }
    };
  }

  function activityFacts(ctx, activity, version, variant) {
    var attrs = activity.attributes || {};
    var res = ctx.graph.activityResources(activity);
    var variantNote = variant && attrs.variantNotes ? attrs.variantNotes[variant] || null : null;
    var facts = [];
    if (version) facts.push(fact(ui(ctx, 'version'), version.label || version.id, { versionId: version.id }));
    facts.push(fact(ui(ctx, 'executor'), res.roles.length ? res.roles.map(function (r) { return r.name; }).join(' · ') : missing(ctx), { entities: refs(ctx, res.roles, true) }));
    facts.push(fact(ui(ctx, 'whatToDo'), nullable(ctx, ctx.graph.attr(activity, 'whatToDo') || ctx.graph.attr(activity, 'instruction'))));
    facts.push(fact(ui(ctx, 'control'), nullable(ctx, ctx.graph.attr(activity, 'control'))));
    facts.push(fact(ui(ctx, 'output'), nullable(ctx, ctx.graph.attr(activity, 'output'))));
    facts.push(fact(ui(ctx, 'time'), nullable(ctx, ctx.graph.attr(activity, 'time'))));
    if (variantNote) facts.push(fact(ui(ctx, 'variantNote'), variantNote));
    return facts;
  }

  function flowNodeInspector(ctx, sel) {
    var version = getVersion(ctx, sel.versionId);
    if (!version || !canSee(ctx, version.id)) return null;
    var flow = ctx.graph.flowForVersion(version, demoVersions(ctx));
    var node = ctx.graph.flowNode(flow, sel.entityId);
    if (!node) return null;
    var kind = node.kind === 'start' || node.kind === 'end' ? node.kind : node.kind;
    var outcomes = asArray(flow.edges).filter(function (e) { return e.from === node.id; }).map(function (e) {
      var target = ctx.graph.flowNode(flow, e.to);
      var act = target && target.kind === 'task' ? resolvedActivity(ctx, version, target.id) : null;
      return { edgeId: e.id, label: e.label || null, loop: !!e.loop, inferred: !!e.inferred, targetNodeId: e.to, targetLabel: act ? act.name : (target ? target.label || target.id : e.to), targetKind: target ? target.kind : null };
    });
    var facts = [];
    if (node.kind === 'decision') { facts.push(fact(ui(ctx, 'decisionCondition'), node.label)); facts.push(fact(ui(ctx, 'decisionOutcomes'), outcomes.map(function (o) { return (o.label || '·') + ' → ' + o.targetLabel; }).join(' · '), { outcomes: outcomes })); }
    else facts.push(fact(ui(ctx, 'description'), node.label));
    facts.push(fact(ui(ctx, 'relatedFlow'), flow.title + ' · ' + (version.label || version.id), { versionId: version.id }));
    var sourceIds = asArray(version.sourceIds);
    return {
      selection: sel,
      kind: 'flowNode',
      header: { type: kind, typeLabel: packCore.typeLabel(kind), icon: packCore.typeIcon(kind), name: node.label || node.id, id: node.id, badges: [{ label: ui(ctx, 'labelSynthesis'), tone: 'brand' }] },
      description: node.label || null,
      facts: facts,
      sections: [],
      related: { groups: [], entityIds: [], relationIds: [], hiddenRelatedNotice: null, empty: msgText(ctx, 'MSG-10') },
      provenance: { labels: [], confidence: 'inferred', confidenceLabel: confidenceLabel(ctx, 'inferred'), dataState: version.type === 'TO-BE' ? 'proposed' : 'known', observedAt: null, observedAtText: missing(ctx), isDemo: !!version.isDemo, sourceIds: sourceIds, sources: ctx.graph.sourceRefs(sourceIds), sourceNodeIds: node.sourceNodeIds || null, label: ui(ctx, 'sources') },
      actions: [
        action('instruction', ui(ctx, 'viewInstruction'), { type: 'openInstruction', payload: { versionId: version.id, key: node.id } }),
        action('sources', ui(ctx, 'viewSources'), { type: 'openOverlay', payload: { kind: 'sources', entityId: node.id, versionId: version.id } })
      ],
      version: versionRef(ctx, version),
      node: { id: node.id, kind: node.kind, label: node.label || null, laneId: node.laneId, outcomes: outcomes, sourceNodeIds: node.sourceNodeIds || null },
      canBack: asArray(web(ctx).inspectorHistory).length > 0,
      backLabel: ui(ctx, 'inspectorBack'),
      closeLabel: ui(ctx, 'closeInspector')
    };
  }

  function sInspectorModel(ctx) {
    var w = web(ctx);
    var sel = w.selection;
    if (!sel || !sel.entityId) return null;
    var entity = ctx.graph.entity(sel.entityId);
    if (!entity) return flowNodeInspector(ctx, sel);
    if (!visible(ctx, entity.id)) return { selection: sel, restricted: true, notice: can(ctx, 'viewEntity', { entityId: entity.id }) };
    var a = entity.attributes || {};
    var version = null;
    if (entity.type === 'activity') version = versionForActivity(ctx, entity, sel.versionId);
    else if (entity.type === 'process' && w.processId === entity.id && w.versionId && canSee(ctx, w.versionId)) version = getVersion(ctx, w.versionId);
    else if (w.versionId && canSee(ctx, w.versionId)) version = getVersion(ctx, w.versionId);
    var activity = entity.type === 'activity' && version ? (resolvedActivity(ctx, version, ctx.graph.activityKey(entity)) || entity) : entity;
    var related = relatedGroups(ctx, entity, version);
    var facts = [];
    var sections = [];
    var actions = [];
    var description = entity.description || null;
    var counts;
    switch (entity.type) {
      case 'organization':
        facts.push(fact(ui(ctx, 'mission'), a.mission || a.missingLabel || missing(ctx)));
        facts.push(fact(ui(ctx, 'vision'), a.vision || a.missingLabel || missing(ctx)));
        counts = ctx.graph.counts(visibleSet(ctx));
        facts.push(fact(ui(ctx, 'areas'), uiFmt(ctx, 'countAreas', { n: counts.areas })));
        if (a.note) facts.push(fact(ui(ctx, 'notes'), a.note));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'area':
        counts = ctx.graph.counts(new Set(ctx.graph.areaTraversal(entity.id).entityIds.filter(function (id) { return visible(ctx, id); })));
        facts.push(fact(ui(ctx, 'positions'), uiFmt(ctx, 'countPositions', { n: counts.positions })));
        facts.push(fact(ui(ctx, 'people'), uiFmt(ctx, 'countPeople', { n: counts.people })));
        if (counts.externals) facts.push(fact(ui(ctx, 'countExternals'), uiFmt(ctx, 'countExternals', { n: counts.externals })));
        if (a.supportLabel) facts.push(fact(ui(ctx, 'status'), a.supportLabel));
        var ap = ctx.graph.areaProcesses(entity.id);
        var known = ap.owned.concat(ap.participating).filter(function (p) { return visible(ctx, p.id); });
        sections.push({ id: 'processes', title: ui(ctx, 'processes'), kind: 'processes', owned: refs(ctx, ap.owned, true), participating: refs(ctx, ap.participating, true), noDetail: known.length ? null : (views(ctx).areaSpace || {}).noDetail || msgText(ctx, 'MSG-11') });
        actions.push(highlightAction(ctx, entity, 'focusArea'));
        actions.push(action('open-area', ui(ctx, 'openAreaSpace'), { type: 'enterArea', payload: { areaId: entity.id } }));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'position':
        var pArea = ctx.graph.positionArea(entity.id);
        facts.push(fact(ui(ctx, 'area'), pArea ? pArea.name : missing(ctx), { entity: pArea && visible(ctx, pArea.id) ? entityRef(ctx, pArea) : null }));
        if (a.occupancyNote) facts.push(fact(ui(ctx, 'occupants'), a.occupancyNote));
        if (a.collective) facts.push(fact(ui(ctx, 'notes'), ui(ctx, 'collectivePosition')));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'person':
      case 'externalProvider':
        var pos = ctx.graph.personPosition(entity.id);
        var posArea = pos ? ctx.graph.positionArea(pos.id) : null;
        facts.push(fact(ui(ctx, 'position'), pos ? pos.name : missing(ctx), { entity: pos && visible(ctx, pos.id) ? entityRef(ctx, pos) : null }));
        facts.push(fact(ui(ctx, 'area'), posArea ? posArea.name : missing(ctx), { entity: posArea && visible(ctx, posArea.id) ? entityRef(ctx, posArea) : null }));
        if (a.occupancyNote) facts.push(fact(ui(ctx, 'occupants'), a.occupancyNote));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'role':
        if (a.laneLabel) facts.push(fact(ui(ctx, 'laneLabel'), a.laneLabel));
        if (a.mappingNote) facts.push(fact(ui(ctx, 'positions'), a.mappingNote, { badge: ui(ctx, 'labelRelationToValidate') }));
        if (a.positionLabelNote) facts.push(fact(ui(ctx, 'notes'), a.positionLabelNote));
        actions = actions.concat(commonActions(ctx, entity, version && version.processId ? version : null));
        break;
      case 'macroprocess':
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'process':
        if (!a.detailed) description = a.sheetText || description;
        sections = processCharacterization(ctx, entity, version);
        actions = processActions(ctx, entity, version && version.processId === entity.id ? version.id : undefined).concat(commonActions(ctx, entity, version && version.processId === entity.id ? version : null));
        break;
      case 'activity':
        description = ctx.graph.attr(activity, 'instruction') || description;
        facts = activityFacts(ctx, activity, version, w.paymentVariant);
        if (version) {
          actions.push(action('instruction', ui(ctx, 'viewInstruction'), { type: 'openInstruction', payload: { versionId: version.id, key: ctx.graph.activityKey(activity) } }));
          actions.push(action('open-flow', ui(ctx, 'openFlow'), navTarget({ module: 'twin', level: 'operational', processId: version.processId, processView: 'flow', versionId: version.id, selectEntityId: ctx.graph.activityKey(activity) })));
        }
        actions = actions.concat(commonActions(ctx, entity, version));
        break;
      case 'system':
        facts.push(fact(ui(ctx, 'status'), a.statusLabel || missing(ctx), { status: a.status || null }));
        if (a.note) facts.push(fact(ui(ctx, 'notes'), a.note));
        description = a.visibleText || description;
        actions = actions.concat(commonActions(ctx, entity, version));
        break;
      case 'document':
        description = a.text || description;
        facts.push(fact(ui(ctx, 'content'), a.hasFile ? null : (a.fileMessage || msgText(ctx, 'MSG-18'))));
        actions.push(action('view-content', ui(ctx, 'viewAvailableContent'), { type: 'openOverlay', payload: { kind: a.contentRef && ctx.graph.type(a.contentRef) === 'policy' ? 'policy' : 'document', entityId: a.contentRef || entity.id } }));
        if (a.links && a.links.flow) actions.push(action('open-flow', ui(ctx, 'openFlow'), navTarget({ module: 'twin', level: 'operational', processId: ctx.pack.defaultProcessId, processView: 'flow' })));
        if (a.links && a.links.compare) actions.push(action('compare', ui(ctx, 'compareVersions'), navTarget({ module: 'twin', level: 'operational', processId: ctx.pack.defaultProcessId, processView: 'compare' })));
        actions = actions.concat(commonActions(ctx, entity, version));
        break;
      case 'policy':
        facts.push(fact(ui(ctx, 'date'), a.dateLabel || (a.date ? ctx.format.date(a.date) : missing(ctx)), { date: a.date || null }));
        facts.push(fact(ui(ctx, 'signature'), a.signature || missing(ctx), { note: a.signatureNote || null }));
        facts.push(fact(ui(ctx, 'commitments'), uiFmt(ctx, 'countItems', { n: asArray(a.commitments).length })));
        facts.push(fact(ui(ctx, 'content'), a.hasFile ? null : (a.fileMessage || msgText(ctx, 'MSG-18'))));
        actions.push(action('view-content', ui(ctx, 'viewAvailableContent'), { type: 'openOverlay', payload: { kind: 'policy', entityId: entity.id } }));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'objective':
        var kpi = ctx.graph.objectiveIndicators(entity.id)[0];
        if (a.target !== undefined) facts.push(fact(ui(ctx, 'target'), a.target === null ? missing(ctx) : String(a.target)));
        if (kpi && visible(ctx, kpi.id)) sections.push({ id: 'indicator', title: ui(ctx, 'indicator'), kind: 'indicator', indicator: indicatorFacts(ctx, kpi) });
        actions.push(highlightAction(ctx, entity, 'showRelationsOfObjective'));
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'indicator':
        var kf = indicatorFacts(ctx, entity);
        facts = kf.facts;
        sections.push({ id: 'measurement', title: ui(ctx, 'indicator'), kind: 'indicator', indicator: kf });
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      case 'gap':
        if (a.noteText) facts.push(fact(ui(ctx, 'notes'), a.noteText));
        ['severity', 'cost', 'frequency'].forEach(function (k) { facts.push(fact(ui(ctx, k), nullable(ctx, a[k]))); });
        actions = actions.concat(commonActions(ctx, entity, null));
        break;
      default:
        actions = actions.concat(commonActions(ctx, entity, version));
    }
    var provenance = provenanceOf(ctx, entity, version && entity.type === 'activity' ? version.sourceIds : null);
    if (entity.type === 'activity') provenance.sourceNodeIds = a.sourceNodeIds || null;
    return {
      selection: sel,
      kind: 'entity',
      header: { type: entity.type, typeLabel: packCore.typeLabel(entity.type), icon: packCore.typeIcon(entity.type), name: entity.name, id: entity.id, badges: badges(ctx, entity), proposed: !!(a.proposed) },
      description: description,
      facts: facts,
      sections: sections,
      related: related,
      provenance: provenance,
      actions: actions,
      version: version ? versionRef(ctx, version) : null,
      entity: entityRef(ctx, entity),
      canBack: asArray(w.inspectorHistory).length > 0,
      backLabel: ui(ctx, 'inspectorBack'),
      closeLabel: ui(ctx, 'closeInspector'),
      historyCount: asArray(w.inspectorHistory).length
    };
  }

  /* ---------- org chart ---------- */

  function sOrgChartModel(ctx) {
    var w = web(ctx);
    var org = (ctx.graph.ofType('organization') || [])[0] || null;
    var expanded = w.expanded || {};
    var depth = w.depth || 'positions';
    var vis = visibleSet(ctx);
    var oc = views(ctx).orgchart || {};
    var gg = org ? ctx.graph.relationsTo(org.id, 'gerenciaGeneral')[0] : null;
    var rootPosition = gg ? ctx.graph.entity(gg.from) : (org ? ctx.graph.areaPositions(org.id)[0] : null);
    if (rootPosition && !visible(ctx, rootPosition.id)) rootPosition = null;
    var highlight = highlightModel(ctx);
    function positionNode(position) {
      var occupants = ctx.graph.positionOccupants(position.id).filter(function (o) { return visible(ctx, o.id); });
      var showOccupants = depth === 'people' || !!expanded[position.id];
      var pa = position.attributes || {};
      return {
        position: entityRef(ctx, position), id: position.id, name: position.name,
        external: !!pa.external, externalLabel: pa.external ? oc.externalLabel || 'Servicio externo' : null,
        collective: !!pa.collective, occupancyNote: pa.occupancyNote || null,
        expanded: showOccupants, expandable: occupants.length > 0, showOccupants: showOccupants,
        occupants: occupants.map(function (o) { return entityRef(ctx, o); }),
        counts: { people: occupants.filter(function (o) { return o.type === 'person'; }).length, externals: occupants.filter(function (o) { return o.type !== 'person'; }).length },
        highlighted: highlight ? highlight.entityIds.indexOf(position.id) !== -1 : false,
        selected: !!(w.selection && w.selection.entityId === position.id),
        testid: 'node-' + position.id, expandTestid: 'expand-' + position.id
      };
    }
    var areas = ctx.graph.areas().filter(function (a) { return visible(ctx, a.id); }).map(function (area) {
      var positions = ctx.graph.areaPositions(area.id).filter(function (p) { return visible(ctx, p.id); });
      var showPositions = depth !== 'areas' || !!expanded[area.id];
      var at = ctx.graph.areaTraversal(area.id);
      var counts = ctx.graph.counts(new Set(at.entityIds.filter(function (id) { return !vis || vis.has(id); })));
      var ap = ctx.graph.areaProcesses(area.id);
      return {
        area: entityRef(ctx, area), id: area.id, name: area.name,
        supportLabel: (area.attributes && area.attributes.supportLabel) || null,
        expanded: showPositions, expandable: positions.length > 0, showPositions: showPositions,
        positions: showPositions ? positions.map(positionNode) : [],
        positionCount: positions.length,
        counts: { positions: counts.positions, externalPositions: counts.externalPositions, people: counts.people, externals: counts.externals,
          positionsText: uiFmt(ctx, 'countPositions', { n: counts.positions }), peopleText: uiFmt(ctx, 'countPeople', { n: counts.people }), externalsText: uiFmt(ctx, 'countExternals', { n: counts.externals }) },
        processes: { owned: refs(ctx, ap.owned, true), participating: refs(ctx, ap.participating, true) },
        highlighted: highlight ? highlight.entityIds.indexOf(area.id) !== -1 : false,
        neighbor: highlight && highlight.neighbors ? highlight.neighbors.indexOf(area.id) !== -1 : false,
        selected: !!(w.selection && w.selection.entityId === area.id),
        testid: 'node-' + area.id, expandTestid: 'expand-' + area.id
      };
    });
    var totals = ctx.graph.counts(vis);
    return {
      title: org ? org.name : ctx.pack.client.name,
      organization: entityRef(ctx, org),
      note: oc.note || null, legend: oc.legend || null, externalLabel: oc.externalLabel || null,
      depth: depth,
      depthOptions: (views(ctx).depths || ['areas', 'positions', 'people']).map(function (d) { return { id: d, label: ui(ctx, DEPTH_UI[d] || d), selected: d === depth, testid: 'web-depth-' + d }; }),
      root: org ? { organization: entityRef(ctx, org), position: rootPosition ? positionNode(rootPosition) : null, edgeLabel: gg ? gg.label || packCore.relationLabel('gerenciaGeneral', 'out') : null, selected: !!(w.selection && w.selection.entityId === org.id), testid: 'node-' + org.id } : null,
      areas: areas,
      edges: gg && rootPosition && org ? [{ id: gg.id, from: rootPosition.id, to: org.id, label: gg.label || null }] : [],
      counts: { areas: totals.areas, positions: totals.positions, externalPositions: totals.externalPositions, people: totals.people, externals: totals.externals,
        areasText: uiFmt(ctx, 'countAreas', { n: totals.areas }), positionsText: uiFmt(ctx, 'countPositions', { n: totals.positions }), peopleText: uiFmt(ctx, 'countPeople', { n: totals.people }), externalsText: uiFmt(ctx, 'countExternals', { n: totals.externals }) },
      highlight: highlight,
      selectedId: w.selection ? w.selection.entityId : null,
      expandedIds: Object.keys(expanded).filter(function (k) { return expanded[k]; }),
      listMode: !!w.listMode,
      cameraKey: 'orgchart',
      camera: ctx.state.camera ? ctx.state.camera.orgchart || null : null,
      actions: { expandAll: { label: ui(ctx, 'expandAll'), command: { type: 'expandAll', payload: {} } }, collapseAll: { label: ui(ctx, 'collapseAll'), command: { type: 'collapseAll', payload: {} } } }
    };
  }

  /* ---------- highlight sets ---------- */

  function highlightModel(ctx) {
    var w = web(ctx);
    var rootId = w.highlightRootId;
    if (!rootId || !visible(ctx, rootId)) return null;
    var root = ctx.graph.entity(rootId);
    if (!root) return null;
    var vis = visibleSet(ctx);
    var t;
    var neighbors = [];
    if (root.type === 'objective') t = ctx.graph.objectiveTraversal(rootId, { version: getVersion(ctx, currentAsIsId(ctx)), demoVersions: demoVersions(ctx) });
    else if (root.type === 'area') { t = ctx.graph.areaTraversal(rootId); neighbors = t.neighbors || []; }
    else t = ctx.graph.connections(rootId, { currentAsIsVersionId: currentAsIsId(ctx), demoVersions: demoVersions(ctx) });
    var entityIds = t.entityIds.filter(function (id) { return (!vis || vis.has(id)) && layerOn(ctx, ctx.graph.type(id)); });
    return {
      rootId: rootId,
      root: entityRef(ctx, root),
      label: uiFmt(ctx, 'relationsRoot', { name: root.name }),
      entityIds: entityIds,
      relationIds: t.relationIds.filter(function (rid) { var r = ctx.pack.relations.get(rid); return r && entityIds.indexOf(r.from) !== -1 && entityIds.indexOf(r.to) !== -1; }),
      neighbors: neighbors.filter(function (id) { return !vis || vis.has(id); }),
      clearAction: { label: ui(ctx, 'clearRelationFocus'), command: { type: 'setHighlightRoot', payload: { entityId: null } }, testid: 'inspector-action-clear-relations' }
    };
  }

  /* ---------- process map ---------- */

  function sProcessMapModel(ctx) {
    var w = web(ctx);
    var map = views(ctx).map || {};
    var vis = visibleSet(ctx);
    var highlight = highlightModel(ctx);
    var hl = highlight ? new Set(highlight.entityIds) : null;
    var mapIds = [];
    var bands = asArray(map.bands).map(function (band) {
      var entities = asArray(band.entityIds).map(function (id) { return ctx.graph.entity(id); }).filter(function (e) { return e && visible(ctx, e.id) && layerOn(ctx, e.type); });
      entities.forEach(function (e) { mapIds.push(e.id); });
      return {
        id: band.id, label: band.label, subtitle: band.subtitle || null, message: band.message || null,
        entities: entities.map(function (e) { return Object.assign(entityRef(ctx, e), { highlighted: hl ? hl.has(e.id) : false, dimmed: !!hl && !hl.has(e.id), selected: !!(w.selection && w.selection.entityId === e.id), isRoot: highlight ? highlight.rootId === e.id : false }); }),
        empty: entities.length === 0,
        hasData: band.entityIds !== undefined
      };
    });
    var lines = [];
    var seen = new Set();
    mapIds.forEach(function (id) {
      ctx.graph.relationsFrom(id).forEach(function (r) {
        if (mapIds.indexOf(r.to) === -1 || seen.has(r.id)) return;
        seen.add(r.id);
        lines.push({ id: r.id, from: r.from, to: r.to, type: r.type, label: packCore.relationLabel(r.type, 'out'), inferred: !!r.inferred, derived: false, highlighted: highlight ? highlight.relationIds.indexOf(r.id) !== -1 : false });
      });
    });
    var current = getVersion(ctx, currentAsIsId(ctx));
    ctx.graph.ofType('process').forEach(function (p) {
      if (mapIds.indexOf(p.id) === -1 || !(p.attributes && p.attributes.detailed) || !current || current.processId !== p.id) return;
      ctx.graph.processRoles(p.id, current, demoVersions(ctx)).forEach(function (r) {
        if (mapIds.indexOf(r.id) === -1) return;
        lines.push({ id: 'derived:' + p.id + ':' + r.id, from: p.id, to: r.id, type: 'ejecuta', label: packCore.relationLabel('ejecuta', 'in'), inferred: false, derived: true, versionId: current.id, highlighted: !!(hl && hl.has(p.id) && hl.has(r.id)) });
      });
      ctx.graph.processSystems(p.id, current, demoVersions(ctx)).forEach(function (s) {
        if (mapIds.indexOf(s.id) === -1) return;
        lines.push({ id: 'derived:' + p.id + ':' + s.id, from: p.id, to: s.id, type: 'usa', label: packCore.relationLabel('usa', 'out'), inferred: false, derived: true, versionId: current.id, highlighted: !!(hl && hl.has(p.id) && hl.has(s.id)) });
      });
    });
    var counts = ctx.graph.counts(vis);
    var full = ctx.graph.counts(null);
    var texts = map.counts || {};
    return {
      title: ((ctx.graph.ofType('organization') || [])[0] || {}).name || ctx.pack.client.name,
      bands: bands,
      capabilitiesNote: map.capabilitiesNote || null,
      counts: {
        detailed: counts.processesDetailed, summary: counts.processesSummary,
        detailedText: counts.processesDetailed === full.processesDetailed && texts.detailed ? texts.detailed : ctx.format.plural(counts.processesDetailed, 'proceso con detalle', 'procesos con detalle'),
        summaryText: counts.processesSummary === full.processesSummary && texts.summary ? texts.summary : ctx.format.plural(counts.processesSummary, 'proceso con resumen', 'procesos con resumen')
      },
      lines: lines,
      highlight: highlight,
      selectedId: w.selection ? w.selection.entityId : null,
      listMode: !!w.listMode,
      cameraKey: 'processmap',
      camera: ctx.state.camera ? ctx.state.camera.processmap || null : null,
      layers: (views(ctx).layers || []).map(function (l) { return { id: l.id, label: l.label, on: !(w.layers && w.layers[l.id] === false), testid: 'layer-' + l.id }; }),
      empty: mapIds.length === 0 ? ui(ctx, 'noData') : null
    };
  }

  /* ---------- relations view ---------- */

  function sRelationsModel(ctx) {
    var w = web(ctx);
    var rootId = w.relationsRootId;
    var root = rootId ? ctx.graph.entity(rootId) : null;
    var candidates = ['area', 'process', 'macroprocess', 'role', 'system', 'objective', 'position', 'document', 'policy'].reduce(function (acc, type) {
      return acc.concat(ctx.graph.ofType(type).filter(function (e) { return visible(ctx, e.id) && layerOn(ctx, e.type); }));
    }, []);
    var base = {
      rootId: root ? root.id : null,
      root: root && visible(ctx, root.id) ? entityRef(ctx, root) : null,
      prompt: root ? null : msgText(ctx, 'MSG-01'),
      candidates: candidates.map(function (e) { return entityRef(ctx, e); }),
      listMode: !!w.listMode,
      cameraKey: 'relations:' + (rootId || ''),
      camera: ctx.state.camera ? ctx.state.camera['relations:' + (rootId || '')] || null : null,
      areaFilter: w.areaFilter || null,
      areaFilterNotice: null,
      groups: [], entityIds: [], relationIds: [], lines: [], hiddenRelatedNotice: null, empty: null, rootLabel: null, selectedId: w.selection ? w.selection.entityId : null
    };
    if (!root || !visible(ctx, root.id)) return base;
    var version = w.versionId && canSee(ctx, w.versionId) ? getVersion(ctx, w.versionId) : getVersion(ctx, currentAsIsId(ctx));
    var related = relatedGroups(ctx, root, version);
    if (w.areaFilter && visible(ctx, w.areaFilter)) {
      var inside = new Set(ctx.graph.areaTraversal(w.areaFilter).entityIds);
      if (!inside.has(root.id)) base.areaFilterNotice = { text: ui(ctx, 'rootOutsideArea'), action: { label: ui(ctx, 'removeAreaFilter'), command: { type: 'setAreaFilter', payload: { areaId: null } } } };
    }
    base.rootLabel = uiFmt(ctx, 'relationsRoot', { name: root.name });
    base.groups = related.groups;
    base.entityIds = [root.id].concat(related.groups.reduce(function (acc, g) { return acc.concat(g.items.map(function (i) { return i.id; })); }, []));
    base.relationIds = related.relationIds;
    base.lines = related.groups.reduce(function (acc, g) {
      return acc.concat(g.items.map(function (i) { return { id: 'line:' + root.id + ':' + i.id + (i.versionId ? ':' + i.versionId : ''), from: root.id, to: i.id, label: i.relationLabel, inferred: i.inferred, derived: i.derived, kind: i.kind }; }));
    }, []);
    base.hiddenRelatedNotice = related.hiddenRelatedNotice;
    base.empty = related.groups.length ? null : msgText(ctx, 'MSG-10');
    base.clearAction = { label: ui(ctx, 'clearRelationFocus'), command: { type: 'clearRelationsRoot', payload: {} } };
    base.provenance = provenanceOf(ctx, root);
    return base;
  }

  /* ---------- area space (WEB-02) ---------- */

  function incidentNotice(ctx, inc) {
    var labels = tracking(ctx).noticeLabels || {};
    var businessDate = ctx.pack.demo.businessDate;
    var dueSoonUntil = ctx.pack.demo.dueSoonUntil;
    var id;
    if (inc.status === 'closed') id = 'closed';
    else if (!inc.dueDate) id = 'onTime';
    else if (inc.dueDate < businessDate) id = 'overdue';
    else if (inc.dueDate <= dueSoonUntil) id = 'dueSoon';
    else id = 'onTime';
    var tone = id === 'overdue' ? 'danger' : id === 'dueSoon' ? 'warning' : id === 'closed' ? 'neutral' : 'success';
    return { id: id, label: labels[id] || id, tone: tone, alert: id === 'overdue' || id === 'dueSoon' };
  }

  function trackingSummary(ctx, processIds) {
    var incidents = asArray(demo(ctx).incidents).filter(function (i) { return processIds.indexOf(i.processId) !== -1; });
    var projects = asArray(demo(ctx).projects).filter(function (p) { return processIds.indexOf(p.processId) !== -1; });
    var s = { incidents: { total: incidents.length, open: 0, overdue: 0, dueSoon: 0, closed: 0 }, projects: { total: projects.length, planned: 0, inProgress: 0, concluded: 0 } };
    incidents.forEach(function (i) { var n = incidentNotice(ctx, i); if (i.status === 'closed') s.incidents.closed++; else s.incidents.open++; if (n.id === 'overdue') s.incidents.overdue++; if (n.id === 'dueSoon') s.incidents.dueSoon++; });
    projects.forEach(function (p) { if (s.projects[p.status] !== undefined) s.projects[p.status]++; });
    return s;
  }

  function sAreaSpaceModel(ctx) {
    var w = web(ctx);
    var area = w.areaId ? ctx.graph.entity(w.areaId) : null;
    if (!area) return { area: null, title: ui(ctx, 'selectArea'), sections: [], areas: ctx.graph.areas().filter(function (a) { return visible(ctx, a.id); }).map(function (a) { return { id: a.id, label: a.name }; }), empty: ui(ctx, 'selectArea') };
    if (!visible(ctx, area.id)) return { area: entityRef(ctx, area), restricted: true, notice: can(ctx, 'viewEntity', { entityId: area.id }), sections: [] };
    var as = views(ctx).areaSpace || {};
    var titles = asArray(as.sections);
    var vis = visibleSet(ctx);
    var at = ctx.graph.areaTraversal(area.id);
    var counts = ctx.graph.counts(new Set(at.entityIds.filter(function (id) { return !vis || vis.has(id); })));
    var ap = ctx.graph.areaProcesses(area.id);
    var owned = ap.owned.filter(function (p) { return visible(ctx, p.id); });
    var participating = ap.participating.filter(function (p) { return visible(ctx, p.id); });
    var card = as.processCard || {};
    function processCard(process, roleKind) {
      var a = process.attributes || {};
      var owner = ctx.graph.processArea(process.id);
      var detailed = !!a.detailed;
      return {
        process: entityRef(ctx, process), id: process.id, name: process.name, role: roleKind,
        ownerText: roleKind === 'owned' ? (card.owner || (owner ? ui(ctx, 'owner') + ': ' + owner.name : null)) : (owner ? ui(ctx, 'owner') + ': ' + owner.name : null),
        statusText: detailed ? card.status || null : (a.sheetText || null),
        actions: [
          action('view-sheet', ui(ctx, 'viewSheet'), { type: 'enterProcess', payload: { processId: process.id, view: 'sheet' } }),
          action('open-flow', ui(ctx, 'openFlow'), { type: 'enterProcess', payload: { processId: process.id, view: 'flow' } }, detailed, a.openFlowUnavailable || msgText(ctx, 'MSG-11'))
        ],
        testid: 'node-' + process.id
      };
    }
    var cards = owned.map(function (p) { return processCard(p, 'owned'); }).concat(participating.map(function (p) { return processCard(p, 'participating'); }));
    var gaps = uniqueBy(owned.reduce(function (acc, p) { return acc.concat(ctx.graph.processGaps(p.id)); }, []).filter(function (g) { return visible(ctx, g.id); }), function (g) { return g.id; });
    var trackingOk = can(ctx, 'viewTracking', { processId: owned.length ? owned[0].id : ctx.pack.defaultProcessId }).ok;
    var sections = [];
    sections.push({ id: 'summary', title: titles[0] || ui(ctx, 'summary'), kind: 'summary', description: area.description || null, supportLabel: (area.attributes && area.attributes.supportLabel) || null, badges: badges(ctx, area), provenance: provenanceOf(ctx, area),
      counts: { positions: counts.positions, externalPositions: counts.externalPositions, people: counts.people, externals: counts.externals, positionsText: uiFmt(ctx, 'countPositions', { n: counts.positions }), peopleText: uiFmt(ctx, 'countPeople', { n: counts.people }), externalsText: uiFmt(ctx, 'countExternals', { n: counts.externals }) } });
    sections.push({ id: 'positions', title: titles[1] || ui(ctx, 'positions'), kind: 'positions', positions: ctx.graph.areaPositions(area.id).filter(function (p) { return visible(ctx, p.id); }).map(function (p) {
      var pa = p.attributes || {};
      return { position: entityRef(ctx, p), id: p.id, name: p.name, external: !!pa.external, externalLabel: pa.external ? (views(ctx).orgchart || {}).externalLabel || null : null, collective: !!pa.collective, occupancyNote: pa.occupancyNote || null, occupants: refs(ctx, ctx.graph.positionOccupants(p.id), true), roles: refs(ctx, ctx.graph.positionRoles(p.id), true) };
    }) });
    sections.push({ id: 'processes', title: titles[2] || ui(ctx, 'processes'), kind: 'processes', cards: cards, noDetail: cards.length ? null : as.noDetail || msgText(ctx, 'MSG-11') });
    sections.push({ id: 'gaps', title: titles[3] || ui(ctx, 'gaps'), kind: 'gaps', gaps: gaps.map(function (g) { return Object.assign(entityRef(ctx, g), { noteText: (g.attributes && g.attributes.noteText) || null, command: { type: 'selectEntity', payload: { entityId: g.id } } }); }), empty: gaps.length ? null : as.noDetail || msgText(ctx, 'MSG-10') });
    if (trackingOk && owned.length) {
      var summary = trackingSummary(ctx, owned.map(function (p) { return p.id; }));
      sections.push({ id: 'tracking', title: titles[4] || ui(ctx, 'processViewIncidents'), kind: 'tracking', permitted: true, summary: summary,
        incidentsText: uiFmt(ctx, 'countItems', { n: summary.incidents.total }), projectsText: uiFmt(ctx, 'countItems', { n: summary.projects.total }),
        actions: [action('incidents', ui(ctx, 'viewIncidents'), { type: 'enterProcess', payload: { processId: owned[0].id, view: 'incidents' } }), action('projects', ui(ctx, 'viewProjects'), { type: 'enterProcess', payload: { processId: owned[0].id, view: 'projects' } })] });
    }
    return {
      area: entityRef(ctx, area), title: area.name, sections: sections,
      areas: ctx.graph.areas().filter(function (a) { return visible(ctx, a.id); }).map(function (a) { return { id: a.id, label: a.name, selected: a.id === area.id }; }),
      highlight: highlightModel(ctx), neighbors: at.neighbors.filter(function (id) { return visible(ctx, id); }).map(function (id) { return refById(ctx, id); }),
      cameraKey: 'area:' + area.id, camera: ctx.state.camera ? ctx.state.camera['area:' + area.id] || null : null, listMode: !!w.listMode,
      selectedId: w.selection ? w.selection.entityId : null,
      actions: [highlightAction(ctx, area, 'focusArea'), action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: area.id } })]
    };
  }

  /* ---------- process sheet (WEB-03) ---------- */

  function sProcessSheetModel(ctx) {
    var w = web(ctx);
    var process = w.processId ? ctx.graph.entity(w.processId) : null;
    if (!process) return { process: null, title: ui(ctx, 'selectProcess'), empty: ui(ctx, 'selectProcess'), processes: ctx.graph.ofType('process').filter(function (p) { return visible(ctx, p.id); }).map(function (p) { return { id: p.id, label: p.name, detailed: !!(p.attributes && p.attributes.detailed) }; }) };
    if (!visible(ctx, process.id)) return { process: entityRef(ctx, process), restricted: true, notice: can(ctx, 'viewEntity', { entityId: process.id }) };
    var a = process.attributes || {};
    var detailed = !!a.detailed;
    var vers = visibleVersions(ctx, process.id);
    var selected = w.versionId && canSee(ctx, w.versionId) ? getVersion(ctx, w.versionId) : null;
    if (!selected || selected.processId !== process.id) selected = vers.filter(function (v) { return v.id === currentAsIsId(ctx); })[0] || vers[0] || null;
    var owner = ctx.graph.processArea(process.id);
    var participants = ctx.graph.processParticipants(process.id);
    var macro = ctx.graph.processMacroprocess(process.id);
    var objective = ctx.graph.processObjectives(process.id)[0];
    var indicator = objective ? ctx.graph.objectiveIndicators(objective.id)[0] : null;
    var policies = ctx.graph.processPolicies(process.id).filter(function (p) { return visible(ctx, p.id); });
    var gaps = ctx.graph.processGaps(process.id).filter(function (g) { return visible(ctx, g.id); });
    var sip = views(ctx).sipoc || {};
    var raciData = ctx.graph.raci(process.id, selected, demoVersions(ctx));
    var docMap = new Map();
    vers.forEach(function (v) {
      ctx.graph.processDocuments(process.id, v, demoVersions(ctx)).forEach(function (d) {
        if (!visible(ctx, d.id) || !layerOn(ctx, 'document')) return;
        if (!docMap.has(d.id)) docMap.set(d.id, { entity: d, versionIds: [] });
        docMap.get(d.id).versionIds.push(v.id);
      });
    });
    var currentSystems = [];
    vers.filter(function (v) { return v.type === 'AS-IS'; }).forEach(function (v) { ctx.graph.processSystems(process.id, v, demoVersions(ctx)).forEach(function (s) { if (currentSystems.indexOf(s) === -1) currentSystems.push(s); }); });
    currentSystems = currentSystems.filter(function (s) { return visible(ctx, s.id) && layerOn(ctx, 'system') && (s.attributes || {}).status === 'current'; });
    var proposedSystems = ctx.graph.ofType('system').filter(function (s) { return (s.attributes || {}).status !== 'current' && visible(ctx, s.id) && layerOn(ctx, 'system'); });
    var toBe = vers.filter(function (v) { return v.type === 'TO-BE' && v.state !== 'incomplete-draft'; });
    var participantRoles = asArray(raciData.columns).filter(function (r) { return visible(ctx, r.id); });
    var variantNoteText = asArray(a.variants).map(function (v) { return v.label; }).join(' · ');
    var policyRel = policies.length ? ctx.graph.relationsTo(process.id, 'orienta').filter(function (r) { return r.from === policies[0].id; })[0] : null;
    return {
      process: entityRef(ctx, process), id: process.id, title: process.name, detailed: detailed,
      badges: badges(ctx, process),
      description: detailed ? process.description || missing(ctx) : (a.sheetText || process.description || missing(ctx)),
      sheetText: a.sheetText || null, extraText: a.extraText || null, note: a.note || null,
      start: nullable(ctx, a.start), end: nullable(ctx, a.end), timeText: nullable(ctx, a.timeText),
      owner: { label: ui(ctx, 'owner'), text: owner ? owner.name : (a.ownerLabel || missing(ctx)), entity: owner && visible(ctx, owner.id) ? entityRef(ctx, owner) : null },
      participants: { label: ui(ctx, 'participants'), text: a.participantsText || (participants.length ? participants.map(function (p) { return p.name; }).join(', ') : missing(ctx)), areas: refs(ctx, participants, true), roles: refs(ctx, participantRoles, true), actor: (function () { var flow = selected ? ctx.graph.flowForVersion(selected, demoVersions(ctx)) : null; var actor = flow && flow.externalActor ? ctx.graph.entity(flow.externalActor.entityId) : null; return actor && visible(ctx, actor.id) ? entityRef(ctx, actor) : null; })() },
      variants: { label: ui(ctx, 'variants'), text: variantNoteText || missing(ctx), items: asArray(a.variants).map(function (v) { return { id: v.id, label: v.label, note: v.note || null }; }) },
      macroprocess: macro && visible(ctx, macro.id) ? Object.assign(entityRef(ctx, macro), { badge: { label: ui(ctx, 'labelProposed'), tone: 'proposed' } }) : null,
      version: versionRef(ctx, selected),
      versions: vers.map(function (v) { return Object.assign(versionRef(ctx, v), { selected: !!selected && v.id === selected.id }); }),
      explainer: selected ? (selected.type === 'AS-IS' ? ui(ctx, 'asIsExplainer') : ui(ctx, 'toBeExplainer')) : null,
      sipoc: detailed ? { label: sip.label || null, columns: asArray(sip.columns), rows: ctx.graph.sipoc(process.id) } : null,
      raci: detailed ? { label: ui(ctx, 'responsibilities'), columns: raciData.columns.map(function (r) { return { roleId: r.id, label: r.name, entity: entityRef(ctx, r), visible: visible(ctx, r.id) }; }),
        rows: raciData.rows.map(function (row) { return { key: row.key, activityKey: row.key, name: row.activity.name, activity: entityRef(ctx, row.activity), versionId: selected ? selected.id : null, cells: raciData.columns.map(function (r) { return { roleId: r.id, value: row.cells[r.id] || null, text: row.cells[r.id] || raciData.missing || missing(ctx) }; }) }; }),
        note: raciData.note, missing: raciData.missing, ownerNote: owner ? ui(ctx, 'owner') + ': ' + owner.name : null } : null,
      documents: { label: ui(ctx, 'documents'), items: Array.from(docMap.values()).map(function (d) { return Object.assign(entityRef(ctx, d.entity), { versionIds: d.versionIds, text: (d.entity.attributes || {}).text || null, command: { type: 'selectEntity', payload: { entityId: d.entity.id } } }); }), hiddenLayer: !layerOn(ctx, 'document') ? { text: ui(ctx, 'hiddenLayer'), action: { label: ui(ctx, 'showLayer'), command: { type: 'toggleLayer', payload: { layerId: 'documents', on: true } } } } : null },
      systems: { label: ui(ctx, 'currentSystems'), current: currentSystems.map(function (s) { return Object.assign(entityRef(ctx, s), { statusLabel: (s.attributes || {}).statusLabel || null }); }),
        proposed: proposedSystems.map(function (s) { return Object.assign(entityRef(ctx, s), { statusLabel: (s.attributes || {}).statusLabel || null }); }),
        proposedLabel: ui(ctx, 'proposedTools'), proposedTarget: toBe.length ? { tab: 'web', web: { module: 'twin', level: 'operational', processId: process.id, processView: 'flow', versionId: toBe[toBe.length - 1].id } } : null,
        hiddenLayer: !layerOn(ctx, 'system') ? { text: ui(ctx, 'hiddenLayer'), action: { label: ui(ctx, 'showLayer'), command: { type: 'toggleLayer', payload: { layerId: 'systems', on: true } } } } : null },
      policy: policies.length ? { label: ui(ctx, 'policy'), entity: entityRef(ctx, policies[0]), relationLabel: packCore.relationLabel('orienta', 'in'), inferred: !!(policyRel && policyRel.inferred), badge: policyRel && policyRel.inferred ? ui(ctx, 'proposedRelation') : null, command: { type: 'selectEntity', payload: { entityId: policies[0].id } } } : null,
      objective: objective && visible(ctx, objective.id) ? { label: ui(ctx, 'objective'), entity: entityRef(ctx, objective), description: objective.description || null, badge: { label: (objective.attributes && objective.attributes.label) || ui(ctx, 'labelProposed'), tone: 'proposed' }, command: { type: 'selectEntity', payload: { entityId: objective.id } } } : null,
      indicator: indicator && visible(ctx, indicator.id) ? Object.assign(indicatorFacts(ctx, indicator), { label: ui(ctx, 'indicator') }) : null,
      gaps: { label: ui(ctx, 'gaps'), items: gaps.map(function (g) { return Object.assign(entityRef(ctx, g), { noteText: (g.attributes || {}).noteText || null, command: { type: 'selectEntity', payload: { entityId: g.id } } }); }) },
      provenance: provenanceOf(ctx, process, selected ? selected.sourceIds : null),
      actions: processActions(ctx, process, selected ? selected.id : undefined).concat([
        action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: process.id, versionId: selected ? selected.id : undefined } }),
        action('sources', ui(ctx, 'viewSources'), { type: 'openOverlay', payload: { kind: 'sources', entityId: process.id, versionId: selected ? selected.id : undefined } }),
        action('connections', ui(ctx, 'viewConnections'), { type: 'setRelationsRoot', payload: { entityId: process.id } })
      ]),
      openFlowUnavailable: detailed ? null : (a.openFlowUnavailable || msgText(ctx, 'MSG-11')),
      readOnly: !!(selected && selected.type === 'AS-IS' && selected.id !== currentAsIsId(ctx)),
      readOnlyLabel: ui(ctx, 'historicalReadOnly'),
      newVersionNotice: w.newVersionNotice ? { versionId: w.newVersionNotice.versionId, text: ui(ctx, 'newVersionNotice'), action: ui(ctx, 'viewNewVersion'), command: { type: 'setVersion', payload: { versionId: w.newVersionNotice.versionId } } } : null
    };
  }

  /* ---------- flow (WEB-04 / WEB-06) ---------- */

  function subtaskModels(ctx, activity) {
    return asArray(ctx.graph.attr(activity, 'subtasks')).map(function (s) {
      var r = ctx.graph.entity(s.roleId);
      return { id: s.id, name: s.name, roleId: s.roleId, role: r && visible(ctx, r.id) ? entityRef(ctx, r) : null, laneId: s.laneId || null, instruction: s.instruction || null, sourceNodeIds: s.sourceNodeIds || null, testid: 'node-' + s.id };
    });
  }

  function activityNodeModel(ctx, activity, version, variant, flow) {
    var attrs = activity.attributes || {};
    var res = ctx.graph.activityResources(activity);
    var byVariant = attrs.documentIdsByVariant && variant && attrs.documentIdsByVariant[variant] ? attrs.documentIdsByVariant[variant] : null;
    var requires = byVariant ? byVariant.map(function (id) { return ctx.graph.entity(id); }).filter(Boolean) : res.documents.requires;
    var key = ctx.graph.activityKey(activity);
    var dbv = flow && flow.documentsByVariant && asArray(flow.documentsByVariant.activityKeys).indexOf(key) !== -1;
    return {
      key: key, id: activity.id || key, name: activity.name, versionId: version.id,
      instruction: ctx.graph.attr(activity, 'instruction') || null, whatToDo: ctx.graph.attr(activity, 'whatToDo') || null,
      control: ctx.graph.attr(activity, 'control') || null, output: ctx.graph.attr(activity, 'output') || null, time: ctx.graph.attr(activity, 'time') || null, timeText: missing(ctx),
      roleIds: ctx.graph.roleIdsOf(activity), roles: refs(ctx, res.roles, true), systems: refs(ctx, res.systems, true),
      documents: { requires: refs(ctx, requires, true), produces: refs(ctx, res.documents.produces, true), text: attrs.documentsText || null },
      systemsText: attrs.systemsText || null, actors: refs(ctx, res.actors, true), channelNote: attrs.channelNote || null,
      variantNote: variant && attrs.variantNotes ? attrs.variantNotes[variant] || null : null,
      multiRole: !!attrs.multiRole, subtasks: subtaskModels(ctx, activity), laneIds: asArray(attrs.laneIds),
      sourceNodeIds: attrs.sourceNodeIds || null, hasDocumentsByVariant: !!dbv,
      entity: entityRef(ctx, ctx.graph.entity(activity.id || key) || activity), visible: visible(ctx, activity.id || key),
      provenance: provenanceOf(ctx, activity, version.sourceIds)
    };
  }

  function documentsByVariantModel(ctx, flow, variant) {
    var d = flow && flow.documentsByVariant;
    if (!d) return null;
    return {
      title: d.title || null, activityKeys: asArray(d.activityKeys),
      variants: asArray(d.variants).map(function (v) { return { id: v.id, label: v.label, items: asArray(v.items), observation: v.observation || null, documents: refs(ctx, asArray(v.documentIds).map(function (id) { return ctx.graph.entity(id); }), true), selected: v.id === variant }; }),
      namingStandard: asArray(d.namingStandard), namingNote: d.namingNote || null, controls: asArray(d.controls), controlsNote: d.controlsNote || null
    };
  }

  function sFlowModel(ctx, versionIdArg, variantArg) {
    var w = web(ctx);
    var versionId = versionIdArg || w.versionId;
    var version = getVersion(ctx, versionId);
    if (!version) return { version: null, empty: ui(ctx, 'selectProcess'), nodes: [], edges: [], lanes: [] };
    if (!canSee(ctx, version.id)) return { version: null, restricted: true, notice: can(ctx, 'viewVersion', { versionId: version.id }), nodes: [], edges: [], lanes: [] };
    var process = ctx.graph.entity(version.processId);
    var flow = ctx.graph.flowForVersion(version, demoVersions(ctx));
    var variants = flow ? asArray(flow.variants) : [];
    var variant = variantArg || w.paymentVariant || (flow && flow.defaultVariant) || null;
    if (variants.length && !variants.some(function (v) { return v.id === variant; })) variant = flow.defaultVariant || variants[0].id;
    var variantEntry = variants.filter(function (v) { return v.id === variant; })[0] || null;
    var variantAvailable = !variantEntry || variantEntry.available !== false;
    var sel = w.selection;
    var selectedNodeId = sel && sel.versionId === version.id ? sel.entityId : null;
    var lanes = flow ? asArray(flow.lanes).map(function (l) { var r = ctx.graph.entity(l.roleId); return { id: l.id, label: l.label, roleId: l.roleId, role: r && visible(ctx, r.id) ? entityRef(ctx, r) : null }; }) : [];
    var exchanges = flow && flow.externalActor ? asArray(flow.externalActor.exchanges) : [];
    var nodes = [];
    var edges = [];
    if (flow && variantAvailable && !flow.incomplete) {
      nodes = asArray(flow.nodes).map(function (n) {
        var activity = n.kind === 'task' ? resolvedActivity(ctx, version, n.id) : null;
        var model = {
          id: n.id, kind: n.kind, typeLabel: packCore.typeLabel(n.kind), icon: packCore.typeIcon(n.kind), laneId: n.laneId, laneIds: asArray(n.laneIds).length ? asArray(n.laneIds) : [n.laneId],
          label: activity ? activity.name : n.label || n.id, activity: activity ? activityNodeModel(ctx, activity, version, variant, flow) : null,
          group: !!n.group || !!(activity && ctx.graph.attr(activity, 'multiRole')), subtaskIds: [],
          exchanges: exchanges.filter(function (x) { return x.nodeId === n.id; }).map(function (x) { return { direction: x.direction, label: x.label }; }),
          sourceNodeIds: n.sourceNodeIds || (activity ? ctx.graph.attr(activity, 'sourceNodeIds') : null) || null,
          selected: selectedNodeId === n.id, versionId: version.id,
          testid: 'node-' + version.id + '-' + n.id, entityTestid: 'node-' + n.id,
          command: { type: 'selectEntity', payload: { entityId: n.id, versionId: version.id, kind: activity ? 'entity' : 'flowNode' } },
          instructionCommand: { type: 'openInstruction', payload: { versionId: version.id, key: n.id } }
        };
        if (activity && !model.activity.visible) model.restricted = true;
        return model;
      });
      asArray(flow.groups).forEach(function (g) { var node = nodes.filter(function (n) { return n.id === g.id; })[0]; if (node) { node.group = true; node.subtaskIds = asArray(g.subtaskIds); } });
      edges = asArray(flow.edges).map(function (e) { return { id: e.id, from: e.from, to: e.to, label: e.label || null, loop: !!e.loop, inferred: !!e.inferred, highlighted: selectedNodeId !== null && (e.from === selectedNodeId || e.to === selectedNodeId) }; });
    }
    var actor = flow && flow.externalActor ? ctx.graph.entity(flow.externalActor.entityId) : null;
    var chip = flow && flow.systemChip ? flow.systemChip : null;
    var chipSystem = chip ? ctx.graph.entity(chip.systemId) : null;
    var historical = version.type === 'AS-IS' && version.id !== currentAsIsId(ctx);
    var vers = process ? visibleVersions(ctx, process.id) : [];
    return {
      version: versionRef(ctx, version),
      versions: vers.map(function (v) { return Object.assign(versionRef(ctx, v), { selected: v.id === version.id }); }),
      process: entityRef(ctx, process),
      flow: flow ? { id: flow.id, title: flow.title, subtitle: flow.subtitle, processId: flow.processId } : null,
      explainer: version.type === 'AS-IS' ? ui(ctx, 'asIsExplainer') : ui(ctx, 'toBeExplainer'),
      incomplete: !!(flow && flow.incomplete),
      message: flow && flow.incomplete ? flow.message || null : null,
      items: flow && flow.incomplete ? asArray(flow.items) : [],
      publishable: !!version.publishable,
      lanes: lanes,
      nodes: nodes,
      edges: edges,
      groups: flow ? asArray(flow.groups).map(function (g) { var act = resolvedActivity(ctx, version, g.id); return { id: g.id, subtaskIds: asArray(g.subtaskIds), subtasks: act ? subtaskModels(ctx, act) : [] }; }) : [],
      legend: flow ? asArray(flow.legend) : [],
      context: flow ? { title: flow.contextTitle || null, items: asArray(flow.context).map(function (c) { return { title: c.title, text: c.text }; }) } : { title: null, items: [] },
      notes: flow ? asArray(flow.notes) : [],
      sourceNotes: flow ? asArray(flow.sourceNotes) : [],
      variantSelectorLabel: flow && flow.variantSelectorLabel ? flow.variantSelectorLabel : ui(ctx, 'paymentType'),
      variants: variants.map(function (v) { return { id: v.id, label: v.label, available: v.available !== false, message: v.message || null, selected: v.id === variant, testid: 'variant-' + v.id }; }),
      variant: variant,
      variantAvailable: variantAvailable,
      variantMessage: variantAvailable ? null : (variantEntry && variantEntry.message) || null,
      externalActor: actor ? { entity: entityRef(ctx, actor), label: flow.externalActor.label || actor.name, exchanges: exchanges.map(function (x) { return { nodeId: x.nodeId, direction: x.direction, label: x.label }; }), visible: visible(ctx, actor.id) } : null,
      systemChip: chip ? { betweenNodeIds: asArray(chip.betweenNodeIds), systemId: chip.systemId, system: chipSystem && visible(ctx, chipSystem.id) ? entityRef(ctx, chipSystem) : null, label: chip.label, sourceNodeIds: chip.sourceNodeIds || null } : null,
      documentsByVariant: documentsByVariantModel(ctx, flow, variant),
      readOnly: historical,
      readOnlyLabel: historical ? ui(ctx, 'historicalReadOnly') : null,
      adoptionBadge: version.adoptionLabel ? { label: version.adoptionLabel, tone: 'demo' } : null,
      derivedNote: version.originVersionId && !canSee(ctx, version.originVersionId) ? (version.derivedLabel || ui(ctx, 'derivedFromProposal')) : null,
      originVersion: version.originVersionId && canSee(ctx, version.originVersionId) ? versionRef(ctx, getVersion(ctx, version.originVersionId)) : null,
      pending: asArray(version.pending),
      versionNotes: asArray(version.notes),
      selectedNodeId: selectedNodeId,
      activityKey: w.activityKey || null,
      cameraKey: 'flow:' + version.id + ':' + (variant || ''),
      camera: ctx.state.camera ? ctx.state.camera['flow:' + version.id + ':' + (variant || '')] || null : null,
      listMode: !!w.listMode,
      layers: (views(ctx).layers || []).map(function (l) { return { id: l.id, label: l.label, on: !(w.layers && w.layers[l.id] === false), testid: 'layer-' + l.id }; }),
      newVersionNotice: w.newVersionNotice ? { versionId: w.newVersionNotice.versionId, text: ui(ctx, 'newVersionNotice'), action: ui(ctx, 'viewNewVersion'), command: { type: 'setVersion', payload: { versionId: w.newVersionNotice.versionId } } } : null,
      provenance: { sourceIds: asArray(version.sourceIds), sources: ctx.graph.sourceRefs(version.sourceIds), label: ui(ctx, 'sources') },
      actions: [
        action('view-sheet', ui(ctx, 'viewSheet'), { type: 'setProcessView', payload: { view: 'sheet' } }),
        action('compare', ui(ctx, 'compareVersions'), { type: 'setProcessView', payload: { view: 'compare' } }),
        action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: version.processId, versionId: version.id } })
      ]
    };
  }

  /* ---------- instruction (WEB-05) ---------- */

  function sInstructionModel(ctx, versionIdArg, keyArg) {
    var w = web(ctx);
    var versionId = versionIdArg || w.versionId;
    var key = keyArg || w.activityKey;
    var version = getVersion(ctx, versionId);
    if (!version || !key) return null;
    if (!canSee(ctx, version.id)) return { restricted: true, notice: can(ctx, 'viewVersion', { versionId: version.id }) };
    var flow = ctx.graph.flowForVersion(version, demoVersions(ctx));
    var activity = resolvedActivity(ctx, version, key);
    var process = ctx.graph.entity(version.processId);
    var ins = views(ctx).instruction || {};
    var titles = asArray(ins.sections);
    var variant = w.paymentVariant || (flow && flow.defaultVariant) || null;
    var backAction = action('back-to-flow', ui(ctx, 'backToFlow'), { type: 'backToFlow', payload: {} });
    if (!activity) {
      var node = ctx.graph.flowNode(flow, key);
      if (!node) return null;
      var nodeModel = flowNodeInspector(ctx, { entityId: key, versionId: version.id, kind: 'flowNode' });
      return {
        kind: 'flowNode', nodeKind: node.kind, key: key, title: node.label || node.id, typeLabel: packCore.typeLabel(node.kind), icon: packCore.typeIcon(node.kind),
        description: node.label || null, condition: node.kind === 'decision' ? node.label : null, outcomes: nodeModel ? nodeModel.node.outcomes : [],
        version: versionRef(ctx, version), process: entityRef(ctx, process), flow: flow ? { id: flow.id, title: flow.title, subtitle: flow.subtitle } : null,
        disclaimer: ins.disclaimer || null, sections: [], sources: nodeModel ? nodeModel.provenance : null, sourceNodeIds: node.sourceNodeIds || null,
        actions: [backAction, action('sources', ui(ctx, 'viewSources'), { type: 'openOverlay', payload: { kind: 'sources', entityId: key, versionId: version.id } })],
        readOnly: version.type === 'AS-IS' && version.id !== currentAsIsId(ctx), readOnlyLabel: ui(ctx, 'historicalReadOnly')
      };
    }
    if (activity.id && ctx.graph.has(activity.id) && !visible(ctx, activity.id)) return { restricted: true, notice: can(ctx, 'viewEntity', { entityId: activity.id }) };
    var attrs = activity.attributes || {};
    var res = ctx.graph.activityResources(activity);
    var nodeModelA = activityNodeModel(ctx, activity, version, variant, flow);
    var roleChain = res.roles.filter(function (r) { return visible(ctx, r.id); }).map(function (r) {
      return { role: entityRef(ctx, r), laneLabel: (r.attributes || {}).laneLabel || null, mappingNote: (r.attributes || {}).mappingNote || null, positionLabelNote: (r.attributes || {}).positionLabelNote || null,
        positions: ctx.graph.rolePositions(r.id).filter(function (p) { return visible(ctx, p.id); }).map(function (p) { return { position: entityRef(ctx, p), collective: !!(p.attributes && p.attributes.collective), occupants: refs(ctx, ctx.graph.positionOccupants(p.id), true), occupancyNote: (p.attributes || {}).occupancyNote || null }; }) };
    });
    var relatedWork = res.roles.filter(function (r) { return visible(ctx, r.id); }).map(function (r) {
      return { role: entityRef(ctx, r), activities: ctx.graph.roleActivities(r.id, version, demoVersions(ctx)).filter(function (a2) { return ctx.graph.activityKey(a2) !== key && visible(ctx, a2.id || ctx.graph.activityKey(a2)); }).map(function (a2) {
        var k2 = ctx.graph.activityKey(a2);
        return { key: k2, name: a2.name, versionId: version.id, command: { type: 'openInstruction', payload: { versionId: version.id, key: k2 } }, testid: 'node-' + version.id + '-' + k2 };
      }) };
    });
    var sourceIds = asArray((activity.provenance || {}).sourceIds).concat(asArray(version.sourceIds)).filter(function (id, i, arr) { return arr.indexOf(id) === i; });
    var sourceNodeIds = attrs.sourceNodeIds || null;
    var sourceNodesForVariant = sourceNodeIds && !Array.isArray(sourceNodeIds) ? (variant && sourceNodeIds[variant] ? sourceNodeIds[variant] : null) : sourceNodeIds;
    var sections = [
      { id: 'whatToDo', title: titles[0] || ui(ctx, 'whatToDo'), kind: 'text', text: nullable(ctx, attrs.whatToDo || attrs.instruction) },
      { id: 'who', title: titles[1] || ui(ctx, 'executor'), kind: 'who', roles: roleChain, actors: refs(ctx, res.actors, true), channelNote: attrs.channelNote || null, multiRole: !!attrs.multiRole, subtasks: subtaskModels(ctx, activity), empty: roleChain.length ? null : missing(ctx), hiddenLayer: !layerOn(ctx, 'role') ? { text: ui(ctx, 'hiddenLayer'), action: { label: ui(ctx, 'showLayer'), command: { type: 'toggleLayer', payload: { layerId: 'people', on: true } } } } : null },
      { id: 'inputs', title: titles[2] || ui(ctx, 'documents'), kind: 'documents', documents: nodeModelA.documents.requires, text: attrs.documentsText || null, variantNote: nodeModelA.variantNote, documentsByVariant: nodeModelA.hasDocumentsByVariant ? documentsByVariantModel(ctx, flow, variant) : null, empty: nodeModelA.documents.requires.length || attrs.documentsText ? null : missing(ctx) },
      { id: 'tools', title: titles[3] || ui(ctx, 'systems'), kind: 'systems', systems: nodeModelA.systems, text: attrs.systemsText || null, empty: nodeModelA.systems.length || attrs.systemsText ? null : missing(ctx) },
      { id: 'control', title: titles[4] || ui(ctx, 'control'), kind: 'text', text: nullable(ctx, attrs.control) },
      { id: 'output', title: titles[5] || ui(ctx, 'output'), kind: 'output', text: nullable(ctx, attrs.output), produces: nodeModelA.documents.produces },
      { id: 'time', title: titles[6] || ui(ctx, 'time'), kind: 'text', text: nullable(ctx, attrs.time), missing: attrs.time === null || attrs.time === undefined },
      { id: 'sources', title: titles[7] || ui(ctx, 'sources'), kind: 'sources', sources: ctx.graph.sourceRefs(sourceIds).map(function (s) { var src = ctx.pack.sources.get(s.id); return Object.assign(s, { modelModifiedAt: src && src.modelModifiedAt ? src.modelModifiedAt : null, modelModifiedAtText: src && src.modelModifiedAt ? ctx.format.dateTime(src.modelModifiedAt) : null, modelModifiedAtLabel: ui(ctx, 'modelModifiedAt') }); }), sourceNodeIds: sourceNodesForVariant, sourceNodesLabel: ui(ctx, 'sourceNodes'), confidence: (activity.provenance || {}).confidence || null, confidenceLabel: confidenceLabel(ctx, (activity.provenance || {}).confidence), labels: asArray(activity.labels) },
      { id: 'relatedWork', title: titles[8] || ui(ctx, 'relatedWork'), kind: 'relatedWork', roles: relatedWork, empty: relatedWork.some(function (r) { return r.activities.length; }) ? null : msgText(ctx, 'MSG-10') }
    ];
    var entityId = activity.id || key;
    return {
      kind: 'activity', key: key, id: entityId, title: activity.name, typeLabel: packCore.typeLabel('activity'), icon: packCore.typeIcon('activity'),
      description: attrs.instruction || activity.description || null,
      badges: badges(ctx, activity),
      version: versionRef(ctx, version), process: entityRef(ctx, process), flow: flow ? { id: flow.id, title: flow.title, subtitle: flow.subtitle } : null,
      disclaimer: ins.disclaimer || null,
      variant: variant, variantNote: nodeModelA.variantNote,
      sections: sections,
      activity: nodeModelA,
      actions: [
        backAction,
        action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: entityId, versionId: version.id } }),
        action('connections', ui(ctx, 'viewConnections'), { type: 'setRelationsRoot', payload: { entityId: entityId } }, ctx.graph.has(entityId), msgText(ctx, 'MSG-10')),
        action('sources', ui(ctx, 'viewSources'), { type: 'openOverlay', payload: { kind: 'sources', entityId: entityId, versionId: version.id } })
      ],
      readOnly: version.type === 'AS-IS' && version.id !== currentAsIsId(ctx),
      readOnlyLabel: ui(ctx, 'historicalReadOnly'),
      adoptionBadge: version.adoptionLabel ? { label: version.adoptionLabel, tone: 'demo' } : null
    };
  }

  /* ---------- compare (WEB-06) ---------- */

  function sCompareModel(ctx) {
    var w = web(ctx);
    var processId = w.processId || ctx.pack.defaultProcessId;
    var process = ctx.graph.entity(processId);
    if (!process || !visible(ctx, process.id)) return { process: null, available: false, rows: [], columns: [] };
    var cmp = views(ctx).compare || {};
    var vers = visibleVersions(ctx, process.id);
    var asIs = vers.filter(function (v) { return v.type === 'AS-IS'; });
    var toBe = vers.filter(function (v) { return v.type === 'TO-BE'; });
    var base = asIs.filter(function (v) { return v.id === currentAsIsId(ctx); })[0] || asIs[0] || null;
    var selectable = toBe.filter(function (v) { return v.state !== 'incomplete-draft'; });
    var selected = selectable.filter(function (v) { return v.id === w.compareVersionId; })[0] || selectable[selectable.length - 1] || null;
    var toBe1 = toBe.filter(function (v) { return v.state === 'incomplete-draft'; })[0] || null;
    var toBe1Flow = toBe1 ? ctx.graph.flowForVersion(toBe1, demoVersions(ctx)) : null;
    var denied = toBe.length ? null : can(ctx, 'viewDraftsToBe');
    var diffRows = selected && selected.isDemo ? asArray(selected.diffRows || (selected.diff && selected.diff.rows) || (selected.diff && selected.diff.before !== undefined ? [{ label: selected.diff.activityKey || ui(ctx, 'instruction'), before: selected.diff.before, after: selected.diff.after }] : [])) : [];
    return {
      process: entityRef(ctx, process),
      title: ui(ctx, 'compareVersions'),
      columns: asArray(cmp.columns),
      rows: asArray(cmp.rows).map(function (r) { return { label: r.label, asIs: r.asIs, toBe: r.toBe }; }),
      footer: cmp.footer || null,
      available: !!(base && selected),
      unavailable: toBe.length ? null : { text: denied && !denied.ok ? denied.text : ui(ctx, 'noData'), notice: denied && !denied.ok ? denied : null },
      asIs: versionRef(ctx, base),
      toBe: versionRef(ctx, selected),
      selectedToBeId: selected ? selected.id : null,
      options: selectable.map(function (v) { return Object.assign(versionRef(ctx, v), { selected: !!selected && v.id === selected.id, command: { type: 'setCompareVersion', payload: { versionId: v.id } } }); }),
      allVersions: vers.map(function (v) { return versionRef(ctx, v); }),
      toBe1: toBe1 ? { version: versionRef(ctx, toBe1), message: toBe1Flow ? toBe1Flow.message || null : null, items: toBe1Flow ? asArray(toBe1Flow.items) : [], publishable: false } : null,
      baseDiff: diffRows.length ? { label: ui(ctx, 'compareWithBase'), baseVersionId: selected.baseVersionId || null, rows: diffRows.map(function (r) { return { label: r.label, before: r.before, after: r.after }; }), pending: asArray(selected.pending), notes: asArray(selected.notes) } : null,
      sourceSummary: selected && !diffRows.length ? { summary: selected.summary || null, changeLabel: selected.changeLabel || null, sourceIds: asArray(selected.sourceIds), sources: ctx.graph.sourceRefs(selected.sourceIds), pending: asArray(selected.pending) } : null,
      actions: [
        action('open-flow', ui(ctx, 'openFlow'), { type: 'enterProcess', payload: { processId: process.id, view: 'flow', versionId: selected ? selected.id : undefined } }, !!selected, ui(ctx, 'noData')),
        action('view-sheet', ui(ctx, 'viewSheet'), { type: 'setProcessView', payload: { view: 'sheet' } }),
        action('history', ui(ctx, 'history'), { type: 'openOverlay', payload: { kind: 'history', entityId: process.id } })
      ]
    };
  }

  /* ---------- history (WEB-07) ---------- */

  function sHistoryModel(ctx, entityIdArg, versionIdArg) {
    var w = web(ctx);
    var overlay = w.overlay || {};
    var entityId = entityIdArg || overlay.entityId || (w.selection ? w.selection.entityId : null) || w.processId;
    var versionId = versionIdArg || overlay.versionId || w.versionId || null;
    var entity = entityId ? ctx.graph.entity(entityId) : null;
    var h = views(ctx).history || {};
    if (!entity) {
      var version = getVersion(ctx, entityId);
      if (version) { entity = ctx.graph.entity(version.processId); versionId = version.id; }
    }
    if (!entity) return null;
    if (!visible(ctx, entity.id)) return { entity: entityRef(ctx, entity), restricted: true, notice: can(ctx, 'viewEntity', { entityId: entity.id }), rows: [], columns: asArray(h.columns) };
    var rows = ctx.graph.history(entity.id, demo(ctx)).filter(function (r) { return !r.versionId || canSee(ctx, r.versionId); }).map(function (r) {
      var v = r.version;
      return {
        versionId: r.versionId, label: r.label, type: r.type, typeLabel: r.type ? (r.type === 'AS-IS' ? ui(ctx, 'versionTypeAsIs') : ui(ctx, 'versionTypeToBe')) : r.typeLabel,
        state: r.state, stateLabel: r.stateLabel || (r.versionId ? missing(ctx) : (asArray(entity.labels)[0] || null)),
        publishedAt: r.publishedAt, publishedAtText: r.publishedAt ? ctx.format.dateTime(r.publishedAt) : h.notProvided || missing(ctx),
        publishedBy: r.publishedBy, publishedByText: r.publishedBy || h.notProvided || missing(ctx),
        change: r.change, changeText: r.change || missing(ctx),
        sourceIds: r.sourceIds, sourceLabel: r.sourceLabel || missing(ctx), sources: r.sources,
        isDemo: r.isDemo, isCurrentAsIs: r.isCurrentAsIs, current: !!versionId && r.versionId === versionId, adoptionLabel: r.adoptionLabel, originVersionId: r.originVersionId,
        derivedLabel: r.originVersionId && !canSee(ctx, r.originVersionId) ? ((v && v.derivedLabel) || ui(ctx, 'derivedFromProposal')) : null,
        hasActivity: r.hasActivity === undefined ? null : r.hasActivity, pending: r.pending,
        actions: r.versionId ? [
          action('view-version', ui(ctx, 'viewVersion'), { type: 'enterProcess', payload: { processId: v ? v.processId : entity.id, view: 'flow', versionId: r.versionId } }),
          r.isDemo ? action('compare-with-base', ui(ctx, 'compareWithBase'), { type: 'navigateTo', payload: { target: { tab: 'web', web: { module: 'twin', level: 'operational', processId: v ? v.processId : entity.id, processView: 'compare', versionId: r.versionId } } } }, !!(r.baseVersionId && canSee(ctx, r.baseVersionId)), msgText(ctx, 'MSG-02')) : null
        ].filter(Boolean) : [],
        testid: 'history-row-' + (r.versionId || 'initial')
      };
    });
    var note = entity.type === 'process' ? h.processNote || null : (entity.type === 'activity' ? [h.processNote, h.activityNote].filter(Boolean).join(' ') || null : null);
    return {
      entity: entityRef(ctx, entity), entityId: entity.id, versionId: versionId,
      title: uiFmt(ctx, 'historyOf', { name: entity.name }),
      columns: asArray(h.columns),
      rows: rows,
      note: note, processNote: entity.type === 'process' || entity.type === 'activity' ? h.processNote || null : null, activityNote: entity.type === 'activity' ? h.activityNote || null : null,
      notProvided: h.notProvided || missing(ctx), initialReference: h.initialReference || null,
      empty: rows.length ? null : ui(ctx, 'noData'),
      modelModifiedAtLabel: ui(ctx, 'modelModifiedAt'),
      testid: 'history-dialog'
    };
  }

  /* ---------- incidents (WEB-08) ---------- */

  function responsibleName(ctx, id) { var e = ctx.graph.entity(id); return e ? e.name : (id || missing(ctx)); }

  function fieldSpecs(spec, values, errors) {
    var fields = (spec && spec.fields) || {};
    return Object.keys(fields).map(function (id) { var f = fields[id]; return Object.assign({ id: id }, f, { value: values ? values[id] : undefined, error: errors ? errors[id] || null : null }); });
  }

  function sIncidentsModel(ctx) {
    var w = web(ctx);
    var t = tracking(ctx);
    var inc = w.incidents || { filter: 'all', query: '', sort: null, form: null, selectionId: null };
    var processId = w.processId || t.processId || ctx.pack.defaultProcessId;
    var process = ctx.graph.entity(processId);
    var viewCheck = can(ctx, 'viewTracking', { processId: processId });
    if (!viewCheck.ok) return { permitted: false, restricted: true, notice: viewCheck, title: t.incidentsTitle || null, rows: [], filters: [], actions: {} };
    var trackCheck = can(ctx, 'trackProcess', { processId: processId });
    var canTrack = trackCheck.ok;
    var reason = canTrack ? null : ((t.texts && t.texts.trackingPermissionRequired) || trackCheck.reason || trackCheck.text);
    var all = asArray(demo(ctx).incidents).filter(function (i) { return !processId || i.processId === processId; }).map(function (i) {
      var notice = incidentNotice(ctx, i);
      return Object.assign({}, i, {
        processName: process ? process.name : i.processId, responsibleName: responsibleName(ctx, i.responsibleId), responsible: refById(ctx, i.responsibleId),
        statusLabel: (t.incidentStatusLabels || {})[i.status] || i.status, notice: notice,
        dueDateText: ctx.format.date(i.dueDate), createdAtText: ctx.format.date(i.createdAt), closedAtText: i.closedAt ? ctx.format.date(i.closedAt) : missing(ctx),
        resolutionText: i.resolution || missing(ctx), gaps: refs(ctx, asArray(i.gapIds).map(function (id) { return ctx.graph.entity(id); }), false),
        selected: inc.selectionId === i.id, isOpen: i.status !== 'closed', testid: 'incident-' + i.id,
        command: { type: 'selectIncident', payload: { id: i.id } }
      });
    });
    function matchesFilter(i, f) {
      if (f === 'open') return i.status !== 'closed';
      if (f === 'closed') return i.status === 'closed';
      if (f === 'overdue') return i.notice.id === 'overdue';
      if (f === 'dueSoon') return i.notice.id === 'dueSoon';
      return true;
    }
    var q = ctx.format.normalize(inc.query || '');
    var filtered = all.filter(function (i) { return matchesFilter(i, inc.filter || 'all') && (!q || ctx.format.normalize(i.subject).indexOf(q) !== -1 || ctx.format.normalize(i.id).indexOf(q) !== -1); });
    var sort = inc.sort || (w.tableSort && w.tableSort.incidents) || null;
    if (sort && sort.column) {
      var dir = sort.direction === 'desc' ? -1 : 1;
      var col = sort.column;
      filtered.sort(function (a, b) {
        var va, vb;
        switch (col) {
          case 'id': va = a.id; vb = b.id; break;
          case 'subject': va = a.subject; vb = b.subject; break;
          case 'process': va = a.processName; vb = b.processName; break;
          case 'responsible': va = a.responsibleName; vb = b.responsibleName; break;
          case 'status': va = a.statusLabel; vb = b.statusLabel; break;
          case 'dueDate': return dir * ctx.format.compareDates(a.dueDate, b.dueDate);
          case 'createdAt': return dir * ctx.format.compareDates(a.createdAt, b.createdAt);
          case 'notice': va = NOTICE_RANK[a.notice.id]; vb = NOTICE_RANK[b.notice.id]; return dir * (va - vb) || ctx.format.compareDates(a.dueDate, b.dueDate);
          default: va = a[col]; vb = b[col];
        }
        return dir * ctx.format.compare(va, vb);
      });
    } else {
      filtered.sort(function (a, b) {
        var ra = NOTICE_RANK[a.notice.id], rb = NOTICE_RANK[b.notice.id];
        if (ra !== rb) return ra - rb;
        var d = ctx.format.compareDates(a.dueDate, b.dueDate);
        return d !== 0 ? d : ctx.format.compare(a.id, b.id);
      });
    }
    var selected = all.filter(function (i) { return i.id === inc.selectionId; })[0] || null;
    var form = inc.form ? Object.assign({}, inc.form, { fields: fieldSpecs(t.incidentForm, inc.form.values, inc.form.errors), processName: process ? process.name : processId, testid: 'incident-form' }) : null;
    var columnsIds = ['id', 'subject', 'process', 'responsible', 'status', 'dueDate', 'notice'];
    return {
      permitted: true,
      title: t.incidentsTitle || null, badge: t.badge || null, dateLabel: t.dateLabel || null,
      process: entityRef(ctx, process), processId: processId,
      columns: asArray(t.incidentColumns).map(function (label, i) { return { id: columnsIds[i] || String(i), label: label, sortable: true }; }),
      filters: asArray(t.incidentFilters).map(function (f) { return { id: f.id, label: f.label, selected: (inc.filter || 'all') === f.id, count: all.filter(function (i) { return matchesFilter(i, f.id); }).length, testid: 'incident-filter-' + f.id }; }),
      filter: inc.filter || 'all', query: inc.query || '', searchPlaceholder: (t.texts && t.texts.searchPlaceholder) || ui(ctx, 'searchPlaceholder'),
      sort: sort, rows: filtered, total: all.length, count: filtered.length, countText: uiFmt(ctx, 'results', { n: filtered.length }),
      selectedId: selected ? selected.id : null, selected: selected,
      canTrack: canTrack, permissionReason: reason,
      actions: {
        create: action('incident-new', (t.texts && t.texts.newIncident) || ui(ctx, 'create'), { type: 'openForm', payload: { formId: 'incident', mode: 'create' } }, canTrack, reason),
        edit: action('incident-edit', (t.texts && t.texts.editIncident) || ui(ctx, 'edit'), selected ? { type: 'openForm', payload: { formId: 'incident', mode: 'edit', recordId: selected.id } } : null, canTrack && !!selected && selected.status !== 'closed', canTrack ? null : reason),
        close: action('incident-close', (t.texts && t.texts.closeIncident) || ui(ctx, 'close'), selected ? { type: 'openForm', payload: { formId: 'incident', mode: 'close', recordId: selected.id } } : null, canTrack && !!selected && selected.status !== 'closed', canTrack ? null : reason)
      },
      form: form,
      responsibleOptions: asArray(t.responsibleOptions).map(function (id) { return { value: id, label: responsibleName(ctx, id) }; }),
      statusOptions: asArray(t.incidentEditableStatuses).map(function (s) { return { value: s, label: (t.incidentStatusLabels || {})[s] || s }; }),
      statusLabels: t.incidentStatusLabels || {}, noticeLabels: t.noticeLabels || {},
      texts: t.texts || {},
      empty: filtered.length ? null : (all.length ? { text: ui(ctx, 'noMatches'), action: { label: ui(ctx, 'clearFilters'), command: { type: 'setIncidentFilter', payload: { filterId: 'all' } }, secondary: { type: 'setIncidentQuery', payload: { query: '' } } } } : { text: ui(ctx, 'noData'), action: null }),
      cancelLabel: ui(ctx, 'cancel'), saveLabel: ui(ctx, 'save'), discardChanges: ui(ctx, 'discardChanges')
    };
  }

  /* ---------- projects (WEB-09) ---------- */

  function sessionsOf(ctx) { return (ctx.state.desktop && ctx.state.desktop.sessions) || {}; }

  function pendingReview(ctx) {
    var sessions = sessionsOf(ctx);
    return Object.keys(sessions).some(function (id) { var r = sessions[id] && sessions[id].review; return !!(r && r.state === 'pending'); });
  }

  function scenarioPreconditions(ctx, scenario, projectId) {
    var reasons = [];
    asArray(scenario && scenario.preconditions).forEach(function (pc) {
      var ok = true;
      if (pc.check === 'profileRole') ok = role(ctx) === pc.value;
      else if (pc.check === 'versionExists') ok = !!getVersion(ctx, pc.value);
      else if (pc.check === 'versionAbsent') ok = !getVersion(ctx, pc.value);
      else if (pc.check === 'projectExists') ok = asArray(demo(ctx).projects).some(function (p) { return p.id === (projectId || pc.value); });
      else if (pc.check === 'noPendingReview') ok = !pendingReview(ctx);
      if (!ok) reasons.push({ check: pc.check, value: pc.value || null, text: pc.message || (pc.check === 'profileRole' ? msgText(ctx, 'MSG-03') : ui(ctx, 'noData')), cta: pc.cta || null });
    });
    return reasons;
  }

  function sProjectsModel(ctx) {
    var w = web(ctx);
    var t = tracking(ctx);
    var pj = w.projects || { selectionId: null, form: null };
    var processId = w.processId || t.processId || ctx.pack.defaultProcessId;
    var process = ctx.graph.entity(processId);
    var viewCheck = can(ctx, 'viewTracking', { processId: processId });
    if (!viewCheck.ok) return { permitted: false, restricted: true, notice: viewCheck, title: t.projectsTitle || null, projects: [], actions: {} };
    var trackCheck = can(ctx, 'trackProcess', { processId: processId });
    var canTrack = trackCheck.ok;
    var reason = canTrack ? null : ((t.texts && t.texts.trackingPermissionRequired) || trackCheck.reason || trackCheck.text);
    var isAdmin = role(ctx) === 'admin';
    var scenario = null;
    ctx.pack.scenarios.forEach(function (sc) { if (sc.projectId && !scenario) scenario = sc; });
    var versionOptions = visibleVersions(ctx, processId).filter(function (v) { return v.type === 'TO-BE' && (v.state === 'proposed' || v.state === 'published-demo'); }).map(function (v) { return Object.assign(versionRef(ctx, v), { value: v.id }); });
    var list = asArray(demo(ctx).projects).filter(function (p) { return !processId || p.processId === processId; }).map(function (p) {
      var target = getVersion(ctx, p.targetVersionId);
      return Object.assign({}, p, {
        processName: process ? process.name : p.processId, responsibleName: responsibleName(ctx, p.responsibleId), responsible: refById(ctx, p.responsibleId),
        statusLabel: (t.projectStatusLabels || {})[p.status] || p.status,
        targetVersion: target && canSee(ctx, target.id) ? versionRef(ctx, target) : null, targetVersionLabel: target ? (canSee(ctx, target.id) ? target.label || target.id : msgText(ctx, 'MSG-02')) : missing(ctx),
        gaps: refs(ctx, asArray(p.gapIds).map(function (id) { return ctx.graph.entity(id); }), false),
        startDateText: ctx.format.date(p.startDate), dueDateText: ctx.format.date(p.dueDate), closedAtText: p.closedAt ? ctx.format.date(p.closedAt) : missing(ctx),
        resultText: p.result || missing(ctx), backingReferenceText: p.backingReference || missing(ctx),
        commitments: asArray(p.commitments), followUp: asArray(p.followUp),
        selected: pj.selectionId === p.id, isScenarioProject: !!(scenario && scenario.projectId === p.id), testid: 'project-' + p.id,
        command: { type: 'selectProject', payload: { id: p.id } }
      });
    });
    var selected = list.filter(function (p) { return p.id === pj.selectionId; })[0] || null;
    var sectionTitles = asArray(t.projectSections);
    var detail = selected ? {
      project: selected,
      sections: [
        { id: 'reason', title: sectionTitles[0] || ui(ctx, 'reason'), kind: 'gaps', gaps: selected.gaps, note: selected.note || null },
        { id: 'responsible', title: sectionTitles[1] || ui(ctx, 'responsible'), kind: 'text', text: selected.responsibleName, note: selected.responsibleNote || null, entity: selected.responsible },
        { id: 'dates', title: sectionTitles[2] || ui(ctx, 'dates'), kind: 'facts', facts: [fact(ui(ctx, 'start'), selected.startDateText), fact(ui(ctx, 'dueDate'), selected.dueDateText), fact(ui(ctx, 'closed'), selected.closedAtText)] },
        { id: 'status', title: sectionTitles[3] || ui(ctx, 'status'), kind: 'text', text: selected.statusLabel, status: selected.status },
        { id: 'targetVersion', title: sectionTitles[4] || ui(ctx, 'targetVersion'), kind: 'version', version: selected.targetVersion, text: selected.targetVersionLabel },
        { id: 'commitments', title: sectionTitles[5] || ui(ctx, 'commitments'), kind: 'commitments', items: selected.commitments },
        { id: 'backing', title: sectionTitles[6] || ui(ctx, 'backingReference'), kind: 'text', text: selected.backingReferenceText, result: selected.resultText, note: (t.texts && t.texts.backingNote) || null },
        { id: 'followUp', title: sectionTitles[7] || ui(ctx, 'followUp'), kind: 'followUp', items: selected.followUp, empty: selected.followUp.length ? null : ui(ctx, 'noData') }
      ]
    } : null;
    var prepareReasons = selected && scenario ? scenarioPreconditions(ctx, scenario, selected.id) : [];
    var prepareOk = !!selected && isAdmin && selected.status === 'concluded' && !!selected.backingReference && !prepareReasons.some(function (r) { return r.check !== 'projectExists'; });
    var prepareReason = null;
    if (selected && !prepareOk) {
      if (!isAdmin) prepareReason = msgText(ctx, 'MSG-03');
      else if (selected.status !== 'concluded' || !selected.backingReference) prepareReason = (t.texts && t.texts.closeHint) || null;
      else prepareReason = prepareReasons.length ? prepareReasons[0].text : null;
    }
    var simulateReasons = selected && scenario && scenario.projectId === selected.id ? scenarioPreconditions(ctx, scenario, selected.id) : null;
    var simulateOk = !!simulateReasons && simulateReasons.length === 0 && selected.status !== 'concluded';
    var navPayload = selected && t.prepareAsIsTarget ? { type: 'navigateTo', payload: { target: { tab: t.prepareAsIsTarget.tab, desktop: Object.assign({}, t.prepareAsIsTarget.desktop || {}, { projectId: selected.id }) } } } : null;
    var form = pj.form ? Object.assign({}, pj.form, { fields: fieldSpecs(t.projectForm, pj.form.values, pj.form.errors), processName: process ? process.name : processId, closeConfirm: (t.texts && t.texts.closeConfirm) || null, versionOptions: versionOptions, testid: 'project-form' }) : null;
    return {
      permitted: true,
      title: t.projectsTitle || null, badge: t.badge || null, dateLabel: t.dateLabel || null,
      process: entityRef(ctx, process), processId: processId,
      projects: list, selectedId: selected ? selected.id : null, selected: selected, detail: detail,
      canTrack: canTrack, isAdmin: isAdmin, permissionReason: reason,
      actions: {
        create: action('project-new', (t.texts && t.texts.newProject) || ui(ctx, 'create'), { type: 'openForm', payload: { formId: 'project', mode: 'create' } }, canTrack, reason),
        start: action('project-start', (t.texts && t.texts.startProject) || ui(ctx, 'start'), selected ? { type: 'startProject', payload: { id: selected.id } } : null, canTrack && !!selected && selected.status === 'planned', canTrack ? null : reason),
        edit: action('project-edit', (t.texts && t.texts.editProject) || ui(ctx, 'edit'), selected ? { type: 'openForm', payload: { formId: 'project', mode: 'edit', recordId: selected.id } } : null, canTrack && !!selected && selected.status !== 'concluded', canTrack ? null : reason),
        close: action('project-close', (t.texts && t.texts.closeProject) || ui(ctx, 'close'), selected ? { type: 'openForm', payload: { formId: 'project', mode: 'close', recordId: selected.id } } : null, canTrack && !!selected && selected.status !== 'concluded', canTrack ? null : reason),
        prepareAsIs: action('project-prepare-asis', (t.texts && t.texts.prepareAsIs) || ui(ctx, 'continue'), navPayload, prepareOk, prepareReason),
        simulateClose: selected && simulateReasons ? action('project-simulate-close', (t.texts && t.texts.simulateClose) || ui(ctx, 'continue'), navPayload, simulateOk, simulateOk ? null : (selected.status === 'concluded' ? (t.texts && t.texts.prepareAsIs) || null : (simulateReasons.length ? simulateReasons[0].text : null))) : null
      },
      prepareNotes: { closeHint: (t.texts && t.texts.closeHint) || null, backingNote: (t.texts && t.texts.backingNote) || null, publishNote: (t.texts && t.texts.publishNote) || null },
      form: form,
      responsibleOptions: asArray(t.projectResponsibleOptions).map(function (id) { return { value: id, label: responsibleName(ctx, id) }; }),
      statusOptions: asArray(t.projectEditableStatuses).map(function (s) { return { value: s, label: (t.projectStatusLabels || {})[s] || s }; }),
      versionOptions: versionOptions,
      statusLabels: t.projectStatusLabels || {},
      texts: t.texts || {},
      empty: list.length ? null : { text: ui(ctx, 'noData') },
      cancelLabel: ui(ctx, 'cancel'), saveLabel: ui(ctx, 'save'), discardChanges: ui(ctx, 'discardChanges')
    };
  }

  /* ---------- security (WEB-10) ---------- */

  function sSecurityModel(ctx) {
    var w = web(ctx);
    var s = security(ctx);
    var sec = w.security || { view: 'accounts', selectionId: null, form: null };
    var check = can(ctx, 'viewSecurity');
    if (!check.ok) return { permitted: false, restricted: s.restricted || check.text, notice: check, title: s.title || null, accounts: [], audit: [] };
    var accounts = asArray(demo(ctx).accounts);
    var activeAdmins = accounts.filter(function (a) { return a.role === 'admin' && a.status === 'active' && !a.deleted; });
    var manageOk = can(ctx, 'manageAccounts').ok;
    var rows = accounts.filter(function (a) { return !a.deleted; }).map(function (a) {
      var position = a.positionId ? ctx.graph.entity(a.positionId) : null;
      var lastActiveAdmin = a.role === 'admin' && a.status === 'active' && activeAdmins.length === 1;
      var lastReason = lastActiveAdmin ? msgText(ctx, 'MSG-08') : null;
      return {
        id: a.id, username: a.username, role: a.role, roleLabel: (s.roleLabels || {})[a.role] || a.role,
        positionId: a.positionId || null, positionName: position ? position.name : ((s.form && s.form.fields && s.form.fields.position && s.form.fields.position.unassigned) || ui(ctx, 'unassigned')), position: entityRef(ctx, position),
        status: a.status, statusLabel: (s.statusLabels || {})[a.status] || a.status, active: a.status === 'active', isTest: !!a.isTest, lastActiveAdmin: lastActiveAdmin,
        selected: sec.selectionId === a.id, testid: 'account-' + a.id, command: { type: 'selectAccount', payload: { id: a.id } },
        actions: {
          edit: action('account-edit', (s.actions && s.actions.edit) || ui(ctx, 'edit'), { type: 'openForm', payload: { formId: 'account', mode: 'edit', recordId: a.id } }, manageOk, manageOk ? null : check.text),
          deactivate: action('account-deactivate', (s.actions && s.actions.deactivate) || ui(ctx, 'deactivate'), { type: 'deactivateDemoUser', payload: { id: a.id } }, manageOk && a.status === 'active' && !lastActiveAdmin, lastReason),
          'delete': action('account-delete', (s.actions && s.actions['delete']) || ui(ctx, 'delete'), { type: 'deleteDemoUser', payload: { id: a.id } }, manageOk && !!a.isTest && !lastActiveAdmin, lastReason)
        },
        confirmTexts: { deactivate: s.deactivateConfirm || null, 'delete': s.deleteConfirm || null }
      };
    });
    var profiles = ctx.pack.profiles;
    var audit = asArray(demo(ctx).log).map(function (entry) {
      var profile = profiles.get(entry.profileId);
      return { seq: entry.seq, at: entry.at, atText: ctx.format.dateTime(entry.at), profileId: entry.profileId, profileLabel: profile ? profile.label : entry.profileId, action: entry.action, result: entry.result || null, testid: 'audit-row-' + entry.seq };
    });
    var positionOptions = [{ value: null, label: (s.form && s.form.fields && s.form.fields.position && s.form.fields.position.unassigned) || ui(ctx, 'unassigned') }].concat(ctx.graph.ofType('position').filter(function (p) { return visible(ctx, p.id); }).map(function (p) { var area = ctx.graph.positionArea(p.id); return { value: p.id, label: p.name + (area ? ' · ' + area.name : ''), areaId: area ? area.id : null }; }));
    var form = sec.form ? Object.assign({}, sec.form, { fields: fieldSpecs(s.form, sec.form.values, sec.form.errors), testid: 'account-form' }) : null;
    return {
      permitted: true,
      title: s.title || null, intro: s.intro || null, note: s.note || null, credentialNote: s.credentialNote || null,
      views: asArray(s.views).map(function (v) { return { id: v.id, label: v.label, selected: (sec.view || 'accounts') === v.id }; }),
      view: sec.view || 'accounts',
      accountColumns: asArray(s.accountColumns), auditColumns: asArray(s.auditColumns),
      accounts: rows, selectedId: sec.selectionId || null, selected: rows.filter(function (r) { return r.id === sec.selectionId; })[0] || null,
      audit: audit, auditEmpty: audit.length ? null : s.auditEmpty || null,
      activeAdminCount: activeAdmins.length,
      canManage: manageOk,
      actions: { create: action('account-new', (s.actions && s.actions.create) || ui(ctx, 'create'), { type: 'openForm', payload: { formId: 'account', mode: 'create' } }, manageOk, check.text) },
      form: form,
      positionOptions: positionOptions,
      roleOptions: ['admin', 'manager', 'employee'].map(function (r) { return { value: r, label: (s.roleLabels || {})[r] || r }; }),
      roleLabels: s.roleLabels || {}, statusLabels: s.statusLabels || {},
      texts: { deleteConfirm: s.deleteConfirm || null, deactivateConfirm: s.deactivateConfirm || null, lastAdmin: msgText(ctx, 'MSG-08'), duplicate: msgText(ctx, 'MSG-07') },
      cancelLabel: ui(ctx, 'cancel'), saveLabel: ui(ctx, 'save'), discardChanges: ui(ctx, 'discardChanges')
    };
  }

  /* ---------- search (§14.2) ---------- */

  function sSearchResults(ctx) {
    var w = web(ctx);
    var s = w.search || { query: '', types: [], includeVersions: false, open: false };
    var query = s.query || '';
    var vis = visibleSet(ctx);
    var allowed = vis;
    if (w.areaFilter && visible(ctx, w.areaFilter)) {
      var inside = new Set(ctx.graph.areaTraversal(w.areaFilter).entityIds);
      allowed = new Set(Array.from(inside).filter(function (id) { return !vis || vis.has(id); }));
    }
    var versions = s.includeVersions ? ctx.permissions.allVersions(ctx.state).filter(function (v) { return canSee(ctx, v.id) && visible(ctx, v.processId); }) : [];
    var raw = query.trim() ? ctx.graph.search(query, { entityIds: allowed, types: asArray(s.types).length ? asArray(s.types) : null, includeVersions: !!s.includeVersions, versions: versions }) : [];
    var results = raw.filter(function (r) { return !r.entity || layerOn(ctx, r.entity.type); }).map(function (r) {
      if (r.version) return { id: r.version.id, kind: 'version', type: 'version', typeLabel: packCore.typeLabel('version'), icon: packCore.typeIcon('version'), name: r.version.label || r.version.id, versionId: r.version.id, processId: r.version.processId, score: r.score, matchedOn: r.matchedOn, command: { type: 'enterProcess', payload: { processId: r.version.processId, view: 'flow', versionId: r.version.id } }, testid: 'node-' + r.version.id };
      var vid = r.entity.type === 'activity' ? (function () { var v = versionForActivity(ctx, r.entity, null); return v ? v.id : null; })() : null;
      return { id: r.entity.id, kind: 'entity', type: r.entity.type, typeLabel: packCore.typeLabel(r.entity.type), icon: packCore.typeIcon(r.entity.type), name: r.entity.name, versionId: vid, score: r.score, matchedOn: r.matchedOn, entity: entityRef(ctx, r.entity), command: { type: 'selectEntity', payload: vid ? { entityId: r.entity.id, versionId: vid } : { entityId: r.entity.id } }, testid: 'node-' + r.entity.id };
    });
    var typeOptions = Object.keys(packCore.ENTITY_TYPES).filter(function (t) { return ['incident', 'project', 'decision', 'event', 'start', 'end'].indexOf(t) === -1 && (t === 'version' || ctx.graph.ofType(t).some(function (e) { return visible(ctx, e.id); })); }).map(function (t) { return { id: t, label: packCore.typePlural(t), selected: asArray(s.types).indexOf(t) !== -1 }; });
    return {
      query: query, open: !!s.open, types: asArray(s.types), includeVersions: !!s.includeVersions,
      results: results, count: results.length, text: uiFmt(ctx, 'results', { n: results.length }),
      label: ui(ctx, 'search'), placeholder: ui(ctx, 'searchPlaceholder'), clearLabel: ui(ctx, 'clearSearch'), resultsLabel: ui(ctx, 'searchResultsLabel'),
      includeVersionsLabel: ui(ctx, 'searchIncludeVersions'), typesLabel: ui(ctx, 'searchTypes'), typeOptions: typeOptions,
      areaFilter: w.areaFilter || null,
      empty: query.trim() && !results.length ? { text: ui(ctx, 'noMatches'), action: { label: ui(ctx, 'clearFilters'), command: { type: 'clearFilters', payload: {} } } } : null,
      clearCommand: { type: 'clearSearch', payload: {} }
    };
  }

  /* ---------- unsaved work ---------- */

  function sHasUnsavedWork(ctx) {
    var d = demo(ctx);
    var w = web(ctx);
    if (d.staging && Object.keys(d.staging).length) return true;
    if (d.versions && Object.keys(d.versions).length) return true;
    if (asArray(d.log).length) return true;
    var sessions = sessionsOf(ctx);
    var dirtySession = Object.keys(sessions).some(function (id) {
      var s = sessions[id] || {};
      if (s.draft && String(s.draft).trim()) return true;
      if (asArray(s.events).length) return true;
      if (s.review && (s.review.state === 'pending' || s.review.state === 'canceled')) return true;
      if (s.form && s.form.dirty) return true;
      if (s.playback && s.playback.status && s.playback.status !== 'idle') return true;
      return false;
    });
    if (dirtySession) return true;
    var forms = [w.incidents && w.incidents.form, w.projects && w.projects.form, w.security && w.security.form];
    if (forms.some(function (f) { return f && f.dirty; })) return true;
    var t = tracking(ctx);
    var s = security(ctx);
    function differs(current, original) {
      try { return JSON.stringify(asArray(current)) !== JSON.stringify(asArray(original)); } catch (e) { return true; }
    }
    if (differs(d.incidents, t.incidents) || differs(d.projects, t.projects) || differs(d.accounts, s.accounts)) return true;
    if (d.currentAsIsVersionId && ctx.pack.currentAsIsVersionId && d.currentAsIsVersionId !== ctx.pack.currentAsIsVersionId) return true;
    return false;
  }

  /* ---------- overlays ---------- */

  function sDocumentContentModel(ctx, entityIdArg) {
    var w = web(ctx);
    var entityId = entityIdArg || (w.overlay ? w.overlay.entityId : null);
    var entity = entityId ? ctx.graph.entity(entityId) : null;
    if (!entity) return null;
    if (!visible(ctx, entity.id)) return { entity: entityRef(ctx, entity), restricted: true, notice: can(ctx, 'viewEntity', { entityId: entity.id }) };
    var a = entity.attributes || {};
    if (entity.type === 'policy') {
      var sigPos = a.signaturePositionId ? ctx.graph.entity(a.signaturePositionId) : null;
      return { kind: 'policy', entity: entityRef(ctx, entity), title: entity.name, dateLabel: a.dateLabel || (a.date ? ctx.format.date(a.date) : missing(ctx)), date: a.date || null, body: asArray(a.body), commitments: asArray(a.commitments), closing: asArray(a.closing), signature: a.signature || null, signatureNote: a.signatureNote || null, signaturePosition: sigPos && visible(ctx, sigPos.id) ? entityRef(ctx, sigPos) : null, fileMessage: a.hasFile ? null : (a.fileMessage || msgText(ctx, 'MSG-18')), provenance: provenanceOf(ctx, entity), closeLabel: ui(ctx, 'close') };
    }
    var ref = a.contentRef && a.contentRef !== entity.id ? ctx.graph.entity(a.contentRef) : null;
    if (ref && ref.type === 'policy') return sDocumentContentModel(ctx, ref.id);
    return { kind: 'document', entity: entityRef(ctx, entity), title: entity.name, text: a.text || entity.description || missing(ctx), paragraphs: asArray(a.paragraphs).length ? asArray(a.paragraphs) : [a.text || entity.description || missing(ctx)], fileMessage: a.hasFile ? null : (a.fileMessage || msgText(ctx, 'MSG-18')), links: a.links || null, provenance: provenanceOf(ctx, entity), closeLabel: ui(ctx, 'close') };
  }

  function sSourcesModel(ctx, entityIdArg, versionIdArg) {
    var w = web(ctx);
    var o = w.overlay || {};
    var entityId = entityIdArg || o.entityId || (w.selection ? w.selection.entityId : null);
    var versionId = versionIdArg || o.versionId || null;
    var entity = entityId ? ctx.graph.entity(entityId) : null;
    var version = versionId ? getVersion(ctx, versionId) : null;
    if (version && !canSee(ctx, version.id)) return { restricted: true, notice: can(ctx, 'viewVersion', { versionId: version.id }) };
    if (entity && !visible(ctx, entity.id)) return { restricted: true, notice: can(ctx, 'viewEntity', { entityId: entity.id }) };
    var name = entity ? entity.name : (version ? (version.label || version.id) : (function () { var node = version ? ctx.graph.flowNode(ctx.graph.flowForVersion(version, demoVersions(ctx)), entityId) : null; return node ? node.label || node.id : entityId; })());
    if (!entity && version && entityId && !ctx.graph.has(entityId)) { var node = ctx.graph.flowNode(ctx.graph.flowForVersion(version, demoVersions(ctx)), entityId); if (node) name = node.label || node.id; }
    var prov = entity ? provenanceOf(ctx, entity, version ? version.sourceIds : null) : { labels: [], confidence: null, confidenceLabel: null, dataState: null, observedAt: null, observedAtText: missing(ctx), isDemo: !!(version && version.isDemo), sourceIds: asArray(version && version.sourceIds), sources: ctx.graph.sourceRefs(version && version.sourceIds), label: ui(ctx, 'sources') };
    return { entity: entityRef(ctx, entity), version: versionRef(ctx, version), title: uiFmt(ctx, 'sourcesOf', { name: name }), provenance: prov, sources: prov.sources.map(function (s) { var src = ctx.pack.sources.get(s.id); return Object.assign({}, s, { modelModifiedAt: src && src.modelModifiedAt ? src.modelModifiedAt : null, modelModifiedAtText: src && src.modelModifiedAt ? ctx.format.dateTime(src.modelModifiedAt) : null, modelModifiedAtLabel: ui(ctx, 'modelModifiedAt'), note: src ? src.note || null : null, date: src && src.date ? src.date : null, dateText: src && src.date ? ctx.format.date(src.date) : null }); }), closeLabel: ui(ctx, 'close') };
  }

  function sOverlayModel(ctx) {
    var o = web(ctx).overlay;
    if (!o || !o.kind) return null;
    var base = { kind: o.kind, entityId: o.entityId || null, versionId: o.versionId || null, closeLabel: ui(ctx, 'close'), closeCommand: { type: 'closeOverlay', payload: {} } };
    if (o.kind === 'history') return Object.assign(base, { model: sHistoryModel(ctx, o.entityId, o.versionId), testid: 'history-dialog' });
    if (o.kind === 'document' || o.kind === 'policy') return Object.assign(base, { model: sDocumentContentModel(ctx, o.entityId) });
    if (o.kind === 'sources') return Object.assign(base, { model: sSourcesModel(ctx, o.entityId, o.versionId) });
    if (o.kind === 'version') { var v = getVersion(ctx, o.versionId); return Object.assign(base, { model: v && canSee(ctx, v.id) ? sFlowModel(ctx, v.id) : null }); }
    if (o.kind === 'connections') { var e = o.entityId ? ctx.graph.entity(o.entityId) : null; return Object.assign(base, { model: e && visible(ctx, e.id) ? relatedGroups(ctx, e, o.versionId ? getVersion(ctx, o.versionId) : null) : null }); }
    return base;
  }

  /* ---------- desktop delegation ---------- */

  function desktopDelegate(name) {
    return function (ctx) {
      var args = Array.prototype.slice.call(arguments, 1);
      var mod;
      try { mod = require('core/scenarios'); } catch (e) { return null; }
      var fn = (mod && mod.selectors && mod.selectors[name]) || (mod && mod[name]);
      if (typeof fn !== 'function') return null;
      return fn.apply(null, [ctx].concat(args));
    };
  }

  var selectors = {
    visibleIds: sVisibleIds,
    entityVisible: sEntityVisible,
    profile: sProfile,
    can: sCan,
    currentContext: sCurrentContext,
    breadcrumbs: sBreadcrumbs,
    inspectorModel: sInspectorModel,
    orgChartModel: sOrgChartModel,
    processMapModel: sProcessMapModel,
    relationsModel: sRelationsModel,
    areaSpaceModel: sAreaSpaceModel,
    processSheetModel: sProcessSheetModel,
    flowModel: sFlowModel,
    instructionModel: sInstructionModel,
    compareModel: sCompareModel,
    historyModel: sHistoryModel,
    incidentsModel: sIncidentsModel,
    projectsModel: sProjectsModel,
    securityModel: sSecurityModel,
    searchResults: sSearchResults,
    hasUnsavedWork: sHasUnsavedWork,
    highlightModel: highlightModel,
    documentContentModel: sDocumentContentModel,
    sourcesModel: sSourcesModel,
    overlayModel: sOverlayModel,
    desktopModel: desktopDelegate('desktopModel'),
    scenarioAvailability: desktopDelegate('scenarioAvailability'),
    operationsRows: desktopDelegate('operationsRows'),
    artifactPreview: desktopDelegate('artifactPreview')
  };

  return { selectors: selectors, UI_FALLBACKS: UI_FALLBACKS, helpers: { entityRef: entityRef, versionRef: versionRef, incidentNotice: incidentNotice, badges: badges, provenanceOf: provenanceOf, ui: ui } };
});
