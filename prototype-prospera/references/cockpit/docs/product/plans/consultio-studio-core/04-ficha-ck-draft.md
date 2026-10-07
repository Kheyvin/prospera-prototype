# Ficha CK-25 — Consultio: extraer studio-core, no clonar DevStudio

> **Estado: RATIFICADA → `LEDGER.md` CK-25 (2026-07-17).** N14/N5 re-fichados en NODOS.md
> (madurez N14 no-construido→existe (parcial), badge "clon DevStudio"→"app fina sobre
> studio-core", riesgo (2) de N5 cerrado); `despliegue.html`/`nodos.data.js` regenerados;
> gate de arquitectura (`gen_arquitectura.py --check`) verde.

---

## CK-25 · Consultio no se clona: se extrae `studio-core` y ambas apps lo consumen

**Fecha:** 2026-07-17 · **Decisor:** operador · **Tipo:** decisión de fondo (topología de productos edge)

**Contexto.** N14 (Consultio) estaba fichado como "clon de DevStudio". Scout de dev-studio
(2026-07-17): 60-70% del código es núcleo genérico ya aislado tras puertos DIP (motor
arneses, driver Claude Code, sesión, store, transporte, updater, design system). Clonar =
fork = doble mantenimiento y mejoras que no fluyen. CK-21/D7 ya desacopló el MVP:
Consultio v0 = arneses sin shell.

**Decisión.**
1. **D1 — Topología 3 piezas:** repo `studio-core` (kernel compartido, módulo Go + paquete
   npm UI, ledger SC-NN) + `dev-studio` (app fina) + `consultio` (app fina, repo/célula
   propia). Repos separados por producto (doctrina de células); NO monorepo.
2. **D2 — Disciplina upstream-first:** todo cambio genérico aterriza en el core primero;
   los productos consumen por import semver. **Ban de mirror producto→producto** (misma
   doctrina que backflow del arnés y anti-duplication cross-sistema). Gate de promoción:
   2º consumidor necesita el patrón → lift al core en ese momento.
3. **D3 — Secuencia:** F0 arneses v0 (ya corriendo, CK-21/D7) → F1 frontera fitness-test en
   dev-studio → F2 extracción (trigger: necesidad real de shell) → F3 Consultio app fina.
   La extracción NO bloquea la entrega del método.
4. **D4 — Variación en el seam de cada app:** taxonomía de unidad-de-trabajo, value-stream,
   branding, marketplace por defecto. Core sin lógica condicionada por producto.

**Consecuencias.**
- NODOS.md: N14 "clon de DevStudio" → "app fina sobre studio-core (extraído de N5)";
  riesgo abierto N5-(2) ("cómo se clona Consultio") queda cerrado por esta ficha.
- dev-studio: F1/F2 se registran en su ledger (DH-NN).
- Los arneses M1-M3 de F0 se producen en formato forma-plugin/prenter-marketplace →
  asset directo para F3 sin retrabajo.

**Alternativas descartadas.**
- **Fork/clon:** doble mantenimiento, divergencia, sin backflow. Descartada.
- **Monorepo único edge:** contradice doctrina de células/graduación; `go.work` local da la
  misma velocidad sin fusionar repos. Descartada.
- **Un solo binario con "ediciones":** atractivo por reuso máximo, pero mete `if producto`
  al core y acopla releases de dos productos con compradores distintos. Descartada
  (revisable si F0-F3 muestran variación menor a la prevista).

**Plan detallado:** `docs/product/plans/consultio-studio-core/`.
