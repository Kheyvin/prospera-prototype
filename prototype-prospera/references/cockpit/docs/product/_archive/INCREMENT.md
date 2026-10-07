> ⚠️ **ARCHIVADO (CK-19, 2026-07-09) — ya no es SSoT.** Las capabilities viven en
> `docs/product/capabilities/`; correspondencia en [`docs/product/MAPEO.md`](MAPEO.md).
> Se conserva como registro histórico congelado.

# Product Increment — capabilities funcionales de Cockpit (vista humana de [`increment.yaml`](increment.yaml))

> SSoT = `increment.yaml` (CAP-NN, as-code — cada capability referencia los componentes
> `estado: activo` de `sistema/arquitectura/arquitectura.yaml`). Esta vista se edita en el MISMO
> evento — si divergen, manda el YAML. Entra aquí solo lo que corre de verdad: un ítem del
> backlog llega acá al quedar `hecho` y verificado, en el mismo evento.

## Estado: verificado standalone 2026-07-06 (CK-10) — go build/vet/test + tsc/vitest + export estático

| ID | Capability | Qué hace | Dónde vive | Fichas |
|---|---|---|---|---|
| CAP-01 | **Runtime propio — binario `directorio`** | Servidor HTTP puerto 4100; sirve las APIs + la UI embebida (`go:embed`, export estático Next). Modos single-workspace y multi (registry `~/.cockpit/cockpit.yaml`). Solo lectura — sin auth, sin DB. | `go/cmd/directorio/` | CK-07, CK-08 |
| CAP-02 | **API portfolio** — `GET /api/portfolio` | Árbol Dueño→Empresa→Sistema; distingue sistemas navegables (instrumentados) vs gaps de digitalización (Odoo compartido/externo/terciarizado/propio sin instrumentar). Registry fresh por request. | `go/portfolio.go` | CK-02, CK-05 |
| CAP-03 | **API negocio** — `GET /api/negocio?empresa=` | Lee `empresa/negocio.yaml`, valida (warnings no fatales sobre enums/refs), sirve el diagnóstico: objetivos + áreas/procesos + brechas. Sin archivo → empty-state. | `go/negocio.go` | CK-05 |
| CAP-04 | **Vista de Negocio** (`/negocio`) | Objetivos del directorio (KR from→to) que tensan el Hilo de Oro sobre 4 sub-tabs: Mapa vivo (semáforo de digitalización) · Hilo de oro (cascada objetivo→procesos + huérfanos) · Brechas (caso de negocio + prioridad) · Personas (CAP-07); drawer de drill-down por proceso (procedencia/confianza); banner de warnings. | `ui/components/negocio/NegocioView.tsx` | CK-06 |
| CAP-05 | **Shell por rol + selector de empresa** | Sidebar con selector de Empresa y nav por rol — Directorio vivo; Área/Consultor placeholders "próximamente". | `ui/components/shell/` | CK-06 |
| CAP-06 | **Modelo de portfolio** (TS puro) | Funciones/tipos de navegación Empresa→Sistema, deep-link URL. 25 tests vitest. | `ui/lib/portfolio.ts` | CK-02 |
| CAP-07 | **Lente Personas** (Vista de Negocio) | Cuarta lente consumiendo la rebanada personas/roles de CAP-08: quién cumple cada rol (inverso por scan), vacantes delatadas, procesos que corre (match puesto↔rol.nombre); visible aun sin negocio.yaml (el pilar vive upstream). | `ui/components/negocio/PersonasTab.tsx` | CK-12, CK-13 |
| CAP-08 | **API objeto** — `GET /api/objeto?empresa=` | El objeto normalizado COMPLETO (9 entidades de objeto.schema, `empresa/<tipo>/` del shell · D-15), validado ENTERO al leer: refs del Hilo cruzan entidades, enums, key_results ≥ 1, RACI A == 1, ciclos. Warnings no fatales. Verificado contra el shell real de prenter (12 procesos con actividades/RACI, cero warnings). | `go/objeto.go` | CK-12, CK-13 |

## Lo que NO está construido (no confundir con lo de arriba)

Consultio (N14, ex App del Auditor) + Colab Studio (N17) · Repositorio Oficial (N6) + Data Lakehouse
(N16) · Gestión de Cambios ISO + niveles de acceso (N13) · Arnesia + distribución/licencias (N15/N3) ·
ingesta multi-fuente As-Is/To-Be · roles Área/Consultor reales · auth · preparación-auditoría ·
negocio.yaml como proyección GENERADA del objeto (BL-19, gatillo: objeto poblado con
objetivos/brechas). Todo eso vive en [`docs/product/_archive/backlog.yaml`](backlog.yaml). (N1 Motor de
Discovery quedó **derogado** en CK-18 — su razonamiento vive como arneses, no es pendiente.)
