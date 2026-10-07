# 01-spec.md — Cruce estructura × operación: el hilo de oro medido (tab Indicadores)

---
story_id: cruce-estructura-operacion-indicadores
type: ui-story
module: cockpit
capability: cockpit/cruce-estructura-operacion-indicadores
cap_change_type: new
po_version: 1
last_modified: 2026-07-19
ratified_by_chris: false
links:
  story_yaml: story.yaml
  story_md: 00-story.md
  ledger: CK-18 · CK-21 · CK-23
  schema: ../../../../../sistema/schema/objeto.schema.yaml (v2)
  reusa: ../../../../../ui/components/negocio/NegocioView.tsx (PersonasTab, HiloTab, ProcesoDrawer, SEMAFORO)
---

## Resumen ejecutivo

Nueva tab **"Indicadores"** dentro del shell `/negocio` que cruza el objeto normalizado
(`GET /api/objeto?empresa=`) por sus tres ejes ya modelados en el schema v2 — **objetivo**
(vía `key_results[].kpi_ref`), **proceso** (`kpi.proceso_ref`) y **rol/área** (`kpi.dueño_ref`,
resolución "nivel" = jerarquía de área) — mostrando semáforo por banda de salud, serie de
mediciones y drill-down por unidad de ejecución (`unidad_ref`, D-07). Es el "hilo de oro medido"
del twin: cierra el puente entre estructura (N6) y operación, hoy servida por el golden-fixture
(CK-23 twin-first), mañana por el lakehouse (N16, F1.4) sin cambiar la vista.

## § Dónde vive

- **Zona/caja:** Cockpit (N13) — no aplica el árbol Valeria/Lisa del CORE (`arquitectura-as-code.md`
  supersede); esta historia ancla a **N13**.
- **Shell:** el shell existente `shell-por-rol` (CAP-05) — `CockpitShell`/`CockpitShellConnected` +
  selector de empresa. Sin shell nuevo.
- **Ruta del usuario:** `/negocio` (misma ruta) → nueva tab `indicadores` en el arreglo `tabs` de
  `NegocioView.tsx` (junto a `mapa` · `hilo` · `brechas` · `personas`), lazy-mount vía `Tabs`
  variant `line` (patrón ya usado por `PersonasTab`).
- **Backend:** extiende `GET /api/objeto?empresa=` (`go/objeto.go`) — NO se crea endpoint nuevo.
  Nueva función `derivaSemaforo(kpis []map[string]any)` en el mismo archivo, mismo patrón que
  `derivaDivergente` (línea 266): anota `semaforo` en el payload, nunca persiste en disco (RN-9
  del schema se extiende al semáforo por la misma doctrina "lo derivado se computa al leer").

## Doctrina heredada (lo que esta historia NO decide — ya está decidido)

| Fuente | Qué manda aquí |
|---|---|
| **CK-23 (twin-first)** | Se construye CONTRA el golden-fixture (`organizacion-ficticia-golden-fixture`, done); el lakehouse (N16, BL-22) lo reemplaza en F1.4 sin tocar esta vista — la dependencia real HOY es el fixture, no el lake. |
| **cockpit-stack.md** | Single-tenant, sin auth/DB hoy → escenarios de tenant-isolation/cross-tenant son `not_applicable_reason` (no aplican). UI Tailwind ad-hoc, sin design-system canónico (BL-04 pendiente) → sin `§ Mockup FINAL`/Storybook. |
| **objeto.schema.yaml v2** | `kpi.banda{target,umbral_amarillo?,umbral_rojo?}`, `kpi.contribuye_a[].kr_ref`, `kpi.rollup` (declarado, NO computado — "el motor computa, jamás guarda el resultado"), `kpi.mediciones[]` con `valor_declarado`/`valor_observado`/`unidad_ref` (D-07), `objetivo.key_results[].kpi_ref`. |
| **RN-9 (schema-v2)** | Lo derivado (`divergente`, y ahora `semaforo`/`rollup` de exhibición) se computa al leer, jamás se persiste. |
| **CK-24** | El twin mide roles/procesos/áreas, nunca persona — `kpi.dueño_ref` es rol o área, jamás persona; esta vista no introduce ninguna vista "por persona". |

## Prior art applied (anti-duplication-refining)

Scan cross-tree (`go/`, `ui/`, `docs/product/modules/cockpit.md`) ANTES de diseñar:

- **`go/objeto.go` `derivaDivergente`** (línea 266) — precedente EXACTO del patrón "se computa en
  el payload, no se persiste" (RN-9). `derivaSemaforo` se escribe al lado, mismo archivo, mismos
  helpers (`oNum`, `oMap`, `oList`, `oStr`).
- **`ui/lib/personas.ts`** (`getPersonas`, `quienesCumplen`, `rolesDePersona`, `procesosDelRol`) —
  patrón "rebanada de `/api/objeto` + helpers puros de scan inverso". `ui/lib/indicadores.ts` se
  escribe igual: `getIndicadores(empresa)` + `kpisDeObjetivo`/`kpisDeProceso`/`kpisDeRolArea`/
  `resolverCadenaKpiKrObjetivo` (cero estado, cero fetch dentro).
- **`ui/components/negocio/PersonasTab.tsx`** — plantilla exacta de la tab nueva: fetch propio +
  `Spinner`/`ErrorBanner`/`EmptyState`, independiente del `negocio` (nullable) cargado por la tab
  Mapa/Hilo.
- **`ui/components/negocio/NegocioView.tsx`** `SEMAFORO` (línea 34) — patrón dot-color reusado
  (hoy 3 colores para `Digital`; acá se agrega la variante 4 colores incl. "sin dato" gris, NO se
  recrea el componente `Legend`/dot).
- **`ProcesoDrawer`** (línea 624) — plantilla directa del drawer de detalle por KPI (bloque
  "Procedencia sin falsa certeza" ya construido, se reusa tal cual para `fuente`/`conf` del KPI y
  de cada medición).
- **`HiloTab`** (línea 409) — cascada objetivo→proceso ya existe pero opera sobre `negocio.yaml`
  (proyección curada, D-13), NO sobre `kpi`/`key_results` del objeto normalizado — no se extiende
  ese componente (fuentes de datos distintas); se construye la tab nueva en paralelo, con el mismo
  lenguaje visual.
- **`ui/lib/negocio.ts`** `request()`/`NegocioApiError` — cliente HTTP reusado tal cual.

**Gap real (lo único nuevo):** `derivaSemaforo` (Go) + `ui/lib/indicadores.ts` (helpers puros) +
tab `IndicadoresTab` (UI) + capability yaml (no existe todavía).

## § Mapa funcional (capa humana — ratifica Chris ANTES de architect)

### 1. Happy path (el camino dorado, narrado)

1. El usuario entra a `/negocio`, elige una empresa del selector y abre la tab **Indicadores**
   (nueva, junto a Mapa/Hilo/Brechas/Personas).
2. La tab pide `/api/objeto?empresa=<slug>` (mismo endpoint que Personas) y muestra los KPIs
   agrupados por **objetivo** (vía `key_results[].kpi_ref`), por **proceso** (`proceso_ref`) y por
   **rol/área** (`dueño_ref`, resuelto hasta el área en el árbol de `areas`) — tres vistas/filtros
   sobre la misma lista, no tres fetches.
3. Cada KPI se pinta con **semáforo** (verde/amarillo/rojo/gris "sin dato"), calculado por Go
   (`derivaSemaforo`) a partir de `banda` + la medición consolidada más reciente (sin `unidad_ref`).
4. El usuario abre el drawer de un KPI (reusa `ProcesoDrawer`) y ve: la serie de mediciones (tabla
   o sparkline simple), la cadena `kpi → KR (peso) → objetivo`, el corte por unidad de ejecución
   (`unidad_ref`) cuando existe, y la procedencia (`fuente`/`conf`) de la definición y de cada
   medición.
5. Si la empresa no tiene KPIs todavía → empty-state (mismo componente que Personas). Si falla el
   fetch → `ErrorBanner` con retry.

### 2. Bifurcaciones (árbol de decisión)

```
Happy path
├─ Bif-1 · ¿el KPI tiene `umbral_amarillo`?
│    ├─ sí → semáforo 3 colores (verde/amarillo/rojo)          → SC-1
│    └─ no → semáforo 2 colores (verde/rojo) — caso kpi-ausentismo → SC-5
├─ Bif-2 · dirección del KPI (inferida, sin campo nuevo en el schema):
│    ├─ target > umbral_rojo → "mayor-es-mejor" (ascendente)   → SC-1
│    └─ target < umbral_rojo → "menor-es-mejor" (descendente)  → SC-1
├─ Bif-3 · ¿el KPI no tiene ninguna medición?
│    → semáforo "sin dato" (gris), NUNCA rojo por ausencia     → SC-4
├─ Bif-4 · ¿usuario filtra por objetivo/proceso/rol-área?
│    → lista de KPIs de esa entidad (scan inverso, sin fetch nuevo) → SC-2
├─ Bif-5 · ¿el KPI tiene mediciones con `unidad_ref`?
│    → drawer muestra corte por unidad además del consolidado  → SC-3
├─ Bif-6 · ¿falla `GET /api/objeto`?
│    → ErrorBanner + retry (patrón PersonasTab)                → SC-6
└─ Bif-7 · ¿empresa sin KPIs (`kpis: []`)?
     → EmptyState (mismo componente que Personas)               → SC-7
```

### 3. Reglas de negocio (RN)

- **RN-1** — La dirección del KPI (mayor-es-mejor / menor-es-mejor) se **infiere** comparando
  `target` contra `umbral_rojo` — NO se agrega ningún campo nuevo al schema v2 (`sentido`/`direccion`
  no existen ni se crean).
- **RN-2** — Semáforo: verde si el valor vigente alcanza/supera `target` (según dirección); amarillo
  si cruza `umbral_amarillo` pero no `target`; rojo si cruza `umbral_rojo`. Si falta
  `umbral_amarillo` → semáforo de 2 colores partiendo directo de `umbral_rojo` (Bif-1).
- **RN-3** — El "valor vigente" para el semáforo consolidado es la medición **más reciente por
  fecha, SIN `unidad_ref`** (la serie consolidada). Las mediciones CON `unidad_ref` alimentan
  exclusivamente el drill-down por unidad — nunca el semáforo consolidado.
- **RN-4** — Precedencia de valor dentro de una medición: `valor_observado.valor` si está presente,
  si no `valor_declarado` (mismo criterio que ya usa `derivaDivergente` para comparar ambos).
- **RN-5** — Los tres ejes (objetivo/proceso/rol-área) se resuelven por **scan inverso** sobre las
  refs YA existentes del objeto normalizado (`kpi.proceso_ref`, `kpi.dueño_ref`,
  `kpi.contribuye_a[].kr_ref`, `objetivo.key_results[].kpi_ref`, `proceso.areas_ref`,
  `area.parent_ref`) — cero campos nuevos al schema, mismo patrón que `ui/lib/personas.ts`.
- **RN-6** — `kpi.rollup` (peor-hijo/promedio/ponderado) se **exhibe como metadato informativo**
  (badge), NO se computa en este MVP (decisión ratificada — el consolidado mostrado es el que YA
  trae `mediciones` sin `unidad_ref`; el motor de agregación real es un scope futuro, cuando el
  lakehouse reemplace los valores hardcodeados).
- **RN-7** — `divergente` (ya derivado por `derivaDivergente`, RN-9 schema) se expone como badge
  junto al valor, sin afectar el cálculo del semáforo.
- **RN-8** — KPI sin ninguna medición → estado "sin dato" (gris), nunca rojo por ausencia (Bif-3).

### 4. Criterios de aceptación (AC)

- [ ] **AC-1** — Tab "Indicadores" nueva en `/negocio`, lazy-mount, junto a Mapa/Hilo/Brechas/Personas.
- [ ] **AC-2** — `derivaSemaforo` en Go anota `semaforo: verde|amarillo|rojo|sin-dato` en cada KPI
  del payload de `/api/objeto`, sin persistir nada en disco (test unitario Go + mutación, TDD).
- [ ] **AC-3** — La vista agrupa/filtra KPIs por **objetivo** (vía KR) Y por **proceso**
  (`proceso_ref`) Y por **rol/área** (`dueño_ref` resuelto hasta el área) — los tres ejes
  navegables en el MVP.
- [ ] **AC-4** — El drawer de detalle muestra: serie de mediciones, cadena `kpi→KR(peso)→objetivo`,
  corte por `unidad_ref` cuando exista, procedencia (`fuente`/`conf`).
- [ ] **AC-5** — Empty-state (empresa sin KPIs) y error-state (fetch falla) cubiertos, patrón
  `PersonasTab`.
- [ ] **AC-6** — Verificado EN VIVO contra ≥2 shells del golden-fixture (terranova + 1 más) con
  semáforo real en al menos 2 colores distintos (evidencia ya confirmada en el checkpoint de
  `organizacion-ficticia-golden-fixture` § SC-3: semáforo pinta los 3 colores dentro de la flota).

## § Pantallas (campos NUEVOS vs EXISTENTES)

| Vista / pantalla | Campo | Nuevo o existente | Origen (entidad/cap) | Validación |
|---|---|---|---|---|
| Tab Indicadores | Selector de eje (objetivo / proceso / rol-área) | Nuevo | — | — |
| Tab Indicadores | Lista de KPIs con dot de semáforo + valor + banda | Nuevo | `kpi.banda` + `mediciones` | `derivaSemaforo` (Go) |
| Tab Indicadores | Badge "divergente" | Existente (ya derivado) | `medicion.divergente` | `derivaDivergente` (ya en Go) |
| Tab Indicadores | Badge rollup declarado (informativo) | Nuevo | `kpi.rollup` | RN-6 |
| Drawer KPI | Serie de mediciones (tabla/sparkline) | Nuevo | `kpi.mediciones` | — |
| Drawer KPI | Corte por unidad (`unidad_ref`) | Nuevo | `medicion.unidad_ref` → `empresa.unidades` | — |
| Drawer KPI | Cadena `kpi → KR (peso) → objetivo` | Nuevo | `kpi.contribuye_a` + `objetivo.key_results` | `resolverCadenaKpiKrObjetivo` (nuevo helper puro) |
| Drawer KPI | Procedencia (fuente/conf) definición + medición | Existente (patrón `ProcesoDrawer`) | `kpi.fuente/conf`, `medicion.fuente/conf` | — |
| Leyenda | Semáforo 4 estados (verde/amarillo/rojo/sin-dato) | Nuevo (extiende `SEMAFORO`/`Legend`) | — | — |

## § Dudas resueltas (RONDA 1 — pre-FIRMA 1)

1. **Ubicación en el shell:** tab nueva en `/negocio` (no ruta separada) — reusa selector de
   empresa + shell-por-rol.
2. **Eje "nivel":** jerarquía de área/organigrama (drill-down Directorio→Finanzas→Cobranza), no
   horizonte estratégico temporal (eso ya lo cubre parcialmente `HiloTab` sobre `negocio.yaml`).
3. **Alcance rollup:** el MVP lee el consolidado que YA trae `mediciones` (sin `unidad_ref`) tal
   cual; NO computa agregación real desde los cortes por unidad. El motor de rollup real queda
   fuera de esta historia.
4. **DuckDB/lakehouse (mencionado en `00-story.md`, pre-CK-21/CK-23):** diferido a
   `lakehouse/construir-lakehouse-dlt-ducklake` (F1.4). Esta historia lee `/api/objeto` contra el
   golden-fixture, igual que el resto del twin — mismo patrón CK-23.

## Acceptance Criteria (Gherkin)

### SC-1 — `semaforo-por-banda` (`type: happy`)
**Covers:** AC-2, Bif-1, Bif-2, RN-1, RN-2, RN-3, RN-4
**Given:** un KPI con `banda{target,umbral_amarillo,umbral_rojo}` y ≥1 medición consolidada
(sin `unidad_ref`)
**When:** `GET /api/objeto?empresa=terranova`
**Then:** el payload trae `semaforo` calculado (verde/amarillo/rojo) coherente con la dirección
inferida (target vs umbral_rojo) y el valor vigente (`valor_observado` > `valor_declarado`)
**playwright_required:** false
**Graders:** test unitario Go (`derivaSemaforo`, tabla de casos con las 3 direcciones/colores) +
live-verify `GET /api/objeto?empresa=terranova` real, inspección de la respuesta

---

### SC-2 — `agrupar-por-eje` (`type: happy`)
**Covers:** AC-3, Bif-4, RN-5
**Given:** el objeto normalizado de terranova con objetivos/procesos/áreas/kpis poblados
**When:** el usuario cambia el filtro/eje entre objetivo, proceso y rol-área en la tab Indicadores
**Then:** cada vista lista exactamente los KPIs que resuelven la ref correspondiente (scan
inverso), sin fetch adicional
**playwright_required:** false
**Graders:** test vitest de `ui/lib/indicadores.ts` (helpers puros) + inspección manual en el
navegador contra el binario real

---

### SC-3 — `drill-down-cadena-y-unidad` (`type: happy`)
**Covers:** AC-4, Bif-5
**Given:** `kpi-dso` (terranova) con `contribuye_a` a 2 KRs y mediciones con `unidad_ref`
(empresa#u1/u2)
**When:** el usuario abre el drawer del KPI
**Then:** se ve la cadena kpi→KR(peso)×2→objetivo resuelta y el corte por unidad (Aurora sana,
Marina enferma — evidencia ya viva en el fixture, checkpoint § SC-3 de golden-fixture)
**playwright_required:** false
**Graders:** live-verify manual en navegador + test vitest del helper `resolverCadenaKpiKrObjetivo`

---

### SC-4 — `sin-dato-no-es-rojo` (`type: edge`)
**Covers:** RN-8, Bif-3
**Given:** un KPI con `banda` pero `mediciones: []`
**When:** se calcula el semáforo
**Then:** estado "sin dato" (gris), NUNCA rojo
**playwright_required:** false
**Graders:** test unitario Go (`derivaSemaforo`, caso mediciones vacías)

---

### SC-5 — `semaforo-dos-colores` (`type: edge`)
**Covers:** Bif-1
**Given:** `kpi-ausentismo` (vulcano) — `banda: { target: 2.5, umbral_rojo: 5 }` sin
`umbral_amarillo`
**When:** se calcula el semáforo
**Then:** solo verde o rojo (nunca amarillo) — el semáforo de 2 colores es un caso válido, no un
error
**playwright_required:** false
**Graders:** test unitario Go (caso `umbral_amarillo` ausente) + live-verify `GET
/api/objeto?empresa=vulcano`

---

### SC-6 — `network-failure` (`type: edge`, sub: network_failure)
**Covers:** Bif-6
**Given:** el usuario está en la tab Indicadores
**When:** `GET /api/objeto` falla (500/timeout/binario caído)
**Then:** `ErrorBanner` visible con mensaje claro es-419, sin white screen (patrón `PersonasTab`)
**playwright_required:** false (sin runner e2e en el toolchain — `cockpit-stack.md`; verificación
manual + test vitest mockeando `request()` con rechazo)
**Graders:** vitest (mock fetch reject) + inspección manual

---

### SC-7 — `empty-state` (`type: edge`, sub: empty_state)
**Covers:** Bif-7
**Given:** una empresa con `kpis: []`
**When:** el usuario abre la tab Indicadores
**Then:** `EmptyState` con microcopy es-419 ("Aún no hay indicadores cargados..."), no white screen
**playwright_required:** false
**Graders:** vitest + inspección manual

---

### Sub-categorías v4.1 — N/A ratificables

`race-condition` · `concurrent-users` → `not_applicable_reason: "single-tenant · sin auth ni DB
(cockpit-stack) · lectura read-only, sin writes concurrentes"`.
`large-dataset` → `not_applicable_reason: "fixture ≤20 KPIs por shell hoy; sin paginación
requerida a esta escala — revisar si el lakehouse (F1.4) cambia el volumen"`.
`i18n` → `not_applicable_reason: "una moneda/locale por empresa hoy, sin requisito de mostrar
múltiples locales en la misma vista — es-419 sin voseo ya cubierto como copy, no como feature"`.
`accessibility` → cubierta como NFR manual (sin scanner automatizado en el toolchain — ver §
Non-functional), no como scenario Playwright.

## § Matriz de cobertura (sembrada — dev-team la mantiene viva)

| Ítem (Mapa funcional) | Tipo | estado | Cubierto por | Verificación REAL |
|---|---|---|---|---|
| Bif-1 · umbral_amarillo ausente | branch | ⬜ pendiente | SC-5 | — |
| Bif-2 · dirección inferida | branch | ⬜ pendiente | SC-1 | — |
| Bif-3 · sin mediciones | branch | ⬜ pendiente | SC-4 | — |
| Bif-4 · filtro por eje | branch | ⬜ pendiente | SC-2 | — |
| Bif-5 · corte por unidad | branch | ⬜ pendiente | SC-3 | — |
| Bif-6 · fetch falla | branch | ⬜ pendiente | SC-6 | — |
| Bif-7 · empresa sin KPIs | branch | ⬜ pendiente | SC-7 | — |
| RN-1..RN-8 | rule | ⬜ pendiente | SC-1, SC-4, SC-5 | — |
| AC-1..AC-6 | accept | ⬜ pendiente | SC-1..SC-7 | — |

**Huecos detectados:** ninguno · **SC huérfanos:** ninguno · **Diferido:** motor de rollup real
(RN-6) y lectura DuckDB/lakehouse (duda 4) — ambos explícitamente fuera de esta historia.

## Non-functional requirements

| Categoría | Requisito | Verificador |
|---|---|---|
| Latencia | `/api/objeto` con `semaforo` anotado sigue <1s p95 (NFR heredado de schema-v2/golden-fixture) | benchmark go test / medición live |
| Accesibilidad | Contraste AA en dots de semáforo (no depender solo del color — ícono/texto alternativo); foco visible en filtros | revisión manual (sin scanner automatizado en el toolchain) |
| i18n | Copy es-419 sin voseo | revisión |
| Ficción/datos | Cero campo nuevo al schema v2 (RN-1, RN-5) | revisión de diff en `objeto.schema.yaml` (debe quedar intacto) |

## Constraints técnicos heredados

- `.claude/rules/cockpit-stack.md` — sin auth/DB, UI Tailwind ad-hoc, sin Storybook.
- `.claude/rules/test-design-doctrine.md` — verificación REAL (acción + efecto, nunca "GET 200");
  TDD para `derivaSemaforo` (RED con tabla de casos primero).
- `sistema/schema/DECISIONES.md` D-07 (unidad de ejecución) · D-13 (negocio.yaml curado, no tocar) ·
  RN-9 (derivado nunca persiste, schema-v2).
- `.claude/rules/anti-duplication.md` — CERO campo nuevo al schema, CERO endpoint nuevo, CERO
  parser nuevo (reusa `oNum`/`oMap`/`oList`/`oStr` de `objeto.go`).

## Cross-module impact

- **Lee de:** `go/objeto.go` (`/api/objeto` — kpis, objetivos, procesos, roles, areas).
- **Depende de (done):** `schema-v2-hilo-de-oro-kinetica`, `organizacion-ficticia-golden-fixture`.
- **Desbloquea:** `cockpit/brecha-proyecto-ciclo-vida` (F1.1, consume el mismo semáforo/cadena para
  priorizar brechas).
- **NO toca:** `negocio.yaml`/`HiloTab` (fuente de datos distinta, D-13) · `objeto.schema.yaml`
  (cero campos nuevos) · el lakehouse (F1.4, fuera de scope).

## Open questions

Ninguna pendiente — las 4 dudas de RONDA 1 se resolvieron con el operador (§ Dudas resueltas)
antes de este draft.

## Próximo paso

Ratificación del operador (FIRMA 1) sobre `§ Mapa funcional` + `§ Pantallas` → `/architect` a mano
(`03-arch.md` + `04-validators.yaml` + `06-tickets.yaml`, `refined → ready`). Secuencia de tickets
propuesta: `derivaSemaforo` (Go, TDD) → `ui/lib/indicadores.ts` (helpers puros, TDD vitest) →
`IndicadoresTab` (UI, reusa Drawer/Tabs/Spinner) → capability yaml + live-verify contra ≥2 shells
del fixture.

## Changelog

- v1 2026-07-19 — draft inicial post prior-art scan (Go `derivaDivergente`, `ui/lib/personas.ts`,
  `PersonasTab`/`ProcesoDrawer`/`SEMAFORO`) + 4 dudas resueltas con el operador (ubicación tab,
  eje "nivel"=área, rollup diferido, DuckDB diferido a F1.4): mapa funcional, 8 RN, 6 AC, 7
  scenarios Gherkin, matriz de cobertura sembrada.
