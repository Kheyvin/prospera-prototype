# PRENTER: atomic UI system for portable prototypes

Status: normative design blueprint, 2026-10-06. Read [arch.md](arch.md) for packaging and [ux.md](ux.md) for interaction semantics. Evidence and adaptation decisions are recorded in the [source review](source-review.md).

## 1. Design authority

PRENTER is the visual authority. The checked-in implementation at [globals.css](globals.css), [atomic bank](prtProspera/prototype-prospera/references/cockpit/ui/components/ds/README.md), and [catalog](prtProspera/prototype-prospera/references/cockpit/ui/app/design-system/page.tsx) is the usable local baseline. The original Claude Design brandbook and official font files are not available in this repository. This document does not claim to have inspected them.

Consume shared tokens and component contracts. New variants belong in the bank and local catalog in the same change. The portable bank translates these contracts to vanilla HTML/CSS/JS; it is not a second brand. Client identity is conveyed through approved logo, name, terminology, and content, while PRENTER remains consistent across clients.

Use dark layered surfaces, restrained teal emphasis, condensed display headings, readable body text, technical mono labels, hairline borders, and generous grouping. Teal is the only saturated **brand** accent. Muted success, warning, and danger colors are reserved for actual semantic states, with text/icon equivalents. The desktop mockup's violet role accents are not inherited.

## 2. Token foundation

Extract the canonical token values from `@theme` and `:root` into ordinary CSS custom properties for the artifact. Keep canonical names; do not adopt the old twin's `--tx`, `--brand`, `--raised`, or the mockup's parallel color aliases. A future extraction must document its source revision so the portable bank can be updated deliberately.

| Role | Canonical token / value |
| --- | --- |
| Brand | `--color-brand` → teal-500 `#00b7aa`; hover teal-400 `#1fc6b8`; active teal-600 `#009d92` |
| Surfaces | `--color-dark-bg` `#000000`; `--color-dark-surface` `#0c1110`; `--color-dark-raised` `#141a19` |
| Border | `--color-dark-border` `#1f2826`; `--dark-border-teal` for emphasis |
| Text | `--text-on-dark`, `--text-on-dark-muted`, `--text-on-dark-faint`, `--text-on-dark-brand` |
| Semantic on dark | `--color-success-dark` `#5cc99a`; warning `#e0ad4e`; danger `#e2766b` |
| Focus | `--color-focus-ring` → teal-400 |
| Spacing | `--space-1…10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px; this named scale is not a numeric multiplier |
| Radii | `--radius-sm/md/lg/xl/pill` = 4/8/14/22/999 px |
| Type sizes | display 64; h1 48; h2 36; h3 28; h4 22; lg 18; base 16; sm 14; xs/overline 12 px |
| Line height | tight 1.1; snug 1.25; normal 1.5; relaxed 1.65 |
| Tracking | tight −0.02em; normal 0; wide 0.04em; overline 0.14em |
| Weight | light 300; regular 400; medium 500; semibold 600; bold 700 |
| Elevation | canonical `--shadow-xs/sm/md/lg/brand`; borders and surface contrast carry most hierarchy |

Use display tokens for page/section headings, body tokens for explanatory text, and mono for IDs, values, units, source labels and terminal output. Canonical stacks are Coco Gothic → Jost → system-ui; Sansation → Mulish → system-ui; JetBrains Mono → ui-monospace → monospace. Embed licensed fonts only when available; otherwise use the declared local/system fallbacks. Do not require remote font loading.

The app includes both light surface semantics and dark surfaces. The prototype explicitly consumes dark surfaces; do not assume `--color-surface-card` is dark. Existing Input and secondary Button variants use light surfaces. Adapt them through cataloged variants rather than importing mismatched foreground/background pairs. Faint text is decorative metadata only; it cannot carry required instructions, values, or status. Verify actual contrast for every active text/surface combination.

### Proposed prototype extensions

These are new design decisions, not claimed PRENTER source tokens. Register them once in `extensions.css` and show them in the catalog:

| Token family | Contract |
| --- | --- |
| `--layout-header/rail/inspector` | 72/224/360 px at wide desktop; inspector may range 320–420 px if space permits |
| `--control-min-target` | 44 px comfortable target; dense controls may have smaller visual marks inside that target |
| `--duration-fast/normal` | 120/180 ms; reduced-motion sets nonessential transitions to zero |
| `--z-base/sticky/inspector/dialog/toast` | 0/10/20/30/40; focus rings and tooltips must not be clipped |
| `--graph-node-min-width/gap` | Initial 176/24 px; expand for content rather than overlap or shrink text |
| `--graph-line-default/selected` | 1/2 px; selected paths use weight plus teal, not color alone |
| `--material-*` | Domain layer surface, border, texture and glyph assignments; use existing neutral/teal tokens and line treatments |

Raw visual constants belong only in token definitions and documented geometry configuration. Entity content, glyph selection, relationship type, and status are data; a component must not invent a color for a specific client record.

## 3. Atomic inventory and composition contracts

An atom has no client or feature knowledge. A molecule combines atoms into a reusable control. An organism coordinates a domain workspace. A template defines regions and responsive behavior. A page supplies a client pack to a template. Only tokens, atoms and molecules enter the component catalog; full client stories remain in feature scenarios.

| Layer | Components | Required inputs / behavior |
| --- | --- | --- |
| Existing atom references | Button, Badge, Card, Input | Preserve established public variants where useful; port and catalog their portable equivalents. |
| Proposed atoms | Icon, IconButton, Toggle, Select, Divider, Spinner, Textarea | Accessible name for icons/controls; decorative icons hidden from assistive technology; native input semantics. |
| Molecules | TabList, Breadcrumbs, SearchField, LabeledField, EntityLink, StatusLabel, LayerToggle, MetricValue, SourceReference | Stable IDs, labels, current/selected state, optional description; emit intent, never mutate client data. |
| Molecules | WorkspaceRow, ContextChip, ToolEventCard, ApprovalPrompt, Composer | Session/event identity, structured content, state, action callbacks; tool disclosure and review are keyboard operable. |
| Organisms | PresentationHeader, TwinRail, TwinCanvas, EntityInspector, EntityList, AnalystRoster, ConversationStream, ArtifactReview | Consume store selectors and commands; coordinate selection, context, evidence and mock actions. |
| Templates | PresentationShell, NarrativeTab, TwinWorkspaceLayout, AnalystStudioLayout | Own placement, stacking, scroll regions, and responsive transitions. |
| Pages | Five tabs in [arch.md](arch.md) | Bind data to templates; add no private atom implementations. |

### Shared component state specifications

| Component | Variants and states | Semantic / interaction contract |
| --- | --- | --- |
| Button | primary, secondary, ghost, dark; sm/md/lg; default, hover, focus, pressed, disabled, busy | Native button; existing heights 36/44/52 px. Use md for normal actions. Busy includes text and prevents duplicate commands. Disabled exposes a nearby reason. |
| Badge / StatusLabel | neutral, brand, success, warning, danger; optional proposed/missing label | Status is readable as text plus shape/icon. A noninteractive badge is never styled as an action. |
| Card | quiet or raised; optional selected state | Card container has no button role. Add a real action inside; avoid nested interactive cards. |
| Input / LabeledField | text/search; valid, invalid, disabled, read-only | Visible label and associated hint/error; dark variant cataloged; no placeholder-only label. |
| TabList | presentation or local mode | Selected state plus persistent underline/shape; one tab stop, keyboard navigation defined in UX. |
| EntityLink | entity type icon, name, optional relationship label | Resolves stable entity ID; opens inspector unless explicitly labeled as context navigation. |
| Toggle / LayerToggle | on, off, unavailable | Native control or `aria-pressed`; unavailable explanation states missing prerequisites. |
| MetricValue | known, missing, stale, proposed | Unit, date, value and target stay distinct; null shows “No data,” not zero. |
| EntityInspector | contextual overview, selected entity, unavailable entity | Header type/name, close/back controls, facts, relations, evidence, actions; same order across entity types. |
| ToolEventCard | queued, running, succeeded, failed, awaiting approval | Tool label, target, status, expandable input/result; no raw implementation protocol in default analyst view. |
| ApprovalPrompt | pending, approved, rejected, canceled | Explain proposed operation and impact; explicit buttons; resolve one request once. |
| Composer | ready, sending, waiting, unsupported | Visible mode, editable draft, explicit submit; unsupported free text receives honest feedback. |

Global focus styling applies to all interactive components, including SVG-linked entities. Selected, focused, hovered, related, stale, proposed and unavailable states must be distinguishable. Selection is a persistent outline/marker; keyboard focus is an outer ring; relationship emphasis strengthens edges; hover is transient. Do not overload a single teal fill to mean all four.

## 4. Layout and visual hierarchy

Presentation shell: client identity, title, prototype disclosure, then the five top tabs. Keep active tab and context visible without making the header consume the viewport. Tabs 1–3 use prose, grouped cards and readable diagrams with an adjacent textual/list equivalent. Content width uses canonical 1200 px and 760 px limits where appropriate. Avoid executive-dashboard decoration for narrative content.

Tab 4: left rail for management level, representation and layers; top context/breadcrumb/search row; dominant map/flow stage; right contextual inspector; compact canvas controls and optional minimap. Keep legends next to the controls they explain. Use the map's seven optional bands—strategy, direction, capabilities, value chain, support, people/roles, systems—only when the client pack supports them. Explicitly disclose missing bands rather than populating invented records.

Use a unique labeled glyph per entity type, based on the legacy visualization where relevant. Layer materials distinguish motivation, business, application and implementation using outline, texture and shape within PRENTER's palette. Domain materials belong to visualization styles, not the global brand palette. Method associations explain what a glyph means; using a glyph does not establish formal modeling compliance.

Tab 5: desktop window frame, workspace/session selector, context strip, conversation stream, artifact/tool disclosures, input dock and connection/status row. The stream is the main work surface; tool outputs are subordinate expandable evidence. Body font serves analyst conversation; mono serves terminal mode and technical snippets. Show artifact reviews next to the relevant conversation when space permits, and as an overlay/sheet otherwise. Desktop window controls may be decorative but cannot look like functional browser actions.

## 5. Responsive, motion and accessibility targets

Proposed layout thresholds: ≥1280 px uses rail, stage and docked inspector; 768–1279 px collapses the rail behind a labeled control and uses an inspector overlay when needed; <768 px uses a compact context row, scrollable tab strip, sheet inspector and entity list as the default map alternative. Workspace selection remains reachable on small screens; do not merely hide the legacy roster. Test 1440×900, 1024×768, and 390×844 plus browser text zoom at 200%. Breakpoints respond to available space, not user-agent detection.

Narrative pages use natural page scroll. The map owns deliberate pan/zoom gestures. The transcript owns vertical scrolling with a visible “Jump to latest” when the user is reading history. Avoid nested scroll areas where a single content flow suffices. Labels wrap; important values/actions remain visible; diagrams may scroll but should not shrink text to fit an entire large graph.

Adopt accessibility acceptance targets: text contrast at least 4.5:1 for ordinary text and 3:1 for large text; meaningful control boundaries/focus indicators at least 3:1; complete keyboard operation, visible focus, text alternatives and no color-only meaning. These are requirements to verify in the future build, not a claim of current conformance. Announce meaningful status changes without reading every simulated stream token. Respect reduced motion; never require blinking caret, pulsing dots, glow or animation to understand progress.

Use short transitions for disclosure and state change. Animate camera movement only after an explicit navigation action; preserve the camera during inspection. In reduced-motion mode apply the final position immediately. Keep motion decorative and avoid continuous full-map redraw effects.

## 6. Catalog and review

The portable catalog is a development surface analogous to Cockpit's `/design-system`, not a sixth sales tab and not Storybook.js. It must render tokens and all component variants/states, long labels, missing values, focus, errors, dark input variants and narrow layouts. Keep it out of the client artifact unless deliberately requested.

Review against actual rendered examples, including overflowing entity names and dense relationships. Record proposed tokens/variants and their source references. Do not carry forward the twin's inline-style/color debt, mockup violet roles, hidden mobile roster, or static `role="img"` wrapper as implementation rules. Acceptance combines the [handoff checklist](handoff-checklist.md) with the UX journeys; this documentation alone does not certify the future UI.
