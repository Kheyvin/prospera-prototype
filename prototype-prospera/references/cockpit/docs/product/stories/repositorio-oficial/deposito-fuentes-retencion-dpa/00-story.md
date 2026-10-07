---
story_id: deposito-fuentes-retencion-dpa
type: service-story
module: repositorio-oficial
capability: repositorio-oficial/deposito-fuentes-retencion-dpa
links:
  story_yaml: "./story.yaml"
  capability_yaml: "../../../capabilities/repositorio-oficial/deposito-fuentes-retencion-dpa.yaml"
  module_doc: "../../../modules/repositorio-oficial.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** responsable de datos de la organización (N12, responsabilidades R2/R3)
**Quiero** un Depósito de fuentes (landing zone) cifrado y auditado donde aterriza el crudo del levantamiento y que se destruye una vez construido el mapa
**Para** materializar la cláusula de no-retención del DPA y separar el crudo de la verdad curada

## Por qué importa

Al cerrar BL-07 (auditoría CK-18) se detectó un hueco: N12 (responsabilidades R2/R3) no tenía casa en el backlog, a diferencia de los demás nodos no-construidos de la Organización. Es la zona donde aterriza el crudo del levantamiento —N9 deposita, Consultio procesa— y hoy no existe.

Sin este depósito no hay dónde poner el material crudo (binario/voluminoso, por eso NO va en git) ni cómo cumplir contractualmente: exige cifrado at-rest, auditoría de quién depositó qué, y DESTRUCCIÓN post-mapa que materializa la cláusula de no-retención del DPA. Se mantiene deliberadamente separado de N6 (la verdad curada).

## Outcome esperado

- Landing zone (N12) operativa donde N9 deposita el crudo del levantamiento y Consultio lo procesa.
- Cifrado at-rest y audit trail de quién depositó qué.
- Destrucción post-mapa automatizada que materializa la cláusula de no-retención del DPA.
- Almacenamiento fuera de git (binarios/voluminoso), separado del Repositorio Oficial (N6).

## Antecedentes / Contexto

- Hueco detectado al cerrar BL-07 (auditoría CK-18): N12 no tenía casa en el backlog.
- Ancla de arquitectura: N12, responsabilidades R2/R3 (ver `NODOS.md`).
- Separado a propósito de N6 (verdad curada): el crudo no es la verdad.
- Se diseña con el primer despliegue real.
- Origen (verbatim): "auditoría cierre BL-07 · NODOS.md N12/R3".

## Out of scope (explícito)

- El Repositorio Oficial (verdad curada, git self-hosted) es BL-21 — el depósito está deliberadamente separado de él.
- El procesamiento del crudo hacia el objeto normalizado lo hace Consultio (BL-16), no el depósito.

## Riesgos / Asunciones

- **Riesgo:** que el crudo persista más allá del mapa y viole el DPA — **Mitigación:** destrucción post-mapa automatizada + audit trail.
- **Asunción:** el material crudo es binario/voluminoso y no versionable en git; el diseño fino se cierra con el primer despliegue real.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente (brand-expert, copilot-expert, etc) → produce 01-spec.md + actualiza/crea product/stories/{module}/{story-id}.yaml`

> Procedencia (CK-19): backlog item **BL-29** · estado legacy **pendiente**.
