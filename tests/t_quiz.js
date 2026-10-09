const E = require('./harness')();
const mk = (t, params) => { const c = E.defaultCircuit(t); Object.assign(c.params, params || {}); return c; };
for (const [t, p] of [['pm', { perms: 1 }], ['mn', {}], ['vmc', { vit: '2' }], ['sa', { cde: 'var3', pcmd: 1 }], ['ch', {}]]) {
  const c0 = mk(t, p); if (t === 'ch') { c0.box = 'b1'; c0.viaBox = true; }
  const m = E.buildModel({ name: 'q', options: { idMode: 'single', idCal: 40 }, boxes: [{ id: 'b1', name: 'B' }], circuits: [c0] });
  const u = E.boxUnits(m)[0];
  const errs = E.quizErrors(u);
  console.log('\n== ' + t + ' ' + JSON.stringify(p) + ' : ' + errs.length + ' erreurs possibles');
  const ws = E.quizWires(u);
  const seen = {};
  errs.forEach(e => { const k = e.txt.slice(0, 50); if (seen[k]) return; seen[k] = 1; if (Object.keys(seen).length <= 7) console.log(' - ' + ws[e.wire].label.slice(0, 40) + ' → ' + e.to + ' : ' + e.txt); });
  u.nets.forEach((n, ni) => { const h = E.netHelp(u, ni); if (/NAV|PETITE|FIL/.test(n.label)) console.log('   aide ' + n.label + ' : ' + h); });
}
