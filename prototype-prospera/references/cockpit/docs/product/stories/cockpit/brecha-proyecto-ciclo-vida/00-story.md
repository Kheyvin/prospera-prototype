# 00-story.md — Brecha → proyecto: caso de negocio + ciclo de vida (cierra PDCA)

---
story_id: brecha-proyecto-ciclo-vida
type: ui-story
module: cockpit
capability: cockpit/brecha-proyecto-ciclo-vida
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** directorio de la organización
**Quiero** brechas con costo estimado + ranking ROI (caso de negocio por brecha) y el ciclo de vida del proyecto de mejora dentro de Cockpit (brecha→proyecto→ejecución→KPI movido)
**Para** decidir qué mejorar primero y ver el loop PDCA cerrado en la misma herramienta

## Por qué importa

Nadie del mercado cierra el loop brecha→proyecto→ejecución→KPI movido en la misma herramienta.
Sin caso de negocio por brecha, los proyectos no se priorizan por ROI (lección KYP/Bee360).

## Qué es (alcance idea)

- Brecha con costo estimado y ranking ROI — de ahí "nacen solos" los proyectos.
- Ciclo de vida del proyecto de mejora en N13: brecha → proyecto → ejecución → KPI movido (cierra PDCA).

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16) — visión organization-as-code + organization twin.
- Research: `docs/research/organization-as-code/07-capability-list-tobe.md` (#12-13).
- La entidad Proyecto de primera clase viene del schema v2 (`sistema/schema-v2-hilo-de-oro-kinetica`); la medición del "KPI movido" viene del cruce estructura×operación (BL-28).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (brecha · proyecto · roi · pdca): sin historia que cubra este ciclo en N13. Revisadas: `consultio/operar-metodo-construir-mapa-completo` (BL-16 — calcula la brecha TO-BE−AS-IS con severidad y hace **nacer** los proyectos en el levantamiento N14; esta historia toma el ciclo de vida posterior DENTRO de Cockpit N13, no duplica el cálculo), `cockpit/cruce-estructura-operacion-indicadores` (BL-28 — provee la medición que confirma el "KPI movido").

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/cockpit/brecha-proyecto-ciclo-vida/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
