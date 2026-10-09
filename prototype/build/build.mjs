#!/usr/bin/env node
/* PRIMUS portable prototype build (CONTRACTS §12, spec §17/§18).
 *
 *   node build/build.mjs --client prospera [--dev] [--out <dir>] [--dry-run]
 *
 * ESM, Node >= 20, no dependencies. Validates the client pack with the runtime's own
 * modules (loaded in a vm context exactly like tests/helpers/load.js), bundles CSS and JS in
 * manifest order, embeds the pack as escaped JSON, runs the delivery checks and writes
 * dist/<output> + dist/<report> atomically. Nothing under dist is touched on any failure.
 *
 * Exit codes: 0 ok · 1 validation/syntax/delivery failure · 2 usage error.
 *
 * This file is also a library (validate-pack.mjs and the tests import it): the CLI only
 * runs when the file is executed directly.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MANIFEST_REL = 'build/manifest.json';

export const EXIT_OK = 0;
export const EXIT_FAIL = 1;
export const EXIT_USAGE = 2;

export const PLACEHOLDERS = Object.freeze({
  styles: '/*PRIMUS:STYLES*/',
  noscript: '<!--PRIMUS:NOSCRIPT-->',
  pack: '/*PRIMUS:PACK*/',
  scripts: '/*PRIMUS:SCRIPTS*/'
});

/* Tokens that must never appear in the delivered HTML (CONTRACTS §12). `https://` is handled
 * separately (allowed only inside the pack's externalReference urls) and drive paths use
 * DRIVE_PATH_RE. */
export const FORBIDDEN_TOKENS = Object.freeze([
  'http://', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'import(', '@import', 'localStorage',
  'indexedDB', 'serviceWorker', 'document.cookie', '<iframe', '/home/'
]);

/* XML namespace identifiers are not network references: document.createElementNS needs the
 * exact string (core/dom builds inline SVG with it). They are masked before the http:// scan. */
export const XML_NAMESPACE_ALLOWLIST = Object.freeze([
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/XML/1998/namespace'
]);

/* Backslash drive paths: `C:\\Users` (JSON/JS string literal) or `C:\Users` (comment). A single
 * backslash followed by an escape letter (`:\n`, `:\t`, `:\u`) is not a path. */
export const DRIVE_PATH_RE = /(?<![A-Za-z0-9_])[A-Za-z]:(?:\\\\|\\(?![nrtbfv0"'\\/u]))/g;

const SOURCE_EXTENSIONS = new Set(['.js', '.css']);
const SOURCE_DIRS = ['src', 'schemas'];

/* ------------------------------------------------------------------------------------------
 * Escaping
 * ---------------------------------------------------------------------------------------- */

/** Escapes serialized JSON so it can sit inside a <script type="application/json"> element:
 *  `<` `>` `&` U+2028 U+2029 become \u escapes. The result is still valid JSON with the same
 *  value, and can never contain `</script`, `<!--` or a line separator. */
export function escapeJsonForHtml(json) {
  if (typeof json !== 'string') throw new TypeError('escapeJsonForHtml expects the JSON text (a string)');
  return json.replace(/[<>&\u2028\u2029]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
}

/** JSON.stringify + escapeJsonForHtml. */
export function serializePackForHtml(value) {
  return escapeJsonForHtml(JSON.stringify(value));
}

/** Escapes text for an HTML text node or attribute value. */
export function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (c) => map[c]);
}

/* ------------------------------------------------------------------------------------------
 * Small helpers
 * ---------------------------------------------------------------------------------------- */

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function countOccurrences(text, token) {
  let n = 0;
  let i = text.indexOf(token);
  while (i !== -1) {
    n += 1;
    i = text.indexOf(token, i + token.length);
  }
  return n;
}

function snippet(text, index, width = 48) {
  const start = Math.max(0, index - width / 2);
  const end = Math.min(text.length, index + width);
  return text.slice(start, end).replace(/\s+/g, ' ');
}

/** Module id of a manifest JS path (CONTRACTS §1): strip `src/`, `.js` and a trailing `/index`. */
export function moduleIdFor(rel) {
  let id = rel.replace(/^src\//, '').replace(/\.js$/, '');
  if (id.endsWith('/index')) id = id.slice(0, -'/index'.length);
  return id;
}

/** Recursively lists files (posix relative paths) under root/dir. */
export function walkFiles(root, dir) {
  const out = [];
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(toPosix(path.relative(root, full)));
    }
  }
  return out.sort();
}

export function gitRevision(root) {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
    const rev = out.trim();
    return /^[0-9a-f]{40}$/.test(rev) ? rev : null;
  } catch {
    return null;
  }
}

function writeAtomic(filePath, data) {
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

/* ------------------------------------------------------------------------------------------
 * Manifest
 * ---------------------------------------------------------------------------------------- */

export function loadManifest(root = ROOT) {
  const abs = path.join(root, MANIFEST_REL);
  const manifest = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const problems = [];
  if (manifest.schemaVersion !== 1) problems.push('schemaVersion must be 1');
  if (typeof manifest.shell !== 'string') problems.push('shell must be a path');
  if (!Array.isArray(manifest.css)) problems.push('css must be an array');
  if (!Array.isArray(manifest.js)) problems.push('js must be an array');
  if (!manifest.clients || typeof manifest.clients !== 'object') problems.push('clients must be an object');
  if (!Number.isInteger(manifest.budgetBytes) || manifest.budgetBytes <= 0) problems.push('budgetBytes must be a positive integer');
  if (problems.length) throw new Error(`${MANIFEST_REL}: ${problems.join('; ')}`);
  return manifest;
}

export function clientConfig(manifest, clientId) {
  const client = manifest.clients[clientId];
  if (!client) return null;
  const problems = [];
  if (!Array.isArray(client.pack) || !client.pack.length) problems.push('pack must be a non-empty array');
  if (client.assets !== undefined && !Array.isArray(client.assets)) problems.push('assets must be an array');
  if (typeof client.output !== 'string' || !client.output.endsWith('.html')) problems.push('output must be an .html file name');
  if (typeof client.report !== 'string' || !client.report.endsWith('.json')) problems.push('report must be a .json file name');
  if (problems.length) throw new Error(`${MANIFEST_REL}: clients.${clientId}: ${problems.join('; ')}`);
  return { ...client, assets: client.assets || [] };
}

/** Every file the build consumes, in manifest order. */
export function manifestInputs(manifest, client) {
  return [MANIFEST_REL, manifest.shell, ...manifest.css, ...manifest.js, ...client.pack, ...client.assets];
}

/* ------------------------------------------------------------------------------------------
 * Runtime loader (same approach as tests/helpers/load.js)
 * ---------------------------------------------------------------------------------------- */

/** Evaluates prelude + every manifest JS file except main.js in this context and returns the
 *  Primus registry. Throws on a missing file unless allowMissing; a file that fails to parse
 *  or throws at registration time raises an Error whose message names the file. */
export function loadRuntime({ root = ROOT, manifest, allowMissing = false, skip = ['src/main.js'] } = {}) {
  const m = manifest || loadManifest(root);
  const skipSet = new Set(skip);
  const loaded = [];
  const missing = [];
  delete globalThis.Primus;

  const run = (rel) => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      if (allowMissing) { missing.push(rel); return; }
      throw new Error(`Manifest file missing: ${rel}`);
    }
    try {
      vm.runInThisContext(fs.readFileSync(abs, 'utf8'), { filename: abs });
    } catch (e) {
      const err = new Error(`${rel}: ${e && e.message ? e.message : e}${locationFromStack(e)}`);
      err.file = rel;
      throw err;
    }
    loaded.push(rel);
  };

  run('src/prelude.js');
  if (!globalThis.Primus) throw new Error('src/prelude.js did not define the Primus registry');
  for (const rel of m.js) {
    if (rel === 'src/prelude.js' || skipSet.has(rel)) continue;
    run(rel);
  }
  return { Primus: globalThis.Primus, loaded, missing, manifest: m };
}

function locationFromStack(e) {
  const stack = e && typeof e.stack === 'string' ? e.stack : '';
  const first = stack.split('\n')[0] || '';
  const m = /:(\d+)(?::(\d+))?$/.exec(first.trim());
  return m ? ` (line ${m[1]})` : '';
}

/* ------------------------------------------------------------------------------------------
 * Pack: read, merge, validate
 * ---------------------------------------------------------------------------------------- */

export function readPackFiles({ root = ROOT, client, allowMissing = false }) {
  const objects = [];
  const missing = [];
  const errors = [];
  for (const rel of client.pack) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      if (allowMissing) { missing.push(rel); continue; }
      errors.push({ path: rel, message: 'file missing' });
      continue;
    }
    try {
      objects.push({ path: rel, data: JSON.parse(fs.readFileSync(abs, 'utf8')) });
    } catch (e) {
      errors.push({ path: rel, message: `invalid JSON: ${e.message}` });
    }
  }
  return { objects, missing, errors };
}

export function normalizeValidationError(e) {
  if (typeof e === 'string') return { path: '', message: e };
  if (e && typeof e === 'object') {
    const p = e.path ?? e.at ?? e.pointer ?? e.id ?? '';
    const msg = e.message ?? e.msg ?? e.error ?? e.text ?? JSON.stringify(e);
    return { path: Array.isArray(p) ? p.join('.') : String(p), message: String(msg) };
  }
  return { path: '', message: String(e) };
}

export function formatError(e) {
  return e.path ? `${e.path}: ${e.message}` : e.message;
}

/** Merges the pack files with core/pack and validates with schemas/pack-validator. */
export function mergeAndValidate(Primus, objects) {
  const errors = [];
  let merged = null;
  let resolved = null;
  let packCore;
  let validator;
  try {
    packCore = Primus.require('core/pack');
  } catch (e) {
    errors.push({ path: 'src/core/pack.js', message: `cannot load module core/pack: ${e.message}` });
    return { merged, resolved, errors };
  }
  try {
    merged = packCore.mergePackFiles(objects.map((o) => o.data));
  } catch (e) {
    errors.push({ path: 'clients', message: `merge failed: ${e.message}` });
    return { merged, resolved, errors };
  }
  try {
    validator = Primus.require('schemas/pack-validator');
  } catch (e) {
    errors.push({ path: 'schemas/pack-validator.js', message: `cannot load module schemas/pack-validator: ${e.message}` });
    return { merged, resolved, errors };
  }
  let result;
  try {
    result = validator.validatePack(merged);
  } catch (e) {
    errors.push({ path: 'schemas/pack-validator.js', message: `validator threw: ${e.message}` });
    return { merged, resolved, errors };
  }
  const list = Array.isArray(result && result.errors) ? result.errors : [];
  const ok = result && typeof result.ok === 'boolean' ? result.ok : list.length === 0;
  if (!ok || list.length) {
    for (const e of list) errors.push(normalizeValidationError(e));
    if (!errors.length) errors.push({ path: '', message: 'validator reported ok:false without errors' });
    return { merged, resolved, errors };
  }
  if (typeof packCore.resolvePack === 'function') {
    try {
      resolved = packCore.resolvePack(merged);
    } catch (e) {
      errors.push({ path: 'src/core/pack.js', message: `resolvePack failed: ${e.message}` });
    }
  }
  return { merged, resolved, errors };
}

/** Loads the runtime, reads and validates a client's pack. Shared by build and validate-pack. */
export function loadPackForClient({ root = ROOT, clientId, allowMissing = false } = {}) {
  const manifest = loadManifest(root);
  const client = clientConfig(manifest, clientId);
  if (!client) throw Object.assign(new Error(`Unknown client "${clientId}" (known: ${Object.keys(manifest.clients).join(', ')})`), { usage: true });
  const runtime = loadRuntime({ root, manifest, allowMissing });
  const files = readPackFiles({ root, client, allowMissing });
  const errors = [...files.errors];
  let merged = null;
  let resolved = null;
  if (!errors.length) {
    const r = mergeAndValidate(runtime.Primus, files.objects);
    merged = r.merged;
    resolved = r.resolved;
    errors.push(...r.errors);
  }
  return { manifest, client, runtime, files, merged, resolved, errors };
}

/** Human summary of a merged pack: "142 entities, 210 relations, ...". */
export function packCounts(merged) {
  const n = (v) => (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 0);
  const org = merged.organization || {};
  const parts = [
    [n(org.entities), 'entities'],
    [n(org.relations), 'relations'],
    [n(org.versions), 'versions'],
    [n(org.flows), 'flows'],
    [n(merged.sources), 'sources'],
    [n(merged.solution && merged.solution.nodes), 'solution nodes'],
    [n(merged.scope && merged.scope.items), 'scope items'],
    [n(merged.methodologies && merged.methodologies.items), 'methods'],
    [n(merged.demo && merged.demo.profiles), 'profiles'],
    [n(merged.tracking && merged.tracking.incidents), 'incidents'],
    [n(merged.tracking && merged.tracking.projects), 'projects'],
    [n(merged.security && merged.security.accounts), 'accounts'],
    [n(merged.desktop && merged.desktop.workspaces), 'workspaces'],
    [n(merged.scenarios), 'scenarios']
  ];
  return parts.map(([count, label]) => `${count} ${label}`).join(', ');
}

/** Every externalReference.url in the pack (the only place https:// may appear). */
export function collectExternalUrls(value, found = new Set()) {
  if (Array.isArray(value)) {
    for (const v of value) collectExternalUrls(v, found);
  } else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (key === 'externalReference' && v && typeof v === 'object' && typeof v.url === 'string') found.add(v.url);
      collectExternalUrls(v, found);
    }
  }
  return [...found];
}

/* ------------------------------------------------------------------------------------------
 * Bundling
 * ---------------------------------------------------------------------------------------- */

function readSources(root, rels, allowMissing) {
  const files = [];
  const missing = [];
  for (const rel of rels) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      if (allowMissing) { missing.push(rel); continue; }
      throw new Error(`Manifest file missing: ${rel}`);
    }
    files.push({ path: rel, text: fs.readFileSync(abs, 'utf8') });
  }
  return { files, missing };
}

/** Concatenates files in order with a header comment per file; returns offsets per part. */
export function bundle(kind, files) {
  const label = kind === 'css' ? 'hoja de estilos' : 'script';
  let text = `/* PRIMUS para Próspera · ${label} generada por build/build.mjs · no editar */\n`;
  const parts = [];
  for (const f of files) {
    text += kind === 'css' ? `\n/* ==== ${f.path} ==== */\n` : `\n;/* ==== ${f.path} ==== */\n`;
    const start = text.length;
    text += f.text.endsWith('\n') ? f.text : `${f.text}\n`;
    parts.push({ path: f.path, start, end: text.length });
  }
  return { kind, text, parts };
}

function findInFiles(files, pattern, label) {
  const errors = [];
  for (const f of files) {
    const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    let m;
    while ((m = re.exec(f.text)) !== null) {
      errors.push({ path: f.path, message: `${label} at line ${lineOf(f.text, m.index)}: "${snippet(f.text, m.index)}"` });
      if (errors.length > 20) return errors;
    }
  }
  return errors;
}

export function checkCss(files) {
  return [
    ...findInFiles(files, /@import\b/, '@import is not allowed'),
    ...findInFiles(files, /<\/style/i, '"</style" would close the inline stylesheet')
  ];
}

export function checkJsText(files) {
  return [
    ...findInFiles(files, /<\/script/i, '"</script" would close the inline script'),
    ...findInFiles(files, /<script/i, '"<script" inside a script element changes HTML parsing; build the string dynamically'),
    ...findInFiles(files, /<!--/, '"<!--" inside a script element changes HTML parsing')
  ];
}

/** new Function(js) + vm.Script on the whole bundle; on failure, locates the file via per-file parsing. */
export function checkJsSyntax(js) {
  const run = (fn) => {
    try { fn(); return null; } catch (e) {
      if (e instanceof SyntaxError) return e;
      throw e;
    }
  };
  // eslint-disable-next-line no-new-func
  const err = run(() => new Function(js.text)) || run(() => new vm.Script(js.text, { filename: 'primus-bundle.js' }));
  if (!err) return [];
  const hints = [];
  for (const part of js.parts) {
    const src = js.text.slice(part.start, part.end);
    try {
      new vm.Script(src, { filename: part.path }); // eslint-disable-line no-new
    } catch (e) {
      const first = (e.stack || '').split('\n')[0];
      const m = /:(\d+)$/.exec(first.trim());
      const line = m ? Number(m[1]) : null;
      const where = line ? ` (line ${line}; bundle line ${lineOf(js.text, part.start) + line - 1})` : '';
      hints.push({ path: part.path, message: `${e.message}${where}` });
    }
  }
  if (!hints.length) {
    const offsets = js.parts.map((p) => `${p.path}@${lineOf(js.text, p.start)}`).join(', ');
    hints.push({ path: 'bundle', message: `${err.message} — every file parses alone; check file boundaries (bundle line offsets: ${offsets})` });
  }
  return hints;
}

/* ------------------------------------------------------------------------------------------
 * Template assembly
 * ---------------------------------------------------------------------------------------- */

/** Replaces the <title> and the four placeholders; returns the HTML plus the regions each
 *  slot occupies (so delivery findings can be mapped back to a source file and line).
 *  `slots` = { styles, noscript, pack, scripts } (already escaped strings). */
export function assembleHtml(template, { title, slots, dev = false }) {
  const problems = [];
  let tpl = template;
  const titleRe = /<title>[^<]*<\/title>/;
  if (!titleRe.test(tpl)) problems.push('src/shell.html: <title> element not found');
  tpl = tpl.replace(titleRe, () => `<title>${escapeHtml(title)}</title>`);
  if (dev) {
    tpl = tpl.replace(/<style>\s*\/\*PRIMUS:STYLES\*\/\s*<\/style>/, () => PLACEHOLDERS.styles);
    tpl = tpl.replace(/<script>\s*\/\*PRIMUS:SCRIPTS\*\/\s*<\/script>/, () => PLACEHOLDERS.scripts);
  }
  const order = [];
  for (const [id, token] of Object.entries(PLACEHOLDERS)) {
    const count = countOccurrences(tpl, token);
    if (count !== 1) problems.push(`src/shell.html: placeholder ${token} must appear exactly once (found ${count})`);
    else order.push({ id, token, index: tpl.indexOf(token) });
  }
  if (problems.length) return { html: null, regions: [], problems };
  order.sort((a, b) => a.index - b.index);
  let html = '';
  let cursor = 0;
  const regions = [];
  for (const slot of order) {
    html += tpl.slice(cursor, slot.index);
    const start = html.length;
    html += slots[slot.id] ?? '';
    regions.push({ id: slot.id, start, end: html.length });
    cursor = slot.index + slot.token.length;
  }
  html += tpl.slice(cursor);
  for (const token of Object.values(PLACEHOLDERS)) {
    if (html.includes(token)) problems.push(`placeholder ${token} survived assembly (a source contains it)`);
  }
  return { html, regions, problems };
}

/** Maps an index of the final HTML to "<file> line <n>". */
export function locateInHtml(html, index, regions, bundles) {
  const region = regions.find((r) => index >= r.start && index < r.end);
  if (!region) return `src/shell.html line ${lineOf(html, index)}`;
  const b = bundles[region.id];
  if (b) {
    const inner = index - region.start;
    const part = b.parts.find((p) => inner >= p.start && inner < p.end);
    if (part) return `${part.path} line ${lineOf(b.text, inner) - lineOf(b.text, part.start) + 1}`;
    return `${region.id} bundle line ${lineOf(b.text, inner)}`;
  }
  if (region.id === 'pack') return 'pack JSON';
  return `${region.id} slot`;
}

/* ------------------------------------------------------------------------------------------
 * Delivery scan
 * ---------------------------------------------------------------------------------------- */

/** Scans the final HTML for forbidden tokens. `allowedUrls` are masked before the scan (both
 *  raw and JSON-escaped forms). Returns [{ token, index, context }]. */
export function scanForbidden(html, { allowedUrls = [], limitPerToken = 5 } = {}) {
  let masked = html;
  const mask = (needle) => {
    if (!needle) return;
    let i = masked.indexOf(needle);
    while (i !== -1) {
      masked = masked.slice(0, i) + ' '.repeat(needle.length) + masked.slice(i + needle.length);
      i = masked.indexOf(needle, i + needle.length);
    }
  };
  for (const url of allowedUrls) {
    mask(url);
    mask(escapeJsonForHtml(JSON.stringify(url)).slice(1, -1));
  }
  for (const ns of XML_NAMESPACE_ALLOWLIST) mask(ns);

  const findings = [];
  const push = (token, index) => findings.push({ token, index, context: snippet(html, index) });
  for (const token of [...FORBIDDEN_TOKENS, 'https://']) {
    let i = masked.indexOf(token);
    let n = 0;
    while (i !== -1 && n < limitPerToken) {
      push(token, i);
      n += 1;
      i = masked.indexOf(token, i + token.length);
    }
  }
  const re = new RegExp(DRIVE_PATH_RE.source, 'g');
  let m;
  let n = 0;
  while ((m = re.exec(masked)) !== null && n < limitPerToken) {
    push('drive path', m.index);
    n += 1;
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------
 * Build
 * ---------------------------------------------------------------------------------------- */

function devTag(kind, href) {
  return kind === 'css'
    ? `<link rel="stylesheet" href="${escapeHtml(href)}">`
    : `<script src="${escapeHtml(href)}"></script>`;
}

function relativeHref(outDir, root, rel) {
  const p = toPosix(path.relative(outDir, path.join(root, rel)));
  return p.startsWith('.') ? p : `./${p}`;
}

/**
 * Runs the whole build. Returns { exitCode, checks, failures, todo, lines, output, report }.
 * Nothing is written when exitCode !== 0 or when dryRun is set.
 */
export function build({ root = ROOT, clientId, dev = false, out, dryRun = false } = {}) {
  const checks = [];
  const failures = [];
  const todo = [];
  const lines = [];
  const check = (id, ok, detail, details = []) => {
    checks.push({ id, ok, detail });
    if (!ok) failures.push({ id, detail, details });
    return ok;
  };
  const result = { exitCode: EXIT_FAIL, checks, failures, todo, lines, output: null, report: null };

  if (!clientId) throw Object.assign(new Error('--client <id> is required'), { usage: true });
  const manifest = loadManifest(root);
  const client = clientConfig(manifest, clientId);
  if (!client) throw Object.assign(new Error(`Unknown client "${clientId}" (known: ${Object.keys(manifest.clients).join(', ')})`), { usage: true });
  const outDir = out ? path.resolve(process.cwd(), out) : path.join(root, 'dist');
  const inputs = manifestInputs(manifest, client);

  /* 1. Every manifest file exists --------------------------------------------------------- */
  const missing = inputs.filter((rel) => !fs.existsSync(path.join(root, rel)));
  if (missing.length && !dryRun) {
    check('manifest-files', false, `${missing.length} missing`, missing.map((m) => `${m}: file missing`));
  } else {
    check('manifest-files', true, missing.length ? `${inputs.length - missing.length}/${inputs.length} present (dry-run)` : `${inputs.length} files present`);
    todo.push(...missing);
  }
  const badPaths = inputs.filter((rel) => /^[A-Za-z]:|^[\\/]|\\|(^|\/)\.\.(\/|$)/.test(rel));
  check('manifest-paths', badPaths.length === 0, badPaths.length ? `${badPaths.length} invalid` : 'relative forward-slash paths', badPaths.map((p) => `${p}: must be a relative forward-slash path inside the project`));

  /* 2. No unregistered source files ------------------------------------------------------ */
  const registered = new Set([...manifest.css, ...manifest.js]);
  const unregistered = SOURCE_DIRS.flatMap((d) => walkFiles(root, d))
    .filter((rel) => SOURCE_EXTENSIONS.has(path.posix.extname(rel)) && !registered.has(rel));
  check('manifest-complete', unregistered.length === 0, unregistered.length ? `${unregistered.length} unregistered` : 'every src/schemas js/css file is registered',
    unregistered.map((p) => `${p}: not listed in ${MANIFEST_REL} (add it or delete it)`));

  /* 3. Assets ----------------------------------------------------------------------------- */
  check('assets', client.assets.length === 0, client.assets.length ? `${client.assets.length} listed` : 'none',
    client.assets.length ? ['the shell template has no asset slot; asset embedding is not implemented'] : []);

  /* 4. Runtime modules + pack ------------------------------------------------------------- */
  let runtime = null;
  try {
    runtime = loadRuntime({ root, manifest, allowMissing: dryRun });
    check('modules-load', true, `${runtime.loaded.length} modules registered${runtime.missing.length ? ` (${runtime.missing.length} missing, dry-run)` : ''}`);
  } catch (e) {
    check('modules-load', false, e.message, [e.message]);
  }

  let merged = null;
  let allowedUrls = [];
  const packFiles = readPackFiles({ root, client, allowMissing: dryRun });
  if (packFiles.errors.length) {
    check('pack-read', false, `${packFiles.errors.length} unreadable`, packFiles.errors.map(formatError));
  } else {
    check('pack-read', true, `${packFiles.objects.length} files${packFiles.missing.length ? ` (${packFiles.missing.length} missing, dry-run)` : ''}`);
  }
  const canValidate = runtime && !packFiles.errors.length && runtime.Primus.has('core/pack') && runtime.Primus.has('schemas/pack-validator');
  if (canValidate) {
    const r = mergeAndValidate(runtime.Primus, packFiles.objects);
    merged = r.merged;
    if (r.errors.length) {
      check('pack-validate', false, `${r.errors.length} error(s)`, r.errors.map(formatError));
    } else {
      check('pack-validate', true, packCounts(merged));
      check('pack-resolve', r.resolved !== null || typeof runtime.Primus.require('core/pack').resolvePack !== 'function', 'resolved');
    }
  } else if (dryRun) {
    todo.push('pack validation skipped (core/pack or schemas/pack-validator not available yet)');
  } else {
    check('pack-validate', false, 'skipped because modules or pack files failed to load', []);
  }

  let title = null;
  let noscript = null;
  if (merged) {
    const schemaOk = merged.schemaVersion === 1 && manifest.schemaVersion === 1;
    check('schema-version', schemaOk, `pack ${merged.schemaVersion} · manifest ${manifest.schemaVersion}`, schemaOk ? [] : ['schemaVersion must be 1 in both the pack and the manifest']);
    const idOk = merged.client && merged.client.id === clientId;
    check('client-id', !!idOk, idOk ? clientId : `pack client.id=${merged.client && merged.client.id} ≠ --client ${clientId}`, idOk ? [] : ['the pack belongs to a different client']);
    title = merged.presentation && merged.presentation.windowTitle;
    noscript = merged.presentation && merged.presentation.noscript;
    check('presentation-texts', typeof title === 'string' && !!title && typeof noscript === 'string' && !!noscript,
      typeof title === 'string' ? `title "${title}"` : 'presentation.windowTitle / presentation.noscript missing',
      typeof title === 'string' && typeof noscript === 'string' ? [] : ['presentation.windowTitle and presentation.noscript are required']);
    allowedUrls = collectExternalUrls(merged);
    const badUrls = allowedUrls.filter((u) => !/^https:\/\/[^\s<>"'\\]+$/.test(u));
    check('external-urls', badUrls.length === 0, `${allowedUrls.length} allowlisted`, badUrls.map((u) => `externalReference.url must be a plain https URL: ${u}`));
  }

  /* 5. CSS and JS bundles ----------------------------------------------------------------- */
  let css = null;
  let js = null;
  try {
    const cssSrc = readSources(root, manifest.css, dryRun);
    const cssErrors = checkCss(cssSrc.files);
    check('css-clean', cssErrors.length === 0, cssErrors.length ? `${cssErrors.length} finding(s)` : `${cssSrc.files.length} files, no @import`, cssErrors.map(formatError));
    css = bundle('css', cssSrc.files);
    const jsSrc = readSources(root, manifest.js, dryRun);
    const jsTextErrors = checkJsText(jsSrc.files);
    check('js-clean', jsTextErrors.length === 0, jsTextErrors.length ? `${jsTextErrors.length} finding(s)` : `${jsSrc.files.length} files`, jsTextErrors.map(formatError));
    js = bundle('js', jsSrc.files);
    const syntaxErrors = checkJsSyntax(js);
    check('js-syntax', syntaxErrors.length === 0, syntaxErrors.length ? `${syntaxErrors.length} syntax error(s)` : 'new Function(js) ok', syntaxErrors.map(formatError));
  } catch (e) {
    check('bundle', false, e.message, [e.message]);
  }

  /* 6. Assemble --------------------------------------------------------------------------- */
  let html = null;
  let assembled = null;
  const shellAbs = path.join(root, manifest.shell);
  if (css && js && fs.existsSync(shellAbs)) {
    const template = fs.readFileSync(shellAbs, 'utf8');
    const packJson = merged ? serializePackForHtml(merged) : '{}';
    const slots = {
      styles: css.text,
      noscript: escapeHtml(noscript || ''),
      pack: packJson,
      scripts: js.text
    };
    assembled = assembleHtml(template, { title: title || '', slots });
    check('shell-template', assembled.problems.length === 0, assembled.problems.length ? `${assembled.problems.length} problem(s)` : 'placeholders replaced', assembled.problems);
    html = assembled.html;
  } else if (!dryRun) {
    check('shell-template', false, 'skipped (bundles or shell missing)', []);
  }

  /* 7. Delivery checks on the final HTML -------------------------------------------------- */
  let bytes = 0;
  let digest = null;
  if (html) {
    const bundles = { styles: css, scripts: js };
    const findings = scanForbidden(html, { allowedUrls });
    check('html-forbidden-tokens', findings.length === 0, findings.length ? `${findings.length} finding(s)` : `clean (${allowedUrls.length} allowlisted https urls)`,
      findings.map((f) => `"${f.token}" at ${locateInHtml(html, f.index, assembled.regions, bundles)}: …${f.context}…`));
    const openTags = countOccurrences(html.toLowerCase(), '<script');
    const closeTags = countOccurrences(html.toLowerCase(), '</script');
    check('html-script-tags', openTags === 2 && closeTags === 2, `${openTags} <script, ${closeTags} </script`, openTags === 2 && closeTags === 2 ? [] : ['the HTML must contain exactly two script elements (pack JSON and bundle)']);
    const packOk = (() => {
      const m = /<script type="application\/json" id="primus-pack">([\s\S]*?)<\/script>/.exec(html);
      if (!m) return 'pack script element not found';
      try { JSON.parse(m[1]); return null; } catch (e) { return `embedded pack does not parse: ${e.message}`; }
    })();
    check('html-pack-json', packOk === null, packOk === null ? 'embedded pack parses' : packOk, packOk === null ? [] : [packOk]);
    const buf = Buffer.from(html, 'utf8');
    bytes = buf.length;
    digest = sha256(buf);
    check('html-size', bytes <= manifest.budgetBytes, `${bytes.toLocaleString('en-US')} bytes of ${manifest.budgetBytes.toLocaleString('en-US')}`,
      bytes <= manifest.budgetBytes ? [] : [`output exceeds budgetBytes by ${(bytes - manifest.budgetBytes).toLocaleString('en-US')} bytes`]);
  }

  /* 8. Summary + write -------------------------------------------------------------------- */
  const mode = dryRun ? 'dry-run' : dev ? 'dev' : 'release';
  const okCount = checks.filter((c) => c.ok).length;
  lines.push(`PRIMUS build · client "${clientId}" · ${mode}`);
  lines.push(`  inputs   ${inputs.length} files · ${manifest.css.length} css · ${manifest.js.length} js · ${client.pack.length} pack · ${client.assets.length} assets`);
  if (merged) lines.push(`  pack     ${packCounts(merged)}`);
  lines.push(`  checks   ${okCount} ok · ${failures.length} failed`);
  if (todo.length) lines.push(`  todo     ${todo.length} item(s) (dry-run tolerates missing files)`);

  if (failures.length) {
    result.exitCode = EXIT_FAIL;
    return result;
  }
  if (dryRun) {
    lines.push('  output   not written (dry-run)');
    result.exitCode = EXIT_OK;
    return result;
  }

  fs.mkdirSync(outDir, { recursive: true });
  if (dev) {
    const devName = `${clientId}-prototype.dev.html`;
    const devPath = path.join(outDir, devName);
    const template = fs.readFileSync(shellAbs, 'utf8');
    const devSlots = {
      styles: manifest.css.map((rel) => devTag('css', relativeHref(outDir, root, rel))).join('\n'),
      noscript: escapeHtml(noscript || ''),
      pack: serializePackForHtml(merged),
      scripts: manifest.js.map((rel) => devTag('js', relativeHref(outDir, root, rel))).join('\n')
    };
    const devHtml = assembleHtml(template, { title: title || '', slots: devSlots, dev: true });
    if (devHtml.problems.length) {
      check('dev-template', false, devHtml.problems.join('; '), devHtml.problems);
      result.exitCode = EXIT_FAIL;
      return result;
    }
    writeAtomic(devPath, devHtml.html);
    result.output = devPath;
    lines.push(`  output   ${toPosix(path.relative(root, devPath))} (links ${manifest.css.length} css + ${manifest.js.length} js files; pack inline)`);
    lines.push('  report   not written in --dev mode');
    result.exitCode = EXIT_OK;
    return result;
  }

  const outPath = path.join(outDir, client.output);
  const reportPath = path.join(outDir, client.report);
  const report = {
    clientId,
    schemaVersion: merged.schemaVersion,
    specVersion: merged.specVersion ?? manifest.specVersion ?? null,
    sourceRevision: gitRevision(root),
    generatedAt: new Date().toISOString(),
    inputs: inputs.map((rel) => ({ path: rel, sha256: sha256(fs.readFileSync(path.join(root, rel))) })),
    checks,
    bytes,
    sha256: digest
  };
  writeAtomic(outPath, Buffer.from(html, 'utf8'));
  writeAtomic(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  result.output = outPath;
  result.report = reportPath;
  lines.push(`  output   ${toPosix(path.relative(root, outPath))} · ${bytes.toLocaleString('en-US')} bytes · sha256 ${digest.slice(0, 12)}…`);
  lines.push(`  report   ${toPosix(path.relative(root, reportPath))}${report.sourceRevision ? ` · rev ${report.sourceRevision.slice(0, 10)}` : ' · no git revision'}`);
  result.exitCode = EXIT_OK;
  return result;
}

/* ------------------------------------------------------------------------------------------
 * CLI
 * ---------------------------------------------------------------------------------------- */

const USAGE = `Usage: node build/build.mjs --client <id> [--dev] [--out <dir>] [--dry-run] [--root <dir>]

  --client <id>   client pack to build (required; see build/manifest.json clients)
  --dev           write dist/<id>-prototype.dev.html that links src files instead of inlining them
  --out <dir>     output directory (default: dist)
  --dry-run       run every check that is possible, tolerate missing files, write nothing
  --root <dir>    project root (default: the folder above build/; used by the build tests)

Exit codes: 0 ok · 1 validation/syntax/delivery failure · 2 usage error`;

export function parseCliArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      client: { type: 'string' },
      dev: { type: 'boolean', default: false },
      out: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      root: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false }
    },
    strict: true,
    allowPositionals: false
  });
  return values;
}

export function printFailures(failures, stream = process.stderr) {
  for (const f of failures) {
    stream.write(`FAIL ${f.id}: ${f.detail}\n`);
    for (const d of f.details || []) stream.write(`  - ${d}\n`);
  }
}

export function runCli(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseCliArgs(argv);
  } catch (e) {
    process.stderr.write(`${e.message}\n\n${USAGE}\n`);
    return EXIT_USAGE;
  }
  if (args.help) {
    process.stdout.write(`${USAGE}\n`);
    return EXIT_OK;
  }
  if (!args.client) {
    process.stderr.write(`--client <id> is required\n\n${USAGE}\n`);
    return EXIT_USAGE;
  }
  let result;
  try {
    result = build({
      root: args.root ? path.resolve(process.cwd(), args.root) : ROOT,
      clientId: args.client,
      dev: args.dev,
      out: args.out,
      dryRun: args['dry-run']
    });
  } catch (e) {
    process.stderr.write(`build failed: ${e.message}\n`);
    if (!e.usage && process.env.PRIMUS_BUILD_DEBUG) process.stderr.write(`${e.stack}\n`);
    return e.usage ? EXIT_USAGE : EXIT_FAIL;
  }
  process.stdout.write(`${result.lines.join('\n')}\n`);
  if (result.todo.length) {
    process.stdout.write('  todo:\n');
    for (const t of result.todo) process.stdout.write(`    - ${t}\n`);
  }
  if (result.failures.length) {
    printFailures(result.failures);
    process.stderr.write(`build failed with ${result.failures.length} failing check(s); dist untouched\n`);
  }
  return result.exitCode;
}

function isMainModule() {
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    const a = pathToFileURL(path.resolve(argv1)).href;
    const b = import.meta.url;
    return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  process.exitCode = runCli();
}
