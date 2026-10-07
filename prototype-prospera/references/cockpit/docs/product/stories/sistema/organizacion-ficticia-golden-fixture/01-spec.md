# 01-spec.md — organización ficticia golden fixture: la flota de 3 twins llenos

---
story_id: organizacion-ficticia-golden-fixture
type: service-story
module: sistema
capability: sistema/organizacion-ficticia-golden-fixture
cap_change_type: new
po_version: 2
last_modified: 2026-07-18
ratified_by_chris: true           # FIRMA 1 del operador 2026-07-18 ("Ratifico todo") — 7 dudas resueltas + autonomous run ratificado ("lanza el desarrollo y auditoria, todo")
links:
  story_yaml: story.yaml
  story_md: 00-story.md
  ledger: CK-23 · CK-24 · D-07 · D-14 · D-15 · I-39
  schema: ../../../../../sistema/schema/objeto.schema.yaml (v2)
  nicho_ancla: ../../../../../sistema/metodo/nichos/inmobiliario.yaml
---

## Resumen ejecutivo

Construir la **flota de organizaciones ficticias** que ejerce el 100% del `objeto.schema` v2 (12
entidades), servida por `/api/objeto` con **cero errores y cero warnings**, como shells hermanos
registrados en el cockpit. **Decisión del operador (2026-07-18, este refinamiento): son TRES
corporaciones, no una** — más casuística de diseño a cambio de más trabajo:

| # | Corporación | Rubro | Rol en la flota | Modo | Unidades | Tamaño |
|---|---|---|---|---|---|---|
| 1 | **Terranova** (`terranova`) — firmado | Desarrolladora inmobiliaria **con constructora** | **GOLDEN**: cobertura 100% de campos y aristas; ancla al nicho `inmobiliario.yaml`; área #1 completa = **Finanzas** (firmado) | `mixto` (firmado) | proyecto/obra (D-07) | ~200 |
| 2 | **Tiendas Alameda** (`alameda`) — firmado | Retail multi-sucursal | Casuística: plantilla de proceso medida por unidad `sucursal`+`franquicia` | `okr-trimestral` | sucursal/franquicia | ~150 |
| 3 | **Industrias Vulcano** (`vulcano`) — firmado | Manufacturera / industrial | Casuística BR-style: GPD/Falconi + acople PLR (RN-14 válido) + MASP con loop-back + verbos físicos | `gpd-anual` | planta (enum ampliado, duda 3 firmada) | ~180 |

La cobertura golden se **verifica por herramienta, no a ojo** (verificador nuevo, RN-17): campos +
valores de enum + aristas del schema contra las instancias; su salida = **manifiesto de
completitud** = el **contrato de salida de Consultio** (`operar-metodo` gana la referencia). Los
KPIs llevan series de mediciones hardcodeadas (el "estado real" que el lakehouse reemplazará en
F1.4) con provenance realista simulando una corrida M1. Triple uso intacto: fixture de desarrollo
(F1.1 `cruce-indicadores` + `brecha-proyecto` se construyen contra estos datos) ·
documentación-por-ejemplo · demo comercial.

## § Dónde vive

- **node:** `transversal` (los shells son data-plane puro, fuera del repo) con consumidor en
  **N13** (`go/objeto.go` → `/api/objeto`, CAP-08) y registro vía el control-plane
  (`chris-corp/portfolio/registry.yaml` → regenera `~/.cockpit/cockpit.yaml`).
- **Shells hermanos** `~/Proyectos/<slug>/empresa/<tipo>/<id>.yaml` — layout PLANO (D-15), git
  propio cada uno (patrón `prenter`), autocontenidos (D-14: scan sin bordes, cero control-plane).
- **Verificador de cobertura**: vive en el repo cockpit (home exacto lo fija `/architect`;
  candidatos: extensión de `sistema/schema/gen_schema.py` — ya parsea el schema — o comando Go que
  reutilice `go/objeto.go`). Corre por shell y en modo flota.
- Live-verify (seam): `GET /api/objeto?empresa=<slug>` ×3 ejercido de verdad (12 entidades ·
  `errors: []` · `warnings: []`) + verificador flota en verde + portfolio navegable.

## Doctrina heredada (lo que esta historia NO decide — ya está decidido)

| Fuente | Qué manda aquí |
|---|---|
| **CK-23** (twin-first) | El twin lleno ANTES que el proceso de llenado; el fixture simula la **salida** del método (provenance incluida), no un dump sintético. Riesgo aceptado consciente: ajuste posible cuando Consultio llene datos reales. |
| **Directiva del operador** (00-story · ampliada 2026-07-18) | Corporación ~200 empleados; se construye **empezando por UN área completa** (Finanzas, firmado) y crece de ahí; ampliación: 3 corporaciones para más casuística. |
| **D-15 / I-39** | Instancias en shells hermanos, layout plano `empresa/<tipo>/`; refs cross-repo SOLO por slug. |
| **D-14** | Data-plane puro: nada del control-plane entra al shell; test de norma ("¿lo necesitaría el resultado final desplegado de un cliente?") aplica a cada archivo del fixture. |
| **D-07** | Proceso se define UNA vez, se mide POR unidad (`unidad_ref` en la medición). Terranova lo ejerce con obras; Alameda con sucursales/franquicias. |
| **CK-24** | El twin mide roles/procesos/áreas: ningún `kpi.dueño_ref` a persona; TLX solo agregable; la persona solo como ocupante de rol o autora de idea. |
| **RN-14** (schema-v2) | `acople_compensacion: true` solo con modo `gpd-anual`/`mixto` → la casuística PLR vive en Vulcano (y opcional Terranova). |
| **Nicho `inmobiliario.yaml`** | KPIs ancla de Terranova: caja por proyecto (N-IMM-01) · absorción (N-IMM-02) · DSO (N-IMM-03) + resto del vertical. |
| **D-16** | NO aplica acá el flujo operador-vuelca (no hay dueño real): el sustituto es "simular la corrida M1" — la exigencia se traslada a provenance realista (RN-19). |
| **`verbos.yaml` gobernanza (RN-11)** | El seed YA fue diseñado contra esta corporación; si el fixture exige un verbo nuevo, entra por PR con clase ALM×MGI completa — jamás bypass. |

## § Mapa funcional (capa humana — ratifica Chris ANTES de architect)

### 1. Happy path (el camino dorado, narrado)

1. Los 3 shells existen como repos hermanos con `empresa/<tipo>/` poblada; cada uno registrado en
   `chris-corp/portfolio/registry.yaml` (entrada `kind: client` — cliente ficticio, duda 7) y el
   registry regenerado a `~/.cockpit/cockpit.yaml`.
2. **Terranova** (golden): raíz `empresa.yaml` delgada con `config_estrategia.modo: mixto`,
   unidades de ejecución = obras/proyectos, entidades legales SPV (D-07). Organigrama completo
   ~200 personas (áreas anidadas ≥2 niveles, reportes matriciales, 3 vínculos, ≥1 tercero/BPO,
   ≥1 `sin_kpi` justificado). **Finanzas se construye PRIMERO al 100%** (todas las entidades y
   aristas v2 dentro del área: procesos tortuga con RACI A==1 + actividades con verbo del
   vocabulario + tiempos + automatización + triage; KPIs del nicho con banda + serie ≥6
   mediciones por obra; cascada 3a→anual→trimestre; brechas → proyecto de mejora → KPI movido;
   ideas → promoción). Luego crece al resto de áreas hasta cobertura total.
3. **Alameda** (retail): procesos plantilla (venta en tienda, reposición, apertura de caja)
   definidos una vez y medidos por `unidad_ref` sucursal y franquicia; modo `okr-trimestral`.
4. **Vulcano** (manufactura): modo `gpd-anual` con desdobramento y `acople_compensacion: true`
   (PLR); proyecto de mejora en dialecto `masp` con loop-back en-verificacion→en-ejecucion;
   verbos físicos (transportar, preparar, inspeccionar, reparar); riesgos tipados ISO cl.6.1.
5. `GET /api/objeto?empresa=<slug>` ×3 → 12 entidades juntas, `errors: []`, `warnings: []`; el
   hilo de oro recorrible en ambos sentidos; semáforo pinta los 3 colores dentro de la flota;
   ≥1 medición `divergente` derivada al leer.
6. El **verificador de cobertura** corre en modo flota → 0 huecos; su reporte (manifiesto de
   completitud) queda commiteado y referenciado como contrato de salida de Consultio.
7. Las historias F1.1 (`cruce-indicadores`, `brecha-proyecto`) arrancan CONTRA estos datos.

### 2. Bifurcaciones (árbol de decisión)

```
Happy path
├─ Bif-1 · ¿campo/valor-de-enum/arista del schema sin ejercer en la flota?
│          → verificador RED nombrando el hueco exacto                      → SC-2
├─ Bif-2 · ¿algún shell produce warning o error en /api/objeto?
│          → golden FALLA (0E/0W es absoluto, RN-18)                        → SC-1
├─ Bif-3 · ¿casuística exclusiva mal repartida (p.ej. acople PLR en el shell
│          okr-trimestral)? → el validador v2 ya lo rechaza (RN-14)         → SC-4
├─ Bif-4 · ¿dato sin provenance o distribución inverosímil (todo
│          Declarado/alta)? → verificador flag distribución (RN-19)         → SC-6
└─ Bif-5 · ¿el fixture necesita un verbo fuera del vocabulario?
           → PR a verbos.yaml con clase completa; gate valida (RN-23)       → SC-7
```

### 3. Reglas de negocio (RN — continúan la numeración de schema-v2)

- **RN-17** — **cobertura golden verificada por herramienta**: la FLOTA cubre el 100% de campos +
  valores de enum + aristas del schema v2; **Terranova sola** cubre el 100% de campos y aristas
  (los valores de enum estructuralmente exclusivos — `modo_estrategia`, `tipo_unidad`,
  `metodologia_mejora` — se reparten por diseño DECLARADO en el manifiesto).
- **RN-18** — cero errores y cero warnings en los 3 shells, verificado EN VIVO (no solo test).
- **RN-19** — provenance realista de corrida M1: mezcla de fuentes (`Entrevista`, `Declarado`,
  `Sistema leído`, `Observado`, `Inferido`) con `conf` correlacionada a la fuente (Inferido jamás
  alta; Sistema leído/Observado tienden alta). Prohibido el fixture uniforme "todo Declarado/alta".
- **RN-20** — ficción segura (demo comercial): nombres de empresas, personas, marcas y tax-id
  inventados, sin colisión con organizaciones o personas reales conocidas.
- **RN-21** — data-plane puro (D-14): shells autocontenidos, scan sin bordes, cero contabilidad
  del control-plane; toda ref cross-repo por slug (I-39).
- **RN-22** — CK-24 en los datos: ningún KPI con dueño persona; TLX presente solo como insumo
  agregable por rol/proceso; autoría de ideas sí es de persona(s).
- **RN-23** — el fixture puede AMPLIAR `verbos.yaml` (PR con clase ALM×MGI completa, gate verde),
  nunca esquivar el vocabulario.

### 4. Criterios de aceptación (AC — checklist de cierre)

- [ ] **AC-1** — 3 shells hermanos (`terranova` + 2 nombres a firmar) con git propio, layout
  plano D-15, registrados en `chris-corp/portfolio/registry.yaml` + `~/.cockpit/cockpit.yaml`
  regenerado; el portfolio del cockpit los navega.
- [ ] **AC-2** — `GET /api/objeto?empresa=<slug>` ×3 EN VIVO: 12 entidades juntas, `errors: []`,
  `warnings: []` (RN-18).
- [ ] **AC-3** — verificador de cobertura construido (TDD) + corrido en modo flota → **0
  huecos**; test negativo de mutación (quitar un campo/arista de una instancia → RED nombrando
  el hueco); manifiesto de completitud commiteado + referenciado desde
  `consultio/operar-metodo-construir-mapa-completo` como contrato de salida.
- [ ] **AC-4** — Terranova golden completa: **Finanzas al 100% PRIMERO** (hito interno
  verificable con el verificador scoped al área), organigrama entero ~200 personas (matricial,
  3 vínculos, tercero, `sin_kpi` justificado), áreas anidadas ≥2 niveles, cascada `mixto`
  3a→anual→trimestre, KPIs del nicho inmobiliario con banda + serie ≥6 mediciones cortadas por
  obra (`unidad_ref`), SPVs como `entidad_legal_ref` (D-07).
- [ ] **AC-5** — casuística Alameda: plantilla de proceso medida por `sucursal` Y `franquicia`;
  modo `okr-trimestral`; funnel retail con KPIs propios.
- [ ] **AC-6** — casuística Vulcano: `gpd-anual` + `acople_compensacion: true` (PLR) + proyecto
  `masp` con loop-back + verbos físicos + riesgos tipados + `provisto_por` (ISO 8.4).
- [ ] **AC-7** — ciclo de mejora a nivel flota: los 12 estados de `proyecto_mejora` presentes,
  los 5 de `idea`, ≥1 cadena completa brecha→proyecto→KPI-movido con `veredicto: movio` +
  `delta_observado`; ≥1 medición `divergente` derivada; semáforo en los 3 colores.
- [ ] **AC-8** — documentación-por-ejemplo: README por shell (identidad de la corporación +
  triple uso + mapa de qué casuística carga) y ≥1 archivo ejemplar comentado por tipo de entidad
  en el shell golden.

## § Diseño de la flota (el corazón — para ratificar antes de architect)

### A · Terranova — Desarrolladora Terranova S.A.C. (golden · ~200 empleados)

- **Negocio:** desarrolladora inmobiliaria con constructora propia (integrada). 3-4 proyectos
  activos (obras) como unidades de ejecución + 1-2 SPV legales (D-07). Sede Lima, moneda S/.
- **Áreas (anidadas):** Directorio/Gerencia General → {Finanzas (área #1 100%: contabilidad,
  tesorería, cobranza), Comercial (ventas, marketing), Operaciones/Construcción (obras, oficina
  técnica, logística de obra), Desarrollo/Proyectos (suelo, diseño, permisos), Gestión Humana,
  TI}. ~2 niveles de anidación bajo gerencia.
- **Hilo de oro semilla:** objetivo directorio "caja sana y crecimiento rentable" (3a) →
  objetivos anuales GPD + OKRs trimestrales (`mixto`) → KRs con `kpi_ref` a los KPIs del nicho:
  caja por proyecto, absorción, DSO, avance de obra vs plan, margen por proyecto → procesos de
  Finanzas (facturación, cobranza, pago a proveedores, cierre mensual) → roles → personas.
- **Mejora:** brechas de cobranza (DSO alto en una obra) → proyecto `dmaic` con charter + doble
  firma + hard-saving auditado; funil de ideas activo.

### B · Shell retail (nombre duda 1 · ~150 empleados · `okr-trimestral`)

- 10-12 sucursales propias + 2 franquicias (`tipo_unidad` ambos valores); casa matriz chica.
- Procesos plantilla (venta, reposición, arqueo, apertura/cierre) definidos UNA vez, KPIs
  (venta/m², merma, NPS tienda, rotación de inventario) medidos por `unidad_ref` — la casuística
  D-07 en su variante retail.
- KPIs sin nicho cargado hoy → duda 2 (sembrar mini-nicho vs conocimiento general con conf media).

### C · Shell manufactura (nombre duda 1 · ~180 empleados · `gpd-anual`)

- 1-2 plantas (duda 3: enum `tipo_unidad` no tiene `planta` — ampliar aditivo vs single-site sin
  unidades), línea de producción + mantenimiento + calidad + almacén.
- Casuística BR-style completa: desdobramento anual, PLR (`acople_compensacion: true`), MASP con
  loop-back, KRI de seguridad, riesgos tipados, proceso terciarizado (`provisto_por`, ISO 8.4),
  verbos físicos del seed.
- KPIs (OEE, scrap, OTIF, accidentabilidad) → misma duda 2.

### D · Verificador de cobertura (la única pieza de CÓDIGO de la historia)

- **Entrada:** `objeto.schema.yaml` (SSoT de campos/enums/relaciones — parseable, ya lo hace
  `gen_schema.py`) + 1..N shells.
- **Salida:** reporte por shell y agregado flota: campos no ejercidos · valores de enum no
  ejercidos · aristas no ejercidas (con archivo:línea del schema); exit ≠ 0 si hay huecos contra
  la política (flota=100%; Terranova=100% campos+aristas). Modo `--area <id>` para el hito
  "Finanzas al 100%".
- **Es también el contrato:** el reporte en verde, commiteado = manifiesto de completitud que
  `operar-metodo` debe poder reproducir con datos reales.
- Home + lenguaje (extender `gen_schema.py` vs cmd Go sobre `objeto.go`) lo decide `/architect`;
  TDD obligatorio (mutación → RED primero).

## § Pantallas

N/A — service-story sin superficie UI nueva (pintar estos datos = `cruce-indicadores` y
`brecha-proyecto`, F1.1).

## § Dudas resueltas (RONDA 1 — FIRMA 1 del operador, 2026-07-18: "Ratifico todo")

1. **Nombres firmados:** **Tiendas Alameda** (`alameda`) y **Industrias Vulcano** (`vulcano`).
2. **Nichos:** SÍ — mini-nichos `retail.yaml` + `manufactura.yaml` (4-6 unidades c/u) se siembran
   en esta historia; el fixture queda anclado igual que Terranova↔inmobiliario.
3. **`tipo_unidad`:** SÍ — enum gana `planta` (cambio aditivo al schema v2 + paridad Go).
4. **Remote git:** SÍ remoto privado. El HOST no existe aún (Forgejo = historia F1.3); se crean
   repos locales con git propio y el push a remoto queda como follow-up explícito al provisionar
   el host (no se publica el fixture a un host no decidido).
5. **Tamaños:** Terranova ~200 · Alameda ~150 · Vulcano ~180. Firmado.
6. **Modos:** Terranova `mixto` · Alameda `okr-trimestral` · Vulcano `gpd-anual`. Firmado.
7. **Registro:** `kind: client` (cliente ficticio; el schema del registry de chris-corp no se toca).
   **[R 2026-07-18 — cómo aterrizó]:** el generador del holding PROHÍBE `kind: client` en la sección
   `empresas` (client = CRM de prenter, I-39; las ficticias tampoco son cuentas) → se registraron por
   el carril `extra_projects` (precedente demo-environment) con passthrough opcional de `kind`
   (+3 líneas al generador, chris-corp@c9fd917). El resultado firmado se cumple: el portfolio las
   lista como `client` y el schema del registry no se tocó.

**Además el operador ratificó el modo autónomo**: architect → dev → audit sin pausa G
(`autonomous_mode: true` — cruda: "levanta el architect… al terminar, lanza el desarrollo y
auditoria, todo"), con directiva de **casuística máxima** ("introduce toda la casuística posible…
escenarios posibles complejos para tener buena data de prueba") → aterriza en
`03-arch.md § Matriz de casuística`.

## Acceptance Criteria (Gherkin — service-story)

### SC-1 — `flota-en-vivo-cero-warnings` (`type: happy`)
**Covers:** AC-1, AC-2, Bif-2
**Given:** los 3 shells poblados y registrados; binario `directorio` corriendo
**When:** `GET /api/objeto?empresa=<slug>` para cada slug
**Then:** 12 entidades juntas · `errors: []` · `warnings: []` en los 3 · portfolio los navega
**playwright_required:** false
**Graders:** live-verify runtime-logs + respuesta observada

### SC-2 — `cobertura-verificada-con-mutacion` (`type: negative`)
**Covers:** AC-3, Bif-1, RN-17
**Given:** verificador construido; flota completa; copia de Terranova con un campo y una arista
removidos
**When:** verificador en modo flota sobre la flota real · sobre la copia mutada
**Then:** flota real = 0 huecos, exit 0 · copia mutada = RED nombrando campo y arista exactos
**playwright_required:** false
**Graders:** test del verificador (TDD, mutación primero) + reporte commiteado

### SC-3 — `hilo-recorrible-ambos-sentidos` (`type: happy`)
**Covers:** AC-4
**Given:** Terranova completa
**When:** recorrido actividad→KPI→KR→objetivo→directorio y objetivo→KR→KPI→medición-por-obra
**Then:** cada salto resuelve por ref; ninguna arista del hilo queda sin instancia; mediciones
cortan por `unidad_ref` obra
**playwright_required:** false
**Graders:** verificador (aristas) + inspección de la respuesta `/api/objeto`

### SC-4 — `casuistica-modos-reparto` (`type: edge`)
**Covers:** AC-5, AC-6, Bif-3, RN-14
**Given:** los 3 shells con sus modos (`mixto` · `okr-trimestral` · `gpd-anual`)
**When:** lectura de los 3
**Then:** `acople_compensacion: true` solo aparece en shells gpd/mixto y valida OK; el shell
okr-trimestral no lo usa (si se inyecta en test → ERROR RN-14, ya cubierto por schema-v2)
**playwright_required:** false
**Graders:** verificador enum-reparto + validador v2 existente

### SC-5 — `casuistica-unidades` (`type: edge`)
**Covers:** AC-4, AC-5, D-07
**Given:** Terranova (obras) y shell retail (sucursales + franquicias)
**When:** lectura de KPIs con mediciones
**Then:** el MISMO proceso plantilla aparece medido por ≥2 unidades distintas en cada shell;
`tipo_unidad` ejerce proyecto/obra/sucursal/franquicia a nivel flota
**playwright_required:** false
**Graders:** verificador + inspección

### SC-6 — `provenance-distribucion-realista` (`type: adversarial`)
**Covers:** AC-4, Bif-4, RN-19
**Given:** flota completa
**When:** verificador calcula distribución fuente×conf
**Then:** ≥4 fuentes distintas presentes; `Inferido` jamás con `conf: alta`; ningún shell con
>70% de una sola combinación fuente/conf
**playwright_required:** false
**Graders:** verificador (regla de distribución)

### SC-7 — `ciclo-mejora-flota` (`type: edge`)
**Covers:** AC-7, Bif-5
**Given:** flota completa
**When:** lectura agregada
**Then:** 12/12 estados de `proyecto_mejora` · 5/5 de `idea` · ≥1 cadena
brecha→proyecto→KPI-movido con `movio` + `delta_observado` · ≥1 `divergente` derivado · semáforo
en 3 colores · loop-back MASP presente en el shell manufactura
**playwright_required:** false
**Graders:** verificador (enums) + inspección de la respuesta

### SC-8 — `latencia-shell-completo` (`type: nfr`)
**Covers:** NFR latencia
**Given:** Terranova (~el shell más grande de la flota)
**When:** `GET /api/objeto?empresa=terranova` lectura fría
**Then:** < 1s p95 (NFR heredado de schema-v2, shell ~500 archivos)
**Graders:** benchmark go test / medición live

### Sub-categorías v4.1 — N/A ratificables
`race-condition` · `concurrent-users` · `network-failure` · `empty-state` · `accessibility` ·
`i18n` → `not_applicable_reason: "single-tenant · binario read-only sin auth ni DB
(cockpit-stack) · historia de datos sin superficie FE"`. `large-dataset` cubierto por SC-8.

## § Matriz de cobertura (sembrada — dev-team la mantiene viva)

| Ítem (Mapa funcional) | Tipo | estado | Cubierto por | Verificación REAL |
|---|---|---|---|---|
| Bif-1 · hueco de cobertura | branch | ✅ construido | SC-2 | mutación copia real → huecos nombrados exactos (persona.sin_kpi · idea.promovida_a_ref campo+arista) + suite 15/15 |
| Bif-2 · warning en shell | branch | ✅ construido | SC-1 | live-verify :4100 ×3 → 0E/0W (tras fix RN-13: 232 provenance por actividad + 3 ideas ancla de pm) |
| Bif-3 · reparto modos | branch | ✅ construido | SC-4 | gen_cobertura reparto 3/3 + RN-14 activo en vivo (0 errors con acople true solo en mixto/gpd) |
| Bif-4 · provenance uniforme | branch | ✅ construido | SC-6 | shares 46/53/53% <70 · 4-6 fuentes · 0 Inferido×alta |
| Bif-5 · verbo nuevo | branch | ✅ construido | SC-7 | liquidar+calibrar por PR-flujo, gate 46 verbos verde; flota usa 46/46 |
| RN-17..RN-23 | rule | ✅ construido | SC-1..SC-7 | manifiesto flota 208/208 · 0 huecos · checkpoint § Evidencia |
| AC-1..AC-8 | accept | ✅ construido | SC-1..SC-8 | portfolio 3× client · 0E/0W ×3 · manifiesto commiteado + linkeado en operar-metodo · READMEs · 18ms |

**Huecos detectados:** ninguno · **SC huérfanos:** ninguno · **Diferido:** push de los shells a
remoto privado (espera host — Forgejo F1.3; duda 4).

## Non-functional requirements

| Categoría | Requisito | Verificador |
|---|---|---|
| Latencia | `/api/objeto` por shell < 1s p95 lectura fría | SC-8 |
| Ficción segura | cero colisión con marcas/personas reales (RN-20) | revisión + checklist en README shell |
| i18n | es-419 sin voseo en todo el contenido | revisión |
| Volumen | cada shell ≤ ~500 archivos (techo del NFR heredado) | conteo en verificador |

## Constraints técnicos heredados

- `.claude/rules/metodologia-as-code.md` (provenance obligatorio) · `.claude/rules/cockpit-stack.md`
- `sistema/schema/DECISIONES.md` D-07/D-14/D-15/D-16 · CK-23/CK-24 · TDD para el verificador.
- Los shells NO llevan los gates del repo cockpit; su validación es al leer (CK-13) + verificador.

## Cross-module impact

- **Desbloquea:** `cockpit/cruce-estructura-operacion-indicadores` (dep directa) y
  `cockpit/brecha-proyecto-ciclo-vida` (F1.1 entera).
- **Contrato para:** `consultio/operar-metodo-construir-mapa-completo` (manifiesto de completitud
  = su criterio de aceptación de salida).
- **Puede tocar (aditivo):** `sistema/schema/verbos.yaml` (RN-23) · `objeto.schema.yaml` enum
  `tipo_unidad` (duda 3) · `sistema/metodo/nichos/` (duda 2) · registry de chris-corp (3 entradas).
- **NO toca:** el shell `prenter` (dogfood real, se llena con el método — prior art del 00-story).

## Prior art applied (anti-duplication-refining)

- **`prenter/empresa/`** — patrón de layout y registro (se REPLICA la forma, jamás la data).
- **`writeObjetoV2` (`go/objeto_v2_test.go`)** — mini-fixture de CI: SIGUE siendo el fixture de
  los tests del repo (portable, sintético); el golden NO lo reemplaza — son capas distintas
  (CI vs dev/demo/contrato).
- **`ejemplo-vertice.yaml`** — muestra UN vértice; el golden lo complementa, no lo duplica
  (el shell golden pasa a ser la documentación-por-ejemplo a escala organización).
- **`gen_schema.py`** — ya parsea el schema: candidato natural a extender para el verificador
  (no crear un parser nuevo desde cero).
- **Nicho `inmobiliario.yaml`** — se CONSUME como ancla de KPIs de Terranova, no se recrea.

## Próximo paso

FIRMA 1 ✅ (2026-07-18) → `/architect` a mano (03-arch + 04-validators + 06-tickets ·
`refined → ready`) → **autonomous run** dev + audit (ratificado). Secuencia de tickets:
schema aditivo → verificador → nichos → Terranova (estructura → Finanzas → resto) → Alameda →
Vulcano → registro + live-verify + manifiesto.

## Changelog

- v1 2026-07-18 — draft inicial post-decisiones del operador (3 corporaciones · área #1 Finanzas ·
  modo mixto · Terranova): flota de 3 shells, verificador de cobertura como contrato de salida,
  RN-17..RN-23, 8 SCs, 7 dudas abiertas.
- v2 2026-07-18 — FIRMA 1 ("Ratifico todo"): 7 dudas resueltas (Alameda/Vulcano · nichos sí ·
  planta sí · remoto diferido a host · tamaños · modos · kind client) + autonomous_mode ratificado
  + directiva casuística máxima → 03-arch.
