# 03-arch.md — organizacion-ficticia-golden-fixture (armado a mano — hueco KIT 0.5.3)

---
story_id: organizacion-ficticia-golden-fixture
arch_version: 1
last_modified: 2026-07-18
based_on: 01-spec.md v2 (FIRMA 1 · "Ratifico todo" · autonomous_mode ratificado)
---

## Decisiones arquitectónicas (D-A)

- **D-A1 · Verificador en Python, familia `gen_*`:** `sistema/schema/gen_cobertura.py`. Razón:
  `gen_schema.py` YA parsea `objeto.schema.yaml` (campos/enums/relaciones) — se reutiliza su
  lectura del contrato; las instancias se leen como YAML crudo (presencia de campo = dato crudo,
  que los structs Go tipados pierden). CLI: `--shell <path>` (repetible) · `--flota` (agrega) ·
  `--area <area-id>` (scope al hito Finanzas) · `--manifiesto <out.md>` · exit ≠ 0 con huecos.
  Tests: `sistema/schema/test_gen_cobertura.py` (unittest stdlib, sin deps nuevas) — mutación RED
  primero (quitar campo/arista → el test espera el hueco nombrado).
- **D-A2 · Política de cobertura (RN-17 operacionalizada):**
  - flota = 100% campos + 100% valores de enum + 100% aristas (`relaciones:` del schema).
  - Terranova sola = 100% campos + aristas; enums estructuralmente exclusivos repartidos por
    diseño DECLARADO en tabla `reparto:` dentro del propio verificador config
    (`gen_cobertura.yaml` chico junto al script — el reparto es dato, no código).
  - Extra flota: 100% de los verbos de `verbos.yaml` usados ≥1 vez (valida el seed) + regla de
    distribución de provenance (RN-19: ≥4 fuentes, `Inferido`≠`alta`, ninguna combinación
    fuente×conf >70% por shell).
- **D-A3 · Autoría de datos — seed curado, expansión mecánica SOLO en personas:** las entidades
  ricas (procesos, KPIs, objetivos/KRs, proyectos, ideas, brechas, capabilities, sistemas, áreas,
  roles) se escriben A MANO contra la matriz de casuística. Las ~530 personas de la flota se
  expanden desde **tablas seed curadas por área** (nombre·rol·reporta_a·vínculo — diseñadas, no
  aleatorias); la expansión es transcripción. Anti-"dump sintético": la matriz de casuística
  gobierna cada archivo; provenance por regla RN-19, no uniforme.
- **D-A4 · Los shells NO cargan gates del repo cockpit:** validación al leer (CK-13) +
  `gen_cobertura.py` corrido desde cockpit apuntando al shell. Cada shell = repo git propio con
  commits propios (patrón migración prenter T-5 schema-v2: pathspec `empresa/`).
- **D-A5 · Registro:** `chris-corp/portfolio/registry.yaml` (SSoT, commit en ese repo) gana 3
  entradas `kind: client` con `repo:` = el shell y `cockpit: {active: true}`; espejo manual en
  `~/.cockpit/cockpit.yaml` (cache generado — devhub lo regenerará; el espejo manual mantiene el
  contrato mientras tanto). Nombre visible marca la ficción: "(ficticia · golden fixture)".
- **D-A6 · `tipo_unidad` += `planta`:** cambio ADITIVO a `objeto.schema.yaml` (enum) + paridad Go
  (TestParidadSchema lee el YAML — verificar que no haya lista espejo hardcodeada; si la hay,
  actualizarla). Cero migración (nadie usa `planta` aún).
- **D-A7 · Verbos nuevos por PR (RN-23):** el fixture introduce **2 verbos del rubro** vía el
  flujo de gobernanza real: `liquidar` (liquidación de obra — Terranova) y `calibrar`
  (mantenimiento — Vulcano), cada uno con clase ALM×MGI completa + sinónimos. Ejercita el gate
  como lo haría un cliente.
- **D-A8 · Remote git:** repos locales con git init + commits; push a remoto privado = follow-up
  al provisionar host (Forgejo F1.3) — registrado en R como deferred visible.

## § Integration design (CONN — anti-orphan)

- **Consumed:** `cruce-estructura-operacion-indicadores` + `brecha-proyecto-ciclo-vida` (F1.1,
  fixture de desarrollo) · `consultio/operar-metodo-construir-mapa-completo` (manifiesto =
  contrato de aceptación) · demo comercial (operador).
- **On the map:** cap `sistema/organizacion-ficticia-golden-fixture` (nueva) · node `transversal`
  con consumidor N13.
- **Navigable:** portfolio del cockpit lista las 3 empresas; `/api/objeto?empresa=<slug>` las
  sirve; READMEs por shell son la puerta humana.
- **Notarized/registered:** registry chris-corp + `~/.cockpit/cockpit.yaml` (D-A5); manifiesto
  commiteado en cockpit (`sistema/schema/manifiesto-cobertura-flota.md`) y linkeado desde la
  historia de operar-metodo.

## § Matriz de casuística (directiva del operador: "todos los escenarios complejos posibles")

Cada caso lleva **dónde aterriza** (shell · área). El builder marca ✔ al construir; el verificador
cubre lo estructural (campos/enums/aristas/verbos/provenance); lo semántico lo audita la Fase B
contra esta tabla. **T=Terranova · A=Alameda · V=Vulcano.**

> **[R post-audit 2026-07-18] Aterrizajes reales donde el shell divergió del plan (la esencia de
> cada fila SÍ está encarnada — Audit A 48 filas/38 limpias):** C1.1 jerárquico al residente de
> obra (no al gerente de construcción) · C1.5 sin_kpi = asistente de gerencia (no recepcionista)
> · C1.8 interino V = Calidad+Seguridad-SSO (no Mantenimiento) · C2.4 KR DSO 88→60 (no 90→60) ·
> C2.8-A tensión disponibilidad-góndola↔merma (no venta/m²↔merma) · C8.1-T `ext` en empresa.yaml
> root (no en la unidad). Post-fix-loop además: C3.7 gana la variante banda sin umbral_amarillo
> (kpi-ausentismo V) · C7.8 gana la idea de contratista (idea-orden-almacen-obra T) · ROI
> normalizado a convención neta (B−I)/I en toda la flota.

### C1 · Organización (personas/roles/áreas)

| # | Caso complejo | Aterriza |
|---|---|---|
| C1.1 | Reporte **matricial**: controller de obra → jerárquico a Gerente de Construcción + funcional (dotted) a CFO | T·Obras/Finanzas |
| C1.2 | Persona **multi-rol** (CFO + Oficial de Cumplimiento) | T·Finanzas |
| C1.3 | Rol multi-persona (1 rol Cajero ×~20 personas) | A·Tiendas |
| C1.4 | **Rol vacante** (Jefe de Tesorería definido, nadie lo cumple → hueco visible para la UI + brecha) | T·Finanzas |
| C1.5 | `sin_kpi` justificado (recepcionista) | T·Administración |
| C1.6 | Vínculos 3/3: empleado · contratista (maestro de obra) · tercero con `tercero_ref` (contador del estudio BPO) | T·Obras / V·Finanzas |
| C1.7 | Áreas anidadas **3 niveles** (Gerencia General → Finanzas → Tesorería y Cobranza) | T |
| C1.8 | Líder interino: mismo rol lidera 2 áreas | V·Calidad+Mantenimiento |
| C1.9 | Cadena de reporte ≥4 niveles (GG → Gte Finanzas → Jefe Cobranza → Analista) | T |
| C1.10 | Franquicia: proceso plantilla ejecutado por unidad cuyo personal NO está en el organigrama (franquiciado = tercero) | A |
| C1.11 | Personal de planta por turnos (mismo rol, 2 turnos — data de personas creíble) | V·Producción |

### C2 · Estrategia (objetivos/KR/KPI)

| # | Caso | Aterriza |
|---|---|---|
| C2.1 | Cascada 4 horizontes: `proposito` → `3a` → `anual` → `trimestre` | T (mixto: anual GPD + Q OKR) |
| C2.2 | Objetivo `deprecado` + `superseded_by` (pivote registrado: "expansión provincias" → "consolidar Lima") | T |
| C2.3 | Perspectivas BSC 4/4 repartidas | T+A |
| C2.4 | KR con `kpi_ref` (frontera permeable: "DSO 90→60" sobre serie kpi-dso) | T·Finanzas |
| C2.5 | KR sin `kpi_ref` (binario: "lanzar Proyecto Marina F1") | T |
| C2.6 | `acople_compensacion: true` (PLR planta V · bono gerencial T-mixto); false explícito en A | V·T·A |
| C2.7 | `accountable_ref` (KR ownership por rol, jamás persona) | todos |
| C2.8 | KPI `en_tension_con` (counter-metrics): absorción↔margen (T) · venta/m²↔merma (A) · OTIF↔inventario (V) | T·A·V |
| C2.9 | `rollup` 3/3: peor-hijo (seguridad V) · promedio · ponderado | V·T·A |
| C2.10 | `tipologia` 3/3: kpi · dpi (antigüedad de saldos) · kri (accidentabilidad; rotación de personal) | T·V |
| C2.11 | lead vs lag en par (visitas caseta/cotizaciones → ventas cerradas) | T·Comercial |
| C2.12 | `frecuencia` 4/4: diaria (caja tienda) · semanal (avance obra) · mensual (DSO) · trimestral (clima) | A·T |
| C2.13 | KPI que contribuye a 2 KRs con `peso` distinto (N:M real) | T |

### C3 · Mediciones (el "estado real" hardcodeado)

| # | Caso | Aterriza |
|---|---|---|
| C3.1 | Serie 12 meses mensual + serie semanal corta | T·A |
| C3.2 | Mismo KPI cortado por unidad con salud OPUESTA (obra Aurora verde · obra Marina roja — el drill-down de la demo) | T |
| C3.3 | `divergente` derivado: declarado 95% vs observado 87% (avance de obra — anti-gaming) | T·Obras |
| C3.4 | Solo-declarado (proceso manual sin sistema) | V |
| C3.5 | Solo-observado con `query_ref` (venta por POS) | A |
| C3.6 | Hueco en la serie (mes sin medición — frescura visible, sin warning) | V |
| C3.7 | Semáforo 3 colores presentes en la flota; banda con y sin `umbral_amarillo` | flota |
| C3.8 | Estacionalidad retail (pico diciembre, valle febrero) | A |
| C3.9 | Tendencia que MEJORA tras proyecto de mejora cerrado (DSO baja post pm-cobranza → sustenta `veredicto: movio` + `delta_observado`) | T |

### C4 · Procesos / actividades

| # | Caso | Aterriza |
|---|---|---|
| C4.1 | Proceso **transversal** multi-área (`areas_ref` ≥2: cierre mensual toca Finanzas+todas) | T |
| C4.2 | `tipo_actividad` 5/5 — incluida `espera` real (aprobación municipal de permisos) | T·Desarrollo |
| C4.3 | `flujos_alternos` (cliente rechaza cotización → renegociar; rechazo de calidad → reproceso) | T·V |
| C4.4 | RACI completo con C e I (no solo R/A); A==1 siempre | todos |
| C4.5 | `tiempos` espera ≫ toque (permisos: 90d espera vs 4h toque — oportunidad visible) | T |
| C4.6 | `mandato` 3/3: regulatorio (facturación electrónica; seguridad industrial) · preventivo (backup) · habilitante | T·V |
| C4.7 | `triage` 5/5 veredictos: eliminable (reporte que nadie lee) · automatizable-rpa (conciliación bancaria) · automatizable-agente (consultas de clientes) · aumentable (análisis de crédito) · humano-por-diseño (aprobar crédito, negociar) — c/u con `automatizacion` completo | T·Finanzas concentra |
| C4.8 | `tlx` alto en cierre mensual (carga cognitiva agregable por rol — CK-24) | T·Finanzas |
| C4.9 | `alimenta_kpi_refs` con peso, una actividad → 2 KPIs | T |
| C4.10 | Verbo corregido CON provenance (triage ratificado por consultor) | T |
| C4.11 | `digital` 3/3: manual (cuaderno de obra) · externo (banco) · integrado (ERP) | T·V |
| C4.12 | `provisto_por` 3/3: bpo (contabilidad V) · outsourcing (limpieza A) · proveedor (transporte A) | V·A |
| C4.13 | Riesgos tipados prob×impacto variados (ISO cl.6.1) | V·T |
| C4.14 | Verbos: 100% del catálogo usado en la flota + 2 verbos nuevos por PR (`liquidar`, `calibrar` — D-A7) | flota |

### C5 · Sistemas

| # | Caso | Aterriza |
|---|---|---|
| C5.1 | `procedencia` 4/4: propio (e-commerce A) · compartido (ERP corporativo) · externo (CRM SaaS) · terciarizado (planilla en estudio) | flota |
| C5.2 | `sirve_a` cliente-final (portal de avance de obra para compradores) | T |
| C5.3 | Bloque `producto{}` opt-in (app e-commerce con roadmap) | A |
| C5.4 | "Sistema" Excel (digitalización roja — la realidad LATAM) | V |
| C5.5 | Legacy por reemplazar → alimenta brecha + proyecto de migración | V |

### C6 · Capabilities / brechas

| # | Caso | Aterriza |
|---|---|---|
| C6.1 | `gap_tipo` 3/3: nonconformity (hallazgo auditoría ISO) · target_variance (DSO fuera de banda) · assessment_finding (capability cobranza inmadura) | T·V |
| C6.2 | `estado_brecha` 4/4 — incluida `off-thread` (deuda visible) y `a-corroborar` (dato conf baja) | flota |
| C6.3 | Brecha con costo/ROI cuantificado → prio WSJF | T |
| C6.4 | Brecha accionable SIN proyecto aún (pipeline listo para la demo brecha→proyecto) | T |
| C6.5 | Capability con assessment por niveles | T·A |

### C7 · Mejora (proyectos + ideas)

| # | Caso | Aterriza |
|---|---|---|
| C7.1 | `estado_proyecto` 12/12 en la flota — incl. `suspendido` (obra parada por permisos) · `cancelado` con aprendizaje · `rechazado` | flota |
| C7.2 | `metodologia` 4/4: dmaic (cobranza T) · masp con **loop-back** en-verificacion→en-ejecucion (scrap V) · kaizen (merma A) · pdca | T·V·A |
| C7.3 | `tipo_beneficio` 4/4: hard-saving (con `firmas.finanzas.fecha_post`) · soft · cost-avoidance (evitar multa) · aumento-ingresos (absorción) | flota |
| C7.4 | Doble firma sponsor+finanzas; hitos/tollgates con estados mixtos | T·V |
| C7.5 | `resultado` 3/3: movio (con delta y C3.9) · parcial · no-movio con aprendizaje honesto | flota |
| C7.6 | Origen: solo-brecha · solo-idea · AMBAS | flota |
| C7.7 | `mueve_refs` a KPI y a KR (ambos tipos de target) | T |
| C7.8 | Ideas 5/5 estados; individual · **conjunta** (≥2 proponentes) · rechazada con feedback · con reconocimiento · propuesta por contratista | flota |

### C8 · Transversal

| # | Caso | Aterriza |
|---|---|---|
| C8.1 | `ext:` ignore-and-preserve (T: `banco_promotor` en unidad-obra · V: certificación sectorial) | T·V |
| C8.2 | Provenance RN-19: ≥4 fuentes por shell, `Inferido` jamás alta, mezcla realista M1 | flota |
| C8.3 | Unidades: obra activa · obra en cierre · sucursal madura · sucursal ramp-up · franquicia ×2 · planta ×2 · SPV `entidad_legal_ref` | T·A·V |
| C8.4 | 3 modos estrategia (uno por shell) | flota |
| C8.5 | Weak-entity ids estables (`pr-x#aN` · `kpi-x#mN` · `pm-x#hN` · `empresa#uN`) | todos |
| C8.6 | Ficción segura RN-20 (nombres inventados, tax-id ficticios, cero marcas/personas reales) | todos |

## § Plan de datos por shell (volúmenes objetivo)

| Entidad | T (golden) | A | V |
|---|---|---|---|
| personas | ~200 | ~150 | ~180 |
| roles | ~40 | ~25 | ~30 |
| areas | ~12 (3 niveles) | ~8 | ~10 |
| procesos | ~22 (Finanzas ~8 profundos) | ~12 (plantilla×unidad) | ~15 |
| sistemas | ~10 | ~8 | ~8 |
| objetivos | ~12 (4 horizontes) | ~8 | ~8 (GPD desdoblado) |
| kpis | ~18 (nicho IMM ancla) | ~12 | ~14 |
| proyectos_mejora | ~6 | ~4 | ~5 (12 estados en flota) |
| ideas | ~6 | ~5 | ~5 |
| brechas | ~8 | ~4 | ~5 |
| capabilities | ~8 | ~5 | ~6 |
| **total aprox** | **~345** | **~230** | **~275** |

Techo NFR: ≤500 archivos/shell. Personas fuera del área rica = seed-table curada (D-A3).

## § Riesgos

| Riesgo | Mitigación |
|---|---|
| Volumen de autoría degrada calidad (dump sintético) | Matriz C1-C8 gobierna cada archivo; D-A3 limita expansión mecánica a personas; auditoría Fase B revisa contra la matriz |
| Cobertura "a ojo" | RN-17: solo el verificador declara cobertura; mutación RED prueba que detecta |
| 0-warnings vs casuística (formas warning-génicas) | Política: la casuística vive DENTRO del espacio 0W (p.ej. todo KPI con `proceso_ref`; toda ref resuelve); lo warning-génico se prueba en tests del verificador, no en los shells |
| Enum planta rompe paridad Go | T-1 verifica TestParidadSchema + gates antes de tocar shells |
| Registry cache desincronizado | D-A5: espejo manual + nota para devhub regen |

## Próximo paso

`06-tickets.yaml` (T-1..T-9, autonomous_mode: true) → build → audit. Estado → `ready`.
