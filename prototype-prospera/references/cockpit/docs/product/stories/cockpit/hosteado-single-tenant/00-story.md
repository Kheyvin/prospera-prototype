# 00-story.md — Modalidad hosteada single-tenant como default comercial

---
story_id: hosteado-single-tenant
type: service-story
module: cockpit
capability: cockpit/hosteado-single-tenant
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** fabricante
**Quiero** la modalidad de despliegue "hosteado por nosotros" single-tenant por cliente (Forgejo + Cockpit + lake por instancia) como default comercial
**Para** vender sin exigirle al cliente infraestructura propia

## Por qué importa

El default self-hosted (CK-18 D3) frena la venta a PyMEs sin infra. CK-21 D3 lo invierte: hosteado
single-tenant como default comercial; self-hosted queda como tier enterprise/regulados; multitenant
real recién en fase 2 (>10-20 clientes).

## Qué es (alcance idea)

- Una instancia aislada por cliente: Forgejo + Cockpit + lake, operada por nosotros.
- Reescritura del chequeo 2 de NODOS ("transitan, no persisten" muere en el default hosteado).
- Asumir el rol de procesador de datos personales (DPA sobre nosotros).

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16), decisión D3 — invierte D3 de CK-18.
- Research: `docs/research/organization-as-code/` doc 08 (licenciamiento + hosting).
- SSoT de nodos a tocar al refinar: `sistema/arquitectura/NODOS.md` (chequeo 2).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (hosteado · single-tenant · multitenant · dpa · despliegue): sin historia que cubra la modalidad comercial de hosting. Revisadas: `repositorio-oficial/forgejo-self-hosted-bd-vs-archivos` (BL-21 — la tecnología del N6 self-hosted, que sigue válida como tier enterprise; no cubre la modalidad hosteada), `repositorio-oficial/deposito-fuentes-retencion-dpa` (DPA de retención del Depósito N12 — distinto del DPA de hosting que esta historia introduce), `cockpit/auth-niveles-acceso-policy-as-data` (BL-12 — gate multi-usuario, complementaria).

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/cockpit/hosteado-single-tenant/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
