/** Rejoue le vecteur de reference stance/body cote JS. Meme ordre d'appels. */
const fs = require("fs");
const { alea } = require("./alea.js");
const S = require("./stance.js");
const B = require("./body.js");

const ref = JSON.parse(fs.readFileSync("reference_modules.json", "utf8"));
let total = 0, echecs = [];

const proche = (a, b) => (typeof a === "number" && !Number.isInteger(a))
  ? Math.abs(a - b) <= Math.abs(a) * 1e-12 + 1e-12
  : JSON.stringify(a) === JSON.stringify(b);

function cmpLigne(nom, g, i, attendu, obtenu) {
  for (let c = 0; c < attendu.length; c++) {
    total++;
    if (!proche(attendu[c], obtenu[c]) && echecs.length < 6)
      echecs.push(`  graine ${g} · ${nom}[${i}] colonne ${c} : Python ${JSON.stringify(attendu[c])} != JS ${JSON.stringify(obtenu[c])}`);
  }
}
const r12 = x => Number(x.toFixed(12));

for (const s of ref) {
  const g = s.graine;
  // Les modules portes appellent `alea` (singleton), exactement comme
  // Python appelle le `random` de module. On le reseme, point.
  alea.seed(g);

  const stA = new S.StanceState(S.ORTHODOX, alea.randint(10, 95));
  const stB = new S.StanceState(S.SOUTHPAW, alea.randint(10, 95));
  let lgA = new S.LegDamage(), lgB = new S.LegDamage();
  for (let i = 0; i < 400; i++) {
    const r = S.resolve_leg_kick(null, null, stA, stB, lgA, lgB,
      alea.choice(["calf_kick", "low_kick", "body_kick"]),
      alea.randint(20, 90), alea.randint(20, 90));
    const [sw, raison] = S.veut_switcher(stB, lgB, alea.randint(20, 90));
    if (sw) stB.switch();
    cmpLigne("stance", g, i, s.stance[i], [
      r[0], r[1], r[2], sw, raison,
      lgA.gauche, lgA.droite, lgB.gauche, lgB.droite,
      stB.garde_actuelle, stB.switches,
      r12(S.stabilite(stB, lgB, 50)), r12(S.facteur_puissance(stB, lgB)),
      r12(S.facteur_esquive(stB, lgB)), r12(S.facteur_precision(stB)),
    ]);
    if (i % 90 === 89) { lgA = new S.LegDamage(); lgB = new S.LegDamage(); }
  }

  let bs = new B.BodyState(alea.randint(20, 90), alea.randint(20, 90));
  const noms = Object.keys(B.COUPS_CORPS);
  for (let i = 0; i < 400; i++) {
    const coup = alea.choice(noms);
    const [t, dmg, zone, cout, ko] = B.resolve_body_strike(
      coup, alea.randint(20, 95), bs, alea.uniform(0.5, 1.2));
    cmpLigne("body", g, i, s.body[i], [
      t, dmg, zone, r12(cout), ko,
      r12(bs.degats_corps), r12(bs.degats_foie), bs.coups_corps_encaisses,
      r12(bs.chute_de_garde()), r12(bs.garde_effective()),
      r12(bs.drain_cardio()), r12(bs.risque_ko_foie()),
      r12(bs.risque_ko_corps_general()), r12(B.bonus_high_kick(bs)),
    ]);
    if (ko) bs = new B.BodyState(alea.randint(20, 90), alea.randint(20, 90));
  }
}

console.log(`${ref.length} graines · ${total} valeurs comparees`);
if (echecs.length) {
  console.log(`ECHEC — divergences :`); echecs.forEach(l => console.log(l)); process.exit(1);
}
console.log("CONFORME — stance.js et body.js sont identiques a Python.");
