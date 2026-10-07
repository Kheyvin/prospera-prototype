# 00-story.md — MCP server del twin (V2)

---
story_id: mcp-server-twin
type: service-story
module: cockpit
capability: cockpit/mcp-server-twin
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** agente de cualquier plataforma
**Quiero** consultar la organización (el twin) vía un MCP server
**Para** razonar sobre procesos/roles/objetivos/indicadores sin acoplarme a la UI de Cockpit

## Por qué importa

Celonis, Ardoq y Bizzdesign shippearon MCP servers de su twin en 2025-26 — es table stakes
agéntico. Sin él, el twin queda encerrado en la UI y fuera del ecosistema de agentes.

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16) — visión organization-as-code + organization twin. **Prioridad baja / V2** (post-primeros-clientes).
- Research: `docs/research/organization-as-code/07-capability-list-tobe.md` (#30).
- Base existente: el twin ya se sirve por HTTP en `/api/objeto` (CAP-08, capability `cockpit/api-objeto`).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (mcp · twin · agentes): sin matches — ninguna historia expone el twin a agentes externos. Revisada la capability `cockpit/api-objeto` (live): el MCP server la consumiría/expondría, no la duplica.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/cockpit/mcp-server-twin/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
