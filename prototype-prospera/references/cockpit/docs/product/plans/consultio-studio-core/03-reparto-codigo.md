# Reparto de código — qué va al core, qué queda per-producto

> Fuente: scout read-only de `~/Proyectos/dev-studio` (2026-07-17). Estado del repo: build OK,
> 52 tests Go verdes, hexagonal estricta con fitness tests, ~9.200 LOC totales
> (~3.300 Go prod + ~1.800 Go tests + ~4.100 TS/TSX).

## → studio-core (kernel compartido)

| Path en dev-studio | LOC | Qué es |
|---|---|---|
| `internal/domain/arnes.go` | — | Modelo Arnes + lock + preámbulo |
| `internal/ports/arnes.go` · `ports/agent.go` | — | Contratos DIP (Sync/Catalog/Lock/Cache/Config · AgentPort/eventos) |
| `internal/usecase/arnes_service.go` | ~870 (bloque motor) | Motor: conectar/sync/instalar/desinstalar/rehidratar/inyectar |
| `internal/adapters/arneses/{cache,lockfile}/` | ↑ | Caché forma-plugin + lock as-code `.devstudio/arneses.yaml`¹ |
| `internal/adapters/registry/{fscatalog,gitsync}/` | ↑ | Catálogo marketplace (estándar ArnesIA) + clone/pull confinado |
| `internal/adapters/agent/claudecode/` | 448 | Driver Claude Code CLI: spawn, stream-json, tool-cards, transcript. BYO licencia |
| `internal/usecase/session_service.go` + toolcards | ~340 | Ciclo de vida sesión: spawn/turno/streaming/persist |
| `internal/adapters/store/` | 168 | Persistencia `state.json`, escritura atómica |
| `internal/adapters/transport/{http,sse}/` | ~900 | Router REST + broker SSE + `withLocalOnly`² |
| `transport/http/version.go` + `scripts/install.sh` | — | Updater self-rebuild + versión por ldflags |
| `web/src/shared/ui/` | ~890 | Design system (atoms, tool-card, modal, tabs) + Storybook — tokens parametrizables |
| `web/src/shared/{store,api}/` | ~709 | Zustand stores + cliente API + SSE |
| `web/src/widgets/session-view/` | ~307 | Vista de sesión conversacional |
| `web/src/widgets/overlays/` (roles/config) | parcial de 875 | Overlays de arneses/config — genéricos con slots |

¹ Renombrar el dir del lock a algo neutro (`.studio/arneses.yaml` o parametrizable por app).
² Rutas dev-specific del router se registran desde la app (composición), no viven en core.

## → queda en dev-studio (producto 1)

| Path | LOC | Por qué |
|---|---|---|
| `internal/domain/repo.go` | — | Taxonomía `historia·bug·hotfix·tarea·spike` → branches — semántica dev |
| `internal/adapters/git/cli/worktree.go` | parte de ~400 | Worktree/branch por sesión — modelo dev³ |
| `web/src/widgets/changes-panel/` | ~405 | Panel git (status/diff/log) — UI dev³ |
| `web/src/widgets/repos-rail/` | — | Rail repo-céntrico |
| Value-stream dev en `project.config.yaml` | — | Seam del producto |
| `.claude/` (kit 0.5.3) | — | Arnés de construcción del proyecto — se reinstala por célula, no se comparte como código |

³ Candidato a lift PARCIAL en F2 si F0 confirma "engagement = repo git": commit-por-pathspec
y primitivas git genéricas al core; la política de worktrees queda per-producto.

## → nace en consultio (producto 2)

| Pieza | Origen |
|---|---|
| Taxonomía engagement/paquete-de-trabajo/entregable | Nueva (espejo del rol de `repo.go`) |
| Value-stream M1→M2→M3 en su seam | `sistema/metodo/` (cockpit) como SSoT |
| Marketplace de arneses del método | Producidos en F0 (formato ya consumible por el motor) |
| Preview local de Cockpit (renderer N13) | Nueva — pieza diferencial de Consultio |
| Flujo publicación a N6 (dev→UAT→prod) | Nueva (CK-21/D5) |
| Branding/tokens | Sobre design system del core |

## Números para decidir

- **Reutilizable vía core: ~60-70% del Go + mayoría del design system/shell React.**
- Dev-only real: acotado y concentrado (~800-1.000 LOC entre taxonomía, worktree, changes-panel).
- Punto de decisión único pendiente: destino de la capa git (lo responde F0 — ver `02-fases.md`).
- Nota de riesgo (del scout): TBD conocidos en dev-studio — sin auth, sin multi-usuario,
  allowlist localhost sin token. Heredables por Consultio → decidir en F3 si el shell del
  consultor exige token de capacidad local (probable: sí, por transferencia a N19).
- Nota legal (del scout): "verificar Consumer Terms de Anthropic antes de vender instalables"
  — ya modelado en N8 (licenciamiento configurable, revisar por release); aplica idéntico a
  Consultio instalable.
