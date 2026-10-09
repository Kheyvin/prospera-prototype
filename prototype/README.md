# PRIMUS para Próspera — prototipo portátil (código fuente)

Este directorio contiene el código fuente mantenible del prototipo descrito en
[`../prototype-prospera/spec.md`](../prototype-prospera/spec.md) y la herramienta que lo
compila en **un único archivo HTML autónomo**:

```
dist/prospera-prototype.html      ← el archivo que se envía (correo, WhatsApp); funciona por doble clic, sin servidor ni conexión
dist/prospera-build.json          ← informe local del build (hash SHA-256, entradas, comprobaciones); no hace falta enviarlo
```

> Decisión de ubicación: la especificación nombra `implementation/dist/prospera-prototype.html`
> (§2, §18). Por instrucción expresa del propietario del proyecto, las fuentes viven en la carpeta
> `prototype/` de la raíz del repositorio y el artefacto se genera en `prototype/dist/`. El orden de
> autoridad de la propia especificación (§2) da prioridad a las instrucciones del propietario.

## Cómo construir y probar

Requisitos: Node.js ≥ 20 (se usó Node 26). No hay dependencias npm, ni en tiempo de ejecución ni de
desarrollo; el destinatario del HTML solo necesita un navegador.

```sh
cd prototype
npm run validate      # valida el pack de contenido (IDs únicos, referencias, enumeraciones, flujos, escenarios)
npm run build         # node build/build.mjs --client prospera  → dist/prospera-prototype.html + dist/prospera-build.json
npm run build:dev     # variante con <link>/<script src> hacia src/ para depurar sin reconstruir
npm test              # pruebas de contrato, interacción (sin DOM) y entrega, con node:test
npm run test:browser  # recorridos en navegador real (opcional; ver «Pruebas en navegador»)
```

El build falla con código distinto de cero y **no reemplaza** el último artefacto válido si el pack
no valida, si el JavaScript concatenado no compila, si aparece una referencia externa no permitida
o si el archivo supera el presupuesto de 5 MiB. Está prohibido editar `dist/` a mano.

## Arquitectura del código

Principios: JavaScript modular sin framework, HTML semántico, CSS con tokens PRENTER e SVG en línea
(`arch.md` §1, spec §17). Separación estricta entre **motor de presentación genérico** y **pack de
contenido del cliente**; todo cambio de estado pasa por comandos validados; las vistas derivan
de selectores puros; no se usa `innerHTML` con texto de datos ni de usuario.

```
build/        build.mjs (compila), validate-pack.mjs, manifest.json (lista ordenada y cerrada de fuentes)
schemas/      pack-validator.js (contrato del pack v1) y su descripción legible
src/
  prelude.js  registro de módulos Primus.module/require (scripts clásicos; sin import/export en runtime)
  core/       dom, format, pack (índices), graph (recorridos tipados, SIPOC, RACI, histórico, búsqueda),
              permissions (matriz §5), store (estado, comandos, reloj lógico, temporizadores con generación),
              versions (snapshots TO-BE 3 / AS-IS 2), scenarios (reproducción determinista del escritorio),
              selectors (modelos de vista), commands/ (app, web, tracking, security, desktop)
  ds/         tokens.css (extracción PRENTER), extensions.css, base/atoms/molecules (.css + .js), icons.js, catalog.html (solo desarrollo)
  components/ shell/ (cabecera, pestañas, acerca de, reinicio, avisos) · twin/ (lienzo con cámara, rail, barra de contexto,
              lista alternativa, inspector, histórico) · analyst/ (roster, chips, stream, tool cards, operaciones, revisión, compositor, evidencias)
  features/   architecture, scope, methodologies, web (organigrama, mapa, relaciones, espacio de área, ficha,
              flujo, instrucción, comparación, incidencias, proyectos, seguridad), desktop (estudio y escenarios)
  styles/     layout, visualization, responsive, print
clients/prospera/  pack de contenido (identidad, fuentes, solución C4, alcance, metodologías, organización,
                   caso de boletas, seguimiento, escritorio, escenarios). Se fusiona en un solo objeto al construir.
tests/        contracts/ (pack, grafo, permisos, store, comandos, escenarios, versiones), interactions/, delivery/, browser/
docs/         store.md, selectors.md, desktop-engine.md, design-system.md (APIs implementadas), screenshots/, verificación
CONTRACTS.md  contratos internos de implementación (sistema de módulos, formato del pack, estado, comandos, API DS, test ids)
```

Dependencias permitidas: feature → organismo → molécula → átomo → tokens; `core` no conoce el DOM de
las features; el contenido del cliente nunca importa código del renderer.

### Decisiones de implementación

- **Módulos sin bundler.** Cada archivo registra un módulo con `Primus.module(id, factory)`; el build
  concatena en el orden del manifiesto y envuelve todo en un `<script>` clásico. El mismo orden lo usa
  el cargador de pruebas en Node (`tests/helpers/load.js`), por lo que el núcleo se prueba sin navegador.
- **Pack embebido y escapado.** El JSON del pack se inserta en `<script type="application/json">`
  escapando `<`, `>`, `&`, U+2028 y U+2029; no existe ninguna petición de red.
- **Estado y comandos.** Cada `dispatch` trabaja sobre una copia del estado; un comando que falla no
  modifica nada (validación de actor, payload, referencias y estado actual). Los perfiles de acceso se
  aplican en los comandos y selectores, no solo en la interfaz.
- **Reloj lógico.** La fecha empresarial es 2026-10-06; el reloj de eventos empieza a las 10:00:00 -05:00
  y avanza un segundo por acción registrada (spec §14.1). Nunca se usa la hora real del navegador para
  estados de vencimiento.
- **Versiones como snapshots.** V-TOBE-03 y V-ASIS-02 se crean en memoria como copias completas (con sus
  actividades resueltas) a partir de la versión base; las referencias AS-IS/TO-BE 1/TO-BE 2 son inmutables.
  Publicar es idempotente por `requestId`; un doble clic no duplica versiones.
- **Sin persistencia.** No se usa `localStorage`, cookies, IndexedDB ni service worker; recargar
  restaura el fixture original (spec §14.1).
- **Fuentes del sistema.** No se descargan tipografías; se declaran las pilas locales de PRENTER con
  fallback a `system-ui` (design.md §2).
- **Lienzos accesibles.** Los nodos de organigrama, mapa y flujo son `<button>` HTML posicionados en una
  capa con transformación de cámara; las aristas se dibujan en un SVG debajo. Existe una lista alternativa
  con los mismos enlaces y acciones para cada lienzo.
- **Pruebas en navegador sin instalar nada.** `tests/browser/launch.js` reutiliza, si existen en la
  máquina, un `playwright-core` y un Chromium ya presentes (por ejemplo los que deja el plugin MCP de
  Playwright); si no existen, las pruebas de navegador se omiten con aviso. No es una dependencia del
  proyecto ni del artefacto.

### Desviaciones y supuestos respecto de la especificación

Se registran aquí las decisiones tomadas donde la especificación deja margen o donde el constructor
tuvo que elegir. Ninguna añade datos del cliente no autorizados.

| Tema | Decisión |
| --- | --- |
| Carpeta de implementación | `prototype/` en lugar de `implementation/` (instrucción del propietario). |
| SCN-02 | Los seis pasos de §10.5 DESK-03 se modelan como siete eventos (`SCN-02-E01…E07`): el resultado de la revisión y el evento «completado» son eventos separados, como en SCN-01. |
| Descripción de J-01 | «Puesto de Próspera Grupo Inmobiliario según el organigrama entregado», porque la plantilla «Puesto del área {área}» no aplica a un puesto que no pertenece a un área. |
| Visibilidad de U-EMPLOYEE | Conjunto cerrado de §5.2; no incluye brechas, objetivo, indicador ni política. U-OWNER añade TO-BE, sistemas y documento propuestos, brechas, objetivo/indicador, política y el seguimiento del caso. |
| Decisión definida / por definir (C4) | C-WEB, C-GRAPH, C-DESK y X-CLAUDE con «Decisión definida para esta propuesta»; C-API, C-SEC, C-FILES y X-AI con «Detalle por definir»; C-DESK añade la nota de plataforma pendiente. |

## Pruebas realizadas y verificación de entrega

*(Sección que se completa con los resultados de la verificación; ver `docs/verification.md`.)*

## Limitaciones conocidas

- El archivo contiene sus datos en texto legible: el selector de perfiles simula la experiencia de
  acceso, no protege la información (spec §5.2, §14.4).
- No hay integración real con Neo4j, Claude Code, SPERANT, correo ni emisión de comprobantes; todas las
  acciones son simulaciones rotuladas y se pierden al recargar.
- Los recorridos se verificaron en Chromium; Firefox/Safari se documentan en `docs/verification.md`
  según lo que haya podido probarse.
