# 04 · Los datos canned — Terranova completa y su casuística deliberada

> Parte del dossier. `const DATA` en `index.html` (~L581-1115). NADA es relleno: cada dataset
> existe para demostrar una capacidad del twin y cada anomalía es una casuística que el producto
> DEBE saber mostrar. Al construir la app real, esta casuística se traslada al golden fixture
> (historia `organizacion-ficticia-golden-fixture`, CK-23) — no se pierde.

## Datasets

| Dataset | Cardinalidad | Forma / claves |
|---|---|---|
| `empresa` | 1 | Desarrolladora Terranova S.A.C. — vivienda media Lima |
| `objetivos` | 7 | `{id,nm,persp BSC,kr{m,from,to,cur,u},salud}` + `bscEdges` ×7 (causalidad) |
| `areas` | 14 | `{id,nm,lider,parent,madurez,conf}` + `matrixEdges` (dotted-line al CFO) |
| `procesos` | 17 | `{id,nm,areas[],dueno,digital,sist[],sirve[],conf,flags}` |
| `brechas` | 8 | `{id,nm,sub,tipo,against,obj,costo,sev,prio,estado}` |
| `kpis` | 12 | `{id,nm,unidad,proc,dueno,obj,peso,banda{target,rojo},freq,conf,fuente,mediciones[]}` |
| `proyectos` | 3 | pm-mar (DO) · pm-cob (PLAN) · pm-cie (CERRADO con `resultado`) |
| `personasExtra` | 86 (+14 líderes = 100) | `{nm,rol,area,vinculo}` |
| `sistemas` | 11 | `{id,nm,digital,conector,caps[]}` — cada uno declara su conector a N16 |
| `capabilities` | 4 | M31 + madurez COBIT |
| `arneses` | 4 (de `puestosTotal: 40`) | `{id,rol,v,estado,compilado,skills[],uso,acts[],mueve[]}` |
| `conocimiento` | 7 procesos | `{n,d}` — teaser F3 (`conocimiento/<proceso>/<rol>/` en N6) |
| `ideas` | 4 | M44, autoría RN-16 |
| `cadena` + `pasosMini` | 8 misionales + 17 | orden Porter + verbos macro (fractal Arnesia) |
| `sipoc` + `sipocC1` | 17 + 17 | bordes + `{prop,fin,apqc}` — **en el MOCKUP son tablas canned paralelas** (no se derivan de `proceso.entradas/salidas`, que el canned no tiene); la doctrina "se DERIVA, jamás se edita" (D-08/D-11) aplica a la APP real (cierra B2 de `07`) |
| `lienzos` | 11 plenos (+6 stub) | acts `{ord,lane,verbo,ttl,tipo,toque,espera,sist,triage\|mandato,rtlx?,conf,fte,raci?,note}` |
| `z3` | 14 instrucciones (`'pid:ord'`) | `{ins[],out,tareas[{v,t}],m36{7 inputs + rpa,agente},nota?}` |
| **`periodo`** (v18) | 1 + 6 cifras | `{nm,cierre,marco,auditor,cifras[{id,nm,v,plan,ant,ytd,ytdPlan,u,dir,que,porque,ref}]}` — la variación se DERIVA |
| **`caja`** (v18) | 1 | `{saldo,piso,semanas[13],hito,lineas,resguardos[2],conf:'baja'}` |
| **`presupuesto`** (v18) | 3 bolsas | `{total:6.0,estado:'por aprobar',bolsas[{b,nm,asignado,comprometido}]}` |
| **`facultades`** (v18) | 4 umbrales | qué monto obliga a que decida el directorio |
| **`riesgos`** (v18) | 6 | `{id,nm,cat,prob,imp,tend,dueno,mitig,ref,fuente,conf}` — nivel derivado |
| **`acuerdos`** (v18) | 5 | `{id,nm,quien,sesion,plazo,estado,ref,nota?}` — 2 cumplidos · 1 en curso · 1 pendiente · 1 vencido |
| **`inversiones`** (v18) | 3 | `{id,nm,avance,avanceDecl,gasto,presu,compro,meta,entrega,entregaComp,margen,margenPlan}` |
| **`puente`** (v18) | 6 | `{q,op,ref,norma,otras}` — dónde el número del libro toca la operación |
| **`apuestas[].valor.cobrado`** (v18) | 4 | `{v,u,pct,estado,nota,fuente,conf,verif}` — o `null`/"aún no aplica" |

Lienzos plenos: flagship **p-cob** (7 acts, 3 carriles, 2 flujos alternos "mora dura"/"sin
respuesta ×3") + p-vta, p-camp, p-dis, p-ejec, p-val, p-fact, p-post, p-cierre, p-pago, **p-perm**
(9 acts, espera ~85d — el P03 del SOMA vivo). Stub honesto: p-rec, p-nom, p-caja, p-conc, p-sop,
p-liq. Instrucciones z3: p-cob:1..7 · p-vta:1..5 · p-perm:6 · p-perm:7.

## La casuística deliberada (el catálogo de "cosas que el twin debe saber decir")

### Hilo de oro / KPIs
- **k-nps / p-post `star`** — "NPS 42→31 · ningún KR la mide" = brecha `sin-ancla-de-valor`
  (la joya del diagnóstico: dolor real INVISIBLE para el directorio).
- **k-vis `stale`** — frescura vencida ⌛, fuente "Declarado (caseta)" (conf degradada, jamás
  verde mentiroso).
- **k-caj `mediciones:[]`** — GRIS: la ausencia NUNCA pinta rojo.
- **k-obs** — "NO se mide por municipio (hallazgo)" (el hueco de medición como dato).
- **k-cie 9→4.5** — la serie mejorando = el loop CERRADO visible (pm-cie).
- **8 procesos huérfanos** (`sirve:[]`) — no suben a ningún objetivo: p-fact · p-post · p-liq ·
  p-caja · p-dis · p-nom · p-conc · p-sop. *(corregido 2026-07-25 — el doc decía 6; conteo real
  sobre `DATA.procesos`.)*
- **o-caja verde** con DSO ya en 58 — no todo es rojo; el pulso distingue.

### Organización / frontera persona
- **a-tes vacante** — "jefatura Tesorería vacante" + conf baja + brecha g-tes; p-conc dueño
  "(vacante)". Vacante DELATADA por scan, jamás inventada.
- **8 operarios `subcontratado`** — vínculo visible (BPO/ISO 8.4).
- **Tania Beltrán (Jefe de Permisos)** — el bus-factor-1 encarnado (g-dep).
- Ideas con proponente nombrado (Julio Paredes, Carmen Rojas, Milton Cruz) — autoría reconocida
  (RN-16), jamás medición individual (CK-24).

### Brechas (8, una por tipo de historia)
g-avc `apuesta` (LA Apuesta WSJF ①) · g-post `sin-ancla-de-valor` (obj null) · g-tes (rol
vacante) · g-cvis `a-corroborar` + conf baja · g-mca `off-thread` (atenuada en el funil) ·
**g-dep** (bus-factor-1 en Permisos) · **g-doc** (cero procedimiento escrito) · **g-dso** ALTA.
*(corregido 2026-07-25 — el doc citaba `g-mar`, id inexistente en `DATA.brechas`.)*

### Triage / trabajo (CK-29)
- **p-cob:3 "contactar"** — agente 72 > RPA 34, RTLX 71 → candidata a skill → idea `i-agente`
  (`origen:'triage'`) — la cadena triage→funil ENTERA en un caso.
- **p-cob:7** — RPA 0, "ECRS: ELIMINABLE — M35 antes que M36" (hoja que nadie consulta).
- **p-cob:4 / p-vta:2** — humano-por-diseño (scores <25; negociar/aprobar).
- **p-cob act 5** — "verbo corregido por el consultor — el ingest propuso 'transportar' —
  auditado" (provenance anti-gaming RN-13, y origen de SC-11).
- **h-jefcob v1 `desactualizado` + drift** — SC-11+SC-12 pendientes → SC-14 recompilar (anti-drift
  twin→arnés). **h-cont v2** — "RECOMPILADO al cerrar pm-cie" (la mejora llegó al puesto).
- **4/40 puestos con arnés** — el gap agéntico como número de portada.
- p-caja y p-perm con **0 guías** de conocimiento (la brecha de conocimiento ↔ g-doc/g-dep).

### Gobierno del directorio (v18)
- **`f-caj` caja 2.1 contra 3.4 de plan** y la proyección **cruza el piso en la semana 7** (0.85) —
  la pregunta #1 de un directorio, que antes no existía en el mockup.
- **`caja.conf: 'baja'`** — *"la jefatura de Tesorería está vacante hace 5 meses; nadie firma esta
  proyección"*. La vacante que ya existía (`a-tes`, `g-tes`) ahora **degrada un número del directorio**:
  el twin conecta un hueco de organigrama con la confianza de una cifra.
- **`ap-cob.valor.cobrado = "aún no aplica"`** — la apuesta sin sellar no finge un retorno.
  `ap-mar` cobró **0** ("el stock sigue parado"): prometer sin cobrar se ve.
- **`iv-mar`: avance real 87 vs declarado 95** — el mismo hecho de `g-avc`, ahora también como
  **riesgo de valorización** (si el libro registra el declarado, lo construido está inflado) y como
  **acuerdo abierto con el contador** (`ac-40`). Un hecho, tres superficies, cero duplicación de dato.
- **`ac-41` vencido hace 2 sesiones** (cubrir Tesorería) — y es exactamente la firma que le falta a
  la caja. El acuerdo vencido es el punto que abre la sesión.
- **`r-lic` y `r-dat` en nivel alto** con apetito de cumplimiento `baja` → "**por encima del apetito**".
  `expansion` sigue *sin definir* (casuística previa) → "fíjalo ⚠".
- **`iv-cen`**: gastó 79% del presupuesto con 8% de avance y **entrega "sin fecha"** — no arranca hasta
  que salga la licencia (`p-perm`, ~85 días de espera). El proceso lento del twin, con precio.
- **`presupuesto.estado: 'por aprobar'`** — sin presupuesto aprobado, la mezcla de ambición
  (70/20/10) es una intención sin plata detrás. La bandeja lo pide como primera decisión.

### Sistemas / pulso
Nubecont (dlt diaria 06:00 · 14 tablas) · CRM (horaria) · **Excel caja "SIN conector"** · Banca
"CSV manual · candidato" · Meta "candidato (CPL)" · **Portal municipal "SIN conector — a mano por
distrito"** · Estudio legal "proceso provisto externamente (ISO 8.4)".

### Mejora / corrida
- pm-cie CERRADO: `resultado{delta_observado, veredicto:'movió', nota "checklist M16 → arnés"}`.
- Corrida demo: Tesorería Δ editado · +1 actividad "portal de pagos" en p-cob · impactos DSO
  91→75 · payback 5m · ROI 1.8× · gate a Cambios.
- SC-10..SC-14: los 3 niveles de aprobación (directa+acuse / revisión-dueño / comité) con SC-14 =
  recompilación de arnés por drift.

## Regla al portar

Cada fila de esta casuística responde a una pregunta de demo ("¿y si el KPI no se mide?", "¿y si
el rol está vacante?", "¿y si nadie escribió el procedimiento?"). Al construir el twin real sobre
el golden fixture: **verificar que cada caso siga teniendo un ejemplar** — perder la casuística =
perder el guion de venta.

---

## v19 (2026-07-29) — lo que cambió en el dato y por qué

Las cifras vigentes están en `07 § Cardinalidades vigentes tras v19`. Acá, lo que un builder tiene que
entender del **contenido**, no del conteo:

| Dato | Qué pasó |
|---|---|
| `objetivos` | dejaron de ser una lista plana: 5 del directorio + 5 bajadas unidas por `parent`, cada bajada con su `area` y el rol que responde (`krs[].acc`). `o-cob` y `o-vis` no son metas del directorio — son las bajadas que siempre fueron |
| `krs[]` | lista, no objeto. Cada contrato apunta a la serie de un KPI (`kpi`) y **no guarda su valor**: se lee de la última medición. `esperado` es el punto del plan a hoy, de donde sale la salud |
| `kpis` | ganan `dir` (dirección declarada), `amar` (tercer tramo de banda), `kr` en vez de `obj`, `nicho` (la vara externa) y `gap` (para los que no tienen ancla). Tres nuevos: `k-mar`, `k-dsoc`, `k-viv` — los contratos que antes no tenían con qué medirse |
| `areas` | **pierden** `madurez`: se deriva del rollup de capabilities de su subárbol |
| `capabilities` | ganan `esc` (escalera), `act`/`des` (nivel y deseado) y `evid` (en qué del twin se apoya). `c-permisos` **no tiene deseado** a propósito: hay nivel, no hay brecha |
| `sesiones` | entidad nueva (3): a ella apuntan acuerdos, bajadas acordadas y la autoevaluación |
| `autoevaluacion` | reemplaza a `DATA.madurez`: con escalera declarada, evidencia por dimensión y sesión de evaluación |
| `nicho` | reemplaza a `DATA.peers`: las unidades del rubro con su confianza. Tres de las cuatro **no afirman rango** — y eso es el dato |
| `cifras` del periodo | ganan `res` (qué meta bajada las mueve), `kpi` (de dónde se lee el valor) y `fuente`/`conf` propios. `f-gas` queda **sin `res` a propósito** |
| `brechas` | `obj` → `kr`; dos nuevas: `g-aud` (los hallazgos del dictamen, que el texto prometía y no existían) y `g-prov` (proveedores externos, cl.8.4) |

**Casuística que hay que conservar al portar al golden fixture** (además de la de v18): meta del
directorio sin bajar (`o-hog`, `o-eq`) · bajada sin acuerdo (`o-vis`, Comercial) · objetivo con dos
contratos, uno en meta y otro sin serie (`o-caja`) · indicador sin ancla con la brecha que lo cubre
(`k-nps`→`g-post`) · capacidad sin nivel deseado (`c-permisos`) · área sin capability evaluada ·
unidad de nicho con rango validado (`N-IMM-02`) y otras sin él · cifra sin destinatario (`f-gas`).
