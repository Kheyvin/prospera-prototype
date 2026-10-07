#!/usr/bin/env python3
"""Renderiza el estado real del roadmap (CK-22) desde las historias — anti-drift twin de
gen_arquitectura.py / gen_metodo.py.

Dos SSoT hand-authored → un bloque GENERADO (no editar a mano):
  · docs/product/stories/<module>/<id>/story.yaml   (estado, módulo, nodo, prioridad, deps)
  · docs/product/releases/<Fn>-*.yaml                (qué historias trae cada release, fases)
  → ROADMAP.md § Estado, bloque <!-- GEN:estado --> ... <!-- /GEN:estado -->

La prosa de ROADMAP.md (mapa en una línea, diagrama F1, "por qué aquí", decisiones de secuencia)
NO se toca — vive fuera del bloque GEN, es juicio de secuenciación del operador/PM, no dato
mecánico. Sólo el bloque GEN se regenera.

Gate (falla con exit 1 antes de escribir):
  · toda historia listada en una release (stories/fases) tiene story.yaml con ese mismo id
  · story.yaml::release resuelve a una release existente Y esa release la lista de vuelta
    (biyección, mismo patrón que NODOS.md ↔ fichas en gen_arquitectura.py)
  · story.yaml::module coincide con la carpeta y está en el catálogo de docs/product/README.md
  · toda dependencies.stories resuelve a una historia existente

Uso:  python3 docs/product/gen_roadmap.py            # valida + escribe
      python3 docs/product/gen_roadmap.py --check    # exit 1 si hay drift (CI/pre-commit)
"""
import glob
import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
STORIES_GLOB = os.path.join(HERE, "stories", "*", "*", "story.yaml")
RELEASES_GLOB = os.path.join(HERE, "releases", "*.yaml")
ROADMAP_MD = os.path.join(HERE, "ROADMAP.md")

MODULOS = {"sistema", "cockpit", "consultio", "repositorio-oficial", "lakehouse",
           "colab-studio", "fabricante"}

errors = []


def err(msg):
    errors.append(msg)


def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_stories():
    stories = {}
    for path in sorted(glob.glob(STORIES_GLOB)):
        data = load_yaml(path)
        story_dir = os.path.dirname(path)
        dirname = os.path.basename(story_dir)
        module = os.path.basename(os.path.dirname(story_dir))
        sid = data.get("id") or dirname
        if data.get("id") != dirname:
            err(f"{path}: id '{data.get('id')}' != carpeta '{dirname}'")
        if data.get("module") != module:
            err(f"{path}: module '{data.get('module')}' != carpeta '{module}'")
        if module not in MODULOS:
            err(f"{path}: módulo '{module}' no está en el catálogo (docs/product/README.md)")
        stories[sid] = data
    return stories


def load_releases():
    releases = {}
    for path in sorted(glob.glob(RELEASES_GLOB)):
        data = load_yaml(path)
        rid = data.get("id")
        if not rid:
            err(f"{path}: release sin 'id'")
            continue
        releases[rid] = data
    return releases


def release_story_ids(rel):
    """[(fase|None, story_id), ...] en el orden declarado."""
    fases = rel.get("fases")
    if fases:
        return [(fase, sid) for fase, sids in fases.items() for sid in sids]
    return [(None, sid) for sid in rel.get("stories", [])]


def validate(stories, releases):
    listed_release_of = {}
    for rid, rel in releases.items():
        for _fase, sid in release_story_ids(rel):
            if sid not in stories:
                err(f"release {rid}: historia '{sid}' listada pero sin story.yaml")
                continue
            listed_release_of[sid] = rid

    for sid, data in stories.items():
        declared = data.get("release")
        if declared not in releases:
            err(f"{sid}: story.yaml declara release '{declared}' inexistente en docs/product/releases/")
        elif data.get("state") not in ("dropped", "parked") and listed_release_of.get(sid) != declared:
            err(f"{sid}: story.yaml declara release '{declared}' pero esa release no la lista en stories/fases")

    for sid, data in stories.items():
        for dep in (data.get("dependencies") or {}).get("stories") or []:
            if dep not in stories:
                err(f"{sid}: dependency '{dep}' no resuelve a ninguna historia")


def render_table(stories, releases):
    rows = ["| Release | Fase | Módulo | Historia | Node | Prioridad | State |",
            "|---|---|---|---|---|---|---|"]
    for rid in sorted(releases):
        rel = releases[rid]
        for fase, sid in release_story_ids(rel):
            d = stories.get(sid)
            if d is None:
                continue  # ya reportado en validate()
            rows.append(
                f"| {rid} | {fase or '—'} | {d.get('module', '')} | `{sid}` | "
                f"{d.get('node', '')} | {d.get('prioridad', '')} | {d.get('state', '')} |"
            )
    return "\n".join(rows)


def replace_block(text, tag, body):
    pat = re.compile(rf"(<!-- GEN:{tag} -->\n).*?(\n<!-- /GEN:{tag} -->)", re.DOTALL)
    if not pat.search(text):
        raise SystemExit(f"ERR: no encontré el bloque <!-- GEN:{tag} --> en ROADMAP.md")
    return pat.sub(lambda m: m.group(1) + body + m.group(2), text)


def main(argv):
    check = "--check" in argv
    stories = load_stories()
    releases = load_releases()
    validate(stories, releases)

    if errors:
        for e in errors:
            print(f"ERR  {e}")
        return 1

    md = open(ROADMAP_MD, encoding="utf-8").read()
    new = replace_block(md, "estado", render_table(stories, releases))

    if check:
        if new != md:
            print("DRIFT ROADMAP.md § Estado desincronizado de story.yaml/releases — corré gen_roadmap.py")
            return 1
        print(f"OK --check · {len(stories)} historias · {len(releases)} releases · ROADMAP.md en sync")
        return 0

    with open(ROADMAP_MD, "w", encoding="utf-8") as f:
        f.write(new)
    print(f"OK · {len(stories)} historias validadas · ROADMAP.md § Estado regenerado")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
