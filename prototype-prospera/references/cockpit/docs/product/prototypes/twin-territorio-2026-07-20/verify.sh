#!/usr/bin/env bash
# Suite de verificación del mockup — clicks con HIT-TESTING REAL (elementFromPoint), no element.click().
# Uso: ./verify.sh   → imprime V8SUITE :: OK ... | ERRS=[]  (47/47 esperado — v21: +3 checks de la sala del área, el selector y el organigrama abrir-por-rama)
set -euo pipefail
cd "$(dirname "$0")"
# index.html es GENERADO desde src/ — se reconstruye antes de probar, así la suite
# jamás corre contra una versión rancia (ver build.py).
python3 build.py >/dev/null
TMP=$(mktemp -d)
cp index.html "$TMP/t.html"
cat >> "$TMP/t.html" <<'EOF'

<style>.world.anim{transition:none!important}</style>
<script>
window.addEventListener('error',e=>{(window.__ERRS=window.__ERRS||[]).push(e.message+' @'+e.lineno)});
function mclick(el,dbl){ if(!el) throw new Error('elemento no encontrado');
  el.scrollIntoView({block:'nearest'}); /* scroll = gesto real; el hit-test sigue */
  let r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
  let t=document.elementFromPoint(x,y);
  const ok=q=>q&&(q===el||el.contains(q)||q.contains(el));
  if(!ok(t)){ /* retry 1: re-encuadrar (Chrome nuevo deja el zoom de la piel anterior) */
    try{ fit(false); }catch(e){} el.scrollIntoView({block:'center'});
    r=el.getBoundingClientRect(); x=r.left+r.width/2; y=r.top+r.height/2; t=document.elementFromPoint(x,y); }
  if(!t) throw new Error('nada en el punto');
  if(!ok(t)) throw new Error('intercepta: '+(t.className||t.tagName));
  t.dispatchEvent(new MouseEvent(dbl?'dblclick':'click',{bubbles:true,clientX:x,clientY:y})); }
/* poll hasta que el hit-testing responda (carrera con el primer layout bajo virtual-time).
   Chrome ≥138 bajo virtual-time corre el script ANTES del primer layout → fit() ve stage 0×0 y
   deja view.z negativo. Remedio: si el hit-test no responde, re-render+fit y seguir esperando. */
let wrTries=0;
function whenReady(cb){ const flush=stage.clientWidth; /* leerlo fuerza layout bajo virtual-time */
  const o=document.querySelector('.obj-node');
  if(o){ const r=o.getBoundingClientRect();
    if(r.width>4 && document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)){ cb(); return; } }
  if((++wrTries%3===0||wrTries>6) && flush>0){ try{ render(); fit(false); applyView(false); }catch(e){} }
  document.title='WARMUP::'+wrTries+' stage='+flush;   /* escribir el título bombea layout bajo virtual-time (Chrome ≥138) */
  setTimeout(()=>whenReady(cb),wrTries>6?400:250); }
window.addEventListener('load',()=>{whenReady(()=>{
  const R=[]; const t=(n,f)=>{try{f();R.push('OK '+n);}catch(e){R.push('FAIL '+n+' :: '+e.message);}};
  const A=(c,m)=>{if(!c)throw new Error(m)}; const eye=()=>document.getElementById('inEye').textContent;
  t('objetivo-hilo+ficha',()=>{ mclick(document.querySelector('.obj-node .nm')); A(state.activeObj,'sin hilo'); A(eye().includes('Objetivo'),eye()); });
  t('chevron-ficha',()=>{ mclick([...document.querySelectorAll('.chev .nm')].find(x=>x.textContent.includes('Venta'))); A(eye().includes('Proceso'),eye()); });
  t('dblclick-cobranza-lienzo',()=>{ state.activeObj=null; render();
    mclick([...document.querySelectorAll('.chev .nm')].find(x=>x.textContent.includes('Cobranza')),true); A(state.escala==='z2','escala='+state.escala); });
  t('volver+soporte-ficha',()=>{ mclick(document.getElementById('back')); mclick(document.querySelector('.soporte .nm')); A(eye().includes('Proceso'),eye()); });
  t('rolchip-puesto',()=>{ mclick(document.querySelector('.rolchip')); A(eye().includes('Puesto'),eye()); });
  t('sysplat-sistema',()=>{ mclick(document.querySelector('.sysplat')); A(eye().includes('Sistema'),eye()); });
  t('pin-brecha',()=>{ mclick(document.querySelector('.pin .body')); A(eye().includes('Brecha'),eye()); });
  t('piel-org+ficha-area',()=>{ mclick(document.querySelector('[data-piel=org]'));
    mclick([...document.querySelectorAll('.area-node .nm')].find(x=>x.textContent==='Finanzas')); A(eye().includes('Área'),eye()); A(state.escala==='z0','no debía drillear: '+state.escala); });
  t('org-dblclick-drill',()=>{ /* v21 (firma D): doble click en un área BAJA a su sala (nivel 3); el foco z1 quedó como acción de la ficha */
    mclick([...document.querySelectorAll('.area-node .nm')].find(x=>x.textContent==='Finanzas'),true);
    A(state.nivel===3&&state.area3==='a-fin','dblclick no abrió la sala: nivel='+state.nivel+' area3='+state.area3);
    A(document.querySelector('.salahd'),'la sala no pintó su cabecera');
    gotoNivel(2); setPiel('org'); render(); fit(false); });
  t('z1-foco-valor',()=>{ /* v13 firmado 2026-07-26: z1 = el MISMO mapa de valor con foco, no un mundo aparte */
    drillArea('a-tes'); A(state.escala==='z1','escala='+state.escala);
    A(document.querySelector('.chev'),'sin cadena en z1 (mundo aparte revivido?)');
    const lit=document.querySelectorAll('.node.foco,.soporte.foco'); A(lit.length>=3,'foco='+lit.length);
    A(document.querySelectorAll('.node.vecino').length>=1,'sin vecinos de cadena a media luz');
    A(document.querySelectorAll('.node.dim,.soporte.dim').length>=8,'el resto no es fantasma');
    const np=document.querySelectorAll('.pin').length; A(np>=1&&np<=5,'pins fuera de foco: '+np); });
  t('org-nivel4-puestos',()=>{ mclick(document.getElementById('back')); mclick(document.querySelector('[data-lod="4"]'));
    const pr=[...document.querySelectorAll('.prow')]; A(pr.length>=30,'prows='+pr.length);
    const one=pr.find(x=>{const r=x.getBoundingClientRect();return r.top>0&&r.bottom<innerHeight&&r.left>0&&r.right<innerWidth&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);});
    A(one,'sin prow visible'); mclick(one); A(eye().includes('Puesto'),eye());
    mclick(document.querySelector('[data-lod="3"]')); });
  t('capa-trabajo-valor',()=>{ state.escala='z0'; state.foco=null; state.lod=3; setPiel('valor'); render(); fit(false);
    mclick(document.querySelector('[data-capa=trabajo]'));
    const hb=[...document.querySelectorAll('.rolchip .harn[data-h]')].find(x=>{ const r=x.getBoundingClientRect();
      return r.top>0&&r.bottom<innerHeight&&r.left>0&&r.right<innerWidth&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); });
    A(hb,'sin arnés VISIBLE en gente'); mclick(hb); A(eye().includes('Arnés'),eye());
    A(document.getElementById('inBody').innerHTML.includes('deriva_de'),'registro sin deriva_de');
    A(document.getElementById('inBody').innerHTML.includes('mecanismo')||document.querySelector('#inBody .grchip'),'sin guardrails con mecanismo'); });
  t('roster-contador',()=>{ openPuesto('Contador General');
    const body=document.getElementById('inBody'); A(eye().includes('Puesto'),eye());
    A(body.querySelectorAll('.harn').length>=4,'roster corto: '+body.querySelectorAll('.harn').length);
    A(body.innerHTML.includes('sin arnés'),'el gap del roster no se ve'); });
  t('ficha-area-navegable',()=>{ openArea(byId(DATA.areas,'a-tes'));
    const body=document.getElementById('inBody'); A(eye().includes('Área'),eye());
    A(body.querySelectorAll('[data-pu]').length>=3,'sin puestos navegables');
    A(body.querySelectorAll('[data-proc]').length>=3,'sin procesos navegables'); });
  t('salud-lente-conf',()=>{ const b=[...document.querySelectorAll('.sub-t')].find(x=>x.textContent.includes('Confianza')); mclick(b);
    A(state.sub==='conf','sub='+state.sub); const lg=document.querySelector('.sub-leg[data-leg=conf]'); A(lg&&lg.offsetParent,'leyenda conf no visible'); A(lg.textContent.includes('Sólido'),'leyenda vacía'); });
  t('ficha-sipoc+nav',()=>{ state.escala='z0'; state.foco=null; setPiel('valor'); render(); fit(false);
    mclick([...document.querySelectorAll('.chev .nm')].find(x=>x.textContent.includes('Venta')));
    const body=document.getElementById('inBody'); A(body.innerHTML.includes('SIPOC'),'sin SIPOC en ficha');
    const up=[...body.querySelectorAll('[data-proc]')].find(x=>x.textContent.includes('Campañas')); A(up,'sin proveedor navegable');
    mclick(up); A(document.getElementById('inTitle').textContent.includes('Campañas'),'nav SIPOC rota'); });
  t('lienzo-vta',()=>{ state.escala='z0'; setPiel('valor'); render(); fit(false);
    mclick([...document.querySelectorAll('.chev .nm')].find(x=>x.textContent.includes('Venta')),true);
    A(state.escala==='z2'&&state.lienzo==='p-vta','lienzo='+state.lienzo); A(document.body.textContent.includes('caseta'),'sin carril caseta'); });
  t('lienzo-stub-honesto',()=>{ mclick(document.getElementById('back'));
    mclick([...document.querySelectorAll('.soporte')].find(x=>x.textContent.includes('Nómina')),true);
    A(state.escala==='z2'&&state.lienzo==='p-nom','lienzo='+state.lienzo); A(document.body.textContent.includes('SIN LEVANTAR'),'sin banner honesto'); });
  t('z2-puertos-sipoc',()=>{ mclick(document.getElementById('back'));
    mclick([...document.querySelectorAll('.chev .nm')].find(x=>x.textContent.includes('Cobranza')),true);
    A(state.escala==='z2','escala='+state.escala); const pb=document.querySelectorAll('.portbox'); A(pb.length===2,'puertos='+pb.length);
    const up=[...document.querySelectorAll('.portbox [data-proc]')].find(x=>x.textContent.includes('Facturación')); A(up,'sin proveedor navegable');
    A(document.body.textContent.includes('Propósito'),'sin C1 en header'); });
  t('z3-instruccion',()=>{ const act3=[...document.querySelectorAll('.act')].find(x=>x.textContent.includes('Contactar')); A(act3,'sin act 03');
    mclick(act3,true); A(state.escala==='z3'&&state.act.ord===3,'act='+JSON.stringify(state.act));
    A(document.querySelectorAll('.tarea').length>=4,'tareas='+document.querySelectorAll('.tarea').length);
    A(document.querySelectorAll('.scorebar').length===2,'sin dos scores M36'); });
  t('z3-flujo-salta',()=>{ const fl=[...document.querySelectorAll('.z3card .loop-it')].find(x=>x.textContent.includes('mora dura')); A(fl,'sin flujo alterno');
    mclick(fl); A(state.escala==='z3'&&state.act.ord===4,'salto roto: '+JSON.stringify(state.act)); });
  t('z3-piso-arnes',()=>{ state.act={pid:'p-cob',ord:3}; render();
    const hb=document.querySelector('.piso-arnes .harn[data-h]'); A(hb,'piso sin arnés');
    mclick(hb); A(eye().includes('Arnés'),eye()); });
  t('z3-back-escalera',()=>{ mclick(document.getElementById('back')); A(state.escala==='z2','back z3→z2 roto: '+state.escala);
    mclick(document.getElementById('back')); A(state.escala==='z0','back z2→z0 roto: '+state.escala); });
  t('rolchip-headcount',()=>{ state.nivel=2; state.escala='z0'; state.act=null; setPiel('valor'); render(); fit(false); const rc=[...document.querySelectorAll('.rolchip .who')].find(x=>/\+\d/.test(x.textContent)); A(rc,'sin headcount ×N en gente'); });
  t('nivel1-directorio',()=>{ gotoNivel(1); A(document.body.textContent.includes('Sala del directorio'),'sin sala');
    A(document.querySelectorAll('.apcard').length>=4,'apuestas='+document.querySelectorAll('.apcard').length);
    A(document.body.textContent.includes('Espera tu decisión'),'sin bandeja'); });
  t('nivel1-varas',()=>{ /* v15: las varas del directorio — rumbo · mezcla de ambición · pares · contraste apetito · escalera
      · v16: rumbo = north-star de 3 renglones (NACD/exception-based reporting) — catchball migra a bandeja,
      dimensión ciega queda SOLO en Alertas (cero repetición del mismo hecho en 2 lugares) */
    gotoNivel(1);
    A(document.querySelector('.rumbo'),'sin banda rumbo');
    A(document.querySelectorAll('.rumbo .brk').length===2,'rumbo sin 2 breakthroughs (meter)');
    A(document.querySelectorAll('.rumbo .brk svg').length===2,'breakthroughs sin gráfico de progreso (meter SVG)');
    A(!document.querySelector('.rumbo').textContent.includes('bajada acordada'),'catchball no debería re-narrarse en rumbo (vive en bandeja)');
    A(document.body.textContent.includes('Cerrar el acuerdo de bajada con Comercial'),'bajada sin acordar no llega a la bandeja (D-35)');
    A(/Bajar «.*» a una gerencia/.test(document.body.textContent),'meta del directorio sin bajar no llega a la bandeja (D-35)');
    A(document.body.textContent.includes('ninguna meta del ciclo la mide'),'dimensión ciega desapareció (debe seguir en Alertas)');
    A(document.querySelectorAll('.mixbar .seg').length===3,'segs='+document.querySelectorAll('.mixbar .seg').length);
    A(document.querySelectorAll('.mixmark').length>=2,'sin marcas de mezcla objetivo');
    /* v19 (K23): los rangos de pares NO se afirman en el tablero. La vara externa vive en la ficha del
       indicador, sale del eje vertical (nichos/*.yaml) y hereda su confianza: si la unidad dice
       `hipotesis`, se muestra la CONDICIÓN, no un rango inventado. */
    A(!document.querySelector('.peer'),'volvió un rango de pares afirmado en el tablero (K23)');
    A(typeof DATA.peers==='undefined','DATA.peers revivió — la vara sale del nicho, no de la pantalla');
    openKpi(byId(DATA.kpis,'k-abs'));
    A(document.getElementById('inBody').textContent.includes('1.7 %/mes'),'la vara con fuente (N-IMM-02) no se muestra');
    openKpi(byId(DATA.kpis,'k-dso'));
    A(/sin vara comparable/.test(document.getElementById('inBody').textContent),'DSO afirma un rango que el método prohíbe afirmar');
    state.insp='home'; inspectorHome(); gotoNivel(1);
    A(Object.values(DATA.nicho).every(u=>u.rango?u.fuente&&u.conf:u.cond&&u.cond.length>40),
      'una unidad de nicho sin fuente (si afirma rango) o sin condición (si no la afirma)');
    const apx=document.querySelector('.apcards').textContent;
    A(/excede tu apetito/.test(apx),'sin contraste riesgo↔apetito en apuestas');
    A(/sin definir — fíjalo/.test(apx),'apetito sin definir no se muestra en la apuesta');
    A(/mezcla de ambición/i.test(document.body.textContent),'sin firma de mezcla en bandeja');
    const rail=document.getElementById('inBody');
    A(/aguanta la ambición/i.test(rail.textContent),'rail sin escalera de madurez');
    A(rail.querySelectorAll('.madrow').length===5,'madrow='+rail.querySelectorAll('.madrow').length);
    A(![...document.querySelectorAll('.rumbo,.dpane,.apcard')].some(e=>/\bM\d{2}\b/.test(e.textContent)),'token M-NN visible en nivel 1'); });
  t('nivel1-apuesta-plata',()=>{ /* v15.1 (auditoría del operador): la promesa FinOps del respaldo se CUMPLE en superficie */
    gotoNivel(1);
    A(/persigue .*S\//.test(document.querySelector('.apcards').textContent),'apuestas sin plata en tarjeta');
    openApuesta(DATA.apuestas[1]);
    const fb=document.getElementById('inBody').textContent;
    A(fb.includes('Valor que persigue'),'ficha sin valor en dinero');
    A(fb.includes('Supuesto visible'),'valor sin supuesto');
    A(/excede|al límite|dentro del apetito|sin definir/.test(fb),'ficha sin contraste riesgo↔apetito');
    A(fb.includes('Apostamos'),'ficha sin apetito de apuesta (tiempo·tope)');
    const pane=[...document.querySelectorAll('.dpane')].find(d=>d.textContent.includes('Proyectos que el directorio sigue'));
    A(pane,'el panel de portafolio del directorio no existe');
    const rows=[...pane.querySelectorAll('.cambio-row')];
    A(rows.length>=1&&rows.length<DATA.proyectos.length+1,'portafolio filas='+rows.length);
    A(/sube porque/.test(pane.textContent),'una fila del portafolio no declara POR QUÉ sube al directorio');
    A(/esperar: S\//.test(rows[0].textContent),'portafolio sin costo de esperar');
    A(rows[0].textContent.includes('Marina')&&rows[2].textContent.includes('exprés'),'portafolio no ordenado por costo de esperar (cerrado al final)');
    state.insp='home'; inspectorHome(); });
  t('metodo-vocabularios',()=>{ /* v15.2 (D-23): el módulo Método explica los valores posibles y su significado */
    state.mod='metodo'; state.insp='home'; render();
    const tx=document.body.textContent;
    ['por sellar','sellada','cumplida','retirada','re-apostar','operar el hoy','expandir','apostar al futuro']
      .forEach(v=>A(tx.includes(v),'vocabulario sin valor: '+v));
    A(tx.includes('re-versionando')||tx.includes('re-versiona'),'re-apostar sin doctrina de re-versión');
    A(tx.includes('NOVEDAD'),'bolsas sin regla de clasificación por novedad');
    A(tx.includes('61 M-cards')||tx.includes('59 M-cards'),'conteo de cartas desincronizado del catálogo');
    A(tx.includes('21 entidades'),'conteo de entidades sin D-38 (el archivo)');
    state.mod='territorio'; render(); });
  t('a4-a6-salud-prov',()=>{ /* v17.2: salud del objetivo DERIVADA (A4.1) + provenance en TODAS las fichas (A6 a+b) */
    A(DATA.objetivos.every(o=>krsDe(o).every(k=>k.esperado!=null)),'KR sin esperado');
    A(DATA.objetivos.every(o=>o.salud===objSalud(o)),'salud no coincide con la derivación');
    const okN=objRaiz().filter(o=>o.salud==='verde').length; A(okN===1,'narrativa cambió: metas del directorio en verde='+okN);
    openObjetivo(byId(DATA.objetivos,'o-caja'));
    A(document.getElementById('inBody').textContent.includes('esperado a hoy'),'ficha objetivo sin esperado');
    [()=>openObjetivo(DATA.objetivos[0]),()=>openBrecha(byId(DATA.brechas,'g-dso')),()=>openProyecto(byId(DATA.proyectos,'pm-cie')),
     ()=>openRol('Jefe de Cobranza'),()=>openPersona('Lucía Cárdenas Vidal'),()=>openSistema(byId(DATA.sistemas,'s-exc')),
     ()=>openIdea(byId(DATA.ideas,'i-wsp')),()=>openCapability(byId(DATA.capabilities,'c-caja')),()=>openEmpresa()]
      .forEach((f,i)=>{ f(); A(document.getElementById('inBody').textContent.includes('Procedencia'),'ficha sin procedencia #'+i); });
    state.insp='home'; inspectorHome(); });
  t('ficha-objetivo-arriba',()=>{ /* v17.1: el hilo no se corta hacia arriba — ficha objetivo linkea su apuesta */
    openObjetivo(byId(DATA.objetivos,'o-cob'));
    let b=document.getElementById('inBody');
    A(b.textContent.includes('Hacia arriba'),'ficha sin grupo hacia arriba');
    const aplinks=b.querySelectorAll('[data-ap]'); A(aplinks.length===2,'o-cob debe linkear 2 apuestas: '+aplinks.length);
    mclick(aplinks[0]); A(eye().includes('Apuesta'),eye());
    openObjetivo(byId(DATA.objetivos,'o-eq'));
    A(document.getElementById('inBody').textContent.includes('ninguna apuesta'),'objetivo sin apuesta no lo dice (honestidad)');
    state.insp='home'; inspectorHome(); });
  t('v21-nivel3-selector',()=>{ /* v21: el táctico entra ELIGIENDO el área — portada-selector con resumen twin */
    gotoNivel(3); A(!state.area3,'entrar por el menú debe caer en el selector');
    const pv=document.querySelector('.pageview'); A(pv,'portada no es página');
    A(document.querySelectorAll('.selcard').length>=6,'selcards='+document.querySelectorAll('.selcard').length);
    A(pv.textContent.includes('Elige el área'),'la portada no pide elegir');
    A(document.querySelectorAll('.selcard .jef').length>=4,'sin jefaturas navegables en las tarjetas');
    A(pv.textContent.includes('puestos')&&pv.textContent.includes('documentos')||pv.textContent.includes('docs'),'la tarjeta no resume el TWIN del área (puestos·procesos·docs)');
    A(pv.textContent.includes('contramedida'),'sin regla de contramedida');
    /* jefatura → SU sala (la sala existe por gerencia Y por jefatura) */
    mclick([...document.querySelectorAll('.selcard .jef')].find(x=>x.textContent.includes('Tesorería')));
    A(state.area3==='a-tes','la jefatura no abrió su sala: '+state.area3);
    A(document.querySelector('.salahd'),'sala de jefatura sin cabecera');
    gotoNivel(3);
    mclick([...document.querySelectorAll('.selcard')].find(c=>c.textContent.includes('Finanzas')).querySelector('.hd'));
    A(state.area3==='a-fin','la tarjeta no abrió la sala de la gerencia');
    gotoNivel(2); });
  t('respaldo-capa',()=>{ /* v14.3/.4: capa Respaldo del método — cita en cabecera + ficha, en TODOS los niveles */
    gotoNivel(1); mclick(document.querySelector('[data-capa=respaldo]'));
    const bs=document.querySelectorAll('[data-resp]'); A(bs.length>=9,'citas n1='+bs.length);
    openRespaldo('dir-cambio30'); A(eye().includes('Respaldo'),eye());
    A(document.getElementById('inBody').textContent.includes('revisión por la dirección'),'ficha sin fuente común');
    A(document.getElementById('inBody').innerHTML.includes('M16'),'ficha sin código de procedencia');
    gotoNivel(3); A(document.querySelectorAll('[data-resp]').length>=5,'nivel 3 sin citas');
    gotoNivel(2); A(document.querySelectorAll('[data-resp]').length>=5,'bandas nivel 2 sin citas');
    setPiel('org'); render(); A(document.querySelector('[data-resp="org-estructura"]'),'organigrama sin cita'); setPiel('valor');
    state.lienzo='p-cob'; state.escala='z2'; render(); A(document.querySelector('[data-resp="z2-flujograma"]'),'z2 sin cita');
    state.act={pid:'p-cob',ord:3}; state.escala='z3'; render();
    A(document.querySelectorAll('[data-resp]').length>=4,'z3 sin citas');
    A([...document.querySelectorAll('.z3card .gt,.piso-arnes')].every(c=>!/M2[35]|M39|M46/.test(c.textContent)),'token M-NN sigue visible en z3');
    state.mod='metodo'; state.insp='home'; render(); A(document.querySelectorAll('[data-resp]').length>=3,'Método sin citas');
    state.mod='cambios'; render(); A(document.querySelectorAll('[data-resp]').length>=3,'Cambios sin citas');
    state.mod='territorio'; state.escala='z0'; state.act=null; render();
    /* v14.5: pie de respaldo automático en TODA ficha de entidad (costura openDrawer) */
    openKpi(DATA.kpis[0]); A(document.querySelector('#inBody .resp-foot [data-resp]'),'ficha kpi sin pie de respaldo');
    openObjetivo(DATA.objetivos[0]); A(document.querySelector('#inBody .resp-foot [data-resp]'),'ficha objetivo sin pie');
    openPuesto('Contador General'); A(document.getElementById('inBody').querySelectorAll('[data-resp]').length>=2,'puesto: pie + roster esperados');
    mclick(document.querySelector('[data-capa=respaldo]'));
    openKpi(DATA.kpis[0]); A(!document.querySelector('#inBody [data-resp]'),'ficha apagada sigue citando');
    state.insp='home'; render();
    A(!document.querySelector('[data-resp]'),'apagada sigue pintando'); gotoNivel(2); });
  t('v17-auditoria-director',()=>{ /* v17: mejoras de la auditoría con ojos de director — jerga fuera de superficie,
      acciones que explican su destino, diff de corrida EN el lienzo, pulso clickeable, selector nivel 4 */
    state.mod='mejora'; state.insp='home'; render();
    const pv=document.querySelector('.pageview');
    ['funil','money shot','rankeadas','in-tool','en vuelo','tollgate'].forEach(w=>A(!pv.textContent.toLowerCase().includes(w),'jerga viva en Mejora: '+w));
    openProyecto(byId(DATA.proyectos,'pm-mar'));
    const fb=document.getElementById('inBody').textContent;
    A(!/tollgate|MASP/i.test(fb),'jerga viva en ficha proyecto');
    A(fb.includes('Avanzar de fase'),'sin acción avanzar de fase');
    A(fb.includes('ROI'),'ROI sin etiqueta en ficha');
    const n0=SOLICITUDES.length;
    ejecutarAccion({dataset:{acc:'avanzar-tollgate'},classList:{}});
    A(SOLICITUDES.length===n0+1,'la acción no creó solicitud');
    A(document.getElementById('toast').textContent.includes('responsable del proceso'),'toast genérica sin destino');
    A(document.querySelector('#toast .tlink'),'toast sin link a la cola de Cambios');
    state.mod='cambios'; state.insp='home'; render();
    A(document.body.textContent.includes('EN COLA · recién enviada'),'la solicitud no aparece en la cola de Cambios');
    state.mod='territorio'; state.nivel=2; state.escala='z0'; state.insp='home'; render();
    const dot=document.querySelector('.pulso-dots i[data-obj]'); A(dot,'pulso sin punto clickeable');
    A(dot.title.length>25&&dot.title.includes('meta'),'punto del pulso sin meta/valor en el title');
    state.corrida=true; drillLienzo('p-cob');
    A(document.querySelector('.act.ghost'),'corrida sin actividad fantasma en el lienzo');
    state.corrida=false;
    gotoNivel(4); A(document.getElementById('procSel'),'nivel 4 sin selector de proceso');
    gotoNivel(2);
    A(document.getElementById('back').title.length>10,'Big picture deshabilitado sin explicación');
    gotoNivel(1); A(document.querySelector('.search').title.length>10,'búsqueda deshabilitada sin explicación');
    gotoNivel(2); });
  t('v18-directorio-agenda',()=>{ /* v18: la sesión como agenda de 4 movimientos + los 3 bloques de gobierno
      (resultado/caja/inversiones · presupuesto/riesgos/acuerdos/valor cobrado · alcance contable) */
    gotoNivel(1);
    const pv=document.querySelector('.pageview');
    A(document.querySelectorAll('.secband').length===4,'movimientos='+document.querySelectorAll('.secband').length);
    ['¿Cómo nos fue?','¿A dónde vamos?','¿Qué puede impedirlo?','¿Qué decidimos?'].forEach(q=>A(pv.textContent.includes(q),'falta el movimiento: '+q));
    /* movimiento 1 — el resultado del periodo, con variación contra plan y contra el año pasado */
    const tiles=[...document.querySelectorAll('.ftile')]; A(tiles.length===6,'cifras='+tiles.length);
    A(tiles.every(x=>/vs plan/.test(x.textContent)&&/vs año pasado/.test(x.textContent)),'cifra sin referencia (plan/año pasado)');
    A(tiles.every(x=>/año: /.test(x.textContent)),'cifra sin acumulado del año');
    A(pv.textContent.includes('dato preliminar'),'las cifras no declaran su estado de cierre');
    mclick(tiles[0]); A(eye().includes('Cifra'),eye());
    A(document.getElementById('inBody').textContent.includes('reexpresa'),'la ficha de cifra no declara el alcance');
    /* la caja: proyección, piso y resguardos — y la confianza degradada por la vacante */
    A(document.querySelector('.cajasvg svg'),'sin proyección de caja');
    A(cajaBajoPiso()>0,'la casuística de caja bajo el piso se perdió');
    A(pv.textContent.includes('Tesorería está vacante'),'la caja no confiesa quién NO la firma');
    A(/no más de 1\.8|al menos 2\.5/.test(pv.textContent),'sin límites con el banco');
    /* movimiento 2 — la apuesta ya no sólo promete: rinde */
    const apx=document.querySelector('.apcards').textContent;
    A(/cobrado/.test(apx),'apuestas sin valor cobrado (promete y nunca rinde)');
    A(DATA.apuestas.every(a=>'cobrado' in a.valor),'apuesta sin campo de cobro');
    A(/aún no aplica/.test(apx),'la apuesta sin sellar no dice honestamente que no cobró nada');
    A(document.querySelectorAll('.budgrow').length===3,'presupuesto sin las tres bolsas');
    openPresupuesto(); A(eye().includes('Presupuesto'),eye());
    A(document.getElementById('inBody').textContent.includes('sobre S/ 500k'),'sin umbrales de facultades');
    /* movimiento 3 — riesgos contra el apetito · inversiones con avance real vs declarado */
    const rg=[...document.querySelectorAll('.rgrow')]; A(rg.length===6,'riesgos='+rg.length);
    A(rg.some(x=>/por encima del apetito/.test(x.textContent)),'ningún riesgo se contrasta contra la vara');
    openRiesgo(byId(DATA.riesgos,'r-caj'));
    A(eye().includes('Riesgo'),eye());
    A(document.getElementById('inBody').textContent.includes('probabilidad × impacto'),'nivel de riesgo sin derivación declarada');
    const iv=[...document.querySelectorAll('.invrow')]; A(iv.length===3,'inversiones='+iv.length);
    A(iv[0].textContent.includes('8 pts'),'el desvío avance real vs declarado no se ve');
    openInversion(byId(DATA.inversiones,'iv-mar'));
    A(/valoriza|inflado/.test(document.getElementById('inBody').textContent),'la inversión no conecta con la valorización contable');
    /* movimiento 4 — decisiones de plata (no sólo configurar el modelo) + acuerdos */
    state.insp='home'; render();
    const band=[...document.querySelectorAll('.dpane.solid .cambio-row')].map(x=>x.textContent).join(' ');
    A(/línea de capital de trabajo/.test(band),'la bandeja no tiene decisiones de plata');
    A(/presupuesto del año/.test(band),'la bandeja no pide aprobar el presupuesto');
    A(/límite de endeudamiento|límite de inversión/.test(band),'la decisión no dice por qué le llega al directorio');
    const acu=[...document.querySelectorAll('.acurow')]; A(acu.length===5,'acuerdos='+acu.length);
    A(acu.some(x=>x.textContent.includes('vencido')),'ningún acuerdo vencido — se pierde el punto que abre la sesión');
    openAcuerdo(byId(DATA.acuerdos,'ac-41')); A(eye().includes('Acuerdo'),eye());
    A(document.body.textContent.includes('generar el acta'),'la sesión no cierra en acta');
    /* bloque C — el alcance: enlazar, jamás reexpresar. La norma vive DENTRO de la ficha, nunca en pantalla */
    state.insp='home'; render();
    A(!/NIIF|NIC \d/.test(document.querySelector('.pageview').textContent),'código de norma contable visible en pantalla');
    openAlcanceContable(); const ab=document.getElementById('inBody').textContent;
    A(eye().includes('Alcance'),eye());
    A(/No arma el juego completo/.test(ab),'el alcance no declara lo que NO hace');
    A(/NIIF 15|NIIF 9/.test(ab),'el puente no cita la norma como procedencia');
    A(/avance REAL, no el declarado/.test(ab),'el puente no ancla la valorización al twin');
    /* paralelismo con cualquier industria — visible, no sólo prometido */
    state.insp='home'; render();
    const par=[...document.querySelectorAll('.pageview .paral')]; A(par.length>=6,'líneas de equivalencia='+par.length);
    A(par.filter(x=>/manufactura|retail|banca|servicios|industria/.test(x.textContent)).length>=5,'las equivalencias no nombran otras industrias');
    /* el inspector deja de repetir la página y pasa a ser el índice de la sesión */
    A(document.querySelectorAll('#inBody .loop-it.mov').length===4,'inspector sin índice de movimientos');
    A(!document.getElementById('inBody').textContent.includes('KRs en banda'),'el inspector sigue duplicando el pulso de la página');
    A(document.getElementById('inBody').textContent.includes('aguanta la ambición'),'se perdió la escalera de madurez');
    /* la página es un documento: la rueda RECORRE, no hace zoom.
       (el alto real del canvas lo fija el rAF de pageView — bajo virtual-time se fuerza a mano) */
    setCanvas(1360, document.querySelector('.pageview').offsetHeight+80); fitPagina(false);
    A(state.ch>1800,'la sesión dejó de ser una página larga: ch='+state.ch);
    const z0=view.z, y0=view.y;
    stage.dispatchEvent(new WheelEvent('wheel',{deltaY:400,bubbles:true,cancelable:true}));
    A(view.z===z0,'la rueda hizo zoom sobre un documento');
    A(view.y<y0,'la rueda no recorre la página');
    irMovimiento(3); A(view.y<0,'el salto a un movimiento no mueve la página');
    gotoNivel(2); });

  /* ══ v19 · lo que la auditoría K1-K40 dejó cerrado. Cada check protege una doctrina, no un píxel ══ */
  t('v19-hilo-al-contrato',()=>{ /* A2 · D-34: el KPI mueve un CONTRATO, y el contrato LEE su serie */
    A(DATA.kpis.every(k=>!('obj' in k)),'un KPI sigue anclado al objetivo entero en vez de al KR');
    A(DATA.objetivos.every(o=>krsDe(o).every(k=>!('cur' in k))),'un KR guarda `cur`: el mismo hecho en dos lugares');
    const anclados=DATA.kpis.filter(k=>k.kr);
    A(anclados.every(k=>krById(k.kr)),'un KPI apunta a un contrato que no existe');
    A(anclados.length>=12,'quedaron indicadores sin ancla de más: '+anclados.length);
    /* los pesos de los indicadores de un mismo contrato SUMAN 1 (D-36) */
    const malos=[...new Set(anclados.map(k=>k.kr))].filter(id=>Math.abs(pesoKr(id)-1)>0.001);
    A(!malos.length,'contratos con pesos que no suman 1: '+malos.join(','));
    /* el valor del contrato sale de la serie, no de un número tecleado al lado */
    const kr=krById('o-lid#k1').kr; A(krCur(kr)===kcur(byId(DATA.kpis,'k-mar')),'el contrato no lee su serie');
    /* y los tres sin ancla declaran la brecha que sí los recoge */
    DATA.kpis.filter(k=>!k.kr).forEach(k=>A(k.gap&&byId(DATA.brechas,k.gap),'KPI sin ancla y sin brecha que lo recoja: '+k.id)); });

  t('v19-direccion-y-banda',()=>{ /* D-31: la dirección es dato, no inferencia del orden de la banda */
    A(DATA.kpis.every(k=>k.dir===1||k.dir===-1),'un KPI sin dirección declarada');
    A(DATA.kpis.every(k=>k.banda.amar!=null),'una banda sin ámbar declarado (el ámbar dejaría de ser lo que sobra)');
    const FREQ=['diaria','semanal','mensual','trimestral','por-evento'];
    A(DATA.kpis.every(k=>FREQ.includes(k.freq)),'una frecuencia fuera del enum del esquema');
    /* la prueba dura: una banda donde la inferencia vieja se equivocaba */
    const falso={dir:1,banda:{target:60,amar:30,rojo:8},mediciones:[{f:'x',v:15}]};
    A(semaforo(falso)==='rojo','la banda de más-es-mejor se lee al revés');
    A(semaforo({dir:-1,banda:{target:1,amar:3,rojo:5},mediciones:[]})==='gris','sin dato debe ser gris, jamás rojo'); });

  t('v19-bajada',()=>{ /* D-35: lo que el directorio mira se resuelve en una gerencia, o no se resuelve */
    A(objRaiz().length===5,'metas del directorio='+objRaiz().length);
    A(DATA.objetivos.filter(o=>o.parent).length>=5,'sin bajadas: el nivel 1 no aterriza en nadie');
    A(DATA.objetivos.filter(o=>o.parent).every(o=>o.area&&byId(DATA.areas,o.area)),'una bajada sin gerencia destinataria');
    A(DATA.objetivos.filter(o=>o.parent).every(o=>o.krs[0].acc),'una bajada sin rol que responda');
    A(sinAcordar().length>=1,'se perdió el caso «asignada, no acordada»');
    A(sinBajar().length>=1,'se perdió el caso «meta del directorio sin bajar»');
    A(DATA.objetivos.filter(o=>o.acordado).every(o=>byId(DATA.sesiones,o.acordado)),'un acuerdo de bajada apunta a una sesión inexistente');
    /* el gerente lo encuentra en SU nivel */
    gotoNivel(3); const t3=document.querySelector('.pageview').textContent;
    A(t3.includes('Lo que baja del directorio'),'el nivel táctico no abre con lo que el directorio dejó');
    A(t3.includes('sin acuerdo de bajada'),'la bajada sin acordar no se delata en el nivel del gerente');
    A(/Acuerdos abiertos/.test(t3),'los acuerdos del directorio no llegan al gerente');
    gotoNivel(1); });

  t('v19-madurez-con-vara',()=>{ /* D-32 · D-33: dos escaleras, cada una con su vara y su evidencia */
    A(DATA.areas.every(a=>!('madurez' in a)),'volvió el campo madurez del área (un color no es un nivel)');
    A(madurezArea('a-tes')!=null,'la madurez del área dejó de derivarse de sus capabilities');
    A(madurezArea('a-ger')!=null&&madurezSalud(madurezArea('a-ger')),'rollup de área roto');
    A(DATA.capabilities.every(c=>c.esc==='cobit-0-5'),'una capacidad sin escalera declarada');
    A(capBrecha(byId(DATA.capabilities,'c-permisos'))===null,'sin deseado NO puede haber brecha de madurez');
    A(capBrecha(byId(DATA.capabilities,'c-caja'))===3,'la brecha de madurez no se deriva');
    A(DATA.autoevaluacion.esc==='iso9004-1-5','la escalera del sistema de gestión sin vara declarada');
    A(DATA.autoevaluacion.dims.every(d=>Array.isArray(d.evid)),'una dimensión sin campo de evidencia');
    A(DATA.autoevaluacion.dims.filter(d=>d.evid.length).length>=4,'la autoevaluación no se apoya en el twin');
    A(byId(DATA.sesiones,DATA.autoevaluacion.evaluadaEn),'la autoevaluación no es un acto de gobierno con fecha');
    openCapability(byId(DATA.capabilities,'c-permisos'));
    A(document.getElementById('inBody').textContent.includes('nadie fijó a dónde debería llegar'),'la capacidad sin deseado no lo declara');
    state.insp='home'; inspectorHome(); });

  t('v19-acciones-declaradas',()=>{ /* A5/K34: ninguna acción de la interfaz fuera del catálogo */
    render(); const usadas=new Set();
    ['territorio','mejora','metodo','cambios'].forEach(m=>{ state.mod=m; render();
      document.querySelectorAll('[data-acc]').forEach(b=>usadas.add(b.dataset.acc)); });
    state.mod='territorio'; render();
    [()=>openKpi(byId(DATA.kpis,'k-dso')),()=>openKpi(byId(DATA.kpis,'k-nps')),()=>openObjetivo(byId(DATA.objetivos,'o-hog')),
     ()=>openObjetivo(byId(DATA.objetivos,'o-vis')),()=>openApuesta(DATA.apuestas[0]),()=>openBrecha(byId(DATA.brechas,'g-dso')),
     ()=>openRiesgo(DATA.riesgos[0]),()=>openAcuerdo(DATA.acuerdos[0]),()=>openInversion(DATA.inversiones[0])]
      .forEach(f=>{ f(); document.querySelectorAll('#inBody [data-acc]').forEach(b=>usadas.add(b.dataset.acc)); });
    const huerfanas=[...usadas].filter(a=>!ACC[a]);
    A(!huerfanas.length,'acciones ofrecidas y no declaradas: '+huerfanas.join(','));
    ['bajar-objetivo','acordar-bajada','comprometer-contramedida','verificar-valor-cobrado','cerrar-sesion']
      .forEach(a=>A(ACC[a],'falta en el catálogo la acción '+a));
    state.insp='home'; inspectorHome(); });

  t('v19-alertas-con-destinatario',()=>{ /* K26/K36: una alerta sin quién la resuelve es un reproche */
    gotoNivel(1); const pane=[...document.querySelectorAll('.dpane')].find(d=>d.textContent.includes('Alertas que escalaron'));
    A(pane,'sin panel de alertas');
    const rows=[...pane.querySelectorAll('.cambio-row')];
    A(rows.length>=4,'alertas='+rows.length);
    A(rows.every(r=>r.textContent.includes('lo resuelve')),'una alerta sin destinatario');
    A(pane.textContent.includes('satisfacción del propietario'),'la satisfacción del cliente sigue sin subir al directorio (cl.9.3)');
    /* y las cifras del periodo dicen quién las mueve — incluida la que no tiene a nadie */
    const tiles=[...document.querySelectorAll('.ftile')];
    A(tiles.length===6,'cifras='+tiles.length);
    A(tiles.filter(x=>x.textContent.includes('sin nadie que la mueva')).length===1,'se perdió el caso de la cifra sin destinatario'); });

  /* ===== v20 · las dos bandas nuevas del mapa (D-a/D-37 · D-b · D-c) ===== */
  const volverAlMapa=()=>{ state.mod='territorio'; state.nivel=2; state.escala='z0'; state.foco=null;
    state.activeObj=null; state.insp='home'; setPiel('valor'); render(); fit(false); };
  t('v20-mapa-de-procesos',()=>{ /* el tipo es DATO: 'apoyo' deja de ser el resto y la dirección existe */
    A(DATA.procesos.every(p=>['direccion','negocio','apoyo'].includes(p.tipo)),'un proceso sin tipo declarado');
    const neg=procsTipo('negocio').map(p=>p.id).sort().join(',');
    A(neg===[...DATA.cadena].sort().join(','),'la cadena y los procesos del negocio dejaron de ser el mismo conjunto');
    const dir=procsTipo('direccion');
    A(dir.length>=5,'la franja de dirección quedó corta: '+dir.length);
    A(dir.every(p=>p.produce&&p.tablero&&p.dueno),'un proceso de dirección sin produce/tablero/dueño');
    A(dir.every(p=>!p.sirve.length),'un proceso de dirección entró al hilo de oro — gobierno no es ejecución');
    A(dir.every(p=>(DATA.pasosMini[p.id]||[]).length),'un proceso de dirección sin pasos macro abriría un lienzo en blanco');
    volverAlMapa();
    const chips=[...document.querySelectorAll('.dirchip')];
    A(chips.length===dir.length,'dirchips='+chips.length);
    mclick(chips[0].querySelector('.nm')); A(eye().includes('Proceso'),eye());
    const b=document.getElementById('inBody').textContent;
    A(b.includes('Produce'),'la ficha de dirección no declara qué produce');
    A(b.includes('no que mueve'),'la ficha no explica por qué queda fuera del hilo');
    /* y el salto al tablero donde ese proceso se ejerce — el mapa deja de ser una isla */
    irTablero(byId(DATA.procesos,'p-mej')); A(state.mod==='mejora','el salto al tablero de mejora no ocurrió');
    volverAlMapa(); });
  t('v20-banda-capacidades',()=>{ /* el eslabón meta ↔ proceso, con su cobertura declarada */
    volverAlMapa();
    const ks=[...document.querySelectorAll('.capchip')];
    A(ks.length===DATA.capabilities.length,'capchips='+ks.length);
    A(DATA.capabilities.every(c=>DATA.capCats.includes(c.cat)),'una capacidad fuera del orden de familias declarado');
    A(RESP_TIPO['capacidad'],'la ficha de capacidad perdió su respaldo del método al renombrarse');
    /* qué metas sostiene se DERIVA — incluido el caso deliberado de la que ninguna meta exige */
    A(objsDeCap(byId(DATA.capabilities,'c-cobrar')).some(o=>o.id==='o-caja'),'el derivado meta↔capacidad se rompió (camino 1: el proceso declara driver)');
    A(objsDeCap(byId(DATA.capabilities,'c-caja')).some(o=>o.id==='o-caja'),'el derivado ignora la brecha que bloquea el contrato (camino 2) — falso negativo en la peor brecha del mapa');
    A(objsDeCap(byId(DATA.capabilities,'c-atender')).length===0,'se perdió el caso de la capacidad que ninguna meta exige (su brecha existe pero sin ancla de valor)');
    const vis=ks.find(x=>{const r=x.getBoundingClientRect();
      return r.top>0&&r.bottom<innerHeight&&r.left>0&&r.right<innerWidth&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);});
    A(vis,'sin capacidad visible en el mapa'); mclick(vis); A(eye().includes('Capacidad'),eye());
    A(document.getElementById('inBody').textContent.includes('Metas que se apoyan'),'la ficha no muestra el eslabón meta↔capacidad');
    /* el hueco de cobertura se declara y es navegable — no es un silencio */
    volverAlMapa();
    const h=document.querySelector('.caphueco'); A(h,'el hueco de cobertura no se declara');
    A(procsSinCap().length>0,'sin procesos descubiertos el hueco mentiría');
    mclick(h); A(eye().includes('Cobertura'),eye());
    A(document.getElementById('inBody').textContent.includes('sin capacidad declarada'),'la cobertura no lista los procesos que faltan');
    volverAlMapa(); });
  t('v20-lente-madurez-en-el-mapa',()=>{ /* D-c: mide la DISTANCIA, no el peldaño — y el botón cumple */
    A(brechaSalud(0)==='verde'&&brechaSalud(1)==='ambar'&&brechaSalud(3)==='rojo','la escala de la brecha se invirtió');
    A(madurezProc('p-perm')===null,'un proceso cuya única capacidad no tiene meta no puede teñirse');
    A(madurezArea('a-tes')!=null,'el rollup del área dejó de derivarse de sus capacidades');
    /* el botón del directorio aterriza en el mapa de valor CON la lente encendida (antes caía en digitalización) */
    verMapaPorMadurez();
    A(state.piel==='valor'&&state.nivel===2,'el salto no aterriza en el mapa de valor');
    A(state.capas.has('salud')&&state.sub==='madurez','la lente de madurez no quedó encendida');
    A(procColor(byId(DATA.procesos,'p-caja'))===health.rojo,'la lente de madurez no pinta los procesos del mapa');
    A(procColor(byId(DATA.procesos,'p-perm'))==='#2a3733','pinta de rojo una distancia que nadie fijó');
    const teñidas=[...document.querySelectorAll('.capchip')].filter(x=>x.style.borderColor);
    A(teñidas.length>=6,'la banda de capacidades no responde a la lente: '+teñidas.length);
    document.querySelector('.sub-t[data-sub=digital]').click(); volverAlMapa(); });
  t('v20-hilo-pasa-por-la-capacidad',()=>{ /* la capacidad es una ESTACIÓN del hilo, no una decoración */
    A(capDeProc('p-cob')&&capDeProc('p-cob').id==='c-cobrar','el proceso perdió su capacidad');
    volverAlMapa(); const antes=document.querySelectorAll('.edges path').length;
    state.activeObj='o-caja'; render(); fit(false);
    A(document.querySelectorAll('.capchip.hot').length>=1,'encender una meta no enciende la capacidad que la sostiene');
    A(document.querySelectorAll('.edges path').length>=antes,'el hilo perdió aristas al pasar por la capacidad');
    A(document.querySelectorAll('.capchip.dim').length>=1,'encender una meta no apaga las capacidades ajenas');
    state.activeObj=null; volverAlMapa(); });

  /* ══ v21 · abrir-y-empujar + la sala del área (firmas A-E 2026-08-01) ══ */
  t('v21-organigrama-abrir-rama',()=>{ /* la visibilidad es POR RAMA: abrir/plegar un nodo corre a sus vecinos — jamás LOD global */
    state.mod='territorio'; gotoNivel(2); setPiel('org'); presetNiveles(3); render(); fit(false);
    A(document.querySelectorAll('.area-node').length===14,'preset 3 debía mostrar las 14: '+document.querySelectorAll('.area-node').length);
    const xOpe0=byId(DATA.areas,'a-ope').x;
    const rama=()=>[...document.querySelectorAll('[data-rama]')].find(b=>b.closest('.node').textContent.includes('Finanzas'));
    A(rama(),'Finanzas sin manija de rama'); mclick(rama());
    A(document.querySelectorAll('.area-node').length===12,'plegar la rama no ocultó a sus hijas');
    A(byId(DATA.areas,'a-ope').x!==xOpe0,'plegar no corrió a las vecinas (el layout no fluye)');
    mclick(rama());
    A(document.querySelectorAll('.area-node').length===14,'abrir la rama no la devolvió');
    /* la nómina se abre POR NODO y empuja la fila de abajo */
    const yTes0=byId(DATA.areas,'a-tes').y;
    mclick([...document.querySelectorAll('[data-nomina]')].find(b=>b.closest('.node').textContent.includes('Finanzas')));
    A(state.puestosOpen.has('a-fin'),'la nómina no abrió');
    const finNode=[...document.querySelectorAll('.node')].find(n=>n.querySelector('.nm')&&n.querySelector('.nm').textContent==='Finanzas');
    A(finNode.querySelectorAll('.prow').length>=2,'sin puestos en el nodo abierto');
    A(document.querySelectorAll('.prow').length===finNode.querySelectorAll('.prow').length,'la nómina abrió en nodos que nadie abrió');
    A(byId(DATA.areas,'a-tes').y>yTes0,'abrir la nómina no empujó la fila de abajo');
    presetNiveles(3); render(); });
  t('v21-sala-del-area',()=>{ /* el twin del área: bajada · plan · estructura · procesos con abrir-en-su-lugar · sistemas · archivo */
    abrirSala('a-fin');
    const pv=document.querySelector('.pageview'); A(pv&&document.querySelector('.salahd'),'sala sin página/cabecera');
    A(document.querySelectorAll('.sbaj').length>=2,'bajadas del área='+document.querySelectorAll('.sbaj').length);
    A(document.querySelectorAll('.ruta').length>=2,'el plan no dibuja la ruta meta→proceso→compromiso');
    A(pv.textContent.includes('La reunión va a preguntar'),'sin el bloque de lo que la reunión va a preguntar');
    A(document.querySelectorAll('.scard').length>=3,'estructura corta: '+document.querySelectorAll('.scard').length);
    A(pv.querySelector('.pocc.vc')||pv.textContent.includes('vacante'),'la vacante de Tesorería no se ve en la estructura');
    A(document.querySelectorAll('.pcard').length>=7,'procesos del área='+document.querySelectorAll('.pcard').length);
    /* abrir el proceso EN SU LUGAR: se agranda, trae carriles y EMPUJA lo de abajo */
    const cardCob=[...document.querySelectorAll('.pcard')].find(c=>c.textContent.includes('Cobranza de cuotas')); A(cardCob,'sin tarjeta de cobranza');
    /* medir en coordenadas de LAYOUT (offset*), no de viewport: el encaje de la página (rAF) corre
       en paralelo y un rect de viewport compararía dos encuadres distintos, no el empuje real */
    const w0=cardCob.offsetWidth, yArch0=document.querySelector('.sarch').offsetTop;
    mclick(cardCob.querySelector('[data-amp]'));
    const amp=document.querySelector('.pcard.amp'); A(amp,'⊕ abrir no abrió en su lugar');
    A(amp.querySelectorAll('.lane').length>=3,'el proceso abierto no trae sus carriles (roles)');
    A(amp.querySelectorAll('.lact').length>=5,'sin actividades en los carriles');
    A(amp.offsetWidth>w0*1.8,'abrir no agrandó el bloque');
    A(document.querySelector('.sarch').offsetTop>yArch0,'abrir no empujó las bandas de abajo');
    mclick(amp.querySelector('[data-amp]')); A(!document.querySelector('.pcard.amp'),'⊖ plegar no plegó');
    /* el archivo: papeles + contratos con vencimiento DERIVADO + el hueco dibujado */
    A(document.querySelectorAll('.docrow').length>=4,'archivo corto: '+document.querySelectorAll('.docrow').length);
    A(/vencido hace/.test(pv.textContent),'el convenio vencido no acusa (derivación contra el periodo)');
    A(pv.textContent.includes('ningún procedimiento lo rige'),'el hueco del archivo no se dibuja');
    const dr=[...document.querySelectorAll('.docrow')].find(r=>r.textContent.includes('OSE')); A(dr,'sin fila del convenio OSE');
    mclick(dr); A(eye().includes('Documento'),eye());
    A(document.getElementById('inBody').textContent.includes('vencido'),'la ficha no deriva el vencimiento');
    A(document.querySelector('#inBody [data-acc="renovar-contrato-documento"]'),'contrato sin acción de renovar');
    /* el rail es LA REUNIÓN del área: riesgos y acuerdos filtrados */
    state.insp='home'; inspectorHome();
    A(document.getElementById('inBody').textContent.includes('Riesgos que responde'),'rail sin los riesgos del área');
    A(document.getElementById('inBody').querySelectorAll('[data-rg]').length>=1,'ningún riesgo anclado al área');
    /* twin-primero: apagar la capa Plan apaga el CÓMO y deja la organización */
    mclick(document.querySelector('[data-capa=plan]'));
    A(!document.querySelector('.ruta'),'apagar Plan del ciclo no apagó la ruta');
    A(document.querySelectorAll('.pcard').length>=7,'apagar Plan se llevó los procesos (el twin es el cuerpo)');
    mclick(document.querySelector('[data-capa=plan]'));
    /* la ficha de proceso ganó su archivo */
    openProceso(byId(DATA.procesos,'p-cob'));
    A(document.getElementById('inBody').textContent.includes('El archivo'),'ficha de proceso sin grupo El archivo');
    A(document.getElementById('inBody').querySelectorAll('[data-doc]').length>=1,'ficha de proceso sin documento navegable');
    state.insp='home'; gotoNivel(2); });
  R.push('ERRS='+JSON.stringify(window.__ERRS||[]));
  document.title='V8SUITE :: '+R.join(' | ');
});});
</script>
EOF
# Reintento automático: el PRIMER arranque de Chrome con perfil nuevo pierde la carrera
# contra el primer layout bajo virtual-time (flaky en frío conocido). Antes había que
# re-correr a mano; ahora la suite lo absorbe — 3 intentos, perfil nuevo cada vez.
for intento in 1 2 3; do
  if google-chrome --headless=new --disable-gpu --user-data-dir="$TMP/profile-$intento" \
       --window-size=1680,1050 --virtual-time-budget=40000 --dump-dom "file://$TMP/t.html" 2>/dev/null \
       | grep -o '<title>V8SUITE[^<]*'; then
    rm -rf "$TMP"; exit 0
  fi
  [ "$intento" -lt 3 ] && echo "(intento $intento sin resultado — reintentando)" >&2
done
rm -rf "$TMP"
echo "SIN RESULTADO tras 3 intentos — revisar errores JS"; exit 1
