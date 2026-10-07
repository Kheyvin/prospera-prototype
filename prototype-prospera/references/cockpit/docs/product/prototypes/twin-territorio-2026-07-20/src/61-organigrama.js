/* ---------- z0 · piel Organigrama (la estructura como LENTE — quién responde por qué) ---------- */
function renderOrganigrama(){
  const dim=treeLayout(); setCanvas(dim.w,dim.h);
  if(state.capas.has('respaldo')){ const ol=el('div','grouplab'); ol.style.left='30px'; ol.style.top='34px';
    ol.innerHTML=`<span class="eyebrow">Organigrama — el plano de los puestos${respBadge('org-estructura')}</span>`; $nodes.appendChild(ol); }
  const rank={alta:3,media:2,baja:1};
  const vis=DATA.areas.filter(isVis);
  // hilo: área iluminada si sus procesos sostienen el objetivo activo (plegada: su subtree)
  const lit=new Set();
  if(state.capas.has('hilo') && state.activeObj) DATA.procesos.filter(p=>p.sirve.includes(state.activeObj))
    .forEach(p=>p.areas.forEach(a=>{ const v=visAncestor(a); if(v)lit.add(v.id); }));
  if(state.capas.has('estructura')){
    vis.filter(a=>a.parent).forEach(a=>{ const p=byId(DATA.areas,a.parent); if(!isVis(p))return; pathEl(vcurve(p.x,p.y+40,a.x,a.y-40),'#2a3733',1.4,.82); });
    DATA.matrixEdges.forEach(([x,y])=>{ const A=visAncestor(x),B=visAncestor(y); if(!A||!B||A.id===B.id)return; pathEl(curve(A.x+72,A.y,B.x-72,B.y),'#2a3733',1.2,.4,'4 4'); });
  }

  const searching=!!q();
  vis.forEach(a=>{
    const folded=kids(a.id).some(c=>!isVis(c));
    const procs=folded?subtreeProcs(a.id):areaProcs(a.id);
    const hidden=folded?descendants(a.id).length-1:0;
    const subVis=kids(a.id).filter(isVis).length;
    const n=el('button','node'); n.style.left=a.x+'px'; n.style.top=a.y+'px';
    MM_PTS.push({x:a.x,y:a.y});
    const match=areaMatch(a);
    if(searching){ if(match)n.classList.add('hot'); else n.classList.add('dim'); }
    else{
      if(state.capas.has('hilo') && state.activeObj && !lit.has(a.id)) n.classList.add('dim');
      if(lit.has(a.id)) n.classList.add('hot');
    }
    let dotColor='#2a3733';
    if(state.capas.has('salud')) dotColor = state.sub==='digital'?(procs.length?health[worstDig(procs)]:'#2a3733') : state.sub==='conf'?confCol(a.conf) : (health[madurezSalud(madurezArea(a.id))]||'#2a3733');   // D-32: derivada de sus capabilities; sin evaluar = sin color
    let heat='<div class="heatwrap"><i style="flex:1;background:#22302d"></i></div>';
    if(state.capas.has('salud') && state.sub==='digital' && procs.length){
      const mi=procs.filter(p=>p.digital==='manual').length, me=procs.filter(p=>p.digital==='externo').length, ma=procs.filter(p=>p.digital==='integrado').length;
      heat=`<div class="heatwrap"><i style="flex:${ma+.01};background:var(--ok)"></i><i style="flex:${me+.01};background:var(--warn)"></i><i style="flex:${mi+.01};background:var(--crit)"></i></div>`;
    }
    const setD=new Set(folded?descendants(a.id):[a.id]);
    const pusAll=PUESTOS.filter(p=>setD.has(p.area));
    const pusProp=PUESTOS.filter(p=>p.area===a.id);
    const hs=state.capas.has('trabajo')?DATA.arneses.filter(h=>{const q=puestoByNm(h.deriva_de.puesto);return q&&setD.has(q.area);}):null;
    const hChip=hs?`<span class="cnt" style="color:${hs.some(h=>arnesEstado(h)==='desactualizado')?'var(--warn)':(hs.length?'var(--brand-hi)':'var(--tx-faint)')}" title="arneses compilados en el subtree / puestos del área">⛨ ${hs.length}/${pusAll.length}${hs.some(h=>arnesEstado(h)==='desactualizado')?' ⚠':''}</span>`:'';
    /* v21 · abrir-y-empujar POR RAMA: cada nodo trae sus dos manijas — la rama (hijas) y la nómina
       (sus puestos, EN el nodo). Abrir agranda este nodo/fila y el layout corre a los demás. */
    const pusOpen=state.puestosOpen.has(a.id);
    const pus=pusOpen?pusProp:[];
    const ramaChip=kids(a.id).length
      ? (folded?`<span class="cnt fold abrir" data-rama="${a.id}" title="abrir la rama — sus ${hidden} área${hidden>1?'s':''} aparecen y las vecinas se corren">+${hidden} ⊕</span>`
               :`<span class="cnt fold abrir" data-rama="${a.id}" title="plegar la rama">⊖</span>`)
      : '';
    const pusChip=pusProp.length
      ? `<span class="cnt abrir" data-nomina="${a.id}" title="${pusOpen?'plegar la nómina':'abrir la nómina — los '+pusProp.length+' puestos del área, en su lugar'}">${pusOpen?'⊖ puestos':'⊕ '+pusProp.length+' puestos'}</span>`
      : '';
    n.innerHTML=`<div class="area-node"${pusOpen?' style="width:190px"':''}>
      <div class="hd"><div><div class="nm">${tbadge('area','área · Business Actor organizacional (M13 ArchiMate)')}${a.nm}</div><div class="lider plnk" title="ficha de la persona">${a.lider.split(' · ')[0]}</div>${a.vacante?'<span class="vac">rol vacante</span>':''}</div>
        <span class="health-dot" style="background:${dotColor}"></span></div>
      <div class="stat">${heat}<span class="cnt">${procs.length}</span>${hChip}${ramaChip}${pusChip}</div>
      ${pus.length?`<div class="prows">${pus.map(p=>{ const occ=puestoOcupantes(p.nm).length;
        return `<button class="prow" data-pu="${p.nm}" title="puesto — ${occ||'sin'} ocupante${occ===1?'':'s'}"><span class="pnm">${p.nm}</span><span class="pocc ${p.vac?'vc':''}">${p.vac?'vac':(occ||'—')}</span>${state.capas.has('trabajo')?rosterBadge(p.nm):''}</button>`; }).join('')}</div>`:''}
    </div>`;
    n.querySelector('.area-node').onclick=()=>openArea(a);
    /* v21 (firma D): doble click = BAJAR a la sala del área (nivel 3). El foco z1 sigue vivo como
       acción nombrada de la ficha ("Enfocar en el mapa de valor ›"). */
    n.querySelector('.area-node').ondblclick=()=>abrirSala(a.id);
    n.querySelector('.lider').onclick=e=>{ e.stopPropagation(); openPersona(a.lider.split(' · ')[0]); };
    const rb=n.querySelector('[data-rama]'); if(rb) rb.onclick=e=>{ e.stopPropagation();
      if(state.expandidas.has(a.id)) state.expandidas.delete(a.id); else state.expandidas.add(a.id); render(); };
    const nb=n.querySelector('[data-nomina]'); if(nb) nb.onclick=e=>{ e.stopPropagation();
      if(state.puestosOpen.has(a.id)) state.puestosOpen.delete(a.id); else state.puestosOpen.add(a.id); render(); };
    wireLinks(n);
    $nodes.appendChild(n);
  });

  // brechas: 1 pin COMPACTO por área visible (las plegadas ruedan a su ancestro visible)
  if(state.capas.has('brechas')){
    const byArea={};
    DATA.brechas.forEach(g=>{ if(state.capas.has('hilo')&&state.activeObj&&g.obj!==state.activeObj)return;
      const proc=byId(DATA.procesos,g.against); const area=proc&&visAncestor(proc.areas[0]); if(!area)return;
      (byArea[area.id]=byArea[area.id]||[]).push(g); });
    Object.keys(byArea).forEach(aid=>{ const area=byId(DATA.areas,aid), gs=byArea[aid].sort((x,y)=>rank[y.sev]-rank[x.sev]), g=gs[0];
      const pin=el('div','pin '+(g.sev==='alta'?'':g.sev==='media'?'med':'low'));
      const lift=state.puestosOpen.has(aid)?40+Math.round(PUESTOS.filter(q=>q.area===aid).length*8.5):40;   // nómina abierta: el nodo crece — el pin no pisa el título
      pin.style.left=(area.x+52)+'px'; pin.style.top=(area.y-lift)+'px';
      pin.innerHTML=`<div class="body" style="white-space:nowrap">▲ ${g.sev}${gs.length>1?` +${gs.length-1}`:''} · ${g.costo}</div><div class="stem"></div><div class="head"></div>`;
      pin.title=gs.map(x=>x.nm).join('  ·  ');
      pin.onclick=()=>openBrecha(g); $pins.appendChild(pin);
    });
  }

  if(state.corrida){ const t=visAncestor('a-tes'); if(t){ // diff de la corrida: ámbar = editado (patrón scenario-objeto)
    const d=[...$nodes.querySelectorAll('.node')].find(n=>n.querySelector('.nm')&&n.querySelector('.nm').textContent===t.nm);
    if(d){ d.classList.add('diff'); d.querySelector('.stat').insertAdjacentHTML('beforeend','<span class="dtag">Δ editado</span>'); } } }
  if(state.capas.has('cinetica')) DATA.proyectos.filter(pm=>pm.estado!=='cerrado').forEach(pm=>{
    const a=visAncestor(pm.area); if(!a)return; const kx=a.x, ky=a.y+52;
    const k=el('div','kin'); k.style.left=kx+'px'; k.style.top=ky+'px';
    k.innerHTML=`${iico('proyecto','proyecto de mejora · Work Package (M13 ArchiMate)')}<span class="spark"></span><span class="pdca">${pm.pdca}</span>${pm.nm} · ROI ${pm.roi}`; k.onclick=()=>openProyecto(pm); $pins.appendChild(k);
    pathEl(vcurve(kx,ky-6,a.x,a.y+40),'var(--teal-600)',1.4,.55,'5 5');
  });

  counter(`${vis.length}/${DATA.areas.length} áreas · ${DATA.procesos.length} procesos`);
  fit();
}

