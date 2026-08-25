/**
 * entente.js — CE QU'IL Y A ENTRE TOI ET LUI.
 *
 * Module natif JS, tenu par invariants (banc 22). Aucun fichier gele ni
 * porte n'est touche. C'est le CHANTIER H du carnet, concu entierement a
 * l'oral avec Mael le 08/08 et code ici sans rien inventer de neuf.
 *
 * ===================================================================
 * /!\ CE N'EST PAS UN COMPTEUR D'EVENEMENTS
 * ===================================================================
 * L'entente est le RESIDU DE TOUTES LES INTERACTIONS. Chaque echange
 * laisse une trace, meme minuscule, MEME NULLE — et zero est une valeur,
 * pas un oubli. Botter en touche ne monte ni ne descend, et c'est
 * exactement ce que ca doit faire. C'est le volume des petits echanges qui
 * fait qu'au bout de deux ans la relation a une histoire.
 *
 * /!\ A NE PAS CONFONDRE AVEC LA DISCIPLINE : discipline = sa rigueur a
 * lui, entente = ce qu'il y a ENTRE VOUS. Un type tres discipline peut te
 * detester.
 *
 * ===================================================================
 * /!\ LE FREIN N'EST PAS UNE LIMITE, C'EST UN COUT (trouvaille de Mael)
 * ===================================================================
 * Rien a brider parce que RIEN N'EST GRATUIT :
 *   flatter        -> entente +, mais GROSSE TETE (discipline qui baisse) :
 *                     il travaille moins, prend l'adversaire de haut
 *   accepter tout  -> il monte de categorie trop tot, allege les seances
 *   baisser ta part-> entente immediate, tresorerie en moins
 * LA GROSSE TETE EST `discipline` QUI BAISSE : on n'invente pas une
 * neuvieme stat, on RESSUSCITE celle du chantier F, qui est morte et qui
 * porte exactement ce sens.
 * AUCUNE OPTION N'EST BONNE DANS L'ABSOLU : un jeune qui manque de
 * confiance, on le flatte ; un type deja arrogant, ca le tue.
 */

/** Le depart : on ne se connait pas encore. */
const DEPART = 50;

/**
 * LES PALIERS DE LECTURE. Comme la relation aux orgas : LE CHIFFRE VIT
 * DANS LE CODE, LES MOTS SORTENT A L'ECRAN.
 */
const PALIERS = [
  { seuil: 84, mot: "il te suivrait n'importe où",   ton: "haut" },
  { seuil: 66, mot: "il te fait confiance",           ton: "bon" },
  { seuil: 44, mot: "correct, sans plus",             ton: "neutre" },
  { seuil: 24, mot: "il prend ses distances",         ton: "bas" },
  { seuil: 0,  mot: "il ne te supporte plus",         ton: "rupture" },
];

function lire(valeur) {
  for (const p of PALIERS) if (valeur >= p.seuil) return p;
  return PALIERS[PALIERS.length - 1];
}

/**
 * CE QUI LA FAIT BOUGER — la liste du carnet, telle quelle.
 * /!\ VALEURS PROPOSEES, A REJUGER EN JOUANT. L'asymetrie est voulue :
 * une trahison coute plus qu'un service ne rapporte.
 */
const ENTREES = {
  // ce qui monte
  affiche_voulue: +12,        // lui decrocher l'affiche qu'il voulait
  victoire_bon_camp: +8,      // une victoire apres un camp bien regle
  combat_domicile: +5,        // pas de frais pour lui
  part_baissee: +14,          // baisser ta part de toi-meme
  defendu_publiquement: +10,  // le defendre apres un incident
  refus_accepte: +9,          // accepter qu'il refuse un combat
  materiel_son_domaine: +7,   // investir dans SON domaine
  coin_allege: +5,            // alleger l'equipe quand la bourse est maigre

  // ce qui descend
  combat_trop_tot: -15,       // le faire combattre pas remis, blesse, hors categorie
  affiche_lointaine: -9,      // loin, petite bourse — il paie tout
  offre_refusee: -8,          // lui refuser un combat qu'il voulait
  engueulade_defaite: -11,    // l'engueuler apres une defaite
  stagnation: -6,             // le laisser enchainer sans progresser
  // /!\ LA SERIE DE DEFAITES (Mael, 09/08) : "plein de combattants
  // changent de coach apres des defaites". UNE defaite ne casse rien —
  // ca arrive. DEUX D'AFFILEE et il commence a se demander si le
  // probleme n'est pas toi. TROIS et il regarde ailleurs.
  // /!\ CE N'EST PAS UNE PUNITION DU JOUEUR : c'est la meme mecanique
  // que la coupe des orgas, vue de l'interieur de la salle.
  serie_defaites: -9,
  serie_noire: -16,           // trois de rang : il doute de toi ouvertement
  staff_sur_petit_combat: -7, // tout le staff sur un combat mal paye
  part_gardee: -10,           // garder tes 20 % alors qu'il te depasse
  abandon_mediatique: -13,    // l'abandonner apres un derapage

  // le dialogue (voir dialogue.js) — la trace des petits echanges
  echange_juste: +3,
  echange_neutre: 0,          // /!\ ZERO EST UNE VALEUR, PAS UN OUBLI
  echange_rate: -4,
  flatterie: +6,              // /!\ et la grosse tete avec (voir cout)

  // les promesses
  promesse_tenue: +16,
  promesse_trahie: -24,       // /!\ PIRE QU'UN REFUS FRANC. C'est le but.
};

/**
 * /!\ LE COUT CACHE DE CERTAINES ENTREES. C'est ce qui rend le systeme
 * non-abusable sans rien brider : flatter monte l'entente ET fait baisser
 * la discipline. A appliquer sur la fiche du combattant.
 */
const COUTS = {
  flatterie: { discipline: -3 },
  affiche_voulue: { discipline: -1 },       // on lui a cede, un peu
  part_baissee: { tresorerie: true },       // gere par l'economie, pas ici
};

/** L'etat d'entente d'un combattant. Vit sur SA fiche de salle. */
function etatDepart() {
  return { valeur: DEPART, histoire: [], promesses: [] };
}

/**
 * Bouger l'entente. Rend le mouvement ET le cout a appliquer.
 * @param {object} e     etat d'entente
 * @param {string} quoi  cle de ENTREES
 * @param {object} [f]   la fiche du combattant, pour appliquer le cout
 */
function bouger(e, quoi, f) {
  const delta = ENTREES[quoi];
  if (delta === undefined) throw new Error(`entente.js : entrée inconnue "${quoi}"`);
  const avant = e.valeur;
  e.valeur = Math.max(0, Math.min(100, e.valeur + delta));

  // /!\ MEME UN ZERO S'INSCRIT : c'est le volume des petits echanges qui
  // fait l'histoire. Un dialogue qui ne donne rien a quand meme eu lieu.
  e.histoire.push(quoi);
  if (e.histoire.length > 60) e.histoire.shift();

  // Le cout, applique sur la fiche quand elle est fournie.
  const cout = COUTS[quoi];
  if (cout && f && f.mental && cout.discipline !== undefined)
    f.mental.discipline = Math.max(5, Math.min(99, f.mental.discipline + cout.discipline));

  const pAv = lire(avant), pAp = lire(e.valeur);
  return { avant, apres: e.valeur, delta, palier: pAp,
           franchi: pAv.mot !== pAp.mot, cout: cout || null };
}

/* ================================================================== */
/* LES PROMESSES — le "OUI MAIS" du carnet.                            */
/* /!\ UNE PROMESSE CONDITIONNELLE, PAS UN COMPROMIS MOU : l'entente    */
/* monte TOUT DE SUITE (moins qu'un oui franc, bien plus qu'un non), et */
/* une DETTE apparait. Si tu ne tiens pas parole, l'entente s'effondre   */
/* PLUS BAS qu'un refus franc — un refus honnete vaut mieux qu'une       */
/* promesse trahie.                                                     */
/* /!\ SANS LA VERIFICATION A ECHEANCE, LE JEU MENTIRAIT : c'est pour   */
/* ca que la condition et l'echeance sont des DONNEES, pas du texte.    */
/* ================================================================== */

/** Le gain immediat d'un "oui mais" : entre le oui et le non. */
const GAIN_PROMESSE = 5;

/**
 * @param {object} e
 * @param {object} p { quoi, condition: {type, n}, echeance (jour), texte }
 *   type : "victoires" | "mois" | "titre"
 */
function promettre(e, p, jour, gain) {
  const promesse = { quoi: p.quoi, condition: p.condition, echeance: p.echeance,
                     texte: p.texte || null, posee: jour, etat: "en_cours" };
  e.promesses.push(promesse);
  const avant = e.valeur;
  // /!\ LE GAIN PEUT ETRE FOURNI PAR L'APPELANT (curseur de demandes.js)
  // ET PEUT ETRE NEGATIF : trop exiger, c'est refuser en faisant semblant
  // de ceder, et il le prend comme tel. Sans argument : la valeur
  // historique du carnet.
  const g = gain !== undefined ? gain : GAIN_PROMESSE;
  e.valeur = Math.max(0, Math.min(100, e.valeur + g));
  e.histoire.push("promesse");
  return { avant, apres: e.valeur, promesse, gain: g };
}

/**
 * Verifier les promesses arrivees a echeance. A appeler a chaque jour de
 * jeu — c'est ce qui empeche le jeu de mentir.
 * @param {object} etat  { victoiresDepuis(jour), titre, jour }
 * @returns {object[]} les mouvements produits
 */
function verifierPromesses(e, jour, etat, f) {
  const mouvements = [];
  for (const p of e.promesses) {
    if (p.etat !== "en_cours") continue;
    const c = p.condition || {};
    let remplie = false;
    if (c.type === "victoires") remplie = (etat.victoiresDepuis || 0) >= c.n;
    else if (c.type === "titre") remplie = !!etat.titre;
    else if (c.type === "mois") remplie = jour >= p.posee + c.n * 30;

    if (remplie && !p.honoree) {
      // La condition est remplie : c'est a TOI de tenir, maintenant.
      p.etat = "due";
      mouvements.push({ promesse: p, etat: "due" });
    } else if (jour > p.echeance) {
      // L'echeance est passee sans que tu tiennes parole.
      p.etat = "trahie";
      mouvements.push(Object.assign({ promesse: p, etat: "trahie" },
        bouger(e, "promesse_trahie", f)));
    }
  }
  return mouvements;
}

/** Tu tiens parole. */
function tenir(e, promesse, f) {
  promesse.etat = "tenue";
  return bouger(e, "promesse_tenue", f);
}

/* ================================================================== */
/* CE QUE L'ENTENTE ACHETE — elle cesse d'etre sentimentale.           */
/* ================================================================== */

/**
 * LA RENEGOCIATION : sa demande est ESCOMPTEE PAR L'ENTENTE. Deux ans de
 * bonne relation valent tant de pourcents.
 * @param {number} valeurOffre  ce que le concurrent propose
 * @returns {number} ce qu'il te demande pour rester
 */
function prixPourRester(e, valeurOffre) {
  // entente basse : il exige tout et plus encore · haute : il te laisse
  // une chance. Lineaire entre 1,25 et 0,72 de l'offre concurrente.
  const t = e.valeur / 100;
  return Math.round(valeurOffre * (1.25 - 0.53 * t));
}

/**
 * LE DEPART — /!\ L'ENTENTE AMORTIT, ELLE NE BLOQUE PAS. Si une enorme
 * offre arrive, le premier terme ecrase tout : meme a entente parfaite,
 * ON NE LE RETIENT PAS, et c'est juste.
 * Ce que l'entente change alors : la MANIERE. Il te previent, il finit ses
 * engagements, il te recommande — ou il part du jour au lendemain et
 * raconte partout que tu l'as mal gere.
 * @returns {object} { part, maniere, deja_decide }
 */
function tentation(e, valeurOffre, ceQueTuApportes, alea) {
  const t = valeurOffre - ceQueTuApportes - e.valeur * 0.6;
  const part = t > 0;
  const v = e.valeur;
  // /!\ ET PARFOIS IL A DEJA DECIDE (dernier mot de Mael) : rare, mais
  // REEL, sinon le systeme devient une machine ou tout se rachete et le
  // joueur croit controler ses hommes. Il ne les controle pas.
  // Plus probable a entente basse, JAMAIS impossible a entente haute.
  const seuil = 0.04 + (100 - v) / 100 * 0.16;      // 4 % a 20 %
  const dejaDecide = part && (alea !== undefined ? alea : Math.random()) < seuil;
  const maniere = v >= 66 ? "il vient t'en parler d'abord"
                : v >= 44 ? "il te prévient, sans plus"
                : "tu l'apprends par la presse";
  return { part, maniere, deja_decide: dejaDecide,
           // a entente basse, il abime ta reputation en partant
           degat_reputation: v < 24 ? 2 : v < 44 ? 1 : 0 };
}

module.exports = { DEPART, PALIERS, ENTREES, COUTS, GAIN_PROMESSE,
                   etatDepart, lire, bouger, promettre, verifierPromesses,
                   tenir, prixPourRester, tentation };
