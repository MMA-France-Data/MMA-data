/**
 * diner.js — LA SOIRÉE AVEC LE MATCHMAKER : la mécanique.
 *
 * (Mael, 01/09 : « les dîners avec matchmaker, je veux que ce soit une
 * nouvelle fenêtre comme on a fait avec combat et recrutement, et
 * beaucoup plus de dialogues, de réponses, de questions. »)
 *
 * CE QU'IL Y AVAIT : trois questions, neuf réponses, dans le petit
 * panneau. Un couloir, pas une soirée.
 *
 * CE QU'IL Y A MAINTENANT : DIX MOMENTS qui s'enchaînent — l'arrivée,
 * ce qu'il veut savoir de vous, ce qu'il pense de vos hommes, comment on
 * fabrique une carte, la télé et l'argent, les concurrentes, ce qui ne
 * se dit pas, l'homme derrière le métier, le café, l'addition — et le
 * contenu vit à part, dans diner_scenes.js.
 *
 * ===================================================================
 * LES QUATRE RÈGLES DU MODULE
 * ===================================================================
 * 1. AUCUN TIRAGE. La scène jouée à chaque moment est DÉRIVÉE (jeton
 *    d'organisation + jour + moment). Deux fois le même dîner le même
 *    jour = la même soirée. C'est la règle du ressenti (module 4) et
 *    celle du carnet : ce qui est reproductible se débogue.
 * 2. LA SOIRÉE SAIT OÙ ELLE EST. Chaque scène porte une condition tirée
 *    d'une LISTE FERMÉE (premier dîner ? relation froide ? un champion à
 *    la salle ?) — une scène qui ne colle pas à la situation ne sort
 *    pas. Un matchmaker qui vous parle de votre champion quand vous
 *    n'en avez pas, c'est un dialogue mort.
 * 3. UNE RÉPONSE PEUT OUVRIR UN SUJET. `ouvre` intercale une scène de
 *    plus : c'est ce qui fait une conversation plutôt qu'un formulaire.
 *    Une scène ne s'ouvre qu'UNE fois par soirée.
 * 4. RIEN N'EST DÉCORATIF. Chaque réponse porte son effet sur la
 *    relation, et le total décide de la fin de soirée — et de ce qu'il
 *    lâche au café.
 *
 * Module PUR : pas de DOM, pas d'état global, pas de hasard. Banc 36.
 */

/** L'ordre des moments. La soirée les traverse tous. */
const MOMENTS = ["arrivee", "lui_sur_vous", "vos_hommes", "le_metier",
                 "la_tele", "concurrence", "coulisses", "personnel",
                 "cafe", "addition"];

/** Les conditions autorisées — liste FERMÉE : une condition inventée
 *  serait une scène qui ne sort jamais, sans que personne le sache. */
const CONDITIONS = ["toujours", "premier", "habitue", "froid", "tiede",
                    "chaud", "aChampion", "aClasse", "debutant",
                    "grosseSalle", "petiteSalle"];

/**
 * La condition tient-elle ?
 * @param {string} si   une clé de CONDITIONS
 * @param {object} ctx  { premier, relation, aChampion, aClasse, reputation }
 */
function tient(si, ctx) {
  const rel = ctx.relation === undefined ? 50 : ctx.relation;
  const rep = ctx.reputation === undefined ? 0 : ctx.reputation;
  switch (si) {
    case "toujours":    return true;
    case "premier":     return !!ctx.premier;
    case "habitue":     return !ctx.premier;
    case "froid":       return rel < 40;
    case "tiede":       return rel >= 40 && rel < 65;
    case "chaud":       return rel >= 65;
    case "aChampion":   return !!ctx.aChampion;
    case "aClasse":     return !!ctx.aClasse;
    case "debutant":    return !ctx.aClasse && !ctx.aChampion;
    case "grosseSalle": return rep >= 60;
    case "petiteSalle": return rep < 30;
    /* /!\ UNE CONDITION INCONNUE NE PASSE PAS EN SILENCE. Le banc la
       refuse à la source ; ici on la traite comme fausse ET on le dit,
       plutôt que de laisser une scène morte dans le jeu. */
    default:
      if (typeof console !== "undefined")
        console.error(`diner.js : condition inconnue "${si}"`);
      return false;
  }
}

/** Un entier stable dérivé de la soirée — la place du tirage (règle 1). */
function jeton(graine, moment) {
  let h = 2166136261 >>> 0;
  const s = String(graine) + "|" + moment;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

/**
 * La scène jouée à ce moment : parmi celles qui COLLENT, celle que le
 * jeton désigne — et jamais une déjà vue ce soir.
 * @param {object} scenes  le contenu (diner_scenes.js)
 * @param {string} moment  une clé de MOMENTS
 * @param {object} ctx     la situation
 * @param {number} graine  stable pour la soirée
 * @param {Array}  vues    les clés déjà jouées
 */
function scenePour(scenes, moment, ctx, graine, vues) {
  const lot = (scenes && scenes[moment]) || [];
  const dispo = lot.filter((s) => tient(s.si, ctx) && vues.indexOf(s.cle) < 0);
  /* /!\ SI RIEN NE COLLE, ON REPLIE SUR "toujours" plutôt que de sauter
     le moment : une soirée à trous se remarque plus qu'une scène un peu
     générique. */
  const fond = lot.filter((s) => s.si === "toujours" && vues.indexOf(s.cle) < 0);
  const liste = dispo.length ? dispo : fond;
  if (!liste.length) return null;
  return liste[jeton(graine, moment) % liste.length];
}

/** Retrouver une scène par sa clé, tous moments confondus (pour `ouvre`). */
function sceneParCle(scenes, cle) {
  for (const m of MOMENTS)
    for (const s of (scenes[m] || [])) if (s.cle === cle) return s;
  return null;
}

/* ==================================================================== */
/* LE DÉROULÉ — un objet SOIRÉE qui avance, sans rien savoir de l'écran */
/* ==================================================================== */

/** Ouvrir la soirée. */
function commencer(scenes, ctx, graine) {
  return { scenes, ctx, graine, i: 0, cumul: 0, vues: [], dits: [],
           encours: null, enAttente: [], fini: false };
}

/** La scène à afficher maintenant — ou null si la soirée est finie. */
function courante(S) {
  if (S.encours) return S.encours;
  /* Un sujet ouvert par une réponse passe AVANT la suite du repas. */
  while (S.enAttente.length) {
    const cle = S.enAttente.shift();
    const s = sceneParCle(S.scenes, cle);
    if (s && S.vues.indexOf(s.cle) < 0) { S.encours = s; S.vues.push(s.cle); return s; }
  }
  while (S.i < MOMENTS.length) {
    const m = MOMENTS[S.i++];
    const s = scenePour(S.scenes, m, S.ctx, S.graine, S.vues);
    if (s) { S.encours = s; S.vues.push(s.cle); s.moment = m; return s; }
  }
  S.fini = true;
  return null;
}

/**
 * Répondre. Rend ce qu'il répond, et fait avancer la soirée.
 * @param {object} S  la soirée
 * @param {number} k  l'indice du choix
 */
function repondre(S, k) {
  const s = S.encours;
  if (!s) return null;
  const c = (s.choix || [])[k];
  if (!c) return null;
  S.cumul += (c.d || 0);
  S.dits.push({ cle: s.cle, lab: c.lab, ton: c.ton, d: c.d || 0 });
  if (c.ouvre && S.enAttente.indexOf(c.ouvre) < 0
      && S.vues.indexOf(c.ouvre) < 0) S.enAttente.push(c.ouvre);
  S.encours = null;
  return { r: c.r, d: c.d || 0, ton: c.ton };
}

/** Où en est la soirée, en mots — jamais en chiffres. */
function ambiance(cumul) {
  if (cumul >= 14) return { mot: "Il a passé une vraie bonne soirée.", rang: "excellent" };
  if (cumul >= 6)  return { mot: "La soirée s'est bien passée.", rang: "bon" };
  if (cumul >= -2) return { mot: "Soirée correcte. Poignée de main, et rendez-vous l'an prochain.", rang: "correct" };
  if (cumul >= -10) return { mot: "Il a regardé sa montre deux fois de trop.", rang: "tiede" };
  return { mot: "Il a écourté. Vous avez mal joué.", rang: "rate" };
}

/** Combien de scènes et de répliques le contenu porte — le banc le lit. */
function volume(scenes) {
  let nS = 0, nR = 0;
  for (const m of MOMENTS)
    for (const s of (scenes[m] || [])) { nS++; nR += (s.choix || []).length; }
  return { scenes: nS, repliques: nR };
}

module.exports = { MOMENTS, CONDITIONS, tient, jeton, scenePour, sceneParCle,
                   commencer, courante, repondre, ambiance, volume };
