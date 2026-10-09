/* components/analyst/roster — workspace / session roster of the analyst studio (spec DESK-01,
 * ux.md §6 "Workspace roster"). Renders desktopModel.workspaces as native buttons
 * (data-testid workspace-<id>) plus a labelled <select> for narrow screens; every click
 * dispatches selectWorkspace. No DOM work at factory time. */
Primus.module('components/analyst/roster', function (require) {
  'use strict';

  var dom = require('core/dom');

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function createRoster(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var icons = ctx.icons || require('ds/icons');
    var format = ctx.format || (ctx.store && ctx.store.format);
    var uiMap = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var lastKey = null;

    function ui(key, fallback, params) {
      var value = typeof uiMap[key] === 'string' && uiMap[key] ? uiMap[key] : fallback;
      if (params && format && typeof format.interpolate === 'function') return format.interpolate(value, params);
      return value;
    }

    function dispatch(type, payload) {
      if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload);
      return ctx.store.dispatch(type, payload);
    }

    function selectWorkspace(id) {
      dispatch('selectWorkspace', { workspaceId: id });
    }

    function workspaceIcon(ws) {
      var record = ctx.pack && ctx.pack.workspaces && typeof ctx.pack.workspaces.get === 'function'
        ? ctx.pack.workspaces.get(ws.id) : null;
      return record && record.processId ? 'process' : 'organization';
    }

    var titleEl = h('h3', { class: 'studio-roster__title', id: 'studio-roster-title' }, '');
    var selectWrap = h('div', { class: 'studio-roster__select' });
    var listEl = h('div', { class: 'studio-roster__list', role: 'list' });
    var el = h('aside', { class: 'studio-roster', 'aria-labelledby': 'studio-roster-title' }, titleEl, selectWrap, listEl);

    function row(ws, model) {
      var unreadText = ws.unread ? ui('newMessages', '{n} mensajes nuevos', { n: ws.unread }) : null;
      var statusText = str(ws.statusLabel);
      var attention = !!ws.needsAttention;
      var pendingText = ws.pendingReview && model.footer && model.footer.pendingReview ? model.footer.pendingReview : null;
      return h('div', { role: 'listitem' },
        h('button', {
          type: 'button',
          class: ['workspace-row', ws.selected ? 'is-selected' : null],
          'aria-current': ws.selected ? 'true' : null,
          'data-testid': 'workspace-' + ws.id,
          'data-focus-key': 'workspace:' + ws.id,
          'data-workspace-id': ws.id,
          'data-session-id': ws.sessionId || null,
          on: { click: function () { selectWorkspace(ws.id); } }
        },
        h('span', { class: 'workspace-row__icon', 'aria-hidden': 'true' }, icons.icon(workspaceIcon(ws))),
        h('span', { class: 'workspace-row__name' }, str(ws.label)),
        h('span', { class: ['workspace-row__status', attention ? 'is-attention' : null] },
          pendingText ? pendingText : statusText),
        ws.unread ? h('span', { class: 'workspace-row__unread' },
          h('span', { 'aria-hidden': 'true' }, String(ws.unread)),
          h('span', { class: 'sr-only' }, ' ' + unreadText)) : null));
    }

    function update(model) {
      if (!model) return;
      var regions = (model.texts && model.texts.regions) || {};
      var key = JSON.stringify({ w: model.workspaces, r: regions.workspaces, p: model.footer && model.footer.pendingReview });
      if (key === lastKey) return;
      lastKey = key;
      dom.preserveFocus(el, function () {
        var title = regions.workspaces || ui('menu', 'Espacios y sesiones');
        dom.setText(titleEl, title);
        var workspaces = Array.isArray(model.workspaces) ? model.workspaces : [];
        var selected = workspaces.filter(function (ws) { return ws.selected; })[0];
        dom.replace(selectWrap, atoms.field({
          id: 'workspace-select',
          label: title,
          control: atoms.select({
            id: 'workspace-select',
            value: selected ? selected.id : (model.workspaceId || ''),
            options: workspaces.map(function (ws) { return { value: ws.id, label: ws.label + (ws.statusLabel ? ' · ' + ws.statusLabel : '') }; }),
            onChange: function (value) { if (value) selectWorkspace(value); }
          })
        }));
        dom.replace(listEl, workspaces.map(function (ws) { return row(ws, model); }));
      });
    }

    return { el: el, update: update };
  }

  return { createRoster: createRoster };
});
