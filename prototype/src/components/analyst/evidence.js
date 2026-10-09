/* components/analyst/evidence — evidence panel of the studio (spec DESK-01 «Evidencias de
 * WS-BOLETAS», FR-027). A closed list («Elegir evidencia de ejemplo», no upload) of the
 * workspace's evidence records; opening one shows its extracts, reference label, state badge
 * and the visible linked entities (navigation into the web prototype). Evidence hidden to the
 * profile (TO-BE sources for U-EMPLOYEE) is explained, never silently dropped. */
Primus.module('components/analyst/evidence', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createEvidence(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var molecules = ctx.molecules || require('ds/molecules');
    var icons = ctx.icons || require('ds/icons');
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var lastKey = null;

    function ui(key, fallback) { return typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback; }
    function dispatch(type, payload) { return typeof ctx.dispatch === 'function' ? ctx.dispatch(type, payload) : ctx.store.dispatch(type, payload); }
    function navigate(target) { if (typeof ctx.navigate === 'function') return ctx.navigate(target); return dispatch('navigateTo', { target: target }); }
    function typeLabel(type) { try { return require('core/pack').typeLabel(type); } catch (e) { return type; } }
    function typeIcon(type) { try { return require('core/pack').typeIcon(type); } catch (e) { return type; } }

    var titleEl = h('h3', { class: 'studio-side__title', id: 'evidence-title' }, '');
    var bodyEl = h('div', { class: 'stack stack--sm' });
    var el = h('section', { class: 'studio-side__section evidence', 'data-testid': 'evidence-panel', 'aria-labelledby': 'evidence-title' }, titleEl, bodyEl);

    function openEvidence(id) {
      var r = dispatch('openEvidence', { evidenceId: id });
      if (r && r.ok === false && r.error && r.error.message) dom.announce(r.error.message);
    }

    function entityLinkFor(id) {
      var entity = ctx.graph && ctx.graph.entity ? ctx.graph.entity(id) : null;
      if (!entity) return null;
      return molecules.entityLink({ entity: { id: entity.id, name: entity.name, type: entity.type }, typeLabel: typeLabel(entity.type), icon: typeIcon(entity.type), compact: true, showType: true, testid: 'evidence-link-' + entity.id, focusKey: 'evidence-link:' + entity.id,
        onOpen: function () { navigate({ tab: 'web', web: { selectEntityId: entity.id } }); } });
    }

    function card(item, model) {
      var open = !!item.open;
      var summary = open ? h('div', { class: 'stack stack--sm', id: 'evidence-body-' + item.id, role: 'region', 'aria-labelledby': 'evidence-label-' + item.id },
        item.referenceLabel ? h('p', { class: 'text-sm muted' }, icons.icon('document'), ' ', item.referenceLabel) : null,
        item.summary.length ? h('ul', { class: 'list evidence-item__summary' }, item.summary.map(function (s) { return h('li', { class: 'list__item' }, s); })) : null,
        item.source ? h('p', { class: 'text-xs muted mono' }, item.source.id + (item.source.section ? ' · ' + item.source.section : '')) : null,
        item.entityIds.length ? h('div', { class: 'cluster cluster--sm' }, item.entityIds.map(entityLinkFor)) : null) : null;
      return h('article', { class: ['evidence-item', open ? 'is-open' : null], 'data-evidence-id': item.id },
        h('button', { type: 'button', class: 'evidence-item__label', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'evidence-body-' + item.id, id: 'evidence-label-' + item.id, 'data-testid': 'evidence-' + item.id, 'data-focus-key': 'evidence:' + item.id,
          on: { click: function () { openEvidence(open ? null : item.id); } } },
          icons.icon(open ? 'chevronDown' : 'chevronRight'), h('span', null, item.label), item.stateLabel ? atoms.badge({ label: item.stateLabel, tone: atoms.labelTone ? atoms.labelTone(item.stateLabel) : 'neutral' }) : null),
        summary);
    }

    function render(model) {
      dom.setText(titleEl, (model.texts.regions && model.texts.regions.panel ? model.texts.regions.panel.split(',')[0] : null) || ui('sources', 'Evidencia'));
      var picker = model.evidencePicker ? atoms.field({ id: 'evidence-picker', label: model.evidencePicker.label, control: atoms.select({ id: 'evidence-picker', testid: 'evidence-picker', focusKey: 'evidence:picker', size: 'sm', value: model.evidenceOpenId || '',
        options: [{ value: '', label: model.evidencePicker.label }].concat(model.evidence.map(function (e) { return { value: e.id, label: e.label }; })), onChange: function (v) { openEvidence(v || null); } }) }) : null;
      dom.replace(bodyEl,
        picker,
        model.evidenceNotice ? molecules.notice({ text: model.evidenceNotice, tone: 'info', testid: 'evidence-hidden', action: model.readOnlyCta ? { label: model.readOnlyCta.label, onClick: function () { dispatch(model.readOnlyCta.command.type, model.readOnlyCta.command.payload || {}); } } : null }) : null,
        model.evidence.length ? h('div', { class: 'stack stack--xs' }, model.evidence.map(function (e) { return card(e, model); })) : h('p', { class: 'muted text-sm' }, ui('noData', 'No hay información disponible para esta vista')));
    }

    function update(model) {
      if (!model) return;
      var key = JSON.stringify({ s: model.sessionId, e: model.evidence, n: model.evidenceNotice, o: model.evidenceOpenId, p: model.evidencePicker });
      if (key === lastKey) return;
      lastKey = key;
      dom.preserveFocus(el, function () { render(model); });
    }

    return { el: el, update: update };
  }

  return { createEvidence: createEvidence };
});
