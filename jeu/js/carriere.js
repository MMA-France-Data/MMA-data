/**
 * carriere.js — L'AGE, LE POTENTIEL CACHE, LES AXES.
 *
 * Module natif JS. /!\ IL NE TOUCHE AUCUN FICHIER GELE. Il pose par-dessus
 * un combattant genere ce que le MOTEUR N'A PAS BESOIN DE SAVOIR : depuis
 * quand il s'entraine, jusqu'ou il peut aller, et ou il progresse vite.
 * Meme forme que grappling.js — on pose la matiere, on la mesure, et on ne
 * rouvre le gel que si ca devient necessaire.
 *
 * ===================================================================
 * /!\ LE NIVEAU NE SE TIRE PAS — IL SE DEDUIT D'UNE HISTOIRE
 * ===================================================================
 * C'est le renversement demande par Mael. On ne tire pas "un homme a 62" :
 * on tire un age, un age de debut et un potentiel, et le niveau TOMBE de
 * ces trois-la.
 * Consequence directe : un homme de 30 ans qui commence n'est PAS un homme
 * de 20 ans avec des stats basses. Il a moins d'annees devant lui, il
 * progresse plus lentement, et il finira probablement loisir ou amateur.
 * Un autre de 30 ans qui s'entraine depuis douze ans est presque a son
 * plafond.
 * ET C'EST CE QUI DONNE UN METIER AU SCOUTING : on ne recrute plus sur une
 * note, on recrute sur UN AGE ET UNE MARGE. Un 19 ans a 55 vaut mieux qu'un
 * 29 ans a 62.
 */

const { alea } = require("./alea.js");

/** Les quatre domaines qui progressent. Le clinch suit la lutte. */
const DOMAINES = ["striking", "wrestling", "ground", "physical"];

/**
 * /!\ RYTHME CALIBRE APRES MESURE — la premiere version etait absurde.
 * A 0,42 point/semaine x axe x coach, un jeune gagnait 31 points de frappe
 * en UN AN et saturait a 99 en deux ans. Un vrai combattant met CINQ A HUIT
 * ANS pour aller de debutant a niveau international, et ne sature jamais.
 * 0,13 point/semaine = ~6,8 points par an sur le domaine travaille.
 */
const RYTHME_HEBDO = 0.13;

/**
 * /!\ UN JEUNE DE 18 ANS EST AVANTAGE sur un de 25 au meme stade, et un
 * TARD-VENU NE RATTRAPE JAMAIS. La technique plafonne vers 32-34 ; apres,
 * on entretient, puis on decline.
 */
function facteurAge(age) {
  // /!\ ADOUCI APRES LA REMARQUE DE MAEL : Ciryl Gane a commence le MMA a
  // 24 ANS et il est devenu champion. Un debut tardif est un handicap, pas
  // une condamnation. La premiere version (0,80 des 29 ans, 0,30 apres 35)
  // rendait ce parcours impossible a fabriquer.
  if (age <= 20) return 1.30;
  if (age <= 24) return 1.18;
  if (age <= 28) return 1.05;
  if (age <= 32) return 0.88;
  if (age <= 35) return 0.68;
  return 0.45;
}

/**
 * LES CONDITIONS DANS LESQUELLES IL A GRANDI.
 *
 * /!\ UN COMBATTANT GENERE N'A PAS JUSTE UN NIVEAU — IL A EU UN PARCOURS,
 * et son niveau en decoule. Deux hommes de meme age, meme potentiel, memes
 * annees : l'un sort a 88, l'autre a 71 parce qu'il a traine dans un club
 * mediocre.
 * C'est ce qui donne son metier au scout : quand il voit un homme de 26 ans
 * a 71 avec une grosse marge, il peut COMPRENDRE pourquoi — mal encadre —
 * et miser dessus, parce que LUI va bien l'encadrer.
 *
 * /!\ ET LES PARTENAIRES COMPTENT AUTANT QUE LE COACH (remarque de Mael).
 * Gane et Ngannou sortent de la MEME PETITE SALLE et finissent par
 * s'affronter pour la ceinture. Ils se sont tires vers le haut parce qu'ils
 * s'entrainaient ensemble — les salles regroupent par POIDS ET PAR NIVEAU.
 * Un grand club ou l'on est seul a sa categorie vaut moins qu'un petit club
 * avec un monstre en face.
 * => UNE PETITE SALLE PEUT SORTIR DES GENIES. La correlation entre la taille
 *    du club et le niveau atteint doit rester LACHE, jamais mecanique.
 */
function tirerParcours() {
  // /!\ COMPETENCE ET REPUTATION SONT DEUX CHOSES (correction de Mael).
  // Premiere version : une seule valeur, donc un coach peu connu ETAIT un
  // coach faible. Faux — Fernand Lopez n'etait pas mediocre, il etait
  // INCONNU. Il sortait deux champions du monde d'un garage a Paris.
  // Ce qui lui manquait, c'etaient les moyens et le nom, pas le talent.
  //
  // /!\ MAIS LA REPUTATION N'EST PAS DU BRUIT : c'est un SIGNAL BRUITE.
  // "Quelqu'un qui a fait ses preuves est un bon coach quoi qu'il arrive,
  // peut-etre un peu surcote parfois." La reputation BORNE PAR LE BAS sans
  // garantir le haut :
  //     repute  -> forcement bon, parfois un peu moins que son nom
  //     inconnu -> n'importe quoi, et c'est LA que se cachent les affaires
  // Consequence de jeu : on ne se fait jamais avoir en payant cher, on paie
  // juste parfois trop. Et le seul endroit ou faire une AFFAIRE, c'est dans
  // l'inconnu — avec le risque qui va avec.
  const reputeCoach = Math.max(0, Math.min(1, 0.45 + alea.gauss(0, 1) * 0.25));
  const coach = reputeCoach > 0.65
    // repute : plancher haut, et un peu de surcote possible
    ? Math.max(0.55, Math.min(1.0, reputeCoach - 0.10 + alea.random() * 0.22))
    // inconnu : tout est possible, des mediocres aux Fernand Lopez
    // /!\ UN SUR VINGT, PAS UN SUR CINQ. Premiere version : 19 % des
    // inconnus depassaient 0,85 — mais ces coachs existent aussi dans TOUTES
    // les autres salles et ils circulent. Un sur cinq multiplie par tous les
    // clubs du monde, ca fait des centaines de perles disponibles et la
    // rarete disparait. A un sur vingt, en trouver un reste un vrai coup de
    // chance sur une carriere de manager.
    : (alea.random() < 0.05
        ? 0.86 + alea.random() * 0.13          // la perle, rare
        : Math.max(0.30, Math.min(0.84, 0.32 + alea.random() * 0.50)));

  // /!\ PETIT NE VEUT PAS DIRE MAUVAIS. Un garage avec le bon homme dedans
  // bat une grosse structure sans ame — c'est litteralement l'histoire de
  // la MMA Factory. La taille du club ne dit que ses MOYENS.
  const club = Math.max(0.30, Math.min(1.0, 0.50 + alea.gauss(0, 1) * 0.20));
  // les partenaires : c'est le plus VOLATIL. On peut tomber sur un monstre
  // a son poids dans une salle de quartier, ou etre seul dans un grand club.
  const partenaires = Math.max(0.25, Math.min(1.0, 0.30 + alea.random() * 0.75));
  // l'orientation : a-t-on travaille ses axes, ou perdu des annees ailleurs
  const orientation = 0.45 + alea.random() * 0.55;
  // les accidents : blessures, arrets, vie personnelle
  const accidents = alea.random() < 0.22 ? 0.62 + alea.random() * 0.25 : 1.0;
  return { club, coach, reputeCoach, partenaires, orientation, accidents };
}

/**
 * Le potentiel : un BUDGET PAR DOMAINE, pas un plafond par stat. Un homme a
 * 82 de potentiel peut monter a 95 en lutte s'il reste bas ailleurs.
 * /!\ IL N'EST PAS CORRELE A L'AGE DE DEBUT : c'est du talent brut. Mais
 * commencer tard fait qu'on ne l'atteint jamais.
 */
function tirerPotentiel() {
  // /!\ LA MOYENNE EST CELLE D'UNE POPULATION DE COMBATTANTS, PAS DE LA
  // POPULATION GENERALE. Premiere version a 52 : personne ne depassait 65
  // apres treize ans de pratique, alors que les champions du monde sont a
  // 88-96. Le potentiel PLAFONNAIT tout le monde.
  // A 74 de moyenne avec un ecart-type de 12 : le median finit vers 75-80,
  // le 99e centile vers 97. Le talent redevient rare sans etre absent.
  // /!\ RELEVE A 80 : le potentiel est ce qu'on atteindrait TOUT ALIGNE —
  // meilleur coach, meilleurs partenaires, axes trouves, aucune blessure.
  // Ca n'arrive presque jamais. Le niveau REELLEMENT atteint est donc bien
  // en dessous, et c'est le parcours qui fait la difference.
  const base = 80 + alea.gauss(0, 1) * 11;
  const p = {};
  for (const d of DOMAINES)
    p[d] = Math.max(35, Math.min(99, Math.round(base + alea.gauss(0, 1) * 9)));
  return p;
}

/**
 * Les axes : ou il progresse vite. C'est CA le talent cache que le joueur
 * doit deviner en regardant l'historique par domaine.
 * Deux hommes de meme potentiel n'atteignent pas le meme niveau selon qu'on
 * a trouve leurs axes ou non. UN TALENT GACHE FINIT A 80.
 */
function tirerAxes() {
  const a = {};
  for (const d of DOMAINES) a[d] = 0.70 + alea.random() * 0.75;   // 0,70 a 1,45
  return a;
}

/**
 * Fabrique l'histoire d'un combattant deja genere, et EN DEDUIT son niveau.
 *
 * @param {object} f        un combattant sorti de generer_combattant
 * @param {object} [opts]   {age, ageDebut, potentiel, axes, repartition}
 * @returns {object} la carriere, aussi posee sur f.carriere
 */
function poser(f, opts = {}) {
  const age = opts.age !== undefined ? opts.age : 19 + Math.trunc(alea.random() * 18);
  // /!\ LE JEU DOIT SORTIR DES DEBUTANTS DE 25, 30 ANS ET PLUS. Sans ca on
  // n'a que des trajectoires ideales, et le scouting n'a rien a arbitrer.
  const ageDebut = opts.ageDebut !== undefined ? opts.ageDebut
    : Math.max(14, Math.min(age, 14 + Math.trunc(Math.pow(alea.random(), 1.6) * 18)));
  const potentiel = opts.potentiel || tirerPotentiel();
  const axes = opts.axes || tirerAxes();
  const parcours = opts.parcours || tirerParcours();
  // /!\ CE MULTIPLICATEUR EST CE QUI SEPARE LE TALENT DU NIVEAU ATTEINT.
  // Le coach pese le plus (mesure du 09/08 : x2,6 du pire au meilleur,
  // contre x1,5 pour le materiel), les partenaires presque autant.
  const conditions = (0.55 + parcours.coach * 0.55)
                   * (0.70 + parcours.partenaires * 0.42)
                   * (0.80 + parcours.club * 0.22)
                   * parcours.accidents;

  // Ce qu'il a travaille pendant ces annees. Par defaut, un peu de tout avec
  // une dominante — personne ne s'entraine a parts egales.
  let rep = opts.repartition;
  if (!rep) {
    const brut = DOMAINES.map(() => 0.3 + alea.random());
    const dom = Math.trunc(alea.random() * DOMAINES.length);
    brut[dom] *= 2.2;
    const s = brut.reduce((a, b) => a + b, 0);
    rep = {}; DOMAINES.forEach((d, i) => { rep[d] = brut[i] / s; });
  }

  // --- LA DEDUCTION : annees x rythme x axes x age, plafonne par le potentiel
  const niveaux = {};
  for (const d of DOMAINES) {
    // /!\ 32, PAS 22 (correction Mael, 09/08) : un homme qui n'a jamais
    // pratique a quand meme un corps et des reflexes. A 22, un debutant
    // etait un infirme.
    // MESURE 4000 carrieres, avant -> apres : debutants 22,9 -> 32,8 ·
    // median 51,0 -> 56,5 · veterans 10 ans+ 66,3 -> 69,5 · max 99 -> 99.
    // Le +10 du depart ne s'efface PAS completement en carriere (la
    // progression au prorata de la marge l'attenue sans l'annuler) : toute
    // la population monte un peu. Assume — aucun calibrage gele ne porte
    // sur les niveaux de population.
    let n = 32;                                   // le niveau d'un homme qui n'a jamais pratique
    for (let a = ageDebut; a < age; a++) {
      const marge = Math.max(0, potentiel[d] - n);
      // /!\ ON PROGRESSE AU PRORATA DE CE QU'IL RESTE A GAGNER : c'est ce
      // qui empeche la saturation et fait qu'on n'atteint jamais tout a
      // fait son plafond. Les derniers points sont les plus durs.
      // l'orientation dit s'il a travaille LA OU il avait des facilites
      const vise = 1 + (axes[d] - 1.07) * parcours.orientation * 1.6;
      const gain = 52 * RYTHME_HEBDO * rep[d] * DOMAINES.length
                 * axes[d] * vise * conditions * facteurAge(a)
                 * (0.25 + 0.75 * marge / 60);
      n = Math.min(potentiel[d], n + gain);
    }
    // /!\ LE CORPS DECLINE, LA TECHNIQUE TIENT (ajout du 09/08, demande de
    // Mael sur la pyramide des ages). Sans declin, un homme de 37 ans garde
    // son niveau de pointe : les rosters du sommet devenaient une maison de
    // retraite (60 % de 33+ a l'AFC) parce que les plus vieux etaient
    // mecaniquement les meilleurs disponibles. Le physique s'erode des 33
    // ans, la technique bien plus tard et bien moins — un vieux champion
    // reste dangereux, il n'est plus entier.
    if (d === "physical") n -= Math.max(0, age - 33) * 1.1;
    else n -= Math.max(0, age - 35) * 0.5;
    niveaux[d] = Math.max(20, n);
  }

  // On applique a l'homme : chaque domaine est mis a l'echelle deduite.
  for (const d of DOMAINES) caler(f[d], niveaux[d]);
  caler(f.clinch, (niveaux.striking + niveaux.wrestling) / 2);

  // /!\ LE FIGHT IQ MONTE TOUJOURS — c'est l'experience, pas le corps. Il
  // depend des COMBATS plus que des annees : un homme a trente combats a vu
  // plus qu'un homme du meme age a huit combats.
  const annees = age - ageDebut;
  f.mental.fight_iq = Math.max(20, Math.min(99,
    Math.round(38 + annees * 2.6 + alea.gauss(0, 1) * 7)));

  // /!\ LE MENTON NE MONTE PAS, IL S'USE. C'est souvent la premiere chose
  // qui lache. Chantier L : l'usure accumulee.
  // /!\ L'USURE DU MENTON COMMENCE TARD ET RESTE LENTE. Premiere version :
  // erosion des la 6e annee de pratique, un homme de 26 ans tombait a 45 de
  // menton — absurde, il est dans sa force. Ce sont les ANNEES DE COMBAT
  // apres 28 ans qui usent, pas l'entrainement.
  f.physical.chin = Math.max(30,
    Math.round(f.physical.chin - Math.max(0, age - 28) * 1.4));

  f._niv = null;
  const c = { age, ageDebut, annees, potentiel, axes, parcours, conditions,
              repartition: rep, niveaux };
  f.carriere = c;
  return c;
}

/** Met un bloc de stats a l'echelle voulue, en gardant son relief. */
function caler(bloc, cible) {
  const cles = Object.keys(bloc).filter(k => typeof bloc[k] === "number");
  if (!cles.length) return;
  const moy = cles.reduce((s, k) => s + bloc[k], 0) / cles.length;
  if (moy <= 0) return;
  const f = cible / moy;
  for (const k of cles) bloc[k] = Math.max(15, Math.min(99, Math.round(bloc[k] * f)));
}

/* ==================================================================== */
/* JUSQU'OÙ IL PEUT MONTER — la loi du plafond (Mael, 03/09)             */
/* ==================================================================== */
/**
 * /!\ CE QUI ETAIT MESURE, ET QUI A DECIDE DE CETTE LOI.
 * Comparaison de deux carrieres de six ans, memes decisions, meme monde,
 * seul le staff changeant (coachs a 30 contre coachs a 88) : 3 POINTS
 * D'ECART. Mael : « il faut un ecart bien plus grand que ca ».
 * La cause n'etait pas un reglage trop doux, elle etait structurelle :
 * appliquerTravail bornait TOUT LE MONDE a 96 en dur, et la marge
 * decroissante (96-v)/96 rattrape n'importe quel retard pourvu qu'on
 * attende. Le talent changeait la vitesse, le staff changeait la vitesse,
 * l'age changeait la vitesse — ET RIEN NE CHANGEAIT LA DESTINATION.
 * Pendant ce temps `carriere.potentiel` — un potentiel PAR DOMAINE, tire
 * a la naissance de chaque combattant avec une vraie dispersion — etait
 * ecrit sur toutes les fiches du vivier ET LU PAR PERSONNE. La donnee
 * existait ; il manquait la ligne qui la fait compter.
 *
 * LA LOI, ET ELLE TIENT EN UNE PHRASE :
 *   le potentiel est A LUI, l'encadrement decide de combien il l'approche.
 *
 * /!\ CE N'EST PAS UNE CONDAMNATION. Le plafond se recalcule a chaque
 * seance : recruter un meilleur coach le releve, et l'homme repart. Un
 * plafond definitif transformerait un mauvais debut de partie en partie
 * perdue sans le dire — exactement ce que le carnet refuse.
 */
/* /!\ LA PERTE N'EST PAS UNE DROITE, ET LA PREMIERE VERSION L'ETAIT.
   A 0,35 par point manquant : un homme deja a 65 plafonnait a 69,8 meme
   avec le meilleur staff du jeu — mesure, six ans, +4,8 points. Une
   droite ne peut pas dire les deux choses qu'on veut dire a la fois :
     « un tres bon staff ne coute presque rien » (il doit friser le
       potentiel : quelques points de perte, pas plus)
     « un mauvais staff coute enormement » (quinze a vingt points).
   L'exposant 1,5 les separe : la perte s'effondre vers le haut de
   l'echelle et explose vers le bas. */
const COURBE = 1.5;
const AMPLITUDE = 32;   // ce que coute une salle SANS aucun encadrement
const PLANCHER = 55;    // ce qu'on atteint seul, par le sparring et les combats

/**
 * Jusqu'ou cet homme peut monter dans ce domaine, ici et maintenant.
 * @param {number} potentiel  son potentiel sur CE domaine (35 a 99)
 * @param {number} niveau     le niveau de l'encadrement sur cet axe (0 a 100)
 */
function plafond(potentiel, niveau) {
  const p = Math.max(0, Math.min(99, Number(potentiel) || 0));
  const n = Math.max(0, Math.min(100, Number(niveau) || 0));
  const perdu = Math.pow((100 - n) / 100, COURBE) * AMPLITUDE;
  /* Le plancher ne DEPASSE jamais le potentiel : un homme sans moyens
     n'ira pas plus haut que ce qu'il a. */
  return Math.round(Math.max(Math.min(p, PLANCHER), p - perdu) * 10) / 10;
}

/**
 * Le potentiel d'un homme sur un domaine, MEME SI SA FICHE N'EN PORTE PAS.
 * /!\ LES COMBATTANTS ECRITS A LA MAIN (fiches.js) N'ONT PAS DE BLOC
 * `carriere` — et ce sont precisement les deux pros du debut de partie,
 * donc ceux que le joueur regarde en premier. Sans repli, toute la loi les
 * epargnerait en silence. Le repli est DERIVE (jeton du nom + domaine),
 * jamais tire : le meme homme a le meme potentiel d'une partie a l'autre,
 * et rien n'est a stocker ni a migrer dans les sauvegardes.
 */
function potentielDe(fiche, dom, cle) {
  const c = fiche && fiche.carriere;
  if (c && c.potentiel && typeof c.potentiel[dom] === "number") return c.potentiel[dom];
  let h = 2166136261 >>> 0;
  const s = String(cle || (fiche && fiche.nom) || "?") + "|" + dom;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  /* /!\ LE REPLI PART DE CE QU'IL SAIT DEJA FAIRE, ET C'EST LA PREMIERE
     VERSION QUI L'OUBLIAIT. Un potentiel tire dans l'absolu (62 a 98)
     tombait sous le niveau REEL des deux pros du debut — mesure : Kante,
     deja a 65 de frappe, se retrouvait bute des la premiere seance et
     gagnait 0,2 POINT EN SIX ANS. Un homme deja bon a forcement le
     potentiel de ce qu'il fait : le repli est donc son niveau actuel
     PLUS une marge derivee, jamais un tirage independant de lui. */
  const bloc = (fiche && fiche[dom]) || {};
  const vals = Object.keys(bloc).map((k) => bloc[k]).filter((x) => typeof x === "number" && isFinite(x));
  const moy = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 45;
  return Math.max(35, Math.min(99, Math.round(moy + 9 + (h % 17))));
}

/** La marge qui reste — ce que le scout cherche a estimer. */
function marge(f) {
  const c = f.carriere;
  if (!c) return 0;
  let reste = 0;
  for (const d of DOMAINES) reste += Math.max(0, c.potentiel[d] - c.niveaux[d]);
  return Math.round(reste / DOMAINES.length);
}

module.exports = { DOMAINES, RYTHME_HEBDO, facteurAge, tirerPotentiel, tirerParcours,
                   tirerAxes, poser, caler, marge,
                   plafond, potentielDe, COURBE, AMPLITUDE, PLANCHER };
