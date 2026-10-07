# Dossier — el mockup del Twin, completo y en un solo lugar

> **Para la sesión que continúa la construcción.** Consolidado 2026-07-24 (v8.2, commits
> `4a9a365`→`501f8ac`) desde: las sesiones de mockup (2026-07-20 → 24), la conversación
> "Analizar visión y metodología del cockpit" (minada del transcript), el `index.html` leído
> completo, LEDGER (CK-21/CK-29) y las decisiones de schema D-17/D-18. **Nada quedó solo en
> el chat.**

## Qué leer y en qué orden

| Doc | Qué contiene | Léelo si… |
|---|---|---|
| [`01-vision-y-doctrina.md`](01-vision-y-doctrina.md) | POR QUÉ existe: CK-21→CK-29, diferenciadores, doctrinas que gobiernan cualquier cambio, anclaje metodológico | siempre, primero |
| [`02-mockup-guia-completa.md`](02-mockup-guia-completa.md) | QUÉ muestra y CÓMO, elemento por elemento: shell, z0-z3, módulos, capas×escala, las 20 fichas, motores, anchors de código | vas a tocar el mockup o a especificar la app |
| [`03-decisiones-y-porques.md`](03-decisiones-y-porques.md) | Las 17 decisiones ratificadas + D-17/D-18 + porqués finos + alternativas RECHAZADAS (no re-litigar) | antes de proponer cualquier cambio |
| [`04-datos-canned.md`](04-datos-canned.md) | Los datasets de Terranova + la casuística deliberada (el guion de venta encarnado en datos) | vas a portar datos al golden fixture |
| [`05-construccion-real.md`](05-construccion-real.md) | Del mockup a la app: qué ya está materializado, deuda de programación, veredicto técnico, historias relacionadas, doctrina de verificación, orden sugerido | vas a refinar/construir |
| [`06-pendientes-e-ideas.md`](06-pendientes-e-ideas.md) | Deuda abierta (⚠ los "muchos comentarios" del operador nunca entregados), ideas sin aterrizar (bandeja de decisiones, home por rol), tensión reportería↔volante, guiones de demo | al arrancar la próxima sesión |
| [`07-auditoria-hallazgos.md`](07-auditoria-hallazgos.md) | **TRACKER** de las auditorías: visual↔escrito (2026-07-25 — A/B/C/D) + **la agenda del directorio (2026-07-29 — H1-H13)**, con evidencia `file:line` y recetas de reproducción | **antes de tocar el mockup o refinar** — es la lista de lo que falta resolver |
| [`08-nivel-1-contrato-de-construccion.md`](08-nivel-1-contrato-de-construccion.md) | **CONTRATO DE BUILD del nivel 1**: la frontera (qué Cockpit NO hace), las 7 entidades nuevas + 2 extensiones (D-24…D-30), qué lee cada panel y su estado vacío honesto, los derivados, las 17 acciones, 12 escenarios de aceptación, la casuística obligatoria del fixture y la trazabilidad panel→carta→ficha | **vas a construir el nivel Directorio** — es el único doc que hace falta leer entero para eso |

## El mockup mismo

- **Fuente**: `docs/product/prototypes/twin-territorio-2026-07-20/**src/**` — 40 partes por tema;
  el mapa de qué archivo gobierna qué está en `src/README.md`. **`index.html` es GENERADO**
  (`build.py`, gate en pre-commit): no editarlo. Los anchors `file:line` de estos documentos que
  apuntan a `index.html` son de versiones previas — ubicá por archivo de `src/`, no por línea.
- **Artifact** (mismo URL siempre): `https://claude.ai/code/artifact/20907d03-3979-42f2-b5c8-b33fa5e383f6`
  — republicar pasando `url`; verificar CDN con WebFetch; avisar Ctrl+Shift+R.
- **Suite**: `./verify.sh` en ese directorio (34/34 hit-tested; flaky en frío — re-correr un
  "SIN RESULTADO" aislado). Doctrina completa: `05-construccion-real.md` § verificación.
- **Operativa de sesión de mockup**: `docs/product/prototypes/twin-territorio-2026-07-20/HANDOFF.md`.

## Cómo arrancar la próxima sesión (resumen)

1. Leer este dossier (01 → 08). 2. Abrir **`07-auditoria-hallazgos.md`** — es el tablero de deuda
abierta. 3. Si vas a **construir el nivel 1**, `08` es el contrato (entidades · paneles · acciones ·
escenarios); si vas a **iterar el mockup**, el HANDOFF del prototipo es la operativa; si vas a
**refinar**, `05` § orden sugerido. 4. Guardián CK-29 activo: contrastar todo pedido contra `01`;
desvío → avisar ANTES de aplicar; el operador firma.
