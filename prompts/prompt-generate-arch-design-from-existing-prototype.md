## Your Goal
Provide me with an `arch.md` file detailing the architecture and code organization (file scaffold), and a `design.md` and ux.md file covering all design and UI and UX alignments with a well-defined atomic UI system design. (If you need to use templates or any other archive to organice better the information, you can do it but everithing correctly organized in files and folders, it is up to you). These files (or folders) will serve as the basis for building all the project that would be, first, a prototype that will be shared as a single, portable HTML file with a specific client using their internal organizational information. In this case, we will provide the exact scope of the prototype in a different file (/home/chalreme/Proyectos/Training/prtProspera/tmp/scope/), but you don't need it for this session. Because these two required files will not depend on the spec, you must determine how to generate a well-formed project for a prototype for any client.

## You don't
You will not create the prototype, but all the elements to create one once we have all information of the client to build one.

## The context
I 'm trying to create a complete new prototype with a more accurate and delimited scope, for a client (You can read the files here to understand what the prototype must do:  /home/chalreme/Proyectos/Training/prtProspera/tmp/scope/)

Besides being a one client prototype, we want to have well organized information so, if there are other clients, we can only replace information avoiding rewriting all the prototype.
## The Functional Organization of the Prototype, what the HTML will show and how 
When the user enter to the HTML the will see in the top, a set of "tabs" that will show a different levels of information of the Project we are selling.

**Tab 1: Architecture of the Solution**
This view contains the architecture of the final solution we are selling, once we build it all.

**Tab 2: Scope of the Project**
The exact scope of the entire project and functionalityes of the system

**Tab 3: Methodologies Supported**
For the grouped functionalities and views, the methologies that we used (AQPC, BPMN, etc.)

**Tab 4: Web-Module Prototype**
**This is the most important part:** the "cockpit"—specifically the prototype located at `/docs/product/prototypes/twin-territorio-2026-07-20/`—contains a very old version of what we had achieved at that moment. In this Tab we will embed a preview of what the application will look like once finished.

Please review the UX principles from the existing prototype, including how to navigate between levels, how selecting an element opens a drawer, and how connected elements are highlighted. Extract them to de UX.md archive and if you need to have templates to use put it in a folder.

**Tab 5: Desktop-Module Prototype**
**This is the decond most important part:** we will have a desktop application that connects with claude code, here a "mockup" developed in the past but for other porpouse /home/chalreme/Proyectos/dev-studio/epicas/conversacion-terminal-autentica/mock-conversacion.html in this case this app will bring to the process analyist all the tooks to create de digital twin.
As we dont build the prototype in this sesion but bring all the material to other sesion to create a good prototype, extract the best of the mockup that we can reuse in the prototype.

## This is the information gathered for you in a previous session:
The project has a real UI system: **PRENTER**, adopted from the Claude Design project “PRENTER Design System.” The twin prototype follows its dark and teal visual language, but it is a standalone vanilla JS/SVG artifact, not a React implementation built from the shared component library.

**Where the source of truth lives**

- UI design-system rule (.claude/rules/ui-design-system.md) defines PRENTER, the atomic design layers, and the rules for using them.
- Project config (project.config.yaml:68) records the design-system reference and implementation paths.
- Design-system story (docs/product/stories/sistema/design-system-atomic-storybook/00-story.md) documents the adoption and what remains unfinished.
- PRENTER token implementation (ui/app/globals.css) contains the tokens ported into the app.
- Component catalog (ui/app/design-system/page.tsx) is the live visual reference at `/design-system`.
- Atomic component bank (ui/components/ds/README.md) describes the library at `ui/components/ds/atoms/`.

The original PRENTER brandbook and source files are described as living in Claude Design (`SKILL.md`, `readme.md`, `tokens/`, and `components/`). They are not checked into this repository. The project uses an embedded `/design-system` catalog instead of Storybook.js.

**PRENTER’s visual language**

It is dark-first, with teal as the only brand accent (`#00b7aa`). The brand uses a condensed display face (Coco Gothic, with Jost as the current substitute), Sansation for body text (Mulish substitute), and JetBrains Mono for technical labels. Its recurring details are hairline borders, uppercase mono eyebrows with wide tracking, dark layered surfaces, and a restrained teal glow.

The token set includes teal and cool-neutral ramps, dark background/surface/raised/border colors, semantic brand and status colors, spacing on a 4px grid, radii, shadows, type sizes, line heights, and tracking. The official brand font files are still pending; the app currently imports substitute fonts from Google Fonts and falls back to system fonts.

**Atomic design and available components**

- **Tokens:** `ui/app/globals.css`
- **Atoms:** `Button`, `Badge`, `Card`, and `Input` in `ui/components/ds/atoms/`
- **Molecules:** planned under `ui/components/ds/molecules/`, currently unpopulated
- **Organisms:** feature and shell components under `ui/components/{negocio,shell,...}/`; these have not all been migrated to the shared bank
- **Catalog:** `/design-system`, showing token palettes and component variants

The operating rule is to consume or extend the shared atoms, use tokens instead of hardcoded visual values, keep teal as the sole saturated brand accent, and add new atoms or variants to the catalog in the same change. Those rules are in .claude/rules/ui-design-system.md.

**How the twin prototype applies it**

The prototype’s README (docs/product/prototypes/twin-territorio-2026-07-20/README.md) identifies PRENTER as its design system. Its own tokens are in docs/product/prototypes/twin-territorio-2026-07-20/src/10-tokens.css: teal ramp, black background, dark surfaces, text levels, semantic status colors, and font fallbacks. The stylesheet also sets dark color scheme, global focus treatment, and a subtle teal radial background.

The prototype adds a **visualization layer specific to the twin**: ArchiMate layer “materials,” entity-specific glyphs, map bands, status overlays, canvas controls, and inspector styling. The source map in docs/product/prototypes/twin-territorio-2026-07-20/src/README.md points to the CSS parts for each area. The deeper mockup guide (docs/product/stories/cockpit/twin-territorio-mapa-zoomable/dossier/02-mockup-guia-completa.md) explains the visual choices, including the entity glyphs and distinct materials for motivation, business, application, and implementation layers.

The prototype is assembled from `src/` by `build.py` into `index.html`; the README says to treat that HTML as generated. Its own source map notes some style debt: inline styles and raw colors remain in older templates and JS. The prototype’s tokens also use short names such as `--brand` and `--tx`, while the app system uses names such as `--color-brand` and `--text-on-dark`. For a new project, use the app’s canonical token set and treat the prototype’s additional map styles as domain-specific patterns to adapt.

For a quick visual reference, the CK-27 review (docs/product/prototypes/revision-ds-twin-2026-07-20/README.md) links screenshots of the catalog and twin surfaces. The main incomplete pieces recorded in the story are molecules, broader migration of legacy organisms into the shared bank, a DOM test harness for stateful atoms, and the official font files.