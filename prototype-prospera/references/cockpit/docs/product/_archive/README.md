# _archive/ — registro histórico congelado (pre-arnés)

> ⚠️ **ARCHIVADO.** Nada de esta carpeta es SSoT. Son los artefactos de gestión anteriores a la
> adopción del arnés (CK-19) y a la reorganización del árbol `docs/` (CK-28, 2026-07-23), conservados
> como registro histórico. Correspondencia lossless con el modelo vigente: [`../MAPEO.md`](MAPEO.md).

| Artefacto | Qué era | Superseded por |
|---|---|---|
| [`backlog.yaml`](backlog.yaml) · [`BACKLOG.md`](BACKLOG.md) | System Backlog (SSoT pre-CK-19; ítems BL-NN) | historias en [`../stories/`](../stories) |
| [`increment.yaml`](increment.yaml) · [`INCREMENT.md`](INCREMENT.md) | Product Increment (CAP-NN verificadas) | [`../capabilities/`](../capabilities) |
| (este README, texto abajo) | La "tríada" CK-11: `sistema/` · `docs/` · `proyecto/` | árbol único `docs/` (CK-28) + `sistema/` as-code |

---

## Texto original de `proyecto/README.md` (tríada CK-11 — histórico)

Zona PROYECTO de la tríada (CK-11): aquí vivía la organización del trabajo — qué falta, qué
viene, y la historia de cómo se investigó. Nada de aquí se embebe ni se entrega; es el andamio,
no el edificio.

- `backlog.yaml` — **System Backlog** (SSoT, as-code): trabajo pendiente por subsistema.
  `BACKLOG.md` es su vista humana (mismo evento de edición, jamás divergen).
- `research/` — investigación viva (hoy en [`docs/research/`](../../research)): `rediseno-total/`
  (SOTA del rediseño CK-18). Las campañas heredadas (cockpit-negocio, modelo-objeto, service-design)
  se destilaron a `sistema/` y se borraron en el cierre de BL-07.

Los otros dos documentos de proyecto viven en la raíz por convención del arnés:
[`VISION.md`](VISION.md) (norte) y [`LEDGER.md`](LEDGER.md) (decisiones `CK-NN`).

### El ciclo ("nacemos ordenados") — reemplazado por el lifecycle del arnés

1. **Idea/necesidad nueva** → ítem en `backlog.yaml` PRIMERO. Se construye después.
2. **Decisión de alcance/arquitectura/visión** → ficha `CK-NN` en `LEDGER.md`; el ítem la
   referencia. Los artefactos as-code afectados (`sistema/…`, backlog) se editan en el MISMO evento.
3. **Construir** → ítem `en-curso`. Toda capability se construye contra el sistema as-code.
4. **Terminado Y verificado** → ítem `hecho` + capability `CAP-NN` en `increment.yaml` (SSoT) y su
   vista `INCREMENT.md`, mismo evento.

Hoy ese ciclo es el lifecycle de 10 estados del arnés (`idea → … → done`) sobre
[`../stories/`](../stories) — ver [`../README.md`](prtProspera/prototype-prospera/references/cockpit/docs/product/README.md).
