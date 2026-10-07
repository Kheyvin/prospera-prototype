# research/rediseno-total/ — SOTA del rediseño (insumo de CK-18)

Siete investigaciones state-of-the-art (2026-07-08) que informan el rediseño de fondo del ecosistema
Cockpit (operador, sesión CK-18): el sistema deja de ser BYOC-con-motor-server-side y pasa a
**Fábrica de software (Plano del Fabricante) + Organización instalada** — el método SE ENTREGA al
cliente empaquetado en arneses; el consultor construye el mapa completo como un dev construye
software y lo publica a un Repositorio Oficial confidencial en infra del cliente; Cockpit cruza
estructura organizacional × operación (Data Lakehouse) y sirve por niveles de acceso.

Cada informe: panorama de opciones vivas 2026 · comparativa · recomendación opinada para nuestro
contexto · qué diferir · fuentes con fecha de consulta.

- [`01-repositorio-oficial.md`](01-repositorio-oficial.md) — repo confidencial (docs+estructura+
  arneses) en infra del cliente. **Veredicto: git como base de archivos (SSoT), Forgejo self-hosted;
  BD = índice derivado, nunca SSoT.**
- [`02-knowledge-database.md`](02-knowledge-database.md) — know-how tácito por rol al arnés.
  **Veredicto: knowledge-as-code (markdown+frontmatter) en el repo, files-first/agentic retrieval;
  captura vía skill de cristalización con PR; RAG híbrido solo al crecer.**
- [`03-data-lakehouse.md`](03-data-lakehouse.md) — operación de todos los sistemas → nutre Cockpit.
  **Veredicto: dlt (ingesta) + DuckLake/DuckDB (catálogo SQLite→Postgres), DuckDB embebido en el Go;
  Excel como fuente de primera clase; cron/systemd, sin K8s.**
- [`04-distribucion-licencias-telemetria.md`](04-distribucion-licencias-telemetria.md) — Plano del
  Fabricante. **Veredicto: GitHub privado como plano único; go-tuf v2 + TUF-on-CI (binario), Tauri v2
  updater (apps), marketplace privado por cliente (arneses, revocable), license files Ed25519 offline,
  OTLP/mTLS opt-in por tenant.**
- [`05-auth-rbac.md`](05-auth-rbac.md) — niveles de acceso en Cockpit. **Veredicto: auth embebida
  (argon2id + scs/SQLite) + middleware propio; policy-as-data derivada del repo (el rol org ES la
  política); campo `provider` para OIDC futuro.**
- [`06-gestion-cambios-iso.md`](06-gestion-cambios-iso.md) — módulo del Analista de Calidad.
  **Veredicto: git de backend + UI que oculta git; entidades CR/Versión/Aprobación/Acuse/Revisión;
  firma persistida en DB además de git; el analista jamás ve git.**
- [`07-proceso-como-arnes.md`](07-proceso-como-arnes.md) — la apuesta central. **Veredicto: runbook
  agéntico (skill=procedimiento, plugin=rol, marketplace=mapa de procesos); nadie vende el pipeline
  completo discovery→mapa→arnés (hueco competitivo real); anti-drift = compilar doc y arnés desde el
  objeto normalizado (SSoT), nunca editar el arnés a mano.**
