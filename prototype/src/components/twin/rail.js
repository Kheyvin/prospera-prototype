/* components/twin/rail — level / representation / depth / layers rail of the twin (spec §8,
 * WEB-01, §15; CONTRACTS §11 web-level-*, web-rep-*, web-depth-*, layer-*, area-select,
 * process-select, security-nav).
 *
 * createRail(ctx) → { el, update(state) }. Renders `select('currentContext')`: the three
 * management levels, the strategic representations, the tactical area selector, the
 * operational process selector, the orgchart depth presets, the layer toggles and, for
 * administrators only, the «Usuarios y accesos» entry. Every click is a command; the rail
 * never reads permissions itself. Re-rendered only when its model JSON changes. */
Primus.module('components/twin/rail', function (require) {
  'use strict';

  var dom = require('core/dom');

  function createRail(ctx) {
    var h = dom.h;
    var atoms = ctx.atoms || require('ds/atoms');
    var icons = ctx.icons || require('ds/icons');
    var ui = ctx.ui || (ctx.pack && ctx.pack.ui) || {};
    var fallbacks = (function () { try { return require('core/selectors').UI_FALLBACKS || {}; } catch (e) { return {}; } })();
    var lastKey = null;
    var onClose = typeof ctx.onCloseRail === 'function' ? ctx.onCloseRail : null;

    function t(key, fallback) {
      var v = ui[key];
      if (v !== undefined && v !== null && typeof v !== 'object') return v;
      if (fallbacks[key] !== undefined) return fallbacks[key];
      return fallback === undefined ? key : fallback;
    }

    function dispatch(type, payload) {
      if (typeof ctx.dispatch === 'function') return ctx.dispatch(type, payload || {});
      return ctx.store.dispatch(type, payload || {});
    }

    var body = h('div', { class: 'twin-rail__body stack stack--lg' });
    var el = h('aside', { class: 'twin-rail', 'aria-label': t('moduleNavigation', 'Navegación del módulo'), 'data-testid': 'twin-rail' },
      atoms.iconButton({ icon: 'close', ariaLabel: t('close', 'Cerrar'), extraClass: 'twin-rail__close', testid: 'rail-close', onClick: function () { if (onClose) onClose(); } }),
      body);

    function group(title, options, extra) {
      return h('div', { class: 'twin-rail__group', role: 'group', 'aria-label': title },
        h('span', { class: 'twin-rail__title' }, title),
        h('div', { class: 'twin-rail__options' }, options),
        extra || null);
    }

    function optionButton(item, iconName, onClick) {
      return atoms.button({
        label: item.label, variant: 'ghost', size: 'sm', icon: iconName || null, pressed: !!item.selected,
        extraClass: 'twin-rail__option', testid: item.testid, focusKey: 'rail:' + item.testid,
        disabled: item.enabled === false, disabledReason: item.enabled === false ? item.reason || null : null,
        onClick: onClick
      });
    }

    function levelIcon(id) { return id === 'strategic' ? 'organization' : id === 'tactical' ? 'area' : 'process'; }
    function repIcon(id) { return id === 'orgchart' ? 'organization' : id === 'processmap' ? 'map' : 'graph'; }

    function selectLevel(level, model) {
      if (model.module === 'security') dispatch('setModule', { module: 'twin' });
      dispatch('setLevel', { level: level });
    }

    function render(model) {
      var parts = [];
      parts.push(group(t('level', 'Nivel'), model.levels.map(function (l) {
        return optionButton(Object.assign({}, l, { selected: l.selected && model.module !== 'security' }), levelIcon(l.id), function () { if (!l.selected || model.module === 'security') selectLevel(l.id, model); });
      })));

      if (model.module !== 'security' && model.level === 'strategic') {
        parts.push(group(t('representation', 'Representación'), model.representations.map(function (r) {
          return optionButton(r, repIcon(r.id), function () { if (!r.selected) dispatch('setRepresentation', { representation: r.id }); });
        })));
        if (model.representation === 'orgchart') {
          parts.push(group(t('depth', 'Profundidad'), model.depths.map(function (d) {
            return optionButton(d, null, function () { if (!d.selected) dispatch('setDepth', { depth: d.id }); });
          })));
        }
      }

      if (model.module !== 'security' && model.level === 'tactical') {
        var areaOptions = [{ value: '', label: t('selectArea', 'Selecciona un área') }].concat(model.areas.map(function (a) { return { value: a.id, label: a.label }; }));
        parts.push(group(t('area', 'Área'), [atoms.field({
          id: 'area-select', label: t('areaSpace', 'Espacio del área'),
          control: atoms.select({ id: 'area-select', testid: 'area-select', focusKey: 'rail:area-select', value: model.areaId || '', options: areaOptions, size: 'sm',
            onChange: function (value) { if (value) dispatch('enterArea', { areaId: value }); } })
        })]));
      }

      if (model.module !== 'security' && model.level === 'operational') {
        var processOptions = [{ value: '', label: t('selectProcess', 'Selecciona un proceso') }].concat(model.processes.map(function (p) { return { value: p.id, label: p.label + (p.detailed ? '' : ' · ' + t('summary', 'Resumen')) }; }));
        parts.push(group(t('process', 'Proceso'), [atoms.field({
          id: 'process-select', label: t('process', 'Proceso'),
          control: atoms.select({ id: 'process-select', testid: 'process-select', focusKey: 'rail:process-select', value: model.processId || '', options: processOptions, size: 'sm',
            onChange: function (value) { if (value) dispatch('enterProcess', { processId: value, view: 'sheet' }); } })
        })]));
      }

      if (model.module !== 'security' && model.layers && model.layers.length) {
        parts.push(group(t('layers', 'Capas'), model.layers.map(function (l) {
          return atoms.checkbox({ id: 'layer-' + l.id, label: l.label, checked: !!l.on, testid: l.testid, focusKey: 'rail:layer:' + l.id,
            onChange: function (checked) { dispatch('toggleLayer', { layerId: l.id, on: checked }); } });
        })));
      }

      var footer = null;
      if (model.securityAllowed) {
        footer = h('div', { class: 'twin-rail__footer' },
          atoms.button({ label: model.securityLabel, variant: model.module === 'security' ? 'secondary' : 'ghost', size: 'sm', icon: 'shield', pressed: model.module === 'security',
            extraClass: 'twin-rail__option', testid: 'security-nav', focusKey: 'rail:security-nav',
            onClick: function () { if (model.module !== 'security') dispatch('setSecurityView', { view: model.securityView || 'accounts' }); } }));
      }
      dom.replace(body, parts, footer);
    }

    function update(state) {
      var model;
      try { model = ctx.select('currentContext'); } catch (e) { model = null; }
      if (!model) return;
      var key = JSON.stringify({
        m: model.module, l: model.level, r: model.representation, d: model.depth, a: model.areaId, p: model.processId,
        areas: model.areas, processes: model.processes, layers: model.layers, sec: model.securityAllowed, sv: model.securityView
      });
      if (key === lastKey) return;
      lastKey = key;
      dom.preserveFocus(el, function () { render(model); });
    }

    return { el: el, update: update };
  }

  return { createRail: createRail };
});
