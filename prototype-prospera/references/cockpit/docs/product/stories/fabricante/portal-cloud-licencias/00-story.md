# 00-story.md — Portal cloud del Fabricante: licencias por asiento + cobro + descargas

---
story_id: portal-cloud-licencias
type: service-story
module: fabricante
capability: fabricante/portal-cloud-licencias
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** fabricante
**Quiero** un portal cloud con login, cobro, gestión de usuarios/asientos y descargas (apps + arneses), con licencias por asiento node-locked de fingerprint compuesto
**Para** que N3 crezca de mecanismo de distribución a producto comercial

## Por qué importa

Sin portal no hay autoservicio de compra/asientos/descargas ni control de licencias por asiento.
El fingerprint por MAC es spoofeable e inestable; el SOTA es el fingerprint compuesto
(CPU+disco+placa hasheado SHA-256), node-locked, con activación/desactivación y heartbeat.

## Qué es (alcance idea)

- Portal cloud: login, cobro, gestión de usuarios/asientos, descargas de apps y arneses.
- Licencias por asiento node-locked: fingerprint compuesto CPU+disco+placa (SHA-256), activación/desactivación, heartbeat — keygen-go ya en la ficha N3.

## Antecedentes / Contexto

- Ficha: **CK-21** (2026-07-16), decisión D4 — visión organization-as-code + organization twin.
- Research: `docs/research/organization-as-code/` doc 08 (licenciamiento + hosting).
- El método se entrega al cliente en arneses; la protección es **licencia + contrato** (CK-18/D1).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (licencia · portal · asiento · fingerprint · cobro): sin historia que cubra el portal comercial. Revisada: `fabricante/distribucion-telemetria-licencias-n3` (BL-25 — el plano N3 de updates firmados TUF/Tauri + license files Ed25519 offline + telemetría opt-in; esta historia **extiende** ese plano hacia el producto portal — login/cobro/asientos/fingerprint node-locked — y ambas se reconcilian al refinar, sin duplicar el mecanismo de distribución).

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/fabricante/portal-cloud-licencias/story.yaml`

> Procedencia: ficha **CK-21** (2026-07-16) — visión organization-as-code + organization twin · research `docs/research/organization-as-code/`.
