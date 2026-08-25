/**
 * profil.js — LE BLOC "SUR LE PAPIER", LU AU MEME ENDROIT PAR TOUS LES ECRANS.
 *
 * Ces huit nombres resument un combattant a cote de ses stats de combat
 * reelles ("LE COMBAT" contre "SUR LE PAPIER"). Ils etaient calcules dans
 * combat.js ; des que le jeu ouvre le meme ecran, la formule doit vivre a UN
 * seul endroit — sinon deux ecrans montrent deux fois "le meme" combattant
 * avec des chiffres differents, et c'est la regle 7 qui saute.
 *
 * Ce sont des MOYENNES DE STATS DE FICHE, pas des mesures de combat : elles
 * ne dependent d'aucun tirage et ne bougent pas pendant le combat (cardio y
 * est la stat physical.cardio, pas la jauge vivante f.cardio).
 */

/* /!\ OFFENSE ET DEFENSE SEPAREES (Mael, 10/08, en lisant sa raclee :
   "pourtant j'etais au-dessus en stats frappe" puis "et lutte, je vois
   off et pas def").
   IL AVAIT RAISON SUR LES DEUX. L'axe "Frappe" ne montrait que quatre
   coups (jab, cross, crochet, low kick) et RIEN de l'esquive, de la
   parade, des reflexes ni de la lecture — un homme a 66 en frappe et 30
   en esquive s'affichait comme un bon frappeur, puis encaissait 185
   coups. Et l'axe "Lutte" MELANGEAIT shot (offensif), sprawl (defensif)
   et clinch_wrestling : deux hommes a 59 et 65 pouvaient etre des
   combattants opposes. Dans son combat : 1 amenee sur 8 pour lui, 3 sur
   3 pour l'autre — un ecart pareil ne peut pas tenir dans "59 contre 65".
   ON NE PEUT PAS CHOISIR UN COMBAT SUR DES CHIFFRES QUI NE MONTRENT QUE
   LA MOITIE DE CE QUI COMPTE. */
const LIBELLES = ["Frappe", "Défense debout", "Lutte off.", "Déf. lutte",
                  "Sol off.", "Sol déf.", "Soumission", "Déf. soum.",
                  "Cardio", "Menton", "Fight IQ"];

/** Fighter -> les huit nombres, dans l'ordre de LIBELLES. */
function lire(f) {
  const s = f.striking, l = f.wrestling, g = f.ground;
  return [Math.round((s.jab + s.cross + s.crochet + s.low_kick) / 4),
          /* Ce qui evite de prendre : esquive, parade, blocage, reflexes,
             lecture. C'est CETTE ligne qui manquait. */
          Math.round((s.esquive_tete + s.parade + s.blocage + s.reflexes
                      + s.lecture) / 5),
          Math.round((l.shot + l.throws) / 2),          // amener au sol
          Math.round((l.sprawl + l.whizzer + l.balance) / 3),  // ne pas y aller
          /* Dominer au sol : passer la garde, monter, tenir le dessus. */
          Math.round((g.passing + g.mount_top + g.side_control_top) / 3),
          /* Se relever, se degager : ce qu'on subit quand on n'a pas ca. */
          /* /!\ LES VRAIES CLES DU PROFIL SOL (corrige : `escapes` et
             `top_control` n'existent pas — ce sont des noms du GENERATEUR,
             pas du moteur. Ils rendaient NaN a l'ecran). Se degager, c'est
             crocheter, se relever au mur, et defendre sa garde. */
          Math.round((g.shrimping + g.wall_walking + g.half_guard_bottom
                      + g.back_defense) / 4),
          Math.round((g.submission_off_top + g.submission_off_bottom) / 2),
          /* /!\ LE SEUL AXE QUI N'ETAIT PAS ARRONDI (Mael, capture du
             10/08 : "84.93987...7" deborde de l'ecran). Une stat qui a
             progresse porte des decimales ; toutes les autres passaient
             par Math.round, celle-ci non. */
          Math.round(g.submission_def),
          Math.round(f.physical.cardio),
          Math.round(f.physical.chin),
          Math.round(f.mental.fight_iq)];
}

/** Les deux combattants -> le tableau [[libelle, a, b], ...] du gabarit. */
function profils(fa, fb) {
  const a = lire(fa), b = lire(fb);
  return LIBELLES.map((lib, i) => [lib, a[i], b[i]]);
}

module.exports = { LIBELLES, lire, profils };
