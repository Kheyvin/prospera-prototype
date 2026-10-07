# SOTA · Organization as Code — categoría, precedentes, frontera

> Investigación CK-21 (2026-07-15/16) — visión "organization as code → organization twin". Parte del corpus `docs/research/organization-as-code/` (ver README).

## La categoría no existe (todavía)

Búsquedas directas de "organization as code"/"company as code" devuelven IaC y no-code — **el término está libre**. Bueno (espacio abierto para definirlo nosotros) y malo (la educación de mercado la pagamos nosotros). Lo que SÍ existe con nombre: **Digital Twin of an Organization (DTO)** — Gartner tiene Market Guide y categoría en Peer Insights (vendors: Celonis, ARIS, Mavim, iGrafx, BusinessOptix, edgeTI, KYP.ai...). Un DTO se define como "modelo dinámico de software que usa datos operacionales y contextuales para entender cómo una organización operacionaliza su modelo de negocio, conecta con su estado actual, responde a cambios, despliega recursos, simula estados futuros y entrega valor al cliente". Anclar a esta categoría para analistas/ventas; "organization as code" como término propio de posicionamiento.

## Precedentes del patrón "org en git"

- **Backstage (Spotify/CNCF)**: entidades organizacionales como YAML versionado en git — kinds User/Group con parent/children/members, relaciones en grafo, descriptor `catalog-info.yaml` junto al código, cambios por PR, catálogo que se auto-actualiza desde version control. Best practice: "keep entity descriptors close to the code". Validación directa del patrón "org as code"... pero solo para organizaciones de ingeniería. Formato: apiVersion/kind/metadata/spec — disciplina de contrato de entidad que nuestro `objeto.schema.yaml` ya practica y puede formalizar como estándar publicable ("el Backstage de la organización completa").
- **GitLab handbook-first**: empresa entera operada desde un handbook público en git desde que eran 10 personas (hoy 2000+ páginas); cambiar una política = merge request; "handbook-first" como doctrina cultural documentada. Prueba viva a escala de que gobernar una organización por git + PRs funciona. Narrativa de venta directa.
- **QMS-in-git (OpenRegulatory)**: sistemas de gestión de calidad ISO en GitHub/GitLab — ya citado en la ficha N6.
- **IAM/access-as-code** (Terraform providers para GitHub/Okta/Google Workspace, políticas OPA): gestionar usuarios/grupos/accesos reales como código — el pariente operacional.

## Los que se acercan desde otros ángulos

- **Catio** ("digital twin de arquitectura TÉCNICA" — la inspiración del operador): loop de 5 fases Understand (extrae dependencias del sistema vivo) → Decide (opciones A/B/C con trade-offs/ROI) → Design (specs ejecutables) → Execute (integra con IDEs/infra) → **Compound (monitorea evolución y detecta drift de la intención original)**. Copiloto "Archie". Tesis de venta: "30-40% del esfuerzo de ingeniería se pierde en rework por drift técnico". LECCIÓN: el loop cerrado con drift-detection continuo — nuestro As-Is→To-Be→brecha→proyectos ES este loop aplicado a organizaciones, pero hay que volverlo continuo (no entregable puntual de consultoría).
- **Palantir Foundry Ontology**: "la Ontología ES el digital twin de la organización" — semántica (objects/properties/links) + kinética (actions/functions) + AIP (agentes LLM operando el twin: vigilan anomalías, proponen acciones, simulan escenarios). El análogo más fuerte. Ver `04-doctrina-ontologia-palantir.md`.
- **Herramientas EA** (SAP LeanIX, Ardoq, Bizzdesign — líderes Gartner MQ; ver `02-sota-ea-management.md`): mapean capacidades/aplicaciones/estrategia; Ardoq ya corre agentes AI sobre el grafo organizacional. Bajan hacia nosotros con AI más rápido de lo que subimos con ventas — ventaja temporal nuestra: PyME LATAM + precio + arnés ejecutable.
- **Org design** (Orgvue, ChartHop, Agentnoon): modelado de escenarios organizacionales what-if sobre costo/roles/estructura/skills; Orgvue con agentes AI vía MCP. HR-céntricos: sin procesos, sin método, sin git. LECCIÓN: la UX de comparación de escenarios.
- **Process mining / DTO** (Celonis, ARIS, Mavim, KYP): ver docs 01 y 03.

## Base teórica (para el horizonte simulación)

- **DEMO / Enterprise Ontology (Jan Dietz)**: metodología formal de modelado de organizaciones basada en transacciones/actos comunicativos ("communicative action": los acuerdos entre empleados/clientes/proveedores como unidad atómica), desarrollada desde los 80s; elaborada como "enterprise ontology"; existe tooling académico que convierte modelos DEMO a redes de Petri y los simula; derivó en el framework XAF de arquitectura empresarial. La base formal si algún día formalizamos la ontología organizacional.
- **BPSim**: estándar OMG/WfMC para parametrizar modelos BPMN y correrlos en motores de simulación (Sparx EA lo implementa). El estándar a usar cuando llegue la simulación de procesos — no inventar.
- **Simulación organizacional con agentes LLM (frontera de investigación 2024-26)**: TheAgentCompany/TheMCPCompany (CMU — benchmark de empresa de software simulada con NPCs-empleados LLM para evaluar agentes en tareas enterprise); MetaGPT/ChatDev (roles de una software company como agentes coordinados); AgentSociety (feb 2025, simulación a gran escala de agentes generativos); VirtLab (simulaciones de equipos); investigación de agentes LLM como CEO/CFO/gerencias/empleados con objetivos/herramientas/conocimiento propios. NADIE lo comercializa como producto de org-design todavía.

## La jugada única de Cockpit

**Nuestros arneses por rol son a la vez el tooling de producción Y los actores de simulación.** Nadie más tiene definiciones ejecutables de rol: cuando el twin exista, se puede levantar un agente por rol con su arnés y ensayar el TO-BE en seco antes de reorganizar humanos reales. Ningún vendor DTO/EA/org-design puede — sus modelos son diagramas, no ejecutables. Además Gartner lista "knowledge augmentation of workers" como feature DTO: los arneses son exactamente eso, elevado a ejecutable.

Nadie cierra el loop completo: *levantamiento por agente → ontología git versionada → arneses ejecutables por rol → telemetría de operación → brecha continua → proyectos → de vuelta*. Ese loop es la tesis defendible.

## Fuentes

gartner.com/reviews/market/digital-twin-of-an-organization-platforms · mavim.com/gartner (Market Guide DTO) · celonis.com blog "How Process Mining Enables the DTO" · backstage.io/docs/features/software-catalog/descriptor-format · handbook.gitlab.com/handbook/about · openregulatory.com QMS-in-git · catio.tech · palantir.com docs ontology · orgvue.com (organization-modeling, ai-agents-in-orgvue) · agentnoon.com · en.wikipedia.org DEMO · sparxsystems BPSim guide · arxiv TheMCPCompany 2510.19286 · AWS blog "LLMs: the new frontier in generative agent-based simulation".
