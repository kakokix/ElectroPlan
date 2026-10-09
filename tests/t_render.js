const E = require('./harness')();
const render = require('./svgpng');
const mk = (t, params, box, label) => { const c = E.defaultCircuit(t); Object.assign(c.params, params || {}); if (box !== undefined) { c.box = box; c.viaBox = !!box; } c.label = label || ''; return c; };
(async () => {
  const proj = { name: 'Essai modules', options: { idMode: 'single', idCal: 40 }, boxes: [{ id: 'b1', name: 'Boîte' }],
    circuits: [mk('tl', {}, 'b1', 'Entrée'), mk('mn', {}, 'b1', 'Escalier'), mk('ex', { cde: 'crep' }, '', 'Jardin'), mk('ch', {}, '', 'Séjour'), mk('so', {}, '', 'Porte'), mk('hc', { load: 'ce', cmd: 'edf' }, '', '')] };
  const m = E.buildModel(proj);
  const proj2 = { name: 'Essai boîte', options: { idMode: 'single', idCal: 40 }, boxes: [{ id: 'b1', name: 'Boîte' }],
    circuits: [mk('pm', { perms: 1 }, 'b1', 'Couloir'), mk('sa', { cde: 'var3', pcmd: 1 }, 'b1', 'Salon'), mk('vmc', { vit: '2' }, 'b1', '')] };
  const m2 = E.buildModel(proj2);
  const B = E.boxModel(m2, 'b1'); const sol = E.BOXR().solve(B.inp, { budget: 3000 });
  await render([[E.renderTableau(m), 'out_tableau.png', 1600], [E.renderUnifilaire(m), 'out_uni.png', 1400], [E.renderBox(m2, 'b1', sol), 'out_box.png', 1400], [E.renderUnifilaire(m2), 'out_uni2.png', 1000]]);
  console.log('ok', m.warnings, m.infos);
})();
