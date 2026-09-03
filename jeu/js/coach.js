/**
 * coach.js — LA LOI DU COACH. Une seule, écrite une fois, lue partout.
 *
 * (Mael, 02/09 : « refais moi le système avec les coachs, que TOUT ait un
 * impact, et beaucoup plus de discussion et de choses à faire. »)
 *
 * ===================================================================
 * /!\ CE QUE L'AUDIT A TROUVÉ, ET QUE CE MODULE EXISTE POUR TUER
 * ===================================================================
 * 117 constats confirmés. Les trois classes, dans l'ordre du coût :
 *
 *   1. LA DEUXIÈME SOURCE. La correspondance axe↔famille de séance était
 *      recopiée SIX fois dans demo_jeu.html, avec six comportements
 *      différents pour « mental ». Et par-dessus, SALLE.roleStaff — une
 *      table indexée par NOM PROPRE, câblée en dur sur {"Da Costa":"jjb",
 *      "Meyer":"striking"}, que facteursSeance multipliait à chaque
 *      séance SANS JAMAIS REGARDER LE STAFF RÉEL. Sur une partie neuve,
 *      elle majorait le striking et le sol de +12 % et pénalisait la
 *      lutte et le physique de -5 %, à vie, quel que soit le coach
 *      employé. Un coach de lutte niveau 95 payé 1 500 €/semaine restait
 *      pénalisé. C'est mort ici : la spécialité ne se compte qu'UNE fois,
 *      et elle se compte sur l'homme, pas sur son nom.
 *
 *   2. L'AXE MORT. « Préparation mentale » était l'un des cinq axes,
 *      donc ~20 % du marché, avec huit CV écrits pour lui — et AUCUNE
 *      famille de séance ne lui correspondait. Un psychologue du sport
 *      niveau 90 coûtait 999 €/semaine et rendait exactement ce que rend
 *      un formateur striking niveau 50 payé 47 €. Pire : dire oui à son
 *      poulain infligeait -18 % à vie au combattant, parce que la famille
 *      cherchée n'existait pas. Ici, mental a sa famille, son domaine
 *      moteur (fight_iq, discipline) et son matériel. Il travaille.
 *
 *   3. L'ATTRIBUT QUI NE SORT NULLE PART. Le métier ne changeait que le
 *      salaire. L'âge ne servait qu'à la retraite. L'entente valait
 *      ±4,7 % — moins qu'un bouton gratuit. Le potentiel et la vitesse
 *      étaient jetés à l'embauche et re-dérivés du NOM.
 *
 * ===================================================================
 * /!\ LA RÈGLE FONDATRICE, ET ELLE SE VÉRIFIE AU GREP
 * ===================================================================
 * AUCUNE ligne du jeu ne lit c.niveau, c.axe, c.axes, c.groupe ni
 * c.entente en dehors de ce module. Tout passe par couverture() et
 * encadrement(). C'est la seule rédaction de « pas de deuxième source »
 * qu'un banc peut vérifier mécaniquement — et elle tue à elle seule
 * roleStaff, les six tables recopiées et les quatre écrans d'affectation
 * concurrents : ils ne peuvent plus exister sans casser le banc 38.
 *
 * ===================================================================
 * /!\ ET LA RÈGLE DE JEU : L'ATTENTION EST UN BUDGET FINI
 * ===================================================================
 * Ce qu'un coach donne à une case, il ne l'a plus pour une autre. C'est
 * ce qui remplace le vieux « ×0,78 si groupe=tous » et le « -14 % par axe
 * en plus » : deux rustines qui ne coûtaient presque rien (un homme seul
 * sur les cinq axes ET les deux groupes valait encore 72 % de cinq
 * spécialistes, pour un cinquième du salaire — donc la bonne stratégie
 * était d'embaucher UN homme et de tout lui coller dessus). Désormais la
 * dispersion se paie à la racine carrée : ce qui est tenable à deux cases
 * devient ridicule à dix.
 *
 * Module PUR : pas de DOM, pas d'état global, pas de hasard, pas de date.
 * Tout ce qui varie est DÉRIVÉ d'un jeton. Banc 38.
 */

/* ==================================================================== */
/* LA TABLE UNIQUE — elle remplace les six copies                        */
/* ==================================================================== */
/**
 * Une entrée par axe, et c'est LA source.
 *   cle    : l'identifiant interne
 *   lib    : ce que l'écran affiche
 *   quoi   : ce que ça recouvre, en clair
 *   fam    : LA FAMILLE DE SÉANCE que cet axe encadre (grilleDe())
 *   dom    : le domaine moteur touché (la fiche du combattant)
 *   equip  : la clé de SALLE.equip / PALIERS qui sert cet axe
 *   mot    : la façon d'en parler dans une phrase
 *   canal  : par où l'axe sort dans le jeu — 'seance' pour tous, et
 *            certains sortent AUSSI ailleurs (voir CANAUX)
 */
const AXES = [
  { cle: "striking", lib: "Frappe", quoi: "boxe, kickboxing, distance",
    fam: "striking", dom: "striking", equip: "striking",
    mot: "la frappe", canaux: ["seance", "coin"] },
  { cle: "lutte", lib: "Lutte", quoi: "amenées au sol, cage, corps à corps",
    fam: "mma", dom: "wrestling", equip: "lutte",
    mot: "la lutte", canaux: ["seance", "coin"] },
  { cle: "sol", lib: "Sol", quoi: "JJB, contrôle, soumissions",
    fam: "jjb", dom: "ground", equip: "lutte",
    mot: "le sol", canaux: ["seance", "coin"] },
  { cle: "physique", lib: "Physique", quoi: "cardio, force, récupération",
    fam: "physique", dom: "physical", equip: "physique",
    mot: "le physique", canaux: ["seance", "corps"] },
  /* /!\ L'AXE QUI ÉTAIT MORT. Il a maintenant sa famille de séance
     (« mental »), son domaine moteur (fight_iq et discipline, lus douze
     fois par engine.js et par le filtre d'écoute du coin) et son
     matériel (la salle vidéo). On le branche AVANT de le dessiner :
     l'ordre inverse est exactement ce qui a produit une case cliquable
     qui coûtait 7,4 % de rendement et ne rendait rien. */
  { cle: "mental", lib: "Préparation mentale", quoi: "lecture du combat, sang-froid, poids",
    fam: "mental", dom: "mental", equip: "video",
    mot: "le mental", canaux: ["seance", "coin", "poids"] },
];

/** Les groupes encadrés. /!\ « tous » A DISPARU DU MODÈLE : ce n'était
 *  pas un troisième groupe, c'était DEUX cases tenues par le même homme —
 *  et le confondre avec un groupe est ce qui rendait la grille inséparable
 *  et le coût de la dispersion invisible. On le DÉRIVE (voir couvre()). */
const GROUPES = ["amateur", "pro"];

/** Les canaux par où un coach sort dans le jeu. Liste FERMÉE : le banc 38
 *  exige que chaque axe déclare au moins un canal, et que chaque canal
 *  déclaré mesure un écart non nul. Un canal qui ne bouge rien est un
 *  attribut mort qui a réussi à se cacher. */
const CANAUX = ["seance", "coin", "corps", "poids"];

/* --- les accesseurs dérivés. AUCUNE de ces tables n'est réécrite. ---- */
const parCle = {};
const parFam = {};
for (const a of AXES) { parCle[a.cle] = a; if (a.fam) parFam[a.fam] = a; }

const axe = (cle) => parCle[cle] || null;
const axeDeFam = (fam) => (parFam[fam] ? parFam[fam].cle : null);
const famDe = (cle) => (parCle[cle] ? parCle[cle].fam : null);
const domDe = (cle) => (parCle[cle] ? parCle[cle].dom : null);
const equipDe = (cle) => (parCle[cle] ? parCle[cle].equip : null);
const motDe = (cle) => (parCle[cle] ? parCle[cle].mot : "");
const libDe = (cle) => (parCle[cle] ? parCle[cle].lib : "?");
const canauxDe = (cle) => (parCle[cle] ? parCle[cle].canaux : []);
const FAMILLES = AXES.map((a) => a.fam).filter(Boolean);

/**
 * Les axes d'un coach. /!\ TROIS SOURCES SE DISPUTAIENT CE CHAMP :
 * c.axe (écrit par la fiche), c.axes (écrit par la grille) et
 * SALLE.roleStaff (écrit par un bouton hérité). Le bouton « Sur quoi il
 * insiste » écrivait c.axe, que plus personne ne lisait dès que la grille
 * avait posé c.axes une fois : la puce devenait décorative sans le dire.
 * ICI c.axes FAIT FOI, et c.axe n'est plus qu'un repli de vieille
 * sauvegarde.
 */
function axesDe(c) {
  if (!c) return [];
  if (c.axes && c.axes.length) return c.axes.filter((x) => !!parCle[x]);
  return parCle[c.axe] ? [c.axe] : [];
}
const axePrincipal = (c) => axesDe(c)[0] || null;

/** Les groupes d'un coach. Un vieux « tous » se lit comme les deux. */
function groupesDe(c) {
  if (!c) return [];
  if (c.groupes && c.groupes.length) return c.groupes.filter((g) => GROUPES.indexOf(g) >= 0);
  if (c.groupe === "tous") return GROUPES.slice();
  return GROUPES.indexOf(c.groupe) >= 0 ? [c.groupe] : [];
}

/** Est-ce que cet homme tient cette case ? */
const couvre = (c, cleAxe, groupe) =>
  axesDe(c).indexOf(cleAxe) >= 0 && groupesDe(c).indexOf(groupe) >= 0;

/** Combien de cases il tient. C'est la mesure de sa dispersion. */
const cases = (c) => axesDe(c).length * groupesDe(c).length;

/* ==================================================================== */
/* LE JETON — la place du tirage (règle 5 du carnet)                     */
/* ==================================================================== */
/** Un entier stable dérivé de deux choses. Le même coach voit le même
 *  homme de la même façon d'une semaine sur l'autre : pas d'alea. */
function jeton(a, b) {
  let h = 2166136261 >>> 0;
  const s = String(a) + "|" + String(b);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/* ==================================================================== */
/* CE QU'UN COACH VAUT — chaque facteur est un attribut qui SORT          */
/* ==================================================================== */

/**
 * L'ATTENTION. /!\ LE CŒUR DU CHANTIER. Un homme qui tient dix cases ne
 * vaut pas dix fois un homme qui en tient une : il vaut moins qu'un seul,
 * partout. Mesuré sur l'ancien code : un coach seul sur les 5 axes et les
 * 2 groupes rendait encore 72 % de cinq spécialistes pour un cinquième du
 * salaire — la dispersion était donc la stratégie GAGNANTE, l'inverse de
 * ce que la grille raconte.
 * Racine carrée : 1 case = 1,00 · 2 = 0,71 · 4 = 0,50 · 10 = 0,32.
 * Deux cases restent tenables (c'est un vrai choix) ; dix ne le sont pas.
 */
function attention(c) {
  const n = Math.max(1, cases(c));
  return 1 / Math.sqrt(n);
}

/**
 * L'ENTENTE. /!\ ELLE N'ACHETAIT RIEN : ±4,7 % sur une séance, et 40 des
 * 100 points de la jauge ne changeaient strictement rien. À côté, celle
 * d'un COMBATTANT vaut 42 % de salaire et son départ. On l'ouvre :
 * 0,78 à zéro, 1,00 à 55 (le point de départ), 1,18 au sommet.
 * Un coach aigri fait vraiment des séances aigres, et un coach de la
 * maison rend vraiment plus que ce qu'on le paie.
 */
function fEntente(c) {
  if (!c || c.moi) return 1;
  const e = c.entente === undefined ? 55 : Math.max(0, Math.min(100, c.entente));
  return e <= 55 ? 0.78 + (e / 55) * 0.22 : 1 + ((e - 55) / 45) * 0.18;
}

/**
 * LE MÉTIER. /!\ IL ÉTAIT COSMÉTIQUE : niveauStaff l'ignorait, et rien
 * n'empêchait un formateur à 25 de préparer un combat de titre. Or c'est
 * la distinction que Mael a demandée en premier — « un coach qui sait
 * dégrossir des débutants n'est pas un coach qui affûte des compétiteurs ».
 * Elle devient une SÉQUENCE DE JEU : on embauche un formateur pour monter
 * une salle, on paie un homme de compétition quand on a des pros à
 * préparer, et garder le premier sur le groupe pro coûte vraiment.
 */
function fMetier(c, groupe) {
  const comp = c && c.metier === "competition";
  if (groupe === "pro") return comp ? 1.12 : 0.80;
  return comp ? 0.88 : 1.12;
}

/** L'ÂGE. Un homme de 66 ans n'a plus le tapis dans les jambes — mais il
 *  a l'œil. Il perd sur la séance, jamais sur ce qu'il voit (canal
 *  « coin »), et c'est ce qui rend un vieux coach encore désirable. */
function fAge(c) {
  const a = (c && c.age) || 40;
  return a <= 58 ? 1 : a >= 70 ? 0.80 : 1 - (a - 58) / 60;
}

/**
 * CE QUE CET HOMME VAUT SUR CETTE CASE. Hors de sa spécialité il ne vaut
 * que 55 % de lui-même — et c'était déjà vrai ; ce qui était faux, c'est
 * que facteursSeance REMULTIPLIAIT ensuite la spécialité par 1,12/0,95
 * depuis une table de noms propres. Elle ne se compte qu'ici, une fois.
 */
function valeurSur(c, cleAxe, groupe) {
  if (!c) return 0;
  const dessus = axesDe(c).indexOf(cleAxe) >= 0;
  const dansLeGroupe = groupesDe(c).indexOf(groupe) >= 0;
  if (!dansLeGroupe) return 0;
  const brut = Math.max(0, Math.min(100, c.niveau || 0));
  return brut * attention(c) * fEntente(c) * fMetier(c, groupe) * fAge(c)
    * (dessus ? 1 : 0.55);
}

/* ==================================================================== */
/* LA CARTE — dix cases, et le budget n'en remplit jamais dix            */
/* ==================================================================== */
/** Les états d'une case. Ils se disent en mots, jamais en chiffres. */
const ETATS = {
  trou:   { mot: "personne", sous: "Ils se débrouillent seuls." },
  maigre: { mot: "au rabais", sous: "Quelqu'un passe, sans plus." },
  juste:  { mot: "juste", sous: "C'est tenu, sans marge." },
  tenu:   { mot: "tenu", sous: "Il y a un homme dessus, et ça se voit." },
  solide: { mot: "solide", sous: "C'est ce qu'on vient chercher ici." },
};

function etatDe(niv, qui) {
  if (!qui.length) return "trou";
  if (niv < 28) return "maigre";
  if (niv < 45) return "juste";
  if (niv < 66) return "tenu";
  return "solide";
}

/**
 * LA CARTE DE COUVERTURE — l'objet que tout le jeu lit.
 * @param {Array} staff  le tableau des coachs
 * @returns {object} { cases: {"axe|groupe": {...}}, trous, doubles, total }
 */
function couverture(staff) {
  const st = (staff || []).filter(Boolean);
  const out = { cases: {}, trous: [], doubles: [], morts: [], total: 0 };
  for (const a of AXES) {
    for (const g of GROUPES) {
      const cle = a.cle + "|" + g;
      const qui = st.filter((c) => couvre(c, a.cle, g));
      /* /!\ LE MEILLEUR FAIT LA CASE, LE SECOND N'AJOUTE QUE SES YEUX.
         Deux hommes sur la même case, ce n'est pas deux fois mieux : le
         second corrige ce que le premier n'a pas vu, et c'est tout —
         pendant qu'il coûte un salaire entier. C'est l'arbitrage que la
         carte doit rendre visible. */
      const valeurs = qui.map((c) => valeurSur(c, a.cle, g)).sort((x, y) => y - x);
      /* Le repli : quelqu'un du groupe, hors de sa spécialité. */
      const secours = st.filter((c) => groupesDe(c).indexOf(g) >= 0 && !couvre(c, a.cle, g))
        .map((c) => valeurSur(c, a.cle, g) || (Math.max(0, Math.min(100, c.niveau || 0))
          * attention(c) * fEntente(c) * fMetier(c, g) * fAge(c) * 0.55))
        .sort((x, y) => y - x)[0] || 0;
      let niv = valeurs.length ? valeurs[0] + (valeurs[1] || 0) * 0.14 : secours;
      niv = Math.max(0, Math.min(100, Math.round(niv * 10) / 10));
      const etat = etatDe(niv, qui);
      out.cases[cle] = { axe: a.cle, groupe: g, niveau: niv, etat,
                         qui: qui.map((c) => c.nom), double: qui.length > 1,
                         secours: !qui.length && secours > 0 };
      if (etat === "trou") out.trous.push(cle);
      if (qui.length > 1) out.doubles.push(cle);
      out.total += niv;
    }
  }
  /* Un coach qui ne tient AUCUNE case est payé pour rien. Le jeu doit le
     dire — c'est exactement la classe de défaut que le carnet grave. */
  for (const c of st) if (!c.moi && cases(c) === 0) out.morts.push(c.nom);
  return out;
}

/**
 * CE QUE VAUT L'ENCADREMENT D'UNE SÉANCE. Le seul point d'entrée.
 * /!\ L'AMPLITUDE EST CONSERVÉE (0,55 → 1,45) : le chantier corrige QUI
 * décide du facteur, pas combien il pèse. Toucher les deux à la fois
 * rendrait la mesure avant/après illisible — et le carnet interdit de
 * conclure sur un écart qu'on n'a pas isolé.
 * /!\ ET LE PLANCHER TOMBE DE 20 À 0. L'ancien Math.max(20, …) amputait
 * tout le bas de la courbe : une salle SANS aucun coach rendait déjà 0,73,
 * soit la moitié du chemin vers le meilleur staff du jeu — donc ne pas
 * embaucher était presque gratuit. Sans personne, on rend 0,55.
 */
function encadrement(couv, groupe, fam) {
  return 0.55 + niveauEncadrement(couv, groupe, fam) / 100 * 0.90;
}

/**
 * LE NIVEAU DE CE QUI ENCADRE CETTE SÉANCE, de 0 à 100.
 * /!\ MÊME LECTURE QUE encadrement(), SORTIE BRUTE. Le facteur de séance
 * (0,55 → 1,45) dit à quelle VITESSE on progresse ; ce niveau-ci sert à
 * dire JUSQU'OÙ (carriere.plafond). Deux questions différentes, une
 * seule source — la répéter serait la cinquième copie de trop.
 */
function niveauEncadrement(couv, groupe, fam) {
  const cleAxe = axeDeFam(fam);
  if (!cleAxe) return 0;                    // famille inconnue : personne n'encadre
  const c = couv && couv.cases ? couv.cases[cleAxe + "|" + groupe] : null;
  return Math.max(0, Math.min(100, c ? c.niveau : 0));
}

/* ==================================================================== */
/* LE BARÈME — la loi, pour la fabrication ET la retarification          */
/* ==================================================================== */
/** /!\ INCHANGÉ DANS SA FORME : l'accélération au-dessus de 70 est un
 *  réglage validé (cas 99, cas 114). Ce qui change, c'est qu'il est
 *  maintenant LU d'un seul endroit. */
function salaire(niveau, comp) {
  const n = Math.max(0, Math.min(100, niveau || 0));
  return Math.round(comp
    ? 20 + Math.pow(n, 1.55) / 18 + (n > 70 ? Math.pow(n - 70, 2) * 2.3 : 0)
    : 12 + n * 0.7 + (n > 70 ? Math.pow(n - 70, 2) * 0.8 : 0));
}

/* ==================================================================== */
/* CE QU'ON SAIT DE LUI — jamais un chiffre                              */
/* ==================================================================== */
/** L'estimation floue, DÉTERMINISTE : deux lectures le même jour donnent
 *  la même phrase, sinon l'avis sauterait à chaque affichage. */
function estimation(c, flou) {
  const h = jeton(c.nom, c.vu || 0);
  const biais = flou ? ((h % (flou * 2 + 1)) - flou) : 0;
  const n = Math.max(10, Math.min(99, (c.niveau || 0) + biais));
  return n >= 85 ? "c'est un très grand technicien"
    : n >= 72 ? "il sait vraiment ce qu'il fait"
    : n >= 58 ? "il est solide"
    : n >= 44 ? "il fait le travail, sans plus"
    : n >= 30 ? "il a des lacunes"
    : "il n'est pas au niveau";
}

/** On ne l'embauche pas sur un chiffre : on le découvre en le regardant
 *  travailler. `vu` compte les semaines passées avec lui. */
function avis(c) {
  const vu = (c && c.vu) || 0;
  if (vu < 4) return { mot: "tu ne le connais pas encore", sur: 0 };
  if (vu < 12) return { mot: estimation(c, 22), sur: 1 };
  if (vu < 30) return { mot: estimation(c, 12), sur: 2 };
  if (vu < 60) return { mot: estimation(c, 6), sur: 3 };
  return { mot: estimation(c, 0), sur: 4 };
}

/* ==================================================================== */
/* SA CARRIÈRE — cinq phases, en mots                                    */
/* ==================================================================== */
/** /!\ CE QUI FAIT QU'UNE SCÈNE RELUE EN ANNÉE 8 NE SE LIT PAS COMME EN
 *  ANNÉE 3 : ce n'est pas la scène qui change, c'est l'homme. C'est la
 *  seule réponse tenable à « est-ce que ça radote au bout de trois
 *  saisons » — et elle ne coûte pas une réplique de plus. */
const PHASES = ["arrive", "monte", "sommet", "apres", "fin"];
function carriere(c) {
  const age = (c && c.age) || 40;
  const sem = (c && c.semainesMaison) || 0;
  const marge = Math.max(0, (c && c.potentiel !== undefined ? c.potentiel : 60) - (c ? c.niveau || 0 : 0));
  if (age >= 60) return { phase: "fin", mot: "Il compte les saisons qui restent." };
  if (age >= 54) return { phase: "apres", mot: "Il commence à parler de l'après." };
  if (sem < 26) return { phase: "arrive", mot: "Il arrive. Il regarde comment ça marche ici." };
  if (marge >= 12) return { phase: "monte", mot: "Il monte. On ne sait pas encore jusqu'où." };
  return { phase: "sommet", mot: "Il est à son sommet. C'est maintenant qu'il faut le garder." };
}

/**
 * LE PAS HEBDOMADAIRE DE SA PROGRESSION. Pur : il rend le nouveau niveau,
 * il n'écrit rien.
 * /!\ LA VITESSE POUVAIT ÊTRE NÉGATIVE. L'ancienne re-dérivation
 * calculait vitesse = 0,45 + ((h>>7) % 125)/100 sur un entier signé :
 * dix coachs sur trente-deux REGRESSAIENT à vie, et la valeur partait
 * figée dans la sauvegarde. Ici la vitesse est bornée à la lecture.
 */
function pas(c) {
  if (!c) return 0;
  const niveau = c.niveau || 0;
  const potentiel = c.potentiel === undefined ? niveau : c.potentiel;
  const vitesse = Math.max(0.3, Math.min(1.8, c.vitesse === undefined ? 1 : c.vitesse));
  const ecart = Math.max(0, potentiel - niveau);
  if (ecart <= 0) return niveau;
  const marge = Math.min(1, 0.22 + ecart / 40);
  const age = c.age || 35;
  const fA = age <= 48 ? 1 : age >= 62 ? 0 : (62 - age) / 14;
  /* /!\ ON N'APPREND PAS EN COURANT PARTOUT : la dispersion coûte ici
     aussi. Un homme sur six cases n'apprend plus rien — et c'est juste. */
  const fDisp = 1 / Math.sqrt(Math.max(1, cases(c)));
  const d = 0.055 * marge * vitesse * fA * fDisp;
  return Math.min(potentiel, Math.round((niveau + d) * 100) / 100);
}

/* ==================================================================== */
/* L'ENTENTE — un résidu des faits, jamais une jauge cliquable           */
/* ==================================================================== */
/**
 * LE SOCLE : la valeur vers laquelle son entente GLISSE, dérivée de sa
 * situation réelle.
 * /!\ SANS LUI, L'ENTENTE EST UN CLIQUET. Mesuré : le café donnait +3
 * par semaine, gratuitement, contre -0,9 d'érosion au pire — donc tout le
 * système d'entente des coachs était annulé par un clic hebdomadaire, et
 * la victoire d'un élève ajoutait +5 à TOUS les coachs d'un coup. Un
 * café ne répare pas un salaire : il rapproche du socle, il ne le dépasse
 * jamais durablement.
 *
 * @param {object} c
 * @param {object} f  les faits : { bareme, casesTenues, semainesMaison,
 *                    titres, collegueRemercie, paroleTenue, paroleTrahie }
 */
function socle(c, f) {
  const x = f || {};
  let s = 55;
  /* L'argent, et il connaît le marché. */
  if (x.bareme) {
    const r = (c.salaire || 0) / x.bareme;
    s += r >= 1.15 ? 12 : r >= 0.98 ? 6 : r >= 0.85 ? 0 : r >= 0.7 ? -9 : -20;
  }
  /* La charge : ce qu'on lui demande de porter. */
  const n = cases(c);
  s += n <= 1 ? 5 : n === 2 ? 0 : n <= 4 ? -8 : -16;
  /* La maison : les années comptent, et elles ne se rattrapent pas. */
  const ans = Math.floor((c.semainesMaison || 0) / 52);
  s += Math.min(14, ans * 2.2);
  /* Ce qui s'est passé : les titres de ses hommes, la parole donnée. */
  s += Math.min(10, (x.titres || 0) * 4);
  s += Math.min(12, (x.paroleTenue || 0) * 4);
  s -= Math.min(24, (x.paroleTrahie || 0) * 8);
  s -= Math.min(12, (x.collegueRemercie || 0) * 3);
  return Math.max(0, Math.min(100, Math.round(s * 10) / 10));
}

/** Un pas vers le socle. Lent : une relation ne se répare pas en une
 *  semaine, et elle ne s'effondre pas en une semaine non plus. */
function glisse(valeur, vers) {
  const d = vers - valeur;
  if (Math.abs(d) < 0.05) return vers;
  return Math.round((valeur + d * 0.10) * 100) / 100;
}

const motEntente = (v) =>
  v >= 80 ? "Il est de la maison — il resterait même à moitié prix."
    : v >= 60 ? "Il est bien ici. Ça se sent aux séances."
    : v >= 40 ? "Il fait le travail. Sans plus."
    : v >= 25 ? "Il traîne les pieds. Quelque chose le ronge."
    : "Il regarde ailleurs. Ce n'est plus qu'une question de temps.";

/* ==================================================================== */
/* SA MÉTHODE — deux coachs du même niveau ne fabriquent pas le même homme */
/* ==================================================================== */
/**
 * /!\ LA SIGNATURE. Aujourd'hui la séance répartit son gain sur 2 ou 3
 * clés TIRÉES DU JOUR : le coach ne décide de rien, il multiplie. Ici il
 * porte trois clés de prédilection, DÉRIVÉES de son jeton — donc stables
 * à vie, jamais tirées — et la séance qu'il encadre les sert d'abord.
 * C'est ce qui fait qu'on reconnaît la main de Da Costa sur ses trois
 * gars, et c'est la seule chose qui rende deux recrutements différents
 * autrement que par un chiffre caché.
 * @param {string[]} clesDomaine  les clés de stat disponibles du domaine
 */
function signature(c, clesDomaine) {
  const l = (clesDomaine || []).slice();
  if (!c || l.length <= 3) return l;
  const h = jeton(c.nom || "?", "methode");
  const out = [];
  for (let i = 0; i < 3 && l.length; i++) {
    const k = (h >>> (i * 5)) % l.length;
    out.push(l.splice(k, 1)[0]);
  }
  return out;
}

/** La part du gain qui va sur la signature. Un grand coach imprime plus
 *  fort : c'est la différence entre « il progresse » et « il devient
 *  quelqu'un de reconnaissable ». */
function empreinte(c) {
  const n = Math.max(0, Math.min(100, (c && c.niveau) || 0));
  return 0.45 + n / 100 * 0.30;              /* 0,45 → 0,75 */
}

module.exports = {
  AXES, GROUPES, CANAUX, FAMILLES, ETATS, PHASES,
  axe, axeDeFam, famDe, domDe, equipDe, motDe, libDe, canauxDe,
  axesDe, axePrincipal, groupesDe, couvre, cases,
  jeton, attention, fEntente, fMetier, fAge, valeurSur,
  etatDe, couverture, encadrement,
  salaire, estimation, avis, carriere, pas, niveauEncadrement,
  socle, glisse, motEntente, signature, empreinte,
};
