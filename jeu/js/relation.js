/**
 * relation.js — TA RELATION AVEC UNE ORGANISATION, ET CE QU'ELLE ACHETE.
 *
 * Module natif JS, tenu par invariants (banc 20). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LE CHIFFRE DANS LE CODE, LES MOTS A L'ECRAN (Mael, 09/08)
 * ===================================================================
 * La relation vit en CHIFFRE (0-100) : chaque action a un effet exact,
 * mesurable, prouvable au banc. Le joueur, lui, ne lit JAMAIS le nombre —
 * il lit "ils t'apprecient", "ils commencent a s'agacer", plus un
 * commentaire quand ca bouge fort ("ton refus n'est pas passe").
 * MEME PATRON QUE LE POTENTIEL CACHE ET LES AVIS DU COACH : la valeur est
 * lue par le moteur, la lecture est humaine. Si ca frustre a l'usage, on
 * affichera le chiffre — c'est UNE ligne, et c'est ecrit ici pour que la
 * prochaine seance sache que le choix est reversible.
 *
 * ===================================================================
 * /!\ CE QUE LA RELATION ACHETE — ET POURQUOI ELLE EST UN VRAI DILEMME
 * ===================================================================
 * Elle decide de LA PLACE SUR LA CARTE, de la BOURSE dans sa fourchette,
 * et de LA QUALITE DE L'ADVERSAIRE propose. Relation basse : des combats
 * a risque, pour peu d'argent, en prelims.
 * Le dilemme de Mael, en une phrase : ton gars n'est pas remis, mais
 * accepter quand l'orga est dans l'embarras te fait un credit — et
 * refuser, tu sais que la prochaine offre sera moins belle.
 * CRAMER TON GARS OU CRAMER TON CREDIT.
 */

const CL = require("./classement.js");

/** Le depart : ni ami ni ennemi. */
const DEPART = 50;

/**
 * /!\ LES ENTREES, DICTEES PAR MAEL (09/08). Les valeurs sont des
 * PROPOSITIONS calibrees a la main, pas des mesures — a rejuger en jouant.
 * L'asymetrie est voulue : on perd plus vite qu'on ne gagne, comme dans
 * tout rapport professionnel.
 */
const ENTREES = {
  refus: -8,               // refuser une offre
  refus_repete: -14,       // deux refus de suite : l'orga se lasse
                           /* /!\ ADOUCI DE -20 A -14 LE 10/08 : a -20, TROIS
                              refus depuis un etat neutre suffisaient a tomber
                              a zero, et le quatrieme ne coutait plus rien —
                              or Mael veut que "si tu refuses 4 combats, a
                              chaque fois tu rebaisses". Avec -14 et le
                              surcout de -5 par refus supplementaire :
                              50 -> 42 -> 28 -> 9 -> 0. Quatre refus. */
  acceptation: +5,         // accepter une offre normale
  depannage: +15,          // accepter en COURTE PREPARATION : le vrai credit
  pesee_loupee: -18,       // /!\ l'orga deteste : la carte est en danger
  finish: +6,              // gagner par KO/TKO/soumission
  spectacle: +8,           // un combat qui a vendu du billet (voir estSpectacle)
  defaite: -2,             // perdre coute un peu ; on ne t'en veut pas vraiment
  /* /!\ CE QUI SE DIT DE VIVE VOIX (conception Mael, 10/08 : "ce qui fait
     monter, les diners, les dialogues, accepter les combats"). Parler
     rapporte peu — c'est le combat qui paie — mais parler regulierement
     finit par compter, et mal parler coute tout de suite. */
  echange_juste: +3,       // on discute, il te situe
  exigence: -4,            // reclamer plus haut sans l'avoir merite
  exigence_argent: -6,     // lui reprocher ses bourses
  diner: +12,              // une soiree avec lui (a venir : les diners)
};

/**
 * LES CINQ PALIERS DE LECTURE. C'est tout ce que le joueur voit.
 * /!\ Aucun chiffre ne doit sortir d'ici vers l'ecran.
 */
const PALIERS = [
  { seuil: 82, mot: "ils te font confiance",      ton: "haut" },
  { seuil: 64, mot: "ils t'apprécient",            ton: "bon" },
  { seuil: 42, mot: "rien à signaler",             ton: "neutre" },
  { seuil: 22, mot: "ils commencent à s'agacer",   ton: "bas" },
  { seuil: 0,  mot: "tu es en froid avec eux",     ton: "froid" },
];

function lire(valeur) {
  for (const p of PALIERS) if (valeur >= p.seuil) return p;
  return PALIERS[PALIERS.length - 1];
}

/** Les commentaires de mouvement : ce qui rend l'action lisible sans
 *  chiffre. Un seul par evenement, celui qui parle le plus. */
const COMMENTAIRES = {
  refus: "Ton refus n'est pas passé inaperçu.",
  refus_repete: "Deuxième refus de suite — le matchmaker ne t'a pas rappelé de la semaine.",
  depannage: "Tu les as dépannés au pied levé. Ça, ils s'en souviennent.",
  pesee_loupee: "Rater le poids a mis leur carte en danger. Ils te l'ont fait savoir.",
  finish: "Un finish, c'est exactement ce qu'ils veulent vendre.",
  spectacle: "On a parlé de ce combat toute la semaine.",
  acceptation: null,
  defaite: null,
};

/**
 * L'etat de relation avec toutes les organisations. Pose sur la partie,
 * pas sur le monde : c'est TA relation, elle ne concerne pas les NPC.
 */
function etatDepart() {
  const r = {};
  for (const cle of Object.keys(CL.ORGS)) r[cle] = { valeur: DEPART, refusDeSuite: 0 };
  return r;
}

/**
 * Bouger la relation. Rend { avant, apres, palier, commentaire, franchi }
 * — `franchi` dit qu'on a change de palier, donc que l'ecran doit le dire.
 * @param {object} etat  l'etat rendu par etatDepart()
 * @param {string} org   cle d'organisation
 * @param {string} quoi  une cle de ENTREES
 */
function bouger(etat, org, quoi) {
  const e = etat[org];
  if (!e) throw new Error(`relation.js : organisation inconnue "${org}"`);
  const delta = ENTREES[quoi];
  if (delta === undefined) throw new Error(`relation.js : entrée inconnue "${quoi}"`);

  // Le compteur de refus de suite vit ici : c'est lui qui declenche
  // l'entree aggravee, et n'importe quelle acceptation le remet a zero.
  let cle = quoi;
  let surcout = 0;
  if (quoi === "refus") {
    e.refusDeSuite++;
    if (e.refusDeSuite >= 2) cle = "refus_repete";
    /* /!\ CHAQUE REFUS DE PLUS COUTE PLUS CHER (Mael, 10/08 : "si tu
       refuses 4 combats, a chaque fois tu rebaisses"). Avant, le
       troisieme et le dixieme refus coutaient PAREIL que le deuxieme :
       on pouvait refuser indefiniment a prix fixe. Desormais chaque
       refus au-dela du deuxieme ajoute -6, sans plancher artificiel. */
    if (e.refusDeSuite >= 3) surcout = -5 * (e.refusDeSuite - 2);
  } else if (quoi === "acceptation" || quoi === "depannage") {
    e.refusDeSuite = 0;
  }

  const avant = e.valeur;
  e.valeur = Math.max(0, Math.min(100, e.valeur + ENTREES[cle] + surcout));
  const pAvant = lire(avant), pApres = lire(e.valeur);
  return { avant, apres: e.valeur, palier: pApres,
           commentaire: COMMENTAIRES[cle] || null,
           franchi: pAvant.mot !== pApres.mot };
}

/**
 * /!\ LE SPECTACLE SE LIT DANS CE QUE LE MOTEUR A TIRE, IL NE SE DECRETE
 * PAS (regle 7). Un combat vend du billet quand il s'est passe quelque
 * chose : du volume, des chutes, un finish, ou une guerre au sol. On lit
 * l'empreinte, jamais une etiquette posee a la main.
 * @param {object} empA empreinte du cote A
 * @param {object} empB empreinte du cote B
 */
function estSpectacle(empA, empB) {
  const rounds = Math.max(1, empA.rounds);
  const volume = (empA.sig[0] + empB.sig[0]) / rounds;   // frappes touchees par round
  const chutes = empA.kd + empB.kd;
  const fini = empA.methode !== "DÉCISION";
  const sol = (empA.pos.sol[0] + empB.pos.sol[0]) / rounds;
  const tentatives = empA.sub + empB.sub;

  // Trois voies vers le spectacle, toutes tirees du log :
  //   la guerre debout (gros volume des DEUX cotes),
  //   le finish violent (plusieurs chutes, ou un arret au 1er round),
  //   la bataille au sol (echanges et soumissions cherchees).
  // /!\ CALIBRE PAR MESURE, PAS AU JUGE. Premiere version : 63 % des
  // combats "spectaculaires" — un spectacle qui arrive deux fois sur
  // trois n'est plus un spectacle, et la prime de relation devenait un
  // du. Les seuils sont remontes sur la distribution reelle (volume
  // median 70/round, p10 a 107 ; 38 % de finitions) pour viser ~20 %.
  const guerre = volume >= 100 && Math.min(empA.sig[0], empB.sig[0]) >= rounds * 36;
  const violent = fini && (chutes >= 2 || (empA.rounds <= 1 && chutes >= 1));
  const bataille = sol >= 28 && tentatives >= 5;
  return guerre || violent || bataille;
}

/**
 * CE QUE LA RELATION ACHETE. Rend les modificateurs que l'etape suivante
 * (les offres) appliquera : place sur la carte, bourse, et durete de
 * l'adversaire propose.
 * - place : nombre de crans gagnes sur l'affiche (0 a 2)
 * - bourse : facteur applique dans la fourchette de l'org (0,85 a 1,20)
 * - durete : ecart de rang qu'on t'impose EN PLUS quand ils ne t'aiment
 *   pas — relation basse, on te propose des pieges.
 */
function faveurs(etat, org) {
  /* /!\ FILET : une organisation absente de la table (partie ancienne,
     nationale ajoutee apres coup) faisait lever ici — et proposerOffres
     appelle faveurs A CHAQUE JOUR pour chaque homme. Un trou dans la
     table arretait donc tout le marche. */
  const e = etat && etat[org];
  if (!e) return { place: 0, bourse: 1, durete: 1, montee: 0 };
  const v = e.valeur;
  const t = v / 100;
  return {
    place: v >= 82 ? 2 : v >= 64 ? 1 : 0,
    bourse: Math.round((0.85 + 0.35 * t) * 100) / 100,
    /* Mal vu : on t'envoie au casse-pipe — plus dur, moins paye. */
    durete: v >= 64 ? 0 : v >= 42 ? 1 : v >= 22 ? 3 : 5,
    /* /!\ BIEN VU : IL TE MONTE (conception Mael, 10/08 : "il te propose
       des meilleurs combats, disons 1 rang de plus, a 2 rangs si tu as
       vraiment une bonne entente"). C'est l'INVERSE de la durete, pas la
       meme chose : la durete est une punition mal payee, la montee est
       une OPPORTUNITE bien payee. Les deux poussent vers le haut du
       classement — ce qui change, c'est ce qu'on te donne en echange. */
    montee: v >= 82 ? 2 : v >= 60 ? 1 : 0,
  };
}

module.exports = { DEPART, ENTREES, PALIERS, COMMENTAIRES,
                   etatDepart, lire, bouger, estSpectacle, faveurs };
