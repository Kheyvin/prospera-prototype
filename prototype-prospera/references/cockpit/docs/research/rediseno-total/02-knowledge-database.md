# SOTA — Knowledge Database organizacional (know-how tácito servido por rol al arnés)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: capturar/servir el know-how propio de la org
> (decisiones, criterios, trucos, contexto histórico) a los agentes LLM de cada trabajador,
> filtrado POR ROL, a través del arnés. Es la pieza "punteada/dudosa" del diagrama del operador.

## Panorama
En 2025-2026 el péndulo giró a **"files-first" / agentic retrieval**: el agente navega markdown
plano (índice + notas por tema, carga bajo demanda) en vez de un pipeline RAG. Anthropic lo
formalizó con **Agent Skills** (SKILL.md + `references/` + progressive disclosure). Benchmark
LlamaIndex (ene-2026): con corpus pequeño el agente-sobre-filesystem gana a RAG en corrección
(8.4 vs 6.4) porque evita la pérdida de contexto del chunking; RAG recupera ventaja recién a
~100-1000 documentos. En paralelo maduraron búsqueda híbrida (BM25+vectores+RRF), grafos ligeros
(LightRAG vs GraphRAG) y memoria de agente (Zep > Mem0 en LongMemEval), pero les falta gobernanza.

## Comparativa
- **RAG vector self-hosted (Qdrant/pgvector/Chroma):** el chunking destruye lo que quieres preservar
  (criterios con su contexto). Sobredimensionado para cientos de notas curadas.
- **Híbrida BM25+vectores:** si haces RAG, hazlo así (el know-how tiene términos exactos donde lo
  semántico falla). Pero sigue siendo infra que operar en el cliente.
- **GraphRAG/LightRAG:** valor solo en multi-hop relacional; caro de construir/refrescar. Prematuro.
- **Agentic retrieval files-first:** encaja EXACTO — el arnés YA es markdown que Claude Code carga; el
  conocimiento vive en el mismo formato y viaja por el mismo conector. Cero infra nueva. Caso
  Hedgineer (may-2026) es casi este diseño: skills como capa de conocimiento por dominio.
- **Memoria de agentes (Letta/Zep/Mem0):** resuelven memoria conversacional por usuario, no know-how
  curado y auditable. El *patrón* de captura sí sirve; las plataformas, no aún.

## Recomendación
**Knowledge-as-code en el Repositorio Oficial (git).** Estructura `conocimiento/<proceso>/<rol>/`
con notas markdown atómicas (una decisión/criterio/truco por archivo, frontmatter: fecha, autor,
rol, proceso, vigencia) + `INDEX.md` por rol que el arnés carga como mapa. El agente hace grep/read
bajo demanda — patrón nativo de Claude Code, favorecido por los benchmarks a esta escala.

**Filtrado por rol = carpetas + empaquetado, no ACL en retriever.** El arnés de cada puesto declara
qué carpetas monta (su rol + capas comunes del proceso). Confidencial real → repos separados con
permisos por equipo; el control lo da la plataforma (N6), no una capa nueva.

**Captura (donde casi todos fallan):** skill de "cristalización" en el arnés — al cerrar tarea, el
agente detecta aprendizajes y **propone** una nota → PR al repo de conocimiento → el dueño del rol
aprueba. Humano en el loop = calidad; PR = trazabilidad. Es el patrón memory de Claude Code elevado
a organizacional (arXiv jul-2025: agentes extrayendo tacit knowledge logran 94.9% recall). Bonus:
telemetría de qué notas se consultan para podar lo muerto.

**Crecimiento:** cuando un rol supere ~200-500 notas o la navegación se vuelva lenta → búsqueda
híbrida (pgvector + BM25 + RRF en Postgres del cliente, tool MCP) ENCIMA del repo, que sigue siendo
SSoT. El índice es desechable; los archivos no.

## Qué diferir
Vector DB dedicada, GraphRAG/LightRAG, plataformas de memoria, ACL en retrieval, ingesta automática
sin revisión humana.

## Fuentes (2026-07-08)
- LlamaIndex, *Did filesystem tools kill vector search?* (2026-01-13)
- Hedgineer, *Company-wide knowledge layer with Claude Skills* (2026-05-12)
- Anthropic, *Equipping agents with Agent Skills* (2025)
- Mem0/Zep/Letta comparativa (2026): particula.tech · atlan.com
- LightRAG vs GraphRAG vs Vector (2025): ragdollai.io
- HoneyBee RBAC for vector DBs (arXiv 2505.01538) · Tacit knowledge discovery (arXiv 2507.03811)
- Hybrid search BM25+vector+reranking (2026): digitalapplied.com · Amplify, *File systems for agents* (2026)
