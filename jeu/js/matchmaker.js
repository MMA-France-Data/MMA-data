/**
 * matchmaker.js — CE QU'ON PEUT LUI DEMANDER (Mael, 01/09).
 *
 * « Les relations avec le matchmaker… même, des fois un combattant me
 * demande un nom, par exemple, et je peux pas le demander en retour. »
 *
 * LE MANQUE : la relation aux organisations était SUBIE. Elle montait et
 * descendait sur ce qui se passait (accepter, refuser, gagner, rater une
 * pesée), et le joueur pouvait PARLER au matchmaker — quatre répliques
 * qui bougent la relation — mais il ne pouvait RIEN DEMANDER. Pire :
 * quand un combattant réclamait un adversaire (demande `cet_adversaire`),
 * le jeu posait `l.cibleVoulue = true`… et cette variable n'était lue
 * NULLE PART. La plaie du carnet : une chose branchée nulle part ne fait
 * rien et ne lève pas.
 *
 * ===================================================================
 * LES QUATRE RÈGLES DU MODULE
 * ===================================================================
 * 1. ON DEMANDE, ON N'EXIGE PAS. Le matchmaker répond oui ou non selon
 *    CE QUE TU VAUX POUR LUI (la relation) et selon ce que tu demandes.
 *    Rien n'est jamais garanti : c'est lui qui fait les cartes.
 * 2. DEMANDER COÛTE. Chaque demande dépense du crédit — un peu si elle
 *    passe (il y trouve son compte), plus si elle est refusée (tu as
 *    demandé quelque chose que tu ne méritais pas). C'est ce qui empêche
 *    de tout demander tous les jours.
 * 3. UNE DEMANDE PAR ORGANISATION À LA FOIS, et un délai entre deux.
 *    Un manager qui appelle toutes les semaines n'est plus écouté.
 * 4. LA RÉPONSE EST UNE FAVEUR RÉELLE, PAS UN MOT. Accepté, ça change la
 *    PROCHAINE OFFRE — l'adversaire visé, la date avancée, la place sur
 *    la carte, la bourse. Une faveur qui ne change rien serait une
 *    étiquette, et le carnet a un mot pour ça.
 *
 * Module PUR : aucun tirage (la décision se calcule), aucun DOM, aucun
 * état global. Banc 35.
 */

/** Le délai entre deux demandes à la MÊME organisation. */
const DELAI = 40;

/**
 * CE QU'ON PEUT DEMANDER.
 *  seuil   : la relation minimale pour espérer un oui
 *  cout    : l'entrée de relation quand ça PASSE
 *  coutNon : l'entrée quand il refuse (toujours plus cher)
 *  duree   : combien de temps la faveur reste due
 */
const DEMANDES = {
  date: {
    lab: "« Il lui faut un combat, et vite. »",
    seuil: 30, cout: "echange_juste", coutNon: "exigence", duree: 90,
    oui: (n) => `« Je t'ai entendu. Je regarde ce que j'ai. »`,
    non: (n) => `« Tout le monde veut une date. Prends ton tour. »`,
  },
  adversaire: {
    lab: "« Je veux ce nom-là. »",
    seuil: 48, cout: "exigence", coutNon: "exigence", duree: 120,
    oui: (n) => `« ${n} ? … Ça peut se vendre. Je vais voir son camp. »`,
    non: (n) => `« ${n} a d'autres plans. Et toi, tu n'as pas encore le poids pour choisir. »`,
  },
  affiche: {
    lab: "« Mets-le en haut de carte. »",
    seuil: 62, cout: "exigence", coutNon: "exigence", duree: 120,
    oui: (n) => `« Le main event, rien que ça. Bon. Qu'il le mérite, alors. »`,
    non: (n) => `« Le haut de carte, ça se gagne. Reviens quand on parlera de lui dehors. »`,
  },
  bourse: {
    lab: "« Sa bourse ne suit plus. »",
    seuil: 55, cout: "exigence_argent", coutNon: "exigence_argent", duree: 120,
    oui: (n) => `« Je peux trouver un peu. Ne le crie pas sur les toits. »`,
    non: (n) => `« Mes budgets sont ce qu'ils sont. Gagne, et on rediscute. »`,
  },
};

/** Peut-on demander quelque chose aujourd'hui à cette organisation ? */
function peutDemander(etatOrg, jour) {
  if (!etatOrg) return { peut: false, mot: "Tu ne travailles pas avec eux." };
  const d = etatOrg.demandeLe;
  if (d !== undefined && jour - d < DELAI)
    return { peut: false, reste: DELAI - (jour - d),
             mot: `Tu l'as déjà sollicité récemment — laisse passer ${DELAI - (jour - d)} jours.` };
  return { peut: true, mot: "" };
}

/**
 * LA DÉCISION. Elle se CALCULE, elle ne se tire pas : même relation,
 * même demande, même réponse — le joueur peut apprendre les règles.
 * @param {string} quoi     clé de DEMANDES
 * @param {number} valeur   la relation (0-100)
 * @param {object} ctx      { rangEcart } — pour `adversaire` : de combien
 *                          de rangs l'homme visé est AU-DESSUS (0 si égal
 *                          ou moins bien classé). Viser plus haut est
 *                          plus dur : c'est le même principe que la
 *                          montée dans faveurs().
 */
function juger(quoi, valeur, ctx = {}) {
  const d = DEMANDES[quoi];
  if (!d) throw new Error(`matchmaker.js : demande inconnue "${quoi}"`);
  let seuil = d.seuil;
  if (quoi === "adversaire") seuil += Math.max(0, (ctx.rangEcart || 0)) * 6;
  const accepte = valeur >= seuil;
  return { accepte, seuil,
           trace: accepte ? d.cout : d.coutNon,
           duree: d.duree };
}

/**
 * La faveur accordée, telle que le jeu la posera sur l'homme. C'est un
 * DÛ daté : le matchmaker s'en souvient un temps, puis oublie.
 */
function faveur(quoi, jour, cible) {
  const d = DEMANDES[quoi];
  return { quoi, depuis: jour, jusqua: jour + d.duree,
           cible: cible === undefined ? null : cible };
}

/** La faveur est-elle encore due ? */
const dueEncore = (f, jour) => !!f && jour <= f.jusqua;

module.exports = { DELAI, DEMANDES, peutDemander, juger, faveur, dueEncore };
