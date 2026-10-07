> ⚠️ **ARCHIVADO (CK-19, 2026-07-09) — ya no es SSoT.** El pendiente vive en historias del arnés
> (`docs/product/stories/`); correspondencia en [`docs/product/MAPEO.md`](MAPEO.md).
> Se conserva como registro histórico congelado.

# System Backlog — Cockpit (vista humana de [`backlog.yaml`](backlog.yaml))

> SSoT = `backlog.yaml`. Esta vista se edita en el MISMO evento — si divergen, manda el YAML.
> Prioridades las firma el operador. Columnas re-organizadas en **CK-18** (rediseño de fondo:
> Fábrica + Organización instalada).

## Panorama

| Columna                              | Pendiente       | En curso | Lo más urgente                                                |
| ------------------------------------ | --------------- | -------- | ------------------------------------------------------------- |
| **Sistema (transversal)**            | 6               | —        | BL-04 design system · BL-05 poblar método                     |
| **Cockpit (N13)**                    | 6               | —        | BL-12 niveles de acceso (alta) · BL-24 Gestión de Cambios     |
| **Consultio (N14)**                  | 3               | —        | BL-15 clon de DevStudio (arranca cuando DevStudio esté listo) |
| **Repositorio Oficial (N6)**         | 3               | —        | BL-21 Forgejo self-hosted · BL-29 Depósito/DPA                |
| **Data Lakehouse (N16)**             | 2               | —        | BL-22 dlt + DuckLake                                          |
| **Colab Studio (N17)**               | 1               | —        | BL-23 app del trabajador                                      |
| **Plano del Fabricante (N2/N3/N15)** | 2 (+1 derogado) | —        | BL-25 distribución/licencias · BL-26 pipeline de arneses      |

## Sistema (transversal)

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-01 | Persona/puesto como entidad de primera clase | alta | **hecho** (CK-12 · CAP-07) |
| BL-02 | Reconciliar objeto.schema (9) ↔ negocio.schema (4) | alta | **hecho** (CK-13 · CAP-08) |
| BL-03 | Terminar arquitectura / diagrama de despliegue | alta | **hecho** (CK-14 · rediseñado CK-18) |
| BL-04 | Design system PRENTER + atomic design + banco DRY | alta | **fundación hecha** (CK-27 · F1 · tokens+átomos+`/design-system`; migración organismos/moléculas/tests DOM = diferido) |
| BL-05 | Poblar método: M1 beats 2-3 · M3 etapas 1-5 | media | pendiente |
| BL-06 | negocio.schema: decidir SSoT (plugin vs repo) | media | pendiente |
| BL-07 | Destilar research (sistema vs campaña) | media | **hecho** (cierre de etapa) |
| BL-08 | Render de arquitectura.yaml | baja | **hecho** (CK-15) |
| BL-09 | Borrar carpetas campaign-* originales | baja | pendiente |
| BL-10 | Comprador/pricing/éxito-12-meses (+ licencia Arnesia, CK-18) | baja | pendiente |
| BL-19 | Voltear negocio.yaml a proyección GENERADA del objeto | media | pendiente |

## Cockpit (N13) — Visualización + Gestión de Cambios + niveles

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-12 | Auth + niveles de acceso reales (4 niveles, policy-as-data) | **alta** | pendiente |
| BL-24 | Módulo Gestión de Cambios (ISO §7.5/§6.3) | media | pendiente |
| BL-28 | Cruce estructura × operación (esquema de indicadores) | media | pendiente |
| BL-20 | Deuda Go/Next: UI → Vite SPA | media | pendiente |
| BL-11 | Rol Área real (hoy placeholder) | media | pendiente |
| BL-14 | Capability "preparación para auditoría" (gatillo: demanda real) | tbd | pendiente |

## Consultio — App del Consultor (N14) — clon de DevStudio, sin construir

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-15 | Construir Consultio = clon de DevStudio + adaptación propia | alta | pendiente |
| BL-16 | Operar el método + construir el mapa completo (← BL-15) | alta | pendiente |
| BL-17 | Publicación al Repositorio Oficial — "deploy de procesos" (← BL-15) | alta | pendiente |

## Repositorio Oficial (N6) — git self-hosted confidencial, sin construir

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-21 | Forgejo self-hosted + BD vs archivos (git/archivos = SSoT) | media | pendiente |
| BL-27 | Knowledge Database (know-how, files-first) | tbd | pendiente |
| BL-29 | Depósito de fuentes (landing zone N12) + retención/destrucción DPA | media | pendiente |

## Data Lakehouse (N16) — dlt + DuckLake, sin construir

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-22 | Construir el lakehouse (dlt + DuckLake, DuckDB embebido) | media | pendiente |
| BL-18 | Conectores de ingesta por sistema (ex-conexión delivery, CK-08 derogado) | tbd | pendiente |

## Colab Studio (N17) — app del trabajador, sin construir

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-23 | Colab Studio — arneses por puesto para el trabajador operativo | media | pendiente |

## Plano del Fabricante (N2/N3/N15) — lo que mantenemos y distribuimos

| ID | Ítem | Prioridad | Estado |
|---|---|---|---|
| BL-25 | Distribución + telemetría + licencias (go-tuf v2 · Tauri · Ed25519 · OTLP) | media | pendiente |
| BL-26 | Arnesia: pipeline arnés-por-rol desde el objeto normalizado (anti-drift) | media | pendiente |
| BL-13 | ~~Motor de Discovery (N1) como servicio server-side~~ | — | **derogado** (CK-18 → arneses) |
