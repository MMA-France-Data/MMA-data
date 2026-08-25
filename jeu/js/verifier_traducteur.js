/** Rejoue cote JS les 24 combats traduits par traducteur.py — CHAQUE etape
 *  champ a champ (x,y compris), la finition et la duree.
 *
 *  Ce banc etait ABSENT de l'archive v24 : gen_ref_traducteur.py y etait,
 *  son comparateur non, donc la conformite annoncee au carnet ne pouvait
 *  plus se rejouer. Reecrit ici, et remis dans lancer_verifs.sh.
 *
 *  /!\ traduire() consomme DEUX flux de hasard : son rng LOCAL (graine_trad)
 *  et le module global via _autour() quand l'angle est absent (graine_glob).
 *  Les deux doivent etre poses avant chaque appel, dans cet ordre, sinon la
 *  mise en scene (x,y) diverge alors que les EVENEMENTS sont justes.
 */
const fs = require("fs");
const { alea } = require("./alea.js");
const { traduire } = require("./traducteur.js");

const cas = JSON.parse(fs.readFileSync("reference_traducteur.json", "utf8"));
const eg = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const r9 = x => Number(x.toFixed(9));

let total = 0, combats_ok = 0, echecs = [];

for (let i = 0; i < cas.length; i++) {
  const c = cas[i];
  alea.seed(c.graine_glob);                       // flux GLOBAL (_autour)
  const [E, fin, duree] = traduire(c.log, "Kante", "Okafor", 300, c.graine_trad);
  let ok = true;

  // -- nombre d'etapes : un ecart ici rend la suite illisible, on s'arrete
  if (E.length !== c.E.length) {
    ok = false;
    if (echecs.length < 6)
      echecs.push(`  combat ${i} : ${c.E.length} etapes cote PY, ${E.length} cote JS`);
  } else {
    for (let k = 0; k < E.length; k++) {
      const att = c.E[k], got = E[k];
      // union des cles : une cle EN TROP cote JS est une divergence aussi
      const cles = new Set([...Object.keys(att), ...Object.keys(got)]);
      for (const cle of cles) {
        total++;
        if (!eg(att[cle], got[cle])) {
          ok = false;
          if (echecs.length < 6)
            echecs.push(`  combat ${i} etape ${k} champ "${cle}" :\n` +
              `    PY ${JSON.stringify(att[cle])}\n` +
              `    JS ${JSON.stringify(got[cle])}`);
        }
      }
    }
  }

  // -- finition et duree
  total += 2;
  if (!eg(c.fin, fin)) {
    ok = false;
    if (echecs.length < 6)
      echecs.push(`  combat ${i} finition :\n    PY ${JSON.stringify(c.fin)}\n` +
        `    JS ${JSON.stringify(fin)}`);
  }
  if (r9(duree) !== c.duree) {
    ok = false;
    if (echecs.length < 6)
      echecs.push(`  combat ${i} duree : PY ${c.duree} / JS ${r9(duree)}`);
  }
  if (ok) combats_ok++;
}

console.log(`${cas.length} combats traduits · ${total} champs compares · ` +
  `${combats_ok}/${cas.length} identiques`);
if (echecs.length) { console.log("ECHEC :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — traducteur.js est identique a Python, etape par etape (x,y compris).");
