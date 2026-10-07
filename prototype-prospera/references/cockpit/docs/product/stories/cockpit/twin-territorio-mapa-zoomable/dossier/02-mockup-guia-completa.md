# 02 · El mockup elemento por elemento — qué muestra, cómo y dónde vive

> Parte del dossier. Fuente: lectura completa de `index.html` v11 (2475 líneas, single-file
> vanilla JS/SVG). Anchors = línea/función de esa versión (drifean con ediciones — re-grepear).
> Los PORQUÉS de fondo: `03-decisiones-y-porques.md`. Los datos: `04-datos-canned.md`.

## 0 · Fundación

- **Tokens CSS** (`:root` ~L13): teal-50..900 (acento único), bg/panel/raised, ok/warn/crit + dims,
  3 fuentes PRENTER (display Coco Gothic/Jost · body Sansation/Mulish · mono JetBrains),
  `--rail:246px --insp:318px`, `color-scheme:dark`.
- **Grid**: 3 columnas `rail | main | inspector` 100vh (`.app`); responsive: <1220px oculta
  inspector, <880px oculta rail. Trama corporativa = 2 radial-gradients teal (`body::before`).
- **Estado**: TODO deriva de `state` (mod/corrida/escala/foco/piel/lienzo/activeObj/capas Set/sub/
  lod/search/insp) + `view{x,y,z}` + `const DATA`; `render()` re-renderiza entero, sin diffing.

## 0.1 · Notación por tipo — íconos dibujados (v9→v11, sesión 2026-07-25)

**Por qué existe:** el operador entró al mockup y no pudo distinguir a simple vista qué caja era
proceso/kpi/persona — "todo se ve demasiado similar". Se iteró en vivo 3 veces (ver
`03-decisiones-y-porques.md` § De la sesión 2026-07-25) hasta la versión ratificada: un **badge con
un pictograma DIBUJADO** (SVG inline, no forma abstracta ni carácter mono) que se lee sin leyenda.

**Fuente de la lógica:** no se inventó — cada entidad ya trae su tipo ArchiMate M13 en
`sistema/schema/objeto.schema.yaml` (campo `archimate:`, ancla SOLO-TIPOS — ver
`sistema/metodo/NOTACIONES.html`, "ArchiMate como METAMODELO completo DESCARTADO; sobrevive
SOLO-TIPOS como ancla de vocabulario"). El ícono es la traducción visual de ese tipo, no un invento
del mockup.

**Código** (`index.html`: `const TICO` ~L622 · helpers `tbadge`/`iico` ~L633 · `openDrawer` auto-ícono ~L2009):
- `const TICO` — diccionario `tipo → SVG inline` (**12 pictogramas — las 12 entidades del schema**,
  viewBox 14×14, `stroke`/`fill` heredan `var(--brand-hi)` vía `.tbadge/.eg-ico/.dico svg *`; cero
  color nuevo — PRENTER "un solo acento").
- `tbadge(tipo, title)` — **badge INLINE, DENTRO de la tarjeta, antes del título** (`.tbadge`,
  17×17px, `display:inline-flex`, `border:1.4px solid var(--brand)` + glow): para nodos del mapa
  (z0/z1/organigrama). **v11 · decisión 25:** antes era badge de esquina (`position:absolute;
  top:-9;left:-9`) que colgaba FUERA del borde; el operador lo quiso DENTRO — el markup ya lo tenía
  inline, bastó `position:static`. **Supersede el "badge de esquina" de la decisión 18.**
- `iico(tipo, title)` — **ícono inline chico** (`.eg-ico`, 11px, `margin-right`): chips/filas de una
  línea (kchip, funnel Mejora, `.kin`, chips de capability `[data-cap]`).
- `.dico` (**decisión 24**) — el ícono del tipo en el **header de TODA ficha**: `openDrawer` lo
  auto-inyecta parseando la 1ª palabra del eyebrow (`Persona · …` → persona). 1 cambio, cero tocar
  los 14 `open*`.
- `title` de cada uno = el tipo ArchiMate completo (tooltip on-hover) — el hover enseña la doctrina.

**Mapa entidad → ícono → dónde vive (las 12, v11):**

| Entidad | Ícono (`TICO[...]`) | Se lee como | Helper | Dónde (`class`/función) |
|---|---|---|---|---|
| objetivo | bandera | meta/hito | `tbadge` (inline) | `.obj-node` (Estrategia, z0-valor) |
| kpi | 3 barras ascendentes | métrica | `iico` | `.kchip` (header z2, chips KPI) |
| rol | personita (contorno cabeza+hombros) | quién (el puesto) | `tbadge` (inline) | `.rolchip` (Gente&arneses, z0-valor) |
| área | mini-organigrama (3 cajas+líneas) | unidad org | `tbadge` (inline) | `.area-node` (piel Organigrama) |
| proceso | chevron/flecha `▶` | flujo | `tbadge` (inline) | `.chev` (cadena) · `.soporte` (apoyo) · `.proc-node` (z1) |
| sistema | componente (rect + 2 fichas, ArchiMate App Component) | la máquina | `tbadge` (inline) | `.sysplat` (banda Sistemas) |
| brecha | triángulo de alerta + `!` | riesgo/gap | `iico` | funnel Mejora col.1 (`.fitem[data-g]`) |
| idea | foco | ocurrencia/propuesta | `iico` | funnel Mejora col.0 (`.fitem[data-idea]`) |
| proyecto_mejora | flecha cíclica (loop) | en curso/PDCA | `iico` | `.kin` (cinética) + funnel col.2/3 (`.fitem[data-pm]`) |
| **empresa** *(v11)* | edificio | la organización | `.dico` | brand del rail (`.brand .sub` → abre ficha) + header de ficha |
| **persona** *(v11)* | personita **sólida (rellena)** — ≠ rol (contorno) | el ocupante | `.dico` | header de ficha `openPersona` (CK-24: ícono, NO nodo medible; vive como ocupante del rol) |
| **capability** *(v11)* | hexágono + núcleo | qué sabe hacer (capa **Strategy**) | `iico` | chips `.chip.lk[data-cap]` (fichas sistema/proceso, borde teal-800) + header de ficha |

**Cobertura completa (v11, decisión 23):** las **12 entidades** tienen ícono. empresa/persona/capability
—antes "sin badge propio"— ahora se marcan por ícono en sus superficies existentes. Límites deliberados:
**persona** NO es nodo de mapa medible (CK-24 — el twin mide roles, no personas); **capability** no tiene
band de mapa propio aún (Strategy layer = 5º material reservado; hoy ícono + chip teal · follow-up en `06`).

**2 bugs reales cazados construyendo esto** (detalle completo + evidencia en
`03-decisiones-y-porques.md`): (1) `.obj-node:hover`/`.area-node:hover` duplicaban por error el
`transform:translate(-50%,-50%)` del wrapper centrador sobre el hijo — saltaba ~94px al hacer hover
(medido con `getBoundingClientRect`, no a ojo). (2) el badge-triángulo de proceso no se veía porque
`* { box-sizing:border-box }` (global, línea 29) rompe el truco clásico CSS de triángulo con
`width:0;height:0;border`; hace falta `box-sizing:content-box` explícito en ESE elemento.

**Material por capa (v10, decisión 22) — el segundo canal de tipo.** Además del ícono, el
**contenedor** ahora tiene un **material distinto por capa ArchiMate** (sin hue nuevo — PRENTER
teal-only): **Motivación** (objetivo/kpi/brecha/idea) = vidrio teal tenue + spine izquierdo ·
**Negocio** (proceso/rol/área) = sólido neutro elevado · **Aplicación** (sistema) = marco técnico
oscuro + barra teal arriba · **Implementación** (proyecto_mejora) = punteado teal · **Strategy**
(capability, v11) = 5º material RESERVADO (hoy sólo chip con borde teal-800, sin nodo de mapa). Bloque
CSS comentado antes de `</style>` + tokens `--mat-*` tras `--border`. Receta completa + clases +
selectores del funnel + estados que mandan: `03-decisiones-y-porques.md` **decisión 22**.

**Aire entre bandas (v11, decisión 26).** Las cajas altas (chevrons de Cadena con filas de KPI)
—centradas en su ancla— crecían hacia arriba y **tapaban el label de su propia banda** ("Cadena de
valor"…). Fix: más gap entre bandas (`Y={est:170,cad:480,apo:770,gen:965,sis:1150}`, canvas 920→1300),
Cadena empujada +48px, labels 8px más arriba, **separador de riel más visible** (`#243330`), y la
cesión dinámica Gente→Sistemas de 66→86px. Verificado: 0 solapes (5 checks). El fit por defecto baja
(más aire = arranca más lejos): **~58% con stage ancho · ~46% con la ventana en 1568px** — `fit()` es
relativo al viewport, no un número fijo. Detalle: **decisión 26**.

## 1 · Shell

### Rail izquierdo (`<aside class="rail">`)
- **Brand** "Cockpit." + sub "Twin · Desarrolladora Terranova" — el sub es CLICKEABLE →
  `openEmpresa()` (la raíz del viaje).
- **Módulos** (`#modulos`, 4 `.esc` con prefijo mono `N13/O6·7/M1·3/ISO`): Territorio · Mejora ·
  **Método · Cambios** (orden real del DOM, `index.html:538-541`). Decisión 9: el rail navega
  MÓDULOS, la escala es estado de drill.
- **Capas** (`#capas`, 6 toggles con O-ref): Estructura(O4) · Hilo(O2) · Salud(O3/5, con
  sub-lentes) · Brechas(O6) · Cinética(O7) · Trabajo(N15·17). Default ON: estructura+hilo+salud+
  brechas. **Leyenda inline pegada a su capa** (`.capa.on + .capa-leg`, estilo Felt).
- **Lentes de Salud** (`#saludsub`): radio real — digital / conf / madurez, UNO a la vez, sin
  colores de semáforo en el selector; leyenda `.sub-leg` pegada al lente activo con
  alcance+pregunta+conteos dinámicos (`subLegend()`).
- **Disable honesto**: capa sin efecto en la escala actual → `.capa.na` (opacity .35 + tooltip),
  jamás oculta. Matriz `CAPAS_APLICAN` (§3).

### Topbar (absoluta, `pointer-events:none` en contenedor)
- **idpill** — identidad As-Is (dot verde) / Corrida (dot ámbar); abre `#idmenu`: As-Is ✓ /
  Corrida demo / "＋ Nueva corrida" deshabilitado (teaser decisión 8).
- **back** "‹ Big picture" — la escalera se baja DE A UN PELDAÑO: z3→z2, resto→z0; disabled en z0.
- **crumbline** — breadcrumb por escala: `Territorio › área › proceso·lienzo › NN·verbo·instrucción`
  con links intermedios navegables.
- **chips** — fchip "hilo · <objetivo>" con ✕ (limpia `activeObj`) · **count** — contador n/N por
  vista · **búsqueda** ⌘K (spotlight: atenúa, no recorta; Escape en cascada: búsqueda → ficha →
  z0) · **piel-toggle** Mapa de valor/Organigrama (solo z0 territorio).
- **corrida-banner** — "borrador what-if · rama sobre el repo oficial · el As-Is NO se toca" +
  gate "Enviar a aprobación ›" (→ módulo Cambios) + salir. Señales redundantes: banner + tinte
  borde ámbar + idpill + topbar baja 36px.

### Stage/world
`#stage` (grab) > `#world` 1440×900 CSS-transform (pan/zoom/fit sin lib) > `svg#edges` +
`.layer#nodes` (z3) + `.layer#pins` (z4). **Regla de oro**: capa full-cover `pointer-events:none`,
hijos `auto` (bug v5.0). Pan por drag (ignora nodos interactivos), wheel zoom-al-cursor 0.3–2.

### Viewctl + minimapa + hint
- zoomctl −/%/+/⤢ (step 0.12) + lodctl "Niveles 1/2/3" (solo z0-org; plegado con rollup honesto:
  procesos/pins/arneses ruedan al ancestro visible vía `visAncestor`).
- minimapa 158×100 (solo Territorio): dots del layout + viewport; click centra.
- hint: píldora onboarding; se auto-oculta a los 9s.

### Inspector derecho
Header (eyebrow + título + ✕) + body scroll. Dos estados: `insp:'home'` = **sala de mando
contextual** / `'sel'` = ficha (`openDrawer()` + `wireLinks`). ✕ vuelve a home.

**Sala de mando por contexto** (`inspectorHome()`):
- **z0**: "Pulso · N/7 en banda" (7 dots de salud de objetivos) · **LA Apuesta** (card con dot
  live: "Cerrar Marina 87→95%", Cuesta S/35k/mes · Mueve KR margen→18% · Prio WSJF ①, botón
  "Ver el hilo que mueve ›" que fuerza piel valor + capa hilo + objetivo activo) · **Estado del
  loop** (3 proyectos PDCA clickeables) · **"El twin compila trabajo"** (4/40 puestos, 1
  desactualizado, botón "Prender la capa Trabajo ›"). Anti-trampa M1: todo atado a KR/plata,
  cero semáforo de vanidad.
- **z1**: ficha del área foco (líder/procesos/brechas/KPIs por banda) + "Roles del área — quién
  los cumple · con qué arnés" (nota frontera CK-24).
- **z2**: KPIs proceso · actividades/automatizables/eliminables/VSM · brechas activas · variante
  honesta si stub.
- **z3**: veredicto del triage (RPA/Agente + frase derivada) + acciones kinéticas
  (corregir-instrucción / enviar-idea).
- **corrida**: diff propuesto · impacto proyectado previous→new (DSO 91→75, digital 15→40%,
  payback 5m, ROI 1.8×) · gate explícito.

## 2 · Vistas

### z0 · Mapa de Valor (default — decisión 15, `renderValor()`)
5 bandas sobre un canvas **1840×1300** (`setCanvas(W,1300)` — decisión 26; el `920` de v10 quedó como
piso del `Math.max` final), etiquetadas con `bandLab()`:
1. **Estrategia** (Y=170) — 7 `.obj-node` agrupados por perspectiva BSC (labels: financiera·
   cliente·procesos·aprendizaje — "orden, no piel"); card = health-dot + nombre + KR
   `from →̶ cur → to`. Causalidad BSC = arcos DENTRO de la banda. Click = toggle hilo + ficha.
2. **Cadena de valor** (Y=432) — 8 chevrons en orden de negocio (Marketing▸Venta▸Diseño▸Ejecución▸
   Valorización▸Facturación▸Cobranza▸Postventa) con flechas ▸; card = health-dot (según lente) +
   dueño + "lienzo ›" + **mini-pasos** (micro-chevrons clip-path coloreados por triage: teal=
   rpa/agente, rojo=eliminable, gris=humano; hover = verbo — lenguaje fractal Arnesia) + KPIs
   mini (capa hilo) + ⛨ (capa trabajo). Click=ficha, dblclick=lienzo.
3. **Apoyo** (Y=640) — 9 `.soporte` ANCHOS (`w=118+areas×62` — el ancho DICE cuántas áreas cruza)
   + tag "cruza N"; wrap real por fila.
4. **Gente & arneses** (Y=762+) — `rolchip` por rol único: nombre + primer ocupante `+N` ('—' si
   vacante) + ⛨; wrap medido real. Leyenda: "métricas por rol, jamás por persona (CK-24)".
5. **Sistemas** (Y dinámica — cede si Gente crece, no se solapa) — `sysplat` ancho=96+served×34 +
   health-dot digitalización + "N proc". Leyenda: "el lakehouse (N16) los observa: ese es el pulso".

**Hilo de oro vertical**: edges `vcurve` objetivo→proceso (teal) + proceso→rol + proceso→sistema.
Tenues siempre (op .13 con capa hilo / .05 sin); click en objetivo → set encendido = drivers + sus
dueños + sus sistemas a op .75, el resto `.dim` (0.2). **Demo canónico**: click en "Caja sana en
todos los proyectos" → el hilo baja hasta Nubecont y Banca Empresas pasando por Cobranza y el
arnés v1⚠ del Jefe de Cobranza.

Brechas = pins sobre SU proceso (filtradas por objetivo activo). Cinética = tokens bajo el proceso.

### z0 · piel Organigrama (`renderOrganigrama()`)
Árbol jerárquico desde `parent` (`treeLayout()`: hojas asignan slot, padres se centran sobre
hijos). `.area-node`: nombre + líder (hit-target = el TEXTO, no la franja — fix v5.1) + badge
"rol vacante" + health-dot por lente + heatbar integrado/externo/manual (solo lente digital) +
conteo procesos + `⛨N` del subtree + `+N áreas` plegadas (LOD). Edges: jerárquico sólido +
matricial punteado (dotted-line al CFO). Brechas: 1 pin COMPACTO por área (la peor + `+N`).
Corrida: `a-tes` con `.diff` + "Δ editado". Click = drill z1.

### z1 · área (`renderArea()`)
Grilla ≤3 col de `.proc-node` del subtree: health-dot + nombre + dueño/sistemas (links) + flags
("lienzo ›", "rol vacante", "huérfano" borde warn, "★ sin ancla", "sostiene N", Δ corrida) + ⛨ +
KPIs mini. Pin de brecha INVERTIDO (`.pin.down` — cuelga DEBAJO, jamás tapa el título). Click =
ficha, dblclick = lienzo.

### z2 · lienzo caracterizado (decisión 16, `renderLienzo()`)
- **Header C1** (identidad ISO 4.4.1): eyebrow doctrinal + título + Propósito / Inicia cuando /
  Termina cuando / Clasificación APQC / Conocimiento / Criterios de control + kchips KPI + chip
  "sostiene · <objetivo>" + VSM totales (◔ toque · ⏳ espera).
- **Lanebands**: una franja por rol (carril N + rol link + ⛨).
- **Act cards**: dot de tipo BPMN-lite (humana/sistema/reunión/decisión/espera) + `NN · verbo` +
  título + toque/espera/sistemas + tags triage (rojo eliminable / teal rpa·agente) + `RTLX N` +
  `mandato` + ⛨. Click = ficha actividad, dblclick = z3.
- **Puertos SIPOC como GEOGRAFÍA**: portbox S·I a la IZQUIERDA (proveedores navegables + entradas)
  · O·C a la DERECHA; conectados al primer/último act con curva teal punteada.
- **Edges**: secuencia sólida + flujos alternos punteados warn con etiqueta de condición al 30%
  del camino ("mora dura", "sin respuesta ×3"); salto mismo-carril → etiqueta arriba de la fila.
- **Stub honesto**: proceso sin lienzo → actividades generadas de `pasosMini` con banner
  "Actividades SIN LEVANTAR — candidato M1 · entrevista + observación", conf baja.
- Zoom: `fitFlujo()` (mín 0.6 anclado al inicio del flujo — v8.2).

### z3 · instrucción de trabajo (decisión 16, `renderInstruccion()`)
- Header: `NN · verbo — título` + proceso · carril · toque/espera/triage/mandato/RTLX.
- **Fila de tareas**: portbox "⇥ insumos" → cards `.tarea` (`NN · verbo` + texto) con flechas →
  portbox "salida ⇥". Sin dato → card honesta "Instrucción SIN LEVANTAR — vive en la cabeza del
  ocupante". (Estas tareas = el `tareas[]` D-17 del schema, hoy canned.)
- **4 cards**: ① Automatizabilidad M36 — 2 scorebars RPA/Agente + chips de los 7 INPUTS (volumen/
  excepciones/datos/reglas/promptable/tolerancia/riesgo) + "los scores se COMPUTAN — jamás se
  guardan". ② Autoridad RACI (M25) + carga RTLX (M39) — "medido SOLO porque el triage la
  pre-flageó — jamás censal, jamás por persona (CK-24)" + "⚑ mandato: el triage no puede
  eliminarlo". ③ Sistemas·conocimiento·procedencia (M23) — con qué (C7) + chip confianza.
  ④ Flujos que nacen aquí — saltan con `drillActividad` a ESA instrucción ("el viaje no se corta").
- **Piso-arnés**: franja punteada teal — con arnés: "YA está compilado… se recompila, jamás se
  edita a mano"; sin arnés: "candidata a compilarse como skill (Arnesia N15 → Colab Studio N17)…
  el gap agéntico, visible". CK-29: debajo no hay más twin.

### Módulo Mejora (`renderMejora()`)
Funil 4 columnas: **0·Ideas** (estado + proponente + "← triage"; "idea↔proyecto separados (M44) ·
autoría reconocida") → **1·Brechas** rankeadas por severidad (▲sev · costo · estado · WSJF ① en
la apuesta; off-thread atenuada) → **2·Proyectos en vuelo** (PDCA · ROI · "máquina de 12 estados ·
loop-back permitido — PDCA real, no waterfall") → **3·KPI movido** (CERRADO ✓ veredicto · delta
observado · ROI real; "veredicto ∈ {movió·parcial·no-movió} contra la serie del KPI").

### Módulo Método (`renderMetodo()`)
3 columnas del engagement: M1 (Ingesta ✓ · As-Is ✓ con barra provenance 52·30·18 · Hilo ✓ ·
Validación ◐ 12/17 gate G1) · M3 (Diagnóstico ✓G2 · LA Apuesta RATIFICADA · Etapa 1 ◐) · M2
(frescura ⌛ · revisión programada · arneses ◐ 4/40 + 1 recompilación). Fila "Trazabilidad — qué
M-card sostiene cada cosa" (10 chips: M30·M26·M09·M15·M23·M16·SOMA C7·ECRS+RTLX·M36·M37·M44).

### Módulo Cambios (`renderCambios()`)
5 solicitudes SC-NN con nivel de aprobación (revisión-dueño 👁 / comité ⛔ / directa ✓+acuse):
SC-14 **recompilar arnés por drift** · SC-13 ajustar banda · SC-12 publicar mapa v2 · SC-11
corregir verbo ("transportar"→"visitar", auditado) · SC-10 registrar medición. + "Versiones
vigentes por entorno" (mapa v1 prod / v2 dev · corrida = RAMA ABIERTA "merge = pasa por ESTA
cola"). Eyebrow: "el motor versiona en git (N6), el usuario JAMÁS lo ve".

### Corrida what-if (decisión 8 — escenario-objeto)
Entra por idmenu → banner + tinte + idpill + diff (Tesorería Δ en organigrama, `Δ +1 actividad ·
portal de pagos` en z1) + inspector de impactos + gate → cola de Cambios ("el diff pasa por
aprobación — PR a N6").

### Nivel 1 · Sala del directorio — la sesión en 4 movimientos (decisión 27, `renderDirectorio()`)

La página **es la agenda de la sesión, en su orden real**. Canvas 1360 × ~2.8k px: no entra en una
pantalla **a propósito** — se recorre con la rueda (`fitPagina`: encaje al ANCHO, anclado arriba;
`⌘/Ctrl+rueda` hace zoom). Los 4 `.secband` son las paradas, y el inspector es su índice.

| Movimiento | Pregunta | Qué muestra |
|---|---|---|
| **1** | ¿Cómo nos fue? | **6 cifras del periodo** (`.ftile`: ingresos · margen bruto · gasto operativo · resultado · caja · deuda neta) con variación contra plan y contra el año pasado + acumulado del año + **estado de cierre** (`preliminar`/`cerrado`/`auditado`) · **la caja a 13 semanas** contra el piso (SVG, punto mínimo marcado, semanas bajo el piso en rojo) · **límites con el banco** y línea disponible |
| **2** | ¿A dónde vamos? | el **rumbo** (3 renglones, sin cambios) · las **apuestas** con *prometido* Y **cobrado** (barra + verificado-por) y los puntos de salud inline · las **varas** (apetito + mezcla de ambición) · el **presupuesto del año** = la mezcla en plata (asignado vs comprometido por bolsa) |
| **3** | ¿Qué puede impedirlo? | **registro de riesgos** (6, nivel derivado de probabilidad × impacto, contraste contra el apetito de SU categoría, tendencia, responsable) · **alertas que escalaron** (sin cambios) · **inversiones en curso** (3 barras por fila: avance real con marca del declarado · gastado contra presupuesto con marca del avance · ya comprometido) · **proyectos en curso** (sin cambios) · qué cambió en 30 días |
| **4** | ¿Qué decidimos? | **bandeja** — ahora con decisiones de PLATA primero (presupuesto del año · ampliar la línea · presupuesto adicional de una obra · fijar el piso de caja), cada una diciendo por qué llega al directorio (umbral de facultades) · **acuerdos de la sesión anterior** (cumplido/en curso/pendiente/vencido, con responsable y plazo) · **cerrar la sesión y generar el acta** |

**Lo que se eliminó por duplicación:** el panel "¿Avanzan las apuestas?" (repetía el punto de salud de
la propia tarjeta) → los puntos viven inline en la cabecera de las apuestas; y el inspector de nivel 1
dejó de repetir el pulso y el ciclo de mejora (viven en los movimientos 2 y 3) — ahora es el **índice
de la sesión** (4 saltos, `irMovimiento`) + la próxima jugada + twin-compila-trabajo + madurez.

**Paralelismo entre industrias (`.paral`, 7 en la página + 1 en la ficha de inversión).** Cada bloque
nuevo nombra su equivalente en otro rubro. El caso más claro es *Inversiones en curso*: el renglón
—avance real · gastado contra presupuesto · ya comprometido · entrega · margen proyectado— sirve igual
para obras (inmobiliario), ampliación de planta (manufactura), tiendas nuevas (retail), contratos
plurianuales (servicios) o líneas de producto (software). La cabecera lo declara: *las cuatro preguntas
son las mismas en cualquier industria; cambia el contenido de las filas*.

**La frontera contable (bloque C).** En pantalla, cero códigos de norma (gate en la suite). El alcance
vive en su ficha: qué lee Cockpit, qué **no hace** (no arma el juego completo de estados financieros,
no corre el cierre, no emite opinión de auditoría) y el **puente** de 6 decisiones contables que
dependen de la operación, cada una navegable al twin.

## 3 · Matriz capas × escala (`CAPAS_APLICAN`)

| Capa | z0-valor | z0-org | z1 | z2 | z3 | módulos |
|---|---|---|---|---|---|---|
| Estructura | — | edges jer.+matriciales | — | — | — | — |
| Hilo | edges verticales + spine hot/dim | lit/dim áreas | serves/huérfano + KPIs mini | kchips + objChip | — | — |
| Salud | dots por lente | dots + heatbar | dots | dot header | — | — |
| Brechas | pin por proceso | pin agregado por área | pin invertido | pins franja | — | — |
| Cinética | token bajo proceso | token bajo área | token | — | — | — |
| Trabajo | ⛨ en chevrons/roles | ⛨N subtree | ⛨ | ⛨ carril/act | piso | — |

Capa sin fila en la escala = `.na` (disable honesto). Leyenda hilo: "gris = sin dato, nunca rojo
por ausencia". Brechas: severidad = color Y tamaño (redundante, color-blind).

## 4 · Las 12+1 fichas del inspector (gramática universal, decisión 11)

Todas: secciones qué-es · hilo (links `wireLinks`) · pulso · conocimiento · acciones (kinéticas →
`accion()` → módulo Cambios si aprobación ≠ directa). Helper `prov(fuente,conf)` = "Procedencia ·
sin falsa certeza".

| Ficha | Lo distintivo |
|---|---|
| `openProceso` | SIPOC por filas S/I/P/O/C ("se deriva, no se edita" D-08/D-11 = doctrina de la APP; **en el mockup es tabla canned** — nota B2 en `04` y `07`; sin dato → "candidato M1") · objetivos que sostiene o "Huérfano" · botón lienzo |
| `openBrecha` | ataca-a · objetivo que bloquea (o "sin objetivo" warn) · costo de no hacer · "Cierra el loop (O7)" o "candidata a la Apuesta" |
| `openProyecto` | brecha/idea origen · KPI que mueve · si cerrado: delta observado + veredicto + "arnés recompilado — el cambio llegó hasta el puesto (CK-29)" · avanzar-tollgate (loop-back MASP) |
| `openActividad` | RACI/mandato/triage/RTLX · "El triage NO es una etiqueta — alimenta la fábrica" (cadena M36→M44→N15→N17) · botón z3 |
| `openKpi` | valor grande + banda + ⌛ frescura · sparkline SVG con línea de banda · cadena KPI→KR(peso)→objetivo o "⚠ Sin ancla de valor… invisible para el directorio" · acciones registrar-medición/ajustar-banda/promover-a-KR (solo rojo) |
| `openObjetivo` | KR + cadencia · hacia abajo (drivers) · qué lo bloquea · botón "Encender su hilo en el mapa" |
| `openRol` | ocupantes clickeables (o "SIN PERSONA ASIGNADA") · "Puesto & arnés (CK-29)": compilado/drift/recompilar/uso · **"El día del ocupante — orquestar, no ejecutar"** |
| `openPersona` | rol/área/vínculo (subcontratado visible) · ideas propuestas (autoría M44) · "Frontera CK-24" explícita |
| `openArnes` | estado/compilado-de/runtime "Colab Studio N17 · Claude Code local · BYO licencia"/uso · skills + KPIs `mueve` ("el hilo llega hasta el arnés") · doctrina "vista GENERADA — misma tríada SSoT→vista→gate" |
| `openSistema` | conector al lakehouse (N16) o "SIN conector — candidato" · "el lakehouse observa el SER; el repo N6 declara el DEBER-SER" |
| `openIdea` | proponente (RN-16) · origen triage · promovida-a · acciones por estado |
| `openCapability` | madurez COBIT n/5 · realizada-por · brecha |
| `openCifra` | v18 · una línea del resultado: mes vs plan vs año pasado vs acumulado · **por qué se movió** · **hacia abajo** (el proceso/objetivo/área que la produce) · estado de cierre · botón al alcance |
| `openCaja` | v18 · saldo · piso · punto más bajo de 13 semanas · línea de crédito · **límites con el banco** con su holgura · ⚠ la confianza es BAJA porque la jefatura que la firmaría está vacante |
| `openPresupuesto` | v18 · total y comprometido · **la mezcla de ambición en plata** por bolsa · **facultades** (qué monto obliga a que decida el directorio) |
| `openRiesgo` | v18 · nivel **derivado** de probabilidad × impacto · contraste contra el apetito de su categoría · tendencia · responsable · mitigación · dónde vive en el twin |
| `openAcuerdo` | v18 · estado/responsable/plazo/sesión · "un acuerdo sin responsable y sin plazo es una conversación" · entra al acta versionada |
| `openInversion` | v18 · avance real vs **declarado** · gastado vs presupuesto · comprometido · entrega vs prometida · margen proyectado · **por qué no es sólo obra**: el libro valoriza con el avance reportado |
| `openAlcanceContable` | v18 · **bloque C** — lo que Cockpit lee, lo que **jamás** reexpresa, y el **puente** de 6 decisiones contables ancladas a la operación (la norma, sólo aquí dentro, como procedencia) |
| `openEmpresa` | "El cerebro — tres cuerpos (CK-29)": Estructura/Conocimiento/Pulso/Compila 4/40 · modo estrategia OKR/GPD · "el colaborador orquesta — no ejecuta. Cockpit es la cabina" |

## 5 · Motores/helpers clave

- `semaforo(k)` — sin dato → GRIS (nunca rojo); dirección inferida (target<rojo = menor-mejor);
  derivado al leer.
- `wireLinks(c)` — wiring universal data-attr→open* (12 tipos); cualquier referencia dentro de
  una ficha abre la ficha destino. ES el "viaje que no se corta".
- `harnBadge(h)` — ⛨ vigente / ⛨⚠ desactualizado / "sin arnés" gris no-clickeable (el gap).
- `rolOcupante(s)` — por scan (líderes + nómina); vacante delatada, no inventada.
- LOD (`depth/isVis/visAncestor`) — plegado declarativo; todo rueda al ancestro visible.
- `fit` / `fitFlujo` (clamp 0.6 z2/z3) / **`fitPagina`** (v18: una página se encaja al ANCHO y se
  ancla arriba — la rueda RECORRE, no hace zoom; `clampPagina` limita el recorrido) / `refit`
  (elige por contexto) · `treeLayout()` walk · `pageView()` (módulos y tableros como página en el world).
- v18 derivados del gobierno: `varia(v,ref,dir)` (variación con el signo interpretado) ·
  `nivelRiesgo` (probabilidad × impacto) · `riesgoVsApetito` (mismo motor que `contraste` de la
  apuesta) · `cajaBajoPiso` · `desvioAvance` · `usoBolsa` — todo al leer, nada persistido.
- Suite de verificación: `verify.sh` — **34** viajes hit-tested (`elementFromPoint`), 0 errores JS.

## Nota de reconstrucción

Las doctrinas del método aparecen LITERALMENTE en el copy del mockup (M36 computa-no-guarda ·
CK-24 rol-no-persona · M44 idea≠proyecto · D-08/D-11 SIPOC derivado · M35>M36 eliminar antes que
automatizar · gris≠rojo por ausencia). Al construir la app real, ese copy es contrato, no adorno.
