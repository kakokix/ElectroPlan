// faux window.claude pour tester la recherche en direct et la base partagée hors de Claude
module.exports = function () {
  const store = {}, subs = [];
  const snap = (path) => { const docs = Object.keys(store).filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).map(k => ({ id: k.split('/').pop(), exists: true, data: () => store[k] })); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [] }; };
  const notify = () => subs.forEach(s => s.cb(snap(s.path)));
  const coll = (path) => ({
    path,
    doc: (id) => ({ id, path: path + '/' + id,
      get: () => Promise.resolve({ id, exists: !!store[path + '/' + id], data: () => store[path + '/' + id] }),
      set: (d) => { store[path + '/' + id] = JSON.parse(JSON.stringify(d)); setTimeout(notify, 10); return Promise.resolve(); },
      update: (d) => { if (!store[path + '/' + id]) return Promise.reject({ code: 'invalid_argument' }); Object.assign(store[path + '/' + id], d); setTimeout(notify, 10); return Promise.resolve(); },
      delete: () => { delete store[path + '/' + id]; setTimeout(notify, 10); return Promise.resolve(); } }),
    get: () => Promise.resolve(snap(path)),
    limit: () => coll(path),
    onSnapshot: (cb) => { subs.push({ path, cb }); setTimeout(() => cb(snap(path)), 20); return () => {}; },
  });
  const db = { collection: coll, doc: (p) => { const parts = p.split('/'); return coll(parts.slice(0, -1).join('/')).doc(parts.pop()); } };
  const sample = function () { return Promise.reject({ code: 'invalid_request' }); };
  sample.json = function (prompt, opts) {
    window.__lastPrompt = prompt;
    return new Promise((res, rej) => {
      const t = setTimeout(() => res({ trouve: true, certitude: 'moyenne', marque: 'ABB', gamme: 'System pro M compact', reference: 'E290-16-10', nom: 'Télérupteur 16 A 1 NO 230 V', type: 'tl',
        fonctionnement: 'Relais à impulsion : chaque appui sur un bouton-poussoir change l’état du contact.', bornes: [{ repere: 'A1', role: 'bobine' }, { repere: 'A2', role: 'bobine (neutre)' }, { repere: '1', role: 'arrivée phase' }, { repere: '2', role: 'départ lampes' }],
        cablage: ['Coupe le courant.', 'Phase sur 1, lampes sur 2.', 'Boutons entre phase et A1, A2 au neutre.'], reglages: '', caracteristiques: '16 A, 1 module', attention: 'Travaille hors tension.' }), 400);
      if (opts && opts.signal) opts.signal.addEventListener('abort', () => { clearTimeout(t); rej({ code: 'cancelled' }); });
    });
  };
  window.claude = { use: (n) => Promise.resolve(n === 'sample' ? sample : n === 'db' ? db : n === 'user' ? { id: () => Promise.resolve('u1'), isOwner: () => Promise.resolve(true), canEdit: () => Promise.resolve(true) } : null) };
};
