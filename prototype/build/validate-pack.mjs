#!/usr/bin/env node
/* PRIMUS pack validator CLI (CONTRACTS §2, §4.11, §12; spec §17, FR-029).
 *
 *   node build/validate-pack.mjs --client prospera [--root <dir>] [--allow-missing]
 *
 * Loads the runtime exactly like the build and the Node test loader (prelude + every
 * manifest JS file except main.js in this vm context), merges the client's pack files with
 * core/pack.mergePackFiles and validates the merged object with
 * schemas/pack-validator.validatePack. Prints every error as "path: message" or
 * "Pack OK (<n> entities, <m> relations, ...)".
 *
 * Exit codes: 0 pack valid · 1 pack invalid or unreadable · 2 usage error.
 */
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  ROOT,
  EXIT_OK,
  EXIT_FAIL,
  EXIT_USAGE,
  loadPackForClient,
  packCounts,
  formatError
} from './build.mjs';

const USAGE = `Usage: node build/validate-pack.mjs --client <id> [--root <dir>] [--allow-missing]

  --client <id>     client pack to validate (required; see build/manifest.json clients)
  --root <dir>      project root (default: the folder above build/)
  --allow-missing   tolerate manifest JS files that do not exist yet (parallel development);
                    the validation still needs core/pack and schemas/pack-validator

Exit codes: 0 pack valid · 1 pack invalid · 2 usage error`;

/**
 * Validates one client's pack. Returns { ok, errors: [{path, message}], warnings: string[],
 * counts: string|null, merged }. Throws (with .usage = true) on an unknown client.
 */
export function validateClient({ root = ROOT, clientId, allowMissing = false } = {}) {
  if (!clientId) throw Object.assign(new Error('--client <id> is required'), { usage: true });
  const loaded = loadPackForClient({ root, clientId, allowMissing });
  const errors = [...loaded.errors];
  const warnings = [];
  for (const rel of loaded.runtime.missing) warnings.push(`${rel}: file missing (tolerated by --allow-missing)`);
  for (const rel of loaded.files.missing) warnings.push(`${rel}: pack file missing (tolerated by --allow-missing)`);
  const merged = loaded.merged;
  if (!errors.length && merged) {
    if (merged.schemaVersion !== 1) {
      errors.push({ path: 'schemaVersion', message: `must be 1 (found ${JSON.stringify(merged.schemaVersion)})` });
    }
    const packClientId = merged.client && merged.client.id;
    if (packClientId !== clientId) {
      errors.push({ path: 'client.id', message: `pack belongs to "${packClientId}" but --client is "${clientId}"` });
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: merged && !errors.length ? packCounts(merged) : null,
    merged
  };
}

export function parseCliArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      client: { type: 'string' },
      root: { type: 'string' },
      'allow-missing': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false }
    },
    strict: true,
    allowPositionals: false
  });
  return values;
}

export function runCli(argv = process.argv.slice(2), { stdout = process.stdout, stderr = process.stderr } = {}) {
  let args;
  try {
    args = parseCliArgs(argv);
  } catch (e) {
    stderr.write(`${e.message}\n\n${USAGE}\n`);
    return EXIT_USAGE;
  }
  if (args.help) {
    stdout.write(`${USAGE}\n`);
    return EXIT_OK;
  }
  if (!args.client) {
    stderr.write(`--client <id> is required\n\n${USAGE}\n`);
    return EXIT_USAGE;
  }
  let result;
  try {
    result = validateClient({
      root: args.root ? path.resolve(process.cwd(), args.root) : ROOT,
      clientId: args.client,
      allowMissing: args['allow-missing']
    });
  } catch (e) {
    stderr.write(`validate-pack failed: ${e.message}\n`);
    if (!e.usage && process.env.PRIMUS_BUILD_DEBUG) stderr.write(`${e.stack}\n`);
    return e.usage ? EXIT_USAGE : EXIT_FAIL;
  }
  for (const w of result.warnings) stderr.write(`WARN ${w}\n`);
  if (!result.ok) {
    for (const e of result.errors) stderr.write(`ERROR ${formatError(e)}\n`);
    stderr.write(`Pack INVALID: ${result.errors.length} error(s) in client "${args.client}"\n`);
    return EXIT_FAIL;
  }
  stdout.write(`Pack OK (${result.counts})\n`);
  return EXIT_OK;
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
