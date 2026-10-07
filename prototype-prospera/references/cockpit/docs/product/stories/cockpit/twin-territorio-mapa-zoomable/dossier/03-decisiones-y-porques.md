# 03 · Las decisiones ratificadas y sus porqués

> Parte del dossier. Las 17 decisiones del mockup (ratificadas por el operador entre 2026-07-20 y
> 2026-07-24) + las 2 del schema (D-17/D-18). Cada una: QUÉ se decidió · POR QUÉ · qué reemplazó.
> Fuente: `00-story.md` + LEDGER + conversaciones 2026-07-20/24. **Ninguna se re-litiga sin el operador.**

## Del concepto (sesión 2026-07-20)

1. **Twin = territorio; zoom semántico + capas** (vs 4 tabs planas). Por qué: el director no ve la
   organización como un todo en tabs; el grafo del schema ya ES navegable por refs (`hilo(desde_id)`,
   expansión progresiva — el zoom semántico es el modelo de datos, no un efecto).
2. **z0 con dos pieles toggle** (Territorio ↔ BSC). *Superseded parcial por decisión 15:* la piel
   BSC muere absorbida por la banda Estrategia; el organigrama queda como piel-lente secundaria.
3. **Organigrama COMPLETO desde z0** (13 áreas, no solo gerencial) — pedido explícito. Trade-off
   aceptado: fit ~57%, texto chico; colores/estructura se leen a cualquier zoom, nombres con
   zoom/drill. *Resuelto después con LOD (decisión 7).* Mismo trade-off que luego justifica el
   clamp de z2/z3 (v8.2).
4. **Cards sin relleno "plomo"** — borde hairline sobre negro transparente, no gradiente gris.
5. **Dark-only robusto** — `color-scheme: dark` + fondos opacos (bug real: viewer en tema claro
   filtraba blanco a los `<button>`).
6. **Deliverable = mockup HTML interactivo** (no la app) — datos canned, zoom+capas reales, PRENTER.
7. **Shell v2** (tras investigación DTO/process-mining/org-design/canvas con fuentes,
   `research-shell-ui.md`): izquierda = qué existe (capas con leyenda inline pegada, estilo Felt) ·
   derecha = inspector contextual (sin selección = sala de mando) · arriba = identidad + chips +
   contador + ⌘K · abajo-izq = zoom/fit + **LOD Niveles 1/2/3** (la legibilidad se resuelve
   plegando con rollup honesto, no con tipografía) · abajo-der = minimapa.
8. **Corridas what-if = escenario-objeto, JAMÁS toggle** (patrón unánime de la investigación):
   rama con nombre + Draft→Review→Merged + diff coloreado + gate explícito. Mapeo natural: corrida
   = rama sobre N6 (git), aplicar = PR. En el mockup: demo funcional + teaser; el eje = historia futura.

## Del producto completo (sesión 2, 2026-07-20)

9. **La sección "Escala" del rail SE ELIMINA** (challenge del operador): la escala es *estado de
   drill* (se entra por doble-click, se lee en breadcrumb), nunca menú lateral — ningún producto
   investigado tiene "menú de niveles". El rail navega MÓDULOS.
10. **El mockup es el PRODUCTO COMPLETO** ("asume que este mockup es el de todo el DTO"): rail =
    Territorio · Mejora (funil brecha→proyecto→KPI movido con veredicto) · Método (M1/M3/M2 con
    gates + traza "cada capa ← una M-card") · Cambios (ISO, 3 niveles de aprobación, versiones
    dev→UAT→prod, git invisible). + corrida demo funcional con gate a la cola de Cambios.

## Porqués transversales del viaje CK-29 (de la conversación, no estaban en docs)

- **Capa Trabajo pinta el GRIS**: *"puestos sin arnés = la brecha de la era agéntica, y NADIE la
  pinta hoy."* Argumento competitivo de la auditoría: sin arneses/viaje/triage-que-cierra, el
  mockup era *"un DTO bonito más, compitiendo contra Mavim/Ardoq en SU cancha. Los arneses son la
  cancha donde no tienen equipo"* — *"un comprador viendo este mockup jamás adivinaría que los
  arneses existen."*
- **El triage tenía que cerrar la cadena** (decisión 13): era *"un callejón sin salida — 'Contactar
  a compradores morosos' marcada automatizable-agente con RTLX 71… y esa etiqueta no lleva a NADA.
  En la visión ese veredicto es el input de Arnesia."*
- **Nodos hoja NO tienen territorio** (límite deliberado): persona/sistema/KPI son fichas, no
  territorios — *"nodos hoja del grafo, no contenedores"*; el doble-click "entrar" solo existe
  donde hay interior real. (Ofrecimiento abierto: mini-mapa por rol si el operador lo pide.)
- **Tensión reportería ↔ volante** (lectura honesta pedida por el operador): lo construido es el
  extremo reportería; *"el riesgo real es quedarse cómodo ahí: cada sprint de visualización se
  siente progreso y ninguno acerca al diferenciador. El moat entero está en los WRITES: sellar,
  aprobar, promover, ciclo de proyecto."* Identidad propuesta: no Grafana, no VS Code — **ArgoCD /
  torre de control**.
- **Contrato operativo guardián** (mandato verbatim, base de CK-29): *"quiero que no tengamos por
  término diferentes visiones, tiene que ser todo unificado"* · *"si pido algo y se va de la
  visión, tú me digas… Yo siempre voy a tener la última palabra, pero necesito que tú tengas esta
  visión clarísima y me lleves a ella."*

## Del viaje CK-29 (2026-07-24 — "repiensa todo desde nuestra visión, no te sesgues")

11. **Gramática de ficha universal** — TODA entidad (las 12) abre ficha con las MISMAS secciones:
    qué-es · hilo (arriba/abajo, links navegables — el viaje nunca se corta) · pulso · conocimiento
    (teaser F3) · acciones (capa kinética del schema, con nivel + aprobación; toda acción no-directa
    aterriza en Cambios). Por qué: auditoría contra CK-29 halló el mockup CK-21-completo pero
    CK-29-ausente (cero arneses, cero conocimiento, triage como etiqueta muerta).
12. **Capa Trabajo (N15·N17)** — badge ⛨ por puesto (vigente / ⚠ desactualizado / gris sin arnés =
    el gap VISIBLE). Ficha rol = la joya: arnés compilado-de + skills + uso agregado por rol (CK-24)
    + "el día del ocupante — orquestar, no ejecutar". Ficha arnés declara la doctrina: vista
    GENERADA, se recompila jamás se edita.
13. **La cadena triage→Arnesia CIERRA** — veredicto M36 deja de ser etiqueta: `automatizable-agente`/
    `aumentable` → candidato a skill del arnés → funil de ideas (M44, columna 0 en Mejora, autoría
    reconocida RN-16) → proyecto → al cerrar, la mejora se RECOMPILA al arnés. Anti-drift
    twin→arnés en Cambios (SC-14).
14. **Fixes de dato:** 9→12 entidades (CK-26) · 31→45 M-cards · pins con title completo.

## De la geografía (v6 — "sal de la caja y proponme algo mejor")

15. **La geografía deja de ser el organigrama → MAPA DE VALOR** (5 bandas: Estrategia · Cadena de
    valor · Apoyo · Gente & arneses · Sistemas). Por qué (crítica verbatim del operador): "los
    procesos usualmente son con pasos… debería verlos similar [a los mapas de Arnesia]… hay procesos
    transversales… el BSC así no le encuentro sentido… no veo objetivos ni KPIs ni personas — se ven
    cuadrados y bloques pero no un sistema interconectado". Respuesta: ISO 9001 (enfoque a procesos)
    × cadena Porter × strategy map en UN lienzo; hilo de oro = edges VERTICALES reales (tenues
    siempre; click en objetivo → su hilo completo se enciende); transversales = ANCHO (el ancho
    dice cuántas áreas cruzan); procesos con mini-pasos (lenguaje fractal Arnesia); organigrama
    degradado a piel-lente ("la estructura como lente").

    **El porqué fino (de la conversación, no estaba en docs):**
    - Autocrítica conceptual que gatilló el giro: *"ISO 9001 manda enfoque a procesos: la empresa
      ES sus procesos; la jerarquía es solo quién responde por ellos. Puse la estructura como
      geografía y los procesos como habitantes — es al revés."*
    - Argumento de venta: *"defendible ante cualquier directorio: mapa de procesos ISO + cadena
      Porter + strategy map — tres imágenes que un gerente LATAM ya tiene en la cabeza, fusionadas
      en una sola con datos vivos."*
    - Mini-chevrons fractales: en Arnesia un arnés SE DIBUJA como mapa de proceso; que el proceso
      de la empresa fuera un rectángulo mudo era *"mismo objeto, dos idiomas: inconsistencia real"*.
      Un arnés es *"literalmente un fragmento de este mapa (los pasos de un rol). El twin y la
      fábrica se ven igual porque SON lo mismo."* Lenguaje heredado del map-canvas de
      harness-studio: geografía fija de bandas · gutters de handoff · edges encima.
    - BSC como piel aparte, muerto: *"otro mundo flotante — cuadros sin conexión con nada de
      abajo"*; la causalidad BSC = arcos DENTRO de la banda Estrategia.
    - Tabs por tipo de entidad ("Procesos"/"Indicadores"/"Personas"), rechazadas: *"taxonomía de
      base de datos, no de decisión."*

## De la escalera (v7-v8)

16. **La escalera de zoom se ancla a método** — APQC L1-L5 × pirámide ISO 10013 (M38): z0 = el
    "manual" (L1-L2) → z2 = el "procedimiento" CARACTERIZADO (L3-L4: header C1 identidad ISO 4.4.1
    + puertos SIPOC como GEOGRAFÍA, S·I izquierda / O·C derecha, navegables) → z3 = la "instrucción
    de trabajo" (L5: tareas + dos scores M36 con inputs visibles + RACI/RTLX + flujos saltables) →
    **piso = el arnés del puesto** (CK-29). Los "registros" ISO = pulso, transversal. Clave: el
    SIPOC de 11 capas del SOMA fue ABSORBIDO capa por capa por el schema (C1→propósito/disparador ·
    C2-C6→bordes · C7→sistema · C8→rol/RACI · C9→documentos · C10→kpi · C11→brecha · IAA→M36 ·
    Bloom→M37) — la tabla-documento NO vuelve; cada capa es entidad viva navegable.
17. **Empresa demo completa (~100 personas)** — nómina entera (14 líderes + 86 ocupantes, Obras con
    3 proyectos), 27 puestos ×N dibujados (universo declarado `puestosTotal: 40` — son PUESTOS, no
    "roles"; corregido 2026-07-25), 17 SIPOC, 11 lienzos plenos (incl. Permisos = el P03 del
    SOMA vivo), 14 instrucciones z3, 11 sistemas, 12 KPIs. Por qué: la casuística REAL (vacante,
    sin-arnés, desactualizado, KPI stale, sin-ancla, mandato protegido, eliminable, RTLX alto,
    subcontratados, provisto externamente) debe ser VISIBLE, no teórica.

## Del schema (2026-07-24, esta sesión — ratificadas)

- **D-17 `clavada`** — `actividad.tareas[]` subesquema `tarea {orden, verbo?, texto, sistemas_ref?}`
  (ISO 10013 n3 · APQC L5). `desc` NARRA, `tareas[]` ESTRUCTURA; la instrucción z3 se GENERA — D-08
  (manual disuelto) intacta. Habilita triage con granularidad L5.
- **D-18 `clavada`** — derivación del triage as-code (`sistema/schema/triage.yaml`): base por
  capacidad MGI → ajuste ALM → modificadores → clamp; conf propagada; cortes previos (ECRS →
  mandato → accountability); umbrales del veredicto PROPUESTO (el motor propone, el consultor
  ratifica). Pesos `conf: baja` = hipótesis calibrable (M29 + loop KPI-movido). Scores se computan
  al leer, JAMÁS se persisten. Motor = pendiente (programación, no método).

## Micro-decisiones v8.1-v8.2 (pulido, también ratificadas)

- Barrido visual v8.1: 6 fixes cazados con ojos (la suite no ve solapes) — p.ej. banda Gente vs
  label SISTEMAS (ySis dinámico), pin z1 colgando DEBAJO de la card (`.pin.down`).
- v8.2: tuteo es-419 (voseo = 0) · clamp `fitFlujo()` z2/z3 (mín 0.6, ancla al inicio del flujo —
  puertos S·I legibles; el resto por pan/minimapa; `refit()` rutea botón fit y resize por escala).
- Salud como **lentes color-by de radio** (v7): una métrica a la vez, leyenda pegada al lente activo
  con alcance+pregunta+conteo — mata los "puntos-semáforo" falsos.
- **Lienzo universal** (v7): dblclick en CUALQUIER proceso abre lienzo; sin actividades = banner
  honesto "SIN LEVANTAR (M1)" — disable/estado honesto como principio transversal.

## De la sesión 2026-07-25 — notación por tipo + 2 bugs de interacción reales

Primera sesión donde el operador entró al mockup ÉL MISMO (Chrome real vía claude-in-chrome) y dio
comentarios puntuales sobre lo que veía — cierra la deuda #1 de `06-pendientes-e-ideas.md` (los
"muchos comentarios" prometidos el 2026-07-24 y nunca entregados).

18. **Notación por tipo — 3 iteraciones hasta la correcta.** Pedido original: *"los recuadros se ven
    todos parecidos… debería poder ubicar qué es proceso, qué es indicador, qué es persona."*
    - **v1 (rechazada por el operador):** glifo mono inline (1 carácter Unicode, ej. `◆` objetivo,
      `▬` proceso) antes del nombre. Falló: a 69-71% zoom (el default) el carácter es ilegible — 2
      glifos (`◆`,`✦`) directamente colapsaban a un "+" borroso por cobertura de fuente pobre en
      el bloque Unicode Dingbats (`✦` U+2726) vs Geometric Shapes (bien soportado). *"no veo las
      figuritas… lo veo todo demasiado similar."*
    - **v2 (rechazada por el operador):** badge de esquina con FORMA abstracta (cuadrado=Estructura,
      triángulo=Proceso, rombo=Sistema, círculo=Motivación), 2x más grande, color teal (único acento
      PRENTER) + glow. Se veía, pero sin significado propio: *"ese cuadrado, rectángulo, etc. no me
      dice nada… ¿tiene alguna lógica?"* — una forma geométrica arbitraria exige leyenda; no se lee
      "de lejos" sin traducir primero.
    - **v3 (RATIFICADA — en construcción, pendiente de "me gusta" final del operador):** el mismo
      badge, pero con un **pictograma DIBUJADO** adentro (SVG inline, `const TICO` en `index.html`)
      en vez de forma abstracta o carácter: bandera=objetivo, barras=kpi, personita=rol, mini-
      organigrama=área, flecha=proceso, componente(2 fichas)=sistema, alerta=brecha, foco=idea,
      loop=proyecto_mejora. Pedido explícito: *"¿puedes dibujar algo dentro? ¿cómo podría ser?"*
    - **Por qué la lógica NO es arbitraria** (aunque la silueta v2 sí lo era): cada ícono traduce el
      tipo `archimate:` que YA vive en `sistema/schema/objeto.schema.yaml` por entidad (M13, ancla
      SOLO-TIPOS — `sistema/metodo/NOTACIONES.html`). El pictograma es la representación visual de
      ese dato, no una convención nueva inventada para el mockup.
    - **Restricción de diseño que descartó "color por familia":** PRENTER prohíbe un segundo acento
      saturado (`.claude/rules/ui-design-system.md`, "el teal es el único color de marca"). La
      tentación obvia (colorear cada familia con un hue distinto) queda descartada; el canal de
      color sigue reservado 100% a salud/severidad. La forma/ícono es el único canal libre para tipo.
    - **★ v11 — la POSICIÓN del badge cambió (decisión 25):** el pictograma dibujado se conserva, pero
      dejó de ser badge de esquina (`position:absolute`, colgando fuera del borde) y pasó a **inline
      DENTRO** de la tarjeta, antes del título — pedido explícito del operador. Ver **decisión 25**.
19. **Bug real cazado — hover que "se sale de la zona clickeable".** El operador pidió
    verificarlo con devtools ("prueba tu mismo"). Medido con `getBoundingClientRect` antes/después
    (no a ojo): `.obj-node:hover` y `.area-node:hover` reaplicaban por error el
    `transform:translate(-50%,-50%)` del WRAPPER centrador (`.node`) sobre el DIV INTERNO (que no lo
    necesita, ya está centrado por su padre) — saltaba **-94px/-48px** (objetivo) y **-81px/-40px**
    (área) al primer hover: la tarjeta se iba de debajo del cursor, perdía `:hover`, volvía, el
    cursor volvía a entrar → loop de parpadeo. Fix: sacar `transform` de esas 2 reglas hover (ya
    usaban border-color, suficiente — mismo patrón que `.proc-node:hover`/`.chev:hover`/etc en el
    resto del archivo). De paso, `.act:hover` (z2) se alineó al mismo patrón (tenía un
    `translateY(-2px)` real pero minúsculo e inconsistente).
20. **Bug real cazado — tarjetas tapaban las etiquetas de la banda Estrategia.** Medido: el margen
    entre el label de perspectiva BSC (`financiera`/`cliente`/…) y el top de la tarjeta de objetivo
    era de **~0.1px** (prácticamente cero) para cualquier card con título de 2 líneas. Fix: bajar el
    ancla de las tarjetas (`Y.est+18`→`Y.est+54`) y subir los labels de perspectiva
    (`Y.est-40`→`Y.est-14`), dejando ~10px de aire real.
21. **Aprendizaje técnico — `box-sizing:border-box` global rompe el truco CSS del triángulo.** El
    badge-triángulo de proceso (v2, luego reemplazado en v3) medía 0 al construirlo con
    `width:0;height:0;border-left:10px solid` porque el reset `* { box-sizing:border-box }` (L29)
    fuerza el border-box completo a 0. Fix: `box-sizing:content-box` explícito en ESE elemento. Si
    se vuelve a necesitar el truco del triángulo-vía-border en cualquier parte del mockup, aplica
    el mismo fix.
22. **Materiales por capa ArchiMate — diferenciar el CONTENEDOR, no solo el ícono (RATIFICADA
    "me gusta V2", 2026-07-25).** Segundo pedido en vivo del operador: *"cada elemento (objetivo,
    kpi, proceso, persona…) que su recuadro sea un poco diferente, por color de borde o fondo;
    quiero identificarlo más allá del ícono."*
    - **Auditoría del DOM (root cause real):** casi todos los contenedores eran **el mismo material**
      — `border:1px solid var(--border)` (`#1f2826`) sobre `background:var(--raised)` (`#141a19`);
      `.obj-node`, `.rolchip` y `.chev` **idénticos** salvo el `border-radius` (20 vs 10). Por eso "se
      ven parecidos". (El teal que se veía en `.soporte`/`.sysplat` **no** era incoherencia: es el
      hilo activo `.serves` del objetivo seleccionado — comportamiento correcto, no un bug.)
    - **Por qué NO color literal por tipo (choque de doctrina — se avisó ANTES de aplicar):** el
      pedido al pie de la letra rompía 3 cosas — (1) PRENTER "un solo acento" (la **decisión 18** ya
      había descartado color-por-familia), (2) un borde de color por tipo **compite con el semáforo de
      salud** (`--ok`/`--warn`/`--crit` = verde/ámbar/rojo), (3) **teal ya significa "seleccionado"**
      (`.node.hot`) → un borde teal por tipo mata esa señal. Los canales de HUE están reservados.
    - **La salida:** codificar el tipo por los canales **libres** — **valor de superficie, forma,
      peso/estilo de borde, esquina** — SIN hue nuevo, agrupando por **capa ArchiMate** (el `archimate:`
      que el schema ya trae por entidad, M13). Así son **4 materiales legibles, no 12 bordes de
      colores**; el ícono `TICO` (decisión 18) desambigua dentro de la capa. Se descartó "por tipo
      individual" (9+ estilos = ruido, vuelve al problema) y se eligió **v2 (fuerte)** sobre v1 (sutil)
      porque v1 se lavaba a zoom de mapa — justo la queja original.
    - **Receta EXACTA para replicar** (horneada en `index.html`: tokens tras `--border`; bloque
      comentado antes de `</style>`). Tokens nuevos:
      `--mat-mot-bg:rgba(0,183,170,.09)` · `--mat-neg-bg:#1e2624` · `--mat-neg-bd:#2c3936` ·
      `--mat-app-bg:#080b0a`.

      | Capa ArchiMate | Entidades | Clases | Material (CSS) |
      |---|---|---|---|
      | **Motivación** | objetivo·kpi·brecha·idea | `.obj-node` · `.kchip` · `.fitem[data-idea]` · `.fitem[data-g]` | `background:var(--mat-mot-bg)` (vidrio teal .09) + `border-color:var(--teal-800)` + **`border-left:3px solid var(--teal-700)`** (spine). `.kchip` sin spine (chip), tinte .07. |
      | **Negocio** | proceso·rol·área | `.chev` · `.soporte` · `.proc-node` · `.rolchip` · `.area-node` | `background:var(--mat-neg-bg)` (neutro elevado) + `border-color:var(--mat-neg-bd)`. **Excepción `.area-node`: queda `background:transparent` (decisión 4)** — solo hereda el borde. |
      | **Aplicación** | sistema | `.sysplat` | `background:var(--mat-app-bg)` (más oscuro) + `border-color:var(--border)` + **`border-top:2px solid var(--teal-800)`** (barra técnica) + `border-radius:2px` + `box-shadow:inset 0 0 0 1px var(--border-soft)`. |
      | **Implementación** | proyecto_mejora | `.kin` (mapa, ya existía) · `.fitem[data-pm]` (funnel) | punteado teal: `.fitem[data-pm]{background:rgba(0,183,170,.06);border-left:3px dashed var(--brand)}`. `.kin` sin cambio. |

    - **Los estados siguen mandando (verificado):** `.node.hot`, `.serves`, `.node.diff` son reglas de
      **2 clases** → ganan por especificidad sobre el material de reposo (1 clase). Seleccionar,
      encender el hilo y la corrida (diff ámbar) intactos. `* {box-sizing:border-box}` (L29) hace que
      el `border-left:3px`/`border-top:2px` **no cambien el layout** (ancho/alto estables).
    - **Funnel Método vs Mejora:** `.fitem` se comparte, pero los ítems de **Método** (M1/M2/M3) **no
      llevan** `data-*` (son pasos, no entidades) → los selectores de atributo `[data-idea]`/`[data-g]`/
      `[data-pm]` **solo tocan Mejora**. Correcto por diseño.
    - **Cómo replicar en `cockpit-ui`:** los **mismos 4 materiales** como variantes sobre los átomos
      `ui/components/ds/` (p.ej. una prop `layer="motivacion|negocio|aplicacion|implementacion"` en el
      `Card`/contenedor), con los tokens portados a `ui/app/globals.css`. El tipo cae del `archimate:`
      del objeto normalizado; el ícono (`TICO`) desambigua. Cero hue nuevo — respeta `[[ui-design-system]]`.

## De la sesión 2026-07-25 (cont.) — cobertura total de tipos + notación DENTRO + aire entre bandas

> Continuación de la misma sesión (decisiones 18-22 arriba). El operador entró al Artifact, dio
> comentarios en vivo, y pidió cerrar con "toma nota de todo, audita que las notas no se contradigan".

23. **Los 3 tipos "sin contenedor" → ícono + superficie (empresa · persona · capability).** Tras ver las
    12 entidades juntas (swatch), el operador: *"darles superficie/icono... revisa todo lo ya realizado
    para que siga tu propuesta."* La cobertura pasa de **9/12 a 12/12**. Diseño anclado a ArchiMate M13:
    - **empresa** — Business Actor organizacional. Ícono = **edificio**. Superficie: el brand del rail
      (`.brand .sub` "Twin · Desarrolladora Terranova", abre `openEmpresa`) + header de ficha. NO es
      nodo de mapa (la empresa ES el mapa entero).
    - **persona** — Business Actor individual. Ícono = **personita sólida (rellena)**, distinta a `rol`
      (contorno). Superficie: header de ficha `openPersona`. **CK-24 intacto:** ícono ≠ nodo medible.
    - **capability** — Business Capability (**capa Strategy**, TOGAF). Ícono = **hexágono + núcleo**.
      Superficie: sus chips `.chip.lk[data-cap]` (fichas de sistema/proceso) con **borde teal-800**
      (guiño de material Strategy) + header de ficha. **Sin band de mapa** (sería superficie nueva
      grande — follow-up en `06`). El **5º material (Strategy)** queda RESERVADO.
    - 3 SVG nuevos en `const TICO`. El canal de color sigue 100% salud (decisión 18).

24. **Ícono de tipo en el header de TODA ficha (`.dico`).** Hallazgo de la pasada de revisión: las 14
    fichas (`open*`) nombraban el tipo en el eyebrow pero **no mostraban su ícono** — gap con "ícono por
    tipo en todos lados". Fix DRY: `openDrawer(eye,title,body)` **auto-inyecta** el ícono parseando la
    1ª palabra del eyebrow (`eye.split(' ')[0].toLowerCase()` → clave de `TICO`; `Proyecto de mejora`→
    proyecto, `KPI`→kpi; `Actividad`/`Arnés` sin match → sin ícono). **1 cambio, cero tocar los 14
    callers.** CSS `.dico` (17px, `vertical-align:-3px`). Verificado ×6 tipos con `.dico` ✓.
    *(Alcance real post-v12 — cierra B3 de `07`: `Arnés` y `Puesto` ganaron ícono propio en TICO y
    `openDrawer` normaliza acentos; la ÚNICA ficha sin ícono hoy es `Actividad` — coherente: es
    subesquema del proceso, no entidad del schema. "TODA ficha" léase "toda ficha de entidad".)*

25. **El badge del tipo va DENTRO de la tarjeta (inline), no colgando en la esquina.** El operador,
    viéndolo en el Artifact: *"el icono está afuera no dentro."* **Causa raíz:** el markup ya ponía el
    `tbadge` inline (antes del título), pero `.tbadge{position:absolute; top:-9px; left:-9px}` lo sacaba
    del flujo y lo colgaba FUERA del borde sup-izq — resto de la **decisión 18 ("badge de esquina")**.
    **Fix (1 cambio de CSS):** `.tbadge` → `display:inline-flex; position:static; margin-right:6px;
    vertical-align:-3px` (17×17, border 1.4px, glow suave). Ahora fluye inline dentro de la tarjeta, antes
    del título, en las 5 bandas — coherente con el swatch y con `.dico`. Verificado `badgeInside:true`.
    **Supersede la POSICIÓN de la decisión 18** (el pictograma se conserva; sólo cambia dónde vive).

26. **Aire entre bandas — las cajas ya no tapan los labels de riel.** El operador: *"algunas cajas están
    tapando las letras de los títulos que los separan; dale más respiro entre riel y riel para que también
    visualmente veamos que son diferentes."* **Causa:** los nodos están **centrados en su ancla** → las
    cajas altas (chevrons de Cadena con filas de KPI, h≈135) crecían hacia ARRIBA hasta el label de su
    propia banda (top 381 ≈ label 380). **Fix (`renderValor`):** (a) más gap entre bandas —
    `Y={est:170,cad:480,apo:770,gen:965,sis:1150}` (era `{...cad:432,apo:640,gen:762,sis:856}`),
    `setCanvas(W,1300)` (era 920); (b) Cadena empujada +48px (`y=Y.cad+64`, era `+16`); (c) label 8px
    más arriba (`y-60`, era `y-52`); (d) separador de riel más visible (`#243330`, era `#131b1a`, en
    `y-72`); (e) cesión dinámica Gente→Sistemas `ry+86` (era `+66`). Verificado data-driven: **5 checks
    de solape = false**, clearances 11-142px. Trade-off: fit por defecto 69%→**58%** con stage ancho
    (~46% con la ventana en 1568px — `fit()` es relativo al viewport) (más aire = arranca
    más lejos; el operador lo aceptó). **Deuda de fondo:** la raíz (center-anchoring) sigue viva — cajas
    MUY altas podrían volver a rozar; el fix robusto sería top-anchorear los nodos (no hecho: tocaría el
    ruteo de edges/hilo del hilo de oro).

## De la sala del directorio (v18 — "¿le interesa esto a un directorio?")

27. **La sesión del directorio se reorganiza como AGENDA de 4 movimientos, y entran las tres cosas
    que faltaban: plata, riesgo formal y acuerdos.** Pedido del operador (2026-07-29): *"revisa la
    vista del directorio a conciencia, sin defender lo ya realizado — ¿les interesa lo que hay, o
    también debería verse el estado de resultados y otros elementos NIIF? dime qué NO estamos
    mostrando que sí es relevante"*, y después: *"ejecuta los 3 bloques revisando primero cómo está
    para reorganizar la información de forma oportuna, entendible y atractiva; que la información,
    si bien es para un rubro, sea lo más general para cualquier otro"*.

    **Diagnóstico (12 huecos, sin defender lo hecho).** Lo que había gobernaba la EJECUCIÓN de la
    estrategia (apuestas · apetito · mezcla · alertas · portafolio) — eso es la **segunda mitad** de
    una agenda de directorio y es genuinamente diferenciador. Faltaba la primera mitad entera:
    1. la bandeja "espera tu decisión" **configuraba el propio modelo** (fijar apetito, fijar mezcla,
       sellar) — 4 de 6 filas; en régimen esa bandeja queda vacía y el directorio no firma nada;
    2. la apuesta **prometía plata y nunca la cobraba** (el producto acusa a otros de "indicador sin
       ancla de valor" y cometía lo mismo en su nivel más alto);
    3. todo era interno, auto-reportado y hacia adelante — cero dato cerrado o validado por fuera;
    4. **no existía presupuesto** (un directorio gobierna CONTRA un presupuesto);
    5. no existían **acuerdos con responsable y plazo** — el punto que abre toda sesión — ni acta;
    6. no existía **registro de riesgos** (estaba el apetito, faltaba la contraparte);
    7. no había **aterrizaje proyectado** ("¿llegamos a diciembre?");
    8. **cero caja** — para una desarrolladora, EL tema;
    9. las obras eran una alerta suelta, no un portafolio de inversiones;
    10. una sola moneda; 11. cero cumplimiento/auditoría; 12. personas sólo como una vacante.

    **Decisión sobre NIIF (bloque C — la frontera).** Sí al resultado, **no** al juego completo de
    estados financieros. Reproducir los EEFF convierte a Cockpit en un tablero contable más
    (commodity), pierde la pelea de calidad del dato contra el sistema contable, y mostrar cifras no
    cerradas en una superficie de directorio es un riesgo real. La posición firmada: **Cockpit no es
    el libro contable — es el puente entre el libro y la organización.** Lee un puñado de cifras con
    su **estado de cierre** (preliminar → cerrado → auditado) y su procedencia, y **baja cada una al
    proceso/área que la produce**. El alcance se declara explícitamente en una ficha propia
    (`openAlcanceContable`), incluido lo que NO hace. El **puente** (`DATA.puente`) nombra las 6
    decisiones contables que dependen de cómo opera la empresa — reconocimiento de ingreso ·
    provisión por cobranza dudosa · valorización de lo construido · contingencias · arrendamientos ·
    partes relacionadas — cada una navegable al twin. **El código de la norma vive SOLO dentro de la
    ficha, como procedencia** — mismo trato que los códigos de carta del método (gate en la suite:
    cero `NIIF|NIC \d` en pantalla).

    **La joya del puente:** `g-avc` (avance real 87% vs declarado 95%) deja de ser sólo una brecha de
    obra — es el input de si **lo construido está bien valorizado** en el libro. Eso es materia de
    directorio y de auditoría, y ningún sistema contable puede detectarlo porque no conoce el proceso.

    **La reorganización (el "cómo está" antes del "qué agrego").** La página pasa a ser la **agenda de
    la sesión, en su orden real**: ① ¿cómo nos fue? (resultado + caja) · ② ¿a dónde vamos? (rumbo,
    apuestas con lo cobrado, varas y presupuesto) · ③ ¿qué puede impedirlo? (riesgos, alertas,
    inversiones, proyectos) · ④ ¿qué decidimos? (bandeja, acuerdos, acta). Se **eliminó** el panel
    "¿Avanzan las apuestas?" (duplicaba el punto de salud de la propia tarjeta) → los puntos viven
    inline en la cabecera de las apuestas. El **inspector dejó de repetir la página**: en nivel 1 ya
    no muestra el pulso ni el ciclo de mejora (viven en los movimientos 2 y 3) y pasa a ser el
    **índice de la sesión** (4 saltos) + la próxima jugada + las dos lecturas de contexto.

    **El techo real que había que romper: `fit()`.** Una vista de módulo se encajaba en ANCHO *y*
    ALTO, así que cada panel nuevo encogía la letra de todos los demás — con 12 huecos que llenar,
    la página habría quedado ilegible. Se separó el gesto: una página es un **documento**
    (`fitPagina` = encaje al ancho + anclado arriba; la rueda **recorre**, `⌘/Ctrl+rueda` hace zoom).
    Resultado: el zoom se mantiene en 78% (misma legibilidad que v17) con una página de 2.7k px que
    se recorre — y los 4 movimientos son las paradas. Aplica a Mejora/Método/Cambios también.

    **Generalidad entre industrias (pedido explícito).** Cada bloque nuevo lleva una línea de
    equivalencias (`.paral`, 7 en la página + 1 en la ficha de inversión) que nombra el equivalente
    en manufactura, retail, servicios, software, banca o salud. El renglón de **Inversiones en curso**
    es el caso más claro: *avance real · gastado contra presupuesto · ya comprometido · fecha de
    entrega · margen proyectado* sirve igual para obras, ampliación de planta, tiendas nuevas,
    contratos plurianuales o líneas de producto. La cabecera lo dice de frente: **las cuatro
    preguntas son las mismas en cualquier industria; cambia el contenido de las filas.**

    **Honestidad del respaldo.** 6 entradas nuevas de Respaldo del método citando lo que SÍ existe en
    el catálogo (ISO 9001 §9.3 · FinOps · procedencia · ISO 31000 · 70/20/10 · P3M3 · RACI · WSJF) y
    declarando en `gap:` lo que **aún no tiene carta**: marco de reporte contable, proyección de caja
    a 13 semanas y resguardos, presupuesto y control presupuestario, gobierno corporativo
    (acuerdo/sesión/acta/facultades), registro de riesgos con dueño y tendencia. **No se tocó
    `methodologies.yaml`**: las cartas nuevas se proponen vía `/metodo-aprende` con firma del
    operador, no se inventan desde el mockup.

---

## Decisión 28 (v19 · 2026-07-29) — «el directorio decide, la gerencia resuelve»

**Qué se pidió.** Primero una auditoría de la estrategia contra `/metodo` con foco en KPIs y madurez
(40 hallazgos, `07 § K`). Después, al ordenar la corrección, el operador fijó el marco que faltaba:
*"los usuarios son el gerente general y los gerentes, y a través de nuestras acciones diarias debemos
resolver todo lo que se muestra en directorio"*.

**Por qué eso cambia el diseño y no sólo el dato.** El nivel 1 de v18 era una agenda completa y un
sistema de gestión inejecutable: siete metas que ningún rol tenía asignadas, alertas sin destinatario,
cifras que nadie movía. La corrección no es agregar paneles — es que **cada cosa que el nivel 1 muestra
declare dónde se resuelve**, y que el nivel del gerente abra con eso.

**Las cuatro decisiones de fondo.**

1. **La bajada es dato, no lámina** (D-35). `objetivo.parent_ref` existía desde v2 y tenía **cero
   usos**. Ahora la meta del directorio se abre como meta de una gerencia con su rol accountable, y el
   catchball de Hoshin se cierra contra una **sesión** (`acordado_en_ref`). Los dos estados que
   importan — *sin bajar* y *asignada sin acordar* — se derivan del grafo y llegan solos a la bandeja.
   *Alternativa rechazada:* un campo `bajada_pendiente` en el rumbo (era el contador que ya había: no
   navega, no audita, y se desincroniza el primer mes).
2. **El hilo ancla al contrato** (A2 · D-34). El KPI mueve un KR, no un objetivo entero, y el valor del
   KR se **lee** de la serie. *Alternativa rechazada:* dejar `kr.cur` como número curado "porque es un
   mockup" — es justo el error que el producto le señala al cliente (el mismo hecho en dos lugares), y
   el mockup es el contrato de construcción.
3. **Una escalera nunca viaja sin su vara** (D-32/D-33). Tres escaleras convivían sin arbitraje y una
   leyenda prometía niveles 0-5 sobre un campo de tres colores. *Alternativa rechazada:* unificar todo
   en una sola escalera — COBIT gradúa una capacidad y ISO 9004 el sistema de gestión; fundirlas
   perdería las dos preguntas.
4. **La vara externa sale del eje vertical** (D-31). El tablero afirmaba «pares 45-60 días» de cobranza
   contra una unidad de nicho que dice, textual, que ese benchmark no existe validado. *Alternativa
   rechazada:* borrar el chip y ya — se habría perdido la información de que **no hay vara**, que es
   exactamente lo que un director necesita saber antes de fijar una meta.

**Lo que se movió de nivel** (y por qué no es un recorte): el portafolio completo, el detalle de
alertas, el registro de avance de inversiones y el seguimiento semanal de acuerdos **bajan al nivel
3**. El directorio los sigue **por excepción** y cada fila declara por qué sube — o el panel declara
por qué el resto se queda abajo. Duplicar la lista en los dos niveles era la forma más rápida de que
las dos empezaran a discrepar.

**Precio pagado, explícito.** El pulso del directorio pasó de «1 de 7 en banda» a **5 metas** (1 verde,
2 ámbar, 1 gris, 1 roja): el tablero se lee peor porque ahora dice la verdad — un objetivo con un
contrato sin serie ya no se disfraza de verde. Y la banda Estrategia dibuja 10 objetivos en vez de 7,
porque las bajadas también son metas.

---

## v20 (2026-07-30) — el mapa completa el mapa: Dirección y Capacidades

Origen: el operador leyó el nivel 2 preguntando **"¿esto sirve en una junta de gerentes, sabiendo que
lo verá el gerente general y es el insumo del directorio?"**. La respuesta era no del todo, por dos
huecos que se leían como productos distintos pegados.

### Lo que estaba roto (medido, no supuesto)

1. **El mapa prometía tres tipos de proceso y pintaba dos.** El encabezado del propio código citaba el
   enfoque a procesos de la norma (estratégico/misional/apoyo) y sólo dibujaba cadena + apoyo. Y
   `apoyo` ni siquiera era una clasificación: era **el resto** (`!DATA.cadena.includes(p.id)`), así que
   cualquier proceso nuevo caía ahí por descarte.
2. **Los procesos de dirección existían… fuera del mapa.** La sesión del directorio, el presupuesto, el
   registro de riesgos, el ciclo de mejora y la cola de cambios se ejercían en el nivel 1 y en los
   módulos, pero no tenían casilla, dueño declarado, digitalización ni madurez. Por eso el nivel 1 se
   leía como un tablero paralelo y no como la **salida de un proceso del mapa**.
3. **El hilo de oro saltaba la capacidad.** Iba meta → proceso. Faltaba la estación donde el gerente
   contesta *"no es que el proceso falle: no sabemos hacer esto al nivel que la meta exige"* — que es
   la frase con la que se pide presupuesto.
4. **La lente de madurez no existía donde la prometían.** El botón del directorio *"ver el mapa por
   madurez de capacidades"* aterrizaba en el mapa de valor, donde `state.sub==='madurez'` no estaba
   implementado: el director pedía madurez y veía digitalización. Sólo funcionaba en el organigrama.
5. **La madurez medía el peldaño, no la distancia.** `min(act)`: un área con todo en 4 de 4 y otra en
   4 de 5 se pintaban igual, y `c-permisos` (sin nivel deseado) hundía a Desarrollo en rojo por una
   meta que nadie fijó.

### Las decisiones (firmadas por el operador el 2026-07-30)

**D-a → `proceso.tipo` es dato declarado** (materializada como **D-37** en el contrato del objeto).
No se deriva del código APQC: la categoría 1.0 del catálogo ("desarrollar visión y estrategia") es
*operating* allá y dirección pura acá — la inferencia se rompe en la primera fila. Misma doctrina que
`kpi.dir` (D-31). Las dos clasificaciones conviven y son ortogonales: el tipo es para **leer** (la
geografía), el código APQC para **comparar** (la llave del benchmark externo).
*Efecto colateral del scan:* M12 y M16 anclaban la misma dimensión del twin (`procesos-clasificacion`)
y **no tenían arista entre sí** — nada arbitraba cuál manda. El arbitraje quedó escrito en las dos
direcciones del catálogo.
*Alternativa rechazada:* derivar el tipo del id APQC "para no agregar un campo" — habría clasificado
como operativo el planeamiento estratégico, que es el caso que motivó toda la banda.

**D-b → los seis procesos de dirección entran al mapa.** Ninguno es invención: los seis ya se ejercen
en el twin. Lo que ganan es casilla, dueño, madurez y un `tablero` que salta a donde se ejercen.
Quedan **fuera del hilo de oro a propósito**: la dirección no *mueve* un indicador, *produce* la meta
que otros mueven; meterla en el hilo confundiría gobierno con ejecución (y encendería cinco aristas
falsas desde cada objetivo). Por lo mismo no se apagan al encender una meta: son el contexto de todas.
*Alternativa rechazada:* dejarlos sólo en el nivel 1 — es lo que ya pasaba, y es la razón por la que
el producto se leía como dos cosas.

**D-c → la madurez que se pinta es la BRECHA, no el peldaño.** Rollup por peor distancia, y una
capacidad **sin nivel deseado no tiñe a nadie**: no existe la distancia que nadie fijó. Cuarto estado
propio ("sin meta fijada"), sin color.
*Alternativa rechazada:* pintar el nivel absoluto — es más simple y responde la pregunta equivocada
(un 4 de 4 y un 4 de 5 no son el mismo estado de gestión).

### Lo que apareció al mirarlo con los ojos (y no lo decía ninguna prueba)

- La banda Estrategia dibujaba **las diez metas en una sola fila**: la décima se salía del lienzo y,
  peor, nada distinguía la meta de la empresa de la de un gerente. Pasó a **dos filas** — arriba la
  meta del directorio, abajo la bajada con su gerencia, su rol responsable y si fue acordada. La
  cascada se dibuja, y **punteada** cuando el gerente todavía no la aceptó en sesión (M26: asignada ≠
  acordada). Es la lectura que la junta necesita y estaba latente en el dato desde D-35.
- El derivado "qué metas se apoyan en esta capacidad" tenía un **falso negativo visible**: *"ver la
  caja al día"* (1 de 5, la peor brecha del mapa) declaraba que ninguna meta se apoyaba en ella,
  porque el proceso que la realiza no declara driver… mientras su brecha bloquea el contrato *"caja
  visible al día"* del directorio. Ahora se deriva por **dos caminos** (driver del proceso · brecha que
  bloquea un contrato), y el caso deliberado de *"atender al propietario"* —sin ancla de valor— se
  conserva intacto.
- Un contador de 100 caracteres en una barra `nowrap` empuja la búsqueda y el selector de piel **fuera
  de la pantalla**: tres pruebas de la suite lo detectaron como "intercepta". El desglose vive ahora
  en el tooltip; la línea de estado se mantiene corta por regla, no por gusto.

### Cobertura declarada (lo que este cambio NO cierra)

Siete procesos no tienen capacidad declarada y por eso **quedan fuera de la lectura por madurez**. No
se calla: el hueco se dibuja al final de la banda con su listado navegable. Cerrarlo es trabajo del
levantamiento, no una decisión de tablero.
