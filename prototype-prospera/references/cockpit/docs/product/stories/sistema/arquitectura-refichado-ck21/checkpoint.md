# checkpoint — arquitectura-refichado-ck21

```yaml
state: done
phase: CLOSED
started: 2026-07-17
closed: 2026-07-17
tickets_done: [T-1, T-2, T-3, T-4, T-5, T-6]
chris_verify:
  required: true
  signoff: {by: Chris, date: 2026-07-17, result: SATISFIED, notes: "Verificó los 3 renders (SC-6/7/8) — sin correcciones.", open_items: []}
  rounds: []
  scope: |
    Abrir en navegador y verificar:
    1. sistema/arquitectura/despliegue.html — SC-7: N3 Portal pleno, dos modalidades D3 en la
       banda Organización, twin (deseado×real×brecha) como principio rector y en N6/N13/N16.
    2. sistema/arquitectura/arquitectura.html — SC-4: motor-de-indicadores + brecha-proyecto +
       portal visibles y cableados.
    3. sistema/metodo/NOTACIONES.html — SC-6: responder para cualquier dimensión qué estándar/rol/
       cuándo sí/cuándo no sin abrir YAML · SC-8: triage "¿se elimina, automatiza (RPA/agente),
       aumenta o se defiende como humana?" completo + descarte de Bloom explicado.
reconciled: true
next_action: "— historia cerrada. Siguiente en roadmap (F1.1): sistema/schema-v2-hilo-de-oro-kinetica (idea → refinar)"
```

Evidencia SC (T-6, 2026-07-17):
- SC-1 ✅ gen_arquitectura --check 0 · gen_metodo --check 0 (40 M-cards + NOTACIONES en sync) · gen_roadmap --check 0 (39 historias).
- SC-2 ✅ grep residuos framing viejo en NODOS.md = 0 (clon-precondición / solo-canal / residencia-sin-tier).
- SC-3 ✅ R-walk R1–R17; R16/R17 con dueño; refs [R#] verificadas por gate.
- SC-4 ✅ arquitectura.yaml: motor-de-indicadores, brecha-proyecto, portal (fichas CK-21/CK-24 resuelven); meta.proposito = twin + hosteado default. 24 componentes · 30 relaciones.
- SC-5 ✅ 40 M-cards todas con bloque twin: válido; nuevas: M32 Palantir · M33 DEMO · M34 BPSim · M35 ECRS · M36 criterios RPA+agente · M37 verbos ALM×MGI (no reusa M32-Bloom) · M38 ISO 10013 · M39 NASA-TLX · M40 métricas-persona (CK-24). Familia I nueva.
- SC-6/7/8 ✅ G Chris-verify 2026-07-17: SATISFIED, sin correcciones (los 3 renders ejercidos por el operador).
- SC-9 ✅ cascada canónica única: METODOLOGIA.md §2 reescrito (plan 3a→anual→objetivo→KR→KPI(rol/área)→actividad; persona=ocupante CK-24) + nota reconciliación en TO-BE #10 + blockquote en objetivos.md §6.
- SC-10 ✅ book barrido: Bloom→descartada/M37 · nota-fuente SOMA · SIPOC=proyección en tabla §6 · "paso" al glosario · L5 diferido · fila Riesgo en matriz de la spec.

Deuda anotada (fuera de alcance, para schema-v2):
- Ref muerta `process.schema` en objeto.schema.yaml:49 (detectada por barrido; archivo prohibido en esta historia).
  → RUTEADA en R: `schema-v2-hilo-de-oro-kinetica/00-story.md § Deuda heredada` (2026-07-17).

Bitácora:
- 2026-07-17 · refined FIRME → ready package → developing → T-1..T-6 construidos (commits 7a94c67 + este) → developed, AWAIT_CHRIS_VERIFY.
- Fix de tooling en el mismo evento: .githooks/pre-commit ahora auto-stagea NOTACIONES.html (hueco reportado por T-5A).
- 2026-07-17 · G: Chris SATISFIED (3 renders, sin correcciones) → R: reconciled=true, sin scope-delta (spec ≡ realidad; deuda process.schema ruteada) → auditoría a mano (KIT sin /auditor): 3 gates --check exit 0 + re-grep residuos SC-2 = 0 reales (único hit NODOS.md:165 = framing nuevo en negación) → done. Módulo sistema sin cap YAML por convención (caps live = módulo cockpit); capability_status queda planned.
