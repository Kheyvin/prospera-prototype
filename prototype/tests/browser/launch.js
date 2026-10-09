'use strict';
/* Dev-only browser launcher for interaction tests.
 *
 * The prototype has no runtime or dev dependencies. For browser-driven verification we
 * reuse a playwright-core package and a Chromium build that may already exist on the
 * developer machine (for example the ones cached by the Playwright MCP plugin). Nothing is
 * downloaded or installed. When neither is found, `launch()` returns null and tests skip.
 *
 * Override with PRIMUS_PLAYWRIGHT=<dir of playwright-core> and PRIMUS_CHROMIUM=<chrome.exe>.
 */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..', '..');

function readVersion(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version || '0';
  } catch {
    return null;
  }
}

function findPlaywright() {
  const candidates = [];
  if (process.env.PRIMUS_PLAYWRIGHT) candidates.push(process.env.PRIMUS_PLAYWRIGHT);
  try {
    candidates.push(path.dirname(require.resolve('playwright-core/package.json')));
  } catch {
    /* not installed locally */
  }
  const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
  if (process.env.LOCALAPPDATA && fs.existsSync(npxCache)) {
    for (const entry of fs.readdirSync(npxCache)) {
      const dir = path.join(npxCache, entry, 'node_modules', 'playwright-core');
      if (fs.existsSync(dir)) candidates.push(dir);
    }
  }
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const npxCacheUnix = path.join(home, '.npm', '_npx');
  if (home && fs.existsSync(npxCacheUnix)) {
    for (const entry of fs.readdirSync(npxCacheUnix)) {
      const dir = path.join(npxCacheUnix, entry, 'node_modules', 'playwright-core');
      if (fs.existsSync(dir)) candidates.push(dir);
    }
  }
  const found = candidates
    .map((dir) => ({ dir, version: readVersion(dir) }))
    .filter((c) => c.version);
  // Prefer stable releases over pre-releases, then the highest version string.
  found.sort((a, b) => {
    const pa = a.version.includes('-') ? 1 : 0;
    const pb = b.version.includes('-') ? 1 : 0;
    if (pa !== pb) return pa - pb;
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
  return found[0] || null;
}

function findChromium() {
  if (process.env.PRIMUS_CHROMIUM) return process.env.PRIMUS_CHROMIUM;
  const roots = [];
  if (process.env.LOCALAPPDATA) roots.push(path.join(process.env.LOCALAPPDATA, 'ms-playwright'));
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) roots.push(path.join(home, '.cache', 'ms-playwright'));
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs
      .readdirSync(root)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const d of dirs) {
      const candidates = [
        path.join(root, d, 'chrome-win64', 'chrome.exe'),
        path.join(root, d, 'chrome-linux', 'chrome'),
        path.join(root, d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
      ];
      for (const exe of candidates) if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

function distPath(clientId = 'prospera') {
  return path.join(ROOT, 'dist', `${clientId}-prototype.html`);
}

function distUrl(clientId = 'prospera') {
  return pathToFileURL(distPath(clientId)).href;
}

/** Launches headless Chromium. Returns null when no local Playwright/Chromium is available. */
async function launch(options = {}) {
  const pw = findPlaywright();
  const exe = findChromium();
  if (!pw || !exe) return null;
  const core = require(pw.dir);
  const browser = await core.chromium.launch({ headless: true, executablePath: exe, ...options });
  return { browser, core, playwrightVersion: pw.version, executablePath: exe };
}

/** Opens the built artifact in a fresh context and collects console errors / failed requests. */
async function openPrototype(browser, { viewport = { width: 1440, height: 900 }, reducedMotion = 'reduce', clientId = 'prospera' } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, locale: 'es-PE', timezoneId: 'America/Lima', offline: true });
  const page = await context.newPage();
  const consoleErrors = [];
  const requests = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err && err.message ? err.message : err)));
  page.on('request', (req) => {
    if (!req.url().startsWith('file:')) requests.push(req.url());
  });
  await page.goto(distUrl(clientId));
  await page.waitForSelector('#primus-app', { timeout: 10000 });
  return { context, page, consoleErrors, externalRequests: requests };
}

module.exports = { ROOT, findPlaywright, findChromium, distPath, distUrl, launch, openPrototype };
