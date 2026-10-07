# 00-story.md — Crowdsourcing de frescura + chat grounded en el twin (V2)

---
story_id: crowdsourcing-frescura
type: ui-story
module: cockpit
capability: cockpit/crowdsourcing-frescura
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** dueño de datos de la organización
**Quiero** encuestas/broadcasts que me pidan confirmar o actualizar mi parte del twin, y un chat grounded en el twin con decision-trace
**Para** que el modelo se mantenga fresco y consultable

## Por qué importa

Un twin desactualizado es un twin muerto (lección Ardoq Surveys/Broadcasts). El chat grounded con
decision-trace (Mavim ConversAI) vuelve el twin consultable por cualquiera sin saber navegarlo.

## Qué es (alcance idea)

- Encuestas/broadcasts dirigidos a dueños de datos para confirmar/actualizar su parte del twin.
- Chat grounded en el twin con decision-trace (respuestas que citan de dónde salen).

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16) — visión organization-as-code + organization twin. **Prioridad baja / V2** (post-primeros-clientes).
- Research: `docs/research/organization-as-code/07-capability-list-tobe.md` (#31-32).
- Superficie candidata hacia el trabajador operativo: Colab Studio (`colab-studio/colab-studio-app-trabajador`) — se decide al refinar.

## Prior art scan

Grep cross-tree en `docs/product/stories/` (crowdsourcing · frescura · encuesta · broadcast · chat): sin matches — ninguna historia cubre el loop de frescura ni el chat grounded. Revisada: `colab-studio/colab-studio-app-trabajador` (canal al trabajador operativo — posible superficie de entrega de las encuestas, referenciada, no duplicada).

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/cockpit/crowdsourcing-frescura/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
