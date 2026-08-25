/**
 * combat.js — simuler un combat complet avec le moteur de reference (JS).
 * Usage :
 *   node combat.js                    combat aleatoire (welter, 3 rounds)
 *   node combat.js 27                 graine fixee (rejouable a l'identique)
 *   node combat.js 27 poids_lourd 5   graine + division + rounds
 */
const { alea } = require("./alea.js");
const E = require("./engine.js");
const { generer_roster } = require("./generator.js");
const { reset } = require("./mesure.js");

const graine = process.argv[2] !== undefined ? Number(process.argv[2])
             : Math.floor(Date.now() % 100000);
const division = process.argv[3] || "poids_welter";
const rounds = process.argv[4] !== undefined ? Number(process.argv[4]) : 3;

alea.seed(graine);
const roster = generer_roster(12, { division, niveau_min: 55, niveau_max: 88 });
const [a, b] = alea.sample(roster, 2);
reset(a.fighter); reset(b.fighter);

console.log(`graine ${graine} | ${division} | ${rounds} rounds`);
console.log(`${a.fighter.name} (${a.archetype}, niv ${a.niveau})`);
console.log(`   contre`);
console.log(`${b.fighter.name} (${b.archetype}, niv ${b.niveau})`);
const versHtml = process.argv.includes("--html");
// Les regex du traducteur exigent des noms mono-jetons (comme rendu_combat
// qui renomme en Kante/Okafor) : on garde le nom complet pour l'AFFICHE.
const afficheA = a.fighter.name, afficheB = b.fighter.name;
let vA = afficheA.split(" ").pop(), vB = afficheB.split(" ").pop();
// /!\ Les regex du traducteur reperent les combattants par PREFIXE : si un
// nom commence par l'autre, il attribue les evenements au mauvais coin.
// Suffixer un seul cote ("Adeyemi" / "Adeyemi-B") ne suffit donc PAS — c'est
// exactement le cas qui a fait tomber l'assert de vainqueur sur la graine 17.
// On suffixe les DEUX, pour qu'aucun ne soit prefixe de l'autre.
if (vA === vB) { vA = vA + "-R"; vB = vB + "-B"; }
if (vA.startsWith(vB) || vB.startsWith(vA))
  throw new Error(`noms ambigus pour le traducteur : "${vA}" et "${vB}"`);
a.fighter.name = vA; b.fighter.name = vB;

const [w, log] = E.simuler_combat(a.fighter, b.fighter, rounds, !versHtml);
if (!versHtml) {
  console.log(`\n=== ${w ? "VAINQUEUR : " + w.name : "MATCH NUL"} ===`);
} else {
  // moteur -> traducteur -> ecran, la meme chaine que rendu_combat.py,
  // entierement en JS.
  const fs = require("fs");
  const path = require("path");
  const { traduire } = require("./traducteur.js");
  const { verdict } = require("./verdict.js");
  const { recaler } = require("./chrono.js");
  const { feuille } = require("./feuille.js");
  const [Et, fin, duree] = traduire(log, vA, vB, E.DUREE_ROUND, graine);

  // conformite : l'ecran doit dire ce que le moteur a tire
  const attendu = w === null ? null : (w.name === vA ? "A" : "B");
  if (fin[1] !== attendu)
    throw new Error(`VAINQUEUR DIVERGENT — moteur ${attendu}, traducteur ${fin[1]}`);

  const { profils } = require("./profil.js");
  // Le verdict voyage avec l'ecran : meme phrase ici et au palmares du jeu.
  const v = verdict(log, vA, vB);
  if (v.vainqueur !== attendu || v.methode !== fin[0])
    throw new Error(`VERDICT DIVERGENT — moteur ${attendu}, verdict ${v.vainqueur}/${v.methode}`);

  // Horloge recalee sur celle du moteur avant d'entrer dans l'ecran.
  const Sr = v.seconde === null ? Et
           : recaler(Et, E.DUREE_ROUND, v.round, v.seconde);

  const data = {
    S: Sr,
    FIN: { methode: fin[0], vainqueur: fin[1], detail: fin[2] },
    verdict: v,
    feuille: feuille(log, vA, vB),
    noms: [afficheA, afficheB],
    fiches: [`${a.archetype} · niv ${a.niveau}`, `${b.archetype} · niv ${b.niveau}`],
    bourse: `graine ${graine} · ${division} · ${rounds} rounds`,
    profils: profils(a.fighter, b.fighter),
    sec_round: E.DUREE_ROUND,
  };
  const tpl = fs.readFileSync(path.join(__dirname, "..", "combat_reel.template.html"), "utf8");
  // /!\ FONCTION, pas chaine (voir gabarit.js) : $& / $` / $' seraient
  // interpretes et un $ dans les donnees corromprait la page.
  const json = JSON.stringify(data);
  const html = tpl.replace("/*__DATA__*/", () => json);
  if (html.includes("__DATA__")) throw new Error("injection ratee");
  const sortie = path.join(__dirname, "..", "combat_reel.html");
  fs.writeFileSync(sortie, html);
  console.log(`${afficheA}  contre  ${afficheB}`);
  console.log(`fin : ${fin[0]}${fin[1] ? " — " + (fin[1] === "A" ? afficheA : afficheB) : ""}`);
  console.log(`${log.length} lignes -> ${Et.length} etapes -> ${sortie}`);
}
