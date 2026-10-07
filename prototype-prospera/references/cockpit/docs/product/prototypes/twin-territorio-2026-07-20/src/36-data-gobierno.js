/* ============================================================
   v18 · GOBIERNO DEL DIRECTORIO — resultado · caja · presupuesto · riesgos ·
   acuerdos · inversiones · alcance contable
   ============================================================
   Por qué existe: el nivel 1 gobernaba la EJECUCIÓN de la estrategia (apuestas, alertas,
   portafolio) — la segunda mitad de una agenda de directorio. Faltaba la primera: plata,
   caja, presupuesto y acuerdos. Auditoría 2026-07-29 (H1-H12 del tablero `dossier/07`).

   Doctrina (bloque C): Cockpit NO reexpresa los estados financieros. Los LEE del sistema
   contable con su estado de cierre y su procedencia, y los baja al twin. El juego completo,
   las notas y el dictamen viven en el sistema contable y en el auditor — acá vive el PUENTE
   entre el número del libro y la operación que lo produce (`DATA.puente`).

   Generalidad: toda estructura de acá es agnóstica de industria. Lo que cambia entre rubros
   es el CONTENIDO de las filas, jamás las preguntas — cada panel lo declara en su línea de
   equivalencias (`.paral`). */

/* ---- 1 · EL RESULTADO DEL PERIODO — leído del sistema contable, jamás reexpresado ---- */
DATA.periodo={
  nm:'Julio 2026', ciclo:'mes 7 de 12', cierre:'preliminar',   // preliminar → cerrado → auditado
  marco:'NIIF para PYMES',            // marco de reporte declarado de la empresa (config, no supuesto)
  moneda:'S/', fuente:'Nubecont ERP · cierre contable del mes', conf:'media',
  cierra:'el cierre definitivo se firma el día 12',
  auditor:{ estado:'Estados financieros 2025 auditados · opinión sin salvedades',
            hallazgos:2, nota:'2 hallazgos de control interno abiertos — viven como brechas del twin' },
  /* dir: 1 = más es mejor · -1 = menos es mejor. La variación se DERIVA al leer, jamás se guarda.
     `ref` = quién PRODUCE la cifra (estructura) · `res` (v19 · D-35) = la meta bajada que la MUEVE
     esta semana (trabajo). Sin `res` la variación es un reproche sin destinatario — y `f-gas` lo deja
     a propósito vacío: es el caso que el tablero tiene que saber declarar.
     `kpi` (D-34) = la serie de la que se LEE el valor, para no tener el mismo número en dos lados. */
  cifras:[
    {id:'f-ing', nm:'Ingresos',          v:5.8,  plan:6.4,  ant:5.1,  ytd:41.2, ytdPlan:44.8, u:'S/ M',  dec:1, dir:1,
     que:'lo que la empresa facturó en el mes', ref:{proc:'p-vta'}, res:'o-vis', fuente:'Nubecont ERP · ventas del mes', conf:'alta',
     porque:'7 unidades entregadas contra 9 del plan — la entrega de Marina se corrió'},
    {id:'f-mar', nm:'Margen bruto',      v:15.8, plan:17.0, ant:14.2, ytd:15.4, ytdPlan:17.0, u:'%',     dec:1, dir:1,
     que:'cuánto queda de cada sol vendido, antes de gastos', ref:{obj:'o-lid'}, res:'o-avc', kpi:'k-mar', fuente:'Nubecont ERP · cierre contable', conf:'media',
     porque:'el sobrecosto de Marina se come 1.2 puntos'},
    {id:'f-gas', nm:'Gasto operativo',   v:0.62, plan:0.58, ant:0.59, ytd:4.31, ytdPlan:4.06, u:'S/ M',  dec:2, dir:-1,
     que:'lo que cuesta sostener la operación', ref:{area:'a-ger'}, res:null, fuente:'Nubecont ERP · cierre contable', conf:'media',
     porque:'horas extra en obra y asesoría legal por permisos'},
    {id:'f-res', nm:'Resultado del mes', v:0.30, plan:0.51, ant:0.14, ytd:2.10, ytdPlan:3.42, u:'S/ M',  dec:2, dir:1,
     que:'lo que quedó, después de todo', ref:{obj:'o-lid'}, res:'o-avc', fuente:'Nubecont ERP · cierre contable', conf:'media',
     porque:'menos ingreso y más gasto: la brecha viene de los dos lados'},
    {id:'f-caj', nm:'Caja al cierre',    v:2.1,  plan:3.4,  ant:2.8,  ytd:2.1,  ytdPlan:3.4,  u:'S/ M',  dec:1, dir:1,
     que:'cuánto dinero disponible quedó', ref:{obj:'o-caja'}, res:'o-dso', fuente:'posición bancaria conciliada', conf:'alta',
     porque:'la cobranza de Marina (91 días) es la fuga — es la apuesta de caja'},
    {id:'f-deu', nm:'Deuda neta',        v:12.4, plan:11.0, ant:10.2, ytd:12.4, ytdPlan:11.0, u:'S/ M',  dec:1, dir:-1,
     que:'lo que se debe, menos lo que hay en caja', ref:{}, res:'o-dso', fuente:'posición bancaria + contratos de deuda', conf:'alta',
     porque:'se giró más línea para sostener obra mientras la cobranza no entra'},
  ]};

/* ---- 2 · LA CAJA — el tema de directorio que ninguna cifra de resultado responde ---- */
DATA.caja={
  saldo:2.1, u:'S/ M', piso:1.0, pisoFijado:false,   // el piso es una VARA que el directorio firma
  semanas:[2.1,1.9,1.7,1.8,1.4,1.1,0.85,1.0,1.3,1.6,1.4,1.2,1.5],
  hito:{sem:7, nm:'valorización de obra de Marina — S/ 1.4M'},
  lineas:{disponible:3.0, usado:1.2},
  resguardos:[
    {nm:'Deuda sobre patrimonio', lim:'no más de 1.8×', v:'1.62×', holgura:'ajustada', est:'ambar'},
    {nm:'Cobertura de intereses', lim:'al menos 2.5×',  v:'3.10×', holgura:'holgada',  est:'verde'},
  ],
  fuente:'Nubecont ERP + posición bancaria · proyección de Tesorería',
  conf:'baja', confPorque:'la jefatura de Tesorería está vacante hace 5 meses — nadie firma esta proyección',
  refConf:{area:'a-tes'}};

/* ---- 3 · EL PRESUPUESTO — la mezcla de ambición hecha plata (sin esto no hay gobierno) ---- */
DATA.presupuesto={ anio:2026, u:'S/ M', total:6.0, estado:'por aprobar', aprobado:false,
  bolsas:[
    {b:'operar',      nm:'operar el hoy',      asignado:4.2, comprometido:3.61},
    {b:'expandir',    nm:'expandir',           asignado:1.5, comprometido:1.12},
    {b:'transformar', nm:'apostar al futuro',  asignado:0.3, comprometido:0.06},
  ],
  fuente:'propuesta del CFO sobre el cierre del año anterior', conf:'media'};

/* ---- 4 · LAS FACULTADES — qué monto obliga a que decida el directorio (no la gerencia) ---- */
DATA.facultades={ nota:'sobre estos montos decide el directorio; debajo, la gerencia — y queda en el historial',
  umbrales:[ {q:'Inversión nueva', v:'S/ 500k'}, {q:'Endeudamiento', v:'S/ 1.0M'},
             {q:'Contrato con un tercero', v:'S/ 300k'}, {q:'Venta de un activo', v:'cualquier monto'} ]};

/* ---- 5 · EL REGISTRO DE RIESGOS — el apetito ya existía; le faltaba la contraparte ---- */
DATA.apetito.operacion='media'; DATA.apetito.cumplimiento='baja'; DATA.apetito.personas='media';
CATNM.operacion='operación'; CATNM.cumplimiento='cumplimiento'; CATNM.personas='personas';
DATA.riesgos=[
  {id:'r-caj', nm:'La caja no alcanza para el hito de obra de setiembre', cat:'liquidez',
   prob:'media', imp:'alto', tend:'sube', dueno:'CFO',
   mitig:'La apuesta de caja + ampliar la línea de capital de trabajo',
   ref:{ap:'ap-caja', g:'g-dso'}, fuente:'proyección de caja a 13 semanas', conf:'media'},
  {id:'r-ent', nm:'Entregar Marina tarde: penalidades y daño de marca', cat:'reputacion',
   prob:'media', imp:'alto', tend:'estable', dueno:'Gerente de Construcción',
   mitig:'Plan de recuperación de avance con corte quincenal',
   ref:{g:'g-avc', inv:'iv-mar'}, fuente:'corte de obra vs cronograma comprometido', conf:'alta'},
  {id:'r-lic', nm:'Las licencias que no salen frenan el arranque de Centro Sur', cat:'cumplimiento',
   prob:'alta', imp:'alto', tend:'estable', dueno:'Gerente de Desarrollo',
   mitig:'Sin mitigación comprometida — el proceso tarda ~85 días y no se gestiona por distrito',
   ref:{proc:'p-perm', inv:'iv-cen'}, fuente:'tiempos del proceso de permisos (M1)', conf:'media'},
  {id:'r-dep', nm:'Una sola persona sostiene todos los permisos', cat:'operacion',
   prob:'alta', imp:'medio', tend:'estable', dueno:'Gerente de Desarrollo',
   mitig:'Escribir el procedimiento y formar un segundo ocupante',
   ref:{g:'g-dep'}, fuente:'levantamiento del proceso (M1)', conf:'alta'},
  {id:'r-dat', nm:'Se decide con números de caja que nadie firma', cat:'operacion',
   prob:'alta', imp:'alto', tend:'sube', dueno:'CFO',
   mitig:'Cubrir la jefatura de Tesorería — acuerdo vencido hace 2 sesiones',
   ref:{area:'a-tes'}, fuente:'vacante confirmada en la nómina', conf:'alta'},
  {id:'r-per', nm:'La rotación en obra está por encima de lo tolerado', cat:'personas',
   prob:'media', imp:'medio', tend:'baja', dueno:'Gerente de Gestión Humana',
   mitig:'Plan de retención de cuadrillas clave (en el objetivo del ciclo)',
   ref:{obj:'o-eq'}, fuente:'nómina · altas y bajas mensuales', conf:'alta'},
];

/* ---- 6 · LOS ACUERDOS — el punto que abre TODA sesión de directorio: qué se acordó y quién respondió ---- */
DATA.acuerdos=[
  {id:'ac-38', nm:'Presentar el plan de recuperación de Marina con corte quincenal',
   quien:'Gerente de Construcción', sesion:'junio', plazo:'sesión de julio', estado:'cumplido', ref:{pm:'pm-mar'}},
  {id:'ac-39', nm:'Traer el caso de la cobranza digital con retorno y tope de gasto',
   quien:'CFO', sesion:'junio', plazo:'sesión de julio', estado:'cumplido', ref:{pm:'pm-cob'}},
  {id:'ac-40', nm:'Revisar con el contador cómo se está valorizando lo construido de Marina',
   quien:'CFO', sesion:'junio', plazo:'sesión de julio', estado:'en curso', ref:{inv:'iv-mar'},
   nota:'el avance real (87%) va detrás del declarado (95%): si el libro registra el declarado, el valor de lo construido está inflado'},
  {id:'ac-41', nm:'Cubrir la jefatura de Tesorería',
   quien:'Gerente de Gestión Humana', sesion:'mayo', plazo:'sesión de junio', estado:'vencido', ref:{area:'a-tes'},
   nota:'2 sesiones vencido — y es la firma que falta en la proyección de caja'},
  {id:'ac-42', nm:'Fijar el apetito de riesgo de expansión',
   quien:'Directorio', sesion:'junio', plazo:'sesión de julio', estado:'pendiente', ref:{acc:'fijar-apetito-riesgo'}},
];

/* ---- 7 · LAS INVERSIONES EN CURSO — avance real × gasto contra presupuesto × ya comprometido ---- */
DATA.inversiones=[
  {id:'iv-mar', nm:'Marina — etapa 2', u:'S/ M',
   avance:87, avanceDecl:95, gasto:14.2, presu:15.5, compro:22.4, meta:31.0,
   entrega:'dic-2026', entregaComp:'oct-2026', margen:12.4, margenPlan:16,
   ref:{g:'g-avc', pm:'pm-mar'}, fuente:'corte de obra + valorización (ValorizApp)', conf:'alta'},
  {id:'iv-hor', nm:'Los Horizontes — etapa 1', u:'S/ M',
   avance:34, avanceDecl:34, gasto:5.1, presu:16.0, compro:9.8, meta:28.0,
   entrega:'jun-2027', entregaComp:'jun-2027', margen:17.1, margenPlan:17,
   ref:{}, fuente:'corte de obra + valorización (ValorizApp)', conf:'alta'},
  {id:'iv-cen', nm:'Centro Sur — terreno y licencias', u:'S/ M',
   avance:8, avanceDecl:8, gasto:1.9, presu:2.4, compro:0, meta:34.0,
   entrega:'sin fecha', entregaComp:'mar-2027', margen:null, margenPlan:18,
   ref:{proc:'p-perm'}, fuente:'expediente municipal + contrato de compra', conf:'media',
   nota:'no arranca hasta que salga la licencia — el proceso de permisos tarda ~85 días'},
];

/* ---- 8 · EL PUENTE — dónde el número del libro toca la operación (bloque C: enlazar, no reexpresar) ---- */
DATA.puente=[
  {q:'Cuándo se reconoce el ingreso', op:'las entregas y el avance de obra', ref:{inv:'iv-mar'},
   norma:'NIIF 15 — Ingresos de contratos con clientes',
   otras:'en manufactura = la entrega del pedido · en servicios = las horas o los hitos entregados'},
  {q:'Cuánto se provisiona por cobranza dudosa', op:'la mora y los días de cobranza', ref:{g:'g-dso'},
   norma:'NIIF 9 — pérdida crediticia esperada',
   otras:'igual en toda industria que vende a crédito'},
  {q:'Cuánto vale lo que está a medio construir', op:'el avance REAL, no el declarado', ref:{g:'g-avc'},
   norma:'NIC 2 · costos de contratos — inventario y obra en curso',
   otras:'en manufactura = producto en proceso · en servicios = trabajo no facturado'},
  {q:'Qué contingencias se registran', op:'litigios, penalidades por entrega tardía, licencias', ref:{proc:'p-perm'},
   norma:'NIC 37 — provisiones, pasivos y activos contingentes',
   otras:'en toda industria: juicios, garantías, multas regulatorias'},
  {q:'Qué arrendamientos entran al balance', op:'contratos de terreno, oficinas y equipos', ref:{},
   norma:'NIIF 16 — arrendamientos',
   otras:'en retail = los locales · en transporte = la flota'},
  {q:'Qué operaciones con vinculadas se revelan', op:'gobierno y partes relacionadas', ref:{},
   norma:'NIC 24 — información a revelar sobre partes relacionadas',
   otras:'en toda empresa con accionistas o empresas hermanas'},
];

/* ---- 9 · VALOR COBRADO — la apuesta promete plata; acá se COBRA (o se dice que aún no) ----
   El twin acusa a otros de "indicador sin ancla de valor"; una apuesta que promete y nunca
   rinde comete lo mismo en el nivel más alto. `cobrado` se escribe contra el cierre contable
   y lo verifica finanzas (acción `verificar-beneficios`) — jamás lo declara quien apostó. */
(function(){ const C={
  'ap-lid': {v:0.42, u:'S/ M/año', pct:14, estado:'parcial', al:'julio 2026',
             nota:'el margen subió 14.2 → 15.8% — 1.6 de los 4 puntos prometidos',
             fuente:'cierre contable · margen por proyecto', conf:'media', verif:'CFO · julio'},
  'ap-caja':{v:1.1, u:'S/ M', pct:18, estado:'parcial', al:'julio 2026',
             nota:'el DSO consolidado bajó 88 → 58 días, pero Marina (91) sigue sin entrar',
             fuente:'serie de cobranza del ERP', conf:'alta', verif:'CFO · julio'},
  'ap-mar': {v:0, u:'S/ M', pct:0, estado:'sin cobrar', al:'julio 2026',
             nota:'el stock sigue parado: 24 unidades sin rotar — la apuesta no ha devuelto nada aún',
             fuente:'inventario comercial', conf:'alta', verif:'pendiente'},
  'ap-cob': {v:null, u:'', pct:0, estado:'aún no aplica', al:'—',
             nota:'la apuesta todavía no está sellada — no hay nada que cobrar',
             fuente:'—', conf:'—', verif:'—'} };
  DATA.apuestas.forEach(a=>{ a.valor.cobrado=C[a.id]||null; }); })();

/* ============================================================
   HELPERS DERIVADOS — todo se computa AL LEER, jamás se guarda
   ============================================================ */
/* variación contra una referencia, con el signo interpretado por `dir` (más es mejor / menos es mejor) */
function varia(v,ref,dir){ if(ref==null||!ref) return null;
  const d=(v-ref)/Math.abs(ref)*100, b=d*dir;
  return {pct:d, buena:b>=-2, est:b>=-2?'verde':b>=-10?'ambar':'rojo'}; }
/* v19 (D-34) · el valor de una cifra que YA se sigue como indicador se LEE de su serie, no se guarda
   dos veces. Es el mismo principio que el KR con `kpi_ref`: dos copias del mismo número es cómo el
   tablero del directorio y el del gerente empiezan a decir cosas distintas. */
function cifraValor(c){ if(c.kpi){ const k=byId(DATA.kpis,c.kpi), v=k&&kcur(k); if(v!=null) return v; } return c.v; }
const fmtN=(v,dec)=>v==null?'—':v.toFixed(dec==null?1:dec);
const fmtPct=d=>(d>0?'+':'')+d.toFixed(1)+'%';
/* nivel del riesgo = probabilidad × impacto (matriz 3×3 clásica, derivada — nunca declarada) */
const NIV={baja:1,bajo:1,media:2,medio:2,alta:3,alto:3};
function nivelRiesgo(r){ const s=NIV[r.prob]*NIV[r.imp];
  return s>=6?{t:'alto',c:'var(--crit)',est:'rojo'}:s>=3?{t:'medio',c:'var(--warn)',est:'ambar'}:{t:'bajo',c:'var(--ok)',est:'verde'}; }
/* el riesgo contra la vara: mismo motor que `contraste()` de la apuesta, aplicado al registro */
function riesgoVsApetito(r){ const raw=DATA.apetito[r.cat]||'', n=nivelRiesgo(r);
  if(/sin definir/.test(raw)||!(raw.split(' ')[0] in NIVR)) return {t:`apetito de ${CATNM[r.cat]} sin definir — fíjalo ⚠`, c:'var(--warn)'};
  const ap=raw.split(' ')[0], d=NIVR[n.t]-NIVR[ap];
  return d>0? {t:`por encima del apetito de ${CATNM[r.cat]} (${ap})`, c:'var(--crit)'}
     : d===0? {t:`al límite del apetito de ${CATNM[r.cat]} (${ap})`, c:'var(--warn)'}
     : {t:`dentro del apetito de ${CATNM[r.cat]} (${ap})`, c:'var(--tx-mut)'}; }
const TEND={sube:'▲ empeora', baja:'▼ mejora', estable:'= estable'};
const ACUC={cumplido:'var(--ok)', 'en curso':'var(--brand-hi)', pendiente:'var(--warn)', vencido:'var(--crit)'};
/* semanas de caja por debajo del piso que el directorio fijó — la señal, derivada de la serie */
function cajaBajoPiso(){ return DATA.caja.semanas.filter(v=>v<DATA.caja.piso).length; }
/* desvío entre el avance REAL y el declarado: el input de si lo construido está bien valorizado */
const desvioAvance=iv=>iv.avanceDecl-iv.avance;
/* cuánto del presupuesto de la bolsa está comprometido (0-1) */
const usoBolsa=b=>b.asignado?Math.min(1,b.comprometido/b.asignado):0;
/* v19 · la mezcla que el presupuesto REALMENTE reparte, en plata (M57: «la mezcla hecha plata»).
   Hasta ahora convivían tres lecturas de lo mismo sin hablarse: la mezcla objetivo (%), el reparto del
   presupuesto (S/) y la mezcla real por CONTEO de iniciativas. Son tres unidades distintas; mezclarlas
   sin decirlo era el error. Acá se declara cada una con su unidad y se contrasta la que manda —
   el dinero — contra la vara. */
function mezclaPresupuesto(){ const t=DATA.presupuesto.bolsas.reduce((s,b)=>s+b.asignado,0)||1, o=DATA.mezclaObjetivo;
  const pct=b=>Math.round((DATA.presupuesto.bolsas.find(x=>x.b===b)||{asignado:0}).asignado*100/t);
  const m={operar:pct('operar'), expandir:pct('expandir'), transformar:pct('transformar')};
  m.desvia=['operar','expandir','transformar'].filter(k=>Math.abs(m[k]-o[k])>=3);
  return m; }
/* v19 · las dos plata NO son la misma y no se suman: el presupuesto gobierna el GASTO del año
   (operación y mejora); cada inversión de capital se gobierna por proyecto, con su propio
   financiamiento. Declararlo evita la lectura de que 6.0 «no alcanza» para 33.9 de obra. */
DATA.presupuesto.alcance='gasto del año — operación y mejora';
DATA.presupuesto.noIncluye='la inversión de capital de cada proyecto (obra, terreno): se gobierna por proyecto, con preventa y deuda propias — ver Inversiones';
