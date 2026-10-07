# TO-BE — lista maestra de capacidades (CK-21) + MVP + derivación de arquitectura

> Investigación CK-21 (2026-07-15/16) — visión "organization as code → organization twin". Parte del corpus `docs/research/organization-as-code/` (ver README).

Las 37 capacidades que el producto debe tener, destiladas de: 11 vendors (docs 01-03), doctrina Palantir (04), SOTA organization-as-code (05), features Gartner DTO (06), y la visión del operador (hilo de oro objetivos→OKR→KPI + ciclo de mejora completo + arneses por puesto). Etiquetas: **[MVP]** primera venta · **[V2]** post-primeros-clientes · **[H]** horizonte (gateado por demanda). Las historias del arnés se derivan de esta lista (ver ficha CK-21).

## A · Modelo operativo del negocio

1. [MVP] Ontología organizacional (9 entidades) con doctrina Palantir: entidad-primero, naming navegable por agentes, provenance por dato (`fuente`+`conf`)
2. [MVP] Capa kinética: acciones válidas por entidad declaradas en el schema (quién modifica qué, con qué aprobación) — Gestión de Cambios como motor
3. [MVP] Cascada estratégica operable: objetivos directorio → OKRs por nivel → KPIs por proceso/rol/persona (Hoshin/BSC ya en los pilares — volverlos DATO)
4. [MVP] Procesos con roles/RACI + organigrama + puestos (ya en el objeto normalizado)
5. [V2] Modelos de oferta (productos/servicios → segmentos) y journeys de cliente
6. [V2] Recursos/sistemas conectados al modelo (vista Empresa→Sistema existe)
7. [V2] Metamodelo extensible: schema as-code = meta-metamodelo Gartner — extensiones por cliente sin fork (open/closed Palantir)
8. [V2] Índice grafo derivado (SQLite/bleve/DuckDB) para queries de impacto — nunca SSoT (D5)
9. [H] Process mining sobre el lakehouse (conformance: diseñado vs ejecutado)

## B · Gestión del desempeño

10. [MVP] EL HILO DE ORO MEDIDO: cada KPI ancla a un OKR, cada OKR a un objetivo, cada objetivo a un dueño — semáforo por nivel, drill-down por NIVEL/ROL (EL diferenciador). *(Reconciliado 2026-07-17: cascada canónica única en METODOLOGIA.md §2; el drill-down llega a rol/área — la vista persona-nombrada requiere opt-in Gobernanza, CK-24.)*
11. [MVP] Dashboards por nivel de acceso (Gobernanza/Estratégico/Táctico/Operativo — N13)
12. [MVP] Brecha → proyecto con caso de negocio: costo estimado + ranking ROI (lección KYP/Bee360) — de ahí "nacen solos" los proyectos
13. [MVP] Ciclo de vida del proyecto de mejora DENTRO de la solución (brecha→proyecto→ejecución→KPI movido — cierra PDCA; nadie más cierra este loop)
14. [V2] Root-cause: KPI rojo → qué proceso/rol/sistema lo explica (cruce estructura×operación, R11)
15. [V2] Dimensión económica del twin: costo por proceso/puesto/sistema (Bee360)
16. [V2] Riesgos y controles anclados a procesos (GRC-lite; prep-auditoría CK-10 ya declarada)
17. [H] Escenarios what-if: branch del repo = escenario (Ardoq branch/merge — git lo da gratis), comparación costo/estructura
18. [H] Simulación predictiva/prescriptiva (BPSim/DEMO; agentes LLM ensayando el TO-BE con los arneses)

## C · Inteligencia operacional

19. [MVP] Ingesta ETL: Excel de primera clase + 1-2 conectores reales (dlt — N16)
20. [V2] Catálogo de conectores por arquetipo (SaaS API / ERP DB / a-medida / archivos)
21. [V2] Alertas y notificaciones (KPI cruza umbral → aviso al dueño del OKR)
22. [V2] Reglas: condición detectada → respuesta sugerida
23. [MVP-por-diseño] Knowledge augmentation del trabajador = ARNESES POR PUESTO (Colab Studio) — feature Gartner vuelta ejecutable, nadie la tiene
24. [V2] Monitoreo near-real-time (batch horario basta en PyME; real-time nunca necesario a esta escala)
25. [H] Event/stream processing + IoT (solo si un cliente industrial lo trae)

## D · As-code + twin (lo nuestro — fuera de la lista Gartner)

26. [MVP] SSoT git versionado con promoción dev → UAT → prod (branches+tags; patrón ARIS dual-repo valida)
27. [MVP] Gestión de Cambios ISO: solicitud/aprobación/publicación/acuse — UI que oculta git (N13)
28. [MVP] Anti-drift: vistas generadas desde SSoT, gate que rechaza edición manual
29. [V2] Time travel: "cómo íbamos" (git + snapshots DuckLake)
30. [V2] MCP server del twin: agentes de cualquier plataforma consultan la organización (los 3 líderes EA lo hicieron 2025-26 — table stakes agéntico)
31. [V2] Crowdsourcing de frescura: encuestas/broadcasts a dueños de datos (Ardoq Surveys — twin desactualizado = twin muerto)
32. [V2] Chat grounded en el twin ("pregúntale a tu organización" — Mavim ConversAI + decision-trace Ardoq)

## E · Captura / discovery (Consultio)

33. [MVP] Levantamiento por entrevista con agente (método M1 como arnés — BusinessOptix Discovery Agent valida el patrón)
34. [MVP] Doc → modelo: MOF/manuales/organigramas/Excel → objeto normalizado con provenance (Pia/ARIS validan)
35. [MVP] Preview local de Cockpit antes de publicar (patrón dev-server, ya diseñado)
36. [V2] Generación inversa: SOPs/manuales/material de training DESDE el modelo (BusinessOptix — barato y muy vendible)
37. [H] Task-mining opcional vía telemetría Colab Studio con anonimización en origen (KYP privacy-by-design) — evidencia AS-IS del ~70% que los event-logs no ven

## Derivación de arquitectura (hacia atrás desde el TO-BE)

Nada estructural cambia — los 16 nodos absorben todo:

1. `objeto.schema.yaml` — capa kinética + doctrina Palantir + entidades OKR/KPI/Proyecto de primera clase (#1-3, #10). Único cambio de schema.
2. N13 Cockpit — componente nuevo: motor de indicadores (el "esquema semántico de indicadores" que N16 tenía como riesgo #3 asciende a componente: operación→KPI→OKR→objetivo) + módulo ciclo-de-vida de proyectos (#13).
3. N16 Lakehouse — sin cambios (dlt+DuckLake cubre #19-20).
4. N6 Repo Oficial — sin cambios (branches dev/UAT/prod ya era el diseño: borrador/vigente/tags).
5. N3 Distribución — crece a portal cloud (CK-21 D3/D4: single-tenant hosteado, licencias fingerprint).
6. N14 Consultio — primer entregable = arneses del método sobre Claude Code pelado (sin app shell; el clon DevStudio espera sin bloquear).
7. Nuevo componente V2: MCP server del twin (#30), colgado de N13 o N6.

NODOS.md re-fichado pendiente (deuda declarada CK-21).

## El diferenciador validado contra los 11 vendors

- Bizzdesign/Bee360/Mavim vinculan estrategia↔arquitectura, pero ninguno opera una cascada OKR viva (la estrategia es objeto de diagrama, no dato medido).
- Celonis/KYP miden desempeño real, anclado a procesos — jamás a objetivos del directorio.
- Orgvue simula estructura sin objetivos ni procesos.
- NINGUNO cierra el ciclo brecha→proyecto→ejecución→KPI-movido en la misma herramienta (todos terminan en dashboard o slide; el proyecto se va a Jira/PowerPoint y el loop se rompe).
- Ninguno entrega el trabajo diario: arneses = "knowledge augmentation" de Gartner vuelto ejecutable.

Posicionamiento: los demás venden process intelligence o EA; nosotros vendemos el **twin de ejecución estratégica** — "del objetivo del directorio al clic del analista, y de vuelta".

## MVP (mínimo vendible, en secuencia)

1. Método como arnés (M1-M3 sobre Claude Code, sin app shell) → levantamiento entrevista+docs con provenance → objeto normalizado (#33-35)
2. Schema v2: OKR/KPI/Proyecto + acciones + hilo de oro anclado (#1-4, #10)
3. N6 hosteado por nosotros (single-tenant, Forgejo): dev/UAT/prod + Gestión de Cambios v0 (#26-28)
4. Cockpit: vista hilo de oro con semáforo + niveles de acceso mínimos + brechas costo/ROI + ciclo brecha→proyecto (#10-13)
5. KPIs: ingesta Excel + 1 conector real del primer cliente (#19)

Demo del loop completo: levantar → mapear → medir → detectar → proyectar mejora → gobernar el cambio. Todo lo demás (portal, licencias, Colab Studio, mining, simulación, MCP) cuelga después sin re-arquitectura.
