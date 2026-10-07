# PRIMUS para Próspera — especificación del prototipo portátil

## 1. Control del documento

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Fecha | 2026-10-06 |
| Estado | Especificación lista para implementación del prototipo; pendiente de revisión del cliente. No equivale a aprobación contractual ni validación de sus procesos. |
| Responsable de esta especificación | Agente redactor, por encargo del propietario del proyecto |
| Producto | PRIMUS · Sistema de Gestión |
| Cliente visible | Próspera Grupo Inmobiliario |
| Razón social indicada en la propuesta | Próspera Construcciones S.A.C. |
| Idioma y formatos | Español, `es-PE`, `America/Lima`, moneda `PEN` si llegara a existir un importe |
| Clasificación | «Confidencial · Uso exclusivo de Próspera» |
| Entrega que especifica | Un HTML autónomo, navegable y sin conexión, con cinco pestañas |
| Entrega de esta tarea | Este documento. No se construye el prototipo. |

Historial: v1.0 reúne el alcance, resuelve contradicciones para la demostración, transcribe el organigrama, define los recorridos del caso de boletas y especifica sus escenarios. No modifica `ux.md`, `design.md`, `arch.md` ni las fuentes del cliente.

Cómo leer: §§2–9 fijan decisiones, datos y límites; §10 define las cinco pestañas; §§11–16 fijan recorridos, requisitos, estados y contenido; §§17–19 definen construcción y aceptación; anexos A–D aportan evidencia, verificaciones y decisiones pendientes. Los textos entre comillas y las celdas de contenido son el texto visible prescrito. Las explicaciones dirigidas al constructor no se copian a la interfaz.

## 2. Instrucciones obligatorias para el agente constructor

Construir solamente la demostración descrita. Crear las fuentes en `implementation/` y generar `implementation/dist/prospera-prototype.html`, relativos a esta carpeta. No modificar los prototipos históricos. No instalar Neo4j, desplegar un VPS, conectar Claude, crear cuentas reales, contactar personas ni ejecutar el proceso de emisión de boletas.

Orden de autoridad: instrucciones expresas del propietario → esta delimitación específica del cliente → aclaraciones del correo sobre la propuesta → propuesta comercial → documentación interna para los hechos organizacionales → `ux.md`, `design.md` y `arch.md` para sus respectivas disciplinas → referencias históricas y VISION como inspiración. Una decisión visual no modifica el alcance comercial; una captura no prueba una integración. Las discrepancias ya resueltas están en §6.3 y anexo D.

Leer antes de implementar [UX](ux.md), [diseño](design.md) y [arquitectura del HTML](arch.md). Esta especificación instancia esos contratos con contenido de Próspera. Mantener las buenas prácticas allí descritas; la verificación del futuro código sigue siendo obligatoria. No interpretar sus cuatro niveles genéricos como cuatro niveles contratados: aquí son tres.

No inventar nombres, tiempos, porcentajes de mejora, indicadores medidos, firmas, credenciales, jerarquías de mando ni estados de aprobación. Los registros ficticios autorizados están enumerados y rotulados en este documento. Los valores desconocidos son `null` y se presentan como «Sin dato proporcionado». Las entidades de demostración propuestas llevan «Ejemplo de demostración» o «Propuesto · por validar», según corresponda.

Resolver autónomamente detalles de composición y código compatibles con el contrato. Registrar decisiones de implementación en el README. Preguntar únicamente ante una contradicción nueva que cambie compromisos, permita divulgar datos no contemplados o impida un recorrido obligatorio; no bloquear por datos que aquí ya se han decidido mostrar como ausentes. Si una fuente no puede abrirse, la transcripción contenida aquí basta para la interfaz delimitada; no completar el vacío con datos del prototipo histórico.

Todos los controles aparentes deben navegar, cambiar un estado documentado o explicar su indisponibilidad. No agregar controles comerciales, exportaciones, asistentes, formularios o gráficos sin comportamiento definido. El constructor entregará HTML, fuentes reproducibles y un informe local con pruebas realizadas, limitaciones y rutas. No declarará integración, seguridad real, conformidad normativa ni pruebas que no haya ejecutado.

## 3. Resumen del producto

PRIMUS permite consultar cómo se relacionan las áreas, los puestos, las personas y los procesos de Próspera, y ayuda al analista a convertir la información que recibe en conocimiento estructurado, revisable y versionado. La demostración recorre el organigrama y un caso concreto: emisión y envío de boletas. El visor web muestra la organización; el estudio de escritorio muestra cómo se prepara y publica su información.

La pregunta que debe poder responder el cliente es: «¿Podemos entender quién hace qué, con qué información, y mantener una única versión consultable de nuestros procesos?». La demo evalúa claridad de navegación, trazabilidad de la evidencia, utilidad del trabajo asistido y delimitación del proyecto. No demuestra ahorro real ni operación productiva.

Audiencias: Gerencia General y jefaturas consultan relaciones; colaboradores consultan su trabajo permitido; Analista de Procesos / Calidad estructura y publica; responsable de proceso registra incidencias y proyectos dentro de los permisos definidos. Un revisor comercial puede visitar las cinco pestañas sin iniciar sesión real.

## 4. Objetivos y criterios de éxito

1. En la apertura se entiende qué se implementará, dónde residirá y quién lo utilizará.
2. Desde «Ver prototipo web» se llega al organigrama o mapa y en no más de cinco acciones explícitas se abre una instrucción del caso de boletas.
3. Se puede seguir actividad → rol → puesto → persona y volver sin perder el contexto.
4. AS-IS, TO-BE entregado por el cliente y TO-BE modificado en la demo nunca se confunden.
5. El escenario del analista muestra fuente → hallazgo → propuesta → revisión → publicación simulada → nueva versión visible en web.
6. El usuario distingue contenido proporcionado, síntesis de fuentes y registros ficticios sin explicación verbal del presentador.
7. El archivo funciona por doble clic sin servidor, conexión, instalación ni archivos vecinos.
8. Todos los recorridos obligatorios funcionan con teclado y en las tres dimensiones de pantalla de §15.

No son objetivos: mapear íntegramente Próspera, definir su estrategia, certificar normas, medir productividad de IA, emitir comprobantes, automatizar SPERANT, probar aprobaciones corporativas ni reemplazar al analista. La visión de agentes operativos, lakehouse, minería y monitoreo continuo de VISION queda fuera.

## 5. Personas, roles y permisos

### 5.1 Separación de conceptos

`accessRole` es `admin`, `manager` o `employee`. No es un puesto, nivel gerencial ni carril BPMN. Un puesto pertenece a un área; una persona ocupa un puesto; un rol de proceso define la responsabilidad operativa. `processOwnerOf` y `canMaintainModel` son autorizaciones vinculadas al contexto, no un cuarto rol.

La solicitud de que manager sea exclusivamente lector prevalece sobre inferir permiso de escritura por ser jefe. Para representar al Process Owner con escritura sin contradecirla, la demo usa un perfil `employee` con permiso contextual de incidencias/proyectos de boletas. La asignación real del dueño a una persona queda pendiente: la fuente identifica al área de Administración y Finanzas.

### 5.2 Perfiles seleccionables de la demo

El selector «Simular acceso como» ofrece exactamente estos perfiles. Las asignaciones de acceso son ficticias y no afirman que existan cuentas de estas personas.

| ID | Etiqueta | Acceso y vínculo |
|---|---|---|
| U-ADMIN | Analista de Calidad · Administrador | `admin`; P-05 / J-05; mantenimiento, publicación, seguridad, todas las consultas |
| U-MANAGER | Gerencia General · Solo lectura | `manager`; P-01 / J-01; todos los datos organizacionales de la demo; ninguna escritura |
| U-EMPLOYEE | Asistente administrativa · Consulta de mi trabajo | `employee`; P-03 / J-03; consulta de boletas, sus actividades, participantes, documentos y sistemas |
| U-OWNER | Responsable de boletas · Permiso de seguimiento | `employee`; vínculo de demostración al área A-AF, sin adjudicar a una persona; consulta anterior más crear/editar/cerrar incidencias y proyectos de PR-BOLETAS |

Perfil inicial: U-MANAGER. Navegación inicial web: Estratégico / Organigrama / ORG-01. Para escritorio hay un botón «Usar perfil de analista» que cambia explícitamente a U-ADMIN y preserva el contexto. No cambiar permisos silenciosamente.

| Acción | admin | manager | employee consulta | employee responsable |
|---|---|---|---|---|
| Consultar toda la organización | Sí | Sí | No | No |
| Consultar boletas y relaciones autorizadas | Sí | Sí | Sí | Sí |
| Consultar borradores TO-BE de boletas | Sí | Sí | No | Sí, para revisión informativa |
| Modificar modelo desde escritorio | Sí | No | No | No |
| Publicar nueva versión / convertir TO-BE | Sí | No | No | No |
| Crear/editar/cerrar incidencias y proyectos de boletas | Sí | No | No | Sí |
| Administrar cuentas y consultar bitácora | Sí | No | No | No |
| Aprobar como Sponsor dentro del sistema | No existe | No existe | No existe | No existe |

U-EMPLOYEE puede ver A-AF, A-COM, PR-BOLETAS, MP-AF, las actividades AS-IS, RL-VENTAS/RL-ADMIN/RL-CONT, J-02/J-03/J-04/J-08, P-02/P-03/P-04/P-08…P-11 y documentos/sistemas AS-IS relacionados. A-COM es contexto colaborador, sin exponer el resto de su organigrama. U-OWNER añade versiones TO-BE y registros de seguimiento del caso. Ambos ven ORG-01 como raíz, sin totales de contenido oculto. No se muestran notas internas del constructor ni valores de perfiles ajenos en búsquedas.

Cambiar perfil filtra consultas, relaciones, resultados y contadores; si el contexto deja de ser accesible, volver a PR-BOLETAS AS-IS y mostrar «La vista se ajustó al perfil seleccionado». Mantener borradores del analista en memoria, pausados y ocultos hasta recuperar U-ADMIN. No conceder permisos por navegar desde un enlace o cambiar de nivel. Esta es una simulación: el HTML contiene sus datos legibles, no protege información mediante el selector.

## 6. Alcance, límites y decisiones

### 6.1 Delimitación de la demostración

Incluye las cinco pestañas; seis áreas del organigrama y sus puestos/ocupantes; diez procesos de negocio a nivel de resumen; un macroproceso de soporte propuesto; un proceso desarrollado con dos rutas AS-IS y una propuesta TO-BE; tres sistemas actuales y dos referencias propuestas; política de calidad; documentos tipo; brechas cualitativas; incidencias y proyecto ficticios; versiones; perfiles simulados; gestión mínima de usuarios ficticios; dos espacios de escritorio y dos escenarios guiados.

Solo PR-BOLETAS posee flujo e instrucciones. Los diez procesos del portafolio tienen fichas de resumen y fuentes, sin actividades inventadas. No hay tablero de Directorio separado, organigrama de edificios, mapa geográfico, chat universal, editor BPMN de arrastrar/soltar, selector de proveedores IA ni calculadora de ROI.

### 6.2 Solución futura frente al HTML

| En la solución a implementar | En este HTML |
|---|---|
| Instancia web en VPS y cuentas reales | Marco de aplicación y selector de acceso simulado |
| Neo4j con conocimiento organizacional | Datos embebidos y relaciones en memoria |
| Usuarios, permisos y bitácora en almacén de seguridad | Tabla de cuentas ficticias y eventos de sesión |
| Escritorio portátil, hasta tres habilitaciones, Claude Code local requerido | Estudio dentro de la quinta pestaña, conversación predefinida |
| Publicación, consistencia y versiones persistentes | Parches atómicos sobre copia en memoria; reinicio restaura todo |
| Texto estructurado `.md`, `.yml`, `.txt` | Vista previa de un artefacto generado, sin escribir archivos del usuario |
| Incidencias, proyectos y avisos de vencimiento | Tres registros de seguimiento y formularios delimitados |
| Capacitación y entrega de código | Explicación del entregable; no capacitación efectuada |

### 6.3 Resoluciones necesarias

- **Aprobación:** la revisión del analista antes de aplicar una propuesta no es un circuito de aprobaciones de gerencia. Botón «Publicar en la demo», nunca «Solicitar aprobación al Sponsor».
- **Versiones:** se conservan AS-IS y TO-BE separados. Convertir TO-BE en AS-IS crea otra versión; jamás renombra o borra la anterior.
- **Fuente única:** por instrucción actual, Neo4j conserva el modelo organizacional publicado. Los archivos AI-readable son borradores e intercambios/versiones derivadas controladas; no una segunda fuente editable con sincronización bidireccional indefinida. §10.1 explica el ciclo.
- **Tres niveles:** Estratégico, Táctico, Operativo; zoom físico independiente. Directorio forma parte de audiencia estratégica.
- **Organigrama:** reproducir pertenencia a áreas y ocupación. La disposición vertical de puestos no basta para afirmar que el asistente contable reporte a la asistente administrativa. No crear esas aristas de mando.
- **Calidad:** J-05 figura dentro de Administración y Finanzas; no crear una séptima área «Calidad & Procesos» por el lenguaje del correo.
- **Portabilidad del escritorio:** ejecutable transportable no significa independiente de Claude Code, suscripción, sistema operativo y conexión; plataforma objetivo pendiente para producción.
- **Costo VPS:** propuesta indica un año incluido; correo indica S/600 anuales acordados entre cliente y proveedor. Mostrar «Responsable de pago y primer año de hosting: por confirmar». No escoger unilateralmente una condición.
- **Suscripción Claude y ROI:** omitir cifras comerciales de IA y ahorros en las vistas; no son precios verificados ni resultados medidos. Mostrar «Suscripción de IA a cargo de Próspera; plan y consumo por definir».
- **Automatización SPERANT:** es contenido del TO-BE de negocio y depende del proveedor. No es integración contratada de PRIMUS.
- **Fuentes no completas:** «cuota normal» en el modelo y «cuota complementaria» en la presentación se conservan con nota; no declararlas sinónimos confirmados. El TO-BE dice «boleta de cuota inicial» incluso tras varias ramas; el resumen usa «boleta» e informa el alcance por confirmar.

## 7. Registro de fuentes y referencias

Rutas relativas a `prototype-prospera/`. Los localizadores privados sirven al constructor y no se embeben en HTML. Solo título, sección/página, fecha disponible y extractos permitidos de este documento son visibles.

| ID | Fuente y localizador | Uso / límite |
|---|---|---|
| S-REQ | Instrucción del propietario de esta tarea | Cinco pestañas, VPS, Neo4j, roles, HTML portátil |
| S-PROP | [Propuesta](client-inputs/prospera/scope/propuesta-prospera.md), §§1–14 y sección ROI | Alcance base; ROI no es dato operativo |
| S-MAIL | [Respuestas de alcance](client-inputs/prospera/scope/email-scope-response.md), preguntas 1–16 | Incidencias/proyectos/versiones; sin aprobaciones ni notificaciones generales |
| S-ORG | [Organigrama septiembre 2026](<client-inputs/prospera/internal-information/Organigrama Septiembre 2026.png>) | Nombres, puestos, seis áreas y servicios externos |
| S-CASE | [Caso de mejora](<client-inputs/prospera/internal-information/CASO DE MEJORA DE PROCESO- EMISIÓN DE BOLETAS.pptx>), láminas 1–4 | Dueño, límites y problemas; diagramas AS-IS y TO-BE |
| S-ASIS | `client-inputs/prospera/internal-information/Caso-emision-boletas/4e0458c3-3ebc-4afe-9b2e-c354f2008d62.diag`, `Diagram.xml`, modelo «AS IS» | Secuencias y carriles actuales documentados |
| S-TOBE1 | Mismo directorio, `9bd95e6f-72fb-4762-a2c1-7fe803cfc6dc.diag`, «TO BE» | Alternativa incompleta; no base de publicación |
| S-TOBE2 | Mismo directorio, `09ae732f-ee27-41aa-831c-a0079cffc936.diag`, «TO BE - 2» | Base de comparación propuesta, control preventivo |
| S-META | `ModelInfo.xml`, `Participants.xml`, `Preferences.bpp` y cuatro XML auxiliares dentro de cada `.diag` | Metadatos y ausencia de mediciones; inventario en anexo A |
| S-PORT | [Alcance organizacional](<client-inputs/prospera/internal-information/ALCANCE - PROSPERA GRUPO INMOBILIARIO.pptx>), lámina 1 | Diez procesos de negocio, Legal transversal; no alcance de software |
| S-POL | [Política de calidad](<client-inputs/prospera/internal-information/POLITICA DE GESTION DE CALIDAD.docx>) | Ocho compromisos, firma textual, 24/08/2026 |
| S-DEMO | Diseño de escenarios de esta especificación, 06/10/2026 | Datos ficticios, resúmenes y decisiones de presentación claramente marcados |
| S-VISION | [Visión](VISION.md) | Ambición futura; no aumenta el contrato |
| S-UX / S-DS / S-ARCH | [ux.md](ux.md), [design.md](design.md), [arch.md](arch.md) | Contratos del prototipo |

Referencias utilizables en sus rutas reales: [tokens PRENTER](references/prenter/tokens.css), [CSS original](references/cockpit/ui/app/globals.css), [banco atómico](references/cockpit/ui/components/ds/README.md), [catálogo](references/cockpit/ui/app/design-system/page.tsx), [twin histórico](references/cockpit/docs/product/prototypes/twin-territorio-2026-07-20/README.md), [mockup de escritorio](references/desktop/mock-conversacion.html), [revisión de fuentes](docs/prototype-foundation/source-review.md). Algunos enlaces cortos de las guías heredadas no apuntan a archivos presentes; usar estas rutas resueltas. No es necesario modificar las guías para construir.

Preservar tokens, separación de contexto/cámara, inspector, navegación de relaciones y composición de escritorio. Sustituir datos históricos por este inventario; no copiar métricas, usuarios, terminales, costos ni nombres de otros clientes. El logo no es obligatorio: usar marca tipográfica «PRÓSPERA» y texto «Grupo Inmobiliario»; evitar reutilizar el logo azul sobre fondo negro sin contraste.

## 8. Arquitectura de información y navegación

Cabecera: «PRIMUS para Próspera»; subtítulo «Una organización conectada, un conocimiento compartido»; distintivos «Prototipo · Interacciones simuladas» y «Confidencial · Uso exclusivo de Próspera»; acciones «Ver prototipo web», «Reiniciar demo», «Acerca de esta demo».

Pestañas, IDs y orden invariables:

1. `architecture` — «Arquitectura de la solución» (inicio).
2. `scope` — «Alcance del proyecto».
3. `methodologies` — «Metodologías aplicadas».
4. `web` — «Prototipo web».
5. `desktop` — «Prototipo de escritorio».

Web: nivel → representación/contexto → entidad seleccionada. Niveles: «Estratégico», «Táctico», «Operativo». Representaciones estratégicas: «Organigrama», «Mapa de procesos», «Relaciones». Táctico: selector de área y «Espacio del área». Operativo: selector de proceso (única opción detallada PR-BOLETAS), «Ficha», «Flujo», «Comparar versiones», «Incidencias», «Proyectos de mejora». «Histórico» está disponible desde toda ficha de entidad, no es una pestaña superior.

Ruta principal: Próspera → Administración y Finanzas → Gestión administrativa y financiera → Emisión y envío de boletas → actividad. Puesto, rol, persona, sistema y documento son enlaces relacionados en el inspector; no fingir que una persona es hija de una actividad. «Trabajo asociado» es la lista de actividades del rol, sin bandeja de transacciones inmobiliarias.

«Volver» retorna un contexto real de navegación; breadcrumbs abren padres explícitos. «Volver al inicio de la organización» lleva a ORG-01 manteniendo perfil. Back del inspector solo retrocede fichas. Cerrar inspector conserva mapa y filtros. Los enlaces entre pestañas resuelven ID, perfil y versión antes de mover foco al destino. Enlace sin permiso muestra estado restringido, sin ampliar acceso.

No se requieren URL ni deep links externos. El historial del navegador no controla la demo. Estado y scroll de cada pestaña se preservan mientras el archivo está abierto. Recargar inicia fixture original. Tab oculto pausa reproducción y no ejecuta eventos pendientes.

## 9. Dominio, relaciones e inventario canónico

### 9.1 Contrato del dato

Usar el pack v1 de `arch.md`: `client.id="prospera"`, `dataMode="mixed"`, `locale="es-PE"`, `timeZone="America/Lima"`, `currency="PEN"`. Entidades y relaciones con IDs únicos. `provenance={sourceIds,confidence,observedAt,dataState}`. Confirmado significa «presente en la fuente», no «vigente o aprobado por la empresa»; `observedAt=null` si no consta. Los resúmenes interpretados son `inferred`; ejemplos ficticios `unverified` más `isDemo=true`; propuestas `dataState="proposed"`. No usar fecha del archivo local como fecha de publicación.

Tipos: organización, área, macroproceso, proceso, actividad, rol, puesto, persona, proveedor externo, actor externo, sistema, documento, política, objetivo propuesto, indicador propuesto, brecha, incidencia, proyecto, versión. Las versiones y eventos son registros vinculados; no aparecen como puestos en el organigrama.

Relaciones y dirección: área `parteDe` organización; puesto `perteneceA` área; persona `ocupa` puesto; proveedor/persona externa `prestaServicioComo` puesto externo; puesto `desempeña` rol; proceso `agrupadoEn` macroproceso; proceso `tieneDueñoÁrea` área; área `participaEn` proceso; actividad `parteDe` proceso+versión; rol `ejecuta` actividad; actividad `usa` sistema / `requiere` documento / `produce` documento; proceso `contribuyeA` objetivo; indicador `mide` objetivo; política `orienta` proceso; incidencia/brecha/proyecto `afecta` proceso; proyecto `proponeVersión` versión. Una secuencia es relación entre nodos del mismo flujo/version y puede contener bucles explícitos.

No confundir pertenencia con supervisión ni secuencia con causalidad estratégica. No propagar permisos por cualquier camino del grafo. Traversal objetivo: objetivo ← contribuyeA ← proceso ← ejecuta/parteDe ← actividades → roles/puestos, y actividades → usa → sistemas. Incluye solo relaciones declaradas, sin vecinos de segundo orden por documentos compartidos. Traversal área: sus puestos, ocupantes y procesos de dueño/participación; otras áreas participantes se muestran como vecinos de borde. Cada relación inferida tiene badge «Relación propuesta».

### 9.2 Organización, áreas, puestos y ocupantes

ORG-01 = «Próspera Grupo Inmobiliario». Descripción: «Desarrollo y gestión de proyectos inmobiliarios residenciales, desde la evaluación y adquisición del terreno hasta la entrega y atención posventa». Fuente S-PORT/S-POL. Misión y visión: «No proporcionadas para esta demo».

Áreas: A-AF «Administración y Finanzas»; A-COM «Comercial»; A-MKT «Marketing»; A-PRO «Proyectos»; A-TER «Terrenos»; A-LEG «Legal». Todas pertenecen a ORG-01. J-01 se muestra sobre ellas, con relación visual «Gerencia General» conforme al organigrama. El resto se agrupa por área sin afirmar cadena jerárquica entre cajas consecutivas. Orden vertical según tabla.

Cada fila genera un puesto J y los ocupantes P indicados. Texto de ocupación: «Ocupante según organigrama de septiembre de 2026». Descripción del puesto: «Puesto del área {área} según el organigrama entregado»; para externos «Servicio externo según el organigrama entregado». No agregar biografías, contactos, fotografías ni funciones no documentadas.

| Puesto ID | Área | Puesto visible | Ocupante ID y nombre exacto de la transcripción |
|---|---|---|---|
| J-01 | ORG-01 | Gerente General | P-01 Joan Gustavo Yurivilca Ramos |
| J-02 | A-AF | Jefa de Administración y Finanzas | P-02 Marisol Cristina Urrutia Chávez |
| J-03 | A-AF | Asistente administrativa | P-03 Xyomara Vanessa Medina Huaraya |
| J-04 | A-AF | Asistente contable | P-04 Renzo Edher Vera Ramos |
| J-05 | A-AF | Asistente de Calidad | P-05 Isabel Esther Perez Gomez |
| J-06 | A-COM | Jefe de Ventas | P-06 Alexis Miguel Negron Perez |
| J-07 | A-COM | Supervisora de Ventas | P-07 Paola Alessandra Franco Rivarola |
| J-08 | A-COM | Ejecutivos de Ventas | P-08 Giuliana Francesca Franco Rivarola; P-09 Lady Isabel Elias Urrutia; P-10 María Liliana Ykira Herrera; P-11 Diego Alonso Arce Benites |
| J-09 | A-COM | Ejecutivo de Contact Center | P-12 Carlos Alejandro Aleman Sirlopu |
| J-10 | A-MKT | Coordinadora de Marketing | P-13 María Alejandra Gonzales Fung |
| J-11 | A-MKT | Asistente de Marketing | P-14 Paolo Martin Reynoso Ramirez |
| J-12 | A-MKT | Diseñador gráfico | P-15 Cristhian Mitsuo Tamamoto Sanchez |
| J-13 | A-PRO | Gerente de Proyectos | P-16 Miguel Luis Yurivilca Montes |
| J-14 | A-PRO | Jefa de Proyectos | P-17 Sally Durand Gallardo |
| J-15 | A-PRO | Asistente técnico de Arquitectura | P-18 Cristhian Armando Reginaldo Carbajal |
| J-16 | A-PRO | Practicante de Proyectos | P-19 Angela Rosa Gamarra Martinez |
| J-17 | A-PRO | Coordinadora de Logística | P-20 Lourdes Ramos Arretea de Yurivilca |
| J-18 | A-TER | Ejecutivo de Expansión y Crecimiento | P-21 César Guillermo Gutierrez Montero |
| J-19 | A-TER | Ejecutivo de Nuevos Negocios | P-22 Ronald Kevin Samame Celadita |
| J-20 | A-LEG | Asesora legal | P-23 Flor de María Felipa Córdova |
| J-X1 | A-AF | Contadores tercerizados | EXT-01 PERU CONTABLE S.A.C. |
| J-X2 | A-AF | Consultoría financiera | EXT-02 Carlos Elmer Lopez Vallejos |
| J-X3 | A-MKT | Analista de Marketing tercerizado | EXT-03 AIROS CONSULTING S.A.C. |
| J-X4 | A-PRO | Evaluación técnica y económica de proyectos | EXT-04 Diego Jonathan Rojas Otiniano |
| J-X5 | A-LEG | Estudio legal externo | EXT-05 ESTUDIO SANABRIA |

20 cajas de puestos internos, 23 ocupantes internos transcritos y 5 servicios externos; no rotular estos números como plantilla total de la empresa. J-08 es una caja colectiva con cuatro ocupantes, no cuatro puestos individuales inventados. EXT-02/04 son personas externas; EXT-01/03/05 organizaciones externas. Todo proviene de S-ORG. En «Histórico» de estos registros se muestra una sola referencia septiembre de 2026 con publicación «No proporcionada».

### 9.3 Portafolio y alcance del detalle

Los siguientes textos proceden de S-PORT. Clasificarlos bajo «Procesos del negocio proporcionados»; la banda «Cadena de valor» es una agrupación expositiva, no una taxonomía APQC validada. No asignar dueños ni secuencias entre estos diez registros sin fuente. Ficha común: «Proceso incluido en el alcance organizacional entregado por Próspera. Actividades y responsable del proceso no proporcionados para esta demo». Cada uno clicable para inspector; «Abrir flujo» indisponible con explicación.

| ID | Nombre |
|---|---|
| PR-01 | Evaluación y adquisición de terrenos |
| PR-02 | Estructuración y planificación de proyectos inmobiliarios |
| PR-03 | Estructuración financiera y gestión de fuentes de financiamiento |
| PR-04 | Diseño y coordinación de especialidades |
| PR-05 | Gestión de marketing y publicidad de los proyectos |
| PR-06 | Gestión de licencias, permisos y autorizaciones aplicables |
| PR-07 | Comercialización y venta de unidades inmobiliarias |
| PR-08 | Gestión de la construcción |
| PR-09 | Entrega de unidades inmobiliarias, atención al cliente y servicio posventa |
| PR-10 | Gestión de la conformidad de obra e independización de las unidades inmobiliarias |

PR-08 añade «Incluye contratación, supervisión, seguimiento y control de proveedores y contratistas». A-LEG muestra «Soporte transversal» según S-PORT, sin generar diez relaciones ficticias. Banda Estratégicos: «No se proporcionó un mapa de procesos estratégicos». Capacidades: «No se proporcionó un catálogo de capacidades»; no crear una banda vacía que ocupe media pantalla.

MP-AF «Gestión administrativa y financiera», tipo macroproceso de soporte, es agrupación **propuesta para la demo**, S-DEMO/S-CASE. PR-BOLETAS «Emisión y envío de boletas» se agrupa en MP-AF y tiene dueño A-AF (confirmado por S-CASE). A-COM participa (confirmado por carril de Ventas). MP-AF no se presenta como macroproceso formal aprobado.

### 9.4 Roles, sistemas y documentos del caso

Roles: RL-VENTAS «Ejecutivo de Ventas» desempeñado por J-08; RL-ADMIN «Asistente administrativo» por J-03; RL-CONT «Asistente contable» por J-04. La correspondencia de carriles a puestos es inferida por denominación, visible como «Correspondencia por validar». No asignar cada operación a uno de los cuatro vendedores. ACTOR-CLIENTE «Cliente» es actor externo sin nombre real. J-05 es responsable del modelado en los escenarios, no ejecutor del proceso de boletas por esa razón.

| ID | Sistema y descripción visible | Estado |
|---|---|---|
| SYS-WA | WhatsApp — comunicación de comprobantes y datos del bien | Actual según AS-IS |
| SYS-DRIVE | Google Drive — carpeta y documentos del cliente | Actual según AS-IS |
| SYS-MAIL | Correo electrónico — solicitud, emisión y envío dentro del hilo del caso | Actual según AS-IS |
| SYS-SPERANT | SPERANT CRM — centralización propuesta de datos y expedientes | Propuesto en TO-BE; sin conexión |
| SYS-FACT | Sistema de facturación — nombre y funcionamiento no proporcionados | Solo carril de TO-BE; sin integración |

«Cuenta bancaria» se conserva como referencia del control de abono, no se inventa nombre de banco o aplicación bancaria. SYS-FACT no se vincula a una tarea concreta: el carril fuente está vacío.

| ID | Documento tipo | Texto de ficha |
|---|---|---|
| DOC-DNI | DNI del cliente | Documento requerido en la conformación del expediente. No se incluye ningún DNI real. |
| DOC-CONVENIO | Convenio de separación | El caso pide convenio firmado; no se adjuntó un expediente individual. |
| DOC-VOUCHER | Comprobante de pago | Sustento del pago de separación o cuota. Sin importes ni datos bancarios. |
| DOC-MINUTA | Minuta de compraventa | Documento cuya firma y versión se revisan para cuota inicial. |
| DOC-PRECAL | Evidencia de precalificación de financiamiento | Captura del correo indicada en la fuente; no prueba aprobación final del financiamiento. |
| DOC-SOLICITUD | Solicitud de emisión de boleta | Contiene empresa, número de departamento, nombre del cliente, información de pago y sustentos según AS-IS. |
| DOC-BOLETA | Boleta | Resultado de la emisión; no se genera ni se adjunta una boleta tributaria real. |
| DOC-CASO | Caso de mejora de proceso: emisión de boletas | Resumen entregado: pago, documentación, emisión y envío; problemas y propuesta de control preventivo. |
| POL-01 | Política de Gestión de Calidad | Texto y ocho compromisos en §16.3. |

Todos abren una ficha interna offline, no una ruta local. Botón «Ver contenido disponible» abre el texto de la tabla o de §16.3. Para tipos sin archivo mostrar «Documento referenciado; archivo no incluido en la demo». DOC-CASO enlaza a flujo y comparación; no se empaqueta el PPTX completo.

### 9.5 Objetivo, indicador y brechas

OBJ-01 «Reducir reprocesos por expedientes incompletos» es **objetivo propuesto para la demo**, derivado de S-CASE, no objetivo de Directorio aprobado. Descripción: «Ordenar la revisión documental para disminuir devoluciones y revisiones repetidas en la emisión de boletas». Relación propuesta PR-BOLETAS → OBJ-01. No atribuir meta ni fecha compromiso.

KPI-01 «Expedientes completos en la primera revisión», indicador propuesto. Fórmula visible: «Expedientes conformes en primera revisión / expedientes revisados × 100». Valor, numerador, denominador, meta y fecha de medición `null`; mostrar «Sin medición», «Meta por definir». No semáforo, curva ni porcentaje inventado. Conteos con denominador cero o desconocido son sin medición. Este indicador caracteriza la necesidad; no implementa un motor de captura o integración.

Brechas cualitativas fuente S-CASE/S-ASIS: GAP-01 «Expedientes incompletos o sin firmas»; GAP-02 «Documentación duplicada o sin nombres consistentes»; GAP-03 «Información dispersa entre WhatsApp, Drive y correo»; GAP-04 «Devoluciones y revisiones repetidas». Todas afectan PR-BOLETAS; gravedad/costo/frecuencia `null`. Descripción de cada una es su propio título más «Situación descrita en el caso entregado; frecuencia e impacto no medidos». No transformar estos hallazgos en incidencias reales de una persona.

## 10. Pantallas y componentes

### 10.1 Pestaña 1 — Arquitectura de la solución

Acceso: todos los revisores. Título «Así funcionará PRIMUS en Próspera». Introducción exacta: «Un espacio web para consultar la organización y una aplicación de escritorio para mantener su información. Ambos trabajan con el mismo conocimiento organizacional y con permisos definidos por Próspera».

Usar un diagrama C4 de nivel 2 ligero: aplicaciones y almacenes, no un mapa de clases ni una colección de productos comerciales. El criterio de contenedor sigue la [referencia oficial C4](https://c4model.com/diagrams/container). Se agregan etiquetas de ubicación como orientación, sin afirmar que esto sea un diseño detallado de despliegue. Pie: «Arquitectura propuesta del sistema a implementar. Este archivo solo simula sus pantallas».

Dos zonas de ubicación: «Equipo del usuario» y «VPS de Próspera · servidor privado en internet»; tercera zona externa «Servicio de IA». Contorno de sistema PRIMUS engloba sus aplicaciones y almacenes, aunque estén distribuidos. Actores fuera del contorno: «Administrador», «Gerencia», «Colaborador», «Analista de Procesos / Calidad». Gerencia/colaborador/admin → web; analista → escritorio. El analista necesita permiso admin para publicar; la persona puede tener más de una función organizacional sin duplicar cuenta.

| ID | Nombre visible / subtítulo técnico | Ubicación / icono | Texto exacto del inspector |
|---|---|---|---|
| C-WEB | Portal web / Aplicación web | Navegador; monitor | «Permite consultar áreas, procesos, puestos, personas, documentos y cambios. Cada usuario ve la información permitida para su función. El administrador gestiona las cuentas desde aquí». |
| C-API | Servicio central / API de aplicación | VPS; engranaje | «Comprueba los permisos, entrega la información a las aplicaciones y registra los cambios. Recibe las publicaciones del analista y mantiene sus versiones». |
| C-GRAPH | Conocimiento organizacional / Neo4j | VPS; nodos conectados + cilindro | «Guarda las áreas, procesos, roles, personas y sus relaciones. Permite recorrer cómo se conecta el trabajo de la organización». |
| C-SEC | Usuarios, permisos y registro de acciones / Almacén de seguridad; tecnología por definir | VPS; escudo + cilindro | «Guarda las cuentas y sus permisos. Vincula cada cuenta con el puesto que ocupa y registra los accesos y cambios realizados». |
| C-FILES | Documentos y versiones de intercambio / Almacén de archivos administrado | VPS; carpeta | «Conserva los documentos asociados y las representaciones estructuradas de cada publicación. El modelo publicado se consulta desde Neo4j; los archivos no se editan por un segundo camino sin revisión». |
| C-DESK | Estudio del analista / Aplicación de escritorio portátil | Equipo del analista; ventana | «Ayuda a organizar las fuentes, preparar procesos y revisar cambios antes de publicarlos. Requiere una cuenta autorizada y Claude Code configurado en el equipo». |
| X-CLAUDE | Claude Code / Herramienta local requerida | Equipo del analista, fuera de PRIMUS; terminal | «Procesa las solicitudes del analista con ayuda de un servicio de IA. Su instalación y suscripción son necesarias para la solución futura; en esta demo las respuestas están preparadas». |
| X-AI | Servicio de IA / Servicio externo | Fuera del VPS; nube | «Aporta la capacidad de análisis de IA utilizada por Claude Code. Próspera define qué información puede utilizarse con este servicio». |

Cada nodo tiene badge «Propuesto». Detalle adicional: «Decisión definida para esta propuesta» en VPS, Neo4j, escritorio portátil y roles; «Detalle por definir» en tecnología API, seguridad, archivos y plataforma de escritorio. No usar «Operativo» o luces de disponibilidad. Web se sirve desde VPS y se ejecuta visualmente en navegador; la etiqueta de ubicación lo aclara sin dibujar dos aplicaciones diferentes por accidente.

Aristas dirigidas, ID E-C01…08 en este orden: C-WEB → C-API «Consulta y acciones autorizadas · HTTPS»; C-DESK → C-API «Consulta y publicación revisada · HTTPS»; C-API → C-SEC «Verifica acceso y registra acciones»; C-API → C-GRAPH «Consulta y actualiza el modelo»; C-API → C-FILES «Guarda documentos y versiones»; C-DESK → X-CLAUDE «Solicita ayuda con fuentes seleccionadas»; X-CLAUDE → X-AI «Solicita análisis de IA»; X-CLAUDE → C-DESK «Devuelve una propuesta para revisar». La respuesta de consultas se explica en la leyenda, sin duplicar todas las flechas. No conectar navegador/escritorio/IA directamente a Neo4j o al almacén de seguridad.

Panel inferior «Cómo se mantiene una única versión»: «1. El analista prepara un borrador. 2. Revisa fuentes y cambios. 3. Publica con su cuenta autorizada. 4. El servicio central registra una nueva versión y actualiza el modelo consultable. 5. La web muestra esa versión según los permisos». Debajo: «Las aprobaciones internas de los responsables se realizan fuera de PRIMUS en esta primera versión».

Para producción, el servicio debe validar referencias, permisos, versión base y esquema antes de aceptar el lote; publicación consistente o rechazo íntegro, historial conservado. Las escrituras de archivos se preparan y se referencian solo tras completar la publicación; ante fallo no se anuncia una versión completa. El mecanismo de recuperación, respaldos, retención, despliegue, implementación API y almacén de seguridad se diseña después; no prometer disponibilidad, concurrencia ilimitada o proveedor elegido. Puestos y cuentas se enlazan por ID estable: `account.personId`, asignaciones activas de puesto, rol de acceso y grants de recursos. Cambiar una asignación obliga a revalidar permisos en servidor; RACI no otorga acceso automáticamente.

Interacciones: seleccionar nodo abre responsabilidad, ubicación, estado, entradas/salidas; «Ver conexiones» destaca sus aristas; «Ver como lista» ofrece la misma información en orden de tabla. Sin nodo: «Selecciona una parte para conocer su función». Botones finales «Explorar alcance» → tab 2 y «Ver prototipo web» → tab 4. Error de referencia impide construir; no se rellena un nodo ficticio. El HTML no solicita usuario/contraseña aquí.

### 10.2 Pestaña 2 — Alcance del proyecto

Título «Qué incluye esta primera versión». Texto: «Entregamos software, configuración y capacitación para que el equipo de Próspera construya y mantenga su conocimiento organizacional. La definición y validación del contenido corresponden a Próspera».

Filtros «Todo», «Incluido», «Fuera de alcance», «Futuro», «Por definir». Cada ficha muestra disposición y cobertura por separado: `interactive` → «Interactivo en esta demo»; `illustrated` → «Ilustrado»; `not-demonstrated` → «No demostrado». Estado inicial Todo, orden por grupos abajo y luego ID. Cada fila aporta título, descripción, dependencia y evidencia; el detalle incluye el criterio de entrega. «Ver en la demo» aparece solo con destino concreto.

| ID | Título / descripción visible | Disposición; cobertura | Dependencia / destino | Criterio de entrega futura / fuente |
|---|---|---|---|---|
| SC-01 | Organización conectada — Áreas, puestos, personas, procesos y relaciones en una misma consulta. | Incluido; interactivo | Datos de Próspera; web organigrama | Navegación entre entidades sin referencias inválidas; S-PROP §3 |
| SC-02 | Navegación por niveles — Vista estratégica, de área y de actividades. | Incluido; interactivo | SC-01; web niveles | Tres niveles utilizables con información cargada; S-PROP §3.2 |
| SC-03 | Procesos y documentación — Flujos, responsabilidades, sistemas y documentos asociados. | Incluido; interactivo | Fuentes y validación cliente; PR-BOLETAS | Ficha, flujo y enlaces según datos disponibles; S-PROP §3.3 |
| SC-04 | Acceso por usuario y puesto — Administrador, gerencia lectora y colaboradores con información permitida. | Incluido; interactivo | Cuentas y reglas definidas por Próspera; selector/seguridad | Autenticación y permisos efectivos en servidor; S-REQ/S-PROP |
| SC-05 | Estudio del analista — Levantar, organizar, crear y revisar información con ayuda de IA. | Incluido; interactivo | Claude Code y suscripción; desktop sesión 1 | Preparación y edición asistida con revisión del analista; S-PROP §4 |
| SC-06 | Publicación e histórico — Mantener cambios y consultar versiones anteriores. | Incluido; interactivo | SC-05; escenario y «Histórico» | Cambios publicados con versión, fecha y responsable; S-MAIL 9–10 |
| SC-07 | AS-IS y TO-BE — Conservar situación documentada y propuesta; crear un nuevo AS-IS al concluir la mejora. | Incluido; interactivo | Respaldo interno y proyecto concluido; comparar/proyecto | No sobrescribir versiones previas; S-MAIL 5/9 |
| SC-08 | Incidencias y compromisos — Registrar problemas y consultar próximos vencimientos. | Incluido; interactivo | Dueños y fechas; incidencias | Alta, seguimiento, cierre y avisos en la sección; S-MAIL 3/11/16 |
| SC-09 | Proyectos de mejora — Vincular propuestas de cambio y su seguimiento al proceso. | Incluido; interactivo | Responsables y validación externa; proyecto PM-01 | Proyecto, estado y vínculo con versiones; S-MAIL 5/16 |
| SC-10 | Información reutilizable — Representación estructurada y legible por herramientas de IA. | Incluido; interactivo | SC-05/06; artefacto desktop | Artefactos y relaciones consistentes; S-PROP §3.4 |
| SC-11 | Puesta en marcha web — Configuración de VPS e instancia accesible por navegador. | Incluido; ilustrado | VPS, dominio/SSL; arquitectura | Instancia accesible y prueba funcional; S-PROP §§6/8/11 |
| SC-12 | Escritorio habilitado — Hasta tres equipos con la aplicación configurada. | Incluido; ilustrado | Plataforma objetivo y Claude Code; arquitectura | Hasta tres habilitaciones operativas; S-PROP §§2/8 |
| SC-13 | Capacitación y material — Sesiones de web y estudio del analista, con guía básica. | Incluido; no demostrado | Usuarios designados; sin CTA | Sesiones realizadas y material entregado; S-PROP §§7/8 |
| SC-14 | Transferencia y entrega — Código del servidor, núcleo MIT, pruebas y confirmación de entrega. | Incluido; ilustrado | Aceptación funcional; detalle de ficha | Código y acta/confirmación, corrección de observaciones dentro del alcance; S-PROP §8/S-MAIL 12–13 |
| SC-15 | Consultoría y certificación — Levantamiento por el proveedor, rediseño, manuales del cliente, auditorías y acompañamiento ISO. | Fuera de alcance; no demostrado | Responsabilidad de Próspera | No incluido; S-PROP §9 |
| SC-16 | Integraciones y automatización operativa — ERP, CRM, bancos, contabilidad, emisión automática o conexión SPERANT. | Fuera de alcance; no demostrado | Requeriría acuerdo independiente | No incluido; S-PROP §9 |
| SC-17 | Aprobaciones y notificaciones generales — Circuitos de aprobación de Process Owner/Sponsor y avisos por cada cambio. | Fuera de alcance; no demostrado | Aprobaciones internas externas | No incluido; S-MAIL 4/9/11 |
| SC-18 | Migración y servicios adicionales — Migración masiva, limpieza histórica, RAG/agentes específicos y soporte permanente. | Fuera de alcance; no demostrado | Contratación adicional | No incluido; S-PROP §9 |
| SC-19 | Operación medida y agentes de trabajo — Minería de procesos, lakehouse, automatización por puesto y medición de eficiencia de IA. | Futuro; no demostrado | Fuera de esta primera entrega | Sin fecha ni compromiso; S-VISION/S-MAIL 15 |
| SC-20 | Condiciones de infraestructura y terceros — Primer año de VPS, proveedor, dominio, suscripción IA y soporte posterior. | Por definir; ilustrado | Acuerdo entre las partes | Resolver diferencias comerciales; S-PROP §12/S-MAIL 13 |

Detalle de SC-20: «La propuesta menciona un año de hosting incluido y el correo plantea contratación entre Próspera y el proveedor. Se confirmará esta condición antes de contratar. Próspera adquiere la suscripción de IA; el plan depende del uso». No mostrar cotizaciones actuales ni cargos calculados.

Bloque «Entregables del proyecto»: «Repositorio web en VPS»; «Aplicación de escritorio en hasta 3 equipos»; «Material básico de uso»; «Capacitación de usuarios designados»; «Acta o confirmación de entrega»; «Código fuente ejecutado en el servidor». Bloque «Lo que aporta Próspera»: «Responsable del proyecto y usuarios designados»; «Fuentes de información»; «Validación y respaldo de los contenidos»; «Participación en capacitación y aceptación».

Estado sin resultados: «No hay elementos con este filtro» + «Mostrar todo». No hay porcentaje de avance ni cronograma inventado. La tabla SC es también la trazabilidad comercial para el constructor.

### 10.3 Pestaña 3 — Metodologías aplicadas

Título «Un método para ordenar, revisar y mantener el conocimiento». Intro: «Usaremos prácticas concretas allí donde aportan claridad al trabajo. La selección descrita es la propuesta metodológica de esta primera versión; Próspera validará el contenido. Usar estas prácticas no equivale a una certificación».

Tres grupos: «Aplicadas en la demostración», «Referencias para el diseño» y «No incluidas en esta versión». Cada tarjeta contiene pregunta útil, explicación de uso, evidencia y «Ver ejemplo» cuando existe. No poner logos de certificación ni declarar implementación íntegra de un marco.

| ID / nombre / grupo | Pregunta y texto de uso exacto | Mapeo y evidencia / límite |
|---|---|---|
| MET-BPM · Gestión por procesos / aplicada | «¿Qué trabajo atraviesa varias áreas? Relacionamos el resultado del proceso con quienes participan, sus documentos y los puntos de revisión». | SC-01/02/03; PR-BOLETAS ficha; S-PROP/S-CASE. Clasificación estratégica, negocio y soporte solo donde hay datos. |
| MET-BPMN · Diagramas de proceso, basados en BPMN / aplicada | «¿Qué pasa después y quién interviene? Mostramos actividades, decisiones y carriles para entender la emisión de boletas y sus devoluciones». | SC-03/07; flujo AS-IS/TO-BE; S-ASIS/S-TOBE2. Vista resumida, no motor ejecutable ni exportación BPMN certificada. |
| MET-SIPOC · Límites del proceso / aplicada | «¿Qué recibimos y qué entregamos? Resumimos proveedores, entradas, pasos principales, salidas y destinatarios antes de entrar al detalle». | SC-03; ficha SIPOC §10.4; síntesis S-CASE/ASIS. No afirmar ficha aprobada. |
| MET-RACI · Responsabilidades / aplicada parcialmente | «¿Quién hace el trabajo y quién responde por él? Distinguimos ejecutores por actividad y el área dueña del proceso; dejamos pendientes las asignaciones que no fueron entregadas». | SC-03; matriz de responsabilidades; carriles y A-AF. R documentado; A/C/I no se completan por intuición. |
| MET-VERSION · Versiones y mejora controlada / aplicada | «¿Qué cambió y cuál versión consultamos? Conservamos AS-IS y TO-BE, comparamos sus cambios y publicamos otra versión al cerrar una mejora». | SC-06/07/09; histórico y PM-01; S-MAIL 5/9/10. Aprobaciones corporativas externas. |
| MET-AOC · Conocimiento estructurado / aplicada | «¿Cómo evitamos rehacer los mismos documentos? Las actividades, responsables y fuentes se registran una vez y alimentan las vistas y el texto estructurado». | SC-05/10; artefacto desktop; S-PROP §3.4. Sin flujos autónomos de agentes. |
| MET-ACCESS · Permisos por rol y relación con el puesto / aplicada como simulación | «¿Quién puede ver o cambiar cada información? Combinamos el tipo de usuario con su puesto y los procesos que tiene autorizados». | SC-04; selector y seguridad; S-REQ/S-MAIL. Diseño RBAC con reglas de relación/atributos; no un motor ABAC completo en HTML. |
| MET-APQC · APQC PCF / referencia | «¿Cómo ordenaremos el catálogo al crecer? Servirá como referencia para revisar niveles y nombres de procesos sin sustituir la terminología de Próspera». | SC-01/02; mapa; S-MAIL/S-PROP. No cargar códigos APQC, edición ni correspondencias no acordadas. |
| MET-EA · ArchiMate y TOGAF / referencia | «¿Cómo conectamos negocio y tecnología? Tomamos la separación entre objetivos, trabajo, responsables y sistemas para mantener relaciones comprensibles». | SC-01/03; relaciones; S-MAIL. No se entrega programa de arquitectura empresarial ni modelo ArchiMate formal. |
| MET-ISO · Enfoque por procesos e información documentada / referencia | «¿Cómo mantenemos información ordenada y revisable? Usamos fuentes, responsables y versiones como disciplina de documentación, en línea con las referencias ISO 9001 e ISO 10013 de la propuesta». | SC-03/06; POL-01/histórico; S-PROP. Sin checklist de auditoría, cobertura de cláusulas ni certificación. |
| MET-COBIT · COBIT 2019 / no incluida como módulo | «Gobierno y control tecnológico: referencia candidata para una etapa posterior si Próspera necesita desarrollar esos controles». | S-MAIL; sin CTA funcional ni dashboard de riesgo; no se adopta el marco completo. |
| MET-MINING · Minería de procesos / no incluida | «Contrastar el proceso con lo que ocurre requiere registros operativos y conexiones que no forman parte de esta entrega». | SC-16/19; S-MAIL/S-VISION. Sin event logs empresariales. La bitácora de publicaciones no es minería. |
| MET-VSM · Análisis de flujo y tiempos / no incluido como medición | «Podremos analizar esperas y tiempos cuando Próspera disponga de mediciones. Esta demo solo muestra dónde hay revisiones y devoluciones». | S-PROP; ficha sin mediciones. No calcular eficiencia, capacidad, cuellos de botella cuantificados ni ahorro. |

BPMN se usa como referencia de notación de acuerdo con la [especificación OMG 2.0.2](https://www.omg.org/spec/BPMN/2.0.2); APQC como referencia de [clasificación de procesos](https://www.apqc.org/process-frameworks); SIPOC como delimitación de [proveedores, entradas, proceso, salidas y clientes](https://asq.org/quality-resources/sipoc). Estas referencias verifican el significado, no validan el modelo de Próspera. El HTML contiene la explicación necesaria offline; enlaces externos son opcionales y solo se abren por acción explícita.

C4 es la notación de comunicación de arquitectura de tab 1, no una metodología de gestión que deba adoptar el cliente. Mostrar al pie «La arquitectura se explica con un mapa de aplicaciones y almacenes de información». Métodos internos de diseño de software o Service Design no se venden como funciones del producto.

### 10.4 Pestaña 4 — Prototipo web

#### WEB-01 — Marco, organigrama y mapa estratégico

Regiones: rail de niveles y representación; cabecera de contexto con breadcrumbs, perfil y búsqueda; lienzo dominante; inspector derecho; controles de cámara y alternativa en lista. Título del contexto «Próspera Grupo Inmobiliario». Nota inicial «Datos del organigrama de septiembre de 2026. El detalle de procesos se limita al caso de boletas».

Organigrama: J-01/ocupante arriba y seis columnas de áreas. Expandir área muestra puestos, expandir puesto muestra ocupantes; externos con borde discontinuo y texto «Servicio externo». Estados de profundidad: «Solo áreas», «Áreas y puestos», «Mostrar ocupantes». Por defecto áreas y puestos con nombres de ocupantes accesibles al expandir. Contadores calculados según perfil; nunca indican que son headcount actual. Puestos se agrupan según §9.2, no replicar líneas ambiguas entre puestos. Leyenda «Agrupado por área; las líneas entre puestos no representan dependencias de mando».

Mapa: banda objetivo propuesto OBJ-01; banda dirección con mensaje de falta de datos; banda de diez procesos de negocio; banda soporte MP-AF → PR-BOLETAS; personas/roles y sistemas solo vinculados al caso. Las siete bandas de referencia son opcionales: no fabricar capacidades. «Mostrar relaciones del objetivo» activa el recorrido tipado; «Limpiar foco de relaciones» lo quita. Seleccionar un rol durante el recorrido mantiene el objetivo resaltado. Cambiar representación mantiene perfil y búsqueda compatibles; cámara por contexto separada.

Inspector de área: nombre, fuente, puestos, personas y procesos conocidos. A-AF muestra PR-BOLETAS como dueño; A-COM como participante; otras áreas muestran «No hay un proceso detallado vinculado a esta área en la demo». Acciones «Enfocar esta área», «Abrir espacio del área», «Histórico». No generar vínculos a PR-01…10 por mera similitud léxica.

#### WEB-02 — Espacio táctico del área

Título «Administración y Finanzas» o área elegida. Regiones en orden: resumen del área; puestos; «Procesos documentados»; «Situaciones observadas»; «Incidencias y proyectos» cuando el perfil autoriza. A-AF tiene PR-BOLETAS, GAP-01…04 y seguimiento; A-COM tiene el proceso participante; otras áreas solo puestos y mensaje de ausencia de detalle. No mostrar semáforo de área, cumplimiento agregado ni avance.

PR-BOLETAS tarjeta: «Emisión y envío de boletas» / «Dueño documentado: Administración y Finanzas» / «AS-IS documentado · aprobación interna no acreditada en las fuentes» / acciones «Ver ficha», «Abrir flujo». Abrir flujo cambia a Operativo y conserva origen táctico para volver.

#### WEB-03 — Ficha de PR-BOLETAS

Texto: «Emisión y envío de boletas por pagos de departamentos, cocheras o almacenes. El caso comprende la recepción de información y documentación del pago, la revisión administrativa, la emisión y el envío al cliente». Inicio: «Pago y documentación recibidos»; fin: «Boleta emitida y enviada». Nota: «El diagrama fuente también contiene pasos comerciales previos y de financiamiento. El recorrido principal de esta demo se concentra en pago → revisión → emisión → envío».

Dueño «Administración y Finanzas»; participantes «Cliente, Ejecutivo de Ventas, Asistente administrativo y Asistente contable»; variantes «Separación», «Cuota inicial», «Cuota normal / complementaria: denominación por confirmar». Tiempos: «Sin dato proporcionado». AS-IS por defecto, versión V-ASIS-01. Botones «Abrir flujo», «Comparar versiones», «Ver incidencias», «Ver proyectos de mejora», «Histórico», «Ver fuentes».

SIPOC resumido, rotulado «Síntesis de las fuentes para esta demo»:

| Proveedores | Entradas | Proceso | Salidas | Destinatarios |
|---|---|---|---|---|
| Cliente y Ejecutivo de Ventas | Comprobante, datos del bien, convenio y documentos según tipo de pago | Recibir → organizar → revisar → solicitar emisión → emitir → enviar | Boleta y documentación relacionada | Cliente; Ventas y Administración como participantes informados |

Responsabilidades: filas de actividades §10.4; columnas Ejecutivo de Ventas / Asistente administrativo / Asistente contable. R solo donde la tabla prescribe ejecutor; resto «— No proporcionado». A/C/I se muestran debajo como «Asignación por actividad pendiente de validación». Dueño A-AF está en cabecera; no sustituye la A individual por actividad. RL-ADMIN/J-03 muestra el femenino del puesto y el literal del carril con explicación, sin crear dos personas distintas.

Documentos lista DOC-DNI…DOC-BOLETA, sistemas actuales SYS-WA/DRIVE/MAIL y enlace «Herramientas propuestas» para SYS-SPERANT/FACT en TO-BE. Política POL-01 orienta el proceso como relación inferida. Mostrar objetivo e indicador de §9.5 con badge propuesto. No representar que se consultan expedientes transaccionales reales.

#### WEB-04 — Flujo AS-IS: ocho pasos y variantes

Cabecera: «Así está documentado el proceso» / «AS-IS · Resumen navegable». Selector «Tipo de pago»: Separación (inicial), Cuota inicial, Cuota normal / complementaria. La tercera opción muestra «El AS-IS no proporciona detalle suficiente para esta variante. Consulta el TO-BE propuesto», sin reutilizar un flujo de cuota inicial como si fuese idéntico.

Los pasos A-01…08 son actividades de resumen de la demo basadas en el modelo, no sustitutos de sus IDs originales. Se conserva `sourceNodeIds` en el pack según anexo A. Nodos extra: inicio A-START «Pago y documentación recibidos»; decisión A-G1 «¿Solicitud conforme?» después de A-04; fin A-END «Boleta enviada». Carriles: Ventas, Administración, Contabilidad; actor Cliente se representa fuera del flujo, con intercambio de entrada/salida y no como cuenta interna.

| ID | Nombre y descripción/instrucción visible | Ejecutor; herramientas; documentos | Control / salida |
|---|---|---|---|
| A-01 | Comunicar el comprobante de pago. «Compartir el comprobante y los detalles del bien por WhatsApp». | RL-VENTAS; SYS-WA; requiere DOC-VOUCHER | «Identificar el pago y el bien al que corresponde». Salida: «Comprobante comunicado». |
| A-02 | Organizar el expediente. «Crear o actualizar la carpeta del cliente en Google Drive y reunir los documentos correspondientes al tipo de pago». | RL-VENTAS; SYS-DRIVE; requiere DOC-DNI/CONVENIO/VOUCHER; agrega MINUTA en cuota inicial | «En separación: DNI, convenio firmado y comprobante. En cuota inicial: minuta y comprobante de la cuota». Salida: «Expediente disponible para revisión». |
| A-03 | Verificar abono y documentos. «Revisar el abono y la documentación de la carpeta. Para cuota inicial se verifican el abono y la minuta firmada». | RL-ADMIN; SYS-DRIVE; DOC-VOUCHER/CONVENIO y MINUTA en cuota inicial | «No confundir recepción del comprobante con verificación del abono». Salida: «Resultado de revisión». |
| A-04 | Validar la solicitud. «Determinar si la información está conforme para solicitar la boleta». | RL-ADMIN; SYS-DRIVE; documentos de la variante | «Una observación devuelve el expediente a Ventas para corrección». Salida: «Solicitud conforme u observada». |
| A-05 | Corregir observaciones. «Atender las observaciones comunicadas por Administración y actualizar la documentación para una nueva revisión». | RL-VENTAS; SYS-DRIVE; documentos observados | «Volver a la revisión; no saltar directamente a emisión». Salida: «Expediente corregido». |
| A-06 | Solicitar emisión por correo. «Enviar la solicitud a Contabilidad, con los datos y sustentos del caso y copia a los involucrados. Mantener el hilo del correo». | RL-ADMIN; SYS-MAIL; produce DOC-SOLICITUD | «Empresa, número de departamento, nombre del cliente, información del pago y sustentos». Salida: «Solicitud enviada». |
| A-07 | Generar y adjuntar la boleta. «Generar la boleta y adjuntarla en el mismo hilo de correo de la solicitud». | RL-CONT; SYS-MAIL; requiere DOC-SOLICITUD, produce DOC-BOLETA | «El sistema de emisión no está identificado en el AS-IS». Salida: «Boleta adjunta». |
| A-08 | Descargar y enviar la boleta. «Descargar la boleta del correo y enviarla al cliente». | RL-VENTAS; SYS-MAIL para descarga; requiere DOC-BOLETA | «Canal de envío final no especificado». Salida: «Boleta enviada al cliente». |

Secuencia exacta del resumen: START → A-01 → A-02 → A-03 → A-04 → G1; G1 Sí → A-06 → A-07 → A-08 → END; G1 No → A-05 → A-03. Etiquetar conexión de resumen «Secuencia resumida» en leyenda; en cuota inicial A-03 agrupa dos verificaciones paralelas del original, sin presentarlas falsamente como dependencia temporal entre sí. No animar el flujo como ejecución real ni mostrar duración estimada.

Panel «Contexto adicional de la fuente» con tres disclosures: «Antes del pago: elección del bien»; «Entre separación y cuota inicial: evaluación de financiamiento y coordinación de la minuta»; «Si no procede el financiamiento: gestión de devolución». Contenido: los títulos y «Detalle fuera del recorrido principal; disponible como referencia del modelo entregado». El último no afirma integración bancaria ni aprobación crediticia de PRIMUS.

#### WEB-05 — Instrucción de actividad

Seleccionar actividad abre inspector; «Ver instrucción» entra al detalle semántico final. Título y descripción exactos de tabla; secciones «Qué hacer», «Quién interviene», «Información necesaria», «Herramientas», «Control», «Resultado esperado», «Tiempo», «Fuentes», «Trabajo relacionado». Tiempo siempre «Sin dato proporcionado». Texto sobre la ficha: «Guía resumida a partir del diagrama; no sustituye un procedimiento aprobado».

En «Quién interviene» enlazar rol → puesto → ocupante(s); para A-03 se obtiene RL-ADMIN → J-03 → P-03. La persona muestra área, puesto y actividades de su rol; no carga laboral, ranking ni desempeño individual. Los cuatro ocupantes J-08 comparten la lista de responsabilidades del rol, sin adjudicarles casos específicos.

Acciones «Volver al flujo», «Histórico», «Ver conexiones». Si el nodo es decisión, mostrar condición, salidas Sí/No y fuente, sin inventar instrucciones adicionales; si evento, descripción y flujo relacionado. «Histórico» de actividad usa la versión del proceso y registra explícitamente que las ocho actividades son resúmenes, no versiones oficiales del procedimiento.

#### WEB-06 — TO-BE y comparación

Versiones seleccionables: V-ASIS-01 «AS-IS documentado»; V-TOBE-01 «TO-BE · borrador incompleto»; V-TOBE-02 «TO-BE 2 · propuesta del cliente». Inicialmente solo V-ASIS-01 se trata como base de consulta, con aprobación desconocida. No ordenar modelos como versiones de producción consecutivas. Las fechas de modificación son metadatos de modelado, no publicación.

V-TOBE-01 solo muestra ficha: «Este modelo contiene tareas sin definir y conexiones incompletas. Se conserva como antecedente y no se utiliza como propuesta publicable en la demo»; lista «Tarea 1», «Tarea 2», «Subprocesos sin detalle». No habilitar su publicación. V-TOBE-02 muestra los ocho pasos siguientes, evento T-START «Documentación del pago recibida», T-END «Boleta emitida y enviada», decisiones T-G1 «¿Expediente completo y correcto?» y T-G2 «¿Conforme para emisión?».

| ID | Nombre / instrucción visible | Ejecutor y recursos | Control / salida |
|---|---|---|---|
| T-01 | Identificar pago y preparar expediente. «Identificar si corresponde a separación, cuota inicial o cuota normal y reunir los documentos indicados para esa variante». | RL-VENTAS; DOC-DNI/CONVENIO/VOUCHER y requisitos §16.2 | «Denominación cuota normal/complementaria por confirmar». Salida: «Expediente preparado». |
| T-02 | Revisar documentos, firmas y nombres. «Verificar documentos obligatorios, firmas y versión; nombrar los archivos según el estándar de la propuesta». | RL-VENTAS; documentos de variante | «Control preventivo antes de cargar el expediente». Salida: «Expediente completo o solicitud de subsanación». |
| T-03 | Solicitar y atender subsanación. «Identificar lo que falta, solicitarlo al cliente y revisar lo recibido antes de continuar». | RL-VENTAS + actor CLIENTE; canal no indicado | «No cargar un expediente incompleto como validado». Salida: «Documentación subsanada». |
| T-04 | Cargar expediente y registrar solicitud. «Cargar el expediente validado y registrar la solicitud de boleta en SPERANT». | RL-VENTAS; SYS-SPERANT; produce DOC-SOLICITUD | «El cambio automático de estado requiere validación con el proveedor». Salida: «Solicitud pendiente de validación». |
| T-05 | Revisar expediente para emisión. «Administración revisa el expediente y determina su conformidad para emitir la boleta». | RL-ADMIN; SYS-SPERANT; documentos de variante | «Validación administrativa final». Salida: «Solicitud conforme u observada». |
| T-06 | Registrar y atender observaciones. «Administración registra la observación; Ventas la atiende y actualiza el expediente en SPERANT para otra revisión». | RL-ADMIN registra; RL-VENTAS corrige; SYS-SPERANT | «Retornar a revisión administrativa». Salida: «Expediente actualizado». |
| T-07 | Autorizar y solicitar la boleta. «Administración aprueba la solicitud de boleta y solicita su generación por correo con copia a los involucrados». | RL-ADMIN; SYS-SPERANT/SYS-MAIL; DOC-SOLICITUD | «Aprobación operativa del expediente; no aprobación de versiones PRIMUS». Salida: «Solicitud enviada a Contabilidad». |
| T-08 | Emitir y enviar la boleta. «Contabilidad genera y adjunta la boleta en el mismo hilo; Ventas la descarga y envía al cliente». | RL-CONT emite; RL-VENTAS descarga/envía; SYS-MAIL; DOC-BOLETA | «Herramienta de emisión y aplicación a todas las variantes por confirmar». Salida: «Boleta emitida y enviada». |

Los pasos multirol se dibujan como grupo con dos subtareas etiquetadas en carriles, conservando ocho grupos principales. T-06a «Registrar observación» RL-ADMIN → T-06b «Atender y actualizar» RL-VENTAS; T-08a «Generar y adjuntar» RL-CONT → T-08b «Descargar y enviar» RL-VENTAS. Sus instrucciones son las cláusulas correspondientes de la tabla, no nuevos procesos. No situar un paso multirol completo en un carril y esconder al otro ejecutor.

Resumen: START → T-01 → T-02 → G1; No → T-03 → T-02 (revisión preventiva resumida, inferida y marcada); Sí → T-04 → T-05 → G2; No → T-06 → T-05; Sí → T-07 → T-08 → END. El original devuelve documentación subsanada al nombrado de archivos y contiene un mensaje sin destino: la vuelta a revisión preventiva es una simplificación propuesta, no una corrección silenciosa del original. La ficha de fuente informa ambas diferencias. SPERANT tiene un chip «Cambio de estado propuesto» entre T-04 y T-05; no fingir una conexión funcional.

Comparación presenta columnas «AS-IS documentado» / «TO-BE propuesto» en desktop, tarjetas pareadas en móvil. Filas exactas: «Documentos: dispersos en Drive y comunicaciones / centralización propuesta en SPERANT»; «Revisión: expedientes observados durante la validación / control preventivo de documentos, firmas y nombres»; «Correcciones: devoluciones y revisiones repetidas / subsanación antes de carga y observaciones registradas»; «Solicitud: hilo de correo / solicitud registrada y posterior correo a Contabilidad»; «Medición: no proporcionada / beneficios esperados, aún no medidos». Pie «El TO-BE conserva tareas humanas. Su aprobación e implementación no están acreditadas en las fuentes».

#### WEB-07 — Histórico

Componente reutilizado desde cualquier entidad. Columnas «Versión», «Tipo», «Estado», «Fecha de publicación», «Responsable», «Cambio», «Fuente». Entidades no versionadas de la demo muestran «Referencia inicial»; fecha/responsable de publicación «No proporcionados». No inventar v1.0 oficial del organigrama.

Proceso: V-ASIS-01, V-TOBE-01 y V-TOBE-02 con publicación y autor responsable `null`; estados «Documentado», «Borrador incompleto», «Propuesto». Copia: «Los modelos entregados no incluyen constancia de publicación o aprobación interna». Cambios «Proceso actual entregado», «Alternativa con elementos pendientes», «Control documental preventivo propuesto». «Ver versión» abre copia de solo lectura. V-TOBE-03 y V-ASIS-02 aparecen únicamente tras escenarios; detalles en §16.4. «Comparar con base» en versiones de demo abre diferencias registradas; en referencias sin diff muestra resumen fuente, no diff inventado.

#### WEB-08 — Incidencias y compromisos

Título «Incidencias de emisión de boletas». Badge «Registros ficticios para demostrar seguimiento». Fecha visible «Fecha de la demo: 06/10/2026». Tabla con ID, asunto, proceso, responsable por rol/área, estado, vencimiento, aviso. Datos §16.5. Filtros «Todas», «Abiertas», «Cerradas», «Vencidas», «Por vencer»; búsqueda por asunto/ID. Orden inicial vencidas, por vencer, resto, y fecha ascendente dentro del grupo.

Admin/U-OWNER: «Nueva incidencia», «Editar», «Cerrar incidencia». Manager/consulta ven acciones deshabilitadas con «Se requiere permiso de seguimiento del proceso». Formulario: Asunto (5–100 caracteres), Descripción (10–500), Proceso PR-BOLETAS fijo, Responsable (RL-VENTAS/RL-ADMIN/RL-CONT/A-AF), Fecha compromiso obligatoria `YYYY-MM-DD`, Estado inicial «Abierta». Guardar añade `INC-DEMO-04` y luego contador creciente, `isDemo=true`, actor del perfil, fecha fija + reloj lógico. No campos de cliente, monto, DNI o archivos. «Cancelar» sin cambios; con edición descarta previa confirmación §14. No borrar registros.

Cerrar pide «Resultado de atención» 10–500 caracteres. Guardar estado «Cerrada», conservar compromiso y resolución; no enviar avisos. Avisos internos: abierta y vencimiento < 2026-10-06 → «Vencido»; fecha entre 06 y 09 inclusive → «Por vencer»; posterior → «En plazo»; cerrada → «Cerrada», sin alerta. Fecha vacía no se permite para nuevas incidencias. Son umbrales de demo, no política real de Próspera.

#### WEB-09 — Proyectos de mejora

Título «Proyectos de mejora». Lista inicial solo PM-01 (§16.5). Ficha: nombre, proceso, motivo/GAP, responsable, fechas, estado, versión propuesta, compromisos, respaldo interno, histórico de seguimiento. Admin/U-OWNER pueden «Nuevo proyecto», «Editar seguimiento», «Marcar concluido»; solo admin puede «Preparar nuevo AS-IS».

Nuevo proyecto: nombre 5–100, objetivo 10–500, responsable A-AF/RL-ADMIN/RL-VENTAS, compromiso obligatorio, proceso fijo y propuesta vinculada V-TOBE-02 o V-TOBE-03 si existe. ID PM-DEMO-02 y secuencia; estado «Planificado». «Iniciar» → «En curso». Editar permite estado Planificado/En curso y fecha/responsable/objetivo, nunca altera el contenido fuente de la versión. Cerrar requiere resultado 10–500 y confirmación «Registro de cierre ficticio para esta demo»; estado «Concluido». No implica que la mejora real esté implantada.

Para PM-01 hay atajo «Simular cierre y preparar nuevo AS-IS», explicado en §10.5 escenario 2. Sin cierre, «Preparar nuevo AS-IS» está deshabilitado: «Concluye el proyecto y registra el respaldo interno antes de publicar». Proyecto cerrado sin respaldo puede permanecer cerrado, pero no publicarse. El respaldo de demo es una referencia de texto y una declaración del analista, no correo enviado, firma electrónica ni aprobación en PRIMUS. La publicación final ocurre en escritorio y se confirma allí; nunca por solo cerrar el proyecto.

#### WEB-10 — Seguridad y bitácora

En rail, solo admin: «Usuarios y accesos». Tabla de cuentas ficticias §16.6, sin contraseñas. Los perfiles de personas de §5 son previsualizaciones y no se crean como cuentas reales. Encabezado «Administración de acceso · simulada». «Crear usuario» pide nombre de acceso 3–40 `[a-z0-9._-]`, rol admin/manager/employee y puesto del organigrama o «Sin asignar» para manager/admin; employee exige puesto. No pedir correo, contraseña real ni datos personales adicionales. Mensaje «En el sistema real, el administrador establecerá las credenciales. Aquí solo se simulan los permisos».

Acciones «Editar acceso», «Desactivar», «Eliminar usuario de prueba». Desactivar exige confirmar y deja registro; eliminar solo cuentas de prueba, con modal y bitácora, no borra el histórico. No permitir desactivar/eliminar el único admin activo ni suprimir datos fuente. La validación de duplicado ignora mayúsculas y espacios extremos. Los perfiles canónicos de demostración no cambian al editar cuentas de prueba; indicarlo: «Estas cuentas ilustran la administración. Usa el selector de perfiles para explorar las vistas».

Bitácora local: tabla secuencia, fecha demo, perfil actor, acción y resultado. Registra cambios de cuenta, creación/cierre de incidencias/proyectos, publicaciones y rechazos de revisión; no transcribe búsquedas, documentos completos ni secretos. Inicial «No hay acciones registradas en esta sesión». No renderizar una bitácora real de accesos del cliente. Otros perfiles que intenten acceso programático a esta pantalla reciben «Esta vista requiere un perfil administrador».

### 10.5 Pestaña 5 — Prototipo de escritorio

#### DESK-01 — Estudio y evidencias

Título «Estudio del analista». Texto inicial «Transforma fuentes en una propuesta revisable y publícala como una nueva versión». Disclaimer permanente «Claude Code · Simulado. Esta demostración no ejecuta IA ni accede a tus archivos».

Regiones: lista de espacios/sesiones; chips de cliente/proceso/versión; pestañas locales «Conversación» y «Operaciones»; conversación; panel de evidencia/artefacto/revisión; compositor; pie de estado. El marco se reconoce como app de escritorio, sin botones ficticios de minimizar/cerrar. No incluir paths, ramas git, modelos o costos del mockup original.

| Workspace / sesión | Etiqueta / estado inicial | Contenido |
|---|---|---|
| WS-BOLETAS / SES-BOLETAS | Emisión de boletas / «Listo para revisar» | Escenarios SCN-01 y SCN-02. Evidencias S-CASE, S-ASIS, S-TOBE1, S-TOBE2, S-ORG. |
| WS-ORG / SES-ORG | Estructura organizacional / «Consulta de evidencia» | Organigrama transcrito y política de calidad; sin escenario de modificación. |

Chips iniciales «Próspera», «Emisión de boletas», «5 fuentes disponibles», «TO-BE 2 · Propuesto». No mostrar estado «Conectado» real. Pie «Cambios solo en esta sesión» y, si hay propuesta pendiente, «Revisión pendiente del analista».

WS-ORG bienvenida: «Aquí puedes revisar el organigrama entregado y la política de calidad. Esta demo no incluye un escenario de modificación de la estructura organizacional». Acciones «Ver organigrama» → WEB-01 y «Ver política» → POL-01. Compositor conserva borrador propio; submit muestra el mensaje de entrada no soportada. No iniciar un escenario de boletas en esta sesión.

Evidencias de WS-BOLETAS, nombres visibles y resúmenes: «Caso de mejora de emisión de boletas» → dueño, alcance y cuatro problemas de S-CASE; «Modelo AS-IS» → dos variantes y cuatro brechas de §9.5; «Modelo TO-BE» → borrador incompleto/Tarea 1/Tarea 2; «Modelo TO-BE 2» → ocho grupos de §10.4 y dependencia SPERANT; «Organigrama · septiembre 2026» → área A-AF, A-COM, J-03/04/08 y ocupantes. Abrir evidencia muestra estos extractos, sus referencias y estado; nunca carga un archivo fuera del HTML. No botón de upload real: usar «Elegir evidencia de ejemplo» con lista cerrada.

El escritorio es de consulta para perfiles no admin: evidencia e histórico visibles cuando el perfil permite, compositor y publicaciones bloqueadas; mensaje «Para preparar y publicar cambios en esta demostración, usa el perfil de analista». U-EMPLOYEE no puede ver fuentes TO-BE; mostrar el resumen AS-IS permitido y el CTA de cambio explícito de perfil.

#### DESK-02 — Escenario SCN-01: revisar y precisar la propuesta

Objetivo: ilustrar revisión de evidencia, incertidumbres, edición de una descripción y publicación de una versión TO-BE nueva. No pretende descubrir por IA el rediseño que el cliente ya entregó. Precondiciones: U-ADMIN, WS-BOLETAS, V-TOBE-02 disponible, ninguna revisión pendiente. Botón «Revisar propuesta de boletas» inserta y envía exactamente: «Revisa el AS-IS y el TO-BE de boletas y prepara una mejora documental con sus fuentes».

Motor: eventos con ID `SCN-01-E01…E12`, `sessionId=SES-BOLETAS`, `sequence` correspondiente. Pares de herramientas por callId C-READ y C-CHECK; una revisión R-01. Reproducción manual: «Iniciar», luego «Continuar» entrega el siguiente paso lógico (par tool-start/result con separación visual breve); «Detener» pausa y cancela tareas temporizadas; no hay avance automático fuera de pestaña. Temporización es decorativa, no duración de trabajo IA.

| Evento | Tipo | Texto/contenido visible exacto | Efecto |
|---|---|---|---|
| E01 | analyst-message | Prompt indicado arriba | Añadir turno, limpiar solo borrador enviado |
| E02 | assistant-message | «Revisaré las fuentes del caso y conservaré la diferencia entre lo documentado y lo propuesto. No asumiré tiempos, aprobaciones ni integraciones que no estén acreditados». | Ningún cambio de modelo |
| E03 | tool-start C-READ | «Revisar fuentes del proceso» · «En curso» | Mostrar S-CASE/ASIS/TOBE1/TOBE2/ORG |
| E04 | tool-result C-READ | «Revisión completada: proceso actual, dos modelos TO-BE y participantes identificados. El primer TO-BE contiene tareas sin definir». | Card «Completado»; extractos DESK-01 |
| E05 | assistant-message | «El caso describe expedientes incompletos, información dispersa y revisiones repetidas. El TO-BE 2 propone revisar documentos y firmas antes de cargar el expediente en SPERANT. Esa propuesta ya proviene de Próspera; no es un hallazgo nuevo de esta conversación». | Enlaces GAP-01…04 y T-02 |
| E06 | tool-start C-CHECK | «Comprobar consistencia y pendientes» · «En curso» | Sin mutación |
| E07 | tool-result C-CHECK | «Pendientes: confirmar cuota normal o complementaria; validar el cambio de estado con SPERANT; confirmar el alcance de la emisión por tipo de pago. No hay mediciones de tiempo ni matriz RACI completa». | Artefacto de pendientes, no error fatal |
| E08 | assistant-message | «Propongo precisar la instrucción de revisión documental y dejar visibles esos pendientes. Mantendré el AS-IS intacto y prepararé una nueva versión TO-BE para que la revises». | Abrir comparación before/after |
| E09 | artifact-proposal | «Propuesta de actualización documental · TO-BE 3» | Staging V-TOBE-03; no visible como publicado en web |
| E10 | approval-request R-01 | «Revisa el cambio antes de publicarlo en la demo. Esta confirmación es del analista; no sustituye el respaldo interno de Próspera». | Pausar hasta decisión |
| E11 | approval-result | Rama de decisión indicada abajo | Aplicar una vez o conservar modelo |
| E12 | completed | Éxito: «TO-BE 3 publicado en la demo. El AS-IS documentado se conserva. Puedes consultar la nueva versión en el prototipo web». | CTA «Ver TO-BE 3 en el prototipo web» |

Diff exacto: T-02 instrucción antes = la de §10.4; después = «Comparar los documentos recibidos con los requisitos del tipo de pago. Verificar firmas y versión vigente. Nombrar los archivos según el estándar. Si falta información, solicitar subsanación antes de cargar el expediente». Añadir nota de versión «La denominación de cuota normal/complementaria, la automatización de SPERANT y la emisión por variante requieren validación». Referencias S-TOBE2/S-CASE; grado inferred/proposed. No modificar entidades fuente, personas, permisos ni relaciones del AS-IS. Nueva versión hereda el flujo y relaciones TO-BE 2 con IDs de instancia distintos `(versionId, activityId)`; T-02 es clave semántica estable.

Revisión: mostrar antes/después, pendientes, responsable simulado «Analista de Calidad», alcance «Nueva versión TO-BE; no cambia el AS-IS», referencias. Campo «Instrucción propuesta», editable 20–600 caracteres; botón «Restaurar texto propuesto» devuelve texto anterior prescrito. Campo nota de revisión opcional 0–300; sin código ejecutable ni HTML. Si el analista edita, el texto editado es el publicado con provenance S-DEMO y fuente derivada; no perder la lista de pendientes de la versión.

Botones «Publicar en la demo», «Rechazar con motivo», «Cancelar revisión». Publicar valida texto, rol y base V-TOBE-02; crea V-TOBE-03 una vez, actualiza PM-01.targetVersionId a V-TOBE-03 y añade bitácora. Toast «Versión TO-BE 3 creada en esta sesión». R-01 queda resuelta; doble clic no duplica. Rechazo requiere 5–300 caracteres y muestra «Propuesta rechazada. No se modificó el modelo»; conserva motivo en conversación y bitácora local; no crea versión. Cancelar muestra «Revisión cancelada. La propuesta sigue disponible sin publicar», conserva staging y ofrece «Retomar revisión». Rechazada puede repetir escenario con nuevos event IDs y mismo resultado objetivo si todavía no existe V-TOBE-03; publicada no puede repetirse para crear versiones sin límite: «Este escenario ya se aplicó. Consulta el resultado o reinicia la demo».

Operaciones muestra los mismos eventos como filas: secuencia, operación, estado y fuente; códigos permitidos `READ_EVIDENCE`, `CHECK_MODEL`, `STAGE_VERSION`, `PUBLISH_DEMO_VERSION`. No terminal ejecutable, shell ni texto fingido de llamadas reales. Abrir resultado expande el mismo contenido de conversación; ambos modos comparten cursor, borrador y revisión.

Vista previa del artefacto, antes de publicar, título «proceso-boletas.yml · representación de ejemplo». El constructor genera desde el estado, sin copia divergente:

```yaml
id: PR-BOLETAS
nombre: Emisión y envío de boletas
version: V-TOBE-03
tipo: TO-BE
estado: propuesta-en-demo
version_base: V-TOBE-02
dueno_area: A-AF
actividad:
  id: T-02
  nombre: Revisar documentos, firmas y nombres
  responsable: RL-VENTAS
  instruccion: Comparar los documentos recibidos con los requisitos del tipo de pago. Verificar firmas y versión vigente. Nombrar los archivos según el estándar. Si falta información, solicitar subsanación antes de cargar el expediente.
fuentes: [S-TOBE2, S-CASE]
pendientes:
  - Confirmar cuota normal o complementaria
  - Validar automatización de SPERANT
  - Confirmar emisión por variante de pago
```

Tras publicar `estado` se presenta como `publicada-en-demo`; si se editó instrucción, reflejarla escapada correctamente. El artefacto es un extracto de la versión, no se ofrece como modelo organizacional completo ni fichero compatible con un importador productivo.

Errores demostrables: menú discreto «Probar recuperación» disponible al inicio con «Simular fallo de lectura» o «Simular referencia no válida». Fallo de lectura reemplaza E04 por «No se pudo completar la lectura simulada. Las fuentes permanecen disponibles»; E05 no ocurre hasta «Reintentar». Referencia inválida reemplaza E07 por «La propuesta contiene una referencia no válida y no puede publicarse»; «Reintentar» usa el fixture válido y retoma validación; no mutar nunca entidades para provocar el error. Siempre existe «Detener» y «Reiniciar escenario» (confirma descarte de staging). No introducir errores aleatorios.

#### DESK-03 — Escenario SCN-02: cerrar mejora y crear nuevo AS-IS

Precondiciones: U-ADMIN, PM-01, V-TOBE-03 publicada. Si falta: «Primero publica la propuesta TO-BE 3 del escenario de revisión» + «Ir a revisar propuesta». Atajo de WEB-09 abre este espacio con PM-01 seleccionado; no ejecuta cambios.

Prompt del botón «Preparar nuevo AS-IS»: «Prepara una nueva versión AS-IS a partir del TO-BE 3 para el proyecto de control documental». Eventos SCN-02-E01…E06, revisión R-02:

1. Mensaje del analista = prompt.
2. Asistente: «Para crear un nuevo AS-IS, el proyecto debe figurar como concluido y el analista debe registrar que dispone del respaldo interno. En esta demo utilizaremos un cierre y un respaldo ficticios».
3. Formulario de preparación: Estado PM-01 actual; «Resultado de la mejora» prellenado «Cierre ficticio: control documental revisado para demostrar el cambio de versión»; «Referencia de respaldo interno» prellenado «RESPALDO-DEMO-01 · ejemplo sin documento real»; casilla sin marcar «Confirmo que este cierre y este respaldo son ficticios y se usan solo para la demostración». Botón «Preparar cambio». Si PM-01 en curso, en la propuesta se incluye cerrarlo, no se cierra todavía.
4. Tool result: «Propuesta preparada: concluir PM-01 y crear un nuevo AS-IS a partir de TO-BE 3. El AS-IS anterior permanecerá consultable». Mostrar diff completo: PM-01 En curso → Concluido (o ya Concluido); respaldo null → valor; versión nueva V-ASIS-02 basada en V-TOBE-03; currentAsIs V-ASIS-01 → V-ASIS-02.
5. R-02: «Publicar nuevo AS-IS en la demo», «Rechazar con motivo», «Cancelar revisión». Texto «Esto simula la adopción de una mejora. No acredita que Próspera haya implementado o aprobado el proceso». Validar casilla, resultado ≥10, referencia ≥5 caracteres, V-TOBE-03 existente, admin. Commit de proyecto, respaldo y versión es una única operación. Doble resolución no duplica.
6. Éxito: «Nuevo AS-IS creado en la demo. La versión documentada y las propuestas anteriores se conservan en el histórico». CTA «Ver nuevo AS-IS» abre PR-BOLETAS/V-ASIS-02, badge «AS-IS de demostración · adopción simulada». Rechazo/cancelación no cambian proyecto ni versión salvo que el proyecto ya hubiera sido cerrado mediante su formulario independiente.

SCN-02 no propone conectar SPERANT ni afirma que desaparezcan las incertidumbres. V-ASIS-02 mantiene las notas pendientes heredadas con indicador de adopción ficticia. Repetición posterior: «Este escenario ya se aplicó».

#### DESK-04 — Entrada libre, cambio de sesión y recuperación

Compositor label «Solicitud del analista», placeholder «Elige un escenario o escribe una nota». Solo acepta como comando los dos prompts exactos de arriba, normalizando espacios y mayúsculas; botones son ruta preferida. Cualquier otro texto recibe «Esta demo tiene respuestas preparadas. Elige “Revisar propuesta de boletas” o “Preparar nuevo AS-IS”. Tu texto se conserva como borrador»; no se agrega una respuesta empresarial inventada. En WS-ORG se usa la bienvenida de consulta en vez de ofrecer ejecutar en el espacio equivocado.

Borradores por sesión; cambiar modo no los borra. Cambiar workspace/tab pausa cursor y timers; retorno requiere «Continuar». Revisión pendiente solo bloquea esa sesión. «Detener» deja transcripción y staging disponibles, estado «Detenido»; «Continuar» retoma desde siguiente evento sin duplicados. Al publicar desde revisión no se reanuda un escenario oculto.

Autoscroll solo si estaba en el último mensaje; si no, «{n} mensajes nuevos» y «Ir al último mensaje». No anunciar cada carácter con lector de pantalla: anunciar herramienta completada y revisión pendiente. Spinner solo durante el breve evento simulado, texto «Procesando paso de demostración»; no fingir segundos reales, tokens o costos.

## 11. Recorridos de usuario y resultados observables

| Journey | Inicio → acciones → resultado | Alternativa/error y recuperación |
|---|---|---|
| JRN-01 · Entender propuesta | Abrir archivo → C-GRAPH → conexiones → alcance SC-16 → metodologías. Se distinguen solución futura, detalle excluido y práctica aplicada. | Cambiar a lista de arquitectura conserva selección. |
| JRN-02 · Organización a trabajo | Ver web → A-AF → abrir espacio → PR-BOLETAS → A-03 → Ver instrucción. Identifica control y responsable. | Atrás restaura flujo y luego área, con cámara. |
| JRN-03 · Persona relacionada | A-03 → RL-ADMIN → J-03 → P-03 → Trabajo asociado → A-03. | Back del inspector no cambia nivel ni mapa. |
| JRN-04 · Buscar y relacionar | Mapa → OBJ-01 → mostrar relaciones → abrir SYS-DRIVE → buscar “boletas” → limpiar búsqueda → limpiar foco. | Capas ocultas indican elementos relacionados ocultos; no crear aristas. |
| JRN-05 · Comparar | PR-BOLETAS → Comparar → TO-BE 2 → T-02 → requisitos por pago. | TO-BE 1 informa tarea incompleta y no permite publicar. |
| JRN-06 · Publicar TO-BE | Escritorio → usar analista → SCN-01 → herramientas → editar/revisar → publicar → Ver web. | Rechazar no cambia versión; cancelar conserva propuesta; reintentar tras fallo continúa. |
| JRN-07 · Seguir incidencia | U-OWNER → INC-DEMO-01 → editar compromiso → cerrar con resultado. | Validación conserva campos; manager no escribe; cancelar no guarda. |
| JRN-08 · Nuevo AS-IS | SCN-01 completado → PM-01 → preparar nuevo AS-IS → respaldo ficticio → confirmar → Histórico. | Sin TO-BE 3 o respaldo, bloqueo explicativo; AS-IS 1 nunca se pierde. |
| JRN-09 · Acceso por puesto | U-MANAGER observa org → U-EMPLOYEE → solo caso permitido → intenta vista seguridad. | Estado restringido; volver a proceso sin datos ocultos en contadores. |
| JRN-10 · Sesiones | Borrador en WS-BOLETAS → WS-ORG → borrador distinto → volver → alternar Operaciones. | Cada sesión conserva su texto y flujo, sin mensajes cruzados. |
| JRN-11 · Reset | Cambiar versión/perfil, dejar borrador → Reiniciar → Cancelar → Reiniciar y confirmar. | Cancelar conserva todo; confirmar vuelve a arquitectura, manager y fixture inicial. |
| JRN-12 · Seguridad | U-ADMIN → crear usuario ficticio → editar rol → desactivar → eliminar → bitácora. | Duplicado y último admin se bloquean; sin contraseñas ni backend. |

## 12. Requisitos funcionales trazables

Todos son MUST salvo FR-030 (SHOULD). Cada fila fija disparador, resultado y criterio comprobable; las pantallas citadas contienen textos y reglas completas. No bajar prioridad de un recorrido por dificultad técnica.

| ID | Rol / precondición y disparador | Comportamiento y resultado obligatorio | Criterio de aceptación |
|---|---|---|---|
| FR-001 | Revisor abre HTML | Iniciar architecture, sin red ni login | JRN-01 funciona en `file://` offline |
| FR-002 | Todos; selecciona pestaña | Cambiar panel y preservar los demás | Regreso conserva scroll, contexto, draft y cámara; JRN-10 |
| FR-003 | Todos; nodo C4 | Inspector y conexiones según C-*/E-C* | Ocho nodos, ocho aristas de contenedores, actores y lista equivalentes |
| FR-004 | Todos; filtra alcance | Filtrar SC-01…20 con disposición/cobertura | Ninguna exclusión aparece como entregable incluido |
| FR-005 | Todos; metodología | Explicar y abrir ejemplo concreto permitido | Todos los métodos con CTA resuelven el mapeo de §10.3 |
| FR-006 | Perfil permitido; expandir organización | Mostrar seis áreas y entidades fuente | §9.2 transcrito sin nombres añadidos ni jerarquía inventada |
| FR-007 | Todos; seleccionar nivel | Cambiar contexto de gestión, no zoom | Exactamente tres niveles; Operativo pide proceso si no hay uno activo |
| FR-008 | Todos; entidad click/teclado | Abrir inspector, sin navegación automática | Un solo click conserva cámara; abrir flujo requiere acción |
| FR-009 | Todos; vínculos/volver | Resolver IDs e historiales separados | JRN-02/03 restaura origen y foco |
| FR-010 | Todos; búsqueda/filtros | Buscar nombre/tipo/ID y combinar filtros | Conteos autorizados, vacíos recuperables, cámara intacta |
| FR-011 | Todos; objetivo/conexiones | Recorrido tipado con selección separada | JRN-04 conserva highlight al abrir sistema; sin enlaces inventados |
| FR-012 | Todos; flujo boletas | Ocho grupos por versión, decisiones y retornos | Secuencias §10.4 coinciden; variantes desconocidas no se completan |
| FR-013 | Todos; instrucción | Datos, controles, rol, sistema y fuente | JRN-02/03 completo; tiempo null visible |
| FR-014 | Permitidos; comparación/histórico | Conservar referencias y versiones por tipo | AS-IS, TO-BE1/2 y versiones de demo distinguibles |
| FR-015 | Todos; cambio de perfil | Aplicar matriz a vistas, acciones y datos | JRN-09 sin filtración visual por búsqueda/inspector/contadores |
| FR-016 | Admin; gestión de usuarios | CRUD limitado de cuentas ficticias y bitácora | JRN-12, duplicate y último admin bloqueados |
| FR-017 | Admin/owner; incidencia | Crear/editar/cerrar con campos validados | Cambio solo en memoria y avisos recalculados |
| FR-018 | Admin/owner; proyecto | Crear/iniciar/editar/cerrar seguimiento | Cierre no publica por sí solo ni borra versiones |
| FR-019 | Admin; SCN-01 | Escenario determinista con evidencia | E01…12, fuentes y pendientes exactos, sin IA real |
| FR-020 | Admin; revisión R-01 | Diff editable, publicar/rechazar/cancelar | Publicar crea solo V-TOBE-03 y update PM-01; doble clic idempotente |
| FR-021 | Admin; SCN-02 | Validar precondiciones y publicar nuevo AS-IS | JRN-08 atómico; V-ASIS-01 conservada |
| FR-022 | Todos; alternar modo/workspace | Mismo stream en chat/operaciones; drafts por sesión | JRN-10 sin duplicación o eventos en sesión ajena |
| FR-023 | Admin; input desconocido/error/stop | Mensaje honesto, conservar texto, recuperación | Sin “éxito” inventado; JRN-06 rama de error |
| FR-024 | Todos; tab oculto o perfil sin permiso | Pausar escenario y ocultar staging no permitido | Sin avance ni publicaciones en segundo plano |
| FR-025 | Todos; Reiniciar | Confirmar si hay trabajo y restaurar snapshot | JRN-11 cancela timers, reseeds IDs y borra datos de sesión |
| FR-026 | Todos; datos ausentes | Presentar null y provenance sin semáforos falsos | KPI-01 sin porcentajes, tiempos y aprobaciones ausentes explícitos |
| FR-027 | Todos; contenido documental | Fichas embebidas, sin rutas privadas | POL-01 y documentos offline; no abrir PPTX/DNI real |
| FR-028 | Teclado/touch | Completar todos los journeys con lista y foco | Sin interacción exclusiva de hover/doble click/arrastre |
| FR-029 | Build | Validar pack, manifiesto y referencias | Referencia inválida o cliente adicional hace fallar el build |
| FR-030 | Revisor imprime (SHOULD) | CSS de impresión con vista activa legible | Sin recorte de texto; no requiere exportador PDF |
| FR-031 | Todas las mutaciones | Validar rol y restricciones en command store | Invocación por CTA alterno no evita validaciones; acceso simulado explícito |
| FR-032 | Documento/fuente sin historia | Mostrar referencia inicial y fecha desconocida | Histórico funciona en toda ficha sin fabricar publicaciones |

## 13. Dirección visual y editorial

Aplicar PRENTER de `design.md`, sin nueva marca visual para el cliente. Fondo `#000000`, superficie `#0c1110`, elevada `#141a19`, borde `#1f2826`; marca `#00b7aa`, hover/foco `#1fc6b8`, activo `#009d92`; estados éxito `#5cc99a`, aviso `#e0ad4e`, error `#e2766b`. Texto usa tokens `--text-on-dark*` de [tokens.css](references/prenter/tokens.css); revisar contraste real. No asignar los colores multicolor del organigrama original a las áreas.

Cabecera 72 px, rail 224 px, inspector 360 px como máximos iniciales de desktop. Espaciado nominal 4/8/12/16/24/32/48/64/96/128 px; no asumir multiplicador lineal por nombre. Radios 4/8/14/22 px; objetivos táctiles 44 px. Tipografía base 16 px/1.5, pequeña 14 px, metadata 12 px solo si no es instrucción esencial; encabezados de narrativa 36–48 px, web 22–28 px. Fuentes locales/sistema declaradas en design; no descargar fuentes de Google ni exigir licencias no presentes. Identificadores y terminal en mono.

Iconos SVG inline con texto adyacente: organización/edificio, área/grupo, proceso/flujo, actividad/cuadro, rol/tarjeta, puesto/asiento, persona/silueta, sistema/monitor, documento/hoja, política/escudo, objetivo/diana, indicador/regla, brecha/aviso, incidencia/bandera, proyecto/carpeta. No depender de emoji para categorías. Iconos decorativos `aria-hidden`; controles icon-only siempre con nombre. Estados con texto y forma además de color.

Priorizar título → explicación → dato principal → acción → fuente. Prosa en ancho 760 px, páginas hasta 1200 px; lienzos usan el área disponible. Inspección no recoloca entidades. Selección con contorno; foco con anillo externo; relación resaltada con línea de 2 px vs 1 px; no usar el mismo relleno para todo. No parpadeos ni decoración de dashboards sin datos.

Vocabulario: «Así está documentado» explica AS-IS; «Así se propone trabajar» explica TO-BE; «Histórico» para versiones; «Fuentes» para evidencia; «Rol en el proceso» distinto de «Perfil de acceso». Primera mención de VPS: «servidor privado en internet». Neo4j aparece como subtítulo técnico, explicación principal «conocimiento conectado». Escribir Próspera y PRIMUS de forma consistente; no presentar Cockpit/Consultio como nombre contratado.

Etiquetas exactas de proveniencia: «Fuente del cliente», «Síntesis de las fuentes», «Relación por validar», «Propuesto · por validar», «Ejemplo de demostración», «Sin dato proporcionado». No badges «Certificado», «Aprobado por Próspera», «En vivo» o «Automatizado» sin base.

## 14. Interacción y reglas de estado

### 14.1 Estado y comandos

Separar `app`, `web`, `cameraByContext`, `desktop.sessions`, `demo`. Contexto web contiene nivel, profundidad, área/proceso/actividad, versión, variante de pago, representación, selección, raíz de relaciones, expansión, filtros e historial. No derivar profundidad del zoom. Snapshot inicial inmutable; mutaciones se aplican a una copia validada.

Comandos permitidos extienden los de arch: `selectAccessProfile`, `createDemoUser`, `updateDemoUser`, `deactivateDemoUser`, `deleteDemoUser`, `createIncident`, `updateIncident`, `closeIncident`, `createProject`, `updateProject`, `closeProject`, `stageVersion`, `publishDemoVersion`, `promoteDemoVersion`. No código arbitrario desde el pack. Toda mutación verifica actor, payload, referencias y estado actual; errores no cambian parcialmente el modelo. Publicaciones se deduplican por `requestId`; eventos por `eventId`. IDs de nuevas filas se reinician con el reset.

Borradores/staging/versiones no sobreviven reload; no `localStorage`, cookies, IndexedDB o SW. La fecha empresarial fija es 2026-10-06; reloj de eventos inicia 10:00:00 -05:00 y avanza un segundo por acción registrada, por claridad de demo. No alterar estados de vencimiento usando el reloj real del navegador.

### 14.2 Búsqueda, filtros y tablas

Búsqueda normaliza diacríticos y mayúsculas, trim, coincidencia parcial sobre nombre/tipo/ID; no busca datos no autorizados ni contenido oculto de versiones. Resultados al escribir sin red, debounce máximo 150 ms. Enter en resultado abre inspector; Escape limpia búsqueda solo si foco está en ella y no hay modal. Lista de resultados muestra «{n} resultados» y botón «Limpiar búsqueda». Incluir versiones solo si filtro «Versiones» seleccionado; por defecto se buscan entidades canónicas, no tres copias de cada actividad.

Filtros de área, tipo/capa, búsqueda y acceso se intersectan. Capa apagada mantiene selección pero ofrece «Hay elementos relacionados en una capa oculta» + «Mostrar capa». Si raíz de relación no pertenece al área, «El foco de relaciones está fuera del área seleccionada» + «Quitar filtro de área». Sin resultados: «No encontramos coincidencias con estos filtros» + «Limpiar filtros». No datos de pack: «No hay información disponible para esta vista».

Tablas ordenables por columnas con botón y `aria-sort`; texto alfabético es-PE, fechas por ISO, null siempre al final. Selección de una fila no cambia orden. Incidencias tienen su orden inicial especial; histórico ordena primero publicaciones de demo por secuencia descendente, luego referencias AS-IS/TO-BE 1/2 en ese orden, no por fecha local de archivo. Restablecer filtros no resetea datos ni contexto.

### 14.3 Foco, cámara, overlays y cancelación

Tablist manual: flechas mueven foco, Home/End extremos, Enter/Space activa, Tab sale. Botones nativos; listas y árbol con controles de expandir etiquetados. Click/Enter/Space selecciona entidad. Doble click puede abrir flujo, nunca indispensable y solo una transición. Pan desde fondo vacío; zoom por botones ± y «Ajustar vista», escala 50–200%, pasos de 10%; reset cámara 100% en origen legible. Rueda desplaza página salvo gesto intencional en lienzo; no bloquear zoom del navegador.

Desktop inspector complementary sin focus trap; al abrir por teclado foco al encabezado, «Volver al mapa» devuelve origen. En pantallas estrechas sheet dialog modal con fondo inert, trap, Escape, cierre y restauración. Modal siempre rotulado, botón Cancelar y errores asociados. Escape cierra top overlay, luego búsqueda enfocada, inspector, foco de relaciones; nunca salta a organización inesperadamente. Toasts duran 5 s y también quedan en estado visible o bitácora; errores de formulario no desaparecen solos.

Cancelar formulario modificado: «¿Descartar los cambios sin guardar?» / «Seguir editando» / «Descartar». Reset con cambios, borradores o staging: «¿Reiniciar la demostración? Se perderán los cambios, las versiones de prueba y los borradores de esta sesión» / «Cancelar» / «Reiniciar». Sin cambios resetea directamente. Reset deja architecture, U-MANAGER, WS-BOLETAS, sin conversaciones ejecutadas, cámaras iniciales y fuentes originales. No eliminar fuentes del cliente.

### 14.4 Catálogo de mensajes compartidos

| ID | Cuándo | Texto exacto / recuperación |
|---|---|---|
| MSG-01 | Entrada web | «Explora la organización o abre el caso de emisión de boletas». |
| MSG-02 | Restricción de lectura | «Tu perfil de demostración no tiene acceso a esta información». Acción «Volver a una vista permitida». |
| MSG-03 | Restricción escritura | «Esta acción requiere permiso de mantenimiento del modelo». Acción «Usar perfil de analista». |
| MSG-04 | Falta campo | «Completa este campo». |
| MSG-05 | Longitud | «Escribe entre {min} y {max} caracteres». |
| MSG-06 | Fecha inválida | «Ingresa una fecha válida». |
| MSG-07 | Duplicado usuario | «Ya existe un usuario de prueba con ese nombre». |
| MSG-08 | Último admin | «Debe permanecer al menos un administrador activo». |
| MSG-09 | Guardado genérico | «Cambios guardados en esta sesión de demostración». |
| MSG-10 | No relaciones | «No se proporcionaron relaciones para este elemento». |
| MSG-11 | Detalle ausente | «No se proporcionó el detalle de actividades de este proceso». |
| MSG-12 | Recuperación contexto inválido | «No se pudo abrir el elemento solicitado. Puedes volver a la organización». |
| MSG-13 | Referencias pack inválidas | Build falla. En preview de desarrollo: «Error de contenido: referencia no válida». No entregar al cliente en ese estado. |
| MSG-14 | Loading simulado | «Procesando paso de demostración». |
| MSG-15 | Publicación bloqueada | «Revisa los campos señalados antes de publicar». |
| MSG-16 | Desconocido | «Sin dato proporcionado». |
| MSG-17 | Sin medición | «Sin medición. No se proporcionaron datos para calcular este indicador». |
| MSG-18 | Sin archivo | «Documento referenciado; archivo no incluido en la demo». |
| MSG-19 | Pausa | «Escenario pausado. Selecciona Continuar para retomar». |
| MSG-20 | Reset completado | «La demostración volvió a su estado inicial». |

«Acerca de esta demo» abre: «Este archivo contiene una selección de información entregada por Próspera y ejemplos ficticios identificados. Funciona sin conexión. Las acciones no publican información en un servidor, no emiten boletas y se pierden al recargar. Los perfiles de acceso sirven para mostrar la experiencia; no protegen el contenido del archivo». Botón «Entendido». Esta aclaración no sustituye los badges locales de datos ficticios.

## 15. Responsive y accesibilidad

Validar 1440×900, 1024×768 y 390×844, más zoom de texto 200%. ≥1280: rail+stage+inspector; 768–1279: rail colapsable «Navegación del módulo», inspector overlay cuando no quepa; <768: lista de entidades por defecto, pestañas desplazables horizontalmente, sheet, selector de workspace siempre disponible. Sin depender de user-agent. Narrativa fluye verticalmente, no encoger todo el diagrama para meterlo en una captura. Tablas tienen tarjetas o scroll con rótulo, sin cortar acciones.

Contraste mínimo 4.5:1 texto normal, 3:1 texto grande y controles/foco; verificar tokens en sus superficies concretas. `lang=es`, landmarks y títulos jerárquicos; tablist y tabpanels vinculados; aria-live polite para resultados de búsqueda y acciones completadas, no streaming de caracteres. Iconos no sustituyen nombres. Inputs con label, hint y error relacionados; el primer error recibe foco al intentar guardar.

Alternativa de lista para C4, organigrama, mapa y flujos con iguales vínculos, condiciones y acciones. Orden de lectura de flujo según pasos y ramas, no coordenadas. Un SVG interactivo no es una sola imagen inaccesible. Estados y provenance legibles sin color. Focus visible y nunca atrapado fuera de modal; restauración tras cerrar/cancelar; tab activo puede desplazarse a vista sin animación si necesario.

`prefers-reduced-motion`: transiciones y movimientos de cámara inmediatos; pasos guiados completos sin tipeo animado. No animación continua requerida. Objetivos de accesibilidad son condiciones que probar, no declaración automática de conformidad.

## 16. Datos de ejemplo y consistencia entre vistas

### 16.1 Inventario cerrado del contenido mostrado

El constructor implementa las tablas de §§9–10 y esta sección como pack; no necesita volver a interpretar documentos para inventar contenido. Registros fuente: ORG-01; seis áreas; J-01…20/J-X1…5; P-01…23/EXT-01…05; PR-01…10; MP-AF; PR-BOLETAS; tres roles y ACTOR-CLIENTE; SYS-WA/DRIVE/MAIL/SPERANT/FACT; DOC-DNI/CONVENIO/VOUCHER/MINUTA/PRECAL/SOLICITUD/BOLETA/CASO; POL-01; OBJ-01/KPI-01; GAP-01…04. A-01…08 pertenecen a resumen AS-IS; T-01…08 y subtareas T-06a/b,T-08a/b al resumen TO-BE. Eventos y decisiones no cuentan como actividades productivas ni se usan para calcular cargas.

Todos los números visibles se derivan de estas tablas y el perfil. El mapa ofrece «1 proceso con detalle» y «10 procesos con resumen» a manager/admin; no «11 procesos totales de Próspera». No contar dos veces un proceso por tener versiones. La UI no presume que todos los documentos requeridos fueron entregados como archivos reales. Las fechas de medición, aprobaciones y tiempos quedan vacías aunque las fuentes XML tengan `cost:0` u otros defaults técnicos.

### 16.2 Requisitos documentales por variante

Solo TO-BE proporciona esta separación explícita. Panel «Documentos por tipo de pago · propuesta del cliente» en T-01/T-02:

| Variante | Lista visible | Observación |
|---|---|---|
| Separación | DNI del cliente; convenio de separación firmado por ambas partes; comprobante de pago | Fuente S-TOBE2; los mismos tipos aparecen en AS-IS. |
| Cuota inicial | Documentos de separación; minuta; captura de precalificación de financiamiento; comprobante de cuota inicial | «La fuente abrevia “Documentos de S.”; se interpreta como documentos de separación y requiere validación». |
| Cuota normal | Documentos requeridos de cuota inicial; comprobante de cuota normal | «La presentación usa “cuota complementaria”. Confirmar equivalencia y documentos aplicables». |

Estándar de nombres visible como ejemplo de plantilla, no archivo de cliente: `DNI_NOMBRE_CLIENTE`, `CONVENIO_SEPARACION_NOMBRE_CLIENTE`, `VOUCHER_NOMBRE_CLIENTE`, `MINUTA_NOMBRE_CLIENTE`. No generar nombre real de comprador ni adjuntar identidad personal. Controles «Completo», «Firmado», «Versión vigente» son requisitos descritos, no checkboxes que confirmen un expediente real. La edición del escenario modifica la instrucción, no declara que estos documentos se verificaron.

### 16.3 Política y contenido institucional

POL-01 título «Política de Gestión de Calidad». Fecha «24 de agosto de 2026». Firma textual «Gustavo Yurivilca · Gerente General», tal como el documento. No reemplazar firma por el nombre completo del organigrama ni fabricar imagen de firma. Al enlazar al puesto J-01 indicar «Correspondencia de cargo; el documento firma como Gustavo Yurivilca».

Texto visible completo, transcrito de S-POL:

> PROSPERA GRUPO INMOBILIARIO, empresa dedicada al desarrollo y gestión de proyectos inmobiliarios residenciales, orientados a generar confianza, bienestar y valor para nuestros clientes, gestionando nuestras actividades desde la evaluación y adquisición del terreno hasta la venta, entrega y atención posventa.
>
> Por lo cual, asume los siguientes compromisos:
>
> 1. Comprender y atender las necesidades y expectativas de nuestros clientes, brindándoles información clara, transparente y oportuna.
> 2. Cumplir los requisitos legales, reglamentarios, contractuales y demás compromisos aplicables a nuestros proyectos y operaciones.
> 3. Gestionar nuestros procesos de manera ordenada, coordinada y controlada, promoviendo el cumplimiento de los plazos prometidos y de los requisitos, especificaciones y estándares de calidad establecidos.
> 4. Asegurar que nuestros proveedores y contratistas cumplan con los requisitos, especificaciones y condiciones establecidos, contribuyendo al logro de los estándares de calidad de nuestros proyectos.
> 5. Fortalecer las competencias y la participación de nuestros colaboradores, proporcionando capacitación continua, infraestructura y condiciones adecuadas para el desarrollo de sus funciones.
> 6. Promover una cultura de integridad, ética, responsabilidad y transparencia en nuestra gestión y en todas nuestras relaciones con colaboradores, clientes y demás partes interesadas.
> 7. Establecer y revisar objetivos de calidad que permitan evaluar nuestros resultados, prevenir riesgos y mejorar continuamente nuestros procesos, proyectos y la eficacia del Sistema de Gestión de Calidad.
> 8. Fortalecer relaciones de confianza con nuestros inversionistas, fondos de inversión y entidades financieras, cumpliendo los compromisos asumidos y proporcionando información oportuna, confiable y transparente sobre la gestión y desempeño de nuestros proyectos.
>
> Lima, 24 de agosto del 2026.
>
> Gustavo Yurivilca
>
> Gerente General

Relacionar POL-01 → PR-BOLETAS mediante `orienta`, inferida por gestión ordenada, control y revisión; no afirmar que la política contiene el procedimiento de boletas. DOC-CASO muestra texto «Expedientes incompletos, falta de estandarización e información dispersa generan reprocesos, carga manual y menor trazabilidad», seguido por «Beneficios esperados del TO-BE: expedientes completos a la primera, centralización documental, menos observaciones y menor tiempo de emisión. No se proporcionaron mediciones que acrediten esos resultados».

### 16.4 Versiones y mutaciones permitidas

| ID | Tipo / estado inicial | Base / origen | Publicación / responsable / resumen |
|---|---|---|---|
| V-ASIS-01 | AS-IS / Documentado | S-ASIS/S-CASE | Fecha null; autor de publicación null; «Proceso actual entregado». `currentAsIsVersionId` inicial. |
| V-TOBE-01 | TO-BE / Borrador incompleto | S-TOBE1 | Fecha null; autor null; «Alternativa con tareas y conexiones pendientes». No publicable. |
| V-TOBE-02 | TO-BE / Propuesto | S-TOBE2/S-CASE | Fecha null; autor null; «Control preventivo y centralización propuesta». Base de SCN-01. |
| V-TOBE-03 | No existe al inicio | V-TOBE-02 + SCN-01/R-01 | Fecha de reloj lógico; «Analista de Calidad · perfil de demo»; «Instrucción de revisión documental precisada». Se conserva TO-BE 2. |
| V-ASIS-02 | No existe al inicio | V-TOBE-03 + SCN-02/R-02 | Fecha de reloj lógico; mismo actor de demo; «Adopción simulada al concluir PM-01». Nuevo puntero currentAsIs. |

Modificación XML de S-ASIS/S-TOBE1/S-TOBE2 solo se expone, si existe, como «Última modificación del archivo de modelado», nunca en columna de publicación. No usar `Author=Lenovo/HP` ni nombres de máquina como responsable empresarial. Nuevas versiones son snapshots; una edición posterior del staging no altera una publicada. Las referencias originales permanecen inmutables y consultables.

### 16.5 Seguimiento ficticio autorizado

Todos `isDemo=true`, fuente S-DEMO, fechas de ejemplo, proceso PR-BOLETAS, sin vincular a comprador real.

| ID | Asunto / descripción | Responsable | Estado / fechas | Resultado |
|---|---|---|---|---|
| INC-DEMO-01 | Expediente sin convenio firmado / «Ejemplo ficticio de devolución por ausencia de la firma requerida en el convenio de separación». | RL-VENTAS | Abierta; creada 2026-10-01; compromiso 2026-10-04 | null; aviso «Vencido» |
| INC-DEMO-02 | Solicitud enviada en un hilo distinto / «Ejemplo ficticio de seguimiento para mantener la solicitud y la boleta en el mismo hilo de correo». | RL-ADMIN | En atención; creada 2026-10-02; compromiso 2026-10-08 | null; aviso «Por vencer» |
| INC-DEMO-03 | Documento duplicado en carpeta / «Ejemplo ficticio de revisión de archivos duplicados en el expediente». | RL-VENTAS | Cerrada; creada 2026-09-30; compromiso 2026-10-05; cerrada 2026-10-03 | «Se identificó la versión que corresponde para este ejemplo». Aviso «Cerrada» |

Edición de incidencia permite Abierta/En atención; pasar a Cerrada siempre requiere formulario de resolución. Reapertura fuera del prototipo: sin control que la sugiera. Fuentes GAP justifican el tipo de ejemplo, no prueban la existencia del incidente.

PM-01 título «Control documental preventivo para emisión de boletas». Objetivo «Precisar los requisitos del expediente y revisar documentos y firmas antes de solicitar la emisión». Proceso PR-BOLETAS; brechas GAP-01/02/03/04; dueño de seguimiento A-AF (asignación ficticia de demo); inicio 2026-10-01; compromiso 2026-10-15; estado En curso; propuesta V-TOBE-02 al inicio; respaldo null; resultado null. Texto «Proyecto ficticio basado en el tema de mejora del caso». Compromisos ilustrados, sin crear subtareas editables: «Revisar requisitos documentales» — «Pendiente»; «Confirmar viabilidad con SPERANT» — «Pendiente»; «Registrar respaldo interno» — «Pendiente». No usar estos tres estados como gate automático de implantación; SCN-02 es explícitamente ficticio y los pendientes fuente no desaparecen.

### 16.6 Cuentas de prueba

Estos registros solo aparecen en seguridad; no son credenciales de acceso al HTML ni las cuentas reales de los ocupantes.

| ID | Usuario | Rol | Puesto | Estado |
|---|---|---|---|---|
| ACCOUNT-01 | demo.analista | admin | J-05 | Activo |
| ACCOUNT-02 | demo.gerencia | manager | J-01 | Activo |
| ACCOUNT-03 | demo.administracion | employee | J-03 | Activo |

ACCOUNT-04… se asignan a nuevas cuentas, no se reciclan antes del reset. Eliminar un registro es un cambio de prueba reversible por reset, con texto «¿Eliminar este usuario de prueba? La bitácora de esta sesión se conservará». No hay contraseñas embebidas ni flujo de recuperación por email. Producción sí tendrá autenticación por usuario y contraseña administrada en web; la política de credenciales se define durante implementación.

### 16.7 Regla de completitud de contenido

Pantallas no enumeradas no se construyen. Los registros no detallados individualmente usan las plantillas exactas de §9 y estos campos comunes: nombre, tipo, descripción prescrita, área si existe, relacionados derivados, fuente y «Histórico». No se añade contenido de relleno. Todas las cadenas variables provienen de nombres/IDs/fechas de este inventario o de la entrada explícita del usuario en formularios delimitados; el texto libre no se presenta como fuente del cliente.

## 17. Restricciones técnicas y organización de implementación

La elección existente de `arch.md` es **JavaScript modular sin framework**, HTML semántico, CSS e inline SVG. No TypeScript/React/Vite por defecto; los React de referencia sirven para contratos de componentes, no se embeben como aplicación histórica. El constructor puede usar herramientas locales de bundle, fijadas en manifest/lock si añade dependencias de desarrollo; el destinatario solo necesita navegador.

Scaffold en `implementation/`: `build/build.mjs`, `build/validate-pack.mjs`, `build/manifest.json`; `schemas/`; `src/shell.html`, `src/main.js`, `src/core/{store,navigation,graph,scenarios,format}.js`; `src/ds/{tokens,extensions}.css`, atoms/molecules/catálogo; `src/components/{shell,twin,analyst}/`; `src/features/{architecture,scope,methodologies,web,desktop}/`; estilos layout/visualización/responsive/print; `clients/prospera/{pack,solution,scope,methodologies,organization,desktop,scenarios,source-register}.json`; `tests/{contracts,interactions,delivery}/`; `dist/`. Se permite agrupar JSON al inicio manteniendo el mismo contrato resuelto.

Dependencias de código: feature → organismo → molécula → átomo → tokens; core consume contratos, no DOM de features. Cambios mediante comandos; selectores puros generan conteos, relaciones, SIPOC, avisos y diferencias. No mantener dos copias independientes del mismo proceso para escritorio y web. Estado de versiones usa snapshots; estado de vista contiene IDs, no copias mutables de datos.

Registro de entidad soporta tipos §9.1 y políticas de traversal explícitas. SVG/presentación no calcula permisos por su cuenta. Separar organización de solución C4 en namespaces. Validar enum de roles y disposiciones, endpoints, fuentes, versiones, escenario/session IDs, nodos del flujo, mapeos de métodos y targets. Sin ciclos `parentId`; secuencias del proceso permiten únicamente los bucles declarados. Relaciones inválidas fallan el build; los huecos de fuentes originales solo entran como notas/antecedentes, nunca como endpoints inválidos del pack.

Escapar strings al renderizar con nodos de texto; no `innerHTML` con contenido de usuario, no eval, shell, HTML de cliente o URLs ejecutables. JSON inline debe escapar `<`, separadores y cierres de script. Probar un nombre/nota de ejemplo que contenga `<script>` y comillas: se debe ver como texto. Versionar esquema con `schemaVersion=1`; fail explícito para otra versión. El manifiesto lista exclusivamente código, pack y assets aprobados de esta demo.

Navegadores de destino: Chrome, Edge y Firefox de escritorio con soporte ES2020+ y Safari contemporáneo, por apertura local cuando el sistema lo permita; no prometer compatibilidad con visores de correo que bloquean scripts. Pruebas de entrega en al menos Chromium y Firefox disponibles; documentar si Safari no pudo probarse. Interacción táctil y tamaño móvil se prueban aunque algunos sistemas móviles abran adjuntos en visores restringidos. Evitar APIs que requieran secure context/servidor, módulos importados en runtime y filesystem access API.

El catálogo PRENTER es interno de desarrollo, no sexta pestaña comercial. Registrar botones, inputs oscuros, tabs, fichas, listas, árbol, inspector, tablas, formularios, mensajes, review y sus estados; reutilizar componentes en las cinco vistas. No copiar CSS crudo en cada ficha ni tokens arbitrarios por entidad.

## 18. HTML autónomo y entrega

Salida única para enviar: `prototype-prospera/implementation/dist/prospera-prototype.html` (desde esta carpeta: `implementation/dist/prospera-prototype.html`). Fuentes y reportes permanecen en el paquete de trabajo; no requieren acompañar al archivo enviado. Nombre de título de ventana: «PRIMUS para Próspera · Prototipo».

Comando requerido desde `implementation/`: `node build/build.mjs --client prospera`. El constructor implementará ese comando; no se afirma que exista aún. Debe validar, resolver pack, bundlear a script clásico, insertar CSS/JSON/assets autorizados y generar HTML y `dist/prospera-build.json`. Informe: client ID, schema/spec version, revisión/hash de fuentes, fecha de generación, lista de entradas, checks, tamaño y SHA-256 de HTML. Edición manual del dist prohibida.

Todo CSS, JS e iconos quedan embebidos. Fonts de sistema por defecto. No dependencias CDN, @import remoto, imágenes/font externas, `fetch`, XHR, WebSocket, workers externos, módulos dinámicos, iframes de otras apps, telemetría ni service worker. No escribir en equipo del receptor. Los enlaces a fuentes técnicas externas, si se incluyen, son opcionales, claramente «Abrir referencia externa», y no necesarios para comprender o navegar. Ninguna solicitud automática de red.

El artefacto contiene solo el contenido mínimo enumerado: no ZIP de Bizagi, PPTX, DOCX, organigrama raster con metadatos, rutas `/home/...`, nombres de máquinas, fotografías, fuentes internas históricas completas, precios de personal, adjuntos de identidad ni otros clientes. Provenance embebida contiene títulos y sección, no ruta absoluta. Para esta especificación está autorizado usar los nombres laborales transcritos del organigrama en el archivo exclusivo para Próspera. No publicarlo en una URL abierta como parte de construirlo.

Presupuesto inicial ≤5 MiB. Un exceso debe justificar un asset concreto y eliminar lo innecesario antes de elevar el presupuesto; el contenido textual previsto no lo requiere. No comprimir contenido de tal modo que necesite servicios externos o desempaquetado manual. Mostrar `<noscript>`: «Este prototipo necesita JavaScript para navegar. Abre el archivo en un navegador con JavaScript habilitado».

Verificar entrega: copiar solo HTML a un directorio temporal sin fuentes, desactivar red, abrir por `file://`, realizar JRN-01…12, revisar consola y solicitudes; repetir después de recargar para validar reset. Comprobar que no depende de un servidor levantado para preview. No ejecutar ni anunciar pruebas contra Neo4j/Claude/API reales.

## 19. Calidad y aceptación de la futura construcción

### 19.1 Puertas de aceptación

| Área | Evidencia requerida |
|---|---|
| Completitud | FR-001…029/031/032 y todos los journeys; FR-030 documentado si se omite |
| Fuente y consistencia | Transcripción revisada; ninguna persona o relación empresarial inventada; propuestas y ejemplos rotulados |
| Integridad | Validación de IDs, fuentes, endpoints, parent cycles, snapshots, roles, eventos deduplicados y referencias de escenarios |
| Usabilidad | Recorrido a actividad ≤5 acciones desde CTA web; nombres extensos sin superposición; lista alternativa completa |
| Estado | Inspector y contexto con histories separados; tabs/sesiones conservan borrador; publicación atómica; reset cancela todo |
| Alcance | Exclusiones visibles, aprobaciones externas, sin emisión de boletas, sin integración simulada presentada como operativa |
| Seguridad del HTML | Render seguro de textos; sin credenciales, red ni código ejecutable en datos; permiso demo declarado |
| Offline | Archivo aislado, `file://`, red desactivada, cero recursos fallidos o solicitudes automáticas |
| Responsive/a11y | Capturas 1440/1024/390, teclado, 200% texto, reduced motion, contraste y foco |
| Mantenibilidad | Pack independiente, renderer genérico, tokens compartidos, build reproducible y reporte con hash |

### 19.2 Metas de rendimiento y fiabilidad

En equipo de escritorio de referencia documentado y navegador local, primera vista utilizable en ≤2 s para archivo ≤5 MiB; navegación, búsqueda y selección visibles en ≤200 ms tras procesamiento, sin contar animación decorativa; sin bloquear el hilo principal perceptiblemente al abrir organigrama completo. Medir al menos tres aperturas y registrar contexto, no prometer un benchmark universal. Si no se alcanza, simplificar render/layout antes de recortar contenido obligatorio.

Ningún error no controlado de consola durante los journeys; búsquedas y cambios de perfil repetidos no dejan selecciones inválidas; doble confirmación no duplica versiones; detener/reiniciar descarta callbacks antiguos; toggle de tabs no acumula listeners. En build inválido, terminar con código distinto de cero y no reemplazar el último artefacto válido.

Pruebas de contrato mínimas: IDs únicos, correspondencia de 23 ocupantes internos y 5 externos, cobertura del caso, ausencia de métricas numéricas inventadas, ausencia de `runtime` externo, no datos de segundo cliente, referencias AS-IS inmutables. Pruebas de comportamiento mínimas: ruta organización/actividad/persona; role filtering por command store; incidente y deadline; revisión rechazada/cancelada/publicada; SCN-02 sin prerequisito; reset mientras hay tool event; string de usuario escapado.

No exigir tests cosméticos que solo repitan el código. Sí revisar render real de nombres como «Evaluación técnica y económica de proyectos», J-08 con cuatro ocupantes, persona larga, inspector, sheet y comparación. Pasar lint/syntax no basta para aceptar el archivo. Guardar capturas e informe locales de verificación, sin declararlos ejecutados en esta especificación.

### 19.3 Aceptación comercial futura, separada

La aprobación de esta demo valida una dirección funcional y visual, no declara entregado el software. La entrega futura requiere: VPS accesible, escritorio operable hasta el límite acordado, flujo real de creación/edición/publicación con datos de prueba, usuarios/permisos reales, capacitaciones, material/código y corrección de observaciones dentro del alcance. No sustituir esta validación por abrir el HTML.

## Anexo A. Auditoría de fuentes del caso de boletas

Se leyeron los seis archivos del directorio `Caso-emision-boletas` y los cinco archivos contenidos en cada `.diag` (ZIP). Se revisaron además el texto del PPTX del caso, las imágenes de sus diagramas AS-IS y TO-BE 2, el organigrama, el alcance institucional y el DOCX de política. El cuerpo del spec es la selección de contenido para la demo; este anexo permite rastrear la síntesis y no debe copiarse completo a la interfaz.

| Archivo / contenido | Hallazgo | Consecuencia |
|---|---|---|
| `ModelInfo.xml` | Bizagi 4.2.0.003; persistencia 5; ModifiedDate 2026-09-01T19:24:11.2642084-05:00 | Metadato de modelado, no fecha de aprobación. |
| `Preferences.bpp` | ProjectPreferences / VersionFile 3 | Configuración, no requisito funcional de PRIMUS. |
| `Participants.xml` | Contenedor Participants vacío | Participantes se obtienen de carriles/modelo, no de una lista formal de usuarios. |
| `Diagram.xml` de AS IS | 37 nodos del flujo de empresa y 6 de cliente | Fuente del AS-IS y contexto adicional. |
| `Diagram.xml` de TO BE | 14 nodos de empresa y 8 de cliente; Tarea 1/Tarea 2; segmentos desconectados | Antecedente incompleto, no publicable. |
| `Diagram.xml` de TO BE - 2 | 30 nodos de empresa y 3 de cliente; control preventivo, observaciones y emisión | Base de TO-BE resumido, con incertidumbres. |
| `Actions.xml` en los tres ZIP | DiagramActions vacío | No contiene automatizaciones implementadas. |
| `BPSimData.xml` | AS-IS: 1 escenario; TO-BE: 2; TO-BE2: 3; parámetros sin tiempos de ejecución | No extraer tiempos, tasas, costos o ahorro. |
| `BPSimDataResult.xml` en los tres | ScenarioResults vacío | No existe resultado de simulación empresarial. |
| `ExtendedAttributeValues.xml` | AS-IS: 5 referencias con Values vacíos; TO-BE: vacío; TO-BE2: 1 referencia con Values vacío | No completar atributos empresariales con defaults de herramienta. |

Decisiones de fidelidad:

- Carriles se verificaron con la posición de los nodos en las bandas del diagrama y las imágenes del PPTX. El XML no adjunta `LaneId` a cada actividad; conservar esta procedencia de la asignación, no inventar un atributo de origen.
- En TO-BE2 hay un mensaje desde «Enviar comprobante de pago y documentos solicitados» cuyo XML no expresa Target; la imagen conecta con «Documentos recibidos». El resumen arranca en recepción de documentación y no importa un endpoint inválido.
- En TO-BE2 el retorno de «Enviar documentos subsanados» termina en «Nombrar documentos según estándar»; la demo propone mostrar una nueva revisión preventiva y la etiqueta como síntesis por validar.
- AS-IS tiene dos verificaciones paralelas de cuota inicial, y una etapa previa de financiamiento. La demo agrupa las verificaciones en A-03 y presenta el financiamiento como contexto, sin afirmar secuencia inventada.
- «Sistema de facturación» es carril vacío en TO-BE2; no se conoce proveedor ni integración. «Actualizar estado a Pendiente de validación» tiene una nota explícita de validación con SPERANT.
- Varias anotaciones del XML terminan truncadas, por ejemplo «Versión vi»; no se reconstruye una política documental más extensa a partir de ese fragmento. La ficha usa solo requisitos legibles corroborados por actividades/imágenes.

### A.1 Correspondencia de grupos de demostración con nodos fuente

Los números E/C siguientes corresponden al inventario A.2 generado desde el orden de `Activities/Activity` del XML, no al orden de ejecución. Cada nodo conserva su UUID fuente. El constructor puede almacenar `sourceNodeIds` a partir de esta correspondencia sin reutilizar UUID fuente como ID del resumen.

| Grupo | AS-IS separación | AS-IS cuota inicial |
|---|---|---|
| A-01 | E03 | E20 |
| A-02 | E04 | E21 |
| A-03 | E05 | E22 + E23, verificaciones paralelas |
| A-04 / G1 | E06 + E07 | E25 + E36, consolidación y decisión |
| A-05 | E32 + E34 | E26 + E37 |
| A-06 | E33 | E27 |
| A-07 | E35 + E08 | E28 |
| A-08 | E09 + E10 | E29 + E30 + E31 |

TO-BE2: T-01 = E05/E06/E08/E09/E10/E07; T-02 = E12/E13/E11; G1 = E14; T-03 = E15/E16/C03 (retorno resumido explícitamente inferido); T-04 = E17/E18, chip sistema E19; T-05 = E20, G2 = E21; T-06a = E22, T-06b = E23/E24; T-07 = E25/E26; T-08a = E27, T-08b = E28/E29; END = E30. Contexto previo TO-BE = E01/E02/E03/C01/C02/E04.

### A.2 Inventario literal de nodos y secuencias

Este inventario preserva etiquetas originales, incluso errores ortográficos y nombres vacíos. La interfaz utiliza los nombres corregidos/resumidos ya prescritos; no expone UUID ni metadatos de equipo. Los nodos vacíos son compuertas, no tareas que deban recibir instrucciones inventadas.

#### S-ASIS — AS IS

Modificación declarada del modelo: `2026-09-01T19:24:11.1832766-05:00`. No es publicación empresarial.


Flujo de la empresa; proceso fuente `092ba97e-8948-4a45-bba7-e89ba2004784`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| E01 | `087d6406-fd0a-422f-864c-e738dddf5b62` | Elección del bien confirmada por el cliente | EJECUTIVO DE VENTAS |
| E02 | `5e5fe7a8-9c22-474d-a534-eaac0a61fd1b` | Cliente deposita separación | EJECUTIVO DE VENTAS |
| E03 | `5a5cc926-eb08-4972-a5c2-6be679bbafa2` | Adjuntar comprobante de pago al grupo de Whatsapp con los detalles del bien | EJECUTIVO DE VENTAS |
| E04 | `1c16534c-1b9a-46e9-94eb-5cfc7dbc0a9e` | Crear carpeta y registrar elección del bien en Google Drive | EJECUTIVO DE VENTAS |
| E05 | `45f246fe-fcfc-4bff-bd90-fbb4369616b2` | Verificar abono en la cuenta bancaria y que los documentos esten correctos | ASISTENTE ADMINISTRATIVO |
| E06 | `ad026737-83d2-45d7-a875-25a31e43fbfc` | Validar solicitud de emisión de boleta | ASISTENTE ADMINISTRATIVO |
| E07 | `1a9cb969-1265-4b65-aa3e-112b5a43a402` | ¿La solicitud está conforme para boletear? | ASISTENTE ADMINISTRATIVO |
| E08 | `724e0f52-d873-406d-9526-53bc66226199` | Generar y adjuntar la boleta de separación en el mismo hilo de correo | ASISTENTE CONTABLE |
| E09 | `93b30371-19ba-4ff6-bed9-7c482f86f11a` | Descargar boleta de separación del correo | EJECUTIVO DE VENTAS |
| E10 | `6eeaf1c7-ab1f-4823-9a93-7f0534f822db` | Enviar la boleta al cliente | EJECUTIVO DE VENTAS |
| E11 | `b3de0b8d-3f1e-4a3e-bdf5-db9408be8f79` | Gestionar devolución del pago de separación | EJECUTIVO DE VENTAS |
| E12 | `b1666177-b3c5-474c-9cb0-cb8c10fb3c97` | Devolución del pago de separación completada | EJECUTIVO DE VENTAS |
| E13 | `6a75f888-ff80-444c-8a23-bd269abe3455` | Recibir y guardar la evidencia de la captura en la carpeta del cliente | EJECUTIVO DE VENTAS |
| E14 | `82b161ba-b3ac-42c4-a0d1-9f69d6553790` | (compuerta sin etiqueta) | EJECUTIVO DE VENTAS |
| E15 | `4e4f17aa-d480-43f3-b88c-abad51136310` | Solicitar pago de la cuota inicial al cliente | EJECUTIVO DE VENTAS |
| E16 | `13426509-69e1-4e02-b586-007d20a4cff2` | Coordinar la formalización de la minuta con el área legal | EJECUTIVO DE VENTAS |
| E17 | `31458362-735b-42dc-bab7-ebe7f1c68213` | Formalizar minuta de compraventa | EJECUTIVO DE VENTAS |
| E18 | `a5124ec2-d1ec-4b8c-945e-b30864688b6d` | Recibir comprobante de pago de la cuota inicial del bien | EJECUTIVO DE VENTAS |
| E19 | `87afb24b-dc43-4cae-8424-a15c2a384dae` | (compuerta sin etiqueta) | EJECUTIVO DE VENTAS |
| E20 | `4ab9efb4-f78a-4d1f-985c-dae82a0dc473` | Comunicar voucher de la cuota inicial por WhatsApp | EJECUTIVO DE VENTAS |
| E21 | `8e2c5951-5ae8-466f-816b-7f2ea517d922` | Adjuntar minuta formalizada y comprobante de cuota inicial al Google Drive | EJECUTIVO DE VENTAS |
| E22 | `30fc5ad6-f334-4723-91e9-197d137c6f6e` | Verificar abono de la cuota inicial | ASISTENTE ADMINISTRATIVO |
| E23 | `93eba942-5feb-45e4-9912-ecd5ea52b806` | Verificar minuta firmada en Drive | ASISTENTE ADMINISTRATIVO |
| E24 | `ccdfeaee-6c34-45a1-99ec-eb42519de242` | (compuerta sin etiqueta) | ASISTENTE ADMINISTRATIVO |
| E25 | `109cb6cf-3b5c-4061-aad6-3b1c29ba4a87` | (compuerta sin etiqueta) | ASISTENTE ADMINISTRATIVO |
| E26 | `04eafd6e-61a4-43c6-a3a1-e39fd6f54285` | Comunicar observaciones al ejecutivo de ventas | ASISTENTE ADMINISTRATIVO |
| E27 | `f225ad60-9f66-4776-9c8d-72d24d53a742` | Solicitar emisión de la boleta de cuota inicial en el mismo hilo de correo | ASISTENTE ADMINISTRATIVO |
| E28 | `ea0478b8-0013-49f9-92cb-a31c42636f4a` | Generar y adjuntar la boleta de cuota inicial en el mismo hilo de correo | ASISTENTE CONTABLE |
| E29 | `025bdac6-e374-45f8-bf88-a3bac61a3df8` | Descargar la boleta de cuota inicial | EJECUTIVO DE VENTAS |
| E30 | `5e4389d6-f4db-42e6-9428-a80ef698df86` | Enviar boleta de cuota inicial al cliente | EJECUTIVO DE VENTAS |
| E31 | `387acde7-73b0-4f4c-a3b0-f24885cb7984` | Boleta de cuota inicial enviada y archivada | EJECUTIVO DE VENTAS |
| E32 | `7d148759-ce40-4622-bf89-75f7e32b65ed` | Comunicar observaciones al asesor para que corrija | ASISTENTE ADMINISTRATIVO |
| E33 | `e715ab52-60e1-427e-a066-c7adfd851e4b` | Enviar solicitud de emisión de boleta a Contabilidad por correo | ASISTENTE ADMINISTRATIVO |
| E34 | `26d48220-769b-47c5-88f4-601cf14dc4ae` | Levantar observaciones | EJECUTIVO DE VENTAS |
| E35 | `a0d501c8-9788-4033-bb3a-14a9074be3f7` | Emisión de boleta de pagos | ASISTENTE CONTABLE |
| E36 | `70857d52-da4e-4324-8962-a7b2a2e8ede0` | ¿El abono y la minuta están conformes? | ASISTENTE ADMINISTRATIVO |
| E37 | `b35717fc-27ae-467b-98d0-4c1ce7fef322` | Corregir observaciones | EJECUTIVO DE VENTAS |

Secuencias declaradas: E01 → E02; E02 → E03; E03 → E04; E04 → E05; E05 → E06; E06 → E07; E07 → E33 [SI]; E07 → E32 [NO]; E09 → E10; E13 → E14; E14 → E15; E14 → E16; E15 → E18; E16 → E17; E18 → E19; E17 → E19; E19 → E20; E20 → E21; E21 → E24; E36 → E26 [NO]; E36 → E27 [SI]; E24 → E22; E24 → E23; E23 → E25; E22 → E25; E25 → E36; E27 → E28; E29 → E30; E30 → E31; E08 → E09; E28 → E29; E11 → E12; E32 → E34; E34 → E05; E33 → E35; E35 → E08; E26 → E37; E37 → E21.


Participante Cliente; proceso fuente `d49c4cf5-6b8f-4d16-9c9c-7900238afddd`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| C01 | `492104d0-cde1-4173-8532-af198f022213` | Recepcionar boleta de separación | CLIENTE |
| C02 | `bb3e0837-79e8-4ae6-b918-185062928a05` | Solicitar evaluación de financiamiento al banco | CLIENTE |
| C03 | `bd2bfcfe-ee8f-4686-8621-5dc00d7ec7e6` | ¿El banco aprobó el financiamiento? | CLIENTE |
| C04 | `0f043428-d5d4-4eda-97cc-4a6315e61e27` | Recibir correo de pre clasificación por parte del banco | CLIENTE |
| C05 | `bfc520fa-9eb3-4ea0-9852-222f930f91b9` | Enviar captura del correo de pre clasificación al ejecutivo de ventas | CLIENTE |
| C06 | `6027e036-eac4-4a88-a220-6387f6e82f29` | Solicitar devolución del pago de separación | CLIENTE |

Secuencias declaradas: C01 → C02; C02 → C03; C03 → C04 [SI]; C03 → C06 [NO]; C04 → C05.


Intercambios entre participantes: E10 → C01; C06 → E11; C05 → E13.


#### S-TOBE1 — TO BE

Modificación declarada del modelo: `2026-09-01T19:24:11.2101389-05:00`. No es publicación empresarial.


Flujo de la empresa; proceso fuente `20f5ba6d-a0c8-40ef-979c-2f4682299c1e`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| E01 | `6c852ff7-caca-42af-9832-520e89c580fb` | Elección del departamento confirmada | EJECUTIVO DE VENTAS |
| E02 | `4c4e3ec1-e145-4be6-8ec1-9c6d44de4895` | Registrar cliente, especificaciones del bien y condiciones en Sperant | EJECUTIVO DE VENTAS |
| E03 | `b980463c-8ed7-4187-8736-b6bfbc526d63` | Gestionar firma del convenio de separación | EJECUTIVO DE VENTAS |
| E04 | `3b3f8852-b858-4a44-a449-b2576dd3099f` | Generar el convenio de separación en Sperant | EJECUTIVO DE VENTAS |
| E05 | `f040d300-881a-4fbe-bcff-5051276ac590` | Recibir voucher de separación | EJECUTIVO DE VENTAS |
| E06 | `991ebfa3-18cc-4527-b40a-c64e0029cc38` | Registrar pago de separación en Sperant | EJECUTIVO DE VENTAS |
| E07 | `a67540cf-cf61-45d3-a011-6c0ff9c75d1a` | Gestionar emisión de boleta | EJECUTIVO DE VENTAS |
| E08 | `a28b8ebf-9d98-432a-b0dd-3d1ac0267788` | Enviar boleta de separación al cliente | EJECUTIVO DE VENTAS |
| E09 | `a04a77e8-126a-405e-a342-f1d945282d5a` | Gestionar devolución del pago de separación | EJECUTIVO DE VENTAS |
| E10 | `c339451a-f727-472e-ba80-32adbbcfa6b8` | Devolución del pago de separación completada | EJECUTIVO DE VENTAS |
| E11 | `d9e95ea8-a378-4cb2-a0a8-13f7c265bc01` | Adjuntar dicha evidencia en Sperant | EJECUTIVO DE VENTAS |
| E12 | `518f40ea-1d14-4e1b-a8dd-e4ba68f45f26` | Tarea 1 | EJECUTIVO DE VENTAS |
| E13 | `b710fdb3-f51b-47c8-8b61-ca40195a57fb` | Tarea 2 | EJECUTIVO DE VENTAS |
| E14 | `5b14b676-3808-47f5-b70b-db74f15f9fac` | (compuerta sin etiqueta) | EJECUTIVO DE VENTAS |

Secuencias declaradas: E01 → E02; E02 → E04; E04 → E03; E05 → E06; E06 → E07; E07 → E08; E09 → E10; E11 → E14; E14 → E12; E14 → E13.


Participante Cliente; proceso fuente `ff46edfe-23c1-45ad-928a-a1b0c8cbc1b1`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| C01 | `8959b1c1-dd0e-4135-a436-6e14d9e8d448` | Realizar pago de separación | CLIENTE |
| C02 | `584da500-9982-453a-8e95-c5a9be4c3fe8` | Enviar voucher de separación | CLIENTE |
| C03 | `764352a8-774f-4d5b-b8e3-bc153c19b1f1` | Recibir boleta de separación | CLIENTE |
| C04 | `a3043106-bdaa-4763-93d5-311b2bbf28cb` | Solicitar financiamiento al banco | CLIENTE |
| C05 | `85981158-bc23-4539-883a-ed7e1f3823db` | ¿Financiamiento aprobado? | CLIENTE |
| C06 | `d9bf2bae-b554-4ce2-8c7f-1dd0f6dbb620` | Solicitar devolución del pago de separación | CLIENTE |
| C07 | `d9fef01d-9c77-49ca-85fe-6bfda8bc9d00` | Recibir correo de pre clasificación por parte del banco | CLIENTE |
| C08 | `516812f3-91b5-4522-ba4a-0fdd5700a4d0` | Enviar captura del correo de la pre calificación | CLIENTE |

Secuencias declaradas: C01 → C02; C03 → C04; C04 → C05; C05 → C06 [NO]; C05 → C07 [SI]; C07 → C08.


Intercambios entre participantes: E03 → C01; C02 → E05; E08 → C03; C06 → E09; C08 → E11.


#### S-TOBE2 — TO BE - 2

Modificación declarada del modelo: `2026-09-01T19:24:11.2303614-05:00`. No es publicación empresarial.


Flujo de la empresa; proceso fuente `f7cb6de4-eef4-4155-9ed3-5c1b3ed2fd5d`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| E01 | `a5c5e91e-e144-43de-a71f-6dc1a1104ca1` | Elección del bien confirmada por el cliente | EJECUTIVO DE VENTAS |
| E02 | `de9a6f14-991e-4aa5-bfa0-bbe010809f79` | Registrar datos comerciales del cliente en Sperant | EJECUTIVO DE VENTAS |
| E03 | `a112c9bf-4803-4c46-9b87-15eec8db8bcb` | Gestionar documentos requeridos para la venta | EJECUTIVO DE VENTAS |
| E04 | `d0d5066a-88fb-455e-8b0c-e8676f01517e` | Documentos recibidos | EJECUTIVO DE VENTAS |
| E05 | `a6415d45-d1d8-4f9f-ae8e-dbcb09e3978e` | Identificar tipo de pago | EJECUTIVO DE VENTAS |
| E06 | `e7a8f912-a008-49fe-ab47-34a6cd6d2c7c` | ¿Qué tipo de pago corresponde? | EJECUTIVO DE VENTAS |
| E07 | `787aa9ad-b72a-4e08-80e8-38a75e573826` | (compuerta sin etiqueta) | EJECUTIVO DE VENTAS |
| E08 | `0f54f1d5-9aeb-4120-90ac-a8b4aa251af2` | Preparar expediente de separación | EJECUTIVO DE VENTAS |
| E09 | `8c7679ab-6c28-45fa-ab59-1aec9f1924a0` | Preparar expediente de cuota inicial | EJECUTIVO DE VENTAS |
| E10 | `6b725399-b67f-4db1-95e3-9b0be5721307` | Preparar expediente de cuota normal | EJECUTIVO DE VENTAS |
| E11 | `67b6efc2-03f8-4d95-b806-90bbd1913f22` | Nombrar documentos según estándar | EJECUTIVO DE VENTAS |
| E12 | `e2b4a40f-6d2b-449e-8ede-bf1058660504` | Verificar documentos obligatorios que este correctos y completos | EJECUTIVO DE VENTAS |
| E13 | `75365c48-fcc3-4d9c-8a76-0755bb52e7d7` | Verificar firmas y versión vigente | EJECUTIVO DE VENTAS |
| E14 | `e162c922-ef0d-465a-817c-ce28909dcb83` | ¿Expediente completo y correcto? | EJECUTIVO DE VENTAS |
| E15 | `fc018424-f9ae-4443-a182-95712f34a1e5` | Identificar documentos por subsanar | EJECUTIVO DE VENTAS |
| E16 | `2e05d948-5342-41ba-ba3b-8876e5e9ef49` | Solicitar subsanación al cliente | EJECUTIVO DE VENTAS |
| E17 | `7fcc1a02-f894-4f75-90ac-e8d5be6a1034` | Cargar expediente validado en Sperant | EJECUTIVO DE VENTAS |
| E18 | `347fa0da-d1d9-43d3-86eb-b3c550bf8e92` | Registrar solicitud de boleta en Sperant | EJECUTIVO DE VENTAS |
| E19 | `ed3ea1a2-7c14-485e-b560-0ed83506757b` | Actualizar estado a Pendiente de validación | SPERANT CRM |
| E20 | `674d52c3-882d-4a53-ab92-a1d0d807b7dd` | Revisar expediente en Sperant | ASISTENTE ADMINISTRATIVO |
| E21 | `0d68e341-0099-4093-828c-48223bf3f1a1` | ¿Expediente conforme para emisión? | ASISTENTE ADMINISTRATIVO |
| E22 | `d8c1c519-1f53-4d86-96ac-b2585a883b3f` | Registrar observación en Sperant | ASISTENTE ADMINISTRATIVO |
| E23 | `ea0e28d2-8806-429d-9f48-8b99b1839276` | Atender observación | EJECUTIVO DE VENTAS |
| E24 | `96e38371-eeda-43d1-93ee-9a0185b7d7b3` | Actualizar expediente en Sperant | EJECUTIVO DE VENTAS |
| E25 | `b1030409-f2a0-40cd-a472-84dbd4b31325` | Aprobar solicitud de boleta | ASISTENTE ADMINISTRATIVO |
| E26 | `2ac6e9bc-56ea-4142-bc1b-3d0aa542d9e1` | Solicitar generar la boleta por correo en copia de involucrados directos | ASISTENTE ADMINISTRATIVO |
| E27 | `c18d486f-fafe-4e9d-8be9-20bacd87d5a6` | Generar y adjuntar la boleta de cuota inicial en el mismo hilo de correo | ASISTENTE CONTABLE |
| E28 | `d6e63d2c-8626-4188-a19e-5f2dbaba1635` | Descargar la boleta del correo | EJECUTIVO DE VENTAS |
| E29 | `e5ab8444-8a70-4243-b6d5-59bb47ec2a59` | Enviar boleta al cliente | EJECUTIVO DE VENTAS |
| E30 | `d78023a7-3d10-4ff0-a2ef-f2ca7cc9781e` | Boleta emitida y enviada | EJECUTIVO DE VENTAS |

Secuencias declaradas: E02 → E03; E04 → E05; E05 → E06; E06 → E08 [SEPARACIÓN]; E06 → E09 [CUOTA INICIAL]; E06 → E10 [CUOTA NORMAL]; E01 → E02; E08 → E07; E09 → E07; E10 → E07; E07 → E12; E12 → E13; E13 → E11; E11 → E14; E14 → E15 [NO]; E14 → E17 [SI]; E15 → E16; E17 → E18; E18 → E19; E19 → E20; E20 → E21; E21 → E22 [NO]; E22 → E23; E23 → E24; E24 → E20; E21 → E25 [SI]; E25 → E26; E26 → E27; E28 → E29; E29 → E30; E27 → E28.


Participante Cliente; proceso fuente `5e09eebc-ed7c-4113-9f27-7457d0e4cf49`.

| Ref. | UUID fuente | Etiqueta original | Carril observado |
|---|---|---|---|
| C01 | `d2643491-80da-47a0-bb8e-1d477d958d39` | Realizar pago | CLIENTE |
| C02 | `18694c40-32bd-4d97-9ecc-84429f3f6952` | Enviar comprobante de pago y documentos solicitados | CLIENTE |
| C03 | `2e29cea5-55b3-4219-98e8-f3f1b0f64fc0` | Enviar documentos subsanados | CLIENTE |

Secuencias declaradas: C01 → C02.


Intercambios entre participantes: E03 → C01; C02 → destino ausente en XML; E16 → C03; C03 → E11.

## Anexo B. Matriz de aceptación ejecutable por el constructor

Esta matriz es un plan de comprobación, no resultados de pruebas del prototipo. Registrar `pass/fail`, evidencia y entorno al implementar. Volver a fixture inicial antes de cada prueba salvo dependencia explícita.

| Prueba | Preparación y acción | Resultado preciso |
|---|---|---|
| AT-01 | Copiar solo HTML, desconectar red y abrir | Tab architecture, cabecera prescrita, cinco pestañas; ninguna petición ni error. |
| AT-02 | Seleccionar C-GRAPH con teclado y activar lista | Función Neo4j, VPS y relación con servicio central; mismo contenido en ambos modos. |
| AT-03 | Scope: Fuera de alcance, luego SC-17 | No aparece aprobación corporativa dentro de funcionalidades incluidas; sí explicación de avisos de incidencias. |
| AT-04 | Organigrama manager: expandir todo | Seis áreas, 20 puestos/cajas internos, 23 ocupantes internos, cinco externos; cuatro nombres en J-08; sin falso mando entre asistentes. |
| AT-05 | A-AF → espacio → Abrir flujo boletas → A-03 → instrucción | Cinco acciones desde entrada web al detalle, fuente visible y tiempo sin dato. |
| AT-06 | A-03 → rol → puesto → persona; dos Back inspector; cerrar | Contexto/cámara sin cambios; vuelve foco a entidad o control de mapa estable. |
| AT-07 | Zoom al 130%; abrir inspector; cerrar; cambiar pestaña/volver | Misma cámara 130%; ningún cambio de nivel o profundidad causado por zoom. |
| AT-08 | Seleccionar OBJ-01; inspeccionar SYS-DRIVE; cerrar | Raíz de relaciones sigue OBJ-01; limpiar foco restaura énfasis; no existe métrica numérica. |
| AT-09 | Buscar “Xyomara”, “administracion” y una cadena inexistente | Resultados por normalización, cuenta veraz y estado vacío recuperable; no mueve cámara. |
| AT-10 | Cambiar a U-EMPLOYEE estando en PR-01 y buscar persona ajena al conjunto permitido | Ajuste a boletas, sin resultados ni contadores de registros no autorizados. |
| AT-11 | Abrir variantes separación/cuota inicial/normal AS-IS | Dos flujos resumidos con fuentes distintas; tercera informa detalle ausente. |
| AT-12 | Mostrar TO-BE 2, T-06 y T-08 | Grupos multirol revelan subtareas y ejecutores; SPERANT rotulado propuesta sin conexión. |
| AT-13 | Abrir histórico de persona, proceso y actividad | Referencias sin fecha de publicación inventada; proceso contiene tres modelos fuente. |
| AT-14 | U-MANAGER intenta guardar incidencia y publicar desde CTA alterno | Acción bloqueada en command store; datos sin cambios; explicación visible. |
| AT-15 | U-OWNER crea incidencia válida y cierra INC-DEMO-01 | Nuevo ID INC-DEMO-04; después de cerrar desaparece aviso Vencido, queda fecha y resultado. |
| AT-16 | Crear incidencia con fecha inválida y asunto vacío | Errores inline, foco primer error, campos conservados y cero inserciones. |
| AT-17 | Editar proyecto PM-01 y cancelar | Cambios sin guardar no se aplican; cerrar por formulario no crea AS-IS. |
| AT-18 | SCN-01 hasta R-01, rechazar con motivo | No V-TOBE-03, no cambio PM-01; motivo en stream; fuentes originales intactas. |
| AT-19 | SCN-01 hasta R-01, cancelar y retomar | Staging conservado, versión no publicada, única revisión pendiente. |
| AT-20 | SCN-01, editar instrucción válida, publicar doble clic | Una V-TOBE-03, instrucción editada idéntica en web/artefacto, target de PM-01 actualizado. |
| AT-21 | SCN-01, simular lectura fallida y reintentar | Error detiene avance, reintento continúa sin duplicar mensaje/evento y conserva evidencias. |
| AT-22 | Detener o salir de pestaña entre tool-start y result | Ningún evento avanza oculto; Continuar resuelve el paso una sola vez. |
| AT-23 | SCN-02 antes de SCN-01 | Bloqueado con explicación y CTA a revisión; no cambio de proyecto. |
| AT-24 | Tras AT-20, SCN-02 con casilla sin marcar, luego válida | Primero validación sin cambio; después commit único PM-01 + V-ASIS-02 + puntero, original intacto. |
| AT-25 | Tras AT-24, U-EMPLOYEE abre AS-IS de demo e histórico | Puede consultar AS-IS 2 y AS-IS 1; no las propuestas TO-BE no autorizadas. |
| AT-26 | Dos workspaces con borradores y cambio chat/operaciones | Textos independientes; stream de boletas solo en sesión de boletas. |
| AT-27 | Crear cuenta duplicada y eliminar único admin | Ambos bloqueados; no registros parciales ni contraseñas. |
| AT-28 | Nota de formulario contiene `<script>alert(1)</script>` | Texto literal seguro; no ejecución ni alteración del DOM. |
| AT-29 | Reset durante revisión pendiente, primero cancelar y luego confirmar | Cancelar conserva; confirmar elimina staging, timers, registros y versiones de demo; arquitectura + manager. |
| AT-30 | Teclado completo, móvil, 200% y reduced motion | JRN-02/06/08 completables; foco retorna; no acciones cortadas ni texto ilegible. |
| AT-31 | Build con endpoint erróneo introducido en fixture de prueba | Falla validación, no produce artefacto con enlaces rotos. |
| AT-32 | Inspección del bundle y red | Sin rutas privadas, clientes históricos, credenciales, archivos fuente completos ni dependencias externas. |

Definiciones adicionales que evitan ambigüedad de estado:

- El permiso de U-EMPLOYEE sobre actividades/documentos/sistemas AS-IS se resuelve para **cada versión AS-IS autorizada**, no por el prefijo A/T de sus claves. Después de SCN-02 puede consultar T-01…08 bajo V-ASIS-02 y sus recursos, siempre como adopción ficticia; ello no concede acceso a V-TOBE-03. Conservar `originVersionId` como metadato restringido si remite a versión no visible; mostrar «Derivada de una propuesta» sin enlace no autorizado.
- El cambio de perfil no oculta la presentación comercial tabs 1–3; los filtros de permisos se aplican a los datos y acciones de los módulos web/escritorio. Las tablas de alcance/metodología explican capacidades generales, no enumeran datos ocultos de usuarios.
- Si se repite un escenario tras rechazo, usar `runOrdinal` incremental. Los IDs lógicos E01… son estables en el guion, pero el eventId efectivo incluye escenario, ejecución y paso; requestId efectivo incluye ejecución. El target V-TOBE-03 sigue único para la demo. Reset reinicia esos ordinales y cancela callbacks anteriores mediante generation ID.
- Si se navega a una versión histórica, el encabezado dice «Versión histórica · solo lectura» y no modifica `currentAsIsVersionId`. Publicar no cambia silenciosamente la versión que otro panel ya está consultando; muestra aviso «Hay una nueva versión de demostración» con «Ver versión».
- Los estados de review son `pending`, `approved`, `rejected`, `canceled`; canceled conserva staging y puede volver a pending mediante Retomar. Approved/rejected son terminales para esa ejecución. Los estados de reproducción son `idle`, `running`, `paused`, `stopped`, `awaiting-review`, `failed`, `completed`; el perfil, tab y estado determinan qué controles están disponibles.

## Anexo C. Cobertura de las aclaraciones del cliente

| Pregunta S-MAIL | Traducción a esta especificación |
|---|---|
| 1 · Objetivo y problema | §§3–4, conocimiento conectado y trazabilidad; contenido a cargo de Próspera. |
| 2 · Inicio/fin y métodos | §6, SC-01…20, §10.3; adopción metodológica limitada y explícita. |
| 3 · Usuarios y beneficios | §5, organización/trabajo, escritorio e incidencias/proyectos. |
| 4 · Quién modifica/aprueba | Admin analista desde escritorio; sin circuito de aprobación corporativa. |
| 5 · AS-IS/TO-BE y conversión | WEB-06/07/09, SCN-02, versiones preservadas y respaldo externo. |
| 6 · Propuestas de IA | SCN-01 explica hallazgos y cambios documentales; atribuye el rediseño entregado al cliente. |
| 7 · Trabajo humano/IA | Propuesta revisable y editable; analista toma decisión. |
| 8 · Margen de error | Provenance, pendientes, comparación, rechazo, validación y falta de métricas explícita. |
| 9 · Construcción/revisión/publicación | TO-BE en memoria, revisión del analista, publicación; validaciones corporativas fuera del producto. |
| 10 · Historial/fechas/responsables | Histórico en todas las fichas; fechas desconocidas no inventadas; nuevos eventos con actor de demo. |
| 11 · Avisos | Solo vencimientos en sección incidencias; no notificaciones por versión, email ni push. |
| 12 · Independencia | SC-14 entrega de código y transferibilidad descrita; no promesa de mantenimiento ilimitado. |
| 13 · Licencias/infraestructura | SC-12/14/20, núcleo MIT, Claude a cargo del cliente y VPS comercial por confirmar. |
| 14 · Actualización | Escritorio mantiene contenido; Próspera conserva responsabilidad del dato. |
| 15 · Eficiencia IA | Sin telemetría, ahorro calculado o ROI medido; fuera de alcance. |
| 16 · Ciclo completo | AS-IS, diagnóstico cualitativo, TO-BE, seguimiento y versiones; no motor operativo ni automatización externa. |

El concepto «Trabajo» del recorrido solicitado se materializa en la instrucción de actividad y la lista de actividades asociadas al rol/puesto. No se transforma en tickets personales de venta o bot ejecutor. Las funciones de diseño/creación del escritorio se demuestran con la edición de una instrucción y su artefacto; esta demo no es un modelador BPMN de propósito general.

## Anexo D. Decisiones pendientes para producción y revisión documental

No bloquean construir este prototipo porque existe una representación explícita de incertidumbre. No deben presentarse como tareas ya resueltas o compromisos adquiridos.

| ID | Decisión por confirmar | Responsable funcional sugerido | Tratamiento cerrado en esta demo |
|---|---|---|---|
| DEC-01 | Identidad del Process Owner personal y aprobaciones reales AS-IS | Próspera, Administración y Finanzas | Dueño documentado a nivel área; perfil de seguimiento ficticio. |
| DEC-02 | Matriz real de permisos y delegación de mantenimiento | Administrador y responsable del proyecto | Perfiles de §5, sin crear cuentas de personas reales. |
| DEC-03 | Equivalencia cuota normal/complementaria y requisitos | Dueño del proceso / Ventas | Nota pendiente y variantes con el literal de cada fuente. |
| DEC-04 | Control preventivo completo, retorno de subsanación y alcance de emisión por pago | Analista y participantes del proceso | Resumen TO-BE por validar, sin corregir silenciosamente el archivo original. |
| DEC-05 | Capacidades y automatización disponibles en SPERANT | Próspera y proveedor de SPERANT | No integración; dependencia visible. |
| DEC-06 | Misión, visión, objetivos aprobados, catálogo de capacidades y tiempos/KPI | Gerencia y dueños de proceso | Mensajes de datos ausentes; solo OBJ/KPI propuestos sin valores. |
| DEC-07 | Taxonomía, edición/mapeo APQC y profundidad de otros marcos | Analista / Product Owner | Referencias metodológicas, sin códigos ni certificaciones. |
| DEC-08 | Plataforma del escritorio, empaquetado y habilitación hasta tres equipos | Equipo técnico / Próspera | App portable representada; Claude Code es dependencia explícita. |
| DEC-09 | API, almacén de seguridad, gestión de archivos y estrategia de consistencia/respaldos | Equipo técnico | Responsabilidades y fronteras definidas; producto/tecnología secundaria pendiente. |
| DEC-10 | Primer año VPS, proveedor, dominio/SSL y gastos recurrentes | Partes contratantes | SC-20, diferencia visible sin inventar precio final. |
| DEC-11 | Responsable técnico, garantía y soporte posterior | Partes contratantes | No promesa de mesa de ayuda permanente; periodo no inventado. |
| DEC-12 | Política de uso de datos con IA y material permitido | Próspera | Solo fuentes seleccionadas en solución futura; demo no envía datos. |

Revisión de este documento: lectura de guías y fuentes locales; descompresión/lectura de los tres modelos; revisión visual del organigrama y diagramas; comprobación de estructura de 19 secciones, enlaces locales, tablas, IDs y cobertura. No se han construido pantallas ni ejecutado pruebas de navegador de este prototipo. Las comprobaciones de implementación del anexo B permanecen pendientes por diseño.
