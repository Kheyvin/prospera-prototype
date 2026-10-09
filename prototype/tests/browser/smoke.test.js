'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { launch, openPrototype, distPath } = require('./launch.js');

test('AT-01 smoke: the built artifact opens offline with zero console errors and no external requests', async (t) => {
  if (!fs.existsSync(distPath())) {
    t.skip('dist/prospera-prototype.html not built yet (run: node build/build.mjs --client prospera)');
    return;
  }
  const launched = await launch();
  if (!launched) {
    t.skip('No local playwright-core/Chromium found; browser tests skipped');
    return;
  }
  const { browser } = launched;
  try {
    const { page, consoleErrors, externalRequests, context } = await openPrototype(browser);
    const title = await page.title();
    assert.equal(title, 'PRIMUS para Próspera · Prototipo');
    const tabs = await page.locator('[role="tab"]').allTextContents();
    assert.deepEqual(
      tabs.map((s) => s.trim()),
      ['Arquitectura de la solución', 'Alcance del proyecto', 'Metodologías aplicadas', 'Prototipo web', 'Prototipo de escritorio']
    );
    const selected = await page.locator('[role="tab"][aria-selected="true"]').textContent();
    assert.equal(selected.trim(), 'Arquitectura de la solución');
    assert.deepEqual(consoleErrors, [], 'console errors: ' + consoleErrors.join(' | '));
    assert.deepEqual(externalRequests, [], 'external requests: ' + externalRequests.join(' | '));
    await context.close();
  } finally {
    await browser.close();
  }
});
