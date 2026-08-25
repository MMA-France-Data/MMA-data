/**
 * mesure.js — portage de mesure.py (le protocole de reference) et de
 * instrument.reset. C'est LUI qui prononce la bascule : il doit redonner
 *     DEC 47.6 | SUB 20.8 | TKO 19.4 | KO sec 10.9
 *
 * /!\ MISE A JOUR APRES LA BASCULE SCORING DU 08/08. L'ancienne ligne
 * affichait DEC 46.8 / nul 0.8 : elle etait devenue un FANTOME, on aurait
 * compare a un etat qui n'existait plus.
 * Le DELTA EST LA PREUVE que le calibrage est intact : SUB, TKO, KO sec et
 * TKO sol sont identiques AU DIXIEME (20.8 / 19.4 / 10.9 / 1.3). Seuls DEC
 * et nul ont bouge, de exactement 0.8 point, l'un vers l'autre — ce sont
 * les matchs nuls devenus des decisions, le 10-8 ayant quasi disparu. Le
 * scoring ne touche QUE les decisions, comme annonce.
 * avec mesurer(40, seed, 3) sur les graines 11 / 41 / 900.
 * L'ordre des tirages suit mesure.py : seed -> par division (ordre de
 * DIVISIONS) -> par roster (generer_roster) -> par combat (sample de 2).
 */

const { alea } = require("./alea.js");
const E = require("./engine.js");
const { generer_roster } = require("./generator.js");

/** instrument.reset : remise a neuf d'un combattant entre deux combats. */
function reset(x) {
  x.head_damage = 0; x.cardio = 100.0; x.sonne = 0; x.knockdowns = 0;
  x.legs.gauche = 0; x.legs.droite = 0;
  x.body.degats_corps = 0; x.body.degats_foie = 0;
  x.stance.garde_actuelle = x.stance.garde_naturelle;
}

function mesurer(n_par_div = 60, seed = 11, divisions = null, n_rosters = 3) {
  alea.seed(seed);
  const res = {};
  for (const div of (divisions || Object.keys(E.DIVISIONS))) {
    E.reset_telemetry();
    const issues = {};
    let n = 0;
    for (let r = 0; r < n_rosters; r++) {
      const roster = generer_roster(40, { division: div, niveau_min: 45, niveau_max: 85 });
      for (let c = 0; c < n_par_div; c++) {
        const [a, b] = alea.sample(roster, 2);
        const fa = a.fighter, fb = b.fighter;
        reset(fa); reset(fb);
        const [w, log] = E.simuler_combat(fa, fb, 3, false);
        const t = log.join("\n");
        let cle;
        if (!w) cle = "nul";
        else if (t.includes("tape !")) cle = "SUB";
        else if (t.includes("TKO AU SOL")) cle = "TKO sol";
        else if (t.includes("KO SEC")) cle = "KO sec";
        else if (t.includes("TKO")) cle = "TKO";
        else cle = "DEC";
        issues[cle] = (issues[cle] !== undefined ? issues[cle] : 0) + 1;
        n += 1;
      }
    }
    res[div] = { n, issues };
  }
  return res;
}

module.exports = { mesurer, reset };

// ------------------------------------------------------- execution directe
if (require.main === module) {
  const graines = process.argv.length > 2
    ? process.argv.slice(2).map(Number) : [11, 41, 900];
  const nParDiv = 40, nRosters = 3;
  const moyennes = {};
  for (const g of graines) {
    const r = mesurer(nParDiv, g, null, nRosters);
    const tot = {};
    let T = 0;
    for (const div of Object.keys(r))
      for (const [k, v] of Object.entries(r[div].issues)) {
        tot[k] = (tot[k] !== undefined ? tot[k] : 0) + v;
        T += v;
      }
    const ligne = ["DEC", "SUB", "TKO", "KO sec", "TKO sol", "nul"]
      .map(k => `${k} ${((tot[k] !== undefined ? tot[k] : 0) / T * 100).toFixed(1)}`);
    console.log(`  graine ${String(g).padStart(3)} (n=${T}) : ${ligne.join(" | ")}`);
    for (const k of ["DEC", "SUB", "TKO", "KO sec", "TKO sol", "nul"])
      (moyennes[k] = moyennes[k] || []).push((tot[k] !== undefined ? tot[k] : 0) / T * 100);
  }
  const moy = Object.entries(moyennes)
    .map(([k, v]) => `${k} ${(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1)}`);
  console.log(`  MOYENNE ${graines.length} graines : ${moy.join(" | ")}`);
  console.log("  REFERENCE (chantier I complet, 09/08) : DEC 48.8 | SUB 23.8 | TKO 16.9 | KO sec 9.0 | TKO sol 1.4 | nul 0.0");
  console.log("  (08/08 scoring : DEC 47.6 | SUB 20.8 | TKO 19.4 | KO 10.9)");
  console.log("  /!\\ le calibrage a BOUGE, c'etait prevu : on repare les mecaniques,");
  console.log("      on recalibrera a la fin. Ne pas 'corriger' ce deplacement.");
}
