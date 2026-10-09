// version web (hors de Claude) : page complète, rien chargé chez un tiers, téléchargements par le navigateur (PDF compris),
// liste de courses, mentions légales, design clair même si le téléphone est en mode sombre
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  const errs = [], outside = [];
  const watch = (pg, tag) => {
    pg.on('pageerror', e => errs.push(tag + ' ' + e.message));
    pg.on('request', r => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u)) outside.push(tag + ' ' + u); });
  };
  // ordinateur, navigateur en mode sombre : le site doit rester clair
  const ctx = await b.newContext({ viewport: { width: 1360, height: 860 }, acceptDownloads: true, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  watch(pg, 'PC');
  await pg.goto(url); await pg.waitForTimeout(1200);
  console.log('titre', JSON.stringify(await pg.title()), '| lang', await pg.evaluate(() => document.documentElement.lang), '| ui', await pg.evaluate(() => document.documentElement.dataset.ui));
  console.log('mode sombre du navigateur → fond', await pg.evaluate(() => getComputedStyle(document.body).backgroundColor), '| encre', await pg.evaluate(() => getComputedStyle(document.body).color));
  console.log('polices du site', await pg.evaluate(() => document.fonts.ready.then(() => ['DM Sans', 'Space Grotesk'].map(f => f + ' ' + document.fonts.check('16px "' + f + '"')).join(', '))));
  const dl = async (sel, p) => {
    p = p || pg;
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.click(sel)]);
    const f = path.join(__dirname, 'out', d.suggestedFilename()); await d.saveAs(f);
    return [d.suggestedFilename() + ' (' + fs.statSync(f).size + ' octets)', f];
  };
  console.log('CSV', (await dl('#exportctl [data-exp="csv"]'))[0]);
  await pg.click('#tab-tab'); await pg.waitForTimeout(500);
  console.log('SVG', (await dl('#exportctl [data-exp="svg"]'))[0]);
  console.log('PNG', (await dl('#exportctl [data-exp="png"]'))[0]);
  await pg.click('#tab-box'); await pg.waitForTimeout(3000);
  console.log('PNG boîte', (await dl('#exportctl [data-exp="png"]'))[0]);
  // PDF : le module PDF est servi par le site
  console.log('module PDF chargé', await pg.evaluate(() => typeof (window.jspdf && window.jspdf.jsPDF)));
  const pdf = await dl('#exportctl [data-exp="pdf"]');
  const raw = fs.readFileSync(pdf[1]).toString('latin1');
  console.log('PDF', pdf[0], '| pages', (raw.match(/\/Type \/Page\b/g) || []).length, '| liste de courses dedans', /Liste de courses/.test(raw));
  // liste de courses : on choisit les marques, puis on télécharge la liste
  await pg.click('#tab-list'); await pg.waitForTimeout(400);
  console.log('liste de courses : question des marques', JSON.stringify(await pg.textContent('.shop-ch h2')));
  await pg.selectOption('[data-shop="tab"]', 'Legrand'); await pg.waitForTimeout(300);
  await pg.selectOption('[data-shop="mur"]', 'Legrand|dooxie'); await pg.waitForTimeout(300);
  console.log('après choix', JSON.stringify(await pg.textContent('.shop-ch h2')), '| références choisies', await pg.$$eval('.shop-sub .mono', a => a.length), '| articles', await pg.$$eval('.shop-row', a => a.length));
  const sc = await dl('#shop-csv');
  console.log('CSV liste de courses', sc[0], '|', fs.readFileSync(sc[1], 'utf8').split('\r\n')[1]);
  // mentions légales : depuis le pied de page, et par le lien #mentions-legales
  await pg.click('.foot [data-do="legal"]'); await pg.waitForTimeout(300);
  console.log('mentions légales', await pg.isVisible('#ov-legal'), '| sections', await pg.$$eval('#ov-legal section h3', a => a.map(x => x.textContent).join(', ')), '| note Claude cachée', await pg.isHidden('#legal-claude'));
  await pg.screenshot({ path: path.join(__dirname, 'out', 'web_legal.png') });
  await pg.keyboard.press('Escape');
  const p2 = await ctx.newPage(); watch(p2, 'PC2');
  await p2.goto(url + '#mentions-legales'); await p2.waitForTimeout(800);
  console.log('lien #mentions-legales ouvre la fenêtre', await p2.isVisible('#ov-legal'));
  await p2.close();
  // appareils : pas de recherche en direct hors de Claude
  await pg.click('#tab-parts'); await pg.fill('#pq', 'XYZ1234'); await pg.waitForTimeout(500);
  console.log('carte « pas trouvé »', JSON.stringify(await pg.textContent('.p-live b')), '| lien', await pg.getAttribute('.p-live a', 'href'), '| bouton direct', await pg.$('#p-live') ? 'oui' : 'non');
  await pg.screenshot({ path: path.join(__dirname, 'out', 'web_parts.png') });
  await pg.fill('#pq', '412408'); await pg.waitForTimeout(500);
  console.log('fiche 412408', JSON.stringify(await pg.textContent('#p-fiche h2')));
  // téléphone en mode sombre
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, colorScheme: 'dark' });
  const mp = await m.newPage();
  watch(mp, 'M');
  await mp.goto(url); await mp.waitForTimeout(1200);
  await mp.click('.mnav [data-view="plans"]'); await mp.waitForTimeout(800);
  console.log('téléphone : bouton télécharger', await mp.isVisible('#m-dl-btn'));
  await mp.click('#m-dl-btn'); await mp.waitForTimeout(400);
  const [d2] = await Promise.all([mp.waitForEvent('download', { timeout: 15000 }), mp.click('#ov-dl [data-exp="csv"]')]);
  console.log('téléphone CSV', d2.suggestedFilename());
  await mp.screenshot({ path: path.join(__dirname, 'out', 'web_mobile.png') });
  await mp.click('.mnav [data-view="list"]'); await mp.waitForTimeout(500);
  await mp.screenshot({ path: path.join(__dirname, 'out', 'web_mobile_shop.png') });
  console.log('téléphone : fond en mode sombre', await mp.evaluate(() => getComputedStyle(document.body).backgroundColor), '| largeur', await mp.evaluate(() => document.documentElement.scrollWidth));
  await b.close();
  console.log('requêtes vers l’extérieur :', outside.length ? outside.join(' ; ') : 'aucune');
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
