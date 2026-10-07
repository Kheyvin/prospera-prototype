# Capítulo · Entidades (los nodos estáticos)

> El marco de cada entidad que **no es un proceso**: empresa · área · rol · persona · sistema · capability.
> Formato uniforme: **Definición · Marco/Norma · Fuente · En el schema · Ejemplo Prenter · Trampas.**
> El proceso tiene su propio capítulo (`procesos.md`); objetivos y brechas llegan después.

---

## 1 · empresa (el tenant / la raíz)

- **Definición.** La organización dueña del objeto. Es el **ancla de identidad** y la **partición** (tenant):
  todo lo demás cuelga de ella por scan. Se modela **delgada** — solo identidad y contexto, no las tripas.
- **Marco/Norma.** ArchiMate **Business Actor (organizacional)** / TOGAF **Organization Unit** (M13). Su
  *contexto* y *alcance* siguen **ISO 9001 cl.4.1/4.2** (cuestiones internas/externas, partes interesadas) y
  **cl.4.3** (alcance del sistema de gestión).
- **Fuente.** M13 (tipo) · M16/ISO 9001 cl.4 (contexto/scope).
- **En el schema.** `empresa.yaml`: `id · razon_social · tax_id · sede · contexto{externos,internos,partes_interesadas} · scope · rubro_ref`. **Sin listas de hijos** (se descubren por scan).
- **Ejemplo Prenter.** `id: prenter`, Lima, `tax_id: PENDIENTE`. Delgada a propósito (D-14): socios/legal/holding
  **no** entran al objeto (eso es control plane, curado aparte).
- **Trampa.** No engordar la raíz. Si un campo solo existe por cómo está armado *nuestro* dogfood y no lo
  necesitaría el objeto desplegado de un cliente → contaminación, se rechaza (test de norma, D-14).

---

## 2 · área (unidad organizativa)

- **Definición.** Un departamento/unidad **con un líder**. No es un bucket anémico: es una empresa anidada
  (mismo arquetipo que `empresa`, un nivel abajo).
- **Marco/Norma.** ArchiMate **Business Actor (organizacional)** / TOGAF **Organization Unit** (M13). El líder
  se ancla en **ISO 9001 cl.5.3** (roles, responsabilidad y autoridad). Anidación = **TOGAF org decomposition**.
- **Fuente.** M13 · M16/ISO cl.5.3 (líder).
- **En el schema.** `areas/area-*.yaml`: `id · nombre · proposito · lider_ref→rol · parent_ref→area`. La
  relación **área↔proceso es N:M** y se guarda del lado del proceso (`proceso.areas_ref`), no aquí (hub chico).
- **Ejemplo Prenter.** `area-producto`, liderada por `rol-owner-producto`. Split deliberado de Delivery para
  que el servicio no se coma el roadmap.
- **Trampa.** El área **la encabeza un `rol`, no una persona** (el rol es el ancla estable). Y un área con
  líder ≠ una `capability` (caja-org vs. qué-sabe-hacer).

---

## 3 · rol (el cargo — el "socket")

- **Definición.** Un **cargo**: el conjunto estable de responsabilidades y autoridad. Es el **socket** donde se
  enchufa una persona (o mañana un agente). El rol es el ancla; la persona, el ocupante.
- **Marco/Norma.** ArchiMate **Business Role** (M13). **ISO 9001 cl.5.3** para responsabilidades/autoridad. Lo
  *procesal* del rol = **RACI derivado** (M25); lo *no-procesal* = campo `responsabilidades[]`/`autoridad`.
  "Cargo" en SOMA = **C8**.
- **Fuente.** M13 · M16/ISO cl.5.3 · M25 (RACI).
- **En el schema.** `roles/rol-*.yaml`: `id · nombre · responsabilidades[] · autoridad · competencias_req · capabilities_ref[]`.
  **`función` NO existe** (D-09): "las funciones de un rol" = sus asignaciones RACI a procesos = **derivado por scan** (guardarlo sería anomalía 3NF).
- **Ejemplo Prenter.** `rol-desarrollador` (ejecutor) sirve a Delivery **y** Producto; el "en qué área" no se
  guarda en el rol — emerge del `carril` de las actividades.
- **Trampa.** Modelar por rol y no por persona es lo que hace que "Christian hace todo" escale a "Christian +
  agentes" sin rediseñar el organigrama.

---

## 4 · persona (el ocupante)

- **Definición.** El actor de carne y hueso (o, a futuro, el agente) que **cumple** uno o más roles.
- **Marco/Norma.** ArchiMate **Business Actor (individual)** (M13). Sus **competencias** siguen **ISO 9001
  cl.7.2** (competencia: registro retenido). La asignación persona→rol = **ArchiMate assignment**.
- **Fuente.** M13 · M16/ISO cl.7.2.
- **En el schema.** `personas/per-*.yaml`: `id · nombre · contacto · roles[]{rol,desde,dedicacion} · competencias · reporta_a→persona`.
  `roles[]` es **lista** (N:M nativo: una persona, varios roles).
- **Ejemplo Prenter.** `per-christian` enchufa 6 roles internos; el rol Admin&Finanzas **no** está — lo cumple
  externamente chris-corp (objeto autocontenido).
- **Trampa.** Datos de PII/HR que el negocio no necesita (p.ej. fecha de nacimiento) **no** se fuerzan al
  schema. Si hace falta un registro HR de competencias (ISO 7.2), es una capa que se abre explícita.

---

## 5 · sistema (Application Component + Product)

- **Definición.** Algo con lo que se opera (una app, un SaaS, un ERP). Si además es una **oferta**, lleva un
  bloque `producto` opt-in.
- **Marco/Norma.** ArchiMate **Application Component**; el bloque oferta = **ArchiMate Product** (M13, D-10).
  Como recurso, **ISO 9001 cl.7.1.3** (infraestructura ICT). Dos ejes: **`procedencia`** (propio/compartido/
  externo/terciarizado — ownership) y **`sirve_a`** (interno/cliente-final — audiencia, renombrado de
  `audiencia` por colisión, fork E).
- **Fuente.** M13 (App Component + Product) · M16/ISO cl.7.1.3.
- **En el schema.** `sistemas/sis-*.yaml`: `id · nombre · recurso_tipo · procedencia · sirve_a · ref · estado · capabilities_ref[] · integra_con_ref[] · producto{vision,roadmap}`.
- **Ejemplo Prenter.** `sis-cockpit` y `sis-framework-sdlc` = productos propios (con `producto{}`) que además
  usamos internamente (dual, dogfood). `sis-erp-odoo` = **compartido** del holding chris-corp (`ref: chris-corp`
  por slug). El detalle rico del producto vive en su repo; el objeto solo lleva el `ref` (autocontenido).
- **Trampa.** El eje viejo `rol: soporte|producto` (D-02) **se disolvió** (chocaba con Business Role): hoy todo
  sistema es App Component, y "es oferta" se marca por la **presencia** del bloque `producto`.

---

## 6 · capability (lo que la empresa sabe hacer)

- **Definición.** Una **habilidad de negocio** — el **QUÉ**, estable y abstracto, independiente de quién/cómo/
  con qué. Sobrevive a las reorganizaciones.
- **Marco/Norma.** **TOGAF Business Capability** (M31), capa **Strategy** de ArchiMate. Se **categoriza** con
  **APQC PCF L1** (M12) y se **evalúa** con madurez **COBIT 0–5** (M15).
- **Fuente.** M31 (TOGAF) · M12 (APQC) · M15 (COBIT).
- **En el schema.** `capabilities/cap-*.yaml`: `id · nombre · descripcion · categoria(APQC L1) · parent_ref · assessment{nivel_actual,nivel_deseado,escala,evaluado_por,fecha}`. Hub: no guarda quién la realiza (inverso por scan).

### 6.1 · La analogía
Un restaurante: su *menú de lo que sabe cocinar* ("sabe hacer pasta") son sus capabilities. **No** es el chef
(`rol`/`persona`), **ni** la cocina (`sistema`), **ni** la receta paso a paso (`proceso`). Cambia el chef o
reforma la cocina: "sabe hacer pasta" sigue igual.

### 6.2 · APQC PCF — la categoría (el "Dewey" de los procesos)
Taxonomía estándar en 5 niveles: **L1 Categoría** → L2 Grupo → **L3 Proceso** → **L4 Actividad** → **L5 Tarea**.
Da lenguaje común + benchmarking. En `capability.categoria` va el **L1**. Las ~13 categorías L1: operativas
(1 Estrategia · 2 Productos/Servicios · 3 Marketing y venta · 4 Entregar productos · 5 Entregar servicios ·
6 Servicio al cliente) + soporte (7 Capital humano · 8 TI · 9 Finanzas · 10 Activos · 11 Riesgo · 12 Relaciones
externas · 13 Gestionar capacidades). Las de Prenter caen en **2.0** (construir software) y **5.0** (servicios).

### 6.3 · COBIT — el assessment (el "puntaje de estado físico" 0–5)
| 0 Incompleto | 1 Ejecutado | 2 Gestionado | 3 Establecido | 4 Predecible | 5 Optimizado |
|---|---|---|---|---|---|
| no se hace | improvisado | planificado | estandarizado/documentado | medido con datos | mejora sola |

El **delta = deseado − actual** pinta el heatmap y se materializa como **`brecha`**. Lo dejamos **vacío**: una
nota de madurez sin medición es humo (disciplina de provenance, M23).

### 6.4 · Trampas
1. **Capability ≠ proceso** (qué vs cómo).
2. **Capability-de-negocio (TOGAF) ≠ capability-de-producto** (las features del roadmap, que viven en
   `sistema.producto`). Se enlazan por *realizes*, no se confunden.
3. **TOGAF ≠ ISO 9000 3.6.12** (que usa "capability" para conformidad-de-output). Usamos **sentido TOGAF**.
