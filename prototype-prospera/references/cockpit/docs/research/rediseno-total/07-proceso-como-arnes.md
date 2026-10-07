# SOTA — Proceso de negocio como arnés ejecutable de agente (la apuesta central)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: "arnés" = paquete de skills/instrucciones/
> guardrails que se carga en el Claude Code del trabajador, definido POR ROL dentro de un proceso
> (cada puesto ejecuta N roles). El mapa de procesos oficial no solo se documenta — se vuelve arneses
> ejecutables. Fabricados por Arnesia (~/Proyectos/harness-studio).

## Panorama
El campo convergió 2025-2026 en dos capas complementarias, no rivales. Los BPM/durable-execution
clásicos se reposicionaron como capa de *gobernanza/orquestación* sobre agentes: Camunda lanzó
"agentic orchestration" (8.9, abr-2026; patrón "BPMN determinista + subprocesos ad-hoc para el
agente"); Temporal ($300M, $5B, feb-2026) impone espina determinista replayable + LLM como
*activities*. La otra capa —la nuestra— son los *runbooks agénticos*: SOPs en lenguaje natural
estructurado que el agente ejecuta directo. Literatura: SOP-Bench (arXiv 2025) muestra que los LLM
fallan en SOPs industriales complejos sin guardrails; otro paper 2026 argumenta que el in-context
prompting está volviendo obsoleta la orquestación pesada para tareas procedurales. Lectura: para
procesos de conocimiento por rol, **el runbook agéntico ganó**; los engines quedan para procesos
transaccionales largos con side-effects irreversibles. Nuestra apuesta está del lado correcto.

## El vehículo Claude Code
El stack maduró hacia nuestra forma. **Agent Skills** (Anthropic, oct-2025): directorio con
`SKILL.md` + scripts + recursos, progressive disclosure 3 niveles. **Estándar abierto desde
18-dic-2025** (agentskills.io): en 48h lo adoptaron VS Code/ChatGPT/Codex; a mar-2026, 32 herramientas
(Cursor, Gemini CLI, Kiro, Goose) leen el mismo formato → el arnés no queda casado con Claude Code.
Patrón que conviene: el que Anthropic formalizó (feb-2026, Cowork plugins empresariales) —
**skill = procedimiento; plugin = rol** (bundle de skills + conectores MCP + subagentes + comandos);
**marketplace privado de la org = mapa de procesos ejecutable**, con provisioning por usuario,
auto-install y OpenTelemetry para trazabilidad. El puesto que ejecuta N roles instala N plugins — el
mapeo es literal. Anthropic ya vende plugins de departamento (finanzas/legal/HR/diseño) como base
customizable; Deloitte despliega Claude a 470k empleados con Center of Excellence.

## Análogos del mercado (nos ubica competitivamente)
Tres formas compiten: (1) *Digital workers con nombre* — Sintra, 11x, Artisan, Lindy: personas
genéricas por función, verticales sales/support, SIN conexión con los procesos documentados del
cliente. (2) *Builders empresariales* — OpenAI AgentKit, Microsoft Copilot Studio/Agent 365:
infraestructura para que TI construya agentes, no metodología de procesos. (3) *SOP-to-agent* —
Decagon ("Agent Operating Procedures"), Beam AI, Skan AI: traducen SOPs a lógica ejecutable pero solo
en su vertical. **Nadie vende el pipeline completo de Cockpit**: levantamiento As-Is/To-Be con
ontología ISO → mapa oficial → arnés por rol compilado. Los digital workers son genéricos; los
builders no saben de procesos; los SOP-to-agent no hacen discovery. **El hueco competitivo es real.**

## Anti-drift doc↔arnés
Patrón publicado más limpio: Inkeep (feb-2026) — skills *generadas en build-time* desde la doc ("un
config, dos salidas"; artefactos generados gitignoreados y publicados por CI; validación con schemas).
Regla comunitaria (AGENTS.md/GitBook): duplicar = fuente del drift; una sola fuente, la otra
representación se genera o se enlaza. Para Cockpit = tesis confirmada de lo que ya practican
(backlog.yaml→BACKLOG.md, gate CK-17): el proceso normalizado (objeto.schema) debe ser la SSoT desde
la que se **compilan** tanto el documento humano como el `SKILL.md` del arnés, con versión pineada vía
canal del marketplace y gate en CI que rechaza edición manual del generado. El arnés nunca se edita a
mano: se regenera.

## Fuentes (2026-07-08)
- Anthropic — Equipping agents with Agent Skills (16-oct-2025) · Cowork plugins for enterprise (24-feb-2026)
- Agent Skills estándar abierto: paperclipped.de/... · simonwillison.net/2025/Dec/19/agent-skills/
- Camunda 8.9 agentic orchestration (abr-2026) · Temporal + durable execution (feb-2026)
- Inkeep — Docs → Agent Skills sin drift (3-feb-2026) · Decagon SOPs → AOPs · SOP-Bench (arXiv 2506.08119)
- Vellum AI employees 2026 · OpenAI AgentKit · Copilot Studio (abr-2026)
