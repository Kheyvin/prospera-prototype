# 00-story.md — Rol Área real

---
story_id: rol-area-real
type: ui-story
module: cockpit
capability: shell-por-rol
links:
  story_yaml: "../../stories/cockpit/rol-area-real.yaml"
  capability_yaml: "../../capabilities/cockpit/shell-por-rol.yaml"
  module_doc: "../../modules/cockpit.md"
  release_yaml: "../../releases/F1.yaml"
---

## Job-To-Be-Done

**Como** responsable de un Área
**Quiero** ver mi rebanada real de procesos/sistemas en Cockpit (no un placeholder "próximamente")
**Para** trabajar con mi vista efectiva y no con un stub

## Por qué importa

El rol Área es hoy un placeholder "próximamente" en el shell por rol. Mientras siga vacío, el
directorio N13 no ofrece a ese perfil su corte real de procesos/sistemas, y no puede integrarse
con los niveles de acceso reales (BL-12). Cerrar este story completa el shell por rol y habilita
la lente de acceso sobre un rol que hoy no muestra nada.

## Outcome esperado

- El rol Área deja de mostrar "próximamente" y presenta su rebanada real de procesos/sistemas.
- La vista queda lista para integrarse con los niveles de acceso (BL-12).
- El shell por rol (CAP-05) cubre el rol Área con contenido real.

## Antecedentes / Contexto

- Origen (verbatim): "arquitectura.yaml (rol-area)".
- Fichas: CK-01, CK-06.
- Detalle fuente: "Su rebanada de procesos/sistemas. Se integra con los niveles de acceso (BL-12)."
- Extiende la capability existente shell-por-rol (CAP-05).

## Out of scope (explícito)

- Los niveles de acceso reales y su policy-as-data (eso es BL-12).
- Otros roles del shell que ya tienen vista.

## Riesgos / Asunciones

- **Asunción:** el corte de procesos/sistemas del rol Área ya es derivable del objeto normalizado.
- **Riesgo:** el diseño de la vista puede depender de decisiones de acceso (BL-12) — **Mitigación:** definir el contenido primero, la visibilidad por nivel después.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/cockpit/rol-area-real.yaml`

> Procedencia (CK-19): backlog item **BL-11** · estado legacy **pendiente**.
