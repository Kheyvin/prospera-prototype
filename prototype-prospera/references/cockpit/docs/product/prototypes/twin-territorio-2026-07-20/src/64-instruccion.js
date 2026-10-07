/* ---------- z3 · instrucción de trabajo — ISO 10013 nivel 3 · APQC L5 (el "cómo") ----------
   El piso del zoom semántico: debajo de la última tarea no hay más twin — hay ARNÉS (CK-29):
   el procedimiento se COMPILA al puesto (Arnesia N15 → Colab Studio N17). */
function drillActividad(pid,ord){ state.lienzo=pid; state.act={pid,ord}; state.nivel=4; state.escala='z3'; state.insp='home'; render(); }
function renderInstruccion(){
  const {pid,ord}=state.act, p=byId(DATA.procesos,pid), f=lienzoData(pid);
  const a=f?f.acts.find(x=>x.ord===ord):null;
  if(!a){ state.escala='z2'; render(); return; }
  const d=DATA.z3[pid+':'+ord];
  const rolCarril=f.lanes[a.lane]?f.lanes[a.lane].role:p.dueno;
  const h=arnesDe(rolCarril,pid);
  const W=Math.max(1620, d?320+d.tareas.length*232+300:0), H=980; setCanvas(W,H);
  const triCls=t=>t==='eliminable'?'elim':(t&&t.startsWith('automatizable')?(t.includes('rpa')?'rpa':'agente'):'');

  const hd=el('div','grouplab'); hd.style.left='26px'; hd.style.top='20px'; hd.style.maxWidth=(W-60)+'px';
  hd.innerHTML=`<span class="eyebrow">z3 · instrucción de trabajo · ISO 10013 nivel 3 · APQC L5 — el "cómo" de una actividad${respBadge('z3-instruccion')}</span>
    <h2 style="font-family:var(--font-display);font-weight:800;font-size:23px;margin:4px 0 0;letter-spacing:-.01em">${String(ord).padStart(2,'0')} · ${a.verbo} — ${a.ttl}</h2>
    <div style="color:var(--tx-mut);font-size:12px;margin-top:5px;max-width:100ch">Actividad del proceso <span class="plnk" data-proc="${pid}">${p.nm}</span> · carril <span class="plnk" data-rol="${rolCarril}">${rolCarril}</span>
      · ◔ ${a.toque}${a.espera&&a.espera!=='—'?` · ⏳ ${a.espera}`:''}${a.triage?` · <span class="tri ${triCls(a.triage)}" style="font-size:9px">${a.triage}</span>`:''}${a.mandato?` · <span class="tri" style="font-size:9px;color:var(--brand-hi);border-color:var(--teal-700)">mandato · ${a.mandato}</span>`:''}${a.rtlx?` · <span class="tri rtlx" style="font-size:9px">RTLX ${a.rtlx}</span>`:''}</div>`;
  wireLinks(hd); $nodes.appendChild(hd);

  const tY=300;
  if(d){
    // puertos de la actividad (insumos → tareas → salida)
    const lp=el('div','portbox'); lp.style.left='40px'; lp.style.top=tY+'px'; lp.style.width='212px';
    lp.innerHTML=`<div class="pt">⇥ insumos</div><div class="pitems" style="margin-top:0">${d.ins.map(i=>`<span>${i}</span>`).join('')}</div>`;
    $pins.appendChild(lp); MM_PTS.push({x:140,y:tY});
    let tx=320;
    d.tareas.forEach((t,i)=>{
      const n=el('div','node'); n.style.left=(tx+99)+'px'; n.style.top=tY+'px';
      n.innerHTML=`<div class="tarea"><span class="tv2">${String(i+1).padStart(2,'0')} · ${t.v}</span><div class="tt2">${t.t}</div></div>`;
      $nodes.appendChild(n); MM_PTS.push({x:tx+99,y:tY});
      if(i<d.tareas.length-1){ const ar=el('div','chev-arrow','▸'); ar.style.left=(tx+198+16)+'px'; ar.style.top=tY+'px'; $pins.appendChild(ar); }
      tx+=198+34;
    });
    const rp=el('div','portbox'); rp.style.left=(tx+14)+'px'; rp.style.top=tY+'px'; rp.style.width='212px';
    rp.innerHTML=`<div class="pt">salida ⇥</div><div class="pitems" style="margin-top:0"><span>${d.out}</span></div>`;
    $pins.appendChild(rp); MM_PTS.push({x:tx+120,y:tY});
  } else {
    const hb=el('div','node'); hb.style.left='560px'; hb.style.top=tY+'px';
    hb.innerHTML=`<div class="dia-card" style="width:560px;border-color:rgba(224,173,78,.5)"><b style="color:var(--warn)">Instrucción SIN LEVANTAR.</b>
      El "cómo" de esta actividad vive en la cabeza del ocupante — todavía no es corpus. Se construye en el levantamiento (M1 · entrevista + observación) o con la bitácora del embudo de ideas.${a.note?`<br><span style="color:var(--tx-faint);font-size:11.5px">Nota del AS-IS: ${a.note}</span>`:''}</div>`;
    $nodes.appendChild(hb);
  }

  // fila de caracterización de la actividad
  const cY=520, cards=[];
  if(d&&d.m36) cards.push(`<div class="gt">Automatizabilidad — dos scores, inputs visibles${respBadge('z3-scores')}</div>
    <div class="scorebar"><span class="lb">RPA</span><div class="tr2"><i style="width:${d.m36.rpa}%;background:${d.m36.rpa>=60?'var(--ok)':d.m36.rpa>=35?'var(--warn)':'#3a4d48'}"></i></div><span class="v2">${d.m36.rpa}</span></div>
    <div class="scorebar"><span class="lb">Agente</span><div class="tr2"><i style="width:${d.m36.agente}%;background:${d.m36.agente>=60?'var(--ok)':d.m36.agente>=35?'var(--warn)':'#3a4d48'}"></i></div><span class="v2">${d.m36.agente}</span></div>
    <div class="m36in">${[['volumen',d.m36.volumen],['excepciones',d.m36.exc],['datos',d.m36.datos],['reglas',d.m36.reglas],['promptable',d.m36.promptable?'sí':'no'],['tolerancia a revisión',d.m36.tolerancia],['riesgo de error',d.m36.riesgo]].map(([k,v])=>`<span class="chip" title="${k}">${k}: <b style="color:var(--tx)">${v}</b></span>`).join('')}</div>
    <div style="font-size:10px;color:var(--tx-faint)">los scores se COMPUTAN de los inputs con la confianza propagada — jamás se guardan</div>`);
  cards.push(`<div class="gt">Autoridad — quién ejecuta, quién responde${a.rtlx?' · carga observada':''}${respBadge('z3-autoridad')}</div>
    ${a.raci?`<div class="drow"><dt>R · ejecuta</dt><dd><span class="plnk" data-rol="${a.raci.R}">${a.raci.R}</span></dd></div>
    <div class="drow"><dt>A · responde</dt><dd><span class="plnk" data-rol="${a.raci.A}">${a.raci.A}</span></dd></div>`
    :`<div class="drow"><dt>R · ejecuta</dt><dd><span class="plnk" data-rol="${rolCarril}">${rolCarril}</span></dd></div>
    <div class="drow"><dt>A · responde</dt><dd><span class="plnk" data-rol="${p.dueno}">${p.dueno}</span></dd></div>`}
    ${a.rtlx?`<div class="drow"><dt>RTLX (agregado por rol)</dt><dd class="mono" style="color:var(--warn)">${a.rtlx} / 100</dd></div>
    <div style="font-size:10.5px;color:var(--tx-faint)">medido SOLO porque el triage la pre-flageó — jamás censal, jamás por persona</div>`:''}
    ${a.mandato?`<div style="font-size:11px;color:var(--brand-hi)">⚑ mandato ${a.mandato}: control protegido — el triage no puede eliminarlo</div>`:''}`);
  cards.push(`<div class="gt">Sistemas · conocimiento · procedencia${respBadge('z3-procedencia')}</div>
    <div class="drow"><dt>Con qué (C7)</dt><dd>${(a.sist&&a.sist.length&&a.sist[0]!=='—')?a.sist.map(s=>sisByName(s)?`<span class="plnk" data-sis="${s}">${s}</span>`:s).join(' · '):'— (a mano)'}</dd></div>
    ${DATA.conocimiento[pid]?`<div class="drow"><dt>Conocimiento</dt><dd style="font-size:11.5px">${DATA.conocimiento[pid].n}</dd></div>`:''}
    <div class="drow"><dt>Fuente</dt><dd style="font-size:11.5px">${a.fte||'—'}</dd></div>
    <div class="drow"><dt>Confianza</dt><dd><span class="chip" style="border-color:${a.conf==='alta'?'var(--ok)':a.conf==='media'?'var(--warn)':'var(--crit)'};color:${a.conf==='alta'?'var(--ok)':a.conf==='media'?'var(--warn)':'var(--crit)'}">${a.conf||'s/d'}</span></dd></div>
    ${d&&d.nota?`<div style="font-size:11px;color:var(--tx-mut);line-height:1.45;border-top:1px solid var(--border-soft);padding-top:7px">${d.nota}</div>`:''}`);
  const alts=(f.seq||[]).filter(s=>s.f===ord);
  cards.push(`<div class="gt">Flujos que nacen aquí</div>
    ${alts.length?alts.map(s=>{ const t2=f.acts.find(x=>x.ord===s.t);
      return `<button class="loop-it" onclick="drillActividad('${pid}',${s.t})"><span class="pdca" style="${s.alt?'background:rgba(224,173,78,.15);color:var(--warn)':''}">${s.alt?'alterno':'sigue'}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.c?s.c+' → ':''}${String(s.t).padStart(2,'0')} · ${t2?t2.verbo:''}</span></button>`;}).join('')
    :'<span style="font-size:12px;color:var(--tx-faint)">— actividad final del flujo</span>'}
    <div style="font-size:10px;color:var(--tx-faint)">toca un flujo para saltar a ESA instrucción — el viaje no se corta</div>`);
  let cx2=40;
  cards.forEach(html=>{ const c=el('div','z3card',html); c.style.left=cx2+'px'; c.style.top=cY+'px'; wireLinks(c); $pins.appendChild(c); cx2+=352+30; });

  // EL PISO (CK-30): debajo de la instrucción no hay más zoom — hay arnés compilado por rol×proceso
  const piso=el('div','piso-arnes'); piso.style.left='40px'; piso.style.top='820px'; piso.style.width='1100px';
  piso.innerHTML=`<div class="gt" style="margin-bottom:6px">El piso del twin — de la instrucción al trabajo compilado${respBadge('sala-trabajo')}</div>
    ${h?`Este procedimiento ${h.acts.includes(ord)?'YA está compilado':'alimenta'} el arnés ${harnBadge(h)} de este <b>rol×proceso</b> — compilado del twin para el rol <span class="plnk" data-rol="${rolCarril}">${rolCarril}</span> y ensamblado al roster del puesto <span class="plnk" data-pu="${h.deriva_de.puesto}">${h.deriva_de.puesto}</span>. Cuando esta instrucción cambie (gestión de cambios), el arnés se <b>recompila</b>, jamás se edita a mano.`
    :`El rol <span class="plnk" data-rol="${rolCarril}">${rolCarril}</span> en este proceso HOY no tiene arnés — esta instrucción es candidata a compilarse como skill (Arnesia N15 → Colab Studio N17). ${a.triage&&a.triage.startsWith('automatizable')?'El triage ya la marcó <b>'+a.triage+'</b>: el gap agéntico, visible.':'El gap de la era agéntica, visible.'}`}`;
  wireLinks(piso); $pins.appendChild(piso);

  counter(d?`${d.tareas.length} tareas · instrucción levantada`:'instrucción sin levantar (M1)');
  fitFlujo();
}

