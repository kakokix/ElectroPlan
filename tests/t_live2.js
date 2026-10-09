// recherche en direct : repli quand sample.json n'existe pas (appli plus ancienne) ou renvoie un JSON entouré de texte
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const fake = require('./fakeclaude');
const ANSWER = { trouve: true, certitude: 'haute', marque: 'Hager', gamme: '', reference: 'EPN999', nom: 'Télérupteur test', type: 'tl',
  fonctionnement: 'Test.', bornes: [{ repere: 'A1', role: 'bobine' }], cablage: ['Coupe le courant.'], reglages: '', caracteristiques: '', attention: '' };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const mode of ['removed', 'nojson', 'invalid', 'garbage']) {
    const errs = [];
    const pg = await b.newPage({ viewport: { width: 1360, height: 860 } });
    pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(fake);
    await pg.addInitScript(([mode, ans]) => {
      const orig = window.claude.use;
      window.claude = { use: (n) => orig(n).then((ns) => {
        if (n !== 'sample') return ns;
        const txt = mode === 'garbage' ? 'Je ne sais pas.' : 'Voici la fiche demandée :\n' + JSON.stringify(ans) + '\nVérifie la notice.';
        const s = function (p, o) { return Promise.resolve({ text: txt, truncated: false }); };
        if (mode === 'removed' || mode === 'garbage') s.json = () => Promise.reject({ code: 'capability_removed' });
        if (mode === 'invalid') s.json = () => Promise.reject({ code: 'invalid_json', text: txt });
        return s;
      }) };
    }, [mode, ANSWER]);
    await pg.goto('file://' + path.resolve(__dirname, '../dist/test_fonts.html')); await pg.waitForTimeout(900);
    await pg.click('#tab-parts');
    await pg.fill('#pq', 'EPN999'); await pg.waitForTimeout(400);
    await pg.click('#p-live'); await pg.waitForTimeout(500);
    const title = await pg.$eval('#p-fiche', el => (el.querySelector('h2') || el.querySelector('.p-empty b') || {}).textContent || '');
    const msg = await pg.$eval('#p-fiche', el => (el.querySelector('.p-empty span') || {}).textContent || '');
    console.log(mode.padEnd(8), '→', title, msg ? '| ' + msg : '', errs.length ? '| ERREURS ' + errs.join(' ; ') : '');
    await pg.close();
  }
  await b.close();
})();
