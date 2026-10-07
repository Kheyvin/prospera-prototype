# 10 · SOTA 2026 — "Arnés de agente as-code": anatomía, compilación desde el modelo org, gobernanza e identidad

> **Investigación 2026-07-25** (encargada en la sesión de CK-30). Es la mitad *ejecutable* del SOTA;
> la mitad *modelo/DTO* está en [`09-sota-dto-2026-fuente-primaria.md`](09-sota-dto-2026-fuente-primaria.md).
> Complementa (no repite) `docs/research/rediseno-total/07-proceso-como-arnes.md` y
> [`05-sota-organization-as-code.md`](05-sota-organization-as-code.md).
>
> **De acá salieron los campos del arnés y las invariantes de gate de la ficha D-20**
> (`sistema/schema/DECISIONES.md`), el nivel de autonomía CSA L0-L5 y la doctrina
> "guardrail sin mecanismo no es guardrail" de **LEDGER CK-30** y de la M-card **M46**.
>
> **Marcas:** sin marca = tiene fuente citada en § 8 · **[INF]** = inferencia del investigador.

---

# SOTA — "Arnés de agente as-code" (2025-2026)

> Investigación 2026-07-25. Complementa (no repite) `docs/research/rediseno-total/07-proceso-como-arnes.md` (jul-2026) y `docs/research/organization-as-code/05-sota-organization-as-code.md` (CK-21). Lo nuevo acá: anatomía de campos comparada, veredicto sobre compilación desde modelo organizacional con respaldo académico, el corpus normativo que obliga campos, identidad/delegación, y evidencia empírica con números.
>
> **Convención:** todo lo que no lleve marca tiene fuente citada en § 8. Lo marcado **[INF]** es inferencia o juicio mío, no hallazgo.

---

## § 1 · Anatomía comparada de una config de agente as-code

### 1.1 Los dos estándares abiertos, y lo poco que declaran

**AGENTS.md** (agents.md) es hoy el formato más adoptado (>60.000 repos desde ago-2025) y desde el **9-dic-2025 lo custodia la Agentic AI Foundation**, fondo dirigido de la Linux Foundation, fundado por OpenAI, Anthropic, Block, Google, Microsoft, AWS, Bloomberg y Cloudflare — que también aloja **MCP** (donado por Anthropic) y **goose** (Block).

**El dato duro: AGENTS.md no tiene esquema.** La propia spec responde: *"No. AGENTS.md is just standard Markdown. Use any headings you like; the agent simply parses the text you provide."* Cero campos obligatorios, cero front-matter, cero validación. Es un contrato social, no un formato de datos.

> **Precisión importante que corrige la creencia común:** la documentación de Claude Code dice explícitamente *"Claude Code reads `CLAUDE.md`, not `AGENTS.md`"*. La compatibilidad se logra con `@AGENTS.md` como import o un symlink. Varios artículos de terceros afirman que Claude Code lo lee nativamente; **es falso**.

**Agent Skills** (agentskills.io, publicado como estándar abierto el 18-dic-2025, código Apache-2.0 / docs CC-BY-4.0) sí tiene spec formal, y es deliberadamente minúscula — **6 campos de front-matter, 2 obligatorios**:

| Campo | Obl. | Restricción |
|---|---|---|
| `name` | Sí | ≤64 chars, `[a-z0-9-]`, sin guion inicial/final ni `--`, debe igualar el nombre del directorio |
| `description` | Sí | ≤1024 chars; qué hace **y cuándo usarlo** |
| `license` | No | nombre de licencia o referencia a archivo |
| `compatibility` | No | ≤500 chars; requisitos de entorno |
| `metadata` | No | mapa string→string arbitrario (aquí es donde la gente mete `version`) |
| `allowed-tools` | No | string separado por espacios. **Marcado "Experimental"** |

Estructura: `SKILL.md` + `scripts/` + `references/` + `assets/`. Progressive disclosure en 3 niveles: metadata (~100 tokens, siempre) → cuerpo (<5.000 tokens recomendado, al activarse) → recursos (bajo demanda). Adoptado por ~45 clientes verificables en el showcase oficial: Claude Code, Codex, Cursor, VS Code/Copilot, Gemini CLI, Junie, Kiro, Goose, OpenHands, Letta, Amp, Factory, Roo Code, Snowflake Cortex Code, Databricks Genie, Spring AI, Mistral Vibe, Pulumi Neo, Tabnine, Ona, entre otros.

**Lectura crítica [INF]:** el estándar abierto resuelve **portabilidad del conocimiento procedimental** y nada más. No modela identidad, ni permisos reales, ni autonomía, ni evaluación, ni telemetría, ni versionado semántico. Quien quiera un arnés gobernable **tiene que construir la capa de arriba él mismo** — o casarse con las extensiones propietarias de un cliente concreto.

### 1.2 Claude Code: la extensión propietaria más completa que existe

Claude Code implementa el estándar y le agrega ~18 campos. Este es el inventario real (verificado en docs oficiales, jul-2026):

**`SKILL.md` — campos extra sobre la spec:** `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths` (globs que condicionan la activación), `shell`.

**Subagentes `.claude/agents/*.md` — front-matter completo:** `name`, `description` (los 2 obligatorios), `tools`, `disallowedTools`, `model` (`sonnet|opus|haiku|fable|<id>|inherit`), `permissionMode` (`default|acceptEdits|auto|dontAsk|bypassPermissions|plan|manual`), `maxTurns`, `skills` (precarga), `mcpServers`, `hooks`, `memory` (`user|project|local`), `background`, `effort`, `isolation: worktree`, `color`, `initialPrompt`.

**`settings.json` — precedencia y enforcement.** Orden: **managed policy > CLI > local > project > user**; las reglas de permiso **se fusionan** entre scopes. Claves relevantes: `permissions.{allow,deny,ask,defaultMode,additionalDirectories}`, `env`, `model`/`availableModels`/`fallbackModel`/`effortLevel`, `hooks`, `enabledPlugins`, `extraKnownMarketplaces`, `sandbox.*`, `autoMemoryEnabled`, `claudeMd` (¡instrucciones org-wide inyectadas desde política gestionada!), `apiKeyHelper`, `forceLoginOrgUUID`.

**Y las claves de *lockdown* corporativo — esto es lo decisivo para un producto:**
- `strictPluginOnlyCustomization` — bloquea que skills, agents, hooks y MCP servers vengan de fuentes de usuario o proyecto; **solo pueden venir de plugins o de managed settings**. Acepta `true` o un array (`["skills","hooks"]`).
- `allowManagedPermissionRulesOnly`, `allowManagedHooksOnly`, `allowManagedMcpServersOnly`, `strictKnownMarketplaces`, `blockedMarketplaces`, `disableSideloadFlags` (rechaza `--plugin-dir`, `--agents`, `--mcp-config`), `sandbox.filesystem.allowManagedReadPathsOnly`, `sandbox.network.allowManagedDomainsOnly`, `forceRemoteSettingsRefresh` (fail-closed al arrancar).

**Hooks — 29 eventos** (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `SubagentStart/Stop`, `TaskCreated/Completed`, `Stop`, `InstructionsLoaded`, `ConfigChange`, `PreCompact/PostCompact`, `Elicitation`, …), 5 tipos de handler (`command`, `http`, `mcp_tool`, `prompt`, `agent`), y salida estructurada que puede **decidir permisos** (`permissionDecision: allow|deny|ask|defer`), **reescribir el input** (`updatedInput`) o **inyectar contexto** (`additionalContext`).

**Sandbox — enforcement a nivel SO** (Seatbelt/bubblewrap+socat): `sandbox.enabled`, `failIfUnavailable`, `allowUnsandboxedCommands`, `filesystem.{allowRead,denyRead,allowWrite,denyWrite,disabled}`, `network.{allowedDomains,deniedDomains,tlsTerminate,httpProxyPort}`, `credentials.{files,envVars}` con `mode: deny|mask` (¡el proxy sustituye un centinela por el secreto real solo hacia `injectHosts`!), `excludedCommands`.

**Empaquetado y distribución:** `plugin.json` (`name` único obligatorio; `version`, `displayName`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `defaultEnabled`) + `marketplace.json` (`name`, `owner`, `plugins[]` con `source` github/git/local, `version`, `category`, `strict`, `relevance`, `renames`). Instalación automática por repo vía `extraKnownMarketplaces` + `enabledPlugins`. Canales stable/latest = dos marketplaces apuntando a refs distintas del mismo repo, asignados por grupo de usuarios desde managed settings.

> **La frase doctrinal más importante de toda la documentación**, y hay que grabarla:
> *"Permission rules are enforced by Claude Code, not by the model. Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't change what Claude Code allows."*
> Y su gemela: *"Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer."*
>
> **[INF] Corolario para el arnés: todo guardrail escrito en prosa es decoración legal. El guardrail real vive en `permissions.deny`, en un hook `PreToolUse` o en el sandbox. Un arnés que declara "no borres datos de producción" en un `SKILL.md` y no lo respalda con una regla, no declara nada.**

Anthropic usa el término **"harness"** con este sentido exacto: el post *"A harness for every task"* argumenta que *"Claude is now intelligent enough to write a custom harness tailor-made for your use case"*, y el blog de Skills los describe como *"an onboarding guide for a new hire"* que convierte *"general-purpose agents into specialized agents that fit your needs"*.

### 1.3 Tabla comparativa de campos (¿qué es dato declarativo versionable en git?)

Leyenda: **●** campo declarativo de primera clase · **◐** parcial (toggle, o referencia a recurso configurado aparte) · **○** existe pero solo en código/API/consola · **—** no existe.

| | Identidad / persona | Objetivos | Herramientas | Permisos (enforce) | Guardrails | Contexto / RAG | Memoria | Evaluación | Versionado | Telemetría | Identidad técnica |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **AGENTS.md** | — | — | — | — | — | — | — | — | — (git) | — | — |
| **Agent Skills (spec)** | ● `name`/`description` | ◐ en prosa | ◐ `allowed-tools` (exp.) | — | — | ● `references/` | — | — | ◐ `metadata.version` | — | — |
| **Claude Code (archivos)** | ● agents/*.md | ◐ prosa + `description` | ● `tools`,`mcpServers`,`.mcp.json` | ● `permissions.*` + sandbox | ● hooks + sandbox + deny | ● CLAUDE.md, `.claude/rules/` (`paths:`), skills | ● `memory: user\|project\|local`, auto-memory | — | ● `plugin.json.version` + marketplace/canales | ◐ OTel por `env` | — |
| **Claude Agent SDK** | ● `AgentDefinition` | ◐ `systemPrompt` | ● `allowedTools`,`mcpServers` | ● `permissionMode`,`canUseTool` | ● `hooks` | ● `settingSources` | ◐ sesiones | — | ○ código | ◐ | — |
| **OpenAI Agents SDK** | ○ `name`,`instructions` | ○ | ○ `tools`,`handoffs` | — | ○ decoradores `@input_guardrail` | ○ | ○ `Session` (SQLite/Redis/…) | ⚠ Agent Builder + Evals **deprecados**, apagan 30-nov-2026 | — | ○ `trace()` | — |
| **Google ADK** | ● `root_agent.yaml` (experimental; **solo Gemini**) | ● `instruction` | ● `tools`,`sub_agents` | — | ○ callbacks (código) | ◐ | ○ | ● **EvalSet/EvalCase JSON + `test_config.json`** (el mejor del lote) | ◐ | ◐ | — |
| **A2A AgentCard** | ● `name`,`description`,`provider`,`version` | ◐ `skills[]` | ● `skills[]`,`capabilities` | ◐ | — | — | — | — | ● `version` | — | ● `securitySchemes`,`security` |
| **MS Copilot Studio `declarativeAgent.json`** | ● `name`,`description`,`id` | ● `instructions` (≤8000) | ● `capabilities`,`actions`,`worker_agents` | ◐ `user_overrides` | ◐ `behavior_overrides`,`disclaimer` | ● `capabilities` (SharePoint/Graph) | — | — | ● `version` + JSON Schema publicado | — | ◐ `sensitivity_label` (Purview) |
| **MS Agent Framework / Foundry** | ● YAML declarativo (`azure.yaml`; el viejo AgentSchema quedó deprecado) | ● | ● `tools[]`, toolbox/MCP | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ◐ | ● **Entra Agent ID** (fuera del archivo) |
| **LangGraph / LangSmith** | ◐ assistant | ◐ `context` | ○ código | — | ○ | ○ | ○ | ◐ | ● **assistant `version` entero, rollback `set_latest()`** (API/DB, no git) | ● LangSmith | — |
| **CrewAI** | ● `role`,`goal`,`backstory` | ● `goal` | ● `tools` | ◐ `allow_delegation`,`code_execution_mode` | ● `guardrail:` en `tasks.yaml` (regla en lenguaje natural, sin código) | ● `knowledge_sources`,`embedder` | ● `memory: bool` | ◐ | — (git) | ◐ AMP | — |
| **Dify** | ● DSL YAML | ● | ● grafo `workflow.graph` | — | ◐ | ● | ◐ | — | ● `version` (+`difyctl` community para diff/lint en CI) | ◐ | — |
| **n8n** | ◐ nodo AI Agent | ◐ `systemMessage` | ● sub-nodos | — | — | ◐ | ◐ | — | ◐ `versionId` (git artesanal) | ◐ | ◐ referencias de credencial |
| **Letta `.af`** | ● | ◐ | ● `tools`,`mcp_servers`,`skills` | — | — | ● `sources`,`files` | ● **serializa el CONTENIDO de memoria y el historial** (único del lote) | — | ● JSON versionable | — | — |
| **AWS Bedrock AgentCore** | ◐ Harness | ◐ | ● Gateway (APIs→MCP) | ● **Policy = Cedar** | ● Policy | ● Memory | ● Memory (servicio) | ● Evaluations (servicio) | ◐ Registry | ● OTel nativo | ● Identity (Cognito/Okta/Entra/Auth0) |
| **AGNTCY / OASF** | ● `name`,`version`,`authors`,`created_at` | ◐ | ● `skills[]`,`modules[]`,`domains[]` | — | — | — | — | — | ● `schema_version` | — | ◐ `locators[]` |

**Conclusiones de la tabla:**

1. **Todos los frameworks resuelven bien lo mismo** (nombre, instrucción, modelo, herramientas) y **casi ninguno resuelve el resto**. Guardrails, memoria, evaluación, telemetría e identidad como campos declarativos del propio agente están cubiertos, cada uno, por a lo sumo uno o dos frameworks — y casi siempre como toggle o referencia a un recurso configurado fuera del archivo.
2. **Nadie pone telemetría en el archivo del agente.** Cero de los frameworks encuestados. Es siempre SDK, env-var o consola.
3. **Nadie pone identidad humana ni delegación en el archivo del agente.** Lo más cercano son los `securitySchemes` del AgentCard de A2A (qué esquemas de auth acepta) y Entra Agent ID (que es un objeto de directorio, no un archivo en git).
4. **CrewAI tiene la separación config/código más limpia** (`agents.yaml`+`tasks.yaml` como SSoT, decoradores como cableado). **Dify captura la app entera en un documento**. **Letta `.af` es el único que serializa estado, no solo definición**. **ADK tiene la mejor evaluación declarativa**. **Claude Code tiene, por lejos, el enforcement y la distribución más completos.**
5. **OpenAI camina hacia atrás en lo declarativo:** anunció el **3-jun-2026** la deprecación de Agent Builder y de la plataforma de Evals (apagado **30-nov-2026**), a favor del SDK code-first. La única superficie visual/declarativa que tenía muere el mismo año en que nació.

---

## § 2 · ¿Alguien compila la config del agente desde un modelo de la organización?

### Veredicto: **No. Nadie.** Y no es por falta de intentos — es un problema abierto reconocido por la academia del campo.

Se revisaron plataformas empresariales (Salesforce Agentforce, ServiceNow AI Agent Studio, Microsoft Copilot Studio/Entra, Workday ASOR, SAP LeanIX/Signavio/Joule, UiPath, Moveworks, Sierra, Ema, Relevance AI, Beam), portales de desarrollador (Backstage, Port.io), BPM/process mining (Camunda, Celonis), EA (Ardoq, LeanIX, Palantir Foundry/AIP), literatura MDE clásica y arXiv 2025-2026. **El resultado es un negativo limpio y consistente**, con cuatro patrones que se repiten:

**(1) Registros / capas de gobernanza — no generan, catalogan.**
- **Workday Agent System of Record (ASOR)** es el análogo más fuerte a "un HRIS para agentes": registra, configura, activa/desactiva, da identidad, observabilidad y cumplimiento, y federa vía Agent Gateway (MCP/A2A) con Entra Agent ID, Copilot Studio y Azure AI Foundry. Pero **no deriva el prompt, las herramientas ni el alcance de un agente desde una requisición de puesto o una posición del organigrama.**
- **SAP LeanIX AI Agent Hub**: descubre e importa agentes construidos en otro lado y los vincula *a mano* a Fact Sheets (Application, Business Capability). Su MCP server expone datos de LeanIX en **solo lectura** para que agentes externos consulten.
- **Microsoft Entra Agent ID**: emite identidad, no configuración.

**(2) Fuentes de contexto/grounding — el modelo org alimenta al agente, no lo construye.**
- **Palantir AIP Agent Studio**: un humano **selecciona** qué object types / action types / function types de la Ontología puede usar el agente. La Ontología informa; no compila.
- **Ardoq** lanzó "AI-first EA" (primavera 2026) con "Custom Agents scoped to their metamodel, governance rules and workflows" — pero su propio blog lo dice sin rodeos: *"architects manually define what the agent knows, what tools it can use, and read/write permissions."* "Scoped to the metamodel" significa *restringido por*, no *generado desde*.
- **Backstage / Port.io**: el catálogo se está volviendo *herramienta y contexto* del agente (vía MCP), no plantilla de generación.

**(3) Síntesis desde lenguaje natural — cerca en espíritu, lejos en mecánica.**
ServiceNow AI Agent Studio ("describí un resultado y construimos el equipo de agentes"), Sierra Journeys (genera instrucciones/guardrails/tono desde una meta en inglés), UiPath Autopilot, y el **Persona Builder de Ema** (biblioteca de personas + conversación de elicitación → "Generative Workflow Engine" sintetiza el workflow). **El input es una descripción ad-hoc elicitada en el momento, no un artefacto organizacional estructurado y versionado — y no hay ninguna garantía de regeneración cuando el modelo cambia.**

**(4) Agentes embebidos en un modelo de proceso — el primo arquitectónico más cercano.**
- **Camunda 8.8/8.9 "AI Agent task"**: el system prompt del agente y sus herramientas disponibles (un subproceso ad-hoc de BPMN) se declaran **dentro del propio modelo BPMN**, y Camunda orquesta el loop de tool-calling de forma determinista. Es lo más parecido a "el modelo de proceso de la organización contiene literalmente al agente" que existe en un producto en producción — **pero lo autoría un humano en el modelador, proceso por proceso.**
- **IBM Research — CUGA FLO**, en el paper *"A Process Harness for Uplifting Legacy Workflows to Agentic BPM"* (Fournier & Limonad, arXiv:2606.27188, 25-jun-2026). Usan **literalmente la palabra "harness"**: *"A process harness places a policy-governed agentic layer around a deterministic workflow engine, intercepting designated control points."* Metamodelo Task-Decision-Flow (TaskAgent / DecisionAgent / FlowAgent), cada uno gobernado por política extraída del "FRAME" del proceso. **Pero: se demuestra sobre un solo workflow (aprobación de créditos), envuelve una instancia de proceso, no compila un padrón de arneses por rol a escala organizacional, y es prototipo de investigación.**

### La evidencia académica que sella el veredicto

El hallazgo más importante de esta sección: **"Agentic Business Process Management: A Research Manifesto"** — Calvanese, Casciani, De Giacomo, Dumas, Fournier, Kampik, La Malfa, Limonad, Marrella, Metzger, Montali, Amyot, Fettke, Polyvyanyy, Rinderle-Ma, Sardiña, Tax, Weber. *Information Systems* vol. 140 art. 102738 (2026); arXiv:2603.18916, enviado 19-mar-2026. Es el who's-who de la academia BPM.

El manifiesto introduce el concepto de **"framed autonomy"**: *"Framing is a primary mechanism for ensuring process-awareness and goal alignment in an APM system, imposing restrictions on the autonomy of agents through their knowledge and goals."*

Y lista como **desafío abierto no resuelto**, textual:

> **Challenge C1** — *"A key challenge in this direction lies in provisioning and onboarding legacy process assets into an APM system"*, incluyendo *"agent-centric process mining, including the reinterpretation of workflows into agent-oriented roles, goals, policies, and behaviors."*
>
> **Challenge F2** — *"The elicitation and specification of mental and intentional frames requires a frame meta-model, and one or several specification languages."*

**Es decir: exactamente lo que describe el CONTEXTO de este encargo está publicado en una revista de 2026 como problema abierto, por los autores que definen el campo.**

### Prior art histórico que sí existió (y hay que citar con honestidad)

La ingeniería de software orientada a agentes de 1998-2010 hizo esto antes, sin LLMs: **Gaia** (modela explícitamente estructura organizacional: roles e interacciones — pero *"does not address the issue of transforming its design models to code"*), **Tropos**, **PASSI**, **ADELFE**, **AUML/FIPA**, y sobre todo **INGENIAS/IDK**, que llegó más lejos con generación de código MDD desde metamodelos de organizaciones multi-agente. **[INF] Es el ancestro legítimo de la idea; murió por falta de adopción industrial y porque generaba código BDI, no arneses de prompt/alcance. Vale citarlo: da profundidad y evita que un analista nos acuse de reinventar la rueda sin saberlo.**

En 2025-2026 no apareció sucesor. **AgentSPEX** (arXiv:2604.13346) es un DSL para escribir workflows de agente **a mano**. **GitHub Spec Kit** y **Amazon Kiro** sí compilan artefactos consumibles por agentes (`.github/*.prompt.md`, `.specify/memory` "constitution", steering files) desde una spec — pero **la spec es siempre de un feature o de una decisión técnica, nunca de la organización**. Es, arquitectónicamente, el mismo mecanismo que Cockpit ya usa contra sí mismo (`gen_arquitectura.py`, `gen_metodo.py`); solo que nadie lo apuntó jamás a un modelo de roles/procesos para emitir arneses por puesto.

Búsquedas directas de `"org chart as code" + generate agents` y `"company as code"` devolvieron **conjunto vacío** en dos buscadores. `"organization as code"` sigue devolviendo solo **policy-as-code** (Kyndryl, Cycode "Agent Infrastructure as Code", `microsoft/agent-governance-toolkit`) — que es restricción en runtime, no generación estructural. **[INF] Dado lo saturado que está el naming "X as code" en 2026, un conjunto vacío es señal, no ruido.**

---

## § 3 · Gobernanza y supervisión: qué obliga la norma a declarar

### 3.1 EU AI Act — el riesgo que hay que mirar de frente

**Annex III punto 4 declara alto riesgo, textual:**
> **4(b)** *"AI systems intended to be used to make decisions affecting terms of work-related relationships, the promotion or termination of work-related contractual relationships, **to allocate tasks based on individual behaviour or personal traits or characteristics or to monitor and evaluate the performance and behaviour of persons** in such relationships."*

**⚠️ Esto toca a Cockpit de lleno, no al arnés genérico.** Un producto cuya tesis es "el hilo de oro medido: objetivos → OKRs → **KPIs por proceso/rol/persona**" más "asignación de tareas por puesto" cae textualmente en **asignar tareas** y **monitorear y evaluar el desempeño de personas**. La escapatoria del **Art. 6(3)** (tarea "estrictamente procedimental", "mejora del resultado de una actividad humana previa", "preparatoria") existe, **pero tiene un override: los sistemas de profiling son siempre alto riesgo, sin excepción**. Y la práctica legal ya advierte que *"employers should not assume that introducing a 'human in the loop' will alter the outcome"* de la clasificación (McCann FitzGerald).

**[INF] Recomendación: esta es una decisión de producto de nivel ficha CK-NN, no un detalle. Hay dos caminos limpios — (a) diseñar el motor de indicadores como agregado por proceso/rol, con la métrica individual explícitamente fuera del producto o detrás de un flag apagado por defecto; o (b) asumir alto riesgo y construir el expediente Annex IV como capability. La peor opción es no decidir y descubrirlo en una due diligence.**

**Art. 14 — Human oversight**, lo que el sistema debe habilitar (textual, ¶4): que el supervisor pueda (a) *"properly understand the relevant capacities and limitations"*, (b) mantenerse consciente del **automation bias** — *"the possible tendency of automatically relying or over-relying on the output"*, (c) interpretar correctamente la salida, (d) *"decide, in any particular situation, not to use the high-risk AI system or to otherwise disregard, override or reverse the output"*, (e) *"intervene in the operation... or interrupt the system through a 'stop' button or a similar procedure"*.

**Art. 26 — obligaciones del DEPLOYER** (el empleador que le pone un arnés a un trabajador; el más directamente aplicable):
- ¶2: *"Deployers shall assign human oversight to natural persons who have the necessary competence, training and authority, as well as the necessary support."*
- ¶6: conservar los logs *"for a period appropriate to the intended purpose... of at least six months."*
- ¶7: *"Before putting into service or using a high-risk AI system at the workplace, deployers who are employers shall inform workers' representatives and the affected workers that they will be subject to the use of the high-risk AI system."*

**Art. 12** (registro automático de eventos), **Art. 13** (instrucciones de uso que deben incluir las medidas de supervisión del Art. 14), **Art. 11 + Annex IV** (documentación técnica en 9 categorías, con forma simplificada admitida para PyMEs — relevante dado el nicho), **Art. 50** (informar que se interactúa con IA salvo que sea obvio; marcar contenido sintético), **Art. 4** (alfabetización en IA, en vigor desde 2-feb-2025).

**Calendario real a mediados de 2026 — importante, porque cambió:** el **Digital Omnibus on AI** (propuesto 19-nov-2025) difiere las obligaciones de alto riesgo de Annex III del **2-ago-2026 al 2-dic-2027** (condicionado a disponibilidad de normas armonizadas), y las de Annex I de 2027 a 2028. Trilogo: primera ronda fallida 28-abr-2026 → **acuerdo político provisional 6-may-2026** → confirmación del Consejo 13-may → **respaldo del Parlamento 16-jun-2026** → luz verde final del Consejo 29-jun-2026; publicación en el DOUE pendiente. **El Art. 50 (transparencia) no se movió: aplica desde 2-ago-2026** con gracia de 4 meses para watermarking. El texto del Art. 14 y la clasificación de Annex III 4 **no se sustantivaron** — se movió la fecha, no el fondo. El Omnibus sí ablandaría el Art. 4 (alfabetización), pasándolo de deber de las organizaciones a "alentar" desde la Comisión/Estados.

### 3.2 NIST, ISO — y el hueco que admiten tener

**NIST AI RMF 1.0** (GOVERN/MAP/MEASURE/MANAGE) + **AI 600-1 (perfil GenAI, jul-2024)**, que nombra "Human-AI Configuration" como categoría de riesgo y recomienda un **inventario de sistemas GenAI documentando modelos, fuentes de datos, versiones, modos de acceso, problemas conocidos y roles de supervisión humana**.

**Lo específico de agentes todavía no existe.** El proyecto **COSAiS** de NIST (overlays de controles SP 800-53 para agentes) solo publicó un concept paper en ago-2025 y un esquema anotado en ene-2026; los overlays se proyectan para "late 2026 to 2027". La **CAISI AI Agent Standards Initiative** se lanzó el 17-feb-2026 (seguridad, interoperabilidad, identidad). **Advertencia: el documento que circula como "NIST AI RMF Agentic Profile v1" NO es de NIST — es una propuesta de la Cloud Security Alliance.** Citarlo mal es un error caro.

**ISO/IEC 42001:2023** (AIMS certificable, 38 controles en Annex A). Los que importan: **A.6** (ciclo de vida del sistema: objetivos de desarrollo responsable, requisitos, V&V, despliegue, operación y monitoreo, **documentación técnica**, **logs de eventos**), **A.9** (uso del sistema: proceso de despliegue responsable, objetivos de uso, aplicaciones previstas, **mecanismos de supervisión humana**), **A.3** (organización interna: roles, responsabilidades, canal de reporte de preocupaciones, accountability), **A.10** (terceros: asignación de responsabilidad, derechos de auditoría, notificación de incidentes, provisiones de salida). La cláusula 4.3 obliga a declarar el rol: **AI Producer / AI Provider / AI User**. Alrededor: **ISO/IEC 23894** (riesgo), **ISO/IEC 42005:2025** (evaluación de impacto), **ISO/IEC 42006:2025** (requisitos para certificadores). No hay ítem de trabajo confirmado sobre arquitecturas agénticas; sí hay una revisión de **ISO/IEC 22989** en curso que podría tocar terminología de agentes.

### 3.3 HITL / HOTL / HIC — y por qué la crítica importa

El origen es la **HLEG Ethics Guidelines for Trustworthy AI (2019)**: **human-in-the-loop** = *"capability for human intervention in every decision cycle"*; **human-on-the-loop** = *"intervention during the design cycle and monitoring the system's operation"*; **human-in-command** = *"capability to oversee the overall activity... including the decision not to use an AI system in a particular situation, to establish levels of human discretion during the use of the system, or to ensure the ability to override a decision."*

**La crítica seria, que conviene interiorizar y no esquivar:**
- **Madeleine Clare Elish, "Moral Crumple Zones"**: *"Just as the crumple zone in a car is designed to absorb the force of impact in a crash, the human in a robotic system may become simply a component... that is intended to bear the brunt of the moral and legal penalties when the overall system fails"*, protegiendo la integridad del sistema técnico *"at the expense of the nearest human operator."*
- **Ben Green, "The Flaws of Policies Requiring Human Oversight of Government Algorithms"** (*Computer Law & Security Review*, 2022): revisó 41 políticas y encontró dos fallas sistémicas — la gente **no puede** ejercer las funciones de supervisión que se le piden, y por eso esas políticas **legitiman** el uso de algoritmos defectuosos dando *"a false sense of security"*. Su alternativa: supervisión **institucional**, no individual.
- **Gaube et al., "Keeping an Eye on AI"** (arXiv:2605.16278, seminario Dagstuhl 2025, ~20 coautores multidisciplinarios): las arquitecturas de supervisión actuales *"are not well defined, the roles involved remain unclear, and implementation steps are opaque."*

**[INF] Traducción para el producto: un arnés que declara `human_oversight: true` y nada más está construyendo una zona de deformación moral para el trabajador. Lo que la crítica exige — y lo que ningún competidor hace — es declarar *qué* debe verificar el humano, *con qué evidencia*, *en cuánto tiempo*, y *medir si efectivamente lo hizo*. Eso es diseñable. Ver § 7.**

### 3.4 Taxonomías de autonomía (sí existen; no hay una sola ganadora)

| Fuente | Escala | Nota |
|---|---|---|
| **CSA, "Agentic AI Autonomy Levels and Control Framework"** (28-ene-2026) | **L0** No Autonomy → **L1** Assisted (aprobación por acción) → **L2** Supervised (aprobación por plan/lote) → **L3** Conditional (decide dentro de límites, escala al romperlos) → **L4** High Autonomy (humano pasa a monitoreo/excepciones) → **L5** Full/Self-Directed | La más operacional. Separa explícitamente **autonomía de capacidad**; los controles escalan con el nivel; declara L5 *"not appropriate for enterprise deployment today"* |
| **Feng, McDonald & Zhang, Knight First Amendment Institute** (28-jul-2025) | **Operator → Collaborator → Consultant → Approver → Observer** (por rol del usuario) | Propone **"autonomy certificates"** emitidos por terceros que certifican el nivel máximo seguro |
| **Mitchell, Ghosh, Luccioni & Pistilli (HuggingFace)**, *"Fully Autonomous AI Agents Should Not Be Developed"* (arXiv:2502.02649) | ~10 subniveles, de "Basic Function Executor" a autonomía plena | Tesis: *"The more control a user cedes to an AI agent, the more risks to people arise."* |
| **Morris et al. (DeepMind), "Levels of AGI"** (arXiv:2311.02462) | Autonomía como **eje separado** de capacidad | *"Higher levels of autonomy are 'unlocked' by AGI capability progression, though lower levels of autonomy may be desirable for particular tasks and contexts"* |
| **Salesforce Agentic Maturity Model** | L1 recuperación → L2 acción en dominio → L3 orquestación multi-dominio → L4 colaboración multi-agente | Framing comercial |

**No existe una "SAE J3016 para agentes" con consenso.** **[INF] Adoptar CSA L0-L5 como vocabulario del campo `autonomia` es la apuesta de menor riesgo: es la más citada de 2026, es explícitamente enterprise, y separa autonomía de capacidad — que es justo la distinción que necesita un arnés por puesto (un contador y un analista pueden tener la misma capacidad y distinta autonomía).**

### 3.5 Registro de agentes: de propuesta a requisito

Gartner (abr-2026) lista construir un **inventario centralizado de agentes** como el segundo de seis pasos para manejar el agent sprawl; CISA/Five Eyes, IMDA Singapur y el NIST AI RMF referencian registros de agentes. La **CSA Agent Registry Specification v1** es el esquema de campos más concreto que existe: `agentId` (URI SPIFFE), `displayName`, `owningOrganization`, `ownerEmail` (humano accountable), `agentVersion`, `frameworkId/Version`, `foundationModelId/Version` (pineado), `capabilities`, `toolAccessList`, `permissionBoundaries` (clasificación máxima de datos, acciones prohibidas, fuentes permitidas, duración máxima de sesión), `behavioralFingerprints` (hashes SHA-256 de tests pre-despliegue), `svid`, `lineageRef`, `deploymentContext`, `status`, timestamps, `externalCertifications`.

**Y su hueco autoconfesado, que es exactamente nuestra oportunidad:** *"Human oversight is assigned through the `ownerEmail` field and `deploymentContext` compliance scope designation, **not through an explicit autonomy-level field**."*

**OWASP Top 10 for Agentic Applications 2026** (publicado 9-dic-2025 por el GenAI Security Project): ASI01 Agent Goal Hijack, ASI02 Tool Misuse, **ASI03 Identity and Privilege Abuse**, ASI04 Agentic Supply Chain, ASI05 Unexpected Code Execution, ASI06 Memory/Context Poisoning, ASI07 Insecure Inter-Agent Communication, ASI08 Cascading Agent Failures, ASI09 Human-Agent Trust Exploitation, ASI10 Rogue Agents. *(La lista ASI01-10 se verificó vía dos fuentes secundarias independientes; la página oficial de OWASP confirma la publicación y fecha pero no renderizó los nombres.)*

---

## § 4 · Identidad y permisos del agente

### 4.1 La pregunta central tiene respuesta consensuada

**El agente NO actúa como la persona. Tiene identidad propia, y actúa *en nombre de* la persona mediante una concesión explícita y acotada.** Esto ya no está en disputa:

- **Okta**: *"Impersonation is almost always the wrong model for production agentic systems."*
- **Gartner** ("IAM Adapts to Secure and Enable AI Agents", ene-2026): *"Prohibit sharing of human credentials with AI agents. Require unique identities with accountable human owners for every agent."* Y la predicción: **"By 2028, 90% of organizations that allow humans to share credentials with AI agents will have to make a significant investment to undo this design."** Además: hasta 2029, *"over 50% of successful cybersecurity attacks against AI agents will exploit access control issues."*
- **CyberArk**: credenciales propias cuando opera autónomo, acceso delegado cuando actúa por un humano; secretos compartidos destruyen la trazabilidad.
- **RFC 8693** formaliza la distinción a nivel de protocolo: **impersonation** (el cliente usa sus credenciales anotadas como "actuando por B") vs **delegation** (el token lleva **ambas identidades** vía la cadena de claims `act`).

**Modelo de tres estados** que debería declarar cualquier arnés: `autonomous` (identidad propia, entitlements propios) · `delegated` (identidad propia + concesión acotada de un humano identificado, ambas en el token) · `impersonation` (desaconsejado por todas las fuentes; única excepción sancionada es la "paired agent user account" de Entra, que igual mantiene la identidad del agente separada por debajo).

### 4.2 Las piezas técnicas que ya están de pie

| Pieza | Qué aporta al arnés |
|---|---|
| **RFC 8693 Token Exchange** | Claims **`act`** (cadena anidada de quién actúa por quién) y **`may_act`** (declara *por adelantado* quién puede actuar en nombre del sujeto) |
| **RFC 9396 RAR** | `authorization_details`: permisos por **instancia de recurso + acción + TTL**, no scopes de string. Extensión específica para agentes en `draft-chen-oauth-rar-agent-extensions-01`; hay un feature request abierto para adoptarlo en MCP (#1670) |
| **RFC 8707 Resource Indicators / RFC 9728 Protected Resource Metadata** | Binding de audiencia — el token vale solo para un servidor MCP canónico |
| **CIBA** | Aprobación humana **fuera de banda** (push/SMS/email) con token acotado a **esa sola acción** |
| **ID-JAG / Cross App Access (Okta)** | `draft-ietf-oauth-identity-assertion-authz-grant`, **draft-04 del 21-may-2026**, Standards Track en el OAuth WG. Mueve la decisión de acceso de la app al IdP. 25+ adoptantes tempranos incluyendo Anthropic, Zoom, Slack |
| **Transaction Tokens** | `draft-ietf-oauth-transaction-tokens-08` (~mar-2026) propaga identidad de usuario + workload + contexto por toda la cadena, con claim `txn` correlacionable. La extensión para agentes (`draft-araut-oauth-transaction-tokens-for-agents`, Amazon) agrega **`Actor`** (el agente) y **`Principal`** (el humano; opcional si es autónomo) |
| **WIMSE (IETF WG)** | Trust Domain + Workload Identifier + credenciales duales (X.509 mTLS + JWT). **§3.4.11 es explícitamente sobre IA agéntica**: cadenas de agentes como caso especial de workloads delegados; acciones autónomas requieren identidad separada; y **"each hop in the chain MUST explicitly scope and re-bind the security context"** |
| **SPIFFE/SPIRE** (CNCF Graduated) | Substrato criptográfico (SVID X.509/JWT). Vault 1.21 auth nativa SPIFFE; Vault 2.0 motor de secretos SPIFFE. **Su límite reconocido: SPIFFE prueba *qué* es el workload, no *por qué* está actuando** — el "intent layer" queda por resolver |
| **MCP authorization** | **2025-06-18**: servidores MCP = Resource Servers OAuth 2.1 puros; 401 + `WWW-Authenticate` → `/.well-known/oauth-protected-resource`; PKCE obligatorio; **prohibido el token passthrough** (defensa contra confused deputy); validación de audiencia obligatoria. **2025-11-25**: **Client ID Metadata Documents (CIMD)** reemplazan DCR por defecto (el cliente se identifica con una URL que controla), y **Enterprise-Managed Authorization (Cross App Access) queda cableado nativamente**: el IdP corporativo evalúa política ("¿puede Ingeniería usar Claude para acceder a Asana?") y emite un ID-JAG temporal |
| **A2A AgentCard** | Documento de descubrimiento con `securitySchemes` + `security`. Guía: proteger cards sensibles detrás de endpoints autenticados; preferir credenciales dinámicas fuera de banda a secretos estáticos embebidos |

**Plataformas:** **Entra Agent ID** (preview Build 2025, GA abr-2026) — identidades de agente como construcción **distinta** de service principals, aprovisionadas desde Copilot Studio y Azure AI Foundry, con **sponsor** (el humano creador) registrado, cuatro modos de acceso nombrados (tokens web / **autónomo** / **delegado** / autenticar peticiones entrantes de otros agentes), y Conditional Access + Identity Protection aplicables. **Agent 365** (Ignite, 18-nov-2025) como plano de control que abarca agentes de Anthropic, LangChain, OpenAI, CrewAI, Cursor, Vercel. La **guía de Microsoft del 16-jul-2026** ("Least privilege for AI agents") es la más accionable: agente = principal de primera clase con propósito documentado, dueño humano, ciclo de vida completo y kill-switch rápido; **roles por tarea** (no roles amplios) cruzados con frontera de recurso × frontera de dato × frontera de operación; **tool binding** con manifiesto curado; elevación JIT; y campos de auditoría obligatorios que incluyen explícitamente **"on behalf of" user**.

**Del lado de la gobernanza de identidades no humanas:** CyberArk 2025 Identity Security Landscape (2.600 decisores, 20 países) reporta **82:1 identidades máquina por humano**, **68%** sin controles de identidad para IA y **47%** incapaces de asegurar shadow AI. Una encuesta de mar-2026 encontró que **más de dos tercios de las organizaciones no pueden distinguir claramente acciones de agente de acciones humanas**. Y una encuesta CSA (285 profesionales, 2025): solo **23%** tiene estrategia formal de identidad de agentes.

**Ya existe implementación concreta sobre Claude Code:** Descope publicó (**9-jul-2026**) el patrón de aprobación humana CIBA vía **hook `PostToolUse`**: el server MCP devuelve `{"ciba_required": true, "scope": "..."}` → el hook dispara el backchannel con un binding message, hace polling hasta la aprobación, reinyecta el token y **replay** de la llamada, devolviendo `decision: "block"` con el resultado real — **de modo que el JWT nunca entra al contexto del modelo.** [INF] Este patrón es directamente portable a nuestro arnés y resuelve el Art. 14(4)(e) de forma técnica, no declarativa.

---

## § 5 · Evidencia empírica

### 5.1 Los agentes autónomos en trabajo de oficina siguen siendo malos

| Benchmark | Resultado | Fuente |
|---|---|---|
| **TheAgentCompany** (CMU, 175 tareas, empresa de software simulada con GitLab/OwnCloud/Plane/RocketChat) | **30,3%** de tareas completadas autónomamente (Gemini 2.5 Pro); ~40% con crédito parcial; modelos open-weight ≤7,4% | arXiv:2412.14161 |
| **WorkArena++** (ServiceNow, 682 tareas empresariales compositivas) | Humanos **93,9%** · GPT-4o **2,1%** | NeurIPS 2024 |
| **CRMArena-Pro** (Salesforce) | Mejor modelo **~58%** single-turn → **35%** multi-turn; GPT-4o <30%; conciencia de confidencialidad débil en todos | arXiv:2505.18878 |
| **τ-bench** (Sierra) | Claude 3.5 Sonnet **69,2%** retail / 46,0% airline (pass^1). **GPT-4o cae de ~60% (pass^1) a ~25% (pass^8)** — la consistencia, no la capacidad, es el cuello de botella | sierra.ai |
| **SWE-Lancer** (OpenAI, 1.400+ tareas reales de Upwork por $1M) | Mejor modelo ganó **~$403.000 (33,7%)**; 47% en tareas de criterio gerencial pero solo **21,1%** en implementación | arXiv:2502.12115 |
| **Vending-Bench 2** (Andon Labs, operar un negocio un año simulado) | Mejor modelo **$8.017** de balance final vs **~$63.000** estimado para un humano hábil. El cuello de botella es la **coherencia**: *"any single lapse can snowball"* | andonlabs.com |
| **GDPval** (OpenAI, sept-2025; 1.320 tareas, **44 ocupaciones**, calificadas a ciegas por expertos con ~14 años de experiencia) | Los mejores modelos igualaron o superaron a expertos humanos en **"poco menos de la mitad"** de las tareas del gold set. El "100x más rápido y barato" es **solo costo de inferencia** — el propio paper excluye *"human oversight, iteration, and integration real deployments require"*, y el diseño es **one-shot** | openai.com/index/gdpval |
| **HAL** (Princeton, 21.730 rollouts, 9 modelos × 9 benchmarks, ~$40.000 de evaluación) | Hallazgo metodológico: **más esfuerzo de razonamiento *reduce* la exactitud en la mayoría de las corridas** | arXiv:2510.11977 |
| **METR time horizon** | Horizonte de 50% de éxito **se duplica cada ~7 meses** desde 2019; Claude 3.7 Sonnet ~**50 minutos**, o3 ~2 horas | arXiv:2503.14499 |
| **RE-Bench** (METR) | Con presupuesto de **2 horas** los agentes puntúan **4x** más que expertos humanos; **los humanos los superan cuando el presupuesto se extiende** (probado hasta 32 h) | arXiv:2411.15114 |

### 5.2 Productividad real: la evidencia es "depende", y el sesgo de percepción es enorme

- **METR RCT** (10-jul-2025): 16 desarrolladores open-source experimentados, **246 tareas reales** en repos propios, con Cursor Pro + Claude 3.5/3.7. Resultado: **19% MÁS LENTOS** con IA. Esperaban un +24% de aceleración antes; **tras experimentar la ralentización seguían creyendo que la IA los había acelerado 20%**. *Caveats de los propios autores: no generalizable, n pequeño, sin intervalos de confianza en la publicación inicial, y METR ahora etiqueta el resultado como "histórico" — instantánea de capacidades de principios de 2025.*
- **Cui, Demirer, Jaffe et al.** (3 RCTs, **4.867 desarrolladores** en Microsoft/Accenture/Fortune-100): **+26,08%** de tareas completadas con Copilot; los menos experimentados adoptan más y ganan más.
- **Dell'Acqua et al., "Jagged Technological Frontier"** (**758 consultores de BCG**, preregistrado; *Organization Science* 2026): **+12,2%** tareas, **+25,1%** velocidad, **+40%** calidad — **dentro** de la frontera de competencia de la IA. **Fuera** de esa frontera, los asistidos rindieron **peor**.
- **Noy & Zhang** (*Science* 2023, 453 profesionales): tiempo **−40%**, calidad **+18%**, y la brecha entre altos y bajos desempeños se **estrecha**.
- **Brynjolfsson, Li & Raymond** (*QJE* 2025, **5.179 agentes de soporte**): **+14-15%** de casos resueltos por hora en promedio, **+34% para novatos**, **~0% para los experimentados**.

### 5.3 El panorama macro: casi todo se queda en piloto

- **MIT Media Lab / Project NANDA**, "The GenAI Divide" (ago-2025): **95%** de las organizaciones no reportan retorno medible en P&L pese a **$30-40B** de gasto; solo **5%** de los pilotos extraen valor real. *Metodología floja: 52 entrevistas + 153 encuestados + 300 despliegues públicos, no revisado por pares. Tratar como direccional, no como cifra.*
- **McKinsey State of AI** (nov-2025, ~1.500 ejecutivos): **88%** adopta IA, pero solo **23%** escala IA agéntica a nivel empresa y **39%** experimenta — dos tercios atascados en piloto. Solo **6%** son "high performers" capturando 5%+ de EBIT.
- **Gartner** (25-jun-2025): **"más del 40%"** de los proyectos de IA agéntica serán **cancelados para fines de 2027** por costo, ROI difuso y controles de riesgo inadecuados; y de miles de vendors que se dicen agénticos, solo **~130** tendrían capacidad real ("agent washing"). *Es un pronóstico, no una medición.*
- **Anthropic Economic Index** (informe geografía, 15-sep-2025): automatización **49,1%** vs augmentación **47%** — invirtiendo el 57/43 pro-augmentación del primer informe; las conversaciones **"directivas"** (delegación total con mínima intervención humana) **subieron de 27% a 39% en nueve meses**; entre clientes de API la automatización llega a **77%**. *Autorreportado por Anthropic sobre su propio producto.*
- **Stanford Digital Economy Lab, "Canaries in the Coal Mine"** (Brynjolfsson, Chandar, Chen, con datos de nómina de ADP): trabajadores de **22-25 años** en ocupaciones más expuestas (ingeniería de software, marketing, atención al cliente) cayeron **−6%** en empleo (2022→jul-2025) con la caída **acelerándose** (>4%/año recientemente), mientras los **30+** en las mismas categorías **subieron +6% a +12%**. *Observacional, no experimental.*

### 5.4 Por qué fallan

- **Composición de errores**: 10 pasos al 95% de fiabilidad por paso → **~60%** extremo a extremo; 20 pasos al 95% → **~36%**; 10 pasos al 85% → **~20%**. *(La matemática es correcta — regla del producto, "Lusser's Law" 1957; el encuadre en pipelines de agentes viene de blogs profesionales, no de un paper.)*
- **Context rot** (Chroma Research, 18 modelos): el rendimiento se degrada de forma **no uniforme** al crecer el input, **incluso en tareas simples**; y en algunas condiciones los modelos rindieron **mejor con contexto barajado** que con contexto largo y lógicamente estructurado — el cuello de botella es la asignación de atención, no la presencia de información.
- **Prompt injection / agent hijacking**: red-teaming UK AISI + Gray Swan 2025 (22 LLMs, **1,8M intentos**): mejor modelo 1,47% de éxito de ataque, peor 6,49%. El seguimiento 2026 sobre inyección indirecta (13 modelos frontera, 464 red-teamers, **272.000+ ataques**): **"no model came out clean"**. Y CAISI reporta que ataques adaptados al comportamiento de agentes elevan el secuestro de tareas **del 11% al 81%**.
- **"Illusion of Thinking"** (Apple, may-2025): colapso total de exactitud pasado un umbral de complejidad. **Rebatido** (Lawsen 2025; y Anthropic) como artefacto metodológico — se excedían los límites de tokens de salida y algunas instancias eran matemáticamente irresolubles. *Disputa viva: citar ambos lados.*
- **"Workslop"** (HBR sept-2025; BetterUp Labs + Stanford Social Media Lab, n=1.150): **40%** de los trabajadores de escritorio recibió contenido IA vistoso pero vacío en el último mes; **~2 horas** perdidas por incidente; **$186/empleado/mes**, ~**$9M/año** en una empresa de 10.000.
- **Cuello de botella de verificación**: converge desde dos lados — GDPval excluye explícitamente el costo de supervisión de su "100x", y los estudios de workslop/MIT lo miden desde el otro extremo. **[INF] Es la tesis central del arnés: si el trabajo del humano pasa a ser verificar, el arnés tiene que hacer la verificación barata y evidenciable, o el producto genera workslop industrializado.**

### 5.5 Sobre "1 humano : N agentes"

**No encontré ningún estudio riguroso que establezca una razón numérica de span-of-control humano:agentes.** Es territorio de claim de vendor. Lo más cercano: los datos internos autorreportados de Anthropic (132 ingenieros encuestados + 53 entrevistas + 200K transcripciones de Claude Code: uso diario subió a 59%, productividad autopercibida +50%, 27% descrito como trabajo genuinamente nuevo) y su comparación multi-agente (Opus 4 líder + subagentes Sonnet 4: **90,2%** vs baseline mono-agente). Ninguno da una razón de headcount.

**El caso Klarna es el contraejemplo que hay que tener a mano.** Feb-2024: asistente de atención maneja ~2,3M conversaciones (~75% de los chats) en su primer mes, equivalente declarado a **700 agentes full-time**, ~$40M de ahorro; plantilla baja de 5.527 a ~2.900-3.500 con congelamiento de contrataciones. **May-2025, el CEO revierte públicamente**: *"We focused too much on efficiency and cost. The result was lower quality, and that's not sustainable"* y *"investing in the quality of human support is the way of the future for us."* Sept-2025: reasignación y recontratación de personas a soporte.

---

## § 6 · El gap real

Siendo riguroso y sin regalar diferenciador, esto es lo que **efectivamente nadie hace** y lo que **sí hace alguien** (para no vender como novedad lo que ya existe).

### Lo que YA existe — no reclamarlo como propio

| Pieza | Quién ya lo hace |
|---|---|
| Empaquetar conocimiento procedimental por rol en carpetas versionadas | **Agent Skills**, estándar abierto, ~45 clientes. `skill = procedimiento, plugin = rol` es patrón publicado por Anthropic |
| Distribuir/versionar/pinear arneses por grupo de usuarios | **Marketplaces + managed settings de Claude Code** (canales stable/latest, `extraKnownMarketplaces`, `strictPluginOnlyCustomization`) |
| Compilar artefactos de agente desde una spec, con gate anti-drift | **GitHub Spec Kit**, **Amazon Kiro**, **Inkeep**. Cockpit ya lo practica contra su propia arquitectura y método |
| Identidad propia + delegación acotada + aprobación humana | **Entra Agent ID / Agent 365**, **Okta XAA/ID-JAG**, **Auth0**, RFC 8693/9396, CIBA. Consenso, no frontera |
| Registro/inventario de agentes con dueño humano | **Workday ASOR**, **SAP LeanIX AI Agent Hub**, **CSA Agent Registry Spec**, requisito Gartner 2026 |
| Envolver un proceso de negocio con una capa agéntica gobernada por política | **Camunda AI Agent task** (por proceso, a mano) e **IBM CUGA FLO** (un workflow, prototipo) |
| Modelar la organización en git como entidades tipadas | **Backstage** (User/Group), **GitLab handbook-first** — ya documentado en CK-21 |

### Lo que NADIE hace — el hueco verificado

1. **El paso de compilación en sí.** Nadie toma un modelo organizacional estructurado y versionado (rol × proceso × puesto × objetivo × indicador) y **emite el paquete de configuración de agente para cada puesto** como paso de build determinista. Verificado como negativo en ~20 productos y respaldado por el **Challenge C1 del manifiesto de Agentic BPM** (*Information Systems*, 2026), que lo declara problema abierto. Lo más cercano en producto (Camunda) es autoría manual por proceso; lo más cercano en investigación (CUGA FLO) es un workflow único.

2. **La regeneración ante cambio del modelo, con gate anti-drift.** Ninguna de las herramientas de "NL→agente" (ServiceNow, Sierra, Ema, UiPath) tiene **ninguna** garantía de que el agente siga reflejando el modelo cuando el modelo cambia — porque no hay modelo persistente, hay una conversación de elicitación. **[INF] Esta es, a mi juicio, la mitad más defendible del diferenciador: no "generamos un agente", sino "el arnés no puede divergir del modelo porque el gate rechaza el commit". Es la misma disciplina que Cockpit ya prueba en `gen_arquitectura.py`/`gen_metodo.py`, apuntada a un objeto nuevo.**

3. **La trazabilidad bidireccional rol ↔ arnés como dato de primera clase.** Poder responder "¿qué arnés implementa el rol R del proceso P, en qué versión, y qué campos del modelo lo produjeron?" — y la inversa. Los registros de agentes (ASOR, LeanIX, CSA) tienen `owningOrganization` y `ownerEmail`, pero **ninguno tiene un puntero al elemento del modelo organizacional que justifica la existencia del agente.**

4. **El nivel de autonomía derivado del puesto.** La CSA Agent Registry Spec confiesa su propio hueco: *"Human oversight is assigned through the `ownerEmail` field... not through an explicit autonomy-level field."* Existen taxonomías de autonomía (CSA L0-L5, Knight) y existen registros; **nadie las une, y menos aún deriva el nivel del rol/riesgo del puesto.**

5. **El expediente de conformidad generado desde la misma fuente.** Nadie compila Annex IV / Art. 13 / registro de Art. 26(7) desde el mismo SSoT que produce el arnés. Es trabajo manual de GRC en todas partes.

### Lo que NO es diferenciador y conviene dejar de decir

- **"Arneses ejecutables por rol"** a secas: Anthropic ya vende plugins departamentales (finanzas, legal, HR, diseño), y `plugin = rol` es su patrón publicado. El diferenciador **no es el arnés; es de dónde sale el arnés.**
- **"El método como skills"**: Decagon ("Agent Operating Procedures"), Beam AI y Skan AI hacen SOP→agente en sus verticales.
- **"Agentes que conocen los procesos del cliente"**: Celonis AgentC ya expone Process Intelligence como grounding a agentes construidos en Copilot Studio, Bedrock, watsonx y CrewAI.

**[INF] Formulación honesta y estrecha del diferenciador, que resiste escrutinio: *el único pipeline determinista SSoT-organizacional → arnés-por-puesto → gate anti-drift → evidencia de operación → brecha → de vuelta al SSoT*. Cada eslabón tiene precedente; el ciclo cerrado no. Y la ventana temporal es real pero corta: Workday tiene el registro y el dato de puestos, Microsoft tiene el plano de control y la identidad, Camunda tiene el modelo de proceso con el agente adentro. Cualquiera de los tres puede cerrar el ciclo si decide hacerlo.**

---

## § 7 · Implicancias para el diseño de nuestro arnés

### 7.1 La decisión arquitectónica de fondo: introducir un tercer artefacto

Hoy el pipeline es: **objeto normalizado → (Arnesia) → plugin/SKILL.md**. Propongo intercalar un contrato explícito:

```
sistema/schema/objeto.schema.yaml   (SSoT: proceso · rol · puesto · persona · objetivo · indicador)
              │
              ├─►  arnes.yaml            ← NUEVO. El CONTRATO del arnés. A mano o derivado, pero VERSIONADO y VALIDADO.
              │      (una ficha por rol-en-proceso; es lo que un auditor lee)
              │
              └─►  gen_arnes.py  ──────► ARTEFACTOS GENERADOS (nunca editados a mano):
                                          plugin.json · marketplace.json
                                          skills/*/SKILL.md
                                          agents/*.md
                                          settings.json (permissions + sandbox + hooks)
                                          .mcp.json
                                          hooks/*.sh
                                          EXPEDIENTE.md  ← Annex IV + Art.13 + registro Art.26(7)
                                     + gate --check en .githooks/pre-commit
```

**Por qué `arnes.yaml` y no generar directo desde el objeto** [INF]: (a) el objeto normalizado modela la organización, no la política de automatización — meterle `autonomia` y `permissions.deny` lo contamina; (b) un auditor, un cliente regulado o un gerente necesitan **un documento legible por ficha de puesto**, y ese documento no puede ser un `SKILL.md`; (c) permite que la derivación desde el objeto sea **parcial** (defaults derivados + overrides ratificados) sin perder el gate.

### 7.2 Campos propuestos, cada uno con su justificación

#### A · Identidad y procedencia
| Campo | Por qué |
|---|---|
| `id` | CSA Agent Registry `agentId`; requisito de inventario (Gartner abr-2026, NIST AI 600-1 "GAI system inventory") |
| `version` (semver) | `plugin.json.version` **pinea** la versión en Claude Code; sin él cae al SHA del commit y cada commit es una versión nueva |
| `modelo_base` + `modelo_version` | CSA `foundationModelId/Version` pineado. Y Annex IV §6 exige log de cambios del ciclo de vida |
| `arnes_padre` / `lineage` | CSA `lineageRef`; WIMSE exige identidad separada para subagentes |
| `estado` (`activo\|suspendido\|deprecado\|revocado`) | CSA `status`; sin esto no hay procedimiento de baja ni kill-switch declarado (Microsoft jul-2026) |

#### B · Anclaje al modelo organizacional ← **el campo que nadie tiene**
| Campo | Por qué |
|---|---|
| `deriva_de: { proceso, rol, puesto[], nodo }` | **Es el diferenciador.** Ningún registro de agentes (ASOR, LeanIX, CSA) apunta al elemento organizacional que justifica al agente. Habilita la pregunta bidireccional y el análisis de impacto ante rediseño |
| `hash_fuente` | Huella de los campos del objeto que produjeron este arnés. **El gate compara y falla si divergen** — es el mecanismo anti-drift, el equivalente al `--check` de `gen_arquitectura.py` |
| `indicadores[]` | El hilo de oro: qué KPI mueve este arnés. Conecta arnés → brecha → proyecto |
| `objetivo` | Art. 13(3)(b) y Annex IV §1 exigen "intended purpose". Microsoft (jul-2026): "propósito explícito y documentado" por agente |

#### C · Conocimiento (lo que ya se hace bien, formalizado)
| Campo | Por qué |
|---|---|
| `skills[]` con `origen` (qué paso del método `proceso/**` lo generó) | Trazabilidad método→arnés; el `id` del paso ya existe en el árbol `proceso/` |
| `paths[]` por skill | Claude Code soporta `paths:` en front-matter de skill y en `.claude/rules/` — carga condicionada, ahorra contexto. Mitiga **context rot** (Chroma) |
| `referencias[]` | Progressive disclosure nivel 3 del estándar |

#### D · Herramientas, permisos y guardrails — **separados en tres campos distintos**
| Campo | Por qué |
|---|---|
| `herramientas.permitidas[]` / `.prohibidas[]` | Mapea a `tools`/`disallowedTools`. **"Tool binding": manifiesto curado, no acceso abierto** (Microsoft jul-2026). OWASP **ASI02 Tool Misuse** |
| `permisos.{allow,ask,deny}[]` (sintaxis `Tool(specifier)`) | **La lección doctrinal de § 1.2**: el guardrail real vive acá, no en prosa. Se compila a `permissions.*` de `settings.json` |
| `sandbox.{filesystem,network,credentials}` | Enforcement a nivel SO. `credentials.envVars[].mode: mask` permite que el agente use un token sin verlo jamás — mitiga exfiltración y **ASI03** |
| `datos.clasificacion_maxima` + `datos.fuentes_permitidas[]` | CSA `permissionBoundaries`. Microsoft: frontera de dato × frontera de recurso × frontera de operación |
| `guardrails[]` con `mecanismo: hook\|permiso\|sandbox\|prompt` | **[INF] Campo deliberadamente incómodo: obliga a declarar *cómo* se hace cumplir cada guardrail. Un guardrail con `mecanismo: prompt` es visiblemente más débil, y eso debe verse en la ficha y en la auditoría.** |

#### E · Autonomía y supervisión humana — **el bloque que cierra el hueco de la CSA**
| Campo | Por qué |
|---|---|
| `autonomia: L0..L5` | Vocabulario CSA (28-ene-2026). Separa autonomía de capacidad. **El registro CSA confiesa no tenerlo; nosotros lo derivamos del riesgo del puesto** |
| `supervisor: { puesto, competencia, formacion, autoridad }` | **Art. 26(2) textual**: "natural persons who have the necessary competence, training and authority". No es un email — es un puesto del modelo, con sus tres atributos |
| `puertas_aprobacion[]: { patron_accion, canal (ciba\|slack\|email), aprobador_rol, binding_message, timeout_comportamiento: deny\|escalar }` | Art. 14(4)(e) "stop button". Implementación verificada: **hook `PostToolUse` + CIBA** (Descope, 9-jul-2026). `timeout_comportamiento: deny` = fail-closed |
| `verificacion_humana: { que_verificar[], evidencia_requerida[], tiempo_estimado }` | **La respuesta a Elish y Green.** Sin esto, `supervisor` es una zona de deformación moral. **[INF] Es también nuestra mejor defensa comercial: es medible, y ningún competidor lo declara** |
| `antisesgo_automatizacion[]` | Art. 14(4)(b) exige conciencia del automation bias. Ej.: exigir que el agente muestre su incertidumbre, o inyectar un paso de contraste vía hook |
| `puede_anular: true` | Art. 14(4)(d): el humano debe poder "disregard, override or reverse" |

#### F · Identidad técnica y delegación
| Campo | Por qué |
|---|---|
| `identidad.modo: autonomous\|delegated` | Consenso Okta/Gartner/CyberArk. **`impersonation` no debe ser un valor válido del enum** — que el esquema lo prohíba |
| `identidad.svid` / `trust_domain` | SPIFFE/SPIRE (CNCF Graduated); CSA `agentId` es un URI SPIFFE |
| `identidad.principal` + `act_chain` + `may_act[]` | RFC 8693: ambas identidades en el token, y `may_act` declara *por adelantado* quién puede actuar por el sujeto |
| `autorizacion.rich_details[]` (recurso + acción + TTL) | RFC 9396 RAR: alcance por instancia de recurso y tiempo, no scopes de string |
| `credenciales: { standing: none, jit_ttl, revocacion }` | Zero Standing Privileges (Britive, Microsoft jul-2026): la credencial muere al terminar la tarea |
| `mcp[]` con `resource_indicator` | RFC 8707 / spec MCP 2025-06-18: binding de audiencia; **prohibido el token passthrough** |

#### G · Evidencia, telemetría y evaluación
| Campo | Por qué |
|---|---|
| `auditoria.campos[]` (mínimo: `agent_id, principal, scope_usado, recurso, accion, timestamp, txn_id, resultado, politica_ref`) | Convergencia Microsoft/Okta/CSA. Art. 12 exige registro automático de eventos |
| `auditoria.retencion_dias >= 180` | **Art. 26(6): "at least six months"**. Que el gate rechace un valor menor |
| `telemetria.sink` + `otel` | **Ningún framework encuestado pone telemetría en el archivo del agente.** Claude Code lo permite vía `env` (`CLAUDE_CODE_ENABLE_TELEMETRY`, `OTEL_*`) — es hueco de mercado y además es lo que alimenta N16 y el motor de brecha |
| `evaluacion.casos[]` + `umbrales` | **ADK EvalSet/EvalCase es el único buen precedente declarativo del mercado.** Y CSA pide `behavioralFingerprints` (hashes de tests pre-despliegue). Sin esto no hay forma de saber si una regeneración del arnés lo empeoró |
| `verificacion_real` | Doctrina propia ya cementada (`test-design-doctrine`): "GET 200" no es verificación. Aplica igual al arnés del cliente |

#### H · Conformidad y ciclo de vida
| Campo | Por qué |
|---|---|
| `conformidad.annex_iii_4: si\|no` + `art_6_3_justificacion` | § 3.1. Si es `si`, el generador debe emitir el expediente Annex IV |
| `conformidad.art_50_divulgacion` | Art. 50(1): informar que se interactúa con IA; (2) marcar contenido sintético. **Aplica desde 2-ago-2026, sin diferimiento** |
| `conformidad.art_26_7_notificacion: { fecha, representantes }` | Notificación a representantes de los trabajadores **antes** de poner en servicio. Es un hecho registrable, y nadie lo registra as-code |
| `conformidad.iso42001.{rol, controles[]}` | Cláusula 4.3 obliga a declarar AI Producer/Provider/User; A.6/A.9 piden documentación técnica y mecanismos de supervisión |
| `distribucion: { marketplace, canal: stable\|latest, default_enabled }` | Mecánica real de Claude Code: dos marketplaces apuntando a refs distintas, asignados por grupo desde managed settings |
| `lockdown: strictPluginOnlyCustomization` | **[INF] Clave de producto**: es lo que hace cumplir técnicamente "el arnés no se edita a mano". Sin ella, cualquier trabajador crea un skill en `.claude/skills/` y el modelo se desincroniza en silencio |

### 7.3 Cinco recomendaciones de doctrina

1. **Prohibir el guardrail en prosa.** El gate debe rechazar un `arnes.yaml` cuyo `guardrails[]` sea todo `mecanismo: prompt` para un arnés con `autonomia >= L3`. Fundamento: *"Permission rules are enforced by Claude Code, not by the model."*
2. **Derivar `autonomia` del puesto, no elegirla.** Un puesto con acciones irreversibles o datos regulados no puede superar L2 sin ratificación explícita del operador. **[INF] Esto convierte una decisión de configuración en una consecuencia del modelo — que es exactamente la tesis del producto.**
3. **Compilar el expediente de conformidad desde el mismo SSoT.** Es la aplicación más obvia y menos ocupada de "un config, dos salidas". El documento humano de Annex IV y el `SKILL.md` salen de la misma fuente o hay drift legal, que es peor que el técnico.
4. **`strictPluginOnlyCustomization` encendido por defecto en el arnés de trabajador (N17), apagado en el del consultor (N14) y el developer (N5).** El trabajador operativo consume; el consultor construye. **[INF] Esto resuelve el riesgo abierto (2) de N17 en la dimensión de gobernanza, aunque no en la de mapeo.**
5. **Medir la supervisión, no declararla.** El campo `verificacion_humana` debe producir telemetría (¿se verificó? ¿en cuánto tiempo? ¿se anuló algo?). Si el ratio de anulación es cero durante meses, o es sospechosamente alto, el twin lo detecta como brecha. **[INF] Es el uso más elegante del loop del producto aplicado a sí mismo, y responde directamente a Ben Green: convierte supervisión individual (que él demuestra que falla) en supervisión institucional medida (que él propone).**

### 7.4 Riesgos que el diseño debe absorber

- **Annex III 4(b)** puede clasificar a Cockpit —no al arnés— como alto riesgo. Decisión de ficha, ver § 3.1.
- **El estándar Agent Skills es minimalista a propósito.** Todo lo de § 7.2 fuera de A y C es extensión propietaria nuestra o de Claude Code. **El arnés será portable en su conocimiento y no portable en su gobierno.** [INF] Conviene decirlo en la doc y no prometer portabilidad total.
- **`allowed-tools` está marcado "Experimental"** en la spec abierta. No cimentar sobre él sin fallback a `permissions` de `settings.json`.
- **La evidencia empírica dice que los agentes autónomos multi-paso fallan mucho** (30% en TheAgentCompany; 2,1% en WorkArena++; colapso pass^1→pass^8 en τ-bench). **[INF] Un arnés que arranca en L3-L4 producirá workslop medible ($186/empleado/mes). El default defendible es L1-L2 con puertas de aprobación, y subir por evidencia de evaluación, no por optimismo.**

---

## § 8 · Fuentes (acceso 2026-07-25)

**Estándares y formatos.** agents.md · github.com/agentskills/agentskills · agentskills.io/specification · agentskills.io/home (showcase) · code.claude.com/docs/en/{sub-agents,settings,hooks,permissions,sandboxing,memory,skills,plugins-reference,plugin-marketplaces,agent-sdk/overview} · anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills · claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code · cdomagazine.tech/aiml/agentic-ai-foundation-launched-to-advance-open-standards · code.visualstudio.com/docs/copilot/customization/custom-agents

**Frameworks.** openai.github.io/openai-agents-python/{agents,handoffs,sessions,tracing,ref/agent_output} · mcp.directory/blog/openai-agentkit-deprecation-2026 · google.github.io/adk-docs/{agents/config,evaluate} · a2a-protocol.org/latest/specification · a2a-protocol.org/latest/topics/agent-discovery · github.com/microsoft/semantic-kernel/blob/main/docs/decisions/0070-declarative-agent-schema.md · learn.microsoft.com/en-us/agent-framework/agents/declarative · learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-yaml-reference · microsoft.github.io/AgentSchema · learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6 · docs.langchain.com/langsmith/configuration-cloud · docs.crewai.com/en/concepts/agents · docs.dify.ai/en/use-dify/workspace/app-management · github.com/JSLEEKR/difyctl · docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent · github.com/letta-ai/agent-file · letta.com/blog/agent-file · docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html · schema.oasf.outshift.com/objects/record · docs.agntcy.org/pages/agws/manifest.html

**Compilación desde modelo org.** arxiv.org/abs/2603.18916 + arxiv.org/html/2603.18916v3 (*Agentic BPM: A Research Manifesto*, Information Systems 140:102738, 2026 — Challenges C1/F2) · arxiv.org/abs/2606.27188 (*A Process Harness for Uplifting Legacy Workflows to Agentic BPM*, Fournier & Limonad, IBM, 25-jun-2026) · cuga.dev · research.ibm.com/blog/cuga-agent-framework · camunda.com/blog/2025/02/building-ai-agent-camunda · docs.camunda.io/docs/components/agentic-orchestration/ai-agents · palantir.com/docs/foundry/agent-studio/overview · ardoq.com/blog/new-agentic-ai-workforce-spring-2026 · leanix.net/en/blog/sap-leanix-announces-launch-of-ai-agent-hub-and-key-industry-partnerships · workday.com/en-us/artificial-intelligence/agent-system-of-record.html · github.com/Workday/asor · ema.ai/additional-blogs/addition-blogs/define-persona-ai-agent · sierra.ai/product/configure-your-agent · celonis.com/news/press/celonis-agentc-making-ai-agents-work-for-the-enterprise-with-process-intelligence · port.io/blog/port-agentic-engineering-platform · github.com/github/spec-kit · kiro.dev/docs/steering · arxiv.org/abs/2604.13346 (AgentSPEX) · arxiv.org/abs/2309.00900 (Large Process Models) · arxiv.org/abs/2607.03228 · arxiv.org/abs/2606.20669

**Gobernanza.** artificialintelligenceact.eu/article/{4,6,9,11,12,13,14,26,50} · artificialintelligenceact.eu/annex/3 · artificialintelligenceact.eu/implementation-timeline · aiactblog.nl/en/annex-iii/werkgelegenheid-personeelsbeheer · mccannfitzgerald.com/knowledge/technology/employment-spotlight-eu-ai-act-draft-guidelines-on-high-risk-ai-classification · gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes · mofo.com/resources/insights/251201-eu-digital-omnibus · addleshawgoddard.com (AI Omnibus provisional agreement) · knowledge.dlapiper.com (Digital AI Omnibus) · nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook · nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf · labs.cloudsecurityalliance.org (NIST agent standards gap; CAISI agenda 2026; Agentic NIST RMF Profile v1 — **propuesta CSA, no NIST**) · isms.online/iso-42001/annex-a-controls · schellman.com/blog/ai-governance/iso-42001-roles-and-responsibilities · iso.org/standard/{77304,42005} · scc-ccn.ca (ISO/IEC 42006:2025) · digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai · papers.ssrn.com/sol3/papers.cfm?abstract_id=2757236 (Elish) · arxiv.org/pdf/2109.05067 (Green) · arxiv.org/abs/2605.16278 (Gaube et al.) · cloudsecurityalliance.org/blog/2026/01/28/levels-of-autonomy + labs.cloudsecurityalliance.org (Autonomy Levels Framework v2) · knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1 · arxiv.org/abs/2502.02649 (Mitchell et al.) · arxiv.org/pdf/2311.02462 (Morris et al.) · salesforce.com/news/stories/agentic-maturity-model · genai.owasp.org/initiatives/agentic-security-initiative · labs.cloudsecurityalliance.org/agentic/agentic-agent-registry-specification-v1 · arthur.ai/column/ai-agent-inventory-enterprises

**Identidad.** cyberark.com/press/machine-identities-outnumber-humans-by-more-than-80-to-1... + cyberark.com/CyberArk-2025-state-of-machine-identity-security-report.pdf · businesswire.com/news/home/20260324161665 · learn.microsoft.com/en-us/entra/agent-id/{what-are-agent-identities,what-is-microsoft-entra-agent-id} · microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents · microsoft.com/en-us/security/blog/2026/07/16/least-privilege-for-ai-agents-identity-access-and-tool-binding · learn.microsoft.com/en-us/security/zero-trust/sfi/least-privilege-for-ai-agents · okta.com/solutions/cross-app-access · developer.okta.com/blog/2025/09/03/cross-app-access · okta.com/identity-101/what-is-ai-agent-identity · auth0.com/blog/{introducing-auth0-for-ai-agents,async-ciba-python-langgraph-auth0} · datatracker.ietf.org/doc/html/draft-ietf-oauth-identity-assertion-authz-grant (draft-04, 21-may-2026) · rfc-editor.org/info/rfc8693 · datatracker.ietf.org/doc/html/rfc9396 · ietf.org/archive/id/draft-chen-oauth-rar-agent-extensions-01.html · datatracker.ietf.org/doc/html/draft-ietf-oauth-transaction-tokens-08 · datatracker.ietf.org/doc/draft-oauth-transaction-tokens-for-agents/00 · ietf-wg-wimse.github.io + datatracker.ietf.org/doc/html/draft-ietf-wimse-arch-04 (§3.4.11) · modelcontextprotocol.io/specification/2025-06-18/basic/authorization · modelcontextprotocol.io/specification/2025-11-25/changelog · aaronparecki.com/2025/11/25/1/mcp-authorization-spec-update · hashicorp.com/en/blog/spiffe-securing-the-identity-of-agentic-ai-and-non-human-actors · cloudsecurityalliance.org/artifacts/agentic-ai-identity-and-access-management-a-new-approach + arxiv.org/pdf/2505.19301 · openid.net/cg/artificial-intelligence-identity-management-community-group · descope.com/blog/post/gartner-report-iam-ai-agents · thehackernews.com/2026/03/5-learnings-from-first-ever-gartner.html · trulioo.com/resources/white-papers/know-your-agent... · arxiv.org/pdf/2505.10609 (Agent Name Service) · w3.org/community/blog/2026/04/24/proposed-group-agent-identity-registry-protocol-community-group · **descope.com/blog/post/ciba-ai-agents-hooks** (CIBA vía hook PostToolUse en Claude Code, 9-jul-2026)

**Evidencia empírica.** arxiv.org/abs/2412.14161 (TheAgentCompany) · proceedings.neurips.cc (WorkArena++) · arxiv.org/html/2505.18878v1 (CRMArena-Pro) · sierra.ai/blog/tau-bench-shaping-development-evaluation-agents · openai.com/index/swe-lancer + arxiv.org/abs/2502.12115 · openai.com/index/{mle-bench,gdpval} + snorkel.ai/gdpval-measuring-ai-on-economically-valuable-real-world-work · cdn.openai.com/papers/...paperbench.pdf · arxiv.org/abs/2510.11977 (HAL) · andonlabs.com/evals/vending-bench-2 + epoch.ai/benchmarks/vending-bench-2 · arxiv.org/abs/2503.14499 + metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks · arxiv.org/abs/2411.15114 (RE-Bench) · **metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study** · demirermert.github.io/Papers/Demirer_AI_productivity.pdf · papers.ssrn.com/sol3/papers.cfm?abstract_id=4573321 + pubsonline.informs.org/doi/10.1287/orsc.2025.21838 (Dell'Acqua) · science.org/doi/10.1126/science.adh2586 (Noy & Zhang) · nber.org/papers/w31161 + academic.oup.com/qje/article/140/2/889/7990658 · mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf (MIT/NANDA) · anthropic.com/research/economic-index-geography + anthropic.com/economic-index · digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine... · census.gov/library/stories/2026/05/ai-use-businesses.html · mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai · gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027 · trychroma.com/research/context-rot · arxiv.org/abs/2407.01502 (AI Agents That Matter) · knightcolumbia.org/content/ai-as-normal-technology · arxiv.org/html/2507.01231v1 (rebuttal a Illusion of Thinking) · aisi.gov.uk/research + github.com/seahop/ai-threat-atlas · hbr.org/2025/09/ai-generated-workslop-is-destroying-productivity + betterup.com/workslop · anthropic.com/engineering/multi-agent-research-system · entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/491396

**Prior art MDE.** Gaia / INGENIAS-IDK / Tropos / PASSI / FIPA — researchgate.net/publication/220608181 · cambridge.org/core/journals/knowledge-engineering-review/article/abs/agentoriented-software-engineering

---

### Fiabilidad — qué está flojo y hay que tratar con pinzas

- **MIT "95% de pilotos fracasan"**: 52 entrevistas + 153 encuestados, no revisado por pares. Direccional.
- **Gartner 40% / Forrester 1-de-4 CIOs**: pronósticos, no mediciones.
- **METR RCT (19% más lentos)**: n=16, los propios autores lo llaman "histórico"; hay indicios de un seguimiento en feb-2026 con resultados distintos que **no pude verificar** en el blog de METR.
- **Anthropic Economic Index y métricas internas de Anthropic**: autorreportadas sobre su propio producto.
- **Stanford Canaries**: observacional, no experimental.
- **GDPval "100x"**: eval de OpenAI sobre modelos propios; excluye el costo de supervisión por admisión de los autores.
- **OWASP ASI01-10**: nombres confirmados vía dos fuentes secundarias; la página oficial confirma publicación y fecha pero no renderizó la lista.
- **"1 humano : N agentes"**: sin ningún estudio riguroso. Territorio de claim de vendor.
- **"NIST AI RMF Agentic Profile v1"**: es de la CSA, **no de NIST**. Error de atribución frecuente.
- **CRMArena original (2024)** y el detalle de niveles de Mitchell et al.: no pude extraer las tablas completas.
