# Capítulo · KPIs (indicadores de proceso)

> El marco del `kpi` — **O2** del backbone junto al objetivo (v2, historia schema-v2). El eslabón que
> vuelve el hilo de oro MEDIBLE: `objetivo → KR → KPI (de proceso, dueño = rol o área) → actividad`.

---

## 1 · Qué es un KPI (y qué NO es)

- **Definición.** Una **métrica permanente de salud** de un proceso, con **banda** (target + umbrales):
  mientras está dentro de banda, no exige acción; al salirse, sí. Es el tablero del auto (Felipe Castro);
  el OKR es el GPS. **No compiten**: *"OKRs are measures for change, KPIs are measures of health"* (Doerr).
- **Frontera permeable (bidireccional).** Un KPI fuera de banda se **promueve** a KR del ciclo para
  arreglarlo (acción `promover-kpi-a-kr`); un KR logrado **decanta** a KPI monitoreado
  (`decantar-kr-a-kpi`). El KR puede referenciar la serie de un KPI (`kr.kpi_ref`): misma serie,
  **distinto contrato** (cambio con vencimiento vs salud permanente).
- **Marco/Norma.** OKR (M21) · BSC (M30, lead/lag) · ISO 9001 cl.9.1 (seguimiento/medición) · demo SOMA
  (tipología KPI/DPI/KRI). Fuentes primarias: whatmatters.com · Castro · Perdoo (00-research de la historia).

## 2 · En el schema

`kpis/kpi-*.yaml`: `id · nombre (calificado — anti-Misnomer) · tipologia (kpi|dpi|kri) · tipo (lead|lag)
· proceso_ref (ancla) · dueño_ref → rol|area (REQUERIDO) · banda{target, umbrales} · frecuencia ·
contribuye_a[]{kr_ref, peso} · en_tension_con[] · rollup · mediciones[]`.

Cada `medicion` (weak-entity `kpi-x#mN`): `fecha · valor_declarado y/o valor_observado{valor, query_ref}
· unidad_ref (D-07: corte por proyecto/obra/sucursal) · fuente · conf` (provenance OBLIGATORIA).

## 3 · Reglas duras

1. **El dueño es un ROL o un ÁREA — jamás una persona** (CK-24). La persona hereda el KPI como
   *ocupante del rol*; la vista por persona-nombrada requiere opt-in de Gobernanza.
2. **Declarado vs observado conviven; la divergencia se PINTA, no se consagra.** El estado
   `divergente` se deriva al leer — nunca se persiste (anti-gaming).
3. **El rollup es una función declarada** (`peor-hijo | promedio | ponderado`) — el semáforo se
   computa; el resultado jamás se guarda (un-hecho-un-lugar).
4. **Counter-metrics:** un KPI puede declarar `en_tension_con` otro (velocidad vs calidad) — el grafo
   también registra tensiones, no solo armonías.
5. **Compensación:** la remuneración variable ata a KPIs/metas de proceso — jamás al score de un KR
   en modo OKR (RN-14; en modo GPD el acople a PLR es el estándar brasileño).

## 4 · Trampas

1. **KPI sin proceso** = hilo incompleto (warning) — ¿de qué operación es salud esa cifra?
2. **Medición sin provenance** — un número sin `fuente`+`conf` no es evidencia, es opinión.
3. **Promover TODO a KR** — si cada KPI es un KR, no hay foco; se promueve lo que está fuera de banda
   y importa ESTE ciclo.
