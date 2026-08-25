/** Les fiches nommees doivent etre JOUABLES par le moteur de reference et
 *  ne rien lui prendre en douce. Cinq invariants.
 */
const { alea } = require("./alea.js");
const E = require("./engine.js");
const F = require("./fiches.js");
const { reset } = require("./mesure.js");
const { traduire } = require("./traducteur.js");

let ko = 0;
const dit = (nom, ok, det = "") => {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${det ? " — " + det : ""}`);
  if (!ok) ko++;
};

const ids = Object.keys(F.FICHES);

// 1. AUCUN TIRAGE. C'est l'invariant qui protege la reproductibilite : si
//    monter une fiche consommait du hasard, la graine d'un combat
//    dependrait du nombre de fiches montees avant lui.
alea.seed(1234);
const avant = alea.random();
alea.seed(1234);
ids.forEach(id => F.fighter(id));
const apres = alea.random();
dit("construire() ne consomme aucun tirage", avant === apres);

// 2. TOUTES LES CLES ECRITES, aucune laissee au defaut silencieux de 50.
//    On le prouve en montant la MEME fiche a deux niveaux : toute cle qui
//    ne bouge pas est une cle qui n'a pas ete ecrite.
{
  const modele = { nom: "T", base: 40, division: "poids_welter" };
  const bas = F.construire(modele);
  const haut = F.construire(Object.assign({}, modele, { base: 80 }));
  const profils = [["striking", "st"], ["wrestling", "wr"], ["ground", "gr"],
                   ["clinch", "cl"], ["physical", "ph"], ["mental", "me"]];
  let figees = [];
  for (const [attr, bloc] of profils)
    for (const k of F.CLES[bloc])
      if (bas[attr][k] === haut[attr][k]) figees.push(`${bloc}.${k}`);
  dit("toutes les cles suivent le niveau", figees.length === 0, figees.slice(0, 5).join(", "));
}

// 3. Une cle mal orthographiee doit LEVER, pas etre ignoree en silence.
{
  let leve = false;
  try { F.construire({ nom: "X", base: 60, division: "poids_welter", ecarts: { st: { jabb: +10 } } }); }
  catch (e) { leve = true; }
  dit("une cle inconnue leve une erreur", leve);
}

// 4. Deterministe : deux montages donnent des stats identiques.
{
  const a = F.fighter("Kante"), b = F.fighter("Kante");
  const eg = F.CLES.st.every(k => a.striking[k] === b.striking[k]) &&
             F.CLES.gr.every(k => a.ground[k] === b.ground[k]);
  dit("deux montages de la meme fiche sont identiques", eg);
}

// 5. LE BOUT DE LA CHAINE : les fiches se battent vraiment, et l'ecran sait
//    traduire le combat. On joue les deux affiches du prototype.
{
  const affiches = [["Okonkwo", "Renaud", 3], ["Kante", "Vasile", 3], ["Traore", "Kante", 3]];
  let toutes = true, detail = [];
  for (const [x, y, rounds] of affiches) {
    alea.seed(27);
    const a = F.fighter(x), b = F.fighter(y);
    reset(a); reset(b);
    const [w, log] = E.simuler_combat(a, b, rounds, false);
    alea.seed(99);
    const [Et, fin] = traduire(log, x, y, 300, 7);
    const bon = log.length > 50 && Et.length > 5 &&
                (w === null || w.name === x || w.name === y);
    if (!bon) toutes = false;
    detail.push(`${x} c. ${y} : ${w ? w.name : "nul"} (${fin[0]}), ${log.length} l., ${Et.length} et.`);
  }
  dit("les affiches du prototype se jouent et se traduisent", toutes);
  detail.forEach(d => console.log("       " + d));
}

console.log(ko === 0
  ? "CONFORME — les fiches nommees sont jouables par le moteur de reference."
  : `ECHEC — ${ko} invariant(s)`);
process.exit(ko === 0 ? 0 : 1);
