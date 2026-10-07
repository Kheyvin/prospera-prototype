/* ancestro de primer nivel (columna del tablero táctico) */
function topArea(id){ let a=byId(DATA.areas,id); while(a&&a.parent&&a.parent!=='a-ger') a=byId(DATA.areas,a.parent); return a; }
/* regla de la reunión de resultados (Falconi): rojo sin proyecto que lo mueva NI brecha con respuesta = sin contramedida */
const sinContra=k=>semaforo(k)==='rojo' && !DATA.proyectos.some(pm=>pm.mueve===k.id || (pm.brecha&&byId(DATA.brechas,pm.brecha).against===k.proc));
const sinContraKpis=()=>DATA.kpis.filter(sinContra);
function gotoNivel(n){ state.mod='territorio'; state.nivel=n; state.insp='home';
  if(n===4){ if(state.escala!=='z2'&&state.escala!=='z3'){ state.lienzo=state.lienzo||DATA.flagship.proc; state.act=null; state.escala='z2'; } }
  else { state.escala='z0'; state.foco=null; }
  if(n===3){ state.area3=null; state.procAmp=null; }   // v21: entrar por el menú = elegir el área (portada-selector)
  render(); }
/* v21 · la sala del área: el nivel 3 DE una gerencia o jefatura. Bajar = traducción con contexto
   (doctrina 2026-07-26): se entra con doble click en el organigrama, desde la ficha del área o
   desde el selector — jamás se aterriza "en el táctico" en abstracto. */
function abrirSala(id){ state.mod='territorio'; state.nivel=3; state.escala='z0'; state.foco=null;
  state.area3=id; state.procAmp=null; state.insp='home'; render(); }
/* v21 · presets del control Niveles (el viejo LOD): "abrir todo hasta N". La expansión fina vive
   por rama (⊕ de cada nodo) — el preset solo es el atajo de mano gruesa. */
function presetNiveles(n){ state.lod=n;
  state.expandidas.clear(); state.puestosOpen.clear();
  if(n>=2) state.expandidas.add('a-ger');
  if(n>=3) kids('a-ger').forEach(a=>{ if(kids(a.id).length) state.expandidas.add(a.id); });
  if(n>=4) DATA.areas.forEach(a=>{ if(kids(a.id).length) state.expandidas.add(a.id); state.puestosOpen.add(a.id); }); }
/* toda acción kinética con aprobación ≠ directa aterriza en la cola de Cambios */
function accion(){ state.mod='cambios'; state.insp='home'; render(); }
/* v20 · el salto de un proceso de DIRECCIÓN a donde se ejerce. El mapa contiene el proceso que produce
   la sala del directorio: desde su casilla se llega al movimiento de la sesión (o al módulo) que lo
   materializa. Sin este salto la banda sería una etiqueta bonita y el nivel 1 seguiría siendo una isla. */
function irTablero(p){ const t=p&&p.tablero; if(!t) return;
  state.insp='home';
  if(t.mod==='territorio'){ gotoNivel(t.nivel); if(t.mov!=null) irMovimiento(t.mov); }
  else { state.mod=t.mod; state.escala='z0'; state.foco=null; render(); } }
/* v18 · saltar a un movimiento de la sesión (la página del directorio es larga a propósito:
   es una agenda, no un tablero de una pantalla). El índice vive en el inspector. */
function irMovimiento(i){ const b=document.querySelectorAll('.pageview .secband')[i]; if(!b) return;
  view.y = -(30 + b.offsetTop - 18)*view.z + 14; clampPagina(); applyView(true); }
/* wiring universal del viaje: cualquier data-* dentro de un contenedor abre su ficha */
function wireLinks(c){
  const W={k:b=>openKpi(byId(DATA.kpis,b.dataset.k)), h:b=>openArnes(byId(DATA.arneses,b.dataset.h)),
    rol:b=>openRol(b.dataset.rol), per:b=>openPersona(b.dataset.per),
    pu:b=>openPuesto(b.dataset.pu), area:b=>openArea(byId(DATA.areas,b.dataset.area)),
    sis:b=>openSistema(sisByName(b.dataset.sis)||byId(DATA.sistemas,b.dataset.sis)),
    obj:b=>openObjetivo(byId(DATA.objetivos,b.dataset.obj)), idea:b=>openIdea(byId(DATA.ideas,b.dataset.idea)),
    cap:b=>openCapability(byId(DATA.capabilities,b.dataset.cap)), proc:b=>openProceso(byId(DATA.procesos,b.dataset.proc)),
    pm2:b=>openProyecto(byId(DATA.proyectos,b.dataset.pm2)), g2:b=>openBrecha(byId(DATA.brechas,b.dataset.g2)),
    ap:b=>openApuesta(byId(DATA.apuestas,b.dataset.ap)),
    /* v18 · gobierno del directorio: cifra · caja · presupuesto · riesgo · acuerdo · inversión · alcance */
    cif:b=>openCifra(byId(DATA.periodo.cifras,b.dataset.cif)), caja:()=>openCaja(),
    pres:()=>openPresupuesto(), alc:()=>openAlcanceContable(),
    rg:b=>openRiesgo(byId(DATA.riesgos,b.dataset.rg)), acu:b=>openAcuerdo(byId(DATA.acuerdos,b.dataset.acu)),
    inv:b=>openInversion(byId(DATA.inversiones,b.dataset.inv)),
    /* v21 · el archivo (documentos y contratos) + el salto a la sala del área */
    doc:b=>openDocumento(byId(DATA.documentos,b.dataset.doc)), sala:b=>abrirSala(b.dataset.sala),
    resp:b=>openRespaldo(b.dataset.resp),
    acc:b=>ejecutarAccion(b) };
  Object.keys(W).forEach(key=>c.querySelectorAll(`[data-${key}]`).forEach(b=>{
    if(b.classList.contains('none'))return;
    b.onclick=e=>{ e.stopPropagation(); W[key](b); };
  }));
  /* autoridad visible: acción fuera del lente actual → atenuada con razón (jamás oculta) */
  c.querySelectorAll('[data-acc]').forEach(b=>{ const a=ACC[b.dataset.acc]; if(!a)return;
    const fuera=RANGO[state.verComo]<a[0];
    b.classList.toggle('na2',fuera); b.title=fuera?('Decide '+NIVAUT[a[0]]+' — tu lente actual no ejecuta esto'):''; });
}

/* profundidad + visibilidad POR RAMA (v21): un área se dibuja si TODA su línea de ancestros está
   expandida. Reemplaza al LOD global — abrir una rama no obliga a abrir el árbol entero. */
function depth(a){ let d=0,x=a; while(x.parent){ x=byId(DATA.areas,x.parent); d++; } return d; }
const isVis=a=>{ let x=a; while(x.parent){ if(!state.expandidas.has(x.parent)) return false; x=byId(DATA.areas,x.parent); } return true; };
function visAncestor(id){ let a=byId(DATA.areas,id); while(a && !isVis(a)) a=byId(DATA.areas,a.parent); return a; }

