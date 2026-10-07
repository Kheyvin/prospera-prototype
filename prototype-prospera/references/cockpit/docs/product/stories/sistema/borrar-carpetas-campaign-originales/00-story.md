---
story_id: borrar-carpetas-campaign-originales
type: bugfix
module: sistema
capability: sistema/borrar-carpetas-campaign-originales
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** custodio del entorno
**Quiero** borrar las carpetas `~/Proyectos/campaign-*` originales
**Para** eliminar el residuo ya rescatado fuera del repo

## Por qué importa

El contenido de esas carpetas ya está rescatado en `docs/research/`. Borrarlas elimina duplicación y ambigüedad sobre dónde vive la verdad, pero el borrado queda a decisión del operador.

## Outcome esperado

- Carpetas `~/Proyectos/campaign-*` originales eliminadas.
- Sin duplicación entre el residuo original y lo ya rescatado en `docs/research/`.

## Antecedentes / Contexto

- Origen: **deuda CK-10**.
- Contenido ya rescatado en `docs/research/`.
- Relacionado: cierre de BL-07 (destilar research) dejó esta deuda aparte.
- Fichas: CK-10.

## Out of scope (explícito)

- La destilación de la research dentro del repo (eso fue BL-07).

## Riesgos / Asunciones

- **Riesgo:** borrar algo aún no rescatado — **Mitigación:** confirmar que todo está en `docs/research/` antes de eliminar.
- **Asunción:** es decisión del operador ejecutar el borrado.

## Próximo paso

`→ Decisión del operador: confirmar rescate y ejecutar el borrado de las carpetas originales.`

> Procedencia (CK-19): backlog item **BL-09** · estado legacy **pendiente**.
