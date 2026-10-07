# SOTA — Plano del Fabricante: distribución, updates, licencias, telemetría (vendor unipersonal)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: distribuir/actualizar/licenciar/monitorear una
> flota de apps instalables (apps de escritorio sobre Claude Code local: consultor, Colab Studio,
> Dev Studio, Arnesia) + binario Go Cockpit + paquetes de arneses (skills Claude Code). Dos audiencias:
> nuestros consultores (siempre) y clientes con contrato de mantenimiento (opt-in).

## Panorama
Patrón dominante para micro-vendors 2025-2026: GitHub privado como plano de distribución único,
firmas por pull (TUF u opciones ligeras minisign/Sigstore), updaters nativos del framework de
escritorio, licencias offline-first con archivos firmados Ed25519, OTel Collector como frontera de
telemetría del lado cliente. Novedad: "git auth = control de acceso" es el canal privado estándar
(los marketplaces de Claude Code lo adoptan) — colapsa distribución + acceso por cliente + revocación
en un mecanismo que ya operas.

## Por pieza
- **Binario Go (Cockpit).** TUF sigue SOTA, pero usar **go-tuf v2** (v0.7 deprecado) y operar la raíz
  con **TUF-on-CI** sobre GitHub Actions (caso "baja frecuencia, un mantenedor"; Sigstore lo usa en
  prod). Fallback honesto si TUF pesa: cosign/minisign + GitHub Releases. Ya hay diseño → consérvenlo.
- **Apps de escritorio.** Si Tauri: **Tauri v2 updater** (firma minisign obligatoria, pull contra JSON
  estático en Releases/CDN). Electron autoUpdater solo si ya en Electron. Sparkle = macOS-only,
  descartar para multiplataforma. Velopack = comodín.
- **Arneses (plugins Claude Code).** Marketplaces privados SÍ sirven como canal por cliente: repo git
  privado con `marketplace.json`; acceso = el del git host (SSH/PAT/deploy key); revocar credencial =
  cortar mantenimiento (mapea 1:1 con opt-in). `autoUpdate` configurable + pinning por commit SHA.
  Ojo bug #52218 (autoUpdate no refresca `installed_plugins.json` → hooks viejos) — verificar.
- **Licencias.** **Keygen CE** self-host existe (Docker+Postgres+Redis, Fair Core, Ed25519 offline)
  pero sin UI oficial y sobreingeniería hoy. **License files Ed25519** firmados con `crypto/ed25519`
  stdlib (patrón keygen-go) cubren lo esencial sin servidor. License files > cuentas para on-prem.
- **Telemetría.** OTLP + mTLS por tenant SIGUE SOTA (blog OTel 2025: routing connector por tenant,
  cert-manager para rotación). Opt-in natural: el collector vive en el cliente y solo exporta si
  tiene exporter+cert. **OpAMP** (gestión de flota) emergente pero beta — vigilar, no adoptar.

## Recomendación integrada — Plano del Fabricante mínimo viable
1. GitHub org privada = plano único: binario como targets TUF (TUF-on-CI + go-tuf v2), instaladores de
   apps vía Tauri v2 updater (endpoint JSON por canal: `consultores` siempre-verde, `clientes` estable).
2. Arneses: dos clases de marketplace — interno `autoUpdate:true` (consultores) y por cliente-con-
   mantenimiento con deploy key revocable. Cliente auto-mantenido: bundle entregado una vez, sin credencial.
3. Licencias: license file Ed25519 por instalación; Cockpit y apps validan offline; el endpoint de
   updates lo exige como gate.
4. Telemetría: OTel Collector en el cliente (opt-in) → gateway OTLP/mTLS propio, un cert por tenant.
   Empezar solo con Cockpit server.

## Qué diferir
OpAMP y fleet-management UI; Keygen CE (cuando pasen de ~10 clientes o entitlements dinámicos); delta
updates y staged rollouts; portal de descargas; telemetría de apps de escritorio.

## Fuentes (2026-07-08)
- go-tuf v2: github.com/theupdateframework/go-tuf · TUF-on-CI: github.com/theupdateframework/tuf-on-ci · Sigstore root-signing
- Tauri v2 updater: v2.tauri.app/plugin/updater/
- Claude Code marketplaces: code.claude.com/docs/en/plugin-marketplaces · org managed: support.claude.com/en/articles/13837433 · bug: github.com/anthropics/claude-code/issues/52218
- Keygen self-host: keygen.sh/docs/self-hosting/ · github.com/keygen-sh/keygen-go
- OTel Collector + Gateway + mTLS (2025): opentelemetry.io/blog/2025/expose-otel-collector-gateway-api/ · OpAMP spec · Velopack: velopack.io
