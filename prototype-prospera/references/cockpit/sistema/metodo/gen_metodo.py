#!/usr/bin/env python3
"""gen_metodo.py — metodología-as-code: valida + regenera (CK-19 · twin CK-21).

Gemelo de `sistema/arquitectura/gen_arquitectura.py`, para el eje METODOLOGÍA:

  SSoT de datos:  methodologies.yaml (M-cards + bloque twin:) + proceso/** (Definición)
                  + nichos/*.yaml (eje vertical; contrato propio nicho.schema.yaml)
  Contrato:       methodology.schema.yaml (v3: ciclo de vida estado/superseded_by)
  Vistas generadas:
    · METODOLOGIA.md §4  — bloques  <!-- GEN:indice --> / GEN:cards / GEN:tabla
    · NOTACIONES.html    — mapa de decisión del twin (dimensión → estándar → rol →
      cuándo sí / cuándo no / proyecciones) + triage + descartados. Self-contained
      (CSS inline, sin CDNs), patrón de arquitectura.html. CK-21 · WS5.
    · GRAFO.md           — índice-grafo de acceso (el mapa del cerebro): 1 línea por
      card/paso/unidad-nicho + grafo inverso (dónde se operacionaliza cada card) +
      backbone + recetas grep. Entrada canónica del skill `metodo` (2026-07-22).

Qué hace en cada corrida:
  1. Valida methodologies.yaml contra el schema (campos, enums, refs combina_con,
     bloque twin: — rol_ancla, dimensiones ⊆ enum, dimensiones==[] ⇔ fuera-del-twin,
     ciclo de vida: estado/superseded_by/razon_estado coherentes).
  2. Valida el árbol proceso/ (frontmatter required, id==ruta, refs de módulo/etapa,
     tokens M\\d+ de `metodologia:` resuelven al catálogo; WARN si citan superseded).
  3. Valida nichos/*.yaml contra nicho.schema.yaml (required + enums + derivado_ref
     si observado-en-cliente + combina_con[].m resuelve + agrega[] + _meta.total).
  4. Coherencia del grafo: WARN arista vigente→superseded/descartada · INFO asimetrías.
  5. Renderiza los 3 bloques GEN de METODOLOGIA.md + NOTACIONES.html + GRAFO.md.
  6. Si algo no valida → imprime `ERR …`, sale 1 (no escribe nada).
  7. `--check`: compara los renders vs disco; si difiere imprime `DRIFT …`, sale 1. No escribe.
  8. Normal: escribe METODOLOGIA.md (bloques GEN) + NOTACIONES.html + GRAFO.md + imprime `OK`.

Única dependencia no-stdlib: pyyaml.  Wired al gate: `.githooks/pre-commit` (CK-19).
"""
from __future__ import annotations

import html as html_mod
import re
import sys
from pathlib import Path

import yaml

BASE = Path(__file__).resolve().parent          # sistema/metodo/
MET_YAML = BASE / "methodologies.yaml"
MET_MD = BASE / "METODOLOGIA.md"
NOTACIONES_HTML = BASE / "NOTACIONES.html"
GRAFO_MD = BASE / "GRAFO.md"
SCHEMA_YAML = BASE / "methodology.schema.yaml"
PROCESO = BASE / "proceso"
NICHOS = BASE / "nichos"
NICHO_SCHEMA = NICHOS / "nicho.schema.yaml"

MID_RE = re.compile(r"^M[0-9]{2}$")
MREF_RE = re.compile(r"^M[0-9]+$")               # tokens M\d+ dentro de metodologia:[]
STEPREF_RE = re.compile(r"\bm[0-9]+\.[a-z0-9]+\.[a-z0-9]+\b")
NID_RE = re.compile(r"^N-[A-Z]{2,4}-[0-9]{2}$")  # unidad de nicho


# ─────────────────────────── carga ───────────────────────────
def load_yaml(path: Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def cards(met: dict) -> dict:
    """Las claves MNN (todo menos _meta), en orden numérico."""
    ks = [k for k in met if k != "_meta"]
    return {k: met[k] for k in sorted(ks, key=lambda k: int(k[1:]))}


# ─────────────────────── validación M-cards ───────────────────────
def validar_metodologias(met: dict, schema: dict, errors: list[str]) -> None:
    en = schema["enums"]
    req = schema["card"]["required"]
    C = cards(met)

    meta = met.get("_meta") or {}
    if meta.get("total") != len(C):
        errors.append(f"_meta.total={meta.get('total')} != {len(C)} M-cards presentes")
    for lbl in ("familias", "backbone_labels"):
        if not isinstance(meta.get(lbl), dict):
            errors.append(f"_meta.{lbl} ausente o no es dict (lo necesita el generador)")

    for mid, c in C.items():
        w = f"{mid}"
        if not MID_RE.match(mid):
            errors.append(f"{w}: id no cumple ^M[0-9]{{2}}$")
        if not isinstance(c, dict):
            errors.append(f"{w}: no es un mapa")
            continue
        for f in req:
            if f not in c:
                errors.append(f"{w}: falta campo requerido `{f}`")
        if c.get("familia") not in en["familia"]:
            errors.append(f"{w}: familia `{c.get('familia')}` ∉ {en['familia']}")
        if c.get("modo") not in en["modo"]:
            errors.append(f"{w}: modo `{c.get('modo')}` ∉ {en['modo']}")
        if c.get("objeto_primario") not in en["objeto"]:
            errors.append(f"{w}: objeto_primario `{c.get('objeto_primario')}` ∉ enums.objeto")
        for s in c.get("objetos_secundarios") or []:
            if s not in en["objeto"]:
                errors.append(f"{w}: objeto_secundario `{s}` ∉ enums.objeto")
        # eje NIVEL (CK-33) — en qué piso de la organización se usa la card
        np_ = c.get("nivel_primario")
        if np_ not in en["nivel"]:
            errors.append(f"{w}: nivel_primario `{np_}` ∉ enums.nivel {en['nivel']}")
        for s in c.get("niveles_secundarios") or []:
            if s not in en["nivel"]:
                errors.append(f"{w}: nivel_secundario `{s}` ∉ enums.nivel")
            elif s == np_:
                errors.append(f"{w}: nivel_secundario `{s}` repite nivel_primario")
        ps = c.get("principios") or []
        if not ps:
            errors.append(f"{w}: principios vacío")
        for p in ps:
            if p not in en["principio"]:
                errors.append(f"{w}: principio `{p}` ∉ enums.principio")
        fu = c.get("fuente") or {}
        for f in ("autor", "obra", "url"):
            if not fu.get(f):
                errors.append(f"{w}: fuente.{f} ausente")
        for comb in c.get("combina_con") or []:
            m = comb.get("m")
            if m not in C:
                errors.append(f"{w}: combina_con.m `{m}` no resuelve a una M-card")
            if not comb.get("como"):
                errors.append(f"{w}: combina_con[{m}] sin `como`")
        donde = c.get("donde") or {}
        for mod in donde.get("modulos") or []:
            if mod not in en["modulo"]:
                errors.append(f"{w}: donde.modulos `{mod}` ∉ enums.modulo")
        nc = c.get("nombre_corto")
        if nc is not None and not isinstance(nc, str):
            errors.append(f"{w}: nombre_corto no es str")
        # ciclo de vida del conocimiento (schema v3): vigente (default) / superseded / descartada
        est = c.get("estado", "vigente")
        if est not in en.get("estado_card", ["vigente", "superseded", "descartada"]):
            errors.append(f"{w}: estado `{est}` ∉ enums.estado_card")
        sb = c.get("superseded_by")
        if est == "superseded":
            if not sb:
                errors.append(f"{w}: estado superseded exige superseded_by")
            elif sb == mid:
                errors.append(f"{w}: superseded_by no puede apuntar a sí misma")
            elif sb not in C:
                errors.append(f"{w}: superseded_by `{sb}` no resuelve a una M-card")
        elif sb is not None:
            errors.append(f"{w}: superseded_by presente pero estado != superseded")
        if est in ("superseded", "descartada") and not c.get("razon_estado"):
            errors.append(f"{w}: estado {est} exige razon_estado (el porqué, defendible)")
        validar_twin(mid, c, schema, errors)


def validar_twin(mid: str, c: dict, schema: dict, errors: list[str]) -> None:
    """Bloque twin: (CK-21 · WS5) — rol del estándar en el Organization Twin."""
    en = schema["enums"]
    tw = c.get("twin")
    if not isinstance(tw, dict):
        errors.append(f"{mid}: falta bloque `twin:` (o no es un mapa)")
        return
    for f in schema["twin"]["required"]:
        if f not in tw:
            errors.append(f"{mid}: twin — falta campo requerido `{f}`")
    rol = tw.get("rol_ancla")
    if rol not in en["rol_ancla"]:
        errors.append(f"{mid}: twin.rol_ancla `{rol}` ∉ enums.rol_ancla")
    if not isinstance(tw.get("proyecciones"), list):
        errors.append(f"{mid}: twin.proyecciones no es lista")
    dims = tw.get("dimensiones")
    if not isinstance(dims, list):
        errors.append(f"{mid}: twin.dimensiones no es lista")
    else:
        for d in dims:
            if d not in en["dimension"]:
                errors.append(f"{mid}: twin.dimensiones `{d}` ∉ enums.dimension")
        if rol == "fuera-del-twin" and dims:
            errors.append(f"{mid}: twin — rol fuera-del-twin exige dimensiones: []")
        if rol != "fuera-del-twin" and rol in en["rol_ancla"] and not dims:
            errors.append(f"{mid}: twin — dimensiones vacías solo se permiten con rol fuera-del-twin")
    for f in ("cuando_si", "cuando_no"):
        v = tw.get(f)
        if not (isinstance(v, str) and v.strip()):
            errors.append(f"{mid}: twin.{f} ausente o vacío (obligatorio)")


# ─────────────────── coherencia del grafo (cerebro) ───────────────────
def validar_coherencia(met: dict, pasos: dict, nichos: dict, warnings: list[str]) -> list[str]:
    """El cerebro no se contradice: nada vigente apunta a conocimiento reemplazado.
    Devuelve las asimetrías combina_con (INFO, no warning — aristas dirigidas son legales)."""
    C = cards(met)
    estado = {mid: c.get("estado", "vigente") for mid, c in C.items()}

    def _succ(mid: str) -> str:
        sb = C[mid].get("superseded_by")
        return f" (sucesor: {sb})" if sb else ""

    for mid, c in C.items():
        if estado[mid] != "vigente":
            continue
        for comb in c.get("combina_con") or []:
            m = comb.get("m")
            if m in C and estado[m] != "vigente":
                warnings.append(f"{mid}: combina_con → {m} está {estado[m]}{_succ(m)} — re-cablear la arista")

    for pid, fm in pasos.items():
        for tok in fm.get("metodologia") or []:
            t = str(tok)
            if t in C and estado[t] != "vigente":
                warnings.append(f"{pid}: metodologia cita {t} ({estado[t]}){_succ(t)} — actualizar el paso")

    for vert, units in nichos.items():
        for nid, u in units.items():
            for comb in u.get("combina_con") or []:
                m = comb.get("m")
                if m in C and estado.get(m, "vigente") != "vigente":
                    warnings.append(f"{vert}:{nid}: combina_con → {m} está {estado[m]}{_succ(m)}")

    asym = []
    for mid, c in C.items():
        for comb in c.get("combina_con") or []:
            m = comb.get("m")
            if m in C and mid not in {x.get("m") for x in (C[m].get("combina_con") or [])}:
                asym.append(f"{mid}→{m}")
    return asym


# ─────────────────────── validación nichos/ ───────────────────────
def validar_nichos(met: dict, errors: list[str], warnings: list[str]) -> dict:
    """nichos/*.yaml contra nicho.schema.yaml (eje vertical del cerebro).
    Devuelve {vertical: {N-XXX-NN: unidad}} para GRAFO.md."""
    out: dict[str, dict] = {}
    if not NICHOS.is_dir() or not NICHO_SCHEMA.exists():
        warnings.append("nichos/ o nicho.schema.yaml ausente — se omite la validación vertical")
        return out
    ns = load_yaml(NICHO_SCHEMA)
    en = ns["enums"]
    req = [k for k, v in (ns.get("campos") or {}).items() if isinstance(v, dict) and v.get("requerido")]
    mid_keys = set(cards(met))

    for nfile in sorted(NICHOS.glob("*.yaml")):
        if nfile.name == "nicho.schema.yaml":
            continue
        data = load_yaml(nfile) or {}
        meta = data.get("_meta") or {}
        units = {k: v for k, v in data.items() if k != "_meta"}
        if meta.get("total") != len(units):
            errors.append(f"{nfile.name}: _meta.total={meta.get('total')} != {len(units)} unidades")
        for nid, u in units.items():
            w = f"{nfile.name}:{nid}"
            if not NID_RE.match(nid):
                errors.append(f"{w}: id no cumple ^N-<VERT>-<NN>$")
            if not isinstance(u, dict):
                errors.append(f"{w}: no es un mapa")
                continue
            for f in req:
                if f not in u:
                    errors.append(f"{w}: falta campo requerido `{f}`")
            if u.get("nicho") not in en["nicho"]:
                errors.append(f"{w}: nicho `{u.get('nicho')}` ∉ enums.nicho")
            if u.get("tipo") not in en["tipo"]:
                errors.append(f"{w}: tipo `{u.get('tipo')}` ∉ enums.tipo")
            if u.get("derivado_de") not in en["derivado_de"]:
                errors.append(f"{w}: derivado_de `{u.get('derivado_de')}` ∉ enums.derivado_de")
            if u.get("confianza") not in en["confianza"]:
                errors.append(f"{w}: confianza `{u.get('confianza')}` ∉ enums.confianza")
            ob = u.get("objeto")
            if ob is not None and ob not in en["objeto"]:
                errors.append(f"{w}: objeto `{ob}` ∉ enums.objeto")
            if u.get("derivado_de") == "observado-en-cliente" and not u.get("derivado_ref"):
                errors.append(f"{w}: derivado_de=observado-en-cliente exige derivado_ref (anti-contaminación)")
            for comb in u.get("combina_con") or []:
                if comb.get("m") not in mid_keys:
                    errors.append(f"{w}: combina_con.m `{comb.get('m')}` no resuelve a una M-card")
                if not comb.get("como"):
                    errors.append(f"{w}: combina_con[{comb.get('m')}] sin `como`")
            for ag in u.get("agrega") or []:
                if ag not in units:
                    errors.append(f"{w}: agrega `{ag}` no resuelve dentro del vertical")
        out[nfile.stem] = units
    return out


# ─────────────────────── validación proceso/ ───────────────────────
FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def frontmatter(path: Path):
    m = FM_RE.match(path.read_text(encoding="utf-8"))
    if not m:
        return None
    return yaml.safe_load(m.group(1))


def validar_proceso(met: dict, schema: dict, errors: list[str], warnings: list[str]) -> tuple[dict, dict, dict]:
    if not PROCESO.is_dir():
        warnings.append("proceso/ ausente — se omite la validación del árbol")
        return {}, {}, {}
    sp = schema["proceso"]
    mid_keys = set(cards(met))
    modulos: dict[str, dict] = {}
    etapas: dict[str, dict] = {}
    pasos: dict[str, dict] = {}

    # módulos
    for mfile in sorted(PROCESO.glob("*/_modulo.md")):
        fm = frontmatter(mfile)
        rel = mfile.parent.name
        if not fm:
            errors.append(f"{mfile}: sin frontmatter")
            continue
        for f in sp["modulo"]["required"]:
            if f not in fm:
                errors.append(f"{mfile}: falta `{f}`")
        if fm.get("id") != rel:
            errors.append(f"{mfile}: id `{fm.get('id')}` != carpeta `{rel}`")
        modulos[fm.get("id")] = fm

    # etapas
    for efile in sorted(PROCESO.glob("*/*/_etapa.md")):
        fm = frontmatter(efile)
        exp = f"{efile.parent.parent.name}.{efile.parent.name}"
        if not fm:
            errors.append(f"{efile}: sin frontmatter")
            continue
        for f in sp["etapa"]["required"]:
            if f not in fm:
                errors.append(f"{efile}: falta `{f}`")
        if fm.get("id") != exp:
            errors.append(f"{efile}: id `{fm.get('id')}` != ruta `{exp}`")
        if fm.get("modulo") not in modulos:
            errors.append(f"{efile}: modulo `{fm.get('modulo')}` no resuelve")
        etapas[fm.get("id")] = fm

    # pasos
    for pfile in sorted(PROCESO.glob("*/*/*.md")):
        if pfile.name in ("_modulo.md", "_etapa.md"):
            continue
        fm = frontmatter(pfile)
        stem = pfile.stem
        exp = f"{pfile.parent.parent.name}.{pfile.parent.name}.{stem}"
        if not fm:
            errors.append(f"{pfile}: sin frontmatter")
            continue
        for f in sp["paso"]["required"]:
            if f not in fm:
                errors.append(f"{pfile}: falta `{f}`")
        if fm.get("id") != exp:
            errors.append(f"{pfile}: id `{fm.get('id')}` != ruta `{exp}`")
        if fm.get("modulo") not in modulos:
            errors.append(f"{pfile}: modulo `{fm.get('modulo')}` no resuelve")
        if fm.get("etapa") not in etapas:
            errors.append(f"{pfile}: etapa `{fm.get('etapa')}` no resuelve")
        for tok in fm.get("metodologia") or []:
            if MREF_RE.match(str(tok)) and tok not in mid_keys:
                errors.append(f"{pfile}: metodologia `{tok}` no resuelve a una M-card")
        pasos[fm.get("id")] = fm

    # refs de desbloqueo a pasos (parcial → warning, el árbol está a medio poblar)
    for pid, fm in pasos.items():
        for ref in STEPREF_RE.findall(str(fm.get("desbloqueo") or "")):
            if ref not in pasos:
                warnings.append(f"{pid}: desbloqueo referencia paso inexistente `{ref}`")

    return modulos, etapas, pasos


# ─────────────────────── render (SSoT → §4) ───────────────────────
def short_name(c: dict) -> str:
    """Rótulo corto para índice/tabla: `nombre_corto` si existe, si no heurística."""
    nc = c.get("nombre_corto")
    if nc:
        return nc.strip()
    return c["nombre"].split(" / ")[0].split(" (")[0].strip()


def by_family(met: dict) -> dict:
    """{letra: [MNN…]} en orden de familia (A..I) y numérico dentro de cada una."""
    out: dict[str, list[str]] = {}
    for mid, c in cards(met).items():
        out.setdefault(c["familia"], []).append(mid)
    return {L: out[L] for L in sorted(out)}


def render_indice(met: dict) -> str:
    fam = met["_meta"]["familias"]
    lines = []
    for L, mids in by_family(met).items():
        links = " · ".join(f"[{short_name(met[m])}](#{m.lower()})" for m in mids)
        lines.append(f"- **{L} · {fam[L]}:** {links}")
    return "\n".join(lines)


def render_cards(met: dict) -> str:
    fam = met["_meta"]["familias"]
    obj = met["_meta"]["backbone_labels"]
    niv = met["_meta"]["nivel_labels"]
    out: list[str] = []
    for L, mids in by_family(met).items():
        out.append(f"### Familia {L} · {fam[L]}\n")
        blocks = []
        for m in mids:
            c = met[m]
            fu = c["fuente"]
            objeto = f"{c['objeto_primario']} {obj[c['objeto_primario']]}"
            sec = c.get("objetos_secundarios") or []
            if sec:
                objeto += " · sec: " + ", ".join(sec)
            nivel = niv[c["nivel_primario"]] + " (ancla)"
            nsec = c.get("niveles_secundarios") or []
            if nsec:
                nivel += " · también: " + ", ".join(niv[n] for n in nsec)
            combina = " · ".join(f"{x['m']} ({x['como']})" for x in c["combina_con"])
            blocks.append(
                f'<a id="{m.lower()}"></a>**{m} · {c["nombre"]}**\n'
                f"- **Qué:** {c['que']}\n"
                f"- **Fuente:** {fu['autor']} — {fu['obra']}. [{fu['url']}]({fu['url']})\n"
                f"- **Objeto:** {objeto}\n"
                f"- **Nivel:** {nivel}\n"
                f"- **Aporte único:** {c['aporte_unico']}\n"
                f"- **Cuándo:** {c['cuando_usar']}\n"
                f"- **Combina:** {combina}\n"
                f"- **Principios:** {', '.join(c['principios'])}"
            )
        out.append("\n\n".join(blocks))
    return "\n\n".join(out)


def render_tabla(met: dict) -> str:
    rows = [
        "| Metodología | M1 Levant. | M2 Mant. | M3 Mejora | Capa de contexto |",
        "|---|:-:|:-:|:-:|:-:|",
    ]
    for m, c in cards(met).items():
        mark = "○" if c["modo"] == "situacional" else "●"
        d = c.get("donde") or {}
        mods = d.get("modulos") or []
        cols = [mark if x in mods else "" for x in ("m1", "m2", "m3")]
        ctx = mark if d.get("capa_contexto") else ""
        label = f"{short_name(c)} ({m})"
        rows.append(f"| {label} | {cols[0]} | {cols[1]} | {cols[2]} | {ctx} |")
    return "\n".join(rows)


def replace_block(text: str, tag: str, body: str) -> str:
    pat = re.compile(rf"(<!-- GEN:{tag} -->\n).*?(\n<!-- /GEN:{tag} -->)", re.DOTALL)
    if not pat.search(text):
        raise SystemExit(f"ERR: no encontré el bloque <!-- GEN:{tag} --> en METODOLOGIA.md")
    return pat.sub(lambda _m: _m.group(1) + body + _m.group(2), text)


# ─────────────── render GRAFO.md (índice-grafo del cerebro · 2026-07-22) ───────────────
# Abreviaturas del eje NIVEL para la línea compacta de §1 (CK-33). El §6 imprime el rótulo
# completo del GLOSARIO — la abreviatura vive SOLO acá dentro, nunca en texto de producto.
NIV_ABBR = {"directorio": "D", "estrategico": "E", "tactico": "T", "operativo": "O"}


def trunc(s, n: int = 110) -> str:
    s = " ".join(str(s).split())
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def render_grafo(met: dict, modulos: dict, etapas: dict, pasos: dict, nichos: dict) -> str:
    C = cards(met)
    fam = met["_meta"]["familias"]
    obj = met["_meta"]["backbone_labels"]
    estado = {mid: c.get("estado", "vigente") for mid, c in C.items()}
    orden = sorted(C, key=lambda k: int(k[1:]))

    # §1 — una línea por card, por familia
    s1: list[str] = []
    for L, mids in by_family(met).items():
        s1.append(f"### {L} · {fam[L]}")
        for m in mids:
            c = C[m]
            objs = c["objeto_primario"]
            sec = c.get("objetos_secundarios") or []
            if sec:
                objs += "+" + ",".join(sec)
            d = c.get("donde") or {}
            mods = ",".join(d.get("modulos") or []) or "—"
            if d.get("capa_contexto"):
                mods += "·ctx"
            tw = c["twin"]
            dims = tw.get("dimensiones") or []
            twl = tw["rol_ancla"] + (f"[{','.join(dims)}]" if dims else "")
            comb = ",".join(x["m"] for x in c["combina_con"]) or "—"
            # eje NIVEL (CK-33): ancla + los otros pisos donde se usa — "D" es el ancla, "+E,T" los demás
            niv = NIV_ABBR[c["nivel_primario"]]
            nsec = c.get("niveles_secundarios") or []
            if nsec:
                niv += "+" + ",".join(NIV_ABBR[n] for n in nsec)
            mark = ""
            if estado[m] == "superseded":
                mark = f" ⛔SUPERSEDED→{c.get('superseded_by')}"
            elif estado[m] == "descartada":
                mark = " 🗑DESCARTADA"
            s1.append(f"- **{m}** {c['nombre']}{mark} · {objs} · niv:{niv} · {c['modo']}·{mods} · {twl} · ⇄{comb} · usar: {trunc(c['cuando_usar'])}")
        s1.append("")

    # §2 — grafo inverso: dónde se operacionaliza cada card
    uso: dict[str, dict[str, list[str]]] = {m: {"pasos": [], "nichos": []} for m in C}
    for pid in sorted(pasos):
        for tok in pasos[pid].get("metodologia") or []:
            t = str(tok)
            if t in C:
                uso[t]["pasos"].append(pid)
    for vert in sorted(nichos):
        for nid in sorted(nichos[vert]):
            for comb in nichos[vert][nid].get("combina_con") or []:
                m = comb.get("m")
                if m in C:
                    uso[m]["nichos"].append(nid)
    s2: list[str] = []
    sin_uso: list[str] = []
    for m in orden:
        p, n = uso[m]["pasos"], uso[m]["nichos"]
        if p or n:
            parts = []
            if p:
                parts.append("pasos: " + ", ".join(p))
            if n:
                parts.append("nichos: " + ", ".join(n))
            s2.append(f"- {m} ({short_name(C[m])}) ← " + " · ".join(parts))
        elif estado[m] == "vigente":
            sin_uso.append(m)
    if sin_uso:
        s2.append("")
        s2.append(f"Sin operacionalizar aún ({len(sin_uso)} — ningún paso/nicho las cita; brecha esperable con proceso/ a medio poblar, BL-05): "
                  + ", ".join(sin_uso))

    # §3 — pasos poblados + etapas stub
    s3: list[str] = []
    for pid in sorted(pasos):
        fm = pasos[pid]
        act = fm.get("actor")
        actor = (act.get("rol") or act.get("quien") or "—") if isinstance(act, dict) else str(act or "—")
        g = fm.get("gate")
        gate = (g.get("tipo") if isinstance(g, dict) else g) or "—"
        mets = ", ".join(str(t) for t in fm.get("metodologia") or []) or "—"
        s3.append(f"- `{pid}` · {fm.get('titulo_interno')} · actor:{actor} · gate:{gate} · met: {mets}")
    con_pasos = {fm.get("etapa") for fm in pasos.values()}
    stubs = sorted(e for e in etapas if e not in con_pasos)
    if stubs:
        s3.append("")
        s3.append(f"Etapas SIN pasos ({len(stubs)} stubs — historia `sistema/poblar-metodo-m1-m3`): " + ", ".join(stubs))

    # §4 — nichos (eje vertical)
    s4: list[str] = []
    total_unidades = 0
    for vert in sorted(nichos):
        units = nichos[vert]
        total_unidades += len(units)
        s4.append(f"### {vert} ({len(units)})")
        for nid in sorted(units):
            u = units[nid]
            comb = ",".join(str(x.get("m")) for x in u.get("combina_con") or [])
            extra = f" · ⇄{comb}" if comb else ""
            s4.append(f"- {nid} · {u.get('nombre')} · {u.get('tipo')} · {u.get('objeto', '—')} · conf:{u.get('confianza')}/{u.get('derivado_de')}{extra}")
        s4.append("")

    # §5 — backbone: objeto → cards primarias
    s5 = [f"- **{code}** {label}: " + (", ".join(m for m in orden if C[m]['objeto_primario'] == code) or "—")
          for code, label in obj.items()]

    # §6 — eje NIVEL (CK-33): en qué piso de la organización se usa cada card.
    # Dos listas por piso: ANCLA (se decide/firma ahí) y también-se-usa (bajada/consumo).
    niv_labels = met["_meta"]["nivel_labels"]
    s6: list[str] = []
    for code, label in niv_labels.items():
        ancla = [m for m in orden if C[m]["nivel_primario"] == code]
        tambien = [m for m in orden if code in (C[m].get("niveles_secundarios") or [])]
        s6.append(f"### {label}")
        s6.append(f"- **ancla** ({len(ancla)}): " + (", ".join(f"{m} {short_name(C[m])}" for m in ancla) or "—"))
        s6.append(f"- también se usa ({len(tambien)}): " + (", ".join(tambien) or "—"))
        s6.append("")

    return f"""<!-- GENERADO por sistema/metodo/gen_metodo.py desde methodologies.yaml + proceso/** + nichos/*.yaml — NO editar a mano. Gate anti-drift en pre-commit. -->
# GRAFO — índice-grafo del cerebro metodológico (GENERADO)

Mapa de acceso de bajo costo al método del producto. Protocolo (skill `metodo`):
**(1)** leé este archivo (es el mapa completo, ~{3 + len(orden) + len(pasos) + total_unidades} líneas de datos) →
**(2)** elegí los nodos por `usar:`/objeto/twin → **(3)** cargá SOLO esos nodos con grep+Read dirigido.
Jamás cargues `methodologies.yaml` o `METODOLOGIA.md` enteros.

Recetas (desde la raíz del repo):
- Card completa (~24 líneas): `grep -n "^M30:" sistema/metodo/methodologies.yaml` → `Read offset=<línea> limit=26`
- Paso completo: ruta = id con puntos→carpetas: `m1.b1.p1` → `sistema/metodo/proceso/m1/b1/p1.md`
- Unidad de nicho (~12 líneas): `grep -n "^N-RET-05:" sistema/metodo/nichos/retail.yaml` → `Read offset limit=14`
- Dónde se usa una card: §2 de este archivo (ya resuelto — no grepear a mano)
- Narrativas largas (solo si hace falta prosa): `M1-LEVANTAMIENTO.md` · `M3-ESPINAZO.md` · `PROCESS-AS-DATA.md`
- Agregar/reemplazar conocimiento: skill `metodo-aprende` (protocolo anti-contradicción)

Totales: **{len(orden)} M-cards** (_meta.total) · **{len(pasos)} pasos** poblados / **{len(stubs)} etapas stub** · **{total_unidades} unidades** de nicho en **{len(nichos)} verticales**.
Leyenda card: `Mnn nombre · objeto(+sec) · niv:ancla(+otros pisos) · modo·módulos · rol_twin[dimensiones] · ⇄combina_con · usar:`
`niv:` = eje nivel (§6) — **D**irectorio · **E**stratégico · **T**áctico · **O**perativo; el primero es el ancla.

## §1 M-cards por familia

{chr(10).join(s1).rstrip()}

## §2 Grafo inverso — dónde se operacionaliza cada card

{chr(10).join(s2)}

## §3 Proceso (Definición) — pasos poblados

{chr(10).join(s3)}

## §4 Nichos (eje vertical)

{chr(10).join(s4).rstrip()}

## §5 Backbone — objeto → cards primarias

{chr(10).join(s5)}

## §6 Nivel — en qué piso de la organización se usa cada card

Eje ORTOGONAL al objeto (§5 = QUÉ toca) y al módulo (§3 = CUÁNDO del engagement). Acá: DÓNDE se usa.
`ancla` = el piso donde se DECIDE o SE FIRMA lo que la card produce · `también se usa` = los pisos que
la consumen (bajada de la cascada, insumo, ejecución). Ruteo: primero filtrá por el piso de la
pregunta, después leé la card. La escalera baja 1→4.

{chr(10).join(s6).rstrip()}

---
SSoT: `methodologies.yaml` · `proceso/**` · `nichos/*.yaml` · contratos: `methodology.schema.yaml` (v4, eje nivel) + `nichos/nicho.schema.yaml`.
Gate: `python3 sistema/metodo/gen_metodo.py --check` (pre-commit). Este archivo se REGENERA, no se edita.
"""


# ─────────────── render NOTACIONES.html (twin · CK-21 WS5) ───────────────
ROL_LABEL = {
    "metamodelo-propio": "metamodelo propio",
    "ancla": "ancla",
    "proyeccion": "proyección",
    "intercambio": "intercambio",
    "horizonte": "horizonte",
    "descartada": "descartada",
    "fuera-del-twin": "fuera del twin",
}

ROL_DEF = [
    ("metamodelo-propio", "el diferenciador: objeto.schema.yaml as-code en git (12 entidades — schema v2 CK-26, doctrina Palantir), extensible por cliente sin fork"),
    ("ancla", "ancla semántica: el estándar presta ontología/taxonomía y se embebe como DATO (archimate:, met:, enums) — no hay diagrama fuente"),
    ("proyeccion", "proyección: la notación RENDERIZA el dato (swimlane, organigrama, strategy-map, heatmap) — se genera con .py, jamás se edita a mano"),
    ("intercambio", "intercambio: formato estándar para importar/exportar contra herramientas del cliente (BPMN XML, ArchiMate exchange) — V2, declarado para no cerrar la puerta"),
    ("horizonte", "horizonte: estándar reservado para una fase futura ya decidida (gateado D9)"),
    ("descartada", "descartada: lo que conscientemente NO adoptamos (con porqué — ver sección final)"),
    ("fuera-del-twin", "fuera del twin: método del ENGAGEMENT — cómo trabajamos nosotros, no dimensión del twin del cliente"),
]

CSS = """
  :root{--bg:#0e1116;--panel:#161b22;--panel2:#1b212b;--line:#2b3340;--ink:#e6edf3;--dim:#8b949e;
    --ancla:#3fb950;--propio:#a371f7;--horizonte:#d29922;--fuera:#6e7681;--proy:#58a6ff;
    --desc:#f85149;--inter:#39c5cf}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:13.5px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding-bottom:60px}
  header{padding:20px 26px;border-bottom:1px solid var(--line)}
  h1{margin:0 0 6px;font-size:20px}
  .sub{color:var(--dim);font-size:12.5px;max-width:1050px}
  .cardinal{max-width:1050px;margin:14px 26px;padding:13px 16px;background:var(--panel);border:1px solid var(--propio);border-left:4px solid var(--propio);border-radius:8px;font-size:14px;font-weight:600}
  .cardinal small{display:block;font-weight:400;color:var(--dim);margin-top:5px;font-size:12px}
  .legend{display:flex;gap:8px 18px;flex-wrap:wrap;padding:10px 26px;font-size:11.5px;color:var(--dim);border-bottom:1px solid var(--line)}
  .legend .k{display:inline-flex;align-items:baseline;gap:6px;max-width:480px}
  h2.sec{font-size:15px;margin:28px 26px 4px;border-top:1px solid var(--line);padding-top:18px}
  p.secsub{margin:0 26px 12px;color:var(--dim);font-size:12px;max-width:1050px}
  .wrap{margin:0 26px}
  table.mx{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px}
  table.mx th,table.mx td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}
  table.mx th{background:var(--panel);color:var(--dim);font-weight:600}
  td.dim{background:var(--panel2);font-weight:700;font-size:12.5px;min-width:150px}
  .std{font-weight:600}
  .mid{color:var(--dim);font-weight:400;font-size:11px}
  .bdg{display:inline-block;font-size:10px;padding:1px 7px;border-radius:10px;margin:1px 4px 1px 0;white-space:nowrap}
  .bdg.metamodelo-propio{background:rgba(163,113,247,.16);color:var(--propio)}
  .bdg.ancla{background:rgba(63,185,80,.15);color:var(--ancla)}
  .bdg.proyeccion,.bdg.proy{background:rgba(88,166,255,.15);color:var(--proy)}
  .bdg.intercambio{background:rgba(57,197,207,.15);color:var(--inter)}
  .bdg.horizonte{background:rgba(210,153,34,.16);color:var(--horizonte)}
  .bdg.descartada{background:rgba(248,81,73,.15);color:var(--desc)}
  .bdg.fuera-del-twin{background:rgba(110,118,129,.2);color:var(--fuera)}
  .si{color:var(--ancla)}
  .no{color:var(--desc)}
  ol.triage{max-width:1050px;margin:8px 26px;padding-left:24px}
  ol.triage>li{margin-bottom:10px}
  .paso{font-weight:700}
  .why{max-width:1050px;margin:10px 26px;padding:11px 14px;background:var(--panel);border:1px solid var(--line);border-radius:8px;font-size:12.5px}
  .why b{color:var(--desc)}
  ul.desc{max-width:1050px;margin:8px 26px;padding-left:22px;font-size:12.5px}
  ul.desc li{margin-bottom:7px}
  code{background:#0c0f14;padding:1px 5px;border-radius:4px;font-size:11px;color:#c9d4e0}
  .verd{display:inline-block;font-size:11px;padding:2px 8px;border-radius:10px;border:1px solid var(--line);margin:2px 4px 2px 0;background:var(--panel)}
  footer{margin:34px 26px 0;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px}
"""


def esc(s: str) -> str:
    return html_mod.escape(str(s), quote=False)


def render_notaciones(met: dict, schema: dict) -> str:
    C = cards(met)
    dims: list[str] = schema["enums"]["dimension"]
    labels: dict[str, str] = schema["twin"]["dimension_labels"]

    # matriz por dimensión
    mx_rows: list[str] = []
    for d in dims:
        hits = [(mid, c) for mid, c in C.items() if d in (c["twin"].get("dimensiones") or [])]
        if not hits:
            continue
        first = True
        for mid, c in hits:
            tw = c["twin"]
            rol = tw["rol_ancla"]
            proys = "".join(f'<span class="bdg proy">▤ {esc(p)}</span>' for p in tw.get("proyecciones") or [])
            dim_cell = (
                f'<td class="dim" rowspan="{len(hits)}">{esc(labels.get(d, d))}</td>' if first else ""
            )
            first = False
            mx_rows.append(
                "<tr>"
                + dim_cell
                + f'<td><span class="std">{esc(short_name(c))}</span> <span class="mid">({mid} · {esc(c["nombre"])})</span></td>'
                + f'<td><span class="bdg {rol}">{esc(ROL_LABEL[rol])}</span>{proys}</td>'
                + f'<td class="si">✓ {esc(tw["cuando_si"])}</td>'
                + f'<td class="no">✗ {esc(tw["cuando_no"])}</td>'
                + "</tr>"
            )
    matriz = (
        '<table class="mx"><tr><th>Dimensión del twin</th><th>Estándar</th>'
        "<th>Rol · proyecciones</th><th>Cuándo sí</th><th>Cuándo no / límite</th></tr>\n"
        + "\n".join(mx_rows)
        + "</table>"
    )

    # leyenda de roles
    legend = "".join(
        f'<span class="k"><span class="bdg {r}">{esc(ROL_LABEL[r])}</span><span>{esc(txt)}</span></span>'
        for r, txt in ROL_DEF
    )

    # fuera del twin
    fuera_rows = "".join(
        f'<tr><td><span class="std">{esc(short_name(c))}</span> <span class="mid">({mid})</span></td>'
        f'<td class="no">{esc(c["twin"]["cuando_no"])}</td></tr>'
        for mid, c in C.items()
        if c["twin"]["rol_ancla"] == "fuera-del-twin"
    )
    fuera = (
        '<table class="mx"><tr><th>Metodología (nuestro engagement)</th><th>Por qué está fuera del twin</th></tr>'
        + fuera_rows
        + "</table>"
    )

    verdictos = "".join(
        f'<span class="verd">{v}</span>'
        for v in ("eliminable", "automatizable-RPA", "automatizable-agente", "aumentable (humano+arnés)", "humano-por-diseño")
    )

    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Notaciones del twin — Cockpit (CK-21)</title>
<!-- GENERADO por sistema/metodo/gen_metodo.py desde methodologies.yaml (bloques twin:) — NO editar a mano (CK-21 · WS5). -->
<style>{CSS}</style>
</head>
<body>
<header>
  <h1>🧭 Notaciones y estándares del Organization Twin</h1>
  <div class="sub">Mapa de decisión: para cada dimensión del twin, qué estándar usamos, en qué rol, cuándo sí,
  cuándo no y cuándo hacemos estándar propio. Generado desde <code>methodologies.yaml</code> (bloque <code>twin:</code>
  de cada M-card) por <code>gen_metodo.py</code> · gate anti-drift en pre-commit. Catálogo completo de metodologías:
  <code>METODOLOGIA.md §4</code>.</div>
</header>

<div class="cardinal">Regla cardinal — estándares como vocabulario · schema propio como metamodelo ·
git como motor · notación = proyección generada, nunca SSoT.
<small>Un estándar juega un rol por (estándar × dimensión × plano). Una celda «ancla + proyección» son dos PLANOS
(dato / vista), no dos roles en conflicto. Excepción declarada: <code>despliegue.html</code> es vista CURADA del
Fabricante (gate de madurez CK-17), fuera del scope twin.</small></div>

<div class="legend">{legend}</div>

<h2 class="sec">Matriz — dimensión del twin → estándar</h2>
<p class="secsub">Las filas son las dimensiones canónicas del twin (enum del contrato
<code>methodology.schema.yaml</code>); cada dimensión lista los estándares que la sirven, con su rol y sus límites.</p>
<div class="wrap">{matriz}</div>

<h2 class="sec">Triage — ¿esta actividad se elimina, se automatiza (RPA o agente), se aumenta o se defiende como humana?</h2>
<p class="secsub">El flujo del triage al nivel más bajo (narrativa de actividades), con la narrativa del trabajador como
vehículo y evidencia con provenance en cada paso.</p>
<ol class="triage">
  <li><span class="paso">ECRS primero (M35) — el ORDEN:</span> Eliminar → Combinar → Reordenar → Simplificar.
      <b>No se automatiza el desperdicio.</b> VSM (M09) aporta el flujo/future-state con tiempos {{toque, espera}};
      el veredicto por actividad es de ECRS, no de VSM.</li>
  <li><span class="paso">Narrativa → verbos (M37):</span> cada actividad narra con UN verbo del vocabulario controlado
      propio (1 verbo = 1 actividad; los compuestos «revisa, aprueba y notifica» se PARTEN en el ingest). Cada verbo
      clasifica en 2 ejes: clase de tarea <b>ALM</b> (rutinaria/no-rutinaria × manual/cognitiva-analítica/interpersonal)
      × capacidad requerida <b>MGI</b> (recolectar/procesar datos · físico predecible/impredecible · interfaz-stakeholder ·
      experticia/decisión · gestión de personas). El verbo lleva provenance: el ingest propone con <code>conf</code>,
      el consultor corrige (auditado) — sin esto el score es gameable eligiendo verbos «suaves».</li>
  <li><span class="paso">Criterios → DOS scores derivados (M36):</span>
      <b>score-RPA</b> = f(datos estructurados, reglas estables, volumen, % excepciones) ·
      <b>score-agente</b> = f(dato no estructurado, criterio expresable en prompt/policy, tolerancia a revisión humana,
      riesgo de error). Ambos con <code>conf</code> propagada de la completitud de inputs — input ausente/estimado →
      conf baja VISIBLE en el heatmap; nunca un score sin su incertidumbre al lado. Se calculan, jamás se etiquetan.
      La evidencia (volumen, % excepciones) la alimenta el mining (M29, fuente Observado).</li>
  <li><span class="paso">Veredicto = ENUM, no binario:</span><br>{verdictos}<br>
      «Humano-por-diseño» ancla a <b>accountability</b> (RACI A, firma, responsabilidad legal — M25): el único criterio
      que la GenAI no erosiona. «Aumentable» es ciudadano de primera clase: ES el producto (arneses por puesto).</li>
  <li><span class="paso">Desgaste medido (M39, situacional):</span> NASA-TLX variante RTLX SOLO sobre actividades
      pre-flageadas por el triage (densidad de espera/decisión, % excepciones alto, queja espontánea) — jamás censal;
      agregado por rol/proceso bajo la frontera de métricas de persona (M40, CK-24).</li>
</ol>
<div class="why"><b>Por qué Bloom está descartada:</b> es una taxonomía de objetivos de APRENDIZAJE — pedagógica: mide
qué tan profundo se aprende algo, no qué tan automatizable es hacerlo. La reemplaza la taxonomía de verbos propia
ALM×MGI (M37).</div>
<div class="why"><b>Por qué ALM no es sentencia:</b> la clase ALM (rutinaria/cognitiva/…) es un eje DESCRIPTIVO, no un
veredicto: la GenAI automatiza justamente lo no-rutinario-cognitivo — nuestros propios arneses lo prueban. Mandan la
capacidad MGI requerida + la accountability (RACI A), vía los dos scores con su <code>conf</code>.</div>

<h2 class="sec">Fuera del twin — el método del engagement</h2>
<p class="secsub">Estas metodologías son CÓMO TRABAJAMOS NOSOTROS (discovery, apuesta, spec, service design del
engagement) — no modelan ninguna dimensión del twin del cliente. <code>dimensiones: []</code> por contrato.</p>
<div class="wrap">{fuera}</div>

<h2 class="sec">Descartados — con porqué</h2>
<ul class="desc">
  <li><b>ArchiMate como METAMODELO completo</b> — notation-first = lock-in; Ardoq y Palantir validan entidad-primero.
      Sobrevive SOLO-TIPOS como ancla de vocabulario (M13).</li>
  <li><b>BPMN como editor de diagramas fuente</b> — el proceso es DATO con provenance; el diagrama es vista generada
      (swimlane). Export XML queda declarado como intercambio V2 (M11).</li>
  <li><b>UML / C4 / CMMN / DMN</b> — sin caso hoy (ni en el corpus de research ni en demanda).</li>
  <li><b>Bloom como eje de automatizabilidad</b> — pedagógica (objetivos de aprendizaje); la reemplaza la taxonomía de
      verbos propia ALM×MGI (M37). Era candidata en el book legacy (ex-cand. M32); barrida en CK-21.</li>
  <li><b>ALM como sentencia de automatizabilidad</b> — se conserva como eje DESCRIPTIVO del verbo; el veredicto sale de
      los dos scores + accountability (ver triage).</li>
  <li><b>X-matrix ceremonial (Hoshin)</b> — el catchball sí, la ceremonia no (M26).</li>
</ul>
<p class="secsub">Nota: <b>SIPOC no está descartado ni es M-card</b> — es proyección de bordes (tabla 1-página para
validar con el dueño en M1); su dato ya está absorbido (<code>proveedor_ref</code>/<code>cliente_ref</code>, D-08/D-11).</p>

<footer>SSoT: <code>sistema/metodo/methodologies.yaml</code> (bloques <code>twin:</code>) · contrato:
<code>methodology.schema.yaml</code> · generador: <code>gen_metodo.py</code> — este archivo se REGENERA, no se edita.
Historia: <code>arquitectura-refichado-ck21</code> (WS5) · CK-21.</footer>
</body>
</html>
"""


# ─────────────────────────── main ───────────────────────────
def main(argv: list[str]) -> int:
    check = "--check" in argv
    met = load_yaml(MET_YAML)
    schema = load_yaml(SCHEMA_YAML)

    errors: list[str] = []
    warnings: list[str] = []
    validar_metodologias(met, schema, errors)
    modulos, etapas, pasos = validar_proceso(met, schema, errors, warnings)
    nichos = validar_nichos(met, errors, warnings)
    asym = validar_coherencia(met, pasos, nichos, warnings)

    if errors:
        for e in errors:
            print(f"ERR  {e}")
        return 1

    md = MET_MD.read_text(encoding="utf-8")
    new = replace_block(md, "indice", render_indice(met))
    new = replace_block(new, "cards", render_cards(met))
    new = replace_block(new, "tabla", render_tabla(met))
    notaciones = render_notaciones(met, schema)
    grafo = render_grafo(met, modulos, etapas, pasos, nichos)

    for wmsg in warnings:
        print(f"WARN {wmsg}")
    if asym:
        head = " ".join(asym[:8]) + ("…" if len(asym) > 8 else "")
        print(f"INFO aristas combina_con sin recíproca: {len(asym)} (dirigidas — legal) · {head}")

    n = len(cards(met))
    resumen = f"{n} M-cards · proceso/ válido ({len(pasos)} pasos) · nichos/ válido ({sum(len(u) for u in nichos.values())} unidades)"
    if check:
        drift = False
        if new != md:
            print("DRIFT METODOLOGIA.md §4 desincronizado de methodologies.yaml — corré gen_metodo.py")
            drift = True
        disco = NOTACIONES_HTML.read_text(encoding="utf-8") if NOTACIONES_HTML.exists() else None
        if disco != notaciones:
            print("DRIFT NOTACIONES.html desincronizado de methodologies.yaml (twin:) — corré gen_metodo.py")
            drift = True
        disco_g = GRAFO_MD.read_text(encoding="utf-8") if GRAFO_MD.exists() else None
        if disco_g != grafo:
            print("DRIFT GRAFO.md desincronizado de la SSoT (cards/proceso/nichos) — corré gen_metodo.py")
            drift = True
        if drift:
            return 1
        print(f"OK --check · {resumen} · METODOLOGIA.md §4 + NOTACIONES.html + GRAFO.md en sync")
        return 0

    MET_MD.write_text(new, encoding="utf-8")
    NOTACIONES_HTML.write_text(notaciones, encoding="utf-8")
    GRAFO_MD.write_text(grafo, encoding="utf-8")
    print(f"OK · {resumen} · METODOLOGIA.md §4 + NOTACIONES.html + GRAFO.md regenerados")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
