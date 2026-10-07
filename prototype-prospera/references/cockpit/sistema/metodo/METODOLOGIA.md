# Metodología — Cockpit · Compendio de referencia

> **Propósito:** catálogo navegable de TODAS las metodologías que sostienen el producto, con
> fuentes y links, para profundizar cualquier tema conforme avanzamos. Principio rector:
> *framework + fuente, con sustancia (cómo lo usamos), no adorno.*
>
> **Documentos hermanos:** [`VISION.md`](VISION.md) = el norte del producto ·
> [`LEDGER.md`](LEDGER.md) = el registro de decisiones CK-NN. **Este** = el "cómo metodológico", referencia estable.
> El rol de cada estándar en el **Organization Twin** (cuándo sí / cuándo no / cuándo propio) vive en
> [`NOTACIONES.html`](NOTACIONES.html) (§5).
>
> **Última actualización:** 2026-07-17 (CK-21 · twin + familia I)

---

## 0. Índice de búsqueda rápida

**¿Qué necesito? → dónde ir**

| Necesito… | Ve a |
|---|---|
| El flujo completo de punta a punta (hola → done) | [§1](#1-la-metodología-base-de-punta-a-punta-hola--done) |
| Cómo se alinean gaps ↔ objetivos ↔ procesos ↔ OKRs | [§2 · El Hilo de Oro](#2-el-hilo-de-oro--cadena-de-alineación) |
| Las 5 capas del sistema | [§3](#3-las-capas-del-sistema-referencia-rápida) |
| Una metodología puntual (ficha con fuente + cómo) | [§4 · Catálogo](#4-catálogo-de-metodologías-fichas) |
| Qué estándar usa el twin, en qué rol, cuándo sí/no | [§5 · Notaciones del twin](#5-notaciones-del-twin) |
| Qué metodología aplica en qué punto del mapa | [§6 · Tabla cruzada](#6-mapa-metodología--dónde-se-usa) |
| Todos los links | [Fuentes](#fuentes) |

**Catálogo por familia** (saltar a la ficha):

<!-- GEN:indice -->
- **A · Descubrimiento & Producto:** [Dual Track Agile](#m01) · [Continuous Discovery](#m02) · [Product Operating Model](#m03) · [Shape Up](#m04) · [Jobs-to-be-Done](#m05) · [Impact Mapping](#m06)
- **B · Dominio & Proceso:** [Event Storming](#m07) · [Domain-Driven Design](#m08) · [Value Stream Mapping](#m09) · [Service Blueprint](#m10) · [BPMN](#m11) · [APQC Process Classification Framework](#m12) · [Process / Task Mining](#m29)
- **C · Arquitectura & Sistemas:** [ArchiMate](#m13) · [SYSTEM-MAP + document-project](#m14) · [Business Capability Modeling](#m31)
- **D · Gobierno, Calidad & Madurez:** [COBIT 2019](#m15) · [ISO 9001](#m16) · [ITIL 4](#m17) · [RACI](#m25) · [ISO 10013](#m38) · [DMAIC](#m42) · [MASP](#m43) · [Embudo de ideas](#m44) · [ISO 56002](#m45) · [ISO 9004 (madurez)](#m47) · [EFQM RADAR](#m49) · [P3M3](#m50) · [ISO 10015 (competencia)](#m51) · [ISO 31000 (apetito)](#m52) · [ISO 8000-61 (datos)](#m53) · [Sesión de directorio (acuerdos y acta)](#m58) · [MEG (FNQ · Brasil)](#m60)
- **E · Especificación & Construcción:** [Spec-Driven Development](#m18) · [EARS](#m19) · [Specification by Example](#m20)
- **F · Valor, Costo & Alineación:** [OKR](#m21) · [FinOps — Quantify Business Value](#m22) · [Hoshin Kanri](#m26) · [Wardley Mapping](#m27) · [WSJF](#m28) · [Balanced Scorecard](#m30) · [GPD (Falconi)](#m41) · [Benchmarks APQC/Hackett](#m48) · [Ambición 70/20/10](#m54) · [Reporte financiero (fuente)](#m55) · [Liquidez (caja 13 semanas)](#m56) · [Presupuesto (asignado vs comprometido)](#m57) · [Valor ganado (inversiones)](#m59) · [OBZ (base cero)](#m61)
- **G · IA: Grounding & Anti-alucinación:** [Grounding](#m23)
- **H · Diseño de Servicio & Experiencia:** [This Is Service Design Doing](#m24)
- **I · Twin & automatización del trabajo:** [Ontología Palantir](#m32) · [DEMO](#m33) · [BPSim](#m34) · [ECRS](#m35) · [Criterios RPA + agente](#m36) · [Taxonomía de verbos](#m37) · [NASA-TLX](#m39) · [Métricas de persona](#m40) · [Arnés por rol×proceso](#m46)
<!-- /GEN:indice -->

---

## 1. La metodología base de punta a punta (hola → done)

El engagement completo, con el framework que respalda cada paso. Módulos: **M1** Levantamiento ·
**M2** Mantenimiento · **M3** Mejora continua (ver [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md) ·
[`M3-ESPINAZO.md`](M3-ESPINAZO.md) · [`PROCESS-AS-DATA.md`](PROCESS-AS-DATA.md)).

| # | Paso | Módulo | Framework(s) | Salida |
|---|---|---|---|---|
| 1 | **Hola / Encuadre** | M1 | Contexto org [ISO 9001 cl.4](#m16) · objetivos [OKR](#m21)+[COBIT cascade](#m15) · autoridad RACI | objetivos + stakeholders + autoridad |
| 2 | **Ingesta + Triage** del dump (~1GB) | M1 | [Grounding/Provenance](#m23) | artefactos clasificados (tipo·fecha·autoridad·confianza) |
| 3 | **AS-IS de sistemas** | M1 | [document-project](#m14) · [ArchiMate](#m13) (cuáles digitales) · bot código↔docs (drift) | SYSTEM-MAP + capability ledger |
| 4 | **AS-IS de procesos** | M1 | [APQC PCF](#m12) (taxonomía) · [Event Storming](#m07)/[VSM](#m09) · [Service Blueprint](#m10) · entrevistas (doc-vs-real) | mapa de procesos actual + dolores |
| 5 | **Alineación (Hilo de Oro)** | M1 | [COBIT goals cascade](#m15) · [OKR](#m21) · [Impact Mapping](#m06) | objetivo→KR→proceso→persona→sistema |
| 6 | **Gap Analysis** | M1 | AS-IS vs estándar deseado (objetivos + madurez + readiness) | semáforo + brechas (proceso/sistema), **cada una atada a un objetivo** |
| 7 | **Diagnóstico** (entregable vendible) | M1 | síntesis | mapa + brechas + plan priorizado + proyección valor/costo |
| 8 | **Apuesta** | M3 | [Shape Up](#m04) (appetite/no-gos) · [OST](#m02) | outcome + appetite + no-gos |
| 9 | **Contrato (spec ratificado)** | M3 | [Spec-Driven Dev](#m18) · [EARS](#m19) · chequeo de contradicciones | spec = contrato (gate G1) |
| 10 | **Construcción** | M3 | Claude Code + gates SDD · [BDD](#m20) | código + tests |
| 11 | **Aceptación + Valor** | M3 | [FinOps Quantify Value](#m22) · [Impact Mapping](#m06) | aporte por capability **sube al KR** |
| 12 | **Mantenimiento (loop)** | M2 | [ISO 9001 PDCA](#m16) · contexto vivo · aprobar/rechazar | baseline vivo → re-prioriza |

El corte **Discovery/Delivery** ([Dual Track](#m01)) cae en el paso 9 (G1). El loop de valor
(paso 11→1) cierra el ciclo.

---

## 2. El Hilo de Oro — cadena de alineación

> El eslabón que faltaba: **todo gap debe rastrear hacia arriba a un objetivo de negocio, y todo
> objetivo hacia abajo a las capabilities que lo mueven.** Trazabilidad bidireccional y auditable.
> **Lo SOPORTA el sistema** (estructura de datos en la capa de contexto + visual en el cockpit),
> no solo el consultor.

```
PLAN A 3 AÑOS → PLAN ANUAL   (Hoshin — el mapa; capas 0-5 de objetivos.md §6)
   └─▶ OBJETIVO DE NEGOCIO  (ISO 9001 cl.6.2 · COBIT enterprise goal — del directorio)
         └─▶ KR TRIMESTRAL  (OKR — el indicador que se propone mover este trimestre)
               └─▶ KPI  (del PROCESO, con dueño = ROL o ÁREA — APQC PCF · Value Stream)
                     └─▶ ACTIVIDAD (verbo — M37; la persona entra como OCUPANTE del rol, CK-24)
                           └─▶ SISTEMA(S)   (SYSTEM-MAP · ArchiMate)
                                 └─▶ CAPABILITY   (capability ledger)
                                       └─▶ GAP   (brecha detectada)
                                             └─▶ HISTORIA → CÓDIGO   (SDD · EARS)
```
> **Cascada canónica ÚNICA** (re-fichado 2026-07-17, spec `arquitectura-refichado-ck21`): ésta es LA
> definición del hilo — reconcilia las tres variantes que convivían en el repo. La PERSONA no es
> eslabón de medición: el KPI ancla a rol/proceso/área y la persona lo hereda como ocupante
> (frontera **CK-24**; atribución actividad→KPI = N:M vía rol).

**Hacia arriba (auditoría):** un gap/historia siempre responde "¿qué objetivo mueve y qué KR?".
**Hacia abajo (priorización):** un objetivo siempre muestra "¿qué capabilities/gaps lo sirven y cuánto aportan?".

Frameworks que lo fundan: [COBIT goals cascade](#m15) (objetivo de empresa → objetivo de IT),
[OKR](#m21) (objetivo → key results por trimestre), [Impact Mapping](#m06)
(Goal→Actor→Impact→Deliverable), y el **capability ledger** propio (cap → historia → código).

**Requisito de producto:** la capa de contexto guarda esta cadena como dato de primera clase; el
cockpit la visualiza (de objetivo a gap y de vuelta); el loop de valor hace *roll-up* del aporte
real de cada capability hasta el KR.

---

## 3. Las capas del sistema (referencia rápida)

Modelo vigente CK-18/CK-21 (arquitectura: [`sistema/arquitectura/NODOS.md`](NODOS.md)).
1. **Actores** — Cliente (sponsor·ops·trabajadores) · Consultor (usuario primario, rol transferible al Analista de Calidad) · Máquina (arneses).
2. **3 módulos** — M1 Levantamiento → M2 Mantenimiento ⇄ M3 Mejora continua.
3. **3 planos de runtime** — Edge (arneses del método sobre Claude Code: Consultio N14 / DevStudio N5 — sin voz ni motor conversacional server-side, muertos CK-18) · Organización (Cockpit N13 + Repositorio Oficial N6 + Lakehouse N16) · Fabricante (Arnesia N15 + distribución N3); seam = git/filesystem.
4. **Capa de contexto viva** — objetivos·personas·procesos·sistemas·brechas, con provenance+confianza; git = sync.
5. **Espinazo de frameworks** — este documento (§4) + el Hilo de Oro (§2) + las notaciones del twin (§5).
6. **Loop de valor** — costo + ahorro + aporte por capability.

---

## 4. Catálogo de metodologías (fichas)

> Formato (generado desde [`methodologies.yaml`](methodologies.yaml)): **Qué** · **Fuente** · **Objeto** · **Aporte único** · **Cuándo** · **Combina** · **Principios**.

<!-- GEN:cards -->
### Familia A · Descubrimiento & Producto


<a id="m01"></a>**M01 · Dual Track Agile**
- **Qué:** separa discovery (qué vale construir) de delivery (construirlo bien)
- **Fuente:** Sy/Miller; pop. Cagan & Patton — Dual Track Agile (2007/2012). [https://productschool.com/blog/product-fundamentals/dual-track-agile](https://productschool.com/blog/product-fundamentals/dual-track-agile)
- **Objeto:** O1 Oportunidad / Apuesta · sec: O7
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el CORTE discovery/delivery — cuándo dejar de explorar y empezar a construir (=G1)
- **Cuándo:** decidir el límite entre exploración y construcción
- **Combina:** M02 (el discovery alimenta el delivery) · M18 (delivery = SDD tras el gate G1)
- **Principios:** P1, P7

<a id="m02"></a>**M02 · Continuous Discovery / Opportunity Solution Tree (OST)**
- **Qué:** árbol Outcome→Oportunidades→Soluciones→Assumption Tests
- **Fuente:** Teresa Torres — Continuous Discovery Habits (2021). [https://www.producttalk.org/](https://www.producttalk.org/)
- **Objeto:** O1 Oportunidad / Apuesta · sec: O2
- **Nivel:** 2 · Estratégico (ancla) · también: 3 · Táctico
- **Aporte único:** el ÁRBOL que estructura la exploración de valor y conecta solución↔outcome
- **Cuándo:** etapa 1 — exploración de valor; artefacto central del cockpit
- **Combina:** M05 (JTBD ancla la oportunidad en el trabajo real) · M06 (impact mapping da la cadena de valor)
- **Principios:** P1, P2

<a id="m03"></a>**M03 · Product Operating Model**
- **Qué:** modelo operativo: discovery + delivery + equipos empoderados; outcomes > outputs
- **Fuente:** Marty Cagan / SVPG — Transformed (2024). [https://www.svpg.com/books/transformed-moving-to-the-product-operating-model/](https://www.svpg.com/books/transformed-moving-to-the-product-operating-model/)
- **Objeto:** T3 Gobierno / Loop · sec: O1
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el PARAGUAS que justifica equipos-por-outcome (IA + consultor = el 'equipo')
- **Cuándo:** encuadre del modus operandi de M3
- **Combina:** M02 (su discovery es continuo) · M04 (su delivery apuesta con appetite)
- **Principios:** P1

<a id="m04"></a>**M04 · Shape Up**
- **Qué:** shaping (solución a grueso), appetite (tiempo fijo), no-gos, betting, ciclos
- **Fuente:** Ryan Singer / Basecamp — Shape Up (2019). [https://basecamp.com/shapeup](https://basecamp.com/shapeup)
- **Objeto:** O1 Oportunidad / Apuesta · sec: O6
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** el APPETITE — tiempo fijo / alcance variable, y los no-gos de la apuesta
- **Cuándo:** etapa 0/3 — apostar y dar forma al pitch
- **Combina:** M02 (la oportunidad a apostar sale del OST) · M21 (el appetite se ata a mover un KR) · M22 (al sellar, la apuesta declara el valor que persigue en dinero con supuesto visible (D-23)) · M52 (arbitraje (recíproca en M52): appetite = tiempo/alcance que se apuesta; apetito de riesgo = exposición que el directorio tolera — dos varas distintas de la misma apuesta) · M54 (la apuesta lleva su bolsa de ambición y entra al rollup de mezcla real (D-22/D-23))
- **Principios:** P1, P7

<a id="m05"></a>**M05 · Jobs-to-be-Done (JTBD)**
- **Qué:** enmarca la necesidad como el 'trabajo' que el usuario contrata, no como feature
- **Fuente:** Clayton Christensen — Know Your Customers' Jobs to Be Done (HBR 2016). [https://hbr.org/2016/09/know-your-customers-jobs-to-be-done](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)
- **Objeto:** O1 Oportunidad / Apuesta · sec: T2, O2
- **Nivel:** 2 · Estratégico (ancla) · también: 3 · Táctico
- **Aporte único:** el TRABAJO (job, no feature) — evita soluciones disfrazadas de problema
- **Cuándo:** etapa 1, junto al OST, para anclar la oportunidad
- **Combina:** M02 (alimenta el árbol de oportunidades) · M24 (el job informa persona y journey)
- **Principios:** P1

<a id="m06"></a>**M06 · Impact Mapping**
- **Qué:** mapa Goal → Actor → Impact → Deliverable
- **Fuente:** Gojko Adzic — Impact Mapping. [https://www.impactmapping.org/](https://www.impactmapping.org/)
- **Objeto:** O2 Objetivo & Valor · sec: O1
- **Nivel:** 2 · Estratégico (ancla) · también: 3 · Táctico
- **Aporte único:** la CADENA Goal→Deliverable que permite atribuir aporte por capability
- **Cuándo:** Hilo de Oro; etapa 1; loop de valor
- **Combina:** M21 (el impact aterriza en KR trimestral) · M15 (comparte el goals cascade) · M22 (atribuye el aporte por capability)
- **Principios:** P1, P2

### Familia B · Dominio & Proceso


<a id="m07"></a>**M07 · Event Storming**
- **Qué:** taller: eventos de dominio → comandos → actores → políticas → agregados
- **Fuente:** Alberto Brandolini — Event Storming. [https://www.eventstorming.com/](https://www.eventstorming.com/)
- **Objeto:** O3 Proceso · sec: O5
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** los EVENTOS de dominio → bounded contexts (rompe en multi-sistema)
- **Cuándo:** AS-IS de procesos (paso 4) y descomposición (etapa 3)
- **Combina:** M08 (los eventos revelan los bounded contexts) · M09 (el flujo de eventos es el value stream)
- **Principios:** P3, P4

<a id="m08"></a>**M08 · Domain-Driven Design (DDD)**
- **Qué:** modelado del dominio; bounded contexts; lenguaje ubicuo
- **Fuente:** Eric Evans — Domain-Driven Design (2003). [https://www.domainlanguage.com/](https://www.domainlanguage.com/)
- **Objeto:** O5 Sistema & Capabilities · sec: O3
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** los BOUNDED CONTEXTS + lenguaje ubicuo — dónde están las costuras de integración
- **Cuándo:** etapa 3; arquitectura de sistemas
- **Combina:** M07 (del event storming salen los contexts) · M13 (los contexts mapean a aplicaciones)
- **Principios:** P4

<a id="m09"></a>**M09 · Value Stream Mapping (VSM)**
- **Qué:** técnica lean: visualiza flujo de valor y desperdicio; future-state map
- **Fuente:** Rother & Shook — Learning to See (LEI). [https://www.lean.org/](https://www.lean.org/)
- **Objeto:** O3 Proceso · sec: O6
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el FUTURE-STATE del FLUJO + el desperdicio visible (toque vs espera) — vende el ahorro a nivel de flujo; el veredicto por actividad es del triage ECRS (M35)
- **Cuándo:** AS-IS de procesos y modelado de future-state (etapa 3)
- **Combina:** M10 (el blueprint dice dónde duele; VSM optimiza el proceso detrás) · M07 (comparten el flujo de valor) · M35 (VSM revela el flujo; ECRS ordena el veredicto por actividad)
- **Principios:** P3, P1

<a id="m10"></a>**M10 · Service Blueprint**
- **Qué:** mapea la experiencia del cliente contra los procesos internos (inside-out)
- **Fuente:** Nielsen Norman Group — Service Blueprints. [https://www.nngroup.com/articles/service-blueprints-definition/](https://www.nngroup.com/articles/service-blueprints-definition/)
- **Objeto:** O3 Proceso · sec: T2
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el INSIDE-OUT (experiencia ↔ proceso) — revela dónde duele
- **Cuándo:** AS-IS de procesos (paso 4)
- **Combina:** M09 (tras el dolor, VSM optimiza el proceso detrás) · M24 (TiSDD lo extiende a frontstage/backstage + interfaces)
- **Principios:** P3, P4

<a id="m11"></a>**M11 · BPMN**
- **Qué:** notación estándar para modelar procesos de negocio
- **Fuente:** Object Management Group — BPMN 2.0. [https://www.bpmn.org/](https://www.bpmn.org/)
- **Objeto:** O3 Proceso
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** la NOTACIÓN común cuando un proceso necesita formalizarse con rigor
- **Cuándo:** documentación de procesos (M1/M2); opcional sobre Event Storming/VSM
- **Combina:** M07 (formaliza lo que emergió en el storming) · M09 (notación sobre el value stream)
- **Principios:** P4

<a id="m12"></a>**M12 · APQC Process Classification Framework (PCF)**
- **Qué:** taxonomía universal de procesos (12 categorías, ~1000 procesos), open standard
- **Fuente:** APQC — Process Classification Framework. [https://www.apqc.org/process-frameworks](https://www.apqc.org/process-frameworks)
- **Objeto:** O3 Proceso
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico, 4 · Operativo
- **Aporte único:** la TAXONOMÍA universal — el esqueleto para no perderse en el 1GB + cobertura
- **Cuándo:** AS-IS de procesos — clasificar cada proceso hallado
- **Combina:** M07 (esqueleto donde cuelgan los eventos) · M10 (clasifica los procesos del blueprint) · M48 (el ID PCF es la clave de join del benchmark externo — la taxonomía abre la comparación sin metamodelo nuevo) · M16 (ARBITRAJE de la dimensión que las dos anclan (D-a · 2026-07-30): no compiten porque clasifican para cosas distintas — APQC clasifica para COMPARAR (id universal = clave de join del benchmark), el mapa de procesos de M16 clasifica para LEER (dirección · negocio · apoyo). El tipo NO se deriva del id APQC: la categoría 1.0 ('desarrollar visión y estrategia') es operating en APQC y dirección pura en el mapa ISO — la inferencia se rompe en la primera fila. Se declaran las dos)
- **Principios:** P4

<a id="m29"></a>**M29 · Process / Task Mining**
- **Qué:** descubre el proceso REAL desde logs de sistemas y clicks de escritorio; halla desviaciones, cuellos de botella y oportunidades de automatización
- **Fuente:** Wil van der Aalst (process mining) · Celonis (líder Gartner MQ 2025) — Process & Task Mining — descubrimiento desde datos. [https://www.celonis.com/process-mining/what-is-process-mining/](https://www.celonis.com/process-mining/what-is-process-mining/)
- **Objeto:** T1 Dato / Grounding · sec: O3, O6
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el AS-IS REAL desde DATOS (no declarado) + dónde automatizar — los 'agentes' que recorren sistemas para mapear de verdad
- **Cuándo:** etapa 1 (mapeo automático del AS-IS) + etapa 3 (detectar puestos/tareas automatizables con IA)
- **Combina:** M12 (clasifica los procesos hallados en la taxonomía APQC) · M09 (VSM optimiza el flujo que el mining reveló) · M14 (alimenta el SYSTEM-MAP con uso real) · M23 (el dato minado lleva fuente·confianza (grounding)) · M36 (alimenta volumen/%excepciones de los dos scores del triage)
- **Principios:** P5, P3

### Familia C · Arquitectura & Sistemas


<a id="m13"></a>**M13 · ArchiMate / TOGAF**
- **Qué:** lenguaje y framework de arquitectura empresarial; capas negocio/aplicación/tecnología
- **Fuente:** The Open Group — ArchiMate / TOGAF. [https://www.opengroup.org/](https://www.opengroup.org/)
- **Objeto:** O5 Sistema & Capabilities · sec: O3
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico
- **Aporte único:** el MAPEO negocio↔aplicación — responde cuáles procesos son digitales
- **Cuándo:** AS-IS de sistemas (paso 3)
- **Combina:** M14 (da el marco que el SYSTEM-MAP puebla) · M08 (capa-aplicación ↔ bounded contexts)
- **Principios:** P4, P2

<a id="m14"></a>**M14 · SYSTEM-MAP + document-project (propio)**
- **Qué:** mapa vivo de sistemas + capabilities, leyendo el código real (reverse-engineer)
- **Fuente:** prenter-harness (propio); insp. BMAD document-project — SYSTEM-MAP. [https://github.com/bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- **Objeto:** O5 Sistema & Capabilities · sec: T1
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el MAPA VIVO desde el código + drift código↔docs
- **Cuándo:** AS-IS de sistemas (paso 3); plano Análisis
- **Combina:** M13 (ArchiMate da el marco; el bot lo puebla) · M23 (cada dato del mapa lleva fuente + confianza)
- **Principios:** P5, P3

<a id="m31"></a>**M31 · Business Capability Modeling**
- **Qué:** modela QUÉ hace la empresa (capacidades, no cómo) en un mapa; aplica heatmap de madurez/desempeño/dolor para ubicar gaps
- **Fuente:** The Open Group (TOGAF Business Architecture) · práctica LeanIX — Business Capability Map + heatmap de gaps. [https://pubs.opengroup.org/togaf-standard/business-architecture/business-capabilities.html](https://pubs.opengroup.org/togaf-standard/business-architecture/business-capabilities.html)
- **Objeto:** O5 Sistema & Capabilities · sec: O3, O6
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el MAPA DE CAPACIDADES con HEATMAP — dónde están los gaps/dolores y dónde conviene invertir, estable frente al cómo
- **Cuándo:** etapa 1 — el mapa de la organización + heatmap de gaps alineado a los objetivos
- **Combina:** M13 (vive en la capa-negocio de ArchiMate/TOGAF) · M12 (las capacidades se sostienen en procesos APQC) · M27 (Wardley pone evolución a cada capacidad) · M15 (el heatmap usa niveles de madurez COBIT)
- **Principios:** P4, P3

### Familia D · Gobierno, Calidad & Madurez


<a id="m15"></a>**M15 · COBIT 2019**
- **Qué:** gobierno de IT; goals cascade (empresa→IT); niveles de capability/madurez
- **Fuente:** ISACA — COBIT 2019. [https://www.isaca.org/resources/cobit](https://www.isaca.org/resources/cobit)
- **Objeto:** O6 Gap & Madurez · sec: O2
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el GOALS CASCADE + niveles de madurez (el semáforo del gap)
- **Cuándo:** Hilo de Oro + Gap Analysis (madurez digital). Modo lite, sin certificación
- **Combina:** M21 (cascade + OKR = el hilo hacia arriba) · M06 (comparten la cadena objetivo→valor) · M47 (dos escaleras con arbitraje (D-32): COBIT 0-5 gradúa UNA CAPACIDAD (`capability.assessment`); ISO 9004 1-5 gradúa el SISTEMA DE GESTIÓN entero. Conviven y JAMÁS se promedian — por eso la escala viaja SIEMPRE pegada al número)
- **Principios:** P2, P3

<a id="m16"></a>**M16 · ISO 9001**
- **Qué:** gestión de calidad; enfoque a procesos; PDCA (cl.10); contexto (cl.4); objetivos (cl.6.2); autoridad (cl.5.3); competencia (cl.7.2); revisión por la dirección (cl.9.3 — entradas obligatorias: desempeño del periodo, seguimiento de lo acordado antes, riesgos; salidas: decisiones y acciones)
- **Fuente:** ISO — ISO 9001:2015. [https://www.iso.org/iso-9001-quality-management.html](https://www.iso.org/iso-9001-quality-management.html)
- **Objeto:** T3 Gobierno / Loop · sec: O4
- **Nivel:** 3 · Táctico (ancla) · también: 1 · Directorio, 2 · Estratégico, 4 · Operativo
- **Aporte único:** la ONTOLOGÍA de contexto (cl.4) + el ciclo PDCA — robamos ontología, rechazamos aparato. cl.9.3 aporta además el ESQUELETO de la sesión de revisión (qué entra, qué sale), que M58 materializa como entidades del twin
- **Cuándo:** capa de contexto (vocabulario) y M2/M3 (mejora continua)
- **Combina:** M21 (objetivos cl.6.2 se expresan como OKR) · M25 (roles/autoridad cl.5.3 = RACI) · M38 (cl.7.5 información documentada = pirámide ISO 10013) · M47 (9004 GRADÚA (1-5) lo que 9001 releva (conformidad binaria) — la escalera de madurez sin certificación que la doctrina permite) · M51 (cl.7.2 competencia: 10015 la gradúa (requerida vs actual por rol) y cierra la brecha — el seam ya existe en el schema) · M58 (cl.9.3 revisión por la dirección se materializa como entidades del twin (sesión · acuerdo con responsable y plazo · acta generada); 9001 dice QUÉ entra y sale, M58 agrega lo que no cubre: facultades por monto y el acta versionada) · M12 (cl.4.4 pide identificar los procesos y sus interacciones; APQC aporta el id universal con que se COMPARAN. Conviven sin jerarquía: el tipo del mapa (dirección · negocio · apoyo) se declara acá, el id APQC se asigna allá — ninguno se infiere del otro (D-a))
- **Principios:** P4, P7

<a id="m17"></a>**M17 · ITIL 4**
- **Qué:** gestión de servicios IT; Service Value System; value streams de servicio
- **Fuente:** Axelos / PeopleCert — ITIL 4. [https://www.peoplecert.org/](https://www.peoplecert.org/)
- **Objeto:** T3 Gobierno / Loop
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** la rebanada para operar servicios IT que ya corren (helpdesk/incidentes/cambios)
- **Cuándo:** situacional — solo si el cliente opera servicios IT. NO es la columna
- **Combina:** M16 (service value system sobre el ciclo PDCA)
- **Principios:** P7

<a id="m25"></a>**M25 · RACI (Responsibility Assignment Matrix)**
- **Qué:** matriz de asignación de responsabilidad: Responsible · Accountable · Consulted · Informed
- **Fuente:** PMI — PMBOK Guide — Responsibility Assignment Matrix. [https://www.pmi.org/](https://www.pmi.org/)
- **Objeto:** O4 Personas & Autoridad · sec: T3
- **Nivel:** 3 · Táctico (ancla) · también: 1 · Directorio, 2 · Estratégico, 4 · Operativo
- **Aporte único:** la AUTORIDAD explícita — quién es Accountable habilita y ejecuta cada gate humano
- **Cuándo:** encuadre (autoridad) y en cada gate (quién ratifica/apuesta/acepta)
- **Combina:** M16 (formaliza roles/autoridad ISO cl.5.3) · M15 (el Accountable del KR ejecuta el gate) · M24 (alimenta el stakeholder map) · M36 (humano-por-diseño ancla a la A (accountability, firma, responsabilidad legal)) · M46 (la A define quién supervisa el arnés y qué gates humanos lleva adentro; C/I = contexto de lectura, no generan skills) · M58 (la autoridad también se declara arriba: el umbral por monto dice qué decisión firma el directorio y cuál la gerencia — RACI a nivel de gobierno) · M61 (dueño de paquete de gasto = A del RACI sobre ese gasto; paquete sin dueño nombrado se muestra SIN DUEÑO (es el hallazgo, no un campo vacío))
- **Principios:** P7, P2

<a id="m38"></a>**M38 · ISO 10013:2021 — pirámide documental (QMS)**
- **Qué:** pirámide documental del QMS: manual → procedimientos → instrucciones de trabajo → registros, alineada a ISO 9001 cl.7.5
- **Fuente:** ISO — ISO 10013:2021 — Guidance for documented information. [https://www.iso.org/standard/70936.html](https://www.iso.org/standard/70936.html)
- **Objeto:** T3 Gobierno / Loop · sec: O3
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** la PIRÁMIDE que clasifica el corpus documental del CLIENTE — cada documento sabe su nivel y a qué proceso sirve
- **Cuándo:** clasificar manuales/procedimientos/instrucciones/registros del cliente en el levantamiento y su mantenimiento
- **Combina:** M16 (instancia cl.7.5 (información documentada) del paraguas ISO 9001) · M12 (el documento clasificado ancla al proceso APQC que gobierna) · M46 (la instrucción de trabajo (nivel 3) y el skill del arnés salen de la MISMA fuente: un origen, dos salidas)
- **Principios:** P4, P7

<a id="m42"></a>**M42 · Lean Six Sigma / DMAIC**
- **Qué:** el proyecto FORMAL de mejora: charter con caso de negocio, fases Define-Measure-Analyze-Improve-Control con tollgates ante sponsor, belts como roles, beneficios hard/soft validados por finanzas
- **Fuente:** Motorola/GE · ASQ — Lean Six Sigma — ciclo DMAIC, charter, tollgates, belts. [https://asq.org/quality-resources/six-sigma](https://asq.org/quality-resources/six-sigma)
- **Objeto:** O7 Contrato & Código · sec: O6, O2
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico, 4 · Operativo
- **Aporte único:** el FORMATO corporativo del proyecto con caso de negocio auditado — doble firma sponsor+finanzas, beneficios contados ~12 meses (vigente: mercado de servicios LSS crece, no declinó)
- **Cuándo:** proyecto_mejora con caso de negocio formal (metodologia: dmaic)
- **Combina:** M35 (ECRS primero: no se automatiza (ni proyectiza) el desperdicio) · M22 (la cuantificación del beneficio (hard/soft/cost-avoidance) es FinOps) · M28 (WSJF prioriza qué brecha se vuelve proyecto) · M59 (distinción cardinal: el proyecto de MEJORA cierra con un indicador movido; la INVERSIÓN de capital cierra con un activo entregado y su margen — dos ciclos, dos varas)
- **Principios:** P1, P3

<a id="m43"></a>**M43 · MASP — Método de Análise e Solução de Problemas (QC Story)**
- **Qué:** el estándar brasileño de solución de problemas: identificación → observación → análisis → plan → acción → verificación (con RETROCESO si no bloqueó) → estandarización → conclusión
- **Fuente:** JUSE (QC Story) · Vicente Falconi (adaptación BR) — TQC no Estilo Japonês — MASP, 8 etapas sobre PDCA. [https://blogdaqualidade.com.br/masp-metodo-de-analise-e-solucao-de-problemas-parte-1/](https://blogdaqualidade.com.br/masp-metodo-de-analise-e-solucao-de-problemas-parte-1/)
- **Objeto:** O7 Contrato & Código · sec: O6
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el LOOP-BACK como doctrina: si la verificación no bloqueó el problema se retrocede — la transición en-verificacion→en-ejecucion del schema; usado hasta en el sector público BR (ENAP)
- **Cuándo:** proyecto_mejora en cliente brasileño / cultura Falconi (metodologia: masp)
- **Combina:** M42 (mismo ciclo de datos, dialecto distinto (MASP = QC Story; DMAIC = Six Sigma)) · M16 (vive bajo cl.10.2 (NC/acción correctiva) como motor formal) · M41 (los proyectos MASP sirven las metas desdobradas del GPD)
- **Principios:** P1, P3

<a id="m44"></a>**M44 · Gestión de ideas (embudo de ideas)**
- **Qué:** el embudo masivo y BARATO de propuestas del personal (individual o conjunta): enviada → evaluación por comité (viabilidad/impacto/alineación) → feedback + reconocimiento → un subconjunto se PROMUEVE a proyecto
- **Fuente:** kaizen teian (JHRA) · plataformas LATAM (AEVO) — programa de sugerencias → funil digital de ideas (triaje por comité, feedback, reconocimiento, promoción a proyecto). [https://blog.aevo.com.br/funil-de-ideias/](https://blog.aevo.com.br/funil-de-ideias/)
- **Objeto:** O7 Contrato & Código · sec: O4
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** la SEPARACIÓN idea↔proyecto como entidades enlazadas (la práctica real: cientos de ideas por campaña, evaluación ligera; el charter/beneficios viven en el proyecto) + reconocimiento al proponente (kaizen teian: casi todo proponente recibe respuesta)
- **Cuándo:** entidad idea del objeto — programas de participación del personal (los CCQ migrados a plataforma: AEVO 400+ empresas, Ambev 450+ ideas en 2 semanas)
- **Combina:** M42 (la idea promovida recibe charter DMAIC (promovida_a_ref)) · M40 (participación se agrega por área/rol — autoría ≠ medición (CK-24)) · M35 (muchas ideas son un 'eliminar' de ECRS resuelto just-do-it) · M54 (el comité etiqueta la ambición de cada idea en el triaje — el embudo alimenta y protege las tres bolsas)
- **Principios:** P1, P7

<a id="m45"></a>**M45 · ISO 56002 / 56001 — gestión de la innovación**
- **Qué:** el marco ISO del embudo idea→innovación como sistema de gestión (liderazgo, cultura, portafolio de iniciativas, realización de valor)
- **Fuente:** ISO TC 279 — ISO 56002:2019 (guía) · ISO 56001:2024 (certificable) — sistema de gestión de innovación. [https://www.iso.org/standard/68221.html](https://www.iso.org/standard/68221.html)
- **Objeto:** O7 Contrato & Código
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** Brasil = hotspot mundial temprano de la ISO de innovación (Grupo Boticário, Atento; PALAS primera certificada 56001) — el marco al que el embudo de ideas escala si un cliente exige certificación
- **Cuándo:** cliente que exija certificación de innovación o quiera formalizar el embudo como sistema de gestión (gateado por demanda)
- **Combina:** M44 (el embudo de ideas ES el corazón operativo que 56002 formaliza) · M16 (misma gramática de sistema de gestión ISO (HLS)) · M54 (el balance de portafolio que 56002 exige se instrumenta con la mezcla de ambición (ya activa en el MVP, sin esperar la certificación))
- **Principios:** P7

<a id="m47"></a>**M47 · ISO 9004:2018 — madurez del sistema de gestión (autoevaluación)**
- **Qué:** autoevaluación de madurez 1-5 por elemento del sistema de gestión (contexto, liderazgo, estrategia, recursos incl. finanzas y personas, procesos, mejora) — guía NO certificable, mismo HLS que ISO 9001
- **Fuente:** ISO/TC 176 — ISO 9004:2018 — Quality of an organization: guidance to achieve sustained success (Anexo A: autoevaluación de madurez 1-5). [https://www.iso.org/standard/70397.html](https://www.iso.org/standard/70397.html)
- **Objeto:** O6 Gap & Madurez · sec: T3, O4
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** la ESCALERA de madurez organizacional cross-función que 9001 no trae (conformidad binaria → grados 1-5): gradúa el PDCA, los roles, la documentación y las funciones de negocio (finanzas incluida), no solo IT
- **Cuándo:** diagnóstico M1 y mantenimiento M2 — nivel actual vs deseado por dimensión del sistema de gestión que M16 releva; descriptores por nivel para capacidades no-IT del heatmap
- **Combina:** M16 (hermana HLS: 9001 releva el QMS (conformidad), 9004 lo GRADÚA (madurez 1-5) — sin aparato de certificación, alineado a VISION §ISO) · M15 (arbitraje de escaleras: COBIT 0-5 manda en gobierno/IT y como semáforo del heatmap; 9004 1-5 manda en sistema de gestión y funciones de negocio) · M31 (presta descriptores por nivel a capacidades no-IT del heatmap — el nivel sigue siendo DERIVADO de evidencia, jamás pintado a mano) · M38 (gradúa cobertura/vigencia del corpus documental (pirámide 10013) — madurez de la información documentada) · M40 (la madurez de 'personas' se agrega por rol/área — jamás evaluación de persona nombrada (CK-24)) · M60 (arbitraje de la vara, ampliado a Brasil: 9004 es el DEFAULT; si el cliente brasileño ya se mide con MEG/FNQ, entra su puntaje como evidencia y NO se corre 9004 en paralelo (una escalera por dimensión — D-32))
- **Principios:** P3, P4

<a id="m49"></a>**M49 · EFQM 2025 — excelencia organizacional (RADAR)**
- **Qué:** modelo de excelencia con scoring RADAR: gradúa enfoque, DESPLIEGUE, evaluación y refinamiento por criterio, con peso fuerte en resultados percibidos (cliente y personas)
- **Fuente:** EFQM — EFQM Model (RADAR: Results · Approaches · Deploy · Assess & Refine). [https://efqm.org/the-efqm-model/](https://efqm.org/the-efqm-model/)
- **Objeto:** O6 Gap & Madurez · sec: T2, T3
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio
- **Aporte único:** gradúa el DESPLIEGUE (¿la práctica llega a toda la organización o quedó en el papel?) y los resultados de percepción — lo que la autoevaluación 9004 toca menos
- **Cuándo:** situacional — cliente orientado a reconocimiento/premio EFQM, o que exige graduar la experiencia de cliente (T2) con escala formal
- **Combina:** M47 (misma pregunta (madurez organizacional) — arbitraje: 9004 es el default (familia ISO, sin premio); EFQM cuando el cliente pide RADAR/reconocimiento o resultados de percepción graduados) · M10 (pone escala al 'dónde duele' del blueprint — resultados de percepción de cliente) · M26 (RADAR-Deploy gradúa la calidad del despliegue Hoshin (¿el catchball llegó a todos los niveles?)) · M60 (primos de linaje (premio + peso en resultados): EFQM para reconocimiento europeo · MEG para cliente brasileño. No se acumulan — se elige el que el cliente ya habla)
- **Principios:** P3

<a id="m50"></a>**M50 · P3M3 — madurez de portafolio, programas y proyectos**
- **Qué:** gradúa 1-5 la CAPACIDAD organizacional de gestionar proyectos, programas y portafolio (perspectivas: gobernanza, control, beneficios, riesgo, stakeholders, finanzas, recursos)
- **Fuente:** Axelos / PeopleCert — Portfolio, Programme and Project Management Maturity Model (5 niveles × 3 dominios × 7 perspectivas). [https://www.axelos.com/certifications/p3m3](https://www.axelos.com/certifications/p3m3)
- **Objeto:** O7 Contrato & Código · sec: O6
- **Nivel:** 2 · Estratégico (ancla) · también: 3 · Táctico
- **Aporte único:** mide la capacidad de PROYECTIZAR de la organización, no el proyecto individual — M42/M43 miden y disciplinan el proyecto; P3M3 dice si la org puede sostener un PORTAFOLIO de mejoras
- **Cuándo:** horizonte gateado por demanda (patrón M45): cliente con portafolio de proyectos de mejora grande o PMO formal que pida graduar su gestión
- **Combina:** M42 (DMAIC mide el proyecto; P3M3 la capacidad org de ejecutar muchos — la perspectiva 'benefits' empalma con verificar-beneficios del ciclo) · M43 (ídem MASP — el loop-back disciplinado (en-verificacion → en-ejecucion) es señal de nivel P3M3 alto) · M47 (escalera hermana especializada: 9004 gradúa el sistema de gestión entero; P3M3 solo la función proyectos/portafolio) · M59 (P3M3 gradúa la capacidad de sostener el portafolio; el valor ganado mide el desempeño de las inversiones concretas que lo componen)
- **Principios:** P3, P7

<a id="m51"></a>**M51 · ISO 10015:2019 — gestión de competencias y desarrollo de personas**
- **Qué:** guía para establecer y mantener la gestión de competencias: competencia requerida por rol vs actual del ocupante, cierre de brechas (formación/incorporación/rediseño) y evaluación de eficacia — mismo linaje 9001 (operacionaliza cl.7.2)
- **Fuente:** ISO/TC 176/SC 3 — ISO 10015:2019 — Quality management: guidelines for competence management and people development (guía, no certificable). [https://www.iso.org/standard/69459.html](https://www.iso.org/standard/69459.html)
- **Objeto:** O4 Personas & Autoridad · sec: O6, T3
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** GRADÚA la competencia: la brecha requerido-vs-actual por rol como dato derivado del twin (el seam ya existe: rol.competencias_req · persona.competencias); práctica operativa = matriz de habilidades (ILUO); para roles digitales presta la escala SFIA 9 (niveles 1-7) sin adoptar el marco entero
- **Cuándo:** levantamiento M1 (quién puede qué, insumo del AS-IS de roles) y mantenimiento M2 (cierre de brechas de competencia); insumo del arnés M46 (quién puede supervisar qué)
- **Combina:** M16 (operacionaliza cl.7.2: el paraguas releva la competencia, 10015 la gradúa y cierra la brecha) · M38 (hermanas de la familia de apoyo 9001: 10013 gradúa la documentación, 10015 la competencia) · M25 (la A del RACI exige competencia demostrada — el gate humano lo ocupa alguien competente para ese gate) · M46 (el arnés eleva el piso de ejecución; la competencia del supervisor es el techo — insumo de verificacion_humana y de la autonomía sugerida) · M40 (la matriz por persona es dato individual: opt-in Gobernanza + consentimiento; el twin ve % de cobertura por rol/área)
- **Principios:** P3, P7

<a id="m52"></a>**M52 · ISO 31000:2018 — apetito de riesgo (con COSO ERM como marco alterno)**
- **Qué:** gestión de riesgos (principios + marco + proceso): la gobernanza fija CRITERIOS de riesgo — cuánto y qué tipo de riesgo se acepta por categoría (el APETITO); y el proceso (identificar → analizar → evaluar → tratar → seguir) produce el REGISTRO: cada riesgo con probabilidad, impacto, responsable, mitigación comprometida y tendencia. COSO ERM aporta la declaración formal de apetito cuando el cliente la exige
- **Fuente:** ISO/TC 262 · COSO — ISO 31000:2018 — Risk management: guidelines (criterios de riesgo) · COSO ERM 2017 (risk appetite statement formal, alineado a estrategia). [https://www.iso.org/iso-31000-risk-management.html](https://www.iso.org/iso-31000-risk-management.html)
- **Objeto:** O1 Oportunidad / Apuesta · sec: O2, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico
- **Aporte único:** las DOS mitades, que sólo sirven juntas: el APETITO como dato del directorio (la vara contra la que se gradúa cada apuesta/objetivo — el panel 'riesgo vs apetito' deja de ser cualitativo suelto) y el REGISTRO como su contraparte (sin registro, el apetito es una declaración sin nada que medir; sin apetito, el registro es una lista sin veredicto). El nivel se DERIVA de probabilidad × impacto y el veredicto —dentro / al límite / por encima del apetito— se deriva contra la vara de SU categoría: ninguno de los dos se declara a mano. Primera ancla de O1 en el twin
- **Cuándo:** encuadre del nivel directorio (m1) y cada sesión de revisión (m2): el directorio fija el apetito por categoría (liquidez, reputación, expansión, operación, cumplimiento, personas) y mantiene el registro contra esa vara
- **Combina:** M16 (cl.6.1 risk-based thinking es el gancho MVP (riesgos[] tipados por proceso); 31000 lo eleva a apetito del directorio cuando se activa) · M04 (arbitraje: appetite de Shape Up = tiempo/alcance que se apuesta; apetito de riesgo = exposición que el directorio tolera — dos varas distintas de la misma apuesta) · M15 (el semáforo de madurez no reemplaza el apetito: el gap dice dónde duele, el apetito dice cuánto dolor se acepta) · M28 (el apetito FILTRA por exposición antes de que el CoD ORDENE por economía) · M54 (la mezcla de ambición es el apetito hecho asignación: el % en transformar = riesgo que el directorio acepta explícito) · M56 (el piso de caja es apetito de liquidez hecho número — misma mecánica de vara, expresada en dinero y con fecha) · M58 (el registro y su contraste contra el apetito son entrada de la sesión; el riesgo que excede la vara sale como acuerdo con responsable y plazo)
- **Principios:** P3, P7

<a id="m53"></a>**M53 · ISO 8000-61 — madurez de la gestión de calidad de datos**
- **Qué:** modelo de referencia de procesos de la gestión de calidad de datos (implementación, aseguramiento, mejora, soporte) — base para graduar qué tan madura es la GESTIÓN de datos del cliente
- **Fuente:** ISO/TC 184/SC 4 — ISO 8000-61:2016 — Data quality, part 61: data quality management process reference model (serie ISO de calidad de datos). [https://www.iso.org/standard/63086.html](https://www.iso.org/standard/63086.html)
- **Objeto:** T1 Dato / Grounding · sec: O6, O5
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico
- **Aporte único:** gradúa el SISTEMA que produce los datos (M23 gradúa cada dato: fuente+conf+frescura — ésta gradúa la fábrica): descriptores para la capability de datos/analítica del heatmap cuando el dato es la brecha estructural
- **Cuándo:** horizonte gateado por demanda: cliente cuyo diagnóstico revela el dato como brecha estructural (papel, silos, sin dueño de dato) — típico 'datos de obra en papel'
- **Combina:** M23 (división del trabajo: M23 gradúa cada dato AS-IS; 8000-61 gradúa el sistema de gestión que los produce) · M31 (presta descriptores de nivel a la capability de datos/analítica del heatmap) · M47 (9004 gradúa el sistema de gestión entero; 8000-61 profundiza solo el dominio datos)
- **Principios:** P3

<a id="m58"></a>**M58 · Gobierno de la sesión de directorio — acuerdos, acta y facultades**
- **Qué:** la sesión como entidad: agenda ordenada, entradas obligatorias (desempeño del periodo, seguimiento de lo acordado, riesgos y cambios), acuerdos con responsable y plazo, acta versionada, y umbrales de facultad que dicen qué decisión sube al directorio y cuál queda en la gerencia
- **Fuente:** ISO (cl.9.3 revisión por la dirección) + práctica de gobierno corporativo (OCDE — Principios de Gobierno Corporativo G20/OCDE 2023) — ISO 9001:2015 cl.9.3 (entradas/salidas de la revisión) · delegación de facultades y registro de acuerdos del órgano de gobierno. [https://www.oecd.org/corporate/principles-corporate-governance/](https://www.oecd.org/corporate/principles-corporate-governance/)
- **Objeto:** T3 Gobierno / Loop · sec: O4, O2
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico
- **Aporte único:** el punto que abre TODA sesión — qué se acordó la vez pasada y quién respondió — como dato, no como recuerdo; y el mecanismo que hace que la bandeja de decisiones no se vacíe nunca: el UMBRAL POR MONTO O MATERIA. Sin él, un tablero de directorio termina pidiendo decisiones sobre su propia configuración. Un acuerdo sin responsable y sin plazo no es un acuerdo: es una conversación
- **Cuándo:** encuadre del nivel directorio (m1) y cada sesión de revisión (m2); al cerrar la sesión, para generar el acta
- **Combina:** M16 (cl.9.3: la revisión por la dirección ya exige entradas (desempeño, seguimiento de acciones previas, riesgos) y salidas (decisiones y acciones) — esta card las materializa como entidades y agrega lo que 9001 no cubre: facultades y acta de gobierno) · M25 (el acuerdo lleva responsable declarado; la facultad por monto es autoridad declarada — RACI a nivel de gobierno) · M55 (el desempeño del periodo es la primera entrada de la sesión) · M52 (los riesgos y su contraste contra el apetito son entrada de la sesión y, cuando exceden la vara, salida como acuerdo) · M41 (la rendición de cuentas por nivel (GPD) es la misma disciplina un piso abajo: acuerdo con responsable, plazo y verificación) · M61 (cada paquete de gasto OBZ necesita un dueño con autoridad real: sale de las facultades por monto, no de una planilla aparte)
- **Principios:** P7, P4

<a id="m60"></a>**M60 · MEG / FNQ — Modelo de Excelência da Gestão (la vara brasileña de madurez)**
- **Qué:** modelo de excelencia brasileño: fundamentos de gestión evaluados por ciclo con puntaje (procesos gerenciales + resultados), con trayectoria de niveles hacia el premio nacional (PNQ)
- **Fuente:** Fundação Nacional da Qualidade (FNQ) · linaje Baldrige — Modelo de Excelência da Gestão (MEG) — fundamentos + temas + processos/resultados; ciclo de avaliação do PNQ e trilha «Rumo à Excelência». [https://fnq.org.br/modelo-de-excelencia-da-gestao/](https://fnq.org.br/modelo-de-excelencia-da-gestao/)
- **Objeto:** O6 Gap & Madurez · sec: T3, O4
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el MODO BRASILEÑO de la vara de madurez — gemelo exacto de lo que M41 es para M26: misma pregunta que 9004/EFQM, distinto vocabulario y distinto aparato de reconocimiento. Es el nombre que un directorio brasileño reconoce y contra el que ya se autoevaluó; sin este nodo el consultor traduce a un marco que el cliente no usa y pierde la evidencia que el cliente YA tiene
- **Cuándo:** gateado por demanda: cliente brasileño con historia FNQ/PNQ o con autoevaluación MEG previa — se LEE su ciclo como evidencia del diagnóstico, no se corre un ciclo nuevo
- **Combina:** M47 (arbitraje de la vara de madurez, ampliado: 9004 es el DEFAULT (familia ISO, sin premio) · MEG cuando el cliente brasileño ya se mide con MEG — entonces su puntaje entra como evidencia (M23) y 9004 no se corre en paralelo. Jamás dos escaleras sobre la misma dimensión: el número viaja con su escala declarada (D-32)) · M49 (primos de linaje (ambos con aparato de premio y peso en resultados): EFQM cuando el cliente pide RADAR/reconocimiento europeo · MEG cuando el cliente es brasileño. No se acumulan — se elige el que el cliente ya habla) · M41 (el par natural: el cliente Falconi/GPD es el mismo que suele tener historia FNQ — la cascada anual (M41) y la vara de madurez (MEG) son las dos mitades del dialecto brasileño de gestión) · M23 (el puntaje MEG del cliente es dato AS-IS con fuente y vigencia (qué ciclo, qué año): un puntaje de hace cuatro años se muestra con su fecha, jamás como el estado de hoy) · M16 (los fundamentos MEG cubren el mismo terreno que el QMS releva; el mapeo se declara donde exista, no se inventa equivalencia criterio por criterio)
- **Principios:** P3, P4

### Familia E · Especificación & Construcción


<a id="m18"></a>**M18 · Spec-Driven Development (SDD)**
- **Qué:** el spec/intent es la fuente de verdad; el código es la última milla
- **Fuente:** GitHub Spec Kit · Amazon Kiro · BMAD — Spec-Driven Development. [https://github.com/github/spec-kit](https://github.com/github/spec-kit)
- **Objeto:** O7 Contrato & Código · sec: O2
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el SPEC=CONTRATO — gates validan el código contra el spec en cada commit
- **Cuándo:** etapas 4–5 (contrato → construcción); núcleo del harness
- **Combina:** M19 (los criterios EARS pueblan el spec) · M20 (los ejemplos BDD prueban el spec)
- **Principios:** P6, P2

<a id="m19"></a>**M19 · EARS (Easy Approach to Requirements Syntax)**
- **Qué:** sintaxis de criterios atómicos testeables: WHEN [cond] THE SYSTEM SHALL [comportamiento]
- **Fuente:** Alistair Mavin / Rolls-Royce — EARS (2009). [https://alistairmavin.com/ears/](https://alistairmavin.com/ears/)
- **Objeto:** O7 Contrato & Código
- **Nivel:** 4 · Operativo (ancla)
- **Aporte único:** la SINTAXIS sin ambigüedad, directamente testeable (NASA/Airbus)
- **Cuándo:** etapa 4 — escribir criterios de aceptación
- **Combina:** M18 (puebla el contrato/spec) · M20 (EARS + ejemplo = criterio vivo)
- **Principios:** P6

<a id="m20"></a>**M20 · Specification by Example / BDD**
- **Qué:** ejemplos concretos acordados se vuelven pruebas de aceptación ejecutables
- **Fuente:** Gojko Adzic — Specification by Example (2011). [https://gojko.net/books/specification-by-example/](https://gojko.net/books/specification-by-example/)
- **Objeto:** O7 Contrato & Código
- **Nivel:** 4 · Operativo (ancla)
- **Aporte único:** los EJEMPLOS ejecutables — documentan y prueban a la vez
- **Cuándo:** etapas 4–5; complementa EARS
- **Combina:** M19 (ejemplos sobre los criterios EARS) · M18 (tests de aceptación del spec)
- **Principios:** P6

### Familia F · Valor, Costo & Alineación


<a id="m21"></a>**M21 · OKR (Objectives & Key Results)**
- **Qué:** objetivo cualitativo + key results medibles por trimestre
- **Fuente:** John Doerr; Christina Wodtke — Measure What Matters / Radical Focus. [https://www.whatmatters.com/](https://www.whatmatters.com/)
- **Objeto:** O2 Objetivo & Valor
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el KR TRIMESTRAL — el indicador a mover, target de etapa 0 y destino del roll-up
- **Cuándo:** encuadre (paso 1) + Hilo de Oro
- **Combina:** M15 (el KR baja del goals cascade) · M22 (el roll-up sube el aporte real al KR) · M06 (impact conecta KR ↔ deliverable) · M54 (el KR declara `ambicion` (operar|expandir|transformar) — colorea la cascada sin ceremonia nueva)
- **Principios:** P1, P2

<a id="m22"></a>**M22 · FinOps — Quantify Business Value**
- **Qué:** empareja gasto tecnológico con valor de negocio; unit economics; atribución. Y el otro lado de la misma moneda: la REALIZACIÓN — lo prometido se sigue hasta lo efectivamente cobrado, con fecha y con verificador
- **Fuente:** FinOps Foundation — Quantify Business Value. [https://www.finops.org/framework/domains/quantify-business-value/](https://www.finops.org/framework/domains/quantify-business-value/)
- **Objeto:** O2 Objetivo & Valor · sec: T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** el UNIT ECONOMICS — costo real + ahorro contrafactual (vs devs) + aporte por capability. Corolario cardinal (twin v18): toda promesa de valor lleva su contraparte COBRADA — una apuesta o un proyecto que declara beneficio y nunca lo rinde es exactamente el 'indicador sin ancla de valor' cometido en el nivel más alto. Lo cobrado lo escribe la fuente contable y lo verifica finanzas, JAMÁS quien prometió
- **Cuándo:** loop de valor (aceptación, paso 11) y cada sesión de revisión: prometido vs cobrado por apuesta y por proyecto cerrado
- **Combina:** M21 (el aporte sube al KR) · M06 (atribución por capability) · M48 (el unit economics interno gana su vara externa: ¿mi costo/desempeño es bueno vs pares?) · M04 (la apuesta declara el valor que persigue Y lo que lleva cobrado a la fecha: el ciclo por-sellar→sellada→cumplida sólo cierra en 'cumplida' con valor cobrado verificado) · M55 (el valor cobrado se escribe contra la fuente contable (cierre del periodo), no contra una planilla del área que prometió) · M42 (la auditoría de beneficios ~12 meses del proyecto formal es esta misma disciplina un nivel abajo — doble firma sponsor + finanzas)
- **Principios:** P1, P2

<a id="m26"></a>**M26 · Hoshin Kanri (Strategy Deployment)**
- **Qué:** traduce la visión a 3-5 años → breakthrough anual → prioridades → métricas, en cascada por niveles con catchball (ida y vuelta)
- **Fuente:** Yoji Akao (orígenes) · práctica Lean/Toyota — Hoshin Kanri — Policy Deployment (X-matrix · catchball). [https://blog.i-nexus.com/hoshin-kanri-x-matrix-explained](https://blog.i-nexus.com/hoshin-kanri-x-matrix-explained)
- **Objeto:** O2 Objetivo & Valor · sec: O4, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** la CASCADA estrategia→toda-la-org — baja las metas del directorio hasta el último peldaño, con acuerdo bidireccional (catchball)
- **Cuándo:** etapa 1 — alinear el TO-BE a los objetivos del directorio; plan a 3 años → slice anual → OKR trimestral
- **Combina:** M21 (Hoshin da la dirección multi-año; OKR ejecuta el trimestre dentro de ella) · M15 (comparte el goals cascade (empresa→IT)) · M30 (BSC traduce cada nivel a KPIs por perspectiva) · M54 (el plan 3a→anual fija la mezcla_objetivo (70/20/10 por industria); el catchball la negocia por nivel)
- **Principios:** P1, P2

<a id="m27"></a>**M27 · Wardley Mapping**
- **Qué:** mapea la cadena de valor contra la evolución de cada componente (génesis→custom→producto→commodity); situational awareness
- **Fuente:** Simon Wardley — Wardley Maps (value chain × evolución · CC-BY-SA). [https://www.wardleymaps.com/glossary/evolution-stages](https://www.wardleymaps.com/glossary/evolution-stages)
- **Objeto:** O5 Sistema & Capabilities · sec: O2, O6
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio
- **Aporte único:** la EVOLUCIÓN de cada componente en el tiempo → qué construir (génesis), qué comprar (producto), qué tercerizar (commodity)
- **Cuándo:** etapa 1 — el plan a 3 años; cómo la 'maquinaria' (procesos·sistemas) evoluciona según los objetivos
- **Combina:** M31 (el mapa de capacidades alimenta la cadena de valor) · M13 (ArchiMate da las capas; Wardley les pone evolución) · M15 (la madurez COBIT informa la posición evolutiva)
- **Principios:** P3, P2

<a id="m28"></a>**M28 · WSJF / Cost of Delay**
- **Qué:** priorización económica: costo de retraso (valor + criticidad-tiempo + reducción-riesgo) ÷ tamaño del trabajo
- **Fuente:** Don Reinertsen (Cost of Delay) · SAFe (WSJF) — Weighted Shortest Job First = CoD ÷ tamaño. [https://framework.scaledagile.com/wsjf](https://framework.scaledagile.com/wsjf)
- **Objeto:** O6 Gap & Madurez · sec: O1, O2
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico
- **Aporte único:** la PRIORIZACIÓN económica de los gaps — qué atacar primero por retorno/urgencia ÷ esfuerzo (vs orden por capricho)
- **Cuándo:** etapa 2 — priorizar los gaps detectados antes de pasarlos a discovery/delivery
- **Combina:** M22 (FinOps cuantifica el valor/ahorro que entra al CoD) · M04 (el appetite de Shape Up acota el tamaño del trabajo) · M06 (Impact Mapping da el valor de negocio del numerador) · M54 (WSJF ordena DENTRO de cada bolsa de ambición, jamás entre bolsas (si compiten en una sola cola, operar devora a transformar))
- **Principios:** P1

<a id="m30"></a>**M30 · Balanced Scorecard**
- **Qué:** traduce la estrategia a objetivos+métricas ligados en 4 perspectivas (financiera · cliente · procesos · aprendizaje), vía un strategy map
- **Fuente:** Robert Kaplan & David Norton — The Balanced Scorecard (HBR 1992 · libro 1996). [https://balancedscorecard.org/bsc-basics-overview/](https://balancedscorecard.org/bsc-basics-overview/)
- **Objeto:** O2 Objetivo & Valor · sec: T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** el STRATEGY MAP — liga aprendizaje→procesos→cliente→finanzas y cascada a unidades/personas (el 'por qué' detrás de cada KPI)
- **Cuándo:** etapa 1 — traducir la estrategia del directorio a KPIs por perspectiva; complementa OKR/Hoshin. **Es el marco reconocible en LATAM hispano** (escuelas de negocio, literatura regional) y **el estándar de facto del sector público brasileño** (mapas estratégicos institucionales exigidos en el poder judicial, control y ministerios) — el veredicto «Brasil = GPD» del research 00-research-latam-br aplica al sector PRIVADO; en gobierno brasileño manda el BSC (CK-33)
- **Combina:** M26 (Hoshin despliega la estrategia; BSC la mide por perspectiva) · M21 (los KR se anclan a los objetivos del scorecard) · M06 (Impact conecta objetivo→entregable) · M55 (la perspectiva financiera deja de ser un rótulo: sus objetivos se contrastan contra el resultado real y cerrado del periodo) · M41 (arbitraje de mercado (research 00-research-latam-br + CK-33): cliente brasileño PRIVADO habla GPD (cascada anual + PLR) · gobierno brasileño y LATAM hispano hablan BSC (mapa por perspectivas). Mismo hilo de oro, dos vocabularios: se elige el que el cliente ya usa, jamás los dos encima)
- **Principios:** P1, P2

<a id="m41"></a>**M41 · GPD — Gerenciamento pelas Diretrizes (Falconi)**
- **Qué:** desdobramento de metas anuales del directorio por nivel jerárquico ('meta sem valor e prazo não é meta') con giro PDCA por nivel y acople a remuneración variable (PLR)
- **Fuente:** Vicente Falconi Campos (FDG / Falconi) — Gerenciamento pelas Diretrizes — hoshin kanri adaptado a Brasil (TQC estilo japonés). [https://falconi.com/](https://falconi.com/)
- **Objeto:** O2 Objetivo & Valor · sec: O4
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico, 4 · Operativo
- **Aporte único:** el MODO BRASILEÑO de la cascada: mismo grafo que la cascada canónica con cadencia ANUAL + acople a compensación permitido — Falconi atiende 3 de cada 4 'Melhores e Maiores' (Ambev, Gerdau, Petrobras)
- **Cuándo:** cliente brasileño / config_estrategia.modo = gpd-anual o mixto (research 00-research-latam-br de la historia schema-v2)
- **Combina:** M26 (GPD ES hoshin adaptado — el mapa 3-5a→anual es el mismo) · M21 (convive con cadencia OKR en áreas digitales (modo mixto — el patrón corporativo BR real)) · M16 (el giro PDCA por nivel es el motor del desdobramento) · M30 (arbitraje de mercado (CK-33): GPD es el dialecto del privado brasileño; el BSC es el del gobierno brasileño y de LATAM hispano — mismo hilo, dos vocabularios) · M60 (la otra mitad del dialecto brasileño: GPD es la cascada, MEG es la vara de madurez — el cliente Falconi suele traer historia FNQ)
- **Principios:** P1, P2

<a id="m48"></a>**M48 · Benchmarking externo de procesos y funciones (APQC Open Standards · Hackett DWC)**
- **Qué:** contrasta el desempeño de cada proceso/función contra pares externos (costo, productividad, tiempo de ciclo, calidad); la clave de join es el ID del PCF (M12) que el twin ya usa para clasificar
- **Fuente:** APQC (Open Standards Benchmarking) · The Hackett Group (Digital World Class) — Métricas de costo/productividad/ciclo/calidad por proceso PCF + benchmark top-quartile de funciones (finanzas y soporte). [https://www.apqc.org/resource-library/resource-collection/finance-organization-key-benchmarks](https://www.apqc.org/resource-library/resource-collection/finance-organization-key-benchmarks)
- **Objeto:** O6 Gap & Madurez · sec: O3, O2
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** el AFUERA como vara — responde '¿mi número es bueno?' (¿78 días de cobranza es mucho?); sostiene la provenance conf:benchmark-sectorial que los nichos ya citan sin card que la respalde; Hackett DWC = fuente propietaria alternativa para finanzas (misma tesis, no card aparte)
- **Cuándo:** dimensionar brechas (¿cuánto peor que el peer?) y validar metas de KPI (¿el to-be es alcanzable?) — diagnóstico M1 y seguimiento M2
- **Combina:** M12 (la taxonomía PCF ya adoptada ES la clave del benchmark — acople de datos, no de metamodelo) · M22 (FinOps cuantifica el valor interno; el benchmark le pone el contraste externo) · M09 (los tiempos {toque, espera} del VSM se contrastan contra el ciclo del peer) · M28 (la distancia al peer alimenta el costo de retraso (CoD) de la priorización) · M23 (todo rango externo entra como dato con fuente+conf+frescura — sin fuente seria no se afirma (doctrina de nichos))
- **Principios:** P1, P3

<a id="m54"></a>**M54 · Portafolio de ambición 70/20/10 (matriz de ambición de innovación)**
- **Qué:** clasifica TODO esfuerzo (idea · proyecto_mejora · KR) en tres bolsas por NOVEDAD (mercado × oferta), jamás por plazo (Blank 2019): operar el hoy (core, ~70) · expandir a lo vecino (adyacente, ~20) · apostar al futuro (transformacional, ~10); mezcla real vs mezcla objetivo, visible por rol/área/unidad/empresa
- **Fuente:** Bansi Nagji & Geoff Tuff (Monitor/Deloitte); antecedentes: Baghai/Coley/White Tres Horizontes 1999 · March explore/exploit 1991 · Google (Schmidt) 2005; corrección: Blank 2019 — Managing Your Innovation Portfolio (HBR, mayo 2012) — Innovation Ambition Matrix. [https://hbr.org/2012/05/managing-your-innovation-portfolio](https://hbr.org/2012/05/managing-your-innovation-portfolio)
- **Objeto:** O2 Objetivo & Valor · sec: O7, O1
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** el COLOR del esfuerzo — campo `ambicion` transversal que el twin agrega al leer (rollup vs `mezcla_objetivo` de config_estrategia). El ratio NO es dogma: HBR lo midió por industria (industrial ≈70/20/10 · consumo masivo ≈80/18/2 · tech media ≈45/40/15) y el retorno es INVERSO (≈10/20/70 — el 10 transformacional genera ~70% del valor nuevo); ajustar por industria/etapa/posición competitiva
- **Cuándo:** al crear/triageár idea, proyecto_mejora o KR (m1: clasificar el portafolio hallado en el diagnóstico · m2/m3: mantener la mezcla visible y balanceada)
- **Combina:** M21 (cada KR declara su ambición — la cascada canónica se colorea sin ceremonia nueva) · M26 (el plan 3a→anual fija la mezcla_objetivo; el catchball la negocia por nivel) · M28 (WSJF prioriza DENTRO de cada bolsa, jamás entre bolsas (ambidestreza O'Reilly/Tushman: exploit devora a explore si comparten cola)) · M44 (cada idea del embudo se etiqueta en el triaje del comité — protege el flujo transformacional de morir contra lo urgente) · M45 (es el instrumento concreto del balance de portafolio que ISO 56002 exige en abstracto) · M52 (la mezcla ES apetito de riesgo materializado: transformar = riesgo aceptado explícito del directorio) · M57 (la mezcla en porcentaje es la intención; el presupuesto por bolsa es la misma decisión con plata y con saldo) · M61 (la mezcla reparte ENTRE bolsas; OBZ disciplina lo que pasa DENTRO de la bolsa de operar — donde el gasto heredado se esconde)
- **Principios:** P1, P2

<a id="m55"></a>**M55 · Reporte financiero como fuente — marco contable (NIIF / NIIF para PYMES) leído, jamás reexpresado**
- **Qué:** el marco de reporte que la empresa declara (NIIF plenas o NIIF para PYMES) fija QUÉ significan sus cifras, su ciclo de cierre (preliminar → cerrado → auditado) y qué se revela; el twin consume un puñado de esas cifras como dato con procedencia, con su estado de cierre a la vista
- **Fuente:** IASB (IFRS Foundation) — Marco Conceptual + NIIF/IFRS y NIIF para las PYMES — estados financieros, ciclo de cierre y revelaciones. [https://www.ifrs.org/issued-standards/list-of-standards/](https://www.ifrs.org/issued-standards/list-of-standards/)
- **Objeto:** O2 Objetivo & Valor · sec: T1, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico
- **Aporte único:** el PUENTE libro↔operación: cada cifra del reporte se ancla al proceso, área u objetivo que la produce, y las decisiones contables que dependen de la operación (reconocimiento de ingreso · deterioro de cobranza · valorización de lo que está a medio construir · contingencias · arrendamientos · partes relacionadas) quedan navegables al twin. Ningún sistema contable puede hacerlo: no conoce el proceso. Corolario duro: un avance de obra DECLARADO por encima del real infla lo construido en el libro — la brecha operativa ES un hallazgo de reporte
- **Cuándo:** encuadre del nivel directorio (m1) y cada sesión de revisión (m2): leer el resultado del periodo contra plan y contra el año anterior, con el estado de cierre declarado
- **Combina:** M22 (FinOps cuantifica el valor de UNA brecha o apuesta; el reporte financiero es el marcador consolidado contra el que ese valor se cobra — sin él, el beneficio queda declarado y nunca verificado) · M23 (el estado de cierre ES procedencia: una cifra preliminar se muestra preliminar y jamás se pinta como cerrada (misma regla que fuente/conf del AS-IS)) · M16 (cl.9.3 revisión por la dirección exige el desempeño del periodo como entrada — este es el dato que la alimenta) · M30 (la perspectiva financiera del strategy map deja de ser un rótulo: sus objetivos se contrastan contra el resultado real del periodo) · M59 (el valor ganado explica una parte del resultado antes de que el resultado la muestre — y el desvío avance-real vs declarado es el input de la valorización de la obra en curso)
- **Principios:** P1, P2

<a id="m56"></a>**M56 · Liquidez del directorio — proyección de caja a 13 semanas y límites del financiamiento**
- **Qué:** la proyección corta y rodante de entradas y salidas (13 semanas), contra un PISO de caja que la gobernanza firma, más los límites que impone quien presta (resguardos financieros / covenants) y la línea disponible
- **Fuente:** Práctica de tesorería corporativa y reestructuración (13-week cash flow) · ACT/AFP treasury guidance — Rolling 13-week cash flow forecast + covenant headroom monitoring. [https://www.treasurers.org/hub/treasurer-magazine/13-week-cash-flow-forecasting-basics](https://www.treasurers.org/hub/treasurer-magazine/13-week-cash-flow-forecasting-basics)
- **Objeto:** O2 Objetivo & Valor · sec: O6, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico
- **Aporte único:** separa SOLVENCIA de RESULTADO: una empresa con margen puede quedarse sin caja, y el directorio lo ve semanas antes si mira la proyección y no el estado de resultados. El piso de caja es una vara del mismo tipo que el apetito de riesgo (la firma la gobernanza, no la gerencia), y romper un resguardo puede obligar a pagar la deuda por adelantado — por eso se mira ANTES de aprobar más inversión o más deuda
- **Cuándo:** encuadre del nivel directorio (m1) y cada sesión (m2); obligatorio cuando el diagnóstico revela tensión de cobranza, obra en curso o deuda con resguardos
- **Combina:** M55 (la caja al cierre es una cifra del reporte; la proyección es lo que el reporte NO dice — hacia adelante, semana a semana) · M52 (el piso de caja es apetito de riesgo de liquidez hecho número: misma mecánica (la gobernanza fija la vara, el dato se contrasta contra ella)) · M23 (la proyección declara QUIÉN la firma; si el puesto que la firmaría está vacante, la confianza baja y se muestra — jamás se maquilla) · M28 (cruzar el piso es un costo de esperar con fecha: ordena qué se ataca primero cuando el dinero es la restricción)
- **Principios:** P1, P3

<a id="m57"></a>**M57 · Presupuesto y control presupuestario — la mezcla de ambición hecha plata**
- **Qué:** el reparto anual del dinero en bolsas, el seguimiento de lo COMPROMETIDO contra lo ASIGNADO, y la variación contra plan como lente primaria de la revisión (no el valor absoluto)
- **Fuente:** Práctica de planeamiento y control de gestión (budgeting & control) · CIMA/IMA management accounting — Presupuesto anual, compromiso y ejecución; análisis de variación contra plan. [https://www.cimaglobal.com/Research--Insight/Budgeting-and-forecasting/](https://www.cimaglobal.com/Research--Insight/Budgeting-and-forecasting/)
- **Objeto:** O2 Objetivo & Valor · sec: O7, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** vuelve EXIGIBLE la mezcla de ambición: 70/20/10 en porcentaje es una intención; con presupuesto por bolsa es una decisión con firma y con saldo. Y separa asignado de comprometido — el futuro se compra cuando el dinero se compromete, no cuando se declara la intención
- **Cuándo:** encuadre anual del directorio (m1) y su seguimiento en cada sesión (m2); al aprobar cualquier apuesta o proyecto que consuma bolsa
- **Combina:** M54 (la mezcla de ambición dice el reparto en porcentaje; el presupuesto lo dice en dinero — misma bolsa, dos unidades. La prioridad se ordena DENTRO de la bolsa, jamás entre bolsas) · M04 (el tope de la apuesta (appetite Shape Up) consume bolsa: sellar una apuesta sin bolsa disponible es una decisión, no un trámite) · M22 (el caso de valor de cada brecha se paga contra una bolsa; el retorno prometido se coteja contra lo efectivamente comprometido) · M58 (el presupuesto se APRUEBA en la sesión de directorio y las facultades por monto dicen qué gasto vuelve a subir a ese nivel) · M55 (la ejecución real del presupuesto se cierra contra el gasto del reporte financiero, no contra una planilla paralela) · M61 (división cardinal: M57 guarda el reparto y su compromiso; OBZ es CÓMO se arma (desde cero, por paquete con dueño) en vez de heredarlo. Un solo presupuesto en el twin — OBZ es método de construcción, no una segunda bolsa)
- **Principios:** P1, P2

<a id="m59"></a>**M59 · Valor ganado (EVM) — el portafolio de inversiones**
- **Qué:** compara el avance REAL de una inversión con lo GASTADO y con lo comprometido, en una sola fila comparable entre inversiones: avance real (no el declarado) · gastado contra presupuesto · ya comprometido contra la meta · fecha de entrega proyectada contra la comprometida · margen proyectado contra plan
- **Fuente:** PMI · ANSI/EIA-748 — Earned Value Management — valor planificado, valor ganado y costo real; índices de desempeño de costo y cronograma. [https://www.pmi.org/learning/library/earned-value-management-systems-analysis-8026](https://www.pmi.org/learning/library/earned-value-management-systems-analysis-8026)
- **Objeto:** O2 Objetivo & Valor · sec: O6, O3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico
- **Aporte único:** hace visible el sobrecosto ANTES de que aparezca en el resultado, porque compara gasto contra avance FÍSICO y no contra calendario. El desvío entre avance declarado y avance real es el dato de mayor consecuencia del twin: gobierna la entrega, el margen del proyecto y la valorización de lo que está a medio construir en el libro contable. La inversión de capital NO es un proyecto de mejora: se gobierna como portafolio propio
- **Cuándo:** cliente con inversiones grandes en curso (m1 para levantarlas, m2 para seguirlas en cada sesión)
- **Combina:** M55 (el desvío avance real vs declarado es el input de cómo se valoriza lo construido en curso — la brecha operativa se vuelve hallazgo de reporte) · M57 (cada inversión consume presupuesto: el pedido de más presupuesto sube al directorio por umbral de facultad) · M50 (P3M3 gradúa la CAPACIDAD de sostener un portafolio; el valor ganado mide el desempeño de las inversiones concretas de ese portafolio) · M42 (distinción cardinal: el proyecto de MEJORA cierra con un indicador movido (DMAIC/PDCA); la INVERSIÓN cierra con un activo entregado y su margen — dos ciclos, dos varas) · M23 (avance declarado y avance real se guardan SEPARADOS, cada uno con su fuente: fundirlos borra exactamente el hallazgo)
- **Principios:** P1, P3

<a id="m61"></a>**M61 · OBZ — Orçamento Base Zero (presupuesto reconstruido, paquete con dueño)**
- **Qué:** construye el presupuesto desde cero cada ciclo en vez de heredar la base histórica: el gasto se agrupa en paquetes, cada paquete tiene un dueño nombrado que lo justifica línea por línea, y se compara entre pares antes de asignar
- **Fuente:** Zero-Based Budgeting (Peter Pyhrr, Texas Instruments 1970) · práctica brasileña difundida por AmBev/3G Capital y consultoras de gestión — Orçamento Base Zero — pacotes de gasto con dono, matriz de gasto y meta de redução reconstruida cada ciclo. [https://hbr.org/2017/03/how-3g-capital-uses-zero-based-budgeting](https://hbr.org/2017/03/how-3g-capital-uses-zero-based-budgeting)
- **Objeto:** O2 Objetivo & Valor · sec: O7, T3
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico
- **Aporte único:** ataca la HERENCIA del presupuesto: lo que M57 guarda como reparto, OBZ dice cómo se ARMÓ — sin base histórica + inflación. Su aporte real no es la planilla sino el DUEÑO del paquete: convierte el gasto en algo que alguien defiende con nombre propio, que es exactamente el hueco por el que un presupuesto heredado nunca se discute
- **Cuándo:** gateado por demanda: cliente con cultura de costos (brasileño 3G/Falconi, o cualquiera que declare meta de reducción de gasto) o diagnóstico que revela gasto heredado sin dueño; encuadre anual (m1) y su defensa en cada sesión (m2)
- **Combina:** M57 (división cardinal: M57 guarda el reparto y su compromiso (asignado vs comprometido); OBZ es CÓMO se arma ese reparto — desde cero, por paquete con dueño, en vez de heredarlo. Un solo presupuesto en el twin: OBZ es el método de construcción, no una segunda bolsa) · M54 (la mezcla de ambición fija el reparto entre bolsas; OBZ disciplina lo que pasa DENTRO de la bolsa de operar (el 70) — que es donde el gasto heredado se esconde) · M58 (cada paquete necesita un dueño con autoridad real: el dueño se lee del RACI y de las facultades por monto, no se declara en una planilla aparte) · M55 (la meta de reducción se cierra contra el gasto del reporte financiero, jamás contra la planilla que la prometió) · M25 (dueño de paquete = A del RACI sobre ese gasto: si el paquete no tiene dueño nombrado, el twin lo muestra SIN DUEÑO (que es el hallazgo, no un campo vacío))
- **Principios:** P1, P2

### Familia G · IA: Grounding & Anti-alucinación


<a id="m23"></a>**M23 · Grounding / RAG + Provenance**
- **Qué:** funda las salidas del LLM en fuentes reales (RAG, citas, juez en runtime)
- **Fuente:** investigación 2026 (Braintrust) — Grounding / RAG + Provenance. [https://www.braintrust.dev/articles/best-hallucination-detection-tools-2026](https://www.braintrust.dev/articles/best-hallucination-detection-tools-2026)
- **Objeto:** T1 Dato / Grounding
- **Nivel:** 4 · Operativo (ancla) · también: 1 · Directorio, 2 · Estratégico, 3 · Táctico
- **Aporte único:** FUENTE + CONFIANZA + FRESCURA por dato — el grounding anula lo que lo contradiga
- **Cuándo:** todo el AS-IS (paso 2) y como regla transversal
- **Combina:** M14 (el drift código↔docs es una señal de confianza) · M40 (gemela transversal: provenance del dato ↔ gobernanza del dato de persona)
- **Principios:** P5

### Familia H · Diseño de Servicio & Experiencia


<a id="m24"></a>**M24 · This Is Service Design Doing (TiSDD)**
- **Qué:** manual práctico del service design; toolkit personas/journey/stakeholder/blueprint
- **Fuente:** Stickdorn, Hormess, Lawrence, Schneider — This Is Service Design Doing (O'Reilly 2018). [https://www.thisisservicedesigndoing.com/](https://www.thisisservicedesigndoing.com/)
- **Objeto:** T2 Experiencia / Servicio · sec: O3, O4
- **Nivel:** 3 · Táctico (ancla) · también: 2 · Estratégico, 4 · Operativo
- **Aporte único:** el TOOLKIT que revela qué pantallas existen, quién las usa y qué procesos las sostienen
- **Cuándo:** productizar cada etapa (interfaces frontend + actores + experiencia del sponsor)
- **Combina:** M10 (extiende el service blueprint a frontstage/backstage) · M05 (el job ancla persona y journey) · M25 (el stakeholder map se cruza con RACI)
- **Principios:** P3, P4, P1

### Familia I · Twin & automatización del trabajo


<a id="m32"></a>**M32 · Doctrina de ontología Palantir (semántica + kinética)**
- **Qué:** la GRAMÁTICA del objeto.schema: semántica (entidades + relaciones) + kinética (acciones/cambio) + provenance structs + principio open/closed (extensible sin fork)
- **Fuente:** Palantir — Foundry Ontology — best practices (adoptada CK-21). [https://www.palantir.com/docs/foundry/ontology/](https://www.palantir.com/docs/foundry/ontology/)
- **Objeto:** O7 Contrato & Código · sec: T1
- **Nivel:** 2 · Estratégico (ancla) · también: 1 · Directorio, 3 · Táctico, 4 · Operativo
- **Aporte único:** el METAMODELO PROPIO as-code en git — entidad-primero (no notation-first), con provenance y extensión por cliente como propiedades de la gramática
- **Cuándo:** siempre — es la gramática de las 21 entidades del twin (CK-26 + `apuesta` D-23 + el gobierno del directorio D-24..D-29 + el archivo `documento` D-38; +`puesto`/`arnes` al materializar D-19/D-20 · CK-30); toda evolución del schema la respeta
- **Combina:** M23 (los provenance structs (fuente+conf) son parte de la gramática) · M13 (ArchiMate presta tipos como vocabulario DENTRO del metamodelo propio) · M46 (el arnés entra a la gramática como entidad REGISTRO (procedencia+versión+drift), jamás como contenido)
- **Principios:** P4, P5

<a id="m33"></a>**M33 · DEMO / Enterprise Ontology (Dietz)**
- **Qué:** base formal de la organización como red de transacciones comunicativas (actor → coordinación → producción)
- **Fuente:** Jan Dietz — Enterprise Ontology — the DEMO methodology. [https://ee-institute.org/](https://ee-institute.org/)
- **Objeto:** O3 Proceso · sec: O4
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** la BASE FORMAL de transacciones — si algún día formalizamos la ontología comunicativa del twin
- **Cuándo:** todavía no — horizonte D9; se activa solo con la decisión de formalizar transacciones
- **Combina:** M07 (los eventos del storming son la semilla informal de sus transacciones) · M34 (una base formal haría simulable/verificable el modelo (BPSim))
- **Principios:** P4

<a id="m34"></a>**M34 · BPSim (Business Process Simulation)**
- **Qué:** parametriza modelos BPMN para simulación (tiempos, recursos, colas, escenarios what-if)
- **Fuente:** WfMC / OMG — BPSim — Business Process Simulation Interchange. [https://www.bpsim.org/](https://www.bpsim.org/)
- **Objeto:** O3 Proceso · sec: O6
- **Nivel:** 3 · Táctico (ancla) · también: 4 · Operativo
- **Aporte único:** el WHAT-IF estándar sobre el proceso — simular el TO-BE antes de construirlo, sin inventar formato propio
- **Cuándo:** todavía no — horizonte D9; requiere twin base + datos de operación + demanda real
- **Combina:** M11 (parametriza el modelo BPMN-lite ya existente) · M29 (los parámetros (tiempos/volúmenes) salen del mining, no de estimaciones)
- **Principios:** P3, P4

<a id="m35"></a>**M35 · ECRS (Eliminar · Combinar · Reordenar · Simplificar)**
- **Qué:** el ORDEN del triage por actividad: Eliminar → Combinar → Reordenar → Simplificar, ANTES de cualquier automatización
- **Fuente:** ingeniería de métodos clásica (Barnes) — Motion and Time Study — cuestionario ECRS. [https://en.wikipedia.org/wiki/Methods_engineering](https://en.wikipedia.org/wiki/Methods_engineering)
- **Objeto:** O3 Proceso · sec: O6
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el ORDEN — no se automatiza el desperdicio: primero eliminar/combinar/reordenar/simplificar, recién después puntuar automatización
- **Cuándo:** triage de actividades (diagnóstico M1 y mejora M3), antes de correr los scores
- **Combina:** M09 (VSM revela el flujo/desperdicio; ECRS ordena el veredicto por actividad) · M36 (lo que sobrevive a ECRS recién se puntúa (RPA/agente)) · M29 (la evidencia minada sostiene el 'eliminar' con datos)
- **Principios:** P1, P3

<a id="m36"></a>**M36 · Criterios de automatizabilidad — RPA + agente-LLM (dos scores)**
- **Qué:** DOS scores DERIVADOS por actividad: score-RPA = f(datos estructurados, reglas estables, volumen, %excepciones) · score-agente = f(dato no estructurado, criterio expresable en prompt/policy, tolerancia a revisión humana, riesgo de error). Derivación MATERIALIZADA as-code: sistema/schema/triage.yaml (D-18 — pesos con provenance conf:baja, calibrables con M29)
- **Fuente:** Lacity & Willcocks (criterios RPA) · práctica agéntica 2025-26 · propia (scores) — RPA suitability + criterios agente-LLM — dos scores derivados (spec CK-21). [https://en.wikipedia.org/wiki/Robotic_process_automation](https://en.wikipedia.org/wiki/Robotic_process_automation)
- **Objeto:** O3 Proceso · sec: O6, O4
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** los DOS SCORES con conf propagada + el VEREDICTO enum (eliminable · automatizable-RPA · automatizable-agente · aumentable · humano-por-diseño) — se calculan, jamás se etiquetan a mano
- **Cuándo:** triage de actividades tras ECRS: puntuar candidatos y emitir veredicto con incertidumbre visible
- **Combina:** M37 (la clase ALM×MGI del verbo es input de ambos scores) · M29 (mining alimenta volumen/%excepciones con evidencia observada) · M35 (solo se puntúa lo que sobrevivió al orden ECRS) · M25 (humano-por-diseño ancla a accountability (RACI A, firma, responsabilidad legal)) · M46 (el veredicto es el CANDIDATO a skill del arnés: automatizable-*/aumentable entran, humano-por-diseño queda como gate)
- **Principios:** P3, P5, P7

<a id="m37"></a>**M37 · Taxonomía de verbos & automatizabilidad (propia, ALM×MGI)**
- **Qué:** vocabulario controlado: cada actividad narra con UN verbo canónico (+ sinónimos es-419); cada verbo clasifica en 2 ejes — clase de tarea ALM (rutinaria/no-rutinaria × manual/cognitiva-analítica/interpersonal) × capacidad requerida MGI (recolectar/procesar datos · físico predecible/impredecible · interfaz-stakeholder · experticia/decisión · gestión de personas)
- **Fuente:** propia (Cockpit) · marcos: Autor-Levy-Murnane (2003) + McKinsey Global Institute — Vocabulario controlado de verbos — clase ALM × capacidad MGI (supersede cand. Bloom). [https://doi.org/10.1162/003355303322552801](https://doi.org/10.1162/003355303322552801)
- **Objeto:** O3 Proceso · sec: O4, T1
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el ESTÁNDAR PROPIO que vuelve comparable la narrativa: 1 verbo = 1 actividad (los compuestos se PARTEN en el ingest), verbo con provenance (el ingest propone con conf, el consultor corrige, auditado)
- **Cuándo:** narrativa de actividades y de sus tareas (D-17: tareas[] = APQC L5, mismo vocabulario) — levantamiento y mantenimiento
- **Combina:** M36 (la clase ALM×MGI alimenta los dos scores) · M23 (el verbo lleva conf del ingest — sin provenance el score es gameable eligiendo verbos 'suaves') · M35 (la narrativa normalizada es lo que ECRS ordena) · M46 (el verbo canónico es la unidad narrativa que se compila a procedimiento; su clase ALM×MGI informa la autonomía sugerida)
- **Principios:** P4, P5

<a id="m39"></a>**M39 · NASA-TLX / RTLX (carga cognitiva medida)**
- **Qué:** instrumento de carga de trabajo percibida en 6 escalas; RTLX = promedio simple sin comparaciones pareadas
- **Fuente:** Sandra Hart & Lowell Staveland (NASA Ames) — NASA Task Load Index — variante RTLX (sin comparaciones pareadas). [https://humansystems.arc.nasa.gov/groups/tlx/](https://humansystems.arc.nasa.gov/groups/tlx/)
- **Objeto:** O4 Personas & Autoridad · sec: O3
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el DESGASTE MEDIDO con humanos (no estimado) — dónde la carga cognitiva justifica aumentar o rediseñar antes que exprimir
- **Cuándo:** SOLO actividades pre-flageadas por el triage (densidad de espera/decisión, %excepciones alto, queja espontánea en entrevista) — jamás censal
- **Combina:** M36 (el triage pre-flagea qué actividades medir (gatillo explícito)) · M40 (el resultado se agrega por rol/proceso — jamás registro individual)
- **Principios:** P3, P5

<a id="m40"></a>**M40 · Métricas de persona — frontera twin ↔ individuo (CK-24)**
- **Qué:** gobernanza de toda métrica que toque personas: el twin mide roles/procesos/áreas por defecto; la vista persona-nombrada existe SOLO con opt-in de nivel Gobernanza + consentimiento declarado
- **Fuente:** propia (Cockpit, CK-24) · marco: GDPR art.22 / AI Act — Frontera twin ↔ evaluación individual — agregación mínima · acceso por nivel · consentimiento · retención. [https://gdpr-info.eu/art-22-gdpr/](https://gdpr-info.eu/art-22-gdpr/)
- **Objeto:** O4 Personas & Autoridad · sec: T1, T3
- **Nivel:** 1 · Directorio (ancla) · también: 2 · Estratégico, 3 · Táctico, 4 · Operativo
- **Aporte único:** la FRONTERA — gemela transversal de M23: como todo dato lleva fuente+conf, toda métrica de persona lleva agregación mínima + acceso por nivel + consentimiento + retención
- **Cuándo:** transversal — cada vez que un indicador, score o medición pueda atribuirse a una persona nombrada
- **Combina:** M23 (gemela transversal: provenance del dato ↔ gobernanza del dato de persona) · M39 (TLX/desgaste se agrega por rol/proceso bajo esta frontera) · M25 (el acceso sigue los niveles (Gobernanza > Estratégico > Táctico > Operativo)) · M46 (la frontera cae entre ENSAMBLAR el arnés (por puesto, dato del twin) y CORRERLO (por persona): el uso se agrega por rol antes de volver)
- **Principios:** P7, P5

<a id="m46"></a>**M46 · Arnés por rol×proceso — el trabajo compilado del twin**
- **Qué:** el paquete ejecutable (skills · subagentes · hooks · permisos · sandbox) que opera UN rol dentro de UN proceso, GENERADO del twin y jamás editado a mano. Tres unidades distintas: se COMPILA por rol×proceso (1 plugin; sus skills = los procedimientos de ese rol) · se ENSAMBLA por puesto (roster de N arneses con versión y canal — el puesto ejecuta N roles) · se INSTALA y CORRE por persona (su runtime, su licencia, su telemetría). Lleva su rebanada del hilo de oro (a qué KPI apunta), sus guardrails (por dónde no ir, con MECANISMO declarado) y punteros al conocimiento (dónde buscar)
- **Fuente:** propia (Cockpit, CK-30) · marcos: Agent Skills (estándar abierto, Anthropic) · CSA Agentic AI Autonomy Levels L0-L5 · Elish (moral crumple zones) · Green (flaws of human oversight) — El arnés como vista COMPILADA del twin — unidad rol×proceso, ensamblaje por puesto, corrida por persona; autonomía derivada del riesgo y supervisión especificada y medida. [https://agentskills.io/specification](https://agentskills.io/specification)
- **Objeto:** O4 Personas & Autoridad · sec: O3, O7, T3
- **Nivel:** 4 · Operativo (ancla) · también: 3 · Táctico
- **Aporte único:** el ANCLAJE `deriva_de{puesto, rol, proceso}` + `hash_fuente` con gate anti-drift: el arnés no puede divergir del modelo porque el gate rechaza el commit. Ningún registro de agentes del mercado (Workday ASOR · SAP LeanIX AI Agent Hub · CSA Agent Registry v1) apunta al elemento organizacional que justifica al agente — todos tienen dueño humano, ninguno tiene procedencia. Y la SUPERVISIÓN se especifica y se mide (qué verificar · con qué evidencia · en cuánto tiempo), no se declara: supervisión declarada = zona de deformación moral (Elish/Green)
- **Cuándo:** al compilar, versionar o auditar el trabajo de un puesto; al decidir la granularidad de un skill (actividad hoy, tarea con id); al fijar autonomía y puertas de aprobación de un agente que opera en nombre de un trabajador
- **Combina:** M25 (la A del RACI define quién supervisa y qué gates humanos existen dentro del arnés; C/I = contexto de lectura, NO generan skills) · M36 (el veredicto del triage es el CANDIDATO a skill: automatizable-* / aumentable entran al arnés, humano-por-diseño se queda como gate del supervisor) · M37 (el verbo canónico es la unidad narrativa que se compila a procedimiento; su clase ALM×MGI informa la autonomía sugerida) · M40 (la frontera CK-24 cae entre ENSAMBLAR (por puesto, dato del twin) y CORRER (por persona): la telemetría de uso se agrega por rol antes de volver al twin) · M32 (el arnés entra al metamodelo como entidad REGISTRO (procedencia + versión + drift), no como contenido — el contenido lo compila la fábrica) · M38 (la instrucción de trabajo (ISO 10013 n3) es la fuente humana del mismo procedimiento que el skill ejecuta: un origen, dos salidas)
- **Principios:** P7, P5, P4
<!-- /GEN:cards -->

---

## 5. Notaciones del twin

El rol de cada estándar en el **Organization Twin** — por dimensión: qué estándar, en qué rol
(metamodelo-propio · ancla · proyección · intercambio · horizonte · descartada · fuera-del-twin),
cuándo sí, cuándo no y cuándo hacemos estándar propio — vive como dato en el bloque `twin:` de cada
M-card ([`methodologies.yaml`](methodologies.yaml)) y se lee en la vista canónica generada
**[`NOTACIONES.html`](NOTACIONES.html)** (regla cardinal + matriz por dimensión + triage
eliminar/automatizar/aumentar + descartados con porqué). No se duplica la matriz aquí: editar el
YAML, regenerar con `gen_metodo.py` (gate anti-drift en pre-commit).

---

## 6. Mapa metodología → dónde se usa

<!-- GEN:tabla -->
| Metodología | M1 Levant. | M2 Mant. | M3 Mejora | Capa de contexto |
|---|:-:|:-:|:-:|:-:|
| Dual Track Agile (M01) |  |  | ● |  |
| Continuous Discovery (M02) | ● |  | ● |  |
| Product Operating Model (M03) |  |  | ● |  |
| Shape Up (M04) |  | ● | ● |  |
| Jobs-to-be-Done (M05) | ● |  | ● |  |
| Impact Mapping (M06) | ● |  | ● | ● |
| Event Storming (M07) | ● |  | ● | ● |
| Domain-Driven Design (M08) | ● |  | ● | ● |
| Value Stream Mapping (M09) | ● | ● |  | ● |
| Service Blueprint (M10) | ● |  |  | ● |
| BPMN (M11) | ● | ● |  | ● |
| APQC Process Classification Framework (M12) | ● | ● |  | ● |
| ArchiMate (M13) | ● | ● |  | ● |
| SYSTEM-MAP + document-project (M14) | ● | ● | ● | ● |
| COBIT 2019 (M15) | ● |  |  | ● |
| ISO 9001 (M16) | ● | ● | ● | ● |
| ITIL 4 (M17) | ○ | ○ |  |  |
| Spec-Driven Development (M18) |  |  | ● |  |
| EARS (M19) |  |  | ● |  |
| Specification by Example (M20) |  |  | ● |  |
| OKR (M21) | ● | ● | ● | ● |
| FinOps — Quantify Business Value (M22) |  | ● | ● | ● |
| Grounding (M23) | ● | ● | ● | ● |
| This Is Service Design Doing (M24) | ● |  | ● |  |
| RACI (M25) | ● | ● | ● | ● |
| Hoshin Kanri (M26) | ● |  |  | ● |
| Wardley Mapping (M27) | ● | ● |  | ● |
| WSJF (M28) |  |  | ● |  |
| Process / Task Mining (M29) | ● | ● | ● | ● |
| Balanced Scorecard (M30) | ● | ● |  | ● |
| Business Capability Modeling (M31) | ● |  |  | ● |
| Ontología Palantir (M32) | ● | ● | ● | ● |
| DEMO (M33) |  |  |  |  |
| BPSim (M34) |  |  |  |  |
| ECRS (M35) | ● |  | ● | ● |
| Criterios RPA + agente (M36) | ● |  | ● | ● |
| Taxonomía de verbos (M37) | ● | ● |  | ● |
| ISO 10013 (M38) | ● | ● |  | ● |
| NASA-TLX (M39) | ○ |  |  | ○ |
| Métricas de persona (M40) | ● | ● | ● | ● |
| GPD (Falconi) (M41) | ○ | ○ |  | ○ |
| DMAIC (M42) |  |  | ○ | ○ |
| MASP (M43) |  |  | ○ | ○ |
| Embudo de ideas (M44) |  | ○ | ○ | ○ |
| ISO 56002 (M45) |  |  | ○ |  |
| Arnés por rol×proceso (M46) |  | ● | ● | ● |
| ISO 9004 (madurez) (M47) | ● | ● |  | ● |
| Benchmarks APQC/Hackett (M48) | ● | ● |  | ● |
| EFQM RADAR (M49) | ○ |  |  |  |
| P3M3 (M50) |  |  |  |  |
| ISO 10015 (competencia) (M51) | ● | ● |  | ● |
| ISO 31000 (apetito) (M52) | ● | ● |  | ● |
| ISO 8000-61 (datos) (M53) | ○ |  |  |  |
| Ambición 70/20/10 (M54) | ● | ● | ● | ● |
| Reporte financiero (fuente) (M55) | ● | ● |  | ● |
| Liquidez (caja 13 semanas) (M56) | ● | ● |  | ● |
| Presupuesto (asignado vs comprometido) (M57) | ● | ● |  | ● |
| Sesión de directorio (acuerdos y acta) (M58) | ● | ● |  | ● |
| Valor ganado (inversiones) (M59) | ○ | ○ |  |  |
| MEG (FNQ · Brasil) (M60) | ○ |  |  |  |
| OBZ (base cero) (M61) | ○ | ○ |  |  |
<!-- /GEN:tabla -->

---

## Fuentes

Todos los links están en cada ficha (§4). Sitios oficiales de referencia rápida:
Dual Track · [Product Talk (Torres)](https://www.producttalk.org/) · [SVPG (Cagan)](https://www.svpg.com/) ·
[Shape Up (Basecamp)](https://basecamp.com/shapeup) · [Impact Mapping](https://www.impactmapping.org/) ·
[Event Storming](https://www.eventstorming.com/) · [DDD (domainlanguage)](https://www.domainlanguage.com/) ·
[Lean.org (VSM)](https://www.lean.org/) · [NN/g (Service Blueprint)](https://www.nngroup.com/articles/service-blueprints-definition/) ·
[BPMN/OMG](https://www.bpmn.org/) · [APQC](https://www.apqc.org/process-frameworks) ·
[The Open Group (ArchiMate/TOGAF)](https://www.opengroup.org/) · [ISACA (COBIT)](https://www.isaca.org/resources/cobit) ·
[ISO 9001](https://www.iso.org/iso-9001-quality-management.html) · [PeopleCert (ITIL)](https://www.peoplecert.org/) ·
[GitHub Spec Kit](https://github.com/github/spec-kit) · [Kiro](https://kiro.dev/) · [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) ·
[EARS (Mavin)](https://alistairmavin.com/ears/) · [What Matters (OKR)](https://www.whatmatters.com/) ·
[FinOps Foundation](https://www.finops.org/framework/domains/quantify-business-value/)
