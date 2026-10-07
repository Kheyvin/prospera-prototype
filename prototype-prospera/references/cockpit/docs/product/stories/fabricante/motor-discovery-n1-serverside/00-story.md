# 00-story.md — Motor de Discovery (N1) como servicio server-side

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: motor-discovery-n1-serverside
type: service-story
module: fabricante
capability: motor-discovery-n1-serverside
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/fabricante/motor-discovery-n1-serverside.yaml"
  module_doc: "../../../modules/fabricante.md"
  release_yaml: "../../../releases/F1.yaml"
  ledger: "../../../../../LEDGER.md"
---

## Job-To-Be-Done

**Como** fabricante (nosotros)
**Quiero** un Motor de Discovery (N1) como servicio multi-tenant server-side
**Para** razonar el levantamiento en el servidor — **DEROGADO**: el razonamiento vive ahora como arneses sobre Claude Code local

## Por qué importa

DEROGADO en CK-18. El motor de discovery ya NO se construye como servicio multi-tenant
server-side: su razonamiento vive como arneses (N2/Consultio) sobre Claude Code local. El
ítem se conserva como lápida para no volver a proponerlo. El trabajo real que lo sustituye es
BL-26 (arneses, Arnesia) + BL-15/BL-16 (Consultio).

## Outcome esperado

- (No aplica — story derogado.) El outcome se persigue por otra vía: arneses + Consultio.

## Antecedentes / Contexto

- Heredado de VISION §TBD · CK-10; DEROGADO en CK-18 (rediseño Fábrica + Organización instalada).
- N1 (Motor de Discovery server-side) figura entre los nodos muertos de CK-18: vive como arneses.
- Reemplazos vigentes: BL-26 (Arnesia, arneses), BL-15 y BL-16 (Consultio).

## Out of scope (explícito)

- Todo — el story está derogado; no se ejecuta.
- El razonamiento del levantamiento se cubre vía arneses (BL-26) y Consultio (BL-15/16).

## Riesgos / Asunciones

- **Riesgo:** que alguien re-proponga el servicio server-side — **Mitigación:** esta lápida documenta la derogación y su reemplazo.
- **Asunción:** los arneses sobre Claude Code local cubren el razonamiento que antes se pensaba server-side.

## Próximo paso

`→ Ninguno. Story derogado (CK-18). Ver BL-26 (arneses) + BL-15/BL-16 (Consultio) para el trabajo real.`

> Procedencia (CK-19): backlog item **BL-13** · estado legacy **derogado**.
