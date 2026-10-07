# 00-story.md — Consultio = clon de DevStudio + adaptación propia (PM)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: construir-consultio-clon-devstudio
type: service-story
module: consultio
capability: consultio/construir-consultio-clon-devstudio
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/consultio/construir-consultio-clon-devstudio.yaml"
  module_doc: "../../../modules/consultio.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** fabricante (Alpaca Púrpura)
**Quiero** clonar DevStudio y adaptarlo como Consultio con nombre e identidad propios
**Para** dar al consultor una app de levantamiento que carga los arneses del método sobre Claude Code local (BYO licencia)

## Por qué importa

Sin Consultio el consultor no tiene herramienta para operar el método en el cliente. En el rediseño CK-18 todo el levantamiento pasa por el consultor (murió N7, los agentes efímeros), así que Consultio es la puerta de entrada del plano Edge. Es además la base de la que dependen BL-16 (operar el método) y BL-17 (publicar al Repositorio Oficial): sin el clon no hay dónde colgar esas capabilities.

## Outcome esperado

- Consultio existe como clon de DevStudio con nombre e identidad propios (firmado D4, CK-18).
- Se cuelga de Claude Code local con licencia BYO del consultor.
- Carga los arneses del método que produce Arnesia (N15).
- Alcance y stack heredan del clon de DevStudio (no se reinventan).

## Antecedentes / Contexto

- Origen (verbatim): "operador, sesión CK-11 · redefinido CK-18".
- Ficha CK-11: método del auditor completado desde el legacy; el ítem nace aquí como "App del Auditor".
- Ficha CK-18: rediseño Fábrica + Organización instalada; renombrado a Consultio (D4), derogado el límite de IP "el método nunca al cliente" (D1) → el método viaja en arneses.
- N14 (Consultio, App del Consultor) es clon de DevStudio (N5); N8 es el motor común.

## Out of scope (explícito)

- Operar el método m1·m2·m3 y construir el mapa completo → BL-16.
- Publicar al Repositorio Oficial ("deploy de procesos") → BL-17.
- La fábrica de arneses que Consultio consume → BL-26 (Arnesia).

## Riesgos / Asunciones

- **Riesgo:** DevStudio aún no está terminado y Consultio se clona "cuando esté terminado" — **Mitigación:** secuenciar tras DevStudio; el alcance/stack heredan del clon, no se adelantan.
- **Asunción:** el modelo BYO licencia (Claude Code local) es viable para el consultor y se sostiene contractualmente (licencia + contrato, CK-18/D1).

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/consultio/construir-consultio-clon-devstudio/story.yaml`

> Procedencia (CK-19): backlog item **BL-15** · estado legacy **pendiente**.
