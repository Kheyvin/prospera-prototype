/* components/twin/entitylist — list-mode alternative shared by canvas stages (spec §15
 * «Alternativa de lista para C4, organigrama, mapa y flujos con iguales vínculos, condiciones y
 * acciones»; design-system.md §6 `.entity-list`).
 *
 * entityList(ctx, { title, note, groups: [{ id, title, subtitle, message, items: [...] }], testid })
 *   item = { ref (entityRef), meta, badge, relationLabel, selected, related, root, dimmed,
 *            versionId, testid, focusKey, command, actions: [{ id, label, command, enabled, reason }],
 *            children: [item] }
 * Every row is a molecules.entityLink (selectEntity by default, or `command`), optional action
 * buttons and nested children. Keyboard activation records a focusReturn so the inspector can
 * give focus back to the originating row. */
Primus.module('components/twin/entitylist', function (require) {
  'use strict';

  var dom = require('core/dom');

  function isKeyboard(event) {
    if (!event) return false;
    if (event.type === 'keydown' || event.type === 'keyup') return true;
    return event.type === 'click' && event.detail === 0;
  }

  function dispatch(ctx, type, payload) {
    if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload || {});
    return ctx.store.dispatch(type, payload || {});
  }

  function run(ctx, command) {
    if (!command) return null;
    if (typeof command === 'string') return dispatch(ctx, command, {});
    if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') {
      var target = command.payload && command.payload.target ? command.payload.target : command.payload;
      return ctx.navigate(target);
    }
    return dispatch(ctx, command.type, command.payload || {});
  }

  function row(ctx, item, depth) {
    var h = dom.h;
    var molecules = ctx.molecules || require('ds/molecules');
    var atoms = ctx.atoms || require('ds/atoms');
    var ref = item.ref;
    var focusKey = item.focusKey || ('node:' + (item.versionId ? item.versionId + ':' : '') + ref.id);
    var link = molecules.entityLink({
      entity: { id: ref.id, name: ref.name, type: ref.type },
      typeLabel: ref.typeLabel, icon: ref.icon || ref.type, showType: item.showType !== false,
      relationLabel: item.relationLabel || null, meta: item.meta || null,
      badge: item.badge ? (typeof item.badge === 'string' ? { label: item.badge, tone: atoms.labelTone ? atoms.labelTone(item.badge) : 'neutral' } : item.badge) : null,
      versionId: item.versionId || null, selected: !!item.selected,
      testid: item.testid || ('node-' + ref.id), focusKey: focusKey,
      onOpen: function (entity, event) {
        if (isKeyboard(event) && ctx.store && ctx.store.hasCommand && ctx.store.hasCommand('setFocusReturn')) dispatch(ctx, 'setFocusReturn', { focusKey: focusKey });
        if (item.command) run(ctx, item.command);
        else dispatch(ctx, 'selectEntity', item.versionId ? { entityId: ref.id, versionId: item.versionId } : { entityId: ref.id });
      }
    });
    link.setAttribute('aria-pressed', item.selected ? 'true' : 'false');
    if (item.related) link.classList.add('is-related');
    if (item.root) link.classList.add('is-root');
    if (item.dimmed) link.classList.add('is-dimmed');
    var actions = (item.actions || []).map(function (a) {
      return atoms.button({ label: a.label, variant: 'ghost', size: 'sm', testid: a.testid || ('list-action-' + a.id + '-' + ref.id), focusKey: 'list-action:' + a.id + ':' + ref.id,
        disabled: a.enabled === false, disabledReason: a.enabled === false ? a.reason || null : null, onClick: function () { run(ctx, a.command); } });
    });
    var children = (item.children || []).map(function (c) { return row(ctx, c, depth + 1); });
    return h('li', { 'data-entity-id': ref.id, 'data-version-id': item.versionId || null },
      h('div', { class: 'entity-list__row' }, link, actions.length ? h('span', { class: 'cluster cluster--sm' }, actions) : null),
      item.note ? h('p', { class: 'text-sm muted' }, item.note) : null,
      children.length ? h('ul', { class: 'entity-list__tree', role: 'list' }, children) : null);
  }

  function entityList(ctx, options) {
    var h = dom.h;
    var o = options || {};
    var groups = (o.groups || []).map(function (g, i) {
      var items = (g.items || []).map(function (it) { return row(ctx, it, 0); });
      var titleId = 'entity-list-' + (o.testid || 'list') + '-' + (g.id || i);
      return h('section', { class: 'entity-list__group', 'aria-labelledby': titleId, 'data-group-id': g.id || null },
        h('h3', { class: 'entity-list__group-title', id: titleId }, g.title, g.count !== undefined && g.count !== null ? h('span', { class: 'section-title__count' }, ' · ' + g.count) : null),
        g.subtitle ? h('p', { class: 'text-sm muted' }, g.subtitle) : null,
        g.message ? h('p', { class: 'panel-note' }, g.message) : null,
        items.length ? h('ul', { class: 'entity-list__tree', role: 'list' }, items) : (g.empty ? h('p', { class: 'muted text-sm' }, g.empty) : null));
    });
    return h('div', { class: 'entity-list stack stack--md', 'data-testid': o.testid || 'web-list' },
      o.title ? h('h3', { class: 'entity-list__group-title' }, o.title) : null,
      o.note ? h('p', { class: 'panel-note' }, o.note) : null,
      groups);
  }

  return { entityList: entityList, row: row, run: run };
});
