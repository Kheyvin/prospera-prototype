/* ============================================================
   FICHAS DEL VIAJE COMPLETO (CK-29) — toda entidad navegable
   ============================================================ */
/* ===== v14 · APUESTA — la unidad del directorio (entidad real desde D-23: 13º nodo del schema) ===== */
function openApuesta(a){ const objs=a.objetivos.map(id=>byId(DATA.objetivos,id));
  const pms=DATA.proyectos.filter(pm=>{ const k=byId(DATA.kpis,pm.mueve); const g=pm.brecha&&byId(DATA.brechas,pm.brecha);
    return (k&&hiloTocaAp(k.kr,a))||(g&&hiloTocaAp(g.kr,a)); });
  const ct=contraste(a);
  openDrawer('Apuesta · directorio', a.nm, `
    <div class="dgroup">
      <div class="drow"><dt>Estado</dt><dd>${a.estado==='sellada'?'<span class="chip teal">sellada</span>':a.estado==='por-sellar'?'<span class="chip" style="border-color:var(--warn);color:var(--warn)">por sellar</span>':`<span class="chip">${a.estado}</span>`} <span style="font-size:10px;color:var(--tx-faint)">ciclo: por sellar → sellada → cumplida | retirada · re-apostar re-versiona</span></dd></div>
      <div class="drow"><dt>Riesgo vs apetito</dt><dd><span class="chip" style="border-color:${a.riesgo==='alto'?'var(--crit)':'var(--warn)'};color:${a.riesgo==='alto'?'var(--crit)':'var(--warn)'}">${a.riesgo}</span> <span style="font-size:11px;color:${ct.c}">${ct.t}</span></dd></div>
      <div class="drow"><dt>Apostamos</dt><dd style="font-size:12px">${a.apuesta_de.t} · tope ${a.apuesta_de.tope} <span style="color:var(--tx-faint)">— tiempo fijo, alcance variable</span></dd></div>
      <div class="drow"><dt>Horizonte</dt><dd style="font-size:12px">3 años · se rinde cuentas por ${state.ciclo==='okr'?'trimestre':'año'}</dd></div></div>
    <div class="dgroup"><div class="gt">Valor que persigue — en dinero, no en adjetivos</div>
      <div style="font-family:var(--font-mono);font-size:14px;color:var(--brand-hi)">${a.valor.s}</div>
      <div style="font-size:11px;color:var(--tx-faint);margin-top:3px">Supuesto visible: ${a.valor.supuesto}</div></div>
    <div class="dgroup"><div class="gt">La sostienen — objetivos del ciclo</div>
      ${objs.map(o=>`<button class="loop-it" data-obj="${o.id}"><span style="width:8px;height:8px;border-radius:50%;background:${health[o.salud]};flex:none"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.nm}</span><span class="mono" style="font-size:10px;color:var(--tx-mut)">${krCur(o.kr)==null?'s/d':krCur(o.kr)} → ${o.kr.to} ${o.kr.u}</span></button>`).join('')}</div>
    ${pms.length?`<div class="dgroup"><div class="gt">Proyectos que le aportan</div>
      ${pms.map(pm=>`<button class="loop-it" data-pm2="${pm.id}"><span class="pdca">${pm.pdca}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pm.nm}</span><span class="mono" style="font-size:10px;color:var(--brand-hi)">${pm.roi}</span></button>`).join('')}</div>`:''}
    <div class="dgroup"><div class="gt">Acciones (kinética — decide la Dirección)</div>
      ${a.estado!=='por-sellar'?'':'<button class="btn" data-acc="sellar-apuesta">Sellar la apuesta › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button>'}
      <button class="btn" data-acc="re-apostar">Re-apostar (cambiar meta o riesgo) › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button>
      <button class="btn" data-acc="retirar-apuesta">Retirar la apuesta › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · gestión-de-cambios</span></button>
      <button class="btn" data-acc="convocar-rendicion">Convocar rendición de cuentas › <span class="mono" style="font-size:9px;color:var(--tx-faint)">dirección · directa</span></button></div>`);
}
function openObjetivo(o){
  const drivers=DATA.procesos.filter(p=>p.sirve.includes(o.id));
  const krIds=krsDe(o).map(k=>k.id);
  const gaps=DATA.brechas.filter(g=>krIds.includes(g.kr));
  const ks=DATA.kpis.filter(k=>krIds.includes(k.kr));
  const baj=bajada(o), padre=o.parent?byId(DATA.objetivos,o.parent):null, ar=o.area?byId(DATA.areas,o.area):null;
  /* v17.1: el hilo tampoco se corta hacia ARRIBA — la apuesta del directorio que este objetivo sostiene
     (inversa de openApuesta § "La sostienen"); sin apuesta = se dice, no se oculta */
  const aps=DATA.apuestas.filter(a=>a.objetivos.includes(o.id));
  const apDot={'por-sellar':'var(--warn)','sellada':'var(--brand-hi)','cumplida':'var(--ok)','retirada':'var(--tx-faint)'};
  openDrawer('Objetivo · '+o.persp+' (BSC)', o.nm, `
    <div class="dgroup">
      <div class="drow"><dt>Salud</dt><dd><span class="chip" style="border-color:${health[o.salud]};color:${health[o.salud]}" title="peor de sus contratos de cambio (avance vs esperado a hoy) — se computa, jamás se guarda">${o.salud}</span>${krsDe(o).length>1?`<span style="font-size:10.5px;color:var(--tx-faint)"> — peor de sus ${krsDe(o).length} contratos: uno cumplido no tapa a otro roto</span>`:''}</dd></div>
      <div class="drow"><dt>De quién es</dt><dd style="font-size:12px">${ar?`<span class="plnk" data-area="${ar.id}">${ar.nm}</span> — la responde ${krsDe(o)[0].acc}`:'<b>del directorio</b> — es de la empresa, no de una gerencia'}</dd></div>
      <div class="drow"><dt>Horizonte</dt><dd style="font-size:12px">${({'3a':'plan a 3 años','anual':'el año','trimestre':'el trimestre'})[o.horiz]||'—'} <span style="font-size:10px;color:var(--tx-faint)">— no todo lo que el directorio mira es trimestral</span></dd></div></div>
    <div class="dgroup"><div class="gt">Los contratos de cambio (${krsDe(o).length})</div>
      ${krsDe(o).map(kr=>{ const sk=saludKr(kr), c=krCur(kr), kk=krKpi(kr), pk=pesoKr(kr.id);
        return `<div style="border-left:2px solid ${health[sk]};padding-left:8px;margin-bottom:7px">
          <div style="font-size:12.5px">${kr.m}</div>
          <div class="mono" style="font-size:11px;color:var(--tx-mut)">${kr.from} → <b style="color:var(--brand-hi)">${c==null?'s/d':c}</b> → ${kr.to} ${kr.u} · esperado a hoy ${kr.esperado} ${kr.u}</div>
          <div style="font-size:10.5px;color:var(--tx-faint)">responde <b>${kr.acc}</b> · ${kk?`lee la serie de <span class="plnk" data-k="${kk.id}">${kk.nm}</span>`:'<span style="color:var(--warn)">sin serie: meta declarada, no medida</span>'}${pk!=null&&Math.abs(pk-1)>0.001?` · <span style="color:var(--warn)">sus indicadores pesan ${pk}, no 1</span>`:''}</div></div>`; }).join('')}</div>
    <div class="dgroup"><div class="gt">Hacia arriba — qué lo sostiene</div>
      ${padre?`<button class="loop-it" data-obj="${padre.id}"><span style="width:8px;height:8px;border-radius:50%;background:${health[padre.salud]};flex:none"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${padre.nm}</span><span class="mono" style="font-size:10px;color:var(--tx-mut)">baja de esta meta</span></button>
        <div style="font-size:11.5px;margin:4px 0 6px;color:${o.acordado?'var(--tx-mut)':'var(--warn)'}">${o.acordado?`acordada con la gerencia en la <b>${sesNm(o.acordado)}</b> — el ida y vuelta quedó cerrado`:'⚠ <b>asignada, no acordada</b>: nadie registró que la gerencia la aceptara ni que fuera factible. Esa diferencia predice el incumplimiento mejor que cualquier semáforo.'}</div>`:''}
      ${aps.length?aps.map(a=>`<button class="loop-it" data-ap="${a.id}"><span style="width:8px;height:8px;border-radius:50%;background:${apDot[a.estado]||'var(--tx-faint)'};flex:none"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.nm}</span><span class="mono" style="font-size:10px;color:var(--tx-mut)">apuesta · ${a.estado}</span></button>`).join(''):(padre?'':'<span style="font-size:12px;color:var(--tx-faint)">ninguna apuesta del directorio lo sostiene — se decide en el nivel 1</span>')}</div>
    <div class="dgroup"><div class="gt">La bajada — quién la trabaja</div>
      ${baj.hijos.length?baj.hijos.map(h=>{ const ha=byId(DATA.areas,h.area);
        return `<button class="loop-it" data-obj="${h.id}"><span style="width:8px;height:8px;border-radius:50%;background:${health[h.salud]};flex:none"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.nm}</span><span class="mono" style="font-size:10px;color:${h.acordado?'var(--tx-mut)':'var(--warn)'}">${ha?ha.nm:'—'}${h.acordado?'':' · sin acordar'}</span></button>`; }).join('')
        +`<div style="font-size:11px;color:${baj.sin.length?'var(--warn)':'var(--tx-faint)'};margin-top:5px">${baj.acordados} de ${baj.hijos.length} gerencias cerraron el acuerdo de bajada</div>`
       :(esDirectorio(o)?`<div style="font-size:12px;color:var(--warn)">⚠ <b>Sin bajar.</b> Ninguna gerencia la tiene abierta como suya: el directorio la mira todos los meses y nadie la trabaja.</div>
        <button class="btn" data-acc="bajar-objetivo" style="margin-top:6px">Bajarla a una gerencia › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · gestión-de-cambios</span></button>`
        :'<span style="font-size:12px;color:var(--tx-faint)">es el último peldaño: debajo hay procesos y actividades, no más metas</span>')}</div>
    <div class="dgroup"><div class="gt">Hacia abajo — qué lo mueve</div>
      ${ks.map(krowHTML).join('')}
      <div class="chips">${drivers.map(p=>`<span class="chip lk" data-proc="${p.id}">${p.nm}</span>`).join('')||'<span style="font-size:12px;color:var(--tx-faint)">sin drivers declarados</span>'}</div></div>
    ${gaps.length?`<div class="dgroup"><div class="gt">Qué lo bloquea</div>${gaps.map(g=>`<button class="loop-it" data-g2="${g.id}"><span style="color:var(--crit)">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.nm}</span></button>`).join('')}</div>`:''}
    ${prov(o.fuente,o.conf)}
    <div class="dgroup"><div class="gt">Acciones (kinética)</div>
      <button class="btn" data-acc="aprobar-version-objetivo">Aprobar nueva versión › <span class="mono" style="font-size:9px;color:var(--tx-faint)">gobernanza · gestión-de-cambios</span></button>
      ${o.parent&&!o.acordado?'<button class="btn" data-acc="acordar-bajada">Cerrar el acuerdo de bajada con la gerencia › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · revisión-dueño</span></button>':''}
      ${esDirectorio(o)&&baj.hijos.length?'<button class="btn" data-acc="bajar-objetivo">Abrirla en otra gerencia › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · gestión-de-cambios</span></button>':''}</div>
    <button class="btn" style="justify-content:center" id="objHilo">Encender su hilo en el mapa ›</button>`);
  const b=inBody.querySelector('#objHilo'); if(b) b.onclick=()=>{ state.mod='territorio'; state.nivel=2; state.escala='z0'; setPiel('valor'); state.activeObj=o.id;
    if(!state.capas.has('hilo')){state.capas.add('hilo');document.querySelector('[data-capa=hilo]').classList.add('on');} render(); };
}
/* ===== PUESTO — la posición del organigrama (D-19): se contrata, se ocupa, se vacanta, reporta ===== */
function openPuesto(nm){ const pu=puestoByNm(nm); if(!pu)return openRol(nm);
  const occs=puestoOcupantes(pu.nm), a=byId(DATA.areas,pu.area);
  const pares=pu.pares, hs=rosterDe(pu.nm);
  const roles=[...new Set(pares.map(x=>x.rol))];
  const ks=DATA.kpis.filter(k=>roles.includes(k.dueno));
  const hVig=hs.find(h=>arnesEstado(h)==='vigente');
  openDrawer('Puesto · posición del organigrama', pu.nm, `
   <div class="dgroup">
     ${a?`<div class="drow"><dt>Área</dt><dd><span class="plnk" data-area="${a.id}">${a.nm}</span></dd></div>`:''}
     ${pu.reporta_a?`<div class="drow"><dt>Reporta a</dt><dd><span class="plnk" data-pu="${pu.reporta_a}">${pu.reporta_a}</span></dd></div>`:'<div class="drow"><dt>Reporta a</dt><dd>— (cabeza del organigrama)</dd></div>'}
     <div class="drow"><dt>Ocupantes</dt><dd class="mono" style="font-size:12px">${occs.length||'—'}${pu.vac?' · <span style="color:var(--warn)">vacante</span>':''}</dd></div>
     ${occs.length?`<div class="chips" style="justify-content:flex-end">${occs.slice(0,8).map(q=>`<span class="chip lk" data-per="${q}">${q}</span>`).join('')}${occs.length>8?`<span class="chip">+${occs.length-8} más</span>`:''}</div>`
       :'<div style="text-align:right"><span class="chip" style="border-color:var(--warn);color:var(--warn)">SIN PERSONA ASIGNADA</span></div>'}
     <div class="drow"><dt>Fuente · conf</dt><dd class="mono" style="font-size:10px">nómina + wiring de procesos · alta</dd></div></div>
   <div class="dgroup"><div class="gt">Roles que agrega — el papel en cada proceso</div>
     ${roles.map(r=>`<div class="drow"><dt><span class="plnk" data-rol="${r}">${r}</span></dt><dd><div class="chips" style="justify-content:flex-end">${pares.filter(x=>x.rol===r).map(x=>`<span class="chip lk" data-proc="${x.proc}">${byId(DATA.procesos,x.proc).nm}${x.via==='posee'?' · posee':''}</span>`).join('')}</div></dd></div>`).join('')||'<div style="font-size:12px;color:var(--tx-faint)">Sin proceso mapeado — sin carril declarado en el AS-IS.</div>'}</div>
   <div class="dgroup"><div class="gt">Roster de arneses — se ENSAMBLA por puesto${respBadge('sala-trabajo')}</div>
     ${pares.length?pares.map(x=>{ const h=arnesDe(x.rol,x.proc);
       return `<div class="drow"><dt style="font-size:10.5px">${byId(DATA.procesos,x.proc).nm}</dt><dd>${harnBadge(h)}</dd></div>`; }).join(''):'<div style="font-size:12px;color:var(--tx-faint)">Sin pares rol×proceso — nada que compilar aún.</div>'}
     <div style="font-size:10px;color:var(--tx-faint)">se COMPILA por rol×proceso (Arnesia N15) · se ensambla por puesto (roster) · se CORRE por persona (N17, BYO licencia)</div></div>
   ${ks.length?`<div class="dgroup"><div class="gt">KPIs de sus roles — por rol, jamás por persona</div>${ks.map(krowHTML).join('')}</div>`:''}
   ${hVig?`<div class="dia-card"><b>El día del ocupante — supervisar, no ejecutar.</b><br>Su agente (Claude Code + arnés ${hVig.v}) ejecuta ${pu.nm==='Analista de Cobranza'?'el monitoreo de cartera, la clasificación de mora y los recordatorios':'los flujos del puesto'}; ${occs[0]?occs[0].split(' ')[0]:'el ocupante'} <b>supervisa con contrato</b>: verifica ${hVig.verificacion_humana.que[0]} (${hVig.verificacion_humana.evidencia}) en ${hVig.verificacion_humana.tiempo}, aprueba excepciones, mejora su arnés y propone ideas al embudo. La supervisión se especifica y se MIDE — no se declara.</div>`:''}
   ${conocimientoHTML(pares[0]?pares[0].proc:null)}
   <button class="btn" style="justify-content:center" onclick="setPiel('org');state.escala='z0';render()">Ver en el organigrama ›</button>`);
}
/* ===== ROL — el papel dentro de un proceso: carril BPMN, fila RACI (D-19, re-significado) ===== */
function openRol(nm){ const core=coreNm(nm);
  const own=DATA.procesos.filter(p=>coreNm(p.dueno)===core);
  const lz=[DATA.flagship,...Object.values(DATA.lienzos)];
  const carriles=lz.filter(l=>l.lanes.some(x=>x.role===core));
  const racis=lz.flatMap(l=>l.acts.filter(a2=>a2.raci&&(a2.raci.R===core||a2.raci.A===core)).map(a2=>({l,a:a2})));
  const pus=PUESTOS.filter(p=>p.pares.some(x=>x.rol===core));
  const hs=DATA.arneses.filter(h=>h.deriva_de.rol===core);
  const ks=DATA.kpis.filter(k=>k.dueno===core);
  openDrawer('Rol · papel en el proceso', core, `
   <div class="dgroup">
     <div class="drow"><dt>Carril en</dt><dd><div class="chips" style="justify-content:flex-end">${carriles.map(l=>`<span class="chip lk" data-proc="${l.proc}">${l.nm}</span>`).join('')||'—'}</div></dd></div>
     <div class="drow"><dt>Posee (dueño)</dt><dd><div class="chips" style="justify-content:flex-end">${own.map(p=>`<span class="chip lk" data-proc="${p.id}">${p.nm}</span>`).join('')||'—'}</div></dd></div>
     <div class="drow"><dt>Lo agregan</dt><dd><div class="chips" style="justify-content:flex-end">${pus.map(p=>`<span class="chip lk" data-pu="${p.nm}">${tbadge('puesto','puesto')}${p.nm}</span>`).join('')||'—'}</div></dd></div></div>
   ${racis.length?`<div class="dgroup"><div class="gt">RACI — dónde es R / A</div>
     ${racis.slice(0,6).map(x=>`<div class="drow"><dt style="font-size:10.5px">${x.a.raci.R===core?'R':'A'} · ${String(x.a.ord).padStart(2,'0')} ${x.a.verbo}</dt><dd><span class="plnk" data-proc="${x.l.proc}" style="font-size:11px">${x.l.nm}</span></dd></div>`).join('')}</div>`:''}
   ${ks.length?`<div class="dgroup"><div class="gt">KPIs de los que es dueño — por rol, jamás por persona</div>${ks.map(krowHTML).join('')}</div>`:''}
   ${hs.length?`<div class="dgroup"><div class="gt">Arneses compilados de este rol — uno por proceso</div>
     ${hs.map(h=>`<div class="drow"><dt style="font-size:10.5px">${byId(DATA.procesos,h.deriva_de.proceso).nm}</dt><dd>${harnBadge(h)}</dd></div>`).join('')}</div>`:''}
   ${prov('derivado del wiring rol×proceso del AS-IS','alta')}
   <div style="font-size:11px;color:var(--tx-faint);line-height:1.5">"Los procesos de un rol" = <b>posee</b> (dueño) ∪ <b>ejecuta</b> (carril / RACI R). Consulta (C/I) = contexto de lectura — <b>no genera skills</b>. El rol es el carril; la contratación vive en el <b>puesto</b>.</div>`);
}
function openPersona(nm){
  const lid=DATA.areas.find(a=>a.lider.startsWith(nm)); const extra=DATA.personasExtra.find(p=>p.nm===nm);
  const pue=lid?lid.lider.split(' · ')[1]:(extra?extra.puesto:null);
  const area=lid||(extra?byId(DATA.areas,extra.area):null);
  const ideas=DATA.ideas.filter(i=>i.prop.startsWith(nm));
  openDrawer('Persona · ocupante', nm, `
    <div class="dgroup">
      <div class="drow"><dt>Ocupa el puesto</dt><dd>${pue?`<span class="plnk" data-pu="${pue}">${pue}</span>`:'—'}</dd></div>
      <div class="drow"><dt>Área</dt><dd>${area?`<span class="plnk" data-area="${area.id}">${area.nm}</span>`:'—'}</dd></div>
      <div class="drow"><dt>Vínculo</dt><dd>${extra&&extra.vinculo?extra.vinculo:'empleado'}</dd></div>
      <div class="drow"><dt>Roster del puesto</dt><dd>${pue?rosterBadge(pue):'—'}</dd></div></div>
    <div class="dgroup"><div class="gt">Ideas propuestas — autoría reconocida, en el embudo de ideas</div>
      ${ideas.length?ideas.map(i=>`<button class="loop-it" data-idea="${i.id}"><span class="pdca">${i.estado}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.nm}</span></button>`).join(''):'<span style="font-size:12px;color:var(--tx-faint)">— todavía ninguna</span>'}</div>
    ${prov('nómina RRHH — ingest completo','alta')}
    <div class="dgroup"><div class="gt">Lo que se mide — y lo que jamás</div>
      <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">El twin mide <b>puestos / roles / procesos / áreas</b> — la persona <b>ocupa</b> el puesto, <b>supervisa</b> a sus agentes y es <b>autora</b> de ideas, jamás eslabón de medición. Vista de desempeño individual: solo opt-in Gobernanza + consentimiento.</div></div>`);
}
/* ===== ARNÉS — el REGISTRO del twin (D-20): deriva_de + hash + autonomía + supervisión medida ===== */
function openArnes(h){ if(!h)return;
  const d=h.deriva_de, proc=byId(DATA.procesos,d.proceso), est=arnesEstado(h);
  const sup=h.supervision||{}, sinAnular=sup.semanas_sin_anular>=8;
  const allPrompt=h.guardrails&&h.guardrails.length&&h.guardrails.every(g=>g.mecanismo==='prompt');
  openDrawer('Arnés · registro del twin', `${d.rol} × ${proc.nm} · ${h.v}`, `
   <div class="dgroup"><div class="gt">deriva_de — el ancla que ningún registro del mercado tiene</div>
     <div class="drow"><dt>Puesto</dt><dd><span class="plnk" data-pu="${d.puesto}">${d.puesto}</span></dd></div>
     <div class="drow"><dt>Rol</dt><dd><span class="plnk" data-rol="${d.rol}">${d.rol}</span></dd></div>
     <div class="drow"><dt>Proceso</dt><dd><span class="plnk" data-proc="${d.proceso}">${proc.nm}</span></dd></div>
     <div class="drow"><dt>Versión · canal</dt><dd class="mono" style="font-size:11px">${h.v} · ${h.canal}</dd></div>
     <div class="drow"><dt>Compilado</dt><dd style="font-size:11px">${h.compilado}</dd></div></div>
   <div class="dgroup"><div class="gt">Estado — DERIVADO de la versión del twin, jamás guardado</div>
     <div class="drow"><dt>hash_fuente</dt><dd class="mono" style="font-size:10.5px">${h.hash_fuente}</dd></div>
     <div class="drow"><dt>twin actual</dt><dd class="mono" style="font-size:10.5px">${TWIN_HASH}</dd></div>
     <div class="drow"><dt>⇒ estado</dt><dd>${est==='vigente'?'<span class="chip" style="border-color:var(--ok);color:var(--ok)">vigente</span>':`<span class="chip" style="border-color:var(--warn);color:var(--warn)">⚠ ${est}</span>`}</dd></div>
     ${h.drift?`<div style="font-size:11.5px;color:var(--warn);line-height:1.45">⚠ ${h.drift}</div>`:''}</div>
   <div class="dgroup"><div class="gt">Autonomía — derivada del riesgo, no elegida (CSA L0-L5 · CK-30 §9)</div>
     <div class="drow"><dt>Nivel</dt><dd><span class="chip" style="border-color:var(--teal-700);color:var(--brand-hi)">${h.autonomia}</span></dd></div>
     <div style="font-size:11px;color:var(--tx-mut);line-height:1.45">${h.autonomia_razon}</div>
     <div style="font-size:10px;color:var(--tx-faint)">se sube por evidencia de evaluación, no por optimismo · &gt; L2 requiere ratificación (gestión de cambios)</div></div>
   <div class="dgroup"><div class="gt">Supervisión — se especifica y se MIDE</div>
     <div class="drow"><dt>Supervisor</dt><dd><span class="plnk" data-pu="${h.supervisor}">${h.supervisor}</span></dd></div>
     <div class="drow"><dt>Qué verifica</dt><dd style="font-size:11px;text-align:right">${h.verificacion_humana.que.join('<br>')}</dd></div>
     <div class="drow"><dt>Evidencia</dt><dd style="font-size:11px">${h.verificacion_humana.evidencia}</dd></div>
     <div class="drow"><dt>Tiempo</dt><dd class="mono" style="font-size:10.5px">${h.verificacion_humana.tiempo}</dd></div>
     <div class="drow"><dt>Medición</dt><dd class="mono" style="font-size:10.5px">${sup.corridas_sem} corridas/sem · ${sup.anulaciones_sem} anulaciones/sem · última ${sup.ultima}</dd></div>
     ${sinAnular?`<div style="font-size:11.5px;color:var(--warn);line-height:1.45">⚠ ${sup.semanas_sin_anular} semanas sin una sola anulación — supervisión no ejercida = <b>candidata a brecha</b> (la supervisión declarada que nadie ejerce es la "moral crumple zone" de Elish/Green).</div>`:''}</div>
   <div class="dgroup"><div class="gt">Guardrails — sin mecanismo declarado NO es guardrail</div>
     ${(h.guardrails||[]).map(g=>`<div class="grchip ${g.mecanismo==='prompt'?'prompt':''}" title="${g.mecanismo==='prompt'?'declarativo — el prompt orienta al modelo, pero NO lo hace cumplir el runtime':'lo hace cumplir el runtime (Claude Code), no el modelo'}">${g.g}<span class="mec">${g.mecanismo}</span></div>`).join('')}
     ${allPrompt?`<div style="font-size:11px;color:var(--warn)">⚠ todos los guardrails son \`prompt\` — con autonomía ≥ L3 el gate RECHAZA este arnés</div>`:`<div style="font-size:10px;color:var(--tx-faint)">punteado = \`prompt\` (declarativo, débil) · sólido = hook / permiso / sandbox (lo hace cumplir el runtime)</div>`}</div>
   <div class="dgroup"><div class="gt">Skills + hilo de oro</div>
     <div class="chips">${h.skills.map(s=>`<span class="chip">${s}</span>`).join('')}</div>
     ${h.mueve&&h.mueve.length?`<div style="margin-top:4px">${h.mueve.map(k=>krowHTML(byId(DATA.kpis,k))).join('')}</div><div style="font-size:10px;color:var(--tx-faint)">↑ el hilo llega hasta el arnés: este rol×proceso apunta a estos KPIs</div>`:''}</div>
   <div class="dgroup"><div class="gt">Runtime + uso</div>
     <div class="drow"><dt>Runtime</dt><dd style="font-size:11.5px">Colab Studio (N17) · Claude Code local · BYO licencia</dd></div>
     <div class="drow"><dt>Uso (telemetría N3)</dt><dd class="mono" style="font-size:10px">${h.uso}</dd></div></div>
   <div class="dgroup"><div class="gt">Acciones (kinética · D-20)</div>
     ${est==='desactualizado'?`<button class="btn" data-acc="recompilar-arnes" style="justify-content:center">Recompilar del twin › <span class="mono" style="font-size:9px;color:var(--tx-faint)">Arnesia N15 · táctico · revisión-dueño</span></button>`:''}
     <button class="btn" data-acc="suspender-arnes" style="justify-content:center">Suspender (kill-switch)&nbsp;› <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · directa</span></button>
     <button class="btn" data-acc="ratificar-autonomia-arnes" style="justify-content:center">Ratificar autonomía&nbsp;› <span class="mono" style="font-size:9px;color:var(--tx-faint)">gobernanza · gestión-de-cambios</span></button></div>
   <div style="font-size:11.5px;color:var(--tx-faint);line-height:1.5">El twin guarda el <b style="color:var(--tx-mut)">REGISTRO</b> (procedencia · versión · drift · autonomía · supervisión); el <b style="color:var(--tx-mut)">CONTENIDO</b> (skills · hooks · permisos · sandbox) lo compila Arnesia (N15) contra <span class="mono" style="font-size:10px">arnes.l0.json</span>. Se recompila, jamás se edita a mano.</div>`);
}
/* ===== ÁREA — la 12ª navegable (cierra A3): unidad organizacional con su hilo completo ===== */
function openArea(a){ if(!a)return;
  const subs=kids(a.id), procs=subtreeProcs(a.id), setA=new Set(descendants(a.id));
  const pus=PUESTOS.filter(p=>p.area===a.id);
  const gaps=DATA.brechas.filter(g=>{const pr=byId(DATA.procesos,g.against);return pr&&pr.areas.some(x=>setA.has(x));});
  const ks=procs.flatMap(p=>kpisByProc(p.id));
  const parent=a.parent&&byId(DATA.areas,a.parent);
  const [liderNm,liderPu]=a.lider.split(' · ');
  openDrawer('Área · unidad organizacional', a.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Líder</dt><dd><span class="plnk" data-per="${liderNm}">${liderNm}</span> · <span class="plnk" data-pu="${liderPu}">${liderPu}</span></dd></div>
     ${parent?`<div class="drow"><dt>Reporta a</dt><dd><span class="plnk" data-area="${parent.id}">${parent.nm}</span></dd></div>`:'<div class="drow"><dt>Reporta a</dt><dd>— (cabeza)</dd></div>'}
     ${subs.length?`<div class="drow"><dt>Sub-áreas</dt><dd><div class="chips" style="justify-content:flex-end">${subs.map(s=>`<span class="chip lk" data-area="${s.id}">${s.nm}</span>`).join('')}</div></dd></div>`:''}
     ${a.vacante?`<div style="text-align:right"><span class="chip" style="border-color:var(--warn);color:var(--warn)">⚠ ${a.vacante}</span></div>`:''}
     <div class="drow"><dt>Fuente · conf</dt><dd class="mono" style="font-size:10px">levantamiento M1 · ${a.conf}</dd></div></div>
   <div class="dgroup"><div class="gt">Puestos del área — quién la compone</div>
     ${pus.length?pus.map(p=>{ const occ=puestoOcupantes(p.nm).length;
       return `<div class="rolrow"><span class="plnk" data-pu="${p.nm}">${p.nm}</span> ${rosterBadge(p.nm)}<span class="who ${p.vac?'vac':''}">${p.vac?'vacante':(occ+' pers.')}</span></div>`; }).join(''):'<span style="font-size:12px;color:var(--tx-faint)">— sin puestos directos (ver sub-áreas)</span>'}</div>
   <div class="dgroup"><div class="gt">Procesos del subtree</div>
     <div class="chips">${procs.map(p=>{ const mis=DATA.cadena.includes(p.id);
       return `<span class="chip lk" data-proc="${p.id}"><span class="health-dot" style="width:7px;height:7px;background:${health[digHealth(p.digital)]}"></span>${p.nm} <span style="color:var(--tx-faint);font-size:9px">${mis?'misional':'apoyo'} · ${coreNm(p.dueno)}</span></span>`; }).join('')||'—'}</div></div>
   ${(()=>{ /* v20 · D-32 cumplida: la madurez del área NO es un campo — es el rollup de las capacidades
        que su subárbol realiza. Estaba declarado en el modelo desde v19 y no se pintaba en ningún lado. */
     const caps=capsDeArea(a.id), br=madurezArea(a.id), sal=madurezSalud(br);
     if(!caps.length) return `<div class="dgroup"><div class="gt">Capacidades que sostiene</div>
       <span style="font-size:12px;color:var(--tx-faint)">Ninguna capacidad declarada sobre sus procesos — el área no entra todavía a la lectura por madurez. <span class="plnk" onclick="openCobertura()">ver la cobertura ›</span></span></div>`;
     return `<div class="dgroup"><div class="gt">Capacidades que sostiene — su madurez es el rollup de éstas</div>
       ${caps.map(c=>`<button class="madrow lk" data-cap="${c.id}" title="${c.cat}"><span class="lbl">${c.nm}</span><span class="dots">${escDots(c.act,c.des)}</span><span class="lv" style="color:${health[capSalud(c)]||'var(--tx-faint)'}">${brechaTxt(capBrecha(c))}</span></button>`).join('')}
       <div style="font-size:11px;color:var(--tx-faint);margin-top:6px">Peor de sus capacidades: <b style="color:${health[sal]||'var(--tx-faint)'}">${brechaTxt(br)}</b>. Se DERIVA de acá — guardar un semáforo propio en el área lo desconectaría de su marco y lo volvería opinión. <span class="plnk" onclick="verMapaPorMadurez()">verlo en el mapa ›</span></div></div>`; })()}
   ${ks.length?`<div class="dgroup"><div class="gt">Indicadores — por banda</div>${ks.slice(0,6).map(krowHTML).join('')}${ks.length>6?`<div style="font-size:10px;color:var(--tx-faint)">+${ks.length-6} más en la vista del área</div>`:''}</div>`:''}
   ${gaps.length?`<div class="dgroup"><div class="gt">Brechas abiertas</div>
     ${gaps.map(g=>`<button class="loop-it" data-g2="${g.id}"><span style="color:${g.sev==='alta'?'var(--crit)':'var(--warn)'}">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.nm}</span></button>`).join('')}</div>`:''}
   <button class="btn" style="justify-content:center;border-color:var(--teal-700)" onclick="abrirSala('${a.id}')">Entrar a la sala del área (nivel 3) › <span class="mono" style="font-size:9px;color:var(--tx-faint)">bajada · plan · estructura · procesos · archivo</span></button>
   <button class="btn" style="justify-content:center" onclick="drillArea('${a.id}')">Enfocar en el mapa de valor ›</button>
   <button class="btn" style="justify-content:center" onclick="setPiel('org');state.escala='z0';render()">Ver en el organigrama ›</button>`);
}
function openSistema(s){ if(!s)return;
  const procs=DATA.procesos.filter(p=>p.sist.includes(s.nm));
  openDrawer('Sistema · '+s.digital, s.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Digitalización</dt><dd><span class="chip"><span class="health-dot" style="width:8px;height:8px;background:${health[digHealth(s.digital)]}"></span>${s.digital}</span></dd></div>
     <div class="drow"><dt>Pulso (lakehouse N16)</dt><dd style="font-size:11.5px;line-height:1.4">${s.conector}</dd></div></div>
   <div class="dgroup"><div class="gt">Procesos que sirve</div>
     <div class="chips">${procs.map(p=>`<span class="chip lk" data-proc="${p.id}">${p.nm}</span>`).join('')||'—'}</div></div>
   ${s.caps&&s.caps.length?`<div class="dgroup"><div class="gt">Capabilities que realiza</div>
     <div class="chips">${s.caps.map(c=>{const cc=byId(DATA.capabilities,c);return `<span class="chip lk" data-cap="${c}">${iico('capability','capability · Business Capability (M13 ArchiMate, Strategy)')}${cc.nm}</span>`;}).join('')}</div></div>`:''}
   ${prov(s.fuente,s.conf)}
   <div style="font-size:11px;color:var(--tx-faint)">${s.digital==='manual'?'Manual/Excel: el pulso de este dato NO llega solo al lakehouse — candidato a conector o a captura con acuse.':'El lakehouse (N16) observa el SER; el repo (N6) declara el DEBER-SER — el twin compara ambos.'}</div>`);
}
function openIdea(i){ if(!i)return; const pm=i.a?byId(DATA.proyectos,i.a):null;
  openDrawer('Idea · embudo de ideas', i.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Proponente</dt><dd style="font-size:12px">${i.prop} <div style="font-size:9px;color:var(--tx-faint)">autoría reconocida — jamás medición (RN-16 · CK-24)</div></dd></div>
     <div class="drow"><dt>Estado</dt><dd><span class="chip teal">${i.estado}</span></dd></div>
     ${i.origen==='triage'?'<div class="drow"><dt>Origen</dt><dd><span class="chip">triage M36 · automatizable-agente</span></dd></div>':''}
     ${pm?`<div class="drow"><dt>Promovida a</dt><dd><button class="loop-it" data-pm2="${pm.id}" style="padding:2px 0"><span class="pdca">${pm.pdca}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pm.nm}</span></button></dd></div>`:''}</div>
   <div style="font-size:12px;color:var(--tx-mut);line-height:1.45">${i.nota}</div>
   ${prov(i.fuente,i.conf)}
   <div class="dgroup"><div class="gt">Acciones (kinética)</div>
     ${i.estado==='enviada'?'<button class="btn" data-acc="evaluar-idea">Evaluar › <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · revisión-dueño</span></button>':''}
     ${i.estado==='en-evaluacion'?'<button class="btn" data-acc="promover-idea-a-proyecto">Promover a proyecto › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · gestión-de-cambios</span></button>':''}
     ${i.estado==='promovida'?'<span style="font-size:11px;color:var(--tx-faint)">promovida — el charter y los beneficios viven en el proyecto (separación idea ↔ proyecto, M44)</span>':''}</div>`);
}
function openCapability(c){ if(!c)return; const gap=c.gap?byId(DATA.brechas,c.gap):null;
  const br=capBrecha(c), sal=capSalud(c), mc=sal?health[sal]:'var(--tx-faint)';
  const metas=objsDeCap(c);   // DERIVADO: qué metas se apoyan en esta capacidad (jamás tecleado)
  openDrawer('Capacidad · qué sabe hacer la empresa', c.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Familia</dt><dd><span class="chip">${c.cat}</span></dd></div>
     <div class="drow"><dt>Dónde está y a dónde va</dt><dd><span class="dots" style="font-family:var(--font-mono);letter-spacing:2px;color:var(--brand-hi)">${escDots(c.act,c.des)}</span>
       <span class="chip" style="border-color:${mc};color:${mc};margin-left:6px">${br==null?'sin meta fijada':brechaTxt(br)}</span>
       <div style="font-size:10.5px;color:var(--tx-faint);margin-top:4px">${br==null
         ? '<b style="color:var(--warn)">nadie fijó a dónde debería llegar</b> — hay nivel, no hay brecha: sin deseado, el color prometería una distancia que nadie decidió'
         : br<=0 ? `está en el nivel deseado (${c.des} de 5)` : `hoy ${c.act} de 5 · deseado ${c.des} de 5`}</div></dd></div>
     <div class="drow"><dt>La vara</dt><dd><span style="font-size:11px;color:var(--tx-faint)">escalera de capacidad (COBIT 0-5) — un 3 acá NO es un 3 de la escalera del sistema de gestión que el directorio se autoevalúa. Las dos conviven y jamás se promedian.</span></dd></div>
     <div class="drow"><dt>En qué se apoya</dt><dd>${c.evid&&c.evid.length
        ? c.evid.map(e=>`<span class="chip lk" data-${e.startsWith('g-')?'g2':e.startsWith('k-')?'k':'pm2'}="${e}">${e}</span>`).join(' ')
        : '<span style="color:var(--warn)">sin evidencia anclada</span><br><span style="font-size:10.5px;color:var(--tx-faint)">el nivel es una opinión asistida — por eso la confianza es baja y se dice</span>'}</dd></div></div>
   <div class="dgroup"><div class="gt">Metas que se apoyan en ella — el eslabón que faltaba</div>
     ${metas.length?`<div class="chips">${metas.map(o=>`<span class="chip teal lk" data-obj="${o.id}">${o.nm}</span>`).join('')}</div>
       <div style="font-size:11px;color:var(--tx-faint);margin-top:5px">Se DERIVA por dos caminos —el proceso que la realiza declara la meta que mueve, o una brecha sobre ese proceso bloquea el contrato de una meta—, jamás se teclea. Si la meta no llega, acá se ve si el problema es el proceso o el músculo${br!=null&&br>0?` — y a esta capacidad le ${br>1?'faltan':'falta'} ${br} peldaño${br>1?'s':''}`:''}.</div>`
     :`<span style="color:var(--warn);font-size:13px">Ninguna meta se apoya hoy en esta capacidad.</span>
       <div style="font-size:11px;color:var(--tx-faint);margin-top:5px">O sobra, o falta la meta que debería exigirla — la segunda es lo habitual, y es exactamente la pregunta que el directorio no está haciendo.</div>`}</div>
   <div class="dgroup"><div class="gt">Se realiza en (procesos · sistemas)</div>
     <div class="chips">${c.via.map(v=>{ if(!v.startsWith('p-')) return `<span class="chip lk" data-sis="${v}">${byId(DATA.sistemas,v).nm}</span>`;
       const pr=byId(DATA.procesos,v); return `<span class="chip lk" data-proc="${v}">${pr.nm}<span style="color:var(--tx-faint);font-size:9px"> · ${(TIPO_PROC[pr.tipo]||[''])[0].toLowerCase()}</span></span>`; }).join('')}</div></div>
   ${gap?`<div class="dgroup"><div class="gt">Brecha sobre esta capacidad</div><button class="loop-it" data-g2="${gap.id}"><span style="color:var(--warn)">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${gap.nm}</span></button></div>`:''}
   ${prov(c.fuente,c.conf)}
   <button class="btn" style="justify-content:center" onclick="verMapaPorMadurez()">Ver el mapa entero por madurez ›</button>`);
}
/* v20 · el hueco declarado del mapa de capacidades. Un proceso que ninguna capacidad realiza no es un
   dato faltante silencioso: es cobertura pendiente del levantamiento, y se muestra con nombre propio. */
function openCobertura(){ const sin=procsSinCap(), tot=DATA.procesos.length;
  openDrawer('Cobertura · mapa de capacidades', `${tot-sin.length} de ${tot} procesos cubiertos`, `
   <div style="font-size:12.5px;color:var(--tx-mut);line-height:1.5">El mapa de capacidades responde QUÉ sabe hacer la empresa; el de procesos, CÓMO lo hace. Mientras uno no cubra al otro, la lectura por madurez tiene puntos ciegos — y se dicen, no se tapan.</div>
   <div class="dgroup"><div class="gt">Procesos sin capacidad declarada · ${sin.length}</div>
     ${sin.map(p=>`<button class="cambio-row" data-proc="${p.id}"><span class="sc" style="color:var(--warn)">·</span>
       <div><div class="tt">${p.nm}</div><div class="ap">${(TIPO_PROC[p.tipo]||[''])[0]} · ${coreNm(p.dueno)}</div></div></button>`).join('')}</div>
   <div class="dgroup"><div class="gt">Qué significa</div>
     <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">Ninguno de estos procesos entra hoy a la lectura por madurez: no hay capacidad que graduar. Cerrar la cobertura es trabajo del levantamiento (M1), no una decisión de tablero.</div></div>`);
}
/* prende la lente de madurez sobre el mapa de valor — el mismo botón que el directorio ya ofrecía,
   ahora con un mapa detrás que sabe pintarla (antes caía en silencio a digitalización) */
function verMapaPorMadurez(){ state.mod='territorio'; state.nivel=2; state.escala='z0'; state.insp='home'; setPiel('valor');
  if(!state.capas.has('salud')){ const cs=document.querySelector('[data-capa=salud]'); if(cs) cs.click(); }
  const st=document.querySelector('.sub-t[data-sub=madurez]'); if(st) st.click(); else render(); }
/* ===== v21 · DOCUMENTO — la pieza del archivo (D-38 · M38): rige, produce evidencia o sustenta ===== */
function openDocumento(d){ if(!d)return;
  const p=d.proc&&byId(DATA.procesos,d.proc), ar=d.area&&byId(DATA.areas,d.area), g=d.g&&byId(DATA.brechas,d.g);
  const vc=docVence(d), ti=TIPO_DOC[d.tipo]||['Documento',''];
  const REL={rige:'RIGE al proceso — dice quién hace qué y en qué orden', produce:'lo PRODUCE el proceso — es su evidencia', sustenta:'lo SUSTENTA — la obligación con un tercero sobre la que corre'};
  openDrawer('Documento · '+ti[0].toLowerCase(), d.nm, `
   <div class="dgroup">
     <div class="drow"><dt>Tipo</dt><dd><span class="chip" title="${ti[1]}">${ti[0]}</span></dd></div>
     <div class="drow"><dt>Estado</dt><dd><span class="chip" style="border-color:${DOC_EST[d.estado]||'var(--border)'};color:${DOC_EST[d.estado]||'var(--tx)'}">${d.estado==='en-tramite'?'en trámite':d.estado}</span>${d.v?` <span class="mono" style="font-size:10px;color:var(--tx-faint)">${d.v}</span>`:''}</dd></div>
     ${p?`<div class="drow"><dt>Ancla</dt><dd><span class="plnk" data-proc="${p.id}">${p.nm}</span><div style="font-size:10px;color:var(--tx-faint)">${REL[d.rel]||''}</div></dd></div>`:''}
     ${ar?`<div class="drow"><dt>Ancla</dt><dd><span class="plnk" data-area="${ar.id}">${ar.nm}</span><div style="font-size:10px;color:var(--tx-faint)">${REL[d.rel]||''}</div></dd></div>`:''}
     ${d.contraparte?`<div class="drow"><dt>Contraparte</dt><dd>${d.contraparte}</dd></div>`:''}
     ${d.vence?`<div class="drow"><dt>Vencimiento</dt><dd><span class="mono" style="color:${vc.c}">${vc.t}</span><div style="font-size:10px;color:var(--tx-faint)">se DERIVA contra el periodo vigente del twin (${DATA.periodo.nm}) — jamás se guarda un semáforo</div></dd></div>`:''}</div>
   ${d.nota?`<div style="font-size:12.5px;color:${vc&&vc.est!=='al-dia'?'var(--warn)':'var(--tx-mut)'};line-height:1.5">${d.nota}</div>`:''}
   ${g?`<div class="dgroup"><div class="gt">Brecha anclada a este papel</div><button class="loop-it" data-g2="${g.id}"><span style="color:${g.sev==='alta'?'var(--crit)':'var(--warn)'}">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.nm}</span></button></div>`:''}
   ${prov(d.fuente,d.conf)}
   <div class="dgroup"><div class="gt">Acciones (kinética)</div>
     <button class="btn" data-acc="aprobar-version-documento">Aprobar nueva versión › <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · revisión-dueño</span></button>
     ${d.tipo==='contrato'?'<button class="btn" data-acc="renovar-contrato-documento">Renovar el contrato › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · gestión-de-cambios</span></button>':''}</div>
   <div style="font-size:11px;color:var(--tx-faint);line-height:1.5">El twin guarda el <b style="color:var(--tx-mut)">REGISTRO</b> del documento (tipo · ancla · versión · vigencia · contraparte); el archivo en sí vive en el Depósito. Las proyecciones que el twin GENERA (el manual, la instrucción de trabajo) no son documentos del archivo — se regeneran, jamás se archivan.</div>`);
}
function openEmpresa(){ const e=DATA.empresa;
  openDrawer('Empresa · el twin completo', e.razon, `
   <div class="dgroup"><div class="gt">Misión</div><div style="font-size:12.5px;line-height:1.5">${e.mision}</div></div>
   <div class="dgroup"><div class="gt">El cerebro — tres cuerpos</div>
     <div class="drow"><dt>Estructura</dt><dd class="mono" style="font-size:10.5px">${DATA.areas.length} áreas · ${DATA.procesos.length} procesos · ${DATA.areas.length+DATA.personasExtra.length} personas · ${DATA.puestosTotal} puestos · ${DATA.kpis.length} KPIs</dd></div>
     <div class="drow"><dt>Conocimiento</dt><dd class="mono" style="font-size:10.5px">9 guías · 30 casos · 2 procesos sin capturar (g-doc)</dd></div>
     <div class="drow"><dt>Pulso</dt><dd class="mono" style="font-size:10.5px">lakehouse N16 · 3 conectores · sync 06:00</dd></div>
     <div class="drow"><dt>Compila</dt><dd class="mono" style="font-size:10.5px;color:var(--brand-hi)">${DATA.arneses.length} arneses (rol×proceso) · ${new Set(DATA.arneses.map(h=>h.deriva_de.puesto)).size}/${DATA.puestosTotal} puestos</dd></div></div>
   <div class="dgroup"><div class="gt">Modo de estrategia</div><div style="font-size:12px">OKR trimestral · configurable por región: GPD-anual (Falconi) · mixto</div></div>
   ${prov(e.fuente,e.conf)}
   <div style="font-size:11.5px;color:var(--tx-faint);line-height:1.5">De este cerebro Arnesia (N15) compila los arneses por rol×proceso y los ensambla por puesto; Colab Studio (N17) los corre por persona. <b style="color:var(--tx-mut)">La persona supervisa; el agente ejecuta</b>. Cockpit es la cabina.</div>`);
}

