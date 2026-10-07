---
story_id: twin-territorio-mapa-zoomable
type: ui-story
module: cockpit
node: N13
capability: cockpit/twin-territorio-mapa-zoomable
state: idea
links:
  story_yaml: ./story.yaml
  prototipo: ../../../../../docs/product/prototypes/twin-territorio-2026-07-20/index.html
  artifact: "https://claude.ai/code/artifact/20907d03-3979-42f2-b5c8-b33fa5e383f6"
  ledger: ../../../../../LEDGER.md
---

> **Estado: `idea`.** **Objetivo vigente de esta historia** (creció desde v1 — ver decisión 10 en
> `dossier/03-decisiones-y-porques.md`): definir, vía **UN mockup/prototipo interactivo con datos
> hardcodeados (canned)**, el **estado final completo de la solución Cockpit** — territorio (twin) +
> Mejora + Método + Cambios, las 12 entidades navegables, zoom semántico + capas — como **contrato
> visual a ratificar ANTES de construir**. No es "una vista más entre otras": es la maqueta de
> inicio-a-fin que guía la construcción real de `cockpit-ui`. (Arrancó más chico — "ver el twin como
> mapa navegable" — el `story_id` quedó ese nombre por continuidad de links; el alcance real es mayor.)
>
> **Comentarios en vivo del operador — YA entregados (v9→v11, sesión 2026-07-25).** Los "muchos
> comentarios" prometidos el 2026-07-24 se dieron: notación por tipo (íconos SVG), materiales por capa,
> 12/12 entidades con ícono, notación inline DENTRO, íconos en fichas, aire entre bandas (decisiones
> 18-26). **Próximo paso (nueva sesión):** el operador entra a **más detalle por elemento** — el cómo se
> muestra y qué se muestra de cada entidad. Ver el prompt de continuación al pie de esta nota / en el chat.
>
> **🏗 PARA CONSTRUIR EL NIVEL 1 (Directorio):** [`dossier/08-nivel-1-contrato-de-construccion.md`](08-nivel-1-contrato-de-construccion.md)
> — es el ÚNICO documento que hace falta leer entero para eso. El nivel 1 ya no necesita refinamiento
> previo: su método (M55-M59 + M52/M22/M16 enriquecidas, catálogo 59), su esquema (D-24…D-30, 20 nodos)
> y sus 12 escenarios de aceptación están cerrados y con gate verde.
>
> **📁 DOSSIER COMPLETO (2026-07-24): [`dossier/README.md`](prtProspera/prototype-prospera/references/cockpit/docs/product/stories/cockpit/twin-territorio-mapa-zoomable/dossier/README.md)** — TODO el avance
> consolidado en 7 docs (visión/doctrina · mockup elemento-por-elemento · decisiones+porqués ·
> datos+casuística · construcción real · pendientes+ideas minadas del transcript · **auditoría
> visual↔escrito**). La sesión que continúe arranca AHÍ; este 00-story queda como registro de la
> idea y sus decisiones.
>
> **🔍 AUDITORÍA 2026-07-25 → [`dossier/07-auditoria-hallazgos.md`](07-auditoria-hallazgos.md)**
> — tablero de deuda medida (mockup vivo × docs × schema × método): 6 desvíos de fondo, 5
> sobre-promesas, 8 sincronías documentales YA corregidas, 4 de método/proceso. **Siguiente = A1**
> (el arnés es la tesis CK-29 y no existe en `objeto.schema.yaml`).

## Job-To-Be-Done

**Como** equipo de Cockpit (operador + quien construye la app real)
**Quiero** UN mockup/prototipo interactivo, con datos hardcodeados, que muestre **el estado final
completo de la solución** — territorio (twin: mapa navegable con zoom semántico + capas), Mejora,
Método y Cambios, el viaje de las 12 entidades — todo en un solo artefacto navegable
**Para** tener la **maqueta de inicio a fin ya ratificada** ANTES de construir: el contrato visual
que dicta qué se construye en `cockpit-ui`, no una exploración parcial de una sola pantalla.

*(El JTBD original, más chico — "director viendo el twin como mapa navegable" — sigue siendo CIERTO
como descripción del módulo Territorio; dejó de ser el alcance completo de la historia.)*

## Por qué importa

Hoy el twin (`ui/components/negocio/NegocioView.tsx`) son **4 tabs planas** — Mapa vivo · Hilo de oro ·
Brechas · Personas — cada una una tabla/grid. Está fragmentado: el director no ve la organización como
un todo, ni cómo el hilo de oro cruza la estructura, ni dónde duelen las brechas *sobre* el organigrama.

El pedido del operador (2026-07-20, verbatim resumido): *"ver a la organización como un mapa, como un
organigrama conectado; los procesos pintados como un lienzo (inspiración: harness-studio); las distintas
capas que se pinten 'encima'; poder hacer zoom y doble-click donde corresponda y volver al big picture
en cualquier momento. Basándote en lo que tenemos para mostrar y lo que le interesa a un director."*

Es el **diferenciador visual** del producto (CK-21: Organization as Code → Organization Twin). El grafo
ya existe como dato (`sistema/schema/objeto.schema.yaml` v2); esto es su vista espacial.

---

## El concepto — "el Twin como territorio"

**Un solo mapa vivo, no 4 tabs.** La organización es un territorio que se navega por **zoom semántico**
y sobre el que se **pintan capas** (conmutador). El big picture siempre está a un gesto. Las 4 tabs de
hoy dejan de ser tabs → se vuelven **capas** sobre el mismo mapa.

Encaja con el schema: el grafo **nunca se materializa** — es `hilo(desde_id)`, se pinta caminando refs
desde un nodo foco (`objeto.schema.yaml:460`). El canvas **expande progresivamente** desde donde estás;
no hay "cargar grafo gigante". El zoom semántico ES el modelo de datos.

### Escalas (zoom semántico + doble-click + "volver" siempre)

| z | Escala | Qué se ve | Base |
|---|---|---|---|
| **z0** | **Sala de mando** (big picture) | Toda la org. Default del director. | Organigrama conectado (áreas + `reporta_a`) |
| **z1** | **Área / gerencia** | Doble-click un nodo → sus procesos, líder (rol), KPIs, brechas | proceso-cards |
| **z2** | **Proceso = lienzo** | Doble-click un proceso → canvas de swim-lanes: actividades = nodos, **carriles = roles** (`carril_ref`), edges = `secuencia_ref`/`flujos_alternos`, tiempos toque/espera | swim-lane |
| **z3** | **Nodo · detalle** | Drawer: procedencia (`fuente`/`conf`), mediciones, drill fino | — |

"Volver al big picture" = `fitView` (overview-first), gesto único, en cualquier momento (patrón de
harness-studio). Pan + wheel-zoom continuos además del drill semántico.

### El conmutador de capas (se pintan **encima** del mismo mapa)

Cada capa cae directo de un `o_code` del schema. Cada una es toggle, **derivada** (no se guarda — igual
que el schema y que harness-studio pintan overlays derivados; cero DOM extra cuando off):

| Capa | O-code | Qué pinta |
|---|---|---|
| **Estructura** *(base)* | `O4` | Organigrama matricial: áreas + roles + personas, edges `reporta_a` (jerárquico sólido / funcional punteado). El esqueleto — **el "organigrama conectado" del pedido.** |
| **Hilo de oro** | `O2` | objetivo→KR→KPI→proceso como **líneas que cruzan el mapa**. Tocás un objetivo → el hilo se enciende, el resto se atenúa (spine-always + hover-reveal). El hilo como dato de primera clase visual (`METODOLOGIA.md:76-104`). |
| **Salud** | `O3/O5` | **3 semáforos que NUNCA se fusionan** en un color: digitalización (manual/externo/integrado) · confianza (provenance 🟢🟡🔴) · madurez (COBIT 0-5). Heatmap sobre nodos. |
| **Brechas** | `O6` | Pins sobre su `against_ref` (lo que atacan), severidad = tamaño, costo = etiqueta. Filtra por el objetivo activo. |
| **Cinética / Mejora** | `O7` | proyectos_mejora en vuelo como **movimiento**: estado PDCA, qué brecha cierran, `mueve_refs`→KPI. El loop `brecha→proyecto→KPI movido`. **Ningún vendor lo cierra in-tool.** |

### La vista del director (z0) — esquiva las 2 trampas que el método nombra

z0 NO abre como "mar de rojo". Abre como **Sala de mando** anclada a plata (`M1-LEVANTAMIENTO.md:274-278`):
- **Pulso del hilo** — ¿los objetivos del directorio van? (KRs dentro de banda).
- **LA Apuesta** — UN solo próximo paso secuenciado y costeado (M3 Etapa 0: el sistema recomienda 1,
  no 50), anclado a un KR: *"cerrar esta brecha mueve KR X, cuesta ~A"*.
- **Estado del loop** — qué está cerrando (proyectos → KPI movido).

Todo atado a KR/plata → cero "semáforo de vanidad".

### z0 tiene DOS pieles (toggle) — decisión del operador

- **Territorio** (default) — el organigrama conectado con salud pintada + la Apuesta.
- **Strategy map (BSC)** — objetivos por perspectiva (financiera/cliente/procesos/aprendizaje)
  conectados por causalidad. Piel clásica de directorio. Es una **proyección declarada** en el schema
  (`objeto.schema.yaml:70`, `perspectiva_bsc`), no una vista inventada.

---

## Decisiones tomadas en esta sesión (2026-07-20)

1. **Metáfora base:** el twin = territorio; zoom semántico + conmutador de capas (vs. las 4 tabs planas).
2. **z0 default = AMBAS pieles con toggle** (Territorio ↔ Strategy map BSC) — elegido por el operador.
3. **Organigrama COMPLETO desde z0** (las 13 áreas conectadas, no solo el nivel gerencial) — pedido
   explícito del operador. Trade-off aceptado: el fit por defecto queda ~57% (texto chico); los colores
   de salud y el organigrama se leen a cualquier zoom, los nombres con zoom/drill.
4. **Cards sin relleno "plomo"** — las áreas son borde hairline sobre negro (transparente), no el
   gradiente gris `#181f1e→#141a19`. Pedido del operador (ref: /tmp/aa.png de la sesión).
5. **Dark-only robusto** — `color-scheme: dark` + fondos opacos, para que un viewer en tema claro no
   filtre blanco a los `<button>` (bug encontrado y arreglado; verificado emulando viewer claro).
6. **Deliverable = mockup interactivo HTML** (no la app real todavía) — datos canned de terranova,
   zoom+capas reales, PRENTER dark/teal. NO wirea Go/Next.
7. **Shell v2 ratificado (2026-07-20, sesión 2)** — tras investigación de UI de DTO/process-mining/
   org-design/canvas (`research-shell-ui.md`, 3 sweeps con fuentes): partición **izquierda = qué
   existe** (escala + capas con leyenda inline) · **derecha = inspector contextual** (sin selección =
   sala de mando: Pulso + Apuesta + Estado del loop; con selección = ficha del nodo) · **arriba =
   identidad As-Is/corrida + chips de filtro + contador n/N + búsqueda ⌘K** · **abajo-izq = zoom/fit +
   Niveles (LOD declarativo 1/2/3)** · **abajo-der = minimapa**. La legibilidad del org completo se
   resuelve con LOD (plegar a N niveles, todo rueda al ancestro visible: pins, semáforos, cinética),
   no con tipografía. Salud queda como color-by radio (una métrica a la vez) con leyenda pegada.
8. **Las "corridas" what-if = escenario-objeto, jamás toggle** (patrón unánime de la investigación):
   rama con nombre + ciclo Draft→Review→Merged + diff coloreado + panel de deltas + gate explícito.
   Mapeo natural: corrida = rama sobre N6 (git), aplicar = PR. En el mockup queda como teaser en el
   menú de identidad ("Nueva corrida — próximamente"); construir el eje = historia futura propia.

---

## Anclaje metodológico (los marcos as-code que lo respaldan)

Las capas y las pieles NO se inventan — el schema/método ya las declara:

- **ArchiMate** (`objeto.schema.yaml:28`, cada entidad tipada) — la **justificación** de que las capas
  son capas de arquitectura reales (Motivation/Business/Application/Implementation), no arbitrarias.
- **Los O-codes** (contexto·O2-O7) = los estratos naturales del twin (§ conmutador de capas arriba).
- **BSC strategy map** (M30, `perspectiva_bsc`) — la piel de directorio (z0 alternativa).
- **Hoshin/GPD** (M26/M41, `objetivo.parent_ref`) — el cascade directorio → área → equipo (drill del hilo).
- **VSM** (M09, `actividad.tiempos{toque,espera}`) — el overlay del lienzo z2 (desperdicio visible).
- **COBIT** (M15, `capability.assessment`) — la capa madurez.
- **PDCA/DMAIC/MASP** (M16/M42/M43, `proyecto_mejora` state machine, `objeto.schema.yaml:445-457`) — la
  capa cinética; loop-back `en-verificacion→en-ejecucion` incluido.
- **3 semáforos ortogonales** — confianza (M23 provenance) · madurez (COBIT) · digitalización (SOMA C7).
  El método es explícito: **no fusionarlos** (`M1-LEVANTAMIENTO.md:252-257`).
- **Frontera persona (CK-24)** — el twin mide roles/procesos/áreas; vista por persona nombrada solo con
  opt-in de Gobernanza. La capa Estructura muestra roles y ocupantes, NO métricas por persona.
- **El loop diferenciador** (`mejoras.md`) — `brecha → proyecto_mejora → KPI movido` con `resultado`
  real, dentro del twin. Es el "money shot" del director.

---

## Veredicto técnico (de harness-studio, repo hermano — DNA compartible)

harness-studio (`~/Proyectos/harness-studio`) ya resolvió las dos mitades:

- **z0/z1 mapa org libre y zoomable → React Flow (`@xyflow`)**. Es *exactamente* su "Organigrama"
  (node = unidad org, edge = `reporta a` bezier que sigue al arrastrar, click-sin-mover = drill). Lo
  tienen **specado pero NO construido** (`docs/product/ux.md`, `vision.md:208`) → construiríamos lo que
  ellos diseñaron.
- **z2 proceso-lienzo (swim-lanes fijos) → HTML+SVG a mano**. Es su `web/src/widgets/map-canvas/**`,
  que **ya shipearon** (custom, no React Flow). Lift candidato (repo hermano + doctrina `studio-core`
  de kernel compartido, CK-25).
- **Técnicas transplantables tal cual:** viewport por CSS-transform (pan/zoom/fit en ~100 líneas, sin
  lib); nodos DOM + edges SVG medidos por `getBoundingClientRect`+`ResizeObserver` (cero coords
  guardadas); selectores puros como SSOT de layout; conmutador de capas con *disable honesto* (capa sin
  dato = deshabilitada, no oculta); overlays derivados; spine-always + hover-reveal (revela el vecindario
  del nodo, atenúa el resto a 0.2); glyph redundante (forma+color+char, color-blind); hash deep-linkable
  (`escala·capa·selección` en URL, restaurable/compartible).

**Stack de destino:** el mockup es vanilla; la implementación real es sobre `cockpit-ui` (Next export
estático embebido en el binario `directorio`). Dependencia nueva a evaluar: `@xyflow/react` (React Flow)
para z0/z1 — cae bajo `[[cockpit-stack]]` "no nuevas deps FE sin justificación"; la justificación es el
mapa org libre-zoomable. z2 puede ser a mano (sin dep).

---

## El mockup (prototipo de esta sesión)

- **Fuente en el repo:** `docs/product/prototypes/twin-territorio-2026-07-20/src/` — 37 partes por
  tema (mapa en `src/README.md`). `index.html` es **GENERADO** por `build.py` (un solo HTML
  autocontenido, que es lo que exige el Artifact); datos canned de terranova; vanilla JS/SVG;
  PRENTER dark/teal. Editar `index.html` a mano lo pisa el pre-commit.
- **Artifact publicado (privado del operador):**
  `https://claude.ai/code/artifact/20907d03-3979-42f2-b5c8-b33fa5e383f6`
- **Para re-publicar tras editar** (nueva conversación): editar el HTML del repo y volver a llamar
  Artifact con `url` = ese artifact URL (mantiene el link).

### Qué demuestra
z0 territorio (organigrama 13 nodos, auto-layout desde `reporta_a`) · toggle Territorio↔BSC · 5 capas
conmutables · hilo-de-oro (dim/light al elegir objetivo) · salud 3 sub-semáforos · brechas pins ·
cinética (loop) · z1 drill (subtree de una gerencia) · z2 lienzo (Cobranza de cuotas, 3 carriles, 7
actividades reales con triage ECRS + RTLX) · drawer z3 (proceso/brecha/proyecto/actividad) · pan/zoom/fit.

### Datos
Shell real `~/Proyectos/terranova` (Desarrolladora Terranova S.A.C.): 7 objetivos (BSC), 13 áreas (árbol
`reporta_a`), ~17 procesos, 6 brechas (incl. `gap-postventa` = `sin-ancla-de-valor`: NPS 42→31 que ningún
KR mide — joya del diagnóstico), KPIs con banda, proceso insignia Cobranza expandido a actividades.

---

## Estado visual + fixes aplicados (self-review de la sesión)

El operador señaló "visualmente hay cositas que no se ven bien". Self-review encontró y arregló **4**:
1. **Cards blancas** en viewer claro → faltaba `color-scheme: dark` (**arreglado**, verificado emulando
   tema claro: sigue todo oscuro).
2. **Todo diminuto (50%)** → 13 nodos apretados. Iterado: primero 7 nodos legibles (81%), luego el
   operador pidió el **organigrama completo** → 13 nodos a ~57% (trade-off aceptado).
3. **Hint tapaba la Apuesta** → reposicionado.
4. **Fondo plomo en las áreas** → cards a transparente + hairline (**arreglado**).
5. **Pins z1 sobre el proceso equivocado** (el cuerpo alto llegaba a la fila de arriba) → ahora abrazan
   su propio proceso; z1 canvas dimensionado al contenido (legible ~85%).

---

## Decisiones adicionales (sesión 2, continuación)

9. **La sección "Escala" del rail se ELIMINA** (challenge del operador, razón parcial reconocida):
   el concepto de escala z0/z1/z2 sigue vivo, pero como *estado de drill* — se entra desde el mapa
   (doble-click) y se lee en el breadcrumb, nunca desde un menú lateral (ningún producto investigado
   tiene "menú de niveles"). El rail pasa a navegar **módulos**.
10. **El mockup pasa a ser el PRODUCTO COMPLETO (4 módulos + corrida)** — pedido del operador
    ("asume que este mockup es el de todo el DTO"): rail = **Territorio** (el twin, con capas) ·
    **Mejora** (funnel brecha rankeada por ROI → proyecto PDCA → **KPI movido con veredicto** — se
    agregó un proyecto cerrado `pm-cie` con `resultado{delta_observado, veredicto: movió}`) ·
    **Método** (engagement M1/M3/M2 con gates, barra de provenance, y la traza "cada capa ← una
    M-card" — metodología-as-code visible) · **Cambios** (solicitudes ISO con 3 niveles de aprobación,
    versiones dev→UAT→prod, git invisible). **Corrida demo funcional** desde el pill de identidad:
    banner ámbar + tinte de viewport + diff Δ sobre nodos + inspector "Impactos en vivo"
    (previous→new, neto, payback) + gate "Enviar a aprobación" que aterriza en la cola de Cambios.
    Capas con disable honesto fuera de Territorio.

## El viaje completo (v5 · CK-29) — toda entidad navegable + el twin que compila trabajo

**Pedido del operador (2026-07-24):** "integra un viaje completo hasta el doble click del proceso,
persona, etc — todas las entidades; repiensa todo desde nuestra visión y no te sesgues por las
decisiones". Auditoría previa contra CK-29 encontró: el mockup era CK-21 completo pero CK-29 ausente
(cero arneses, cero conocimiento, cero colaborador-orquestador; triage como etiqueta muerta).

11. **Gramática de ficha universal** — TODA entidad del schema (las 12: empresa · persona · rol ·
    area · proceso · sistema · objetivo · kpi · proyecto_mejora · idea · capability · brecha) abre
    ficha en el inspector con las mismas secciones: **qué-es** (semántica + salud) · **hilo**
    (arriba/abajo, links navegables — el viaje nunca se corta) · **pulso** (mediciones/frescura/
    conector) · **conocimiento** (know-how anclado, teaser F3) · **acciones** (capa kinética del
    schema, con nivel + aprobación; toda acción no-directa aterriza en la cola de Cambios).
    Puntos de entrada: líder del área (z0) → persona · dueño/rol (cards, KPIs, RACI) → rol ·
    sistemas → sistema · chips de objetivo → objetivo · brand → empresa · carriles z2 → rol.
12. **Capa Trabajo (N15·17)** — el twin COMPILA trabajo: badge ⛨ por puesto (vigente /
    ⚠ desactualizado si el twin cambió / gris = sin arnés, el gap visible). Ficha rol = la joya:
    Puesto & arnés (compilado-de, skills, uso agregado por rol CK-24) + **"el día del ocupante —
    orquestar, no ejecutar"** (fin-estado CK-29). Ficha arnés declara la doctrina: vista GENERADA
    del twin para un puesto, se recompila jamás se edita.
13. **La cadena triage→Arnesia cierra** — el veredicto M36 deja de ser etiqueta: actividad
    `automatizable-agente`/`aumentable` → "candidato a skill del arnés" → funil de ideas (M44,
    columna 0 nueva en Mejora, autoría reconocida RN-16) → proyecto → al cerrar, la mejora se
    **recompila al arnés** (pm-cie muestra el loop llegando al edge). Anti-drift twin→arnés en
    Cambios (SC-14: recompilar arnés por drift).
14. **Fixes de dato:** 9→12 entidades (CK-26) · 31→45 M-cards · pins con title completo.

## v6 · El Mapa de Valor (2026-07-24, ratificado "dale") — la geografía correcta

**Crítica del operador (verbatim resumido):** "los procesos usualmente son con pasos — en Arnesia los
arneses los hice como mapa de proceso; al ver los procesos de una empresa debería verlos similar…
hay procesos transversales… el BSC así no le encuentro sentido… los objetivos deberían estar en el
lienzo también, y no veo objetivos ni KPIs ni OKRs ni personas — se ven cuadrados y bloques pero no
un sistema interconectado. Sal de la caja y proponme algo mejor."

15. **La geografía deja de ser el organigrama y pasa a ser el MAPA DE VALOR** — ISO 9001 (enfoque a
    procesos) × cadena de valor Porter × strategy map, en 5 bandas sobre UN lienzo (mismo ADN de
    bandas que el map-canvas de harness-studio — fractal con el arnés):
    **Estrategia** (objetivos+KR, perspectivas BSC como orden interno — muere la piel BSC; la
    causalidad = arcos dentro de la banda) → **Cadena de valor** (8 misionales izq→der, cada proceso
    = mini-mapa con sus pasos como micro-chevrons; doble-click = lienzo) → **Apoyo** (transversales
    ANCHOS: el ancho dice cuántas áreas cruzan) → **Gente & arneses** (los **27** puestos con ocupante
    y ⛨ — v6 decía "~15", conteo real 27) → **Sistemas** (plataformas, ancho = procesos que sirven).
    **El hilo de oro = edges
    VERTICALES reales** cruzando las bandas: tenues siempre; click en un objetivo → su hilo completo
    se enciende (drivers + roles + sistemas), el resto se atenúa. El organigrama NO muere: se degrada
    a **piel secundaria** ("la estructura como lente"). Todo lo previo (capas, fichas, corrida,
    módulos, z1/z2) se conserva.

## v7-v8 · La escalera de detalle completa (2026-07-24, ratificada)

16. **La escalera de zoom se ancla a método** — APQC PCF L1-L5 × pirámide documental ISO 10013
    (M38): z0 Mapa de Valor (L1-L2, el "manual") → **z2 lienzo CARACTERIZADO** (L3-L4, el
    "procedimiento": header C1 identidad ISO 4.4.1 + **bordes SIPOC como GEOGRAFÍA** — puertos
    S·I a la izquierda del flujo, O·C a la derecha, navegables) → **z3 instrucción de trabajo**
    (L5, el "cómo": micro-flujo de tareas + dos scores M36 con inputs visibles + RACI/RTLX +
    procedencia + flujos alternos saltables) → **piso = el arnés del puesto** (CK-29: debajo de
    la última tarea no hay más twin — hay trabajo COMPILADO). Los "registros" ISO = pulso,
    transversal. Análisis previo: el SIPOC de 11 capas del SOMA (demo Prospera) fue ABSORBIDO
    por el schema capa por capa (C1→proposito/disparador · C2-C6→bordes · C7→sistema ·
    C8→rol/RACI · C9→documentos · C10→kpi · C11→brecha · IAA→M36 · Bloom→M37); la tabla-documento
    NO vuelve — cada capa es entidad viva navegable. Salud rail rediseñado como lentes color-by
    (radio real + leyenda pegada + conteo). SIPOC también como sección en la ficha (drawer).
17. **Empresa demo completa (~100 personas)** — nómina Terranova entera (14 líderes + 86
    ocupantes, área Obras con 3 proyectos), **27 puestos DIBUJADOS** en la banda Gente (chips ×N)
    sobre un universo declarado de **`puestosTotal: 40`** (el denominador de "4/40 con arnés" — 40
    son PUESTOS, no "roles": v8 los llamó roles por error),
    17 SIPOC, 11 lienzos plenos (incl. **Permisos y licencias** = el P03 del SOMA vivo en el twin,
    con g-dep bus-factor-1 y g-doc sin-procedimiento como brechas), 14 instrucciones z3 con
    tareas+M36, 11 sistemas, 12 KPIs. Casuística visible: vacante, sin-arnés, desactualizado,
    KPI stale, sin-ancla, mandato protegido, eliminable, RTLX alto, subcontratados, provisto
    externamente. Pendiente de schema: formalizar `tareas[]` bajo actividad (hoy `desc` D-08) —
    ficha D-NN vía `/metodo-aprende` cuando se ratifique.

## v18 · La sala del directorio como AGENDA (2026-07-29) — entran plata, riesgo y acuerdos

18. **La vista del directorio se reorganiza en 4 movimientos y se cierra el hueco de fondo: lo que
    había gobernaba la EJECUCIÓN de la estrategia (la segunda mitad de una agenda de directorio) y no
    tenía resultado, caja, presupuesto ni acuerdos.** Auditoría de 13 hallazgos sin defender lo hecho
    (`dossier/07` § H). Entra: ① resultado del periodo (6 cifras contra plan y año anterior, con
    **estado de cierre**) + caja a 13 semanas contra el piso + límites con el banco · ② **valor
    cobrado** por apuesta (antes prometía y nunca rendía — el propio "sin ancla de valor" cometido
    arriba) + **presupuesto** = la mezcla de ambición en plata + facultades por monto · ③ **registro
    de riesgos** contra el apetito ya firmado + **inversiones en curso** (avance real vs declarado ·
    gasto vs presupuesto · comprometido) · ④ bandeja con **decisiones de plata** que llegan por umbral
    + **acuerdos de la sesión anterior** + **el acta**.
    **Frontera contable (decisión de alcance):** Cockpit **no reexpresa** los estados financieros —
    los **lee** con su estado de cierre y los **baja al proceso/área que los produce**; el juego
    completo, las notas y el dictamen viven en el sistema contable. Se declara explícitamente en una
    ficha propia, con el **puente** de 6 decisiones contables ancladas al twin (la joya: el avance
    real 87% vs declarado 95% ES el input de si lo construido está bien valorizado). El código de la
    norma vive SOLO dentro de la ficha, como procedencia — cero jerga contable en pantalla.
    **Generalidad entre industrias** (pedido del operador): cada bloque nuevo nombra su equivalente en
    manufactura, retail, servicios, software, banca o salud; las cuatro preguntas de la sesión son las
    mismas en cualquier rubro, cambia el contenido de las filas.
    **Techo técnico roto:** una vista de módulo se encajaba en ancho **y** alto, así que cada panel
    nuevo encogía la letra de todos — se separó el gesto (una página es un documento: encaje al ancho,
    anclado arriba, la rueda recorre). Detalle completo: `dossier/03` decisión 27.

## v19 · El directorio decide, la gerencia resuelve (2026-07-29) — el hilo medido de verdad

19. **Auditoría de la estrategia contra el método (40 hallazgos, K1-K40) y su corrección.** Pedido del
    operador: comparar la estrategia con `/metodo`, verificar la coherencia de los objetivos del
    directorio, con foco en **KPIs y niveles de madurez**; después, corregir todo *"sabiendo que los
    usuarios son el gerente general y los gerentes, y que a través de nuestras acciones diarias debemos
    resolver todo lo que se muestra en directorio"*. Ese encargo fijó la doctrina que ordena el resto:
    **el directorio decide, la gerencia resuelve, y nada del nivel 1 se queda sin bajada.**
    - **La bajada es dato** (D-35): las metas del directorio se abren como metas de UNA gerencia, con
      el rol que responde y la sesión donde el gerente las aceptó. *Sin bajar* y *asignada sin acordar*
      son dos estados visibles que llegan solos a la bandeja — antes eran un contador escrito a mano.
    - **El hilo ancla al contrato, no al objetivo** (cierra A2, abierto desde julio): `kpi.kr` en vez de
      `kpi.obj`, `krs[]` como lista, y el valor del contrato **leído de la serie** (D-34). El caso que
      lo prueba: «caja sana» leía verde con la caja cayendo bajo el piso.
    - **La vara externa sale del eje vertical** (D-31): el tablero afirmaba un rango de cobranza que el
      propio método prohíbe afirmar. Ahora cada indicador apunta a su unidad de nicho y hereda su
      confianza; sin rango validado se muestra la condición.
    - **Dos escaleras de madurez, cada una con su vara** (D-32/D-33): muere `area.madurez` (se deriva),
      sin `nivel_deseado` no hay brecha, y la escalera del sistema de gestión gana ficha, evidencia del
      twin y sesión de evaluación.
    - **Lo que bajó a lo táctico:** el portafolio completo, las alertas en detalle, el registro de
      avance de inversiones y el seguimiento semanal de acuerdos. El nivel 1 sigue por excepción y cada
      fila dice por qué sube — o por qué se queda abajo.
    - **M52 promovida** `horizonte → ancla` (cierra H15): una carta que contradice al producto vigente
      no es un horizonte, es drift.
    Detalle completo: `dossier/07 § K` (tablero de 40 filas) · `dossier/08 § 0.bis` (la regla de
    construcción) · fichas **D-31…D-36** en `sistema/schema/DECISIONES.md`.

## ⚠ PENDIENTE — ajustes del operador (continuar en conversación nueva)

**El operador sigue iterando el mockup.** Estado tras la sesión 2 (shell v2):
- ~~Legibilidad del organigrama completo a zoom lejano~~ → **resuelto** con el control Niveles
  (LOD declarativo 1/2/3): default = las 13 áreas; Niveles 2 = 7 nodos legibles con rollup honesto.
- Comentarios visuales del operador sobre el shell v2 (acaba de re-publicarse — feedback pendiente).
- Decisión futura: refinar la historia del eje "corridas" what-if (ver decisión 8).

**Cómo continuar:** leer esta historia + abrir el prototipo (`docs/product/prototypes/twin-territorio-2026-07-20/index.html`)
o el artifact; aplicar los comentarios editando el HTML; re-publicar al mismo artifact URL.

---

## Relación con otras historias (anti-duplicación)

Esta historia es el **frame espacial** (paradigma de visualización de N13). NO recrea los lentes — los
**re-hospeda como capas**:
- **`cruce-estructura-operacion-indicadores`** (refining) = el lente **Indicadores** (KPI semáforo por
  banda, cadena kpi→KR→objetivo). Se vuelve la **capa Hilo/Indicadores** dentro del territorio. Su
  `derivaSemaforo` (Go) + `ui/lib/indicadores.ts` se consumen tal cual — no se duplican.
- **`brecha-proyecto-ciclo-vida`** (F1.1) = la **capa Cinética** (O7, loop brecha→proyecto→KPI).
- **`persona-puesto-primera-clase`** (done, CK-12) = la base O4 de la capa Estructura.
- **`negocio-yaml-proyeccion-generada`** = la proyección objeto→negocio (`go/negocio_projection.go`, CK-27)
  que ya alimenta los lentes actuales (Mapa/Hilo/Brechas del `NegocioView.tsx`).
- **Supersede** (a definir en refinamiento) el arreglo de **4 tabs planas** de `NegocioView.tsx` — o
  convive: el territorio como shell, los componentes de tab existentes (`MapaTab`, `HiloTab`,
  `BrechasTab`, `PersonasTab`, `ProcesoDrawer`, `SEMAFORO`) como fuentes de las capas. Decisión de scope
  para el refinamiento.

### Prior-art scan (anti-duplication-refining)
- `~/Proyectos/harness-studio` `web/src/widgets/map-canvas/**` — técnica de canvas/lienzo (lift candidato).
- `ui/components/negocio/NegocioView.tsx` — los 4 lentes actuales (MapaTab/HiloTab/BrechasTab/PersonasTab
  + ProcesoDrawer + SEMAFORO) = fuente de las capas, no se recrean.
- `go/negocio_projection.go` + `go/objeto.go` (`/api/objeto`, `/api/negocio`) — el dato, sin endpoint nuevo.
- `sistema/schema/objeto.schema.yaml` v2 — el grafo (O2-O7) + `relaciones` (el modelo de aristas del hilo).
- `.claude/rules/ui-design-system.md` — PRENTER (todo se construye contra el banco `ds/`).

---

## Out of scope (explícito, para el refinamiento)

- El **motor de indicadores** (semáforo/rollup real) — ya es `cruce-estructura-operacion-indicadores`.
- El **ciclo de vida brecha→proyecto** — ya es `brecha-proyecto-ciclo-vida`.
- El **lakehouse** (dato de operación real, N16) — F1.4; el twin lee el golden-fixture (CK-23).
- **Auth/niveles de acceso** que gobiernan qué capa ve cada nivel — `auth-niveles-acceso-policy-as-data`.
- Los **proyectos_mejora** del mockup son ILUSTRATIVOS (el fixture no los tiene aún).
- **Los estados financieros completos** (juego completo, notas, cierre contable, opinión de auditoría)
  — decisión de frontera firmada en v18: Cockpit **lee** un puñado de cifras con su estado de cierre y
  las **baja al proceso que las produce**; no reexpresa nada. Detalle: `dossier/08 § 0`.
- **Exposición cambiaria**, **aterrizaje proyectado a fin de año**, **cumplimiento como superficie
  propia** y **personas a nivel directorio** — hallazgos H7/H10/H11/H12 del tablero `dossier/07`,
  fuera del alcance de v18 por decisión, no por olvido.

## Riesgos / Asunciones

- **Riesgo:** re-frame de toda la superficie /negocio = scope grande. **Mitigación:** construir el shell
  territorio + zoom primero, migrar lentes uno a uno (las capas ya existen como componentes de tab).
- **Riesgo:** React Flow como dep nueva FE (`[[cockpit-stack]]`). **Mitigación:** justificado por el
  mapa org libre-zoomable; z2 puede ser sin dep (a mano). Evaluar en refinamiento.
- **Asunción:** el organigrama completo (13 nodos) a ~57% es aceptable con level-of-detail por zoom
  (pendiente de confirmar con el operador).
- **Asunción:** las 5 capas ↔ O-codes son la taxonomía correcta (respaldada por ArchiMate + método).

## Próximo paso

**Dos caminos, ya desacoplados:**

- **Construir el nivel 1** — no espera nada: `dossier/08` es el contrato (entidades · panel↔dato ·
  acciones · escenarios · casuística del fixture). Camino corto: poblar el golden fixture → extender
  `go/objeto.go` con las 7 carpetas nuevas → los 4 movimientos contra el banco PRENTER → live-verify
  ejerciendo acciones reales.
- **Seguir iterando el mockup** con los comentarios del operador, sobre
  `docs/product/prototypes/twin-territorio-2026-07-20/src/` (nunca `index.html`) → re-publicar al artifact URL.

**Espera firma del operador:** la promoción de M52 (`horizonte → ancla`) — el nivel 1 ya materializa
apetito + registro de riesgos mientras la carta sigue diciendo "no en el MVP". Es decisión de dogma.

*(histórico)* Continuar con los comentarios visuales del operador iterando sobre el
prototipo (`docs/product/prototypes/twin-territorio-2026-07-20/index.html` → re-publicar al artifact URL).
Cuando el concepto visual cierre → refinar (`/po-ux` a mano: `01-spec.md` con § Mapa funcional + §
Pantallas + scenarios) y decidir el scope vs. `cruce-estructura-operacion-indicadores` y el arreglo de
tabs actual. Ratificación del operador + (si es decisión de fondo) ficha CK-NN.

## Changelog

- v1 2026-07-20 — captura del concepto "Twin como territorio" (idea): metáfora, zoom semántico z0-z3,
  conmutador de 5 capas ↔ O-codes, doble piel z0 (Territorio/BSC), anclaje metodológico, veredicto
  técnico (React Flow + swim-lane, harness-studio hermano), mockup interactivo publicado + iterado
  (fixes: dark-only, org completo 13 nodos, sin plomo, legibilidad z1). PENDIENTE: más ajustes visuales
  del operador en conversación nueva.
- v2 2026-07-20 (sesión 2) — **shell v2** ratificado por el operador tras investigación de UI
  (`research-shell-ui.md`: DTO/process mining · org-design what-if · gramática canvas/GIS/node-graph):
  rail = solo escala+capas con leyenda inline · inspector derecho contextual (home = Pulso/Apuesta/Loop)
  · top bar identidad As-Is + chips + contador + búsqueda ⌘K · LOD Niveles 1/2/3 con rollup (resuelve
  la legibilidad) · minimapa · teaser "Nueva corrida". Decisiones 7-8. Mockup re-publicado al mismo
  artifact y verificado en navegador (z0/z1/z2, BSC, capas, búsqueda, tema claro emulado, 0 errores).
- v3 2026-07-20 (sesión 2) — **auditoría contra el pool de historias** (26 historias barridas; mandatos
  z1/z2 = esta historia + `cruce-estructura-operacion-indicadores`; alimentadoras: brecha-proyecto,
  persona-puesto CK-12, captura-manual, rol-area-real; restricción transversal CK-24) → 6 gaps cerrados
  en el mockup: (1) **hilo MEDIDO**: motor `semaforo()` derivado al leer (gris = sin dato, nunca rojo
  por ausencia) — 9 KPIs con banda/mediciones; filas KPI en proc-cards z1, chips en header z2, drawer
  KPI con sparkline + banda + cadena KPI→KR(peso)→objetivo + caso "⚠ sin ancla de valor" (k-nps) +
  frescura vencida (k-vis ⌛); (2) **z2 con edges reales**: lienzo re-hecho en el world — bandas de
  carril + secuencia sólida + flujos alternos punteados con condición ("mora dura", "sin respuesta ×3");
  (3) **cinética en z1** (token sobre el proceso que mejora); (4) **capas honestas**: pintan en z2
  (brecha pin + chips hilo + dot salud) y capa sin efecto en la escala → atenuada con razón (disable
  honesto); (5) **lente personas en z1**: roles del área con ocupante por scan + "SIN PERSONA ASIGNADA"
  + nota CK-24 + tag rol-vacante en cards; (6) menores: severidad = tamaño en pins, VSM totales,
  RACI/mandato/procedencia en drawer actividad. Re-publicado + verificado (0 errores JS).
- v4 2026-07-20 (sesión 2) — **producto completo**: rail Escala → rail **Módulos** (decisión 9 — la
  escala es estado de drill, no menú); módulos Mejora (loop con KPI-movido + veredicto) · Método
  (M1/M3/M2 + gates + traza M-cards) · Cambios (ISO, git invisible); **corrida what-if demo**
  (banner + tinte + Δ diffs + impactos previous→new + gate → cola de Cambios). Decisión 10.
  Re-publicado + verificado módulo por módulo (0 errores JS).
- v5 2026-07-24 — **el viaje completo (CK-29)**: auditoría contra la visión unificada (el twin es un
  cerebro que compila trabajo) → decisiones 11-14: gramática de ficha universal (las 12 entidades
  navegables, hilo que nunca se corta, acciones kinéticas del schema con nivel+aprobación), capa
  **Trabajo** (arneses por puesto: vigente/desactualizado/sin — ficha rol con "el día del ocupante",
  ficha arnés con doctrina vista-generada + drift + recompilar), cadena **triage→funil→Arnesia**
  (columna Ideas M44 en Mejora; SC-14 recompilación en Cambios; pm-cie recompila al arnés al cerrar),
  fichas nuevas persona/rol/arnés/sistema/objetivo/idea/capability/empresa, bloque "el twin compila
  trabajo" en sala de mando, fixes 12 entidades/45 M-cards. Verificado headless (8 estados, capturas).
- v5.1 2026-07-24 — fix crítico de interacción: la capa de pins (div full-cover z4) se tragaba TODOS
  los clicks reales del mouse (`pointer-events`); presente desde el shell v2 — las verificaciones
  previas usaban dispatch directo que salta el hit-testing. Suite nueva de 15 viajes con
  `elementFromPoint` (hit-testing real): 15/15. + verificación en el artifact REAL vía Chrome del
  operador (claude-in-chrome): drill confirmado con eventos confiables.
- v6 2026-07-24 — **El Mapa de Valor** (decisión 15, ratificada): geografía nueva de 5 bandas con el
  hilo de oro como edges verticales; organigrama → piel-lente; BSC absorbido por la banda Estrategia;
  pasos mini por proceso (lenguaje fractal Arnesia); transversales por ancho. Suite v6 hit-tested:
  9/9, 0 errores JS.
- v7 2026-07-24 — Salud como **lentes color-by** (radio real, leyenda pegada al lente activo con
  alcance+pregunta+conteo — mata los puntos-semáforo falsos) · **SIPOC en ficha** de todo proceso
  (proyección de bordes D-08/D-11, navegable) · **lienzo universal** (dblclick cualquier proceso;
  honesto sin actividades). Suite 13/13.
- v8 2026-07-24 — **la escalera completa + empresa entera** (decisiones 16-17): z2 caracterizado
  (C1 + puertos SIPOC como geografía) · z3 instrucción de trabajo (tareas · M36 dos scores con
  inputs · RACI · flujos saltables · piso = arnés CK-29) · nómina 100 personas · 11 lienzos plenos
  (Permisos = P03 del SOMA) · 14 instrucciones z3 · brechas g-dep/g-doc. Suite 19/19, 0 errores JS.
- v9 2026-07-25 — **primera sesión con comentarios en vivo del operador** (cierra la deuda #1 de
  `dossier/06-pendientes-e-ideas.md`; detalle completo en `dossier/03-decisiones-y-porques.md`
  decisiones 18-21): 2 bugs de interacción reales cazados con `getBoundingClientRect` (hover-jump de
  -94px en objetivo/área por `transform` duplicado; tarjetas de Estrategia tapando sus labels por
  margen ~0) · **notación por tipo** iterada 3 veces hasta la versión ratificable — glifo mono
  (rechazado, ilegible) → badge de forma abstracta (rechazado, "no me dice nada") → **badge con
  pictograma SVG dibujado** (bandera/barras/personita/mini-organigrama/flecha/componente/alerta/
  foco/loop), anclado al `archimate:` que ya vive en el schema (M13). Pendiente: "me gusta" final
  del operador + republicar al Artifact. Verificado con crops reales (`getBoundingClientRect` +
  screenshots), 0 errores JS en las 4 vistas tocadas.
- v10 2026-07-25 — **materiales por capa ArchiMate** (decisión 22, ratificada "me gusta V2"): el
  operador pidió distinguir el tipo de entidad **más allá del ícono**, por el recuadro. Auditoría del
  DOM confirmó el root cause (casi todos los contenedores = mismo material `#1f2826/#141a19`). En vez
  de color-literal-por-tipo (rompía PRENTER "un solo acento" + chocaba con el semáforo de salud y con
  el teal de "seleccionado" — se avisó ANTES de aplicar), se codificó el tipo por **valor+forma+borde
  agrupado por capa ArchiMate**: 4 materiales (Motivación=vidrio teal+spine · Negocio=sólido neutro ·
  Aplicación=marco técnico+barra teal · Implementación=punteado teal), el ícono desambigua dentro de
  la capa. Horneado en `index.html` (tokens `--mat-*` + bloque CSS); verificado en recarga fresca
  (sin inyección) — estados hot/serves/diff siguen mandando por especificidad. Receta de réplica
  completa en `dossier/03-decisiones-y-porques.md` decisión 22. Pendiente: republicar al Artifact.
- v11 2026-07-25 — **cobertura total de tipos + notación DENTRO + aire** (decisiones 23-26, sesión
  cont. con comentarios en vivo del operador sobre el Artifact): (23) los 3 tipos "sin badge propio"
  → ícono + superficie — empresa=edificio · persona=personita sólida (CK-24: ícono ≠ nodo medible) ·
  capability=hexágono (capa Strategy, chip teal; 5º material reservado) — **cobertura 12/12**; (24)
  ícono de tipo en el header de TODA ficha (`.dico`, `openDrawer` auto-parsea el eyebrow — 1 cambio,
  0 callers); (25) el badge del tipo pasa de esquina-colgando-afuera a **inline DENTRO** de la tarjeta
  (`position:static`) — **supersede la posición de la decisión 18**; (26) **aire entre bandas** — las
  cajas altas tapaban los labels de riel (center-anchoring) → más gap (canvas 920→1300), Cadena +48px,
  separadores más visibles, 5 checks de solape = false. Artifact republicado (v11). Auditoría de
  consistencia de todo el dossier (02 §0.1 / 03 / 06 / 00) — sin contradicciones, refleja el mockup real.
- v11.1 2026-07-25 — **auditoría visual ↔ escrito** (pedido del operador; vía `/metodo`: GRAFO →
  M32·M36·M40·M30). Se midió el mockup vivo (DOM + `const DATA` evaluado en Node con stub de DOM)
  contra los 7 docs, `objeto.schema.yaml` y el catálogo de métodos. Resultado en el tablero nuevo
  **`dossier/07-auditoria-hallazgos.md`**: 6 desvíos de fondo (**A1** el arnés es la tesis CK-29 y
  no existe como entidad del schema · **A2** el hilo se ancla al objetivo en vez de al KR · **A3**
  `area` sin ficha — "las 12 navegables" son 11 · **A4** 3 campos visual-only (`objetivo.salud`,
  `area.madurez`, `sistema.conector`) · **A5** las 4 acciones que cierran el loop sin superficie ·
  **A6** provenance M23 en 3/13 fichas), 5 sobre-promesas (B), 4 de método/proceso (**D1** M32 dice
  "9 entidades" · **D2** `CLAUDE.md` idem · **D3** `state: idea` sin `01-spec` · **D4** M40/M30
  limpios). **8 discrepancias doc↔mockup (C1-C8) corregidas en el acto**: huérfanos 6→8 ·
  `g-mar`→`g-dso` · "~15"→27 puestos · "40 roles"→`puestosTotal: 40` (puestos) · canvas 920→1300 ·
  v9/2439→v11/2475 líneas · orden real de módulos · fit 58% = relativo al viewport. **Cero cambio al
  mockup — sólo docs.** Siguiente: **A1**.
- v18 2026-07-29 — **la sala del directorio como agenda de 4 movimientos** (decisión 18 · dossier/03
  decisión 27): auditoría de 13 hallazgos pedida por el operador ("¿les interesa lo que hay? ¿debería
  verse el estado de resultados y otros elementos NIIF?") → entran **resultado del periodo** (6 cifras
  con plan/año anterior/acumulado y estado de cierre), **caja** (13 semanas contra el piso, límites con
  el banco, confianza degradada por la jefatura vacante), **presupuesto** (la mezcla en plata) +
  **facultades**, **valor cobrado** por apuesta, **registro de riesgos** contra el apetito,
  **inversiones en curso** (avance real vs declarado), **acuerdos** de la sesión anterior y el **acta**;
  bandeja re-hecha con decisiones de plata que llegan por umbral. **Bloque C:** alcance contable
  explícito (Cockpit enlaza, jamás reexpresa) + puente de 6 decisiones contables ancladas al twin, con
  la norma sólo como procedencia dentro de la ficha. Se eliminó el panel duplicado "¿Avanzan las
  apuestas?" y el inspector de nivel 1 pasó a ser el índice de la sesión. `fit` de página separado
  (`fitPagina` + rueda que recorre) — sin eso, cada panel nuevo encogía la letra de todos.
  7 líneas de equivalencia entre industrias. Partes nuevas: `36-data-gobierno.js`,
  `19b-directorio.css`, `74-fichas-gobierno.js`. Suite **34/34**, 0 errores JS.
- v18.1 2026-07-29 — **el nivel 1 pasa de mockup a contrato construible**: `/metodo-aprende` con el
  protocolo completo → **5 cartas nuevas** (M55 reporte financiero como fuente · M56 liquidez ·
  M57 presupuesto · M58 gobierno de la sesión · M59 valor ganado) + **3 enriquecidas** (M52 gana el
  registro de riesgos, M22 la realización prometido↔cobrado, M16 nombra cl.9.3), catálogo 54→**59**
  con recíprocas cableadas y gate verde; **7 entidades nuevas + 2 extensiones** en el esquema
  (**D-24** riesgo · **D-25** sesion+acuerdo+facultades · **D-26** periodo+cifra · **D-27**
  proyeccion_caja · **D-28** presupuesto · **D-29** inversion · **D-30** apuesta.valor.cobrado),
  13→**20 nodos**, 41 relaciones, 32 acciones, 15 invariantes nuevos, `gen_schema.py` y
  `go test ./...` verdes; **`dossier/08-nivel-1-contrato-de-construccion.md`** (frontera · panel↔dato ·
  estados vacíos honestos · derivados · 17 acciones · 12 escenarios · casuística del fixture ·
  trazabilidad). Barrido de conteos stale (12/13 entidades · 31/54 cartas) en CLAUDE.md, las 2 reglas,
  el seam, VISION, M32, el mockup y su suite. Suite **34/34**. Abierto y con firma pendiente: la
  promoción de M52 `horizonte → ancla`.
- v19 2026-07-29 — **el directorio decide, la gerencia resuelve** (decisión 19 · auditoría K1-K40 en
  `dossier/07 § K`, 28 de 40 hallazgos cerrados): **la bajada como dato** (5 bajadas con gerencia, rol
  y sesión de acuerdo; los casos *sin bajar* y *asignada sin acordar* llegan solos a la bandeja) ·
  **el hilo ancla al contrato** (`krs[]` lista · `kpi.kr` · el valor se lee de la serie · pesos que
  suman 1 · 3 indicadores nuevos para los contratos que no tenían serie) · **dirección declarada** y
  banda de tres tramos · **la vara externa sale del nicho** (muere `DATA.peers`; N-IMM-07/08 nuevas) ·
  **dos escaleras de madurez con su vara** (muere `area.madurez`, se deriva; autoevaluación con
  evidencia y sesión) · **todo lo del nivel 1 declara dónde se resuelve** (cifras, alertas, riesgos,
  portafolio) y **el nivel 3 abre con lo que el directorio dejó** · catálogo de acciones alineado
  (6 declaradas, 5 renombradas, 13 cableadas) · **M52 promovida a `ancla`**. Esquema **D-31…D-36**
  (20 nodos · 47 relaciones · 40 acciones) · método 59 cartas con M15/M21/M26/M47/M48/M52 enriquecidas ·
  nichos 17→19 unidades. Suite **40/40** con 6 checks nuevos que impiden que cada corrección vuelva.
