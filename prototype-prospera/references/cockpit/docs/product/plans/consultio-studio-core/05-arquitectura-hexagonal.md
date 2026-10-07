# Arquitectura hexagonal — studio-core + consultio (revisión técnica + diseño ejecutable)

> **Fecha:** 2026-07-17 · **Autor:** revisión técnica autónoma sobre el plan (README/01-04)
> **Método:** stress-test del plan forzando escenarios de fallo contra el código real de
> `~/Proyectos/dev-studio` (ports, domain, usecase, cmd leídos verbatim) → cada fallo
> confirmado produce una decisión de arquitectura (A-NN) + un validador (V-NN).

## 1. Escenarios de fallo forzados (qué rompe el plan tal como está escrito)

| # | Escenario | Veredicto | Evidencia |
|---|---|---|---|
| E1 | **`internal/` no importable cross-módulo.** Go prohíbe importar `internal/...` desde otro módulo. TODO el código candidato a core vive en `dev-studio/internal/`. "Mover paquetes" tal cual (02-fases §F2.2) → consultio no compila. | CONFIRMADO — el plan no lo menciona | layout `internal/{domain,ports,usecase,adapters}` |
| E2 | **Semver sin remote.** R5: "el go.mod comiteado SIEMPRE referencia versión tageada". No existe remote publicado para `studio-core` → `go get` falla; clone fresco irreproducible. | CONFIRMADO | no hay repo remoto; GOPROXY no resuelve |
| E3 | **Sesión acoplada a taxonomía dev.** `domain.Session` embebe `RepoID`, `Historia *domain.Historia`, `Branch`; `SessionService.resolveArnes` va keyed por `repoID`. Extraer la sesión arrastra `historia·bug·hotfix` al core (acoplamiento falso, viola R4) o rompe la resolución de arneses. | CONFIRMADO — el crux | `domain/session.go:29-33` · `usecase/session_service.go:65,216-218,228` |
| E4 | **Paths de producto en el kernel.** Lock as-code escribe `.devstudio/arneses.yaml` (nombre de producto) en el repo del usuario; state/caché/registry van a `~/.dev-studio/`. Consultio escribiría dirs ajenos. | CONFIRMADO (mitigado a medias: main.go ya inyecta la mayoría) | `ports/arnes.go:37-42` · `cmd/dev-studio/main.go:49-93` |
| E5 | **Router con servicios dev horneados.** `httptransport.NewRouter(sessions, repos, git, arneses, broker, deps)` exige RepoService y GitService — consultio no los tiene. | CONFIRMADO | `cmd/dev-studio/main.go:87` |
| E6 | **Driver spawnea `claude` real en tests/verify.** Consume licencia, no determinista, cuelga CI. | CONFIRMADO (riesgo operativo) | `SpawnOpts` → CLI real; flag `-claude-bin` ya existe |
| E7 | **Design system npm sin registry.** Paquete npm del core no publicable hoy → consultio web no resuelve. | CONFIRMADO | no hay registry npm propio |
| E8 | **Updater/versión con identidad de producto.** `version`/`BinPath`/`install.sh` asumen binario `dev-studio`. | CONFIRMADO | `main.go:31-35,93` |
| E9 | **Builds fantasma sin go.work.** Editar core + app sin workspace → la app compila contra el module cache viejo. | CONFIRMADO (R5 ya lo cubre; falta materializarlo) | — |
| E10 | **Core sin gate propio → re-absorbe producto.** Sin fitness test en el core, cualquier sesión futura puede meterle `if producto` o un import dev. El fork silencioso vuelve por atrás. | CONFIRMADO (el plan lo pone en dev-studio F1, no en el core) | — |
| E11 | **Marketplace vacío = app hueca.** Motor de arneses sin catálogo → consultio primitivo no demuestra nada. | CONFIRMADO | formato ya existe: `~/Proyectos/marketplace-arneses/` (catalogo.json + plugins/{id}/{ver}/.claude-plugin) |

## 2. Decisiones de arquitectura (A-NN)

### A1 — Paquetes públicos en el core (responde E1)
`studio-core` expone paquetes en la raíz del módulo: `domain/ ports/ usecase/ adapters/...`.
Nada del kernel vive en `internal/` (los productos DEBEN importarlo). Lo que sea privado del
core (helpers de test, etc.) sí puede ir a `internal/`.

### A2 — `replace` local comiteado como transición (responde E2, E9)
Hasta que exista remote (Forgejo/GitHub): `go.mod` de la app lleva
`require github.com/alpacapurpura/studio-core v0.x.y` + `replace … => ../studio-core`.
Reproducible con la convención "repos hermanos bajo el mismo padre" (ya doctrina R5).
Tag git local en el core marca cada versión. **Deuda registrada:** al publicar remote,
borrar `replace` y volver a R5 puro. go.work opcional encima (no comiteado).

### A3 — Sesión genérica: la taxonomía es DATO para el core, SEMÁNTICA para el producto (responde E3)
El core NO conoce historia/bug/engagement/entregable. `domain.Session` del core:

```go
type Session struct {
    ID, Nombre, Cwd string
    Status Status
    ProviderSessionID string            // ex ClaudeSessionID (JSON estable)
    Model, Rol, Workspace, Modo string
    Contexto map[string]string          // ligadura del producto, OPACA para el core
    Conv []Turn
}
```

- dev-studio (cuando migre): `Contexto = {repo_id, historia_id, historia_titulo, tipo, branch}`.
- consultio: `Contexto = {engagement, paquete, entregable}`.
- Resolver de arneses re-keyed: `SetArnesResolver(func(s domain.Session, rol string) (ArnesInjection, error))`
  — el closure del producto lee de `Contexto` lo que necesite. El core solo lo invoca.
- La UI agrupa/etiqueta leyendo `Contexto` (presentación), sin switch por producto en el core.

### A4 — Identidad de app inyectada (responde E4, E8)
Un solo struct de composición en el core:

```go
type AppInfo struct {
    Name string      // "consultio" | "dev-studio"
    LockDirName string  // ".consultio" | ".devstudio" — dir del lock as-code en el repo destino
    DataDir string   // ~/.consultio
    Version, BuildDate, BinPath string
}
```

Todos los adapters reciben paths/nombres desde acá (ya era el patrón de main.go — se formaliza).
Cero literal "devstudio"/"consultio" dentro del kernel (validador V3).

### A5 — Router composicional (responde E5)
El core arma SOLO las rutas genéricas (sesiones, turnos, transcript, arneses/registry,
version, `/events` SSE) y devuelve el mux para que la app monte las suyas:

```go
api := coretransport.NewRouter(sessions, arneses, broker, deps) // rutas core
api.Handle("/api/engagements", ...)                             // rutas del producto (app)
```

`withLocalOnly` (middleware) queda en el core — es genérico. Las rutas de repos/git/worktrees
son PRODUCTO dev-studio y se quedan allá (se montan igual que consultio monta las suyas).

### A6 — AgentPort con doble de pruebas (responde E6)
El puerto ya existe. Se agrega al core un **fake ejecutable** (`adapters/agent/claudecode/testdata/fake-claude.sh`
o binario Go de test) que emite stream-json válido → suite y live-verify corren sin licencia ni red.
El spawn real queda para smoke manual (BYO licencia, doctrina N8).

### A7 — UI del primitivo: mínima propia, design system diferido (responde E7)
Consultio v-primitiva sirve una UI mínima embebida (go:embed, HTML+JS vanilla contra la API core).
La extracción del design system React a paquete npm queda como fase propia (F2.5) cuando haya
registry/workspace npm. **Prohibido** copiar componentes de dev-studio (ban R2) — la UI mínima
es descartable y no clona nada.

### A8 — Fitness gate EN el core desde el commit 1 (responde E10)
`arch/fitness/` en studio-core con test Go (go/parser sobre los imports de cada paquete):
- allowlist: stdlib + `github.com/alpacapurpura/studio-core/...` + deps declaradas.
- ban de identificadores/paths de producto: `devstudio|consultio|historia|worktree|repo_service`.
El F1 del plan (fitness en dev-studio) sigue vigente y es COMPLEMENTARIO (marca la frontera
del lado del producto).

### A9 — Extracción por COPIA, no move; dev-studio migra en su propia sesión (ajusta F2.3)
La extracción copia los paquetes al core (adaptándolos A1-A5). dev-studio conserva su código
hasta su sesión de migración (célula propia, ledger DH-NN, su arnés). El criterio "cero código
duplicado core↔producto" de F2 se cumple AL CERRAR esa migración, no antes. El ban de mirror
es producto↔producto — la duplicación transitoria core↔origen es el estado intermedio inevitable
y queda fichada como deuda con dueño.
**Razón:** no desestabilizar un repo activo desde una sesión de otra célula; el primer
consumidor real del core pasa a ser consultio (invierte F2.3 sin romper su espíritu: la suite
portada del core + el build de consultio son la definición de extracción correcta).

### A10 — Marketplace del método como seam de datos (responde E11)
El primitivo apunta su registry a un marketplace local con ≥1 arnés del método
(formato `catalogo.json + plugins/{id}/{version}/.claude-plugin/` que `fscatalog` ya lee).
SSoT del contenido del método: `cockpit/sistema/metodo/` (los arneses F0 se producen allá).

## 3. Reparto final (ajusta 03-reparto con lo aprendido)

studio-core (módulo Go `github.com/alpacapurpura/studio-core`):
```
domain/       arnes.go · session.go (genérica A3) · rutas.go (si es genérico)
ports/        arnes.go · agent.go · store.go
usecase/      arnes_service.go · session_service.go
adapters/     agent/claudecode · arneses/{cache,lockfile¹} · registry/{fscatalog,gitsync}
              store · transport/{http²,sse}
arch/fitness/ imports_test.go (A8)
```
¹ lockfile parametrizado por `AppInfo.LockDirName`. ² solo rutas genéricas (A5).

Queda en dev-studio: `domain/{repo,git}.go`, `usecase/{repo,git}_service.go`, `adapters/git/`,
rutas repos/git del router, web completo (hasta F2.5).

Nace en consultio: `internal/domain/engagement.go` (engagement→paquete→entregable, espejo del
rol de repo.go), `internal/usecase/engagement_service.go`, rutas producto, UI mínima, main.go
que compone core + producto.

## 4. Validadores (auto-impuestos, corren antes de declarar nada "listo")

| V | Qué | Cómo |
|---|---|---|
| V1 | Core compila + suite portada verde | `cd studio-core && go build ./... && go vet ./... && go test ./...` |
| V2 | Fitness core sin producto | test A8 verde; falla si un paquete core importa semántica de producto |
| V3 | Cero identidad hardcodeada | grep `dev-studio\|devstudio\|consultio` en core (fuera de docs/tests) = 0 |
| V4 | Consultio compila + su suite verde | `cd consultio && go build ./... && go vet ./... && go test ./...` |
| V5 | Live-verify REAL del primitivo | binario corriendo: POST engagement · GET arneses (catálogo método ≥1) · POST sesión ligada a engagement · turno con agente fake → frames SSE observados + state.json con efecto + logs |
| V6 | dev-studio intacto | `git -C ~/Proyectos/dev-studio status` limpio (salvo F1 explícita); su suite sigue verde |

## 5. Desviaciones del plan original (para ratificación del operador)

1. **A2:** `replace` local comiteado (R5 pedía require puro tageado) — hasta que haya remote.
2. **A9:** primer consumidor = consultio, no dev-studio; migración de dev-studio = sesión
   propia en su célula. La duplicación transitoria core↔dev-studio queda fichada como deuda.
3. **A7:** design system npm diferido; primitivo con UI mínima propia.
4. El shell de Consultio se adelanta respecto del trigger de F2 ("necesidad real") por
   directiva del operador (goal 2026-07-17: "consultio ejecutándose en su versión más
   primitiva").
