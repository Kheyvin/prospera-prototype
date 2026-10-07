/* ---------- v21 · NIVEL 3 — la sala del área ----------
   El táctico dejó de ser un tablero transversal de resultados (v14-v20) y pasó a ser DOS cosas
   (firma del operador 2026-08-01): la PORTADA-SELECTOR (¿qué área quieres ver? — imprimir la
   empresa entera en una vista sería inmenso) y LA SALA DE CADA ÁREA — el twin de esa gerencia o
   jefatura: su bajada, su plan, su estructura, sus procesos, sus sistemas y su archivo.
   Doctrina twin-primero: el cuerpo de la sala es lo que el área ES; lo que DEBE MOVER (metas
   bajadas · compromisos · contramedidas) se pinta encima como capa «Plan del ciclo» — apagada,
   la sala muestra solo la organización. Un dashboard enseña números; un twin enseña la empresa. */
function renderTactico(){ state.area3?renderSalaArea():renderTacticoPortada(); }

/* orden de severidad para el peor-de (rollup visual del selector) */
const SEVORD={rojo:3,ambar:2,verde:1,gris:0};
const peorSalud=xs=>xs.reduce((w,s)=>SEVORD[s]>SEVORD[w]?s:w,'gris');

/* ══════════ PORTADA — el selector organigrama + lo pendiente ENTRE áreas ══════════ */
function renderTacticoPortada(){
  const tops=DATA.areas.filter(a=>a.parent==='a-ger');
  const bajadas=DATA.objetivos.filter(o=>o.parent);
  const acuAbiertos=DATA.acuerdos.filter(a=>a.estado!=='cumplido');
  const rgVivos=[...DATA.riesgos].sort((a,b)=>NIV[b.prob]*NIV[b.imp]-NIV[a.prob]*NIV[a.imp])
    .filter(r=>nivelRiesgo(r).t!=='bajo');
  const ciclo=state.ciclo==='okr'?'del trimestre':state.ciclo==='gpd'?'del año':'del ciclo';
  /* fila con DOS destinos: la ficha (qué es) y la sala del área que responde (dónde se trabaja) */
  const bajadaHTML=bajadas.map(o=>{ const ar=o.area&&byId(DATA.areas,o.area), kr=o.krs[0], sk=saludKr(kr), c=krCur(kr);
    return `<div class="cambio-row rowsplit"><span class="sc" style="color:${health[sk]}">●</span>
      <button class="rowmain" data-obj="${o.id}"><div class="tt">${o.nm}</div>
        <div class="ap" style="white-space:normal">${kr.m}: <b>${c==null?'s/d':c}</b> → ${kr.to} ${kr.u} (esperado a hoy ${kr.esperado}) · responde ${kr.acc}${o.acordado?'':' · <b style="color:var(--warn)">sin acuerdo de bajada</b>'}</div></button>
      <button class="salalnk" data-sala="${o.area}" title="entrar a la sala de ${ar?ar.nm:''}">${ar?ar.nm:'—'} ›</button></div>`; }).join('');
  const acuHTML=acuAbiertos.map(a=>{ const c=ACUC[a.estado]||'var(--tx-mut)', aid=areaDeRef(a.ref)||cargoArea(a.quien);
    return `<div class="cambio-row rowsplit"><span class="sc" style="color:${c}">·</span>
      <button class="rowmain" data-acu="${a.id}"><div class="tt">${a.nm}</div><div class="ap">${a.quien} · vence ${a.plazo} · <span style="color:${c}">${a.estado}</span></div></button>
      ${aid?`<button class="salalnk" data-sala="${topArea(aid).id}">${topArea(aid).nm} ›</button>`:'<span class="salalnk none">directorio</span>'}</div>`; }).join('');
  const rgHTML=rgVivos.map(r=>{ const n=nivelRiesgo(r), aid=areaDeRef(r.ref)||cargoArea(r.dueno);
    return `<div class="cambio-row rowsplit"><span class="sc" style="color:${n.c}">▲</span>
      <button class="rowmain" data-rg="${r.id}"><div class="tt">${r.nm}</div><div class="ap">${/Sin mitigaci/i.test(r.mitig||'')?'<b style="color:var(--crit)">sin mitigación comprometida</b>':'mitiga: '+r.mitig}</div></button>
      ${aid?`<button class="salalnk" data-sala="${topArea(aid).id}">${topArea(aid).nm} ›</button>`:'<span class="salalnk none">directorio</span>'}</div>`; }).join('');
  /* la tarjeta del selector: primero el TWIN del área (qué es), después el plan (cómo le va) */
  const selCard=a=>{ const set=new Set(descendants(a.id));
    const pus=PUESTOS.filter(p=>set.has(p.area)), vac=pus.filter(p=>p.vac).length;
    const procs=subtreeProcs(a.id), docs=docsDeArea(a.id), huecos=procsSinDocRige(a.id).length;
    const hs=DATA.arneses.filter(h=>{const q=puestoByNm(h.deriva_de.puesto);return q&&set.has(q.area);});
    const baj=bajadas.filter(o=>set.has(o.area));
    const peor=peorSalud(baj.map(o=>saludKr(o.krs[0])));
    const sc=sinContraKpis().filter(k=>{const p=byId(DATA.procesos,k.proc);return p&&p.areas.some(x=>set.has(x));}).length;
    const pms=DATA.proyectos.filter(pm=>set.has(pm.area)&&pm.estado!=='cerrado').length;
    const mad=madurezSalud(madurezArea(a.id));
    const subs=kids(a.id);
    return `<button class="selcard" data-sala="${a.id}" title="entrar a la sala de ${a.nm}">
      <div class="hd"><span class="health-dot" style="background:${health[mad]||'#2a3733'}" title="madurez — peor brecha de sus capacidades"></span><b>${a.nm}</b><span class="ld">${a.lider.split(' · ')[0]}</span></div>
      ${subs.length?`<div class="jefs">${subs.map(s=>`<span class="jef" data-sala="${s.id}" title="entrar a la sala de la jefatura">${s.nm}${s.vacante?' <b style="color:var(--warn)">⚠</b>':''} ›</span>`).join('')}</div>`:''}
      <div class="twl mono">${pus.length} puestos${vac?` · <b style="color:var(--warn)">${vac} vac.</b>`:''} · ${procs.length} procesos · ${docs.length} docs${huecos?` · <b style="color:var(--warn)">${huecos} sin procedimiento</b>`:''} · ⛨ ${hs.length}</div>
      <div class="pll">${baj.length?`<span class="health-dot" style="background:${health[peor]||'#2a3733'};width:7px;height:7px"></span> ${baj.length} meta${baj.length>1?'s':''} bajada${baj.length>1?'s':''}`:'<span style="color:var(--warn)">sin metas bajadas</span>'} · ${pms} compromiso${pms===1?'':'s'}${sc?` · <b style="color:var(--warn)">${sc} sin contramedida</b>`:''}</div>
    </button>`; };
  const pv=pageView(`
    <div class="pv-hd"><span class="eyebrow">Nivel 3 · Táctico — la sala de cada área${respBadge('tac-selector')}</span>
      <h2>Elige el área — su sala tiene la bajada, el plan y el detalle</h2>
      <div class="sub">Cada gerencia y jefatura tiene su sala: lo que le toca ${ciclo}, cómo piensa llegar, quién la compone, cómo se ejecuta cada proceso, sobre qué sistemas corre y qué papeles la rigen. Doble click en el organigrama (nivel 2) entra directo.${respBadge('tac-contramedida')}</div></div>
    <div class="selgrid">${tops.map(selCard).join('')}</div>
    <div class="dirgrid" style="margin-top:12px">
      <div class="dpane solid"><div class="pt">Lo que baja del directorio — tus metas ${ciclo}${respBadge('tac-metas')}</div>
        ${bajadaHTML}
        <div class="paral"><b>Esto es lo que el nivel 1 dejó.</b> Cada meta del directorio se abre como meta de UNA gerencia; una meta sin acuerdo de bajada está asignada, no acordada.${sinBajar().length?` <b style="color:var(--warn)">${sinBajar().length} meta${sinBajar().length>1?'s':''} del directorio todavía no bajó a nadie.</b>`:''}</div></div>
      <div class="dpane"><div class="pt">Acuerdos abiertos — con responsable y plazo${respBadge('dir-acuerdos')}</div>
        ${acuHTML}
        <div class="paral">Lo acordado en la sesión anterior se revisa en la sala de cada área TODAS las semanas — cuando la sesión abre preguntando por ellos, ya están cerrados o ya se sabe por qué no.</div></div>
    </div>
    <div class="dirgrid">
      <div class="dpane"><div class="pt">Riesgos vivos — quién responde${respBadge('dir-riesgos')}</div>${rgHTML}</div>
      <div class="dpane"><div class="pt">Metas ${ciclo} de la empresa — el contexto</div>
        <div class="chips" style="margin:4px 0">${objRaiz().map(o=>`<span class="chip lk" data-obj="${o.id}"><span class="health-dot" style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${health[o.salud]};margin-right:4px"></span>${o.kr.m}: ${o.kr.from} → ${o.kr.to}${state.ciclo!=='okr'&&o.bono?' <b style="color:var(--warn)">★</b>':''}</span>`).join('')}</div>
        <div class="paral">Las metas de la empresa no se trabajan directamente: se trabajan por su bajada, en la sala del área que la aceptó.</div></div>
    </div>`);
  wireLinks(pv);
  counter(`${tops.length} gerencias · ${bajadas.length} metas bajadas · ${acuAbiertos.length} acuerdos abiertos · ${sinContraKpis().length} sin contramedida`);
}

/* ══════════ LA SALA DEL ÁREA — el twin de una gerencia/jefatura, de la meta al papel ══════════ */
let _lastSala=null;
function renderSalaArea(){
  const A=byId(DATA.areas,state.area3); if(!A){ state.area3=null; return renderTacticoPortada(); }
  const keepY=(_lastSala===A.id)?view.y:null; _lastSala=A.id;
  const set=new Set(descendants(A.id));
  const procs=subtreeProcs(A.id);
  const pus=PUESTOS.filter(p=>set.has(p.area));
  const docs=docsDeArea(A.id), huecos=procsSinDocRige(A.id);
  const bajadas=DATA.objetivos.filter(o=>o.parent&&set.has(o.area));
  const rgs=riesgosDeArea(A.id), acus=acuerdosDeArea(A.id).filter(a=>a.estado!=='cumplido');
  const plan=state.capas.has('plan');
  const bandLab=(t,resp,sub)=>`<div class="sband"><span class="eyebrow">${t}${resp?respBadge(resp):''}</span>${sub?`<div class="bsub">${sub}</div>`:''}</div>`;

  /* — ① lo que nos toca: la bajada del área + lo que la toca y nadie bajó — */
  const sostiene=new Set();
  procs.forEach(p=>p.sirve.forEach(id=>{ const r=raizDe(byId(DATA.objetivos,id)); if(r)sostiene.add(r.id); }));
  const tocaSinBajar=[...sostiene].map(id=>byId(DATA.objetivos,id))
    .filter(o=>!DATA.objetivos.some(h=>h.parent===o.id&&set.has(h.area)));
  const bajHTML=bajadas.map(o=>{ const kr=o.krs[0], sk=saludKr(kr), c=krCur(kr), padre=byId(DATA.objetivos,o.parent);
    return `<button class="sbaj" data-obj="${o.id}"><div class="bh"><span class="health-dot" style="background:${health[sk]}"></span><b>${o.nm}</b></div>
      <div class="mono bkr">${kr.m}: ${kr.from} → <b style="color:var(--brand-hi)">${c==null?'s/d':c}</b> → ${kr.to} ${kr.u} · esperado a hoy ${kr.esperado}</div>
      <div class="bmeta">responde ${kr.acc} · sostiene «${padre.nm}» · ${o.acordado?`acordada en la ${sesNm(o.acordado)}`:'<b style="color:var(--warn)">sin acuerdo de bajada</b>'}</div></button>`; }).join('');

  /* — ② el plan: la ruta completa de cada meta (capa Plan del ciclo) — */
  const ruta=o=>{ const kr=o.krs[0], k=kr.kpi&&byId(DATA.kpis,kr.kpi), p=k&&byId(DATA.procesos,k.proc), c=p&&capDeProc(p.id);
    const pm=DATA.proyectos.find(x=>k&&x.mueve===k.id)||DATA.proyectos.find(x=>{const g=x.brecha&&byId(DATA.brechas,x.brecha);return g&&p&&g.against===p.id;});
    return `<div class="ruta">
      <span class="rchip meta" data-obj="${o.id}"><i class="rdot" style="background:${health[saludKr(kr)]}"></i>${o.nm}</span><span class="rarr">→</span>
      ${c?`<span class="rchip" data-cap="${c.id}" title="la capacidad que la sostiene — ${brechaTxt(capBrecha(c))}">${c.nm} <span class="mono resc">${escDots(c.act,c.des)}</span></span><span class="rarr">→</span>`:''}
      ${p?`<span class="rchip" data-proc="${p.id}"><i class="rdot" style="background:${procColor(p)}"></i>${p.nm}</span><span class="rarr">→</span>`:''}
      ${pm?`<span class="rchip" data-pm2="${pm.id}"><span class="pdca">${pm.pdca}</span>${pm.nm} · ROI ${pm.roi}</span>`
          :'<span class="rchip falta">⚠ sin compromiso que la mueva</span>'}
      ${k?`<span class="rarr">→</span><span class="rkw">${krowHTML(k)}</span>`:''}
    </div>`; };
  const scArea=sinContraKpis().filter(k=>{const p=byId(DATA.procesos,k.proc);return p&&p.areas.some(x=>set.has(x));});
  const gsArea=DATA.brechas.filter(g=>{ const p=byId(DATA.procesos,g.against);
    return p&&p.areas.some(x=>set.has(x))&&g.estado!=='off-thread'&&!DATA.proyectos.some(pm=>pm.brecha===g.id); });

  /* — ③ la estructura: el mini-organigrama del subtree, nómina abierta — */
  const scard=(a,root)=>{ const ps=PUESTOS.filter(p=>p.area===a.id);
    return `<div class="scard${root?' root':''}">
      <div class="shd"><button class="plnk anm" data-area="${a.id}">${tbadge('area','área — clic: ficha · su sala: doble click en el organigrama')}${a.nm}</button>
        <span class="ld plnk" data-per="${a.lider.split(' · ')[0]}">${a.lider.split(' · ')[0]}</span>${a.vacante?'<span class="vac">vacante</span>':''}</div>
      ${ps.length?`<div class="prows">${ps.map(p=>{ const occ=puestoOcupantes(p.nm).length;
        return `<button class="prow" data-pu="${p.nm}"><span class="pnm">${p.nm}</span><span class="pocc ${p.vac?'vc':''}">${p.vac?'vac':(occ||'—')}</span>${state.capas.has('trabajo')?rosterBadge(p.nm):''}</button>`; }).join('')}</div>`:''}
      ${kids(a.id).length?`<div class="skids">${kids(a.id).map(c=>scard(c)).join('')}</div>`:''}
    </div>`; };

  /* — ④ los procesos: el mapa del área, con «abrir» EN SU LUGAR — */
  const pcard=p=>{ if(state.procAmp===p.id) return pampCard(p);
    const ks=kpisByProc(p.id), dc=procColor(p);
    const gs=DATA.brechas.filter(g=>g.against===p.id&&g.estado!=='off-thread');
    const pms=DATA.proyectos.filter(x=>{ const g=x.brecha&&byId(DATA.brechas,x.brecha);
      return x.estado!=='cerrado'&&((g&&g.against===p.id)||(x.mueve&&byId(DATA.kpis,x.mueve).proc===p.id)); });
    const ld=lienzoData(p.id);
    const steps=ld?ld.acts.map(a2=>({v:a2.verbo,t:a2.triage})):(DATA.pasosMini[p.id]||[]).map(v=>({v}));
    return `<div class="pcard">
      <div class="phd"><span class="health-dot" style="background:${dc}"></span><button class="pnm2" data-proc="${p.id}">${p.nm}</button>
        <button class="abrirb" data-amp="${p.id}" title="abrir el proceso en su lugar — roles y actividades; los vecinos se corren">⊕ abrir</button></div>
      <div class="pmeta"><span class="plnk" data-rol="${p.dueno}">${coreNm(p.dueno)}</span> · ${p.digital}${state.capas.has('trabajo')?' '+harnBadge(arnesDe(p.dueno,p.id)):''}</div>
      <div class="mini-pasos">${steps.map(s=>`<i title="${s.v}${s.t?' · '+s.t:''}" class="${s.t?('t-'+(s.t.includes('rpa')?'rpa':s.t.includes('agente')?'agente':s.t==='eliminable'?'elim':'hum')):''}"></i>`).join('')}</div>
      ${state.capas.has('brechas')&&gs.length?`<div class="pchips">${gs.map(g=>`<button class="gchip" data-g2="${g.id}" title="${g.nm}">▲ ${g.sev} · ${g.costo}</button>`).join('')}</div>`:''}
      ${state.capas.has('cinetica')&&pms.length?`<div class="pchips">${pms.map(pm=>`<button class="kchip" data-pm2="${pm.id}"><span class="pdca">${pm.pdca}</span>${pm.nm}</button>`).join('')}</div>`:''}
      ${plan&&ks.length?`<div class="pk">${ks.map(k=>krowHTML(k)+(sinContra(k)?`<div class="ncm">▲ sin contramedida comprometida · <span class="plnk" data-acc="comprometer-contramedida">comprometer ›</span></div>`:'')).join('')}</div>`:''}
    </div>`; };
  const pampCard=p=>{ const ld=lienzoData(p.id), dc=procColor(p);
    const lanes=ld?ld.lanes.map((ln,i)=>`<div class="lane"><button class="lrole" data-rol="${ln.role}">${ln.role}</button>
        <div class="lacts">${ld.acts.filter(a2=>a2.lane===i).map(a2=>`<button class="lact ${a2.triage?('t-'+(a2.triage.includes('rpa')?'rpa':a2.triage.includes('agente')?'agente':a2.triage==='eliminable'?'elim':'hum')):''}" data-acto="${p.id}:${a2.ord}" title="${a2.ttl} · ◔ ${a2.toque}${a2.espera&&a2.espera!=='—'?' · ⏳ '+a2.espera:''}${a2.triage?' · '+a2.triage:''}">${String(a2.ord).padStart(2,'0')} ${a2.verbo}</button>`).join('')}</div></div>`).join('')
      :`<div class="lane"><span class="lrole" style="color:var(--tx-faint)">pasos macro</span><div class="lacts">${(DATA.pasosMini[p.id]||[]).map((v,i)=>`<span class="lact">${String(i+1).padStart(2,'0')} ${v}</span>`).join('')}</div></div>
       <div class="bsub" style="margin:4px 0 0">actividades sin levantar — el detalle (carriles · tiempos · clasificación) se construye en el levantamiento</div>`;
    return `<div class="pcard amp">
      <div class="phd"><span class="health-dot" style="background:${dc}"></span><button class="pnm2" data-proc="${p.id}">${p.nm}</button>
        <span class="pmeta" style="margin:0 8px">${coreNm(p.dueno)}${ld&&ld.vsm?` · ◔ ${ld.vsm.toque} · ⏳ ${ld.vsm.espera}`:''}</span>
        <button class="abrirb" onclick="drillLienzo('${p.id}')" title="el flujograma completo, con puertos y clasificación">flujograma (nivel 4) ›</button>
        <button class="abrirb" data-amp="${p.id}" title="plegar — vuelve a su tarjeta">⊖ plegar</button></div>
      <div class="lanes">${lanes}</div>
      ${docsDeProc(p.id).length?`<div class="pchips">${docsDeProc(p.id).map(d=>`<button class="docmini" data-doc="${d.id}">${iico('documento','documento del archivo')}${TIPO_DOC[d.tipo][0]} · ${d.nm.length>34?d.nm.slice(0,32)+'…':d.nm}</button>`).join('')}</div>`:''}
    </div>`; };
  const negocio=DATA.cadena.map(id=>byId(DATA.procesos,id)).filter(p=>p.areas.some(x=>set.has(x)));
  const apoyo=procs.filter(p=>p.tipo==='apoyo');
  const direccion=procs.filter(p=>p.tipo==='direccion');
  const grupo=(t,ps)=>ps.length?`<div class="pgrupo"><div class="glab">${t}</div><div class="pflow">${ps.map(pcard).join('')}</div></div>`:'';

  /* — ⑤ sobre qué corre — */
  const sis=DATA.sistemas.filter(s=>procs.some(p=>p.sist.includes(s.nm)));
  const sisHTML=sis.map(s=>`<div class="sysrow"><button class="plnk" data-sis="${s.id}"><span class="health-dot" style="background:${health[digHealth(s.digital)]};width:7px;height:7px"></span> ${s.nm}</button>
    <span class="conector mono">${s.conector}</span>
    <span class="chips">${procs.filter(p=>p.sist.includes(s.nm)).map(p=>`<span class="chip lk" data-proc="${p.id}">${p.nm}</span>`).join('')}</span></div>`).join('');

  /* — ⑥ el archivo — */
  const ORD_DOC=['procedimiento','instruccion','registro','contrato','expediente','politica'];
  const docRow=d=>{ const p=d.proc&&byId(DATA.procesos,d.proc), vc=docVence(d);
    return `<button class="docrow" data-doc="${d.id}">${iico('documento',TIPO_DOC[d.tipo][1])}<span class="dnm">${d.nm}</span>
      ${d.contraparte?`<span class="dctr" title="contraparte">${d.contraparte}</span>`:''}
      ${p?`<span class="dproc">${p.nm}</span>`:''}
      ${vc&&vc.est==='vencido'?'':`<span class="dest" style="color:${DOC_EST[d.estado]||'var(--tx-mut)'}">${d.estado==='en-tramite'?'en trámite':d.estado}</span>`}
      ${vc?`<span class="dven mono" style="color:${vc.c}" title="derivado contra el periodo vigente — cuando el plazo venció, manda sobre el estado guardado">${vc.t}</span>`:''}
      ${d.g?`<span class="dg" title="tiene una brecha anclada">▲</span>`:''}</button>`; };
  const archivoHTML=ORD_DOC.filter(t=>docs.some(d=>d.tipo===t)).map(t=>`<div class="dgrupo">
      <div class="glab">${TIPO_DOC[t][0]}s <span class="gsub">— ${TIPO_DOC[t][1]}</span></div>
      ${docs.filter(d=>d.tipo===t).map(docRow).join('')}</div>`).join('')
    +(huecos.length?`<div class="dgrupo"><div class="glab" style="color:var(--warn)">Sin papel que los rija <span class="gsub">— el hueco se dibuja, no se calla</span></div>
      ${huecos.map(p=>`<button class="docrow hueco" data-proc="${p.id}"><span style="color:var(--warn)">⚠</span><span class="dnm">${p.nm} — ningún procedimiento lo rige</span><span class="dproc">se opera de memoria; cada excepción se pierde</span></button>`).join('')}</div>`:'');

  const tops=DATA.areas.filter(a=>a.parent==='a-ger');
  const pv=pageView(`
    <div class="salahd">
      <div class="sh1"><span class="eyebrow">Nivel 3 · La sala del área${respBadge('sala-twin')}</span>
        <h2>${A.nm}</h2>
        <div class="sub">${A.lider} · procedencia del levantamiento: ${A.conf} · ${kids(A.id).length?kids(A.id).length+' jefaturas · ':''}${pus.length} puestos · ${procs.length} procesos · ${sis.length} sistemas · ${docs.length} documentos</div></div>
      <div class="sh2">
        <select id="salaSel" title="saltar a otra sala">${tops.map(t=>`<optgroup label="${t.nm}"><option value="${t.id}"${t.id===A.id?' selected':''}>${t.nm}</option>${kids(t.id).map(s=>`<option value="${s.id}"${s.id===A.id?' selected':''}>· ${s.nm}</option>`).join('')}</optgroup>`).join('')}</select>
        <button class="btn ghost" onclick="gotoNivel(3)">‹ elegir otra área</button>
        <button class="btn ghost" onclick="drillArea('${A.id}')" title="verla como lente sobre el mapa de valor (nivel 2)">ver dónde vive en el mapa ›</button></div>
    </div>
    ${bandLab('① Lo que nos toca — la bajada del directorio','tac-metas', bajadas.length?'la meta del directorio abierta como meta de ESTA área, con el rol que responde':'ninguna meta del directorio está abierta en esta área')}
    <div class="sbajs">${bajHTML||'<div class="bsub">El área sostiene la operación sin meta bajada este ciclo — si el directorio la mira, alguien tiene que abrirla acá.</div>'}
      ${tocaSinBajar.length?`<div class="sbaj warn2">${tocaSinBajar.map(o=>`<button class="plnk" data-obj="${o.id}">⚠ «${o.nm}» se apoya en procesos de esta área y nadie la bajó ›</button>`).join('<br>')}</div>`:''}</div>
    ${plan?bandLab('② El plan — cómo llegamos','sala-plan','la ruta completa de cada meta: capacidad → proceso → compromiso → indicador · lo que la reunión va a preguntar')+`
    <div class="rutas">${bajadas.map(ruta).join('')||'<div class="bsub">sin metas bajadas no hay ruta que dibujar</div>'}
      ${scArea.length||gsArea.length?`<div class="pregunta"><div class="glab" style="color:var(--warn)">La reunión va a preguntar por esto</div>
        ${scArea.map(k=>krowHTML(k)+`<div class="ncm">▲ fuera de banda y sin contramedida · <span class="plnk" data-acc="comprometer-contramedida">comprometer ›</span></div>`).join('')}
        ${gsArea.map(g=>`<button class="cambio-row" data-g2="${g.id}"><span class="sc" style="color:${g.sev==='alta'?'var(--crit)':'var(--warn)'}">▲</span><div><div class="tt">${g.nm.length>72?g.nm.slice(0,70)+'…':g.nm}</div><div class="ap">brecha sin compromiso que la ataque</div></div><span class="ap">${g.costo}</span></button>`).join('')}</div>`:''}</div>`:''}
    ${bandLab('③ Quién — la estructura del área','org-estructura','puestos y ocupantes en su lugar · vacante = se dice · clic: ficha · la nómina es la de verdad, no un promedio')}
    <div class="sestr">${scard(A,true)}</div>
    ${bandLab('④ Cómo se ejecuta — los procesos del área','sala-procesos','⊕ abrir despliega el proceso EN SU LUGAR (roles × actividades) y corre a los vecinos · doble click = flujograma completo · la actividad fina (el MOF vivo) vive en el nivel 4')}
    <div class="sprocs">${grupo('Del negocio — en el orden en que ocurren',negocio)}${grupo('De apoyo',apoyo)}${grupo('De dirección — los ejerce esta área',direccion)}</div>
    ${bandLab('⑤ Sobre qué corre','z0-sistemas','los sistemas que sirven a estos procesos, con su conector al pulso')}
    <div class="ssis">${sisHTML||'<div class="bsub">sin sistemas declarados</div>'}</div>
    ${bandLab('⑥ El archivo — papeles, registros y contratos','sala-archivo','la pirámide documental del área: qué rige cada proceso, qué evidencia produce, qué contrato lo sustenta · vencimiento DERIVADO contra el periodo vigente')}
    <div class="sarch">${archivoHTML||'<div class="bsub">sin documentos levantados en esta área</div>'}</div>`);
  wireLinks(pv);
  pv.querySelectorAll('[data-amp]').forEach(b=>b.onclick=e=>{ e.stopPropagation();
    state.procAmp=state.procAmp===b.dataset.amp?null:b.dataset.amp; render(); });
  pv.querySelectorAll('[data-acto]').forEach(b=>b.onclick=e=>{ e.stopPropagation();
    const [pid,ord]=b.dataset.acto.split(':'); const ld=lienzoData(pid); if(!ld)return;
    const a2=ld.acts.find(x=>x.ord===+ord); if(a2){ state.lienzo=pid; openActividad(a2); } });
  const ss=pv.querySelector('#salaSel'); if(ss) ss.onchange=e=>abrirSala(e.target.value);
  /* abrir/plegar un proceso NO debe devolverte al techo de la página — el lugar se conserva */
  if(keepY!=null) requestAnimationFrame(()=>{ view.y=keepY; clampPagina(); applyView(false); });
  counter(`Sala: ${A.nm} · ${procs.length} procesos · ${pus.length} puestos · ${docs.length} documentos · ${rgs.length} riesgos · ${acus.length} acuerdos abiertos`);
}
