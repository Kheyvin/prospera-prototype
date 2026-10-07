# HANDOFF — continuar el mockup del twin (sesión 2026-07-26 → siguiente)

> **★ v21 EJECUTADA (2026-08-01 — "toca táctica": la sala del área + abrir-por-rama + el archivo;
> firmas A-E del operador sobre la propuesta escrita):** el nivel 3 dejó de ser un tablero
> transversal de resultados y pasó a ser DOS cosas: **portada-selector** (tarjetas-organigrama por
> gerencia con jefaturas anidadas — resumen TWIN primero: puestos·vacantes·procesos·docs·⛨; plan
> después — + la cinta transversal: bajadas con salto a su sala, acuerdos, riesgos) y **LA SALA DEL
> ÁREA** (`renderSalaArea`, gerencia O jefatura, mismo molde): documento vertical de 6 bandas que se
> lee como frase — ① lo que nos toca (bajadas + «te toca y nadie la bajó») · ② el plan (ruta
> meta→capacidad→proceso→compromiso→indicador + «la reunión va a preguntar») · ③ quién (mini-organigrama
> del subtree con nómina y vacantes) · ④ cómo se ejecuta (mapa por tipo; **⊕ abrir despliega el
> proceso EN SU LugAR** a roles×actividades y EMPUJA a los vecinos — `state.procAmp`, scroll
> conservado) · ⑤ sobre qué corre · ⑥ **el archivo** (pirámide documental + CONTRATOS con
> **vencimiento DERIVADO** contra `DATA.periodo` + el hueco «ningún procedimiento lo rige» dibujado).
> **Doctrina twin-primero:** capa nueva **Plan del ciclo** (rail, ON) — apagada, la sala muestra solo
> la organización. **Organigrama: murió el LOD global** → expansión POR RAMA (`state.expandidas` +
> `state.puestosOpen`, ⊕/⊖ por nodo, `treeLayout` con filas de alto computado — abrir empuja, jamás
> tapa; botones 1-4 = presets `presetNiveles`). **Doble click en un área = su sala** (firma D; el foco
> z1 quedó como botón de ficha). **Riesgos/acuerdos/ideas del área se DERIVAN de sus refs**
> (`areaDeRef`/`cargoArea` — cero campo duplicado). **D-38 clavada** (`sistema/schema/DECISIONES.md`):
> entidad `documento` (21º nodo — tipo·relacion rige/produce/sustenta·estado·vence·contraparte;
> `vencido` JAMÁS estado, se computa; D-08 intacta: manual/z3 = proyección) + 2 acciones kinéticas +
> 3 invariantes; gen_schema 21 nodos OK; barrido «20 entidades»→21 (CLAUDE/VISION/reglas/M32/mockup).
> GLOSARIO §1 +4 filas firmadas (sala del área · el archivo · abrir⊕/plegar⊖ · papeles/evidencia/
> contrato). Partes nuevas: `37-data-archivo.js` (14 docs + helpers docVence/docsDeArea/
> procsSinDocRige) · `19c-sala-area.css`. Fichas: `openDocumento` nueva · openProceso gana grupo
> «El archivo» · openArea gana «Entrar a la sala». Respaldo: +5 entradas (tac-selector · sala-twin ·
> sala-plan · sala-procesos · sala-archivo). verify.sh **47/47** (v21-organigrama-abrir-rama con
> empuje MEDIDO por offsets · v21-nivel3-selector · v21-sala-del-area; org-dblclick-drill reescrito;
> nivel3-tactico → selector). **Encontrado MIRANDO** (regla 5): contrato vencido mostraba «vigente» y
> «vencido hace 5 meses» a la vez → cuando el derivado dice vencido, MANDA y el estado guardado no se
> pinta. Verificado con ojos propios (portada · sala Finanzas completa · Cobranza abierta en su lugar
> con carriles y vecinos empujados · archivo con OSE vencido y 5 huecos · organigrama con Finanzas
> plegada + nómina de Comercial abierta). **OJO:** este commit aterriza TAMBIÉN v19+v20 (estaban
> ejecutadas y documentadas acá, pero sin commitear). Pendiente que abre: conector real al corpus
> (F3) · ¿`proyecto.hitos[]`? (decisión aparte) · el Artifact se republicó (misma URL 🗺️).

> **★ v20 EJECUTADA (2026-07-30 — "¿sirve en una junta de gerentes?" → el mapa completa el mapa):**
> el nivel 2 pasa de **5 a 7 bandas** y se lee de arriba a abajo como UNA frase: *a dónde vamos ·
> **cómo nos gobernamos** · **qué sabemos hacer** · cómo lo hacemos · qué nos sostiene · quién lo opera ·
> sobre qué corre*. Dos bandas nuevas cierran dos huecos que hacían que el producto se leyera como dos
> cosas pegadas. **① Dirección** (`tipo:'direccion'` — 6 procesos: planeamiento · revisión por la
> dirección · presupuesto · riesgos · mejora · cambios). Ninguno es invención: los seis ya se ejercían
> en el nivel 1 y en los módulos, **sin casilla, sin dueño, sin madurez** — el nivel 1 se producía FUERA
> del mapa. Cada uno declara qué `produce` y salta a su `tablero` (`irTablero`). Quedan **fuera del hilo
> de oro a propósito** (la dirección no mueve un indicador: produce la meta que otros mueven) y por eso
> tampoco se apagan al encender una meta. **② Capacidades** (13, agrupadas por familia, `DATA.capCats`):
> el eslabón que faltaba entre la meta y el proceso — sin él la junta salta de "no llego" a "arreglá el
> proceso". **El hilo ahora PASA por la capacidad** (meta → capacidad → proceso, con dedupe; el directo
> sólo cuando no hay capacidad declarada). **③ La lente Madurez existe por fin en el mapa de valor**:
> `procColor()` es una sola definición para las tres bandas de procesos, y el botón del directorio
> ("ver el mapa por madurez de capacidades") **cumplía la promesa en el organigrama y NO en el mapa de
> valor** — ahí `state.sub==='madurez'` no estaba implementado y caía en silencio a digitalización.
> **④ La madurez mide la BRECHA, no el peldaño** (D-c): rollup por peor distancia, y sin nivel deseado
> **no se tiñe a nadie** (cuarto estado "sin meta fijada"; `c-permisos` hundía a Desarrollo en rojo por
> una meta inexistente). **⑤ La banda Estrategia pasa a DOS FILAS** (arriba la meta del directorio,
> abajo la bajada con gerencia · rol que responde · si fue acordada; cascada **punteada** cuando no hay
> acuerdo — M26). Antes: 10 metas en una fila, la décima fuera del lienzo y nada distinguía la meta de
> la empresa de la de un gerente. **Método:** ingesta por `/metodo-aprende` → **D-37** en el contrato
> del objeto (`proceso.tipo`, enum `tipo_proceso`) + arista **M12↔M16** en las dos direcciones (las dos
> anclaban `procesos-clasificacion` y **no tenían arbitraje**: APQC clasifica para COMPARAR, el mapa ISO
> para LEER; el tipo NO se deriva del id APQC). **Respaldo:** `z0-direccion` + `z0-capacidades` nuevas,
> `z0-cadena`/`z0-apoyo`/`ent-proceso`/`ent-capability` reescritas. **Suite 44/44.**
> **Encontrado MIRANDO, no por las pruebas** (ver `src/README.md` regla 5): banda Dirección envuelta
> tapando el rótulo de Capacidades · rótulo de la fila de bajadas tapado por los nodos de arriba · pin
> de brecha apilado invadiendo la banda superior · y un **falso negativo** en "qué metas se apoyan en
> esta capacidad" (*ver la caja al día*, la peor brecha del mapa, decía "ninguna" porque su proceso no
> declara driver mientras su brecha bloquea un contrato del directorio → ahora se deriva por **dos
> caminos**). **Cobertura declarada:** 7 procesos sin capacidad quedan fuera de la lectura por madurez y
> el hueco se DIBUJA (`.caphueco` → `openCobertura`), no se calla.

> **★ v18 EJECUTADA (2026-07-29 — "¿le interesa esto a un directorio?" → los 3 bloques + reorganización):**
> auditoría sin defender lo hecho (13 hallazgos, tablero `dossier/07` § H): lo que había gobernaba la
> **ejecución de la estrategia** — la segunda mitad de una agenda de directorio; faltaba la primera
> entera. **La página se reorganiza como la AGENDA de la sesión en 4 movimientos**: ① ¿cómo nos fue?
> (6 cifras del periodo con plan/año anterior/acumulado + estado de cierre · caja a 13 semanas contra
> el piso · límites con el banco) · ② ¿a dónde vamos? (rumbo · apuestas ahora con **valor COBRADO**,
> no sólo prometido · varas · **presupuesto** = la mezcla en plata) · ③ ¿qué puede impedirlo?
> (**registro de riesgos** contra el apetito · alertas · **inversiones en curso**: avance real vs
> declarado · gasto vs presupuesto · comprometido · proyectos) · ④ ¿qué decidimos? (bandeja con
> **decisiones de plata** que llegan por umbral de facultades · **acuerdos de la sesión anterior** ·
> **cerrar y generar el acta**). **Bloque C (alcance):** Cockpit **no reexpresa** los estados
> financieros — los lee con estado de cierre y los BAJA al proceso que los produce; ficha
> `openAlcanceContable` con lo que NO hace + el **puente** de 6 decisiones contables ancladas al twin
> (la joya: `g-avc` 87 vs 95 = valorización de lo construido). La norma vive SOLO dentro de la ficha,
> como procedencia — gate en la suite (cero `NIIF|NIC \d` en pantalla). **Se ELIMINÓ** el panel
> "¿Avanzan las apuestas?" (duplicaba el punto de la tarjeta) y el inspector de nivel 1 dejó de
> repetir pulso y ciclo de mejora → ahora es el **índice de la sesión** (4 saltos, `irMovimiento`).
> **Techo roto:** `fit()` encajaba una página en ancho Y alto, así que cada panel nuevo encogía la
> letra de todos → **`fitPagina`** (encaje al ancho, anclado arriba) + **la rueda RECORRE** (⌘/Ctrl+rueda
> hace zoom); zoom se mantiene en 78% con página de 2.7k px. **Generalidad entre industrias** (pedido
> explícito): 7 líneas `.paral` + 1 en ficha nombran el equivalente en manufactura/retail/servicios/
> software/banca/salud; la cabecera lo declara. **Partes nuevas:** `36-data-gobierno.js` ·
> `19b-directorio.css` · `74-fichas-gobierno.js` (7 fichas). **7 acciones nuevas** en `ACC` (aprobar
> presupuesto/inversión/endeudamiento · fijar piso de caja · asignar riesgo · comprometer acuerdo ·
> cerrar acta). **6 entradas de Respaldo** citando lo que existe (ISO 9001 §9.3 · FinOps · procedencia ·
> ISO 31000 · 70/20/10 · P3M3 · RACI) y declarando en `gap:` lo que **no tiene carta** (marco contable ·
> caja 13 semanas · presupuesto · gobierno corporativo · registro de riesgos) — **`methodologies.yaml`
> NO se tocó**: se propone vía `/metodo-aprende` con firma. verify.sh **34/34**, 0 errores JS
> (+`v18-directorio-agenda`: 4 movimientos · 6 cifras con referencia y cierre · caja bajo el piso ·
> cobrado en apuestas · 3 bolsas · 6 riesgos contra apetito · 3 inversiones con desvío · 5 acuerdos con
> 1 vencido · bandeja con plata · alcance con puente · cero norma en pantalla · rueda que recorre).
> Verificado con capturas propias (página completa + los 4 movimientos). **PENDIENTE: republicar al
> Artifact** (el operador decide) + firma de la deuda de esquema/método que abre (`07` § H).

> **★ v17.2 EJECUTADA (2026-07-28 — "corrige todos los errores encontrados": barrido del tracker
> dossier/07, todo lo ejecutable-sin-firma):** **(A4.1)** `objetivo.salud` DEJÓ de ser canned —
> `saludKr(kr)` la DERIVA de avance real vs `kr.esperado` (campo nuevo en los 7 KRs, calibrado para
> reproducir la narrativa: 1 verde · 3 ámbar · 3 rojos idénticos a antes); ficha objetivo gana renglón
> "Esperado a hoy" + title en el chip de salud ("se computa, jamás se guarda" — mismo principio que
> semaforo()/M36). **(A6 a+b)** provenance COMPLETA: `fuente`/`conf` agregados a los datasets canned
> que no los tenían (objetivos ×7 · brechas ×8 · proyectos ×3 · sistemas ×11 con conf por
> digitalización · capabilities ×4 · ideas ×4 · empresa) y `prov()` en las 13 fichas de entidad
> (objetivo/brecha/proyecto/rol/persona/sistema/idea/capability/empresa nuevas; proceso/actividad/
> kpi/arnés ya lo tenían; persona/rol = default del ingest declarado en el texto). A6(c) — conf en el
> mini-chevron del triage — es diseño, espera al operador. **(B2)** copy en `02`/`04`: el SIPOC del
> mockup es canned, la derivación es doctrina de la app. **(B3)** copy en `03` decisión 24: única
> ficha sin ícono = Actividad (subesquema). **(tracker 07)** sincronizado: A3/B5/D1/D2 marcadas
> resueltas (v12/v15.2, estaban stale), A1 materialización parcial (apuesta = 13º nodo), A4/A6
> parciales con esta versión; los que ESPERAN FIRMA quedan listados en la nota del tablero (A2 ·
> A4.2-3 · A5 · A6c · B1 · B4 · D3). **(archivo)** `index.html` ahora SÍ cierra con `</body></html>`
> — el OJO de v17.1 quedó obsoleto: replace de `</body>` vuelve a ser inyección válida. verify.sh
> **33/33** (+`a4-a6-salud-prov`: esperado ×7 · salud≡derivación · narrativa intacta (1 verde) ·
> ficha con "Esperado a hoy" · Procedencia en las 9 fichas nuevas). Verificado con ojos propios
> (ficha o-caja: salud verde derivada + esperado 60 días + procedencia acta/alta; mapa banda 1 con
> colores idénticos a v17.1).

> **★ v17.1 EJECUTADA (2026-07-28 — el hilo ya no se corta hacia ARRIBA):** análisis del operador
> ("¿doble-click para bajar del nivel 1 al 2, o que el estratégico traiga lo del directorio?") cerró
> así: NO dblclick en nivel 1 (tablero decide, no navega — doctrina rumbo 2026-07-26: bajar =
> traducción con contexto, no gesto espacial; las bajadas nombradas ya existen: "Encender su hilo" /
> "Ver el hilo que mueve" / "Ver el mapa por madurez") y SÍ re-proyección del ancla (patrón ya
> establecido: banda Estrategia n2 · chips de metas n3 · KPIs del rol n4 — mismo `DATA.objetivos`,
> jamás dato duplicado). El hueco real encontrado: `openObjetivo` violaba la gramática de ficha
> universal ("el viaje nunca se corta") — tenía "Hacia abajo" pero cero link a la apuesta. **Fix:**
> grupo **"Hacia arriba — qué lo sostiene"** (inversa de `openApuesta` § "La sostienen"): loop-it
> `data-ap` por apuesta con punto por estado (por-sellar=warn · sellada=teal · cumplida=ok ·
> retirada=faint); sin apuesta → línea honesta "ninguna apuesta del directorio lo sostiene — se
> decide en el nivel 1" (caso real: `o-eq`). Cadena apuesta⇄objetivo⇄proceso⇄rol⇄arnés ahora
> navegable en ambos sentidos desde cualquier nivel. verify.sh **32/32** (+`ficha-objetivo-arriba`:
> o-cob linkea sus 2 apuestas + clic abre ficha Apuesta + honestidad o-eq). Verificado con ojos
> propios (ficha o-cob: ambos estados pintan). ~~OJO headless: sin `</body>`~~ (obsoleto — v17.2
> agregó `</body></html>`). Deuda A2
> (hilo ancla a objetivo, no KR) sigue abierta — si un día ancla a KR, este link hereda solo.

> **★ v17 EJECUTADA (2026-07-28 — auditoría CON OJOS DE DIRECTOR aplicada completa; el operador pidió
> "implementa todas las mejoras analizando una a una"):** una sesión previa recorrió el tablero click
> por click actuando como director y dejó 11 mejoras; esta pasada las implementó TODAS. **(1) Barrido
> de jerga** (GLOSARIO §1 ganó 14 filas nuevas, aplicadas): money shot ELIMINADO · funil→embudo (×12,
> consistente con nivel 3) · tollgate→revisión/avanzar de fase · catchball→bajada acordada (bandeja) ·
> WSJF→"prioridad ①"/"costo de esperar" (el token queda como fuente en respaldo M28) · MASP/loop-back→
> "vuelta atrás con evidencia" · vendor/in-tool→"de punta a punta en la misma herramienta" · rankeadas→
> ordenadas · headcount→personal · one-time/payback→"costo por única vez"/"se recupera en N meses" ·
> dev→UAT→prod→desarrollo→pruebas→producción · git/hash/PR/N6→"la tubería técnica, jamás" · what-if→
> simulación · kaizen→mejora continua · "en vuelo"→"en curso" (fila ya firmada) · tokens CK-24/CK-29/
> CK-30/D-19/D-20/M38/M44/M46 FUERA de superficie (viven en respaldo). **OJO §1b intacto**: twin/arnés/
> hilo/Pulso/corrida/lienzo/triage NO se tocaron (renombres de producto esperan firma fila por fila).
> **(2) Toasts con destino** (`ejecutarAccion`): mensaje por tipo de aprobación (directa/revisión-dueño/
> comité) + "lo que ves sigue vigente hasta aprobarse" + link "Ver la cola de Cambios ›" (toast ahora
> innerHTML + `.tlink` con pointer-events) — y cada acción no-directa CREA una solicitud `SOLICITUDES`
> (SC-15+) que aparece EN COLA en el módulo Cambios con contador derivado (cerró además el desfase
> "2 pendientes" vs "3 pendientes"). **(3) Pulso clickeable**: puntos (sala + nivel 1) llevan
> `data-obj`/`data-ap` + title con métrica/valor/meta/estado — wireLinks los cablea a la ficha (que ya
> trae "Encender su hilo"); CSS hover. **(4) Deshabilitado explica su porqué**: Big picture y búsqueda
> con `title` dinámico en render(). **(5) El diff de la corrida SE PINTA**: actividad fantasma punteada
> ámbar "Δ · cobrar — portal de pagos (propuesto)" en el lienzo p-cob (celda libre col5·carril1, flujos
> tentativos 03→Δ→06, CSS `.act.ghost`) + chip "Δ +1 actividad" en la card Cobranza del mapa de valor +
> panel corrida linkea "se ve punteada en el lienzo". **(6) ROI etiquetado** ("ROI 2.4×" + title en
> sala/portafolio/táctico/fichas) y "2 en curso · 1 cerrado con indicador movido" DERIVADO de
> DATA.proyectos. **(7) Navegación**: módulo Territorio = HOME (desde z2/z3/foco vuelve al mapa) ·
> cambiar de piel cierra la ficha abierta (`state.insp='home'`). **(8) Primera carga legible**:
> `fitEncuadre()` una sola vez (flag `firstLoad`) encuadra Estrategia+Cadena (~71% vs 58%; KRs legibles
> al entrar); Encajar ⤢ sigue mostrando todo. **(9) Nivel 4 no aterriza a ciegas**: dgroup "Proceso en
> foco" con `<select id="procSel">` (optgroups Cadena/Apoyo, dueño por opción) → `drillLienzo` onchange.
> **(10) Notas D-NN obsoletas actualizadas a D-23** (footnote de openApuesta ELIMINADO — el respaldo ya
> cita; gaps de dir-varas/dir-rumbo re-redactados: apetito YA es esquema, mezcla objetivo no).
> **(11) Pintado**: backdrop-filter FUERA de `.pin`/`.kin` (elementos dentro del layer escalado — eran
> blur por frame durante pan/pulso); los stalls de captureScreenshot del CDP siguen siendo el issue
> ambiental conocido (~30s, reintentar). verify.sh **31/31** (+`v17-auditoria-director`: anti-jerga por
> contenedor — NO contra body, se auto-matchea el script — · solicitud en cola · toast con link · ghost
> en corrida · procSel · titles de disabled; test `nivel1-varas` actualizado: "Cerrar la bajada acordada
> con Comercial"). Verificado con ojos propios: encuadre inicial · punto del pulso→ficha objetivo
> (wireLinks GANA a un onclick manual sobre [data-obj] — cablear después o dejar que wireLinks lo haga) ·
> sellar apuesta→toast+link→SC-15 EN COLA · corrida→fantasma+flujos+Δ chip · Volver al As-Is limpia ·
> procSel cambia a p-vta · Territorio-home desde z2 · Mejora sin money-shot/funil. **Pendiente que
> abre — CERRADO el mismo día (pedido del operador "ejecuta ambos"):** (a) barrido del método vía
> /metodo-aprende: M44 renombrada **"Gestión de ideas (embudo de ideas)"** + prosa de M42/M45/M54 y
> `met:`/`efecto` del schema a "embudo" — la obra "funil de ideias" (AEVO/kaizen teian) queda SOLO
> como fuente/procedencia; gates gen_metodo + gen_schema + paridad Go verdes (54 cards · 13 nodos) ·
> (b) las 14 filas de GLOSARIO §1 **RATIFICADAS** (nota de firma 2026-07-28 en el propio GLOSARIO).
> **Sigue abierto:** §1b (renombres de producto) espera firma fila por fila.

> **★ v16 EJECUTADA (2026-07-27 — "El rumbo" re-diseñado con doctrina real de board-reporting, validada
> con research + skill `dataviz`, no solo criterio propio):** auditoría del operador sobre la banda
> "El rumbo — lo que este directorio prometió" (nivel 1) detectó 6 hallazgos (golden thread sin
> `parent_ref`, "perspectivas 4/4" hardcodeado, catchball sin acción, "Este año" duplicando texto de
> `objetivo.nm`, bono ★ invisible, sin señal de próxima revisión) — 3 propuestas de rediseño (A mínima
> cableada · B cascada en capas · C north-star + redistribuir) validadas contra research REAL (NACD
> single-page <60s · Stephen Few dashboard strategic-type · *exception-based reporting*/*management by
> exception* como el patrón textbook para mover señal fuera del header). **Ganó C** (menos ruido =
> práctica establecida, no gusto). Segunda vuelta: pedido de gráfico → research de chart-type (bullet
> graph de Few vs meter vs gauge) + skill `dataviz` → a 88-140px el bullet se degrada (bandas
> cualitativas ilegibles), gauge es anti-patrón de consenso — **meter simple gana** (fill=severidad por
> salud, track=mismo ramp más claro, cero eje/tick nuevo — el fin de la barra YA es la meta porque el
> domain es `[from,to]`). **Ejecutado:** rumbo = 3 renglones únicos (Visión · Este año con 2 meters SVG
> por breakthrough · Este trimestre) — cero repetición con el resto de la página. Cada breakthrough:
> `data-obj` clickeable (abre ficha real, ya no texto suelto — `DATA.rumbo.anio` pasó de strings a ids),
> ★ bono visible inline, contraste riesgo↔apetito en el `title` (disclosure progresiva, no ruido —
> reusa `contraste()` ya existente, cero dato nuevo). Catchball pendiente → **migró a la bandeja**
> "Espera tu decisión" (mismo molde que apetito/mezcla, abre `openArea` de la gerencia que falta).
> Dimensión ciega → **se borró del rumbo** (vivía duplicada 3 veces: rumbo+Alertas+Cambios; ahora solo
> en Alertas, que ya la cuenta mejor con chip de pares). Perspectivas 4/4 → dejó de ser hardcode
> silencioso-si-OK (sin línea propia; si algún día se rompe, es un follow-up aparte, no se construyó
> una superficie nueva para un caso que hoy no ocurre — YAGNI). Helper nuevo: `krProg(o)` (progreso 0-1
> de un KR contra su meta, domain `[from,to]`, funciona en ambas direcciones). verify.sh **30/30**
> (`nivel1-varas` reescrito: 2 `.brk` con SVG · catchball en bandeja · ciega solo en Alertas · cero
> `bajada acordada` en `.rumbo`). Verificado con ojos propios (localhost + claude-in-chrome): meters
> pintan color de salud correcto (verde=lleno o-caja, rojo=18% o-mar), ★ solo en o-caja, título hover
> con contraste real, click abre ficha del objetivo. **Pendiente que abre** (fuera de esta pasada,
> señalado por la propia research): dueño nombrado por breakthrough (dato nuevo, `dueño_ref` — decisión
> D-NN aparte, no wiring) · tendencia sesión-a-sesión por breakthrough (evaluar costo) · bowling chart
> mensual (necesita serie temporal que el mockup no tiene, hoy es snapshot único) · auditoría de volumen
> total de la página nivel-1 (NACD cuestiona 8+ paneles, fuera de alcance de este pedido).

> **★ v15.2 EJECUTADA (2026-07-27 — D-23 vía /metodo-aprende: la apuesta FORMALIZADA + vocabularios
> en módulo Método; pedido del operador "¿cuáles son todos los valores posibles? ¿los tenemos en el
> método?"):** la deuda ⚠ D-NN de apuestas/apetito quedó CERRADA como **D-23** (`sistema/schema/
> DECISIONES.md`): entidad `apuesta` (13º nodo, O1 Course of Action, `apuestas/ap-*.yaml`) + enums
> `estado_apuesta: [por-sellar, sellada, cumplida, retirada]` (re-apostar = ACCIÓN que re-versiona,
> NO estado) y `nivel_riesgo: [bajo, medio, alto]` + `config_estrategia.apetito_riesgo[{categoria,
> nivel}]` (M52). **M04 EXTENDIDA** (contradicción resuelta con arbitraje): `fuera-del-twin →
> ancla[estrategia]` — el betting del ENGAGEMENT sigue fuera; al twin entra la apuesta del CLIENTE
> sellada (m3.e0.p5) · recíprocas M04⇄M22/M52/M54. Gates: gen_metodo OK (54 cards, GRAFO regenerado)
> · gen_schema OK (NODOS_ESPERADOS +apuesta → **13 nodos**) · `go test -count=1` OK (paridad).
> Barrido "12 entidades"→13: M32 card · CLAUDE.md · cockpit-stack.md · mockup ×2. **Mockup:**
> `DATA.apuestas[].sellada:bool → estado:enum` (3 usos migrados; ficha muestra el ciclo completo +
> botón sellar solo en por-sellar) · módulo **Método** gana 2 paneles "Vocabulario" (ciclo de la
> apuesta valor-por-valor + las tres bolsas de ambición con regla de NOVEDAD) + respaldo `met-vocab`
> (M04/M54/M52, cita D-23) · conteos sync 45→**54 M-cards** (×4) y 46→54 cartas. verify.sh **30/30**
> (+`metodo-vocabularios`: 8 valores presentes + doctrina re-versión + NOVEDAD + conteos). Pasada
> visual con ojos propios (módulo Método + ficha apuesta por-sellar + respaldo met-vocab con D-23).

> **★ v15.1 EJECUTADA (2026-07-27 — auditoría DEL OPERADOR: "el respaldo promete plata que las
> apuestas no muestran" → opción A firmada, cumplir la promesa):** hallazgos A1-A4 cerrados:
> **(A1)** `DATA.apuestas[].valor{s,supuesto}` — tarjeta gana línea teal "persigue S/…"
> (`title`=supuesto) y la ficha el grupo "Valor que persigue — en dinero, no en adjetivos" con
> supuesto visible (M22 ahora VERDAD en superficie) · **(A2)** el renglón "Riesgo vs apetito" de
> `openApuesta` ahora contrasta de verdad (chip + `contraste()`) · **(A3)** apetito Shape Up por
> apuesta: `apuesta_de{t,tope}` → renglón "Apostamos: 2 trimestres · tope S/ 420k — tiempo fijo,
> alcance variable" · **(A4)** portafolio del directorio ordenado por costo-de-esperar heredado de
> la brecha (`codMes()` parsea `S/ Nk/mes|año`; cerrado al final) + "esperar: S/ 35k/mes" en crit
> por fila. `contraste`/`CATNM`/`NIVR` LIFTED a global (los usa tarjeta Y ficha — ya no viven en
> renderDirectorio). Respaldo `dir-apuestas`/`dir-portafolio` re-redactados a lo que SE VE.
> verify.sh **29/29** (+`nivel1-apuesta-plata`; OJO selector: buscar pane por 'Proyectos en curso',
> NO por 'el portafolio' — "Ambición d-EL PORTAFOLIO" del pane varas matchea primero). Fix visual
> medido: subtitle del row portafolio con `white-space:normal` inline (la regla `.dpane .cambio-row
> .ap{nowrap}` lo hacía SOLAPAR el ROI — getBoundingClientRect confirmó y verificó). Pasada visual
> con ojos propios: 4 tarjetas con plata, ficha Marina completa, portafolio ordenado sin solape.

> **★ v15 EJECUTADA (2026-07-27 — «Las varas del directorio», propuesta FIRMADA COMPLETA por el
> operador):** los 6 huecos del método en nivel 1 cerrados como VARAS al lado de lo existente (cero
> panel-sopa): **(1)** banda `.rumbo` bajo el header — visión 3-5a ▸ año ▸ trimestre (M26) + "bajada
> acordada ida-y-vuelta 3/4" + línea "dimensión ciega" M30 clickable → ficha g-post · **(2)** pane
> Apetito crece a **"Las varas"** (`dir-varas`): apetito M52 + **barra de mezcla de ambición**
> (`.mixbar` 3 segs un-solo-teal-por-alpha + `.mixmark` ▽70/▽90 objetivo) — real 82/9/9 DERIVADA por
> `mezclaReal()` (rollup apuestas+proyectos+ideas con campo `ambicion`, D-22 esquema real) ·
> **(3)** chips `.peer` (pares 45–60 d · pares 50+) en alertas con `title=` fuente+segmento+vigencia
> (M48/M23 — alerta sin benchmark serio va SIN chip) + línea "vara externa" en LA Apuesta del rail ·
> **(4)** contraste riesgo↔apetito por categoría en cada apcard (fn `contraste`: excede/al límite/
> dentro/sin definir — `riesgo_cat` nuevo en apuestas) · **(5)** bandeja +1 firma "Fijar la mezcla de
> ambición del año" (`fijar-mezcla` en ACC, gemela de fijar-apetito) + portafolio con bolsa por
> proyecto y pie "prioridad DENTRO de cada bolsa, jamás entre bolsas" (anti-patrón M54) · **(6)** rail
> sala de mando (SOLO nivel 1): bloque **"¿El sistema aguanta la ambición?"** — escalera `.madrow`
> ×5 dims ●actual/○deseado (M47, 2.4→3.4, procesos ⚠ frena) + botón "Ver el mapa por madurez" →
> gotoNivel(2)+capa salud+lente madurez (reusa el lente COBIT existente; arbitraje M47/M15 declarado
> en la ficha). RESPALDO: `dir-apetito`→**`dir-varas`** (M52+M54+M04, gap actualizado: M52 ya tiene
> carta) + `dir-rumbo` + `dir-madurez` nuevos + M48/M23 sumados a `dir-alertas` y `sala-jugada` =
> catálogo 49 entradas. Datos v15 (⚠ misma ficha D-NN pendiente): `DATA.rumbo/mezclaObjetivo/
> madurez/peers` + `ambicion` en apuestas/proyectos/ideas + `AMBICION` labels (cero jerga: operar el
> hoy · expandir · apostar al futuro). verify.sh **28/28** (+`nivel1-varas`: rumbo/ciega/segs/marks/
> peers-con-fuente/excede/sin-definir/firma-mezcla/madrow×5/anti-jerga M-NN). Verificado con ojos
> propios: nivel 1 completo, ficha dir-varas, clic ciega→Brecha, firma mezcla→toast+historial,
> botón madurez→nivel 2 con lente activo. Fix visual de la sesión: `.mixbar` margin-top 15px (las
> marcas ▽ chocaban con el label — medido con getBoundingClientRect). Pendiente que abre: bolsa
> `transformar` solo tiene 1 item (i-agente) — ¿sembrar 1 idea transformacional más? decisión del
> operador; mezcla_objetivo/apetito/rumbo/madurez a ficha D-NN vía /metodo-aprende cuando se firme.

> **★ v14.5 EJECUTADA (2026-07-26 — respaldo DENTRO de las fichas; cierra el eje "Respaldo del
> método"):** pie automático "Respaldo del método § cita" en **TODA ficha de entidad** vía UNA
> costura en `openDrawer` (deriva el tipo del eyebrow — mismo lookup del ícono TICO — y anexa
> `.resp-foot` si `RESP_TIPO[tipo]` existe y la capa está ON; cero ediciones por ficha). +11
> entradas `ent-*` (empresa/objetivo/kpi/proceso/actividad/area/puesto/rol/persona/brecha/
> capability) + reusos (sistema→z0-sistemas · proyecto→mej-proyectos · idea→ideas · apuesta→
> dir-apuestas · arnés→sala-trabajo) = catálogo 47 entradas, 16 tipos mapeados. La ficha de
> respaldo NO se auto-cita. verify.sh **27/27** (test ampliado: pie en kpi/objetivo · puesto con
> pie+roster ≥2 · apagado limpio re-abriendo la ficha ANTES del assert — el drawer viejo retiene
> la cita). OJO Edit-tool: `openDrawer` lleva el rango unicode escapado (backslash-u0300 a 036f)
> literal en el regex — parchear esa función con python heredoc; el swap de escapes del Edit no matchea. **El eje respaldo queda CERRADO en el
> mockup**; siguiente iteración = nuevo comentario del operador. Fuera de alcance (decisión, no
> deuda): carta ISO 31000/COSO (declarada horizonte — VISION §ISO) · barrido §1b (espera firma). (2026-07-26 — respaldo en TODOS los niveles, pedido del operador):** la capa
> deja de ser solo-tableros: `respBadge` ahora lleva **onclick inline** (funciona en el lienzo
> `$nodes` sin wireLinks) y la capa **nunca se atenúa** (`respAplica` murió). +18 entradas al
> catálogo `RESPALDO` (36 total): **nivel 2** = las 5 bandas del mapa de valor (estrategia BSC/OKR/
> Hoshin · cadena VSM/APQC/eventos · apoyo · gente RACI/persona/arnés · sistemas ArchiMate) +
> header nuevo del Organigrama (solo si capa ON) — z1 hereda solo (mismas bandas) · **nivel 4** =
> headers z2 (ISO 10013 n2 · BPMN · VSM) y z3 (ISO 10013 n3 · APQC · verbos) + tarjetas z3
> (scores ECRS/criterios · autoridad RACI/TLX · procedencia) + piso (reusa `sala-trabajo`) +
> tu-día · **módulos** = Método (M1/M2/M3) y Cambios (cola/versiones/historial). Tokens visibles
> ABSORBIDOS: "(M36 · WS5)" · "(RACI · M25)" · "(RTLX · M39)" · "(M23)" · "(M46)" · "(CK-24)" ·
> "(M46 · CK-30)"×2 (inspector z3 + roster de openPuesto). verify.sh **27/27** (test `respaldo-capa`
> ampliado: bandas n2 · org · z2 · z3 sin jerga · Método · Cambios; OJO assert anti-jerga contra
> `.z3card .gt`, NO contra `document.body` — el body incluye el texto del propio script del arnés
> y se auto-matchea). Pendiente restante del eje: respaldo DENTRO de las fichas de entidad
> (objetivo/proceso/kpi…) — hoy solo openPuesto§roster lo tiene.

> **★ v14.3 EJECUTADA (2026-07-26 — capa "Respaldo del método"):** pedido del operador ("referencia
> elegante de la metodología en cada punto del Directorio") → propuesta A firmada: **capa nueva en el
> rail** (`data-capa="respaldo"`, oc N2) — apagada cero ruido; encendida, cada panel pinta cita mono
> `§ fuente` (nombre común, cero jerga) + `title=` de refuerzo; **clic = ficha en drawer** (`openRespaldo`)
> con fuentes, uso en ese nivel, token M-NN SOLO ahí (procedencia, letra chica), hueco declarado si lo
> hay (apetito empresarial → ISO 31000/COSO horizonte) y enlace al módulo Método (trazabilidad).
> Catálogo `RESPALDO` (18 entradas) espejo del `met:` del schema/pasos — SSoT real methodologies.yaml.
> Cobertura: nivel 1 (7 paneles + 4 grupos de sala de mando) · nivel 3 (5) · Mejora (4, y sus citas
> ad-hoc visibles M44/CK-24/CK-29 ABSORBIDAS al respaldo). En territorio/Método/Cambios la capa se
> atenúa con razón honesta ("vivirá en las fichas — próximo paso"). GLOSARIO §1 +fila "respaldo del
> método" (firmada al aprobar la propuesta). verify.sh **27/27** (+`respaldo-capa`). Anchors:
> `v14.3 · capa RESPALDO DEL MÉTODO` · `RESPALDO` · `respBadge` · `respAplica` · `openRespaldo`.
> Pendiente que abre: portar respaldo a fichas del territorio (nivel 2) y nivel 4 (z2/z3 aún tienen
> "RACI · M25"/"M23" en gt de instrucción — barrido §1b sigue esperando firma fila por fila).

> **★ v14 EJECUTADA (2026-07-26, commit `16a8af5` — leer PRIMERO):** la FUSIÓN firmada ya vive en
> `index.html` (Artifact 🗺️, republicado): el twin es la base, el sandbox aportó estructura y QUEDA
> RETIRADO (no iterar más el 🛗). v14 = elevador de 4 niveles en el rail (1 Directorio=tablero nuevo
> `renderDirectorio` · 2 Estratégico=territorio v13 INTACTO · 3 Táctico=`renderTactico` · 4 Operativo=
> z2/z3 + tu-día) + capa de acción (catálogo `ACC` con autoridad+aprobación · ver-como deshabilita
> fuera de nivel · toda acción → `DATA.historial` visible en módulo Cambios + toast) + ciclo OKR/GPD
> (★ bono) + `DATA.apuestas/apetito` (⚠ schema pendiente D-NN) + ficha `openApuesta`. verify.sh
> **26/26** (2 tests nuevos: nivel1-directorio · nivel3-tactico) + pasada visual con ojos propios
> (niveles 1/3/4, gating Analista, GPD, historial con acción registrada). Anchors nuevos:
> `v14 · capa de ACCIÓN` · `renderDirectorio` · `renderTactico` · `gotoNivel` · `openApuesta`.
> Pendientes de dato que v14 re-confirma: apuesta/apetito como entidad + acciones · catchball ·
> metas de trimestre 1ª clase (A2). Próximo: comentarios del operador SOBRE v14 en el 🗺️.
> **v14.1/.2 (misma sesión, commits `96d3ebd`+`8a1a870`+fix visor):** el visor del Artifact mostraba
> NEGRO → el archivo ahora trae **doctype/html/head/charset propios** (ya NO envolver para servir
> local — se sirve directo) + `min-height:640px` en html/body/.app. VERIFICADO en el Artifact
> publicado con ojos propios (nivel 1 renderizando + clic en elevador navega). Ojo visor: el primer
> pintado puede tardar/necesitar un clic — Ctrl+Shift+R y un gesto; captureScreenshot del MCP puede
> timeoutear ~30s con este frame (reintentar, el top frame responde).

> **RUMBO NUEVO (2026-07-26, post-v13 — contexto de cómo se llegó):** el operador firmó navegar por **4 niveles
> de gestión** (1 Directorio · 2 Estratégico · 3 Táctico · 4 Operativo): bajar = traducción (cambia
> la pregunta y la unidad), grafo no árbol (subir≠atrás, selector al subir), niveles con
> desalineaciones visibles, trazado vertical, "ver como" con siluetas. Se valida en
> **`sandbox-4capas.html`** (mismo dir, gray-box DESECHABLE, Artifact 🛗
> `claude.ai/code/artifact/e6eef1d5-a56f-471e-83eb-36260c628764`, **v3 commit `fdf29e9`**).
> **v3 (2026-07-26, propuesta "v2 accionable" FIRMADA):** de visor a sistema operativo — panel
> derecho ficha+botonera (acciones del catálogo kinético del schema, nivel de autoridad + tipo de
> aprobación; lente ver-como fija qué ejecutas) · bandeja de decisiones por nivel · modo ciclo
> OKR/GPD-anual/mixto con ★ paga-bono (LATAM/BR) · historial de la organización · N2 objetivos
> primera clase + brechas por costo de no actuar · N3 indicadores por área (fuera de meta sin
> contramedida = alerta) + embudo de ideas + entrega-entre-áreas · N4 "tu día" + clasificación
> como oferta + arnés + se-mide-el-rol-jamás-la-persona. Pendientes de schema NUEVOS (además de
> A2 + ficha apuesta/riesgo): acciones de la apuesta · campo catchball (acuerdo ida-vuelta al
> bajar meta) · "última revisión" por nivel (candidato: derivar del historial, cero dato nuevo).
> **Al operador el twin v13 le gusta MÁS visualmente; el sandbox trae la lógica que quiere afinar.**
> Meta: iterar el sandbox con sus comentarios → portar lo firmado al twin (v14: nivel Directorio
> nuevo, partir el mapa actual en niveles 2/3, z2/z3 = nivel 4; prerequisitos de schema: A2/KR +
> ficha apuesta/riesgo). **Doctrina cero jerga:** `/GLOSARIO.md` (§1 visible firmado · §1b renombres
> de producto PENDIENTES de firma — el barrido del twin espera esa firma). Memorias:
> `twin-mockup-estado` · `no-jerga-nombres-comunes`.

> **Para la sesión que continúa.** ARRANCAR por el **dossier consolidado**:
> `docs/product/stories/cockpit/twin-territorio-mapa-zoomable/dossier/README.md` (visión, mockup
> elemento-por-elemento, decisiones+porqués, datos, construcción real, pendientes) + el tablero de
> deuda `dossier/07-auditoria-hallazgos.md`. Este HANDOFF = OPERATIVA de sesión + estado v12.
> **Objetivo de la próxima sesión:** el operador llega con MÁS COMENTARIOS sobre el Artifact
> (continuación de la tarea 2 — iterar/verificar/republicar). El plan v12 ya fue FIRMADO y ejecutado.

## Estado actual (v12.1 · publicado · commits `fa55acc` + `df09384`)

**v12 (2026-07-26) = CK-30/D-19/D-20/M46 aplicados al mockup** — plan firmado por el operador:

- **puesto ≠ rol (D-19)**: `PUESTOS` se **DERIVA** de la nómina en runtime (IIFE tras DATA) —
  **46 puestos** (14 líderes + plantilla + dueños vacantes), 27 operan la cadena. `puestosTotal`
  ya NO es constante. `personasExtra[].rol` → renombrado `.puesto`. Cadena:
  `persona ─ocupa→ PUESTO ─agrega→ ROL ─carril/RACI→ ACTIVIDAD ⊂ PROCESO`.
  Pares rol×proceso derivados del wiring: **posee** (dueño) ∪ **ejecuta** (carril) — D-19 §regla.
- **Las dos pieles = los dos planos**: Mapa de valor = plano del ROL (banda Gente = 27 puestos
  que operan la cadena, chips → `openPuesto`, link "los 46 → Organigrama ›") · **Organigrama =
  plano del PUESTO**: click = `openArea` (ficha) · dblclick = z1 · **NIVEL 4 = la nómina completa**
  (stack de puestos por área, filas → `openPuesto`, roster badge) · counter área "⛨ arneses/puestos"
  consistente (mismo set: subtree si plegada, directo si no) · crumb "Territorio" clickable.
- **arnés = REGISTRO por rol×proceso (D-20)**: `DATA.arneses` = 5 registros con
  `deriva_de{puesto,rol,proceso}` · `hash_fuente` vs `DATA.twinHash` → **estado/drift DERIVADOS**
  (`arnesEstado()`, jamás guardado) · `autonomia` L0-L5 + `autonomia_razon` · `supervisor` ·
  `verificacion_humana{que,evidencia,tiempo}` · `supervision{corridas_sem,anulaciones_sem,…}` —
  0 anulaciones ×9 semanas → warn "supervisión no ejercida = candidata a brecha" (CK-30 §2, en
  ficha, NO en DATA.brechas — decisión firmada) · `guardrails[{g,mecanismo}]` — `prompt` se pinta
  punteado/débil, `hook|permiso|sandbox` sólidos (CK-30 §8) · acciones recompilar / **suspender
  (kill-switch)** / **ratificar-autonomia** (D-20).
- **Roster del Contador General = showcase del ensamblaje**: 4 pares (p-cierre·p-pago·p-fact·p-liq),
  2 compilados (h-cierre-cont v2 = el recompilado de pm-cie · h-fact-cont v1) + **2 sin arnés** —
  el gap agéntico DENTRO del roster. Ids nuevos: `h-cob-ancob · h-cob-jef(desactualizado) ·
  h-cierre-cont · h-fact-cont · h-val-metr` (refs en pm-cie.recompila y notas de acts actualizadas).
- **Fichas**: `openPuesto` (roles+procesos · roster · dia-card CK-30 "supervisar, no ejecutar" con
  el contrato qué/evidencia/tiempo) · `openRol` re-significado (carril/posee/lo-agregan/RACI ·
  "C/I no genera skills") · `openArea` (cierra **A3**; puestos+procesos+KPIs+brechas+entrar-z1) ·
  `openArnes` = registro completo · `openPersona` ("Ocupa el puesto", área link, roster).
- **Helpers nuevos** (anchor `D-19 · puesto ≠ rol`): `coreNm · PUESTOS · puestoByNm ·
  puestoOcupante(s) · arnesDe(rol,proc) · rosterDe · paresDe · arnesEstado · rosterBadge ·
  setPiel` (dedup del toggle — usar SIEMPRE setPiel, nunca state.piel a mano). MUERTOS:
  `arnesDeRol · rolOcupante(s)` (cero refs). Badges pair-exact en cadena/apoyo/z1/z2-carril/
  z2-act/z3/openProceso/openKpi (antes eran ambiguos por nombre).
- **TICO**: +`puesto` (busto en marco) +`arnes` (escudo+check); openDrawer normaliza acentos
  (Área→area, Arnés→arnes). wireLinks: +`data-pu` +`data-area`. CSS nuevo: `.prows/.prow` (stack
  org) · `.grchip[.prompt]` (guardrails).
- **v12.1 (pulido tras pasada visual con ojos propios)**: counter área consistente · pin de brecha
  levantado proporcional al stack en lod4 · nodo área 190px en lod4 (nombres legibles) · copy z3
  inspector CK-29→"rol×proceso (M46 · CK-30)" · `›` sin huérfano en botones.

**v13 (2026-07-26) = z1 es FOCO del mapa de valor — firmado por el operador** (análisis UX de esta
sesión: z1-mundo-aparte perdía cadena/bandas/hilo; "un solo territorio, dos puertas"):

- **`renderArea` MURIÓ.** `drillArea` solo fija el lente (`escala:'z1'` + `foco`); `render()` z1
  despacha a `renderValor()`, que ahora arma el foco: procesos del área **encendidos EN SU LUGAR**
  (clase `.foco`, anillo teal-700 hairline), **vecinos inmediatos de cadena a media luz**
  (`.vecino`, 0.45 — las fronteras del área), resto `.dim` fantasma (dim genérico nuevo para
  soporte/rolchip/sysplat/chev-arrow). Objetivos que el área sostiene + puestos con pares en el
  foco + sistemas que sirven al foco: encendidos; resto dim. Pins/cinética/hilo SOLO del set
  enfocado. Cámara = `fitPts()` (bbox de foco: objetivos lit + procesos + gente lit).
- Sala de mando contextual z1 intacta + línea "El área es un LENTE…". Counter: "Foco: <área> ·
  N procesos en su lugar del mapa · M brechas". Salida: crumb Territorio → vuelve a la piel de
  origen (entraste por org, vuelves al org).
- **Ficha de área**: chips de "Procesos del subtree" ahora cargan estado (semáforo digital ·
  misional/apoyo · dueño); botón "Entrar al área (z1)" → **"Enfocar en el mapa de valor ›"**.
- CSS `.proc-node` quedó huérfano (solo lo usaba renderArea) — se dejó por diff mínimo.
- Cierra de paso el pendiente "z1 solo accesible vía piel Organigrama" (el foco se dispara desde
  cualquier ficha de área, en cualquier piel).

**Verificación hecha (v13):** `verify.sh` **24/24** (test nuevo `z1-foco-valor`: cadena presente en
z1 + ≥3 `.foco` + vecinos + fantasmas + pins solo del foco) · pasada visual con ojos propios
(foco a-tes desde org: hilo vertical objetivo→cadena→apoyo→gente→sistemas encuadrado · ficha área
chips nuevos · salida por crumb limpia). Previo v12: Node stub (46/27/roster) · 23/23 (4 tests:
piel-org+ficha-area · org-dblclick-drill · org-nivel4-puestos · roster-contador +
capa-trabajo-valor ahora exige `deriva_de`+guardrails) · pasada visual completa con claude-in-chrome
(org-lod4 zoom, las 4 fichas nuevas, ficha arnés entera, banda gente 105%, z2 carriles, z3 piso).

## Deuda del tablero (dossier/07) — estado tras v12

- **A3 (área sin ficha): CERRADA en el mockup** (openArea + data-area + 3 textos planos → links).
- **B5 (4/40 sin denominador): CERRADA** (46 derivado; portada "4/46 · 5 arneses"; los 46 dibujados
  en Organigrama nivel 4). **B3 mejorada** (Arnés ya tiene ícono; Actividad sigue subesquema).
- **A6 avanzada** solo en ficha arnés (`fuente/conf` del registro). Resto de A6 abierto.
- **ABIERTOS sin tocar**: A2 (hilo ancla a objetivo, no KR) · A4 (salud/madurez/conector
  visual-only) · A5 (4 acciones que cierran el loop sin superficie; las 3 de arnés ya declaradas
  vía D-20) · B1 · B2 · B4 · D3 (state:idea sin 01-spec).
- **PENDIENTE: sync del dossier** (02 conteos v12, 07 marcar A3/B5 resueltas con commit) — se hace
  DESPUÉS de la firma visual del operador sobre v12 (decisión de esta sesión; no adelantarse).

## OPERATIVA de sesión (aprendida a golpes — NO regresionar)

- Fuente: **`src/`** (37 partes por tema — el mapa vive en `src/README.md`). `index.html` es
  **GENERADO** por `build.py`: nunca se edita a mano; el pre-commit lo regenera y lo agrega al commit.
  Ciclo: editar la parte → `./verify.sh` (reconstruye + 33 pruebas) → commit → republicar.
  **Artifact MISMO URL siempre**:
  `https://claude.ai/code/artifact/20907d03-3979-42f2-b5c8-b33fa5e383f6`. Si el tool Artifact
  rechaza con "hasn't viewed the latest version" → WebFetch del URL primero, luego publicar con
  `url:` (así se hizo esta sesión). Favicon estable: 🗺️.
- Servir local: **desde v14.2 el archivo YA es documento completo** (doctype+charset propios) —
  `python3 -m http.server 8777` en scratchpad y servir directo, sin envolver. **El scratchpad se
  limpia entre turnos** — re-crear dir y re-levantar server si curl da 000. OJO `pkill` del server:
  usar patrón `"http[.]server 8777"` en un comando SEPARADO (si la misma línea relanza el server,
  pkill mata la propia shell — exit 144).
- claude-in-chrome: la extensión SE DESCONECTA a veces (reintentar `tabs_context_mcp
  createIfEmpty` más tarde — esta sesión volvió sola). Screenshots timeoutean ~30s tras renders
  pesados → wait 3-8s y reintentar (pasó ~8 veces, siempre salió). NO usar el crop de región
  (zoom action) — cuelga. Zoom interno: `view.z=…; view.x/y=…; applyView(false)`. Fichas por JS:
  `openPuesto('Contador General')` etc — son globales. `element.click()` MIENTE →
  `elementFromPoint`.
- **verify.sh (reparado esta sesión — Chrome ≥138 rompió el arnés bajo `--virtual-time-budget`)**:
  el script corre ANTES del primer layout → `fit()` veía stage 0×0 → z negativo → whenReady jamás
  disparaba. Remedios YA en el script: layout-pump (leer `stage.clientWidth` + escribir
  `document.title` por poll) · re-render+fit en reintentos · mclick con retry+re-fit · resets
  programáticos de estado en tests legacy · budget 40000. **Sigue flaky EN FRÍO**: "SIN RESULTADO"
  aislado = re-correr (hasta 3-4 veces); cuando arranca → estable. No diagnosticar sin
  re-correr. Esperado: **27/27** (v14.3 — +respaldo-capa). Correrlo DESDE el dir
  del prototipo; git commit SIEMPRE desde la raíz del repo (cwd persiste entre comandos Bash).
- Auditar DATA sin navegador: `new Function('document','window',…, <script>)` con Proxy-stub que
  se devuelve a sí mismo en todo get (receta dossier/07 § Recetas) — así se midió 46/27/roster.
- Ciclo: editar → verify.sh → screenshots → ojos propios (¡las fichas por dentro, no solo z0!) →
  commit por pathspec → republicar Artifact → avisar Ctrl+Shift+R (CDN tarda minutos).

## Mapa del código

> **El mapa canónico es [`src/README.md`](prtProspera/prototype-prospera/references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/src/README.md)** (qué archivo gobierna qué) — desde la
> reorganización as-code, ubicar algo es elegir un archivo, no cazar una línea. La tabla de abajo
> queda como índice de anchors de texto (siguen sirviendo para grep dentro de su parte).

| Qué | Anchor |
|---|---|
| Registros de arnés (5, D-20) + twinHash | `arneses — REGISTROS del twin` |
| Derivación PUESTOS + helpers D-19 | `D-19 · puesto ≠ rol` |
| Helpers arnés (arnesDe/rosterDe/arnesEstado/rosterBadge/setPiel) | `CK-30/D-20 · arnés = REGISTRO` |
| Banda Gente (27 chips puesto) | `banda 4 · GENTE & ARNESES` |
| Organigrama (click=ficha · dblclick=foco · lod4 stacks) | `function renderOrganigrama` |
| Foco de área v13 (z1 = mapa de valor enfocado) | `FOCO DE ÁREA` (en renderValor) · `function fitPts` |
| lod4 rowH/slotW | `function treeLayout` |
| Fichas nuevas | `function openPuesto` / `openRol` / `openArea` / `openArnes` / `openPersona` |
| Guardrails CSS | `.grchip` · stack org: `.prows` |
| Íconos nuevos | `TICO` → `puesto:` / `arnes:` |
| z3 piso rol×proceso | `EL PISO (CK-30)` |
| v14 · catálogo de acciones + autoridad + historial | `v14 · capa de ACCIÓN` (ACC · RANGO · ejecutarAccion · toast) |
| v14 · tablero Directorio (nivel 1) | `function renderDirectorio` · `bandejaRows` |
| v14 · tablero Táctico (nivel 3) | `function renderTactico` · `sinContra` · `topArea` |
| v14 · elevador + gobierno | `#niveles` (HTML rail) · `gotoNivel` · `#cicloSel` `#verComoSel` |
| v14 · ficha de apuesta | `function openApuesta` · `DATA.apuestas` / `DATA.apetito` / `DATA.historial` |
| v14 · tu-día operativo | `tuDia` (en inspectorHome, rama z2) |
| v14.3 · capa Respaldo del método | `v14.3 · capa RESPALDO DEL MÉTODO` (catálogo `RESPALDO` · `respBadge` · `respAplica` · `openRespaldo`) · CSS `.resp` · rail `data-capa="respaldo"` |

## Contexto de visión (no re-derivar — ya firmado)

- **CK-30** (LEDGER): puesto≠rol · el arnés se COMPILA por rol×proceso, se ENSAMBLA por puesto
  (roster), se CORRE por persona · las personas SUPERVISAN a los agentes y la supervisión se
  especifica Y se mide · autonomía CSA derivada del riesgo (default L1-L2) · guardrail sin
  mecanismo NO es guardrail. Fichas D-19/D-20/D-21 en `sistema/schema/DECISIONES.md` · M46 en el
  método. CK-29 sigue vigente salvo donde CK-30 invierte el sujeto ("orquesta"→"supervisa").
- Doctrina PRENTER: teal único acento; color RESERVADO a salud/severidad (mecanismo de guardrail
  se distinguió por borde punteado/sólido, NO por color). Persona = ocupante, jamás nodo medible
  (CK-24/M40). Nada visual-only sin campo/entidad detrás.
- Decisiones de sesión firmadas: banda Gente queda en 27 (rol-plane) y los 46 van al Organigrama ·
  click área=ficha, dblclick=drill · roles homónimos al puesto (cardinalidad N enseñada vía
  rol×proceso del Contador, cero renombres de carriles) · "supervisión no ejercida" = warn en
  ficha, no brecha en DATA (promoverla = decisión futura del operador).
- Memoria del agente: `vision-unificada-guardian` · `twin-mockup-estado`.
