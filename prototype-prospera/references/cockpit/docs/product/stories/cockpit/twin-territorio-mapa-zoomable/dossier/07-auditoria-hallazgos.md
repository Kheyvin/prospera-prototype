# 07 · Auditoría visual ↔ escrito — hallazgos abiertos (tracker)

> Parte del dossier. **Auditoría del 2026-07-25** pedida por el operador: *"audita lo que tenemos
> de forma visual vs lo que tenemos escrito … encuentra discrepancias, incoherencias y desvíos
> respecto a nuestra visión de producto y objetivos"*.
>
> **Método de la auditoría** (reproducible, ver § Recetas al pie): mockup vivo (DOM + `DATA`
> evaluado en Node con stub de DOM) × los 7 docs de la historia × `sistema/schema/objeto.schema.yaml`
> × el cerebro metodológico (`/metodo`: `GRAFO.md` → M32 · M36 · M40 · M30). **Nada se midió a ojo:**
> cada número de este doc sale de evaluar el `const DATA` real o de un grep con línea.
>
> **Cómo se usa este archivo:** es el **tracker** de la deuda. Un hallazgo se cierra poniendo
> `estado: resuelto` + el commit/decisión que lo cerró. No se borra nunca — queda el registro.

## Tablero

| ID | Hallazgo | Sev | Estado | Decide |
|---|---|---|---|---|
| **A1** | El arnés es la tesis (CK-29) y **no existe en el schema** | 🔴 fondo | **✅ DECIDIDO 2026-07-25 — CK-30 + D-19/D-20/D-21 + M46.** Materialización **parcial**: `apuesta` YA es 13º nodo del schema (D-23, commit `5bde69f`); `puesto`/`arnes` siguen pendientes (historias con gate) | firmado operador |
| **A2** | El hilo de oro se ancla al **objetivo**, no al **KR** | 🔴 fondo | abierto | operador |
| **A3** | `area` no abre ficha — "las 12 navegables" son 11 | 🟠 | **✅ resuelto v12 2026-07-26 (commit `16a8af5`)** — `openArea` + `data-area` en wireLinks + textos planos → links | — |
| **A4** | 3 campos visual-only sin lugar en el schema (`objetivo.salud`·`area.madurez`·`sistema.conector`) | 🟠 | **◐ parcial v17.2 2026-07-28** — `objetivo.salud` DERIVADA (`saludKr`: avance vs `kr.esperado`, jamás canned); `area.madurez`·`sistema.conector` siguen abiertos | operador (2 de 3) |
| **A5** | Las 4 acciones que **cierran el loop** no tienen superficie | 🔴 fondo | abierto | operador |
| **A6** | Provenance (M23, *columna*) aplicada en 3 de 13 fichas | 🟠 | **◐ (a)+(b) resueltos v17.2 2026-07-28** — `fuente`/`conf` en los datasets canned + `prov()` en las 13 fichas de entidad (persona = default del ingest de nómina); (c) conf en el mini-chevron del triage = diseño, operador | (c) operador |
| **B1** | "Gramática de ficha universal" sobre-prometida | 🟡 | abierto | operador (alcance) |
| **B2** | "SIPOC se DERIVA" — en el mockup es tabla canned paralela | 🟡 | **✅ resuelto v17.2 2026-07-28 (copy)** — declarado en `02 § fichas` y `04 § sipoc`: canned en el mockup, derivado en la app | — |
| **B3** | `.dico` en 12/14 fichas, no en "TODA ficha" | 🟢 | **✅ resuelto v12 + copy v17.2** — Arnés/Puesto ganaron ícono (TICO 15 claves); única sin ícono = Actividad (subesquema); `03 § decisión 24` acota el alcance | — |
| **B4** | 3 KPIs sin ancla, 1 sola brecha `sin-ancla-de-valor` | 🟡 | abierto | operador (dato) |
| **B5** | "4/40 puestos" contra un denominador que el mapa no dibuja (27) | 🟡 | **✅ resuelto v12 2026-07-26 (commit `16a8af5`)** — `PUESTOS` se DERIVA de la nómina (46); portada "4/46 · 5 arneses"; los 46 dibujados en Organigrama nivel 4 | — |
| **C1-C8** | Dossier ≠ mockup — 8 números | 🟢 | **✅ resuelto 2026-07-25** | — |
| **D1** | M32 dice "las 9 entidades del twin" (schema v2 = 12) | 🟠 | **✅ resuelto v15.2 2026-07-27 (commit `5bde69f`)** — barrido D-23: M32 y conteos a **13** entidades | — |
| **D2** | `CLAUDE.md` / reglas dicen "9 entidades" | 🟠 | **✅ resuelto v15.2 2026-07-27** — `CLAUDE.md` y `cockpit-stack.md` dicen "13 entidades (CK-26 + apuesta D-23)" | — |
| **D3** | `state: idea` con 11 versiones y dossier de 7 docs — sin `01-spec` | 🟡 | abierto | operador |
| **D4** | M40 (frontera persona) y M30 (BSC): **limpios** | ✅ | verificado | — |
| **H1** | La bandeja del directorio configuraba el modelo, no gobernaba la empresa | 🔴 fondo | **✅ v18 2026-07-29** — 4 decisiones de plata primero (presupuesto · línea · inversión · piso de caja), cada una con el umbral que la sube al directorio | — |
| **H2** | La apuesta prometía plata y **nunca la cobraba** (el propio "sin ancla de valor") | 🔴 fondo | **✅ v18** — `valor.cobrado` en las 4 apuestas (barra + verificado-por; "aún no aplica" si no está sellada) | — |
| **H3** | Todo el tablero era interno, auto-reportado y hacia adelante — cero dato cerrado | 🔴 fondo | **✅ v18** — 6 cifras del periodo leídas del sistema contable con **estado de cierre** y procedencia | — |
| **H4** | No existía **presupuesto** (un directorio gobierna contra un presupuesto) | 🔴 fondo | **✅ v18** — `DATA.presupuesto` (la mezcla de ambición en plata) + facultades por monto | — |
| **H5** | No existían **acuerdos** con responsable y plazo, ni acta — el punto que abre toda sesión | 🔴 fondo | **✅ v18** — 5 acuerdos con estado + acción "cerrar la sesión y generar el acta" | — |
| **H6** | Estaba el apetito de riesgo, faltaba el **registro de riesgos** | 🟠 | **✅ v18** — 6 riesgos, nivel derivado (probabilidad × impacto), contrastados contra el apetito de su categoría | — |
| **H7** | Sin **aterrizaje proyectado** ("¿llegamos a diciembre?") | 🟠 | **◐ parcial v18** — hay acumulado del año contra plan por cifra; falta la proyección de cierre del año por meta | operador |
| **H8** | **Cero caja** — para esta empresa, EL tema del directorio | 🔴 fondo | **✅ v18** — saldo · 13 semanas contra el piso · línea · límites con el banco · confianza baja por la vacante | — |
| **H9** | Las obras eran una alerta suelta, no un portafolio de inversiones | 🟠 | **✅ v18** — 3 inversiones con avance real vs declarado · gasto vs presupuesto · comprometido · entrega · margen | — |
| **H10** | Una sola moneda — sin exposición cambiaria | 🟡 | abierto — `periodo.moneda` existe como campo; falta la vista de exposición | operador |
| **H11** | Cero cumplimiento: hallazgos de auditoría, litigios, licencias, seguridad | 🟡 | **◐ parcial v18** — el dictamen y sus 2 hallazgos viven en la ficha de alcance; riesgos de cumplimiento en el registro; falta la superficie propia | operador |
| **H12** | Personas a nivel directorio sólo como una vacante | 🟡 | abierto — sucesión, rotación, planilla sobre ingresos, contingencia laboral (respetando CK-24) | operador |
| **H13** | `fit()` encajaba una página en ancho **y** alto → cada panel nuevo encogía la letra de todos | 🟠 | **✅ v18** — `fitPagina` (encaje al ancho, anclado arriba) + la rueda recorre; aplica también a Mejora/Método/Cambios | — |
| **H14** | La deuda de método y esquema que abrió H1-H13 | 🔴 fondo | **✅ 2026-07-29** — M55-M59 + M52/M22/M16 enriquecidas (catálogo 59) · D-24…D-30 (schema 20 nodos) · contrato de build `08`. Ambos gates verdes | — |
| **H15** | M52 declarada `horizonte` mientras el nivel 1 la materializa | 🟠 | **✅ v19 2026-07-29** — promovida a `ancla` + `modo: columna`. Una carta que contradice al producto vigente no es horizonte: es drift. Sin aparato ERM ni certificación (VISION §ISO intacta) | — |
| **K1** | Dos visiones contradictorias: «2029 · Perú» vs «2030 · Lima Metropolitana» | 🔴 fondo | **✅ v19** — la visión vive SOLO en `empresa`; el rumbo la lee | — |
| **K2** | Meta de viviendas imposible con la operación del propio mockup (16 años) | 🔴 fondo | **✅ v19** — 480→900 al 2030 (~105/año contra 84 de hoy: exigente y alcanzable) | — |
| **K3** | La banda rotulaba «KR del trimestre» sobre metas a 3 años | 🟠 | **✅ v19** — `horiz` por objetivo (3a·anual·trimestre), visible en la ficha | — |
| **K4** | Cero cascada: `parent_ref` con 0 usos, catchball como contador | 🔴 fondo | **✅ v19 · D-35** — 5 bajadas reales con área y rol; el catchball se cierra contra una sesión | — |
| **K5** | `sesion` (D-25) con cero instancias; acuerdos citando «junio» como string | 🟠 | **✅ v19** — 3 sesiones; acuerdos, bajadas y autoevaluación apuntan a ellas | — |
| **K6** | `o-cob` dibujada como meta del directorio sin serlo | 🟡 | **✅ v19** — es una bajada de «caja sana», con su gerencia | — |
| **K7** | Apuesta sellada sobre metas fuera del rumbo del año | 🟡 | abierto — decisión de guion: ¿el rumbo lista 2 metas o las 5? | operador |
| **K8** | Tres mezclas de ambición que no se hablaban (70/20/10 · 70/25/5 · conteo) | 🟡 | **✅ v19** — cada una declara su unidad; el presupuesto contrasta contra la vara y avisa dónde no coincide | — |
| **K9** | Presupuesto (6.0) e inversiones (33.9) sin relación declarada | 🟡 | **✅ v19** — el presupuesto declara su alcance y qué NO incluye: son dos plata distintas | — |
| **K10** | El dictamen decía «2 hallazgos viven como brechas» y no existían | 🟡 | **✅ v19** — `g-aud` con su origen en el dictamen | — |
| **K11** | La meta cliente #1 sin ningún indicador | 🔴 fondo | **✅ v19** — `k-viv` (viviendas entregadas acumuladas) | — |
| **K12** | 3 de 7 contratos sin serie que los midiera | 🔴 fondo | **✅ v19** — `k-mar`, `k-dsoc`, `k-viv`; todo KR cuelga de una serie | — |
| **K13** | El valor del contrato tecleado al lado de la medición | 🔴 fondo | **✅ v19 · D-34** — `krCur()` lee la serie; ningún KR guarda `cur` (check en la suite) | — |
| **K14** | «Caja sana» leía VERDE mientras la caja se hundía | 🔴 fondo | **✅ v19** — 2º contrato (caja visible al día) sin serie ⇒ el objetivo lee GRIS, y el gris pesa más que el verde en el rollup | — |
| **K15** | Pesos que no sumaban 1 en 3 de 7 contratos | 🟠 | **✅ v19 · D-36** — normalizados + invariante + check | — |
| **K16** | A2 replicado en v18: las cifras anclaban al objetivo, `cifra.kpi_ref` sin usar | 🟠 | **✅ v19** — `kpi` + `res` (dónde se resuelve) en las cifras | — |
| **K17** | `frecuencia` fuera del enum en 2 KPIs («por expediente») | 🟠 | **✅ v19 · D-31** — enum gana `por-evento` | — |
| **K18** | `tipologia_kpi` (kpi/dpi/**kri**) y lead/lag: 0 usos en 12 KPIs | 🟠 | abierto — el registro de riesgos sigue sin un solo indicador adelantado | operador |
| **K19** | `en_tension_con` (contra-métrica): 0 usos pese a predicar anti-gaming | 🟠 | abierto — candidatas: cobranza dura ↔ ventas · avance ↔ postventa | operador |
| **K20** | La dirección del semáforo se infería del orden de la banda | 🟠 | **✅ v19 · D-31** — `dir` obligatorio + banda de tres tramos + check con el caso que rompía la inferencia | — |
| **K21** | Tolerancia de las 6 cifras hardcodeada (±2/±10) e igual para todas | 🟠 | abierto — la vara por cifra la fija el directorio, no el código | operador |
| **K22** | Bandas de KPI sin vara externa; la absorción contradecía el único rango sectorial | 🟠 | **✅ v19** — `nicho` por KPI; `k-abs` cita ASEI 1.7 %/mes | — |
| **K23** | El eje NICHO bypasseado y **contradicho**: se afirmaba un rango de cobranza que el método prohíbe afirmar | 🔴 fondo | **✅ v19 · D-31** — `DATA.peers` eliminado; la vara sale de la unidad de nicho y hereda su confianza; N-IMM-07/08 nuevas; check que impide que vuelva | — |
| **K24** | Ocho motores de veredicto sin rollup declarado | 🟡 | **◐ parcial v19** — `objSalud` declara su rollup (peor-hijo, gris incluido); los del gobierno siguen sueltos | operador |
| **K25** | `cifra` sin `fuente`/`conf` propios (heredaba una del periodo) | 🟡 | **✅ v19 · D-34** — campos propios en esquema y dato | — |
| **K26** | La satisfacción del cliente nunca subía al directorio (entrada obligatoria cl.9.3) | 🟠 | **✅ v19** — sube como alerta derivada, con la brecha que la cubre y la acción de promoverla a meta | — |
| **K27** | La leyenda prometía niveles 0-5 sobre un campo de tres colores | 🔴 fondo | **✅ v19 · D-32** — `area.madurez` eliminado; se deriva de las capabilities; 4º tramo «sin evaluar» | — |
| **K28** | Sin `nivel_deseado` no se podía calcular ninguna brecha de madurez | 🔴 fondo | **✅ v19 · D-32** — `act`/`des`/`esc`/`evid` en las 10 capabilities; `c-permisos` sin deseado = caso declarado | — |
| **K29** | La escalera del directorio era la única superficie sin ficha de esquema | 🟠 | **✅ v19 · D-33** — `empresa.autoevaluacion_madurez` | — |
| **K30** | Predicaba «se deriva de evidencia» y era canned sin procedencia | 🟠 | **✅ v19 · D-33** — `evid` por dimensión + sesión de evaluación + conf | — |
| **K31** | `estrategia 3→3` (sin brecha) el mismo mes de 13 hallazgos de gobierno | 🟠 | **✅ v19** — 2→4 con la evidencia real, y `frena` | — |
| **K32** | El arbitraje entre escaleras vivía sólo como prosa | 🟡 | **✅ v19 · D-32** — enum `escala_madurez`, el número viaja con su vara | — |
| **K33** | M55-M59 con **cero pasos de proceso**: nadie sabe levantar el nivel 1 | 🔴 fondo | abierto — `m1.b2`/`m1.b3`/`m2.mant` siguen stub (historia `sistema/poblar-metodo-m1-m3`) | operador |
| **K34** | A5 empeoró: 4 → 15 acciones declaradas sin superficie | 🔴 fondo | **✅ v19** — catálogo del mockup alineado al del esquema + check que falla si una acción se ofrece sin declarar | — |
| **K35** | Drift de nombres mockup↔esquema en 5 acciones + 6 sin declarar | 🟠 | **✅ v19 · D-36** — renombradas; `sellar-apuesta`·`re-apostar`·`retirar-apuesta`·`corregir-instruccion`·`convocar-rendicion`·`comprometer-contramedida` declaradas | — |
| **K36** | ISO 9001 cl.9.3 incompleta (auditorías, proveedores, satisfacción) | 🟠 | **◐ parcial v19** — `g-aud` (control interno) y `g-prov` (cl.8.4) entran al twin; auditoría interna como superficie propia sigue abierta | operador |
| **K37** | 3 apuestas «selladas» sin el sello (quién, con qué autoridad, cuándo) | 🟡 | abierto — el gate humano-irreducible sigue siendo un string de estado | operador |
| **K38** | Responsables como texto libre: los invariantes CK-24/RACI no son verificables | 🟡 | abierto — se resuelve al portar al golden fixture (refs reales) | operador |
| **K39** | Facultades como strings libres contra el enum `materia_facultad` | 🟡 | abierto — idem K38 | operador |
| **K40** | `r-dat` anclado al área teniendo la brecha `g-tes`; `g-cvis` sin riesgo | 🟡 | abierto — dato, no diseño | operador |

> **Sync del tracker 2026-07-28 (v17.2):** filas A3/B5/D1/D2 estaban resueltas por v12/v15.2 y el
> tablero seguía diciéndolas abiertas (el sync esperaba la firma visual del operador sobre v12 —
> firmada de facto por las iteraciones v13→v17 con comentarios en vivo). A4.1 + A6(a,b) + B2 + B3
> se cerraron en v17.2 por pedido del operador ("corrige todos los errores encontrados").
> **Siguen abiertos y esperan decisión del operador:** A2 (KR primera clase — cambia la geografía
> de la banda 1) · A4.2-3 (`area.madurez`/`sistema.conector`: derivar vs campo nuevo D-NN) ·
> A5 (cablear los 4 writes de cierre: ¿gate simulado o teaser?) · A6c (señal de conf en el
> mini-chevron del triage) · B1 (gramática: ¿ampliar catálogo o degradar promesa a "disable
> honesto"?) · B4 (¿brecha por cada KPI sin ancla?) · D3 (cuándo se cruza a `01-spec`).

Severidad: 🔴 desvío de la tesis del producto · 🟠 rompe una doctrina declarada · 🟡 sobre-promesa o
inconsistencia de dato · 🟢 sincronía documental.

---

# A · Desvíos de fondo (visión / as-code)

## A1 · El arnés es la tesis y no existe en el schema 🔴 — SIGUIENTE A ATACAR

**Qué se observó.** CK-29 es la tesis central del producto ("el twin es un cerebro que **compila
trabajo**"; el arnés = **vista GENERADA del twin para un puesto**). El mockup lo trata como entidad
de primera clase:

| Superficie | Dónde |
|---|---|
| `DATA.arneses` — 11 campos (`id·rol·area·v·estado·compilado·skills·uso·acts·mueve·drift`) | `index.html` § "CK-29: el cerebro completo" |
| Ficha propia `openArnes` (16 líneas, con doctrina "se recompila, jamás se edita") | `index.html:2369` |
| Badge ⛨ en **5 superficies** (chevron cadena · rolchip · área subtree · carril z2 · piso z3) | `harnBadge()` |
| Capa "Trabajo (N15·17)" en el rail | `CAPAS_APLICAN`, todas las escalas |
| Bloque de portada "El twin compila trabajo — 4/40 puestos" | `inspectorHome()` z0 |
| SC-14 "recompilar arnés por drift" en el módulo Cambios | `renderCambios()` |
| Acción `recompilar-arnes` en 2 fichas (rol · arnés) | `openRol` · `openArnes` |

**Qué dice el as-code.** `grep -n "arnes" sistema/schema/objeto.schema.yaml` → **cero entidad**; sólo
aparece la palabra dentro del `met:` de otro campo (`tarea.verbo`, línea 241: *"skill de arnés
candidateado por tarea"*). Y `acciones.catalogo` (líneas 425-449) **no declara `recompilar-arnes`**.

**Qué doctrina rompe.**
- `01-vision-y-doctrina.md § As-code`: *"todo lo que muestra existe (o existirá) como dato del
  schema; nada se inventa visual-only sin declarar de qué entidad/campo cae"*.
- **M32** (ontología Palantir, *paraguas*, `rol_ancla: metamodelo-propio`): la gramática del twin
  **son** las entidades del `objeto.schema.yaml`. Una entidad de producto fuera de esa gramática es
  exactamente el "fork" que M32 prohíbe (principio open/closed).
- `[[metodologia-as-code]]` / `[[arquitectura-as-code]]`: SSoT → vista generada → gate. El arnés hoy
  no tiene SSoT.

**Por qué importa (no es formalismo).** Es *el* diferenciador comercial declarado en `01`: *"puestos
sin arnés = la brecha de la era agéntica, y NADIE la pinta hoy"*. Todo lo que el mockup promete sobre
arneses —drift, recompilación, `compilado_de`, uso agregado por rol, skills que mueven KPIs— **no
tiene dónde guardarse** cuando se construya la app. El número de portada (4/40) es hoy una constante
literal (`DATA.puestosTotal`), no un derivado.

**Qué haría falta decidir (input del operador — la conversación que sigue).**
1. ¿`arnes` es **entidad nueva** del objeto (13ª) o **proyección derivada** (como el SIPOC o la
   instrucción z3), o **entidad de otro repo** (N15 Arnesia) referenciada por `ref`?
   - Argumento pro-entidad: tiene estado propio (`vigente|desactualizado`), versión, telemetría de
     uso y drift — cosas que **no** se derivan del twin.
   - Argumento pro-proyección: el propio copy dice "vista GENERADA del twin … jamás se edita a mano".
   - Argumento pro-cross-repo: el arnés se compila en N15 y corre en N17; el twin (N6/N13) sólo
     necesita **saber que existe, su versión y si está en drift**.
   - *(Lectura del auditor, no decisión: lo GENERADO es el contenido del arnés; lo que el twin debe
     guardar es el **registro** del arnés — id, puesto, versión, hash del twin del que se compiló,
     estado de drift, telemetría agregada. Eso es entidad, no proyección.)*
2. ¿Qué campos entran y cuáles son derivados? (`estado` y `drift` parecen **derivables** comparando
   el hash/versión del compilado contra el estado actual del twin — eso los haría "computa, jamás
   guarda", coherente con M36/M32.)
3. ¿`recompilar-arnes` entra a `acciones.catalogo`? Con qué `nivel_min` y `aprobacion`
   (el mockup hoy dice "revisión-dueño").
4. ¿`puestosTotal` de dónde cae? Hoy es constante. Candidato: contar `rol` con `es_puesto` o contar
   ocupaciones `persona.roles[]`. Sin eso, "4/40" no es auditable.

**Salida esperada:** ficha **D-NN** en `sistema/schema/DECISIONES.md` vía `/metodo-aprende` (el
schema tiene gate), + entrada en `acciones.catalogo`, + (si aplica) M-card nueva o extensión de la
familia I del método.

**✅ RESUELTO (decisión) 2026-07-25 — LEDGER CK-30, firmado por el operador.** Las 4 preguntas se
respondieron con 4 investigaciones paralelas (SOTA arneses-as-code · SOTA process/org-as-code ·
relación as-code puesto-rol-proceso · qué es un arnés hoy en el ecosistema):

1. **¿entidad / proyección / cross-repo?** → **entidad REGISTRO** en el twin (`deriva_de` · `version` ·
   `hash_fuente` · `estado/drift` · `autonomia` · `supervisor` · `verificacion_humana` ·
   `indicadores` · `uso_agregado`); el **contenido** lo compila Arnesia (N15) contra `arnes.l0.json`,
   contrato que **ya existe** en harness-studio. Ficha **D-20**.
2. **¿guardado vs derivado?** → `estado`/`drift` **derivados** (comparar `hash_fuente` contra el twin);
   versión, telemetría, autonomía y supervisor **guardados** (no se derivan de nada).
3. **`recompilar-arnes`** → sí, más `suspender-arnes` (kill-switch) y `ratificar-autonomia-arnes`. D-20.
4. **`puestosTotal`** → deja de ser constante: `puesto` es entidad (**D-19**) y el conteo es auditable.

**Además se resolvió lo que la pregunta no contemplaba:** el Misnomer `rol`(=cargo) → se parte en
`puesto` + `rol` (D-19), y la granularidad del skill queda fijada (actividad hoy; tarea con **D-21**).

**Pendiente (materialización, no decisión):** tocar `objeto.schema.yaml` + Go + fixture + escribir el
generador. Son historias con su gate, no esta ficha.

---

## A2 · El hilo de oro se ancla al objetivo, no al KR 🔴

**Qué se observó.**

| Arista | Schema | Mockup |
|---|---|---|
| KPI → contrato de cambio | `kpi.contribuye_a[{ kr_ref, peso }]` (N:M contra **key_result**) | `kpi.obj` → **objetivo** + `kpi.peso` suelto |
| brecha → qué bloquea | `brecha.kr_ref: list → key_result` | `brecha.obj` → **objetivo** |
| KR | subesquema con 10 campos (`accountable_ref`, `kpi_ref`, `driver_refs`, `quarter`, `acople_compensacion`…) | `objetivo.kr = {m, from, to, cur, u}` — **1 solo KR por objetivo**, 5 campos |

`openKpi` (`index.html:2295`) **muestra** "mueve el KR **{o.kr.m}** (peso {k.peso})" — o sea, narra la
arista correcta pero el enlace real salta el KR. Funciona sólo porque en los datos canned cada
objetivo tiene exactamente un KR.

**Qué doctrina rompe.**
- El diferenciador #1 de `01`: *"Hilo de oro **MEDIDO** — objetivos directorio → **KR** → KPI →
  proceso/rol"*. Sin el eslabón KR, el hilo es "objetivo → KPI": pierde el **contrato de cambio**
  (baseline→target→current del trimestre) que es lo que lo hace medible.
- El schema es explícito (`kr.kpi_ref`): *"frontera permeable — el KR = contrato de CAMBIO sobre la
  serie de un KPI existente (misma serie, distinto contrato)"*.
- `kr.accountable_ref`: *"el ROL accountable; **JAMÁS OKR individual**"* — el mockup no lo tiene, y
  es un guardrail de CK-24/M40, no un adorno.

**Consecuencia concreta.** Quedan **imposibles de representar** las dos acciones de esa frontera, que
el propio schema declara: `promover-kpi-a-kr` (el mockup la ofrece en `openKpi`… hacia un objetivo,
no hacia un KR) y `decantar-kr-a-kpi` (ausente, ver A5). Y un objetivo con 2+ KRs —el caso normal en
OKR— no tiene forma de dibujarse.

**Qué hacer.** Migrar `DATA.objetivos[].kr` (objeto) → `key_results[]` (lista, con `id` local
`obj-x#krN`), repuntar `kpi.obj`→`kpi.kr` y `brecha.obj`→`brecha.kr`, y ajustar 4 superficies:
banda Estrategia (`renderValor`), `openKpi`, `openBrecha`, `openObjetivo`. **Esfuerzo medio**
(toca datos canned + 4 renders). **Decide el operador** porque cambia la geografía de la banda 1
(un objetivo con N KRs ocupa más).

---

## A3 · `area` no abre ficha — "las 12 navegables" son 11 🟠

**Qué se observó.** `wireLinks` (`index.html:1237-1246`) cablea **11** tipos:
`k · h · rol · per · sis · obj · idea · cap · proc · pm2 · g2` (+`acc`). Búsqueda en todo el archivo:
`data-area` → **0 ocurrencias** · `openArea` → **0 ocurrencias**.

En `openProceso:2192`, "Áreas que cruza" se renderiza como **texto plano**
(`p.areas.map(a=>byId(DATA.areas,a).nm).join(', ')`) — no es link. Igual en `openPersona:2361`
("Área") y en `openArnes` (el área del puesto).

**Qué doctrina rompe.** Decisión 11 (`03`): *"TODA entidad del schema (las 12 …) abre ficha en el
inspector con las mismas secciones"* + *"el viaje nunca se corta"*. `area` es una de las 12
(`o_code: O4`, ArchiMate Business Actor organizacional) y es la **única sin `open*`**.

**Nota de conteo (el doc también se equivoca):** `02 § 4` se titula "Las 12+1 fichas" y lista 13
filas, pero esas 13 son **11 entidades + `actividad`** (subesquema, no entidad) **+ `arnés`**
(no-entidad, ver A1). Falta `area`.

**Atenuante:** el área SÍ tiene "territorio" (z1, `renderArea` + sala de mando contextual), pero
sólo se alcanza por doble-click desde la **piel Organigrama** — que ya es un pendiente conocido
(`06` § menores: *"z1 solo accesible vía piel Organigrama"*).

**Qué hacer.** `openArea(a)` con la gramática: qué-es (propósito · líder link · parent link ·
madurez —ver A4— · conf) · hilo (procesos del subtree · roles · KPIs por banda · brechas) · pulso ·
acciones · botón "Entrar al área (z1) ›". + `data-area` en `wireLinks` + convertir a link las 3
menciones de texto plano. **Barato, ejecutable ya.**

---

## A4 · Campos visual-only que el schema no tiene 🟠

| Campo canned | Dónde pinta | Estado en el schema | Veredicto |
|---|---|---|---|
| `objetivo.salud` (`index.html:656+`) | dot de cada tarjeta de la banda Estrategia · "Pulso N/7 en banda" · `openObjetivo` | **no existe** | debería **derivarse** del KR (`cur` vs `from/to`) o de sus KPIs — el motor `semaforo()` ya existe para KPI |
| `area.madurez` (`index.html:667+`) | lente **Madurez (COBIT)** del rail, que "pinta áreas" | **no existe en `area`** — COBIT vive en `capability.assessment{nivel_actual, nivel_deseado, escala}` | o se deriva (rollup de capabilities del área) o se declara campo nuevo con ficha |
| `sistema.conector` (`index.html:824+`) | ficha sistema § "Pulso (lakehouse N16)" · texto "SIN conector — candidato" | **no existe** | el pulso N16 no está modelado en `sistema` — candidato a campo nuevo |

**Qué doctrina rompe.**
- `objetivo.salud` es **incoherencia interna del mockup**: en z3 predica en pantalla *"los scores se
  COMPUTAN — jamás se guardan"* (M36) y en z0 pinta un semáforo **guardado**. Mismo principio que
  `identidad ≠ observación` (M32/Palantir P1) y que `semaforo(k)` ya respeta para KPI.
- `area.madurez`: la capa Madurez se declara anclada a **M15 COBIT / M31**; pintarla desde un campo
  que el marco no tiene desconecta la capa de su M-card.
- Los tres violan la regla de `01` ("nada visual-only sin declarar de qué campo cae").

**Qué hacer.** `objetivo.salud` → derivar (barato, ejecutable ya). `area.madurez` y
`sistema.conector` → **decisión del operador**: derivar vs. fichar campo nuevo (D-NN).

---

## A5 · Las 4 acciones que cierran el loop no tienen superficie 🔴

**Qué se observó.** `acciones.catalogo` del schema declara **15** acciones. El mockup usa 12
(`data-acc="…"`). Cruce exacto:

**Declaradas y NO usadas (4):**

| Acción | Entidad | Qué hace (schema) | Por qué duele |
|---|---|---|---|
| `verificar-beneficios` | proyecto_mejora | *"finanzas valida el beneficio real post-implementación (`firmas.finanzas.fecha_post`)"* · validación `firma-finanzas-post` | es la **doble firma RN-15**: sin ella un hard-saving no cierra. Es el gate que hace creíble el "KPI movido" |
| `cerrar-proyecto` | proyecto_mejora | *"beneficios-en-auditoria → cerrado, con `resultado{}` (KPI movido o no — dato real)"* | **es literalmente el money shot**: el mockup muestra `pm-cie` ya cerrado, pero nunca ofrece cerrarlo |
| `decantar-kr-a-kpi` | objetivo | *"KR logrado vuelve a KPI monitoreado (fin de ciclo)"* | la mitad que falta de la frontera permeable (ver A2) |
| `corregir-verbo-actividad` | proceso | *"consultor corrige el verbo del ingest — auditado (provenance, anti-gaming)"* | el módulo Cambios **narra** esta historia (SC-11: "transportar"→"visitar", auditado) pero la ficha de actividad no ofrece la acción |

**Usadas y NO declaradas (2):** `recompilar-arnes` (ver A1) · `corregir-instruccion` (z3).

**Qué doctrina rompe.** `06 § Tensión de fondo`, verbatim del operador: *"el moat entero está en los
**WRITES**: sellar, aprobar, promover, ciclo de proyecto"*. La medición ahora es concreta: **4 de 4
acciones de cierre ausentes**, y las 2 que el mockup inventó son justo las que no están declaradas.
El diferenciador #2 de `01` ("Loop brecha → proyecto → KPI movido … ningún vendor lo cierra
in-tool") se muestra como **resultado**, nunca como **acción**.

**Qué hacer.** Cablear las 4 en sus fichas (`openProyecto` ×2, `openObjetivo`, `openActividad`) con
su nivel+aprobación reales del catálogo, y declarar las 2 inventadas (o quitarlas). **Decide el
operador** el alcance: ¿el mockup demuestra los writes con gate simulado, o los deja de teaser?

---

## A6 · Provenance (M23, *columna*) aplicada en 3 de 13 fichas 🟠

**Qué se observó.** `prov(fuente, conf)` sólo aparece en `openProceso` · `openActividad` · `openKpi`.

**Sin provenance (10):** objetivo · brecha · proyecto · rol · persona · sistema · idea · capability ·
empresa · arnés.

Peor: los datos canned de `objetivo` **ni tienen `conf`** — 5 campos (`id, nm, persp, kr, salud`)
cuando el schema declara `fuente`+`conf` en **las 12 entidades**. Lo mismo `sistema` (5 campos),
`capability` (5), `persona` (4), `empresa` (4).

**Caso agravado — el triage:** `actividad.triage` canned es un **string plano**
(`triage:'automatizable-rpa'`, `index.html:984+`); el schema exige
`{ veredicto: enum, fuente: enum, conf: enum }`. **M36 `cuando_no` dice literal:** *"jamás score sin
su incertidumbre al lado"*. En z3 sí se muestran los 7 inputs y la conf; **en z0 los mini-chevrons
pintan el veredicto por color sin ninguna conf** — la superficie más vista del producto es la que
incumple.

**Qué doctrina rompe.** M23 es `modo: columna`, `ancla[provenance]`, `capa_contexto: true` — o sea,
transversal a todo el AS-IS. `01 § Doctrinas`: *"Provenance (M23): todo dato AS-IS con `fuente`+`conf`;
incertidumbre siempre visible"*.

**Qué hacer.** (a) agregar `fuente`/`conf` a los datasets canned que no lo tienen; (b) `prov()` en
las 10 fichas; (c) que el mini-chevron del triage lleve señal de conf (opacidad/borde punteado —
**no color**, el canal está tomado por salud). **(a)+(b) ejecutables ya; (c) es diseño → operador.**

---

# B · Predica ≠ practica (incoherencia interna)

## B1 · "Gramática de ficha universal" sobre-prometida 🟡

Decisión 11 dice *"TODA entidad abre ficha con las MISMAS secciones: qué-es · hilo · pulso ·
conocimiento · acciones"*. Medición real sobre las 13 fichas:

| Sección | Cobertura | Ausente en |
|---|---|---|
| qué-es | 13/13 ✅ | — |
| hilo (links) | 12/13 | `openEmpresa` |
| pulso | 9/13 | actividad · persona · idea · (empresa parcial) |
| **conocimiento** | **3/13** | todas salvo proceso · actividad · rol |
| **acciones** | **9/13** | persona · sistema · capability · empresa |

**Hallazgo estructural:** la sección "acciones" **no puede** ser universal hoy — el
`acciones.catalogo` del schema sólo cubre **6 entidades** (kpi · objetivo · idea · proyecto_mejora ·
brecha · proceso). Para persona/sistema/capability/empresa/rol/area no hay acción declarada.

**Qué hacer.** Elegir una de dos, y escribirlo: (a) ampliar el catálogo del schema, o (b) **degradar
la promesa**: "las secciones que apliquen, en el mismo orden — una sección vacía se declara vacía
(disable honesto), no se omite en silencio". *(La (b) es coherente con el principio de "disable
honesto" que el mockup ya aplica a las capas.)* **Decide el operador.**

## B2 · "SIPOC se DERIVA, jamás se edita" — pero es tabla canned paralela 🟡

`openProceso` imprime esa frase (D-08/D-11) y el header C1 de z2 la repite. En el mockup el SIPOC
vive en `DATA.sipoc` (17 entradas) + `DATA.sipocC1` (17) — **estructuras separadas escritas a mano**,
no derivadas de `proceso.entradas/salidas` (que en el canned ni existen). En el schema **sí** sería
derivado. Es una mentira honesta del prototipo, pero hoy no está declarada en ningún lado.

**Qué hacer.** Nota "en el mockup es canned; en la app se deriva de `proceso.entradas/salidas`" en
`02 § z2` y `04`. **Copy, barato.**

## B3 · `.dico` en 12 de 14 fichas 🟢

La decisión 24 dice *"ícono de tipo en el header de **TODA** ficha"*. `openDrawer` parsea la 1ª
palabra del eyebrow contra `TICO`: **`Actividad`** y **`Arnés`** no matchean → sin ícono. Es
coherente (ninguna de las dos es entidad del schema — `actividad` es subesquema, `arnés` no existe,
ver A1), pero el doc afirma "toda ficha". **Corregir el copy del doc**, o darles ícono propio si A1
convierte al arnés en entidad.

## B4 · 3 KPIs sin ancla, 1 sola brecha `sin-ancla-de-valor` 🟡

`DATA.kpis` sin `obj`: **`k-nps` · `k-obs` · `k-sla`**. `DATA.brechas` con
`estado: 'sin-ancla-de-valor'`: **sólo `g-post`** (la del NPS).

`openKpi` sí delata los 3 en su ficha ("⚠ Sin ancla de valor…"), pero el **diagnóstico** (el funil de
Mejora, la sala de mando) sólo cuenta 1. `04` presenta el caso como "la joya del diagnóstico" — y el
twin lo detecta 1 de 3 veces.

**Qué hacer.** O generar brecha por cada KPI sin ancla (el diagnóstico debería ser exhaustivo), o
declarar en el dato por qué `k-obs`/`k-sla` no la generan. **Decide el operador** (es guion de venta).

## B5 · "4/40 puestos" contra un denominador que el mapa no dibuja 🟡

La banda Gente dibuja **27** rolchips (conteo real de roles únicos). `DATA.puestosTotal = 40`. El
número de portada del gap agéntico ("4/40 puestos operan con arnés") se calcula contra **13 puestos
que existen como constante y no como nodo**.

**Qué hacer.** O el mapa dibuja los 40, o el copy dice "27 puestos mapeados · 40 declarados", o
`puestosTotal` pasa a derivarse. Ligado a A1.4. **Decide el operador.**

---

# C · Dossier ≠ mockup — ✅ RESUELTO 2026-07-25

Ocho números corregidos en esta misma sesión (sincronía documental pura, cero decisión de diseño):

| # | Doc | Decía | Real / corregido |
|---|---|---|---|
| C1 | `04:45` | 6 procesos huérfanos | **8** (p-fact·p-post·p-liq·p-caja·p-dis·p-nom·p-conc·p-sop) |
| C2 | `04:59` | brecha `g-mar` ALTA | **`g-dso`** (`g-mar` no existe en `DATA.brechas`) |
| C3 | `00:285` | "los ~15 puestos" | **27** |
| C4 | `00:307` · `03:121` | "27 puestos … **40 roles**" | 27 puestos **dibujados** · `puestosTotal: 40` = **puestos**, no roles |
| C5 | `02:154` | canvas "1840×~920" | **1840×1300** (decisión 26; el 920 quedó de piso del `Math.max`) |
| C6 | `02:3` | "index.html **v9** (2439 líneas)" | **v11 (2475)** |
| C7 | `02:97` | módulos "Territorio·Mejora·**Cambios·Método**" | DOM real: **Territorio·Mejora·Método·Cambios** (`index.html:538-541`) |
| C8 | `02:89` · `03:291` | "fit por defecto **58%**" | relativo al viewport: **~58% stage ancho · ~46% @1568px** |

**Lo que SÍ cuadraba en su momento** (cifras de julio 25; **v19 las movió** — ver el recuadro al pie
del bloque K): 7 objetivos · 14 áreas · 17 procesos · 8 brechas ·
12 KPIs · 11 sistemas · 4 capabilities · 4 arneses · 4 ideas · 86 `personasExtra` · 11 lienzos plenos
(10 en `DATA.lienzos` + flagship `p-cob`) + 6 stub · 14 instrucciones z3 · 17 SIPOC · la matriz
`CAPAS_APLICAN` **idéntica** a la tabla de `02 § 3` · el "Pulso 1/7 en banda" (1 objetivo verde de 7).

---

# D · Método, reglas y proceso

## D1 · M32 dice "las 9 entidades del twin" 🟠

`sistema/metodo/methodologies.yaml:795` (`M32.cuando_usar`): *"siempre — es la gramática de **las 9
entidades** del twin"*. El schema v2 tiene **12** (CK-26). `GRAFO.md` lo propaga (es generado).

El cerebro metodológico se contradice con el schema, y M32 es justamente la card que **define la
gramática de las entidades**. **Fix por `/metodo-aprende`** (`methodologies.yaml` tiene gate
pre-commit; `GRAFO.md`/`METODOLOGIA.md §4` son generados y no se editan a mano).

## D2 · `CLAUDE.md` y reglas dicen "9 entidades" 🟠

Ya anotado en `06` como "saldar aparte". Sigue abierto. Es rule/instruction file → **lo firma el
operador**. Va junto con D1 (misma corrección, dos SSoT distintas).

## D3 · `state: idea` con 11 versiones de mockup y dossier de 7 docs 🟡

La historia sigue en `state: idea`. No hay `01-spec.md`, ni § Mapa funcional, ni scenarios, ni
`04-validators.yaml`. El arnés define `idea → refining → refined → ready → …`.

Es una decisión consciente (el mockup ES el contrato visual previo al refinamiento, decisión 6+10),
pero el riesgo es real y conviene nombrarlo: **hoy nada de esto tiene criterio de aceptación
verificable**. `05 § orden sugerido` ya prevé el `/po-ux` a mano. **Decide el operador** cuándo se
cruza el umbral.

## D4 · M40 y M30 — limpios ✅

- **M40** (frontera persona / CK-24): verificado en `openPersona`, `openRol`, `openActividad` y en la
  leyenda de la banda Gente. RTLX agregado por rol · uso de arnés por rol · autoría de ideas
  reconocida pero jamás medición · persona sin nodo medible. **Sin hallazgos.**
- **M30** (BSC): la card dice `cuando_si: "SOLO-CHECKLIST de perspectivas"` y
  `cuando_no: "NO framework completo"`. La **decisión 15** (BSC = orden interno de la banda
  Estrategia, no piel propia) cumple la card **mejor** que la decisión 2 original. **Sin hallazgos.**

---

# H · La agenda del directorio (auditoría 2026-07-29 · "¿le interesa esto a un directorio?")

**Qué se pidió.** El operador: *"revisa la vista del directorio a conciencia, sin defender lo ya
realizado — ¿les interesa lo que hay, o también debería verse el estado de resultados y otros
elementos NIIF? dime qué cosas NO estamos mostrando que sí son relevantes a un directorio en sus
reuniones"*.

**Qué se midió.** El `renderDirectorio()` vivo (paneles, filas y acciones reales) contra la agenda
efectiva de una sesión de directorio y contra `ACC` (el catálogo de acciones). Resultado: lo que había
cubría la **ejecución de la estrategia** (apuestas · apetito · mezcla · alertas · portafolio) —
la segunda mitad de la agenda, y genuinamente diferenciadora. Faltaba la primera mitad completa:
resultado, caja, presupuesto y acuerdos. Los 13 hallazgos están en el tablero (H1-H13).

**Los tres más severos, y por qué.**
- **H2 — la apuesta promete y no cobra.** El producto acusa a otros de "indicador sin ancla de valor"
  (`g-post`, la joya del diagnóstico) y cometía exactamente eso en su nivel más alto: `valor.s`
  ("persigue +S/ 3.1M/año") sin ningún campo que registre lo cobrado. Cerrado en v18 con `valor.cobrado`
  verificado por finanzas — jamás declarado por quien apostó.
- **H1 — la bandeja configuraba el modelo.** 4 de 6 filas eran fijar apetito / fijar mezcla / sellar /
  cerrar bajada: *setup del propio Cockpit*. En la sesión N°4, con el marco ya fijado, esa bandeja queda
  vacía y el directorio no tiene nada que firmar. Cerrado con decisiones de plata que llegan **por umbral
  de facultades** — el mecanismo que las hace recurrentes.
- **H3/H8 — cero dato cerrado, cero caja.** Un directorio descuenta el dato interno hacia adelante.
  Lo que vuelve creíbles las apuestas es un resultado cerrado al lado, con su estado de cierre.

## La decisión de alcance sobre NIIF (bloque C)

**Sí al resultado, no al juego completo de estados financieros.** Razones, en orden: (1) reproducir los
EEFF convierte a Cockpit en un tablero contable más — commodity, y pierde el diferenciador; (2) pierde
la pelea de calidad del dato contra el sistema contable (aquí, Nubecont, ya declarado con carga diaria
y 14 tablas); (3) mostrar cifras no cerradas en una superficie de directorio es un riesgo real — los
EEFF tienen ciclo de cierre, dictamen y reexpresiones.

**La posición firmada:** *Cockpit no es el libro contable — es el puente entre el libro y la
organización.* Lee un puñado de cifras **con estado de cierre y procedencia** y **baja cada una al
proceso/área que la produce**. Lo que no hace se declara explícitamente en `openAlcanceContable`.

**El puente** (`DATA.puente`, 6 filas) nombra las decisiones contables que dependen de cómo opera la
empresa, cada una navegable al twin. La norma se cita **sólo dentro de la ficha, como procedencia** —
mismo trato que los códigos de carta del método; hay gate en la suite (`cero /NIIF|NIC \d/` en pantalla).

| Decisión contable | De qué operación depende | Ancla en el twin |
|---|---|---|
| Cuándo se reconoce el ingreso | entregas y avance de obra | `iv-mar` |
| Cuánto se provisiona por cobranza dudosa | la mora y los días de cobranza | `g-dso` |
| **Cuánto vale lo que está a medio construir** | **el avance REAL, no el declarado** | **`g-avc`** |
| Qué contingencias se registran | litigios, penalidades, licencias | `p-perm` |
| Qué arrendamientos entran al balance | contratos de terreno/oficina/equipo | — |
| Qué operaciones con vinculadas se revelan | gobierno y partes relacionadas | — |

**La joya.** `g-avc` (87% real vs 95% declarado) deja de ser sólo una brecha de obra: es el input de si
**lo construido está bien valorizado** en el libro — materia de directorio y de auditoría. Ningún
sistema contable puede detectarlo, porque no conoce el proceso. Es la demostración más limpia de por qué
el twin y el libro son cosas distintas que se necesitan.

## Deuda que abrió esta auditoría — ✅ CERRADA el mismo día (2026-07-29)

- **Método → CERRADO.** `/metodo-aprende` corrido con el protocolo completo (prior-art scan → clasificar →
  barrido de contradicciones → gate): **5 cartas nuevas** — **M55** reporte financiero como fuente ·
  **M56** liquidez (caja 13 semanas y límites del financiamiento) · **M57** presupuesto y control
  presupuestario · **M58** gobierno de la sesión (acuerdos, acta, facultades) · **M59** valor ganado
  (portafolio de inversiones) — y **3 enriquecidas**: **M52** gana el REGISTRO (la contraparte del
  apetito que ya declaraba), **M22** gana la REALIZACIÓN (prometido vs cobrado, verificado por
  finanzas), **M16** nombra cl.9.3 explícitamente. Recíprocas cableadas (M16⇄M58 · M22⇄M04/M55/M42 ·
  M25⇄M58 · M30⇄M55 · M42⇄M59 · M50⇄M59 · M52⇄M56/M58 · M54⇄M57). Catálogo **54 → 59**, gate verde.
  *Nota de disciplina:* el registro de riesgos NO entró como carta nueva — es la otra mitad de ISO
  31000; una carta espejo habría sido exactamente la duplicación que el protocolo prohíbe.
- **Esquema → CERRADO.** Fichas **D-24** `riesgo` · **D-25** `sesion`+`acuerdo` (+`empresa.config_gobierno`
  con las facultades) · **D-26** `periodo` (+subesquema `cifra`) · **D-27** `proyeccion_caja` ·
  **D-28** `presupuesto` · **D-29** `inversion` · **D-30** `apuesta.valor.cobrado`. El schema pasa de
  **13 a 20 nodos** (41 relaciones · 32 acciones · 15 invariantes nuevos); `gen_schema.py` verde,
  `go test ./...` verde (los enums nuevos no entran en la paridad Go actual — si alguno se lleva a Go,
  va al test en el mismo commit).
- **Contrato de build → ESCRITO.** `08-nivel-1-contrato-de-construccion.md`: frontera, entidades,
  panel↔dato, estados vacíos honestos, derivados, acciones, 12 escenarios de aceptación, casuística
  obligatoria del fixture y trazabilidad panel→carta→ficha.

**Sigue abierto (espera al operador):** promoción de **M52** `horizonte → ancla` (decisión de dogma —
el nivel 1 ya lo materializa mientras la carta dice "no en el MVP"; declarado como tensión dentro de la
propia carta) · **H7** aterrizaje proyectado · **H10** moneda/exposición · **H11** cumplimiento como
superficie propia · **H12** personas a nivel directorio · **conectores reales** (todo el nivel 1 es
dato canned hoy).

---

# Recetas — cómo se reproduce esta auditoría

```bash
# 1 · servir el mockup con charset (el HTML no trae <meta charset>; el Artifact se lo agrega)
D=/tmp/twin-serve; mkdir -p $D
SRC=docs/product/prototypes/twin-territorio-2026-07-20/index.html
{ printf '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"></head>\n'; cat $SRC; \
  printf '\n</html>\n'; } > $D/index.html
(cd $D && python3 -m http.server 8777)

# 2 · evaluar el `const DATA` real SIN navegador (stub de DOM vía Proxy) para contar cardinalidades,
#     huérfanos, KPIs sin ancla, campos por entidad. Ver el patrón en la sesión 2026-07-25:
#     new Function('document','window',…, <script del html>) + Proxy que devuelve self en todo get.

# 3 · gramática de fichas: extraer el cuerpo de cada `function open*` y buscar
#     prov( · conocimientoHTML( · data-acc=" · data-<tipo>=
# 4 · acciones mockup ↔ schema:
grep -o 'data-acc="[^"]*"' docs/product/prototypes/twin-territorio-2026-07-20/index.html | sort -u
grep -oE '\{ id: [a-z-]+, +entidad: [a-z_]+' sistema/schema/objeto.schema.yaml
# 5 · método: /metodo → GRAFO.md → grep -n "^M36:" methodologies.yaml → Read offset limit=26
```

**Regla de la casa:** ningún número de este doc se escribe "a ojo". Si un hallazgo no tiene
`file:line` o una medición reproducible, no entra al tablero.

---

# K · El hilo medido, la madurez con vara y la bajada al gerente (auditoría 2026-07-29 · v19)

**Qué se pidió.** El operador: *"compará la estrategia contra nuestro método y decime qué estamos
omitiendo o haciendo mal; revisá que los objetivos del directorio sean coherentes; foco en KPIs y
niveles de madurez"*. Después, al ordenar la corrección: *"los usuarios son el gerente general y los
gerentes, y a través de nuestras acciones diarias debemos resolver todo lo que se muestra en
directorio"*.

**Qué se midió.** El `DATA` vivo × `objeto.schema.yaml` (20 nodos) × el catálogo de 59 cartas vía
GRAFO × `nichos/inmobiliario.yaml`. Cuarenta hallazgos (K1-K40); **28 cerrados en v19**, 12 abiertos y
declarados en el tablero con su dueño.

## La decisión de fondo que ordenó todo lo demás

> **El directorio decide; la gerencia resuelve. Nada del nivel 1 se queda sin bajada.**

El nivel 1 estaba completo como *agenda* (v18) y era **inejecutable como sistema de gestión**: siete
metas de empresa que ningún rol tenía asignadas, alertas sin destinatario, cifras sin nadie que las
moviera. Un tablero así se mira una vez al mes y no cambia nada.

De ahí salen las tres cosas que cambiaron de forma, no de contenido:

1. **La bajada es dato** (D-35). La meta del directorio se abre como meta de UNA gerencia, con el rol
   que responde y la sesión donde el gerente la aceptó. Meta sin hijos = *sin bajar*; con hijos y sin
   sesión = *asignada, no acordada*. Las dos llegan solas a la bandeja, derivadas del grafo.
2. **Todo lo que el nivel 1 muestra declara dónde se resuelve.** Cifras (`res`), alertas ("lo resuelve
   Comercial · meta bajada: …"), riesgos (rol + mitigación comprometida), proyectos (por qué sube al
   directorio, o por qué se queda en la gerencia).
3. **El nivel 3 abre con lo que el directorio dejó** — metas bajadas, acuerdos abiertos, riesgos con
   dueño — y sigue con el trabajo que las mueve. Cero duplicación: lo que sube dice que se resuelve
   abajo, y lo que se queda abajo dice por qué no sube.

## Qué BAJÓ del directorio a lo táctico (y por qué)

| Bajó | Antes | Ahora |
|---|---|---|
| **El portafolio de proyectos** | el nivel 1 listaba los 3 y el nivel 3 los volvía a listar por área | el nivel 1 sigue **sólo** lo que mueve una meta del año o cerró con veredicto, y cada fila dice por qué sube; el resto se gobierna en el nivel 3, y el panel lo declara |
| **Las alertas completas** | 4 filas escritas a mano | se derivan; al directorio sube lo que nadie resolvió abajo, con su destinatario. El detalle vive en «aquí nacen los compromisos» (nivel 3) |
| **Registrar el avance de una inversión** | acción de nivel táctico ofrecida en la sala | el directorio *aprueba* la inversión; el avance lo registra quien la ejecuta |
| **Los acuerdos, entre sesión y sesión** | sólo se veían en el directorio, una vez al mes | el gerente los ve todas las semanas; cuando la sesión abre preguntando, ya están cerrados o ya se sabe por qué no |

## Las dos correcciones de fondo sobre KPIs

- **El hilo ancla al contrato, no al objetivo** (A2, abierto desde julio). `kpi.kr` reemplaza a
  `kpi.obj`; el valor del contrato se **lee** de la serie (D-34) en vez de teclearse al lado. El caso
  que lo prueba: «caja sana» leía **verde** porque su único contrato (cobranza consolidada) llegó a la
  meta — con la caja cayendo bajo el piso, un riesgo alto y 18 % de valor cobrado. Con dos contratos y
  el gris pesando por encima del verde, el objetivo dice lo que pasa.
- **La vara externa sale del eje vertical.** El tablero afirmaba «pares 45-60 días» de cobranza contra
  una unidad de nicho que dice, textual, que ese benchmark **no existe validado** y que el rango se
  levanta por cliente. El producto acusaba a otros de indicador sin ancla y afirmaba sin fuente en su
  propia portada. Ahora el KPI apunta a su unidad y **hereda su confianza**: sin rango validado se
  muestra la condición, que es información — no un hueco.

## Y las dos sobre madurez

Convivían **tres** escaleras sin arbitraje en el dato: la de capacidad (COBIT 0-5), la del sistema de
gestión (ISO 9004 1-5, sin ficha) y un `madurez` de tres colores en el área — pintado bajo una leyenda
que prometía niveles 0-5. Un color no es un nivel.

- **D-32:** el número viaja con su escalera (`escala_madurez`), la del área se **deriva** de las
  capabilities de su subárbol, y sin `nivel_deseado` hay nivel pero **no hay brecha** — la capa lo dice
  en vez de pintar una distancia que nadie fijó.
- **D-33:** la escalera del sistema de gestión gana ficha, evidencia del twin por dimensión y sesión de
  evaluación. Su dimensión `estrategia` bajó de 3 a 2: declararse sin brecha el mismo mes en que la
  auditoría encontró trece hallazgos de gobierno era el síntoma exacto de una autoevaluación sin
  evidencia.

## Lo que la suite ahora impide que vuelva (6 checks nuevos · 40/40)

`v19-hilo-al-contrato` (ningún KR guarda su valor · pesos que suman 1 · sin-ancla con su brecha) ·
`v19-direccion-y-banda` (dirección declarada · enum de frecuencia · el caso donde la inferencia vieja
se equivocaba) · `v19-bajada` (metas con gerencia y rol · los dos casos honestos · el nivel 3 abre con
ellas) · `v19-madurez-con-vara` (sin campo en el área · sin deseado no hay brecha · autoevaluación con
evidencia y sesión) · `v19-acciones-declaradas` (ninguna acción ofrecida fuera del catálogo) ·
`v19-alertas-con-destinatario` (toda alerta con quién la resuelve · la cifra sin destinatario se
declara).

## Cardinalidades vigentes tras v19 (medidas, no estimadas)

| Qué | Antes (v18) | Ahora (v19) | Por qué cambió |
|---|---|---|---|
| objetivos | 7 planos | **10** = 5 del directorio + 5 bajadas | D-35: la cascada existe como dato |
| contratos de cambio (KR) | 7 (uno por objetivo) | **11** | «caja sana» tiene dos: cobranza y caja visible |
| indicadores | 12 | **15** | los 3 contratos que no tenían serie (`k-mar`·`k-dsoc`·`k-viv`) |
| brechas | 8 | **10** | `g-aud` (hallazgos del dictamen) · `g-prov` (proveedores externos, cl.8.4) |
| capacidades | 4 | **10** | la madurez del área se deriva de ellas: con 4 el mapa quedaba casi sin pintar |
| unidades de nicho (inmobiliario) | 6 | **8** | N-IMM-07 margen · N-IMM-08 satisfacción del propietario |
| acciones del esquema | 32 | **40** | 6 declaradas + `bajar-objetivo` + `acordar-bajada` |
| checks de la suite | 34 | **40** | uno por doctrina corregida |

Sin cambios (verificado): 14 áreas · 17 procesos · 11 sistemas · 4 arneses · 4 ideas · 86
`personasExtra` · 11 lienzos plenos · 14 instrucciones z3 · 17 SIPOC · 20 nodos del esquema.
