# 03 · Proyección — el mismo cerebro, replicado en el twin de cada organización

La tesis del doble propósito (operador, 2026-07-23): **nuestro cerebro de trabajo es el prototipo
del cerebro que Cockpit vende**. La arquitectura de construcción+almacenamiento de conocimiento
validada en `sistema/metodo/` se replica 1:1 en la instancia de cada cliente. Mapeo:

| Pieza de NUESTRO cerebro | Equivalente en el twin del cliente | Nodo | Estado |
|---|---|---|---|
| SSoT YAML/MD en git (`sistema/metodo/`) | Repositorio Oficial: la organización as-code (12 entidades + docs + arneses) | N6 | tesis CK-21, historia forgejo |
| Episodios no-lossy (`ingesta/episodios/`, fase 2) | **Depósito** — crudo transitorio del levantamiento; cada dato del objeto referencia su fuente cruda (`fuente`+`conf`) | N12 | ya diseñado — este corpus lo ratifica como pieza del cerebro, no solo storage |
| Extracción contra ontología declarada (`methodology.schema.yaml` como contrato del gate) | `objeto.schema.yaml` (12 entidades, 218 `met:`) como contrato de la ingesta de Consultio — el schema manda al LLM, no al revés (patrón cognee, validación externa) | N14→N6 | schema v2 done; ingesta = historias metodo-como-arnes-v0 / operar-metodo |
| Ciclo de vida `vigente|superseded` + gate | **Gestión de Cambios ISO** = la MISMA invalidación explícita con firma: propuesta→revisión→merge (dev→UAT→prod); nada se borra, todo queda con puntero y autor | N13/N6 | historia modulo-gestion-cambios-iso |
| Bi-temporalidad light (fase 1) | El twin la NECESITA entera: "qué sabíamos el día X" es requisito de auditoría (ISO cl.7.5 información documentada) y del drift deseado×real — `valid/invalid` (mundo) ya existe en mediciones (`fecha`), falta el eje sistema (git lo da gratis en N6) | N13 | aporta a motor de indicadores + preparación-auditoría |
| GRAFO.md generado + `/metodo` (mapa → grep dirigido) | **GRAFO por organización**: vista generada del objeto normalizado (entidades + hilo de oro + brechas, 1 línea c/u) como índice-en-prompt de los arneses; los arneses de Consultio/Colab navegan el twin igual que `/metodo` navega el método | N13/N15 | patrón nuevo → alimenta arnesia-pipeline (el arnés lleva SU grafo) |
| `/metodo-aprende` (ingesta anti-contradicción) | El flujo del consultor/Analista de Calidad al actualizar el mapa: prior-art scan sobre el objeto → clasificar → contradicciones → Gestión de Cambios. La UI lo oculta; el protocolo es idéntico | N14/N19 | historias operar-metodo + gestion-cambios |
| `/metodo-consolida` (sleep-time, fase 2) | **Crowdsourcing de frescura** + detección de drift del twin: proceso batch que junta señales (lakehouse, acuses, ediciones) y propone lote de cambios a ratificar | N13/N16 | historia crowdsourcing-frescura (V2) — este corpus le da la arquitectura |
| Knowledge Database files-first (rediseno-total/02) | Know-how tácito por rol en N6 (`conocimiento/<proceso>/<rol>/`) — el veredicto files-first queda RE-RATIFICADO con evidencia 2026 (Amazon AAAI, Claude Code grep, Letta git); el umbral RAG (200-500 notas) se mantiene | N6 | historia knowledge-database-files-first (F3) |
| Grafo en RAM + `/api/metodo` (fase 3) | `directorio` sirve el grafo de la organización (ya lee el objeto; falta servir el porqué metodológico y el traversal del hilo de oro) | N13 | motor de indicadores |
| MCP del cerebro | `mcp-server-twin`: "pregúntale a tu organización" para agentes externos | N13 | historia existente (F3) |

## Las tres reglas que viajan al producto (invariantes del cerebro, ambos planos)

1. **Git es el cerebro; las BD son recuerdos derivados.** Toda vista consultable (SQLite, RAM,
   lakehouse-cruce) se regenera desde el repo; si divergen, manda el repo (gate anti-drift).
2. **Nada se borra, todo se invalida con puntero, autor y razón.** En nuestro plano: `superseded_by`
   + gate. En el del cliente: Gestión de Cambios con firma. Es la misma máquina con distinto
   guardián — y es lo que un auditor ISO puede defender.
3. **El LLM propone, el contrato dispone.** Extracción y detección de contradicciones asistidas por
   LLM (Consultio ingiere entrevistas/docs); la mutación del twin es siempre determinística,
   validada contra el schema y ratificada por un humano con autoridad (RACI A). La evidencia 2026
   (retractación de mem0) confirma que el write path automático-LLM no sobrevive en producción.

## Consecuencia comercial (para el pitch)

Los vendors DTO (Mavim, Ardoq, Celonis) guardan el twin en SU base de datos propietaria. Cockpit
puede decir: *"el cerebro de tu organización es un repo git tuyo — auditable línea por línea,
versionado, portable, con cada dato llevando su fuente y su vigencia; y los mismos arneses que lo
consultan lo mantienen fresco"*. La investigación de este corpus muestra que la frontera de la
industria (Letta, Anthropic, Amazon) está convergiendo exactamente a ese modelo — llegamos antes
por diseño, no por moda.
