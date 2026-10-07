/* ============================================================
   ENGINE
   ============================================================ */
const world=document.getElementById('world'), stage=document.getElementById('stage');
const $nodes=document.getElementById('nodes'), $pins=document.getElementById('pins'),
      $edges=document.getElementById('edges'), $lienzo=document.getElementById('lienzo');
const NS='http://www.w3.org/2000/svg';
const byId=(a,id)=>a.find(o=>o.id===id);
const areaProcs=id=>DATA.procesos.filter(p=>p.areas.includes(id));
const digHealth=d=>d==='integrado'?'verde':d==='externo'?'ambar':'rojo';
const kids=id=>DATA.areas.filter(a=>a.parent===id);
function descendants(id){ const o=[id]; kids(id).forEach(c=>o.push(...descendants(c.id))); return o; }
function subtreeProcs(id){ const set=new Set(descendants(id)); return DATA.procesos.filter(p=>p.areas.some(a=>set.has(a))); }
const worstDig=procs=>procs.reduce((w,p)=>{const h=digHealth(p.digital);return (h==='rojo'||w==='rojo')?'rojo':((h==='ambar'||w==='ambar')?'ambar':'verde');},'verde');

/* motor de indicadores (derivado al leer, nunca persistido — doctrina cruce-estructura).
   v19 (D-31): la DIRECCIÓN es dato (`k.dir`: +1 más es mejor · −1 menos es mejor), ya no se infiere
   del orden de la banda. La inferencia se rompía en cuanto una banda fuera de dos colas o con umbrales
   iguales, y es el mismo campo que las cifras del periodo ya llevaban obligatorio desde v18: un solo
   mecanismo para la misma semántica a los dos lados de la costura contable.
   La banda es de TRES tramos (`target` · `amar` · `rojo`): con el ámbar declarado, "ámbar" deja de ser
   lo que sobra entre dos números. */
const SEMC={verde:'var(--ok)',ambar:'var(--warn)',rojo:'var(--crit)',gris:'#5c6b68'};
const kcur=k=>k.mediciones.length?k.mediciones[k.mediciones.length-1].v:null;
const mejorQue=(a,b,dir)=>dir>=0?a>=b:a<=b;      // ¿`a` está al menos tan bien como `b`?
function semaforo(k){ const c=kcur(k); if(c==null) return 'gris';           // sin dato = GRIS, nunca rojo
  const d=k.dir||1;
  if(mejorQue(c,k.banda.target,d)) return 'verde';
  if(!mejorQue(c,k.banda.rojo,d))  return 'rojo';
  if(k.banda.amar!=null) return mejorQue(c,k.banda.amar,d)?'ambar':'rojo';
  return 'ambar'; }
/* madurez — DERIVADA (D-32): de las capabilities que realizan los procesos, jamás un campo guardado.
   v20 (D-c, firmada 2026-07-30): lo que se pinta es la BRECHA (cuánto falta), no el peldaño alcanzado.
   Un área con todo en 4 de 4 y otra en 4 de 5 no pueden ser el mismo color: la primera llegó, la
   segunda no. Y una capacidad SIN nivel deseado no tiñe a nadie — no existe la distancia que nadie
   fijó (era el caso de `c-permisos`, que hundía a Desarrollo en rojo por una meta que no existe).
   Sin ninguna capacidad con deseado ⇒ null y la vista dice "sin meta fijada", jamás un color. */
const capsDeProc=pid=>DATA.capabilities.filter(c=>c.via.includes(pid));
const capDeProc=pid=>capsDeProc(pid)[0]||null;
function capsDeArea(id){ const ps=subtreeProcs(id).map(p=>p.id), set=new Map();
  ps.forEach(pid=>capsDeProc(pid).forEach(c=>set.set(c.id,c))); return [...set.values()]; }
/* brecha de madurez de una capability: existe SÓLO si alguien fijó el deseado (D-32) */
const capBrecha=c=>c.des==null?null:c.des-c.act;
const brechaSalud=b=>b==null?null:(b<=0?'verde':b===1?'ambar':'rojo');
const capSalud=c=>brechaSalud(capBrecha(c));
const peorBrecha=cs=>{ const bs=cs.map(capBrecha).filter(b=>b!=null); return bs.length?Math.max(...bs):null; };
const madurezArea=id=>peorBrecha(capsDeArea(id));
const madurezProc=pid=>peorBrecha(capsDeProc(pid));
const madurezSalud=brechaSalud;
/* qué metas se apoyan en una capacidad — DERIVADO por DOS caminos, jamás tecleado. Con uno solo se
   producían falsos negativos que se ven a simple vista: "ver la caja al día" (1 de 5, la peor brecha
   del mapa) declaraba "ninguna meta se apoya en ella" porque el proceso que la realiza —caja chica de
   obra— no declara driver… mientras su brecha bloquea el contrato "caja visible al día" del directorio.
     1 · el proceso que la realiza declara la meta que mueve (`proceso.sirve`)
     2 · una brecha sobre lo que la realiza bloquea el contrato de una meta (`brecha.kr` → su objetivo)
   Vacío después de los dos = capacidad que hoy no sostiene ninguna meta, y eso se DICE: es el caso de
   "atender al propietario" (se deteriora, y ningún KR la mide — la brecha existe pero sin ancla). */
const objsDeCap=c=>{ const set=new Map();
  DATA.procesos.forEach(p=>{ if(!c.via.includes(p.id))return;
    p.sirve.forEach(id=>{ const o=byId(DATA.objetivos,id); if(o)set.set(o.id,o); }); });
  DATA.brechas.forEach(g=>{ if(!g.kr)return;
    if(!(c.via.includes(g.against)||g.against===c.id))return;
    const o=objDeKr(g.kr); if(o)set.set(o.id,o); });
  return [...set.values()]; };
/* cobertura del mapa de capacidades: lo que NO está declarado se muestra, no se calla (M31 · M23) */
const procsSinCap=()=>DATA.procesos.filter(p=>!capsDeProc(p.id).length);
const procsTipo=t=>DATA.procesos.filter(p=>p.tipo===t);
/* la escalera de puntos — UN idioma para las dos escaleras que conviven y jamás se promedian (D-32):
   ● alcanzado · ○ lo que falta hasta el deseado · · fuera de la meta. La usa la autoevaluación del
   sistema de gestión (nivel 1 · ISO 9004) y la madurez de una capacidad (nivel 2 · COBIT); cada una
   viaja con SU escalera declarada al lado, que es lo que impide confundir un 3 con otro 3. */
function escDots(act,des,max){ max=max||5; let s='';
  for(let i=1;i<=max;i++) s+= i<=act?'<b>●</b>' : (des!=null&&i<=des?'<span class="want">○</span>':'<span class="off">·</span>');
  return s; }
/* frase de la brecha de madurez, en el idioma del gerente (cero jerga) */
const brechaTxt=b=>b==null?'sin meta fijada':b<=0?'en el nivel deseado':`falta${b>1?'n':''} ${b} peldaño${b>1?'s':''}`;
/* el color de un proceso según la lente activa — UNA definición para las TRES bandas de procesos
   (dirección · cadena · apoyo). v20: `madurez` deja de caer en silencio a digitalización. Ese era el
   bug que hacía que el botón del directorio ("ver el mapa por madurez de capacidades") prometiera un
   mapa que no existía: la lente sólo estaba implementada en la piel Organigrama. */
const procColor=p=>!state.capas.has('salud')?'#2a3733'
  :state.sub==='conf'?confCol(p.conf)
  :state.sub==='madurez'?(health[madurezSalud(madurezProc(p.id))]||'#2a3733')
  :health[digHealth(p.digital)];
/* v19 · el hilo se cierra ACÁ, no en el dato: la salud del objetivo y su KR principal se DERIVAN una
   vez que existe el motor de indicadores (el KR lee la serie de su KPI — D-34). Antes `kr.cur` era un
   número tecleado al lado de la medición; ahora hay un solo lugar donde vive el hecho. */
DATA.objetivos.forEach(o=>{ o.salud=objSalud(o); o.kr=o.krs[0]; });
/* v19 · el objetivo (y su meta de directorio) desde un KR — el hilo ya no ancla al objetivo entero
   sino al CONTRATO, así que todo lo que antes leía `.obj` ahora sube por el KR (A2 · D-35). */
const objDeKr=krid=>{ const R=krid&&krById(krid); return R?R.obj:null; };
const raizDe=o=>{ let x=o; while(x&&x.parent) x=byId(DATA.objetivos,x.parent); return x; };
const objRaizDeKr=krid=>{ const o=objDeKr(krid); return o?raizDe(o):null; };
/* ¿el hilo de este KR pasa por el objetivo `oid`? Cuenta el objetivo dueño del contrato Y toda su
   línea hacia arriba: encender la meta del directorio debe encender lo que la sostiene, que es
   justo lo que la bajada agregó (antes el hilo era plano y esta pregunta no existía). */
function hiloTocaObj(krid,oid){ let o=objDeKr(krid);
  while(o){ if(o.id===oid) return true; o=o.parent?byId(DATA.objetivos,o.parent):null; }
  return false; }
const hiloTocaAp=(krid,a)=>a.objetivos.some(oid=>hiloTocaObj(krid,oid));
const kpisByProc=id=>DATA.kpis.filter(k=>k.proc===id);
const krowHTML=k=>{ const s=semaforo(k), c=kcur(k);
  return `<button class="krow" data-k="${k.id}"><span class="kd" style="background:${SEMC[s]}"></span><span class="kn">${k.nm}${k.stale?' ⌛':''}</span><span class="kv">${c==null?'s/d':c+(k.unidad||'')} → ${k.banda.target}${k.unidad||''}</span></button>`; };
/* lente personas: ocupante del rol por scan de líderes + extras (vacante = delatada, no inventada) */
/* ===== D-19 · puesto ≠ rol — PUESTOS se DERIVA de la nómina; los pares rol×proceso, del wiring =====
   persona ─ocupa→ PUESTO ─agrega→ ROL ─carril/RACI→ ACTIVIDAD ⊂ PROCESO (CK-30).
   "los procesos de un rol" = posee (dueño_ref) ∪ ejecuta (carril ∨ raci.R); C/I no genera. */
const coreNm=s=>String(s).replace(/\s*\(vacante\)/i,'');
const PUESTOS=(()=>{ const M=new Map();
  const get=(nm,area)=>{ const k=coreNm(nm); if(!M.has(k))M.set(k,{nm:k, area:area||null, lider:false, vac:false, reporta_a:null, pares:[]});
    const p=M.get(k); if(area&&!p.area)p.area=area; return p; };
  DATA.areas.forEach(a=>{ get(a.lider.split(' · ')[1],a.id).lider=true; });
  DATA.personasExtra.forEach(x=>get(x.puesto,x.area));
  DATA.procesos.forEach(pr=>{ const p=get(pr.dueno,pr.areas[0]); if(/vacante/i.test(pr.dueno))p.vac=true;
    p.pares.push({rol:coreNm(pr.dueno), proc:pr.id, via:'posee'}); });
  [DATA.flagship,...Object.values(DATA.lienzos)].forEach(l=>l.lanes.forEach(ln=>{ const p=get(ln.role);
    const ex=p.pares.find(x=>x.proc===l.proc);
    if(ex) ex.via='posee+ejecuta'; else p.pares.push({rol:coreNm(ln.role), proc:l.proc, via:'ejecuta'}); }));
  M.forEach(p=>{ const a=byId(DATA.areas,p.area); if(!a)return;
    if(p.lider){ const par=a.parent&&byId(DATA.areas,a.parent); p.reporta_a=par?par.lider.split(' · ')[1]:null; }
    else p.reporta_a=a.lider.split(' · ')[1]; });
  return [...M.values()];
})();
DATA.puestosTotal=PUESTOS.length;   // D-19: deja de ser constante — conteo AUDITABLE de la entidad puesto
const puestoByNm=nm=>PUESTOS.find(p=>p.nm===coreNm(nm));
const puestoOcupantes=nm=>{ const core=coreNm(nm); const out=[];
  DATA.areas.forEach(a=>{ const [q,r]=a.lider.split(' · '); if(r===core) out.push(q); });
  DATA.personasExtra.forEach(x=>{ if(x.puesto===core) out.push(x.nm); }); return out; };
const puestoOcupante=nm=>{ const p=puestoByNm(nm); const occs=puestoOcupantes(nm);
  return { nm:coreNm(nm), vac:!!(p&&p.vac)||/vacante/i.test(String(nm)), quien:occs[0]||null }; };
const sipocRefChip=r=>r.proc?`<span class="chip lk" data-proc="${r.proc}">${byId(DATA.procesos,r.proc).nm} ›</span>`:`<span class="chip" title="actor externo">${r.ext} · ext</span>`;

/* ===== CK-30/D-20 · arnés = REGISTRO por rol×proceso — estado/drift DERIVADOS del hash ===== */
const sisByName=n=>DATA.sistemas.find(s=>s.nm===n);
const TWIN_HASH=DATA.twinHash;
const arnesEstado=h=>h.suspendido?'suspendido':(h.hash_fuente!==TWIN_HASH?'desactualizado':'vigente');
const arnesDe=(rol,proc)=>DATA.arneses.find(h=>h.deriva_de.rol===coreNm(rol)&&h.deriva_de.proceso===proc);
const rosterDe=pu=>DATA.arneses.filter(h=>h.deriva_de.puesto===coreNm(pu));
const paresDe=pu=>{ const p=puestoByNm(pu); return p?p.pares:[]; };
const harnBadge=h=>h?`<span class="harn ${arnesEstado(h)==='desactualizado'?'stale':''}" data-h="${h.id}" title="arnés compilado del twin — ${arnesEstado(h)}">⛨ arnés ${h.v}${arnesEstado(h)==='desactualizado'?' ⚠':''}</span>`
  :`<span class="harn none" title="rol×proceso sin arnés — candidato Arnesia">sin arnés</span>`;
// roster del PUESTO (se ENSAMBLA por puesto — M46): 1 par → badge directo · N pares → ⛨ k/n abre la ficha del puesto
const rosterBadge=pu=>{ const pares=paresDe(pu), hs=rosterDe(pu);
  if(!pares.length) return `<span class="harn none" title="puesto sin proceso mapeado — sin carril declarado">sin mapa</span>`;
  if(!hs.length) return `<span class="harn none" title="ningún rol×proceso del puesto tiene arnés — candidato Arnesia">sin arnés</span>`;
  if(hs.length===1&&pares.length===1) return harnBadge(hs[0]);
  const stale=hs.some(h=>arnesEstado(h)==='desactualizado');
  return `<span class="harn ${stale?'stale':''}" data-pu="${coreNm(pu)}" title="roster del puesto: ${hs.length} de ${pares.length} rol×proceso con arnés">⛨ ${hs.length}/${pares.length}${stale?' ⚠':''}</span>`; };
function setPiel(p){ state.piel=p; document.querySelectorAll('.piel-toggle button').forEach(x=>x.classList.toggle('on',x.dataset.piel===p)); }
function conocimientoHTML(pid){ const c=pid&&DATA.conocimiento[pid];
  return `<div class="dgroup"><div class="gt">Conocimiento — dónde busca el arnés</div>
    ${c?`<div style="font-size:12px;line-height:1.5"><b class="mono" style="color:var(--brand-hi);font-size:10px">${c.n}</b> · ${c.d}</div>`
      :'<div style="font-size:12px;color:var(--tx-faint)">Know-how aún no capturado — brecha de conocimiento.</div>'}
    <div style="font-size:10px;color:var(--tx-faint)">conocimiento/&lt;proceso&gt;/&lt;rol&gt;/ en el repo oficial (N6) · el 3er cuerpo del cerebro — próximamente (F3)</div></div>`; }
/* ===== v14 · capa de ACCIÓN — catálogo kinético con autoridad + aprobación (del schema) =====
   acc: [nivel mínimo (4 dirección · 3 estratégico · 2 táctico · 1 operativo), aprobación, verbo para el historial] */
