/** Le bundle navigateur doit tirer EXACTEMENT les memes combats que les
 *  modules CommonJS des bancs de conformite. Sinon le jeu montrerait autre
 *  chose que ce que le moteur de reference produit.
 *
 *  On compare LE BOUT DE LA CHAINE (regle du carnet) : combats complets
 *  ligne a ligne, roster genere compris, puis un protocole mesure() entier.
 *  Le bundle est charge comme le ferait une balise <script> : dans un
 *  contexte vm avec un objet global vierge, sans require de Node.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// -- cote modules (la reference) ------------------------------------------
const M = {
  alea: require("./alea.js"),
  E: require("./engine.js"),
  gen: require("./generator.js"),
  trad: require("./traducteur.js"),
  mes: require("./mesure.js"),
  ver: require("./verdict.js"),
};

// -- cote bundle (comme le navigateur) -------------------------------------
const bp = path.join(__dirname, "moteur.bundle.js");
if (!fs.existsSync(bp)) { console.error("moteur.bundle.js absent — node bundler.js"); process.exit(1); }
const bac = { console };
bac.window = bac;
vm.createContext(bac);
new vm.Script(fs.readFileSync(bp, "utf8"), { filename: "moteur.bundle.js" }).runInContext(bac);
const B = bac.MMA;
if (!B || !B.engine) { console.error("le bundle n'expose pas MMA.engine"); process.exit(1); }

const eg = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let echecs = [], lignes = 0, combats = 0, etapes = 0, verdicts = 0;

// un combat joue de bout en bout : roster genere, deux hommes tires, log complet
function jouer(mod, alea, graine, div, rounds) {
  alea.seed(graine);
  const roster = mod.gen.generer_roster(10, { division: div, niveau_min: 50, niveau_max: 88 });
  const [a, b] = alea.sample(roster, 2);
  const fa = a.fighter, fb = b.fighter;
  fa.name = "Kante"; fb.name = "Okafor";
  mod.mes.reset(fa); mod.mes.reset(fb);
  const [w, log] = mod.E.simuler_combat(fa, fb, rounds, false);
  return [w ? w.name : null, log];
}

const CAS = [[3, "poids_welter", 3], [27, "poids_welter", 3], [41, "poids_lourd", 3],
             [64, "poids_mouche", 3], [900, "poids_welter", 5], [11, "poids_lourd", 5]];

for (const [graine, div, rounds] of CAS) {
  const [wM, logM] = jouer(M, M.alea.alea, graine, div, rounds);
  const [wB, logB] = jouer({ E: B.engine, gen: B.generator, mes: B.mesure },
                           B.alea.alea, graine, div, rounds);
  combats++;
  if (wM !== wB) echecs.push(`  graine ${graine} : vainqueur PY-modules ${wM} / bundle ${wB}`);
  if (logM.length !== logB.length) {
    echecs.push(`  graine ${graine} : ${logM.length} lignes modules, ${logB.length} bundle`);
  } else {
    for (let i = 0; i < logM.length; i++) {
      lignes++;
      if (logM[i] !== logB[i] && echecs.length < 5)
        echecs.push(`  graine ${graine} ligne ${i} :\n    MOD ${logM[i]}\n    BND ${logB[i]}`);
    }
  }

  // et la traduction, puisque l'ecran consomme le bundle lui aussi
  M.alea.alea.seed(5000 + graine);
  const [EM] = M.trad.traduire(logM, "Kante", "Okafor", 300, 100 + graine);
  B.alea.alea.seed(5000 + graine);
  const [EB] = B.traducteur.traduire(logB, "Kante", "Okafor", 300, 100 + graine);
  if (EM.length !== EB.length) {
    echecs.push(`  graine ${graine} : ${EM.length} etapes modules, ${EB.length} bundle`);
  } else {
    for (let k = 0; k < EM.length; k++) {
      etapes++;
      if (!eg(EM[k], EB[k]) && echecs.length < 5)
        echecs.push(`  graine ${graine} etape ${k} :\n    MOD ${JSON.stringify(EM[k]).slice(0,110)}` +
                    `\n    BND ${JSON.stringify(EB[k]).slice(0,110)}`);
    }
  }

  // et le verdict, puisque c'est LUI que la carte de resultat affiche
  const vM = M.ver.verdict(logM, "Kante", "Okafor");
  const vB = B.verdict.verdict(logB, "Kante", "Okafor");
  verdicts++;
  if (!eg(vM, vB))
    echecs.push(`  graine ${graine} verdict :\n    MOD ${JSON.stringify(vM)}\n    BND ${JSON.stringify(vB)}`);
}

// -- le protocole complet sur une graine : le bout du bout ------------------
const rM = M.mes.mesurer(40, 11, null, 3), rB = B.mesure.mesurer(40, 11, null, 3);
const cles = [...new Set([...Object.keys(rM), ...Object.keys(rB)])];
for (const c of cles)
  if (!eg(rM[c], rB[c])) echecs.push(`  mesurer(40,11,null,3) champ ${c} : MOD ${JSON.stringify(rM[c])} / BND ${JSON.stringify(rB[c])}`);

console.log(`${combats} combats · ${lignes} lignes de log · ${etapes} etapes traduites ` +
  `· ${verdicts} verdicts · protocole mesurer(40,11,null,3) compare`);
if (echecs.length) { console.log("ECHEC :"); echecs.forEach(l => console.log(l)); process.exit(1); }
console.log("CONFORME — le bundle navigateur tire les memes combats que les modules.");
