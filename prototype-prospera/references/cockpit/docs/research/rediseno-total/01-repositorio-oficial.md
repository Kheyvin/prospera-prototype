# SOTA — Repositorio Oficial confidencial (documentos + estructura + arneses), infra del cliente

> Investigación 2026-07-08 (rediseño CK-18). Contexto: repo confidencial en servidor/máquina DEL
> CLIENTE; guarda documentos oficiales versionados, metadata organizada (estructura org as-code),
> arneses por rol, y (futuro) know-how. Escritor = app colgada de Claude Code (commits, "deploy de
> procesos"); lector = binario Go (Cockpit) que renderiza por nivel de acceso. Decisión "BD vs
> archivos" = PENDIENTE (BL nuevo).

## Panorama (opciones vivas, 2026)
- **Forgejo** — fork comunitario de Gitea (Codeberg, non-profit); default 2026 para git self-hosted:
  binario Go único, ~400 MB RAM, SQLite, UI web, API, Actions.
- **Gitea** — ~idéntico a Forgejo; respaldo comercial. Elegible solo si se necesita ese ecosistema.
- **soft-serve (Charm)** — git server minimalista por SSH/TUI; sin UI web/API rica. Corto como
  "repositorio oficial".
- **Paperless-ngx** — archivo de escaneos (OCR+tags); consume PDFs, no autoría con fuente editable.
- **Mayan EDMS / OpenKM CE / Alfresco CE** — DMS pesados (Django/Java); overhead alto para PyME sin
  TI. Alfresco además en riesgo estratégico (Hyland desvió a cloud).
- **Nextcloud** — versionado con **poda automática** de versiones → no da historial auditable ISO.
- **MinIO** — muerto para community (features quitadas 2025, maintenance mode dic-2025, repo
  archivado feb-2026). Object storage no resuelve control documental por rol de todos modos.
- **QMS-as-code (patrón OpenRegulatory)** — markdown en git + PR-approval como firma; precedente
  real en medtech regulado (FDA/IEC 62304). Su límite ("no para usuarios no técnicos") no aplica:
  nuestros escritores son agentes y el lector humano usa Cockpit.

## Comparativa
| Opción | Versionado | Acceso por rol | Ops (PyME) | Veredicto |
|---|---|---|---|---|
| **Forgejo/Gitea** | Nativo, historial completo, firmable | 3 roles/repo + teams (grueso) | Binario único, muy bajo | **Base recomendada** |
| soft-serve | Nativo | 4 niveles planos | Trivial | Plan B minimalista |
| Paperless-ngx | Por documento, sin fuente | Grupos | Bajo (Docker) | No: archivo, no autoría |
| Mayan / Alfresco / OpenKM | Sí | Granular | Alto (+riesgo vendor) | Sobredimensionado |
| Nextcloud | Auto-podado | Compartición, no ISO | Medio | No como repositorio oficial |
| MinIO/objetos | Por objeto | Policies S3 | Proyecto archivado | Descartado |
| BD documental | A construir | A construir | Medio | Diferir |

## Recomendación
**Git como base de archivos (SSoT), servido por Forgejo en Docker en la máquina del cliente.**
1. **El escritor ya habla git.** La app colgada de Claude Code hace commits; "deploy de procesos" =
   commit + tag firmado. El historial git cumple ISO 9001 §7.5 de fábrica (quién/cuándo/qué; PR o
   tag = revisión/aprobación) — patrón validado en industrias reguladas.
2. **La limitación de roles de Forgejo es irrelevante:** el gatekeeper de lectura por nivel es
   **Cockpit** (binario Go), no el repo. Basta deploy-token read-only para Cockpit (API o `go-git`)
   y escritura solo para el publicador. Confidencialidad extra = repos separados por nivel.
3. **Todo el contenido es git-nativo:** YAML/JSON de estructura, arneses (texto), fuente de manuales.
   PDFs = artefactos derivados (generados en el publish o vía Actions; binarios pesados → LFS/releases).
4. **Ops mínimas:** un contenedor, SQLite, backup = `forgejo dump` + restic a disco externo/S3.

**Decisión "BD vs archivos":** archivos-en-git = fuente de verdad; cualquier BD es índice derivado
y reconstruible (SQLite/bleve dentro de Cockpit para búsqueda), NUNCA SSoT.

## Qué diferir
- Motor de índice/búsqueda en Cockpit (SQLite vs bleve) — hasta tener volumen real.
- Pipeline de PDF (publicador vs Actions) — con el primer cliente.
- Repos por nivel de confidencialidad — solo si un cliente lo exige.
- Know-how organizacional — ver informe 02 (diferir formato).

## Fuentes (2026-07-08)
- Gitea vs Forgejo 2026: contabo.com/blog/gitea-vs-forgejo · pkgpulse.com/guides/gitea-vs-forgejo-vs-gogs-...
- Forgejo Repository Permissions: forgejo.org/docs/v11.0/user/repo-permissions/
- QMS en GitHub/GitLab: openregulatory.com/articles/quality-management-system-qms-in-github-gitlab · intuitionlabs.ai/articles/git-workflows-fda-compliance
- MinIO: blocksandfiles.com/.../minio-users-complain-... · infoq.com/news/2025/12/minio-s3-api-alternatives/
- Nextcloud file versioning (poda): docs.nextcloud.com/server/latest/admin_manual/configuration_files/file_versioning.html
- EDMS OSS 2025: formkiq.com/blog/... · Alfresco roadmap: docuvela.com/2025/04/08/...
- charmbracelet/soft-serve
