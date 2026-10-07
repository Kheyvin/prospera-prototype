# Book metodológico del objeto

> **La portada.** Todo lo que modelamos en el `objeto` (empresa, áreas, roles, personas, sistemas,
> capabilities, procesos, objetivos, brechas) está **anclado a una norma o framework establecido**, y
> **cada dato lleva su fuente**. No inventamos taxonomías: adoptamos las que la industria ya validó y las
> citamos. Este book es el marco de respaldo — el *por qué* detrás de cada casilla del
> [`objeto.schema.yaml`](objeto.schema.yaml) (SSoT en `sistema/schema/`; las
> citas `met:`/`§` del schema apuntan a estos capítulos. Book movido aquí en CK-28).

---

## 0 · Por qué un marco (y por qué con fuentes)

Tres razones, en una línea cada una:

1. **Defendible ante un auditor.** Un dato sin fuente no se sostiene (ISO 19011). "Lo puse porque me pareció"
   no es aceptable; "es la tortuga ISO 9001 cl.4.4" sí.
2. **Portable y sin drift.** Si el modelo se apoya en estándares (ISO, TOGAF, APQC…), cualquiera lo entiende
   y no deriva a un dialecto propio que solo nosotros leemos.
3. **Anti-invención.** Anclar a norma es el freno contra "me lo imaginé". La disciplina `met:` en el schema
   (cada campo declara su metodología) es ese freno hecho contrato.

**La analogía:** es la diferencia entre construir "a ojo" y construir con **código de edificación**. El
plano puede ser tuyo, pero cada viga cumple una norma citable. Si algo se cae, sabes qué norma revisar.

---

## 1 · El backbone (la columna O)

Las entidades no están sueltas: cuelgan de una **columna de diagnóstico** de 7 estratos (los `o_code` del
schema). Es el hilo lógico de un análisis organizacional — del *contexto* a la *mejora* (v2: el
diagnóstico ya no es el final de la columna):

| Estrato | `o_code` | Entidad(es) | Pregunta que responde |
|---|---|---|---|
| Contexto | `contexto` | **empresa** | ¿quién es y en qué entorno opera? |
| Estrategia/Metas | `O2` | **objetivo · kpi** | ¿a dónde quiere llegar, y cómo se mide? |
| Operación | `O3` | **proceso** | ¿cómo produce valor? |
| Organización | `O4` | **área · rol · persona** | ¿quién lo hace y bajo qué estructura? |
| Recursos & Capacidades | `O5` | **sistema · capability** | ¿con qué, y qué sabe hacer? |
| Diagnóstico | `O6` | **brecha** | ¿qué le falta para llegar? |
| Mejora | `O7` | **proyecto_mejora · idea** | ¿qué hacemos al respecto, y funcionó? |

Leído de arriba abajo es una **entrevista de consultoría**: contexto → metas → cómo opera hoy → con quién y
con qué → dónde están los huecos → qué proyectos los cierran. El `negocio.yaml` que generaremos es esta
columna, proyectada.

---

## 2 · El mapa ArchiMate (la lente de arquitectura)

Cada entidad es además un **concepto canónico de ArchiMate/TOGAF** (M13) — así heredamos un metamodelo
probado en vez de inventar tipos:

| Capa ArchiMate | Entidades del objeto |
|---|---|
| **Motivation** (motivación) | objetivo (Goal + Outcome) · kpi (Outcome/Metric) · brecha (Assessment) · idea (Driver — propio) |
| **Strategy** (estrategia) | capability (Capability) |
| **Business** (negocio) | empresa · área (Business Actor org) · rol (Business Role) · persona (Business Actor indiv.) · proceso (Business Process) |
| **Application** (aplicación) | sistema (Application Component + Product) |
| **Implementation & Migration** | proyecto_mejora (Work Package) |

---

## 3 · Provenance (transversal a todo dato)

Cada casilla lleva **`fuente`** (de dónde salió: `Declarado` por el dueño · `Sistema leído` · `Entrevista` ·
`Inferido`) y **`conf`** (confianza: alta/media/baja). Respaldo: **M23 · ISO 19011 (auditoría)**. Regla dura:
*un número sin medición no se inventa* — se deja vacío hasta medirlo (por eso el `assessment` de las
capabilities va en blanco hoy). En este dogfood casi todo es `Declarado / alta` (sale de tu boca, el dueño).

---

## 4 · El Hilo de Oro (cómo se enlazan)

Las entidades se cablean por referencia (FK); el grafo nunca se materializa, se computa por scan:

```
  objetivo ──drives──▶ capability ◀──realizes── proceso / sistema
     │                     ▲                        ▲
     │               provided by              executed by (carril)
     ▼                    rol                      rol
  (key results)            │                        │
                     área ◀┘ (lidera)         proceso ─cruza─▶ área (N:M)
     brecha ──against──▶ capability | proceso | objetivo   (mide el AS-IS)
```

---

## 5 · Índice de capítulos

- **`glosario.md`** — el **lenguaje ubicuo** (M08 DDD): un nombre por concepto, anclado a la norma; registro de colisiones (rol/función, manual/digital, actividad/tarea). La tabla de disambiguación.
- **`entidades.md`** — el marco de cada nodo "estático": empresa · área · rol · persona · sistema · capability.
- **`procesos.md`** — el marco del proceso (la "tortuga" ISO 9001) y sus actividades.
- **`objetivos.md`** — metas + key results (OKR · ISO 6.2 · Hoshin · Impact Mapping); incluye el formato para entregarlos.
- **`brechas.md`** — el diagnóstico (gap analysis · COBIT · WSJF · FinOps); cierre del Hilo de Oro.

> Nota: `glosario.md` **gradúa** eventualmente a `GLOSARIO.md` en el repo-root de prenter-harness (referenciado por el kernel `CLAUDE.md`); mientras tanto vive aquí como capítulo del book.

---

## 6 · Tabla maestra de fuentes (M-cards → norma)

| M-card | Norma / Framework | Dónde se usa en el objeto |
|---|---|---|
| **M08** | DDD — Ubiquitous Language | naming de todas las entidades (GLOSARIO) |
| **M09** | VSM (Value Stream Mapping) | `actividad.tiempo` → costo |
| **M11** | BPMN | procesos: disparador, actividades, carriles (lanes) |
| **M12** | APQC PCF (L1–L5) | `capability.categoria` (L1) · `proceso.clasificacion` (L3) · actividad (L4) · L5 (tarea) — **diferido**; hoy el schema materializa hasta L4 |
| **M13** | ArchiMate / TOGAF | tipo canónico de cada entidad (mapa §2) |
| **M15** | COBIT (madurez 0–5) | `capability.assessment` · `brecha.nivel_as_is/to_be` |
| **M16** | ISO 9001:2015 | contexto (4.1–4.3) · liderazgo (5.3) · procesos (4.4) · recursos (7.1) · competencia (7.2) · objetivos (6.2) |
| **M21** | OKR | `objetivo.key_results` |
| **M22** | FinOps | `brecha.costo` |
| **M23** | Provenance / ISO 19011 | `fuente` + `conf` en todo dato |
| **M25** | RACI | `dueño_ref` · `actividad.raci` (A = exactamente 1) |
| **M26** | Hoshin Kanri | `objetivo.parent_ref` (cascada de objetivos) |
| **M28** | WSJF | `brecha.prio` |
| **M31** | Business Capability (TOGAF) | entidad `capability` |
| **M06** | Impact Mapping | `key_result.driver_refs` (qué mueve la aguja) |
| **M37** | Taxonomía de verbos & automatizabilidad (**propia**, clase ALM × capacidad MGI) | `actividad.verbo` (enum = schema-v2). Bloom (ex-cand. M32) **descartada**: taxonomía pedagógica — mide aprendizaje, no automatizabilidad. Ver spec `arquitectura-refichado-ck21` |
| — *(no M-card)* | SIPOC | **proyección generada de bordes** (tabla 1-página para validar con el dueño en la entrevista M1) — el dato ya está absorbido en `entradas[].proveedor_ref` / `salidas[].cliente_ref` (D-08/D-11) |

### Nota-fuente · SOMA

**SOMA** = marco SIPOC-extendido de **11 capas (C1–C11)** de la consultora **Apodictika** (demo "SOMA Act",
analizado 2026-07-17). Es el ancla de provenance detrás de las citas `SOMA C#` de este book y del schema.
**Qué adoptamos** (D-11): `verbo` + `tiempo` por actividad (C4) · proveedor/cliente por flujo (C3/C5) ·
`documentos` (C9) · cargo (C8) · el loop aprobar/rechazar en la ingesta (m2). **Qué descartamos:**
responsable = persona-nominal (corregido a `rol`, D-05/D-09) · PDFs sin modelo de datos · score IAA opaco
(lo reemplazan los dos scores DERIVADOS — RPA y agente — de M36, con `conf` propagada).

*Book vivo — cada framework nuevo que toquemos entra aquí y en su capítulo.*
