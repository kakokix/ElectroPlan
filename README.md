# ElectroPlan

Plans de câblage pour apprentis électriciens. Tu décris ce qu'il y a dans ta boîte de dérivation, ElectroPlan dessine :

- la **boîte** avec ses bornes Wago et chaque fil à sa place ;
- le **tableau électrique** (différentiels, disjoncteurs, télérupteurs, contacteurs, ponts à faire) ;
- le **schéma unifilaire**, les **étiquettes** à imprimer et la **liste des fils** avec les longueurs ;
- le **câblage pas à pas** et des **exercices** pour s'entraîner ;
- une **recherche d'appareillage** par vraie référence ou par nom, dans plus de 2 000 références (bornes, câblage, fonctionnement).

Les règles suivent la NF C 15-100 (édition 2024).

**Le site : https://kakokix.github.io/ElectroPlan/**

Un outil [ElectroLearn](https://electrolearn.netlify.app/).

> Plans pour l'apprentissage, à faire valider par ton formateur. Vérifie les repères des bornes sur tes appareils et câble toujours hors tension.

## Mise en ligne

Chaque envoi sur la branche `main` est publié automatiquement par GitHub Pages (en une minute environ).

- Les sources sont dans `src/`.
- `sh build.sh` construit `index.html` (le site) et `dist/artifact.html` (la même page pour Claude).
- `sh tests/run.sh` lance les tests (Node et Playwright).
