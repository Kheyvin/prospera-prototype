# 06 · Pendientes abiertos + ideas mencionadas y NO aterrizadas

> Parte del dossier. Minado del transcript de la conversación "Analizar visión y metodología del
> cockpit" (2026-07-24) + estado v8.2. Esto es lo que una sesión nueva NO encontraría en ningún
> otro doc. Nada de aquí está ratificado como decisión — son insumos.

## ✓ Deuda abierta #1 — CERRADA en la sesión 2026-07-25

07:26 de la sesión 2026-07-24, verbatim: *"Tengo muchos comentarios… Quiero terminar la próxima
sesión con el mockup de la visión completa de cómo quiero que quede el cockpit, de inicio a fin."*
Esos comentarios no se habían dado en v7-v8.2. **En la sesión 2026-07-25 sí se dieron, en vivo**
(el operador entró al mockup con su propio Chrome vía claude-in-chrome): encoding roto al servir
local, 2 bugs reales de interacción (ver `03-decisiones-y-porques.md` decisiones 19-20), y 3
iteraciones de la notación por tipo hasta la v3 con íconos dibujados (decisión 18). Detalle completo
del código: `02-mockup-guia-completa.md § 0.1`.

## ✓ Resuelto en la sesión 2026-07-25 (cont.) — decisiones 22-26

- **Artifact republicado** — el link (`claude.ai/code/artifact/20907d03-…`) ya muestra la versión
  actual (**v11**: notación inline "dentro" + materiales por capa + 3 tipos nuevos + aire entre
  bandas). Republicado varias veces; **Ctrl+Shift+R** para bustear caché.
- **Los 3 tipos "sin badge propio" → RESUELTOS** (decisión 23): empresa (edificio), persona (personita
  sólida), capability (hexágono) ya tienen ícono + superficie. **Cobertura 12/12.**
- **Notación ratificada** — el operador iteró en vivo (materiales "me gusta V2" explícito · notación
  inline DENTRO · 3 tipos nuevos · aire entre bandas) y construyó SOBRE ella. Se trata como aceptada.

## ✓ Cerrado en la sesión 2026-07-29 (v18 · la agenda del directorio)

La idea que este doc listaba como "bandeja de decisiones" dejó de ser idea: es el **movimiento 4** del
nivel 1, con decisiones que llegan **por umbral de facultades** (no por configuración del modelo), los
acuerdos de la sesión anterior y el acta generada. Con ella entraron resultado, caja, presupuesto,
riesgos e inversiones. Método (M55-M59), esquema (D-24…D-30) y contrato de build (`08`) cerrados.

**Lo que la v18 ABRIÓ y sigue siendo insumo, no decisión:**
- **Promoción de M52** `horizonte → ancla` — decisión de dogma, espera ficha CK + firma.
- **Exposición cambiaria** (H10) · **aterrizaje proyectado** por meta (H7) · **cumplimiento como
  superficie propia** (H11) · **personas a nivel directorio** (H12) — hallazgos abiertos del tablero.
- **Conectores reales** (contable · banca · control de obra) — hoy todo el nivel 1 es dato canned.

## ➡ La deuda MEDIDA vive en `07-auditoria-hallazgos.md` (2026-07-25 · 2026-07-29)

Este doc (06) sigue siendo la **bandeja de ideas e insumos no ratificados**. La deuda **verificable**
(hallazgos con `file:line`, medidos contra el mockup vivo + schema + método) se movió al tablero
[`07-auditoria-hallazgos.md`](07-auditoria-hallazgos.md). Dos ítems de abajo ya están allí con
detalle completo y no se re-litigan acá: el band de capability (→ nota en A-follow-ups) y
`CLAUDE.md` "9 entidades" (→ **D2**, junto con **D1**: M32 dice lo mismo).

## ⚠ Pendiente abierto

- **Commit** — decisiones 22-26 horneadas en `index.html`; el **v10 (materiales, decisión 22) ya está
  commiteado** (`38d24a2`). Las **decisiones 23-26 + toda la doc de esta auditoría se commitean al
  cierre** de esta sesión. [actualizar al commitear]
- **Band de mapa para capability** (capa Strategy) — hoy es ícono + chip teal, sin nodo propio. Darle un
  band/lente = superficie nueva grande (el **5º material Strategy queda reservado**). Follow-up si se pide.
- **Deuda de fondo: center-anchoring de los nodos** (decisión 26) — el aire entre bandas mitiga pero no
  elimina la raíz; cajas MUY altas podrían volver a rozar un label. Fix robusto = top-anchorear los nodos
  (tocaría el ruteo de edges del hilo de oro). No hecho.
- **QA visual no exhaustivo** de los íconos del funnel Mejora (idea/brecha/proyecto) y kpi (barras) en
  TODAS sus vistas (drawer, ficha) — verificados con crops, no exhaustivo.
- **`CLAUDE.md` / reglas dicen "9 entidades"** — contradice el schema v2 real (**12**, CK-26). Está fuera
  del scope de esta historia (es rule file, no doc de la historia); anotado para saldar aparte.

## Descartado / anotado

- **"Fase 3 — acento de borde por capa ArchiMate"** (Business/Application/Motivation/Strategy/Impl.): se
  había anotado como escalón futuro; **se materializó como los "materiales por capa" (decisión 22)** — ya
  no es futuro, es lo construido. La variante "color por familia" sigue descartada (PRENTER un solo acento).

## Ideas propuestas en conversación, sin destino escrito (evaluar en refinamiento)

1. **Bandeja de decisiones (inbox, no dashboard)** — propuesta como "segunda superficie" y
   probable **centro de gravedad del uso diario**: apuestas por sellar, cambios dev→UAT→prod por
   aprobar, KPIs que cruzaron umbral, brechas con business case listo. Hoy NO existe en mockup ni
   docs (grep = 0). Conecta con la tesis "el moat está en los WRITES".
2. **Home por nivel de acceso** — "el hilo de oro ES la navegación, no una vista más": el sponsor
   toca poco y con peso (momentos rituales, casi-reportería); analista de calidad/jefaturas viven
   adentro a diario. Los edges v6 materializan el hilo; el home-por-rol NO. Conecta con
   `auth-niveles-acceso-policy-as-data`.
3. **Identidad de producto: "no Grafana, no VS Code — es ArgoCD / torre de control"** — analogía
   que quedó solo en conversación; útil para pitch y docs de visión.
4. **Territorio propio para nodos hoja** — ofrecimiento abierto sin respuesta del operador: hoy
   persona/sistema/KPI son fichas (nodos hoja, no contenedores — límite deliberado v5); si el
   operador quiere mini-mapa por rol, se itera.
5. **Las 8 familias doctrinales** — síntesis del dogma hecha en conversación (epistemología ·
   ontología-Palantir · autoridad · anti-especulación · anti-entropía · frontera ética · economía
   de contexto · dos planos) sin destino escrito. Candidata a `docs/metodo/` o VISION.
6. **Riesgo "doctrina por delante de sustancia"** — señalado con números: 12/~60 pasos del proceso
   poblados, 35/45 M-cards sin operacionalizar. El antídoto nombrado: poblar (R1) y **compilar el
   primer arnés REAL desde la SSoT** (R4) — donde la doctrina se vuelve producto.

## Tensión de fondo a resolver en el refinamiento

**Reportería ↔ volante.** Lectura honesta pedida por el operador: lo construido es el extremo
reportería; *"el riesgo real es quedarse cómodo ahí: cada sprint de visualización se siente
progreso y ninguno acerca al diferenciador. El moat entero está en los WRITES: sellar, aprobar,
promover, ciclo de proyecto."* El mockup ya insinúa los writes (acciones kinéticas → cola de
Cambios); la app real debe priorizarlos, no dejarlos de adorno.

## Menores sin trackear (verificar en v8.2 antes de construir)

- **z1 con mucho espacio muerto abajo** — hallazgo A#15 de la auditoría de esa sesión; los otros
  dos menores de la lista se arreglaron, este quedó sin verificar.
- Artifact temporal de debug `a6b775ae-…` en la galería del operador — borrable.
- z1 solo accesible vía piel Organigrama — ¿el Mapa de Valor necesita drill intermedio propio o
  basta chevron→ficha→lienzo? (pendiente conocido del HANDOFF).

## Deuda de programación ya fichada (detalle en `05-construccion-real.md`)

Wiring Go de `tareas[]` (D-17) · motor de triage que ejecute `triage.yaml` (D-18) · shell
territorio en `cockpit-ui` (migración lente-por-lente desde las 4 tabs).

## Guiones de demo implícitos (no perderlos)

- **Hilo**: click "Caja sana en todos los proyectos" → baja hasta Nubecont/Banca pasando por
  Cobranza y el arnés v1⚠ del Jefe de Cobranza.
- **Triage→fábrica**: p-cob:3 (agente 72, RTLX 71) → "candidato a skill" → idea i-agente →
  funil → (futuro) recompilar arnés.
- **Loop cerrado**: pm-cie → delta observado → veredicto "movió" → h-cont v2 recompilado.
- **Gap agéntico**: capa Trabajo ON → grises por todos lados → "4/40 puestos".
- **Corrida**: idmenu → what-if → diff → impactos → gate → cola de Cambios.
