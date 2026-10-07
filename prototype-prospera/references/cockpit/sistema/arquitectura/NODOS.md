# Nodos del diagrama de despliegue — fichas de arquitectura

> **Qué es:** la definición a nivel arquitecto de cada **nodo** del diagrama de despliegue
> ([`despliegue.html`](despliegue.html)). Cada ficha permite un *drilldown* para entender el sistema
> antes de bajar a funcionalidades. Insumo para volver al diseño de servicio (backstage/endpoints) con
> los límites ya claros.
> **Docs base:** [`ARCHITECTURE.md`](prtProspera/prototype-prospera/references/cockpit/docs/architecture/producto/ARCHITECTURE.md) (visión CTO, histórico) · [`METODOLOGIA.md`](METODOLOGIA.md) · SOTA del rediseño en [`../../docs/research/rediseno-total/`](../../docs/research/rediseno-total)
> **Última actualización:** 2026-07-17 — **CK-25, Consultio no se clona.** N14 re-fichado: "clon de
> DevStudio" → **app fina sobre `studio-core`** (kernel Go compartido, extraído de N5 por disciplina
> upstream-first — ban de mirror producto→producto); madurez no-construido → **existe (parcial)**
> (`studio-core` v0.1.0/SC-01 + `consultio` primitivo/CN-01, live-verify en vivo: engagement→repo git,
> arnés instalado, sesión ligada, turno con SSE). Riesgo abierto (2) de N5 ("cómo se clona Consultio")
> **cerrado**. N5 intacto (V6). Plan: `docs/product/plans/consultio-studio-core/`.
> **Actualización previa:** 2026-07-17 — **re-fichado fino** (historia `arquitectura-refichado-ck21`,
> F1.0): R-walk pasa a **R1–R17** (R9 se parte: R9 canal técnico + **R16 puerta comercial** del Portal;
> **R17** = brecha continua + ciclo brecha→proyecto en N13 — el diferenciador D2 con dueño); residencia
> **por tier** bajada a las fichas N6/N13/N16/N12 (chequeo 2); N6/N16 marcados como estado DESEADO/REAL
> del twin; Consultio v0 sin residuo "espera al clon"; pendientes consolidados refrescados al roadmap
> CK-22/CK-23. Frontera métricas de persona = **CK-24**.
> **Actualización previa:** 2026-07-16 (**CK-21**) — **Organization as Code → Organization Twin.** La
> visión toma nombre (twin = estado deseado N6 × estado real N16 × brecha continua N13; hilo de oro
> objetivos→OKR→KPI; ciclo brecha→proyecto dentro de la solución). **Default comercial invertido (D3):
> la Organización corre hosteada por nosotros, single-tenant por cliente**; en la red del cliente = tier
> enterprise/regulados; multitenant = fase 2. N3 asciende a **Portal** (login/asientos/licencias por
> fingerprint compuesto — no MAC). N13 suma **motor de indicadores** + **ciclo brecha→proyecto**
> (declarados). N14 v0 = **arneses del método sin app shell**. Chequeo 2 reescrito. SOTA + TO-BE (37
> capacidades): `docs/research/organization-as-code/`. (La deuda "re-fichado fino" se pagó el 2026-07-17, ver arriba.)
> **Rediseño previo:** 2026-07-08 (**CK-18**). El modelo pasa de "BYOC con
> motor server-side" a **Fábrica de software (Plano del Fabricante) + Organización instalada**. El método
> **se entrega al cliente** empaquetado en arneses (deroga el límite de IP "el método nunca al cliente").
> **Mueren:** N1 (Motor de Discovery como servicio → renace como arneses), N4 (voz, diferida), N7
> (agentes efímeros → todo el levantamiento es vía consultor). **Nacen:** N15 (Arnesia, fábrica de
> arneses), N16 (Data Lakehouse), N17 (Colab Studio), N18 (sistemas operacionales de la org), N19
> (Analista de Calidad). **Re-fichados:** N2 (Repositorio Maestro), N3 (+licencias), N6 (Repositorio
> Oficial confidencial, ya no GitHub), N13 (Cockpit = Gestión de Cambios + Visualización + niveles de
> acceso), N14 (Consultio, clon de DevStudio), N11 (los 4 niveles de la organización). Historia previa
> (CK-14/15/16/17) en el LEDGER.

---

## Cómo leer este documento

**"Nodo"** = cada elemento fichado del diagrama. Convención UML: el campo **`tipo`** lleva la precisión
(en UML estricto un "nodo" es el ≪device≫/≪execution environment≫ y lo que corre encima es ≪artifact≫;
acá usamos "nodo" como término de trabajo y `tipo` desambigua).

**Campos por tipo** (distinto tipo, distinto drilldown):
- **Núcleo común** (todo nodo): `objetivo` · `resumen` · `plano·tipo·madurez` · `responsabilidades/no_objetivos` · `comunicacion` · `depende_de/consumido_por` · `riesgos_abiertos`
- **servicio / exec-env:** + `stack` · `expone` · `estado+persistencia` · `escala+disponibilidad` · `integraciones_externas` · `seguridad` · `nfr/cumplimiento_progresivo`
- **artefacto / dato:** + `formato` · `propietario+clasificacion` · `residencia+retencion` · `versionado` · `quién_escribe/quién_lee`
- **runtime edge:** + `runtime+licencia` · `qué_construye/contra_qué` · `local_vs_remoto` · `seguridad`
- **actor:** + `objetivo_del_actor` · `permisos/RACI` · `interfaces_que_usa` · `momentos`

**Madurez:** `existe` · `existe (parcial)` · `no-construido`.

**Los tres planos (CK-18):**
- **Fabricante** — nuestro (Prenter). Fábrica de software: construye, versiona, firma y distribuye. **No razona en runtime.** Aquí vive lo que mantenemos y actualizamos (método, arneses plantilla, código, canal de releases).
- **Organización** — del cliente, en su red. Lo instalable en la empresa + sus sistemas operacionales. Sus datos viven aquí.
- **Edge** — máquinas de humanos (consultor, trabajador, developer). Apps instalables sobre Claude Code local (BYO licencia). Una sola mecánica; cambian los arneses según el puesto.

---

## Índice de nodos

| # | Nodo | Plano | Tipo | Madurez | Marca |
|---|---|---|---|---|---|
| **N15** | Arnesia — fábrica de arneses | Fabricante | servicio/exec-env | existe (parcial) | ★IP |
| **N2** | Repositorio Maestro (método + arneses + código) | Fabricante | artefacto/dato | existe (parcial) | ★IP |
| **N3** | Portal — distribución + telemetría + licencias | Fabricante | servicio | no-construido | — |
| **N6** | Repositorio Oficial (confidencial, residencia por tier) | Organización | artefacto/dato | no-construido | ★datos |
| **N13** | Cockpit — Gestión de Cambios + Visualización | Organización | servicio/exec-env | existe (parcial) | — |
| **N16** | Data Lakehouse | Organización | servicio/dato | no-construido | ★datos |
| **N12** | Depósito de fuentes (landing zone) | Organización | artefacto/dato | no-construido | ★datos |
| **N18** | Sistemas operacionales de la organización | Organización | sistemas fuente | existe | ★datos |
| **N14** | Consultio — App del Consultor | Edge (máquina del consultor) | runtime edge / exec-env | existe (parcial) | ★IP |
| **N17** | Colab Studio — app del trabajador | Edge (máquina del trabajador) | runtime edge / exec-env | no-construido | — |
| **N5** | DevStudio — app de desarrollo (P2) | Edge (máquina del developer) | runtime edge / exec-env | existe (parcial) | — |
| **N8** | Runtime de agente local (Claude Code) | Edge (laptop) | runtime edge | existe | — |
| **N9** | Consultor (transferible → Analista de Calidad) | Edge | actor | existe | — |
| **N19** | Analista de Calidad (del cliente) | Edge | actor | no-construido | — |
| **N10** | Developer (del cliente) | Edge | actor | existe | — |
| **N11** | Usuarios de la organización (4 niveles) | Edge (thin) | actor | existe | — |

---

## Responsabilidades del sistema — R1–R17 (el responsibility-walk)

> El flujo **objetivo → operación viva**, una responsabilidad por eslabón, con su nodo dueño. Es
> **cómo se asignó cada nodo** (recorrer el flujo, no ir nodo-por-nodo). Cada `[R#]` en las fichas
> **resuelve a esta tabla** (lo valida `gen_arquitectura.py`, ref-check). Etapas: E1 = Levantamiento ·
> E2 = Construcción del sistema (mapa + arneses + publicación) · E3 = Operación y mejora continua.
> Rediseñado en CK-18: el levantamiento y la construcción los conduce el **consultor** vía Consultio
> (N14) sobre su Claude Code (N8) — desaparecen el motor server-side (N1) y los agentes efímeros (N7).

| R | Responsabilidad | Nodo(s) dueño | Etapa |
|---|---|---|---|
| **R1** | Bajar objetivos/OKR del directorio + autoridad (RACI) — el encuadre | N11→N9 | E1 |
| **R2** | Recolectar y curar las fuentes crudas → depositar | N9→N12 | E1 |
| **R3** | Aterrizar / retener / **destruir** el crudo (landing zone) | N12 | E1 |
| **R4** | Capturar el AS-IS (procesos/roles/objetivos/personas) operando el método | N9 vía N14 | E1 |
| **R5** | Construir el mapa completo — objeto normalizado + documentos oficiales + arneses por rol | N14 | E1/E2 |
| **R6** | Calcular la brecha **inicial del engagement** (TO-BE − AS-IS) + severidad + proyectos semilla | N14 | E2 |
| **R7** | Publicar el resultado ratificado al Repositorio Oficial — "deploy de procesos" | N14→N6 | E2 |
| **R8** | Fabricar/versionar los arneses por rol-en-proceso (la fábrica) | N15 | E2 |
| **R9** | Canal técnico: distribuir releases firmadas + recibir telemetría agregada | N3 | E1/E2/E3 |
| **R10** | Ingerir la operación de todos los sistemas → lakehouse | N18→N16 | E3 |
| **R11** | Cruzar estructura × operación y servirla por nivel de acceso (la vista; el loop de mejora es R17) | N13 | E3 |
| **R12** | Operar el día a día del puesto con sus arneses | N17 | E3 |
| **R13** | Gestionar el cambio del sistema (ISO): solicitar / aprobar / publicar versiones | N19 vía N13 | E3 |
| **R14** | Construir software a medida contra los sistemas de la organización | N5/N10 | E3 |
| **R15** | Ejecutar el trabajo de agente en la máquina del humano firmado | N8 | transversal |
| **R16** | Puerta comercial: login, cobro, gestión de usuarios/asientos, entitlements/licencias revocables | N3 | E1/E2/E3 |
| **R17** | Medir el hilo de oro y sostener la **brecha continua**: ciclo brecha→proyecto→KPI movido (el twin como loop) | N13 | E3 |

---

# FABRICANTE — nuestro (★IP aquí)

## N15 · Arnesia — fábrica de arneses ★IP

> Nodo nuevo (CK-18). Es `~/Proyectos/harness-studio` (P4 del ecosistema), ascendido de "no es fuente
> de datos de Cockpit" (VISION previa) a **la fábrica** que produce los arneses de todo el sistema. El
> operador la nombró la fábrica; las apps del edge (Consultio, Colab Studio, DevStudio) cargan lo que
> Arnesia produce.

- **objetivo** — Ser la **fábrica de arneses**: producir y versionar los paquetes de skills/instrucciones/guardrails que definen **un rol dentro de un proceso**, ejecutables sobre Claude Code. Es donde se construye y evoluciona el activo que vendemos convertido en producto operable — el método deja de ser documento y se vuelve arnés que corre en el puesto.
- **resumen** — Aplicación de la fábrica (nuestra, y entregable al cliente para que mantenga los suyos): edita el Repositorio Maestro (N2), compila el objeto normalizado + el método en `SKILL.md`/plugins por rol, y publica al canal de distribución (N3). Patrón "docs→skills sin drift": el arnés se **compila** desde la fuente, jamás se edita a mano.
- **plano · tipo · madurez** — Fabricante · servicio/exec-env (app de la fábrica) · **existe (parcial)** — el repo P4 existe; falta el pipeline arnés-por-rol contra el objeto normalizado de Cockpit.
- **responsabilidades** — Fabricar/versionar los arneses por rol-en-proceso **[R8]** · compilar doc humano + `SKILL.md` desde la MISMA fuente (objeto normalizado, anti-drift) · empaquetar por rol (skill = procedimiento, plugin = rol, marketplace = mapa de procesos) · entregar los arneses al canal de distribución (N3) para consultores y para el cliente.
- **no_objetivos** — NO opera el engagement (eso es Consultio/N14) · NO razona sobre datos del cliente · NO es multi-tenant server-side · NO edita a mano el artefacto generado (se regenera).
- **stack** — **Agent Skills (estándar abierto, Anthropic oct-2025 / agentskills.io dic-2025)**: `SKILL.md` + `references/` + progressive disclosure; plugin = bundle de skills + MCP + subagentes + comandos (patrón Cowork empresarial, feb-2026). Anti-drift estilo Inkeep (compilar en build-time desde la fuente, gate que rechaza edición del generado). Stack de la app por decidir (BL-15 lo cubre para Consultio; Arnesia comparte linaje P4).
- **expone** — Los arneses compilados hacia N3 (canal de releases) y, en el engagement, hacia el Repositorio de Arneses del cliente (parte de N6).
- **estado + persistencia** — El código y las plantillas de arnés viven en el Repositorio Maestro (N2). Sin estado de cliente.
- **escala + disponibilidad** — Herramienta de fábrica, uso interno + entregable. Si no está disponible, no bloquea al cliente (los arneses ya distribuidos siguen).
- **integraciones_externas** — Claude Code (para probar arneses) · N2 (fuente) · N3 (canal).
- **seguridad** — Es donde vive el know-how del método antes de empaquetarse. Al entregarse al cliente, la protección pasa a **licencia + contrato** (deroga el límite "método nunca al cliente" — ver chequeo 1). Least-privilege contra los repos.
- **nfr / cumplimiento_progresivo** — Versionado semántico de arneses; canal firmado (hereda N3/TUF); trazabilidad de qué versión de arnés corre cada puesto (telemetría N3).
- **comunicacion** — Arnesia → N2 (edita la fuente) · Arnesia → N3 (publica arneses) · Arnesia → N6 (en el engagement, siembra el Repositorio de Arneses del cliente).
- **depende_de / consumido_por** — depende_de: N2 (fuente del método/código), Claude Code (prueba). consumido_por: N14/N17/N5 (cargan los arneses que produce), N3 (los distribuye), el cliente (los mantiene tras la entrega).
- **riesgos_abiertos** — (1) Frontera Arnesia (fábrica) vs Consultio (app del consultor) — qué se construye en cuál. (2) Modelo de entrega/licencia de Arnesia al cliente (¿la mantiene el Analista de Calidad?, ¿con qué límites?). (3) Anti-drift real: gate que rechace arneses editados a mano. (4) Cuánto método baja empaquetado vs se sirve por actualización.
- **fuentes** — [Agent Skills — Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) · [Cowork plugins empresariales](https://claude.com/blog/cowork-plugins-across-enterprise) · [Docs→Skills sin drift — Inkeep](https://inkeep.com/blog/docs-to-agent-skills) · `docs/research/rediseno-total/07-proceso-como-arnes.md`.

---

## N2 · Repositorio Maestro (método + arneses + código) ★IP

> Re-fichado CK-18: era "Playbook + Metodología". Ahora es el SSoT del Fabricante: además del método,
> guarda los arneses plantilla y el código de las apps. El motor de discovery (ex-N1) vive aquí como
> **arneses**, no como servicio.

- **objetivo** — Centralizar como **dato versionado** todo lo que la fábrica mantiene y actualiza: el método (m1·m2·m3), el razonamiento de discovery convertido en arneses, los arneses plantilla por rol, y el código fuente de las apps (Consultio, Colab Studio, DevStudio, Cockpit, Arnesia). Es el activo más valioso: se mejora central y se propaga por releases sin rehacer nada en el cliente.
- **resumen** — Monorepo/repos privados de la fábrica: `process/` (proceso como dato), M-cards, schemas L0, arneses plantilla, y el código de los productos. Fuente de la que N15 compila y N3 distribuye.
- **plano · tipo · madurez** — Fabricante · artefacto/dato · **existe (parcial)**. Existen `sistema/metodo/` (proceso m1/m2/m3, methodologies.yaml, schemas) y el código de Cockpit; falta consolidar los arneses plantilla y el pipeline de compilación (N15).
- **responsabilidades** — Ser SSoT del método + arneses plantilla + código · versionado y auditable · legible por N15 (compilable a arneses) y por humanos · evolucionable con anti-drift (gate `gen_all.py --check`, mismo linaje que CK-17).
- **no_objetivos** — NO contiene datos de cliente · NO ejecuta (es dato; N15 lo compila, el edge lo corre) · NO se entrega crudo al cliente (se entrega el arnés compilado + Arnesia licenciada, no el repo de la fábrica).
- **formato** — Markdown (método/narrativa) + YAML/JSON (`methodologies.yaml`, `process/`, schemas, objeto.schema) + código (Go/TS/…). git.
- **propietario + clasificacion** — **Nuestro (Prenter).** ★IP/know-how — la pieza más sensible. La entrega al cliente es del **arnés compilado**, no de esta fuente.
- **residencia + retencion** — Repos privados de la fábrica (nube/GitHub privado). Persiste con nosotros. Se compila y distribuye; el crudo del método no baja al cliente.
- **versionado** — git + `KIT_VERSION`/semver; schema = contrato; gate anti-drift garantiza que los generados (arneses, docs) no driften de la fuente.
- **quién_escribe / quién_lee** — Escribe: nosotros (fábrica, vía `disena-etapa`, `ledger`, Arnesia). Lee: N15 (compila arneses), humanos (el porqué del método).
- **comunicacion** — No es servicio: N15 lo lee y compila; N3 publica lo compilado. git + API del host privado.
- **depende_de / consumido_por** — depende_de: schemas L0, git. consumido_por: N15 (Arnesia), N3 (distribución).
- **riesgos_abiertos** — Granularidad de qué método baja empaquetado en el arnés vs se sirve por actualización (espejo del viejo riesgo N1/N2) · el método empaquetado en el cliente ya no es "fuerte por arquitectura": la protección es licencia + contrato (ver chequeo 1) · convergencia objeto.schema ↔ negocio.schema (BL-02 cerrado; BL-19 pendiente).
- **fuentes** — `sistema/metodo/` · [Git for Data — DoltHub](https://www.dolthub.com/blog/2020-03-06-so-you-want-git-for-data/) · `docs/research/rediseno-total/07-proceso-como-arnes.md`.

---

## N3 · Portal — distribución + telemetría + licencias

> Re-fichado CK-18 (era "distribución + telemetría"; crece con **licenciamiento**). **Asciende a
> Portal en CK-21/D4:** deja de ser solo canal — es el producto de entrada: login, cobro, gestión de
> usuarios/asientos, descargas de las apps (DevStudio/Colab/Consultio/Arnesia). Licencias por asiento
> con **fingerprint compuesto de máquina — NO MAC** (MAC = spoofeable, inestable en VM/Docker/multi-
> interfaz; SOTA = CPU+disco+placa hasheado SHA-256 client-side, node-locked, activación/
> desactivación, heartbeat — patrón keygen-go ya fichado abajo). El control real de asientos es
> licencia + telemetría, no DRM duro.

- **objetivo** — Ser la **puerta comercial** (portal: login, cobro, asientos, descargas) y el canal técnico: publicar releases firmadas que el edge y los instalables del cliente **jalan**, gestionar los **entitlements/licencias por asiento** (quién tiene derecho a qué, en cuántas máquinas — fingerprint compuesto —, revocable), y recibir **telemetría agregada** opt-in (salud/uso de la flota, nunca datos crudos) — para poder ofrecer mantenimiento sin abrir puertos hacia el cliente.
- **resumen** — El "Plano del Fabricante" operable: canal de releases (binario Cockpit, apps de escritorio, arneses), licencias offline-first, telemetría por pull/push saliente. Dos audiencias: nuestros consultores (siempre) y clientes con contrato de mantenimiento (opt-in; el cliente que se auto-mantiene con su Arnesia no jala nada nuestro).
- **plano · tipo · madurez** — Fabricante · servicio · **no-construido**. Piezas madurísimas (go-tuf v2, Tauri updater, marketplaces de Claude Code, OTel, Ed25519) — el nodo de menor riesgo técnico.
- **responsabilidades** — Publicar releases firmadas (binario + apps + arneses) que el cliente jala y verifica **[R9]** · recibir telemetría agregada (scrubbing) para dashboards de flota **[R9]** · **operar la puerta comercial: login, cobro, gestión de usuarios/asientos, emitir/validar/revocar licencias y entitlements [R16]** · canales (consultores siempre-verde / clientes estable) + rollback.
- **no_objetivos** — NO empuja updates (no inbound; el cliente decide cuándo jala) · NO recibe datos crudos (ni PII ni contenido) · NO es APM ni data warehouse · NO es el mapa de procesos (eso es el marketplace de arneses, contenido, no infraestructura).
- **stack** — **Binario:** go-tuf v2 (v0.7 deprecado) + TUF-on-CI sobre GitHub Actions (caso "baja frecuencia, un mantenedor"; Sigstore lo usa en prod). Fallback: cosign/minisign + Releases. **Apps de escritorio:** Tauri v2 updater (firma minisign obligatoria, pull JSON estático) o Electron autoUpdater si el stack ya es Electron. **Arneses:** marketplace privado de Claude Code por cliente (repo git privado + `marketplace.json`; acceso = credencial del git host, revocar = cortar mantenimiento; pinning por commit SHA). **Licencias:** license files Ed25519 (`crypto/ed25519` stdlib, patrón keygen-go) offline-first; Keygen CE self-host solo a +10 clientes. **Telemetría:** OTLP + mTLS por tenant (OTel Collector en el cliente; routing por tenant). GitHub org privada = plano único.
- **expone** — Repo TUF (`root/timestamp/snapshot/targets.json` + artefactos) por HTTPS · endpoint de licencias (validación offline; opcional online para revocación) · endpoint OTLP/mTLS de telemetría · JSON de updater de apps por canal.
- **estado + persistencia** — Stateful ligero: artefactos firmados en object storage + CDN; claves de firma en HSM/KMS (root/targets offline); telemetría time-series retención corta; registro de licencias/entitlements. No guarda nada por-cliente salvo "tenant X corre versión Y, licencia Z, salud W".
- **escala + disponibilidad** — Trivial (object storage + CDN + un Collector). **Si cae: cero impacto en el cliente** — corre con su versión y reintenta; la telemetría se bufferea/descarta. El nodo más tolerante a fallos.
- **integraciones_externas** — GitHub Actions (TUF-on-CI) · object storage/CDN · KMS/HSM · (opcional) Grafana.
- **seguridad** — Integridad por TUF (firma M-of-N, anti-rollback, resiste repo comprometido) · licencias firmadas Ed25519 · telemetría mTLS por tenant + minimización en origen + scrubbing en el Collector + opt-in · el cliente solo abre conexiones **salientes**.
- **nfr / cumplimiento_progresivo** — Firmas verificables; revocación de licencia por fin de contrato; consentimiento de telemetría por contrato; canal separado consultores/clientes.
- **comunicacion** — Cliente → nodo (releases/licencias): **PULL HTTPS, lo inicia el cliente.** Cliente → nodo (telemetría): **push saliente OTLP/mTLS** (originado en el cliente). El Fabricante nunca disca al cliente.
- **depende_de / consumido_por** — depende_de: object storage/CDN + KMS + pipeline de build (N2/N15). consumido_por: N13 (binario Cockpit), N14/N17/N5 (apps + arneses), el cliente (mantenimiento opt-in).
- **riesgos_abiertos** — (1) Custodia/rotación de claves TUF (ceremonia = sobrecarga para equipo chico → ¿umbral 2-of-3? ¿firma manual por release?). (2) Bug conocido de marketplaces (autoUpdate no refresca `installed_plugins.json`, #52218) — verificar antes de depender de hooks en arneses. (3) Política de auto-update por canal. (4) Lista blanca exacta de métricas + consentimiento. (5) Licenciamiento propio (license files) vs Keygen CE — cuándo migrar.
- **fuentes** — [go-tuf v2](https://github.com/theupdateframework/go-tuf) · [TUF-on-CI](https://github.com/theupdateframework/tuf-on-ci) · [Tauri v2 updater](https://v2.tauri.app/plugin/updater/) · [Claude Code marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) · [keygen-go](https://github.com/keygen-sh/keygen-go) · [OTel Collector + mTLS](https://opentelemetry.io/blog/2025/expose-otel-collector-gateway-api/) · `docs/research/rediseno-total/04-distribucion-licencias-telemetria.md`.

---

# ORGANIZACIÓN — del cliente (★datos aquí)

## N6 · Repositorio Oficial (confidencial, residencia por tier) ★datos

> Re-fichado CK-18: era "Repo del cliente (GitHub)". Ya NO es GitHub — es un **repositorio confidencial
> propio** (Forgejo), con backups. Re-fichado fino CK-21/D3: reside **por tier** — en la instancia
> hosteada por nosotros bajo DPA (default) o en servidor/máquina del cliente (tier enterprise/
> regulados); ver chequeo 2. Es el destino del "deploy de procesos", la fuente de verdad de la
> estructura organizacional para Cockpit y **el estado DESEADO del twin** (deseado N6 × real N16 ×
> brecha continua N13).

- **objetivo** — Ser la **única fuente de verdad** de la organización, confidencial y en su red: procesos, manuales, estructura organizacional as-code, arneses por rol, y (futuro) el know-how. Versionado, auditable, legible por humanos y agentes. Es lo que el consultor construye y publica, y lo que Cockpit lee para renderizar por nivel de acceso.
- **resumen** — "Git como base de archivos" servido self-hosted en la máquina del cliente. Cuatro cuerpos: **Repositorio de Arneses** (los arneses por rol de la org) · **Metadata Organizada** (objeto normalizado: procesos/roles/puestos/objetivos/brechas as-code) · **Documentos Oficiales versionados** (manuales, procesos — fuente + PDF derivado) · **Knowledge Database** (know-how, futura — `pendiente`).
- **plano · tipo · madurez** — Organización · artefacto/dato · **no-construido** (el modelo git existe conceptualmente; falta el despliegue self-hosted confidencial y el poblado real).
- **responsabilidades** — Contener y versionar todo el conocimiento oficial de la org · dar historia/autoría/reversibilidad (base del control de información documentada ISO §7.5) · servir la estructura a Cockpit (lectura) y recibir las publicaciones del consultor (escritura) · alojar los arneses que cargan las apps del edge.
- **no_objetivos** — NO es DB transaccional ni de queries agregadas en caliente (eso lo hace Cockpit/lakehouse) · NO es el landing del crudo (eso es N12) · NO guarda datos de operación de alta frecuencia (eso es N16) · NO sale de la instancia de la Organización (hosteada bajo DPA o red del cliente, según tier — chequeo 2).
- **formato** — Markdown (documentos, manuales, know-how) · YAML/JSON (objeto normalizado, arneses como skills) · PDF derivado (generado en el publish). Git nativo; PDFs pesados → LFS/releases.
- **propietario + clasificacion** — **Cliente (la PyME).** ★datos del cliente, confidencial. El consultor/analista escribe, el cliente posee y controla acceso.
- **residencia + retencion** — **Por tier (chequeo 2):** default = instancia single-tenant hosteada por nosotros (aislada, cifrada, bajo DPA, **exportable** — "tu organización as-code es un repo git que te llevas cuando quieras") · tier enterprise/regulados = servidor/máquina del cliente. Backups en ambas (`forgejo dump` + restic). Retención indefinida vía historia git (es el valor: trazabilidad). El repo ES el archivo histórico.
- **versionado** — Git (commits, branches, tags, blame, diff). El "deploy de procesos" = commit + tag firmado con fecha efectiva; la Gestión de Cambios (N13) usa branches (borrador) / main (vigente) / tags (copias controladas).
- **quién_escribe / quién_lee** — Escriben: Consultio (N14, publica el mapa **[R7]**), Arnesia (N15, siembra arneses), el Analista de Calidad (N19, publica cambios vía N13). Leen: Cockpit (N13, estructura + documentos), las apps del edge (cargan sus arneses), humanos.
- **comunicacion** — No es servicio nuestro: protocolo git + servidor self-hosted (Forgejo). Cockpit lee vía deploy-token read-only (API o `go-git`); el publicador escribe con credencial least-privilege.
- **depende_de / consumido_por** — depende_de: git, servidor del cliente, backups. consumido_por: N13 (lee estructura/documentos), N14/N17/N5 (cargan arneses), N19 (gestiona cambios).
- **riesgos_abiertos** — (1) **BD vs archivos** (BL nuevo): git/archivos = SSoT, cualquier BD = índice derivado reconstruible (SQLite/bleve en Cockpit), nunca SSoT. (2) Motor de índice/búsqueda — hasta tener volumen. (3) Repos separados por nivel de confidencialidad — solo si un cliente lo exige. (4) Conexión concreta con un ERP como SSoT adicional (pendiente, se ve al tocar ese sistema).
- **fuentes** — [Forgejo](https://forgejo.org/) · [QMS en git — OpenRegulatory](https://openregulatory.com/articles/quality-management-system-qms-in-github-gitlab) · `docs/research/rediseno-total/01-repositorio-oficial.md`.

---

## N13 · Cockpit — Gestión de Cambios + Visualización

> Re-fichado CK-18: era "Vista Negocio (binario `directorio`)". Módulos Gestión de Cambios +
> Visualización, sirve por **niveles de acceso** y cruza la estructura (N6) con la operación (N16).
> **CK-21 lo hace el reconciliador del twin** y le declara dos componentes nuevos (no-construidos):
> **motor de indicadores** — la capa semántica operación→KPI→OKR→objetivo (el hilo de oro medido con
> semáforo y drill-down directorio→analista; asciende el riesgo #3 de N16 a componente) — y **ciclo
> brecha→proyecto** — brechas con costo estimado + ranking ROI y el proyecto de mejora viviendo su
> ciclo completo dentro de Cockpit (brecha→proyecto→ejecución→KPI movido; cierra PDCA).

- **objetivo** — Ser el **tablero único** de la organización: cruzar la estructura organizacional (procesos/roles/objetivos, de N6) con la operación día a día (de N16) y servirla a cada usuario **según su nivel de acceso**; y darle al Analista de Calidad el módulo de **Gestión de Cambios** para mantener lo oficial siguiendo ISO. Corre **dentro de la instancia de la Organización** — hosteada por nosotros (default D3) o en la red del cliente (tier enterprise/regulados, chequeo 2) —, cero npm/python/Docker.
- **resumen** — Binario Go propio (`directorio`, hoy) con UI embebida. **Módulo Visualización:** Hilo de Oro · Brechas · Empresa→Sistema · objeto normalizado (12 entidades — schema v2, CK-26) + indicadores del lakehouse. **Módulo Gestión de Cambios:** solicitudes/aprobación/publicación de versiones (ISO §7.5/§6.3). Auth embebida + autorización derivada de la estructura del repo.
- **plano · tipo · madurez** — Organización · servicio/exec-env · **existe (parcial)** — la Visualización base está construida y verificada standalone (Go build/vet/test + UI); faltan Gestión de Cambios, niveles de acceso reales y el cruce con el lakehouse.
- **responsabilidades** — Servir la SPA embebida (`go:embed`) · API JSON (`/api/portfolio`, `/api/negocio`, `/api/objeto`) · leer/validar el objeto normalizado (12 entidades — CK-13 sirvió 9, schema v2/CK-26 sube a 12) de N6 · **cruzar estructura × operación (N16) y servir por nivel de acceso [R11]** · **medir el hilo de oro (motor de indicadores) y sostener la brecha continua con el ciclo brecha→proyecto→KPI movido [R17]** · **Gestión de Cambios** (solicitud/aprobación/publicación de versiones, firma persistida) sobre N6 [alimenta R13] · autenticar y autorizar por rol organizacional.
- **no_objetivos** — NO es el SSoT de la estructura (lo lee de N6) · NO es el almacén de operación (lo consulta en N16) · NO razona server-side multi-tenant (murió N1) · NO edita git a mano en la UI (la Gestión de Cambios oculta git al analista).
- **stack** — `net/http` stdlib · `go:embed` + SPA (deuda Go/Next → Vite SPA, BL-20). **Auth:** embebida — argon2id (`x/crypto`) + `alexedwards/scs` (sesiones server-side, store SQLite); passkeys opcionales (`go-webauthn`); campo `provider` desde el día 1 para OIDC futuro. **Autorización:** middleware propio ~200 líneas, **policy-as-data** derivada de N6 (el rol organizacional ES la política; 4 niveles como enum ordenado Gobernanza>Estratégico>Táctico>Operativo). **Lakehouse:** DuckDB embebido (`github.com/duckdb/duckdb-go`), `ATTACH ... AS lake (TYPE ducklake)` en lectura. **Gestión de Cambios:** git de backend + UI que oculta git.
- **expone** — HTTP/JSON: `/api/portfolio`, `/api/negocio`, `/api/objeto` · vistas por nivel · endpoints de Gestión de Cambios (solicitud/aprobación/publicación) · lectura de indicadores del lake.
- **estado + persistencia** — Verdad de estructura/documentos: N6 (git). Operación: N16 (lakehouse). Estado propio de Cockpit: credenciales/sesiones + registro de firmas de aprobación (SQLite local) — las credenciales viven aquí, JAMÁS en el repo.
- **escala + disponibilidad** — 1 organización/despliegue, multi-usuario por niveles. Proceso único, launcher propio (`directorio -workspace … -port 4100`); crash → restart.
- **integraciones_externas** — `git`/N6 (estructura, deploy-token read-only) · N16 (DuckDB embebido) · N3 (updates del binario).
- **seguridad** — Vive en la red del cliente. Auth embebida (sesiones OWASP vía scs; argon2id). Autorización por nivel derivada de N6, enlazada por ID estable (email/ID de puesto); credenciales en DB local, nunca en el repo. Gestión de Cambios: firma de aprobación autenticada + persistida en DB además de git (el audit trail no depende solo de la plataforma).
- **nfr / cumplimiento_progresivo** — Control de información documentada ISO §7.5 (versión vigente/obsoleta, aprobación previa a publicación, acuse, revisión periódica) vía Gestión de Cambios. TLS en LAN, audit trail de accesos.
- **comunicacion** — Lee N6 (git, read-only) · lee N16 (DuckDB) · sirve HTTPS a los navegadores de N11 · jala updates de N3. Binario independiente, cero import de código de otros productos.
- **depende_de / consumido_por** — depende_de: N6 (estructura/documentos), N16 (operación), N3 (updates). consumido_por: **N11** (los 4 niveles, vía navegador), **N19** (Analista de Calidad, Gestión de Cambios), **N9/N14** (preview local del consultor).
- **riesgos_abiertos** — (1) Módulo Gestión de Cambios sin construir — **sube al MVP (CK-21/D8)**: es el gate dev→UAT→prod que hace viable la captura "a prueba de tontos" sin mapas basura. (2) Niveles de acceso reales (sube a alta); accesos derivados de la estructura/RRHH = la estructura PROPONE, un humano APRUEBA (human-in-the-loop, CK-21/D8). (3) Motor de indicadores sin construir (era "cruce estructura × lakehouse"; ascendido a componente por CK-21 — esquema semántico operación→KPI→OKR→objetivo). (4) Ciclo brecha→proyecto sin construir (CK-21/D2 — el diferenciador de loop cerrado). (5) Deuda Go/Next (BL-20). (6) Cómo Cockpit descubre el objeto normalizado en N6 (deploy-token a Forgejo — igual en modalidad hosteada o self-hosted).
- **fuentes** — `docs/research/rediseno-total/05-auth-rbac.md` · `06-gestion-cambios-iso.md` · `03-data-lakehouse.md` · Strangler Fig (vía CK-07).

---

## N16 · Data Lakehouse ★datos

> Nodo nuevo (CK-18). Reúne la operación de todos los sistemas de la org para que Cockpit muestre no
> solo la organización e indicadores, sino **cómo vamos día a día** en todos los niveles.

- **objetivo** — Consolidar los datos de operación de todos los sistemas de la organización (N18) en un almacén analítico ligero que **nutre a Cockpit**: el cruce estructura × operación que convierte el mapa estático en un tablero vivo.
- **resumen** — Lakehouse pequeño dentro de la instancia de la Organización (residencia por tier — chequeo 2): pipelines de ingesta + almacén columnar + catálogo. Consumido por Cockpit (binario Go) que hace el join contra la estructura de N6.
- **plano · tipo · madurez** — Organización · servicio/dato · **no-construido**.
- **responsabilidades** — Ingerir la operación de N18 (APIs SaaS, ERP, DBs a medida, Excels) → almacén analítico **[R10]** · versionar/snapshot (time travel) · exponer al binario Go de Cockpit para el cruce con indicadores.
- **no_objetivos** — NO es el SSoT de la estructura (eso es N6) · NO es transaccional (es analítico) · NO requiere data engineers/K8s · NO sale de la instancia de la Organización — que reside por tier (default hosteada por nosotros bajo DPA; red del cliente = tier enterprise/regulados, chequeo 2). Es **el estado REAL del twin**.
- **stack** — **Ingesta:** dlt (Python puro, sin servidor; SaaS vía verified sources/REST, ERP y DBs vía `sql_database`+ConnectorX). **Almacén:** DuckLake (Parquet en disco local o S3/MinIO del cliente) + **catálogo Postgres** (escritor-pipeline y lector-Cockpit concurrentes; snapshots) — un solo host sin Postgres arranca con catálogo SQLite y migra con un `ATTACH`. **Excel** de primera clase (dlt `filesystem`+`read_excel` o `read_xlsx` de DuckDB, con hash/fecha para auditabilidad). **Exposición a Go:** DuckDB embebido (`duckdb-go`), lectura vía `ATTACH ... (TYPE ducklake)`. **Orquestación:** systemd timers + healthcheck. Iceberg/Delta/Spark/ClickHouse/Airbyte/Dagster = sobreingeniería a esta escala.
- **expone** — El lake por DuckLake al binario Cockpit (embebido, cero servicio intermedio). Sin puerto nuevo por default.
- **estado + persistencia** — Parquet + catálogo (SQLite→Postgres) dentro de la instancia (residencia por tier — chequeo 2). Retención según política; snapshots/time travel para "cómo íbamos".
- **escala + disponibilidad** — 50 GB–2 TB analíticos típicos. Batch horario/diario cubre "cómo vamos día a día"; sin streaming. Si cae la ingesta, Cockpit muestra el último snapshot.
- **integraciones_externas** — N18 (fuentes) · (modalidad hosteada) MotherDuck si el cliente paga hosting nuestro.
- **seguridad** — Datos de operación del cliente ★. En su infra por default; cifrado at-rest; acceso read-only del binario Cockpit. Modalidad hosteada por nosotros = DPA + zero-retention como cualquier tránsito.
- **nfr / cumplimiento_progresivo** — Auditabilidad de cargas (hash/fecha por archivo/pipeline); linaje básico; time travel.
- **comunicacion** — dlt jala de N18 (según sistema: API/DB/FS) → escribe DuckLake · Cockpit lee embebido. Todo dentro del data plane del cliente.
- **depende_de / consumido_por** — depende_de: N18 (fuentes), almacenamiento del cliente. consumido_por: **N13** (Cockpit hace el cruce y sirve indicadores).
- **riesgos_abiertos** — (1) **Default invertido por CK-21/D3**: hosteado por nosotros (single-tenant, dentro de la instancia del cliente en nuestra nube) = default comercial; infra del cliente = tier enterprise/regulados. La arquitectura es idéntica en ambas modalidades. (2) Catálogo SQLite vs Postgres según despliegue. (3) Esquema semántico de indicadores → **ascendido a componente "motor de indicadores" de N13 (CK-21)**; aquí queda el contrato de exposición del lake. (4) Conectores concretos por sistema (se diseñan con el cliente real; MVP = Excel + 1 conector).
- **fuentes** — [DuckLake 1.0](https://ducklake.select/2026/04/13/ducklake-10/) · [dlt](https://dlthub.com/) · [duckdb-go](https://github.com/duckdb/duckdb-go) · `docs/research/rediseno-total/03-data-lakehouse.md`.

---

## N12 · Depósito de fuentes (landing zone) ★datos

- **objetivo** — Ser el área donde **aterriza el crudo de entrada** del levantamiento (manuales, MOF, organigramas, inventarios, exports, dumps de USB/correo) para que el consultor lo procese con Consultio. Separado de la verdad curada (N6) porque el crudo es **transitorio, voluminoso y el de mayor riesgo de retención** — aislarlo permite **destruirlo** apenas el mapa está hecho. **[R3]**
- **resumen** — Zona de aterrizaje del crudo en la máquina del cliente (o del consultor como fallback): N9 deposita, Consultio lo procesa, se retiene poco y se destruye.
- **plano · tipo · madurez** — Organización · artefacto/dato · **no-construido**.
- **responsabilidades** — Recibir lo que deposita N9 **[R2]** · servir el crudo a Consultio (N14) para procesar · **aplicar retención/destrucción** (borrar tras generar el mapa) · registrar quién depositó qué (audit) **[R3]**.
- **no_objetivos** — NO es el SSoT (eso es N6) · NO guarda la verdad curada · NO sale del entorno del cliente · NO es de larga vida (el crudo se destruye; lo derivado vive en N6).
- **formato** — Carpeta/object store (PDF, Word, Excel, imágenes, exports) — **NO git** (binarios/voluminoso diffean mal).
- **propietario + clasificacion** — Cliente. ★datos — **el material más sensible** (crudo sin curar). Confidencial.
- **residencia + retencion** — Dentro de la instancia de la Organización (por tier — chequeo 2; en el default hosteado el crudo aterriza en la instancia aislada bajo DPA). Retención **corta** + **destrucción post-procesamiento** (la cláusula de no-retención del DPA se materializa aquí). PyME sin servidor: laptop gestionada del consultor bajo contrato = fallback degradado.
- **versionado** — Ninguno (staging transitorio; el histórico vive en N6).
- **quién_escribe / quién_lee** — Escribe: N9 (deposita). Lee: Consultio (N14, procesa). Nadie más.
- **comunicacion** — No es servicio: filesystem/object store. N9 escribe, N14 lee.
- **depende_de / consumido_por** — depende_de: almacenamiento del entorno. consumido_por: **N14** (Consultio lo procesa).
- **riesgos_abiertos** — (1) Política de retención exacta (¿destruir tras el mapa o tras ratificar el AS-IS?). (2) Cifrado at-rest (AES-256 por default). (3) ¿Object store vs carpeta simple? según infra.
- **fuentes** — [GDPR DPA Art. 28 — destrucción](https://gdpr.eu/data-processing-agreement/).

---

## N18 · Sistemas operacionales de la organización ★datos

> Nodo nuevo (CK-18). Las fuentes de operación que nutren el lakehouse — lo que la org ya tiene.

- **objetivo** — Representar los sistemas que la organización ya opera y que generan la data del día a día: son las **fuentes** del Data Lakehouse (N16) y, en el caso del sistema a medida, el **destino** del desarrollo (N5/N10).
- **resumen** — Tres arquetipos + archivos: SaaS externo (Sistema C), ERP enlatado (Sistema A), sistema a medida (Sistema B), y Excels que suben los usuarios operativos. Un ERP futuro entra como SSoT operacional adicional.
- **plano · tipo · madurez** — Organización · sistemas fuente · **existe** (son del cliente; su integración con el lake es lo no-construido).
- **responsabilidades** — Ser las fuentes de verdad de la operación · exponer sus datos (API/DB/export/Excel) para que N16 los ingiera **[R10]** · (sistema a medida) recibir las capabilities que construyen los devs.
- **no_objetivos** — NO los construimos nosotros (salvo el a medida, vía DevStudio) · NO son SSoT de la estructura organizacional (eso es N6) · NO se modifican para el lake (ingesta read-only).
- **formato** — Heterogéneo: APIs REST (SaaS), DB relacional (ERP/a medida), archivos (Excel).
- **propietario + clasificacion** — Cliente. ★datos de operación, confidenciales.
- **residencia + retencion** — Infra del cliente (o SaaS de terceros que el cliente ya contrató). Retención según cada sistema.
- **versionado** — El de cada sistema; el lake les da snapshot/time travel al ingerir.
- **quién_escribe / quién_lee** — Escriben: los usuarios operativos (su día a día, algunos vía Colab Studio/N17). Lee (para el lake): N16 (ingesta read-only).
- **comunicacion** — N16 jala de cada sistema según su interfaz (API/DB/FS). El sistema a medida además recibe deploys de N5/N10.
- **depende_de / consumido_por** — depende_de: la operación del cliente. consumido_por: **N16** (lakehouse), **N5/N10** (el a medida, como destino de desarrollo).
- **riesgos_abiertos** — (1) Conectores concretos por sistema (se diseñan con el cliente). (2) El ERP como SSoT adicional — cómo se concilia con N6 (pendiente, al tocar ese sistema). (3) Calidad/gobernanza de los Excels manuales.
- **fuentes** — Diagrama del operador (`mapaCockpitTotal`) · `docs/research/rediseno-total/03-data-lakehouse.md`.

---

# EDGE — máquinas de humanos

## N14 · Consultio — App del Consultor ★IP

> Re-fichado CK-18: era "App del Auditor". Nombre firmado = **Consultio** (el operador). **CK-21/D7 lo
> desbloquea y lo hace la apuesta principal: el v0 son los arneses del método M1-M3 corriendo sobre
> Claude Code pelado — sin app shell** (levantamiento por entrevista con agente + doc→modelo con
> provenance + preview local de Cockpit; patrón validado por BusinessOptix Discovery Agent / iGrafx
> Pia / ARIS AI Companion). **Re-fichado CK-25: NO es un clon de DevStudio.** Es un **app fina sobre
> `studio-core`** — kernel Go compartido extraído de N5 (60-70% del código de DevStudio era núcleo
> genérico ya aislado tras puertos DIP), disciplina upstream-first + ban de mirror producto→producto
> (los dos productos beben del mismo pozo, jamás se copian código entre sí). El shell F3 (taxonomía
> engagement/método M1-M3, preview de Cockpit, publicación a N6) llega sobre ese core, sin bloquear
> el MVP de arneses.

- **objetivo** — Darle al Consultor (N9) su herramienta de trabajo: app **instalable** que se cuelga de su Claude Code (N8) y desde la cual hace **todo el levantamiento y construye el mapa completo** de la organización (procesos/roles/objetivos/personas + manuales, bajo estándar) — como un dev construye software — y lo **publica al Repositorio Oficial** (N6): "deploy de procesos". Es la superficie única del consultor.
- **resumen** — App fina sobre **`studio-core`** (kernel compartido con N5, repo/módulo Go propio, CK-25) con taxonomía y nombre propios (Consultio), cargando los arneses del método (m1·m2·m3) que produce Arnesia (N15). Opera el engagement con carriles/provenance, construye el objeto normalizado + documentos oficiales + arneses de la org, lleva **preview local de Cockpit** (ve cómo lo verá la organización antes de publicar, patrón dev-server), y publica a N6 vía git. Transferible: inicia con el consultor Prenter, luego lo hereda el Analista de Calidad del cliente (N19).
- **plano · tipo · madurez** — Edge (máquina del consultor) · runtime edge / exec-env (app instalable) · **existe (parcial)** — primitiva CN-01 sobre `studio-core` v0.1.0/SC-01, live-verify en vivo (engagement=repo git, arnés instalado con lock+commit, sesión ligada, turno con SSE); shell F3 completo (preview Cockpit, publicación N6) sigue en construcción.
- **responsabilidades** — Capturar el AS-IS operando el método **[R4]** · construir el mapa completo — objeto normalizado + documentos oficiales + arneses por rol **[R5]** · calcular la brecha + los proyectos **[R6]** · **publicar el resultado ratificado a N6 — "deploy de procesos" [R7]** · llevar preview local de Cockpit (N13) para revisar antes de publicar · depositar/procesar crudo (N12).
- **no_objetivos** — NO fabrica los arneses (eso es Arnesia/N15; Consultio los usa) · NO es multi-usuario/SaaS (una instalación por persona, como N8) · NO renderiza la Vista de la organización en producción (eso es N13; Consultio corre una **instancia local de preview** del mismo renderer) · NO retiene crudo (aterriza en N12).
- **runtime + licencia** — App local instalable (linaje DevStudio/harness-studio). **Se cuelga de N8** — el Claude Code del propio consultor (driver CLI-nativo, stdin/stdout stream-json), **BYO licencia**: la app jamás toca credenciales de Anthropic. Trabajo desatendido, si existiera, iría por API key — no por la app. Stack por decidir (BL-15, hereda del clon DevStudio).
- **qué_construye / contra_qué** — Construye/edita el objeto normalizado (`empresa/<tipo>/`, D-15) + documentos oficiales + arneses de la org; contra N6 (Repositorio Oficial), vía git.
- **local_vs_remoto** — Local: la app, los arneses del método, el trabajo del engagement, el preview de Cockpit. Remoto: N6 (push del resultado) · N3 (updates de la app y de los arneses del método).
- **seguridad** — El método viaja como arneses en la app (persona nuestra) y **se entrega al cliente** con la transferencia — la protección pasa a licencia + contrato (deroga el límite "método nunca al cliente", ver chequeo 1). Credenciales git least-privilege contra N6. Crudo fuera de la app (N12). Actualización firmada (N3, TUF/Tauri).
- **comunicacion** — Consultio → **N8** (stdin/stdout, stream-json — el motor) · → **N6** (git, "deploy de procesos") · → **N12** (depósito de crudo) · ← **N3** (updates de app + arneses).
- **depende_de / consumido_por** — depende_de: **N8** (motor), **N15** (arneses del método), N6 (destino), N3 (updates). consumido_por: **N9** (consultor Prenter) y luego **N19** (Analista de Calidad del cliente) · aguas abajo **N13** (renderiza lo publicado).
- **riesgos_abiertos** — (1) Definición del producto-app = clon de DevStudio + adaptación propia — **resuelto (CK-25): NO se clona, se extrae `studio-core`** y Consultio consume el kernel por import versionado (disciplina upstream-first, ban de mirror producto→producto). (2) Modelo de publicación a N6: **resuelto en lo esencial (CK-21/D5)** — dev→UAT→prod con aprobación (Gestión de Cambios); detalle fino al construir. (3) Cuánto método baja empaquetado en los arneses de la app vs se sirve por N3. (4) Transferencia consultor→analista: qué arneses/permisos cambian al entregar. (5) `replace => ../studio-core` es transición sin remote (CK-25/A2) — borrar al publicar el core; design system React diferido a F2.5 (CK-25/A7).
- **fuentes** — Nombre: operador (CK-18) · topología/extracción: operador (CK-25, `docs/product/plans/consultio-studio-core/`) · kernel compartido `~/Proyectos/studio-core` (SC-01) · linaje DevStudio (`~/Proyectos/dev-studio`, DH-NN) · `docs/research/rediseno-total/07-proceso-como-arnes.md`.

---

## N17 · Colab Studio — app del trabajador

> Nodo nuevo (CK-18). Como DevStudio/Consultio, pero para el **trabajador operativo** (contador,
> analista): hace su día a día con los arneses de su puesto.

- **objetivo** — Darle a cada trabajador operativo de la organización su app instalable que se cuelga de su Claude Code y carga **los arneses específicos de su puesto** (cada puesto ejecuta N roles), para que su agente ya sepa operar sus procesos — el mapa oficial vuelto trabajo diario ejecutable.
- **resumen** — Variante de DevStudio para el trabajador no-dev (contadores, analistas, usuarios). Carga los arneses por rol del Repositorio de Arneses (parte de N6, producidos por Arnesia). Su trabajo queda enfocado por esos arneses; produce salidas (p.ej. Excels) que nutren el lakehouse (N16).
- **plano · tipo · madurez** — Edge (máquina del trabajador) · runtime edge / exec-env (app instalable) · **no-construido**.
- **responsabilidades** — Operar el día a día del puesto con sus arneses **[R12]** · cargar los arneses de rol correctos (del Repositorio de Arneses) · producir las salidas del puesto → algunas alimentan N16 (Excels/registros).
- **no_objetivos** — NO fabrica arneses (los usa; Arnesia/N15) · NO es multi-usuario (una instalación por trabajador) · NO toca credenciales de Anthropic (BYO licencia como N8) · NO construye software a medida (eso es DevStudio/N5).
- **runtime + licencia** — App local instalable; **se cuelga de N8** (Claude Code del trabajador, BYO licencia; driver CLI-nativo). Igual doctrina ToS que N5/N14: una instancia por humano.
- **qué_construye / contra_qué** — Ejecuta los procesos del puesto; produce las salidas del trabajo (documentos, registros, Excels) contra los sistemas de la org (N18) y/o el lake (N16).
- **local_vs_remoto** — Local: la app, los arneses del puesto, el trabajo. Remoto: N6 (de donde jala sus arneses) · N3 (updates) · N18/N16 (donde deja/toma datos de operación).
- **seguridad** — Arneses del puesto = el método operacional entregado al cliente (licencia + contrato). BYO licencia. Least-privilege contra los sistemas que su puesto toca.
- **comunicacion** — Colab Studio → **N8** (stream-json, motor) · ← **N6** (jala arneses del puesto) · ↔ **N18/N16** (datos de operación) · ← **N3** (updates).
- **depende_de / consumido_por** — depende_de: **N8** (motor), **N6** (arneses del puesto), N3 (updates). consumido_por: **N11** (los usuarios operativos son su operador) · aguas abajo **N16** (recibe sus salidas).
- **riesgos_abiertos** — (1) Definición de producto (¿clon de DevStudio como Consultio, o variante propia?). (2) Cómo se mapea puesto → N roles → N arneses (contra el objeto normalizado). (3) Gobernanza de las salidas que alimentan el lake (calidad del Excel). (4) Frontera con N13 (Colab opera; Cockpit muestra).
- **fuentes** — Operador (CK-18) · `docs/research/rediseno-total/07-proceso-como-arnes.md`.

---

## N5 · DevStudio — app de desarrollo (P2)

> Re-fichado CK-18 (ampliación): DevStudio ahora también se **entrega a los developers del cliente**
> (si los tiene) para construir el sistema a medida; sus arneses de dev se modifican en Arnesia. La
> frontera de célula (repo `~/Proyectos/dev-studio`, ledger DH-NN) sigue.

- **objetivo** — Darle a cada developer su consola **instalable** para construir y mantener software (proceso/arquitectura/doc as-code) sobre Claude Code. En el modelo CK-18 se entrega también a los **devs del cliente** para implementar capabilities en su sistema a medida (N18/Sistema B).
- **resumen** — App de escritorio (binario Go + UI embebida). Cada dev ve sus repos y sus historias; la versión Product Manager concentra refinamiento/priorización. **Comparte kernel `studio-core` con Consultio (N14) — CK-25**: el 60-70% genérico (motor arneses, driver Claude Code, sesión, store, transporte, updater, design system) vive en el core; N5 migra a consumirlo en su propia sesión (F2.3, DH-NN pendiente). Sus arneses de dev se modifican en Arnesia (N15).
- **plano · tipo · madurez** — Edge (máquina del developer) · runtime edge / exec-env · **existe (parcial)** — esqueleto + dogfooding (DH-13..DH-17).
- **responsabilidades** — Operar el ciclo de desarrollo como proceso-as-code **[R14 junto a N8/N10]** · gestionar el runtime de delivery (N8): se cuelga sobre Claude Code (driver CLI-nativo, BYO licencia) · leer/escribir el sistema a medida del cliente (N18) · (PM) refinamiento + priorización.
- **no_objetivos** — NO es server compartido · NO toca credenciales de Anthropic (BYO licencia) · NO lo gobierna este repo (célula P2, DH-NN) · NO opera el método del engagement (eso es Consultio/N14, aunque comparten linaje).
- **runtime + licencia** — App instalable; se cuelga de N8 bajo la licencia del propio dev (DH-10). Misma doctrina ToS: una suscripción, un humano.
- **qué_construye / contra_qué** — Historias → tests → producción, contra el sistema a medida del cliente (N18/Sistema B) y su repositorio de código.
- **local_vs_remoto** — Local: la app, Claude Code, git. Remoto: el repositorio de código del cliente · N3 (updates) · N18 (destino del deploy).
- **seguridad** — Credenciales del dev, least-privilege contra los sistemas del cliente. Delivery automatizado server-side (si se quisiera) = API key, no suscripción.
- **comunicacion** — DevStudio → **N8** (stream-json) · ↔ repositorio de código + N18 (git/deploy) · ← N3 (updates, si P2 usa este canal).
- **depende_de / consumido_por** — depende_de: N8, el repositorio de código del cliente. consumido_por: **N10** (developer del cliente) y los roles del ciclo · aguas abajo N18 (Sistema B recibe capabilities).
- **riesgos_abiertos** — (1) Entrega a devs del cliente: licenciamiento y arneses de dev (Arnesia). (2) Cómo se clona Consultio de esta base — **cerrado (CK-25): no se clona, se extrae `studio-core`**; N5 migra a consumirlo (F2.3, deuda transitoria de duplicación core↔dev-studio fichada, sesión propia DH-NN). (3) Distribución/updates de escritorio (N3/Tauri — lo decide P2). (4) Modelo multi-usuario/sync de P2.
- **fuentes** — `~/Proyectos/dev-studio` (DH-10/DH-12..DH-17) · operador (CK-18).

---

## N8 · Runtime de agente local (Claude Code)

> El motor común del edge: mismas tres apps se cuelgan de él — Consultio (N14), Colab Studio (N17),
> DevStudio (N5). Una instancia por humano firmado, jamás compartida (ToS).

- **objetivo** — Ejecutar el trabajo de agente **en la máquina del humano firmado**, con SU suscripción **[R15]**: motor debajo de las tres apps del edge. Es la mitad "local" del runtime; cualquier compute desatendido/server-side iría por API key (no hay nodo server-side en el modelo CK-18 — murió N7).
- **resumen** — Cada humano firmado (consultor, trabajador, dev) corre Claude Code (Pro/Max) en su laptop. Local-por-humano **por restricción de licencia**. Nadie opera el CLI a pelo: la app de su rol se cuelga sobre N8 (driver CLI-nativo, stream-json) — N14/N17/N5 gestionan su instancia. N8 = el motor debajo.
- **plano · tipo · madurez** — Edge (laptop) · runtime edge (interactivo humano-en-el-loop, headless `claude -p` opcional) · **existe** (producto maduro first-party).
- **responsabilidades** — Ejecutar las sesiones que cada app parametrice **[R15]**: Consultio (método del engagement), Colab Studio (procesos del puesto), DevStudio (delivery). El dueño del QUÉ es la app; N8 presta el motor.
- **no_objetivos** — NO se ejecuta server-side como servicio compartido · NO se multiplexa una suscripción entre humanos · NO es dueño del método (N14/N15) ni del proceso de desarrollo (N5) — es motor, no superficie.
- **runtime + licencia (restricción ToS — sección crítica)** — **NO se puede multiplexar la suscripción de Claude Code server-side. Cada humano usa su propia suscripción. Sí se permite headless (`claude -p`) bajo la cuenta del propio humano.** (Consumer Terms §3.7: automatización solo vía API key o donde se permita; el CLI en la máquina del usuario es esa excepción. Feb-2026: OAuth de Free/Pro/Max no permitido en otros productos/Agent SDK. Jun-2026: créditos "Agent SDK" por suscriptor, atados a un humano firmado, no habilitan pooling server-side.) **Conclusión:** todo el edge = por-humano-en-su-laptop; cualquier compute server-side usaría API key. Tratar el licenciamiento como configurable (Anthropic cambió 3× en H1-2026).
- **qué_construye / contra_qué** — Lo que cada app le parametrice; el resultado lo publica la app (Consultio→N6, DevStudio→código, Colab Studio→salidas), no N8.
- **local_vs_remoto** — Local: runtime (ejecución de tools, git) en la laptop. Remoto: inferencia vía suscripción. El método/proceso se inyecta como arneses; la ejecución es humano-gobernada.
- **seguridad** — Credenciales de suscripción del humano, en su laptop, vía CLI oficial — NO se extraen ni centralizan. Acceso a N6/sistemas con credenciales propias least-privilege.
- **comunicacion** — Laptop ↔ Anthropic (suscripción, inferencia) · laptop ↔ N6/sistemas (git/API) · app gestora → N8 (stdin/stdout, stream-json).
- **depende_de / consumido_por** — depende_de: suscripción del humano, los sistemas que la app toca. consumido_por: **N14 (Consultio)** · **N17 (Colab Studio)** · **N5 (DevStudio)** — cada una gestiona una instancia.
- **riesgos_abiertos** — (1) Tentación de multiplexar (violación + baneo; server-side=API key). (2) Deriva de términos → licenciamiento configurable, revisar por release. (3) "Ordinary individual usage" → modelar costo por humano. (4) "Transitan, no persisten": el dato del cliente que el agente procesa **transita** a Anthropic durante la inferencia (zero-retention), aun sin nodo server-side — ver chequeo del hallazgo.
- **fuentes** — [The Register — ban on third-party access (feb 2026)](https://www.theregister.com/software/2026/02/20/anthropic-clarifies-ban-on-third-party-tool-access-to-claude/5014546) · [VentureBeat — reinstates with a catch (jun 2026)](https://venturebeat.com/technology/anthropic-reinstates-openclaw-and-third-party-agent-usage-on-claude-subscriptions-with-a-catch).

---

## N9 · Consultor (transferible → Analista de Calidad) — actor

- **objetivo_del_actor** — Conducir el levantamiento y construir el sistema de la organización (mapa + documentos + arneses) desde Consultio, y publicarlo al Repositorio Oficial. Lleva el método al cliente. Rol **transferible**: inicia siendo persona de Prenter, luego lo hereda un Analista de Calidad del cliente (N19).
- **resumen** — El experto (Prenter) que opera Consultio (N14) sobre su Claude Code (N8). Al cerrar el engagement, transfiere la operación al cliente.
- **plano · tipo · madurez** — Edge (su máquina) · actor · existe.
- **responsabilidades / no_objetivos** — Recolecta y cura las fuentes crudas → deposita en **N12 [R2]** · opera Consultio para capturar el AS-IS **[R4]**, construir el mapa **[R5]** y calcular la brecha **[R6]** · ratifica y **publica a N6 [R7]** · conduce entrevistas · aporta contexto político/estratégico. **NO fabrica arneses** (Arnesia) · **NO posee los datos** (del cliente).
- **permisos / RACI** — Máxima autoridad del **método** (A/R en levantamiento/construcción). **Su herramienta propia es N14 (Consultio)** con **N8** debajo. Al transferir, cede la operación de mantenimiento al Analista de Calidad (N19).
- **interfaces_que_usa** — **N14 (Consultio)** con **N8** debajo, **N12** (deposita crudo), **N6** (publica), **N13** (preview de Cockpit).
- **momentos** — Etapa 1 (levantamiento) + Etapa 2 (construcción/publicación). En Etapa 3 el rol pasa a N19.
- **comunicacion** — git a N6 · stream-json a N8 · HTTPS a N3 (updates).
- **riesgos_abiertos** — Dependencia del consultor experto = límite de escala; se mitiga con el método como arnés (N15/N2) — cuánto se logra es pregunta abierta del modelo de negocio. La transferencia al analista es el mecanismo de salida.

---

## N19 · Analista de Calidad (del cliente) — actor

> Nodo nuevo (CK-18). Hereda Consultio al cerrar el engagement y mantiene lo oficial siguiendo ISO.

- **objetivo_del_actor** — Mantener el sistema oficial de la organización tras el engagement: recibir solicitudes de cambio, revisarlas/aprobarlas y publicar nuevas versiones, siguiendo buenas prácticas ISO (información documentada §7.5, gestión del cambio §6.3). Es el dueño del cambio del lado del cliente.
- **resumen** — Rol del cliente que hereda la operación de Consultio (N14) y usa el módulo **Gestión de Cambios** de Cockpit (N13) para gobernar los cambios sobre el Repositorio Oficial (N6). El repo solo tiene lo oficial, versionado; el analista es quien lo evoluciona.
- **plano · tipo · madurez** — Edge · actor · **no-construido** (rol futuro, aparece al cerrar el primer engagement).
- **responsabilidades / no_objetivos** — Gestionar el cambio del sistema (ISO): solicitar/revisar/aprobar/publicar versiones **[R13]** · mantener los arneses de la org (con Arnesia entregada) · **NO** hace el levantamiento inicial (eso fue el consultor) · **NO** ve git a pelo (la Gestión de Cambios lo oculta).
- **permisos / RACI** — A/R en la Gestión de Cambios del cliente. Autoridad para aprobar y publicar versiones oficiales. Credenciales de publicación contra N6.
- **interfaces_que_usa** — **N13 (Cockpit — módulo Gestión de Cambios)**, **N14 (Consultio, heredada)** con **N8** debajo, **N6** (publica), **N15/Arnesia** (mantiene arneses).
- **momentos** — Etapa 3 (operación y mejora continua), tras la transferencia desde N9.
- **comunicacion** — Vía Cockpit (Gestión de Cambios) → N6 (publica versiones) · Consultio → N8 (motor) · git a N6.
- **riesgos_abiertos** — (1) Perfil real del analista (técnico/no-técnico) → la UI debe ocultar git del todo. (2) Modelo de firma electrónica que satisfaga a un auditor ISO (clic autenticado = aprobación si el procedimiento lo define). (3) Qué permisos/arneses cambian en la transferencia desde N9.
- **fuentes** — Operador (CK-18) · `docs/research/rediseno-total/06-gestion-cambios-iso.md`.

---

## N10 · Developer (del cliente) — actor

- **objetivo_del_actor** — Construir el software a medida de la organización (Sistema B) contra sus sistemas, gobernando a Claude Code (N8) desde DevStudio (N5). Del cliente, si lo tiene.
- **resumen** — El humano que implementa capabilities en el sistema a medida, con N8 como copiloto y N5 como consola.
- **plano · tipo · madurez** — Edge (laptop) · actor · existe.
- **responsabilidades / no_objetivos** — Implementa, testea, lleva a prod contra el sistema a medida (N18) **[R14]**. NO diseña el mapa de procesos (eso es el consultor/N9) · NO decide prioridades de negocio (los niveles de la org, N11).
- **permisos / RACI** — R en desarrollo. Credenciales least-privilege contra el código y los entornos del cliente. Su propia suscripción Claude Code (N8, ToS).
- **interfaces_que_usa** — N5 (DevStudio), N8 (Claude Code), el repositorio de código + N18 (Sistema B).
- **momentos** — Etapa 3 (desarrollo continuo de capabilities).
- **comunicacion** — git/HTTPS a los sistemas del cliente; suscripción a Anthropic.
- **riesgos_abiertos** — ¿El cliente tiene devs? Si no, el desarrollo a medida lo hace Prenter (modelo de entrega). Los arneses de dev se modifican en Arnesia (N15).

---

## N11 · Usuarios de la organización (4 niveles) — actor

> Re-fichado CK-18: era "CEO / sponsor". Ahora son los cuatro niveles de la organización, cada uno con
> su nivel de acceso a Cockpit.

- **objetivo_del_actor** — Ver la organización viva (mapa, OKRs, brechas, indicadores del día a día) **según su nivel de acceso**, y mover sus KPIs. Cuatro niveles: **Gobernanza** (directorio), **Estratégico** (C-level/gerencias), **Táctico** (jefaturas), **Operativo** (analistas/usuarios).
- **resumen** — Toda la organización es usuaria de Cockpit vía navegador; cada nivel ve lo que su rol permite, en coherencia con la estructura del Repositorio Oficial. Los operativos, además, operan su día a día con Colab Studio (N17).
- **plano · tipo · madurez** — Edge (thin browser; operativos también con app) · actor · existe.
- **responsabilidades / no_objetivos** — Gobernanza da contexto/objetivos **[R1]** y ratifica prioridades; todos consumen su vista por nivel. Operativo, además, ejecuta procesos con sus arneses (vía N17). NO operan el método de levantamiento (eso es el consultor) · NO ven lo que su nivel no permite.
- **permisos / RACI** — Gobernanza = máxima autoridad del negocio (A en objetivos/prioridades). Los niveles descienden: Estratégico > Táctico > Operativo, con visibilidad fina por rol derivada de N6.
- **interfaces_que_usa** — **N13** (Cockpit, vista por nivel, navegador) · **N17** (Colab Studio, solo operativos).
- **momentos** — Etapa 1 (Gobernanza da objetivos) · Etapa 3 (todos, cockpit vivo, continuo).
- **comunicacion** — HTTPS (navegador) a N13 · (operativos) app sobre N8.
- **riesgos_abiertos** — (1) Modelo de niveles de acceso real (autorización en N13, ex-BL-12). (2) Onboarding de usuarios/credenciales por nivel. (3) Coherencia del mapa nivel-organizacional ↔ nivel-de-acceso (policy-as-data derivada de N6).

---

# Chequeos de consistencia (el pago del esquema)

Las fichas permiten verificar las decisiones de arquitectura del modelo CK-18.

### 1 · Protección del método — ahora por licencia + contrato (deroga el límite arquitectónico)
⚠️ **Cambio de fondo (CK-18).** El límite firmado "el método nunca queda con el cliente" queda
**DEROGADO**: el método SÍ cruza, empaquetado en **arneses** que corren en el edge del cliente
(Consultio/N14, Colab Studio/N17) y con **Arnesia (N15) entregada** para que el cliente lo mantenga.
La protección pasa de **arquitectura** (el método no baja) a **licencia + contrato** (baja, con Arnesia
licenciada y términos de mantenimiento; el canal de arneses N3 es revocable). Riesgo residual
documentado en N2/N14/N15: cuánto método baja empaquetado, y que la protección ya no es "fuerte por
arquitectura". Decisión del operador (D1, CK-18).

### 2 · Residencia del dato — por tier, no por dogma (reescrito CK-21)
⚠️ **Default invertido (CK-21/D3, revierte parcialmente el D3 de CK-18).** El plano Organización
(N6+N13+N16+N12) es **una instancia aislada por cliente** y corre en dos modalidades:
- **Default comercial — hosteada por nosotros** (single-tenant, suscripción): los datos del cliente
  **residen en nuestra nube bajo DPA** — aislamiento por instancia, cifrado at-rest, BYOK para tier
  alto. Nos vuelve procesadores de datos personales (compliance presupuestado, deuda CK-21). Razón:
  el cliente PyME no paga consultoría de infra antes del valor.
- **Tier enterprise/regulados — instalada en la red del cliente**: conserva la promesa original
  ("sus datos en su infra"); toda comunicación cliente↔Fabricante saliente/PULL (N3); el Fabricante
  nunca disca al cliente.
Multitenant real = fase 2 (>10-20 clientes), nunca antes de vender. En ambas modalidades la
arquitectura es la MISMA (la instancia no sabe dónde corre) — el pivote es comercial, no técnico.

### 3 · No casado a Claude Code · ToS ← `runtime` + `licencia`
✅ Coherente y **forzado por ToS**. Todo el edge corre sobre **N8** (Claude Code, suscripción del
humano) — una instancia por humano firmado; las apps (N14/N17/N5) son superficies que se cuelgan del
motor, ninguna toca credenciales de Anthropic. No hay compute server-side en el modelo (murió N7); si
algún día lo hay, va por API key. El split es obligación de términos, no preferencia.

<a name="hallazgo-rojo"></a>
### 🟢 "Transitan, no persisten" — promesa del tier self-hosted (re-alcance CK-21)
La promesa precisa **aplica al tier enterprise/regulados** (instancia en la red del cliente): los
datos **NO persisten fuera de su red, pero SÍ transitan** durante la inferencia — los agentes
locales (N8, debajo de Consultio/Colab Studio/DevStudio) llaman a la API de Anthropic; con
zero-retention se procesan y descartan, **no se almacenan** afuera. LLM on-premise = opción futura
para quien prohíba incluso el tránsito. **En el default hosteado (CK-21) esta frase NO se usa**: ahí
la promesa es "instancia aislada, cifrada, bajo DPA, exportable — tu organización as-code es un repo
git que te llevas cuando quieras" (cero lock-in como promesa sustituta).

---

<a name="seg-cumpl"></a>
# Seguridad, cumplimiento y contratos (roadmap progresivo)

> Base para hacer las cosas bien a futuro: certificaciones, moldes de contrato y controles que
> cubriremos progresivamente. Investigado sobre prácticas de McKinsey/BCG/Big4 (jun 2026). Referenciado
> desde el campo `nfr` de los nodos servicio.

**Principio:** el **contrato es el piso** (recurso, no prevención); la **prevención** es organizacional
+ técnica. En el modelo CK-18, con el método entregado al cliente, el **licenciamiento (N3) y el
contrato de mantenimiento** cargan más peso: definen qué puede el cliente hacer con Arnesia y los
arneses, y habilitan la revocación.

### Espectro "no quedarse copia" (de simple a fuerte)
1. **NDA + cláusula de no-retención** (DPA). Solo contractual.
2. **VDR / view-only** + DRM + watermark + audit log + expiración.
3. **Zero Data Retention / efímero** — stateless, en memoria, logs sin crudo, persistir solo resultados.
4. **BYOK / CMK** — el cliente tiene y revoca la llave.
5. **Cómputo-al-dato / data clean room** — el crudo no se mueve; solo salen agregados.
6. **Confidential computing / TEE + atestación** — ni el operador ve el crudo; verificable por hardware.

Nuestra arquitectura (instancia aislada por cliente — en su infra en el tier enterprise/regulados,
bajo DPA en el default hosteado — + N12 con destrucción + inferencia zero-retention)
nos para en niveles **3–5 por diseño**; 4 y 6 se agregan para regulados. La protección del **método**
(nuestra IP) ahora es contractual (licencia de Arnesia + arneses), no arquitectónica — es el trade-off
firmado en D1.

### Certificaciones (cubrir progresivamente)
- **Ahora / corto plazo:** equivalente funcional de SOC 2 respondible en un DDQ — control de acceso,
  cifrado TLS 1.3 + AES-256, audit trail, data residency declarada, licenciamiento.
- **Cuando el cliente lo exija:** SOC 2 Type II e ISO 27001 formales; por sector, PCI DSS / HIPAA.

### Moldes de contrato a tener listos
- **NDA** (pre-engagement) · **DPA** tipo procesador (GDPR Art. 28: destrucción al cierre, auditoría)
- **Licencia de Arnesia + arneses** (qué puede el cliente, límites, mantenimiento, revocación) — nuevo, central en CK-18
- **Clean Team Agreement** (info sensible / múltiples partes) · cláusula de **no-retención + destrucción**

### Fuentes
[McKinsey — clean teams](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/deal-delays-are-the-new-normal-clean-teams-are-the-fix) · [GDPR DPA Art. 28](https://gdpr.eu/data-processing-agreement/) · [SOC 2 vs security questionnaires](https://secureframe.com/blog/soc-2-vs-security-questionnaires) · `docs/research/rediseno-total/`

---

# Pendientes consolidados (narrativa — el tracking vive en `docs/product/`)

> **Disciplina (CK-19, supersede CK-11/CK-14):** el pendiente se trackea en **`docs/product/`**
> (historias + releases; `docs/product/_archive/backlog.yaml` quedó ARCHIVADO — mapeo lossless en
> `docs/product/MAPEO.md`). Roadmap vigente: F1 "Terreno + MVP Twin" (CK-22, re-secuenciada
> twin-first CK-23) → F2 "Comercial" → F3 "Edge completo + escala". Esta lista queda como narrativa
> del ecosistema.

1. **Rediseño CK-18 firmado** — Fabricante + Organización instalada; método entregado en arneses;
   Repositorio Oficial confidencial; Data Lakehouse; Cockpit con Gestión de Cambios + niveles; muertes
   de N1/N4/N7. Decisiones D1–D5 del operador firmadas.
2. **Consultio (N14):** v0 = arneses del método M1-M3 sobre Claude Code pelado (CK-21/D7 — **ya NO
   espera al clon DevStudio**; el shell llega en F3). Colab Studio (N17) misma familia, F3.
3. **Repositorio Oficial (N6):** BD vs archivos → git/archivos = SSoT, BD = índice derivado. Forgejo
   (historia `forgejo-self-hosted-bd-vs-archivos`, F1.3).
4. **Data Lakehouse (N16):** dlt + DuckLake, **residencia por tier (D3: default hosteado)**. Historia
   `construir-lakehouse-dlt-ducklake` (F1.4) + `captura-manual-kpis` (fuente manual de primera clase
   para la org sin sistemas — auditoría 2026-07-17).
5. **Knowledge Database:** declarada `pendiente`, files-first en el repo; vector DB nunca antes de
   demanda (D5). BL nuevo.
6. **Gestión de Cambios (N13):** entidades Solicitud/Versión/Aprobación/Acuse/RevisiónPeriódica; UI
   que oculta git; niveles de acceso reales (ex-BL-12, sube a alta). BL nuevo.
7. **Plano del Fabricante (N3):** go-tuf v2 + TUF-on-CI, Tauri updater, marketplace privado revocable,
   license files Ed25519, OTLP/mTLS opt-in. BL nuevo.
8. **Diferidos:** voz (ex-N4) como herramienta futura del arnés · levantamiento desatendido (ex-N7) si
   algún día se necesita, por API key.
9. **Organization as Code → Organization Twin (CK-21)** — la visión con nombre: twin = deseado (N6) ×
   real (N16) × brecha continua (N13); hilo de oro medido (objetivos→OKR→KPI); brechas con costo/ROI →
   ciclo brecha→proyecto dentro de Cockpit; default comercial hosteado single-tenant (chequeo 2
   reescrito); N3 = Portal con licencias por fingerprint; Consultio v0 = arneses sin shell; capa
   kinética + OKR/KPI/Proyecto al `objeto.schema` (doctrina Palantir); horizontes gateados (what-if
   por branch → BPSim/DEMO → agentes LLM con arneses; MCP server del twin = V2). TO-BE de 37
   capacidades + MVP: `docs/research/organization-as-code/07-capability-list-tobe.md`.
10. **Re-fichado fino ejecutado (2026-07-17, historia `arquitectura-refichado-ck21`):** R16/R17 al
    R-walk · residencia por tier en fichas · doctrina de notaciones del twin as-code
    (`sistema/metodo/NOTACIONES.html` — estándares como vocabulario, schema propio como metamodelo)
    · **CK-24** frontera métricas de persona (el twin mide roles/procesos/áreas; persona-nombrada =
    opt-in Gobernanza) · D-07 clavada (techo=empresa; proyecto/sucursal = unidad de ejecución).
