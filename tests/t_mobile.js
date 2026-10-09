const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [], url = 'file://' + path.resolve(__dirname, '../dist/test_fonts.html');
  for (const w of [360, 390, 430]) {
    const pg = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    pg.on('pageerror', e => errs.push(w + ' ' + e.message));
    await pg.goto(url); await pg.waitForTimeout(700);
    const res = [];
    for (const v of ['edit', 'plans', 'list', 'steps', 'quiz', 'parts']) {
      await pg.click('.mnav [data-view="' + v + '"]'); await pg.waitForTimeout(v === 'plans' ? 1500 : 350);
      const sw = await pg.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      res.push(v + ':' + sw);
      if (w === 390) await pg.screenshot({ path: 'tests/m_' + v + '.png' });
    }
    // fiche en plein écran
    await pg.fill('#pq', 'permutateur'); await pg.waitForTimeout(400);
    await pg.click('[data-ptype="perm"]'); await pg.waitForTimeout(400);
    if (w === 390) await pg.screenshot({ path: 'tests/m_fiche_perm.png' });
    const sw2 = await pg.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    // nav labels tronqués ?
    const trunc = await pg.$$eval('.mnav .nl', els => els.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
    console.log(w, res.join(' '), 'fiche:' + sw2, 'tronqués:', JSON.stringify(trunc));
    await pg.close();
  }
  // mode sombre, ordinateur
  const pg = await b.newPage({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark' });
  pg.on('pageerror', e => errs.push('dark ' + e.message));
  await pg.goto(url); await pg.waitForTimeout(700);
  await pg.click('#tab-parts'); await pg.fill('#pq', 'contacteur jour nuit'); await pg.waitForTimeout(400);
  await pg.click('[data-pref]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'tests/dark_parts.png' });
  await pg.evaluate(() => document.querySelector('#p-fiche').scrollTop = 600); await pg.waitForTimeout(100);
  await pg.screenshot({ path: 'tests/dark_parts2.png' });
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
