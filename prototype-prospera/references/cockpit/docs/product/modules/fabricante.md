# fabricante — Plano del Fabricante — Arnesia + Repo Maestro + distribución/licencias

## Nodo(s)

- `N15` — Arnesia — fábrica de arneses. Plano **Fabricante**, servicio/exec-env,
  *existe (parcial)*. ★IP. Compila el objeto normalizado + método en arneses
  (skill=procedimiento, plugin=rol) por rol-en-proceso, anti-drift desde la fuente.
- `N2` — Repositorio Maestro (método + arneses + código). Plano **Fabricante**,
  artefacto/dato, *existe (parcial)*. ★IP. SSoT del método (m1·m2·m3), arneses
  plantilla y código de las apps; N15 compila desde aquí y N3 distribuye.
- `N3` — Distribución + telemetría + licencias. Plano **Fabricante**, servicio,
  *no-construido*. Canal de releases firmadas (TUF/Tauri), entitlements/licencias
  revocables y telemetría opt-in por tenant — la base del contrato de mantenimiento.

## Historias

| story-id | type | state | prioridad | node | provenance |
|---|---|---|---|---|---|
| arnesia-pipeline-arnes-por-rol | service-story | idea | media | N15 | BL-26 |
| distribucion-telemetria-licencias-n3 | service-story | idea | media | N3 | BL-25 |
| motor-discovery-n1-serverside | service-story | dropped | tbd | transversal | BL-13 |

> `motor-discovery-n1-serverside` (BL-13) quedó **derogada en CK-18**: el motor de
> discovery ya no se construye como servicio server-side; su razonamiento vive como
> arneses (N2/Consultio) sobre Claude Code local. Se conserva como lápida.

## Capabilities

Sin capabilities construidas aún.

## Referencia

Fichas de arquitectura de los nodos en
[`sistema/arquitectura/NODOS.md`](NODOS.md) · secciones
**N15**, **N2** y **N3**.
