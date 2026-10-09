// version web (hors de Claude) : page complète, téléchargements par le navigateur, recherche sans Claude
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  const errs = [];
  // ordinateur
  const ctx = await b.newContext({ viewport: { width: 1360, height: 860 }, acceptDownloads: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('PC ' + e.message));
  await pg.goto(url); await pg.waitForTimeout(1200);
  console.log('titre', JSON.stringify(await pg.title()), '| lang', await pg.evaluate(() => document.documentElement.lang), '| ui', await pg.evaluate(() => document.documentElement.dataset.ui));
  console.log('boutons de téléchargement visibles', await pg.isVisible('#exportctl'));
  const dl = async (sel) => {
    const [d] = await Promise.all([pg.waitForEvent('download', { timeout: 15000 }), pg.click(sel)]);
    const f = path.join(__dirname, 'out', d.suggestedFilename()); await d.saveAs(f);
    return d.suggestedFilename() + ' (' + require('fs').statSync(f).size + ' octets)';
  };
  console.log('CSV', await dl('#exportctl [data-exp="csv"]'));
  await pg.click('#tab-tab'); await pg.waitForTimeout(500);
  console.log('SVG', await dl('#exportctl [data-exp="svg"]'));
  console.log('PNG', await dl('#exportctl [data-exp="png"]'));
  await pg.click('#tab-box'); await pg.waitForTimeout(3000);
  console.log('PNG boîte', await dl('#exportctl [data-exp="png"]'));
  // PDF : jsPDF vient d'un CDN (bloqué dans le bac à sable) → message propre, pas de plantage
  await pg.click('#exportctl [data-exp="pdf"]'); await pg.waitForTimeout(4000);
  console.log('PDF', await pg.evaluate(() => typeof window.jspdf), '→', await pg.textContent('#toast'));
  // appareils : pas de recherche en direct hors de Claude
  await pg.click('#tab-parts'); await pg.fill('#pq', 'XYZ1234'); await pg.waitForTimeout(500);
  console.log('carte « pas trouvé »', JSON.stringify(await pg.textContent('.p-live b')), '| lien', await pg.getAttribute('.p-live a', 'href'), '| bouton direct', await pg.$('#p-live') ? 'oui' : 'non');
  await pg.screenshot({ path: path.join(__dirname, 'out', 'web_parts.png') });
  await pg.fill('#pq', '412408'); await pg.waitForTimeout(500);
  console.log('fiche 412408', JSON.stringify(await pg.textContent('#p-fiche h2')));
  // téléphone
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const mp = await m.newPage();
  mp.on('pageerror', e => errs.push('M ' + e.message));
  await mp.goto(url); await mp.waitForTimeout(1200);
  await mp.click('.mnav [data-view="plans"]'); await mp.waitForTimeout(800);
  console.log('téléphone : bouton télécharger', await mp.isVisible('#m-dl-btn'));
  await mp.click('#m-dl-btn'); await mp.waitForTimeout(400);
  const [d2] = await Promise.all([mp.waitForEvent('download', { timeout: 15000 }), mp.click('#ov-dl [data-exp="csv"]')]);
  console.log('téléphone CSV', d2.suggestedFilename());
  await mp.screenshot({ path: path.join(__dirname, 'out', 'web_mobile.png') });
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'aucune erreur JS');
})();
