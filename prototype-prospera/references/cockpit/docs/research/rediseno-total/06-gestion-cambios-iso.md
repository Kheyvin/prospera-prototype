# SOTA — Gestión de Cambios estilo ISO 9001 en Cockpit (módulo del Analista de Calidad)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: módulo "Gestión de Cambios" de Cockpit. El
> Repositorio Oficial (procesos/manuales/estructura as-code) lo construye el consultor; al cerrar el
> engagement un ANALISTA DE CALIDAD del cliente lo mantiene — recibe solicitudes de cambio, revisa/
> aprueba y publica versiones desde una vista propia del Cockpit, siguiendo ISO (info documentada
> §7.5, gestión del cambio §6.3).

## Cómo lo hace la industria
Los eQMS (Qualio, Greenlight Guru, QT9, Dot Compliance) convergen:
1. **Documento controlado con metadatos obligatorios**: ID único, revisión, fecha efectiva, owner,
   aprobador, tabla de historial (qué cambió, por qué, quién aprobó).
2. **Change Request como entidad separada del documento**: solicitud con razón + análisis de impacto →
   routing de aprobación por rol → firma electrónica con timestamp → publicación con fecha efectiva.
3. **Ciclo de vida explícito**: borrador → en revisión → aprobado → vigente → obsoleto. Al publicar,
   la anterior se obsoleta *automáticamente* (el auditor verifica que sea imposible usar la obsoleta).
4. **Distribución controlada + "read & acknowledge"**: notificación a afectados, acuse registrado
   (persona × versión × timestamp), a veces ligado a training. + revisión periódica programada (anual).
5. **Audit trail inmutable** consultable sin arqueología.

## El paralelo git/PR: viable, con límites conocidos
Se aplica formalmente. GitHub lo documenta como marco de compliance: PR = razón+autoría+aprobación+
verificación; CODEOWNERS = matriz de aprobadores; branch protection "aprobador ≠ autor" = segregación.
Contraejemplo vivo: el equipo CSC del NHS mantiene su QMS en GitHub y pasó 3 auditorías ISO 13485.
**Pero** OpenRegulatory se retractó, y sus razones son oro: (1) usuarios no técnicos no aprenden git/
markdown; (2) tablas/matrices en markdown son inmanejables; (3) el flujo PR exige disciplina y no hay
edición colaborativa; (4) aprobación de PR como firma electrónica es discutible (fatal para FDA Part
11; para ISO 9001 basta *si el procedimiento define* que ese clic autenticado constituye aprobación);
(5) el auditor necesita ver "el documento vigente" sin navegar commits. Ojo: logs de GitHub retienen
máx 400 días — el audit trail no puede depender solo de la plataforma.

## Recomendación para el módulo del Cockpit
Git = backend correcto (ya son as-code) y da gratis lo que los eQMS cobran (versionado, diff,
trazabilidad). Construir SOLO lo que git no da — y **el analista jamás ve git**.

**Entidades mínimas:** `SolicitudDeCambio` (CR-NN: documentos afectados, razón, impacto §6.3 —
propósito/consecuencias/recursos/responsabilidades—, estado, solicitante) · `VersiónDeDocumento`
(rev, estado borrador/vigente/obsoleto, fecha efectiva) · `Aprobación` (identidad autenticada, hash
del contenido, timestamp, significado de la firma) · `Acuse` (persona × versión × timestamp) ·
`RevisiónPeriódica` (fecha programada por documento).

**Flujo mínimo:** CR desde la vista del analista → branch automático → edición vía **formularios de
la UI** (nunca YAML crudo) → aprobación en UI = PR approval + registro de firma persistido **también
en la DB del Cockpit** (no solo en git) → publicar = merge + tag semver con fecha efectiva →
obsolescencia automática de la anterior → notificación + acuse. Convención: `main` = solo vigente;
tags = copias controladas; borradores = branches. Vista de auditor: documento vigente + historial +
evidencia de aprobación en UNA pantalla, cero comandos.

No copiar el eQMS completo (CAPA, training management, quizzes): el mínimo auditable ISO 9001 =
metadatos + aprobación previa a publicación + control de obsoletos + acuse + revisión periódica.

## Fuentes (2026-07-08)
- GitHub Blog — traceability con PRs (2023-07-11) · OpenRegulatory — "no longer recommend GitHub/GitLab as QMS" (2023-05, act. 2024-10)
- GSTT-CSC/QMS-Template (NHS en GitHub, activo 2025-2026) · AuditsReady ISO 9001 Document Control (2026-05-07)
- QT9 ISO 9001 Document Control (2025-11-24) · IntuitionLabs git para FDA/62304 (2025-08-26) · Qualio document version control (2026)
