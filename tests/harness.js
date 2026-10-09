// charge les scripts du cœur (sans DOM) dans un contexte Node
const fs = require('fs'), vm = require('vm'), path = require('path');
function load() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'core.js.html'), 'utf8');
  const extra = fs.existsSync(path.join(__dirname, '..', 'src', 'db.js.html')) ? fs.readFileSync(path.join(__dirname, '..', 'src', 'db.js.html'), 'utf8') : '';
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m, code = '';
  for (const h of [html, extra]) { while ((m = re.exec(h))) code += m[1] + '\n;\n'; re.lastIndex = 0; }
  const ctx = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: () => Date.now() } };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(code + '\n;this.__exp = { CATALOG, defaultCircuit, buildModel, renderTableau, renderUnifilaire, renderLabels, buildLists, buildSteps, quizErrors, quizWires, boxUnits, boxModel, renderBox, BOXR, generateDwelling, defaultDwellingForm, gaineFor, socketsForLiving, netHelp, computeLengths, defaultLengths, legendItems, idNeed, sampleProject, labelsLayout };', ctx);
  return ctx.__exp;
}
module.exports = load;
