/* ============================================================
   RENDER
   ============================================================ */
function render(){
  const terr=state.mod==='territorio';
  const sala=terr&&state.nivel===3&&!!state.area3;          // v21: la sala del área = LIENZO con capas
  const tablero=terr&&(state.nivel===1||(state.nivel===3&&!sala));   // nivel 1 y la portada-selector = pageView
  document.querySelectorAll('#modulos .esc').forEach(b=>b.classList.toggle('on', b.dataset.mod===state.mod));
  document.querySelectorAll('#niveles .esc').forEach(b=>b.classList.toggle('on', terr && +b.dataset.nivel===state.nivel));
  const NB={1:3+(state.ciclo!=='okr'?1:0), 2:DATA.brechas.filter(g=>g.estado==='accionable').length,
    3:sinContraKpis().length+DATA.ideas.filter(i=>i.estado==='enviada').length, 4:2};
  document.querySelectorAll('.nivb').forEach(s=>{ const n=NB[+s.dataset.nb]; s.textContent=n?('▲ '+n):''; });
  const backB=document.getElementById('back');
  backB.disabled = !terr || tablero || (state.escala==='z0'&&!sala);
  /* v17 · lo deshabilitado explica su porqué — jamás un botón muerto sin razón */
  backB.title = backB.disabled
    ? (terr&&!tablero ? 'Ya ves el mapa completo — se enciende al entrar a un proceso o instrucción'
                      : 'Vuelve al mapa completo — vive en el nivel 2 · Estratégico')
    : (sala?'Volver al selector — elegir otra área':'Volver al mapa completo (sube un nivel de zoom)');
  document.getElementById('pieltoggle').classList.toggle('hide', !terr || state.nivel!==2 || state.escala!=='z0');
  document.getElementById('lodctl').classList.toggle('hide', !(terr&&state.nivel===2&&state.escala==='z0'&&state.piel==='org'));
  document.getElementById('minimap').classList.toggle('hide', !terr||tablero);
  const searchOff=!terr||tablero||sala;
  document.getElementById('search').disabled=searchOff;
  document.querySelector('.search').style.opacity=searchOff?'.4':'';
  document.querySelector('.search').title=searchOff?'La búsqueda actúa sobre el mapa — disponible en el nivel 2 (Estratégico) y dentro de un proceso':'';
  const hintEl=document.getElementById('hint'); if(hintEl) hintEl.style.display=(tablero||sala)?'none':'';

  // corrida (what-if): señales redundantes — banner + tinte + identidad del header
  document.getElementById('mainEl').classList.toggle('corrida', state.corrida);
  document.getElementById('idpill').innerHTML = state.corrida
    ? `<span class="st" style="background:var(--warn);box-shadow:0 0 8px var(--warn)"></span>Corrida · Cobranza fase 2<span class="car">▾</span>`
    : `<span class="st"></span>As-Is · Terranova<span class="car">▾</span>`;
  document.querySelector('#itAsis .chk').textContent=state.corrida?'':'✓';
  document.querySelector('#itCorrida .chk').textContent=state.corrida?'✓':'';

  // disable honesto: capa sin efecto en el módulo/escala actual → atenuada con razón, no oculta
  const CAPAS_APLICAN={ 'z0-valor':['hilo','salud','brechas','cinetica','trabajo'], 'z0-org':['estructura','hilo','salud','brechas','cinetica','trabajo'],
    'z1':['hilo','salud','brechas','cinetica','trabajo'], 'z2':['hilo','salud','brechas','trabajo'], 'z3':['trabajo'],
    'sala':['salud','brechas','cinetica','trabajo','plan'] };   // v21: la sala pinta el twin del área; Plan del ciclo = su capa propia
  const apl=(terr&&!tablero)?CAPAS_APLICAN[sala?'sala':(state.escala==='z0'?('z0-'+state.piel):state.escala)]:[];
  document.querySelectorAll('.capa').forEach(b=>{ const isR=b.dataset.capa==='respaldo';
    const na=isR?false:!apl.includes(b.dataset.capa);   // v14.4: el respaldo aplica en TODOS los niveles y módulos
    b.classList.toggle('na',na); b.title=na?(terr?'Sin efecto en esta escala — no hay dato de esta capa aquí':'Las capas pintan sobre el Territorio'):''; });

  const MODNM={mejora:'Mejora — el ciclo brecha → proyecto → KPI', metodo:'Método — engagement M1·M2·M3', cambios:'Cambios — solicitudes, versiones y aprobaciones'};
  let crumb=terr?'<b>Territorio</b>':`<b>${MODNM[state.mod]}</b>`;
  if(terr&&state.nivel===1) crumb='<b>Nivel 1 · Directorio</b> — la apuesta y el riesgo';
  if(terr&&state.nivel===3) crumb=sala
    ? `<span class="plnk" onclick="gotoNivel(3)">Táctico</span> <span class="sep">›</span> <b>${byId(DATA.areas,state.area3).nm}</b> — la sala del área`
    : '<b>Nivel 3 · Táctico</b> — elige el área: cada sala trae su bajada, su plan y su detalle';
  const crumbHome=`<span class="plnk" onclick="state.nivel=2;state.escala='z0';state.foco=null;render()">Territorio</span>`;
  if(terr&&state.escala==='z1'){ const a=byId(DATA.areas,state.foco); crumb=`${crumbHome} <span class="sep">›</span> <b>${a.nm}</b>`; }
  if(terr&&state.escala==='z2'){ crumb=`${crumbHome} <span class="sep">›</span> … <span class="sep">›</span> <b>${byId(DATA.procesos,state.lienzo||DATA.flagship.proc).nm}</b> · lienzo`; }
  if(terr&&state.escala==='z3'&&state.act){ const lf=lienzoData(state.act.pid), aa=lf&&lf.acts.find(x=>x.ord===state.act.ord);
    crumb=`${crumbHome} <span class="sep">›</span> … <span class="sep">›</span> <span class="plnk" onclick="drillLienzo('${state.act.pid}')">${byId(DATA.procesos,state.act.pid).nm}</span> <span class="sep">›</span> <b>${String(state.act.ord).padStart(2,'0')} · ${aa?aa.verbo:''}</b> · instrucción`; }
  document.getElementById('crumbline').innerHTML=crumb;
  subLegend(); chips();

  MM_PTS=[];
  $nodes.innerHTML=''; $pins.innerHTML=''; $edges.innerHTML=''; $lienzo.style.display='none'; $nodes.style.display=''; $pins.style.display='';
  if(!terr){ ({mejora:renderMejora, metodo:renderMetodo, cambios:renderCambios})[state.mod](); }
  else if(state.nivel===1) renderDirectorio();
  else if(state.nivel===3) renderTactico();
  else if(state.escala==='z0') state.piel==='org'?renderOrganigrama():renderValor();
  else if(state.escala==='z1') renderValor();   // v13: z1 = el MISMO mapa de valor con foco de área (renderArea murió)
  else if(state.escala==='z3') renderInstruccion();
  else renderLienzo();
  mmDots(); if(state.insp==='home') inspectorHome();
}

/* vista de módulo = página HTML en el world (hereda pan/zoom) — v18: se encaja al ANCHO y se
   recorre con la rueda (`fitPagina`), no se comprime hasta entrar entera en el alto. */
function pageView(html){
  const pv=el('div','pageview',html); $nodes.appendChild(pv);
  setCanvas(1360,900);
  requestAnimationFrame(()=>{ setCanvas(1360, Math.max(640, pv.offsetHeight+80)); fitPagina(); });
  fitPagina(); return pv;
}

