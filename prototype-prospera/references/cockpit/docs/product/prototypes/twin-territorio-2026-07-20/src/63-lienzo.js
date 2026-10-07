/* ---------- z2 lienzo (v2: en el world — bandas de carril + edges reales + capas encima) ---------- */
function lienzoData(pid){ return pid===DATA.flagship.proc?DATA.flagship:(DATA.lienzos[pid]||null); }
function drillLienzo(pid){ state.lienzo=pid||state.lienzo||DATA.flagship.proc; state.nivel=4; state.escala='z2'; state.insp='home'; render(); }
function renderLienzo(){
  const pid=state.lienzo||DATA.flagship.proc, p=byId(DATA.procesos,pid);
  let f=lienzoData(pid), stub=false;
  if(!f){ // lienzo HONESTO: proceso sin actividades levantadas — pasos macro + candidato M1 (disable honesto)
    stub=true;
    f={ proc:pid, nm:p.nm,
      sub:`AS-IS · dueño ${p.dueno}. <b style="color:var(--warn)">Actividades SIN LEVANTAR</b> — se muestran los pasos macro declarados en la ingesta. Candidato del levantamiento (M1 · entrevista + observación).`,
      lanes:[{role:p.dueno.replace(/\s*\(vacante\)/i,''),k:'carril'}], vsm:null,
      acts:(DATA.pasosMini[pid]||[]).map((v,i)=>({ord:i+1,lane:0,verbo:v,ttl:'Paso macro — actividad sin levantar',tipo:'humana',toque:'s/d',espera:'—',sist:(p.sist||[]).filter(s=>s!=='—'),conf:'baja',fte:'Pasos macro (ingesta)',note:'detalle pendiente del levantamiento M1'})),
      seq:(DATA.pasosMini[pid]||[]).slice(1).map((_,i)=>({f:i+1,t:i+2})) };
  }
  const laneH=176, headH=222, x0=560, colW=228;
  const maxOrd=Math.max(1,...f.acts.map(a=>a.ord));
  const W=x0+(maxOrd-1)*colW+330+280, H=headH+f.lanes.length*laneH+40;
  setCanvas(W,H);
  const sp=DATA.sipoc[pid], c1=DATA.sipocC1[pid], know=DATA.conocimiento[pid];
  const triCls=t=>t==='eliminable'?'elim':(t&&t.startsWith('automatizable')?(t.includes('rpa')?'rpa':'agente'):'');

  // header: título + capas ENCIMA del lienzo (hilo=KPIs+objetivo · salud=dot · VSM totales)
  const hd=el('div','grouplab'); hd.style.left='26px'; hd.style.top='20px'; hd.style.maxWidth=(W-60)+'px';
  const kchips=state.capas.has('hilo')?kpisByProc(f.proc).map(k=>{ const s=semaforo(k), c=kcur(k);
    return `<button class="kchip" data-k="${k.id}">${iico('kpi','kpi · Outcome/Metric (M13 ArchiMate, Motivation)')}<span class="kd" style="background:${SEMC[s]}"></span>${k.nm} ${c==null?'s/d':c+(k.unidad||'')} → ${k.banda.target}${k.unidad||''}</button>`; }).join(''):'';
  const objChip=state.capas.has('hilo')&&p.sirve.length?`<span class="tag teal" style="font-size:9px">sostiene · ${byId(DATA.objetivos,p.sirve[0]).nm}</span>`:'';
  const saludDot=state.capas.has('salud')?`<span class="health-dot" style="background:${health[digHealth(p.digital)]};display:inline-block;margin-right:8px"></span>`:'';
  hd.innerHTML=`<span class="eyebrow">z2 · proceso caracterizado (procedimiento · ISO 10013 n2) · bordes SIPOC como geografía · carriles = roles · doble-click actividad = instrucción (z3)${respBadge('z2-flujograma')}</span>
    <h2 style="font-family:var(--font-display);font-weight:800;font-size:24px;margin:4px 0 0;letter-spacing:-.01em">${saludDot}${f.nm}</h2>
    <div style="color:var(--tx-mut);font-size:12px;margin-top:4px;max-width:96ch">${f.sub}</div>
    ${c1?`<div class="c1row">
      <span class="c1i"><b>Propósito (4.4.1)</b>${c1.prop}</span>
      <span class="c1i"><b>Inicia cuando</b>${sp&&sp.disp?sp.disp:'—'}</span>
      <span class="c1i"><b>Termina cuando</b>${c1.fin}</span>
      <span class="c1i"><b>Clasificación</b>APQC ${c1.apqc}</span>
      ${know?`<span class="c1i"><b>Conocimiento</b><span class="plnk" data-proc="${pid}">${know.n} ›</span></span>`:''}
      ${sp&&sp.ctrl?`<span class="c1i"><b>Criterios de control (4.4.1c)</b>${sp.ctrl.join(' · ')}</span>`:''}
    </div>`:''}
    <div style="display:flex;gap:8px;margin-top:9px;align-items:center;flex-wrap:wrap">${kchips}${objChip}
      <span class="mono" style="font-size:10px;color:var(--tx-faint)">${f.vsm?`VSM · ◔ toque total ${f.vsm.toque} · ⏳ espera ${f.vsm.espera}${pid===DATA.flagship.proc?' · 30m eliminables':''}`:'VSM · sin medir — tiempos pendientes del levantamiento (M1)'}</span></div>`;
  wireLinks(hd);
  $nodes.appendChild(hd);
  hd.querySelectorAll('.kchip').forEach(b=>b.onclick=()=>openKpi(byId(DATA.kpis,b.dataset.k)));

  // bandas de carril (rol = lane, carril_ref)
  f.lanes.forEach((ln,li)=>{
    const band=el('div','laneband');
    band.style.top=(headH+li*laneH)+'px'; band.style.height=laneH+'px';
    band.innerHTML=`<div class="lhd"><span class="role-k">carril ${li+1}${ln.k!=='carril'?' · '+ln.k:''}</span><span class="role plnk" data-rol="${ln.role}" title="ficha del ROL — el papel en este proceso">${ln.role}</span>${state.capas.has('trabajo')?harnBadge(arnesDe(ln.role,f.proc)):''}</div>`;
    wireLinks(band);
    $nodes.appendChild(band);
  });

  // actividades como nodos posicionados por (orden, carril)
  const pos={};
  f.acts.forEach(a=>{
    const cx=x0+(a.ord-1)*colW+100, cy=headH+a.lane*laneH+laneH/2; pos[a.ord]={cx,cy};
    MM_PTS.push({x:cx,y:cy});
    const tc={humana:'var(--teal-400)',sistema:'var(--ok)',reunion:'var(--warn)',decision:'var(--brand)',espera:'var(--tx-faint)'}[a.tipo]||'var(--tx-faint)';
    const n=el('button','node'); n.style.left=cx+'px'; n.style.top=cy+'px';
    n.innerHTML=`<div class="act" style="width:200px">
      <span class="typ" style="background:${tc}" title="${a.tipo}"></span>
      <span class="ord">${String(a.ord).padStart(2,'0')} · ${a.verbo}</span>
      <div class="ttl">${a.ttl}</div>
      <div class="tv"><span class="t">◔ ${a.toque}</span>${a.espera!=='—'?`<span class="e">⏳ ${a.espera}</span>`:''}<span>${a.sist.join(' · ')}</span></div>
      ${a.triage?`<span class="tri ${triCls(a.triage)}">${a.triage}</span>`:''}${a.rtlx?`<span class="tri rtlx">RTLX ${a.rtlx}</span>`:''}${a.mandato?`<span class="tri" style="color:var(--brand-hi);border-color:var(--teal-700)">mandato · ${a.mandato}</span>`:''}
      ${state.capas.has('trabajo')?(h=>h?` ${harnBadge(h)}`:'')(DATA.arneses.find(h=>h.deriva_de.proceso===f.proc&&h.acts.includes(a.ord))):''}
    </div>`;
    if(!stub){ n.querySelector('.act').onclick=()=>openActividad(a);
      n.querySelector('.act').title='click = ficha · doble-click = instrucción de trabajo (z3)'; }
    else n.querySelector('.act').title='actividad sin levantar (M1) · doble-click = instrucción honesta';
    n.querySelector('.act').ondblclick=()=>drillActividad(pid,a.ord);
    wireLinks(n);
    $nodes.appendChild(n);
  });

  /* v17 · corrida: la actividad PROPUESTA se pinta punteada EN el flujo (celda libre col-5 · carril 1),
     con sus flujos tentativos desde "contactar" (03) y hacia "verificar" (06) — el diff deja de vivir solo en el panel */
  if(state.corrida && pid==='p-cob' && !stub){
    const gx=x0+(5-1)*colW+100, gy=headH+0*laneH+laneH/2;
    const gn=el('button','node'); gn.style.left=gx+'px'; gn.style.top=gy+'px';
    gn.innerHTML=`<div class="act ghost" style="width:200px" title="Actividad propuesta por la simulación — no existe en el As-Is; se aplica solo si el cambio se aprueba">
      <span class="typ" style="background:var(--warn)" title="propuesta"></span>
      <span class="ord">Δ · cobrar</span>
      <div class="ttl">Cobrar por el portal de pagos en línea (propuesto)</div>
      <div class="tv"><span class="t">◔ 10m</span><span>Portal de pagos</span></div>
      <span class="tri" style="color:var(--warn);border-color:var(--warn)">Δ corrida — no existe aún</span>
    </div>`;
    gn.querySelector('.act').onclick=()=>{ state.insp='home'; inspectorHome(); };
    $nodes.appendChild(gn); MM_PTS.push({x:gx,y:gy});
    if(pos[3]) pathEl(curve(pos[3].cx+102,pos[3].cy,gx-102,gy),'var(--warn)',1.3,.55,'5 4');
    if(pos[6]) pathEl(curve(gx+102,gy,pos[6].cx-102,pos[6].cy),'var(--warn)',1.3,.55,'5 4');
  }

  // puertos SIPOC — la caracterización como GEOGRAFÍA: S·I a la izquierda del flujo, O·C a la derecha
  if(sp){
    const midY=headH+(f.lanes.length*laneH)/2;
    const firstOrd=Math.min(...f.acts.map(a=>a.ord)), lastOrd=Math.max(...f.acts.map(a=>a.ord));
    const A0=pos[firstOrd], A1=pos[lastOrd];
    const lp=el('div','portbox'); lp.style.left='280px'; lp.style.top=midY+'px';
    lp.innerHTML=`<div class="pt">S · proveedores → I · entradas</div>
      <div class="chips">${sp.prov.map(sipocRefChip).join('')}</div>
      <div class="pitems">${sp.in.map(i=>`<span>⇥ ${i}</span>`).join('')}</div>`;
    wireLinks(lp); $pins.appendChild(lp); MM_PTS.push({x:396,y:midY});
    const rpx=(A1?A1.cx:x0)+102+52;
    const rp=el('div','portbox'); rp.style.left=rpx+'px'; rp.style.top=midY+'px';
    rp.innerHTML=`<div class="pt">O · salidas → C · clientes</div>
      <div class="pitems" style="margin-top:0;margin-bottom:7px">${sp.out.map(o=>`<span>${o} ⇥</span>`).join('')}</div>
      <div class="chips">${sp.cli.map(sipocRefChip).join('')}</div>`;
    wireLinks(rp); $pins.appendChild(rp); MM_PTS.push({x:rpx+116,y:midY});
    if(A0) pathEl(curve(516,midY,A0.cx-104,A0.cy),'var(--teal-800)',1.4,.8,'6 5');
    if(A1) pathEl(curve(A1.cx+104,A1.cy,rpx-4,midY),'var(--teal-800)',1.4,.8,'6 5');
  }

  // edges reales: secuencia_ref (sólido) + flujos_alternos (punteado warn con condición)
  f.seq.forEach(s=>{
    const A=pos[s.f], B=pos[s.t]; if(!A||!B)return;
    const x1=A.cx+102, x2=B.cx-102;
    pathEl(curve(x1,A.cy,x2,B.cy), s.alt?'var(--warn)':'#3d4f4a', s.alt?1.3:1.7, s.alt?.6:.85, s.alt?'5 4':null);
    if(s.c){ const lab=el('div','elab'+(s.alt?'':' main'),s.c); // etiqueta al 30% del camino (cerca del origen, no sobre la card destino)
      const skip=A.cy===B.cy&&(x2-x1)>colW; // salto mismo-carril: el tramo pasa por detrás de las cards → etiqueta ARRIBA de la fila
      lab.style.left=(x1+(x2-x1)*(skip?0.5:0.3))+'px'; lab.style.top=(skip?(A.cy-84):(A.cy+(B.cy-A.cy)*0.3))+'px'; $pins.appendChild(lab); }
  });

  // capa brechas ENCIMA del lienzo: pin sobre el proceso que ataca
  if(state.capas.has('brechas')){
    // TODAS las brechas del proceso, en la franja alta-derecha (libre de texto del header)
    DATA.brechas.filter(x=>x.against===pid).forEach((g,gi)=>{
      const pin=el('div','pin '+(g.sev==='alta'?'':g.sev==='media'?'med':'low'));
      pin.style.left=(Math.max(x0+320,W-640)+gi*310)+'px'; pin.style.top='150px';
      pin.innerHTML=`<div class="body" style="white-space:nowrap">▲ ${g.sev} · ${g.costo} · ${g.nm.slice(0,34)}…</div><div class="stem"></div><div class="head"></div>`;
      pin.title=g.nm;
      pin.onclick=()=>openBrecha(g); $pins.appendChild(pin); MM_PTS.push({x:Math.max(x0+320,W-640)+gi*310,y:150});
    });
  }

  counter(stub?`${f.acts.length} pasos macro · actividades sin levantar (M1)`:`${f.acts.length} actividades · ${f.lanes.length} carriles · ${f.seq.length} flujos`);
  fitFlujo();
}

