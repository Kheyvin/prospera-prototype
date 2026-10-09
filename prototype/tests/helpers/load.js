'use strict';
/* Node test loader: evaluates the manifest's classic scripts (except main.js) in this
 * context so that core/ds/feature modules can be unit-tested without a browser.
 * See CONTRACTS.md §1. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');

function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'manifest.json'), 'utf8'));
}

function loadRuntime(options = {}) {
  const manifest = readManifest();
  const skip = new Set(options.skip || ['src/main.js']);
  // Fresh registry for every call so tests never share module instances.
  delete globalThis.Primus;
  const preludePath = path.join(ROOT, 'src', 'prelude.js');
  vm.runInThisContext(fs.readFileSync(preludePath, 'utf8'), { filename: preludePath });
  for (const rel of manifest.js) {
    if (rel === 'src/prelude.js' || skip.has(rel)) continue;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      if (options.allowMissing) continue;
      throw new Error('Manifest file missing: ' + rel);
    }
    vm.runInThisContext(fs.readFileSync(abs, 'utf8'), { filename: abs });
  }
  const Primus = globalThis.Primus;

  function loadPackFiles(clientId = 'prospera') {
    const client = manifest.clients[clientId];
    if (!client) throw new Error('Unknown client ' + clientId);
    return client.pack.map((rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')));
  }

  function loadPack(clientId = 'prospera') {
    const packCore = Primus.require('core/pack');
    const merged = packCore.mergePackFiles(loadPackFiles(clientId));
    return packCore.resolvePack(merged);
  }

  function loadRawPack(clientId = 'prospera') {
    const packCore = Primus.require('core/pack');
    return packCore.mergePackFiles(loadPackFiles(clientId));
  }

  return {
    Primus,
    manifest,
    require: Primus.require,
    loadPackFiles,
    loadRawPack,
    loadPack,
    ROOT
  };
}

module.exports = { loadRuntime, readManifest, ROOT };
