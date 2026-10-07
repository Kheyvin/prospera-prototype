# Prospera prototype implementation package

Move this entire folder to any location. All included documentation links and source references resolve within this package. No symlinks point back to Cockpit or sibling projects. The original workspace files were left in place.

## Start here

1. Read [arch.md](arch.md), [design.md](design.md), and [ux.md](ux.md).
2. Review the [foundation materials](docs/prototype-foundation/README.md) and [source extraction record](source-review.md).
3. Read the supplied [Prospera scope](client-inputs/prospera/scope/). It was copied for the next implementation session; the reusable blueprint was not rewritten around it.
4. Fill the [client pack](client-pack.json), define [scenarios](scenario.md), and track the [handoff checklist](handoff-checklist.md).
5. Create the new implementation in a new `implementation/` directory using the scaffold in `arch.md`. Keep historical references separate from the new source of truth.

## Included material

| Location | Contents |
| --- | --- |
| `arch.md`, `design.md`, `ux.md` | Architecture, atomic UI design, and interaction specifications |
| `docs/prototype-foundation/` | Source review, intake template, scenario template and checklist |
| [PRENTER portable tokens](tokens.css) | Plain CSS extraction of canonical app tokens, without Tailwind or remote imports |
| [UI source](references/cockpit/ui/) | Full checked-in UI source, atomic bank, feature/shell components, design-system catalog, configs, tests and dependency lockfile |
| [UI doctrine](references/cockpit/.claude/rules/ui-design-system.md) | Historical PRENTER rule; reference material, not an instruction to modify the old repository |
| [Twin reference](references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/) | Existing HTML, complete modular source, builder, verification script, handoff and sandbox |
| [Design review screenshots](references/cockpit/docs/product/prototypes/revision-ds-twin-2026-07-20/) | Catalog and twin screenshots plus historical review HTML |
| [Twin design dossier](references/cockpit/docs/product/stories/cockpit/twin-territorio-mapa-zoomable/dossier/) | Vision, detailed mockup guide, decisions, sample data, construction guidance, pending issues and audit |
| [PRENTER adoption story](references/cockpit/docs/product/stories/sistema/design-system-atomic-storybook/) | Adoption status and recorded unfinished components |
| [Desktop mockup](mock-conversacion.html) | Existing self-contained analyst-studio visual reference |
| `references/cockpit/` additional documents | Local documents linked from the references, including architecture/method/schema context; original repository layout preserved |
| [Source manifest](SOURCE-MANIFEST.json) | Original source-relative locations and hashes, packaged hashes, and documented adaptations |

This is a development foundation package, containing internal scope and historical sample information. It is not the single HTML to send to the client.

## What can run now

Open the existing [twin HTML](index.html) and [desktop mockup](mock-conversacion.html) directly in a browser. These are old reference artifacts, not the new five-tab Prospera prototype.

From this folder, verify portability and packaged-source integrity:

```sh
python3 tools/verify-package.py
python3 references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/build.py --check
```

Python 3 is needed for those checks. The twin builder additionally uses Node, if installed, to check bundled JavaScript syntax. Its historical `verify.sh` expects Bash and `google-chrome`; that full browser suite was included but not rerun during packaging.

The React UI source is reusable source material, not an offline HTML app. Its catalog is `ui/app/design-system/page.tsx`. Working on that source requires Node ≥20, pnpm ≥9 and dependency installation. Its application screens expect a Go backend on localhost:4100, which is not needed for the proposed new vanilla prototype and is not included. Do not assume the copied application is a standalone functioning backend system. See [availability and dependency notes](AVAILABILITY.md).

## Packaging decisions

All local Markdown-link dependencies were included recursively. Documentation links were rebased within the package, including previously broken links to the foundation templates. Generic documents remain independent of the Prospera scope; the scope is isolated under `client-inputs/`.

Source/runtime JS, TSX, HTML and CSS references were copied without behavioral changes. The separate portable token extraction removes imports and converts Tailwind's `@theme` block to plain `:root`; the original stylesheet remains available. Node modules, `.next`, exported build caches, TypeScript caches, Git metadata and machine credentials are not portable source material and were excluded. No new prototype was implemented.
