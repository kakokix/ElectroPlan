// onglet Matériel : liste de courses (choix des marques, références compatibles, fiche), fils et longueurs ; mentions légales
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
  await pg.click('#tab-list'); await pg.waitForTimeout(400);
  console.log('onglet', JSON.stringify(await pg.textContent('#tab-list')), '| lien', await pg.evaluate(() => location.hash), '| vue', await pg.getAttribute('[data-matv="shop"]', 'aria-selected'));
  console.log('avant choix : articles à choisir', await pg.$$eval('.shop-row.miss', a => a.length), '| références', await pg.$$eval('.shop-sub', a => a.length));
  await pg.screenshot({ path: 'ui_shop_ask.png' });
  await pg.click('#shop-auto'); await pg.waitForTimeout(400);
  console.log('choisir pour moi →', await pg.$eval('[data-shop="tab"]', s => s.value), '/', await pg.$eval('[data-shop="mur"]', s => s.value), '| toast', JSON.stringify(await pg.textContent('#toast')));
  await pg.screenshot({ path: 'ui_shop_auto.png' });
  await pg.click('.shop-chd > summary'); await pg.waitForTimeout(200);
  await pg.selectOption('[data-shop="tab"]', 'Hager'); await pg.waitForTimeout(300);
  await pg.selectOption('[data-shop="mur"]', 'Legrand|Céliane'); await pg.waitForTimeout(300);
  console.log('Hager : peigne', JSON.stringify(await pg.$$eval('.shop-row', rows => rows.filter(r => /Barre|Peigne/.test(r.textContent)).map(r => r.querySelector('.shop-l').textContent))));
  // changer une référence à la main, puis revenir aux conseillées
  const sel = await pg.$('[data-pick^="dj-"]');
  const opts = await sel.$$eval('option', o => o.map(x => x.value));
  await sel.selectOption(opts[opts.length - 1]); await pg.waitForTimeout(300);
  console.log('choix à la main gardé', await pg.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('cabloplan:draft')).shop.picks)));
  await pg.click('#shop-reset'); await pg.waitForTimeout(300);
  console.log('après « remettre »', await pg.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('cabloplan:draft')).shop.picks)));
  await pg.screenshot({ path: 'ui_shop_hager.png' });
  await pg.screenshot({ path: 'ui_shop_full.png', fullPage: false });
  // bas de la liste : compatibilité et règles
  await pg.click('.shop-rules summary');
  await pg.$eval('.shop-compat', el => el.scrollIntoView());
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: 'ui_shop_compat.png' });
  // voir la fiche d'un article
  const ref = await pg.textContent('.shop-row .shop-sub .mono');
  await pg.click('.shop-row [data-shopref]'); await pg.waitForTimeout(400);
  console.log('fiche ouverte depuis la liste', ref, '→', JSON.stringify(await pg.textContent('#p-fiche .f-sub')), '| onglet', await pg.evaluate(() => location.hash));
  // fils et longueurs
  await pg.click('#tab-list'); await pg.waitForTimeout(300);
  await pg.click('[data-matv="fils"]'); await pg.waitForTimeout(300);
  console.log('fils et longueurs', await pg.$$eval('.lists h2', a => a.map(x => x.textContent).join(' | ')));
  await pg.screenshot({ path: 'ui_shop_fils.png' });
  await pg.close();
  // ancien lien #fils
  pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  pg.on('pageerror', e => errs.push('PC2 ' + e.message));
  await pg.goto(url + '#fils'); await pg.waitForTimeout(600);
  console.log('ancien lien #fils →', await pg.getAttribute('#tab-list', 'aria-selected'), await pg.getAttribute('[data-matv="fils"]', 'aria-selected'));
  await pg.close();
  // téléphone
  pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  pg.on('pageerror', e => errs.push('M ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('M console ' + m.text()); });
  await pg.goto(url); await pg.waitForTimeout(800);
  await pg.click('.mnav [data-view="list"]'); await pg.waitForTimeout(400);
  console.log('téléphone : titre', JSON.stringify(await pg.textContent('#mview')), '| icône', await pg.getAttribute('.mnav [data-view="list"] use', 'href'));
  await pg.screenshot({ path: 'ui_m_shop_ask.png' });
  await pg.selectOption('[data-shop="tab"]', 'Schneider Electric'); await pg.waitForTimeout(300);
  await pg.selectOption('[data-shop="mur"]', 'Schneider Electric|Unica'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'ui_m_shop.png' });
  await pg.$eval('.shop-sec', el => el.scrollIntoView()); await pg.waitForTimeout(200);
  await pg.screenshot({ path: 'ui_m_shop_list.png' });
  const w = await pg.evaluate(() => [document.documentElement.scrollWidth, document.querySelector('#lists').scrollWidth, document.querySelector('#lists').clientWidth]);
  console.log('téléphone : largeurs', w);
  await pg.click('#btn-menu'); await pg.waitForTimeout(300);
  await pg.click('#ov-menu [data-do="legal"]'); await pg.waitForTimeout(400);
  console.log('téléphone : mentions légales', await pg.isVisible('#ov-legal'));
  await pg.screenshot({ path: 'ui_m_legal.png' });
  await pg.close();
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
