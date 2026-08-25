/** Rejoue les 2500 sequences de clinch cote JS — issue, acteur, CHAQUE ligne
 *  d'events, stats des deux hommes, et chaque degat recu dans l'ordre. */
const fs = require("fs");
const { alea } = require("./alea.js");
const C = require("./clinch.js");

const { champs, suites } = JSON.parse(fs.readFileSync("reference_clinch.json", "utf8"));
let total = 0, echecs = [];
const eg = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const r10 = x => Number(x.toFixed(10));

class Degats { constructor() { this.recus = []; } add(z, d) { this.recus.push([z, d]); } }

for (const s of suites) {
  alea.seed(s.graine);
  for (let i = 0; i < s.seqs.length; i++) {
    const pa = new C.ClinchProfile(Object.fromEntries(champs.map(c => [c, alea.randint(15, 95)])));
    const pb = new C.ClinchProfile(Object.fromEntries(champs.map(c => [c, alea.randint(15, 95)])));
    const A = { name: "Alpha", clinch: pa }, B = { name: "Bravo", clinch: pb };
    const dA = new Degats(), dB = new Degats();
    const cage = alea.random() < 0.4;
    const c1 = alea.uniform(0.2, 1.0), c2 = alea.uniform(0.2, 1.0);
    const [issue, acteur, events, stats, _prise] = C.clinch_sequence(
      A, B, dA, dB, cage, 4, null, c1, c2);
    const got = [
      issue, acteur.name, events,
      [stats.Alpha.sig, stats.Alpha.usure, r10(stats.Alpha.score), r10(stats.Alpha.cardio)],
      [stats.Bravo.sig, stats.Bravo.usure, r10(stats.Bravo.score), r10(stats.Bravo.cardio)],
      dA.recus, dB.recus,
    ];
    const att = s.seqs[i];
    for (let c = 0; c < att.length; c++) {
      total++;
      if (!eg(att[c], got[c]) && echecs.length < 4)
        echecs.push(`  graine ${s.graine} seq ${i} col ${c} :\n    PY ${JSON.stringify(att[c]).slice(0,110)}\n    JS ${JSON.stringify(got[c]).slice(0,110)}`);
    }
  }
}
console.log(`${suites.length} graines · ${total} champs compares (2500 sequences completes)`);
if (echecs.length) { console.log("ECHEC :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — clinch.js est identique a Python, events ligne a ligne compris.");
