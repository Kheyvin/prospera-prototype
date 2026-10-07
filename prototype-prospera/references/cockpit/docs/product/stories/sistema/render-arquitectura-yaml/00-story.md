---
story_id: render-arquitectura-yaml
type: service-story
module: sistema
capability: sistema/render-arquitectura-yaml
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** custodio de la arquitectura
**Quiero** un render propio de `arquitectura.yaml` con gate anti-drift
**Para** que la vista humana nunca diverja del dato as-code

## Por qué importa

El generador de la vista de arquitectura no se había portado al producto standalone. Un `gen_arquitectura.py` propio con `--check` cierra el gate anti-drift entre `arquitectura.yaml` (dato) y su vista humana, evitando divergencia silenciosa.

## Outcome esperado

- `gen_arquitectura.py` propio que renderiza la vista desde `arquitectura.yaml`.
- `--check` como gate anti-drift (falla si la vista diverge del dato).

## Antecedentes / Contexto

- Origen: **deuda CK-10** (generador no portado).
- Cerrado en **CK-15**.
- Fichas: CK-10, CK-15.

## Out of scope (explícito)

- Cambios al contenido de `arquitectura.yaml` en sí.

## Riesgos / Asunciones

- **Asunción:** un generador propio cubre el render sin depender del generador del monorepo de origen.

## Próximo paso

`→ Cerrado (CK-15). Tooling as-code, sin capability runtime.`

> Procedencia (CK-19): backlog item **BL-08** · estado legacy **hecho**.
