---
story_id: construir-lakehouse-dlt-ducklake
type: service-story
module: lakehouse
capability: lakehouse/construir-lakehouse-dlt-ducklake
links:
  story_yaml: "./story.yaml"
  capability_yaml: "../../../capabilities/lakehouse/construir-lakehouse-dlt-ducklake.yaml"
  module_doc: "../../../modules/lakehouse.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** Cockpit (N13) que necesita mostrar "cómo vamos día a día"
**Quiero** un Data Lakehouse (dlt + DuckLake) que reúna la operación de todos los sistemas de la organización (N18)
**Para** disponer de la operación real consolidada y nutrir las vistas de Cockpit

## Por qué importa

Cockpit necesita cruzar estructura (objeto normalizado de N6) contra operación para responder "cómo vamos día a día". Sin un lakehouse que consolide la operación real de todos los sistemas de la organización (N18), ese cruce no tiene insumo.

El rediseño CK-18 fija un stack deliberadamente pragmático: dlt para la ingesta, DuckLake/DuckDB como catálogo (SQLite→Postgres), Excel tratado como fuente de primera clase, DuckDB embebido en el binario Go y orquestación con cron/systemd. Corre por default en la infra del cliente; hostearlo nosotros es una opción comercial (D3). Iceberg/Spark/K8s se descartan explícitamente como sobreingeniería para este contexto.

## Outcome esperado

- Lakehouse operativo que reúne la operación de todos los sistemas de la org (N18) para nutrir Cockpit.
- Stack: dlt (ingesta) + DuckLake/DuckDB (catálogo SQLite→Postgres), Excel de primera clase, DuckDB embebido en el Go, orquestación cron/systemd.
- Despliegue default en infra del cliente; hosteado por nosotros disponible como opción comercial.
- Sin Iceberg/Spark/K8s (descartados por sobreingeniería).

## Antecedentes / Contexto

- Nace del rediseño CK-18 (Fábrica + Organización instalada): el Data Lakehouse (N16) nutre a Cockpit con la operación día a día.
- SOTA de la pieza en `docs/research/rediseno-total/03`.
- Decisión D3: default en infra del cliente, hosteo por nosotros = opción comercial.
- Origen (verbatim): "operador CK-18".

## Out of scope (explícito)

- Los conectores de ingesta concretos por sistema (SaaS/ERP/a medida/Excel) son BL-18, story `conectores-ingesta-por-sistema`.
- El cruce estructura × operación / esquema de indicadores en Cockpit es BL-28 (módulo cockpit).
- Iceberg/Spark/K8s: fuera por diseño.

## Riesgos / Asunciones

- **Riesgo:** tentación de sobre-ingeniería (Iceberg/Spark/K8s) — **Mitigación:** stack fijado dlt + DuckLake/DuckDB, descarte explícito de lo pesado.
- **Asunción:** la infra del cliente puede correr el lakehouse embebido (DuckDB en el Go, cron/systemd); el hosteo propio queda como opción comercial.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente (brand-expert, copilot-expert, etc) → produce 01-spec.md + actualiza/crea product/stories/{module}/{story-id}.yaml`

> Procedencia (CK-19): backlog item **BL-22** · estado legacy **pendiente**.
