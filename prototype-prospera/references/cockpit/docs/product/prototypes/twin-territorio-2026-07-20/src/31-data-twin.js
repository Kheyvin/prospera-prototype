/* ============================================================
   DATA — Desarrolladora Terranova S.A.C. (shell real)
   ============================================================ */
const DATA = {
  empresa:{ id:'terranova', razon:'Desarrolladora Terranova S.A.C.',
    mision:'Desarrollar y construir vivienda media en Lima que las familias puedan pagar y habitar con orgullo, integrando promoción, construcción propia y postventa en un solo ciclo.',
    vision:'Ser al 2030 la desarrolladora de vivienda media de referencia en Lima Metropolitana, reconocida por entregar a tiempo, con calidad verificable y la confianza de bancos y compradores.', fuente:'constitución del engagement (M1)', conf:'alta' },

  /* ===== O2 · objetivos — v19 (D-35): DOS niveles en una sola lista, unidos por `parent`. =====
     Arriba las metas del DIRECTORIO (de la empresa, sin gerencia dueña); abajo las BAJADAS: la misma
     meta abierta como meta de UNA gerencia, con el rol que responde (`acc`) y la sesión donde el
     gerente la aceptó (`acordado`). Sin ese ida-y-vuelta la meta está ASIGNADA, no acordada — y la
     diferencia es exactamente por qué las bajadas no se cumplen (M26 catchball).
     `krs[]` es LISTA (un objetivo tiene N contratos de cambio) y cada KR cuelga de la serie de un KPI
     (`kpi`): su valor actual se LEE de la última medición, jamás se teclea al lado (D-34). `esperado`
     es el punto del plan a hoy — de ahí sale la salud, derivada.
     Casuística deliberada: `o-hog` y `o-eq` NO tienen bajada (metas del directorio que nadie bajó, la
     primera pregunta de la revisión) · `o-vis` está bajada pero SIN acordar (la gerencia Comercial). */
  objetivos:[
    // — nivel 1 · las metas del directorio —
    {id:'o-hog', nm:'Hogares de calidad accesibles en Lima',            persp:'cliente',    horiz:'3a',
     krs:[{id:'o-hog#k1', m:'viviendas entregadas acumuladas', from:480, to:900, esperado:680, u:'viv', kpi:'k-viv', acc:'Gerente de Desarrollo'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-lid', nm:'Consolidar el liderazgo en vivienda media de Lima',persp:'financiera', horiz:'anual',
     krs:[{id:'o-lid#k1', m:'margen bruto por proyecto', from:14, to:18, esperado:16.3, u:'%', kpi:'k-mar', acc:'CFO'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-caja',nm:'Caja sana en todos los proyectos',                 persp:'financiera', horiz:'anual',
     krs:[{id:'o-caja#k1', m:'días de cobranza consolidados', from:88, to:60, esperado:60, u:'días', kpi:'k-dsoc', acc:'CFO'},
          {id:'o-caja#k2', m:'caja visible al día (rezago)',  from:5,  to:1,  esperado:2,  u:'días', kpi:'k-caj',  acc:'CFO'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-mar', nm:'Reactivar la venta y sanear el stock de Marina',   persp:'cliente',    horiz:'anual',
     krs:[{id:'o-mar#k1', m:'absorción consolidada', from:2.4, to:3.5, esperado:3.0, u:'%/mes', kpi:'k-abs', acc:'Gerente Comercial'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-eq',  nm:'Equipo estable y competente en obra y oficina',    persp:'aprendizaje',horiz:'anual',
     krs:[{id:'o-eq#k1', m:'rotación mensual', from:4.8, to:2.5, esperado:4.0, u:'%/mes', kpi:'k-rot', acc:'Gerente de GH'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    // — nivel 2/3 · las bajadas: la meta del directorio hecha meta de una gerencia —
    {id:'o-cob', nm:'Digitalizar la cobranza',                          persp:'procesos',   horiz:'trimestre',
     parent:'o-caja', area:'a-tes', acordado:'ses-jun',
     krs:[{id:'o-cob#k1', m:'cobranza por canal digital', from:15, to:60, esperado:30, u:'%', kpi:'k-cob', acc:'Jefe de Cobranza'}],
     fuente:'propuesta de apuesta — por sellar', conf:'media'},
    {id:'o-vis', nm:'Volver a llenar la caseta de Marina',              persp:'procesos',   horiz:'trimestre',
     parent:'o-mar', area:'a-com', acordado:null,
     krs:[{id:'o-vis#k1', m:'visitas diarias a caseta', from:12, to:25, esperado:20, u:'/día', kpi:'k-vis', acc:'Jefe de Marketing'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-avc', nm:'Recuperar el avance de obra de Marina',            persp:'procesos',   horiz:'trimestre',
     parent:'o-mar', area:'a-ope', acordado:'ses-jun',
     krs:[{id:'o-avc#k1', m:'desvío de avance de Marina', from:8, to:0, esperado:4, u:'pp', kpi:'k-avc', acc:'Residente de Obra'}],
     fuente:'acuerdo de la sesión de junio (ac-38)', conf:'alta'},
    {id:'o-dso', nm:'Cobrar la cartera dura de Marina',                 persp:'procesos',   horiz:'trimestre',
     parent:'o-caja', area:'a-tes', acordado:'ses-jun',
     krs:[{id:'o-dso#k1', m:'días de cobranza en Marina', from:91, to:65, esperado:80, u:'días', kpi:'k-dso', acc:'Jefe de Cobranza'}],
     fuente:'acta de directorio Q3', conf:'alta'},
    {id:'o-lic', nm:'Sacar las licencias de Centro Sur en plazo',       persp:'procesos',   horiz:'trimestre',
     parent:'o-lid', area:'a-dev', acordado:'ses-jun',
     krs:[{id:'o-lic#k1', m:'días para obtener licencia', from:112, to:60, esperado:85, u:'días', kpi:'k-lic', acc:'Jefe de Permisos'}],
     fuente:'expediente municipal + acta de directorio Q3', conf:'media'},
  ],

  /* áreas — el árbol se auto-calcula de parent (reporta_a real).
     v19 (D-32): NO llevan `madurez`. La madurez de un área es el ROLLUP de las capabilities de su
     subárbol (`capability.assessment`, con su escala declarada), igual que su digitalización se deriva
     de sus procesos. Un campo propio de tres colores bajo una leyenda que promete niveles 0-5 era un
     semáforo guardado sin marco detrás: se pinta desde su fuente o dice `sin evaluar`. */
  areas:[
    {id:'a-ger', nm:'Gerencia General',       lider:'Ricardo Salazar Cárdenas · Gerente General', parent:null,  conf:'alta'},
    {id:'a-com', nm:'Comercial',              lider:'Gabriela Quispe Ríos · Gerente Comercial',   parent:'a-ger',   conf:'media'},
    {id:'a-ven', nm:'Ventas',                 lider:'Alonso Mendoza Vega · Jefe de Ventas',       parent:'a-com',  conf:'media'},
    {id:'a-mkt', nm:'Marketing',              lider:'Brenda Navarro Quiroz · Jefe de Marketing',  parent:'a-com',   conf:'baja'},
    {id:'a-dev', nm:'Desarrollo y Proyectos', lider:'Edwin Cabrera León · Gerente de Desarrollo', parent:'a-ger',  conf:'media'},
    {id:'a-fin', nm:'Finanzas',               lider:'Daniel Torres Medina · CFO',                 parent:'a-ger',  conf:'alta'},
    {id:'a-con', nm:'Contabilidad',           lider:'Rosa Medina Chávez · Contador General',      parent:'a-fin',  conf:'alta'},
    {id:'a-tes', nm:'Tesorería y Cobranza',   lider:'Milagros Chávez Delgado · Jefe de Cobranza', parent:'a-fin',  conf:'baja', vacante:'jefatura Tesorería vacante'},
    {id:'a-rh',  nm:'Gestión Humana',         lider:'Doris Mendoza Cárdenas · Gerente de GH',     parent:'a-ger',  conf:'media'},
    {id:'a-ope', nm:'Operaciones',            lider:'Alberto Guerrero Osorio · Gte. Construcción',parent:'a-ger',  conf:'baja'},
    {id:'a-oft', nm:'Oficina Técnica',        lider:'Luis Huamán Villanueva · Jefe de Oficina Técnica', parent:'a-ope',  conf:'media'},
    {id:'a-log', nm:'Logística de Obra',      lider:'Ernesto Dávila Castillo · Jefe de Logística',parent:'a-ope',  conf:'media'},
    {id:'a-obr', nm:'Obras — proyectos',      lider:'Marco Silva Peralta · Residente de Obra',    parent:'a-ope',  conf:'media'},
    {id:'a-ti',  nm:'TI',                     lider:'Inés Dávila Núñez · Jefe de TI',             parent:'a-ger',  conf:'alta'},
  ],
  matrixEdges:[['a-fin','a-ope']], // controllers de obra: reporte funcional al CFO (matricial)

  /* ===== O3 · procesos — v20 (D-a, firmada 2026-07-30): el `tipo` es DATO, no inferencia =====
     Los tres tipos del mapa de procesos (ISO 9001 cl.4.4 · enfoque a procesos):
       `direccion` — cómo se gobierna la empresa: planear, revisar, decidir, controlar
       `negocio`   — los que producen y entregan lo que el cliente compra (la cadena, en su orden)
       `apoyo`     — los que sostienen a los otros dos sin tocar al cliente
     NO se deriva de `clasificacion` (APQC L3 · M12): la categoría 1.0 de APQC («desarrollar visión y
     estrategia») es "operating" ahí y es dirección pura en ISO — la inferencia se rompe en la primera
     fila. Misma doctrina que `kpi.dir` (D-31): donde la inferencia falla, el dato manda. Las dos
     clasificaciones conviven: APQC es la taxonomía universal (comparar), el tipo es el mapa (leer).
     Antes de v20 `apoyo` no era una clasificación sino un RESTO (todo lo que no estaba en la cadena),
     y los procesos de dirección no existían: el nivel 1 se producía fuera del mapa. */
  procesos:[
    {id:'p-cob',   tipo:'negocio', nm:'Cobranza de cuotas',           areas:['a-tes'],        dueno:'Jefe de Cobranza',     digital:'integrado', sist:['Nubecont ERP','Estudio legal'], sirve:['o-caja'],        conf:'alta',  flagship:true},
    {id:'p-vta',   tipo:'negocio', nm:'Venta de inmuebles',           areas:['a-ven'],        dueno:'Jefe de Ventas',       digital:'integrado', sist:['CRM Vendo','OSE FacturaLima'],   sirve:['o-mar','o-vis'], conf:'alta'},
    {id:'p-cierre',tipo:'apoyo',   nm:'Cierre contable mensual',      areas:['a-con','a-fin','a-ope'], dueno:'Contador General',digital:'integrado', sist:['Nubecont ERP','Excel caja obra'],sirve:['o-lid','o-caja'],conf:'alta'},
    {id:'p-ejec',  tipo:'negocio', nm:'Ejecución de obra',            areas:['a-obr','a-ope'],dueno:'Residente de Obra',    digital:'integrado', sist:['ValorizApp','BIM'],             sirve:['o-lid'],          conf:'media'},
    {id:'p-val',   tipo:'negocio', nm:'Valorización de obra',         areas:['a-oft'],        dueno:'Jefe de Oficina Técnica',digital:'integrado',sist:['ValorizApp','BIM'],           sirve:['o-lid'],          conf:'alta'},
    {id:'p-pago',  tipo:'apoyo',   nm:'Pago a proveedores y subcontratistas',areas:['a-con','a-tes'],dueno:'Contador General',  digital:'integrado', sist:['Nubecont ERP','Banca Empresas'],sirve:['o-caja'],         conf:'alta'},
    {id:'p-rec',   tipo:'apoyo',   nm:'Reclutamiento e incorporación',areas:['a-rh'],         dueno:'Gerente de GH',        digital:'manual',    sist:['—'],                            sirve:['o-eq'],           conf:'media'},
    {id:'p-camp',  tipo:'negocio', nm:'Campañas de marketing',        areas:['a-mkt'],        dueno:'Jefe de Marketing',    digital:'externo',   sist:['CRM Vendo','Meta Ads'],         sirve:['o-vis'],          conf:'media', driver:true},
    {id:'p-fact',  tipo:'negocio', nm:'Facturación de ventas',        areas:['a-con','a-ven'],dueno:'Contador General',     digital:'integrado', sist:['Nubecont ERP','OSE FacturaLima'],sirve:[],                conf:'alta'},
    {id:'p-post',  tipo:'negocio', nm:'Postventa y garantías',        areas:['a-com'],        dueno:'Coordinador de Postventa',digital:'integrado',sist:['CRM Vendo','Portal clientes'], sirve:[],                conf:'media', star:'NPS 42→31 · ningún KR la mide'},
    {id:'p-liq',   tipo:'apoyo',   nm:'Liquidación de obra',          areas:['a-con','a-oft'],dueno:'Contador General',     digital:'integrado', sist:['Nubecont ERP'],                 sirve:[],                conf:'media'},
    {id:'p-caja',  tipo:'apoyo',   nm:'Caja chica de obra',           areas:['a-tes','a-ope'],dueno:'Analista de Tesorería',digital:'manual',    sist:['Excel caja obra'],              sirve:[],                conf:'baja'},
    /* habilitante, no misional: sin licencia no se construye, pero el proceso no transforma el producto
       que el cliente compra. Que empuje una meta (`sirve`) no lo vuelve del negocio — el cierre contable
       y el pago a proveedores también empujan una y son de apoyo. El orden misional lo fija `DATA.cadena`. */
    {id:'p-perm',  tipo:'apoyo',   nm:'Permisos y licencias',         areas:['a-dev'],        dueno:'Jefe de Permisos',     digital:'externo',   sist:['Portal municipal','Estudio legal','BIM'], sirve:['o-lid'],  conf:'media'},
    {id:'p-dis',   tipo:'negocio', nm:'Diseño y desarrollo del proyecto', areas:['a-dev','a-oft'],dueno:'Gerente de Desarrollo',digital:'integrado', sist:['BIM'],                     sirve:[],                conf:'alta'},
    {id:'p-nom',   tipo:'apoyo',   nm:'Nómina y planillas',           areas:['a-rh'],         dueno:'Gerente de GH',        digital:'externo',   sist:['Nubecont ERP','Banca Empresas'],sirve:[],                conf:'media'},
    {id:'p-conc',  tipo:'apoyo',   nm:'Conciliación bancaria',        areas:['a-tes'],        dueno:'Jefe de Tesorería (vacante)',digital:'externo',sist:['Nubecont ERP','Banca Empresas'],sirve:[],              conf:'baja'},
    {id:'p-sop',   tipo:'apoyo',   nm:'Soporte y operación TI',       areas:['a-ti'],         dueno:'Jefe de TI',           digital:'integrado', sist:['Nubecont ERP','CRM Vendo'],     sirve:[],                conf:'alta'},

    /* — los procesos de DIRECCIÓN (D-b, firmada 2026-07-30). Ninguno es invención: los seis ya se
       ejercen en el twin (la sesión del nivel 1, el presupuesto, el registro de riesgos, el ciclo de
       mejora, la cola de cambios) — lo que no tenían era casilla en el mapa, dueño declarado, nivel de
       digitalización ni madurez. `produce` = su salida (lo que el nivel 1 consume); `tablero` = a dónde
       salta su ficha, para que el mapa CONTENGA el proceso que produce la sala del directorio en vez de
       dejarlo como un tablero paralelo. `sirve` queda vacío a propósito: la dirección no MUEVE un
       indicador, PRODUCE la meta que otros mueven — meterla en el hilo de oro sería confundir gobierno
       con ejecución (y encender cinco aristas falsas desde cada objetivo). — */
    {id:'p-plan',  tipo:'direccion', nm:'Planeamiento y despliegue de metas', areas:['a-ger'], dueno:'Gerente General', digital:'manual', sist:['—'], sirve:[], conf:'media',
      produce:'las metas del periodo y su bajada', detalle:'Traduce el rumbo a metas del periodo y las baja a cada gerencia con acuerdo ida y vuelta. Una meta sin bajada acordada queda ASIGNADA, no acordada — y esa diferencia predice el incumplimiento mejor que cualquier semáforo.',
      tablero:{mod:'territorio', nivel:1, mov:1, t:'Rumbo y metas — movimiento 2 de la sesión'}},
    {id:'p-rev',   tipo:'direccion', nm:'Revisión por la dirección', areas:['a-ger'], dueno:'Gerente General', digital:'manual', sist:['—'], sirve:[], conf:'alta',
      produce:'los acuerdos y el acta', detalle:'La sesión de directorio como proceso: entradas obligatorias (resultado del periodo, caja, riesgos, mejora), salidas con responsable y plazo. Es la cl.9.3 de la norma ejercida, no un anexo.',
      tablero:{mod:'territorio', nivel:1, mov:3, t:'Decisiones, acuerdos y acta — movimiento 4'}},
    {id:'p-pres',  tipo:'direccion', nm:'Presupuesto y control presupuestario', areas:['a-fin'], dueno:'CFO', digital:'externo', sist:['Nubecont ERP','Excel caja obra'], sirve:[], conf:'media',
      produce:'el presupuesto y su seguimiento', detalle:'Convierte la mezcla de ambición en plata asignada, y sigue lo comprometido contra lo aprobado. Toda apuesta o proyecto pasa por acá antes de existir.',
      tablero:{mod:'territorio', nivel:1, mov:1, t:'Presupuesto — movimiento 2 de la sesión'}},
    {id:'p-ries',  tipo:'direccion', nm:'Gestión de riesgos', areas:['a-ger'], dueno:'Gerente General', digital:'manual', sist:['—'], sirve:[], conf:'media',
      produce:'el registro de riesgos con dueño', detalle:'El directorio fija el apetito por categoría; la gerencia ejecuta la mitigación. Un riesgo sin mitigación comprometida es una preocupación, no un riesgo gestionado.',
      tablero:{mod:'territorio', nivel:1, mov:2, t:'Riesgos — movimiento 3 de la sesión'}},
    {id:'p-mej',   tipo:'direccion', nm:'Gestión de la mejora', areas:['a-ger'], dueno:'Gerente General', digital:'externo', sist:['—'], sirve:[], conf:'alta',
      produce:'brecha → proyecto → indicador movido', detalle:'El ciclo de mejora con vuelta atrás permitida. El veredicto de cada proyecto se escribe contra la serie real del indicador, jamás contra una lista de tareas cumplidas.',
      tablero:{mod:'mejora', t:'Módulo Mejora — el ciclo completo'}},
    {id:'p-camb',  tipo:'direccion', nm:'Gestión de cambios y documentación', areas:['a-ti'], dueno:'Jefe de TI', digital:'integrado', sist:['Nubecont ERP'], sirve:[], conf:'media',
      produce:'las versiones y las solicitudes', detalle:'Toda modificación del twin entra como solicitud con nivel de aprobación declarado: directa, revisión del dueño o comité. Nada se aplica solo.',
      tablero:{mod:'cambios', t:'Módulo Cambios — solicitudes y versiones'}},
  ],

  brechas:[
    {id:'g-avc', nm:'El avance real de Marina (87%) va detrás del declarado (95%) y compromete la entrega',
      sub:'Ocho puntos de brecha entre corte declarado y valorizable: cada mes de atraso son ~S/35k de gastos generales y una entrega que se corre.',
      tipo:'Desvío de meta', against:'p-ejec', kr:'o-avc#k1', costo:'S/ 35k/mes', sev:'alta', prio:'alta', estado:'accionable', apuesta:true, fuente:'corte de obra vs valorización (ValorizApp)', conf:'alta'},
    {id:'g-dso', nm:'El DSO de Marina (91 días) bloquea la meta de caja',
      sub:'Cada día de DSO en Marina ≈ S/500 de puente; la cola dura no responde a recordatorios y arrastra el consolidado.',
      tipo:'Desvío de meta', against:'p-cob', kr:'o-dso#k1', costo:'S/ 180k/año', sev:'alta', prio:'alta', estado:'accionable', fuente:'serie DSO del ERP (Nubecont)', conf:'alta'},
    {id:'g-post',nm:'La postventa se deteriora y ningún KR del ciclo la mide',
      sub:'El NPS de propietarios cayó 42→31 en un año; cada punto son referidos que no llegan a caseta. Brecha real, sin ancla de valor que la mida.',
      tipo:'Hallazgo', against:'p-post', kr:null, costo:'NPS 42→31', sev:'media', prio:'media', estado:'sin-ancla-de-valor', fuente:'NPS del portal de clientes', conf:'alta'},
    {id:'g-tes', nm:'La jefatura de Tesorería está vacante y la conciliación depende de una sola persona',
      sub:'Rol vacante hace 5 meses; la conciliación depende de un analista y el CFO aprueba por excepción.',
      tipo:'Hallazgo', against:'p-conc', kr:'o-caja#k2', costo:'rol vacante 5m', sev:'media', prio:'media', estado:'accionable', fuente:'organigrama + entrevista al CFO', conf:'alta'},
    {id:'g-cvis',nm:'La posición de caja por obra no es visible ni confiable entre cierres',
      sub:'La caja consolidada se arma a mano con ~5 días de rezago; entre cierres la dirección decide a ciegas.',
      tipo:'Hallazgo', against:'p-caja', kr:'o-caja#k2', costo:'decisión a ciegas', sev:'media', prio:'media', estado:'a-corroborar', fuente:'entrevistas de tesorería + Excel de caja', conf:'baja'},
    {id:'g-mca', nm:'La marca Terranova es débil y el tráfico comercial depende de portales pagados',
      sub:'Sin marca propia que jale tráfico, cada visita a caseta se compra: el costo por lead sube todos los trimestres.',
      tipo:'Hallazgo', against:'p-camp', kr:null, costo:'costo/lead ↑', sev:'baja', prio:'baja', estado:'off-thread', fuente:'costo por lead (Meta Ads) + entrevista comercial', conf:'media'},
    {id:'g-dep', nm:'El conocimiento municipal de permisos vive en UNA sola persona (bus factor 1)',
      sub:'El "cómo" de cada municipio (SM · PL · Surquillo) está en la cabeza de la Jefa de Permisos. Si sale, se va con ella — y un retraso de licencia bloquea el cronograma con banco y compradores de 3 proyectos.',
      tipo:'Hallazgo', against:'p-perm', kr:'o-lic#k1', costo:'bus factor 1 · 3 proyectos', sev:'alta', prio:'alta', estado:'accionable', fuente:'entrevistas de permisos — bus factor observado', conf:'alta'},
    {id:'g-aud', nm:'Los dos hallazgos de control interno del dictamen siguen abiertos',
      sub:'El auditor externo observó que la conciliación bancaria la prepara y la aprueba la misma persona, y que no hay evidencia de revisión de la caja de obra. Repetirlos el año próximo cuesta la opinión limpia.',
      tipo:'Hallazgo', against:'p-conc', kr:'o-caja#k2', costo:'opinión del auditor en riesgo', sev:'alta', prio:'alta', estado:'accionable', fuente:'dictamen del auditor externo — ejercicio 2025', conf:'alta'},
    {id:'g-prov',nm:'No se evalúa a los subcontratistas que ejecutan parte de la obra',
      sub:'Tres frentes de Marina los ejecuta un tercero sin criterios de selección ni evaluación de desempeño registrados: cuando el avance falla, no hay con qué sostener un reclamo ni con qué decidir si se le vuelve a contratar.',
      tipo:'Hallazgo', against:'p-ejec', kr:'o-avc#k1', costo:'reclamo sin sustento', sev:'media', prio:'media', estado:'accionable', fuente:'levantamiento de obra (M1) — cl.8.4 sin evidencia', conf:'alta'},
    {id:'g-doc', nm:'No existe procedimiento escrito de permisos y licencias',
      sub:'Cero guías en el corpus: cada expediente se arma de memoria y la tasa de observaciones (60%) no baja porque nadie registra el porqué de cada rechazo por municipio.',
      tipo:'Hallazgo', against:'p-perm', kr:null, costo:'observaciones 60%', sev:'media', prio:'media', estado:'accionable', fuente:'barrido del corpus documental — cero guías', conf:'alta'},
  ],

  /* ===== O2 · kpis — v19 =====
     `dir` (D-31): +1 = más es mejor · −1 = menos es mejor. Es DATO, no inferencia del orden de la
     banda: la inferencia se rompe en bandas de dos colas y con umbrales iguales, y el hilo de oro no
     puede colgar de una heurística. Es el mismo campo que llevan las cifras del periodo (D-26).
     `kr` (D-35/A2) reemplaza al viejo `obj`: el KPI mueve un CONTRATO DE CAMBIO (el KR), no un
     objetivo entero; el objetivo se alcanza subiendo por `krs[]`. Los `peso` de los KPI de un mismo KR
     SUMAN 1 (D-36) — si no, o falta un indicador o el peso está sin normalizar, y las dos se declaran.
     `nicho` (D-31/M48): la vara externa sale del eje vertical con su confianza; jamás un rango tecleado.
     `gap`: en un KPI sin `kr`, la brecha que SÍ lo cubre — "sin ancla" nunca queda huérfano del diagnóstico.
     El semáforo y el valor actual se DERIVAN al leer (nunca se guardan). */
  kpis:[
    {id:'k-avc', nm:'desvío de avance de Marina', unidad:'pp', proc:'p-ejec', dueno:'Residente de Obra',       kr:'o-avc#k1', peso:1, dir:-1, banda:{target:0,  amar:3,  rojo:5},  freq:'semanal',  conf:'media', fuente:'ValorizApp',
      mediciones:[{f:'feb',v:3},{f:'mar',v:4},{f:'abr',v:6},{f:'may',v:7},{f:'jun',v:7},{f:'jul',v:8}]},
    {id:'k-dso', nm:'días de cobranza en Marina', unidad:'días', proc:'p-cob', dueno:'Jefe de Cobranza',       kr:'o-dso#k1', peso:1, dir:-1, banda:{target:65, amar:80, rojo:90}, freq:'mensual',  conf:'alta',  fuente:'Nubecont ERP', nicho:'N-IMM-03',
      mediciones:[{f:'feb',v:88},{f:'mar',v:90},{f:'abr',v:89},{f:'may',v:92},{f:'jun',v:90},{f:'jul',v:91}]},
    {id:'k-dsoc',nm:'días de cobranza consolidados', unidad:'días', proc:'p-cob', dueno:'CFO',                 kr:'o-caja#k1',peso:1, dir:-1, banda:{target:60, amar:70, rojo:88}, freq:'mensual',  conf:'alta',  fuente:'Nubecont ERP', nicho:'N-IMM-03',
      mediciones:[{f:'feb',v:88},{f:'mar',v:78},{f:'abr',v:71},{f:'may',v:64},{f:'jun',v:60},{f:'jul',v:58}]},
    {id:'k-cob', nm:'cobranza por canal digital', unidad:'%', proc:'p-cob',   dueno:'Jefe de Cobranza',        kr:'o-cob#k1', peso:1, dir:1,  banda:{target:60, amar:30, rojo:8},  freq:'mensual',  conf:'alta',  fuente:'Nubecont ERP',
      mediciones:[{f:'feb',v:15},{f:'mar',v:14},{f:'abr',v:15},{f:'may',v:16},{f:'jun',v:15},{f:'jul',v:15}]},
    {id:'k-abs', nm:'absorción consolidada',  unidad:'%/mes', proc:'p-vta',   dueno:'Jefe de Ventas',          kr:'o-mar#k1', peso:1, dir:1,  banda:{target:3.5,amar:3.0,rojo:2.4},freq:'mensual',  conf:'alta',  fuente:'CRM Vendo', nicho:'N-IMM-02',
      mediciones:[{f:'feb',v:2.4},{f:'mar',v:2.5},{f:'abr',v:2.4},{f:'may',v:2.7},{f:'jun',v:2.5},{f:'jul',v:2.6}]},
    {id:'k-vis', nm:'visitas diarias a caseta', unidad:'/día', proc:'p-camp', dueno:'Jefe de Marketing',       kr:'o-vis#k1', peso:1, dir:1,  banda:{target:25, amar:18, rojo:12}, freq:'semanal',  conf:'baja',  fuente:'Declarado (caseta)', stale:true,
      mediciones:[{f:'mar',v:12},{f:'abr',v:13},{f:'may',v:15},{f:'jun',v:14}]},
    {id:'k-rot', nm:'rotación mensual',       unidad:'%/mes', proc:'p-rec',   dueno:'Gerente de GH',           kr:'o-eq#k1',  peso:1, dir:-1, banda:{target:2.5,amar:3.5,rojo:4.5},freq:'mensual',  conf:'media', fuente:'Nómina',
      mediciones:[{f:'feb',v:4.8},{f:'mar',v:4.4},{f:'abr',v:4.2},{f:'may',v:4.0},{f:'jun',v:4.1},{f:'jul',v:3.9}]},
    {id:'k-cie', nm:'días de cierre contable',unidad:'días',  proc:'p-cierre',dueno:'Contador General',        kr:'o-caja#k2',peso:0.3,dir:-1, banda:{target:5,  amar:8,  rojo:12}, freq:'mensual',  conf:'alta',  fuente:'Nubecont ERP',
      mediciones:[{f:'feb',v:9},{f:'mar',v:8},{f:'abr',v:7},{f:'may',v:6},{f:'jun',v:5},{f:'jul',v:4.5}]},
    {id:'k-caj', nm:'rezago de la caja por obra', unidad:'días', proc:'p-caja', dueno:'Analista de Tesorería', kr:'o-caja#k2',peso:0.7,dir:-1, banda:{target:1,  amar:3,  rojo:5},  freq:'diaria',   conf:'baja',  fuente:'—',
      mediciones:[]},
    {id:'k-mar', nm:'margen bruto por proyecto', unidad:'%',  proc:'p-liq',   dueno:'CFO',                     kr:'o-lid#k1', peso:1, dir:1,  banda:{target:18, amar:16, rojo:14}, freq:'mensual',  conf:'media', fuente:'Nubecont ERP · cierre contable', nicho:'N-IMM-07',
      mediciones:[{f:'feb',v:14.2},{f:'mar',v:14.9},{f:'abr',v:15.4},{f:'may',v:15.1},{f:'jun',v:15.6},{f:'jul',v:15.8}]},
    {id:'k-viv', nm:'viviendas entregadas acumuladas', unidad:'viv', proc:'p-ejec', dueno:'Gerente de Desarrollo', kr:'o-hog#k1', peso:1, dir:1, banda:{target:680, amar:620, rojo:560}, freq:'mensual', conf:'alta', fuente:'actas de entrega + ValorizApp',
      mediciones:[{f:'feb',v:562},{f:'mar',v:578},{f:'abr',v:597},{f:'may',v:614},{f:'jun',v:628},{f:'jul',v:640}]},
    {id:'k-lic', nm:'días para obtener licencia', unidad:'días', proc:'p-perm', dueno:'Jefe de Permisos',       kr:'o-lic#k1', peso:1, dir:-1, banda:{target:60, amar:85, rojo:120},freq:'por-evento',conf:'media',fuente:'Excel de permisos (a mano)',
      mediciones:[{f:'exp-11',v:74},{f:'exp-12',v:96},{f:'exp-13',v:88},{f:'exp-14',v:112}]},
    // — sin ancla de valor: ningún KR del ciclo los mide. Cada uno declara la brecha que SÍ los cubre —
    {id:'k-nps', nm:'satisfacción del propietario', unidad:'', proc:'p-post', dueno:'Coordinador de Postventa',kr:null, peso:null, dir:1,  banda:{target:50, amar:42, rojo:35}, freq:'trimestral',conf:'media', fuente:'Encuesta postventa', nicho:'N-IMM-08', gap:'g-post',
      mediciones:[{f:'T3-25',v:42},{f:'T4-25',v:39},{f:'T1-26',v:35},{f:'T2-26',v:31}]},
    {id:'k-obs', nm:'tasa de observaciones del municipio', unidad:'%', proc:'p-perm', dueno:'Jefe de Permisos',kr:null, peso:null, dir:-1, banda:{target:20, amar:35, rojo:50}, freq:'por-evento',conf:'baja', fuente:'Declarado — NO se mide por municipio (hallazgo)', gap:'g-doc',
      mediciones:[{f:'T1-26',v:60},{f:'T2-26',v:60}]},
    {id:'k-sla', nm:'días para cerrar un reclamo de postventa', unidad:'días', proc:'p-post', dueno:'Coordinador de Postventa', kr:null, peso:null, dir:-1, banda:{target:15, amar:22, rojo:30}, freq:'mensual', conf:'media', fuente:'Portal clientes', nicho:'N-IMM-08', gap:'g-post',
      mediciones:[{f:'abr',v:19},{f:'may',v:24},{f:'jun',v:28},{f:'jul',v:31}]},
  ],

  // cinética — proyectos_mejora (ilustrativos del loop O7) · pm-cie = loop CERRADO con veredicto (KPI movido)
  proyectos:[
    {id:'pm-mar', nm:'Recuperación de avance Marina', estado:'en-ejecución', pdca:'DO',   brecha:'g-avc', mueve:'k-avc', area:'a-ope', roi:'2.4×', delta:'−8pp → −2pp', ambicion:'operar', fuente:'acta de proyecto + corte quincenal', conf:'alta'},
    {id:'pm-cob', nm:'Cobranza digital · fase 1',     estado:'en-evaluación',pdca:'PLAN', brecha:'g-dso', mueve:'k-cob', area:'a-tes', roi:'1.8×', delta:'15% → 40%', idea:'i-wsp', ambicion:'operar', fuente:'charter en evaluación + caso ROI', conf:'media'},
    {id:'pm-cie', nm:'Cierre contable exprés',        estado:'cerrado',      pdca:'ACT',  brecha:null,    mueve:'k-cie', area:'a-con', roi:'3.1×', delta:'9 → 4.5 días', recompila:'h-cierre-cont', ambicion:'operar', fuente:'cierre verificado contra la serie del KPI', conf:'alta',
      resultado:{delta_observado:'9 → 4.5 días', veredicto:'movió', nota:'ACT documentado: checklist pre-cierre estandarizado (M16 PDCA) → recompilado al arnés del puesto'} },
  ],
};
