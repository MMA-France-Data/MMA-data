/**
 * gen_ref_engine_js.js — LA REFERENCE DU MOTEUR, PRODUITE PAR LE JS.
 *
 * /!\ DECISION DE MAEL, 10/08 (option B) : LE PORTAGE EST TERMINE.
 * engine.py etait la reference historique ; il ne tourne plus depuis des
 * semaines, et le chantier D (cage metrique) l'a laisse derriere — la
 * geometrie vit dans engine.js et n'a pas ete portee.
 * A partir d'ici, engine.js EST la source de verite. Le banc moteur
 * change donc de nature :
 *     AVANT : "le JS est-il fidele au Python ?"  (controle de portage)
 *     APRES : "le JS est-il fidele a lui-meme ?" (non-regression)
 * /!\ CE QU'ON PERD, ecrit ici pour ne pas l'oublier : le filet qui a
 * attrape des dizaines de bugs de traduction (ordre des tirages, int()
 * qui tronque, gauss() en cache...). Les QUATRE bancs de modules
 * feuilles (stance/body, ground, striking, clinch) restent, eux,
 * compares a Python : ce sont eux qui gardent l'ancrage.
 * /!\ ET LA REGLE QUI VA AVEC : on ne regenere cette reference QUE
 * volontairement, apres une mesure et une gravure au carnet. La
 * regenerer pour faire taire un banc rouge reviendrait a supprimer le
 * banc.
 *
 * Usage : node gen_ref_engine_js.js
 */
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

/* /!\ MEME ORDRE DE TIRAGE QUE verifier_engine.js — au caractere pres.
   Si les deux divergent, le banc compare deux combats differents et ne
   verifie plus rien. */
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

function suite(graine, nCombats, rounds) {
  alea.seed(graine);
  const out = [];
  for (let i = 0; i < nCombats; i++) {
    const fa = combattant("Alpha"), fb = combattant("Bravo");
    const [w, log] = E.simuler_combat(fa, fb, rounds, false);
    out.push({
      vainqueur: w ? w.name : null,
      log,
      final: [[Math.round(fa.cardio * 1e9) / 1e9, fa.sonne, fa.knockdowns, fa.td_echecs],
              [Math.round(fb.cardio * 1e9) / 1e9, fb.sonne, fb.knockdowns, fb.td_echecs]],
    });
  }
  return { graine, rounds, combats: out };
}

const ref = [suite(11, 30, 3), suite(41, 30, 3), suite(900, 30, 3), suite(27, 15, 5)];
fs.writeFileSync("reference_engine.json", JSON.stringify(ref));
const nl = ref.reduce((a, s) => a + s.combats.reduce((b, c) => b + c.log.length, 0), 0);
console.log(`reference_engine.json — ${ref.reduce((a, s) => a + s.combats.length, 0)} combats complets, ${nl} lignes de log (source : engine.js)`);
