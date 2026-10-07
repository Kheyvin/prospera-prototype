# 00-story.md — Publicación al Repositorio Oficial ("deploy de procesos") (PM)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: publicacion-repo-oficial-deploy-procesos
type: service-story
module: consultio
capability: consultio/publicacion-repo-oficial-deploy-procesos
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/consultio/publicacion-repo-oficial-deploy-procesos.yaml"
  module_doc: "../../../modules/consultio.md"
  release_yaml: "../../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** consultor
**Quiero** publicar el resultado ratificado al Repositorio Oficial (N6, git self-hosted) vía commit+tag y transferir la operación al Analista de Calidad (N9→N19)
**Para** hacer el "deploy de procesos" del lado del cliente

## Por qué importa

Cierra el ciclo del levantamiento. El mapa que Consultio construye (BL-16) no sirve mientras viva solo en la máquina del consultor: la publicación lo convierte en lo oficial, versionado y gobernado sobre el Repositorio Oficial. Al unirse a la Gestión de Cambios (BL-24) queda bajo gobierno del cambio del lado del cliente, y la transferencia consultor→Analista de Calidad materializa la entrega de la operación a la organización.

## Outcome esperado

- Consultio publica el resultado ratificado a N6 (git self-hosted) vía commit+tag.
- La publicación se une a la Gestión de Cambios (BL-24) para el gobierno del cambio del lado del cliente.
- Queda definida la transferencia consultor→Analista de Calidad (N9→N19): qué arneses/permisos cambian al entregar la operación al cliente.

## Antecedentes / Contexto

- Origen (verbatim): "operador, sesión CK-11 · redefinido CK-18".
- Depende de BL-15 (construir-consultio-clon-devstudio): la publicación es una capability de Consultio.
- Se apoya en el mapa que produce BL-16 (operar-metodo-construir-mapa-completo).
- Ficha CK-18: N6 = Repositorio Oficial (git self-hosted confidencial, ya NO GitHub); N9 (consultor) → N19 (Analista de Calidad); Gestión de Cambios ISO (BL-24) gobierna versiones.
- Ficha CK-11: origen del ítem (App del Auditor).

## Out of scope (explícito)

- Construir/adaptar la app Consultio → BL-15.
- Operar el método y construir el mapa → BL-16.
- Construir el Repositorio Oficial (Forgejo self-hosted, BD vs archivos) → BL-21.
- El módulo Gestión de Cambios ISO en Cockpit → BL-24 (se une a él, no lo implementa).

## Riesgos / Asunciones

- **Riesgo:** el Repositorio Oficial (N6) aún no existe (BL-21) — **Mitigación:** secuenciar tras el primer despliegue de N6; diseñar el contrato de publicación (commit+tag) contra su interfaz.
- **Asunción:** git/archivos es SSoT en N6 y la política de acceso por rol organizacional (policy-as-data, BL-12) permite modelar el cambio de arneses/permisos en la transferencia N9→N19.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/consultio/publicacion-repo-oficial-deploy-procesos/story.yaml`

> Procedencia (CK-19): backlog item **BL-17** · estado legacy **pendiente**.
