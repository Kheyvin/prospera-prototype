# Proceso como dato — modelo de datos

> **Qué es:** el esquema que vuelve TODO el proceso de engagement (módulos → etapas → pasos) en
> **datos estructurados**, del que se renderizan **ambas vistas** (consultor / cliente) y la
> **proyección SQLite**. Es el primitivo arquitectónico que mata "múltiples sistemas" (un modelo, dos
> experiencias) — ver [`ARCHITECTURE.md`](prtProspera/prototype-prospera/references/cockpit/docs/architecture/producto/ARCHITECTURE.md).
> **SSoT de los datos:** archivos en `process/` (front-matter MD por paso). **Narrativa de diseño:**
> [`M3-ESPINAZO.md`](M3-ESPINAZO.md) · [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md) (el *por qué*).
> **Última actualización:** 2026-06-19

---

## Por qué
Un solo modelo de proceso, renderizado dos veces:
- **Consultor** ve el playbook completo (qué hacer + metodología detrás + gate + artefactos).
- **Cliente** ve su journey (pasos que se desbloquean + logros), sin jerga ni pasos internos.
- **SQLite** proyecta el modelo para queries, progreso, grafo del Hilo de Oro y rollups.

## Dos capas
| Capa | Qué | Dónde | Propiedad |
|---|---|---|---|
| **Definición** (plantilla) | el playbook: módulos/etapas/pasos y su metadata | repo factory, `process/` | **nuestra IP** |
| **Instancia** (corrida) | estado por cliente: qué paso va, artefactos, gates sellados | repo cliente | del cliente |

Patrón definición/ejecución (como un motor de workflow): una plantilla, N corridas.

## Almacenamiento (decisión AskUserQuestion · 2026-06-19): front-matter MD por PASO
```
process/
  README.md
  <modulo>/
    _modulo.md                 # metadata del módulo
    <etapa>/
      _etapa.md                # metadata de la etapa
      <paso>.md                # un archivo por paso: frontmatter (estructura) + cuerpo (prosa playbook)
```
- **Frontmatter** = los campos estructurados (id, gate, deps, refs) → la proyección SQLite mapea 1:1.
- **Cuerpo** = la prosa del playbook (`Qué hacer` + `Detrás/metodología`), concisa, con `ref:` a la narrativa de diseño (M1/M3/SERVICE-DESIGN) para el *por qué* extendido.
- Granular: git-diff por paso; un agente edita un paso aislado.
- **Relación con `core-harness/process/`:** ese es el **ciclo SDD de 10 estados** (lifecycle de una *historia*, gates G1–G8). Esto es la capa **por encima** (el *engagement*: módulos/etapas/pasos). Conectan en los gates: Paso con `gate: G1` = entra al lifecycle SDD; `gate: G3-G8` = construcción.

---

## Esquema — Definición

### Modulo (`_modulo.md`)
`id` · `nombre` · `fase` (A|B) · `runtime_dominante` (conversación|análisis|construcción) · `orden` · cuerpo: descripción + `ref`.

### Etapa (`_etapa.md`)
`id` · `modulo` · `nombre` · `dueño` · `gate` · `orden` · `objetivo` · cuerpo: descripción + `ref`.

### Paso (`<paso>.md`) — la unidad central
| Campo | Tipo | Significado |
|---|---|---|
| `id` | str | p.ej. `m3.e0.p5` |
| `modulo` · `etapa` · `orden` | refs/int | ubicación en el árbol |
| `titulo_interno` | str | nombre para el consultor |
| `titulo_cliente` | str | nombre sin jerga para el cliente |
| `objetivo` | str | qué logra el paso |
| `actor` | `{quien: 🧑\|🤖\|ambos, rol}` | quién ejecuta (rol RACI) |
| `plano` | enum | conversación\|análisis\|construcción\|ui |
| `modo_ux` | str | revisión\|decisión\|conversación\|observación… |
| `gate` | `{tipo: none\|humano\|G1\|G3-G8, autoridad: rol}` | si es gate y quién lo pasa |
| `consume[]` · `produce[]` | artefacto ids | los handoffs (entradas/salidas) |
| `interfaz[]` | interfaz ids | qué interfaz(es) usa (inventario SERVICE-DESIGN §6) |
| `fricciones[]` | str[] | qué evitar |
| `desbloqueo` | expr | de qué pasos/artefactos depende (define el unlocking del journey) |
| `cliente_visible` | bool | si aparece en la vista cliente |
| `metodologia[]` | refs M-NN | el "detrás de cada paso" (METODOLOGIA.md) |
| `blueprint` | mapping | proyección del swimlane (TiSDD): `emocion` · `accion_consultor` · `accion_cliente` · `frontstage` · `backstage` |
| `ref` | str | sección de la narrativa de diseño (por qué extendido) |
| **cuerpo** | md | `## Qué hacer (consultor)` + `## Detrás (metodología)` |

> **Prototipos generados (anti-drift):** `scripts/gen_prototypes.py` lee `process/` + una **instancia de
> muestra** (`process/_sample/*.yaml`: empresa·sponsor·consultor·meta + estado por etapa) y emite
> `docs/vision/prototypes/vista-consultor.html` (journey, desde modulos/etapas/pasos) y `service-blueprint.html`
> (swimlanes, desde el bloque `blueprint:`). Editá la fuente → corré el script → ambos se actualizan. El
> `_etapa.md` puede llevar `lens` (consultor|sponsor) y `momento` para el blueprint. **Los `.html` son
> artefactos generados — no editar a mano.**

### Artefacto · Interfaz (catálogos, refs)
`Artefacto { id · nombre · productor_paso · consumidores[] }` · `Interfaz { id · nombre · vista (consultor|cliente|ambas) · plano · estado }`.

---

## Carriles + tareas — esqueleto del blueprint (sponsor-first) · acordado 2026-06-19

**Jerarquía:** Módulo → Etapa → **Fase** (= el archivo `p*.md`, la columna del blueprint) → **Tarea** (sub-paso).

**El blueprint es del CLIENTE (Sponsor + a quien delegue)** — el que *recibe* el servicio. El consultor es
**proveedor** (frontstage humano), no cliente. Carriles, **iguales en toda etapa** (cambia la densidad, no la estructura):
```
 CLIENTE  (Sponsor + delegados)
 ── línea de interacción ──
 CONSULTOR  (frontstage humano · "la línea antes del sistema")
 SISTEMA · frontstage  (cockpit visible)
 ── línea de visibilidad ──
 SISTEMA · backstage   (planos Análisis / Conversación)
 SOPORTE  (filesystem · ledger · frameworks)
```
> Reemplaza el `lens` por etapa (deprecado). Una sola estructura sponsor-first.

**Tarea (BPMN-lite):** `{ carril · tipo: humana|sistema|reunion|decision|espera · actor · que · plantilla? · output? }`.
Una fase tiene `flujo_ideal: [tareas]` + `flujos_alternos: [{cuando, tareas}]` (**profundidad opcional**: fases
simples = 1 tarea). **Reunión** = tarea virtual con `output: resumen IA` (plano Conversación).

**Conexión con el proceso:** las tareas de carril **Consultor + Sistema** = nuestro **proceso** (lo que vive en
`process/`). El blueprint = **esas mismas tareas vistas desde el cliente**. Una tarea = un nodo del proceso →
dos vistas, un dato, **no se estorban**.

**Qué identifica cada carril:** Sistema → qué tiene el **cockpit** · Consultor → qué necesita **a mano** el
consultor (vistas, plantillas, guiones) · Cliente → la **experiencia del sponsor**.

**Dos vistas + cockpit:** blueprint = el servicio visto por el cliente (todos los carriles) · vista-consultor =
el carril Consultor + lo que dispara en Sistema · **el usuario del cockpit sigue siendo el consultor** (consultant-first, I-08).

*Fuentes (§1.1):* **BPMN** (M11 — tareas/gateways/eventos) · **Casos de uso** (Cockburn — flujo principal + extensiones = ideal + alternos) · **Service Blueprint** (TiSDD/NN-g — carriles frontstage/backstage).

*Migración pendiente (al implementar):* hoy el paso tiene `blueprint:` corto + `lens`; evolucionará a
`flujo_ideal/flujos_alternos` con tareas por carril; el generador sumará **drill-down por fase**.

---

## Esquema — Instancia (por cliente)
```
Engagement { id · empresa · fase_actual · contexto_org_ref }
PasoRun    { paso_id · engagement_id
             estado: bloqueado|disponible|en_curso|hecho|saltado
             desbloqueado_por[] · responsable (stakeholder) · iniciado · completado
             artefactos_producidos[]
             gate_resultado { sellado_por · cuando · evidencia } }
```
El `estado` se computa: `bloqueado` hasta que `desbloqueo` se cumple → `disponible` → … → `hecho`. Eso
es lo que el cliente ve "desbloquearse".

## El grafo Hilo de Oro
Aparte del árbol del proceso: edges `objetivo → KR → proceso → persona → sistema → capability → gap →
historia → código`. Cada `gap` / apuesta / `PasoRun` engancha ahí. La proyección lo sirve como grafo
navegable (I-12).

## Proyección SQLite (reconstruible)
Tablas = las entidades (`modulo`, `etapa`, `paso`, `artefacto`, `interfaz`, `metodologia`; `engagement`,
`paso_run`; `hilo_edge`). **Reconstruida desde los archivos** por el watcher del cockpit; nunca fuente.
Sirve: progreso por engagement, grafo Hilo de Oro, rollups de aporte, vista cliente filtrada.

## Cómo derivan las 2 vistas (del MISMO modelo)
- **Consultor:** `Modulo→Etapa→Paso` (definición) ⨝ `PasoRun` (estado) → `que_hacer` + `metodologia` (drill-down) + `gate` + artefactos. Todos los pasos.
- **Cliente:** filtra `cliente_visible=true` → `titulo_cliente` + `estado`/desbloqueo + `artefactos_producidos` (logros). Sin jerga, sin pasos internos.

---

## Worked example: M3 · Etapa 0 (Apuesta)
Primera población real en [`proceso/m3/e0/`](proceso/m3/e0) — módulo `m3`, etapa `m3.e0`, 6 pasos
(`p1`…`p6`). Valida el esquema end-to-end: gate humano en `p5`, `cliente_visible` por paso, `desbloqueo`
encadenado, refs a metodología e interfaces. La narrativa de diseño vive en `M3-ESPINAZO.md` (§Etapa 0)
y `SERVICE-DESIGN.md` (§8 Vista Apuesta); estos archivos son la **fuente operativa**.

## Pendientes
- Poblar el resto (M1 Beats 1-3, M3 Etapas 1-5) como pasos.
- Definir el formato de la **Instancia** por cliente (engagement.yaml + paso_run).
- Implementar la proyección SQLite + el watcher en el cockpit.
