# 02 · Diseño — el cerebro v2 (patrones robados sobre la base v1)

> Base v1 (2026-07-22, commit `adb4e97`): SSoT YAML/MD (`methodologies.yaml` 45 cards + `proceso/**`
> + `nichos/`) → `gen_metodo.py` (validación + coherencia + 3 vistas generadas incl. `GRAFO.md`) →
> gate pre-commit → skills `/metodo` (consulta ≤6 nodos vía mapa+grep) y `/metodo-aprende` (ingesta
> anti-contradicción con ciclo de vida `vigente|superseded|descartada`).

## Los 10 patrones — decisión por patrón

| # | Patrón | Fuente | Decisión | Por qué |
|---|---|---|---|---|
| 1 | Bi-temporalidad (mundo vs sistema) + "contradicción solo si los rangos de validez se solapan" | Graphiti | **ADOPTAR (light)** | habilita "qué sabíamos/creíamos el día X" — oro para auditoría ISO del twin; barato: 2 campos opcionales |
| 2 | Detección de contradicción asistida por LLM, **resolución jamás automática** — mutación determinística auditable | Graphiti + retractación de mem0 | **YA LO TENEMOS** (`/metodo-aprende` + gate) — mantener como dogma firmado; la industria nos dio la razón | el líder del write-path-LLM (mem0) lo abandonó en 2026 |
| 3 | Episodios no-lossy: la fuente cruda se archiva y cada hecho la referencia | Graphiti | **ADOPTAR** | nuestro `fuente:+conf:` cita la fuente pero no la conserva; la bandeja de episodios cierra el loop (y es el patrón del Depósito N12 del twin) |
| 4 | Consolidación de fondo separada del hot path ("sleep-time"/"dreaming") con presupuesto anti-entropía | Letta | **ADOPTAR** | `/metodo-consolida` periódico: convierte los INFO/WARN del gate + huérfanas del GRAFO §2 en acciones; jamás en medio de una tarea |
| 5 | Índice-en-prompt (filetree de Letta ≡ GRAFO.md) + retrieval escalonado por presupuesto (3 capas de claude-mem) | Letta + claude-mem | **YA LO TENEMOS** — GRAFO (capa 1, ~160 líneas) → grep ancla (capa 2, gratis) → Read offset (capa 3, ~24 líneas/nodo) | validado además por doctrina Anthropic (glob/grep > embeddings) |
| 6 | Dos puertas de entrada: entidades concretas vs temas/preguntas | LightRAG dual-level | **ADOPTAR** | GRAFO hoy rutea por entidad (M-card/objeto); falta la puerta temática ("¿cómo priorizo brechas?" → M28+M22+O6) |
| 7 | Aristas como ciudadanas de primera clase con descripción recuperable | LightRAG | **YA LO TENEMOS** — `combina_con[].como` es exactamente esto (grep-able) | confirmar disciplina: el `como` nunca vacío (el gate ya lo exige) |
| 8 | Resúmenes jerárquicos pre-computados para la pregunta global | GraphRAG community reports | **DIFERIDO con umbral** | GRAFO.md ES el report nivel-raíz; niveles intermedios (resumen por familia generado) recién si el catálogo supera ~120 cards o el GRAFO ~400 líneas |
| 9 | Gleanings: re-pase "¿qué te faltó extraer?" en ingesta | GraphRAG | **ADOPTAR** (1 línea en `/metodo-aprende`) | barato, sube recall de la ingesta |
| 10 | Gate de lectura (hook que redirige al grafo antes del grep crudo, estilo `--strict`) | Graphify | **DIFERIDO** | hoy la description del skill basta; reevaluar si observamos sesiones ignorando el GRAFO |

**Rechazados con porqué:** vector DB / embeddings (evidencia D del 01 — grep gana a esta escala;
umbral firmado se mantiene: 200-500 notas) · motor de grafo dedicado (lección Kuzu: mortalidad por
adquisición; escalera RAM→SQLite-derivado) · resolución de conflictos por LLM en escritura
(anti-patrón confirmado por mem0) · captura automática write-directo estilo claude-mem (acumular
sin invalidar = entropía; nuestra captura pasa por bandeja + consolidación ratificada).

## Diseño v2 — tres fases

### Fase 1 · Afinar el cerebro actual (horas; sin decisión de dogma)

1. **Bi-temporal light** (`methodology.schema.yaml` v3.1, campos opcionales):
   - `vigencia: { desde: <fecha mundo>, hasta: <fecha mundo> }` — cuándo el conocimiento ES verdadero
     (p.ej. una norma con año de edición). El eje sistema ya existe gratis: git (`created` = commit
     que agrega la card, `expired` = commit que la marca superseded).
   - Regla al gate: dos cards en conflicto con vigencias disjuntas NO son contradicción (ambas
     `vigente` es legal si sus rangos no solapan).
2. **Puerta temática en GRAFO.md**: `gen_metodo.py` genera §0 "preguntas → ruta" desde un mapa
   curado (`_meta.rutas_tematicas` en el YAML: pregunta canónica → cards/objetos). ~15 líneas más.
3. **Gleanings en `/metodo-aprende`**: paso 2.5 — "re-pase: ¿qué entidad/arista/contradicción/
   unidad de nicho te faltó extraer del texto? listar antes del gate".
4. **Validación fase 1**: los mismos mecanismos de v1 — tests negativos del gate (vigencias
   solapadas vs disjuntas), `--check` anti-drift de la nueva sección, doctor 0.

### Fase 2 · El cerebro captura (la brecha real vs claude-mem — días; requiere ratificación)

5. **Bandeja de episodios** (`sistema/metodo/ingesta/episodios/YYYY-MM-DD-<slug>.md`): texto crudo
   aportado por el operador (el texto de Coordinación/Petri es el caso 1) o candidato detectado en
   sesión. Frontmatter: `fuente`, `aportado_por`, `estado: pendiente|integrado|descartado`,
   `integrado_en: [M-cards/pasos tocados]`. **No-lossy**: el episodio queda para siempre; las cards
   lo referencian (`fuente.episodio:`). El gate valida que `integrado` tenga refs resolubles.
6. **`/metodo-consolida` (sleep-time)**: skill batch que corre cuando el operador lo pida (o
   `/loop` semanal): lee episodios `pendiente` + INFO/WARN del gate + §2 del GRAFO (35 cards sin
   operacionalizar) → propone lote de acciones clasificadas (integrar episodio X vía
   `/metodo-aprende`, re-cablear arista Y, poblar paso Z) → el operador ratifica → ejecuta.
   Presupuesto anti-entropía explícito (estilo defrag Letta): el catálogo apunta a ≤~60 cards
   vigentes; crecer más = señal de consolidar, no de agregar.
7. **Validación fase 2**: episodio de prueba end-to-end (el texto real de Petri del operador es el
   test de aceptación); gate nuevo sobre `ingesta/` (frontmatter + refs).

### Fase 3 · El cerebro en el runtime (cuando la historia lo priorice)

8. **Grafo en RAM en `directorio`**: cargar `methodologies.yaml` + `objeto.schema.yaml` al boot
   (patrón `cargaVerbos()` ya existente), servir `/api/metodo` (catálogo + `met:` reverso + grafo
   `combina_con`) — el twin explica el porqué metodológico de cada indicador. gonum si hace falta
   traversal/comunidades (Louvain determinístico); simple-graph SQLite como índice derivado
   generado SOLO si aparecen queries ad-hoc que grep/RAM no resuelvan.
9. **MCP del cerebro** (historia `mcp-server-twin`, F3): exponer consulta del grafo como tools MCP
   (patrón Graphify/basic-memory) para agentes externos.

## Qué NO cambia (dogma re-firmado con evidencia 2026-07-23)

- Git/archivos = SSoT; toda BD es índice derivado regenerable.
- Build determinístico (`gen_*.py`), inteligencia en lectura/consolidación, jamás LLM en el write
  path del gate.
- Invalidación explícita versionada (`superseded_by` + razón) — ninguna herramienta del mercado lo
  hace mejor; mem0 se retractó de la alternativa.
- Umbral RAG: 200-500 notas / corpus no-greppeable / no cabe en contexto — hoy más lejos que nunca
  (Amazon AAAI 2026, Claude Code grep).

## Próximos pasos propuestos (prioriza el operador)

- Fase 1 = pre-historia (tooling del cerebro, project-layer) — ejecutable ya.
- Fase 2 = historia nueva `sistema/cerebro-ingesta-episodios` (state: idea) — la firma el operador.
- Fase 3 = ya tiene historias (`mcp-server-twin`, motor de indicadores N13); este diseño les aporta
  el patrón. La proyección completa al producto: `03-proyeccion-twin.md`.
