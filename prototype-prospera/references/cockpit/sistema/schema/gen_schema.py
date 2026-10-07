#!/usr/bin/env python3
"""gen_schema.py — gate anti-drift del objeto.schema.yaml v2 + verbos.yaml (D-A2 · historia schema-v2).

Valida (sin vista generada — solo coherencia interna del contrato):
  1. objeto.schema.yaml: version 2 · 20 nodos esperados (D-23 suma `apuesta`; D-24..D-29 el gobierno del directorio) · toda ref `enum:` resuelve en `enums:`
     (campos + subesquemas) · relaciones apuntan a entidades/weak-entities conocidas.
  2. acciones (capa kinética): entidad existe · nivel_min/aprobacion en sus enums · id verbo-objeto
     (jamás "set-…") · ≤ 10 acciones por entidad (anti Action-Sprawl).
  3. transiciones_proyecto: claves == enums.estado_proyecto EXACTO (paridad) · targets válidos ·
     loop-back MASP (en-verificacion → en-ejecucion) presente · terminales con lista vacía.
  4. verbos.yaml: clase_alm completa (rutina × tipo) · capacidad_mgi válida · canónicos únicos ·
     sinónimos únicos y sin colisionar con canónicos (gobernanza RN-11).

La paridad schema↔Go (enum/transiciones vs tablas de go/objeto.go) la verifica el test Go
(TestParidadSchema) leyendo ESTE mismo YAML — una sola fuente, dos consumidores.

Uso:  python3 sistema/schema/gen_schema.py [--check]   (idéntico: no genera nada; exit != 0 bloquea)
"""
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("gen_schema: falta PyYAML (python3 -m pip install pyyaml)")
    sys.exit(2)

RAIZ = Path(__file__).resolve().parent
ERRORES: list[str] = []

NODOS_ESPERADOS = {
    "empresa", "persona", "rol", "area", "proceso", "sistema",
    "objetivo", "kpi", "proyecto_mejora", "idea", "capability", "brecha",
    "apuesta",  # D-23 — la apuesta del directorio (O1 materializada)
    # D-24..D-29 (v18) — el gobierno del directorio: lo que el nivel 1 necesita para existir como dato
    "riesgo",           # D-24 — el registro, contraparte del apetito que M52 ya declaraba
    "sesion", "acuerdo",# D-25 — la reunión de gobierno y sus compromisos (ISO 9001 cl.9.3 + M58)
    "periodo",          # D-26 — el resultado LEÍDO del sistema contable (M55), con estado de cierre
    "proyeccion_caja",  # D-27 — liquidez: 13 semanas contra el piso y los límites del financiamiento (M56)
    "presupuesto",      # D-28 — la mezcla de ambición hecha plata (M57)
    "inversion",        # D-29 — el portafolio de capital, distinto del de mejoras (M59)
    "documento",        # D-38 (v21) — el archivo: pirámide documental + contratos/expedientes (M38); el manual/z3 generados siguen siendo proyección (D-08)
}
# weak-entities / pseudo-destinos válidos en refs y relaciones (además de los nodos)
DESTINOS_EXTRA = {"key_result", "actividad", "medicion", "unidad", "hito",
                  "cifra", "semana_caja", "resguardo", "bolsa",   # weak-entities v18 (D-26..D-28)
                  "empresa#uN", "empresa#elN", "*", "nichos (slug, I-39)",
                  "empresa#uN (local)", "empresa#elN (local)", "pr-x#aN (local)"}
CAP_ACCIONES_POR_ENTIDAD = 10
MGI = {"recolectar-datos", "procesar-datos", "fisico-predecible", "fisico-impredecible",
       "interfaz-stakeholder", "experticia-decision", "gestion-personas"}
ALM_RUTINA = {"rutinaria", "no-rutinaria"}
ALM_TIPO = {"manual", "cognitiva-analitica", "interpersonal"}


def err(msg: str) -> None:
    ERRORES.append(msg)


def destinos_de(a: str) -> list[str]:
    """'rol|area' → ['rol','area'] · 'proceso' → ['proceso']"""
    return [p.strip() for p in str(a).split("|")]


def check_enum_refs(schema: dict) -> int:
    enums = schema.get("enums", {})
    n = 0

    def walk_campos(donde: str, campos: dict) -> None:
        nonlocal n
        for nombre, spec in (campos or {}).items():
            if not isinstance(spec, dict):
                continue
            if spec.get("tipo") == "enum":
                n += 1
                ref = spec.get("enum")
                if ref not in enums:
                    err(f"{donde}.{nombre}: enum `{ref}` no existe en enums:")

    for nodo, spec in schema.get("nodos", {}).items():
        walk_campos(f"nodos.{nodo}", spec.get("campos", {}))
        for sub, subcampos in (spec.get("subesquemas") or {}).items():
            walk_campos(f"nodos.{nodo}.{sub}", subcampos)
    return n


def check_refs_a(schema: dict) -> None:
    validos = NODOS_ESPERADOS | DESTINOS_EXTRA

    def walk(donde: str, campos: dict) -> None:
        for nombre, spec in (campos or {}).items():
            if not isinstance(spec, dict) or "a" not in spec:
                continue
            for d in destinos_de(spec["a"]):
                if d not in validos:
                    err(f"{donde}.{nombre}: ref a `{d}` — destino desconocido")

    for nodo, spec in schema.get("nodos", {}).items():
        walk(f"nodos.{nodo}", spec.get("campos", {}))
        for sub, subcampos in (spec.get("subesquemas") or {}).items():
            walk(f"nodos.{nodo}.{sub}", subcampos)


def check_relaciones(schema: dict) -> int:
    validos = NODOS_ESPERADOS | DESTINOS_EXTRA
    rels = schema.get("relaciones", [])
    for i, r in enumerate(rels):
        for lado in ("de", "a"):
            for d in destinos_de(r.get(lado, "")):
                if d not in validos:
                    err(f"relaciones[{i}] ({r.get('de')}→{r.get('a')}): `{d}` desconocido")
    return len(rels)


def check_acciones(schema: dict) -> int:
    acc = schema.get("acciones")
    if not acc:
        err("falta la sección `acciones:` (capa kinética — CK-21/D6)")
        return 0
    niveles = set(acc.get("niveles", []))
    aprob = set(acc.get("aprobacion", []))
    por_entidad: dict[str, int] = {}
    catalogo = acc.get("catalogo", [])
    for a in catalogo:
        aid = a.get("id", "?")
        ent = a.get("entidad")
        if ent not in NODOS_ESPERADOS:
            err(f"accion `{aid}`: entidad `{ent}` no existe")
        else:
            por_entidad[ent] = por_entidad.get(ent, 0) + 1
        if a.get("nivel_min") not in niveles:
            err(f"accion `{aid}`: nivel_min `{a.get('nivel_min')}` ∉ {sorted(niveles)}")
        if a.get("aprobacion") not in aprob:
            err(f"accion `{aid}`: aprobacion `{a.get('aprobacion')}` ∉ {sorted(aprob)}")
        if not re.fullmatch(r"[a-záéíóúñ][a-z0-9áéíóúñ-]*", aid) or aid.startswith("set-"):
            err(f"accion `{aid}`: id inválido — verbo-objeto kebab, jamás 'set-…' (anti Action-Sprawl)")
    for ent, cnt in por_entidad.items():
        if cnt > CAP_ACCIONES_POR_ENTIDAD:
            err(f"entidad `{ent}`: {cnt} acciones > cap {CAP_ACCIONES_POR_ENTIDAD} (Action-Sprawl)")
    return len(catalogo)


def check_transiciones(schema: dict) -> int:
    estados = set(schema.get("enums", {}).get("estado_proyecto", []))
    trans = schema.get("acciones", {}).get("transiciones_proyecto", {})
    if not trans:
        err("falta acciones.transiciones_proyecto (máquina de estados — D-A7)")
        return 0
    claves = set(trans.keys())
    if claves != estados:
        err(f"paridad transiciones↔enum estado_proyecto rota: faltan {sorted(estados - claves)} · sobran {sorted(claves - estados)}")
    for de, hacia in trans.items():
        for h in hacia or []:
            if h not in estados:
                err(f"transiciones_proyecto[{de}]: destino `{h}` ∉ estado_proyecto")
    if "en-ejecucion" not in (trans.get("en-verificacion") or []):
        err("falta el loop-back MASP: en-verificacion → en-ejecucion (doctrina — research C)")
    for terminal in ("cerrado", "rechazado", "cancelado"):
        if trans.get(terminal):
            err(f"estado terminal `{terminal}` tiene salidas {trans[terminal]} — debe ser []")
    return len(trans)


def check_verbos(path: Path) -> int:
    if not path.exists():
        err("falta sistema/schema/verbos.yaml (vocabulario controlado — RN-11)")
        return 0
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    verbos = data.get("verbos", [])
    canonicos: set[str] = set()
    todos_sin: set[str] = set()
    for v in verbos:
        nombre = v.get("verbo", "?")
        if nombre in canonicos:
            err(f"verbo `{nombre}` duplicado")
        canonicos.add(nombre)
        alm = v.get("clase_alm") or {}
        if alm.get("rutina") not in ALM_RUTINA or alm.get("tipo") not in ALM_TIPO:
            err(f"verbo `{nombre}`: clase_alm incompleta/ inválida {alm} (gobernanza RN-11 — sin clase no entra)")
        if v.get("capacidad_mgi") not in MGI:
            err(f"verbo `{nombre}`: capacidad_mgi `{v.get('capacidad_mgi')}` inválida")
        for s in v.get("sinonimos", []) or []:
            if s in todos_sin:
                err(f"sinónimo `{s}` repetido entre verbos")
            todos_sin.add(s)
    colision = canonicos & todos_sin
    if colision:
        err(f"sinónimos que colisionan con canónicos: {sorted(colision)}")
    return len(verbos)


def check_triage(path: Path, schema: dict) -> int:
    """triage.yaml (D-18): la derivación de los dos scores M36 coherente con ALM/MGI/enums del objeto."""
    if not path.exists():
        err("falta sistema/schema/triage.yaml (derivación de scores M36 — D-18)")
        return 0
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    enums = schema.get("enums", {})

    if not (data.get("meta") or {}).get("decision"):
        err("triage.yaml: meta.decision ausente (provenance de la decisión)")
    if (data.get("meta") or {}).get("conf") not in set(enums.get("conf", [])):
        err("triage.yaml: meta.conf inválida (los pesos llevan provenance — M23)")

    base = data.get("base_por_capacidad") or {}
    if set(base.keys()) != MGI:
        err(f"triage.yaml: base_por_capacidad ≠ capacidades MGI: faltan {sorted(MGI - set(base))} · sobran {sorted(set(base) - MGI)}")
    ajuste = data.get("ajuste_por_clase_alm") or {}
    if set((ajuste.get("rutina") or {}).keys()) != ALM_RUTINA:
        err("triage.yaml: ajuste_por_clase_alm.rutina ≠ {rutinaria, no-rutinaria}")
    if set((ajuste.get("tipo") or {}).keys()) != ALM_TIPO:
        err("triage.yaml: ajuste_por_clase_alm.tipo ≠ clases ALM de tipo")

    mods = data.get("modificadores") or {}
    por_enum = {"datos": "datos_auto", "reglas": "reglas_auto",
                "tolerancia_revision": "conf", "riesgo_error": "impacto"}
    for mod, enum_ref in por_enum.items():
        esperado = set(enums.get(enum_ref, []))
        tiene = set((mods.get(mod) or {}).keys())
        if esperado and tiene != esperado:
            err(f"triage.yaml: modificadores.{mod} ≠ enum {enum_ref}: faltan {sorted(esperado - tiene)} · sobran {sorted(tiene - esperado)}")

    for pesos in base.values():
        for lado in ("rpa", "agente"):
            v = (pesos or {}).get(lado)
            if not isinstance(v, (int, float)) or not 0 <= v <= 100:
                err(f"triage.yaml: base_por_capacidad con `{lado}: {v}` fuera de [0,100]")

    veredictos_validos = set(enums.get("veredicto_triage", []))
    propuestos = [v.get("veredicto") for v in data.get("veredicto_propuesto") or []]
    for v in propuestos:
        if v not in veredictos_validos:
            err(f"triage.yaml: veredicto_propuesto `{v}` ∉ enum veredicto_triage")
    if "eliminable" in propuestos:
        err("triage.yaml: `eliminable` NO sale de los scores — es de ECRS (M35, cortes_previos)")
    cortes = {c.get("corte") for c in data.get("cortes_previos") or []}
    for req in ("ecrs", "mandato", "accountability"):
        if req not in cortes:
            err(f"triage.yaml: falta el corte previo `{req}` (doctrina M35/M25)")
    return len(base) + len(mods)


def main() -> int:
    schema_path = RAIZ / "objeto.schema.yaml"
    schema = yaml.safe_load(schema_path.read_text(encoding="utf-8"))

    if schema.get("meta", {}).get("version") != 2:
        err(f"meta.version = {schema.get('meta', {}).get('version')} — se esperaba 2")
    nodos = set(schema.get("nodos", {}).keys())
    if nodos != NODOS_ESPERADOS:
        err(f"nodos: faltan {sorted(NODOS_ESPERADOS - nodos)} · sobran {sorted(nodos - NODOS_ESPERADOS)}")

    n_enum = check_enum_refs(schema)
    check_refs_a(schema)
    n_rel = check_relaciones(schema)
    n_acc = check_acciones(schema)
    n_tra = check_transiciones(schema)
    n_ver = check_verbos(RAIZ / "verbos.yaml")
    n_tri = check_triage(RAIZ / "triage.yaml", schema)

    if ERRORES:
        print("gen_schema: el contrato NO valida:")
        for e in ERRORES:
            print(f"  ✖ {e}")
        return 1
    print(f"OK · objeto.schema v2 — {len(nodos)} nodos · {n_enum} refs enum · {n_rel} relaciones · "
          f"{n_acc} acciones · {n_tra} estados proyecto · {n_ver} verbos · triage {n_tri} bloques")
    return 0


if __name__ == "__main__":
    sys.exit(main())
