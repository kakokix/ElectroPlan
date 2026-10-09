#!/bin/sh
# Construit ElectroPlan à partir de src/ :
#   index.html            le site web (publié par GitHub Pages)
#   dist/artifact.html    la même page, pour l'artefact dans Claude (Claude ajoute lui-même l'enveloppe du document)
#   dist/test.html        page de test (comme dans Claude)
#   dist/test_fonts.html  page de test avec les polices en local (si elles sont installées, sinon copie de test.html)
# Usage : sh build.sh            (FONTS=/chemin/vers/@fontsource pour choisir les polices locales)
set -e
cd "$(dirname "$0")"
mkdir -p dist
python3 - <<'PY'
src = 'src/'
read = lambda p: open(src + p, encoding='utf8').read()
logo = read('logo-dataurl.txt').strip()
head, style = read('head.html'), read('style.css')
body = ''.join(read(p) for p in ['body.html', 'core.js.html', 'db.js.html', 'app.js.html'])
page = (head + style + body).replace('__LOGO__', logo)
open('dist/artifact.html', 'w', encoding='utf8').write(page)
web_head = head.replace('<title>ElectroPlan</title>', '<title>ElectroPlan · plans de câblage NF C 15-100</title>')
web = read('web-head.html').replace('__HEAD__', web_head + style).replace('__BODY__', body).replace('__LOGO__', logo)
open('index.html', 'w', encoding='utf8').write(web)
open('dist/test.html', 'w', encoding='utf8').write(read('artifact-wrap.html') + page + '</body></html>')
print('pages construites (logo inséré %d fois)' % (head + style + body).count('__LOGO__'))
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
