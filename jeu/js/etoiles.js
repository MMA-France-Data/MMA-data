/**
 * etoiles.js — LES HUIT TETES D'AFFICHE MONDIALES.
 *
 * Une par categorie de poids, chacune d'un grand pays du sport. Ce sont les
 * sommets : ceux que ton combattant croisera s'il arrive tout en haut, et
 * les noms que le fil media cite quand il parle du reste du monde.
 *
 * ===================================================================
 * /!\ NOMS DERIVES, JAMAIS LES VRAIS
 * ===================================================================
 * Chaque etoile s'inspire d'un champion reel — c'est ce qui la rend
 * reconnaissable et donne envie de la battre. Mais aucun vrai nom n'est
 * utilise, et ce n'est PAS une precaution excessive :
 *   - le droit a l'image d'une personne est plus sensible encore qu'une
 *     marque, et il n'y a pas d'usage "descriptif" qui tienne
 *   - le moteur va les faire PERDRE, leur coller des bourses, et leur faire
 *     dire des horreurs en conference de presse. Avec un vrai nom, ca
 *     devient inconfortable tres vite.
 * La methode : on garde la SILHOUETTE (pays, categorie, style de combat,
 * registre du surnom) et on change l'identite. Le fan devine, personne
 * n'est mis en cause.
 * /!\ NE PAS "DERIVER" EN CHANGEANT UNE LETTRE d'un nom reel : c'est plus
 * risque juridiquement qu'un nom franchement different, et c'est moche.
 *
 * /!\ ET SURTOUT : TRADUIRE UN SURNOM REEL, C'EST LE COPIER.
 * Premiere version, quatre surnoms sur huit etaient des traductions :
 *     « le Cauchemar » <- "The Nigerian Nightmare" (Usman)
 *     « Pedra »        <- "Poatan", la pierre (Pereira)
 *     « le Gamin »     <- "Bon Gamin" (Gane)
 *     « el Niño »      <- "The Assassin Baby" (Moreno)
 * Le banc ne les avait pas vus : sa liste contenait les NOMS, pas les
 * SURNOMS ni leurs traductions. Corrige des deux cotes.
 * La bonne methode : partir du STYLE DE COMBAT, jamais du surnom.
 *     Vanel   « l'Horloger »  -> la precision, le placement
 *     Bastos  « Meia-Noite »  -> minuit : la lumiere s'eteint
 *     Adebayo « le Rouleau »  -> la pression qui aplatit
 *     Cortés  « Colibrí »     -> le rythme, la vitesse
 *
 * Le champ `clin` dit de qui chaque etoile s'inspire. Il est la pour la
 * CONCEPTION — il ne doit jamais atteindre l'ecran.
 */

const { alea } = require("./alea.js");
const { generer_combattant } = require("./generator.js");

const ETOILES = [
  { id: "Vanel",    nom: "Loïc « l'Horloger » Vanel",        pays: "France",
    division: "poids_lourd",    archetype: "kickboxeur_distance", org: "AFC", cible: { striking: 93, wrestling: 75, ground: 75 },
    grap: { forme: "lutteur" },
    clin: "Gane — lourd atypique, jambes et sorties d'angle, cardio de moyen" },
  { id: "Bastos",   nom: "Wanderson « Meia-Noite » Bastos",     pays: "Brésil",
    division: "poids_mi_lourd", archetype: "kickboxeur_distance", org: "AFC", cible: { striking: 93, wrestling: 71, ground: 75 },
    grap: { forme: "lutteur" },
    clin: "Pereira — gauche qui éteint, calf kick, menton de granit" },
  { id: "Aslanov",  nom: "Aslan « Turpal » Aslanov",         pays: "Tchétchénie",
    division: "poids_moyen",    archetype: "lutteur_controle",    org: "AFC", cible: { striking: 76, wrestling: 99, ground: 94 },
    grap: { forme: "specialiste", pointe: "dos" },
    clin: "Chimaev — entrée en lutte immédiate, contrôle étouffant.\n           /!\\ Premier surnom essaye : « Borz ». Le banc l'a REFUSE —\n           c'est le surnom REEL de Chimaev, pas un mot generique.\n           « Turpal » (heros, en tchetchene) est un mot commun." },
  { id: "Adebayo",  nom: "Emeka « le Rouleau » Adebayo", pays: "Nigeria",
    division: "poids_welter",   archetype: "lutteur_controle",    org: "AFC", cible: { striking: 81, wrestling: 94, ground: 92 },
    grap: { forme: "lutteur" },
    clin: "Usman — pression et lutte, cardio inépuisable" },
  { id: "Ferrer",   nom: "Iker « el Toro » Ferrer",        pays: "Espagne",
    division: "poids_leger",    archetype: "polyvalent",          org: "AFC", cible: { striking: 94, wrestling: 98, ground: 91 },
    grap: { forme: "specialiste", pointe: "bras" },
    clin: "Topuria — boxe lourde sur base grappling" },
  { id: "Whitlock", nom: "Cody « the Boss » Whitlock",     pays: "Australie",
    division: "poids_plume",    archetype: "polyvalent",          org: "AFC", cible: { striking: 90, wrestling: 89, ground: 89 },
    grap: { forme: "lutteur" },
    clin: "Volkanovski — volume, fight IQ, cardio" },
  { id: "Rourke",   nom: "Denver « Candy » Rourke",        pays: "USA",
    division: "poids_coq",      archetype: "kickboxeur_distance", org: "GFL", cible: { striking: 94, wrestling: 88, ground: 75 },
    grap: { forme: "lutteur" },
    clin: "O'Malley — allonge, timing, spectacle" },
  { id: "Cortes",   nom: "Beto « Colibrí » Cortés",        pays: "Mexique",
    division: "poids_mouche",   archetype: "grappler_soumission", org: "AFC", cible: { striking: 81, wrestling: 92, ground: 97 },
    grap: { forme: "complet", pointe: "tete_bras" },
    clin: "Moreno — rythme infernal, soumissions, cœur" },
];

/**
 * Fabrique les huit etoiles. Deterministe : meme graine, memes hommes.
 * /!\ Elles consomment le hasard GLOBAL — a appeler UNE FOIS au demarrage,
 * jamais en cours de partie, sinon on decale le flux du jeu.
 * @param {number} graine
 * @param {number} niveau  93 par defaut.
 *
 * /!\ CALIBRE PAR MESURE, PAS AU JUGE. A 88, deux etoiles tombaient a 85 et
 * 86 — c'est-a-dire qu'un roster regional quelconque comptait 15 % de
 * combattants MEILLEURS que le champion du monde welter. Absurde.
 * A 93 : de 88 a 96, moyenne 92,5. Un sommet reste au-dessus de 97 % d'une
 * population, meme genereuse.
 * /!\ L'ARCHETYPE FAIT VARIER LE NIVEAU OBTENU (un lutteur_controle rend
 * plus que le niveau demande, un kickboxeur moins) : on ne peut pas les
 * aligner tous exactement. C'est voulu — huit sommets identiques seraient
 * plus faux que huit sommets inegaux.
 */
/* /!\ LA NOTE GENERALE COMPTE CINQ STATS DE FRAPPE SUR DIX (niveau_moyen :
   jab, cross, low_kick, esquive_tete, footwork, puis shot, sprawl, passing,
   defense soumission, cardio). Creuser le striking d'un grappler lui coutait
   donc douze points de note generale, et un champion du monde tombait a 80.
   On amortit la faiblesse en frappe et on creuse plus franchement les
   domaines que la note pese moins. */
/* /!\ LES PROFILS SONT DICTES, PAS DERIVES DE L'ARCHETYPE.
   Premiere version : on generait par archetype puis on creusait un domaine
   d'un coefficient. Resultat trop grossier — Vanel avait 89 en lutte quand
   Mael en voulait 75, Rourke avait un bon sol quand il devait avoir une
   bonne lutte et un sol moyen.
   Chaque etoile porte donc une CIBLE par domaine, et on met le domaine a
   l'echelle pour l'atteindre. Le generateur donne la texture (le relief
   entre les stats d'un meme domaine), la cible donne le niveau.
   /!\ WHITLOCK EST VOLONTAIREMENT COMPLET (88/87/87) : c'est son identite,
   le combattant sans trou. Le banc doit l'accepter comme exception. */
function caler(bloc, cible) {
  const v = Object.keys(bloc).filter(k => typeof bloc[k] === "number");
  if (!v.length) return;
  const moy = v.reduce((s, k) => s + bloc[k], 0) / v.length;
  if (moy <= 0) return;
  const f = cible / moy;
  for (const k of v) bloc[k] = Math.max(30, Math.min(99, Math.round(bloc[k] * f)));
}

function fabriquer(graine = 424242, niveau = 94) {
  const out = [];
  alea.seed(graine);
  for (const e of ETOILES) {
    const [f] = generer_combattant({ niveau, division: e.division,
                                     archetype: e.archetype, nom: e.nom });
    // /!\ CHAQUE SOMMET DOIT AVOIR UN TROU.
    // Mesure avant correction : 47 % des stats des huit etoiles etaient a
    // 97 ou plus, et l'une d'elles affichait 97/97/98/99/99/99 — bon partout,
    // donc sans identite. Baisser leur niveau general aurait ete la mauvaise
    // reponse : ce sont les meilleurs du monde, ils DOIVENT etre tres haut.
    // Ce qui manquait n'etait pas de la moyenne, c'etait une FAIBLESSE.
    // On creuse donc un domaine, celui que le champion reel devait cacher :
    // le lourd elegant au sol, le frappeur en lutte, le lutteur debout.
    // C'est ce trou qui rend un adversaire battable et un plan de jeu utile.
    if (e.cible) {
      caler(f.striking,  e.cible.striking);
      caler(f.wrestling, e.cible.wrestling);
      caler(f.ground,    e.cible.ground);
    }
    f.name = e.id;                      // /!\ mono-jeton : le traducteur l'exige
    // /!\ LA FORME DE GRAPPLING EST DICTEE, PAS TIREE. Chimaev cherche le
    // dos, Usman ne soumet jamais (une en carriere), Moreno finit de
    // partout. Laisser le hasard choisir donnait a Aslanov une pointe en
    // cle de bras — faux pour le personnage.
    require("./grappling.js").attribuer(f, e.grap && e.grap.forme, e.grap && e.grap.pointe);
    out.push(Object.assign({}, e, { fighter: f, rang: 1, champion: true,
                                    notoriete: 70 + Math.trunc(alea.random() * 25) }));
  }
  return out;
}

module.exports = { ETOILES, fabriquer };
