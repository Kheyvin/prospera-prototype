# 03-arch.md — schema-v2-hilo-de-oro-kinetica (armado a mano — hueco KIT 0.5.3)

---
story_id: schema-v2-hilo-de-oro-kinetica
based_on: 01-spec.md v2 (FIRMA 1 del operador 2026-07-17)
---

## Decisiones de arquitectura (D-A1..D-A7)

- **D-A1 · Un solo SSoT de forma, dos de gobernanza distinta.** Las 12 entidades + `relaciones:` +
  `invariantes:` + **`acciones:`** viven en `sistema/schema/objeto.schema.yaml` (la kinética es
  parte del contrato del objeto — mismo ciclo de cambio). El **vocabulario de verbos** va aparte
  (`sistema/schema/verbos.yaml`): cadencia de cambio distinta (crece por PR con gobernanza propia,
  RN-11) y lo consume también el ingest del método, no solo el validador.
- **D-A2 · Gate nuevo = 4º gate del pre-commit.** `sistema/schema/gen_schema.py` valida (sin vista
  generada, solo `--check` semántica): estructura v2 del schema (12 nodos, enums, refs de
  `relaciones:` resuelven a entidades/campos) · `verbos.yaml` (clase ALM×MGI completa por verbo,
  sinónimos sin duplicar canónicos) · `acciones:` contra su meta-schema (entidad existe,
  `nivel_min` ∈ niveles, aprobación ∈ enum, id no-"set-campo", ≤10/entidad). Se encadena en
  `.githooks/pre-commit` (patrón CK-17; falla → bloquea).
- **D-A3 · Validación de instancias sigue HARDCODED en Go** (`go/objeto.go::validateObjeto`),
  estilo house: maps `map[string]any` + funciones de chequeo dirigidas + `warnings []string`. NO
  se introduce un motor genérico schema-driven (YAGNI; el gate D-A2 mantiene schema↔validador
  honestos vía SC de paridad — ver 04-validators `seam_coverage`). Errores vs warnings: formas v1
  muertas, RN-8, RN-14, RN-15, transición inválida de estado = **error** (bloquean el objeto
  entero en `errors[]`, campo NUEVO de la respuesta); refs colgantes, verbo fuera de vocabulario,
  sin-ancla-de-valor, provenance ausente = **warning** (como hoy). `divergente` = anotación
  derivada en la medición del payload (jamás escribe al disco).
- **D-A4 · Verbos al runtime:** el handler carga `sistema/schema/verbos.yaml` UNA vez
  (lazy, cacheado) desde la raíz del repo cockpit (mismo mecanismo con que el binario resuelve
  sus assets/registry — `d.deps`); shell no lo trae (el vocabulario es NUESTRO estándar, no dato
  del cliente).
- **D-A5 · Corte limpio (duda 2):** `tiposObjeto` suma `{kpis, kpi}`, `{proyectos-mejora,
  proyecto_mejora}`, `{ideas, idea}`. Las formas v1 muertas (`proceso.kpis`, `actividad.tiempo`
  string, `persona.reporta_a` ref simple) se DETECTAN explícitamente con error que nombra la
  forma v2 (no silencio, no warning eterno). La migración del shell `prenter` (repo hermano,
  registrado en el portfolio — D-01/D-15) va en esta historia (T-5).
- **D-A6 · Catálogo del método:** delta AC-8 reusa EXACTO la mecánica del refichado WS5
  (methodologies.yaml + methodology.schema.yaml → gen_metodo regenera NOTACIONES.html): dimensión
  `mejora-proyectos` al enum + labels, 5 M-cards nuevas (GPD · DMAIC · MASP · gestión de ideas ·
  ISO 56002-horizonte), M16 suma cl.10 a `cuando_si`. Cero cambios a bloques `twin:` aprobados.
- **D-A7 · Máquina de estados `proyecto_mejora` como DATO:** las transiciones válidas se declaran
  en el schema (lista `transiciones:` junto al enum — incluye el loop-back
  `en-verificacion → en-ejecucion`), el Go las lee… NO: se transcriben a una tabla Go
  (consistente con D-A3) y el gate D-A2 verifica que la tabla del schema y el enum coincidan.
  El estado en la instancia es dato declarado; la transición la gobernará BL-24 (acciones).

## § Integration design (CONN — anti-orphan)

- **Consumed:** `/api/objeto` (CAP-08, live) sirve las 12 entidades — consumidor real desde el
  día 1 (decisión del operador, duda 4). Downstream inmediato: `organizacion-ficticia-golden-fixture`.
- **On the map:** cap `cockpit/api-objeto` `cap_change_type: extend` (RN-4′ modifica RN-4; entran
  RN-8..RN-16 — actualización de cap en Fase E/F).
- **Navigable:** `GET /api/objeto?empresa=<id>` (ruta existente, payload crece: +`kpis`,
  +`proyectos_mejora`, +`ideas`, +`errors[]`). Las lentes del cockpit no se tocan (F1.1).
- **Notarized:** handler ya registrado; gate nuevo cableado en `.githooks/pre-commit` (T-2).

## § Prior art audit

- `readEntidades` + `validateObjeto` + patrón warnings: se EXTIENDEN, no se duplican (cero
  validador paralelo). Gate: patrón `gen_*.py` de CK-17 reusado (4º eslabón, no framework nuevo).
- Catálogo método: mecánica refichado-WS5 reusada verbatim (D-A6). Sin mirror cross-eje.
- Máquina de estados: primera del repo (no hay prior art interno); tabla-driven Go estándar.

## Riesgos

- **R1 · Paridad schema↔validador Go** (dos fuentes de la misma regla): mitigado por D-A2/D-A7
  (gate verifica coincidencia enum/transiciones) + SC de paridad en 04-validators.
- **R2 · Migración prenter toca repo hermano:** commit separado en ese repo; live-verify contra
  él antes de cerrar T-5 (si el shell no está disponible en el entorno, STOP y escalar — no
  simular).
- **R3 · Alcance metodo (T-3) desincroniza NOTACIONES aprobado:** solo ADITIVO (D-A6); diff de
  NOTACIONES.html se presenta en G Chris-verify.
