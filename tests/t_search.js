const X = require('./harness2')();
const qs = ['412408', 'A9C30811', 'a9c 30811', 'legrand 412501', 'télérupteur', 'telerupteur silencieux', 'permutateur odace', 'Wago 221', '221-415', 'variateur 3 fils', 'contacteur heures creuses', 'S520204', 'cm0001', 'prise usb', 'fil pilote', 'disjoncteur 16 A hager', 'id type a', 'ETC225', 'sonnette', 'plexo', 'xyz123', 'détecteur', 'ICTA 20', 'wago 221-415', 'hager epn 510', 'schneider A9C 15032', '16 A', 'dj 2 a', 'legrand 4124 08'];
for (const q of qs) {
  const r = X.searchApp(q);
  console.log(q.padEnd(26), '→', r.refs.slice(0, 3).map(x => x.brand.split(' ')[0] + ' ' + x.ref).join(', ').padEnd(52), '| types:', r.types.slice(0, 3).map(t => t.id).join(','), '| best', r.best);
}
// contrôle de cohérence de la base
let bad = 0;
X.APPDB.refs.forEach(r => { if (!X.APPDB.types[r.type]) { bad++; console.log('type inconnu', r.ref, r.type); } if (!/^https?:\/\//.test(r.url)) { bad++; console.log('url', r.ref, r.url); } });
Object.values(X.APPDB.types).forEach(t => { if (t.add && !X.CATALOG[t.add.type]) { bad++; console.log('add inconnu', t.id); } const h = X.ficheHtml(t, null); if (!h || h.length < 200) { bad++; console.log('fiche vide', t.id); } });
const dup = {}; X.APPDB.refs.forEach(r => { const k = r.brand + r.key; if (dup[k]) console.log('doublon', r.ref); dup[k] = 1; });
console.log('types', Object.keys(X.APPDB.types).length, 'refs', X.APPDB.refs.length, bad ? bad + ' problèmes' : 'base cohérente');
