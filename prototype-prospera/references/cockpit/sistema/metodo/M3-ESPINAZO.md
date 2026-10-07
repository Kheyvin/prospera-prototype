# M3 · Mejora continua — el Espinazo (diseño detallado)

> **Qué es:** el tercer módulo. Toma una **brecha priorizada** del Diagnóstico (M1) y la lleva
> **idea → producción** de forma ordenada. Es la **columna metodológica** del producto (Discovery →
> Ejecución) y el corazón del "de idea a producción". Mapea a ISO 9001 cl.10 / PDCA (mejora continua).
> **= Fase B / Operación.**
> **Usuario primario:** varía por etapa (Sponsor apuesta · Ops explora valor · Consultor orquesta ·
> Dev/QA en construcción). El **Consultor Prenter** facilita de punta a punta.
> **Docs base:** estrategia `VISION-DESARROLLOS.md` (monorepo legacy `prenter-harness`, congelado) (§10 Espinazo · §11 UX) ·
> metodología [`METODOLOGIA.md`](METODOLOGIA.md) · handoff de entrada [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md).
> **Última actualización:** 2026-06-19

---

## Decisiones que enmarcan M3 (heredadas del Ledger — `tooling/strategy/LEDGER.md`)
- **La regla de oro (§10):** la IA **sintetiza, fundamenta y construye**; el humano **juzga, apuesta y acepta**.
- **3 planos de runtime (§17):** Conversación (etapas 0-1) · Análisis (etapas 2, 4) · Construcción
  (etapa 5). **Seam = filesystem.** Costo plano donde hay volumen (análisis/construcción).
- **Entra desde M1 Beat 3 (Diagnóstico):** el **objeto-gap** priorizado (I-16) = contrato del handoff;
  el backlog priorizado = **OST inicial** (semilla de la etapa 1).
- **Dual Track (M01):** el corte Discovery/Delivery cae en **G1** (etapa 4).
- **4 momentos humano-irreducibles:** apuesta (0) · appetite+no-gos (3) · ratificación/G1 (4) ·
  aceptación de valor (5). Tres decisiones humanas **antes** de tocar código.
- **Cierra el loop de valor:** aporte real medido (etapa 5) → re-alimenta el OST (etapa 1).

---

## El arco — las 6 etapas (de §10, con plano y gate)

| # | Etapa | Dueño | Plano runtime | Gate |
|---|---|---|---|---|
| 0 | **Apuesta / Outcome** | 🧑 humano puro | Conversación | 🔒 humano (apuesta) ← *detallado abajo* |
| 1 | **Exploración de valor (OST)** | 🧑 lidera · 🤖 estructura | Conversación | — |
| 2 | **Grounding del sistema** | 🤖 lidera · 🧑 valida | Análisis | — |
| 3 | **Shaping / Pitch** | 🧑 decide · 🤖 modela | Conversación + Análisis | 🔒 humano (appetite + no-gos) |
| 4 | **Contrato / spec ratificado** | 🤖 redacta · 🧑 ratifica | Análisis | **G1** (fin de Discovery) |
| 5 | **Ejecución** | 🤖 construye · 🧑 QA + aceptación | Construcción | G3–G8 + 🔒 aceptación de valor |

**Loop de valor:** aporte real medido (5) → re-prioriza el backlog/OST (→ 1 / M1).

---

## Etapa 0 · Apuesta / Outcome — detalle

**Objetivo de la etapa:** que quien tiene autoridad pase de "tengo brechas diagnosticadas" a **una
apuesta comprometida** — un outcome medible (atado a un KR) + señal de appetite, registrado con peso.
Es el gate que **autoriza gastar recursos**. La etapa **más humana** del Espinazo ("humano puro").

**Plano:** Conversación (decisión estratégica corta) + lee artefactos del plano Análisis (el Diagnóstico).

**Entrada (handoff de M1 Beat 3):** el **objeto-gap** priorizado (I-16: tipo · delta · KR que bloquea ·
severidad · confianza · estado) + el **business case** (costo ~A / ahorro ~B) + el **Hilo de Oro**
navegable. El backlog priorizado = OST inicial.

### Usuarios
- **Primario:** el **Accountable del KR** (RACI) — normalmente Sponsor/dueño con el dinero.
- **Orquesta:** Consultor Prenter (prepara async, facilita la sesión de sello).
- **IA:** trae datos (candidatos, business case, Hilo de Oro). **No decide.**

### Modo UX
**Híbrido:** el consultor deja listo async (gap candidato + business case); la apuesta se **sella en
sesión corta** con el Accountable. Conversación estratégica enfocada, **no** formulario. Decisión con
peso, nunca enterrada (§11 principio 4).

### Sub-flujo (6 pasos)
| # | Paso | Modo | Quién | Framework |
|---|---|---|---|---|
| 1 | **Preparación async** — el sistema destaca el gap top del backlog (por valor×esfuerzo×confianza) con su business case + Hilo de Oro. El consultor deja listo el "candidato a apostar". | prep | 🧑 consultor + 🤖 | FinOps (M22) · Hilo de Oro (§2) |
| 2 | **Presentar el candidato** — en sesión: el sistema muestra el outcome candidato, qué KR mueve, cuánto cuesta (~A) vs ahorra (~B). IA trae datos, no empuja. | revisión | 🤖 presenta · 🧑 lee | Impact Mapping (M06) · FinOps (M22) |
| 3 | **Elegir / ajustar el outcome** — el Accountable elige el candidato, lo ajusta, o **trae uno nuevo** (forzado a anclar a un KR; sin KR = **alerta**). De deseo vago → outcome **medible** (baseline→target). | conversación estratégica | 🧑 decide · 🤖 estructura | OKR (M21) · OST root (M02) |
| 4 | **Señal de appetite (gruesa)** — el Accountable da magnitud ("vale ~un sprint / grande / chico"), apoyado por el delta del gap. **NO** es el appetite fino (eso es Etapa 3). | dial grueso | 🧑 | Shape Up (M04) |
| 5 | **Sellar la apuesta (el gate)** — el Accountable **commitea**. Acto deliberado con peso. El sistema **verifica autoridad** (es el accountable del KR) y registra quién/cuándo/contra qué KR. | decisión con peso | 🧑 con autoridad | RACI/autoridad (§12, ISO 5.3) · Shape Up betting |
| 6 | **Sembrar el OST** — el outcome apostado = **raíz del OST** de Etapa 1. El sistema crea el espacio de trabajo del outcome, enlaza el Hilo de Oro, arranca Etapa 1. | handoff | 🤖 | OST (M02) |

### Artefactos que se lleva
- **La Apuesta** — outcome medible (baseline→target) + KR que sirve (Hilo de Oro) + señal de appetite
  gruesa + **registro de autoridad** (quién apostó / cuándo).
- **Raíz del OST** sembrada para Etapa 1.
- **Enlace al loop de valor** — la apuesta queda atada al aporte que se medirá en Etapa 5 (estimado→medido, I-12).

### Fricciones a evitar · momento de verdad
- **Parálisis por mar de opciones** → el sistema recomienda **1 candidato top** con business case, no 50.
- **Jerga / hacer sentir tonto al dueño** → lenguaje de negocio, no de PM/ingeniería.
- **Métrica de vanidad** → se **fuerza anclar a un KR** real (sin KR = alerta).
- **Apuesta sin peso (rubber-stamp)** → híbrido + business case visible + verificación de autoridad → el gate **se siente** como compromiso.
- **Saltar a solución** → en Etapa 0 NO se discute el *cómo*; solo *qué-mover* y *si-vale*. (El cómo es Etapa 1+.)
- **Momento de verdad:** *"sí, esta es la métrica y vale perseguirla."* El Accountable se compromete.

### Lo humano-irreducible (Etapa 0)
La **apuesta estratégica completa** (§10 #1). La IA solo trae datos (business case, candidatos, Hilo
de Oro). Decidir *qué importa* y *qué merece el appetite* = juicio político / de supervivencia del
negocio = **solo el humano con autoridad**.

### Frameworks en juego (§1.1)
Shape Up betting + appetite (M04, Basecamp) · OKR (M21, el outcome = un KR) · OST root (M02, Torres) ·
Impact Mapping (M06, outcome↔objetivo) · FinOps Quantify Value (M22, business case) · RACI / autoridad
(§12, ISO 9001 cl.5.3) · Hilo de Oro (§2). **Entrada:** el objeto-gap (I-16).

### Handoff a Etapa 1 (OST)
El outcome apostado = **raíz del OST**. Etapa 1 (Exploración de valor) crece el árbol:
outcome → oportunidades → soluciones → tests. El backlog del Diagnóstico = OST inicial ya sembrado.

### Dogfooding (§1.1)
Corrido sobre prenter-harness mismo: las brechas del propio cockpit (FACTORY-BACKLOG) = candidatos a
apostar; el sistema apuesta sobre su propia casa. Somos el **caso 0**.

### Decisiones de diseño de Etapa 0 (AskUserQuestion · 2026-06-19)
- **Q1 · fuente del outcome:** backlog recomendado (Diagnóstico / loop de valor) **+ idea nueva**
  permitida, **forzada a anclar a un KR** (sin KR = alerta). *(Apostar es humano-irreducible, sin perder disciplina.)*
- **Q2 · split appetite:** **señal gruesa en Etapa 0** (decidir si vale) + **appetite fino + no-gos en
  Etapa 3** (tras el Grounding). No comprometes tiempo duro antes de ver el sistema real.
- **Q3 · autoridad:** **derivada** — el **accountable (RACI) del KR** que bloquea el gap es quien
  apuesta; default **sponsor único**, configurable a **comité / betting table** (Shape Up) si el cliente lo tiene.
- **Q4 · modo:** **híbrido** — el consultor prepara async, la apuesta se **sella en sesión corta**.

---

## Etapas 1–5 — *(pendientes de detalle)*
1. **Etapa 1 · Exploración de valor (OST)** — crece el árbol Outcome→Oportunidad→Solución→Test. *(stub)*
2. **Etapa 2 · Grounding del sistema** — la IA documenta lo que YA existe; el humano valida lo tácito. *(stub)*
3. **Etapa 3 · Shaping / Pitch** — appetite fino + no-gos; future-state (VSM); el Pitch. *(stub)*
4. **Etapa 4 · Contrato / spec ratificado** — EARS + chequeo de contradicciones → **G1**. *(stub)*
5. **Etapa 5 · Ejecución** — Claude Code + gates SDD; QA + aceptación; medición de aporte. *(stub)*
