/* components/shell/about — «Acerca de esta demo» dialog (spec §14.4, CONTRACTS §11).
 *
 * createAbout(ctx) → { el, update(state) }. A molecules.modal (focus trap, inert background,
 * Escape closes, focus restored to the opener) bound to state.app.aboutOpen: update() opens
 * it when the flag turns true and closes it when it turns false. Closing from inside the
 * dialog («Entendido», ×, Escape) dispatches closeAbout. Texts: presentation.about. */
Primus.module('components/shell/about', function (require) {
  'use strict';

  var dom = require('core/dom');
  var molecules = require('ds/molecules');

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function createAbout(ctx) {
    var pack = ctx.pack || {};
    var raw = pack.raw || {};
    var texts = pack.texts || raw.presentation || {};
    var about = texts.about || {};
    var ui = ctx.ui || pack.ui || {};
    var closing = false;

    var api = molecules.modal({
      id: 'about-dialog',
      testid: 'about-dialog',
      title: str(about.title),
      size: 'md',
      body: dom.h('p', { class: 'modal__text' }, str(about.text)),
      closeLabel: ui.close,
      closeTestid: 'about-close',
      initialFocus: '[data-testid="about-ok"]',
      actions: [
        {
          label: str(about.button),
          variant: 'primary',
          testid: 'about-ok',
          onClick: function (event, modalApi) { modalApi.close('ok'); }
        }
      ],
      onClose: function () {
        if (closing) return;
        var state = ctx.store.getState();
        if (state && state.app && state.app.aboutOpen) ctx.dispatch('closeAbout', {});
      }
    });

    function update(state) {
      var open = !!(state && state.app && state.app.aboutOpen);
      if (open && !api.isOpen()) {
        api.open();
      } else if (!open && api.isOpen()) {
        closing = true;
        try { api.close('state'); } finally { closing = false; }
      }
    }

    return { el: api.el, update: update, dialog: api };
  }

  return { createAbout: createAbout };
});
