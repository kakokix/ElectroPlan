// rend des SVG en PNG avec Chromium (polices locales)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const F = process.env.FONTS || path.join(__dirname, '..', '.cache', 'fonts', 'node_modules', '@fontsource');
const faces = [['DM Sans', 'dm-sans', [400, 500, 600, 700]], ['Space Grotesk', 'space-grotesk', [500, 600, 700]], ['Barlow', 'barlow', [400, 500, 600, 700]], ['IBM Plex Mono', 'ibm-plex-mono', [500, 600]]]
  .map(([n, d, ws]) => ws.map(w => `@font-face{font-family:'${n}';font-weight:${w};src:url(file://${F}/${d}/files/${d}-latin-${w}-normal.woff2)}`).join('')).join('');
module.exports = async function (items, scale) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ deviceScaleFactor: scale || 1 });
  for (const [svg, out, maxW] of items) {
    const tmp = path.join(__dirname, 'tmp_render.html');
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf8"><style>${faces} body{margin:0;background:#fff} svg{display:block;${maxW ? 'width:' + maxW + 'px;height:auto' : ''}}</style></head><body>${svg}</body></html>`);
    await pg.goto('file://' + tmp);
    await pg.evaluate(() => document.fonts.ready);
    const el = await pg.$('svg');
    await el.screenshot({ path: out });
  }
  await b.close();
};
