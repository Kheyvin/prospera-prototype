---
story_id: persona-puesto-primera-clase
type: service-story
module: sistema
capability: cockpit/lente-personas
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** arquitecto del sistema
**Quiero** modelar persona/puesto como entidad de primera clase (entidades persona/rol en `objeto.schema` + Lente Personas)
**Para** que el pilar Personas exista de verdad, más allá de objetivo/área/proceso/brecha

## Por qué importa

Sin persona/rol como entidades reales el sistema no puede razonar sobre puestos ni servir la Lente Personas; el pilar Personas quedaba como narrativa, no como dato. Modelarlo de verdad cierra un hueco estructural del objeto normalizado.

## Outcome esperado

- Entidades `persona` y `rol` de primera clase en `objeto.schema`.
- Lente Personas disponible como capability (CAP-07).
- El objeto normalizado cubre el pilar Personas junto a objetivo/área/proceso/brecha.

## Antecedentes / Contexto

- Origen: **VISION §TBD · CK-10 'Siguiente'**.
- Cerrado en **CK-12** (capability CAP-07, Lente Personas).
- Fichas: CK-10, CK-12.

## Out of scope (explícito)

- El tramo `negocio.yaml → proyección generada` (eso es BL-19).

## Riesgos / Asunciones

- **Asunción:** el modelado persona/rol en `objeto.schema` cubre las necesidades del pilar Personas sin reabrir el contrato del objeto.

## Próximo paso

`→ Cerrado. Capabilities producidas: cockpit/lente-personas + cockpit/api-objeto.`

> Procedencia (CK-19): backlog item **BL-01** · estado legacy **hecho**.
