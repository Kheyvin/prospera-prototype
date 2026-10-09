'use strict';
/* Delivery checks on the built artifact (CONTRACTS §12; spec §18, AT-32, §19.2).
 *
 * Runs against dist/prospera-prototype.html + dist/prospera-build.json. When the artifact
 * has not been built the whole suite is skipped with a message (run:
 * node build/build.mjs --client prospera). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_HTML = path.join(DIST_DIR, 'prospera-prototype.html');
const DIST_REPORT = path.join(DIST_DIR, 'prospera-build.json');
const BUILD_MJS = path.join(ROOT, 'build', 'build.mjs');

const BUDGET_BYTES = 5 * 1024 * 1024;
const WINDOW_TITLE = 'PRIMUS para Próspera · Prototipo';
const TAB_LABELS = [
  'Arquitectura de la solución',
  'Alcance del proyecto',
  'Metodologías aplicadas',
  'Prototipo web',
  'Prototipo de escritorio'
];

/* Same list as build/build.mjs FORBIDDEN_TOKENS (CONTRACTS §12); `https://` is checked
 * separately against the pack's externalReference urls, drive paths with DRIVE_PATH_RE. */
const FORBIDDEN_TOKENS = [
  'http://', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'import(', '@import', 'localStorage',
  'indexedDB', 'serviceWorker', 'document.cookie', '<iframe', '/home/'
];
/* XML namespace identifiers are required by document.createElementNS; they are not network references. */
const XML_NAMESPACES = [
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/XML/1998/namespace'
];
const DRIVE_PATH_RE = /(?<![A-Za-z0-9_])[A-Za-z]:(?:\\\\|\\(?![nrtbfv0"'\\/u]))/g;
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const MACHINE_NAME_RES = [/\bLenovo\b/i, /\bHP\b/];
/* A file name = stem + extension. A bare extension word such as the spec's S-META section text
 * ("cuatro XML auxiliares dentro de cada .diag") is not a file name. */
const SOURCE_FILE_RE = /[\w-]\.(pptx|docx|diag)\b/gi;
const PACK_SCRIPT_RE = /<script type="application\/json" id="primus-pack">([\s\S]*?)<\/script>/;

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

function snippet(text, index, width = 60) {
  return text.slice(Math.max(0, index - 20), Math.min(text.length, index + width)).replace(/\s+/g, ' ');
}

function maskAll(text, needles) {
  let masked = text;
  for (const needle of needles) {
    if (!needle) continue;
    let i = masked.indexOf(needle);
    while (i !== -1) {
      masked = masked.slice(0, i) + ' '.repeat(needle.length) + masked.slice(i + needle.length);
      i = masked.indexOf(needle, i + needle.length);
    }
  }
  return masked;
}

function findAll(text, token, limit = 5) {
  const out = [];
  let i = text.indexOf(token);
  while (i !== -1 && out.length < limit) {
    out.push(i);
    i = text.indexOf(token, i + token.length);
  }
  return out;
}

function collectExternalUrls(value, found = new Set()) {
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

function unescapeHtml(text) {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, (m, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[name]);
}

test('delivery: dist/prospera-prototype.html', async (t) => {
  if (!fs.existsSync(DIST_HTML)) {
    t.skip('dist/prospera-prototype.html not built yet (run: node build/build.mjs --client prospera)');
    return;
  }
  const buf = fs.readFileSync(DIST_HTML);
  const html = buf.toString('utf8');
  let pack = null;
  let packText = null;
  let allowedUrls = [];

  await t.test('is one self-contained file: no linked styles, scripts, images or fonts', () => {
    assert.doesNotMatch(html, /<link\b/i, 'no <link> elements');
    const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
    assert.equal(scriptTags.length, 2, `exactly two <script> elements (pack + bundle), found ${scriptTags.length}`);
    for (const tag of scriptTags) assert.doesNotMatch(tag, /\ssrc\s*=/i, `script element must not load a file: ${tag}`);
    assert.equal((html.match(/<\/script/gi) || []).length, 2, 'exactly two </script');
    assert.doesNotMatch(html, /<(img|source|video|audio|object|embed|iframe|frame)\b/i, 'no external media elements');
    const urlRefs = [...html.matchAll(/(?<![\w$.])url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1].trim());
    const external = urlRefs.filter((u) => !/^(data:|#)/i.test(u));
    assert.deepEqual(external, [], 'css url() may only reference data: URIs or fragments');
    assert.match(html, /^<!doctype html>/i, 'starts with the HTML5 doctype');
    assert.match(html, /<html lang="es">/, 'lang="es"');
    assert.match(html, /<meta charset="utf-8">/);
  });

  await t.test('size is within the 5 MiB budget', () => {
    assert.ok(buf.length <= BUDGET_BYTES, `${buf.length} bytes > ${BUDGET_BYTES}`);
    assert.ok(buf.length > 10000, 'the artifact is not a stub');
  });

  await t.test('build report exists and its sha256/bytes match the file', () => {
    assert.ok(fs.existsSync(DIST_REPORT), 'dist/prospera-build.json must accompany the artifact (never edit or hand-write dist)');
    const report = JSON.parse(fs.readFileSync(DIST_REPORT, 'utf8'));
    assert.equal(report.clientId, 'prospera');
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.specVersion, '1.0');
    assert.ok(report.sourceRevision === null || /^[0-9a-f]{40}$/.test(report.sourceRevision), 'sourceRevision is a git sha or null');
    assert.match(report.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'generatedAt is ISO');
    assert.ok(Array.isArray(report.inputs) && report.inputs.length > 0, 'inputs listed');
    for (const input of report.inputs) {
      assert.equal(typeof input.path, 'string');
      assert.match(input.sha256, /^[0-9a-f]{64}$/, `${input.path}: sha256`);
    }
    assert.ok(Array.isArray(report.checks) && report.checks.length > 0, 'checks listed');
    const failed = report.checks.filter((c) => !c.ok);
    assert.deepEqual(failed, [], 'every build check passed');
    assert.equal(report.bytes, buf.length, 'report.bytes equals the file size');
    assert.equal(report.sha256, sha256(buf), 'report.sha256 equals the file hash (dist was not edited after the build)');
  });

  await t.test('window title and noscript text', () => {
    const m = /<title>([^<]*)<\/title>/.exec(html);
    assert.ok(m, '<title> present');
    assert.equal(unescapeHtml(m[1]), WINDOW_TITLE);
    const n = /<noscript>([\s\S]*?)<\/noscript>/.exec(html);
    assert.ok(n, '<noscript> present');
    assert.match(unescapeHtml(n[1]), /^Este prototipo necesita JavaScript para navegar\. Abre el archivo en un navegador con JavaScript habilitado\.?$/);
    for (const placeholder of ['/*PRIMUS:STYLES*/', '<!--PRIMUS:NOSCRIPT-->', '/*PRIMUS:PACK*/', '/*PRIMUS:SCRIPTS*/']) {
      assert.equal(html.includes(placeholder), false, `build placeholder ${placeholder} survived`);
    }
  });

  await t.test('embedded pack parses back from the script element and is safely escaped', () => {
    const m = PACK_SCRIPT_RE.exec(html);
    assert.ok(m, 'pack script element present');
    packText = m[1];
    assert.doesNotMatch(packText, /[<>&\u2028\u2029]/, 'pack JSON contains no raw < > & U+2028 U+2029');
    pack = JSON.parse(packText);
    assert.equal(pack.schemaVersion, 1);
    assert.equal(pack.client && pack.client.id, 'prospera');
    assert.equal(pack.presentation && pack.presentation.windowTitle, WINDOW_TITLE);
    assert.deepEqual(pack.presentation.tabs.map((tab) => tab.label), TAB_LABELS);
    assert.deepEqual(pack.presentation.tabs.map((tab) => tab.id), ['architecture', 'scope', 'methodologies', 'web', 'desktop']);
    allowedUrls = collectExternalUrls(pack);
    for (const url of allowedUrls) assert.match(url, /^https:\/\/[^\s<>"'\\]+$/, `externalReference.url is a plain https url: ${url}`);
  });

  await t.test('contains the five tab labels', () => {
    for (const label of TAB_LABELS) assert.ok(html.includes(label), `missing tab label «${label}»`);
    for (const id of ['architecture', 'scope', 'methodologies', 'web', 'desktop']) {
      assert.ok(html.includes(`id="panel-${id}"`), `missing tabpanel section panel-${id}`);
    }
    for (const id of ['primus-app', 'primus-header', 'primus-tabs', 'primus-main', 'primus-overlays', 'primus-toasts', 'primus-live']) {
      assert.ok(html.includes(`id="${id}"`), `missing landmark #${id}`);
    }
  });

  await t.test('no forbidden tokens (network, storage, dynamic code, private paths)', () => {
    const masked = maskAll(html, [...XML_NAMESPACES, ...allowedUrls]);
    const findings = [];
    for (const token of [...FORBIDDEN_TOKENS, 'https://']) {
      for (const i of findAll(masked, token)) findings.push(`"${token}" at line ${lineOf(html, i)}: …${snippet(html, i)}…`);
    }
    const re = new RegExp(DRIVE_PATH_RE.source, 'g');
    let m;
    while ((m = re.exec(masked)) !== null && findings.length < 40) {
      findings.push(`drive path at line ${lineOf(html, m.index)}: …${snippet(html, m.index)}…`);
    }
    assert.deepEqual(findings, []);
    assert.equal(html.includes('/home/'), false);
    assert.doesNotMatch(html, /file:\/\//, 'no file:// urls');
    assert.doesNotMatch(html, /javascript:/i, 'no javascript: urls');
  });

  await t.test('forbidden token list matches build/build.mjs', async () => {
    const build = await import(pathToFileURL(BUILD_MJS).href);
    assert.deepEqual([...build.FORBIDDEN_TOKENS], FORBIDDEN_TOKENS);
    assert.deepEqual([...build.XML_NAMESPACE_ALLOWLIST], XML_NAMESPACES);
  });

  await t.test('no source-document leftovers: machine names, office/diagram file names, diagram UUIDs', () => {
    for (const re of MACHINE_NAME_RES) {
      const m = re.exec(html);
      assert.equal(m, null, m ? `machine name "${m[0]}" at line ${lineOf(html, m.index)}: …${snippet(html, m.index)}…` : '');
    }
    const files = [...html.matchAll(SOURCE_FILE_RE)].map((m) => `"${m[0]}" at line ${lineOf(html, m.index)}: …${snippet(html, m.index)}…`);
    assert.deepEqual(files, [], 'no .pptx/.docx/.diag file names');
    const uuids = [...html.matchAll(UUID_RE)].map((m) => `${m[0]} at line ${lineOf(html, m.index)}`);
    assert.deepEqual(uuids, [], 'no UUIDs of the source diagrams');
  });

  await t.test('exactly one client.id in the embedded pack', () => {
    assert.ok(pack, 'pack parsed');
    const ids = new Set();
    const walk = (v) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') {
        if (v.client && typeof v.client === 'object' && typeof v.client.id === 'string') ids.add(v.client.id);
        Object.values(v).forEach(walk);
      }
    };
    walk(pack);
    assert.deepEqual([...ids], ['prospera'], 'exactly one client.id');
  });
});
