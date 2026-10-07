/* ============================================================
   INSPECTOR (derecha) — contextual: sin selección = sala de mando
   ============================================================ */
const inEye=document.getElementById('inEye'), inTitle=document.getElementById('inTitle'),
      inBody=document.getElementById('inBody'), inClose=document.getElementById('inClose');
function openDrawer(eye,title,body){ state.insp='sel'; inEye.textContent=eye;
  const tipo=eye.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');   // tipo desde el eyebrow (decisión 23; sin acentos: Área→area, Arnés→arnes)
  const ic=TICO[tipo];
  inTitle.innerHTML=(ic?`<span class="dico" title="${eye}">${ic}</span>`:'')+title;
  const rb=RESP_TIPO[tipo]?respBadge(RESP_TIPO[tipo]):'';   // v14.5: TODA ficha de entidad cita su respaldo (una costura, cero ediciones por ficha)
  inBody.innerHTML=body+(rb?`<div class="resp-foot">Respaldo del método ${rb}</div>`:'');
  inClose.style.display=''; inBody.scrollTop=0;
  wireLinks(inBody); }
inClose.onclick=()=>{ state.insp='home'; inspectorHome(); };

function inspectorHome(){
  inClose.style.display='none';
  if(state.mod==='mejora'){
    inEye.textContent='Mejora · el ciclo'; inTitle.textContent='6 brechas → 2 en curso → 1 movido';
    inBody.innerHTML=`<div class="dgroup"><div class="gt">La prueba que le importa al directorio</div>
      <div style="font-size:12.5px;line-height:1.5">El ciclo <b>brecha → proyecto → KPI movido</b> vive dentro del twin con dato real de cierre. El veredicto se escribe contra la serie del KPI — no contra una lista de tareas.</div></div>
      <div style="font-size:12px;color:var(--tx-faint)">Toca una brecha o proyecto para su ficha. El proyecto cerrado muestra el delta observado y su veredicto.</div>`;
    return; }
  if(state.mod==='metodo'){
    inEye.textContent='Método · engagement'; inTitle.textContent='M1 ✓ · M3 en curso · M2 activo';
    inBody.innerHTML=`<div class="dgroup"><div class="gt">Plantilla vs instancia</div>
      <div style="font-size:12.5px;line-height:1.5">La <b>Definición</b> (M1·M2·M3, 61 M-cards) es IP versionada del fabricante; la <b>Instancia</b> (este engagement, sus gates y acuses) vive en el repo del cliente (N6). Los gates conectan el método con el ciclo de mejora.</div></div>
      <div style="font-size:12px;color:var(--tx-faint)">Todo lo que el twin pinta es trazable a una M-card — el método es dato, no opinión.</div>`;
    return; }
  if(state.mod==='cambios'){
    inEye.textContent='Cambios · ISO'; inTitle.textContent=`${3+SOLICITUDES.length} pendientes de aprobación`;
    inBody.innerHTML=`<div class="dgroup"><div class="gt">Niveles de aprobación</div>
      <div style="font-size:12.5px;line-height:1.6"><b>directa</b> — se aplica y queda trazada<br><b>revisión-dueño</b> — el dueño del proceso acusa<br><b>gestión-de-cambios</b> — comité (banda de KPI, mapa de proceso)</div></div>
      <div style="font-size:12px;color:var(--tx-faint)">Debajo hay control de versiones real, con entornos desarrollo → pruebas → producción. El usuario ve solicitudes y versiones; la tubería técnica, jamás.</div>`;
    return; }
  if(state.corrida){
    inEye.textContent='Corrida · impactos en vivo'; inTitle.textContent='Cobranza digital fase 2';
    inBody.innerHTML=`
      <div class="dgroup"><div class="gt">Cambios propuestos (diff)</div>
        <div class="drow"><dt>Tesorería y Cobranza</dt><dd><span class="dtag">Δ editado</span></dd></div>
        <div class="drow"><dt><span class="plnk" onclick="drillLienzo('p-cob')">Cobranza de cuotas ›</span></dt><dd style="font-size:12px">+1 actividad · portal de pagos — <span class="plnk" onclick="drillLienzo('p-cob')">se ve punteada en el lienzo</span></dd></div>
        <div class="drow"><dt>Rol nuevo</dt><dd style="font-size:12px">Analista de cobranza digital (propuesto)</dd></div></div>
      <div class="dgroup"><div class="gt">Impacto proyectado — hoy → propuesto</div>
        <div class="medlist">
          <div class="r"><span>Cobranza (días)</span><span>91 → <b style="color:var(--brand-hi)">75 días</b></span></div>
          <div class="r"><span>cobranza digital</span><span>15% → <b style="color:var(--brand-hi)">40%</b></span></div>
          <div class="r"><span>costo por única vez</span><span style="color:var(--crit)">S/ 60k</span></div>
          <div class="r"><span>personal</span><span>+1 rol</span></div></div>
        <div style="border-top:1px solid var(--border);margin-top:4px;padding-top:8px;font-family:var(--font-mono);font-size:11px" title="retorno del caso: lo que devuelve sobre lo que cuesta">neto · se recupera en 5 meses · ROI 1.8×</div></div>
      <div class="dgroup"><div class="gt">Salida de la corrida — aprobación explícita</div>
        <div style="font-size:12px;color:var(--tx-mut);line-height:1.5">Aplicar = solicitud a la cola de <b>Cambios</b> sobre la rama principal. Nada se aplica solo.</div>
        <button class="btn" style="justify-content:center" onclick="document.getElementById('corridaGate').click()">Enviar a aprobación ›</button></div>`;
    return; }
  if(state.escala==='z0'&&!(state.mod==='territorio'&&state.nivel===3)){
    /* v18 · en el nivel 1 la página YA es la sesión: el inspector deja de repetir el pulso y el
       ciclo de mejora (que ahora viven en los movimientos 2 y 3) y pasa a ser lo que la página no
       puede darte — el índice de la sesión, la próxima jugada y las dos lecturas de contexto. */
    const n1=state.mod==='territorio'&&state.nivel===1;
    inEye.textContent=n1?'Sesión · directorio':'Sala de mando · directorio';
    const ok=DATA.objetivos.filter(o=>o.salud==='verde').length;
    inTitle.textContent=n1?`Sesión de ${DATA.periodo.nm}`:`Pulso · ${ok}/${DATA.objetivos.length} en banda`;
    const g=DATA.brechas.find(b=>b.apuesta), o=objDeKr(g.kr);
    inBody.innerHTML=`
      ${n1?`<div class="dgroup"><div class="gt">La sesión, en orden — clic para saltar</div>
        ${['¿Cómo nos fue? — resultado y caja','¿A dónde vamos? — rumbo, apuestas y varas','¿Qué puede impedirlo? — riesgos e inversiones','¿Qué decidimos? — bandeja, acuerdos y acta']
          .map((t,i)=>`<button class="loop-it mov" data-mov="${i}"><span class="pdca">${i+1}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</span></button>`).join('')}
        <div style="font-size:11px;color:var(--tx-faint)">La rueda recorre la sesión; los cuatro movimientos son el orden de la agenda.</div></div>`
      :`<div class="dgroup"><div class="gt">Pulso del directorio — KRs en banda${respBadge('sala-pulso')}</div>
        <div class="pulso-dots">${objRaiz().map(x=>{ const lbl={verde:'dentro de meta',ambar:'cerca',rojo:'fuera de meta',gris:'sin dato'}[x.salud];
          return `<i data-obj="${x.id}" style="background:${health[x.salud]}" title="${x.nm} — ${x.kr.m}: ${krCur(x.kr)==null?'s/d':krCur(x.kr)}${x.kr.u} (meta ${x.kr.to}${x.kr.u}) · ${lbl} · clic = su ficha, y desde ahí su hilo"></i>`; }).join('')}</div>
        <div style="font-size:11px;color:var(--tx-faint)">verde = todos sus contratos dentro de banda · gris = sin dato, jamás rojo por ausencia · toca un punto para su ficha (y su hilo)</div>
        ${sinBajar().length?`<div style="font-size:11.5px;color:var(--warn);margin-top:5px">⚠ ${sinBajar().length} de estas metas no están abiertas en ninguna gerencia — el directorio las mira y nadie las trabaja</div>`:''}</div>`}
      <div class="apuesta-card">
        <div class="hd"><span class="live"></span><h3 class="eyebrow" style="margin:0;color:var(--tx-mut);letter-spacing:.1em">La apuesta · próximo paso${respBadge('sala-jugada')}</h3></div>
        <div class="body">Cerrar <b>Marina 87→95% de avance</b> — la brecha ALTA atada a <b>${o.nm}</b>.</div>
        <div class="biz">
          <div><span class="k">Cuesta</span><span class="v cost">${g.costo}</span></div>
          <div><span class="k">Mueve KR</span><span class="v kr">margen →18%</span></div>
          <div title="① = la brecha que más cuesta por mes de espera, frente a lo que cuesta atacarla"><span class="k">Prioridad</span><span class="v">①</span></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--warn);margin-top:5px;cursor:help" title="${DATA.nicho['N-IMM-07'].cond}">vara externa: <b>sin rango comparable de pares</b> — la meta 18% se sostiene contra el histórico propio, no contra el rubro</div>
        <button class="btn go" id="apuestaGo">Ver el hilo que mueve ›</button>
      </div>
      ${n1?'':`<div class="dgroup"><div class="gt">El ciclo de mejora — brecha → proyecto → KPI${respBadge('sala-loop')}</div>
        ${DATA.proyectos.map(pm=>`<button class="loop-it" data-pm="${pm.id}"><span class="pdca">${pm.pdca}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pm.nm}${pm.estado==='cerrado'?' <span style="color:var(--ok);font-size:9px">✓ cerrado</span>':''}</span><span class="mono" style="font-size:10px;color:var(--brand-hi)" title="retorno del caso: lo que devuelve sobre lo que cuesta">ROI ${pm.roi}</span></button>`).join('')}
        <div style="font-size:11px;color:var(--tx-faint)">${DATA.proyectos.filter(p=>p.estado!=='cerrado').length} proyectos en curso · ${DATA.proyectos.filter(p=>p.estado==='cerrado').length} cerrado con indicador movido · prende la capa Cinética para verlos sobre el mapa</div></div>`}
      <div class="dgroup"><div class="gt">El twin compila trabajo — se compila por rol×proceso · se ensambla por puesto${respBadge('sala-trabajo')}</div>
        <div style="font-size:12.5px;line-height:1.5"><b class="mono" style="color:var(--brand-hi)">${new Set(DATA.arneses.map(h=>h.deriva_de.puesto)).size}/${DATA.puestosTotal}</b> puestos con arnés en su roster · <b class="mono">${DATA.arneses.length}</b> arneses compilados · <span style="color:var(--warn)">${DATA.arneses.filter(h=>arnesEstado(h)==='desactualizado').length} desactualizado</span> (el twin cambió → recompilar). El resto opera a mano: el gap de la era agéntica, visible.</div>
        <button class="btn" id="verTrabajo" style="justify-content:center">Prender la capa Trabajo ›</button></div>
      ${state.nivel===1?`<div class="dgroup"><div class="gt">¿El sistema aguanta la ambición? — cómo nos gestionamos${respBadge('dir-madurez')}</div>
        ${DATA.autoevaluacion.dims.map(m=>
          `<button class="madrow lk" data-mad="${m.d}" title="${m.porque}"><span class="lbl">${m.d}${m.frena?' <b style="color:var(--warn)">⚠ frena</b>':''}</span><span class="dots">${escDots(m.actual,m.deseado)}</span><span class="lv">${m.actual}→${m.deseado}</span></button>`).join('')}
        <div style="font-size:11px;color:var(--tx-faint);margin-top:4px">Escalera del <b>sistema de gestión</b> (1-5) — distinta de la que gradúa una capacidad de la empresa: las dos conviven y jamás se promedian. Cada nivel se apoya en <b>${DATA.autoevaluacion.dims.reduce((n,m)=>n+m.evid.length,0)}</b> nodos reales del twin; pasá el cursor por una dimensión para leer en qué. Evaluada en la <b>${sesNm(DATA.autoevaluacion.evaluadaEn)}</b>.</div>
        <button class="btn" id="verMadurez" style="justify-content:center">Ver el mapa por madurez de capacidades ›</button></div>`:''}`;
    inBody.querySelector('#apuestaGo').onclick=()=>{ state.nivel=2; setPiel('valor');
      if(!state.capas.has('hilo')){state.capas.add('hilo');document.querySelector('[data-capa=hilo]').classList.add('on');}
      state.activeObj='o-lid'; render(); };
    inBody.querySelector('#verTrabajo').onclick=()=>{ if(!state.capas.has('trabajo')){state.capas.add('trabajo');document.querySelector('[data-capa=trabajo]').classList.add('on');} render(); };
    /* v20 · aterriza en el mapa de valor CON la banda de Capacidades y la lente encendidas. Antes
       prometía "el mapa por madurez de capacidades", caía en el mapa de valor y ahí la lente no
       existía: el director veía digitalización. La promesa y la entrega ahora son la misma. */
    const vm=inBody.querySelector('#verMadurez'); if(vm) vm.onclick=()=>verMapaPorMadurez();
    inBody.querySelectorAll('.loop-it[data-pm]').forEach(b=>b.onclick=()=>openProyecto(byId(DATA.proyectos,b.dataset.pm)));
    inBody.querySelectorAll('.loop-it.mov').forEach(b=>b.onclick=()=>irMovimiento(+b.dataset.mov));
    /* v17: los puntos del pulso llevan data-obj — wireLinks (al final de inspectorHome) los cablea a la ficha
       del objetivo, que ya trae "Encender su hilo en el mapa ›" */
    inBody.querySelectorAll('[data-resp]').forEach(b=>b.onclick=()=>openRespaldo(b.dataset.resp));
  }
  else if(state.escala==='z1'){
    const a=byId(DATA.areas,state.foco), procs=subtreeProcs(a.id), setA=new Set(descendants(a.id));
    const gaps=DATA.brechas.filter(g=>{const pr=byId(DATA.procesos,g.against);return pr&&pr.areas.some(x=>setA.has(x));});
    const ks=procs.flatMap(p=>kpisByProc(p.id));
    const cnt={verde:0,ambar:0,rojo:0,gris:0}; ks.forEach(k=>cnt[semaforo(k)]++);
    const pusZ1=[...new Set([a.lider.split(' · ')[1], ...PUESTOS.filter(p=>setA.has(p.area)).map(p=>p.nm), ...procs.map(p=>coreNm(p.dueno))])];
    inEye.textContent='Área · contexto'; inTitle.textContent=a.nm;
    inBody.innerHTML=`
      <div class="dgroup">
        <div class="drow"><dt>Líder</dt><dd>${a.lider}</dd></div>
        <div class="drow"><dt>Procesos</dt><dd class="mono">${procs.length}</dd></div>
        <div class="drow"><dt>Brechas abiertas</dt><dd class="mono" style="color:${gaps.length?'var(--warn)':'var(--ok)'}">${gaps.length}</dd></div>
      </div>
      <div class="dgroup"><div class="gt">Indicadores del área — por banda</div>
        <div style="display:flex;gap:12px;font-family:var(--font-mono);font-size:11px">
          <span style="color:var(--crit)">● ${cnt.rojo}</span><span style="color:var(--warn)">● ${cnt.ambar}</span>
          <span style="color:var(--ok)">● ${cnt.verde}</span><span style="color:${SEMC.gris}">● ${cnt.gris} sin dato</span></div>
        ${ks.map(krowHTML).join('')}</div>
      <div class="dgroup"><div class="gt">Puestos del área — quién los ocupa · con qué roster</div>
        ${pusZ1.map(nm=>{ const o=puestoOcupante(nm);
          return `<div class="rolrow"><span class="plnk" data-pu="${nm}">${nm}</span> ${rosterBadge(nm)}<span class="who ${o.vac?'vac':''}" ${(!o.vac&&o.quien)?`data-per="${o.quien}" style="cursor:pointer"`:''}>${o.vac?'sin persona asignada':(o.quien||'equipo')}</span></div>`; }).join('')}
        <div style="font-size:10px;color:var(--tx-faint)">métricas por PUESTO/ROL, jamás por persona nombrada · ⛨ = roster compilado del twin</div></div>
      <div style="font-size:12px;color:var(--tx-faint)">El área es un LENTE sobre el mapa de valor: sus procesos encendidos en su lugar, los vecinos de cadena a media luz = sus fronteras (qué la alimenta · a quién alimenta). Toca un proceso para su ficha (SIPOC) · doble-click abre su lienzo (flujograma).</div>`;
  }
  else if(state.escala==='z3'&&state.act){
    const lf=lienzoData(state.act.pid), aa=lf&&lf.acts.find(x=>x.ord===state.act.ord);
    const dd=DATA.z3[state.act.pid+':'+state.act.ord];
    inEye.textContent='Actividad · instrucción de trabajo'; inTitle.textContent=aa?(aa.verbo+' — '+String(state.act.ord).padStart(2,'0')):'—';
    inBody.innerHTML=`
      ${dd&&dd.m36?`<div class="dgroup"><div class="gt">Veredicto del triage</div>
        <div style="font-size:12.5px;line-height:1.5">${aa.triage?`<b>${aa.triage}</b> — `:''}RPA <b class="mono">${dd.m36.rpa}</b> · Agente <b class="mono">${dd.m36.agente}</b>. ${dd.m36.rpa<35&&dd.m36.agente<35?'Queda humana: criterio, negociación o relación.':dd.m36.agente>dd.m36.rpa?'El agente del arnés puede prepararla/asistirla.':'Automatizable con reglas (RPA).'}</div></div>`:''}
      <div class="dgroup"><div class="gt">Acciones (kinética)</div>
        <button class="btn" data-acc="corregir-instruccion">Proponer corrección de instrucción › <span class="mono" style="font-size:9px;color:var(--tx-faint)">táctico · gestión-de-cambios → recompila arnés</span></button>
        <button class="btn" data-acc="enviar-idea">Proponer mejora al embudo › <span class="mono" style="font-size:9px;color:var(--tx-faint)">operativo · directa · autoría reconocida</span></button></div>
      <div style="font-size:12px;color:var(--tx-faint);line-height:1.5">Debajo de la instrucción no hay más zoom: el piso es el <b>arnés de este rol×proceso</b>, ensamblado al roster del puesto. Toca una tarea, un rol o el arnés para seguir el viaje.</div>`;
    wireLinks(inBody); return;
  }
  else if(state.mod==='territorio'&&state.nivel===3&&state.escala==='z0'){
    if(state.area3){ /* v21 · el rail de la sala = LA REUNIÓN del área: acuerdos, riesgos e ideas — filtrados */
      const A=byId(DATA.areas,state.area3);
      const rgs=riesgosDeArea(A.id), acus=acuerdosDeArea(A.id).filter(a=>a.estado!=='cumplido'), ideas=ideasDeArea(A.id);
      const sc=sinContraKpis().filter(k=>{const p=byId(DATA.procesos,k.proc);return p&&p.areas.some(x=>new Set(descendants(A.id)).has(x));});
      inEye.textContent='Área · la reunión'; inTitle.textContent=A.nm;
      inBody.innerHTML=`
        <div class="dgroup"><div class="gt">La regla de la reunión${respBadge('tac-contramedida')}</div>
          <div style="font-size:12px;line-height:1.5">Indicador fuera de banda <b>exige contramedida comprometida</b> — la anomalía sin respuesta es alerta, no excusa.${sc.length?` <b style="color:var(--warn)">${sc.length} indicador${sc.length>1?'es':''} del área sin contramedida.</b>`:' Hoy el área no debe ninguna.'}</div></div>
        <div class="dgroup"><div class="gt">Acuerdos del área — abiertos${respBadge('dir-acuerdos')}</div>
          ${acus.length?acus.map(a=>`<button class="loop-it" data-acu="${a.id}"><span style="color:${ACUC[a.estado]||'var(--tx-mut)'}">·</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.nm}</span><span class="mono" style="font-size:9.5px;color:${ACUC[a.estado]||'var(--tx-mut)'}">${a.estado}</span></button>`).join(''):'<span style="font-size:12px;color:var(--tx-faint)">— ninguno abierto</span>'}</div>
        <div class="dgroup"><div class="gt">Riesgos que responde${respBadge('dir-riesgos')}</div>
          ${rgs.length?rgs.map(r=>{const n=nivelRiesgo(r);return `<button class="loop-it" data-rg="${r.id}"><span style="color:${n.c}">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.nm}</span><span class="mono" style="font-size:9.5px;color:${n.c}">${n.t}</span></button>`;}).join(''):'<span style="font-size:12px;color:var(--tx-faint)">— ninguno anclado al área</span>'}</div>
        <div class="dgroup"><div class="gt">Ideas del personal del área${respBadge('ideas')}</div>
          ${ideas.length?ideas.map(i=>`<button class="loop-it" data-idea="${i.id}"><span>💡</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.nm}</span><span class="mono" style="font-size:9.5px;color:var(--tx-faint)">${i.estado}</span></button>`).join(''):'<span style="font-size:12px;color:var(--tx-faint)">— todavía ninguna</span>'}</div>
        <div style="font-size:12px;color:var(--tx-faint)">La sala se lee de arriba a abajo: lo que te toca → el plan → quién → cómo se ejecuta → sobre qué corre → el archivo. La capa <b>Plan del ciclo</b> apaga/prende el CÓMO.</div>
        <button class="btn" style="justify-content:center" onclick="gotoNivel(3)">‹ Elegir otra área</button>`;
      wireLinks(inBody); return; }
    const sc=sinContraKpis();
    inEye.textContent='Táctico · la sala de cada área'; inTitle.textContent=`${sc.length} sin contramedida · ${DATA.ideas.filter(i=>i.estado==='enviada').length} ideas por evaluar`;
    inBody.innerHTML=`<div class="dgroup"><div class="gt">Cómo se entra</div>
        <div style="font-size:12.5px;line-height:1.5">Cada gerencia y jefatura tiene su <b>sala</b>: la bajada, el plan, la estructura, los procesos, los sistemas y el archivo de esa parte de la empresa. Elige una tarjeta — o entra con doble click desde el organigrama (nivel 2).</div></div>
      <div class="dgroup"><div class="gt">La regla de la reunión${respBadge('tac-contramedida')}</div>
        <div style="font-size:12.5px;line-height:1.5">Indicador fuera de banda <b>exige contramedida comprometida</b> — la anomalía sin respuesta es alerta, no excusa. La contramedida se registra como acción, jamás verbal.</div></div>`;
    wireLinks(inBody); return; }
  else{
    const pid=state.lienzo||DATA.flagship.proc, f=lienzoData(pid), p2=byId(DATA.procesos,pid), ks=kpisByProc(pid);
    const gs=DATA.brechas.filter(x=>x.against===pid);
    /* v17 · nivel 4 no aterriza a ciegas: el proceso en foco se declara y se puede CAMBIAR desde aquí */
    const selProc=state.escala==='z2'?`<div class="dgroup"><div class="gt">Proceso en foco — nivel operativo</div>
      <select id="procSel" style="width:100%;background:var(--raised);color:var(--tx);border:1px solid var(--border);border-radius:8px;padding:6px 8px;font:inherit;font-size:12px">
        <optgroup label="Cadena de valor (misionales)">${DATA.cadena.map(id=>{const x=byId(DATA.procesos,id);return `<option value="${x.id}"${x.id===pid?' selected':''}>${x.nm} — ${coreNm(x.dueno)}</option>`;}).join('')}</optgroup>
        <optgroup label="Apoyo">${DATA.procesos.filter(x=>!DATA.cadena.includes(x.id)).map(x=>`<option value="${x.id}"${x.id===pid?' selected':''}>${x.nm} — ${coreNm(x.dueno)}</option>`).join('')}</optgroup>
      </select>
      <div style="font-size:10.5px;color:var(--tx-faint)">elige otro proceso para abrir su flujo — o vuelve al mapa con ‹ Big picture</div></div>`:'';
    const tuDia=state.escala==='z2'?`<div class="dgroup"><div class="gt">Tu día — operativo${respBadge('z4-tudia')}</div>
      <button class="loop-it" data-k="k-caj"><span style="color:var(--warn)">◔</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Registrar "rezago caja por obra" — sin dato</span><span class="mono" style="font-size:9px;color:var(--tx-faint)">directa</span></button>
      <button class="loop-it" data-k="k-vis"><span style="color:var(--warn)">⌛</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">"visitas a caseta" — frescura vencida</span><span class="mono" style="font-size:9px;color:var(--tx-faint)">directa</span></button>
      <button class="loop-it" data-h="h-cob-ancob"><span style="color:var(--brand-hi)">⛨</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Verificar la muestra del arnés (5 corridas · 20 min)</span><span class="mono" style="font-size:9px;color:var(--tx-faint)">supervisión</span></button>
      <button class="loop-it" data-acc="enviar-idea"><span>💡</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Enviar una idea — autoría con tu nombre</span><span class="mono" style="font-size:9px;color:var(--tx-faint)">directa</span></button></div>`:'';
    const gapsHTML=gs.length?`<div class="dgroup"><div class="gt">Brecha${gs.length>1?'s':''} activa${gs.length>1?'s':''} sobre este proceso</div>
      ${gs.map(g=>`<button class="loop-it" data-g2="${g.id}"><span style="color:${g.sev==='alta'?'var(--crit)':'var(--warn)'}">▲</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.nm}</span><span class="mono" style="font-size:10px;color:${g.sev==='alta'?'var(--crit)':'var(--warn)'}">${g.costo}</span></button>`).join('')}</div>`:'';
    inEye.textContent='Proceso · lienzo'; inTitle.textContent=p2.nm;
    if(!f){ // lienzo honesto (sin actividades levantadas)
      inBody.innerHTML=`${selProc}${tuDia}
        ${ks.length?`<div class="dgroup"><div class="gt">KPIs del proceso</div>${ks.map(krowHTML).join('')}</div>`:''}
        <div class="dgroup"><div class="gt">Actividades sin levantar</div>
          <div style="font-size:12px;line-height:1.5">Este lienzo muestra los <b>pasos macro</b> declarados en la ingesta. El detalle (carriles, tiempos VSM, triage, RACI) se construye en el levantamiento <b>M1 · entrevista + observación</b>.</div></div>
        ${gapsHTML}
        <div style="font-size:12px;color:var(--tx-faint)">Volver: ‹ Big picture · la ficha del proceso tiene su caracterización SIPOC.</div>`;
    } else {
      const tri=f.acts.filter(a=>a.triage&&a.triage.startsWith('automatizable')).length, elim=f.acts.filter(a=>a.triage==='eliminable').length;
      inBody.innerHTML=`${selProc}${tuDia}
        ${ks.length?`<div class="dgroup"><div class="gt">KPIs del proceso</div>${ks.map(krowHTML).join('')}</div>`:''}
        <div class="dgroup">
          <div class="drow"><dt>Actividades</dt><dd class="mono">${f.acts.length}</dd></div>
          <div class="drow"><dt>Automatizables</dt><dd class="mono" style="color:var(--brand-hi)">${tri}</dd></div>
          <div class="drow"><dt>Eliminables</dt><dd class="mono" style="color:var(--crit)">${elim}</dd></div>
          <div class="drow"><dt>VSM</dt><dd class="mono">${f.vsm?`◔ ${f.vsm.toque} · ⏳ ${f.vsm.espera}`:'sin medir (M1)'}</dd></div>
        </div>
        ${gapsHTML}
        <div style="font-size:12px;color:var(--tx-faint)">Toca una actividad para su detalle (VSM, triage, RACI, procedencia).</div>`;
    }
    const ps=inBody.querySelector('#procSel'); if(ps) ps.onchange=e=>drillLienzo(e.target.value);
  }
  wireLinks(inBody);
}

function prov(fuente,conf){ return `<div class="dgroup"><div class="gt">Procedencia · sin falsa certeza</div>
  <div class="drow"><dt>Fuente</dt><dd>${fuente}</dd></div>
  <div class="drow"><dt>Confianza</dt><dd><span class="chip"><span class="health-dot" style="width:8px;height:8px;background:${confCol(conf)}"></span>${conf}</span></dd></div></div>`; }

/* SIPOC = proyección de bordes del proceso (ISO 9001 4.4.1 · SOMA C3/C5) — derivada de
   entradas/salidas/secuencia; NUNCA un diagrama editable (D-08/D-11). Sin dato → honesto (M1). */
function sipocHTML(p){
  const sp=DATA.sipoc[p.id];
  const ci=DATA.cadena.indexOf(p.id);
  const prev=ci>0?DATA.cadena[ci-1]:null, next=(ci>=0&&ci<DATA.cadena.length-1)?DATA.cadena[ci+1]:null;
  const refChip=r=>r.proc?`<span class="chip lk" data-proc="${r.proc}">${byId(DATA.procesos,r.proc).nm} ›</span>`:`<span class="chip" title="actor externo">${r.ext} · ext</span>`;
  const prov=sp?sp.prov:(prev?[{proc:prev}]:[]);
  const cli=sp?sp.cli:(next?[{proc:next}]:[]);
  const ld=lienzoData(p.id);
  const pasos=ld?ld.acts.map(a=>a.verbo):(DATA.pasosMini[p.id]||[]);
  const row=(k,lab,body)=>`<div class="sip-row"><span class="sip-k">${k}</span><div class="sip-b"><span class="sip-lab">${lab}</span><div>${body}</div></div></div>`;
  return `<div class="dgroup"><div class="gt">Caracterización — SIPOC <span class="mono" style="font-size:9px;color:var(--tx-faint)">proyección de bordes · ISO 9001 4.4.1 · se deriva, no se edita</span></div>
    ${sp&&sp.disp?`<div class="drow"><dt>Disparador</dt><dd style="font-size:12px">${sp.disp}</dd></div>`:''}
    ${row('S','Proveedores',prov.length?`<div class="chips">${prov.map(refChip).join('')}</div>`:'<span class="sip-na">sin levantar — candidato M1</span>')}
    ${row('I','Entradas',sp&&sp.in?sp.in.join(' · '):'<span class="sip-na">sin levantar — candidato M1</span>')}
    ${row('P','Proceso',`<span class="sip-pasos">${pasos.join(' ▸ ')||'—'}</span>`)}
    ${row('O','Salidas',sp&&sp.out?sp.out.join(' · '):'<span class="sip-na">sin levantar — candidato M1</span>')}
    ${row('C','Clientes',cli.length?`<div class="chips">${cli.map(refChip).join('')}</div>`:'<span class="sip-na">sin levantar — candidato M1</span>')}
    ${sp&&sp.ctrl?`<div class="drow"><dt>Criterios de control</dt><dd style="font-size:11.5px">${sp.ctrl.join(' · ')}</dd></div>`:''}</div>`;
}
