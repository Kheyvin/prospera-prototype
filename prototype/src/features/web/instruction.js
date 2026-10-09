/* features/web/instruction — «Instrucción de actividad», the semantic floor (spec WEB-05,
 * FR-013, JRN-02/03, AT-05). Renders `select('instructionModel')` with the nine prescribed
 * sections in order; «Quién interviene» links role → position → occupants; «Tiempo» is always
 * the missing-value text; decisions and events show condition / outcomes instead of inventing
 * an instruction. Actions: «Volver al flujo», «Histórico», «Ver conexiones», «Ver fuentes». */
Primus.module('features/web/instruction', function (require) {
  'use strict';

  var caches = new WeakMap();

  function t(ctx, key, fallback) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    if (ui[key] !== undefined && ui[key] !== null && typeof ui[key] !== 'object') return ui[key];
    try { var fb = require('core/selectors').UI_FALLBACKS || {}; if (fb[key] !== undefined) return fb[key]; } catch (e) { /* ignore */ }
    return fallback;
  }
  function json(v) { try { return JSON.stringify(v === undefined ? null : v); } catch (e) { return String(Math.random()); } }
  function isKeyboard(event) { return !!event && (event.type === 'keydown' || event.type === 'keyup' || (event.type === 'click' && event.detail === 0)); }
  function run(ctx, command) {
    if (!command) return null;
    if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') return ctx.navigate(command.payload && command.payload.target ? command.payload.target : command.payload);
    return ctx.dispatch(command.type, command.payload || {});
  }

  function link(ctx, ref, extra) {
    var o = extra || {};
    var focusKey = o.focusKey || ('instruction-link:' + ref.id);
    return ctx.molecules.entityLink({
      entity: { id: ref.id, name: ref.name, type: ref.type }, typeLabel: ref.typeLabel, icon: ref.icon || ref.type, showType: o.showType !== false, compact: o.compact !== false,
      relationLabel: o.relationLabel || null, meta: o.meta || null, badge: o.badge || null, versionId: o.versionId || null, testid: o.testid || ('instruction-link-' + ref.id), focusKey: focusKey,
      onOpen: function (entity, event) {
        if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: focusKey });
        if (o.command) run(ctx, o.command); else ctx.dispatch('selectEntity', { entityId: ref.id });
      }
    });
  }

  function section(ctx, s, children) {
    return ctx.dom.h('section', { class: 'twin-sheet__section', 'data-testid': 'instruction-' + s.id, 'aria-labelledby': 'instruction-' + s.id + '-title' },
      ctx.dom.h('h3', { class: 'twin-sheet__section-title', id: 'instruction-' + s.id + '-title' }, s.title), children);
  }

  function textSection(ctx, s) {
    var h = ctx.dom.h;
    return section(ctx, s, [h('p', { class: s.missing ? 'muted' : null }, s.text)]);
  }

  function whoSection(ctx, s) {
    var h = ctx.dom.h;
    var roles = s.roles.map(function (rc) {
      var positions = rc.positions.map(function (p) {
        var occupants = p.occupants.map(function (o) { return h('li', null, link(ctx, o, { relationLabel: t(ctx, 'occupant', 'Ocupante') })); });
        return h('li', null, h('div', { class: 'entity-list__row' }, link(ctx, p.position, { relationLabel: t(ctx, 'position', 'Puesto'), meta: p.collective ? t(ctx, 'collectivePosition', 'Puesto colectivo') : null })),
          p.occupancyNote ? h('p', { class: 'text-sm muted' }, p.occupancyNote) : null,
          occupants.length ? h('ul', { class: 'entity-list__tree', role: 'list' }, occupants) : null);
      });
      return h('li', null,
        h('div', { class: 'entity-list__row' }, link(ctx, rc.role, { relationLabel: t(ctx, 'executor', 'Ejecutor') }), rc.mappingNote ? ctx.atoms.badge({ label: t(ctx, 'labelRelationToValidate', 'Relación por validar'), tone: 'warning' }) : null),
        rc.laneLabel ? h('p', { class: 'text-sm muted' }, t(ctx, 'laneLabel', 'Carril en el diagrama') + ': ' + rc.laneLabel + (rc.mappingNote ? ' · ' + rc.mappingNote : '')) : null,
        rc.positionLabelNote ? h('p', { class: 'text-sm muted' }, rc.positionLabelNote) : null,
        positions.length ? h('ul', { class: 'entity-list__tree', role: 'list' }, positions) : null);
    });
    var subtasks = s.multiRole && s.subtasks.length ? h('div', { class: 'stack stack--xs' }, h('span', { class: 'text-sm muted' }, t(ctx, 'subtasks', 'Subtareas')), h('ul', { class: 'list' }, s.subtasks.map(function (st) {
      return h('li', { class: 'list__item' }, h('span', { class: 'mono text-xs' }, st.id), ' · ' + st.name, st.role ? [' · ', link(ctx, st.role, { testid: 'instruction-subtask-role-' + st.id })] : null, st.instruction ? h('span', { class: 'text-sm muted' }, ' · ' + st.instruction) : null);
    }))) : null;
    return section(ctx, s, [
      s.hiddenLayer ? ctx.molecules.notice({ text: s.hiddenLayer.text, tone: 'info', action: { label: s.hiddenLayer.action.label, onClick: function () { run(ctx, s.hiddenLayer.action.command); } } }) : null,
      roles.length ? h('div', { class: 'entity-list' }, h('ul', { class: 'entity-list__tree', role: 'list' }, roles)) : h('p', { class: 'muted' }, s.empty || ctx.format.missing()),
      s.actors.length ? h('div', { class: 'cluster cluster--sm' }, s.actors.map(function (a) { return link(ctx, a, { relationLabel: t(ctx, 'externalActor', 'Actor externo') }); })) : null,
      s.channelNote ? h('p', { class: 'panel-note' }, s.channelNote) : null,
      subtasks
    ]);
  }

  function documentsSection(ctx, s) {
    var h = ctx.dom.h;
    var flow = require('features/web/flow');
    return section(ctx, s, [
      s.documents.length ? h('div', { class: 'inspector__links' }, s.documents.map(function (d) { return link(ctx, d, { relationLabel: t(ctx, 'requires', 'Requiere') }); })) : null,
      s.text ? h('p', null, s.text) : null,
      s.variantNote ? h('p', { class: 'panel-note' }, s.variantNote) : null,
      s.empty ? h('p', { class: 'muted' }, s.empty) : null,
      s.documentsByVariant && typeof flow.documentsPanel === 'function' ? flow.documentsPanel(ctx, s.documentsByVariant, { id: 'instruction-documents', headingLevel: 4 }) : null
    ]);
  }

  function systemsSection(ctx, s) {
    var h = ctx.dom.h;
    return section(ctx, s, [
      s.systems.length ? h('div', { class: 'inspector__links' }, s.systems.map(function (sys) { return link(ctx, sys, { meta: sys.attributes && sys.attributes.statusLabel ? sys.attributes.statusLabel : null, badge: sys.attributes && sys.attributes.status !== 'current' ? { label: t(ctx, 'labelProposed'), tone: 'proposed' } : null }); })) : null,
      s.text ? h('p', null, s.text) : null,
      s.empty ? h('p', { class: 'muted' }, s.empty) : null]);
  }

  function outputSection(ctx, s) {
    var h = ctx.dom.h;
    return section(ctx, s, [h('p', null, s.text), s.produces.length ? h('div', { class: 'inspector__links' }, s.produces.map(function (d) { return link(ctx, d, { relationLabel: t(ctx, 'produces', 'Produce') }); })) : null]);
  }

  function sourcesSection(ctx, s) {
    var h = ctx.dom.h;
    var nodes = s.sourceNodeIds;
    var nodeText = Array.isArray(nodes) ? nodes.join(', ') : (nodes && typeof nodes === 'object' ? Object.keys(nodes).map(function (k) { return k + ': ' + (nodes[k] || []).join(', '); }).join(' · ') : null);
    return section(ctx, s, [
      s.labels.length ? h('div', { class: 'cluster cluster--sm' }, s.labels.map(function (l) { return ctx.atoms.badge({ label: l, tone: ctx.atoms.labelTone ? ctx.atoms.labelTone(l) : 'neutral' }); })) : null,
      s.sources.length ? h('ul', { class: 'list' }, s.sources.map(function (src) { return h('li', { class: 'list__item' }, h('span', { class: 'mono text-xs' }, src.id), ' · ' + src.title + (src.section ? ' (' + src.section + ')' : ''), src.modelModifiedAtText ? h('span', { class: 'text-sm muted' }, ' · ' + src.modelModifiedAtLabel + ': ' + src.modelModifiedAtText) : null); })) : h('p', { class: 'muted' }, ctx.format.missing()),
      ctx.molecules.keyValue({ missingText: ctx.format.missing(), rows: [{ label: t(ctx, 'confidence', 'Confianza'), value: s.confidenceLabel }, nodeText ? { label: s.sourceNodesLabel, value: nodeText, mono: true } : null].filter(Boolean) })
    ]);
  }

  function relatedWorkSection(ctx, s) {
    var h = ctx.dom.h;
    var groups = s.roles.filter(function (r) { return r.activities.length; }).map(function (r) {
      return h('div', { class: 'stack stack--xs' }, h('div', null, link(ctx, r.role, { relationLabel: t(ctx, 'executor', 'Ejecutor') })),
        h('ul', { class: 'entity-list__tree', role: 'list' }, r.activities.map(function (a) {
          return h('li', null, h('div', { class: 'entity-list__row' }, ctx.molecules.entityLink({ entity: { id: a.key, name: a.name, type: 'activity' }, typeLabel: t(ctx, 'activities', 'Actividad'), icon: 'activity', compact: true, showType: false, versionId: a.versionId, testid: a.testid, focusKey: 'instruction-related:' + a.key, meta: a.key,
            onOpen: function (entity, event) { if (isKeyboard(event) && ctx.store.hasCommand('setFocusReturn')) ctx.dispatch('setFocusReturn', { focusKey: 'tabpanel-heading:web' }); run(ctx, a.command); } })));
        })));
    });
    return section(ctx, s, [groups.length ? h('div', { class: 'entity-list stack stack--sm' }, groups) : h('p', { class: 'muted' }, s.empty)]);
  }

  function actionsRow(ctx, model) {
    var icons = { 'back-to-flow': 'back', history: 'history', connections: 'link', sources: 'document' };
    return ctx.dom.h('div', { class: 'twin-stage__controls' }, (model.actions || []).map(function (a, i) {
      return ctx.atoms.button({ label: a.label, variant: i === 0 ? 'secondary' : 'ghost', size: 'sm', icon: icons[a.id] || null, testid: 'instruction-action-' + a.id, focusKey: 'instruction:action:' + a.id,
        disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason || null : null, onClick: function () { run(ctx, a.command); } });
    }));
  }

  function header(ctx, model) {
    var h = ctx.dom.h, atoms = ctx.atoms;
    var badges = (model.badges || []).map(function (b) { return atoms.badge({ label: b.label, tone: b.tone }); });
    if (model.adoptionBadge) badges.push(atoms.badge({ label: model.adoptionBadge.label, tone: model.adoptionBadge.tone }));
    if (model.version && model.version.isDemo && !model.adoptionBadge) badges.push(atoms.badge({ label: model.version.stateLabel || t(ctx, 'labelDemoExample'), tone: 'demo' }));
    return h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('span', { class: 'eyebrow' }, ctx.icons.icon(model.icon || 'activity'), ' ', model.typeLabel + (model.kind === 'activity' ? ' · ' + model.key : '')),
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web', 'data-testid': 'instruction-title' }, model.title),
        h('p', { class: 'twin-stage__subtitle' }, [model.process ? model.process.name : null, model.flow ? model.flow.title : null, model.version ? model.version.label : null].filter(Boolean).join(' · ')),
        badges.length ? h('div', { class: 'cluster cluster--sm' }, badges) : null,
        model.disclaimer ? h('p', { class: 'twin-stage__note', 'data-testid': 'instruction-disclaimer' }, model.disclaimer) : null,
        model.readOnly ? h('p', { class: 'text-sm muted' }, ctx.icons.icon('lock'), ' ', model.readOnlyLabel) : null),
      actionsRow(ctx, model));
  }

  function body(ctx, model) {
    var h = ctx.dom.h;
    if (model.restricted) {
      var n = model.notice || {};
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, ctx.molecules.notice({ text: n.text || ctx.format.msg('MSG-02').text, tone: 'warning', role: 'alert', testid: 'instruction-restricted', action: { label: n.action || t(ctx, 'backToOrganization'), testid: 'instruction-restricted-action', onClick: function () { ctx.dispatch('backToOrganization', {}); } } }));
    }
    if (model.kind === 'flowNode') {
      var outcomes = (model.outcomes || []).map(function (o) { return h('li', { class: 'list__item' }, (o.label ? o.label + ' → ' : '→ ') + o.targetLabel + (o.loop ? ' (' + t(ctx, 'returnsTo', 'vuelve a') + ' ' + o.targetNodeId + ')' : '') + (o.inferred ? ' · ' + t(ctx, 'confidenceInferred', 'Inferido') : '')); });
      return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'twin-sheet', 'data-testid': 'instruction-node' }, h('div', { class: 'twin-sheet__main' },
        model.condition ? section(ctx, { id: 'condition', title: t(ctx, 'decisionCondition', 'Condición') }, [h('p', null, model.condition)]) : section(ctx, { id: 'description', title: t(ctx, 'description', 'Descripción') }, [h('p', null, model.description || ctx.format.missing())]),
        outcomes.length ? section(ctx, { id: 'outcomes', title: t(ctx, 'decisionOutcomes', 'Salidas') }, [h('ul', { class: 'list' }, outcomes)]) : null,
        section(ctx, { id: 'flow', title: t(ctx, 'relatedFlow', 'Flujo relacionado') }, [h('p', null, (model.flow ? model.flow.title : '') + (model.version ? ' · ' + model.version.label : ''))]),
        model.sources ? sourcesSection(ctx, { id: 'sources', title: t(ctx, 'sources', 'Fuentes'), labels: [], sources: model.sources.sources || [], confidenceLabel: model.sources.confidenceLabel, sourceNodeIds: model.sourceNodeIds, sourceNodesLabel: t(ctx, 'sourceNodes', 'Nodos del modelo fuente') }) : null)));
    }
    var sections = model.sections.map(function (s) {
      switch (s.kind) {
        case 'text': return textSection(ctx, s);
        case 'who': return whoSection(ctx, s);
        case 'documents': return documentsSection(ctx, s);
        case 'systems': return systemsSection(ctx, s);
        case 'output': return outputSection(ctx, s);
        case 'sources': return sourcesSection(ctx, s);
        case 'relatedWork': return relatedWorkSection(ctx, s);
        default: return s.text ? textSection(ctx, s) : null;
      }
    });
    var main = sections.slice(0, 6), aside = sections.slice(6);
    /* The lead paragraph is omitted when a section (e.g. «Qué hacer») already carries the same text. */
    var lead = !!model.description && !model.sections.some(function (s) { return s.kind === 'text' && (s.text || '').trim() === model.description.trim(); });
    return h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, h('div', { class: 'twin-sheet', 'data-testid': 'instruction' },
      h('div', { class: 'twin-sheet__main' }, lead ? h('p', { class: 'text-lg', 'data-testid': 'instruction-description' }, model.description) : null, main),
      h('div', { class: 'twin-sheet__aside' }, aside)));
  }

  function render(stageEl, ctx) {
    var model = ctx.select('instructionModel');
    var dom = ctx.dom;
    if (!model) model = { restricted: false, kind: 'empty', title: t(ctx, 'selectProcess', 'Selecciona un proceso'), sections: [], actions: [] };
    var cache = caches.get(stageEl);
    if (!cache || !stageEl.contains(cache.root)) {
      cache = { root: dom.h('div', { class: 'twin-instruction twin-stage__fill' }), keys: {}, header: dom.h('div'), body: dom.h('div', { class: 'twin-stage__fill' }) };
      cache.root.appendChild(cache.header); cache.root.appendChild(cache.body);
      stageEl.appendChild(cache.root);
      caches.set(stageEl, cache);
    }
    var hk = json({ k: model.kind, t: model.title, key: model.key, b: model.badges, a: model.actions, v: model.version && model.version.id, ro: model.readOnly, ad: model.adoptionBadge, r: model.restricted });
    if (hk !== cache.keys.header) { cache.keys.header = hk; dom.preserveFocus(cache.root, function () { dom.replace(cache.header, model.restricted || model.kind === 'empty' ? dom.h('div', { class: 'twin-stage__header' }, dom.h('div', { class: 'twin-stage__heading' }, dom.h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web' }, model.title || t(ctx, 'restricted', 'Acceso restringido')))) : header(ctx, model)); }); }
    var bk = json(model);
    if (bk !== cache.keys.body) {
      cache.keys.body = bk;
      dom.preserveScroll(cache.body.firstChild, function () { dom.preserveFocus(cache.root, function () { dom.replace(cache.body, model.kind === 'empty' ? dom.h('div', { class: 'twin-stage__body twin-stage__body--scroll' }, ctx.molecules.emptyState({ text: model.title, icon: 'activity' })) : body(ctx, model)); }); });
    }
  }

  return { id: 'instruction', render: render };
});
