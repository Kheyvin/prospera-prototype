/* components/shell/notices — global (shell-level) notices bound to state.app.notices.
 *
 * createNotices(ctx) → { el, update(state) }. Renders one molecules.notice per entry of
 * app.notices ({ id, text, tone?, title?, action?: { label, command?: { type, payload } |
 * target? }, dismissible? , messageId? }). The container is `hidden` while empty so it does
 * not take layout space. Re-renders only when the JSON of the list changes, through
 * dom.preserveFocus. Dismiss dispatches `dismissNotice`-style commands only when the store
 * knows them (`dismissAppNotice` / `dismissGlobalNotice`); otherwise the notice is kept. */
Primus.module('components/shell/notices', function (require) {
  'use strict';

  var dom = require('core/dom');
  var molecules = require('ds/molecules');

  var DISMISS_COMMANDS = ['dismissAppNotice', 'dismissGlobalNotice', 'dismissShellNotice'];

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function createNotices(ctx) {
    var h = dom.h;
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var el = h('div', { class: 'shell-notices stack stack--sm', 'data-testid': 'shell-notices', hidden: true });
    var lastJson = '[]';

    function dismissCommand() {
      var store = ctx.store;
      if (!store || typeof store.hasCommand !== 'function') return null;
      for (var i = 0; i < DISMISS_COMMANDS.length; i++) {
        if (store.hasCommand(DISMISS_COMMANDS[i])) return DISMISS_COMMANDS[i];
      }
      return null;
    }

    function runAction(action) {
      if (!action) return;
      if (action.command && action.command.type) {
        ctx.dispatch(action.command.type, action.command.payload || {});
      } else if (action.target) {
        ctx.navigate(action.target);
      }
    }

    function render(list) {
      var dismiss = dismissCommand();
      dom.clear(el);
      list.forEach(function (item, index) {
        var id = item && item.id !== undefined ? String(item.id) : String(index);
        var action = item && item.action && typeof item.action === 'object' && item.action.label ? {
          label: str(item.action.label),
          testid: 'shell-notice-action-' + id,
          onClick: function () { runAction(item.action); }
        } : null;
        var node = molecules.notice({
          text: str(item && item.text),
          title: item && item.title ? str(item.title) : null,
          tone: (item && item.tone) || 'info',
          action: action,
          testid: 'shell-notice',
          dismissLabel: ui.closeNotice,
          dismissTestid: 'shell-notice-dismiss-' + id,
          onDismiss: dismiss && item && item.dismissible !== false ? function () {
            ctx.dispatch(dismiss, { id: id });
          } : undefined
        });
        node.setAttribute('data-notice-id', id);
        if (item && item.messageId) node.setAttribute('data-message-id', str(item.messageId));
        el.appendChild(node);
      });
      el.hidden = list.length === 0;
    }

    function update(state) {
      var list = state && state.app && Array.isArray(state.app.notices) ? state.app.notices : [];
      var json = JSON.stringify(list);
      if (json === lastJson) return;
      lastJson = json;
      dom.preserveFocus(el, function () { render(list); });
    }

    return { el: el, update: update };
  }

  return { createNotices: createNotices };
});
