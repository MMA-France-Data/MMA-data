/**
 * choregraphie.js — DU LOG A LA SCENE.
 *
 * /!\ EN DORMANCE (cas 150 bis, 30/08) : le proto 3D en primitives a
 * ete juge par Mael ("vraiment nul") et RETIRE — bonshommes, three.js,
 * bouton, tout le visible est sorti du jeu. CE MODULE RESTE : c'est la
 * lecture du log (positions, phases, gestes), independante de tout
 * rendu — la prochaine tentative (sprites, GLB, autre idee) repartira
 * d'ici sans rien recalculer. Le banc 34 le tient au chaud.
 *
 * LA REGLE 7, APPLIQUEE A LA 3D : la scene ne montre JAMAIS un coup que
 * le moteur n'a pas tire. Ce module ne cree rien — il RELIT les etapes
 * du traducteur (qui portent deja les positions reelles des deux hommes
 * dans la cage, la phase, qui encaisse et ou) et les compacte en TEMPS
 * («beats») que la vue 3D n'a plus qu'a jouer. Zero tirage, zero DOM.
 *
 * L'etape du traducteur : { t, a:[x,y], b:[x,y], ph, dmg:{<cote><zone>:n},
 *   ctrl, flash, chaud, com }. La cage vit en (180,180) rayon 148 —
 * la vue normalise avec CAGE ci-dessous, une seule verite d'echelle.
 *
 * Banc 34 (verifier_choregraphie.js).
 */

const CAGE = { centre: [180, 180], rayon: 148 };

/* Les phases connues du traducteur — tout le reste est traite DISTANCE. */
const PHASES = ["DISTANCE", "CLINCH", "TAKEDOWN", "SOL", "SOUMISSION",
                "KNOCKDOWN", "KO", "TKO", "FIN"];

const ZONES = { t: "tete", c: "corps", j: "jambes" };

/**
 * Un temps de scene, depuis une etape. `dmg` designe QUI ENCAISSE
 * (« Bt » = B prend a la tete) : le frappeur est l'autre.
 */
function beat(e) {
  let frappeur = null, zone = null;
  if (e.dmg) {
    const cle = Object.keys(e.dmg)[0];
    if (cle && (cle[0] === "A" || cle[0] === "B")) {
      frappeur = cle[0] === "A" ? "B" : "A";
      zone = ZONES[cle[1]] || "tete";
    }
  }
  const ph = PHASES.indexOf(e.ph) >= 0 ? e.ph : "DISTANCE";
  return { t: e.t || 0,
           a: e.a || CAGE.centre.slice(), b: e.b || CAGE.centre.slice(),
           ph, f: frappeur, z: zone,
           ctrl: e.ctrl || null,
           fl: !!e.flash, ch: !!e.chaud,
           com: e.com || "" };
}

/** La partition complete d'un combat — ce que la carte transporte. */
function beats(etapes) {
  return (etapes || []).map(beat);
}

/**
 * La position d'un temps, normalisee pour la scene : [-1..1] sur les
 * deux axes, centre de la cage en (0,0). LA SEULE conversion d'echelle
 * du jeu — la vue 3D ne connait pas (180,180).
 */
function normaliser(p) {
  return [(p[0] - CAGE.centre[0]) / CAGE.rayon,
          (p[1] - CAGE.centre[1]) / CAGE.rayon];
}

/** Ce que la vue doit JOUER pour un temps donne — le geste, pas le
 *  pixel : la vue decide de ses membres, la partition decide du sens. */
function geste(b) {
  if (b.ph === "KO" || b.ph === "TKO" || b.ph === "KNOCKDOWN")
    return { type: "chute", qui: b.f ? (b.f === "A" ? "B" : "A") : (b.ctrl === "A" ? "B" : "A") };
  if (b.ph === "SOUMISSION") return { type: "soumission", qui: b.ctrl || "A" };
  if (b.ph === "TAKEDOWN") return { type: "amenee", qui: b.ctrl || b.f || "A" };
  if (b.ph === "SOL") return { type: "sol", qui: b.ctrl || "A" };
  if (b.f) return { type: "frappe", qui: b.f, zone: b.z || "tete" };
  if (b.ph === "CLINCH") return { type: "clinch", qui: b.ctrl || null };
  if (b.ph === "FIN") return { type: "fin", qui: null };
  return { type: "garde", qui: null };
}

module.exports = { CAGE, PHASES, ZONES, beat, beats, normaliser, geste };
