#!/bin/sh
# Construit ElectroPlan à partir de src/ :
#   index.html            le site web (publié par GitHub Pages) : polices et module PDF servis par le site lui-même (fonts/, vendor/)
#   dist/artifact.html    la même page, pour l'artefact dans Claude (Claude ajoute lui-même l'enveloppe du document)
#   dist/test.html        page de test (comme dans Claude)
#   dist/test_fonts.html  page de test avec les polices en local (si elles sont installées, sinon copie de test.html)
# Usage : sh build.sh            (FONTS=/chemin/vers/@fontsource pour choisir les polices locales)
set -e
cd "$(dirname "$0")"
mkdir -p dist
# ressources du site (polices, module PDF) : recopiées depuis .cache quand il est là, sinon on garde celles du dépôt
python3 - <<'PY'
import os, re, shutil
F = '.cache/fonts/node_modules/@fontsource'
faces = [('DM Sans', 'dm-sans', [400, 500, 600, 700]), ('Space Grotesk', 'space-grotesk', [500, 600, 700]),
         ('Barlow', 'barlow', [400, 500, 600, 700]), ('IBM Plex Mono', 'ibm-plex-mono', [500, 600])]
if os.path.isdir(F + '/dm-sans'):
    os.makedirs('fonts', exist_ok=True)
    css = ['/* Polices d\'ElectroPlan, servies par le site lui-même. Licence SIL Open Font License 1.1 : voir les fichiers OFL-*.txt */']
    for name, d, ws in faces:
        for w in ws:
            fn = '%s-latin-%d-normal.woff2' % (d, w)
            shutil.copyfile('%s/%s/files/%s' % (F, d, fn), 'fonts/' + fn)
            css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(%s) format('woff2')}" % (name, w, fn))
        shutil.copyfile('%s/%s/LICENSE' % (F, d), 'fonts/OFL-%s.txt' % d)
    open('fonts/fonts.css', 'w', encoding='utf8').write('\n'.join(css) + '\n')
V = '.cache/vendor/node_modules/jspdf'
if os.path.isfile(V + '/dist/jspdf.umd.min.js'):
    os.makedirs('vendor', exist_ok=True)
    js = open(V + '/dist/jspdf.umd.min.js', encoding='utf8').read()
    js = re.sub(r'\n//# sourceMappingURL=\S*\s*$', '\n', js)
    open('vendor/jspdf.umd.min.js', 'w', encoding='utf8').write(js)
    shutil.copyfile(V + '/LICENSE', 'vendor/LICENSE-jspdf.txt')
for p in ['fonts/fonts.css', 'vendor/jspdf.umd.min.js']:
    if not os.path.isfile(p): print('ATTENTION : ' + p + ' manque (npm install --prefix .cache/fonts … et --prefix .cache/vendor jspdf@2.5.1)')
PY
python3 - <<'PY'
import re
src = 'src/'
read = lambda p: open(src + p, encoding='utf8').read()
logo = read('logo-dataurl.txt').strip()
head, style = read('head.html'), read('style.css')
body = ''.join(read(p) for p in ['body.html', 'core.js.html', 'db.js.html', 'shop.js.html', 'app.js.html'])
page = (head + style + body).replace('__LOGO__', logo)
open('dist/artifact.html', 'w', encoding='utf8').write(page)
# site web : aucune ressource chargée chez un tiers (polices et module PDF servis par le site)
web_head = head.replace('<title>ElectroPlan</title>', '<title>ElectroPlan · plans de câblage NF C 15-100</title>')
web_head = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', web_head)
web_head = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="fonts/fonts.css">', web_head)
web_head = re.sub(r'src="https://cdnjs\.cloudflare\.com/[^"]*/jspdf\.umd\.min\.js"', 'src="vendor/jspdf.umd.min.js"', web_head)
web = read('web-head.html').replace('__HEAD__', web_head + style).replace('__BODY__', body).replace('__LOGO__', logo)
bad = re.findall(r'<link[^>]*rel="(?:stylesheet|preconnect|preload|modulepreload|icon|apple-touch-icon)"[^>]*href="https?://[^"]*"|<script[^>]*src="https?://[^"]*"|url\(\s*["\']?https?://|@import', web)
if bad: raise SystemExit('index.html charge encore une ressource extérieure : %s' % bad[:3])
open('index.html', 'w', encoding='utf8').write(web)
open('dist/test.html', 'w', encoding='utf8').write(read('artifact-wrap.html') + page + '</body></html>')
print('pages construites (logo inséré %d fois, aucune ressource extérieure sur le site)' % (head + style + body).count('__LOGO__'))
PY
# polices locales pour les tests (le bac à sable ne joint pas Google Fonts)
F="${FONTS:-}"
[ -z "$F" ] && [ -d .cache/fonts/node_modules/@fontsource ] && F="$(pwd)/.cache/fonts/node_modules/@fontsource"
if [ -n "$F" ] && [ -d "$F/dm-sans" ]; then
  python3 - "$F" <<'PY'
import sys
F = sys.argv[1]
faces = [('DM Sans', 'dm-sans', [400, 500, 600, 700]), ('Space Grotesk', 'space-grotesk', [500, 600, 700]),
         ('Barlow', 'barlow', [400, 500, 600, 700]), ('IBM Plex Mono', 'ibm-plex-mono', [500, 600])]
css = '<style>' + ''.join("@font-face{font-family:'%s';font-weight:%d;src:url(file://%s/%s/files/%s-latin-%d-normal.woff2)}" % (n, w, F, d, d, w)
                          for n, d, ws in faces for w in ws) + '</style>'
s = open('dist/test.html', encoding='utf8').read()
i = s.index('<link rel="stylesheet" href="https://fonts.googleapis.com'); j = s.index('>', i) + 1
open('dist/test_fonts.html', 'w', encoding='utf8').write(s[:i] + css + s[j:])
print('polices locales :', F)
PY
else
  cp dist/test.html dist/test_fonts.html
  echo "polices locales absentes (tests avec les polices de secours) : npm install --prefix .cache/fonts @fontsource/dm-sans@5.3.0 @fontsource/space-grotesk@5.3.0 @fontsource/barlow@5.3.0 @fontsource/ibm-plex-mono@5.3.0"
fi
# chaque script de la page doit être lisible par le navigateur
node -e "
const fs=require('fs');
for (const f of ['index.html','dist/artifact.html']) {
  const h=fs.readFileSync(f,'utf8');const re=/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0,bad=0;
  while((m=re.exec(h))){i++;try{new Function(m[1]);}catch(e){bad++;console.log(f,'script',i,'ERREUR',e.message)}}
  console.log(f.padEnd(18), bad?'ERREURS DE SYNTAXE':'syntaxe ok', h.length, 'octets', h.includes('__LOGO__')?'LOGO MANQUANT':'');
  if (bad || h.includes('__LOGO__')) process.exitCode = 1;
}"
