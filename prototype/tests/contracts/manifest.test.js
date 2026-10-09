'use strict';
/* Contract tests for build/manifest.json (CONTRACTS §1, §2, §12; spec §17 "El manifiesto
 * lista exclusivamente código, pack y assets aprobados de esta demo").
 *
 * ALLOW_MISSING=1 turns "every listed file exists" into a todo list (parallel development);
 * every other rule is enforced regardless. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readManifest, ROOT } = require('../helpers/load.js');

const ALLOW_MISSING = process.env.ALLOW_MISSING === '1';
const MANIFEST_REL = 'build/manifest.json';
const PRELUDE = 'src/prelude.js';
const MAIN = 'src/main.js';
const VALIDATOR = 'schemas/pack-validator.js';
const FIVE_MIB = 5 * 1024 * 1024;
const SOURCE_DIRS = ['src', 'schemas'];
const SOURCE_EXT = new Set(['.js', '.css']);

const manifest = readManifest();

function listed(client) {
  return [manifest.shell, ...manifest.css, ...manifest.js, ...client.pack, ...(client.assets || [])];
}

function moduleIdFor(rel) {
  let id = rel.replace(/^src\//, '').replace(/\.js$/, '');
  if (id.endsWith('/index')) id = id.slice(0, -'/index'.length);
  return id;
}

function walk(dir) {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(path.relative(ROOT, full).split(path.sep).join('/'));
    }
  }
  return out.sort();
}

function duplicates(list) {
  const seen = new Set();
  const dupes = new Set();
  for (const item of list) {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  }
  return [...dupes];
}

test('manifest shape follows CONTRACTS §2/§12', () => {
  assert.equal(manifest.schemaVersion, 1, 'schemaVersion must be 1');
  assert.equal(manifest.specVersion, '1.0');
  assert.equal(manifest.shell, 'src/shell.html');
  assert.ok(Array.isArray(manifest.css) && manifest.css.length > 0, 'css list');
  assert.ok(Array.isArray(manifest.js) && manifest.js.length > 0, 'js list');
  assert.equal(manifest.budgetBytes, FIVE_MIB, 'budget is 5 MiB (spec §18)');
  const client = manifest.clients && manifest.clients.prospera;
  assert.ok(client, 'clients.prospera must exist');
  assert.ok(Array.isArray(client.pack) && client.pack.length > 0, 'clients.prospera.pack');
  assert.ok(Array.isArray(client.assets), 'clients.prospera.assets must be an array');
  assert.equal(client.output, 'prospera-prototype.html');
  assert.equal(client.report, 'prospera-build.json');
  assert.deepEqual(Object.keys(manifest.clients), ['prospera'], 'only the Próspera client is registered (no second client)');
  for (const rel of client.pack) assert.match(rel, /^clients\/prospera\/[a-z-]+\.json$/, `pack file path ${rel}`);
});

test('manifest paths are relative, forward-slash and inside the project', () => {
  const all = listed(manifest.clients.prospera);
  for (const rel of all) {
    assert.equal(typeof rel, 'string', `entry ${JSON.stringify(rel)}`);
    assert.doesNotMatch(rel, /\\/, `${rel}: backslashes are not allowed`);
    assert.doesNotMatch(rel, /^([A-Za-z]:|\/)/, `${rel}: must be relative`);
    assert.doesNotMatch(rel, /(^|\/)\.\.(\/|$)/, `${rel}: must not leave the project`);
    assert.doesNotMatch(rel, /^dist\//, `${rel}: dist is generated, never an input`);
  }
  for (const rel of manifest.css) assert.match(rel, /\.css$/, `${rel}: css entries end with .css`);
  for (const rel of manifest.js) assert.match(rel, /\.js$/, `${rel}: js entries end with .js`);
  for (const rel of manifest.js) assert.match(rel, /^(src|schemas)\//, `${rel}: js lives under src/ or schemas/`);
  for (const rel of manifest.css) assert.match(rel, /^src\//, `${rel}: css lives under src/`);
});

test('prelude is first, main.js is last, the validator is bundled', () => {
  assert.equal(manifest.js[0], PRELUDE, 'src/prelude.js must be the first script');
  assert.equal(manifest.js[manifest.js.length - 1], MAIN, 'src/main.js must be the last script');
  assert.equal(manifest.js.indexOf(PRELUDE), manifest.js.lastIndexOf(PRELUDE), 'prelude listed once');
  assert.equal(manifest.js.indexOf(MAIN), manifest.js.lastIndexOf(MAIN), 'main.js listed once');
  assert.ok(manifest.js.includes(VALIDATOR), 'schemas/pack-validator.js is part of the bundle');
  assert.ok(manifest.js.indexOf('src/core/pack.js') > manifest.js.indexOf(PRELUDE));
  assert.ok(manifest.js.indexOf('src/core/store.js') > manifest.js.indexOf('src/core/commands/index.js'), 'store comes after the command registry');
  const features = manifest.js.filter((rel) => rel.startsWith('src/features/'));
  const core = manifest.js.filter((rel) => rel.startsWith('src/core/') || rel.startsWith('src/ds/'));
  assert.ok(Math.min(...features.map((rel) => manifest.js.indexOf(rel))) > Math.max(...core.map((rel) => manifest.js.indexOf(rel))), 'features come after core and ds');
});

test('no duplicate paths and unique module ids', () => {
  const client = manifest.clients.prospera;
  assert.deepEqual(duplicates(listed(client)), [], 'duplicate manifest paths');
  assert.deepEqual(duplicates(manifest.css), [], 'duplicate css');
  assert.deepEqual(duplicates(manifest.js), [], 'duplicate js');
  assert.deepEqual(duplicates(client.pack), [], 'duplicate pack files');
  const ids = manifest.js.filter((rel) => rel !== PRELUDE && rel !== MAIN).map(moduleIdFor);
  assert.deepEqual(duplicates(ids), [], 'duplicate module ids (CONTRACTS §1 id = path without src/ and .js, /index dropped)');
  for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)*$/, `module id ${id} is kebab-case path`);
});

test('every manifest file exists', (t) => {
  const client = manifest.clients.prospera;
  const all = listed(client);
  const missing = all.filter((rel) => !fs.existsSync(path.join(ROOT, rel)));
  if (!missing.length) return;
  if (ALLOW_MISSING) {
    t.diagnostic(`TODO: ${missing.length} of ${all.length} manifest files missing (ALLOW_MISSING=1)`);
    for (const rel of missing) t.diagnostic(`  - ${rel}`);
    t.todo(`${missing.length} manifest file(s) not written yet`);
    return;
  }
  assert.deepEqual(missing, [], `${missing.length} manifest file(s) missing (set ALLOW_MISSING=1 to list them as todo)`);
});

test('every js/css file under src/ and schemas/ is registered in the manifest', () => {
  const registered = new Set([...manifest.css, ...manifest.js]);
  const unregistered = SOURCE_DIRS.flatMap(walk)
    .filter((rel) => SOURCE_EXT.has(path.posix.extname(rel)) && !registered.has(rel));
  assert.deepEqual(unregistered, [], `unregistered source files (CONTRACTS §1: a file that is not in ${MANIFEST_REL} does not exist)`);
});

test('every existing module file registers exactly its manifest module id', () => {
  const problems = [];
  const registrationRe = /^[ \t]*(?:Primus|registry)\.module\(\s*['"]([^'"]+)['"]/gm;
  for (const rel of manifest.js) {
    if (rel === PRELUDE || rel === MAIN) continue;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    const ids = [...text.matchAll(registrationRe)].map((m) => m[1]);
    const expected = moduleIdFor(rel);
    if (!ids.length) problems.push(`${rel}: no Primus.module('${expected}', ...) registration found`);
    else if (ids.length > 1) problems.push(`${rel}: registers ${ids.length} modules (${ids.join(', ')}); exactly one expected`);
    else if (ids[0] !== expected) problems.push(`${rel}: registers '${ids[0]}' but the manifest path implies '${expected}'`);
    if (/^\s*(import\s|export\s)/m.test(text)) problems.push(`${rel}: ES module syntax is not allowed in classic scripts`);
  }
  assert.deepEqual(problems, []);
});

test('prelude and main.js keep their roles', () => {
  const prelude = fs.readFileSync(path.join(ROOT, PRELUDE), 'utf8');
  assert.match(prelude, /root\.Primus\s*=\s*Primus/, 'prelude defines the global Primus registry');
  assert.doesNotMatch(prelude, /Primus\.module\(/, 'prelude registers no module');
  const mainAbs = path.join(ROOT, MAIN);
  if (fs.existsSync(mainAbs)) {
    const main = fs.readFileSync(mainAbs, 'utf8');
    assert.match(main, /primus-pack/, 'main.js reads the embedded pack from #primus-pack');
  }
});

test('existing css files contain no @import and no </style', () => {
  const problems = [];
  for (const rel of manifest.css) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    if (/@import\b/.test(text)) problems.push(`${rel}: @import`);
    if (/<\/style/i.test(text)) problems.push(`${rel}: </style`);
    if (/url\(\s*["']?\s*(https?:)?\/\//i.test(text)) problems.push(`${rel}: remote url()`);
  }
  assert.deepEqual(problems, []);
});
