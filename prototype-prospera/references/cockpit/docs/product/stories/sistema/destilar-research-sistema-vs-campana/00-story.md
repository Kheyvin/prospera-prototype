---
story_id: destilar-research-sistema-vs-campana
type: bugfix
module: sistema
capability: sistema/destilar-research-sistema-vs-campana
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** custodio del repo
**Quiero** destilar la research heredada separando salidas de sistema de la narrativa de campaña
**Para** dejar el repo limpio y sin sesgo por herencia

## Por qué importa

La investigación heredada mezclaba salidas de sistema con campañas. Promover lo válido a `sistema/` y borrar (no congelar) lo demás evita que el repo arrastre sesgo del origen y deja una única SOTA vigente.

## Outcome esperado

- Salidas de sistema promovidas a `sistema/schema/` (objeto.schema.yaml, ejemplo-vertice.yaml, metodologia/, DECISIONES.md) y `sistema/metodo/` (SERVICE-DESIGN.md de-staleado).
- Campañas heredadas BORRADAS: cockpit-negocio/, modelo-objeto/ (resto), service-design/, mockups/.
- `research/` queda solo con `rediseno-total/` (SOTA vigente). Repo limpio, sin sesgo por herencia.

## Antecedentes / Contexto

- Origen: **operador: 'vamos destilando en el camino'**.
- Cerrado como cierre de etapa en **CK-11**.
- Deuda aparte: **BL-09** (borrar carpetas campaign-* ORIGINALES fuera del repo).
- Fichas: CK-11.

## Out of scope (explícito)

- Borrar las carpetas `~/Proyectos/campaign-*` ORIGINALES fuera del repo — eso es BL-09.

## Riesgos / Asunciones

- **Asunción:** todo lo valioso de la research heredada quedó promovido antes de borrar las campañas.

## Próximo paso

`→ Cerrado (CK-11). Housekeeping, sin capability runtime. Deuda relacionada: BL-09.`

> Procedencia (CK-19): backlog item **BL-07** · estado legacy **hecho**.
