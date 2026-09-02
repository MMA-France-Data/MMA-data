/**
 * coach_dialogue.js — PARLER À SON COACH. La mécanique.
 *
 * (Mael, 02/09 : « beaucoup plus de discussion et de choses à faire. »)
 *
 * ===================================================================
 * /!\ POURQUOI CE N'EST PAS UN DEUXIÈME diner.js
 * ===================================================================
 * Le dîner porte 140 scènes et en consomme 13 par soirée, une soirée par
 * an : DIX ANS avant la première redite. Un coach, on le croise CHAQUE
 * SEMAINE. Reprendre la forme du dîner telle quelle — un enchaînement de
 * moments qu'on traverse — donnerait un homme qui radote au bout d'un
 * trimestre, et le jeu a déjà cette faute quelque part : dialogue.js
 * offre 7 approches et 51 réponses pour une douzaine d'hommes vus toutes
 * les semaines, soit plusieurs centaines d'échanges par an sur 51 textes.
 *
 * QUATRE MÉCANIQUES RÉPONDENT À ÇA, ET AUCUNE N'EST DU CONTENU :
 *
 *   1. LES MOMENTS NE S'ENCHAÎNENT PAS, ILS SE DÉCLENCHENT. Il n'y a pas
 *      de « soirée » à traverser. Il y a un homme qui vient te voir quand
 *      il a quelque chose à dire, et un bureau où TU vas quand tu veux.
 *
 *   2. LA PÉREMPTION. Chaque scène porte sa `vie` : `unique` (une fois
 *      dans une carrière), `saison` (pas avant un an), `courante` (pas
 *      avant N semaines). Une scène revue est une scène qui a eu le droit
 *      de revenir, jamais un accident de tirage.
 *
 *   3. LA VOIX. Six caractères, dérivés du jeton du coach — donc stables
 *      à vie. Une scène déclare les caractères à qui elle va. Sans ça, le
 *      joueur entend UN homme parler par cinq bouches, et c'est la façon
 *      la plus rapide de sentir qu'on lit une base de données.
 *
 *   4. LA MÉMOIRE. Ce que tu as répondu est GARDÉ (`dits`) et des
 *      déclencheurs le relisent : `je_lui_ai_promis`, `je_l_ai_recadre`,
 *      `je_ne_tiens_jamais_parole`. diner.js écrit déjà S.dits et le jette
 *      — sans importance pour un rendez-vous annuel, mortel pour une
 *      relation hebdomadaire.
 *
 * ===================================================================
 * /!\ ET LA RÈGLE QUI VIENT DU CARNET, ÉCRITE SIX FOIS
 * ===================================================================
 * RIEN N'EST DÉCORATIF. Chaque réponse porte son mouvement d'entente, et
 * peut porter un `effet` — une clé d'une LISTE FERMÉE que la salle
 * applique. Une clé d'effet que personne ne traite fait ÉCHOUER le banc :
 * c'est le même crible que le banc 29, sorti ici en fonction partagée.
 *
 * Module PUR : pas de DOM, pas d'état global, pas de hasard, pas de date.
 * Banc 39.
 */

const C = require("./coach.js");

/* ==================================================================== */
/* LES MOMENTS — ils se déclenchent, ils ne s'enchaînent pas             */
/* ==================================================================== */
/**
 *   bureau        — TU vas le voir. Le seul que le joueur ouvre.
 *   bord_du_tapis — il t'attrape après le cours. Court, deux réponses.
 *   debrief       — le lendemain d'un combat de l'un de ses hommes.
 *   accrochage    — un désaccord : avec toi, ou avec l'autre coach.
 *   porte         — il s'en va, ou il pense à s'en aller.
 */
const MOMENTS = ["bureau", "bord_du_tapis", "debrief", "accrochage", "porte"];

/** Les moments que le JOUEUR peut ouvrir de lui-même. Les autres viennent
 *  à lui — c'est la différence entre un collègue et un menu. */
const MOMENTS_JOUEUR = ["bureau"];

/* ==================================================================== */
/* CE QUE LE JOUEUR PEUT OUVRIR — la moitié qui n'existait pas           */
/* ==================================================================== */
/** /!\ AUJOURD'HUI LE COACH N'EST JAMAIS ADRESSÉ, IL NE FAIT QUE
 *  RÉPONDRE : les 10 demandes du staff partent toutes de LUI, et le seul
 *  geste du joueur est « Prendre un café » (+3 d'entente, gratuit). Un
 *  combattant, lui, a sept approches depuis le premier jour. */
const SUJETS = [
  { cle: "ou_il_en_est", lab: "Lui demander où il en est",
    txt: "Tu ne parles pas des gars. Tu lui demandes comment lui, il va." },
  { cle: "ce_qu_il_voit", lab: "Lui demander ce qu'il voit",
    txt: "Tu lui demandes son avis sur le groupe. Sans filtre." },
  { cle: "un_gars", lab: "Lui parler d'un de tes hommes",
    txt: "Tu poses un nom sur la table et tu attends." },
  { cle: "l_argent", lab: "Parler d'argent",
    txt: "Le sujet que personne n'ouvre jamais au bon moment." },
  { cle: "sa_methode", lab: "Lui demander comment il travaille",
    txt: "Tu lui demandes de t'expliquer ce qu'il fait, vraiment." },
  { cle: "le_recadrer", lab: "Le recadrer",
    txt: "Tu lui dis ce qui ne va pas. Ça peut passer, ou pas." },
  { cle: "le_rassurer", lab: "Le rassurer",
    txt: "Tu lui dis que tu vois le travail." },
  { cle: "le_collegue", lab: "Lui parler de l'autre coach",
    txt: "Deux hommes sur le même tapis, ça finit toujours par se dire." },
  { cle: "l_apres", lab: "Lui parler de l'après",
    txt: "Ce qu'il fera quand il ne sera plus sur le tapis." },
];

/* ==================================================================== */
/* LES CARACTÈRES — pour qu'ils ne parlent pas tous de la même voix      */
/* ==================================================================== */
/** Dérivé du jeton, donc stable à vie et jamais tiré. Une scène déclare
 *  `voix` : la liste des caractères à qui elle va (vide = tout le monde). */
const CARACTERES = [
  { cle: "bourru", mot: "Il ne dit jamais deux mots quand un suffit." },
  { cle: "pedagogue", mot: "Il explique. Toujours. Même quand tu n'as pas demandé." },
  { cle: "ambitieux", mot: "Il regarde plus loin que ta salle, et il ne s'en cache pas." },
  { cle: "taiseux", mot: "Il faut aller chercher ce qu'il pense." },
  { cle: "chaleureux", mot: "Avec lui, le vestiaire est une maison." },
  { cle: "technicien", mot: "Il parle en gestes et en angles, jamais en sentiments." },
];

function caractereDe(c) {
  if (!c) return CARACTERES[0].cle;
  if (c.caractere && CARACTERES.some((x) => x.cle === c.caractere)) return c.caractere;
  return CARACTERES[C.jeton(c.nom || "?", "caractere") % CARACTERES.length].cle;
}
const motCaractere = (cle) => (CARACTERES.find((x) => x.cle === cle) || {}).mot || "";

/* ==================================================================== */
/* LES DÉCLENCHEURS — liste FERMÉE                                       */
/* ==================================================================== */
/** /!\ FERMÉE, ET LE BANC LE VÉRIFIE. Une condition inventée dans une
 *  scène serait une scène qui ne sort JAMAIS, sans que personne le sache
 *  — la classe de défaut la plus chère du carnet, en version silencieuse. */
const DECLENCHEURS = [
  "toujours",
  /* qui il est */
  "neuf", "ancien", "vieux", "formateur", "competition",
  /* ce qu'on lui fait */
  "sous_paye", "bien_paye", "disperse", "concentre", "sans_case",
  /* où en est la relation */
  "froid", "tiede", "chaud",
  /* sa carrière */
  "il_monte", "a_son_sommet", "parle_de_l_apres", "fin_proche",
  /* ce qu'il y a dans la salle */
  "un_trou_a_cote", "partage_sa_case", "seul_au_staff", "salle_pleine",
  "a_un_poulain", "a_un_crame", "a_un_espoir",
  /* ce qui vient de se passer */
  "apres_victoire", "apres_defaite", "apres_titre", "apres_un_depart",
  /* ce que TU lui as dit — la mémoire */
  "je_lui_ai_promis", "je_l_ai_recadre", "je_ne_tiens_jamais_parole",
  "je_lui_ai_toujours_dit_oui",
  /* ===================================================================
     L'HOMME POSÉ SUR LA TABLE (Mael, 02/09 : « des trucs où je parle de
     quelqu'un, on sait pas qui c'est ; j'aimerais pouvoir parler de
     n'importe quel combattant du groupe pro, au moins le sélectionner »)
     ===================================================================
     Ceux-là ne décrivent NI le coach NI la salle : ils décrivent LE
     COMBATTANT QUE LE JOUEUR VIENT DE CHOISIR. Ils ne valent donc que
     dans le sujet `un_gars`, et ils sont TOUS FAUX tant qu'aucun nom
     n'est sur la table — c'est ce qui garantit qu'une scène écrite pour
     « son poulain » ne sorte jamais au sujet d'un inconnu. */
  "son_poulain", "pas_son_poulain", "gars_jeune", "gars_vieux",
  "gars_cuit", "gars_lance", "gars_qui_doute", "gars_blesse",
];

/**
 * Le déclencheur tient-il ?
 * @param {string} si   une clé de DECLENCHEURS
 * @param {object} ctx  la situation, lue par la salle
 */
function tient(si, ctx) {
  const x = ctx || {};
  const rel = x.entente === undefined ? 55 : x.entente;
  switch (si) {
    case "toujours": return true;

    case "neuf": return (x.semainesMaison || 0) < 26;
    case "ancien": return (x.semainesMaison || 0) >= 156;
    case "vieux": return (x.age || 40) >= 56;
    case "formateur": return x.metier !== "competition";
    case "competition": return x.metier === "competition";

    case "sous_paye": return !!x.bareme && (x.salaire || 0) < x.bareme * 0.8;
    case "bien_paye": return !!x.bareme && (x.salaire || 0) >= x.bareme * 1.1;
    case "disperse": return (x.cases || 0) >= 3;
    case "concentre": return (x.cases || 0) === 1;
    case "sans_case": return (x.cases || 0) === 0;

    case "froid": return rel < 40;
    case "tiede": return rel >= 40 && rel < 65;
    case "chaud": return rel >= 65;

    case "il_monte": return x.phase === "monte";
    case "a_son_sommet": return x.phase === "sommet";
    case "parle_de_l_apres": return x.phase === "apres";
    case "fin_proche": return x.phase === "fin";

    case "un_trou_a_cote": return !!x.trouACote;
    case "partage_sa_case": return !!x.partage;
    case "seul_au_staff": return (x.staff || 1) <= 1;
    case "salle_pleine": return !!x.sallePleine;
    case "a_un_poulain": return !!x.poulain;
    case "a_un_crame": return !!x.crame;
    case "a_un_espoir": return !!x.espoir;

    case "apres_victoire": return x.dernier === "victoire";
    case "apres_defaite": return x.dernier === "defaite";
    case "apres_titre": return x.dernier === "titre";
    case "apres_un_depart": return !!x.departRecent;

    case "je_lui_ai_promis": return !!x.promesseEnCours;
    case "je_l_ai_recadre": return (x.recadrages || 0) > 0;
    case "je_ne_tiens_jamais_parole": return (x.paroleTrahie || 0) >= 2;
    case "je_lui_ai_toujours_dit_oui": return (x.ouiDaffilee || 0) >= 3;

    /* /!\ TOUS EXIGENT `gars` : sans nom sur la table, aucun ne tient. */
    case "son_poulain": return !!x.gars && !!x.garsPoulain;
    case "pas_son_poulain": return !!x.gars && !x.garsPoulain;
    case "gars_jeune": return !!x.gars && (x.garsAge || 99) <= 23;
    case "gars_vieux": return !!x.gars && (x.garsAge || 0) >= 33;
    case "gars_cuit": return !!x.gars && !!x.garsCuit;
    case "gars_lance": return !!x.gars && (x.garsSerie || 0) >= 2;
    case "gars_qui_doute": return !!x.gars && (x.garsSerie || 0) <= -2;
    case "gars_blesse": return !!x.gars && !!x.garsBlesse;

    /* /!\ UNE CONDITION INCONNUE NE PASSE PAS EN SILENCE. */
    default:
      if (typeof console !== "undefined")
        console.error(`coach_dialogue.js : déclencheur inconnu "${si}"`);
      return false;
  }
}

/* ==================================================================== */
/* LES EFFETS — liste FERMÉE, appliquée par la salle                     */
/* ==================================================================== */
/** /!\ LA LEÇON ÉCRITE SIX FOIS AU CARNET : « les demandes portaient un
 *  nom d'effet que personne n'appliquait ». Une réplique peut porter une
 *  de ces clés, et le banc 39 EXIGE que la salle les traite toutes —
 *  criblees par la même fonction que les demandes du staff. */
const EFFETS = [
  "promettre_argent",       // une promesse datée : le jour venu, tenue ou pas
  "monter_au_bareme",       // tout de suite, si la caisse suit
  "lui_lacher_une_case",    // il rend une case : moins dispersé, un trou ailleurs
  "lui_donner_une_case",    // il en prend une de plus
  "lui_confier_un_gars",    // poulain
  "lui_rendre_un_gars",     // il rend son poulain
  "le_mettre_au_coin",      // pour LE prochain combat, et une seule fois
  "menager_un_gars",        // l'homme qu'il dit cuit lève le pied
  "arbitrer_pour_lui",      // dans un désaccord, tu lui donnes raison
  "arbitrer_contre_lui",    // tu donnes raison à l'autre
  "l_envoyer_se_former",    // un stage : il coûte, il progresse plus vite
  "accepter_son_depart",    // la porte
  "le_retenir",             // tu surenchéris sur l'offre d'en face
  "rien",                   // /!\ ZÉRO EST UNE VALEUR : botter en touche est
                            //     un choix, il ne doit pas être gratuit ni
                            //     interdit — il ne fait juste rien.
];

/* ==================================================================== */
/* LA VIE D'UNE SCÈNE — l'anti-redite                                    */
/* ==================================================================== */
/** unique : une fois dans sa carrière · saison : pas avant un an ·
 *  courante : pas avant `peremption` semaines (défaut 26). */
const VIES = ["unique", "saison", "courante"];
/* /!\ MESURÉ, PAS CHOISI. Un semestre paraissait raisonnable — c'est le
   chiffre qu'on écrit sans réfléchir. Mais neuf sujets et deux passages
   au bureau par semaine, ça ne fait qu'une visite par sujet toutes les
   quatre ou cinq semaines : un semestre ne représente que six ouvertures.
   Le banc 39 l'a chiffré sur une première saison de jeu réel — quinze
   redites à vingt-six semaines, aucune à quarante-cinq. La péremption
   ne se compte donc pas en calendrier, elle se compte EN NOMBRE DE FOIS
   OÙ LE JOUEUR OUVRE CETTE PORTE-LÀ. */
const PEREMPTION_DEFAUT = 45;

/** Depuis combien de semaines cette scène a-t-elle été vue ? */
function revenable(s, vues, jour) {
  const vu = vues ? vues[s.cle] : undefined;
  if (vu === undefined) return true;
  const vie = s.vie || "courante";
  if (vie === "unique") return false;
  const sem = (jour - vu) / 7;
  if (vie === "saison") return sem >= 52;
  return sem >= (s.peremption || PEREMPTION_DEFAUT);
}

/* ==================================================================== */
/* LE NOM SUR LA TABLE                                                   */
/* ==================================================================== */
/** /!\ LE SUJET « un_gars » DISAIT « tu poses un nom sur la table » ET NE
 *  DEMANDAIT JAMAIS LEQUEL. Le joueur lisait une conversation sur un
 *  inconnu — et, bien pire, les effets qui touchent un combattant
 *  choisissaient l'homme TOUT SEULS (le premier cuit, le premier espoir,
 *  le premier qui monte). On croyait parler de quelqu'un, le jeu
 *  appliquait à un autre.
 *  Le contenu porte donc le marqueur `{gars}` et l'écran fournit le nom.
 *  RÈGLE, ET LE BANC LA TIENT : le marqueur n'existe QUE dans le sujet
 *  `un_gars`, le seul où un nom est toujours sur la table. Ailleurs il
 *  s'afficherait tel quel, accolades comprises. */
const MARQUEUR = /\{gars\}/g;

/** La scène, dite pour cet homme-là. Rend une COPIE : le contenu est une
 *  donnée partagée par tous les coachs, on ne la réécrit jamais en place. */
function nommer(s, nom) {
  if (!s || !nom) return s;
  const r = (x) => String(x).replace(MARQUEUR, nom);
  return Object.assign({}, s, {
    texte: r(s.texte),
    choix: (s.choix || []).map((c) => Object.assign({}, c, { lab: r(c.lab), r: r(c.r) })),
  });
}

/* ==================================================================== */
/* CHOISIR CE QU'IL DIT                                                  */
/* ==================================================================== */
/**
 * Les scènes jouables pour ce coach, à ce moment, dans cette situation.
 * @param {object} scenes  le contenu (coach_scenes.js)
 * @param {string} moment  une clé de MOMENTS
 * @param {object} ctx     la situation (voir tient)
 * @param {object} vues    { cle: jour } — ce qu'il t'a déjà dit
 * @param {number} jour
 * @param {string} [sujet] pour le bureau : le sujet ouvert par le joueur
 */
function jouables(scenes, moment, ctx, vues, jour, sujet) {
  const lot = (scenes && scenes[moment]) || [];
  const car = ctx && ctx.caractere;
  return lot.filter((s) => {
    if (sujet && s.sujet !== sujet) return false;
    if (!sujet && moment === "bureau" && s.sujet) return false;
    if (s.voix && s.voix.length && car && s.voix.indexOf(car) < 0) return false;
    if (!tient(s.si, ctx)) return false;
    return revenable(s, vues, jour);
  });
}

/**
 * CE QU'IL DIT MAINTENANT — parmi celles qui collent, celle que le jeton
 * désigne. /!\ AUCUN TIRAGE : deux ouvertures du même bureau le même jour
 * donnent la même scène, sinon on pourrait rouvrir jusqu'à tomber sur la
 * bonne, et le choix ne coûterait plus rien.
 */
function scenePour(scenes, moment, ctx, vues, jour, sujet, graine) {
  const l = jouables(scenes, moment, ctx, vues, jour, sujet);
  if (!l.length) {
    /* Le repli : une scène « toujours » du moment, même déjà vue. On
       préfère un homme qui se répète à un homme qui n'ouvre pas la
       bouche — mais le banc compte ces replis, et ils doivent rester rares. */
    const fond = ((scenes && scenes[moment]) || [])
      .filter((s) => s.si === "toujours" && (!sujet || s.sujet === sujet));
    if (!fond.length) return null;
    return fond[C.jeton(graine || 0, moment + "|repli") % fond.length];
  }
  return l[C.jeton(graine || 0, moment + "|" + (sujet || "")) % l.length];
}

/* ==================================================================== */
/* L'ÉCHANGE — un objet qui avance, sans rien savoir de l'écran          */
/* ==================================================================== */
/** Ouvrir un échange. */
function ouvrir(scenes, ctx, vues, jour, graine) {
  return { scenes, ctx, vues: vues || {}, jour, graine,
           moment: null, sujet: null, encours: null,
           cumul: 0, dits: [], effets: [], sujetsFaits: [], fini: false };
}

/** Poser un moment (il vient te voir) ou un sujet (tu vas le voir). */
function poser(E, moment, sujet) {
  E.moment = moment; E.sujet = sujet || null;
  const s = scenePour(E.scenes, moment, E.ctx, E.vues, E.jour, E.sujet, E.graine);
  E.encours = s;
  if (s) { E.vues[s.cle] = E.jour; if (sujet) E.sujetsFaits.push(sujet); }
  return s;
}

/**
 * Répondre. Rend ce qu'il répond, l'effet à appliquer, et la trace.
 * @param {number} k  l'indice du choix
 */
function repondre(E, k) {
  const s = E.encours;
  if (!s) return null;
  const c = (s.choix || [])[k];
  if (!c) return null;
  E.cumul += (c.d || 0);
  E.dits.push({ cle: s.cle, lab: c.lab, ton: c.ton, d: c.d || 0, jour: E.jour });
  const effet = c.effet && c.effet !== "rien" ? c.effet : null;
  if (effet) E.effets.push(effet);
  E.encours = null;
  /* Une réponse peut ouvrir un sujet de plus — c'est ce qui fait une
     conversation plutôt qu'un formulaire. */
  if (c.ouvre && E.sujetsFaits.indexOf(c.ouvre) < 0) {
    const suite = poser(E, "bureau", c.ouvre);
    return { r: c.r, d: c.d || 0, ton: c.ton, effet, suite };
  }
  return { r: c.r, d: c.d || 0, ton: c.ton, effet, suite: null };
}

/** Où en est l'échange, en mots — jamais en chiffres. */
function ambiance(cumul) {
  if (cumul >= 8) return { mot: "Il repart plus léger qu'il n'est venu.", rang: "bon" };
  if (cumul >= 2) return { mot: "Ça s'est dit correctement.", rang: "correct" };
  if (cumul >= -2) return { mot: "Ni chaud ni froid. Il retourne au tapis.", rang: "neutre" };
  if (cumul >= -8) return { mot: "Il n'a pas insisté. Ce n'est pas bon signe.", rang: "tiede" };
  return { mot: "Tu viens de casser quelque chose.", rang: "casse" };
}

/* ==================================================================== */
/* CE QUE LE CONTENU PORTE — le banc le lit                              */
/* ==================================================================== */
function volume(scenes) {
  let nS = 0, nR = 0, nEff = 0, nCout = 0;
  for (const m of MOMENTS)
    for (const s of ((scenes && scenes[m]) || [])) {
      nS++;
      for (const c of (s.choix || [])) {
        nR++;
        if (c.effet && c.effet !== "rien") nEff++;
        if ((c.d || 0) <= -3) nCout++;
      }
    }
  return { scenes: nS, repliques: nR, effets: nEff, couteuses: nCout };
}

/**
 * LA REDITE — la seule mesure qui compte pour la demande de Mael.
 * On simule N semaines de bureau au rythme réel et on compte combien de
 * scènes le joueur a vues deux fois. Le stock n'est pas la question : la
 * RÉPÉTITION l'est, et aucun banc du dépôt ne la mesurait.
 * @returns {object} { vues, distinctes, redites, pireCle }
 */
function redite(scenes, ctx, semaines, parSemaine) {
  const vues = {};
  const compte = {};
  const n = parSemaine || 1;
  for (let s = 0; s < (semaines || 52); s++) {
    const jour = s * 7;
    for (let i = 0; i < n; i++) {
      const suj = SUJETS[(s * n + i) % SUJETS.length].cle;
      const sc = scenePour(scenes, "bureau", ctx, vues, jour, suj, s * 31 + i);
      if (!sc) continue;
      vues[sc.cle] = jour;
      compte[sc.cle] = (compte[sc.cle] || 0) + 1;
    }
  }
  const cles = Object.keys(compte);
  let pire = null;
  for (const k of cles) if (!pire || compte[k] > compte[pire]) pire = k;
  return { vues: cles.reduce((a, k) => a + compte[k], 0), distinctes: cles.length,
           redites: cles.reduce((a, k) => a + Math.max(0, compte[k] - 1), 0),
           pireCle: pire, pireCompte: pire ? compte[pire] : 0 };
}

module.exports = {
  MOMENTS, MOMENTS_JOUEUR, SUJETS, CARACTERES, DECLENCHEURS, EFFETS, VIES,
  PEREMPTION_DEFAUT,
  caractereDe, motCaractere, tient, revenable, nommer,
  jouables, scenePour, ouvrir, poser, repondre, ambiance, volume, redite,
};
