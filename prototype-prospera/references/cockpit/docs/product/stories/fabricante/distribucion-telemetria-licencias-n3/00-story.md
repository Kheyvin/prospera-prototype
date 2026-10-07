# 00-story.md — Plano del Fabricante: distribución + telemetría + licencias (N3)

> Owner: `/pm`. Lo que sabe el PM del story ANTES de invocar /po.
> NO es spec ejecutable (eso es 01-spec.md). Aquí va el QUÉ y el PORQUÉ.

---
story_id: distribucion-telemetria-licencias-n3
type: service-story
module: fabricante
capability: distribucion-telemetria-licencias-n3
links:
  story_yaml: "story.yaml"
  capability_yaml: "../../../capabilities/fabricante/distribucion-telemetria-licencias-n3.yaml"
  module_doc: "../../../modules/fabricante.md"
  release_yaml: "../../../releases/F1.yaml"
  ledger: "../../../../../LEDGER.md"
---

## Job-To-Be-Done

**Como** fabricante (nosotros, N2/N3/N15)
**Quiero** distribuir el binario Cockpit, las apps y los arneses con actualizaciones firmadas, archivos de licencia y telemetría opt-in
**Para** poder ofrecer y sostener un contrato de mantenimiento con cada cliente

## Por qué importa

Sin esto no hay contrato de mantenimiento (operador #4). La distribución es lo que
convierte la fábrica de software en un negocio recurrente: entrega actualizaciones seguras,
permite revocar arneses por cliente y da observabilidad consentida para operar el soporte.
La SOTA (research/rediseno-total/04) fija el plano técnico: GitHub privado como plano único;
go-tuf v2 + TUF-on-CI para el binario Cockpit, Tauri v2 updater para las apps, marketplace
privado revocable por cliente para los arneses, license files Ed25519 offline y OTLP/mTLS
opt-in por tenant.

## Outcome esperado

- Binario Cockpit distribuido con actualizaciones firmadas (go-tuf v2 + TUF-on-CI) — primer entregable.
- Apps (Consultio/Colab Studio/DevStudio) actualizables vía Tauri v2 updater.
- Arneses servidos por un marketplace privado, revocable por cliente.
- Archivos de licencia Ed25519 verificables offline.
- Telemetría OTLP/mTLS opt-in por tenant, con dos canales: consultores (siempre) / clientes (opt-in).

## Antecedentes / Contexto

- NUEVO en CK-18 (rediseño Fábrica + Organización instalada). Nodo N3 (Distribución + telemetría + licencias).
- Origen: operador CK-18 (D4, #4).
- SOTA de la pieza: `docs/research/rediseno-total/04`.
- Habilita el modelo de negocio con licencia + contrato de mantenimiento (ver BL-10).

## Out of scope (explícito)

- La fábrica de arneses en sí (Arnesia, N15) → story `arnesia-pipeline-arnes-por-rol` (BL-26).
- El Repositorio Maestro (N2) como fuente del método/arneses/código.
- Construcción de las apps que se distribuyen (Consultio/Colab Studio).

## Riesgos / Asunciones

- **Riesgo:** complejidad de operar TUF + updaters multiplataforma — **Mitigación:** empezar solo por el binario Cockpit y crecer por canal.
- **Asunción:** GitHub privado sirve como plano único de distribución al arrancar.
- **Asunción:** los clientes aceptan telemetría solo bajo opt-in explícito por tenant.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza/crea product/stories/fabricante/distribucion-telemetria-licencias-n3/story.yaml`

> Procedencia (CK-19): backlog item **BL-25** · estado legacy **pendiente**.
