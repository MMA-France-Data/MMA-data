/**
 * verifier_salle.js — BANC 25 : LE RACCORD ENTRE TA SALLE ET LE MONDE.
 *
 * Ce banc garde la frontiere la plus dangereuse du projet : d'un cote des
 * hommes REFABRIQUES, de l'autre des hommes qui ont une HISTOIRE. Se
 * tromper d'aiguillage efface une carriere sans rien lever.
 */

const V = require("./vivier.js");
const C = require("./cartes.js");
const S = require("./salle.js");
const FI = require("./fiches.js");
const R = require("./relation.js");
const O = require("./offres.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

const neuf = () => {
  const m = V.monde(11);
  const eff = [
    { cle: "Okonkwo", nom: 'Sacha "la Machine" Okonkwo', division: "poids_welter",
      age: 27, bilan: [9, 2], groupe: "pro", serie: 2 },
    { cle: "Kante", nom: "Idrissa Kanté", division: "poids_leger",
      age: 24, bilan: [6, 1], groupe: "pro", serie: 3 },
    { cle: "Traore", nom: "Moussa Traoré", division: "poids_plume",
      age: 19, bilan: [3, 0], groupe: "amateur", archetype: "grappler_jj" },
  ];
  return { m, entres: S.reprendreEffectif(m, eff) };
};

/* ------------------ 1. tes hommes entrent dans le monde, les autres non */
{
  const { m, entres } = neuf();
  /* /!\ REGLE CHANGEE LE 09/08 (Mael, en jouant) : les amateurs sont de
     ta salle — ils progressent, on leur parle — mais ils ne sont dans le
     roster d'AUCUNE organisation tant qu'ils ne sont pas pros. */
  const pros = entres.filter(l => !l.amateur);
  const amateurs = entres.filter(l => l.amateur);
  const prosAuRoster = pros.every(l => m.rosters[l.org][l.division].includes(l.id));
  const amateursDehors = amateurs.every(l =>
    l.org === null && !Object.values(m.rosters).some(o =>
      Object.values(o).some(d => d.includes(l.id))));
  dit("les pros entrent au roster, les amateurs sont suivis mais dans aucune organisation",
    pros.length === 2 && amateurs.length === 1 && prosAuRoster && amateursDehors,
    `${pros.length} pros à ${S.ORG_DEPART} · ${amateurs.length} amateur suivi, sans organisation`);

  /* /!\ ET IL A DE VRAIES STATS : un homme de la salle sans fiche moteur
     n'existe pour aucun systeme — "Parler" ouvrait un panneau vide. */
  const f = S.ficheDe(m, amateurs[0].id);
  dit("un amateur a une vraie fiche moteur, donc on peut l'évaluer et lui parler",
    !!f && !!f.striking && !!f.mental,
    `${amateurs[0].nom} · frappe ${Math.round((f.striking.jab + f.striking.cross) / 2)}`);

  dit("leurs identifiants sont négatifs — la marque de la salle",
    entres.every(l => S.estDeLaSalle(l.id) && l.salle === true),
    entres.map(l => l.id).join(", "));
}

/* -- 1 bis. /!\ LA CORRESPONDANCE DES CLES : accents et casse */
{
  const { m, entres } = neuf();
  // demo_jeu.html indexe "Kante" AVEC accent, fiches.js SANS. La
  // correspondance echouait en silence et n'explosait qu'au premier
  // dialogue, trois ecrans plus loin (defaut trouve au branchement).
  const k = entres.find(l => l.nom.includes("Kanté"));
  dit("un nom accentué retrouve sa fiche moteur — les deux tables ne s'écrivent pas pareil",
    !!k && !!k.fiche && S.ficheDe(m, k.id).name === "Kante",
    `"Kanté" → fiche « ${k ? S.ficheDe(m, k.id).name : "?"} »`);

  /* /!\ ON NE LEVE PLUS : un homme sans fiche ecrite a la main en recoit
     une FABRIQUEE, deterministe sur sa cle. Le refuser laissait des
     combattants fantomes dans la salle. */
  const [inconnu] = S.reprendreEffectif(m, [{ cle: "Personne", nom: "Personne",
    division: "poids_lourd", age: 25, groupe: "pro" }]);
  const f2 = S.ficheDe(m, inconnu.id);
  const bis = S.fabriquerFicheSalle({ cle: "Personne", division: "poids_lourd", age: 25 });
  dit("un homme sans fiche écrite en reçoit une fabriquée, et toujours la même",
    !!f2 && f2.striking.jab === bis.striking.jab && f2.physical.cardio === bis.physical.cardio,
    `fabriquée deux fois à l'identique (jab ${f2.striking.jab})`);
}

/* ---- 2. /!\ LE GARDE-FOU : un homme de la salle ne se refabrique JAMAIS */
{
  const { m, entres } = neuf();
  let leve = false, quoi = "";
  try { V.hydrater(m, entres[0].id, 0); } catch (e) { leve = true; quoi = e.message; }
  dit("hydrater un homme de la salle lève au lieu de fabriquer un inconnu",
    leve, quoi);

  // L'aiguillage rend la BONNE fiche des deux cotes.
  const mienne = S.ficheDe(m, entres[0].id);
  const idMonde = m.rosters.HEX.poids_welter.find(i => i > 0);
  const autre = S.ficheDe(m, idMonde, 100);
  dit("ficheDe rend la fiche stockée pour les tiens, la fiche refabriquée pour le monde",
    mienne.name === "Okonkwo" && !!autre && autre.name !== "Okonkwo",
    `salle : ${mienne.name} · monde : ${autre.name}`);
}

/* ------------- 3. il combat VRAIMENT avec sa fiche, et son bilan bouge */
{
  const { m, entres } = neuf();
  const o = entres[0];
  o.vie.dernier = -900;                       // priorité maximale
  const carte = C.batirCarte(m, "HEX", 5);
  const d = carte.find(x => x.a.id === o.id || x.b.id === o.id);
  let ok = false, detail = "pas retenu sur la carte";
  if (d) {
    const avant = o.bilan.v + o.bilan.d;
    const r = C.resoudre(m, d, "HEX", 5);
    ok = (o.bilan.v + o.bilan.d) === avant + 1 && o.notoriete > 0
      && o.vie.empreintes.length === 1;
    detail = `${r.detail} · bilan ${o.bilan.v}-${o.bilan.d} · une empreinte`;
  }
  dit("il combat avec sa vraie fiche, son bilan bouge et il laisse une empreinte",
    ok, detail);
}

/* ------------------- 4. il est un adversaire comme un autre pour l'orga */
{
  const { m, entres } = neuf();
  const of = O.fabriquer(m, R.etatDepart(), entres[0], "HEX", 0, 42);
  dit("l'organisation lui fait une offre comme à n'importe qui",
    !!of && !!of.adversaire && of.bourse > 0,
    `${of.bourse} € · ${of.place} · c. ${of.trace.nom}`);

  // /!\ ET ELLE NE VOIT PAS SON NIVEAU : pas de note sur sa fiche legere.
  dit("mais elle ne voit pas son niveau — sa fiche légère ne porte pas de note",
    entres[0].note === undefined,
    "les orgas ne voient que la trace, pour tes hommes comme pour les autres");
}

/* --------------- 5. le temps : le monde n'avance jamais deux fois */
{
  const { m } = neuf();
  const a = S.avancerMonde(m, 60);
  const b = S.avancerMonde(m, 60);
  const c = S.avancerMonde(m, 90);
  dit("avancer le monde est idempotent — il ne rejoue jamais un jour déjà vécu",
    a.resultats.length > 0 && b.resultats.length === 0 && c.resultats.length > 0,
    `0→60 : ${a.resultats.length} combats · rappel : ${b.resultats.length} · 60→90 : ${c.resultats.length}`);
}

/* ------------------------ 6. ce que l'écran reçoit */
{
  const { m, entres } = neuf();
  const r = S.avancerMonde(m, 60);
  const dep = S.depechesDe(m, r.resultats);
  dit("les dépêches filtrent le bruit : ton organisation, les titres, tes hommes",
    dep.length > 0 && dep.length < r.resultats.length && !/\d+ of \d+/.test(dep[0].texte),
    `${dep.length} dépêches sur ${r.resultats.length} combats · ex. « ${dep[0].texte} »`);

  /* Les categories suivies (Mael, 28/08) : la fenetre ORG|division
     ouvre le filtre aux combats de top 15 — et a eux seuls. */
  const surAFC = r.resultats.filter(x => x.org === "AFC" && m.pros.get(x.a) && m.pros.get(x.b));
  const top15 = surAFC.filter(x => (x.rangA !== null && x.rangA <= 15)
    || (x.rangB !== null && x.rangB <= 15));
  if (surAFC.length && top15.length) {
    const div = m.pros.get(top15[0].a).division;
    const avant = S.depechesDe(m, r.resultats).filter(d => d.org === "AFC" && !d.titre).length;
    const dep2 = S.depechesDe(m, r.resultats, new Set(["AFC|" + div]));
    const suivis = dep2.filter(d => d.suivi);
    const attendu = top15.filter(x => m.pros.get(x.a).division === div
      && !m.pros.get(x.a).salle && !m.pros.get(x.b).salle && !x.titre).length;
    dit("une catégorie suivie fait remonter ses combats de top 15 — et eux seuls",
      suivis.length >= attendu && suivis.every(d => d.org === "AFC" && d.division === div),
      `${suivis.length} dépêches suivies (${div}) · sans le suivi : ${avant} hors-titre AFC`);
  } else {
    dit("une catégorie suivie fait remonter ses combats de top 15 — et eux seuls",
      false, "pas de combat AFC top 15 sur 60 jours — graine à revoir");
  }

  const cl = S.classement(m, "HEX", "poids_welter");
  dit("le classement sort prêt à afficher, sans trou ni doublon",
    cl.length > 0 && cl.every((x, i) => x.rang === i + 1),
    cl.slice(0, 3).map(x => `#${x.rang} ${x.nom}`).join(" · "));
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — tes hommes existent dans le monde, et le monde ne les refabrique jamais.");
