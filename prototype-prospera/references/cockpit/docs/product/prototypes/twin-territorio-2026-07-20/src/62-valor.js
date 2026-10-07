/* ---------- z0 · piel MAPA DE VALOR (default) — 7 bandas, un sistema interconectado ----------
   Geografía: mapa de procesos ISO 9001 (dirección / negocio / apoyo) × cadena de valor Porter ×
   strategy map absorbido en la banda Estrategia. El hilo de oro = edges VERTICALES reales.
   Mismo ADN de bandas que harness-studio (map-canvas): fractal con el arnés. Decisión v6 (2026-07-24).

   v20 (2026-07-30) — el mapa se lee de arriba a abajo como UNA frase, y cada banda es un eslabón:
     0 Estrategia    ¿a dónde vamos?            las metas del directorio y su bajada
     1 Dirección     ¿cómo nos gobernamos?      los procesos que PRODUCEN lo que el nivel 1 revisa  ← v20
     2 Capacidades   ¿qué sabemos hacer?        la madurez contra lo que la meta exige              ← v20
     3 Cadena        ¿cómo lo hacemos?          los procesos del negocio, en su orden
     4 Apoyo         ¿qué nos sostiene?         los procesos de apoyo
     5 Gente         ¿quién lo opera?           puestos y sus arneses
     6 Sistemas      ¿sobre qué corre?          plataformas y su pulso
   Las dos bandas nuevas cierran dos huecos que se leían como productos distintos: el mapa prometía
   los tres tipos de proceso y pintaba dos (la dirección se producía FUERA del mapa, en el nivel 1), y
   el hilo saltaba de la meta al proceso sin pasar por la capacidad — que es donde el gerente contesta
   "no es que el proceso falle: no sabemos hacer esto al nivel que la meta exige". */
function renderValor(){
  const W=1840, Y={est:170, dir:566, cap:560, cad:860, apo:1150, gen:1345, sis:1530}; setCanvas(W, 1900);
  const searching=!!q();
  const act=state.activeObj;
  const hiloOn=state.capas.has('hilo');
  /* — v13 · FOCO DE ÁREA (firmado 2026-07-26): z1 no es un mundo aparte — es este mismo mapa
     con el área como lente. Sus procesos se encienden EN SU LUGAR (banda/orden intactos),
     los vecinos inmediatos de cadena quedan a media luz (fronteras del área), el resto es
     fantasma. Pins, cinética e hilo se restringen al set enfocado. — */
  const focoA = state.escala==='z1' ? byId(DATA.areas, state.foco) : null;
  const focoSet = focoA ? new Set(descendants(focoA.id)) : null;
  const focoProcs = focoA ? new Set(subtreeProcs(focoA.id).map(p=>p.id)) : null;
  const enFoco = pid => !!(focoProcs && focoProcs.has(pid));
  const vecinos = new Set();
  if(focoA) DATA.cadena.forEach((pid,i)=>{ if(enFoco(pid))
    [DATA.cadena[i-1],DATA.cadena[i+1]].forEach(v=>{ if(v&&!enFoco(v)) vecinos.add(v); }); });
  const focoCls = pid => !focoA ? '' : (enFoco(pid) ? 'foco' : vecinos.has(pid) ? 'vecino' : 'dim');
  const focoObjs = new Set();
  if(focoA) DATA.procesos.forEach(p=>{ if(enFoco(p.id)) p.sirve.forEach(o=>focoObjs.add(o)); });
  const focoPts = [];
  // el conjunto encendido: objetivo activo + sus drivers + roles + sistemas (spine del hilo)
  const drivers=act?DATA.procesos.filter(p=>p.sirve.includes(act)).map(p=>p.id):null;
  const hotProc=id=>drivers&&drivers.includes(id);
  const hotRol=new Set(), hotSis=new Set();
  if(drivers) drivers.forEach(id=>{ const p=byId(DATA.procesos,id);
    hotRol.add(p.dueno.replace(/\s*\(vacante\)/i,'')); p.sist.forEach(s=>{const x=sisByName(s); if(x)hotSis.add(x.id);}); });
  const dimIf=c=>act&&!c?'dim':'';

  const bandLab=(y,t,sub)=>{ const l=el('div','grouplab'); l.style.left='30px'; l.style.top=(y-60)+'px';
    l.innerHTML=`<span class="eyebrow">${t}</span>${sub?`<div style="font-size:9.5px;color:var(--tx-faint);margin-top:2px">${sub}</div>`:''}`;
    $nodes.appendChild(l); pathEl(`M24,${y-72} L${W-24},${y-72}`,'#243330',1,.95); };

  /* — banda 0 · ESTRATEGIA — los DOS peldaños de la misma cascada, en dos filas (D-35 · M26).
     Arriba la meta de la EMPRESA (agrupada por perspectiva; la causalidad se dibuja dentro de la fila).
     Abajo la BAJADA: la misma meta abierta como meta de UNA gerencia, con el rol que responde y si el
     gerente la aceptó en sesión. v20: antes las diez iban en una sola fila — la décima se salía del
     lienzo y, peor, nada distinguía la meta de la empresa de la de un gerente. Son dos peldaños
     distintos de la misma escalera, y una junta de gerentes necesita ver cuál es cuál. — */
  const bajadas=DATA.objetivos.filter(o=>o.parent), sinAc=sinAcordar().length;
  bandLab(Y.est,'Estrategia — las metas del directorio y su bajada'+respBadge('z0-estrategia'),
    `arriba la meta de la EMPRESA (orden por perspectiva: financiera · cliente · procesos · aprendizaje) · abajo la BAJADA — la misma meta abierta como meta de UNA gerencia, con el rol que responde${sinAc?` · <b style="color:var(--warn)">${sinAc} sin acuerdo de bajada</b>`:''}`);
  const PERSP=['financiera','cliente','procesos','aprendizaje'];
  const oPos={}; let ox=120;
  PERSP.forEach(pk=>{
    const objs=objRaiz().filter(o=>o.persp===pk); if(!objs.length)return;
    const lab=el('div','grouplab'); lab.style.left=ox+'px'; lab.style.top=(Y.est-14)+'px';
    lab.innerHTML=`<span class="persp-lab">${pk}</span>`; $nodes.appendChild(lab);
    objs.forEach(o=>{ oPos[o.id]={x:ox+92,y:Y.est+54}; ox+=204; }); ox+=34;
  });
  /* la fila 2 NO lleva rótulo flotante: los nodos de la fila 1 crecen hacia abajo y lo tapaban.
     Cada nodo de la bajada ya dice de quién es (área · responde · sin acuerdo), y la leyenda de las
     dos filas vive en el sub-rótulo de la banda — un solo lugar, cero superposición. */
  const yBaj=Y.est+182;
  bajadas.forEach((o,i)=>{ oPos[o.id]={x:120+i*204+92,y:yBaj}; });
  DATA.bscEdges.forEach(([a,b])=>{ const A=oPos[a],B=oPos[b]; if(!A||!B)return;
    pathEl(`M${A.x},${A.y-34} C${A.x},${A.y-72} ${B.x},${B.y-72} ${B.x},${B.y-34}`,'var(--teal-700)',1.1, act?( [a,b].includes(act)?.6:.08 ):.22); });
  DATA.objetivos.forEach(o=>{ const p=oPos[o.id]; if(!p)return;
    const n=el('button','node '+dimIf(act===o.id)); n.style.left=p.x+'px'; n.style.top=p.y+'px';
    MM_PTS.push(p);
    if(searching && !(o.nm+' '+o.kr.m).toLowerCase().includes(q())) n.classList.add('dim');
    if(focoA){ if(!focoObjs.has(o.id)) n.classList.add('dim'); else focoPts.push(p); }   // v13: foco — solo objetivos que el área sostiene
    const ar=o.area&&byId(DATA.areas,o.area);
    n.innerHTML=`<div class="obj-node ${act===o.id?'hot':''}" style="width:188px">
      <span class="health-dot" style="background:${health[o.salud]};float:right;margin-top:2px"></span>
      <div class="nm" style="font-size:11.5px">${tbadge('objetivo','objetivo · Goal/Outcome (M13 ArchiMate, Motivation)')}${o.nm}</div>
      ${o.parent?`<div class="baj">${ar?ar.nm:'—'} · responde ${coreNm(o.krs[0].acc)}${o.acordado?'':' · <b>sin acuerdo</b>'}</div>`:''}
      <div class="kr"><span class="m">${o.kr.m}</span><span class="from">${o.kr.from}</span><span class="ar">→</span><span class="cur">${krCur(o.kr)==null?'s/d':krCur(o.kr)}</span><span class="ar">→</span><span class="to">${o.kr.to}</span><span class="u">${o.kr.u}</span></div>
    </div>`;
    n.querySelector('.obj-node').onclick=()=>{ state.activeObj=act===o.id?null:o.id; render(); if(state.activeObj===o.id) openObjetivo(o); };
    $nodes.appendChild(n);
  });
  /* la cascada visible: cada bajada cuelga de la meta del directorio que sostiene. Punteada cuando el
     gerente todavía NO la aceptó en sesión — asignada no es acordada, y la diferencia se ve (M26). */
  bajadas.forEach(o=>{ const B=oPos[o.id], A=oPos[o.parent]; if(!A||!B)return;
    const on=act?(hiloTocaObj(o.krs[0].id,act)?.7:.06):.2;
    pathEl(vcurve(A.x,A.y+42,B.x,B.y-30),'var(--teal-700)',1.1,on,o.acordado?null:'3 3'); });

  /* — banda 1 · DIRECCIÓN — los procesos con que la empresa se gobierna (D-b · el tercer tipo del mapa
     ISO, el que faltaba). No son un tablero aparte: son los procesos que PRODUCEN lo que el nivel 1
     revisa, y hasta v20 vivían sin casilla, sin dueño declarado y sin madurez. Deliberadamente NO
     entran al hilo de oro: la dirección no MUEVE un indicador, PRODUCE la meta que otros mueven —
     por eso tampoco se apagan al encender un objetivo (son el contexto de todos, no de uno). — */
  const dirProcs=procsTipo('direccion');
  bandLab(Y.dir,'Dirección — cómo se gobierna la empresa'+respBadge('z0-direccion'),
    'planear · revisar · decidir · controlar — cada uno produce lo que la sala del directorio revisa; clic = su ficha, con el salto a su tablero');
  const dPos={}; const dirW=256; let dx=120, dy=Y.dir+8;   // 6 × 256 + 5 × 16 = una sola fila (v20)
  dirProcs.forEach(p=>{
    if(dx+dirW>W-60){ dx=120; dy+=58; }
    const dc=procColor(p);
    const b=el('button','dirchip');
    if(searching&&!procMatch(p))b.classList.add('dim');
    /* en foco de área sí se atenúan: la sesión del directorio no es de la gerencia Comercial */
    if(focoA && !p.areas.some(x=>focoSet.has(x))) b.classList.add('dim');
    b.style.left=dx+'px'; b.style.top=dy+'px'; b.style.width=dirW+'px';
    b.innerHTML=`<div style="display:flex;gap:7px;align-items:center"><span class="health-dot" style="width:7px;height:7px;background:${dc}"></span><span class="nm">${tbadge('proceso','proceso de dirección · Business Process (M13 ArchiMate)')}${p.nm}</span></div>
      <div class="meta">${coreNm(p.dueno)} · produce ${p.produce} <span class="go">›</span></div>`;
    b.onclick=()=>openProceso(p);
    dPos[p.id]={x:dx+dirW/2,y:dy}; MM_PTS.push(dPos[p.id]);
    if(focoA && !b.classList.contains('dim')) focoPts.push(dPos[p.id]);
    $nodes.appendChild(b); dx+=dirW+16;
  });

  /* — banda 2 · CAPACIDADES — qué sabe hacer la empresa y cuánto le falta (mapa de capacidades M31 +
     escalera de capacidad M15). Ordenada por FAMILIA y no por gerencia a propósito: la capacidad es
     estable frente al organigrama (ése es su aporte) y las que cruzan dos gerencias no tendrían dónde
     ir. La gerencia entra como LENTE (foco de área), jamás como dueña. Es el eslabón que faltaba entre
     la meta y el proceso — sin él la junta salta de "no llego" a "arreglá el proceso". — */
  const capY=dy+120;   // aire real: los chips de Dirección miden ~58 y el rótulo de abajo no se pisa
  bandLab(capY,'Capacidades — qué sabemos hacer, y cuánto nos falta'+respBadge('z0-capacidades'),
    '● alcanzado · ○ lo que falta — sin nivel deseado hay nivel, no brecha, y se dice · la capa <b>Madurez</b> pinta el mapa entero por esta distancia');
  const kPos={}; const capW=206, capCol=capW+26;
  const hotCap=new Set();
  if(drivers) drivers.forEach(pid=>{ const c=capDeProc(pid); if(c) hotCap.add(c.id); });
  let kx=120, kFilas=1;
  DATA.capCats.forEach(cat=>{
    const cs=DATA.capabilities.filter(c=>c.cat===cat); if(!cs.length)return;
    kFilas=Math.max(kFilas,cs.length);
    const lab=el('div','grouplab'); lab.style.left=kx+'px'; lab.style.top=(capY-8)+'px';
    lab.innerHTML=`<span class="persp-lab">${cat}</span>`; $nodes.appendChild(lab);
    cs.forEach((c,i)=>{
      const y=capY+42+i*62, br=capBrecha(c), enFocoCap=focoProcs&&c.via.some(v=>focoProcs.has(v));
      const b=el('button','capchip'+(hotCap.has(c.id)?' hot':''));
      if(act&&!hotCap.has(c.id))b.classList.add('dim');
      if(searching && !(c.nm+' '+c.cat).toLowerCase().includes(q()))b.classList.add('dim');
      if(focoA){ b.classList.remove('dim'); if(enFocoCap)b.classList.add('foco'); else b.classList.add('dim'); }
      /* el color SOLO bajo la lente de madurez — las tres lentes nunca se mezclan en un color */
      const lente=state.capas.has('salud')&&state.sub==='madurez';
      if(lente){ const s=capSalud(c); if(s)b.style.borderColor=health[s]; }
      b.style.left=kx+'px'; b.style.top=y+'px';
      b.innerHTML=`<div class="nm">${tbadge('capability','capacidad · lo que la empresa sabe hacer (M13 ArchiMate, Strategy)')}${c.nm}</div>
        <div class="esc"><span class="dots" title="escalera de capacidad (COBIT 0-5) — ● alcanzado · ○ lo que falta hasta el deseado">${escDots(c.act,c.des)}</span>
          <span class="lv"${lente?` style="color:${health[capSalud(c)]||'var(--tx-faint)'}"`:''}>${brechaTxt(br)}</span></div>`;
      b.onclick=()=>openCapability(c);
      kPos[c.id]={x:kx+capW/2,y}; MM_PTS.push(kPos[c.id]);
      if(focoA && enFocoCap) focoPts.push(kPos[c.id]);
      $nodes.appendChild(b);
    });
    kx+=capCol;
  });
  /* la cobertura declarada: un proceso sin capacidad es un hueco del mapa, no un silencio (M31 · M23) */
  const sinCap=procsSinCap();
  if(sinCap.length){
    const h=el('button','caphueco');
    h.style.left=kx+'px'; h.style.top=(capY+42)+'px'; h.style.width=capW+'px';
    h.innerHTML=`<b style="color:var(--warn)">${sinCap.length} procesos</b> sin capacidad declarada<br>
      <span style="opacity:.85">${sinCap.slice(0,2).map(p=>p.nm).join(' · ')}${sinCap.length>2?' …':''}</span><br>
      <span style="color:var(--brand-hi)">ver la cobertura ›</span>`;
    h.title='El mapa de capacidades todavía no cubre todo el mapa de procesos — clic para el listado';
    h.onclick=()=>openCobertura();
    $nodes.appendChild(h);
  }

  /* — banda 3 · CADENA DE VALOR (los del negocio, izq→der; cada proceso = mini-mapa de pasos) — */
  Y.cad=capY+42+kFilas*62+150;   // aire para la pila de pins de brecha, que sube desde la cadena
  bandLab(Y.cad,'Cadena de valor — los procesos del negocio, en el orden en que ocurren'+respBadge('z0-cadena'),'cada proceso es un mini-mapa: sus pasos como micro-chevrons · doble-click = lienzo (mismo lenguaje que un arnés en Arnesia)');
  const cPos={}; const cx0=120, cw=192, cgap=32;
  DATA.cadena.forEach((pid,i)=>{
    const p=byId(DATA.procesos,pid); const x=cx0+i*(cw+cgap)+cw/2, y=Y.cad+64; cPos[pid]={x,y};
    MM_PTS.push({x,y});
    if(i<DATA.cadena.length-1){ const dimArrow=focoA&&!(enFoco(pid)||enFoco(DATA.cadena[i+1]));
      const a=el('div','chev-arrow'+(dimArrow?' dim':''),'▸'); a.style.left=(x+cw/2+cgap/2)+'px'; a.style.top=y+'px'; $pins.appendChild(a); }
    const ks=state.capas.has('hilo')?kpisByProc(pid):[];
    const ld=lienzoData(pid);
    const steps=ld?ld.acts.map(a2=>({v:a2.verbo,t:a2.triage})):(DATA.pasosMini[pid]||[]).map(v=>({v}));
    const dc=procColor(p);
    const hot=hotProc(pid);
    const n=el('button','node '+(hot?'hot':dimIf(false||hot))); if(act&&!hot)n.classList.add('dim');
    if(focoA){ n.classList.remove('dim'); const fc=focoCls(pid); if(fc)n.classList.add(fc); if(enFoco(pid))focoPts.push({x,y}); }
    if(searching&&!procMatch(p))n.classList.add('dim');
    n.style.left=x+'px'; n.style.top=y+'px';
    n.innerHTML=`<div class="chev">
      <div style="display:flex;gap:7px;align-items:flex-start"><span class="health-dot" style="background:${dc}"></span><div class="nm">${tbadge('proceso','proceso · Business Process (M13 ArchiMate)')}${p.nm}</div></div>
      <div class="dueno"><span class="plnk" data-rol="${p.dueno}">${p.dueno}</span> · <span style="color:var(--brand-hi)" title="doble-click abre el flujograma">lienzo ›</span></div>
      <div class="mini-pasos">${steps.map(s=>`<i title="${s.v}${s.t?' · '+s.t:''}" class="${s.t?('t-'+(s.t.includes('rpa')?'rpa':s.t.includes('agente')?'agente':s.t==='eliminable'?'elim':'hum')):''}"></i>`).join('')}</div>
      ${ks.length?`<div class="kpis-mini">${ks.map(krowHTML).join('')}</div>`:''}
      ${state.capas.has('trabajo')?`<div style="margin-top:6px">${harnBadge(arnesDe(p.dueno,p.id))}</div>`:''}
    </div>`;
    const card=n.querySelector('.chev');
    if(state.corrida && pid==='p-cob'){ n.classList.add('diff');   // v17: el diff de la corrida se ve EN el mapa, no solo en el panel
      card.insertAdjacentHTML('beforeend','<span class="dtag" title="La simulación propone +1 actividad (portal de pagos) — doble-click y la ves punteada en el lienzo">Δ +1 actividad</span>'); }
    card.onclick=()=>openProceso(p);
    card.ondblclick=()=>drillLienzo(p.id);
    n.querySelectorAll('.krow').forEach(b=>b.onclick=e=>{ e.stopPropagation(); openKpi(byId(DATA.kpis,b.dataset.k)); });
    wireLinks(n);
    $nodes.appendChild(n);
  });

  /* — banda 4 · APOYO (transversales ANCHOS: el ancho dice cuánto cruzan) —
     v20: `apoyo` ya no es "todo lo que no está en la cadena" (un resto) sino una clasificación
     declarada (`tipo`, D-a). Antes, cualquier proceso nuevo caía acá por descarte. */
  Y.apo=Y.cad+290;
  bandLab(Y.apo,'Procesos de apoyo — sostienen la cadena sin tocar al cliente'+respBadge('z0-apoyo'),'transversal = más ancho: cruza más áreas · mismo click = ficha');
  const apoyo=procsTipo('apoyo').sort((a,b)=>b.areas.length-a.areas.length);
  const aPos={}; let ax=120, ay=Y.apo+8, row=0;
  apoyo.forEach(p=>{
    const wPx=118+p.areas.length*62;
    if(ax+wPx>W-60){ ax=120; ay+=58; row++; }
    aPos[p.id]={x:ax+wPx/2,y:ay};
    const dc=procColor(p);
    const hot=hotProc(p.id);
    const s=el('button','soporte '+(hot?'hot':'')); if(act&&!hot)s.classList.add('dim');
    if(focoA){ s.classList.remove('dim'); const fc=focoCls(p.id); if(fc)s.classList.add(fc); if(enFoco(p.id))focoPts.push(aPos[p.id]); }
    if(searching&&!procMatch(p))s.classList.add('dim');
    s.style.left=ax+'px'; s.style.top=ay+'px'; s.style.width=wPx+'px';
    s.innerHTML=`<div style="display:flex;gap:7px;align-items:center"><span class="health-dot" style="width:7px;height:7px;background:${dc}"></span><span class="nm">${tbadge('proceso','proceso · Business Process (M13 ArchiMate)')}${p.nm}</span>${p.areas.length>1?`<span class="tag" style="margin-left:auto">cruza ${p.areas.length}</span>`:''}</div>
      <div class="meta">${p.dueno}${state.capas.has('trabajo')?' '+harnBadge(arnesDe(p.dueno,p.id)):''}</div>`;
    s.onclick=()=>openProceso(p); s.ondblclick=()=>drillLienzo(p.id); wireLinks(s);
    MM_PTS.push(aPos[p.id]);
    $nodes.appendChild(s); ax+=wPx+18;
  });

  /* — banda 5 · GENTE & ARNESES — PUESTOS que operan la cadena (D-19; la nómina completa vive en el Organigrama) — */
  Y.gen=Y.apo+195; Y.sis=Y.gen+185;
  const cadenaPuestos=PUESTOS.filter(p=>p.pares.length);
  bandLab(Y.gen+row*58,'Gente & arneses — quién opera la cadena'+respBadge('z0-gente'),
    `puesto = posición (se ocupa, reporta) · agrega N roles (carriles) · ⛨ = roster compilado del twin (capa Trabajo) · métricas por puesto/rol, jamás por persona · <span class="plnk" onclick="setPiel('org');render()" title="la estructura completa — el plano de los puestos">los ${PUESTOS.length} puestos de la nómina → Organigrama ›</span>`);
  const gy=Y.gen+row*58+6;
  const rPos={}; let rx=120, ry=gy;
  cadenaPuestos.forEach(pu=>{ const r=pu.nm;
    const occ=puestoOcupante(r);
    const hot=hotRol.has(r);
    const c=el('button','rolchip '+(hot?'hot':'')); if(act&&!hot)c.classList.add('dim');
    if(focoA){ c.classList.remove('dim');
      if(!(pu.pares.some(x=>focoProcs.has(x.proc))||focoSet.has(pu.area))) c.classList.add('dim'); }
    const nOcc=puestoOcupantes(r).length;
    c.innerHTML=`${tbadge('puesto','puesto · posición del organigrama (D-19 · ArchiMate Business Actor)')}${r}<span class="who">${occ.vac||!nOcc?'—':(occ.quien.split(' ')[0]+(nOcc>1?' +'+(nOcc-1):''))}</span>${state.capas.has('trabajo')?rosterBadge(r):''}`;
    $nodes.appendChild(c);
    const wCh=c.offsetWidth||(r.length*6.4+70);
    if(rx+wCh>W-60){ rx=120; ry+=46; }              // wrap REAL: nueva fila, no encima
    c.style.left=rx+'px'; c.style.top=ry+'px';
    c.onclick=()=>openPuesto(r); wireLinks(c);
    rPos[r]={x:rx+wCh/2,y:ry}; rx+=wCh+14;
    if(focoA && !c.classList.contains('dim')) focoPts.push(rPos[r]);   // v13: la gente del área entra al encuadre
  });

  /* — banda 6 · SISTEMAS (plataformas: ancho = cuántos procesos sirven · pulso al lakehouse) — */
  const ySis=Math.max(Y.sis+row*58, ry+86);   // la banda Gente creció (nómina completa) → Sistemas cede, no se solapa
  bandLab(ySis,'Sistemas — sobre qué corre todo'+respBadge('z0-sistemas'),'ancho = procesos que sirve · el lakehouse (N16) los observa: ese es el pulso del twin');
  let sy2=ySis+4, sx=120; const sPos={};
  DATA.sistemas.forEach(s2=>{
    const served=DATA.procesos.filter(p=>p.sist.includes(s2.nm)).length;
    const wPx=96+served*34;
    if(sx+wPx>W-60){ sx=120; sy2+=44; }          // wrap real (11 sistemas ya no caben en una fila)
    const hot=hotSis.has(s2.id);
    const b=el('button','sysplat '+(hot?'hot':'')); if(act&&!hot)b.classList.add('dim');
    if(focoA && !DATA.procesos.some(p=>enFoco(p.id)&&p.sist.includes(s2.nm))) b.classList.add('dim');
    b.style.left=sx+'px'; b.style.top=sy2+'px'; b.style.width=wPx+'px';
    b.innerHTML=`${tbadge('sistema','sistema · Application Component (M13 ArchiMate)')}<span class="health-dot" style="width:7px;height:7px;background:${health[digHealth(s2.digital)]}"></span>${s2.nm}<span style="margin-left:auto;font-size:8.5px;color:var(--tx-faint)">${served} proc</span>`;
    b.onclick=()=>openSistema(s2);
    sPos[s2.id]={x:sx+wPx/2,y:sy2};
    $nodes.appendChild(b); sx+=wPx+16;
  });
  setCanvas(W, Math.max(920, sy2+130));

  /* — capas Brechas + Cinética sobre la geografía de valor (pin/token sobre SU proceso) — */
  /* v19 · un proceso puede tener MÁS de una brecha (obra: desvío de avance + terceros sin evaluar).
     Antes se dibujaban en la misma coordenada y la de arriba tapaba a la de abajo: se veía una sola,
     y la que quedaba debajo era inalcanzable con el mouse. Se apilan por ancla. */
  const pilaPin={};
  if(state.capas.has('brechas')) DATA.brechas.forEach(g=>{
    if(act&&!hiloTocaObj(g.kr,act))return;
    if(focoA&&!enFoco(g.against))return;   // v13: en foco, solo las brechas del área
    const P=cPos[g.against]||aPos[g.against]; if(!P)return;
    const n=(pilaPin[g.against]=(pilaPin[g.against]||0)+1)-1, alza=n*54;
    const pin=el('div','pin '+(g.sev==='alta'?'':g.sev==='media'?'med':'low'));
    pin.style.left=(P.x+56)+'px'; pin.style.top=(P.y-58-alza)+'px';
    /* el cuerpo sube, la cabeza NO: el tallo se alarga para seguir señalando el mismo proceso */
    pin.innerHTML=`<div class="body" style="white-space:nowrap">▲ ${g.sev} · ${g.costo}</div><div class="stem" style="height:${13+alza}px"></div><div class="head"></div>`;
    pin.title=g.nm; pin.onclick=()=>openBrecha(g); $pins.appendChild(pin);
  });
  if(state.capas.has('cinetica')) DATA.proyectos.filter(pm=>pm.estado!=='cerrado').forEach(pm=>{
    const g=byId(DATA.brechas,pm.brecha), pr=g&&byId(DATA.procesos,g.against), P=pr&&(cPos[pr.id]||aPos[pr.id]); if(!P)return;
    if(focoA&&!enFoco(pr.id))return;   // v13: en foco, solo la cinética del área
    const k=el('div','kin'); k.style.left=P.x+'px'; k.style.top=(P.y+92)+'px';
    k.innerHTML=`${iico('proyecto','proyecto de mejora · Work Package (M13 ArchiMate)')}<span class="spark"></span><span class="pdca">${pm.pdca}</span>${pm.nm} · ROI ${pm.roi}`;
    k.onclick=()=>openProyecto(pm); $pins.appendChild(k);
  });

  /* — EL HILO: edges verticales cruzando las bandas (tenues siempre; encendidos con el objetivo activo).
     v20 · el hilo PASA POR LA CAPACIDAD cuando existe: meta → capacidad → proceso, en vez de saltar
     de la meta al proceso. No son dos aristas encima de una: cuando hay capacidad declarada se dibuja
     el camino por ella y NO el directo — la capacidad es una estación del hilo, no una decoración.
     Es lo que permite leer "no es que el proceso falle: no sabemos hacer esto al nivel que la meta
     exige", que es la frase que el gerente necesita para pedir presupuesto. — */
  const eop=(on)=>focoA?(on?.6:.04):act?(on?.75:.05):(hiloOn?.13:.05);   // v13: en foco, el hilo del área
  const viaCap=new Set();   // dedupe: N procesos de una misma capacidad = UNA arista meta→capacidad
  DATA.objetivos.forEach(o=>{ const A=oPos[o.id]; if(!A)return;
    DATA.procesos.filter(p=>p.sirve.includes(o.id)).forEach(p=>{
      const B=cPos[p.id]||aPos[p.id]; if(!B)return;
      const on=eop(focoA?enFoco(p.id):act===o.id);
      const c=capDeProc(p.id), K=c&&kPos[c.id];
      if(K){
        if(!viaCap.has(o.id+'|'+c.id)){ viaCap.add(o.id+'|'+c.id);
          pathEl(vcurve(A.x,A.y+40,K.x,K.y-24),'var(--teal-500)',1.2,on); }
        pathEl(vcurve(K.x,K.y+26,B.x,B.y-46),'var(--teal-500)',1.2,on);
      } else pathEl(vcurve(A.x,A.y+40,B.x,B.y-46),'var(--teal-500)',1.2,on);
    });
  });
  /* la capacidad también baja a los procesos de DIRECCIÓN que la realizan (gobernar es una capacidad
     como cualquier otra): esa arista sube una banda — es corta y dice lo mismo, "esto se realiza ahí" */
  DATA.capabilities.forEach(c=>{ const K=kPos[c.id]; if(!K)return;
    c.via.filter(v=>dPos[v]).forEach(v=>{ const D=dPos[v];
      pathEl(vcurve(K.x,K.y-24,D.x,D.y+22),'#33413e',1,eop(false)); });
  });
  DATA.procesos.forEach(p=>{ const A=cPos[p.id]||aPos[p.id]||dPos[p.id]; if(!A)return;
    const core=p.dueno.replace(/\s*\(vacante\)/i,''); const R=rPos[core];
    if(R) pathEl(vcurve(A.x,A.y+52,R.x,R.y-16),'#3d4f4a',1,eop(focoA?enFoco(p.id):hotProc(p.id)));
    p.sist.forEach(sn=>{ const s2=sisByName(sn); const S=s2&&sPos[s2.id]; if(!S)return;
      pathEl(vcurve(A.x,A.y+52,S.x,S.y-14),'#33413e',0.9,eop(focoA?enFoco(p.id):hotProc(p.id))*0.8); });
  });

  if(focoA){
    const ng=DATA.brechas.filter(g=>enFoco(g.against)).length;
    const nk=DATA.capabilities.filter(c=>c.via.some(v=>focoProcs.has(v))).length;
    counter(`Foco: ${focoA.nm} · ${focoProcs.size} procesos en su lugar del mapa · ${nk} capacidades · ${ng} brechas · Territorio ‹ sale del foco`);
    fitPts(focoPts);
  } else {
    const conBrecha=DATA.capabilities.filter(c=>{const b=capBrecha(c);return b!=null&&b>0;}).length;
    counter(`${DATA.procesos.length} procesos · ${DATA.capabilities.length} capacidades · ${cadenaPuestos.length}/${PUESTOS.length} puestos · ${DATA.sistemas.length} sistemas`,
      `${dirProcs.length} de dirección · ${DATA.cadena.length} del negocio · ${apoyo.length} de apoyo\n${conBrecha} capacidades con brecha de madurez · ${sinCap.length} procesos sin capacidad declarada`);
    if(firstLoad){ firstLoad=false; fitEncuadre(); } else fit();
  }
}

/* ---------- z1 área = FOCO del mapa de valor (v13 — renderArea MURIÓ, decisión firmada 2026-07-26):
   drillArea solo fija el lente; renderValor pinta el mismo territorio con el área encendida ---------- */
function drillArea(id){ state.nivel=2; state.escala='z1'; state.foco=id; state.insp='home'; render(); }

