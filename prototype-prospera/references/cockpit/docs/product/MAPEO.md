# MAPEO — migración legacy → arnés (CK-19, 2026-07-09)

> **Prueba de "nada perdido".** Correspondencia completa entre el sistema de tracking legacy de Cockpit
> y el modelo de artefactos del arnés `harness@prenter-marketplace`. Migración **total** (SSoT movido),
> **lossless** (nada borrado; todo campo legacy sobrevive verbatim). Ratificada por el operador (3 forks
> firmados vía AskUserQuestion — ver ficha **CK-19** en `LEDGER.md`).

## Qué cambió (doctrina)

| Antes (SSoT legacy) | Ahora (SSoT arnés) | Estado del legacy |
|---|---|---|
| `docs/product/_archive/backlog.yaml` (BL-NN) | `docs/product/stories/<module>/<story-id>/` | **archivado** (banner, congelado, no borrado) |
| `docs/product/_archive/increment.yaml` (CAP-NN) | `docs/product/capabilities/cockpit/<cap>.yaml` | **archivado** |
| `docs/product/_archive/BACKLOG.md` · `docs/product/_archive/INCREMENT.md` (vistas) | (las historias/caps se leen directo) | **archivado** |
| `VISION.md` (norte) | **sin cambio** — norte + `value_stream` del seam | vivo |
| `LEDGER.md` (CK-NN) | **sin cambio** — decisiones/ADR + CIL del arnés | vivo (+ CK-19) |
| `sistema/arquitectura/` | **sin cambio** — extensión as-code #1, cableada | vivo (`.claude/rules/arquitectura-as-code.md`) |
| `sistema/metodo/` + `sistema/schema/` | **sin cambio** + gen+gate nuevo — extensión as-code #2 | vivo (`.claude/rules/metodologia-as-code.md`) |
| `docs/research/rediseno-total/` | **sin cambio** — investigación viva (informa F1) | vivo |

## BL-NN → historia (29/29 · 0 perdidos)

Cada `story.yaml` conserva verbatim en `provenance{}`: `titulo`, `detalle`, `origen`, `estado_legacy`,
`backlog_id`; y en campos: `prioridad`, `fichas`, dependencias (`depende`→`dependencies.stories`).

| BL | módulo | story-id | state | pri | fichas |
|----|--------|----------|-------|-----|--------|
| BL-01 | sistema | persona-puesto-primera-clase | done | alta | CK-10,12 |
| BL-02 | sistema | reconciliar-objeto-schema-9-entidades | done | alta | CK-12,13 |
| BL-03 | sistema | terminar-arquitectura-despliegue | done | alta | CK-11,14,18 |
| BL-04 | sistema | design-system-atomic-storybook | idea | media | CK-11 |
| BL-05 | sistema | poblar-metodo-m1-m3 | idea | media | — |
| BL-06 | sistema | negocio-schema-ssot-plugin-vs-repo | idea | media | — |
| BL-07 | sistema | destilar-research-sistema-vs-campana | done | media | CK-11 |
| BL-08 | sistema | render-arquitectura-yaml | done | baja | CK-10,15 |
| BL-09 | sistema | borrar-carpetas-campaign-originales | idea | baja | CK-10 |
| BL-10 | sistema | comprador-pricing-exito-12-meses | idea | baja | CK-18 |
| BL-19 | sistema | negocio-yaml-proyeccion-generada | idea | media | CK-13 |
| BL-11 | cockpit | rol-area-real | idea | media | CK-01,06 |
| BL-12 | cockpit | auth-niveles-acceso-policy-as-data | idea | **alta** | CK-18 |
| BL-14 | cockpit | capability-preparacion-auditoria | idea | tbd | CK-10 |
| BL-20 | cockpit | deuda-go-next-n13-vite-spa | idea | media | CK-14 |
| BL-24 | cockpit | modulo-gestion-cambios-iso | idea | media | CK-18 |
| BL-28 | cockpit | cruce-estructura-operacion-indicadores | idea | media | CK-18 |
| BL-15 | consultio | construir-consultio-clon-devstudio | idea | alta | CK-11,18 |
| BL-16 | consultio | operar-metodo-construir-mapa-completo | idea | alta | CK-11,18 |
| BL-17 | consultio | publicacion-repo-oficial-deploy-procesos | idea | alta | CK-11,18 |
| BL-21 | repositorio-oficial | forgejo-self-hosted-bd-vs-archivos | idea | media | CK-18 |
| BL-27 | repositorio-oficial | knowledge-database-files-first | idea | tbd | CK-18 |
| BL-29 | repositorio-oficial | deposito-fuentes-retencion-dpa | idea | media | CK-18 |
| BL-22 | lakehouse | construir-lakehouse-dlt-ducklake | idea | media | CK-18 |
| BL-18 | lakehouse | conectores-ingesta-por-sistema | idea | tbd | CK-16,18 |
| BL-23 | colab-studio | colab-studio-app-trabajador | idea | media | CK-18 |
| BL-25 | fabricante | distribucion-telemetria-licencias-n3 | idea | media | CK-18 |
| BL-26 | fabricante | arnesia-pipeline-arnes-por-rol | idea | media | CK-18 |
| BL-13 | fabricante | motor-discovery-n1-serverside | **dropped** | tbd | CK-10,18 |

Recuento: 23 `idea` · 5 `done` (BL-01,02,03,07,08) · 1 `dropped` (BL-13, ex `derogado`).

## CAP-NN → capability (8/8 · 0 perdidos)

Cada `capability.yaml` conserva verbatim `nombre`, `que_hace`, `rutas`, `componentes`, `fichas`,
`verificada` + `provenance.increment_id`. Todas `status: live`.

| CAP | capability id (módulo cockpit) |
|-----|-------------------------------|
| CAP-01 | runtime-propio-directorio |
| CAP-02 | api-portfolio |
| CAP-03 | api-negocio |
| CAP-04 | vista-negocio |
| CAP-05 | shell-por-rol |
| CAP-06 | modelo-portfolio |
| CAP-07 | lente-personas |
| CAP-08 | api-objeto (business_rules RN-1…7 extraídas de sus invariantes) |

## Releases

- `releases/F0-fundacion-mvp.yaml` — MVP standalone construido (5 historias done + 8 caps · CK-09…CK-17).
- `releases/F1-organizacion-instalada.yaml` — rediseño CK-18 (23 historias idea + 1 dropped · CK-16/18/19).

## Glosario de prefijos (sin cambios — conviven)

`CK-NN` ficha de decisión (LEDGER) · `BL-NN` item legacy (→ `provenance.backlog_id`) · `CAP-NN` capability
legacy (→ `provenance.increment_id`) · `N-NN` nodo (NODOS.md) · `D-NN` ADR del objeto (`sistema/schema/DECISIONES.md`) ·
`M01-M31` metodologías (`methodologies.yaml`) · `O1-O7`/`T1-T3` backbone del objeto · `I-NN` precedente heredado
del monorepo de origen (referencia externa).

## Garantía de losslessness

1. **Nada se borró.** `backlog.yaml`/`increment.yaml`/vistas quedan en [`_archive/`](_archive) con banner de archivado.
2. **Verbatim.** Cada historia/capability carga los campos legacy sin parafrasear (bloque `provenance`).
3. **Verificado.** 29/29 BL y 8/8 CAP con round-trip parse == fuente (subagentes de migración + gate).
4. **Cadena preservada.** `BL→CK→CAP→componente→N` sigue reconstruible por los campos `provenance`/`fichas`/`componentes`/`node`.
