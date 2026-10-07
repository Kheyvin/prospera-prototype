# 00-story.md — Módulo Gestión de Cambios (ISO)

---
story_id: modulo-gestion-cambios-iso
type: ui-story
module: cockpit
capability: modulo-gestion-cambios-iso
links:
  story_yaml: "../../stories/cockpit/modulo-gestion-cambios-iso.yaml"
  capability_yaml: "../../capabilities/cockpit/modulo-gestion-cambios-iso.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** Analista de Calidad (N19)
**Quiero** un módulo de Gestión de Cambios que gobierne solicitud→aprobación→publicación de versiones sobre el Repositorio Oficial
**Para** mantener lo oficial conforme a ISO §7.5/§6.3 sin exponer git

## Por qué importa

Nuevo en CK-18. El Analista de Calidad (N19) es quien mantiene lo oficial. Sin un módulo de Gestión
de Cambios no hay control formal de versiones documentales (ISO §7.5/§6.3): no hay flujo de
solicitud→aprobación→publicación, ni firma trazable, ni estados de documento. El módulo usa git de
backend pero oculta git al usuario, y persiste la firma en DB además de git.

## Outcome esperado

- Flujo solicitud→aprobación→publicación de versiones sobre el Repositorio Oficial.
- Entidades modeladas: SolicitudDeCambio · VersiónDeDocumento (borrador/vigente/obsoleto) · Aprobación · Acuse · RevisiónPeriódica.
- Git de backend + UI que oculta git; firma persistida en DB además de git.
- Conformidad con ISO §7.5/§6.3.

## Antecedentes / Contexto

- Origen (verbatim): "operador CK-18 (D-9 del diagrama)".
- Ficha: CK-18.
- SOTA: research/rediseno-total/06.
- Publicación desde Consultio a N6 se une aquí (BL-17); capability de preparación para auditoría (BL-14) usa esto como evidencia documental.

## Out of scope (explícito)

- La construcción del Repositorio Oficial confidencial en sí (BL-21).
- La preparación para auditoría / gap-check ISO (BL-14).

## Riesgos / Asunciones

- **Asunción:** git como backend cubre el versionado; la DB solo persiste firma/estado derivados.
- **Riesgo:** exponer complejidad de git al usuario — **Mitigación:** UI que oculta git por completo.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/modulo-gestion-cambios-iso.yaml`

> Procedencia (CK-19): backlog item **BL-24** · estado legacy **pendiente**.
