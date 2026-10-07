# sistema — El sistema as-code (arquitectura/método/schema)

## Nodo(s)

`transversal` — no mapea a un nodo del diagrama de despliegue: es la capa as-code
(arquitectura, método del auditor, schemas) que atraviesa todos los planos. Las
historias de UI y método referencian nodos concretos (N13 el design system, N2 el
método) pero el módulo en sí es infraestructura del sistema, no un nodo desplegable.

## Historias

| story-id | type | state | prioridad | node | provenance |
|---|---|---|---|---|---|
| persona-puesto-primera-clase | service-story | done | alta | transversal | BL-01 |
| reconciliar-objeto-schema-9-entidades | service-story | done | alta | transversal | BL-02 |
| terminar-arquitectura-despliegue | service-story | done | alta | transversal | BL-03 |
| destilar-research-sistema-vs-campana | bugfix | done | media | transversal | BL-07 |
| render-arquitectura-yaml | service-story | done | baja | transversal | BL-08 |
| arquitectura-refichado-ck21 | service-story | done | alta | transversal | CK-22 |
| design-system-atomic-storybook | ui-story | idea | media | N13 | BL-04 |
| poblar-metodo-m1-m3 | service-story | idea | media | N2 | BL-05 |
| negocio-schema-ssot-plugin-vs-repo | service-story | idea | media | transversal | BL-06 |
| negocio-yaml-proyeccion-generada | service-story | idea | media | transversal | BL-19 |
| comprador-pricing-exito-12-meses | service-story | idea | baja | transversal | BL-10 |
| borrar-carpetas-campaign-originales | bugfix | idea | baja | transversal | BL-09 |

## Capabilities

Sin capabilities construidas aún (las capabilities live viven en el módulo `cockpit`).

## Referencia

Ficha de arquitectura de los nodos referenciados (N13, N2) en
[`sistema/arquitectura/NODOS.md`](NODOS.md).
