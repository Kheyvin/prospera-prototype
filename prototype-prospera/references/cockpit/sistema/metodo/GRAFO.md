<!-- GENERADO por sistema/metodo/gen_metodo.py desde methodologies.yaml + proceso/** + nichos/*.yaml — NO editar a mano. Gate anti-drift en pre-commit. -->
# GRAFO — índice-grafo del cerebro metodológico (GENERADO)

Mapa de acceso de bajo costo al método del producto. Protocolo (skill `metodo`):
**(1)** leé este archivo (es el mapa completo, ~95 líneas de datos) →
**(2)** elegí los nodos por `usar:`/objeto/twin → **(3)** cargá SOLO esos nodos con grep+Read dirigido.
Jamás cargues `methodologies.yaml` o `METODOLOGIA.md` enteros.

Recetas (desde la raíz del repo):
- Card completa (~24 líneas): `grep -n "^M30:" sistema/metodo/methodologies.yaml` → `Read offset=<línea> limit=26`
- Paso completo: ruta = id con puntos→carpetas: `m1.b1.p1` → `sistema/metodo/proceso/m1/b1/p1.md`
- Unidad de nicho (~12 líneas): `grep -n "^N-RET-05:" sistema/metodo/nichos/retail.yaml` → `Read offset limit=14`
- Dónde se usa una card: §2 de este archivo (ya resuelto — no grepear a mano)
- Narrativas largas (solo si hace falta prosa): `M1-LEVANTAMIENTO.md` · `M3-ESPINAZO.md` · `PROCESS-AS-DATA.md`
- Agregar/reemplazar conocimiento: skill `metodo-aprende` (protocolo anti-contradicción)

Totales: **61 M-cards** (_meta.total) · **12 pasos** poblados / **8 etapas stub** · **19 unidades** de nicho en **3 verticales**.
Leyenda card: `Mnn nombre · objeto(+sec) · niv:ancla(+otros pisos) · modo·módulos · rol_twin[dimensiones] · ⇄combina_con · usar:`
`niv:` = eje nivel (§6) — **D**irectorio · **E**stratégico · **T**áctico · **O**perativo; el primero es el ancla.

## §1 M-cards por familia

### A · Descubrimiento & Producto
- **M01** Dual Track Agile · O1+O7 · niv:T+O · columna·m3 · fuera-del-twin · ⇄M02,M18 · usar: decidir el límite entre exploración y construcción
- **M02** Continuous Discovery / Opportunity Solution Tree (OST) · O1+O2 · niv:E+T · columna·m1,m3 · fuera-del-twin · ⇄M05,M06 · usar: etapa 1 — exploración de valor; artefacto central del cockpit
- **M03** Product Operating Model · T3+O1 · niv:E+D,T · paraguas·m3 · fuera-del-twin · ⇄M02,M04 · usar: encuadre del modus operandi de M3
- **M04** Shape Up · O1+O6 · niv:D+E,T · columna·m2,m3 · ancla[estrategia] · ⇄M02,M21,M22,M52,M54 · usar: etapa 0/3 — apostar y dar forma al pitch
- **M05** Jobs-to-be-Done (JTBD) · O1+T2,O2 · niv:E+T · columna·m1,m3 · fuera-del-twin · ⇄M02,M24 · usar: etapa 1, junto al OST, para anclar la oportunidad
- **M06** Impact Mapping · O2+O1 · niv:E+T · columna·m1,m3·ctx · fuera-del-twin · ⇄M21,M15,M22 · usar: Hilo de Oro; etapa 1; loop de valor

### B · Dominio & Proceso
- **M07** Event Storming · O3+O5 · niv:T+O · columna·m1,m3·ctx · ancla[procesos-flujo] · ⇄M08,M09 · usar: AS-IS de procesos (paso 4) y descomposición (etapa 3)
- **M08** Domain-Driven Design (DDD) · O5+O3 · niv:T+O · columna·m1,m3·ctx · ancla[vocabulario-arquitectura] · ⇄M07,M13 · usar: etapa 3; arquitectura de sistemas
- **M09** Value Stream Mapping (VSM) · O3+O6 · niv:T+O · columna·m1,m2·ctx · ancla[procesos-flujo,triage-automatizacion] · ⇄M10,M07,M35 · usar: AS-IS de procesos y modelado de future-state (etapa 3)
- **M10** Service Blueprint · O3+T2 · niv:T+O · columna·m1·ctx · ancla[procesos-flujo] · ⇄M09,M24 · usar: AS-IS de procesos (paso 4)
- **M11** BPMN · O3 · niv:O+T · columna·m1,m2·ctx · ancla[procesos-flujo] · ⇄M07,M09 · usar: documentación de procesos (M1/M2); opcional sobre Event Storming/VSM
- **M12** APQC Process Classification Framework (PCF) · O3 · niv:T+E,O · columna·m1,m2·ctx · ancla[procesos-clasificacion] · ⇄M07,M10,M48,M16 · usar: AS-IS de procesos — clasificar cada proceso hallado
- **M29** Process / Task Mining · T1+O3,O6 · niv:O+T · columna·m1,m2,m3·ctx · ancla[procesos-flujo,triage-automatizacion] · ⇄M12,M09,M14,M23,M36 · usar: etapa 1 (mapeo automático del AS-IS) + etapa 3 (detectar puestos/tareas automatizables con IA)

### C · Arquitectura & Sistemas
- **M13** ArchiMate / TOGAF · O5+O3 · niv:T+E · columna·m1,m2·ctx · ancla[vocabulario-arquitectura,organizacion] · ⇄M14,M08 · usar: AS-IS de sistemas (paso 3)
- **M14** SYSTEM-MAP + document-project (propio) · O5+T1 · niv:T+O · columna·m1,m2,m3·ctx · ancla[vocabulario-arquitectura] · ⇄M13,M23 · usar: AS-IS de sistemas (paso 3); plano Análisis
- **M31** Business Capability Modeling · O5+O3,O6 · niv:E+D,T · columna·m1·ctx · ancla[vocabulario-arquitectura,madurez-brecha] · ⇄M13,M12,M27,M15 · usar: etapa 1 — el mapa de la organización + heatmap de gaps alineado a los objetivos

### D · Gobierno, Calidad & Madurez
- **M15** COBIT 2019 · O6+O2 · niv:E+D,T · columna·m1·ctx · ancla[estrategia,madurez-brecha] · ⇄M21,M06,M47 · usar: Hilo de Oro + Gap Analysis (madurez digital). Modo lite, sin certificación
- **M16** ISO 9001 · T3+O4 · niv:T+D,E,O · columna·m1,m2,m3·ctx · ancla[calidad-loop,riesgo-controles,procesos-clasificacion,organizacion,documentacion-qms,mejora-proyectos] · ⇄M21,M25,M38,M47,M51,M58,M12 · usar: capa de contexto (vocabulario) y M2/M3 (mejora continua)
- **M17** ITIL 4 · T3 · niv:O+T · situacional·m1,m2 · fuera-del-twin · ⇄M16 · usar: situacional — solo si el cliente opera servicios IT. NO es la columna
- **M25** RACI (Responsibility Assignment Matrix) · O4+T3 · niv:T+D,E,O · columna·m1,m2,m3·ctx · ancla[organizacion,triage-automatizacion] · ⇄M16,M15,M24,M36,M46,M58,M61 · usar: encuadre (autoridad) y en cada gate (quién ratifica/apuesta/acepta)
- **M38** ISO 10013:2021 — pirámide documental (QMS) · T3+O3 · niv:O+T · columna·m1,m2·ctx · ancla[documentacion-qms] · ⇄M16,M12,M46 · usar: clasificar manuales/procedimientos/instrucciones/registros del cliente en el levantamiento y su mantenimiento
- **M42** Lean Six Sigma / DMAIC · O7+O6,O2 · niv:T+E,O · situacional·m3·ctx · ancla[mejora-proyectos] · ⇄M35,M22,M28,M59 · usar: proyecto_mejora con caso de negocio formal (metodologia: dmaic)
- **M43** MASP — Método de Análise e Solução de Problemas (QC Story) · O7+O6 · niv:T+O · situacional·m3·ctx · ancla[mejora-proyectos] · ⇄M42,M16,M41 · usar: proyecto_mejora en cliente brasileño / cultura Falconi (metodologia: masp)
- **M44** Gestión de ideas (embudo de ideas) · O7+O4 · niv:O+T · situacional·m2,m3·ctx · ancla[mejora-proyectos] · ⇄M42,M40,M35,M54 · usar: entidad idea del objeto — programas de participación del personal (los CCQ migrados a plataforma: AEVO 400+ e…
- **M45** ISO 56002 / 56001 — gestión de la innovación · O7 · niv:E+D,T · situacional·m3 · horizonte[mejora-proyectos] · ⇄M44,M16,M54 · usar: cliente que exija certificación de innovación o quiera formalizar el embudo como sistema de gestión (gateado…
- **M47** ISO 9004:2018 — madurez del sistema de gestión (autoevaluación) · O6+T3,O4 · niv:E+D,T · columna·m1,m2·ctx · ancla[madurez-brecha,calidad-loop,organizacion] · ⇄M16,M15,M31,M38,M40,M60 · usar: diagnóstico M1 y mantenimiento M2 — nivel actual vs deseado por dimensión del sistema de gestión que M16 rele…
- **M49** EFQM 2025 — excelencia organizacional (RADAR) · O6+T2,T3 · niv:E+D · situacional·m1 · horizonte[madurez-brecha] · ⇄M47,M10,M26,M60 · usar: situacional — cliente orientado a reconocimiento/premio EFQM, o que exige graduar la experiencia de cliente (…
- **M50** P3M3 — madurez de portafolio, programas y proyectos · O7+O6 · niv:E+T · situacional·— · horizonte[mejora-proyectos,madurez-brecha] · ⇄M42,M43,M47,M59 · usar: horizonte gateado por demanda (patrón M45): cliente con portafolio de proyectos de mejora grande o PMO formal…
- **M51** ISO 10015:2019 — gestión de competencias y desarrollo de personas · O4+O6,T3 · niv:T+O · columna·m1,m2·ctx · ancla[organizacion,madurez-brecha] · ⇄M16,M38,M25,M46,M40 · usar: levantamiento M1 (quién puede qué, insumo del AS-IS de roles) y mantenimiento M2 (cierre de brechas de compet…
- **M52** ISO 31000:2018 — apetito de riesgo (con COSO ERM como marco alterno) · O1+O2,T3 · niv:D+E · columna·m1,m2·ctx · ancla[riesgo-controles,estrategia] · ⇄M16,M04,M15,M28,M54,M56,M58 · usar: encuadre del nivel directorio (m1) y cada sesión de revisión (m2): el directorio fija el apetito por categorí…
- **M53** ISO 8000-61 — madurez de la gestión de calidad de datos · T1+O6,O5 · niv:T+E · situacional·m1 · horizonte[provenance,madurez-brecha] · ⇄M23,M31,M47 · usar: horizonte gateado por demanda: cliente cuyo diagnóstico revela el dato como brecha estructural (papel, silos,…
- **M58** Gobierno de la sesión de directorio — acuerdos, acta y facultades · T3+O4,O2 · niv:D+E · columna·m1,m2·ctx · ancla[organizacion,calidad-loop,estrategia] · ⇄M16,M25,M55,M52,M41,M61 · usar: encuadre del nivel directorio (m1) y cada sesión de revisión (m2); al cerrar la sesión, para generar el acta
- **M60** MEG / FNQ — Modelo de Excelência da Gestão (la vara brasileña de madurez) · O6+T3,O4 · niv:E+D,T · situacional·m1 · horizonte[madurez-brecha] · ⇄M47,M49,M41,M23,M16 · usar: gateado por demanda: cliente brasileño con historia FNQ/PNQ o con autoevaluación MEG previa — se LEE su ciclo…

### E · Especificación & Construcción
- **M18** Spec-Driven Development (SDD) · O7+O2 · niv:O+T · columna·m3 · fuera-del-twin · ⇄M19,M20 · usar: etapas 4–5 (contrato → construcción); núcleo del harness
- **M19** EARS (Easy Approach to Requirements Syntax) · O7 · niv:O · columna·m3 · fuera-del-twin · ⇄M18,M20 · usar: etapa 4 — escribir criterios de aceptación
- **M20** Specification by Example / BDD · O7 · niv:O · columna·m3 · fuera-del-twin · ⇄M19,M18 · usar: etapas 4–5; complementa EARS

### F · Valor, Costo & Alineación
- **M21** OKR (Objectives & Key Results) · O2 · niv:E+D,T · columna·m1,m2,m3·ctx · ancla[estrategia] · ⇄M15,M22,M06,M54 · usar: encuadre (paso 1) + Hilo de Oro
- **M22** FinOps — Quantify Business Value · O2+T3 · niv:D+E,T · columna·m2,m3·ctx · ancla[madurez-brecha,estrategia] · ⇄M21,M06,M48,M04,M55,M42 · usar: loop de valor (aceptación, paso 11) y cada sesión de revisión: prometido vs cobrado por apuesta y por proyect…
- **M26** Hoshin Kanri (Strategy Deployment) · O2+O4,T3 · niv:D+E,T · columna·m1·ctx · ancla[estrategia] · ⇄M21,M15,M30,M54 · usar: etapa 1 — alinear el TO-BE a los objetivos del directorio; plan a 3 años → slice anual → OKR trimestral
- **M27** Wardley Mapping · O5+O2,O6 · niv:E+D · columna·m1,m2·ctx · ancla[estrategia] · ⇄M31,M13,M15 · usar: etapa 1 — el plan a 3 años; cómo la 'maquinaria' (procesos·sistemas) evoluciona según los objetivos
- **M28** WSJF / Cost of Delay · O6+O1,O2 · niv:T+E · columna·m3 · ancla[madurez-brecha] · ⇄M22,M04,M06,M54 · usar: etapa 2 — priorizar los gaps detectados antes de pasarlos a discovery/delivery
- **M30** Balanced Scorecard · O2+T3 · niv:D+E,T · columna·m1,m2·ctx · ancla[estrategia] · ⇄M26,M21,M06,M55,M41 · usar: etapa 1 — traducir la estrategia del directorio a KPIs por perspectiva; complementa OKR/Hoshin. **Es el marco…
- **M41** GPD — Gerenciamento pelas Diretrizes (Falconi) · O2+O4 · niv:D+E,T,O · situacional·m1,m2·ctx · ancla[estrategia] · ⇄M26,M21,M16,M30,M60 · usar: cliente brasileño / config_estrategia.modo = gpd-anual o mixto (research 00-research-latam-br de la historia…
- **M48** Benchmarking externo de procesos y funciones (APQC Open Standards · Hackett DWC) · O6+O3,O2 · niv:E+D,T · columna·m1,m2·ctx · ancla[madurez-brecha] · ⇄M12,M22,M09,M28,M23 · usar: dimensionar brechas (¿cuánto peor que el peer?) y validar metas de KPI (¿el to-be es alcanzable?) — diagnósti…
- **M54** Portafolio de ambición 70/20/10 (matriz de ambición de innovación) · O2+O7,O1 · niv:D+E,T · columna·m1,m2,m3·ctx · ancla[estrategia,mejora-proyectos] · ⇄M21,M26,M28,M44,M45,M52,M57,M61 · usar: al crear/triageár idea, proyecto_mejora o KR (m1: clasificar el portafolio hallado en el diagnóstico · m2/m3:…
- **M55** Reporte financiero como fuente — marco contable (NIIF / NIIF para PYMES) leído, jamás reexpresado · O2+T1,T3 · niv:D+E · columna·m1,m2·ctx · intercambio[estrategia,provenance] · ⇄M22,M23,M16,M30,M59 · usar: encuadre del nivel directorio (m1) y cada sesión de revisión (m2): leer el resultado del periodo contra plan…
- **M56** Liquidez del directorio — proyección de caja a 13 semanas y límites del financiamiento · O2+O6,T3 · niv:D+E · columna·m1,m2·ctx · ancla[estrategia,riesgo-controles] · ⇄M55,M52,M23,M28 · usar: encuadre del nivel directorio (m1) y cada sesión (m2); obligatorio cuando el diagnóstico revela tensión de co…
- **M57** Presupuesto y control presupuestario — la mezcla de ambición hecha plata · O2+O7,T3 · niv:D+E,T · columna·m1,m2·ctx · ancla[estrategia,mejora-proyectos] · ⇄M54,M04,M22,M58,M55,M61 · usar: encuadre anual del directorio (m1) y su seguimiento en cada sesión (m2); al aprobar cualquier apuesta o proye…
- **M59** Valor ganado (EVM) — el portafolio de inversiones · O2+O6,O3 · niv:D+E,T · situacional·m1,m2 · ancla[estrategia,madurez-brecha] · ⇄M55,M57,M50,M42,M23 · usar: cliente con inversiones grandes en curso (m1 para levantarlas, m2 para seguirlas en cada sesión)
- **M61** OBZ — Orçamento Base Zero (presupuesto reconstruido, paquete con dueño) · O2+O7,T3 · niv:E+D,T · situacional·m1,m2 · ancla[estrategia] · ⇄M57,M54,M58,M55,M25 · usar: gateado por demanda: cliente con cultura de costos (brasileño 3G/Falconi, o cualquiera que declare meta de re…

### G · IA: Grounding & Anti-alucinación
- **M23** Grounding / RAG + Provenance · T1 · niv:O+D,E,T · columna·m1,m2,m3·ctx · ancla[provenance,madurez-brecha] · ⇄M14,M40 · usar: todo el AS-IS (paso 2) y como regla transversal

### H · Diseño de Servicio & Experiencia
- **M24** This Is Service Design Doing (TiSDD) · T2+O3,O4 · niv:T+E,O · columna·m1,m3 · fuera-del-twin · ⇄M10,M05,M25 · usar: productizar cada etapa (interfaces frontend + actores + experiencia del sponsor)

### I · Twin & automatización del trabajo
- **M32** Doctrina de ontología Palantir (semántica + kinética) · O7+T1 · niv:E+D,T,O · paraguas·m1,m2,m3·ctx · metamodelo-propio[metamodelo,contrato-entidad] · ⇄M23,M13,M46 · usar: siempre — es la gramática de las 21 entidades del twin (CK-26 + `apuesta` D-23 + el gobierno del directorio D…
- **M33** DEMO / Enterprise Ontology (Dietz) · O3+O4 · niv:T+O · situacional·— · horizonte[simulacion] · ⇄M07,M34 · usar: todavía no — horizonte D9; se activa solo con la decisión de formalizar transacciones
- **M34** BPSim (Business Process Simulation) · O3+O6 · niv:T+O · situacional·— · horizonte[simulacion] · ⇄M11,M29 · usar: todavía no — horizonte D9; requiere twin base + datos de operación + demanda real
- **M35** ECRS (Eliminar · Combinar · Reordenar · Simplificar) · O3+O6 · niv:O+T · columna·m1,m3·ctx · ancla[triage-automatizacion] · ⇄M09,M36,M29 · usar: triage de actividades (diagnóstico M1 y mejora M3), antes de correr los scores
- **M36** Criterios de automatizabilidad — RPA + agente-LLM (dos scores) · O3+O6,O4 · niv:O+T · columna·m1,m3·ctx · ancla[triage-automatizacion] · ⇄M37,M29,M35,M25,M46 · usar: triage de actividades tras ECRS: puntuar candidatos y emitir veredicto con incertidumbre visible
- **M37** Taxonomía de verbos & automatizabilidad (propia, ALM×MGI) · O3+O4,T1 · niv:O+T · columna·m1,m2·ctx · ancla[narrativa-actividades,triage-automatizacion] · ⇄M36,M23,M35,M46 · usar: narrativa de actividades y de sus tareas (D-17: tareas[] = APQC L5, mismo vocabulario) — levantamiento y mant…
- **M39** NASA-TLX / RTLX (carga cognitiva medida) · O4+O3 · niv:O+T · situacional·m1·ctx · ancla[carga-cognitiva] · ⇄M36,M40 · usar: SOLO actividades pre-flageadas por el triage (densidad de espera/decisión, %excepciones alto, queja espontáne…
- **M40** Métricas de persona — frontera twin ↔ individuo (CK-24) · O4+T1,T3 · niv:D+E,T,O · columna·m1,m2,m3·ctx · ancla[organizacion,carga-cognitiva] · ⇄M23,M39,M25,M46 · usar: transversal — cada vez que un indicador, score o medición pueda atribuirse a una persona nombrada
- **M46** Arnés por rol×proceso — el trabajo compilado del twin · O4+O3,O7,T3 · niv:O+T · columna·m2,m3·ctx · ancla[trabajo-compilado,organizacion,triage-automatizacion] · ⇄M25,M36,M37,M40,M32,M38 · usar: al compilar, versionar o auditar el trabajo de un puesto; al decidir la granularidad de un skill (actividad h…

## §2 Grafo inverso — dónde se operacionaliza cada card

- M02 (Continuous Discovery) ← pasos: m3.e0.p3, m3.e0.p6
- M04 (Shape Up) ← pasos: m3.e0.p4, m3.e0.p5
- M06 (Impact Mapping) ← pasos: m3.e0.p1, m3.e0.p2, m3.e0.p3
- M12 (APQC Process Classification Framework) ← pasos: m1.b1.p5
- M13 (ArchiMate) ← pasos: m1.b1.p4
- M14 (SYSTEM-MAP + document-project) ← pasos: m1.b1.p4
- M16 (ISO 9001) ← nichos: N-IMM-06, N-IMM-08
- M21 (OKR) ← pasos: m1.b1.p1, m3.e0.p3
- M22 (FinOps — Quantify Business Value) ← pasos: m3.e0.p1, m3.e0.p2, m3.e0.p5
- M23 (Grounding) ← pasos: m1.b1.p2, m1.b1.p3, m1.b1.p5, m1.b1.p6
- M55 (Reporte financiero (fuente)) ← nichos: N-IMM-07

Sin operacionalizar aún (50 — ningún paso/nicho las cita; brecha esperable con proceso/ a medio poblar, BL-05): M01, M03, M05, M07, M08, M09, M10, M11, M15, M17, M18, M19, M20, M24, M25, M26, M27, M28, M29, M30, M31, M32, M33, M34, M35, M36, M37, M38, M39, M40, M41, M42, M43, M44, M45, M46, M47, M48, M49, M50, M51, M52, M53, M54, M56, M57, M58, M59, M60, M61

## §3 Proceso (Definición) — pasos poblados

- `m1.b1.p1` · Encuadre ("Hola") · actor:consultor · gate:none · met: ISO9001-cl4, M21, RACI
- `m1.b1.p2` · Conectar fuentes · actor:consultor · gate:none · met: M23
- `m1.b1.p3` · Ingesta + triage · actor:analisis · gate:none · met: M23
- `m1.b1.p4` · document-project de sistemas · actor:analisis · gate:none · met: M14, M13
- `m1.b1.p5` · AS-IS borrador con confianza · actor:analisis · gate:none · met: M12, M23
- `m1.b1.p6` · Revisión + marcado "a corroborar" · actor:consultor · gate:none · met: M23
- `m3.e0.p1` · Preparación async · actor:consultor · gate:none · met: M22, M06
- `m3.e0.p2` · Presentar el candidato · actor:sponsor · gate:none · met: M06, M22
- `m3.e0.p3` · Elegir / ajustar el outcome · actor:sponsor_accountable · gate:none · met: M21, M02, M06
- `m3.e0.p4` · Señal de appetite (gruesa) · actor:sponsor_accountable · gate:none · met: M04
- `m3.e0.p5` · Sellar la apuesta · actor:accountable_del_kr · gate:humano · met: M04, M22
- `m3.e0.p6` · Sembrar el OST · actor:sistema · gate:none · met: M02

Etapas SIN pasos (8 stubs — historia `sistema/poblar-metodo-m1-m3`): m1.b2, m1.b3, m2.mant, m3.e1, m3.e2, m3.e3, m3.e4, m3.e5

## §4 Nichos (eje vertical)

### inmobiliario (8)
- N-IMM-01 · Caja por proyecto · kpi · O2 · conf:media/experto
- N-IMM-02 · Velocidad de venta / absorción · kpi · O2 · conf:media/benchmark-sectorial
- N-IMM-03 · Cobranza / DSO · kpi · O2 · conf:baja/hipotesis
- N-IMM-04 · Desviación de presupuesto de obra · kpi · O6 · conf:media/experto
- N-IMM-05 · Rentabilidad del proyecto (drivers del IRR) · driver · O2 · conf:media/observado-en-cliente
- N-IMM-06 · ISO 9001 en desarrollo inmobiliario · mapeo-transversal · T3 · conf:alta/norma · ⇄M16
- N-IMM-07 · Margen bruto por proyecto · kpi · O2 · conf:baja/hipotesis · ⇄M55
- N-IMM-08 · Satisfacción del propietario (postventa) · kpi · T2 · conf:baja/hipotesis · ⇄M16

### manufactura (6)
- N-MFG-01 · OEE (eficiencia global de equipos) · kpi · O3 · conf:media/experto
- N-MFG-02 · Scrap / FTQ (calidad a la primera) · kpi · O6 · conf:media/experto
- N-MFG-03 · OTIF (entregas a tiempo y completas) · kpi · T2 · conf:media/experto
- N-MFG-04 · Accidentabilidad (LTIFR) · kpi · O4 · conf:media/experto
- N-MFG-05 · Costo unitario de producción · kpi · O2 · conf:baja/hipotesis
- N-MFG-06 · Disponibilidad de equipos (MTBF / MTTR) · kpi · O3 · conf:media/experto

### retail (5)
- N-RET-01 · Venta por m² · kpi · O2 · conf:media/experto
- N-RET-02 · Merma (shrinkage) · kpi · O6 · conf:media/experto
- N-RET-03 · Rotación de inventario · kpi · O2 · conf:media/experto
- N-RET-04 · Ticket promedio / unidades por ticket · kpi · O2 · conf:media/experto
- N-RET-05 · Quiebre de stock (disponibilidad en góndola) · kpi · O3 · conf:baja/hipotesis

## §5 Backbone — objeto → cards primarias

- **O1** Oportunidad / Apuesta: M01, M02, M04, M05, M52
- **O2** Objetivo & Valor: M06, M21, M22, M26, M30, M41, M54, M55, M56, M57, M59, M61
- **O3** Proceso: M07, M09, M10, M11, M12, M33, M34, M35, M36, M37
- **O4** Personas & Autoridad: M25, M39, M40, M46, M51
- **O5** Sistema & Capabilities: M08, M13, M14, M27, M31
- **O6** Gap & Madurez: M15, M28, M47, M48, M49, M60
- **O7** Contrato & Código: M18, M19, M20, M32, M42, M43, M44, M45, M50
- **T1** Dato / Grounding: M23, M29, M53
- **T2** Experiencia / Servicio: M24
- **T3** Gobierno / Loop: M03, M16, M17, M38, M58

## §6 Nivel — en qué piso de la organización se usa cada card

Eje ORTOGONAL al objeto (§5 = QUÉ toca) y al módulo (§3 = CUÁNDO del engagement). Acá: DÓNDE se usa.
`ancla` = el piso donde se DECIDE o SE FIRMA lo que la card produce · `también se usa` = los pisos que
la consumen (bajada de la cascada, insumo, ejecución). Ruteo: primero filtrá por el piso de la
pregunta, después leé la card. La escalera baja 1→4.

### 1 · Directorio
- **ancla** (13): M04 Shape Up, M22 FinOps — Quantify Business Value, M26 Hoshin Kanri, M30 Balanced Scorecard, M40 Métricas de persona, M41 GPD (Falconi), M52 ISO 31000 (apetito), M54 Ambición 70/20/10, M55 Reporte financiero (fuente), M56 Liquidez (caja 13 semanas), M57 Presupuesto (asignado vs comprometido), M58 Sesión de directorio (acuerdos y acta), M59 Valor ganado (inversiones)
- también se usa (15): M03, M15, M16, M21, M23, M25, M27, M31, M32, M45, M47, M48, M49, M60, M61

### 2 · Estratégico
- **ancla** (16): M02 Continuous Discovery, M03 Product Operating Model, M05 Jobs-to-be-Done, M06 Impact Mapping, M15 COBIT 2019, M21 OKR, M27 Wardley Mapping, M31 Business Capability Modeling, M32 Ontología Palantir, M45 ISO 56002, M47 ISO 9004 (madurez), M48 Benchmarks APQC/Hackett, M49 EFQM RADAR, M50 P3M3, M60 MEG (FNQ · Brasil), M61 OBZ (base cero)
- también se usa (22): M04, M12, M13, M16, M22, M23, M24, M25, M26, M28, M30, M40, M41, M42, M52, M53, M54, M55, M56, M57, M58, M59

### 3 · Táctico
- **ancla** (18): M01 Dual Track Agile, M07 Event Storming, M08 Domain-Driven Design, M09 Value Stream Mapping, M10 Service Blueprint, M12 APQC Process Classification Framework, M13 ArchiMate, M14 SYSTEM-MAP + document-project, M16 ISO 9001, M24 This Is Service Design Doing, M25 RACI, M28 WSJF, M33 DEMO, M34 BPSim, M42 DMAIC, M43 MASP, M51 ISO 10015 (competencia), M53 ISO 8000-61 (datos)
- también se usa (35): M02, M03, M04, M05, M06, M11, M15, M17, M18, M21, M22, M23, M26, M29, M30, M31, M32, M35, M36, M37, M38, M39, M40, M41, M44, M45, M46, M47, M48, M50, M54, M57, M59, M60, M61

### 4 · Operativo
- **ancla** (14): M11 BPMN, M17 ITIL 4, M18 Spec-Driven Development, M19 EARS, M20 Specification by Example, M23 Grounding, M29 Process / Task Mining, M35 ECRS, M36 Criterios RPA + agente, M37 Taxonomía de verbos, M38 ISO 10013, M39 NASA-TLX, M44 Embudo de ideas, M46 Arnés por rol×proceso
- también se usa (18): M01, M07, M08, M09, M10, M12, M14, M16, M24, M25, M32, M33, M34, M40, M41, M42, M43, M51

---
SSoT: `methodologies.yaml` · `proceso/**` · `nichos/*.yaml` · contratos: `methodology.schema.yaml` (v4, eje nivel) + `nichos/nicho.schema.yaml`.
Gate: `python3 sistema/metodo/gen_metodo.py --check` (pre-commit). Este archivo se REGENERA, no se edita.
