'use strict';
/* Contract test for the JSON-in-HTML escaping used by the build (CONTRACTS §10, §12;
 * spec §17 "JSON inline debe escapar `<`, separadores y cierres de script").
 *
 * build/build.mjs is an ES module; the test loads it with a dynamic import so that this
 * CommonJS test file runs on Node 20 without flags. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const BUILD_MJS = path.resolve(__dirname, '..', '..', 'build', 'build.mjs');

async function loadBuild() {
  return import(pathToFileURL(BUILD_MJS).href);
}

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

function assertSafe(escaped) {
  assert.doesNotMatch(escaped, /[<>&]/, 'escaped JSON must not contain raw < > &');
  assert.equal(escaped.includes(LS), false, 'escaped JSON must not contain U+2028');
  assert.equal(escaped.includes(PS), false, 'escaped JSON must not contain U+2029');
  assert.doesNotMatch(escaped, /<\/script/i, 'escaped JSON must never contain "</script"');
  assert.equal(escaped.includes('<!--'), false, 'escaped JSON must never contain "<!--"');
}

test('escapeJsonForHtml is a named export that only accepts the JSON text', async () => {
  const build = await loadBuild();
  assert.equal(typeof build.escapeJsonForHtml, 'function');
  assert.throws(() => build.escapeJsonForHtml({ a: 1 }), TypeError);
  assert.throws(() => build.escapeJsonForHtml(undefined), TypeError);
  assert.equal(build.escapeJsonForHtml(''), '');
});

test('escapeJsonForHtml: "</script>" cannot close the pack script element', async () => {
  const { escapeJsonForHtml } = await loadBuild();
  const value = { name: 'Nota </script><script>alert(1)</script>', upper: '</SCRIPT >' };
  const escaped = escapeJsonForHtml(JSON.stringify(value));
  assertSafe(escaped);
  assert.ok(escaped.includes('\\u003c/script\\u003e'), 'uses lowercase \\u003c / \\u003e escapes');
  assert.deepEqual(JSON.parse(escaped), value, 'the escaped text is still JSON with the same value');
});

test('escapeJsonForHtml: "<!--" cannot start an HTML comment inside the script element', async () => {
  const { escapeJsonForHtml } = await loadBuild();
  const value = { note: '<!-- comentario --> y <script', tags: ['<!--', '-->'] };
  const escaped = escapeJsonForHtml(JSON.stringify(value));
  assertSafe(escaped);
  assert.ok(escaped.includes('\\u003c!--'));
  assert.deepEqual(JSON.parse(escaped), value);
});

test('escapeJsonForHtml: U+2028 and U+2029 become unicode escapes', async () => {
  const { escapeJsonForHtml } = await loadBuild();
  const value = { text: `línea${LS}separada${PS}fin`, keys: { [LS]: 1 } };
  const json = JSON.stringify(value);
  assert.ok(json.includes(LS) && json.includes(PS), 'JSON.stringify leaves the separators raw');
  const escaped = escapeJsonForHtml(json);
  assertSafe(escaped);
  assert.ok(escaped.includes('\\u2028'));
  assert.ok(escaped.includes('\\u2029'));
  assert.deepEqual(JSON.parse(escaped), value);
});

test('escapeJsonForHtml: "&" becomes \\u0026 and entities are not introduced', async () => {
  const { escapeJsonForHtml } = await loadBuild();
  const value = { owner: 'Administración & Finanzas', url: 'https://example.invalid/?a=1&b=2', amp: '&amp;' };
  const escaped = escapeJsonForHtml(JSON.stringify(value));
  assertSafe(escaped);
  assert.ok(escaped.includes('\\u0026'));
  assert.equal(escaped.includes('&amp;'), false, 'HTML entities are not used (they would corrupt the JSON)');
  assert.deepEqual(JSON.parse(escaped), value);
});

test('escapeJsonForHtml keeps accents, quotes, backslashes and existing JSON escapes intact', async () => {
  const { escapeJsonForHtml } = await loadBuild();
  const value = {
    title: 'PRIMUS para Próspera · Prototipo',
    quote: 'Dijo «hola» y "adiós" con \'comillas\'',
    backslash: 'C:\\ruta\\ficticia',
    newline: 'uno\ndos\ttres',
    unicode: 'ñ é ü ¿ ¡ —',
    nested: [null, true, 0, 1.5, { x: [] }]
  };
  const json = JSON.stringify(value);
  const escaped = escapeJsonForHtml(json);
  assertSafe(escaped);
  assert.equal(escaped, json, 'nothing to escape → identical text');
  assert.deepEqual(JSON.parse(escaped), value);
});

test('escapeJsonForHtml is idempotent and serializePackForHtml composes stringify + escape', async () => {
  const { escapeJsonForHtml, serializePackForHtml } = await loadBuild();
  const value = { a: '<b>&</b>', b: `x${LS}y` };
  const once = escapeJsonForHtml(JSON.stringify(value));
  assert.equal(escapeJsonForHtml(once), once);
  assert.equal(serializePackForHtml(value), once);
});

test('escaped pack text embedded in the shell script element parses back to the same value', async () => {
  const { serializePackForHtml } = await loadBuild();
  const value = {
    presentation: { windowTitle: 'PRIMUS para Próspera · Prototipo' },
    attack: '</script><script>document.cookie</script><!-- x --> & ' + LS + PS
  };
  const html = `<script type="application/json" id="primus-pack">${serializePackForHtml(value)}</script>`;
  const scripts = html.match(/<script/gi) || [];
  const closes = html.match(/<\/script/gi) || [];
  assert.equal(scripts.length, 1, 'exactly one <script opening');
  assert.equal(closes.length, 1, 'exactly one </script closing');
  const m = /<script type="application\/json" id="primus-pack">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m);
  assert.deepEqual(JSON.parse(m[1]), value);
});
