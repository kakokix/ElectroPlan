const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await pg.goto('file://' + path.resolve(__dirname, '../dist/test_fonts.html')); await pg.waitForTimeout(700);
  await pg.click('#tab-parts'); await pg.fill('#pq', '412501'); await pg.waitForTimeout(600);
  await pg.evaluate(() => document.querySelector('#p-fiche').scrollTop = 420); await pg.waitForTimeout(100);
  await pg.screenshot({ path: 'fiche_km.png', clip: { x: 800, y: 230, width: 640, height: 770 } });
  await pg.fill('#pq', 'wago 221-415'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: 'fiche_wago.png', clip: { x: 400, y: 230, width: 1040, height: 770 } });
  await b.close();
})();
