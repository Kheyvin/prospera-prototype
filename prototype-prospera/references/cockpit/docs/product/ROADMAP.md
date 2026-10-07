# ROADMAP — hacia el Organization Twin vendible

> **Vista humana curada (CK-22, 2026-07-16).** SSoT = `releases/*.yaml` + `story.yaml` de cada
> historia. Estados y prioridades los firma el operador. Norte: VISION.md §Organization as Code →
> Organization Twin (CK-21) · TO-BE completo: `docs/research/organization-as-code/07-capability-list-tobe.md`.

## Estado (generado — no editar a mano)

Regenerado por `python3 docs/product/gen_roadmap.py` (gate en `.githooks/pre-commit`, corre solo
cuando algún `story.yaml`/`release` cambia). Fuente única de verdad de estado/nodo/prioridad — la
prosa de abajo (mapa, diagrama F1, "por qué aquí", secuencia) es juicio del operador, no se genera.

<!-- GEN:estado -->
| Release | Fase | Módulo | Historia | Node | Prioridad | State |
|---|---|---|---|---|---|---|
| F0 | — | sistema | `persona-puesto-primera-clase` | transversal | alta | done |
| F0 | — | sistema | `reconciliar-objeto-schema-9-entidades` | transversal | alta | done |
| F0 | — | sistema | `terminar-arquitectura-despliegue` | transversal | alta | done |
| F0 | — | sistema | `destilar-research-sistema-vs-campana` | transversal | media | done |
| F0 | — | sistema | `render-arquitectura-yaml` | transversal | baja | done |
| F1 | F1.0-terreno | sistema | `design-system-atomic-storybook` | N13 | alta | developing |
| F1 | F1.0-terreno | sistema | `arquitectura-refichado-ck21` | transversal | alta | done |
| F1 | F1.0-terreno | sistema | `schema-v2-hilo-de-oro-kinetica` | transversal | alta | done |
| F1 | F1.0-terreno | sistema | `negocio-schema-ssot-plugin-vs-repo` | transversal | media | idea |
| F1 | F1.1-twin-pintado | sistema | `organizacion-ficticia-golden-fixture` | transversal | alta | done |
| F1 | F1.1-twin-pintado | cockpit | `twin-territorio-mapa-zoomable` | N13 | alta | idea |
| F1 | F1.1-twin-pintado | cockpit | `cruce-estructura-operacion-indicadores` | N13 | alta | refining |
| F1 | F1.1-twin-pintado | cockpit | `brecha-proyecto-ciclo-vida` | N13 | alta | idea |
| F1 | F1.2-metodo-operable | sistema | `poblar-metodo-m1-m3` | N2 | alta | idea |
| F1 | F1.2-metodo-operable | consultio | `metodo-como-arnes-v0` | N14 | alta | idea |
| F1 | F1.2-metodo-operable | consultio | `operar-metodo-construir-mapa-completo` | N14 | alta | idea |
| F1 | F1.2-metodo-operable | repositorio-oficial | `deposito-fuentes-retencion-dpa` | N12 | media | idea |
| F1 | F1.3-organizacion-viva | repositorio-oficial | `forgejo-self-hosted-bd-vs-archivos` | N6 | alta | idea |
| F1 | F1.3-organizacion-viva | cockpit | `hosteado-single-tenant` | N13 | alta | idea |
| F1 | F1.3-organizacion-viva | cockpit | `modulo-gestion-cambios-iso` | N13 | alta | idea |
| F1 | F1.3-organizacion-viva | consultio | `publicacion-repo-oficial-deploy-procesos` | N14 | alta | idea |
| F1 | F1.3-organizacion-viva | cockpit | `auth-niveles-acceso-policy-as-data` | N13 | alta | idea |
| F1 | F1.4-twin-mide-real | cockpit | `captura-manual-kpis` | N13 | alta | idea |
| F1 | F1.4-twin-mide-real | lakehouse | `construir-lakehouse-dlt-ducklake` | N16 | media | idea |
| F1 | F1.x-negocio-paralelo | sistema | `comprador-pricing-exito-12-meses` | transversal | alta | idea |
| F2 | — | fabricante | `distribucion-telemetria-licencias-n3` | N3 | media | idea |
| F2 | — | fabricante | `portal-cloud-licencias` | N3 | media | idea |
| F2 | — | cockpit | `deuda-go-next-n13-vite-spa` | N13 | media | idea |
| F2 | — | cockpit | `rol-area-real` | N13 | media | idea |
| F2 | — | sistema | `negocio-yaml-proyeccion-generada` | transversal | media | idea |
| F2 | — | lakehouse | `conectores-ingesta-por-sistema` | N18 | tbd | idea |
| F3 | — | consultio | `construir-consultio-clon-devstudio` | N14 | media | idea |
| F3 | — | colab-studio | `colab-studio-app-trabajador` | N17 | media | idea |
| F3 | — | fabricante | `arnesia-pipeline-arnes-por-rol` | N15 | media | idea |
| F3 | — | cockpit | `mcp-server-twin` | N13 | baja | idea |
| F3 | — | cockpit | `crowdsourcing-frescura` | N13 | baja | idea |
| F3 | — | repositorio-oficial | `knowledge-database-files-first` | N6 | tbd | idea |
| F3 | — | cockpit | `capability-preparacion-auditoria` | N13 | tbd | idea |
| F3 | — | sistema | `borrar-carpetas-campaign-originales` | transversal | baja | idea |
<!-- /GEN:estado -->

## El mapa en una línea

**F0 done** (fundación standalone) → **F1 en-curso** (Terreno + MVP Twin vendible, 17 historias en
5 fases + carril de negocio, **secuencia twin-first CK-23**: primero el twin lleno y pintado con
organización ficticia, después el proceso que lo llena) → **F2** (Comercial: Portal + deuda técnica
+ conectores) → **F3** (Edge completo + escala) → horizontes gateados (simulación · multitenant).

## F1 · Terreno + MVP Twin vendible — el camino crítico (twin-first, CK-23)

```
F1.0 TERRENO             F1.1 TWIN PINTADO (twin-first)
─────────────            ──────────────────────────────
arquitectura-refichado → schema-v2 → golden-fixture → cruce-indicadores → brecha-proyecto
        (LA PRIMERA)                 (org ficticia      (hilo de oro,       (el diferenciador)
                                      100% llena)       KPIs del fixture)
                                          │
                                          ★ HITO CK-23: twin completo demo-able
                                          │
        F1.2 MÉTODO OPERABLE              ├─→ poblar-metodo-m1-m3 → metodo-como-arnes-v0
                                          │       → operar-metodo (contrato = el fixture)
                                          │       · deposito-fuentes (liviano)
        F1.3 ORGANIZACIÓN VIVA            ├─→ forgejo ─┬─→ hosteado-single-tenant
                                          │            ├─→ gestion-cambios-iso ←─ publicacion-deploy-procesos
                                          │            └─→ auth-niveles
        F1.4 TWIN MIDE REAL               └─→ construir-lakehouse (reemplaza los KPIs hardcodeados)
PARALELO (negocio): comprador-pricing-exito-12-meses
```

| Fase | Historia | Nodo | Prio | Por qué aquí |
|---|---|---|---|---|
| **F1.0** | `sistema/arquitectura-refichado-ck21` | transversal | alta | **Primera del roadmap (operador, CK-22):** el terreno — bajar CK-21 fino a NODOS/despliegue/arquitectura.yaml antes de anclar lo funcional |
| F1.0 | `sistema/schema-v2-hilo-de-oro-kinetica` | transversal | alta | OKR/KPI/Proyecto + capa kinética — TODO lo funcional consume este schema. **= consolidar las dimensiones/plantillas del twin (CK-23)** |
| F1.0 | `sistema/negocio-schema-ssot-plugin-vs-repo` | transversal | media | Reconciliación de SSoT del schema (BL-06) — cierra junto al v2 |
| **F1.1** | `sistema/organizacion-ficticia-golden-fixture` | transversal | alta | **NUEVA CK-23:** organización ficticia 100% llena contra el v2 — fixture de desarrollo + plantillas-por-ejemplo + demo comercial + contrato de salida de Consultio |
| F1.1 | `cockpit/cruce-estructura-operacion-indicadores` | N13 | alta | **El hilo de oro medido** — absorbe el delta CK-21 (KPI→OKR→objetivo, semáforo, drill-down). Se construye contra el fixture, sin esperar lakehouse |
| F1.1 | `cockpit/brecha-proyecto-ciclo-vida` | N13 | alta | **El diferenciador:** brechas con costo/ROI → proyecto → KPI movido, dentro de Cockpit. Cierra el hito: twin demo-able |
| **F1.2** | `sistema/poblar-metodo-m1-m3` | N2 | alta | El contenido del método ES el insumo de los arneses (hoy parcial: m1/b1 + m3/e0) |
| F1.2 | `consultio/metodo-como-arnes-v0` | N14 | alta | La apuesta principal (CK-21/D7): arneses sobre Claude Code pelado, sin app shell |
| F1.2 | `consultio/operar-metodo-construir-mapa-completo` | N14 | alta | El engagement completo operado con el v0 — **su contrato de aceptación es el golden fixture (CK-23)** |
| F1.2 | `repositorio-oficial/deposito-fuentes-retencion-dpa` | N12 | media | v0 liviano (carpeta cifrada + política de retención/destrucción) — lo exige el primer engagement |
| **F1.3** | `repositorio-oficial/forgejo-self-hosted-bd-vs-archivos` | N6 | alta | La instancia git (idéntica hosteada o self-hosted) con entornos dev→UAT→prod |
| F1.3 | `cockpit/hosteado-single-tenant` | N13 | alta | El default comercial CK-21/D3 (incluye DPA + reescritura fina chequeo 2) |
| F1.3 | `cockpit/modulo-gestion-cambios-iso` | N13 | alta | Subió al MVP (CK-21/D8): es el gate UAT→prod que evita mapas basura |
| F1.3 | `consultio/publicacion-repo-oficial-deploy-procesos` | N14 | alta | El "deploy de procesos" (dep re-apuntada a metodo-v0 + forgejo) |
| F1.3 | `cockpit/auth-niveles-acceso-policy-as-data` | N13 | alta | Gate multi-usuario; policy-as-data derivada de N6 |
| **F1.4** | `lakehouse/construir-lakehouse-dlt-ducklake` | N16 | media | Sale del camino crítico del twin (CK-23): los KPIs del fixture lo mockean; vuelve aquí para reemplazarlos con Excel + 1 conector real del primer cliente |
| F1.x | `sistema/comprador-pricing-exito-12-meses` | transversal | alta | Carril de negocio paralelo — sin pricing no hay venta del MVP |

**Exit F1:** demo del loop completo contra organización real (dogfood prenter o cliente 1) — ver
`releases/F1-terreno-mvp-twin.yaml::exit_criteria`.

## F2 · Comercial — negocio repetible

`distribucion-telemetria-licencias-n3` (canal técnico) → `portal-cloud-licencias` (el producto de
entrada, dep del canal) · `deuda-go-next-n13-vite-spa` + `design-system-atomic-storybook` (**pagar
la deuda de UI ANTES de crecer más superficie** — deuda aceptada conscientemente en F1, precedente
CK-12) · `rol-area-real` · `negocio-yaml-proyeccion-generada` (gatillo BL-19: objeto poblado con
objetivos/brechas — ocurre en F1 con el cliente real) · `conectores-ingesta-por-sistema` (catálogo
por arquetipo).

## F3 · Edge completo + escala

`construir-consultio-clon-devstudio` (el shell — el v0 ya operó en F1; prio baja a media) ·
`colab-studio-app-trabajador` · `arnesia-pipeline-arnes-por-rol` (en F1/F2 los arneses se fabrican
a mano en Arnesia) · `mcp-server-twin` · `crowdsourcing-frescura` · `knowledge-database-files-first`
(D5, por demanda) · `capability-preparacion-auditoria` (CK-10, por demanda) ·
`borrar-carpetas-campaign-originales` (housekeeping).

## Horizontes gateados (post-F3, nunca antes de demanda)

Simulación del TO-BE (what-if por branch → BPSim/DEMO → agentes LLM corriendo los arneses,
CK-21/D9) · multitenant real (>10-20 clientes, CK-21/D3).

## Decisiones de secuencia tomadas en CK-22 (revisables por el operador)

1. **Deuda de UI se acepta en F1, se paga arrancando F2** — el MVP gana velocidad construyendo
   hilo de oro + brecha→proyecto sobre el stack Next existente; la migración Vite + design system
   se hace ANTES de crecer más superficie en F2. (Alternativa descartada: migrar primero =
   semanas sin valor de cliente.)
2. **`construir-consultio-clon-devstudio` baja de alta a media y se va a F3** — el v0 de arneses
   (F1.1) es el camino crítico; el shell es experiencia, no capacidad.
3. **`portal-cloud-licencias` y `distribucion-telemetria-licencias-n3` NO se fusionan** — son dos
   capas del mismo nodo N3 (producto vs canal técnico); el portal depende del canal. Ambas F2.
4. **`cruce-estructura-operacion-indicadores` absorbe el "motor de indicadores"** (CK-21) — el
   delta KPI→OKR→objetivo se pliega en su refinamiento, no como historia espejo (anti-duplicación).
5. **`deposito-fuentes-retencion-dpa` se queda en F1 como v0 liviano** — carpeta + política, sin
   infra; lo demanda el primer engagement real.

## Decisiones de secuencia tomadas en CK-23 — twin-first (revisables por el operador)

6. **Twin-first: el twin lleno y pintado ANTES que el proceso de llenado.** F1 se re-secuencia:
   la vieja F1.3 (vistas del twin) adelanta a método (ex F1.1) y organización viva (ex F1.2).
   Nueva historia `organizacion-ficticia-golden-fixture`: shell hermano 100% lleno contra el
   schema v2, con provenance realista simulando la salida de M1. Hito intermedio: **twin completo
   demo-able con organización ficticia** al cierre de F1.1. (Riesgo aceptado consciente: schema +
   fixture sin feedback del proceso de captura pueden requerir ajuste cuando Consultio llene datos
   reales; mitigación: el fixture simula la salida del método, provenance incluida.)
7. **El lakehouse sale del camino crítico del twin** (alta→media, fase propia F1.4): los valores
   "reales" de KPI vienen hardcodeados del fixture; `cruce-indicadores` cambia su dep
   lakehouse→fixture. El lakehouse vuelve al final de F1 para reemplazar los valores mockeados
   con datos reales del primer cliente — la vista no cambia, cambia la fuente.
8. **El golden fixture es el contrato de salida de Consultio**: `operar-metodo` gana la dep — la
   corrida del método debe poder producir un objeto de la completitud del fixture. Definir el
   destino primero des-riesga la captura.
