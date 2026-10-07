# research/ — investigación de producto

Investigación **viva** del producto. Las campañas heredadas del monorepo se destilaron y se retiraron
(ver nota al pie).

## [`dto-contexto-2026-10/`](prtProspera/prototype-prospera/references/cockpit/docs/research/dto-contexto-2026-10/README.md) — DTO y contexto organizacional (2026-10-06)

Actualización frente a julio: tabla de 66 proveedores, familias de producto y proyectos, una ficha
Markdown por entrada y cambios fechados. Foco en procesos, conocimiento de la organización y trabajo
diario; fuentes oficiales, enlaces de documentación y disponibilidad diferenciada de marketing.
Incluye Puzzle y Slite. Empieza por su [tabla](prtProspera/prototype-prospera/references/cockpit/docs/research/dto-contexto-2026-10/README.md).

## [`organization-as-code/`](prtProspera/prototype-prospera/references/cockpit/docs/research/organization-as-code/README.md) — base de investigación de julio

DTO, arquitectura empresarial, procesos como código, ontología y arneses de agentes que informaron
CK-21 y CK-30. La revisión de octubre está separada para conservar la comparación temporal.

## [`rediseno-total/`](rediseno-total) — SOTA del rediseño CK-18 (2026-07-08)

Siete investigaciones state-of-the-art que informaron el rediseño de fondo (**Fábrica + Organización
instalada**): repositorio oficial (git/Forgejo), data lakehouse (dlt+DuckLake), knowledge DB
(files-first), distribución/licencias/telemetría (go-tuf v2 + Tauri + Ed25519 + OTLP), auth/RBAC
(embebida policy-as-data), gestión de cambios ISO, y proceso-como-arnés. Empieza por su
[`README.md`](prtProspera/prototype-prospera/references/cockpit/docs/research/rediseno-total/README.md). Es el insumo de las fichas de nodo en
[`../../sistema/arquitectura/NODOS.md`](NODOS.md).

---

> **Nota (cierre BL-07):** las tres campañas heredadas del monorepo (`cockpit-negocio`,
> `modelo-objeto`, `service-design`) + `mockups/` se **destilaron a `sistema/` y se borraron** — para
> dejar el repo limpio, sin sesgo por herencia. Sus salidas de sistema viven ahora como as-code:
> - `objeto.schema.yaml` + `ejemplo-vertice.yaml` + `metodologia/` + `DECISIONES.md` →
>   [`../../sistema/schema/`](../../sistema/schema)
> - `M1-LEVANTAMIENTO.md` / `M3-ESPINAZO.md` / `SERVICE-DESIGN.md` →
>   [`../../sistema/metodo/`](../../sistema/metodo)
>
> La narrativa de proceso de esas campañas queda solo en la historia git.
