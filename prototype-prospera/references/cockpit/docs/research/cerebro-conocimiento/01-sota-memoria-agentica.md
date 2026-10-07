# 01 · SOTA — sistemas de memoria/conocimiento para agentes (verificado 2026-07-23)

> Lente de evaluación (nuestro dogma): git como SSoT (la BD jamás) · files-first con umbral firmado
> para RAG · provenance obligatorio por dato · anti-contradicción con ciclo de vida explícito ·
> build determinístico + gate anti-drift. No buscamos "el mejor RAG": buscamos patrones compatibles
> con organization-as-code. Métricas verificadas por API de GitHub / papers / docs primarios.

## A · Herramientas nativas del ecosistema Claude Code

| Sistema | Qué es | Modelo | Construcción | Contradicciones | Git-friendly | Madurez |
|---|---|---|---|---|---|---|
| **Graphify** (Graphify-Labs) | codebase → grafo consultable (skill `/graphify` + MCP) | grafo con **provenance por arista** (`EXTRACTED`/`INFERRED`/`AMBIGUOUS`) + ubicación fuente; sin temporal | **determinista sin LLM para código** (tree-sitter AST 36 lenguajes, Leiden); LLM solo docs/PDF; hooks post-commit reconstruyen | regeneración desde la fuente (grafo derivado, no acumulado) | **sí** — `graph.json` rutas relativas, diseñado para commitear | 94k★, Apache-2.0, YC S26, muy vivo |
| **claude-mem** (thedotmack) | memoria conversacional automática | sesiones→observaciones→resúmenes (plano, sin grafo) | **100% automática** por 5 hooks (SessionStart/PostToolUse/SessionEnd + compresión IA) | ninguna — acumula sin poda | no (SQLite+Chroma locales) | 88k★, Apache-2.0, push diario |
| **basic-memory** (basicmachines) | knowledge-as-markdown + grafo vía MCP | notas MD = entidades; observaciones `[categoría]` + relaciones tipadas `[[wikilink]]`; índice SQLite regenerable | curada — el LLM escribe notas con la sintaxis; humano edita el mismo MD | manual (editar la nota; git = historia) | **máximo** — texto plano, índice descartable | 3.5k★, **AGPL-3.0** (ojo comercial) |
| **MCP memory oficial** | referencia educativa | entidad/relación-tipada/observación-atómica en JSONL | agente-dirigida por prompt | ninguna | técnicamente sí | referencia, no producto |
| **supermemory** | plugin marketplace, nube | memorias scoped por repo | SessionEnd + extracción por señales léxicas; **recall condicional** (decide por turno si buscar) | ranking | no (nube) | 2.7k★, MIT |
| **ByteRover** (ex Cipher) | REPL de conocimiento curado | "context tree" **versionado git-like** (branch/commit/merge), datos anclados a rutas de código | `/curate` explícito | versionado | semántica git propia | 4.9k★, **Elastic License (no OSS)** |

## B · Plataformas de memoria de agentes (nivel producción)

| | **Graphiti/Zep** | **mem0** | **Letta (ex MemGPT)** | **cognee** |
|---|---|---|---|---|
| Modelo | grafo 3 niveles: **episodios no-lossy** → entidades/facts → comunidades | hechos NL + grafo opcional | bloques en contexto + archivos | grafo+vector **tipado contra ontología declarada** (Pydantic/OWL) |
| Temporalidad | **bi-temporal 4 campos**: `valid_at/invalid_at` (mundo) × `created_at/expired_at` (sistema) — "qué sabíamos el día X" | 1 timestamp | no estructural (git log) | opt-in (grafo de eventos) |
| Contradicciones | **edge invalidation**: LLM detecta candidata; **solo hay contradicción si los rangos de validez se solapan**; `invalid_at ← valid_at` del nuevo; **nada se borra**; vigencia = consulta | 2025: LLM decide ADD/UPDATE/DELETE/NOOP al escribir → **2026: LO ABANDONÓ** (ADD-only single-pass + ranking en lectura) | el agente sobreescribe; defrag de fondo | sin mecanismo (punto ciego) |
| Retrieval | cosine+BM25+BFS+rerank; ~1.6k tokens (~71× menos que full-context) | multi-señal; ~7k tokens | **tools grep/open sobre archivos** | auto-ruteo vector/grafo |
| Costo dominante | write (muchas llamadas LLM por episodio) | bajo | turnos de tool-calling | write (LLM por chunk) |
| Storage | Neo4j/FalkorDB — **anti-git** | vector store + Neo4j | Postgres, y **memoria = repo git** (Context Repositories 2026: commit por cambio, subagentes en worktrees, filetree siempre-en-prompt) | el más plugable |
| Licencia/★ | Apache-2.0 / 29k | Apache-2.0 / 61k | Apache-2.0 / 24k | Apache-2.0 / 29k |

**La guerra de benchmarks (moraleja):** mem0 vs Zep se destruyeron mutuamente los números de LoCoMo
(configuración adversarial cruzada, categorías infladas), y Letta remató: **un agente con solo
grep/open sobre archivos sacó 74.0% en LoCoMo, superando a los frameworks en su propio benchmark**.
Ningún número de vendor de memoria es confiable para elegir plataforma.

## C · Familia GraphRAG (grafo desde documentos) + motores embebibles

- **Microsoft GraphRAG**: extracción LLM entidades/relaciones + gleanings → Leiden jerárquico →
  community reports LLM. Carísimo (evaluación independiente: $51–389/dataset con GPT-4o; caso
  extremo $33k; global search ≈ 610k tokens/query). **La propia Microsoft capituló**: LazyGraphRAG
  (indexa al **0.1%** del costo difiriendo el LLM al query time, calidad igual o mejor) y
  FastGraphRAG (NLP clásico, sin LLM en build). La joya robable: **resúmenes jerárquicos
  pre-computados** — lo único que grep no da (la pregunta global/agregativa).
- **LightRAG** (EMNLP 2025, 38k★, superó al original): sin Leiden ni reports; **update incremental
  = unión de subgrafos, jamás reconstrucción global**; retrieval dual-level (entidades concretas vs
  temas); **aristas como documentos de primera clase** con descripción recuperable; storage default
  archivos (JSON+GraphML) — el más git-friendly de la familia.
- **Motores embebibles — lección de mortalidad**: **Kuzu archivado oct-2025** (adquirido por Apple)
  — un motor respaldado por una empresa muere de un día para otro; forks (LadybugDB) jóvenes;
  DuckPGQ inmaduro; Cayley muerta 2019. Escalera correcta: (1) grafo en RAM en el binario Go
  (gonum — trae Louvain determinístico — o dominikbraun/graph vendoreado), (2) SQLite patrón
  simple-graph (2 tablas + CTEs recursivas, driver Go puro sin cgo) como **índice derivado
  generado**, (3) motor dedicado: nunca con la evidencia actual.

## D · La evidencia 2026 que cierra el debate

1. **Claude Code eliminó el vector search y lo reemplazó por grep** — "outperformed everything. By
   a lot" (Boris Cherny); Cursor, Windsurf, Cline, Devin siguieron.
2. **Amazon Science, AAAI 2026** ("Keyword search is all you need", arXiv:2602.23368): agentes con
   búsqueda por keywords ≈ >90% del desempeño de RAG **sin vector DB**.
3. **mem0 abandonó la resolución de contradicciones por LLM en el write path** (2026: ADD-only).
4. **Letta llegó a git**: Context Repositories = memoria como repo con commit por cambio.
5. **LazyGraphRAG**: build determinístico barato, inteligencia en query time.
6. **Anthropic** (memory tool = directorio de archivos client-side; context engineering: glob/grep
   > embeddings, "identificadores livianos + carga just-in-time", skills files-first).
7. **Evaluaciones académicas** (arXiv:2502.11371, 2506.05690): GraphRAG solo paga en multi-hop y
   sensemaking global sobre corpus grandes no-curados; RAG plano o files-first gana el resto.

**Convergencia de la industria:** escritura barata y append-ish con provenance · la inteligencia
cara va en consolidación de fondo y en lectura, nunca en el write path · el conocimiento vive en
archivos/git cuando un agente capaz lo navega · los índices son derivados y regenerables.

## Veredicto — "¿cuál es la mejor técnicamente?"

- **Mejor pieza de ingeniería del conocimiento:** **Graphiti/Zep** — el modelo bi-temporal de 4
  campos + invalidación por solapamiento temporal es el estado del arte real en "conocimiento que
  cambia sin contradecirse". PERO su storage (Neo4j) y su write path caro son incompatibles con
  organization-as-code. Se roba el modelo, no el sistema.
- **Mejor dirección estratégica:** **Letta Context Repositories** — llegó a NUESTRO lugar (git,
  archivos, índice-en-prompt, worktrees) desde el lado opuesto. Validación externa directa.
- **Mejor para conocimiento derivado de código:** **Graphify** — determinista + provenance por
  arista + gate de lectura (hook que redirige al grafo antes del grep crudo).
- **Adoptar tal cual:** ninguna. Nuestra base (SSoT YAML/MD en git + generador determinístico +
  gate anti-drift + GRAFO.md + grep dirigido + ciclo de vida explícito) está del lado correcto de
  TODA la evidencia 2026 — lo que falta no es una herramienta, son 4-5 patrones (ver
  `02-diseno-cerebro-v2.md`).

Fuentes completas: papers arXiv 2501.13956 (Zep) · 2504.19413 (mem0) · 2310.08560 (MemGPT) ·
2404.16130 (GraphRAG) · 2410.05779 (LightRAG) · 2502.11371 · 2506.05690 · 2602.23368 (Amazon) ·
repos github.com/{Graphify-Labs/graphify, thedotmack/claude-mem, basicmachines-co/basic-memory,
getzep/graphiti, mem0ai/mem0, letta-ai/letta, topoteretes/cognee, microsoft/graphrag,
HKUDS/LightRAG} · letta.com/blog/{context-repositories, sleep-time-compute,
benchmarking-ai-agent-memory} · anthropic.com/engineering/effective-context-engineering-for-ai-agents.
