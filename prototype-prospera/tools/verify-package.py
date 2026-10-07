#!/usr/bin/env python3
"""Check package integrity and local Markdown-link portability from any location."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "SOURCE-MANIFEST.json").read_text())
errors = []
for entry in manifest["files"]:
    path = ROOT / entry["path"]
    if not path.is_file():
        errors.append(f"Missing source: {entry['path']}")
    elif hashlib.sha256(path.read_bytes()).hexdigest() != entry["packagedSha256"]:
        errors.append(f"Changed since packaging: {entry['path']}")

links = 0
for path in ROOT.rglob("*"):
    if path.is_symlink():
        errors.append(f"Symlink is not portable: {path.relative_to(ROOT)}")
    if not path.is_file() or path.suffix != ".md":
        continue
    for target in re.findall(r"!?\[[^\]\n]*\]\(([^)\n]+)\)", path.read_text()):
        target = target.strip().strip("<>")
        if target.startswith(("https:", "http:", "mailto:", "app:", "skill:", "#")):
            continue
        if " " in target:
            errors.append(f"Unsupported local link: {path.relative_to(ROOT)} -> {target}")
            continue
        destination = (path.parent / target.split("#")[0]).resolve()
        if not destination.is_relative_to(ROOT) or not destination.exists():
            errors.append(f"Nonportable link: {path.relative_to(ROOT)} -> {target}")
        links += 1

pack = json.loads((ROOT / "docs/prototype-foundation/templates/client-pack.json").read_text())
if list(pack["presentation"]["tabLabels"]) != ["architecture", "scope", "methodologies", "web", "desktop"]:
    errors.append("Client-pack template tab order differs from the brief")

if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print(f"OK: {len(manifest['files'])} source hashes, {links} local links, no symlinks, valid five-tab intake JSON")
