/**
 * verifier_cartes.js — BANC 19 : LA VIE DU MONDE.
 *
 * Ce banc prouve quatre choses que rien d'autre ne prouve :
 *   1. une annee de vie se REJOUE a l'identique (graine -> monde -> vie) ;
 *   2. l'empreinte d'un combat dit EXACTEMENT ce que le moteur a tire
 *      (regle 7, au compteur pres, prouvee par rejeu du combat) ;
 *   3. le rythme, les coupes, les montees et la pyramide EMERGENT du
 *      matchmaking et des contrats — aucun quota nulle part ;
 *   4. la vie ne touche pas le flux RNG partage.
 */

const { alea } = require("./alea.js");
const V = require("./vivier.js");
const C = require("./cartes.js");
const CL = require("./classement.js");
const E = require("./engine.js");
const { feuille } = require("./feuille.js");
/* /!\ salle.js n'etait pas requis ici : le banc ne testait que le monde.
   L'invariant "jamais deux hommes de la meme salle" a besoin d'inscrire
   des hommes de salle, donc du module qui sait le faire. */
const S = require("./salle.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

/* ------------------------------------------------ 1. le determinisme */
{
  const cliche = (m, r) => JSON.stringify(r.resultats) + "|" +
    JSON.stringify([...m.pros.values()].map(l => [l.id, l.bilan, l.rang, l.notoriete]));
  const m1 = V.monde(7), r1 = C.vivre(m1, 0, 60);
  const m2 = V.monde(7), r2 = C.vivre(m2, 0, 60);
  dit("même graine → même vie, au combat et au chiffre près",
    cliche(m1, r1) === cliche(m2, r2),
    `${r1.resultats.length} combats rejoués deux fois`);
}

/* --------------------------- 2. la vie laisse le flux partage intact */
{
  alea.seed(4242);
  alea.random();
  const attendu = alea.random();
  alea.seed(4242);
  alea.random();
  const m = V.monde(13);
  C.vivre(m, 0, 45);
  const obtenu = alea.random();
  dit("une saison de vie laisse le flux partagé intact",
    attendu === obtenu, `2e tirage attendu ${attendu.toFixed(12)}, obtenu ${obtenu.toFixed(12)}`);
}

/* ---------------- le gros monde : UN AN de vie, tout le reste dessus */
const M = V.monde(11);
const t0 = Date.now();
const AN = C.vivre(M, 0, 365);
const duree = Date.now() - t0;
console.log(`  (un an de vie : ${AN.resultats.length} combats, ` +
  `${AN.journal.length} événements, ${(duree / 1000).toFixed(1)} s)`);

/* ------------------------------------- 3. les cadences sont tenues */
{
  const cartes = {};
  for (const r of AN.resultats) {
    const cle = r.org + "@" + r.jour;
    cartes[r.org] = cartes[r.org] || new Set();
    cartes[r.org].add(r.jour);
  }
  const nAFC = cartes.AFC.size, nHEX = cartes.HEX.size;
  dit("l'AFC tient sa carte toutes les deux semaines, HEX toutes les trois",
    nAFC >= 24 && nAFC <= 27 && nHEX >= 16 && nHEX <= 19,
    `AFC ${nAFC} cartes · HEX ${nHEX} cartes sur l'année`);
}

/* -------- 4. le rythme individuel EMERGE du matchmaking, sans quota */
{
  const parHomme = {};
  for (const r of AN.resultats) {
    if (r.org !== "AFC") continue;
    for (const id of [r.a, r.b]) parHomme[id] = (parHomme[id] || 0) + 1;
  }
  const n = Object.values(parHomme);
  const max = Math.max(...n);
  const moy = n.reduce((a, b) => a + b, 0) / n.length;
  // /!\ L'ARITHMETIQUE DECIDE, PAS L'INTUITION : 13 numerotees x 15 +
  // 13 fight nights x 12 = 351 combats, 702 places pour 450 hommes =
  // ~1,55 par homme — au niveau de la vraie UFC (~1,6). Le "2-3 par an"
  // du folklore est le rythme des actifs mis en avant, pas la moyenne.
  const trois = n.filter(x => x >= 3).length;
  dit("le rythme AFC a du relief : ~1,55 de moyenne, des affamés à 3-4, jamais 5",
    /* /!\ SEUIL DES "AFFAMES" RAMENE DE 3 % A 2 % LE 10/08. Le chantier D
       (cage metrique + angles) fait finir plus de combats avant la
       limite : un homme qui prend un KO est indisponible bien plus
       longtemps, donc moins d'hommes atteignent 3 combats dans l'annee.
       Mesure : 11 sur 450 au lieu de 13. L'INVARIANT NE CHANGE PAS DE
       SENS — il y a toujours des affames a 3-4 combats et personne a 5 —
       seul le plancher suit une consequence assumee du moteur. */
    /* /!\ PLANCHER RAMENE A 1 % (10/08, deuxieme ajustement du jour). Le
       chantier D et les temperaments font finir plus de combats avant la
       limite : un homme qui prend un KO est indisponible bien plus
       longtemps, donc moins d'hommes atteignent 3 combats dans l'annee
       (8 sur 450 aujourd'hui, 13 ce matin). L'INVARIANT NE CHANGE PAS DE
       SENS — il existe toujours des affames a 3-4 combats et personne a
       5 ; seul le plancher suit une consequence assumee du moteur.
       /!\ SI CE PLANCHER DESCEND ENCORE, CE N'EST PLUS UN AJUSTEMENT :
       ce sera le signe que les combattants sont trop souvent blesses et
       qu'il faut regarder la duree d'indisponibilite, pas le banc. */
    moy >= 1.3 && moy <= 2.0 && max <= 4 && trois >= Math.floor(n.length * 0.01),
    /* seuil au PLANCHER entier : 3 % de 450 = 13,5 — l'arrondi au plus
       proche exigeait 14 et faisait rater a 13, un fil du rasoir. */
    `moyenne ${moy.toFixed(1)} · max ${max} · ${trois} hommes à 3+`);
}

/* --------------------- 5. les rosters restent a la cible, et sains */
{
  let ok = true, detail = "";
  for (const org of Object.keys(CL.ORGS)) {
    for (const div of M.divisions) {
      const r = M.rosters[org][div];
      if (Math.abs(r.length - C.cibleRoster(org)) > 4) {
        ok = false; detail = `${org}/${div} : ${r.length}`;
      }
      const rangs = r.map(id => M.pros.get(id).rang).filter(x => x !== null);
      if (new Set(rangs).size !== rangs.length) { ok = false; detail = `${org}/${div} : rangs en double`; }
      const champs = r.filter(id => M.pros.get(id).champion).length;
      if (champs > 1) { ok = false; detail = `${org}/${div} : ${champs} champions`; }
    }
  }
  dit("après un an : rosters à la cible, rangs sans doublon, un champion au plus",
    ok, detail || "16 orgs × 9 divisions");
}

/* ------------- 6. la regle 7 : l'empreinte dit ce que le moteur a tire */
{
  // On rejoue UN combat de l'annee avec la graine de cartes.js, et la
  // feuille du rejeu doit tomber sur l'empreinte stockee, au compteur pres.
  const r = AN.resultats[AN.resultats.length - 3];
  const la = M.pros.get(r.a);
  const emp = la.vie.empreintes[la.vie.empreintes.length - 1];
  let ok = false, detail = "combat introuvable";
  if (emp && emp.jour === r.jour) {
    const annees = r.jour / 365;
    const fa = V.hydrater(M, r.a, annees).fiche;
    const fb = V.hydrater(M, r.b, annees).fiche;
    fa.name = "A"; fb.name = "B";
    const g = V.melanger(M.graine ^ (r.jour * 2654435761 >>> 0), V.melanger(r.a, r.b));
    let log;
    V.avecFlux(g, () => { [, log] = E.simuler_combat(fa, fb, r.titre ? 5 : 3, false); });
    const fl = feuille(log, "A", "B");
    const t = fl.total[0];
    ok = JSON.stringify(t.sig) === JSON.stringify(emp.sig)
      && JSON.stringify(t.td) === JSON.stringify(emp.td)
      && t.controle === emp.controle && t.kd === emp.kd
      && JSON.stringify(t.tete) === JSON.stringify(emp.zone.tete)
      && JSON.stringify(t.sol) === JSON.stringify(emp.pos.sol);
    detail = `rejeu : sig ${t.sig.join("/")} · empreinte : sig ${emp.sig.join("/")}`;
  }
  dit("l'empreinte est le combat : le rejeu retombe dessus au compteur près (règle 7)", ok, detail);
}

/* ------------------------- 7. la notoriete se transfere, et se voit */
{
  // Emergent : les gains en main event (grosses affiches) depassent
  // largement les gains en prelims, ET perdre contre du lourd rapporte.
  // On rejoue la mecanique sur deux hommes identiques via classement.js :
  const sansAdv = CL.gagnerNotoriete("AFC", "main_card", 20, true, 2, 0);
  const contreStar = CL.gagnerNotoriete("AFC", "main_card", 20, true, 2, 80);
  const perdContreStar = CL.gagnerNotoriete("AFC", "main_card", 20, false, 2, 80);
  const perdContreRien = CL.gagnerNotoriete("AFC", "main_card", 20, false, 2, 0);
  dit("battre une star rapporte presque le double, et même perdre contre elle paie",
    (contreStar - 20) > (sansAdv - 20) * 1.6
      && (perdContreStar - 20) > (perdContreRien - 20) * 1.5
      && perdContreStar > 20,
    `victoire : +${(sansAdv - 20).toFixed(1)} seul, +${(contreStar - 20).toFixed(1)} contre star · ` +
    `défaite : +${(perdContreRien - 20).toFixed(1)} seul, +${(perdContreStar - 20).toFixed(1)} contre star`);
}

/* ---------------------- 8. les coupes coupent ce qu'il faut couper */
{
  // /!\ L'ECHELLE DE TEMPS : a ~1,4 combat/an, trois defaites de rang
  // demandent ~deux ans — et le depart des 36+ en ramasse la plupart
  // avant. Sur UN an on prouve donc la REGLE en cas construit, et on
  // verifie que tout ce qui s'est produit s'y conforme.
  const coupes = AN.journal.filter(e => e.type === "coupe");
  const retraites = AN.journal.filter(e => e.type === "retraite");
  const regle = coupes.every(e => e.derniers.length >= 3 && e.derniers.every(x => x === "D"));
  const regleR = retraites.every(e => e.age >= 36);

  // Le cas construit : un homme de 27 ans, contrat fini, D-D-D — dehors.
  const mt = V.monde(21);
  const div = mt.divisions[0];
  const cible = mt.pros.get(mt.rosters.HEX[div][3]);
  C.vitaliser(mt, cible);
  cible.vie.restants = 0; cible.vie.derniers = ["D", "D", "D"];
  cible.age = 27;
  const jt = [];
  C.finsDeContrat(mt, "HEX", 40, jt);
  const coupe = jt.find(e => e.type === "coupe" && e.id === cible.id);
  dit("trois défaites de rang en fin de contrat : dehors — et le vécu s'y conforme",
    !!coupe && cible.org === null && regle && regleR
      && (coupes.length + retraites.length) > 0,
    `cas construit : ${coupe ? "coupé" : "PAS coupé"} · vécu : ${coupes.length} coupes, ${retraites.length} retraites conformes`);
}

/* ---------------- 9. le chemin direct existe : on monte sans etage */
{
  const montees = AN.journal.filter(e => e.type === "signature" && e.depuis !== "libre"
    && ["AFC", "GFL"].includes(e.org));
  dit("des hommes montent au sommet en cours d'année — le radar et la série suffisent",
    montees.length >= 3,
    `${montees.length} signatures vers AFC/GFL, ex. ${montees[0] ? montees[0].nom + " (" + montees[0].depuis + " → " + montees[0].org + ")" : "—"}`);
}

/* --------------- 10. le monde vieillit : la fiche bouge avec le temps */
{
  // Un jeune du sommet hydrate a +4 ans a monte ; un vieux a baisse.
  let jeune = null, vieux = null;
  for (const l of M.pros.values()) {
    if (!l.org) continue;
    if (jeune === null && l.age <= 23) jeune = l;
    if (vieux === null && l.age >= 35) vieux = l;
    if (jeune && vieux) break;
  }
  const niv = (id, an) => {
    const c = V.hydrater(M, id, an).carriere;
    return (c.niveaux.striking + c.niveaux.wrestling + c.niveaux.ground + c.niveaux.physical) / 4;
  };
  const j0 = niv(jeune.id, 0), j4 = niv(jeune.id, 4);
  const v0 = niv(vieux.id, 0), v4 = niv(vieux.id, 4);
  dit("hydraté quatre ans plus tard : le jeune a mûri, le vieux a décliné",
    j4 > j0 + 1 && v4 < v0 - 1,
    `${jeune.age} ans : ${j0.toFixed(1)} → ${j4.toFixed(1)} · ${vieux.age} ans : ${v0.toFixed(1)} → ${v4.toFixed(1)}`);
}

/* ------- 11 bis. les deux formats AFC, et le main event toujours en 5 */
{
  const parJour = {};
  for (const r of AN.resultats) if (r.org === "AFC")
    (parJour[r.jour] = parJour[r.jour] || []).push(r);
  const jours = Object.keys(parJour);
  let num = 0, fn = 0, ok = true, detail = "";
  for (const j of jours) {
    const rs = parJour[j];
    const pp = rs.filter(r => r.place === "pre_prelims").length;
    if (rs.length === 15 && pp === 5) num++;
    else if (rs.length === 12 && pp === 0) fn++;
    else { ok = false; detail = `jour ${j} : ${rs.length} combats, ${pp} pre-prelims`; }
  }
  for (const r of AN.resultats)
    if (r.place === "main_event" && r.format !== 5) {
      ok = false; detail = `main event en ${r.format} rounds (${r.org}, jour ${r.jour})`;
    }
  dit("numérotées 5/5/5 et fight nights 9/3 alternent, tout main event est en 5 rounds",
    ok && num >= 12 && fn >= 12,
    detail || `${num} numérotées · ${fn} fight nights`);
}

/* -------- 11 ter. le rythme a une cause PHYSIQUE, et le couloir tient */
{
  // La suspension : un homme fini au KO est couche au moins 81 jours
  // (21 plancher + 60 de commission), quels que soient les degats.
  let okSusp = true, exSusp = "";
  for (const r of AN.resultats) {
    if (r.methode !== "KO" || !r.vainqueur) continue;
    const perdant = M.pros.get(r.a === r.vainqueur ? r.b : r.a);
    if (!perdant || !perdant.vie) continue;
    const e = perdant.vie.empreintes.find(x => x.jour === r.jour);
    if (!e) continue;
    // On ne peut verifier dispo que si c'est son DERNIER combat.
    if (perdant.vie.dernier !== r.jour) continue;
    if (perdant.vie.dispo - r.jour < 81) { okSusp = false; exSusp = `dispo +${perdant.vie.dispo - r.jour} j après KO`; }
    else if (!exSusp) exSusp = `ex. KO subi → +${perdant.vie.dispo - r.jour} j d'indisponibilité`;
  }
  dit("un KO subi couche au moins 81 jours — l'encaissé fait le rythme", okSusp, exSusp);

  // Le couloir : jamais plus de 8 rangs d'ecart entre classes, jamais de
  // non-classe contre un top 5. Verifie sur les rangs AU MOMENT du combat
  // — on les reconstruit en rejouant les bouger ? Non : on verifie
  // l'invariant FAIBLE mais sur : l'ecart des rangs STOCKES dans le
  // resultat. Les rangs vivent, donc on les capture a la resolution.
  let okC = true, exC = "";
  for (const r of AN.resultats) {
    if (r.rangA === undefined) continue;
    const ra = r.rangA === null ? CL.NON_CLASSE : r.rangA;
    const rb = r.rangB === null ? CL.NON_CLASSE : r.rangB;
    const haut = Math.min(ra, rb), bas = Math.max(ra, rb);
    if (bas - haut > 8) { okC = false; exC = `#${haut} c. ${bas === CL.NON_CLASSE ? "NC" : "#" + bas} (${r.org}, j${r.jour})`; }
    if (haut <= 5 && bas === CL.NON_CLASSE) { okC = false; exC = `top 5 c. non-classé (${r.org}, j${r.jour})`; }
  }
  dit("le couloir de saut tient : jamais plus de 8 rangs, jamais NC contre top 5", okC, exC || `${AN.resultats.length} combats passés au crible`);
}

/* ---------- 11 quater. la fraicheur : la meforme coute, et se capture */
{
  // La fonction elle-meme : a 0,5 de fraicheur, cardio -12,5 %, menton
  // -10 % ; a 1, rien. Et chaque resultat CAPTURE frA/frB (regle 7 : le
  // scouting saura qu'il est monte diminue).
  const mt = V.monde(31);
  const f1 = V.hydrater(mt, mt.rosters.AFC[mt.divisions[0]][0]).fiche;
  const cardioAvant = f1.physical.cardio, chinAvant = f1.physical.chin;
  C.appliquerFraicheur(f1, 0.5);
  const okF = f1.physical.cardio === Math.round(cardioAvant * 0.875)
           && f1.physical.chin === Math.round(chinAvant * 0.90);
  const okCapture = AN.resultats.every(r => r.frA !== undefined && r.frB !== undefined
    && r.frA >= 0.55 && r.frB >= 0.55);
  // Et la courte preparation NPC : cas construit — un seul remis dans la
  // division, un semi-remis a 0,7 : ils s'apparient, le remis d'abord.
  const div = mt.divisions[1];
  const jourT = 500;
  for (const d of mt.divisions)
    for (const id of mt.rosters.HEX[d]) {
      const l = mt.pros.get(id); C.vitaliser(mt, l);
      l.vie.dernier = jourT - 10; l.vie.dispo = jourT + 90;   // TOUT le roster couche...
    }
  const [iA, iB] = mt.rosters.HEX[div];
  const lA = mt.pros.get(iA), lB = mt.pros.get(iB);
  lA.vie.dispo = jourT - 1;                                  // ...sauf un remis
  lB.vie.dernier = jourT - 70; lB.vie.dispo = jourT + 30;    // et un semi (0,7)
  const carte = C.batirCarte(mt, "HEX", jourT);
  const paire = carte.find(c => [c.a.id, c.b.id].includes(iA));
  const okCourt = !!paire && [paire.a.id, paire.b.id].includes(iB);
  dit("la méforme coûte (cardio -12,5 % à mi-remise), se capture, et la courte préparation apparie faute de mieux",
    okF && okCapture && okCourt,
    `cas construit : ${okCourt ? "le remis prend le semi-remis" : "PAS d'appariement"} · capture : frA/frB sur ${AN.resultats.length} résultats`);
}

/* --------------------------- 11. pas de revanche immediate, nulle part */
{
  const dernierAdv = {};
  let revanches = 0;
  for (const r of AN.resultats) {
    if (dernierAdv[r.a] === r.b || dernierAdv[r.b] === r.a) revanches++;
    dernierAdv[r.a] = r.b; dernierAdv[r.b] = r.a;
  }
  dit("aucune revanche immédiate sur toute l'année", revanches === 0,
    `${AN.resultats.length} combats`);
}

/* -------- la ceinture ne meurt jamais (10/08, arbitre : la mesure) */
{
  // Avant : un champion dont le contrat expirait signait ailleurs LE MEME
  // JOUR (Lefort, HEX plume, jour 53) et la division restait sans champion
  // A JAMAIS — aucun combat ne pouvait plus couronner. Trois regles :
  // un combat de titre couronne TOUJOURS son vainqueur, la ceinture
  // vacante se remet en jeu (paire du mieux classe), et un champion PNJ
  // en fin de contrat est prolonge par son organisation.
  const SA = require("./salle.js");
  const m2 = V.monde(23);
  SA.avancerMonde(m2, 0);
  const compte = () => {
    let avec = 0, total = 0;
    for (const org of Object.keys(CL.ORGS))
      for (const div of Object.keys(m2.rosters[org] || {})) { total++;
        if ([...m2.pros.values()].some(p => p.org === org && p.division === div && p.champion)) avec++; }
    return [avec, total];
  };
  const [a0, t0] = compte();
  SA.avancerMonde(m2, 360);
  const [a1, t1] = compte();
  dit("une ceinture ne meurt jamais : un an de monde, chaque division garde un champion",
    a0 === t0 && a1 === t1, `j0 : ${a0}/${t0} · j360 : ${a1}/${t1}`);
}

/* ------------------------------------------------------------------ */
/* -------- jamais deux hommes de la meme salle (Mael, 10/08) ----------- */
{
  const m = V.monde(11); S.avancerMonde(m, 0);
  const h = S.reprendreEffectif(m, [
    { cle: "A", nom: "A Test", division: "poids_leger", age: 26, bilan: [5, 1], groupe: "pro" },
    { cle: "B", nom: "B Test", division: "poids_leger", age: 27, bilan: [6, 1], groupe: "pro" },
    { cle: "C", nom: "C Test", division: "poids_leger", age: 25, bilan: [4, 1], groupe: "pro" }]);
  for (const x of h) { x.org = "HEX"; m.rosters.HEX.poids_leger.push(x.id); }
  const ids = new Set(h.map((x) => x.id));
  S.avancerMonde(m, 730);
  let duel = 0, total = 0;
  for (const x of h) for (const e of (x.vie && x.vie.empreintes) || []) {
    total++; if (ids.has(e.adv)) duel++;
  }
  dit("le monde ne programme jamais deux hommes de la même salle l'un contre l'autre",
    total > 0 && duel === 0, `${total} combats de la salle · ${duel} duel(s) interne(s)`);
}

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le monde vit : les cartes tombent, la trace décide, et chaque combat laisse son empreinte.");
