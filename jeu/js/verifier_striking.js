/** Rejoue le vecteur striking cote JS, meme ordre exact de tirages. */
const fs = require("fs");
const { alea } = require("./alea.js");
const S = require("./striking_v2.js");

const { champs, suites } = JSON.parse(fs.readFileSync("reference_striking.json", "utf8"));
let total = 0, echecs = [];
const proche = (a, b) => (typeof a === "number" && !Number.isInteger(a))
  ? Math.abs(a - b) <= Math.abs(a) * 1e-9 + 1e-9
  : JSON.stringify(a) === JSON.stringify(b);
const r10 = x => (typeof x === "number" && !Number.isInteger(x)) ? Number(x.toFixed(10)) : x;

const armes = Object.keys(S.ARMES);
const cibles = [null, "jambes", "corps", "tete"];
const derniers = [null, "jab"];

for (const s of suites) {
  alea.seed(s.graine);
  for (let i = 0; i < s.tours.length; i++) {
    const pa = new S.StrikingProfileV2(Object.fromEntries(champs.map(c => [c, alea.randint(15, 95)])));
    const pb = new S.StrikingProfileV2(Object.fromEntries(champs.map(c => [c, alea.randint(15, 95)])));
    const A = { striking: pa }, B = { striking: pb };
    const arme = armes[alea.randint(0, armes.length - 1)];
    const acc = alea.random() < 0.3;
    const setup = alea.random() < 0.4 ? alea.uniform(0, 12) : 0.0;
    // /!\ ordre Python : le uniform du setup n'est tire QUE si le random()
    // du if est < 0.4 (short-circuit du ternaire d'origine)
    const pen_a = alea.uniform(0.6, 1.0), pen_d = alea.uniform(0.6, 1.0);
    const r = S.resolve_frappe(A, B, arme, acc, pen_a, pen_d, setup);
    const choix = S.choisir_arme(A, B, acc, alea.uniform(0, 0.5),
                                 derniers[alea.randint(0, 1)], cibles[alea.randint(0, 3)]);
    const got = [arme, acc, r10(setup), r10(pen_a), r10(pen_d),
                 r[0], r10(r[1]), r[2], r[3], r10(r[4]),
                 choix, r10(pa.vitesse_arme(arme)), pa.competence(arme)];
    const att = s.tours[i];
    for (let c = 0; c < att.length; c++) {
      total++;
      if (!proche(att[c], got[c]) && echecs.length < 6)
        echecs.push(`  graine ${s.graine} tour ${i} col ${c} : Python ${JSON.stringify(att[c])} != JS ${JSON.stringify(got[c])}`);
    }
  }
}
console.log(`${suites.length} graines · ${total} valeurs comparees`);
if (echecs.length) { console.log("ECHEC :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — striking_v2.js est identique a Python.");
