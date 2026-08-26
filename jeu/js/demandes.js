/**
 * demandes.js — CE QU'IL VIENT TE DEMANDER.
 *
 * Module natif JS, tenu par invariants (banc 24). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LIVRAISON FAMILLE PAR FAMILLE (methode dictee au carnet)
 * ===================================================================
 * PREMIERE FAMILLE LIVREE : LE COMBAT. Mael corrige le ton sur celle-ci,
 * et on applique aux six autres : calendrier · preparation · argent ·
 * staff · ego · personnel.
 * /!\ NE PAS ECRIRE LES SIX AUTRES AVANT SON RETOUR — c'est exactement ce
 * que la methode veut eviter (six familles a refaire au lieu d'une).
 *
 * ===================================================================
 * /!\ CHAQUE DEMANDE PORTE QUATRE CHOSES (structure du carnet)
 * ===================================================================
 *   - ce que coute le OUI (argent, performance, controle)
 *   - ce que coute le NON (entente, combien)
 *   - QUI la formule : le profil qui la rend probable
 *   - le OUI MAIS quand il a un sens — /!\ PROMESSE CONDITIONNELLE, PAS
 *     COMPROMIS MOU : condition et echeance sont des DONNEES, sinon le
 *     jeu oublie sa parole et c'est LUI qui ment.
 *
 * /!\ ELLES SONT FORMULEES PAR LE COMBATTANT SELON SON PROFIL : un
 * agressif a faible fight IQ veut du plus gros, un homme au moral bas veut
 * qu'on le laisse tranquille. La demande n'est pas tiree au sort dans un
 * chapeau — elle est PROBABLE OU NON pour cet homme-la.
 */

const EN = require("./entente.js");

/** On parle comme un coach, pas comme un tableur. */
// /!\ VA JUSQU'A LA BORNE HAUTE DE TOUS LES CURSEURS (6) : la premiere
// version s'arretait a cinq et le coach disait "Prends 6 mois" au milieu
// d'une phrase en toutes lettres. Attrape par le banc.
const MOTS_N = { 1: "prochain", 2: "deux", 3: "trois", 4: "quatre",
                 5: "cinq", 6: "six" };

/**
 * /!\ LE CURSEUR DU "OUI MAIS" (Mael, 09/08) : plus tu exiges, moins il
 * repart content. A une victoire, c'est presque un oui franc. A cinq,
 * CE N'EST PLUS UNE PROMESSE, C'EST UN REFUS DEGUISE — et il le prend
 * comme tel : l'entente BAISSE au lieu de monter.
 * C'est ce qui empeche le "oui mais" d'etre la reponse gratuite a tout :
 * il faut choisir un prix, et le prix se voit.
 *     n=1 : +9   (presque un oui : +12)
 *     n=2 : +5   (la valeur historique du carnet)
 *     n=3 : +1
 *     n=4 : -3
 *     n=5 : -8   (pire qu'un non franc a -8 ? non : egal. Il a compris.)
 */
function gainCurseur(n) {
  return Math.round(11 - 3.7 * n);
}

/** Ce qu'il en pense, EN MOTS — le joueur voit le contentement bouger
 *  pendant qu'il glisse le curseur, sans lire un chiffre. */
function humeurCurseur(n) {
  const g = gainCurseur(n);
  if (g >= 8) return "Il hoche la tête. Ça lui va.";
  if (g >= 4) return "Il accepte. C'est un marché, il l'a compris.";
  if (g >= 0) return "Il fait la moue. Il trouve ça cher payé.";
  if (g >= -5) return "Il te regarde. Il commence à croire que tu gagnes du temps.";
  return "Il a compris que c'était non. Autant le lui dire en face.";
}

/* ================================================================== */
/* FAMILLE 1 — LE COMBAT.                                              */
/* ================================================================== */
const FAMILLE_COMBAT = {

  monter_categorie: {
    famille: "combat",
    titre: "Il veut monter de catégorie",
    // /!\ CE QU'IL DIT, PAS CE QUE LE JEU PENSE. Pas de chiffre : il
    // parle comme un combattant parle a son coach.
    // /!\ TON CORRIGE PAR MAEL : parler de DEFI ET DE CE QU'IL Y A A
    // GAGNER, pas de confort de poids. Ce n'est pas un homme qui est a
    // l'etroit, c'est un homme qui veut jouer plus gros.
    dit: "En dessous je bats tout le monde et ça ne me rapporte rien. " +
         "Au-dessus, ils sont plus durs, mais c'est là que sont les grosses " +
         "affiches et les grosses bourses. Je veux ce risque-là.",
    // QUI la formule
    /* /!\ CORRIGE PAR MAEL (09/08) : "les pros veulent tous monter de
       categorie ; normalement c'est quand t'es champion que tu peux te
       permettre de viser la double ceinture". On ne demande pas a monter
       parce qu'on a gagne deux fois — on le demande quand on a fait le
       tour de sa categorie. */
    probable: (f, ctx) => !ctx.combatPrevu && !!ctx.champion
      || (ctx.rang !== null && ctx.rang !== undefined && ctx.rang <= 3
          && (ctx.serie || 0) >= 3 && f.mental.aggression >= 62),
    oui: {
      effet: "categorie_haut",
      // Le cout du oui : il combat plus lourd que lui. C'est reel.
      dit_coach: "Il monte. Il sera le plus petit de la catégorie pendant un moment.",
      cout: "Il perdra en puissance relative face à des hommes plus lourds.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Il reste où il est.",
      entente: "offre_refusee",
      // Ce qu'il en pense, en mots
      reaction: "Il ne dit rien. Mais il l'a entendu.",
    },
    // /!\ CURSEUR (Mael, 09/08) : ce n'est pas un bouton, c'est un
    // MARCHANDAGE. Tu glisses le nombre de victoires exigees, et plus tu
    // en demandes, MOINS IL REPART CONTENT — jusqu'a ce que ce ne soit
    // plus une promesse mais un refus deguise, et qu'il le prenne comme
    // tel. Voir gainCurseur().
    oui_mais: {
      curseur: { type: "victoires", min: 1, max: 5, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "Gagne le prochain, et on le fait."
        : `Gagne tes ${MOTS_N[n] || n} prochains, et on le fait.`,
      delai: 360,
    },
  },

  cet_adversaire: {
    famille: "combat",
    titre: "Il veut un adversaire précis",
    dit: "Celui-là, ça fait deux ans qu'il raconte n'importe quoi sur moi. " +
         "Trouve-le-moi. Je m'en occupe.",
    probable: (f, ctx) => !ctx.combatPrevu && f.mental.aggression >= 68 && !!ctx.rival,
    oui: {
      effet: "cible_adversaire",
      dit_coach: "Tu vas voir le matchmaker pour lui décrocher ce combat-là.",
      // Le cout : demander un nom precis, c'est lacher du terrain.
      cout: "Demander un adversaire nommé, ça se paie sur le reste de la négociation.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Ce n'est pas le bon moment, et tu le lui dis.",
      entente: "offre_refusee",
      reaction: "Il hausse les épaules. Il ne lâchera pas l'idée.",
    },
    oui_mais: {
      curseur: { type: "victoires", min: 1, max: 5, defaut: 3 },
      dit_coach: (n) => n === 1
        ? "Gagne le prochain proprement, et il ne pourra plus te refuser."
        : `Gagne tes ${MOTS_N[n] || n} prochains, et il ne pourra plus te refuser.`,
      delai: 540,
    },
  },

  refuser_celui_ci: {
    famille: "combat",
    titre: "Il ne veut pas de ce combat",
    dit: "Pas lui, pas maintenant. Je ne suis pas prêt et je le sais. " +
         "Si tu me forces, j'y vais, mais je te le dis.",
    // /!\ CELUI QUI DEMANDE CA A SOUVENT RAISON : fight IQ eleve, ou il
    // sort d'une guerre. Le jeu ne doit pas punir la lucidite.
    probable: (f, ctx) => f.mental.fight_iq >= 65
      && ((ctx.fraicheur !== undefined && ctx.fraicheur < 0.9) || (ctx.derniers || []).slice(-1)[0] === "D"),
    oui: {
      effet: "refuser_offre",
      dit_coach: "Tu refuses le combat.",
      cout: "L'organisation n'aimera pas — la prochaine offre sera moins belle.",
      // /!\ ACCEPTER QU'IL REFUSE, C'EST CE QUI FAIT MONTER L'ENTENTE LE
      // PLUS SUREMENT. Ca coute a l'orga, pas a lui.
      entente: "refus_accepte",
      cout_relation: "refus",
    },
    non: {
      dit_coach: "Il combattra quand même.",
      // /!\ LE FAIRE COMBATTRE CONTRE SON AVIS EST LA PIRE ENTREE.
      entente: "combat_trop_tot",
      reaction: "Il accepte sans discuter. C'est bien ça le problème.",
    },
    oui_mais: null,   // on ne marchande pas ca : oui ou non.
  },

  veut_revanche: {
    famille: "combat",
    titre: "Il veut sa revanche",
    /* /!\ ELLE NE SORT QUE S'IL Y A UN VRAI COMPTE A REGLER : le contexte
       porte ctx.revanche quand une rivalite VIVANTE nee d'une DEFAITE
       existe (endgame.js) — jamais un caprice sorti d'un chapeau. */
    dit: "Celui qui m'a battu — il dort tranquille et moi je me réveille " +
         "avec son nom. Rends-le-moi. Je ne demande rien d'autre.",
    probable: (f, ctx) => !ctx.combatPrevu && !!ctx.revanche,
    oui: {
      effet: "vouloir_revanche",
      dit_coach: "Tu diras au matchmaker que ce combat-là passe devant.",
      cout: "Le matchmaker entend — la revanche viendra plus vite, aux conditions du moment.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Pas maintenant. La route d'abord, la vengeance ensuite.",
      entente: "offre_refusee",
      reaction: "Il ne discute pas. Mais le nom reste sur le mur de son vestiaire.",
    },
    oui_mais: null,   // une revanche ne se marchande pas : oui ou non.
  },

  striker_pas_lutter: {
    famille: "combat",
    titre: "Il veut combattre debout",
    dit: "Arrête de me faire lutter. Mes mains, c'est ce que j'ai de mieux, " +
         "et on passe les camps à ramper.",
    probable: (f, ctx) => (ctx.gameplanImpose === "wrestling")
      && f.mental.aggression >= 55,
    oui: {
      effet: "gameplan_striking",
      dit_coach: "Le plan change : on va chercher le KO.",
      cout: "Contre un lutteur, renoncer à la lutte se paie cash.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "On garde le plan qui gagne.",
      entente: "offre_refusee",
      reaction: "Il exécutera. Sans y croire.",
    },
    oui_mais: {
      curseur: { type: "combats", min: 1, max: 4, defaut: 1 },
      dit_coach: (n) => n === 1
        ? "Celui-là on le lutte. Le prochain, on le fait à ta façon."
        : `Encore ${MOTS_N[n] || n} comme ça, et après on fait à ta façon.`,
      delai: 200,
    },
  },
};


/* ================================================================== */
/* FAMILLE 2 — LE CALENDRIER.                                          */
/* Le temps est a lui autant qu'a toi : quand il combat, quand il      */
/* souffle, a quel rythme il enchaine.                                 */
/* ================================================================== */
const FAMILLE_CALENDRIER = {

  enchainer: {
    famille: "calendrier",
    titre: "Il veut enchaîner",
    dit: "Je suis dedans, là. Trois mois à attendre et je repars de zéro. " +
         "Trouve-moi quelque chose vite, même pas énorme.",
    /* /!\ PAS QUAND IL A DEJA SA DATE (Mael, 26/08 : "il me dit camp
       court alors qu'il a deja un combat prevu"). Reclamer un combat
       avec un combat au calendrier, c'est une demande perimee a la
       naissance. Meme garde sur toutes les demandes qui VEULENT une
       date : cet_adversaire, souffler, main_event, monter_categorie. */
    probable: (f, ctx) => !ctx.combatPrevu
      && (ctx.derniers || []).slice(-1)[0] === "V"
      && f.mental.aggression >= 58 && (ctx.fraicheur === undefined || ctx.fraicheur >= 0.85),
    oui: {
      effet: "chercher_vite",
      dit_coach: "Tu lui trouves un combat rapproché.",
      cout: "Camp court, et pas le temps de corriger ce qui a mal marché.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Il attendra la bonne occasion.",
      entente: "offre_refusee",
      reaction: "Il s'entraîne quand même. Il tourne un peu en rond.",
    },
    oui_mais: {
      curseur: { type: "mois", min: 1, max: 4, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "Un mois de récupération, et on te trouve quelque chose."
        : `${MOTS_N[n] || n} mois pour bien faire les choses, et on repart.`,
      delai: 300,
    },
  },

  souffler: {
    famille: "calendrier",
    titre: "Il veut souffler",
    dit: "J'ai besoin de deux semaines. Pas d'entraînement, pas de salle, rien. " +
         "Je reviens et je suis à toi.",
    // /!\ CELUI QUI DEMANDE CA A SOUVENT RAISON AUSSI : il sort d'un camp
    // ou il enchaine depuis longtemps. Refuser systematiquement casse.
    probable: (f, ctx) => !ctx.amateur && !ctx.combatPrevu
      && ((ctx.fraicheur !== undefined && ctx.fraicheur < 0.8)
          || (ctx.moisSansPause !== undefined && ctx.moisSansPause >= 8)),
    oui: {
      effet: "pause",
      dit_coach: "Il coupe deux semaines.",
      cout: "Deux semaines sans progresser, et la forme qui redescend un peu.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Il continue.",
      entente: "stagnation",
      reaction: "Il vient tous les jours. Il n'est plus vraiment là.",
    },
    oui_mais: {
      curseur: { type: "semaines", min: 1, max: 3, defaut: 1 },
      dit_coach: (n) => n === 1
        ? "Une semaine. Après on reprend."
        : `${MOTS_N[n] || n} semaines, pas plus.`,
      delai: 90,
    },
  },

  jour_libre: {
    famille: "calendrier",
    titre: "Il veut un jour de moins par semaine",
    dit: "Le mardi je ne peux plus. J'ai un truc à côté, il faut bien " +
         "que je paie mon loyer. Le reste je suis là.",
    // Ceux qui n'ont pas encore d'argent : jeunes, non-classes.
    probable: (f, ctx) => (ctx.bourseAnnuelle !== undefined && ctx.bourseAnnuelle < 8000)
      && f.mental.discipline >= 45,
    oui: {
      effet: "seance_en_moins",
      dit_coach: "Il aura son mardi.",
      cout: "Une séance de moins par semaine : il progressera plus lentement.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Il sera là le mardi comme les autres.",
      entente: "offre_refusee",
      reaction: "Il ne dit rien. Il arrive en retard deux mardis sur trois.",
    },
    oui_mais: null,   // il a un travail : on ne marchande pas son loyer.
  },
};

/* ================================================================== */
/* FAMILLE 3 — LA PREPARATION.                                         */
/* Comment il s'entraine, avec qui, ou.                                */
/* ================================================================== */
const FAMILLE_PREPARATION = {

  moins_de_seances: {
    famille: "preparation",
    titre: "Il trouve la charge trop lourde",
    dit: "Je laisse tout à l'entraînement et il ne me reste rien pour le combat. " +
         "Allège, sinon j'y vais cramé.",
    probable: (f, ctx) => (ctx.charge !== undefined && ctx.charge >= 0.8)
      && (f.mental.discipline < 60 || (ctx.fraicheur !== undefined && ctx.fraicheur < 0.9)),
    oui: {
      effet: "charge_allegee",
      dit_coach: "On allège le programme.",
      cout: "Moins de charge, moins de progrès — mais il arrivera frais.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Le programme ne bouge pas.",
      entente: "offre_refusee",
      reaction: "Il tiendra. On verra dans quel état il monte.",
    },
    oui_mais: {
      curseur: { type: "semaines", min: 1, max: 4, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "On allège la dernière semaine avant le combat, pas avant."
        : `On allège les ${MOTS_N[n] || n} dernières semaines.`,
      delai: 120,
    },
  },

  plus_de_sparring: {
    famille: "preparation",
    titre: "Il veut plus de sparring",
    dit: "Je tape dans des pattes d'ours depuis trois mois. Il me faut " +
         "des gars en face, sinon je ne saurai pas où j'en suis.",
    /* Le sparring dur : un pro qui prepare quelque chose. */
    probable: (f, ctx) => !ctx.amateur && f.mental.aggression >= 60 && f.mental.discipline >= 55,
    oui: {
      effet: "sparring_augmente",
      dit_coach: "Plus de sparring dur au programme.",
      // /!\ LE VRAI COUT : le sparring dur use, et il blesse.
      cout: "Le sparring dur fait progresser vite — et abîme. Le risque de blessure monte.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "On garde le sparring léger.",
      entente: "offre_refusee",
      reaction: "Il trouvera à taper ailleurs, et tu ne le sauras pas.",
    },
    oui_mais: null,
  },

  changer_coach: {
    famille: "preparation",
    titre: "Il veut travailler avec un autre coach",
    dit: "Je ne progresse plus avec lui. Ce n'est pas contre lui, mais " +
         "j'ai besoin de quelqu'un qui me dise autre chose.",
    // /!\ CA VIENT SOUVENT D'UN HOMME QUI A RAISON : il stagne vraiment.
    probable: (f, ctx) => (ctx.moisSansProgres !== undefined && ctx.moisSansProgres >= 6),
    oui: {
      effet: "changer_coach",
      dit_coach: "Tu lui trouves quelqu'un d'autre.",
      cout: "Le nouveau coach coûte, et il faudra du temps avant que ça prenne.",
      entente: "materiel_son_domaine",
    },
    non: {
      dit_coach: "Il continue avec le même.",
      entente: "stagnation",
      reaction: "Il s'entraîne. Il a arrêté de poser des questions.",
    },
    oui_mais: {
      curseur: { type: "mois", min: 2, max: 6, defaut: 3 },
      dit_coach: (n) => `Laisse-lui ${MOTS_N[n] || n} mois. Si ça ne bouge pas, on change.`,
      delai: 400,
    },
  },

  stage_ailleurs: {
    famille: "preparation",
    titre: "Il veut partir en stage",
    dit: "Six semaines là-bas et je reviens un autre combattant. " +
         "Ils ont des gars à mon poids, ici je n'ai personne.",
    probable: (f, ctx) => (ctx.partenairesAPoids !== undefined && ctx.partenairesAPoids < 2)
      && f.mental.discipline >= 60,
    oui: {
      effet: "stage",
      dit_coach: "Il part en stage.",
      cout: "Ça coûte cher, et pendant six semaines tu ne contrôles rien de ce qu'il fait.",
      entente: "materiel_son_domaine",
    },
    non: {
      dit_coach: "Il reste s'entraîner ici.",
      entente: "offre_refusee",
      reaction: "Il reste. Il regarde les vidéos des autres salles le soir.",
    },
    oui_mais: {
      curseur: { type: "semaines", min: 1, max: 6, defaut: 3 },
      dit_coach: (n) => n === 1
        ? "Une semaine, pour voir. Pas six."
        : `${MOTS_N[n] || n} semaines. On n'a pas les moyens de plus.`,
      delai: 200,
    },
  },
};

/* ================================================================== */
/* FAMILLE 4 — L'ARGENT.                                               */
/* /!\ LE GRIEF N'EST JAMAIS "TU PRENDS 20 %", C'EST "JE SUIS RENTRE   */
/* AVEC 1 500 € ET TOI TU N'AS RIEN RISQUE" (carnet). Il compte CE     */
/* QU'IL LUI RESTE : bourse − frais de deplacement − ta part.          */
/* ================================================================== */
const FAMILLE_ARGENT = {

  partenaire_dedie: {
    famille: "preparation",
    titre: "Il veut un partenaire dédié pour son camp",
    dit: "Le groupe c'est bien, mais là j'ai besoin d'un gars payé pour " +
         "prendre mes rounds, tous les jours, au rythme de l'autre. Ça se trouve.",
    /* Elle n'a de sens QU'EN CAMP : c'est le contexte qui le dit. */
    probable: (f, ctx) => !!ctx.combatPrevu && !!ctx.enCamp,
    oui: {
      effet: "partenaire_dedie",
      dit_coach: "Tu paies un partenaire d'entraînement pour la fin du camp.",
      cout: "600 € — et le reste du groupe s'entraîne sans lui.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Le groupe suffira.",
      entente: "offre_refusee",
      reaction: "Il fait avec. Les rounds ne ressemblent pas à ce qui l'attend.",
    },
    oui_mais: null,
  },

  renegocier_part: {
    famille: "argent",
    titre: "Il veut que tu baisses ta part",
    dit: "Le dernier, je suis rentré avec pas grand-chose. J'ai payé le " +
         "déplacement, le tien, celui du coin — et toi tu prends ton pourcentage " +
         "sans rien risquer. Il faut qu'on en reparle.",
    // /!\ IL DEMANDE QUAND IL EST DEVENU BON, ou quand le net etait maigre.
    probable: (f, ctx) => (ctx.netDernier !== undefined && ctx.netDernier < 2000)
      || (ctx.serie || 0) >= 3,
    oui: {
      effet: "baisser_part",
      dit_coach: "Tu baisses ta part.",
      cout: "Moins de trésorerie pour la salle, à chacun de ses combats.",
      entente: "part_baissee",
    },
    non: {
      dit_coach: "Ta part ne bouge pas.",
      // /!\ GARDER SES 20 % QUAND IL VOUS DEPASSE : l'entree la plus dure
      // de la famille argent.
      entente: "part_gardee",
      reaction: "Il encaisse. Il retiendra le chiffre.",
    },
    oui_mais: {
      curseur: { type: "combats", min: 1, max: 4, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "Le prochain, je baisse. Celui-là on ne touche à rien."
        : `Encore ${MOTS_N[n] || n} comme ça, et je revois ma part.`,
      delai: 500,
    },
  },

  avance: {
    famille: "argent",
    titre: "Il demande une avance",
    dit: "J'ai un problème, il me faut de l'argent maintenant. " +
         "Prends-le sur la prochaine bourse, je m'en fous, mais il me le faut.",
    probable: (f, ctx) => (ctx.bourseAnnuelle !== undefined && ctx.bourseAnnuelle < 12000),
    oui: {
      effet: "avance",
      dit_coach: "Tu avances l'argent.",
      cout: "La trésorerie sort tout de suite, et tu ne récupères qu'après le combat.",
      entente: "part_baissee",
    },
    non: {
      dit_coach: "Tu ne peux pas.",
      entente: "offre_refusee",
      reaction: "Il comprend. Il trouvera ailleurs, et ça il ne l'oubliera pas.",
    },
    oui_mais: null,   // on aide ou on n'aide pas. On ne marchande pas un pepin.
  },

  sponsor: {
    famille: "argent",
    titre: "Il veut son propre sponsor",
    dit: "On me propose un truc perso. Toi tu ne prends rien dessus, " +
         "c'est mon nom qu'ils achètent, pas la salle.",
    // /!\ LE CARNET LE DIT : beaucoup de salles ne prennent RIEN sur les
    // sponsors personnels — c'est le manager qui preleve, pas le coach.
    probable: (f, ctx) => (ctx.notoriete || 0) >= 25,
    oui: {
      effet: "sponsor_perso",
      dit_coach: "Il garde son sponsor pour lui.",
      cout: "Tu ne touches rien dessus — mais c'est l'usage, et il le sait.",
      entente: "part_baissee",
    },
    non: {
      dit_coach: "Tu veux ta part dessus.",
      entente: "part_gardee",
      reaction: "Il trouve ça gonflé. Il n'a pas tort.",
    },
    oui_mais: null,
  },
};

/* ================================================================== */
/* FAMILLE 5 — LE STAFF.                                               */
/* Qui monte les marches avec lui, et qui paie leur billet.            */
/* ================================================================== */
const FAMILLE_STAFF = {

  son_pote_au_coin: {
    famille: "staff",
    titre: "Il veut son pote dans le coin",
    dit: "Lui il me connaît depuis dix ans. Quand ça va mal, c'est sa voix " +
         "que j'entends. Je le veux sur les marches.",
    /* /!\ ON NE PARLE DU COIN QUE S'IL Y A UN COMBAT (Mael) : demander
       qui monte les marches quand aucune date n'est posee n'a aucun sens. */
    probable: (f, ctx) => !!ctx.aUnCombat
      && (f.mental.discipline < 65 || (ctx.anciennete || 0) >= 24),
    oui: {
      effet: "coin_pote",
      dit_coach: "Son pote monte avec vous.",
      cout: "Une place de coin prise par quelqu'un qui n'y connaît rien, et un billet de plus à sa charge.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Le coin, c'est du métier.",
      entente: "offre_refusee",
      reaction: "Il comprend l'argument. Il le prend quand même mal.",
    },
    oui_mais: null,
  },

  moins_de_monde: {
    famille: "staff",
    titre: "Il veut moins de monde au déplacement",
    dit: "On part à six pour une bourse de rien. C'est moi qui paie tout le " +
         "monde, rappelle-toi. Réduis l'équipe.",
    // /!\ ARBITRAGE DE MANAGER OUVERT PAR LE CARNET : moins de frais pour
    // lui, mais il combat moins bien prepare.
    probable: (f, ctx) => !!ctx.aUnCombat
      && ((ctx.netDernier !== undefined && ctx.netDernier < 2500)
          || (ctx.tailleCoin !== undefined && ctx.tailleCoin >= 4)),
    oui: {
      effet: "coin_reduit",
      dit_coach: "Vous partirez à trois.",
      cout: "Moins de frais pour lui — et un coin plus court le jour du combat.",
      entente: "coin_allege",
    },
    non: {
      dit_coach: "Toute l'équipe fait le déplacement.",
      entente: "staff_sur_petit_combat",
      reaction: "Il paiera. Il fera le calcul en rentrant.",
    },
    oui_mais: null,
  },

  prepa_perso: {
    famille: "staff",
    titre: "Il veut un préparateur physique à lui",
    dit: "Le physique, ici, c'est du bricolage. Il me faut quelqu'un " +
         "qui ne s'occupe que de ça, et que de moi.",
    probable: (f, ctx) => (ctx.notoriete || 0) >= 30 && f.mental.discipline >= 62,
    oui: {
      effet: "prepa_perso",
      dit_coach: "Il aura son préparateur.",
      cout: "Un salaire de plus tous les mois, pour un seul homme.",
      entente: "materiel_son_domaine",
    },
    non: {
      dit_coach: "Il fera avec le staff de la salle.",
      entente: "offre_refusee",
      reaction: "Il s'en paiera un lui-même. Tu ne sauras pas ce qu'il lui fait faire.",
    },
    oui_mais: {
      curseur: { type: "mois", min: 1, max: 6, defaut: 3 },
      dit_coach: (n) => `Sur le prochain camp seulement — ${MOTS_N[n] || n} mois, on essaie.`,
      delai: 300,
    },
  },
};

/* ================================================================== */
/* FAMILLE 6 — L'EGO.                                                  */
/* /!\ CETTE FAMILLE EST CELLE OU LE OUI COUTE LE PLUS CHER EN         */
/* DISCIPLINE : ceder a l'ego, c'est nourrir la grosse tete.           */
/* ================================================================== */
const FAMILLE_EGO = {

  passer_pro: {
    famille: "ego",
    titre: "Il veut passer pro",
    /* /!\ LE TEXTE NE PRESUPPOSE QUE CE QUI EXISTE (Mael, 21/08 : "je
       recois ce message alors que j'ai pas de pro"). Se comparer a la
       moitie des pros d'une salle qui n'en a aucun est une fiction —
       la phrase se choisit au moment de parler, selon la salle. */
    dit: (nPros) => nPros > 0
      ? "Je suis meilleur que la moitié des pros de la salle et je suis " +
        "encore chez les amateurs. Fais-moi passer."
      : "Je tourne en rond chez les amateurs. Je suis prêt — fais-moi " +
        "passer, je serai ton premier pro.",
    /* /!\ CAS CREDIBLES SEULEMENT (Mael, 10/08 : "ils viennent tous a
       tout va"). Avant : amateur + aggression >= 55, RIEN D'AUTRE — tout
       amateur au sang chaud venait reclamer, meme un 0-0 au niveau
       cours du soir. Un homme ne vient dire "fais-moi passer" que si :
         1. SON DOSSIER PARLE : au moins 2 victoires, plus de victoires
            que de defaites ;
         2. IL Y CROIT : son niveau ressenti approche la barre du
            passage (le seuil reel est 48 ; on ose a partir de 44 —
            se surestimer un peu est humain, se surestimer de 20 points
            ne fait pas une demande, ca fait un delire) ;
         3. QUELQUE CHOSE LE POUSSE A LE DIRE : le caractere (aggression
            >= 55), ou l'age (>= 25 — il voit le temps passer). */
    probable: (f, ctx) => {
      if (ctx.amateur !== true) return false;
      const b = ctx.bilan || { v: 0, d: 0 };
      if ((b.v || 0) < 2 || (b.v || 0) <= (b.d || 0)) return false;
      if (niveauRessenti(f) < 44) return false;
      return f.mental.aggression >= 55 || (ctx.age || 22) >= 25;
    },
    oui: {
      effet: "passer_pro",
      dit_coach: "Il passe pro.",
      cout: "280 € de licence, il arrête de payer sa cotisation, et tu prends ses frais en charge.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Il reste amateur encore un moment.",
      entente: "offre_refusee",
      reaction: "Il continue. Il compte les mois.",
    },
    oui_mais: {
      curseur: { type: "victoires", min: 1, max: 5, defaut: 3 },
      dit_coach: (n) => n === 1
        ? "Encore une chez les amateurs, et tu passes."
        : `${MOTS_N[n] || n} victoires amateurs propres, et tu passes.`,
      delai: 540,
    },
  },

  main_event: {
    famille: "ego",
    titre: "Il veut être tête d'affiche",
    dit: "Je remplis autant qu'eux et je passe en ouverture. La prochaine, " +
         "c'est moi en dernier, ou alors explique-moi.",
    probable: (f, ctx) => !ctx.combatPrevu && (ctx.notoriete || 0) >= 35 && f.mental.aggression >= 60,
    oui: {
      effet: "demander_main_event",
      dit_coach: "Tu iras le demander au matchmaker.",
      cout: "Réclamer la tête d'affiche, ça se paie sur le reste — et il devra la tenir.",
      entente: "affiche_voulue",
    },
    non: {
      dit_coach: "Il combattra où on le met.",
      entente: "offre_refusee",
      reaction: "Il monte quand même. Il regarde qui passe après lui.",
    },
    oui_mais: {
      curseur: { type: "victoires", min: 1, max: 3, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "Gagne le prochain comme il faut, et je vais leur demander."
        : `${MOTS_N[n] || n} victoires et personne ne pourra plus te mettre en ouverture.`,
      delai: 400,
    },
  },

  plus_de_com: {
    famille: "ego",
    titre: "Il veut qu'on parle plus de lui",
    dit: "La salle communique sur tout le monde sauf sur moi. " +
         "Je suis le seul qui gagne, en ce moment.",
    probable: (f, ctx) => !ctx.amateur && (ctx.serie || 0) >= 2 && (ctx.notoriete || 0) < 40,
    oui: {
      effet: "com_sur_lui",
      dit_coach: "La communication de la salle se concentre sur lui.",
      // /!\ CE OUI COUTE DE LA DISCIPLINE : c'est de l'ego pur.
      cout: "Les autres le verront. Et lui se croira arrivé.",
      entente: "flatterie",
    },
    non: {
      dit_coach: "On communique comme avant.",
      entente: "offre_refusee",
      reaction: "Il poste lui-même. Ça part parfois de travers.",
    },
    oui_mais: null,
  },
};

/* ================================================================== */
/* FAMILLE 7 — LE PERSONNEL.                                           */
/* /!\ CELLE-CI NE SE MARCHANDE PRESQUE JAMAIS. Ce n'est pas une       */
/* negociation, c'est un homme qui te parle. Le "oui mais" y est        */
/* presque toujours DEPLACE — d'ou les null.                            */
/* ================================================================== */
/* ================================================================== */
/* FAMILLE 8 — L'AMATEUR. /!\ DEUX DEMANDES, PAS PLUS.                 */
/* ================================================================== */
const FAMILLE_AMATEUR = {

  sparring_avec_pros: {
    famille: "amateur",
    titre: "Il veut s'entraîner avec les pros",
    dit: "Mets-moi une fois avec eux. Je sais que je vais manger, " +
         "mais je veux voir où j'en suis — et je veux qu'ils me voient.",
    /* /!\ IL FAUT UN GROUPE PRO, ET UN ECART FRANCHISSABLE (arbitrage
       Mael, 10/08). Avant : tout amateur au sang chaud reclamait, MEME
       QUAND LA SALLE N'AVAIT AUCUN PRO — et le resultat etait toujours
       le meme. Trois conditions :
         1. au moins DEUX pros dans la salle (on ne monte pas "avec les
            pros" quand il y en a un seul) ;
         2. il n'est pas ridicule : au plus 25 points sous la moyenne du
            groupe pro — en dessous, ce n'est pas de l'ambition, c'est de
            l'inconscience, et personne ne le lui proposerait ;
         3. le caractere, ou le fait d'etre deja proche (a 8 points, meme
            un homme calme veut se mesurer). */
    probable: (f, ctx) => {
      if (!ctx.amateur) return false;
      if ((ctx.nbPros || 0) < 2) return false;
      /* /!\ RESSERRE (Mael, 10/08 : "les amateurs demandent toujours trop
         de monter au groupe pro"). Le delai entre deux demandes existait
         deja (2 a 4 mois par homme) — mais avec 140 adherents ca fait
         plusieurs demandes par jour, et un amateur n'a que DEUX demandes
         possibles : c'etait donc toujours la meme.
         Trois verrous au lieu d'un :
           - il doit AVOIR FAIT SES PREUVES en amateur (3 victoires, plus
             de victoires que de defaites) — on ne monte pas avec les pros
             parce qu'on en a envie ;
           - l'ecart au groupe pro passe de 25 a 14 points : au-dela ce
             n'est plus de l'ambition ;
           - et il faut vraiment le caractere (55 -> 66), sauf s'il est
             DEJA au niveau du groupe. */
      const b = ctx.bilan || { v: 0, d: 0 };
      if ((b.v || 0) < 3 || (b.v || 0) <= (b.d || 0)) return false;
      const ecart = (ctx.niveauMoi || 50) - (ctx.niveauPro || 50);
      if (ecart < -14) return false;
      return f.mental.aggression >= 66 || ecart > -4;
    },
    oui: {
      effet: "sparring_pro",
      dit_coach: "Il monte avec le groupe pro.",
      cout: "Il va prendre des coups qu'il n'est pas prêt à prendre. Mais on saura.",
      entente: "materiel_son_domaine",
    },
    non: {
      dit_coach: "Il reste avec les amateurs.",
      entente: "offre_refusee",
      reaction: "Il acquiesce. Il regarde le sparring pro de loin, tous les jeudis.",
    },
    oui_mais: {
      curseur: { type: "mois", min: 1, max: 3, defaut: 1 },
      dit_coach: (n) => n === 1
        ? "Encore un mois de travail, et tu montes avec eux."
        : `${MOTS_N[n] || n} mois, et tu montes avec eux.`,
      delai: 150,
    },
  },
};

const FAMILLE_PERSONNEL = {

  fight_week_calme: {
    famille: "personnel",
    titre: "Il veut une fight week sans micro",
    dit: "Les interviews, les photos, les pronostics — ça me bouffe. " +
         "Cette semaine je veux juste m'entraîner et me taire. Gère-les pour moi.",
    /* Elle ne sort que si LA PRESSION EST REELLE — la jauge de fight week
       (imageDe) qui ronge deja fight_iq et cardio le jour J. */
    probable: (f, ctx) => !!ctx.combatPrevu
      && (ctx.joursAvantCombat === undefined || ctx.joursAvantCombat <= 10)
      && (ctx.pression || 0) >= 0.03,
    oui: {
      effet: "couper_presse",
      dit_coach: "Tu prends les micros à sa place cette semaine.",
      cout: "Sa notoriété n'en profitera pas — un combat sans bruit se vend moins.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Il fera la presse comme tout le monde.",
      entente: "combat_trop_tot",
      reaction: "Il répond aux questions. Les yeux sont déjà ailleurs.",
    },
    oui_mais: null,
  },

  souci_familial: {
    famille: "personnel",
    titre: "Il a un problème à la maison",
    dit: "J'ai un truc à régler chez moi. Je ne vais pas t'expliquer, " +
         "mais il faut que tu me laisses tranquille quelque temps.",
    probable: (f, ctx) => (ctx.moralBas === true) || (ctx.moral !== undefined && ctx.moral < 0.75),
    oui: {
      effet: "mise_en_retrait",
      dit_coach: "Tu le laisses tranquille.",
      cout: "Il ne progresse pas, et tu ne sais pas combien de temps ça va durer.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Tu lui demandes de continuer normalement.",
      entente: "engueulade_defaite",
      reaction: "Il vient. Physiquement.",
    },
    oui_mais: null,
  },

  blessure_cachee: {
    famille: "personnel",
    titre: "Il t'avoue qu'il est blessé",
    // /!\ LE PLUS IMPORTANT DE LA FAMILLE : il te le dit PARCE QUE
    // l'entente est bonne. A entente basse, il ne dit rien et il monte
    // blesse — et c'est le jeu qui doit produire ca, pas une punition.
    dit: "L'épaule me lâche depuis six semaines. Je ne l'ai dit à personne. " +
         "Je te le dis à toi.",
    probable: (f, ctx) => (ctx.entente !== undefined && ctx.entente >= 60)
      && (ctx.fraicheur !== undefined && ctx.fraicheur < 0.95),
    oui: {
      effet: "soigner",
      dit_coach: "On le soigne. Pas de combat avant que ce soit réglé.",
      cout: "Des semaines sans combattre, et une offre qu'il faudra refuser.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Il combattra avec.",
      entente: "combat_trop_tot",
      reaction: "Il hoche la tête. Il ne te dira plus rien la prochaine fois.",
    },
    oui_mais: null,
  },

  envie_arreter: {
    famille: "personnel",
    titre: "Il pense à arrêter",
    dit: "Je ne sais plus pourquoi je fais ça. Je me lève le matin et " +
         "l'idée de la salle me pèse. Il faut que je te le dise.",
    probable: (f, ctx) => (ctx.moral !== undefined && ctx.moral < 0.65)
      && ((ctx.derniers || []).filter(x => x === "D").length >= 2 || (ctx.age || 0) >= 33),
    oui: {
      effet: "laisser_partir",
      dit_coach: "Tu ne le retiens pas.",
      cout: "Tu perds un combattant. Parfois c'est la seule chose juste à faire.",
      entente: "refus_accepte",
    },
    non: {
      dit_coach: "Tu essaies de le garder.",
      entente: "echange_rate",
      reaction: "Il reste. Pour l'instant.",
    },
    oui_mais: {
      curseur: { type: "mois", min: 1, max: 6, defaut: 2 },
      dit_coach: (n) => n === 1
        ? "Prends un mois. Tu ne décides rien avant."
        : `Prends ${MOTS_N[n] || n} mois. Après, on en reparle et tu fais ce que tu veux.`,
      delai: 300,
    },
  },
};

/** Toutes les familles livrees a ce jour. */
const DEMANDES = Object.assign({}, FAMILLE_COMBAT, FAMILLE_CALENDRIER,
  FAMILLE_PREPARATION, FAMILLE_ARGENT, FAMILLE_STAFF, FAMILLE_EGO,
  FAMILLE_PERSONNEL, FAMILLE_AMATEUR);

/**
 * Ce que cet homme-la est susceptible de venir demander, dans son etat du
 * moment. /!\ ON NE TIRE PAS AU SORT DANS UN CHAPEAU : une demande est
 * PROBABLE OU NON pour ce profil.
 */
/* /!\ CE DONT UN AMATEUR A LE DROIT DE PARLER (Mael, 09/08) : "les
   amateurs devraient venir seulement pour demander a passer pro, ou un
   cours avec les pros pour montrer de quoi ils sont capables. Moi je
   gere les pros." Un amateur ne negocie pas sa part, ne reclame pas un
   adversaire nomme, ne discute pas du coin. */
/**
 * Le niveau qu'un homme SE DONNE — une moyenne large de ce qu'il sait
 * faire. Ce n'est pas la note du jeu : c'est son ressenti, il sert aux
 * demandes ("je vaux mieux que ca"), jamais aux organisations.
 */
function niveauRessenti(f) {
  const s = f.striking || {}, w = f.wrestling || {}, g = f.ground || {},
        p = f.physical || {};
  const vals = [s.jab, s.cross, s.esquive_tete, s.footwork,
                w.shot, w.sprawl, g.passing, g.submission_def,
                p.cardio].filter(v => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
}

const AMATEUR_PEUT = ["passer_pro", "sparring_avec_pros"];

function possibles(f, ctx = {}) {
  return Object.entries(DEMANDES)
    .filter(([cle, d]) => {
      if (ctx.amateur && !AMATEUR_PEUT.includes(cle)) return false;
      if (!ctx.amateur && cle === "passer_pro") return false;
      try { return d.probable(f, ctx); } catch (e) { return false; }
    })
    .map(([cle, d]) => Object.assign({ cle }, d));
}

/**
 * Repondre a une demande. Rend le mouvement d'entente, l'effet a
 * appliquer par le jeu, et la promesse creee le cas echeant.
 * @param {object} etat  { entente, ... }
 * @param {string} cle   la demande
 * @param {string} rep   "oui" | "non" | "oui_mais"
 */
function repondre(etat, cle, rep, jour, f, n) {
  const d = DEMANDES[cle];
  if (!d) throw new Error(`demandes.js : demande inconnue "${cle}"`);

  if (rep === "oui_mais") {
    if (!d.oui_mais) throw new Error(`demandes.js : "${cle}" ne se marchande pas`);
    const c = d.oui_mais.curseur;
    // /!\ n est un PARAMETRE NOMME (etait lu dans `arguments`, ce qui
    // casse en mode strict et donc dans un bundle) : piege attrape au
    // branchement de l'ecran.
    let v = typeof n === "number" && n > 0 ? n : c.defaut;
    v = Math.max(c.min, Math.min(c.max, Math.round(v)));
    const texte = d.oui_mais.dit_coach(v);
    // /!\ LE GAIN SUIT LE CURSEUR, ET PEUT ETRE NEGATIF : trop exiger,
    // c'est refuser en faisant semblant de ceder.
    const p = EN.promettre(etat.entente, {
      quoi: cle, condition: { type: c.type, n: v },
      echeance: jour + d.oui_mais.delai, texte }, jour, gainCurseur(v));
    return { reponse: rep, mouvement: p, promesse: p.promesse, curseur: v,
             dit_coach: texte, humeur: humeurCurseur(v), effet: null };
  }

  const branche = rep === "oui" ? d.oui : d.non;
  const mouvement = EN.bouger(etat.entente, branche.entente, f);
  return { reponse: rep, mouvement,
           dit_coach: branche.dit_coach,
           effet: rep === "oui" ? branche.effet : null,
           cout: branche.cout || null,
           cout_relation: branche.cout_relation || null,
           reaction: branche.reaction || null };
}

module.exports = { DEMANDES, MOTS_N, gainCurseur, humeurCurseur,
                   possibles, repondre,
                   FAMILLE_COMBAT, FAMILLE_CALENDRIER, FAMILLE_PREPARATION,
                   FAMILLE_ARGENT, FAMILLE_STAFF, FAMILLE_EGO, FAMILLE_PERSONNEL,
                   FAMILLE_AMATEUR, AMATEUR_PEUT };
