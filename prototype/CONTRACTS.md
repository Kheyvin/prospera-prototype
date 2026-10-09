# PRIMUS para Próspera — internal implementation contracts

Status: binding for every file under `prototype/`. The functional truth is
`../prototype-prospera/spec.md` (the spec). This document only fixes *how* the code
is organized so that modules written in parallel fit together. When this document
and the spec disagree about visible behaviour or text, the spec wins; when they
disagree about code structure, this document wins. All UI strings are Spanish and
come from the pack or from the spec tables; code identifiers are English.

Paths in this file are relative to `prototype/`. The deliverable is
`dist/prospera-prototype.html` (spec §18 names `implementation/dist/...`; the project
owner asked for the folder to be called `prototype`).

---

## 1. Module system (classic scripts, no bundler magic)

Runtime is a single classic `<script>`. There are no ES modules, no `import`, no
`require` from Node, no dynamic loading. Every source file registers exactly one
module with the global registry defined in `src/prelude.js`:

```js
Primus.module('core/graph', function (require) {
  const format = require('core/format');     // lazy, resolved on first call
  function entity(id) { /* ... */ }
  return { entity };                          // the module's public API (frozen by prelude)
});
```

Rules:

- Module ids are the file path without `src/` and `.js`: `src/core/graph.js` →
  `core/graph`; `src/features/web/index.js` → `features/web`; `src/ds/atoms.js` → `ds/atoms`.
- `require(id)` may be called at factory time for dependencies that are earlier in the
  manifest order, and inside functions for anything else (this is how cycles are avoided).
  Never do DOM work at factory time; core modules must load in Node without a DOM.
- A module factory receives one argument `require` and returns a plain object. Do not
  touch `window`/`document` at load time outside `src/main.js`.
- The build concatenates files in `build/manifest.json` order; the same order is used by
  the Node test loader (`tests/helpers/load.js`). A file that is not in the manifest does
  not exist. Add every new file to the manifest.
- `src/main.js` is the only file that reads the embedded pack from the DOM, creates the
  store, and mounts the shell. It runs last.

Node test loader (used by every contract test):

```js
const { loadRuntime } = require('../helpers/load.js');
const P = loadRuntime();                 // evaluates prelude + all manifest JS except main.js
const pack = P.loadPack();               // resolved pack object (merged client JSON files)
const store = P.require('core/store').createStore({ pack });
```

`loadRuntime()` sets `global.Primus` and executes each manifest JS file with
`vm.runInThisContext`. Core/ds/feature factories must therefore not reference `document`
at factory time (features may reference it inside `mount`).

## 2. Directory layout and ownership

```
prototype/
  README.md                      implementation decisions, how to build/test, verification report pointers
  CONTRACTS.md                   this file
  package.json                   scripts only; no runtime dependencies, no dev dependencies required
  build/
    build.mjs                    node build/build.mjs --client prospera [--dev] [--out dist]
    validate-pack.mjs            node build/validate-pack.mjs --client prospera   (also used by build)
    manifest.json                ordered allowlist of css, js, pack files, assets
  schemas/
    client-pack.schema.md        human-readable field contract (section 4 of this file is canonical)
    pack-validator.js            registered as Primus module `schemas/pack-validator` (pure, runs in Node and browser)
  src/
    prelude.js                   Primus registry
    shell.html                   HTML template with placeholders (section 10)
    main.js                      bootstrap
    core/
      dom.js                     h(), svg(), text helpers, focus/scroll preservation, live announcer
      format.js                  dates, missing values, text normalization, pluralization
      pack.js                    pack merge/resolve/index: entity map, relation indexes, versions, flows
      graph.js                   typed traversals, derived projections (SIPOC, RACI, counts, history, search)
      permissions.js             profile matrix, visible sets, action checks
      store.js                   state, dispatch, subscribe, snapshot/reset, logical clock, generation ids
      versions.js                version snapshots: staging, publish (V-TOBE-03), promote (V-ASIS-02)
      scenarios.js               deterministic playback engine for desktop sessions
      selectors.js               view-model selectors (pure) registered into the store
      commands/
        index.js                 registry: assembles all command modules
        app.js                   selectTab, selectAccessProfile, openAbout, resetDemo, toast, modal, navigateTo
        web.js                   twin navigation, selection, inspector history, camera, search, filters, expansion
        tracking.js              incidents + projects
        security.js              demo accounts + audit log
        desktop.js               workspaces, drafts, modes, playback, reviews, forms
    ds/
      tokens.css                 verbatim copy of ../prototype-prospera/references/prenter/tokens.css (minus the legacy helpers at the end)
      extensions.css             prototype tokens (layout, control, duration, z, graph) per design.md §2
      base.css                   reset, typography, focus ring, reduced motion, utilities
      atoms.css / atoms.js       button, badge, card, field/input/select/textarea, icon button, spinner, divider, chip
      molecules.css / molecules.js  tabs, breadcrumbs, search field, entity link, status/provenance label, table, disclosure, modal, toast, empty state, metric value
      icons.js                   inline SVG icon registry
      catalog.html               development catalog (never shipped)
    components/
      shell/                     header.js, tabbar.js, about.js, reset.js, notices.js
      twin/                      rail.js, contextbar.js, canvas.js (camera layer), inspector.js, entitylist.js, history.js
      analyst/                   roster.js, contextchips.js, stream.js, toolcard.js, review.js, composer.js, operations.js, evidence.js
    features/
      architecture/index.js      tab 1
      scope/index.js             tab 2
      methodologies/index.js     tab 3
      web/                       index.js (TwinWorkspace), orgchart.js, processmap.js, relations.js, areaspace.js,
                                 processsheet.js, flow.js, instruction.js, compare.js, incidents.js, projects.js, security.js
      desktop/                   index.js (AnalystStudio), scenario-ui.js (SCN-01/SCN-02 panels, artifact preview)
    styles/
      layout.css                 shell, narrative pages, twin and studio layouts
      visualization.css          canvases, nodes, lanes, edges, materials
      responsive.css             breakpoints 1280 / 768
      print.css
  clients/prospera/
    pack.json                    client, presentation, demo (profiles, clock), messages
    source-register.json         sources[]
    solution.json                tab 1
    scope.json                   tab 2
    methodologies.json           tab 3
    organization.json            structure: organization, areas, positions, people, externals, portfolio processes, relations
    case.json                    boletas case: macroprocess, PR-BOLETAS, roles, actor, systems, documents, policy, objective, indicator, gaps, flows, versions, activity entities, relations
    tracking.json                incidents, projects, accounts
    desktop.json                 workspaces, sessions, evidence, composer texts
    scenarios.json               SCN-01, SCN-02
  tests/
    helpers/load.js
    contracts/*.test.js          node --test tests/contracts
    interactions/*.test.js       pure command/selector journeys (no DOM)
    delivery/*.test.js           dist checks (no external refs, size, report hash, escaping)
  dist/                          GENERATED only
```

Files in `clients/` are merged into one pack object: top-level keys are deep-merged one
level; arrays with the same path are concatenated; scalar conflicts fail the build.

## 3. Conventions that apply everywhere

- **No `innerHTML` with any string that comes from the pack or the user.** Build DOM with
  `dom.h` and text nodes. `innerHTML` is only allowed for static, literal markup inside a
  component file (never interpolated). Icons are built with `dom.svg`.
- Everything the user can click is a native `<button>`, `<a>` (only for the optional
  external references, with `rel="noopener"` and `target="_blank"`), `<input>`, `<select>`,
  `<textarea>`, or an element with a proper role + keyboard handling. No click handlers on
  `div`s.
- Every state change goes through `store.dispatch(type, payload)`. Components never mutate
  state or pack data. Pack objects are frozen by `core/pack` (deep `Object.freeze`).
- Every visible string that the spec prescribes comes from the pack. Generic UI chrome
  strings (e.g. "Cerrar", "Volver", "Buscar") live in `pack.presentation.ui` (a flat map,
  see §4.2) so they are also data. Feature code may not hardcode Spanish copy except for
  genuinely generic labels that are listed in `pack.presentation.ui`.
- Null/unknown values render through `format.missing()` ("Sin dato proporcionado") or the
  specific message id. Never render `null`, `undefined`, `NaN`, `0` for a missing value.
- CSS: BEM-ish classes, no prefix: block `.btn`, element `.btn__icon`, modifier
  `.btn--primary`, state `.is-selected`, `.is-open`, `.is-disabled`. Layout regions use
  `.shell-*`, `.twin-*`, `.studio-*`, `.narrative-*`. No inline styles except for
  computed geometry (`transform`, `left`, `top`, `width`, `height`) on canvas nodes.
- Attributes for tests: `data-testid` on every control named in §11. Entities rendered on
  canvases/lists carry `data-entity-id` (and `data-version-id` for activities).
- Logical clock: every logged action advances `state.demo.clock` by one second
  (`store.now()` returns the ISO string). Never read `Date.now()` for business logic.
  Decorative timers may use `setTimeout` but must be registered through
  `store.timers` (section 6) so reset/stop/hidden-tab cancels them.
- Accessibility: labels for every control; `aria-pressed` for toggles; `aria-sort` on
  sortable headers; `aria-live="polite"` region (`dom.announce`) for search result
  counts, completed tool steps, pending reviews, saved actions; focus goes to the first
  invalid field on failed save; modals trap focus and restore it; `prefers-reduced-motion`
  disables transitions and makes timers 0 ms.

## 4. Resolved pack contract (schemaVersion 1)

The validator (`schemas/pack-validator.js`) enforces this section and fails the build on
any violation. Unknown top-level keys fail. Every `id` is globally unique across
entities, relations, sources, solution nodes/edges, scope items, methods, versions,
flows, scenarios, events, profiles, accounts, incidents, projects, workspaces, sessions,
evidence.

### 4.1 Identity and demo configuration (`pack.json`)

```jsonc
{
  "schemaVersion": 1,
  "specVersion": "1.0",
  "client": {
    "id": "prospera", "name": "Próspera Grupo Inmobiliario",
    "legalName": "Próspera Construcciones S.A.C.",
    "wordmark": "PRÓSPERA", "wordmarkTagline": "Grupo Inmobiliario",
    "locale": "es-PE", "timeZone": "America/Lima", "currency": "PEN",
    "classification": "Confidencial · Uso exclusivo de Próspera",
    "dataMode": "mixed"
  },
  "presentation": {
    "productName": "PRIMUS",
    "windowTitle": "PRIMUS para Próspera · Prototipo",
    "title": "PRIMUS para Próspera",
    "subtitle": "Una organización conectada, un conocimiento compartido",
    "badges": ["Prototipo · Interacciones simuladas", "Confidencial · Uso exclusivo de Próspera"],
    "actions": { "viewWeb": "Ver prototipo web", "reset": "Reiniciar demo", "about": "Acerca de esta demo" },
    "tabs": [
      { "id": "architecture", "label": "Arquitectura de la solución" },
      { "id": "scope", "label": "Alcance del proyecto" },
      { "id": "methodologies", "label": "Metodologías aplicadas" },
      { "id": "web", "label": "Prototipo web" },
      { "id": "desktop", "label": "Prototipo de escritorio" }
    ],
    "about": { "title": "Acerca de esta demo", "text": "…spec §14.4…", "button": "Entendido" },
    "noscript": "Este prototipo necesita JavaScript para navegar. Abre el archivo en un navegador con JavaScript habilitado.",
    "ui": { /* generic chrome labels, see 4.2 */ }
  },
  "demo": {
    "businessDate": "2026-10-06",
    "clockStart": "2026-10-06T10:00:00-05:00",
    "initialTab": "architecture",
    "initialProfileId": "U-MANAGER",
    "dueSoonUntil": "2026-10-09",
    "profiles": [
      {
        "id": "U-MANAGER", "label": "Gerencia General · Solo lectura", "accessRole": "manager",
        "positionId": "J-01", "personId": "P-01", "areaId": null,
        "grants": { "processOwnerOf": [], "canMaintainModel": false },
        "visibility": { "all": true },
        "description": "…"
      },
      {
        "id": "U-EMPLOYEE", "label": "Asistente administrativa · Consulta de mi trabajo", "accessRole": "employee",
        "positionId": "J-03", "personId": "P-03", "areaId": "A-AF",
        "grants": { "processOwnerOf": [], "canMaintainModel": false },
        "visibility": { "all": false, "entityIds": ["ORG-01", "A-AF", "A-COM", "MP-AF", "PR-BOLETAS", "..."], "versionTypes": ["AS-IS"], "tracking": false },
        "description": "…"
      }
      // U-ADMIN (admin, J-05/P-05, all:true, canMaintainModel:true), U-OWNER (employee, areaId A-AF, personId null,
      // processOwnerOf ["PR-BOLETAS"], visibility all:false + versionTypes ["AS-IS","TO-BE"], tracking true)
    ],
    "accessMatrix": [ { "action": "viewAll", "label": "Consultar toda la organización", "admin": true, "manager": true, "employee": false, "owner": false }, "…" ]
  },
  "messages": { "MSG-01": "…", "MSG-02": { "text": "…", "action": "Volver a una vista permitida" }, "…": "…", "MSG-20": "…" }
}
```

Messages whose spec row has an action are objects `{text, action}`; others are strings.
`format.msg('MSG-05', {min, max})` interpolates `{name}` placeholders.

### 4.2 `presentation.ui` keys (generic chrome)

Required keys (values in Spanish): `close`, `back`, `backToMap`, `backToOrganization`,
`search`, `searchPlaceholder`, `clearSearch`, `results` ("{n} resultados"), `clearFilters`,
`showAll`, `cancel`, `save`, `confirm`, `edit`, `continue`, `start`, `stop`, `retry`,
`restartScenario`, `resumeReview`, `history`, `sources`, `viewInWeb`, `viewConnections`,
`clearRelationFocus`, `showRelationsOfObjective`, `focusArea`, `openAreaSpace`,
`openFlow`, `viewSheet`, `compareVersions`, `viewIncidents`, `viewProjects`, `viewInstruction`,
`backToFlow`, `listView`, `mapView`, `zoomIn`, `zoomOut`, `fitView`, `resetCamera`,
`moduleNavigation` ("Navegación del módulo"), `profileSelector` ("Simular acceso como"),
`useAnalystProfile` ("Usar perfil de analista"), `levelStrategic`, `levelTactical`,
`levelOperational`, `repOrgchart`, `repProcessMap`, `repRelations`, `depthAreas`,
`depthPositions`, `depthPeople`, `usersAndAccess`, `discardChanges` object
`{title, keep, discard}`, `resetConfirm` object `{title, cancel, confirm}`, `viewVersion`,
`compareWithBase`, `newVersionNotice` ("Hay una nueva versión de demostración"),
`viewNewVersion` ("Ver versión"), `historicalReadOnly` ("Versión histórica · solo lectura"),
`viewAdjusted` ("La vista se ajustó al perfil seleccionado"), `restricted`, `newMessages`
("{n} mensajes nuevos"), `jumpToLatest` ("Ir al último mensaje"), `processing` (= MSG-14),
`selectProcess` ("Selecciona un proceso"), `noDetail`, `externalReference` ("Abrir referencia externa").
The DS agent may add keys; it must document them in `schemas/client-pack.schema.md`.

### 4.3 Sources (`source-register.json`)

```jsonc
{ "sources": [ { "id": "S-CASE", "title": "Caso de mejora de proceso: emisión de boletas", "kind": "case",
    "section": "Láminas 1–4", "date": null, "modelModifiedAt": null, "clientVisible": true,
    "note": "Dueño, límites y problemas; diagramas AS-IS y TO-BE" } ] }
```
`kind` ∈ `instruction | proposal | email | orgchart | case | model | metadata | scope-deck | policy | demo | vision | contract`.
No file paths. `modelModifiedAt` only for S-ASIS/S-TOBE1/S-TOBE2 (spec annex A values).

### 4.4 Solution (`solution.json`, tab 1)

```jsonc
{ "solution": {
  "title": "Así funcionará PRIMUS en Próspera", "intro": "…", "caption": "Arquitectura propuesta del sistema a implementar. Este archivo solo simula sus pantallas",
  "emptyInspector": "Selecciona una parte para conocer su función",
  "zones": [ { "id": "Z-USER", "label": "Equipo del usuario", "kind": "user-device" },
             { "id": "Z-VPS", "label": "VPS de Próspera · servidor privado en internet", "kind": "vps" },
             { "id": "Z-AI", "label": "Servicio de IA", "kind": "external" } ],
  "systemBoundary": { "label": "PRIMUS", "nodeIds": ["C-WEB","C-API","C-GRAPH","C-SEC","C-FILES","C-DESK"] },
  "actors": [ { "id": "ACT-ADMIN", "label": "Administrador", "targetNodeIds": ["C-WEB"] }, "…" ],
  "nodes": [ { "id": "C-WEB", "name": "Portal web", "subtitle": "Aplicación web", "zoneId": "Z-USER",
               "locationLabel": "Navegador", "icon": "monitor", "state": "proposed",
               "decision": "defined" | "pending", "decisionLabel": "Decisión definida para esta propuesta" | "Detalle por definir",
               "description": "…exact inspector text…", "inputs": ["…"], "outputs": ["…"] } ],
  "edges": [ { "id": "E-C01", "from": "C-WEB", "to": "C-API", "label": "Consulta y acciones autorizadas · HTTPS" } ],
  "legend": ["…"], "notes": ["…"],
  "lifecycle": { "title": "Cómo se mantiene una única versión", "steps": ["1. …", "…"], "note": "Las aprobaciones internas…" },
  "ctas": [ { "label": "Explorar alcance", "target": { "tab": "scope" } }, { "label": "Ver prototipo web", "target": { "tab": "web" } } ]
} }
```
Edges reference existing nodes; actors reference nodes; the validator rejects any edge into
`C-GRAPH`/`C-SEC` from a node other than `C-API`.

### 4.5 Scope (`scope.json`, tab 2)

```jsonc
{ "scope": {
  "title": "Qué incluye esta primera versión", "intro": "…",
  "filters": [ { "id": "all", "label": "Todo" }, { "id": "included", "label": "Incluido" }, { "id": "excluded", "label": "Fuera de alcance" }, { "id": "future", "label": "Futuro" }, { "id": "undecided", "label": "Por definir" } ],
  "coverageLabels": { "interactive": "Interactivo en esta demo", "illustrated": "Ilustrado", "not-demonstrated": "No demostrado" },
  "dispositionLabels": { "included": "Incluido", "excluded": "Fuera de alcance", "future": "Futuro", "undecided": "Por definir" },
  "items": [ { "id": "SC-01", "title": "Organización conectada", "description": "…", "disposition": "included",
               "coverage": "interactive", "dependency": "Datos de Próspera", "target": { "tab": "web", "web": { "level": "strategic", "representation": "orgchart" } } | null,
               "acceptance": "…", "sourceIds": ["S-PROP"], "detail": "…optional long text (SC-20)…" } ],
  "deliverables": { "title": "Entregables del proyecto", "items": ["…"] },
  "clientContributions": { "title": "Lo que aporta Próspera", "items": ["…"] },
  "empty": { "text": "No hay elementos con este filtro", "action": "Mostrar todo" },
  "viewInDemo": "Ver en la demo"
} }
```
Targets use the navigation target format of §7.5.

### 4.6 Methodologies (`methodologies.json`, tab 3)

```jsonc
{ "methodologies": {
  "title": "…", "intro": "…",
  "groups": [ { "id": "applied", "label": "Aplicadas en la demostración" }, { "id": "reference", "label": "Referencias para el diseño" }, { "id": "excluded", "label": "No incluidas en esta versión" } ],
  "items": [ { "id": "MET-BPM", "name": "Gestión por procesos", "group": "applied", "statusLabel": "aplicada",
               "question": "¿Qué trabajo atraviesa varias áreas?", "usage": "Relacionamos…", "scopeItemIds": ["SC-01"],
               "evidence": "…", "limit": "…", "sourceIds": ["S-PROP"],
               "example": { "label": "Ver ejemplo", "target": { "tab": "web", "web": {…} } } | null,
               "externalReference": { "label": "Especificación OMG BPMN 2.0.2", "url": "https://www.omg.org/spec/BPMN/2.0.2" } | null } ],
  "footer": ["La arquitectura se explica con un mapa de aplicaciones y almacenes de información", "…"]
} }
```

### 4.7 Organization graph (`organization.json` + `case.json`)

```jsonc
{ "organization": {
  "entities": [ {
      "id": "A-AF", "type": "area", "name": "Administración y Finanzas", "description": "…",
      "parentId": "ORG-01",            // optional; hierarchy only (org > area). No other parent links.
      "areaId": "A-AF",                // positions and people carry their area; activities carry versionId/laneId
      "attributes": { },               // type-specific, see table below
      "provenance": { "sourceIds": ["S-ORG"], "confidence": "confirmed", "observedAt": null, "dataState": "known" },
      "isDemo": false,
      "labels": ["Fuente del cliente"] // provenance label(s) to show as badges; from the exact spec vocabulary
  } ],
  "relations": [ { "id": "R-0001", "type": "perteneceA", "from": "J-02", "to": "A-AF",
                   "provenance": {…}, "label": null, "inferred": false } ],
  "flows": { "FLOW-ASIS": {…}, "FLOW-TOBE1": {…}, "FLOW-TOBE2": {…} },
  "versions": [ {…} ],
  "views": {…}
} }
```

Entity `type` ∈ `organization | area | macroprocess | process | activity | role | position |
person | externalProvider | externalActor | system | document | policy | objective |
indicator | gap | incident | project | version`. (`incident`, `project`, `version` records
live in `tracking`/`versions`, not in `entities`; the type names are reserved for the
inspector registry.) Type display labels and icons live in the renderer registry
(`core/pack.js` → `ENTITY_TYPES`), not in the pack.

Type-specific `attributes`:

| type | attributes |
| --- | --- |
| organization | `mission`, `vision` (null → "No proporcionadas para esta demo"), `note` |
| area | `supportLabel` ("Soporte transversal" for A-LEG, else null) |
| position | `areaId` at top level; `collective: true` for J-08; `external: true` for J-X*; `occupancyNote`: "Ocupante según organigrama de septiembre de 2026" |
| person / externalProvider / externalActor | `kind`: `internal | externalPerson | externalOrganization | externalActor` |
| macroprocess | `proposed: true`, `kind: "support"` |
| process | `portfolio: true` for PR-01…10; `detailed: true` for PR-BOLETAS; `start`, `end`, `note`, `variants[]` (`{id, label, note}`), `participantsText`, `timeText` (null), `extraText` (PR-08), `sheetText` (common ficha text for portfolio processes) |
| activity | `versionId`, `key` (= id for base versions), `laneId`, `nodeKind: "task"`, `instruction`, `whatToDo`, `control`, `output`, `time` (null), `sourceNodeIds` `{ "separacion": ["E03"], "cuotaInicial": ["E20"] }` or `["E12","E13","E11"]`, `roleIds[]`, `systemIds[]`, `documentIds` `{ "requires": [], "produces": [] }`, `variantNotes` `{ "cuotaInicial": "…" }`, `documentsByVariant` (optional), `subtasks[]` for T-06/T-08 `{ "id": "T-06a", "name", "roleId", "instruction" }`, `multiRole: true` |
| role | `laneLabel` (literal from the diagram, e.g. "ASISTENTE ADMINISTRATIVO"), `positionIds[]`, `mappingNote` ("Correspondencia por validar") |
| system | `status`: `current | proposed | unknown`, `statusLabel` (exact spec text), `connected: false` |
| document | `text` (ficha text), `hasFile: false`, `contentRef` (`"POL-01"` for the policy) |
| policy | `date`, `dateLabel`, `signature`, `signatureNote`, `body[]` (paragraphs), `commitments[]` |
| objective | `proposed: true`, `label: "Propuesto · por validar"` |
| indicator | `formula`, `value: null`, `numerator: null`, `denominator: null`, `target: null`, `measuredAt: null`, `targetLabel: "Meta por definir"` |
| gap | `severity: null`, `cost: null`, `frequency: null`, `noteText` |

Relation `type` ∈ `parteDe | perteneceA | ocupa | prestaServicioComo | desempeña |
agrupadoEn | tieneDueñoÁrea | participaEn | ejecuta | usa | requiere | produce |
contribuyeA | mide | orienta | afecta | proponeVersión | gerenciaGeneral`. Direction is
always `from → to` as written in spec §9.1 (e.g. `J-02 perteneceA A-AF`, `P-02 ocupa J-02`,
`PR-BOLETAS tieneDueñoÁrea A-AF`, `A-COM participaEn PR-BOLETAS`, `RL-ADMIN ejecuta A-03`,
`A-03 usa SYS-DRIVE`, `PR-BOLETAS contribuyeA OBJ-01`, `KPI-01 mide OBJ-01`, `POL-01 orienta
PR-BOLETAS`, `GAP-01 afecta PR-BOLETAS`). `gerenciaGeneral` is the single visual relation
`J-01 → ORG-01` ("Gerencia General"). No `parteDe` between activity and process is stored
as a relation; activity membership is `attributes.versionId` + the flow. `inferred: true`
relations render with badge "Relación propuesta". Activities use `ejecuta/usa/requiere/produce`
relations only for the **base** versions' activity entities (`A-*` for V-ASIS-01, `T-*` for
V-TOBE-02); derived versions resolve through snapshots (§5.3).

Flows:

```jsonc
"FLOW-ASIS": {
  "id": "FLOW-ASIS", "processId": "PR-BOLETAS", "title": "Así está documentado el proceso", "subtitle": "AS-IS · Resumen navegable",
  "lanes": [ { "id": "L-VENTAS", "label": "Ventas", "roleId": "RL-VENTAS" }, { "id": "L-ADMIN", "label": "Administración", "roleId": "RL-ADMIN" }, { "id": "L-CONT", "label": "Contabilidad", "roleId": "RL-CONT" } ],
  "externalActor": { "entityId": "ACTOR-CLIENTE", "label": "Cliente", "exchanges": [ { "nodeId": "A-01", "direction": "in", "label": "Comprobante y datos del bien" }, { "nodeId": "A-08", "direction": "out", "label": "Boleta" } ] },
  "variants": [ { "id": "separacion", "label": "Separación (inicial)", "available": true },
                { "id": "cuotaInicial", "label": "Cuota inicial", "available": true },
                { "id": "cuotaNormal", "label": "Cuota normal / complementaria", "available": false, "message": "El AS-IS no proporciona detalle suficiente para esta variante. Consulta el TO-BE propuesto" } ],
  "defaultVariant": "separacion",
  "nodes": [ { "id": "A-START", "kind": "start", "label": "Pago y documentación recibidos", "laneId": "L-VENTAS" },
             { "id": "A-01", "kind": "task", "laneId": "L-VENTAS" },            // task nodes reference the activity entity with the same id/key
             { "id": "A-G1", "kind": "decision", "label": "¿Solicitud conforme?", "laneId": "L-ADMIN", "sourceNodeIds": {…} },
             { "id": "A-END", "kind": "end", "label": "Boleta enviada", "laneId": "L-VENTAS" } ],
  "edges": [ { "id": "F-ASIS-01", "from": "A-START", "to": "A-01" }, { "id": "F-ASIS-06", "from": "A-G1", "to": "A-06", "label": "Sí" }, { "id": "F-ASIS-10", "from": "A-G1", "to": "A-05", "label": "No", "loop": true }, { "id": "F-ASIS-11", "from": "A-05", "to": "A-03", "loop": true } ],
  "legend": ["Secuencia resumida", "…"],
  "context": [ { "title": "Antes del pago: elección del bien", "text": "Detalle fuera del recorrido principal; disponible como referencia del modelo entregado" }, "…" ],
  "notes": ["En cuota inicial A-03 agrupa dos verificaciones paralelas del original…"],
  "groups": [ { "id": "T-06", "subtaskIds": ["T-06a", "T-06b"] } ]   // FLOW-TOBE2 only
}
```
`FLOW-TOBE1` has `incomplete: true`, `message`, `items: ["Tarea 1", "Tarea 2", "Subprocesos sin detalle"]`
and no navigable nodes. `FLOW-TOBE2` carries `systemChip: { "betweenNodeIds": ["T-04","T-05"], "systemId": "SYS-SPERANT", "label": "Cambio de estado propuesto" }`
and `documentsByVariant` (spec §16.2) with `namingStandard[]`, `controls[]` and the variant notes.

Versions:

```jsonc
{ "id": "V-ASIS-01", "processId": "PR-BOLETAS", "type": "AS-IS", "label": "AS-IS documentado",
  "state": "documented" | "incomplete-draft" | "proposed" | "published-demo" | "adopted-demo",
  "stateLabel": "Documentado", "flowId": "FLOW-ASIS", "baseVersionId": null,
  "publishedAt": null, "publishedBy": null, "summary": "Proceso actual entregado",
  "changeLabel": "Proceso actual entregado", "sourceIds": ["S-ASIS", "S-CASE"],
  "publishable": false, "isDemo": false, "pending": [], "notes": [], "activityOverrides": {} }
```
`state` is the machine value; `stateLabel` is the visible text. V-TOBE-03 and V-ASIS-02 are
not in the pack; `core/versions` creates them with the spec texts, which live in
`scenarios.json` under the scenario's `outcome` (§4.11). `organization.currentAsIsVersionId`
= `"V-ASIS-01"`.

Views:

```jsonc
"views": {
  "levels": ["strategic", "tactical", "operational"],
  "representations": ["orgchart", "processmap", "relations"],
  "depths": ["areas", "positions", "people"],
  "defaultContext": { "level": "strategic", "representation": "orgchart", "rootId": "ORG-01", "depth": "positions" },
  "defaultProcessId": "PR-BOLETAS",
  "processViews": ["sheet", "flow", "compare", "incidents", "projects"],
  "map": { "bands": [ { "id": "objective", "label": "Objetivo propuesto", "entityIds": ["OBJ-01"] },
                      { "id": "direction", "label": "Dirección", "message": "No se proporcionó un mapa de procesos estratégicos" },
                      { "id": "business", "label": "Procesos del negocio proporcionados", "entityIds": ["PR-01", "…"], "subtitle": "Cadena de valor" },
                      { "id": "support", "label": "Soporte", "entityIds": ["MP-AF", "PR-BOLETAS"] },
                      { "id": "people", "label": "Personas y roles del caso", "entityIds": ["RL-VENTAS","RL-ADMIN","RL-CONT"] },
                      { "id": "systems", "label": "Sistemas del caso", "entityIds": ["SYS-WA","SYS-DRIVE","SYS-MAIL","SYS-SPERANT","SYS-FACT"] } ],
           "capabilitiesNote": "No se proporcionó un catálogo de capacidades",
           "counts": { "detailed": "1 proceso con detalle", "summary": "10 procesos con resumen" } },
  "orgchart": { "legend": "Agrupado por área; las líneas entre puestos no representan dependencias de mando", "note": "Datos del organigrama de septiembre de 2026. El detalle de procesos se limita al caso de boletas", "externalLabel": "Servicio externo" },
  "layers": [ { "id": "people", "label": "Personas y roles" }, { "id": "systems", "label": "Sistemas" }, { "id": "documents", "label": "Documentos" } ],
  "sipoc": { "label": "Síntesis de las fuentes para esta demo", "rows": [ { "suppliers": "…", "inputs": "…", "process": "…", "outputs": "…", "customers": "…" } ] },
  "raci": { "note": "Asignación por actividad pendiente de validación", "missing": "— No proporcionado" },
  "compare": { "columns": ["AS-IS documentado", "TO-BE propuesto"], "rows": [ { "label": "Documentos", "asIs": "…", "toBe": "…" } ], "footer": "El TO-BE conserva tareas humanas…" },
  "history": { "columns": ["Versión","Tipo","Estado","Fecha de publicación","Responsable","Cambio","Fuente"], "initialReference": "Referencia inicial", "notProvided": "No proporcionados", "processNote": "Los modelos entregados no incluyen constancia de publicación o aprobación interna", "activityNote": "…ocho actividades son resúmenes…" },
  "instruction": { "sections": ["Qué hacer","Quién interviene","Información necesaria","Herramientas","Control","Resultado esperado","Tiempo","Fuentes","Trabajo relacionado"], "disclaimer": "Guía resumida a partir del diagrama; no sustituye un procedimiento aprobado" },
  "areaSpace": { "sections": ["Resumen del área","Puestos","Procesos documentados","Situaciones observadas","Incidencias y proyectos"], "noDetail": "No hay un proceso detallado vinculado a esta área en la demo", "processCard": { "owner": "Dueño documentado: Administración y Finanzas", "status": "AS-IS documentado · aprobación interna no acreditada en las fuentes" } }
}
```

### 4.8 Tracking and accounts (`tracking.json`)

```jsonc
{ "tracking": {
    "incidentsTitle": "Incidencias de emisión de boletas", "badge": "Registros ficticios para demostrar seguimiento", "dateLabel": "Fecha de la demo: 06/10/2026",
    "incidentFilters": [ {"id":"all","label":"Todas"}, {"id":"open","label":"Abiertas"}, {"id":"closed","label":"Cerradas"}, {"id":"overdue","label":"Vencidas"}, {"id":"dueSoon","label":"Por vencer"} ],
    "incidentStatusLabels": { "open": "Abierta", "inProgress": "En atención", "closed": "Cerrada" },
    "noticeLabels": { "overdue": "Vencido", "dueSoon": "Por vencer", "onTime": "En plazo", "closed": "Cerrada" },
    "responsibleOptions": ["RL-VENTAS","RL-ADMIN","RL-CONT","A-AF"],
    "incidents": [ { "id": "INC-DEMO-01", "subject": "Expediente sin convenio firmado", "description": "…", "processId": "PR-BOLETAS",
                     "responsibleId": "RL-VENTAS", "status": "open", "createdAt": "2026-10-01", "dueDate": "2026-10-04", "closedAt": null, "resolution": null, "isDemo": true, "sourceIds": ["S-DEMO"], "gapIds": ["GAP-01"] } ],
    "projectsTitle": "Proyectos de mejora", "projectStatusLabels": { "planned": "Planificado", "inProgress": "En curso", "concluded": "Concluido" },
    "projectResponsibleOptions": ["A-AF","RL-ADMIN","RL-VENTAS"],
    "projects": [ { "id": "PM-01", "name": "…", "objective": "…", "processId": "PR-BOLETAS", "gapIds": ["GAP-01","GAP-02","GAP-03","GAP-04"],
                    "responsibleId": "A-AF", "responsibleNote": "asignación ficticia de demo", "startDate": "2026-10-01", "dueDate": "2026-10-15",
                    "status": "inProgress", "targetVersionId": "V-TOBE-02", "backingReference": null, "result": null, "isDemo": true, "note": "Proyecto ficticio basado en el tema de mejora del caso",
                    "commitments": [ { "label": "Revisar requisitos documentales", "status": "Pendiente" }, "…" ], "followUp": [] } ],
    "texts": { "closeHint": "Concluye el proyecto y registra el respaldo interno antes de publicar", "closeConfirm": "Registro de cierre ficticio para esta demo", "simulateClose": "Simular cierre y preparar nuevo AS-IS", "prepareAsIs": "Preparar nuevo AS-IS", "…": "…" }
  },
  "security": {
    "title": "Administración de acceso · simulada", "intro": "…", "note": "Estas cuentas ilustran la administración. Usa el selector de perfiles para explorar las vistas.",
    "credentialNote": "En el sistema real, el administrador establecerá las credenciales. Aquí solo se simulan los permisos",
    "deleteConfirm": "¿Eliminar este usuario de prueba? La bitácora de esta sesión se conservará",
    "restricted": "Esta vista requiere un perfil administrador",
    "auditEmpty": "No hay acciones registradas en esta sesión",
    "accounts": [ { "id": "ACCOUNT-01", "username": "demo.analista", "role": "admin", "positionId": "J-05", "status": "active", "isTest": true } ]
  } }
```

### 4.9 Desktop (`desktop.json`)

```jsonc
{ "desktop": {
  "title": "Estudio del analista", "intro": "…", "disclaimer": "Claude Code · Simulado. Esta demostración no ejecuta IA ni accede a tus archivos",
  "chips": { "client": "Próspera" },
  "modes": [ { "id": "chat", "label": "Conversación" }, { "id": "ops", "label": "Operaciones" } ],
  "composer": { "label": "Solicitud del analista", "placeholder": "Elige un escenario o escribe una nota", "submit": "Enviar" },
  "unsupported": "Esta demo tiene respuestas preparadas. Elige “Revisar propuesta de boletas” o “Preparar nuevo AS-IS”. Tu texto se conserva como borrador",
  "readOnlyMessage": "Para preparar y publicar cambios en esta demostración, usa el perfil de analista",
  "footer": { "sessionOnly": "Cambios solo en esta sesión", "pendingReview": "Revisión pendiente del analista" },
  "operationsColumns": ["Secuencia","Operación","Estado","Fuente"],
  "workspaces": [ { "id": "WS-BOLETAS", "label": "Emisión de boletas", "sessionId": "SES-BOLETAS", "statusLabel": "Listo para revisar", "processId": "PR-BOLETAS",
                    "evidenceIds": ["EV-CASE","EV-ASIS","EV-TOBE1","EV-TOBE2","EV-ORG"], "scenarioIds": ["SCN-01","SCN-02"], "chips": ["Próspera","Emisión de boletas","5 fuentes disponibles","TO-BE 2 · Propuesto"] },
                  { "id": "WS-ORG", "label": "Estructura organizacional", "sessionId": "SES-ORG", "statusLabel": "Consulta de evidencia", "processId": null,
                    "evidenceIds": ["EV-ORG","EV-POL"], "scenarioIds": [], "welcome": "…", "welcomeActions": [ { "label": "Ver organigrama", "target": {…} }, { "label": "Ver política", "target": {…} } ] } ],
  "sessions": [ { "id": "SES-BOLETAS", "workspaceId": "WS-BOLETAS" }, { "id": "SES-ORG", "workspaceId": "WS-ORG" } ],
  "evidencePicker": { "label": "Elegir evidencia de ejemplo" },
  "evidence": [ { "id": "EV-CASE", "sourceId": "S-CASE", "label": "Caso de mejora de emisión de boletas", "summary": ["…"], "entityIds": ["GAP-01"], "stateLabel": "Fuente del cliente", "restrictedTo": null | "TO-BE" } ]
} }
```
Evidence with `restrictedTo: "TO-BE"` (EV-TOBE1/EV-TOBE2) is hidden from profiles that
cannot see TO-BE versions.

### 4.10 Scenarios (`scenarios.json`)

```jsonc
{ "scenarios": [ {
  "id": "SCN-01", "title": "Revisar y precisar la propuesta", "sessionId": "SES-BOLETAS", "workspaceId": "WS-BOLETAS",
  "trigger": { "label": "Revisar propuesta de boletas", "prompt": "Revisa el AS-IS y el TO-BE de boletas y prepara una mejora documental con sus fuentes" },
  "preconditions": [ { "check": "profileRole", "value": "admin" }, { "check": "versionExists", "value": "V-TOBE-02" }, { "check": "versionAbsent", "value": "V-TOBE-03", "message": "Este escenario ya se aplicó. Consulta el resultado o reinicia la demo" }, { "check": "noPendingReview" } ],
  "steps": [ ["SCN-01-E01","SCN-01-E02"], ["SCN-01-E03","SCN-01-E04"], ["SCN-01-E05"], ["SCN-01-E06","SCN-01-E07"], ["SCN-01-E08","SCN-01-E09"], ["SCN-01-E10"] ],
  "events": [
    { "id": "SCN-01-E01", "sequence": 1, "kind": "analyst-message", "text": "…prompt…" },
    { "id": "SCN-01-E02", "sequence": 2, "kind": "assistant-message", "text": "…" },
    { "id": "SCN-01-E03", "sequence": 3, "kind": "tool-start", "callId": "C-READ", "operation": "READ_EVIDENCE", "label": "Revisar fuentes del proceso", "statusLabel": "En curso", "evidenceIds": ["EV-CASE","EV-ASIS","EV-TOBE1","EV-TOBE2","EV-ORG"] },
    { "id": "SCN-01-E04", "sequence": 4, "kind": "tool-result", "callId": "C-READ", "operation": "READ_EVIDENCE", "text": "…", "statusLabel": "Completado", "delayMs": 700 },
    { "id": "SCN-01-E05", "sequence": 5, "kind": "assistant-message", "text": "…", "links": ["GAP-01","GAP-02","GAP-03","GAP-04","T-02"] },
    { "id": "SCN-01-E06", "sequence": 6, "kind": "tool-start", "callId": "C-CHECK", "operation": "CHECK_MODEL", "label": "Comprobar consistencia y pendientes", "statusLabel": "En curso" },
    { "id": "SCN-01-E07", "sequence": 7, "kind": "tool-result", "callId": "C-CHECK", "operation": "CHECK_MODEL", "text": "…", "pending": ["…"], "delayMs": 700 },
    { "id": "SCN-01-E08", "sequence": 8, "kind": "assistant-message", "text": "…" },
    { "id": "SCN-01-E09", "sequence": 9, "kind": "artifact-proposal", "operation": "STAGE_VERSION", "title": "Propuesta de actualización documental · TO-BE 3", "stagesVersionId": "V-TOBE-03" },
    { "id": "SCN-01-E10", "sequence": 10, "kind": "approval-request", "requestId": "R-01", "text": "…" },
    { "id": "SCN-01-E11", "sequence": 11, "kind": "approval-result", "requestId": "R-01", "operation": "PUBLISH_DEMO_VERSION" },
    { "id": "SCN-01-E12", "sequence": 12, "kind": "completed", "text": "TO-BE 3 publicado en la demo…", "cta": { "label": "Ver TO-BE 3 en el prototipo web", "target": {…} } }
  ],
  "errorModes": [
    { "id": "read-failure", "label": "Simular fallo de lectura", "replacesEventId": "SCN-01-E04", "text": "No se pudo completar la lectura simulada. Las fuentes permanecen disponibles" },
    { "id": "invalid-reference", "label": "Simular referencia no válida", "replacesEventId": "SCN-01-E07", "text": "La propuesta contiene una referencia no válida y no puede publicarse" } ],
  "review": {
    "requestId": "R-01", "title": "…", "responsibleLabel": "Analista de Calidad", "scopeLabel": "Nueva versión TO-BE; no cambia el AS-IS",
    "instructionField": { "label": "Instrucción propuesta", "min": 20, "max": 600, "restore": "Restaurar texto propuesto" },
    "noteField": { "label": "Nota de revisión", "min": 0, "max": 300 },
    "reasonField": { "label": "Motivo del rechazo", "min": 5, "max": 300 },
    "actions": { "approve": "Publicar en la demo", "reject": "Rechazar con motivo", "cancel": "Cancelar revisión" },
    "messages": { "approved": "Versión TO-BE 3 creada en esta sesión", "rejected": "Propuesta rechazada. No se modificó el modelo", "canceled": "Revisión cancelada. La propuesta sigue disponible sin publicar" } },
  "diff": { "versionId": "V-TOBE-03", "baseVersionId": "V-TOBE-02", "activityKey": "T-02",
            "before": "…§10.4 T-02 instruction…", "after": "Comparar los documentos recibidos…",
            "versionNote": "La denominación de cuota normal/complementaria, la automatización de SPERANT y la emisión por variante requieren validación",
            "pending": ["Confirmar cuota normal o complementaria","Validar automatización de SPERANT","Confirmar emisión por variante de pago"],
            "sourceIds": ["S-TOBE2","S-CASE"], "confidence": "inferred", "dataState": "proposed" },
  "outcome": { "version": { "id": "V-TOBE-03", "type": "TO-BE", "label": "TO-BE 3 · publicado en la demo", "state": "published-demo", "stateLabel": "Publicado en la demo", "summary": "Instrucción de revisión documental precisada", "changeLabel": "Instrucción de revisión documental precisada", "publishedBy": "Analista de Calidad · perfil de demo" },
               "projectUpdates": [ { "projectId": "PM-01", "set": { "targetVersionId": "V-TOBE-03" } } ],
               "logAction": "Publicación de versión de demo" },
  "artifact": { "title": "proceso-boletas.yml · representación de ejemplo", "stateBefore": "propuesta-en-demo", "stateAfter": "publicada-en-demo" }
}, { "id": "SCN-02", "…": "form-request event, review R-02, outcome V-ASIS-02 + PM-01 concluded + currentAsIs pointer" } ] }
```

Event kinds: `analyst-message | assistant-message | tool-start | tool-result |
artifact-proposal | approval-request | approval-result | form-request | error | completed`.
SCN-02 uses `form-request` (`SCN-02-E03`) with `fields` (`result`, `backingReference`,
`confirmation` checkbox), a `tool-result` (`SCN-02-E04`) whose `diff` is computed by
`core/versions.describePromotion()`, `approval-request` R-02 (`SCN-02-E05`) and
`completed` (`SCN-02-E06`). The scenario file carries every exact text from spec §10.5.

### 4.11 Validator rules (summary; `schemas/pack-validator.js` returns `{ok, errors[]}`)

Unique ids; every reference (`parentId`, `areaId`, relation endpoints, `roleIds`,
`systemIds`, `documentIds`, `positionIds`, `entityIds`, `sourceIds`, `scopeItemIds`,
`targetVersionId`, `baseVersionId`, `flowId`, `processId`, `sessionId`, `workspaceId`,
`evidenceIds`, `scenarioIds`, flow node/edge endpoints, `subtaskIds`, `replacesEventId`,
navigation targets' ids) resolves; enum values valid; `parentId` graph acyclic; flow
edges only between nodes of the same flow and loops only where `loop: true`; every flow
task node has an activity entity with that id and `versionId` of a version using that
flow; exactly five tabs in the fixed order; exactly three levels; profiles' ids and
`initialProfileId` exist; `accessRole` ∈ admin/manager/employee; scope `disposition`/
`coverage` enums; method `group` ∈ groups; event ids unique and `sequence` strictly
increasing per scenario; tool-start/result paired by `callId`; `operation` ∈
`READ_EVIDENCE | CHECK_MODEL | STAGE_VERSION | PUBLISH_DEMO_VERSION`; `schemaVersion === 1`;
no string anywhere contains `/home/`, `C:\\`, `file://`, `http://` (https only inside
`externalReference.url`), `<script`, `javascript:`; no second `client.id`.

## 5. Core APIs

### 5.1 `core/dom`

```js
h(tag, attrs?, ...children)      // attrs: class|className, id, type, value, disabled, hidden, tabindex, title, role,
                                 // 'aria-*', 'data-*', dataset:{}, style:{} (geometry only), on:{click,keydown,...}, for, name, placeholder, maxlength, min, max, lang, ...
                                 // children: string|number (→ text node) | Node | null/false/undefined (skipped) | Array
svg(tag, attrs?, ...children)    // SVG namespace
text(value)                      // text node; null/undefined → ''
clear(el)                        // remove children
replace(el, ...children)         // clear + append
setText(el, value)
preserveFocus(container, renderFn)   // remembers document.activeElement's data-focus-key (or id) inside container, runs renderFn, restores focus
preserveScroll(el, renderFn)
focusFirst(el)                   // first focusable descendant
focusables(el)                   // list
announce(text)                   // writes to the polite live region (#primus-live); dedupes identical consecutive text
trapFocus(dialogEl) → release()  // Tab/Shift+Tab cycle; returns release function
onKey(el, map)                   // {Escape: fn, Enter: fn, ' ': fn, ArrowLeft: fn, ...} with event
```

### 5.2 `core/format`

```js
createFormat(pack) → {
  missing()                       // MSG-16 text
  msg(id, params?)                // message text; returns {text, action} when the message is an object (text interpolated)
  date(iso)                       // '2026-10-04' → '04/10/2026'; null → missing()
  dateTime(iso)                   // '06/10/2026 10:00:03'
  nullable(value)                 // value ?? missing()
  normalize(text)                 // lowercase, strip diacritics (NFD), trim, collapse spaces
  plural(n, one, many)            // '1 proceso', '10 procesos'
  interpolate(template, params)   // '{n} resultados'
  compare(a, b)                   // es-PE Intl.Collator compare, nulls last
  compareDates(a, b)              // ISO compare, nulls last
}
```

### 5.3 `core/pack`

```js
mergePackFiles(objects[]) → packObject                 // merge rule of §2
resolvePack(packObject) → pack  (frozen) with indexes:
  pack.raw                                             // the merged object
  pack.entities: Map(id → entity)                      // includes activity entities
  pack.relations: Map(id → relation)
  pack.relationsFrom: Map(entityId → relation[]), pack.relationsTo
  pack.byType: Map(type → entity[])                    // insertion order preserved
  pack.sources: Map(id → source)
  pack.flows: Map(id → flow), pack.versions: Map(id → version) (pack versions only)
  pack.baseActivities(versionId) → { key → activity }  // activities whose attributes.versionId === versionId
  pack.profiles: Map(id → profile), pack.scenarios: Map, pack.workspaces: Map, pack.sessions: Map, pack.evidence: Map
  pack.messages, pack.ui (presentation.ui), pack.texts (presentation), pack.views
ENTITY_TYPES: { area: { label: 'Área', plural: 'Áreas', icon: 'area' }, ... }   // Spanish labels for all 19 types + 'decision', 'event'
typeLabel(type), typeIcon(type)
```

### 5.4 `core/graph`

All functions take `(pack, state?)` implicitly via `createGraph(pack)`; results are plain
objects/arrays of ids or entities; never DOM. Visibility filtering is **not** done here
(permissions wraps it), except where noted.

```js
createGraph(pack) → {
  entity(id), has(id), type(id)
  related(id, {types?}) → [{ relation, entity, direction: 'out'|'in', label }]   // label = Spanish relation phrase, e.g. 'pertenece a'
  children(id)                       // by parentId
  areas()                            // ordered as pack
  areaPositions(areaId) → position[] (pack order), positionOccupants(positionId) → person/external[], personPosition(personId)
  positionRoles(positionId) → role[], rolePositions(roleId) → position[]
  roleActivities(roleId, versionId) → activity[]   // resolved for the version
  areaProcesses(areaId) → { owned: process[], participating: process[] }
  processArea(processId), processVersions(processId) → version[] (pack order: V-ASIS-01, V-TOBE-01, V-TOBE-02)
  flowForVersion(versionId, demoVersions?) → flow                                  // via version.flowId (demo versions resolved through store.getVersion)
  resolveActivity(version, key) → activity                                         // version object from store.getVersion(); applies snapshot
  activityResources(activity) → { roles: role[], systems: system[], documents: {requires, produces} }
  sipoc(processId) → rows (from views.sipoc)
  raci(processId, version) → { columns: role[], rows: [{ activity, cells: {roleId: 'R' | null} }], note }
  objectiveTraversal(objectiveId) → { entityIds: string[], relationIds: string[] }   // objective ← contribuyeA ← process ← (ejecuta) activities of currentAsIs → roles/positions; activities → usa → systems
  areaTraversal(areaId) → { entityIds, relationIds, neighbors: string[] }
  connections(entityId, { versionId? }) → { entityIds, relationIds, groups: [{ label, entities }] }   // generic policy per type
  history(entityId, demoState) → row[]  // {versionId|null, typeLabel, stateLabel, publishedAt, publishedBy, change, sourceLabel, isDemo}
  search(query, { entityIds: Set|null, types?: string[], includeVersions?: boolean, versions?: version[] }) → [{ entity|version, score, matchedOn }]
  counts(entityIds: Set|null) → { areas, positions, people, externals, processesDetailed, processesSummary }
  documentsByVariant(flowId) → from flow
}
```

### 5.5 `core/permissions`

```js
createPermissions(pack) → {
  profile(state) → profile
  role(state) → 'admin'|'manager'|'employee'
  isOwner(state, processId)
  visibleEntityIds(state) → Set<string> | null      // null = everything visible
  isVisible(state, entityId) → boolean
  visibleVersionIds(state) → Set<string>            // computed from profile.visibility.versionTypes over pack + demo versions
  canSeeVersion(state, versionId)
  can(state, action, ctx?) → { ok: true } | { ok: false, messageId: 'MSG-02'|'MSG-03', text, action, cta: { label, command } }
    // actions: 'viewAll' | 'viewEntity'(ctx.entityId) | 'viewVersion'(ctx.versionId) | 'maintainModel' | 'publish'
    //          | 'trackProcess'(ctx.processId) | 'manageAccounts' | 'viewAudit' | 'viewSecurity' | 'viewDraftsToBe'
  adjustContext(state) → state.web patch | null     // when current web context is no longer visible: returns the PR-BOLETAS AS-IS context + notice
}
```
Matrix (spec §5.2): admin → everything; manager → read all, no writes; employee consult →
listed set only; employee owner → listed set + TO-BE + tracking writes for PR-BOLETAS. No
profile can "approve as Sponsor". Permission checks are executed inside commands (never
only in the UI).

### 5.6 `core/store`

```js
createStore({ pack, timers? }) → store
store.pack, store.graph, store.permissions, store.format     // created inside createStore
store.getState() → state (treat as read-only)
store.dispatch(type, payload?) → { ok: true, result? } | { ok: false, error: { code, message, field?, messageId? } }
   // unknown type → ok:false code 'unknown-command'; a throwing command restores the pre-dispatch snapshot (no partial mutation)
store.subscribe(listener(state, info: { type, changed: string[] })) → unsubscribe   // called once per successful dispatch, after commit
store.select(name, ...args)        // registered selectors (see 5.7)
store.now() → ISO string at the logical clock; store.tick() advances 1 s and returns ISO (commands call tick when they log)
store.getVersion(versionId, state = store.getState()) → version (pack or demo-created, with resolved `activities` snapshot) | undefined
store.allVersions(processId) → version[] ordered: pack order then demo versions by creation
store.timers: { set(fn, ms, tag) → id, clear(id), clearAll(tag?) , generation() }   // wraps setTimeout; reduced-motion → 0 ms; every timer bound to the current generation; reset bumps generation so stale callbacks no-op
store.reset()                      // = dispatch('resetDemo', {force:true})
```

Initial state (built by `createInitialState(pack)` in `core/store`):

```js
{
  app: { activeTab: 'architecture', profileId: 'U-MANAGER', aboutOpen: false, modal: null,
         toasts: [], notices: [], focusReturn: null, architectureSelection: null, architectureListMode: false,
         scopeFilter: 'all', scopeSelection: null, methodSelection: null, scroll: {} },
  web: { module: 'twin',                           // 'twin' | 'security'
         level: 'strategic', representation: 'orgchart', depth: 'positions',
         areaId: null, processId: null, processView: 'sheet', versionId: 'V-ASIS-01', compareVersionId: 'V-TOBE-02',
         paymentVariant: 'separacion', activityKey: null, relationsRootId: null,
         selection: null,                          // { entityId, versionId? , kind: 'entity'|'flowNode' }
         inspectorHistory: [],                     // selections
         highlightRootId: null, expanded: {},      // { [entityId]: true }
         layers: { people: true, systems: true, documents: true },
         search: { query: '', types: [], includeVersions: false, open: false },
         areaFilter: null, listMode: false,
         contextHistory: [],                       // context snapshots for Back (see 7.1)
         overlay: null,                            // { kind: 'history'|'document'|'policy'|'sources', entityId, versionId? }
         notice: null,                             // { text, action? } e.g. "La vista se ajustó al perfil seleccionado"
         newVersionNotice: null,                   // { versionId }
         security: { view: 'accounts' | 'audit', selectionId: null, form: null },
         incidents: { filter: 'all', query: '', sort: null, form: null, selectionId: null },
         projects: { selectionId: 'PM-01', form: null },
         tableSort: {} },
  camera: { },                                    // contextKey → { x, y, scale }  (contextKey from 7.3)
  desktop: { workspaceId: 'WS-BOLETAS', evidenceOpenId: null,
             sessions: { 'SES-BOLETAS': sessionState(), 'SES-ORG': sessionState() } },
  demo: { clock: 0, versions: {}, currentAsIsVersionId: 'V-ASIS-01', staging: {},
          incidents: [...pack], projects: [...pack], accounts: [...pack], log: [],
          counters: { incident: 4, project: 2, account: 4 },
          applied: {},                            // scenarioId → true
          requestIds: {},                         // effective requestId → true (idempotent publish)
          runOrdinals: {},                        // scenarioId → n
          generation: 1 }
}
sessionState() = { mode: 'chat', draft: '', events: [], playback: { status: 'idle', scenarioId: null, runOrdinal: 0, stepIndex: 0, pendingEventIds: [], errorMode: null, failedEventId: null },
                   review: null,                   // { requestId, scenarioId, runOrdinal, state: 'pending'|'approved'|'rejected'|'canceled', fields: { instruction, note, reason, result, backingReference, confirmation }, errors: {} }
                   expandedTools: {}, unread: 0, atLatest: true, form: null }
```

### 5.6b Command module signature

```js
Primus.module('core/commands/web', function (require) {
  return {
    commands: {
      // ctx = { state (mutable draft; mutate it directly), pack, graph, permissions, format, versions, scenarios,
      //         store (now(), tick(), timers, getVersion(id, state)), log(action, result), fail(code, message, extra?) }
      setLevel(ctx, payload) { if (!VALID.has(payload.level)) ctx.fail('invalid-level', 'Nivel no válido'); ctx.state.web.level = payload.level; return { level: payload.level }; }
    }
  };
});
```
`ctx.fail` throws a `CommandError` (`{ code, message, field?, messageId? }`); the store
catches it, discards the draft and returns `{ ok: false, error }`. `commands/index.js`
merges every module's `commands` object and throws on duplicate names. The store computes
`info.changed` by comparing a JSON snapshot of each top-level slice (`app`, `web`, `camera`,
`desktop`, `demo`) before and after the command.

### 5.7 Selectors (`core/selectors.js`, registered into the store)

Selectors are functions `(ctx, ...args)` with `ctx = { state, pack, graph, permissions,
format, store }`; `core/selectors` exports `{ selectors: { name: fn } }` and the store
exposes `store.select(name, ...args)`. Desktop selectors (`desktopModel`,
`scenarioAvailability`, `operationsRows`, `artifactPreview`) are implemented in
`core/scenarios.js` and re-exported by `core/selectors` through a lazy `require`.

`visibleIds`, `entityVisible(id)`, `profile`, `can(action, ctx)`, `currentContext`,
`breadcrumbs`, `inspectorModel` (selected entity's facts/relations/provenance/actions, filtered
by permission), `orgChartModel` (tree with expansion + counts), `processMapModel` (bands
with visible entities + highlight sets), `relationsModel`, `areaSpaceModel`, `processSheetModel`,
`flowModel(versionId, variant)`, `instructionModel(versionId, key)`, `compareModel`,
`historyModel(entityId, versionId)`, `incidentsModel` (filtered, sorted, notices computed
from `demo.businessDate`), `projectsModel`, `securityModel`, `searchResults`,
`desktopModel(sessionId)` (events, review, operations rows, artifact yaml string),
`scenarioAvailability(scenarioId)`, `hasUnsavedWork` (drafts, staging, pending review,
open forms with edits, demo records, created versions). Selector results are plain data
consumed by features; keep them pure and memoize only by `(state, args)` identity.

### 5.8 `core/versions`

```js
createVersions(store) → {
  describeStaging(scenario, fields) → { versionDraft, diffRows: [{ label, before, after }], artifactYaml }
  stageVersion(state, { scenarioId, instruction, note }) → staging entry (state.demo.staging['V-TOBE-03'])
  publishDemoVersion(state, { requestId, scenarioId, instruction, note, actorProfileId }) → version   // creates V-TOBE-03 snapshot once; updates PM-01.targetVersionId; idempotent by requestId
  describePromotion(state, { projectId, result, backingReference }) → diffRows
  promoteDemoVersion(state, { requestId, projectId, result, backingReference, actorProfileId }) → version // V-ASIS-02 + PM-01 concluded + currentAsIsVersionId, one commit
  artifactYaml(versionLike, { state }) → string   // exact format of spec §10.5, escaping quotes/newlines in YAML scalars
}
```
Snapshot shape: `version.activities = { key: activity }` fully resolved (clone of base
version's activities with the override applied), `version.flowId` inherited,
`version.baseVersionId`, `version.originVersionId` (V-ASIS-02 → V-TOBE-03),
`version.adoptionLabel` ("AS-IS de demostración · adopción simulada"), `version.pending`
inherited, `version.notes`.

### 5.9 `core/scenarios`

```js
createScenarioEngine(store) → {
  availability(state, scenarioId) → { ok, reasons: [{ text, cta? }] }
  start(state, { sessionId, scenarioId, errorMode? })       // validates preconditions, increments runOrdinal, emits step 0 events
  continueStep(state, { sessionId })                         // emits next logical step; schedules tool-result via store.timers when delayMs > 0
  stop(state, { sessionId })                                 // cancels timers → status 'stopped'; pending tool-result becomes the next step
  pause(state, { sessionId }) / resume                       // hidden tab → 'paused' (MSG-19)
  retry(state, { sessionId })                                // after 'failed': emits the real event that was replaced, clears errorMode
  restart(state, { sessionId })                              // discards staging/review/events of that session (after confirm in UI)
  submitForm(state, { sessionId, fields })                   // SCN-02 E03 → validates → emits E04 + E05
  resolveReview(state, { sessionId, decision, fields })      // approve|reject|cancel; approve → versions.publish/promote; emits approval-result + completed
  resumeReview(state, { sessionId })
  effectiveEventId(scenarioId, runOrdinal, eventId) → `${eventId}#${runOrdinal}`
  effectiveRequestId(scenarioId, runOrdinal, requestId)
  operationsRows(session) → [{ sequence, operation, statusLabel, sourceLabel, eventId }]
}
```
Emitted session events: `{ id: effectiveEventId, logicalId, sequence, kind, at: store.now(),
payload: {...event fields}, status: 'done'|'running'|'failed' }`. Dedupe by `id`. Submitting
the composer text that equals a trigger prompt (normalized) starts that scenario; other
text → unsupported message appended as an `assistant-message` with `payload.unsupported: true`
and the draft is kept.

## 6. Commands (type → payload → effects)

All commands validate the actor via `permissions.can` where the matrix requires it and
return `{ok:false, error}` instead of mutating when invalid. Logged commands append to
`state.demo.log` `{ seq, at: store.tick(), profileId, action, result }` (action labels in
Spanish, e.g. "Crear incidencia", "Publicar versión de demo", "Rechazar propuesta").

App (`commands/app.js`): `selectTab {tabId}`; `selectAccessProfile {profileId}` (applies
`permissions.adjustContext`, pauses playback for non-admin, sets `web.notice`); `useAnalystProfile {}`
(= selectAccessProfile U-ADMIN keeping desktop context); `openAbout`/`closeAbout`;
`openModal {modal}` / `closeModal`; `pushToast {text, tone}` / `dismissToast {id}`;
`requestReset {}` (opens confirm modal if `hasUnsavedWork` else resets) / `resetDemo {force}`
(bumps generation, clears timers, restores initial state, toast MSG-20); `navigateTo {target}`
(§7.5); `setScroll {tabId, top}`; `setArchitectureSelection {nodeId|null}`,
`setArchitectureListMode {on}`; `setScopeFilter {filterId}`, `selectScopeItem {id|null}`;
`selectMethod {id|null}`.

Web (`commands/web.js`): `setLevel {level}` (operational without process → opens process
selector state `web.processId=null` and the stage shows "Selecciona un proceso");
`setRepresentation {representation}`; `setDepth {depth}`; `toggleExpand {entityId}`,
`expandAll {}`, `collapseAll {}`; `enterArea {areaId}` (tactical; pushes context);
`enterProcess {processId, view?, versionId?}`; `setProcessView {view}`; `setVersion {versionId}`
(permission check; sets `web.notice` historicalReadOnly when not currentAsIs and type AS-IS);
`setPaymentVariant {variant}`; `openInstruction {versionId, key}` (pushes context);
`backToFlow {}`; `contextBack {}` (pops contextHistory; if empty → logical parent);
`backToOrganization {}`; `selectEntity {entityId, versionId?, kind?}` (opens inspector; pushes
inspector history when replacing a different selection via `followLink: true`);
`inspectorBack {}`; `closeInspector {}`; `setHighlightRoot {entityId|null}`; `setRelationsRoot {entityId}`;
`toggleLayer {layerId}`; `setSearch {query}`, `setSearchTypes {types}`, `setSearchIncludeVersions {on}`,
`clearSearch {}`; `setAreaFilter {areaId|null}`; `clearFilters {}`; `setListMode {on}`;
`setCamera {contextKey, x, y, scale}`, `zoomCamera {contextKey, delta}`, `fitCamera {contextKey}`,
`resetCamera {contextKey}`; `openOverlay {kind, entityId, versionId?}` / `closeOverlay {}`;
`dismissNotice {}`; `setTableSort {tableId, column, direction}`; `setSecurityView {view}`;
`setIncidentFilter {filterId}`, `setIncidentQuery {query}`, `selectIncident {id|null}`;
`selectProject {id|null}`; `openForm {formId, record?}` / `updateForm {formId, field, value}` /
`closeForm {formId, discard?}` (form state lives in `web.incidents.form`, `web.projects.form`,
`web.security.form` as `{ id, mode: 'create'|'edit'|'close', values, errors, dirty, recordId }`).

Tracking (`commands/tracking.js`): `createIncident {subject, description, responsibleId,
dueDate}` → `INC-DEMO-0N` (counter), status `open`, `createdAt` = businessDate, logs;
`updateIncident {id, subject?, description?, responsibleId?, dueDate?, status: 'open'|'inProgress'}`;
`closeIncident {id, resolution}`; `createProject {name, objective, responsibleId, dueDate,
targetVersionId}` → `PM-DEMO-0N` status `planned`; `startProject {id}`; `updateProject {id,
objective?, responsibleId?, dueDate?, status?: 'planned'|'inProgress'}`; `closeProject {id,
result, confirmed: true}` → `concluded`. Validation per spec (lengths, date `YYYY-MM-DD` valid
calendar date, required). Permission: `trackProcess`.

Security (`commands/security.js`): `createDemoUser {username, role, positionId|null}`,
`updateDemoUser {id, role, positionId|null}`, `deactivateDemoUser {id}`, `deleteDemoUser {id}`.
Rules: username `/^[a-z0-9._-]{3,40}$/` after trim/lowercase; duplicates case/space-insensitive
(MSG-07); employee requires position; never deactivate/delete the last active admin (MSG-08);
delete only `isTest` accounts; every action logged. Permission: `manageAccounts`.

Desktop (`commands/desktop.js`): `selectWorkspace {workspaceId}` (pauses the previous
session's playback); `setSessionMode {sessionId, mode}`; `setDraft {sessionId, text}`;
`submitDraft {sessionId}`; `startScenario {sessionId, scenarioId}`; `continueScenario {sessionId}`;
`stopScenario {sessionId}`; `pauseScenario {sessionId, reason}`; `retryScenario {sessionId}`;
`restartScenario {sessionId}`; `setErrorMode {sessionId, errorMode|null}`;
`toggleTool {sessionId, eventId}`; `setReviewField {sessionId, field, value}`;
`restoreReviewText {sessionId}`; `resolveReview {sessionId, decision}`; `resumeReview {sessionId}`;
`setScenarioFormField {sessionId, field, value}`; `submitScenarioForm {sessionId}`;
`openEvidence {evidenceId|null}`; `setAtLatest {sessionId, atLatest}`; `markRead {sessionId}`;
`deliverTimedEvent {sessionId, eventId, generation}` (internal; called by the timer callback and
ignored when generation/status no longer match).

## 7. Navigation model

### 7.1 Context snapshot (pushed to `web.contextHistory` on explicit context changes)

`{ module, level, representation, areaId, processId, processView, versionId, paymentVariant,
activityKey, depth, expanded, listMode, highlightRootId, areaFilter, cameraKey }`.
`enterArea`, `enterProcess`, `openInstruction`, `setLevel`, `setRepresentation` push the
previous snapshot. `contextBack` restores the top snapshot (camera comes back through
`cameraKey`). `backToOrganization` clears history and restores the default context, keeping
profile, search and layers. Selection and inspector history are **not** part of context
snapshots (inspector has its own history) but `closeInspector` happens on context change.

### 7.2 Breadcrumbs

`select('breadcrumbs')` → `[{ label: 'Próspera Grupo Inmobiliario', target }, { label: 'Administración y Finanzas', target }, { label: 'Emisión y envío de boletas', target }, { label: 'A-03 · Verificar abono y documentos', target: null }]`.
Each crumb dispatches `navigateTo` with its explicit target.

### 7.3 Camera keys

`orgchart`, `processmap`, `relations:<rootId>`, `area:<areaId>`, `flow:<versionId>:<variant>`.
Camera `{x, y, scale}`; scale 0.5–2.0 in 0.1 steps; `fitCamera` computes from the canvas's
content box (canvas component passes `{contentWidth, contentHeight, viewportWidth, viewportHeight}`
in the payload).

### 7.4 Inspector

`selection` + `inspectorHistory`. `selectEntity` with `followLink: true` pushes the current
selection to history. `inspectorBack` pops. `closeInspector` clears both. Keyboard-opened
inspector focuses its heading (feature sets `app.focusReturn` to the origin element's
focus key and `components/twin/inspector` restores it on close).

### 7.5 Navigation targets (cross-tab links, scope/method examples, breadcrumbs, CTAs)

```jsonc
{ "tab": "web", "web": { "module": "twin", "level": "operational", "processId": "PR-BOLETAS", "processView": "flow",
                         "versionId": "V-TOBE-02", "paymentVariant": "separacion", "activityKey": "T-02",
                         "selectEntityId": "SYS-DRIVE", "areaId": "A-AF", "representation": "processmap", "highlightRootId": "OBJ-01", "overlay": {…} } }
{ "tab": "desktop", "desktop": { "workspaceId": "WS-BOLETAS", "scenarioId": "SCN-02", "projectId": "PM-01" } }
{ "tab": "architecture", "architecture": { "nodeId": "C-GRAPH" } }
{ "tab": "scope", "scope": { "itemId": "SC-16", "filter": "excluded" } }
{ "tab": "methodologies", "methodologies": { "itemId": "MET-BPMN" } }
```
`navigateTo` resolves ids and permission first; if the target is not visible it sets
`web.notice` with MSG-02 (+ action) and does not change context; otherwise applies the context,
pushes history, selects the tab, and sets `app.focusReturn = { focusKey: 'tabpanel-heading:<tab>' }`
so the feature focuses its heading after render. The pack validator checks target ids.

## 8. DS components (`ds/atoms`, `ds/molecules`, `ds/icons`)

Every factory returns a DOM element and accepts a plain options object; no component reads
the store. Required factories and their options:

```js
icons.icon(name, { label?, size? })        // names: organization, area, macroprocess, process, activity, role, position, person,
                                           // external, system, document, policy, objective, indicator, gap, incident, project, version,
                                           // decision, event, start, end, close, back, forward, search, zoomIn, zoomOut, fit, reset, chevronDown,
                                           // chevronRight, check, warning, error, info, list, map, menu, externalLink, play, pause, stop, retry, plus,
                                           // edit, lock, user, shield, monitor, gear, database, folder, window, terminal, cloud, graph, flag, history, link
atoms.button({ label, variant: 'primary'|'secondary'|'ghost'|'danger', size: 'sm'|'md'|'lg', icon?, iconOnly?, ariaLabel?,
               onClick, disabled?, disabledReason?, busy?, type?, testid?, pressed?, expanded?, controls?, id?, extraClass? })
               // disabled buttons keep focusability via aria-disabled and show disabledReason as adjacent text (.btn__reason) or title
atoms.badge({ label, tone: 'neutral'|'brand'|'success'|'warning'|'danger'|'proposed'|'demo', icon? })
atoms.chip({ label, icon?, onRemove?, selected?, onClick? })
atoms.card({ title?, subtitle?, children, quiet?, selected?, as?: 'section'|'article'|'div', headingLevel?, actions? })
atoms.field({ id, label, hint?, error?, required?, control })      // wraps a control with <label>, hint and error (aria-describedby / aria-invalid)
atoms.input({ id, type?, value, onInput, placeholder?, maxlength?, min?, max?, pattern?, ariaLabel?, testid?, disabled? })
atoms.textarea({ id, value, onInput, rows?, maxlength?, testid? })
atoms.select({ id, value, options: [{ value, label, disabled? }], onChange, testid?, ariaLabel? })
atoms.checkbox({ id, label, checked, onChange, testid? })
atoms.iconButton({ icon, ariaLabel, onClick, pressed?, testid?, size? })
atoms.spinner({ label })                   // visible text + role="status"
atoms.divider(), atoms.kbd(text)
atoms.provenance({ labels: string[], confidence, sourceIds, sources: Map, onOpenSources? })   // badges + "Fuentes: S-ORG · Organigrama…"
molecules.tabs({ id, tabs: [{ id, label, testid? }], selectedId, onSelect, mode: 'presentation'|'local', orientation? })
                                           // role=tablist; manual activation; Arrow/Home/End; returns { el, panelAttrs(tabId) }
molecules.breadcrumbs({ items: [{ label, onClick? }] })
molecules.searchField({ id, label, value, onInput, onClear, resultsText?, placeholder?, testid? })
molecules.entityLink({ entity, typeLabel, icon, relationLabel?, onOpen, versionId?, testid?, badge? })
molecules.statusLabel({ label, tone, icon? })
molecules.metric({ label, value, unit?, date?, target?, missingText })
molecules.table({ id, caption, columns: [{ id, label, sortable?, width? }], rows: [{ key, cells: [{ text?|node?, sortValue? }], selected?, onSelect? }],
                  sort: { column, direction } | null, onSort, emptyText, cardMode?: boolean, actionsColumn? })
molecules.disclosure({ id, summary, content, open?, onToggle? })
molecules.modal({ id, title, body, actions: [{ label, variant, onClick, testid? }], onClose, size?, describedBy? })   // returns { el, open(), close() }; focus trap; Escape closes; restores focus
molecules.confirm({ title, text, confirmLabel, cancelLabel, danger?, onConfirm, onCancel })
molecules.toasts({ toasts: [{ id, text, tone }], onDismiss })       // 5 s auto-dismiss handled by shell via store.timers
molecules.emptyState({ text, action?: { label, onClick } , icon? })
molecules.notice({ text, tone, action?, onDismiss? })
molecules.list({ items: [{ key, node }], ariaLabel })
molecules.keyValue({ rows: [{ label, value: string|Node }] })
```

CSS tokens from `ds/tokens.css` + `ds/extensions.css` only. Selected = outline
(`--graph-line-selected`), focus = outer ring (`--color-focus-ring`), related = 2 px line +
teal, hover = subtle raise. Materials for entity types (visualization.css): `.node--area`,
`.node--position`, `.node--person`, `.node--external` (dashed border), `.node--process`,
`.node--activity`, `.node--decision` (rotated square), `.node--event` (circle), `.node--system`,
`.node--role`, `.node--document`, `.node--objective`, `.node--proposed` (dashed teal).

## 9. Canvas architecture (components/twin/canvas.js)

A canvas is an HTML layer: `.canvas` (viewport, `tabindex=0`, role=group, aria-label) >
`.canvas__layer` (CSS `transform: translate(x,y) scale(s)`) > absolutely positioned
`.node` buttons (`<button class="node node--area" data-entity-id data-focus-key>` with wrapped
text) + one `<svg class="canvas__edges">` beneath with paths computed from node geometry.
Layout functions are pure: `layoutOrgChart(model, geometry) → { nodes: [{id, x, y, w, h}], edges: [{id, from, to, points}] , width, height }`,
`layoutProcessMap(model)`, `layoutFlow(model)`. Geometry constants come from
`extensions.css` values mirrored in `components/twin/canvas.js` `GEOMETRY` (node min width
176, gap 24, lane height, etc.). Node height grows with wrapped text: nodes are measured after
render (`offsetHeight`) and the layout is re-run once with measured heights (two-pass), no
overlap allowed. Pan: pointer down on empty layer/background only; zoom buttons ± / fit /
reset; wheel does nothing unless Ctrl is pressed (then zoom). While dragging, the canvas
applies the transform directly to `.canvas__layer` and dispatches `setCamera` once on pointer
up (never per pointermove). `prefers-reduced-motion` →
no transition on transform. Every canvas has `listMode` alternative with the same links and
actions rendered by `components/twin/entitylist.js`. The canvas never reads permissions; it
renders the model it is given.

## 10. Shell template (`src/shell.html`)

```html
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>PRIMUS para Próspera · Prototipo</title>
<style>/*PRIMUS:STYLES*/</style></head>
<body>
<noscript><!--PRIMUS:NOSCRIPT--></noscript>
<div id="primus-app" class="shell">
  <header class="shell-header" id="primus-header"></header>
  <nav class="shell-tabs" id="primus-tabs" aria-label="Secciones de la presentación"></nav>
  <main class="shell-main" id="primus-main">
    <section id="panel-architecture" role="tabpanel" aria-labelledby="tab-architecture" tabindex="0" hidden></section>
    <section id="panel-scope" …></section><section id="panel-methodologies" …></section>
    <section id="panel-web" …></section><section id="panel-desktop" …></section>
  </main>
  <div id="primus-overlays"></div>
  <div id="primus-toasts" class="toasts" aria-label="Avisos"></div>
  <div id="primus-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>
</div>
<script type="application/json" id="primus-pack">/*PRIMUS:PACK*/</script>
<script>/*PRIMUS:SCRIPTS*/</script>
</body></html>
```
The build replaces the three placeholders (pack JSON escapes `<` as `\u003c`, `>` as
`\u003e`, `&` as `\u0026`, U+2028/2029). `--dev` output links files instead of inlining
CSS/JS (pack always inline) for local debugging. Features mount into their panel exactly
once (`features/<id>.mount(panelEl, ctx)`); the panel keeps its DOM when hidden so state,
scroll and drafts persist. `main.js` wires `visibilitychange` → `pauseScenario` for the
active session.

## 11. Test ids (Playwright and manual verification)

Shell: `tab-architecture … tab-desktop`, `btn-view-web`, `btn-reset`, `btn-about`,
`about-dialog`, `about-ok`, `reset-dialog`, `reset-confirm`, `reset-cancel`, `toast`.
Architecture: `arch-node-<id>`, `arch-list-toggle`, `arch-inspector`, `arch-connections`,
`arch-cta-scope`, `arch-cta-web`. Scope: `scope-filter-<id>`, `scope-item-<id>`, `scope-view-<id>`,
`scope-show-all`. Methodologies: `method-<id>`, `method-example-<id>`.
Web: `profile-select`, `web-level-<level>`, `web-rep-<rep>`, `web-depth-<depth>`, `web-search`,
`web-search-clear`, `web-search-results`, `web-list-toggle`, `web-canvas`, `node-<entityId>`
(and `node-<versionId>-<key>` for flow nodes), `expand-<entityId>`, `inspector`,
`inspector-heading`, `inspector-back`, `inspector-close`, `inspector-link-<entityId>`,
`inspector-action-<action>` (`focus-area`, `open-area`, `history`, `open-flow`, `view-sheet`,
`compare`, `incidents`, `projects`, `sources`, `instruction`, `connections`, `show-relations`,
`clear-relations`), `breadcrumb-<n>`, `context-back`, `back-to-org`, `zoom-in`, `zoom-out`,
`fit-view`, `reset-camera`, `variant-<id>`, `version-<id>`, `process-view-<view>`, `history-dialog`,
`history-row-<versionId>`, `incident-<id>`, `incident-new`, `incident-edit`, `incident-close`,
`incident-form`, `incident-save`, `incident-cancel`, `incident-filter-<id>`, `project-<id>`,
`project-new`, `project-edit`, `project-close`, `project-prepare-asis`, `project-simulate-close`,
`security-nav`, `account-<id>`, `account-new`, `account-form`, `account-save`, `audit-table`,
`web-notice`, `web-notice-action`, `area-select`, `process-select`, `layer-<id>`.
Desktop: `workspace-<id>`, `mode-chat`, `mode-ops`, `composer`, `composer-submit`,
`scenario-start-<id>`, `scenario-continue`, `scenario-stop`, `scenario-retry`,
`scenario-restart`, `error-mode-<id>`, `event-<logicalId>`, `tool-<callId>`, `review`,
`review-instruction`, `review-note`, `review-reason`, `review-restore`, `review-approve`,
`review-reject`, `review-cancel`, `review-resume`, `scn2-result`, `scn2-reference`,
`scn2-confirm`, `scn2-prepare`, `artifact-preview`, `evidence-<id>`, `evidence-picker`,
`use-analyst-profile`, `desktop-cta-web`, `jump-to-latest`, `studio-footer`.

## 12. Build and tests

`node build/build.mjs --client prospera` → validates (`schemas/pack-validator`), merges
pack, concatenates CSS and JS in manifest order, inlines into the template, writes
`dist/prospera-prototype.html` and `dist/prospera-build.json` `{ clientId, schemaVersion,
specVersion, sourceRevision (git rev-parse HEAD or null), generatedAt, inputs: [{path, sha256}],
checks: [{id, ok, detail}], bytes, sha256 }`. Non-zero exit and **no dist write** on any
failure. Syntax check: `new Function(js)` in Node before writing. Delivery check: the output
contains no `http://`, `https://` (except inside the allowlisted `externalReference` urls),
`fetch(`, `XMLHttpRequest`, `WebSocket`, `import(`, `@import`, `localStorage`, `indexedDB`,
`serviceWorker`, `document.cookie`, `<iframe`, `/home/`, `C:\`.

`npm test` → `node --test tests/`. Tests must run offline in < 30 s.

## 13. Feature mount contract

```js
Primus.module('features/web', function (require) {
  return {
    id: 'web',
    mount(panelEl, ctx) { /* ctx = { store, pack, graph, permissions, format, dom, atoms, molecules, icons, navigate(target), ui } */ }
  };
});
```
`mount` renders immediately and subscribes to the store; it re-renders only the regions
whose view model changed (compare JSON of the region's model), always through
`dom.preserveFocus`/`preserveScroll`. The first heading of every panel has
`data-focus-key="tabpanel-heading:<tab>"` and `tabindex="-1"`. Features must not query DOM
outside their panel except `#primus-overlays` (through `molecules.modal`) and the live region
(through `dom.announce`).
