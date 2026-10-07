# arquitectura-refichado-ck21 — Re-fichado fino post-CK-21 (preparar el terreno)

> `state: idea` · module `sistema` · node `transversal` · release F1 · **Fase 0 del roadmap (CK-22): la primera historia — el terreno antes de lo funcional.**

## Job

Como arquitecto del sistema quiero bajar CK-21 completo a la arquitectura-as-code (NODOS.md fino,
`despliegue.html` curado, `arquitectura.yaml`, R-walk) para que todo lo funcional del MVP se
construya sobre un mapa sin contradicciones con el norte **organization as code → organization twin**.

## Por qué ahora

CK-21 ajustó las fichas esenciales (chequeo 2, N3 Portal, N13, N14, N16) y declaró el pase fino
como deuda. El operador fijó en CK-22 que esta es la **primera** historia del roadmap: las 15
historias funcionales del MVP anclan a nodos — si el mapa arrastra residuos del modelo anterior
(soberanía como dogma, N3 solo-canal, Consultio esperando a DevStudio), cada refinamiento hereda
la contradicción.

## Alcance (idea — se refina al promover)

1. **NODOS.md pase fino:** chequeo 2 en profundidad (residencia por tier), R-walk si el Portal
   agrega responsabilidad propia (¿R9 se parte?), coherencia de TODAS las fichas con el default
   hosteado single-tenant y con el twin (deseado × real × brecha).
2. **`despliegue.html` (curado a mano):** N3 como Portal, las dos modalidades de la Organización
   (hosteada por nosotros / en red del cliente), el twin como narrativa del flujo.
3. **`arquitectura.yaml`:** componentes nuevos declarados (`motor-de-indicadores`,
   `brecha-proyecto`, `portal`) con `fichas:` y `ruta:` válidas para el gate.
4. Gates (`gen_arquitectura.py --check` + `gen_metodo.py --check`) verdes en el mismo evento.

## Prior art scan

Continuación directa de la deuda declarada en CK-21 (LEDGER) — no duplica historia existente:
`terminar-arquitectura-despliegue` (BL-03) cerró el mapa CK-14/CK-18 y está `done`; ésta baja el
delta CK-21. Research: `docs/research/organization-as-code/07` §Derivación de arquitectura + `08`.
