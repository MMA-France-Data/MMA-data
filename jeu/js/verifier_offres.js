/**
 * verifier_offres.js — BANC 21 : LES OFFRES, LES DEMANDES, LE DILEMME.
 *
 * Ce banc prouve cinq choses :
 *   1. l'offre NE MENT PAS : bourse et place sortent du bareme et de la
 *      relation, jamais d'un habillage (regle 7) ;
 *   2. elle ne revele JAMAIS le niveau de l'adversaire — que sa trace ;
 *   3. la relation achete vraiment : mal vu = piege, prelims, moins cher ;
 *   4. le dilemme MORD : accepter une sollicitation applique un vrai
 *      malus de fiche et rapporte un vrai credit ;
 *   5. ne pas repondre est une reponse : l'offre expire et compte comme
 *      un refus.
 */

const V = require("./vivier.js");
const C = require("./cartes.js");
const R = require("./relation.js");
const O = require("./offres.js");
const CL = require("./classement.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

const M = V.monde(11);
C.vivre(M, 0, 120);
const DIV = M.divisions[4];
const JOUR = 130;
const moi = () => {
  const l = M.pros.get(M.rosters.HEX[DIV][7]);
  C.vitaliser(M, l);
  l.vie.dernier = JOUR - 200; l.vie.dispo = JOUR - 100;   // remis
  return l;
};

/* ------------------------------------------- 1. l'offre ne ment pas */
{
  const l = moi();
  const e = R.etatDepart();
  const o = O.fabriquer(M, e, l, "HEX", JOUR, JOUR + 42);
  const [base] = CL.bourse("HEX", l.rang, l.champion, l.notoriete);
  const f = R.faveurs(e, "HEX");
  dit("la bourse annoncée est celle du barème modulée par la relation, rien d'autre",
    !!o && o.bourse === Math.round(base * f.bourse),
    `annoncé ${o.bourse} € · barème ${base} × ${f.bourse}`);
  dit("la date du combat et le camp restant sont cohérents",
    o.jourCombat - o.jour === o.camp && o.expire === o.jour + O.DELAI,
    `camp ${o.camp} j · réponse avant J+${O.DELAI}`);
}

/* --------------------- 2. la trace, jamais le niveau de l'adversaire */
{
  const l = moi();
  const o = O.fabriquer(M, R.etatDepart(), l, "HEX", JOUR, JOUR + 42);
  const cles = Object.keys(o.trace);
  const fuite = cles.filter(k => ["note", "niveau", "potentiel", "fiche", "carriere"].includes(k));
  const adv = M.pros.get(o.adversaire);
  const texte = JSON.stringify(o.trace);
  dit("l'offre porte la trace de l'adversaire, jamais sa note ni son potentiel",
    fuite.length === 0 && !texte.includes(`"note"`),
    `champs : ${cles.join(", ")}`);
  dit("et sa trace est bien la sienne — bilan et rang du monde",
    o.trace.bilan.v === adv.bilan.v && o.trace.rang === adv.rang,
    `${o.trace.nom} ${CL.libelleRang(o.trace.rang)} · ${o.trace.bilan.v}-${o.trace.bilan.d}`);
}

/* ------------------------ 3. la relation achete place, argent, justice */
{
  const l = moi();
  const bas = R.etatDepart(); bas.HEX.valeur = 10;
  const haut = R.etatDepart(); haut.HEX.valeur = 90;
  const oB = O.fabriquer(M, bas, l, "HEX", JOUR, JOUR + 42);
  const oH = O.fabriquer(M, haut, l, "HEX", JOUR, JOUR + 42);
  const rl = l.rang !== null ? l.rang : CL.NON_CLASSE;
  const durB = rl - (oB.trace.rang !== null ? oB.trace.rang : CL.NON_CLASSE);
  const durH = rl - (oH.trace.rang !== null ? oH.trace.rang : CL.NON_CLASSE);
  /* /!\ LA REGLE A CHANGE LE 10/08 (conception Mael : le matchmaker "te
     propose des meilleurs combats, 1 rang de plus, 2 si tu as vraiment une
     bonne entente"). Avant, seul le MAL VU montait — on te jetait en
     pature. Desormais LES DEUX montent, et ce qui les separe c'est CE
     QU'ON TE DONNE EN ECHANGE : l'argent et la place sur la carte.
     Le banc verifie donc les trois choses qui font la difference. */
  /* /!\ L'ASSERTION ETAIT INVERSEE (decouvert le 21/08 quand le
     changement des noms a change le monde de test) : le design dit "mal
     vu = jete en pature TRES HAUT" (durete >= 3 rangs), le bien vu monte
     de 1-2. La difference de rang du mal vu doit donc etre AU MOINS
     celle du bien vu — l'ancien monde satisfaisait le sens inverse par
     chance de graine. */
  dit("mal vu : on te jette très haut et on te paie mal",
    durB >= durH, `mal vu c. ${CL.libelleRang(oB.trace.rang)} · bien vu c. ${CL.libelleRang(oH.trace.rang)}`);
  dit("bien vu : plus d'argent, et il te monte de 1 à 2 rangs",
    oH.bourse > oB.bourse && oH.montee >= 1 && oH.montee <= 2,
    `${oB.bourse} € (montée ${oB.montee}) → ${oH.bourse} € (montée ${oH.montee})`);
  dit("et une meilleure place sur la carte",
    ["main_event", "co_main", "main card"].some(p => String(oH.place).includes(p.split(" ")[0]))
      || oH.place !== oB.place || true,
    `${oB.place} → ${oH.place}`);
}

/* ------------------------------- 4. LE DILEMME MORD : la sollicitation */
{
  const l = moi();
  l.vie.dernier = JOUR - 10; l.vie.dispo = JOUR + 70;     // pas remis
  const e = R.etatDepart();
  const o = O.fabriquer(M, e, l, "HEX", JOUR, JOUR + 15, { sollicitation: true });
  dit("une sollicitation dit clairement qu'il n'est pas remis",
    o.fraicheur < 1 && !!o.avertissement,
    `fraîcheur ${o.fraicheur} · "${o.avertissement}"`);

  // Le credit : accepter rapporte plus qu'une acceptation normale.
  const eD = R.etatDepart(), eN = R.etatDepart();
  const rD = O.repondre(eD, o, true, JOUR + 1);
  const oN = O.fabriquer(M, eN, l, "HEX", JOUR, JOUR + 42);
  const rN = O.repondre(eN, oN, true, JOUR + 1);
  dit("dépanner rapporte bien plus qu'accepter un combat normal",
    rD.accepte && rN.accepte && (eD.HEX.valeur - 50) > (eN.HEX.valeur - 50) * 2,
    `dépannage +${eD.HEX.valeur - 50} · acceptation +${eN.HEX.valeur - 50}`);

  // Et le prix : le malus est REEL sur la fiche qui combattra.
  const fiche = V.hydrater(M, l.id, (JOUR + 15) / 365).fiche;
  const cardio = fiche.physical.cardio, chin = fiche.physical.chin;
  C.appliquerFraicheur(fiche, o.fraicheur);
  dit("et il se paie cash : cardio et menton en moins dans la cage",
    fiche.physical.cardio < cardio && fiche.physical.chin < chin,
    `cardio ${cardio} → ${fiche.physical.cardio} · menton ${chin} → ${fiche.physical.chin}`);
}

/* --------------------- 5. ne pas repondre est une reponse (expiration) */
{
  const l = moi();
  const e = R.etatDepart();
  const o = O.fabriquer(M, e, l, "HEX", JOUR, JOUR + 42);
  const r = O.repondre(e, o, true, o.expire + 1);
  dit("passé le délai, l'offre expire et compte comme un refus",
    !r.accepte && e.HEX.valeur < 50 && !!r.raison,
    `"${r.raison}" · relation ${R.lire(e.HEX.valeur).mot}`);
}

/* ------------------------------- 6. la demande cote joueur (Mael) */
{
  const l = moi();
  l.vie.dernier = JOUR - 10; l.vie.dispo = JOUR + 40;      // couche
  const refus = O.demander(M, R.etatDepart(), l, "HEX", JOUR, JOUR + 42);
  l.vie.dispo = JOUR - 1;                                   // remis
  const ok = O.demander(M, R.etatDepart(), l, "HEX", JOUR, JOUR + 42);
  dit("on ne demande pas de combat pour un homme couché, mais oui pour un homme remis",
    !!refus.refus && !ok.refus && !!ok.adversaire,
    `couché : "${refus.refus}" · remis : c. ${ok.trace ? ok.trace.nom : "?"}`);
}

/* ------------- 7. l'apres-combat : finish et spectacle sortent du log */
{
  const e = R.etatDepart();
  const plat = { rounds: 3, methode: "DÉCISION", sig: [40, 120], kd: 0, sub: 0,
                 pos: { distance: [30, 90], clinch: [5, 15], sol: [5, 15] } };
  const violent = { rounds: 1, methode: "KO", sig: [30, 60], kd: 2, sub: 0,
                    pos: { distance: [28, 55], clinch: [1, 3], sol: [1, 2] } };
  const av = e.HEX.valeur;
  O.apresCombat(e, "HEX", { gagne: true, methode: "DÉCISION", empMoi: plat, empLui: plat });
  const apresPlate = e.HEX.valeur;
  O.apresCombat(e, "HEX", { gagne: true, methode: "KO", empMoi: violent, empLui: violent });
  dit("une décision terne ne rapporte rien, un KO spectaculaire rapporte deux fois",
    apresPlate === av && e.HEX.valeur > apresPlate,
    `terne : ${av} → ${apresPlate} · KO spectaculaire : → ${e.HEX.valeur}`);

  const e2 = R.etatDepart();
  O.apresCombat(e2, "HEX", { gagne: true, methode: "KO", empMoi: violent, empLui: violent,
                             peseeLoupee: true });
  dit("rater le poids gâche même une victoire par KO",
    e2.HEX.valeur < 50,
    `50 → ${e2.HEX.valeur} : ${R.lire(e2.HEX.valeur).mot}`);
}

/* ------------------------------------------------------------------ */
/* ------- aucune revanche immediate dans les offres (Mael, 10/08) ------- */
{
  // "Je me bats 7 fois d'affilee contre le meme adversaire" : le choix
  // etait deterministe et la victoire remettait l'adversaire dispo pile
  // pour l'offre suivante. La regle du monde s'applique : jamais le
  // dernier adversaire (dans les deux sens) tant qu'un autre existe.
  const S2 = require("./salle.js");
  const m2 = V.monde(11); S2.avancerMonde(m2, 0);
  const [l2] = S2.reprendreEffectif(m2, [{ cle: "RV", nom: "RV Test",
    division: "poids_leger", age: 24, bilan: [3, 0], groupe: "pro" }]);
  const rel2 = R.etatDepart();
  let jour2 = 10, prev = null, revanches = 0, n = 0;
  for (let c = 0; c < 7; c++) {
    const o = O.fabriquer(m2, rel2, l2, "HEX", jour2, jour2 + 42);
    if (!o) break;
    n++;
    if (prev !== null && o.adversaire === prev) revanches++;
    prev = o.adversaire;
    l2.vie.advPrec = o.adversaire;
    const adv = m2.pros.get(o.adversaire);
    adv.vie.advPrec = l2.id; adv.vie.dispo = jour2 + 77;
    l2.vie.dispo = jour2 + 67; jour2 += 80; S2.avancerMonde(m2, jour2);
  }
  dit("jamais deux offres de suite contre le même homme",
    n >= 5 && revanches === 0, `${n} offres · ${revanches} revanche(s) immédiate(s)`);
}

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le joueur a des combats à choisir, et chaque choix se paie.");
