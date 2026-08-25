/**
 * verifier_contrats.js — BANC 26 : LES CONTRATS.
 *
 * Prouve les regles du carnet, pas des intentions :
 *   1. trois combats, et aucune sortie avant la fin ;
 *   2. la ceinture rouvre le contrat meme s'il reste des combats ;
 *   3. toutes les organisations evaluent — SUR LA TRACE, jamais le niveau ;
 *   4. ce qu'il exige pour rester est escompte par l'entente ;
 *   5. il a un avis, et parfois il a deja decide ;
 *   6. le rachat existe, et il est RARE.
 */

const V = require("./vivier.js");
const S = require("./salle.js");
const C = require("./contrats.js");
const EN = require("./entente.js");
const CL = require("./classement.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

const neuf = () => {
  const m = V.monde(11);
  const [l] = S.reprendreEffectif(m, [{ cle: "Okonkwo", nom: "Okonkwo",
    division: "poids_welter", age: 27, bilan: [9, 2], groupe: "pro" }]);
  l.entente = EN.etatDepart();
  return { m, l };
};

/* --------------------------------- 1. les trois etats d'un contrat */
{
  const { l } = neuf();
  l.vie.restants = 3;
  const a = C.etat(l);
  l.vie.restants = 1;
  const b = C.etat(l);
  l.vie.restants = 0;
  const c = C.etat(l);
  dit("un contrat court, arrive au dernier combat, puis libère",
    a.statut === "en_cours" && b.statut === "dernier" && c.statut === "libre",
    `${a.statut} → ${b.statut} → ${c.statut}`);
}

/* ------------------- 2. la ceinture rouvre le contrat (règle du carnet) */
{
  const { l } = neuf();
  l.vie.restants = 2;
  const avant = C.etat(l).statut;
  l.champion = true;
  const apres = C.etat(l).statut;
  dit("devenir champion rouvre le contrat même s'il reste des combats",
    avant === "en_cours" && apres === "rouvert",
    "une ceinture ne se paie pas au tarif d'un inconnu");
}

/* ------------- 3. toutes les organisations évaluent, SUR LA TRACE */
{
  const { m, l } = neuf();
  l.vie.restants = 0;
  // Inconnu : seule la sienne le regarde.
  l.notoriete = 3; l.bilan.serie = 0;
  const petit = C.pretendants(m, l, 10);
  // Devenu visible et en série : le haut du panier s'y met.
  l.notoriete = 70; l.bilan.serie = 6;
  const gros = C.pretendants(m, l, 10);
  const monte = gros.some(p => CL.ORGS[p.org].portee > CL.ORGS[l.org].portee);
  dit("un inconnu n'intéresse que sa maison ; un homme en série intéresse le haut",
    petit.length < gros.length && monte,
    `inconnu : ${petit.length} prétendant(s) · en série : ${gros.length}, dont ${gros.filter(p => !p.sienne).map(p => p.org).slice(0, 3).join(", ")}`);

  // /!\ ELLES NE VOIENT QUE LA TRACE : deux hommes de meme trace et de
  // niveaux opposes recoivent les MEMES propositions.
  const { m: m2, l: l2 } = neuf();
  l2.vie.restants = 0; l2.notoriete = 70; l2.bilan.serie = 6;
  l2.fiche = S.fabriquerFicheSalle({ cle: "AutreNiveau", division: "poids_welter", age: 27 });
  const autre = C.pretendants(m2, l2, 10);
  dit("elles ne voient pas le niveau : même trace, mêmes propositions",
    JSON.stringify(gros.map(p => [p.org, p.bourse]))
      === JSON.stringify(autre.map(p => [p.org, p.bourse])),
    "la fiche moteur ne change rien aux offres");
}

/* ------------------ 4. son prix pour rester suit l'entente */
{
  const { m, l } = neuf();
  l.vie.restants = 0; l.notoriete = 70; l.bilan.serie = 6;
  const props = C.pretendants(m, l, 10);
  l.entente.valeur = 15;
  const froid = C.prixDeSaFidelite(l, props);
  l.entente.valeur = 95;
  const chaud = C.prixDeSaFidelite(l, props);
  dit("deux ans de bonne relation valent une vraie remise sur le prix de le garder",
    !!froid && !!chaud && froid.exige > chaud.exige * 1.4,
    `en froid : ${froid.exige.toLocaleString("fr-FR")} € · en confiance : ${chaud.exige.toLocaleString("fr-FR")} € ` +
    `(le concurrent propose ${froid.concurrent.bourse.toLocaleString("fr-FR")} €)`);
}

/* ---------- 5. il a un avis — et l'entente amortit sans bloquer */
{
  const { m, l } = neuf();
  l.vie.restants = 0; l.notoriete = 70; l.bilan.serie = 6;
  const props = C.pretendants(m, l, 10);
  const sienne = props.find(p => p.sienne);

  /* /!\ UN ECART MODERE : c'est la que l'entente joue. Devant une offre
     ENORME (une internationale contre ta nationale), il part quoi qu'il
     arrive — et c'est la regle, pas un defaut : l'entente amortit, elle
     ne bloque pas. Verifie juste apres. */
  const modeste = { org: "TRI", nom: "Trident FC", sienne: false,
                    bourse: Math.round(sienne.bourse * 1.35), combats: 3 };
  l.entente.valeur = 95;
  const fidele = C.sonAvis(l, sienne, [sienne, modeste], 0.99);
  l.entente.valeur = 10;
  const fuyard = C.sonAvis(l, sienne, [sienne, modeste], 0.99);
  dit("sur un écart modéré, la confiance le garde — en froid, il s'en va",
    fidele.accepte && !fuyard.accepte,
    `+35 % ailleurs · en confiance : « ${fidele.mot.slice(0, 55)}… » · en froid : il part`);

  /* /!\ ET DEVANT UNE OFFRE ENORME, MEME A ENTENTE PARFAITE, IL PART. */
  const enorme = props.find(p => !p.sienne && p.bourse > sienne.bourse * 3);
  l.entente.valeur = 100;
  const devantEnorme = enorme ? C.sonAvis(l, sienne, [sienne, enorme], 0.99) : null;
  dit("mais aucune entente ne retient un homme devant un chèque cinq fois plus gros",
    !!enorme && !devantEnorme.accepte,
    enorme ? `${enorme.nom} propose ${enorme.bourse.toLocaleString("fr-FR")} € contre ${sienne.bourse.toLocaleString("fr-FR")} €` : "—");

  // /!\ ET PARFOIS IL A DEJA DECIDE : le joueur ne controle pas ses hommes.
  l.entente.valeur = 30;
  const decide = C.sonAvis(l, sienne, props, 0.01);
  dit("et parfois il a déjà donné sa parole ailleurs — ça ne se rattrape pas",
    decide.deja_decide === true && !decide.accepte, decide.mot);
}

/* --------------------------- 6. signer deplace vraiment l'homme */
{
  const { m, l } = neuf();
  l.vie.restants = 0; l.notoriete = 70; l.bilan.serie = 6; l.rang = 4;
  const props = C.pretendants(m, l, 10);
  const ailleurs = props.find(p => !p.sienne);
  const orgAvant = l.org;
  C.signer(m, l, ailleurs, 20);
  dit("signer ailleurs te sort du roster, te met dans l'autre, et te déclasse",
    l.org === ailleurs.org && l.rang === null && l.vie.restants === C.NEUF
      && !m.rosters[orgAvant][l.division].includes(l.id)
      && m.rosters[l.org][l.division].includes(l.id),
    `${orgAvant} → ${l.org} · ${C.NEUF} combats · non classé (un rang ne se transporte pas)`);
}

/* ----------------------------- 7. le rachat existe, et il est rare */
{
  const { m, l } = neuf();
  l.vie.restants = 2; l.notoriete = 70; l.bilan.serie = 6;
  const jamais = C.rachat(m, l, 10, 0.99);
  const parfois = C.rachat(m, l, 10, 0.01);
  // Et un homme ordinaire n'est jamais rachete, meme au tirage favorable.
  const ordinaire = neuf();
  ordinaire.l.vie.restants = 2; ordinaire.l.notoriete = 10; ordinaire.l.bilan.serie = 1;
  const rien = C.rachat(ordinaire.m, ordinaire.l, 10, 0.01);
  dit("le rachat est réservé au phénomène, et reste rare même pour lui",
    jamais === null && !!parfois && rien === null,
    parfois ? `${parfois.org} paierait ${parfois.indemnite.toLocaleString("fr-FR")} € d'indemnité` : "—");

  // /!\ AUCUNE SORTIE AVANT LA FIN, SAUF CA : un homme sous contrat sans
  // rachat n'a aucun pretendant qui puisse le prendre.
  const st = C.etat(l);
  dit("hors rachat, un homme sous contrat n'est pas libre",
    st.statut === "en_cours" && st.restants === 2, `${st.restants} combats à honorer`);
}

/* ---------------- 7. la porte regionale (arbitrage Mael, 10/08, opt. C) */
{
  // Un pro fraichement passe : SANS MAISON, notoriete nulle, trace
  // amateur positive. Avant : refuse PARTOUT (radar 16 mini + serie pro
  // exigee) — verrou ferme a vie, il ne peut ni combattre ni devenir
  // visible. La plus petite organisation est LA porte du circuit.
  const { m, l } = neuf();
  l.org = null; l.rang = null; l.notoriete = 0;
  l.bilan = { v: 3, d: 0, serie: 0 };
  const porte = C.porteRegionale();
  const p = C.chanceDe(m, l, porte);
  const r = C.demarcher(m, l, porte, 10, 0.80);
  dit("un débutant à trace positive trouve la porte du circuit régional",
    p >= 0.85 && r.pris === true,
    `${porte} · chance ${Math.round(p * 100)} % · ${r.pris ? "pris" : "refusé"}`);

  // Mais la porte regarde la trace : un 0-3 reste un pari perdu.
  const perdu = neuf();
  perdu.l.org = null; perdu.l.rang = null; perdu.l.notoriete = 0;
  perdu.l.bilan = { v: 0, d: 3, serie: 0 };
  const p2 = C.chanceDe(perdu.m, perdu.l, porte);
  dit("la porte régionale regarde la trace — un 0-3 n'a pas de passe-droit",
    p2 < 0.5, `chance ${Math.round(p2 * 100)} %`);

  // Et un homme DEJA engage n'a pas la porte : elle est pour les libres.
  const pris = neuf();
  pris.l.notoriete = 0; pris.l.bilan = { v: 3, d: 0, serie: 0 };
  dit("la porte ne vaut que pour un homme libre",
    C.demarcher(pris.m, pris.l, porte, 10, 0.5).pris === false,
    `il est à ${pris.l.org}`);
}

/* --------------- 8. sous le radar, on signe au rabais (opt. C, suite) */
{
  const { m, l } = neuf();
  l.org = null; l.rang = null; l.notoriete = 0;
  l.bilan = { v: 3, d: 0, serie: 0 };
  const porte = C.porteRegionale();
  const plein = C.valeurChez(l, porte);
  const r = C.demarcher(m, l, porte, 10, 0.5);
  dit("sous le radar, l'organisation qui dit oui paie 70 % du barème",
    r.pris && r.bourse === Math.round(plein * 0.7),
    `${r.bourse.toLocaleString("fr-FR")} € contre ${plein.toLocaleString("fr-FR")} € au barème — un inconnu ne négocie pas`);

  // Au-dessus du radar, le bareme s'applique plein.
  const vu = neuf();
  vu.l.org = null; vu.l.rang = null; vu.l.notoriete = 40;
  vu.l.bilan = { v: 9, d: 2, serie: 3 };
  const r2 = C.demarcher(vu.m, vu.l, porte, 10, 0.01);
  dit("au-dessus du radar, pas de rabais : le barème s'applique",
    r2.pris && r2.bourse === C.valeurChez(vu.l, porte),
    `${r2.bourse.toLocaleString("fr-FR")} € plein tarif`);
}

/* ------------------------------------------------------------------ */
/* -------- les matchmakers : ca aide, ca n'ouvre pas (Mael, 10/08) ------ */
{
  // Regle dictee : "les matchmakers, oui — ca aide, ca n'ouvre pas les
  // portes completement". Deux invariants, dans les deux sens.
  const { m, l } = neuf();
  l.org = null; l.rang = null; l.notoriete = 30;
  l.bilan = { v: 8, d: 1, serie: 4 };
  const sans = C.chanceDe(m, l, "SOK");
  const prixSans = C.valeurChez(l, "SOK", m);

  // On lui donne un champion maison dans cette organisation.
  // /!\ neuf() ne cree QU'UN homme : il faut en inscrire un second, sinon
  // il n'y a aucun champion a trouver et le banc mesure zero.
  const [champ] = S.reprendreEffectif(m, [{ cle: "Vedette", nom: "Vedette",
    division: l.division, age: 29, bilan: [12, 1], groupe: "pro" }]);
  champ.org = "SOK"; champ.rang = 1; champ.champion = true;
  champ.bilan = { v: 12, d: 1, serie: 5 };
  const avec = C.chanceDe(m, l, "SOK");
  const prixAvec = C.valeurChez(l, "SOK", m);
  dit("un champion maison aide vraiment — chance et bourse montent",
    avec > sans && prixAvec > prixSans,
    `${Math.round(sans * 100)} % → ${Math.round(avec * 100)} % · ${prixSans} → ${prixAvec} €`);
  dit("mais l'aide reste bornée : jamais plus de 20 points de chance",
    avec - sans <= 0.20, `+${Math.round((avec - sans) * 100)} points`);

  // Et un dossier vide reste un dossier vide.
  const vide = { id: -999, nom: "Vide", division: l.division, org: null,
                 rang: null, notoriete: 0, bilan: { v: 0, d: 4, serie: 0 },
                 vie: { dispo: 0 } };
  dit("un 0-4 ne signe pas parce que son manager a un champion",
    C.chanceDe(m, vide, "SOK") < 0.15,
    `${Math.round(C.chanceDe(m, vide, "SOK") * 100)} %`);
}

/* ------------------------- 7. le contrat de salle (Mael, 14/08) */
{
  // LES FRAIS DE DOSSIER : quatre paliers, lus sur le standing du jour.
  const { l } = neuf();
  l.org = null; l.rang = null; l.champion = false;
  dit("sans organisation : frais régionaux (500 €)",
    C.fraisDossier(l) === 500, `${C.fraisDossier(l)} €`);
  l.org = "SOK";
  dit("roster européen : frais de confirmé (1 500 €)",
    C.fraisDossier(l) === 1500, `${C.fraisDossier(l)} €`);
  l.org = "AFC"; l.rang = 14;
  dit("roster AFC hors top 10 : frais internationaux (4 000 €)",
    C.fraisDossier(l) === 4000, `${C.fraisDossier(l)} €`);
  l.rang = 5;
  dit("top 10 : frais d'élite (10 000 €)",
    C.fraisDossier(l) === 10000, `${C.fraisDossier(l)} €`);
  l.rang = null; l.champion = true;
  dit("champion : frais d'élite même sans rang affiché",
    C.fraisDossier(l) === 10000, `${C.fraisDossier(l)} €`);

  // LA DUREE EST BORNEE PAR LE MODULE, pas par l'ecran : 2 a 4.
  const { l: l2 } = neuf();
  C.signerSalle(l2, 0.20, 8, 0);
  dit("signer 8 combats en signe 4 — la borne vit dans le module",
    l2.contratSalle.combats === 4, `${l2.contratSalle.combats}`);
  C.signerSalle(l2, 0.20, 1, 0);
  dit("signer 1 combat en signe 2 — pas d'accord d'un soir",
    l2.contratSalle.combats === 2, `${l2.contratSalle.combats}`);

  // L'ECHEANCE : un accord se decompte, et echu il ne lie plus.
  const { l: l3 } = neuf();
  C.signerSalle(l3, 0.20, 2, 0);
  dit("fraîchement signé, l'accord n'est pas échu", !C.salleEchue(l3));
  l3.contratSalle.restants--; l3.contratSalle.restants--;
  dit("deux combats plus tard, l'accord est échu", C.salleEchue(l3));
  C.signerSalle(l3, 0.18, 3, 40);
  dit("la re-signature repart à neuf — restants pleins, part du jour",
    !C.salleEchue(l3) && l3.contratSalle.restants === 3 && l3.contratSalle.part === 0.18,
    `${l3.contratSalle.restants} restants · ${Math.round(l3.contratSalle.part * 100)} %`);
}

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — un contrat lie, une ceinture rouvre, et on ne retient pas un homme qui veut partir.");
