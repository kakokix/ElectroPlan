const fs = require('fs'), vm = require('vm'), path = require('path');
module.exports = function () {
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let code = '';
  for (const f of ['core.js.html', 'db.js.html']) { const h = fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'); let m; while ((m = re.exec(h))) code += m[1] + '\n;\n'; re.lastIndex = 0; }
  const ctx = { console, Math, Date, JSON, setTimeout, clearTimeout };
  vm.createContext(ctx);
  vm.runInContext(code + '\n;this.__x = { APPDB, searchApp, ficheHtml, termSvg, sharedEntry, looksLikeRef, APP_TYPES, CATALOG };', ctx);
  return ctx.__x;
};
