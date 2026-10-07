# SOTA · Enterprise Architecture / Management — Bizzdesign · Ardoq · edgeTI · Bee360

> Investigación CK-21 (2026-07-15/16) — SOTA "organization as code / Digital Twin of an Organization".
> Fuente: subagentes WebFetch/WebSearch sobre sitios de vendors + prensa + docs. Parte del corpus
> `docs/research/organization-as-code/` (ver README).

## Bizzdesign (fusión 2025: Bizzdesign + MEGA International + Alfabet)

- **Portafolio "Enterprise Transformation Suite":** **Horizzon** (EA clásico) · **Alfabet** (IT
  portfolio) · **Hopex** (ex-MEGA: operaciones/GRC/data) · **Unify** (capa AI-nativa de colaboración
  visual, abr 2026 — whiteboard + repositorio enterprise + agentes AI). Soluciones: EAM, APM, SPM,
  BAM, SAM, BPM, Data Mgmt, GRC, TPM.
- **Modeling:** ArchiMate (metamodelo core) + BPMN, UML, ERD, C4; capas motivación/estrategia de
  ArchiMate; capability-based planning; BIZBOK; especialización de elementos = extensión de
  metamodelo; repositorio central. Gartner MQ Leader EA 2025; Forrester Wave Leader.
- **Auto-ingesta:** ServiceNow (CMDB bidireccional, mapeo CSDM↔ArchiMate out-of-the-box), Flexera
  Technopedia, Eracent IT-Pedia (lifecycle tecnológico), CAST Highlight, Apptio, conectores cloud
  AWS/Azure/GCP, Excel/SQL; recolección/normalización automatizada vía API.
- **What-if:** análisis de escenarios, roadmapping estrategia→ejecución, análisis de
  impacto/dependencias cross-dominio, arquitectura time-aware (current/target).
- **KPIs:** dashboards por rol, self-service analytics, heatmaps, conector Power BI.
- **AI 2024-26 (fuerte):** **capa "Agentic Intelligence" vía MCP** (asistentes agénticos que razonan
  sobre el repositorio EA); queries NL (texto o voz) disparando workflows multi-paso; diagramas no
  estructurados→ArchiMate; texto narrativo→BPMN; descripciones auto-generadas; **módulo de gobernanza
  de AI** (portafolio de iniciativas AI de la empresa: madurez, riesgo, alineación); Unify: agentes
  "co-worker" que resumen diseños, recomiendan mejoras, exponen dependencias/riesgos para
  no-arquitectos.
- **Conectores:** 25+ OOTB (ServiceNow, Jira, Azure DevOps, Confluence, SharePoint, Teams, Apptio,
  ARIS, puente CDATA 50+ apps); REST + GraphQL APIs.
- **Gobernanza:** portal Horizzon para stakeholders (consumo/feedback); workspaces compartidos
  negocio+IT; workflows de aprobación/review; repo versionado con separación diseño-vs-publicado.
- **Deployment:** SaaS-first. Enterprise regulada (Toyota, NatWest, HSBC, Shell, NHS, Airbus).
- **Diferenciador:** tres stacks Gartner-Leader fusionados + capa AI-nativa de colaboración (Unify)
  sobre un repositorio ArchiMate riguroso.

## Ardoq

Relanzada como "AI-first EA platform" (mayo 2026); "New Ardoq Experience" GA abr 2026.

- **Componentes:** **Ardoq Discover** (portal de lectura para stakeholders) · **Surveys**
  (crowdsourcing de datos a escala) · **Broadcasts** (mensajería/triggers automatizados) ·
  **Presentations** · **Dashboards & Reports** · **Scenarios** (estados futuros branch/merge) ·
  **ShiftX** (modelado de procesos liviano con AI) · **AI Lens** (gobernanza del panorama AI del
  cliente; templates EU AI Act) · **AI Labs** · **MCP server**. Templates: App Rationalization, APM,
  Business Capability Modeling, ERP Transformation, Strategy-to-Execution, Cloud Migration, Data
  Lineage.
- **Modeling:** deliberadamente NO notation-first (sin lock-in ArchiMate) — **metamodelo totalmente
  flexible definido por el cliente sobre base de datos grafo-nativa**; modela estrategia, proyectos,
  procesos, capacidades, value streams, personas/org, aplicaciones, integraciones, infraestructura,
  datos. Relaciones auto-mantenidas.
- **Auto-ingesta:** librería de integraciones + workflows automatizados de sync; **Data Ingestion
  Agent** y **Contract & Document Extraction Agent** (contratos/PDFs/hojas → modelo); **AI Visual
  Importer** (parsea diagramas); surveys para crowdsourcear datos de expertos de dominio.
- **What-if:** **Scenarios — branch de un estado futuro, evaluar/comparar, merge de vuelta**
  [Nota Cockpit: git nos da esto gratis]; roadmaps; filtros grafo = análisis de impacto visual
  one-click; **campos calculados sobre el grafo** (costo, criticidad, riesgo auto-computados);
  Gremlin como query language.
- **KPIs:** dashboards self-service real-time, scoring de riesgo automatizado, modelos/reportes que se
  actualizan dinámicamente, Discover para consumo no-técnico.
- **AI 2024-26 (la más agresiva):** **Omnipresent AI Assistant** (Q&A en inglés plano sobre el estate
  con **decision traces completos** — audit-ready); **AI Architects / Custom Agents** (mayo 2026):
  construcción no-code de agentes scoped al metamodelo+workflows propios (claim: automatiza ~40% del
  trabajo EA rutinario); agentes con nombre: App-to-Capability Mapping, Value Stream Mapping,
  Contract & Document Extraction, **Foundation Insights** (vigila anomalías/calidad de datos
  continuo), Data Ingestion; MCP server (caso Tenneco: 6 agentes en MS Teams Copilot, claim 292% ROI);
  AI Lens.
- **Conectores:** Excel, ServiceNow ("el más flexible del mercado"), **Celonis** (Process
  Intelligence), Lucidchart, SAP Signavio, Azure/AWS, Jira, Entra ID, Confluence/SharePoint embed,
  IT-Pedia; REST API + webhooks; grafo propietario Gremlin-queryable.
- **Gobernanza:** **usuarios ilimitados en todos los planes** (pricing por aplicación gestionada);
  Surveys+Broadcasts = loops de data-stewardship integrados; workflows de aprobación; Scenarios
  branch/merge = versionado de futuros; decision-trace de acciones AI.
- **Deployment:** SaaS multi-tenant only. Mid/large enterprise. Gartner Peer Insights Customers'
  Choice 2026.
- **Diferenciador:** metamodelo flexible grafo-nativo + crowdsourcing (surveys/broadcasts/usuarios
  ilimitados) fusionado con la línea agéntica shipped más concreta del EA (agentes con nombre + MCP +
  decision traces).

## edgeTI — edgeCore

NO es EA clásico — plataforma de "Digital Twin of an Organization" operacional real-time (Gartner DTO
Market Guide 2023; defensa/federal; TSXV).

- **Producto:** **edgeCore™** (4.5): Pipeline View, Web Adapter, SDK; temas: Total eXperience,
  Decision Intelligence, Intelligent Automation, Composable Operations, Security Service Edge (proxy
  seguro de apps), Low-Code, Lean Hybrid Integration.
- **Modeling:** sin repositorio de metamodelo. Twin operacional vivo en 3 dimensiones: cómo trabaja y
  rinde / cómo consume y despliega recursos / cómo entrega valor y experiencia. Apps composables sobre
  datos federados vivos ("data mesh") — sin data warehouse, sin migrar sistemas.
- **Ingesta (su esencia):** **225+ adapters prebuilt** (ServiceNow, Salesforce, SAP, Oracle, Workday,
  Jira, Splunk, AppDynamics, New Relic, SolarWinds, Prometheus, Elastic, Docker, K8s, VMware, Citrix,
  UiPath, Blue Prism, Automation Anywhere, OpenAI, SageMaker, GCP, Azure) + SDK build-your-own + web
  adapter para sistemas legacy sin API (integración a nivel pantalla + proxy seguro).
- **What-if:** exploración de opciones operacional (courses of action), no roadmapping EA.
- **KPIs (core):** single pane of glass real-time, situational awareness, dashboards compuestos por
  rol; NOC/SOC/AIOps/FinOps.
- **AI:** Decision Intelligence = operacionalización segura de AI en workflows (OpenAI/SageMaker/
  Azure/Google en flujos operativos); "Orchestrated AI"; automatización asistida→delegada→autónoma.
  Sin copiloto propio.
- **Deployment:** **on-premise o tu nube (K8s-nativo), incluso air-gapped**; federal/defensa,
  gobierno, MSPs, smart cities.
- **Diferenciador:** twin operacional vivo sobre 225+ adapters real-time desplegable air-gapped — la
  vista "as-operated" que las herramientas EA no tienen (y nada de la disciplina de repositorio que
  ellas sí). [Nota Cockpit: valida self-hosted como tier para regulados]

## Bee360

Alemana (ex-bee4IT); "Integrated IT Management". Gartner MQ EA 2025 Niche Player. Clientes: RWE,
Miele, Voestalpine.

- **Módulos:** Strategic Portfolio Management (iniciativas, repriorización dinámica) · IT Financial
  Management (ciclo de costo completo) · EA Management ("Fast Track EA") · Capacity/Resource Planning ·
  Rolling Planning · **BeeCore** (modelo de dirección propio: 5 prácticas adaptativas de gobernanza IT
  por nivel de madurez).
- **Modeling:** business capability maps como lenguaje común; portafolio de aplicaciones
  (clasificaciones + BIAs, carga Excel); paisaje técnico con interdependencias; radares de tendencias;
  estrategia→arquitectura target→roadmap. **Metamodelo propietario — sin ArchiMate/BPMN**;
  extensibilidad limitada. Reviewers lo describen como "digital twin de la organización" vía el modelo
  único estrategia–portafolio–arquitectura–costo.
- **Ingesta:** delgada — conectores ERP para actuals financieros; Jira, GitLab, Azure DevOps, SAP,
  ServiceNow; Excel.
- **What-if:** roadmapping + escenarios conectados a **modelado presupuestal** (su ángulo distintivo:
  escenarios preciados en dinero y capacidad); análisis de varianza automatizado; repriorización
  dinámica.
- **KPIs:** dashboards por stakeholder (CEO/CFO/CIO/cost-center); transparencia financiera total;
  vistas de capacidad; facturación/settlement automatizado; claim "reduce esfuerzo de control hasta
  95%". Modelos de costo: TBM, CIGREF, propio.
- **AI:** **nada shipped ni anunciado 2024-26** — el white space más claro del grupo.
- **Gobernanza:** workflows configurables + aprobaciones; Kanban para artefactos de arquitectura;
  surveys automatizadas de riesgo; RBAC; ISO 27001.
- **Deployment:** SaaS multi-tenant; pricing fee anual indexado al volumen de costo gestionado;
  implantación 3-9 meses consulting-led; industriales europeos grandes.
- **Diferenciador:** un modelo de datos nativo donde cada objeto de arquitectura lleva
  costo/capacidad/portafolio vivo — decisiones EA expresadas directamente en dinero. [Nota Cockpit:
  la dimensión económica del twin — brechas y escenarios preciados — es la lección a copiar]

## Matriz cruzada

| Capability | Bizzdesign | Ardoq | edgeTI | Bee360 |
|---|---|---|---|---|
| Modeling estándares (ArchiMate/BPMN/UML/C4) | ✅ todos | ❌ (metamodelo flexible) | ❌ | ❌ propietario |
| Metamodelo custom/flexible | parcial | ✅ core strength | N/A | limitado |
| Graph DB + graph query | ❌ (GraphQL API) | ✅ (Gremlin) | ❌ (data mesh) | ❌ |
| Auto-discovery/ingesta viva | ✅ (ServiceNow/CSDM, cloud) | ✅ (agentes + surveys) | ✅✅ (225+ adapters, su esencia) | ⚠️ delgada |
| Scenarios/what-if/roadmaps | ✅ | ✅ (branch/merge) | ⚠️ solo operacional | ✅ (preciado en dinero) |
| Dashboards ops real-time | ❌ | ⚠️ near-real-time | ✅✅ | ❌ |
| Agentes AI/copiloto shipped 24-26 | ✅ (MCP layer, Unify, text→model) | ✅✅ (agentes con nombre, MCP, AI Lens) | ⚠️ (orquestación AI) | ❌ |
| Crowdsourcing (surveys/portales) | ✅ (Horizzon) | ✅✅ (Surveys+Broadcasts+Discover, usuarios ilimitados) | ❌ | ✅ (surveys, Kanban) |
| Gestión financiera nativa | vía Alfabet/Apptio | campos calculados | vistas FinOps | ✅✅ (ITFM grado TBM) |
| On-prem | ⚠️ SaaS-first | ❌ | ✅ (incl. air-gapped) | ❌ |

**Patrones:** los 3 EA convergieron 2025-26 en **MCP como el seam de integración de agentes**;
"gobernanza del portafolio AI del cliente" es categoría nueva de módulo (Ardoq AI Lens, Bizzdesign AI
governance); doc/diagrama→modelo vía LLM ya es table stakes. Bee360 compite con finanzas integradas en
vez de AI; edgeTI con datos operacionales vivos en vez de modelado.

## Fuentes

- bizzdesign.com (transformation-suite/horizzon, ai-capabilities, apis-integrations)
- ardoq.com (platform-overview, features, integrations)
- edgeti.com (platform, dto, edgecore)
- bee360.com (what-bee360-offers, enterprise-architecture-management, it-financial-management)
- Prensa de lanzamientos AI
- Gartner Peer Insights
