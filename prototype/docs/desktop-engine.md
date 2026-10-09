# Desktop engine — session, playback, review and form contract

Implemented by `src/core/versions.js`, `src/core/scenarios.js` and
`src/core/commands/{desktop,tracking,security}.js`. Binding references: `CONTRACTS.md`
§4.9, §4.10, §5.6, §5.8, §5.9, §6 and spec §10.5 / annex B. Everything visible comes from the
pack (`desktop.json`, `scenarios.json`, `pack.json` messages); the engine never carries
Spanish copy of its own except the audit-log action labels listed at the end.

The desktop feature reads **one selector**, `store.select('desktopModel', sessionId)`, and
writes **only through commands**. The raw session state is documented here so the shapes are
unambiguous, but the UI should render the selector output, not the raw state.

---

## 1. Session state (`state.desktop.sessions[sessionId]`)

```js
{
  mode: 'chat' | 'ops',
  draft: '',                       // composer text, per session; never cleared except when it equals the sent trigger prompt
  events: [Event],                 // transcript, append-only within a run; deduped by id
  playback: Playback,
  review: Review | null,           // current run's review (R-01 / R-02); null until an approval-request is emitted
  form: Form | null,               // SCN-02 preparation form; null until SCN-02-E03 is emitted
  expandedTools: { [eventId|callId]: true },
  unread: 0,                       // events appended while atLatest === false
  atLatest: true,                  // UI reports scroll position through setAtLatest
  syntheticSeq: 0                  // counter for engine-generated (non-scripted) events
}
```

`state.desktop.workspaceId` is the selected workspace; `state.desktop.evidenceOpenId` the
open evidence card; `state.desktop.navigation` `{ scenarioId, projectId } | null` is the hint
set by `navigateTo` (the "Preparar nuevo AS-IS" shortcut sets `scenarioId: 'SCN-02'`,
`projectId: 'PM-01'`); `selectWorkspace` clears it.

### 1.1 Event

```js
{
  id: 'SCN-01-E04#1',              // effective id = logicalId + '#' + runOrdinal (unique in the session)
  logicalId: 'SCN-01-E04',         // script id; test id is event-<logicalId>
  sequence: 4,                     // script sequence (null for synthetic events)
  kind: 'analyst-message' | 'assistant-message' | 'tool-start' | 'tool-result' | 'artifact-proposal'
      | 'approval-request' | 'approval-result' | 'form-request' | 'error' | 'completed',
  at: '2026-10-06T10:00:02-05:00', // store.now() at emission (logical clock; not ticked)
  status: 'done' | 'running' | 'failed',   // tool-start is 'running' until its result/error arrives
  scenarioId: 'SCN-01' | null,
  runOrdinal: 1 | null,
  synthetic: true | undefined,     // engine-made: unsupported/unavailable replies, rejection notice
  payload: { ...every field of the scripted event except id/sequence/kind, plus computed fields }
}
```

Computed payload fields by kind:

| kind | extra payload |
| --- | --- |
| `artifact-proposal` | `versionId` (= `stagesVersionId`), `staged: true`, `baseVersionId` |
| `tool-result` (SCN-02 E04) | `diffRows` (from `versions.describePromotion`), `formValues` |
| `approval-result` | `decision: 'approved' \| 'rejected'`, `versionId` (approved), `reason` (rejected), `message` (review message text), `statusLabel` (rejected → the rejected message) |
| `error` | `text` and `statusLabel` (= error-mode text), `errorModeId`, `errorModeLabel`, `replacesEventId`, `callId`, `operation`, `sourceIds`, `evidenceIds`; logicalId is `<replaced>-error` |
| synthetic `assistant-message` | `unsupported: true` + `draft`, or `unavailable: true` + `scenarioId`, `reasons`, `cta`, or `decision: 'rejected'` + `reason` |

Synthetic ids: `<sessionId>:note#<n>` (unsupported/unavailable), `<sessionId>:R-01-rejected#<n>`.

### 1.2 Playback

```js
{
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'awaiting-review' | 'failed' | 'completed',
  scenarioId: 'SCN-01' | null,
  runOrdinal: 1,                   // state.demo.runOrdinals[scenarioId], incremented on every start
  stepIndex: 2,                    // next entry of scenario.steps to emit
  pendingEventIds: ['SCN-01-E04'], // logical ids queued for delivery, in order
  scheduledEventId: 'SCN-01-E04' | null,   // head of the queue currently waiting on a store.timers callback
  timerId: 3 | null,
  errorMode: 'read-failure' | null,        // chosen before start; consumed once
  errorModeConsumed: false,
  failedEventId: 'SCN-01-E04' | null,      // logical id of the replaced tool-result while status === 'failed'
  generation: 1,                   // state.demo.generation captured at start; timer deliveries must match
  pausedFrom: 'running' | 'awaiting-review' | null,
  pauseReason: 'hidden' | 'tab' | 'workspace' | 'profile' | 'manual' | null,
  startedAt: ISO
}
```

### 1.3 Review

```js
{
  requestId: 'R-01#1',             // effective = logicalRequestId + '#' + runOrdinal; dedupes publish
  logicalRequestId: 'R-01',
  eventId: 'SCN-01-E10#1',         // the approval-request event
  scenarioId, runOrdinal,
  state: 'pending' | 'approved' | 'rejected' | 'canceled',
  decision: null | 'approve' | 'reject' | 'cancel',
  fields: { instruction, note, reason,            // SCN-01: instruction prefilled with diff.after, note '', reason ''
            result, backingReference, confirmation }, // SCN-02: copied from the submitted form
  errors: { [field]: 'exact MSG text' },          // set by resolveReview when validation fails
  notice: null | 'Revisión cancelada…' | 'Propuesta rechazada…' | 'Versión TO-BE 3 creada…',
  openedAt, resolvedAt, versionId
}
```

### 1.4 Form (SCN-02 only)

```js
{
  eventId: 'SCN-02-E03#1', logicalEventId: 'SCN-02-E03', scenarioId: 'SCN-02', runOrdinal: 1,
  title: 'Preparación del nuevo AS-IS', note: 'Si PM-01 está en curso…',
  projectId: 'PM-01', projectStatus: 'inProgress', projectStatusLabel: 'En curso',
  fields: { result: '<prefill>', backingReference: '<prefill>', confirmation: false },
  errors: {}, submitted: false, submittedAt: null
}
```

### 1.5 Demo slices touched by the engine

- `state.demo.staging['V-TOBE-03']` — created at `artifact-proposal` (E09):
  `{ versionId, scenarioId, sessionId, runOrdinal, processId, type, baseVersionId, activityKey, activityName, roleIds, before, after, instruction, note, edited, versionNote, pending, sourceIds, confidence, dataState, state: 'staged'|'published', stagedAt, publishedVersionId }`.
  `setReviewField('instruction')` keeps `staging.instruction` in sync so the artifact preview reflects edits live. Removed on reject (if unpublished) and on restart.
- `state.demo.versions['V-TOBE-03' | 'V-ASIS-02']` — snapshots (see §5).
- `state.demo.requestIds[effectiveRequestId] = true`, `state.demo.applied[scenarioId] = true`, `state.demo.runOrdinals[scenarioId]`.
- `state.demo.log` — publish/promotion entries (written by `core/versions`), rejection entries (written by `commands/desktop`).
- `state.app.toasts` — `outcome.toast` pushed on SCN-01 approval; `state.web.newVersionNotice = { versionId }` when the web panel is on the same process.

---

## 2. Playback states and transitions

```
idle ──start──▶ running ──(approval-request emitted)──▶ awaiting-review ──approve──▶ completed
  ▲               │ ▲                                     │   │
  │               │ │                                     │   └─reject──▶ completed (scenario can run again)
  │               │ └──continue──┐                        └─cancel: stays awaiting-review, review.state = canceled
  │   stop────────┤              │                             resumeReview → review.state = pending
  │               ▼              │
  │            stopped ──continue┘ (pending result delivered once, then next step on the next continue)
  │               ▲
  │  pause (hidden tab / workspace switch / profile change) from running|awaiting-review ──▶ paused
  │      continue from paused ──▶ back to pausedFrom (running resolves an interrupted step once)
  │
  │  error mode replaces a tool-result ──▶ failed ──retry──▶ running (real event re-scheduled, same callId)
  │
  └──restart (any state, after UI confirmation) ──▶ idle (transcript, review, form, unpublished staging cleared; draft kept)
```

Rules the UI can rely on (all exposed as booleans in `desktopModel.playback`):

- `canStart` lists scenario ids that pass preconditions **and** the session is `idle` or `completed` **and** the profile may maintain the model. Runs append to the same transcript with a new `runOrdinal`; SCN-02 after SCN-01 lives in the same session.
- `canContinue`: `paused`; or `stopped` with something left; or `running` with no timer pending, no queued event, no open form and steps remaining.
- `processing` (timer pending) → show the spinner with `processingText` (MSG-14). Nothing advances while the tab is hidden: `main.js` dispatches `pauseScenario` and the timer is cancelled; `Continuar` delivers the pending result exactly once (AT-22).
- `canStop`: `running` or `paused`. `canRetry`: `failed`. `canRestart`: anything but a pristine idle session.
- `errorModes` is non-empty only when `idle`/`completed` ("Probar recuperación" is a pre-start choice); `setErrorMode` fails with `error-mode-locked` otherwise.
- `pausedMessage` is MSG-19 while paused; a trigger prompt typed while paused/busy gets a synthetic reply with that text instead of a second run.
- A review in state `pending` or `canceled` blocks new starts in that session only (`noPendingReview`).

Timed delivery: `continueScenario` emits the step's events; a `tool-result` with `delayMs > 0` is queued and scheduled through `store.timers.set(fn, delayMs, 'session:<id>')` (0 ms under reduced motion, handled by the store). The callback dispatches `deliverTimedEvent {sessionId, eventId, generation, runOrdinal}`, which is ignored when the generation, run, status (`running`) or scheduled id no longer match, or the event already exists. With no timers available the result is delivered inline.

Error modes: when the queued event equals `errorMode.replacesEventId`, an `error` event is emitted instead, the paired `tool-start` turns `failed`, status becomes `failed`. `retryScenario` clears the mode, re-queues the real event (re-scheduled with its delay) and sets the tool card back to `running`; the error event stays in the transcript as evidence; no duplicate E04/E07 is ever produced.

---

## 3. Commands (`store.dispatch(type, payload)`)

All take `sessionId` (defaults to the selected workspace's session when omitted). Results are `{ ok: true, result }` or `{ ok: false, error: { code, message, field?, messageId?, cta?, details? } }`.

| command | payload | effect / result |
| --- | --- | --- |
| `selectWorkspace` | `{workspaceId}` | pauses the previous session if `running` (`pauseReason: 'workspace'`), clears `navigation` |
| `setSessionMode` | `{sessionId, mode:'chat'|'ops'}` | transcript, draft, review untouched |
| `setDraft` | `{sessionId, text}` | control characters stripped; no trimming |
| `submitDraft` | `{sessionId}` | normalized text (trim/collapse/lowercase/strip diacritics) equal to a trigger prompt of **this session's** scenarios → `start` (draft cleared) → `{started:true, scenarioId}`; unavailable/busy → synthetic reply with the reason text → `{started:false, unavailable:true}`; any other text → synthetic reply `desktop.unsupported`, draft kept → `{unsupported:true}`. Non-admin → error `read-only` (text = `desktop.readOnlyMessage`, `cta` useAnalystProfile). Empty → `empty-draft`. |
| `startScenario` | `{sessionId, scenarioId, errorMode?}` | preconditions (`scenario-unavailable`, `error.details.reasons`), session must be idle/completed (`session-busy`), scenario must belong to the session (`scenario-session-mismatch`); emits step 0 |
| `continueScenario` | `{sessionId}` | see §2; result `{emitted:[ids], resumed, waiting:'form'|'review'|'none'|null, status}` |
| `stopScenario` | `{sessionId}` | `cannot-stop` unless running/paused |
| `pauseScenario` | `{sessionId?, reason?}` | no-op result `{paused:[]}` when nothing runs; without `sessionId` pauses every session |
| `retryScenario` | `{sessionId}` | `cannot-retry` unless failed |
| `restartScenario` | `{sessionId}` | the UI confirms with `desktop.errorMenu.restartConfirm` first; result `{removedStaging:[ids]}` |
| `setErrorMode` | `{sessionId, errorMode|null}` | only while idle/completed |
| `toggleTool` | `{sessionId, eventId, expanded?}` | keyed by event id (or callId) |
| `setReviewField` | `{sessionId, field:'instruction'|'note'|'reason', value}` | pending review only; clears that field's error; instruction syncs the staging/artifact |
| `restoreReviewText` | `{sessionId}` | instruction = `diff.after` |
| `resolveReview` | `{sessionId, decision:'approve'|'reject'|'cancel', fields?}` | see §4; `review-resolved` on a second call (double click is harmless) |
| `resumeReview` | `{sessionId}` | canceled → pending (`review-not-canceled` otherwise) |
| `setScenarioFormField` | `{sessionId, field, value}` | checkbox → boolean; `form-submitted` after submit |
| `submitScenarioForm` | `{sessionId, fields?}` | validates; errors stored in `form.errors` → `{applied:false, errors, firstErrorField, messageId:'MSG-15'}`; valid → emits E04 + E05, status `awaiting-review` |
| `openEvidence` | `{evidenceId|null}` | TO-BE evidence requires `viewDraftsToBe` (permission error with MSG-02/03 shape) |
| `setAtLatest` | `{sessionId, atLatest}` | true resets `unread` |
| `markRead` | `{sessionId}` | `unread = 0`, `atLatest = true` |
| `deliverTimedEvent` | `{sessionId, eventId, generation, runOrdinal}` | internal; never fails |

Validation inside the desktop (review fields, SCN-02 form) is **not** a dispatch failure: the typed values and their errors are kept on the session (`review.errors`, `form.errors`) and the result says `applied: false` with `firstErrorField` to focus and `messageId: 'MSG-15'` for the summary line. Permission and precondition failures are dispatch failures (`ok: false`) and leave the draft untouched.

---

## 4. Review resolution (R-01 / R-02)

`approve`
1. `permissions.can('publish')` → else `forbidden` with `messageId: 'MSG-03'`, `cta` useAnalystProfile.
2. SCN-01: instruction 20–600 (MSG-04 / MSG-05 with `{min,max}` from `scenario.review.instructionField`), note 0–300; base `V-TOBE-02` must exist; target `V-TOBE-03` must be absent unless this same `requestId` already published it (idempotent).
   SCN-02: `confirmation === true` (MSG-04), result 10–500, backingReference 5–120 (limits from the form-request field definitions), origin `V-TOBE-03` must exist (error text = the precondition message, `cta` "Ir a revisar propuesta"), target `V-ASIS-02` absent.
3. `versions.publishDemoVersion` / `versions.promoteDemoVersion` (one atomic draft mutation, log entry written there).
4. Emits `approval-result` (`decision: 'approved'`) + `completed`; status `completed`; `demo.applied[scenarioId] = true`; SCN-01 pushes the toast "Versión TO-BE 3 creada en esta sesión"; `web.newVersionNotice` set when the web panel shows the same process.

`reject`: reason 5–300 (MSG-04/05) → `approval-result` (`decision: 'rejected'`, `statusLabel` = rejected message) + synthetic assistant message with the rejected text; staging removed; status `completed`; audit log "Rechazar propuesta → R-01 · <motivo>". The scenario is startable again (new `runOrdinal`, same target) while the target version is absent.

`cancel`: `review.state = 'canceled'`, `review.notice` = canceled message; staging kept; nothing emitted; status stays `awaiting-review` so the panel shows the notice and "Retomar revisión" (`enabled.resume`).

---

## 5. Version snapshots (`core/versions`)

```js
createVersions(store) → {
  describeStaging(scenario|scenarioId, { instruction?, note? }, state?) → { versionDraft, diffRows:[{ id:'instruction', key:'T-02', label:'T-02 · Revisar documentos, firmas y nombres', before, after, edited }], artifactYaml }
  stageVersion(state, { scenarioId, instruction, note, runOrdinal?, sessionId? }) → staging entry (state.demo.staging[versionId])
  publishDemoVersion(state, { requestId, scenarioId, instruction, note, actorProfileId, runOrdinal? }) → version  // idempotent by requestId / existing target
  describePromotion(state, { projectId, result, backingReference, scenarioId? }) → [{ id, label, before, after, unchanged }]
  promoteDemoVersion(state, { requestId, projectId, result, backingReference, actorProfileId, scenarioId?, runOrdinal? }) → version
  artifactYaml(versionLike, { state }) → string   // staging entry or published version; estado propuesta-en-demo / publicada-en-demo
  artifactTitle(ref), resolveVersion(state, id), activitiesOf(version), processOwnerAreaId(processId)
}
```

Snapshot shape (both versions): every field of the base version plus
`id, type, label, state, stateLabel, flowId (inherited), baseVersionId, originVersionId (V-ASIS-02 → 'V-TOBE-03'), adoptionLabel, derivedLabel ("Derivada de una propuesta", for profiles that cannot see the origin), publishedAt (logical clock), publishedBy ("Analista de Calidad · perfil de demo"), publishedByProfileId, summary, changeLabel, sourceIds, provenance {sourceIds, confidence, observedAt:null, dataState}, labels, publishable:false, isDemo:true, pending (inherited), notes (base notes + versionNote), reviewNote, edited, activityOverrides, activities: { key → activity } (each activity's attributes.versionId = new id; T-02 instruction/whatToDo/description replaced, provenance inferred/proposed, labels «Propuesto · por validar» + «Ejemplo de demostración» when edited), diff {activityKey, before, after, proposed, versionNote}, scenarioId, requestId, runOrdinal`. V-ASIS-02 adds `adoption { projectId, result, backingReference, previousAsIsVersionId }`.

Source ids: V-TOBE-03 → `diff.sourceIds` (`S-TOBE2, S-CASE`) plus `S-DEMO` only when the instruction was edited; V-ASIS-02 → outcome source ids plus `S-DEMO`.

Promotion mutates, on the same draft: `demo.versions['V-ASIS-02']`, PM-01 (`status: 'concluded'`, `result`, `backingReference`, `closedAt` = business date, a `followUp` entry), `demo.currentAsIsVersionId`, `demo.requestIds`, `demo.log`.

---

## 6. `desktopModel(ctx, sessionId?)` output

```js
{
  sessionId, workspaceId,
  workspace: { id, label, statusLabel, processId, processName, evidenceIds, scenarioIds, welcome, welcomeActions[] },
  workspaces: [{ id, label, sessionId, statusLabel, selected, playbackStatus, unread, pendingReview, needsAttention }],   // roster
  chips: ['Próspera', 'Emisión de boletas', '5 fuentes disponibles', 'TO-BE 2 · Propuesto'],   // last chip = latest visible demo version label once one exists
  session: { mode, draft, unread, atLatest, expandedTools, eventCount },
  modes: [{ id:'chat', label:'Conversación' }, { id:'ops', label:'Operaciones' }],
  events: [RenderedEvent],              // see below
  review: ReviewModel | null,           // null for non-admin profiles
  form: FormModel | null,               // SCN-02 only; null for non-admin
  operations: [OperationRow],           // one row per operation call (tool pair merged by callId)
  operationsColumns: ['Secuencia','Operación','Estado','Fuente'],
  artifact: { title:'proceso-boletas.yml · representación de ejemplo', yaml, versionId, state:'staged'|'published', stateLabel, edited, scenarioId } | null,
  playback: { status, scenarioId, scenarioTitle, runOrdinal, stepIndex, totalSteps, pendingEventIds, processing, processingText, pausedMessage, pauseReason, failedEventId,
              errorMode, errorModes:[{ id, label, scenarioId, selected }], errorModesLabel:'Probar recuperación',
              canStart:['SCN-01'], scenarios:[{ id, title, triggerLabel, prompt, available, reasons, reason, cta, applied, suggested, errorModes, errorModesLabel }],
              canContinue, canStop, canRetry, canRestart, canPause,
              labels:{ start, continue, stop, retry, restart, restartConfirm } },
  footer: { sessionOnly:'Cambios solo en esta sesión', pendingReview:'Revisión pendiente del analista' | null },
  readOnly, readOnlyMessage, readOnlyCta: { label:'Usar perfil de analista', command:{ type:'useAnalystProfile', payload:{} } } | null,
  evidence: [{ id, label, referenceLabel, stateLabel, summary[], sourceId, source:{ id, title, section, date, kind }, versionId, entityIds (visible only), restrictedTo, open }],
  evidenceHiddenCount, evidenceNotice (desktop.employeeToBeMessage when something was hidden), evidenceOpenId, evidencePicker:{ label },
  composer: { label, placeholder, submit, enabled }, unsupportedMessage,
  texts: { title, intro, disclaimer, regions, newMessages:'{n} mensajes nuevos' | null, jumpToLatest, processing },
  unread, navigation
}
```

`RenderedEvent`: `{ id, logicalId, sequence, kind, status, at, atLabel ('10:00:02'), scenarioId, runOrdinal, synthetic, isAnalyst, isAssistant, isTool, isError, text, label, title, statusLabel, callId, operation, evidence:[{id,label,stateLabel,sourceId}] (permission-filtered), sources:[{id,title,section}], sourceIds, links:[{ entityId, name, type, typeLabel, visible, target }] (target null when not visible), pending[], versionId, requestId, decision, reason, message, cta (null when the version is not visible), unsupported, unavailable, reasons, diffRows, replacesEventId, errorModeLabel, expanded, formEventId, hidden }`. `hidden` is true for artifact/approval/form events when the profile is read-only (render nothing for them).

`ReviewModel`: `{ requestId, logicalRequestId, eventId, scenarioId, runOrdinal, state, decision, title, text, responsibleLabel:'Analista de Calidad', scopeLabel, pendingLabel, referencesLabel, fields, errors, instructionField:{label,min,max,restore}, noteField, reasonField, editable (SCN-01 only), edited, diffRows, diff:{ activityKey, before, after, proposed, versionNote }, pending[], references:[{id,title,section}], actions:{ approve, reject, cancel, resume }, enabled:{ approve, reject, cancel, resume }, notice, messages, versionId, resolvedAt, fieldsMessageId:'MSG-15', fieldsMessage }`. A resolved review (approved/rejected) is still returned with every action disabled so the panel can show its notice; hide it or show it as history as the design prefers.

`FormModel`: `{ eventId, logicalEventId, scenarioId, runOrdinal, title, note, projectId, projectStatus, projectStatusLabel, submitted, enabled, fields:[{ id, type:'readonly'|'textarea'|'text'|'checkbox', label, value, min, max, required, readonly, testid, error }], submit:{ label, testid }, errors, values }`.

`OperationRow`: `{ sequence, operation, status:'running'|'done'|'failed', statusLabel ('En curso' / 'Completado' / error text / rejected message), sourceIds, sourceLabel ('S-TOBE2 · S-CASE'), eventId (start), resultEventId, eventIds, logicalId, callId, kind, label, text, decision, runOrdinal, scenarioId }`. Opening a row expands the same tool card (`toggleTool` with `eventId`).

Other selectors: `scenarioAvailability(scenarioId)` → `{ ok, scenarioId, reasons:[{ code, text, cta, versionId? }], scenario, sessionBusy, readOnly, canStart }`; `operationsRows(sessionId)`; `artifactPreview(sessionId)`.

Reason `cta` shapes: `{ label, command:{ type, payload } }` — `useAnalystProfile` (profile), `startScenario SCN-01` ("Ir a revisar propuesta"), `navigateTo` to the completed event's target ("Ver TO-BE 3 en el prototipo web" once applied), `resumeReview` (canceled review).

---

## 7. Tracking and security commands (for the web feature)

Error shape on validation: `{ code:'validation', message:<first error text>, field:<first invalid field>, messageId:'MSG-04'|'MSG-05'|'MSG-06'|'MSG-07'|'MSG-13'|null, params:{min,max}?, errors:{ [field]: text }, details:{ errors, params, reason } }` — show `errors` inline and focus `field`. Permission failures: `{ code:'forbidden', messageId:'MSG-03', message, action, cta }`. Last-admin: `{ code:'last-admin' | 'validation', messageId:'MSG-08' }`.

| command | payload | notes |
| --- | --- | --- |
| `createIncident` | `{subject 5–100, description 10–500, responsibleId ∈ tracking.responsibleOptions, dueDate 'YYYY-MM-DD'}` | → `INC-DEMO-04…`, `status:'open'`, `createdAt` = business date, `isDemo`, `sourceIds:['S-DEMO']`; closes `web.incidents.form`, selects the record |
| `updateIncident` | `{id, subject?, description?, responsibleId?, dueDate?, status?:'open'|'inProgress'}` | closed records and `status:'closed'` are rejected |
| `closeIncident` | `{id, resolution 10–500}` | `status:'closed'`, `closedAt` = business date |
| `createProject` | `{name 5–100, objective 10–500, responsibleId ∈ projectResponsibleOptions, dueDate, targetVersionId}` | target must be a visible TO-BE version of the process that is not an incomplete draft (V-TOBE-02, or V-TOBE-03 once it exists); → `PM-DEMO-02…`, `status:'planned'`, `startDate:null` |
| `startProject` | `{id}` | planned → inProgress, `startDate` = business date |
| `updateProject` | `{id, objective?, responsibleId?, dueDate?, status?:'planned'|'inProgress'}` | concluded projects are rejected; never touches name/targetVersionId |
| `closeProject` | `{id, result 10–500, confirmed:true}` | → `concluded`, `closedAt`; never creates a version |
| `createDemoUser` | `{username, role, positionId|null}` | trim+lowercase, `/^[a-z0-9._-]{3,40}$/` (rule text from `security.form.fields.username.rule`), duplicate → MSG-07, employee needs a position |
| `updateDemoUser` | `{id, role, positionId|null}` | demoting the last active admin → MSG-08 |
| `deactivateDemoUser` / `deleteDemoUser` | `{id}` | last active admin → MSG-08; delete only `isTest` |

Audit-log action labels (Spanish, written to `state.demo.log`): Crear incidencia · Editar incidencia · Cerrar incidencia · Crear proyecto · Iniciar proyecto · Editar seguimiento · Marcar concluido · Crear usuario · Editar acceso · Desactivar usuario · Eliminar usuario de prueba · Rechazar propuesta · Publicar versión de demo (scenario `outcome.logAction`) · Publicar nuevo AS-IS de demo. Each entry: `{ seq, at (clock ticked +1 s), profileId, action, result:'<id> · <subject|name|username|changeLabel>' }`.
