# 09 · SOTA 2026 — DTO, EA-as-code y simulación organizacional, desde fuente primaria

> **Investigación 2026-07-25/26** (encargada en la sesión de CK-30). Complementa y **corrige en dos
> puntos** a [`01`](01-sota-process-intelligence.md), [`02`](02-sota-ea-management.md),
> [`05`](05-sota-organization-as-code.md) y [`06`](06-gartner-dto-features.md), que se hicieron
> sobre prensa y material de vendor. Lo nuevo acá: **el Market Guide de Gartner completo en PDF**,
> la cita textual de The Open Group sobre el formato de intercambio, la crítica académica del DTO,
> y la simulación organizacional que apareció en arXiv en 2026.
>
> **Marcas:** **[V]** verificado en fuente primaria · **[V-2ª]** primaria bloqueada, verificado en
> secundaria oficial · **[I]** inferencia del investigador, no hallazgo.
>
> **Estado:** completo y triangulado. La línea **process-as-code / EA-as-code / métricas-as-code**
> (workflow engines · anatomía de Backstage · OCEL 2.0 · modelo→trabajo ejecutable) se investigó
> aparte y cerró en [`11-sota-process-as-code-y-metricas.md`](11-sota-process-as-code-y-metricas.md).

---

## 0 · Por qué este doc existe (y qué corrige)

| Corrección | Detalle |
|---|---|
| **ArchiMate 4 existe** | Documento C260, **publicado 27-abr-2026** **[V-2ª]**. Los docs previos daban 3.2 (2022) como vigente. **El matiz salva la conclusión:** el anuncio la describe como *"a substantial evolution… including housekeeping"* y Steve Nunn (CEO) enfatiza *"prioritizing continuity… without unnecessary disruption"*. **El comunicado no menciona IA, ni agentes, ni digital twins.** El texto de la spec está tras SSO — no se afirma qué cambió técnicamente. **[I]** The Open Group publicó una versión mayor de su lenguaje de EA en 2026 **sin decir una palabra sobre gemelos organizacionales**: su posición sobre DTO es el silencio. |
| **Magic Quadrant de DTO: evidencia CONTRADICTORIA** | Un press release de Interfacing lo da por publicado el 22-jul-2026 con ellos como Leader; pero el MQ aparece como **sesión de agenda de David Sugden en el Gartner Applications Summit EMEA, 14-sep-2026 11:00 BST** **[V]**, y una búsqueda de vendors proclamándose Leaders **no devolvió nada**. `gartner.com` da 403. **⚠ Tratar el MQ como *forthcoming* y verificar antes de usarlo en material comercial.** Un claim de "Leader en el MQ inaugural" que resulte prematuro es un pasivo. |

---

## 1 · DTO: promesa vs realidad, desde el documento original

**Fuente primaria [V]:** Gartner, *Market Guide for Digital Twin of an Organization Platforms*,
**20-nov-2024, ID G00785499**, Marc Kerremans y David Sugden, 34 páginas. Copia íntegra en PDF
alojada públicamente por EsseQuamVideri (uno de los 19 vendors perfilados) en
`eqv.it/doc/Market_Guide.pdf`. *Caveat: copia de tercero, internamente coherente, no el original.*

### 1.1 La definición — y el detalle que nadie notó

> *"A DTO is a dynamic software model that relies on operational and contextual data to understand
> how an organization operationalizes its business model, connects with its current state, responds
> to changes, deploys resources, **simulates future states** and delivers customer value."*

**"simulates future states" es un añadido** respecto de la definición anterior de Gartner, que
terminaba en *"deploys resources and delivers customer value"* **[V ambos textos]**. **[I] Gartner
subió la vara justo cuando el mercado no la alcanza.**

Diferencia declarada contra el twin de un dispositivo **[V]**: *"It reflects **what humans actually
do instead of what they are supposed or expected to do**."* Metáfora oficial: un **GPS**, con cinco
bloques (*Destination · Map · Performance · Situation · Value*).

### 1.2 Lo que el propio Gartner admite (las frases que ningún vendor cita) **[V]**

| Admisión, verbatim | Implicación |
|---|---|
| *"most suppliers still have **gaps** in their offerings"* | producto incompleto, reconocido |
| *"All vendors… provide features for most use cases. However, the focus, breadth and depth **will vary significantly**"* | todos dicen hacer todo |
| *"we have seen a **slow start in uptake** of this concept"* | tras 6 años |
| *"Gartner sizes the market at about **80 vendors**… the **19 vendors profiled**… represent **more than 90%**"* | cola larga irrelevante |
| *"**a digital twin of an airplane engine doesn't execute** the other real-life part of the twin"* | **el DTO no ejecuta nada** |
| *"**Start by applying the DTO to a limited market/channel/process combination or organization, such as a department**"* | empezá chico — no es un gemelo de la organización |

### 1.3 El detalle demoledor **[V]**

La **"Note 1: Examples of Digital Twins"** del Market Guide lista exactamente tres ejemplos:
**Singapur** (ciudad), **Siemens Digital Industries** (manufactura), **Port of Antwerp-Bruges**
(puerto).

> **Ninguno es el gemelo de una organización.** En 34 páginas sobre DTO, Gartner no logró producir
> un solo ejemplo de DTO.

### 1.4 Los 19 "representative vendors", con la clasificación de origen del propio Gartner **[V]**

| Vendors | "Background" según Gartner |
|---|---|
| ARIS · Arrayworks · BusinessOptix · Interfacing (EPC) · Mavim · GBTEC (BIC) | EBPA / strategy to execution |
| **Celonis** · DCR Solutions | **Process mining** |
| iGrafx · BOC (ADONIS) · SAP Signavio | EBPA / business process analysis |
| Orbus (OrbusInfinity) · QualiWare | EBPA / enterprise architecture |
| QPR Software | EBPA / process mining |
| Bee360 | IT operating system |
| Corporater | Enterprise performance management |
| Edge Total Intelligence | Enterprise application integration |
| EsseQuamVideri | Risk & compliance |
| **inorigo** | **DTO platform** ← el único |

> **De 19 vendors, UNO solo (inorigo, sueca, marginal) tiene "DTO platform" como categoría de
> origen. Los otros 18 son herramientas de otra categoría a las que Gartner les puso la etiqueta.**
> Evidencia primaria, no interpretación.

**Peer Insights confirma la incoherencia de categoría [V]:** 34 productos listados incluyen
**3DEXPERIENCE** (Dassault, PLM), **Assembly PLM** y **ArcGIS** (Esri, un sistema de información
geográfica). **[I] Un mercado que mete un GIS junto a un repositorio de EA no es un mercado: es una
etiqueta.** Y los volúmenes de reviews (Celonis 745 · SAP Signavio 313 · Ardoq 257 · Mavim 189 —
totales del producto en *todos* los mercados) muestran que **los compradores reseñan estas
herramientas como process mining o EA tools; "DTO platform" es una vitrina secundaria.**

### 1.5 El testimonio más duro viene de los usuarios **[V]**

- **SAP Signavio**: las críticas se resumen textualmente en *"Cost — Not adaptable — Difficult
  deployment"*; los usos reales reportados son *"clear end-to-end process visibility in a
  collaborative environment"*. **Nadie menciona simulación ni gemelo.**
- **Mavim**: *"the initial setup requires considerable time and effort"*.
- **Ardoq** — la frase que resume al sector: ***"surveys remain the critical bottleneck"***.

> **[I] El "gemelo digital de la organización", en producción, se alimenta de gente llenando
> encuestas y modelando a mano.** La definición de Gartner exige *"operational and contextual data"*
> con sincronización; lo que se entrega es un repositorio de mantenimiento manual.

### 1.6 Case studies: el patrón sistemático **[V]**

| Fuente | Cliente | "Métrica" |
|---|---|---|
| SAP Signavio | KWS | *"more than 1000 processes modeled within the first 6 months"* — **actividad de modelado, no resultado** |
| SAP Signavio | "Aerospace company" (anónimo) | 20% mejora de cycle time — **número real, empresa sin nombre** |
| iGrafx | SEFE Storage, B.Braun | **ninguna cuantificada** |
| Bizzdesign | Toyota, NatWest, Airbus, HSBC, Shell (logos) | case studies **anonimizados** |
| Gartner MG | — | *"90 case studies provided by 35 vendors"* — **ninguno reproducido** |

> **O hay nombre sin número, o número sin nombre. En ocho años de categoría no existe un solo case
> study público con empresa nombrada + métrica de negocio + línea base atribuible a un DTO.**
> **[V, por ausencia — se buscó explícitamente]**
>
> ⚠️ Circula una cifra de McKinsey ("25-50% de aceleración del time-to-value") replicada por blogs.
> **No se pudo localizar la fuente primaria. NO USARLA.**

### 1.7 La crítica académica — más aguda que la comercial

**Becker & Pentland (2021) [V]** — el título lo dice todo: ***"Digital Twin of an Organization: Are
You Serious?"*** · BPM 2021 Workshops, Roma · Springer LNBIP 436, pp. 243-254 · DOI
`10.1007/978-3-030-94343-1_19`.

**Lyytinen, Weber, Becker & Pentland (2023) [V]** · *Journal of Organization Design*, DOI
`10.1007/s41469-023-00151-z`. **Fijan la vara real, mucho más exigente que la de Gartner:** un DTO
no es un modelo — es un modelo con **causalidad bidireccional**: *"changing the model will cause
changes in the real-world organization, because there is a two-way causal connection."*

**Los seis obstáculos** (la mejor lista de límites honestos que existe):

| Obstáculo | Por qué rompe el gemelo |
|---|---|
| **Agency** | la gente reflexiona, anticipa, improvisa y **engaña** |
| **Conflict** | desacuerdos ocultos bajo treguas temporales |
| **Learning & forgetting** | la organización cambia continuamente por experiencia |
| **Hidden interdependencies** | relaciones difíciles de observar |
| **Multiple realities** | subculturas e interpretaciones coexistentes |
| **Emergence** | el comportamiento no se predice desde los componentes |

Más la **performatividad**: *el modelo moldea la realidad en vez de reflejarla.*

**El tamaño real del campo — argumento por ausencia [V]:**

| Consulta exacta | Resultados |
|---|---|
| `"digital twin of an organization"` (OpenAlex, título+abstract) | **88 papers** |
| `"organizational digital twin"` | **17** |
| en arXiv | **3** (1 real) / **0** |
| Paper más citado (Parmar, Leiponen & Thomas, *Business Horizons* 2020) | **113 citas** |

> **113 citas es el techo de una categoría que Gartner califica de "Transformational".**

**Y el escepticismo viene de adentro [V]:** **Wil van der Aalst** —padre del process mining y Chief
Scientist de **Celonis**— (arXiv 2204.11328): *"Terms such as the Digital Twin of an Organization
(DTO) and Hyperautomation illustrate the desire to autonomously manage processes… **fully autonomous
process execution are more a dream than a reality**."*

**El mejor testimonio hostil lo publica un vendor de DTO [V].** Interfacing, *"When a Digital Twin
of an Organization Loses Trust"*: *"A Digital Twin loses trust the moment people stop believing it
reflects operational reality"* · *"The model slowly stops reflecting reality"* · ***"Operational
drift develops gradually"***. Modos de falla que nombra: cambios de proceso sin actualizar
dependencias · **workarounds regionales** · procedimientos modificados localmente sin sincronizar ·
automatizaciones que alteran el comportamiento con titularidad vieja.

### 1.8 El movimiento de 2026: la palabra se muere mientras la categoría se formaliza **[V]**

| Empresa                                                             | Término nuevo                                                                | Fecha       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| **Celonis**                                                         | **Context Model (CCM)** — degrada a *"digital twin **of operations**"*       | 12-may-2026 |
| **Skan.ai**                                                         | **"Context Graph of Work"** — abandonó "digital twin"                        | 2026        |
| **Ardoq**                                                           | *"semantic substrate to power digital twins and enable AI agents"*           | 8-jun-2026  |
| **SAP Signavio**                                                    | DTO como *"lifecycle de agentes de IA"* — *"capabilities"*, no *"es un DTO"* | 2026        |
| Mavim · BlueDolphin (ex ValueBlue) · SAP LeanIX · Bizzdesign · ARIS | **sin claim DTO en homepage**                                                | 2026        |

Contexto **[V-2ª]**: Celonis lanzó el Context Model junto con la adquisición de **Ikigai Labs**. Y
**Celonis demandó a SAP por antitrust en marzo 2025** (3:25-cv-02519-VC, N.D. Cal.); el 27-oct-2025
el juez dejó avanzar los cargos de monopolización del *"aftermarket de acceso a datos"*.

> **[I] Los dos mayores "DTO vendors" están litigando por el acceso a los datos del ERP. La
> fidelidad del gemelo depende de datos que controla un competidor.** Es el argumento más fuerte que
> existe **a favor de que el modelo sea propiedad del cliente, en su repositorio** (nuestro N6).

### 1.9 Veredicto

> **DTO es una categoría de analista de ocho años que describe con precisión un problema real y con
> imprecisión un mercado que no lo resuelve.** Lo que se vende son **repositorios de modelos de
> procesos y arquitectura, mantenidos a mano vía encuestas, con exportación pero sin versionado, que
> no simulan casi nada.**
>
> El ciclo de vida delata el fracaso comercial: primer Market Guide **jul-2018** → primera entrada
> al Hype Cycle de su propia disciplina **may-2026** → MQ inaugural **~sep-2026**. **Un concepto que
> funciona no tarda ocho años en llegar al Hype Cycle de EA.** Que Gartner lo escale ahora **es
> señal de que necesita una categoría donde meter la ola agéntica**, no de madurez del mercado.
>
> Ironía final: **Gartner va a lanzar un Magic Quadrant de una categoría cuyo nombre los líderes
> están abandonando.**

---

## 2 · El sustrato: la cita que cierra el debate as-code

The Open Group, sobre el **ArchiMate Model Exchange File Format** **[V]**:

> ***"It is not intended as a persistent file format for the model itself, it is a mechanism to
> convey instance data from one tool to another."***
>
> …y las herramientas que lo importan *"typically save them in their own proprietary formats
> afterward."*

> **El estándar de intercambio de modelos de arquitectura empresarial declara explícitamente que no
> es un formato de persistencia. El repositorio propietario no es un defecto de los vendors: es la
> arquitectura asumida por el estándar.** Todo lo que ofrece el mercado es *exportar una foto*, no
> *versionar la fuente*. Corolario: **BPMN 2.0 XML y ArchiMate Exchange son formatos de exportación,
> no formatos fuente.**

**La excepción más interesante: Ardoq compró GraphLake (8-jun-2026) [V].** RDF + OWL + SHACL;
fundador **Graham Moore**, hoy Director of Graph Technologies. Claims verbatim: *"'What did our
application landscape look like on January 15th?' becomes a single query"* · *"Architects can
**branch** the enterprise graph, model alternative futures, and compare against the live state —
without copying the world."* Y Erik Bakstad (CEO): *"Enterprise architecture is no longer a tool you
maintain. **It is the substrate the rest of the AI stack runs on.**"*

> **[I] Ardoq compró las *propiedades* de git —branching, consultas point-in-time— aplicadas a un
> grafo empresarial, sobre estándares W3C. Es lo más cerca que llegó la industria. Pero no es git y
> no es texto:** es una base de datos de grafos alojada por el vendor. **La diferencia importa y es
> vendible: en git el modelo es un archivo que vos poseés y diffeás; ahí es un grafo alojado que vos
> consultás.** El "no lock-in" refiere a los lenguajes de consulta, no a la propiedad del artefacto.

---

## 3 · Simulación organizacional: existe, es de 2026, y no está en venta

Ninguno de los 19 vendors de Gartner simula la organización. **En arXiv sí [V-2ª]:**

| Paper | arXiv / fecha | Aporte |
|---|---|---|
| **TaskWeave** ⭐ | 2606.01199, 31-may-2026 | Nombra el *"long-horizon organizational coherence problem"*. Ciclo Formulate→Partition→Diagnose→Align. **Población de agentes estructurada por roles con topología de delegación explícita**; planificación año→trimestre→mes→semana. Simula una empresa de TI a un año: 76,67-81,92% de finalización a tiempo |
| **OrgAgent** ⭐ | 2604.01020, 1-abr-2026 | Tres capas: governance / execution / compliance. **La coordinación jerárquica supera a la plana: +102,73% de performance con −74,52% de tokens.** *"organizational structure significantly influences not only effectiveness and cost but also coordination behavior"* |
| **CEO-Bench** | 2606.17459, 16-jun-2026 | CEO-LLM con consejo contradictorio. Tres fallas sistemáticas: **single-advisor capture**, **conservative default under ambiguity**, **historical amnesia** |
| **AgentSimulator** | ICPM 2024 + *Process Science* 2025 | **Descubre un sistema multi-agente desde event logs** e identifica si el comportamiento es **orquestado centralmente o autónomo**. Lo más cerca de "gemelo derivado de datos reales" |

**El dato duro sobre agentes en empresas [V-2ª]: TheAgentCompany** (arXiv 2412.14161, NeurIPS 2025,
CMU/Duke) — entorno con GitLab/OwnCloud/Plane/RocketChat, 175 tareas derivadas de O*NET, ~3.000
horas-persona de construcción:

| Agente | Éxito completo |
|---|---|
| OpenHands + Gemini-2.5-Pro | **30,3 %** |
| OpenHands + GPT-4o | 8,6 % |
| **OWL RolePlay (multi-agente)** + GPT-4o | **4,0 %** |

> **Tres hallazgos que casi nadie cita:** (1) **el framework multi-agente PIERDE contra el agente
> único** (4,0% vs 8,6%, mismo modelo); (2) **donde más se cae es en RocketChat** — la parte *social*
> rompe antes que la técnica; (3) los autores advierten explícitamente contra extrapolar a
> automatización de empleos.
>
> **[I] Combinado con OrgAgent (la jerarquía bien diseñada gana), la lectura es precisa: no es "más
> agentes = mejor"; es "la forma organizacional importa". Que es exactamente la tesis de un twin — y
> el argumento de por qué el arnés por rol×proceso necesita estructura declarada, no un enjambre
> (CK-30).**

### 3.1 La crisis de validez — decirla en voz alta **[V-2ª]**

| Falla documentada | Fuente |
|---|---|
| **Colapso de heterogeneidad** — los LLM convergen a una *"persona promedio"*; menos de la mitad de los estudios mide varianza conductual | arXiv 2506.19806 (position paper ICML 2026) |
| **Flexibilidad analítica** — correlaciones humano↔silicio entre **r = 0,23 y r = 0,84 sobre los mismos datos** según configuración | arXiv 2509.13397 |
| **Dominancia del backbone** — la elección del LLM base es **la variable más importante** | arXiv 2605.00197 |
| **Homogeneización** — falla en preservar opiniones minoritarias; más determinista que los humanos | arXiv 2507.02919, 2409.02601 |

> **[I] El aporte analítico más valioso del informe:** el colapso de heterogeneidad **es** *"multiple
> realities"* y *"conflict"* de Lyytinen et al. (2023), borrados por un modelo que converge al
> promedio. **Dos literaturas que no se citan entre sí llegaron a la misma pared.** Una organización
> *es* su heterogeneidad — silos, subculturas, conflicto latente. Un simulador que converge a la
> persona promedio **borra el objeto de estudio**.
>
> **Consecuencia directa para nuestro horizonte de simulación con arneses (VISION §Horizontes):**
> con r entre 0,23 y 0,84 según configuración, *el investigador elige el resultado*. Si algún día
> ensayamos el TO-BE con agentes por rol, **hay que preregistrar la configuración o la validación es
> teatro.**

**El ingrediente que SÍ funciona [V]:** el estudio Stanford de 1.000 personas (arXiv 2411.10109) fue
**retitulado en junio 2026** de *"Generative Agent Simulations of 1,000 People"* a ***"LLM Agents
Grounded in Self-Reports Enable General-Purpose Simulation of Individuals"***. Accuracy: **86%** con
entrevista+encuesta vs **74%** con sólo demografía.

> **[I] El ingrediente que hace funcionar al agente no es el organigrama ni el rol — es la
> entrevista.** Un twin que no capture auto-reportes ricos hereda el 74%, no el 86%. **Esto valida
> el método Consultio (levantamiento por entrevista) como parte TÉCNICA del producto, no como
> servicio previo.**

**Ojo con los falsos positivos [V-2ª]:** AgentSociety (>10.000 agentes) simula **sociedad urbana**;
OASIS (1M usuarios) simula **redes sociales**; Project Sid/Altera simula **civilización en
Minecraft**. **Ninguno simula una organización formal.** Citarlos como evidencia de que "se puede
simular una empresa" es un salto injustificado.

---

## 4 · Los lugares normativos correctos, y están vacíos

**Digital Twin Consortium [V]:** su glosario **no contiene** entradas para *"business digital twin"*,
*"organizational twin"* ni *"enterprise twin"*. Sus ~15 working groups son todos verticales
industriales. **No existe un Organizational/Business Twin WG.** Lo más cercano, el *Digital Twin
Business Maturity Model* (nov-2024), mide **la madurez de la organización PARA ADOPTAR twins — no la
organización COMO twin**.

**⚠️ Cambio de gobernanza poco conocido [V-2ª]: el Object Management Group fue absorbido.**
Combinación EDM Council + OMG anunciada 1-jul-2025, **cerrada 1-oct-2025**. **OMG ya no es entidad
independiente.** Y **BPMN 2.0.2 sigue congelada en enero 2014 — doce años.** El eje de procesos de
OMG está en modo mantenimiento.

**ISO [V-2ª]:** eje conceptual JTC 1 — ISO/IEC 30173:2023 (conceptos), 30186:2025 (madurez),
**ISO/IEC 30188:2026 *Digital twin — Reference architecture*, publicada 22-jul-2026**. Eje
manufactura TC 184 — ISO 23247 partes 1-4 (2021) + **23247-5:2026 (digital thread)** y **23247-6:2026
(composition)**. **Ninguna norma cubre el gemelo de la organización.**
⚠️ Corrección de dato que circula: **ISO/IEC 30179 NO es norma de digital twin** (es IoT / monitoreo
ambiental).

**ISO 15704:2019** — *Enterprise modelling and architecture* (GERAM adentro) — **es literalmente el
lugar normativo donde encajaría un twin organizacional, y está vacío de contenido de twin.**

**DEMO / Enterprise Engineering: moribundo [V]** — DEMO-4 se liberó en **marzo 2020**; **no hay
DEMO-5**. Últimas actas: *Advances in Enterprise Engineering XVII*, EDEWC 2023 (Viena), **7 papers**;
**no existe volumen XVIII** y `link.springer.com/conference/edewc` devuelve **404**. Serie en
descenso: XV (10) → XVI (8) → XVII (7). La red **CIAO! está congelada** en 2021-22.

> **[I] El hueco más accionable del informe.** DEMO tiene lo que le falta al DTO: **una ontología
> formal, reproducible y verificable de la organización** (transacciones, roles de actor, patrón
> transaccional universal, con el claim *"dos modeladores con la misma instrucción vuelven con el
> mismo resultado"*). Y el DTO tiene lo que le falta a DEMO: **sincronización con datos reales y
> caso comercial**. **Nadie los cruzó.**
>
> **Advertencia: se toma la ontología, no la comunidad.** Adoptar DEMO como bandera nos ata a un
> cadáver académico; adoptar su *gramática transaccional* dentro de nuestro schema es gratis y
> sólido. (Ver M33 en el catálogo — hoy `horizonte[simulacion]`, gateada D9.)

---

## 5 · El gap, con toda la evidencia sobre la mesa

**Lo que está PROBADO que no existe:**

| Afirmación | Evidencia |
|---|---|
| Ningún DTO tiene su modelo en git como texto | El estándar **declara que no es formato de persistencia** [V]. Búsqueda GitHub `"organization as code"`: **12 repos**, el mayor sobre memoria de agentes, el resto 0-4★ [V] |
| Nadie simula la organización comercialmente | **0 de 19** vendors de Gartner. La simulación real nació en arXiv en 2026 [V-2ª] |
| Ningún estándar cubre el gemelo organizacional | DTC sin WG ni entrada de glosario · ISO/IEC 30173 lo deja abierto sin llenarlo · ISO 23247 es manufactura · **ISO 15704 es el lugar correcto y está vacío** [V/V-2ª] |
| No hay case study público con nombre + métrica + línea base | Ocho años de categoría, búsqueda explícita [V, por ausencia] |
| Nadie ancla un KPI con umbral y dueño a proceso/rol/persona | Confirmado en el eje de medición |
| Nadie compila la config del agente desde el puesto | Confirmado en el eje ejecutable (ver [`10-sota-arnes-as-code.md`](10-sota-arnes-as-code.md)) |

**La formulación final del gap:**

> **Nadie ha construido un modelo de la organización completa —estructura, procesos, personas,
> objetivos y medición— como dato textual versionado en git con gate anti-drift, del cual se deriven
> simultáneamente las vistas que la organización lee, los semáforos que se computan y no se guardan,
> y la configuración ejecutable de los agentes que hacen el trabajo.**
>
> **Y ahora se sabe POR QUÉ está vacío, que vale más que saber que está vacío:**
> **(a)** el mercado viene del repositorio, y **el estándar de su propia industria asume el
> repositorio propietario como arquitectura** — no es que no se les ocurrió: su norma les dice que
> no hace falta; **(b)** la academia viene de la simulación y acaba de chocar contra la validez;
> **(c)** la ontología formal existe (DEMO, ISO 15704) y está **huérfana**; **(d)** los tres no
> tienen incentivo para cruzarse.

**Qué es defendible — tres cosas, y ninguna necesita la palabra "gemelo":**

1. **La brecha as-is / to-be medida con provenance** es un producto real.
2. **El modelo como dato versionado del cliente** es un hueco genuinamente vacío, y es una
   **decisión de arquitectura**, no una promesa de marketing. Reforzado por el litigio Celonis-SAP.
3. **La ontología reproducible** existe, está huérfana, y es adoptable.

> **Lo indefendible es la palabra "simula" y la palabra "gemelo".** Un espejo medido con
> trazabilidad es un producto honesto; un oráculo predictivo de la organización, en julio de 2026,
> no lo es.
>
> **Doctrina comercial que se desprende: vender el loop medido y el sustrato portable; usar "twin"
> como ancla de categoría ante analistas, JAMÁS como promesa de capacidad.**

---

## 6 · Advertencias antes de publicar cualquier cosa de esto

| Ítem | Motivo |
|---|---|
| **MQ de DTO Platforms** | **Contradicción sin resolver.** Tratar como *forthcoming* |
| **Posición de DTO en la curva del Hype Cycle** | **No existe fuente pública.** Solo el benefit rating "Transformational" |
| **Copia del Market Guide en `eqv.it`** | PDF alojado por un tercero (uno de los 19 vendors); coherente pero **no es el original** |
| **Conteos de reviews de Peer Insights** | **Totales de producto en todos los mercados**, no scoped a DTO |
| **Contenido técnico de ArchiMate 4** | Press release verificado; **texto de la spec no** (SSO) |
| **Normas ISO 2026** | Verificadas solo en distribuidores (evs.ee, en-standard.eu); `iso.org` da 403 |
| **Claim McKinsey "25-50% time-to-value"** | **Fuente primaria no localizable. NO USAR** |
| **KYP.ai** | `kyp.ai` devolvió 307 no seguible. **No verificado** |
| **2ª ed. de *Enterprise Ontology* (Dietz & Mulder)** | Anunciada, **no confirmada** |
| **Leaderboard 2026 de TheAgentCompany** | **30,3% es la cifra revisada por pares**; cualquier número mayor no está verificado |

---

## 7 · Qué cambia (y qué NO) en nuestras decisiones

**Confirma sin cambiar nada:**
- **CK-21 (as-code)** — la cita de The Open Group es la mejor defensa que existe del sustrato git.
- **CK-30 (arnés por rol×proceso)** — TheAgentCompany + OrgAgent: la forma organizacional declarada
  gana; el enjambre pierde.
- **CK-24 / M40** — la crítica de "multiple realities" refuerza no aplanar personas en promedios.
- **Consultio (levantamiento por entrevista)** — deja de ser servicio previo y pasa a ser
  **ingrediente técnico** (86% vs 74%).

**Obliga a matizar el discurso:**
- **No prometer "simula".** El horizonte de simulación con arneses (VISION §Horizontes, gateado)
  necesita **preregistro de configuración** o no es válido.
- **"Twin" = ancla de categoría, no promesa de capacidad.**

**Abre trabajo nuevo (no fichado todavía):**
- Cruzar la **gramática transaccional de DEMO** con `objeto.schema.yaml` (la ontología huérfana).
- Revisar si `ISO 15704` merece entrar al marco ISO de VISION §ISO.

---

## Fuentes

`eqv.it/doc/Market_Guide.pdf` (MG G00785499 íntegro) · `gartner.com/reviews/market/digital-twin-of-an-organization-platforms` ·
DOI `10.1007/978-3-030-94343-1_19` (Becker & Pentland) · DOI `10.1007/s41469-023-00151-z` (Lyytinen et al.) ·
DOI `10.1016/j.bushor.2020.08.001` (Parmar et al.) · DOI `10.1007/s44311-025-00009-5` (AgentSimulator) ·
arXiv 2412.14161 · 2411.10109 · 2606.01199 · 2604.01020 · 2606.17459 · 2506.19806 · 2509.13397 · 2605.00197 ·
2507.02919 · 2409.02601 · 2204.11328 (van der Aalst) ·
`celonis.com/news/press/…context-model…ikigai-labs` · `ardoq.com/news/ardoq-graphlake-context-graph-enterprise-ai` ·
`interfacing.com/digital-twin-of-an-organization-trust` · `opengroup.org/open-group-archimate-model-exchange-file-format` ·
`digitaltwinconsortium.org/glossary` · `ee-institute.org/eewc` · `link.springer.com/conference/edewc` (404).

Acceso: 2026-07-25/26.
