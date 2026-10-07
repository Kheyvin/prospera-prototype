/* ============================================================
   v18 · FICHAS DEL GOBIERNO DEL DIRECTORIO
   Misma gramática de ficha universal (qué-es · hilo · pulso · acciones · procedencia).
   Regla de la superficie: el código de la norma contable vive SOLO acá dentro, como
   procedencia — jamás en pantalla (mismo trato que los códigos de las cartas del método).
   ============================================================ */

/* chips de "hacia dónde baja esta cosa en el twin" — el hilo nunca se corta */
function refChips(ref){ if(!ref) return '';
  const c=[];
  if(ref.obj) c.push(`<span class="chip lk" data-obj="${ref.obj}">${byId(DATA.objetivos,ref.obj).nm}</span>`);
  if(ref.g)   c.push(`<span class="chip lk" data-g2="${ref.g}">${byId(DATA.brechas,ref.g).nm.slice(0,48)}…</span>`);
  if(ref.proc)c.push(`<span class="chip lk" data-proc="${ref.proc}">${byId(DATA.procesos,ref.proc).nm}</span>`);
  if(ref.area)c.push(`<span class="chip lk" data-area="${ref.area}">${byId(DATA.areas,ref.area).nm}</span>`);
  if(ref.ap)  c.push(`<span class="chip lk" data-ap="${ref.ap}">${byId(DATA.apuestas,ref.ap).nm}</span>`);
  if(ref.pm)  c.push(`<span class="chip lk" data-pm2="${ref.pm}">${byId(DATA.proyectos,ref.pm).nm}</span>`);
  if(ref.inv) c.push(`<span class="chip lk" data-inv="${ref.inv}">${byId(DATA.inversiones,ref.inv).nm}</span>`);
  return c.length?`<div class="chips">${c.join('')}</div>`:'<span style="font-size:12px;color:var(--tx-faint)">— sin anclaje declarado en el twin todavía</span>'; }

const cierreChip=()=>{ const p=DATA.periodo;
  return `<span class="cierrechip ${p.cierre}" title="${p.cierre==='preliminar'?p.cierra:'dato cerrado'}">${p.cierre}</span>`; };

/* ===== CIFRA — una línea del resultado del periodo ===== */
function openCifra(c){ if(!c)return; const p=DATA.periodo;
  const vp=varia(c.v,c.plan,c.dir), va=varia(c.v,c.ant,c.dir), vy=varia(c.ytd,c.ytdPlan,c.dir);
  openDrawer('Cifra · resultado del periodo', c.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Qué es</dt><dd style="font-size:12px">${c.que}</dd></div>
     <div class="drow"><dt>${p.nm}</dt><dd class="mono" style="font-size:15px;color:var(--brand-hi)">${fmtN(c.v,c.dec)} ${c.u}</dd></div>
     <div class="drow"><dt>Contra el plan</dt><dd class="mono" style="font-size:12px;color:${health[vp.est]}">${fmtN(c.plan,c.dec)} ${c.u} · ${fmtPct(vp.pct)}</dd></div>
     <div class="drow"><dt>Contra el año pasado</dt><dd class="mono" style="font-size:12px;color:${health[va.est]}">${fmtN(c.ant,c.dec)} ${c.u} · ${fmtPct(va.pct)}</dd></div>
     <div class="drow"><dt>Acumulado del año</dt><dd class="mono" style="font-size:12px;color:${health[vy.est]}">${fmtN(c.ytd,c.dec)} de ${fmtN(c.ytdPlan,c.dec)} ${c.u} · ${fmtPct(vy.pct)}</dd></div>
     <div class="drow"><dt>Estado del dato</dt><dd>${cierreChip()}</dd></div></div>
   <div class="dgroup"><div class="gt">Por qué se movió</div>
     <div style="font-size:12.5px;line-height:1.5">${c.porque}</div></div>
   <div class="dgroup"><div class="gt">Hacia abajo — qué la produce en la organización</div>
     ${refChips(c.ref)}
     <div style="font-size:11px;color:var(--tx-faint)">Ésta es la costura del producto: la cifra del libro contable baja al proceso, al objetivo o al área que la produce. Ningún tablero contable hace eso; ningún sistema contable conoce el proceso.</div></div>
   ${prov(p.fuente,p.conf)}
   <div class="dgroup"><div class="gt">Alcance — hasta dónde llega Cockpit con esto</div>
     <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">Cockpit <b>lee</b> esta cifra del sistema contable con su estado de cierre; <b>no la recalcula ni la reexpresa</b>.</div>
     <button class="btn" style="justify-content:center" onclick="openAlcanceContable()">Ver qué lee y qué jamás reexpresa ›</button></div>`); }

/* ===== CAJA — el número que ninguna cifra de resultado responde ===== */
function openCaja(){ const k=DATA.caja, bajo=cajaBajoPiso(), min=Math.min(...k.semanas);
  openDrawer('Caja · liquidez', 'La caja y sus límites', `
   <div class="dgroup">
     <div class="drow"><dt>Saldo hoy</dt><dd class="mono" style="font-size:15px;color:var(--brand-hi)">${k.saldo} ${k.u}</dd></div>
     <div class="drow"><dt>Piso fijado</dt><dd class="mono" style="font-size:12px">${k.piso} ${k.u} ${k.pisoFijado?'':'<span style="color:var(--warn)">· por firmar</span>'}</dd></div>
     <div class="drow"><dt>Punto más bajo (13 semanas)</dt><dd class="mono" style="font-size:12px;color:${min<k.piso?'var(--crit)':'var(--ok)'}">${min} ${k.u}</dd></div>
     <div class="drow"><dt>Semanas bajo el piso</dt><dd class="mono" style="font-size:12px;color:${bajo?'var(--crit)':'var(--ok)'}">${bajo}</dd></div>
     <div class="drow"><dt>Línea de crédito</dt><dd class="mono" style="font-size:12px">${k.lineas.usado} usado de ${k.lineas.disponible} ${k.u}</dd></div></div>
   <div class="dgroup"><div class="gt">Qué la tensiona</div>
     <div style="font-size:12.5px;line-height:1.5">La semana ${k.hito.sem} entra <b>${k.hito.nm}</b> y la proyección cae a ${min} ${k.u} — por debajo del piso. La causa está aguas arriba: la cobranza que no entra.</div>
     ${refChips({g:'g-dso', ap:'ap-caja'})}</div>
   <div class="dgroup"><div class="gt">Resguardos con el banco — los límites que impone el financiamiento</div>
     ${k.resguardos.map(r=>`<div class="resg"><span class="rn">${r.nm}</span><span class="rl">${r.lim}</span><span class="rv" style="color:${health[r.est]}">${r.v} · ${r.holgura}</span></div>`).join('')}
     <div style="font-size:11px;color:var(--tx-faint)">Romper un resguardo puede exigir pagar la deuda por adelantado: por eso el directorio los mira antes de aprobar más obra o más deuda.</div></div>
   ${prov(k.fuente,k.conf)}
   <div style="font-size:11.5px;color:var(--warn);line-height:1.5">⚠ ${k.confPorque} — <span class="plnk" data-area="${k.refConf.area}">ver el área ›</span></div>
   <div class="dgroup"><div class="gt">Acciones (decide la Dirección)</div>
     <button class="btn" data-acc="fijar-piso-caja">Fijar el piso de caja › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button>
     <button class="btn" data-acc="aprobar-endeudamiento">Aprobar ampliar la línea › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button></div>`); }

/* ===== PRESUPUESTO — la mezcla de ambición hecha plata + las facultades ===== */
function openPresupuesto(){ const p=DATA.presupuesto, f=DATA.facultades;
  const asig=p.bolsas.reduce((s,b)=>s+b.asignado,0), comp=p.bolsas.reduce((s,b)=>s+b.comprometido,0);
  openDrawer('Presupuesto · el año en bolsas', `Presupuesto ${p.anio}`, `
   <div class="dgroup">
     <div class="drow"><dt>Total</dt><dd class="mono" style="font-size:15px;color:var(--brand-hi)">${asig.toFixed(1)} ${p.u}</dd></div>
     <div class="drow"><dt>Comprometido</dt><dd class="mono" style="font-size:12px">${comp.toFixed(2)} ${p.u} · ${Math.round(comp/asig*100)}%</dd></div>
     <div class="drow"><dt>Estado</dt><dd><span class="chip" style="border-color:var(--warn);color:var(--warn)">${p.estado}</span></dd></div></div>
   <div class="dgroup"><div class="gt">Por bolsa — la mezcla de ambición, en dinero</div>
     ${p.bolsas.map(b=>`<div class="budgrow"><span class="bn">${b.nm}</span>
        <span class="bt"><i style="width:${(usoBolsa(b)*100).toFixed(0)}%"></i></span>
        <span class="bv">${b.comprometido.toFixed(2)} / ${b.asignado.toFixed(1)}</span></div>`).join('')}
     <div style="font-size:11px;color:var(--tx-faint)">La mezcla en porcentaje dice la intención; el presupuesto dice si esa intención tiene plata detrás. La prioridad se ordena DENTRO de cada bolsa, jamás entre bolsas.</div></div>
   <div class="dgroup"><div class="gt">Facultades — qué monto obliga a que decida el directorio</div>
     ${f.umbrales.map(u=>`<div class="facrow"><span class="fq">${u.q}</span><span class="fv2">sobre ${u.v}</span></div>`).join('')}
     <div style="font-size:11px;color:var(--tx-faint)">${f.nota}</div></div>
   ${prov(p.fuente,p.conf)}
   <div class="dgroup"><div class="gt">Acciones (decide la Dirección)</div>
     <button class="btn" data-acc="aprobar-presupuesto">Aprobar el presupuesto del año › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button>
     <button class="btn" data-acc="fijar-mezcla-ambicion">Fijar la mezcla de ambición › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button></div>`); }

/* ===== RIESGO — la contraparte del apetito que ya existía ===== */
function openRiesgo(r){ if(!r)return; const n=nivelRiesgo(r), ct=riesgoVsApetito(r);
  openDrawer('Riesgo · registro del directorio', r.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Nivel</dt><dd><span class="chip" style="border-color:${n.c};color:${n.c}" title="se deriva de probabilidad × impacto — jamás se declara a mano">${n.t}</span></dd></div>
     <div class="drow"><dt>Probabilidad · impacto</dt><dd class="mono" style="font-size:12px">${r.prob} · ${r.imp}</dd></div>
     <div style="font-size:10.5px;color:var(--tx-faint)">El nivel se deriva de probabilidad × impacto al leer — jamás se declara a mano.</div>
     <div class="drow"><dt>Tendencia</dt><dd class="mono" style="font-size:12px;color:${r.tend==='sube'?'var(--crit)':r.tend==='baja'?'var(--ok)':'var(--tx-mut)'}">${TEND[r.tend]}</dd></div>
     <div class="drow"><dt>Categoría</dt><dd>${CATNM[r.cat]}</dd></div>
     <div class="drow"><dt>Contra tu apetito</dt><dd style="font-size:12px;color:${ct.c}">${ct.t}</dd></div>
     <div class="drow"><dt>Responsable</dt><dd>${r.dueno}</dd></div></div>
   <div class="dgroup"><div class="gt">Mitigación comprometida</div>
     <div style="font-size:12.5px;line-height:1.5">${r.mitig}</div></div>
   <div class="dgroup"><div class="gt">Dónde vive en la organización — el riesgo no es un anexo suelto</div>
     ${refChips(r.ref)}</div>
   ${prov(r.fuente,r.conf)}
   <div class="dgroup"><div class="gt">Acciones</div>
     <button class="btn" data-acc="asignar-riesgo">Cambiar responsable o mitigación › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · revisión-dueño</span></button>
     <button class="btn" data-acc="fijar-apetito-riesgo">Fijar el apetito de ${CATNM[r.cat]} › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button></div>`); }

/* ===== ACUERDO — el punto que abre toda sesión de directorio ===== */
function openAcuerdo(a){ if(!a)return; const c=ACUC[a.estado]||'var(--tx-mut)';
  openDrawer('Acuerdo · directorio', a.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Estado</dt><dd><span class="chip" style="border-color:${c};color:${c}">${a.estado}</span></dd></div>
     <div class="drow"><dt>Responsable</dt><dd>${a.quien}</dd></div>
     <div class="drow"><dt>Acordado en</dt><dd>sesión de ${a.sesion}</dd></div>
     <div class="drow"><dt>Plazo</dt><dd>${a.plazo}</dd></div></div>
   ${a.nota?`<div class="dgroup"><div class="gt">Por qué importa</div><div style="font-size:12.5px;line-height:1.5">${a.nota}</div></div>`:''}
   <div class="dgroup"><div class="gt">Con qué se conecta</div>${refChips(a.ref)}</div>
   ${prov('acta de la sesión de '+a.sesion,'alta')}
   <div class="dgroup"><div class="gt">Acciones</div>
     <button class="btn" data-acc="comprometer-acuerdo">${a.estado==='cumplido'?'Reabrir el acuerdo':'Comprometer fecha y responsable'} › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · revisión-dueño</span></button></div>
   <div style="font-size:11px;color:var(--tx-faint);line-height:1.5">Un acuerdo sin responsable y sin plazo no es un acuerdo: es una conversación. Todo acuerdo entra al acta y el acta queda versionada, como cualquier otro dato del twin.</div>`); }

/* ===== INVERSIÓN — el triángulo genérico: avance real × gasto × ya comprometido ===== */
function openInversion(iv){ if(!iv)return;
  const dv=desvioAvance(iv), tarde=iv.entrega!==iv.entregaComp;
  const vg=varia(iv.gasto/iv.presu*100, iv.avance, 1);   // gasto% contra avance% — si gastó más de lo que avanzó, alerta
  openDrawer('Inversión · portafolio', iv.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Avance real</dt><dd class="mono" style="font-size:15px;color:var(--brand-hi)">${iv.avance}%</dd></div>
     ${dv?`<div class="drow"><dt>Avance declarado</dt><dd class="mono" style="font-size:12px;color:var(--crit)">${iv.avanceDecl}% · ${dv} puntos por encima del real</dd></div>`:''}
     <div class="drow"><dt>Gastado</dt><dd class="mono" style="font-size:12px;color:${vg.est==='rojo'?'var(--crit)':'var(--tx)'}">${iv.gasto} de ${iv.presu} ${iv.u} · ${Math.round(iv.gasto/iv.presu*100)}% del presupuesto</dd></div>
     <div class="drow"><dt>Ya comprometido</dt><dd class="mono" style="font-size:12px">${iv.compro} de ${iv.meta} ${iv.u} · ${Math.round(iv.compro/iv.meta*100)}%</dd></div>
     <div class="drow"><dt>Entrega</dt><dd class="mono" style="font-size:12px;color:${tarde?'var(--crit)':'var(--ok)'}">${iv.entrega}${tarde?` · comprometida ${iv.entregaComp}`:' · en fecha'}</dd></div>
     <div class="drow"><dt>Margen proyectado</dt><dd class="mono" style="font-size:12px;color:${iv.margen==null?'var(--tx-faint)':iv.margen<iv.margenPlan?'var(--warn)':'var(--ok)'}">${iv.margen==null?'sin dato — aún no arranca':iv.margen+'% contra '+iv.margenPlan+'% de plan'}</dd></div></div>
   ${dv?`<div class="dgroup"><div class="gt">Por qué esto no es sólo un tema de obra</div>
     <div style="font-size:12.5px;line-height:1.5">El libro contable valoriza lo que está a medio construir con el avance que le reportan. Si le reportan <b>${iv.avanceDecl}%</b> y el avance real es <b>${iv.avance}%</b>, el valor de lo construido queda inflado y el resultado del periodo, también. Por eso hay un acuerdo abierto con el contador.</div>
     ${refChips({g:'g-avc'})}</div>`:''}
   ${iv.nota?`<div class="dgroup"><div class="gt">Nota</div><div style="font-size:12.5px;line-height:1.5">${iv.nota}</div></div>`:''}
   <div class="dgroup"><div class="gt">Con qué se conecta en la organización</div>${refChips(iv.ref)}</div>
   ${prov(iv.fuente,iv.conf)}
   <div class="dgroup"><div class="gt">Acciones (decide la Dirección)</div>
     <button class="btn" data-acc="aprobar-inversion">Aprobar más presupuesto para esta inversión › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button></div>
   <div class="paral"><b>El mismo renglón en cualquier industria:</b> avance real · gastado contra presupuesto · ya comprometido · fecha de entrega · margen proyectado. En desarrollo inmobiliario son obras; en manufactura, ampliación de planta; en retail, tiendas nuevas; en servicios, contratos plurianuales; en software, líneas de producto.</div>`); }

/* ===== ALCANCE CONTABLE — el bloque C: qué lee Cockpit y qué JAMÁS reexpresa ===== */
function openAlcanceContable(){ const p=DATA.periodo;
  openDrawer('Alcance · el libro contable y el twin', 'Qué lee Cockpit, qué no toca', `
   <div class="dgroup"><div class="gt">La regla</div>
     <div style="font-size:12.5px;line-height:1.55">Cockpit <b>no es el libro contable ni lo reemplaza</b>. Lee del sistema contable un puñado de cifras con su estado de cierre, y su trabajo es el que ningún tablero contable hace: <b>bajar cada cifra al proceso, al área y a la gente que la produce</b>. El juego completo de estados financieros, las notas y el dictamen viven allá.</div></div>
   <div class="dgroup"><div class="gt">Lo que SÍ lee</div>
     <div style="font-size:12px;line-height:1.6">${DATA.periodo.cifras.map(c=>c.nm).join(' · ')} — mes, plan, año anterior y acumulado del año.</div>
     <div class="drow"><dt>Marco de reporte</dt><dd>${p.marco}</dd></div>
     <div class="drow"><dt>Estado del dato</dt><dd>${cierreChip()} <span style="font-size:10px;color:var(--tx-faint)">${p.cierra}</span></dd></div>
     <div class="drow"><dt>Último dictamen</dt><dd style="font-size:11.5px;text-align:right">${p.auditor.estado}</dd></div>
     <div style="font-size:11px;color:var(--tx-faint)">${p.auditor.nota}</div></div>
   <div class="dgroup"><div class="gt">Lo que NO hace — y no va a hacer</div>
     <div style="font-size:12px;color:var(--tx-mut);line-height:1.6">· No arma el juego completo de estados financieros ni sus notas.<br>· No corre el cierre contable ni reexpresa cifras cerradas.<br>· No emite opinión de auditoría.<br>· No sustituye al contador ni al auditor: los cita, con su estado de cierre a la vista.</div></div>
   <div class="dgroup"><div class="gt">El puente — dónde el número del libro toca la operación</div>
     <div style="font-size:11px;color:var(--tx-faint);margin-bottom:2px">Éstas son las decisiones contables que dependen de cómo opera la empresa. El libro las registra; el twin dice si la realidad que las sostiene es la que se reportó. A la derecha, la norma que las gobierna — procedencia, no vocabulario de pantalla.</div>
     ${DATA.puente.map(x=>`<div class="dgroup" style="border-style:dashed">
        <div class="gt">${x.q}<span class="mono" style="float:right;font-weight:400;font-size:9px;color:var(--tx-faint)">${x.norma}</span></div>
        <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">Depende de <b>${x.op}</b>.</div>
        ${refChips(x.ref)}
        <div style="font-size:10.5px;color:var(--tx-faint)">Equivalente: ${x.otras}.</div></div>`).join('')}</div>
   ${prov(p.fuente,p.conf)}`); }
