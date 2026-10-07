/* ---------- v14 · NIVEL 1 — sala del directorio como tablero (la sala de mando, promovida) ----------
   v18 · REORGANIZADA como la AGENDA de una sesión de directorio, en 4 movimientos:
     1 ¿cómo nos fue?     — el resultado del periodo y la caja   (lo que antes no existía)
     2 ¿a dónde vamos?    — rumbo · apuestas (prometido vs cobrado) · las varas y el presupuesto
     3 ¿qué puede impedirlo? — riesgos · alertas · inversiones · proyectos
     4 ¿qué decidimos?    — la bandeja (decisiones REALES) · acuerdos anteriores · el acta
   Toda la página es agnóstica de industria: cambia el contenido de las filas, jamás las
   preguntas — cada bloque nuevo lo declara en su línea de equivalencias (`.paral`). */
function bandejaRows(items){ return items.map(r=>`<button class="cambio-row${r.warn?' warnrow':''}" ${r.go||''}>
    <span class="sc">${r.warn?'▲':'·'}</span><div><div class="tt">${r.t}</div>${r.d?`<div class="ap">${r.d}</div>`:''}</div>
    <span class="ap">${r.apr}</span></button>`).join(''); }

/* la caja en 13 semanas contra el piso — un solo gráfico, la pregunta del directorio contestada
   de un vistazo (dataviz: serie corta + línea de referencia; el color sólo marca lo que cae debajo) */
function cajaSVG(){ const k=DATA.caja, w=306, h=74, top=10, bot=h-16, n=k.semanas.length;
  const max=Math.max(...k.semanas,k.piso)*1.12;
  const sx=i=>6+i*(w-12)/(n-1), sy=v=>bot-(v/max)*(bot-top);
  const pts=k.semanas.map((v,i)=>`${sx(i).toFixed(1)},${sy(v).toFixed(1)}`);
  const iMin=k.semanas.indexOf(Math.min(...k.semanas)), yP=sy(k.piso).toFixed(1);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <path d="M${pts.join(' L')} L${sx(n-1).toFixed(1)},${bot} L${sx(0).toFixed(1)},${bot} Z" fill="rgba(0,183,170,.10)"/>
    <line x1="0" y1="${yP}" x2="${w}" y2="${yP}" stroke="var(--warn)" stroke-width="1" stroke-dasharray="3 3"/>
    <text x="${w-2}" y="${(+yP-3).toFixed(1)}" text-anchor="end" fill="var(--warn)" font-size="8" font-family="var(--font-mono)">piso ${k.piso}</text>
    <polyline points="${pts.join(' ')}" fill="none" stroke="var(--brand-hi)" stroke-width="1.8" stroke-linejoin="round"/>
    ${k.semanas.map((v,i)=>v<k.piso?`<circle cx="${sx(i).toFixed(1)}" cy="${sy(v).toFixed(1)}" r="2.6" fill="var(--crit)"/>`:'').join('')}
    <circle cx="${sx(iMin).toFixed(1)}" cy="${sy(k.semanas[iMin]).toFixed(1)}" r="4.2" fill="none" stroke="var(--crit)" stroke-width="1.3"/>
    <text x="${sx(iMin).toFixed(1)}" y="${(sy(k.semanas[iMin])+13).toFixed(1)}" text-anchor="middle" fill="var(--crit)" font-size="8.5" font-family="var(--font-mono)">${k.semanas[iMin]}</text>
    <text x="6" y="${h-3}" fill="var(--tx-faint)" font-size="8" font-family="var(--font-mono)">hoy</text>
    <text x="${w-6}" y="${h-3}" text-anchor="end" fill="var(--tx-faint)" font-size="8" font-family="var(--font-mono)">semana 13</text>
  </svg>`; }

function renderDirectorio(){
  const objOf=id=>byId(DATA.objetivos,id);
  const stAp=a=>{ const ss=a.objetivos.map(id=>objOf(id).salud); return ss.includes('rojo')?'rojo':ss.includes('ambar')?'ambar':'verde'; };
  const sts=DATA.apuestas.map(stAp), nG=sts.filter(s=>s==='verde').length, nA=sts.filter(s=>s==='ambar').length, nR=sts.filter(s=>s==='rojo').length;
  const ciclo=state.ciclo==='okr'?'este trimestre':state.ciclo==='gpd'?'este año':'trimestre + año';
  const mx=mezclaReal(), mo=DATA.mezclaObjetivo, rb=DATA.rumbo;
  const per=DATA.periodo, caja=DATA.caja, pre=DATA.presupuesto, bajo=cajaBajoPiso();
  const bajGlobal={ hijos:DATA.objetivos.length-objRaiz().length, acordadas:DATA.objetivos.filter(o=>o.parent&&o.acordado).length,
                    sinAcordar:sinAcordar().length, sinBajar:sinBajar().length };
  const mezPre=mezclaPresupuesto();
  /* ── v19 · qué portafolio sube al directorio y cuál se queda en la gerencia. El directorio no
     administra el portafolio: sigue lo que mueve una meta del AÑO o lo que supera una facultad. El
     resto lo gobierna el gerente en el nivel táctico — y se dice, para que no parezca un olvido. ── */
  const metasAnio=new Set(rb.anio);
  const sube=pm=>{ const k=byId(DATA.kpis,pm.mueve), o=k&&objDeKr(k.kr), r=o&&raizDe(o);
    if(r&&metasAnio.has(r.id)) return `mueve «${r.nm}», meta del año`;
    if(pm.estado==='cerrado') return 'cerró con veredicto: la promesa se rinde acá';
    return null; };
  const pmDirectorio=[], pmGerencia=[];
  [...DATA.proyectos].sort((x,y)=>((codMes(y)||{mes:-1}).mes)-((codMes(x)||{mes:-1}).mes))
    .forEach(pm=>{ const por=sube(pm); por?pmDirectorio.push({pm,por}):pmGerencia.push(pm); });

  /* ── la bandeja: primero las decisiones de PLATA (las que un directorio firma de verdad),
     después las que fijan el propio marco. Cada fila dice POR QUÉ le llega al directorio. ── */
  const bandeja=[
    {t:`Aprobar el presupuesto del año — ${pre.total.toFixed(1)} ${pre.u} en tres bolsas`,
     d:'sin presupuesto aprobado, la mezcla de ambición es una intención sin plata detrás', apr:'gestión-de-cambios', go:'data-pres="1"'},
    {t:'Aprobar ampliar la línea de capital de trabajo — S/ 1.0M',
     d:`la caja cae bajo el piso en la semana ${caja.hito.sem} · supera el límite de endeudamiento que el directorio se reservó`,
     apr:'gestión-de-cambios', warn:true, go:'data-acc="aprobar-endeudamiento"'},
    {t:'Aprobar presupuesto adicional para Marina — S/ 1.3M',
     d:'gastó el 92% del presupuesto con 87% de avance real · supera el límite de inversión', apr:'gestión-de-cambios', go:'data-inv="iv-mar"'},
    {t:'Fijar el piso de caja', d:'hoy la proyección se compara contra un piso que nadie firmó', apr:'gestión-de-cambios', go:'data-acc="fijar-piso-caja"'},
    {t:'Sellar la apuesta "Digitalizar la cobranza"', d:'apuesta nueva — su objetivo va en rojo', apr:'gestión-de-cambios', go:'data-ap="ap-cob"'},
    {t:'Aprobar el acta de "Cobranza digital · fase 1"', d:'doble firma: patrocinador ✓ · finanzas pendiente', apr:'gestión-de-cambios', go:'data-pm="pm-cob" data-pm2="pm-cob"'},
    {t:'Fijar el apetito de riesgo de expansión (sin definir)', apr:'gestión-de-cambios', go:'data-acc="fijar-apetito-riesgo"'},
    {t:'Fijar la mezcla de ambición del año', d:`hoy corre el default de industria ${mo.operar}/${mo.expandir}/${mo.transformar} — la mezcla es apetito hecho asignación`, apr:'gestión-de-cambios', go:'data-acc="fijar-mezcla-ambicion"'},
  ];
  /* la bajada ya no es un contador escrito a mano: cada meta sin abrir en una gerencia, y cada
     bajada asignada sin acordar, LLEGA sola a la bandeja desde el grafo de objetivos (D-35) */
  sinBajar().forEach(o=>bandeja.push({t:`Bajar «${o.nm}» a una gerencia`,
    d:'meta del directorio que ninguna gerencia tiene abierta como suya — se mira todos los meses y nadie la trabaja',
    apr:'gestión-de-cambios', warn:true, go:`data-obj="${o.id}"`}));
  sinAcordar().forEach(o=>{ const ga=o.area&&byId(DATA.areas,o.area);
    bandeja.push({t:`Cerrar el acuerdo de bajada con ${ga?ga.nm:'la gerencia'}`,
      d:`«${o.nm}» está asignada pero nadie registró que la gerencia la aceptara ni que fuera factible`,
      apr:'revisión-dueño', go:`data-obj="${o.id}"`}); });
  if(state.ciclo!=='okr') bandeja.push({t:'Decidir qué metas pagan bono este año ★', d:'acople compensación — solo en modo anual/mixto (RN-14)', apr:'gestión-de-cambios', go:'data-acc="convocar-rendicion"'});

  /* rumbo: cada meta del año = barra de avance coloreada por salud + contraste riesgo↔apetito en el title */
  const brkHTML=rb.anio.map(oid=>{ const o=objOf(oid), ap=DATA.apuestas.find(a=>a.objetivos.includes(oid)),
      ct=ap?contraste(ap):null, p=krProg(o);
    return `<button class="brk" data-obj="${oid}"${ct?` title="${ct.t.replace(/"/g,'&quot;')}"`:''}>
      <span class="brknm">${o.nm}${o.bono?' <b style="color:var(--warn)">★</b>':''}</span>
      <svg width="88" height="8" viewBox="0 0 88 8" aria-hidden="true">
        <rect x="0" y="2" width="88" height="4" rx="2" fill="var(--border)"/>
        <rect x="0" y="2" width="${(p*88).toFixed(1)}" height="4" rx="2" fill="${health[o.salud]}"/>
      </svg>
      <span class="mtrlab">${krCur(o.kr)==null?'s/d':krCur(o.kr)}${o.kr.u} <span style="color:var(--tx-faint)">/</span> ${o.kr.to}${o.kr.u}</span></button>`; }).join('');

  /* las cifras del periodo — la variación contra plan y contra el año pasado se DERIVA al leer */
  const tilesHTML=per.cifras.map(c=>{ const vp=varia(cifraValor(c),c.plan,c.dir), va=varia(cifraValor(c),c.ant,c.dir);
    const res=c.res&&byId(DATA.objetivos,c.res), ra=res&&res.area&&byId(DATA.areas,res.area);
    return `<button class="ftile est-${vp.est}" data-cif="${c.id}" title="${c.que} — clic = la ficha, de dónde sale y quién la mueve">
      <span class="flab">${c.nm}</span>
      <span class="fv">${fmtN(cifraValor(c),c.dec)}<small>${c.u}</small></span>
      <span class="fd"><span style="color:${health[vp.est]}">${fmtPct(vp.pct)} vs plan</span><span class="sep">·</span><span>${fmtPct(va.pct)} vs año pasado</span></span>
      <span class="fy">año: ${fmtN(c.ytd,c.dec)} de ${fmtN(c.ytdPlan,c.dec)} ${c.u}</span>
      <span class="fres" style="color:${res?'var(--tx-mut)':'var(--warn)'}">${res?`la mueve ${ra?ra.nm:'—'}`:'sin nadie que la mueva'}</span></button>`; }).join('');

  /* riesgos: nivel derivado (probabilidad × impacto) y contraste contra el apetito ya firmado */
  const riesgoHTML=[...DATA.riesgos].sort((a,b)=>NIV[b.prob]*NIV[b.imp]-NIV[a.prob]*NIV[a.imp]).map(r=>{
    const n=nivelRiesgo(r), ct=riesgoVsApetito(r);
    return `<button class="rgrow" data-rg="${r.id}"><span class="lv" style="border-color:${n.c};color:${n.c}">${n.t}</span>
      <span class="rb"><span class="rt">${r.nm}</span><span class="rm">${CATNM[r.cat]} · lo responde <b>${r.dueno}</b> — <span style="color:${ct.c}">${ct.t}</span>${r.mitig&&!/Sin mitigaci/.test(r.mitig)?'':' · <span style="color:var(--crit)">sin mitigación comprometida</span>'}</span></span>
      <span class="tn" style="color:${r.tend==='sube'?'var(--crit)':r.tend==='baja'?'var(--ok)':'var(--tx-faint)'}">${TEND[r.tend]}</span></button>`; }).join('');

  /* inversiones: el mismo renglón sirve para obras, planta, tiendas o contratos — la fila es la industria */
  const invHTML=DATA.inversiones.map(iv=>{ const dv=desvioAvance(iv), tarde=iv.entrega!==iv.entregaComp;
    const gp=Math.round(iv.gasto/iv.presu*100), cp=Math.round(iv.compro/iv.meta*100);
    return `<button class="invrow" data-inv="${iv.id}">
      <span class="in">${iv.nm}${dv?` <b style="color:var(--crit)" title="reporta ${iv.avanceDecl}% y el avance real es ${iv.avance}% — así se infla el valor de lo construido">▲ ${dv} pts</b>`:''}</span>
      <span class="im"><span class="lab">avance real</span><span class="tr"><i style="width:${iv.avance}%"></i>${dv?`<u style="left:${iv.avanceDecl}%" title="avance declarado ${iv.avanceDecl}%"></u>`:''}</span><span class="vl">${iv.avance}%${dv?` · declarado ${iv.avanceDecl}%`:''}</span></span>
      <span class="im"><span class="lab">gastado del presupuesto</span><span class="tr"><i class="${gp>iv.avance+5?'crit':gp>iv.avance?'warn':''}" style="width:${Math.min(100,gp)}%"></i><u style="left:${iv.avance}%" title="avance real ${iv.avance}% — la referencia honesta del gasto"></u></span><span class="vl">${iv.gasto} de ${iv.presu} ${iv.u}</span></span>
      <span class="im"><span class="lab">ya comprometido</span><span class="tr"><i style="width:${Math.min(100,cp)}%"></i></span><span class="vl">${iv.compro} de ${iv.meta} ${iv.u}</span></span>
      <span class="ie" style="color:${tarde?'var(--crit)':'var(--tx-mut)'}">${iv.entrega}${tarde?`<br><span style="color:var(--tx-faint)">prometida ${iv.entregaComp}</span>`:'<br><span style="color:var(--tx-faint)">en fecha</span>'}</span></button>`; }).join('');

  /* ── las alertas se DERIVAN (v19): brechas accionables de severidad alta + indicadores fuera de
     banda sin contramedida + puestos clave vacantes. Cada una declara DÓNDE se resuelve: la meta
     bajada que la trabaja y la gerencia que responde. Antes eran cuatro filas escritas a mano —
     y por eso ninguna decía quién debía moverla. ── */
  const alertas=[];
  DATA.brechas.filter(g=>g.sev==='alta'&&g.estado==='accionable').forEach(g=>{
    const o=objDeKr(g.kr), ar=o&&o.area&&byId(DATA.areas,o.area);
    alertas.push({t:g.nm, costo:g.costo, crit:true, go:`data-g="${g.id}" data-g2="${g.id}"`,
      quien:ar?ar.nm:'sin gerencia asignada', meta:o?o.nm:null, metaId:o?o.id:null}); });
  DATA.kpis.filter(k=>!k.kr&&semaforo(k)==='rojo').forEach(k=>{
    const g=k.gap&&byId(DATA.brechas,k.gap), p=byId(DATA.procesos,k.proc), ar=p&&byId(DATA.areas,p.areas[0]);
    alertas.push({t:`${k.nm}: ${kcur(k)}${k.unidad||''} y ninguna meta del ciclo la mide`, costo:'sin ancla de valor',
      go:`data-k="${k.id}"`, quien:ar?ar.nm:'—', meta:null, nota:g?`la recoge la brecha «${g.nm.slice(0,44)}…»`:'ninguna brecha la recoge todavía'}); });
  DATA.areas.filter(a=>a.vacante).forEach(a=>alertas.push({t:`${a.vacante} — y es la firma que falta en la proyección de caja`,
    costo:'sin persona', go:`data-area="${a.id}"`, quien:a.nm, meta:null}));
  const alertasHTML=alertas.map(al=>`<button class="cambio-row${al.crit?'':' warnrow'}" ${al.go}><span class="sc" style="color:${al.crit?'var(--crit)':'var(--warn)'}">▲</span>
      <div><div class="tt">${al.t}</div><div class="ap" style="white-space:normal">lo resuelve <b>${al.quien}</b>${al.meta?` · meta bajada: ${al.meta}`:''}${al.nota?` · ${al.nota}`:''}</div></div>
      <span class="ap" style="color:${al.crit?'var(--crit)':'var(--warn)'}">${al.costo}</span></button>`).join('');

  const acuHTML=DATA.acuerdos.map(a=>{ const c=ACUC[a.estado]||'var(--tx-mut)';
    return `<button class="acurow" data-acu="${a.id}"><span class="ae" style="border-color:${c};color:${c}">${a.estado}</span>
      <span class="ab"><span class="at">${a.nm}</span><span class="aq">${a.quien} · acordado en la ${sesNm(a.sesion)||a.sesion} · vence ${a.plazo}</span></span></button>`; }).join('');
  const acuVenc=DATA.acuerdos.filter(a=>a.estado==='vencido').length,
        acuCumpl=DATA.acuerdos.filter(a=>a.estado==='cumplido').length;

  const pv=pageView(`
    <div class="pv-hd"><span class="eyebrow">Nivel 1 · Directorio — sesión mensual · ${per.nm} (${per.ciclo})</span>
      <h2>Sala del directorio</h2>
      <div class="sub">La sesión, en el orden en que se hace: cómo nos fue · a dónde vamos · qué puede impedirlo · qué decidimos. El directorio no navega el detalle: decide — y cada decisión queda en el historial de la organización. <b>Las cuatro preguntas son las mismas en cualquier industria</b>; lo que cambia es el contenido de las filas.</div></div>

    <div class="secband"><span class="n">Movimiento 1</span><h3>¿Cómo nos fue?</h3>
      <span class="q">el resultado del periodo y la caja</span>${respBadge('dir-resultado')}</div>

    <div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
        <span class="eyebrow">El resultado de ${per.nm} — contra el plan y contra el año pasado</span>
        <span class="cierrechip ${per.cierre}" title="${per.cierra}">dato ${per.cierre}</span>
        <span class="plnk" data-alc="1" style="font-size:11px;color:var(--brand-hi)">¿De dónde sale y qué NO reexpresa Cockpit? ›</span></div>
      <div class="fintiles">${tilesHTML}</div>
      <div class="paral"><b>El mismo puñado de cifras en cualquier industria:</b> cuánto entró · cuánto quedó de cada unidad vendida · cuánto costó sostener la operación · cuánto quedó al final · cuánta caja hay · cuánto se debe. Cockpit no arma los estados financieros: los <b>lee</b> del sistema contable con su estado de cierre y los <b>baja</b> al proceso y al área que los produce — eso es lo que ningún tablero contable hace.</div>
    </div>

    <div class="dirgrid">
      <div class="dpane"><div class="pt">La caja — 13 semanas contra el piso${respBadge('dir-caja')}</div>
        <div class="cajawrap">
          <div class="cajanum"><span class="big" style="color:var(--brand-hi)">${caja.saldo} ${caja.u}</span>
            <span class="sm">hoy · piso ${caja.piso} ${caja.u}${caja.pisoFijado?'':' <b style="color:var(--warn)">por firmar</b>'}</span>
            <span class="sm" style="color:${bajo?'var(--crit)':'var(--ok)'}">${bajo?bajo+' semanas bajo el piso':'sin semanas bajo el piso'}</span></div>
          <div class="cajasvg"><button class="brk" data-caja="1" style="width:100%" title="clic = la ficha de la caja, sus resguardos y quién la firma">${cajaSVG()}</button>
            <div style="font-family:var(--font-mono);font-size:9px;color:var(--tx-faint)">semana ${caja.hito.sem}: ${caja.hito.nm}</div></div></div>
        <div style="font-size:11px;color:var(--warn);line-height:1.45;margin-top:6px">⚠ confianza baja: ${caja.confPorque}</div></div>

      <div class="dpane"><div class="pt">Los límites con el banco — y la línea disponible</div>
        ${caja.resguardos.map(r=>`<div class="resg"><span class="rn">${r.nm}</span><span class="rl">${r.lim}</span><span class="rv" style="color:${health[r.est]}">${r.v} · ${r.holgura}</span></div>`).join('')}
        <div class="resg"><span class="rn">Línea de crédito</span><span class="rl">disponible ${caja.lineas.disponible} ${caja.u}</span><span class="rv">${caja.lineas.usado} ${caja.u} usado</span></div>
        <div class="paral"><b>Toda empresa financiada tiene esto:</b> un piso de caja que no se cruza y límites que impone quien le presta. Romper un límite puede obligar a pagar la deuda por adelantado — por eso se mira ANTES de aprobar más inversión o más deuda.</div></div>
    </div>

    <div class="secband"><span class="n">Movimiento 2</span><h3>¿A dónde vamos?</h3>
      <span class="q">el rumbo, las apuestas y las varas que este directorio firma</span></div>

    <div class="rumbo"><div class="pt">El rumbo — lo que este directorio prometió${respBadge('dir-rumbo')}</div>
      <div class="rrow"><span class="k">Visión ${DATA.empresa.visionHoriz}</span>«${DATA.empresa.vision}»</div>
      <div class="rrow brks"><span class="k">Este año</span>${brkHTML}</div>
      <div class="rrow"><span class="k">La bajada</span><span style="font-size:12px">${bajGlobal.hijos} metas abiertas en gerencias · <b style="color:${bajGlobal.sinAcordar?'var(--warn)':'var(--ok)'}">${bajGlobal.acordadas} con el acuerdo cerrado</b>${bajGlobal.sinBajar?` · <b style="color:var(--warn)">${bajGlobal.sinBajar} meta${bajGlobal.sinBajar>1?'s':''} del directorio sin bajar</b>`:''}
        <br><span style="font-size:10.5px;color:var(--tx-faint)">una meta que ninguna gerencia abrió como suya no se ejecuta sola; una asignada sin acuerdo, tampoco</span></span></div>
      <div class="rrow"><span class="k">Este trimestre</span>${DATA.apuestas.length} apuestas · ${objRaiz().length} metas del directorio · ${DATA.objetivos.length-objRaiz().length} bajadas a gerencias</div>
    </div>

    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="eyebrow">Las apuestas — lo prometido y lo cobrado · clic = ficha y acciones${respBadge('dir-apuestas')}</span>
      <span class="pulso-dots" title="¿avanzan las apuestas ${ciclo}?">${DATA.apuestas.map((a,i)=>{ const lbl={verde:'en meta',ambar:'cerca',rojo:'fuera de meta'}[sts[i]];
        return `<i data-ap="${a.id}" style="background:${health[sts[i]]}" title="${a.nm} — ${lbl} · clic = ficha de la apuesta"></i>`; }).join('')}</span>
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--tx-mut)">${nG} en meta · ${nA} cerca · ${nR} fuera${respBadge('dir-pulso')}</span></div>
    <div class="apcards" style="margin-top:-4px">${DATA.apuestas.map((a,i)=>{ const objs=a.objetivos.map(objOf), ct=contraste(a), cb=a.valor.cobrado;
      return `<button class="apcard" data-ap="${a.id}"><span class="un">apuesta ${a.estado==='por-sellar'?'· <b style="color:var(--warn)">por sellar</b>':'· '+a.estado} · ${AMBICION[a.ambicion]}</span>
        <span class="nm">${a.nm}</span>
        <span class="mt" style="color:var(--brand-hi)" title="Supuesto: ${a.valor.supuesto}">persigue ${a.valor.s}</span>
        ${cb&&cb.v!=null?`<span class="cobr${cb.v?'':' nada'}" title="${cb.nota} — verificado por ${cb.verif}"><span>cobrado</span><span class="bar"><i style="width:${Math.min(100,cb.pct)}%"></i></span><span style="color:${cb.v?'var(--ok)':'var(--tx-faint)'}">${cb.v?cb.v+' '+cb.u:'nada aún'}</span></span>`
          :`<span class="cobr nada" title="${cb?cb.nota:'sin dato de cobro'}"><span>cobrado</span><span class="bar"><i style="width:0%"></i></span><span style="color:var(--tx-faint)">${cb?cb.estado:'—'}</span></span>`}
        <span class="mt"><span class="health-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${health[sts[i]]};margin-right:5px"></span>${objs.map(o=>o.kr.m).join(' · ')}</span>
        <span class="mt">riesgo <b style="color:${a.riesgo==='alto'?'var(--crit)':'var(--warn)'}">${a.riesgo}</b> · sostiene ${objs.length} objetivo${objs.length>1?'s':''}</span>
        <span class="mt" style="color:${ct.c}">${ct.t}</span></button>`; }).join('')}</div>

    <div class="dirgrid">
      <div class="dpane"><div class="pt">Las varas — riesgo que toleras · futuro que compras${respBadge('dir-varas')}</div>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--tx-mut)">apetito: liquidez <b style="color:var(--warn)">${DATA.apetito.liquidez}</b> · reputación <b style="color:var(--ok)">${DATA.apetito.reputacion}</b> · expansión <b style="color:var(--crit)">${DATA.apetito.expansion}</b></span>
        <div class="mixwrap">
          <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--tx-faint)">Ambición del portafolio — por CONTEO de iniciativas (${mx.n}); la de plata está abajo</span>
          <div class="mixbar">
            <div class="seg s-op" style="width:${mx.operar}%" title="operar el hoy — ${mx.operar}% real"></div>
            <div class="seg s-ex" style="width:${mx.expandir}%" title="expandir — ${mx.expandir}% real"></div>
            <div class="seg s-tr" style="width:${mx.transformar}%" title="apostar al futuro — ${mx.transformar}% real"></div>
            <div class="mixmark" style="left:${mo.operar}%" title="mezcla objetivo: hasta aquí operar el hoy (${mo.operar})"><i>▽${mo.operar}</i></div>
            <div class="mixmark" style="left:${mo.operar+mo.expandir}%" title="mezcla objetivo: hasta aquí expandir (+${mo.expandir})"><i>▽${mo.operar+mo.expandir}</i></div>
          </div>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--tx-mut)"><b style="color:var(--brand-hi)">${mx.operar}</b> operar el hoy · <b>${mx.expandir}</b> expandir · <b>${mx.transformar}</b> apostar al futuro — objetivo ${mo.operar}/${mo.expandir}/${mo.transformar} <b style="color:var(--warn)">por fijar</b>
            <br><span style="font-size:9px;color:var(--tx-faint)">tres lecturas de lo mismo, en tres unidades: la VARA (%) · el PRESUPUESTO (plata, panel de al lado) · esta barra (conteo). La que compra futuro es la plata.</span></span>
        </div></div>

      <div class="dpane"><div class="pt">El presupuesto del año — la mezcla, en plata${respBadge('dir-presupuesto')}</div>
        <div class="budg">${pre.bolsas.map(b=>`<div class="budgrow"><span class="bn">${b.nm}</span>
          <span class="bt"><i style="width:${(usoBolsa(b)*100).toFixed(0)}%"></i></span>
          <span class="bv">${b.comprometido.toFixed(2)} / ${b.asignado.toFixed(1)} ${pre.u}</span></div>`).join('')}</div>
        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--tx-mut);margin-top:2px">reparte <b style="color:${mezPre.desvia.length?'var(--warn)':'var(--ok)'}">${mezPre.operar}/${mezPre.expandir}/${mezPre.transformar}</b> contra la vara ${mo.operar}/${mo.expandir}/${mo.transformar}${mezPre.desvia.length?` — <span style="color:var(--warn)">no coincide en ${mezPre.desvia.join(' y ')}</span>`:' — coincide'}</div>
        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--warn);margin-top:2px">${pre.total.toFixed(1)} ${pre.u} · ${pre.estado} — <span class="plnk" data-pres="1" style="color:var(--brand-hi)">ver el presupuesto y las facultades ›</span></div>
        <div class="paral"><b>La misma vara en toda industria:</b> cuánta plata sostiene el hoy y cuánta compra futuro. Sin presupuesto aprobado, la mezcla de ambición es una intención; con presupuesto, es una decisión con firma. <b>Alcance:</b> este presupuesto es el ${pre.alcance}; NO incluye ${pre.noIncluye} — son dos plata distintas y no se suman.</div></div>
    </div>

    <div class="secband"><span class="n">Movimiento 3</span><h3>¿Qué puede impedirlo?</h3>
      <span class="q">riesgos, excepciones que escalaron e inversiones en curso</span></div>

    <div class="dirgrid">
      <div class="dpane"><div class="pt">Los riesgos — contra el apetito que firmaste${respBadge('dir-riesgos')}</div>
        ${riesgoHTML}
        <div class="paral"><b>El registro es el mismo en toda industria;</b> cambian las categorías que pesan: en banca la liquidez, en salud y construcción el cumplimiento y la seguridad, en tecnología la dependencia de personas clave.</div></div>

      <div class="dpane"><div class="pt">Alertas que escalaron — y quién las resuelve${respBadge('dir-alertas')}</div>
        ${alertasHTML}
        <div class="paral"><b>Sube lo que nadie resolvió abajo, no todo lo que está mal.</b> Cada alerta dice de qué gerencia es y qué meta bajada la trabaja: el directorio no arregla la alerta — pregunta por ella al que la tiene. Sin destinatario, una alerta es un reproche mensual.</div></div>
    </div>

    <div class="dirgrid">
      <div class="dpane"><div class="pt">Inversiones en curso — avance real · gastado · ya comprometido${respBadge('dir-inversiones')}</div>
        ${invHTML}
        <div class="paral"><b>Aquí van las inversiones grandes de cada industria:</b> obras en desarrollo inmobiliario · ampliación de planta en manufactura · tiendas nuevas en retail · contratos plurianuales en servicios · líneas de producto en software. La fila no cambia: <b>avance real</b> (no el declarado) · <b>gastado contra presupuesto</b> · <b>ya comprometido</b> · fecha de entrega · margen proyectado.</div></div>
    </div>

    <div class="dirgrid">
      <div class="dpane"><div class="pt">Proyectos que el directorio sigue — los que mueven una meta del año${respBadge('dir-portafolio')}</div>
        ${pmDirectorio.map(({pm,por})=>{ const cod=codMes(pm);
          return `<button class="cambio-row" data-pm="${pm.id}" data-pm2="${pm.id}"><span class="sc">${pm.pdca}</span><div><div class="tt">${pm.nm}</div><div class="ap" style="white-space:normal">${pm.estado} · ${pm.delta} · ${AMBICION[pm.ambicion]}${cod?` · <b style="color:var(--crit)">esperar: ${cod.raw}</b>`:''}<br><span style="color:var(--tx-faint)">sube porque ${por}</span></div></div><span class="ap" style="color:var(--brand-hi)" title="retorno del caso: lo que devuelve sobre lo que cuesta">ROI ${pm.roi}</span></button>`; }).join('')}
        ${pmGerencia.length?`<div style="font-size:11px;color:var(--tx-faint);margin-top:6px;border-top:1px solid var(--border);padding-top:5px">
          Otros <b>${pmGerencia.length}</b> los sigue la gerencia y no suben acá: ninguno mueve una meta del año ni supera una facultad. <span class="plnk" id="verPortafolio" style="color:var(--brand-hi)">verlos en el nivel táctico ›</span></div>`:''}
        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--tx-faint);margin-top:6px">la prioridad se ordena DENTRO de cada bolsa, jamás entre bolsas</div></div>

      <div class="dpane"><div class="pt">Qué cambió desde la última sesión (hace 30 días)${respBadge('dir-cambio30')}</div>
        <div style="font-size:12px;color:var(--tx-mut);line-height:1.8">· resultado del mes: <b style="color:var(--crit)">0.30 contra 0.51 de plan</b> — la brecha viene de menos ingreso y más gasto<br>· caja: 2.8 → <b style="color:var(--crit)">2.1 ${caja.u}</b>, y la proyección cruza el piso en la semana ${caja.hito.sem}<br>· cobranza Marina: 90 → 91 días (se degrada)<br>· "Cierre exprés" CERRÓ con veredicto: <b style="color:var(--ok)">movió</b> (9 → 4.5 días)<br>· satisfacción de propietarios 35 → 31 — sigue sin meta que la mida<br>· ${bandeja.length} decisiones esperan tu firma</div></div>
    </div>

    <div class="secband"><span class="n">Movimiento 4</span><h3>¿Qué decidimos?</h3>
      <span class="q">lo que espera firma, lo que se acordó la vez pasada y el acta</span></div>

    <div class="dirgrid">
      <div class="dpane solid"><div class="pt">Espera tu decisión · ${bandeja.length}${respBadge('bandeja')}</div>${bandejaRows(bandeja)}
        <div class="paral"><b>Le llega al directorio por monto o por materia:</b> inversión sobre S/ 500k · endeudamiento sobre S/ 1.0M · contrato sobre S/ 300k · venta de un activo. Debajo de esos límites decide la gerencia, y queda igual en el historial.</div></div>

      <div class="dpane"><div class="pt">Acuerdos de la sesión anterior — ${acuCumpl} cumplidos · ${acuVenc} vencido${respBadge('dir-acuerdos')}</div>
        ${acuHTML}
        <div class="paral"><b>Toda sesión de directorio arranca igual, en cualquier industria:</b> qué se acordó la vez pasada, quién respondía y si respondió. Un acuerdo sin responsable y sin plazo no es un acuerdo: es una conversación.</div></div>
    </div>

    <div class="actabar">
      <div class="at2"><b>Cerrar la sesión genera el acta.</b> El acta se arma sola con lo que se decidió hoy y los acuerdos que quedan abiertos — con responsable y plazo — y queda versionada como cualquier otro dato de la organización. La próxima sesión abre con ella.</div>
      <button class="btn" data-acc="cerrar-sesion">Cerrar la ${sesVigente().nm} y generar el acta › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · directa</span></button></div>
    <div class="scrollhint">rueda para recorrer la sesión · los cuatro movimientos, en orden</div>`);
  wireLinks(pv);
  const vp=pv.querySelector('#verPortafolio'); if(vp) vp.onclick=()=>gotoNivel(3);
  counter(`${per.nm} · resultado ${fmtN(per.cifras[3].v,2)} ${per.cifras[3].u} (plan ${fmtN(per.cifras[3].plan,2)}) · ${bandeja.length} decisiones esperan firma · ${acuVenc} acuerdo vencido`);
}
