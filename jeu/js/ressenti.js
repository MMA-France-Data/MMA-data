/**
 * ressenti.js — CE QUE LE COMBATTANT DIT AU COIN, ENTRE DEUX ROUNDS.
 *
 * (Chantier grave au carnet le 21/08, cas 104 §3 : « au coin, le
 * combattant dit SON RESSENTI avant les consignes ». Et la condition
 * posee dans la meme phrase : LE RESSENTI DOIT VENIR DU MOTEUR, PAS D'UNE
 * BANQUE DE PHRASES HORS-SOL.)
 *
 * ===================================================================
 * LES QUATRE REGLES DU MODULE
 * ===================================================================
 * 1. CHAQUE PHRASE A UN FAIT DERRIERE. Aucune ligne n'est tiree au sort :
 *    chacune sort d'un champ du moteur franchi (head_damage, cardio,
 *    body.degats_corps, legs, sonne, knockdowns, le bilan du round).
 *    Un ressenti sans fait est un mensonge, et l'ecran ne ment jamais.
 *
 * 2. IL PARLE, IL NE RAPPORTE PAS. Aucun chiffre ne sort d'ici. Un homme
 *    assis sur son tabouret ne dit pas « cardio 34 % », il dit qu'il ne
 *    sent plus ses jambes.
 *
 * 3. /!\ CE QU'IL DIT EST SON AVIS, PAS LA VERITE. La regle fondatrice du
 *    jeu, celle des estimations de coach : un homme lucide (fight_iq
 *    haut) nomme le vrai probleme ; un homme qui ne se lit pas dit que ca
 *    va, ou se plaint de ce qui ne le tue pas. Le coach a donc deux
 *    sources et elles peuvent DIVERGER — c'est le sel du coin.
 *    En face : LES SIGNES, ce que le coin VOIT sur le corps. Eux ne
 *    mentent pas. Le joueur croise les deux.
 *
 * 4. AUCUN TIRAGE. /!\ Le hasard du combat est global et le coin vit
 *    entre deux rounds (voir l'avertissement de coin.js) : une seule
 *    ligne de alea() ici decalerait le flux et le combat ne serait plus
 *    celui de la graine. La part « subjective » est donc derivee de
 *    l'etat lui-meme, jamais tiree. Deux fois le meme combat = deux fois
 *    le meme ressenti.
 *
 * Ce module ne DECIDE de rien : il rend a lire. Les leviers cites dans
 * `demande` sont ceux qui existent deja dans coin.js (plan, allure,
 * cible, sol) — le ressenti mene aux consignes, il n'en invente pas.
 */

/* ==================================================================== */
/* LES SEUILS — MESURES, PAS DEVINES.                                    */
/* Releve sur 80 combats en 5 rounds, etat lu A LA CLOCHE (donc apres la  */
/* recuperation, exactement ce que le coin voit) :                       */
/*   tete    p25  38 · med 121 · p75 276 · p90 498                       */
/*   cardio  p25  15 · med  52 · p75  80                                 */
/*   corps   p25   3 · med  11 · p75  31 · p90  69                       */
/*   jambes  p25   0 · med   3 · p75   9 · p90  42                       */
/* Les paliers se posent sur ces quantiles : « entame » commence ou la    */
/* moitie des hommes sont passes, « casse » ou il n'en reste qu'un sur    */
/* dix. Un seuil au doigt mouille aurait fait parler tout le monde pareil.*/
/* ==================================================================== */
const SEUILS = {
  tete:   { gene: 140, dur: 300, casse: 500 },
  cardio: { tire: 45,  court: 22, vide: 12 },
  corps:  { gene: 30,  dur: 70 },
  jambes: { gene: 9,   dur: 40 },
};

/**
 * LES FAITS. Ce que le moteur dit du corps de cet homme, sans
 * interpretation. Trie du plus grave au moins grave : c'est l'ordre dans
 * lequel un homme lucide en parlerait.
 * @returns {Array<{cle,gravite,signe,mot,levier}>}
 */
function faits(f, ctx = {}) {
  const L = [];
  const P = (cle, gravite, signe, mot, levier) => L.push({ cle, gravite, signe, mot, levier });

  /* La tete d'abord : c'est ce qui finit les combats. */
  const t = f.head_damage || 0;
  if (t >= SEUILS.tete.casse)
    P("tete", 1.0, "le regard part en arrière, il cligne trop",
      "Je ne les vois plus partir. Ils arrivent, c'est tout.", { cible: "corps" });
  else if (t >= SEUILS.tete.dur)
    P("tete", 0.75, "la tête est marquée, une pommette gonfle",
      "J'en ai pris. Ça cogne derrière les yeux.", { allure: "eco" });
  else if (t >= SEUILS.tete.gene)
    P("tete", 0.4, "il a mangé quelques mains propres",
      "Il touche. Il faut que je remonte la garde.", null);

  /* Le reservoir. */
  const c = f.cardio === undefined ? 100 : f.cardio;
  if (c <= SEUILS.cardio.vide)
    P("cardio", 0.95, "il souffle par la bouche, les mains sur les cuisses",
      "Je n'ai plus rien. Plus rien du tout.", { allure: "eco" });
  else if (c <= SEUILS.cardio.court)
    P("cardio", 0.7, "la poitrine se soulève vite, il met du temps à répondre",
      "Je suis court. Il faut que je gère.", { allure: "eco" });
  else if (c <= SEUILS.cardio.tire)
    P("cardio", 0.35, "il respire fort mais il tient",
      "Ça tire, mais je tiens.", null);

  /* Le corps : ce qui vide le reservoir sans se voir. */
  const b = (f.body && f.body.degats_corps) || 0;
  if (b >= SEUILS.corps.dur)
    P("corps", 0.8, "il garde le coude collé aux côtes",
      "Il me démonte le corps. Je n'arrive plus à respirer à fond.", { plan: "clinch" });
  else if (b >= SEUILS.corps.gene)
    P("corps", 0.45, "la garde descend d'un cran à chaque coup au corps",
      "Il travaille le corps. Ça commence à peser.", null);

  /* Les jambes : la mobilite, donc tout le reste. */
  const j = f.legs ? (f.legs.total ? f.legs.total() : (f.legs.gauche || 0) + (f.legs.droite || 0)) : 0;
  if (j >= SEUILS.jambes.dur)
    P("jambes", 0.85, "il boite en revenant au coin",
      "La jambe est morte. Je ne peux plus m'appuyer dessus.", { plan: "lutte" });
  else if (j >= SEUILS.jambes.gene)
    P("jambes", 0.4, "il change d'appui trop souvent",
      "Il me mange la cuisse. Il faut que je la sorte.", null);

  /* Ce qui ne se discute pas. */
  if ((f.sonne || 0) > 0)
    P("sonne", 1.0, "il est encore dedans, il regarde à côté de toi",
      "Ça va. Ça va, je te dis.", { allure: "eco" });
  if ((f.knockdowns || 0) > 0)
    P("knockdown", 0.9, "il a touché la toile ce round",
      "Il m'a eu une fois. Il ne m'aura pas deux.", null);

  L.sort((a, b2) => b2.gravite - a.gravite);
  return L;
}

/**
 * CE QUE LE COIN VOIT. Objectif : le corps ne ment pas. C'est le
 * contrepoint de ce qu'il RACONTE.
 */
function signes(f, ctx = {}) {
  return faits(f, ctx).filter((x) => x.gravite >= 0.4).slice(0, 3).map((x) => x.signe);
}

/**
 * SA LUCIDITE. /!\ MEME REGLE QUE LES ESTIMATIONS DE COACH : ce n'est pas
 * un tirage, c'est une competence. fight_iq lit le combat ; la fatigue et
 * les coups pris la rabotent — un homme sonne ne se lit plus.
 * @returns {number} 0 (il ne comprend rien) .. 1 (il nomme le vrai)
 */
function lucidite(f) {
  const iq = (f.mental && f.mental.fight_iq) !== undefined ? f.mental.fight_iq : 50;
  let v = Math.max(0, Math.min(1, (iq - 22) / 62));
  if ((f.sonne || 0) > 0) v *= 0.35;
  const c = f.cardio === undefined ? 100 : f.cardio;
  if (c <= SEUILS.cardio.court) v *= 0.75;
  if ((f.head_damage || 0) >= SEUILS.tete.dur) v *= 0.8;
  return Math.max(0, Math.min(1, v));
}

/* /!\ LA PART SUBJECTIVE SE DERIVE, ELLE NE SE TIRE PAS (regle 4). Un
   entier stable a partir de l'etat : meme combat, meme graine, meme
   phrase. Le round entre dedans pour qu'il ne dise pas trois fois de
   suite exactement la meme chose sans raison. */
function jeton(f, round) {
  let h = 2166136261 >>> 0;
  const s = String(f.name || "") + "|" + round + "|"
    + Math.trunc(f.head_damage || 0) + "|" + Math.trunc(f.cardio || 0);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

/* Quand il n'a rien de grave a dire — et ca arrive, c'est meme le but. */
const RIEN = [
  "Ça va. Je le sens, je le lis. Laisse-moi y aller.",
  "Il ne me fait rien. Dis-moi juste où appuyer.",
  "Je suis bien. Le round est à moi, non ?",
];

/**
 * LE RESSENTI COMPLET, tel que l'ecran du coin l'affiche.
 *
 * @param {Fighter} f      mon combattant, dans son etat A LA CLOCHE
 * @param {object} ctx     { round, gagne:boolean|null, adv:Fighter }
 * @returns {{etat,dit,signes,demande,lucide,faits}}
 *   etat    : "frais" | "entame" | "touche" | "cassé"  — un mot, pas un chiffre
 *   dit     : ce qu'il dit, LUI (bruite par sa lucidite)
 *   signes  : ce que le coin voit (jamais bruite)
 *   demande : {levier, valeur, mot} ou null — mene vers les consignes
 *   lucide  : a-t-il nomme le vrai probleme ?
 */
function ressenti(f, ctx = {}) {
  const F = faits(f, ctx);
  const round = ctx.round || 1;
  const lu = lucidite(f);
  const pire = F[0] || null;
  const grave = pire ? pire.gravite : 0;

  const etat = grave >= 0.85 ? "cassé" : grave >= 0.6 ? "touché"
             : grave >= 0.35 ? "entamé" : "frais";

  /* CE QU'IL DIT. Trois cas, et le troisieme est le plus interessant :
     l'homme qui se trompe de probleme. */
  let dit, lucide = true, demande = null;
  if (!F.length) {
    dit = RIEN[jeton(f, round) % RIEN.length];
    /* /!\ MEME FRAIS, IL A UN AVIS — sinon le coin d'un homme qui domine
       est muet, et c'est justement la qu'on gagne les combats. */
    if (ctx.gagne === false)
      dit = "Le round est parti. Je le sais. Dis-moi quoi changer.";
  } else if (lu >= 0.55) {
    dit = pire.mot;
    demande = pire.levier ? { ...pire.levier, mot: pire.mot } : null;
  } else if (lu >= 0.3 && F.length > 1) {
    /* Il sent QUELQUE CHOSE, mais pas le pire. */
    const autre = F[F.length - 1];
    dit = autre.mot;
    lucide = false;
    demande = autre.levier ? { ...autre.levier, mot: autre.mot } : null;
  } else {
    /* Il ne se lit pas. Il dit que ca va — et les signes disent le
       contraire. C'est au coach de trancher. */
    dit = grave >= 0.85 ? "Ça va. Renvoie-moi." : "Ça va bien. Je le tiens.";
    lucide = false;
  }

  /* Le momentum : ce que le round vient de dire. Un fait, lui aussi.
     /!\ « Il commence a me regarder » est SORTIE (Mael, 27/08 : "j'aime
     pas du tout cette phrase") — elle voulait dire "il commence a me
     craindre" et se lisait de travers. Le repertoire est DERIVE de
     l'etat (jeton), jamais tire : meme combat, meme phrase. */
  if (ctx.gagne === true && etat !== "cassé") {
    const MOMENTUM = [
      " Le round est pour moi, je le sais.",
      " Je le sens plier.",
      " Il recule. C'est bon signe.",
      " Je suis en train de le user.",
    ];
    dit += MOMENTUM[jeton(f, round) % MOMENTUM.length];
  } else if (ctx.gagne === false && lu >= 0.55 && F.length)
    dit += " Et il a pris le round.";

  return { etat, dit, signes: signes(f, ctx), demande, lucide, faits: F };
}

module.exports = { ressenti, faits, signes, lucidite, SEUILS };
