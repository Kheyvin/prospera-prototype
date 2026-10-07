#!/usr/bin/env python3
"""gen_cobertura.py — verificador de cobertura del golden fixture contra objeto.schema.yaml v2.

Historia: sistema/organizacion-ficticia-golden-fixture (RN-17 · D-A1/D-A2). Mide qué tan
COMPLETO ejercen los shells el contrato — NO valida invariantes (eso es go/objeto.go vía
/api/objeto; acá cero duplicación, solo cobertura):

  · campos:  todo campo declarado (`nodos.*.campos` + subesquemas) usado ≥1 vez (no-vacío).
  · enums:   todo valor de todo enum observado ≥1 vez (match exacto de escalar, field-agnostic
             — cubre también los enums citados en formas informales `item:`/`forma:`).
  · aristas: todo `relaciones[].dueño` ejercido (paths con alias weak-entity y compuestos `+`;
             los dueños no-campo quedan declarados como informales, jamás se pierden en silencio).
  · verbos:  100% del catálogo verbos.yaml usado por actividades (nivel flota).
  · provenance (RN-19): ≥N fuentes distintas · `Inferido` jamás `alta` · ninguna combinación
             fuente×conf domina más de max_share.

Política y reparto de enums exclusivos: `gen_cobertura.yaml` (dato, no código — D-A2).
El reporte (`--manifiesto out.md`) = manifiesto de completitud = contrato de salida de Consultio.

Uso:
  python3 sistema/schema/gen_cobertura.py --shell ~/Proyectos/terranova [--shell ...]
      [--flota] [--area <area-id>] [--manifiesto out.md]
Exit: 0 = sin huecos contra la política · 1 = huecos · 2 = error operativo.
"""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

try:
    import yaml
except ImportError:
    print("gen_cobertura: falta PyYAML (python3 -m pip install pyyaml)")
    sys.exit(2)

RAIZ = Path(__file__).resolve().parent

# weak-entity → (entidad padre, campo lista en la instancia)
WEAK_PARENT = {
    "actividad": ("proceso", "actividades"),
    "key_result": ("objetivo", "key_results"),
    "medicion": ("kpi", "mediciones"),
    "hito": ("proyecto_mejora", "hitos"),
    "unidad": ("empresa", "unidades"),
    "entidad_legal": ("empresa", "entidades_legales"),
}
# campo de instancia → subesquema (para cobertura de sub-campos): se deriva del schema
# (`subesquema:` en el campo); WEAK_PARENT solo resuelve paths de `relaciones[].dueño`.

PROVENANCE_PROHIBIDO = {("Inferido", "alta")}


def load_yaml(path: Path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


# ---------------------------------------------------------------- contrato
@dataclass
class Contrato:
    campos: dict            # "entidad.campo" | "entidad.sub.campo" → spec dict
    subesquema_de: dict     # "entidad.campo" → nombre de subesquema (si tiene)
    enums: dict             # nombre → [valores]
    aristas: list           # [{dueño, partes: [(entidad, [segmentos])]}]
    aristas_informales: list
    archivos: dict          # entidad → glob relativo a empresa/


def _resolver_path(schema_nodos: dict, dueño: str):
    """'kpi.contribuye_a' · 'proceso.actividad.carril_ref+dueño_ref' · 'medicion.unidad_ref'
    → lista de (entidad, [segmentos-de-instancia]) o None si informal."""
    if any(ch in dueño for ch in " ()"):
        return None
    partes_out = []
    trozos = dueño.split("+")
    base = trozos[0].split(".")
    ent = base[0]
    segs = base[1:]
    if ent in WEAK_PARENT:  # 'medicion.unidad_ref' → kpi.mediciones.unidad_ref
        padre, campo_lista = WEAK_PARENT[ent]
        ent, segs = padre, [campo_lista] + segs
    else:
        # alias weak INTERMEDIO: 'proceso.actividad.carril_ref' → proceso.actividades.carril_ref
        segs = [WEAK_PARENT[s][1] if s in WEAK_PARENT else s for s in segs]
    if ent not in schema_nodos:
        return None
    partes_out.append((ent, segs))
    for extra in trozos[1:]:  # compuesto: el resto resuelve contra la RAÍZ de la entidad
        partes_out.append((ent, [extra]))
    return partes_out


def indexar_contrato(schema: dict) -> Contrato:
    campos, subesquema_de, archivos = {}, {}, {}
    nodos = schema.get("nodos", {})
    for ent, spec in nodos.items():
        archivos[ent] = spec.get("archivo", "")
        subes = spec.get("subesquemas") or {}
        for c, cspec in (spec.get("campos") or {}).items():
            campos[f"{ent}.{c}"] = cspec if isinstance(cspec, dict) else {}
            sub = (cspec or {}).get("subesquema") if isinstance(cspec, dict) else None
            if sub and sub in subes:
                subesquema_de[f"{ent}.{c}"] = sub
        for sub, subcampos in subes.items():
            for c, cspec in (subcampos or {}).items():
                campos[f"{ent}.{sub}.{c}"] = cspec if isinstance(cspec, dict) else {}
    aristas, informales = [], []
    for rel in schema.get("relaciones", []):
        dueño = str(rel.get("dueño"))
        partes = _resolver_path(nodos, dueño)
        if partes is None:
            informales.append(dueño)
        else:
            aristas.append({"dueño": dueño, "partes": partes})
    return Contrato(campos, subesquema_de, schema.get("enums", {}) or {},
                    aristas, informales, archivos)


# ---------------------------------------------------------------- instancias
def leer_shell(shell: Path, contrato: Contrato) -> dict:
    """→ {entidad: [dict]} desde <shell>/empresa/ según los globs `archivo:` del schema."""
    base = shell / "empresa"
    out = {}
    for ent, glob in contrato.archivos.items():
        out[ent] = []
        if not glob:
            continue
        for p in sorted(base.glob(glob)):
            try:
                data = load_yaml(p)
            except Exception as e:  # yaml roto = error operativo, no hueco
                raise RuntimeError(f"{p}: YAML inválido: {e}") from e
            if isinstance(data, dict):
                data["_archivo"] = str(p)
                out[ent].append(data)
    return out


def _no_vacio(v) -> bool:
    return v is not None and v != "" and v != [] and v != {}


def _valores_escalares(x, acc: list):
    if isinstance(x, dict):
        for k, v in x.items():
            if k == "ext":
                continue
            _valores_escalares(v, acc)
    elif isinstance(x, list):
        for v in x:
            _valores_escalares(v, acc)
    elif isinstance(x, str):
        acc.append(x)


# ---------------------------------------------------------------- cobertura
@dataclass
class Resultado:
    huecos_campos: list = field(default_factory=list)
    huecos_enums: list = field(default_factory=list)
    huecos_aristas: list = field(default_factory=list)
    huecos_verbos: list = field(default_factory=list)
    violaciones_provenance: list = field(default_factory=list)
    cubiertos_campos: int = 0
    total_campos: int = 0
    conteo_archivos: dict = field(default_factory=dict)

    @property
    def huecos(self) -> int:
        return (len(self.huecos_campos) + len(self.huecos_enums) +
                len(self.huecos_aristas) + len(self.huecos_verbos) +
                len(self.violaciones_provenance))


def cobertura(contrato: Contrato, shells: dict, exigir_solo_tipos_presentes=False,
              enums_excluidos=()) -> Resultado:
    """shells: {nombre: {entidad: [instancias]}} — agrega (modo flota si N>1)."""
    r = Resultado()
    vistos = set()
    escalares = []
    tipos_presentes = set()

    for datos in shells.values():
        for ent, insts in datos.items():
            if insts:
                tipos_presentes.add(ent)
            for inst in insts:
                _valores_escalares(inst, escalares)
                for c, v in inst.items():
                    if c in ("_archivo", "ext") or not _no_vacio(v):
                        continue
                    clave = f"{ent}.{c}"
                    vistos.add(clave)
                    sub = contrato.subesquema_de.get(clave)
                    if sub and isinstance(v, list):
                        for item in v:
                            if isinstance(item, dict):
                                for sc, sv in item.items():
                                    if _no_vacio(sv):
                                        vistos.add(f"{ent}.{sub}.{sc}")

    # campos (subesquema hereda el filtro de presencia de su entidad)
    for clave in sorted(contrato.campos):
        ent = clave.split(".")[0]
        if exigir_solo_tipos_presentes and ent not in tipos_presentes:
            continue
        r.total_campos += 1
        if clave in vistos:
            r.cubiertos_campos += 1
        else:
            r.huecos_campos.append(clave)

    # enums por observación de valores (field-agnostic); los excluidos (declarados con razón
    # en gen_cobertura.yaml) no se miden — el manifiesto los lista aparte
    valores_vistos = set(escalares)
    for enum, valores in contrato.enums.items():
        if enum in enums_excluidos:
            continue
        for v in valores or []:
            if str(v) not in valores_vistos:
                r.huecos_enums.append(f"{enum}={v}")

    # aristas: todas las partes del dueño ejercidas
    def parte_ejercida(datos, ent, segs) -> bool:
        nivel = [i for i in datos.get(ent, [])]
        for i, seg in enumerate(segs):
            ultimo = i == len(segs) - 1
            siguiente = []
            for nodo in nivel:
                if not isinstance(nodo, dict):
                    continue
                v = nodo.get(seg)
                if not _no_vacio(v):
                    continue
                if ultimo:
                    return True
                siguiente.extend(v if isinstance(v, list) else [v])
            nivel = siguiente
            if not nivel:
                return False
        return False

    for a in contrato.aristas:
        ok = all(
            any(parte_ejercida(datos, ent, segs) for datos in shells.values())
            for ent, segs in a["partes"]
        )
        if not ok:
            r.huecos_aristas.append(a["dueño"])
    return r


def verbos_sin_usar(verbos: list, actividades: list) -> list:
    usados = {a.get("verbo") for a in actividades if isinstance(a, dict)}
    return [v for v in verbos if v not in usados]


def provenance_violaciones(datos: dict, min_fuentes=4, max_share=0.70) -> list:
    """datos: {entidad: [instancias]} de UN shell. Reglas RN-19 sobre pares fuente×conf
    (raíz de entidad + mediciones embebidas)."""
    pares = Counter()

    def registrar(d):
        f, c = d.get("fuente"), d.get("conf")
        if f or c:
            pares[(f, c)] += 1

    for insts in datos.values():
        for inst in insts:
            registrar(inst)
            for m in inst.get("mediciones", []) or []:
                if isinstance(m, dict):
                    registrar(m)

    out = []
    total = sum(pares.values())
    if not total:
        return ["shell sin provenance alguna (fuente/conf ausentes en todas las entidades)"]
    fuentes = {f for (f, _c) in pares if f}
    if len(fuentes) < min_fuentes:
        out.append(f"fuentes distintas: {len(fuentes)} < {min_fuentes} (RN-19)")
    for (f, c) in pares:
        if (f, c) in PROVENANCE_PROHIBIDO:
            out.append(f"combinación prohibida: fuente=Inferido conf=alta ×{pares[(f, c)]} (RN-19)")
    dominante, n = pares.most_common(1)[0]
    if n / total > max_share:
        out.append(f"share {dominante[0]}×{dominante[1]} = {n}/{total} > {max_share:.0%} (RN-19)")
    return out


# ---------------------------------------------------------------- scope --area
def filtrar_area(datos: dict, area_id: str) -> dict:
    """Sub-universo alcanzable desde el subtree del área. Los TARGETS de cada filtro siguen el
    CONTRATO del schema (fix Audit B): brecha.against_ref → capability|proceso|sistema|objetivo ·
    idea.sobre_refs → proceso|sistema|area · roles incluyen lider_ref y RACI · sistemas incluyen
    los de actividad y tercero_ref."""
    areas = {a.get("id"): a for a in datos.get("area", [])}
    subtree = set()

    def desciende(aid):
        subtree.add(aid)
        for a in areas.values():
            if a.get("parent_ref") == aid and a.get("id") not in subtree:
                desciende(a.get("id"))

    desciende(area_id)
    procesos = [p for p in datos.get("proceso", [])
                if set(p.get("areas_ref") or []) & subtree]
    pids = {p.get("id") for p in procesos}
    acts = [a for p in procesos for a in p.get("actividades") or [] if isinstance(a, dict)]
    kpis = [k for k in datos.get("kpi", [])
            if k.get("proceso_ref") in pids or k.get("dueño_ref") in subtree]
    kids = {k.get("id") for k in kpis}
    roles_ref = {p.get("dueño_ref") for p in procesos} | {a.get("carril_ref") for a in acts}
    for a in acts:
        raci = a.get("raci") or {}
        roles_ref.add(raci.get("A"))
        for letra in ("R", "C", "I"):
            roles_ref |= set(raci.get(letra) or [])
    roles_ref |= {areas[aid].get("lider_ref") for aid in subtree if aid in areas}
    roles_ref.discard(None)
    roles = [x for x in datos.get("rol", []) if x.get("id") in roles_ref]
    rids = {x.get("id") for x in roles}
    personas = [pe for pe in datos.get("persona", [])
                if {(x or {}).get("rol") for x in pe.get("roles") or []
                    if isinstance(x, dict)} & rids]
    sistemas_ref = {s for p in procesos for s in p.get("sistemas_ref") or []}
    sistemas_ref |= {s for a in acts for s in a.get("sistemas_ref") or []}
    sistemas_ref |= {pe.get("tercero_ref") for pe in personas}
    sistemas = [s for s in datos.get("sistema", []) if s.get("id") in sistemas_ref]
    sids = {s.get("id") for s in sistemas}
    objetivos = [o for o in datos.get("objetivo", [])
                 if any((kr or {}).get("kpi_ref") in kids
                        for kr in o.get("key_results") or [] if isinstance(kr, dict))]
    oids = {o.get("id") for o in objetivos}
    krs = {kr.get("id") for o in objetivos for kr in o.get("key_results") or []
           if isinstance(kr, dict)}
    caps_ref = {c for p in procesos for c in p.get("realiza_capabilities") or []}
    caps = [c for c in datos.get("capability", []) if c.get("id") in caps_ref]
    cids = {c.get("id") for c in caps}

    def refs_de(x, campo):
        v = x.get(campo) or []
        out = set()
        for item in v if isinstance(v, list) else [v]:
            out.add(item.get("ref") if isinstance(item, dict) else item)
        return out

    proyectos = [pm for pm in datos.get("proyecto_mejora", [])
                 if refs_de(pm, "mueve_refs") & (kids | krs)]
    pmids = {pm.get("id") for pm in proyectos}
    brechas = [b for b in datos.get("brecha", [])
               if b.get("against_ref") in (pids | cids | sids | oids)]
    ideas = [i for i in datos.get("idea", [])
             if i.get("promovida_a_ref") in pmids
             or set(i.get("sobre_refs") or []) & (pids | sids | subtree)]
    return {
        "empresa": datos.get("empresa", []),
        "area": [a for a in datos.get("area", []) if a.get("id") in subtree],
        "proceso": procesos, "kpi": kpis, "rol": roles, "persona": personas,
        "objetivo": objetivos, "proyecto_mejora": proyectos, "brecha": brechas,
        "idea": ideas, "sistema": sistemas, "capability": caps,
    }


# ---------------------------------------------------------------- reparto / política
def check_reparto(config: dict, por_shell: dict) -> list:
    """Enums exclusivos: cada valor debe aparecer en el shell DECLARADO (gen_cobertura.yaml)."""
    fallas = []
    for enum, asignacion in (config.get("reparto_enums") or {}).items():
        for valor, shell in asignacion.items():
            datos = por_shell.get(shell)
            if datos is None:
                fallas.append(f"reparto {enum}={valor}: shell `{shell}` no está en la corrida")
                continue
            acc = []
            for insts in datos.values():
                for inst in insts:
                    _valores_escalares(inst, acc)
            if str(valor) not in set(acc):
                fallas.append(f"reparto {enum}={valor}: no aparece en `{shell}` (declarado ahí)")
    return fallas


# ---------------------------------------------------------------- main
def manifiesto_md(args, contrato, r_flota, por_shell, fallas_reparto, prov_por_shell) -> str:
    li = ["# Manifiesto de cobertura — flota golden fixture",
          "",
          "> GENERADO por `sistema/schema/gen_cobertura.py` — contrato de salida de Consultio",
          "> (operar-metodo debe poder producir un objeto de esta completitud con datos reales).",
          ""]
    li.append(f"- Shells: {', '.join(por_shell)}")
    li.append(f"- Campos del contrato: {r_flota.cubiertos_campos}/{r_flota.total_campos} cubiertos")
    li.append(f"- Aristas medibles: {len(contrato.aristas)} · informales declaradas: "
              f"{len(contrato.aristas_informales)} ({', '.join(contrato.aristas_informales)})")
    excl = (load_yaml(RAIZ / "gen_cobertura.yaml") or {}).get("enums_excluidos") or {}
    if excl:
        li.append("- Enums excluidos estructurales (con razón declarada): " +
                  " · ".join(f"`{k}` ({v})" for k, v in excl.items()))
    # enums con el MISMO conjunto de valores son indistinguibles para el matcher field-agnostic
    # (Audit B): cubrir uno cubre el otro — se declara para que nadie lea cobertura de más
    grupos: dict = {}
    for enum, valores in contrato.enums.items():
        grupos.setdefault(frozenset(map(str, valores or [])), []).append(enum)
    gemelos = [g for g in grupos.values() if len(g) > 1]
    if gemelos:
        li.append("- ⚠ Enums con conjunto de valores idéntico (indistinguibles para el medidor "
                  "field-agnostic): " + " · ".join("{" + ", ".join(sorted(g)) + "}" for g in gemelos))
    for nombre, datos in por_shell.items():
        n = sum(len(v) for v in datos.values())
        li.append(f"- `{nombre}`: {n} instancias · provenance: "
                  f"{'OK' if not prov_por_shell[nombre] else '; '.join(prov_por_shell[nombre])}")
    for titulo, items in [("Huecos de campos", r_flota.huecos_campos),
                          ("Huecos de enums", r_flota.huecos_enums),
                          ("Huecos de aristas", r_flota.huecos_aristas),
                          ("Verbos sin usar", r_flota.huecos_verbos),
                          ("Fallas de reparto", fallas_reparto)]:
        li.append("")
        li.append(f"## {titulo} ({len(items)})")
        li.extend(f"- {x}" for x in items) if items else li.append("- ninguno ✅")
    li.append("")
    return "\n".join(li)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--shell", action="append", default=[], help="path a un shell (repetible)")
    ap.add_argument("--flota", action="store_true", help="política flota (100% todo)")
    ap.add_argument("--area", help="scope al subtree de un área (hito Finanzas)")
    ap.add_argument("--manifiesto", help="escribe el reporte md acá")
    ap.add_argument("--dimensiones", help="coma-separadas ∈ {campos,aristas,enums,verbos,provenance}"
                    " — restringe qué huecos cuentan para el exit (política per-shell RN-17:"
                    " el gate golden de terranova solo = `--dimensiones campos,aristas`)")
    args = ap.parse_args(argv)
    if not args.shell:
        ap.error("--shell requerido")
    DIMS = {"campos", "aristas", "enums", "verbos", "provenance"}
    dims = set(args.dimensiones.split(",")) if args.dimensiones else set(DIMS)
    if not dims <= DIMS:
        ap.error(f"--dimensiones inválidas: {sorted(dims - DIMS)}")

    schema = load_yaml(RAIZ / "objeto.schema.yaml")
    contrato = indexar_contrato(schema)
    config = {}
    cfg_path = RAIZ / "gen_cobertura.yaml"
    if cfg_path.exists():
        config = load_yaml(cfg_path) or {}

    por_shell, prov_por_shell = {}, {}
    for s in args.shell:
        p = Path(s).expanduser()
        nombre = p.name
        if not (p / "empresa").is_dir():
            print(f"gen_cobertura: shell inexistente o sin empresa/: {p} (error operativo)")
            return 2
        if nombre in por_shell:
            print(f"gen_cobertura: dos shells con el mismo basename `{nombre}` (colisión)")
            return 2
        try:
            datos = leer_shell(p, contrato)
        except RuntimeError as e:
            print(f"gen_cobertura: {e}")
            return 2
        if args.area:
            datos = filtrar_area(datos, args.area)
        por_shell[nombre] = datos
        prov = config.get("provenance") or {}
        prov_por_shell[nombre] = provenance_violaciones(
            datos, min_fuentes=prov.get("min_fuentes", 4),
            max_share=prov.get("max_share", 0.70)) if not args.area else []

    excluidos = config.get("enums_excluidos") or {}
    r = cobertura(contrato, por_shell, exigir_solo_tipos_presentes=bool(args.area),
                  enums_excluidos=set(excluidos))

    # verbos (solo flota — el catálogo se cubre entre los 3 shells)
    if args.flota:
        verbos = [v.get("verbo") for v in (load_yaml(RAIZ / "verbos.yaml") or {}).get("verbos", [])]
        actividades = [a for datos in por_shell.values() for pr in datos.get("proceso", [])
                       for a in pr.get("actividades") or [] if isinstance(a, dict)]
        r.huecos_verbos = verbos_sin_usar(verbos, actividades)
    # provenance (RN-19) es regla PER-SHELL — cuenta también en corrida single-shell (fix Audit B)
    for viols in prov_por_shell.values():
        r.violaciones_provenance.extend(viols)

    fallas_reparto = check_reparto(config, por_shell) if args.flota else []

    # política por dimensiones (RN-17): lo no seleccionado no cuenta para el exit
    if "campos" not in dims:
        r.huecos_campos = []
    if "aristas" not in dims:
        r.huecos_aristas = []
    if "enums" not in dims:
        r.huecos_enums, fallas_reparto = [], []
    if "verbos" not in dims:
        r.huecos_verbos = []
    if "provenance" not in dims:
        r.violaciones_provenance = []

    total_huecos = r.huecos + len(fallas_reparto)
    modo = "flota" if args.flota else ("área " + args.area if args.area else "shell")
    print(f"gen_cobertura [{modo}] · campos {r.cubiertos_campos}/{r.total_campos} · "
          f"huecos: {total_huecos}")
    for etiqueta, items in [("campo", r.huecos_campos), ("enum", r.huecos_enums),
                            ("arista", r.huecos_aristas), ("verbo", r.huecos_verbos),
                            ("provenance", r.violaciones_provenance),
                            ("reparto", fallas_reparto)]:
        for x in items:
            print(f"  HUECO {etiqueta}: {x}")

    if args.manifiesto:
        Path(args.manifiesto).write_text(
            manifiesto_md(args, contrato, r, por_shell, fallas_reparto, prov_por_shell),
            encoding="utf-8")
        print(f"manifiesto → {args.manifiesto}")

    return 1 if total_huecos else 0


if __name__ == "__main__":
    sys.exit(main())
