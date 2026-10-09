# Verificación de entrega · PRIMUS para Próspera

Fecha: 2026-10-09 · Artefacto: `dist/prospera-prototype.html` (≈1,5 MB, hash en `dist/prospera-build.json`).
Entorno: Linux (contenedor), Node 22, Chromium 141 (build de Playwright 1194) en modo headless,
`playwright-core` 1.56 instalado fuera del repositorio solo para la verificación. No se probó
Firefox ni Safari en esta sesión: no estaban disponibles en el entorno.

## 1. Comprobaciones automáticas

| Comprobación | Resultado |
| --- | --- |
| `npm run validate` (pack v1: IDs únicos, referencias, enumeraciones, flujos, escenarios) | OK · 112 entidades, 140 relaciones, 3 versiones, 3 flujos, 16 fuentes |
| `npm run build` (20 checks: manifiesto, sintaxis, referencias externas, tokens prohibidos, presupuesto 5 MiB) | 20 ok · 0 fallos |
| `npm test` (contratos + interacciones + entrega, `node:test`, sin red) | 96 pruebas · 0 fallos |
| `npm run test:browser` (AT-01: apertura `file://` sin red, cero errores de consola, cero peticiones externas) | 1 prueba · 0 fallos |

Las pruebas de interacción (`tests/interactions/journeys.test.js`) recorren JRN-02, JRN-03,
JRN-04, JRN-06, JRN-08, JRN-09 y JRN-11 contra el store (sin DOM): ruta organización → área →
proceso → actividad → instrucción con Volver; cadena actividad → rol → puesto → persona con
Back del inspector; foco de relaciones del objetivo; SCN-01 rechazado / cancelado / publicado
(doble aprobación idempotente); SCN-02 bloqueado sin TO-BE 3, casilla sin marcar, publicación
atómica de V-ASIS-02 + PM-01; filtrado por perfil U-EMPLOYEE; reinicio con confirmación.

## 2. Recorridos en navegador (Chromium headless, 1440×900, red desconectada, `file://`)

Guion ejecutado con Playwright sobre el HTML copiado a un directorio sin fuentes. Resultado:
**0 errores de consola, 0 peticiones externas** en todo el recorrido.

| Journey | Pasos ejecutados | Observado |
| --- | --- | --- |
| JRN-01 | Apertura → pestañas | Inicia en «Arquitectura de la solución»; cinco pestañas en orden. |
| JRN-02 | Ver prototipo web → organigrama (32 nodos; 60 con «Expandir todo»; 4 ocupantes en J-08) → A-AF → «Abrir espacio del área» → «Abrir flujo» PR-BOLETAS (12 nodos AS-IS) → A-03 → «Ver instrucción» (9 secciones; Tiempo «Sin dato proporcionado») | Cinco acciones desde la entrada web hasta la instrucción (AT-05). Volver restaura el flujo y luego el espacio del área. |
| JRN-03 | A-03 → RL-ADMIN → J-03 → P-03 (Xyomara Vanessa Medina Huaraya) → dos veces «Ficha anterior» → cerrar | Contexto y cámara sin cambios (AT-06). |
| JRN-04 | Mapa de procesos (21 nodos, 8 relaciones declaradas) → OBJ-01 → «Mostrar relaciones del objetivo» (7 resaltados, 13 atenuados) → abrir SYS-DRIVE → buscar «boletas» (2 resultados) → limpiar | El foco se conserva al abrir el sistema y se limpia solo con la acción explícita (AT-08). |
| Relaciones | Representación «Relaciones» → raíz PR-BOLETAS (25 nodos, 24 aristas) → vista de lista (25 filas) | Lista alternativa con los mismos vínculos. |
| JRN-05 | Operativo → PR-BOLETAS → Ficha (RACI con 8 actividades) → Comparar (5 filas) → Flujo TO-BE 2 (17 nodos, 2 grupos multirol) → Histórico (3 modelos fuente) | TO-BE 1 se informa como borrador no publicable. |
| JRN-07 | U-OWNER → Incidencias (3) → «Nueva incidencia» con asunto `Prueba <script>alert(1)</script>` → guardar | Aparece INC-DEMO-04 con el texto literal (AT-28); 4 filas. |
| WEB-09 | Proyectos (PM-01) | «Preparar nuevo AS-IS» deshabilitado con explicación. |
| JRN-09 | U-EMPLOYEE | La vista se ajusta a PR-BOLETAS AS-IS con aviso; sin entrada «Usuarios y accesos». |
| JRN-12 | U-ADMIN → Usuarios y accesos → crear «Demo.Analista » (bloqueado: duplicado) → crear `prueba.usuario` manager → Bitácora (2 asientos) | Duplicado ignora mayúsculas y espacios (AT-27). |
| JRN-06 | Escritorio → SCN-01 (8 eventos) → revisión R-01 → editar instrucción → publicar | Toast «Versión TO-BE 3 creada en esta sesión»; artefacto `publicada-en-demo`. |
| JRN-08 | SCN-02 → formulario (casilla sin marcar → error, sin cambios) → marcar → preparar → publicar → «Ver nuevo AS-IS» | Abre V-ASIS-02 «AS-IS 2 · adopción simulada»; Operaciones muestra 6 filas. |
| JRN-11 | Reiniciar → confirmar | Vuelve a «Arquitectura de la solución», U-MANAGER, fixture inicial. |
| Responsive | 390×844 (web y escritorio) y 1024×768 | Rail como panel «Navegación del módulo», inspector como hoja, estudio en una columna desplazable; sin solapamientos. |

Capturas en `docs/screenshots/` (nombres según el paso del guion).

## 3. Auditoría de frontend del HTML generado (tres viewports)

Guion automático sobre `dist/prospera-prototype.html` en Chromium headless a 1440×900, 1024×768 y
390×844: 26 pasos por viewport (todos los niveles del gemelo, inspector, flujo, instrucción,
comparar, histórico, fuentes, incidencias, proyectos, seguridad, estudio del analista, acerca de,
reinicio). En cada paso se comprueban ids duplicados, controles sin nombre accesible, referencias
`aria-controls` / `aria-labelledby` / `aria-describedby` a ids inexistentes, desbordamiento
horizontal, texto recortado, objetivos menores de 24 px, solapamiento de nodos en el lienzo,
desplazamiento residual del lienzo, altura de cabecera y barra de contexto, duplicación del
texto de la instrucción y mensajes de consola.

Resultado de la corrida final: **0 errores ni avisos de consola, 0 ids duplicados, 0 controles
sin nombre, 0 referencias ARIA rotas, 0 desbordamientos, 0 nodos solapados, 0 objetivos
pequeños** en los tres viewports. Las únicas incidencias del guion son esperas del propio
driver (en anchos < 1280 el fondo transparente del inspector cierra la ficha al primer clic fuera,
tal como define ux.md, y el guion no reintenta).

Correcciones aplicadas a partir de la auditoría anterior:

| # | Falla | Corrección |
| --- | --- | --- |
| 1 | `aria-controls` de pestañas (vistas de proceso, seguridad) y de evidencias apuntaban a ids inexistentes | Pestañas con un solo panel vivo (`singlePanel`): solo la pestaña seleccionada enlaza su panel; el host visible del escenario es ese `tabpanel`; el cuerpo de cada evidencia conserva su id oculto |
| 2 | Clave cruda `collectivePosition` en el inspector | Fallback «Puesto colectivo» (y «Descripción») en `core/selectors.js` |
| 3 | Relaciones: nodos solapados y nombres cortados | Los nodos del lienzo se miden a `max-content`; relayout en el siguiente frame si aún no hay medida; etiquetas de grupo sobre cada fila |
| 4 | Flujo abierto al 50 % con texto ilegible | Apertura al 100 % (solo se centra si cabe); el lienzo ocupa el cuerpo visible del escenario |
| 5 | Chip de nivel partido letra a letra | `white-space: nowrap` global para el chip y las migas |
| 6 | Instrucción con la descripción repetida | El párrafo inicial se omite cuando «Qué hacer» lleva el mismo texto |
| 7 | Fecha de incidencia en formato del navegador | Campo de texto `YYYY-MM-DD` con patrón e `inputmode` numérico |
| 8 | Diálogo Fuentes con texto pegado | Líneas en bloque: título, nota y fechas separadas |
| 9 | Ficha PR-08: razón repetida 4 veces y área heredada | Una sola explicación (el aviso «No se proporcionó el detalle…», referenciado por `aria-describedby`); el área de la miga es la del dueño del proceso, nunca la del contexto anterior |
| 10 | 1024×768: cabecera de 175 px y migas en 3 líneas | Cabecera compacta (sin subtítulo, insignias en línea), migas en una fila desplazable, perfil y búsqueda en la segunda fila; en pantallas cortas se ocultan insignias y notas redundantes |
| 11 | Flujo TO-BE 2 a 1024: marco T-06 deformado, subtareas minúsculas | Misma medición a `max-content` (punto 3), cabecera de marco más alta, id de subtarea sin cortes; el desplazamiento por foco se convierte en paneo inmediato |
| 12 | Móvil: lienzo de ~100 px y hoja del inspector | Lienzo de 60vh con el escenario desplazable; la hoja nunca supera la altura del gemelo (su botón de cierre quedaba bajo la tira de pestañas) |
| 13 | Menú «Probar recuperación» | Disclosure controlado: conserva el estado abierto entre re-renders de la reproducción |
| 14 | Objetivos táctiles pequeños | El input de la casilla cubre toda la etiqueta; enlaces de rol de carril con altura mínima de control |
| 15 | Etiqueta «Áreas · 1» tapada por aristas; descripción de área sin etiqueta | Etiquetas sobre las filas con fondo; «Descripción: Sin dato proporcionado». Los toasts «duplicados» no se reproducen: hay un único toast visible más su anuncio `sr-only` para lectores de pantalla |

## 4. Limitaciones de esta verificación

- Firefox y Safari no se probaron (no disponibles en el contenedor); el código no usa APIs
  fuera de ES2020 + DOM estándar, pero la prueba queda pendiente.
- Zoom de texto 200 % y `prefers-reduced-motion` se verificaron solo por el contexto de
  Playwright (`reducedMotion: 'reduce'`) y las reglas CSS; no se registró una captura a 200 %.
- Las comprobaciones de contraste se basan en los tokens PRENTER documentados en
  `docs/design-system.md`; no se ejecutó un auditor automático de accesibilidad.
