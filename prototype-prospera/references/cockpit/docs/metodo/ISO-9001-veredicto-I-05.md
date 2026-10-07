# Veredicto ISO 9001 — precedente heredado (I-05, monorepo `prenter-harness`)

> Ficha original: `tooling/strategy/LEDGER.md` (I-05, `capturada`/`vig:ejecutada`) +
> `tooling/strategy/VISION-DESARROLLOS.md §12`. Copiado aquí tal cual porque es el precedente
> directo que fundamenta `VISION.md §ISO` de este repo (decisión CK-10 lo hereda como columna
> vertebral y lo amplía con una capability futura declarada, no construida).

## Idea cruda original

¿Cómo guardamos/sincronizamos/obtenemos los objetivos del negocio, las personas, todo lo previo —
para saber quién nos habla, su área, su objetivo? ¿Aplican conceptos de ISO 9001 (calidad)?
(Refutar si no.)

## Veredicto: roba la ontología, rechaza el aparato

Sus cláusulas 4–7 dan el vocabulario exacto para "saber quién eres y tu contexto"; su maquinaria
de certificación/auditoría/control-documental es burocracia que mata la UX simple (lente PyME
LatAm).

| Cláusula ISO 9001 | Concepto útil (lo robamos) | Cómo lo usamos |
|---|---|---|
| **4.1** Contexto de la organización | El "quién eres y tu entorno" | Raíz de la capa de contexto |
| **4.2** Partes interesadas | Stakeholders | Personas = quién nos habla |
| **4.4** Enfoque a procesos | La org como procesos con dueño/entradas/salidas | Mapa de procesos (Service Blueprint) |
| **5.3** Roles, responsabilidades y autoridades | Quién tiene autoridad | Modelo de autoridad — habilita gates humano-irreducibles |
| **6.2** Objetivos medibles por función/nivel | Objetivos por área, medibles | Pilar Objetivos |
| **7.1.6** Conocimiento organizacional | Mantener el conocimiento necesario | La capa misma, viva |

**Rechazamos** (el aparato): certificación, auditoría formal, control documental burocrático,
enfoque a *conformance*. Eso convierte el producto en software de cumplimiento y mata la UX coach.

**Para el contenido, formas más ligeras que ISO:** OKRs (objetivos) · RACI (autoridad) ·
Lean/Business Model Canvas (el negocio) · Team Topologies/DDD (equipos↔sistemas).

## Cómo se obtiene — 3 fuentes (misma epistemología del producto)

1. **Declarado** — onboarding coach-led (no formulario gigante). Siembra; menor ground-truth
   (puede ser aspiracional).
2. **Derivado** — inferido de sistemas/código/ledger/docs existentes. Funda; mayor ground-truth.
3. **Observado** — del uso real (quién crea, quién ratifica, qué objetivos se persiguen).
   Revelado; máximo, continuo.

Regla: *Declarado siembra → Derivado funda → Observado corrige.*

## Cómo se guarda y sincroniza (patrón original, a re-evaluar en Cockpit)

Filesystem-as-DB — archivos versionados (`docs/org/` en el diseño original: objectives ·
stakeholders · process-map · context); git = audit trail gratis (la "documented information" de
ISO sin su burocracia) y capa de sync. Scope: nivel empresa/workspace.

## Qué cambia en Cockpit (CK-10)

El veredicto se hereda íntegro como columna vertebral. La ampliación de CK-10 es aditiva: una
capability futura de "preparación para auditoría" (gap-checklist vs. norma), declarada en
`arquitectura.yaml` como `estado: pendiente`, sin construir el aparato de certificación — el
límite ("rechaza el aparato") sigue rigiendo. Ver `VISION.md §ISO`.
