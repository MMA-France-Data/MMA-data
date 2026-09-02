/**
 * demandes_staff.js — CE QUE TON STAFF VIENT TE DEMANDER.
 *
 * (Chantier de la liste laissee par la cloture du 22/08 : « les demandes
 * de coach ».)
 *
 * Le cas 117 a donne une VOIX aux coachs — ils interpellent, ils disent
 * ce qu'ils voient. Il leur manquait la suite : POUVOIR DEMANDER QUELQUE
 * CHOSE, et que ton oui ou ton non coute. Un coach qui parle sans jamais
 * rien reclamer n'est pas un collegue, c'est un decor.
 *
 * ===================================================================
 * /!\ LES REGLES, REPRISES DE demandes.js — C'EST LE MEME JEU
 * ===================================================================
 * 1. UNE DEMANDE EST PROBABLE OU NON, JAMAIS TIREE DANS UN CHAPEAU. Elle
 *    sort de SA situation : son salaire contre le bareme qu'il connait,
 *    sa charge, son materiel, ses eleves. Pas de `probable`, pas de
 *    demande.
 * 2. CHAQUE DEMANDE PORTE QUATRE CHOSES : ce que coute le OUI, ce que
 *    coute le NON, qui la formule, et — quand ca a un sens — la
 *    PROMESSE : une condition et une echeance, en DONNEES. Sinon le jeu
 *    oublie sa parole, et c'est LUI qui ment.
 * 3. /!\ L'EFFET DU OUI EST REEL OU LA DEMANDE N'EXISTE PAS. La lecon
 *    ecrite six fois au carnet : « les demandes portaient un nom d'effet
 *    que personne n'appliquait ». Chaque cle d'effet ci-dessous est
 *    traitee dans appliquerEffetStaff() — le banc 29 le verifie une par
 *    une, en mesurant que quelque chose a BOUGE.
 * 4. LE MODULE NE TOUCHE A RIEN. Il rend a lire ; la salle applique.
 *
 * /!\ ET LA REGLE PROPRE AU STAFF : UN COACH CONNAIT LE MARCHE.
 * salaireCoach() est la reference publique (cas 117). Il ne demande donc
 * jamais l'impossible — il demande le bareme. Ce qui rend un refus
 * indefendable, et c'est voulu.
 */

/* /!\ LE BAREME NE SE RECALCULE PAS ICI. Premiere version : le module
   reecrivait la formule de salaireCoach « pour rester pur ». C'est
   exactement la DEUXIEME SOURCE que le carnet chasse depuis le 09/08 —
   la formule a deja bouge trois fois (cas 99, cas 114, cas 114 ter), et
   une copie aurait diverge au premier reglage suivant. Le bareme ARRIVE
   PAR LE CONTEXTE, calcule par la salle avec salaireCoach(). Sans lui,
   la demande d'augmentation ne sort simplement pas. */

/* /!\ CES DEUX TABLES SONT DERIVEES, PLUS ECRITES (cas 162). Elles
   etaient deux des SIX copies de la correspondance axe↔famille — et
   AXE_EQUIP.mental valait null, ce qui faisait du preparateur mental le
   seul homme du staff a qui une famille entiere de demandes etait
   FERMEE : il ne pouvait jamais reclamer de materiel, parce qu'il n'avait
   pas de materiel a reclamer. Il en a un : la salle video. */
const C = require("./coach.js");
const AXE_EQUIP = {};
const MOT_AXE = {};
for (const a of C.AXES) { AXE_EQUIP[a.cle] = a.equip; MOT_AXE[a.cle] = a.mot; }

const axesDe = (c) => C.axesDe(c);

/* ==================================================================== */
/* FAMILLE 1 — L'ARGENT. Il connait le bareme, c'est tout le probleme.   */
/* ==================================================================== */
const FAMILLE_ARGENT = {

  augmentation: {
    famille: "argent",
    titre: "Il demande à être payé au tarif",
    dit: (c) => `Je ne demande pas la lune. Je demande ce que je vaux sur le `
      + `marché — et tu le sais aussi bien que moi. `
      + `Aujourd'hui je suis à ${c.salaire} € la semaine.`,
    /* Il ne le demande pas au premier euro manquant : il le demande quand
       l'ecart devient une insulte, et quand il n'a plus honte de le dire. */
    probable: (c, x) => !!x.bareme && c.salaire < x.bareme * 0.78
      && (c.semainesMaison || 0) >= 6,
    oui: { effet: "salaire_bareme",
      dit_coach: "Tu le montes au tarif du marché.",
      cout: "Sa fiche de paie passe au barème — toutes les semaines, pas une fois.",
      entente: 9 },
    non: { dit_coach: "Tu lui dis que la caisse ne suit pas.",
      entente: -7, motif: "augmentation refusée",
      reaction: "Il hoche la tête. Il ne le redemandera pas — il ira voir ailleurs." },
    /* La promesse a un sens ici : la caisse peut vraiment se remplir. */
    promesse: { condition: "semaines", n: 8, delai: 56, entente: 3,
      dit_coach: (n) => `Tu lui demandes ${n} semaines. Après, tu l'alignes.` },
  },

  prime_ceinture: {
    famille: "argent",
    titre: "Il attend sa part du titre",
    dit: () => `On a une ceinture au mur. Je l'ai préparé, ce combat. `
      + `Je ne vais pas quémander — mais je ne vais pas faire semblant non plus.`,
    probable: (c, x) => x.titres > (c.primesTitre || 0),
    oui: { effet: "prime_titre",
      dit_coach: "Tu lui verses une prime de titre.",
      cout: "Trois semaines de son salaire, d'un coup.",
      entente: 12 },
    non: { dit_coach: "Tu ne verses rien.",
      entente: -10, motif: "pas un centime sur la ceinture",
      reaction: "Il ne dit plus rien du tout. C'est pire." },
    promesse: null,   // une ceinture ne se represente pas : c'est maintenant.
  },
};

/* ==================================================================== */
/* FAMILLE 2 — LA CHARGE. Ce qu'on lui demande de porter.                */
/* ==================================================================== */
const FAMILLE_CHARGE = {

  un_seul_groupe: {
    famille: "charge",
    titre: "Il veut un seul groupe",
    dit: () => `Pros, amateurs, le cours du mardi — je cours partout et je `
      + `ne construis rien. Donne-m'en un. Un seul. Et regarde ce qu'il devient.`,
    /* /!\ « tous » N'EST PLUS UN GROUPE DU MODELE : c'etait DEUX cases
       tenues par le meme homme. On lit ce qu'il tient vraiment. */
    probable: (c) => C.groupesDe(c).length > 1 && (c.semainesTous || 0) >= 6,
    oui: { effet: "un_groupe",
      dit_coach: "Tu le recentres sur son groupe.",
      cout: "Le reste de la salle perd son encadrement sur cet axe.",
      entente: 8 },
    non: { dit_coach: "Il continue à tenir toute la salle.",
      entente: -6, motif: "étalé sur toute la salle",
      reaction: "Il repart au tapis. Les séances seront ce qu'elles seront." },
    promesse: { condition: "semaines", n: 6, delai: 42, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines de plus, le temps de recruter.` },
  },

  un_seul_axe: {
    famille: "charge",
    titre: "Il veut se recentrer sur son axe",
    dit: (c) => `Je fais ${MOT_AXE[axesDe(c)[0]]} depuis vingt ans. Le reste, je `
      + `le fais mal et ça se voit. Laisse-moi faire ce que je sais faire.`,
    probable: (c) => axesDe(c).length > 1,
    oui: { effet: "un_axe",
      dit_coach: "Tu le ramènes à son axe principal.",
      cout: "L'autre axe n'a plus personne dessus.",
      entente: 7 },
    non: { dit_coach: "Il garde ses deux casquettes.",
      entente: -5, motif: "gardé sur deux axes",
      reaction: "« Comme tu veux. » Il ne le pense pas." },
    promesse: null,
  },

  du_renfort: {
    famille: "charge",
    titre: "Il demande du renfort",
    dit: (c, x) => `On est ${x.eleves} sur le tapis et je suis seul. Je ne peux `
      + `pas corriger ${x.eleves} personnes en une heure. Trouve-moi quelqu'un.`,
    probable: (c, x) => x.eleves >= 22 && x.staffSurSonAxe <= 1,
    oui: { effet: "ouvrir_marche",
      dit_coach: "Tu vas voir qui est disponible.",
      cout: "Un coach de plus, c'est un salaire de plus, toutes les semaines.",
      entente: 5 },
    non: { dit_coach: "Il fera avec.",
      entente: -5, motif: "seul sur un groupe trop gros",
      reaction: "« Alors ne me demande pas des miracles. »" },
    promesse: { condition: "semaines", n: 8, delai: 56, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines pour trouver quelqu'un.` },
  },
};

/* ==================================================================== */
/* FAMILLE 3 — LA SALLE. Les murs et ce qu'il y a dedans.                */
/* ==================================================================== */
const FAMILLE_SALLE = {

  du_materiel: {
    famille: "salle",
    titre: "Il demande du matériel",
    dit: (c) => `On travaille ${MOT_AXE[axesDe(c)[0]]} avec ce qu'on a, et ce `
      + `qu'on a date. À un moment, ce n'est plus de la débrouille, c'est du bricolage.`,
    probable: (c, x) => { const d = AXE_EQUIP[axesDe(c)[0]];
      return !!d && (x.equip[d] || 1) <= 1; },
    oui: { effet: "materiel",
      dit_coach: "Tu équipes son domaine.",
      cout: "Une étoile de matériel, payée comptant.",
      entente: 8 },
    non: { dit_coach: "On garde ce qu'on a.",
      entente: -5, motif: "matériel refusé",
      reaction: "« On fera avec. On fait toujours avec. »" },
    promesse: { condition: "semaines", n: 6, delai: 42, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines. Le matériel viendra.` },
  },

  trop_petit: {
    famille: "salle",
    titre: "Il dit que la salle est trop petite",
    dit: (c, x) => `On refuse du monde à la porte et on se marche dessus à `
      + `l'intérieur. ${x.places} places, et on est plus que ça. Ça finira par un blessé.`,
    probable: (c, x) => x.effectif > x.places * 0.95,
    oui: { effet: "ouvrir_local",
      dit_coach: "Tu vas regarder les locaux.",
      cout: "Un loyer plus lourd, tous les mois.",
      entente: 4 },
    non: { dit_coach: "On reste là où on est.",
      entente: -4, motif: "salle saturée",
      reaction: "« Alors arrête de prendre du monde. »" },
    promesse: null,
  },
};

/* ==================================================================== */
/* FAMILLE 4 — LES HOMMES. Ce qu'il voit et que tu ne vois pas.          */
/* ==================================================================== */
const FAMILLE_HOMMES = {

  son_poulain: {
    famille: "hommes",
    titre: "Il veut prendre un gars sous son aile",
    dit: (c, x) => `${x.poulainNom}. Donne-le-moi. Pas un cours sur deux — à `
      + `moi, tous les jours. Dans deux ans tu me remercieras.`,
    probable: (c, x) => !!x.poulain && !c.poulain && c.niveau >= 40,
    oui: { effet: "poulain",
      dit_coach: "Il le prend en main.",
      cout: "Le reste du groupe passe au second plan.",
      entente: 9 },
    non: { dit_coach: "Le gars reste dans le groupe.",
      entente: -6, motif: "on lui a refusé son poulain",
      reaction: "« Tu le regretteras. Pas moi — lui. »" },
    promesse: null,
  },

  menager_un_gars: {
    famille: "hommes",
    titre: "Il veut qu'on ménage un de ses hommes",
    dit: (c, x) => `${x.crameNom} est cuit. Je le vois à chaque séance, il ne `
      + `récupère plus. Sors-le du tapis avant qu'il casse — après, c'est trop tard.`,
    probable: (c, x) => !!x.crame,
    oui: { effet: "menager",
      dit_coach: "Tu le mets au repos.",
      cout: "Il ne progresse plus tant qu'il souffle.",
      entente: 7 },
    non: { dit_coach: "Il continue comme les autres.",
      entente: -6, motif: "un homme laissé sur le tapis à bout",
      reaction: "« Note bien que je te l'ai dit. »" },
    promesse: null,
  },

  le_coin: {
    famille: "hommes",
    titre: "Il veut être dans le coin",
    dit: (c, x) => `${x.combattantNom} monte dans deux semaines. Je l'ai préparé. `
      + `Je veux être derrière lui ce soir-là, pas devant un écran.`,
    probable: (c, x) => c.metier === "competition" && !!x.combattant,
    oui: { effet: "au_coin",
      dit_coach: "Il sera dans le coin.",
      cout: "Le déplacement et la licence de seconde, à ta charge.",
      entente: 8 },
    non: { dit_coach: "Il regardera le combat comme tout le monde.",
      entente: -7, motif: "écarté du coin",
      reaction: "« C'est mon travail que tu envoies dans la cage. »" },
    promesse: null,
  },
};

const DEMANDES_STAFF = Object.assign({}, FAMILLE_ARGENT, FAMILLE_CHARGE,
  FAMILLE_SALLE, FAMILLE_HOMMES);

/**
 * Ce que CE coach-la peut venir demander, dans sa situation du moment.
 * @param {object} c   le coach
 * @param {object} x   le contexte lu dans la salle (voir contexteCoach)
 * @returns {Array} les demandes possibles, la plus pressante d'abord
 */
function possibles(c, x = {}) {
  if (!c || c.moi) return [];                 // on ne se demande rien a soi-meme
  const ctx = Object.assign({ bareme: null,
    equip: {}, eleves: 0, staffSurSonAxe: 1, effectif: 0, places: 99,
    titres: 0, poulain: null, crame: null, combattant: null }, x);
  return Object.entries(DEMANDES_STAFF)
    .filter(([, d]) => { try { return d.probable(c, ctx); } catch (e) { return false; } })
    .map(([cle, d]) => Object.assign({ cle }, d))
    /* /!\ LA PLUS PRESSANTE D'ABORD, ET « PRESSANTE » SE MESURE : c'est
       celle dont le NON coute le plus. Un homme sur le point de casser
       passe avant une etoile de materiel. */
    .sort((a, b) => a.non.entente - b.non.entente);
}

/**
 * Repondre. Rend le mouvement d'entente, l'effet a appliquer, et la
 * promesse creee le cas echeant.
 * @param {string} rep  "oui" | "non" | "plus_tard"
 */
function repondre(c, cle, rep, jour) {
  const d = DEMANDES_STAFF[cle];
  if (!d) throw new Error(`demandes_staff.js : demande inconnue "${cle}"`);

  if (rep === "plus_tard") {
    if (!d.promesse) throw new Error(`demandes_staff.js : "${cle}" ne se remet pas a plus tard`);
    const p = d.promesse;
    /* /!\ UNE PROMESSE EST UNE DONNEE, PAS UNE PHRASE. Condition et
       echeance sont ecrites : le jour venu, le jeu SAIT ce qu'il a promis.
       Sans ca, c'est le coach qu'on fait mentir. */
    return { reponse: rep, entente: p.entente, effet: null,
             dit_coach: p.dit_coach(p.n),
             promesse: { quoi: cle, n: p.n, echeance: jour + p.delai, tenue: false } };
  }

  const b = rep === "oui" ? d.oui : d.non;
  return { reponse: rep, entente: b.entente, effet: rep === "oui" ? b.effet : null,
           dit_coach: b.dit_coach, cout: b.cout || null,
           motif: b.motif || null, reaction: b.reaction || null, promesse: null };
}

/** Le texte de la demande, qui peut dependre de la salle. */
function ditDe(d, c, ctx) {
  return typeof d.dit === "function" ? d.dit(c, ctx || {}) : d.dit;
}

module.exports = { DEMANDES_STAFF, possibles, repondre, ditDe, axesDe,
                   AXE_EQUIP, MOT_AXE,
                   FAMILLE_ARGENT, FAMILLE_CHARGE, FAMILLE_SALLE, FAMILLE_HOMMES };
