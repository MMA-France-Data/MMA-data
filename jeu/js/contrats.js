/**
 * contrats.js — CE QUI TE LIE A UNE ORGANISATION, ET CE QUI TE LIBERE.
 *
 * Module natif JS, tenu par invariants (banc 26). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LES REGLES ETAIENT DEJA GRAVEES AU CARNET — ON NE LES REINVENTE PAS
 * ===================================================================
 *   - un contrat porte TROIS COMBATS ;
 *   - AUCUNE SORTIE AVANT LA FIN, sauf rachat par une autre organisation,
 *     et c'est RARE (le phenomene qu'on vient arracher) ;
 *   - DEVENIR CHAMPION ROUVRE LE CONTRAT meme s'il reste des combats :
 *     une ceinture ne se paie pas au tarif d'un inconnu ;
 *   - a la fin, TOUTES LES ORGANISATIONS EVALUENT — pas de chemin oblige.
 *     Elles ne voient que LA TRACE (bilan, serie, notoriete), jamais le
 *     niveau ;
 *   - ce qu'il te demande pour rester est ESCOMPTE PAR L'ENTENTE
 *     (entente.prixPourRester) ;
 *   - et L'ENTENTE AMORTIT LE DEPART, ELLE NE LE BLOQUE PAS
 *     (entente.tentation) : devant une offre enorme, on ne le retient pas.
 */

const CL = require("./classement.js");
const EN = require("./entente.js");
const O = require("./offres.js");
const SA = require("./salle.js");   // ORG_DEPART : le circuit du pays de la salle

/** Un contrat neuf. */
/* ==== LES MATCHMAKERS (conception de Mael, 10/08) =======================
   "Les matchmakers, oui — ça aide, ça n'ouvre pas les portes
   complètement."
   Chaque organisation a UN homme qui decide, avec un nom et un
   caractere. Il ne regarde pas que le dossier du combattant qu'on lui
   presente : IL REGARDE CE QUE TES AUTRES HOMMES VALENT CHEZ LUI. Un
   quasi-champion dans son organisation te rend credible pour le suivant.
   /!\ MAIS CA AIDE SEULEMENT — arbitrage explicite de Mael. Les seuils
   d'entree (radar, serie, division, place au roster) NE SAUTENT PAS. La
   reputation deplace une chance, elle ne fabrique pas un dossier. */
/**
 * CE QUE TES AUTRES HOMMES VALENT CHEZ EUX — de 0 a 1.
 * /!\ PLAFONNE : meme avec cinq champions, on ne depasse pas 1. Et ca
 * AIDE seulement (arbitrage Mael) : les seuils d'entree ne sautent pas.
 */
function reputationChez(m, org, moi) {
  if (!m || !m.pros) return 0;
  let s = 0;
  for (const l of m.pros.values()) {
    if (!l.salle || l.org !== org) continue;      // seulement TES hommes, chez EUX
    if (moi && l.id === moi.id) continue;         // il ne se recommande pas lui-meme
    if (l.champion) s += 0.55;
    else if (l.rang !== null && l.rang <= 5) s += 0.32;
    else if (l.rang !== null) s += 0.18;
    else s += 0.06;
    s += Math.min(0.12, (l.bilan.serie || 0) * 0.03);
  }
  return Math.min(1, s);
}

/** Ce que le matchmaker DIT de toi — jamais un chiffre. */
function avisMatchmaker(m, org, moi) {
  const r = reputationChez(m, org, moi), mm = CL.matchmakerDe(org);
  const mot = r >= 0.7 ? `${mm.nom} décroche quand tu appelles.`
    : r >= 0.4 ? `${mm.nom} connaît ton travail — ça compte un peu.`
    : r >= 0.15 ? `${mm.nom} sait qui tu es, sans plus.`
    : `${mm.nom} ne t'a jamais vu.`;
  return { nom: mm.nom, trait: mm.trait, mot, phrase: mm.mot, force: r };
}

const NEUF = 3;

/** Le delai de reflexion d'une proposition de contrat, en jours. */
const DELAI = 14;

/**
 * L'etat contractuel d'un homme, en clair.
 * @returns {object} { org, restants, statut }
 *   statut : "en_cours" | "dernier" | "libre" | "rouvert"
 */
function etat(l) {
  const v = l.vie || {};
  const restants = v.restants !== undefined ? v.restants : 0;
  if (!l.org) return { org: null, restants: 0, statut: "libre" };
  // /!\ LA CEINTURE ROUVRE TOUT : meme avec des combats au contrat, un
  // champion renegocie. C'est la regle du carnet, et c'est le reel.
  if (l.champion && !v.ceintureNegociee)
    return { org: l.org, restants, statut: "rouvert" };
  if (restants <= 0) return { org: l.org, restants: 0, statut: "libre" };
  if (restants === 1) return { org: l.org, restants, statut: "dernier" };
  return { org: l.org, restants, statut: "en_cours" };
}

/**
 * Ce que vaut un homme pour une organisation donnee — /!\ SUR LA TRACE
 * SEULEMENT. C'est la bourse du bareme, majoree par ce qu'il a montre.
 */
function valeurChez(l, org, m) {
  /* /!\ ET SUR LE PRIX : jusqu'a +12 %. Un manager dont les hommes
     gagnent chez eux negocie mieux pour le suivant. */
  const [base] = CL.bourse(org, l.rang, l.champion, l.notoriete);
  const serie = Math.min(5, (l.bilan && l.bilan.serie) || 0);
  const rep = m ? reputationChez(m, org, l) : 0;
  return Math.round(base * (1 + serie * 0.06) * (1 + rep * 0.12));
}

/**
 * QUI VEUT DE LUI. Toutes les organisations evaluent — la sienne comprise.
 * /!\ TROIS CONDITIONS, LES MEMES QUE POUR UNE SIGNATURE NPC : elles
 * doivent le VOIR (notoriete >= radar), sa serie doit passer leur barre,
 * et elles doivent avoir de la place. Pas de chemin oblige : une
 * internationale peut cueillir un homme d'une nationale.
 * @returns {object[]} propositions triees, la meilleure d'abord
 */
function pretendants(m, l, jour) {
  const sortie = [];
  for (const cle of Object.keys(CL.ORGS)) {
    const o = CL.ORGS[cle];
    const sienne = cle === l.org;
    // Le radar : en dessous, on n'existe pas pour elle.
    if (!sienne && l.notoriete < o.portee * 0.4) continue;
    if (!sienne && (l.bilan.serie || 0) < CL.serieRequise(cle, l.notoriete)) continue;
    if (!sienne && m && m.rosters[cle] && m.rosters[cle][l.division]
        && m.rosters[cle][l.division].length >= 34) continue;
    const bourse = valeurChez(l, cle);
    sortie.push({
      org: cle, nom: o.nom, sienne, bourse, combats: NEUF,
      expire: jour + DELAI,
      // /!\ CE QU'ELLE PROPOSE EST CE QU'ELLE PAIERA (regle 7) : la
      // bourse du bareme, pas un chiffre d'affichage.
      total: bourse * NEUF,
    });
  }
  sortie.sort((a, b) => b.bourse - a.bourse);
  return sortie;
}

/**
 * CE QUE LUI EN PENSE. /!\ IL N'EST PAS UN OBJET : il a un avis, et
 * parfois il a deja decide. L'entente amortit, elle ne bloque pas.
 * @param {object} l        le combattant (porte l.entente)
 * @param {object} choix    la proposition que TU veux accepter
 * @param {object[]} toutes toutes les propositions
 * @param {number} [tirage] pour les bancs : force le hasard
 */
function sonAvis(l, choix, toutes, tirage) {
  const e = l.entente || EN.etatDepart();
  const meilleure = toutes.reduce((a, b) => (b.bourse > a.bourse ? b : a), toutes[0]);
  const p = EN.lire(e.valeur);

  // Tu lui proposes de rester chez lui alors que mieux existe ailleurs ?
  if (choix.sienne && meilleure && !meilleure.sienne && meilleure.bourse > choix.bourse) {
    /* /!\ ON COMPARE EN POURCENTAGE, PAS EN EUROS. Passer des bourses
       brutes a tentation() rendait l'entente insignifiante : 60 points
       d'entente ne pesaient rien face a un ecart de 15 000 €. En
       pourcentage, l'entente peut absorber jusqu'a ~60 % d'ecart de
       salaire — au-dela, il part, et c'est juste. */
    const ecart = (meilleure.bourse - choix.bourse) / Math.max(1, choix.bourse) * 100;
    const t = EN.tentation(e, ecart, 0, tirage);
    if (t.deja_decide)
      return { accepte: false, deja_decide: true,
               mot: `Il a déjà donné sa parole à ${meilleure.nom}. Ça ne se rattrape pas.`,
               degat_reputation: t.degat_reputation };
    if (t.part)
      return { accepte: false, deja_decide: false,
               mot: `Il ne comprend pas. ${meilleure.nom} paie mieux, et il le sait — ${t.maniere}.`,
               degat_reputation: t.degat_reputation };
    return { accepte: true, mot: `Il te suit, même si ce n'est pas le plus gros chèque. ${p.mot.charAt(0).toUpperCase() + p.mot.slice(1)}.` };
  }
  return { accepte: true,
           mot: choix.sienne ? "Il resigne sans discuter."
                             : `${choix.nom}, ça lui va. Il veut voir plus haut.` };
}

/**
 * CE QU'IL DEMANDE POUR RESTER — escompte par l'entente
 * (entente.prixPourRester). Deux ans de bonne relation valent une vraie
 * remise ; en froid, il exige plus que le marche.
 */
function prixDeSaFidelite(l, propositions) {
  const e = l.entente || EN.etatDepart();
  const ailleurs = propositions.filter(p => !p.sienne);
  if (!ailleurs.length) return null;
  const meilleure = ailleurs.reduce((a, b) => (b.bourse > a.bourse ? b : a));
  return { concurrent: meilleure, exige: EN.prixPourRester(e, meilleure.bourse) };
}

/** Signer. Pose le contrat, deplace l'homme si l'organisation change. */
function signer(m, l, proposition, jour) {
  const avant = l.org;
  if (m && avant && m.rosters[avant] && m.rosters[avant][l.division]) {
    const r = m.rosters[avant][l.division];
    const i = r.indexOf(l.id);
    if (i >= 0 && avant !== proposition.org) r.splice(i, 1);
  }
  if (avant !== proposition.org) {
    l.org = proposition.org;
    // /!\ ON REPART NON CLASSE : un rang ne se transporte pas d'une
    // organisation a l'autre. C'est le prix du changement de maison.
    l.rang = null; l.champion = false;
  }
  // /!\ ON S'ASSURE TOUJOURS DE LA PRESENCE AU ROSTER, meme quand
  // l'organisation ne change pas : un homme tout juste passe pro portait
  // deja le nom de sa nationale sans y etre inscrit, et il signait dans
  // le vide (trouve en jouant, 09/08).
  if (m && m.rosters[l.org] && m.rosters[l.org][l.division]
      && !m.rosters[l.org][l.division].includes(l.id))
    m.rosters[l.org][l.division].push(l.id);
  if (!l.vie) l.vie = {};
  l.vie.restants = proposition.combats;
  l.vie.bourseContrat = proposition.bourse;
  l.vie.signeLe = jour;
  if (l.champion) l.vie.ceintureNegociee = true;
  return { org: l.org, restants: l.vie.restants, bourse: proposition.bourse };
}

/**
 * LE RACHAT — /!\ RARE, ET RESERVE AU PHENOMENE. Une organisation paie
 * pour l'arracher AVANT la fin de son contrat. Le carnet dit : une ou
 * deux fois par generation.
 * @returns {object|null} la proposition de rachat, ou null
 */
function rachat(m, l, jour, tirage) {
  const st = etat(l);
  if (st.statut === "libre" || st.restants <= 0) return null;
  // Il faut etre un phenomene : gros elan et deja tres vu.
  if ((l.bilan.serie || 0) < 5 || l.notoriete < 55) return null;
  const hauts = pretendants(m, l, jour).filter(p => !p.sienne
    && CL.ORGS[p.org].portee > CL.ORGS[l.org].portee);
  if (!hauts.length) return null;
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > 0.12) return null;                   // rare, meme quand tout est reuni
  const p = hauts[0];
  return Object.assign({}, p, { rachat: true, indemnite: Math.round(p.bourse * 1.5) });
}

/* ==================================================================== */
/* /!\ DEUX CONTRATS, PAS UN (correction de Mael, 09/08)                 */
/* ==================================================================== */
/* J'avais fusionne deux choses qui n'ont rien a voir :                   */
/*   1. LE CONTRAT DE SALLE — entre TOI et LUI : combien de combats il    */
/*      te doit, et quelle PART tu prends sur ses bourses. C'est ca que   */
/*      l'entente escompte, et c'est ca qu'il renegocie quand il monte.   */
/*   2. L'ENGAGEMENT EN ORGANISATION — c'est TOI qui vas la demarcher     */
/*      pour lui, avec des chances de reussite CACHEES. Et parfois une    */
/*      organisation t'approche d'elle-meme.                              */
/* L'ORDRE DU JEU : il passe pro -> on negocie le contrat de salle -> tu  */
/* lui trouves une organisation -> il peut combattre.                     */

/** La part que prend la salle par defaut, et les bornes du negociable. */
const PART_DEFAUT = 0.20, PART_MIN = 0.05, PART_MAX = 0.30;

/** La duree d'un contrat de salle, EN COMBATS. /!\ 2 A 4, PAS PLUS
 *  (Mael, 14/08 : "8 ca fait trop, 2 a 4 max"). On quitte son gym quand
 *  on veut dans le reel — l'engagement court est la regle, pas l'exception. */
const DUREE_MIN = 2, DUREE_MAX = 4;

/* ==================================================================== */
/* LES FRAIS DE DOSSIER (Mael, 14/08) — PAS UN SALAIRE.                 */
/* La salle ne paie jamais l'homme : elle paie LES PAPIERS. L'avocat qui */
/* redige, le manager licencie, l'administratif. Une somme FIXE, a la    */
/* signature et a chaque renouvellement — jamais pendant.                */
/* /!\ FIXE PAR PALIER, PAS EN POURCENTAGE : un accord de pre-prelims,   */
/* c'est trois pages ; un top 5 avec sponsors et droits d'image, c'est   */
/* un cabinet. Le palier se lit sur SON STANDING DU JOUR — un homme qui  */
/* monte coute plus cher a re-signer, comme en vrai.                     */
/* ==================================================================== */
const FRAIS_DOSSIER = {
  regional:      500,   // sans organisation, ou nationale non classe
  confirme:     1500,   // classe, ou roster europeen
  international: 4000,  // roster GFL/AFC hors top 10
  elite:        10000,  // top 10 ou champion : clauses, negociation longue
};

/** Le palier de frais d'un homme, lu sur son standing du jour. */
function fraisDossier(l) {
  /* /!\ LE PALIER SE PONDERE PAR L'ORGANISATION (Mael, 21/08 : "il me
     demande 10k pour le re-signer" — pour un top 10 d'Hexagone !). Le
     rang seul decidait : un top 10 de nationale coutait comme un top 10
     mondial. Le standing, c'est le rang DANS SON MONDE : en nationale,
     un classe reste un dossier confirme (1 500), un champion vaut le
     cabinet international (4 000) ; l'elite (10 000) est reservee aux
     rosters internationaux. */
  const o = l.org ? CL.ORGS[l.org] : null;
  const niv = o ? o.niveau : null;
  if (niv === "internationale") {
    if (l.champion || (l.rang != null && l.rang <= 10)) return FRAIS_DOSSIER.elite;
    return FRAIS_DOSSIER.international;
  }
  if (niv === "européenne") {
    if (l.champion) return FRAIS_DOSSIER.international;
    return FRAIS_DOSSIER.confirme;
  }
  if (o) { // nationale
    if (l.champion) return FRAIS_DOSSIER.international;
    if (l.rang != null) return FRAIS_DOSSIER.confirme;
  }
  return FRAIS_DOSSIER.regional;
}

/** Le contrat de salle d'un homme. Vit sur lui, pas sur le monde. */
function contratSalle(l) {
  return l.contratSalle || null;
}

/**
 * CE QU'IL ACCEPTE DE TOI. /!\ SA REACTION SORT DE L'ENTENTE ET DE CE
 * QUE TU LUI PRENDS — pas d'un tirage. Une part elevee passe quand il te
 * fait confiance ; en froid, il la refuse.
 * @returns {object} { accepte, mot, exigee }
 */
function avisSurPart(l, part, combats) {
  const e = l.entente || EN.etatDepart();
  // Ce qu'il trouverait normal : 20 % chez un coach quelconque, moins
  // s'il ne t'aime pas, plus s'il te doit tout.
  const tolere = PART_DEFAUT + (e.valeur - 50) / 100 * 0.14;
  const trop = part - tolere;
  // Un contrat long se paie aussi : plus tu l'engages, plus il regarde.
  const poids = trop + Math.max(0, combats - 3) * 0.012;
  if (poids <= 0)
    return { accepte: true, exigee: part,
             mot: part <= tolere - 0.04 ? "Il n'en revient pas. Il signe tout de suite."
                                        : "Ça lui va." };
  if (poids <= 0.05)
    return { accepte: true, exigee: part,
             mot: "Il trouve ça cher, mais il signe." };
  return { accepte: false, exigee: Math.round(tolere * 100) / 100,
           mot: `Il refuse. Il ne descend pas en dessous de ${Math.round((1 - tolere) * 100)} % pour lui.` };
}

/** Signer le contrat de salle. /!\ LA DUREE EST BORNEE ICI, pas a
 *  l'ecran : un appel de code qui passerait 8 signerait quand meme 4. */
function signerSalle(l, part, combats, jour) {
  const n = Math.max(DUREE_MIN, Math.min(DUREE_MAX, combats));
  l.contratSalle = { part, combats: n, restants: n, signeLe: jour };
  return l.contratSalle;
}

/** Le contrat de salle est-il ECHU ? Un contrat echu ne lie plus :
 *  pas de demarchage en son nom, et PAS DE PART sur ses bourses —
 *  on ne preleve pas sans accord. C'est l'incitation a re-signer. */
function salleEchue(l) {
  const cs = l.contratSalle;
  return !!cs && cs.restants <= 0;
}

/* ==================================================================== */
/* LE DEMARCHAGE — /!\ LES CHANCES SONT CACHEES (Mael).                 */
/* Tu envoies son dossier, tu ne sais pas ce qu'ils en feront. Ce que tu  */
/* peux lire, c'est ce que TOUT LE MONDE lit : sa trace.                  */
/* ==================================================================== */

/**
 * La probabilite qu'une organisation le prenne. JAMAIS AFFICHEE — elle
 * sert au tirage, et l'ecran n'en montre qu'une appreciation grossiere.
 */
/* /!\ UNE NATIONALE ETRANGERE PREND DES LOCAUX (Mael, 21/08 : "pour un
 * contrat a 1000 € combattre en Russie ?"). La Taiga FC ne fait pas
 * voyager un inconnu de l'autre bout du continent pour une petite
 * bourse — elle paie local, comme dans le reel. La porte s'ouvre quand
 * l'homme VAUT le deplacement : notoriete au niveau de la portee de
 * l'organisation. Les europeennes prennent leur continent, les
 * internationales prennent le monde — rien ne change pour elles. */
function prendDesLocaux(o, l) {
  return o.niveau && o.niveau.startsWith("nationale")
    && o.pays !== "France"
    && (l.notoriete || 0) < o.portee;
}

function chanceDe(m, l, org) {
  const o = CL.ORGS[org];
  if (prendDesLocaux(o, l)) return 0.02;
  const radar = o.portee * 0.4;
  // Il faut d'abord qu'elle le voie.
  let p = 0.05;
  if (l.notoriete >= radar) p += 0.35;
  else p += 0.30 * (l.notoriete / Math.max(1, radar));
  // Sa serie et son bilan parlent pour lui.
  p += Math.min(0.30, (l.bilan.serie || 0) * 0.07);
  const ratio = (l.bilan.v + 1) / (l.bilan.v + l.bilan.d + 2);
  p += (ratio - 0.5) * 0.35;
  // Et la place : une organisation pleine ne prend personne.
  if (m && m.rosters[org] && m.rosters[org][l.division]) {
    const n = m.rosters[org][l.division].length;
    /* /!\ LA CIBLE COMPTE LES TETES D'AFFICHE (10/08). Depuis qu'elles
       s'ajoutent en tete de leur division (cas 40), l'AFC poids leger
       compte 51 hommes pour une cible de 50 : l'organisation etait
       declaree PLEINE en permanence, et signer y devenait plus dur
       qu'avant sans que rien ne le justifie. Mesure : un champion maison
       faisait 41 % -> 51 %, puis 21 % des que le roster passait a 52. */
    const etoiles = [...m.pros.values()]
      .filter(x => x.etoile && x.org === org && x.division === l.division).length;
    const cible = (org === "AFC" ? 50 : 30) + etoiles;
    if (n >= cible + 2) p -= 0.30;
    else if (n < cible - 1) p += 0.08;
  }
  // Plus l'organisation est haute, plus c'est dur.
  p -= (o.portee - 40) / 100 * 0.42;
  /* /!\ LE MATCHMAKER TE CONNAIT — ET CA AIDE, RIEN DE PLUS (arbitrage
     Mael). Au mieux +0,18 : de quoi transformer un dossier limite en
     dossier accepte, jamais de quoi faire signer un homme qui n'a rien
     a montrer. Les seuils d'entree restent ou ils sont. */
  p += reputationChez(m, org, l) * 0.18;
  // /!\ LA PORTE REGIONALE (arbitrage Mael, 10/08, option C). Un pro
  // fraichement passe (sans maison, notoriete nulle) etait refuse
  // PARTOUT : radar a 16 minimum, serie pro exigee, et meme la plus
  // petite orga n'etait qu'un jet de des. Verrou ferme a vie — il ne
  // peut pas gagner de notoriete sans combattre, ni combattre sans orga.
  // LE CIRCUIT REGIONAL SIGNE DES DEBUTANTS TOUTE L'ANNEE : la plus
  // petite organisation prend un homme libre dont la trace est positive
  // (plus de victoires que de defaites, amateur compris). Elle regarde
  // quand meme la trace : un 0-3 reste un pari perdu d'avance.
  if (!l.org && org === porteRegionale()) {
    if ((l.bilan.v || 0) > (l.bilan.d || 0)) p = Math.max(p, 0.85);
    /* /!\ L'ENTREE S'OUVRE AUX 0-0 (Mael, 21/08 : "Hexagone c'est trop
       dur, c'est une entree") : un debutant sans trace n'etait qu'un jet
       de des. Le circuit d'entree signe aussi les dossiers vierges —
       moins volontiers qu'une trace positive, mais il signe. */
    else if ((l.bilan.v || 0) >= (l.bilan.d || 0)) p = Math.max(p, 0.55);
  }
  return Math.max(0.02, Math.min(0.92, p));
}

/**
 * LA PORTE DU CIRCUIT — /!\ CELLE DU PAYS DE LA SALLE, pas la plus
 * petite du monde. Apres la construction du monde, la plus petite orga
 * est une nationale etrangere (SWE_N, portee 30) : un debutant de
 * Marseille ne va pas faire ses debuts en Suede. La porte est
 * ORG_DEPART (salle.js) — le circuit national de la maison. Repli sur
 * la plus petite portee si jamais il n'existait pas.
 */
function porteRegionale() {
  if (SA.ORG_DEPART && CL.ORGS[SA.ORG_DEPART]) return SA.ORG_DEPART;
  let cle = null, portee = Infinity;
  for (const k of Object.keys(CL.ORGS))
    if (CL.ORGS[k].portee < portee) { cle = k; portee = CL.ORGS[k].portee; }
  return cle;
}

/** Ce que l'ecran a le droit de dire — /!\ JAMAIS LE POURCENTAGE. */
function lireChance(p) {
  if (p >= 0.65) return "ils devraient dire oui";
  if (p >= 0.42) return "ça peut passer";
  if (p >= 0.22) return "c'est loin d'être gagné";
  return "autant dire non";
}

/**
 * Envoyer son dossier. Rend la reponse — /!\ TIREE, PAS CHOISIE.
 * @param {number} [tirage] pour les bancs
 */
function demarcher(m, l, org, jour, tirage) {
  if (l.org) return { pris: false, mot: `${l.nom} est déjà engagé à ${l.org}.` };
  if (prendDesLocaux(CL.ORGS[org], l))
    return { pris: false, org,
             mot: `${CL.ORGS[org].nom} — « On prend des locaux. Reviens quand son nom traversera les frontières. »` };
  const p = chanceDe(m, l, org);
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > p)
    return { pris: false, org,
             mot: `${CL.ORGS[org].nom} ne donne pas suite pour le moment.` };
  // /!\ SOUS LE RADAR, ON SIGNE AU RABAIS (arbitrage Mael, 10/08,
  // option C) : une organisation qui ne te voyait pas et qui dit oui
  // parce que TU es venu frapper ne paie pas le bareme. 70 % — un
  // inconnu ne negocie pas.
  const sousRadar = l.notoriete < CL.ORGS[org].portee * 0.4;
  const bourse = sousRadar
    ? Math.round(valeurChez(l, org) * 0.7)
    : valeurChez(l, org);
  return { pris: true, org, bourse, combats: NEUF,
           mot: sousRadar
             ? `${CL.ORGS[org].nom} le prend au rabais — ${bourse.toLocaleString("fr-FR")} € par combat. Un inconnu ne négocie pas.`
             : `${CL.ORGS[org].nom} le prend — ${bourse.toLocaleString("fr-FR")} € par combat.` };
}

/**
 * UNE ORGANISATION T'APPROCHE. /!\ RARE, ET SEULEMENT S'IL BRILLE : on
 * ne vient pas chercher un inconnu. Appelee au fil des jours.
 */
function approche(m, l, jour, tirage) {
  if (l.org || l.amateur) return null;
  const candidats = Object.keys(CL.ORGS)
    .filter(c => l.notoriete >= CL.ORGS[c].portee * 0.4)
    .sort((a, b) => CL.ORGS[b].portee - CL.ORGS[a].portee);
  if (!candidats.length) return null;
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > 0.10) return null;
  const org = candidats[0];
  return { org, bourse: valeurChez(l, org), combats: NEUF,
           mot: `${CL.ORGS[org].nom} te contacte au sujet de ${l.nom}.` };
}

module.exports = { NEUF, DELAI, PART_DEFAUT, PART_MIN, PART_MAX,
                   DUREE_MIN, DUREE_MAX, FRAIS_DOSSIER, fraisDossier,
                   etat, valeurChez, pretendants, sonAvis,
                   prixDeSaFidelite, signer, rachat,
                   contratSalle, avisSurPart, signerSalle, salleEchue,
                   chanceDe, lireChance, demarcher, approche, porteRegionale,
                   reputationChez, avisMatchmaker };
