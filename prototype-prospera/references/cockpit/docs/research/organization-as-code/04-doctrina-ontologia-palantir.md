# Doctrina de ontología — Palantir Foundry (adoptada para el objeto normalizado, CK-21)

> Investigación CK-21 (2026-07-15/16) — SOTA "organization as code / Digital Twin of an Organization". Fuente: subagentes WebFetch/WebSearch. Parte del corpus `docs/research/organization-as-code/` (ver README).

Palantir define su Ontology como "digital twin of the organization": elementos **semánticos** (objects/properties/links) + **kinéticos** (actions/functions). CK-21 adopta esta doctrina como gramática de diseño del `sistema/schema/objeto.schema.yaml`. Fuente: docs oficiales ontology-best-practices + ontology-anti-patterns + ontology-structural-guidance (leídos 2026-07-15).

## Las 7 guías de diseño

1. **Modelar la realidad, no los sistemas** — los object types representan entidades del mundo real, no representaciones de sistema-fuente/departamento (domain-driven design).
2. **Curar con intención** — cada propiedad debe tener valor de negocio o técnico claro.
3. **Colaborar cross-equipo** — equipos aislados = causa #1 de duplicación.
4. **Object types enfocados** — una entidad distinta por tipo; evitar God Objects.
5. **Elegir la herramienta correcta** — action types para decisiones humanas/agénticas; pipelines para transformaciones automáticas; nunca una herramienta para todo.
6. **Interfaces para abstracción** — características compartidas → interfaces, no tipos anchos y dispersos.
7. **Documentar las decisiones** — para tipos, propiedades y links.

## Principios core (rankeados)

**P1 — Domain-driven: "Model the real world, not the source data."** Objetos = conceptos semánticamente significativos (Patient, WorkOrder), no tablas ni respuestas de API. Links = relaciones reales, no artefactos de join-key. Identificar entidades CON stakeholders del dominio ANTES de mirar schemas fuente. CSV que mezcla orden/cliente/producto → tres tipos vinculados, jamás un "OrderData". **Separar identidad de observación**: una medición/evento sobre una entidad es OTRO tipo que la entidad. Nombrar para humanos: `person.children` no `person.linkedChildPersonObjects`. Tipos técnicos → ocultos. Por qué: humanos Y agentes AI deben navegar sin fricción; modelos con forma de fuente se rompen al cambiar el schema.

**P2 — DRY / Regla de Tres: "Lo construiste tres veces → refactor."** Una instancia = coincidencia, dos = patrón, tres = refactorizar. Duplicación = drift de mantenimiento + "contexto ambiguo: usuarios y agentes AI no pueden determinar cuál tipo casi-idéntico es canónico". Fix: consolidar en un tipo canónico con propiedades distintivas, o interface compartida.

**P3 — Abierto a extensión, cerrado a modificación: "Proteger los modelos core."** Tipos/interfaces/workflows probados en producción mantienen un core estable; los demás extienden, no editan. Extender vía: tipos de extensión vinculados, nuevas implementaciones de interface, nuevos namespaces de propiedades. Ej: certificaciones sobre Equipment → tipo vinculado `EquipmentCertification` + interface `Certifiable`, NO cuatro propiedades nuevas sobre Equipment. Diseñar los puntos de extensión por adelantado; fronteras de seguridad para que las extensiones no amplíen acceso.

**P4 — Composición sobre jerarquías profundas.** Sin tipos intermedios de combinación (`SchedulableBuilding`): implementar `Building` + `SchedulableResource`. Interfaces por **capacidad/rol** (`Inspectable`, `Schedulable`, `Billable`) y por **taxonomía** (`MilitaryAsset` ← Aircraft/Vessel). **Los workflows apuntan a interfaces**: "un workflow sobre SchedulableResource funciona para arenas, salas y vehículos sin modificación."

## Guía estructural

**Normalización — "Cada hecho se guarda una vez."** Valores precomputados (mismo objeto, inputs estables: `fullName`) → pipeline. Valores derivados dinámicos (dependen de objetos vinculados: `directReportCount`) → derived properties. Anti-patterns: mismo valor en múltiples tipos; copias stale; un hecho real que exige múltiples escrituras; conteos mantenidos a mano. Escala: derived properties libres hasta ~10k objetos/query; arriba, **desnormalización selectiva permitida pero como "decisión consciente y documentada, no default"** (documentar rationale, fuente de verdad, estrategia de update).

**Structs — "Agrupar campos semánticamente relacionados."** Para valores multi-campo (dirección, coordenadas), valores con metadata (**outputs de AI con confianza, fuente y razonamiento**), multi-valuados con lógica de selección. [Nota Cockpit: nuestro `fuente`+`conf` (M23) ES este patrón — validado; extender a `razonamiento` si hace falta.]

**Interfaces.** Herramienta primaria de DRY + open/closed. Para propiedades comunes, workflows compartidos, agrupación taxonómica, abstracción por capas (interfaces extienden interfaces). "Scaffold now, consolidate later."

**Links — "Relaciones semánticamente significativas."** Todo link responde una pregunta del dominio. Dos formas: **link directo** (sin metadata: Employee→Department) vs **link respaldado por objeto** (la relación lleva metadata: Employee → `VentureStaffing`{role, startDate, allocation} → Venture). Prohibidos los links que existen solo porque dos datasets comparten FK. Propiedades de relación en el objeto origen se vuelven ambiguas bajo multi-participación → moverlas al objeto-link. Nombrar los links para que lean natural en ambas direcciones.

**Naming — "Optimizar para legibilidad humana y navegabilidad de agentes."** ("Una de las inversiones de mayor impacto en calidad de la ontología.")

| Elemento | Regla | Bien | Mal |
|---|---|---|---|
| Object types | Sustantivos singulares concretos que un experto reconoce | `Patient`, `WorkOrder` | `Data`, `Item`, `Record` |
| Propiedades | Concisas, auto-evidentes, sin encoding de tipo | `age`, `lastInspectionDate` | `dtLastInspMod`, `nVAL01` |
| Links | Leen natural en cada dirección | `department`/`employees` | `relatedItems`, `link1` |
| Fechas | Una convención, aplicada en todo | `createdDate`, `effectiveDate` | mezclar con `dateOfCreation` |
| Términos ambiguos | Siempre calificar | `monetaryValue`, `riskScore` | `value`, `score` |

Convenciones ANTES de construir; enforcement vía governance reviews; validar nombres con usuarios finales.

**Seguridad — "Semántica, least-privilege."** Expresar seguridad en términos del dominio. Row-level × column-level = control a nivel celda. Reglas: empezar restrictivo, abrir deliberadamente; alinear fronteras de seguridad con fronteras del dominio; **jamás duplicar tipos por seguridad** (un tipo + políticas > dos schemas drifteando); política sobre filtrado ad-hoc en código; revisar cada link/tipo/propiedad nueva por consistencia de acceso.

## Catálogo de 8 anti-patterns

1. **System Silos** — un tipo por sistema fuente para la misma entidad ("HR Employee" vs "Badge Employee"). Fix: un tipo sobre dataset mergeado, reglas de precedencia por campo, PK cross-sistema.
2. **Kitchen Sink** — metadata de ETL/IDs internos expuestos como propiedades. Fix: curar ("¿alguien necesita ver/buscar/filtrar por esto?"); metadata técnica en el dataset de respaldo; documentar por qué existe cada propiedad.
3. **Department Silos** — ontología con forma de organigrama ("Sales Customer"/"Support Customer"). Fix: tipos compartidos + tipos/propiedades vinculados por depto, grupos de trabajo cross-funcionales, vistas restringidas.
4. **God Object** — un tipo = muchas entidades. Detección: propiedades mayormente null, significado que cambia según un campo "type", 150+ propiedades. Fix: split por entidad + interface compartida.
5. **Golden Hammer** — un mecanismo para todo. Matriz de herramientas: **actions** = decisiones humanas/ediciones iniciadas por usuario · **batch pipelines** = agregación/limpieza/precomputación · **streaming** = baja latencia continua · **automations** = reacciones event-driven a cambios de la ontología · **functions** = cómputo/validación real-time cross-objeto · **schedules** = orquestación temporal.
6. **Action Sprawl** — una action por propiedad ("Update Employee Email" × N). Detección: >10 actions por tipo, actions que siempre corren en secuencia, nombres "Set [Property]". Fix: actions = operaciones de negocio ("Transfer Employee", "Approve Purchase Order"), parámetros opcionales, reglas de validación; el audit trail queda coherente.
7. **Time Machine** — versiones de una entidad como objetos/tipos separados (Contract 2023/2024/2025, flags `isCurrent`). Fix: un objeto por entidad = estado actual; historia en tipo vinculado (`Contract Amendment` {amendmentDate, previousValue, newValue, changeReason}), time-series para valores que cambian frecuente, historial de ediciones para audit. [Nota Cockpit: git nos da la historia gratis — nuestro layout un-archivo-por-entidad + historia git ES la solución Time Machine.]
8. **Misnomer** — nombres genéricos/ambiguos. Fix: nombres específicos auto-documentados, convenciones pre-build, descripciones en cada elemento.

## Estructurar para agentes

- Tesis gemelas: (a) una ontología con forma de dominio y bien nombrada es lo que permite que "un usuario, o un agente AI, navegue sin fricción"; (b) la duplicación/ambigüedad es lo que rompe agentes ("no pueden determinar cuál tipo es canónico"). El naming se optimiza explícitamente para "agent navigability".
- **Las actions son la superficie de operación**: "action types para decisiones humanas o *agénticas*" — los agentes actúan por las MISMAS operaciones de negocio que los humanos, con reglas de validación; las automations reaccionan a los cambios resultantes.
- Workflows/apps/functions apuntan a **interfaces** → un workflow de agente cubre todos los tipos que la implementan.
- Los outputs de AI aterrizan como **structs con confianza, fuente y razonamiento** — provenance de primera clase (paralelo directo a nuestro `fuente`/`conf`).

## Versionado, gobernanza, escala

- Sin maquinaria de branch/version prescrita: la estabilidad viene de open/closed (cores estables, extensión no modificación) + reglas Time Machine (historia vía tipos vinculados/time-series, nunca copias versionadas).
- Gobernanza: convenciones de naming enforced por reviews; documentación obligatoria; security reviews en cada camino nuevo; grupos cross-equipo dueños de tipos compartidos.
- Escala: umbral ~10k objetos para derived properties con desnormalización documentada; refactoring incremental por Regla de Tres.
- Pragmatismo: los principios son guías, no leyes. Nombrar los trade-offs explícitamente; incremental sobre big-bang ("una ontología levemente imperfecta en uso y generando valor vence a una teóricamente perfecta aún en diseño"); **defender los invariantes críticos — calidad de naming, claridad semántica, diseño de seguridad — porque son difíciles de arreglar después**; recortar esquinas solo en detalles de implementación. Cierre textual: **"The Ontology is the software that powers your organization. Treat it with the same care you would give a production codebase, but prioritize business value over perfection."**

## Aplicación a Cockpit (mapeo directo)

- `objeto.schema.yaml` (9 entidades) = la capa semántica. FALTA la capa kinética → CK-21 D6: declarar acciones por entidad (quién modifica qué, con qué aprobación); la Gestión de Cambios (N13) es el motor de esas acciones.
- Nuestro `fuente`+`conf` (M23) = el struct de provenance de Palantir, validado.
- Historia = git (un-archivo-por-entidad + commits) — resuelve Time Machine sin maquinaria nueva.
- Entidades OKR/KPI/Proyecto de primera clase con naming navegable por agentes (los arneses navegarán el objeto).
- Anti-patterns a vigilar en nuestro schema: God Object (empresa.yaml no debe crecer infinito), Action Sprawl (acciones = operaciones de negocio: "aprobar versión", "publicar mapa", no "set campo X"), Misnomer (calificar: `okr.progreso_pct`, no `valor`).

## Fuentes

- palantir.com/docs/foundry/ontology/ontology-best-practices
- palantir.com/docs/foundry/ontology/ontology-anti-patterns
- palantir.com/docs/foundry/ontology/ontology-structural-guidance
- palantir.com/docs/foundry/ontology/overview — definición "digital twin of the organization" (semantic + kinetic)
- palantir.com/platforms/foundry/digital-twin/
