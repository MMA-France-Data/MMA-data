/**
 * exporter_partition.js — OUTIL DE DEV, HORS CHAINE : joue un vrai
 * combat (moteur + traducteur), le passe par choregraphie.js et ecrit
 * la partition JSON que le lecteur Unity (unity/) rejoue.
 *
 *     node js/exporter_partition.js [graine]
 *
 * Le format est NEUTRE (aucun moteur de rendu dedans) : positions deja
 * normalisees (-1..1, centre de cage en 0,0), geste deja tranche par
 * choregraphie.geste(). Unity ne connait ni (180,180) ni le log.
 */
const C = require("./choregraphie.js");
const E = require("./engine.js");
const G = require("./generator.js");
const M = require("./mesure.js");
const T = require("./traducteur.js");
const { alea } = require("./alea.js");
const fs = require("fs"), path = require("path");

const graine = parseInt(process.argv[2] || "51", 10);
alea.seed(graine);
const roster = G.generer_roster(10, { division: "poids_leger", niveau_min: 55, niveau_max: 85 });
const [ra, rb] = alea.sample(roster, 2);
const fa = ra.fighter, fb = rb.fighter;
fa.name = "Kante"; fb.name = "Okafor";
M.reset(fa); M.reset(fb);
const [, log] = E.simuler_combat(fa, fb, 3, false);
const [etapes] = T.traduire(log, "Kante", "Okafor", E.DUREE_ROUND, graine);
const beats = C.beats(etapes).map((b) => {
  const ge = C.geste(b);
  const [xa, za] = C.normaliser(b.a), [xb, zb] = C.normaliser(b.b);
  return { t: b.t, xa, za, xb, zb, ph: b.ph,
           geste: ge.type, qui: ge.qui || "", zone: ge.zone || "",
           fl: b.fl ? 1 : 0, com: b.com };
});
const sortie = { nomA: "Kante", nomB: "Okafor", graine, beats };
const dest = path.join(__dirname, "../../unity/Assets/StreamingAssets/partition.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(sortie));
console.log(`partition.json — ${beats.length} temps (graine ${graine}) -> ${dest}`);
