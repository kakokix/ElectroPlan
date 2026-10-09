const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const url = 'file://' + path.resolve(__dirname, '../dist/test_fonts.html');
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => errs.push('PC ' + e.message));
  await pg.goto(url); await pg.waitForTimeout(800);
  // ajoute tous les nouveaux circuits par le catalogue
  for (const t of ['pm', 'mn', 'ex', 'ch', 'so']) {
    await pg.click('#btn-add'); await pg.waitForTimeout(150);
    await pg.click('[data-add="' + t + '"]'); await pg.waitForTimeout(250);
  }
  await pg.screenshot({ path: 'tests/all_catalog_panel.png' });
  for (const tab of ['box', 'tab', 'uni', 'list', 'labels', 'steps', 'quiz', 'parts']) {
    await pg.click('[data-tab="' + tab + '"]');
    await pg.waitForTimeout(tab === 'box' ? 4000 : 500);
    await pg.screenshot({ path: 'tests/all_' + tab + '.png' });
  }
  const warn = await pg.$$eval('.alert', els => els.map(e => e.textContent.slice(0, 160)));
  console.log('alertes :\n' + warn.join('\n'));
  // logement selon la norme, T4 avec chauffage
  await pg.click('#btn-gen'); await pg.waitForTimeout(200);
  await pg.click('[data-gtype="T4"]'); await pg.waitForTimeout(100);
  await pg.check('[data-gchk="chauf"]'); await pg.waitForTimeout(150);
  const sum = await pg.$eval('#gen-sum', e => e.textContent);
  const notes = await pg.$$eval('#gen-notes li', els => els.map(e => e.textContent));
  console.log('T4 :', sum, notes);
  await pg.click('#gen-go'); await pg.waitForTimeout(600);
  await pg.click('[data-tab="tab"]'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: 'tests/all_t4_tableau.png' });
  const warn2 = await pg.$$eval('.alert', els => els.map(e => e.textContent.slice(0, 200)));
  console.log('alertes T4 :\n' + warn2.join('\n'));
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
