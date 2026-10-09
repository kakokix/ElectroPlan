const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file://' + path.resolve(__dirname, '../dist/test_fonts.html');
  for (const w of [1920, 1600, 1440, 1366, 1280, 1180, 1024, 900, 830]) {
    const pg = await b.newPage({ viewport: { width: w, height: 800 } });
    await pg.addInitScript(() => localStorage.setItem('cabloplan:ui', 'pc'));
    await pg.goto(url); await pg.waitForTimeout(500);
    const r = await pg.evaluate(() => { const t = document.querySelector('.top'); const tabs = document.querySelector('.tabs'); return { h: Math.round(t.getBoundingClientRect().height), tabsOver: tabs.scrollWidth > tabs.clientWidth + 1, cls: tabs.className, sw: document.documentElement.scrollWidth }; });
    console.log(w, JSON.stringify(r));
    if (w === 1280 || w === 1024) await pg.screenshot({ path: 'tests/hdr_' + w + '.png', clip: { x: 0, y: 0, width: w, height: 120 } });
    await pg.close();
  }
  await b.close();
})();
