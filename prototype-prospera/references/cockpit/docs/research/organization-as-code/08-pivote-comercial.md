# Pivote comercial — cloud gestionado como default (CK-21 D3/D4)

> Investigación CK-21 (2026-07-15/16) — visión "organization as code → organization twin". Parte del corpus `docs/research/organization-as-code/` (ver README).

## El problema (operador, 2026-07-15)

"Se me está haciendo difícil por el tipo de clientes que tengo que me paguen toda la consultoría de construcción de infraestructura para sostener el centro de comando." La instalación self-hosted (Forgejo + lakehouse + binario + backups en servidor del cliente) es consultoría de infra ANTES del valor — mata el time-to-value en PyME.

## La decisión (contra la propuesta multitenant inicial)

La propuesta inicial del operador: SaaS multitenant con login/pago/descargas/licencias. Análisis CEO/CTO concluyó: el fix mínimo NO es reescribir Cockpit multitenant — es **hostearlo nosotros, single-tenant por cliente**: una instancia aislada (Forgejo + Cockpit + lake) por cliente, en nuestra nube, cobrada como suscripción. Mismo código, cero reescritura, nosotros absorbemos la operación. Camino GitLab/Grafana: cloud gestionado primero, multitenancy real cuando haya 10-20 clientes y duela el costo por instancia. D3 de CK-18 ya preveía "hosteado por nosotros como opción de pago" — CK-21 invierte ese default. Cockpit hoy es binario read-only sin auth ni DB; multitenancy real (aislamiento por tenant, cifrado por tenant, RBAC, audit, DDQ de seguridad) para un equipo de una persona = meses sin vender.

## Consecuencias reconocidas (reversión parcial del chequeo 2 de NODOS)

- La promesa "transitan, no persisten" muere en el default hosteado: los datos del cliente SÍ residen en nuestra nube, bajo DPA. Éramos nivel 3-5 del espectro de protección (dato en infra del cliente); el default hosteado baja a contractual+técnico (aislamiento por instancia, cifrado; BYOK para tier alto).
- Nos volvemos **procesadores de datos personales** (organigramas, personal, accesos) — DPA/compliance cae sobre nosotros. Presupuestarlo.
- **Self-hosted NO muere**: queda como tier enterprise/regulados — la respuesta cuando un banco pregunte por soberanía (validado por edgeTI: on-prem/air-gapped es categoría viva).
- El chequeo 2 de NODOS.md debe reescribirse (deuda declarada en CK-21).

## Portal (N3 crece a producto — D4)

Login, cobro, gestión de usuarios/asientos, descargas (DevStudio/Colab/Consultio/Arnesia), licencias por asiento.

**Licenciamiento: fingerprint compuesto, NO MAC.** MAC es spoofeable, cambia con VM/Docker/WiFi-vs-ethernet, laptops tienen varias interfaces. SOTA: fingerprint compuesto (CPU+disco+placa, hasheado SHA-256 client-side) con licencias node-locked, activación/desactivación de máquinas, heartbeat — keygen-go (ya en la ficha N3) lo da. Estratégico: el control real de asientos es licencia+telemetría, no DRM duro (castiga al legítimo, no detiene al decidido).

## Accesos derivados de la estructura (idea del operador, con guardrail)

El sistema puede nutrirse de sistemas del cliente (RRHH) para asociar accesos a roles/personas según el organigrama. Guardrail firmado: **human-in-the-loop siempre** — la estructura PROPONE, un humano (Analista de Calidad/N19) APRUEBA. Aprovisionamiento ciego desde organigrama posiblemente stale = bloquear al gerente o dar acceso al que renunció ayer (patrón identity governance).

## Entornos: un repo, 3 ramas (D5)

El operador propuso 3 "repositorios" (development/UAT/producción). Firmado: **un repo por organización con 3 entornos** (branches dev/UAT + main vigente + tags de copias controladas, promoción por aprobación = Gestión de Cambios). Tres repos separados romperían la historia, harían dolorosa la promoción y triplicarían credenciales. El modelo dev/UAT/prod ES la Gestión de Cambios ISO con otro vocabulario — y es el gate de calidad que hace viable el "a prueba de tontos" (cualquiera comitea a dev; a prod solo llega lo aprobado).

## Riesgos que persisten

- BYO-licencia Claude: el portal no elimina que cada usuario de Consultio/Colab necesite su suscripción Claude Code en su laptop (ToS N8, cambió 3× en H1-2026). La fricción de onboarding se muda, no desaparece — al modelo de costo por asiento.
- "A prueba de tontos" sin provenance + gate = mapas basura (garbage-in). Mitigación: provenance obligatorio (M23) + pipeline dev→UAT→prod + Gestión de Cambios en el MVP.
- Consultio no existe; su plan era "esperar a DevStudio" (BL-15). CK-21 D7 lo desbloquea: primer entregable = arneses del método sobre Claude Code pelado.
