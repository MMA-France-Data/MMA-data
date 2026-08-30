/* pont_android.js — LE PONT ENTRE LE JEU ET L'APPLI ANDROID.
   /!\ C'est le SEUL fichier de la couche appli qui touche la page. Le
   jeu (jeu/demo_jeu.html) ne sait rien d'Android — il tourne pareil
   dans un navigateur, la visionneuse ou la WebView. Tout ici est
   OPTIONNEL et gardé : hors de l'appli, ce fichier ne fait rien et ne
   lève pas (règle du carnet).

   v1 : le bouton retour Android.
   v1.1 (préparé, pas branché) : la save par Google Play Jeux — la
   sauvegarde du jeu est UNE chaîne (format MMALZ1|), le pont n'aura
   qu'à la stocker/relire. Interface réservée : window.PONT_SAVE. */
(function () {
  "use strict";
  var C = typeof Capacitor !== "undefined" ? Capacitor : null;
  if (!C || !C.Plugins || !C.Plugins.App) return;   /* pas dans l'appli */

  /* LE BOUTON RETOUR (Android) : le même geste que partout ailleurs —
     une fiche ouverte se ferme ; sinon l'appli se range (jamais de
     fermeture sèche au milieu d'une partie : tout est sauvegardé en
     continu, mais le réflexe "retour = quitter sans prévenir" est
     exactement ce qu'on ne veut pas sur un jeu). */
  C.Plugins.App.addListener("backButton", function () {
    try {
      var voile = document.getElementById("voile");
      if (voile && voile.classList.contains("ouvert")) {
        if (typeof fermerFiche === "function") fermerFiche();
        else voile.classList.remove("ouvert");
        return;
      }
    } catch (e) { /* le retour ne doit jamais casser la partie */ }
    C.Plugins.App.minimizeApp();
  });

  /* LA SAVE CLOUD (v1.1) — interface réservée, rien de branché :
     window.PONT_SAVE = { lire: () => Promise<string|null>,
                          ecrire: (chaine) => Promise<void> }
     Le jour où Google Play Jeux est configuré (Play Console), le plugin
     natif posera cet objet et le jeu pourra s'y adosser. Tant qu'il est
     absent : la save locale, comme aujourd'hui. */
})();
