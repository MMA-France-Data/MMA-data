/**
 * classement.js — LES RANGS, ET QUI ON T'OFFRE.
 *
 * Module natif JS, tenu par invariants. Aucun fichier gele touche.
 *
 * ===================================================================
 * /!\ LE CLASSEMENT NE DEPEND PAS QUE DE LA FORMULE
 * ===================================================================
 * C'est ce que la simulation a montre avant d'ecrire une ligne ici : avec
 * le seul bareme de points, battre UN classe suffisait a etre classe —
 * donc "une victoire" pour entrer au top 15, a l'UFC comme a Hexagone. Et
 * une serie victoire/defaite stagnait a #9 au lieu de ne jamais classer.
 * LA DENSITE D'UNE ORGANISATION VIT DANS LE MATCHMAKING, pas dans les
 * points : un non-classe affronte d'autres non-classes tant qu'il n'a pas
 * fait ses preuves, et il en faut d'autant plus que l'organisation est
 * dense. Les points ne font que ranger ceux qui ont deja la porte ouverte.
 */

/** Valeur attribuee a un non-classe pour les calculs d'ecart. */
const NON_CLASSE = 22;

/**
 * Les cinq organisations. bourse = [entree, champion, plafond star] en
 * milliers d'euros, PAR COTE : une bourse "1+1" = 1 000 € garantis plus
 * 1 000 € de prime de victoire.
 * /!\ L'UFC paie MOINS que la PFL a l'entree (12 contre 15) et 13 fois plus
 * au sommet. Ce n'est pas une erreur : c'est le vrai dilemme du metier.
 */
const ORGS = {
  HEX: { nom: "Hexagone FC",  pays: "France",   niveau: "nationale",      densite: 1.00, serie: 3,
         bourse: [1, 7, 15],      portee: 40 },
  TRI: { nom: "Trident FC",   pays: "France",   niveau: "nationale +",    densite: 0.80, serie: 4,
         bourse: [2, 12, 50],     portee: 55 },
  SOK: { nom: "Sokół Fight",  pays: "Pologne",  niveau: "européenne",     densite: 0.65, serie: 5,
         bourse: [4, 20, 80],     portee: 70 },
  GFL: { nom: "Global Fight League", pays: "USA", niveau: "internationale", densite: 0.50, serie: 5,
         bourse: [15, 50, 150],   portee: 80 },
  AFC: { nom: "Apex Fighting Championship", pays: "USA", niveau: "internationale", densite: 0.40, serie: 5,
         bourse: [12, 175, 2000], portee: 100 },
};

/* /!\ NOMS DERIVES, PAS LES VRAIS — ET L'IDENTIFIANT EST SEPARE DU LIBELLE.
   Les vraies marques (UFC, PFL, KSW, Ares, Hexagone MMA) sont deposees.
   Tant que ca reste sur un telephone personne ne dit rien ; le jour d'une
   publication, meme gratuite, on s'expose — l'UFC est connue pour etre
   agressive sur sa propriete intellectuelle.
   On garde donc la PLACE DANS LA HIERARCHIE (la petite francaise, la
   nationale ambitieuse, l'europeenne, la ligue americaine, le sommet) et on
   change le nom. Le joueur reconnait le role sans qu'aucune marque soit
   reprise.
   /!\ LE CODE N'UTILISE QUE LA CLE (HEX, TRI, SOK, GFL, AFC). Changer un
   libelle, c'est UNE ligne ici et rien d'autre.
   /!\ JE NE PEUX PAS CERTIFIER QUE CES NOMS SONT LIBRES. "Titan FC" par
   exemple existe reellement aux Etats-Unis, c'est pourquoi il a ete ecarte.
   AVANT PUBLICATION : verifier a l'INPI et a l'EUIPO, c'est gratuit et en
   ligne. Je propose, je ne certifie pas. */

/**
 * /!\ LA NOTORIETE PLAFONNE A LA PORTEE DE L'ORGANISATION.
 * Une ligue europeenne te fait connaitre en Europe ; les Etats-Unis te
 * montrent au monde ; l'UFC encore plus, surtout en main card. On garde UNE
 * seule jauge plutot que trois regionales (France / Europe / Monde) : le
 * plafond porte deja l'intention — la portee de l'organisation decide de
 * jusqu'ou tu peux monter — sans obliger chaque bourse, chaque offre et
 * chaque scandale a savoir OU il compte. A decouper plus tard si ca manque.
 * Consequence de jeu : un champion Hexagone monte vite jusqu'a 40 et
 * BLOQUE. Il lui faut changer d'organisation pour exister ailleurs. C'est
 * ce plafond qui pousse vers le haut, pas l'argent.
 */
// /!\ pre_prelims (Mael, 09/08) : les cartes numerotees ouvrent en
// pre-prelims — on y existe a peine, mais on y existe.
const PLACE = { pre_prelims: 0.3, prelims: 0.5, main_card: 1.0, co_main: 1.4, main_event: 2.0 };

/**
 * Notoriete gagnee apres un combat.
 * @param {string} cle organisation
 * @param {string} place "prelims" | "main_card" | "co_main" | "main_event"
 * @param {number} noto notoriete actuelle
 * @param {boolean} gagne
 * @param {number} maniere 1 serre · 2 net · 3 finish
 * @param {number} [notoAdv] notoriete de l'ADVERSAIRE (defaut 0 : l'ancien
 *   comportement, banc 14 intact). /!\ LA NOTORIETE SE TRANSFERE (Mael,
 *   09/08) : battre quelqu'un de connu rapporte gros — tout le monde
 *   regarde le combat — et MEME PERDRE contre une star fait monter, on t'a
 *   vu. Le facteur (1 + notoAdv/100) double le gain contre une star a 100.
 * @returns {number} la NOUVELLE notoriete, plafonnee
 */
function gagnerNotoriete(cle, place, noto, gagne, maniere, notoAdv = 0) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const mult = PLACE[place];
  if (mult === undefined) throw new Error(`classement.js : place inconnue "${place}"`);
  // /!\ CALIBRE PAR MESURE. Premiere version a 3,2 : il fallait 22 combats
  // pour saturer Hexagone, soit huit ans a 3 combats par an — un plafond
  // qu'on n'atteint jamais ne pousse personne vers le haut. A 5,5, un
  // champion regional sature en une douzaine de combats et se retrouve
  // bloque, ce qui est le but.
  const base = (gagne ? 5.5 : 1.6)
             * (MANIERE[maniere] !== undefined ? MANIERE[maniere] : 1)
             * (1 + Math.max(0, notoAdv) / 100);
  // On progresse d'autant moins qu'on approche du plafond : les derniers
  // points sont les plus durs, et on ne le depasse jamais.
  const marge = Math.max(0, o.portee - noto) / Math.max(1, o.portee);
  const gain = base * mult * (0.25 + 0.75 * marge);
  return Math.min(o.portee, Math.round((noto + gain) * 10) / 10);
}

/** 1 = combat serre · 2 = decision nette · 3 = finish sec. */
const MANIERE = [0, 0.75, 1.0, 1.35];

/**
 * Deplacement au classement apres un combat.
 * @param {number|null} rangV rang du vainqueur (null = non classe)
 * @param {number|null} rangP rang du perdant
 * @param {number} densite   celle de l'organisation
 * @param {number} maniere   1, 2 ou 3
 * @returns {[number|null, number|null]} nouveaux rangs [vainqueur, perdant]
 */
function bouger(rangV, rangP, densite, maniere) {
  const rV = rangV === null ? NON_CLASSE : rangV;
  const rP = rangP === null ? NON_CLASSE : rangP;
  const ecart = rV - rP;                 // > 0 : le vainqueur partait de plus loin
  const m = MANIERE[maniere] !== undefined ? MANIERE[maniere] : 1.0;

  // /!\ BATTRE UN CLASSE DOIT TOUJOURS CLASSER. Premiere version : un
  // non-classe qui battait le #10 restait non-classe, l'amortissement le
  // renvoyant au-dela de 15. Absurde — c'est la performance qui ouvre la
  // porte. L'atterrissage est donc borne a 5 places sous le battu.
  const pas = ecart <= 0
    ? -Math.max(1, Math.round(m * densite))
    : Math.min(5, Math.max(0, Math.round((ecart * 0.30) / densite / m)));
  let nvV = ecart <= 0 ? rV + pas : rP + pas;
  nvV = Math.max(1, Math.min(NON_CLASSE, nvV));
  if (rangP === null && nvV > 15) nvV = null;   // battre un non-classe ne classe pas
  else if (nvV > 15) nvV = 15;

  // Le perdant descend d'autant plus que son bourreau etait mal classe, et
  // d'autant plus que la defaite a ete nette. Un combat serre est pardonne.
  const chute = ecart <= 0 ? Math.max(1, Math.round(m))
                           : Math.round((1 + ecart * 0.45) * m);
  let nvP = Math.min(NON_CLASSE, rP + chute);
  if (nvP > 15) nvP = null;
  return [nvV, nvP];
}

/**
 * A-t-on droit a un adversaire CLASSE ?
 *
 * /!\ LA NOTORIETE OUVRE DES PORTES QUE LE BILAN SEUL N'OUVRE PAS. Une
 * superstar a toujours un chemin plus court : les organisations veulent
 * vendre des billets, pas recompenser le merite. Un inconnu fait ses
 * preuves ; un nom connu passe devant. C'est injuste, et c'est le metier.
 * La notoriete retire jusqu'a 3 victoires sur la serie exigee, sans jamais
 * descendre sous 1 : meme une star doit gagner UNE fois.
 */
function serieRequise(cle, notoriete) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const remise = Math.min(3, Math.floor(Math.max(0, notoriete || 0) / 25));
  return Math.max(1, o.serie - remise);
}
function droitAuClasse(cle, rang, serie, notoriete) {
  return rang !== null || serie >= serieRequise(cle, notoriete);
}

/**
 * Bourse d'un combattant dans son organisation, en euros [garanti, prime].
 * Entre l'entree et le rang de champion, on interpole sur le classement ;
 * au-dela, la notoriete pousse vers le plafond star.
 */
/* =========================================================================
   L'ECHELLE — L'ARBITRAGE DE MAEL (10/08).
   "Un classement de TOUT le roster de la categorie, mais cache : on ne
    montre que le top 15. Regle simple : tu gagnes, tu affrontes un mieux
    classe que toi ; tu perds, tu regardes derriere."
   Chaque division de chaque organisation porte une ECHELLE COMPLETE
   (tous les ids, du meilleur au dernier). Le rang affiche n'est que la
   FENETRE des 15 premiers. Le mouvement est celui d'une echelle de
   salle : le vainqueur PREND LA PLACE du perdant s'il etait derriere
   (tous ceux entre eux reculent d'un cran) ; s'il etait deja devant, le
   perdant recule d'un cran. Consequence directe : UN #1 A 7-8 EST
   IMPOSSIBLE — chaque defaite te fait doubler, la tete de l'echelle
   appartient a ceux qui gagnent.
   ========================================================================= */

/** L'echelle d'une division — construite au premier besoin, reparee a
 *  chaque lecture (arrivees en bas, partis retires, champion en tete). */
function echelleDe(m, org, div) {
  m.echelles = m.echelles || {};
  const parOrg = (m.echelles[org] = m.echelles[org] || {});
  const roster = (m.rosters[org] && m.rosters[org][div]) || [];
  if (!parOrg[div]) {
    const ids = roster.slice();
    ids.sort((x, y) => {
      const a = m.pros.get(x), b = m.pros.get(y);
      if (!a || !b) return 0;
      if (a.champion !== b.champion) return a.champion ? -1 : 1;
      // /!\ L'AMORCAGE SE FAIT A LA TRACE, PAS AU RANG DE GENESE (trouve
      // en tracant Mathis Lefort : la genese livrait un 1-4 AU RANG 4,
      // et l'echelle heritait de la graine pourrie — c'etait la source
      // du "des #4 a 0-6 dans le top 15" signale par Mael des le debut).
      // Le rang de genese ne vaut rien ; le dossier, si.
      const ta = a.bilan.v - a.bilan.d + (a.bilan.serie || 0),
            tb = b.bilan.v - b.bilan.d + (b.bilan.serie || 0);
      if (ta !== tb) return tb - ta;
      if (a.bilan.v !== b.bilan.v) return b.bilan.v - a.bilan.v;
      return (b.notoriete || 0) - (a.notoriete || 0);
    });
    parOrg[div] = ids;
  }
  // Reparation : le roster est la verite des presences.
  const dedans = new Set(roster);
  let e = parOrg[div].filter(id => dedans.has(id));
  const deja = new Set(e);
  for (const id of roster) if (!deja.has(id)) e.push(id);   // arrivants en bas
  // Le champion vit en tete — toujours.
  const iC = e.findIndex(id => { const l = m.pros.get(id); return l && l.champion; });
  if (iC > 0) { const [c] = e.splice(iC, 1); e.unshift(c); }
  parOrg[div] = e;
  // /!\ L'ECHELLE EST MAITRESSE DES SA NAISSANCE : les rangs de genese
  // s'ecrasent ici — sinon la fenetre et l'echelle racontent deux
  // histoires jusqu'au premier combat de la division.
  e.forEach((id, i) => { const l = m.pros.get(id); if (l) l.rang = i < 15 ? i + 1 : null; });
  return e;
}

/** Ecrit les rangs depuis l'echelle : la fenetre des 15. */
function synchroniserRangs(m, org, div) {
  const e = echelleDe(m, org, div);
  e.forEach((id, i) => { const l = m.pros.get(id); if (l) l.rang = i < 15 ? i + 1 : null; });
}

/**
 * LE MOUVEMENT. Vainqueur derriere -> il prend la place du perdant ;
 * vainqueur devant -> le perdant recule d'un cran (deux si fini).
 */
function bougerEchelle(m, org, div, vainqueurId, perdantId, fini) {
  const e = echelleDe(m, org, div);
  const iV = e.indexOf(vainqueurId), iP = e.indexOf(perdantId);
  if (iV < 0 || iP < 0) { synchroniserRangs(m, org, div); return; }
  if (iV > iP) {
    e.splice(iV, 1);
    e.splice(iP, 0, vainqueurId);
  } else {
    const recul = fini ? 2 : 1;
    const j = e.indexOf(perdantId);
    const cible = Math.min(e.length - 1, j + recul);
    e.splice(j, 1);
    e.splice(cible, 0, perdantId);
  }
  // Le champion ne se double pas a l'echelle : sa place se prend en
  // combat de titre (le couronnement le remet en tete via echelleDe).
  synchroniserRangs(m, org, div);
}

/* ==== LES MATCHMAKERS (conception de Mael, 10/08) =======================
   Un homme par organisation : c'est LUI qui propose les combats, lui
   qu'on appelle, lui dont on gagne ou perd la confiance.
   /!\ IL VIT ICI, avec les organisations — et pas dans contrats.js :
   offres.js a besoin de son nom pour signer ses propositions, et
   contrats.js requiert deja offres.js. Le mettre la-bas creait un CYCLE
   DE DEPENDANCES, que le bundler a refuse net. */
const MATCHMAKERS = {
  AFC: { nom: "Dana Cardoso",    trait: "exigeant",
         mot: "Je ne signe pas des espoirs, je signe des problèmes pour mes champions." },
  GFL: { nom: "Roy Halloran",    trait: "vendeur",
         mot: "Tout le monde peut se battre. Peu de gens font vendre." },
  SOK: { nom: "Piotr Zawadzki",  trait: "fidèle",
         mot: "Chez nous on construit lentement. On ne jette personne." },
  TRI: { nom: "Bruno Vasseur",   trait: "joueur",
         mot: "J'aime les affiches qui font parler. Le classement suivra." },
  HEX: { nom: "Éric Lemarchand", trait: "régional",
         mot: "Amène-moi des gars sérieux, je leur donne des dates." },
};
function matchmakerDe(org) {
  if (MATCHMAKERS[org]) return MATCHMAKERS[org];
  const o = ORGS[org];
  return { nom: o && o.pays ? `le matchmaker de ${o.pays}` : "le matchmaker",
           trait: "régional", mot: "On regarde les dossiers un par un." };
}

function bourse(cle, rang, champion, notoriete) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const [entree, champ, star] = o.bourse;
  let k;
  if (champion) {
    // Champion : entre le tarif de base et le plafond, selon la notoriete.
    k = champ + (star - champ) * Math.min(1, Math.max(0, (notoriete - 40) / 60));
  } else if (rang === null) {
    k = entree;
  } else {
    // Non-champion classe : du tarif d'entree vers celui de champion.
    /* /!\ BORNE (22/08, NaN vu par Mael) : un rang au-dela de #15 donnait
       t negatif, et pow(negatif, 1.4) = NaN. Au-dela de #15, c'est le
       tarif d'entree. Et la notoriete absente vaut 0. */
    const t = Math.max(0, (16 - rang) / 15);          // #15 -> 0,07 · #1 -> 1
    k = entree + (champ - entree) * Math.pow(t, 1.4);
    k *= 1 + Math.min(0.35, Math.max(0, ((notoriete || 0) - 50) / 100) * 0.7);
  }
  const g = Math.round(k * 1000);
  return [g, g];
}

/** "#7" ou "non classé". */
const libelleRang = (r) => (r === null ? "non classé" : "#" + r);

module.exports = {
  MATCHMAKERS, matchmakerDe,
  echelleDe, bougerEchelle, synchroniserRangs, ORGS, NON_CLASSE, MANIERE, PLACE, bouger, serieRequise,
                   droitAuClasse, bourse, gagnerNotoriete, libelleRang };
