# ElectroPlan : consignes pour Claude

ElectroPlan est un outil web pour apprentis électriciens (CFA) : on décrit une boîte de dérivation, l'outil dessine la boîte avec ses Wago, le tableau, l'unifilaire, les étiquettes, la liste des fils, le pas à pas, des exercices, et une recherche d'appareillage par référence. Le propriétaire est l'utilisateur GitHub `kakokix` ; son site principal est ElectroLearn (https://electrolearn.netlify.app/), et ElectroPlan en reprend le design.

## Le propriétaire veut que CHAQUE demande soit mise en ligne automatiquement

Après toute modification, sans attendre qu'on le demande :

1. Modifier les sources dans `src/` (jamais `index.html` à la main : il est construit).
2. `sh build.sh` : doit afficher « syntaxe ok » pour `index.html` et `dist/artifact.html`.
3. `sh tests/run.sh` (ou une partie : `sh tests/run.sh t_types t_search t_web`). Regarder les captures dans `tests/out/` quand l'interface change, au téléphone (390 px) et sur ordinateur.
4. `git add -A && git commit` (message en français, terminé par les lignes d'attribution demandées par la session) puis `git push origin main`. GitHub Pages republie https://kakokix.github.io/ElectroPlan/ en une minute environ.
5. Republier aussi l'artefact Claude https://claude.ai/artifact/7ixq2MXv1aR7xtAHtZLtkk avec le fichier `dist/artifact.html` (outil Artifact, `url` de l'artefact ; dans une nouvelle conversation, le lire d'abord). Il déclare les capacités `db`, `downloads`, `user` et `sample` : ne pas passer `capabilities` (elles sont gardées), sauf pour en changer.
6. Dire à l'utilisateur en une phrase ce qui a changé et que c'est en ligne.

Accès au dépôt dans une nouvelle session : `add_repo` (owner `kakokix`, repo `ElectroPlan`, access `push`), puis cloner.

## Fichiers

- `src/head.html` : titre, polices Google (DM Sans, Space Grotesk, Barlow, IBM Plex Mono), jsPDF (cdnjs).
- `src/style.css` : tout le style (variables de couleur ElectroLearn, mode sombre, interface ordinateur `[data-ui="pc"]` et téléphone `[data-ui="mobile"]`).
- `src/body.html` : choix de l'interface avant affichage, pictogrammes, structure de la page (en-tête, volet des circuits, onglets, fenêtres).
- `src/core.js.html` : le moteur, sans DOM. `BOXR` (placement des bornes et tracé des fils de la boîte, lancé dans des Web Workers), `CATALOG` (circuits), `expandCircuit`, `buildModel` (différentiels, repères, contrôles NF C 15-100), `renderBox`, `renderTableau`, `renderUnifilaire`, `renderLabels`, `buildLists`, `buildSteps`, `quizErrors`, `generateDwelling` (logement selon la norme), `computeLengths`.
- `src/db.js.html` : la base d'appareillage. `APP_TYPES` (53 fiches : bornes, câblage, réglages, norme, erreurs, sources), `APP_REFS` (références vérifiées `[marque, gamme, réf, nom, type, caractéristiques, url]`), `searchApp`, `ficheHtml`, `termSvg`.
- `src/app.js.html` : l'interface (rendu des vues, zoom, téléchargements, Mes installations, onglet Appareils, recherche en direct).
- `src/web-head.html` : l'enveloppe du site web (doctype, description, icônes, Open Graph). `src/artifact-wrap.html` : l'enveloppe des pages de test.
- `index.html` (construit, publié par Pages), `icon-*.png`, `.nojekyll`.
- `tests/` : `harness.js` charge le moteur dans Node ; `t_types` (tous les circuits), `t_search` (base et recherche), `t_quiz`, `t_web` (site hors de Claude), `t_ui_*`, `t_mobile`, `t_live*` (recherche en direct avec un faux `window.claude`, `fakeclaude.js`).

## La page doit marcher partout

- Dans Claude, les capacités passent par `window.claude.use(nom)` : `db` (Mes installations, avancement, base partagée `catalog`), `user`, `downloads`, `sample` (recherche en direct). Chacune peut être absente : la page doit toujours marcher sans.
- Hors de Claude (`STANDALONE` dans `app.js.html`) : sauvegarde dans le navigateur, téléchargements par le navigateur, pas de recherche en direct (carte « Trouve sa notice » à la place).

## Règles de contenu (sécurité des apprentis)

- Tout le texte de l'interface est en français simple, avec tutoiement.
- Norme : NF C 15-100, édition 2024 (obligatoire depuis le 1er septembre 2025). Ne rien affirmer sans source ; préférer les guides des fabricants (Legrand, Hager, ABB) et les notices.
- Ne jamais inventer un repère de borne, une référence ou une caractéristique. Toute nouvelle référence dans `APP_REFS` est vérifiée sur une page du fabricant ou d'un distributeur, avec son URL.
- La place des bornes change selon la marque : les dessins sont génériques, les repères (A1, A2, 1, 2, L, N…) sont les vrais.
- Garder les rappels : câbler hors tension, faire valider par le formateur.

## Environnement de test (session cloud)

- Playwright : `/opt/npm-tools/node_modules/playwright`, Chromium : `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Polices locales pour des captures fidèles : `npm install --prefix .cache/fonts @fontsource/dm-sans@5.3.0 @fontsource/space-grotesk@5.3.0 @fontsource/barlow@5.3.0 @fontsource/ibm-plex-mono@5.3.0`, puis `sh build.sh`.
- Le bac à sable ne joint ni Google Fonts ni cdnjs : le PDF (jsPDF) n'y est pas testable ; un message propre s'affiche à la place.
