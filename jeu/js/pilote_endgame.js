/**
 * pilote_endgame.js — LE METRE DE LA VIE LONGUE (Mael, 31/08).
 *
 *     node js/pilote_endgame.js 7 3650      graine 7, dix ans
 *
 * Trois points de veille graves en observant les parties du singe :
 * LE MUR RESTE VIDE · LES RIVALITES SONT RARES · ON NE RACCROCHE JAMAIS.
 * Cet instrument les CHIFFRE au lieu de les supposer. Comme pilote_eco,
 * il ne tourne pas dans la chaine : il ne verifie pas un invariant, il
 * raconte une decennie.
 */
const { ouvrirPartie, trancherBlocage } = require("./bac_partie.js");
const graine = Number(process.argv[2] || 7), jours = Number(process.argv[3] || 3650);
const P = ouvrirPartie({ mode: "neuf", graine });
let s = graine; const al = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
let garde = 0, prochain = 365;

function jouerUnJour() {
  P.essai("continuer");
  for (let g = 0; g < 8 && trancherBlocage(P, al()); g++);
  for (const cle of P.lire("OFFRES.map(o=>o.cle)")) P.essai("repondreOffre", cle, al() < 0.9);
  const dem = P.lire('Object.entries(MESGARS).filter(([,l])=>l.demandeEnCours).map(([c])=>c)');
  for (const cle of dem)
    P.essai("repondreDemande", cle, P.lire(`(MESGARS[${JSON.stringify(cle)}].demandeEnCours)`), al() < 0.6 ? "oui" : "non", 2);
  for (const cle of P.lire('Object.entries(MESGARS).filter(([,l])=>l.renego).map(([c])=>c)'))
    P.essai("renouvelerContrat", cle);
  for (const cle of P.lire("contratsAmarquer()")) if (al() < 0.9) P.essai("signerSalle", cle, 0.2, 4);
  if (al() < 0.3) {
    const am = P.lire('EFFECTIF.filter(f=>f.gr==="amateur").map(f=>f.id)');
    if (am.length) P.essai("passerPro", am[Math.floor(al() * am.length)]);
  }
  if (al() < 0.4) {
    const li = P.lire('Object.entries(MESGARS).filter(([,l])=>!l.amateur&&!l.retraite&&!l.org).map(([c])=>c)');
    const orgs = P.lire("Object.keys(MMA.classement.ORGS)");
    if (li.length) P.essai("demarcherOrga", li[Math.floor(al() * li.length)], orgs[Math.floor(al() * orgs.length)]);
  }
}

/** L'etat de la vie longue, en chiffres. */
function releve() {
  return P.lire(`(function(){
    const R=rivalitesTable(), j=t.jour;
    const toutes=Object.values(R);
    const viv=toutes.filter(r=>MMA.endgame.vivante(r,j));
    const ages=Object.values(MESGARS).filter(l=>l&&!l.retraite&&!l.amateur).map(l=>l.age);
    return {jour:j, an:Math.floor(j/365),
      mur:murDeLaSalle().length,
      rivTotal:toutes.length, rivVivantes:viv.length,
      chaleurMax:toutes.length?Math.round(Math.max(...toutes.map(r=>MMA.endgame.chaleur(r,j)))):0,
      pros:EFFECTIF.filter(f=>f.gr==="pro").length,
      ageMax:ages.length?Math.max(...ages):0,
      ageMoyen:ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):0,
      raccroches:Object.values(FICHES).filter(f=>f&&f.gr==="retraite"
        &&/raccroch/i.test(String(f.statut||""))).length,
      partis:Object.values(FICHES).filter(f=>f&&/Parti|Renvoyé/i.test(String(f.statut||""))).length,
      combats:RESULTATS.length, rep:Math.round(SALLE.reputation)};
  })()`);
}

while (P.lire("t.jour") < jours && garde++ < jours * 6) {
  jouerUnJour();
  const j = P.lire("t.jour");
  if (j >= prochain) {
    prochain += 365;
    const r = releve();
    console.log(`an ${String(r.an).padStart(2)} | combats ${String(r.combats).padStart(3)}`
      + ` | pros ${String(r.pros).padStart(2)} | âge moy ${String(r.ageMoyen).padStart(2)} max ${String(r.ageMax).padStart(2)}`
      + ` | raccrochés ${String(r.raccroches).padStart(2)} partis ${String(r.partis).padStart(2)} | MUR ${String(r.mur).padStart(2)}`
      + ` | rivalités ${String(r.rivVivantes).padStart(2)}/${String(r.rivTotal).padStart(2)} (chaleur max ${r.chaleurMax})`
      + ` | rép ${r.rep}`);
  }
}
const f = releve();
console.log(`\nFIN graine ${graine} — ${f.an} ans joués, ${f.combats} combats`);
console.log(`  MUR : ${f.mur} plaque(s) · RACCROCHÉS : ${f.raccroches} · PARTIS : ${f.partis} · RIVALITÉS vivantes : ${f.rivVivantes} sur ${f.rivTotal} nées`);
console.log(`  erreurs : ${P.erreurs.length} ${[...new Set(P.erreurs)].slice(0, 2).join(" | ")}`);
