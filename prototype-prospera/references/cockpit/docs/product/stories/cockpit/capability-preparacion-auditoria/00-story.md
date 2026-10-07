# 00-story.md — Capability "preparación para auditoría" (gap-check vs cláusulas ISO)

---
story_id: capability-preparacion-auditoria
type: service-story
module: cockpit
capability: capability-preparacion-auditoria
links:
  story_yaml: "../../stories/cockpit/capability-preparacion-auditoria.yaml"
  capability_yaml: "../../capabilities/cockpit/capability-preparacion-auditoria.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** organización que busca conformidad ISO
**Quiero** una capability de "preparación para auditoría" que haga gap-check contra las cláusulas ISO
**Para** saber dónde estoy antes de una auditoría, sin emitir certificados

## Por qué importa

Declarada en CK-10, se activa solo con demanda real. Permite a la organización hacer un gap-check
contra las cláusulas ISO para prepararse ante una auditoría. Cockpit nunca emite certificados
(invariante I-05): solo prepara. Encaja con la Gestión de Cambios (BL-24) como evidencia documental.

## Outcome esperado

- Gap-check de la organización contra las cláusulas ISO.
- Reporte de preparación para auditoría (sin certificar).
- Reutiliza la Gestión de Cambios (BL-24) como evidencia documental.

## Antecedentes / Contexto

- Origen (verbatim): "VISION §ISO (CK-10)".
- Ficha: CK-10.
- Invariante I-05: nunca emite certificados.
- Encaja con la Gestión de Cambios (BL-24) como fuente de evidencia documental.
- Se activa solo con demanda real (prioridad tbd).

## Out of scope (explícito)

- Emitir certificados de conformidad (prohibido por I-05).
- El módulo de Gestión de Cambios en sí (BL-24), que provee la evidencia.

## Riesgos / Asunciones

- **Asunción:** la demanda real llegará; hasta entonces queda declarada sin construir.
- **Riesgo:** que se lea como certificación — **Mitigación:** invariante I-05 explícito, solo preparación/gap-check.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/capability-preparacion-auditoria.yaml`

> Procedencia (CK-19): backlog item **BL-14** · estado legacy **pendiente**.
