# 00-story.md — Resolver deuda Go/Next de N13 — migrar UI a Vite SPA

---
story_id: deuda-go-next-n13-vite-spa
type: service-story
module: cockpit
capability: deuda-go-next-n13-vite-spa
links:
  story_yaml: "../../stories/cockpit/deuda-go-next-n13-vite-spa.yaml"
  capability_yaml: "../../capabilities/cockpit/deuda-go-next-n13-vite-spa.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** equipo de producto
**Quiero** migrar la UI de N13 de Next.js static-export a una SPA Vite + React Router embebida con go:embed (Go como único backend)
**Para** resolver la deuda técnica antes de construir las vistas nuevas

## Por qué importa

N13 arrastra deuda heredada: la UI es Next.js static-export. Antes de construir las vistas nuevas
(Gestión de Cambios, niveles) conviene decidir y migrar a una SPA Vite + React Router embebida con
go:embed y Go como único backend, para no acumular más sobre una base con deuda. Conecta con el
design system (BL-04).

## Outcome esperado

- UI migrada de Next.js static-export a SPA Vite + React Router.
- SPA embebida con go:embed; Go como único backend.
- Decisión tomada antes de construir Gestión de Cambios (BL-24) y niveles (BL-12).

## Antecedentes / Contexto

- Origen (verbatim): "NODOS.md N13 (deuda heredada) · CK-14".
- Ficha: CK-14.
- Conecta con el design system + atomic + Storybook (BL-04).
- Bloquea/precede las vistas nuevas: Gestión de Cambios (BL-24), niveles de acceso (BL-12).

## Out of scope (explícito)

- El design system en sí (BL-04).
- Las vistas nuevas que se construirán sobre la SPA (Gestión de Cambios, niveles).

## Riesgos / Asunciones

- **Asunción:** el frontend actual puede reescribirse a Vite + React Router sin perder funcionalidad exportada.
- **Riesgo:** migrar tarde obliga a reconstruir vistas nuevas — **Mitigación:** decidir/migrar antes de arrancar Gestión de Cambios y niveles.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/deuda-go-next-n13-vite-spa.yaml`

> Procedencia (CK-19): backlog item **BL-20** · estado legacy **pendiente**.
