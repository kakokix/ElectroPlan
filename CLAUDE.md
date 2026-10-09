# ElectroPlan : consignes pour Claude

ElectroPlan est un outil web pour apprentis électriciens (CFA) : on décrit une boîte de dérivation, l'outil dessine la boîte avec ses Wago, le tableau, l'unifilaire, les étiquettes, la liste des fils, une liste de courses (marque choisie par famille, références compatibles), le pas à pas, des exercices, et une recherche d'appareillage par référence. Le propriétaire est l'utilisateur GitHub `kakokix` ; son site principal est ElectroLearn (https://electrolearn.netlify.app/), et ElectroPlan en reprend le design.

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

- `src/head.html` : titre, polices Google (DM Sans, Space Grotesk, Barlow, IBM Plex Mono), jsPDF (cdnjs). Valable pour l'artefact Claude seulement : pour le site, `build.sh` les remplace par `fonts/fonts.css` et `vendor/jspdf.umd.min.js` (servis par le site, aucune requête vers un tiers ; le build refuse une ressource extérieure).
- `src/style.css` : tout le style (variables de couleur ElectroLearn, interface ordinateur `[data-ui="pc"]` et téléphone `[data-ui="mobile"]`). Design clair uniquement (`color-scheme: light`), à la demande du propriétaire : pas de mode sombre.
- `src/body.html` : choix de l'interface avant affichage, pictogrammes, structure de la page (en-tête, volet des circuits, onglets, fenêtres, dont « Mentions légales et confidentialité » `#ov-legal`, ouverte aussi par le lien `#mentions-legales`).
- `src/core.js.html` : le moteur, sans DOM. `BOXR` (placement des bornes et tracé des fils de la boîte, lancé dans des Web Workers), `CATALOG` (circuits), `expandCircuit`, `buildModel` (différentiels, repères, contrôles NF C 15-100), `renderBox`, `renderTableau`, `renderUnifilaire`, `renderLabels`, `buildLists`, `buildSteps`, `quizErrors`, `generateDwelling` (logement selon la norme), `computeLengths`.
- `src/db.js.html` : la base d'appareillage. `APP_TYPES` (53 fiches : bornes, câblage, réglages, norme, erreurs, sources), `APP_REFS` (références vérifiées `[marque, gamme, réf, nom, type, caractéristiques, url]`), `searchApp`, `ficheHtml`, `termSvg`.
  Environ 2 000 références (octobre 2026). Les adresses commencent souvent par un raccourci (`@dm/` domomat, `@123/` 123elec, `@lga/` catalogue Legrand… voir `URLS`). Pour un ajout en nombre : chaque référence vue sur une page du fabricant ou d'un distributeur, puis un contrôle indépendant sur un échantillon (la page source doit montrer la référence et la même désignation).
- `src/shop.js.html` : la liste de courses, sans DOM. `shopNeeds` (articles de l'installation), `shopCandidates` (références compatibles de la base pour un article : même marque/gamme pour le tableau, même gamme pour l'appareillage, prises sans griffes, bon nombre de fils, différentiel de type et calibre au moins égaux…), `shopPlan` (choix, coffret avec 20 % de réserve, contrôles « Ce qui va ensemble »). Les choix sont gardés dans `project.shop`.
- `src/app.js.html` : l'interface (rendu des vues, zoom, téléchargements, Mes installations, onglet Matériel = liste de courses + fils et longueurs, onglet Appareils, recherche en direct).
- `src/web-head.html` : l'enveloppe du site web (doctype, description, icônes, Open Graph). `src/artifact-wrap.html` : l'enveloppe des pages de test.
- `index.html` (construit, publié par Pages), `icon-*.png`, `.nojekyll`, `fonts/` (polices woff2 + licences OFL), `vendor/` (jsPDF 2.5.1 + licence MIT) : recopiés par `build.sh` depuis `.cache` quand il est là.
- `tests/` : `harness.js` charge le moteur dans Node ; `t_types` (tous les circuits), `t_search` (base et recherche), `t_shop` (liste de courses : chaque référence proposée est compatible), `t_quiz`, `t_web` (site hors de Claude : aucune requête extérieure, PDF, mode sombre du navigateur, mentions légales), `t_ui_*` (dont `t_ui_shop`), `t_mobile`, `t_live*` (recherche en direct avec un faux `window.claude`, `fakeclaude.js`).

## La page doit marcher partout

- Dans Claude, les capacités passent par `window.claude.use(nom)` : `db` (Mes installations, avancement, base partagée `catalog`), `user`, `downloads`, `sample` (recherche en direct). Chacune peut être absente : la page doit toujours marcher sans.
- Hors de Claude (`STANDALONE` dans `app.js.html`) : sauvegarde dans le navigateur, téléchargements par le navigateur, pas de recherche en direct (carte « Trouve sa notice » à la place).
- Site légal : pas de cookie, pas de mesure d'audience, pas de ressource chargée chez un tiers (polices et PDF locaux), stockage local seulement pour ce que l'utilisateur demande ; garder à jour la fenêtre « Mentions légales et confidentialité » (éditeur non professionnel, LCEN art. 1-1 ; hébergeur GitHub ; données ; marques ; licences) si quelque chose change.

## Règles de contenu (sécurité des apprentis)

- Tout le texte de l'interface est en français simple, avec tutoiement.
- Norme : NF C 15-100, édition 2024 (obligatoire depuis le 1er septembre 2025). Ne rien affirmer sans source ; préférer les guides des fabricants (Legrand, Hager, ABB) et les notices.
- Ne jamais inventer un repère de borne, une référence ou une caractéristique. Toute nouvelle référence dans `APP_REFS` est vérifiée sur une page du fabricant ou d'un distributeur, avec son URL.
- La place des bornes change selon la marque : les dessins sont génériques, les repères (A1, A2, 1, 2, L, N…) sont les vrais.
- Garder les rappels : câbler hors tension, faire valider par le formateur.

## Environnement de test (session cloud)

- Playwright : `/opt/npm-tools/node_modules/playwright`, Chromium : `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Polices locales pour des captures fidèles : `npm install --prefix .cache/fonts @fontsource/dm-sans@5.3.0 @fontsource/space-grotesk@5.3.0 @fontsource/barlow@5.3.0 @fontsource/ibm-plex-mono@5.3.0`, puis `sh build.sh`.
- Le bac à sable ne joint ni Google Fonts ni cdnjs : dans les pages de test (comme dans Claude) le PDF ne se charge pas et un message propre s'affiche ; sur `index.html` (jsPDF local) il est testé par `t_web`.
- Pour recopier jsPDF : `npm install --prefix .cache/vendor jspdf@2.5.1`, puis `sh build.sh`.
