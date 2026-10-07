# 05 · Del mockup a la app real — qué falta, dónde y en qué orden

> Parte del dossier. El mockup es el contrato visual; ESTE doc es el mapa de la deuda entre el
> HTML canned y el binario `directorio` real. Insumo directo del refinamiento (`/po-ux` → `/architect`).

## Estado del terreno (2026-07-24, commits `2d49b3b` + `501f8ac`)

### Ya materializado (no re-hacer)

| Qué | Dónde | Estado |
|---|---|---|
| Schema 12 entidades v2 | `sistema/schema/objeto.schema.yaml` | shipped CK-26, servido por `/api/objeto` |
| `actividad.tareas[]` (D-17, subesquema `tarea {orden, verbo?, texto, sistemas_ref?}`) | mismo schema | **materializado en schema; SIN wiring Go** |
| Derivación del triage as-code (D-18) | `sistema/schema/triage.yaml` | **fórmula declarada; SIN motor que la ejecute** |
| Vocabulario de verbos ALM×MGI | `sistema/schema/verbos.yaml` (46) | shipped CK-26, gate RN-11 |
| Gate 4º (valida schema+verbos+triage) | `sistema/schema/gen_schema.py` | verde |
| Paridad schema↔Go | `go/objeto_test.go` `TestParidadSchema` | lee el mismo YAML |
| Fichas de decisión | `sistema/schema/DECISIONES.md` D-01..D-18 | D-17/D-18 `clavada` |
| Design system PRENTER | `ui/app/globals.css` + `ui/components/ds/` + `/design-system` | CK-27 |
| Golden fixture Terranova (org ficticia) | historia `organizacion-ficticia-golden-fixture` (CK-23) | el twin real se demo-ea con fixture, no con datos del mockup |

### Deuda de programación (el "cocinero" — la receta ya es dato)

1. **Wiring `tareas[]`**: `go/objeto.go` parsea/valida/sirve el campo en `/api/objeto`; el z3 real
   rinde la instrucción desde dato (hoy el mockup usa `DATA.z3` canned).
2. **Motor de triage**: código que al LEER computa score-RPA/score-agente + conf propagada +
   veredicto propuesto, desde `triage.yaml` + `verbos.yaml` + `actividad.{verbo,automatizacion}`.
   Invariante: los scores JAMÁS se persisten (`identidad_vs_observacion`). El motor es tonto —
   ejecuta lo que el YAML declare; calibrar un peso = PR de datos, no deploy.
3. **El shell territorio en `cockpit-ui`**: hoy `NegocioView.tsx` = 4 tabs planas (MapaTab/HiloTab/
   BrechasTab/PersonasTab). El re-frame: territorio como shell, tabs → capas. Migrar lente por
   lente (mitigación del riesgo scope declarada en la historia).

## Veredicto técnico (de la historia — vigente)

- **z0/z1 (mapa libre zoomable)** → evaluar `@xyflow/react` (React Flow). Dep FE nueva: cae bajo
  `[[cockpit-stack]]` "no deps sin justificación" — la justificación es el mapa org libre-zoomable.
  Decidir en refinamiento. harness-studio lo tiene SPECADO pero no construido (`docs/product/ux.md`).
- **z2/z3 (lienzo swim-lane)** → a mano (HTML+SVG), SIN dep. harness-studio YA lo shipeó
  (`web/src/widgets/map-canvas/**`) = lift candidato (repo hermano, doctrina `studio-core` CK-25).
- **Técnicas transplantables tal cual** (probadas en el mockup y/o harness-studio): viewport por
  CSS-transform (~100 líneas, sin lib) · nodos DOM + edges SVG medidos (`getBoundingClientRect` +
  `ResizeObserver`, cero coords guardadas) · overlays derivados (cero DOM extra si capa off) ·
  spine-always + hover-reveal · disable honesto de capas · glyph redundante (forma+color+char) ·
  hash deep-linkable `escala·capa·selección`.
- **Del mockup mismo** (v8.2): clamp `fitFlujo()` (zoom mín 0.6 anclado al inicio del flujo en
  z2/z3, `refit()` por escala) · LOD Niveles 1/2/3 con rollup honesto · layout organigrama por walk
  de `reporta_a` · pins invertidos `.pin.down` en z1 · `pointer-events:none` en overlays full-cover
  (bug v5.0 — regla, no anécdota).

## Historias relacionadas (anti-duplicación — NO recrear)

| Historia | Relación |
|---|---|
| `cruce-estructura-operacion-indicadores` (refining) | ES la capa Hilo/Indicadores. `derivaSemaforo` (Go) + `ui/lib/indicadores.ts` se CONSUMEN |
| `brecha-proyecto-ciclo-vida` (F1.1) | ES la capa Cinética (loop O7) |
| `persona-puesto-primera-clase` (done CK-12) | base O4 de la capa Estructura |
| `negocio-yaml-proyeccion-generada` | la proyección que alimenta los lentes actuales |
| `organizacion-ficticia-golden-fixture` (CK-23) | los DATOS del twin real (no los canned del mockup) |
| `auth-niveles-acceso-policy-as-data` | qué capa ve cada nivel — out of scope aquí |
| corridas what-if (decisión 8) | eje escenario-objeto = historia futura PROPIA; el mockup solo teaser |
| `knowledge-database-files-first` (F3) | el cuerpo "conocimiento" del cerebro; el mockup solo teaser en fichas |

## Out of scope explícito (del refinamiento de ESTA historia)

Motor de indicadores real (otra historia) · ciclo brecha→proyecto (otra historia) · lakehouse N16
(F1.4; twin lee golden fixture) · auth/niveles · los `proyecto_mejora` del mockup son ilustrativos.

## Doctrina de verificación (aprendida a golpes — regresionar esto = repetir bugs cazados)

1. `element.click()` MIENTE (salta hit-testing) → SIEMPRE `document.elementFromPoint(x,y)` +
   dispatch con coordenadas. Suite: `verify.sh` (19/19, hit-testing real).
2. Todo overlay full-cover nace `pointer-events:none` + `> * {auto}` (bug v5.0: capa de pins se
   tragó TODOS los clicks y ningún test lo vio).
3. Headless + `--virtual-time-budget`: esperar ≥1200ms antes de tocar (carrera con primer layout).
   La suite es flaky en frío — un "SIN RESULTADO" aislado se RE-CORRE antes de diagnosticar.
4. La suite NO ve solapes ni mentiras visuales → screenshot headless de lo tocado + ojos propios
   (en v8.1 los ojos cazaron 6 bugs que el hit-testing no vio).
5. Chrome-devtools MCP se rompe con este WM; fallbacks: headless CLI + suite inyectada, o
   claude-in-chrome (Chrome real del operador — sirve para el artifact REAL).
6. Republicar SIEMPRE al mismo artifact (URL en HANDOFF, pasar `url`) + WebFetch al CDN buscando un
   marcador del cambio + avisar Ctrl+Shift+R (el CDN tarda minutos).

## ★ El nivel 1 (Directorio) YA tiene contrato de construcción (2026-07-29)

A diferencia del resto de la historia, el **nivel 1 no necesita refinamiento previo**: su método, su
esquema y sus escenarios están cerrados y con gate.

- **Método:** M55 (reporte financiero como fuente) · M56 (liquidez) · M57 (presupuesto) · M58
  (sesión, acuerdos, acta, facultades) · M59 (valor ganado) + M52/M22/M16 enriquecidas — catálogo en
  59 cartas, `gen_metodo.py --check` verde.
- **Esquema:** 7 entidades nuevas + 2 extensiones (D-24…D-30) — `objeto.schema.yaml` en 20 nodos,
  `gen_schema.py` verde, `go test ./...` verde (paridad intacta).
- **Contrato de build:** [`08-nivel-1-contrato-de-construccion.md`](08-nivel-1-contrato-de-construccion.md)
  — frontera, entidades, qué lee cada panel, estados vacíos honestos, derivados, 17 acciones,
  12 escenarios de aceptación, casuística del fixture y trazabilidad.

Camino corto para construirlo: **(a)** poblar el golden fixture con la casuística de `08 § 5` ·
**(b)** extender `go/objeto.go` para leer las 7 carpetas nuevas y devolverlas en `/api/objeto` (los
derivados se computan al leer, jamás se guardan) · **(c)** construir los 4 movimientos contra el banco
PRENTER (`[[ui-design-system]]`) · **(d)** live-verify ejerciendo acciones reales, no `GET 200`.

## Orden sugerido para la sesión de construcción (resto de la historia)

1. Ratificar concepto visual final con el operador (¿quedan comentarios sobre v8.2?).
2. `/po-ux` a mano (el KIT no trae los roles — memoria `arnes-kit-gap-roles-a-mano`): `01-spec.md`
   con § Mapa funcional + § Pantallas + scenarios, decidiendo scope vs `cruce-estructura-…` y las
   4 tabs actuales (supersede vs convive).
3. `/architect` a mano: React Flow sí/no · lift map-canvas · plan de migración lente-por-lente ·
   tickets con átomos PRENTER citados.
4. Construir con TDD; live-verify = ejercer `/api/objeto` + UI real (no "GET 200").
