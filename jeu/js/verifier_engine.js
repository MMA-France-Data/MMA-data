/**
 * /!\ CE BANC A CHANGE DE NATURE LE 10/08 (decision de Mael, option B).
 * Il comparait le JS a une reference produite par engine.py — un CONTROLE
 * DE PORTAGE. Le chantier D (cage metrique) a laisse le Python derriere :
 * la geometrie vit dans engine.js et n'a pas ete portee, et le portage est
 * declare TERMINE. La reference est desormais produite par le JS lui-meme
 * (gen_ref_engine_js.js) : ce banc est une NON-REGRESSION.
 * L'ancrage a Python subsiste dans les QUATRE bancs de modules feuilles
 * (stance/body, ground, striking, clinch), toujours verts.
 * /!\ ON NE REGENERE LA REFERENCE QUE VOLONTAIREMENT, apres mesure et
 * gravure au carnet. La regenerer pour faire taire un rouge reviendrait a
 * supprimer le banc.
 */
/** Rejoue 105 combats complets cote JS et compare CHAQUE ligne de log,
 *  le vainqueur et l'etat final des deux hommes. */
const fs = require("fs");
const { alea } = require("./alea.js");
const E = require("./engine.js");
const { StrikingProfileV2 } = require("./striking_v2.js");
const { ClinchProfile } = require("./clinch.js");
const { GroundProfile } = require("./ground_v2.js");

const ST = ["jab","cross","crochet","poing_corps","uppercut","overhand","low_kick",
  "body_kick","high_kick","teep","spinning","esquive_tete","parade","blocage",
  "check","posture_debout","lecture","vitesse_mains","vitesse_jambes","reflexes",
  "power","ko_power","footwork","cage_cutting","enchainements","volume","timing"];
const WR = ["shot","clinch_wrestling","throws","sprawl","whizzer","balance","grip_fighting"];
const GR = ["passing","posture_sol","half_guard_top","side_control_top","mount_top","back_top",
  "closed_guard_bottom","open_guard_bottom","butterfly_bottom","half_guard_bottom",
  "side_control_bottom","mount_bottom","back_defense","turtle_defense","sweeps",
  "shrimping","explosiveness","wall_walking","hand_fighting_sol","submission_off_top",
  "submission_off_bottom","submission_def","ground_striking"];
const CL = ["pummeling","hand_fighting","clinch_wrestling","frame","posture",
  "clinch_striking","footwork_clinch","top_control"];
const PH = ["cardio","chin","recovery","body_conditioning","balance_base"];
const ME = ["discipline","fight_iq","aggression"];
const DIVS = Object.keys(E.DIVISIONS);
const tire = (champs, lo, hi) => Object.fromEntries(champs.map(c => [c, alea.randint(lo, hi)]));

function combattant(nom) {
  const st = new StrikingProfileV2(tire(ST, 20, 95));
  const wr = new E.WrestlingProfile(tire(WR, 20, 95));
  const gr = new GroundProfile(tire(GR, 20, 95));
  const cl = new ClinchProfile(tire(CL, 20, 95));
  const ph = new E.PhysicalProfile(tire(PH, 30, 95));
  const me = new E.MentalProfile(tire(ME, 20, 95));
  const gp = { wrestling: alea.uniform(0.05, 0.5), clinch: alea.uniform(0.05, 0.35) };
  gp.striking = 1.0 - gp.wrestling - gp.clinch;
  const garde = alea.random() < 0.22 ? E.SOUTHPAW : E.ORTHODOX;
  const div = DIVS[alea.randint(0, DIVS.length - 1)];
  return new E.Fighter(nom, st, wr, gr, cl, ph, me,
    { gameplan: gp, garde, stance_switching: alea.randint(20, 90), division: div });
}

const ref = JSON.parse(fs.readFileSync("reference_engine.json", "utf8"));
let lignes = 0, combatsOk = 0, combatsTot = 0, echecs = [];

for (const s of ref) {
  alea.seed(s.graine);
  for (let i = 0; i < s.combats.length; i++) {
    const fa = combattant("Alpha"), fb = combattant("Bravo");
    const [w, log] = E.simuler_combat(fa, fb, s.rounds, false);
    const att = s.combats[i];
    combatsTot++;
    let ok = (att.vainqueur === (w ? w.name : null)) && att.log.length === log.length;
    const nmin = Math.min(att.log.length, log.length);
    for (let L = 0; L < nmin; L++) {
      lignes++;
      if (att.log[L] !== log[L]) {
        ok = false;
        if (echecs.length < 5)
          echecs.push(`  graine ${s.graine} combat ${i} ligne ${L} :\n    PY ${JSON.stringify(att.log[L])}\n    JS ${JSON.stringify(log[L])}`);
        break;
      }
    }
    const fin = [[Number(fa.cardio.toFixed(9)), fa.sonne, fa.knockdowns, fa.td_echecs],
                 [Number(fb.cardio.toFixed(9)), fb.sonne, fb.knockdowns, fb.td_echecs]];
    if (JSON.stringify(fin) !== JSON.stringify(att.final)) {
      ok = false;
      if (echecs.length < 5)
        echecs.push(`  graine ${s.graine} combat ${i} : etat final divergent\n    PY ${JSON.stringify(att.final)}\n    JS ${JSON.stringify(fin)}`);
    }
    if (ok) combatsOk++;
  }
}
console.log(`${combatsTot} combats rejoues · ${lignes} lignes comparees · ${combatsOk}/${combatsTot} identiques`);
if (echecs.length) { console.log("PREMIERES DIVERGENCES :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — engine.js reproduit ses propres combats ligne a ligne, etat final compris.");
