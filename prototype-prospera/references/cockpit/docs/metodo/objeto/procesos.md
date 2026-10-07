# Capítulo · Procesos (la "tortuga") y sus actividades

> El marco del `proceso` — el corazón del objeto. Aquí es donde el negocio **produce valor** y donde se
> cablean casi todos los hilos (org, sistemas, capabilities). Este capítulo explica el molde antes de que lo
> llenemos, para hablar el mismo idioma.

---

## 1 · Qué es un proceso (y por qué "tortuga")

- **Definición.** Una **secuencia de actividades que transforma entradas en salidas con valor**. El *qué* es la
  capability; el proceso es el **cómo**.
- **Marco/Norma.** ArchiMate **Business Process** (M13) · **ISO 9001 cl.4.4** ("enfoque a procesos") ·
  **BPMN** para el flujo (M11) · **APQC PCF L3** para clasificarlo (M12).

**El "diagrama de tortuga" (ISO 9001 cl.4.4)** es la plantilla clásica: dibujas el proceso como una tortuga
donde el **caparazón** es la transformación y las **cuatro patas + cabeza + cola** son las preguntas que todo
proceso debe responder:

```
        ENTRADAS ──▶ [ P R O C E S O ] ──▶ SALIDAS
   (cabeza: qué        (caparazón:         (cola: qué
    entra + de quién)   transformación)     sale + para quién)
                         │  │  │  │
              ¿con qué? ─┘  │  │  └─ ¿indicadores? (KPIs)
              (sistemas)    │  └──── ¿cómo? (criterios/método)
                  ¿con quién? (roles / carriles)
```

- **La analogía.** Una **receta de cocina**: los ingredientes (entradas), el plato final (salidas), los pasos
  numerados (actividades), quién los ejecuta (carril = rol), con qué utensilios (sistemas), el punto de
  cocción a controlar (criterios) y cómo sabes que salió bien (KPIs).

---

## 2 · Las patas de la tortuga → los campos del schema

| Pata de la tortuga | Norma | Campo en `proceso` |
|---|---|---|
| **Entradas** (+ proveedor) | ISO 4.4.1a · **SIPOC** (SOMA C3) | `entradas[]{item,proveedor_ref}` |
| **Salidas** (+ cliente) | ISO 4.4.1a · SIPOC (SOMA C5) | `salidas[]{item,cliente_ref}` |
| **Disparador** | BPMN (trigger) | `disparador` |
| **Secuencia** (upstream/downstream) | ISO 4.4.1b | `secuencia_ref[]→proceso` |
| **¿Con qué?** (sistemas) | ISO 4.4.1d · tortuga (SOMA C7) | `sistemas_ref[]→sistema` |
| **¿Con quién?** (dueño) | ISO 5.3 · RACI-A | `dueño_ref→rol` |
| **¿Cómo?** (criterios/método) | ISO 4.4.1c | `criterios_control[]` |
| **Indicadores** | ISO 4.4.1c · tortuga (SOMA C10) | `kpis[]{nombre,target,unidad}` |
| **Riesgos** | ISO 4.4.1f | `riesgos[]` |
| **Mejora** | ISO 4.4.1 g-h | `evaluacion` |
| **Docs clave** | SOMA C9 | `documentos[]` |
| **Áreas que cruza** | ArchiMate aggregation (D-12) | `areas_ref[]→area` (N:M, transversal) |
| **Realiza capability** | ArchiMate realization (M31) | `realiza_capabilities[]→capability` |
| **Nivel digital** | SOMA C7 (semáforo) | `digital` (manual/externo/integrado) |
| **Clasificación** | APQC L3 | `clasificacion` |

> **Dónde vive el "manual".** No es entidad (D-08). El *cómo* = la `desc` de cada actividad + los
> `criterios_control` del proceso. El PDF/manual del cliente es **fuente** (provenance), no una caja.

---

## 3 · Actividades (embebidas) — APQC L4

Las actividades **viven dentro del proceso** (no en archivos sueltos): son *weak-entities* con id local
estable `pr-x#aN`. Regla **3NF** (D-08): composición por defecto; una actividad **se promueve** a archivo
propio **solo si** se comparte entre procesos o se vuelve blanco de automatización.

Cada actividad (subesquema `actividad`):

| Campo | Norma | Nota |
|---|---|---|
| `orden` · `titulo` | BPMN Task · APQC L4 | el paso |
| `verbo` | **Taxonomía de verbos propia ALM×MGI (M37)** — origen SOMA C4; Bloom (ex-cand. M32) **descartada**: pedagógica, mide aprendizaje y no automatizabilidad | verbo de acción consistente ("validar", "generar") |
| `carril_ref→rol` | **BPMN lane** = rol · RACI (D-09) | quién la ejecuta |
| `tipo` | BPMN-lite | humana/sistema/reunión/decisión/espera |
| `tiempo` | **VSM** (M09) | estimado → alimenta costo |
| `desc` | ISO (el "cómo" disuelto) | el método |
| `sistemas_ref[]` | tortuga "con qué" | herramientas del paso |
| `raci` | **RACI** (M25) | `{R:[],A:ref,C:[],I:[]}` — **A = exactamente 1** |

Si se necesita más profundidad, la **tarea** (APQC **L5**) es la unidad fina dentro de una actividad —
**diferida**: hoy el schema materializa hasta L4 (la actividad); `tarea` entra cuando un caso real la pida.

---

## 4 · RACI — el reparto de responsabilidad (M25)

Cada actividad reparte 4 letras sobre roles:
- **R** (Responsible) — quien *ejecuta*.
- **A** (Accountable) — quien *rinde cuentas*. **Exactamente uno** (invariante del schema; dos "A" = ambigüedad).
- **C** (Consulted) — a quien se *consulta*.
- **I** (Informed) — a quien se *informa*.

**Por qué importa a Prenter:** hoy tú eres R y A de casi todo. Marcarlo explícito hace visible **qué actividad
es candidata a que un agente tome la R** (ejecutar) mientras tú retienes la A (rindes cuentas) — el primer
paso de tu automatización.

---

## 5 · SIPOC — la vista de bordes (proyección generada, no M-card)

**S**upplier → **I**nput → **P**rocess → **O**utput → **C**ustomer (origen SOMA C3/C5). Fija los **bordes**
del proceso: de quién recibes (proveedor, interno o externo) y a quién entregas (cliente, interno o externo).
**Veredicto cementado** (spec `arquitectura-refichado-ck21`): SIPOC es una **proyección generada** — la tabla
1-página para validar los bordes con el dueño en la entrevista (M1) — y NO una M-card: el dato ya está
absorbido en `entradas[].proveedor_ref` y `salidas[].cliente_ref` (D-08/D-11). Evita procesos "huérfanos"
sin conexión al resto.

---

## 6 · Cómo el proceso teje el Hilo de Oro

Un proceso es el nodo más conectado del grafo:

```
   objetivo ──drives──▶ capability ◀──realiza── PROCESO ──sirve──▶ sistema
                                          │  dueño │  carril
                                          ▼        ▼
                                        área ◀───  rol
   brecha ──against──▶ (capability | proceso | objetivo)
```

Al escribir un proceso, cada referencia (`dueño_ref`, `carril_ref`, `sistemas_ref`, `areas_ref`,
`realiza_capabilities`) **enlaza** con las entidades que ya escribimos — y ahí es donde por fin **cableamos qué
sistema/rol/área/capability toca cada cosa**. Por eso los procesos van casi al final: necesitan que el resto
exista para apuntarles.

---

## 7 · Composición vs. promoción (la regla 3NF, D-08)

- **Por defecto:** actividad **embebida** (existence-dependent del proceso). Espejo de nuestras `tareas` inline.
- **Se promueve** a archivo propio solo si: (a) se **comparte** entre procesos, o (b) se vuelve **blanco de
  automatización** (una historia/gap la apunta). Antes de eso, embeberla mantiene alta cohesión sin drift.

---

*Fuentes de este capítulo: ISO 9001:2015 cl.4.4 (M16) · diagrama de tortuga / SIPOC (proyección de bordes) ·
BPMN (M11) · APQC PCF L3–L5 (M12) · RACI (M25) · SOMA (C3/C5 bordes, C4 verbo — hoy M37, Bloom descartada;
C7 sistemas, C9 docs, C10 KPIs — ver nota-fuente en README §6) · VSM (M09) · ArchiMate (M13)
· ISO 19011 provenance (M23).*
