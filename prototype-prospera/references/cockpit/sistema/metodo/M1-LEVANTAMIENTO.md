# M1 · Levantamiento — diseño detallado

> **Qué es:** el primer módulo y **primer producto vendible** ("Diagnóstico Digital"). Establece
> el baseline de la empresa: AS-IS de sistemas y procesos + capa de contexto + gap analysis.
> **Usuario primario:** el **Consultor Prenter** (consultant-first). El cliente provee insumos.
> **Docs base:** estrategia `PRODUCT-VISION.md` (monorepo legacy `prenter-harness`, congelado) · metodología [`METODOLOGIA.md`](METODOLOGIA.md).
> **Última actualización:** 2026-06-19

---

## Decisiones que enmarcan M1 (heredadas del Ledger — `tooling/strategy/LEDGER.md`)
- **Consultant-first** (I-08): v1 = power-tool del consultor en Claude Code; intake cliente-facing después.
- **2 planos de runtime** en M1 (§17): **Conversación** (entrevista, LangGraph+voz, Beat 2) +
  **Análisis** (Claude Code sobre docs+código, Beats 1 y 3). Seam = filesystem.
- **AS-IS con provenance + confianza + frescura por dato** (I-10); **grounding gana** (M23).
- **Right-sized, no waterfall** (I-06): AS-IS fino across la org + profundo en el value stream del 1er outcome.
- **Frameworks por capa** (I-10): APQC PCF (procesos) · ArchiMate (cuáles digitales) · COBIT-lite (madurez) · ISO ontología.
- **OKR ligero** + **Hilo de Oro navegable** + **aporte estimado→medido** (I-12).

---

## Los 3 beats de M1 (el arco de §20, detallado)
1. **Beat 1 · Arranque / AS-IS** — del "hola" + dump → AS-IS borrador con confianza. ← *detallado abajo*
2. **Beat 2 · Entrevistas** — corroborar documentado-vs-real → AS-IS validado. ← *detallado abajo*
3. **Beat 3 · Diagnóstico** — gap analysis + semáforo + plan priorizado (entregable). ← *detallado abajo (motor en profundidad: I-16)*

---

## Beat 1 · Arranque / AS-IS — detalle

**Objetivo del beat:** que el consultor pase de "una carpeta con 1GB de archivos sueltos" a un
**AS-IS borrador honesto** (procesos + sistemas + personas, cada dato con su confianza) y una
**lista de dudas a corroborar** — en horas, no semanas.

### Usuarios
- **Primario:** Consultor Prenter (conduce, valida, decide).
- **Secundario:** Sponsor/Ops del cliente (dan acceso, suben archivos, declaran objetivos).

### Sub-flujo (6 pasos)
| # | Paso | Modo UX | Quién | Framework |
|---|---|---|---|---|
| 1 | **Encuadre ("Hola")** — crea el workspace de empresa; captura mínimo: sector, sponsor, objetivos (OKR ligero), autoridad (RACI). | conversación corta (5-7 preguntas, no 150) | 🧑 consultor + cliente | ISO 9001 cl.4 · OKR ligero · RACI |
| 2 | **Conectar fuentes** — apunta a la carpeta Drive (~1GB) + repos de código (si hay). Sin repos → marca "sin sistemas" = todo gap/oportunidad. | configuración | 🧑 consultor | — |
| 3 | **Ingesta + Triage** — la máquina recorre todo: clasifica (tipo·fecha·autoridad·relevancia·duplicado·stale) y calcula un **"índice de basura"** (señal vs ruido). Asíncrono, con progreso. | observación (corre en background) | 🤖 análisis | Grounding/Provenance (M23) |
| 4 | **`document-project` de sistemas** — recorre repos, contrasta **código↔docs** → SYSTEM-MAP borrador + capabilities + drift. Sin código (SaaS) → manual = proxy de spec, confianza menor. | observación | 🤖 análisis | SYSTEM-MAP (M14) · ArchiMate (M13) |
| 5 | **AS-IS borrador con confianza** — ensambla procesos (clasificados en **APQC PCF**), sistemas (SYSTEM-MAP), personas/áreas (organigrama), todo con **provenance + confianza + frescura**. | revisión | 🤖 ensambla | APQC PCF (M12) · ISO ontología |
| 6 | **Revisión + marcado "a corroborar"** — el consultor corrige lo que sabe y **marca lo inferido/dudoso** → alimenta el Beat 2 (entrevistas). | validación | 🧑 consultor | — |

### El reto del 1GB de basura (lo que mata estos proyectos)
- **Triage primero, no lectura completa.** El paso 3 NO intenta entender todo: clasifica y
  rankea. Devuelve "1200 docs: 60% obsoletos, 15% duplicados, 25% útiles" → el consultor sabe
  dónde mirar. (Antídoto al ahogo.)
- **Right-sizing.** Solo el material del **primer value stream** se procesa a profundidad; el
  resto queda indexado superficial, recuperable cuando se necesite. (No boil-the-ocean, I-06.)
- **Provenance + confianza por dato.** Cada hecho del AS-IS sabe de dónde salió y cuánto creerle.

### El "código de color de confianza" (clave de UX)
El AS-IS se presenta como mapa con semáforo de **confianza**, no de madurez (esa es Beat 3):
- 🟢 **fuente sólida y fresca** (ej. código leído directo, doc reciente con autoridad).
- 🟡 **inferido o viejo** (ej. manual desactualizado, deducido por co-ocurrencia).
- 🔴 **hueco / ausente** (no hay fuente → candidato directo a entrevista o a "sin sistema = alerta").

El consultor ve **de un vistazo dónde es sólido y dónde no** → enfoca su esfuerzo humano ahí.
Es el antídoto a la falsa sensación de completitud.

### Artefactos que se lleva
- **AS-IS borrador v0** — mapa de procesos (PCF) + sistemas (SYSTEM-MAP/ArchiMate) + personas, con confianza por dato.
- **Lista de huecos/dudas a corroborar** — el input del Beat 2.
- **Índice de calidad del dump** — cuánto del 1GB sirvió (también dato de venta: "tu documentación está 60% obsoleta").

### Fricciones a evitar · momento de verdad
- **Ahogarse en el 1GB** → triage + right-sizing.
- **Falsa completitud** → código de color de confianza.
- **Espera pasiva** → asíncrono con progreso visible.
- **Momento de verdad:** el consultor ve en horas un AS-IS que a mano tomaría un mes, y sabe exactamente dónde confiar.

### Dogfooding (§1.1)
Este beat corrido sobre **prenter-harness mismo**: nuestro SYSTEM-MAP + capability ledger ya
existen → somos el **caso 0**. El producto se prueba sobre su propia casa.

### Handoff a Beat 2
Output de Beat 1 = AS-IS borrador + lista de "a corroborar" (los 🟡 y 🔴) → el agente de
entrevistas (Beat 2) ataca justo esos puntos: documentado-vs-real.

### Decisiones de diseño del Beat 1 (AskUserQuestion · 2026-06-19)
- **Encuadre = híbrido:** arma el AS-IS desde el dump real; donde falten procesos esperables del
  sector, la IA pregunta "¿esto existe?" usando APQC PCF. (Fiel + sin huecos ciegos.)
- **Índice de basura = consultor primero, cliente como hallazgo:** el consultor lo ve crudo; al
  cliente se le enmarca como hallazgo de venta ("tu doc está 60% obsoleta → oportunidad").
- **Value stream = tras el borrador; IA recomienda, consultor decide:** primero la foto amplia; la
  IA propone el de mayor valor/gap; el humano confirma (la apuesta es humano-irreducible).
- **Triage del resto = indexado mínimo, recuperable:** material fuera del 1er value stream se
  cataloga superficial (existe·tipo·dónde), no se analiza a fondo; recuperable al expandir.

---

## Beat 2 · Entrevistas — detalle

**Objetivo del beat:** subir el AS-IS borrador (Beat 1) a **AS-IS validado** corroborando
**documentado-vs-real** con los **trabajadores** (no solo el sponsor), y **creando** lo que no
existía (🔴). Corre en el **plano Conversación** (LangGraph + voz opcional; texto-primero, I-09).

### Usuarios
- **Primario:** el **trabajador / dueño de proceso** (la persona que *hace* el proceso) — su verdad tácita es la señal irreducible.
- **Orquesta:** el Consultor Prenter (prepara, resuelve conflictos, lee lo político).
- **Autoriza:** Sponsor/autoridad (RACI) — quién puede ser entrevistado.

### El agente adapta su modo por color (handoff del Beat 1)
- 🟡 **Corroborar:** "El manual/sistema dice que [X]. ¿Es así como lo haces en realidad? ¿Qué cambia?" → captura el **delta** documentado-vs-real.
- 🔴 **Descubrir/crear:** "No tengo registro de cómo se hace [X]. Cuéntame el paso a paso, desde [disparador] hasta [resultado]." → genera el proceso desde cero.

### Sub-flujo (6 pasos)
| # | Paso | Modo | Quién | Framework |
|---|---|---|---|---|
| 1 | **Preparar guion dirigido** — desde los 🟡/🔴, arma preguntas **específicas por persona/área** (no genéricas), priorizadas por impacto en el value stream elegido + incertidumbre. | máquina | 🤖 conversación | Event Storming (eventos) · Service Blueprint (back-stage) |
| 2 | **Convocar** — agenda con los trabajadores; **async-friendly** (responden por texto cuando pueden) o agenda llamada (voz). | config/coordinación | 🧑 consultor / 🤖 | — |
| 3 | **Entrevistar** — socrático, una cosa a la vez, en el lenguaje del trabajador. **Pide la última instancia concreta**, no la generalización. | conversación (texto→voz) | 🤖 + 🧑 trabajador | Continuous Discovery (Torres) · grounding |
| 4 | **Capturar estructurado** — cada respuesta actualiza el AS-IS (sube confianza/corrige/llena), con provenance "entrevista a [rol], [fecha]". Testimonio = fuente **Observado** (mayor ground-truth). | máquina | 🤖 | Provenance (M23) |
| 5 | **Reconciliar conflictos** — si dos testimonios chocan o contradicen el código, **marca conflicto** y escala al consultor (la verdad la decide el humano). | validación | 🧑 consultor | — |
| 6 | **Cerrar** — 🟡/🔴 corroborados suben a 🟢; lo no resuelto/en conflicto queda marcado como **riesgo/supuesto** para el Diagnóstico (Beat 3). | síntesis | 🤖 + 🧑 | — |

### La técnica clave: historias concretas, no generalizaciones (Torres)
Preguntar **"cuéntame la última vez que hiciste X"** en vez de **"¿cómo haces X en general?"**.
La generalización da el proceso *idealizado* (= el manual); la historia concreta revela el
**comportamiento real**. Es el corazón del "documentado-vs-real". (Fuente: Teresa Torres,
*Continuous Discovery Habits*.)

### Riesgo de diseño #1: seguridad psicológica (crítico)
"Documentado vs real" puede sonar a **"te estoy auditando si haces bien tu trabajo"** → el
trabajador se pone defensivo y miente, y se pierde toda la señal. Mitigación de diseño:
- **Encuadre:** "ayúdame a entender cómo funciona *de verdad* para **mejorarlo**, no para evaluarte."
- Tono no-juzgador; nunca "el manual dice que debías…".
- Considerar **agregar/anonimizar** a nivel trabajador para que nadie quede "expuesto" desviándose del manual.

### Voz (ElevenLabs) — diferenciador de fricción
Front-line LatAm que **no escribe, habla**. Un agente de voz que llama, entrevista, transcribe y
extrae deltas estructurados baja la fricción enorme. **Pero v2:** texto-primero (extracción más
confiable, sin latencia); voz como mejora. Requiere aviso de **consentimiento/grabación**.

### Greenfield ("crear si no hay nada")
Donde no hay doc **ni** sistema (🔴 puro), la entrevista **crea** la documentación del proceso
desde el relato del trabajador → ese proceso nace como candidato a automatización (gap de sistema).

### Artefactos que se lleva
- **AS-IS validado** — confianza subida, proceso real capturado, provenance por testimonio.
- **Registro de conflictos/supuestos** — lo que quedó sin reconciliar → entra al Diagnóstico como riesgo.

### Frameworks en juego (§1.1)
Continuous Discovery / historias concretas (Torres, M02) · Event Storming (M07, capturar eventos) ·
Service Blueprint (M10, back-stage real) · Grounding/Provenance (M23) · LangGraph + ElevenLabs (plano conversación, §17).

### Handoff a Beat 3
AS-IS validado + registro de conflictos/supuestos → el **Diagnóstico** compara este AS-IS contra el
**estándar deseado** y produce el semáforo de madurez + brechas.

### Decisiones de diseño del Beat 2 (AskUserQuestion · 2026-06-19)
- **Atribución = configurable por el consultor:** el sistema soporta provenance **atribuido** o
  **anonimizado/agregado** (a nivel rol/área); el consultor elige según la cultura del cliente.
  *(Default sugerido: anonimizado, por seguridad psicológica — pero manda el consultor.)*
- **Modalidad v1 = texto-async primero; voz (ElevenLabs) v2.** Confiable y barato primero; voz como mejora, con consentimiento/grabación.
- **Convocatoria = el consultor aprueba la lista de entrevistados; el sistema agenda.** El humano lee lo político; la máquina coordina.
- **Conflictos = intento acotado (repregunta 1-2 veces), luego escala al consultor.** El humano decide la verdad si persiste.

**Implicación de build (de "configurable"):** la capa de contexto debe modelar provenance con dos
modos (atribuido / anonimizado) y un flag por engagement o por área.

## Beat 3 · Diagnóstico — detalle

**Objetivo del beat:** del **AS-IS validado** (Beat 2) → el **Diagnóstico Digital**: gap analysis
contra el estándar deseado → **semáforo de madurez + brechas + plan priorizado + business case**,
todo atado al **Hilo de Oro** (gap → objetivo/KR). Es el **entregable vendible** y la **semilla de
M3**. Corre en el **plano Análisis** (Claude Code).

### Usuarios
- **Primario:** Consultor Prenter (curador — la IA propone, el humano ajusta severidad/prioridad/ahorro).
- **Recibe:** Sponsor/gerente (acepta el diagnóstico, apuesta por el primer ataque).

### Los 5 componentes
**1 · El estándar deseado (TO-BE).** Contra qué comparamos. Compuesto de: objetivos del cliente
(OKR ligero + KR) + plantillas de madurez (COBIT capability / sectorial / digital) + "readiness
para entregar valor con software". **Editable por el consultor** (I-08 #5). Clave: el TO-BE está
**anclado a los objetivos de ESTE cliente**, no a un checklist genérico → un gap solo importa si
**bloquea un objetivo**. (Esto nos separa de los ISO-gap tools commoditizados, que son checklist-driven.)

**2 · El motor de gap analysis.** AS-IS vs TO-BE → por cada proceso/sistema/capability: estado de
cumplimiento + brecha. **Dos tipos** (I-08 #6): proceso/doc · sistema/automatización. Greenfield →
ausencia = **alerta/oportunidad** (I-08 #7). Cada gap etiquetado con: tipo · severidad · **a qué
objetivo/KR bloquea** (Hilo de Oro) · confianza (heredada del AS-IS).

**3 · El semáforo de madurez.** El velocímetro para el sponsor. Por área/proceso + global. Anclado
a **"readiness para mover tus KRs"**, no a madurez abstracta — si no, es la misma vanidad que los
tools genéricos. Framework: COBIT capability levels.

**4 · El plan priorizado (roadmap).** Ordena gaps por **valor (impacto en KR vía Hilo de Oro) ×
esfuerzo × confianza × dependencias**. El **primer value stream** (elegido en Beat 1) recibe el plan
profundo; el resto, nivel amplitud. Cada item → candidato a historia/capability en M3.

**5 · Business case (proyección valor/costo).** Por gap priorizado: **aporte estimado** (Impact
Mapping → KR; estimado→luego medido, I-12) + **costo real** (Claude Code, plano) vs **ahorro
contrafactual** (vs devs: persona-días→$). Esto es lo que vende: *"cerrar estas 5 brechas mueve tu
KR X, cuesta ~A, te ahorra ~B vs contratar devs."* Framework: FinOps Quantify Business Value (M22).

### El motor de gap analysis — en profundidad (I-16)

> Profundiza el componente 2. **Cómo nace un gap, mecánicamente.** Decidido en la sesión de detalle
> de M3: la Apuesta (Etapa 0 del Espinazo) cabalga sobre los gaps → primero el motor que los produce.

**Un gap = un delta entre dos estados:**
```
gap = nivel TO-BE − nivel AS-IS      (por nodo: proceso PCF / sistema / capability)
       └ deseado     └ actual
```

**Las 3 piezas del motor** (framework + fuente + cómo — §1.1):
| Pieza | Framework | Cómo lo usamos |
|---|---|---|
| Mapa que recorrer (no perder gaps por omisión) | **APQC PCF** (M12) | el motor camina nodo por nodo la taxonomía → cobertura completa |
| Medir "nivel" en cada nodo | **COBIT 2019 capability levels** 0-5 (M15) | el delta de madurez = el **tamaño** del gap |
| Por qué importa cada gap | **Hilo de Oro / Impact Mapping** (§2, M06) | sin KR que sirva → el gap **no cuenta** (off-thread, aparcado) |

La 3ra pieza = **el moat**: comparamos contra **lo que los objetivos exigen**, no contra un checklist
genérico. Gap = brecha **ponderada por valor**, no por conformidad. (Esto separa de los ISO-gap tools.)

**Algoritmo por nodo:**
1. Nivel **AS-IS** (madurez actual, COBIT 0-5; hereda la confianza del Beat 2).
2. Nivel **TO-BE** (madurez que exige el KR servido).
3. **delta = TO-BE − AS-IS.** ≤0 → sin gap (ya listo). >0 → gap de tamaño = delta.
4. **Ancla a valor:** ¿qué KR(s) bloquea? sin KR → *off-thread* → aparcado.

**El objeto-gap (salida) = el contrato del handoff a M3 / Etapa 0 (Apuesta):**
- `id` · `nodo` (proceso PCF / sistema / capability)
- **`tipo`**: proceso/doc · sistema/automatización (los 2 tipos, I-08 #6)
- `nivel AS-IS` · `nivel TO-BE` · **`delta`** (tamaño)
- **`KR(s) que bloquea`** (Hilo de Oro) — el valor
- **`severidad`** = delta × criticidad del KR
- **`confianza`** (heredada del AS-IS — gap sobre 🔴 = gap incierto)
- `provenance` (de dónde salió AS-IS y TO-BE)
- **`estado`**: accionable · a-corroborar · off-thread

**El TO-BE — cómo se construye (decisión sesión M3):** **IA deriva del KR + plantillas, consultor
edita.** Dado un KR, la IA propone qué procesos/sistemas deben existir y a qué nivel, usando plantillas
(COBIT/sectorial/digital) como **insumo, no columna**; el consultor ajusta. Semi-automático: rápido +
anclado al objetivo + defendible. (Objetivos-primero, I-15.)

**3 casos especiales:**
- **Greenfield** (🔴 puro, no hay nada): AS-IS=0 → gap = TO-BE completo → tipo sistema/automatización,
  marca **oportunidad/alerta**. Riesgo mar-de-rojo → lo frena el filtro de valor + right-sizing.
- **Baja confianza** (gap sobre AS-IS 🟡/🔴): gap **incierto** → estado **"a corroborar"** → vuelve a
  Beat 2 (entrevista), **NO entra al plan firme**. *(Loop Beat 3 → Beat 2; antídoto a apostar sobre arena.)*
- **Off-thread** (gap real pero sin KR): se registra, se aparca. *(Antídoto al mar-de-rojo de los tools genéricos.)*

**Dos semáforos ortogonales (no confundir):**
- **Confianza** (Beat 1): 🟢 sólido / 🟡 inferido / 🔴 hueco — cuánto le creo al AS-IS.
- **Readiness** (Beat 3): 🟢 listo / 🟡 parcial / 🔴 no listo — qué tan lejos del TO-BE (COBIT detrás,
  escala simple en superficie, I-15).
- Son independientes: un gap puede ser **alta-confianza + rojo-readiness** (seguro que falta) o
  **baja-confianza** (no sé si falta → a corroborar).

**Frameworks en juego (§1.1):** APQC PCF (M12) · COBIT capability levels (M15) · Hilo de Oro / Impact
Mapping (§2, M06) · OKR (M21, el KR que define el TO-BE) · VSM future-state (M09, TO-BE de proceso) ·
Grounding/provenance (M23, la confianza fluye al gap).

**Decisiones (sesión M3 · 2026-06-19):** TO-BE = **IA deriva del KR + plantillas, consultor edita**.
*Defaults adjustables (a confirmar):* severidad = delta × criticidad KR · baja confianza → loop a Beat 2.

---

### El entregable: "Diagnóstico Digital" (doble uso, I-08)
- **Se vende:** foto (semáforo + AS-IS) + ruta (plan) + business case. Narrativa de consultoría:
  el rojo crea urgencia, el plan da esperanza, el business case justifica el gasto.
- **Es la semilla de M3:** el backlog priorizado = el **OST inicial**; el primer outcome entra
  directo al Espinazo (la **Apuesta**, etapa 0). Incluye la **vista navegable del Hilo de Oro** (I-12).

### Las dos trampas a evitar (lectura de consultor)
1. **Semáforo de vanidad** — madurez genérica que no toca su dinero. → atar TODO a los KRs.
2. **Mar de rojo** — "todo está roto" → parálisis. → el plan muestra un **primer paso claro,
   secuenciado y costeable** (el primer value stream), no un muro de 50 ítems.

### Lo humano-irreducible (Beat 3)
- El consultor **cura** severidad/priorización (taste; la IA propone, el humano decide).
- El sponsor **acepta** el diagnóstico y **apuesta** por el primer ataque (solapa con etapa 0 del Espinazo).
- El consultor **valida la credibilidad del ahorro** (el contrafactual persona-días debe ser defendible, no inventado).

### Frameworks en juego (§1.1)
COBIT capability levels (M15, madurez) · Impact Mapping (M06, aporte) · FinOps Quantify Value (M22,
costo/ahorro) · OKR (M21, KR target) · APQC PCF (M12, cobertura de procesos) · Hilo de Oro (§2).

### Handoff a M3 (Mejora continua / Espinazo)
El backlog priorizado + el primer outcome → entran al **Espinazo** (§10): Apuesta → Shaping →
Contrato → Construcción. M1 entrega; M3 ejecuta.

### Decisiones de diseño del Beat 3 (AskUserQuestion · 2026-06-19)
- **TO-BE = objetivos-primero:** el estándar deseado se deriva de los OKR/objetivos del cliente;
  plantillas (COBIT/sectorial) complementan. Gaps anclados a su dinero.
- **Semáforo = escala propia simple anclada a KRs** ("listo / parcial / no listo para mover tu KR");
  COBIT capability levels por detrás como rigor/drill-down.
- **Ahorro = IA estima con heurística** (benchmarks/tamaño del gap), **consultor valida y firma.** Rápido + defendible.
- **Entregable = dashboard navegable en cockpit** (Hilo de Oro, drill-down) **+ export PDF** para gerente/junta.
