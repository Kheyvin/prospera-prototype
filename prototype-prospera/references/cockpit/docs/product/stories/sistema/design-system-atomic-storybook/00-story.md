---
story_id: design-system-atomic-storybook
type: ui-story
module: sistema
capability: sistema/design-system-atomic-storybook
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** diseñador/ingeniero de UI
**Quiero** un design system con atomic design y Storybook as-code
**Para** que toda capability nueva de UI se construya contra una base consistente

## Por qué importa

No existe aún y la doctrina CK-11 exige que toda capability nueva de UI se construya contra él. Con CK-18 gana urgencia: Cockpit suma Gestión de Cambios + niveles de acceso y nacen Consultio/Colab Studio como UIs nuevas — todas necesitan la misma base visual.

## Outcome esperado

- Design system as-code con atomic design.
- Storybook como catálogo vivo de componentes.
- Toda UI nueva (Cockpit, Consultio, Colab Studio) construida contra él.

## Antecedentes / Contexto

- Origen: **operador, sesión CK-11**.
- Doctrina CK-11: capability nueva de UI se construye contra el design system.
- Más urgente con CK-18 (Cockpit gana Gestión de Cambios + niveles; Consultio/Colab Studio son UIs nuevas).
- Fichas: CK-11.

## Out of scope (explícito)

- Las UIs concretas que lo consumen (Gestión de Cambios, niveles, Consultio, Colab Studio) van en sus propios ítems.

## Riesgos / Asunciones

- **Riesgo:** construir UI nueva sin el design system genera deuda visual — **Mitigación:** priorizarlo antes de las vistas nuevas de CK-18.
- **Asunción:** atomic design + Storybook es el patrón adecuado para el stack de N13.

## Estado (CK-27 · 2026-07-20) — fundación shippeada

El operador fijó **PRENTER** (Claude Design) como el design system y la doctrina atomic + banco DRY.
Construido y verificado en vivo esta sesión (tsc + `next build` + render de `/design-system`):

- ✅ **Tokens** PRENTER ported a `ui/app/globals.css` (`@theme` + `:root`) — mata el acento púrpura leftover.
- ✅ **Átomos** `.tsx` en `ui/components/ds/atoms/` (`Button`·`Badge`·`Card`·`Input`), token-driven.
- ✅ **Catálogo vivo** embebido en `/design-system` (ruta showcase, no Storybook.js — fork del operador).
- ✅ **Doctrina** enforce-able: `.claude/rules/ui-design-system.md`; seam `design_system_ref: adopted`.

**Diferido (scope vivo de esta story):**
- ⬜ Migrar organismos legacy (`ui/components/{negocio,shell,ui}/`, ya re-tematizados a teal por los tokens) al banco `ds/`.
- ⬜ Moléculas (`ui/components/ds/molecules/`).
- ⬜ Harness de test DOM (jsdom/testing-library) para átomos con lógica.
- ⬜ Fuentes de marca oficiales `.woff2` (hoy sustitutos Jost/Mulish).

## Próximo paso

Refinar el scope diferido (arriba) como tickets; o dar por cerrada la fundación y abrir los follow-ups
como ítems propios. La FIRMA 1 de `cruce-estructura-operacion-indicadores` ya puede pensar su mockup
contra los átomos PRENTER.

> Procedencia (CK-19): backlog item **BL-04** · estado legacy **pendiente** → **F1/developing** (CK-27).
