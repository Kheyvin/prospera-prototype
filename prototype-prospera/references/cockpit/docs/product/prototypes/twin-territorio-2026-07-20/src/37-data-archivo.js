/* ============================================================
   v21 · EL ARCHIVO — el corpus documental del twin (D-38 · M38 pirámide documental)
   ============================================================
   Por qué existe: un organization twin sin sus papeles es un dashboard. La empresa REAL vive
   sobre procedimientos, registros, CONTRATOS, pólizas y expedientes — y dos brechas del twin lo
   gritaban sin entidad detrás: g-prov ("cuando el avance falla no hay con qué sostener un
   reclamo" = contrato sin evaluación) y g-doc ("no existe procedimiento escrito de permisos").
   La entidad `documento` registra la pieza del corpus del CLIENTE (levantada en M1, con vigencia
   y contraparte); las proyecciones que el twin GENERA (el manual, la instrucción z3) siguen
   siendo proyecciones — D-08 intacta. El archivo binario vive en el Depósito (N12); acá vive el
   REGISTRO navegable: qué rige a qué proceso, qué evidencia produce, qué contrato lo sustenta.
   `vencido` / `por vencer` se DERIVAN contra el periodo vigente del twin — jamás se guardan. */
DATA.documentos=[
  /* — lo que RIGE (procedimientos · instrucciones — niveles 2 y 3 de la pirámide) — */
  {id:'d-cob-proc',  tipo:'procedimiento', rel:'rige', nm:'Procedimiento de cobranza y refinanciamiento', proc:'p-cob', estado:'vigente', v:'v3',
   fuente:'corpus documental del cliente (M1)', conf:'alta'},
  {id:'d-cie-check', tipo:'instruccion', rel:'rige', nm:'Checklist pre-cierre contable', proc:'p-cierre', estado:'vigente', v:'v2',
   nota:'nació del proyecto «Cierre contable exprés» — se estandarizó y se compiló al arnés del puesto', fuente:'proyecto de mejora cerrado (pm-cie)', conf:'alta'},
  {id:'d-val-proc',  tipo:'procedimiento', rel:'rige', nm:'Procedimiento de valorización de obra', proc:'p-val', estado:'vigente', v:'v1',
   fuente:'corpus documental del cliente (M1)', conf:'media'},
  {id:'d-rec-proc',  tipo:'procedimiento', rel:'rige', nm:'Procedimiento de reclutamiento e incorporación', proc:'p-rec', estado:'borrador', v:'v0',
   nota:'borrador de GH sin aprobar — el proceso corre de memoria', fuente:'corpus documental del cliente (M1)', conf:'baja'},
  {id:'d-visita-guion', tipo:'instruccion', rel:'rige', nm:'Guion de visita a caseta', proc:'p-vta', estado:'vigente', v:'v2',
   fuente:'corpus documental del cliente (M1)', conf:'media'},
  /* — lo que el proceso PRODUCE (registros — nivel 4: la evidencia) — */
  {id:'d-conc-reg',  tipo:'registro', rel:'produce', nm:'Conciliación bancaria mensual', proc:'p-conc', estado:'vigente',
   nota:'la prepara y la aprueba la misma persona — es uno de los dos hallazgos del auditor', g:'g-aud', fuente:'dictamen del auditor externo', conf:'alta'},
  {id:'d-corte-reg', tipo:'registro', rel:'produce', nm:'Corte quincenal de avance de obra', proc:'p-ejec', estado:'vigente',
   fuente:'protocolo de corte (pm-mar)', conf:'alta'},
  {id:'d-entrega-reg', tipo:'registro', rel:'produce', nm:'Acta de entrega de vivienda', proc:'p-post', estado:'vigente',
   fuente:'corpus documental del cliente (M1)', conf:'media'},
  /* — lo que SUSTENTA (contratos · pólizas — la obligación con un tercero, con vencimiento) — */
  {id:'d-sub-mar',   tipo:'contrato', rel:'sustenta', nm:'Contrato marco — subcontratista de frentes de Marina', proc:'p-ejec', estado:'vigente',
   contraparte:'Constructora RCM S.A.C.', vence:'oct-2026',
   nota:'sin criterios de evaluación de desempeño anexos: cuando el avance falla, no hay con qué sostener un reclamo', g:'g-prov', fuente:'levantamiento de obra (M1)', conf:'media'},
  {id:'d-linea-ban', tipo:'contrato', rel:'sustenta', nm:'Línea de capital de trabajo — Banco Continental', area:'a-fin', estado:'vigente',
   contraparte:'Banco Continental', vence:'dic-2026',
   nota:'trae los dos límites que la caja vigila (deuda sobre patrimonio · cobertura de intereses) — romperlos puede adelantar el pago de la deuda', fuente:'contrato de deuda + posición bancaria', conf:'alta'},
  {id:'d-car-mar',   tipo:'contrato', rel:'sustenta', nm:'Póliza todo-riesgo — obra Marina etapa 2', proc:'p-ejec', estado:'vigente',
   contraparte:'Aseguradora Pacífico Sur', vence:'sep-2026',
   nota:'vence ANTES de la entrega comprometida (dic-2026): renovarla o la obra queda sin asegurar el último trimestre', fuente:'póliza en el corpus (M1)', conf:'alta'},
  {id:'d-terr-cen',  tipo:'contrato', rel:'sustenta', nm:'Compraventa del terreno — Centro Sur', proc:'p-perm', estado:'vigente',
   contraparte:'Sucesión Valdivia', fuente:'contrato de compra (inversión Centro Sur)', conf:'media'},
  {id:'d-ose',       tipo:'contrato', rel:'sustenta', nm:'Convenio de emisión — OSE FacturaLima', proc:'p-fact', estado:'vigente',
   contraparte:'OSE FacturaLima', vence:'feb-2026',
   nota:'se sigue facturando con el convenio vencido — renovarlo o re-licitar el servicio de emisión', fuente:'corpus documental del cliente (M1)', conf:'alta'},
  /* — trámites en curso ante terceros (expedientes) — */
  {id:'d-exp-cen',   tipo:'expediente', rel:'produce', nm:'Expediente de licencia — Centro Sur (Surquillo)', proc:'p-perm', estado:'en-tramite',
   nota:'observado 2 veces; el porqué de cada observación no se registra en ningún lado', g:'g-doc', fuente:'portal municipal + expediente físico', conf:'media'},
];

/* la pirámide, en el idioma del gerente (M38 — cero jerga en superficie) */
const TIPO_DOC={ politica:['Política','el marco — nivel 1 de la pirámide documental'],
  procedimiento:['Procedimiento','quién hace qué y en qué orden — rige al proceso'],
  instruccion:['Instrucción','el cómo de una actividad, tarea por tarea'],
  registro:['Registro','la evidencia que el proceso produce — sin registro no hay prueba'],
  contrato:['Contrato','la obligación con un tercero — contraparte y vencimiento'],
  expediente:['Expediente','trámite en curso ante un tercero'] };
const DOC_EST={ vigente:'var(--ok)', borrador:'var(--warn)', 'en-tramite':'var(--brand-hi)', obsoleto:'var(--tx-faint)' };

/* ---- vencimiento DERIVADO contra el periodo del twin (jamás guardado) ---- */
const MESN={ene:1,feb:2,mar:3,abr:4,may:5,jun:6,jul:7,ago:8,sep:9,set:9,oct:10,nov:11,dic:12};
function periodoMes(){ const m=DATA.periodo.nm.toLowerCase().match(/([a-záé]+)\s+(\d{4})/);
  return m?{m:MESN[m[1].slice(0,3)]||7, y:+m[2]}:{m:7,y:2026}; }
function docVence(d){ if(!d.vence) return null;
  const p=periodoMes(), mm=d.vence.toLowerCase().match(/([a-z]+)-(\d{4})/); if(!mm) return null;
  const dif=(+mm[2]-p.y)*12+((MESN[mm[1].slice(0,3)]||1)-p.m);
  if(dif<0)  return {t:'vencido hace '+(-dif)+(dif===-1?' mes':' meses'), est:'vencido', c:'var(--crit)'};
  if(dif===0)return {t:'vence ESTE mes', est:'por-vencer', c:'var(--crit)'};
  if(dif<=3) return {t:'vence en '+dif+(dif===1?' mes':' meses')+' ('+d.vence+')', est:'por-vencer', c:'var(--warn)'};
  return {t:'vence '+d.vence, est:'al-dia', c:'var(--tx-mut)'}; }

const docsDeProc=pid=>DATA.documentos.filter(d=>d.proc===pid);
function docsDeArea(aid){ const set=new Set(descendants(aid));
  return DATA.documentos.filter(d=>{ if(d.area) return set.has(d.area);
    const p=d.proc&&byId(DATA.procesos,d.proc); return p&&p.areas.some(x=>set.has(x)); }); }
/* el hueco DECLARADO del archivo: procesos del área a los que ningún documento rige (g-doc es el caso) */
function procsSinDocRige(aid){ return subtreeProcs(aid).filter(p=>p.tipo!=='direccion'&&!DATA.documentos.some(d=>d.proc===p.id&&d.rel==='rige')); }

/* ---- el área de un riesgo / acuerdo — DERIVADA de sus refs, jamás un campo duplicado ----
   El registro ya ancla (`ref:{proc|g|pm|obj|area}`); el cargo del responsable es el fallback.
   Duplicar un `area` a mano en cada riesgo sería el mismo error que el semáforo guardado. */
function cargoArea(cargo){ if(!cargo||/directorio/i.test(cargo)) return null;
  const c=coreNm(cargo).replace(/^Gte\./,'Gerente'); const a=DATA.areas.find(x=>x.lider.split(' · ')[1]===c||coreNm(x.lider.split(' · ')[1])===c);
  if(a) return a.id; const p=PUESTOS.find(x=>x.nm===c); return p?p.area:null; }
function areaDeRef(ref){ if(!ref) return null;
  if(ref.area) return ref.area;
  if(ref.proc){ const p=byId(DATA.procesos,ref.proc); return p?p.areas[0]:null; }
  if(ref.g){ const g=byId(DATA.brechas,ref.g), p=g&&byId(DATA.procesos,g.against); return p?p.areas[0]:null; }
  if(ref.pm){ const pm=byId(DATA.proyectos,ref.pm); return pm?pm.area:null; }
  if(ref.obj){ const o=byId(DATA.objetivos,ref.obj); return o?o.area:null; }
  return null; }
function riesgosDeArea(aid){ const set=new Set(descendants(aid));
  return DATA.riesgos.filter(r=>{ const a=areaDeRef(r.ref)||cargoArea(r.dueno); return a&&set.has(a); }); }
function acuerdosDeArea(aid){ const set=new Set(descendants(aid));
  return DATA.acuerdos.filter(ac=>{ const a=areaDeRef(ac.ref)||cargoArea(ac.quien); return a&&set.has(a); }); }
function ideasDeArea(aid){ const set=new Set(descendants(aid));
  return DATA.ideas.filter(i=>{ const nm=i.prop.split(' · ')[0];
    const per=DATA.personasExtra.find(x=>x.nm===nm||nm.startsWith(x.nm.split(' ')[0]));
    if(per) return set.has(per.area);
    const a=cargoArea(i.prop.split(' · ')[1]||i.prop.replace(/^triage M36 → /,'')); return a&&set.has(a); }); }

/* ícono del tipo (M13: la forma dice el tipo) — página con doblez; contrato = la misma con firma */
TICO.documento='<svg viewBox="0 0 14 14"><path d="M3 1.5h5.5L11 4v8.5H3z" fill="none" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 1.5V4H11" fill="none" stroke-width="1.1"/><path d="M4.6 6.5h4.8M4.6 8.4h4.8M4.6 10.3h3" stroke-width="1" stroke-linecap="round"/></svg>';
