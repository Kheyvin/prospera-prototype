---
story_id: terminar-arquitectura-despliegue
type: service-story
module: sistema
capability: sistema/terminar-arquitectura-despliegue
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** arquitecto del sistema
**Quiero** terminar la arquitectura y el diagrama de despliegue
**Para** que el sistema tenga un mapa as-code de sus nodos y planos

## Por qué importa

Sin un mapa de despliegue cerrado no hay base común para decidir dónde vive cada capability. El mapa quedó cerrado en CK-14 y luego se rediseñó de fondo en CK-18 (Fábrica + Organización instalada).

## Outcome esperado

- Arquitectura / diagrama de despliegue terminado (CK-14).
- Base as-code para ubicar capabilities por nodo.
- Rediseño de fondo aplicado en CK-18.

## Antecedentes / Contexto

- Origen: **operador, sesión CK-11**.
- Cerrado en **CK-14**; rediseñado de fondo en **CK-18**.
- Fichas: CK-11, CK-14, CK-18.

## Out of scope (explícito)

- El rediseño CK-18 (Fábrica + Organización instalada) se rastrea por sus propios ítems de backlog.

## Riesgos / Asunciones

- **Asunción:** el mapa cerrado en CK-14 seguía siendo válido como base pese al rediseño posterior de CK-18.

## Próximo paso

`→ Cerrado (CK-14). Rediseño de fondo en CK-18. Sin capability runtime asociada.`

> Procedencia (CK-19): backlog item **BL-03** · estado legacy **hecho**.
