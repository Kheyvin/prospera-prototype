# La disciplina — upstream-first entre productos hermanos

> Responde la pregunta del operador (2026-07-17): "¿ambos extraen lo mejor de uno del otro?"
> **Corrección importante: NO.** Los productos jamás se copian código entre sí. Todo pasa
> por el core. Este doc fija las reglas.

## 1. El modelo mental

Tres repos, tres roles:

| Repo | Rol | Qué contiene |
|---|---|---|
| `studio-core` | **Kernel compartido** (SSoT de lo genérico) | Motor arneses/registry, driver Claude Code (stream-json, BYO licencia), session engine, store, transporte HTTP/SSE, updater, design system React. Puertos DIP estables. |
| `dev-studio` | Producto 1 (app fina) | Taxonomía dev (`historia·bug·hotfix`), worktrees git por sesión, changes-panel, value-stream dev, branding P2. |
| `consultio` | Producto 2 (app fina) | Taxonomía entregables/engagement, arneses método M1-M3 (de Arnesia/N15), preview local Cockpit (N13), publicación a N6, branding propio. |

**Analogía exacta que ya operamos:** el arnés prenter. CORE del plugin = byte-idéntico,
jamás se edita en el proyecto; lo específico va al seam (`project.config.yaml`) o a reglas
project-layer; las mejoras genéricas se **upstreamean** al plugin. `studio-core` es lo mismo
pero para código Go/TS.

## 2. Las 5 reglas

### R1 — Dirección única del flujo: producto → core → productos
Descubriste una mejora genérica trabajando en Consultio (ej. driver Claude Code maneja mejor
un edge del stream-json):
1. El cambio se comitea en `studio-core` (NO en consultio).
2. Se tagea semver (`v0.x.y`).
3. Consultio bumpea la dependencia → lo usa.
4. dev-studio bumpea cuando quiera (`go get -u`) → lo recibe **gratis**.

Eso es "reutilizar en ambas direcciones": no es copiar código entre productos, es que
**ambos beben del mismo pozo** y cualquiera puede llenarlo.

### R2 — Ban de mirror producto→producto
Ver algo útil en dev-studio estando en Consultio tiene exactamente 3 salidas:
- **(a) Ya está en el core** → import. Fin.
- **(b) Es genérico pero vive en dev-studio** (quedó ahí de antes) → **lift al core primero**
  (mover el código a `studio-core`, dev-studio pasa a importarlo), después Consultio importa.
  El lift es UN commit-serie en core + un bump en dev-studio. Nunca copy-paste.
- **(c) Es específico de dev** → NO se copia. Consultio implementa su versión propia y fina,
  dueña del producto (ej. taxonomías: `historia/bug` vs `entregable/engagement` — parecidas
  pero semántica distinta; compartirlas sería acoplamiento falso).

Mismo ban que `anti-duplication.md` M-cross-sistema, aplicado a células.

### R3 — Gate de promoción (regla de tres adaptada)
- Patrón aparece en 1 producto → vive en el producto.
- El 2º producto lo necesita → **se liftea al core en ese momento** (no antes: abstraer con
  un solo consumidor = adivinar la API; no después: copiarlo = fork silencioso).
- El lift se registra en el ledger del core (1 línea: qué, desde qué producto, por qué).

### R4 — Contrato del core: puertos estables, variación en las apps
- El core expone **puertos DIP** (ya existen: `ports/arnes.go`, `ports/agent.go`, …) y
  tipos genéricos. Cambio breaking en un puerto → major bump + migración en ambas apps
  el mismo día (son 2 consumidores, tuyos — barato).
- Las apps inyectan sus puntos de variación: taxonomía de unidad-de-trabajo, value-stream,
  branding/tokens del design system, marketplace de arneses que consumen (dev vs método).
- Lo que el core NO puede parametrizar limpio, NO entra al core (queda per-producto).
  Un core con `if producto == consultio` está podrido.

### R5 — Desarrollo diario con `go.work` (velocidad monorepo, gobernanza multi-repo)
En la máquina de desarrollo:
```
~/Proyectos/studio-core/
~/Proyectos/dev-studio/     # go.work → use ../studio-core
~/Proyectos/consultio/      # go.work → use ../studio-core
```
- `go.work` (NO comiteado) apunta al core local → editas core + app en la misma sesión,
  cambio atómico, cero fricción de publicar-para-probar.
- Publicar = tag semver en core + bump del `go.mod` de la app. El `go.mod` comiteado
  SIEMPRE referencia versión tageada (reproducible por cualquier clone).
- Design system UI: mismo patrón vía paquete npm (workspace local / `file:` en dev,
  versión publicada en el `package.json` comiteado).

## 3. Flujos ejemplo

**Bugfix genérico (encontrado en Consultio):**
sesión en consultio detecta bug del driver → fix + test en `studio-core` (TDD: RED en core)
→ tag `v0.4.3` → bump consultio (verifica) → bump dev-studio (suite verde) → listo.
Costo extra vs fork: un tag + un bump. Beneficio: dev-studio nunca re-descubre el bug.

**Feature genérica nueva (ej. telemetría de updates N3):**
nace como necesidad de un producto → se diseña contra el puerto en core → ambas apps la
exponen cuando les toque. Historia/ticket vive en el producto que la necesitó; el código
genérico aterriza en core desde el primer commit (R3: ya hay 2 consumidores conocidos).

**Feature específica (ej. changes-panel git de dev-studio):**
vive y muere en dev-studio. Consultio jamás la importa ni la copia. Si un día Consultio
necesita "ver diffs del engagement" → se evalúa lift del componente diff-viewer (la parte
genérica) al design system del core, y cada app lo monta en su contexto.

## 4. Anti-patterns (ban explícito)

- ❌ Copy-paste de archivo entre dev-studio y consultio (cualquier dirección, cualquier tamaño).
- ❌ "Lo copio ahora y después lo liftamos" — el lift ES ahora o la salida es (c) per-producto.
- ❌ Rama de consultio dentro del repo dev-studio ("fork liviano") — célula propia o nada.
- ❌ Core con lógica condicionada por producto (`if edition == …`) — eso es variación mal ubicada.
- ❌ Editar el vendored/import del core dentro de una app para "salir del paso" — upstream o nada
  (mismo ban que `_HARNESS-CORE.md`).
- ❌ Abstraer al core algo que solo un producto usa "por si acaso" (viola R3).

## 5. Gobernanza mínima (solo-operador, sin burocracia)

- `studio-core` lleva ledger propio (SC-NN) — 1 línea por lift/breaking change.
- Semver honesto: patch=fix, minor=aditivo, major=rompe puerto.
- CI del core corre su suite + (opcional, barato) smoke build de ambas apps contra HEAD
  del core — detecta breaks antes del tag.
- Cadencia de bump en apps: al arrancar historia nueva (no mid-story), salvo fix crítico.
