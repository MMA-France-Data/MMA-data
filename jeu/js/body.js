/**
 * body.js — portage de body.py.
 *
 * Le travail au corps ne tue pas directement : il fait descendre la garde,
 * vide le reservoir, et cree un risque croissant d'arret net sur le foie.
 *
 * PIEGE DE PORTAGE CONSIGNE ICI : dans resolve_body_strike, Python teste
 *     if random.uniform(0,100) >= max(12, min(88, chance)): return ...
 * puis, PLUS BAS, tire randint / random / random dans cet ordre precis, et
 * le dernier random() du risque general n'est tire QUE si ko est encore
 * faux (`if not ko and random.random() < ...`). Le court-circuit du `and`
 * fait partie du contrat : si ko est deja vrai, AUCUN tirage n'est consomme.
 */

const { alea } = require("./alea.js");

class BodyState {
  constructor(baseBodyConditioning = 50, baseGuard = 50) {
    this.degats_corps = 0;
    this.degats_foie = 0;
    this.conditioning = baseBodyConditioning;
    this.base_guard = baseGuard;
    this.coups_corps_encaisses = 0;
  }

  encaisser(degats, zonePrecise = "corps") {
    const resistance = 1 - (this.conditioning / 250);
    const reel = degats * resistance;
    this.degats_corps += reel;
    if (zonePrecise === "foie") this.degats_foie += reel;
    this.coups_corps_encaisses += 1;
    return reel;
  }

  chute_de_garde() { return Math.min(0.55, this.degats_corps / 110); }
  garde_effective() { return this.base_guard * (1 - this.chute_de_garde()); }
  defense_corps_effective() { return Math.max(0.35, 1 - this.degats_corps / 160); }
  drain_cardio() { return 1.0 + Math.min(0.75, this.degats_corps / 130); }
  cout_immediat_cardio(degats) { return degats * 0.35 * (1 + this.degats_corps / 200); }

  risque_ko_foie() {
    if (this.degats_foie < 8) return 0.005;
    let base = 0.005 + (this.degats_foie - 8) / 450;
    base *= (1 - this.conditioning / 300);
    return Math.min(0.28, base);
  }

  risque_ko_corps_general() {
    if (this.degats_corps < 45) return 0.0;
    return Math.min(0.12, (this.degats_corps - 45) / 700);
  }
}

const COUPS_CORPS = {
  body_kick:     { dmg: [7, 15], foie_chance: 0.35, cardio_mult: 1.4, poids_score: 1.0 },
  body_hook:     { dmg: [4, 10], foie_chance: 0.45, cardio_mult: 1.0, poids_score: 0.8 },
  body_straight: { dmg: [3, 8],  foie_chance: 0.25, cardio_mult: 0.8, poids_score: 0.6 },
  knee_corps:    { dmg: [6, 13], foie_chance: 0.20, cardio_mult: 1.2, poids_score: 1.0 },
  front_kick:    { dmg: [3, 8],  foie_chance: 0.05, cardio_mult: 0.9, poids_score: 0.5 },
};

function resolve_body_strike(coup, attaquantSkill, bodyState, puissance = 1.0) {
  const info = COUPS_CORPS[coup];
  const defCorps = bodyState.defense_corps_effective();
  const chance = 45 + attaquantSkill * 0.35 - defCorps * 25;

  if (alea.uniform(0, 100) >= Math.max(12, Math.min(88, chance))) {
    return [false, 0, null, 0, false];
  }

  const [lo, hi] = info.dmg;
  const dmg = Math.trunc(alea.randint(lo, hi) * puissance);
  const zone = alea.random() < info.foie_chance ? "foie" : "corps";
  const reel = bodyState.encaisser(dmg, zone);
  const coutCardio = bodyState.cout_immediat_cardio(reel) * info.cardio_mult;

  let ko = false;
  if (zone === "foie") {
    if (alea.random() < bodyState.risque_ko_foie()) ko = true;
  }
  // court-circuit volontaire : si ko est deja vrai, Python ne tire PAS.
  if (!ko && alea.random() < bodyState.risque_ko_corps_general()) ko = true;

  return [true, Math.trunc(reel), zone, coutCardio, ko];
}

function bonus_high_kick(bodyState) { return bodyState.chute_de_garde() * 55; }
function malus_defense_tete(bodyState) { return bodyState.garde_effective(); }

module.exports = {
  BodyState, COUPS_CORPS, resolve_body_strike,
  bonus_high_kick, malus_defense_tete,
};
