---
story_id: conectores-ingesta-por-sistema
type: service-story
module: lakehouse
capability: lakehouse/conectores-ingesta-por-sistema
links:
  story_yaml: "./story.yaml"
  capability_yaml: "../../../capabilities/lakehouse/conectores-ingesta-por-sistema.yaml"
  module_doc: "../../../modules/lakehouse.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** integrador que conecta la operación de la organización
**Quiero** conectores de ingesta por sistema (SaaS/ERP/a medida/Excel) que alimenten el lakehouse desde los sistemas operacionales (N18)
**Para** llevar la operación real de la organización hasta Cockpit

## Por qué importa

El Data Lakehouse (BL-22) no sirve sin datos: los conectores concretos son el puente desde los sistemas operacionales (N18) hasta el lake. Este ítem se redefinió en CK-18 —antes era "conexión DevStudio/GitHub→Cockpit" (CK-08, derogado)— y ahora apunta a los conectores reales por sistema.

Por su naturaleza no se puede especificar en abstracto: se diseñan con el cliente real, sistema por sistema (cada SaaS/ERP/desarrollo a medida/Excel es distinto). El gatillo es el primer despliegue con datos de operación reales; de ahí que la prioridad sea TBD.

## Outcome esperado

- Conectores de ingesta que alimentan el lakehouse desde los sistemas operacionales (N18), por sistema.
- Cobertura de las clases de fuente esperadas: SaaS, ERP, sistemas a medida y Excel.
- Diseño por sistema, con el cliente real, disparado por el primer despliegue con datos de operación reales.

## Antecedentes / Contexto

- Redefinido en CK-18: antes "conexión DevStudio/GitHub→Cockpit" (CK-08, derogado); ahora conectores por sistema hacia el lakehouse.
- Depende conceptualmente del lakehouse (BL-22, N16) como destino de la ingesta.
- Ancla de arquitectura: sistemas operacionales N18.
- Gatillo: primer despliegue con datos de operación reales.
- Origen (verbatim): "CK-08 (derogado) · CK-16 · redefinido CK-18".

## Out of scope (explícito)

- La construcción del lakehouse en sí (dlt + DuckLake) es BL-22, story `construir-lakehouse-dlt-ducklake`.
- La vieja "conexión DevStudio/GitHub→Cockpit" (CK-08): derogada, no forma parte de este alcance.

## Riesgos / Asunciones

- **Riesgo:** intentar especificar conectores genéricos sin cliente real — **Mitigación:** diseño por sistema, disparado por el primer despliegue con datos reales.
- **Asunción:** las fuentes relevantes caen en las clases SaaS/ERP/a medida/Excel; cada despliegue definirá el conjunto concreto.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente (brand-expert, copilot-expert, etc) → produce 01-spec.md + actualiza/crea product/stories/{module}/{story-id}.yaml`

> Procedencia (CK-19): backlog item **BL-18** · estado legacy **pendiente**.
