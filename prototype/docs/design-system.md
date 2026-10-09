# PRIMUS para Próspera — design system (PRENTER portable bank)

Reference for feature and component agents. Everything visual comes from
`src/ds/*.css` + `src/styles/*.css` (CSS) and `ds/icons`, `ds/atoms`, `ds/molecules`
(JS factories registered with `Primus.module`). Tokens are the only source of colour,
spacing, radius and type; components never invent a colour for a client record.
The development catalog `src/ds/catalog.html` renders every token, variant and state
(open it directly in a browser; it is not part of the manifest and never ships).

Bundle order (manifest): `ds/tokens.css → ds/extensions.css → ds/base.css → ds/atoms.css →
ds/molecules.css → styles/layout.css → styles/visualization.css → styles/responsive.css →
styles/print.css`. JS: `ds/icons → ds/atoms → ds/molecules` (after `core/dom`).

## 1. Tokens

| File | Content |
| --- | --- |
| `ds/tokens.css` | Verbatim PRENTER `:root` blocks from `prototype-prospera/references/prenter/tokens.css` (git 2c6feb6) minus the legacy `.panel/.panel2/.text-muted` helpers; `.eyebrow` kept. Fonts: `--font-display` (Coco Gothic → Jost → system-ui), `--font-body` (Sansation → Mulish → system-ui), `--font-mono` (JetBrains Mono → ui-monospace). Teal ramp, neutrals, dark surfaces (`--color-dark-bg/surface/raised/border`), `--text-on-dark[-muted|-faint|-brand]`, `--color-success-dark/warning-dark/danger-dark`, `--space-1…10`, `--radius-sm/md/lg/xl/pill`, `--shadow-*`, `--text-*`, `--leading-*`, `--weight-*`, `--tracking-*`, `--container-max` (1200) / `--container-narrow` (760). |
| `ds/extensions.css` | Prototype tokens: `--layout-header` 72, `--layout-tabs` 48, `--layout-contextbar` 56, `--layout-rail` 224, `--layout-inspector` 360 (`-min` 320 / `-max` 420), `--layout-roster` 260, `--layout-side` 380, `--layout-sheet-max` 85vh, `--layout-gutter[-wide]`; `--control-min-target` 44, `--control-height-sm/md/lg` 36/44/52, `--control-radius`; `--duration-fast/normal` 120/180 ms (0 under reduced motion), `--easing-standard`; `--z-base/sticky/inspector/dialog/toast` 0/10/20/30/40; `--graph-node-min-width` 176, `--graph-node-max-width` 240, `--graph-node-min-height` 56, `--graph-node-gap` 24, `--graph-line-default/selected` 1/2, `--graph-decision-size` 112, `--graph-event-size` 56, `--graph-chip-height` 28, `--lane-height` 168, `--lane-label-width` 144, `--band-min-height` 120, `--band-label-width` 160; `--tint-*` alpha variants of PRENTER colours; `--control-surface/border/placeholder` (dark inputs); `--material-<type>-surface/border/style/radius/glyph` for organization, area, position, person, external, macroprocess, process, activity, decision, event, role, system, document, policy, objective, indicator, gap, incident, project, version, proposed; `--edge-*`, `--lane-*`, `--band-*`. |

Rule: consume with `var(--…)`. Do not add raw hex values in components. New token
families go to `extensions.css` and are shown in the catalog.

## 2. Base (`ds/base.css`)

Reset (box-sizing, zero margins, `button` reset, `[hidden] { display: none !important }`,
`[inert]` pointer-events none), body 16 px / 1.5 `--font-body` on `--color-dark-bg`,
headings in `--font-display` (h1 clamp 36–48 px, h2 28 px, h3 22 px; inside `.twin`/`.studio`
h2/h3 are 22 px), links teal underlined, `code/kbd/pre` mono, `::selection` teal-700,
global `:focus-visible` ring (3 px `--color-focus-ring`, offset 2 px, ≥ 3:1 on every dark
surface), `.sr-only`, `.skip-link`, reduced motion (all transitions/animations 0).

Utilities: `.stack[--xs|--sm|--md|--lg|--xl]` (vertical rhythm), `.cluster[--sm|--lg|--between|--end|--start]`
(wrapping flex row), `.grow`, `.mono`, `.tabular`, `.muted`, `.faint-meta` (decorative
metadata only, never essential values), `.brand-text`, `.text-sm/.text-xs/.text-lg`,
`.text-narrow` (760), `.container` (1200), `.truncate`, `.nowrap`, `.wrap-any`, `.uppercase`,
`.text-center`, `.hide-wide` (shown only < 768) / `.hide-narrow` (hidden < 768), `.prose`
(readable rhythm with real list bullets), `.eyebrow` (PRENTER mono overline).

## 3. Icons (`ds/icons`)

`icons.icon(name, { label?, size?, extraClass? })` → `<svg class="icon icon--<name>">`,
24 viewBox, `stroke="currentColor"`, 1.5 px, `aria-hidden="true"`; with `label` →
`role="img"` + `<title>` + `aria-labelledby`. `size` (number → px, or any CSS length) sets
width/height inline; otherwise `svg.icon` is 1.25em. Unknown names render the fallback
`circle` with `data-icon-missing="<name>"`. `icons.has(name)`, `icons.names()`.

Names (CONTRACTS §8 plus aliases): organization/building, area, macroprocess, process,
activity, role, position, person/user, external/externalProvider/externalActor, system/monitor,
document, policy, shield, objective, indicator, gap/warning, incident/flag, project/folder,
version, decision, event, start, end, close, back, forward, arrowUp, arrowDown, search,
zoomIn, zoomOut, fit, reset, chevronDown/Right/Up/Left, check, error, info, list, map,
menu, externalLink, play, pause, stop, retry, plus, minus, edit, trash, lock, gear,
database, window, terminal, cloud, graph, history, link, send, clock, calendar, filter,
layers, compare, table, sort, sortAsc, sortDesc, home, eye, circle, dot, spinner.

Spec §13 mapping: organización→`organization`, área→`area`, proceso→`process`,
actividad→`activity`, rol→`role`, puesto→`position`, persona→`person`, sistema→`system`,
documento→`document`, política→`policy`, objetivo→`objective`, indicador→`indicator`,
brecha→`gap`, incidencia→`incident`, proyecto→`project`.

## 4. Atoms (`ds/atoms`)

All factories return a DOM element; options are plain objects. Common extras on most
factories: `testid` (→ `data-testid`), `focusKey` (→ `data-focus-key`, for
`dom.preserveFocus`), `extraClass`, `attrs` (merged with `dom.setAttrs`).

| Factory | Options | DOM / behaviour |
| --- | --- | --- |
| `button` | `label, variant ('primary'\|'secondary'\|'ghost'\|'danger'), size ('sm'\|'md'\|'lg'), icon (name or Node), iconOnly, ariaLabel, onClick(event), disabled, disabledReason, busy, type, testid, pressed, expanded, controls, id, extraClass, title, haspopup, name, value` | `<button class="btn btn--variant btn--size">` with `.btn__icon` + `.btn__label`. Heights 36/44/52. `disabled` → `aria-disabled="true"` + `.is-disabled`, stays focusable, click swallowed. `disabledReason` → returns a `<span class="btn-wrap">` containing the button and `<span class="btn__reason">` (wired with `aria-describedby`; `wrap.control` is the button). `busy` → `aria-busy` + spinner icon + visible label, click swallowed. `iconOnly` requires `ariaLabel` (falls back to `label`; throws if neither). `pressed` → `aria-pressed`, `expanded` → `aria-expanded`, `controls` → `aria-controls`. |
| `iconButton` | `icon, ariaLabel, onClick, pressed, expanded, controls, testid, size, variant (default ghost), disabled, disabledReason, busy, id, extraClass, attrs` | `button` with `iconOnly: true`, class `.icon-btn`. |
| `badge` | `label, tone ('neutral'\|'brand'\|'success'\|'warning'\|'danger'\|'proposed'\|'demo'\|'info'), icon (name, Node, or `false` to suppress the automatic tone glyph)` | `<span class="badge badge--tone">`. Automatic glyphs: success check, warning warning, danger error, demo flag, proposed edit. `proposed` = dashed teal border; `demo` = warning tone, dashed, flag. |
| `chip` | `label, icon, onRemove, selected, onClick, removeLabel, removeTestid` | Informative `<span class="chip">`; `onClick` → `<button class="chip chip--interactive" aria-pressed>`; `onRemove` → `.chip` span with `.chip__main` and a separate `.chip__remove` icon button (never nested buttons). |
| `card` | `title, subtitle, eyebrow, children, quiet, raised, selected, current, as ('section'\|'article'\|'div'), headingLevel (1–6, default 3), actions, id` | `<section class="card">` with `.card__header` (`.card__eyebrow`, `.card__title`, `.card__subtitle`), `.card__body`, `.card__actions`. `aria-labelledby` points at the title. `selected` → `.is-selected` outline. No button role; put real actions inside. |
| `field` | `id, label, hint, error, required, optional, control (Node), requiredText, optionalText, inline` | `<div class="field">` + `<label for=id>` + `.field__hint#id-hint` + `.field__control` + `.field__error#id-error` (icon + text). Wires `aria-describedby`, `aria-invalid="true"` on error, `aria-required`. `.is-invalid` colours the control border. |
| `input` | `id, type, value, onInput(value, event), onChange, onKeydown, placeholder, maxlength, minlength, min, max, pattern, ariaLabel, testid, disabled, readOnly, name, autocomplete, inputmode, invalid, size ('sm')` | `<input class="input">` dark variant (`color-scheme: dark`). |
| `textarea` | `id, value, onInput, onKeydown, rows, maxlength, placeholder, testid, disabled, readOnly, mono, invalid` | `<textarea class="textarea">`. |
| `select` | `id, value, options [{ value, label, disabled }], onChange(value, event), testid, ariaLabel, disabled, invalid, size` | `<select class="select">` (native, dark). |
| `checkbox` | `id, label, checked, onChange(checked, event), testid, disabled, invalid, describedBy, name` | `<label class="checkbox">` + hidden native input + `.checkbox__box` + `.checkbox__label`. `el.controlEl` is the input (a `<label>` already owns a read-only `control` getter). |
| `spinner` | `label, labelHidden` | `<span class="spinner" role="status">` with rotating arc and visible text. |
| `divider` | — | `<hr class="divider">`. |
| `kbd` | `(text)` | `<kbd class="kbd">`. |
| `provenance` | `labels: string[], confidence, dataState, sourceIds: string[], sources: Map\|object (id → { id, title, section }), onOpenSources, sourcesLabel, openLabel, openTestid` | `<div class="provenance">`: `.provenance__labels` badges with the tone per exact label («Fuente del cliente» brand, «Síntesis de las fuentes» neutral, «Relación por validar» warning, «Relación propuesta»/«Propuesto · por validar» proposed, «Ejemplo de demostración» demo, «Sin dato proporcionado» neutral) + `.provenance__sources` “Fuentes: S-ORG · title (section)” list + optional «Ver fuentes» ghost button. |

Also exported: `setTexts(map)` (override generic chrome strings; accepts the whole
`pack.presentation.ui`; keys used: close, remove, clearSearch, sources, viewSources,
required, optional, sortAscending, sortDescending, sortBy, expand, collapse, actions,
notices, closeNotice, breadcrumbs, menu, select), `text(key, params)`, `labelTone(label)`,
`iconNode(spec, extraClass)`, `nextId(prefix)`, `applyExtras(el, opts)`, `VARIANTS`, `SIZES`, `TONES`.
`main.js` should call `atoms.setTexts(pack.presentation.ui)` once after loading the pack.

## 5. Molecules (`ds/molecules`)

| Factory | Options | DOM / behaviour |
| --- | --- | --- |
| `tabs` | `id, tabs [{ id, label, testid, icon, badge, disabled, focusKey }], selectedId, onSelect(tabId, event), mode ('presentation'\|'local'), orientation ('horizontal'\|'vertical'), ariaLabel, labelledBy, tabElementId(tabId), panelElementId(tabId)` | Returns `{ el, panelAttrs(tabId), tabElementId, panelElementId }`. `el` = `<div class="tabs tabs--mode" role="tablist">` with `<button role="tab" aria-selected aria-controls tabindex>`. Manual activation: Arrow keys move focus (Up/Down when vertical), Home/End, Enter/Space (native click) select, roving tabindex. Default ids `${id}-tab-${tabId}` / `${id}-panel-${tabId}`; the shell passes `tabElementId: id => 'tab-' + id` and `panelElementId: id => 'panel-' + id` to match `shell.html`. `panelAttrs` gives `{ id, role: 'tabpanel', 'aria-labelledby', tabindex: '0' }`. |
| `breadcrumbs` | `items [{ label, onClick, testid }], ariaLabel` | `<nav class="breadcrumbs" aria-label>` + `<ol>`; clickable crumbs are `<button class="breadcrumbs__link" data-testid="breadcrumb-n">`; the last is `<span aria-current="page">`. |
| `searchField` | `id, label, value, onInput(value), onClear, onKeydown, resultsText, placeholder, testid, clearTestid, resultsTestid, clearLabel, labelVisible, controls, expanded` | `<div class="search-field" role="search">` + label (sr-only unless `labelVisible`) + `.search-field__box` (icon, `input[type=search]`, clear icon button hidden while empty) + `.search-field__results#id-results` (wired via `aria-describedby`). Escape with text calls `onClear`. `el.control` is the input. Announce result counts yourself with `dom.announce`. |
| `entityLink` | `entity { id, name, type }, typeLabel, icon (name or Node; defaults to entity.type), relationLabel, onOpen(entity, event), versionId, testid (default `inspector-link-<id>`), badge (string, badge options, or Node), label, meta, showType, compact, selected, focusKey, describedBy, title, attrs` | `<button class="entity-link" data-entity-id data-version-id>`: icon (`role="img"` named with `typeLabel`), `.entity-link__name`, optional `.entity-link__type` (visible only with `showType`), `.entity-link__relation`, `.entity-link__meta`, badge, chevron. |
| `statusLabel` | `label, tone, icon (name/Node/false)` | `<span class="status-label status-label--tone">` with icon or a shape mark (`.status-label__mark`: circle, filled for success, rotated square for warning, square for danger, dashed for proposed/demo). |
| `metric` | `label, value, unit, date, target, missingText, proposed` | `<div class="metric">` with label, `.metric__value` (mono when known; `missingText` and `.metric--missing` when null/empty), unit, `.metric__meta` (date · target as given). |
| `table` | `id, caption, captionHidden, columns [{ id, label, sortable, width, align ('end'), testid, rowHeader }], rows [{ key, cells [{ text \| node, sortValue, className, mono }], selected, onSelect(row, event), testid, focusKey, entityId, className, isDemo, actions }], sort { column, direction: 'asc'\|'desc' } \| null, onSort(columnId, nextDirection, event), emptyText, cardMode, dense, actionsColumn { label, render(row) }, rowHeaders, testid, wrapClass` | `<div class="table-wrap" role="region" aria-labelledby=caption tabindex=0>` > `<table class="table [table--cards] [table--dense]">` with `<caption>`, `<th scope=col aria-sort>` (sortable headers are `<button class="table__sort">` with sort icon), `<td data-label>` for card mode, `.table__select` button in the first cell when `row.onSelect` is given (never a click on `<tr>`), `tr.is-selected`, `tr.is-demo`, `.table__actions`, `.table__empty` row with `emptyText`. The caller sorts the rows; the table only emits intent. `el.table` is the `<table>`. |
| `disclosure` | `id, summary, content, open, onToggle(nextOpen, event), meta, aside, testid, focusKey` | `<div class="disclosure">` + `<button class="disclosure__summary" aria-expanded aria-controls>` + `.disclosure__content[hidden] role=region`. Controlled when `onToggle` is given (parent re-renders); otherwise toggles locally. |
| `modal` | `id, title, eyebrow, body (Node/array), actions [{ label, variant, icon, onClick(event, api), testid, disabled, disabledReason, busy }], onClose(reason, api), onOpen, size ('sm'\|'md'\|'lg'\|'sheet'), describedBy, testid, closeLabel, closeTestid, hideClose, role ('dialog'\|'alertdialog'), initialFocus (selector), extraClass` | Returns `{ el, dialog, open(), close(reason), isOpen() }`. `open()` appends `.modal-backdrop > .modal[role=dialog aria-modal aria-labelledby aria-describedby]` to `#primus-overlays` (created if missing), sets `inert` on every other child of `#primus-app` (and of `body`), traps focus (`dom.trapFocus`), focuses the first focusable in the body (or `initialFocus`), Escape closes. `close()` releases the trap, removes `inert`, removes the element, restores focus to the opener (or `#primus-main`), then calls `onClose`. Backdrop clicks do not close. |
| `confirm` | `title, text, confirmLabel, cancelLabel, danger, onConfirm, onCancel(reason), onClose, id, testid, confirmTestid, cancelTestid, closeTestid, eyebrow, size, focusConfirm, open (default true)` | `modal` with `role=alertdialog`, body `<p class="modal__text">`, cancel (secondary) + confirm (primary or danger). Opens immediately unless `open: false`. Closing by Escape/× counts as cancel. |
| `toasts` | `toasts [{ id, text, tone }], onDismiss(id), dismissLabel` | `<ul class="toast-list">` of `<li class="toast toast--tone" role="status" data-testid="toast">` (danger → `role=alert`) with icon, text and dismiss icon button (`data-testid="toast-dismiss"`). Mount inside `#primus-toasts`; the shell handles the 5 s timer via `store.timers`. |
| `emptyState` | `text, detail, action { label, onClick, variant, icon, testid }, icon (name or false), compact` | `<div class="empty-state">`. |
| `notice` | `text (string/Node), title, tone, icon, action { label, onClick, testid, variant }, onDismiss, dismissLabel, dismissTestid, role, testid` | `<div class="notice notice--tone" role="status\|alert">` with icon, body (`.notice__text`, `.notice__action`), dismiss button. Use `testid: 'web-notice'` and `action.testid: 'web-notice-action'` for the twin notice. |
| `list` | `items [{ key, node, className }], ariaLabel, labelledBy, ordered, plain, inline` | `<ul class="list">` / `<ol>` of `<li class="list__item" data-key>`. |
| `keyValue` | `rows [{ label, value (string/Node/null), mono, className }], missingText, inline` | `<dl class="key-value">` of `.key-value__row > dt + dd`; null/empty values render `missingText` with `.is-missing`. |

`molecules.setTexts` is the same function as `atoms.setTexts`. Constants: `OVERLAYS_ID`,
`TOASTS_ID`.

## 6. Layout classes (`styles/layout.css`)

Shell (template in CONTRACTS §10):

| Class | Purpose |
| --- | --- |
| `.shell` | Grid `header / tabs / main` filling `100dvh`. `#primus-main` (`.shell-main`) is the scroll container for narrative tabs. |
| `.shell-header` | Grid `brand | titles | actions`, min-height 72. Children: `.shell-header__brand > .wordmark (.wordmark__name «PRÓSPERA», .wordmark__tagline «Grupo Inmobiliario»)`, `.shell-header__titles (.shell-header__title, .shell-header__subtitle, .shell-header__badges)`, `.shell-header__actions`. |
| `.shell-tabs` | Sticky tab strip; put `molecules.tabs({ mode: 'presentation' }).el` inside. Scrolls horizontally when narrow. |
| `.shell-main > [role=tabpanel]` | Panels keep their DOM when hidden. Add `.panel--fill` to the web and desktop panels so `.twin`/`.studio` fill the viewport. |

Narrative tabs (1–3): `.narrative` (max 1200, vertical gaps) with `.narrative__header`
(`.narrative__title`, `.narrative__intro`), `.narrative__prose` (760), `.narrative__section`
(`.narrative__section-title`, `.narrative__section-intro`), `.narrative__grid[--wide]`
(card grid), `.narrative__split` (stage + sticky `.narrative__inspector`),
`.narrative__stage`, `.narrative__figure` (diagram box), `.narrative__caption`,
`.narrative__toolbar`, `.narrative__ctas`, `.narrative__footer`, `.narrative__steps` /
`.narrative__step` / `.narrative__step-number`, `.record-card` (`__meta`, `__question`).

Inspector block (used inside `.twin-inspector`, `.narrative__inspector`, `.records__detail`):
`.inspector` > `.inspector__header` (`.inspector__nav` back/close, `.inspector__eyebrow`
type, `.inspector__title` (`tabindex=-1`, `data-testid="inspector-heading"`),
`.inspector__subtitle`, provenance) + `.inspector__section` (`.inspector__section-title`,
`.inspector__links`, key-value) + `.inspector__actions` + `.inspector__empty`.

Twin workspace (tab 4):

| Class | Purpose |
| --- | --- |
| `.twin` | Grid areas `rail contextbar inspector / rail stage inspector`; columns 224 / 1fr / clamp(320, 360, 420). Modifiers `.twin--no-inspector`, `.twin--security`, `.twin--full` drop the inspector column. States `.is-rail-open`, `.is-inspector-open` (used by the overlay/sheet modes below 1280). |
| `.twin-rail` | Level / representation / depth / layers groups: `.twin-rail__group > .twin-rail__title + .twin-rail__options > .btn.twin-rail__option[aria-pressed]`, `.twin-rail__footer` (Usuarios y accesos). `.twin-rail__toggle` (icon button «Navegación del módulo», shown < 1280), `.twin-rail__close`, `.twin-rail__backdrop` (button). |
| `.twin-contextbar` | `.twin-contextbar__nav` (toggle, back, `.twin-contextbar__crumbs` breadcrumbs), `.twin-contextbar__profile` (label + select `profile-select`), `.twin-contextbar__search`, `.twin-contextbar__tools` (list/map toggle etc.). |
| `.twin-notices` | Stack of `notice` elements above the stage header. |
| `.twin-stage` | `.twin-stage__header` (`.twin-stage__heading`: `.twin-stage__title`, `.twin-stage__subtitle`, `.twin-stage__note`; `.twin-stage__controls`), `.twin-versionbar` (`__group`, `__label`), `.twin-process-tabs`, `.twin-stage__body[--canvas|--scroll]`, `.twin-stage__footer` (legend, counts). Process sheet: `.twin-sheet > .twin-sheet__main + .twin-sheet__aside`, `.twin-sheet__section`; compare: `.twin-compare > .twin-compare__column`. |
| `.twin-inspector` | `role="complementary"` region (`data-testid="inspector"`); `.twin-inspector__inner`, `.twin-inspector__header` (sticky), `.twin-inspector__sheet-handle`, `.twin-inspector__backdrop`. At 768–1279 it slides in as an overlay, < 768 as a bottom sheet (the component gives it `role=dialog` + trap + Escape when modal). |
| `.entity-list` | List-mode alternative: `.entity-list__group` (`__group-title`), `.entity-list__tree` (nested with indent line), `.entity-list__row` (expand button + entity link), `.entity-list__step` (`__step-number`) for flows. |
| `.records` | Incidents/projects: `.records__list` (`.records__header`, `.records__title`, `.records__toolbar`, `.records__filters`, `.records__search`, `.records__summary`, table) + sticky `.records__detail`. |
| `.security` | Accounts/audit module: `.security__nav`, `.security__matrix` (`__matrix-yes`, `__matrix-no`). |
| `.form` | `.form__row` (auto-fit columns), `.form__legend`, `.form__actions`, `.form__errors`, `.form__counter`, `.form__readonly`. |

Analyst studio (tab 5):

| Class | Purpose |
| --- | --- |
| `.studio` | Grid areas `frame frame frame / roster main side`; columns 260 / 1fr / 380. `.studio--no-side` drops the side panel. |
| `.studio-frame` | Desktop window title row: `.studio-frame__title`, `.studio-frame__spacer`, `.studio-frame__disclaimer` (permanent «Claude Code · Simulado…»). No fake window buttons. |
| `.studio-roster` | `.studio-roster__title`, `.studio-roster__list > .workspace-row[aria-current]` (`__icon`, `__name`, `__status[.is-attention]`, `__unread`). Becomes a horizontal strip < 768. |
| `.studio-main` | `.studio-chips` (context chips), `.studio-tabs` (local tabs `mode-chat`/`mode-ops` + actions), `.studio-stream` (scroll owner; `.studio-stream__welcome`, `.turn[--analyst|--assistant|--unsupported]` with `.turn__who`, `.turn__who-name`, `.turn__time`, `.turn__body`, `.turn__links`; `.tool-card[--running|--failed|--awaiting]` with `.tool-card__header > .tool-card__summary[aria-expanded]` + `.tool-card__body`; `.approval[--approved|--rejected|--canceled]` with `__title`, `__text`, `__actions`; `.studio-stream__status`; sticky `.studio-stream__jump`), `.operations` (operations table), `.studio-composer` (`__scenarios`, `__row`, `__field`, `__controls`, `__mode`), `.studio-footer` (`__item[.is-pending]`, `__sep`). |
| `.studio-side` | Evidence / review / artifact: `.studio-side__title`, `.studio-side__section`, `.evidence-item` (`__label`, `__summary`), `.review` (`__header`, `__title`, `__diff > .review__diff-cell[--after]`, `__diff-label`, `__actions`), `.artifact-preview` (`__title`). Stacks under the stream < 1280. |

Generic helpers: `.toolbar` (`__group`, `__label`), `.split[--detail]`, `.section-title`
(`__count`), `.panel-note`, `.counts` (`__item`, `__value`), `.overlay-panel`,
`.policy-text` (`__signature`).

## 7. Visualization classes (`styles/visualization.css`)

| Class | Purpose |
| --- | --- |
| `.canvas` | Viewport (`tabindex=0 role=group aria-label`, `data-testid="web-canvas"`), dotted background, `cursor: grab`; `.is-panning`, `.canvas--static`. `.canvas__message` centred message. |
| `.canvas__layer` | Transformed layer (`transform: translate() scale()` inline). Direct children `.node`, `.node-expand`, `.band`, `.lane`, `.zone`, `.boundary`, `.canvas__label` are absolutely positioned (inline `left/top/width/height`). |
| `.canvas__edges` | `<svg>` beneath nodes; paths `.edge[--related|--selected|--loop|--proposed|--inferred|--dimmed|--group|--exchange|--group-line]`, labels `<text class="edge-label[--muted]">` (background via paint-order) or `<rect class="edge-label__bg">`, markers `<path class="edge-marker[--related|--selected|--muted]">` inside `<marker>`. |
| `.canvas__toolbar` | Camera controls (`zoom-out`, `.canvas__toolbar-zoom`, `zoom-in`, `fit-view`, `reset-camera`); `.canvas__toolbar--top`. |
| `.node` | `<button class="node node--<type>" data-entity-id data-focus-key>`: `.node__head > .node__icon + .node__name`, `.node__meta`, `.node__id`, `.node__badges`, `.node__count`, `.node__subtitle`. Types: `--organization --area --position --person --external (dashed) --macroprocess (double) --process --activity --role --system (dotted) --document --policy (double) --objective (double teal) --indicator (dotted) --gap (warning) --incident --project --version --proposed (dashed teal) --decision (rotated square, label upright) --event/--start/--end (circle, label below) --group --component --store --actor --pending --compact --wide`. States: `.is-selected` (ring outline), `.is-related` (2 px teal), `.is-dimmed` (opacity .6, still ≥ 3:1), `.is-root`, `.is-expanded`, `.is-unavailable`, `.is-demo`; `:focus-visible` outer ring with larger offset when selected. |
| `.node-expand` | Separate expand/collapse button (`data-testid="expand-<id>"`, `aria-expanded`), positioned next to its node; never nested in `.node`. |
| `.node-chip` | Small system chip between flow nodes (“Cambio de estado propuesto”). |
| `.lanes[--scroll]` / `.lane[--external|--highlight]` | Swimlanes: `.lane__label` (sticky in scroll mode; `.lane__label-role`), `.lane__body`. |
| `.bands` / `.band[--objective|--direction|--business|--support|--people|--systems][.is-dimmed]` | Process-map bands: `.band__label` (`__title`, `__subtitle`), `.band__body`, `.band__message` (missing-band disclosure), `.band__chain` + `.band__chain-arrow`. |
| `.zone[--external|--vps]`, `.boundary`, `.arch-grid` | C4-style architecture zones (`.zone__label`, `.zone__body`, `.boundary__label`). |
| `.legend` | `.legend__title`, `.legend__item > .legend__swatch[--external|--proposed|--related|--default-line|--loop|--selected|--decision|--event|--system|--objective|--gap|--demo]`. |
| `.raci__mark`, `.raci__missing`, `.sipoc` (`__column[--process]`, `__title`), `.timeline` (`__item[.is-current|.is-demo]`) | Table/diagram helpers. |

Geometry constants used by `components/twin/canvas.js` `GEOMETRY` must mirror
`extensions.css`: node min width 176, max 240, min height 56, gap 24, decision 112,
event 56, lane height 168, lane label 144, band label 160, band min height 120.

## 8. Responsive (`styles/responsive.css`)

- ≥ 1280: twin rail + stage + docked inspector (inspector `clamp(320px, 25vw, 420px)`);
  studio roster | main | side.
- 768–1279: `.twin` becomes one column; `.twin-rail` is an off-canvas panel shown with
  `.twin.is-rail-open` (toggle `.twin-rail__toggle` labelled «Navegación del módulo»,
  `.twin-rail__backdrop` closes); `.twin-inspector` slides over the stage with
  `.twin.is-inspector-open`; studio side panel stacks under the stream (max 45vh).
- < 768: header stacks (`brand actions / titles`), action labels collapse to icons, tab strip
  scrolls with snap, context bar wraps, `.twin-inspector` is a bottom sheet, `.records`,
  `.split`, `.form__row`, `.key-value__row`, `.twin-compare`, `.review__diff` stack,
  `.studio-roster` is a horizontal strip, `.table--cards` renders each row as a card with
  `data-label` captions, dialogs become bottom sheets, toasts span the width.
- `(pointer: coarse)`: 44 px targets for links, chips, sort/select buttons, small buttons.
- `(max-height: 520px)`: compact header. `(prefers-contrast: more)`: stronger hairlines.
- Text zoom 200 %: all text containers use rem/em and `min-height`; never fixed heights.

## 9. Print (`styles/print.css`)

Black on white, hides tabs, header actions, rail, toolbars, toasts, dialogs, composer,
roster and icon-only buttons; the active tab prints as flowing blocks; canvases print at
their full content size (layer `transform: none`), tables expand (card mode reverted),
disclosures print expanded, external links print their URL.

## 10. Composition examples

### 10.1 Twin page (tab 4)

```js
// features/web/index.js (sketch)
const { dom, atoms, molecules, icons, ui } = ctx;
const h = dom.h;
panelEl.classList.add('panel--fill');
const twin = h('div', { class: 'twin' },
  h('button', { type: 'button', class: 'twin-rail__backdrop', 'aria-label': ui.close, on: { click: () => setRailOpen(false) } }),
  h('aside', { class: 'twin-rail', 'aria-label': ui.moduleNavigation },
    atoms.iconButton({ icon: 'close', ariaLabel: ui.close, extraClass: 'twin-rail__close', onClick: () => setRailOpen(false) }),
    h('div', { class: 'twin-rail__group' },
      h('span', { class: 'twin-rail__title' }, ui.level),
      h('div', { class: 'twin-rail__options' },
        atoms.button({ label: ui.levelStrategic, variant: 'ghost', icon: 'organization', pressed: state.web.level === 'strategic',
                       extraClass: 'twin-rail__option', testid: 'web-level-strategic', onClick: () => store.dispatch('setLevel', { level: 'strategic' }) }),
        /* tactical, operational … */))),
  h('div', { class: 'twin-contextbar' },
    h('div', { class: 'twin-contextbar__nav' },
      atoms.iconButton({ icon: 'menu', ariaLabel: ui.moduleNavigation, variant: 'secondary', extraClass: 'twin-rail__toggle', expanded: railOpen, onClick: () => setRailOpen(!railOpen) }),
      atoms.iconButton({ icon: 'back', ariaLabel: ui.back, testid: 'context-back', onClick: () => store.dispatch('contextBack') }),
      h('div', { class: 'twin-contextbar__crumbs' }, molecules.breadcrumbs({ ariaLabel: ui.breadcrumbs, items: crumbs }))),
    h('div', { class: 'twin-contextbar__profile' },
      h('label', { class: 'text-sm muted', for: 'profile-select' }, ui.profileSelector),
      atoms.select({ id: 'profile-select', testid: 'profile-select', value: state.app.profileId, options: profileOptions, onChange: id => store.dispatch('selectAccessProfile', { profileId: id }) })),
    h('div', { class: 'twin-contextbar__search' },
      molecules.searchField({ id: 'web-search', testid: 'web-search', clearTestid: 'web-search-clear', resultsTestid: 'web-search-results',
                              label: ui.search, placeholder: ui.searchPlaceholder, value: state.web.search.query, resultsText, onInput, onClear })),
    h('div', { class: 'twin-contextbar__tools' },
      atoms.iconButton({ icon: state.web.listMode ? 'map' : 'list', ariaLabel: state.web.listMode ? ui.mapView : ui.listView, pressed: state.web.listMode, testid: 'web-list-toggle', onClick: toggleList }))),
  h('div', { class: 'twin-stage' },
    h('div', { class: 'twin-notices' }, notice && molecules.notice({ text: notice.text, tone: 'info', testid: 'web-notice', action: notice.action && { label: notice.action, testid: 'web-notice-action', onClick } , onDismiss })),
    h('div', { class: 'twin-stage__header' },
      h('div', { class: 'twin-stage__heading' },
        h('h2', { class: 'twin-stage__title', tabindex: '-1', 'data-focus-key': 'tabpanel-heading:web' }, title),
        h('p', { class: 'twin-stage__note' }, views.orgchart.note)),
      h('div', { class: 'twin-stage__controls' }, depthTabs.el)),
    h('div', { class: 'twin-stage__body twin-stage__body--canvas' }, canvas.el /* .canvas > .canvas__layer > .node… + .canvas__toolbar */),
    h('div', { class: 'twin-stage__footer' }, h('div', { class: 'legend' }, …), h('div', { class: 'counts' }, …))),
  h('button', { type: 'button', class: 'twin-inspector__backdrop', 'aria-label': ui.closeInspector, on: { click: close } }),
  h('aside', { class: 'twin-inspector', role: 'complementary', 'aria-label': ui.inspector, 'data-testid': 'inspector' },
    h('div', { class: 'twin-inspector__inner' }, inspector.el /* .inspector block */)));
twin.classList.toggle('is-rail-open', railOpen);
twin.classList.toggle('is-inspector-open', !!state.web.selection);
```

Inspector block (same order for every entity type):

```js
h('div', { class: 'inspector' },
  h('div', { class: 'inspector__header' },
    h('div', { class: 'inspector__nav' },
      atoms.button({ label: ui.inspectorBack, variant: 'ghost', size: 'sm', icon: 'back', testid: 'inspector-back', disabled: !history.length, onClick }),
      atoms.iconButton({ icon: 'close', ariaLabel: ui.closeInspector, testid: 'inspector-close', onClick })),
    h('span', { class: 'eyebrow inspector__eyebrow' }, icons.icon(typeIcon), typeLabel),
    h('h3', { class: 'inspector__title', tabindex: '-1', 'data-testid': 'inspector-heading' }, entity.name),
    atoms.provenance({ labels: entity.labels, confidence: entity.provenance.confidence, sourceIds: entity.provenance.sourceIds, sources: pack.sources, onOpenSources })),
  h('section', { class: 'inspector__section' }, h('h4', { class: 'inspector__section-title' }, ui.facts), molecules.keyValue({ rows, missingText: format.missing() })),
  h('section', { class: 'inspector__section' }, h('h4', { class: 'inspector__section-title' }, ui.relatedEntities),
    h('div', { class: 'inspector__links' }, related.map(r => molecules.entityLink({ entity: r.entity, typeLabel: typeLabel(r.entity.type), icon: typeIcon(r.entity.type), relationLabel: r.label, onOpen: () => store.dispatch('selectEntity', { entityId: r.entity.id, followLink: true }) })))),
  h('div', { class: 'inspector__actions' },
    atoms.button({ label: ui.focusArea, variant: 'secondary', size: 'sm', testid: 'inspector-action-focus-area', onClick }),
    atoms.button({ label: ui.history, variant: 'ghost', size: 'sm', icon: 'history', testid: 'inspector-action-history', onClick })));
```

List mode uses `.entity-list` with the same `entityLink`s and actions as the canvas.
Process flows use `.lanes > .lane > .lane__label + .lane__body` (canvas) or
`.entity-list__step` rows (list). Modals (history, sources, document) go through
`molecules.modal({ id: 'history-dialog', testid: 'history-dialog', … }).open()`.

### 10.2 Studio page (tab 5)

```js
panelEl.classList.add('panel--fill');
const studio = h('div', { class: 'studio' },
  h('div', { class: 'studio-frame' },
    h('span', { class: 'studio-frame__title' }, icons.icon('window'), desktop.title),
    h('span', { class: 'studio-frame__spacer' }),
    h('span', { class: 'studio-frame__disclaimer' }, icons.icon('flag'), desktop.disclaimer)),
  h('aside', { class: 'studio-roster', 'aria-label': ui.menu },
    h('div', { class: 'studio-roster__list' }, workspaces.map(ws =>
      h('button', { type: 'button', class: ['workspace-row', ws.id === current && 'is-selected'], 'aria-current': ws.id === current ? 'true' : null,
                    'data-testid': 'workspace-' + ws.id, on: { click: () => store.dispatch('selectWorkspace', { workspaceId: ws.id }) } },
        h('span', { class: 'workspace-row__icon' }, icons.icon(ws.processId ? 'process' : 'organization')),
        h('span', { class: 'workspace-row__name' }, ws.label),
        h('span', { class: 'workspace-row__status' }, ws.statusLabel))))),
  h('div', { class: 'studio-main' },
    h('div', { class: 'studio-chips' }, ws.chips.map(label => atoms.chip({ label }))),
    h('div', { class: 'studio-tabs' }, molecules.tabs({ id: 'studio-mode', mode: 'local', selectedId: session.mode, onSelect: mode => store.dispatch('setSessionMode', { sessionId, mode }),
      tabs: desktop.modes.map(m => ({ id: m.id, label: m.label, testid: 'mode-' + m.id })) }).el),
    h('div', { class: 'studio-stream', ...panelAttrs(session.mode) },
      events.map(renderEvent),                      // .turn / .tool-card (disclosure) / .approval
      !atLatest && atoms.button({ label: ui.jumpToLatest, variant: 'secondary', size: 'sm', icon: 'arrowDown', extraClass: 'studio-stream__jump', testid: 'jump-to-latest', onClick })),
    h('div', { class: 'studio-composer' },
      h('div', { class: 'studio-composer__scenarios' }, scenarios.map(s => atoms.button({ label: s.trigger.label, variant: 'secondary', size: 'sm', icon: 'play', testid: 'scenario-start-' + s.id,
        disabled: !availability.ok, disabledReason: availability.reasons[0] && availability.reasons[0].text, onClick }))),
      h('div', { class: 'studio-composer__row' },
        atoms.field({ id: 'composer', label: desktop.composer.label, extraClass: 'studio-composer__field',
          control: atoms.textarea({ id: 'composer', testid: 'composer', value: session.draft, rows: 2, placeholder: desktop.composer.placeholder, onInput: text => store.dispatch('setDraft', { sessionId, text }) }) }),
        atoms.button({ label: desktop.composer.submit, variant: 'primary', icon: 'send', testid: 'composer-submit', onClick }))),
    h('div', { class: 'studio-footer', 'data-testid': 'studio-footer' },
      h('span', { class: 'studio-footer__item' }, icons.icon('lock'), desktop.footer.sessionOnly),
      review && h('span', { class: 'studio-footer__item is-pending' }, icons.icon('warning'), desktop.footer.pendingReview))),
  h('aside', { class: 'studio-side', 'aria-label': ui.sources },
    evidencePanel, reviewPanel /* .review with fields review-instruction/review-note/review-reason and actions review-approve/review-reject/review-cancel */, artifactPreview /* .artifact-preview, data-testid="artifact-preview" */));
```

Tool events render as `molecules.disclosure` inside `.tool-card` (`testid: 'tool-' + callId`),
approval requests as `.approval` with `atoms.button`s, SCN-02 forms as `.form` inside the
side panel, the operations mode as `molecules.table({ dense: true })` inside `.operations`.

## 11. Conventions recap

- Native controls only; `data-testid` from CONTRACTS §11 through the `testid` options.
- Selected = persistent outline/ring; focus = global outer ring; related = 2 px teal line;
  hover = subtle raise. Never the same teal fill for all four.
- Status always text + shape (badge glyphs, dashed borders, status marks).
- Missing values: `format.missing()` text through `missingText` options; never `null`/`0`.
- Generic chrome strings come from `pack.presentation.ui` (`atoms.setTexts`) or are passed
  explicitly; feature code never hardcodes Spanish copy.
