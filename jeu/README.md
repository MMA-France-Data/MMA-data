# Le jeu — moteur MMA + manager de salle

Source complète du jeu (moteur de combat, monde, saison, écrans).
`index.html` à la racine du dépôt est un autre projet (MMA Data Tracker) —
il n'a rien à voir avec ce dossier.

## Ce qu'il faut savoir avant de toucher quoi que ce soit

- **`NOTES_A_TRAITER.md` est la mémoire du projet.** Chaque décision, chaque
  piège et chaque arbitrage y sont consignés. On le lit avant, on l'écrit après.
- **Les artefacts se régénèrent, ils ne s'éditent jamais** :
  `js/tables.js`, `js/moteur.bundle.js`, `js/ecran.gabarit.js`, `apercu.html`.
  Corriger un bug dedans, c'est créer une deuxième source.
- **Les sources** : les modules `js/*.js`, `demo_jeu.html` (le jeu),
  `combat_reel.template.html` (l'écran de combat).

## Rejouer toute la chaîne de vérification

```sh
sh js/lancer_verifs.sh     # 30 bancs, du RNG à la partie jouée
```

Les quatre derniers valent d'être connus :

- **27 — le singe** (`js/verifier_partie.js`) charge `demo_jeu.html` hors
  navigateur (`js/bac_partie.js`) et **joue** : il avance les jours, tranche les
  blocages, répond aux offres et aux demandes, signe les contrats, ouvre les
  sept onglets. C'est lui qui attrape la classe de défaut la plus chère du
  carnet — « ce qui n'est branché nulle part ne fait rien, et ne lève pas ».
  Il ne voit pas les pixels : une couleur fausse ou un débordement restent du
  ressort de quelqu'un qui joue pour de vrai.
- **28 — le ressenti** : ce que le combattant dit au coin sort du moteur, et
  ne consomme pas une unité du hasard du combat.
- **29 — les demandes du staff** : chaque « oui » change quelque chose de
  mesurable dans la salle.
- **30 — l'endgame** : le mur, les objectifs, les rivalités — et tout ça
  traverse la sauvegarde.

## Fabriquer la page autonome

```sh
python3 js/gen_tables.py && node js/bundler.js && node js/gabarit.js && node js/apercu.js
```

Produit `apercu.html` : une seule page, sans script externe, qui se transporte
et s'ouvre en `file://`.
