# 00-story.md — Arnesia: pipeline arnés-por-rol desde el objeto normalizado (anti-drift)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: arnesia-pipeline-arnes-por-rol
type: service-story
module: fabricante
capability: arnesia-pipeline-arnes-por-rol
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/fabricante/arnesia-pipeline-arnes-por-rol.yaml"
  module_doc: "../../../modules/fabricante.md"
  release_yaml: "../../../releases/F1.yaml"
  ledger: "../../../../../LEDGER.md"
---

## Job-To-Be-Done

**Como** fabricante (nosotros, N15 = Arnesia)
**Quiero** compilar el skill/plugin de cada rol-en-proceso desde el objeto normalizado, con un gate que rechaza editar el generado
**Para** entregar arneses siempre sincronizados con el documento humano, sin drift entre lo que se ejecuta y lo que se lee

## Por qué importa

El arnés que ejecuta el trabajador y el documento que lee la persona tienen que salir de la
MISMA fuente (el objeto normalizado). Si se editan por separado, divergen y el sistema deja de
decir la verdad sobre cómo opera la organización. Arnesia resuelve esto compilando ambos desde
una fuente única, al estilo anti-drift de Inkeep, con un gate que rechaza la edición del artefacto
generado. El mapeo es directo: skill = procedimiento, plugin = rol, marketplace = mapa de procesos.

## Outcome esperado

- Un pipeline que genera skill (procedimiento) + plugin (rol) por rol-en-proceso desde el objeto normalizado.
- Marketplace de arneses que refleja el mapa de procesos.
- Gate anti-drift que rechaza cualquier edición manual del generado.
- Documento humano y arnés ejecutable garantizados coherentes por construcción (misma fuente).

## Antecedentes / Contexto

- NUEVO en CK-18 (rediseño Fábrica + Organización instalada). Nodo N15 (Arnesia, fábrica de arneses).
- Origen: operador CK-18 (#3, #7).
- SOTA de la pieza: `docs/research/rediseno-total/07`.
- Patrón anti-drift declarado transversal en el sistema (ver gate CK-17).

## Out of scope (explícito)

- La distribución/telemetría/licencias de los arneses producidos → story `distribucion-telemetria-licencias-n3` (BL-25).
- La operación del método que produce el objeto normalizado (Consultio, BL-15/BL-16).
- El Repositorio Maestro (N2) como almacén del método/arneses/código.

## Riesgos / Asunciones

- **Riesgo:** el generador queda desalineado con el schema del objeto normalizado — **Mitigación:** gate de validación en el mismo pipeline.
- **Asunción:** el objeto normalizado es fuente suficiente para derivar procedimiento y rol.
- **Asunción:** el mapeo skill=procedimiento / plugin=rol / marketplace=mapa de procesos se sostiene en la práctica.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/fabricante/arnesia-pipeline-arnes-por-rol/story.yaml`

> Procedencia (CK-19): backlog item **BL-26** · estado legacy **pendiente**.
