# checkpoint.md — schema-v2-hilo-de-oro-kinetica

```yaml
state: done
phase: CLOSED           # B audit APPROVED (a mano, hueco KIT — auditor responsable) · F merge 2026-07-17
started: 2026-07-17
developed: 2026-07-17
autonomous_mode: false
chris_verify:
  required: true
  signoff: { by: Chris, date: 2026-07-17, result: SATISFIED, notes: "«hemos hecho solo el backend» — correcto: service-story; el pintado del hilo = cruce-indicadores/brecha-proyecto (F1.1, ya en roadmap)", open_items: [] }
  rounds:
    - "paridad SC-12 como TestParidadSchema (Go lee YAML) en vez de gen_schema-compara-Go — ratificado vía spec/checkpoint"
    - "vocabulario case-insensitive + 2 canónicos + 7 sinónimos vía gobernanza RN-11 (hallazgo migración prenter)"
    - "migración prenter amplió: riesgos tipados + fuente empresa.yaml a enum (cita SUNAT en comentario)"
reconciled: true           # R 2026-07-17: spec matriz ✅ · 04-validators SC-12 grader corregido · cap api-objeto extend aplicado · sin deferred → cero historias spawneadas
tickets:
  T-1: done   # 0975ef5 — objeto.schema.yaml v2 + book (backbone O7, kpis.md, mejoras.md, §6-bis GPD)
  T-2: done   # bd99c25 — verbos.yaml (44) + gen_schema.py = 4º gate pre-commit
  T-3: done   # 9402444 — M41-M45 + dimensión mejora-proyectos → NOTACIONES regen (aditivo)
  T-4: done   # 38e7e17 — /api/objeto v2: 12 entidades + errors[] + máquina estados + verbos runtime
  T-5: done   # prenter@56266fe — shell migrado (29 kpis, 39 actividades) + live-verify 0E/0W
  T-6: done   # este cierre
```

## Evidencia por SC (todos verdes)

| SC | Evidencia |
|---|---|
| SC-1 | `TestObjetoV2Completo` + **live-verify fixture** (:4101, registry efímero HOME-override): 12 entidades, errors=[] warnings=[], hilo recorrible (kr.kpi_ref → kpi-dias-cobro · idea.promovida_a → pm-recordatorios · pm.estado en-ejecucion · medicion.unidad_ref empresa#u1 D-07) |
| SC-2 | `TestFormasV1Muertas` (3 errores nombran forma v2) + **prenter migrado EN VIVO**: GET :4100 /api/objeto?empresa=prenter → 0 errors · 0 warnings (antes: 15W). Migración = prenter@56266fe (repo hermano, pathspec empresa/, gate propio verde) |
| SC-3 | `TestKpiDuenoPersona` + **negativo EN VIVO**: write real dueño_ref→per-ana en fixture → GET → error "CK-24 · RN-8" observado → rollback |
| SC-4 | `TestRefsColgantesV2` — 9 refs colgantes, un warning nombrado c/u |
| SC-5 | `TestVerbosVocabulario` (sinónimo→sugerencia · desconocido · anti-gaming) + gate: verbo sin clase ALM×MGI → FALLA (test negativo en copia scratchpad) |
| SC-6 | gate real sobre copia manipulada: 6 errores (set-campo · entidad fantasma · nivel inválido · paridad transiciones rota · verbo sin clase ×2) → exit 1 |
| SC-7 | `TestDivergenciaDerivada`: payload marca divergente:true (12≠7); diff bytes del archivo = intacto |
| SC-8 | `TestSinAnclaDeValor`: warning, cero errors |
| SC-9 | `TestVerbosVocabulario`: "verbo sin provenance" (RN-13) |
| SC-10 | `TestCicloMejoraGobernado`: 8 transiciones tabla-driven (propuesto→cerrado ✗ · loop-back MASP ✓ · terminales) + cierre hard-saving sin fecha_post → ERROR RN-15 + estado inválido → ERROR |
| SC-11 | `TestDivorcioKrCompensacion`: mismo dato — okr-trimestral → ERROR RN-14 · gpd-anual → OK |
| SC-12 | `TestParidadSchema`: enums fuente/estado_proyecto/estado_idea/estado_brecha/modo_estrategia + transiciones completas Go↔objeto.schema.yaml · vocabulario cargado (44 canónicos, sinónimos case-insensitive) |
| NFR | `BenchmarkHandleObjeto500`: ~15ms por GET con 501 archivos (NFR < 1s: 67× margen) |

**Gates 4/4 exit 0** (arquitectura · metodo · roadmap · **schema nuevo**) + `go vet/test/build` verdes.
Nota gofmt: `portfolio.go` sin formatear = PRE-EXISTENTE (baseline, fuera de alcance — L3 tech-debt).
Nota "deprecad" en schema: 2 hits legítimos (valor de enum `estado_objetivo: deprecado` + la nota
"sin campos deprecados") — cero campos deprecados reales.

## Desvíos de spec (para R reconcile)

- **SC-12 paridad**: implementada como `TestParidadSchema` (Go lee el YAML — una fuente, dos
  consumidores) en vez de "gen_schema.py compara con Go" (parsear Go desde Python = frágil).
  gen_schema.py valida la coherencia interna del schema; el test Go valida el espejo. Misma
  garantía, mecanismo más robusto (03-arch D-A7 ya lo anticipaba).
- **Vocabulario**: match case-insensitive agregado (los humanos capitalizan — hallazgo de la
  migración prenter). +2 canónicos (construir, ejecutar) + 7 sinónimos es-419 entraron por la
  gobernanza RN-11 en este mismo PR (44 verbos total).
- **Migración prenter amplió**: riesgos string→tipados {desc} + fuente empresa.yaml a enum
  (cita SUNAT preservada en comentario) — datos v1 que el corte limpio delató.

## Qué verificar en G (Chris)

1. `cd go && go run ./cmd/directorio` → `http://localhost:4100/api/objeto?empresa=prenter` —
   0 errors, 0 warnings, rebanada `kpis` con 29 entidades migradas.
2. `sistema/metodo/NOTACIONES.html` en navegador — dimensión nueva "Proyectos de mejora e ideas
   del personal" (M41-M45) + todo lo aprobado intacto.
3. `sistema/schema/objeto.schema.yaml` — leer `acciones:` (la capa kinética) + las 3 entidades
   nuevas; `sistema/schema/verbos.yaml` — el vocabulario.
4. Los capítulos nuevos del book: `docs/metodo/objeto/{kpis,mejoras}.md` + `objetivos.md
   §6-bis` (modo regional GPD/BSC/OKR con fuentes).

## Audit (B — a mano, auditor responsable v5)

- Precondición `reconciled: true` ✓ · signoff SATISFIED leído · scope de rounds respetado.
- Gates 4/4 exit 0 re-corridos · `go vet/test/build` verdes (12 tests v2 + suite) · benchmark NFR.
- **Downstream**: único consumidor `/api/objeto` = `ui/lib/personas.ts` (lee personas/roles/
  warnings — campos nuevos aditivos, `errors[]` ignorado sin romper) · `tsc --noEmit` limpio ·
  vitest 32/32 · `validateNegocio` independiente (cero cross-consumo Go).
- **Connectivity (CONN)**: Consumed ✓ (/api/objeto vivo) · On-map ✓ (cap api-objeto extend,
  fichas +CK-21/CK-26) · Navigable ✓ (misma ruta GET) · Notarized ✓ (handler registrado + 4º gate
  cableado en pre-commit).
- Cat-12 mirror: cero duplicación (validador único extendido; gate patrón CK-17 reusado).
- **Veredicto: APPROVED.**

## Log

- 2026-07-17 · claim ready→developing · T-1..T-6 construidos y verificados en vivo (commits
  0975ef5 · bd99c25 · 9402444 · 38e7e17 · prenter@56266fe) · developed + AWAIT_CHRIS_VERIFY.
- 2026-07-17 · G: Chris SATISFIED ("solo backend — continuar") · R: reconciliada (validators
  SC-12 + cap + rounds) · B: APPROVED · F: merge → **done** · ficha **CK-26** (colisión CK-25
  con studio-core de sesión paralela, renumerada).
