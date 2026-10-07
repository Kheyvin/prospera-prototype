---
story_id: negocio-schema-ssot-plugin-vs-repo
type: service-story
module: sistema
capability: sistema/negocio-schema-ssot-plugin-vs-repo
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** custodio de la arquitectura
**Quiero** decidir el SSoT de `negocio.schema` (traerlo al repo `sistema/schema/` o dejarlo en el kit)
**Para** eliminar la ambigüedad de fuente de la verdad del schema

## Por qué importa

Hoy `negocio.schema` vive en el plugin del harness, no en el repo. Mientras no se decida su SSoT hay ambigüedad sobre quién manda: el kit o el repo. Es deuda detectada en la auditoría CK-11.

## Outcome esperado

- Decisión firmada del SSoT de `negocio.schema`: repo (`sistema/schema/`) o kit.
- Fuente de la verdad del schema sin ambigüedad.

## Antecedentes / Contexto

- Origen: **auditoría CK-11**.
- Disyuntiva: traer el schema al repo (`sistema/schema/`) o dejarlo en el kit.
- Fichas: (ninguna).

## Out of scope (explícito)

- Cambios de contenido del schema en sí; esto es solo la decisión de ubicación/SSoT.

## Riesgos / Asunciones

- **Asunción:** el schema puede vivir en un único SSoT sin romper el flujo de upstream/backflow del arnés.

## Próximo paso

`→ /po lee este archivo → decide y documenta el SSoT de negocio.schema.`

> Procedencia (CK-19): backlog item **BL-06** · estado legacy **pendiente**.
