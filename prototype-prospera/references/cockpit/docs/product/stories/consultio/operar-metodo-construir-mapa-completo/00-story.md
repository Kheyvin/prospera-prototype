# 00-story.md — Operar el método + construir el mapa completo (PM)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: operar-metodo-construir-mapa-completo
type: service-story
module: consultio
capability: consultio/operar-metodo-construir-mapa-completo
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/consultio/operar-metodo-construir-mapa-completo.yaml"
  module_doc: "../../../modules/consultio.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** consultor
**Quiero** operar m1·m2·m3 como un flujo con carriles/provenance y construir el objeto normalizado, los documentos oficiales y los arneses de la organización (con preview local de Cockpit)
**Para** entregar el mapa completo As-Is→To-Be→proyectos

## Por qué importa

Es el corazón del método. Consultio no vale como cascarón: su razón de ser es convertir el levantamiento en el objeto normalizado, calcular la brecha (TO-BE − AS-IS) con severidad y hacer nacer de ella los proyectos (R6, el flujo As-Is→To-Be→proyectos de VISION). El preview local de Cockpit (patrón dev-server) permite ver el resultado mientras se construye. Que el método viaje como arneses (no embebido en un build rígido) es lo que evita el drift y permite entregarlo al cliente (CK-18/D1).

## Outcome esperado

- Consultio opera m1·m2·m3 como flujo, con carriles y provenance.
- Construye el objeto normalizado + documentos oficiales + arneses de la organización.
- Preview local de Cockpit disponible durante la construcción (patrón dev-server).
- Calcula la brecha (TO-BE − AS-IS) + severidad y deriva los proyectos que nacen de ella (R6).
- El método viaja como arneses, no embebido en build rígido.

## Antecedentes / Contexto

- Origen (verbatim): "operador, sesión CK-11 · redefinido CK-18".
- Depende de BL-15 (construir-consultio-clon-devstudio): sin el clon no hay app donde operar el método.
- Ficha CK-11: método del auditor completado desde el legacy.
- Ficha CK-18: el método se entrega en arneses; Consultio construye el mapa completo.
- R6 / VISION: flujo As-Is→To-Be→proyectos desde la brecha.
- El objeto normalizado completo (9 entidades de objeto.schema) se lee y valida entero en /api/objeto (CK-13, CAP-08).

## Out of scope (explícito)

- Construir/adaptar la app Consultio en sí → BL-15.
- Publicar el resultado ratificado al Repositorio Oficial ("deploy de procesos") → BL-17.
- La compilación arnés-por-rol desde el objeto (fábrica) → BL-26 (Arnesia).

## Riesgos / Asunciones

- **Riesgo:** el método (M1 beats 2-3, M3 etapas 1-5) aún está a medio poblar (BL-05) — **Mitigación:** poblar el método es insumo directo; secuenciar el poblado antes o en paralelo.
- **Asunción:** el objeto normalizado (9 entidades) es contrato suficiente para expresar As-Is, To-Be, brecha y proyectos sin extensiones de schema.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/consultio/operar-metodo-construir-mapa-completo/story.yaml`

> Procedencia (CK-19): backlog item **BL-16** · estado legacy **pendiente**.
