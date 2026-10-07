# Portable client prototype: architecture and code organization

Status: implementation blueprint, 2026-10-06. No prototype or production integration is implemented by this document.

Read with [design.md](design.md), [ux.md](ux.md), and the [foundation index](docs/prototype-foundation/README.md). This foundation is independent of any client's scope. The Prospera scope directory is deliberately not an input to these decisions.

## 1. Architectural boundary

Build a reusable presentation engine and a separate, validated client content pack. Produce one HTML file for one client at a time. Changing the organization, project scope, methodologies, labels, entities, and demonstration stories must require changing the pack, not the renderer.

The artifact presents the proposed final solution, but its own runtime is a browser-only demonstration. Tab 1's solution architecture is **content**, not the architecture of the HTML. Do not imply that a drawn connector, simulated permission, or terminal response implements a real integration.

Decisions:

| Concern | Decision and reason |
| --- | --- |
| Authoring | Modular vanilla JavaScript, semantic HTML, CSS, and inline SVG; matches the portable precedent without introducing a production framework dependency. |
| Delivery | Generated single HTML with embedded styles, classic bundled script, JSON data, and permitted assets. Opens through `file://` without a server. |
| UI reuse | Adapt PRENTER token and component contracts into a framework-neutral bank. Existing React atoms are references; importing TSX directly is not viable in this runtime. |
| Preview composition | Render web and desktop previews as organisms inside tabs 4 and 5. Avoid copying whole legacy HTML files or introducing separate iframe applications. |
| Client isolation | Explicit build selection of one client directory. Never bundle the complete client registry or other clients' packs. |
| State | In-memory state, resettable to the embedded fixture. No required local storage, cookies, URL routing, or remote persistence. |
| Simulation | A shared scenario engine handles deterministic mock actions and desktop events. Claude Code connection is simulated and labeled; actual connection belongs to a later desktop implementation. |
| Dependencies | Runtime has no network dependency. Build tools may run locally; their output must not need a runtime, package installation, or server on the recipient's machine. |

## 2. Five-tab composition

Order and stable IDs are invariant; display labels can be localized through the pack.

| ID | Visible title | Content contract | Organism |
| --- | --- | --- | --- |
| `architecture` | Architecture of the Solution | Solution nodes, typed edges, deployment boundaries, descriptions, and proposed/confirmed state | SolutionArchitecture |
| `scope` | Scope of the Project | Included, excluded, deferred, and undecided capabilities; deliverables, dependencies, acceptance references | ScopeExplorer |
| `methodologies` | Methodologies Supported | Method definitions and mappings to capabilities, views, entities, and evidence | MethodologyExplorer |
| `web` | Web-Module Prototype | Organizational graph, enabled views and layers, scenarios | TwinWorkspace |
| `desktop` | Desktop-Module Prototype | Analyst workspaces, evidence, scripted conversation/tool events, proposed changes | AnalystStudio |

Start in tab 1 as requested. Make tab 4 easy to reach with a descriptive CTA. Allocate the largest implementation and review effort to tab 4, then tab 5. Do not equate a capability listed in scope with a demonstrated interaction: record `demoCoverage` as `interactive`, `illustrated`, or `not-demonstrated`.

## 3. Proposed scaffold for the next implementation session

This tree describes future source files; this session creates only documentation and intake templates. Use a new prototype directory rather than modifying the historical twin.

```text
portable-prototype/
  README.md
  build/
    build.mjs                 # validate, bundle, inline, emit one artifact
    manifest.json             # explicit source and asset allowlist
    validate-pack.mjs         # structural and reference validation
  schemas/
    client-pack.schema.json   # versioned pack contract
    scenario.schema.json     # versioned deterministic event contract
  src/
    shell.html                # landmarks, header, five tab panels
    main.js                   # bootstrap selected embedded pack
    core/
      store.js                # app, web, desktop state; subscriptions
      navigation.js           # history, semantic navigation, focus restoration
      graph.js                # indices, typed traversal, derived projections
      scenarios.js            # mock event playback and session-only mutations
      format.js               # locale, dates, units; explicit missing values
    ds/
      tokens.css              # portable PRENTER extraction
      extensions.css          # centrally registered prototype tokens
      atoms/                  # button, badge, card, input, icon, toggle
      molecules/              # tabs, breadcrumbs, field, entity-link, status
      catalog.html            # development catalog, embedded in local preview
      catalog.js
    components/
      shell/                  # header, tab navigation, disclosure, toast
      twin/                   # rail, map, canvas toolbar, inspector, list view
      analyst/                # roster, transcript, tool card, review, composer
    features/
      architecture/           # presentation and solution-node inspector
      scope/                  # scope groups and demonstration links
      methodologies/          # method mapping and evidence panels
      web/                    # TwinWorkspace and entity-specific panels
      desktop/                # AnalystStudio and scripted interactions
    styles/
      layout.css
      visualization.css       # glyphs, relationship lines, layer materials
      responsive.css
      print.css
  clients/
    example-client/
      pack.json               # identity and references to the sections below
      solution.json           # tab 1, never hardcoded in the shell
      scope.json              # tab 2
      methodologies.json      # tab 3
      organization.json       # tab 4 normalized graph
      desktop.json            # tab 5 workspaces and artifacts
      scenarios.json
      assets/                 # approved logos and optional licensed fonts
      source-register.json    # source IDs, confidence, client visibility
  tests/
    contracts/                # schema, references, graph and scenario invariants
    interactions/             # journeys, keyboard, highlight, drawer, tabs
    delivery/                 # file:// launch, offline, single-file checks
  dist/
    <client-id>-prototype.html # GENERATED; never edited manually
    <client-id>-build.json     # local report; not needed to open the HTML
```

The build resolves the section files into one embedded pack. A single input JSON is also supported for initial small packs. Source filenames are organizational choices; the resolved contract is invariant. The [intake template](client-pack.json) shows that resolved contract with empty collections, not a finished demonstration.

Dependency direction: features → organisms → molecules → atoms → tokens. Core depends on data contracts, not UI. Components send commands to the store; they do not modify imported client data. Client content never imports renderer code. A feature may compose shared components but may not reach into another feature's DOM.

## 4. Resolved client pack contract (version 1)

| Field                      | Required content and rules                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `schemaVersion`            | Integer `1`; reject unsupported versions explicitly.                                                                                                                     |
| `client`                   | Stable `id`, display `name`, `locale`, `timeZone`, `currency`, `classification`, `dataMode` (`synthetic`, `client-provided`, `mixed`). Formatting settings are data.     |
| `presentation`             | Title, introductory copy, five localized tab labels; PRENTER theme is fixed, not arbitrarily overridden by client colors.                                                |
| `sources[]`                | Unique `id`, title, source type, optional locator/date, `clientVisible`. Private filesystem paths and raw source documents do not enter the deliverable.                 |
| `solution`                 | `nodes[]`, `edges[]`, `boundaries[]`; nodes identify responsibility, deployment location and planned/confirmed state. Edges identify direction and purpose.              |
| `scope.items[]`            | `id`, title, description, `disposition`, `demoCoverage`, `acceptance[]`, dependency IDs, source IDs. Unresolved scope is visible, never silently included.               |
| `methodologies[]`          | `id`, name, version/reference if known, purpose, mapping records, source IDs. Each mapping identifies a scope item and relevant view/entity; empty evidence is explicit. |
| `organization.entities[]`  | `id`, `type`, `name`, `description`, optional `parentId`, attributes, provenance, optional metric/flow payload. Supported types are declared by the renderer registry.   |
| `organization.relations[]` | Unique `id`, existing `from`/`to` entity IDs, typed relationship, direction, provenance. Distinguish ownership, sequence, contribution, support, and dependency.         |
| `organization.views`       | Enabled management levels, representations, semantic depths, layers, default entity/context IDs. Only enable detail backed by data.                                      |
| `desktop`                  | Workspaces, artifact references, session IDs and scenario IDs; workspace IDs must belong to this client pack.                                                            |
| `scenarios[]`              | `id`, title, preconditions, commands, ordered events, expected state, reset behavior. See [scenario template](scenario.md).                                              |

Entity IDs are stable opaque keys; never use translated labels or person names as keys. Provenance uses `{sourceIds, confidence, observedAt, dataState}`; confidence is `confirmed`, `inferred`, or `unverified`, and data state is `known`, `missing`, `not-applicable`, or `proposed`. Dates are ISO strings or null. A missing metric value is null, never zero. Metrics include unit, measurement date, target, and threshold/direction rules before computing health. Roles/positions and people are separate entities; assign responsibility to a role or position and link its occupant separately.

At build time validate unique IDs, source references, scope/method mappings, asset paths, entity type support, relation endpoints, scenario targets, and enabled-view prerequisites. Reject cycles in parent hierarchies; process and dependency graphs may contain declared loops. Derived health, adjacency, SIPOC projections, highlight sets, and counts are computed from inputs, not separately persisted as contradictory truth. Architecture and organization graphs are distinct namespaces with explicit references where needed.

No arbitrary client JavaScript, HTML snippets, CSS, or executable scenario commands. Render client strings with text nodes; compose structured rich text through an allowlisted renderer. Escape JSON for HTML embedding, including `<`/closing-script sequences. Scenario commands are registry IDs with data payloads, not shell commands or `eval` input.

## 5. Runtime state and commands

| State slice | Fields and purpose |
| --- | --- |
| App | Active presentation tab, focus return target, transient notifications. |
| Web | Management level, semantic depth, focused area/process/activity, representation, enabled layers, search, selected entity, highlighted path root, branch expansion, inspector history. |
| Camera | Pan and scale per web context; independent of semantic depth and graph data. |
| Desktop | Workspace/session, input mode, draft, playback status/cursor, expanded tools, pending review, staged changes. |
| Demo | Session-only changes, scenario progress, reset snapshot. |

Commands include `selectTab`, `inspectEntity`, `followRelation`, `enterContext`, `navigateBack`, `toggleLayer`, `setSearch`, `setCamera`, `selectWorkspace`, `playScenario`, `resolveReview`, and `resetDemo`. Commands validate referenced IDs and prerequisites before mutation. Selection does not imply navigation; camera movement does not imply detail navigation. Store tab state independently so returning to a preview restores its context.

One selected entity has one inspector; follow links using the same entity registry. Typed graph selectors return related IDs and explain relationship labels. Keep context navigation history separate from inspector history. Reset cancels playback timers and restores fixtures, pending approvals, selections, drafts, and cameras deterministically. No state or client content survives a reload unless a later requirement explicitly adds persistence.

Desktop event records use stable `eventId`, `sessionId`, `sequence`, `kind`, and structured `payload`. Kinds cover analyst messages, assistant messages, tool-start/result, approval-request/result, artifact-proposal, error, and completed. Deduplicate by event ID, pair tool results by call ID, and route events to their originating session. Terminal and chat are alternate projections of this same stream. They do not run separate agents.

## 6. Assembly and portability

The future build must: select one pack → validate → extract PRENTER tokens into plain CSS → bundle modules into a classic inline script → inline approved SVG/data-URI assets and optional licensed font files → safely embed JSON → emit artifact and local build report. Pin source ordering/dependencies through the manifest; fail on unregistered source files. Do not concatenate incomplete JavaScript fragments onto a mutable global `DATA` object as the old prototype does.

Remove CSS `@import`, remote fonts, external scripts/styles/images, dynamic imports, fetch/XHR/WebSocket calls, workers needing separate files, and absolute filesystem paths from the output. An optional source-reference URL may remain as an explicitly activated link; it must never be fetched automatically. Use system fonts if licensed embed-ready fonts are unavailable. Do not copy the Google Fonts import from the app stylesheet.

The report records client ID, schema version, source revision, generated date, checks, and artifact hash. Set an initial 5 MiB artifact budget; exceeding it requires an explicit documented asset decision. This is a proposed budget, not an existing measurement. The single HTML contains all included client information in readable form; its confidentiality label is informational, not access control. Include only approved-to-share records and client-visible provenance; do not embed credentials, hidden private attachments, or other-client content.

## 7. Completion gates for the future prototype

Contract checks and interaction tests must cover the journeys in [ux.md](ux.md). Delivery verification opens the generated file directly with networking disabled and checks console errors, asset loading, tab restoration, reset, and both previews. Review screenshots and actual interaction at the defined responsive sizes; syntax checks cannot detect overlaps or unreadable maps. Verify no client names/IDs occur in generic renderer files and no second client's content occurs in the artifact.

Use the [handoff checklist](handoff-checklist.md). Production stack, authentication, real Claude Code transport, storage, connectors, and deployment decisions remain client-project decisions for tab 1's content and later engineering; this blueprint does not preselect them.
