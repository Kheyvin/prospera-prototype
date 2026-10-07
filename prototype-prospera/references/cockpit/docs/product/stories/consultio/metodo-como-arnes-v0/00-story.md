# 00-story.md — El método como arnés v0 (M1-M3 sobre Claude Code pelado)

---
story_id: metodo-como-arnes-v0
type: service-story
module: consultio
capability: consultio/metodo-como-arnes-v0
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** consultor
**Quiero** los arneses del método (M1-M3) corriendo sobre Claude Code pelado: levantamiento por entrevista con agente, doc→modelo (MOF/manuales/organigramas/Excel → objeto normalizado con provenance) y preview local de Cockpit
**Para** operar el método en el cliente hoy, sin esperar la app shell de Consultio

## Por qué importa

Consultio estaba bloqueado esperando el clon de DevStudio; CK-21 D7 lo desbloquea: el primer
entregable es el método como arnés, sin app. El patrón está validado por BusinessOptix Discovery
Agent / iGrafx Pia / ARIS AI Companion.

## Qué es (alcance idea)

- Arneses M1-M3 ejecutables sobre Claude Code local (BYO licencia), sin app shell.
- Levantamiento por entrevista con agente (M1 como arnés) + doc→modelo con provenance.
- Preview local de Cockpit antes de publicar (patrón dev-server, ya diseñado).

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16), decisión D7 — visión organization-as-code + organization twin.
- Research: `docs/research/organization-as-code/07-capability-list-tobe.md` (#33-35).
- El contenido del método vive en `sistema/metodo/` (poblarlo = `sistema/poblar-metodo-m1-m3`).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (consultio · arnes · levantamiento · entrevista): las historias existentes de Consultio asumen la app completa. Revisadas: `consultio/construir-consultio-clon-devstudio` (BL-15 — asume el clon de DevStudio terminado; esta v0 la **referencia y la desbloquea**, no la reemplaza), `consultio/operar-metodo-construir-mapa-completo` (BL-16 — el flujo completo con app y cálculo de brecha; esta v0 es el subset arnés-only previo), `sistema/poblar-metodo-m1-m3` (contenido del método — insumo, no superficie). Ninguna declara el alcance v0 sin app shell → se crea como historia separada.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/consultio/metodo-como-arnes-v0/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
