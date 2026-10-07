# SOTA · Process Intelligence / BPM — iGrafx · Celonis · BusinessOptix · ARIS

> Investigación CK-21 (2026-07-15/16) — SOTA "organization as code / Digital Twin of an Organization".
> Fuente: subagentes WebFetch/WebSearch sobre sitios de vendors + prensa + docs. Parte del corpus
> `docs/research/organization-as-code/` (ver README).

## iGrafx — Process360 Live

Positioning 2026: "The Agentic Process Foundation — Process Intelligence for AI-Driven Operations."

- **Módulos:** Process360 Live = Process Design (modeling/mapping) + Process Mining (de la adquisición
  Logpickr 2022) + Process Simulation (módulo dedicado 2024) + AI-enabled Process Repository (system of
  record gobernado) + Pia (asistente GenAI, oct 2024). Línea legacy: FlowCharter/Process/Origins.
- **Modeling:** BPMN swimlanes, flowcharts, customer journey mapping, value-stream, RACI/roles.
  Repositorio central gobernado; documentos, controles, riesgos y reglas de negocio se anclan a los
  modelos.
- **Mining:** as-is discovery, cuellos de botella, variantes con análisis de tareas concurrentes
  (reducción de variantes hasta 80%), conformance checking vs modelo de referencia (acelera auditorías).
  Task mining desktop. Alertas predictivas.
- **Simulación:** módulo dedicado — hipótesis what-if, cuantifica impacto pre-implementación, ranking
  ROI de iniciativas.
- **KPIs:** dashboards customizables, reporting real-time, tracking vs estrategia corporativa; Pia
  genera dashboards desde lenguaje natural.
- **AI:** Pia (oct 2024) — genera diagramas de proceso desde SOPs/docs no estructurados,
  text-to-process, queries NL vía iGrafx Query Language (IQL), dashboards NL. 2025-26: pivote a
  "Agentic Process Foundation" (capa de visibilidad/contexto/guardrails para agentes AI en industrias
  reguladas). Ene 2026: alianza NTT DATA INTRAMART ("Autonomous Operations").
- **Conectores:** 100+ sistemas (mining), definición low-code de conectores, API abierta, RPA.
- **Gobernanza:** versionado, audit trails, workflows de aprobación, comentarios; compliance embebido
  (checkpoints de control, separación de funciones, SOX/HIPAA/ISO/OSHA); solución Risk & Compliance.
- **Deployment:** SaaS y private cloud; 2000+ clientes enterprise.
- **Diferenciador:** BPM-heritage design+mining+simulación en un repo gobernado, reposicionado como
  capa de compliance/guardrails para agentes AI.

## Celonis — Process Intelligence Platform

- **Módulos:** Data Core (capa de datos zero-copy bidireccional a lakes — Databricks/Azure, 2025) ·
  Process Intelligence Graph / Context Model ("representación system-agnostic real-time de todo el
  negocio; the missing piece of your Enterprise AI stack") · Process Mining (incl. Object-Centric
  Process Mining/OCPM) · Task Mining (nivel keystroke) · PQL (Process Query Language, 150+ operadores) ·
  Studio (Views/Knowledge Models/Apps) · Action Flows · Orchestration Engine (adq. Emporix, GA 2025) ·
  ML Workbench · Process Copilot (GenAI, GA mayo 2025) · AgentC (suite agéntica 2024-25) · Annotation
  Builder (recomendaciones GenAI no-code, GA 2025) · Solution Suites 2025 (Supply Chain/Sustainability/
  Finance/Front Office) · Marketplace. Comercial: Analyze/Design/Operate.
- **Modeling:** NO es suite BPMN — modela el proceso as-run desde datos; modelo objeto-céntrico;
  conformance vs modelos target.
- **Mining:** líder del mercado (Gartner MQ Leader 2026, Everest PEAK 7 años); OCPM; task mining;
  variantes, conformance, root cause.
- **Simulación:** simulaciones, predicciones, what-if (Analyze); ML Workbench.
- **KPIs:** Views/dashboards, monitoreo real-time, adherencia/conformance, benchmarking, monitoreo de
  actividad de agentes AI.
- **AI (la historia insignia):** Process Copilot (chat sobre process data, en Slack/Teams) · AgentC:
  Process Intelligence API alimentando contexto/métricas/acciones a Microsoft Copilot Studio, Amazon
  Bedrock, Salesforce Agentforce · primer MCP server de process intelligence del mundo (2025) ·
  Orchestration Engine orquesta humanos+agentes+sistemas · lema "No AI without PI."
- **Conectores:** SAP/Oracle/Infor, Salesforce, Snowflake/BigQuery/Databricks, Tableau/PowerBI/Qlik,
  ServiceNow/Camunda/Appian, AWS/Azure/GCP; cientos de extractores, Replication Cockpit SAP real-time.
- **Gobernanza:** RBAC, spaces/teams, audit; gobernanza de agentes vía monitoring + contexto PI.
- **Deployment:** SaaS cloud-native only. Enterprise global, bajando a mid-market vía Solution Suites.
- **Diferenciador:** el Process Intelligence Graph como "capa de contexto" del AI enterprise — moat de
  datos de mining, cableado a toda plataforma de agentes vía AgentC + MCP.

## BusinessOptix

- **Módulos:** Process Mapping & Modeling · Repository & Documentation · Rapid Process Discovery with
  AI (**Discovery Agent**) · Process Mining · Target Operating Model Design · Scenario Modeling &
  Simulation · Transformation Planning & Analysis · Dashboards & Insights.
- **Modeling:** diagramas con tareas/roles/accountability/flujo de información; BPMN import/export
  (+VSDX/PDF/imagenes); as-is + to-be; estandarización cross-función/geografía; **Target Operating
  Model** (todo el modelo operativo, no solo procesos). Repositorio único siempre-vigente;
  **auto-genera SOPs, instructivos de trabajo y material de training desde los modelos**.
- **Discovery dual:** mina datos de sistemas O captura vía entrevistas ("aun sin datos").
  **Discovery Agent**: un-click SOP/PDF/Word/PPT/Excel/imagen → modelo de proceso; **chatbot que
  entrevista SMEs** y facilita discovery/modelado; librerías de frameworks best-practice.
  **Mining:** CSV/XES/XML + ODBC; DFG, cuellos de botella, idle-time, desviaciones, conformance vs BPMN
  importado, rework loops, decision-rule mining, root cause; cargas incrementales.
- **Simulación (fuerte):** escenarios comparados con costos FTE, tiempos, assessment RPA integrado;
  de-risk antes de invertir.
- **KPIs:** monitoreo real-time, charts custom, visualización geográfica, riesgo/oportunidad, ROI de
  transformación.
- **AI:** Discovery Agent shipped; roadmap: Analysis Agent + Knowledge Agent (guía personalizada en el
  flujo de trabajo).
- **Conectores:** RPA/ERP/analytics, API abierta, iPaaS a pedido (catálogo más delgado que los grandes).
- **Gobernanza:** versionado + workflows de aprobación con audit trail completo; ciclos review/approve
  con process owners; RBAC; MFA; **ISO 27001:2022 certificada**.
- **Deployment:** SaaS puro; fundada 2006, Kansas City, 11-50 empleados, go-to-market vía canales/BPOs
  (WNS construyó su plataforma de finance-transformation encima). Mid-market→enterprise.
- **Diferenciador:** consultor-in-a-box — discovery por entrevistas + documentos con AI (sin event
  logs) alimentando Target Operating Model + simulación. Process intelligence para orgs sin datos
  minables. **[Nota Cockpit: el análogo más cercano a Consultio]**

## ARIS (standalone bajo Software GmbH/Silver Lake desde ene 2025)

Positioning 2026: "Process Intelligence for the AI Era" — plataforma para desplegar y gobernar
Agentic AI.

- **Pilares:** **Process Core** (digital twin gobernado: procesos, roles, reglas, controles, sistemas) ·
  **Process Mining** (incl. Task Mining) · **Agentic AI** (detección de oportunidades, agentes
  entrenados sobre la base de procesos, controles de gobernanza). Ediciones: Basic (1-20 users, 7 tipos
  de modelo) / Advanced (≤200, 100+ tipos) / Enterprise (ilimitado, private cloud u on-prem).
  Extensiones: SAP Solutions, Risk & Compliance (ICS), Simulation, 3rd-party Integration, Document
  Storage, SharePoint, Rollout, RPA. ARIS AI Companion (GenAI, SR27 nov 2024). Process Accelerators
  (contenido prebuilt).
- **Modeling:** la cobertura de notación más rica — EPC, BPMN 2.0, organigramas, value stream maps,
  VAC, SIPOC, customer journeys, modelos riesgo/control — 100+ tipos; "ARIS Method" como framework.
  Repositorio multi-DB enterprise; **patrón repo dual dev-vs-publicado**; versionado; convenciones de
  arquitectura de procesos.
- **Mining:** event logs cross-sistema, cuellos de botella, gap analysis, conformance (incl. overlay
  de mining sobre modelos EPC — SR27), root cause, índice de madurez de procesos; "systems, people,
  and agents". Task Mining: grabadores de pantalla desktop, auto-genera modelos de tarea, detecta
  workarounds.
- **Simulación:** extensión — what-if, cuellos de botella, potencial de mejora; SR27: atributos de
  mining (duraciones/frecuencias reales) alimentan la simulación.
- **KPIs:** dashboards, KPIs de mining visualizados sobre los modelos; **campos calculados generados
  por AI** (GenAI escribe el código del KPI); conformance monitoring.
- **AI:** AI Companion (nov 2024): NL→EPC/BPMN; búsqueda semántica sobre el repositorio (quién es
  responsable, riesgos+mitigaciones); campos calculados AI; descripciones automáticas. 2025-26: pilar
  Agentic AI — oportunidades de automatización desde task+process data, agentes entrenados sobre la
  base gobernada, gobernanza de agentes.
- **Conectores:** **550+ conectores/integradores**; extensión SAP (test/rollout de procesos SAP);
  SharePoint; RPA; APIs.
- **Gobernanza (la más fuerte de las 4):** **ARIS Process Governance** (workflows BPM automatizables
  dentro del repositorio), **Release Cycle Management** (cambio de modelo→review→aprobación→release;
  repos dev + producción), versionado, publicación por rol. Risk & Compliance: ICS, compliance
  monitoring vía mining, resiliencia operacional. Portal de publicación para consumidores, comentarios,
  comunidad+academia.
- **Deployment:** espectro completo — shared public cloud (Basic/Advanced), private cloud u on-prem
  (Enterprise). Enterprise regulada (banca, manufactura, salud, gobierno).
- **Diferenciador:** el repositorio enterprise gobernado — notaciones más profundas + release-cycle
  governance + GRC/ICS, vendido como la base de confianza para AI agéntica; el único con on-prem
  verdadero. **[Nota Cockpit: su repo dual dev/publicado + Release Cycle Management valida nuestro
  modelo dev/UAT/prod sobre git]**

## Matriz cruzada (checklist feed)

| Capability                   | iGrafx                            | Celonis                                    | BusinessOptix                     | ARIS                                               |
| ---------------------------- | --------------------------------- | ------------------------------------------ | --------------------------------- | -------------------------------------------------- |
| BPMN modeling                | Sí (swimlanes)                    | No (modelos derivados de datos)            | Sí (import/export)                | Sí (BPMN 2.0 + EPC + 100+ tipos)                   |
| Journey / org / value-stream | Journeys sí                       | No                                         | Operating models (TOM)            | Journeys + org charts + VSM                        |
| Repositorio gobernado        | Sí (AI-enabled)                   | Parcial                                    | Sí                                | Sí (el más fuerte: repo dual + release cycles)     |
| Process mining               | Sí (conformance, concurrencia)    | Best-in-class (OCPM, PQL)                  | Sí (básico-medio)                 | Sí (incl. overlay EPC)                             |
| Task mining                  | Sí                                | Sí (keystroke)                             | No                                | Sí (screen recorders)                              |
| Simulación/what-if           | Sí (módulo dedicado)              | Sí (data-driven)                           | Sí (escenarios FTE/costo)         | Sí (extensión, alimentada por mining)              |
| KPIs real-time               | Sí                                | Sí (el más fuerte)                         | Sí                                | Sí                                                 |
| Copiloto GenAI               | Pia (2024)                        | Process Copilot (2025)                     | Discovery Agent (entrevista SMEs) | AI Companion (2024)                                |
| Doc→modelo                   | Sí (Pia, SOPs)                    | No (mina en su lugar)                      | Sí (one-click SOP)                | Sí (NL→EPC/BPMN)                                   |
| Capa agéntica                | Agentic Process Foundation (2026) | AgentC + MCP server + Orchestration (2025) | Suite de agentes (roadmap)        | Pilar Agentic AI + gobernanza de agentes (2025-26) |
| Conectores                   | 100+                              | Los más profundos (SAP/lakes zero-copy)    | API/iPaaS a pedido                | 550+                                               |
| Aprobaciones/versionado      | Sí                                | Limitado                                   | Sí (audit trail)                  | Sí (Process Governance engine)                     |
| GRC/ISO/SOX                  | SOX, HIPAA/ISO/OSHA               | Conformance-based                          | ISO 27001 (empresa)               | Risk & Compliance ICS                              |
| On-prem                      | Private cloud                     | No (solo SaaS)                             | No (solo SaaS)                    | Sí (Enterprise)                                    |
| Sweet spot                   | Enterprise regulada BPM           | Enterprise global data-rich                | Mid-market/BPO                    | Enterprise regulada grande                         |

**Patrón de mercado (clave para Cockpit):** los 4 convergieron 2024-2026 en la misma tesis — el
repositorio/grafo de procesos como *capa de contexto y gobernanza para agentes AI* (iGrafx "Agentic
Process Foundation", Celonis "No AI without PI" + MCP, ARIS "governed foundation for agentic AI",
BusinessOptix agentes). El discovery por documentos/entrevistas con LLM (Discovery Agent, Pia, AI
Companion) ya es table stakes junto al mining por logs. Nuestra tesis (arneses ejecutables por rol) es
la versión más radical de esta convergencia: ellos dan contexto a agentes ajenos; nosotros entregamos
el agente del puesto.

## Fuentes

- igrafx.com y páginas de Process360 Live
- PRNewswire — lanzamiento Pia
- BusinessWire — adquisición Logpickr y alianza NTT DATA INTRAMART
- celonis.com/platform
- Prensa AgentC · Celonis Next 2025
- Docs Celonis: PQL / Task Mining / OCPM
- businessoptix.com (platform overview, rapid-discovery-ai-accelerator)
- processmining-software.com/tools/businessoptix
- aris.com (platform, ai-companion, SR27 release notes, rebrand press)
- ariscommunity — ediciones
- Datasheet ARIS Simulation
