// Liste de courses : pour chaque logement et chaque choix de marques, les références proposées doivent être compatibles avec l'article
const fs = require('fs'), vm = require('vm'), path = require('path');
const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let code = '';
for (const f of ['core.js.html', 'db.js.html', 'shop.js.html']) { const h = fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'); let m; while ((m = re.exec(h))) code += m[1] + '\n;\n'; re.lastIndex = 0; }
const ctx = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: () => Date.now() } };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(code + '\n;this.__x = { APPDB, buildModel, sampleProject, generateDwelling, defaultDwellingForm, defaultLengths, shopPlan, shopAuto, shopTabBrands, shopWallRanges, shopTabRanges, shopPoles, shopCurve, shopCal, shopIdType, shopWagoN, shopFam, shopClean };', ctx);
const X = ctx.__x;
let fails = 0, plans = 0, picks = 0;
const bad = (msg) => { if (fails++ < 25) console.log('ÉCHEC', msg); };
const projects = [['exemple', X.sampleProject()]];
['T1', 'T2', 'T3', 'T4', 'T5'].forEach(t => {
  const f = X.defaultDwellingForm(t);
  projects.push([t, X.generateDwelling(f).project]);
  projects.push([t + '+', X.generateDwelling(Object.assign({}, f, { chauf: true, vr: 3, garage: true, ext: true, cellier: true, cong: true, sl: true })).project]);
});
const brands = X.shopTabBrands(), walls = X.shopWallRanges();
const choices = [{}];
brands.forEach((b, i) => {
  choices.push({ tab: b, mur: walls[i % walls.length] });
  X.shopTabRanges(b).forEach((g, j) => choices.push({ tab: b, gamme: g, term: ['', 'vis', 'auto'][j % 3], mur: walls[(i + j + 1) % walls.length], wago: ['221', '2273', '2773'][j % 3], support: ['mac', 'cloison', 'air'][j % 3], color: j % 2 ? '' : 'blanc' }));
});
walls.forEach(w => choices.push({ tab: brands[0], mur: w }));
const missing = {};
projects.forEach(([name, p]) => {
  const model = X.buildModel(p);
  choices.forEach(chIn => {
    const ch = X.shopClean(chIn);
    let P;
    try { P = X.shopPlan(model, p.lengths || X.defaultLengths(true), ch); } catch (e) { bad(name + ' ' + JSON.stringify(chIn) + ' : ' + e.message); return; }
    plans++;
    if (P.asked !== !!(ch.tab && ch.mur)) bad(name + ' asked');
    if (!(P.total * 0.8 >= P.used - 1e-9)) bad(name + ' coffret ' + P.used + ' / ' + P.total);
    P.items.forEach(it => {
      if (!it.skip && !(it.qty > 0)) bad(name + ' quantité ' + it.label + ' = ' + it.qty);
      if (it.sec === 'tab' && it.kind && !ch.tab && (it.pick || !it.warn)) bad(name + ' tableau sans marque : ' + it.label);
      if (it.kind === 'wall' && !ch.mur && it.pick) bad(name + ' appareillage sans gamme : ' + it.label);
      if (it.kind && !it.pick && it.kind !== 'eqp' && it.cands.length) bad(name + ' référence non choisie alors qu’il y en a : ' + it.label);
      if (it.kind && !it.cands.length && it.kind !== 'eqp') { const k = (ch.tab || '-') + ' | ' + it.label.replace(/\d+ (m|A)\b/, '# $1'); missing[k] = (missing[k] || 0) + 1; }
      if (!it.pick) return;
      picks++;
      const r = it.pick.r, w = it.need.want, t = r.name + ' ' + (r.specs || '');
      if (!it.cands.some(c => c.r === r)) bad(name + ' choix hors liste ' + r.ref);
      if (!X.APPDB.refs.includes(r)) bad(name + ' référence inconnue ' + r.ref);
      switch (it.kind) {
        case 'dj': if (r.type !== 'dj' || r.brand !== ch.tab || X.shopPoles(r) !== '1P+N' || X.shopCal(r) !== w.cal || (X.shopCurve(r) && X.shopCurve(r) !== 'C')) bad(name + ' disjoncteur ' + r.ref + ' pour ' + it.label); break;
        case 'id': {
          const ok = { AC: ['AC', 'A', 'F'], A: ['A', 'F'], F: ['F'] }[w.typ];
          if (r.type !== 'id' || r.brand !== ch.tab || X.shopCal(r) < w.cal || !ok.includes(X.shopIdType(r)) || !/30\s?mA/.test(t) || /300\s?mA|400 V|t[ée]trapolaire/.test(t)) bad(name + ' différentiel ' + r.ref + ' pour ' + it.label);
          break;
        }
        case 'peigne': if (r.type !== 'peigne' || r.brand !== ch.tab || /vertical|t[ée]trapolaire/i.test(t)) bad(name + ' peigne ' + r.ref); break;
        case 'tl': if (r.type !== 'tl' || /\b2\s?(F|NO)\b|bipolaire|\b(12|24|48)\s?V\b/i.test(t)) bad(name + ' télérupteur ' + r.ref); break;
        case 'km': if (r.type !== 'km' || /\bNF\b|tri|t[ée]tra/i.test(t) || (X.shopCal(r) && X.shopCal(r) < w.cal)) bad(name + ' contacteur ' + r.ref); break;
        case 'son': if (/230 V/.test(t)) bad(name + ' sonnerie 230 V ' + r.ref); break;
        case 'wago': if (!/^w2/.test(r.type) || X.shopWagoN(r.ref, r.name) !== w.n) bad(name + ' borne ' + r.ref + ' pour ' + w.n + ' fils'); break;
        case 'wall':
          if (r.type !== w.type || r.brand + '|' + r.range !== ch.mur) bad(name + ' appareillage ' + r.ref + ' hors gamme');
          if (w.type === 'pc' && /griffe/i.test(t)) bad(name + ' prise à griffes ' + r.ref);
          if (w.fils && /(\d)\s?fils/.test(t) && !/2\s?(ou|\/|et)\s?3\s?fils/.test(t) && Number(/(\d)\s?fils/.exec(t)[1]) !== w.fils) bad(name + ' ' + r.ref + ' : mauvais nombre de fils');
          if (w.a32 && !/32\s?A/.test(t)) bad(name + ' sortie de câble 32 A ' + r.ref);
          break;
        case 'bat': if (r.type !== 'bat' || /double|triple|quadruple|lot/i.test(t)) bad(name + ' boîte ' + r.ref); break;
        case 'dclbox': if (r.type !== 'dcl' || !/DCL/.test(t)) bad(name + ' boîte DCL ' + r.ref); break;
        case 'fil': if (!/H07V-[UR]/.test(r.name) || r.name.indexOf(String(w.sec).replace('.', ',') + ' mm²') < 0) bad(name + ' fil ' + r.ref + ' pour ' + it.label); break;
        case 'gaine': if (!new RegExp('Ø' + w.d + '\\b').test(r.name)) bad(name + ' gaine ' + r.ref + ' pour Ø' + w.d); break;
      }
    });
  });
});
console.log(plans + ' listes calculées (' + projects.length + ' logements × ' + choices.length + ' choix de marques), ' + picks + ' références proposées');
const miss = Object.keys(missing).sort((a, b) => missing[b] - missing[a]);
console.log('articles sans référence dans la base (marque | article) : ' + miss.length + (miss.length ? ' — ' + miss.slice(0, 12).join(' ; ') : ''));
console.log(fails ? fails + ' ÉCHEC(S)' : 'liste de courses ok');
if (fails) process.exitCode = 1;
