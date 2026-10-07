# 00-research — OKR↔KPI, estándar LATAM/BR y proyectos de mejora (refinamiento 2026-07-17)

> Dos investigaciones web (subagentes, pedido del operador en RONDA 1): (A) doctrina OKR↔KPI según
> fuentes canónicas + estándar de gestión de desempeño en LATAM hispano y Brasil; (B) práctica
> corporativa LATAM/BR de proyectos de mejora. Condensado con fuentes; los veredictos de aquí
> gobiernan el diseño del `01-spec.md` v2.

## A · OKR ↔ KPI — doctrina canónica (verificada)

- **No compiten — se complementan.** Doerr/whatmatters.com (fuente primaria): *"OKRs are measures
  for change, KPIs are measures of health"*; *"OKRs don't replace KPIs"*. Felipe Castro (canon BR):
  GPS (OKR) vs tablero del auto (KPI = health metric: mientras esté en banda, no exige acción).
  Wodtke (*Radical Focus*): check-in semanal = OKR (lo que empujás) + health metrics (lo que
  protegés). Perdoo: *"OKRs build the machine, KPIs run the machine."*
  - whatmatters.com/okrs-explained/kpis-and-okrs · medium.com/@meetfelipe/okr-vs-kpis
- **Frontera permeable BIDIRECCIONAL:** KPI fuera de banda → se promueve a KR del ciclo para
  arreglarlo → al sanar decanta de vuelta a KPI monitoreado. El KR puede referenciar un KPI
  existente (misma serie de datos, distinto contrato: cambio con vencimiento vs salud permanente).
  - perdoo.com/resources/blog/how-okrs-turn-into-kpis
- **"No OKR individual" — CONFIRMADO (el porqué):** Spotify lo abandonó (~2013; blog primario HR
  2016: "proceso que no agregaba valor"); Rick Klau (autor del video canónico de Google) se
  retractó en 2017 ("Skip individual OKRs altogether"); HBR dic-2020 (Gothelf/Seiden): "Use OKRs
  to Set Goals for Teams, Not Individuals"; Bock: OKR "totally divorced from compensation".
  Razones: **sandbagging** (atado a bono → metas infladas hacia abajo), degeneración en lista de
  tareas, costo administrativo, conducta egoísta. Práctica moderna = OKR de equipo + **KR
  ownership individual** (rol accountable de un KR de equipo). "Twitter los abandonó" = sin fuente
  primaria, NO citable.
  - hrblog.spotify.com/2016/08/15 · hbr.org/2020/12 · en.wikipedia.org/wiki/Objectives_and_key_results

## B · Estándar de gestión de desempeño — Brasil y LATAM hispano

- **Brasil = GPD (Gerenciamento pelas Diretrizes, Falconi)** — hoshin adaptado por Vicente Falconi:
  metas anuales del directorio → **desdobramento** por nivel jerárquico ("meta sem valor e prazo
  não é meta") → giro PDCA → acople a **remuneración variable (PLR)**. Falconi = socio de 3 de
  cada 4 "Melhores e Maiores" (Ambev, Gerdau, Petrobras, Embraer). OKR convive en áreas
  digitales, NO lo desplaza — el corte: OKR no sirve para remuneración variable (sandbagging);
  GPD es fuerte exactamente ahí.
  - falconi.com · siteware.com.br/blog/gestao-estrategica/gerenciamento-pelas-diretrizes
- **LATAM hispano = BSC** sigue siendo el mapa reconocible (escuelas de negocio, literatura
  regional); Bain Management Tools: región conservadora en frameworks; Hoshin = nicho manufactura
  (automotriz MX); adopción OKR corporativa no-tech sin encuesta seria (stats circulantes =
  marketing de vendors).
- **★ Corrección de alcance (2026-07-29 · CK-33): «Brasil = GPD» aplica al sector PRIVADO.** En el
  **sector público brasileño** el BSC es el estándar de facto — mapas estratégicos institucionales
  exigidos en el poder judicial, órganos de control y ministerios. Un cliente estatal brasileño
  habla BSC, no GPD; el veredicto estructural (mismo grafo, distinta cadencia/acople) no cambia,
  cambia qué vocabulario se le muestra. Cableado en M30 ⇄ M41 (arista de arbitraje de mercado).
- **★ Hueco cerrado en la misma ficha: la vara de MADUREZ brasileña.** Faltaba **MEG/FNQ** (Modelo
  de Excelência da Gestão, linaje Baldrige, con premio PNQ) — el par brasileño de EFQM/ISO 9004, y
  el nombre que un directorio con historia FNQ ya usó para autoevaluarse. Entró como **M60**
  (gateada por demanda: se LEE su ciclo como evidencia, no se corre uno nuevo).
- **★ Hueco cerrado: cómo se CONSTRUYE el presupuesto.** **OBZ (Orçamento Base Zero)** — cultura de
  costos 3G/AmBev difundida en LATAM: presupuesto reconstruido cada ciclo, por paquete, con dueño
  nombrado. M57 guardaba el reparto ya armado; el *cómo* faltaba. Entró como **M61**.
- **Veredicto estructural:** GPD y OKR son EL MISMO grafo de cascada; difieren en **cadencia**
  (anual vs 90 días) y **acople a compensación** (permitido vs prohibido). Un solo modelo de
  datos cubre los 3 mercados; el modo es configuración, no entidades distintas.

## C · Proyectos de mejora — práctica corporativa LATAM/BR (2024-2026)

- **PDCA = paraguas universal**, con dialectos: Brasil habla **Falconi (MASP + GPD)** transversal
  (industria/servicios/gobierno — MASP = QC Story: 8 etapas mapeadas a PDCA, con retroceso si la
  verificación no bloquea); el formato corporativo formal con caso de negocio = **Lean Six
  Sigma/DMAIC** (NO declinó: mercado $6.8B 2024 → $13.25B 2032; ecosistema de belts BR muy
  activo); mejoras rápidas de piso = **eventos Kaizen** (Kaizen Institute activo MX/CL/CO/BR,
  premios nacionales 2025).
- **Ciclo de vida canónico** (síntesis funil de ideas + tollgates DMAIC + MASP): propuesta →
  triaje → evaluación → **aprobación = charter firmado por sponsor + validación FINANCIERA
  previa** → ejecución → verificación contra baseline (con retroceso posible) →
  **estandarización como estado propio** → **auditoría de beneficios ~12 meses** (finanzas valida
  hard savings) → cierre.
- **Caso de negocio — lo que la práctica exige:** KPI afectado + baseline + target + plazo ·
  alineación estratégica (a qué directriz/objetivo apunta) · tipo de beneficio
  (**hard-saving | soft-saving | cost-avoidance | aumento-ingresos**) · beneficio anualizado +
  inversión + ROI/payback · fórmula de cálculo documentada y auditable · **firma doble:
  sponsor (negocio) + finanzas** (pre y post).
  - lean6sigmahub.com (tollgates · hard vs soft) · six-sigma-material.com/Financial-Savings
- **Ideas del personal: entidad SEPARADA y enlazada.** Los programas de sugerencias no murieron —
  migraron de CCQ presencial (sobrevive en manufactura pesada: Gerdau, UBQ) a **plataformas de
  gestión de ideas** (AEVO = líder LATAM, 400+ empresas; Ambev corrió campañas de 450+ ideas en
  2 semanas). Patrón kaizen teian: funil masivo y barato (comité, feedback, reconocimiento al
  proponente) del que un subconjunto se PROMUEVE a proyecto con charter y recursos. El proyecto
  también nace SIN idea (de una brecha del twin — nuestro diferenciador).
  - aevo.com.br · blog.aevo.com.br/funil-de-ideias
- **ISO:** el paraguas de compliance del proyecto de mejora = ISO 9001 cl.10 (10.2 NC/acción
  correctiva · 10.3 mejora continua). **ISO 56002/56001 (innovación) = emergente con Brasil como
  hotspot mundial** (Grupo Boticário, Atento, PALAS primera certificada 56001) — horizonte, no
  el marco dominante del proyecto de mejora operacional hoy.

## Veredictos aplicados al schema v2 (mapa research → diseño)

1. KPI y KR = dos entidades con contrato distinto + transición bidireccional (`kr.kpi_ref` +
   acciones kinéticas `promover-kpi-a-kr` / `decantar-kr-a-kpi`).
2. OKR ancla a equipo/rol; persona = accountable de KR, jamás dueña de OKR propio (confirma M21 y
   CK-24 — el book tenía razón, ahora con fuentes primarias).
3. Separación estructural KR ↔ compensación: `acople_compensacion` solo válido en modo GPD
   (invariante); la remuneración variable ata a KPI/meta de proceso, nunca al score del KR en
   modo OKR.
4. Modo de cascada = configuración de empresa (`okr-trimestral | gpd-anual | mixto`), mismo grafo.
5. `proyecto_mejora` (renombrado — desambigua del `tipo: proyecto` de las unidades D-07): ciclo de
   vida de 9+3 estados con estandarización y auditoría de beneficios como estados propios;
   `metodologia: dmaic|masp|kaizen|pdca` = dialecto de render, un solo ciclo.
6. `idea` = entidad separada enlazada (funil barato → promoción); proponente reconocido
   (autoría ≠ medición, CK-24).
7. Catálogo del método: M-cards nuevas GPD · Lean Six Sigma/DMAIC · MASP · Gestión de ideas
   (kaizen teian/funil) · ISO 56002 (horizonte) + dimensión nueva `mejora-proyectos` →
   NOTACIONES.html se regenera (sintonía con lo aprobado, pedido del operador).
