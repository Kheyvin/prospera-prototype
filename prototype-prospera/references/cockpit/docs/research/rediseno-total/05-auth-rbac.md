# SOTA — Auth + RBAC self-hosted para Cockpit (niveles de acceso por rol organizacional)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: Cockpit = binario Go único con UI web, en
> servidor del cliente PyME. 4 niveles — Gobernanza / Estratégico / Táctico / Operativo — cada
> usuario ve SOLO lo que su nivel/rol permite, en coherencia con la estructura organizacional
> (procesos/roles/puestos as-code del Repositorio Oficial). La jerarquía org ES la política de acceso.

## Panorama
2025-2026: IdPs externos mejores (Authentik maduró; Pocket ID = OIDC passkey-only en un binario Go)
pero consenso de que para apps chicas la auth embebida sigue siendo legítima — patrón dominante en
single-binary (Gitea, Grafana, Miniflux): auth local propia + OIDC opcional como cliente. En authz,
la ola Zanzibar (OpenFGA/SpiceDB) domina la conversación pero la crítica 2025 es unánime: ReBAC es
para grafos de permisos compartidos entre millones de objetos, no jerarquías fijas. En sesiones Go
no hay stdlib; `alexedwards/scs` es el estándar de facto (alineado OWASP).

## Comparativa
- **(a) Identidad.** Authentik = Python+Postgres+Redis (3+ contenedores); Keycloak = Java pesado;
  Zitadel pasó a AGPL (SaaS multi-tenant); Ory/Dex = piezas para ensamblar. Pocket ID operable por
  PyME (binario único, passkeys) pero passkey-only (sin fallback password, riesgoso en LatAm operativo).
  **Cualquier IdP externo duplica la superficie de ops de Cockpit entero → auth embebida gana.**
- **(b) Autorización.** Cerbos = PDP separado (viola binario único). OpenFGA embebible pero pagas
  modelo relacional + API de tuplas para expresar 4 niveles ordenados. Casbin embebible pero su DSL =
  **2ª fuente de verdad** junto al repo org — lo que quieres evitar. **Middleware propio ~200 líneas
  supera a los tres a esta escala.**
- **(c) Sesiones.** `scs/v2`: server-side (token opaco en cookie HttpOnly+Secure+SameSite),
  regeneración en login, timeouts idle+absoluto, 19 stores (incl. SQLite). Passwords argon2id
  (`x/crypto`). Passkeys opcionales vía `go-webauthn/webauthn`.
- **(d) Rol repo = rol de acceso.** Patrón correcto = **policy-as-data, no policy-as-code**: el repo
  (puestos/roles/niveles del objeto normalizado) es el Policy Information Point; el binario **compila**
  al arrancar una estructura de decisión en memoria (usuario→puesto→rol→nivel + mapa rol→recursos
  visibles). No escribes políticas: las derivas. Única adición al schema: campo de visibilidad por
  rol/nivel. **Trampa:** las credenciales (quién es) viven en la DB local, JAMÁS en el repo; el repo
  solo aporta el mapeo de autorización, enlazado por ID estable (email o ID de puesto).

## Recomendación
**Mínimo viable:** auth embebida — email+password (argon2id) + `scs` con store SQLite + middleware
`Authorize(user, acción, recurso)` que consulta la estructura derivada del repo. 4 niveles como enum
ordenado (Gobernanza > Estratégico > Táctico > Operativo) con herencia descendente donde aplique +
visibilidad fina por rol.
**Camino:** (1) esconder toda decisión tras esa única interfaz (si mañana amerita Casbin/OpenFGA
embebido, se cambia el interior sin tocar handlers); (2) modelo de usuario con campo `provider` desde
el día 1 para agregar OIDC como cliente (el que crezca enchufa Pocket ID/Authentik sin migración);
(3) passkeys como upgrade opcional.

## Qué diferir
IdP externo y SSO/SCIM; motores de políticas; ReBAC/permisos por documento; MFA-TOTP (passkeys lo
cubren); multi-tenancy; audit log granular.

## Fuentes (2026-07-08)
- State of Open-Source Identity 2025: blog.houseoffoss.com/... · Authentik vs Zitadel: wz-it.com/en/blog/...
- Pocket ID: pocket-id.org + cweagans.net/2026/03/... · alexedwards/scs · go-webauthn/webauthn
- Casbin RBAC with domains: casbin.apache.org/docs/rbac-with-domains/ · Embedding OpenFGA in Go: blog.amikos.tech/... · Oso, best authorization tools (2025)
