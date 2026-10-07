---
story_id: negocio-yaml-proyeccion-generada
type: service-story
module: sistema
capability: sistema/negocio-yaml-proyeccion-generada
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** arquitecto del objeto normalizado
**Quiero** voltear `negocio.yaml` a una proyección GENERADA del objeto
**Para** que deje de curarse a mano y no pueda divergir de la fuente

## Por qué importa

Es el último tramo de la convergencia D-13: hoy `negocio.yaml` se cura a mano como proyección del objeto. Derivarlo del objeto elimina el riesgo de drift entre la proyección y la fuente. El gatillo es tener el objeto poblado con objetivos y brechas.

## Outcome esperado

- `negocio.yaml` generado como proyección del objeto normalizado (deja de curarse a mano).
- Convergencia D-13 cerrada.

## Antecedentes / Contexto

- Origen: **CK-13 (deuda declarada) · D-13**.
- Gatillo: objeto poblado con objetivos y brechas.
- Relacionado: BL-02 dejó `/api/objeto` leyendo las 9 entidades juntas; este es el tramo restante.
- Fichas: CK-13.

## Out of scope (explícito)

- La reconciliación de schemas 9↔4 (eso fue BL-02).

## Riesgos / Asunciones

- **Asunción:** el objeto estará poblado con objetivos y brechas (gatillo) antes de generar la proyección.
- **Riesgo:** perder curaduría manual valiosa al generar — **Mitigación:** validar que la proyección generada cubre lo que hoy se cura a mano.

## Próximo paso

`→ /po lee este archivo → produce 01-spec.md del generador de proyección negocio.yaml desde el objeto.`

> Procedencia (CK-19): backlog item **BL-19** · estado legacy **pendiente**.
