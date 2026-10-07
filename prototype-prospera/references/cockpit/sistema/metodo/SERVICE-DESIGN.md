# Service Design — M3 · Etapa 0 (Apuesta) + on-ramp

> **Nota (CK-18):** el diseño de servicio del método, promovido a `sistema/metodo/` desde la campaña
> service-design (destilada). Personas · journeys · service blueprint · Vista Apuesta (§8) = vigentes.
> Las columnas *Nodo (host·motor)* de los inventarios de interfaces (§6, §9.5) citan el mapa de nodos
> **pre-CK-18** (N1/N4/N7 ya muertos) — el cableado vigente es
> [`../arquitectura/NODOS.md`](NODOS.md); léelas como diseño de interfaz, no de despliegue.

> **Qué es:** el diseño de **servicio** (no el de proceso) para llevar la Etapa 0 del Espinazo a algo
> **implementable en una empresa real**. Responde: ¿qué le pedimos al sponsor, cómo, con quién
> interactúa, y qué **interfaces frontend** necesita el sistema? Es el puente de "metodología" → "producto".
> **Método base:** *This Is Service Design Doing* (TiSDD). **Lente:** el **Sponsor / Dueño**.
> **Alcance:** Etapa 0 (Apuesta) + su **on-ramp** (los inputs de M1 que la alimentan: objetivos/KR/
> autoridad declarados + el Diagnóstico que lee).
> **Docs base:** [`M3-ESPINAZO.md`](M3-ESPINAZO.md) (Etapa 0) · [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md)
> (on-ramp) · [`PROCESS-AS-DATA.md`](PROCESS-AS-DATA.md) · [`METODOLOGIA.md`](METODOLOGIA.md) (M10, M24).
> **Última actualización:** 2026-06-19 · promovido a `sistema/metodo/` en CK-18 (cierre BL-07).

---

## 0. Método: This Is Service Design Doing (TiSDD)

**Fuente:** Marc Stickdorn, Markus Edgar Hormess, Adam Lawrence, Jakob Schneider — *This Is Service
Design Doing* (O'Reilly, 2018). [thisisservicedesigndoing.com](https://www.thisisservicedesigndoing.com/).
Es el manual práctico ("doing") del service design: investigar → idear → **prototipar** → implementar.
Personas
**Toolkit que usamos aquí (cómo lo usamos — §1.1):**
| Herramienta TiSDD | Para qué en este doc |
|---|---|
| **Stakeholder / system map** | quién interactúa con quién (§1) |
| **Persona** | el Sponsor/Dueño que decide la apuesta (§2) |
| **Journey map** (con curva emocional) | la experiencia del sponsor en el tiempo: qué le pedimos · cómo · qué siente (§3) |
| **Service blueprint** | la joya: el journey + frontstage/backstage/soporte → **revela las interfaces frontend y el trabajo interno** (§4-5) |

**Por qué service design y no solo UX:** el sponsor no "usa una app" — vive un **servicio** (consultor +
sistema + entregables). El blueprint expone lo que está **detrás de la cortina** (el plano Análisis,
el filesystem, el ledger) y lo conecta con lo que el sponsor **ve**. Eso es justo lo que hace falta
para diseñar el producto: saber qué pantallas existen, quién las toca, y qué procesos las sostienen.

---

## 1. Mapa de actores (stakeholder / system map)

```
                         ┌───────────────────────────┐
                         │   SPONSOR / DUEÑO          │  ← cliente primario (plata + autoridad)
                         │   (decide la apuesta)      │     = la persona (§2)
                         └────────────┬──────────────┘
              declara objetivos/KR    │   recibe diagnóstico · apuesta
                                      ▼
        ┌───────────────────────────────────────────────────┐
        │   CONSULTOR PRENTER  (proveedor del servicio)        │
        │   frontstage: facilita · presenta · sella           │
        │   backstage:  prepara · analiza (Claude Code)        │
        └───────┬───────────────────────────────────┬─────────┘
                │ orquesta                            │ corre
                ▼                                     ▼
   ┌─────────────────────────┐         ┌────────────────────────────────┐
   │ OPS / PERSONA DE NEGOCIO │         │  EL SISTEMA (cockpit + planos)  │
   │ (conoce procesos/clientes;│        │  frontstage: cockpit UI         │
   │  a veces = el sponsor)    │        │  backstage:  plano Análisis     │
   └─────────────────────────┘         │  soporte:    filesystem · ledger·│
                                        │              git · plano Convers.│
   ┌─────────────────────────┐         └────────────────────────────────┘
   │ TRABAJADORES            │  ← entrevistados en M1 Beat 2 (no ven al sponsor;
   │ (verdad del proceso)    │     alimentan el AS-IS por detrás)
   └─────────────────────────┘
```

**Relaciones clave:**
- **Sponsor ↔ Consultor:** el vínculo principal del servicio (confianza, lenguaje de negocio).
- **Sponsor ↔ Cockpit:** ligero y de alto valor — solo en 2 momentos (recibir el Diagnóstico, sellar la Apuesta).
- **Consultor ↔ Sistema:** intenso (el consultor es el power-user; consultant-first, I-08).
- En micro-PyME, **Sponsor = Ops = una sola persona** (colapso de roles, §11).

---

## 2. Persona del sponsor

> **Mateo Salas — dueño de Inmobiliaria Vértice (32 empleados), LatAm.**

- **Contexto:** dirige el negocio día a día; decide compras, contrataciones, prioridades. **No-PM,
  no-técnico.** Usa WhatsApp y Excel; el "sistema" de la empresa es medio manual.
- **Jobs-to-be-done:** *"saber en qué estoy mal digitalmente, qué arreglar primero, y que no me
  cueste una fortuna ni se eternice."*
- **Dolores:** consultorías caras que entregan un PDF que nadie usa · proyectos de software que se
  alargan sin entregar · sentirse tonto ante los tecnicismos · miedo a apostar mal su plata.
- **Ganancias que busca:** **claridad** ("esto falla, esto cuesta/ahorra") · **control** (él decide
  la apuesta) · **confianza** (que entiendan su negocio mejor que el último consultor).
- **Comportamiento:** decide rápido **si confía**; quiere el **"qué"** y el **"cuánto"**, delega el
  **"cómo"**; poca paciencia para reuniones largas; responde mejor a una foto clara que a un informe.
- **Cita:** *"No me expliques cómo funciona por dentro; dime qué arreglo primero y cuánto me deja."*

**Implicación de diseño:** lenguaje de negocio, cero jerga, **revelación progresiva**, el momento de
apostar **corto y con peso**. (Principios UX §11.)

---

## 3. Journey map del sponsor (on-ramp + Etapa 0)

| Fase | Acción del sponsor | Qué le pedimos | Cómo se lo pedimos | Emoción | Touchpoint |
|---|---|---|---|---|---|
| **1. Encuadre ("Hola")** ·M1 | Cuenta qué quiere lograr y quién manda | Sus **objetivos** (qué mover este trimestre) + **quién tiene autoridad** | Conversación corta coach-led (5-7 preguntas, NO formulario de 150) | 🙂 esperanzada pero escéptica | sesión con consultor (+ cockpit onboarding) |
| **2. Espera (Análisis)** ·M1 | Da accesos, luego se aparta | Acceso a Drive/sistemas; deja trabajar | "Nosotros trituramos esto; te aviso" | 😐 expectante / impaciente | mensajes de avance (async) |
| **3. Diagnóstico** ·M1 | Recibe la foto + el plan | Que **lea y reaccione** al diagnóstico | Dashboard navegable (semáforo + brechas + business case) + el consultor lo recorre | 😮 sorpresa ("60% de mi doc está obsoleta") → 💡 claridad | **Vista Diagnóstico** (cockpit) + PDF |
| **4. Apuesta** ·M3 E0 | Elige el primer arreglo y **apuesta** | Que **decida** el outcome + dé señal de appetite + **selle** | Sesión corta: candidato listo, costo/ahorro a la vista, ella elige y sella | 😟 duda → 💪 compromiso ("apuesto por esto") | **Vista Apuesta** (cockpit) |
| **5. Arranque** ·handoff | Ve que arranca | Nada — confirmación | "Listo, arrancamos con esto" | 😌 alivio / control | confirmación en cockpit |

**Curva emocional:** escepticismo → impaciencia → **sorpresa/claridad** (pico positivo en Diagnóstico)
→ duda momentánea → **compromiso** (pico en la Apuesta). Los dos picos son los **momentos de verdad**;
ahí el servicio se gana (o pierde) la confianza.

---

## 4. Service blueprint — general (on-ramp + Etapa 0)

> Carriles TiSDD. Entre carriles van las 3 líneas: **interacción** (cliente↔frontstage),
> **visibilidad** (frontstage↔backstage), **interacción interna** (backstage↔soporte).

| Carril ↓ / Fase → | 1. Encuadre | 3. Diagnóstico | 4. Apuesta | 5. Arranque |
|---|---|---|---|---|
| **Evidencia / touchpoint** | sesión + onboarding | Vista Diagnóstico + PDF | **Vista Apuesta** | confirmación |
| **Acción del CLIENTE** (sponsor) | declara objetivos/autoridad | lee y reacciona | elige outcome · señal appetite · **sella** | ve que arranca |
| *── línea de interacción ──* | | | | |
| **FRONTSTAGE** (consultor + UI visible) | consultor facilita; UI captura objetivos/KR/RACI | consultor recorre el dashboard; UI muestra semáforo+Hilo de Oro+business case | consultor presenta candidato; **UI Apuesta**: outcome+KR+costo/ahorro+dial appetite+botón sellar | UI confirma; muestra "outcome → OST" |
| *── línea de visibilidad ──* | | | | |
| **BACKSTAGE** (prep + análisis) | consultor estructura lo declarado | plano Análisis corrió el gap engine (I-16) → backlog priorizado | consultor preparó async el candidato top + business case | sistema siembra la raíz del OST (Etapa 1) |
| *── línea de interacción interna ──* | | | | |
| **PROCESOS DE SOPORTE** | capa de contexto org (`docs/org/`); RACI; OKR | objeto-gap (I-16); SYSTEM-MAP; Hilo de Oro; FinOps business case | verificación de autoridad (accountable del KR); registro de la apuesta | filesystem (seam); git (audit); capability ledger |

**Lecturas del blueprint:**
- El sponsor solo cruza la **línea de interacción** en 3 momentos (encuadre, diagnóstico, apuesta) →
  servicio de **baja fricción** para un dueño ocupado.
- Casi todo el trabajo vive **bajo la línea de visibilidad** (backstage + soporte) → el valor parece
  "mágico" pero está fundado (provenance, ledger). Eso es lo que impresiona sin abrumar.
- Las **interfaces frontend** (carril touchpoint + frontstage) son **pocas y de alto valor** → §6.

---

## 5. Service blueprint — Etapa 0 en detalle (los 6 pasos)

> **Fuente estructurada = [`proceso/m3/e0/`](proceso/m3/e0) (bloque `blueprint:` de cada paso).** Esta
> tabla es narrativa; no la dupliques — el proceso-como-dato manda.

| Carril ↓ / Paso → | 1. Prep async | 2. Presentar candidato | 3. Elegir/ajustar outcome | 4. Señal appetite | 5. Sellar apuesta | 6. Sembrar OST |
|---|---|---|---|---|---|---|
| **Touchpoint** | (interno) | Vista Apuesta | Vista Apuesta | dial en Vista Apuesta | botón "Sellar" | confirmación |
| **Acción del CLIENTE** | — (no participa) | escucha/lee | elige candidato o trae idea nueva | da magnitud gruesa | **commitea** | ve el arranque |
| *──interacción──* | | | | | | |
| **FRONTSTAGE** | — | consultor presenta; UI muestra outcome+KR+costo/ahorro | UI deja elegir/editar; si idea nueva → **fuerza anclar a un KR** | UI dial appetite (grueso) | UI verifica autoridad → registra | UI: "outcome → OST sembrado" |
| *──visibilidad──* | | | | | | |
| **BACKSTAGE** | consultor arma el candidato top (del backlog) | sistema trae business case + Hilo de Oro | sistema valida anclaje al KR (sin KR = alerta) | sistema relaciona delta del gap ↔ magnitud | sistema sella: quién/cuándo/qué KR | sistema crea workspace del outcome |
| *──interacción interna──* | | | | | | |
| **SOPORTE** | objeto-gap priorizado (I-16); FinOps | Impact Mapping; Hilo de Oro (§2) | OKR (M21); regla "sin KR = alerta" | Shape Up appetite (M04) | RACI/autoridad (§12); registro inmutable (git) | raíz del OST (M02); filesystem seam |

> Nota: el paso 1 (prep) está **bajo la línea de visibilidad** — el sponsor nunca lo ve, pero es lo
> que hace que el momento de apostar sea corto y claro. *(El trabajo invisible es el que sostiene la magia.)*

---

## 6. Inventario de interfaces frontend (derivado del blueprint)

> Con quién interactúa cada pantalla. La llave `id` es la misma que el campo `interfaz:` en
> [`proceso/**`](proceso). **La columna *Nodo (host·motor)* es pre-CK-18** (cita nodos hoy muertos
> N1/N4/N7); el cableado vigente vive en [`../arquitectura/NODOS.md`](NODOS.md) — léela
> como diseño de interfaz, no de despliegue.

<!-- GEN:iface-e0 -->
| # | `id` | Interfaz | Usa | Plano | Qué muestra / hace | Nodo (host·motor) | Estado |
|---|---|---|---|---|---|---|---|
| 1 | `onboarding-encuadre` | **Onboarding / Encuadre** | Consultor · CEO/Sponsor | Conversación/UI | captura objetivos (OKR ligero), KR, autoridad (RACI), sector — coach-led, no formulario gigante | N5 · motor N4,N1 | nuevo |
| 2 | `vista-diagnostico` | **Vista Diagnóstico** | CEO/Sponsor · Consultor | Análisis→UI | semáforo de madurez + brechas + business case; navegable + export PDF | N5 · motor N1 | nuevo † |
| 3 | `hilo-de-oro` | **Hilo de Oro navegable** | CEO/Sponsor · Consultor | UI | objetivo↔KR↔proceso↔sistema↔gap, bidireccional (vista de 1ª clase, I-12) | N5 | nuevo |
| 4 | `vista-apuesta` | **Vista Apuesta** ⭐ | CEO/Sponsor · Consultor | Conversación/UI | outcome candidato + KR + costo/ahorro + dial de appetite + botón Sellar (con verificación de autoridad) | N5 · motor N1 | nuevo |
| 5 | `cockpit-preparacion` | **Cockpit de preparación** | Consultor | Análisis | backlog priorizado; arma el candidato a apostar; ajusta severidad/orden (extiende Board/Coverage) | N5 · motor N1 | nuevo |
| 6 | `editor-contexto-org` | **Editor de contexto org** | Consultor | UI/filesystem | objetivos/KR/RACI/stakeholders (docs/org/); versionado por git | N5 · motor N6 | nuevo † |
| 7 | `confirmacion-ost` | **Confirmación / handoff a OST** | CEO/Sponsor · Consultor | UI | outcome apostado → raíz del OST; arranca Etapa 1 | N5 · motor N1 | nuevo |

*† aún sin paso en `proceso/` (interfaz declarada en el diseño, todavía sin instanciar).*
<!-- /GEN:iface-e0 -->

**Superficies por actor:**
- **Sponsor (mínimas, alto valor):** Vista Diagnóstico (2) · Hilo de Oro (3) · **Vista Apuesta (4)** · Confirmación (7).
- **Consultor (power-tool):** Onboarding (1) · Cockpit de preparación (5) · Editor de contexto (6) · y co-conduce 2-4.

**Prioridad de construcción (lo que de verdad habilita Etapa 0):** **#4 Vista Apuesta** (el momento
irreducible) → **#2 Diagnóstico** (lo que la apuesta lee) → **#3 Hilo de Oro** (el anclaje). El resto
es on-ramp. Consultant-first: #5/#6 pueden ser crudos (markdown/CLI) en v1.

---

## 7. Frameworks + fuentes (§1.1)

| Componente | Framework | Fuente | Cómo lo usamos |
|---|---|---|---|
| Método de servicio | **This Is Service Design Doing** (M24) | Stickdorn et al., O'Reilly 2018 | el toolkit completo: actores · persona · journey · blueprint |
| El blueprint | **Service Blueprint** (M10) | Nielsen Norman Group | carriles frontstage/backstage/soporte → revela interfaces |
| La persona / el job | **JTBD** (M05) | Christensen | el "trabajo" que contrata el sponsor, no la feature |
| El momento de apostar | **Shape Up** betting/appetite (M04) | Basecamp 2019 | el dial de appetite + el gate de sellar |
| Autoridad del gate | **RACI** (§12) | ISO 9001 cl.5.3 | quién puede sellar = accountable del KR |
| El valor visible | **FinOps + Impact Mapping** (M22/M06) | FinOps Foundation; Adzic | el business case (costo/ahorro) en la Vista Apuesta |
| Entrada (los gaps) | **objeto-gap** (I-16) | propio | lo que el Diagnóstico y la Apuesta leen |

**Dogfooding (§1.1):** este service blueprint se aplica primero a **nosotros** llevando el servicio a
un cliente — y el propio cockpit puede mostrar este blueprint como ejemplo vivo. Caso 0.

**Handoff:** este doc define las **interfaces de Etapa 0**. Cuando detallemos Etapas 1-5, cada una
sumará su tira de blueprint + sus interfaces aquí.

---

## 8. Vista Apuesta — spec de pantalla (interfaz #4 ⭐)

> La interfaz **corazón** de Etapa 0. De blueprint → pantalla concreta. Hace 4 trabajos: presentar el
> candidato con su número · elegir/ajustar/traer-idea · dar la señal de appetite · **sellar con autoridad**.

### 8.1 Propósito · usuario · contexto
- **Propósito:** que el sponsor pase de "ver el diagnóstico" a **una apuesta sellada** en minutos, con peso.
- **Usuario que sella:** el **Sponsor / accountable del KR** (Mateo). El **Consultor** lo acompaña y presenta.
- **Contexto:** sesión corta (modo híbrido, Q4); el consultor ya dejó el candidato listo (prep async).
- **Dispositivo:** desktop-first (cockpit en la laptop del consultor, a la vista del sponsor); responsive a tablet.

### 8.2 Wireframe (estado principal: candidato listo)
```
┌──────────────────────────────────────────────────────────────────────┐
│  Tu apuesta · Inmobiliaria Vértice · Trimestre actual         [ × ]  │
├──────────────────────────────────────────────────────────────────────┤
│  RECOMENDAMOS APOSTAR POR:                            confianza: 🟢    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Acelerar la cobranza a clientes                                │  │
│  │  Mueve tu meta:  Días de cobro   45 → 30 días                   │  │
│  │  Cierra la brecha: "no hay recordatorios automáticos de pago"   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ¿Qué te deja?                                                         │
│  ┌──────────────┬──────────────┬───────────────────────────────────┐ │
│  │ Cuesta ~     │ Te ahorra ~  │ Acerca a tu meta (estimado)       │ │
│  │  $2,400      │  $9,000      │  ~60% del camino a 30 días        │ │
│  │  (plano)     │  (vs 1 dev)  │                                   │ │
│  └──────────────┴──────────────┴───────────────────────────────────┘ │
│                                                                        │
│  Hilo de Oro:  Mejorar flujo de caja › Días de cobro › esta apuesta   │
│                                                            [ explorar ]│
│                                                                        │
│  ── ¿Es esta tu apuesta? ───────────────────────────────────────────  │
│  [ ✓ Sí, esta ]   [ Ver otras opciones (2) ]   [ Tengo otra idea ]    │
│                                                                        │
│  ── ¿Cuánto vale para ti? ──────────────────────────────────────────  │
│  [ Chico ~1 sem ]   [ ● Mediano ~1 sprint ]   [ Grande ~1 mes ]       │
│  El alcance fino lo afinamos después; aquí solo cuánto invertir.      │
│                                                                        │
│  ── Sellar ─────────────────────────────────────────────────────────  │
│  Sella:  Mateo Salas · Dueño  ✓ tiene autoridad sobre esta meta     │
│                                                                        │
│     Mantén presionado para apostar   ▓▓▓▓▓▓░░░░░░░░░░░                 │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.3 Zonas y data bindings (de dónde sale cada dato)
| Zona | Dato | Fuente |
|---|---|---|
| Título del outcome | descripción en lenguaje de negocio | objeto-gap (I-16) |
| "Mueve tu meta" | KR baseline→target | OKR (M21) · Hilo de Oro (§2) |
| "Cierra la brecha" | el gap que origina | objeto-gap |
| Badge de confianza | 🟢/🟡/🔴 heredada | objeto-gap.confianza |
| Cuesta ~ | costo plano (suscripción amortizada) | FinOps (M22) |
| Te ahorra ~ | contrafactual persona-días→$ | FinOps (M22) |
| Acerca a tu meta | aporte estimado (→ luego medido) | Impact Mapping (M06) · I-12 |
| Hilo de Oro | breadcrumb navegable objetivo›KR›apuesta | §2 (vista 1ª clase, I-12) |
| Appetite S/M/L | señal gruesa de presupuesto | Shape Up (M04) |
| "Sella: …" | accountable del KR | RACI (§12) |
| Slide-to-commit | registra quién/cuándo/qué KR | git inmutable (soporte) |

### 8.4 Controles e interacciones
- **Sí, esta** → fija el candidato como apuesta (queda elegido).
- **Ver otras opciones (N)** → despliega lista corta (top 3 del backlog) con su meta + costo/ahorro; elegir una **reemplaza el hero**. (Antídoto al mar de opciones: por defecto 1, no 50.)
- **Tengo otra idea** → campo de texto + **selector de meta obligatorio** (a qué KR sirve). La idea nueva **debe anclarse** (Q1). Sin meta → estado **alerta** (8.5).
- **Appetite S/M/L** → una sola selección; **no** es estimado (microcopy lo aclara). Mediano por defecto si el delta del gap lo sugiere.
- **Slide / mantener presionado** → barra que se llena al sostener (~1.5 s); peso ritual. **Deshabilitado** hasta: outcome elegido + appetite elegido + autoridad verificada.

### 8.5 Estados
1. **Cargando** — skeleton del hero.
2. **Candidato listo** — el wireframe de arriba (principal).
3. **Ver otras opciones** — lista top-3 expandida; seleccionar cambia el hero.
4. **Idea nueva** — input + selector de meta; al anclar vuelve a "candidato listo" con la idea.
5. **Idea sin meta (alerta)** — banner: *"Esta idea no conecta con ninguna meta de este trimestre."* → [Elegir una meta] · [Proponer nueva meta (avisa al consultor)] · [Volver]. **No deja sellar** sin anclaje.
6. **Sin autoridad** — el usuario actual no es el accountable → slide **bloqueado** + *"Solo Mateo Salas (Dueño) puede sellar esta apuesta."* [Avisarle]. (El consultor **prepara**, no sella — Q3.)
7. **Sellando** — slide completo → micro-animación de confirmación.
8. **Sellado** — *"¡Apostado! Arrancamos con: Acelerar la cobranza. Siguiente: explorar el problema a fondo."* El outcome pasa a Etapa 1 (raíz del OST).
9. **Error** — no se pudo registrar → reintentar (idempotente).

### 8.6 Microcopy (lenguaje de negocio — sin jerga)
- **Nada de "KR / OST / appetite / capability" frente al sponsor.** "KR" → **"tu meta"**; "OST/Etapa 1" →
  **"explorar el problema a fondo"**; "appetite" → **"¿cuánto vale para ti?"**.
- Tono: claro, directo, en su idioma. Cifras redondeadas con "~" (son estimados honestos).
- El badge de confianza es **honestidad visible** (🟡/🔴 dicen "esto lo inferimos"), no decoración.

### 8.7 Guardrails (reglas duras)
- **Sin meta anclada → no se puede sellar** (evita métrica de vanidad; Q1).
- **Sin autoridad → no se puede sellar** (gate humano-irreducible; el consultor no suplanta al dueño; Q3).
- **El appetite aquí es grueso** — el alcance fino + no-gos se fijan en Etapa 3 (Shaping), tras el Grounding (Q2).
- **El sello es inmutable y trazable** (quién/cuándo/qué meta) → audit por git.

### 8.8 Frameworks en juego (§1.1)
Shape Up appetite como tallas S/M/L (M04, small/big batch) · FinOps + Impact Mapping (M22/M06, el
business case visible) · RACI (§12, el gate de autoridad) · objeto-gap (I-16, la entrada) · patrón
**deliberate-commit** (slide/hold para dar peso al gate, §11 #4) · This Is Service Design Doing (M24,
prototipo de baja fidelidad = este wireframe).

### 8.9 Decisiones de diseño (AskUserQuestion · 2026-06-19)
- **Appetite = tallas de tiempo S/M/L** (Chico ~1 sem · Mediano ~1 sprint · Grande ~1 mes). Intuitivo para no-PM; señal gruesa, no estimado.
- **Sellar = mantener presionado / slide-to-commit** — gesto físico que da peso ritual al gate.

---

## 9. m1.b1 · Arranque / AS-IS — service design (lente CONSULTOR)

> Segunda etapa productizada con TiSDD. **Lente: el Consultor** (usuario primario, consultant-first) —
> m1.b1 es trabajo de consultor + máquina; el sponsor solo aparece en el encuadre. Fuente narrativa:
> [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md) §Beat 1. Decisión de lente: AskUserQuestion 2026-06-19.

### 9.1 Mapa de actores
```
   ┌──────────────────────────────┐
   │  CONSULTOR PRENTER  (primario) │ ← conduce · valida · decide  = la persona (§9.2)
   └───────┬───────────────┬──────┘
   dirige  │               │ conduce el "hola"
           ▼               ▼
 ┌───────────────────┐   ┌───────────────────────────┐
 │ MÁQUINA (Análisis)│   │ SPONSOR / OPS (actor)      │
 │ Claude Code:      │   │ encuadre: objetivos+autoridad│
 │ triage·doc-project│   │ + da accesos (Drive/repos) │
 │ ·ensambla AS-IS   │   └───────────────────────────┘
 └─────────┬─────────┘
   lee     ▼
 ┌───────────────────────────────────────────┐
 │ FUENTES: Drive (~1GB dump) · repos código  │   (trabajadores = Beat 2, no aquí)
 └───────────────────────────────────────────┘
```
Relación clave: el consultor **dirige a la máquina** (no la espera pasivo) y **corrige lo que sabe**;
el sponsor/ops son actores de entrada (encuadre + accesos), no la lente.

### 9.2 Persona — el Consultor
> **Pedro Ø — consultor Prenter.** Corre 2-3 engagements a la vez.

- **Contexto:** técnico suficiente para leer un SYSTEM-MAP; vive de convertir caos en claridad rápido. No quiere semanas leyendo PDFs.
- **JTBD:** *"convertir una carpeta de 1GB en un AS-IS honesto en horas, saber dónde es sólido y dónde inventado, y llegar a las entrevistas (Beat 2) con preguntas afiladas."*
- **Dolores:** ahogarse en el dump · falsa sensación de completitud · levantamientos que tardan semanas y ya están stale.
- **Ganancias:** triage que rankea señal/ruido · **código de color de confianza** · AS-IS ensamblado por la máquina.
- **Comportamiento:** dirige la máquina, corrige lo que conoce, **marca lo dudoso** para corroborar después.

### 9.3 Journey map (consultor)
| Fase | Acción del consultor | Cliente (sponsor/ops) | Emoción | Touchpoint |
|---|---|---|---|---|
| **1. Encuadre** | conduce el "hola"; captura objetivos + autoridad | declara objetivos (OKR ligero) + autoridad (RACI); da contexto | 🙂 foco / arranque | Onboarding/Encuadre |
| **2. Conectar fuentes** | apunta Drive + repos; si no hay repos → marca "sin sistemas = todo gap" | da accesos | 🙂 anticipación | Conectar fuentes |
| **3. Ingesta + triage** | lanza la máquina; lee el **índice de basura** | — | 😌 alivio (“60% obsoleto → sé dónde mirar”) | Vista Triage |
| **4. document-project** | observa el SYSTEM-MAP que arma la máquina; ajusta si conoce | — | 😮 confianza (“entiende el sistema”) | Vista SYSTEM-MAP |
| **5. AS-IS borrador** | recibe el mapa con **código de color de confianza** | — | 💡 claridad + escepticismo sano | Vista AS-IS |
| **6. Revisión + marcado** | corrige lo que sabe; **marca 🟡/🔴 a corroborar** → lista para Beat 2 | — | 💪 dominio (“en horas lo que tomaba un mes”) | AS-IS (modo edición) |

**Curva emocional:** foco → anticipación → **alivio (triage)** → confianza → **claridad (AS-IS)** → dominio.
**Momentos de verdad:** el índice de basura (fase 3) y ver el AS-IS con confianza (fase 5-6).

### 9.4 Service blueprint

> **Fuente estructurada = [`proceso/m1/b1/`](proceso/m1/b1) (bloque `blueprint:` de cada paso).** Esta
> tabla es narrativa; no la dupliques — el proceso-como-dato manda.

| Carril ↓ / Fase → | 1. Encuadre | 2. Conectar | 3. Triage | 4. doc-project | 5. AS-IS | 6. Revisión |
|---|---|---|---|---|---|---|
| **Touchpoint** | Onboarding | Conectar fuentes | Vista Triage | Vista SYSTEM-MAP | Vista AS-IS | AS-IS edición |
| **Acción CONSULTOR** | conduce el hola | apunta Drive+repos | lanza · lee índice | observa · ajusta | recorre el mapa | corrige · marca a-corroborar |
| **Acción CLIENTE** | declara objetivos/autoridad | da accesos | — | — | — | — |
| *──interacción──* | | | | | | |
| **FRONTSTAGE** (UI) | coach-led (5-7 preguntas) | config fuentes | progreso async + índice señal/ruido | SYSTEM-MAP + drift | mapa 🟢🟡🔴 confianza | editar + marcar |
| *──visibilidad──* | | | | | | |
| **BACKSTAGE** (Análisis) | — | valida accesos | recorre 1GB · clasifica (tipo·fecha·autoridad·dup·stale) | recorre repos · contrasta código↔docs | ensambla procesos+sistemas+personas con provenance | persiste correcciones · arma lista de huecos |
| *──interacción interna──* | | | | | | |
| **SOPORTE** | ISO cl.4 · OKR · RACI · `docs/org/` | `project.config.yaml` (seam) | Grounding/Provenance (M23) | SYSTEM-MAP (M14)·ArchiMate (M13)·ledger | APQC PCF (M12)·ISO ontología·provenance | filesystem (seam) · handoff Beat 2 |

**Lecturas:** el cliente cruza la línea de interacción **solo 2 veces** (encuadre + accesos) → el resto es
consultor+máquina. Casi todo vive en backstage (plano Análisis) → el valor “aparece” pero está fundado
(provenance + confianza). Las **interfaces** son pocas y densas → §9.5.

### 9.5 Inventario de interfaces frontend
> Llave `id` = campo `interfaz:` de [`proceso/m1/b1/p*.md`](proceso/m1/b1). Columna *Nodo* pre-CK-18 (ver [`../arquitectura/NODOS.md`](NODOS.md)).

<!-- GEN:iface-b1 -->
| # | `id` | Interfaz | Usa | Plano | Qué muestra / hace | Nodo (host·motor) | Estado |
|---|---|---|---|---|---|---|---|
| 1 | `onboarding-encuadre` | **Onboarding / Encuadre** | Consultor · CEO/Sponsor | Conversación/UI | captura objetivos (OKR ligero), KR, autoridad (RACI), sector — coach-led, no formulario gigante | N5 · motor N4,N1 | nuevo |
| 2 | `conectar-fuentes` | **Conectar fuentes** | Consultor | UI/config | apunta Drive (~1GB) + repos; flag «sin sistemas» | N5 · motor N12 | nuevo |
| 3 | `vista-triage` | **Vista Triage / índice de basura** ⭐ | Consultor | Análisis→UI | progreso async + ranking señal/ruido (% obsoleto·dup·útil) | N5 · motor N7 | nuevo |
| 4 | `vista-system-map` | **Vista SYSTEM-MAP** | Consultor | Análisis→UI | sistemas + capabilities + drift código↔docs (extiende el Map actual) | N5 · motor N7 | nuevo |
| 5 | `vista-as-is` | **Vista AS-IS (confianza)** ⭐ | Consultor | UI | procesos (PCF) + sistemas + personas con 🟢🟡🔴 de confianza | N5 · motor N7,N1 | nuevo |
| 6 | `vista-as-is-edicion` | **AS-IS · modo edición/marcado** | Consultor | UI | corregir + marcar «a corroborar» → la lista que alimenta Beat 2 (mismo que Vista AS-IS, modo edición) | N5 | nuevo |
<!-- /GEN:iface-b1 -->

**Prioridad:** ⭐ **#5 Vista AS-IS (confianza)** (momento de verdad) → **#3 Triage** (antídoto al ahogo) → #4 SYSTEM-MAP → #2 Conectar → #1 reusa.

### 9.6 Frameworks (§1.1)
TiSDD (M24) / Service Blueprint (M10) · ISO 9001 cl.4 + OKR + RACI (encuadre) · Grounding/Provenance (M23,
triage + confianza) · SYSTEM-MAP (M14) + ArchiMate (M13) (document-project) · APQC PCF (M12, procesos del AS-IS).

### 9.7 Decisiones de diseño (AskUserQuestion · 2026-06-19)
- **Lente = Consultor-primaria** (sponsor/ops como actores del encuadre). Coherente con consultant-first (I-08).
- (Heredadas de I-13 / M1 Beat 1: encuadre híbrido · índice de basura consultor-first · value stream tras el borrador · triage del resto indexado mínimo.)

### 9.8 Handoff (a las otras 2 capas)
- **Proceso (dato):** estos 6 pasos → `proceso/m1/b1/p1..p6.md` (con `actor/plano/interfaz/fricciones` de este blueprint).
- **Sistema:** interfaces #1-6 → vistas del cockpit; planos = Conversación (encuadre) + Análisis (triage/doc-project); artefactos (AS-IS, índice, lista de huecos) → filesystem.
