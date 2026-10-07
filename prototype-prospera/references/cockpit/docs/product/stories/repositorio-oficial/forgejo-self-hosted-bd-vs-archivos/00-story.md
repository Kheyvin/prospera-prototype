---
story_id: forgejo-self-hosted-bd-vs-archivos
type: service-story
module: repositorio-oficial
capability: repositorio-oficial/forgejo-self-hosted-bd-vs-archivos
links:
  story_yaml: "./story.yaml"
  capability_yaml: "../../../capabilities/repositorio-oficial/forgejo-self-hosted-bd-vs-archivos.yaml"
  module_doc: "../../../modules/repositorio-oficial.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** organización cliente (N6)
**Quiero** un Repositorio Oficial confidencial (Forgejo self-hosted en mi propia infra) que contenga arneses, metadata organizada, documentos oficiales versionados y knowledge
**Para** gobernar la verdad curada de mi organización como fuente única, sin depender de un SaaS externo ni ceder confidencialidad

## Por qué importa

La verdad curada de la organización (procesos, arneses, documentos oficiales) no puede vivir en GitHub ni en terceros: es confidencial y estratégica. El rediseño CK-18 abandonó GitHub como Repositorio Oficial en favor de git self-hosted en la infra del cliente.

La decisión de fondo es de arquitectura de datos: git/archivos = SSoT, y cualquier base de datos es un índice derivado reconstruible (nunca SSoT). Esto evita lock-in, garantiza que todo pueda reconstruirse desde los archivos, y permite backups verificables (`forgejo dump` + restic). No cerrarlo deja al cliente sin un lugar propio y confiable para su conocimiento oficial.

## Outcome esperado

- Git self-hosted (Forgejo en Docker) corriendo en la máquina del cliente, con backups (`forgejo dump` + restic).
- El repo contiene: Arneses, Metadata Organizada (objeto normalizado), Documentos Oficiales versionados (fuente + PDF derivado) y Knowledge DB (BL-27).
- Invariante verificable: cualquier BD presente es índice derivado reconstruible desde git/archivos; nunca la fuente de verdad.

## Antecedentes / Contexto

- Nace del rediseño CK-18 (Fábrica + Organización instalada): el Repositorio Oficial deja de ser GitHub y pasa a git self-hosted confidencial en la infra del cliente.
- SOTA de la pieza en `docs/research/rediseno-total/01`.
- Se diseña con el primer despliegue real.
- Origen (verbatim): "operador CK-18 (D3 base)".

## Out of scope (explícito)

- La Knowledge Database como tal (know-how organizacional files-first) es BL-27, story `knowledge-database-files-first`.
- El Depósito de fuentes / landing zone de crudo (N12) es BL-29, story `deposito-fuentes-retencion-dpa` — deliberadamente separado de N6 (verdad curada).
- La publicación desde Consultio a N6 (deploy de procesos) es BL-17.

## Riesgos / Asunciones

- **Riesgo:** que una BD (índice) se trate implícitamente como SSoT y provoque divergencia — **Mitigación:** hacer explícito y verificable que git/archivos = SSoT y toda BD es reconstruible.
- **Asunción:** el cliente aporta la infra (máquina/Docker) donde corre Forgejo; el diseño fino se cierra con el primer despliegue real.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente (brand-expert, copilot-expert, etc) → produce 01-spec.md + actualiza/crea product/stories/{module}/{story-id}.yaml`

> Procedencia (CK-19): backlog item **BL-21** · estado legacy **pendiente**.
