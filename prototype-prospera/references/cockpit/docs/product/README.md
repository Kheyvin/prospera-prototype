# docs/product/ — SSoT del producto bajo el arnés prenter (CK-19)

Fuente de la verdad del **qué se construye** de Cockpit, en el modelo de artefactos del arnés
`harness@prenter-marketplace`. Reemplaza como SSoT a `docs/product/_archive/` (backlog + increment pre-arnés)
(archivados · ver `MAPEO.md`). **Migración total ratificada por el operador (CK-19, 2026-07-09).**

## Layout

```
docs/product/
├ stories/<module>/<story-id>/       ← historias (unidad de trabajo)
│   ├ story.yaml                       ← SSoT atómico (estado macro, node, provenance BL-NN)
│   └ 00-story.md                      ← narrativa PM (Job-To-Be-Done)
│   └ (01-spec.md · checkpoint.md · 06-tickets.yaml se crean al refinar/construir)
├ capabilities/<module>/<cap>.yaml    ← capabilities construidas (con business_rules)
├ releases/<Fn>.yaml                   ← agrupación por release (reemplaza PI/sprint)
├ modules/<module>.md                  ← doc por módulo (= subsistema = nodo N-NN)
├ templates/                           ← skeletons del CORE (00-story·01-spec·00-research·story-ui.yaml)
└ MAPEO.md                             ← el mapa lossless legacy→arnés (prueba "nada perdido")
```

## Ciclo de vida (10 estados macro · CORE)

`idea → refining → refined → ready → developing → developed →[G Chris-verify]→[R reconcile]→ reviewing → done`
(+ `parked` · `dropped`). El estado vive en `story.yaml::state` (y en `checkpoint.md` una vez en construcción).
Gates, roles y DoD: `docs/process/harness/` + `.claude/rules/` (CORE) — no editar el CORE (`_HARNESS-CORE.md`).

## Módulos (= subsistemas = nodos)

`sistema` (transversal) · `cockpit` (N13) · `consultio` (N14) · `repositorio-oficial` (N6/N12) ·
`lakehouse` (N16/N18) · `colab-studio` (N17) · `fabricante` (N2/N3/N15). SSoT de nodos:
`sistema/arquitectura/NODOS.md` — cada historia ancla a un `node` (ver `.claude/rules/arquitectura-as-code.md`).

## Estado del roadmap (generado)

`ROADMAP.md § Estado` (bloque `<!-- GEN:estado -->`) se GENERA de `story.yaml` + `releases/*.yaml`
vía `gen_roadmap.py` — gate anti-drift en `.githooks/pre-commit` (mismo patrón que arquitectura/
metodología). No editar el bloque a mano. Manual: `python3 docs/product/gen_roadmap.py` (regenera)
· `--check` (solo valida). La prosa del resto del archivo (secuencia, "por qué aquí") es curada.

## Cadena de trazabilidad (preservada del sistema legacy)

`historia (provenance BL-NN) → fichas CK-NN (LEDGER.md) → capability (docs/product/capabilities) →
componente (arquitectura.yaml) → nodo N-NN (NODOS.md)`.

## Disciplina de sesión

Arrancar leyendo `docs/product/` (historias en `idea/refined/ready` = pool priorizable) + `LEDGER.md`
(decisiones). Idea nueva → historia en `state: idea` primero. Terminada Y verificada en vivo → `state: done`
+ capability en `docs/product/capabilities/`. Prioridades las firma el operador.

## Referencias

- `../process/harness/` — doctrina del CORE (lifecycle · ticket-states · spec-mapa-funcional · CIL · tech-debt).
- `../../project.config.yaml` — el seam (tech/sistema/toolchain/live-verify).
- `MAPEO.md` — correspondencia lossless con el sistema legacy.
