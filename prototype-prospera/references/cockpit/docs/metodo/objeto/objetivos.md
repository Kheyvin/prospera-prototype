# Capítulo · Objetivos (metas + resultados clave)

> El marco del `objetivo` — el **O2** del backbone (a dónde quiere llegar la empresa). Este capítulo es
> también la **metodología con la que trabajaremos tus metas**, así sabes en qué formato entregármelas.

---

## 1 · Qué es un objetivo (y por qué OKR)

- **Definición.** Un **resultado deseado** (el *Objective*, cualitativo e inspirador) **+** uno o más
  **resultados clave medibles** (los *Key Results*, cuantitativos, `from → to`). El objetivo dice *dónde*;
  el KR dice *cómo sabremos que llegamos*.
- **Marco/Norma.** **OKR** (M21) — Objective + Key Results. **ISO 9001 cl.6.2** (objetivos de calidad:
  medibles, monitoreados, comunicados, con un **plan** 6.2.2: qué · recursos · responsable · cuándo · cómo se
  evalúa). **Hoshin Kanri** (M26) para la **cascada** multi-nivel (`parent_ref`). **Impact Mapping** (M06)
  para conectar el KR con **qué lo mueve** (`driver_refs`).
- **Fuente.** M21 (OKR) · M16/ISO cl.6.2 · M26 (Hoshin) · M06 (Impact Mapping).

## 2 · La analogía

El **Objetivo** es el **destino** ("llegar a la cima"). El **Key Result** es el **odómetro** que prueba el
avance (`from → to`: de 2 clientes a 6). El **driver** es el **motor** — qué proceso o capability empuja la
aguja (p.ej. el proceso *Captación/CRM* mueve el KR "nuevos clientes"). Sin odómetro, un objetivo es un
deseo; sin motor, no sabes qué palanca jalar.

## 3 · En el schema

`objetivos/obj-*.yaml` (v2 — historia schema-v2):
```
id · nombre (el Objective) · descripcion · horizonte (enum: proposito|3a|anual|trimestre)
cadencia_revision · estado{vigente|deprecado, superseded_by, vigencia} · perspectiva (BSC, opcional)
dueño_ref→rol · consistente_con_politica (ISO 6.2.1b)
plan{que, recursos[], responsable_ref→rol, fecha, como_evaluado}
parent_ref→objetivo (cascada Hoshin/GPD) · key_results[]  (embebido; OPCIONAL en v2 —
  ausencia = warning `sin-ancla-de-valor`, no error)
```
Cada `key_result` (weak-entity, id `obj-x#krN`):
```
descripcion · metrica · from/to/current (NUMÉRICOS en v2) · unit · quarter (ciclo)
kpi_ref → kpi          (frontera permeable: el KR = contrato de CAMBIO sobre la serie de un KPI)
accountable_ref → rol  (KR ownership — §8)
acople_compensacion    (bool — SOLO válido en modo gpd-anual|mixto, ver §6-bis)
driver_refs[] → proceso | capability   (qué mueve la aguja — Impact Mapping)
```

## 4 · Cómo entregarme tus objetivos (el formato)

Para cada meta, dame:
1. **El objetivo en una frase** — inspirador, cualitativo (el *destino*). Ej: *"Convertir a Prenter en un
   negocio de ingresos recurrentes predecibles."*
2. **1–3 key results** — cada uno con: **métrica · valor actual (`from`) · meta (`to`) · horizonte/quarter**.
   Ej: *"Clientes en retainer: de 0 a 5, para Q4-2026."*
3. *(Opcional)* **qué crees que lo mueve** — un proceso o capability. Ej: *"lo mueve Captación/CRM +
   Entrega-retainer."* Si no lo pones, yo propongo el `driver_ref` y tú validas.

> Si **no tienes el número actual** (`from`) o el target, **dímelo** — lo dejo marcado, no lo invento
> (disciplina de provenance). Un KR sin baseline no es medible; mejor vacío-y-honesto que inventado.

## 5 · Trampas

1. **Un objetivo no es una tarea.** "Construir el Asistente IA" es un *output* (una tarea); el objetivo es el
   *outcome*: "que el Asistente IA genere adopción/ingresos". El KR mide el outcome, no la entrega.
2. **KR sin `from` = no medible.** Todo KR necesita línea base y meta; si falta el dato, se marca, no se inventa.
3. **Cascada, no lista.** Objetivos de nivel-empresa → objetivos de área (`parent_ref`, Hoshin). No mezclar
   niveles en una bolsa plana.
4. **El TO-BE es tuyo.** Los objetivos los fijas tú (verdad de negocio); yo estructuro y cableo, no decido la meta.

---

## 6 · El sistema completo: de la visión al rol (multi-horizonte)

Fijar objetivos de directorio **no es elegir un framework — es apilar varios**, cada uno con un *job* distinto.
**Hoshin/BSC = el mapa** (estrategia + coherencia anual) · **OKR = el motor** (ejecución trimestral) ·
**Impact Mapping = el puente** (vuelve un KR en los entregables/actores que lo producen). Se compensan: Hoshin le
da a OKR la arquitectura plurianual que le falta; OKR le da a Hoshin la agilidad trimestral; Impact Mapping evita
que OKR degenere en lista de tareas.

| Capa | Horizonte | Framework | Artefacto | Dueño |
|---|---|---|---|---|
| **0 · Propósito** | atemporal / 10 a | **Visión + Misión** | 1-2 frases | fundador |
| **1 · Dirección estratégica** | **3-5 años** | **Hoshin breakthroughs** (BSC 4 perspectivas = checklist) | 3-5 pilares estratégicos | fundador |
| **2 · Plan anual** | 1 año | **Hoshin anual + OKR anual** | one-pager del año | fundador |
| **3 · Ejecución** | **trimestre (90 d)** | **OKR** | OKR de empresa (luego equipos) | líderes / agentes |
| **4 · Qué construir** | continuo | **Impact Mapping** | KR → drivers (proceso/capability) | ejecutores |
| **5 · Rol / individuo** | continuo | **KR ownership** (no OKR individual) | KR con dueño (humano *o* agente) | rol / agente |

**El pegamento:** *roll-up* (los KR trimestrales agregan a los objetivos anuales → a los breakthroughs → sirven a
la Visión) + **una sola fuente de verdad** (misma definición de métrica en todas las capas) + *catchball* (diálogo
ida-y-vuelta al fijar cada nivel). Todo OKR debe **trazar hacia arriba** a un pilar, o es ruido.

> **Cascada canónica ÚNICA del hilo medido** (cementada — spec `arquitectura-refichado-ck21` · CK-24):
> `plan 3 años → plan anual → objetivo (directorio) → KR (OKR trimestral) → KPI (de proceso, con dueño =
> ROL o área) → actividad (verbo)`. Las capas 0-5 de arriba son la **precedencia de frameworks**; el hilo
> MEDIDO baja por esa cascada. La persona entra como **ocupante del rol** (persona→cumple→rol→dueño-de→KPI),
> **no** como eslabón de medición individual — coherente con §8 (KR ownership, no OKR individual).

## 6-bis · El modo regional: OKR, GPD o mixto (research LATAM/BR, 2026-07-17)

La investigación de la historia schema-v2 (00-research-latam-br.md) verificó el estándar real por
mercado: **Brasil = GPD** (Gerenciamento pelas Diretrizes, Falconi — desdobramento de metas anuales
por nivel + giro PDCA + acople a remuneración variable/PLR; Falconi atiende 3 de cada 4 "Melhores e
Maiores"); **LATAM hispano = BSC como mapa** (por eso `perspectiva` en el objetivo); **OKR = la
cadencia de 90 días** (tech/áreas digitales). Veredicto estructural: **GPD y OKR son EL MISMO grafo
de cascada** — difieren en cadencia (anual vs trimestral) y en acople a compensación (permitido vs
prohibido). Por eso el modo es **configuración de la empresa** (`empresa.config_estrategia.modo:
okr-trimestral | gpd-anual | mixto`), no entidades distintas:

- Modo **okr-trimestral**: KRs con ciclo de 90 días; `acople_compensacion` PROHIBIDO (sandbagging —
  Bock: "totally divorced from compensation").
- Modo **gpd-anual**: el `parent_ref` ES el desdobramento; KRs = metas anuales con valor y plazo
  ("meta sem valor e prazo não é meta"); `acople_compensacion: true` VÁLIDO (PLR).
- Modo **mixto**: desdobramento anual arriba + cadencia OKR en áreas que la adoptaron (el patrón
  real de los corporativos brasileños hoy).

## 7 · Temporalidad y cadencia (trabaja hacia atrás)

**Visión (5-10 a) → objetivos estratégicos (3 a) → plan anual (1 a) → prioridades trimestrales (90 d)** +
check-ins semanales. Se deriva **hacia atrás**: imagina 5 años → deriva 3 → deriva 1 → deriva el trimestre.
- *¿Por qué 3 años?* Lo bastante lejos para ser estratégico, lo bastante cerca para ser creíble y accionable.
- *¿Por qué 90 días?* Es la **unidad de ejecución**: crea urgencia; el año da falsa sensación de tiempo abundante.

**Cadencia de gobierno (por capa, no solo los objetivos):** sesión **anual** profunda (reset 3-años + plan anual) ·
revisión **estratégica trimestral** (reset OKR, reasignar 20-30% de capacidad a lo de mayor impacto) · revisión
**operativa mensual** (drivers/iniciativas) · **check-in semanal** de 15 min (ejecución). Fuente del anidamiento
explícito: EOS/Traction (10a→3a→1a→Rocks trimestrales) · Hoshin · OGSM · el *dual cadence* anual+trimestral de OKR.

## 8 · La "bajada" al rol: *alignment* + *catchball*, NO cascada estricta

El veredicto de la práctica moderna: **cascade ≠ alignment, y alignment gana.**

- ❌ **Cascada OKR estricta** (el KR del jefe = tu objetivo, literal): pérdida de contexto, rigidez, mata la
  creatividad bottom-up, "resentimiento estructural". Google/Laszlo Bock lo llama el método viejo.
- ❌ **Balanced Scorecard de 3 tiers** y **MBO waterfall**: trazabilidad buena pero burocracia de organización grande.
- ✅ **OKR *alignment* (~50% arriba / 50% abajo) + *catchball* de Hoshin + *golden thread* explícito:** liderazgo
  publica 3-5 pilares; cada área/rol **redacta su propio OKR** ligado al pilar padre; el diálogo ida-y-vuelta
  (catchball) negocia factibilidad. Para una empresa chica es barato — conversaciones, no matrices.
- **Rol = KR ownership, no OKR individual.** Un rol (o agente) es *accountable* de KRs dentro de un OKR de
  equipo/empresa. Twitter y Spotify abandonaron los OKR individuales: *"el indicador pertenece al equipo"*.

**Cómo cae en nuestro schema:** `objetivo.parent_ref` **ES el golden thread / cascada** — la bajada
al rol = objetivos anidados, cada uno con `dueño_ref → rol`; el objetivo-hoja lo posee el rol (el *socket*).
`key_result.driver_refs` **ES el Impact Mapping**; `key_result.accountable_ref` **ES el KR ownership**.
No hacen falta OKR individuales ni entidad OKR nueva.

> **Fuentes primarias del "no OKR individual"** (verificadas 2026-07-17, 00-research de la historia
> schema-v2): Spotify HR blog 2016 ("we decided to ditch individual OKRs" — proceso sin valor);
> Rick Klau (autor del video canónico de Google) 2017: "Skip individual OKRs altogether"; HBR
> dic-2020 (Gothelf/Seiden): "Use OKRs to Set Goals for Teams, Not Individuals"; Bock: divorcio
> total OKR↔compensación (≤⅓ del input de evaluación). Razones: sandbagging · degeneración en
> task-list · costo administrativo · conducta egoísta. "Twitter los abandonó" NO tiene fuente
> primaria localizable — no citarla.

## 9 · Agentes IA como "trabajadores" con KRs

Práctica emergente (2026): darle a un agente **el objetivo/KR como su spec** — el KR se vuelve **la métrica de
evaluación del agente**. Implicaciones:
- Cada agente = un **objetivo + KRs** + **guardrails** (runbooks/prompts) + su lugar en un **DAG de orquestación**.
- Evalúa al agente como un *perf review continuo*: exactitud · latencia · alucinación · costo-por-resultado.
- **Diseña para el desajuste de ritmo:** el agente itera ~1000× más rápido que el ciclo trimestral → parea el
  *objetivo* trimestral (humano fija el *qué*) con **evals automáticos + human-in-the-loop** (el agente corre el
  *cómo*). Conecta con el *eval harness* y el proceso *Personas y gobierno de agentes*.

## 10 · Versión lean para Prenter HOY (1-5 personas)

**CONSERVA (mínimo que sostiene la carga):** Visión + Misión (1 línea c/u) · **1-3 breakthroughs anuales** en un
one-pager (no la X-matrix completa) · **1 set de OKR de empresa por trimestre** (1 objetivo, 2-3 KR con dueño) ·
**check-in semanal 15 min** + revisión mensual "¿vamos con el plan anual?".
**DIFIERE hasta tener equipos reales:** OKR individuales · árboles OKR multinivel · BSC como sistema/software (úsalo
solo como **checklist de 4 perspectivas**: ¿ignoro Cliente? ¿Proceso? ¿Aprendizaje?) · ceremonia formal de catchball.
**Reglas:** *arranca arriba* (OKR de empresa primero) y *arranca trimestral* (más largo pierdes agilidad; más corto
solo gestionas tareas).

## 11 · Fuentes (capítulo)

Balanced Scorecard (Kaplan-Norton; balancedscorecard.org) · Hoshin Kanri X-matrix + catchball (KaiNexus · Asana ·
i-nexus) · OKR cascade-vs-alignment (What Matters · The North · Caroli) · EOS/Traction V/TO + 3-Year Picture
(EOS Worldwide) · OGSM (Perdoo) · 4DX (FranklinCovey) · MBO (Umbrex · Mooncamp) · integración Hoshin+OKR+BSC
(Profit.co · Mooncamp) · OKR+Impact Mapping (Dabrowski) · OKRs para agentes IA (Quasa · Relevance · Akira) ·
lean OKR (Obvious Ventures · Weekdone) · strategic-planning cadence (Rhythm Systems · Umbrex · C12).
