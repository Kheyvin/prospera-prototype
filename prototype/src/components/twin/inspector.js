/* components/twin/inspector — the twin inspector block (CONTRACTS §7.4, §8, §11; spec WEB-01;
 * ux.md §3 order and focus rules).
 *
 * createInspector(ctx) → { el, update(state), destroy() }
 *
 * `el` is the `.inspector` region (role=complementary, aria-label «Inspector»). `update(state)`
 * renders `ctx.select('inspectorModel')` in the ux.md §3 order: type + name + badges → facts →
 * characterization sections → typed related entities → provenance → actions. The DOM is
 * replaced only when the model's JSON changes, through dom.preserveFocus/preserveScroll.
 *
 * Focus (ux.md §3, spec §14.3): when the inspector opens from the keyboard (state.app.focusReturn
 * names the origin, or the active element has a visible focus ring) the heading receives focus;
 * «Volver al mapa» returns focus to the originating node; closing restores focus to the origin
 * or to the canvas viewport. Below 1280 px the region becomes a dialog with a focus trap and
 * Escape closes it. Every string comes from the model, pack.ui or a listed Spanish fallback. */
Primus.module('components/twin/inspector', function () {
  'use strict';

  var NARROW_QUERY = '(max-width: 1279px)';
  var HEADING_KEY = 'inspector-heading';
  var ACTION_ICONS = {
    'focus-area': 'graph', 'open-area': 'area', history: 'history', 'open-flow': 'process', 'view-sheet': 'document',
    compare: 'compare', incidents: 'incident', projects: 'project', sources: 'document', instruction: 'activity',
    connections: 'link', 'show-relations': 'graph', 'clear-relations': 'close', 'view-content': 'eye'
  };

  function createInspector(ctx) {
    var dom = ctx.dom;
    var atoms = ctx.atoms;
    var molecules = ctx.molecules;
    var icons = ctx.icons;
    var format = ctx.format;
    var h = dom.h;
    var ui = ctx.ui || {};

    function t(key, fallback) {
      var v = ui[key];
      return v === undefined || v === null || v === '' ? fallback : v;
    }

    function msgText(id) {
      var m = format.msg(id);
      return typeof m === 'string' ? m : (m && m.text) || id;
    }

    function run(command) {
      if (!command) return null;
      if (typeof command === 'string') return ctx.dispatch(command, {});
      if (command.type === 'navigateTo' && typeof ctx.navigate === 'function') {
        var target = command.payload && command.payload.target ? command.payload.target : command.payload;
        return ctx.navigate(target);
      }
      return ctx.dispatch(command.type, command.payload || {});
    }

    var el = h('div', {
      class: 'inspector',
      role: 'complementary',
      'aria-label': t('inspector', 'Inspector'),
      tabindex: '-1'
    });

    var lastJson = null;
    var lastSelectionKey = null;
    var origin = null;            // { focusKey, testid, element }
    var pendingHeadingFocus = false;
    var trapRelease = null;
    var mq = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(NARROW_QUERY) : null;
    var isOpen = false;

    /* ---------- DOM lookups (inside the twin panel only) ---------- */

    function root() {
      return (el.closest && (el.closest('.twin') || el.closest('[role="tabpanel"]'))) || el.parentElement || el;
    }

    function escapeAttr(value) {
      return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function findByKey(key) {
      if (!key) return null;
      return root().querySelector('[data-focus-key="' + escapeAttr(key) + '"]');
    }

    function findByTestid(id) {
      if (!id) return null;
      return root().querySelector('[data-testid="' + escapeAttr(id) + '"]');
    }

    function canvasFallback() {
      var r = root();
      return r.querySelector('[data-testid="web-canvas"]') || r.querySelector('.canvas') || r.querySelector('.twin-stage__title') || r.querySelector('[data-focus-key="tabpanel-heading:web"]');
    }

    function originElement() {
      if (!origin) return null;
      var node = findByKey(origin.focusKey) || findByTestid(origin.testid);
      if (!node && origin.element && origin.element.isConnected && !origin.element.closest('[hidden]')) node = origin.element;
      return node;
    }

    function safeFocus(node) {
      if (!node || typeof node.focus !== 'function') return false;
      try { node.focus({ preventScroll: true }); } catch (e) { try { node.focus(); } catch (e2) { return false; } }
      return document.activeElement === node;
    }

    function focusHeading() {
      var heading = el.querySelector('[data-focus-key="' + HEADING_KEY + '"]');
      return safeFocus(heading);
    }

    function focusOrigin() {
      var node = originElement();
      if (node && !el.contains(node) && safeFocus(node)) return true;
      return safeFocus(canvasFallback());
    }

    function captureOrigin(state, activeBefore) {
      var fr = state && state.app ? state.app.focusReturn : null;
      if (fr && fr.focusKey && !/^tabpanel-heading:/.test(fr.focusKey)) {
        return { focusKey: fr.focusKey, testid: null, element: findByKey(fr.focusKey) };
      }
      if (activeBefore && activeBefore !== document.body && !el.contains(activeBefore) && root().contains(activeBefore)) {
        return {
          focusKey: activeBefore.getAttribute ? activeBefore.getAttribute('data-focus-key') : null,
          testid: activeBefore.getAttribute ? activeBefore.getAttribute('data-testid') : null,
          element: activeBefore
        };
      }
      return null;
    }

    function keyboardOpened(state, activeBefore) {
      var fr = state && state.app ? state.app.focusReturn : null;
      if (fr && fr.focusKey) return !/^tabpanel-heading:/.test(fr.focusKey);
      if (!activeBefore || activeBefore === document.body || el.contains(activeBefore)) return false;
      if (!root().contains(activeBefore)) return false;
      try { return activeBefore.matches(':focus-visible'); } catch (e) { return false; }
    }

    /* ---------- modal mode (< 1280 px) ---------- */

    function syncModal() {
      var modal = isOpen && mq && mq.matches;
      if (modal && !trapRelease) {
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        trapRelease = dom.trapFocus(el);
        if (!el.contains(document.activeElement)) focusHeading();
      } else if (!modal && trapRelease) {
        trapRelease();
        trapRelease = null;
        el.setAttribute('role', 'complementary');
        el.removeAttribute('aria-modal');
      }
    }

    if (mq) {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', syncModal);
      else if (typeof mq.addListener === 'function') mq.addListener(syncModal);
    }

    /* ---------- actions ---------- */

    function close() {
      var result = ctx.dispatch('closeInspector', {});
      focusOrigin();
      origin = null;
      return result;
    }

    function back() {
      pendingHeadingFocus = true;
      ctx.dispatch('inspectorBack', {});
    }

    dom.onKey(el, {
      Escape: function (event) {
        if (!isOpen || event.defaultPrevented) return false;
        close();
        return true;
      }
    });

    /* ---------- builders ---------- */

    function entityLink(ref, options) {
      var o = options || {};
      return molecules.entityLink({
        entity: { id: ref.id, name: ref.name, type: ref.type },
        typeLabel: ref.typeLabel,
        icon: ref.icon || ref.type,
        relationLabel: o.relationLabel || null,
        badge: o.badge || null,
        meta: o.meta || null,
        versionId: o.versionId || null,
        compact: !!o.compact,
        showType: !!o.showType,
        testid: o.testid || ('inspector-link-' + ref.id),
        focusKey: o.focusKey || ('inspector-link:' + ref.id),
        onOpen: function () {
          if (o.command) run(o.command);
          else run({ type: 'selectEntity', payload: { entityId: ref.id, followLink: true } });
        }
      });
    }

    function badgeNode(b) {
      if (!b) return null;
      if (typeof b === 'string') return atoms.badge({ label: b, tone: atoms.labelTone(b) });
      return atoms.badge({ label: b.label, tone: b.tone || atoms.labelTone(b.label) });
    }

    function factValue(fact) {
      var parts = [];
      if (fact.entity) {
        parts.push(entityLink(fact.entity, { compact: true, testid: 'inspector-fact-' + fact.entity.id, focusKey: 'inspector-fact:' + fact.entity.id }));
      } else if (fact.value !== null && fact.value !== undefined && fact.value !== '') {
        parts.push(h('span', { class: 'inspector__fact-text' }, String(fact.value)));
      } else {
        parts.push(h('span', { class: 'is-missing' }, format.missing()));
      }
      if (fact.badge) parts.push(badgeNode(fact.badge));
      if (fact.note) parts.push(h('span', { class: 'text-sm muted' }, fact.note));
      if (Array.isArray(fact.items) && fact.items.length) {
        parts.push(molecules.list({
          plain: true,
          items: fact.items.map(function (it) {
            return { key: it.id, node: [it.label, it.note ? h('span', { class: 'text-sm muted' }, ' · ' + it.note) : null] };
          })
        }));
      }
      if (Array.isArray(fact.entities) && fact.entities.length) {
        parts.push(h('div', { class: 'inspector__links' }, fact.entities.map(function (e) {
          return entityLink(e, { compact: true, testid: 'inspector-fact-' + e.id, focusKey: 'inspector-fact:' + e.id });
        })));
      }
      return h('div', { class: 'stack stack--xs' }, parts);
    }

    function keyValue(facts) {
      return molecules.keyValue({
        missingText: format.missing(),
        rows: (facts || []).map(function (f) { return { label: f.label, value: factValue(f) }; })
      });
    }

    function sectionEl(title, children, extraClass) {
      return h('section', { class: ['inspector__section', extraClass || null] },
        title ? h('h4', { class: 'inspector__section-title' }, title) : null,
        children);
    }

    function indicatorBlock(ind, withName) {
      if (!ind) return null;
      var children = [];
      if (withName && ind.entity) {
        children.push(h('div', { class: 'cluster cluster--sm' },
          entityLink(ind.entity, { compact: true, command: ind.command }),
          badgeNode(ind.badge)));
      } else if (ind.badge) {
        children.push(badgeNode(ind.badge));
      }
      children.push(molecules.metric({
        label: t('value', 'Valor'),
        value: ind.value,
        missingText: ind.noMeasurement || ind.valueText || msgText('MSG-17'),
        target: ind.targetText || null,
        proposed: true
      }));
      children.push(keyValue([
        { label: t('formula', 'Fórmula'), value: ind.formula },
        { label: t('target', 'Meta'), value: ind.targetText },
        { label: t('measuredAt', 'Fecha de medición'), value: ind.measuredAtText }
      ]));
      return h('div', { class: 'stack stack--sm' }, children);
    }

    function renderSection(section) {
      switch (section.kind) {
        case 'facts':
          return sectionEl(section.title, [keyValue(section.facts), section.note ? h('p', { class: 'panel-note' }, section.note) : null]);
        case 'text':
          return sectionEl(section.title, [h('p', null, section.text), section.extra ? h('p', { class: 'panel-note' }, section.extra) : null]);
        case 'objective': {
          var obj = section.objective || {};
          return sectionEl(section.title, [
            obj.entity ? h('div', { class: 'cluster cluster--sm' }, entityLink(obj.entity, { command: obj.command }), badgeNode(obj.badge)) : null,
            obj.description ? h('p', { class: 'text-sm' }, obj.description) : null,
            section.indicator ? h('div', { class: 'stack stack--xs' },
              h('h5', { class: 'inspector__section-title' }, t('indicator', 'Indicador')),
              indicatorBlock(section.indicator, true)) : null
          ]);
        }
        case 'indicator':
          return sectionEl(section.title, indicatorBlock(section.indicator, section.id === 'indicator'));
        case 'processes': {
          var owned = section.owned || [];
          var participating = section.participating || [];
          return sectionEl(section.title, [
            owned.length || participating.length ? h('div', { class: 'inspector__links' },
              owned.map(function (p) { return entityLink(p, { relationLabel: t('owner', 'Dueño') }); }),
              participating.map(function (p) { return entityLink(p, { relationLabel: t('participant', 'Participante') }); })) : null,
            section.noDetail ? h('p', { class: 'inspector__empty' }, section.noDetail) : null
          ]);
        }
        default:
          return section.text ? sectionEl(section.title, h('p', null, section.text)) : null;
      }
    }

    function relatedSection(related) {
      if (!related) return null;
      var children = [];
      (related.groups || []).forEach(function (group) {
        children.push(h('div', { class: 'inspector__group' },
          h('span', { class: 'text-sm muted' }, group.label),
          h('div', { class: 'inspector__links' }, group.items.map(function (item) {
            if (item.kind === 'version' && item.version) {
              var v = item.version;
              return molecules.entityLink({
                entity: { id: v.id, name: v.label, type: 'version' },
                typeLabel: v.typeLabel,
                icon: 'version',
                relationLabel: item.relationLabel || null,
                meta: v.stateLabel || null,
                badge: v.isDemo ? { label: t('labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' } : null,
                versionId: v.id,
                testid: item.testid || ('inspector-link-' + v.id),
                focusKey: 'inspector-link:' + v.id,
                onOpen: function () { run(item.command); }
              });
            }
            var relation = item.relationLabel || null;
            if (item.note) relation = relation ? relation + ' · ' + item.note : item.note;
            return entityLink(item.entity, {
              relationLabel: relation,
              badge: item.badge ? { label: item.badge, tone: 'proposed' } : null,
              versionId: item.versionId || null,
              testid: item.testid || ('inspector-link-' + item.entity.id),
              command: item.command
            });
          }))));
      });
      if (related.hiddenRelatedNotice) {
        var hn = related.hiddenRelatedNotice;
        var first = hn.actions && hn.actions[0];
        var notice = molecules.notice({
          text: hn.text,
          tone: 'info',
          testid: 'inspector-hidden-layer',
          action: first ? { label: first.label, testid: 'inspector-show-layer-' + first.layerId, onClick: function () { run(first.command); } } : null
        });
        if (hn.actions && hn.actions.length > 1) {
          var body = notice.querySelector('.notice__body');
          hn.actions.slice(1).forEach(function (a) {
            body.appendChild(atoms.button({ label: a.label, variant: 'secondary', size: 'sm', testid: 'inspector-show-layer-' + a.layerId, extraClass: 'notice__action', onClick: function () { run(a.command); } }));
          });
        }
        children.push(notice);
      }
      if (related.empty && !(related.groups && related.groups.length)) {
        children.push(h('p', { class: 'inspector__empty' }, related.empty));
      }
      return sectionEl(t('relatedEntities', 'Elementos relacionados'), children, 'inspector__related');
    }

    function provenanceSection(prov) {
      if (!prov) return null;
      var children = [];
      children.push(atoms.provenance({
        labels: prov.labels || [],
        confidence: prov.confidence || null,
        dataState: prov.dataState || null,
        sourceIds: prov.sourceIds || [],
        sources: ctx.pack.sources,
        sourcesLabel: prov.label || t('sources', 'Fuentes')
      }));
      var meta = [];
      if (prov.confidenceLabel) meta.push({ label: t('confidence', 'Confianza'), value: prov.confidenceLabel });
      if (prov.sourceNodeIds) {
        var nodes = prov.sourceNodeIds;
        var text = Array.isArray(nodes) ? nodes.join(', ') : Object.keys(nodes).map(function (k) { return k + ': ' + (nodes[k] || []).join(', '); }).join(' · ');
        if (text) meta.push({ label: t('sourceNodes', 'Nodos del modelo fuente'), value: text, mono: true });
      }
      if (prov.isDemo) meta.push({ label: t('status', 'Estado'), value: t('labelDemoExample', 'Ejemplo de demostración') });
      if (meta.length) children.push(molecules.keyValue({ rows: meta, missingText: format.missing() }));
      return sectionEl(t('provenance', 'Proveniencia'), children, 'inspector__provenance');
    }

    function actionsRow(actions) {
      if (!actions || !actions.length) return null;
      return h('div', { class: 'inspector__actions' }, actions.map(function (a, index) {
        return atoms.button({
          label: a.label,
          variant: index === 0 && a.enabled ? 'primary' : 'secondary',
          size: 'sm',
          icon: ACTION_ICONS[a.id] || null,
          testid: a.testid || ('inspector-action-' + a.id),
          focusKey: 'inspector-action:' + a.id,
          disabled: a.enabled === false,
          disabledReason: a.enabled === false ? (a.reason || null) : null,
          onClick: function () { run(a.command); }
        });
      }));
    }

    function navRow(model, withBack) {
      var right = [];
      var left = [];
      if (withBack && model.canBack) {
        left.push(atoms.button({ label: model.backLabel || t('inspectorBack', 'Ficha anterior'), variant: 'ghost', size: 'sm', icon: 'back', testid: 'inspector-back', focusKey: 'inspector-back', onClick: back }));
      }
      if (withBack) {
        left.push(atoms.button({ label: t('backToMap', 'Volver al mapa'), variant: 'ghost', size: 'sm', icon: 'map', testid: 'inspector-back-to-map', focusKey: 'inspector-back-to-map', onClick: function () { focusOrigin(); } }));
      }
      right.push(atoms.iconButton({ icon: 'close', ariaLabel: (model && model.closeLabel) || t('closeInspector', 'Cerrar ficha'), testid: 'inspector-close', focusKey: 'inspector-close', onClick: close }));
      return h('div', { class: 'inspector__nav' }, h('div', { class: 'cluster cluster--sm' }, left), h('div', { class: 'cluster cluster--sm' }, right));
    }

    function header(model) {
      var hd = model.header || {};
      var badges = (hd.badges || []).slice();
      if (hd.proposed && !badges.some(function (b) { return b.tone === 'proposed'; })) badges.push({ label: t('labelProposed', 'Propuesto · por validar'), tone: 'proposed' });
      if (model.version && model.version.isDemo && !badges.some(function (b) { return b.tone === 'demo'; }) && model.kind === 'entity' && hd.type === 'activity') badges.push({ label: t('labelDemoExample', 'Ejemplo de demostración'), tone: 'demo' });
      return h('div', { class: 'inspector__header twin-inspector__header' },
        navRow(model, true),
        h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon(hd.icon || hd.type || 'circle'), hd.typeLabel || ''),
        h('h3', { class: 'inspector__title', id: 'inspector-heading', tabindex: '-1', 'data-testid': 'inspector-heading', 'data-focus-key': HEADING_KEY, 'data-entity-id': hd.id || null }, hd.name || ''),
        badges.length ? h('div', { class: 'cluster cluster--sm' }, badges.map(badgeNode)) : null,
        model.description ? h('p', { class: 'inspector__subtitle' }, model.description) : null,
        model.kind === 'entity' && model.version && hd.type === 'activity' && model.version.readOnlyLabel ? h('p', { class: 'text-sm muted' }, model.version.readOnlyLabel) : null);
    }

    function contextSummary() {
      var c;
      try { c = ctx.select('currentContext'); } catch (e) { c = null; }
      if (!c) return null;
      var parts = [c.title];
      if (c.module === 'security') return parts.join(' · ');
      parts.push(c.levelLabel);
      if (c.level === 'strategic') parts.push(c.representationLabel);
      else if (c.level === 'operational' && c.version) parts.push(c.version.label);
      return parts.filter(Boolean).join(' · ');
    }

    function renderEmpty() {
      var summary = contextSummary();
      return [
        h('div', { class: 'inspector__header twin-inspector__header' },
          h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon('info'), t('inspector', 'Inspector')),
          h('h3', { class: 'inspector__title', id: 'inspector-heading', tabindex: '-1', 'data-testid': 'inspector-heading', 'data-focus-key': HEADING_KEY }, t('emptySelection', 'Selecciona un elemento para ver su ficha'))),
        molecules.emptyState({ text: msgText('MSG-01'), detail: null, icon: 'graph', compact: true, testid: 'inspector-empty', extraClass: 'inspector__empty' }),
        summary ? h('p', { class: 'panel-note', 'data-testid': 'inspector-context' }, t('currentContext', 'Contexto actual') + ': ' + summary) : null
      ];
    }

    function renderRestricted(model) {
      var n = model.notice || {};
      var actionLabel = n.action || (n.cta && n.cta.label) || t('backToOrganization', 'Volver al inicio de la organización');
      return [
        h('div', { class: 'inspector__header twin-inspector__header' },
          navRow(model, false),
          h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon('lock'), t('restricted', 'Acceso restringido')),
          h('h3', { class: 'inspector__title', id: 'inspector-heading', tabindex: '-1', 'data-testid': 'inspector-heading', 'data-focus-key': HEADING_KEY }, t('restricted', 'Acceso restringido'))),
        molecules.notice({
          text: n.text || msgText('MSG-02'),
          tone: 'warning',
          testid: 'inspector-restricted',
          action: {
            label: actionLabel,
            testid: 'inspector-restricted-action',
            onClick: function () {
              ctx.dispatch('closeInspector', {});
              run(n.cta && n.cta.command ? n.cta.command : 'backToOrganization');
            }
          }
        })
      ];
    }

    function renderEntity(model) {
      var children = [header(model)];
      if (model.facts && model.facts.length) children.push(sectionEl(t('facts', 'Datos'), keyValue(model.facts), 'inspector__facts'));
      (model.sections || []).forEach(function (s) { var node = renderSection(s); if (node) children.push(node); });
      children.push(relatedSection(model.related));
      children.push(provenanceSection(model.provenance));
      children.push(actionsRow(model.actions));
      return children;
    }

    /* ---------- update ---------- */

    function update(state) {
      var model = null;
      try { model = ctx.select('inspectorModel'); } catch (e) { model = null; }
      var open = !!model && !!(state && state.web && state.web.selection);
      var selectionKey = model ? JSON.stringify(model.selection || null) + (model.restricted ? '|restricted' : '') : null;
      var json = JSON.stringify(model) + '|' + (model ? '' : contextSummary());
      var activeBefore = typeof document !== 'undefined' ? document.activeElement : null;
      var selectionChanged = selectionKey !== lastSelectionKey;
      var focusWasInside = !!activeBefore && el.contains(activeBefore) && activeBefore !== el;

      if (selectionChanged && open && !lastSelectionKey) {
        origin = captureOrigin(state, activeBefore);
      }
      var shouldFocusHeading = false;
      if (selectionChanged && open) {
        if (pendingHeadingFocus || focusWasInside) shouldFocusHeading = true;
        else if (!lastSelectionKey && keyboardOpened(state, activeBefore)) shouldFocusHeading = true;
      }
      pendingHeadingFocus = false;
      isOpen = open;
      lastSelectionKey = selectionKey;

      if (!el.getAttribute('data-testid') && !(el.parentElement && el.parentElement.closest('[data-testid="inspector"]'))) {
        el.setAttribute('data-testid', 'inspector');
      }
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-empty', !open);

      if (json !== lastJson) {
        lastJson = json;
        var scroller = (el.parentElement && el.parentElement.closest('.twin-inspector')) || el;
        dom.preserveScroll(scroller, function () {
          dom.preserveFocus(el, function () {
            var children;
            if (!model) children = renderEmpty();
            else if (model.restricted) children = renderRestricted(model);
            else children = renderEntity(model);
            dom.replace(el, children);
          });
        });
      }

      if (selectionChanged && open && model && !model.restricted && model.header) {
        dom.announce((model.header.typeLabel ? model.header.typeLabel + ': ' : '') + (model.header.name || ''));
      }
      if (selectionChanged && open && model && model.restricted) {
        dom.announce((model.notice && model.notice.text) || msgText('MSG-02'));
      }
      if (shouldFocusHeading) focusHeading();
      if (!open && selectionChanged) {
        origin = null;
      }
      syncModal();
      return model;
    }

    function destroy() {
      if (trapRelease) { trapRelease(); trapRelease = null; }
      if (mq) {
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', syncModal);
        else if (typeof mq.removeListener === 'function') mq.removeListener(syncModal);
      }
    }

    return { el: el, update: update, destroy: destroy, focusHeading: focusHeading, focusOrigin: focusOrigin };
  }

  return { createInspector: createInspector };
});
