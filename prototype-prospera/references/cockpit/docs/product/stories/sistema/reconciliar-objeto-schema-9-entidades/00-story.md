---
story_id: reconciliar-objeto-schema-9-entidades
type: service-story
module: sistema
capability: cockpit/api-objeto
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** arquitecto del sistema
**Quiero** reconciliar `objeto.schema` (9 entidades) con el `negocio.schema` implementado (4)
**Para** que el contrato vigente sea uno solo y `/api/objeto` lea y valide las 9 entidades juntas

## Por qué importa

Dos schemas divergentes (9 vs 4 entidades) rompen la SSoT del objeto normalizado y abren drift entre lo modelado y lo servido. Consolidar el contrato vigente en `objeto.schema` deja un único origen de la verdad.

## Outcome esperado

- Contrato vigente único = `objeto.schema` (CK-12).
- `/api/objeto` lee y valida las 9 entidades JUNTAS (CK-13, CAP-08).
- Divergencia 9↔4 cerrada; queda solo el tramo `negocio.yaml → proyección generada`.

## Antecedentes / Contexto

- Origen: **auditoría CK-11**.
- Cerrado en **CK-12** (contrato) + **CK-13** (CAP-08, `/api/objeto`).
- Fichas: CK-12, CK-13.

## Out of scope (explícito)

- Voltear `negocio.yaml` a proyección generada del objeto — es BL-19.

## Riesgos / Asunciones

- **Asunción:** validar las 9 entidades juntas en `/api/objeto` es suficiente para garantizar el contrato sin fragmentar la lectura.

## Próximo paso

`→ Cerrado. Capability producida: cockpit/api-objeto. Tramo restante: BL-19.`

> Procedencia (CK-19): backlog item **BL-02** · estado legacy **hecho**.
