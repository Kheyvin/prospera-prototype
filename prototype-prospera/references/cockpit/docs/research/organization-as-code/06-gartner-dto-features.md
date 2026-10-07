# Gartner — Features of DTO Platforms (ago 2025) + mapeo Cockpit

> Investigación CK-21 (2026-07-15/16) — visión "organization as code → organization twin". Parte del corpus `docs/research/organization-as-code/` (ver README).

Lista de features de plataformas DTO según Gartner (agosto 2025), reproducida verbatim (en inglés), con el mapeo a Cockpit línea por línea.

**Business Performance Management Capabilities:**

1. Support for multiple measurement schemes (operational performance indicators, financial models, quality schemes, SLAs) and how they interact within the business operating model.
   → Cockpit: motor de indicadores (N13) — OKR+KPI+SLA+calidad sobre el mismo hilo. [MVP parcial]
2. Customer journey, interaction and touchpoint analysis.
   → Cockpit: V2+ (entidad journey futura).
3. KPIs and root cause analysis, enabling operational decision support.
   → Cockpit: MVP (semáforo) + V2 (root cause por cruce estructura×operación, R11).
4. Real-time dashboards with continuously monitored KPIs.
   → Cockpit: batch horario/diario basta a escala PyME (N16); "real-time" = no necesario.
5. Scenario testing and predictive/prescriptive analytics based on the business operating model.
   → Cockpit: Horizonte (branch git = escenario; BPSim; agentes LLM con arneses).
6. Risk management and monitoring.
   → Cockpit: V2 (riesgos/controles anclados a procesos, GRC-lite + capability prep-auditoría CK-10).
7. Cost/value analysis (balancing cost savings with operational effectiveness and business value).
   → Cockpit: MVP en brechas (costo/ROI por brecha), V2 en el twin (costo por proceso/puesto — lección Bee360).
8. Analysis using externally provided performance indicators (ecosystem: temperature, air pollution, noise).
   → Cockpit: no aplica hoy (IoT = solo si un cliente industrial lo trae).

**Business Operations Model Capabilities:**

1. Modeling and analysis of business operations in a larger operating-model context — how capabilities and resources deploy to deliver stakeholder value (link to day-to-day execution).
   → Cockpit: el corazón — objeto normalizado 9 entidades + hilo de oro. [MVP]
2. Customer interactions and journey maps, customer/channel segmentation.
   → Cockpit: V2+.
3. Models of offerings (products, services, information) delivered to customer segments.
   → Cockpit: V2.
4. Process mining (automated business process discovery).
   → Cockpit: Horizonte (sobre el lakehouse); mientras tanto discovery por entrevista+docs (Consultio) — el camino BusinessOptix, válido para PyME sin logs.
5. Models of resources (machines, IT systems, people) connected to the operating model.
   → Cockpit: MVP (personas/sistemas ya en el objeto; vista Empresa→Sistema existe).
6. Internal/external ecosystems, user-generated content, social-style collaboration.
   → Cockpit: V2 (crowdsourcing de frescura estilo Ardoq Surveys).
7. Access to project and program data to monitor progress and align with outcomes.
   → Cockpit: MVP (ciclo brecha→proyecto DENTRO de la solución — nuestro diferenciador de loop cerrado).
8. Underlying graph databases or equivalent, extensible in near-real-time through a "meta metamodel".
   → Cockpit: schema as-code = nuestro meta-metamodelo (versionado en git, extensible por cliente vía open/closed); índice grafo DERIVADO (nunca SSoT, D5).

**Business Operations Intelligence Capabilities:**

1. Adapters/connectors to receive and send data (REST, MOM, files, DBs, web services, packaged apps, sensors).
   → Cockpit: dlt (N16) — Excel primera clase + arquetipos SaaS/ERP/a-medida. [MVP: Excel + 1 conector]
2. Event processors (filter, detect patterns/threats/opportunities, CEP).
   → Cockpit: Horizonte (batch primero).
3. Rule processors (respuesta apropiada a condiciones detectadas).
   → Cockpit: V2 (KPI cruza umbral → sugerencia).
4. Notification, alerting and triggering.
   → Cockpit: V2 (alerta al dueño del OKR).
5. Knowledge augmentation of workers (real-time info added to tasks).
   → Cockpit: **los arneses por puesto (Colab Studio) — nuestra versión ejecutable, nadie más la tiene**. [MVP-por-diseño]
6. Real-time monitoring (dashboards refreshing seconds/minutes).
   → Cockpit: no necesario a escala PyME (batch).
7. ETL capabilities.
   → Cockpit: dlt + DuckLake (N16). [MVP v0]
8. IoT and digital-twin connectivity.
   → Cockpit: no aplica (diferido).

Lectura: Cockpit cubre los 3 grupos de Gartner ("Any one" requerido por grupo) desde el MVP — grupo A vía #1/#3/#7, grupo B vía #1/#5/#7/#8, grupo C vía #1/#5/#7. La categoría DTO es alcanzable con lo ya diseñado; el diferencial (hilo de oro + arneses + as-code) está FUERA de la lista de Gartner — es lo que nadie pide porque nadie lo ofrece.
