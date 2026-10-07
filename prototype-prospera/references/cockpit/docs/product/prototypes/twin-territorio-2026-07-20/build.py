#!/usr/bin/env python3
"""Constructor del mockup del twin — src/ (SSoT) → index.html (GENERADO).

Mismo patrón que `sistema/arquitectura/gen_arquitectura.py` y `sistema/metodo/gen_metodo.py`:
SSoT hand-authored → vista generada → gate anti-drift en pre-commit.

Por qué existe: el Artifact exige UN archivo self-contained (CSP bloquea cualquier host
externo), pero un archivo de 3.350 líneas no se navega. Las partes viven en `src/`;
este script las concatena en el orden de MANIFEST.

Uso:
    python3 build.py            # regenera index.html desde src/
    python3 build.py --check    # NO escribe; falla si index.html difiere de src/ (gate)

La concatenación es textual y sin transformación: el orden de MANIFEST ES el orden del
archivo. No reordenar partes de CSS sin revisar la cascada.
"""
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SRC = RAIZ / "src"
SALIDA = RAIZ / "index.html"


def p(nombre):
    """Parte: un archivo de src/."""
    return ("parte", nombre)


def lit(texto):
    """Literal: andamiaje HTML que no pertenece a ninguna parte."""
    return ("lit", texto)


# ── El orden del archivo. Cambiar aquí = cambiar index.html. ──────────────────
MANIFEST = [
    p("00-head.html"),

    # ── CSS · bloque 1 — por tema, en orden de cascada ──
    lit("<style>"),
    p("10-tokens.css"),       # tokens :root + reset + materiales ArchiMate (vars)
    p("11-rail.css"),         # rail izquierdo: niveles · capas · lentes · leyendas
    p("12-stage.css"),        # main stage · topbar · identidad del contexto
    p("13-nodos.css"),        # nodos del mapa: área · objetivo · proceso · kpi · pin · cinética
    p("14-lienzo.css"),       # z2 lienzo + z3 instrucción de trabajo
    p("15-viewport.css"),     # zoom + LOD (abajo-izq) · minimapa (abajo-der)
    p("16-inspector.css"),    # inspector derecho · SIPOC · sala de mando · drawer KPI · corrida
    p("17-modulos.css"),      # vistas de módulo · mapa de valor · organigrama n4 · guardrails · capa Trabajo
    p("18-materiales.css"),   # materiales por capa ArchiMate (las reglas, no las vars)
    lit("</style>"),

    # ── CSS · bloque 2 — apéndice cronológico (v14+). DEUDA: disolver en los temáticos
    #    de arriba resolviendo las 9 clases que se pintan en ambos bloques
    #    (.ap .cambio-row .gt .k .nm .off .pt .sc .tt) — es cascada, no cosmética. ──
    lit("<style>"),
    p("19-apendice-v14.css"),
    p("19b-directorio.css"),  # v18 · sala del directorio: movimientos · cifras · caja · riesgos · acuerdos
    p("19c-sala-area.css"),   # v21 · nivel 3: portada-selector + la sala del área (bandas · abrir-y-empujar · archivo)
    lit("</style>"),

    p("20-shell.html"),       # markup estático de la app

    # ── JS ──
    lit("<script>"),
    p("30-iconos.js"),        # paleta + TICO (íconos por tipo M13) + tbadge/iico
    p("31-data-twin.js"),     # DATA — empresa · objetivos · áreas · procesos · brechas · KPIs · proyectos
    p("32-data-cerebro.js"),  # DATA.* — personas · sistemas · capabilities · arneses · conocimiento · ideas · BSC
    p("33-data-valor.js"),    # DATA.* — cadena misional · pasos mini · SIPOC · lienzos (z2)
    p("34-data-instruccion.js"),  # DATA.* — z3 instrucción de trabajo + proceso insignia
    p("35-data-directorio.js"),   # apuestas · rumbo · varas + helpers derivados (krProg/saludKr/contraste)
    p("36-data-gobierno.js"),     # v18 · resultado · caja · presupuesto · riesgos · acuerdos · inversiones · puente contable
    p("37-data-archivo.js"),      # v21 · el archivo (D-38): documentos · contratos · vencimiento derivado · área de riesgos/acuerdos
    p("40-motores.js"),       # motores derivados: semáforo · PUESTOS (D-19) · arnés (D-20)
    p("41-acciones.js"),      # capa de acción: ACC · autoridad · toast · solicitudes
    p("42-respaldo.js"),      # capa Respaldo del método (cita § fuente por panel)
    p("43-navegacion.js"),    # gotoNivel · wireLinks · LOD · visibilidad
    p("50-state-view.js"),    # state · view · layout · fit/pan/zoom · helpers DOM · búsqueda
    p("60-render.js"),        # render() = el dispatch + pageView
    p("61-organigrama.js"),   # z0 · piel Organigrama
    p("62-valor.js"),         # z0/z1 · piel Mapa de Valor (5 bandas + hilo + foco de área)
    p("63-lienzo.js"),        # z2 · lienzo del proceso
    p("64-instruccion.js"),   # z3 · instrucción de trabajo
    p("65-directorio.js"),    # nivel 1 · sala del directorio
    p("66-tactico.js"),       # nivel 3 · compromiso entre áreas
    p("67-modulos.js"),       # módulos Mejora · Método · Cambios
    p("68-topbar-minimapa.js"),  # chips de filtro · contador · minimapa
    p("70-inspector.js"),     # openDrawer · inspectorHome (sala de mando) · prov · SIPOC
    p("71-fichas-proceso.js"),   # fichas: proceso · brecha · proyecto · actividad
    p("72-fichas-kpi.js"),       # ficha KPI + sparkline
    p("73-fichas-entidad.js"),   # fichas: apuesta · objetivo · puesto · rol · persona · arnés · área · sistema · idea · capability · empresa
    p("74-fichas-gobierno.js"),  # v18 · fichas: cifra · caja · presupuesto · riesgo · acuerdo · inversión · alcance contable
    p("80-eventos.js"),       # wiring de eventos + arranque
    lit("</script>"),

    lit("</body></html>"),
]


def construir():
    trozos = []
    faltan = []
    for kind, val in MANIFEST:
        if kind == "lit":
            trozos.append(val)
            continue
        f = SRC / val
        if not f.exists():
            faltan.append(val)
            continue
        # cada parte aporta sus líneas tal cual; el separador lo pone el join.
        # Se quita UNA sola nueva-línea final (la que todo archivo de texto lleva) —
        # nunca más: una línea en blanco al final de una parte es contenido, no ruido.
        t = f.read_text(encoding="utf-8")
        trozos.append(t[:-1] if t.endswith("\n") else t)
    if faltan:
        print("ERROR · partes ausentes en src/:", ", ".join(faltan), file=sys.stderr)
        sys.exit(2)
    return "\n".join(trozos) + "\n"


def sintaxis_js(html):
    """`node --check` sobre el JS concatenado — atrapa una parte cortada por la mitad.

    Las partes de datos son fragmentos que sólo tienen sentido concatenados (DATA.x = …),
    así que la sintaxis se valida sobre el resultado, nunca archivo por archivo.
    Sin node instalado: se salta con aviso (no bloquea — el gate duro es verify.sh).
    """
    import shutil, subprocess, tempfile
    if not shutil.which("node"):
        print("aviso · node ausente — salteo el chequeo de sintaxis del JS", file=sys.stderr)
        return
    ini, fin = html.index("<script>") + len("<script>"), html.rindex("</script>")
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
        t.write(html[ini:fin])
        ruta = t.name
    r = subprocess.run(["node", "--check", ruta], capture_output=True, text=True)
    Path(ruta).unlink()
    if r.returncode:
        print("ERROR · el JS concatenado no parsea:", file=sys.stderr)
        print(r.stderr.strip()[:1500], file=sys.stderr)
        sys.exit(3)


def huerfanas():
    """Archivos en src/ que MANIFEST no incluye — un archivo que nadie concatena es una isla."""
    declaradas = {v for k, v in MANIFEST if k == "parte"}
    return sorted(f.name for f in SRC.iterdir()
                  if f.is_file() and f.suffix != ".md" and f.name not in declaradas)


def main():
    check = "--check" in sys.argv
    nuevo = construir()

    isla = huerfanas()
    if isla:
        print("ERROR · archivos en src/ fuera de MANIFEST (nadie los concatena):",
              ", ".join(isla), file=sys.stderr)
        sys.exit(2)

    sintaxis_js(nuevo)

    if check:
        if not SALIDA.exists():
            print("ERROR · falta index.html — corré: python3 build.py", file=sys.stderr)
            sys.exit(1)
        actual = SALIDA.read_text(encoding="utf-8")
        if actual != nuevo:
            import difflib
            d = list(difflib.unified_diff(actual.splitlines(), nuevo.splitlines(),
                                          "index.html (commiteado)", "src/ (SSoT)", lineterm="", n=1))
            print("ERROR · index.html quedó fuera de sync con src/ — corré: python3 build.py",
                  file=sys.stderr)
            print("\n".join(d[:40]), file=sys.stderr)
            if len(d) > 40:
                print(f"... ({len(d) - 40} líneas más de diff)", file=sys.stderr)
            sys.exit(1)
        print(f"OK · index.html en sync con src/ ({len(nuevo.splitlines())} líneas · "
              f"{len([1 for k, _ in MANIFEST if k == 'parte'])} partes)")
        return

    SALIDA.write_text(nuevo, encoding="utf-8")
    print(f"OK · index.html regenerado ({len(nuevo.splitlines())} líneas · "
          f"{len([1 for k, _ in MANIFEST if k == 'parte'])} partes)")


if __name__ == "__main__":
    main()
