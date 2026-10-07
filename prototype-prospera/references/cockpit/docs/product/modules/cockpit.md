# cockpit — Cockpit — Visualización + Gestión de Cambios ISO + niveles de acceso

## Nodo(s)

`N13` — Cockpit — Gestión de Cambios + Visualización. Plano **Organización**,
servicio/exec-env, madurez *existe (parcial)*. Binario Go propio (`directorio`) con UI
embebida que corre en la red del cliente: cruza la estructura (N6) con la operación
(N16) y la sirve por nivel de acceso; suma el módulo de Gestión de Cambios ISO.

## Historias

| story-id | type | state | prioridad | node | provenance |
|---|---|---|---|---|---|
| auth-niveles-acceso-policy-as-data | service-story | idea | alta | N13 | BL-12 |
| deuda-go-next-n13-vite-spa | service-story | idea | media | N13 | BL-20 |
| modulo-gestion-cambios-iso | ui-story | idea | media | N13 | BL-24 |
| cruce-estructura-operacion-indicadores | ui-story | idea | media | N13 | BL-28 |
| rol-area-real | ui-story | idea | media | N13 | BL-11 |
| capability-preparacion-auditoria | service-story | idea | tbd | N13 | BL-14 |

## Capabilities

| id | legacy | nombre | status |
|---|---|---|---|
| runtime-propio-directorio | CAP-01 | Runtime propio — binario `directorio` | live |
| api-portfolio | CAP-02 | API portfolio — GET /api/portfolio | live |
| api-negocio | CAP-03 | API negocio — GET /api/negocio?empresa= | live |
| vista-negocio | CAP-04 | Vista de Negocio (/negocio) | live |
| shell-por-rol | CAP-05 | Shell por rol + selector de empresa | live |
| modelo-portfolio | CAP-06 | Modelo de portfolio (TS puro) | live |
| lente-personas | CAP-07 | Lente Personas — pilar Personas de primera clase | live |
| api-objeto | CAP-08 | API objeto — GET /api/objeto?empresa= (9 entidades) | live |

## Referencia

Ficha de arquitectura del nodo en
[`sistema/arquitectura/NODOS.md`](NODOS.md) · sección **N13**.
