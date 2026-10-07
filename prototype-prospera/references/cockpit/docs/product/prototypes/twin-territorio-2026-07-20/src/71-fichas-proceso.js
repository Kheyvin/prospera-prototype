/* v20 · el tipo del proceso en el idioma del mapa (D-a). No es decoración: dice en qué banda vive y
   qué pregunta contesta — y el de dirección trae además QUÉ PRODUCE y dónde se ejerce. */
const TIPO_PROC={ direccion:['Dirección','planear · revisar · decidir — produce lo que la sala del directorio revisa'],
  negocio:['Del negocio','produce y entrega lo que el cliente compra — vive en la cadena, en su orden'],
  apoyo:['De apoyo','sostiene a los otros dos sin tocar al cliente'] };
function openProceso(p){ const objs=p.sirve.map(id=>byId(DATA.objetivos,id));
  const caps=DATA.capabilities.filter(c=>c.via.includes(p.id));
  const dir=p.tipo==='direccion', ti=TIPO_PROC[p.tipo]||TIPO_PROC.apoyo;
  openDrawer('Proceso · '+byId(DATA.areas,p.areas[0]).nm, p.nm,
    `${dir?`<div style="font-size:12.5px;color:var(--tx-mut);line-height:1.5">${p.detalle}</div>`:''}
     <div class="dgroup">
      <div class="drow"><dt>Tipo de proceso</dt><dd><span class="chip" title="${ti[1]}">${ti[0]}</span></dd></div>
      ${dir?`<div class="drow"><dt>Produce</dt><dd style="color:var(--brand-hi)">${p.produce}</dd></div>`:''}
      <div class="drow"><dt>Dueño (rol)</dt><dd><span class="plnk" data-rol="${p.dueno}">${p.dueno}</span> ${harnBadge(arnesDe(p.dueno,p.id))}</dd></div>
      <div class="drow"><dt>Áreas que cruza</dt><dd><div class="chips" style="justify-content:flex-end">${p.areas.map(a=>`<span class="chip lk" data-area="${a}">${byId(DATA.areas,a).nm}</span>`).join('')}</div></dd></div>
      <div class="drow"><dt>Digitalización</dt><dd><span class="chip"><span class="health-dot" style="width:8px;height:8px;background:${health[digHealth(p.digital)]}"></span>${p.digital}</span></dd></div>
      <div class="drow"><dt>Sistemas</dt><dd>${p.sist.map(s=>sisByName(s)?`<span class="plnk" data-sis="${s}">${s}</span>`:s).join(' · ')}</dd></div>
      ${caps.length?`<div class="drow"><dt>Realiza</dt><dd><div class="chips" style="justify-content:flex-end">${caps.map(c=>`<span class="chip lk" data-cap="${c.id}">${iico('capability','capacidad · lo que la empresa sabe hacer (M13 ArchiMate, Strategy)')}${c.nm} <b class="mono" style="font-size:9px">${c.act}/${c.des==null?'—':c.des}</b></span>`).join('')}</div></dd></div>`
        :`<div class="drow"><dt>Realiza</dt><dd><span style="color:var(--warn);font-size:12px">ninguna capacidad declarada</span><br><span style="font-size:10.5px;color:var(--tx-faint)">el mapa de capacidades todavía no lo cubre — se dice, no se calla</span></dd></div>`}</div>
     ${dir?`<button class="btn" style="justify-content:center;margin-bottom:10px" onclick="irTablero(byId(DATA.procesos,'${p.id}'))">${p.tablero.t} ›</button>`:''}
     ${sipocHTML(p)}
     <div class="dgroup"><div class="gt">KPIs del proceso — semáforo por banda</div>
      ${kpisByProc(p.id).length?kpisByProc(p.id).map(krowHTML).join(''):'<span style="font-size:12px;color:var(--tx-faint)">Sin KPI declarado — candidato del levantamiento.</span>'}</div>
     <div class="dgroup"><div class="gt">${dir?'Metas que PRODUCE — no que mueve':'Objetivos que sostiene (hilo de oro)'}</div>
      ${dir?`<div class="chips">${objRaiz().map(o=>`<span class="chip teal lk" data-obj="${o.id}">${o.nm}</span>`).join('')}</div>
        <div style="font-size:11px;color:var(--tx-faint);margin-top:5px">Un proceso de dirección queda FUERA del hilo de oro a propósito: no mueve un indicador — produce la meta que otros mueven. Meterlo en el hilo confundiría gobierno con ejecución.</div>`
      :objs.length?`<div class="chips">${objs.map(o=>`<span class="chip teal lk" data-obj="${o.id}">${o.nm}</span>`).join('')}</div>`
      :`<span style="color:var(--warn);font-size:13px">Huérfano — no sube a ningún objetivo del directorio.${p.star?' <b>'+p.star+'</b>':''}</span>`}</div>
     <div class="dgroup"><div class="gt">El archivo — qué lo rige, qué produce, qué lo sustenta</div>
      ${docsDeProc(p.id).length?docsDeProc(p.id).map(d=>{ const vc=docVence(d);
        return `<button class="loop-it" data-doc="${d.id}">${iico('documento',TIPO_DOC[d.tipo][1])}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${TIPO_DOC[d.tipo][0]} · ${d.nm}</span><span class="mono" style="font-size:9.5px;color:${vc?vc.c:(DOC_EST[d.estado]||'var(--tx-faint)')}">${vc?vc.t:(d.estado==='en-tramite'?'en trámite':d.estado)}</span></button>`; }).join('')
       :(p.tipo==='direccion'?'<span style="font-size:12px;color:var(--tx-faint)">lo que produce vive en el nivel 1 (acuerdos · acta · presupuesto)</span>'
         :'<span style="font-size:12px;color:var(--warn)">ningún documento lo rige ni lo registra — se opera de memoria (candidato del levantamiento)</span>')}</div>
     ${conocimientoHTML(p.id)}
     ${prov(p.conf==='alta'?'Sistema leído':'Entrevista',p.conf)}
     <div class="dgroup"><div class="gt">Acciones (kinética)</div>
      <button class="btn" data-acc="publicar-mapa-proceso">Publicar versión del mapa › <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · gestión-de-cambios · desarrollo→pruebas→producción</span></button></div>
     <button class="btn" style="justify-content:center" onclick="drillLienzo('${p.id}')">Abrir lienzo del proceso (flujograma) ›</button>`);
}
function openBrecha(g){ const o=objDeKr(g.kr); const proc=byId(DATA.procesos,g.against);
  const sc={alta:S.crit,media:S.warn,baja:'var(--tx-mut)'}[g.sev];
  const est={'accionable':'accionable','sin-ancla-de-valor':'sin ancla de valor','a-corroborar':'a corroborar','off-thread':'off-thread'}[g.estado]||g.estado;
  openDrawer('Brecha · O6 assessment', g.nm,
    `<div style="font-size:13px;color:var(--tx-mut);line-height:1.45">${g.sub}</div>
     <div class="dgroup">
      <div class="drow"><dt>Tipo</dt><dd>${g.tipo}</dd></div>
      <div class="drow"><dt>Ataca a</dt><dd>${proc?`<span class="plnk" data-proc="${proc.id}">${proc.nm}</span>`:'—'}</dd></div>
      <div class="drow"><dt>Objetivo que bloquea</dt><dd>${o?`<span class="chip teal lk" data-obj="${o.id}">${o.nm}</span>`:'<span class="chip" style="border-color:var(--warn);color:var(--warn)">sin objetivo</span>'}</dd></div>
      <div class="drow"><dt>Costo de no hacer</dt><dd style="color:${sc};font-family:var(--font-mono)">${g.costo}</dd></div>
      <div class="drow"><dt>Severidad · prio</dt><dd><span class="chip" style="border-color:${sc};color:${sc}">${g.sev} · ${g.prio}</span></dd></div>
      <div class="drow"><dt>Estado</dt><dd><span class="chip">${est}</span></dd></div></div>
     ${prov(g.fuente,g.conf)}
     <div class="dgroup"><div class="gt">Cierra el ciclo (capa Cinética)</div>
      ${DATA.proyectos.filter(pm=>pm.brecha===g.id).map(pm=>`<button class="loop-it" data-pm2="${pm.id}"><span class="pdca">${pm.pdca}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pm.nm}</span><span class="mono" style="font-size:10px;color:var(--brand-hi)">${pm.roi}</span></button>`).join('')
        || '<span style="font-size:12px;color:var(--tx-faint)">Sin proyecto de mejora aún — candidata a la Apuesta.</span>'}</div>
     <div class="dgroup"><div class="gt">Acciones (kinética)</div>
      ${DATA.proyectos.some(pm=>pm.brecha===g.id)?'<button class="btn" data-acc="cerrar-brecha">Cerrar brecha (con evidencia) › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · revisión-dueño</span></button>'
        :'<button class="btn" data-acc="aprobar-charter">Proponer proyecto (charter) › <span class="mono" style="font-size:9px;color:var(--tx-faint)">estratégico · gestión-de-cambios · doble firma</span></button>'}</div>`);
}
function openProyecto(pm){ const g=byId(DATA.brechas,pm.brecha), k=byId(DATA.kpis,pm.mueve);
  openDrawer('Proyecto de mejora · O7 (ilustrativo)', pm.nm,
    `<div class="dgroup">
      <div class="drow"><dt>Estado (PDCA)</dt><dd><span class="chip teal">${pm.estado} · ${pm.pdca}</span></dd></div>
      <div class="drow"><dt>Nace de la brecha</dt><dd>${g?`<span class="plnk" data-g2="${g.id}">${g.nm.slice(0,46)}…</span>`:'—'}</dd></div>
      ${pm.idea?`<div class="drow"><dt>… y de la idea</dt><dd><span class="plnk" data-idea="${pm.idea}" style="font-size:12px">${byId(DATA.ideas,pm.idea).nm.slice(0,42)}…</span></dd></div>`:''}
      <div class="drow"><dt>KPI que mueve</dt><dd>${k?krowHTML(k):'—'}</dd></div>
      <div class="drow"><dt>Compromiso</dt><dd class="mono" style="color:var(--brand-hi)">${pm.delta}</dd></div>
      <div class="drow"><dt>ROI del caso</dt><dd class="mono">${pm.roi}</dd></div></div>
     ${pm.resultado?`<div class="dgroup"><div class="gt">Resultado — KPI movido (el ciclo cerró)</div>
      <div class="drow"><dt>Delta observado</dt><dd class="mono" style="color:var(--ok)">${pm.resultado.delta_observado}</dd></div>
      <div class="drow"><dt>Veredicto</dt><dd><span class="chip" style="border-color:var(--ok);color:var(--ok)">✓ ${pm.resultado.veredicto}</span></dd></div>
      ${pm.recompila?`<div class="drow"><dt>Arnés recompilado</dt><dd>${harnBadge(byId(DATA.arneses,pm.recompila))}</dd></div>
      <div style="font-size:10px;color:var(--brand-hi)">↑ el cambio llegó hasta el puesto: la mejora se estandarizó COMPILÁNDOLA al arnés</div>`:''}
      <div style="font-size:11.5px;color:var(--tx-faint)">${pm.resultado.nota}</div></div>`:`
     <div class="dgroup"><div class="gt">Acciones (kinética — revisiones de fase)</div>
      <button class="btn" data-acc="avanzar-tollgate">Avanzar de fase › <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · revisión-dueño · se puede volver atrás con evidencia</span></button></div>`}
     ${prov(pm.fuente,pm.conf)}
     <div style="font-size:12px;color:var(--tx-faint)">El ciclo <b style="color:var(--tx-mut)">brecha → proyecto → KPI movido</b> vive dentro del twin, con dato real de cierre — de punta a punta en la misma herramienta.</div>`);
}
function openActividad(a){ const hAct=DATA.arneses.find(h=>h.deriva_de.proceso===(state.lienzo||DATA.flagship.proc)&&h.acts.includes(a.ord));
  const candidato=a.triage&&(a.triage.startsWith('automatizable')||a.triage==='aumentable');
  openDrawer('Actividad · '+a.verbo, a.ttl,
  `<div class="dgroup">
    <div class="drow"><dt>Orden</dt><dd class="mono">${String(a.ord).padStart(2,'0')}</dd></div>
    <div class="drow"><dt>Tipo</dt><dd>${a.tipo}</dd></div>
    <div class="drow"><dt>Toque</dt><dd class="mono" style="color:var(--ok)">${a.toque}</dd></div>
    <div class="drow"><dt>Espera</dt><dd class="mono" style="color:var(--warn)">${a.espera}</dd></div>
    <div class="drow"><dt>Sistemas</dt><dd>${a.sist.map(s=>sisByName(s)?`<span class="plnk" data-sis="${s}">${s}</span>`:s).join(' · ')}</dd></div>
    ${a.raci?`<div class="drow"><dt>RACI</dt><dd style="font-size:12px">R · <span class="plnk" data-rol="${a.raci.R}">${a.raci.R}</span><br>A · <span class="plnk" data-rol="${a.raci.A}">${a.raci.A}</span></dd></div>`:''}
    ${a.mandato?`<div class="drow"><dt>Mandato</dt><dd><span class="chip teal">${a.mandato}</span> <span style="font-size:10px;color:var(--tx-faint)">protegido del triage</span></dd></div>`:''}
    ${a.triage?`<div class="drow"><dt>Triage automatización</dt><dd><span class="chip teal">${a.triage}</span></dd></div>`:''}
    ${a.rtlx?`<div class="drow"><dt>Carga (NASA-RTLX)</dt><dd class="mono" style="color:var(--warn)">${a.rtlx} <span style="font-size:9px;color:var(--tx-faint)">agregado por rol</span></dd></div>`:''}
    ${hAct?`<div class="drow"><dt>Operada con</dt><dd>${harnBadge(hAct)}</dd></div>`:''}</div>
   ${candidato?`<div class="dgroup"><div class="gt">El triage NO es una etiqueta — alimenta la fábrica</div>
    <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">Veredicto <b>${a.triage}</b> → candidato a <b>skill del arnés del puesto</b>: la cadena es triage → embudo de ideas → Arnesia compila → Colab Studio lo corre.</div>
    ${a.ord===3?'<button class="btn" style="justify-content:center" id="actIdea">Ver su idea en el embudo › <span class="mono" style="font-size:9px;color:var(--tx-faint)">triage → embudo → Arnesia</span></button>':'<button class="btn" data-acc="enviar-idea" style="justify-content:center">Proponer al embudo › <span class="mono" style="font-size:9px;color:var(--tx-faint)">operativo · directa · autoría reconocida</span></button>'}</div>`:''}
   ${conocimientoHTML(state.lienzo||'p-cob')}
   ${prov(a.fte||'Entrevista',a.conf||'media')}
   <div style="font-size:12px;color:var(--tx-faint)">${a.note}</div>
   <button class="btn" style="justify-content:center" onclick="drillActividad('${state.lienzo||DATA.flagship.proc}',${a.ord})">Abrir la instrucción de trabajo (z3) › <span class="mono" style="font-size:9px;color:var(--tx-faint)">el cómo · tareas · puntajes de automatización</span></button>`);
  const ai=inBody.querySelector('#actIdea'); if(ai) ai.onclick=()=>openIdea(byId(DATA.ideas,'i-agente')); }

