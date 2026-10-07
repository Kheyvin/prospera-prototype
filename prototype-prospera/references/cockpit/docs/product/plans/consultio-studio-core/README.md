# Plan — Consultio + studio-core (extraer, no clonar)

> **Fecha:** 2026-07-17 · **Estado:** propuesto (pendiente ratificación operador → ficha CK-NN)
> **Contexto:** CK-21/D7 (Consultio v0 = arneses sin shell) · NODOS.md N5/N14/N8/N15 ·
> scout de `~/Proyectos/dev-studio` 2026-07-17 (ver `03-reparto-codigo.md`).

## Decisión propuesta

Consultio **NO es un fork/clon** de DevStudio. La topología objetivo son **tres piezas**:

```
┌─────────────────────────────────────────────────────────┐
│  studio-core  (módulo Go + paquete UI · repo propio)    │
│  motor arneses · driver Claude Code · sesión · store ·  │
│  transporte HTTP/SSE · updater · design system React    │
└────────────────────┬───────────────────┬────────────────┘
              import │ semver     import │ semver
        ┌────────────┴─────────┐  ┌──────┴───────────────┐
        │  dev-studio (N5)     │  │  consultio (N14)     │
        │  app fina: taxonomía │  │  app fina: taxonomía │
        │  dev, worktrees git, │  │  entregables, método │
        │  changes-panel       │  │  M1-M3, preview N13  │
        └──────────────────────┘  └──────────────────────┘
```

- Cada producto = repo propio, ledger propio, célula propia (doctrina de graduación vigente).
- Lo genérico vive UNA vez en `studio-core`; los productos lo consumen por import versionado.
- La mejora fluye **producto → core → todos los productos** (upstream-first), nunca
  producto → producto (cherry-pick entre forks = prohibido).

## Por qué no fork (lo que dicen los expertos)

- **Fork = doble mantenimiento permanente.** Cada bugfix se aplica 2 veces o diverge silencioso.
- **Software Product Line Engineering (SPLE):** activos core compartidos + puntos de variación
  por producto. Es el patrón estándar para "N productos, misma base".
- **Regla de tres (AHA):** abstraer recién cuando hay 2º consumidor real. Consultio ES el 2º
  consumidor → este es el momento correcto de extraer, ni antes ni después.
- **Precedente propio:** el arnés prenter ya opera así (plugin versionado, backflow,
  "jamás fork silencioso") y Vitalia/Nicolify ya probaron engine compartido + lift gate.
  Trasladamos la doctrina, no la topología monorepo (las células mandan repos separados).

## Mapa del plan

| Doc | Contenido |
|---|---|
| `01-disciplina.md` | La disciplina upstream-first en detalle: reglas, flujos, ejemplos, anti-patterns |
| `02-fases.md` | Fases F0→F3 con criterios de entrada/salida |
| `03-reparto-codigo.md` | Qué va al core vs qué queda en cada producto (datos del scout) |
| `04-ficha-ck-draft.md` | Borrador de ficha CK-NN para el LEDGER (ratifica el operador) |

## Estado de fases (resumen — detalle en `02-fases.md`)

- **F0 · Consultio v0 arneses (YA ratificada, CK-21/D7):** entregar M1-M3 sobre Claude Code
  pelado. Cero shell. **No depende de este plan** — corre en paralelo desde hoy.
- **F1 · Frontera marcada en dev-studio:** fitness test core-vs-dev. Pasiva, barata.
- **F2 · Extracción `studio-core`:** cuando F0 valide "engagement ≈ repo git" y el shell
  de Consultio se vuelva necesario.
- **F3 · Consultio app fina** sobre el core.
