# 00-story.md — Cruce estructura × operación (esquema de indicadores)

---
story_id: cruce-estructura-operacion-indicadores
type: ui-story
module: cockpit
capability: cruce-estructura-operacion-indicadores
links:
  story_yaml: "../../stories/cockpit/cruce-estructura-operacion-indicadores.yaml"
  capability_yaml: "../../capabilities/cockpit/cruce-estructura-operacion-indicadores.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** usuario de Cockpit
**Quiero** ver "cómo vamos día a día" cruzando la operación del lakehouse (N16) contra la estructura (objeto normalizado de N6) por objetivo/proceso/rol/nivel
**Para** monitorear el desempeño real del negocio

## Por qué importa

Nuevo en CK-18. Es el puente entre estructura y operación: Cockpit debe mapear la operación que
reúne el lakehouse (N16) contra la estructura (objeto normalizado de N6) para mostrar "cómo vamos
día a día" por objetivo/proceso/rol/nivel. Sin este cruce, Cockpit no puede exhibir indicadores
reales de avance. Se diseña con el primer consumidor real.

## Outcome esperado

- Cruce operación (N16) × estructura (objeto normalizado N6) por objetivo/proceso/rol/nivel.
- Vista "cómo vamos día a día" con indicadores reales.
- DuckDB embebido para leer el lake.

## Antecedentes / Contexto

- Origen (verbatim): "operador CK-18".
- Ficha: CK-18.
- SOTA: research/rediseno-total/03 (DuckDB embebido para leer el lake).
- Depende de datos: lakehouse (N16, BL-22) y objeto normalizado del Repositorio Oficial (N6).
- Se diseña con el primer consumidor real.

## Out of scope (explícito)

- Construir el lakehouse en sí (BL-22) y sus conectores de ingesta (BL-18).
- El esquema del objeto normalizado (vive en N6 / sistema).

## Riesgos / Asunciones

- **Asunción:** el lakehouse (N16) y el objeto normalizado (N6) están disponibles para cruzar.
- **Riesgo:** diseñar en abstracto sin consumidor — **Mitigación:** el ítem indica diseñarlo con el primer consumidor real.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/cruce-estructura-operacion-indicadores.yaml`

> Procedencia (CK-19): backlog item **BL-28** · estado legacy **pendiente**.
