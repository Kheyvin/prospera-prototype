/* components/shell/reset — reset confirmation (spec §14.3 «¿Reiniciar la demostración?…»,
 * FR-025, JRN-11; CONTRACTS §11 reset-dialog / reset-confirm / reset-cancel).
 *
 * createResetDialog(ctx) → { el, update(state) }. Bound to state.app.modal.kind ===
 * 'reset-confirm' (set by requestReset when there is unsaved work). A fresh molecules.confirm
 * is created on every open (the molecule's decided flag is single-use). Confirm dispatches
 * resetDemo { force: true }; Cancel, × and Escape dispatch closeModal and keep everything. */
Primus.module('components/shell/reset', function (require) {
  'use strict';

  var molecules = require('ds/molecules');

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function createResetDialog(ctx) {
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var texts = ui.resetConfirm && typeof ui.resetConfirm === 'object' ? ui.resetConfirm : {};
    var title = str(texts.title) || '¿Reiniciar la demostración? Se perderán los cambios, las versiones de prueba y los borradores de esta sesión';
    var cancelLabel = str(texts.cancel) || str(ui.cancel) || 'Cancelar';
    var confirmLabel = str(texts.confirm) || 'Reiniciar';
    var current = null;
    var closingFromState = false;

    function isRequested(state) {
      return !!(state && state.app && state.app.modal && state.app.modal.kind === 'reset-confirm');
    }

    function open() {
      var dialog = molecules.confirm({
        id: 'reset-dialog',
        testid: 'reset-dialog',
        title: title,
        text: '',
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        closeLabel: ui.close,
        closeTestid: 'reset-close',
        confirmTestid: 'reset-confirm',
        cancelTestid: 'reset-cancel',
        danger: true,
        focusConfirm: false,
        open: false,
        onConfirm: function () {
          ctx.dispatch('resetDemo', { force: true });
        },
        onClose: function (reason) {
          if (current === dialog) current = null;
          if (closingFromState || reason === 'confirm') return;
          if (isRequested(ctx.store.getState())) ctx.dispatch('closeModal', {});
        }
      });
      /* The confirm molecule always renders a body paragraph; the reset question is the
         dialog title itself (spec §14.3), so the empty paragraph is removed and the
         alertdialog is described by its title. */
      var emptyText = dialog.dialog.querySelector('.modal__text');
      if (emptyText && !emptyText.textContent && emptyText.parentNode) emptyText.parentNode.removeChild(emptyText);
      var titleEl = dialog.dialog.querySelector('.modal__title');
      if (titleEl && titleEl.id) dialog.dialog.setAttribute('aria-describedby', titleEl.id);
      current = dialog;
      dialog.open();
    }

    function update(state) {
      var requested = isRequested(state);
      if (requested && !current) {
        open();
      } else if (!requested && current) {
        var dialog = current;
        current = null;
        closingFromState = true;
        try { dialog.close('state'); } finally { closingFromState = false; }
      }
    }

    return {
      get el() { return current ? current.el : null; },
      update: update,
      isOpen: function () { return !!current; }
    };
  }

  return { createResetDialog: createResetDialog };
});
