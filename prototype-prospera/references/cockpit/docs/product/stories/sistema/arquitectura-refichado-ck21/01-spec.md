# 01-spec.md — arquitectura-refichado-ck21

---
story_id: arquitectura-refichado-ck21
type: service-story
module: sistema
capability: sistema/arquitectura-refichado-ck21
po_version: 3
last_modified: 2026-07-17
ratified_by_chris: true   # v2: "Apruebo todo" + acotación triage. v3: post-auditoría adversarial (5 auditores). GO final del operador 2026-07-17 (CK-24 firmada · D-07 clavada · historia captura-manual-kpis creada) — refined FIRME
links:
  story_yaml: story.yaml
  story_md: 00-story.md
  ledger: CK-21 · CK-22 · CK-23
---

## Resumen ejecutivo

Bajar CK-21 completo a los dos ejes as-code (arquitectura + metodología) para que las historias
funcionales del MVP construyan sobre un mapa sin contradicciones con el norte **Organization as Code
→ Organization Twin**. Cinco frentes de trabajo (WS1-WS5): pase fino de NODOS.md, delta del R-walk,
despliegue.html curado, arquitectura.yaml re-fichado, y — alcance ampliado en refinamiento
(2026-07-17, operador) — **el mapa de notaciones/estándares del twin cementado as-code** con vista
HTML generada: qué estándar usamos para qué dimensión, cuándo sí, cuándo no, cuándo estándar propio
y por qué.

## § Dónde vive

- **node:** transversal (toca NODOS.md/despliegue/arquitectura.yaml = mapa de los 16 nodos, y
  `sistema/metodo/` + `sistema/schema/` = eje metodología).
- Historia **docs-as-code**: no toca runtime Go/UI. Live-verify del seam (API :4100) = N/A
  (`not_applicable_reason: "historia docs-as-code — el artefacto ejecutable son los gates + vistas generadas"`).

## Doctrina que esta historia cementa (la decisión de fondo — FIRMA del operador)

> Base: research `docs/research/organization-as-code/` (04 doctrina Palantir · 05 SOTA §base
> teórica · 06 Gartner DTO features · 07 TO-BE 37 capacidades) + estado real de
> `sistema/schema/objeto.schema.yaml` y `sistema/metodo/methodologies.yaml` (31 M-cards).

**Regla cardinal: estándares como vocabulario · schema propio como metamodelo · git como motor ·
notación = proyección generada, nunca SSoT.**

Un estándar juega un rol por **(estándar × dimensión × plano)**: `rol_ancla` único por dimensión +
`proyecciones[]` opcionales — una celda "ancla + proyección" son dos PLANOS (dato / vista), no dos
roles en conflicto. Las cards del método del ENGAGEMENT (familias A/E/H, ITIL) llevan rol
**`fuera-del-twin`** (`dimensiones: []` + `cuando_no:` obligatorio) — son cómo trabajamos nosotros,
no dimensiones del twin del cliente. Excepción declarada a la regla cardinal: `despliegue.html` es
vista CURADA del Fabricante (gate de madurez CK-17), fuera del scope twin — no la viola. Roles:

1. **Ancla semántica (vocabulario):** el estándar presta ontología/taxonomía/estructura y se embebe
   como dato (`archimate:`, `met:`, enums) en el schema. No hay diagrama fuente. Ej.: tipos
   ArchiMate, cláusulas ISO 9001, APQC PCF, letras RACI, estructura OKR, niveles COBIT.
2. **Proyección (vista generada):** la notación se usa para RENDERIZAR el dato (swimlane BPMN-lite,
   organigrama, strategy map, tortuga ISO). Se genera con `.py`, jamás se edita a mano.
3. **Intercambio (frontera):** formato estándar para importar/exportar contra herramientas del
   cliente (BPMN 2.0 XML, ArchiMate Model Exchange). No-MVP; se declara para no cerrar la puerta.
4. **Horizonte (gateado D9/CK-21):** estándar reservado para una fase futura ya decidida. BPSim
   (simulación de procesos — "no inventar") · DEMO/Dietz (base formal de transacciones si algún día
   formalizamos la ontología comunicativa).
5. **Descartado (con porqué):** lo que conscientemente NO adoptamos. ArchiMate como METAMODELO
   completo (notation-first = lock-in; Ardoq y Palantir validan entidad-primero) · BPMN como editor
   de diagramas fuente (el proceso es dato con provenance; el diagrama es vista) · UML/C4/CMMN/DMN
   (sin caso hoy) · **Bloom como eje de automatizabilidad** (taxonomía de objetivos de aprendizaje —
   pedagógica; la reemplaza la taxonomía de verbos propia ALM×MGI, ver acotación abajo).

### Acotación del operador (ratificación 2026-07-17) — triage automatización/eliminación + narrativa

Al nivel más bajo (diagramación/narrativa de actividades), el paquete metodológico DEBE permitir
detectar qué procesos/actividades son candidatos a **automatizar** y cuáles a **eliminar**, con la
narrativa como vehículo. Decisión:

- **Vocabulario controlado de verbos (estándar PROPIO):** cada actividad narra con un verbo del
  enum; cada verbo del vocabulario se clasifica en 2 ejes — **clase de tarea ALM**
  (rutinaria/no-rutinaria × manual/cognitiva-analítica/interpersonal; Autor-Levy-Murnane, el marco
  estándar de automatizabilidad) × **capacidad requerida MGI** (recolectar datos · procesar datos ·
  físico predecible · físico impredecible · interfaz-stakeholder · experticia/decisión · gestión de
  personas). Supersede la candidatura Bloom anotada en `objeto.schema.yaml` (`actividad.verbo`).
- **DOS scores DERIVADOS, nunca SSoT** (corrección post-auditoría — el score RPA-only puntuaba
  bajo justo donde nuestros arneses venden): **score-RPA** = f(datos estructurados, reglas
  estables, volumen, % excepciones) + **score-agente** = f(dato no estructurado, criterio
  expresable en prompt/policy, tolerancia a revisión humana, riesgo de error). Ambos cargan `conf`
  propagada de la completitud de inputs (input ausente/estimado → conf baja VISIBLE en el heatmap;
  nunca un score sin su incertidumbre al lado). Anti-drift: se calculan, no se etiquetan.
- **Veredicto del triage = ENUM, no binario:** `eliminable | automatizable-RPA |
  automatizable-agente | aumentable (humano+arnés) | humano-por-diseño`. "Humano-por-diseño" ancla
  a **accountability** (RACI A, firma, responsabilidad legal) — el único criterio que la GenAI no
  erosiona. "Aumentable" es ciudadano de primera clase: ES el producto (arneses por puesto).
- **Eliminar antes de automatizar:** ECRS como ORDEN del triage (Eliminar→Combinar→Reordenar→
  Simplificar) — no se automatiza el desperdicio. Delimitación de altitud: mining (M29) = evidencia
  que alimenta los inputs del score · VSM (M09) = flujo/future-state · ECRS = orden por actividad.
- **Regla de normalización "1 verbo = 1 actividad":** los compuestos ("revisa, aprueba y notifica")
  se PARTEN en el ingest (el agente propone el split desde la narrativa; el consultor corrige) —
  sin esta regla cada consultor decide distinto y los datos son incomparables.
- **Verbo con provenance:** el verbo lo asigna el ingest desde la narrativa con `conf`; el
  consultor solo corrige (auditado quién movió qué). Sin provenance el score es gameable eligiendo
  verbos "suaves".
- **La narrativa tiene hogar:** el relato del trabajador (fuente de verbos, splits y flujos) NO se
  destruye al normalizar — mismo patrón ya decidido para nuestro método (frontmatter = dato +
  cuerpo = prosa) aplicado al proceso del CLIENTE, o `evidencia_ref` al transcript. Sin esto la
  cadena de evidencia del score no tiene ancla.
- **Desgaste/carga cognitiva medida:** NASA-TLX variante RTLX (sin comparaciones pareadas), con
  **gatillo explícito**: solo actividades pre-flageadas por el triage (densidad de espera/decisión,
  % excepciones alto, queja espontánea en entrevista) — jamás censal (200 actividades × N
  trabajadores = inviable).
- **SGC/QMS explícito:** nuestros "estándares de manuales/procesos/funciones" anclan a la pirámide
  documental **ISO 10013:2021** (manual → procedimientos → instrucciones → registros) + ISO 9001
  cl.7.5; el mecanismo de ACTUALIZACIÓN de procesos = PDCA + Gestión de Cambios (D5/D8: el
  pipeline dev→UAT→prod ES la gestión de cambios ISO).
- **Cascada canónica ÚNICA** (la auditoría encontró TRES definiciones incompatibles del hilo en el
  repo — se cementa UNA; METODOLOGIA.md §2 y cap #10 del TO-BE se corrigen a ésta en WS5):

  `plan 3 años → plan anual → objetivo (directorio) → KR (OKR trimestral) → KPI (de proceso, con
  dueño = ROL o área) → actividad (verbo)`

  La PERSONA entra como **ocupante del rol** (persona→cumple→rol→dueño-de→KPI), NO como eslabón de
  medición individual. Atribución actividad→KPI = **N:M con peso opcional, vía rol** (resuelve la
  asistente que alimenta el KPI del gerente: aporta vía su rol al KPI del proceso, no "KPI de la
  asistente").
- **Frontera twin ↔ evaluación individual (doctrina nueva — auditoría detectó contradicción
  frontal con `objetivos.md §8` "no OKR individual" + exposición AI Act/GDPR art.22/sindicatos):**
  el twin mide **roles, procesos y áreas** por defecto; la vista por persona-nombrada existe SOLO
  con opt-in de nivel Gobernanza + consentimiento declarado; NASA-TLX/desgaste se agrega por
  rol/proceso, jamás se versiona como registro individual de salud ocupacional. M-card nueva
  "métricas de persona" (agregación mínima · acceso por nivel · consentimiento · retención) gemela
  transversal de M23-provenance. **Requiere ficha CK propia** (decisión de fondo — propuesta al
  operador).

**Cuándo estándar PROPIO:** cuando el diferenciador queda fuera de todo estándar — y Gartner lo
confirma (hilo de oro medido + arneses por puesto + as-code están FUERA de su lista DTO):
el **meta-metamodelo = `objeto.schema.yaml` as-code en git** (9 entidades, doctrina Palantir:
semántica + kinética + provenance structs + open/closed), extensible por cliente sin fork; a futuro
formalizable como contrato de entidad publicable estilo Backstage (`apiVersion/kind/spec`).

### Matriz dimensión → estándar (la tabla que se vuelve dato en WS5)

| Dimensión del twin | Estándar(es) | Rol | Cuándo NO / límite |
|---|---|---|---|
| Metamodelo (9 entidades + relaciones + kinética) | **propio** (doctrina Palantir como gramática) | metamodelo as-code | ArchiMate-como-metamodelo descartado |
| Vocabulario de arquitectura | ArchiMate 3.2 (tipos por entidad/relación) | ancla | sin diagramas fuente; sin capas completas |
| Procesos — clasificación | APQC PCF + tortuga ISO 4.4 | ancla | — |
| Procesos — flujo | BPMN 2.0 (subset "BPMN-lite": lane/tipo/disparador) | ancla + proyección swimlane | editor de diagramas NO; export XML = intercambio V2 · **SIPOC = proyección de bordes** (tabla 1-página para validar con el dueño en M1) — el dato ya está absorbido (`proveedor_ref`/`cliente_ref`, D-08/D-11), NO M-card |
| Riesgo y controles | ISO 9001 cl.6.1 (risk-based thinking) | ancla | COSO / ISO 31000 = horizonte; `riesgos[]` tipado por proceso = schema-v2 (hoy strings libres — hueco declarado por auditoría) |
| Organización (personas/roles/áreas) | RACI + ISO 9001 cl.5.3 + TOGAF org decomposition | ancla + proyección organigrama | no es suite RRHH |
| Estrategia (objetivos→OKR→KPI) | capas 0-5 de `docs/metodo/objeto/objetivos.md §6` (SSoT de precedencia): Hoshin = mapa 3-5a · OKR = motor 90d · BSC = **solo checklist** de perspectivas · COBIT = cascade de anclaje | ancla (alignment + catchball — NO cascada estricta, §8) | strategy-map como proyección SOLO cuando exista dato `perspectiva`/causal (schema-v2); X-matrix ceremonial NO |
| Madurez y brecha | COBIT niveles 0-5 + ISO 19011 (evidencia) + WSJF + FinOps | ancla | — |
| Calidad / loop de mejora | ISO 9001 (ontología cl.4 + PDCA) | paraguas | sin aparato de certificación (VISION §ISO) |
| Provenance (todo dato AS-IS) | struct `fuente`+`conf` (M23, patrón Palantir) | transversal obligatorio | — |
| Narrativa de actividades (nivel más bajo) | **vocabulario controlado de verbos PROPIO** (clase ALM × capacidad MGI) | ancla + insumo del triage | Bloom descartada (pedagógica) · **ALM = eje descriptivo, NO sentencia**: GenAI automatiza lo no-rutinario-cognitivo — nuestros propios arneses lo prueban; mandan capacidad MGI + accountability |
| Triage eliminar/automatizar/aumentar | ECRS como ORDEN del triage · VSM (M09) = flujo/future-state · mining (M29) = EVIDENCIA (alimenta volumen/excepciones del score) · criterios RPA + criterios agente-LLM | ancla + proyección (heatmap) | veredicto ENUM, no binario: `eliminable · automatizable-RPA · automatizable-agente · aumentable · humano-por-diseño`; DOS scores derivados (RPA y agente) con `conf` propagada — jamás etiquetados a mano |
| Carga cognitiva medida (desgaste) | NASA-TLX | situacional (medir con humanos en M1, no estimar) | — |
| Documentación QMS (manuales/procedimientos/instrucciones/funciones) | ISO 10013:2021 (pirámide documental) + ISO 9001 cl.7.5 | ancla | actualización = PDCA + Gestión de Cambios (el pipeline dev→UAT→prod ES el mecanismo — D5/D8) · **reconcilia D-08**: el manual NO vuelve como entidad — la pirámide clasifica el corpus del CLIENTE; nuestro "manual" = proyección generada del proceso |
| Simulación | BPSim + DEMO | horizonte (D9) | nada antes del twin base + demanda |
| Contrato de entidad publicable | patrón Backstage | propio-publicable (V2) | — |

## Alcance — 5 workstreams

### WS1 · NODOS.md pase fino
- Chequeo 2 en profundidad: residencia del dato POR TIER (hosteado default / self-hosted
  enterprise-regulados) reflejada en las fichas de N6/N13/N16/N12 (hoy solo el chequeo la narra).
- TODAS las fichas coherentes con: default hosteado single-tenant (D3) · twin = deseado(N6) ×
  real(N16) × brecha continua(N13) · Consultio v0 = arneses sin shell (D7) · Gestión de Cambios en
  MVP (D8).
- `# Pendientes consolidados` refrescado (referencias a historias vigentes del roadmap CK-22/23).

### WS2 · R-walk delta (propuesta a firmar — pedido "ya de una vez")
- **R9 se parte:** R9 queda = canal técnico (releases firmadas + telemetría agregada, N3).
  **R16 nueva** = puerta comercial: login, cobro, gestión usuarios/asientos, entitlements/licencias
  (N3, E1-E3). Razón: D4 — el Portal ya no es solo canal; dos responsabilidades distintas con
  distinto stack y riesgo.
- **R17 nueva** = medir el hilo de oro y mantener la brecha continua + ciclo brecha→proyecto→KPI
  movido (N13, E3). Razón: D1/D2 — es EL diferenciador; hoy ningún R lo posee (R6 = brecha puntual
  del engagement en N14/E2; R11 = cruce y servido por niveles). R6 y R11 se re-redactan para no
  solapar (R6 → "brecha inicial del engagement"; R11 → "cruzar y servir" sin absorber el loop).
- Fichas N3/N13/N14 actualizan sus `[R#]`; biyección validada por el gate.

### WS3 · despliegue.html (curado a mano)
- N3 pintado como Portal pleno (login/cobro/asientos/fingerprint compuesto/descargas + canal).
- Las DOS modalidades de la Organización: hosteada por nosotros (default) / en red del cliente
  (tier enterprise-regulados) — misma celda, dos residencias.
- El twin como narrativa del flujo (deseado × real × brecha) en la leyenda/lectura del diagrama.
- Validación de madurez contra NODOS.md (gate existente).

### WS4 · arquitectura.yaml re-fichado
- `meta.proposito` + comentarios de cabecera reescritos al framing CK-21 (hoy: "binario en la red
  del cliente" como default y "Consultio = clon de DevStudio" — contradicen D3/D7).
- Componentes nuevos con `fichas: [CK-21]`, `estado: declarado`, sin `ruta:` (aún sin código):
  `motor-de-indicadores` (hilo de oro N13) · `brecha-proyecto` (ciclo brecha→proyecto N13) ·
  `portal` (frontera con N3 — plano ecosistema).
- Planos/relaciones revisados contra el twin (¿banda "fuentes" nombra deseado vs real?).

### WS5 · Mapa de notaciones as-code (alcance nuevo — el pedido del operador)
- **SSoT:** extender `sistema/metodo/methodologies.yaml` — bloque `twin:` por M-card:
  `rol: ancla|proyeccion|intercambio|horizonte|descartada|propio` · `dimensiones: [...]` ·
  `cuando_si:` · `cuando_no:` (1-línea cada uno). NO se forkea la taxonomía (regla
  anti-duplicación: mismo catálogo, dimensión nueva).
- **M-cards nuevas:** doctrina de ontología Palantir (la gramática del metamodelo — hoy adoptada
  por CK-21 pero invisible en el catálogo) · DEMO (Dietz) y BPSim como cards `horizonte` ·
  **taxonomía de verbos & automatizabilidad** (propia, ALM×MGI — supersede cand. Bloom) · **ECRS**
  · **criterios RPA-suitability** · **ISO 10013** (pirámide documental QMS) · **NASA-TLX**
  (situacional). Ajuste de cards existentes cuyo uso cambió con la visión madura (remapeo).
- **Contrato:** `methodology.schema.yaml` valida el bloque `twin:` — `rol_ancla` único +
  `proyecciones[]` + `dimensiones[]` contra lista canónica + rol `fuera-del-twin` (dimensiones
  vacías, `cuando_no:` obligatorio). Familia nueva **I · Twin & automatización del trabajo** entra
  al enum para hospedar las cards nuevas; las cabeceras de sección "I-NN" (fichas legacy) se
  renombran para no colisionar. La card de verbos NO toma el id M32 mientras el book lo asocie a
  Bloom (id limpio tras el barrido).
- **Barrido de residuos (book + prosa):** `docs/metodo/objeto/` (Bloom residual en
  README §6/procesos.md/ejemplo · nota-fuente de SOMA — hoy ancla citada ~15× sin definirse en
  ninguna parte · fila SIPOC en tabla §6 · ref muerta `process.schema` · "paso" al glosario · L5
  declarado diferido) + saneo de la prosa no-GEN de `METODOLOGIA.md §0-§3` (refs rotas a
  tooling/strategy, "LangGraph+voz" — N4 muerta CK-18) + `gen_metodo.py` campo `nombre_corto`
  (hoy trunca "Process / Task Mining" → "Process") + ISO 19011 declarado en el `twin:` de M23.
- **Generador + vista:** `gen_metodo.py` extendido (o `gen_notaciones.py` hermano) produce
  **`sistema/metodo/NOTACIONES.html`**: mapa de decisión navegable — por dimensión del twin, qué
  estándar, en qué rol, cuándo sí/no, por qué, con la regla cardinal arriba. Correr `python3 ...`
  → abrir el HTML → entenderlo sin leer YAML. Gate anti-drift en pre-commit (mismo patrón CK-17).
- **Prosa:** §5 nuevo en `METODOLOGIA.md` (bloque GEN) o sección en `PROCESS-AS-DATA.md` con la
  regla cardinal (para humanos y arneses).

## Auditoría adversarial (2026-07-17, pedido del operador) — resultado

5 auditores paralelos (orgs peor-caso · coherencia interna · nivel actividad · SOMA/SIPOC ·
cascada KPI). Las correcciones de doctrina ya están incorporadas arriba (dos scores, veredicto
enum, cascada única, frontera persona, fila Riesgo, precedencia estrategia, reconciliación ISO
10013↔D-08, contrato `twin:` con `rol_ancla`+`proyecciones[]`, rol `fuera-del-twin`, barrido de
residuos). Lo que NO se arregla aquí queda cementado como insumo o diferido consciente:

### Insumos cementados para `schema-v2-hilo-de-oro-kinetica` (el registro que esa historia hereda)

1. **KPI = ENTIDAD** con id (hoy item sin id — "cada KPI ancla a un OKR" es unimplementable en el
   dato), `dueño_ref` (rol/área), `tipo: lead|lag`, tipología **KPI/DPI/KRI** (adoptado del demo
   SOMA), frecuencia de refresco, y por medición: `valor_declarado` vs `valor_observado{query_ref}`
   + estado `divergente` (el motor PINTA el gaming, no lo consagra) + `fuente`/`conf`.
2. Arista `kpi.contribuye_a → key_result` (N:M, peso opcional) + atribución actividad→KPI vía ROL.
3. `objetivo`: `horizonte` enum (proposito|3a|anual|trimestre) + `cadencia_revision` + `estado`
   (vigente|deprecado + `superseded_by` + vigencia) + `perspectiva` BSC opcional (habilita el
   strategy-map como proyección). `key_results` pasa a `requerido: false` + estado de gap
   `sin-ancla-de-valor` ≠ `off-thread` (cliente sin OKR no vacía el diagnóstico).
4. `actividad`: `fuente`+`conf` (o `evidencia_ref`) — hoy viola el principio cardinal del propio
   schema · `flujos_alternos {cuando, actividades}` portado de PROCESS-AS-DATA (hoy `orden: int`
   lineal no puede narrar "si X entonces Y") · `tiempo` → `{toque, espera}` (VSM real) ·
   `mandato: regulatorio|preventivo|habilitante` (protege compliance del triage "huérfana de
   KPI = eliminar") · campos RPA/agente del score · TLX opcional (medido, provenance Entrevista).
   Context-switching = DERIVADO (alternancia de `carril_ref`), no campo.
5. Enum de verbos: canónico + `sinonimos[]` es-419 (alias normalizados en ingest) + gobernanza:
   verbo nuevo = PR que declara su clase ALM×MGI, el gate lo valida.
6. `persona`: `reporta_a` → lista `{ref, tipo: jerarquico|funcional}` (matricial/dotted-line) ·
   `vinculo: empleado|contratista|tercero{ref}` (BPO) · `sin_kpi: {razon}` (ausencia honesta).
7. `proceso`: `provisto_por_ref` (terceros — ISO 9001 cl.8.4, hoy ausente de todo `met:`) ·
   `riesgos[]` tipado (cl.6.1; hoy strings libres).
8. Enum `fuente` + **"Observado"** (drift método↔schema HOY: M1-LEVANTAMIENTO lo promete, el enum
   no lo tiene). Arista `en_tension_con` / counter-metric entre KPIs (hoy el grafo solo tiene
   aristas de armonía). Función de **rollup declarada** (¿peor-hijo? ¿ponderado?) — sin ella el
   semáforo queda a criterio del implementador. Tipos numéricos en from/to/current (hoy str).
9. Extensión por cliente (open/closed Palantir): **hoy es promesa sin mecanismo** — schema-v2
   decide: punto de extensión mínimo (`ext:` por entidad + política de validación) o declararlo V2.
10. Del demo SOMA para m2/ingesta: **umbral de acumulación de hallazgos** (3+ antes de
    reversionar) + **formulario de reporte de 4 campos** (personal sin método) + vista
    before/after para el aprobador (Gestión de Cambios N13).
11. **Unidad de ejecución** (D-07 clavada): la medición del KPI lleva `unidad_ref` opcional
    (proyecto/obra/sucursal) — proceso definido una vez, medido por unidad; instancia lleva
    `entidad_legal_ref` opcional (SPV = atributo legal, no partición).

### Diferidos — resolución del operador (GO 2026-07-17)

- ✅ **Captura MANUAL de KPIs** → historia creada: `cockpit/captura-manual-kpis` (F1.4, alta,
  deps schema-v2 + cruce-indicadores). Fuente de primera clase con provenance `Declarado` +
  frescura; el lakehouse la reemplaza métrica a métrica sin cambiar la vista.
- ✅ **Frontera twin↔evaluación individual** → **CK-24 firmada** (LEDGER).
- ✅ **Holding** → **D-07 clavada**: techo = empresa; holding = agrupador puro sin dato. Patrón
  grupo inmobiliario decidido CONTRA "empresa-por-proyecto": el proyecto/obra/sucursal es
  **unidad de ejecución** — procesos definidos una vez en la empresa operativa, MEDIDOS por
  unidad (`unidad_ref` en la medición del KPI, insumo schema-v2); el SPV legal = atributo
  (`entidad_legal_ref`), no partición del twin. Negocios genuinamente distintos del grupo = cada
  uno su empresa bajo el agrupador. El mismo patrón resuelve el hueco franquicia/multi-sucursal.
- **M&A (fusión de twins) · multi-idioma:** sin respuesta hoy, registrados como límites conocidos
  del MVP.
- **Escala 5000+ (índice derivado V2 · sync HRIS → churn de personas):** registrado; primer
  cliente grande lo activa.

## Criterios de aceptación (Gherkin-lite)

- **SC-1** Dado el repo tras el merge, cuando corro `gen_arquitectura.py --check` +
  `gen_metodo.py --check` + `gen_roadmap.py --check`, entonces los tres salen 0.
- **SC-2** Dado NODOS.md, cuando busco "clon de DevStudio como precondición", "soberanía como
  dogma", "N3 solo-canal" o residencia sin tier, entonces no queda ninguna ficha con el framing
  viejo.
- **SC-3** Dado el R-walk, cuando recorro R1-R17, entonces R16 (puerta comercial) y R17 (brecha
  continua/hilo de oro) existen con nodo dueño, y todo `[R#]` de las fichas resuelve (gate).
- **SC-4** Dado `arquitectura.yaml`, cuando lo valido, entonces existen `motor-de-indicadores`,
  `brecha-proyecto` y `portal` con `fichas:` que resuelven en LEDGER, y `meta.proposito` narra el
  modelo CK-21 (hosteado default + twin).
- **SC-5** Dado `methodologies.yaml`, cuando lo valido, entonces TODA M-card tiene bloque `twin:`
  válido, existen las cards de doctrina Palantir + DEMO + BPSim + taxonomía de verbos (ALM×MGI) +
  ECRS + RPA-suitability + ISO 10013 + NASA-TLX, y `NOTACIONES.html` regenerado está en sync
  (anti-drift).
- **SC-8** Dado `NOTACIONES.html`, cuando el operador pregunta por una actividad "¿se elimina, se
  automatiza (RPA o agente), se aumenta o se defiende como humana?", entonces encuentra el triage
  completo (ECRS → verbos ALM×MGI → criterios RPA + criterios agente → dos scores con `conf`) y
  el porqué del descarte de Bloom. (G Chris-verify.)
- **SC-9** Dado el repo tras el merge, cuando busco el hilo de oro, entonces existe UNA sola
  cascada canónica (la de esta spec) y METODOLOGIA.md §2 + el mapeo del TO-BE la reflejan (las
  tres definiciones incompatibles detectadas quedan reconciliadas).
- **SC-10** Dado `docs/metodo/objeto/` (book) tras el barrido, cuando grep-eo Bloom como
  candidata vigente, SOMA sin nota-fuente, o la ref muerta `process.schema`, entonces cero
  residuos; la matriz incluye la fila "Riesgo y controles".
- **SC-6** Dado `NOTACIONES.html` abierto en navegador, cuando el operador lo lee, entonces puede
  responder para cualquier dimensión del twin: qué estándar usamos, en qué rol, cuándo sí, cuándo
  no y cuándo hacemos estándar propio — sin abrir el YAML. (Se verifica en G Chris-verify.)
- **SC-7** Dado `despliegue.html` abierto, cuando el operador lo lee, entonces ve N3-Portal pleno,
  las dos modalidades de residencia y el twin como narrativa. (G Chris-verify.)

## DoD (docs-as-code — ratificado en refinamiento)

Gates verdes (SC-1) + revisión del operador en G (Chris-verify): render de `despliegue.html`,
`arquitectura.html` y `NOTACIONES.html` (SC-6/SC-7). Sin live-verify de API (N/A declarado).

## Fuera de alcance

- Construir motor-de-indicadores / brecha-proyecto / portal (solo se DECLARAN; construcción =
  historias F1.1/F2).
- Cambios a `objeto.schema.yaml` (eso es `schema-v2-hilo-de-oro-kinetica`, siguiente en F1.0 —
  esta historia le deja la doctrina cementada como insumo). Incluye: el ENUM de verbos en
  `actividad.verbo`, los campos RPA-suitability por actividad, el score derivado y el eslabón
  actividad→KPI-persona de la cascada.
- Export BPMN XML / ArchiMate exchange (rol intercambio declarado, no implementado).
- Poblar `proceso/**` (historia `poblar-metodo-m1-m3`).

## Prior art scan (refinamiento 2026-07-17)

- Barrido research: corpus organization-as-code ya recomienda entidad-primero/Palantir y "BPSim/DEMO
  no inventar" (04:5 · 05:26-27 · 06:43 · 07:9-15). Sin CMMN/DMN en corpus.
- Barrido método: `objeto.schema.yaml` YA ancla ArchiMate + `met:` por campo; `methodologies.yaml`
  ya cataloga BPMN(M11)/APQC(M12)/ArchiMate(M13)/COBIT(M15)/ISO(M16)/RACI(M25)/OKR(M21)/
  Hoshin(M26)/BSC(M30). El WS5 AGREGA la dimensión de decisión (rol/cuándo), no recrea catálogo.
- Historia `terminar-arquitectura-despliegue` (done) cerró el mapa CK-14/18; ésta baja el delta
  CK-21. Sin duplicación.
