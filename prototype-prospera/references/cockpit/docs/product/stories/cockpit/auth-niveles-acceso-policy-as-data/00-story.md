# 00-story.md — Auth + niveles de acceso reales (4 niveles)

---
story_id: auth-niveles-acceso-policy-as-data
type: service-story
module: cockpit
capability: auth-niveles-acceso-policy-as-data
links:
  story_yaml: "../../stories/cockpit/auth-niveles-acceso-policy-as-data.yaml"
  capability_yaml: "../../capabilities/cockpit/auth-niveles-acceso-policy-as-data.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** operador que despliega Cockpit multi-usuario
**Quiero** auth real con los 4 niveles (Gobernanza>Estratégico>Táctico>Operativo) y visibilidad por rol derivada del Repositorio Oficial
**Para** que cada usuario vea solo lo que le corresponde (policy-as-data)

## Por qué importa

Redefinido en CK-18: no es solo autenticación. Son los 4 niveles organizacionales con visibilidad
por rol, donde el rol organizacional ES la política (policy-as-data derivada del Repositorio
Oficial). Es el gate para el despliegue multi-usuario: sin esto Cockpit no puede exponerse a varios
usuarios con visibilidad controlada.

## Outcome esperado

- Auth embebida (argon2id + scs/SQLite + middleware propio) operativa.
- Los 4 niveles (Gobernanza>Estratégico>Táctico>Operativo) con visibilidad por rol derivada del Repositorio Oficial.
- Campo `provider` disponible para OIDC futuro.
- Habilitado el despliegue multi-usuario.

## Antecedentes / Contexto

- Origen (verbatim): "auditoría CK-11 · redefinido CK-18".
- Ficha: CK-18.
- SOTA: research/rediseno-total/05.
- El rol organizacional ES la política (policy-as-data); la visibilidad se deriva del Repositorio Oficial (N6).
- Se integra con el Rol Área real (BL-11).

## Out of scope (explícito)

- OIDC/SSO real (solo se deja el campo `provider` para el futuro).
- El contenido de cada rol/vista (eso vive en las stories de cada rol, p.ej. BL-11).

## Riesgos / Asunciones

- **Asunción:** el Repositorio Oficial (N6) expone el rol organizacional como dato consumible para derivar la política.
- **Riesgo:** acoplar auth con la disponibilidad de N6 — **Mitigación:** auth embebida argon2id + scs/SQLite autónoma; el rol como política se resuelve sobre lo publicado.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/auth-niveles-acceso-policy-as-data.yaml`

> Procedencia (CK-19): backlog item **BL-12** · estado legacy **pendiente**.
