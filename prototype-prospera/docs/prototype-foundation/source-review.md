# Source review and adaptation record

Reviewed by local source inspection on 2026-10-06. No browser rendering, remote Claude Design brandbook retrieval, external methodology verification, or usability testing was performed. Paths below are repository-relative unless absolute. The two legacy artifacts are reference material, not starting copies to embed.

| Source | Evidence extracted | Application / limit |
| --- | --- | --- |
| [.claude/rules/ui-design-system.md](../../references/cockpit/.claude/rules/ui-design-system.md) | PRENTER authority, teal brand accent, token-first, atomic bank, same-change catalog | Governs design foundation; preserve framework-neutral contracts in portable bank |
| [project.config.yaml](project.config.yaml) `design_system_ref` | Token/atom references; embedded `/design-system` catalog | Reference to real adopted system; do not add Storybook.js |
| [globals.css](globals.css) | Complete local color/type/space/radius/elevation token baseline; remote font import | Extract plain CSS tokens; exclude imports; fonts are substitutes and fallbacks |
| [atomic bank README](prtProspera/prototype-prospera/references/cockpit/ui/components/ds/README.md) and `atoms/{Button,Badge,Card,Input}.tsx` | Existing React bank; Button variants and sizes; light-surface Input | Adapt to vanilla shared bank; dark variants need deliberate catalog review |
| [catalog](prtProspera/prototype-prospera/references/cockpit/ui/app/design-system/page.tsx) and [adoption story](prtProspera/prototype-prospera/references/cockpit/docs/product/stories/sistema/design-system-atomic-storybook/00-story.md) | Live reference and recorded incomplete migration, molecules, DOM harness, official fonts | Do not claim a complete existing library; proposed inventory fills gaps |
| [twin README](prtProspera/prototype-prospera/references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/README.md), [source map](prtProspera/prototype-prospera/references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/src/README.md) | Modular source assembled into generated single HTML; vanilla JS/SVG; source debt | Retain delivery pattern, replace mutable global fragments and scattered styles |
| [43-navegacion.js](43-navegacion.js) | Level entry, area rooms, universal entity-link routing, depth presets/branch visibility | Distinguish responsibility, area lens and area workspace; shared entity registry |
| [50-state-view.js](50-state-view.js) | Independent camera/detail state, branch layout pushing rows, fit vs readable-page fitting | Preserve separation and non-overlap; new history/camera restoration is proposed |
| [62-valor.js](62-valor.js) | Seven bands; objective path; related drivers/roles/systems; area lens and neighbors; process single/double click | Preserve geography and graph-driven emphasis; arbitrary entity highlights are a proposed extension |
| [70-inspector.js](70-inspector.js) | Selected inspector vs contextual overview; entity links; provenance; derived SIPOC; missing detail language | Consistent inspector structure; focus handling and inspector history are proposed additions |
| [80-eventos.js](80-eventos.js) | Level/layer controls, search shortcut, legacy Back/Escape behavior | Replace multi-depth Escape jumps with predictable dismissal and explicit Back |
| [desktop mockup](mock-conversacion.html) | Static terminal-style workspace roster, context chips, turns/tools, approval options, dual mode, status dock; embedded mono font | Reuse patterns for process analysis; no existing interaction engine or real connection inferred |

## Preserve / adapt / leave behind

Preserve: PRENTER authority, one-file delivery, modular authoring, semantic detail, context-preserving inspection, relationship emphasis, evidence/confidence, truthful missing data, branch expansion, chat/terminal projections and reviewable tool results.

Adapt: deterministic session state, client packs, formal validation, consistent Back/focus, explicit actions alongside double click, responsive list view, actual accessible controls, analyst evidence-to-proposal scenarios, and simulated approval with one-time resolution.

Leave behind: client-specific hardcoded sample records, chronology-based CSS appendices, inline raw colors and aliases, unreviewed remote font dependencies, mockup violet roles, duplicated mode switches, hidden mobile workspace navigation, blanket “always allow,” and static `role="img"` around an interactive application.

Known evidence limits: the twin README and source README report different historical test counts; no count is adopted as a current verified baseline. The mockup has no JavaScript and its apparent controls do not establish functionality. Its model name, costs, timings and developer paths are sample content, not requirements. Methodology labels in existing comments provide historical rationale but do not certify current standards compliance. Client scope will determine which views/methods/scenarios are enabled.
