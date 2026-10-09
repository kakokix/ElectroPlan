# ElectroPlan

Plans de câblage pour apprentis électriciens. Tu décris ce qu'il y a dans ta boîte de dérivation, ElectroPlan dessine :

- la **boîte** avec ses bornes Wago et chaque fil à sa place ;
- le **tableau électrique** (différentiels, disjoncteurs, télérupteurs, contacteurs, ponts à faire) ;
- le **schéma unifilaire**, les **étiquettes** à imprimer et la **liste des fils** avec les longueurs ;
- la **liste de courses** : tu choisis ta marque pour chaque famille de produits (tableau, interrupteurs et prises, boîtes, bornes), ElectroPlan propose pour chaque article des références compatibles entre elles et vérifie ce qui va ensemble ;
- le **câblage pas à pas** et des **exercices** pour s'entraîner ;
- une **recherche d'appareillage** par vraie référence ou par nom, dans plus de 2 000 références (bornes, câblage, fonctionnement).

Les règles suivent la NF C 15-100 (édition 2024).

**Le site : https://kakokix.github.io/ElectroPlan/**

Un outil [ElectroLearn](https://electrolearn.netlify.app/).

> Plans pour l'apprentissage, à faire valider par ton formateur. Vérifie les repères des bornes sur tes appareils et câble toujours hors tension.

## Confidentialité et licences

Le site ne demande pas de compte, n'utilise ni cookie ni mesure d'audience, et ne charge rien chez un tiers : les polices et le module PDF sont servis par le site lui-même. Les installations restent dans le navigateur. Détails dans la fenêtre « Mentions légales et confidentialité » du site.

- Polices DM Sans, Space Grotesk, Barlow, IBM Plex Mono : SIL Open Font License 1.1 (`fonts/OFL-*.txt`).
- jsPDF 2.5.1 : licence MIT (`vendor/LICENSE-jspdf.txt`).
- Les marques citées appartiennent à leurs propriétaires ; ElectroPlan n'est lié à aucun fabricant ni distributeur.

## Mise en ligne

Chaque envoi sur la branche `main` est publié automatiquement par GitHub Pages (en une minute environ).

- Les sources sont dans `src/`.
- `sh build.sh` construit `index.html` (le site) et `dist/artifact.html` (la même page pour Claude).
- `sh tests/run.sh` lance les tests (Node et Playwright).
