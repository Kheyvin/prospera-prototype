/* ============================================================
   CONTROLS
   ============================================================ */
document.getElementById('back').onclick=()=>{
  if(state.escala==='z3'){ state.escala='z2'; state.insp='home'; render(); return; }   // la escalera se sube de a un peldaño
  if(state.mod==='territorio'&&state.nivel===3&&state.area3){ state.area3=null; state.insp='home'; render(); return; }   // v21: sala → selector
  state.nivel=2; state.escala='z0'; state.foco=null; state.insp='home'; render(); };
document.querySelectorAll('#modulos .esc').forEach(b=>b.onclick=()=>{ state.mod=b.dataset.mod;
  /* v17: Territorio = HOME del mapa — desde cualquier profundidad (lienzo/instrucción/foco) vuelve al mapa */
  if(state.mod==='territorio'){ state.nivel=2; state.escala='z0'; state.foco=null; state.act=null; state.area3=null; }
  else { state.escala='z0'; state.foco=null; }
  state.insp='home'; render(); });
document.getElementById('itAsis').onclick=()=>{ state.corrida=false; idmenu.classList.remove('open'); state.insp='home'; render(); };
document.getElementById('itCorrida').onclick=()=>{ state.corrida=true; state.mod='territorio'; idmenu.classList.remove('open'); state.insp='home'; render(); };
document.getElementById('corridaExit').onclick=()=>{ state.corrida=false; state.insp='home'; render(); };
document.getElementById('corridaGate').onclick=()=>{ state.mod='cambios'; state.insp='home'; render(); }; // el diff pasa por la cola de aprobación
/* v14: elevador de niveles + gobierno (ciclo · ver-como) */
document.querySelectorAll('#niveles .esc').forEach(b=>b.onclick=()=>gotoNivel(+b.dataset.nivel));
document.getElementById('cicloSel').onchange=e=>{ state.ciclo=e.target.value; render();
  toast(state.ciclo==='okr'?'Modo trimestral: compensación separada de las metas.':'Modo anual (práctica LATAM/BR): el despliegue baja en cascada y ciertas metas pagan bono ★.'); };
document.getElementById('verComoSel').onchange=e=>{ state.verComo=e.target.value; render();
  if(state.verComo!=='')toast('Tu autoridad fija qué acciones puedes ejecutar — las demás se ven, deshabilitadas.'); };
document.querySelectorAll('.piel-toggle button').forEach(b=>b.onclick=()=>{ setPiel(b.dataset.piel); state.activeObj=null;
  state.insp='home';   /* v17: cambiar de piel cierra la ficha abierta — no queda un panel de la piel anterior tapando la sala de mando */
  render(); });
document.querySelectorAll('.capa').forEach(b=>b.onclick=()=>{ const c=b.dataset.capa;
  if(state.capas.has(c)){ state.capas.delete(c); b.classList.remove('on'); } else { state.capas.add(c); b.classList.add('on'); } render(); });
document.querySelectorAll('.sub-t').forEach(b=>b.onclick=()=>{ document.querySelectorAll('.sub-t').forEach(x=>x.classList.remove('on')); b.classList.add('on'); state.sub=b.dataset.sub; render(); });
document.querySelectorAll('.lodctl button').forEach(b=>b.onclick=()=>{ document.querySelectorAll('.lodctl button').forEach(x=>x.classList.remove('on')); b.classList.add('on');
  presetNiveles(+b.dataset.lod); render(); });   // v21: el botón es un PRESET — abre todo hasta N; la expansión fina vive por rama

/* identidad As-Is / corridas (teaser del eje simular) */
const idmenu=document.getElementById('idmenu');
document.getElementById('idpill').onclick=e=>{ e.stopPropagation(); idmenu.classList.toggle('open'); };
document.addEventListener('click',e=>{ if(!e.target.closest('.idwrap')) idmenu.classList.remove('open'); });

/* búsqueda — ⌘K, spotlight en vivo */
const $search=document.getElementById('search');
$search.addEventListener('input',()=>{ state.search=$search.value; render(); });
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); $search.focus(); $search.select(); return; }
  if(e.key==='Escape'){
    if(document.activeElement===$search && state.search){ state.search=''; $search.value=''; $search.blur(); render(); return; }
    if(state.search){ state.search=''; $search.value=''; render(); return; }
    if(state.insp==='sel'){ state.insp='home'; inspectorHome(); return; }
    if(state.escala!=='z0'){ state.escala='z0'; state.foco=null; render(); }
  }
});

/* empresa: la raíz del viaje — click en el subtítulo del brand */
const brandSub=document.querySelector('.brand .sub'); brandSub.style.cursor='pointer'; brandSub.title='ficha de la empresa (el twin completo)';
brandSub.onclick=()=>openEmpresa();

setTimeout(()=>document.getElementById('hint').classList.add('gone'),9000);
window.addEventListener('resize',()=>refit(false));
render();
