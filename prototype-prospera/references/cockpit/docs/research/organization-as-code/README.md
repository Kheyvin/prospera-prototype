# Research — Organization as Code / Organization Twin (CK-21)

**Origen:** conversación estratégica CEO/CTO del operador (2026-07-15/16) en 3 rondas: (1) pivote comercial cloud vs self-hosted + análisis de fallas de la propuesta multitenant; (2) SOTA organization-as-code (Catio/Backstage/Palantir/DTO/GitLab/DEMO/LLM-sim); (3) deep-dive de 11 vendors (3 subagentes de investigación) + features Gartner DTO → lista maestra TO-BE + MVP.

**Decisión:** ficha **CK-21** en LEDGER.md; VISION.md actualizada en el mismo evento.

## Índice

| Doc | Contenido |
|---|---|
| `01-sota-process-intelligence.md` | iGrafx · Celonis · BusinessOptix · ARIS |
| `02-sota-ea-management.md` | Bizzdesign · Ardoq · edgeTI · Bee360 |
| `03-sota-capture-y-dto-kyp-mavim.md` | KYP.ai · Mavim |
| `04-doctrina-ontologia-palantir.md` | gramática de diseño adoptada para objeto.schema |
| `05-sota-organization-as-code.md` | categoría, precedentes, frontera, jugada única |
| `06-gartner-dto-features.md` | lista Gartner ago-2025 verbatim + mapeo |
| `07-capability-list-tobe.md` | 37 capacidades etiquetadas + MVP + derivación de arquitectura |
| `08-pivote-comercial.md` | default hosteado single-tenant, portal, licencias, entornos |
| **`09-sota-dto-2026-fuente-primaria.md`** ★ | **2026-07-25 (CK-30)** — Market Guide de Gartner **completo en PDF** (G00785499) · la cita de The Open Group que cierra el debate as-code (*"not intended as a persistent file format"*) · crítica académica del DTO (Becker&Pentland · Lyytinen: causalidad bidireccional + 6 obstáculos) · el renombre 2026 (Celonis→Context Model, Skan→Context Graph) · simulación organizacional en arXiv 2026 + su crisis de validez · DEMO/ISO 15704 como hueco huérfano. **Corrige a `01`/`02`/`05`/`06` en 2 puntos** (ArchiMate 4 existe; MQ de DTO = *forthcoming*, no publicado) |
| **`10-sota-arnes-as-code.md`** ★ | **2026-07-25 (CK-30)** — anatomía comparada de config de agente as-code (AGENTS.md · Agent Skills · Claude Code · ADK · A2A · Copilot Studio · CrewAI · Letta · Bedrock AgentCore…) · **veredicto: nadie compila la config del agente desde un modelo organizacional** (negativo verificado + Challenge C1 del *Agentic BPM Manifesto*) · gobernanza (EU AI Act Annex III 4(b) + Art.14/26 · NIST · ISO 42001 · HITL/HOTL y la crítica Elish/Green) · autonomía CSA L0-L5 · identidad y delegación (RFC 8693/9396, CIBA, Entra Agent ID) · evidencia empírica con números · **los campos propuestos del arnés** |

| **`11-sota-process-as-code-y-metricas.md`** ★ | **2026-07-25 (CK-30)** — cierra las 5 líneas restantes: **process-as-code / workflow engines** (Camunda 8 · Temporal · Argo · Airflow · Dagster · Step Functions · **SpiffArena** = el prior art de "proceso de negocio en git") · **anatomía completa de Backstage** (envelope, 9 kinds, 7 relaciones y su derivación por *stitcher*, Location, Software Templates) + Port.io y Cortex · **OCEL 2.0** (meta-modelo formal, veredicto: **alimentador del Lakehouse, no competidor**) · **modelo→trabajo ejecutable** (UiPath Maestro, IBM "Bob", el patrón AOP) · **métricas-as-code** (dbt · Cube · Lightdash · OpenSLO · Prometheus). **⚠ Contiene autocrítica verificada:** nuestro gate valida el schema, no las instancias |

★ = fuente directa de **CK-30** (D-19/D-20/D-21 + M46).

**Nota:** hermano de `docs/research/rediseno-total/` (CK-18). Aquel definió la arquitectura física; éste define la visión de producto y el TO-BE funcional.

**Pendientes declarados dentro de `11`** (no rellenados): runner CLI de los BPMN unit tests de SpiffArena · privacidad de Celonis Task Mining (gateada) · generación documental de Celonis Process Management (ex-Symbio) · provisioning-as-code de thresholds de Grafana · Nobl9 · schema público del AOP de Decagon/Skan · benchmark académico model→text (**no existe**). Y **no citar**: "dbt Canvas", "dbt MCP server", "Cube D3" (no verificados).
