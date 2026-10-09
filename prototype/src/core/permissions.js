/* core/permissions — profile matrix, visible sets and action checks (CONTRACTS §5.5,
 * spec §5.2 matrix, §16.4 version-bound visibility).
 *
 * Pure: reads the resolved pack and a state object; never mutates either. The demo
 * state is consulted for demo-created versions (state.demo.versions) so that version-bound
 * visibility (activities of a visible AS-IS version and their resources) stays correct
 * after the desktop scenarios run. */
Primus.module('core/permissions', function () {
  'use strict';

  var ACCESS_ROLES = ['admin', 'manager', 'employee'];
  var READ_ACTIONS = ['viewAll', 'viewEntity', 'viewVersion', 'viewDraftsToBe', 'viewTracking', 'viewSecurity', 'viewAudit'];
  var WRITE_ACTIONS = ['maintainModel', 'publish', 'trackProcess', 'manageAccounts'];
  var DEFAULT_MSG_02 = { text: 'Tu perfil de demostración no tiene acceso a esta información', action: 'Volver a una vista permitida' };
  var DEFAULT_MSG_03 = { text: 'Esta acción requiere permiso de mantenimiento del modelo', action: 'Usar perfil de analista' };
  var DEFAULT_ADJUSTED = 'La vista se ajustó al perfil seleccionado';

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
  }

  function sameValue(a, b) {
    if (a === b) return true;
    try { return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b); } catch (e) { return false; }
  }

  function createPermissions(pack) {
    var ui = pack.ui || {};
    var messages = pack.messages || {};
    var tracking = pack.tracking || {};
    var security = pack.security || {};
    var demo = pack.demo || {};
    var views = pack.views || {};
    var defaultProcessId = pack.defaultProcessId || views.defaultProcessId || null;
    var memo = { key: null, set: null };

    function messageOf(id, fallback) {
      var m = messages[id];
      if (m && typeof m === 'object') return { text: m.text || fallback.text, action: m.action !== undefined ? m.action : fallback.action };
      if (typeof m === 'string') return { text: m, action: fallback.action };
      return fallback;
    }

    /* ---------- profile ---------- */

    function profileId(state) {
      return state && state.app ? state.app.profileId : null;
    }

    function profile(state) {
      var id = profileId(state);
      var p = id ? pack.profiles.get(id) : undefined;
      if (p) return p;
      if (demo.initialProfileId && pack.profiles.get(demo.initialProfileId)) return pack.profiles.get(demo.initialProfileId);
      var first = pack.profiles.values().next();
      return first && !first.done ? first.value : null;
    }

    function role(state) {
      var p = profile(state);
      var r = p ? p.accessRole : null;
      return ACCESS_ROLES.indexOf(r) === -1 ? 'employee' : r;
    }

    function grants(state) {
      var p = profile(state);
      return (p && p.grants) || {};
    }

    function visibility(state) {
      var p = profile(state);
      return (p && p.visibility) || { all: false, entityIds: [], versionTypes: [], tracking: false };
    }

    function isAdmin(state) { return role(state) === 'admin'; }

    function isOwner(state, processId) {
      var list = asArray(grants(state).processOwnerOf);
      if (processId === undefined || processId === null) return list.length > 0;
      return list.indexOf(processId) !== -1;
    }

    /* ---------- versions ---------- */

    function demoVersionList(state) {
      var raw = state && state.demo ? state.demo.versions : null;
      var list = [];
      if (!raw) return list;
      if (typeof raw.values === 'function' && !Array.isArray(raw)) raw.forEach(function (v) { list.push(v); });
      else if (Array.isArray(raw)) list = raw.slice();
      else Object.keys(raw).forEach(function (key) { list.push(raw[key]); });
      return list.filter(Boolean);
    }

    function demoVersion(state, id) {
      var raw = state && state.demo ? state.demo.versions : null;
      if (!raw || !id) return undefined;
      if (typeof raw.get === 'function' && !Array.isArray(raw)) return raw.get(id);
      if (Array.isArray(raw)) return raw.filter(function (v) { return v && v.id === id; })[0];
      return raw[id];
    }

    function versionById(state, id) {
      if (!id) return undefined;
      return pack.versions.get(id) || demoVersion(state, id);
    }

    function allVersions(state) {
      var list = Array.from(pack.versions.values());
      demoVersionList(state).forEach(function (v) { if (!pack.versions.has(v.id)) list.push(v); });
      return list;
    }

    function versionAllowed(state, version) {
      if (!version) return false;
      if (version.staged === true || version.state === 'staging') return isAdmin(state);
      var vis = visibility(state);
      if (vis.all) return true;
      return asArray(vis.versionTypes).indexOf(version.type) !== -1;
    }

    function visibleVersionIds(state) {
      var set = new Set();
      allVersions(state).forEach(function (v) { if (versionAllowed(state, v)) set.add(v.id); });
      return set;
    }

    function canSeeVersion(state, versionId) {
      var v = versionById(state, versionId);
      return v ? versionAllowed(state, v) : false;
    }

    /* ---------- entities ---------- */

    function activityAttr(activity, name) {
      if (!activity) return undefined;
      if (activity.attributes && activity.attributes[name] !== undefined) return activity.attributes[name];
      return activity[name];
    }

    /* null = everything visible; otherwise the listed ids + activity entities contained in a
     * visible version (resolved per authorized version, not by key prefix, spec §16.4) and
     * the direct resources (roles, systems, documents) of those activities. */
    function visibleEntityIds(state) {
      var vis = visibility(state);
      if (vis.all) return null;
      var versionIds = Array.from(visibleVersionIds(state)).sort();
      var key = String(profileId(state)) + '|' + versionIds.join(',');
      if (memo.key === key && memo.set) return memo.set;
      var set = new Set();
      asArray(vis.entityIds).forEach(function (id) { if (pack.entities.has(id)) set.add(id); });
      versionIds.forEach(function (versionId) {
        var version = versionById(state, versionId);
        var activities = (version && version.activities) || pack.baseActivities(versionId);
        Object.keys(activities || {}).forEach(function (actKey) {
          var activity = activities[actKey];
          if (pack.entities.has(actKey)) set.add(actKey);
          if (activity && activity.id && pack.entities.has(activity.id)) set.add(activity.id);
          var docs = activityAttr(activity, 'documentIds') || {};
          asArray(activityAttr(activity, 'roleIds')).concat(asArray(activityAttr(activity, 'systemIds')), asArray(docs.requires), asArray(docs.produces))
            .forEach(function (id) { if (pack.entities.has(id)) set.add(id); });
          asArray(activityAttr(activity, 'subtasks')).forEach(function (s) { if (s && s.roleId && pack.entities.has(s.roleId)) set.add(s.roleId); });
        });
      });
      memo.key = key;
      memo.set = set;
      return set;
    }

    function isVisible(state, entityId) {
      if (entityId === null || entityId === undefined) return false;
      var set = visibleEntityIds(state);
      if (set === null) return true;
      if (!pack.entities.has(entityId)) return true;
      return set.has(entityId);
    }

    /* ---------- action checks ---------- */

    function denyRead(actionId, overrideText) {
      var m = messageOf('MSG-02', DEFAULT_MSG_02);
      return {
        ok: false,
        actionId: actionId,
        messageId: 'MSG-02',
        text: overrideText || m.text,
        action: m.action,
        cta: { label: ui.backToOrganization || m.action, command: 'backToOrganization' },
        reason: overrideText || m.text
      };
    }

    function denyWrite(actionId, reason) {
      var m = messageOf('MSG-03', DEFAULT_MSG_03);
      return {
        ok: false,
        actionId: actionId,
        messageId: 'MSG-03',
        text: m.text,
        action: m.action,
        cta: { label: ui.useAnalystProfile || m.action, command: 'useAnalystProfile' },
        reason: reason || m.text
      };
    }

    function can(state, action, ctx) {
      var c = ctx || {};
      var vis = visibility(state);
      switch (action) {
        case 'viewAll':
          return vis.all ? { ok: true } : denyRead(action);
        case 'viewEntity':
          return isVisible(state, c.entityId) ? { ok: true } : denyRead(action);
        case 'viewVersion':
          return canSeeVersion(state, c.versionId) ? { ok: true } : denyRead(action);
        case 'viewDraftsToBe':
          return (vis.all || asArray(vis.versionTypes).indexOf('TO-BE') !== -1) ? { ok: true } : denyRead(action);
        case 'viewTracking':
          return (vis.all || vis.tracking === true) ? { ok: true } : denyRead(action);
        case 'viewSecurity':
        case 'viewAudit':
          return isAdmin(state) ? { ok: true } : denyRead(action, security.restricted || null);
        case 'maintainModel':
          return (isAdmin(state) && grants(state).canMaintainModel !== false) ? { ok: true } : denyWrite(action);
        case 'publish':
          return isAdmin(state) ? { ok: true } : denyWrite(action);
        case 'trackProcess':
          return (isAdmin(state) || isOwner(state, c.processId || defaultProcessId)) ? { ok: true }
            : denyWrite(action, (tracking.texts && tracking.texts.trackingPermissionRequired) || null);
        case 'manageAccounts':
          return isAdmin(state) ? { ok: true } : denyWrite(action);
        default:
          return denyWrite(action);
      }
    }

    /* ---------- context adjustment (spec §5.2: "si el contexto deja de ser accesible") ---------- */

    function firstVisibleVersionId(state, processId) {
      var current = (state && state.demo && state.demo.currentAsIsVersionId) || pack.currentAsIsVersionId;
      var cv = versionById(state, current);
      if (cv && (!processId || cv.processId === processId) && versionAllowed(state, cv)) return cv.id;
      var candidates = allVersions(state).filter(function (v) { return (!processId || v.processId === processId) && versionAllowed(state, v); });
      return candidates.length ? candidates[0].id : null;
    }

    function defaultVisibleContext(state) {
      var dc = views.defaultContext || {};
      var processId = defaultProcessId && isVisible(state, defaultProcessId) ? defaultProcessId : null;
      if (processId) {
        return {
          module: 'twin', level: 'operational', processId: processId, processView: 'sheet',
          versionId: firstVisibleVersionId(state, processId), selection: null, inspectorHistory: [],
          highlightRootId: null, relationsRootId: null, activityKey: null, overlay: null, areaId: null
        };
      }
      return {
        module: 'twin', level: dc.level || 'strategic', representation: dc.representation || 'orgchart', processId: null,
        processView: 'sheet', versionId: firstVisibleVersionId(state, null), selection: null, inspectorHistory: [],
        highlightRootId: null, relationsRootId: null, activityKey: null, overlay: null, areaId: null
      };
    }

    function selectionHidden(state, sel) {
      if (!sel) return false;
      if (sel.entityId && pack.entities.has(sel.entityId) && !isVisible(state, sel.entityId)) return true;
      if (sel.versionId && !canSeeVersion(state, sel.versionId)) return true;
      return false;
    }

    function adjustContext(state) {
      var web = (state && state.web) || {};
      var reasons = [];
      if (web.module === 'security' && !isAdmin(state)) reasons.push('security');
      if (web.areaId && !isVisible(state, web.areaId)) reasons.push('area');
      if (web.processId && !isVisible(state, web.processId)) reasons.push('process');
      if (web.versionId && !canSeeVersion(state, web.versionId)) reasons.push('version');
      if (web.activityKey && pack.entities.has(web.activityKey) && !isVisible(state, web.activityKey)) reasons.push('activity');
      if (selectionHidden(state, web.selection)) reasons.push('selection');
      if (asArray(web.inspectorHistory).some(function (s) { return selectionHidden(state, s); })) reasons.push('inspectorHistory');
      if (web.relationsRootId && !isVisible(state, web.relationsRootId)) reasons.push('relationsRoot');
      if (web.highlightRootId && !isVisible(state, web.highlightRootId)) reasons.push('highlightRoot');
      if (web.overlay) {
        var o = web.overlay;
        if ((o.entityId && pack.entities.has(o.entityId) && !isVisible(state, o.entityId)) || (o.versionId && !canSeeVersion(state, o.versionId))) reasons.push('overlay');
      }
      if (!reasons.length) return null;
      var target = defaultVisibleContext(state);
      var patch = {};
      Object.keys(target).forEach(function (key) {
        if (!sameValue(web[key], target[key])) patch[key] = target[key];
      });
      if (web.areaFilter && !isVisible(state, web.areaFilter)) patch.areaFilter = null;
      if (web.compareVersionId && !canSeeVersion(state, web.compareVersionId)) patch.compareVersionId = null;
      patch.notice = ui.viewAdjusted || DEFAULT_ADJUSTED;
      return patch;
    }

    /* Access matrix rows for the current role (informative, from demo.accessMatrix). */
    function matrixFor(state) {
      var r = role(state);
      var owner = r === 'employee' && isOwner(state);
      return asArray(demo.accessMatrix).map(function (row) {
        var column = r === 'employee' ? (owner ? 'owner' : 'employee') : r;
        return { action: row.action, label: row.label, allowed: row[column] === true, note: row.note || (owner && row.ownerNote) || null };
      });
    }

    return {
      profile: profile,
      profileId: profileId,
      role: role,
      grants: grants,
      visibility: visibility,
      isAdmin: isAdmin,
      isOwner: isOwner,
      visibleEntityIds: visibleEntityIds,
      isVisible: isVisible,
      visibleVersionIds: visibleVersionIds,
      canSeeVersion: canSeeVersion,
      versionById: versionById,
      allVersions: allVersions,
      can: can,
      adjustContext: adjustContext,
      defaultVisibleContext: defaultVisibleContext,
      matrixFor: matrixFor,
      READ_ACTIONS: READ_ACTIONS,
      WRITE_ACTIONS: WRITE_ACTIONS
    };
  }

  return { createPermissions: createPermissions, READ_ACTIONS: READ_ACTIONS, WRITE_ACTIONS: WRITE_ACTIONS };
});
