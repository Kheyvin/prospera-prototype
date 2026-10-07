# `src/` — las partes del mockup del twin

> **Esto es la fuente. `../index.html` es GENERADO — no editarlo nunca.**
> Se reconstruye con `python3 ../build.py`; el pre-commit lo hace solo y lo agrega al commit.

El Artifact exige **un archivo self-contained** (la política de contenido bloquea cualquier host
externo: nada de `<script src>`, ni CDN, ni fuentes remotas). Por eso el entregable sigue siendo un
`index.html` único — pero la fuente vive partida, porque un archivo de 3.400 líneas no se navega.

`build.py` concatena las partes **en el orden de su `MANIFEST`**. Ese orden ES el orden del archivo:
mover una parte de CSS cambia la cascada. Nada se transforma, sólo se pega.

## El mapa — qué toco para cambiar qué

### Estilo

| Parte | Qué gobierna |
|---|---|
| `10-tokens.css` | tokens `:root` (colores, tipografías, materiales ArchiMate), reset. **Todo color nace acá.** |
| `11-rail.css` | rail izquierdo: niveles de gestión · capas · lentes · leyendas inline |
| `12-stage.css` | escenario principal, topbar, identidad del contexto (As-Is / corrida) |
| `13-nodos.css` | los nodos del mapa: área · objetivo · proceso · KPI · pin de brecha · token cinético · íconos por tipo |
| `14-lienzo.css` | z2 (lienzo del proceso) y z3 (instrucción de trabajo) |
| `15-viewport.css` | zoom + LOD (abajo-izq) · minimapa (abajo-der) |
| `16-inspector.css` | inspector derecho · SIPOC · sala de mando · drawer de KPI · corrida |
| `17-modulos.css` | vistas de módulo · mapa de valor · organigrama nivel 4 · guardrails del arnés · capa Trabajo |
| `18-materiales.css` | las reglas de material por capa ArchiMate (las variables están en `10-tokens`) |
| `19b-directorio.css` | v18 · sala del directorio: movimientos de la sesión · cifras del resultado · caja · presupuesto · riesgos · acuerdos · inversiones |
| `19-apendice-v14.css` | **deuda** — apéndice cronológico (todo lo que se agregó de v14 en adelante). Disolverlo en los temáticos exige revisar la cascada de 9 clases que se pintan en ambos bloques: `.ap .cambio-row .gt .k .nm .off .pt .sc .tt` |

### Markup

| Parte | Qué gobierna |
|---|---|
| `20-shell.html` | el markup estático: rail, topbar, escenario, inspector, minimapa, toast |

### Datos (el twin de Terranova)

| Parte | Qué gobierna |
|---|---|
| `31-data-twin.js` | `DATA` — empresa · objetivos (+KR) · áreas · procesos · brechas · KPIs · proyectos de mejora |
| `32-data-cerebro.js` | personas · sistemas · capabilities · arneses · conocimiento · ideas · causalidad BSC |
| `33-data-valor.js` | cadena misional · pasos mini · SIPOC · los lienzos de proceso (z2) |
| `34-data-instruccion.js` | z3: instrucción de trabajo por actividad + el proceso insignia |
| `35-data-directorio.js` | apuestas · rumbo · varas del directorio + helpers derivados (`krProg` · `saludKr` · `contraste` · `mezclaReal`) |
| `36-data-gobierno.js` | v18 · resultado del periodo · caja · presupuesto · facultades · riesgos · acuerdos · inversiones · puente contable + helpers (`varia` · `nivelRiesgo` · `riesgoVsApetito` · `cajaBajoPiso`) |

De `32` en adelante son **asignaciones** `DATA.x = …` sobre el mismo objeto: un archivo por tema,
un solo `DATA`. Por eso las partes de datos no parsean sueltas — sólo concatenadas (`build.py`
corre `node --check` sobre el resultado, no sobre cada archivo).

### Motores y capas transversales

| Parte | Qué gobierna |
|---|---|
| `30-iconos.js` | paleta de semáforo + `TICO` (ícono por tipo, M13 ArchiMate) + `tbadge`/`iico` |
| `40-motores.js` | lo **derivado al leer, jamás persistido**: `semaforo()` · `PUESTOS` (D-19) · el registro de arneses (D-20) |
| `41-acciones.js` | capa de acción: catálogo `ACC` · autoridad por nivel · toast · solicitudes de cambio |
| `42-respaldo.js` | capa Respaldo del método — la cita «§ fuente» que cada panel muestra |
| `43-navegacion.js` | `gotoNivel` · `wireLinks` (el wiring universal `data-*` → ficha) · LOD · visibilidad |
| `50-state-view.js` | `state` · `view` · layout del árbol · fit/pan/zoom · helpers DOM · búsqueda |

### Pintado

| Parte | Qué gobierna |
|---|---|
| `60-render.js` | `render()` = el dispatch (qué vista corresponde al estado) + `pageView` |
| `61-organigrama.js` | z0 · piel Organigrama |
| `62-valor.js` | z0/z1 · piel Mapa de Valor — **7 bandas** (estrategia · dirección · capacidades · cadena · apoyo · gente · sistemas) + el hilo (que pasa por la capacidad) + foco de área |
| `63-lienzo.js` | z2 · el lienzo del proceso |
| `64-instruccion.js` | z3 · la instrucción de trabajo |
| `65-directorio.js` | nivel 1 · sala del directorio — la sesión en **4 movimientos** (resultado y caja · rumbo/apuestas/varas · riesgos e inversiones · decisiones, acuerdos y acta) |
| `66-tactico.js` | nivel 3 · el compromiso entre áreas |
| `67-modulos.js` | módulos Mejora · Método · Cambios |
| `68-topbar-minimapa.js` | chips de filtro · contador de subset · minimapa |

### Fichas (el inspector)

| Parte | Qué gobierna |
|---|---|
| `70-inspector.js` | `openDrawer` · `inspectorHome` (sala de mando) · `prov()` (procedencia) · SIPOC |
| `71-fichas-proceso.js` | fichas de proceso · brecha · proyecto · actividad |
| `72-fichas-kpi.js` | ficha de KPI + sparkline |
| `73-fichas-entidad.js` | fichas de apuesta · objetivo · puesto · rol · persona · arnés · área · sistema · idea · capability · empresa |
| `74-fichas-gobierno.js` | v18 · fichas de cifra · caja · presupuesto · riesgo · acuerdo · inversión · **alcance contable** (qué lee Cockpit y qué jamás reexpresa) |
| `80-eventos.js` | wiring de eventos + arranque |

## Reglas

1. **Nunca editar `../index.html`.** Es generado; el pre-commit lo pisa.
2. **Parte nueva → alta en `MANIFEST`** de `build.py`, en la posición correcta. Un archivo en `src/`
   que `MANIFEST` no nombra hace fallar el build (nadie lo concatena = isla).
3. **El orden es la cascada.** Reordenar CSS sin revisar qué pisa a qué rompe el pintado en silencio.
4. **La suite manda:** `./verify.sh` reconstruye y corre 44 pruebas con hit-testing real. Verde antes
   y después de cualquier reorganización.
5. **La suite no ve el layout.** Verde ≠ bien: los solapes, los desbordes y los textos tapados sólo
   aparecen mirando. Tras tocar geometría de bandas, capturar y **ver** (v20 encontró así tres cosas
   que las 44 pruebas daban por buenas). Un contador o un `hint` largo empuja controles fuera de la
   pantalla y eso SÍ rompe la suite, pero como "intercepta", no como "se ve feo".
5. **Cero color a mano** en una parte nueva — sale de `10-tokens.css`.

## Deuda conocida

- `19-apendice-v14.css` — disolver en los temáticos (necesita revisar la cascada de las 9 clases compartidas).
- 393 `style="…"` en línea dentro de los templates + 14 colores en crudo en el JS: el estilo vive en
  tres lugares. Migrar de a poco a clases y tokens.
- Las marcas de versión (`v13`, `v14.4`, `v17.2`…) que quedan en los comentarios son historia, no
  doctrina — el registro real vive en `../HANDOFF.md`. Lo que sí se conserva: las citas `D-NN`,
  `M-NN`, `CK-NN` (esas dicen *por qué*).
