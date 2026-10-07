# Twin como Territorio — mockup de concepto (2026-07-20)

Prototipo interactivo del **paradigma de visualización del twin** (N13): la organización como **un mapa
navegable** con **zoom semántico** (organización → área → proceso-lienzo → detalle) y **capas
conmutables** que se pintan encima (estructura · hilo de oro · salud · brechas · cinética).

## Qué hay

- **`src/`** — **la fuente**, partida en 37 archivos por tema. Empezá por
  [`src/README.md`](prtProspera/prototype-prospera/references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/src/README.md): dice qué archivo gobierna qué.
- **`index.html`** — **GENERADO** (no editar): `build.py` concatena `src/` en un solo archivo
  autocontenido, que es lo que el Artifact exige (su política de contenido bloquea todo host externo).
  Vanilla JS/SVG · PRENTER dark/teal · datos canned de Terranova. No wirea Go/Next — es concepto,
  no la app real.
- **`build.py`** — `python3 build.py` regenera · `--check` valida sin escribir (lo corre el pre-commit).
- **`verify.sh`** — 33 pruebas con hit-testing real; reconstruye antes de probar y reintenta solo.
- **Artifact publicado (privado del operador):**
  https://claude.ai/code/artifact/20907d03-3979-42f2-b5c8-b33fa5e383f6

## Cómo iterar (conversación nueva)

1. Editar la **parte** de `src/` que corresponde (el mapa está en `src/README.md`). Nunca `index.html`.
2. `./verify.sh` → reconstruye y corre las 33 pruebas. Verde antes de seguir.
3. Re-publicar con la tool Artifact pasando `file_path` = `index.html` y `url` = el artifact de
   arriba → mantiene el mismo link.
4. Verificar en navegador (chrome-devtools): emular tema claro para confirmar dark-only, revisar z0/z1/z2.

## Contexto

- **Historia (SSoT):** `docs/product/stories/cockpit/twin-territorio-mapa-zoomable/` (`state: idea`) —
  ahí está TODO el concepto, las decisiones, el anclaje metodológico, el veredicto técnico y los
  **ajustes PENDIENTES** del operador.
- **Inspiración de canvas:** `~/Proyectos/harness-studio` (repo hermano — Organigrama = React Flow;
  map-canvas swim-lane = HTML+SVG a mano).
- **Dato:** shell real `~/Proyectos/terranova`.
- **Design system:** PRENTER (`.claude/rules/ui-design-system.md`).
- Relacionado con la sesión previa: `../revision-ds-twin-2026-07-20/` (adopción PRENTER + twin visual CK-27).
