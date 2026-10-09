/* components/shell/header — presentation header (spec §8, ux.md §1, CONTRACTS §10/§11).
 *
 * createHeader(ctx) → { el, update(state) }. Renders the typographic wordmark
 * («PRÓSPERA» / «Grupo Inmobiliario»), the presentation title, subtitle and badges, and the
 * three profile-independent actions: «Ver prototipo web» (navigateTo web), «Reiniciar demo»
 * (requestReset) and «Acerca de esta demo» (openAbout). Every string comes from the pack
 * (client.* and presentation.*). The header is static; update(state) only mirrors the active
 * tab as a data attribute for styling hooks. */
Primus.module('components/shell/header', function (require) {
  'use strict';

  var dom = require('core/dom');
  var atoms = require('ds/atoms');

  function str(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function createHeader(ctx) {
    var h = dom.h;
    var pack = ctx.pack || {};
    var raw = pack.raw || {};
    var client = raw.client || {};
    var texts = pack.texts || raw.presentation || {};
    var actions = texts.actions || {};
    var ui = ctx.ui || pack.ui || {};
    var badges = Array.isArray(texts.badges) ? texts.badges : [];

    var titleId = 'primus-title';

    var viewWebBtn = atoms.button({
      label: str(actions.viewWeb),
      ariaLabel: str(actions.viewWeb),
      variant: 'primary',
      size: 'sm',
      icon: 'monitor',
      testid: 'btn-view-web',
      focusKey: 'shell:view-web',
      onClick: function () { ctx.navigate({ tab: 'web' }); }
    });

    var resetBtn = atoms.button({
      label: str(actions.reset),
      ariaLabel: str(actions.reset),
      variant: 'secondary',
      size: 'sm',
      icon: 'reset',
      testid: 'btn-reset',
      focusKey: 'shell:reset',
      onClick: function () { ctx.dispatch('requestReset', {}); }
    });

    var aboutBtn = atoms.button({
      label: str(actions.about),
      ariaLabel: str(actions.about),
      variant: 'ghost',
      size: 'sm',
      icon: 'info',
      testid: 'btn-about',
      focusKey: 'shell:about',
      haspopup: 'dialog',
      onClick: function () { ctx.dispatch('openAbout', {}); }
    });

    var el = h('div', { class: 'shell-header__inner', 'data-testid': 'shell-header' },
      h('div', { class: 'shell-header__brand' },
        h('p', { class: 'wordmark', 'aria-label': str(client.wordmark) + ' · ' + str(client.wordmarkTagline) },
          h('span', { class: 'wordmark__name' }, str(client.wordmark)),
          h('span', { class: 'wordmark__tagline' }, str(client.wordmarkTagline)))),
      h('div', { class: 'shell-header__titles' },
        h('h1', { class: 'shell-header__title', id: titleId }, str(texts.title)),
        texts.subtitle ? h('p', { class: 'shell-header__subtitle' }, str(texts.subtitle)) : null,
        badges.length ? h('div', { class: 'shell-header__badges', 'aria-label': ui.notices || 'Avisos' },
          badges.map(function (label, index) {
            return atoms.badge({ label: str(label), tone: index === 0 ? 'demo' : 'neutral', icon: index === 0 ? 'flag' : 'lock' });
          })) : null),
      h('div', { class: 'shell-header__actions', role: 'group', 'aria-label': ui.actions || 'Acciones' },
        viewWebBtn, resetBtn, aboutBtn));

    /* The host element in shell.html is the header itself (display: grid with named areas);
       the children above must be its direct children, so the inner wrapper uses display: contents
       semantics by simply exposing them. We return the three regions as a fragment-like array
       through `el.regions` and let main.js append them directly. */
    var regions = Array.prototype.slice.call(el.childNodes);

    function update(state) {
      var tab = state && state.app ? state.app.activeTab : null;
      regions.forEach(function (region) {
        if (region.setAttribute) region.setAttribute('data-active-tab', str(tab));
      });
      if (tab === 'web') viewWebBtn.setAttribute('aria-current', 'page');
      else viewWebBtn.removeAttribute('aria-current');
    }

    return { el: el, regions: regions, update: update, titleId: titleId };
  }

  return { createHeader: createHeader };
});
