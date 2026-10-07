# Capítulo · Mejora (ideas + proyectos de mejora)

> El marco de `idea` y `proyecto_mejora` — el estrato **O7 · Mejora** del backbone (v2, historia
> schema-v2): el diagnóstico (O6) ya no es el final de la columna. Cierra el loop
> brecha→proyecto→ejecución→**KPI movido** dentro del twin — lo que ningún vendor cierra en la misma
> herramienta (research CK-21).

---

## 1 · El modelo (dos entidades, un funil)

- **`idea`** — propuesta del personal (individual o conjunta), funil masivo y BARATO: kaizen teian /
  plataformas de gestión de ideas (AEVO = líder LATAM). La mayoría muere, se responde con feedback, o
  se resuelve "just do it"; un subconjunto se **promueve** a proyecto. La **autoría se reconoce**
  (proponente_refs → persona) — autoría ≠ medición (CK-24): la participación se agrega por área/rol.
- **`proyecto_mejora`** — el subconjunto promovido (o nacido DIRECTO de una brecha del twin — el
  diferenciador): recibe **charter con caso de negocio**, recursos, tollgates y **auditoría de
  beneficios**. Naming: `proyecto_mejora`, NO "proyecto" — desambigua del `tipo_unidad`
  proyecto|obra|sucursal (D-07).

## 2 · El ciclo (PDCA genérico, dialectos de render)

`propuesto → triaje → en-evaluacion → aprobado → en-ejecucion → en-verificacion → estandarizado →
beneficios-en-auditoria → cerrado` (+ `rechazado · suspendido · cancelado`).

- **Aprobación = charter + DOBLE FIRMA:** sponsor (negocio) + **finanzas valida el caso ANTES** de
  ejecutar (práctica Six Sigma).
- **Verificación con retroceso:** `en-verificacion → en-ejecucion` es transición VÁLIDA (MASP: si la
  acción no bloqueó el problema, se retrocede).
- **Estandarización es un estado propio** (padronização/control) — no un apéndice del cierre.
- **Auditoría de beneficios:** el proyecto "termina" operativamente antes de terminar financieramente —
  los beneficios se cuentan ~12 meses con **finanzas firmando post** (`firmas.finanzas.fecha_post`);
  hard-saving sin esa firma NO cierra (RN-15).
- **`metodologia: pdca | dmaic | masp | kaizen`** = dialecto de render/reporte. UN solo ciclo de datos;
  el cliente brasileño lo lee como MASP/GPD, el corporativo formal como DMAIC, el piso como kaizen.

## 3 · El caso de negocio (lo que la práctica exige)

`tipo_beneficio (hard-saving | soft-saving | cost-avoidance | aumento-ingresos) · beneficio_anualizado ·
inversion · payback/roi · formula_beneficio (documentada, auditable) · periodo_realizacion (default 12
meses) · supuestos` — y el compromiso de medición: `mueve_refs → kpi|key_result` con `delta_esperado`.
Al cerrar: `resultado{delta_observado, veredicto: movio|parcial|no-movio, aprendizaje}` — dato real,
no proyección.

## 4 · Marco/Norma

PDCA como paraguas (ISO 9001 cl.10: 10.2 NC/acción correctiva · 10.3 mejora continua) · **MASP/QC-Story**
(estándar brasileño — Falconi) · **Lean Six Sigma/DMAIC** (charter, tollgates, hard/soft savings —
vigente, no declinó) · **Kaizen teian** (funil de ideas + reconocimiento) · GPD (las metas desdobradas
que los proyectos sirven) · ISO 56002/56001 = horizonte (Brasil hotspot mundial de la ISO de innovación).
Fuentes: 00-research de la historia schema-v2.

## 5 · Trampas

1. **Proyecto sin origen** (ni brecha ni idea) = warning proyecto-sin-diagnóstico — ¿de dónde salió?
2. **Cerrar sin verificar el KPI** — el veredicto `movio|parcial|no-movio` es con dato real; un cierre
   sin `resultado` es un proyecto que "terminó" sin saber si sirvió.
3. **Saltarse estados** — las transiciones son las de `acciones.transiciones_proyecto`; el estado no se
   edita a mano (la Gestión de Cambios ejecuta las acciones).
4. **Contar soft savings como hard** — finanzas valida los hard; los soft llevan supuestos conservadores.
