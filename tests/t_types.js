const E = require('./harness')();
const mk = (t, params, box) => { const c = E.defaultCircuit(t); Object.assign(c.params, params || {}); if (box !== undefined) { c.box = box; c.viaBox = !!box; } return c; };
const variants = [
  ['sa', {}], ['sa', { cde: 'voyt', pcmd: 2, lamps: 1 }], ['sa', { cde: 'var3', lamps: 0, pcmd: 1 }], ['sa', { cde: 'det2' }], ['sa', { cde: 'voyl' }], ['sa', { cde: 'var2' }], ['sa', { cde: 'det3' }],
  ['da', {}], ['ec', {}], ['vv', {}], ['pm', { perms: 1 }], ['pm', { perms: 3, lamps: 2 }], ['tl', {}], ['mn', {}], ['ex', { cde: 'hor' }], ['ex', { cde: 'crep' }],
  ['pc', {}], ['spe', { app: 'sl' }], ['spe', { app: 'cong' }], ['hc', { load: 'ce', cmd: 'edf' }], ['hc', {}], ['vr', { count: 2 }], ['vmc', { vit: '2' }], ['vmc', {}], ['pl', {}],
  ['ch', {}], ['ch', { fp: 'non', pw: '5750', rads: 3 }], ['ch', { pw: '7250' }, 'b1'], ['so', {}], ['so', { bps: 2 }],
];
let errs = 0;
for (const [t, p, box] of variants) {
  try {
    const proj = { name: 'T ' + t, options: { idMode: 'auto', idCal: 40 }, boxes: [{ id: 'b1', name: 'Boîte' }], circuits: [mk(t, p, box), mk('pc', {})] };
    const m = E.buildModel(proj);
    const c = m.circuits.find(x => x.type === t);
    E.renderTableau(m); E.renderUnifilaire(m); E.renderLabels(m); E.buildLists(m); E.buildSteps(m);
    E.computeLengths(m, E.defaultLengths(false));
    const units = E.boxUnits(m);
    units.forEach(u => { E.quizErrors(u); u.nets.forEach((n, ni) => E.netHelp(u, ni)); });
    if (c.viaBox) { const B = E.boxModel(m, c.box); const O = E.BOXR(); const sol = O.solve(B.inp, { draft: true, budget: 400 }); E.renderBox(m, c.box, sol); }
    const qe = units.filter(u => u.type === t).map(u => E.quizErrors(u).length);
    console.log(t.padEnd(4), JSON.stringify(p).padEnd(34), 'devices', c.devices.length, 'nets', c.nets.map(n => n.id + ':' + n.count).join(' '), '| tab', c.tab.length, '| quiz', qe.join(','), '| warn', m.warnings.length, 'info', m.infos.length);
  } catch (e) { errs++; console.log('ERREUR', t, JSON.stringify(p), e.stack.split('\n').slice(0, 4).join(' | ')); }
}
console.log(errs ? errs + ' erreurs' : 'tout passe');
