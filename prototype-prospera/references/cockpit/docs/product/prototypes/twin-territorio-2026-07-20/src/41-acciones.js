const ACC={
  'registrar-medicion-kpi':[1,'directa','registró una medición'],
  'enviar-idea':[1,'directa','envió una idea al embudo (autoría reconocida)'],
  'ajustar-banda-kpi':[2,'revisión-dueño','pidió ajustar la banda'],
  'avanzar-tollgate':[2,'revisión-dueño','avanzó el hito del proyecto'],
  'evaluar-idea':[2,'revisión-dueño','evaluó una idea (con respuesta al autor)'],
  'comprometer-contramedida':[2,'directa','comprometió una contramedida'],
  'corregir-instruccion':[2,'gestión-de-cambios','propuso corregir la instrucción'],
  /* v21 · el archivo (D-38) */
  'aprobar-version-documento':[2,'revisión-dueño','aprobó una versión del documento'],
  'renovar-contrato-documento':[3,'gestión-de-cambios','inició la renovación del contrato'],
  'recompilar-arnes':[2,'revisión-dueño','pidió recompilar el arnés'],
  'cerrar-brecha':[3,'revisión-dueño','cerró la brecha con evidencia'],
  'aprobar-charter':[3,'gestión-de-cambios','aprobó el acta del proyecto (doble firma)'],
  'promover-idea-a-proyecto':[3,'gestión-de-cambios','promovió la idea a proyecto'],
  'promover-kpi-a-kr':[3,'gestión-de-cambios','promovió el indicador a meta del ciclo'],
  'verificar-beneficios':[3,'revisión-dueño','verificó los beneficios reales (finanzas)'],
  'suspender-arnes':[3,'directa','suspendió el arnés (kill-switch)'],
  'ratificar-autonomia-arnes':[4,'gestión-de-cambios','ratificó la autonomía del arnés'],
  'aprobar-version-objetivo':[4,'gestión-de-cambios','publicó una versión del objetivo'],
  'sellar-apuesta':[4,'gestión-de-cambios','selló la apuesta'],
  're-apostar':[4,'gestión-de-cambios','re-apostó (cambió meta o riesgo)'],
  'retirar-apuesta':[4,'gestión-de-cambios','retiró la apuesta'],
  'convocar-rendicion':[4,'directa','convocó rendición de cuentas'],
  'fijar-apetito-riesgo':[4,'gestión-de-cambios','fijó el apetito de riesgo'],
  'fijar-mezcla-ambicion':[4,'gestión-de-cambios','fijó la mezcla de ambición del año'],
  /* v18 · las decisiones REALES de un directorio — plata, riesgo y acuerdos.
     Antes la bandeja sólo configuraba el propio modelo (apetito, mezcla, sello): en régimen
     esa bandeja queda vacía y el directorio no tiene nada que firmar. */
  'aprobar-presupuesto':[4,'gestión-de-cambios','aprobó el presupuesto del año'],
  'aprobar-inversion':[4,'gestión-de-cambios','aprobó una inversión sobre el umbral'],
  'aprobar-endeudamiento':[4,'gestión-de-cambios','aprobó tomar deuda sobre el umbral'],
  'fijar-piso-caja':[4,'gestión-de-cambios','fijó el piso de caja'],
  'asignar-riesgo':[4,'revisión-dueño','asignó responsable y mitigación a un riesgo'],
  'comprometer-acuerdo':[3,'revisión-dueño','comprometió un acuerdo del directorio'],
  'cerrar-sesion':[4,'directa','cerró la sesión y generó el acta'],
  /* v19 · las que el esquema declaraba y la interfaz no ofrecía. El moat del producto está en los
     WRITES: una acción declarada sin superficie es una promesa que nadie puede ejercer, y una
     superficie sin acción declarada es una promesa sin dónde guardarse. Acá se cierran las dos. */
  'bajar-objetivo':[3,'gestión-de-cambios','abrió la meta del directorio en una gerencia'],
  'acordar-bajada':[3,'revisión-dueño','cerró el acuerdo de bajada con la gerencia'],
  'decantar-kr-a-kpi':[3,'revisión-dueño','cerró el contrato del ciclo (el indicador vuelve a sólo monitorearse)'],
  'verificar-valor-cobrado':[3,'revisión-dueño','verificó lo cobrado de la apuesta contra el cierre contable'],
  'cerrar-proyecto':[3,'gestión-de-cambios','cerró el proyecto con su veredicto (movió o no movió)'],
  'cerrar-riesgo':[3,'revisión-dueño','cerró el riesgo con evidencia'],
  'cerrar-acuerdo':[3,'revisión-dueño','cerró el acuerdo con evidencia'],
  'comprometer-bolsa':[3,'revisión-dueño','comprometió plata de una bolsa del presupuesto'],
  'fijar-facultades':[4,'gestión-de-cambios','fijó qué monto obliga a decidir al directorio'],
  'registrar-avance-inversion':[2,'directa','registró el avance real de la inversión'],
  'registrar-cifras-periodo':[2,'directa','ingestó las cifras del cierre desde el sistema contable'],
  'cerrar-periodo':[3,'revisión-dueño','pasó el periodo a cerrado'],
  'corregir-verbo-actividad':[2,'revisión-dueño','corrigió el verbo de la actividad (auditado)'],
};
const RANGO={'':99, dir:4, ger:3, jefe:2, ana:1};
const NIVAUT={4:'Dirección',3:'Estratégico',2:'Táctico',1:'Operativo'};
let _toastT=null;
function toast(m,conLink){ const t=document.getElementById('toast'); if(!t)return;
  t.innerHTML=m+(conLink?'<span class="tlink" onclick="accion()">Ver la cola de Cambios ›</span>':'');
  t.style.opacity=1;
  clearTimeout(_toastT); _toastT=setTimeout(()=>t.style.opacity=0,conLink?6000:3400); }
/* v17 · solicitudes que nacen de acciones de ESTA sesión — se ven en la cola del módulo Cambios */
let SOLICITUDES=[], _scN=14;
function ejecutarAccion(b){ const a=ACC[b.dataset.acc];
  if(!a){ state.mod='cambios'; state.insp='home'; render(); return; }   // acción fuera de catálogo → cola
  const quien={dir:'Dirección',ger:'Gerencia',jefe:'Jefatura',ana:'Analista'}[state.verComo]||'tú (sin lente)';
  if(RANGO[state.verComo]<a[0]){ toast('Fuera de tu autoridad — esta acción la decide el nivel '+NIVAUT[a[0]]+'.'); return; }
  DATA.historial.unshift(`ahora · <b>${quien}</b> · ${a[2]} · ${a[1]}`);
  if(a[1]!=='directa') SOLICITUDES.unshift({sc:'SC-'+(++_scN), tt:a[2].charAt(0).toUpperCase()+a[2].slice(1), ap:'acción: '+b.dataset.acc+' · solicita: '+quien, apr:a[1]});
  /* la toast dice QUÉ pasa con lo que ves — no un "registrado" genérico */
  if(a[1]==='directa') toast(`Hecho: ${a[2]} — quedó trazado en el historial.`,true);
  else if(a[1]==='revisión-dueño') toast(`Solicitud enviada: ${a[2]}. El responsable del proceso debe acusar — hasta entonces lo que ves no cambia.`,true);
  else toast(`Solicitud enviada al comité de cambios: ${a[2]}. Lo que ves sigue vigente hasta que se apruebe.`,true);
}
