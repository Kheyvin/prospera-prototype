# `core/store` — state, dispatch, timers and the App/Web commands

Reference for feature agents. It documents what `src/core/store.js`,
`src/core/commands/index.js`, `src/core/commands/app.js` and `src/core/commands/web.js`
actually implement. Where this file and `CONTRACTS.md` differ, the difference is listed in
§9. Spec truth remains `../prototype-prospera/spec.md`.

```js
const store = Primus.require('core/store').createStore({ pack });   // pack = resolved pack (core/pack)
store.dispatch('enterProcess', { processId: 'PR-BOLETAS', view: 'flow' });
store.subscribe((state, info) => { if (info.changed.includes('web')) render(); });
```

`createStore(options)` accepts: `pack` (required; a raw merged object is resolved through
`core/pack` when that module exists), `timers` (pre-built timers object), `scheduler`
(`{ set(fn, ms) → handle, clear(handle) }`, default `setTimeout`/`clearTimeout`),
`reducedMotion` (boolean or function; default reads `window.matchMedia('(prefers-reduced-motion: reduce)')`
when available), `generation` (initial timer generation, default 1) and `strict`
(rethrow non-`CommandError` exceptions thrown by commands or subscribers; default `false`:
they are logged with `console.error` and reported as `{ ok: false, error: { code: 'internal-error' } }`).

Missing collaborators are tolerated at creation time: `graph`, `permissions`, `versions`,
`scenarios` and the selectors are `null`/empty when their modules are not registered, and
the command registry is required lazily (first `dispatch`). `core/commands` itself throws
when any of its five command modules is missing (that is a build error, not a runtime state).

---

## 1. Store API

| Member | Description |
| --- | --- |
| `store.pack`, `store.graph`, `store.permissions`, `store.format` | Collaborators created inside `createStore` (`createFormat(pack)`, `createGraph(pack)`, `createPermissions(pack)`). |
| `store.versions`, `store.scenarios` | `createVersions(store)` / `createScenarioEngine(store)` when those modules exist, else `null`. |
| `store.getState()` | Committed state. Treat as read-only. During a dispatch it still returns the pre-dispatch state; commands use `ctx.state`. |
| `store.dispatch(type, payload?)` | Runs one command on a structured clone of the state. See §3. |
| `store.subscribe(listener)` → `unsubscribe()` | `listener(state, info)` after every successful commit. `info = { type, payload, changed: string[], result }`. Listener exceptions are logged and do not break the dispatch (rethrown when `strict`). Avoid dispatching from a listener; it works but notifications then arrive in completion order. |
| `store.select(name, ...args)` | Calls a registered selector with `ctx = { state, pack, graph, permissions, format, store, versions, scenarios }`. Inside a dispatch the draft is used. Unknown name → throws. |
| `store.selectWith(state, name, ...args)` | Same with an explicit state. |
| `store.registerSelector(name, fn)`, `store.selectors` | Extension point; `core/selectors` entries are registered at creation. |
| `store.now()` | ISO string of the logical clock (`clockStart + demo.clock` seconds, pack offset kept, e.g. `2026-10-06T10:00:03-05:00`). |
| `store.tick()` | Advances `demo.clock` by one second and returns the new ISO string. Inside a command it mutates the draft (prefer `ctx.tick()` / `ctx.log()`); outside, it mutates the committed state without notifying. |
| `store.getVersion(id, state?)` | Pack or demo version with a resolved `activities` snapshot (§6). `undefined` when unknown. |
| `store.allVersions(processId?, state?)` | Pack versions in pack order, then demo versions by creation (`createdSeq` when present, else insertion order). All carry `activities`. |
| `store.timers` | Timers facility (§4). |
| `store.reset()` | `= dispatch('resetDemo', { force: true })`. |
| `store.createInitialState()` | Fresh initial state for the pack (used by `resetDemo`). |
| `store.hasUnsavedWork(state?)` | §7. Used by `requestReset`/`resetDemo` to decide whether the confirm modal is needed. |
| `store.hasCommand(type)`, `store.commandNames()` | Registry introspection. |
| `store.businessDate`, `store.clockStart` | `pack.demo.businessDate` and the ISO clock start. |
| `store.snapshot()`, `store.clone(value)` | Deep clone helpers (`structuredClone`, JSON fallback). |
| `store.isDispatching()`, `store.destroy()` | Diagnostics; `destroy` clears timers and listeners. |

Module-level exports of `core/store`: `createStore`, `createInitialState(pack)`,
`createTimers(options)`, `sessionState()`, `isoAt(base, seconds)`, `parseClockStart(iso)`,
`serializeError(err)`, `isCommandError(err)`, `clone(value)`, `SLICES`.

---

## 2. State shape (exact)

Built by `createInitialState(pack)`. Values below are the Próspera pack defaults.

```js
{
  app: {
    activeTab: 'architecture',            // pack.demo.initialTab (validated against presentation.tabs)
    profileId: 'U-MANAGER',               // pack.demo.initialProfileId
    aboutOpen: false,
    modal: null,                          // { kind: 'reset-confirm' | ..., ...payload }
    toasts: [],                           // [{ id, text, tone: 'neutral'|'info'|'success'|'warning'|'danger', messageId? }] (max 5, oldest dropped)
    notices: [],
    focusReturn: null,                    // { focusKey: 'tabpanel-heading:web' } | { focusKey }
    architectureSelection: null,          // solution node id
    architectureListMode: false,
    scopeFilter: 'all',
    scopeSelection: null,                 // scope item id
    methodSelection: null,                // methodology id
    scroll: {}                            // tabId → top (integer px)
  },
  web: {
    module: 'twin',                       // 'twin' | 'security'
    level: 'strategic', representation: 'orgchart', depth: 'positions',   // views.defaultContext
    areaId: null, processId: null, processView: 'sheet',
    versionId: 'V-ASIS-01',               // organization.currentAsIsVersionId
    compareVersionId: 'V-TOBE-02',        // last TO-BE pack version of the default process that is not 'incomplete-draft'
    paymentVariant: 'separacion',         // defaultVariant of the current AS-IS flow
    activityKey: null,
    relationsRootId: null,
    selection: null,                      // { entityId, kind: 'entity'|'flowNode', versionId? }
    inspectorHistory: [],                 // previous selections (followLink), max 50
    highlightRootId: null,
    expanded: {},                         // entityId → true
    layers: { people: true, systems: true, documents: true },   // from views.layers
    search: { query: '', types: [], includeVersions: false, open: false },
    areaFilter: null,
    listMode: false,
    contextHistory: [],                   // context snapshots (§5), max 50
    overlay: null,                        // { kind: 'history'|'document'|'policy'|'sources'|'version'|'connections', entityId|null, versionId|null }
    notice: null,                         // { kind, tone, text, action?, command?, messageId? }  (see §2.1)
    newVersionNotice: null,               // { versionId }
    security: { view: 'accounts', selectionId: null, form: null },
    incidents: { filter: 'all', query: '', sort: null, form: null, selectionId: null },
    projects: { selectionId: 'PM-01', form: null },
    tableSort: {}                         // tableId → { column, direction: 'asc'|'desc' }
  },
  camera: {},                             // contextKey → { x, y, scale }  (integers, scale 0.5..2.0 step 0.1); absent key = { 0, 0, 1 }
  desktop: {
    workspaceId: 'WS-BOLETAS',            // first pack workspace
    evidenceOpenId: null,
    navigation: null,                     // { scenarioId|null, projectId|null } set by navigateTo (tab desktop)
    sessions: { 'SES-BOLETAS': sessionState(), 'SES-ORG': sessionState() }
  },
  demo: {
    clock: 0,                             // seconds elapsed on the logical clock
    versions: {},                         // versionId → demo version (created by core/versions)
    currentAsIsVersionId: 'V-ASIS-01',
    staging: {},                          // versionId → staging entry
    incidents: [...pack.tracking.incidents],      // deep clones, mutable
    projects:  [...pack.tracking.projects],
    accounts:  [...pack.security.accounts],
    log: [],                              // [{ seq, at, profileId, action, result }]
    counters: { incident: 4, project: 2, account: 4 },   // pack length + 1
    applied: {},                          // scenarioId → true
    requestIds: {},                       // effective requestId → true
    runOrdinals: {},                      // scenarioId → n
    generation: 1                         // mirrors store.timers.generation()
  }
}

sessionState() = {
  mode: 'chat', draft: '', events: [],
  playback: { status: 'idle', scenarioId: null, runOrdinal: 0, stepIndex: 0, pendingEventIds: [], errorMode: null, failedEventId: null },
  review: null, expandedTools: {}, unread: 0, atLatest: true, form: null
}
```

Pausing (profile switch, leaving the desktop tab, workspace switch) sets
`playback.status = 'paused'`, `playback.pausedFrom = <previous status>` and
`playback.pauseReason = 'profile' | 'tab' | 'workspace'`, and clears timers tagged
`session:<sessionId>`.

### 2.1 `web.notice`

`{ kind, tone, text, action?, command?, messageId? }`:

- `kind: 'adjusted'` — `pack.ui.viewAdjusted` («La vista se ajustó al perfil seleccionado»), set by `selectAccessProfile`.
- `kind: 'historical'` — `pack.ui.historicalReadOnly` («Versión histórica · solo lectura»), set when `web.versionId` is an AS-IS version other than `demo.currentAsIsVersionId`; cleared when leaving that context.
- `kind: 'restricted'` — MSG-02 text, `action` = «Volver a una vista permitida» (or the permission `cta.label`), `command = { type, payload }` (default `backToOrganization`), `messageId: 'MSG-02'`; set by `navigateTo` for a target the profile cannot see.
- `kind: 'custom'` — `setNotice`.

`dismissNotice` clears it. Render the `action` as a button that dispatches `notice.command`.

### 2.2 Form state

`web.incidents.form`, `web.projects.form`, `web.security.form`:

```js
{ id: 'incident'|'project'|'account', mode: 'create'|'edit'|'close', recordId: string|null,
  values: {...}, initial: {...}, errors: { field: message }, dirty: boolean }
```

Default values: incident create `{ subject, description, processId, responsibleId, dueDate, status: 'open' }`;
incident edit `{ subject, description, responsibleId, dueDate, status }`; incident close `{ resolution }`;
project create `{ name, objective, processId, responsibleId, dueDate, targetVersionId }` (latest
`proposed`/`published-demo` TO-BE); project edit `{ objective, responsibleId, dueDate, status }`;
project close `{ result, confirmed: false }`; account create `{ username, role: 'employee', positionId: null }`;
account edit `{ username, role, positionId }`. `openForm` may pass `values` to override.

---

## 3. Dispatch contract

```js
store.dispatch(type, payload) →
  { ok: true,  result: <command return value>, changed: ['app' | 'web' | 'camera' | 'desktop' | 'demo', ...] }
  { ok: false, error: { code, message, field?, messageId?, action?, cta?, formId?, reason?, ... } }
```

- Unknown type → `code: 'unknown-command'`. Dispatch from inside a command → `code: 'reentrant-dispatch'`.
- The command runs on `structuredClone(state)`. `ctx.fail(code, message, extra)` throws a
  `CommandError`; the store discards the draft, cancels every timer the command scheduled
  and returns `{ ok: false, error }` built from the error (`extra` keys such as `field`,
  `messageId`, `action`, `cta`, `formId` are copied). Any other exception is reported as
  `code: 'internal-error'` (rethrown when `strict`). No partial mutation is ever committed.
- `changed` lists the top-level slices whose JSON differs from the previous commit.
  Subscribers receive `(state, { type, payload, changed, result })` after the commit.
- `payload` defaults to `{}` when omitted.

Command context (`ctx`), as received by every command:

```js
{ state,            // mutable draft; mutate directly
  pack, graph, permissions, format, versions, scenarios, store, timers,   // timers === store.timers
  log(action, result)      // appends { seq, at: tick(), profileId, action, result } to demo.log; returns the entry
  fail(code, message, extra?)   // throws CommandError
  uid(prefix)              // 'toast-1', 'toast-2', … (store-wide counter)
  now(), tick()            // logical clock on the draft
  replaceState(next)       // swap the whole draft (used by resetDemo); next must contain the five slices
}
```

Permission denials inside commands always carry `messageId` (`MSG-02` for read checks:
viewAll/viewEntity/viewVersion/viewSecurity/viewAudit/viewDraftsToBe; `MSG-03` for writes),
`text` and `action` even if `permissions.can` returned only `{ ok: false }`.

---

## 4. Timers (`store.timers`)

```js
id = store.timers.set(fn, ms, tag?)   // fn({ id, tag, generation }); ms becomes 0 under reduced motion
store.timers.clear(id) → boolean
store.timers.clearAll(tag?) → count   // tag: e.g. 'session:SES-BOLETAS'; no tag = everything
store.timers.generation() → number
store.timers.bump() → number          // clearAll() + generation + 1 (resetDemo calls this)
store.timers.pending(tag?) → count, store.timers.list(), store.timers.isReducedMotion()
```

Every timer is bound to the generation current when it was scheduled; a callback whose
generation no longer matches is a no-op (stale callbacks after a reset never run). Timers
scheduled by a command that fails are cancelled. Tag session timers with
`'session:' + sessionId` so pausing (`pauseSessions`) can cancel them. Timer callbacks run
outside any dispatch, so they may call `store.dispatch(...)` (e.g. `deliverTimedEvent`
with the `generation` they received).

---

## 5. Context history, navigation targets and camera keys

Context snapshot pushed on `enterArea`, `enterProcess`, `openInstruction`, `setLevel`,
`setRepresentation`, `setRelationsRoot` (when the context changes), `setProcessView`
(when leaving a non-operational level) and `navigateTo` (tab web):

```js
{ module, level, representation, areaId, processId, processView, versionId, paymentVariant,
  activityKey, depth, expanded, listMode, highlightRootId, relationsRootId, areaFilter, cameraKey }
```

`contextBack` pops and restores the top snapshot (re-validating visibility; result carries
`cameraKey`); with an empty history it goes to the logical parent (activity → flow, operational
→ tactical area or strategic, tactical → strategic, security → twin). `backToOrganization`
clears the history and restores the default context (profile, search and layers kept).

Camera keys (`helpers.cameraKey(web)`): `orgchart`, `processmap`, `relations:<rootId>`,
`area:<areaId>`, `flow:<versionId>:<variant>`; `null` for sheet/compare/incidents/projects
and the security module.

Navigation targets (`navigateTo { target }`):

```js
{ tab: 'web', web: { module?, securityView?, level?, representation?, depth?, areaId?, processId?, processView?,
                     versionId?, paymentVariant?, activityKey?, selectEntityId?, highlightRootId?, relationsRootId?,
                     overlay?: { kind, entityId?, versionId? }, areaFilter?, listMode? } }
{ tab: 'desktop', desktop: { workspaceId?, scenarioId?, projectId? } }
{ tab: 'architecture', architecture: { nodeId? } }
{ tab: 'scope', scope: { itemId?, filter? } }
{ tab: 'methodologies', methodologies: { itemId? } }
```

Resolution order for `web`: ids → permission → apply (push context, close inspector, set
fields, historical notice) → select tab → `app.focusReturn = { focusKey: 'tabpanel-heading:<tab>' }`.
Level defaults to operational when a process/activity is given, tactical when only an area,
else strategic. A version is chosen with `visibleVersionFor` when none is given. Restricted
target → `ok: true`, `result: { tab, applied: false, restricted: true, messageId: 'MSG-02' }`,
`web.notice` set (kind `restricted`), tab switched, context unchanged. Unknown id →
`ok: false`, `code: 'invalid-target'`, `messageId: 'MSG-12'`, `reason`.

---

## 6. Versions

`store.getVersion(id, state?)`:

- Pack version → frozen copy of the pack record plus `activities` = `pack.baseActivities(id)`
  (activity entities whose `attributes.versionId === id`, keyed by `attributes.key || id`)
  with `activityOverrides` applied. Cached per id.
- Demo version (`state.demo.versions[id]`) → returned as stored when it carries an
  `activities` snapshot; otherwise `activities` is derived from `baseVersionId`'s activities
  (cloned) plus the demo version's `activityOverrides`.

`activityOverrides` entries merge shallowly over the base activity (and over its `attributes`).
`store.allVersions(processId?)` returns everything in order (pack, then demo).

---

## 7. Unsaved work (`store.hasUnsavedWork(state?)`)

True when any of: demo versions, staging entries, log entries or applied scenarios exist;
`demo.currentAsIsVersionId` changed; `demo.incidents`/`projects`/`accounts` differ from the
pack; an open form is `dirty`; a desktop session has a non-blank draft, events, a review, a
form, or a playback status other than `idle`. Registered as selector `hasUnsavedWork` when
`core/selectors` does not provide one.

---

## 8. Command catalogue (App and Web)

Payload fields are required unless marked `?`. Error codes are `error.code` values; every
command may also return `invalid-payload` (missing/invalid field, `error.field` set) and the
permission codes `forbidden` (`messageId` MSG-02/MSG-03). Results are the `result` object.

### 8.1 App (`core/commands/app`)

| Command | Payload | Effect / result | Errors |
| --- | --- | --- | --- |
| `selectTab` | `{ tabId }` | Switches tab; leaving `desktop` pauses `running` playbacks (`reason: 'tab'`). `{ tabId, changed, paused[] }` | `unknown-tab` |
| `selectAccessProfile` | `{ profileId }` | Sets `app.profileId`; applies `permissions.adjustContext` patch + notice `viewAdjusted`; re-validates area/process/version/selection/overlay/filters/history; non-admin pauses `running`/`awaiting-review` playbacks (`reason: 'profile'`); clears forms the profile cannot use. `{ profileId, changed, adjusted, paused[] }` | `unknown-profile` |
| `useAnalystProfile` | `{ profileId? }` | `selectAccessProfile` with `U-ADMIN` (or the first admin profile); desktop context kept. `{ ..., analyst: true }` | `unknown-profile` |
| `openAbout` / `closeAbout` | `{}` | `app.aboutOpen` | — |
| `openModal` | `{ modal: { kind, ... } }` (or the modal object itself) | `app.modal` (cloned) | `invalid-payload` |
| `closeModal` | `{}` | `app.modal = null` | — |
| `pushToast` | `{ text, tone?, messageId? }` | Appends `{ id, text, tone, messageId? }` (max 5). `{ id }` | `invalid-tone` |
| `dismissToast` | `{ id }` | Removes it. `{ id, removed }` | — |
| `requestReset` | `{}` | `hasUnsavedWork` → `app.modal = { kind: 'reset-confirm' }`, `{ confirmRequired: true, reset: false }`; else resets. | — |
| `resetDemo` | `{ force? }` | Without `force` behaves like `requestReset`. Reset: `timers.bump()`, fresh initial state, `demo.generation` = new generation, toast MSG-20 («La demostración volvió a su estado inicial», tone success). `{ reset: true, generation }` | — |
| `navigateTo` | `{ target }` (or the target itself) | §5. | `invalid-target` (+`messageId: 'MSG-12'`), `unknown-tab`, `unknown-workspace`, `unknown-scenario`, `unknown-record`, `unknown-node`, `unknown-item`, `invalid-filter` |
| `setFocusReturn` | `{ focusKey }` or `{ focusReturn: {focusKey}|null }` | `app.focusReturn` | `invalid-payload` |
| `setScroll` | `{ tabId, top }` | `app.scroll[tabId]` | `unknown-tab`, `invalid-payload` |
| `setArchitectureSelection` | `{ nodeId\|null }` | `app.architectureSelection` | `unknown-node` |
| `setArchitectureListMode` | `{ on }` | `app.architectureListMode` | — |
| `setScopeFilter` | `{ filterId }` | `app.scopeFilter` | `invalid-filter` |
| `selectScopeItem` | `{ id\|null }` | `app.scopeSelection` | `unknown-item` |
| `selectMethod` | `{ id\|null }` | `app.methodSelection` | `unknown-item` |

### 8.2 Web (`core/commands/web`)

| Command | Payload | Effect / result | Errors |
| --- | --- | --- | --- |
| `setModule` | `{ module: 'twin'\|'security' }` | Security requires `viewSecurity`. Closes inspector/overlay. | `invalid-module`, `forbidden` (MSG-02) |
| `setLevel` | `{ level }` | Pushes context, closes inspector, clears activity/overlay. Operational without process keeps `processId = null` (stage shows «Selecciona un proceso»); tactical derives `areaId` from the process when missing. | `invalid-level` |
| `setRepresentation` | `{ representation }` | Strategic + representation; pushes context; clears `highlightRootId` unless processmap. | `invalid-representation` |
| `setDepth` | `{ depth }` | `web.depth` | `invalid-depth` |
| `toggleExpand` | `{ entityId, on? }` | `web.expanded[entityId]` | `unknown-entity` |
| `expandAll` / `collapseAll` | `{}` | Visible organization/area/position ids. `{ count }` | — |
| `enterArea` | `{ areaId }` | Tactical context for a visible area; pushes context. | `unknown-area`, `forbidden` |
| `enterProcess` | `{ processId, view?, versionId? }` | Operational context; version = given (must be visible and belong to the process) or `visibleVersionFor`; sets `areaId` from the process when empty; pushes context. `{ processId, view, versionId }` | `unknown-process`, `invalid-view`, `unknown-version`, `invalid-version`, `forbidden` |
| `setProcessView` | `{ view }` | Requires a process. | `invalid-view`, `no-process` |
| `setVersion` | `{ versionId }` | Requires `canSeeVersion`; same process; drops activity/selection that no longer apply; historical notice; clears `newVersionNotice` for that version. `{ versionId, historical }` | `unknown-version`, `invalid-version`, `forbidden` (MSG-02) |
| `setCompareVersion` | `{ versionId }` | `web.compareVersionId` | same as `setVersion` |
| `setPaymentVariant` | `{ variant }` | Validated against the current flow's variants. `{ variant, available }` | `invalid-variant` |
| `openInstruction` | `{ versionId, key }` | Flow view with `activityKey`; pushes context. `{ versionId, key, nodeKind }` | `unknown-version`, `unknown-activity`, `forbidden` |
| `backToFlow` | `{}` | Clears `activityKey` (pops a duplicate snapshot). | — |
| `contextBack` | `{}` | §5. `{ restored, cameraKey? \| parent? \| atRoot? }` | — |
| `backToOrganization` | `{}` | §5. `{ rootId }` | — |
| `selectEntity` | `{ entityId, versionId?, kind?, followLink? }` | Opens inspector; with `versionId` the id may be an activity key or flow node (`kind: 'flowNode'`); `followLink` pushes the previous selection. `{ selection, pushed }` | `unknown-entity`, `invalid-kind`, `unknown-version`, `forbidden` |
| `inspectorBack` | `{}` | Pops inspector history. `{ selection, atRoot }` | — |
| `closeInspector` | `{}` | Clears selection and history. | — |
| `setHighlightRoot` | `{ entityId\|null }` | Processmap typed traversal root. | `unknown-entity`, `forbidden` |
| `setRelationsRoot` | `{ entityId }` | Strategic/relations with that root (pushes context when switching). | `unknown-entity`, `forbidden` |
| `clearRelationsRoot` | `{}` | `relationsRootId = null` | — |
| `toggleLayer` | `{ layerId, on? }` | `web.layers[layerId]` | `invalid-layer` |
| `setSearch` | `{ query }` | Stores the query (control characters stripped, max 120 chars, interior/trailing spaces kept for typing); `search.open = query.trim() !== ''`. No debounce here (UI debounces ≤ 150 ms). | — |
| `setSearchTypes` | `{ types: string[] }` | Validated against `ENTITY_TYPES` (+ `version`). | `invalid-type` |
| `setSearchIncludeVersions` | `{ on }` | | — |
| `setSearchOpen` | `{ open }` | | — |
| `clearSearch` | `{}` | query `''`, `open = false` | — |
| `setAreaFilter` | `{ areaId\|null }` | | `unknown-area`, `forbidden` |
| `clearFilters` | `{}` | Area filter, search (query/types/versions) and layers back to defaults; context untouched. | — |
| `setListMode` | `{ on }` | | — |
| `setCamera` | `{ contextKey, x, y, scale? }` | Rounded x/y, scale clamped 0.5–2.0 in 0.1 steps. Returns `{ x, y, scale }`. | `invalid-camera` |
| `zoomCamera` | `{ contextKey, delta? \| steps?, cx?, cy? }` | Delta in scale units (default +0.1) or `steps` × 0.1; optional zoom centre. | `invalid-camera` |
| `fitCamera` | `{ contextKey, contentWidth, contentHeight, viewportWidth, viewportHeight, padding? }` | Largest 0.1-step scale that fits (clamped), content centred. | `invalid-camera` |
| `resetCamera` | `{ contextKey }` | Deletes the entry (= `{ 0, 0, 1 }`). | `invalid-camera` |
| `openOverlay` | `{ kind, entityId?, versionId? }` | `web.overlay`; kinds `history\|document\|policy\|sources\|version\|connections`. | `invalid-overlay`, `unknown-entity`, `unknown-version`, `forbidden` |
| `closeOverlay` | `{}` | | — |
| `setNotice` | `{ text, kind?, tone?, action?, command?, messageId? }` | Custom `web.notice`. | `invalid-payload` |
| `dismissNotice` | `{}` | `web.notice = null` | — |
| `dismissNewVersionNotice` | `{}` | | — |
| `setTableSort` | `{ tableId, column, direction? }` | `web.tableSort[tableId]` (`direction` default `asc`; `null` column/direction clears). Mirrors into `web.incidents.sort` for `tableId: 'incidents'`. | `invalid-direction` |
| `setSecurityView` | `{ view: 'accounts'\|'audit' }` | Requires `viewSecurity`; switches to the security module. | `invalid-view`, `forbidden` (MSG-02) |
| `selectAccount` | `{ id\|null }` | `web.security.selectionId` | `unknown-record` |
| `setIncidentFilter` | `{ filterId }` | ids from `tracking.incidentFilters` | `invalid-filter` |
| `setIncidentQuery` | `{ query }` | | — |
| `selectIncident` | `{ id\|null }` | | `unknown-record` |
| `selectProject` | `{ id\|null }` | | `unknown-record` |
| `openForm` | `{ formId: 'incident'\|'project'\|'account', recordId? \| record?, mode?, values?, discard? }` | Permission `trackProcess` (incident/project) or `manageAccounts` (account). Mode defaults to `edit` with a record, else `create`. Refuses while another dirty form of the same slice is open unless `discard`. `{ formId, mode, recordId }` | `unknown-form`, `unknown-record`, `invalid-mode`, `dirty`, `forbidden` (MSG-03) |
| `updateForm` | `{ formId, field, value }` | Sets the value, clears that field's error, recomputes `dirty`. `{ formId, field, dirty }` | `unknown-form`, `form-not-open` |
| `setFormErrors` | `{ formId, errors? \| field, message? }` | Replaces/sets/clears errors (used by save handlers to show validation). | `unknown-form`, `form-not-open` |
| `closeForm` | `{ formId, discard? }` | Dirty form without `discard` → `ok: false`, `code: 'dirty'`, `message` = «¿Descartar los cambios sin guardar?», `error.formId`; UI shows the discard confirm and retries with `discard: true`. `{ formId, closed }` | `unknown-form`, `dirty` |

Shared helpers for other command modules: `Primus.require('core/commands/web').helpers`
(`entityOf`, `uiText`, `cameraKey`, `snapshot`, `pushContext`, `closeInspector`,
`applyHistoricalNotice`, `can`, `check`, `assertCan`, `isVisible`, `versionOf`,
`visibleVersionFor`, `pauseSessions(ctx, reason, statuses, sessionIds?)`, `resolveWebTarget`,
`applyWebTarget`, `restrictedNotice`, `recordIn`, `clampScale`, …) and
`Primus.require('core/commands/app').helpers` (`tabs`, `profiles`, `profileOf`,
`sanitizeWebForProfile`).

---

## 9. Differences from CONTRACTS.md and assumptions

- `navigateTo` to a restricted target returns `ok: true` with `result.restricted = true`
  and `messageId: 'MSG-02'` and sets `web.notice` (CONTRACTS §7.5 behaviour). It cannot
  return `ok: false` and also keep the notice, because `ok: false` means rollback.
  `setSecurityView`/`setModule('security')` do return `ok: false` with `messageId: 'MSG-02'`.
- `desktop.navigation` and `playback.pausedFrom` / `playback.pauseReason` are extra fields
  not listed in CONTRACTS §5.6.
- `web.search.query` is not trimmed in state (trimming on every keystroke would eat spaces
  while typing); `open` and the selectors use the trimmed/normalized value.
- `dispatch` results carry `changed` in addition to `result`; errors may carry extra keys
  (`formId`, `reason`, `cta`, `action`).
- `store.getState()` is not frozen; treat it as read-only.
