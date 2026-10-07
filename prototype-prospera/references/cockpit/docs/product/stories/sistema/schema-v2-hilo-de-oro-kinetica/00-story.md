# 00-story.md — objeto.schema v2: hilo de oro + capa kinética

---
story_id: schema-v2-hilo-de-oro-kinetica
type: service-story
module: sistema
capability: cockpit/api-objeto
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** arquitecto del sistema
**Quiero** un `objeto.schema` v2 con OKR/KPI/Proyecto como entidades de primera clase ancladas al hilo de oro (objetivo→OKR→KPI→proceso/rol/persona) y una capa kinética (acciones válidas por entidad)
**Para** que el twin de la organización sea medible y accionable, no solo descriptivo

## Por qué importa

Sin OKR/KPI/Proyecto como dato, el hilo de oro no se puede medir ni recorrer; sin capa kinética, el
schema describe la organización pero no gobierna quién modifica qué, con qué aprobación.

## Qué es (alcance idea)

- Entidades OKR / KPI / Proyecto de primera clase, ancladas al hilo de oro.
- Capa kinética: acciones válidas por entidad declaradas en el schema — la Gestión de Cambios (BL-24) es el motor que las ejecuta.
- Doctrina Palantir adoptada: naming navegable por agentes, anti-patterns God Object / Action Sprawl / Misnomer, provenance structs `fuente`+`conf`.

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16) — visión organization-as-code + organization twin.
- Research: `docs/research/organization-as-code/04-doctrina-ontologia-palantir.md` + `07-capability-list-tobe.md` (#1-3, #10).
- Extiende el contrato vigente `objeto.schema.yaml` (9 entidades, CK-12) servido por `/api/objeto` (CAP-08).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (okr · kpi · schema · kinetica · palantir · hilo de oro): sin historia que cubra este alcance. Revisadas: `sistema/reconciliar-objeto-schema-9-entidades` (done — consolidó el v1; esta lo **extiende**, no lo recrea), `sistema/persona-puesto-primera-clase` (done — patrón "entidad de primera clase" a seguir), `sistema/negocio-yaml-proyeccion-generada` (proyección, no schema), `cockpit/modulo-gestion-cambios-iso` (BL-24 — es el **motor** que ejecuta las acciones kinéticas; acá solo se declaran en el schema, sin duplicar el módulo).

## Deuda heredada (R de `arquitectura-refichado-ck21`, 2026-07-17)

- Ref muerta `process.schema` en `sistema/schema/objeto.schema.yaml:49` — detectada por el barrido de
  esa historia (el archivo estaba fuera de su alcance); resolver aquí al extender el schema a v2.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/sistema/schema-v2-hilo-de-oro-kinetica/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
