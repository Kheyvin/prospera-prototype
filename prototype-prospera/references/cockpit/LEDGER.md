# Ledger — Cockpit (fichas CK-NN)

> Continuidad: este repo nació de la graduación de la célula P1 del monorepo `prenter-harness`
> (2026-07-06). CK-01..CK-08 (fundación + extracción Stage 1-4) y CK-09 (la ficha de graduación)
> quedan allá, en `products/cockpit/LEDGER.md`, congelados como historia. Aquí arranca **CK-10** —
> misma numeración, sin romper identidad (a diferencia de otras graduaciones del mismo ecosistema
> que sí rompieron prefijo; decisión explícita del operador, ver CK-10).

## Fichas

### CK-10 · Fundación del repo propio — graduación de P1 con visión ampliada — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-06):* "Promueve el producto cockpit a una carpeta propia con un
repositorio propio... el proyecto se llamará Cockpit y su visión es la de ser un sistema para el
levantamiento, diseño, creación, propagación/adopción, monitoreo y mejora continua de procesos /
roles / objetivos / personas (puestos) basados en las buenas prácticas ISO... a este repositorio
traslada de forma ordenada todo lo avanzado con la lógica que tenemos de producto y servicio... y
que los mockups/investigaciones no se pierdan, que queden cableados para revisarlos cuando se
pida investigar."

*Desarrollo:* graduación ejecutada tras auditoría de 4 subagentes (metodología ya existente en el
monorepo · inventario de investigación/mockups dispersos · plantilla de las 3 graduaciones previas
del mismo ecosistema — DevHub/Kit/Harness Studio · relevancia de skills). Repo `~/Proyectos/cockpit`
(remote `alpacapurpura/cockpit`, privado) nacido con: código migrado byte-a-byte desde
`products/cockpit/` (Go module renombrado `github.com/alpacapurpura/cockpit`, UI renombrada
`cockpit-ui`) y **verificado standalone** (go build/vet/test + UI tsc/vitest + export estático
real — cero dependencia del monorepo de origen); VISION.md ampliada (identidad = 4 pilares
procesos/roles/objetivos/personas, marco ISO intermedio — ver fork abajo); LEDGER propio
continuando `CK-NN`; `docs/{research,mockups,architecture,methodology}/` con el material heredado
curado (campañas cockpit-negocio y modelo-objeto, subset de NODOS.md/ARCHITECTURE.md, M-cards de
gestión empresarial del catálogo de 31 metodologías); kit dev instalado como plugin
(`harness@prenter-marketplace`, canal estable, scope project).

**Forks firmados por AskUserQuestion:**
- **Alcance ISO = "marco entre ambos"** — ontología+PDCA como columna vertebral (hereda el
  veredicto I-05 del monorepo, "roba la ontología, rechaza el aparato") MÁS una capability futura
  declarada (no construida) de "preparación para auditoría" — gap-checklist vs. norma, sin aparato
  de certificación. Ver VISION.md §ISO.
- **Prefijo del ledger = continuar `CK-NN`** (no romper a uno nuevo, a diferencia del precedente de
  Harness Studio) — la identidad "Cockpit" no muta, solo se amplía.

**Deudas declaradas:**
- Persona/puesto sin modelo de dato propio (`negocio.schema` lo trata como texto libre) — hueco
  más grande identificado por la auditoría de metodología, candidato a CK-11.
- El mockup real y el pricing del deal Prospera NO viajaron (doctrina I-39 "cero data de cliente")
  — quedan en `prenter/clientes/prospera/`, solo referenciados desde `docs/research/`.
- `arquitectura.yaml` (heredado) sigue apuntando a fichas CK-01..CK-08 y a un generador
  (`gen_arquitectura_cockpit.py`) que vivía en el monorepo — no se portó el generador; el YAML
  queda como documentación curada a mano hasta que se decida si vale la pena un render propio.
- La campaña `~/Proyectos/campaign-cockpit-negocio/` estaba marcada "temporal, bórrala al cierre"
  en el monorepo de origen — su contenido fue rescatado a `docs/research/`, pero la carpeta
  original NO fue borrada (decisión del operador, no de esta sesión).

*Conecta:* ficha ecosistema en `tooling/strategy/LEDGER.md` del monorepo (graduación de P1, 4/4
productos graduados) · CK-09 (la ficha de graduación, lado viejo) · I-39 (cero data de cliente) ·
I-78/I-79/I-80 (precedentes DevHub/Kit/Harness Studio, mecánica replicada) · I-05 (veredicto ISO
heredado y ampliado aquí).

*Siguiente:* modelar persona/puesto como entidad de primera clase (CK-11) · decidir si el Motor de
Discovery (N1) arranca campaña propia.

### CK-11 · Nacemos ordenados — tríada sistema/capabilities/proyecto · método del auditor migrado · System Backlog — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "¿Tenemos product backlog y product increment? Audita — y no
confundas lo que es SISTEMA (arquitectura, metodología, doctrina as-code; se llama sistema porque
tiene múltiples puntos de despliegue) con los capabilities YA desarrollados (documentation-as-code)
ni con los documentos de cómo me organizo para construir ('Proyecto'). Organiza el trabajo
pendiente en un system backlog con una columna por subsistema/aplicación y dame un medio para
hacerlo contigo de forma ordenada — nacemos ordenados. Antes, audita la migración desde
`prenter-harness` (legacy): las cosas de servicio deberían venir también, ya que estará embebida
en la aplicación del auditor."

*Desarrollo:* auditoría de 2 subagentes (inventario cockpit + legacy). Hallazgos: (1) migración de
código completa y verificada (módulo renombrado, tests verdes), pero **método de servicio
incompleto** — faltaban `M3-ESPINAZO.md`, `PROCESS-AS-DATA.md` y `service/process/` completo
(proceso-como-dato m1/m2/m3); (2) **no existía backlog ni increment** como artefactos — el trabajo
pendiente estaba fragmentado en VISION §TBD, `arquitectura.yaml` (`estado: pendiente`), LEDGER
"Siguiente:" y campañas de research; (3) la tríada estaba mezclada (`objeto.schema.yaml` enterrado
bajo research; VISION declaraba la capability prep-auditoría "en arquitectura.yaml" pero el YAML
no la tenía — drift). Ejecutado: migración completada (`sistema/metodo/{M3-ESPINAZO,
PROCESS-AS-DATA,proceso/}`, refs `service/methodology/*` reescritas); **reorganización en tríada**
— `sistema/` (arquitectura + metodo + schema), capabilities = código + `docs/`
(`docs/INCREMENT.md` nuevo, 6 capabilities verificadas), `proyecto/` (backlog + research);
`objeto.schema.yaml` promovido a `sistema/schema/`; fixture Vértice deduplicada (SSoT en
`sistema/metodo/proceso/_sample/`); **System Backlog** sembrado con BL-01..BL-18 en 5 columnas
(sistema · vista-negocio · motor-discovery · app-auditor · contrato-datos); drift corregido en
`arquitectura.yaml` (rutas `products/cockpit/*` → rutas del repo; componentes `app-auditor` y
`prep-auditoria` añadidos).

**Forks firmados (respuestas del operador en sesión):**
- **App del Auditor = subsistema propio.** Aplicación instalable del Consultor (patrón
  harness-studio/dev-studio); su resultado se publica al repositorio de la empresa cliente —
  "deploy de procesos": como código a producción, pero el artefacto son procesos/roles/objetivos
  que Cockpit entiende y renderiza. Nueva columna del backlog + componente en arquitectura.yaml +
  VISION §Arquitectura (que pasa de "dos mitades" a "las piezas").
- **Backlog = as-code.** `docs/product/_archive/backlog.yaml` SSoT + `BACKLOG.md` vista curada (mismo evento,
  jamás divergen); disciplina cableada en `CLAUDE.md` y `proyecto/README.md`.
- **Migración de servicio = copiar ya, destilar en el camino** (BL-07 queda `en-curso`).

*Addendum (misma sesión, v2):* el operador pidió cerrar dos huecos de la propia CK-11 — (1)
**única fuente de la verdad del pendiente**: VISION §TBD desduplicado (ahora apunta a BL-NN, el
detalle vive solo en el backlog; los "Siguiente:" de fichas quedan como narrativa histórica,
regla escrita en el header de backlog.yaml y en CLAUDE.md); (2) **Product Increment as-code**:
`docs/increment.yaml` (SSoT, CAP-01..CAP-06, cada capability cableada a los componentes
`estado: activo` de arquitectura.yaml) + `INCREMENT.md` degradado a vista humana — mismo patrón
SSoT-yaml/vista-md que el backlog.

**Deudas declaradas:**
- Research sin destilar del todo — mezcla narrativa de campaña con salidas de sistema (BL-07).
- `NODOS.md` sigue reflejando estados pre-Stage-4 en varias fichas de nodo (p.ej. contrato de
  datos "a diseñar" cuando CK-08 ya lo diseñó) — se corrige al terminar la arquitectura (BL-03).
- Prioridades del backlog = propuesta de la auditoría; faltan firmas del operador.

*Conecta:* CK-10 (deudas heredadas → BL-01/BL-08/BL-09) · CK-08 (contrato de datos → BL-18) ·
I-05 (límite de prep-auditoria) · I-39 (Prospera sigue fuera, sin cambio).

*Siguiente:* operador firma prioridades del backlog · arrancar BL-15 (definir App del Auditor) o
BL-01/BL-02 (modelo de datos persona/puesto + reconciliación de schemas) como primera campaña.

### CK-12 · Personas de primera clase — slice vertical persona/rol (cierra BL-01) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "Ok, vayamos con el BL-01" — primera firma de prioridad sobre el
System Backlog (CK-11); alcance firmado por AskUserQuestion: **slice vertical con UI**.

*Desarrollo:* la campaña modelo-objeto ya había clavado el diseño (D-09: cadena
persona→rol→proceso; D-11: objeto.schema aditivo; D-13: negocio.yaml = proyección, el pilar
Personas vive upstream, en las entidades; D-15: instancias en `<shell>/empresa/<tipo>/` layout
plano). Lo que faltaba era implementación: el cockpit solo leía negocio.yaml y `puesto` era texto
libre dentro de proceso. Ejecutado:

- **Reconciliación D-15**: `sistema/schema/objeto.schema.yaml` corrige `meta.aplica_a` de
  `data/<tipo>/` a `empresa/<tipo>/` (el desajuste interno que D-15 dejó anotado).
- **`go/personas.go` — GET /api/personas?empresa=**: lee persona + rol un-archivo-por-entidad del
  shell de la empresa, valida el subset que rompe silencioso (ids únicos, `persona.roles[].rol` y
  `reporta_a` resuelven, sin ciclos de `reporta_a`, enums conf/fuente) como warnings no-fatales —
  espejo del patrón `validateNegocio`. Carpetas ausentes → listas vacías = empty-state honesto;
  archivo YAML roto → warning con nombre de archivo, la respuesta no rompe.
- **Cuarta lente "Personas" en la Vista de Negocio** (`PersonasTab.tsx` + modelo puro
  `ui/lib/personas.ts`, 7 tests vitest): roles con quién los cumple (inverso por scan,
  un-hecho-un-lugar), vacantes delatadas ("sin persona asignada" — caso rol cumplido externamente
  por el holding), procesos que corre cada rol (match `puesto`↔`rol.nombre` — puente consciente
  hasta que negocio.yaml se genere del objeto, D-13). La lente es visible AUN SIN negocio.yaml,
  porque el pilar vive upstream (caso dogfood: prenter tiene personas/roles y no tiene diagnóstico).
- Componente `personas-api` registrado en `arquitectura.yaml`; capability **CAP-07** al increment.

**Forks firmados:**
- **Alcance = slice vertical con UI**, sabiendo que el design system (BL-04) no existe aún: la
  lente extiende NegocioView (no es vista nueva); se re-estiliza contra el design system cuando
  exista — deuda de estilo declarada, no silenciosa.
- **La convergencia BL-02 arranca por acá**: contrato vigente = objeto.schema; persona+rol son las
  primeras 2 de 9 entidades leídas del objeto normalizado. BL-02 sigue abierto para el resto.

**Verificación (2026-07-07):** go build/vet/test + tsc + vitest (32 tests) + export estático,
todos verdes; binario `directorio` contra el shell real de prenter — `/api/personas` sirve
1 persona + 7 roles con cero warnings, la lente renderiza con la data real, empty-states honestos
en empresas sin pilar poblado, 400 en empresa desconocida.

*Conecta:* CK-11 (backlog/increment as-code, promoción de objeto.schema) · D-09/D-11/D-13/D-15
(campaña modelo-objeto) · BL-01 (cierra) · BL-02 (avanza, no cierra) · BL-04 (deuda de estilo).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml` (BL-02 reconciliación
completa del objeto · BL-04 design system antes de la próxima vista nueva).

### CK-13 · El objeto completo — /api/objeto con las 9 entidades (cierra BL-02) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "Termina el resto de entidades."

*Desarrollo:* CK-12 dejó leídas 2 de 9 entidades (persona/rol en `/api/personas`). Las refs del
Hilo de Oro cruzan entidades (`brecha.against_ref` → capability|proceso|sistema|objetivo;
`kr.driver_refs` → proceso|capability; `actividad.carril_ref` → rol; `area.lider_ref` → rol…) →
la validación necesita el objeto ENTERO en un solo chokepoint. Ejecutado:

- **`go/objeto.go` — GET /api/objeto?empresa=**: las 9 entidades (`empresa.yaml` = raíz del
  tenant + 8 carpetas un-archivo-por-entidad, layout plano D-15), validadas JUNTAS al leer: ids
  únicos por tipo, toda ref FK y ref local (`#`) resuelve, enums (digital · conf · prio ·
  procedencia · fuente · sirve_a · tipo_actividad · gap_tipo), `key_results ≥ 1`, RACI A
  exactamente 1, ids locales únicos dentro del padre, sin ciclos (`reporta_a` ·
  `area.parent_ref`), `empresa.id == slug`. Warnings no-fatales (patrón `validateNegocio`).
- **`/api/personas` superseded** la misma sesión en que nació (cero consumidores externos): la
  lente Personas consume la rebanada personas/roles de `/api/objeto`; componente `personas-api` →
  `objeto-api` en arquitectura.yaml. Los warnings que ve la lente son ahora del objeto entero —
  un `carril_ref` colgante en un proceso también delata al pilar Personas.
- Increment reacomodado: **CAP-07 = la lente Personas** (UI) · **CAP-08 = el API del objeto**.

**Verificación (2026-07-07):** go build/vet/test + tsc + vitest (32 tests) + export estático,
todos verdes; binario contra el shell real de prenter — el objeto entero servido: empresa +
1 persona + 7 roles + 5 áreas + 12 procesos (con actividades/RACI) + 8 sistemas + 5 capabilities,
**cero warnings** (el objeto dogfood está íntegro: todas las refs del Hilo resuelven); la lente
Personas renderiza igual contra el endpoint nuevo.

**Deuda/siguiente declarado:** el último tramo de la convergencia D-13 — voltear `negocio.yaml` a
PROYECCIÓN generada del objeto (mecanismo D-04: archivo generado vs join-en-vivo) — nace como
**BL-19** (gatillo: objeto poblado con objetivos/brechas; hoy prenter tiene 0 y 0).

*Conecta:* CK-12 (primera rebanada) · D-04/D-13/D-15 (mecanismo, proyección, layout) · BL-02
(cierra) · BL-19 (nace).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-14 · Arquitectura terminada — N14 App del Auditor al mapa + estados post-Stage-4 (cierra BL-03) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "Quiero realizar el BL-03 del backlog."

*Desarrollo:* lo encontrado — `NODOS.md` con 13 nodos y fichas reflejando estados pre-Stage-4
(deuda declarada en CK-11: contrato de datos "a diseñar" cuando CK-08 ya lo diseñó; N13 "embebido
en N5" cuando Stage 4 ya desmontó el andamiaje; `/api/objeto` de CK-12/CK-13 ausente); la App del
Auditor declarada subsistema (CK-11) pero **fuera del mapa de despliegue**; y el link a
`despliegue.html` muerto — el diagrama quedó en el monorepo legacy, también desactualizado
(binario único pre-I-74, drawer dependiente de `nodos.data.js` generado, generador no portado).
Ejecutado:

- **N14 · App del Auditor** — ficha completa en `NODOS.md` (Edge/máquina del consultor · app
  instalable · no-construido · ★IP): método embebido viaja con nuestra persona, al repo del
  cliente solo cruza el resultado; **R16** (operar el método m1·m2·m3 con carriles/provenance) y
  **R17** ("deploy de procesos" → N6) en el responsibility-walk, con etapa nueva **E3 =
  Mantenimiento (M2)**. Cableada en N6 (escritor), N9 (su herramienta), N13 (consumidor), chequeo
  de consistencia IP (no lo rompe: edge nuestro, no infra del cliente). Los límites quedan fijados
  ANTES de definir el producto (BL-15) — la definición se hace contra estos límites.
- **Estados post-Stage-4 corregidos**: N5 (andamiaje desmontado, DevHub graduado, contrato
  diseñado CK-08 con endpoint/envelope/auth explícitos, BL-18), N13 (reescrito: binario
  `directorio` puerto 4100, madurez `existe`, expone `/api/objeto` con las 9 entidades, repo
  propio CK-09/CK-10), pendientes consolidados (#6 cerrado por CK-08; lista degradada a narrativa
  — el tracking vive en el backlog, regla CK-11 aplicada también aquí).
- **`despliegue.html` portado y actualizado**: dos binarios independientes en el data plane,
  contrato CK-08 como pieza diseñada-sin-código, N14 en el edge del consultor con su flujo de
  publicación, tabla de protocolos con columna de estado, decisiones al día (2026-06-20 → CK-14).
- **`ARCHITECTURE.md` al día** (14 nodos, R1–R17, diagrama ASCII con los dos binarios + N14,
  links del monorepo anotados como legacy, decisiones ampliadas) + `README.md` de arquitectura
  reescrito + refs `CK-14`/`N14` en `arquitectura.yaml` y `VISION.md`.

**Forks firmados (AskUserQuestion):**
- **Diagrama = portar estático actualizado, sin drawer.** El drawer del legacy lee
  `nodos.data.js`/`interfaces.data.js` GENERADOS desde NODOS.md; sin el generador,
  hand-escribirlos = segunda SSoT que driftea. Fichas → `NODOS.md` (SSoT); el HTML es la vista
  visual, curada a mano en el mismo evento que la decisión que la cambia.

**Deuda consolidada al backlog:** la deuda Go/Next del lado Cockpit (N13 → Vite SPA) vivía solo
como narrativa en NODOS; nace **BL-20** (disciplina CK-11: el pendiente se trackea en el backlog).

**Verificación (2026-07-07):** revisión cruzada de refs — índice/fichas/R-walk consistentes (14
nodos, R1–R17 resuelven), `despliegue.html` sin dependencias muertas, YAMLs parsean, links
relativos válidos.

*Conecta:* CK-11 (deuda declarada + App del Auditor declarada + disciplina backlog-SSoT) ·
CK-07/CK-08 (los estados que se corrigieron) · CK-12/CK-13 (`/api/objeto` a la ficha N13) ·
BL-03 (cierra) · BL-20 (nace) · BL-15..BL-17 (límites arquitectónicos listos para la definición).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-15 · Render de la arquitectura-as-code — gen_arquitectura.py (cierra BL-08) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "¿Hay forma de que el mockup lea de la arquitectura as-code para
visualizarla? … Sí, arranca — necesito ver todo de forma visual para poder confirmar o pedir
cambios sobre la arquitectura del sistema."

*Desarrollo:* el legacy ya resolvía esto (gen_nodos.py + gen_arquitectura_cockpit.py, no portados
en CK-10); el render de célula dependía del shell de harness-studio (P4, otro producto) —
copiarlo sería fork silencioso, así que el render aquí es propio y self-contained. Ejecutado:

- **`sistema/arquitectura/gen_arquitectura.py`** — un script, dos SSoT, dos salidas GENERADAS:
  `NODOS.md` → `nodos.data.js` (fichas para el drawer) y `arquitectura.yaml` →
  `arquitectura.html` (vista de la célula: planos como bandas, tarjetas coloreadas por estado
  activo/declarado/pendiente, fichas CK-NN como chips, tabla de relaciones, drawer por componente
  con propósito/fichas/relaciones entrantes y salientes). Modo `--check` = gate anti-drift
  (exit 1 sin escribir).
- **El diente del gate** (heredado de la doctrina del legacy): índice↔fichas de NODOS ambos
  sentidos · toda ref `[R#]` resuelve al responsibility-walk · relaciones joinean (from/to) ·
  `tipo ∈ {usa,compone,adapta,alimenta,gobierna}` · `estado ∈ {activo,declarado,pendiente}` ·
  rutas existen · fichas `CK-10+` resuelven en LEDGER.md. **CK-01..CK-09 = historia congelada**
  del monorepo (este ledger arranca en CK-10) — se aceptan sin verificar; el primer run del gate
  las delató, prueba de que muerde.
- **Drawer de `despliegue.html` restaurado**: clic en cualquier nodo (N1..N14, también las
  píldoras del flujo) → su ficha completa de NODOS.md. La razón del fork CK-14 (no hand-escribir
  el data.js) desaparece: ahora es generado.
- **Verificación en navegador real** (Chrome, `file://`): despliegue.html renderiza y el drawer
  abre N14 con sus 13 campos; arquitectura.html renderiza 4 planos · 17 componentes · 17
  relaciones y el drawer de componente funciona. `--check` en verde tras regenerar.

**Doctrina:** los `.data.js`/`.html` generados se commitean JUNTO con la edición de su SSoT
(mismo evento); jamás se editan a mano. Regla escrita en `README.md` de arquitectura y en los
headers de ambos artefactos.

*Conecta:* CK-10 (deuda del generador no portado) · CK-14 (fork "sin drawer" — superseded en la
parte del drawer: ya hay generador) · CK-11 (disciplina mismo-evento) · BL-08 (cierra) ·
I-73/I-60 (arquitectura-como-dato y DIP del legacy, espíritu heredado).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-16 · P2 = DevStudio — re-fichado N5 (server→app de escritorio) · contrato CK-08 derogado · N6 = GitHub — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "Hemos creado DevStudio, que reemplaza al devhub (antes cockpit)
— repo `~/Proyectos/dev-studio`. Los desarrolladores tendrán a la mano los repositorios que
manejan y las historias que tienen que desarrollar; estamos haciendo una versión para el Product
Manager con el refinamiento y priorización, para que los developers en sus propias aplicaciones
ya puedan revisar qué les tocó — todo a través de GitHub como canalizador. (Cómo conectamos
lo veremos cuando se implemente esa parte.) Si tienes dudas, grill me."

*Desarrollo:* recon del repo P2 — DevStudio continúa el ledger DH-NN (graduación DH-12; el repo
`~/Proyectos/devhub` ya no existe): **app de escritorio multiplataforma** (binario Go + UI
embebida, instalador = el binario) para CTO/developer/devops/PO trabajando orquestados, GitHub
como punto de encuentro, Claude Code vía **driver CLI-nativo BYO-licencia** (DH-10). El cambio
rompe dos supuestos del mapa: N5 era *server en el data plane del cliente* (ahora es app edge
por usuario) y el contrato CK-08 era *Pull API contra ese server en vivo* (ya no hay host).

**Forks firmados (grill vía AskUserQuestion):**
1. **N5 se re-ficha** (conserva número e historia) → "DevStudio — app de escritorio de
   desarrollo (P2)", plano Data→**Edge**; el rol de punto compartido pasa a GitHub/N6. Ficha
   deliberadamente magra: fija la frontera con Cockpit, el detalle lo gobierna P2 (DH-NN).
2. **Contrato CK-08 = DEROGADO.** BL-18 redefinido: "diseñar+implementar la conexión
   DevStudio/GitHub→Cockpit, mecanismo TBD con el primer consumidor real" — coherente con el
   "veremos cuando se implemente" del operador. Disciplina anti-código-especulativo intacta.
3. **N6 = repo GitHub del cliente** (org propia) + **matiz BYOC firmado**: la promesa pasa de
   "nunca sale de su red" a *"sus datos viven en SU GitHub y sus sistemas, no en infra
   nuestra"* — misma soberanía, residencia explícita; el crudo sensible (N12) nunca toca
   GitHub; git self-hosted = opción documentada para regulados (espejo del "LLM on-premise").
4. **Versión PM = nota en la ficha de N5**, sin nodo/actor propio — se modela cuando la
   conexión se implemente (anti-especulación).

Ejecutado: NODOS.md (N5 movido a EDGE y reescrito; N6 re-fichado; N13 "único binario del data
plane"; N3/N8/N10 ajustados; chequeo BYOC con el matiz; pendientes consolidados #3/#5/#6) ·
`despliegue.html` (data plane con un binario; DevStudio en la laptop del dev; flujo delivery
PM→dev→Claude Code; tabla de conexiones; decisiones) · ARCHITECTURE.md · README arquitectura ·
arquitectura.yaml (componente `devhub-delivery`→DevStudio, `contrato-datos`→conexión sin
mecanismo; regenerado `arquitectura.html`) · VISION §Ecosistema · CLAUDE.md · INCREMENT.md ·
backlog (BL-18 + columna renombrada) + BACKLOG.md.

*Addendum (misma sesión):* aclaración del operador sobre N8 — "es DevStudio el que lo gestiona;
DevStudio **se cuelga sobre N8 para programar**". Cableado en N8 (resumen + consumido_por: N5 es
su gestor — parametriza, dispara y supervisa las sesiones; el dev trabaja desde DevStudio, no el
CLI a pelo; N8 = el motor debajo), en N5 (responsabilidades) y en el diagrama.

*Addendum 2 (misma sesión):* "la App del Auditor (N14) también funcionará igual — se cuelga del
Claude Code instalado en la máquina, como DevStudio". Esto **cierra la decisión de runtime que
N14 tenía abierta** (¿suscripción interactiva o API key? — quedaba para BL-15): firmado = driver
CLI-nativo sobre el `claude` del consultor, BYO licencia, la app jamás toca credenciales de
Anthropic; lo desatendido/server-side, si existe algún día, va por N1 con API key. Emergió el
**patrón común del ecosistema**: app instalable = superficie · Claude Code local = motor ·
licencia = del humano firmado (N5/dev, N14/consultor) — registrado en el chequeo de consistencia
3 de NODOS.md. BL-15 queda con el resto (alcance/stack/UX).

*Addendum 3 (misma sesión):* el operador preguntó por la asimetría del diagrama — el Developer
mostraba DevStudio + Claude Code como dos cajas y el Consultor solo N14. Causa: N8 estaba fichado
como runtime *de Delivery* (específico del dev) y el claude del consultor era solo dependencia de
N14. Fork firmado = **B: generalizar N8 → "Runtime de agente local (Claude Code)"** — motor común
con una instancia por humano firmado: la del dev la gestiona N5, la del consultor N14; N8 presta
el motor, jamás es dueño del método (N14) ni del proceso (N5). Índice, fichas N8/N14/N9, chequeo
3 y diagrama (columna consultor ahora muestra N14 + su N8) actualizados.

*Conecta:* I-74/CK-07 (frontera P1/P2 — sigue; el runtime de P2 cambió de forma) · CK-08
(**deroga** su diseño; la ficha vive en la historia congelada del monorepo, la derogación se
registra aquí) · CK-14 (mapa que se re-ficha) · DH-10/DH-12 (decisiones de P2 citadas) ·
BL-18 (redefine) · BL-20 (sin cambio — la deuda Go/Next quedó solo del lado N13).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-17 · Gate anti-drift automático — pre-commit hook + validación de despliegue.html — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-07):* "¿arquitectura.html también se renderiza automático ante los
cambios como despliegue?" → aclarado el modelo (arquitectura.html = 100% generado; despliegue =
curado con drawer generado; nada corre solo sin invocar el script) → "Me parece bien, hagámoslo
[pre-commit hook], y que actualice despliegue también si fuera posible."

*Desarrollo:* dos piezas —

1. **Validación de `despliegue.html` en el generador.** El layout es curado a mano (generarlo
   destruiría la narrativa visual), así que "actualizarlo automático" se resuelve como **gate**:
   todo nodo del índice de NODOS.md aparece en el diagrama (`data-nodo`) y viceversa, y la
   **madurez** de cada art coincide con la del índice (incluye el caso `existe` vs `existe
   (parcial)`). Si divergen → exit 1 con mensaje puntual; el diagrama se corrige a mano en el
   mismo evento. Test negativo ejecutado: madurez adulterada de N13 → el gate la delató.
2. **Hook versionado `.githooks/pre-commit`** (+ `git config core.hooksPath .githooks`, config
   local documentada en el README para clones nuevos): en cada commit corre el generador —
   valida las tres fuentes, **regenera `nodos.data.js` + `arquitectura.html` y los agrega al
   commit** (mismo evento, sin paso manual); si algo no valida, **bloquea el commit**. Patrón
   heredado del `gen_all.py --check` del monorepo, en versión regenera-y-stagea.

*Conecta:* CK-15 (el generador que se extiende) · CK-14 (despliegue.html curado que ahora se
valida) · CK-11 (disciplina mismo-evento, ahora con diente automático).

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-18 · Rediseño de fondo — Fábrica + Organización instalada · el método se entrega en arneses · mueren N1/N4/N7 — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-08):* rediseño del ecosistema tras varias sesiones de revisión de
`despliegue.html`/`arquitectura.html`. "Voy a construir una aplicación para el consultor propia, que
se cuelgue sobre Claude Code, con arneses creados por Arnesia (`~/Proyectos/harness-studio`), desde
la cual el consultor podrá hacer todo el levantamiento y 'construir' todo el mapa completo, como un
desarrollador hace software … y lo colgaría en el Repositorio del cliente (que ya no sería GitHub,
sino un repositorio confidencial en un servidor/máquina del cliente). N7 lo eliminamos de momento,
todo será a través del consultor. Agregamos un 'Data Lakehouse' que nutra al Cockpit para mostrar no
solo la organización sino cómo vamos día a día. El Cockpit sería solo Cockpit, con niveles de acceso
por rol." + diagrama `mapaCockpitTotal`.

*Desarrollo:* el cambio deroga el eje BYOC-con-motor-server-side. Se lanzaron **7 investigaciones
SOTA** (2026-07-08, en [`docs/research/rediseno-total/`](docs/research/rediseno-total)):
repositorio oficial (git/Forgejo), data lakehouse (dlt+DuckLake), knowledge DB (files-first),
distribución/licencias/telemetría (go-tuf v2 + Tauri + Ed25519 + OTLP), auth/RBAC (embebida
policy-as-data), gestión de cambios ISO (git + UI que oculta git), proceso-como-arnés (skill=proc,
plugin=rol; hueco competitivo real). El mapa nuevo se propuso visualmente (artefacto) y el operador
firmó 5 decisiones.

**Decisiones firmadas (D1..D5, AskUserQuestion + confirmación directa):**
1. **D1 — Deroga el límite de IP "el método nunca al cliente".** El método SÍ cruza, empaquetado en
   arneses que corren en el edge del cliente (Consultio/N14, Colab Studio/N17), y **Arnesia se
   entrega** al cliente para que los mantenga. La protección pasa de **arquitectura** a **licencia +
   contrato** (canal N3 revocable). Riesgo residual documentado en las fichas (chequeo 1 de NODOS).
2. **D2 — N18 (Sistemas operacionales) y N19 (Analista de Calidad) = nodos propios** (RACI/fuentes
   distintos, merecen ficha).
3. **D3 — Data Lakehouse:** default en la infra del cliente; "hosteado por nosotros" = modalidad
   comercial documentada, no el default.
4. **D4 — App del Consultor = "Consultio"** (clon de DevStudio con adaptación propia; arranca cuando
   DevStudio esté terminado).
5. **D5 — Knowledge Database:** declarada `pendiente`, files-first en el repo cuando haya demanda;
   vector DB nunca antes (el operador: "intuyo que será importante pronto").

**El mapa nuevo (tres planos):**
- **Fabricante (nuestro):** N15 Arnesia (nace, fábrica de arneses), N2 Repositorio Maestro (re-ficha,
  era Playbook+Metodología — ahora guarda también arneses plantilla + código; el motor de discovery
  vive aquí como arneses), N3 Distribución+telemetría+**licencias** (re-ficha, crece).
- **Organización (cliente):** N6 Repositorio Oficial (re-ficha, ya no GitHub — git self-hosted
  confidencial), N13 Cockpit (re-ficha — Visualización + **Gestión de Cambios** + niveles de acceso),
  N16 Data Lakehouse (nace), N12 Depósito (sigue), N18 Sistemas operacionales (nace).
- **Edge:** N14 Consultio (re-ficha, era App del Auditor), N17 Colab Studio (nace), N5 DevStudio
  (amplía — también a devs del cliente), N8 Claude Code (sigue, motor común), N9 Consultor
  (transferible → N19), N19 Analista de Calidad (nace), N10 Developer (sigue), N11 Usuarios de la
  organización (re-ficha — 4 niveles).
- **Mueren:** N1 (Motor de Discovery server-side → arneses; deroga BL-13), N4 (voz, diferida), N7
  (agentes efímeros → todo el levantamiento es vía consultor).

*Ejecutado:* NODOS.md (reescrito: header, índice de 16 nodos, R-walk R1..R15 nuevo, fichas, chequeos
de consistencia — el chequeo 1 pasa de "IP por arquitectura" a "IP por licencia+contrato", el hallazgo
"transitan no persisten" reencuadrado a la inferencia local N8) · `despliegue.html` (curado a mano:
tres planos, edges por humano, flujo objetivos→operación, tabla de conexiones, decisiones D1..D5;
data-nodo de los 16 nodos, madurez sincronizada) · `arquitectura.yaml` v0.2.0 (célula: plano
`fuentes` nuevo, componentes Consultio/Arnesia/Distribución/Repositorio Oficial/Data Lakehouse/Gestión
de Cambios/niveles-acceso, `motor-discovery` y `app-auditor`/`contrato-datos` retirados) + regenerados
`nodos.data.js` + `arquitectura.html` (gate verde) · 7 informes SOTA en `docs/research/rediseno-total/`
· backlog (columnas + BLs redefinidos/nuevos) + BACKLOG.md · VISION.md · CLAUDE.md · ARCHITECTURE.md
· README de arquitectura.

*Conecta:* CK-14/15/16/17 (el mapa que se rediseña) · CK-11 (disciplina mismo-evento + backlog-SSoT) ·
CK-08 (ya derogado en CK-16; el contrato de datos se reemplaza por las conexiones N6/N16→Cockpit) ·
BL-13 (**derogado**: N1 no se construye como servicio) · BL-15/16/17 (redefinidos: Consultio) · BL-18
(redefinido: Lakehouse→Cockpit) · BL-12 (sube a alta: niveles de acceso). Nota disciplina: en fase de
construcción no se corta ficha por cada cambio (memoria `ledger-ligero`); esta es de fondo — cambio de
rumbo del ecosistema — por eso lleva ficha.

*Siguiente:* narrativa — el pendiente vive en `docs/product/_archive/backlog.yaml`.

### CK-19 · Adopción del arnés prenter — migración total al proceso as-code + amplían las dos extensiones (arquitectura/metodología) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-09):* "necesitamos una metodología de desarrollo de software madura, que
podamos utilizar. Para ello instala el plugin del marketplace de prenter … lleva toda la información que
hemos creado como capabilities, etc. y todo lo que vamos a construir como historias de usuario … sin haber
perdido nada de información, [para] seguir programando bajo la doctrina del plugin de prenter. Lo único que
no tiene prenter que nosotros tenemos que ampliar es la metodología as code, y la arquitectura as code —
extender y cablear apropiadamente."

*Desarrollo:* censo profundo de ambos lados (subagentes). El arnés `harness@prenter-marketplace` (KIT 0.5.3)
= kit de **proceso** agnóstico que lee `project.config.yaml` (el seam); adopción = llenar el seam →
`/harness:bootstrap` (re-exponer reglas always-on + hooks) → correr el ciclo idea→done. Hallazgo clave: el
manifest always-on del plugin está **vacío** (scaffold) → `.claude/rules/` es el único canal always-on, así
que el bootstrap es obligatorio. Cockpit ya tenía un sistema **maduro y paralelo** (VISION/LEDGER/backlog/
increment + `sistema/` as-code con drift-gate) — la migración es mapear ese sistema al vocabulario del arnés.

**Forks firmados (AskUserQuestion, 2026-07-09):**
1. **Q1 — Migración total.** `docs/product/` pasa a ser el SSoT (historias + capabilities + releases);
   `docs/product/_archive/backlog.yaml` + `docs/increment.yaml` se **archivan** (congelados, no borrados). `sistema/` queda
   como las dos extensiones.
2. **Q2 — Fundación + esqueleto completo** en esta sesión (bootstrap + seam + cablear extensiones + espejar
   8 CAP + 23+ historias + reglas project-layer + MAPEO + esta ficha).
3. **Q3 — Reconstruir gen+gate de la metodología ahora** (el schema/generador gemelo quedó en el monorepo de
   origen): `methodology.schema.yaml` + `gen_metodo.py` + gate en pre-commit, a paridad con arquitectura-as-code.

*Ejecutado:* **bootstrap** — 21 reglas CORE copiadas byte-idénticas a `.claude/rules/` (+ `_HARNESS-CORE.md`),
`grep-bot` a `.claude/agents/`, doctrina a `docs/process/harness/`, templates a `docs/product/templates/`,
seam `project.config.yaml` (doctor exit 0), loader `scripts/harness_config.py`; hooks de telemetría vía el
plugin (Stop/SubagentStop/SessionEnd → emit.py, sink local). **Migración total (lossless)** — 29 historias
(`docs/product/stories/<module>/<story-id>/` = story.yaml + 00-story.md; 23 idea · 5 done · 1 dropped) con
`provenance{}` verbatim de cada BL, 8 capabilities (CAP-01..08 → `capabilities/cockpit/`), 2 releases (F0/F1),
7 module docs, `README.md` + `MAPEO.md` (prueba nada-perdido). **Extensión #1 arquitectura** — regla
`arquitectura-as-code.md` que **supersede** `paradigm-arquitectura.md` del CORE (planos Fabricante/Organización/
Edge; §Dónde-vive ancla a `node: N-NN`). **Extensión #2 metodología** — `methodology.schema.yaml` +
`gen_metodo.py` (valida 31 M-cards + árbol `proceso/` + regenera METODOLOGIA.md §4) + segundo gate en
`.githooks/pre-commit`; regla `metodologia-as-code.md`. Regla `cockpit-stack.md` (adapta los supuestos SaaS del
CORE). `CLAUDE.md` reescrito a la doctrina del arnés; banners de archivado en backlog/increment + sus vistas.

**Deudas declaradas:**
1. **Bug del KIT 0.5.3 (backflow pendiente):** `find_unfilled` en `harness_config.py` recursa infinito ante
   cualquier leaf `null` del seam. Workaround in-contract (sin editar el CORE): sin `null` en el seam. Debe
   upstreamearse al kit (no fork silencioso).
2. Historias en `idea` **sin refinar** — `01-spec.md`/`checkpoint.md`/`06-tickets.yaml` se crean al promover
   a refining/developing (no se inventaron scenarios a nivel idea).
3. Árbol `proceso/` **parcial** (m1/b1 + m3/e0; resto skeleton) — completarlo = historia `poblar-metodo-m1-m3`.
4. Reglas CORE traen supuestos SaaS/multitenant/agentes que Cockpit no cumple — documentado y neutralizado en
   `cockpit-stack.md` (escenarios tenant-isolation = N/A hasta que exista auth).

**Verificación (2026-07-09):** doctor `exit 0` · gate arquitectura `--check` verde · gate metodología `--check`
verde (31 M-cards + proceso/ válido + §4 en sync) · `go build/vet/test` verde · UI `tsc` + `vitest` 32/32
verdes · 29/29 BL y 8/8 CAP con round-trip parse == fuente (subagentes de migración). Telemetría: emite en el
primer Stop de sesión (sink local `~/.prenter/telemetry/cockpit/`, sin egress = default).

*Conecta:* CK-11 (tríada + disciplina backlog-SSoT, ahora evolucionada a `docs/product/`) · CK-17 (gate
arquitectura, gemelo del nuevo gate de metodología) · CK-18 (los 16 nodos que las historias ancoran) · toda la
numeración BL-01..29 y CAP-01..08 (preservada en `provenance`). El arnés = el "kit dev" que CLAUDE.md ya
nombraba, ahora **instalado y cableado**.

*Siguiente:* narrativa — el pendiente vive en `docs/product/` (historias `idea/refined/ready`); ver `MAPEO.md`.

### CK-20 · Cableado del arnés — corpus del KIT materializado + hueco 0.5.3 documentado (roles a mano) — `decidida` · `vig:vigente`

CK-19 adoptó el arnés; **CK-20 lo termina de cablear**. Se materializó, a los paths convencionales que las
reglas referencian, el corpus que el KIT 0.5.3 **sí** publica pero que la adopción no había copiado:
- `docs/process/` ← los 6 process-docs del KIT verbatim (tier:core, no editar): `harness-lifecycle`,
  `ticket-states`, `continuous-improvement` (CIL), `spec-mapa-funcional`, `tech-debt`, `cockpit-permissions`.
- `scripts/git/` ← los 6 scripts de coordinación (`session-lock`, `commit-paths`, `dod-evidence-gate`,
  `multi-session-scope-guard`, `cleanup-wip-branches`, `ps1-harness`) que `parallel-safety`/`git-safety` citan.
- `docs/process/harness-backlog.md` + `learnings.md` — los archivos de captura del HLP (carriles L1/L2 del CIL).

**Decisión (3 forks ratificados):** (Q1) copiar a paths convencionales — **extiende la razón CK-19** (copiar,
no symlink a la cache versionada/volátil del plugin → repo portable). (Q2) el KIT 0.5.3 **no publica** el
pipeline ejecutable → **documentar el hueco + operar los roles a mano**, sin autoría propia (fork silencioso
prohibido; se upstrea el "W8 lift-kit"). (Q3) commit de la base CK-19/20 primero, luego la reorg; sin push.

**Revisión de colocación (lo pedido — "dónde va cada archivo"):** ya correcto y sin mover — `CLAUDE.md`,
`VISION.md`, `README.md`, `LEDGER.md`, `project.config.yaml` viven en root (seam + norte + project-layer);
`docs/product/**` es el SSoT del qué-construir; `.claude/rules|agents|settings.json` re-expuestos;
`sistema/**` = los dos ejes as-code. Lo único que faltaba poblar era `docs/process/` y `scripts/git/`.

**Hueco del KIT 0.5.3 (registrado en `harness-backlog.md` HB-C1..C5 — no es cableable, es subset extractable):**
role-skills (`/pm · /dev-team · /auditor · /architect · /po · /harness-issue`) + sub-agents (`auditor-*`,
`builder-*`) no publicados (W8 lift-kit) · **13 reglas** citan `docs/rules-detail/*` ausente · **3 reglas**
citan templates `03-arch/04-validators/06-tickets` ausentes · varios `docs/process/*` (capability-protocol,
lifecycle, parallel-sessions-protocol, promotion-protocol, audits, ADRs) no extraídos · registry con
duplicados 0.5.2. Materializar/escribir project-layer **solo cuando el ciclo lo ejerza**, no masivo.

**Verificación (2026-07-09):** gate arquitectura `--check` verde · gate metodología `--check` verde · doctor
`exit 0` · base CK-19/20 commiteada (`00994ea`) con los dos gates as-code corriendo en el pre-commit.

*Conecta:* CK-19 (adopción — CK-20 la cablea) · `harness-lifecycle.md` (HLP, ahora en repo) · `cockpit-stack.md`
(supuestos SaaS neutralizados). *Siguiente:* al llegar la 1ª historia a refining/ready se materializan los
templates `03-arch/04-validators/06-tickets` (HB-C3); el pipeline de roles espera el upstream del KIT (HB-C1).

### CK-21 · Organization as Code → Organization Twin — visión con nombre + pivote comercial hosteado + TO-BE de 37 capacidades — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-15/16, 3 rondas):* (R1) "Se me está haciendo difícil que los clientes me
paguen toda la consultoría de construcción de infraestructura… se me ocurrió una solución en la nube
multitenant… que cualquier persona que pague pueda loguearse, descargar dev-studio, colab-studio,
arnesia y consultio… gestionar usuarios y contraseñas… restringido por MAC… consultio sería como un
IDE que va commiteando… 3 repositorios: development, UAT y producción… ponte el sombrero de CEO y
conversa con tu CTO… dime sinceramente dónde ves todas las posibles fallas." (R2) "Me gusta cómo
Catio propone deconstruir la arquitectura… quisiera algo similar a nivel organizacional: puestos,
roles, procesos, funciones, todo… la idea es tener una 'organization twin' que permita obtener el
estado real de todo, y que podamos articular incluso." (R3) "Mapear, visualizar y monitorear desde
los objetivos de directorio hasta el último nivel (bajados con OKRs) y cruzados con KPIs… que sea
tan obvio detectar dónde mejorar que de allí nazcan los proyectos de mejora y que todo ese ciclo de
vida lo tengamos en nuestra solución… que seamos la solución definitiva que se conecte a todo
sistema… además de los arneses para cada puesto con el Colab Studio… que el trabajo diario de todos
apunte a mejorar la organización." + "Todo ahora para no perder nada… actualiza visión, todo… no
quiero sesgos por contradicción, no me sirve el histórico, solo a donde apuntamos."

*Desarrollo:* conversación estratégica CEO/CTO en 3 rondas con investigación creciente: (1) análisis
de la propuesta multitenant contra la arquitectura CK-18 + fallas; (2) SOTA organization-as-code
(Catio, Backstage, Palantir, categoría DTO de Gartner, GitLab handbook-first, Orgvue, DEMO/BPSim,
simulación organizacional con agentes LLM); (3) deep-dive de **11 vendors** vía 3 subagentes de
investigación (iGrafx · Celonis · BusinessOptix · ARIS · Bizzdesign · Ardoq · edgeTI · Bee360 ·
KYP.ai · Mavim · doctrina de ontología de Palantir Foundry) + la lista de features DTO de Gartner
(ago 2025) → lista maestra TO-BE de **37 capacidades** etiquetadas [MVP]/[V2]/[H] + secuencia MVP.
Corpus completo persistido en **`docs/research/organization-as-code/`** (9 docs, hermano de
`rediseno-total/`). Hallazgos clave: la categoría "organization as code" está libre (anclar a DTO
para analistas); los 11 vendors convergieron 2024-26 en "repositorio como capa de contexto para AI
agents" (nuestra tesis de arneses = la versión más radical); nadie opera una cascada OKR viva ni
cierra el loop brecha→proyecto→KPI en la misma herramienta; el patrón dual-repo/release-cycle de
ARIS valida dev→UAT→prod sobre git; Mavim = la referencia a batir; la doctrina Palantir
(semántica+kinética, actions como superficie de operación, provenance structs) mapea 1:1 al objeto
normalizado.

**Decisiones firmadas (D1..D9):**
1. **D1 — La visión se llama Organization as Code → Organization Twin.** Twin = estado deseado (N6)
   × estado real (N16) × brecha continua (N13). GitOps organizacional: el repo declara el deber-ser,
   el lakehouse observa el ser, Cockpit muestra el drift, los proyectos son los controladores. La
   brecha deja de ser entregable puntual → loop permanente.
2. **D2 — El diferenciador es el hilo de oro medido:** objetivos directorio → OKRs por nivel → KPIs
   por proceso/rol/persona; brechas con costo + ranking ROI ("los proyectos nacen solos"); ciclo de
   vida del proyecto de mejora DENTRO de la solución; arneses por puesto = trabajo diario apuntando
   al hilo. Posicionamiento: "twin de ejecución estratégica".
3. **D3 — Pivote comercial: default = hosteado por nosotros, single-tenant por cliente** (instancia
   aislada Forgejo+Cockpit+lake, suscripción; mismo código, cero reescritura). Invierte el default
   D3 de CK-18 (reversión parcial del chequeo 2 asumida: en el default hosteado el dato reside en
   nuestra nube bajo DPA; "transitan, no persisten" pertenece al tier self-hosted, que NO muere =
   tier enterprise/regulados). Multitenant real = fase 2 (>10-20 clientes). La propuesta multitenant
   inicial se descartó como primer paso: Cockpit hoy no tiene auth ni DB; multitenancy antes de
   vender = meses sin ingreso.
4. **D4 — N3 asciende a Portal:** login, cobro, gestión de usuarios/asientos, descargas, licencias
   por asiento con **fingerprint compuesto — NO MAC** (spoofeable/inestable; SOTA = CPU+disco+placa
   SHA-256, node-locked, activación/heartbeat — keygen-go ya fichado).
5. **D5 — Un repo por organización, 3 entornos** (dev/UAT + main vigente + tags), no 3 repos. El
   pipeline dev→UAT→prod ES la Gestión de Cambios ISO — y el gate que hace viable el "a prueba de
   tontos" sin mapas basura (provenance M23 obligatorio).
6. **D6 — Capa kinética en `objeto.schema.yaml`** (acciones por entidad: quién modifica qué, con qué
   aprobación; Gestión de Cambios = motor) + **doctrina Palantir adoptada** como gramática del
   schema + entidades **OKR/KPI/Proyecto de primera clase** ancladas al hilo.
7. **D7 — Consultio = apuesta principal, desbloqueado:** primer entregable = **los arneses del
   método M1-M3 sobre Claude Code pelado, sin app shell** (ya no espera a que DevStudio termine; el
   clon llega después). Patrón validado por BusinessOptix Discovery Agent/iGrafx Pia/ARIS Companion.
8. **D8 — Gestión de Cambios sube al MVP** (es el gate UAT→prod). Accesos derivados de la estructura
   (idea RRHH del operador): la estructura PROPONE, un humano APRUEBA — human-in-the-loop siempre.
9. **D9 — Horizontes gateados** (precedente CK-10): what-if (branch=escenario) → simulación
   (BPSim/DEMO) → ensayo del TO-BE con agentes LLM corriendo los arneses (jugada única: los arneses
   son tooling de producción Y actores de simulación). MCP server del twin = V2 (table stakes
   agéntico 2025-26). Nada antes del twin base + demanda.

*Ejecutado:* corpus `docs/research/organization-as-code/` (README + 8 docs: SOTA process
intelligence, SOTA EA, KYP/Mavim, doctrina Palantir, SOTA organization-as-code, features Gartner
DTO + mapeo, TO-BE 37 capacidades + MVP + derivación de arquitectura, pivote comercial) · VISION.md
reescrita al norte nuevo (identidad + sección "Organization as Code → Organization Twin" + flujo
como loop + arquitectura con default hosteado + TBD sin drift post-CK-19) · CLAUDE.md y fichas
NODOS ajustadas al mismo evento · historias nuevas `state: idea` en `docs/product/` (subagente, con
prior-art scan contra las existentes).

**Deudas declaradas:**
- Re-fichado FINO de NODOS.md (chequeo 2 reescrito en profundidad, R-walk si el portal agrega
  responsabilidad, arquitectura.yaml con componentes nuevos cuando tengan `ruta:` real) — las fichas
  se ajustaron en lo esencial; el pase completo con gate = próxima sesión de arquitectura.
- Compliance del default hosteado (DPA como procesador, aislamiento por instancia, BYOK tier alto)
  — presupuestar antes del primer cliente hosteado.
- La fricción BYO-licencia Claude persiste en el edge (ToS N8, cambió 3× en H1-2026) — al modelo de
  costo por asiento.

*Conecta:* CK-18 (el modelo físico que se conserva; su D3 se invierte; chequeo 1 licencia+contrato
ahora carga también el portal N3) · CK-19/CK-20 (las historias nuevas entran por `docs/product/`) ·
CK-10 (precedente de capability declarada-no-construida, aplicado a simulación/MCP) · I-05 (ISO como
ontología — ahora con OKR/KPI como dato de primera clase) · BL-10 heredado (pricing ahora =
suscripción + asientos).

*Siguiente:* narrativa — el pendiente vive en `docs/product/` (historias CK-21 en `state: idea`;
prioridades las firma el operador).

### CK-22 · Roadmap MVP — F1 re-alcance (Terreno + MVP Twin) · nacen F2/F3 · la arquitectura primero — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-16):* "Revisa mi backlog, las historias que están por venir, revisa cada
una y ayúdame a reorganizar todo mi trabajo pendiente, estructurarlo de forma adecuada y crear un
roadmap para mi MVP, siendo la primera la revisión y actualización de la arquitectura para preparar
el terreno de todo lo funcional."

*Desarrollo:* censo de las 36 historias (5 done/F0 · 1 dropped · 30 idea) — F1 era una bolsa de 23+
historias sin secuencia (el rediseño CK-18 entero). Reorganizado contra el norte CK-21:

- **F1 re-alcanzada = "Terreno + MVP Twin vendible"** (16 historias, 4 fases + carril paralelo):
  F1.0 Terreno (**`arquitectura-refichado-ck21` — historia NUEVA, LA PRIMERA** por pedido del
  operador; schema-v2; negocio-schema-ssot) → F1.1 Método operable (poblar-metodo ↑alta;
  metodo-como-arnes-v0; operar-metodo con dep re-apuntada al v0 — ya NO espera al clon DevStudio;
  deposito v0 liviano) → F1.2 Organización viva (forgejo ↑alta; hosteado-single-tenant ↑alta;
  gestión-cambios ↑alta CK-21/D8; publicación deploy-procesos; auth-niveles) → F1.3 El twin mide
  (lakehouse ↑alta; cruce-indicadores ↑alta, absorbe el motor de indicadores; brecha-proyecto
  ↑alta — el diferenciador) + F1.x negocio (comprador-pricing baja→alta: sin pricing no hay venta).
  Exit: demo del loop completo contra organización real. Archivo renombrado
  `F1-terreno-mvp-twin.yaml` (era "organización instalada", framing CK-18).
- **F2 nueva = "Comercial"** (7): canal N3 + portal (NO fusionadas: producto vs canal técnico, el
  portal depende del canal) · deuda Go/Next→Vite + design system (**deuda aceptada en F1, se paga
  arrancando F2 antes de crecer más UI** — precedente CK-12) · rol-area · negocio.yaml generado
  (gatillo BL-19 ocurre en F1) · catálogo de conectores.
- **F3 nueva = "Edge completo + escala"** (8): clon DevStudio (alta→media — el shell es
  experiencia, no capacidad), Colab Studio, pipeline Arnesia, MCP server, crowdsourcing,
  knowledge-DB (D5), prep-auditoría (CK-10), housekeeping.
- **Deps re-cableadas** (28 story.yaml editados, verificación yaml 37/37 + estados intactos):
  schema-v2←refichado · metodo-v0←{poblar,schema-v2} · operar/publicación←metodo-v0 ·
  {hosteado,gestión-cambios,auth}←forgejo · cruce←{schema-v2,lakehouse} · brecha←{schema-v2,cruce}.
- **`docs/product/ROADMAP.md`** nace como vista humana curada (SSoT = releases/*.yaml +
  story.yaml, mismo evento) con el grafo del camino crítico + 5 decisiones de secuencia revisables.

*Conecta:* CK-21 (el norte que ordena; la deuda "re-fichado fino" se vuelve la historia primera) ·
CK-19 (modelo de releases del arnés) · CK-11 (disciplina SSoT + vista curada mismo evento).

*Siguiente:* arrancar `sistema/arquitectura-refichado-ck21` (F1.0) — promover a `refining`.

### CK-23 · Twin-first — el twin lleno antes que el proceso de llenado (re-secuencia F1) — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-17):* "Quiero consolidar cuáles son las dimensiones de mi organization
as code, tener todas las plantillas — el to-be una vez tenga todo llenado, con todos los niveles
bien organizados — para tener mi Organization Twin pintado en el cockpit. Hardcodeado inicialmente
con una organización ficticia para ir probando el desarrollo. […] Vamos a partir de atrás hacia
adelante: quiero tener un organization twin con todo lleno para luego ahondar en el proceso de
llenado. […] Firmo la secuencia, ejecuta todo con ficha CK-23."

*Desarrollo:* estrategia **twin-first**: construir primero el artefacto final (twin 100% lleno,
pintado en Cockpit, organización ficticia) y después el proceso que lo llena (Consultio) y la
infraestructura viva. Contra el estado real: las dimensiones ya estaban 80% consolidadas
(`objeto.schema.yaml` v1, 9 entidades + hilo de oro; el delta OKR/KPI/Proyecto + capa kinética ya
era la historia `schema-v2-hilo-de-oro-kinetica`); el hueco real era la instancia completa —
ninguna ejerce el schema al 100% (prenter dogfood: 42 yamls, parcial). Decisiones:

- **Historia NUEVA `sistema/organizacion-ficticia-golden-fixture`** (F1.1, alta, dep schema-v2):
  shell hermano lleno al 100% contra el v2 — todas las entidades/campos/aristas del hilo de oro,
  brechas con costo/ROI, proyectos con ciclo de vida, KPIs con valores hardcodeados, provenance
  realista (`fuente`+`conf`) simulando la salida de M1. Triple uso: fixture de desarrollo ·
  plantillas-por-ejemplo · demo comercial. Además = **contrato de salida de Consultio**
  (`operar-metodo` gana la dep: la corrida del método debe producir un objeto de esa completitud).
- **F1 re-secuenciada (5 fases):** F1.0 Terreno (igual) → **F1.1 Twin pintado** (fixture →
  cruce-indicadores → brecha-proyecto; la ex F1.3 adelanta) → F1.2 Método operable (ex F1.1) →
  F1.3 Organización viva (ex F1.2) → **F1.4 Twin mide real** (lakehouse). Hito intermedio nuevo:
  **twin completo demo-able con organización ficticia** al cierre de F1.1.
- **Lakehouse sale del camino crítico** (alta→media, fase propia): `cruce-indicadores` cambia su
  dep lakehouse→fixture; los KPIs del fixture mockean el estado real; el lakehouse los reemplaza
  al final sin cambiar la vista. Exit criteria de F1 intactos (demo contra organización real).
- **Riesgo aceptado consciente:** schema v2 + fixture diseñados sin feedback del proceso de
  captura pueden requerir ajuste cuando Consultio llene datos reales; mitigación: el fixture
  simula la salida del método (provenance incluida), no un dump sintético.

*Conecta:* CK-22 (la secuencia que se re-ordena; sus decisiones 1-5 siguen vigentes) · CK-21 (el
norte twin; #10-13 del TO-BE = la fase F1.1) · CK-13/CAP-08 (`/api/objeto` ya sirve las 9
entidades — el fixture lo ejerce entero) · I-39/D-15 (instancias en shells hermanos).

*Siguiente:* sin cambio — `sistema/arquitectura-refichado-ck21` sigue primera; el fixture entra
tras `schema-v2`.

### CK-24 · Frontera twin ↔ evaluación individual — el twin mide roles/procesos/áreas, no personas — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-17):* "Firma" — respuesta al hallazgo #2 de la auditoría adversarial del
refinamiento de `arquitectura-refichado-ck21` (5 auditores paralelos, pedido del operador: "genera
subagentes que se pongan en todos los peores escenarios posibles").

*Desarrollo:* la auditoría detectó contradicción frontal: la doctrina propia
(`sistema/schema/metodologia/objetivos.md §8`: "Rol = KR ownership, NO OKR individual") prohibía lo
que el producto vendía ("KPIs por persona", drill-down directorio→analista, NASA-TLX midiendo
desgaste versionado en git = registro de salud ocupacional de facto). Exposición real: AI Act
Anexo III (empleo), GDPR art. 22, comités/sindicatos — la objeción #1 que un DPO le hará al
producto.

**Decisión firmada:** el twin mide **roles, procesos y áreas** por defecto. (a) KPI ancla a
rol/proceso/área — la persona entra como *ocupante del rol*, jamás como eslabón de medición; (b) la
vista por persona-nombrada existe SOLO con opt-in de nivel Gobernanza + consentimiento declarado;
(c) desgaste/carga cognitiva (NASA-TLX) se agrega por rol/proceso — nunca se versiona como registro
individual; (d) nace M-card transversal "métricas de persona" (agregación mínima · acceso por nivel
· consentimiento · retención), gemela de M23-provenance, obligatoria como ancla del triage de
automatización (el score puntúa ACTIVIDADES de un rol, no personas).

*Conecta:* CK-21 (acota el diferenciador "hilo de oro medido" sin matarlo) · historia
`arquitectura-refichado-ck21` (spec v3 la cementa en la matriz WS5) ·
`schema-v2-hilo-de-oro-kinetica` (la hereda como invariante de diseño) ·
`auth-niveles-acceso-policy-as-data` (el opt-in Gobernanza aterriza ahí).

### CK-25 · Consultio no se clona: se extrae `studio-core`, ambas apps lo consumen — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-17):* "revisá el plan, forzá fallos, arquitectura hexagonal, ejecutá vos
mismo, avisame con consultio corriendo primitivo."

*Desarrollo:* scout de `~/Proyectos/dev-studio` (célula N5): 60-70% del código ya es núcleo
genérico aislado tras puertos DIP (motor arneses, driver Claude Code, sesión, store, transporte,
updater, design system). N14 estaba fichado "clon de DevStudio" (CK-18) — clonar es fork = doble
mantenimiento sin backflow; CK-21/D7 ya había desacoplado el MVP (Consultio v0 = arneses sin
shell). Regla de tres (AHA): Consultio ES el 2º consumidor real → momento correcto de extraer.

**Decisión:** topología de **tres piezas** — `studio-core` (kernel Go compartido, módulo propio,
ledger SC-NN, puertos DIP estables) + `dev-studio` (N5, app fina, taxonomía dev) + `consultio`
(N14, app fina, taxonomía engagement/método M1-M3). Repos separados por producto (doctrina de
células, NO monorepo). Disciplina **upstream-first**: todo cambio genérico aterriza en el core
primero, los productos consumen por import semver; **ban de mirror producto→producto** (mismo
patrón que backflow del arnés) — lo específico de un producto (taxonomía, value-stream, branding)
nunca se copia al otro, se implementa fino y propio en su seam. Gate de promoción = 2º consumidor
necesita el patrón → lift al core en ese momento, ni antes (adivinar API) ni después (fork
silencioso). Secuencia F0 (arneses v0, ya corriendo) → F1 (frontera fitness en dev-studio) → F2
(extracción) → F3 (Consultio app fina) — la extracción no bloquea la entrega del método.

Stress-test forzado contra el código real de dev-studio (11 escenarios de fallo, `05-arquitectura-
hexagonal.md`) fijó 10 decisiones de arquitectura: paquetes del core públicos, no `internal/` (A1)
· `replace` local comiteado como transición sin remote, deuda registrada (A2) · sesión genérica del
core con `Contexto map[string]string` opaco a la taxonomía del producto (A3) · identidad de app
(`app.Info{Name, LockDirName, DataDir,...}`) siempre inyectada, cero literal de producto en el
kernel (A4) · router composicional, el core arma rutas genéricas y la app monta las suyas (A5) ·
driver fake para tests/CI sin licencia (A6) · UI mínima propia descartable, design system npm
diferido a F2.5 — prohibido copiar componentes de dev-studio (A7) · fitness gate EN el core desde
el commit 1 (A8) · extracción por COPIA no move, dev-studio migra en su propia sesión/ledger DH-NN,
duplicación transitoria core↔dev-studio fichada como deuda de esa célula (A9) · marketplace del
método como seam de datos (A10).

**Ejecutado y verificado en vivo (mismo día, autónomo):** `studio-core` nace (commit `5dc94c1`,
SC-01, v0.1.0 tageado) con fitness gate propio (`TestCoreSinIdentidadDeProducto` + 4 tests más,
verdes) · `consultio` nace (commit `742bc51`, CN-01) consumiéndolo vía `replace => ../studio-core`
· suite completa contra adaptadores reales (HB-94, cero mocks) · live-verify del binario corriendo:
registry método → `POST /api/engagements` (el dir ES repo git, valida hipótesis F0 CK-21 "engagement
≈ repo git") → instalar arnés (lock `.consultio/arneses.yaml` + commit pathspec real) → sesión
ligada al engagement → turno con driver fake → frames SSE + `state.json` con efecto observado ·
`dev-studio` INTACTO (V6, tree limpio, HEAD sin tocar). F3 se adelantó respecto del trigger de F2
("necesidad real de shell") por directiva del operador del mismo goal.

**Consecuencias.** NODOS.md: N14 re-fichado "clon de DevStudio" → "app fina sobre `studio-core`
(extraída de N5)", madurez no-construido → existe (parcial); riesgo abierto (2) de N5 ("cómo se
clona Consultio") cerrado por esta ficha. `dev-studio`/DH-NN registra su F1 (frontera fitness) y F2
(migración) en su propio ledger cuando corresponda — no bloquean esta ficha.

**Alternativas descartadas:** fork/clon (doble mantenimiento, divergencia silenciosa, descartada) ·
monorepo único edge (contradice doctrina de células/graduación; `go.work` local da la misma
velocidad sin fusionar repos, descartada) · un solo binario con "ediciones" (mete `if producto` al
core, acopla releases de compradores distintos — descartada, revisable si F0-F3 muestran variación
menor a la prevista).

*Conecta:* CK-21/D7 (Consultio v0 = arneses sin shell, el MVP que este plan no bloquea) · CK-18
(origen del ficha "clon de DevStudio", corregido acá) · CK-22 (F3 "Edge completo + escala" donde
vivía el clon DevStudio, ahora reemplazado por esta topología) · CK-19 (backflow/upstream-first del
arnés prenter, misma doctrina trasladada a código Go/TS).

*Siguiente:* dev-studio migra a `studio-core` en su propia sesión (F2.3, ledger DH-NN) · borrar
`replace => ../studio-core` cuando exista remote publicado (R5 puro) · extraer design system React
a paquete npm cuando haya registry (F2.5). Plan detallado:
`docs/product/plans/consultio-studio-core/`.

### CK-26 · Schema v2 — hilo de oro medible (modo regional OKR/GPD/BSC) + capa kinética + mejora como entidad — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-17):* refinamiento de `schema-v2-hilo-de-oro-kinetica`: "los OKRs y los
kpis no compiten… revisa apegándote a lo que dicen realmente las metodologías… cuál es el estándar
actual en LATAM y Brasil (investiga), y con eso definimos" + aclaración de `proyecto` = "aquellas
cosas que propone el personal… para lograr un avance o mejora… considera six sigma como base pero
ve cuál es la que más se utiliza" + "todo lo que no usamos elimínalo… no quiero contaminar con
deprecados cuando aún ni nacemos". FIRMA 1 sobre spec v2 · G SATISFIED ("hemos hecho solo el
backend" — correcto: el pintado es F1.1).

*Desarrollo:* dos investigaciones web (fuentes primarias — 00-research-latam-br.md de la historia).
Verificado: OKR↔KPI se complementan con frontera PERMEABLE bidireccional (Doerr/Castro/Wodtke/
Perdoo); "no OKR individual" confirmado (Spotify 2016 primario, Klau 2017, HBR 2020, Bock:
divorcio total OKR↔compensación — sandbagging); Brasil = GPD/Falconi como estándar corporativo
(desdobramento anual + PDCA + PLR; 3 de 4 "Melhores e Maiores"), LATAM hispano = BSC como mapa;
proyectos de mejora = PDCA paraguas con dialectos DMAIC (vigente) / MASP (estándar BR) / kaizen,
con charter + doble firma sponsor-finanzas + auditoría de beneficios ~12 meses; ideas del personal
= funil separado (kaizen teian → plataformas tipo AEVO).

**Decisiones firmadas:** (1) **GPD y OKR = el mismo grafo** — el modo es configuración de empresa
(`config_estrategia.modo: okr-trimestral|gpd-anual|mixto`), no entidades distintas; **RN-14**:
acople KR↔compensación SOLO en modo GPD (PLR). (2) KPI = entidad (salud con banda) y KR = contrato
de cambio; frontera permeable como acciones kinéticas (`promover-kpi-a-kr`/`decantar-kr-a-kpi`).
(3) `proyecto_mejora` e `idea` = entidades SEPARADAS enlazadas (Misnomer resuelto vs unidad D-07);
ciclo PDCA-genérico con `metodologia: pdca|dmaic|masp|kaizen` como dialecto de render; **RN-15**
auditoría de beneficios. (4) **Corte limpio sin deprecados** — formas v1 = ERROR; prenter migrado
en el mismo evento. (5) Vocabulario de verbos propio (ALM×MGI, 44) con gobernanza por PR (RN-11).
(6) Capa kinética declarada en el schema (15 acciones + máquina de estados); BL-24 = motor.

*Ejecutado:* `objeto.schema.yaml` v2 (12 entidades) · `verbos.yaml` + `gen_schema.py` (4º gate) ·
M41-M45 + dimensión `mejora-proyectos` (NOTACIONES regenerado) · `/api/objeto` v2 con `errors[]` ·
prenter migrado (29 kpis entidad) · live-verify doble (prenter 0E/0W + fixture 12 entidades) ·
book (backbone O7 · kpis.md · mejoras.md · objetivos.md §6-bis).

*Conecta:* CK-21/D6 (la kinética que manda) · CK-23 (el fixture que sigue: corporación ficticia
~200 empleados, directiva registrada) · CK-24 (frontera persona, cableada como RN-8/RN-16) ·
D-07 (unidad de ejecución en la medición).

### CK-27 · Design system PRENTER + atomic design + banco de componentes DRY — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-20):* "el design system que debemos usar es el PRENTER y puedes
encontrarlo en claude design. Luego, como medio debemos poner la regla que todo lo UI debe tener
como base atomic design y debemos tener todo en un storybook (o sea, los tokens, átomos, moléculas,
etc. no las historias de usuario, debe ser nuestro banco de 'componentes' reutilizable para no andar
duplicando código, recuerda DRY)". Disparado al notar que la story `cruce-estructura-operacion-
indicadores` (ui-story) no tenía mockup porque `design_system_ref.status` seguía `pending` (BL-04).

*Contexto encontrado:* PRENTER existe completo en Claude Design (`is_default`) — ya atómico: tokens
(`tokens/*.css`: teal único acento dark-first, tipografía Coco Gothic→Jost / Sansation→Mulish /
JetBrains Mono, grid 4px), átomos React (`Button`/`Badge`/`Card`/`Input`), patterns, brandbook. La UI
del cockpit (`ui/`, Next 16 + Tailwind 4) arrastraba el **acento púrpura `#7c3aed` de devhub** (leftover
del monorepo) y "átomos" ad-hoc sueltos en `ui/components/ui/`, sin taxonomía ni catálogo.

**Forks del operador:** (1) **construir todo ahora** (no diferir a ciclo de story) · (2) **"Storybook" =
ruta showcase embebida** `/design-system` (cero dependencia Storybook.js; se embebe en el binario como
el resto de la UI — coherente con "todo embebido") · (3) **BL-04 primero** (sube F2→F1, el design system
antes que las vistas que lo consumen — evita deuda visual).

*Ejecutado:* tokens PRENTER ported a `ui/app/globals.css` (`@theme` + `:root`, **mata el púrpura** con
compat-aliases legacy→PRENTER para no romper organismos existentes) · átomos ported a `.tsx` tipado en
`ui/components/ds/atoms/` (token-driven, fiel a PRENTER = DRY) · catálogo vivo `ui/app/design-system/`
(ruta `/design-system`, bypass del shell de negocio) · regla project-layer `.claude/rules/ui-design-
system.md` (doctrina enforce-able: consumir-no-duplicar, token-first, un solo acento, cataloga-en-el-
mismo-cambio) · seam `design_system_ref` pending→adopted · `cockpit-stack.md` cláusula volteada · story
`design-system-atomic-storybook` F2→F1. Verificado: tsc + `next build` + render en vivo de `/design-system`.

*Diferido (follow-up de la story):* migrar los organismos legacy (`ui/components/{negocio,shell}/`, ya
re-tematizados a teal por los tokens) al banco `ds/` · harness de test DOM (jsdom/testing-library) para
átomos con lógica · fuentes de marca oficiales `.woff2` (hoy sustitutos Jost/Mulish) · moléculas.

*Conecta:* `[[cockpit-stack]]` (declaraba el hueco `design_system_ref: pending`) · CK-11 (origen BL-04,
doctrina "UI se construye contra el design system") · CK-18 (urgencia: Consultio/Colab son UIs nuevas) ·
`[[arquitectura-as-code]]`/`[[metodologia-as-code]]` (ejes as-code gemelos; este es doctrina UI, sin gen+gate propio) ·
`[[anti-duplication]]` (el banco ES la anti-duplicación de UI).

### CK-28 · Refactoring del grafo de conocimiento — árbol `docs/` unificado + principio hexagonal fuente↔lectura — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-23):* "reorganizar la carpeta del proyecto… `proyecto/` debería estar
dentro de `docs/product`… en `docs/process` información duplicada… `sistema/` desconectada del
producto… organiza todo dentro de `docs/` en una estructura bien pensada… no deberíamos combinar
código fuente del sistema con archivos .md que son de lectura de claude, partamos del principio de
arquitectura hexagonal y no acoplemos información… estamos haciendo un refactoring de todo nuestro
grafo de conocimiento y artefactos de desarrollo".

*Contexto encontrado:* la tríada CK-11 (`sistema/`·`docs/`·`proyecto/`) había quedado obsoleta tras
el arnés (CK-19): `proyecto/backlog` y `docs/increment` archivados pero en sus paths viejos,
`docs/process` con 6 archivos duplicados raíz↔`harness/` (5 byte-idénticos; `tech-debt.md` raíz =
registro vivo TD-1..3 vs template), `docs/architecture` casi vacía, y `sistema/` mezclando SSoT
as-code con narrativa de lectura. Auditoría archivo-por-archivo de `sistema/` (74 archivos,
subagente): clasificó ssot-data / generador / generado / doc-humana / sample / muerto con refs
entrantes concretas (gates, gen_*.py, go/, skills, rules).

**Decisiones:** (1) **principio hexagonal**: `sistema/` = SOLO lo que un gate valida, un generador
lee/escribe o el runtime carga; `docs/` = todo lo que se lee (mapa + 5 reglas de ubicación en
`docs/README.md`). (2) `proyecto/` **se disuelve**: research → `docs/research/` · prototypes →
`docs/product/prototypes/` · plans → `docs/product/plans/` · backlog congelado + increment
congelado → `docs/product/_archive/` (banner, correspondencia en MAPEO). (3) **Dedup process/**:
doctrina estática solo en `docs/process/harness/`; registros vivos solo en raíz
(`learnings`/`tech-debt`/`continuous-improvement`/`harness-backlog` — paths citados por reglas
CORE, inamovibles). (4) De `sistema/` **salen** (doc-humana desacoplada): visión CTO
`ARCHITECTURE.md` + `ck-02-stage1-diagram.html` → `docs/architecture/producto/` · veredicto
ISO-9001 + book del objeto (`schema/metodologia/`, 8 docs) → `docs/metodo/{,objeto/}`.
(5) **Quedan** en `sistema/` pese a ser .md: M1/M3/PROCESS-AS-DATA/SERVICE-DESIGN (ruteados por
`GRAFO.md` + `ref:` de ~20 pasos — moverlos rompe el cerebro `/metodo`), `despliegue.html` (input
del gate CK-17), `DECISIONES.md` (ledger mismo-evento del schema, como LEDGER.md en raíz),
fixtures/samples co-localizados, READMEs de nivel.

*Ejecutado:* `git mv` (historia preservada) + recableo repo-wide (CLAUDE.md, VISION.md §Gestión
—stale desde CK-19—, README raíz, MAPEO, stories, rules project-layer, memoria del agente) +
regenerados los 4 ejes (`gen_arquitectura`/`gen_metodo`/`gen_roadmap`/`gen_schema` verdes) +
READMEs nuevos (`docs/README.md` mapa, `docs/architecture/`, `docs/metodo/`, `sistema/README.md`,
`sistema/schema/README.md` actualizado a v2/12 nodos) + `.obsidian/` a `.gitignore`. LEDGER
conserva paths históricos verbatim (las fichas viejas no se reescriben; esta ficha es el puntero).

*Conecta:* CK-11 (tríada — disuelta aquí) · CK-19 (arnés: archivo backlog/increment que esta ficha
re-ubica) · CK-17 (gates que fijan qué NO puede moverse) · `[[arquitectura-as-code]]` /
`[[metodologia-as-code]]` (los ejes cuya frontera fuente↔lectura esta ficha endurece) ·
`docs/README.md` (las 5 reglas de ubicación = doctrina operativa de esta decisión).

### CK-29 · El twin es un cerebro que compila trabajo — tesis unificadora + componente conocimiento + fin-estado orquestador — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-24):* "no debería haber mucha diferencia entre la metodología y el dogma…
tiene que ser todo unificado… si tengo todos los procesos, yo debería poder generar arneses con
Arnesia… para entregárselos en el Colab Studio, por puestos… estos arneses ya tendrían sus objetivos,
qué es lo que tiene que hacer, por dónde no se tiene que ir, y sería como un asistente conectado a
este gran cerebro que es el digital twin… el cerebro de la organización no solamente son sus
procesos… hay cierto know-how, usualmente establecido en data histórica… no lo vamos a abordar en
este preciso momento, pero tiene que estar conectado… que los arneses sepan dónde buscar cada cosa…
cada colaborador en su día a día realmente no se dedique a hacer el trabajo él mismo… su labor diaria
sea la de orquestar el trabajo, midiendo la eficiencia, modificando sus propios arneses, poniendo
proyectos… el cockpit como tal es ese cerebro, ese todo que permite que los demás pasos lleguen en su
debido momento". Aclaración del mismo evento: cada app tiene SU repo (`~/Proyectos/harness-studio` ·
`~/Proyectos/dev-studio` · `~/Proyectos/consultio` · Colab Studio por crear) — en cockpit viven solo
sus historias (`docs/product/stories/`), jamás su código.

*Contexto encontrado:* la sustancia estaba ~80% escrita pero dispersa y sin frase cardinal: la ficha
N15 ya decía "compila el objeto normalizado + el método en `SKILL.md`/plugins por rol";
`cerebro-conocimiento/03` ya diseñaba el GRAFO-por-organización como índice que viaja dentro del
arnés; el know-how tácito ya tenía fila (`conocimiento/<proceso>/<rol>/` en N6, files-first, historia
F3) y la capability #23 ya nombraba los arneses por puesto. Pero VISION.md no declaraba nada de esto
como núcleo del twin — y dos lecturas del agente (visión vs doctrina) pudieron sonar a dos visiones
distintas. Detectado de paso: VISION.md decía "9 entidades" (stale — CK-26 fijó 12).

**Decisiones:** (1) **Tesis unificadora** — visión, método y forma de trabajo son UNA máquina a tres
escalas: organización como codebase (SSoT versionada → vistas generadas → gates anti-drift; nada se
borra, se invalida con firma; el LLM propone, el humano con autoridad dispone). **El arnés es la
vista GENERADA del twin para un puesto** — se compila (Arnesia N15), jamás se edita a mano, se
recompila cuando el twin cambia. (2) **El twin es un cerebro de tres cuerpos:** estructura (12
entidades) × conocimiento (know-how + data histórica — gateado a F3, files-first, pero conectado
desde el día uno: los arneses nacen con punteros a dónde buscar) × pulso (lakehouse N16). (3)
**Fin-estado del trabajo:** el colaborador no ejecuta — orquesta agentes; su labor = dirigir, medir
eficiencia, mejorar su propio arnés, proponer proyectos. Cockpit = la cabina del cerebro. (4) **Cero
cambio de arquitectura** — los 16 nodos absorben todo; cada producto del ecosistema en su repo, sin
import cruzado (re-afirmación I-39/CK-25).

*Ejecutado:* VISION.md — tesis unificadora + fin-estado en §Identidad, cuerpo "cerebro que compila
trabajo" en §Twin, Consultio/Colab Studio al §Ecosistema con sus repos, fix 9→12 entidades. Memoria
del agente (`vision-unificada-guardian`): todo pedido se contrasta contra esta formulación y el
agente avisa si algo se desvía (el operador firma la última palabra).

*Conecta:* CK-21 (la fórmula que esta ficha amplía a cerebro) · CK-18 (el método se entrega en
arneses — aquí el arnés se vuelve proyección compilada) · CK-25 (consultio repo propio, studio-core)
· CK-24 (la frontera persona rige también dentro del arnés) · CK-26 (las 12 entidades) ·
`docs/research/cerebro-conocimiento/03-proyeccion-twin.md` (mapeo 1:1 cerebro propio → twin) ·
fichas N15/N17 de NODOS.md · historia `knowledge-database-files-first` (F3).

### CK-30 · Puesto ≠ rol · el arnés se compila por rol×proceso · las personas SUPERVISAN a los agentes — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-25):* "**Las personas supervisan a los agentes, no los agentes ayudan a
las personas**, las personas orquestan el trabajo y la intención y todo lo deberían hacer los
agentes (y con agentes me refiero al colab-studio con claude code por detrás y los arneses que le
hayamos dado permiso y/o acceso, todos conectados al cerebro de la organización el cual es el
digital twin que estamos construyendo)". Y sobre la unidad del arnés: "los arneses se dan **por
proceso o task al más bajo nivel por cada rol**, y que **un puesto tiene varios roles**, y una
persona o varias ocupan el puesto".

*Contexto encontrado (4 investigaciones paralelas, 2026-07-25).* (a) **El modelo del operador YA
era la doctrina del ecosistema**, escrita en cuatro lugares independientes desde antes: `NODOS.md`
N17 ("cada puesto ejecuta N roles"), N15 ("skill = procedimiento, plugin = rol, marketplace = mapa
de procesos"), `docs/research/rediseno-total/07-proceso-como-arnes.md` ("definido POR ROL dentro de
un proceso… el puesto que ejecuta N roles instala N plugins — el mapeo es literal") y la visión
firmada de harness-studio ("framework file-based definido por **rol × proceso**"). (b) **El schema
era el desfasado:** `objeto.schema.yaml` declara `rol.nombre met:"= cargo (SOMA C8)"` — o sea `rol`
significaba lo que el operador llama `puesto`, y `actividad.carril_ref` usaba ese mismo `rol` como
carril BPMN. **Misnomer M32 de manual**: una palabra, dos conceptos, dos planos del producto.
(c) **El SOTA cerró la pregunta de contenido** con un negativo limpio (~20 productos revisados +
academia): nadie compila configuración de agente desde un modelo organizacional versionado; el
*Agentic BPM Research Manifesto* (Information Systems 140:102738, 2026) lo declara **Challenge C1
abierto**; los registros de agentes que existen (Workday ASOR, SAP LeanIX AI Agent Hub, CSA Agent
Registry v1) tienen `ownerEmail` pero **ninguno apunta al elemento del modelo organizacional que
justifica al agente**; y la CSA confiesa su hueco: *"human oversight is assigned through the
`ownerEmail` field… **not through an explicit autonomy-level field**"*. (d) **El contrato de salida
ya existe** y no hay que inventarlo: `arnes.l0.json` de harness-studio (`required: [id, rol,
proceso, reporta_a]` + `empresa` + `fases[]` + `spine{estados,transiciones}`, 10 clases × 7 bandas ×
3 ejes ortogonales). Lo que falta es el generador y el **registro** en el twin.

**Decisiones:**

**(1) Tesis de inversión (amplía el fin-estado de CK-29 §3).** Las personas **supervisan** a los
agentes; los agentes ejecutan. La persona dirige la intención, aprueba las excepciones y mejora su
propio arnés. "Agente" = Colab Studio (N17) con Claude Code detrás + los arneses a los que se le dio
permiso, **todos conectados al twin**. CK-29 decía "orquesta, no ejecuta"; CK-30 invierte el sujeto:
el agente deja de ser asistente y pasa a ser ejecutor.

**(2) El contrapeso es parte de la tesis, no un reparo.** La evidencia empírica dice que los agentes
autónomos multi-paso fallan mucho (TheAgentCompany **30,3%** de tareas completadas · WorkArena++
**2,1%** contra 93,9% humano · τ-bench cae de ~60% pass^1 a **~25%** pass^8 — la consistencia, no la
capacidad, es el cuello de botella) y que el mal output cuesta (*workslop*: ~2h por incidente,
**$186/empleado/mes**). Y la crítica académica de la supervisión humana es demoledora: **Elish**
("moral crumple zones" — el humano como componente que absorbe la culpa cuando el sistema falla) y
**Ben Green** (41 políticas revisadas: la gente no puede ejercer la supervisión que se le pide, y
esas políticas **legitiman** algoritmos defectuosos dando *"a false sense of security"*; su
alternativa es supervisión **institucional**, no individual). → **Doctrina: la supervisión no se
declara, se especifica y se mide.** Cada arnés declara `verificacion_humana{qué, evidencia, tiempo}`;
el twin mide si ocurrió. Ratio de anulación en cero durante meses = **brecha**, igual que un KPI
fuera de banda. Es el loop del producto aplicado a sí mismo, y responde a Green por diseño.

**(3) `puesto` ≠ `rol` — se parte el Misnomer.** `puesto` = posición de organigrama (se contrata,
se ocupa, se vacanta, reporta) · `rol` = **papel dentro de un proceso** (carril BPMN, fila RACI —
la definición estricta de ArchiMate Business Role). Cadena: `persona ─ocupa→ PUESTO ─agrega→ ROL
─carril/RACI→ ACTIVIDAD ⊂ PROCESO`. Cardinalidades: N personas por puesto · N roles por puesto ·
un rol puede vivir en N puestos. Ficha **D-19**.

**(4) Tres unidades distintas del arnés — y ahí cae la frontera CK-24.**

| Unidad | Qué | Dato | CK-24 |
|---|---|---|---|
| **Se COMPILA** por `rol × proceso` | 1 plugin; sus skills = los procedimientos de ese rol en ese proceso | 100% twin | ✅ cero persona |
| **Se ENSAMBLA** por `puesto` | roster de N arneses con versión y canal (el lock `.consultio/arneses.yaml` ya live-verificado en CK-25) | 100% twin | ✅ cero persona |
| **Se INSTALA/CORRE** por `persona` | su laptop, su suscripción (N8: "cada humano usa su propia suscripción"), su telemetría | por instalación | ⚠ **única aparición de la persona** → se agrega por rol antes de volver al twin (M40) |

Tres verbos, tres unidades. **El arnés no es "por persona" ni "por puesto": se compila por rol×proceso,
se entrega por puesto, se corre por persona.** La frontera CK-24 cae exactamente entre *entregar* y
*correr* — y queda intacta sin excepciones.

**(5) `arnes` entra al twin como REGISTRO, no como contenido.** El twin guarda el hecho auditable
(`deriva_de{puesto,rol,proceso}` · `version` · `hash_fuente` · `estado/drift` · `autonomia` ·
`supervisor` · `verificacion_humana` · `indicadores[]` · `uso_agregado`); el **contenido**
(skills/hooks/permisos/sandbox) lo produce Arnesia (N15) contra el contrato `arnes.l0.json` que ya
existe. Razón: `estado` y `drift` son **derivables** (comparar `hash_fuente` contra el twin actual),
coherente con "computa, jamás guarda"; pero el registro (versión, telemetría, autonomía, supervisor)
no se deriva de nada — es hecho propio. Ficha **D-20**. `deriva_de` es **el campo que ningún registro
de agentes del mercado tiene** — es el diferenciador, literal.

**(6) Granularidad: actividad hoy, tarea con D-21.** `skill = procedimiento ≈ **actividad**` funciona
hoy (la actividad tiene `id`, `carril_ref`, `raci`, `verbo`, `triage`, `mandato`, `automatizacion`).
La candidatura **por tarea (L5)** que D-17/M37/`triage.yaml` prometen es hoy **imposible**: `tarea`
no tiene `id`, ni `carril_ref`, ni `raci`, ni `triage`, ni provenance — sin `id` un arnés no puede
apuntar a un paso, y sin carril dos roles no pueden repartirse los pasos de una actividad. Ficha
**D-21** (D-17-bis) lo habilita.

**(7) "Los procesos de un rol" queda DEFINIDO** (era ambiguo y cada lectura daba un arnés distinto):
**posee** (`proceso.dueño_ref`) ∪ **ejecuta** (`actividad.carril_ref` ∨ `raci.R`) = **su arnés**.
**Consulta** (`raci.C` / `raci.I`) = contexto de lectura, **no** genera skills. Va en D-19.

**(8) El guardrail en prosa no es un guardrail.** Doctrina de Claude Code, verbatim: *"Permission
rules are enforced by Claude Code, **not by the model**. Instructions in your prompt or CLAUDE.md
shape what Claude tries to do, but they don't change what Claude Code allows."* → todo guardrail del
arnés declara su `mecanismo: hook|permiso|sandbox|prompt`, y el gate **rechaza** un arnés con
autonomía ≥ L3 cuyos guardrails sean todos `prompt`. Corolario de producto:
**`strictPluginOnlyCustomization`** (bloquea skills/agents/hooks de fuente usuario) es lo que hace
cumplir *técnicamente* "el arnés no se edita a mano" — encendido en el arnés del trabajador (N17),
apagado en el del consultor (N14) y el dev (N5).

**(9) Autonomía derivada, no elegida.** Vocabulario **CSA L0-L5** (ene-2026: L0 ninguna → L1
asistida → L2 supervisada → L3 condicional → L4 alta → L5 plena; la CSA declara L5 *"not appropriate
for enterprise deployment today"*). El nivel **se deriva del riesgo del puesto** (acciones
irreversibles / datos regulados / `mandato` de compliance → techo L2 sin ratificación explícita del
operador). **Default L1-L2 con puertas de aprobación; se sube por evidencia de evaluación, no por
optimismo** — con la evidencia de (2) en la mano. Implementación real disponible: aprobación humana
out-of-band (CIBA) vía hook `PostToolUse`, con el token nunca entrando al contexto del modelo.

**(10) Riesgo regulatorio asumido y resuelto por diseño.** **EU AI Act Annex III 4(b)** clasifica
alto riesgo los sistemas usados *"to allocate tasks based on individual behaviour… or to monitor and
evaluate the performance and behaviour of persons"* en relaciones laborales. Cockpit —hilo de oro
medido + asignación de trabajo por puesto— **cae textualmente en ambas**, y el Art. 6(3) no salva
porque profiling es siempre alto riesgo. **Camino elegido: (a)** el motor de indicadores es
**agregado por proceso/rol/área** y la métrica individual queda **fuera del producto** — que es lo
que CK-24/M40 ya decidieron por convicción antes de conocer la razón regulatoria. Se declara
explícito. (El Digital Omnibus corrió la fecha de Annex III a **2-dic-2027**; el fondo no cambió.
El Art. 50 —informar que se interactúa con IA— **no se movió: aplica desde 2-ago-2026**.)

*Lo que NO es diferenciador (y hay que dejar de decir):* "arneses ejecutables por rol" a secas
—Anthropic ya vende plugins departamentales y `plugin = rol` es su patrón publicado—, "el método
como skills" (Decagon/Beam/Skan lo hacen en sus verticales), "agentes que conocen los procesos del
cliente" (Celonis AgentC ya expone Process Intelligence como grounding). **El diferenciador no es el
arnés: es de dónde sale el arnés.** Formulación honesta y estrecha que resiste escrutinio: *el único
pipeline determinista SSoT-organizacional → arnés-por-rol×proceso → gate anti-drift → evidencia de
operación → brecha → de vuelta al SSoT*. Cada eslabón tiene precedente; **el ciclo cerrado no**. La
ventana es real pero corta (Workday tiene el registro y el dato de puestos; Microsoft el plano de
control y la identidad; Camunda el modelo de proceso con el agente adentro).

*Corroboración externa (SOTA archivado — `docs/research/organization-as-code/09` y `10`):* (a) **el
sustrato as-code queda defendido por cita del propio organismo normativo** — The Open Group, sobre el
ArchiMate Model Exchange File Format: *"**It is not intended as a persistent file format for the model
itself**, it is a mechanism to convey instance data from one tool to another"*, y las herramientas que
lo importan *"typically save them in their own proprietary formats afterward"*. El repositorio
propietario **no es un descuido de los vendors: es la arquitectura que asume el estándar**. (b) **La
forma organizacional declarada gana al enjambre:** en TheAgentCompany el framework **multi-agente
PIERDE** contra el agente único (4,0% vs 8,6%, mismo modelo) y donde más falla es en la parte
**social**; en OrgAgent la coordinación **jerárquica** supera a la plana (+102,73% de performance con
−74,52% de tokens). Es el argumento empírico de por qué el arnés se compila con estructura declarada
(rol×proceso) y no como un enjambre. (c) **El levantamiento por entrevista es ingrediente técnico, no
servicio previo:** el estudio Stanford de 1.000 personas fue retitulado en jun-2026 a *"LLM Agents
**Grounded in Self-Reports**…"* — 86% de accuracy con entrevista+encuesta vs 74% con sólo demografía.
(d) **Límite de discurso que esta ficha adopta:** el mercado DTO no simula (0 de 19 vendors de
Gartner; el propio Market Guide admite *"most suppliers still have gaps"* y *"slow start in uptake"*),
la academia que sí simula acaba de chocar con la validez (colapso de heterogeneidad; r entre 0,23 y
0,84 según configuración), y los líderes están **abandonando la palabra** (Celonis → "Context Model",
Skan → "Context Graph of Work"). → **"twin" se usa como ancla de categoría ante analistas, JAMÁS como
promesa de capacidad; "simula" no se promete.** El horizonte de simulación con arneses (VISION
§Horizontes, gateado) exige **preregistrar la configuración** o la validación es teatro.

*Ejecutado:* D-19 (`puesto`) · D-20 (`arnes` registro) · D-21 (tarea L5) en `sistema/schema/DECISIONES.md`
· M46 "Arnés por rol×proceso" al catálogo del método (familia I) · VISION.md §Identidad (tesis de
inversión + modelo de 4 capas) · hallazgo A1 del tracker de la historia `twin-territorio-mapa-zoomable`
→ `decidido`. **Materialización en `objeto.schema.yaml` + fixture + generador = historias**, no esta
ficha (la ficha decide; el schema se toca con su gate).

*Conecta:* CK-29 (la tesis que esta ficha invierte y aterriza) · CK-24 + M40 (la frontera que las
tres unidades del arnés dejan intacta — y que resulta ser la defensa regulatoria) · CK-26 (las 12
entidades → 13 con `arnes`, 14 con `puesto`) · CK-25 (`studio-core`, el roster con lock ya
live-verificado) · CK-18/CK-21 (el método se entrega en arneses) · D-09 (`función` disuelta — esta
ficha NO la revive: `puesto` es agregador de contratación, no función) · D-17 (tareas[], que D-21
completa) · fichas N15/N17/N8 de `NODOS.md` · `docs/research/rediseno-total/07-proceso-como-arnes.md`
· harness-studio `graph.l0.schema.json` (el contrato de salida) · historias
`fabricante/arnesia-pipeline-arnes-por-rol` (F3) y `consultio/metodo-como-arnes-v0` (F1) ·
`docs/research/organization-as-code/09-sota-dto-2026-fuente-primaria.md` + `10-sota-arnes-as-code.md`
(el SOTA que fundamenta esta ficha) · M46 (la doctrina, en el catálogo del método).

### CK-31 · El nivel Directorio es de primera clase — y Cockpit LEE el libro contable, jamás lo reexpresa — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-29):* "revisa la vista del directorio y **enfócate** … ¿a los directores
les interesa lo que hay allí o también debería verse el estado de resultado y avances u otros
elementos de las **NIIF**? … revisa a conciencia **sin defender lo ya realizado** y dime qué cosas no
estamos mostrando que sí son relevantes a un directorio en sus reuniones". Y al ratificar: "ejecuta
los 3 bloques … reorganizando la información de forma oportuna, entendible y atractiva … que la
información, si bien es para un rubro, sea **lo más general para cualquier otro**".

*Lo que la auditoría encontró (13 hallazgos, sin defender lo hecho — `dossier/07 § H`).* El nivel 1
gobernaba la **ejecución de la estrategia** (apuesta · apetito · mezcla · alertas · portafolio de
mejoras): genuinamente diferenciador, y **la segunda mitad** de una agenda de directorio. Faltaba la
primera entera. Los tres desvíos de fondo: (1) la bandeja "espera tu decisión" **configuraba el propio
modelo** (4 de 6 filas eran fijar apetito / fijar mezcla / sellar) — en régimen queda vacía y el
directorio no firma nada; (2) la apuesta **prometía plata y nunca la cobraba** — el producto acusa a
otros de "indicador sin ancla de valor" y cometía exactamente eso en su nivel más alto; (3) todo el
tablero era **interno, auto-reportado y hacia adelante**, sin un solo dato cerrado o validado por
fuera — que es justo lo que un directorio descuenta.

**Decisión 1 — el nivel Directorio se gobierna como AGENDA, no como tablero.** La página es la sesión
en cuatro movimientos: ¿cómo nos fue? (resultado del periodo + caja) · ¿a dónde vamos? (rumbo,
apuestas con lo cobrado, varas y presupuesto) · ¿qué puede impedirlo? (riesgos, alertas, inversiones,
proyectos) · ¿qué decidimos? (bandeja, acuerdos de la sesión anterior, acta). El orden ES la doctrina:
un directorio no navega detalle, decide — y decide en ese orden.

**Decisión 2 (la de fondo) — Cockpit no es el libro contable: es el PUENTE entre el libro y la
organización.** Lee un puñado de cifras con su **estado de cierre** (preliminar → cerrado → auditado)
y su procedencia, y hace lo que ningún tablero contable puede: **baja cada número al proceso, área o
rol que lo produce**. Lo que NO hace queda declarado en superficie: no arma el juego completo de
estados financieros ni sus notas, no corre el cierre, no reexpresa cifras cerradas, no emite opinión
de auditoría. *Por qué así:* reproducir los estados lo volvería un tablero contable más (commodity),
perdería la pelea de calidad del dato contra el sistema contable del cliente, y mostrar cifras no
cerradas en una superficie de directorio es riesgo real (los estados tienen ciclo, dictamen y
reexpresiones). **El código de la norma vive sólo dentro de la ficha, como procedencia** — misma regla
que los códigos M-NN, con gate en la suite.

**El corolario que vale el producto entero:** el **puente** nombra las seis decisiones contables que
dependen de cómo opera la empresa (reconocimiento de ingreso · deterioro de cobranza · valorización de
lo construido en curso · contingencias · arrendamientos · partes relacionadas), cada una navegable al
twin. Y el caso testigo: un **avance de obra declarado (95%) por encima del real (87%)** deja de ser
una brecha de obra — es el input de si **lo construido está bien valorizado en el libro**. Materia de
directorio y de auditoría, indetectable para cualquier sistema contable, porque no conoce el proceso.

**Decisión 3 — la generalidad se declara, no se supone.** Las cuatro preguntas de la sesión son las
mismas en cualquier industria; cambia el contenido de las filas. Cada bloque nuevo nombra su
equivalente (manufactura · retail · servicios · software · banca · salud) y el único campo que codifica
el rubro es `inversion.tipo`. El renglón de inversiones —avance real · gastado contra presupuesto · ya
comprometido · entrega · margen— sirve igual para obras, planta, tiendas, contratos o líneas de producto.

**Decisión 4 — lo que hace que la bandeja no se vacíe nunca: el UMBRAL.** Las decisiones llegan al
órgano de gobierno **por monto o por materia** (`empresa.config_gobierno.facultades`), no por
configuración del modelo. Sin ese mecanismo, un tablero de directorio termina pidiendo decisiones sobre
sí mismo.

*Materialización (mismo día, gates verdes).* **Método:** 5 cartas nuevas — **M55** reporte financiero
como fuente · **M56** liquidez (caja 13 semanas + límites del financiamiento) · **M57** presupuesto y
control presupuestario · **M58** gobierno de la sesión (acuerdos, acta, facultades) · **M59** valor
ganado (portafolio de inversiones); y 3 enriquecidas — **M52** gana el REGISTRO (la contraparte del
apetito que ya declaraba), **M22** la REALIZACIÓN (prometido vs cobrado, verificado por finanzas),
**M16** nombra cl.9.3. Catálogo 54→**59**. *Disciplina anti-duplicación:* el registro de riesgos NO
entró como carta nueva — es la otra mitad de ISO 31000; una carta espejo habría sido la duplicación que
el protocolo prohíbe. **Esquema:** D-24 `riesgo` · D-25 `sesion`+`acuerdo`+`config_gobierno` · D-26
`periodo`+`cifra` · D-27 `proyeccion_caja` · D-28 `presupuesto` · D-29 `inversion` · D-30
`apuesta.valor.cobrado` — 13→**20 nodos**. **Producto:** mockup twin v18 (suite 34/34) + contrato de
build `dossier/08`.

*Deuda que esta ficha deja explícita:* la **promoción de M52** de `horizonte` a `ancla` (el nivel 1 ya
materializa apetito + registro mientras la carta dice "no en el MVP") es decisión de dogma y **espera
firma** — declarada como tensión dentro de la propia carta. Y los cuatro hallazgos fuera de alcance por
decisión, no por olvido: exposición cambiaria · aterrizaje proyectado · cumplimiento como superficie
propia · personas a nivel directorio.

*Relacionadas:* CK-21 (Organization as Code → Twin) · CK-26 (las entidades) · CK-29 (el twin como
cerebro) · CK-24 (frontera persona — responde el rol, jamás la persona) · D-22/D-23 (ambición y
apuesta, que esta ficha completa con presupuesto y valor cobrado) · `dossier/07 § H` (la auditoría) ·
`dossier/08` (el contrato de build) · `sistema/schema/DECISIONES.md` D-24…D-30 · M52·M55-M59.

<!-- Próximas: CK-32, … -->

### CK-32 · El directorio decide, la gerencia resuelve — el hilo medido al contrato, la madurez con vara y la bajada como dato — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-29):* primero — "revisa … el estado actual de la estrategia y compáralo con
nuestro `/metodo` … dime qué cosas estamos omitiendo o estamos haciendo mal … revisa que los objetivos
de directorio que estén en la estrategia sean los mismos que directorio, que haya coherencia … **mete
foco a KPIs y niveles de madurez**". Después, al ordenar la corrección — "realiza todos los cambios,
pero revisando el estado actual para que hagan total sentido con todo lo existente, **a menos que haya
algo que consideres que debe desaparecer e ir a lo táctico** … aquí **los usuarios son el gerente
general y los gerentes**, y debemos a través de nuestras acciones diarias **resolver todo lo que se
muestra en directorio**".

*Lo que la auditoría encontró (40 hallazgos K1-K40 — `dossier/07 § K`).* CK-31 dejó el nivel 1
completo como **agenda** y **inejecutable como sistema de gestión**: siete metas de empresa que ningún
rol tenía asignadas, alertas sin destinatario, cifras que nadie movía, y `objetivo.parent_ref` — el
campo de la cascada, en el esquema desde v2 — con **cero usos**. La segunda frase del operador nombró
lo que faltaba y se vuelve la doctrina del nivel:

> **El directorio decide; la gerencia resuelve. Nada del nivel 1 se queda sin bajada.**

*Las cinco decisiones de fondo.*

1. **La bajada es dato, no lámina (D-35).** La meta del directorio se abre como meta de UNA gerencia,
   con el rol que responde, y el catchball de Hoshin se **cierra contra una sesión**. Los dos estados
   que gobiernan de verdad — *sin bajar* y *asignada sin acordar* — se derivan del grafo y llegan solos
   a la bandeja. Meta asignada ≠ acordada: esa diferencia predice el incumplimiento mejor que cualquier
   semáforo, y era exactamente lo que un contador escrito a mano no podía decir.
2. **El hilo ancla al contrato, no al objetivo (A2, abierto desde julio · D-34).** `kpi.kr` reemplaza a
   `kpi.obj`, `krs[]` es lista, y el valor del contrato **se lee de la serie** en vez de teclearse al
   lado. El caso testigo: «caja sana» leía **verde** —su único contrato, la cobranza consolidada, había
   llegado a la meta— con la caja cruzando el piso, un riesgo alto y 18 % de valor cobrado. Con dos
   contratos y el **gris pesando por encima del verde**, el objetivo dice lo que pasa.
3. **Una escalera nunca viaja sin su vara (D-32/D-33).** Convivían tres sin arbitraje, y una leyenda
   prometía niveles 0-5 sobre un campo de tres colores. COBIT gradúa **una capacidad**; ISO 9004, el
   **sistema de gestión** entero: conviven y jamás se promedian. Sin `nivel_deseado` hay nivel y **no
   hay brecha** — la capa lo declara en vez de pintar una distancia que nadie fijó. La madurez del área
   se **deriva** de sus capabilities; su autoevaluación gana ficha, evidencia del twin y sesión.
4. **La vara externa sale del eje vertical (D-31).** El tablero afirmaba «pares 45-60 días» de cobranza
   contra una unidad de nicho que dice, textual, que **ese benchmark no existe validado** y que el
   rango se levanta por cliente. El producto acusaba a otros de indicador sin ancla y afirmaba sin
   fuente en su propia portada. Ahora el indicador apunta a su unidad y **hereda su confianza**: sin
   rango validado se muestra la condición — que es información, no un hueco.
5. **Lo que baja a lo táctico** (respuesta al permiso explícito del operador): el portafolio completo,
   el detalle de alertas, el registro de avance de inversiones y el seguimiento semanal de acuerdos. El
   nivel 1 sigue **por excepción** y cada fila declara por qué sube; el panel declara por qué el resto
   se queda abajo. Duplicar la lista en dos niveles era la forma más rápida de que empezaran a
   discrepar. Y el nivel 3 **abre** con lo que el directorio dejó.

*Ratificación pendiente de CK-31, ejecutada acá:* **M52 promovida `horizonte → ancla`** (`modo:
situacional → columna`). Una carta que contradice al producto vigente no es un horizonte: es drift. No
cambia lo demás — sigue sin aparato ERM y sin certificación (VISION §ISO intacta).

*Precio pagado, explícito.* El pulso pasa de «1 de 7 en banda» a 5 metas (1 verde · 2 ámbar · 1 gris ·
1 roja): el tablero se lee peor porque ahora dice la verdad. Un objetivo con un contrato sin serie ya
no se disfraza de verde.

*Materializado el mismo día:* esquema **D-31…D-36** (20 nodos · 47 relaciones · **40 acciones** · 16
invariantes nuevos) · método con **M15/M21/M26/M47/M48/M52** enriquecidas (catálogo 59) y el eje de
nichos 17→**19 unidades** · mockup **v19** con la suite en **40/40** y 6 checks nuevos que impiden que
cada corrección vuelva · contrato de build `dossier/08 § 0.bis` con 8 escenarios de aceptación nuevos.

*Sigue abierto y con dueño* (12 filas del tablero K): indicadores adelantados y de riesgo (K18) ·
contra-métricas (K19) · la vara por cifra, hoy en el código (K21) · el sello de la apuesta (K37) ·
auditoría interna y proveedores como superficie (K36) · y **K33, el más caro**: las cartas M55-M59 no
tienen **ni un paso de proceso** — nadie sabe todavía cómo LEVANTAR este nivel en un cliente.

### CK-33 · Cada metodología dice en qué piso se usa — el eje nivel, y el dialecto brasileño completo — `decidida` · `vig:vigente`

*Cruda (operador, 2026-07-29):* "si metelo en `/metodo-aprende` pero **de forma inteligente para saber
dónde usarlo** separando lo que es **directorio, estratégico, táctico y operativo**".

*De dónde salió.* Una consulta de mercado — ¿se usa el Balanced Scorecard en LATAM, y en Brasil? — que
el propio catálogo ya tenía respondida para la **cascada** (M41 GPD = el modo brasileño de Hoshin,
research `00-research-latam-br`). El barrido mostró que faltaban tres cosas, y la tercera era la de fondo.

*Las dos que faltaban del dialecto brasileño.* No eran teoría nueva: eran **nodos de acceso** que el
consultor necesita para hablar el idioma del cliente en vez de traducirlo a un marco que el cliente no usa.

1. **M60 · MEG/FNQ** — la vara brasileña de madurez (linaje Baldrige, premio PNQ). Gemela exacta de lo
   que M41 es para M26: misma pregunta que ISO 9004/EFQM, otro vocabulario y otro aparato. Un directorio
   con historia FNQ **ya se autoevaluó** — sin este nodo esa evidencia se tira y se corre un ciclo nuevo
   encima. Arbitraje cableado en tres aristas (9004 sigue siendo el default; una escalera por dimensión,
   nunca dos — D-32); entra `horizonte`, se LEE el ciclo del cliente, no se corre uno.
2. **M61 · OBZ (Orçamento Base Zero)** — la cultura de costos 3G/AmBev. M57 guardaba el reparto **ya
   armado**; el hueco era **cómo se arma**. Y su aporte real no es la planilla: es el **dueño del
   paquete** — el gasto se vuelve algo que alguien defiende con nombre propio, que es exactamente la
   rendija por la que un presupuesto heredado nunca se discute. División cardinal: un solo presupuesto
   en el twin, OBZ es método de construcción, no una segunda bolsa.
3. **BSC público brasileño — corrección de alcance, sin card.** «Brasil = GPD» vale para el sector
   **privado**; en el Estado brasileño el BSC es el estándar de facto (mapas estratégicos exigidos en
   judicial, control y ministerios). No es conocimiento nuevo: es un veredicto nuestro con el alcance
   mal escrito. Corregido en M30, en la arista M30⇄M41 y en el research.

*La decisión de fondo — el eje NIVEL (contrato v3→**v4**).* El operador no pidió tres cards: pidió
**saber dónde se usa cada cosa**. El catálogo sabía QUÉ toca una metodología (objeto O1-O7/T1-T3) y
CUÁNDO del engagement (`donde.modulos`), pero **no en qué piso de la organización se usa** — y lo
sabía a medias, en prosa: cinco cartas del clúster de gobierno decían "encuadre del nivel directorio"
dentro de un campo de texto que ninguna consulta puede filtrar.

> **Cada M-card declara su piso. `nivel_primario` = donde se DECIDE o SE FIRMA lo que produce ·
> `niveles_secundarios` = los pisos que la consumen.**

- **Rótulos: los del `GLOSARIO.md`** — *Directorio · Estratégico · Táctico · Operativo*. No se inventó
  vocabulario: la escalera ya estaba escrita ahí (y "capa D/E/T/O" ya estaba marcada como jerga a evitar).
- **No es `nivel_acceso`** (`objeto.schema.yaml`, N13). Misma escalera, dos preguntas distintas: aquél
  gobierna **quién VE** el dato; éste, **dónde se usa** el método. El primer peldaño se llama
  `directorio` y no `gobernanza` porque manda el glosario, no el motor de acceso.
- **El eje obliga a nombrar el ancla.** No admite "todos": una carta transversal (M23 provenance, M32
  metamodelo, M40 frontera de persona) declara su ancla y lista los otros tres. Sin esa obligación el
  campo se habría llenado de "aplica a todo", que es no decir nada.
- **Ortogonal, no una cuarta taxonomía.** Objeto = QUÉ toca · módulo = CUÁNDO · dimensión twin = QUÉ
  ancla · **nivel = DÓNDE**. Cuatro preguntas, cuatro ejes, cero solapamiento.
- **Sirve para algo el mismo día:** `GRAFO.md §6` (generado, ancla + vecindario por piso) y el **primer
  filtro de ruteo** del skill `/metodo` — corta el catálogo a ~¼ y ataca el error que el eje existe para
  matar: **contestar una pregunta de directorio con una herramienta de piso, o al revés.**

*Materializado.* Contrato **v4** (enum `nivel` + `nivel_primario` requerido + invariante "el secundario
no repite el primario") · **las 61 cartas** con su piso asignado bajo una regla escrita y defendible, no
por gusto (13 Directorio · 16 Estratégico · 18 Táctico · 14 Operativo) · generador con validación +
`GRAFO §6` + el nivel en la ficha de `METODOLOGIA.md §4` · M60/M61 con sus 10 aristas recíprocas ·
`/metodo` con el nivel como primer salto · regla `metodologia-as-code` y README del método al día.
Gate verde: **61 M-cards**, 0 error, cero asimetría nueva en el grafo.

*Lo que este eje deja ver (y queda abierto):* el piso **Directorio** tiene 13 cartas ancla y **cero
pasos de proceso** que lo levanten — es K33 de CK-32 visto desde el otro eje, ahora con número. Y el
piso **Operativo** concentra 14 anclas de triage/arneses contra 3 de construcción: la asimetría es real
y esperable en el MVP, pero conviene mirarla antes de poblar `proceso/`.


## Log

| Fecha | Decisión | Fichas |
|---|---|---|
| 2026-07-06 | Graduación de P1 con visión ampliada (4 pilares: procesos/roles/objetivos/personas, marco ISO intermedio); código migrado y verificado standalone; investigación/mockups heredados curados en `docs/`; kit dev como plugin. | CK-10 |
| 2026-07-07 | Nacemos ordenados: tríada `sistema/`·capabilities·`proyecto/`; método del auditor completado desde el legacy (M3, PROCESS-AS-DATA, proceso m1/m2/m3); System Backlog as-code (BL-01..BL-18, 5 columnas) + `docs/INCREMENT.md`; App del Auditor declarada como subsistema. | CK-11 |
| 2026-07-07 | Personas de primera clase (cierra BL-01): `/api/personas` + lente Personas leen persona/rol del objeto normalizado (`empresa/<tipo>/` del shell, layout D-15); objeto.schema reconciliado; CAP-07; primera rebanada de la convergencia BL-02. | CK-12 |
| 2026-07-07 | El objeto completo (cierra BL-02): `/api/objeto` sirve y valida las 9 entidades JUNTAS (refs del Hilo cruzan entidades, RACI A==1, enums, ciclos); supersede `/api/personas`; CAP-08; verificado contra prenter (12 procesos, cero warnings). Nace BL-19 (negocio.yaml → proyección). | CK-13 |
| 2026-07-07 | Arquitectura terminada (cierra BL-03): N14 App del Auditor al mapa (R16/R17 + etapa E3); estados post-Stage-4 corregidos en NODOS.md (contrato CK-08 diseñado, N13 = binario `directorio` con `/api/objeto`); `despliegue.html` portado estático y actualizado; ARCHITECTURE/README al día. Nace BL-20 (deuda Go/Next N13). | CK-14 |
| 2026-07-07 | Render de la arquitectura-as-code (cierra BL-08): `gen_arquitectura.py` valida (refs R#, fichas CK-10+, relaciones, rutas) y genera `nodos.data.js` (drawer de despliegue.html restaurado) + `arquitectura.html` (vista de célula desde arquitectura.yaml); `--check` = gate anti-drift; verificado en navegador real. | CK-15 |
| 2026-07-07 | P2 = DevStudio (app de escritorio, GitHub como conector — reemplaza al server DevHub): N5 re-fichado Data→Edge; contrato CK-08 DEROGADO (BL-18 redefinido: mecanismo TBD con primer consumidor); N6 = repo GitHub del cliente + matiz BYOC "sus datos viven en SU GitHub, no en infra nuestra"; versión PM como nota (anti-especulación). Addendums: DevStudio gestiona N8 · N14 misma mecánica · N8 generalizado a runtime de agente local (motor de N5 y N14). | CK-16 |
| 2026-07-07 | Gate anti-drift automático: hook `.githooks/pre-commit` (valida fuentes, regenera derivados y los stagea; bloquea si no valida) + `despliegue.html` curado ahora SE VALIDA (cobertura data-nodo ↔ índice, madurez por art vs NODOS.md; test negativo verificado). | CK-17 |
| 2026-07-08 | Rediseño de fondo: Fábrica de software (Plano del Fabricante) + Organización instalada. El método se entrega al cliente en arneses (deroga el límite de IP). Mueren N1 (motor→arneses)/N4/N7; nacen Arnesia (N15)/Data Lakehouse (N16)/Colab Studio (N17)/Sistemas org (N18)/Analista de Calidad (N19); N6 = Repositorio Oficial confidencial (ya no GitHub); N13 Cockpit = Visualización + Gestión de Cambios + niveles de acceso; N14 = Consultio (clon DevStudio). 7 investigaciones SOTA. Decisiones D1..D5. | CK-18 |
| 2026-07-09 | Adopción del arnés prenter (migración total, lossless): `docs/product/` pasa a SSoT (29 historias + 8 capabilities + 2 releases + 7 module docs, con `provenance` verbatim de BL/CAP); `docs/product/_archive/backlog.yaml`+`docs/increment.yaml` archivados; 21 reglas CORE always-on en `.claude/rules/` + seam `project.config.yaml` (doctor 0) + hooks de telemetría. Se amplían las dos extensiones as-code: arquitectura (`arquitectura-as-code.md` supersede el `paradigm-arquitectura` del CORE) y metodología (nueva: `methodology.schema.yaml`+`gen_metodo.py`+2º gate en pre-commit). Forks Q1(migración total)/Q2(esqueleto completo)/Q3(gen+gate ahora). Deuda: bug `find_unfilled` del KIT 0.5.3 a backflow. | CK-19 |
| 2026-07-09 | Cableado del arnés (termina CK-19): 6 process-docs + 6 scripts/git del KIT materializados a paths convencionales (copia, no symlink a cache volátil — extiende CK-19); capture files del HLP creados; hueco del KIT 0.5.3 (role-skills/agents, rules-detail, specs-templates no publicados = W8 lift-kit) documentado en `harness-backlog.md` y operado a mano (sin fork). | CK-20 |
| 2026-07-16 | Organization as Code → Organization Twin: visión con nombre (twin = deseado N6 × real N16 × brecha continua N13, GitOps organizacional); diferenciador = hilo de oro medido (objetivos→OKR→KPI) + brechas con ROI + ciclo brecha→proyecto dentro de la solución + arneses por puesto. Pivote comercial: default hosteado single-tenant (invierte D3 de CK-18; self-hosted = tier regulados; multitenant = fase 2); N3 asciende a Portal (licencias fingerprint, no MAC); 1 repo · 3 entornos dev/UAT/prod; capa kinética + OKR/KPI/Proyecto al schema (doctrina Palantir); Consultio v0 = arneses sin app shell; Gestión de Cambios al MVP; horizontes gateados (what-if→BPSim→agentes-con-arneses, MCP V2). SOTA 11 vendors + Gartner DTO → TO-BE 37 capacidades en `docs/research/organization-as-code/`. | CK-21 |
| 2026-07-16 | Roadmap MVP: F1 re-alcanzada a "Terreno + MVP Twin vendible" (16 historias, fases F1.0 Terreno → F1.1 Método → F1.2 Organización viva → F1.3 El twin mide + carril negocio; historia nueva `arquitectura-refichado-ck21` = LA PRIMERA, pedido del operador); nacen F2 "Comercial" (portal+canal, deuda UI se paga aquí, conectores) y F3 "Edge completo + escala" (clon DevStudio baja a media, Colab, Arnesia pipeline, MCP, frescura, gateadas D5/CK-10); 28 story.yaml re-cableados (prioridades + deps, operar-metodo/publicación ya no esperan al clon); `docs/product/ROADMAP.md` como vista humana. | CK-22 |
| 2026-07-17 | Twin-first (re-secuencia F1): el twin lleno y pintado ANTES que el proceso de llenado — historia nueva `organizacion-ficticia-golden-fixture` (shell ficticio 100% contra schema v2, provenance simulando M1; fixture + plantillas-por-ejemplo + demo + contrato de salida de Consultio); F1 pasa a 5 fases (F1.1 Twin pintado adelanta a método/organización-viva; lakehouse alta→media a F1.4, mockeado por los KPIs del fixture); hito intermedio: twin demo-able con org ficticia. | CK-23 |
| 2026-07-17 | Frontera twin ↔ evaluación individual (de la auditoría adversarial del refinamiento): el twin mide roles/procesos/áreas — KPI ancla a rol, persona = ocupante; vista persona-nombrada solo opt-in Gobernanza + consentimiento; NASA-TLX agregado por rol/proceso, nunca registro individual; nace M-card "métricas de persona" gemela de M23. Mismo evento: D-07 clavada (techo=empresa; holding=agrupador; proyecto/sucursal = unidad de ejecución, no empresa) + historia nueva `cockpit/captura-manual-kpis`. | CK-24 |
| 2026-07-17 | Schema v2 shipped (historia `schema-v2-hilo-de-oro-kinetica`, idea→done en el día): hilo de oro MEDIBLE — 12 entidades (kpi salud-con-banda · proyecto_mejora · idea como funil separado), modo regional como configuración (OKR-trimestral / GPD-anual Falconi / mixto — investigación LATAM/BR con fuentes primarias; RN-14 divorcio KR↔compensación), capa kinética declarada (15 acciones + máquina de estados PDCA con loop-back MASP; BL-24 = motor), vocabulario de verbos ALM×MGI (44, gobernanza por PR) + 4º gate `gen_schema.py`, corte limpio sin deprecados con prenter migrado (29 kpis) y live-verify doble. M41-M45 + dimensión `mejora-proyectos` al catálogo. | CK-26 |
| 2026-07-17 | Consultio no se clona: se extrae `studio-core` (kernel Go compartido) y `dev-studio`(N5)/`consultio`(N14) lo consumen por import semver — disciplina upstream-first + ban de mirror producto→producto (misma doctrina que backflow del arnés); 10 decisiones de arquitectura (A1-A10) tras stress-test de 11 escenarios de fallo contra dev-studio real. Ejecutado y verificado en vivo el mismo día: `studio-core` v0.1.0 (SC-01) con fitness gate propio + `consultio` primitivo (CN-01) corriendo — engagement→repo git, arnés instalado con lock+commit real, sesión ligada, turno con SSE — dev-studio intacto. N14 re-fichado "clon de DevStudio"→"app fina sobre studio-core"; riesgo (2) de N5 cerrado. | CK-25 |
| 2026-07-20 | Design system PRENTER adoptado (materializa BL-04): SSoT visual = proyecto Claude Design "PRENTER Design System" (dark-first, teal único acento, atomic design). Tokens ported a `ui/app/globals.css` (mata el púrpura leftover de devhub); átomos `.tsx` en `ui/components/ds/atoms/` (Button/Badge/Card/Input, token-driven=DRY); catálogo vivo embebido `/design-system` (fork del operador: ruta showcase, no Storybook.js); regla `.claude/rules/ui-design-system.md` (consumir-no-duplicar, un solo acento, cataloga-en-el-mismo-cambio); seam `design_system_ref` pending→adopted; story `design-system-atomic-storybook` F2→F1. Verificado: tsc + `next build` + render en vivo. | CK-27 |
| 2026-07-23 | Refactoring del grafo de conocimiento: `proyecto/` disuelto en `docs/` (research·prototypes·plans·_archive), dedup `docs/process` raíz↔harness, y frontera hexagonal fuente↔lectura en `sistema/` (visión CTO + book del objeto + veredicto ISO → `docs/{architecture,metodo}/`); mapa + 5 reglas de ubicación en `docs/README.md`; auditoría 74 archivos con refs entrantes; gates verdes. | CK-28 |
| 2026-07-25 | Puesto ≠ rol · el arnés se compila por rol×proceso · las personas SUPERVISAN a los agentes: (1) tesis de inversión (el agente ejecuta, la persona supervisa) + contrapeso obligatorio — la supervisión se especifica y se mide, o es "moral crumple zone" (Elish/Green); (2) se parte el Misnomer M32 `rol`(=cargo) → `puesto` (posición, N personas, N roles) + `rol` (papel en proceso = carril BPMN/RACI) — el modelo del operador ya era la doctrina de N15/N17/harness-studio, el schema era el desfasado; (3) tres unidades del arnés — se COMPILA por rol×proceso, se ENSAMBLA por puesto, se CORRE por persona → la frontera CK-24 cae entre entregar y correr, intacta; (4) `arnes` = entidad REGISTRO en el twin (`deriva_de` = el campo que ningún registro del mercado tiene), contenido en N15 contra el contrato `arnes.l0.json` que ya existe; (5) granularidad = actividad hoy, tarea con D-21; (6) guardrail sin mecanismo declarado no es guardrail; (7) autonomía CSA L0-L5 derivada del riesgo del puesto, default L1-L2; (8) EU AI Act Annex III 4(b) resuelto por el camino agregado (CK-24 ya nos había puesto ahí). SOTA: negativo limpio en ~20 productos + Challenge C1 del *Agentic BPM Manifesto* (Information Systems, 2026). D-19/D-20/D-21 + M46; SOTA archivado en `docs/research/organization-as-code/09` (DTO desde el Market Guide primario + la cita de The Open Group que defiende el sustrato as-code) y `10` (arnés-as-code: anatomía, gobernanza, identidad, autonomía CSA). Barrido de coherencia: "9 entidades" stale corregido a 12 en 7 archivos vivos (CLAUDE.md, 2 reglas, seam, arquitectura.yaml, M32, contrato del método). | CK-30 |
| 2026-07-24 | El twin es un cerebro que compila trabajo: tesis unificadora (una doctrina, tres escalas — el arnés = vista generada del twin por puesto, compilada por Arnesia, entregada por Colab Studio); twin = estructura (12 entidades) × conocimiento (know-how/data histórica, gateado F3, conectado — los arneses saben dónde buscar) × pulso (N16); fin-estado: el colaborador orquesta agentes, no ejecuta; Cockpit = cabina del cerebro. Aclaración repos: cada app en su repo (consultio existe; colab-studio por crear); en cockpit solo historias. Fix stale 9→12 entidades en VISION. | CK-29 |
| 2026-07-29 | El nivel Directorio es de primera clase y Cockpit LEE el libro contable, jamás lo reexpresa: (1) auditoría sin defender lo hecho — el nivel 1 gobernaba la ejecución de la estrategia (segunda mitad de la agenda) y no tenía resultado, caja, presupuesto ni acuerdos; la bandeja configuraba el propio modelo y la apuesta prometía plata sin cobrarla nunca (el "sin ancla de valor" cometido arriba); (2) la página pasa a ser la SESIÓN en 4 movimientos (cómo nos fue · a dónde vamos · qué puede impedirlo · qué decidimos); (3) frontera firmada: se leen cifras con estado de cierre y se BAJAN al proceso que las produce — no se arman estados financieros, no se corre el cierre, no se emite opinión; el código de la norma vive sólo en la ficha, como procedencia (gate en la suite); (4) el puente libro↔operación con su caso testigo: avance declarado > real ES el input de la valorización de lo construido — indetectable para un sistema contable; (5) la generalidad se declara (equivalencias por industria; `inversion.tipo` es el único campo del rubro); (6) el UMBRAL de facultades es lo que hace que la bandeja no se vacíe. Materializado el mismo día: M55-M59 + M52/M22/M16 enriquecidas (catálogo 59) · D-24…D-30 (schema 20 nodos) · mockup v18 (34/34) · contrato de build `dossier/08`. Pendiente de firma: promoción de M52 horizonte→ancla. | CK-31 |
| 2026-07-29 | El directorio decide, la gerencia resuelve — la corrección de fondo que CK-31 dejó pendiente: (1) auditoría de la estrategia contra el método, 40 hallazgos K1-K40 con foco en indicadores y madurez; (2) **la bajada es dato** (D-35): la meta del directorio se abre como meta de una gerencia con su rol, y el catchball se cierra contra una sesión — «sin bajar» y «asignada sin acordar» se derivan del grafo y llegan solas a la bandeja; (3) **el hilo ancla al contrato, no al objetivo** (cierra A2 · D-34): el valor del KR se LEE de la serie, y «caja sana» deja de leerse verde con la caja bajo el piso — el gris pesa por encima del verde; (4) **una escalera nunca viaja sin su vara** (D-32/D-33): muere `area.madurez` (se deriva), sin nivel deseado no hay brecha, y la autoevaluación del sistema de gestión gana ficha, evidencia y sesión; (5) **la vara externa sale del eje vertical** (D-31): el tablero afirmaba un rango de cobranza que el propio método prohíbe afirmar; (6) **lo que baja a lo táctico** (permiso explícito del operador): portafolio completo, detalle de alertas, avance de inversiones y seguimiento semanal de acuerdos — el nivel 1 sigue por excepción y cada fila dice por qué sube; (7) **M52 promovida horizonte→ancla** (cierra la firma pendiente de CK-31). Materializado: D-31…D-36 (40 acciones · 16 invariantes nuevos) · 6 cartas enriquecidas · nichos 17→19 · mockup v19 con suite 40/40 (6 checks nuevos). Abierto con dueño: 12 filas del tablero K, la más cara K33 — M55-M59 sin un solo paso de proceso. | CK-32 |
| 2026-07-29 | Cada metodología dice en qué piso se usa — el eje **nivel** (contrato v3→v4) + el dialecto brasileño completo: (1) el operador pide "saber dónde usarlo, separando directorio/estratégico/táctico/operativo" — el catálogo sabía QUÉ toca una carta (objeto) y CUÁNDO del engagement (módulo), no en qué piso se usa, y lo sabía a medias en prosa (5 cartas de gobierno decían "encuadre del nivel directorio" dentro de un campo de texto infiltrable); (2) `nivel_primario` (donde se DECIDE/FIRMA lo que produce) + `niveles_secundarios` (los pisos que la consumen), rótulos del GLOSARIO, **obligando a nombrar el ancla** — el eje no admite "aplica a todo"; (3) NO es `nivel_acceso` (N13): misma escalera, aquél gobierna quién VE el dato, éste dónde se usa el método; (4) ortogonal a objeto/módulo/dimensión-twin — cuatro preguntas, cuatro ejes; (5) **M60 MEG/FNQ** (la vara brasileña de madurez, linaje Baldrige/PNQ — el par de M41 para la madurez; se LEE el ciclo del cliente, no se corre uno, y 9004 sigue siendo el default: una escalera por dimensión, D-32); (6) **M61 OBZ** (base cero — M57 guardaba el reparto ya armado, faltaba el CÓMO; su aporte real es el **dueño del paquete**, no la planilla; un solo presupuesto en el twin); (7) corrección de alcance sin card: «Brasil = GPD» vale para el **privado** — en el Estado brasileño manda el BSC (M30 ⇄ M41 + research). Materializado: las **61 cartas** con piso asignado bajo regla escrita (13 D · 16 E · 18 T · 14 O) · `GRAFO §6` generado + nivel como **primer filtro** de ruteo en `/metodo` · gate verde 0 error, cero asimetría nueva. Deja ver: Directorio tiene 13 anclas y **cero pasos de proceso** (K33 de CK-32 por el otro eje). | CK-33 |
