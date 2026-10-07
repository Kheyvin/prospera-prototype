function renderMejora(){
  const rank={alta:3,media:2,baja:1};
  const gs=[...DATA.brechas].sort((a,b)=>rank[b.sev]-rank[a.sev]);
  const sevC={alta:'var(--crit)',media:'var(--warn)',baja:'var(--tx-faint)'};
  const vuelo=DATA.proyectos.filter(p=>p.estado!=='cerrado'), done=DATA.proyectos.filter(p=>p.estado==='cerrado');
  const pv=pageView(`
    <div class="pv-hd"><span class="eyebrow">Mejora · embudo de ideas → brecha → proyecto · el ciclo completo vive DENTRO del twin, de la idea al indicador movido</span>
      <h2>Idea → brecha → proyecto → KPI movido</h2>
      <div class="sub">El personal propone (embudo de mejora continua) y el triage detecta candidatos; cada brecha lleva costo de no hacer; de ahí nacen los proyectos (PDCA, con vuelta atrás permitida); el cierre se declara con el <b>delta observado en el KPI</b> — y la mejora se <b>compila al arnés del puesto</b>.</div></div>
    <div class="fcols" style="grid-template-columns:repeat(4,1fr)">
      <div class="fcol"><span class="eyebrow">0 · Ideas — embudo del personal (mejora continua)${respBadge('ideas')}</span>
        ${DATA.ideas.map(i=>`<button class="fitem" data-idea="${i.id}">
          <span class="t">${iico('idea','idea · Driver (M13 ArchiMate, Motivation)')}${i.nm.length>58?i.nm.slice(0,56)+'…':i.nm}</span>
          <span class="m"><span class="gate-pill ${i.estado==='promovida'?'':'pend'}">${i.estado}</span><span>${i.prop.split(' · ')[0]}</span>${i.origen==='triage'?'<span style="color:var(--brand-hi)">← triage</span>':''}</span>
        </button>`).join('')}
        <div style="font-size:10.5px;color:var(--tx-faint)">idea y proyecto viven separados · autoría reconocida, jamás medición de la persona</div></div>
      <div class="fcol"><span class="eyebrow">1 · Brechas — ordenadas por costo/ROI${respBadge('mej-brechas')}</span>
        ${gs.map(g=>`<button class="fitem ${g.estado==='off-thread'?'dim2':''}" data-g="${g.id}">
          <span class="t">${iico('brecha','brecha · Assessment (M13 ArchiMate, Motivation)')}${g.nm.length>64?g.nm.slice(0,62)+'…':g.nm}</span>
          <span class="m"><span style="color:${sevC[g.sev]}">▲ ${g.sev}</span><span>${g.costo}</span><span>${g.estado}</span>${g.apuesta?'<span style="color:var(--brand-hi)" title="la primera de la fila: lo que más cuesta por mes de espera frente a lo que cuesta atacarlo">prioridad ①</span>':''}</span>
        </button>`).join('')}</div>
      <div class="fcol"><span class="eyebrow">2 · Proyectos en curso — PDCA${respBadge('mej-proyectos')}</span>
        ${vuelo.map(p=>`<button class="fitem" data-pm="${p.id}">
          <span class="t">${iico('proyecto','proyecto de mejora · Work Package (M13 ArchiMate)')}${p.nm}</span>
          <span class="m"><span class="gate-pill">${p.pdca}</span><span>${p.estado}</span><span>ROI ${p.roi}</span><span style="color:var(--brand-hi)">${p.delta}</span></span>
        </button>`).join('')}
        <div style="font-size:10.5px;color:var(--tx-faint)">12 estados posibles · se permite volver de verificación a ejecución si la evidencia lo pide (ciclo PDCA real, no lineal)</div></div>
      <div class="fcol"><span class="eyebrow">3 · KPI movido — veredicto con dato real${respBadge('mej-kpimovido')}</span>
        ${done.map(p=>`<button class="fitem" data-pm="${p.id}" style="border-color:var(--teal-800)">
          <span class="t">${iico('proyecto','proyecto de mejora · Work Package (M13 ArchiMate)')}${p.nm}</span>
          <span class="m"><span class="gate-pill">CERRADO</span><span style="color:var(--ok)">✓ ${p.resultado.veredicto}</span><span style="color:var(--brand-hi)">${p.resultado.delta_observado}</span><span>ROI real ${p.roi}</span></span>
        </button>`).join('')}
        <div style="font-size:10.5px;color:var(--tx-faint)">veredicto ∈ {movió · parcial · no-movió} — se escribe contra la serie del KPI, con procedencia</div></div>
    </div>`);
  pv.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>openBrecha(byId(DATA.brechas,b.dataset.g)));
  pv.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>openProyecto(byId(DATA.proyectos,b.dataset.pm)));
  pv.querySelectorAll('[data-idea]').forEach(b=>b.onclick=()=>openIdea(byId(DATA.ideas,b.dataset.idea)));
  pv.querySelectorAll('[data-resp]').forEach(b=>b.onclick=()=>openRespaldo(b.dataset.resp));
  counter(`${DATA.ideas.length} ideas · ${gs.length} brechas · ${vuelo.length} en curso · ${done.length} cerrado`);
}

/* ---------- módulo Método: engagement M1·M2·M3 + metodología as-code ---------- */
function renderMetodo(){
  const pv=pageView(`
    <div class="pv-hd"><span class="eyebrow">Método · el engagement del consultor — plantilla versionada, instancia por cliente (N6)</span>
      <h2>M1 Levantamiento · M3 Espinazo · M2 Mantenimiento</h2>
      <div class="sub">El método es <b>dato, no prosa</b>: 61 M-cards versionadas en git (methodologies.yaml) — cada capa del twin cae de una M-card. Los gates conectan el engagement con el ciclo de mejora.</div></div>
    <div class="fcols">
      <div class="fcol"><span class="eyebrow">M1 · Levantamiento — construir el As-Is${respBadge('met-m1')}</span>
        <div class="fitem"><span class="t">Ingesta multi-fuente</span><span class="m"><span class="gate-pill">✓ HECHO</span><span>ERP · CRM · 14 entrevistas</span></span></div>
        <div class="fitem"><span class="t">Mapa As-Is (objeto normalizado, 21 entidades)</span><span class="m"><span class="gate-pill">✓ HECHO</span><span>14 áreas · 17 procesos · 100 personas</span></span>
          <div class="stage-row"><span class="mono" style="font-size:9px;color:var(--tx-faint)">provenance</span><span class="prog"><i style="flex:52;background:var(--ok)"></i><i style="flex:30;background:var(--warn)"></i><i style="flex:18;background:var(--crit)"></i></span><span class="mono" style="font-size:9px;color:var(--tx-faint)">52·30·18</span></div></div>
        <div class="fitem"><span class="t">Hilo de oro medido</span><span class="m"><span class="gate-pill">✓ HECHO</span><span>7 objetivos · 9 KPIs con banda</span></span></div>
        <div class="fitem"><span class="t">Validación con dueños (acuses)</span><span class="m"><span class="gate-pill pend">◐ 12/17</span><span>gate G1 → habilita el Espinazo</span></span></div></div>
      <div class="fcol"><span class="eyebrow">M3 · Espinazo — del diagnóstico a LA Apuesta${respBadge('met-m3')}</span>
        <div class="fitem"><span class="t">Etapa 0 · Diagnóstico anclado a plata</span><span class="m"><span class="gate-pill">✓ G2</span><span>6 brechas costeadas</span></span></div>
        <div class="fitem"><span class="t">LA Apuesta — UN próximo paso, no 50</span><span class="m"><span class="gate-pill">✓ RATIFICADA</span><span style="color:var(--brand-hi)">Marina 87→95% · mueve margen →18%</span></span></div>
        <div class="fitem"><span class="t">Etapa 1 · Proyectos de mejora en curso</span><span class="m"><span class="gate-pill pend">◐ EN CURSO</span><span>2 en curso · 1 cerrado (KPI movido)</span></span></div></div>
      <div class="fcol"><span class="eyebrow">M2 · Mantenimiento — el twin no se pudre${respBadge('met-m2')}</span>
        <div class="fitem"><span class="t">Frescura de indicadores</span><span class="m"><span style="color:var(--warn)">⌛ 1 KPI vencido</span><span>visitas a caseta (Declarado, 40d)</span></span></div>
        <div class="fitem"><span class="t">Revisiones periódicas</span><span class="m"><span class="gate-pill pend">PRÓX</span><span>Cobranza de cuotas v2 · 15 ago</span></span></div>
        <div class="fitem"><span class="t">Crowdsourcing a dueños del dato</span><span class="m"><span class="gate-pill pend">V2</span><span>encuestas + chat grounded con decision-trace</span></span></div>
        <div class="fitem"><span class="t">Arneses por puesto (Arnesia → Colab)</span><span class="m"><span class="gate-pill pend">◐ 4/40</span><span style="color:var(--warn)">1 requiere recompilación</span><span>el método ENTREGADO al puesto</span></span></div></div>
    </div>
    <div class="fcol" style="margin-top:2px"><span class="eyebrow">Trazabilidad — qué M-card sostiene cada cosa que ves (method-as-code)</span>
      <div class="mcards">
        <span class="chip">M30 BSC → piel Strategy map</span><span class="chip">M26 Hoshin → cascada objetivo→área</span>
        <span class="chip">M09 VSM → tiempos toque/espera z2</span><span class="chip">M15 COBIT → capa madurez</span>
        <span class="chip">M23 provenance → confianza 🟢🟡🔴</span><span class="chip">M16 PDCA → cinética + loop-back</span>
        <span class="chip">SOMA C7 → semáforo digitalización</span><span class="chip">ECRS+RTLX → triage automatización</span>
        <span class="chip">M36·M37 → triage → skill de arnés (Arnesia)</span><span class="chip">M44 → embudo de ideas</span></div></div>
    <div class="fcols" style="margin-top:10px">
      <div class="fcol"><span class="eyebrow">Vocabulario · el ciclo de la apuesta — valores posibles${respBadge('met-vocab')}</span>
        <div class="fitem"><span class="t"><b class="mono" style="color:var(--warn)">por sellar</b> — propuesta: valor y riesgo declarados; falta la firma de quien responde por la meta</span></div>
        <div class="fitem"><span class="t"><b class="mono" style="color:var(--brand-hi)">sellada</b> — firmada con gesto de peso; quién · cuándo · qué meta quedan registrados, inmutables</span></div>
        <div class="fitem"><span class="t"><b class="mono">cumplida</b> — sus objetivos alcanzaron la meta; cierra con veredicto contra el dato, no con un acta</span></div>
        <div class="fitem"><span class="t"><b class="mono">retirada</b> — el directorio la retira; queda en el historial, jamás se borra</span></div>
        <div class="fitem"><span class="t" style="color:var(--tx-mut)"><b class="mono">re-apostar</b> no es un estado: es una acción — cambia meta o riesgo re-versionando la apuesta sellada, jamás edita en silencio</span></div></div>
      <div class="fcol"><span class="eyebrow">Vocabulario · la ambición — las tres bolsas (ideas · proyectos · metas · apuestas)</span>
        <div class="fitem"><span class="t"><b class="mono" style="color:var(--brand-hi)">operar el hoy</b> — mejora lo que ya haces, para el mercado que ya sirves (≈70 del esfuerzo)</span></div>
        <div class="fitem"><span class="t"><b class="mono">expandir</b> — lleva lo que sabes hacer a mercados u ofertas vecinas (≈20)</span></div>
        <div class="fitem"><span class="t"><b class="mono">apostar al futuro</b> — lo nuevo de verdad: mercado y oferta que hoy no tienes (≈10 — suele generar ~70% del valor nuevo)</span></div>
        <div class="fitem"><span class="t" style="color:var(--tx-mut)">se clasifica por NOVEDAD, jamás por plazo · la mezcla objetivo la firma el directorio (varía por industria) · la mezcla real se deriva sola al leer</span></div></div>
    </div>`);
  counter('M1 ✓ · M3 en curso · M2 activo · 61 M-cards');
}

/* ---------- módulo Cambios: gestión de cambios ISO — el motor versiona por debajo, el usuario jamás lo ve ---------- */
function renderCambios(){
  const pv=pageView(`
    <div class="pv-hd"><span class="eyebrow">Gestión de cambios · ISO — solicitudes, versiones, aprobaciones y acuses · el motor guarda cada versión por debajo; el usuario JAMÁS ve la tubería</span>
      <h2>Cambios sobre el twin ${respBadge('cam-cola')}</h2>
      <div class="sub">Cada acción cinética declara su tipo de aprobación: <b>directa</b> (se aplica y queda trazada) · <b>revisión-dueño</b> · <b>gestión-de-cambios</b> (comité). Toda versión: borrador → vigente → obsoleto, con entornos desarrollo → pruebas → producción.</div></div>
    ${SOLICITUDES.map(s=>`<button class="cambio-row"><span class="sc">${s.sc}</span><div><div class="tt">${s.tt}</div><div class="ap">${s.ap}</div></div><span class="ap">${s.apr==='gestión-de-cambios'?'⛔':'👁'} ${s.apr}</span><span class="gate-pill pend">EN COLA · recién enviada</span></button>`).join('')}
    <button class="cambio-row"><span class="sc">SC-14</span><div><div class="tt">Recompilar arnés "Jefe de Cobranza" v1 → v2</div><div class="ap">acción: recompilar-arnes · origen: drift twin→arnés (SC-11 verbo + SC-12 mapa v2) · Arnesia N15 → Colab Studio N17</div></div><span class="ap">👁 revisión-dueño</span><span class="gate-pill pend">EN COLA</span></button>
    <button class="cambio-row"><span class="sc">SC-13</span><div><div class="tt">Ajustar banda de "cobranza digital" 60% → 50%</div><div class="ap">acción: ajustar-banda-kpi · solicita: Jefe de Cobranza</div></div><span class="ap">⛔ gestión-de-cambios</span><span class="gate-pill pend">PENDIENTE COMITÉ</span></button>
    <button class="cambio-row"><span class="sc">SC-12</span><div><div class="tt">Publicar mapa de proceso "Cobranza de cuotas" v2</div><div class="ap">acción: publicar-mapa-proceso · borrador en dev</div></div><span class="ap">👁 revisión-dueño</span><span class="gate-pill pend">EN REVISIÓN</span></button>
    <button class="cambio-row"><span class="sc">SC-11</span><div><div class="tt">Corregir verbo actividad 05: "transportar" → "visitar"</div><div class="ap">acción: corregir-verbo-actividad · evidencia: auditoría en campo</div></div><span class="ap">✓ directa</span><span class="gate-pill">APLICADA + ACUSE</span></button>
    <button class="cambio-row"><span class="sc">SC-10</span><div><div class="tt">Registrar medición k-dso · julio (91 días)</div><div class="ap">acción: registrar-medicion-kpi · fuente: Nubecont ERP</div></div><span class="ap">✓ directa</span><span class="gate-pill">APLICADA</span></button>
    <div class="fcol"><span class="eyebrow">Versiones vigentes (por entorno)${respBadge('cam-versiones')}</span>
      <div class="fitem"><span class="t">Cobranza de cuotas — mapa de proceso</span><span class="m"><span class="gate-pill">v1 VIGENTE · producción</span><span class="gate-pill pend">v2 borrador · desarrollo</span><span>revisión periódica: 15 ago</span></span></div>
      <div class="fitem"><span class="t">Arnés · Analista de Cobranza (Colab Studio)</span><span class="m"><span class="gate-pill">v3 VIGENTE</span><span>compilado del twin · 2026-07-18</span><span>uso 34/sem (rol)</span></span></div>
      <div class="fitem"><span class="t">Corrida · Cobranza digital fase 2 (simulación)</span><span class="m"><span class="gate-pill pend">RAMA ABIERTA</span><span>aplicarla = pasa por ESTA cola de aprobación</span></span></div></div>
    <div class="fcol"><span class="eyebrow">Historial de la organización — toda acción, versionada (quién · qué · aprobación)${respBadge('cam-historial')}</span>
      ${DATA.historial.map(h=>`<div class="fitem"><span class="t" style="font-size:12px">${h}</span></div>`).join('')}
      <div style="font-size:10px;color:var(--tx-faint);font-family:var(--font-mono)">la organización tiene historial, como el código — cada acción queda versionada por debajo</div></div>`);
  counter(`${3+SOLICITUDES.length} pendientes · 2 aplicadas · historial: ${DATA.historial.length} acciones`);
}

