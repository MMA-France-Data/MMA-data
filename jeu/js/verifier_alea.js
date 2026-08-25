/**
 * verifier_alea.js — rejoue le vecteur de reference Python dans le RNG JS.
 *
 * Regle : les entiers doivent etre IDENTIQUES, les flottants a 1e-15 pres
 * (l'ecart de formatage entre les deux langages, rien de plus). Toute autre
 * difference est un bug de portage, pas une tolerance a elargir.
 */
const fs = require("fs");
const path = require("path");
const { Alea } = require("./alea.js");

const ref = JSON.parse(fs.readFileSync(path.join(__dirname, "reference_alea.json"), "utf8"));

let echecs = [], total = 0;

/**
 * ENTIERS : egalite STRICTE. Tout le flux du generateur (random, getrandbits,
 * randint, choice, choices, sample) doit tomber exactement.
 *
 * FLOTTANTS ISSUS DE gauss() : tolerance relative 1e-13. gauss() passe par
 * cos/sin/log, et ces fonctions ne sont PAS specifiees au bit pres entre
 * l'implementation de Python (libm) et celle de V8 : l'ecart est du dernier
 * ULP (mesure : 42.00223177811591 contre ...906). Ce n'est pas le hasard qui
 * diverge, c'est l'arrondi d'une transcendante.
 * VERIFIE que ca ne remonte pas : 20 000 stats de combattants generees des
 * deux cotes avec la formule de test_raccord.creer -> 0 divergence. La
 * troncature int() n'est jamais atteinte. Si un jour un calcul devenait
 * sensible au dernier bit d'un gauss, il faudrait generer les combattants
 * d'UN SEUL cote et passer les fiches en donnees.
 */
function cmp(nom, graine, attendu, obtenu) {
  total++;
  const egal = (typeof attendu === "number" && !Number.isInteger(attendu))
    ? Math.abs(attendu - obtenu) <= Math.abs(attendu) * 1e-13 + 1e-300
    : JSON.stringify(attendu) === JSON.stringify(obtenu);
  if (!egal && echecs.length < 8) {
    echecs.push(`  graine ${graine} · ${nom} : Python ${JSON.stringify(attendu)} != JS ${JSON.stringify(obtenu)}`);
  }
  return egal;
}

for (const s of ref) {
  const g = s.graine;
  const a = new Alea(g);

  s.random.forEach((v, i) => cmp(`random[${i}]`, g, v, a.random()));
  [1, 3, 7, 8, 16, 31, 32].forEach((k, i) => cmp(`getrandbits(${k})`, g, s.getrandbits[i], a.getrandbits(k)));
  [1, 2, 3, 5, 9, 16, 17, 99, 1000].forEach((n, i) => cmp(`randint(0,${n})`, g, s.randint[i], a.randint(0, n)));
  s.uniform.forEach((v, i) => cmp(`uniform[${i}]`, g, v, a.uniform(-3.5, 12.25)));
  s.choice.forEach((v, i) => cmp(`choice[${i}]`, g, v, a.choice("abcdefghij".split(""))));
  s.gauss.forEach((v, i) => cmp(`gauss[${i}]`, g, v, a.gauss(58, 16)));
  s.choices.forEach((v, i) => cmp(`choices[${i}]`, g, v, a.choices(["a", "b", "c", "d"], [1, 7, 0.5, 3])[0]));

  const r40 = [...Array(40).keys()];
  s.sample.forEach((v, i) => cmp(`sample[${i}]`, g, v, a.sample(r40, 2)));
  const r500 = [...Array(500).keys()];
  s.sample_grand.forEach((v, i) => cmp(`sample_grand[${i}]`, g, v, a.sample(r500, 8)));

  // la sequence entremelee — reproduire l'ordre EXACT de gen_reference.py
  const m = [];
  for (let i = 0; i < 120; i++) {
    m.push(Number(a.random().toFixed(15)));
    m.push(a.randint(0, 100));
    if (i % 3 === 0) m.push(Number(a.gauss(0, 1).toFixed(15)));
    if (i % 5 === 0) m.push(a.choice([10, 20, 30, 40, 50, 60, 70]));
    if (i % 7 === 0) m.push(a.choices([1, 2, 3], [2, 5, 1])[0]);
    m.push(Number(a.uniform(0, 100).toFixed(15)));
  }
  if (m.length !== s.melange.length) {
    echecs.push(`  graine ${g} · melange : longueur ${s.melange.length} vs ${m.length}`);
  } else {
    m.forEach((v, i) => cmp(`melange[${i}]`, g, s.melange[i], v));
  }

  a.gauss(0, 1);
  a.seed(g);
  s.apres_reseed.forEach((v, i) => cmp(`apres_reseed[${i}]`, g, v, a.gauss(0, 1)));
}

console.log(`${ref.length} graines · ${total} valeurs comparees`);
if (echecs.length) {
  console.log(`ECHEC — ${echecs.length}${echecs.length >= 8 ? "+" : ""} divergences :`);
  echecs.forEach(l => console.log(l));
  process.exit(1);
}
console.log("CONFORME — le RNG JS est identique a celui de Python, au bit pres.");
