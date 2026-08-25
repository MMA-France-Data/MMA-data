/**
 * engine.js — portage de engine.py (1286 lignes), le moteur de combat unifie.
 *
 * MOTEUR GELE : ce fichier est la traduction de l'etat gele du 08/08
 * (reference DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9). Les 5 boutons
 * CALIBRAGE_* y vivent, comme en Python — jamais dans les modules feuilles.
 *
 * PIEGES SPECIFIQUES A CE MODULE
 * 1. Les formats Python des logs : `{x:.0f}` arrondit A LA PAIRE (0.5->0,
 *    1.5->2), pas comme toFixed. `round(t)` pareil. D'ou fmt0/pyRound.
 * 2. `{f.name:<14}` = padEnd(14) ; `{x:>5.0f}` = padStart(5) du fmt0.
 * 3. max(TAKEDOWNS, key=...) = PREMIER maximum (ordre d'insertion, > strict).
 * 4. coups_sonne / rs_knockdowns_subis n'existent pas a l'init : getattr
 *    avec defaut 0 -> (x ?? 0).
 * 5. int() Python = troncature vers zero -> Math.trunc.
 * 6. head_damage : int en Python tant que seuls des ints s'y ajoutent (GnP),
 *    float des la premiere frappe debout. str() des deux coincide avec
 *    String() JS sauf float a valeur entiere ("23.0" vs "23") — cas
 *    quasi impossible (produits d'uniformes), surveille par le banc.
 * 7. L'ORDRE des tirages est la loi : chaque random()/uniform/choices dans
 *    l'ordre exact du Python, y compris ceux des branches mortes.
 */

const { alea } = require("./alea.js");
const { StanceState, LegDamage, ORTHODOX, SOUTHPAW,
        stabilite, facteur_puissance, facteur_esquive, facteur_precision,
        veut_switcher } = require("./stance.js");
const { BodyState } = require("./body.js");
const { StrikingProfileV2, ARMES: ARMES_V2, resolve_frappe,
        choisir_arme: choisir_arme_v2 } = require("./striking_v2.js");
const { ClinchProfile, clinch_sequence } = require("./clinch.js");
const { GroundProfile, POSITIONS, tenter_progression, tenter_evasion,
        tenter_soumission_top, tenter_soumission_bottom, resolve_gnp,
        TECHNIQUES_ESCAPE } = require("./ground_v2.js");

// SURCOUT_ECHEC_SOL / COUT_* vivent dans ground_v2.py mais sont des
// constantes de calibrage : on les relit depuis tables si presentes, sinon
// valeurs gelees du 08/08.
const SURCOUT_ECHEC_SOL = 1.5;
// Ce que coute une entree en lutte a celui qui la SUBIT, en part du cout de
// l'attaquant. Module par son niveau de defense : un excellent sprawl
// depense ~0,7 fois ce chiffre, un mauvais ~1,15 fois.
const COUT_DEFENSE_TD = 0.85;
// Ce que coute a l'attaquant une entree ratee. Etait a 1,5 quand le
// defenseur payait ZERO — desequilibre assume par erreur, pas par choix.
const SURCOUT_TD_RATE = 1.25;
const COUT_PASSAGE = 2.5;
const COUT_SUB_TOP = 2.0;
const COUT_GNP_COUP = 0.35;

// ------------------------------------------------------------------ phases
const DEBOUT = "debout", CLINCH = "clinch", SOL = "sol";
const CENTRE = "centre", CAGE = "cage";

// ------------------------------------------------------------ formats Python
/** round() de Python : demi vers le PAIR, en entier. */
function pyRound(x) {
  const f = Math.floor(x), diff = x - f;
  if (diff === 0.5) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}
/** format(x, '.0f') de Python (demi vers le pair). */
const fmt0 = (x) => String(pyRound(x));

// --------------------------------------------------------------- divisions
const DIVISIONS = {
  poids_paille:   { kg: 52.2,  dmg_mod: 0.845, volume_mod: 1.21, resist_mod: 2.95, usure_mod: 0.22, feminin: true },
  poids_mouche:   { kg: 56.7,  dmg_mod: 0.900, volume_mod: 1.20, resist_mod: 2.62, usure_mod: 0.25 },
  poids_coq:      { kg: 61.2,  dmg_mod: 0.925, volume_mod: 1.18, resist_mod: 2.48, usure_mod: 0.28 },
  poids_plume:    { kg: 65.8,  dmg_mod: 0.945, volume_mod: 1.16, resist_mod: 2.32, usure_mod: 0.31 },
  poids_leger:    { kg: 70.3,  dmg_mod: 0.960, volume_mod: 1.15, resist_mod: 2.19, usure_mod: 0.28 },
  poids_welter:   { kg: 77.1,  dmg_mod: 0.990, volume_mod: 1.13, resist_mod: 2.04, usure_mod: 0.3 },
  poids_moyen:    { kg: 83.9,  dmg_mod: 1.030, volume_mod: 1.10, resist_mod: 2.12, usure_mod: 0.38 },
  poids_mi_lourd: { kg: 93.0,  dmg_mod: 1.085, volume_mod: 1.07, resist_mod: 2.04, usure_mod: 0.6 },
  poids_lourd:    { kg: 120.2, dmg_mod: 1.150, volume_mod: 1.01, resist_mod: 1.78, usure_mod: 0.55 },
};

// ----------------------------------------------------------------- profils
const StrikingProfile = StrikingProfileV2;

class WrestlingProfile {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    this.shot = d("shot");
    this.clinch_wrestling = d("clinch_wrestling");
    this.throws = d("throws");
    this.sprawl = d("sprawl");
    this.whizzer = d("whizzer");
    this.balance = d("balance");
    this.grip_fighting = d("grip_fighting");
  }
}

class PhysicalProfile {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    this.cardio = d("cardio");
    this.chin = d("chin");
    this.recovery = d("recovery");
    this.body_conditioning = d("body_conditioning");
    this.balance_base = d("balance_base");
  }
}

class MentalProfile {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    this.discipline = d("discipline");
    this.fight_iq = d("fight_iq");
    this.aggression = d("aggression");
  }
}

// ------------------------------------------------------- constantes moteur
const DUREE_ROUND = 300;
const CLINCH_BASE_CARDIO = 1.0;
const TEMPO_CARDIO = 0.04;
const ECHELLE_DEPENSE = 0.28;
// Les 5 boutons du recalibrage (voir carnet, gele 08/08)
/* /!\ RECALIBRE LE 10/08 apres les fenetres de distance (0,36 -> 0,22).
   Une fois que chacun entre dans SA zone de travail, on encaisse
   beaucoup plus : DEC etait tombe a 36 % et le combat durait 2,60
   rounds. C'est la commotion qui portait l'exces, pas le KO sec. */
/* /!\ RECALIBRE LE 10/08 apres les fenetres de distance (0,36 -> 0,22).
   Une fois que chacun entre dans SA zone de travail, on encaisse
   beaucoup plus : DEC etait tombe a 36 % et le combat durait 2,60
   rounds. C'est la commotion qui portait l'exces, pas le KO sec. */
const CALIBRAGE_COMMOTION = 0.42;
const CALIBRAGE_FOIE = 0.12;
const CALIBRAGE_SUB = 0.42;
/* /!\ RELEVE DE 0,68 A 1,00 LE 10/08 — RECALIBRAGE DU CHANTIER D.
   La cage metrique a fait tomber le KO sec de 10,9 % a 5,9 % : a
   distance, on touche moins souvent net, et le coup qui assomme part
   moins. Le reste avait a peine bouge (SUB 21,4 contre 20,8 ; TKO 19,1
   contre 19,4) — un seul bouton suffisait donc, et c'est le bon signe :
   la geometrie n'a pas casse le modele, elle a deplace UNE chose.
   Mesure a 1,00 : DEC 50,9 | SUB 20,5 | TKO 16,8 | KO 11,8. A 1,25 le KO
   monte a 16,4 et mange le TKO — trop loin. */
const CALIBRAGE_KO_SEC = 0.78;
/* Desserre de 0,48 a 0,30 : l'arbitre arretait trop vite des lors que
   les hommes passaient plus de temps a portee. */
/* Desserre de 0,48 a 0,30 : l'arbitre arretait trop vite des lors que
   les hommes passaient plus de temps a portee. */
const CALIBRAGE_ARBITRE = 0.50;
const SEUIL_RELANCE = 42.0;

/* ==== LA CAGE METRIQUE — CHANTIER D, ETAPE 1 (arbitrage Mael, 10/08) =====
   Decision prise : on passe a une geometrie en METRES, en assumant que
   TOUT LE CALIBRAGE KO/TKO/SUB/DEC sera a refaire derriere. Ordre choisi
   par Mael : "les deux, allonge d'abord".

   /!\ ETAPE 1 = LA GEOMETRIE EXISTE ET SE MESURE, ELLE NE DECIDE RIEN.
   Aucun tirage n'est ajoute ni deplace : les 24 bancs doivent rester
   verts pendant qu'on regarde ce que la distance raconte. C'est
   seulement a l'etape 2 que la touche deviendra une question de distance
   franchissable — et c'est la que le calibrage tombera.

   L'UNITE DE VERITE EST LE METRE, JAMAIS LE PIXEL. Le gabarit dessine un
   cercle de 148 px : c'est de l'AFFICHAGE. Raisonner en pixels puis
   convertir vers le moteur reviendrait a faire piloter la simulation par
   la feuille de style. Ici tout est en metres ; la conversion se fait en
   bout de chaine (1 m ~ 32,4 px).                                       */
const CAGE_RAYON = 4.57;          // octogone reglementaire : 9,14 m de diametre
const DIST_DEPART = 2.2;          // ce qui separe deux hommes qui se jaugent

/* L'allonge, en metres. Le moteur ne la portait pas : on la deduit du
   gabarit de la division, corrigee par l'archetype (un kickboxeur de
   distance est long pour sa categorie, un lutteur trapu). */
const ALLONGE_DIV = {
  poids_paille: 1.60, poids_mouche: 1.65, poids_coq: 1.70, poids_plume: 1.75,
  poids_leger: 1.80, poids_welter: 1.88, poids_moyen: 1.93,
  poids_mi_lourd: 1.98, poids_lourd: 2.03,
};
/* La taille moyenne par division, en metres. Un poids lourd n'est pas un
   poids paille avec plus de muscle : c'est un autre gabarit. */
const TAILLE_DIV = {
  poids_paille: 1.60, poids_mouche: 1.65, poids_coq: 1.68, poids_plume: 1.72,
  poids_leger: 1.77, poids_welter: 1.82, poids_moyen: 1.86,
  poids_mi_lourd: 1.90, poids_lourd: 1.93,
};

/**
 * LE CORPS D'UN HOMME — taille et allonge, en metres (Mael, 10/08 :
 * "chaque perso a une taille et une allonge ?").
 * /!\ DEDUIT DE SON IDENTITE, PAS TIRE AU SORT. Deux raisons :
 *   1. un tirage consommerait du hasard et deplacerait TOUS les combats
 *      suivants — les bancs le verraient aussitot ;
 *   2. un homme doit avoir LE MEME CORPS a chaque lecture, y compris
 *      apres un rechargement. Une morphologie tiree a la volee ferait
 *      grandir et retrecir les gens entre deux sessions.
 * La division donne le gabarit ; l'ecart individuel vient du nom (+/- 8
 * cm, ce qui est l'amplitude reelle d'une categorie) ; et l'allonge se
 * detache de la taille selon CE QUE L'HOMME SAIT FAIRE : celui qui vit
 * aux jambes et au teep est long pour sa taille, celui qui vit au
 * crochet est court. La morphologie EXPLIQUE le style au lieu de le
 * decorer.
 */
function morphoDe(f) {
  if (f._morpho) return f._morpho;
  let h = 0;
  const src = String(f.name || "") + "|" + String(f.division || "");
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  const base = TAILLE_DIV[f.division] !== undefined ? TAILLE_DIV[f.division] : 1.77;
  const ecart = ((h % 161) - 80) / 1000;             // -8 cm a +8 cm
  const taille = Math.round((base + ecart) * 1000) / 1000;
  const loin = (f.striking.low_kick + f.striking.body_kick + f.striking.teep) / 3;
  const pres = (f.striking.crochet + f.striking.uppercut) / 2;
  /* L'allonge tourne autour de la taille : +2 cm en moyenne chez un
     humain, et l'ecart au style vaut jusqu'a +/- 10 cm. */
  const allonge = Math.round((taille + 0.02 + (loin - pres) / 100 * 0.10) * 1000) / 1000;
  f._morpho = { taille, allonge };
  return f._morpho;
}
function tailleDe(f) { return f.taille || morphoDe(f).taille; }
function allongeDe(f) { return f.allonge || morphoDe(f).allonge; }
/** La portee utile : la moitie de l'allonge, plus la fente. */
function porteeDe(f) {
  const fente = 0.30 + f.striking.footwork / 100 * 0.25;
  return Math.round((allongeDe(f) / 2 + fente) * 1000) / 1000;
}

/* ==== CHAQUE ARME A SA BANDE DE DISTANCE (Mael, 10/08) ==================
   "J'imagine que tu as mis la portee maximale, donc a 10 cm le gars peut
   mettre un kick tete ? Un gars avec des longs bras sera pas a l'aise
   pour placer des crochets a distance d'un petit style Topuria."
   Les deux remarques sont justes, et elles disent la meme chose : UNE
   ARME N'A PAS UNE PORTEE, ELLE A UNE FENETRE. Trop loin on ne touche
   pas ; TROP PRES ON NE PEUT PLUS L'ARMER.
   /!\ ET LE MINIMUM DEPEND DU CORPS : c'est la que la remarque sur
   Topuria mord. Un homme aux bras longs a besoin de PLUS d'espace pour
   plier un crochet — le petit qui rentre sous ses coudes le met dans une
   zone ou il ne peut plus rien lancer. Le desavantage du grand au corps
   a corps n'est plus une regle ecrite : il tombe de sa propre allonge. */
/* /!\ RE-ECHELONNEES LE 10/08 (Mael : "ils sont toujours colles sur le
   format actuel, je sais pas pourquoi"). Les premieres fractions —
   courte 0,20-0,58 — disaient qu'un crochet se lance a UN CINQUIEME de
   la distance d'un jab. C'est faux : un crochet part d'un peu plus pres,
   pas cinq fois plus pres. Consequence mesuree : la distance de travail
   moyenne tombait vers 0,75 m, tout le monde vivait au corps a corps, le
   jab et les jambes n'etaient presque jamais dans leur fenetre.
   Proportions reelles, prises sur la distance de reference (bras tendu +
   fente) : un crochet vit entre 45 % et 80 % de cette distance, un cross
   entre 60 % et 92 %, un jab et les kicks entre 75 % et 105 %.
   En dessous de 45 %, on ne frappe plus : on se tient. */
/* /!\ RETOUR EN ARRIERE ASSUME (10/08). J'avais re-echelonne ces bandes
   sur des proportions "physiques" (courte 0,45-0,80, longue 0,75-1,05)
   pour repondre a Mael — "ils sont toujours colles". Les fractions
   etaient effectivement plus justes SUR LE PAPIER. MESURE : le duel long
   contre court S'EST INVERSE — le boxeur gagnait 51-9 et touchait deux
   fois et demie plus que le kickboxeur, exactement le contraire du reel
   et de ce que Mael demande ("il s'expose peu aux coups adverses").
   RAISON : avec des fenetres aussi larges, les deux hommes convergent en
   zone de POINGS et le long n'a plus aucune arme propre. Le modele de
   DISTANCE DE TRAVAIL ne sait pas encore poser un homme a sa distance de
   jambes ; tant qu'il ne le sait pas, des bandes "justes" produisent un
   combat FAUX.
   REGLE : entre une valeur juste sur le papier et un duel qui ressemble a
   ce qu'on voit dans une cage, on garde le duel. On rouvrira ces bandes
   EN MEME TEMPS que le modele de distance, pas avant. */
const BANDE = {
  longue:  [0.55, 1.02],
  moyenne: [0.38, 0.86],
  courte:  [0.20, 0.58],
};
function bandeArme(f, arme) {
  const info = ARMES_V2[arme];
  if (!info) return [0, 9];
  const fente = 0.30 + f.striking.footwork / 100 * 0.25;
  /* Une jambe est plus longue qu'un bras : un high kick porte loin, mais
     il lui faut aussi bien plus de place pour partir. */
  const jambe = ["low_kick", "body_kick", "high_kick", "teep", "spinning"]
    .includes(info.skill);
  /* /!\ UNE JAMBE PORTE PLUS LOIN QU'UN BRAS. La premiere version
     donnait deux references quasi egales (1,35 contre 1,32) — ce qui
     n'a rien de physique et privait les kicks de leur avantage. */
  /* /!\ UNE JAMBE PORTE PLUS LOIN QU'UN BRAS, MAIS PAS TANT QUE CA
     (ajuste le 10/08) : a 0,58 de la taille, le PLANCHER des kicks
     (1,20 m) tombait AU-DESSUS du plafond des poings (1,35 pour le jab)
     avec a peine un recouvrement — d'ou des combats soit 100 % poings,
     soit 80 % jambes, jamais melanges. Un low kick se place a distance
     de jab : les deux registres doivent SE CHEVAUCHER largement. */
  const ref = jambe ? tailleDe(f) * 0.50 + fente : allongeDe(f) / 2 + fente;
  const [a, b] = BANDE[info.portee] || BANDE.moyenne;
  /* Le high kick demande de l'espace pour monter : son minimum est plus
     haut que celui d'un low kick, a portee egale. */
  const planche = info.zone === "tete" && jambe ? 0.20 : 0;
  return [Math.round(ref * (a + planche) * 1000) / 1000,
          Math.round(ref * b * 1000) / 1000];
}
/**
 * Choisir parmi les armes disponibles a cette distance : au TALENT, avec
 * du hasard, et en fuyant la repetition. Le poids suit la meme forme que
 * choisir_arme (skill au-dessus de 40, exposant 1,5) pour que les deux
 * chemins se ressemblent.
 */
function tirerArmeDispo(f, dfn, dispo, precedent, cible) {
  if (!dispo.length) return precedent;
  if (dispo.length === 1) return dispo[0];
  const poids = dispo.map((a) => {
    const info = ARMES_V2[a];
    const sk = f.striking.competence(a);
    const def = dfn && dfn.striking[info.defense] !== undefined
      ? dfn.striking[info.defense] : 50;
    /* /!\ MEME PONDERATION QUE choisir_arme — sinon les deux chemins ne
       choisissent pas le meme genre de coups et le combat change de
       nature selon la distance. La premiere version ne pesait que le
       talent : les jambes tombaient a 2 % et le jab a 6 %, parce qu'un
       coup facile a placer n'etait pas avantage. */
    const pTouche = Math.max(0.05, Math.min(0.90,
      (44 + (sk - def) * 0.75 + (info.facilite || 0) * 0.5) / 100));
    let w = Math.max(0.15, sk > 40 ? Math.pow(sk - 40, 1.5) : 0.15);
    w *= Math.pow(pTouche, 0.8 + f.striking.timing / 200);
    if (info.skill === "spinning") w *= 0.22;
    if (cible) {
      if (cible === "jambes")     w *= info.zone === "jambe" ? 3.4 : (info.zone === "tete" ? 0.5 : 0.8);
      else if (cible === "corps") w *= info.zone === "corps" ? 3.2 : (info.zone === "tete" ? 0.55 : 0.8);
      else if (cible === "tete")  w *= info.zone === "tete" ? 2.2 : 0.55;
    }
    if (a === precedent) w *= 0.28;          // on ne se repete pas betement
    return w;
  });
  return alea.choices(dispo, poids, 1)[0];
}

/**
 * LA DISTANCE OU IL TRAVAILLE : moyenne des centres de fenetre de ses
 * armes, ponderee par ce qu'il sait faire (talent au-dessus de 40, au
 * carre pour que ses vraies armes pesent). Un kickboxeur se pose loin
 * parce que SES armes y vivent ; un boxeur se pose court. Personne ne
 * s'accroche a la fenetre d'un seul coup.
 */
function distanceDeTravail(f, corps) {
  /* /!\ SES CINQ MEILLEURES ARMES, PAS LES QUATORZE (corrige le 10/08
     apres mesure). En moyennant TOUT l'arsenal, les poings — plus
     nombreux dans la table et de fenetre plus courte — tiraient tout le
     monde vers 1,0 m. Consequence mesuree, et grave : LE KICKBOXEUR
     PERDAIT SON ARME. Il convergeait en zone de poings, ou il n'a rien a
     faire de mieux qu'un boxeur : le duel long contre court s'inversait
     (le boxeur gagnait 53-7 et touchait deux fois plus). Un homme se
     place a la distance de CE QU'IL SAIT FAIRE — c'est-a-dire de ses
     armes reelles, pas de la moyenne de ce qui existe. */
  /* /!\ NI SES CINQ MEILLEURES ARMES, NI TOUTES : LES DEUX (corrige le
     10/08 apres deux mesures qui se contredisaient). En moyennant TOUT
     l'arsenal, les poings — plus nombreux et de fenetre plus courte —
     tiraient chacun a ~1 m et les jambes tombaient a 2 %. En ne prenant
     que le TOP 5, un kickboxeur se posait a 1,46 m ou SEULES LES JAMBES
     rentrent dans une fenetre : 84 % de kicks, un canardage absurde. Les
     deux calculs sont faux du meme defaut — ils enferment l'homme dans
     un seul registre. Un kickboxeur donne des jambes ET des mains : sa
     distance est un COMPROMIS entre ce qu'il prefere et ce qu'il sait
     faire par ailleurs. */
  const toutes = Object.keys(ARMES_V2).map((a) => [a, f.striking.competence(a)]);
  const top = toutes.slice().sort((x, y) => y[1] - x[1]).slice(0, 5);
  const moyenne = (liste) => {
    let s = 0, p = 0;
    for (const [a, sk] of liste) {
      const w = sk > 40 ? Math.pow(sk - 40, 2) : 1;
      const [mn, mx] = bandeArme(f, a);
      s += ((mn + mx) / 2) * w; p += w;
    }
    return p ? s / p : porteeDe(f);
  };
  const cible = 0.5 * moyenne(top) + 0.5 * moyenne(toutes);
  /* /!\ LE RABAIS "IL VEUT LE CORPS A CORPS" ETAIT UN COUPERET (10/08) :
     au-dessus de 0,25 de lutte+clinch — ce qui est le cas de PRESQUE TOUS
     les combattants generes — on multipliait par 0,85 d'un coup. Tout le
     monde se retrouvait 15 % trop pres, sous la fenetre des jambes :
     mesure, les kicks tombaient a 1 % des coups. Le rabais est desormais
     PROGRESSIF et plafonne : un vrai lutteur se rapproche vraiment, un
     frappeur qui a 0,3 de lutte au gameplan ne bouge presque pas. */
  const rabais = 1 - Math.min(0.18, Math.max(0, corps - 0.2) * 0.5);
  return Math.max(0.4, cible * rabais);
}

/** La plus longue de ses armes : au-dela, il ne peut plus rien tenter. */
function maxBande(f) {
  let m = 0;
  for (const a of Object.keys(ARMES_V2)) {
    const b = bandeArme(f, a)[1];
    if (b > m) m = b;
  }
  return m;
}

/** Ce qu'il peut lancer a cette distance-la, et rien d'autre. */
function armesA(f, d) {
  const out = [];
  for (const a of Object.keys(ARMES_V2)) {
    const [mn, mx] = bandeArme(f, a);
    if (d >= mn && d <= mx) out.push(a);
  }
  return out;
}

/* /!\ L'ETAT DE ROUND MEURT A CHAQUE ROUND (`const etat` dans
   simuler_round) : la geometrie s'y pose, mais le RELEVE doit survivre
   au combat entier pour etre lisible. Il vit donc ici, au module, comme
   TELEMETRY — remis a zero par reset_geometrie(). */
const GEO = { n: 0, somme: 0, min: 9, max: 0, dansPortee: [0, 0],
              contreGrille: 0, allonge: [0, 0], portee: [0, 0] };
function reset_geometrie() {
  GEO.n = 0; GEO.somme = 0; GEO.min = 9; GEO.max = 0;
  GEO.dansPortee = [0, 0]; GEO.contreGrille = 0;
  GEO.allonge = [0, 0]; GEO.portee = [0, 0];
}

/** Les positions vivent sur l'etat du combat, en metres depuis le centre. */
function poserGeometrie(etat, f1, f2) {
  if (etat.geo) return etat.geo;
  etat.geo = {
    a: { x: -DIST_DEPART / 2, y: 0 },
    b: { x:  DIST_DEPART / 2, y: 0 },
    /* /!\ IL Y A UN DEVANT ET UN DERRIERE (conception de Mael, 10/08 :
       "est-ce qu'il y a un devant et derriere, ou le gars peut taper dans
       tous les sens ?"). Jusqu'ici : un point sans orientation, qui
       frappait dans toutes les directions — donc "tourner autour" ne
       voulait rien dire, et couper l'angle non plus.
       cap = la direction vers laquelle il est place, en radians. */
    capA: 0, capB: Math.PI,
    ecart: [0, 0],          // de combien chacun est desaxe, en radians
    d: DIST_DEPART,
    portee: [porteeDe(f1), porteeDe(f2)],
    allonge: [allongeDe(f1), allongeDe(f2)],
    /* Ce qu'on veut LIRE a l'etape 1 : ou se joue reellement le combat. */
    releve: { n: 0, somme: 0, dansPortee: [0, 0], contreGrille: 0, min: 9, max: 0 },
  };
  return etat.geo;
}

/* ==== LES TEMPERAMENTS (conception de Mael, 10/08) ======================
   Le moteur savait CE QU'UN HOMME SAIT FAIRE ; il ne savait rien de
   COMMENT IL CHOISIT DE LE FAIRE. Deux hommes aux memes stats livraient
   exactement le meme combat. Mael, en citant des vrais : "Du Plessis
   lutte fort aussi, Pyfer peut lutter, Gaethje a toujours eu un super
   dirty boxing — ils ont tous d'autres armes." Ce qui les separe n'est
   pas leur arsenal, c'est leur TEMPERAMENT.
   /!\ ET C'EST AUSSI LA CLEF DES JAMBES A 1-2 % : chacun visait la
   MOYENNE des fenetres de son arsenal, soit ~1 m — sous le plancher des
   kicks (1,20 m). Un fuyard vise le MAXIMUM de sa plus longue arme : ses
   jambes travaillent enfin. Le probleme se resout par le comportement,
   pas par un enieme reglage de fenetre. */
const TEMPERAMENTS = {
  /* Adesanya, Gane. "Il est aerien et ne s'assoit pas sur ses coups"
     (Mael) : il gagne aux points sans jamais s'engager. */
  fuyard:    { nom: "il te fait venir",   viser: "max",   tourner: 1.5,
               entrer: 0.35, sortirApres: 0.9, corps: 0.25 },
  /* Volkanovski, Du Plessis : il enleve l'espace, pas pour echanger mais
     pour que l'autre n'ait plus d'options. */
  presseur:  { nom: "il vient te chercher", viser: "court", tourner: 0.35,
               entrer: 1.5,  sortirApres: 0.1, corps: 0.9 },
  /* Gaethje premiere periode, Saint Denis : il entre TOUT DROIT et
     accepte d'en prendre pour en donner. Il ne coupe pas, il echange. */
  echangeur: { nom: "il vient échanger",  viser: "court", tourner: 0.15,
               entrer: 1.7,  sortirApres: 0.0, corps: 0.6 },
  /* Machida, le contreur : il attend hors de portee et punit l'entree. */
  guetteur:  { nom: "il attend son coup", viser: "max",   tourner: 0.8,
               entrer: 0.2,  sortirApres: 0.5, corps: 0.2 },
  /* Merab, Belal (idee de Mael) : il ne veut pas te frapper, il veut que
     TU NE FASSES RIEN. Il te colle a la cage, il t'use, il marque. */
  etouffeur: { nom: "il t'étouffe",       viser: "colle", tourner: 0.2,
               entrer: 1.6,  sortirApres: 0.0, corps: 1.0 },
};

/* /!\ LE TEMPERAMENT SE DEDUIT DU GAMEPLAN ET DU CARACTERE tant qu'il
   n'est pas pose a la main : aucun combattant existant n'en porte, et on
   ne va pas regenerer le monde pour ca. */
/* /!\ IL SE DEDUIT DE L'ARCHETYPE, PAS DU GAMEPLAN (corrige apres mesure
   du 10/08 : en partant du gameplan, on obtenait presseur 53 %,
   echangeur 42 %, guetteur 4 % — ET AUCUN FUYARD NI ETOUFFEUR. Raison :
   les gameplans generes portent presque tous un peu de lutte, donc tout
   le monde tombait dans la case "corps a corps". Or ce qui dit comment
   un homme se bat, c'est CE QU'IL EST : un kickboxeur de distance fait
   venir l'autre, un grappler l'etouffe. Le caractere ne fait que
   nuancer. */
const TEMPERAMENT_ARCHETYPE = {
  kickboxeur_distance: "fuyard",
  boxeur_pressure:     "presseur",
  brawler:             "echangeur",
  lutteur_controle:    "etouffeur",
  grappler_soumission: "etouffeur",
  polyvalent:          "presseur",
};
function temperamentDe(f) {
  if (f.temperament && TEMPERAMENTS[f.temperament]) return f.temperament;
  const ag = f.mental.aggression, iq = f.mental.fight_iq;
  let t = TEMPERAMENT_ARCHETYPE[f.archetype] || null;
  if (!t) {
    /* Sans archetype connu : on lit ses armes. Celui qui vit aux jambes
       et au teep fait venir ; celui qui vit au clinch etouffe. */
    const loin = (f.striking.low_kick + f.striking.body_kick + f.striking.teep) / 3;
    const pres = (f.striking.crochet + f.striking.uppercut) / 2;
    const corps = (f.gameplan.wrestling || 0) + (f.gameplan.clinch || 0);
    if (corps > 0.5) t = "etouffeur";
    else if (loin > pres + 8) t = "fuyard";
    else if (ag >= 60) t = "echangeur";
    else t = "presseur";
  }
  /* Le caractere nuance : un kickboxeur tres agressif vient chercher, un
     bagarreur tres lucide attend son coup. */
  if (t === "fuyard" && ag >= 68) t = "echangeur";
  if (t === "echangeur" && iq >= 72 && ag < 55) t = "guetteur";
  if (t === "presseur" && iq >= 70 && ag < 45) t = "guetteur";
  f.temperament = t;
  return t;
}

/* /!\ ET IL BASCULE EN COURS DE COMBAT (Mael) : "quand il sent que
   l'adversaire craque, il devient offensif et se decouvre — ça arrive
   aussi." Le fuyard bascule quand l'autre est TOUCHE ; l'etouffeur quand
   l'autre est VIDE. Deux facons de sentir qu'un homme est cuit, et deux
   temperaments qui s'ouvrent alors. */
function temperamentVif(f, adv) {
  const base = temperamentDe(f);
  if (base === "fuyard" && (adv.head_damage > 55 || adv.knockdowns > 0)) return "echangeur";
  if (base === "etouffeur" && adv.cardio_ratio() < 0.62) return "presseur";
  if (base === "guetteur" && (adv.head_damage > 65 || adv.sonne > 0)) return "presseur";
  return base;
}


/**
 * UN PAS. Chaque echange debout, les deux hommes se replacent : celui qui
 * veut la distance recule et tourne, celui qui veut entrer avance. Rien
 * n'est tire au sort ici — le deplacement se DEDUIT du footwork, du
 * cage_cutting et de ce que chacun cherche.
 * /!\ AUCUN APPEL AU GENERATEUR : c'est ce qui garde les bancs verts.
 */
function avancerGeometrie(etat, f1, f2) {
  const g = poserGeometrie(etat, f1, f2);
  /* /!\ PREMIERE VERSION FAUSSE, TROUVEE PAR LA MESURE (10/08).
     J'avais ecrit "celui qui veut de l'espace recule" : les deux voulant
     de l'espace, ils reculaient TOUS LES DEUX jusqu'aux grilles opposees.
     Mesure : distance moyenne 8,20 m dans une cage de 9,14, et 0 % du
     temps a portee — personne ne pouvait plus se toucher. Un frappeur ne
     veut pas "de l'espace" : il veut SA distance, celle ou il touche sans
     etre touche. Au-dela, il avance. C'est ce qui rend le modele
     auto-limitant au lieu de divergent. */
  /* /!\ CHACUN VEUT LA DISTANCE DE SON MEILLEUR COUP — pas sa portee
     maximale (corrige le 10/08 apres mesure : le long gagnait 59-1 parce
     que le court visait sa propre allonge au lieu de RENTRER a portee de
     crochet, et n'y arrivait donc jamais). Un frappeur de pression ne
     veut pas "un peu moins loin" : il veut le milieu de la fenetre ou
     ses crochets vivent. C'est ca, couper la distance. */
  const ideale = (f) => {
    const adv = f === f1 ? f2 : f1;
    const T = TEMPERAMENTS[temperamentVif(f, adv)];
    /* /!\ IL RESSORT APRES AVOIR FRAPPE. C'est ce qui casse la boucle du
       canardage : sa distance visee s'ALLONGE juste apres son geste,
       proportionnellement a ce que le geste l'a engage. Un fuyard entre,
       touche, et se remet hors de portee ; un echangeur (sortirApres 0)
       reste dedans et continue. */
    const engage = (etat.vientDeFrapper && etat.vientDeFrapper[f.name]) || 0;
    let recul = 1 + engage * T.sortirApres * 0.55;
    /* /!\ IL VIENT DE MANGER UN KICK : il rentre. Sa distance visee se
       raccourcit d'un coup — il ferme l'espace pendant que l'autre
       remet son pied par terre. C'est ce qui melange enfin les deux
       registres : les jambes ouvrent la porte aux poings, au lieu de
       tourner en boucle sur elles-memes. Un homme qui vient de frapper
       ne profite de rien : il est deja engage ailleurs. */
    const porte = (etat.kickSubi && etat.kickSubi[f.name]) || 0;
    if (porte > 0 && engage < 0.3) recul *= 1 - porte * 0.62;
    /* /!\ LE TEMPERAMENT FIXE LA DISTANCE — c'est ici que le probleme des
       jambes se resout. "viser: max" pose l'homme au BOUT de sa plus
       longue arme (donc dans sa fenetre de kicks, 1,20 a 1,68 m) au lieu
       de la moyenne de son arsenal (~1 m, sous le plancher des kicks). */
    if (T.viser === "colle") return 0.32;       // l'etouffeur veut le contact
    if (T.viser === "max") {
      /* /!\ LE BLITZ EST UN ACTE, PAS UNE ONDULATION (corrige apres deux
         mesures ratees : faire osciller la distance visee ne changeait
         RIEN, parce que les deux hommes ondulent en opposition de phase
         et que l'ecart entre eux reste constant — 1,47 m et 84 % de
         jambes, inchange). Un fuyard passe l'essentiel du temps a sa
         distance de jambes PUIS PLONGE, franchement, en distance de
         poing : il frappe et il ressort. On alterne donc par cycle, et
         il ne plonge pas s'il vient de frapper (il est en train de
         ressortir). */
      const cycle = Math.floor(g.releve.n / 3) % 3;
      if (cycle === 0 && engage < 0.25) return distanceDeTravail(f, 0) * 0.92;
      return Math.max(0.5, maxBande(f) * 0.88) * recul;
    }
    const corps = (f.gameplan.wrestling || 0) + (f.gameplan.clinch || 0);
    if (corps > 0.45) return 0.35;              // il veut le corps a corps
    /* /!\ SA DISTANCE VIENT DE TOUT SON ARSENAL, PAS DE SON SEUL
       MEILLEUR COUP (corrige le 10/08 apres mesure : les jambes etaient
       tombees a 3 % et le jab a 6 %). En ne visant que la fenetre de son
       coup n°1 — un poing neuf fois sur dix — chacun se collait a
       distance de poing, et les kicks n'etaient JAMAIS a portee. Un
       homme se place la ou PLUSIEURS de ses armes travaillent : on fait
       donc la moyenne des centres de fenetre, ponderee par le talent. */
    return distanceDeTravail(f, corps) * recul;
  };
  /* Le pas garde le footwork — c'est sa place legitime — mais moins fort. */
  const pas = (f) => 0.12 + f.striking.footwork / 100 * 0.15;

  const dx = g.b.x - g.a.x, dy = g.b.y - g.a.y;
  const d0 = Math.max(0.2, Math.hypot(dx, dy));
  const ux = dx / d0, uy = dy / d0;

  /* Chacun corrige vers SA distance ideale, et derive sur le cote — c'est
     la derive qui fait tourner un combat au lieu de le laisser sur une
     ligne. Celui qui a le meilleur cage_cutting impose davantage : sa
     correction pese plus que celle de l'autre. */
  const poids = (f, o) => 0.5 + (f.striking.cage_cutting - o.striking.cage_cutting) / 400;
  /* /!\ TOURNER AUTOUR EST UNE DECISION (conception de Mael, 10/08).
     Jusqu'ici la derive laterale etait une OSCILLATION DECORATIVE :
     tout le monde derivait pareil, personne ne gagnait d'angle, et le
     compteur "sorti de son axe" restait a zero sur 50 combats. Un homme
     TOURNE quand il a une raison de tourner :
       - il est plus mobile que l'autre (c'est son arme) ;
       - il est trop pres pour ce qu'il sait faire, mais ne veut pas
         reculer bêtement dans la grille ;
       - il vient d'etre acule et cherche la sortie laterale.
     Et tourner COUTE : on n'avance pas en meme temps. Celui qui tourne
     renonce a couper la distance ce tour-ci. */
  /* /!\ L'ENVIE DE TOURNER NE DEPEND PAS DE L'AUTRE (corrige le 10/08).
     Je soustrayais le cage_cutting de l'adversaire : un mobile face a un
     bon coupeur n'avait donc plus AUCUNE envie de tourner — et comme le
     barrage se declenche quand l'autre TENTE de sortir, il ne se
     declenchait jamais. Or un mobile veut toujours tourner : c'est son
     jeu. C'est la COUPE qui doit faire echouer sa sortie, pas
     l'intention qui doit disparaitre. Le cage_cutting agit une seule
     fois, au bon endroit : sur le pas lateral (voir `coupe`). */
  const envieTourner = (f, monPose) => {
    if (monPose > 0) return 0;                    // pose : on ne tourne pas
    const adv = f === f1 ? f2 : f1;
    const T = TEMPERAMENTS[temperamentVif(f, adv)];
    let v = ((f.striking.footwork - 45) / 130 + (f.mental.fight_iq - 50) / 200) * T.tourner;
    if (etat.acculeGeo === f.name) v += 0.55;     // dos a la grille : il faut sortir
    v += (f.mental.fight_iq - 50) / 300;          // il sait quand ca sert
    return Math.max(0, Math.min(1, v));
  };

  /* /!\ LA DISTANCE RESPIRE aussi : corriger vers UNE distance ideale
     fixe faisait converger le combat sur un point mort. */
  /* /!\ LE BLITZ DU KARATEKA (Mael : "soit il kick, soit il explose style
     karateka et ressort"). A 1,47 m — la distance ou se pose un fuyard —
     SEULES LES JAMBES rentrent dans une fenetre : les poings s'arretent a
     1,35. D'ou 84 % de jambes, un canardage absurde. Ce n'etait pas un
     probleme de retrait mais D'ALLER CHERCHER : il faut qu'il PLONGE
     regulierement en distance de poing, frappe, et ressorte.
     L'amplitude de respiration est donc bien plus large pour ceux qui
     vivent loin (fuyard, guetteur) : ils alternent vraiment entre leur
     distance de jambes et une incursion aux poings. */
  const ampli = (f) => {
    const t = temperamentDe(f);
    return (t === "fuyard" || t === "guetteur") ? 0.40 : 0.22;
  };
  const resp = (f, phase) => 1 + ampli(f) * Math.sin(g.releve.n * 0.55 + phase)
                               * (0.6 + f.striking.footwork / 250);
  const corr1 = (ideale(f1) * resp(f1, 0) - d0) * poids(f1, f2);
  const corr2 = (ideale(f2) * resp(f2, Math.PI * 0.8) - d0) * poids(f2, f1);
  /* /!\ ET LA DERIVE LATERALE COMPTE VRAIMENT : c'est elle qui deplace
     l'angle sous les pieds de l'autre. 0,30 la rendait decorative. */
  let bougerLat = 0.62;                 // amplitude de la derive laterale
  const bouger = (p, sens, f, corr, phase) => {
    const s = Math.max(-pas(f), Math.min(pas(f), corr * 0.5)) * sens;
    p.x += ux * s + (-uy) * pas(f) * bougerLat * Math.cos(phase);
    p.y += uy * s + ( ux) * pas(f) * bougerLat * Math.sin(phase);
    const r = Math.hypot(p.x, p.y);
    if (r > CAGE_RAYON - 0.35) {                // la grille : on ne la traverse pas
      const k = (CAGE_RAYON - 0.35) / r;
      p.x *= k; p.y *= k;
    }
  };
  /* /!\ RECULER A UNE FIN : LA GRILLE (Mael, 10/08 — "si tu recules, au
     bout d'un moment pas chasser ; quand tu es bloqué à la cage, soit tu
     sors, soit le mec te barre la route"). Un homme colle a la grille ne
     peut plus reculer : sa correction vers l'arriere est ANNULEE. Il ne
     lui reste que la sortie laterale — et elle depend de son footwork
     contre le cage_cutting de l'autre. C'est la que le footwork cesse
     d'etre un chiffre decoratif. */
  /* /!\ CELUI QUI EST ENCORE POSE NE SE REPLACE PAS. C'est ici que le
     cout du geste devient de la distance : l'autre, libre, prend ou rend
     l'espace pendant qu'il recupere ses appuis. */
  const pose1 = (etat.pose && etat.pose[f1.name]) || 0;
  const pose2 = (etat.pose && etat.pose[f2.name]) || 0;
  const colle = (p) => Math.hypot(p.x, p.y) > CAGE_RAYON - 0.55;
  const sortie = (f, o) => 0.28 + (f.striking.footwork - o.striking.cage_cutting) / 260;
  let c1 = corr1, c2 = corr2, lat1 = 0.30, lat2 = 0.30;
  if (colle(g.a) && c1 > 0) { c1 = 0; lat1 = Math.max(0.05, sortie(f1, f2)); etat.acculeGeo = f1.name; }
  if (colle(g.b) && c2 > 0) { c2 = 0; lat2 = Math.max(0.05, sortie(f2, f1)); etat.acculeGeo = f2.name; }
  if (!colle(g.a) && !colle(g.b)) etat.acculeGeo = null;
  /* /!\ POSE = ON NE CHASSE PLUS, MAIS ON PEUT RESSORTIR (corrige apres
     mesure, 10/08). Premiere version : la pose bloquait TOUT
     deplacement — le long, pose apres son kick, ne pouvait plus reculer,
     le boxeur restait colle, et le resultat s'inversait (5-55 pour le
     boxeur, l'inverse du reel). Or le RETRAIT est justement le geste que
     la pose doit permettre : on se pousse sur ses appuis pour sortir. Ce
     qu'on perd en etant pose, c'est la capacite d'ALLER CHERCHER
     l'autre — pas celle de s'en eloigner. */
  const t1 = envieTourner(f1, pose1), t2 = envieTourner(f2, pose2);
  /* Tourner : beaucoup de lateral, peu d'avance. Rester dans l'axe :
     l'inverse. C'est l'arbitrage, et il est fait par homme. */
  /* /!\ ET COUPER LA ROUTE ANNULE LE TOUR (Mael : "des fois les boxeurs
     cassent la distance, envoient, et l'autre sort"). Sans ca, un homme
     mobile tournait indefiniment et le presseur ne pouvait plus rien :
     mesure, le long touchait 4,9 fois plus qu'il n'encaissait. Le
     cage_cutting de l'autre MANGE le pas lateral — c'est exactement ce
     que fait un boxeur de pression qui coupe l'angle au lieu de suivre
     en cercle. */
  /* /!\ COUPER EST UN TALENT, PAS UN ECART A GAGNER (10/08). L'ancienne
     forme exigeait de DEPASSER le footwork de l'autre pour couper quoi
     que ce soit : un presseur a 92 de cage_cutting face a un mobile a 88
     ne coupait que 4 % — autant dire rien. Un bon coupeur coupe, meme
     face a un bon mobile ; c'est justement sa specialite. */
  const coupe = (o, f) => Math.max(0.35, Math.min(1,
    1 - (o.striking.cage_cutting - 50) / 100 + (f.striking.footwork - 50) / 260));
  /* /!\ ON RETIENT QUI A BARRE LA ROUTE (Mael, 10/08 : "plus de damage
     quand il arrive a barrer la route ; un mec peut se faire desaxer
     tout le combat et finir en 1 occasion dans la vraie vie"). Couper
     l'angle n'est pas une privation pour l'autre, c'est UNE OCCASION
     pour soi : on cueille un homme qui sortait, en plein transfert de
     poids, sans appuis pour encaisser. */
  const cp1 = coupe(f2, f1), cp2 = coupe(f1, f2);
  /* /!\ SEUIL ASSOUPLI ET PROGRESSIF (calibre le 10/08 : ma premiere
     version exigeait 22 points de cage_cutting d'ecart — le compteur
     "routes barrees" est reste a ZERO sur 60 combats). Barrer la route,
     c'est etre LA quand l'autre sort : il suffit que l'autre tourne et
     qu'on ne soit pas largue en coupe. La force du coup, elle, suit
     l'ecart reel — un bon coupeur cueille bien plus fort. */
  /* /!\ C'EST UNE OCCASION, PAS UN ETAT (recalibre : a tLui > 0,10 le
     compteur montait a 13 177 barrages — plus que de frappes. Barrer la
     route, ca arrive quand l'autre s'engage VRAIMENT dans sa sortie, et
     seulement si on est la). */
  /* /!\ DEUX CONDITIONS QUI S'ANNULAIENT (corrige le 10/08). J'exigeais
     que l'autre tourne BEAUCOUP *et* que je le domine en coupe — or les
     deux sont anti-correlees : si je coupe bien, il ne tourne pas ; s'il
     tourne, c'est que je coupe mal. Resultat : ZERO barrage dans les
     trois cas testes. On decorrele : il suffit qu'il s'engage dans une
     sortie, et MA CAPACITE A LE CUEILLIR tient d'abord a mon propre
     cage_cutting — l'ecart avec son footwork ne fait que la moduler. */
  /* /!\ ON EST RECOMPENSE QUAND ON A MANGE SA SORTIE — pas quand il est
     deja de travers (cette version-la s'annulait : un bon coupeur
     empeche l'autre de tourner, donc n'avait jamais d'occasion). Il a
     voulu sortir, je l'en ai empeche : c'est LA que je le cueille. */
  /* Echelle calibree : un coupeur moyen (coupe 0,73) obtient 0,44 ; un
     mauvais (coupe 1,00) n'obtient rien. */
  const barreDe = (tLui, cpLui) => tLui > 0.14 && cpLui < 0.95
    ? Math.max(0, Math.min(1, (0.95 - cpLui) / 0.50)) : 0;
  g.barre = [barreDe(t2, cp2), barreDe(t1, cp1)];
  bougerLat = lat1 * (1 + t1 * 2.2 * cp1);
  const c1eff = (pose1 > 0 ? Math.max(0, c1) : c1) * (1 - t1 * 0.8);
  bouger(g.a, -1, f1, c1eff, g.releve.n * 0.7);
  bougerLat = lat2 * (1 + t2 * 2.2 * cp2);
  const c2eff = (pose2 > 0 ? Math.max(0, c2) : c2) * (1 - t2 * 0.8);
  bouger(g.b,  1, f2, c2eff, g.releve.n * 0.7 + Math.PI);
  g.tourne = [t1, t2];
  /* La marque "il vient de frapper" s'efface vite : le retrait dure un
     echange, pas tout le round. */
  if (etat.vientDeFrapper) {
    for (const k of Object.keys(etat.vientDeFrapper))
      etat.vientDeFrapper[k] *= 0.35;
  }
  /* La porte ouverte par un kick se referme vite : c'est un instant, pas
     une position. */
  if (etat.kickSubi) {
    for (const k of Object.keys(etat.kickSubi)) etat.kickSubi[k] *= 0.30;
  }
  /* La pose se resorbe d'un cran par echange. */
  if (etat.pose) {
    for (const k of Object.keys(etat.pose))
      etat.pose[k] = Math.max(0, etat.pose[k] - 1);
  }

  g.d = Math.round(Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y) * 1000) / 1000;

  /* /!\ CHACUN DOIT SE REPLACER FACE A L'AUTRE — et ca prend du temps.
     Celui qui tourne vite reste aligne ; celui qui subit le deplacement
     se retrouve DESAXE, et un homme desaxe ne peut pas frapper. C'est ici
     que le footwork cesse d'etre un chiffre de defense : il donne des
     angles. Un homme pose (il vient de frapper) tourne deux fois moins
     vite — c'est le prix du geste, et c'est ce qui permet a l'autre de
     sortir sur le cote. */
  const capVers = (de, vers) => Math.atan2(vers.y - de.y, vers.x - de.x);
  const norm = (x) => { while (x > Math.PI) x -= 2 * Math.PI;
                        while (x < -Math.PI) x += 2 * Math.PI; return x; };
  /* /!\ CALIBRE PAR LA MESURE (10/08) : a 0,35-0,90 rad par echange,
     personne ne sortait JAMAIS de son axe — la rotation ecrasait la
     derive laterale et l'angle ne servait a rien. Un homme lent tourne
     bien plus lentement qu'il ne se deplace : 0,10 rad (6 degres) pour
     un pataud, 0,45 (26 degres) pour un homme vif. */
  /* /!\ LE FOOTWORK NE PEUT PAS PAYER QUATRE FOIS (mesure du 10/08 : le
     classement des victoires par style suivait EXACTEMENT le bonus de
     footwork de l'archetype — +22 -> 84 % de victoires, -15 -> 22 %).
     Il decidait a la fois de la distance, du pas lateral, de l'entree ET
     de la vitesse de rotation. La rotation revient donc a l'EQUILIBRE et
     au fight IQ : se remettre face a quelqu'un, c'est une question
     d'appuis et de lecture, pas de vitesse de deplacement. */
  const vitesse = (f, pose) => (0.14
      + (f.physical.balance_base || 50) / 100 * 0.20
      + (f.mental.fight_iq || 50) / 100 * 0.12) * (pose > 0 ? 0.5 : 1);
  const tourner = (cap, cible, v) => {
    const e = norm(cible - cap);
    return cap + Math.max(-v, Math.min(v, e));
  };
  /* /!\ LE DECALAGE S'ACCUMULE — c'est tout le mecanisme (corrige apres
     mesure : en tournant PUIS en mesurant le reste, l'ecart retombait a
     zero a chaque echange et valait toujours 0,0 degre). Ce qui compte
     n'est pas le retard d'un instant, c'est le retard QUI S'INSTALLE :
     l'autre continue de tourner autour pendant qu'on se replace. Chaque
     echange, on rattrape ce qu'on peut (sa vitesse de rotation) et on
     garde une part de ce qu'on n'a pas rattrape. */
  const visA = capVers(g.a, g.b), visB = capVers(g.b, g.a);
  const dA = Math.abs(norm(visA - g.capA)), dB = Math.abs(norm(visB - g.capB));
  g.capA = tourner(g.capA, visA, vitesse(f1, pose1));
  g.capB = tourner(g.capB, visB, vitesse(f2, pose2));
  /* /!\ L'ACCUMULATION EST BORNEE ET S'EFFACE VITE (calibre le 10/08 :
     a 0,55 de report, le pataud etait desaxe 4 146 fois contre 34 pour
     le mobile — il ne pouvait plus combattre du tout). Un homme sorti de
     son axe se replace : ce qui reste d'un echange a l'autre est une
     GENE, pas une condamnation. */
  const reste = (besoin, v, ancien) =>
    Math.max(0, Math.min(0.9, (besoin - v) + ancien * 0.30));
  g.ecart = [reste(dA, vitesse(f1, pose1), g.ecart ? g.ecart[0] : 0),
             reste(dB, vitesse(f2, pose2), g.ecart ? g.ecart[1] : 0)];
  const r = g.releve;
  r.n++; r.somme += g.d;
  if (g.d < r.min) r.min = g.d;
  if (g.d > r.max) r.max = g.d;
  if (g.d <= g.portee[0]) r.dansPortee[0]++;
  if (g.d <= g.portee[1]) r.dansPortee[1]++;
  const pres = Math.hypot(g.a.x, g.a.y) > CAGE_RAYON - 0.6
            || Math.hypot(g.b.x, g.b.y) > CAGE_RAYON - 0.6;
  if (pres) r.contreGrille++;
  /* Le releve de combat, qui survit aux rounds. */
  GEO.n++; GEO.somme += g.d;
  if (g.d < GEO.min) GEO.min = g.d;
  if (g.d > GEO.max) GEO.max = g.d;
  if (g.d <= g.portee[0]) GEO.dansPortee[0]++;
  if (g.d <= g.portee[1]) GEO.dansPortee[1]++;
  if (pres) GEO.contreGrille++;
  GEO.allonge = g.allonge; GEO.portee = g.portee;
  return g;
}

const T_FRAPPE_BASE = 2.05;

/* ==== LE TEMPS DE POSE (conception de Mael, 10/08) ======================
   "Il peut pas taper et courir en meme temps tout le combat ; quand il
   tape il se pose sur ses pieds. Ce qui serait bien c'est qu'il soit hors
   distance de frappe et calcule un pas-frappe-retrait, le kickboxeur avec
   une grande allonge, comme ca il s'expose peu aux coups adverses."
   FRAPPER COUTE SA MOBILITE. Tant qu'un homme est pose, il ne se replace
   pas — l'AUTRE, lui, continue. Un coup lourd plante plus longtemps qu'un
   jab ; une jambe plus qu'un poing ; une combinaison de quatre coups
   plante bien plus qu'un coup isole.
   /!\ C'EST CE SEUL MECANISME QUI PRODUIT LE PAS-FRAPPE-RETRAIT : le
   long qui touche et ressort y arrive parce qu'il se pose PEU (un coup,
   vite arme) ; le boxeur qui enchaine se retrouve encore plante quand sa
   combinaison finit — donc a portee. Rien n'est ecrit comme une regle de
   style : ca tombe du cout du geste. */
const POSE = {
  jab: 0.20, cross: 0.35, crochet: 0.45, uppercut: 0.45, overhand: 0.60,
  crochet_corps: 0.45, low_kick: 0.55, calf_kick: 0.55, body_kick: 0.70,
  high_kick: 0.85, teep: 0.30, spinning_back_fist: 0.95,
  spinning_kick: 1.05, wheel_kick: 1.15,
};
/** Ce que ce coup lui coute en immobilite, allege par son equilibre. */
function poseDe(f, arme) {
  const base = POSE[arme] !== undefined ? POSE[arme] : 0.45;
  const assise = 0.75 + (f.physical.balance_base || 50) / 200;   // 0,75 a 1,25
  return base / assise;
}
const T_TAKEDOWN = 9.0;
const T_CLINCH = 11.0;
// /!\ LE TEMPO DU SOL — RELEVE DE 4,5 A 12 LE 09/08.
// A 4,5, un echange au sol durait ~5,7 s en garde : celui du dessous
// obtenait DIX tentatives de relevee par minute. Dans un vrai combat il en
// obtient une ou deux. Le probleme n'etait pas le POURCENTAGE de sortie
// (30 % par tentative se defend), c'etait le NOMBRE DE TIRAGES.
// Mesure : a 30 % par tentative, il tient 34 % du temps sur 3 echanges et
// 3 % sur 10 — un round complet au sol etait MATHEMATIQUEMENT IMPOSSIBLE.
// Ralentir change l'ECHELLE DE TEMPS, pas l'equilibre des forces : le
// rapport entre un bon et un mauvais grappler reste identique, il s'exprime
// enfin.
// /!\ ET ON NE "DENSIFIE" PAS POUR COMPENSER. Une minute de sol avec deux
// ou trois actions parait vide mais C'EST LA REALITE DU SOL — c'est meme
// pour ca que le sol emmerde le public. Le combat au sol DOIT paraitre
// moins agite que le debout : difference de nature, pas defaut de rendu.
const T_SOL_BASE = 9.0;

// ---------------------------------------------------------------- telemetrie
const TELEMETRY = {};
function reset_telemetry() {
  for (const k of Object.keys(TELEMETRY)) delete TELEMETRY[k];
  for (const k of ["t_debout", "t_clinch", "t_sol", "t_total",
                   "n_debout", "n_clinch", "n_sol", "n_relances", "n_rounds",
                   "td_tentes", "td_reussis", "sequences_sol", "td_clinch", "kd_suivis"])
    TELEMETRY[k] = 0.0;
}
const telemetrieActive = () => Object.keys(TELEMETRY).length > 0;

// ------------------------------------------------------------------ Fighter
class Fighter {
  constructor(name, striking, wrestling, ground, clinch, physical, mental,
              { gameplan = null, garde = ORTHODOX, stance_switching = 50,
                division = "poids_leger" } = {}) {
    this.name = name;
    this.division = division;
    this.div = DIVISIONS[division] !== undefined ? DIVISIONS[division] : DIVISIONS.poids_leger;
    this.striking = striking;
    this.wrestling = wrestling;
    this.ground = ground;
    this.clinch = clinch;
    this.physical = physical;
    this.mental = mental;
    this.gameplan = gameplan || { striking: 0.5, wrestling: 0.3, clinch: 0.2 };
    this.depenses = {};

    this.stance = new StanceState(garde, stance_switching);
    this.legs = new LegDamage();
    this.body = new BodyState(physical.body_conditioning, striking.blocage);
    this.chaos = 0.0;
    this._niv = null;
    this.td_echecs = 0;
    this.percu = null;
    this.head_damage = 0;
    this.cardio = 100.0;
    this.sonne = 0;
    this.knockdowns = 0;
    this.reset_round_stats();
  }

  reset_round_stats() {
    this.rs = {
      sig_landed: 0, sig_attempted: 0,
      damage: 0.0, score_frappes: 0.0,
      td_landed: 0, td_attempted: 0,
      control: 0, sub_attempts: 0,
      clinch_control: 0, knockdowns: 0,
    };
  }

  cardio_ratio() { return Math.max(0.0, this.cardio / 100); }

  depenser(cout, poste = "autre") {
    const reel = cout * ECHELLE_DEPENSE * this.body.drain_cardio();
    this.depenses[poste] = (this.depenses[poste] !== undefined ? this.depenses[poste] : 0.0) + reel;
    this.cardio = Math.max(0.0, this.cardio - reel);
  }

  recuperer_entre_rounds() {
    const energie = 4 + this.physical.cardio * 0.10;
    const physique = 2 + this.physical.chin * 0.06;
    let etat = (1 - this.body.chute_de_garde() * 0.5);
    if (this.sonne > 0) etat *= 0.6;
    this.cardio = Math.min(100.0, this.cardio + (energie + physique) * etat);
  }

  fatigue_factor() { return 0.55 + 0.45 * this.cardio_ratio(); }

  stabilite() { return stabilite(this.stance, this.legs, this.physical.balance_base); }

  puissance() {
    return facteur_puissance(this.stance, this.legs, this.physical.balance_base) * this.fatigue_factor();
  }

  esquive() {
    return (facteur_esquive(this.stance, this.legs, this.physical.balance_base)
            * this.fatigue_factor() * this.malus_sonne()
            * (1 - this.chaos * 0.55 * this.sensibilite_chaos()));
  }

  precision() {
    return (facteur_precision(this.stance) * this.fatigue_factor()
            * this.malus_sonne()
            * (1 - this.chaos * 0.38 * this.sensibilite_chaos()));
  }

  lire_adversaire(dfn, stat, defaut = 50) {
    const reel = dfn.wrestling[stat] !== undefined ? dfn.wrestling[stat] : defaut;
    if (this.percu === null) return reel;
    return this.percu[stat] !== undefined ? this.percu[stat] : reel;
  }

  decouvrir(dfn) {
    if (this.percu === null) return;
    const part = 0.25 + this.mental.fight_iq / 145;
    for (const k of Object.keys(this.percu)) {
      const v = this.percu[k];
      const reel = dfn.wrestling[k] !== undefined ? dfn.wrestling[k] : v;
      this.percu[k] = v + (reel - v) * Math.min(1.0, part);
    }
  }

  garde_anti_lutte(dfn) {
    const menace = (dfn.wrestling.shot / 100.0
                    * dfn.cardio_ratio()
                    * (dfn.gameplan.wrestling !== undefined ? dfn.gameplan.wrestling : 0.3) / 0.55);
    return 1.0 - Math.min(0.20, Math.max(0.0, menace) * 0.16);
  }

  prudence_sol(dfn) {
    const danger = (dfn.ground.submission_off_bottom * 0.6
                    + dfn.ground.sweeps * 0.4 - 55) / 100.0;
    const lucidite = this.mental.fight_iq / 100.0;
    return 1.0 - Math.min(0.55, Math.max(0.0, danger) * lucidite * 1.5);
  }

  retenue_lutte() {
    const lucidite = 0.03 + this.mental.fight_iq / 900;
    const mental = 1.0 / (1.0 + this.td_echecs * lucidite);
    const physique = 0.62 + 0.38 * this.cardio_ratio();
    return mental * physique;
  }

  niveau_moyen() {
    if (this._niv === null) {
      const s = this.striking, g = this.ground, w = this.wrestling;
      // /!\ CETTE VALEUR EST UN PARAMETRE DU MOTEUR, PAS UN AFFICHAGE.
      // Elle sert de REFERENCE a specialite() : un shot a 95 chez un homme
      // qui a 70 partout est une arme ; le meme shot chez un homme qui a 92
      // partout n'est qu'une stat de plus. C'est l'ECART a cette moyenne qui
      // fait le specialiste, et il entre dans la chance de takedown (l.551).
      // ELLE NE DOIT DONC PAS BOUGER POUR DES RAISONS D'INTERFACE.
      // Ce qu'on montre au joueur vit dans note_generale(), juste en
      // dessous, et peut evoluer librement sans jamais toucher au gel.
      this._niv = (s.jab + s.cross + s.low_kick + s.esquive_tete
                   + s.footwork + w.shot + w.sprawl + g.passing
                   + g.submission_def + this.physical.cardio) / 10.0;
    }
    return this._niv;
  }

  /**
   * LA NOTE MONTREE AU JOUEUR. Douze stats : les dix du combat, plus le
   * fight IQ et le menton — un homme qui lit le combat et qui encaisse vaut
   * mieux qu'un homme qui frappe aussi fort et qui s'ecroule.
   *
   * /!\ ELLE N'ENTRE DANS AUCUN CALCUL DU MOTEUR. C'est tout l'interet de
   * l'avoir separee de niveau_moyen() : on peut y ajouter ou retirer ce
   * qu'on veut, l'affichage change et pas un seul combat ne bouge.
   * Histoire : le 09/08 on avait ajoute fight_iq et le menton DANS
   * niveau_moyen(). Ca marchait, mais ca a deplace les soumissions de +1,3
   * point et impose une reouverture du gel — pour un resultat qu'on
   * pouvait obtenir sans toucher au moteur. Remarque de Mael : "c'est que
   * de l'interface, ils se battent avec les notes de l'interieur". Exact.
   *
   * /!\ ET UNE NOTE HAUTE NE VEUT PAS DIRE QU'ON DOMINE : c'est une
   * moyenne. Mesure du 09/08, a note egale (88 contre 88), le frappeur
   * Vanel bat le lutteur Aslanov 64 % du temps. La note resume, elle ne
   * juge pas.
   */
  note_generale() {
    const s = this.striking, g = this.ground, w = this.wrestling;
    return (s.jab + s.cross + s.low_kick + s.esquive_tete
            + s.footwork + w.shot + w.sprawl + g.passing
            + g.submission_def + this.physical.cardio
            + this.mental.fight_iq + this.physical.chin) / 12.0;
  }

  specialite(valeur) {
    if (valeur < 88) return 0.0;
    const excellence = Math.min(1.0, (valeur - 88) / 11.0);
    const ecart = Math.min(1.0, Math.max(0.0, (valeur - this.niveau_moyen()) / 26.0));
    return excellence * ecart;
  }

  sensibilite_chaos() {
    const technique = (this.striking.esquive_tete + this.striking.footwork
                       + this.striking.timing) / 3;
    return Math.max(0.20, Math.min(1.9, Math.pow(technique / 58, 2)));
  }

  subir_chaos(agresseur) {
    const pousse = (agresseur.mental.aggression * 0.55
                    + agresseur.striking.power * 0.45) / 100;
    const gardeLaTete = (this.striking.footwork * 0.5
                         + this.mental.fight_iq * 0.5) / 100;
    const delta = (pousse - gardeLaTete) * 0.16;
    this.chaos = Math.max(0.0, Math.min(0.55, this.chaos + delta));
  }

  retrouver_calme() { this.chaos = Math.max(0.0, this.chaos - 0.05); }

  resultat_impact_tete(impact, ko_power_adverse = 50) {
    const chin = this.physical.chin;
    const resist = this.div.resist_mod !== undefined ? this.div.resist_mod : 1.0;
    const usure = this.div.usure_mod !== undefined ? this.div.usure_mod : 1.0;

    let concussif = 0.0;
    if (impact > 0) {
      const seuil_nu = 2.2 + chin / 26;
      const seuil = seuil_nu * resist;
      if (impact > seuil) concussif = (impact - seuil) / 420;
      concussif *= (0.55 + ko_power_adverse / 115);
      concussif *= (1 + (1 - this.cardio_ratio()) * 0.7);
      concussif *= (1 + Math.min(1.3, this.head_damage / (55 * resist)));
      if (this.sonne > 0) concussif *= 2.4;
    }

    const seuil_ac = (26 + chin / 2.2) * resist / usure;
    let accum = 0.0;
    if (this.head_damage > seuil_ac)
      accum = Math.min(0.24, (this.head_damage - seuil_ac) * usure / (340 * resist));

    const total = Math.min(0.72, (concussif + accum) * CALIBRAGE_COMMOTION);
    if (alea.random() >= total) return null;

    const par_accumulation = alea.random() < accum / Math.max(1e-9, concussif + accum);
    if (par_accumulation) {
      const usure_tete = Math.min(1.0, this.head_damage / (52 * resist));
      if (alea.random() < (0.03 + usure_tete * 0.15) * CALIBRAGE_KO_SEC) return "ko";
      return "knockdown";
    }

    const seuil_nu2 = 2.2 + this.physical.chin / 26;
    const violence = Math.max(0.0, (impact - seuil_nu2) / (seuil_nu2 * 3.2));
    const proba_ko_sec = (Math.min(0.30, violence * 0.12)
                          + (this.sonne > 0 ? 0.18 : 0)) * CALIBRAGE_KO_SEC;
    return alea.random() < proba_ko_sec ? "ko" : "knockdown";
  }

  encaisser_knockdown() {
    this.sonne = 3;
    this.coups_sonne = 0;
    this.knockdowns += 1;
    this.rs_knockdowns_subis = (this.rs_knockdowns_subis ?? 0) + 1;
    this.cardio = Math.max(0.0, this.cardio - 12);
  }

  recuperer_sonne() {
    if (this.sonne > 0) {
      this.sonne -= 1;
      if (this.sonne === 0 && this.physical.recovery > 65)
        this.head_damage = Math.max(0, this.head_damage - 4);
    }
  }

  malus_sonne() {
    return this.sonne === 0 ? 1.0 : 0.45 + 0.15 * (3 - this.sonne);
  }
}

// -------------------------------------------------------- frappe debout
function resolve_strike_debout(atk, dfn, arme, acculeDefenseur, log, bonus_setup = 0.0, etat = null) {
  const info = ARMES_V2[arme];
  atk.rs.sig_attempted += 1;
  atk.depenser(info.cout, "striking");

  const [res, dmgBrut, zone, contre, conc] = resolve_frappe(
    atk, dfn, arme, acculeDefenseur,
    atk.puissance() * atk.garde_anti_lutte(dfn),
    dfn.esquive(),
    bonus_setup,
  );
  let dmg = dmgBrut;
  /* /!\ CUEILLI EN PLEINE SORTIE : le coup porte plus fort (Mael). Un
     homme qui tourne n'a ni appuis ni garde a l'instant ou il est
     rattrape — c'est ce qui permet a un presseur de perdre tout le
     combat aux points et de le finir sur UNE occasion. */
  if (etat && etat.coupeReussie) dmg *= etat.coupeReussie;

  if (res === "checké") {
    atk.legs.add(atk.stance.jambe_arriere(), Math.trunc(dmg));
    log.push(`    ${dfn.name} check le ${arme} — ${atk.name} encaisse ${Math.trunc(dmg)}`);
    return [false, 0, contre];
  }

  if (res !== "touché") {
    log.push(`    ${atk.name} ${arme} → manqué`);
    return [false, 0, contre];
  }

  dmg = dmg * atk.div.dmg_mod;
  atk.rs.sig_landed += 1;
  atk.rs.damage += dmg;
  atk.rs.score_frappes += 1.0;

  /* /!\ L'ARRET MEDICAL (arbitrage Mael, 10/08 : "noté TKO 1"). Une
     coupure qui s'ouvre sur un coude ou un coup lourd au visage : le
     medecin regarde, et parfois il arrete. Ce n'est PAS une categorie a
     part — c'est un TKO, comme Mael l'a demande. Rare, et lie a ce qui
     ouvre vraiment : les coudes, les overhands, un visage deja marque. */
  if (res === "touché" && zone === "tete" && dfn.head_damage > 30) {
    const tranchant = arme === "elbow" || arme === "overhand" || arme === "uppercut";
    /* /!\ CALIBRE PAR LA MESURE (10/08) : mes premieres valeurs donnaient
       57 % DES COMBATS arretes sur coupure, contre 1 a 2 % dans le reel.
       Cause : le tirage se fait A CHAQUE COUP TOUCHE A LA TETE — deux
       cents fois par combat. Une probabilite "faible" par coup devient
       une certitude sur la duree. Divisee par cinquante. */
    const p = (tranchant ? 0.00020 : 0.00005) * (1 + dfn.head_damage / 160)
            * (1 - (dfn.physical.recovery || 50) / 260);
    if (alea.random() < p) {
      /* /!\ LA LIGNE DOIT NOMMER LE BLESSE (corrige par le banc verdict :
         "traducteur TKO/A / verdict ARRET,B"). verdict.js identifie le
         perdant par le NOM ecrit dans la ligne ; une ligne anonyme lui
         faisait lire un autre evenement. Toutes les fins du moteur
         suivent la meme grammaire — la nouvelle aussi. */
      log.push(`    *** TKO ! ${dfn.name} coupe, le medecin arrete le combat ***`);
      return ["KO", dmg, false];
    }
  }

  if (dfn.sonne > 0 && zone === "tete") {
    dfn.coups_sonne = (dfn.coups_sonne ?? 0) + 1;
    const seuil_arbitre = dfn.head_damage > 40 * (dfn.div.resist_mod !== undefined ? dfn.div.resist_mod : 1.0) ? 2 : 3;
    if (dfn.coups_sonne >= seuil_arbitre && alea.random() < CALIBRAGE_ARBITRE) {
      log.push(`    *** TKO ! ${dfn.name} ne repond plus, l'arbitre arrete ***`);
      return ["KO", dmg, false];
    }
  }

  if (zone === "jambe") {
    const cote = alea.random() < 0.8 ? dfn.stance.jambe_avant() : dfn.stance.jambe_arriere();
    dfn.legs.add(cote, Math.trunc(dmg));
    log.push(`    ${atk.name} ${arme} → touché (${fmt0(dmg)}) jambe ${cote}`);
  } else if (zone === "corps") {
    const zp = alea.random() < 0.32 ? "foie" : "corps";
    const reel = dfn.body.encaisser(dmg, zp);
    dfn.depenser(dfn.body.cout_immediat_cardio(reel), "encaisse_corps");
    log.push(`    ${atk.name} ${arme} → touché (${fmt0(reel)}) ${zp}`);
    if (zp === "foie" && alea.random() < dfn.body.risque_ko_foie() * CALIBRAGE_FOIE) {
      log.push(`    *** TKO AU CORPS ! ${dfn.name} s effondre sur un coup au foie ***`);
      return ["KO", dmg, false];
    }
  } else {
    dfn.head_damage += dmg;
    log.push(`    ${atk.name} ${arme} → touché (${fmt0(dmg)}) tête`);
    const issue = dfn.resultat_impact_tete(dmg * conc, atk.striking.ko_power);
    if (issue === "ko") {
      log.push(`    *** KO SEC ! ${dfn.name} est eteint par ${atk.name} ***`);
      return ["KO", dmg, false];
    }
    if (issue === "knockdown") {
      if (dfn.sonne > 0) {
        log.push(`    *** TKO ! ${dfn.name} retombe, l'arbitre arrete ***`);
        return ["KO", dmg, false];
      }
      dfn.encaisser_knockdown();
      atk.rs.knockdowns += 1;
      log.push(`    >>> KNOCKDOWN ! ${dfn.name} touche le sol`);
      const suit = (atk.gameplan.wrestling !== undefined ? atk.gameplan.wrestling : 0.2) > 0.15 ? 0.75 : 0.55;
      if (etat !== null && alea.random() < suit) {
        etat.phase = SOL;
        etat.position = alea.random() < 0.45 ? "mount" : "side_control";
        etat.top = atk.name;
        log.push(`    >>> ${atk.name} le suit au sol en ${etat.position} et enchaine`);
      } else {
        log.push(`    >>> ${atk.name} le laisse se relever et reste debout`);
      }
    }
  }

  return [true, dmg, contre];
}

// ------------------------------------------------------------ phase debout
/* La distance de travail d'un homme, hors contexte de deplacement — le
   meme calcul que dans avancerGeometrie, expose pour l'entree. */
function ideale2(f) {
  const corps = (f.gameplan.wrestling || 0) + (f.gameplan.clinch || 0);
  if (corps > 0.45) return 0.35;
  return distanceDeTravail(f, corps);
}

function phase_debout(f1, f2, etat, log) {
  let bonusAngle = 0;
  /* /!\ ETAPE 1 : on avance la geometrie et on la MESURE. Elle ne decide
     encore rien — pas un tirage deplace, pas une ligne de log changee. */
  avancerGeometrie(etat, f1, f2);
  // bataille de placement
  if (etat.cage === CENTRE) {
    /* /!\ LE ROLE DE PRESSEUR RESPIRE (Mael, 16/08, option B — mesure :
       clones stricts 36/64, +20 de cage_cutting chez le slot deja
       presseur : +0 point, chez l'autre : +30). L'ancienne forme (`>`
       strict) donnait le role au meilleur cage_cutting POUR TOUT LE
       COMBAT — a egalite, toujours f2, et un seul point d'ecart faisait
       un presseur permanent. Desormais CHAQUE bataille de placement tire
       son presseur : 50/50 a egalite, ~65 % a +10, ~80 % a +20, borne a
       90 — un bon coupeur presse SOUVENT, pas TOUJOURS, et les
       renversements de pression existent, comme en vrai. */
    const pPresse1 = Math.max(0.10, Math.min(0.90,
      0.5 + (f1.striking.cage_cutting - f2.striking.cage_cutting) * 0.015));
    const [p, e] = alea.random() < pPresse1 ? [f1, f2] : [f2, f1];
    const fw_e = e.striking.footwork * e.esquive();
    const chance = 30 + (p.striking.cage_cutting - fw_e) * 1.35;
    if (alea.uniform(0, 100) < Math.max(5, Math.min(88, chance))) {
      etat.cage = CAGE;
      etat.accule = e.name;
      log.push(`    [cage] ${p.name} accule ${e.name} contre la grille`);
    }
  } else {
    const acc = f1.name === etat.accule ? f1 : f2;
    const pre = f1.name === etat.accule ? f2 : f1;
    const fw = acc.striking.footwork * acc.esquive();
    if (alea.uniform(0, 100) < Math.max(5, Math.min(90, 48 + (fw - pre.striking.cage_cutting) * 1.35))) {
      etat.cage = CENTRE;
      etat.accule = null;
      acc.retrouver_calme();
      log.push(`    [cage] ${acc.name} se dégage vers le centre`);
    }
  }

  // qui initie
  const poids1 = (f1.mental.aggression * 0.45 + f1.striking.volume * 0.55) * f1.fatigue_factor();
  const poids2 = (f2.mental.aggression * 0.45 + f2.striking.volume * 0.55) * f2.fatigue_factor();
  const [atk, dfn] = alea.random() < poids1 / (poids1 + poids2) ? [f1, f2] : [f2, f1];

  const acculeDfn = etat.accule === dfn.name;

  // le brawler emmene l'autre dans son monde
  if (etat.cage === CAGE || acculeDfn) {
    dfn.subir_chaos(atk);
    atk.subir_chaos(dfn);
  } else {
    atk.retrouver_calme();
    dfn.retrouver_calme();
  }

  // lutte plutot que frappe ?
  const TAUX = 0.12 / Math.max(0.5, etat.cadence !== undefined ? etat.cadence : 1.0);
  let guet = 1.0;
  if (etat.accule === atk.name)
    guet = 1.0 + Math.max(0.0, (dfn.striking.cage_cutting - 45)) / 55;
  /* /!\ ET ON TENTE QUAND C'EST LE MOMENT : un lutteur ne tire pas une
     jambe depuis trois metres. Sa volonte d'y aller suit la distance —
     forte quand il est dessus, faible quand il est loin. Sans ca, le
     bonus de proximite ci-dessus ne servait a rien : les tentatives
     partaient au hasard, donc surtout de loin. */
  let apropos = 1.0;
  if (etat.geo) {
    const proche = porteeDe(atk) * 0.6;
    apropos = etat.geo.d <= proche ? 1.9 : Math.max(0.25, 1.9 - (etat.geo.d - proche) * 1.9);
  }
  if (alea.random() < ((atk.gameplan.wrestling !== undefined ? atk.gameplan.wrestling : 0.3) * TAUX
                       * apropos * atk.retenue_lutte() * guet * atk.prudence_sol(dfn)))
    return tenter_takedown(atk, dfn, etat, log);

  if (alea.random() < (atk.gameplan.clinch !== undefined ? atk.gameplan.clinch : 0.2) * TAUX * 1.05) {
    etat.phase = CLINCH;
    log.push(`    ${atk.name} ferme la distance et engage le clinch`);
    return null;
  }

  /* ==== CHANTIER D, ETAPE 2 : LA DISTANCE DECIDE ========================
     /!\ C'EST ICI QUE LE CALIBRAGE GELE TOMBE, et c'etait assume.
     Avant, un homme frappait toujours : la distance n'existait pas. Un
     coup ne part maintenant que si l'adversaire est A PORTEE. Sinon il
     faut FRANCHIR l'espace — et franchir expose : on entre dans la
     portee de l'autre avant d'etre dans la sienne. C'est ce qui fait
     qu'un long tient un court a bout de bras, sans qu'aucune regle ne le
     dise. */
  if (etat.geo) {
    const iAtk = atk === f1 ? 0 : 1;
    /* /!\ UN HOMME DESAXE NE FRAPPE PAS. Au-dela de ~35 degres, il n'a
       pas ses appuis face a la cible : il se replace, et ce temps-la
       appartient a l'autre. C'est ce qui donne enfin un sens au fait de
       tourner autour — et ce qui fait payer celui qui se laisse sortir
       de son axe. */
    const ecA = etat.geo.ecart[iAtk], ecD = etat.geo.ecart[1 - iAtk];
    if (ecA > 0.50) {
      atk.depenser(0.2, "deplacement");
      log.push(`    ${atk.name} est sorti de son axe, il se replace`);
      return null;
    }
    /* L'autre, lui, est desaxe : on frappe un homme qui n'est pas face. */
    if (ecD > 0.40) bonusAngle = 12 + Math.min(18, (ecD - 0.40) * 26);
    /* /!\ ET LE COUP PORTE PLUS FORT. Le bonus de TOUCHE ne suffisait
       pas : on cueillait plus souvent, mais aussi mollement qu'ailleurs —
       alors qu'un homme pris en pleine sortie n'a ni appuis ni garde.
       C'est ce qui permet a un presseur de perdre tout le combat aux
       points et de le finir sur UNE occasion. */
    /* /!\ ET SEULEMENT QUAND IL EST VRAIMENT HORS DE POSITION : sans
       cette condition, le barrage devenait un bonus permanent (jusqu'a
       300 par combat) au lieu d'une occasion. On le cueille au moment ou
       il est de travers, pas parce qu'il aime tourner. */
    /* /!\ UNE OCCASION, PAS UNE PRIME PERMANENTE (Mael : "un mec peut se
       faire desaxer tout le combat et finir en 1 occasion"). Applique a
       CHAQUE coup, le bonus faisait exploser les degats du jeu entier
       (KO 19,5 % contre 9 attendus). Il se TIRE : rare et lourd. Un
       coupeur d'elite l'obtient environ un echange sur cinq, et quand il
       tombe, il tombe fort. */
    const force = etat.geo.barre ? etat.geo.barre[iAtk] : 0;
    if (force > 0.28 && alea.random() < force * 0.28) {
      etat.coupeReussie = 1.5 + force * 0.9;         // jusqu'a x2,4
      log.push(`    ${atk.name} lui barre la route`);
    } else etat.coupeReussie = 0;
    /* /!\ "TROP LOIN" SE MESURE A SA PLUS LONGUE ARME, PAS A SON BRAS
       (corrige le 10/08 : les jambes restaient a 1 %). Avec porteeDe —
       une portee de BRAS — tout homme arrive a distance de kick etait
       declare "trop loin" et RAMENE a portee de poing avant d'avoir pu
       lancer quoi que ce soit. La jambe est plus longue que le bras :
       c'est elle qui dit a partir de quand on ne peut plus rien faire. */
    const pAtk = maxBande(atk), pDfn = maxBande(dfn);
    if (etat.geo.d > pAtk) {
      const manque = etat.geo.d - pAtk;
      /* Trop loin pour rien tenter : il coupe l'espace, ca coute, et
         l'autre le voit venir. */
      /* /!\ ON N'ENTRE PAS QU'AVEC SES PIEDS (mesure du 10/08 : le
         brawler tombait a 18 % de victoires — sans allonge, sans
         footwork et sans lutte, il ne franchissait jamais l'espace).
         Un brawler entre EN ENCAISSANT : il avance dans le feu parce
         qu'il s'en moque et qu'il a le menton pour. L'agressivite et le
         menton comptent donc autant que la technique de deplacement.
         C'est exactement ce qu'on voit dans une cage. */
      const culot = (atk.mental.aggression - 50) * 0.28
                  + (atk.physical.chin - 50) * 0.22;
      /* /!\ FRANCHIR ETAIT TROP CHER POUR TOUT LE MONDE — donc gratuit
         pour celui qui n'a pas a le faire. Base relevee de 22 a 36 et
         penalite de distance adoucie (40 -> 28) : on entre plus souvent,
         et c'est le COUT de l'entree (l'exposition) qui doit trancher,
         pas l'impossibilite d'entrer. */
      /* /!\ ON N'ENTRE PAS TOUS PAREIL : un fuyard ne franchit presque
         jamais (0,35), un echangeur fonce (1,7). C'est ce qui fait qu'un
         Adesanya reste dehors et qu'un Saint Denis vient te chercher. */
      const Tatk = TEMPERAMENTS[temperamentVif(atk, dfn)];
      /* Et s'il vient de manger un kick, il ne demande pas la permission :
         l'ouverture est la, il la prend. */
      const ouvert = (etat.kickSubi && etat.kickSubi[atk.name]) || 0;
      const entree = (36 + ouvert * 30 + atk.striking.footwork * 0.45 - manque * 28
                   + (atk.striking.cage_cutting - dfn.striking.footwork) * 0.25
                   + culot) * (0.55 + Tatk.entrer * 0.45);
      atk.depenser(0.35, "deplacement");
      if (alea.uniform(0, 100) >= Math.max(4, Math.min(92, entree))) {
        log.push(`    ${atk.name} cherche l'ouverture, ${dfn.name} garde la distance`);
        return null;
      }
      /* Il est entre — mais il s'est expose : si l'autre l'avait a sa
         portee pendant qu'il franchissait, il paie. */
      /* Il est entre — et il entre JUSQUE CHEZ LUI : la ou son meilleur
         coup travaille, pas au bout de son bras. */
      etat.geo.d = Math.max(0.30, Math.min(pAtk * 0.92, ideale2(atk)));
      if (etat.geo.d <= pDfn && alea.uniform(0, 100) < 17 + (dfn.striking.timing - atk.striking.timing) * 0.4) {
        const [r0, d0] = resolve_strike_debout(dfn, atk, "cross", false, log, 10, etat);
        /* /!\ UN CONTRE PEUT FINIR LE COMBAT — ET IL FAUT LE DIRE AU
           MOTEUR (trouve par le banc verdict : "affiche 3, moteur 0").
           Premiere version : je jetais le resultat et je rendais null.
           resolve_strike_debout avait deja ECRIT la ligne de TKO dans le
           log, mais le combat CONTINUAIT — le log annoncait une fin qui
           n'arrivait pas, et les compteurs affiches ne correspondaient
           plus a rien. Un contre se propage comme n'importe quelle
           frappe : c'est LE DEFENSEUR qui gagne. */
        if (r0 === "KO") return dfn;
        if (d0) {
          log.push(`    ${dfn.name} le cueille sur l'entrée`);
          return null;
        }
      }
    }
  }

  // choix d'arme et combinaison
  if (etat.geo) { etat.poseSec = etat.poseSec || {}; etat.poseSec[atk.name] = 0; }
  const dernier = (etat.dernier_coup !== undefined ? etat.dernier_coup : {})[atk.name];
  let arme = choisir_arme_v2(atk, dfn, acculeDfn,
                             dfn.body.chute_de_garde(),
                             dernier !== undefined ? dernier : null,
                             atk.gameplan.cible !== undefined ? atk.gameplan.cible : null);
  /* /!\ L'ARME DOIT TENIR DANS LA DISTANCE (Mael, 10/08). Le choix se
     fait toujours sur le talent et le gameplan ; mais si l'arme choisie
     ne rentre pas dans sa fenetre a cette distance-la, il en prend une
     qui rentre — la meilleure qu'il ait. Aucun tirage supplementaire :
     on choisit au talent, pas au hasard. Et si RIEN ne rentre parce
     qu'on est trop pres, ce n'est plus du combat debout : c'est le corps
     a corps, et on y va. */
  if (etat.geo) {
    const [mn, mx] = bandeArme(atk, arme);
    if (etat.geo.d < mn || etat.geo.d > mx) {
      const dispo = armesA(atk, etat.geo.d);
      if (!dispo.length) {
        etat.phase = CLINCH;
        log.push(`    ${atk.name} n'a plus d'espace pour frapper — ça se colle`);
        return null;
      }
      /* /!\ NE PAS PRENDRE TOUJOURS LA MEILLEURE (Mael, 10/08 : "c'est
         toujours le meme schema et le meme rythme"). MESURE qui l'a
         confirme : crochet au corps 28 % de tous les coups, et les cinq
         enchainements les plus frequents etaient LE MEME COUP REPETE
         (crochet_corps -> crochet_corps, 5 526 fois). Un repli
         DETERMINISTE sur "la meilleure arme disponible" rend le combat
         mecanique : a une distance donnee, c'est toujours le meme coup.
         On tire donc dans les armes disponibles, pondere par le talent —
         et on PENALISE la repetition immediate : un homme qui vient de
         lancer un crochet ne relance pas un crochet, il enchaine. */
      arme = tirerArmeDispo(atk, dfn, dispo, arme,
        atk.gameplan.cible !== undefined ? atk.gameplan.cible : null);
    }
  }
  let bonus = ((dernier === "jab" && ["cross", "overhand", "low_kick"].includes(arme)) ? 14 : 0)
            + bonusAngle;

  const n_coups = taille_combinaison(atk);
  let res = null, dmg = 0, contre = false;
  for (let k = 0; k < n_coups; k++) {
    if (k > 0) {
      arme = choisir_arme_v2(atk, dfn, acculeDfn,
                             dfn.body.chute_de_garde(),
                             arme,
                             atk.gameplan.cible !== undefined ? atk.gameplan.cible : null);
      /* Meme filtre dans l'enchainement : une combinaison ne sort pas de
         la fenetre au deuxieme coup. */
      if (etat.geo) {
        const [mn2, mx2] = bandeArme(atk, arme);
        if (etat.geo.d < mn2 || etat.geo.d > mx2) {
          const d2 = armesA(atk, etat.geo.d);
          if (!d2.length) break;
          arme = tirerArmeDispo(atk, dfn, d2, arme,
            atk.gameplan.cible !== undefined ? atk.gameplan.cible : null);
        }
      }
      bonus = 10 + atk.striking.enchainements / 12;
    }
    /* Chaque coup lance pose son auteur — la combinaison s'additionne. */
    if (etat.geo) {
      etat.pose = etat.pose || {};
      etat.poseSec = etat.poseSec || {};
      etat.poseSec[atk.name] = (etat.poseSec[atk.name] || 0) + poseDe(atk, arme);
    }
    /* /!\ UN COUP DE PIED EST UNE PORTE OUVERTE (idee de Mael, 10/08 :
       "quand il prend un kick, il en profite pour rentrer au poing ?").
       C'est ce qui manquait au probleme des jambes : au lieu d'imposer
       une alternance artificielle, C'EST L'ADVERSAIRE QUI CREE
       L'OUVERTURE. Un kick, c'est un appui en l'air et une hanche
       engagee — on rentre dessus. Plus la jambe part haut, plus la porte
       est grande. */
    if (etat.geo && ARMES_V2[arme]) {
      const info0 = ARMES_V2[arme];
      const estJambe = ["low_kick", "body_kick", "high_kick", "teep", "spinning"]
        .includes(info0.skill);
      if (estJambe) {
        etat.kickSubi = etat.kickSubi || {};
        etat.kickSubi[dfn.name] = info0.zone === "tete" ? 1.0
          : info0.zone === "corps" ? 0.75 : 0.5;
      }
    }
    [res, dmg, contre] = resolve_strike_debout(atk, dfn, arme, acculeDfn, log, bonus, etat);
    if (res === "KO") return atk;
    if (res !== true) break;
  }

  if (etat.dernier_coup === undefined) etat.dernier_coup = {};
  etat.dernier_coup[atk.name] = res === true ? arme : null;

  // contre sur coup telegraphie rate
  if (contre) {
    const d = alea.randint(7, 15) * (0.7 + dfn.striking.power / 150) * dfn.div.dmg_mod;
    atk.head_damage += d;
    dfn.rs.sig_landed += 1;
    dfn.rs.damage += d;
    log.push(`    !!! ${dfn.name} CONTRE le ${arme} de ${atk.name} (${fmt0(d)})`);
    if (atk.resultat_impact_tete(d * 1.35, dfn.striking.ko_power) === "ko") {
      log.push(`    *** ${atk.name} tombe sur le contre ! ***`);
      return dfn;
    }
  }
  /* /!\ ON SE POSE APRES AVOIR FRAPPE. Le total de la combinaison se
     convertit en ECHANGES d'immobilite : un jab seul ne coute presque
     rien, une combinaison de quatre coups lourds cloue son auteur pour
     un ou deux echanges — pendant lesquels l'autre choisit la distance.
     C'est la que le pas-frappe-retrait devient possible : celui qui
     touche une fois et repart se pose peu ; celui qui vide sa boite
     reste plante. */
  if (etat.geo && etat.poseSec && etat.poseSec[atk.name]) {
    etat.pose = etat.pose || {};
    const sec = etat.poseSec[atk.name];
    /* /!\ SEUILS RELEVES APRES MESURE (10/08). Premiere version : un
       coup de 0,8 s gelait un echange entier (~2 s). Les jambes, qui
       posent le plus, condamnaient le kickboxeur — le boxeur gagnait
       53-7 et touchait deux fois plus, l'exact inverse du reel. Un
       echange ne se perd qu'a partir d'une VRAIE combinaison : c'est
       vider sa boite qui cloue, pas toucher une fois. */
    etat.pose[atk.name] = Math.max(etat.pose[atk.name] || 0,
      sec >= 2.4 ? 2 : sec >= 1.4 ? 1 : 0);
    /* /!\ LE PAS-FRAPPE-RETRAIT (Mael, 10/08 : "s'il arrivait a faire le
       pas-frappe ce serait encore mieux — soit il kick, soit il explose
       style karateka et ressort"). `sortirApres` existait dans les
       temperaments DEPUIS LE DEBUT ET N'ETAIT BRANCHE NULLE PART : il ne
       faisait rien. Sans lui, deux fuyards se posaient a 1,46 m et se
       canardaient aux jambes SANS BOUGER — 85 % de jambes, ce qui n'a
       aucun sens. On retient donc qu'il vient de frapper, ET combien le
       geste l'a engage : une jambe engage bien plus qu'un jab, donc elle
       impose de ressortir plus loin. */
    etat.vientDeFrapper = etat.vientDeFrapper || {};
    etat.vientDeFrapper[atk.name] = Math.min(1, sec / 1.6);
    etat.poseSec[atk.name] = 0;
  }
  return null;
}

// ----------------------------------------------------------------- takedowns
const TAKEDOWNS = {
  double_leg: { skill: "shot", def: "sprawl",  pos: "closed_guard", cout: 5, contre: 0.15 },
  single_leg: { skill: "shot", def: "whizzer", pos: "half_guard",   cout: 5, contre: 0.10 },
  body_lock:  { skill: "clinch_wrestling", def: "balance", pos: "half_guard", cout: 4, contre: 0.05 },
  trip:       { skill: "clinch_wrestling", def: "balance", pos: "half_guard", cout: 3, contre: 0.05 },
  throw:      { skill: "throws", def: "grip_fighting", pos: "side_control", cout: 6, contre: 0.20 },
  // /!\ LES DEUX PORTES VERS LE DOS, AJOUTEES LE 09/08.
  // Avant : les cinq entrees arrivaient en garde, demi-garde ou lateral.
  // AUCUNE ne menait au dos ni en tortue — le seul chemin etait TROIS
  // progressions depuis la garde, et on en mesurait 0,34 par round. Un
  // specialiste du dos n'atteignait donc JAMAIS son arme.
  // Or un body lock pris de dos met dans le dos, un snap down met en tortue
  // d'ou l'on prend le dos. Chimaev fait exactement ca, et il le fait aussi
  // DEBOUT depuis le clinch.
  // /!\ ELLES SONT RESERVEES : c'est LA LUTTE qui ouvre la porte et le
  // back_top qui decide s'il la garde. Un lutteur d'elite au dos moyen y
  // arrive et se fait decrocher ; un specialiste du dos a la lutte moyenne
  // n'y arrive jamais. Voir exige_dos ci-dessous.
  back_take:  { skill: "clinch_wrestling", def: "whizzer", pos: "back_control", cout: 6, contre: 0.18,
                exige_dos: 75 },
  snap_down:  { skill: "grip_fighting", def: "balance", pos: "turtle", cout: 4, contre: 0.08,
                exige_dos: 62 },
};

function tenter_takedown(atk, dfn, etat, log) {
  if (telemetrieActive()) TELEMETRY.td_tentes += 1;
  // max(key=) Python : PREMIER maximum, > strict
  let td = null, bestV = -Infinity;
  const dispo = [];
  for (const t of Object.keys(TAKEDOWNS)) {
    const info_t = TAKEDOWNS[t];
    // /!\ LA PORTE DU DOS NE S'OUVRE PAS A TOUT LE MONDE. Sans ce filtre,
    // chacun prendrait le dos et ce serait absurde. C'est la LUTTE qui
    // amene et le back_top qui autorise.
    if (info_t.exige_dos !== undefined
        && (atk.ground.back_top === undefined || atk.ground.back_top < info_t.exige_dos)) continue;
    dispo.push(t);
  }
  // /!\ ON NE CHOISIT PAS L'ENTREE LA PLUS FACILE, ON CHOISIT CELLE QUI MENE
  // OU L'ON VEUT ALLER. Deux versions ratees avant celle-ci :
  //   1. ecart de niveau brut -> le double leg gagnait TOUJOURS, les portes
  //      vers le dos n'etaient jamais empruntees.
  //   2. ponderation par la valeur ABSOLUE de la position -> un homme bon
  //      partout les trouvait toutes equivalentes (118 contre 124), l'ecart
  //      etait noye.
  // On normalise donc SUR L'EVENTAIL DISPONIBLE : ce qui compte est de
  // combien la position visee vaut mieux QUE LES AUTRES, pour lui.
  const vals = dispo.map(t => valeur_position_sol(atk, TAKEDOWNS[t].pos));
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  // /!\ ON NE PREND PAS TOUJOURS LA MEILLEURE — ON VARIE.
  // Le choix etait DETERMINISTE : le meme homme tentait la MEME entree
  // 1061 fois sur 1061, sur toute une carriere. Et c'etait la projection,
  // l'entree la PLUS PUNIE du catalogue (20 % de contre), parce qu'elle
  // arrive en controle lateral et que la ponderation la valorisait.
  // Un vrai lutteur varie : on montre le double, on prend le corps, on
  // projette. Et l'adversaire n'a jamais a deviner si on ne varie pas.
  // On tire donc au sort PONDERE : les meilleures entrees souvent, les
  // autres parfois. L'exposant 2,2 garde une preference nette sans rendre
  // le choix unique.
  const poids = [];
  for (let i = 0; i < dispo.length; i++) {
    const info_t = TAKEDOWNS[dispo[i]];
    let v = (atk.wrestling[info_t.skill] !== undefined ? atk.wrestling[info_t.skill] : 50)
          - (dfn.wrestling[info_t.def] !== undefined ? dfn.wrestling[info_t.def] : 50) * 0.5;
    v *= 0.55 + 0.9 * (vals[i] - vmin) / (vmax - vmin + 1);
    poids.push(Math.pow(Math.max(1, v), 2.2));
  }
  td = alea.choices(dispo, poids, 1)[0];
  bestV = 0;
  const info = TAKEDOWNS[td];
  atk.rs.td_attempted += 1;
  atk.depenser(info.cout, "lutte");

  // /!\ SE DEFENDRE COUTE, MAINTENANT. Trouve le 09/08 en fabriquant un
  // Merab : cardio 99, lutte 92+, il tentait jusqu'a 13 takedowns par
  // combat et finissait a 15 de cardio pendant que le frappeur qui se
  // defendait finissait a 74. Il perdait 10 fois sur 10.
  // Sprawl gratuit, lutte contre la grille gratuite, relevee gratuite :
  // seul l'attaquant payait, et double quand il ratait. Or repousser un
  // lutteur epuise autant que d'entrer — c'est meme ce qui casse les gens
  // au troisieme round.
  // CONSEQUENCE DE CONCEPTION : sans ca, "user l'adversaire" est
  // STRUCTURELLEMENT IMPOSSIBLE, et l'archetype Merab ne peut pas exister.
  // Un bon defenseur depense MOINS, il ne depense pas zero.
  const skillDef = dfn.wrestling[info.def] !== undefined ? dfn.wrestling[info.def] : 50;
  dfn.depenser(info.cout * COUT_DEFENSE_TD * (1.35 - skillDef / 145), "lutte");

  const skill = atk.wrestling[info.skill];
  const defense = dfn.wrestling[info.def];

  const penaliteJambes = atk.stabilite();
  let ec = skill - defense;
  ec = (Math.pow(Math.abs(ec), 1.25)) * (ec >= 0 ? 1 : -1) / Math.pow(40, 0.25);
  let chance = (38 + 0.85 * ec
                + 26 * atk.specialite(skill)) * (0.7 + 0.3 * atk.cardio_ratio()) * penaliteJambes;
  if (!(etat.cage === CAGE && etat.accule === dfn.name))
    chance -= (dfn.striking.footwork - 50) * 0.16;

  /* /!\ LA DISTANCE DECIDE AUSSI LA LUTTE (chantier D, suite — mesure du
     10/08 : le kickboxeur de distance gagnait 79 % de ses combats, le
     brawler 28 %, le grappler 36 %. On avait ajoute un PEAGE a ceux qui
     doivent franchir l'espace — franchir coute, expose, peut echouer —
     SANS LEUR DONNER LA CONTREPARTIE. Or c'est l'inverse dans une cage :
     un lutteur qui a deja coupe la distance amene au sol beaucoup plus
     facilement, et un frappeur pris a bout portant n'a plus la place de
     sprawler — il faut reculer pour sprawler, et il n'a plus de recul.
     Le grappler paie toujours l'entree ; desormais il est PAYE EN
     RETOUR. */
  if (etat.geo) {
    const proche = porteeDe(atk) * 0.55;          // sa zone de corps a corps
    if (etat.geo.d <= proche) {
      const dedans = (proche - etat.geo.d) / Math.max(0.2, proche);   // 0 a 1
      chance += 22 * dedans;                       // il est deja dessus
    } else {
      /* Trop loin pour une entree franche : il doit traverser, et
         l'autre le voit venir. */
      const trop = Math.min(1, (etat.geo.d - proche) / Math.max(0.3, proche));
      chance -= 16 * trop;
    }
  }

  if (etat.cage === CAGE && etat.accule === dfn.name) {
    chance += 10;
  } else if (etat.accule === atk.name) {
    const elan = (dfn.striking.cage_cutting - 45) * 0.14;
    const lecture = (atk.mental.fight_iq - 50) * 0.09;
    chance += Math.max(0.0, 4 + elan + lecture);
  }

  if (alea.uniform(0, 100) < Math.max(5, Math.min(90, chance))) {
    atk.rs.td_landed += 1;
    atk.td_echecs = Math.max(0, atk.td_echecs - 1);
    if (telemetrieActive()) TELEMETRY.td_reussis += 1;
    etat.phase = SOL;
    etat.position = info.pos;
    etat.top = atk.name;
    log.push(`    ${atk.name} ${td} → RÉUSSI, combat au sol (${info.pos})`);
    return null;
  }

  if (alea.random() < info.contre) {
    etat.phase = SOL;
    etat.position = "half_guard";
    etat.top = dfn.name;
    log.push(`    ${atk.name} ${td} → CONTRÉ, ${dfn.name} prend le dessus`);
    return null;
  }

  log.push(`    ${atk.name} ${td} → stoppé`);
  atk.depenser(info.cout * SURCOUT_TD_RATE, "lutte");
  atk.td_echecs += 1;
  return null;
}


// Les positions ou chaque famille de soumission se finit, et celles d'ou
// l'on frappe le mieux. Dupliquees a l'identique dans engine.py.
const FAMILLES_SOL = {
  dos:       ["back_control", "crucifix"],
  bras:      ["mount", "side_control", "knee_on_belly", "closed_guard"],
  tete_bras: ["north_south", "turtle", "half_guard", "side_control"],
  jambes:    ["open_guard", "butterfly_guard"],
};
const POS_OUVERTES = ["mount", "side_control", "north_south", "knee_on_belly",
                      "back_control", "crucifix"];
const SEUIL_ARME_SOL = 72;

/**
 * LES POIDS DU TIRAGE D'ACTION AU SOL — remplace le 24/50/26 fixe.
 *
 * /!\ CETTE FONCTION EST DUPLIQUEE A L'IDENTIQUE DANS engine.py. Elle ne
 * peut pas vivre dans grappling.js : le moteur doit rester conforme au
 * temoin Python au caractere pres, et Python n'importe pas les modules JS.
 *
 * /!\ SANS PROFIL DE GRAPPLING, ON REND EXACTEMENT LES POIDS HISTORIQUES.
 * Un combattant non equipe se comporte donc comme avant la bascule, et les
 * bancs de conformite restent verts.
 *
 * Pourquoi : le tirage fixe donnait 0,37 progression par round alors qu'il
 * en faut TROIS pour aller de la garde au dos — un specialiste n'atteignait
 * jamais son arme. Et Usman perdait un quart de ses actions a chercher des
 * soumissions qu'il ne sait pas finir.
 * La quatrieme intention, TENIR, vient de Merab Dvalishvili : il plaque, ne
 * passe pas, ne cherche rien, il garde la position et laisse le temps
 * passer. Aucune des trois options du moteur ne l'exprimait.
 */
/**
 * Ce qu'une position vaut POUR CET HOMME : ce qu'il sait y finir, ou ce
 * qu'il peut y taper. Dupliquee a l'identique dans engine.py.
 */
function valeur_position_sol(f, p) {
  const g = f.grappling;
  const gr = f.ground;
  let m = 0;
  if (g)
    for (const k of Object.keys(FAMILLES_SOL))
      if (FAMILLES_SOL[k].includes(p) && g.dessus[k] >= SEUIL_ARME_SOL)
        m = Math.max(m, g.dessus[k]);
  const fr = gr.ground_striking !== undefined ? gr.ground_striking : 40;
  return Math.max(m * 1.25, POS_OUVERTES.includes(p) ? fr : fr * 0.55);
}

function poids_action_sol(top, position, stall) {
  const g = top.grappling;
  // /!\ LA CONSIGNE DOIT PASSER MEME SANS PROFIL DE GRAPPLING (mesure du
  // 10/08 : A/B strictement identique — les combattants generes n'ont pas
  // de profil, le retour anticipe court-circuitait l'ordre du coin).
  // /!\ ETENDUE PAR LE CHANTIER G (14/08) : les cris du coin en direct
  // parlent au dessus — "conserve" / "passe sa garde" / "frappe" / "la
  // soumission". MEME GRAMMAIRE DE REPORT que la consigne d'entre-rounds :
  // on ne cree pas d'arme, on deplace les intentions. Inerte sans ordre.
  const consigneSol = (p) => {
    const ordre = top.gameplan && top.gameplan.sol;
    if (!ordre) return p;
    const REPORTS = {
      soumission: [1.4, 0.45, 3.0, 0.45],   // la consigne historique du 10/08
      passage:    [3.0, 0.55, 0.55, 0.45],  // "passe sa garde !"
      frappe:     [0.45, 3.0, 0.5, 0.5],    // "frappe ! ground and pound !"
      controle:   [0.5, 0.55, 0.4, 3.2],    // "conserve la position !"
    };
    const r = REPORTS[ordre];
    if (!r) return p;
    const q = [p[0] * r[0], p[1] * r[1], p[2] * r[2], p[3] * r[3]];
    const s2 = q[0] + q[1] + q[2] + q[3];
    return [q[0] / s2, q[1] / s2, q[2] / s2, q[3] / s2];
  };
  if (!g) return consigneSol([0.24, 0.50, 0.26, 0.0]);
  const gr = top.ground;

  let arme = 0;
  for (const k of Object.keys(FAMILLES_SOL))
    if (FAMILLES_SOL[k].includes(position) && g.dessus[k] >= SEUIL_ARME_SOL)
      arme = Math.max(arme, g.dessus[k]);

  const val = (p) => {
    let m = 0;
    for (const k of Object.keys(FAMILLES_SOL))
      if (FAMILLES_SOL[k].includes(p) && g.dessus[k] >= SEUIL_ARME_SOL)
        m = Math.max(m, g.dessus[k]);
    const f = gr.ground_striking !== undefined ? gr.ground_striking : 40;
    const ouv = POS_OUVERTES.includes(p) ? f : f * 0.55;
    return Math.max(m * 1.25, ouv);
  };
  const ici = val(position);
  let mieux = 0;
  for (const k of Object.keys(FAMILLES_SOL))
    for (const p of FAMILLES_SOL[k]) if (p !== position) mieux = Math.max(mieux, val(p));
  const gain = Math.max(0, mieux - ici);

  let sub = arme ? 0.10 + (arme - SEUIL_ARME_SOL) / 27 * 0.55 : 0.03;
  sub *= 1 - Math.min(0.65, gain / 35);
  const passage = ((gr.passing !== undefined ? gr.passing : 50)
                 + (gr.posture_sol !== undefined ? gr.posture_sol : 50)) / 2;
  const progress = 0.08 + Math.min(0.50, gain / 30 * 0.34 + (passage - 50) / 100 * 0.22);
  const frappe = gr.ground_striking !== undefined ? gr.ground_striking : 40;
  let gnp = 0.06 + (frappe / 100) * 0.50 * (POS_OUVERTES.includes(position) ? 1.0 : 0.55);
  const ctrl = gr.top_control !== undefined ? gr.top_control : passage;
  let tenir = 0.05 + Math.max(0, (ctrl - 60) / 100) * 0.45;

  // /!\ LE COUP D'ENTRETIEN — idee de Mael, et elle donne enfin un emploi au
  // fight_iq au sol. L'arbitre relevait 40 % des sequences pour inactivite,
  // plus souvent que l'adversaire lui-meme : on avait ralenti le tempo et
  // durci la sortie, donc les sequences duraient, donc la regle
  // d'inactivite mordait. Elle contredisait meme l'intention "tenir" qu'on
  // venait d'ajouter pour Merab — on lui donnait le droit de ne rien
  // tenter, et l'arbitre le punissait aussitot.
  // Or le mecanisme existait DEJA a moitie : 3 points de degats suffisent a
  // remettre le compteur d'inactivite a zero. Ce qui manquait, c'est LA
  // DECISION DE LE FAIRE.
  // Un homme lucide place trois petits coups sans force juste avant que
  // l'arbitre s'agite : il n'abime pas, il ACHETE DU TEMPS. Un moyen y
  // pense une fois sur deux, un faible subit.
  // /!\ ET LES COUPS SONT REELS : ils sortent au log et comptent dans les
  // frappes. Pas d'exception invisible — le moteur doit vraiment les tirer.
  let s = progress + gnp + sub + tenir;
  let P = [progress / s, gnp / s, sub / s, tenir / s];

  // /!\ LA CONSIGNE DU COIN "CHERCHE LA SOUMISSION" (Mael, 10/08).
  // INERTE SANS ORDRE : gameplan.sol n'existe sur aucun combattant genere
  // ni dans engine.py — un combat sans consigne reste conforme au temoin.
  // ON NE CREE PAS D'ARME QU'IL N'A PAS : on REPORTE les intentions vers
  // la finition. Un homme sans soumission a qui on crie "cherche-la"
  // gaspille ses actions sur du 3 % — le prix d'un mauvais ordre.
  P = consigneSol(P);

  if (stall !== undefined && stall > 0) {
    // /!\ QUAND L'ARBITRE S'AGITE, ON LACHE TOUT POUR FRAPPER. Premiere
    // version : on ne deplacait que l'intention "tenir", qui ne pese que
    // 15 % — l'effet etait invisible (0,39 relance/round a fight_iq 40
    // contre 0,33 a 99). Le report doit venir de TOUTES les autres
    // intentions : on ne continue pas a chercher une soumission quand on
    // va se faire relever.
    const urgence = Math.min(1, stall / SEUIL_RELANCE);
    const lucidite = Math.max(0, Math.min(1, (top.mental.fight_iq - 35) / 55));
    const b = urgence * lucidite * 0.80;
    const reste = 1 - b;
    P = [P[0] * reste, P[1] * reste + b, P[2] * reste, P[3] * reste];
  }
  return P;
}

// ------------------------------------------------------------------- sol
function phase_sol(f1, f2, etat, log) {
  const top = etat.top === f1.name ? f1 : f2;
  const bottom = etat.top === f1.name ? f2 : f1;
  let pos = etat.position;

  top.rs.control += 1;
  top.depenser(0.8, "sol_dessus");
  bottom.depenser(1.2, "sol_dessous");

  const _p = poids_action_sol(top, pos, etat.stall);
  const action = alea.choices(["progress", "gnp", "sub_top", "tenir"], _p, 1)[0];

  if (action === "progress") {
    const nouveau = tenter_progression(top, bottom, pos);
    top.depenser(COUT_PASSAGE * (nouveau ? 1.0 : SURCOUT_ECHEC_SOL), "sol_dessus");
    if (nouveau) {
      etat.position = nouveau;
      log.push(`    ${top.name} progresse → ${nouveau}`);
    } else {
      log.push(`    ${top.name} tente de progresser → bloqué en ${pos}`);
    }
  } else if (action === "gnp") {
    const acces = POSITIONS[pos].gnp;
    let rafale = 2 + Math.trunc(acces * 6 + top.ground.ground_striking / 32);
    rafale = Math.max(1, Math.min(11, Math.trunc(rafale * top.fatigue_factor())));
    let d = 0, bloques = 0, touches = 0, tentes = 0;
    for (let i = 0; i < rafale; i++) {
      tentes += 1;
      const [r, coup] = resolve_gnp(top, bottom, pos);
      if (!coup) {
        bloques += 1;
        if (bloques >= 2) break;
        continue;
      }
      bloques = 0;
      d += coup;
      touches += 1;
      top.rs.sig_landed += 1;
    }
    top.depenser(COUT_GNP_COUP * tentes, "sol_dessus");
    d = Math.trunc(d * top.div.dmg_mod * 0.85);
    if (d) {
      bottom.head_damage += d;
      top.rs.damage += d;
      top.rs.score_frappes += 1.0;
      log.push(`    ${top.name} ground and pound → ${touches}/${tentes} coups, ${d} dégâts`);
      let vulnerabilite = 0.30 + POSITIONS[pos].gnp * 0.32;
      if (bottom.sonne > 0) vulnerabilite *= 1.35;
      const issue = bottom.resultat_impact_tete(d * vulnerabilite, top.striking.ko_power);
      if (issue === "ko") {
        log.push(`    *** TKO AU SOL ! ${top.name} finit au ground and pound ***`);
        return top;
      }
      if (issue === "knockdown") {
        bottom.encaisser_knockdown();
        top.rs.knockdowns += 1;
        log.push(`    >>> ${bottom.name} est sonne au sol, ${top.name} enchaine`);
      }
    } else {
      top.rs.sig_attempted += 1;
      // /!\ Le log disait "bloqué" meme quand des coups etaient PASSES :
      // un coup a 1 degat donne Math.trunc(1 * 0.85) = 0, et le compte de
      // `touches` etait perdu — alors que rs.sig_landed les avait comptes.
      // Aucune relecture du log ne pouvait retrouver l'information. On
      // ecrit donc toujours touches/tentes.
      log.push(`    ${top.name} ground and pound → ${touches}/${tentes} coups, 0 dégâts`);
    }
  } else if (action === "tenir") {
    // /!\ NE RIEN TENTER EST UNE DECISION. Merab plaque, ne passe pas la
    // garde, ne cherche ni la soumission ni le KO : il garde la position et
    // laisse le temps passer. C'est ce qui gagne des rounds sans rien
    // produire, et aucune des trois options historiques ne l'exprimait.
    top.depenser(0.4, "sol_dessus");
    log.push(`    ${top.name} garde le contrôle en ${pos}`);
  } else if (action === "sub_top") {
    let [sub, res] = tenter_soumission_top(top, bottom, pos);
    if (res === "SOUMISSION" && alea.random() > CALIBRAGE_SUB) res = "défendue";
    if (sub) {
      top.depenser(COUT_SUB_TOP * (res === "SOUMISSION" ? 1.0 : SURCOUT_ECHEC_SOL), "sol_dessus");
      top.rs.sub_attempts += 1;
      log.push(`    ${top.name} tente ${sub} → ${res}`);
      if (res === "SOUMISSION") {
        log.push(`    *** ${bottom.name} tape ! ${sub} ***`);
        return top;
      }
    }
  }

  // le travail simultane du dessous
  // /!\ CHANTIER G (14/08) : les cris parlent aussi a l'homme du dessous.
  // gameplan.sol_dessous module les DEUX PORTES existantes (tenter, puis
  // soumission-ou-evasion) — memes appels alea, seuils differents : le
  // chemin RNG sans ordre est STRICTEMENT celui du temoin.
  //   bloquer    : il ferme, casse la posture, achete du temps — il tente
  //                moins, s'expose moins (les echecs coutent).
  //   relever    : tout pour la sortie, presque plus de soumission d'en bas.
  //   sweep      : pareil, mais tenter_evasion visera le renversement.
  //   explosion  : il tente TOUT, et ca se paie en cardio.
  const _sd = bottom.gameplan && bottom.gameplan.sol_dessous;
  const _pTente = _sd === "bloquer" ? 0.50 : _sd === "explosion" ? 1.0 : 0.92;
  const _pSub   = _sd === "bloquer" ? 0.10 : _sd === "relever" ? 0.06
                : _sd === "sweep" ? 0.10 : _sd === "explosion" ? 0.34 : 0.28;
  if (alea.random() < _pTente && etat.phase === SOL) {
    if (_sd === "explosion") bottom.depenser(1.5, "sol_dessous");
    pos = etat.position;
    if (alea.random() < _pSub) {
      let [sub, res] = tenter_soumission_bottom(bottom, top, pos);
      if (res === "SOUMISSION" && alea.random() > CALIBRAGE_SUB) res = "défendue";
      if (sub) {
        bottom.rs.sub_attempts += 1;
        log.push(`    ${bottom.name} attaque ${sub} depuis le dessous → ${res}`);
        if (res === "SOUMISSION") {
          log.push(`    *** ${top.name} tape ! ${sub} d'en bas ***`);
          return bottom;
        }
        return null;
      }
    }
    const [tech, dest] = tenter_evasion(bottom, top, pos);
    if (tech) {
      let cout = (TECHNIQUES_ESCAPE[tech] !== undefined
                  && TECHNIQUES_ESCAPE[tech].cout_cardio !== undefined)
                 ? TECHNIQUES_ESCAPE[tech].cout_cardio : 2;
      if (dest === null) cout *= SURCOUT_ECHEC_SOL;
      bottom.depenser(cout, "sol_dessous");
    }
    if (dest === "debout") {
      etat.phase = DEBOUT;
      etat.top = null;
      log.push(`    ${bottom.name} ${tech} → se relève, retour debout`);
    } else if (dest) {
      etat.position = dest;
      log.push(`    ${bottom.name} ${tech} → passe en ${dest}`);
      if (tech === "sweep") {
        etat.top = bottom.name;
        log.push(`    >>> RENVERSEMENT, ${bottom.name} prend le dessus`);
      }
    } else {
      log.push(`    ${bottom.name} ${tech} → maintenu en ${pos}`);
    }
  }

  return null;
}

// ------------------------------------------------------------------ clinch
class DamageRouter {
  constructor(fighter) { this.f = fighter; }
  add(zone, dmg) {
    if (zone === "tete") {
      this.f.head_damage += dmg;
    } else if (zone === "corps") {
      const reel = this.f.body.encaisser(dmg, alea.random() < 0.3 ? "foie" : "corps");
      this.f.depenser(this.f.body.cout_immediat_cardio(reel), "encaisse_corps");
    } else if (zone === "jambe") {
      const cote = this.f.stance.jambe_avant();
      this.f.legs.add(cote, dmg);
    }
  }
}

function phase_clinch(f1, f2, etat, log) {
  const [issue, acteur, events, stats, priseFinale] = clinch_sequence(
    f1, f2, new DamageRouter(f1), new DamageRouter(f2),
    etat.cage === CAGE, 4, null,
    f1.cardio_ratio(), f2.cardio_ratio(),
  );
  for (const e of events) log.push(`    ${e}`);

  for (const f of [f1, f2]) {
    const st = stats[f.name] !== undefined ? stats[f.name] : {};
    f.rs.score_frappes += st.score !== undefined ? st.score : 0;
    f.rs.sig_landed += st.sig !== undefined ? st.sig : 0;
    f.depenser(CLINCH_BASE_CARDIO + (st.cardio !== undefined ? st.cardio : 0.0), "clinch");
  }

  if (issue === "takedown") {
    etat.phase = SOL;
    // /!\ ON ATTERRIT LA OU L'ON ETAIT. Le takedown de clinch arrivait
    // TOUJOURS en demi-garde, meme quand le controleur avait deja le dos :
    // le travail de Chimaev au corps a corps etait efface a l'atterrissage.
    etat.position = priseFinale === "back_clinch" ? "back_control" : "half_guard";
    etat.top = acteur.name;
    acteur.rs.td_landed += 1;
    if (telemetrieActive()) TELEMETRY.td_clinch += 1;
  } else {
    etat.phase = DEBOUT;
    if (issue === "rupture") {
      etat.cage = CENTRE;
      etat.accule = null;
    }
  }
  return null;
}

// ------------------------------------------------------------ temps / rythme
function temps_sol(position, evasionRatee) {
  let t = T_SOL_BASE + POSITIONS[position].valeur * 1.2;
  if (evasionRatee) t += 3.0;
  return t;
}

function rythme(f1, f2) {
  const v1 = f1.striking.volume * f1.fatigue_factor()
           * (f1.gameplan.allure !== undefined ? f1.gameplan.allure : 1.0);
  const v2 = f2.striking.volume * f2.fatigue_factor()
           * (f2.gameplan.allure !== undefined ? f2.gameplan.allure : 1.0);
  const moyen = Math.max(v1, v2) * 0.65 + Math.min(v1, v2) * 0.35;
  return 0.50 + moyen / 100;
}

function taille_combinaison(f) {
  let base = 1 + f.striking.enchainements / 42;
  base *= f.fatigue_factor();
  let n = Math.trunc(base);
  if (alea.random() < base - n) n += 1;
  return Math.max(1, Math.min(5, n));
}

// ------------------------------------------------------------------- round
/* ==== CHANTIER G — LE ROUND AVANCE PAR TRANCHES (Mael, 14/08) ==========
   simuler_round etait INDIVISIBLE (l'obstacle mesure du carnet) : on ne
   pouvait pas crier pendant. Le corps vit desormais dans un GENERATEUR
   qui s'arrete a chaque frontiere de 30 s — la taille de tranche est un
   choix de jeu de Mael, pas un detail technique. L'appelant reprend la
   main au yield : il peut modifier les gameplans (les cris de cris.js),
   puis relance. /!\ LE CRI S'APPLIQUE A LA TRANCHE SUIVANTE, jamais a ce
   qui est deja calcule — l'ecran ne ment pas.
   /!\ INERTE PAR CONSTRUCTION : simuler_round() draine le generateur sans
   rien faire aux arrets. Aucun tirage, aucune ligne de log, aucun calcul
   n'est ajoute au chemin sans cri — le banc de non-regression le prouve. */
/* /!\ TRANCHE 15 s (Mael, 21/08 : "je crie et c'est pas en direct, le
   plus souvent trop tard"). A 30 s, le moteur etait en avance de 0-30 s
   sur la lecture : la phase visible au moment du cri etait deja loin.
   A 15 s, le decalage moyen tombe a ~7 s — le coin parle presque dans
   le temps du combat. Le flux RNG est INCHANGE (prouve au banc 27 : les
   tranches reproduisent le temoin quel que soit leur pas). */
function* simuler_round_tranches(f1, f2, num, log, duree = DUREE_ROUND, tranche = 15) {
  const vm = ((f1.div.volume_mod !== undefined ? f1.div.volume_mod : 1.0)
            + (f2.div.volume_mod !== undefined ? f2.div.volume_mod : 1.0)) / 2;
  log.push(`\n──────── ROUND ${num} ────────`);
  f1.reset_round_stats();
  f2.reset_round_stats();
  f1.chaos *= 0.45;
  f2.chaos *= 0.45;
  f1.td_echecs = Math.trunc(f1.td_echecs * 0.4);
  f2.td_echecs = Math.trunc(f2.td_echecs * 0.4);
  if (telemetrieActive()) TELEMETRY.n_rounds += 1;

  const etat = { phase: DEBOUT, cage: CENTRE, accule: null,
                 position: null, top: null, temps: 0.0 };

  let t = 0.0;
  let frontiere = tranche;
  while (t < duree) {
    if (t >= frontiere) {
      /* La main a l'appelant : il lit l'etat, applique les cris, relance.
         La frontiere saute les tranches deja consommees par un long
         echange au sol — on ne rejoue jamais le passe. */
      while (frontiere <= t) frontiere += tranche;
      yield { t: pyRound(t), etat, f1, f2 };
    }
    for (const f of [f1, f2]) {
      const [sw, raison] = veut_switcher(f.stance, f.legs, f.mental.fight_iq);
      if (sw) {
        f.stance.switch();
        log.push(`    [garde] ${f.name} passe en ${f.stance.garde_actuelle} — ${raison}`);
      }
    }

    f1.recuperer_sonne();
    f2.recuperer_sonne();

    const phaseAvant = etat.phase;
    const posAvant = etat.position;
    let v, dt;

    if (etat.phase === DEBOUT) {
      const cadence = Math.max(0.5, vm * rythme(f1, f2));
      etat.cadence = cadence;
      v = phase_debout(f1, f2, etat, log);
      dt = T_FRAPPE_BASE / cadence;
      if (etat.phase === SOL) dt = T_TAKEDOWN;
      else if (etat.phase === CLINCH) dt = 2.0;
    } else if (etat.phase === CLINCH) {
      v = phase_clinch(f1, f2, etat, log);
      dt = T_CLINCH;
    } else {
      const avantTop = etat.top;
      const dmgAvant = f1.rs.damage + f2.rs.damage;
      v = phase_sol(f1, f2, etat, log);
      const evasionRatee = (etat.phase === SOL && etat.position === posAvant
                            && etat.top === avantTop);
      dt = temps_sol(posAvant !== null ? posAvant : "half_guard", evasionRatee);

      const rienNeBouge = (evasionRatee
                           && (f1.rs.damage + f2.rs.damage) - dmgAvant < 3);
      etat.stall = rienNeBouge ? ((etat.stall !== undefined ? etat.stall : 0.0) + dt) : 0.0;
      if (etat.stall >= SEUIL_RELANCE && etat.phase === SOL) {
        etat.phase = DEBOUT;
        etat.top = null;
        etat.position = null;
        etat.stall = 0.0;
        log.push("    [arbitre] combat arrete au sol, relance debout");
        if (telemetrieActive()) TELEMETRY.n_relances += 1;
      }
    }

    t += dt;
    etat.temps = t;
    if (telemetrieActive() && phaseAvant !== SOL && etat.phase === SOL)
      TELEMETRY.sequences_sol += 1;
    if (telemetrieActive()) {
      const lab = phaseAvant === DEBOUT ? "debout" : (phaseAvant === CLINCH ? "clinch" : "sol");
      TELEMETRY["t_" + lab] += dt;
      TELEMETRY["n_" + lab] += 1;
      TELEMETRY.t_total += dt;
    }
    f1.depenser(TEMPO_CARDIO * dt, "tempo");
    f2.depenser(TEMPO_CARDIO * dt, "tempo");

    if (phaseAvant === SOL && etat.top) {
      const gagnant = etat.top === f1.name ? f1 : f2;
      gagnant.rs.temps_controle = (gagnant.rs.temps_controle !== undefined ? gagnant.rs.temps_controle : 0) + dt;
    }

    if (v) return [v, pyRound(t)];
  }

  return [null, pyRound(t)];
}

/** L'ANCIENNE PORTE, INCHANGEE POUR TOUS LES APPELANTS : draine le
 *  generateur d'un trait. Personne ne crie -> le combat est celui du
 *  temoin, octet pour octet. */
function simuler_round(f1, f2, num, log, duree = DUREE_ROUND) {
  const g = simuler_round_tranches(f1, f2, num, log, duree);
  let r = g.next();
  while (!r.done) r = g.next();
  return r.value;
}

// ----------------------------------------------------------------- scoring
/**
 * Points concedes par le PERDANT du round : 9 par defaut, 8 en cas de
 * domination ecrasante.
 *
 * /!\ POURQUOI CETTE FONCTION EXISTE (bascule du 08/08, mesure a l'appui)
 * L'ancien critere etait `ecart de degats >= 45 -> 10-8`. Sur 882 rounds
 * mesures, il produisait 85% de 10-8 la ou le MMA reel en compte 5 a 10%,
 * et la carte la plus frequente etait 30-24 (58% des decisions). 45 points
 * d'ecart sur des rounds a 200-300 de degats, c'est du bruit : l'ecart
 * MEDIAN entre les deux combattants est de 169.
 * Aucun seuil ABSOLU ne rattrape ca (240 laissait encore 33%). Il faut un
 * critere RELATIF, et l'exigence d'un vrai marqueur d'impact, comme les
 * juges : un knockdown, ou un round a sens unique.
 *
 * /!\ CE QU'ON NE PEUT PAS DESCENDRE PLUS BAS : 30,8% des rounds du moteur
 * presentent un ecart de knockdown, 10,5% en presentent deux. Le taux de
 * knockdown est donc le PLANCHER de toute regle qui s'y appuie. Il est
 * environ 3x celui du MMA reel — mais il est PORTEUR du calibrage gele
 * (les knockdowns alimentent l'arret de l'arbitre, donc la repartition
 * KO/TKO/SUB/DEC). On ne le touche pas ici. Resultat : 10,3% de 10-8, soit
 * le haut de la fourchette reelle. Le residu vient du taux de knockdown,
 * pas de cette regle.
 *
 * Le VAINQUEUR du round n'est pas touche par cette fonction : la cascade
 * degats -> knockdown -> controle -> agressivite reste identique.
 */
function points_du_round(w, l) {
  const kd = w.rs.knockdowns - l.rs.knockdowns;
  const ratio = w.rs.damage / Math.max(1, l.rs.damage);
  const ecart = w.rs.damage - l.rs.damage;
  if (kd >= 2 && ratio >= 4) return 8;                        // round de massacre
  if (kd >= 1 && ratio >= 30 && ecart >= 450) return 8;        // sens unique + chute
  return 9;
}

function scorer_round(f1, f2) {
  const d1 = f1.rs.damage, d2 = f2.rs.damage;
  if (Math.abs(d1 - d2) >= 6) {
    const [w, l] = d1 > d2 ? [f1, f2] : [f2, f1];
    return [w, l, points_du_round(w, l), "dégâts"];
  }

  const kd1 = f1.rs.knockdowns, kd2 = f2.rs.knockdowns;
  if (kd1 !== kd2) {
    const [w, l] = kd1 > kd2 ? [f1, f2] : [f2, f1];
    const ecart = Math.abs(kd1 - kd2);
    return [w, l, points_du_round(w, l), `knockdown x${ecart}`];
  }

  const c1 = f1.rs.control + f1.rs.td_landed * 2 + f1.rs.sub_attempts * 2;
  const c2 = f2.rs.control + f2.rs.td_landed * 2 + f2.rs.sub_attempts * 2;
  if (Math.abs(c1 - c2) >= 3) {
    const [w, l] = c1 > c2 ? [f1, f2] : [f2, f1];
    return [w, l, points_du_round(w, l), "contrôle"];
  }

  const a1 = f1.rs.sig_attempted + f1.rs.td_attempted;
  const a2 = f2.rs.sig_attempted + f2.rs.td_attempted;
  if (a1 !== a2) {
    const [w, l] = a1 > a2 ? [f1, f2] : [f2, f1];
    return [w, l, 9, "agressivité"];
  }

  const [w, l] = d1 >= d2 ? [f1, f2] : [f2, f1];
  return [w, l, 9, "départage serré"];
}

// ------------------------------------------------------------------ combat
function simuler_combat(f1, f2, rounds = 3, verbose = true) {
  for (const f of [f1, f2]) {
    if (f.gameplan.allure === undefined)
      f.gameplan.allure = rounds <= 3 ? 1.0 : 0.85;
  }
  const log = [];
  const scores = { [f1.name]: 0, [f2.name]: 0 };

  for (let r = 1; r <= rounds; r++) {
    const [vainqueur, echange] = simuler_round(f1, f2, r, log);

    if (vainqueur) {
      log.push(`\n>>> ${vainqueur.name} gagne au round ${r} (échange ${echange})`);
      if (verbose) console.log(log.join("\n"));
      return [vainqueur, log];
    }

    const [w, l, pts, critere] = scorer_round(f1, f2);
    scores[w.name] += 10;
    scores[l.name] += pts;
    log.push(`\n  Bilan R${r} :`);
    for (const f of [f1, f2]) {
      log.push(`    ${f.name.padEnd(14)} dégâts ${fmt0(f.rs.damage).padStart(5)} | `
        + `frappes ${f.rs.sig_landed}/${f.rs.sig_attempted} | `
        + `TD ${f.rs.td_landed}/${f.rs.td_attempted} | `
        + `ctrl ${f.rs.control} | cardio ${fmt0(f.cardio)} | `
        + `jambes ${f.legs.gauche}/${f.legs.droite} | `
        + `corps ${fmt0(f.body.degats_corps)} | tête ${pyStr(f.head_damage)} | KD ${f.rs.knockdowns}`);
    }
    log.push(`    → round pour ${w.name} (10-${pts}, ${critere})`);

    for (const f of [f1, f2]) f.recuperer_entre_rounds();
  }

  log.push(`\n──────── DÉCISION ────────`);
  log.push(`  ${f1.name} : ${scores[f1.name]}`);
  log.push(`  ${f2.name} : ${scores[f2.name]}`);
  let gagnant = null;
  if (scores[f1.name] > scores[f2.name]) gagnant = f1;
  else if (scores[f2.name] > scores[f1.name]) gagnant = f2;
  log.push(`  >>> ${!gagnant ? "Match nul" : gagnant.name + " l emporte aux points"}`);

  if (verbose) console.log(log.join("\n"));
  return [gagnant, log];
}

/** str() Python d'un nombre : les floats a valeur entiere s'affichent "23.0". */
function pyStr(x) {
  if (typeof x === "number" && Number.isInteger(x) && !Object.is(x, -0)) {
    // Python n'affiche ".0" que si la valeur est un float. Cote JS on ne
    // distingue pas int/float : head_damage reste entier tant que seuls des
    // ints s'y ajoutent (GnP), et devient un float non entier des la
    // premiere frappe debout. Un float exactement entier est un produit
    // d'uniformes tombant juste — probabilite nulle en pratique. On affiche
    // donc l'entier nu, et le banc de conformite surveille ce pari.
    return String(x);
  }
  return String(x);
}

module.exports = {
  DEBOUT, CLINCH, SOL, CENTRE, CAGE, DIVISIONS,
  StrikingProfile, WrestlingProfile, PhysicalProfile, MentalProfile, Fighter,
  resolve_strike_debout, phase_debout, TAKEDOWNS, tenter_takedown,
  phase_sol, DamageRouter, phase_clinch,
  DUREE_ROUND, CLINCH_BASE_CARDIO, TEMPO_CARDIO, ECHELLE_DEPENSE,
  CALIBRAGE_COMMOTION, CALIBRAGE_FOIE, CALIBRAGE_SUB, CALIBRAGE_KO_SEC,
  CALIBRAGE_ARBITRE, SEUIL_RELANCE,
  TELEMETRY, reset_telemetry,
  CAGE_RAYON, ALLONGE_DIV, TAILLE_DIV, morphoDe, tailleDe, allongeDe, porteeDe,
  BANDE, bandeArme, armesA, maxBande, distanceDeTravail,
  TEMPERAMENTS, temperamentDe, temperamentVif, poserGeometrie, avancerGeometrie,
  GEO, reset_geometrie,
  temps_sol, rythme, taille_combinaison,
  simuler_round, simuler_round_tranches, scorer_round, points_du_round, simuler_combat,
  // Exposes pour js/coin.js, qui doit reconstituer les lignes de bilan
  // AU CARACTERE PRES. Aucun comportement n'est touche : ce sont deux
  // formateurs, ils ne consomment pas de hasard.
  fmt0, pyStr,
  ORTHODOX, SOUTHPAW,
};
