# Availability and dependency notes

The package contains the local UI and prototype sources referenced during this session, their local Markdown-link dependencies, the desktop mockup, and both supplied scope files. Markdown links were adjusted for portability; their adaptations are recorded through differing source/packaged hashes.

## Available locally

- Canonical PRENTER token implementation, React atoms, complete local UI source and embedded catalog source.
- Twin HTML and every source part registered in its builder, plus its build and verification scripts.
- Twin design dossier, PRENTER adoption story, screenshots and linked local context.
- Desktop mockup, including its existing embedded mono font.
- Client scope copied into `client-inputs/prospera/scope/` for later interpretation.

## External or unavailable material

The original PRENTER Claude Design project (`a98c2e0d-db82-43f2-8fd7-e7e05c40fd51`), its original `SKILL.md`/brandbook/source directories, and official Coco Gothic/Sansation font files were not checked into the repository and could not be included. Their historical mentions are provenance, not dependencies needed to read or use this package. Use the copied local implementation and system font fallbacks until licensed official assets are supplied.

Claude artifact URLs, external standards/research citations, and sibling projects mentioned inside historical documents remain informational references. Remote pages were not downloaded or verified in this packaging session. Paths in historical examples and shell snippets may describe those older systems; they are not instructions or prerequisites for the new implementation. The mockup's sample commands/model names/usage figures are illustrative content.

## Runtime and build distinctions

The legacy twin and desktop HTML references embed their rendering assets. The copied React stylesheet still contains its original Google Fonts and Tailwind imports; use [portable tokens.css](tokens.css) for the new offline artifact. The React app requires dependencies and its normal API-backed views require a backend; no backend, accounts, credentials or real Claude Code transport are supplied. Its package lockfile records installable dependencies, not vendored installations.

The legacy twin's pre-commit integration belongs to its original repository. Its copied builder works independently, relative to its own file location; run it explicitly in the new location. The package does not activate copied Cockpit policies, import its active harness, or impose its historical project workflow on the new project.

The future client deliverable must use the chosen client pack and new implementation, not ship this entire archive or the historical client's sample data. See the isolation and single-file acceptance gates in [arch.md](arch.md).
