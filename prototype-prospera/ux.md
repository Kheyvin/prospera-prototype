# UX contract: presentation, organizational twin, and analyst studio

Status: reusable interaction specification, 2026-10-06. Read [arch.md](arch.md) for data/state and [design.md](design.md) for components and styling. “Observed” below means verified by source inspection, not a new browser usability study. “Required” means a proposed rule for the next prototype. See the [source review](source-review.md).

## 1. Audiences and presentation journey

The client reviewer needs to understand the proposed solution, its boundaries, its method, and how the applications will feel. The organizational user needs to move from organization-wide context to a process or activity without losing relationships. The process analyst needs to turn evidence into a reviewable twin proposal, with visible provenance and control over changes.

Start in **Architecture of the Solution**. Top tabs then expose **Scope of the Project**, **Methodologies Supported**, **Web-Module Prototype**, and **Desktop-Module Prototype** in that order. Keep the web preview one action away throughout; it is the principal experience. The desktop preview is the second priority. Display “Prototype · simulated interactions” where previews include mock actions, and label client-provided versus synthetic data through the pack's data mode and record provenance.

Required shell behavior:

- Tabs switch presentation content; they do not change management level or semantic depth inside the twin.
- Preserve each tab's state, scroll and draft while the HTML remains open. Pausing a hidden desktop scenario prevents unseen advancement; resume explicitly when returning.
- Use a tablist with matching tab/tabpanel IDs and selected state. Left/Right move focus, Home/End reach first/last, Enter/Space activate; Tab leaves the tablist. This manual activation avoids changing content while a user is only exploring labels.
- Cross-tab links name their destination (“View this process in the web preview”). Activate the destination, resolve the referenced context, then focus its heading/control. If data is absent, keep the user in context and explain the missing demonstration.
- Provide a global “Reset demo” action. If a draft or staged proposal exists, explain that it will be discarded and offer Cancel/Reset. Otherwise reset immediately.

Tab 1 lets users select a solution node, read its responsibility and connections, and see whether it is proposed or confirmed. Tab 2 distinguishes included, excluded, deferred and undecided scope, with links to demonstrated items. Tab 3 connects each method to the specific capability/view/evidence it supports. APQC (possibly intended by “AQPC”) and BPMN are candidate labels requiring confirmation during intake; do not claim a method or compliance simply because it appeared in the brief.

## 2. Web preview: three independent navigation dimensions

Observed: the twin stores management level (`nivel`), semantic depth (`escala`), and camera transform (`view`) separately. Preserve this distinction with descriptive labels rather than legacy variable names.

| Dimension | Meaning | Required behavior |
| --- | --- | --- |
| Management level | Responsibility and decision context: board, strategic, tactical area, operational | Level selector changes the question being answered. These labels are defaults; enable/configure only levels supported by the client pack. |
| Semantic depth | Organization overview → area focus → process flow → activity instruction | Explicit context navigation changes detail. Breadcrumb and Back show the path. |
| Camera scale | Physical magnification and pan of the current graph | Zoom/pan never silently changes responsibility or opens a deeper view. |

Observed defaults include management level 2 and the value map, while level 1 presents a board agenda and level 3 enters an area selector. An area focus is a lens over the same value map, not a rearranged replacement map. Tactical area-room navigation and area lens are distinct destinations and need distinct labels. Selecting level 4 opens a process flow; the legacy uses a predefined flagship process if none is active.

Required adaptation: level 4 uses the currently focused valid process; otherwise present a process selector. Never invent or silently choose a client flagship. A context breadcrumb names Organization / Area / Process / Activity as appropriate, while the management-level label remains separately visible.

## 3. Selection, drawers and deeper navigation

Observed: a process single click opens its inspector; double click enters its flow. Activity selection opens detail; the final instruction is the semantic floor. Drawer entity links resolve through shared `wireLinks`; closing the selected drawer restores the contextual overview. The inspector is a persistent right-side region in the historical shell, not necessarily a modal.

Required interaction table:

| Trigger | Result | Preserved state |
| --- | --- | --- |
| Click or Enter/Space on an entity | Select entity and open its inspector | Current map geography, camera, level, filters and layers |
| “Open process flow” action | Enter that process's flow | Origin context stored in navigation history |
| “Focus this area” | Apply area lens in place | Band order and neighbor positions |
| “Open area workspace” | Enter tactical room for that area | Origin context and selection history |
| Explicit instruction action | Enter an activity instruction when present | Parent flow and camera stored |
| Related entity link in inspector | Replace inspector with that entity; push inspector history | Map/context unchanged unless explicit navigation requested |
| Inspector Back | Previous entity inspector | Context unchanged |
| Close inspector | Clear selection; show contextual overview | Highlight root and context unchanged |
| Context Back / breadcrumb | Return to stored parent context | Previous camera, compatible filters and branch expansion |

Double click is an optional shortcut, never the only route. Ensure it produces one navigation transition even if the first click opened the inspector. Touch and keyboard use explicit labeled actions. Provide “Return to organization overview” separately from one-step Back.

Inspector content order: entity type and name → key facts/ownership → measurements or process characterization → typed related entities → provenance → available actions. Type-specific sections (KPI trend, SIPOC, roles, systems, gaps) extend this structure. Provenance includes source and confidence; missing information is labeled. Do not extrapolate a full process flow from a macro summary. Show “Activity detail not yet provided” with the available summary and evidence.

At wide sizes, the inspector is a labeled complementary region with no focus trap. On keyboard-triggered open, focus its heading or first meaningful control and provide an explicit return-to-map action. Closing restores focus to the originating entity or a stable map control if it is no longer visible. On narrow sizes the inspector is a dialog/sheet: move focus inside, trap while modal, make background inert, close via Escape, and restore origin focus.

## 4. Connected elements and area focus

Observed: selecting an objective toggles its active relationship path and opens the objective inspector. The value map computes processes serving it, then their owner roles and systems; capability relations and connecting edges form the path. Unrelated items dim. Direction processes remain context rather than being claimed as direct KPI drivers. In area focus, included processes remain in their map positions, immediate chain neighbors remain partially emphasized, and other elements fade.

Required rules:

1. Separate `selectedEntityId` from `highlightRootId`. Opening a role/system inspector along an objective path must preserve the path. Closing the inspector does not remove the path; “Clear relationship focus” does.
2. Compute connected sets using declared typed relations and a documented traversal policy. Objective focus follows contribution/support paths to capabilities, processes, responsible roles and supporting systems. Do not highlight all reachable nodes through unrelated dependency cycles.
3. Selection gets an outline/marker; related entities and edges get increased weight and emphasis; unrelated context stays visible. Explain relationships with labels and a connected-entities list in the inspector.
4. Area focus includes descendants and their processes; immediate upstream/downstream neighbors retain a boundary treatment. Do not reorder nodes to look like a new organization.
5. Multiple lenses compose by intersection for visible emphasis. Search does not mutate the graph or active relationship root. Show counts and active-filter chips; provide clear actions per filter and “Clear all filters.” If a root is outside the lens, explain it and offer to clear the conflicting lens.
6. If no declared relation exists, show “No linked entities provided.” Never draw fabricated paths. A hidden layer reports that relevant linked items exist but are hidden and offers “Show layer.”

Required extension beyond the observed objective behavior: other entity types can offer an explicit “Show connections” action using their registered traversal policy. Do not claim that arbitrary entity clicks already highlighted every relationship in the old prototype.

## 5. Expansion, search, canvas and history

Observed: organizational branches expand individually; depth presets expand up to a requested level. Expanded role lists increase row height and push other rows away. Search dims nonmatching items; Ctrl/Cmd+K focuses the search. Legacy Back returns an activity instruction to its process flow, but other paths and Escape may jump to the overview.

Required refinements:

- Branch expansion is independent of management level. Label presets “Expand through depth …”. Expansion adjusts layout without overlaps and retains a stable branch anchor.
- Search supports entity name, type and identifier, with visible result count, clear button, and keyboard-operable results/list alternative. Ctrl/Cmd+K is optional convenience. No-results state suggests clearing filters; no entities means the pack is incomplete.
- Provide Zoom in/out, Fit view, Reset camera and optional minimap with accessible labels. Panning begins on empty canvas space, not on buttons, inspector content or text selection. Explicit zoom controls support keyboard/touch. Preserve camera during inspection and filter updates; fit after explicit context changes only.
- Large diagrams can pan; board agendas and narrative pages scroll at readable text size. Do not fit a tall agenda by shrinking all text. Process flows start at a readable beginning and can pan horizontally; list view supplies the same links and actions.
- Context Back follows actual history one step. On fresh entry without history, it uses the logical parent; a direct activity entry resolves its parent process from data.
- Escape closes the topmost overlay/menu first, then clears focused search, then closes an entity inspector, then clears an active relationship focus. Semantic Back remains an explicit action; Escape does not unexpectedly jump several depths. Do not intercept ordinary text editing or platform shortcuts.

## 6. Desktop preview: process analyst adaptation

Observed mockup elements: workspace roster grouped by Active / Waiting for you / Inactive, unread and elapsed indicators, role/model/branch/location context chips, user and assistant turns, expandable-looking tool output, a permission prompt, Terminal/Chat switches, composer dock, connection and usage footer. It contains no script, so these are visual patterns rather than implemented behaviors. Its explanatory note proposes one Claude process feeding both surfaces.

Required analyst adaptation:

| Reused pattern | Analyst-oriented meaning |
| --- | --- |
| Workspace roster | Client/process workspaces and sessions, with active/needs-review/idle state; stable IDs distinguish similarly named workspaces |
| Context chips | Client, process, evidence set and proposed/current version; model/transport diagnostics are secondary and optional |
| Conversation stream | Analyst asks to extract, characterize, compare or improve a process; assistant explains evidence and proposed result |
| Tool cards | Read evidence, extract activities, map roles, validate relationships, prepare artifact; show input source, output and status |
| Approval prompt | Review a proposed twin change and its affected entities before applying it to demo state |
| Terminal / Chat | Two synchronized representations of one scripted session; chat is the default for process analysts |
| Dock/status | Editable draft, explicit submit, scenario shortcuts, honest simulated connection and progress |

Proposed demonstration journey, to enable only when client scope supports it: select process workspace → inspect supplied evidence → run a scripted extraction → review activities, roles and uncertainty → inspect proposed graph changes → approve once or reject with reason → preview the affected process in tab 4. Every created/proposed entity carries evidence references. Approval updates only in-memory demo state; the fixture remains resettable. UI feedback says “Applied to demo,” never “Published to production.”

Use the [scenario template](scenario.md) to bind this journey to actual client data later. The HTML does not execute Claude Code, shell commands, filesystem reads or arbitrary AI generation. Label the connection “Claude Code · simulated.” Unknown free-text input explains that the prototype supports guided scenarios and keeps the draft; never fabricate a successful tool run. A future real desktop connection requires its own architecture and authorization requirements.

Pending review blocks only the affected session's next simulated operation. Offer Approve once, Reject with reason, and Cancel; do not inherit “Always allow in workspace” by default from a development-tool mockup. Show what changes, what evidence supports it, and which relationships are affected. Resolve a review exactly once; repeated clicks must not duplicate artifacts.

Terminal and Chat mode switches preserve transcript identity, pending review and unsent input. Use one mode switch; the mockup's duplicated switches are not two independent states. Terminal mode reveals structured operations and readable result text, never an executable terminal. Workspace switching preserves drafts per session and never sends one session's events to another.

Playback has visible Start/Continue/Stop controls. Stop cancels future queued events without inventing completion. Errors retain tool evidence and offer retry/reset for the guided scenario. Auto-scroll only when already at the latest message; otherwise show a new-message count and “Jump to latest.” Announce completed steps and review requests, not every token. Small screens keep a labeled workspace selector, transcript and review reachable.

## 7. Empty, unavailable and authority states

| Situation | Required response |
| --- | --- |
| Missing metric | Neutral “No data,” with source/date if known; never automatic red or zero |
| Stale measurement | Value plus measurement date and “Stale”; distinguish freshness from performance |
| Unsupported detail | Available summary and precise missing section; no invented flow/instruction |
| Invalid relation/reference | Prevent final build; development preview exposes a useful content error |
| Proposed change | Visible Proposed label, reviewable differences, session-only effects |
| Simulated role lacks authority | Keep action discoverable with the required role/reason; no fake access-control claim |
| No evidence | “Source not provided”; confidence remains unverified |
| No scenario | Guided empty state explaining which client inputs are needed |

Mock authority is a presentation lens, not authentication. Every action must either perform its documented simulation, navigate, or explain why it is unavailable. Avoid decorative controls that appear actionable.

## 8. Acceptance journeys for the implementation session

| Journey | Observable pass condition |
| --- | --- |
| Open artifact offline | Starts in tab 1; all five tabs, assets and previews work without network or server |
| Inspect architecture and scope | Node responsibility and scope disposition are clear; demo coverage links resolve |
| Traverse twin | Organization → area focus → process → instruction → Back restores parent context and camera |
| Inspect related entities | Entity → drawer → related entity → inspector Back → Close preserves map context and restores keyboard focus |
| Follow objective | Path strengthens only declared typed relationships; roles/systems/capabilities are explained; Clear restores ordinary emphasis |
| Combine lenses | Search + area + layers has truthful counts, no fabricated links, and recoverable empty results |
| Expand hierarchy | Opening a branch/role list pushes rows without overlap; presets do not change management level |
| Review analyst proposal | Evidence → tool events → review → approve/reject updates only expected demo entities; tab 4 reflects approved changes |
| Switch modes/workspaces/tabs | Same session remains synchronized; drafts/context survive; hidden playback pauses |
| Reset | Cancel retains draft; Reset returns all views and pending events to fixture state |
| Keyboard/narrow/reduced-motion | Every primary journey works with keyboard and list view; sheet focus returns; motion is optional |

Review the two application previews most deeply. A static screenshot or passing syntax check is insufficient evidence for these journeys. Source extraction in this session establishes patterns; the future implementation must verify actual usability and rendering.
