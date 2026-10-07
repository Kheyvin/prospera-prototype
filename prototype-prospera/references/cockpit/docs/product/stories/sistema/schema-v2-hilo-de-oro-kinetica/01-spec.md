# 01-spec.md — objeto.schema v2: hilo de oro medible + capa kinética

---
story_id: schema-v2-hilo-de-oro-kinetica
type: service-story
module: sistema
capability: cockpit/api-objeto
cap_change_type: extend
po_version: 2
last_modified: 2026-07-17
ratified_by_chris: true           # FIRMA 1 del operador 2026-07-17 ("firmo, pasa a architect") sobre v2 (dudas resueltas + investigación LATAM/BR integrada)
links:
  story_yaml: story.yaml
  story_md: 00-story.md
  research: 00-research-latam-br.md
  ledger: CK-21 (D6) · CK-23 · CK-24
  registro_heredado: ../arquitectura-refichado-ck21/01-spec.md § Insumos cementados (1-11)
---

## Resumen ejecutivo

Evolucionar `sistema/schema/objeto.schema.yaml` de v1 (9 entidades, CK-12/CK-13) a **v2 — 12
entidades**: (a) el **hilo de oro se vuelve medible en el dato** — `kpi`, `proyecto_mejora` e
`idea` entran como entidades de primera clase, `objetivo` se completa como entidad OKR plena, y la
cascada canónica única queda recorrible por aristas, con **modo de cadencia configurable**
(OKR-trimestral | GPD-anual | mixto) que cubre los tres mercados (startup/hispano/Brasil) con UN
solo grafo; (b) nace la **capa kinética** — acciones válidas por entidad declaradas como dato,
contrato que la Gestión de Cambios (BL-24) ejecutará; (c) **corte limpio, cero deprecados**
(decisión del operador): las formas v1 muertas se eliminan y el shell `prenter` se migra en esta
misma historia; (d) el catálogo del método gana las M-cards que la investigación LATAM/BR mandó
(GPD · DMAIC · MASP · gestión de ideas) + dimensión `mejora-proyectos` → **NOTACIONES.html se
regenera en sintonía**. El consumidor `/api/objeto` (CAP-08) asciende a v2 COMPLETO: sirve y
valida las 12 entidades juntas (decisión del operador: "visualizar la información completa lo más
pronto").

## § Dónde vive

- **node:** `transversal` (SSoT `sistema/schema/` + `sistema/metodo/`) con consumidor en **N13**
  (`go/objeto.go` → `/api/objeto`, CAP-08).
- Historia **schema + servicio**: contrato YAML v2 · book (`docs/metodo/objeto/`) ·
  SSoT nuevos (`verbos.yaml`, capa kinética) · M-cards + dimensión nueva en
  `sistema/metodo/methodologies.yaml` (NOTACIONES regenera) · validador Go · **migración del
  shell prenter a formas v2**. Sin superficie UI nueva.
- Live-verify (seam): `GET /api/objeto?empresa=<id>` ejercido de verdad — `prenter` migrado
  (valida limpio) + mini-fixture de test v2 (cada entidad/arista nueva ejercida). El fixture
  COMPLETO = historia siguiente (`organizacion-ficticia-golden-fixture`, CK-23 — directiva del
  operador registrada allí: corporación ficticia ~200 empleados, un área completa primero).

## Doctrina — heredada + verificada por investigación (00-research-latam-br.md)

| Fuente | Qué manda |
|---|---|
| Cascada canónica ÚNICA (refichado WS5 · METODOLOGIA.md §2) | `plan 3 años → plan anual → objetivo → KR → KPI (de proceso, dueño = ROL o área) → actividad (verbo)`. El modo GPD NO la cambia: mismo grafo, cadencia anual + desdobramento por nivel. |
| **CK-24** (frontera persona) | KPI ancla a rol/proceso/área; persona = ocupante del rol. La **autoría** de una idea sí es de persona (reconocimiento al proponente — práctica kaizen teian); la **medición** jamás. |
| **D-07** (unidad de ejecución) | `unidad_ref` en la MEDICIÓN del KPI; `entidad_legal_ref` = atributo. La entidad de mejora se llama **`proyecto_mejora`** para no colisionar con el `tipo: proyecto\|obra\|sucursal` de las unidades (Misnomer resuelto). |
| OKR↔KPI (research A — Doerr/Castro/Wodtke/Perdoo, unánime) | KPI = salud permanente con banda (solo exige acción fuera de banda); KR = cambio con vencimiento. **Frontera permeable bidireccional**: KPI enfermo ↑ KR del ciclo; KR logrado ↓ KPI monitoreado; el KR puede referenciar la serie de un KPI (`kpi_ref`). |
| "No OKR individual" (research A — Spotify primario, Klau, HBR 2020, Bock) | Confirmado con fuentes: OKR de equipo + KR ownership por rol. Razones: sandbagging, task-list, costo admin. **Divorcio KR ↔ compensación** salvo modo GPD (donde el acople a PLR es el estándar BR). |
| Estándar regional (research A/B) | Brasil = **GPD/Falconi** (desdobramento anual + PDCA + PLR; Falconi = 3 de 4 "Melhores e Maiores") · LATAM hispano = **BSC** como mapa (`perspectiva`) · OKR = cadencia 90d. Modo = **configuración de empresa**, no entidades distintas. |
| Proyectos de mejora (research C) | PDCA paraguas; dialectos DMAIC (formal+belts, vigente) · MASP (estándar BR) · Kaizen (piso). Ciclo con **charter + doble firma (sponsor + finanzas)**, estandarización como estado propio, **auditoría de beneficios ~12 meses**. **Idea = entidad separada** (funil barato) enlazada al proyecto. |
| Doctrina Palantir (CK-21/D6) | Identidad ≠ observación; acciones = operaciones de negocio; naming navegable; provenance structs; open/closed. |

## Resolución de las 5 dudas (respuestas del operador, 2026-07-17)

1. **`ext:` AHORA** — ignore-and-preserve (§ G).
2. **Cero deprecados** — corte limpio: `proceso.kpis` embebido, `tiempo` string y `reporta_a`
   forma simple SE ELIMINAN del schema; `prenter` se migra en esta historia. Forma v1 muerta en
   una instancia = ERROR de validación nombrando la forma nueva (no warning eterno).
3. **Triage ratificable** — `triage {veredicto, fuente, conf}` opcional: el motor deriva, el
   consultor ratifica/corrige, auditado.
4. **Go COMPLETO** — `/api/objeto` v2 sirve y valida las 12 entidades en esta historia.
5. **Seed de verbos** — diseñado contra la corporación ficticia (~200 empleados, un área
   completa); prenter como referencia secundaria. Directiva registrada en la historia del fixture.

## § Mapa funcional (capa humana — ratifica Chris ANTES de architect)

### 1. Happy path (el camino dorado, narrado)

1. El shell de la empresa declara su **modo estratégico** (`empresa.config_estrategia.modo`:
   `okr-trimestral | gpd-anual | mixto`) y sus unidades de ejecución (D-07).
2. Los objetivos bajan en cascada (`parent_ref`, horizonte 3a→anual→trimestre); cada KR mide el
   cambio del ciclo y puede referenciar la serie de un KPI existente (`kpi_ref`).
3. Cada **KPI** (`kpis/kpi-*.yaml`) ancla a su proceso, tiene dueño rol/área (CK-24), banda de
   salud, y mediciones con provenance (declarado y/u observado, por unidad de ejecución).
4. El personal propone **ideas** (`ideas/idea-*.yaml`, individual o conjunta); el comité evalúa;
   las promovidas se vuelven **proyectos de mejora** (`proyectos-mejora/pm-*.yaml`) — que también
   nacen directo de brechas del twin (el diferenciador).
5. El proyecto recorre su ciclo (charter + doble firma sponsor/finanzas → ejecución → verificación
   contra baseline → estandarización → auditoría de beneficios → cierre) y declara qué KPI/KR
   mueve; al cerrar, registra el delta observado — el loop brecha→proyecto→KPI-movido queda EN el
   dato.
6. `GET /api/objeto?empresa=<id>` valida y sirve las **12 entidades juntas**; el hilo es
   recorrible en ambos sentidos; el pre-commit gatea los SSoT nuevos (verbos, acciones, M-cards).

### 2. Bifurcaciones (árbol de decisión)

```
Happy path
├─ Bif-1 · ¿instancia usa una forma v1 muerta (proceso.kpis · tiempo str · reporta_a simple)?
│   └─ sí → ERROR nombrando la forma v2 que la reemplaza (corte limpio, duda 2)   → SC-2
├─ Bif-2 · ¿kpi.dueño_ref apunta a persona?     → rechazo explícito citando CK-24  → SC-3
├─ Bif-3 · ¿ref del hilo colgante (contribuye_a / kpi_ref / alimenta_kpi_refs /
│          origen_*_refs / mueve_refs / unidad_ref / promovida_a_ref)? → warning    → SC-4
├─ Bif-4 · ¿actividad.verbo fuera del vocabulario?
│   ├─ sinónimo conocido → warning + sugerencia de normalización                   → SC-5
│   └─ desconocido       → warning "verbo sin clasificar"                          → SC-5
├─ Bif-5 · ¿verbo nuevo en verbos.yaml sin clase ALM×MGI completa? → gate FALLA    → SC-5
├─ Bif-6 · ¿acción kinética malformada (entidad inexistente · nivel inválido ·
│          id "set-campo")?                       → gate pre-commit FALLA          → SC-6
├─ Bif-7 · ¿medición con declarado ≠ observado?  → `divergente` DERIVADO al leer   → SC-7
├─ Bif-8 · ¿objetivo sin key_results?            → warning `sin-ancla-de-valor`    → SC-8
├─ Bif-9 · ¿verbo corregido sin provenance?      → warning (score gameable)        → SC-9
├─ Bif-10 · ¿proyecto_mejora transición inválida (p.ej. propuesto→cerrado) o cierre
│           con hard-saving sin firma de finanzas? → ERROR · loop-back
│           en-verificacion→en-ejecucion = VÁLIDO (MASP)                           → SC-10
└─ Bif-11 · ¿kr.acople_compensacion: true con modo okr-trimestral? → ERROR
            (divorcio KR↔compensación — sandbagging)                               → SC-11
```

### 3. Reglas de negocio (RN — se reflejan en la cap `cockpit/api-objeto`)

- **RN-8** — `kpi.dueño_ref` resuelve a rol o área, **nunca** a persona (CK-24).
- **RN-9** — toda medición lleva `fuente`+`conf`; `divergente` se DERIVA al leer, jamás se persiste.
- **RN-10** — acciones kinéticas = operaciones de negocio, nunca "set-campo"; gate anti-Sprawl.
- **RN-11** — `actividad.verbo` ∈ vocabulario (o sinónimo normalizable); verbo nuevo = PR con
  clase ALM×MGI (gate).
- **RN-12** — `proyecto_mejora.estado` transita solo por acción kinética; el charter exige
  **doble firma**: sponsor (negocio) + finanzas (validación del caso).
- **RN-13** — scores RPA/agente, rollup del semáforo y `divergente` = DERIVADOS; `triage` es
  ratificable con provenance (el motor propone, el consultor corrige, auditado).
- **RN-14** — divorcio KR↔compensación: `acople_compensacion: true` solo válido con
  `config_estrategia.modo ∈ {gpd-anual, mixto}` (Bock/research A; en GPD el acople a PLR es el
  estándar BR).
- **RN-15** — un `proyecto_mejora` con beneficio `hard-saving` no llega a `cerrado` sin
  `firmas.finanzas` post-verificación (auditoría de beneficios, research C).
- **RN-16** — `idea` y `proyecto_mejora` son entidades separadas enlazadas; el proyecto puede
  nacer sin idea (de una brecha del twin). La autoría de la idea es de persona(s)
  (reconocimiento); las métricas de participación se agregan por área/rol (CK-24).
- **RN-4′** — `objetivo.key_results` opcional; ausencia = warning `sin-ancla-de-valor`.

### 4. Criterios de aceptación (AC — checklist de cierre)

- [ ] **AC-1** — `objeto.schema.yaml` `meta.version: 2`: **12 entidades** (9 + `kpi` +
  `proyecto_mejora` + `idea`), aristas nuevas en `relaciones:`, invariantes v2, backbone O7
  (estrato Mejora), `config_estrategia` en empresa. Cero campos deprecados.
- [ ] **AC-2** — `/api/objeto` sirve y valida el objeto v2 ENTERO (12 entidades); **prenter
  MIGRADO** a formas v2 valida limpio en vivo; mini-fixture v2 ejercita cada entidad/arista nueva.
- [ ] **AC-3** — `sistema/schema/verbos.yaml`: seed clasificado ALM×MGI diseñado contra la
  corporación ficticia (~200 empleados) + `sinonimos[]` es-419 + gate.
- [ ] **AC-4** — capa kinética declarada: contrato + catálogo seed (incluye
  `promover-kpi-a-kr` / `decantar-kr-a-kpi` y el ciclo del proyecto con doble firma), gate verde.
- [ ] **AC-5** — deuda saldada: ref muerta `process.schema` resuelta · enum `fuente` + `Observado`
  · `from/to/current` numéricos.
- [ ] **AC-6** — tabla de trazabilidad de los 11 insumos heredados + los 7 veredictos del
  research: cada uno `implementado` o `descartado + razón`.
- [ ] **AC-7** — book coherente: backbone O7 · capítulos breves `kpis.md`, `mejoras.md` (patrón
  `objetivos.md`) · `objetivos.md §6/§8` gana el modo GPD con sus fuentes · glosario al día.
- [ ] **AC-8** — catálogo del método en sintonía: M-cards nuevas **GPD · Lean Six Sigma/DMAIC ·
  MASP · Gestión de ideas (kaizen teian/funil) · ISO 56002 (horizonte)** + dimensión
  `mejora-proyectos` en `methodology.schema.yaml` + bloques `twin:` → **NOTACIONES.html
  regenerado** (gate anti-drift, mismo patrón WS5).

## § Diseño del schema v2 (el corazón — para ratificar forma antes de architect)

### A · Entidad nueva `kpi` — `kpis/kpi-*.yaml` (o_code O2 · ArchiMate Outcome/Metric, Motivation)

- `id` · `nombre` (calificado, anti-Misnomer) · `descripcion`
- `tipologia: enum [kpi, dpi, kri]` · `tipo: enum [lead, lag]`
- `proceso_ref → proceso` (ancla; opcional con warning "hilo incompleto")
- `dueño_ref → rol|area` **requerido** (RN-8/CK-24)
- `unidad_medida` · `banda {target, umbral_amarillo?, umbral_rojo?}` (salud: solo exige acción
  fuera de banda — research A) · `frecuencia: enum [diaria, semanal, mensual, trimestral]`
- `contribuye_a: list {kr_ref → key_result, peso?}` (N:M) · `en_tension_con: list ref → kpi`
  (counter-metric, lado min-id) · `rollup: enum [peor-hijo, promedio, ponderado]`
- `mediciones: list` weak-entity `kpi-x#mN`: `fecha` · `valor_declarado?` ·
  `valor_observado? {valor, query_ref}` · `unidad_ref? → empresa#uN` (D-07) · `fuente` · `conf`
  — `divergente` = derivado al leer (RN-9)
- `fuente` · `conf`

### B · Entidad nueva `proyecto_mejora` — `proyectos-mejora/pm-*.yaml` (o_code O7 · ArchiMate Work Package)

El ciclo brecha/idea→proyecto→KPI movido, con la gramática que la práctica LATAM/BR exige
(charter DMAIC + MASP + funil — research C):

- `id` · `nombre` · `descripcion` · `dueño_ref → rol` · `sponsor_ref → rol`
- `origen_brecha_refs: list ref → brecha` · `origen_idea_refs: list ref → idea` (ambas vacías =
  warning "proyecto sin diagnóstico ni propuesta")
- `metodologia: enum [pdca, dmaic, masp, kaizen]` — dialecto de render/reporte; UN solo ciclo
- `caso_negocio {tipo_beneficio: enum [hard-saving, soft-saving, cost-avoidance,
  aumento-ingresos], beneficio_anualizado, inversion, payback_meses?, roi?,
  formula_beneficio, periodo_realizacion_meses (default 12), supuestos}` (numéricos)
- `prio: enum prio` (WSJF) · `mueve_refs: list {ref → kpi|key_result, delta_esperado?}`
- `estado: enum [propuesto, triaje, en-evaluacion, aprobado, en-ejecucion, en-verificacion,
  estandarizado, beneficios-en-auditoria, cerrado] + [rechazado, suspendido, cancelado]`
  — transiciones por acción kinética (RN-12); `en-verificacion → en-ejecucion` = loop-back
  válido (MASP: si no bloqueó, se retrocede)
- `firmas {sponsor {por_ref, fecha}, finanzas {por_ref, fecha_pre, fecha_post?}}` — doble firma;
  `fecha_post` obligatoria para cerrar con hard-saving (RN-15)
- `hitos: list` weak `pm-x#hN {nombre, fecha, estado}` (tollgates)
- `resultado? {fecha_cierre, delta_observado, veredicto: enum [movio, parcial, no-movio],
  aprendizaje}` — cierra el loop
- `fuente` · `conf`

### C · Entidad nueva `idea` — `ideas/idea-*.yaml` (o_code O7 · propio, Motivation-adyacente)

Funil masivo y barato (kaizen teian / plataformas tipo AEVO — research C):

- `id` · `titulo` · `descripcion` · `proponente_refs: list ref → persona` (≥1 — individual o
  conjunta; AUTORÍA, no medición — RN-16/CK-24)
- `sobre_refs: list ref → proceso|sistema|area` (dónde duele)
- `estado: enum [enviada, en-evaluacion, aprobada, rechazada, promovida]`
- `evaluacion? {comite_ref → rol|area, criterios {viabilidad, impacto, alineacion}, feedback,
  fecha}` · `reconocimiento? {tipo, fecha}`
- `promovida_a_ref? → proyecto_mejora`
- `fuente` · `conf`

### D · Capa kinética — sección `acciones:` (CK-21/D6)

Contrato igual que v1 de esta spec (niveles N13 · aprobación `directa | revision-dueño |
gestion-cambios` · gate anti-Sprawl ≤ ~10/entidad, sin "set-campo"). Catálogo seed ampliado por
el research:

`registrar-medicion-kpi` · `promover-kpi-a-kr` / `decantar-kr-a-kpi` (frontera permeable —
research A) · `enviar-idea` / `evaluar-idea` / `promover-idea-a-proyecto` · `aprobar-charter`
(doble firma sponsor+finanzas) · `avanzar-tollgate` · `verificar-beneficios` (finanzas post) ·
`estandarizar` · `cerrar-proyecto` · `cerrar-brecha` · `aprobar-version-objetivo` ·
`publicar-mapa-proceso` · `corregir-verbo-actividad` (auditado).

### E · Vocabulario de verbos — `sistema/schema/verbos.yaml`

Sin cambios vs v1 de esta spec (clase ALM × capacidad MGI + sinónimos + gobernanza PR + gate),
con el seed diseñado contra la corporación ficticia (~200 empleados, un área completa; prenter
referencia secundaria — duda 5). Scores RPA/agente derivados; `triage {veredicto, fuente, conf}`
ratificable (duda 3).

### F · Ajustes a entidades existentes (corte limpio — duda 2: lo muerto se ELIMINA)

| Entidad | Cambio v2 |
|---|---|
| `empresa` | `config_estrategia {modo: okr-trimestral\|gpd-anual\|mixto}` (research A/B — GPD y OKR = mismo grafo, distinta cadencia/acople) · `unidades[]` weak `empresa#uN {nombre, tipo: proyecto\|obra\|sucursal\|franquicia, entidad_legal_ref?}` · `entidades_legales[]` weak `{razon_social, tax_id}` (D-07) |
| `objetivo` | `horizonte: enum [proposito, 3a, anual, trimestre]` · `cadencia_revision` · `estado {vigente\|deprecado, superseded_by?, vigencia?}` · `perspectiva?` (BSC — mapa LATAM hispano) · `key_results` opcional (RN-4′) |
| `key_result` | `from/to/current` numéricos (`unit` aparte) · **`kpi_ref? → kpi`** (KR = contrato de cambio sobre la serie de un KPI — research A) · **`acople_compensacion: bool`** default false (RN-14) · `accountable_ref? → rol` (KR ownership) |
| `actividad` | `fuente`+`conf` o `evidencia_ref` · `flujos_alternos: list {cuando, secuencia[ref local]}` · **`tiempos {toque, espera}` REEMPLAZA `tiempo`** (eliminado) · `mandato?: enum [regulatorio, preventivo, habilitante]` · `automatizacion? {volumen, excepciones_pct, datos, reglas, criterio_promptable, tolerancia_revision, riesgo_error}` · `tlx? {puntaje_rtlx, fecha, fuente}` (agregación por rol/proceso — CK-24) · `alimenta_kpi_refs: list {kpi_ref, peso?}` · `triage? {veredicto, fuente, conf}` |
| `persona` | **`reporta_a: list {ref, tipo: jerarquico\|funcional}` REEMPLAZA la ref simple** (eliminada) · `vinculo: enum [empleado, contratista, tercero]` + `tercero_ref?` · `sin_kpi? {razon}` |
| `proceso` | `provisto_por? {nombre, tipo: bpo\|outsourcing\|proveedor, contrato_ref?}` (ISO 8.4) · `riesgos[]` tipado `{desc, prob, impacto, mitigacion?}` (cl.6.1) · **`kpis` embebido ELIMINADO** (migra a entidad `kpi` con `proceso_ref` — migración prenter incluida) |
| `brecha` | `estado: enum [accionable, a-corroborar, off-thread, sin-ancla-de-valor]` |
| enums | `fuente` + **`Observado`** |
| housekeeping | ref muerta `process.schema` (línea 49) re-anclada · candidatura Bloom eliminada (vocabulario propio) |

### G · Relaciones nuevas + extensión

Como v1 de esta spec (8 aristas kpi/proyecto/medición) MÁS: `key_result → kpi` (referencia de
serie, dueño `kr.kpi_ref`) · `idea → persona` (autoría, dueño `idea.proponente_refs`) ·
`idea → proyecto_mejora` (promoción, dueño `idea.promovida_a_ref`) · `proyecto_mejora → idea`
(origen, dueño `origen_idea_refs`). Invariantes v2: RN-8/14/15 + toda ref nueva resuelve +
estados ∈ enums + acciones válidas contra meta-schema.

**Extensión por cliente (duda 1 — AHORA):** bloque `ext:` permitido en toda entidad;
el validador **ignora-y-preserva** (forma libre); política de validación semántica = V2.

## § Catálogo del método — delta (AC-8 · sintonía NOTACIONES)

| M-card nueva | rol_ancla | dimensiones | Nota |
|---|---|---|---|
| GPD — Gerenciamento pelas Diretrizes (Falconi) | ancla | estrategia | modo de cadencia anual + desdobramento + acople PLR (mercado BR); mismo grafo de la cascada canónica |
| Lean Six Sigma / DMAIC | ancla | mejora-proyectos | formato corporativo formal: charter + tollgates + belts; vigente (no declinó) |
| MASP (QC Story / Falconi) | ancla | mejora-proyectos | estándar BR de solución de problemas; 8 etapas sobre PDCA; loop-back en verificación |
| Gestión de ideas (kaizen teian / funil) | ancla | mejora-proyectos | funil masivo idea→promoción; reconocimiento al proponente |
| ISO 56002/56001 (innovación) | horizonte | mejora-proyectos | emergente, Brasil hotspot; NO es el marco dominante del proyecto de mejora hoy |

Dimensión nueva `mejora-proyectos` ("Proyectos de mejora e ideas del personal") entra al enum +
labels de `methodology.schema.yaml`. M16 (ISO 9001) suma cl.10 a su `cuando_si` (paraguas del
loop). M21/M26/M30/M15 quedan como están (la investigación las CONFIRMÓ — cero cambios a lo ya
aprobado en NOTACIONES; solo se AGREGA).

## Tabla de trazabilidad — registro heredado + research (AC-6)

| # | Insumo | Resolución |
|---|---|---|
| 1-9, 11 | Insumos del refichado (KPI entidad · aristas · objetivo pleno · actividad · verbos · persona · proceso · enums/rollup/tensión · ext · unidad_ref) | § A-G — implementados (ext = ahora, duda 1) |
| 10 | Umbral acumulación + formulario 4 campos + before/after | DESCARTADO aquí — mecánica del motor (m2/BL-24); re-heredado a esas historias |
| R1 | KPI/KR dos entidades + frontera permeable (`kr.kpi_ref` + promover/decantar) | § A + § F key_result + § D acciones |
| R2 | OKR equipo/rol, persona = accountable de KR | § F key_result (`accountable_ref`) + M21 intacta |
| R3 | Divorcio KR↔compensación salvo GPD | RN-14 + `acople_compensacion` |
| R4 | Modo de cascada = configuración | `empresa.config_estrategia` |
| R5 | Ciclo de mejora canónico (charter/doble firma/estandarización/auditoría) | § B |
| R6 | Idea = entidad separada enlazada | § C |
| R7 | M-cards GPD/DMAIC/MASP/ideas/ISO-56002 + dimensión `mejora-proyectos` | § Catálogo del método |

## § Pantallas

N/A — service-story sin superficie UI nueva (pintar KPI/proyecto/semáforo = `cruce-indicadores` y
`brecha-proyecto`, F1.1).

## § Dudas abiertas (RONDA 1)

Ninguna — las 5 de v1 resueltas por el operador (2026-07-17, ver § Resolución). Pendiente solo
**FIRMA 1 sobre esta versión v2**.

## Acceptance Criteria (Gherkin — service-story)

### SC-1 — `objeto-v2-completo` (`type: happy`)
**Covers:** AC-1, AC-2
**Given:** mini-fixture con las 12 entidades y todas las aristas nuevas pobladas
**When:** `GET /api/objeto?empresa=<fixture>`
**Then:** 12 entidades juntas · cero warnings · hilo recorrible en ambos sentidos (actividad→KPI→
KR→objetivo y de vuelta; idea→proyecto→KPI-movido)
**playwright_required:** false
**Graders:** go test integración + live-verify runtime-logs

### SC-2 — `corte-limpio-migracion` (`type: edge`)
**Covers:** Bif-1, AC-2
**Given:** `prenter` MIGRADO a formas v2 · copia pre-migración con formas v1 muertas
**When:** `GET /api/objeto?empresa=prenter` · lectura de la copia
**Then:** prenter valida LIMPIO (cero warnings) · la copia produce ERROR nombrando la forma v2
que reemplaza cada forma muerta (`proceso.kpis` → entidad kpi · `tiempo` → `tiempos` ·
`reporta_a` simple → lista tipada)
**playwright_required:** false
**Graders:** go test regresión + live-verify

### SC-3 — `kpi-dueño-persona` (`type: negative`)
**Covers:** Bif-2, RN-8 — igual v1 (rechazo citando CK-24)
**Graders:** go test unitario

### SC-4 — `refs-colgantes-hilo` (`type: negative`)
**Covers:** Bif-3 — casos: `contribuye_a`, `kpi_ref`, `alimenta_kpi_refs`, `origen_brecha_refs`,
`origen_idea_refs`, `mueve_refs`, `unidad_ref`, `promovida_a_ref` → un warning nombrado por ref
**Graders:** go test tabla-driven

### SC-5 — `verbos-vocabulario` (`type: negative`)
**Covers:** Bif-4, Bif-5, RN-11, AC-3 — igual v1 (warning+sugerencia · sin-clasificar · gate FALLA)
**Graders:** go test + hook pre-commit ejecutado (test negativo, patrón CK-17)

### SC-6 — `kinetica-malformada` (`type: negative`)
**Covers:** Bif-6, RN-10, AC-4 — igual v1 (gate FALLA nombrando acción y regla)
**Graders:** hook ejecutado (test negativo)

### SC-7 — `divergencia-derivada` (`type: edge`)
**Covers:** Bif-7, RN-9 — igual v1 (respuesta pinta `divergente`; instancia intacta)
**Graders:** go test + diff instancia

### SC-8 — `sin-ancla-de-valor` (`type: edge`)
**Covers:** Bif-8, RN-4′ — igual v1
**Graders:** go test

### SC-9 — `provenance-anti-gaming` (`type: adversarial`)
**Covers:** Bif-9, RN-13 — igual v1 (warning "verbo sin provenance"; conf baja visible)
**Graders:** go test

### SC-10 — `ciclo-mejora-gobernado` (`type: negative`)
**Covers:** Bif-10, RN-12, RN-15
**Given:** proyecto en `propuesto` · proyecto en `en-verificacion` · proyecto hard-saving en
`beneficios-en-auditoria` sin `firmas.finanzas.fecha_post`
**When:** transición directa a `cerrado` · vuelta a `en-ejecucion` · cierre
**Then:** ERROR transición inválida · loop-back VÁLIDO (MASP) · ERROR "cierre sin auditoría de
finanzas"
**playwright_required:** false
**Graders:** go test tabla-driven de la máquina de estados

### SC-11 — `divorcio-kr-compensacion` (`type: adversarial`)
**Covers:** Bif-11, RN-14
**Given:** empresa `modo: okr-trimestral` con `kr.acople_compensacion: true`
**When:** lectura
**Then:** ERROR citando RN-14 (sandbagging); con `modo: gpd-anual` el mismo dato valida OK
**playwright_required:** false
**Graders:** go test ambos modos

### Sub-categorías v4.1 — N/A ratificables
`race-condition` · `concurrent-users` · `network-failure` · `empty-state` · `large-dataset` ·
`accessibility` · `i18n` → `not_applicable_reason: "single-tenant · binario read-only sin auth ni
DB (cockpit-stack) · sin superficie FE nueva"`. `large-dataset` cubierto como NFR.

## § Matriz de cobertura (sembrada — dev-team la mantiene viva)

| Ítem (Mapa funcional) | Tipo | estado | Cubierto por | Verificación REAL |
|---|---|---|---|---|
| Bif-1 · corte limpio + migración prenter | branch | ✅ construido | SC-2 | `TestFormasV1Muertas` + prenter migrado EN VIVO (GET :4100 → 0E/0W) |
| Bif-2 · dueño persona | branch | ✅ construido | SC-3 | `TestKpiDuenoPersona` + rechazo CK-24 observado EN VIVO (:4101, write real) |
| Bif-3 · refs colgantes | branch | ✅ construido | SC-4 | `TestRefsColgantesV2` (9 refs, tabla-driven) |
| Bif-4/5 · verbos | branch | ✅ construido | SC-5 | `TestVerbosVocabulario` + gate real FALLA (test negativo scratchpad) |
| Bif-6 · kinética malformada | branch | ✅ construido | SC-6 | gate real: 6 errores detectados en copia manipulada |
| Bif-7 · divergencia | branch | ✅ construido | SC-7 | `TestDivergenciaDerivada`: payload pinta + diff instancia intacta |
| Bif-8 · sin KRs | branch | ✅ construido | SC-8 | `TestSinAnclaDeValor` (warning, no error) |
| Bif-9 · verbo sin provenance | branch | ✅ construido | SC-9 | `TestVerbosVocabulario` (anti-gaming) |
| Bif-10 · ciclo mejora | branch | ✅ construido | SC-10 | `TestCicloMejoraGobernado`: tabla estados + RN-15 |
| Bif-11 · acople compensación | branch | ✅ construido | SC-11 | `TestDivorcioKrCompensacion` ambos modos |
| RN-8/9/10/11/13/4′ | rule | ✅ construido | SC-3/5/6/7/8/9 | tests arriba |
| RN-12 · RN-15 (doble firma/auditoría) | rule | ✅ construido | SC-10 | `transicionProyectoValida` + error de cierre |
| RN-14 (divorcio KR↔comp) | rule | ✅ construido | SC-11 | error/OK según modo |
| RN-16 (idea↔proyecto separadas) | rule | ✅ construido | SC-1, SC-4 | fixture v2 EN VIVO (idea→promovida_a→pm) |
| SC-12 paridad schema↔Go | rule | ✅ construido | SC-12 | `TestParidadSchema` (enums + transiciones vs YAML) |
| AC-1..AC-8 | accept | ✅ construido | SC-1..SC-12 + G | gates 4/4 exit 0 · live-verify doble (prenter + fixture) · tablas AC-6/AC-8 en spec |

**Huecos detectados:** ninguno · **SC huérfanos:** ninguno · **Diferido:** ninguno

## Non-functional requirements

| Categoría | Requisito | Verificador |
|---|---|---|
| Latencia | `GET /api/objeto` con shell ~500 archivos < 1s (p95, lectura fría) | go test benchmark fixture sintético |
| Corte limpio | cero campos/formas deprecadas en el schema publicado (duda 2) | grep + revisión |
| Anti-drift | SSoT nuevos (verbos, acciones, M-cards) gateados en pre-commit | SC-5, SC-6, gate metodo |
| i18n | vocabulario y enums es-419, sin voseo | revisión + lint |

## Constraints técnicos heredados

- `.claude/rules/metodologia-as-code.md` · `.claude/rules/cockpit-stack.md` (binario read-only,
  N/A tenant) · `sistema/schema/DECISIONES.md` D-04/06/07/08/09/12/15 · TDD obligatorio
  (validadores nacen RED, tabla-driven, patrón go/objeto).

## Cross-module impact

- **Es leído por:** `go/objeto.go` (N13). Downstream: `organizacion-ficticia-golden-fixture`
  (dep dura; directiva ~200 empleados registrada allí), `cruce-indicadores`, `brecha-proyecto`,
  `captura-manual-kpis`, `modulo-gestion-cambios-iso` (ejecuta acciones), `auth-niveles`
  (gobierna niveles), `metodo-como-arnes-v0`.
- **Toca además:** `sistema/metodo/methodologies.yaml` + `methodology.schema.yaml` (AC-8 —
  NOTACIONES regenera) y el book `docs/metodo/objeto/`.

## Prior art applied (anti-duplication-refining)

Como v1 de esta spec (reconciliar-objeto-schema · persona-puesto · gestión-cambios = motor ·
captura-manual-kpis = consumidor · auth-niveles = policy) MÁS: el funil de ideas NO duplica la
Gestión de Cambios (la idea es germen de proyecto; el cambio gobernado es otro objeto) y las
M-cards nuevas EXTIENDEN el catálogo aprobado en NOTACIONES sin tocar los bloques `twin:`
existentes (M21/M26/M30/M15 confirmadas por la investigación).

## Próximo paso

`type: service-story` → skip UX → **FIRMA 1 del operador sobre esta v2** → `/architect`
(03-arch + 04-validators + 06-tickets · `refined → ready`).

## Changelog

- v1 2026-07-17 — draft inicial: diseño v2 + trazabilidad 11 insumos + 5 dudas abiertas.
- v2 2026-07-17 — integra respuestas del operador (ext ahora · corte limpio sin deprecados ·
  triage ratificable · Go completo · seed contra corporación ficticia) + investigación LATAM/BR
  (00-research-latam-br.md): frontera KPI↔KR permeable, modo GPD/BSC/OKR como configuración,
  RN-14 divorcio KR↔compensación, entidad `idea` separada, `proyecto` → `proyecto_mejora`
  (Misnomer resuelto), ciclo de mejora con doble firma + auditoría de beneficios, M-cards
  GPD/DMAIC/MASP/ideas/ISO-56002 + dimensión `mejora-proyectos` (sintonía NOTACIONES).
