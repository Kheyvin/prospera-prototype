# 01 · Visión y doctrina — POR QUÉ existe este mockup

> Parte del dossier de la historia `cockpit/twin-territorio-mapa-zoomable`. Índice: [`README.md`](prtProspera/prototype-prospera/references/cockpit/docs/product/stories/cockpit/twin-territorio-mapa-zoomable/dossier/README.md).
> Fuentes: LEDGER CK-21 · CK-29 · VISION.md · memoria `vision-unificada-guardian`. Nada aquí es nuevo —
> es la síntesis para que una sesión fría arranque sin re-derivar.

## La tesis (CK-21 → CK-29)

**Organization as Code → Organization Twin:** la organización entera (procesos/roles/objetivos/
personas-puestos, 21 entidades) como dato versionado en git. Twin = estado deseado (N6) × estado
real (N16) × brecha continua (N13, Cockpit).

**CK-29 la amplía a cerebro (2026-07-24, cruda del operador):** el twin es **un cerebro que COMPILA
trabajo** — una sola doctrina a tres escalas:

1. **Estructura** — las 21 entidades del `objeto.schema.yaml` v2 (13 del twin + las 7 del gobierno del directorio, D-24…D-29 + el archivo `documento`, D-38).
2. **Conocimiento** — know-how + data histórica (gateado a F3, files-first, pero CONECTADO desde el
   día uno: los arneses nacen con punteros a dónde buscar).
3. **Pulso** — el dato de operación real (lakehouse N16).

**El arnés es la vista GENERADA del twin para un puesto** — se compila (Arnesia N15), se entrega
(Colab Studio N17), JAMÁS se edita a mano, se recompila cuando el twin cambia. **Fin-estado del
trabajo:** el colaborador no ejecuta — **orquesta** agentes: dirige, mide eficiencia, mejora su
propio arnés, propone proyectos. **Cockpit = la cabina del cerebro.**

Cruda verbatim del operador (LEDGER:929): *"…cada colaborador en su día a día realmente no se
dedique a hacer el trabajo él mismo… su labor diaria sea la de orquestar el trabajo, midiendo la
eficiencia, modificando sus propios arneses, poniendo proyectos…"*

## Qué demuestra el mockup (y qué NO es)

- **ES** la vista espacial de esa tesis: el "producto completo" (decisión 10) — territorio + módulos
  + corrida + viaje de las 21 entidades — en UN HTML autocontenido con datos canned.
- **NO ES** la app real: no wirea Go/Next, los scores del triage son canned, no hay auth. Es el
  contrato visual a ratificar ANTES de construir (la construcción real = refinamiento de esta
  historia; ver `05-construccion-real.md`).

## El diferenciador que el mockup debe hacer visible

1. **Hilo de oro MEDIDO** — objetivos directorio → KR → KPI → proceso/rol, como geografía (edges
   verticales), no como tabla. Semáforo derivado al leer (gris = sin dato, nunca rojo por ausencia).
2. **Loop brecha → proyecto → KPI movido** — con veredicto observado (`movió/parcial/no-movió`).
   Ningún vendor DTO lo cierra in-tool.
3. **La escalera hasta el trabajo** — z0 mapa de valor → z2 procedimiento → z3 instrucción →
   **piso = arnés compilado** (CK-29). Debajo de la última tarea no hay más twin: hay trabajo.
4. **Triage visible** — cada actividad/tarea con veredicto M36 (dos scores derivados del verbo M37 +
   inputs), la cadena triage → funil de ideas (M44) → proyecto → recompilar arnés.

## Doctrinas que gobiernan CUALQUIER cambio al mockup

- **As-code:** SSoT → vista generada → gate. El mockup mismo respeta esto conceptualmente: todo lo
  que muestra existe (o existirá) como dato del schema; nada se inventa visual-only sin declarar de
  qué entidad/campo cae.
- **Guardián (memoria `vision-unificada-guardian`):** todo pedido se contrasta contra CK-29; si algo
  se desvía, se avisa ANTES de aplicar. El operador firma la última palabra.
- **Frontera persona (CK-24):** el twin mide roles/procesos/áreas; persona = ocupante. Cero métrica
  por persona nombrada (RTLX agregado por rol; uso de arnés agregado por rol).
- **Provenance (M23):** todo dato AS-IS con `fuente`+`conf`; incertidumbre siempre visible (conf al
  lado del score, banda del KPI, frescura vencida ⌛).
- **3 semáforos que NUNCA se fusionan** (M1-LEVANTAMIENTO): digitalización · confianza · madurez —
  en el mockup son lentes color-by de radio (uno a la vez), jamás un color combinado.
- **es-419 sin voseo** (`[[cockpit-stack]]`) — microcopy en tuteo neutro (barrido v8.2, grep = 0).
- **PRENTER** (CK-27): dark-first, teal único acento, tipografía display/body/mono del set. El
  mockup es vanilla pero respeta los tokens; la app real se construye contra el banco `ui/components/ds/`.

## Anclaje metodológico (cada capa ← una M-card; no inventamos vistas)

| Elemento del mockup | Respaldo |
|---|---|
| Mapa de valor 5 bandas | ISO 9001 enfoque a procesos × cadena Porter × strategy map (M30) |
| Escalera z0→z3 | APQC PCF L1-L5 (M12) × pirámide documental ISO 10013 (M38) |
| Capas O2-O7 | los estratos del objeto (ArchiMate M13; O-codes del schema) |
| Hilo de oro | M06 Impact Mapping · M21 OKR · M26 Hoshin · M15 COBIT |
| z2 caracterizado | ISO 9001 4.4.1 (C1) + SIPOC como geografía (absorción del SOMA de 11 capas) |
| z3 instrucción | ISO 10013 nivel 3 · tareas D-17 · dos scores M36 con inputs · RACI M25 · RTLX M39 |
| Triage | ECRS M35 → scores M36 (derivación as-code `triage.yaml` D-18) → verbo M37 |
| Mejora (funil) | PDCA/DMAIC/MASP (M16/M42/M43) · ideas M44 · WSJF M28 |
| Cambios | ISO gestión de cambios + git invisible (dev→UAT→prod) + SC-14 recompilación |
| Corrida what-if | escenario-objeto (rama+diff+gate), decisión 8 — jamás toggle |

## Los repos (aclaración CK-29 — no confundir)

Cada app del ecosistema vive en SU repo (`harness-studio` · `dev-studio` · `consultio` · Colab
Studio por crear). En cockpit viven SOLO las historias. El mockup vive en este repo porque es la
vista de N13 (Cockpit), no porque cockpit hospede las demás apps.
