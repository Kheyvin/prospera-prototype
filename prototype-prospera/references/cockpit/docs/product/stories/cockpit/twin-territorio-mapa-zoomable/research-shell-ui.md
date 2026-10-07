# Research — shell UI del twin (2026-07-20)

> Investigación pedida por el operador: cómo estructuran el shell (navegación vs. filtros vs.
> acciones vs. simulación) los productos de Digital Twin of an Organization, process mining,
> org-design con what-if, y las convenciones de canvas/mapa. 3 sweeps web paralelos
> (fuentes citadas por claim en los reportes de la sesión). Este doc = síntesis + propuesta.

## Los 3 sweeps (qué se investigó)

1. **DTO / process mining:** Celonis, SAP Signavio, ARIS, Mavim, QPR ProcessAnalyzer, Apromore,
   IBM Process Mining (docs oficiales / archivadas).
2. **Org-design con escenarios what-if:** Orgvue, ChartHop, Nakisa, Agentnoon, Functionly,
   orginio/Ingentis + strategy maps (Quantive/Gtmhub, Cascade, Workboard).
3. **Gramática de canvas por capas:** GIS (Google Maps, kepler.gl, ArcGIS, Felt), Figma/Miro/tldraw,
   node-graphs (React Flow, Neo4j Bloom, dbt lineage), Grafana/Datadog, NN/g sobre modos.

## Convenciones convergentes (lo que TODOS hacen)

| # | Patrón | Quiénes |
|---|---|---|
| 1 | **Izquierda = qué existe** (estructura, capas con leyenda por capa) · **derecha = cómo es lo seleccionado** (inspector contextual que muta con la selección) · **abajo = viewport** (zoom/fit/minimap) · **arriba = alcance y modo** (filtros, identidad del contexto, mode switch) | GIS + Figma + React Flow + Grafana, unánime |
| 2 | **Leyenda integrada al panel de capas**, no widget suelto | Felt 2.0 |
| 3 | **3 verbos separados, nunca fusionados:** Filter (recorta), Highlight/color-by (pinta una métrica, UNA a la vez), Spotlight (atenúa lo no relevante) | Agentnoon, Nakisa, ChartHop, todo process mining |
| 4 | **Filtros con feedback permanente:** chips visibles/removibles en el header + contador del subset activo (n/N casos) | Signavio, Celonis, QPR, ARIS, IBM |
| 5 | **Filtrar desde el canvas** (seleccionar nodo → convertir en filtro include/exclude) | estándar process mining |
| 6 | **Level-of-detail declarativo** para orgs grandes: colapsar a N niveles, ocultar tipos de nodo, filtro por sub-árbol que preserva contexto — NO solo zoom % (nadie usa minimap en org charts) | Orgvue, Functionly, Agentnoon, Nakisa |
| 7 | **Preset nombrado** = filtros + overlay + contenido de card guardados como "View" compartible; estado de vista serializable/deep-linkeable | ChartHop, Agentnoon, Nakisa, Apromore |
| 8 | **Inspector = panel derecho al click sin perder el canvas; página completa solo al doble nivel de profundidad.** Regla Cascade: "el mapa es para leer estructura, el sidebar para escribir" | Figma, Functionly, Cascade, Bloom |
| 9 | **El mapa se abstrae con sliders % nodos / % conexiones** acoplados al canvas | Celonis, Signavio, ARIS, IBM, Apromore (el patrón más universal del mining) |
| 10 | Focus/spotlight: selección → resalta vecinos, atenúa resto; expand-on-demand, nunca render total | Bloom, dbt lineage (ya lo hace nuestro hilo) |

## La conclusión grande — simulación / "corridas" what-if

**Nadie simula con un toggle sobre la vista live. Cero excepciones.** El patrón unánime:

1. **Escenario = OBJETO con nombre propio** (draft/branch/sandbox), ciclo de vida propio
   (Draft → In Review → Approved → **Merged**) y permisos propios. Se ENTRA al escenario;
   el org real (Main Org) es view-only. (Orgvue Drafts, ChartHop Scenarios, Agentnoon
   sandbox, Functionly copias, Celonis Simulation Dashboard, IBM casos simulados etiquetados.)
2. **Señal de modo = identidad en el header** (nombre del escenario arriba-izquierda en vez de
   "Main Org") **+ diff coloreado sobre los nodos** (verde=alta, amarillo=editado, rojo=baja).
   NN/g: mínimo 2 señales redundantes simultáneas.
3. **Impacto en vivo = panel derecho persistente** con deltas (costo, headcount, KPI:
   "previous → new", netos al pie). **Comparación deliberada = pantalla A/B aparte**
   (baseline vs escenario, waterfall). Dos superficies distintas.
4. **Volver al mundo real = gate explícito** (Merge/Submit con revisión del changelog),
   nunca implícito.

**Mapeo natural a Cockpit (Organization as Code):** escenario = **rama/draft sobre N6**
(repo oficial git) · merge del escenario = PR/commit al To-Be · diff coloreado = git diff
pintado sobre el mapa · As-Is (N16) vs To-Be (N6) vs Escenario (rama) — la arquitectura ya
tiene los 3 planos que el patrón exige. Ningún vendor tiene el twin versionado en git;
nosotros lo tenemos gratis.

## Diagnóstico del mockup actual

| Problema | Evidencia contra convención |
|---|---|
| Rail izquierdo mezcla navegación (Escala z0-z2) con estado de vista (Capas) y config de overlay (sub-semáforos) y leyenda suelta | #1, #2, #3 |
| "Salud" con 3 sub-semáforos es un **color-by** (radio, una métrica a la vez) disfrazado de capa toggle | #3 |
| No hay filtros ni búsqueda ni contador de subset | #4, #5 |
| No hay level-of-detail declarativo (el pendiente de legibilidad ~57% se resuelve con esto, no con tipografía) | #6 |
| Apuesta + Pulso flotan sobre el canvas tapando territorio | #8 (son el estado "sin selección" del inspector derecho) |
| Zoom abajo-derecha (React Flow: abajo-izquierda + minimap abajo-derecha; implementación destino ES React Flow) | #1 |
| No existe el eje Ver / Simular (las "corridas") | § simulación |

## Propuesta de shell (a ratificar por el operador)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ⬤ As-Is · Terranova ▾   Sala de mando › …   [filtros: chips] [n/N]  ⌕  │ ← identidad+alcance
├──────────┬─────────────────────────────────────────────────┬─────────────┤
│ NAVEGAR  │                                                 │ INSPECTOR   │
│  z0 z1 z2│                CANVAS                           │ (contextual)│
│  (drill) │                                                 │ sin selecc: │
│ CAPAS    │                                                 │  Pulso +    │
│  ☑ Estru │                                                 │  LA Apuesta │
│  ☑ Hilo  │                                                 │ con selecc: │
│  ☑ Salud │                                                 │  ficha nodo │
│   ◉ digi │   [zoom −/+/fit]                [minimap]       │  (drawer    │
│   ○ conf │   [niveles: 1-2-3]                              │   actual)   │
│   + leyenda inline por capa                                │             │
└──────────┴─────────────────────────────────────────────────┴─────────────┘
```

- **Top bar** = identidad del contexto (**As-Is · empresa** hoy; nombre de la corrida cuando
  exista simulación, con tinte/franja) + breadcrumb + chips de filtro + búsqueda (⌘K).
- **Rail izquierdo** = solo "qué existe": Escala (navegación) + Capas (toggles con leyenda
  inline por capa, Felt-style). Sub-semáforos de Salud = radio color-by DENTRO de la capa
  (ya son radio; se les quita el disfraz de sección aparte, leyenda pegada).
- **Canvas floaters mínimos:** zoom/fit abajo-izquierda + **control de niveles visibles
  (LOD declarativo: mostrar 1/2/3 niveles del árbol)** — resuelve el pendiente del ~57% —
  + minimap abajo-derecha (React Flow lo trae).
- **Derecha = inspector contextual:** sin selección → Pulso + LA Apuesta (la "sala de mando"
  deja de tapar el mapa); con selección → la ficha (drawer actual). Un solo hogar espacial.
- **Simular ("corridas") = futuro, fuera del mockup actual:** botón "Nueva corrida" arriba;
  entrar = cambia identidad del header + tinte + diffs coloreados; impactos en vivo en el
  panel derecho; comparar = pantalla A/B; aplicar = gate (PR a N6). Historia propia cuando
  se refine.

## Estado

Propuesta presentada al operador — pendiente de ratificación antes de tocar el mockup.
