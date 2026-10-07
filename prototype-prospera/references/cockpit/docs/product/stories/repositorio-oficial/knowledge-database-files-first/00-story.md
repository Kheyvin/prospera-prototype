---
story_id: knowledge-database-files-first
type: service-story
module: repositorio-oficial
capability: repositorio-oficial/knowledge-database-files-first
links:
  story_yaml: "./story.yaml"
  capability_yaml: "../../../capabilities/repositorio-oficial/knowledge-database-files-first.yaml"
  module_doc: "../../../modules/repositorio-oficial.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** trabajador operativo (o arnés que lo asiste)
**Quiero** el know-how tácito de mi rol servido desde una Knowledge Database files-first (knowledge-as-code en el Repositorio Oficial)
**Para** ejecutar mi trabajo con el conocimiento organizacional a la mano, sin que ese saber se pierda

## Por qué importa

El know-how tácito por rol es un activo organizacional que hoy no tiene casa: vive en las cabezas de las personas y se pierde con la rotación. CK-18 (D5) lo declaró pendiente pero "será importante pronto".

La apuesta es files-first: knowledge-as-code (markdown + frontmatter) dentro del repo, con retrieval agentico y captura mediante una skill de cristalización que abre PR. Esto preserva el conocimiento sin sobre-invertir en infraestructura pesada: RAG híbrido solo se justifica al crecer (+200-500 notas), y NO se adopta vector DB antes de que exista demanda real.

## Outcome esperado

- Know-how tácito por rol capturado como knowledge-as-code (markdown + frontmatter) en el Repositorio Oficial y servido al arnés.
- Flujo de captura vía skill de cristalización que produce un PR (revisable, versionado).
- Retrieval files-first/agentic como default; RAG híbrido pospuesto hasta crecer (+200-500 notas); sin vector DB antes de demanda.

## Antecedentes / Contexto

- Nace en CK-18 (D5): declarada pendiente, "será importante pronto".
- Vive dentro del Repositorio Oficial (N6, BL-21) como uno de sus contenidos (Knowledge DB).
- SOTA de la pieza en `docs/research/rediseno-total/02`.
- Investigación aplicada al activarse (prioridad TBD).
- Origen (verbatim): "operador CK-18 (D5, #8)".

## Out of scope (explícito)

- El repositorio en sí (Forgejo self-hosted + BD vs archivos) es BL-21.
- Adopción de vector DB / RAG híbrido antes de que la demanda (+200-500 notas) lo justifique: explícitamente fuera hasta ese punto.

## Riesgos / Asunciones

- **Riesgo:** sobre-ingeniería prematura (vector DB, RAG) sin demanda — **Mitigación:** files-first por default; RAG híbrido solo al superar el umbral de notas.
- **Asunción:** la captura del conocimiento tácito puede sostenerse vía skill de cristalización + PR sin fricción excesiva para el trabajador.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente (brand-expert, copilot-expert, etc) → produce 01-spec.md + actualiza/crea product/stories/{module}/{story-id}.yaml`

> Procedencia (CK-19): backlog item **BL-27** · estado legacy **pendiente**.
