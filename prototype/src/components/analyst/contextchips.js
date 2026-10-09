/* components/analyst/contextchips — client / process / evidence / version chips of the studio
 * (spec DESK-01 "Chips iniciales"). Pure rendering of desktopModel.chips; nothing here is
 * interactive and no connection state is ever shown. */
Primus.module('components/analyst/contextchips', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createChips(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var lastKey = null;
    var listEl = h('ul', { class: 'studio-chips__list cluster cluster--sm', role: 'list' });
    var el = h('div', { class: 'studio-chips', role: 'group' }, listEl);

    function update(model) {
      if (!model) return;
      var regions = (model.texts && model.texts.regions) || {};
      var chips = Array.isArray(model.chips) ? model.chips : [];
      var key = JSON.stringify({ c: chips, l: regions.context });
      if (key === lastKey) return;
      lastKey = key;
      if (regions.context) el.setAttribute('aria-label', regions.context); else el.removeAttribute('aria-label');
      dom.replace(listEl, chips.map(function (label, index) {
        var icon = index === 0 ? 'organization' : null;
        return h('li', { class: 'studio-chips__item' }, atoms.chip({ label: label, icon: icon }));
      }));
    }

    return { el: el, update: update };
  }

  return { createChips: createChips };
});
