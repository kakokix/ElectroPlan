const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const url = 'file://' + path.resolve(__dirname, '../dist/test_fonts.html');
  // ordinateur
  let pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => errs.push('PC ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('PC console ' + m.text()); });
  await pg.goto(url); await pg.waitForTimeout(800);
  await pg.click('#tab-parts'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'ui_parts_browse.png' });
  await pg.fill('#pq', '412408'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: 'ui_parts_412408.png' });
  await pg.fill('#pq', 'permutateur'); await pg.waitForTimeout(400);
  await pg.click('[data-ptype="perm"]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'ui_parts_perm.png' });
  await pg.fill('#pq', 'XYZ9999'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'ui_parts_none.png' });
  // recherche depuis l'en-tête
  await pg.click('#tab-box'); await pg.waitForTimeout(300);
  await pg.fill('#hq', 'contacteur heures creuses'); await pg.waitForTimeout(400);
  await pg.press('#hq', 'Enter'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'ui_parts_km.png' });
  // ajouter à l'installation
  const before = await pg.evaluate(() => JSON.parse(localStorage.getItem('cabloplan:draft')).circuits.length);
  await pg.click('[data-padd]'); await pg.waitForTimeout(600);
  const after = await pg.evaluate(() => JSON.parse(localStorage.getItem('cabloplan:draft')).circuits.length);
  console.log('circuits avant/après ajout', before, after);
  await pg.close();
  // téléphone
  pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  pg.on('pageerror', e => errs.push('M ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('M console ' + m.text()); });
  await pg.goto(url); await pg.waitForTimeout(800);
  await pg.click('.mnav [data-view="parts"]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'ui_m_parts.png' });
  await pg.fill('#pq', 'A9C30811'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: 'ui_m_search.png' });
  await pg.click('[data-pref]'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'ui_m_fiche.png' });
  await pg.screenshot({ path: 'ui_m_fiche_full.png', fullPage: false });
  const w = await pg.evaluate(() => [document.documentElement.scrollWidth, document.body.scrollWidth]);
  console.log('largeur page mobile', w);
  await pg.close();
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
