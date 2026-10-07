/* ---- v14 · NIVEL 1 — apuestas + apetito (D-23: entidad `apuesta` = 13º nodo + apetito en config_estrategia
   pendiente vía /metodo-aprende; acá viven como dato del mockup, ancladas a objetivos reales) ---- */
DATA.apuestas=[  // valor = FinOps (dinero + supuesto visible) · apuesta_de = apetito Shape Up (tiempo fijo · tope) — v15.1
  {id:'ap-lid', nm:'Liderazgo en vivienda media', objetivos:['o-lid','o-hog'], riesgo:'medio', riesgo_cat:'expansion', ambicion:'expandir', estado:'sellada',
    valor:{s:'+S/ 3.1M/año de margen', supuesto:'margen 14→18% sobre venta de ~S/ 78M/año'}, apuesta_de:{t:'4 trimestres', tope:'S/ 250k'}},
  {id:'ap-caja',nm:'Caja sana en todos los proyectos', objetivos:['o-caja','o-cob'], riesgo:'alto', riesgo_cat:'liquidez', ambicion:'operar', estado:'sellada',
    valor:{s:'~S/ 6.0M de caja liberada', supuesto:'DSO 88→60 días sobre venta de ~S/ 78M/año (una vez) + S/ 180k/año de mora evitada'}, apuesta_de:{t:'2 trimestres', tope:'S/ 150k'}},
  {id:'ap-mar', nm:'Reactivar Marina', objetivos:['o-mar','o-vis'], riesgo:'alto', riesgo_cat:'reputacion', ambicion:'operar', estado:'sellada',
    valor:{s:'S/ 8.4M de stock que vuelve a rotar', supuesto:'24 unidades paradas × ticket ~S/ 350k'}, apuesta_de:{t:'2 trimestres', tope:'S/ 420k (obra + comercial)'}},
  {id:'ap-cob', nm:'Digitalizar la cobranza', objetivos:['o-cob'], riesgo:'medio', riesgo_cat:'liquidez', ambicion:'operar', estado:'por-sellar',
    valor:{s:'S/ 180k/año de mora evitada', supuesto:'la mora de Marina (alerta) cae al llevar el 60% de la cobranza a canal digital'}, apuesta_de:{t:'1 trimestre · fase 1', tope:'S/ 60k'}},
];
DATA.apetito={ liquidez:'media', reputacion:'baja', expansion:'alta — sin definir por el directorio' };

/* ---- v19 (D-25) · LAS SESIONES — la reunión de gobierno como entidad, no como string.
   Antes los acuerdos decían `sesion:'junio'` y los objetivos citaban "acta de directorio Q3" en texto
   libre: nada de eso navegaba ni se podía auditar. Ahora todo lo que se firma apunta acá — el acuerdo
   donde se acordó, la bajada donde el gerente la aceptó, el presupuesto donde se aprobará, el piso de
   caja donde se firmará. La sesión vigente es la que está abierta hoy. ---- */
DATA.sesiones=[
  {id:'ses-may', tipo:'directorio', nm:'sesión de mayo',  fecha:'2026-05-14', periodo:'abril 2026', acta:{generada:true, v:'v1.0'}},
  {id:'ses-jun', tipo:'directorio', nm:'sesión de junio', fecha:'2026-06-11', periodo:'mayo 2026',  acta:{generada:true, v:'v1.0'}},
  {id:'ses-jul', tipo:'directorio', nm:'sesión de julio', fecha:'2026-07-30', periodo:'julio 2026', acta:{generada:false, v:null}, vigente:true},
];
const sesNm=id=>{ const s=id&&byId(DATA.sesiones,id); return s?s.nm:null; };
const sesVigente=()=>DATA.sesiones.find(s=>s.vigente);

/* ---- v15 · «Las varas del directorio» — rumbo · mezcla de ambición · escalera de madurez.
   v19: la VISIÓN ya no se duplica acá (decía «2029 · Perú» mientras la empresa declaraba «2030 ·
   Lima Metropolitana» — dos visiones contradictorias en la misma pantalla). Se lee de `DATA.empresa`,
   que es su único lugar. `anio` = las metas que el directorio puso como foco del año; la BAJADA ya no
   es un contador suelto: se DERIVA de los objetivos hijo y de si tienen sesión de acuerdo (D-35). ---- */
DATA.empresa.visionHoriz='2030';
DATA.rumbo={ anio:['o-caja','o-mar'] };
DATA.mezclaObjetivo={ operar:70, expandir:20, transformar:10, fijada:false };  // default industria — POR FIJAR

/* ---- v19 (D-31 · M48) · LAS VARAS EXTERNAS salen del EJE VERTICAL, no de la pantalla ----
   Antes acá vivía `DATA.peers`: tres rangos escritos a mano con la fuente en prosa. Uno de ellos
   ("pares 45–60 días" de cobranza) contradecía frontalmente a la unidad del método que dice, textual,
   que NO existe benchmark de cobranza inmobiliaria peruana validado y que el rango se levanta por
   cliente. El producto acusaba a otros de afirmar sin fuente y hacía exactamente eso.
   Ahora cada KPI apunta a su unidad de `sistema/metodo/nichos/inmobiliario.yaml` y HEREDA su
   confianza: unidad con rango validado ⇒ se muestra el rango; unidad `hipotesis` ⇒ se muestra la
   CONDICIÓN ("sin vara comparable"), que es información, no un hueco. */
DATA.nicho={
  'N-IMM-02':{nm:'Velocidad de venta / absorción', rango:'mercado Lima ~1.7 %/mes', conf:'media',
    fuente:'ASEI · Mercado inmobiliario Lima 2024', vig:'2024 (Lima)',
    cond:'varía fuerte por segmento, distrito y ciclo — no usar como meta sin ajustar al proyecto'},
  'N-IMM-03':{nm:'Cobranza / DSO', rango:null, conf:'baja',
    fuente:'unidad de nicho — categoría, no benchmark',
    cond:'no existe benchmark de cobranza inmobiliaria peruana validado: el rango se LEVANTA por cliente contra su propio histórico, no se asume'},
  'N-IMM-07':{nm:'Margen bruto por proyecto', rango:null, conf:'baja',
    fuente:'unidad de nicho — categoría, no benchmark',
    cond:'depende del segmento, del modelo de suelo y del ciclo; sin fuente sectorial seria no se afirma un rango de pares'},
  'N-IMM-08':{nm:'Satisfacción del propietario (postventa)', rango:null, conf:'baja',
    fuente:'unidad de nicho — categoría, no benchmark',
    cond:'sin benchmark sectorial validado y con escalas de encuesta distintas por empresa: comparar dos escalas es peor que no comparar'},
};

/* La escalera del SISTEMA DE GESTIÓN (M47 · ISO 9004, D-33) — distinta de la de una capacidad
   (M15 COBIT, `capability.assessment`): aquélla gradúa una capacidad, ésta gradúa cómo se gestiona la
   organización entera. Conviven y JAMÁS se promedian, por eso cada una lleva su `esc`.
   Cada nivel se apoya en `evid` (nodos reales del twin). La dimensión `estrategia` bajó de 3 a 2 con
   la auditoría de esta misma sesión: el directorio gobernaba la ejecución sin resultado, sin caja, sin
   presupuesto y sin acuerdos — y dos metas del año siguen sin bajar a ninguna gerencia. */
DATA.autoevaluacion={ esc:'iso9004-1-5', evaluadaEn:'ses-jul', fuente:'autoevaluación asistida (ISO 9004) sobre evidencia del twin', dims:[
  {d:'liderazgo',  actual:3, deseado:4, evid:['ac-41','g-tes'],            porque:'la dirección decide y acuerda, pero un acuerdo suyo lleva dos sesiones vencido'},
  {d:'estrategia', actual:2, deseado:4, evid:['o-hog','o-eq'], frena:true, porque:'dos metas del año sin bajar a ninguna gerencia · mezcla de ambición y apetito de expansión sin fijar'},
  {d:'recursos',   actual:2, deseado:3, evid:['g-tes','g-dep'],           porque:'una jefatura vacante hace 5 meses y un proceso que depende de una sola persona'},
  {d:'procesos',   actual:2, deseado:4, evid:['g-doc','g-cvis','g-prov'], frena:true, porque:'procesos críticos sin procedimiento escrito, sin dato entre cierres y sin evaluación de terceros'},
  {d:'mejora',     actual:3, deseado:4, evid:['pm-cie','g-post'],         porque:'el ciclo cierra de verdad (un proyecto movió su indicador y se recompiló), pero el hallazgo de postventa lleva un año sin meta'},
]};
const AMBICION={operar:'operar el hoy', expandir:'expandir', transformar:'apostar al futuro'};
/* contraste riesgo↔apetito por categoría (derivado al leer) — lo usan tarjeta Y ficha (v15.1) */
const CATNM={liquidez:'liquidez', reputacion:'reputación', expansion:'expansión'};
const NIVR={baja:0,bajo:0,media:1,medio:1,alta:2,alto:2};
function contraste(a){ const raw=DATA.apetito[a.riesgo_cat]||'';
  if(/sin definir/.test(raw)||!(raw.split(' ')[0] in NIVR)) return {t:`apetito de ${CATNM[a.riesgo_cat]} sin definir — fíjalo ⚠`, c:'var(--warn)'};
  const ap=raw.split(' ')[0], d=NIVR[a.riesgo]-NIVR[ap];
  return d>0? {t:`excede tu apetito de ${CATNM[a.riesgo_cat]} (${ap})`, c:'var(--crit)'}
       : d===0? {t:`al límite del apetito de ${CATNM[a.riesgo_cat]} (${ap})`, c:'var(--warn)'}
       : {t:`dentro del apetito de ${CATNM[a.riesgo_cat]} (${ap})`, c:'var(--tx-mut)'}; }
/* ===== EL HILO, DERIVADO — v19 (A2 · D-34 · D-35) =====
   El KR es un CONTRATO DE CAMBIO sobre la serie de un KPI que ya se mide (misma serie, distinto
   contrato — M21). Por eso su valor actual se LEE de la última medición y NUNCA se guarda al lado:
   dos copias del mismo número es cómo el tablero del directorio y el del gerente empiezan a decir
   cosas distintas. Un KR sin serie se muestra como meta DECLARADA, jamás como meta medida. */
const krKpi=kr=>kr&&kr.kpi?byId(DATA.kpis,kr.kpi):null;
function krCur(kr){ const k=krKpi(kr); return k?kcur(k):(kr&&kr.cur!=null?kr.cur:null); }
/* progreso de un KR hacia su meta (0-1, clamp) — domain [from,to], funciona en ambas direcciones
   (meta mayor o menor que el origen); usado por el meter del rumbo (dataviz skill: "ratio contra límite") */
function krProg(kr){ const cur=krCur(kr); if(cur==null) return 0;
  const span=kr.to-kr.from; if(!span) return 0;
  return Math.max(0,Math.min(1,(cur-kr.from)/span)); }
/* v17.2 (A4.1) · salud DERIVADA del KR — avance real vs esperado a hoy ("se computa, jamás se
   guarda", mismo principio que semaforo() para KPI y que los scores M36). Sin serie o sin plan a
   hoy: GRIS — la ausencia de dato jamás pinta rojo. */
function saludKr(kr){ const cur=krCur(kr);
  if(cur==null||kr.esperado==null) return 'gris';
  const dir=kr.to>=kr.from?1:-1, av=(cur-kr.from)*dir, esp=(kr.esperado-kr.from)*dir;
  if(esp<=0) return 'gris'; const r=av/esp;
  return r>=0.95?'verde':r>=0.75?'ambar':'rojo'; }
/* salud del OBJETIVO = peor de sus KRs (rollup `peor-hijo` declarado — un objetivo con un contrato
   cumplido y otro roto NO está verde; es exactamente el caso de «caja sana»: la cobranza consolidada
   llegó a la meta y la caja del día sigue sin dato). El gris no gana: informa. */
/* El GRIS pesa entre verde y ámbar, a propósito: un objetivo con un contrato cumplido y otro SIN DATO
   no puede leerse verde ("no sé si va bien" ≠ "va bien"), pero tampoco rojo — la ausencia de dato
   jamás pinta rojo. Es el caso de «caja sana»: la cobranza consolidada llegó a la meta y la caja del
   día no tiene serie; leerlo verde era exactamente el error que la auditoría encontró. */
const PEOR={rojo:4,ambar:3,gris:2,verde:1};
function objSalud(o){ const ss=(o.krs||[]).map(saludKr);
  if(!ss.length) return 'gris';
  return ss.reduce((w,s)=>PEOR[s]>PEOR[w]?s:w, ss[0]); }
/* la BAJADA (D-35) — derivada del grafo `parent`, jamás un contador escrito a mano */
const objHijos=id=>DATA.objetivos.filter(o=>o.parent===id);
const objRaiz=()=>DATA.objetivos.filter(o=>!o.parent);
const esDirectorio=o=>!o.parent;
function bajada(o){ const hs=objHijos(o.id);
  return { hijos:hs, acordados:hs.filter(h=>h.acordado).length, sin:hs.filter(h=>!h.acordado) }; }
/* metas del directorio que nadie abrió en una gerencia · y bajadas que se asignaron sin acordar:
   las dos preguntas con que arranca una revisión, derivadas del grafo y no de un contador */
const sinBajar=()=>objRaiz().filter(o=>!objHijos(o.id).length);
const sinAcordar=()=>DATA.objetivos.filter(o=>o.parent&&!o.acordado);
/* lo que el directorio le dejó a UNA gerencia — la pregunta que hace el gerente al abrir Cockpit */
const metasDeArea=aid=>DATA.objetivos.filter(o=>o.area===aid);
/* los KPI que contribuyen a un KR + el control de pesos (D-36): si no suman 1, o falta un indicador o
   el peso está sin normalizar — las dos se DECLARAN, ninguna se completa sola */
const kpisDeKr=krid=>DATA.kpis.filter(k=>k.kr===krid);
function pesoKr(krid){ const ks=kpisDeKr(krid); if(!ks.length) return null;
  return +(ks.reduce((s,k)=>s+(k.peso||0),0)).toFixed(2); }
const krsDe=o=>o.krs||[];
const krById=id=>{ for(const o of DATA.objetivos){ const k=(o.krs||[]).find(x=>x.id===id); if(k) return {kr:k,obj:o}; } return null; };
// `o.salud` (derivada) y `o.kr` (= KR principal, compat de render) se calculan en 40-motores.js,
// después de que exista el motor de indicadores del que ahora dependen (kcur/semaforo).
/* costo de esperar de un proyecto — heredado de la brecha que ataca, normalizado a S/ k/mes */
function codMes(pm){ const g=pm.brecha&&byId(DATA.brechas,pm.brecha); if(!g||!g.costo) return null;
  const m=g.costo.match(/S\/\s*([\d.]+)k\/(mes|año)/); if(!m) return null;
  return {mes:m[2]==='mes'?+m[1]:Math.round(+m[1]/12), raw:g.costo}; }
function mezclaReal(){  // rollup al leer: apuestas + proyectos + ideas etiquetadas — jamás persistido
  const pool=[...DATA.apuestas,...DATA.proyectos,...DATA.ideas].filter(x=>x.ambicion);
  const n={operar:0,expandir:0,transformar:0}; pool.forEach(x=>n[x.ambicion]++);
  const t=pool.length||1;
  return {operar:Math.round(n.operar*100/t), expandir:Math.round(n.expandir*100/t),
          transformar:Math.round(n.transformar*100/t), n:t}; }
DATA.objetivos.find(o=>o.id==='o-lid').bono=true;    // ★ solo pinta en modo GPD/mixto (RN-14)
DATA.objetivos.find(o=>o.id==='o-caja').bono=true;
/* historial de la organización — toda acción, versionada (semilla = las ya aplicadas de la cola) */
DATA.historial=[
  'hace 2 días · <b>Consultor</b> · corrigió el verbo de la actividad 05 ("transportar" → "visitar") · directa + acuse',
  'hace 3 días · <b>Jefe de Cobranza</b> · registró la medición "DSO Marina" julio: 91 días · directa',
  'hace 2 sem · <b>Contador General</b> · cerró "Cierre contable exprés" — veredicto: movió (9 → 4.5 días) · gestión-de-cambios',
];

