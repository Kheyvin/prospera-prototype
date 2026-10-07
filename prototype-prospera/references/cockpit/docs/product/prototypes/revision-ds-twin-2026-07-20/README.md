# Revisión de build — Design System PRENTER + Twin visual (2026-07-20 · CK-27)

Mockups y capturas de la sesión que adoptó el **design system PRENTER**, encendió el **twin visual**
(proyección objeto→negocio) y re-tematizó los organismos. Guardados acá para no perderlos (venían de
temporales de sesión).

## Qué hay

- **`revision-build.html`** — el reporte de revisión **auto-contenido** (abrir en el navegador). Estado
  de lo construido: 3 superficies + hallazgos + checklist pre-embed. Las capturas van embebidas.
  Artifact publicado: https://claude.ai/code/artifact/0ccedd29-39a2-4b54-9280-879756fab8d2
- **Capturas** (del binario en vivo, fixture terranova):
  - `ds-catalog.jpeg` / `.png` — catálogo `/design-system` (tokens + átomos PRENTER).
  - `lente-mapa-onbrand.jpeg` — Mapa vivo (áreas/procesos + semáforo), ya on-brand (post-limpieza de hex).
  - `lente-hilo-terranova.jpeg` — Hilo de oro (objetivo → KR → procesos que lo sostienen).
  - `lente-brechas-terranova.jpeg` — Brechas atadas a objetivo (tipo, costo, prio).
  - `negocio-personas-terranova.jpeg` — lente Personas (captura previa a la limpieza de brand).
  - `embed-final.jpeg` — el twin servido desde el binario embebido (:4100, sin next dev).

## Contexto

- Design system: `.claude/rules/ui-design-system.md` · `ui/components/ds/` · ruta `/design-system`.
- Twin: proyección `go/negocio_projection.go` (D-13 · RN-9) — `/api/negocio` deriva del objeto.
- Ledger: **CK-27**. Story: `docs/product/stories/sistema/design-system-atomic-storybook`.
