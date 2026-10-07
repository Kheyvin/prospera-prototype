# 00-story.md — Colab Studio, app del trabajador operativo (PM)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: colab-studio-app-trabajador
type: service-story
module: colab-studio
capability: colab-studio/colab-studio-app-trabajador
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/colab-studio/colab-studio-app-trabajador.yaml"
  module_doc: "../../../modules/colab-studio.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** trabajador operativo (contador, analista)
**Quiero** una app que cargue los arneses de mi puesto (N roles) y enfoque mi trabajo diario
**Para** producir salidas (Excels) que nutren el lakehouse

## Por qué importa

Extiende el modelo de apps-sobre-Claude-Code (DevStudio/Consultio) al trabajador normal, no solo a devs y consultores. Sin Colab Studio la operación día a día no queda instrumentada: no hay quien cargue los arneses del puesto ni quien produzca las salidas (Excels) que alimentan el Data Lakehouse (N16) y, por tanto, a Cockpit. Es la pieza Edge que conecta el trabajo real de la organización con el cruce estructura × operación.

## Outcome esperado

- Existe una app (Colab Studio) para el trabajador operativo, en la familia DevStudio/Consultio.
- Carga los arneses del puesto del trabajador (N roles) y enfoca su trabajo diario.
- Produce salidas (Excels) que nutren el lakehouse (N16).
- Queda decidido si es clon de DevStudio o variante propia (se resuelve junto con Consultio, misma familia).

## Antecedentes / Contexto

- Origen (verbatim): "operador CK-18 (#6)".
- Ficha CK-18: rediseño Fábrica + Organización instalada; N17 (Colab Studio) es la app del trabajador en el plano Edge, sobre N8 (motor común) y Claude Code local.
- Misma familia que Consultio (N14, BL-15) y DevStudio (N5): la decisión clon-vs-variante se toma junto con Consultio.
- Aguas abajo: las salidas alimentan el Data Lakehouse (BL-22) y el cruce estructura × operación en Cockpit (BL-28).

## Out of scope (explícito)

- La app del consultor (Consultio) → BL-15/BL-16/BL-17.
- Construir el Data Lakehouse que consume las salidas → BL-22.
- Los conectores de ingesta por sistema → BL-18.
- La fábrica de arneses por rol que Colab Studio consume → BL-26 (Arnesia).

## Riesgos / Asunciones

- **Riesgo:** decidir prematuramente clon vs variante propia — **Mitigación:** amarrar la decisión a la de Consultio (misma familia) para no bifurcar el stack.
- **Asunción:** los arneses por rol (Arnesia) y el lakehouse existirán como destino de las salidas cuando Colab Studio se construya; Excel es formato de salida de primera clase.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/colab-studio/colab-studio-app-trabajador/story.yaml`

> Procedencia (CK-19): backlog item **BL-23** · estado legacy **pendiente**.
