/**
 * fiches.js — LES COMBATTANTS NOMMES DU JEU, AU FORMAT DU MOTEUR.
 *
 * DECISION (voir carnet, section "adapter n'est pas porte") : il n'y a
 * qu'UN format de fiche, celui du moteur. Pas de pont, pas de conversion,
 * donc pas d'adapter.js. Le jour ou progression.js modifiera un combattant,
 * il modifiera CES nombres-la, ceux que le moteur tire.
 *
 * DEUX REGLES DE CONSTRUCTION, toutes deux verifiables :
 * 1. AUCUN TIRAGE ALEATOIRE. construire() ne touche pas au rng : deux
 *    fiches identiques donnent le meme Fighter, et la graine d'un combat
 *    ne depend pas de l'ordre dans lequel les fiches ont ete montees.
 *    (generer_combattant, lui, consomme le rng — c'est normal, il fait
 *    NAITRE quelqu'un ; ici on relit une fiche qui existe deja.)
 * 2. TOUTES LES CLES SONT ECRITES. Une cle absente vaudrait 50 en silence
 *    quel que soit le niveau du combattant : un champion aurait un jab de
 *    debutant sans que rien ne le signale. On part donc d'un `base` et on
 *    n'ecrit que les ECARTS, mais toutes les cles existent au final.
 *
 * Les valeurs ci-dessous decrivent les fiches de demo_jeu.html : elles
 * disent en chiffres ce que la fiche disait en mots ("Lutteur qui
 * developpe son striking", "Cardio suspect apres le R2"...). Le style
 * affiche a l'ecran doit se DEDUIRE de ces stats, jamais l'inverse.
 */
const E = require("./engine.js");
const { StrikingProfileV2 } = require("./striking_v2.js");
const { GroundProfile } = require("./ground_v2.js");
const { ClinchProfile } = require("./clinch.js");

const CLES = {
  st: ["jab", "cross", "crochet", "poing_corps", "uppercut", "overhand", "low_kick",
       "body_kick", "high_kick", "teep", "spinning", "esquive_tete", "parade",
       "blocage", "check", "posture_debout", "lecture", "vitesse_mains",
       "vitesse_jambes", "reflexes", "power", "ko_power", "footwork",
       "cage_cutting", "enchainements", "volume"],
  wr: ["shot", "clinch_wrestling", "throws", "sprawl", "whizzer", "balance", "grip_fighting"],
  cl: ["pummeling", "hand_fighting", "clinch_wrestling", "frame", "posture",
       "clinch_striking", "footwork_clinch", "top_control"],
  gr: ["passing", "posture_sol", "half_guard_top", "side_control_top", "mount_top",
       "back_top", "closed_guard_bottom", "open_guard_bottom", "butterfly_bottom",
       "half_guard_bottom", "side_control_bottom", "mount_bottom", "back_defense",
       "turtle_defense", "sweeps", "shrimping", "explosiveness", "wall_walking",
       "hand_fighting_sol", "submission_off_top", "submission_off_bottom",
       "submission_def", "ground_striking"],
  ph: ["cardio", "chin", "recovery", "body_conditioning", "balance_base"],
  me: ["discipline", "fight_iq", "aggression"],
};

const borne = v => Math.trunc(Math.max(5, Math.min(99, v)));

function _bloc(cles, base, ecarts) {
  const out = {};
  for (const k of cles) out[k] = borne(base + (ecarts[k] !== undefined ? ecarts[k] : 0));
  for (const k of Object.keys(ecarts))
    if (!cles.includes(k)) throw new Error(`fiches.js : cle inconnue "${k}"`);
  return out;
}

/** Fiche -> Fighter du moteur. Ne consomme AUCUN tirage. */
function construire(f) {
  const b = f.base;
  const e = f.ecarts || {};
  return new E.Fighter(
    f.nom,
    new StrikingProfileV2(_bloc(CLES.st, b, e.st || {})),
    new E.WrestlingProfile(_bloc(CLES.wr, b, e.wr || {})),
    new GroundProfile(_bloc(CLES.gr, b, e.gr || {})),
    new ClinchProfile(_bloc(CLES.cl, b, e.cl || {})),
    new E.PhysicalProfile(_bloc(CLES.ph, b, e.ph || {})),
    new E.MentalProfile(_bloc(CLES.me, b, e.me || {})),
    {
      gameplan: Object.assign({ striking: 0.5, wrestling: 0.3, clinch: 0.2 }, f.gameplan || {}),
      garde: f.garde === "southpaw" ? E.SOUTHPAW : E.ORTHODOX,
      stance_switching: f.stance_switching !== undefined ? f.stance_switching : 45,
      division: f.division,
    });
}

// ---------------------------------------------------------------- les fiches
const FICHES = {

  // Boxeur pressure : mains fines, avance, cardio qui tient. Sol moyen.
  Okonkwo: {
    nom: "Okonkwo", base: 71, division: "poids_welter", garde: "orthodox",
    gameplan: { striking: 0.70, wrestling: 0.16, clinch: 0.14 },
    ecarts: {
      st: { jab: +11, cross: +12, crochet: +10, uppercut: +8, poing_corps: +9,
            low_kick: -8, high_kick: -14, spinning: -20, teep: -6,
            cage_cutting: +12, enchainements: +10, volume: +8, power: +6,
            esquive_tete: +7, lecture: +6, footwork: +2 },
      wr: { sprawl: +4, shot: -8, throws: -10 },
      gr: { submission_off_bottom: -10, sweeps: -8, passing: -4 },
      ph: { cardio: +8, chin: +7 },
      me: { aggression: +10, fight_iq: +4 },
    },
  },

  // Lutteur qui developpe son striking : la lutte d'abord, les mains
  // encore en retard, le sol dessus deja bon.
  Kante: {
    nom: "Kante", base: 68, division: "poids_leger", garde: "orthodox",
    gameplan: { striking: 0.38, wrestling: 0.47, clinch: 0.15 },
    ecarts: {
      st: { jab: -6, cross: -4, crochet: -9, overhand: +7, high_kick: -16,
            spinning: -20, enchainements: -10, volume: -4, power: +8, ko_power: +4,
            esquive_tete: -5, footwork: -4 },
      wr: { shot: +14, clinch_wrestling: +10, sprawl: +12, balance: +9,
            grip_fighting: +8, throws: +4 },
      cl: { clinch_wrestling: +10, pummeling: +8, top_control: +8 },
      gr: { passing: +8, mount_top: +8, side_control_top: +9, ground_striking: +10,
            posture_sol: +7, submission_off_bottom: -8, submission_def: -6 },
      ph: { cardio: +9, recovery: +6 },
      me: { discipline: +8, fight_iq: +5 },
    },
  },

  // Brawler : gros poings, avance en ligne droite, footwork et sol faibles.
  // "Cardio suspect apres le R2" de la fiche d'analyse -> il est ECRIT ici.
  Renaud: {
    nom: "Renaud", base: 70, division: "poids_welter", garde: "orthodox",
    gameplan: { striking: 0.76, wrestling: 0.08, clinch: 0.16 },
    ecarts: {
      st: { overhand: +14, crochet: +12, uppercut: +9, cross: +8, jab: -6,
            low_kick: -10, high_kick: -18, teep: -14, spinning: -20,
            power: +14, ko_power: +12, footwork: -12, cage_cutting: +6,
            esquive_tete: -8, lecture: -9, volume: +6 },
      wr: { sprawl: -12, shot: -10, whizzer: -8, balance: -6 },
      gr: { closed_guard_bottom: -14, open_guard_bottom: -12, sweeps: -10,
            submission_def: -12, submission_off_bottom: -14, shrimping: -8 },
      ph: { chin: +9, cardio: -12, recovery: -8 },
      me: { aggression: +14, fight_iq: -8 },
    },
  },

  // Grappler : entrees, transitions, controle et soumissions du dessus.
  // Faible en garde, conformement a la taxonomie du carnet (un grappler
  // sur le dos < un jiu-jitsuka sur le dos).
  Vasile: {
    nom: "Vasile", base: 69, division: "poids_leger", garde: "orthodox",
    gameplan: { striking: 0.30, wrestling: 0.50, clinch: 0.20 },
    ecarts: {
      st: { jab: -8, cross: -8, crochet: -10, high_kick: -18, spinning: -20,
            volume: -8, power: -4, esquive_tete: -6 },
      wr: { shot: +13, clinch_wrestling: +11, sprawl: +9, grip_fighting: +10,
            balance: +8 },
      cl: { clinch_wrestling: +11, top_control: +12, pummeling: +8 },
      gr: { passing: +14, posture_sol: +11, side_control_top: +12, mount_top: +11,
            back_top: +13, submission_off_top: +12, ground_striking: +6,
            closed_guard_bottom: -10, open_guard_bottom: -9, sweeps: -6 },
      ph: { cardio: +7 },
      me: { fight_iq: +7, discipline: +6 },
    },
  },

  // Jiu-jitsuka, 19 ans : le sol tres au-dessus du reste, garde dangereuse,
  // takedowns moyens, physique et striking encore jeunes.
  Traore: {
    nom: "Traore", base: 58, division: "poids_plume", garde: "southpaw",
    gameplan: { striking: 0.34, wrestling: 0.34, clinch: 0.32 },
    ecarts: {
      st: { jab: -6, cross: -7, crochet: -8, high_kick: -12, spinning: -12,
            power: -10, ko_power: -12, volume: -6, esquive_tete: -4 },
      wr: { shot: -2, sprawl: -4, throws: +2 },
      gr: { closed_guard_bottom: +16, open_guard_bottom: +15, butterfly_bottom: +14,
            sweeps: +14, submission_off_bottom: +18, submission_off_top: +10,
            submission_def: +12, back_defense: +8, shrimping: +10, passing: +6 },
      ph: { cardio: +4, chin: -6, recovery: +4 },
      me: { discipline: +8, fight_iq: +2, aggression: -4 },
    },
  },
};

/** Renvoie un Fighter NEUF (les Fighter portent l'etat du combat : degats,
 *  cardio, knockdowns — on n'en reutilise jamais un d'un combat a l'autre). */
function fighter(id) {
  if (!(id in FICHES)) throw new Error(`fiche inconnue : ${id}`);
  return construire(FICHES[id]);
}

module.exports = { FICHES, CLES, construire, fighter };
