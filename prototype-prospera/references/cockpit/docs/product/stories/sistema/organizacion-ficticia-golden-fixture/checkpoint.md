# checkpoint.md — organizacion-ficticia-golden-fixture

```yaml
state: done                       # F 2026-07-18: audit APPROVED (fix-loop cerrado) + capability publicada
phase: AUTONOMOUS                 # autonomous_mode: true ratificado (FIRMA 1, 2026-07-18) — G se saltó
autonomous_mode: true
chris_verify:
  required: false
  signoff: null
  rounds: []
reconciled: true                  # R 2026-07-18: spec matriz viva ✅ + delta duda 7 registrado + 03-arch D-A5 vigente vía scope_deltas; ledger diferido: push shells a remoto (host F1.3)
started: 2026-07-18
developed: 2026-07-18
tickets:
  T-1: done       # planta + paridad Go (RED→GREEN) — e26a513
  T-2: done       # gen_cobertura 15 tests mutación (14+1 exclusiones) — e26a513 · e5045f9
  T-3: done       # nichos RET/MFG + verbos 46 — 9cc2b38
  T-4: done       # terranova estructura 253 archivos, C1 completo — terranova@7550ef8
  T-5: done       # finanzas 100% + ciclo DSO — terranova@ec012ee (3 juicios ratificados)
  T-6: done       # GOLDEN 208/208 campos · 0 aristas — terranova@5816a7e
  T-7: done       # alameda 230 — alameda@aee98e0 + fix origen pm @420ba60
  T-8: done       # vulcano 277 — vulcano@18264b6 + fix origen pm @0c2faaa
  T-9: done       # registro extra_projects+kind client (chris-corp@8dc03fa,@c9fd917) · provenance
                  # por actividad ×232 (shells @3b4277a/@2ab21c1/@b0c27a0) · live-verify ×3 0E/0W ·
                  # flota 0 huecos · manifiesto · READMEs
scope_deltas:     # allowlist para el auditor (autonomous — cambios respecto del ready package)
  - "Registro vía extra_projects de chris-corp (NO sección empresas kind:client — el generador del
     holding lo prohíbe: client=CRM prenter I-39; las ficticias tampoco son cuentas). El kind:client
     firmado (duda 7) se honró como passthrough opcional en extras (gen_cockpit_registry +3 líneas,
     chris-corp@c9fd917) → portfolio las lista como client."
  - "gen_cobertura: enums_excluidos declarados (raci_letra/nivel_acceso/tipo_aprobacion — no
     observables en instancias; hallazgo T-5) — e5045f9."
  - "RN-13 en vivo exigió fuente/conf POR actividad (el seed lo pedía solo en casos especiales):
     232 inserciones heredando provenance del proceso (fix T-9)."
  - "pm sin origen (alameda ×2, vulcano ×1) violaban RN-18 → 3 ideas nuevas del funil los anclan
     (alameda@420ba60, vulcano@0c2faaa). La casuística warning-génica vive en tests, no en shells."
```

## Evidencia por SC

| SC | Evidencia (2026-07-18, binario :4100 real) |
|---|---|
| SC-1 | GET /api/objeto ×3: terranova 331 inst · alameda 230 · vulcano 276 — errors 0 · warnings 0 los tres · portfolio lista 8 empresas con las 3 `kind: client` |
| SC-2 | flota: `campos 208/208 · huecos: 0` exit 0 + manifiesto generado · mutación copia real (quitar persona.sin_kpi + idea.promovida_a_ref) → huecos nombrados exactos (campo ×2 + arista ×1) · suite test_gen_cobertura 15/15 |
| SC-3 | aristas 23/23 ejercidas (verificador) · cadena viva: actividad pr-cobranza#a1 → kpi-dso → obj-anual-caja-sana#kr1 (kpi_ref) → cascada hasta obj-proposito · mediciones cortan por empresa#u1/u2 |
| SC-4 | reparto 3 modos verificado por gen_cobertura (mixto=T · okr=A · gpd=V) · acople true solo T(mixto)/V(gpd) — 0 errors en vivo lo prueba (RN-14 activo) |
| SC-5 | pr-venta-tienda medido por sucursal+franquicia (A) · KPIs T por obra ×2 · tipo_unidad 5/5 flota (planta en V) |
| SC-6 | provenance: T 46% share máx · A 53% · V 53% — todos <70%, ≥4-6 fuentes, 0 Inferido×alta (verificador + reporte builders) |
| SC-7 | enums flota 0 huecos ⇒ estado_proyecto 12/12 · estado_idea 5/5 · metodologia 4/4 · beneficio 4/4 · cadena movio (pm-reduccion-dso resultado Δ-30) · divergente ×2 (kpi-caja#m24, kpi-avance-obra#m8) · loop-back MASP (pm-reduccion-scrap-masp#h6) |
| SC-8 | latencia GET terranova (332 archivos): 0.018s ≪ 1s (medido frío tras restart) |

## Gates repo cockpit
pre-commit 5/5 verdes en cada commit (arq · metodo · roadmap · schema · componentes) · go test verde · suite verificador verde.

## Auditoría Fase B (2026-07-18 · 3 auditores adversariales paralelos) → APPROVED tras fix-loop

- **A · casuística vs shells** (48 filas C1-C8 auditadas campo-por-campo + barridos mecánicos flota:
  RACI A==1 100%, accountable 100%, refs bidireccionales 5/5, 12/12 estados): 38 limpias · 4 MEDIA
  + 2 BAJA + 6 derivas de matriz. **Todo corregido**: banda sin umbral_amarillo (kpi-ausentismo V) ·
  idea de contratista (idea-orden-almacen-obra T) · ROI normalizado neto (B−I)/I en 9 pm + 2
  paybacks a convención · ramp-up u10 585→640 (claim=banda) · comentario DSO quick-wins · matriz
  03-arch anotada con aterrizajes reales.
- **B · código + downstream** (todo verde incl. **prenter 0E/0W sin regresión**; walker verificado
  empíricamente correcto): 4 MEDIA + 3 BAJA. **Todo corregido**: filtrar_area contra el CONTRATO
  del schema (test RED→GREEN brecha-vs-capability) · provenance RN-19 cuenta per-shell ·
  --dimensiones (gate golden per-shell ejecutable: 208/208 exit 0) · tests arista anidada+compuesta
  · exit 2 shell inexistente · guard basename duplicado · manifiesto declara enums gemelos ·
  validación extras chris-corp. Upstream → L3: TD-1/TD-2/TD-3 (tech-debt.md).
- **C · ficción/idioma/nichos** (507 personas, ~130 nombres, 11 unidades de nicho): 0 críticos/altos
  · 4 BAJA + 4 INFO. **Corregido**: verificação→verificación · Banco del Pacífico Sur→Banco
  Interandino · 6 apellidos andinos redistribuidos a jefaturas (dignidad) · sabor Falconi
  documentado en README Vulcano. RN-20 ✓ (RUC/emails/teléfonos ficticios canónicos, 0 colisiones
  confundibles, 0 filtración control-plane) · es-419 0 voseo · nichos 0 alucinación.
- **Cierre post-fix**: suite 17/17 · flota 208/208 0 huecos · gate golden exit 0 · live 0E/0W ×3.
