# L'emballage Android (chantier P)

Le jeu vit dans `jeu/` — UNE seule source. Ici, seulement l'emballage :

- `synchroniser.sh` fabrique `www/` depuis `jeu/` (index.html = demo_jeu.html
  + le pont, 3 modules js). `www/` est un ARTEFACT, jamais édité à la main.
- `pont_android.js` : le SEUL code de la couche appli — bouton retour
  Android v1, interface `PONT_SAVE` réservée pour la save Google (v1.1).
  Hors de l'appli, il ne fait rien et ne lève pas.
- `icone.svg` → `node fabriquer_icones.js` regénère les mipmap PNG.
- L'APK de test se construit par GitHub Actions (`.github/workflows/android.yml`)
  — la machine de session n'a pas le SDK Android.

## Avant la première montée sur le Play Store (à faire par Mael)
1. Compte Play Console (25 $, vérification d'identité).
2. CONFIRMER l'appId `fr.mmadata.mmamanager` — il est DÉFINITIF après la
   première montée (modifiable avant, jamais après).
3. Test fermé imposé par Google pour un compte personnel (~12 testeurs,
   14 jours) avant la production.
4. Politique de confidentialité (une page : rien n'est collecté, tout
   reste sur l'appareil).
5. La save Google Play Jeux (v1.1) : config Play Games Services dans la
   console, puis le plugin natif pose `window.PONT_SAVE` — la sauvegarde
   du jeu est une seule chaîne, rien à réécrire côté jeu.
