# Cockpit — Visión de producto

> Norte vivo del producto. Esta visión es **estática** entre firmas — evoluciona por ficha explícita
> del [`LEDGER.md`](./LEDGER.md) (`CK-NN`), nunca por edición silenciosa.
> Este repo nació de la graduación de la célula P1 del monorepo `prenter-harness` (2026-07-06,
> ficha ecosistema en `tooling/strategy/LEDGER.md` del monorepo). La historia CK-01..CK-08 (fundación,
> extracción Stage 1-4) vive allá, congelada, como fuente del port; aquí arranca en **CK-10**
> (CK-09 = la ficha de graduación, escrita del lado viejo).

## Identidad

Cockpit es el sistema para el **levantamiento, diseño, creación, propagación/adopción, monitoreo
y mejora continua** de los cuatro objetos que sostienen a cualquier empresa:

- **Procesos** — qué se hace de verdad (AS-IS) y qué debería hacerse (TO-BE).
- **Roles** — quién tiene autoridad y responsabilidad sobre cada proceso.
- **Objetivos** — qué resultado persigue cada rol/área y cómo se mide.
- **Personas (puestos)** — quién ejecuta, con qué arnés/capacidad, y qué le falta.

El eje es **gestión empresarial basada en buenas prácticas de normas ISO** — no como aparato de
certificación, sino como **ontología y disciplina operativa** (ver §ISO más abajo). La tesis
fundante es **Organization as Code** (CK-21): la organización entera vive como **dato versionado
en git** y evoluciona hacia un **Organization Twin** operable (§siguiente). Se entrega **hosteada
por nosotros** (single-tenant por cliente, suscripción) como default comercial, o **instalada en
la infraestructura del cliente** como tier enterprise/regulados (modelo físico CK-18 «Fábrica +
Organización instalada», default comercial CK-21 — ver §Arquitectura y `sistema/arquitectura/NODOS.md`).

**Core del sistema:** acompañar a la empresa mediante la **ingesta de datos de múltiples
fuentes** (sistemas manuales, documentos, interfaces conversacionales) para modelar su estado
actual, proyectar su estado ideal, y accionar la brecha.

**Flujo de valor (heredado de CK-01, elevado a loop en CK-21):** los datos ingeridos **modelan el
estado actual (As-Is)** → se **proyecta el estado ideal (To-Be)**, informado por las buenas
prácticas ISO y las metodologías de proceso/rol/objetivo (§Pilares) → de esa **brecha** se generan
los **proyectos de desarrollo y necesidad** — que pueden resolverse con arneses por puesto (P3 ·
Kit, fabricados en Arnesia/P4) o con software a medida (P2 · DevStudio, también en manos de los
devs del cliente). La brecha **no es un entregable puntual de consultoría: es un loop permanente**
— el twin la recalcula continuamente contra la operación real (drift organizacional, §Twin).

**Fin-estado del trabajo (CK-29, invertido en CK-30):** con el twin lleno, **las personas supervisan
a los agentes — no los agentes ayudan a las personas.** El colaborador no ejecuta el trabajo: dirige
la intención, aprueba las excepciones, mide la eficiencia, mejora su propio arnés y propone
proyectos. El trabajo lo hacen los **agentes** = Colab Studio (N17) con Claude Code detrás + los
arneses a los que se le dio permiso, **todos conectados al cerebro de la organización, que es el
twin**. Cockpit es la cabina de ese cerebro: hace que cada pieza — dato, decisión, arnés, proyecto —
llegue en su momento, y mide si llegó.

**Y la supervisión no se declara: se especifica y se mide (CK-30).** Cada arnés declara *qué* debe
verificar el humano, *con qué evidencia* y *en cuánto tiempo*; el twin mide si ocurrió. Un arnés que
sólo dice "hay supervisión humana" construye una **zona de deformación moral** — el trabajador
absorbe la culpa de un sistema que no puede vigilar de verdad (Elish · Green). Ratio de anulación en
cero durante meses = **brecha**, igual que un KPI fuera de banda: el loop del producto aplicado a sí
mismo. Corolario técnico: un guardrail escrito en prosa **no es un guardrail** — la regla la hace
cumplir el runtime (permiso · hook · sandbox), nunca el prompt.

**El trabajo se compila por rol × proceso (CK-30).** Tres unidades que no se confunden:
`persona ─ocupa→ **puesto** ─agrega→ **rol** ─carril/RACI→ actividad ⊂ proceso`. El arnés **se
compila** por rol×proceso (dato puro del twin), **se ensambla** por puesto (roster de N arneses — el
puesto ejecuta N roles), y **se instala y corre** por persona (su runtime, su licencia, su
telemetría). La frontera CK-24 cae exactamente entre *entregar* y *correr*: el twin mide puesto, rol,
proceso y área — nunca persona.

**Una sola doctrina, tres escalas (CK-29):** la visión del producto, el método que vende y nuestra
forma de trabajo son la MISMA máquina — organización como codebase: SSoT versionada → vistas
generadas (dashboards, docs, **arneses**) → gates anti-drift; nada se borra (se invalida con firma);
el LLM propone, el humano con autoridad dispone. Nuestro cerebro de trabajo (`sistema/metodo/`) es
el prototipo 1:1 del cerebro que el twin le da a cada cliente
(`docs/research/cerebro-conocimiento/03-proyeccion-twin.md`). Un pedido que no quepa en esta
formulación se cuestiona antes de construirse.

## Organization as Code → Organization Twin (decisión CK-21)

La visión con nombre propio — el término está libre en el mercado; la categoría externa para
analistas es **DTO** (Digital Twin of an Organization, Gartner). SOTA completo + lista TO-BE de 37
capacidades en [`docs/research/organization-as-code/`](./docs/research/organization-as-code/).

- **Organization as Code (la tesis):** procesos, roles, objetivos, personas/puestos y funciones
  viven como **dato versionado en git** (el objeto normalizado, 21 entidades — schema v2 · CK-26 · D-23 · D-24..D-29 · D-38 — + provenance
  `fuente`+`conf` por hecho); todo cambio viaja por **propuesta → revisión → merge** con tres
  entornos (**dev → UAT → prod**: borrador / aprobado / vigente por gerencia) — la Gestión de
  Cambios ISO es ese pipeline con UI que oculta git.
- **Organization Twin (la fórmula):** `Twin = estado deseado (N6) × estado real (N16) × brecha
  continua (N13)`. Es **GitOps organizacional**: el repo declara el deber-ser, el lakehouse observa
  el ser, Cockpit reconcilia y muestra el **drift**, y los proyectos de mejora son los
  controladores que cierran la brecha.
- **El diferenciador (hilo de oro medido):** mapear, visualizar y monitorear **desde los objetivos
  del directorio hasta el último nivel** — objetivos → OKRs por nivel → KPIs cruzados por
  proceso/rol/persona, con semáforo y drill-down. Detectar dónde mejorar debe ser **obvio**: cada
  brecha lleva costo estimado + ranking ROI, y el **proyecto de mejora nace y vive su ciclo
  completo dentro de la solución** (brecha→proyecto→ejecución→KPI movido — nadie del mercado
  cierra este loop en la misma herramienta). Los **arneses por puesto** (Colab Studio) conectan el
  trabajo diario de todos con ese hilo: cada puesto opera apuntando al OKR de su nivel.
  Posicionamiento: **el twin de ejecución estratégica** — "del objetivo del directorio al clic del
  analista, y de vuelta".
- **Ontología operable (doctrina Palantir adoptada):** las 21 entidades son la capa **semántica**;
  CK-21 agrega la capa **kinética** — acciones válidas por entidad (quién modifica qué, con qué
  aprobación) declaradas en `objeto.schema.yaml`. Twin que solo se lee = foto; con acciones =
  volante. Naming navegable por agentes, anti-patterns vigilados, historia = git
  (ver `docs/research/organization-as-code/04-doctrina-ontologia-palantir.md`).
- **El twin es un cerebro que compila trabajo (CK-29):** tres cuerpos — **estructura** (las 12
  entidades del objeto), **conocimiento** (know-how + data histórica de la organización:
  `conocimiento/<proceso>/<rol>/` en N6, files-first, gateado a F3 — no se construye antes de
  demanda, pero los arneses nacen sabiendo dónde buscar) y **pulso** (la operación real, N16). De
  ese cerebro **Arnesia (N15) compila los arneses por puesto** — cada uno con su rebanada del hilo
  de oro (objetivos), sus guardrails (por dónde no ir) y el GRAFO de su organización como índice —
  y **Colab Studio (N17)** los entrega al día a día. El arnés es la **vista GENERADA del twin para
  un puesto** (la misma tríada SSoT→vista→gate de los ejes as-code): jamás se edita a mano, se
  recompila cuando el twin cambia.
- **Horizontes gateados (anti-especulación, precedente CK-10):** (1) what-if estructural — branch
  del repo = escenario comparable; (2) simulación de procesos con estándares (BPSim/DEMO, no
  inventar); (3) **ensayo del TO-BE con agentes LLM corriendo los arneses de cada rol** — nuestros
  arneses son a la vez tooling de producción y actores de simulación, la jugada que ningún vendor
  DTO/EA puede replicar. Nada de esto se construye antes de que el twin base exista y haya demanda.

## Los cuatro pilares

Cada pilar tiene metodologías de respaldo ya investigadas y curadas en
[`sistema/metodo/`](./sistema/metodo/) (portadas desde el catálogo de 31 fichas del monorepo,
filtradas a las que aplican a gestión empresarial — se dejaron atrás las de construcción de
software, que son dominio de DevStudio/Kit):

| Pilar | Pregunta que responde | Metodologías de respaldo |
|---|---|---|
| **Procesos** | ¿Qué hacemos de verdad, y qué deberíamos hacer? | BPMN (notación) · APQC PCF (taxonomía universal, "el esqueleto para no perderse") · Event Storming (AS-IS por eventos) · Value Stream Mapping (desperdicio, future-state) · Service Blueprint (frontstage/backstage) |
| **Roles** | ¿Quién tiene autoridad y responsabilidad? | RACI · ISO 9001 cl.5.3 (roles y autoridades) |
| **Objetivos** | ¿Qué perseguimos y cómo lo medimos? | OKR · Hoshin Kanri (cascada estrategia→área) · Balanced Scorecard · COBIT 2019 (goals cascade + niveles de madurez 0-5, "el semáforo del gap") |
| **Personas / puestos** | ¿Quién ejecuta, con qué capacidad, y qué le falta? | Process/Task Mining (descubre el proceso real desde el trabajo) · el catálogo de arneses por puesto (P3 · Kit, externo) · vocabulario de capital humano (ISO 30414) |

Transversal a los cuatro: **ArchiMate/TOGAF** (mapeo negocio↔aplicación) y **Business Capability
Modeling** (mapa de capacidades + heatmap de gaps) — el lenguaje común que conecta procesos, roles
y sistemas en una sola vista para el Directorio.

**This Is Service Design Doing** es el método con el que Cockpit se diseña A SÍ MISMO (mapa de
actores → persona → journey map → service blueprint → interfaces) — no es una metodología que el
producto le enseñe al cliente, es la disciplina interna con la que cada pantalla nueva se
justifica antes de construirse (ver `sistema/metodo/SERVICE-DESIGN.md`).

## ISO — marco entre ambos (decisión CK-10)

El precedente heredado (`I-05` del monorepo, "roba la ontología, rechaza el aparato") sigue vigente
como **columna vertebral**: de ISO 9001 tomamos el vocabulario de contexto (cl.4), roles/autoridad
(cl.5.3), objetivos (cl.6.2) y mejora continua vía PDCA (cl.10); de ISO 30414 tomamos vocabulario de
capital humano para el pilar Personas. Esto se usa como **estructura del dato** (`negocio.schema`,
§Arquitectura), no como checklist de auditor.

**Decisión CK-10 (ampliación sobre I-05):** Cockpit declara, además, una capability **futura**
de "preparación para auditoría" — un módulo que compara el estado modelado del cliente contra
las cláusulas de la norma y reporta gaps — sin construir el aparato de certificación/control
documental completo. Es una capability `estado: pendiente` en
`sistema/arquitectura/arquitectura.yaml` desde el día uno: se activa cuando exista demanda real
de un cliente que la pida, nunca antes (disciplina
anti-código-especulativo, heredada del monorepo). El sistema **nunca** emite certificados ni
sustituye a un auditor — el veredicto I-05 sigue rigiendo el límite.

## Roles (heredado de CK-01, ampliado CK-18)

Cockpit sirve a **toda la organización por niveles de acceso** (CK-18): **Gobernanza** (Directorio),
**Estratégico** (C-level/gerencias), **Táctico** (jefaturas), **Operativo** (analistas/usuarios). Cada
nivel ve lo que su rol permite, en coherencia con la estructura del Repositorio Oficial.

- **Gobernanza / Directorio** — el mapa vivo de la organización: objetivos, cumplimiento, drill-down.
  Vivo hoy (Visualización).
- **Niveles Estratégico/Táctico/Operativo** — cada uno su rebanada. Declarados, placeholder en el
  shell hasta que existan los niveles de acceso reales (BL-12, sube a alta).
- **Consultor** (transferible) — construye el sistema de la organización con **Consultio** (N14, clon
  de DevStudio sobre Claude Code) y lo publica al Repositorio Oficial. Rol transferible: inicia siendo
  persona de Prenter, luego lo hereda un **Analista de Calidad del cliente** (N19), que mantiene lo
  oficial con la Gestión de Cambios (§ISO).

## Arquitectura — Fábrica + Organización (CK-18) · default comercial hosteado (CK-21)

Modelo físico **CK-18**: una **fábrica de software** que construye el sistema operativo de la
organización. El método **se entrega al cliente** empaquetado en arneses (protección = licencia +
contrato). **CK-21 fija el default comercial:** la "Organización" corre **hosteada por nosotros,
single-tenant por cliente** (instancia aislada Forgejo + Cockpit + lake, suscripción — cero
consultoría de infra antes del valor); instalada en la red del cliente = **tier
enterprise/regulados**; multitenant real = fase 2 (>10-20 clientes). Consecuencia asumida: en el
default hosteado los datos del cliente residen en nuestra nube bajo DPA (aislamiento por instancia,
cifrado; BYOK para tier alto) — la promesa "transitan, no persisten" pertenece al tier
self-hosted. Tres planos — ver `sistema/arquitectura/NODOS.md` (16 nodos, SSoT) +
`despliegue.html` + `docs/research/{rediseno-total,organization-as-code}/`:

- **Plano del Fabricante (nuestro):** **Arnesia (N15)** fabrica los arneses por rol-en-proceso;
  **Repositorio Maestro (N2)** guarda método + arneses plantilla + código; **Distribución + Portal
  (N3)** — CK-21 lo asciende a producto: login, cobro, gestión de usuarios/asientos, descargas de
  las apps, licencias por asiento con **fingerprint compuesto** (no MAC), releases firmadas,
  telemetría. No razona en runtime.
- **Plano de la Organización (una instancia por cliente — hosteada por nosotros o en su red):**
  **Cockpit (N13)** — Visualización + **motor de indicadores** (operación→KPI→OKR→objetivo, el hilo
  de oro medido) + **ciclo brecha→proyecto** + **Gestión de Cambios** (ISO) + niveles de acceso;
  binario propio `directorio` (Go, 4100), la Visualización base ya construida y verificada
  standalone. **Repositorio Oficial (N6)** — git confidencial (Forgejo), SSoT de la estructura, con
  entornos dev→UAT→prod (branches+tags). **Data Lakehouse (N16)** — dlt + DuckLake, reúne la
  operación de todos los sistemas (N18) y nutre el twin ("cómo vamos día a día"). **Depósito
  (N12)** — crudo transitorio.
- **Edge (apps sobre Claude Code local, BYO licencia):** **Consultio (N14)** — App del Consultor;
  **primer entregable (CK-21): los arneses del método M1-M3 sobre Claude Code pelado, sin app
  shell** (desbloqueado de la espera a DevStudio); construye el mapa completo (objeto normalizado +
  documentos + arneses) con preview local de Cockpit y lo **publica a N6** ("deploy de procesos");
  transferible al Analista de Calidad. **Colab Studio (N17)** — app del trabajador operativo
  (arneses por puesto = el "knowledge augmentation" del twin, ejecutable). **DevStudio (N5)** —
  también a devs del cliente. **N8** motor común.
- **Muertos (CK-18):** el Motor de Discovery server-side (N1) renace como arneses; la voz (N4) se
  difiere; los agentes efímeros (N7) mueren — **todo el levantamiento es vía consultor**.

## Ecosistema (contrato, no implementación — el detalle de cada producto vive en SU repo)

- **P2 · DevStudio** (`~/Proyectos/dev-studio`) — app de escritorio del ciclo de desarrollo
  (CTO/dev/devops/PO). CK-18: se **entrega también a los devs del cliente** para construir su sistema
  a medida; es el linaje del que se **clona Consultio** (N14). Sistemas separados, sin import cruzado.
- **P3 · Kit** (`~/Proyectos/harness-repo`, graduado) — el catálogo de arneses por puesto: el
  entregable del pilar Personas, respuesta a una brecha detectada.
- **P4 · Arnesia / Harness Studio** (`~/Proyectos/harness-studio`) — **la fábrica de arneses (N15,
  ascendida en CK-18)**: produce y versiona los arneses por rol-en-proceso que cargan Consultio,
  Colab Studio y DevStudio; se entrega al cliente para que mantenga los suyos. Es pieza central del
  Plano del Fabricante, no ya un plano de talento aparte.
- **Consultio** (`~/Proyectos/consultio`) — App del Consultor (N14), app fina sobre `studio-core`
  (CK-25). **Colab Studio** (repo por crear) — app del trabajador (N17). Como todo el ecosistema:
  cada app vive en SU repo, sin import cruzado; en este repo viven solo sus historias
  (`docs/product/stories/{consultio,colab-studio}/`), jamás su código (aclaración CK-29).

## Estado heredado al graduarse (2026-07-06)

Todo Stage 1-4 (CK-02, CK-05, CK-06, CK-07/CK-08 en la historia congelada) migrado y **verificado
standalone en este repo**: modelo de portfolio (`ui/lib/portfolio.ts`, 25 tests), módulo Go propio
(`go/`, handlers `/api/portfolio`+`/api/negocio`), vistas + shell propio (`ui/components/`), runtime
propio (binario `directorio`, sin dependencia de ningún otro binario). La investigación heredada se
**destiló a `sistema/`** y se borró (cierre BL-07: schema+fixture+`metodologia/`+`DECISIONES.md` →
`sistema/schema/`, `SERVICE-DESIGN.md` → `sistema/metodo/`); la investigación viva es
[`docs/research/rediseno-total/`](./docs/research/rediseno-total/) (SOTA del rediseño CK-18).

**No migrado deliberadamente (doctrina "cero data de cliente" — I-39 del monorepo):** el mockup
visual real del deal Prospera y su pricing/deck comercial siguen en
`prenter/clientes/prospera/` (repo hermano, EMPRESA) — se referencian, no se copian. Lo que SÍ
viajó de ese material es la versión ya genérica/ficticia (persona "Mateo Salas /
Inmobiliaria Vértice") usada en `sistema/metodo/SERVICE-DESIGN.md`, `sistema/schema/ejemplo-vertice.yaml`
y `sistema/metodo/proceso/_sample/`.

## TBD — huecos abiertos

Desde CK-19, el detalle, estado y prioridad de TODO lo pendiente viven en
[`docs/product/`](./docs/product/) (historias `idea/refined/ready` — SSoT del qué-construir).
Aquí queda solo el porqué estratégico de los huecos mayores:

- **El MVP del twin (CK-21)** — la secuencia mínima vendible: método como arnés (Consultio v0,
  sin app shell) → schema v2 (OKR/KPI/Proyecto + capa kinética + hilo de oro) → instancia hosteada
  single-tenant (N6 dev→UAT→prod + Gestión de Cambios v0) → Cockpit con hilo de oro medido +
  brechas costo/ROI + ciclo brecha→proyecto → ingesta Excel + 1 conector real. Detalle:
  `docs/research/organization-as-code/07-capability-list-tobe.md`.
- **Re-fichado de NODOS pendiente de CK-21** — chequeo 2 (soberanía → default hosteado), N3
  (portal/licencias), N13 (motor de indicadores + ciclo brecha→proyecto), N14 (primer entregable
  = arneses v0), N16 (default D3 invertido). Las decisiones ya están firmadas en CK-21; falta
  bajarlas a las fichas de nodo restantes con el gate en verde.
- **Comprador con nombre y cara, pricing, éxito a 12 meses** — heredado de CK-01, sin gate
  bloqueante (I-71 lo derogó); con CK-21 el paquete comercial es: suscripción a la instancia
  hosteada + licencias por asiento (portal N3) + arneses por puesto + contrato de mantenimiento.
- **Proyección generada de negocio.yaml** (historia `sistema/negocio-yaml-proyeccion-generada`) —
  último tramo de la convergencia D-13.

## Gestión

Desde CK-19 (arnés `harness@prenter-marketplace`) + CK-28 (árbol `docs/` unificado):

- **Trabajo pendiente** — historias del arnés en [`docs/product/stories/`](./docs/product/stories/)
  (SSoT del qué; releases en `docs/product/releases/`, mapa en `docs/product/README.md`).
- **Decisiones** — fichas `CK-NN` en el [`LEDGER.md`](./LEDGER.md) de este repo (continúa la
  numeración de la célula original — CK-10 en adelante).
- **Capabilities funcionales** — [`docs/product/capabilities/`](./docs/product/capabilities/)
  (YAML por capability) — solo lo verificado en vivo.
- **Histórico pre-arnés** (backlog BL-NN + increment CAP-NN, congelados) —
  [`docs/product/_archive/`](./docs/product/_archive/); correspondencia lossless en
  [`docs/product/MAPEO.md`](./docs/product/MAPEO.md).
