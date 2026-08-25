/** Rejoue le vecteur de reference ground_v2 cote JS, meme ordre d'appels. */
const fs = require("fs");
const { alea } = require("./alea.js");
const G = require("./ground_v2.js");

const { champs, suites } = JSON.parse(fs.readFileSync("reference_sol.json", "utf8"));
let total = 0, echecs = [];
const eg = (a, b) => JSON.stringify(a) === JSON.stringify(b);

for (const s of suites) {
  alea.seed(s.graine);
  const positions = Object.keys(G.POSITIONS);
  for (let i = 0; i < s.actions.length; i++) {
    const kw = {};
    const pa = new G.GroundProfile(Object.fromEntries(
      champs.map(c => [c, alea.randint(15, 95)])));
    const pb = new G.GroundProfile(Object.fromEntries(
      champs.map(c => [c, alea.randint(15, 95)])));
    // les profils eux-memes doivent deja correspondre
    const attProf = s.profils[i];
    const gotProf = [champs.map(c => pa[c]), champs.map(c => pb[c])];
    total++;
    if (!eg(attProf, gotProf) && echecs.length < 5)
      echecs.push(`  graine ${s.graine} tour ${i} : PROFILS divergents`);

    const A = { ground: pa }, B = { ground: pb };
    const pos = positions[alea.randint(0, positions.length - 1)];
    const got = [
      pos,
      G.tenter_progression(A, B, pos),
      G.tenter_evasion(B, A, pos),
      G.tenter_soumission_top(A, B, pos),
      G.tenter_soumission_bottom(B, A, pos),
      G.resolve_gnp(A, B, pos),
      Number(pa.controle(pos).toFixed(12)), Number(pb.retention(pos).toFixed(12)),
    ];
    const att = s.actions[i];
    for (let c = 0; c < att.length; c++) {
      total++;
      if (!eg(att[c], got[c]) && echecs.length < 5)
        echecs.push(`  graine ${s.graine} tour ${i} col ${c} : Python ${JSON.stringify(att[c])} != JS ${JSON.stringify(got[c])}`);
    }
  }
}
console.log(`${suites.length} graines · ${total} valeurs comparees`);
if (echecs.length) { console.log("ECHEC :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — ground_v2.js est identique a Python.");
