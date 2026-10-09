/* core/graph — typed traversals and derived projections over the resolved pack
 * (CONTRACTS §5.4; traversal policies of spec §9.1; SIPOC/RACI of WEB-03; history of
 * WEB-07; search of §14.2; counts of §16.1).
 *
 * Pure: results are plain objects/arrays of ids, entities or versions; never DOM.
 * Visibility filtering is NOT done here (core/permissions and core/selectors wrap it).
 * Version arguments accept either a version id (resolved against the pack) or a version
 * object (pack or demo-created, with its resolved `activities` snapshot). */
Primus.module('core/graph', function (require) {
  'use strict';

  var packCore = require('core/pack');

  function unique(list) {
    var seen = new Set();
    var out = [];
    (list || []).forEach(function (item) {
      if (item === null || item === undefined) return;
      var key = typeof item === 'object' ? (item.id !== undefined ? 'id:' + item.id : item) : item;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
    return out;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.slice();
    if (value === null || value === undefined) return [];
    return [value];
  }

  /* Reads an activity attribute tolerating both snapshot shapes: the pack entity
   * ({ attributes: {...} }) and a derived clone that may hoist fields to the top level. */
  function attr(activity, name) {
    if (!activity) return undefined;
    if (activity.attributes && activity.attributes[name] !== undefined) return activity.attributes[name];
    return activity[name];
  }

  function activityKey(activity) {
    if (!activity) return null;
    return attr(activity, 'key') || activity.id || null;
  }

  function createGraph(pack) {
    var entities = pack.entities;
    var normalizeFn = null;

    function normalize(text) {
      if (!normalizeFn) {
        try { normalizeFn = require('core/format').normalize; } catch (e) { normalizeFn = function (v) { return String(v || '').toLowerCase().trim(); }; }
      }
      return normalizeFn(text);
    }

    /* ---------- basics ---------- */

    function entity(id) { return id === null || id === undefined ? undefined : entities.get(id); }
    function has(id) { return entities.has(id); }
    function type(id) { var e = entity(id); return e ? e.type : null; }

    function relationsFrom(id, relType) {
      var list = pack.relationsFrom.get(id) || [];
      return relType ? list.filter(function (r) { return r.type === relType; }) : list.slice();
    }

    function relationsTo(id, relType) {
      var list = pack.relationsTo.get(id) || [];
      return relType ? list.filter(function (r) { return r.type === relType; }) : list.slice();
    }

    function targets(id, relType) {
      return unique(relationsFrom(id, relType).map(function (r) { return entity(r.to); }));
    }

    function sourcesOf(id, relType) {
      return unique(relationsTo(id, relType).map(function (r) { return entity(r.from); }));
    }

    function packOrder(list) {
      var order = new Map();
      var i = 0;
      entities.forEach(function (e) { order.set(e.id, i++); });
      return list.slice().sort(function (a, b) {
        var oa = order.has(a.id) ? order.get(a.id) : Infinity;
        var ob = order.has(b.id) ? order.get(b.id) : Infinity;
        return oa - ob;
      });
    }

    function related(id, options) {
      var opts = options || {};
      var relTypes = opts.types ? asArray(opts.types) : null;
      var entityTypes = opts.entityTypes ? asArray(opts.entityTypes) : null;
      var out = [];
      relationsFrom(id).forEach(function (rel) {
        if (relTypes && relTypes.indexOf(rel.type) === -1) return;
        var target = entity(rel.to);
        if (!target || (entityTypes && entityTypes.indexOf(target.type) === -1)) return;
        out.push({ relation: rel, entity: target, direction: 'out', label: phrase(rel, 'out'), inferred: !!rel.inferred, note: rel.label || null });
      });
      relationsTo(id).forEach(function (rel) {
        if (relTypes && relTypes.indexOf(rel.type) === -1) return;
        var source = entity(rel.from);
        if (!source || (entityTypes && entityTypes.indexOf(source.type) === -1)) return;
        out.push({ relation: rel, entity: source, direction: 'in', label: phrase(rel, 'in'), inferred: !!rel.inferred, note: rel.label || null });
      });
      return out;
    }

    function phrase(rel, direction) {
      if (rel.type === 'gerenciaGeneral' && rel.label) return rel.label;
      return packCore.relationLabel(rel.type, direction);
    }

    function children(id) {
      var out = [];
      entities.forEach(function (e) { if (e.parentId === id) out.push(e); });
      return out;
    }

    function ofType(t) { return (pack.byType.get(t) || []).slice(); }

    function areas() { return ofType('area'); }

    /* ---------- structure ---------- */

    function areaPositions(areaId) {
      var list = ofType('position').filter(function (p) { return p.areaId === areaId || (p.attributes && p.attributes.areaId === areaId); });
      sourcesOf(areaId, 'perteneceA').forEach(function (p) { if (p.type === 'position') list.push(p); });
      return packOrder(unique(list));
    }

    function positionOccupants(positionId) {
      var list = sourcesOf(positionId, 'ocupa').concat(sourcesOf(positionId, 'prestaServicioComo'));
      entities.forEach(function (e) {
        if ((e.type === 'person' || e.type === 'externalProvider') && e.attributes && e.attributes.positionId === positionId) list.push(e);
      });
      return packOrder(unique(list));
    }

    function personPosition(personId) {
      var out = targets(personId, 'ocupa').concat(targets(personId, 'prestaServicioComo'));
      if (out.length) return out[0];
      var person = entity(personId);
      var positionId = person && person.attributes ? person.attributes.positionId : null;
      return positionId ? entity(positionId) : undefined;
    }

    function positionArea(positionId) {
      var position = entity(positionId);
      if (!position) return undefined;
      var byRelation = targets(positionId, 'perteneceA');
      if (byRelation.length) return byRelation[0];
      return position.areaId ? entity(position.areaId) : undefined;
    }

    function positionRoles(positionId) {
      var list = targets(positionId, 'desempeña');
      ofType('role').forEach(function (role) {
        var ids = (role.attributes && role.attributes.positionIds) || [];
        if (ids.indexOf(positionId) !== -1) list.push(role);
      });
      return packOrder(unique(list));
    }

    function rolePositions(roleId) {
      var list = sourcesOf(roleId, 'desempeña');
      var role = entity(roleId);
      var ids = (role && role.attributes && role.attributes.positionIds) || [];
      ids.forEach(function (id) { var p = entity(id); if (p) list.push(p); });
      return packOrder(unique(list));
    }

    function personRoles(personId) {
      var position = personPosition(personId);
      return position ? positionRoles(position.id) : [];
    }

    /* ---------- versions, flows, activities ---------- */

    function lookupDemoVersion(demoVersions, id) {
      if (!demoVersions || !id) return undefined;
      if (typeof demoVersions === 'function') return demoVersions(id);
      if (typeof demoVersions.get === 'function') return demoVersions.get(id);
      if (Array.isArray(demoVersions)) return demoVersions.filter(function (v) { return v && v.id === id; })[0];
      return demoVersions[id];
    }

    function resolveVersion(versionOrId, demoVersions) {
      if (!versionOrId) return undefined;
      if (typeof versionOrId === 'object') return versionOrId;
      return pack.versions.get(versionOrId) || lookupDemoVersion(demoVersions, versionOrId);
    }

    function processVersions(processId) {
      var out = [];
      pack.versions.forEach(function (v) { if (v.processId === processId) out.push(v); });
      return out;
    }

    function flowForVersion(versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version) return undefined;
      var flowId = version.flowId;
      if (!flowId && version.baseVersionId) {
        var base = resolveVersion(version.baseVersionId, demoVersions);
        flowId = base ? base.flowId : null;
      }
      return flowId ? pack.flows.get(flowId) : undefined;
    }

    function flowNodes(flow) { return flow && Array.isArray(flow.nodes) ? flow.nodes : []; }

    function flowNode(flow, nodeId) {
      return flowNodes(flow).filter(function (n) { return n.id === nodeId; })[0];
    }

    function versionActivities(versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version) return {};
      if (version.activities) return version.activities;
      return pack.baseActivities(version.id);
    }

    /* Activities of a version ordered like the flow's task nodes (fallback: snapshot order). */
    function versionActivityList(versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version) return [];
      var map = versionActivities(version, demoVersions);
      var flow = flowForVersion(version, demoVersions);
      var ordered = [];
      var used = new Set();
      flowNodes(flow).forEach(function (node) {
        if (node.kind === 'task' && map[node.id]) { ordered.push(map[node.id]); used.add(node.id); }
      });
      Object.keys(map).forEach(function (key) { if (!used.has(key)) ordered.push(map[key]); });
      return ordered;
    }

    function resolveActivity(versionOrId, key, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version || !key) return undefined;
      var map = version.activities || {};
      if (map[key]) return map[key];
      var base = version.baseVersionId ? resolveVersion(version.baseVersionId, demoVersions) : null;
      var fromBase = base ? resolveActivity(base, key, demoVersions) : pack.baseActivities(version.id)[key];
      if (!fromBase) return undefined;
      var override = version.activityOverrides ? version.activityOverrides[key] : null;
      if (!override) return fromBase;
      var copy = JSON.parse(JSON.stringify(fromBase));
      copy.attributes = Object.assign({}, copy.attributes || {}, JSON.parse(JSON.stringify(override)));
      return copy;
    }

    function roleIdsOf(activity) {
      var ids = asArray(attr(activity, 'roleIds'));
      var subtasks = asArray(attr(activity, 'subtasks'));
      subtasks.forEach(function (s) { if (s && s.roleId) ids.push(s.roleId); });
      var baseId = activity && activity.id;
      if (baseId) sourcesOf(baseId, 'ejecuta').forEach(function (r) { ids.push(r.id); });
      return unique(ids);
    }

    function systemIdsOf(activity) {
      var ids = asArray(attr(activity, 'systemIds'));
      if (activity && activity.id) targets(activity.id, 'usa').forEach(function (s) { ids.push(s.id); });
      return unique(ids);
    }

    function documentIdsOf(activity) {
      var docs = attr(activity, 'documentIds') || {};
      var requires = asArray(docs.requires);
      var produces = asArray(docs.produces);
      if (activity && activity.id) {
        targets(activity.id, 'requiere').forEach(function (d) { requires.push(d.id); });
        targets(activity.id, 'produce').forEach(function (d) { produces.push(d.id); });
      }
      return { requires: unique(requires), produces: unique(produces) };
    }

    function activityResources(activity) {
      var docs = documentIdsOf(activity);
      return {
        roles: roleIdsOf(activity).map(entity).filter(Boolean),
        systems: systemIdsOf(activity).map(entity).filter(Boolean),
        documents: {
          requires: docs.requires.map(entity).filter(Boolean),
          produces: docs.produces.map(entity).filter(Boolean)
        },
        actors: asArray(attr(activity, 'actorIds')).map(entity).filter(Boolean)
      };
    }

    function roleActivities(roleId, versionOrId, demoVersions) {
      return versionActivityList(versionOrId, demoVersions).filter(function (activity) {
        return roleIdsOf(activity).indexOf(roleId) !== -1;
      });
    }

    /* Base activity entities (any version) that use the given resource id. */
    function activitiesUsing(resourceId) {
      var list = sourcesOf(resourceId, 'usa').concat(sourcesOf(resourceId, 'requiere'), sourcesOf(resourceId, 'produce'));
      ofType('activity').forEach(function (activity) {
        var attrs = activity.attributes || {};
        var docs = attrs.documentIds || {};
        if (asArray(attrs.systemIds).indexOf(resourceId) !== -1 || asArray(docs.requires).indexOf(resourceId) !== -1 ||
            asArray(docs.produces).indexOf(resourceId) !== -1 || asArray(attrs.actorIds).indexOf(resourceId) !== -1) list.push(activity);
      });
      return packOrder(unique(list));
    }

    function activityVersionId(activity) { return attr(activity, 'versionId') || null; }

    function activityProcess(activity) {
      var version = resolveVersion(activityVersionId(activity));
      return version ? entity(version.processId) : undefined;
    }

    /* ---------- processes and areas ---------- */

    function areaProcesses(areaId) {
      var owned = packOrder(sourcesOf(areaId, 'tieneDueñoÁrea').filter(function (e) { return e.type === 'process'; }));
      var ownedIds = new Set(owned.map(function (p) { return p.id; }));
      var participating = packOrder(targets(areaId, 'participaEn').filter(function (e) { return e.type === 'process' && !ownedIds.has(e.id); }));
      return { owned: owned, participating: participating };
    }

    function processArea(processId) {
      return targets(processId, 'tieneDueñoÁrea')[0];
    }

    function processParticipants(processId) {
      return packOrder(sourcesOf(processId, 'participaEn').filter(function (e) { return e.type === 'area'; }));
    }

    function processMacroprocess(processId) {
      return targets(processId, 'agrupadoEn')[0];
    }

    function macroprocessProcesses(macroId) {
      return packOrder(sourcesOf(macroId, 'agrupadoEn'));
    }

    function processObjectives(processId) { return targets(processId, 'contribuyeA'); }
    function objectiveProcesses(objectiveId) { return packOrder(sourcesOf(objectiveId, 'contribuyeA')); }
    function objectiveIndicators(objectiveId) { return packOrder(sourcesOf(objectiveId, 'mide')); }
    function processGaps(processId) { return packOrder(sourcesOf(processId, 'afecta').filter(function (e) { return e.type === 'gap'; })); }
    function processPolicies(processId) { return packOrder(sourcesOf(processId, 'orienta')); }

    function processRoles(processId, versionOrId, demoVersions) {
      var ids = [];
      versionActivityList(versionOrId, demoVersions).forEach(function (a) { roleIdsOf(a).forEach(function (id) { ids.push(id); }); });
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version || version.processId !== processId) return [];
      return unique(ids).map(entity).filter(Boolean);
    }

    function processSystems(processId, versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version || version.processId !== processId) return [];
      var ids = [];
      versionActivityList(version, demoVersions).forEach(function (a) { systemIdsOf(a).forEach(function (id) { ids.push(id); }); });
      return unique(ids).map(entity).filter(Boolean);
    }

    function processDocuments(processId, versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      if (!version || version.processId !== processId) return [];
      var ids = [];
      versionActivityList(version, demoVersions).forEach(function (a) {
        var docs = documentIdsOf(a);
        docs.requires.concat(docs.produces).forEach(function (id) { ids.push(id); });
      });
      return unique(ids).map(entity).filter(Boolean);
    }

    /* ---------- SIPOC / RACI ---------- */

    function sipoc(processId) {
      var s = pack.views.sipoc || {};
      var rows = Array.isArray(s.rows) ? s.rows : [];
      var process = entity(processId);
      if (!process || !(process.attributes && process.attributes.detailed)) return [];
      return rows.map(function (row) { return Object.assign({}, row); });
    }

    function raci(processId, versionOrId, demoVersions) {
      var version = resolveVersion(versionOrId, demoVersions);
      var flow = version ? flowForVersion(version, demoVersions) : undefined;
      var raciViews = pack.views.raci || {};
      var columns = [];
      if (flow && Array.isArray(flow.lanes)) {
        flow.lanes.forEach(function (lane) { var role = entity(lane.roleId); if (role) columns.push(role); });
      }
      if (!columns.length) columns = ofType('role');
      columns = unique(columns);
      var rows = [];
      if (version && version.processId === processId) {
        versionActivityList(version, demoVersions).forEach(function (activity) {
          var executors = roleIdsOf(activity);
          var cells = {};
          columns.forEach(function (role) { cells[role.id] = executors.indexOf(role.id) !== -1 ? 'R' : null; });
          rows.push({ activity: activity, key: activityKey(activity), cells: cells });
        });
      }
      return { columns: columns, rows: rows, note: raciViews.note || null, missing: raciViews.missing || null };
    }

    /* ---------- traversals (spec §9.1, ux.md §4) ---------- */

    function collector() {
      var ids = [];
      var seen = new Set();
      var relIds = [];
      var relSeen = new Set();
      return {
        add: function (id) { if (id && !seen.has(id) && has(id)) { seen.add(id); ids.push(id); } },
        addRel: function (rel) { if (rel && rel.id && !relSeen.has(rel.id)) { relSeen.add(rel.id); relIds.push(rel.id); } },
        has: function (id) { return seen.has(id); },
        entityIds: ids,
        relationIds: relIds
      };
    }

    /* objective ← contribuyeA ← process ← (ejecuta) activities of the current AS-IS → roles
     * → positions (desempeña); activities → usa → systems. No second-order neighbours. */
    function objectiveTraversal(objectiveId, options) {
      var opts = options || {};
      var c = collector();
      c.add(objectiveId);
      var versionRef = opts.version || opts.versionId || opts.currentAsIsVersionId || pack.currentAsIsVersionId;
      var version = resolveVersion(versionRef, opts.demoVersions);
      relationsTo(objectiveId, 'contribuyeA').forEach(function (rel) {
        var process = entity(rel.from);
        if (!process) return;
        c.add(process.id);
        c.addRel(rel);
        var v = version && version.processId === process.id ? version : null;
        if (!v) {
          var asIs = processVersions(process.id).filter(function (pv) { return pv.type === 'AS-IS'; })[0];
          v = asIs || null;
        }
        if (!v) return;
        versionActivityList(v, opts.demoVersions).forEach(function (activity) {
          var key = activityKey(activity);
          c.add(key);
          roleIdsOf(activity).forEach(function (roleId) {
            c.add(roleId);
            relationsTo(key, 'ejecuta').forEach(function (r) { if (r.from === roleId) c.addRel(r); });
            relationsTo(roleId, 'desempeña').forEach(function (r) { c.add(r.from); c.addRel(r); });
            rolePositions(roleId).forEach(function (p) { c.add(p.id); });
          });
          systemIdsOf(activity).forEach(function (systemId) {
            c.add(systemId);
            relationsFrom(key, 'usa').forEach(function (r) { if (r.to === systemId) c.addRel(r); });
          });
        });
      });
      return { rootId: objectiveId, entityIds: c.entityIds, relationIds: c.relationIds, versionId: version ? version.id : null };
    }

    /* area: its positions, occupants and owned/participating processes; other areas that
     * participate in or own those processes are reported as neighbours (boundary). */
    function areaTraversal(areaId) {
      var c = collector();
      c.add(areaId);
      areaPositions(areaId).forEach(function (position) {
        c.add(position.id);
        relationsFrom(position.id, 'perteneceA').forEach(function (r) { if (r.to === areaId) c.addRel(r); });
        positionOccupants(position.id).forEach(function (occupant) {
          c.add(occupant.id);
          relationsFrom(occupant.id).forEach(function (r) { if ((r.type === 'ocupa' || r.type === 'prestaServicioComo') && r.to === position.id) c.addRel(r); });
        });
      });
      var processes = areaProcesses(areaId);
      var neighbors = [];
      processes.owned.concat(processes.participating).forEach(function (process) {
        c.add(process.id);
        relationsFrom(process.id, 'tieneDueñoÁrea').forEach(function (r) { if (r.to === areaId) c.addRel(r); });
        relationsFrom(areaId, 'participaEn').forEach(function (r) { if (r.to === process.id) c.addRel(r); });
        var owner = processArea(process.id);
        if (owner && owner.id !== areaId) neighbors.push(owner.id);
        processParticipants(process.id).forEach(function (a) { if (a.id !== areaId) neighbors.push(a.id); });
      });
      return { rootId: areaId, entityIds: c.entityIds, relationIds: c.relationIds, neighbors: unique(neighbors) };
    }

    /* Generic connections policy per entity type. Items carry the Spanish relation phrase
     * read from the root's side; `derived: true` marks links resolved through a version
     * snapshot (activities) rather than a stored relation; `versionId` tags version-bound items. */
    function connections(entityId, options) {
      var opts = options || {};
      var root = entity(entityId);
      var c = collector();
      var groups = [];
      var groupIndex = {};
      if (!root) return { rootId: entityId, entityIds: [], relationIds: [], groups: [] };
      c.add(root.id);

      function group(type, labelOverride) {
        var key = labelOverride || type;
        if (!groupIndex[key]) {
          groupIndex[key] = { id: key, type: type, label: labelOverride || packCore.typePlural(type), items: [], entities: [] };
          groups.push(groupIndex[key]);
        }
        return groupIndex[key];
      }

      function push(type, target, extra) {
        if (!target || target.id === root.id) return;
        var g = group(type, extra && extra.groupLabel);
        if (g.items.some(function (it) { return it.entity && it.entity.id === target.id && (it.versionId || null) === ((extra && extra.versionId) || null); })) return;
        var item = Object.assign({
          id: target.id, kind: 'entity', entity: target, relation: null, relationId: null, relationLabel: null,
          inferred: false, direction: null, derived: false, versionId: null, note: null
        }, extra || {});
        if (item.relation) {
          item.relationId = item.relation.id;
          item.inferred = !!item.relation.inferred || item.inferred;
          item.note = item.relation.label || item.note;
          c.addRel(item.relation);
        }
        g.items.push(item);
        g.entities.push(target);
        c.add(target.id);
      }

      function pushRelated(relTypes, entityTypes, extra) {
        related(root.id, { types: relTypes }).forEach(function (link) {
          if (entityTypes && entityTypes.indexOf(link.entity.type) === -1) return;
          push(link.entity.type, link.entity, Object.assign({ relation: link.relation, relationLabel: link.label, direction: link.direction }, extra || {}));
        });
      }

      function pushVersion(version) {
        var g = group('version');
        if (g.items.some(function (it) { return it.version && it.version.id === version.id; })) return;
        g.items.push({ id: version.id, kind: 'version', version: version, entity: null, relation: null, relationId: null,
          relationLabel: 'versión de', inferred: false, direction: 'in', derived: false, versionId: version.id, note: null });
      }

      var version = resolveVersion(opts.version || opts.versionId, opts.demoVersions);
      var currentAsIs = resolveVersion(opts.currentAsIsVersionId || pack.currentAsIsVersionId, opts.demoVersions);

      switch (root.type) {
        case 'organization':
          children(root.id).forEach(function (child) {
            var rel = relationsFrom(child.id, 'parteDe').filter(function (r) { return r.to === root.id; })[0];
            push(child.type, child, { relation: rel || null, relationLabel: packCore.relationLabel('parteDe', 'in'), direction: 'in' });
          });
          pushRelated(['gerenciaGeneral', 'perteneceA'], ['position']);
          break;
        case 'area':
          pushRelated(['parteDe'], ['organization']);
          areaPositions(root.id).forEach(function (position) {
            var rel = relationsFrom(position.id, 'perteneceA').filter(function (r) { return r.to === root.id; })[0];
            push('position', position, { relation: rel || null, relationLabel: packCore.relationLabel('perteneceA', 'in'), direction: 'in' });
            positionOccupants(position.id).forEach(function (occupant) {
              push(occupant.type, occupant, { relationLabel: packCore.relationLabel('ocupa', 'in'), direction: 'in', derived: true });
            });
          });
          var ap = areaProcesses(root.id);
          ap.owned.forEach(function (process) {
            var rel = relationsFrom(process.id, 'tieneDueñoÁrea').filter(function (r) { return r.to === root.id; })[0];
            push('process', process, { relation: rel || null, relationLabel: packCore.relationLabel('tieneDueñoÁrea', 'in'), direction: 'in' });
          });
          ap.participating.forEach(function (process) {
            var rel = relationsFrom(root.id, 'participaEn').filter(function (r) { return r.to === process.id; })[0];
            push('process', process, { relation: rel || null, relationLabel: packCore.relationLabel('participaEn', 'out'), direction: 'out' });
          });
          break;
        case 'position':
          var area = positionArea(root.id);
          if (area) {
            var relA = relationsFrom(root.id, 'perteneceA').filter(function (r) { return r.to === area.id; })[0];
            push(area.type, area, { relation: relA || null, relationLabel: packCore.relationLabel('perteneceA', 'out'), direction: 'out' });
          }
          pushRelated(['gerenciaGeneral'], ['organization']);
          positionOccupants(root.id).forEach(function (occupant) {
            var rel = relationsFrom(occupant.id).filter(function (r) { return (r.type === 'ocupa' || r.type === 'prestaServicioComo') && r.to === root.id; })[0];
            push(occupant.type, occupant, { relation: rel || null, relationLabel: packCore.relationLabel(rel ? rel.type : 'ocupa', 'in'), direction: 'in' });
          });
          positionRoles(root.id).forEach(function (role) {
            var rel = relationsFrom(root.id, 'desempeña').filter(function (r) { return r.to === role.id; })[0];
            push('role', role, { relation: rel || null, relationLabel: packCore.relationLabel('desempeña', 'out'), direction: 'out', inferred: !rel || !!rel.inferred });
          });
          break;
        case 'person':
        case 'externalProvider':
          var position = personPosition(root.id);
          if (position) {
            var relP = relationsFrom(root.id).filter(function (r) { return (r.type === 'ocupa' || r.type === 'prestaServicioComo') && r.to === position.id; })[0];
            push('position', position, { relation: relP || null, relationLabel: packCore.relationLabel(relP ? relP.type : 'ocupa', 'out'), direction: 'out' });
            var pArea = positionArea(position.id);
            if (pArea) push(pArea.type, pArea, { relationLabel: packCore.relationLabel('perteneceA', 'out'), direction: 'out', derived: true });
            positionRoles(position.id).forEach(function (role) {
              var relR = relationsFrom(position.id, 'desempeña').filter(function (r) { return r.to === role.id; })[0];
              push('role', role, { relation: relR || null, relationLabel: packCore.relationLabel('desempeña', 'out'), direction: 'out', derived: true });
              var v = version || currentAsIs;
              roleActivities(role.id, v, opts.demoVersions).forEach(function (activity) {
                push('activity', activity, { relationLabel: packCore.relationLabel('ejecuta', 'out'), direction: 'out', derived: true, versionId: v ? v.id : null });
              });
            });
          }
          break;
        case 'role':
          rolePositions(root.id).forEach(function (position) {
            var rel = relationsFrom(position.id, 'desempeña').filter(function (r) { return r.to === root.id; })[0];
            push('position', position, { relation: rel || null, relationLabel: packCore.relationLabel('desempeña', 'in'), direction: 'in', inferred: !rel || !!rel.inferred });
          });
          var rv = version || currentAsIs;
          roleActivities(root.id, rv, opts.demoVersions).forEach(function (activity) {
            var relE = relationsTo(activityKey(activity), 'ejecuta').filter(function (r) { return r.from === root.id; })[0];
            push('activity', activity, { relation: relE || null, relationLabel: packCore.relationLabel('ejecuta', 'out'), direction: 'out', derived: true, versionId: rv ? rv.id : null });
          });
          if (rv) { var rp = entity(rv.processId); if (rp) push('process', rp, { relationLabel: packCore.relationLabel('participaEn', 'out'), direction: 'out', derived: true }); }
          break;
        case 'process':
          var owner = processArea(root.id);
          if (owner) push('area', owner, { relation: relationsFrom(root.id, 'tieneDueñoÁrea')[0] || null, relationLabel: packCore.relationLabel('tieneDueñoÁrea', 'out'), direction: 'out' });
          processParticipants(root.id).forEach(function (a) {
            if (owner && a.id === owner.id) return;
            var rel = relationsTo(root.id, 'participaEn').filter(function (r) { return r.from === a.id; })[0];
            push('area', a, { relation: rel || null, relationLabel: packCore.relationLabel('participaEn', 'in'), direction: 'in' });
          });
          pushRelated(['agrupadoEn'], ['macroprocess']);
          var pv = version && version.processId === root.id ? version : (currentAsIs && currentAsIs.processId === root.id ? currentAsIs : null);
          var allVersions = processVersions(root.id);
          (opts.versions || allVersions).forEach(function (v) { if (v && v.processId === root.id) pushVersion(v); });
          pushRelated(['contribuyeA'], ['objective']);
          pushRelated(['afecta'], ['gap']);
          pushRelated(['orienta'], ['policy']);
          if (pv) {
            processDocuments(root.id, pv, opts.demoVersions).forEach(function (d) { push('document', d, { relationLabel: packCore.relationLabel('requiere', 'out'), direction: 'out', derived: true, versionId: pv.id }); });
            processSystems(root.id, pv, opts.demoVersions).forEach(function (s) { push('system', s, { relationLabel: packCore.relationLabel('usa', 'out'), direction: 'out', derived: true, versionId: pv.id }); });
            processRoles(root.id, pv, opts.demoVersions).forEach(function (r) { push('role', r, { relationLabel: packCore.relationLabel('ejecuta', 'in'), direction: 'in', derived: true, versionId: pv.id }); });
          }
          break;
        case 'activity':
          var av = version || resolveVersion(activityVersionId(root), opts.demoVersions);
          var vid = av ? av.id : null;
          activityResources(root).roles.forEach(function (role) {
            var rel = relationsTo(root.id, 'ejecuta').filter(function (r) { return r.from === role.id; })[0];
            push('role', role, { relation: rel || null, relationLabel: packCore.relationLabel('ejecuta', 'in'), direction: 'in', versionId: vid });
          });
          activityResources(root).systems.forEach(function (s) {
            var rel = relationsFrom(root.id, 'usa').filter(function (r) { return r.to === s.id; })[0];
            push('system', s, { relation: rel || null, relationLabel: packCore.relationLabel('usa', 'out'), direction: 'out', versionId: vid });
          });
          var docs = activityResources(root).documents;
          docs.requires.forEach(function (d) {
            var rel = relationsFrom(root.id, 'requiere').filter(function (r) { return r.to === d.id; })[0];
            push('document', d, { relation: rel || null, relationLabel: packCore.relationLabel('requiere', 'out'), direction: 'out', versionId: vid });
          });
          docs.produces.forEach(function (d) {
            var rel = relationsFrom(root.id, 'produce').filter(function (r) { return r.to === d.id; })[0];
            push('document', d, { relation: rel || null, relationLabel: packCore.relationLabel('produce', 'out'), direction: 'out', versionId: vid });
          });
          activityResources(root).actors.forEach(function (a) { push(a.type, a, { relationLabel: packCore.relationLabel('participaEn', 'out'), direction: 'out', derived: true, versionId: vid }); });
          var aproc = av ? entity(av.processId) : activityProcess(root);
          if (aproc) push('process', aproc, { relationLabel: packCore.relationLabel('parteDe', 'out'), direction: 'out', derived: true, versionId: vid });
          break;
        case 'system':
        case 'document':
          activitiesUsing(root.id).forEach(function (activity) {
            var rel = relationsFrom(activity.id).filter(function (r) { return r.to === root.id; })[0];
            push('activity', activity, { relation: rel || null, relationLabel: packCore.relationLabel(rel ? rel.type : (root.type === 'system' ? 'usa' : 'requiere'), 'in'), direction: 'in', versionId: activityVersionId(activity) });
            var proc = activityProcess(activity);
            if (proc) push('process', proc, { relationLabel: packCore.relationLabel(root.type === 'system' ? 'usa' : 'requiere', 'in'), direction: 'in', derived: true });
          });
          break;
        case 'policy':
          pushRelated(['orienta'], ['process']);
          var sigPos = root.attributes && root.attributes.signaturePositionId ? entity(root.attributes.signaturePositionId) : null;
          if (sigPos) push('position', sigPos, { relationLabel: root.attributes.signatureNote || packCore.relationLabel('ocupa', 'in'), direction: 'out', derived: true, inferred: true });
          break;
        case 'objective':
          pushRelated(['contribuyeA'], ['process']);
          pushRelated(['mide'], ['indicator']);
          break;
        case 'indicator':
          pushRelated(['mide'], ['objective']);
          break;
        case 'gap':
          pushRelated(['afecta'], ['process']);
          break;
        case 'macroprocess':
          pushRelated(['agrupadoEn'], ['process']);
          break;
        case 'externalActor':
          activitiesUsing(root.id).forEach(function (activity) {
            push('activity', activity, { relationLabel: packCore.relationLabel('participaEn', 'out'), direction: 'out', derived: true, versionId: activityVersionId(activity) });
          });
          pack.flows.forEach(function (flow) {
            if (flow.externalActor && flow.externalActor.entityId === root.id) {
              var fp = entity(flow.processId);
              if (fp) push('process', fp, { relationLabel: packCore.relationLabel('participaEn', 'out'), direction: 'out', derived: true });
            }
          });
          break;
        default:
          pushRelated(null, null);
      }
      return { rootId: root.id, entityIds: c.entityIds, relationIds: c.relationIds, groups: groups };
    }

    /* ---------- history (WEB-07, §14.2 ordering) ---------- */

    function demoVersionsOf(demoState) {
      var raw = demoState && demoState.versions;
      var list = [];
      if (!raw) return list;
      if (typeof raw.values === 'function' && !Array.isArray(raw)) raw.forEach(function (v) { list.push(v); });
      else if (Array.isArray(raw)) list = raw.slice();
      else Object.keys(raw).forEach(function (key) { list.push(raw[key]); });
      return list.filter(Boolean);
    }

    function sourceLabel(sourceIds) {
      var ids = asArray(sourceIds);
      return ids.length ? ids.join(' · ') : null;
    }

    function sourceRefs(sourceIds) {
      return asArray(sourceIds).map(function (id) {
        var s = pack.sources.get(id);
        return { id: id, title: s ? s.title : id, section: s ? (s.section || null) : null, kind: s ? s.kind : null };
      });
    }

    function versionRow(version, currentAsIsVersionId) {
      return {
        versionId: version.id,
        label: version.label || version.id,
        type: version.type || null,
        typeLabel: version.type || null,
        state: version.state || null,
        stateLabel: version.stateLabel || null,
        publishedAt: version.publishedAt || null,
        publishedBy: version.publishedBy || null,
        change: version.changeLabel || version.summary || null,
        summary: version.summary || null,
        sourceIds: asArray(version.sourceIds),
        sourceLabel: sourceLabel(version.sourceIds),
        sources: sourceRefs(version.sourceIds),
        isDemo: !!version.isDemo,
        baseVersionId: version.baseVersionId || null,
        originVersionId: version.originVersionId || null,
        isCurrentAsIs: !!currentAsIsVersionId && version.id === currentAsIsVersionId,
        adoptionLabel: version.adoptionLabel || null,
        pending: asArray(version.pending),
        hasDiff: !!(version.isDemo && (version.diff || version.baseVersionId)),
        version: version
      };
    }

    function processHistory(processId, demoState) {
      var currentAsIs = (demoState && demoState.currentAsIsVersionId) || pack.currentAsIsVersionId;
      var demo = demoVersionsOf(demoState).filter(function (v) { return v.processId === processId && !pack.versions.has(v.id); });
      demo = demo.map(function (v, i) { return { v: v, i: i }; }).sort(function (a, b) {
        var sa = a.v.createdSeq !== undefined ? a.v.createdSeq : (a.v.seq !== undefined ? a.v.seq : null);
        var sb = b.v.createdSeq !== undefined ? b.v.createdSeq : (b.v.seq !== undefined ? b.v.seq : null);
        if (sa !== null && sb !== null && sa !== sb) return sb - sa;
        var pa = a.v.publishedAt || '';
        var pb = b.v.publishedAt || '';
        if (pa !== pb) return pa < pb ? 1 : -1;
        return b.i - a.i;
      }).map(function (x) { return x.v; });
      var rows = demo.map(function (v) { return versionRow(v, currentAsIs); });
      processVersions(processId).forEach(function (v) { rows.push(versionRow(v, currentAsIs)); });
      return rows;
    }

    function history(entityId, demoState) {
      var e = entity(entityId);
      if (!e) return [];
      if (e.type === 'process') return processHistory(e.id, demoState);
      if (e.type === 'activity') {
        var key = activityKey(e);
        var version = resolveVersion(activityVersionId(e), demoState && demoState.versions);
        var processId = version ? version.processId : null;
        if (!processId) return [];
        return processHistory(processId, demoState).map(function (row) {
          var activities = (row.version && row.version.activities) || pack.baseActivities(row.versionId);
          return Object.assign(row, { activityKey: key, hasActivity: !!(activities && activities[key]) });
        });
      }
      var h = pack.views.history || {};
      return [{
        versionId: null,
        label: h.initialReference || 'Referencia inicial',
        type: null,
        typeLabel: packCore.typeLabel(e.type),
        state: null,
        stateLabel: null,
        publishedAt: null,
        publishedBy: null,
        change: null,
        summary: null,
        sourceIds: asArray(e.provenance && e.provenance.sourceIds),
        sourceLabel: sourceLabel(e.provenance && e.provenance.sourceIds),
        sources: sourceRefs(e.provenance && e.provenance.sourceIds),
        isDemo: !!e.isDemo,
        baseVersionId: null,
        originVersionId: null,
        isCurrentAsIs: false,
        adoptionLabel: null,
        pending: [],
        hasDiff: false,
        version: null
      }];
    }

    /* ---------- search (§14.2) ---------- */

    function scoreMatch(haystack, needle) {
      if (!haystack || !needle) return 0;
      if (haystack === needle) return 100;
      if (haystack.indexOf(needle) === 0) return 80;
      if (haystack.indexOf(' ' + needle) !== -1) return 60;
      if (haystack.indexOf(needle) !== -1) return 40;
      return 0;
    }

    function search(query, options) {
      var opts = options || {};
      var q = normalize(query);
      if (!q) return [];
      var allowed = opts.entityIds === undefined ? null : opts.entityIds;
      var types = opts.types && opts.types.length ? opts.types : null;
      var results = [];
      entities.forEach(function (e) {
        if (allowed && !allowed.has(e.id)) return;
        if (types && types.indexOf(e.type) === -1) return;
        var best = 0;
        var matchedOn = null;
        var candidates = [['name', normalize(e.name)], ['id', normalize(e.id)], ['type', normalize(packCore.typeLabel(e.type))], ['type', normalize(packCore.typePlural(e.type))]];
        candidates.forEach(function (c) {
          var s = scoreMatch(c[1], q);
          if (c[0] === 'type' && s > 0) s = Math.min(s, 50);
          if (s > best) { best = s; matchedOn = c[0]; }
        });
        if (best > 0) results.push({ entity: e, version: null, id: e.id, type: e.type, name: e.name, score: best, matchedOn: matchedOn });
      });
      if (opts.includeVersions && (!types || types.indexOf('version') !== -1)) {
        var versionList = opts.versions ? asArray(opts.versions) : Array.from(pack.versions.values());
        versionList.forEach(function (v) {
          if (!v) return;
          var best = 0;
          var matchedOn = null;
          [['name', normalize(v.label)], ['id', normalize(v.id)], ['type', normalize(packCore.typeLabel('version'))], ['type', normalize(v.type)]].forEach(function (c) {
            var s = scoreMatch(c[1], q);
            if (c[0] === 'type' && s > 0) s = Math.min(s, 50);
            if (s > best) { best = s; matchedOn = c[0]; }
          });
          if (best > 0) results.push({ entity: null, version: v, id: v.id, type: 'version', name: v.label || v.id, score: best, matchedOn: matchedOn, versionId: v.id });
        });
      }
      results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        var na = normalize(a.name);
        var nb = normalize(b.name);
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      return results;
    }

    /* ---------- counts (§16.1) ---------- */

    function counts(entityIds) {
      var allowed = entityIds === undefined ? null : entityIds;
      var out = { areas: 0, positions: 0, externalPositions: 0, people: 0, externals: 0, processesDetailed: 0, processesSummary: 0, processes: 0 };
      var countedProcesses = new Set();
      entities.forEach(function (e) {
        if (allowed && !allowed.has(e.id)) return;
        switch (e.type) {
          case 'area': out.areas++; break;
          case 'position':
            if (e.attributes && e.attributes.external) out.externalPositions++; else out.positions++;
            break;
          case 'person': out.people++; break;
          case 'externalProvider': out.externals++; break;
          case 'process':
            if (countedProcesses.has(e.id)) break;
            countedProcesses.add(e.id);
            out.processes++;
            if (e.attributes && e.attributes.detailed) out.processesDetailed++; else out.processesSummary++;
            break;
          default: break;
        }
      });
      return out;
    }

    function documentsByVariant(flowId) {
      var flow = pack.flows.get(flowId);
      return flow && flow.documentsByVariant ? flow.documentsByVariant : null;
    }

    function activityVersions(key) {
      var out = [];
      pack.versions.forEach(function (v) { if (v.activities && v.activities[key]) out.push(v); });
      return out;
    }

    return {
      entity: entity,
      has: has,
      type: type,
      related: related,
      relationsFrom: relationsFrom,
      relationsTo: relationsTo,
      children: children,
      ofType: ofType,
      areas: areas,
      areaPositions: areaPositions,
      positionOccupants: positionOccupants,
      personPosition: personPosition,
      positionArea: positionArea,
      positionRoles: positionRoles,
      rolePositions: rolePositions,
      personRoles: personRoles,
      roleActivities: roleActivities,
      areaProcesses: areaProcesses,
      processArea: processArea,
      processParticipants: processParticipants,
      processMacroprocess: processMacroprocess,
      macroprocessProcesses: macroprocessProcesses,
      processObjectives: processObjectives,
      objectiveProcesses: objectiveProcesses,
      objectiveIndicators: objectiveIndicators,
      processGaps: processGaps,
      processPolicies: processPolicies,
      processRoles: processRoles,
      processSystems: processSystems,
      processDocuments: processDocuments,
      processVersions: processVersions,
      resolveVersion: resolveVersion,
      flowForVersion: flowForVersion,
      flowNode: flowNode,
      flowNodes: flowNodes,
      versionActivities: versionActivities,
      versionActivityList: versionActivityList,
      resolveActivity: resolveActivity,
      activityKey: activityKey,
      activityVersionId: activityVersionId,
      activityProcess: activityProcess,
      activityVersions: activityVersions,
      activitiesUsing: activitiesUsing,
      activityResources: activityResources,
      roleIdsOf: roleIdsOf,
      systemIdsOf: systemIdsOf,
      documentIdsOf: documentIdsOf,
      attr: attr,
      sipoc: sipoc,
      raci: raci,
      objectiveTraversal: objectiveTraversal,
      areaTraversal: areaTraversal,
      connections: connections,
      history: history,
      sourceRefs: sourceRefs,
      search: search,
      counts: counts,
      documentsByVariant: documentsByVariant,
      packOrder: packOrder
    };
  }

  return { createGraph: createGraph, attr: attr, activityKey: activityKey };
});
