# SOTA · Captura ground-truth + DTO — KYP.ai · Mavim

> Investigación CK-21 (2026-07-15/16) — SOTA "organization as code / Digital Twin of an Organization". Fuente: subagentes WebFetch/WebSearch. Parte del corpus `docs/research/organization-as-code/` (ver README).

## KYP.ai — Agentic Process Intelligence

Tagline 2026: **"The Must-Have for Agentic AI."** Berlín, fundada 2018. Reconocimientos: **Leader** en Everest Digital Interaction Intelligence (DII) PEAK Matrix 2025 · citada en **Gartner Market Guide for Task Mining 2025** · **Strong Performer** en Forrester Wave Process Intelligence 2025.

### Los 3 pilares

1. **360° Enterprise View** — captura real-time de personas/procesos/tecnología: la "operational truth" de la organización.
2. **Business Transformation Engine** — cuantifica ineficiencias, calcula ROI de automatización y produce un pipeline de oportunidades **rankeado por ROI**.
3. **Agentic AI Enabler** — genera contexto de negocio estructurado + **código de agente production-ready** desde los datos de proceso observados.

### Componentes de la plataforma

- **KYP ConnectApp** — agente de endpoint que captura el **100% del trabajo humano**, con <2% de CPU; corre en Windows/macOS/Citrix/VDI/sistemas legacy; probado en 10.000+ estaciones de trabajo.
- **Ops Monitoring** — capacidad/carga/performance real-time.
- **Process Discovery** — mapeo de procesos con AI, con recomendaciones rankeadas por ROI.
- **AI Concierge** — interfaz conversacional; "de la pregunta al código de agente en una conversación".
- **KYP IDB** — base de datos de integración: normaliza y joinea datos externos.
- **Tech Pulse** — telemetría de sistema/hardware.

### Modeling (postura)

NO modela to-be ni estrategia — construye el **as-is observado**: mapas end-to-end desde la actividad digital real (cada variante, handoff, excepción, workaround, rework), continuamente vigentes. Auto-genera SOPs desde los workflows capturados + trackea la adherencia a esos SOPs. Postura explícitamente **anti-modeling**: "process maps que estaban desactualizados el día que se dibujaron"; entrevistas/logs/documentación son "proxies de la verdad".

### Mining (captura)

Captura desktop por **eventos estructurados** (no screenshots), sin start/stop manual, sin sampling. **Claim central: el process mining por event-logs solo ve ~25-30% del trabajo (las transacciones de sistema); KYP captura el otro ~70%** — emails, hojas de cálculo, copy-paste, pasos manuales cross-app. Cubre los casos de uso del mining pero sin necesitar logs: mapas de proceso, cuellos de botella, cycle-time, variantes, conformance, rework. Time-to-value: "live en días, insights estadísticamente relevantes en 3 semanas."

### Simulación

Débil — solo un "simulated ROI business case" por recomendación (payback, retorno esperado, costo de implementación). Es simulación **financiera**, no simulación de procesos.

### KPIs / monitoreo

- **Continuous Operations Steering:** capacidad, utilización, shrinkage y cargas en real-time.
- Dashboards por rol/equipo/individuo.
- Benchmarking remoto-vs-presencial.
- Inteligencia de uso de aplicaciones/licencias (detección de waste).
- Todo expresado en **impacto $** — casos: Alorica **$2.5M/año** · Allied Global **3.0x ROI en 90 días** (5.999 empleados) · Hollard **20% productividad** · Qatar Airways **+34pp de tiempo productivo** · Mindsprint **600+ procesos**.

### AI (la apuesta 2025-26)

**Generación de código de agentes:** único player de Process Intelligence que genera **código production-ready + contexto de negocio estructurado** desde los datos de proceso observados. Plataforma-agnóstico: **UiPath Studio, SAP Joule, Microsoft Copilot Studio, n8n, Camunda**. Doctrina: "los agentes que se suman a la fuerza laboral necesitan inducción; esa inducción es data humana ground-truth." El AI Concierge se personaliza por rol (COO vs team lead vs empleado).

### Conectores

Postura "**sin conectores para capturar**" — el agente desktop ES la fuente. Para salida: API completa + KYP IDB (Power BI, Tableau, ERPs).

### Gobernanza / privacidad (headline)

**Privacy-by-design — anonimización on-device en el origen:** lo sensible nunca sale de la máquina sin protección. Configuración granular de captura, masking, anonimización PII. Certificaciones: SOC2 Type II, ISO 27001/27701, GDPR, HIPAA. **Sin** versionado de procesos ni BPM governance (no es su categoría).

### Deployment / target

Public cloud, private cloud u on-prem. Target: BPO/contact centers, GBS/SSC (1000+ FTEs white-collar).

### Diferenciador

Captura ground-truth del 100% del trabajo humano (sin event logs) → pipeline de automatización rankeado por ROI → código de agente listo.

**[Notas Cockpit: (1) brechas con caso de negocio ROI-rankeado = cómo los proyectos "nacen solos"; (2) su claim 25-30% valida Colab Studio como punto de captura del 70% restante; (3) privacy-by-design on-device = doctrina para telemetría opcional de Colab Studio]**

## Mavim — Process Intelligence Transformation Platform (DTO)

**El más parecido a Cockpit en forma general.** Microsoft-nativo profundo — co-creador del **Business Process Catalog de Microsoft**. Clientes: Mondelez, Maersk, RTX, Microsoft.

### Módulos

- Plataforma Mavim — el **repositorio central**: BPM + IT portfolio + process intelligence.
- D365 Implementation Accelerator.
- Business Process Catalog — taxonomía best-practice de Microsoft, importada.
- Mavim Process Mining.
- Mavim iMprove — mejora/colaboración.
- **ConversAI** — asistente conversacional (upgrade ago 2025, Azure AI).
- Mavim AI — generación de contenido, guía, extracción de insights — + Process AI Prediction.
- Módulo EA & IT Portfolio.
- Strategic Portfolio Management.
- GRC.

### Modeling (el scope más ancho del mercado)

- **Procesos** — jerárquicos, sobre Office 365 + Visio.
- **Estructura organizacional** — roles, responsabilidades, ownership RACI-style.
- **Estrategia** — objetivos vinculados a ejecución/proyectos.
- **EA/IT portfolio.**
- **Customer journeys.**
- **Riesgos y controles** (GRC).

Todo vinculado en un repositorio = **el DTO**: estrategia ↔ proceso ↔ org ↔ sistemas ↔ riesgo.

### Mining

Event-log clásico (requiere Object ID, Activities, Timestamps): visibilidad E2E, variantes, rework, desviaciones, conflictos de conformance, cuellos de botella, lead/cycle time, root cause. **Jugada clave: el mining se conecta de vuelta a los modelos diseñados en el twin** — as-is real vs to-be diseñado en un solo lugar. **Sin task mining.**

### Simulación

Presente pero liviana — modelar y simular procesos, doctrina "**Simulation Before Implementation**" (validar antes del go-live, especialmente D365). No es un motor de simulación pesado.

### KPIs / monitoreo

Delegado a **Power BI** (integración profunda): métricas real-time, dashboards KPI customizables, reporting de variación. **Process AI Prediction** aporta métricas forward-looking. El monitoreo continuo es la pata "improve" del ciclo design-execute-monitor.

### AI

- **ConversAI** (ago 2025): Q&A en lenguaje natural sobre los modelos estructurados + el contenido vinculado — "convierte la documentación de procesos en un experto virtual". Respuestas **grounded en el twin verificado** (pitch anti-alucinación: "de máquina de adivinar a socio confiable"). Superficies: Teams, SharePoint, M365 Copilot.
- **Mavim AI:** generación asistida de contenido/procesos, aceleración de modelado; "Mavim Copilot".
- Su doctrina = la nuestra desde el lado repositorio: **el conocimiento estructurado (twin) es la capa de grounding que la AI necesita.**

### Conectores

Microsoft everything — D365 (primario), Power BI, Power Platform/Automate, Teams, SharePoint, M365 Copilot, Visio/O365, **Azure DevOps** (sync de process IDs + requirements → trazabilidad E2E proceso→requerimiento→configuración→test→deploy), Azure Marketplace, Business Process Catalog. + REST API.

### Gobernanza

- **Version control del repositorio.**
- Modelado colaborativo multi-stakeholder con workflows de review/update.
- **Frameworks: ISO 27001, ISO 9001, COSO, ITIL, COBIT, GDPR** — objetivos estratégicos, riesgos y controles visualizados en el repositorio central.
- GRC mapea el impacto de cambios regulatorios en procesos/unidades organizacionales/estrategia.
- Mavim certificada ISO 27001 / SOC 1-2.

### Deployment / target

SaaS sobre Azure (Marketplace); históricamente on-prem. Target: mid/large enterprise, sobre todo implementaciones D365/ERP; sector público NL.

### Diferenciador

DTO Microsoft-nativo — un repositorio versionado vinculando estrategia, procesos, org, IT y riesgo — que hace grounding de AI conversacional y gobierna transformaciones D365 con trazabilidad DevOps.

**[Nota Cockpit: la referencia a batir. Su forma general ES la nuestra; sus límites: Microsoft-lock, Visio como sustrato, enterprise-only, sin cascada OKR viva, sin arneses ejecutables]**

## Lectura cruzada

- **KYP.ai** posee el as-is bottom-up (realidad observada → ROI → código de agente) pero no tiene modelo to-be, ni ontología org/estrategia, ni gobernanza versionada.
- **Mavim** posee el repositorio gobernado top-down (DTO: estrategia+proceso+org+IT+riesgo, versionado, ISO-aware, Microsoft-locked) pero su discovery es solo event-logs y su AI es Q&A, no habilitación de agentes.
- **Cockpit une los dos extremos** con lo que ninguno tiene: SSoT git portable + provenance por dato + arneses ejecutables por puesto.

## Fuentes

- kyp.ai — agentic-process-intelligence, task-mining-software, process-mining-software, automated-process-discovery, digital-interaction-intelligence, concierge, FAQs.
- mavim.com — process-mining, mavim-ai, conversai, dto, GRC, enterprise-architecture, blogs simulation/ConversAI.
- Microsoft Learn — Business Process Catalog en Mavim.
