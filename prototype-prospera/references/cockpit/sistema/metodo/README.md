# metodo/ — el método del servicio/auditor as-code

El método con que se levanta, diagnostica y mejora una empresa cliente. Es SISTEMA (define qué
hace Cockpit), no documentación de features. Se empaqueta en arneses (Arnesia/N15) para las apps del
edge — Consultio (N14, ex App del Auditor, BL-15/16/26). Completado
desde el legacy `prenter-harness/service/` en CK-11 (antes solo había catálogo + veredicto ISO).

## Doctrina y catálogo

`methodologies.yaml` es el catálogo COMPLETO — nació con las 31 fichas del registry del monorepo
de origen y creció a **45 (M01-M45)**: familia I «Twin & automatización del trabajo» (CK-21) +
cards del schema v2 (CK-26). El conteo SSoT es `_meta.total` (el gate lo valida — no citar números
en prosa sin mirarlo). Incluye metodologías de construcción de software (Dual Track, Shape Up, JTBD,
EARS, BDD, WSJF, Wardley) que son dominio de DevStudio/Kit, no de Cockpit; se dejaron íntegras para
no perder contexto ni relaciones (`combina_con`). `METODOLOGIA.md` es la narrativa completa generada
de ese catálogo. Las que aplican directo a los 4 pilares de `VISION.md`:

| Pilar | M-cards |
|---|---|
| Procesos | M07 Event Storming · M09 Value Stream Mapping · M10 Service Blueprint · M11 BPMN · M12 APQC PCF |
| Roles | M25 RACI |
| Objetivos | M15 COBIT 2019 · M21 OKR · M26 Hoshin Kanri · M30 Balanced Scorecard |
| Personas/puestos | M29 Process/Task Mining |
| Transversal | M13 ArchiMate/TOGAF · M16 ISO 9001 · M24 This Is Service Design Doing · M31 Business Capability Modeling |

[`ISO-9001-veredicto-I-05.md`](ISO-9001-veredicto-I-05.md) (en `docs/metodo/`,
CK-28) — el precedente que decide CUÁNTO de ISO 9001 se usa (ontología sí, aparato de
certificación no) y que `VISION.md §ISO` hereda y amplía (CK-10).

## Acceso (el cerebro)

**`GRAFO.md`** — índice-grafo GENERADO (1 línea por card/paso/unidad-nicho + grafo inverso "dónde se
operacionaliza cada card" + backbone + recetas grep). Entrada canónica de consulta: skill **`/metodo`**
(mapa → grep+Read dirigido, ≤6 nodos por tarea). Ingesta/reemplazo de conocimiento: skill
**`/metodo-aprende`** (prior-art scan → clasificar new/extend/supersede → barrido de contradicciones →
gate). Ciclo de vida en el contrato v3: `estado: vigente|superseded|descartada` (+`superseded_by`,
`razon_estado`) — el conocimiento reemplazado queda como memoria con puntero, no se borra.

**Eje NIVEL (contrato v4 · CK-33)** — cada card declara en qué piso de la organización se usa:
**Directorio · Estratégico · Táctico · Operativo** (rótulos del `GLOSARIO.md`). `nivel_primario` = donde
se DECIDE/FIRMA lo que produce · `niveles_secundarios` = los pisos que la consumen. Vista: **`GRAFO.md §6`**,
y es el **primer filtro** del ruteo de `/metodo` (una pregunta de directorio no se contesta con una
herramienta de piso). Ortogonal al objeto (§5, QUÉ toca) y al módulo (§3, CUÁNDO del engagement).

## El método operable

- [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md) — "Diagnóstico Digital": AS-IS de sistemas y
  procesos + gap analysis, 3 beats, consultant-first.
- [`M3-ESPINAZO.md`](M3-ESPINAZO.md) — mejora continua idea→producción (PDCA / ISO 9001 cl.10),
  6 etapas.
- [`PROCESS-AS-DATA.md`](PROCESS-AS-DATA.md) — el patrón plantilla(IP)/instancia(cliente) que
  vuelve el engagement dato estructurado.
- [`SERVICE-DESIGN.md`](SERVICE-DESIGN.md) — el diseño de **servicio** del método (TiSDD): mapa de
  actores, persona del sponsor/consultor, journey maps, service blueprint y la spec de pantalla de la
  **Vista Apuesta** (§8). Destilado de la campaña `service-design` al cerrar BL-07; los `ref:` de
  `proceso/**` (§8/§9) apuntan aquí. (Las columnas *Nodo* de §6/§9.5 son pre-CK-18 — ver `../arquitectura/NODOS.md`.)
- [`proceso/`](proceso) — el proceso-como-dato mismo (módulos→etapas→pasos, front-matter MD):
  `m1/` levantamiento · `m2/` mantenimiento · `m3/` espinazo. Poblado: m1/b1 (6 pasos) + m3/e0.
  Resto = esqueleto (BL-05). Fixture ficticia en `proceso/_sample/inmobiliaria-vertice.yaml`.

## Conocimiento por nicho

`nichos/` — el patrón "conocimiento por industria": `inmobiliario.yaml` (6 unidades, seed
anonimizado — categorías de rubro derivadas de un deck real pero SIN datos del cliente) +
`nicho.schema.yaml` (el contrato de forma). Incluye `N-IMM-06`, el mapeo explícito "ISO 9001 en
desarrollo inmobiliario" — ejemplo vivo de cómo el pilar ISO se especializa por vertical.
