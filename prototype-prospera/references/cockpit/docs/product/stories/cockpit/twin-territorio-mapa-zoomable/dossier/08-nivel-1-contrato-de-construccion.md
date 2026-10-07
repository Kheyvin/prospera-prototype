# 08 · Nivel 1 · Directorio — contrato de construcción

> Parte del dossier. **Escrito 2026-07-29** tras la auditoría de la vista del directorio (13
> hallazgos, `07 § H`), la ingesta de método (**M55-M59** + M52/M22/M16 enriquecidas) y las fichas
> de esquema (**D-24…D-30**). **Éste es el documento que se lee para CONSTRUIR el nivel 1**: qué
> entidades existen, qué lee cada panel, qué se deriva, qué acciones hay, qué se verifica y qué NO
> se construye. Nada de acá es una idea suelta: todo tiene carta de método y ficha de esquema.
>
> Lo visual (cómo se ve, dónde vive cada clase CSS) está en `02 § Nivel 1`; los porqués finos y las
> alternativas rechazadas en `03 § decisión 27`; la casuística de datos en `04`.

---

## 0 · La frontera (léase antes que nada)

**Cockpit no es el libro contable, ni el sistema de tesorería, ni el libro de actas legal.** Lee sus
cifras con **estado de cierre** y **procedencia**, y hace lo que ninguno de ellos puede: **bajar cada
número al proceso, área o rol que lo produce**. Esa bajada es el producto.

| Cockpit SÍ | Cockpit NO |
|---|---|
| Lee un puñado de cifras del periodo con su estado de cierre | Arma el juego completo de estados financieros ni sus notas |
| Cita el dictamen del auditor y ancla sus hallazgos como brechas | Corre el cierre contable · reexpresa cifras cerradas · emite opinión |
| Guarda la proyección de caja, el piso firmado y los límites del banco | Ejecuta pagos ni reemplaza al sistema de tesorería |
| Guarda el reparto del presupuesto y su compromiso | Reemplaza la presupuestación del ERP ni guarda el asiento |
| Genera el acta **de gestión** de la sesión y la versiona | Reemplaza la formalidad societaria (firmas, legalización, registro) |
| Guarda las cinco varas comparables de cada inversión | Calcula los índices completos de valor ganado ni reemplaza el control de obra |

**Regla de superficie (heredada, no negociable):** el código de la norma contable (NIIF/NIC) vive
**sólo dentro de la ficha**, como procedencia — jamás en pantalla. Mismo trato que los códigos M-NN.
Hay gate en la suite (`v18-directorio-agenda` asserta cero `NIIF|NIC \d` en el `pageview`).

**Regla de generalidad:** ninguna entidad de este nivel es de un rubro. Lo que cambia entre
industrias es el **contenido de las filas**, jamás las preguntas. El único campo que codifica el
rubro es `inversion.tipo` (obra · planta · local · contrato · linea-producto · sistema).

---

## 0.bis · La regla que gobierna todo el nivel (v19)

> **El directorio decide; la gerencia resuelve. Nada del nivel 1 se queda sin bajada.**

Los usuarios de Cockpit son el **gerente general y sus gerentes**: preparan la sesión y ejecutan lo que
sale de ella. Un panel del nivel 1 que no aterriza en un rol con una acción es un reproche mensual, no
un sistema de gestión. Por eso, **todo lo que este nivel muestra declara dónde se resuelve**:

| Lo que se muestra | Declara |
|---|---|
| una meta del directorio | qué gerencias la tienen abierta (`parent_ref` + `area_ref`) y si la **acordaron** (`acordado_en_ref`) |
| una cifra del periodo | quién la **produce** (`ancla_ref`) y qué meta bajada la **mueve** (`resuelve_en_ref`) |
| una alerta | de qué gerencia es y con qué meta bajada se trabaja |
| un riesgo | el rol que responde y la mitigación comprometida |
| un proyecto | por qué **sube** al directorio (mueve una meta del año o supera una facultad) — o por qué se queda en la gerencia |
| un acuerdo | responsable, plazo y sobre qué parte del twin obliga |

Y el corolario de construcción: **lo que se resuelve en el nivel 2/3 no se duplica en el 1**. El nivel 1
sigue el portafolio por excepción; el detalle vive donde se trabaja. Un builder que replique la lista
completa en los dos niveles rompe esta regla.

---

## 1 · El modelo de datos — 7 entidades nuevas + 2 extensiones

SSoT = `sistema/schema/objeto.schema.yaml` (20 nodos). Instancias en `<shell>/empresa/<tipo>/<id>.yaml`
(D-15). Las fichas de decisión están en `sistema/schema/DECISIONES.md`.

| Entidad | Archivo | Ficha | Carta | Qué es |
|---|---|---|---|---|
| `riesgo` | `riesgos/rg-*.yaml` | **D-24** | M52 | el registro: probabilidad · impacto · responsable · mitigación · tendencia, anclado al twin |
| `sesion` | `sesiones/ses-*.yaml` | **D-25** | M58 | la reunión de gobierno: tipo · fecha · periodo revisado · asistentes · acta |
| `acuerdo` | `acuerdos/ac-*.yaml` | **D-25** | M58 | el compromiso: responsable · plazo · estado · sobre qué parte del twin obliga |
| `periodo` | `periodos/per-*.yaml` | **D-26** | M55 | el resultado leído del sistema contable + subesquema `cifra` |
| `proyeccion_caja` | `caja/caja-*.yaml` | **D-27** | M56 | 13 semanas · piso firmado · líneas · resguardos + quién la firma |
| `presupuesto` | `presupuestos/pre-*.yaml` | **D-28** | M57 | el año en bolsas: asignado vs comprometido |
| `inversion` | `inversiones/iv-*.yaml` | **D-29** | M59 | avance real vs declarado · gasto vs presupuesto · comprometido · entrega · margen |

**Extensiones sobre entidades existentes**

| Dónde | Qué | Ficha |
|---|---|---|
| `empresa.config_gobierno` | cadencia · órgano · **facultades** (`materia` + `umbral`) — qué decisión sube al órgano de gobierno | D-25 |
| `apuesta.valor.cobrado` | `{monto, a_fecha, verificado_por_ref→rol, fuente, conf, nota}` — la contraparte de la promesa | D-30 |

**v19 — lo que la auditoría K1-K40 agregó al contrato** (fichas **D-31…D-36**, todas con gate verde):

| Ficha | Qué cambia para quien construye |
|---|---|
| **D-31** | `kpi.direccion` **requerido** (el mismo campo que `cifra.direccion`: nunca se infiere del orden de la banda) · `frecuencia` gana `por-evento` · `kpi.referencia_externa` apunta a una unidad de `nichos/<vertical>.yaml` y **hereda su confianza** |
| **D-32** | enum `escala_madurez`: el nivel viaja con su vara · **no existe `area.madurez`** (rollup de `capability.assessment`) · sin `nivel_deseado` hay nivel, **no** brecha |
| **D-33** | `empresa.autoevaluacion_madurez[]` — la escalera del sistema de gestión, con `evidencia_refs` y `evaluado_en_ref`→sesion |
| **D-34** | `cifra.fuente`/`conf` propios · **ERROR** si se guarda `cifra.valor` teniendo `kpi_ref`, o `key_result.current` teniendo `kr.kpi_ref` |
| **D-35** | `objetivo.area_ref` · `objetivo.acordado_en_ref` · `cifra.resuelve_en_ref` · acciones `bajar-objetivo` y `acordar-bajada` |
| **D-36** | warning de pesos que no suman 1 · `comprometer-contramedida` · las 6 acciones que la interfaz usaba sin catálogo |

**Enums nuevos:** `marco_contable` · `estado_cierre` · `direccion_cifra` · `holgura` ·
`tendencia_riesgo` · `estado_acuerdo` · `tipo_sesion` · `estado_presupuesto` · `tipo_inversion` ·
`materia_facultad` · **`escala_madurez`** · **`dimension_gestion`** (v19). (Ninguno entra en el test de paridad Go actual — `TestParidadSchema` cubre
`fuente`, `estado_proyecto`, `estado_idea`, `estado_brecha`, `modo_estrategia`, `tipo_unidad`. Si
alguno se lleva a Go, **agregarlo al test en el mismo commit**.)

### 1.1 · Lo que se DERIVA al leer (jamás se guarda)

Mismo principio que `semaforo()`, los scores del triage y `saludKr`. Un builder que persista
cualquiera de estos rompe `un_hecho_un_lugar`:

| Derivado | De qué | Dónde se usa |
|---|---|---|
| variación de una cifra vs plan / vs año anterior / acumulado | `cifra.valor` × `plan`/`anterior`/`acumulado_plan` × **`direccion`** | las 6 tarjetas del movimiento 1 |
| nivel de un riesgo | `probabilidad` × `impacto` (matriz 3×3) | chip del registro y de la ficha |
| veredicto riesgo ↔ apetito | nivel × `empresa.config_estrategia.apetito_riesgo[categoria]` | línea bajo cada riesgo |
| semanas bajo el piso · punto mínimo | `proyeccion_caja.semanas[]` × `piso` | el gráfico y el contador |
| % de bolsa comprometido | `bolsa.comprometido / bolsa.asignado` | barras del presupuesto |
| desvío de avance · % de presupuesto gastado · atraso de entrega | campos de `inversion` | las 3 barras + la fecha |
| `acuerdo` vencido | `plazo` (cuando es fecha) vs hoy | estado del acuerdo |
| mezcla real de ambición | apuestas + proyectos + ideas con `ambicion` | la barra de las varas |
| valor actual de un KR | la ÚLTIMA MEDICIÓN de `kr.kpi_ref` (v19 · D-34) | el rumbo, la ficha del objetivo, el pulso |
| salud de un objetivo | peor de sus KRs, con el **gris por encima del verde** (v19) | el pulso y toda tarjeta de objetivo |
| estado de la bajada | `objetivo.parent_ref` × `acordado_en_ref` (v19 · D-35) | el rumbo, la bandeja, el nivel táctico |
| madurez de un área | peor-hijo de `capability.assessment` de su subárbol (v19 · D-32) | el lente de madurez |
| brecha de madurez | `nivel_deseado − nivel_actual`, **sólo si hay deseado** (v19 · D-32) | ficha de capacidad |
| qué proyecto sube al directorio | mueve una meta del año ∨ supera una facultad ∨ cerró con veredicto (v19) | el panel de portafolio |

### 1.2 · Invariantes que el builder DEBE respetar

Bloquean (`ERROR`, v19): `kpi` sin `direccion` · `key_result.current` guardado teniendo `kpi_ref` ·
`cifra.valor` guardado teniendo `kpi_ref` — las tres por la misma razón: **un hecho, un lugar**; dos
copias del mismo número es cómo el tablero del directorio y el del gerente empiezan a discrepar.

Avisan (`warning`, v19): meta del directorio (`horizonte` anual|3a) **sin objetivos hijo** ⇒ *sin
bajar* · bajada **sin `acordado_en_ref`** ⇒ *asignada, no acordada* · pesos de los KPI de un KR que no
suman 1 · `key_result` sin `accountable_ref` · `capability.assessment` sin `nivel_deseado` o sin
`escala` · dimensión de autoevaluación sin `evidencia_refs` · `kpi.referencia_externa` cuya unidad de
nicho es `hipotesis` ⇒ **no se afirma un rango de pares** · `cifra` sin `resuelve_en_ref`.

Bloquean (`ERROR`): responsable de `riesgo`/`acuerdo`/`inversion` que resuelve a **persona** (CK-24
— responde el rol) · `cifra` sin `direccion` · `periodo` auditado sin dictamen · `apuesta.valor.cobrado`
en apuesta no sellada · `cobrado` sin `verificado_por_ref` · `presupuesto` aprobado sin
`aprobado_en_ref` · `acuerdo` sin responsable o sin plazo.

Avisan (`warning`): categoría de riesgo sin vara (⇒ "apetito sin definir", **jamás** un nivel
inventado) · riesgo sin mitigación ni responsable · tendencia con una sola observación ·
`proyeccion_caja` sin piso (⇒ serie sin vara) o piso sin firma · proyección firmada por un rol cuyo
puesto está **vacante** (⇒ `conf` baja, visible) · `inversion.avance_declarado > avance_real` (⇒
candidato a brecha) · bolsa sobre-comprometida · sesión cerrada sin acta generada.

---

## 2 · Los cuatro movimientos — qué lee cada panel

Orden de la página = orden de la sesión. Cada panel declara su respaldo (`respBadge`) y su estado
vacío honesto: **nunca se inventa un dato; se dice que falta**.

### Movimiento 1 · ¿Cómo nos fue?

| Panel | Lee | Estado vacío honesto |
|---|---|---|
| **Las 6 cifras del periodo** | `periodo` vigente + sus `cifras[]` | sin `periodo` cargado ⇒ "el resultado aún no se conecta al sistema contable" + acción de ingesta; cifra sin `plan` ⇒ se muestra sin variación, no con 0 |
| **Estado de cierre** | `periodo.estado_cierre` | siempre visible junto a las cifras; `preliminar` es el default honesto |
| **Alcance contable** (ficha) | `periodo.marco_contable` · `dictamen` · el puente M55 | marco sin declarar ⇒ "marco de reporte sin declarar" |
| **La caja** | `proyeccion_caja` (serie · piso · hito) | sin piso ⇒ serie sin vara, con aviso; sin serie ⇒ sólo saldo |
| **Límites con el banco** | `proyeccion_caja.resguardos[]` · `lineas` | sin resguardos ⇒ "sin límites registrados" (no significa que no existan) |

### Movimiento 2 · ¿A dónde vamos?

| Panel | Lee | Estado vacío honesto |
|---|---|---|
| **El rumbo** | `empresa.vision` · objetivos del año (`horizonte`) · apuestas · objetivos | sin plan anual ⇒ sólo trimestre |
| **Las apuestas** | `apuesta` + `valor.cobrado` + salud derivada de sus objetivos | apuesta sin sellar ⇒ **"aún no aplica"**, jamás un cero; cobrado sin verificador ⇒ no se pinta como cobrado |
| **Las varas** | `config_estrategia.apetito_riesgo` · `mezcla_objetivo` · mezcla real derivada | categoría sin vara ⇒ "sin definir — fíjalo ⚠" |
| **El presupuesto** | `presupuesto` + bolsas | sin presupuesto ⇒ "sin presupuesto aprobado: la mezcla es una intención" + la decisión en la bandeja |

### Movimiento 3 · ¿Qué puede impedirlo?

| Panel | Lee | Estado vacío honesto |
|---|---|---|
| **Los riesgos** | `riesgo[]` ordenados por nivel derivado | sin registro ⇒ "sin riesgos levantados — candidato M1"; sin apetito de la categoría ⇒ el veredicto lo dice |
| **Alertas que escalaron** | `brecha[]` accionables + `kpi` fuera de banda sin contramedida + vacantes | sin alertas ⇒ se dice, no se rellena |
| **Inversiones en curso** | `inversion[]` | cliente sin inversiones ⇒ **la banda no se dibuja** (disable honesto) |
| **Proyectos en curso** | `proyecto_mejora[]` ordenados por costo de esperar | (sin cambios respecto de v17) |
| **Qué cambió** | diferencia contra la `sesion` anterior | sin sesión previa ⇒ "primera sesión" |

### Movimiento 4 · ¿Qué decidimos?

| Panel | Lee | Regla |
|---|---|---|
| **Espera tu decisión** | acciones pendientes + lo que **supera un umbral** de `config_gobierno.facultades` | cada fila declara POR QUÉ llega al directorio (monto o materia). Sin facultades registradas ⇒ sólo llegan las decisiones de modelo, y se avisa que falta fijarlas |
| **Acuerdos de la sesión anterior** | `acuerdo[]` de la `sesion` previa | es la **primera** entrada de la revisión (ISO 9001 cl.9.3) |
| **Cerrar y generar el acta** | acción `cerrar-sesion` | genera `sesion.acta` versionada; la sesión siguiente abre con ella |

---

## 3 · Las acciones (capa kinética) — 17 nuevas

Catálogo en `objeto.schema.yaml § acciones.catalogo`. Toda acción con aprobación ≠ `directa`
aterriza en la cola de **Cambios** (BL-24 es el motor).

| Acción | Entidad | Nivel mín. | Aprobación |
|---|---|---|---|
| `fijar-apetito-riesgo` · `fijar-mezcla-ambicion` · `fijar-facultades` | `empresa` | gobernanza | gestión-de-cambios |
| `asignar-riesgo` | `riesgo` | gobernanza | revisión-dueño |
| `cerrar-riesgo` | `riesgo` | estratégico | revisión-dueño |
| `comprometer-acuerdo` · `cerrar-acuerdo` | `acuerdo` | estratégico | revisión-dueño |
| `cerrar-sesion` (genera el acta) | `sesion` | gobernanza | directa |
| `aprobar-presupuesto` | `presupuesto` | gobernanza | gestión-de-cambios |
| `comprometer-bolsa` | `presupuesto` | estratégico | revisión-dueño |
| `fijar-piso-caja` · `aprobar-endeudamiento` | `proyeccion_caja` | gobernanza | gestión-de-cambios |
| `aprobar-inversion` | `inversion` | gobernanza | gestión-de-cambios |
| `registrar-avance-inversion` | `inversion` | táctico | directa |
| `registrar-cifras-periodo` | `periodo` | táctico | directa |
| `cerrar-periodo` | `periodo` | estratégico | revisión-dueño |
| `verificar-valor-cobrado` | `apuesta` | estratégico | revisión-dueño |

**Validaciones declaradas** (el builder las implementa, no las inventa): `responsable-no-persona` ·
`responsable-y-plazo-presentes` · `bolsas-suman-total` · `supera-umbral-facultad` ·
`resguardos-revisados` · `estado-cierre-presente` · `fuente-y-conf-presentes` ·
`verificador-no-es-quien-apostó`.

---

## 4 · Escenarios de aceptación (lo que se verifica de verdad)

Escritos para **live-verify**, no para "HTTP 200" (`[[test-design-doctrine]]`). El seam de este repo
es `GET /api/objeto?empresa=<id>` con las 20 entidades juntas.

1. **El resultado baja al twin.** Dado un `periodo` con 6 cifras y `estado_cierre: preliminar`,
   cuando se abre el nivel 1, entonces cada tarjeta muestra variación contra plan **con el signo
   interpretado por `direccion`** (un +7% de gasto NO se pinta como mejora) y su `ancla_ref` abre la
   ficha del proceso/objetivo que la produce.
2. **Preliminar no se disfraza de cerrado.** El estado de cierre acompaña a la cifra en la portada y
   en la ficha; al pasar a `auditado` sin dictamen, el objeto reporta ERROR.
3. **La caja avisa antes.** Dada una serie que cruza el piso en la semana N, el panel marca N semanas
   bajo el piso y el punto mínimo; el hito que la explica es legible.
4. **La vacante degrada el número.** Si `firmada_por_ref` apunta a un rol cuyo puesto está vacante,
   la confianza es baja **y se muestra**, con enlace al área.
5. **La apuesta rinde o lo dice.** Una apuesta sellada muestra prometido y cobrado con su verificador;
   una **no sellada** dice "aún no aplica" y no acepta `cobrado` (ERROR).
6. **El riesgo se mide contra la vara.** Cada riesgo muestra nivel derivado y veredicto contra el
   apetito de SU categoría; categoría sin vara ⇒ "apetito sin definir — fíjalo", jamás un nivel.
7. **El desvío de avance viaja.** Una inversión con `avance_declarado > avance_real` marca el desvío
   en el renglón, lo explica en la ficha (valorización de lo construido) y aparece como candidato a
   brecha.
8. **La decisión llega por umbral.** Una inversión o deuda que supera `config_gobierno.facultades`
   aparece en la bandeja con la razón; por debajo del umbral, no aparece (decide la gerencia) y queda
   igual en el historial.
9. **La sesión abre con lo anterior.** Los acuerdos de la sesión previa se listan con responsable,
   plazo y estado; al menos uno vencido se ve como vencido.
10. **La sesión cierra en acta.** `cerrar-sesion` genera el acta versionada con lo decidido y los
    acuerdos abiertos; queda en el historial de la organización.
11. **Cero norma en pantalla.** Ningún código NIIF/NIC aparece en la página; sí dentro de la ficha de
    alcance, como procedencia.
12. **Generalidad visible.** Cada bloque nuevo declara su equivalente en otra industria.

### v19 — los que el nivel 1 no puede dar por construido sin cumplir

13. **La meta baja o se dice que no bajó.** Una meta del directorio sin objetivos hijo aparece como
    *sin bajar* y genera la decisión en la bandeja; una bajada sin `acordado_en_ref` aparece como
    *asignada, no acordada*, en la ficha y en el nivel del gerente. Ninguna de las dos se completa sola.
14. **El contrato lee su serie.** El valor actual de un KR sale de la última medición de su KPI; si el
    builder lo guarda aparte, el objeto reporta ERROR. Un KR sin serie se muestra como meta
    **declarada**, jamás como meta medida.
15. **Un contrato cumplido no tapa a otro roto.** Un objetivo con un KR en meta y otro sin dato NO lee
    verde: el gris pesa por encima del verde en el rollup (y jamás rojo — la ausencia de dato no pinta
    rojo). Escenario de referencia: «caja sana».
16. **La dirección no se infiere.** Un indicador cuya banda tiene los dos umbrales del mismo lado, o
    iguales, se pinta por `direccion` y no por el orden de los números.
17. **La vara externa hereda su confianza.** Si la unidad de nicho no tiene rango validado, la ficha
    muestra su condición ("sin vara comparable") y **no** un rango de pares. Un rango escrito a mano,
    sin unidad detrás, es error de procedencia.
18. **Un nivel de madurez sin escalera no se pinta**, y sin `nivel_deseado` se muestra el nivel
    diciendo que nadie fijó la meta. La madurez de un área se deriva; si no hay capability evaluada en
    su subárbol, el lente dice *sin evaluar*.
19. **Toda alerta tiene destinatario.** Cada fila declara la gerencia que la resuelve y, si existe, la
    meta bajada que la trabaja. Una cifra sin `resuelve_en_ref` se muestra como *sin nadie que la
    mueva* — no se oculta.
20. **Ninguna acción se ofrece sin estar declarada** en `acciones.catalogo`, y ninguna acción declarada
    del nivel queda sin superficie.

---

## 5 · Casuística obligatoria para el golden fixture

Al portar a `organizacion-ficticia-golden-fixture` (CK-23), **cada caso debe seguir teniendo un
ejemplar** — perder la casuística es perder el guion de venta y el valor de prueba:

- **una meta del directorio sin bajar** y **una bajada sin acuerdo** (las dos preguntas con que abre
  toda revisión) — más una meta que sí va bien, para que el tablero no sea un mar de rojo;
- un objetivo con **dos contratos**, uno en meta y otro **sin serie**, para probar que no lee verde;
- un indicador **sin ancla de valor** que declara la brecha que sí lo cubre, y su acción de promoverlo;
- una capacidad **sin nivel deseado** (hay nivel, no hay brecha) y un área **sin capability evaluada**;
- un indicador con **vara de nicho validada** (rango + fuente) y otro cuya unidad dice *hipótesis*;
- una **cifra sin destinatario** (`resuelve_en_ref` vacío), para que el tablero sepa declararlo;
- caja que **cruza el piso** en una semana concreta, con el hito que lo explica;
- proyección con **confianza baja porque el puesto que la firma está vacante** (une organigrama ↔
  confianza de una cifra de directorio);
- apuesta **sin sellar** que no cobra nada, y apuesta sellada con cobro **parcial** verificado;
- inversión con **avance declarado > real** (el hallazgo que llega hasta la valorización contable);
- inversión que **no arranca** por una licencia (proceso lento del twin, con precio);
- **presupuesto sin aprobar** con la decisión esperando en la bandeja;
- riesgo **por encima del apetito** y categoría **sin vara definida**;
- **un acuerdo vencido** hace dos sesiones, y que sea exactamente la firma que le falta a la caja;
- un `periodo` **preliminar** con dictamen del ejercicio anterior y hallazgos anclados como brechas.

---

## 6 · Trazabilidad — panel → método → esquema

| Panel del nivel 1 | Cartas | Fichas de esquema |
|---|---|---|
| Resultado del periodo · alcance contable | **M55** · M16 (cl.9.3) · M22 · M23 · M30 | D-26 |
| La caja y los límites | **M56** · M52 · M23 · M28 | D-27 |
| El rumbo | M26 · M30 · M41 | — (vigente) |
| Las apuestas (prometido / cobrado) | M04 · **M22 enriquecida** · M52 · M54 | D-23 · **D-30** |
| Las varas y el presupuesto | **M57** · M54 · M04 · M25 | D-22 · **D-28** · D-25 (facultades) |
| Los riesgos | **M52 enriquecida** · M16 (cl.6.1) · M23 | **D-24** |
| Alertas que escalaron | M41 · M16 · M48 · M23 | — (vigente) |
| Inversiones en curso | **M59** · M55 · M57 · M50 · M42 · M23 | **D-29** |
| Proyectos en curso | M16 · M28 · M22 | — (vigente) |
| Bandeja de decisiones · acuerdos · acta | **M58** · M16 (cl.9.3) · M25 · M41 | **D-25** |
| **La bajada** (rumbo → gerencia) · el nivel táctico | **M26** · M41 · M21 · M25 · M58 | **D-35** |
| **El hilo medido** (contrato ← serie) · pesos · contramedida | **M21** · M06 · M41 | **D-31** · **D-34** · **D-36** |
| **La madurez** (capacidad · sistema de gestión) | **M15** · **M47** · M31 · M23 | **D-32** · **D-33** |
| **Las varas externas** de cada indicador | **M48** · M23 · nichos/`<vertical>`.yaml | **D-31** |

---

## 7 · Lo que NO se construye en este alcance (y por qué)

- **Estados financieros completos, notas y cierre contable** — frontera §0, decisión firmada.
- **Exposición cambiaria / multimoneda** — `periodo.moneda` es una sola por periodo; la vista de
  exposición es horizonte declarado (hallazgo **H10** del tablero `07`).
- **Aterrizaje proyectado a fin de año por meta** — hoy hay acumulado contra plan; la proyección de
  cierre es **H7**.
- **Cumplimiento como superficie propia** (hallazgos de auditoría, litigios, licencias, seguridad) —
  hoy viven como riesgos y como brechas; superficie propia es **H11**.
- **Personas a nivel directorio** (sucesión, rotación, planilla sobre ingresos, contingencia laboral)
  — **H12**, y con la frontera CK-24 vigente.
- **Índices completos de valor ganado** (desempeño de costo y cronograma) — el MVP guarda las cinco
  varas comparables.

## 8 · Deuda abierta que este contrato deja

1. ~~Promoción de M52 de `horizonte` a `ancla`~~ — **cerrada en v19**: promovida a `ancla` con
   `modo: columna`. Una carta que contradice al producto vigente no es un horizonte, es drift. Lo que
   NO cambió: sigue sin aparato ERM y sin certificación (VISION §ISO intacta).
2. **Conectores reales** — hoy las cifras, la caja y las inversiones son dato canned del mockup. La
   app las lee del sistema contable / banca / control de obra, con procedencia (N16).
3. **`comprometer-bolsa` de verdad** — que sellar una apuesta o aprobar un proyecto descuente de la
   bolsa; hoy el importe comprometido es dato.
4. **Cartas de método faltantes** — ninguna: M55-M59 cubren el nivel. Lo que falta es el `proceso/**`
   (los pasos del engagement que levantan `periodo`, `caja`, `presupuesto`, `riesgos` y `acuerdos` en
   m1 y los mantienen en m2) — hoy el árbol está poblado parcialmente.
6. **Lo que la auditoría K1-K40 dejó abierto** (tablero `07 § K`, 12 filas con dueño): indicadores
   adelantados y de riesgo (`tipologia_kpi`/`tipo_kpi` sin usar, **K18**) · contra-métricas (**K19**) ·
   la vara por cifra, hoy hardcodeada en el código (**K21**) · el sello de la apuesta (**K37**) ·
   auditoría interna y proveedores externos como superficie (**K36**) · y sobre todo **K33**: las
   cartas M55-M59 no tienen **ni un paso de proceso** — nadie sabe todavía cómo LEVANTAR este nivel en
   un cliente. Construirlo sin eso deja un tablero que sólo se puede poblar a mano.
7. **`01-spec.md` de la historia** — hallazgo **D3** del tablero: la historia sigue en `state: idea`
   con 8 documentos de dossier. Este documento es el contrato del **nivel 1**; el spec formal de toda
   la historia sigue pendiente de decisión del operador.
