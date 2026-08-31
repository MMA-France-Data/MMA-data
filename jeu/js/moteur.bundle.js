/* moteur.bundle.js — GENERE PAR bundler.js, NE PAS EDITER A LA MAIN.
 * Modules embarques (ordre de dependance) : alea.js, stance.js, body.js, tables.js, striking_v2.js, clinch.js, ground_v2.js, engine.js, generator.js, traducteur.js, mesure.js, temps.js, fiches.js, verdict.js, profil.js, chrono.js, feuille.js, coin.js, classement.js, grappling.js, etoiles.js, carriere.js, vivier.js, cartes.js, entente.js, salle.js, relation.js, offres.js, dialogue.js, demandes.js, contrats.js, cris.js, ressenti.js, demandes_staff.js, endgame.js, vestiaire.js, soiree.js, choregraphie.js
 * Regenerer apres toute modification d'un module : node js/bundler.js
 */
(function (racine) {
  "use strict";
  var __mods = {}, __cache = {};
  function __def(nom, fn) { __mods[nom] = fn; }
  function require(nom) {
    nom = String(nom).replace(/^\.\//, "");
    if (__cache[nom]) return __cache[nom].exports;
    if (!__mods[nom]) throw new Error("module absent du bundle : " + nom);
    var m = { exports: {} };
    __cache[nom] = m;
    __mods[nom](m, m.exports, require);
    return m.exports;
  }

/* ===== alea.js ======================================================= */
__def("alea.js", function (module, exports, require) {
/**
 * alea.js — le module `random` de Python, au bit pres, en JavaScript.
 *
 * POURQUOI CE FICHIER EXISTE ET POURQUOI IL EST LE PREMIER
 * Le portage du moteur se verifie en rejouant LE MEME combat des deux cotes
 * et en comparant les logs LIGNE A LIGNE. Ca n'a de sens que si les deux
 * implementations tirent exactement la meme suite de nombres. Une divergence
 * d'un seul tirage et toute comparaison devient impossible : on ne saurait
 * plus distinguer un bug de portage d'un simple hasard different.
 *
 * Il ne suffit PAS d'avoir un Mersenne Twister. Python pose ses propres
 * conventions par-dessus, et ce sont elles qui font les pieges :
 *   - randint() n'est PAS floor(random()*n) : c'est du tirage par rejet sur
 *     un nombre entier de bits, donc il consomme un nombre VARIABLE de mots
 *     de 32 bits.
 *   - gauss() calcule DEUX valeurs a la fois et garde la seconde en cache
 *     entre les appels. Un appel sur deux ne consomme rien du tout.
 *   - random() consomme DEUX mots de 32 bits, pas un.
 *   - seed(n) ne fait pas init_genrand(n) mais init_by_array([n]).
 * Chacun de ces points, mal porte, donne un generateur qui a l'air correct
 * sur une moyenne et diverge sur la 3e ligne du premier combat.
 *
 * Reference : CPython 3.12, Modules/_randommodule.c et Lib/random.py.
 */

const N = 624, M = 397;
const MATRIX_A = 0x9908b0df, UPPER_MASK = 0x80000000, LOWER_MASK = 0x7fffffff;

class Alea {
  constructor(graine) {
    this.mt = new Uint32Array(N);
    this.mti = N + 1;
    this.gaussSuivant = null;      // cache de gauss(), cf. plus bas
    this.seed(graine === undefined ? 0 : graine);
  }

  // ---------------------------------------------------------------- coeur MT
  _initGenrand(s) {
    this.mt[0] = s >>> 0;
    for (let i = 1; i < N; i++) {
      const prec = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      // Math.imul : la seule multiplication 32 bits fiable en JS. Un `*`
      // ordinaire passe par un double et perd les bits de poids fort.
      this.mt[i] = (Math.imul(1812433253, prec) + i) >>> 0;
    }
    this.mti = N;
  }

  _initByArray(cle) {
    this._initGenrand(19650218);
    let i = 1, j = 0;
    let k = Math.max(N, cle.length);
    for (; k; k--) {
      const prec = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((this.mt[i] ^ Math.imul(prec, 1664525)) >>> 0) + cle[j] + j) >>> 0;
      i++; j++;
      if (i >= N) { this.mt[0] = this.mt[N - 1]; i = 1; }
      if (j >= cle.length) j = 0;
    }
    for (k = N - 1; k; k--) {
      const prec = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((this.mt[i] ^ Math.imul(prec, 1566083941)) >>> 0) - i) >>> 0;
      i++;
      if (i >= N) { this.mt[0] = this.mt[N - 1]; i = 1; }
    }
    this.mt[0] = 0x80000000;
  }

  /**
   * seed(n) — Python prend la VALEUR ABSOLUE de l'entier, la decoupe en mots
   * de 32 bits en petit-boutien, et passe ce tableau a init_by_array.
   * Le cas n = 0 est special-case cote CPython : la cle vaut [0].
   */
  seed(n) {
    this.gaussSuivant = null;      // seed() reinitialise AUSSI le cache gauss
    let v = Math.abs(Math.trunc(n));
    const cle = [];
    if (v === 0) cle.push(0);
    // 2**32 exactement : on reste en flottant, sur des graines de jeu
    // (< 2**53) c'est exact.
    while (v > 0) { cle.push(v % 4294967296 >>> 0); v = Math.floor(v / 4294967296); }
    this._initByArray(cle);
  }

  _genrandUint32() {
    let y;
    if (this.mti >= N) {
      if (this.mti === N + 1) this._initGenrand(5489);
      for (let kk = 0; kk < N - M; kk++) {
        y = ((this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK)) >>> 0;
        this.mt[kk] = (this.mt[kk + M] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      for (let kk = N - M; kk < N - 1; kk++) {
        y = ((this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK)) >>> 0;
        this.mt[kk] = (this.mt[kk + (M - N)] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      y = ((this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK)) >>> 0;
      this.mt[N - 1] = (this.mt[M - 1] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      this.mti = 0;
    }
    y = this.mt[this.mti++];
    y = (y ^ (y >>> 11)) >>> 0;
    y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0;
    y = (y ^ ((y << 15) & 0xefc60000)) >>> 0;
    y = (y ^ (y >>> 18)) >>> 0;
    return y >>> 0;
  }

  // ------------------------------------------------------------ API Python
  /** random() — 53 bits de precision, donc DEUX mots de 32 bits consommes. */
  random() {
    const a = this._genrandUint32() >>> 5;
    const b = this._genrandUint32() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }

  /** getrandbits(k) — limite a 32 bits : le moteur n'a jamais besoin de plus. */
  getrandbits(k) {
    if (k === 0) return 0;
    if (k > 32) throw new Error("getrandbits > 32 non porte (inutile ici)");
    return this._genrandUint32() >>> (32 - k);
  }

  /**
   * _randbelow(n) — TIRAGE PAR REJET, pas un modulo.
   * On tire k bits (k = taille de n en bits) et on RECOMMENCE tant que le
   * resultat depasse n. C'est ce qui rend le nombre de mots consommes
   * variable, et c'est exactement ce qu'il faut reproduire.
   */
  _randbelow(n) {
    if (!n) return 0;
    const k = 32 - Math.clz32(n);          // n.bit_length()
    let r = this.getrandbits(k);
    while (r >= n) r = this.getrandbits(k);
    return r;
  }

  randint(a, b) { return a + this._randbelow(b - a + 1); }

  /**
   * sample(population, k) — l'algorithme EXACT de CPython (random.py).
   * Deux branches selon la taille : pool copie + echange pour les petites
   * populations, ensemble de selection avec rejet pour les grandes. Le
   * SEUIL (setsize) fait partie de l'algorithme : le rater change quels
   * tirages sont consommes. mesure.py fait sample(roster_de_40, 2) -> la
   * branche "selection set" (40 > 21).
   */
  sample(population, k) {
    const n = population.length;
    let setsize = 21;                       // taille de table pour k=5
    if (k > 5) setsize += Math.pow(4, Math.ceil(Math.log(k * 3) / Math.log(4)));
    const result = new Array(k);
    if (n <= setsize) {
      const pool = population.slice();
      for (let i = 0; i < k; i++) {
        const j = this._randbelow(n - i);
        result[i] = pool[j];
        pool[j] = pool[n - i - 1];
      }
    } else {
      const selected = new Set();
      for (let i = 0; i < k; i++) {
        let j = this._randbelow(n);
        while (selected.has(j)) j = this._randbelow(n);
        selected.add(j);
        result[i] = population[j];
      }
    }
    return result;
  }

  randrange(debut, fin) { return debut + this._randbelow(fin - debut); }

  uniform(a, b) { return a + (b - a) * this.random(); }

  choice(seq) { return seq[this._randbelow(seq.length)]; }

  /**
   * gauss(mu, sigma) — methode polaire. Elle produit DEUX valeurs par calcul :
   * Python garde la seconde en cache et la ressort telle quelle au prochain
   * appel, SANS consommer un seul tirage. Un portage qui recalcule a chaque
   * fois consomme deux fois trop de hasard et diverge immediatement.
   */
  gauss(mu = 0, sigma = 1) {
    let z = this.gaussSuivant;
    this.gaussSuivant = null;
    if (z === null) {
      const x2pi = this.random() * 2 * Math.PI;
      const g2rad = Math.sqrt(-2.0 * Math.log(1.0 - this.random()));
      z = Math.cos(x2pi) * g2rad;
      this.gaussSuivant = Math.sin(x2pi) * g2rad;
    }
    return mu + z * sigma;
  }

  /** choices() — poids cumules puis bisect_right, un random() par tirage. */
  choices(population, poids = null, k = 1) {
    const n = population.length;
    const res = [];
    if (poids === null) {
      for (let i = 0; i < k; i++) res.push(population[Math.floor(this.random() * n)]);
      return res;
    }
    const cum = [];
    let s = 0;
    for (const p of poids) { s += p; cum.push(s); }
    const total = cum[cum.length - 1] + 0.0;
    const hi = n - 1;
    for (let i = 0; i < k; i++) {
      const x = this.random() * total;
      // bisect_right(cum, x, 0, hi)
      let lo = 0, h = hi;
      while (lo < h) {
        const mid = (lo + h) >> 1;
        if (x < cum[mid]) h = mid; else lo = mid + 1;
      }
      res.push(population[lo]);
    }
    return res;
  }

  /** sample() — les deux branches de CPython, le choix depend de k et n. */
  sample(population, k) {
    const n = population.length;
    const res = new Array(k);
    let setsize = 21;
    if (k > 5) setsize += Math.pow(4, Math.ceil(Math.log(k * 3) / Math.log(4)));
    if (n <= setsize) {
      const pool = population.slice();
      for (let i = 0; i < k; i++) {
        const j = this._randbelow(n - i);
        res[i] = pool[j];
        pool[j] = pool[n - i - 1];
      }
    } else {
      const vus = new Set();
      for (let i = 0; i < k; i++) {
        let j = this._randbelow(n);
        while (vus.has(j)) j = this._randbelow(n);
        vus.add(j);
        res[i] = population[j];
      }
    }
    return res;
  }
}

// Instance de module, pour coller a `import random` cote Python.
const alea = new Alea(0);

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Alea, alea };
}

});

/* ===== stance.js ===================================================== */
__def("stance.js", function (module, exports, require) {
/**
 * stance.js — portage de stance.py.
 *
 * Garde, stabilite, degats par jambe. Les calf kicks visent la jambe AVANT ;
 * changer de garde la met a l'abri mais coute en efficacite si le combattant
 * n'est pas a l'aise des deux cotes.
 *
 * REGLE DE PORTAGE : on reproduit le comportement de Python, pas son style.
 * Deux pieges concrets ici :
 *   - int() en Python TRONQUE vers zero, ce n'est PAS Math.round ni
 *     Math.floor (identiques seulement sur les positifs). On utilise
 *     Math.trunc partout ou Python ecrit int().
 *   - l'ORDRE des appels au RNG est du code metier, pas du detail : chaque
 *     random() consomme deux mots de 32 bits. Reordonner deux lignes suffit
 *     a faire diverger tout le combat.
 */

const { alea } = require("./alea.js");

const ORTHODOX = "orthodox";
const SOUTHPAW = "southpaw";

class LegDamage {
  constructor() { this.gauche = 0; this.droite = 0; }
  add(cote, montant) { this[cote] += montant; }
  total() { return this.gauche + this.droite; }
  get(cote) { return this[cote]; }
}

class StanceState {
  constructor(gardeNaturelle = ORTHODOX, stanceSwitching = 50) {
    this.garde_naturelle = gardeNaturelle;
    this.garde_actuelle = gardeNaturelle;
    this.stance_switching = stanceSwitching;
    this.switches = 0;
  }
  jambe_avant()  { return this.garde_actuelle === ORTHODOX ? "gauche" : "droite"; }
  jambe_arriere(){ return this.garde_actuelle === ORTHODOX ? "droite" : "gauche"; }
  en_garde_inversee() { return this.garde_actuelle !== this.garde_naturelle; }
  switch() {
    this.garde_actuelle = this.garde_actuelle === ORTHODOX ? SOUTHPAW : ORTHODOX;
    this.switches += 1;
  }
  penalite_garde() {
    if (!this.en_garde_inversee()) return 0.0;
    return Math.max(0.0, (100 - this.stance_switching) / 100) * 0.45;
  }
}

// ------------------------------------------------------------- STABILITE
function stabilite(stance, legDmg, baseBalance = 50) {
  const dmgAvant = legDmg.get(stance.jambe_avant());
  const dmgArriere = legDmg.get(stance.jambe_arriere());
  let perte = (dmgAvant * 1.0 + dmgArriere * 0.18) / 78;
  perte *= (1.4 - baseBalance / 200);
  return Math.max(0.25, 1.0 - Math.min(0.75, perte));
}

function facteur_puissance(stance, legDmg, baseBalance = 50) {
  const dmgArriere = legDmg.get(stance.jambe_arriere());
  const dmgAvant = legDmg.get(stance.jambe_avant());
  const perte = (dmgArriere * 0.7 + dmgAvant * 0.5) / 88;
  const base = Math.max(0.4, 1.0 - Math.min(0.6, perte));
  return base * (1 - stance.penalite_garde() * 0.6);
}

function facteur_esquive(stance, legDmg, baseBalance = 50) {
  return Math.pow(stabilite(stance, legDmg, baseBalance), 1.2);
}

function facteur_precision(stance) { return 1 - stance.penalite_garde(); }

// ------------------------------------------------ DECISION DE SWITCHER
function veut_switcher(stance, legDmg, fightIq = 50, seuil = 25) {
  const dmgAvant = legDmg.get(stance.jambe_avant());
  const dmgArriere = legDmg.get(stance.jambe_arriere());

  if (dmgAvant < seuil) return [false, null];
  const ecart = dmgAvant - dmgArriere;
  if (ecart < 8) return [false, null];

  const benefice = ecart / 60;
  const cout = stance.en_garde_inversee()
    ? 0.0 : (100 - stance.stance_switching) / 100 * 0.45;

  let proba = 0.20 + fightIq / 200 + benefice - cout;
  if (stance.stance_switching < 40) proba *= 0.08;
  else if (stance.stance_switching < 60) proba *= 0.45;

  // /!\ Le random() est tire APRES les deux sorties anticipees ci-dessus.
  // Le remonter en haut de fonction consommerait du hasard sur des appels
  // qui n'en consomment pas cote Python.
  if (alea.random() < Math.max(0.0, Math.min(0.9, proba))) {
    const cote = stance.jambe_avant();
    return [true, `jambe ${cote} à ${dmgAvant} (autre à ${dmgArriere})`];
  }
  return [false, null];
}

// ---------------------------------------------------- CIBLAGE DES KICKS
function cible_kick(attaquantStance, defenseurStance, typeKick) {
  if (typeKick === "calf_kick" || typeKick === "low_kick") {
    if (alea.random() < 0.8) return defenseurStance.jambe_avant();
    return defenseurStance.jambe_arriere();
  }
  return defenseurStance.jambe_avant();
}

function resolve_leg_kick(attaquant, defenseur, atkStance, defStance,
                          atkLegs, defLegs, typeKick, checkStat, kickingStat) {
  const puissance = facteur_puissance(atkStance, atkLegs);
  const precision = facteur_precision(atkStance);
  const esquiveDef = facteur_esquive(defStance, defLegs);

  const chance = (45 + (kickingStat - checkStat) * 0.8) * precision - esquiveDef * 10;
  if (alea.uniform(0, 100) < Math.max(8, Math.min(90, chance))) {
    const cote = cible_kick(atkStance, defStance, typeKick);
    const dmg = Math.trunc(alea.randint(4, 10) * puissance);
    defLegs.add(cote, dmg);
    return ["touché", dmg, cote];
  }

  if (alea.random() < 0.3) {
    const coteAtk = atkStance.jambe_arriere();
    const recul = alea.randint(2, 6);
    atkLegs.add(coteAtk, recul);
    return ["checké", recul, `${coteAtk} (retour)`];
  }

  return ["évité", 0, null];
}

module.exports = {
  ORTHODOX, SOUTHPAW, LegDamage, StanceState,
  stabilite, facteur_puissance, facteur_esquive, facteur_precision,
  veut_switcher, cible_kick, resolve_leg_kick,
};

});

/* ===== body.js ======================================================= */
__def("body.js", function (module, exports, require) {
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

});

/* ===== tables.js ===================================================== */
__def("tables.js", function (module, exports, require) {
/**
 * tables.js — GENERE PAR gen_tables.py. NE PAS EDITER A LA MAIN.
 * Toute correction se fait dans ground_v2.py / clinch.py puis :
 *     python3 js/gen_tables.py
 */

const POSITIONS = {"closed_guard": {"valeur": 1, "difficulte_sortie": 5, "gnp": 0.3, "sub_top": 0.1, "sub_bottom": 0.45, "controle_stat": "posture_sol", "retention_stat": "closed_guard_bottom"}, "open_guard": {"valeur": 1, "difficulte_sortie": 3, "gnp": 0.25, "sub_top": 0.1, "sub_bottom": 0.35, "controle_stat": "passing", "retention_stat": "open_guard_bottom"}, "butterfly_guard": {"valeur": 1, "difficulte_sortie": 2, "gnp": 0.2, "sub_top": 0.05, "sub_bottom": 0.3, "controle_stat": "passing", "retention_stat": "butterfly_bottom", "sweep_bonus": 0.35}, "half_guard": {"valeur": 2, "difficulte_sortie": 10, "gnp": 0.5, "sub_top": 0.2, "sub_bottom": 0.25, "controle_stat": "half_guard_top", "retention_stat": "half_guard_bottom"}, "side_control": {"valeur": 3, "difficulte_sortie": 22, "gnp": 0.7, "sub_top": 0.35, "sub_bottom": 0.05, "controle_stat": "side_control_top", "retention_stat": "side_control_bottom"}, "north_south": {"valeur": 3, "difficulte_sortie": 24, "gnp": 0.45, "sub_top": 0.4, "sub_bottom": 0.03, "controle_stat": "side_control_top", "retention_stat": "side_control_bottom"}, "knee_on_belly": {"valeur": 3, "difficulte_sortie": 15, "gnp": 0.65, "sub_top": 0.25, "sub_bottom": 0.05, "controle_stat": "side_control_top", "retention_stat": "side_control_bottom", "instable": true}, "mount": {"valeur": 4, "difficulte_sortie": 35, "gnp": 0.95, "sub_top": 0.55, "sub_bottom": 0.02, "controle_stat": "mount_top", "retention_stat": "mount_bottom"}, "back_control": {"valeur": 5, "difficulte_sortie": 40, "gnp": 0.5, "sub_top": 0.8, "sub_bottom": 0.01, "controle_stat": "back_top", "retention_stat": "back_defense"}, "crucifix": {"valeur": 5, "difficulte_sortie": 45, "gnp": 0.85, "sub_top": 0.5, "sub_bottom": 0.0, "controle_stat": "back_top", "retention_stat": "back_defense"}, "turtle": {"valeur": 2, "difficulte_sortie": 12, "gnp": 0.35, "sub_top": 0.3, "sub_bottom": 0.05, "controle_stat": "back_top", "retention_stat": "turtle_defense"}};

const TRANSITIONS = {"closed_guard": ["open_guard", "half_guard"], "open_guard": ["half_guard", "side_control"], "butterfly_guard": ["half_guard", "side_control"], "half_guard": ["side_control", "mount"], "side_control": ["mount", "north_south", "knee_on_belly", "back_control"], "north_south": ["side_control", "mount"], "knee_on_belly": ["mount", "side_control"], "mount": ["back_control", "crucifix"], "back_control": ["crucifix", "mount"], "crucifix": [], "turtle": ["back_control", "crucifix", "side_control"]};

const ECHAPPATOIRES = {"closed_guard": [["sweep", "butterfly_guard"], ["standup", "debout"], ["submission", null]], "open_guard": [["sweep", "side_control"], ["standup", "debout"], ["recompose", "closed_guard"]], "butterfly_guard": [["sweep", "side_control"], ["standup", "debout"]], "half_guard": [["recompose", "closed_guard"], ["underhook_up", "debout"], ["sweep", "side_control"]], "side_control": [["recompose", "half_guard"], ["shrimp_out", "open_guard"], ["wall_up", "debout"]], "north_south": [["recompose", "half_guard"], ["shrimp_out", "open_guard"]], "knee_on_belly": [["shrimp_out", "open_guard"], ["recompose", "half_guard"]], "mount": [["upa", "closed_guard"], ["elbow_escape", "half_guard"]], "back_control": [["slide_out", "turtle"], ["hand_fight_escape", "half_guard"]], "crucifix": [["roll_out", "turtle"]], "turtle": [["standup", "debout"], ["recompose", "open_guard"]]};

const SOUMISSIONS_TOP = {"closed_guard": ["guillotine_debout"], "open_guard": ["toe_hold", "heel_hook"], "half_guard": ["kimura", "darce", "brabo"], "side_control": ["kimura", "americana", "darce", "arm_triangle"], "north_south": ["north_south_choke", "kimura"], "knee_on_belly": ["armbar", "baseball_choke"], "mount": ["armbar", "arm_triangle", "ezekiel", "mounted_triangle"], "back_control": ["rear_naked_choke", "armbar", "bow_and_arrow"], "crucifix": ["neck_crank", "armbar"], "turtle": ["anaconda", "darce", "peruvian_necktie"]};

const SOUMISSIONS_BOTTOM = {"closed_guard": ["triangle", "armbar", "omoplata", "guillotine", "kimura"], "open_guard": ["triangle", "omoplata", "heel_hook"], "butterfly_guard": ["guillotine", "armbar"], "half_guard": ["kimura", "guillotine"], "side_control": [], "mount": [], "back_control": []};

const TECHNIQUES_ESCAPE = {"upa": {"skill": "explosiveness", "defense": "controle", "cout_cardio": 12}, "underhook_up": {"skill": "explosiveness", "defense": "controle", "cout_cardio": 12}, "wall_up": {"skill": "wall_walking", "defense": "controle", "cout_cardio": 12}, "standup": {"skill": "wall_walking", "defense": "controle", "cout_cardio": 12}, "roll_out": {"skill": "explosiveness", "defense": "controle", "cout_cardio": 9}, "sweep": {"skill": "sweeps", "defense": "controle", "cout_cardio": 9}, "recompose": {"skill": "shrimping", "defense": "controle", "cout_cardio": 6}, "shrimp_out": {"skill": "shrimping", "defense": "controle", "cout_cardio": 6}, "elbow_escape": {"skill": "shrimping", "defense": "controle", "cout_cardio": 6}, "slide_out": {"skill": "hand_fighting_sol", "defense": "controle", "cout_cardio": 6}, "hand_fight_escape": {"skill": "hand_fighting_sol", "defense": "controle", "cout_cardio": 6}};

const PRISES = {"neutre": {"valeur": 0, "options": ["frappe", "pummel", "body_lock_attempt", "sortie"], "domination": 0.0}, "over_under": {"valeur": 1, "options": ["frappe", "trip_attempt", "pummel", "sortie", "frappe"], "domination": 0.15}, "double_under": {"valeur": 3, "options": ["body_lock_attempt", "frappe", "mat_return", "sortie"], "domination": 0.45}, "collar_tie": {"valeur": 2, "options": ["frappe", "frappe", "snap_down", "sortie"], "domination": 0.3}, "thai_plum": {"valeur": 4, "options": ["frappe", "frappe", "sortie"], "domination": 0.6}, "back_clinch": {"valeur": 5, "options": ["mat_return", "throw_attempt", "frappe", "sortie", "back_choke_debout"], "domination": 0.7}};

const SORTIES = {"frame_push": {"skill": "frame", "defense": "clinch_wrestling", "base": 40, "cout_cardio": 2}, "pummel_out": {"skill": "pummeling", "defense": "pummeling", "base": 35, "cout_cardio": 3}, "spin_out": {"skill": "footwork_clinch", "defense": "clinch_wrestling", "base": 30, "cout_cardio": 3}, "duck_under": {"skill": "hand_fighting", "defense": "posture", "base": 25, "cout_cardio": 4, "bonus": "back_clinch"}, "wall_walk": {"skill": "frame", "defense": "top_control", "base": 32, "cout_cardio": 4, "cage_only": true}};

const FRAPPES_CLINCH = {"genou_cuisse": {"dmg": [1, 3], "cible": "jambe", "besoin": 0.0, "significatif": false, "poids_score": 0.15, "drain_cardio": 0.3}, "petit_corps": {"dmg": [1, 3], "cible": "corps", "besoin": 0.0, "significatif": false, "poids_score": 0.15, "drain_cardio": 0.4}, "short_hook": {"dmg": [2, 5], "cible": "tete", "besoin": 0.15, "significatif": false, "poids_score": 0.4, "drain_cardio": 0.1}, "knee": {"dmg": [6, 13], "cible": "corps", "besoin": 0.3, "significatif": true, "poids_score": 1.0, "drain_cardio": 0.8}, "knee_head": {"dmg": [10, 20], "cible": "tete", "besoin": 0.55, "significatif": true, "poids_score": 1.5, "drain_cardio": 0.5}, "elbow": {"dmg": [6, 14], "cible": "tete", "besoin": 0.25, "significatif": true, "poids_score": 1.2, "drain_cardio": 0.2}};

const FRAPPES_RUPTURE = {"elbow_sortie": {"dmg": [7, 16], "cible": "tete", "poids_score": 1.3, "besoin": 0.2}, "knee_sortie": {"dmg": [9, 19], "cible": "tete", "poids_score": 1.5, "besoin": 0.35}, "uppercut_sortie": {"dmg": [6, 14], "cible": "tete", "poids_score": 1.2, "besoin": 0.15}, "knee_corps_sortie": {"dmg": [6, 12], "cible": "corps", "poids_score": 1.0, "besoin": 0.1}};

const SEUIL_SIGNIFICATIF = 5;

const ARMES = {"jab": {"facilite": 13, "skill": "jab", "defense": "parade", "zone": "tete", "dmg": [1.1, 2.5], "concussif": 0.78, "portee": "longue", "cout": 0.11, "vitesse": 1.35, "setup": true}, "cross": {"facilite": 14, "skill": "cross", "defense": "esquive_tete", "zone": "tete", "dmg": [2.5, 5.0], "concussif": 1.38, "portee": "moyenne", "cout": 0.3, "vitesse": 1.05}, "crochet": {"facilite": 1, "skill": "crochet", "defense": "esquive_tete", "zone": "tete", "dmg": [2.6, 5.4], "concussif": 1.35, "portee": "courte", "cout": 0.38, "vitesse": 0.9}, "uppercut": {"facilite": 9, "skill": "uppercut", "defense": "posture_debout", "zone": "tete", "dmg": [2.5, 5.0], "concussif": 1.45, "portee": "courte", "cout": 0.38, "vitesse": 0.95}, "overhand": {"facilite": 12, "skill": "overhand", "defense": "esquive_tete", "zone": "tete", "dmg": [3.2, 6.5], "concussif": 1.2, "portee": "moyenne", "cout": 0.49, "vitesse": 0.72, "telegraphe": true}, "crochet_corps": {"facilite": 16, "skill": "poing_corps", "defense": "blocage", "zone": "corps", "dmg": [1.5, 3.6], "concussif": 0.0, "portee": "courte", "cout": 0.34, "vitesse": 0.95}, "low_kick": {"facilite": 74, "skill": "low_kick", "defense": "check", "zone": "jambe", "dmg": [1.2, 2.9], "concussif": 0.0, "portee": "longue", "cout": 0.3, "vitesse": 1.0}, "calf_kick": {"facilite": 71, "skill": "low_kick", "defense": "check", "zone": "jambe", "dmg": [2.0, 4.2], "concussif": 0.0, "portee": "longue", "cout": 0.3, "vitesse": 1.1}, "body_kick": {"facilite": 60, "skill": "body_kick", "defense": "blocage", "zone": "corps", "dmg": [2.5, 5.4], "concussif": 0.0, "portee": "longue", "cout": 0.53, "vitesse": 0.85}, "high_kick": {"facilite": 5, "skill": "high_kick", "defense": "blocage", "zone": "tete", "dmg": [4.0, 7.9], "concussif": 1.15, "portee": "longue", "cout": 0.68, "vitesse": 0.7, "telegraphe": true}, "teep": {"facilite": 72, "skill": "teep", "defense": "posture_debout", "zone": "corps", "dmg": [0.7, 2.2], "concussif": 0.0, "portee": "longue", "cout": 0.23, "vitesse": 1.2, "repousse": true}, "spinning_back_fist": {"facilite": -4, "skill": "spinning", "defense": "lecture", "zone": "tete", "dmg": [2.9, 6.1], "concussif": 1.25, "portee": "moyenne", "cout": 0.53, "vitesse": 0.65, "telegraphe": true}, "spinning_kick": {"facilite": -6, "skill": "spinning", "defense": "lecture", "zone": "corps", "dmg": [3.6, 7.2], "concussif": 0.0, "portee": "longue", "cout": 0.72, "vitesse": 0.6, "telegraphe": true}, "wheel_kick": {"facilite": -6, "skill": "spinning", "defense": "lecture", "zone": "tete", "dmg": [5.0, 9.4], "concussif": 1.3, "portee": "longue", "cout": 0.84, "vitesse": 0.5, "telegraphe": true}};

const ESQUIVABILITE = {"tete": 1.0, "corps": 0.55, "jambe": 0.25};

const ARCHETYPES = {"boxeur_pressure": {"desc": "Coupe la cage et frappe lourd à mi-distance", "striking": {"jab": 20, "cross": 22, "crochet": 20, "uppercut": 18, "overhand": 12, "poing_corps": 14, "low_kick": -16, "body_kick": -14, "high_kick": -20, "teep": -10, "spinning": -22, "esquive_tete": 14, "parade": 12, "blocage": 4, "check": -14, "posture_debout": 8, "lecture": 2, "vitesse_mains": 16, "vitesse_jambes": -8, "reflexes": 12, "power": 15, "ko_power": 18, "footwork": 2, "cage_cutting": 25, "enchainements": 18, "timing": 10}, "wrestling": {"shot": -8, "clinch_wrestling": 5, "throws": -12, "sprawl": 8, "whizzer": 5, "balance": 8, "grip_fighting": -5}, "clinch": {"pummeling": 2, "hand_fighting": 8, "clinch_wrestling": 0, "frame": 5, "posture": 8, "clinch_striking": 18, "footwork_clinch": 0}, "ground": {"passing": -5, "top_control": 0, "escapes": 0, "sweeps": -10, "submission_off_top": -12, "submission_off_bottom": -18, "submission_def": 5}, "physical": {"chin": 8, "cardio": -5}, "mental": {"aggression": 18, "discipline": 5}, "gameplan": {"striking": 0.75, "wrestling": 0.08, "clinch": 0.17}}, "kickboxeur_distance": {"desc": "Garde la distance et démonte les jambes", "striking": {"jab": 8, "cross": 4, "crochet": -6, "uppercut": -10, "overhand": -6, "poing_corps": -4, "low_kick": 24, "body_kick": 24, "high_kick": 26, "teep": 22, "spinning": 14, "esquive_tete": 2, "parade": 4, "blocage": 12, "check": 18, "posture_debout": 8, "lecture": 8, "vitesse_mains": -6, "vitesse_jambes": 18, "reflexes": 6, "power": 8, "ko_power": 10, "footwork": 22, "cage_cutting": -18, "enchainements": 4, "timing": 12}, "wrestling": {"shot": -12, "clinch_wrestling": -14, "throws": -8, "sprawl": -10, "whizzer": -10, "balance": 5, "grip_fighting": -8}, "clinch": {"pummeling": -14, "hand_fighting": -8, "clinch_wrestling": -16, "frame": -12, "posture": 4, "clinch_striking": 8, "footwork_clinch": -6}, "ground": {"passing": -8, "top_control": -5, "escapes": -16, "sweeps": -10, "submission_off_top": -8, "submission_off_bottom": -8, "submission_def": -12}, "physical": {"cardio": 8}, "mental": {"fight_iq": 10, "aggression": -8}, "gameplan": {"striking": 0.82, "wrestling": 0.06, "clinch": 0.12}}, "lutteur_controle": {"desc": "Amène au sol et écrase", "striking": {"jab": -6, "cross": -10, "crochet": -12, "uppercut": -12, "overhand": -8, "poing_corps": -6, "low_kick": -12, "body_kick": -14, "high_kick": -20, "teep": -8, "spinning": -25, "esquive_tete": -8, "parade": -4, "blocage": 2, "check": -4, "posture_debout": 6, "lecture": 0, "vitesse_mains": -4, "vitesse_jambes": -8, "reflexes": -2, "power": -5, "ko_power": -10, "footwork": -5, "cage_cutting": 12, "enchainements": -8, "timing": 0}, "wrestling": {"shot": 25, "clinch_wrestling": 20, "throws": 5, "sprawl": 18, "whizzer": 15, "balance": 15, "grip_fighting": 8}, "clinch": {"pummeling": 20, "hand_fighting": 10, "clinch_wrestling": 22, "frame": 8, "posture": 10, "clinch_striking": -5, "footwork_clinch": -8}, "ground": {"passing": 15, "top_control": 25, "escapes": 8, "sweeps": -10, "submission_off_top": -5, "submission_off_bottom": -20, "submission_def": 10, "ground_striking": 15}, "physical": {"cardio": 10, "chin": 5}, "mental": {"discipline": 12}, "gameplan": {"striking": 0.3, "wrestling": 0.52, "clinch": 0.18}}, "grappler_soumission": {"desc": "Dangereux dès que ça touche le sol, même en dessous", "striking": {"jab": -6, "cross": -10, "crochet": -10, "uppercut": -10, "overhand": -8, "poing_corps": -4, "low_kick": -6, "body_kick": -8, "high_kick": -14, "teep": -4, "spinning": -18, "esquive_tete": -5, "parade": -2, "blocage": -4, "check": 0, "posture_debout": -4, "lecture": 4, "vitesse_mains": -4, "vitesse_jambes": -4, "reflexes": 0, "power": -8, "ko_power": -12, "footwork": -5, "cage_cutting": -8, "enchainements": -6, "timing": 4}, "wrestling": {"shot": 5, "clinch_wrestling": 8, "throws": 18, "sprawl": -5, "whizzer": -8, "balance": 0, "grip_fighting": 20}, "clinch": {"pummeling": 8, "hand_fighting": 12, "clinch_wrestling": 10, "frame": 5, "posture": -5, "clinch_striking": -8, "footwork_clinch": 0}, "ground": {"passing": 22, "top_control": 10, "escapes": 20, "sweeps": 25, "submission_off_top": 28, "submission_off_bottom": 30, "submission_def": 22, "ground_striking": -8}, "physical": {"cardio": 5}, "mental": {"fight_iq": 8}, "gameplan": {"striking": 0.35, "wrestling": 0.4, "clinch": 0.25}}, "polyvalent": {"desc": "Pas de trou, pas d'arme écrasante", "striking": {"jab": 8, "cross": 6, "crochet": 5, "uppercut": 4, "overhand": 2, "poing_corps": 6, "low_kick": 6, "body_kick": 6, "high_kick": 2, "teep": 6, "spinning": -6, "esquive_tete": 6, "parade": 6, "blocage": 6, "check": 6, "posture_debout": 6, "lecture": 8, "vitesse_mains": 4, "vitesse_jambes": 4, "reflexes": 8, "power": 0, "ko_power": 0, "footwork": 5, "cage_cutting": 0, "enchainements": 10, "timing": 12}, "wrestling": {"shot": 5, "clinch_wrestling": 5, "throws": 0, "sprawl": 8, "whizzer": 5, "balance": 5, "grip_fighting": 5}, "clinch": {"pummeling": 5, "hand_fighting": 5, "clinch_wrestling": 5, "frame": 5, "posture": 5, "clinch_striking": 5, "footwork_clinch": 5}, "ground": {"passing": 5, "top_control": 5, "escapes": 8, "sweeps": 5, "submission_off_top": 5, "submission_off_bottom": 0, "submission_def": 8}, "physical": {"cardio": 8, "chin": 5}, "mental": {"fight_iq": 12, "discipline": 10}, "gameplan": {"striking": 0.52, "wrestling": 0.28, "clinch": 0.2}}, "brawler": {"desc": "Menton solide, frappe lourde, technique approximative", "striking": {"jab": -4, "cross": 12, "crochet": 16, "uppercut": 10, "overhand": 22, "poing_corps": 6, "low_kick": -8, "body_kick": -6, "high_kick": -10, "teep": -14, "spinning": -10, "esquive_tete": -10, "parade": -4, "blocage": 20, "check": -10, "posture_debout": 10, "lecture": -14, "vitesse_mains": 4, "vitesse_jambes": -6, "reflexes": -12, "power": 38, "ko_power": 48, "footwork": -15, "cage_cutting": 10, "enchainements": -6, "timing": -10}, "wrestling": {"shot": -5, "clinch_wrestling": 5, "throws": -5, "sprawl": 0, "whizzer": -5, "balance": 5, "grip_fighting": -8}, "clinch": {"pummeling": 0, "hand_fighting": -5, "clinch_wrestling": 5, "frame": -8, "posture": 0, "clinch_striking": 15, "footwork_clinch": -10}, "ground": {"passing": -10, "top_control": 0, "escapes": 4, "sweeps": -4, "submission_off_top": -15, "submission_off_bottom": -20, "submission_def": 2}, "physical": {"chin": 30, "cardio": -8, "body_conditioning": 16, "recovery": 10}, "mental": {"aggression": 25, "discipline": -20, "fight_iq": -12}, "gameplan": {"striking": 0.8, "wrestling": 0.05, "clinch": 0.15}}};

const PRENOMS = ["Aleksei", "Marcus", "Diego", "Kenji", "Rashid", "Tomas", "Ivan", "Bruno", "Malik", "Ander", "Nikola", "Caleb", "Rodrigo", "Yuri", "Tariq", "Elias", "Dante", "Sacha", "Omar", "Viktor", "Lucas", "Amir", "Joaquin", "Finn"];

const NOMS = ["Voreno", "Kastrati", "Alvarenga", "Mbeki", "Duarte", "Halvorsen", "Ferreira", "Nakamura", "Okonkwo", "Silvestri", "Braga", "Kovacic", "Adeyemi", "Marchetti", "Dossou", "Renaud", "Vasquez", "Petrov", "Larsen", "Toussaint", "Quintero", "Bakalov", "Nascimento", "Weller"];

const SURNOMS = ["le Marteau", "la Faucille", "l'Ombre", "le Boucher", "la Vipère", "le Chirurgien", "l'Enclume", "le Loup", "le Prédateur", "la Tempête", "le Fantôme", "le Cyclone", "le Rasoir", "l'Étau", "le Corbeau", "la Machine", null, null, null];

const VOLUME_ARCHETYPE = {"boxeur_pressure": 14, "kickboxeur_distance": 2, "lutteur_controle": -12, "grappler_soumission": -10, "polyvalent": 0, "brawler": 8};

module.exports = { POSITIONS, TRANSITIONS, ECHAPPATOIRES, SOUMISSIONS_TOP, SOUMISSIONS_BOTTOM, TECHNIQUES_ESCAPE, PRISES, SORTIES, FRAPPES_CLINCH, FRAPPES_RUPTURE, SEUIL_SIGNIFICATIF, ARMES, ESQUIVABILITE, ARCHETYPES, PRENOMS, NOMS, SURNOMS, VOLUME_ARCHETYPE };
});

/* ===== striking_v2.js ================================================ */
__def("striking_v2.js", function (module, exports, require) {
/**
 * striking_v2.js — portage de striking_v2.py (LOGIQUE seulement).
 *
 * La table ARMES et ESQUIVABILITE viennent de tables.js (generees depuis
 * Python : 14 armes x ~10 champs calibres, on ne retape pas ca).
 *
 * PIEGES SPECIFIQUES A CE MODULE
 * 1. resolve_frappe consomme les tirages dans un ORDRE STRICT :
 *    uniform(0,100) pour la touche ; si touche -> uniform(lo,hi) pour les
 *    degats et RIEN d'autre ; si rate -> random() pour le contre SEULEMENT
 *    si l'arme est telegraphiee, PUIS random() (+ randint si succes) pour
 *    le check SEULEMENT si defense == "check". Chaque branche saute des
 *    tirages — les reproduire toutes.
 * 2. choisir_arme utilise random.choices avec poids : un SEUL random()
 *    consomme quel que soit le nombre d'armes (voir alea.choices).
 * 3. getattr(obj, nom, 50) -> defaut explicite (undefined n'est pas 50).
 * 4. `(skill - 40) ** 1.5` : exposant fractionnaire sur base positive
 *    seulement (garanti par le `if skill > 40`), Math.pow suffit.
 */

const { alea } = require("./alea.js");
const { ARMES, ESQUIVABILITE } = require("./tables.js");

const g = (obj, nom, defaut = 50) =>
  (obj[nom] !== undefined ? obj[nom] : defaut);

class StrikingProfileV2 {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    // --- competences offensives par arme ---
    this.jab = d("jab"); this.cross = d("cross"); this.crochet = d("crochet");
    this.poing_corps = d("poing_corps"); this.uppercut = d("uppercut");
    this.overhand = d("overhand"); this.low_kick = d("low_kick");
    this.body_kick = d("body_kick"); this.high_kick = d("high_kick");
    this.teep = d("teep"); this.spinning = d("spinning");
    // --- defenses appariees ---
    this.esquive_tete = d("esquive_tete"); this.parade = d("parade");
    this.blocage = d("blocage"); this.check = d("check");
    this.posture_debout = d("posture_debout"); this.lecture = d("lecture");
    // --- vitesse ---
    this.vitesse_mains = d("vitesse_mains");
    this.vitesse_jambes = d("vitesse_jambes");
    this.reflexes = d("reflexes");
    // --- qualites generales ---
    this.power = d("power"); this.ko_power = d("ko_power");
    this.footwork = d("footwork"); this.cage_cutting = d("cage_cutting");
    this.enchainements = d("enchainements"); this.volume = d("volume");
    this.timing = d("timing");
  }

  competence(arme) { return g(this, ARMES[arme].skill); }

  vitesse_arme(arme) {
    const sk = ARMES[arme].skill;
    if (["jab", "cross", "crochet", "uppercut", "overhand", "poing_corps"].includes(sk))
      return this.vitesse_mains;
    if (sk === "spinning") return (this.vitesse_mains + this.vitesse_jambes) / 2;
    return this.vitesse_jambes;
  }
}

function resolve_frappe(atk, dfn, arme, accule_dfn = false,
                        penalite_atk = 1.0, penalite_dfn = 1.0,
                        bonus_setup = 0.0) {
  const info = ARMES[arme];
  const skill = atk.striking.competence(arme);
  let defense = g(dfn.striking, info.defense);

  const v_atk = atk.striking.vitesse_arme(arme) * info.vitesse;
  const v_dfn = dfn.striking.reflexes * penalite_dfn;
  const avantage_vitesse = (v_atk * penalite_atk - v_dfn) * 0.40;

  let evasion;
  if (accule_dfn) {
    evasion = 0;
    defense *= 0.75;
  } else {
    const fw = dfn.striking.footwork * penalite_dfn;
    evasion = fw * (["courte", "moyenne"].includes(info.portee) ? 0.40 : 0.12);
    evasion *= (ESQUIVABILITE[info.zone] !== undefined ? ESQUIVABILITE[info.zone] : 1.0);
  }

  let chance = (24 + (skill - defense) * 0.75 + avantage_vitesse
                + bonus_setup - evasion * 0.45 + (info.facilite || 0));
  chance *= penalite_atk;
  /* /!\ PLANCHER RELEVE DE 4 A 12 % (Mael, capture du 10/08 : "7 frappes
     sur 167, c'est abuse"). A 4 %, un homme oppose a une tres bonne
     defense (esquive 87, parade 68) tombait sur le plancher A CHAQUE
     COUP : mesure, 0 touche sur 69 jabs, 0 sur 66 overhands, 0 sur 64
     cross. Un combattant professionnel touche TOUJOURS un peu, meme
     domine — 4 % n'existe pas dans une cage.
     /!\ ET CA NE CHANGE PAS LE CALIBRAGE : precision moyenne 43 % avant,
     44 % apres. Le plancher ne concerne QUE les duels tres desequilibres,
     ce qui est exactement le but. Cas sous 10 % de precision : 5 sur 84
     avant, 0 apres. */
  chance = Math.max(12, Math.min(93, chance));

  if (alea.uniform(0, 100) < chance) {
    const [lo, hi] = info.dmg;
    const qualite = 0.45 + skill / 130;
    const dmg = alea.uniform(lo, hi) * (0.45 + atk.striking.power / 95) * qualite;
    let concussif = (info.concussif !== undefined ? info.concussif : 1.0);
    if (concussif > 0) {
      concussif *= 0.85 + atk.striking.vitesse_arme(arme) / 330;
      concussif *= Math.pow(qualite, 2.2);
    }
    return ["touché", dmg, info.zone, false, concussif];
  }

  // rate : contre possible sur un coup telegraphie
  let contre = false;
  if (info.telegraphe) {
    const risque = 0.18 + (dfn.striking.timing - atk.striking.timing) / 320;
    contre = alea.random() < Math.max(0.03, Math.min(0.40, risque));
  }

  // low kick checke : blesse l'attaquant
  if (info.defense === "check" && alea.random() < 0.30) {
    return ["checké", alea.randint(2, 6), "jambe_attaquant", false, 0.0];
  }

  return ["manqué", 0, null, contre, 0.0];
}

function choisir_arme(atk, dfn, accule_dfn, garde_basse = 0.0,
                      dernier_coup = null, cible = null) {
  let dispo = Object.keys(ARMES);

  if (accule_dfn) {
    dispo = dispo.filter(a => ["courte", "moyenne"].includes(ARMES[a].portee)
                              || ARMES[a].skill === "low_kick");
  } else {
    dispo = dispo.filter(a => ["longue", "moyenne"].includes(ARMES[a].portee));
  }

  const poids = [];
  for (const a of dispo) {
    const skill = atk.striking.competence(a);
    const info = ARMES[a];
    const defense = g(dfn.striking, info.defense);
    const p_touche = Math.max(0.05, Math.min(0.90, (44 + (skill - defense) * 0.75) / 100));
    let w = Math.max(0.15, skill > 40 ? Math.pow(skill - 40, 1.5) : 0.15);
    w *= Math.pow(p_touche, 0.8 + atk.striking.timing / 200);
    if (ARMES[a].skill === "spinning") w *= 0.22;
    if (garde_basse > 0.25 && ARMES[a].zone === "tete") w *= 1.6;
    if (cible) {
      const zone = info.zone;
      if (cible === "jambes")     w *= zone === "jambe" ? 3.4 : (zone === "tete" ? 0.5 : 0.8);
      else if (cible === "corps") w *= zone === "corps" ? 3.2 : (zone === "tete" ? 0.55 : 0.8);
      else if (cible === "tete")  w *= zone === "tete" ? 2.2 : 0.55;
    }
    if (dernier_coup === "jab" && ["cross", "overhand", "low_kick"].includes(a)) {
      w *= 1.5 + atk.striking.enchainements / 120;
    }
    poids.push(w);
  }

  return alea.choices(dispo, poids, 1)[0];
}

module.exports = { ARMES, ESQUIVABILITE, StrikingProfileV2, resolve_frappe, choisir_arme };

});

/* ===== clinch.js ===================================================== */
__def("clinch.js", function (module, exports, require) {
/**
 * clinch.js — portage de clinch.py (LOGIQUE seulement).
 * Tables PRISES / SORTIES / FRAPPES_CLINCH / FRAPPES_RUPTURE /
 * SEUIL_SIGNIFICATIF depuis tables.js (generees). BATAILLE_PRISES est locale
 * (tuples de noms, pas de calibrage numerique).
 *
 * PIEGES SPECIFIQUES
 * 1. veut_rompre : QUATRE if en cascade, chacun ne tire random() QUE si sa
 *    condition d'ETAT est vraie, et chaque return coupe les suivants. C'est
 *    le court-circuit le plus dense du projet — l'ordre et les gardes sont
 *    du code metier.
 * 2. clinch_sequence : les stats sont indexees PAR NOM (dict Python) et le
 *    log utilise "->" ASCII (c'est la signature qui avait cache tout le
 *    clinch au traducteur — ne pas la "corriger" en "→").
 * 3. random.choice(candidates) dans prise_superieure ne tire QUE si aucune
 *    preference ne matche. random.choices (pondere) = un random() unique.
 * 4. d_esc.add(zone, d) : les degats sont portes par un objet a methode
 *    .add fourni par l'appelant (engine). On garde ce contrat tel quel.
 */

const { alea } = require("./alea.js");
const { PRISES, SORTIES, FRAPPES_CLINCH, FRAPPES_RUPTURE,
        SEUIL_SIGNIFICATIF } = require("./tables.js");

const BATAILLE_PRISES = {
  over_under:   ["pummeling", "pummeling"],
  double_under: ["pummeling", "frame"],
  collar_tie:   ["hand_fighting", "posture"],
  thai_plum:    ["hand_fighting", "posture"],
  back_clinch:  ["clinch_wrestling", "frame"],
};

const g = (obj, nom, defaut = 50) =>
  (obj[nom] !== undefined ? obj[nom] : defaut);

class ClinchProfile {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    this.pummeling = d("pummeling");
    this.hand_fighting = d("hand_fighting");
    this.clinch_wrestling = d("clinch_wrestling");
    this.frame = d("frame");
    this.posture = d("posture");
    this.clinch_striking = d("clinch_striking");
    this.footwork_clinch = d("footwork_clinch");
    this.top_control = d("top_control");
  }
}

// ------------------------------------------------------------------ prises
function contest_grip(attacker, defender, priseVisee) {
  if (!(priseVisee in BATAILLE_PRISES)) return false;
  const [statOff, statDef] = BATAILLE_PRISES[priseVisee];
  const off = attacker.clinch[statOff];
  const dfn = defender.clinch[statDef];
  const chance = 40 + (off - dfn) * 1.3;
  return alea.uniform(0, 100) < Math.max(5, Math.min(88, chance));
}

function prise_superieure(priseActuelle, profil) {
  const valeurActuelle = PRISES[priseActuelle].valeur;
  const candidates = Object.keys(PRISES).filter(
    p => PRISES[p].valeur > valeurActuelle && p in BATAILLE_PRISES);
  if (!candidates.length) return null;
  const prefs = profil.clinch_wrestling > profil.clinch_striking
    ? ["double_under", "back_clinch", "over_under"]
    : ["thai_plum", "collar_tie", "over_under"];
  for (const p of prefs) if (candidates.includes(p)) return p;
  return alea.choice(candidates);   // ne tire QUE si aucune pref ne matche
}

// ----------------------------------------------------------------- sorties
function try_exit(escaper, controller, sortie, contreCage = false, cardioRatio = 1.0) {
  const info = SORTIES[sortie];
  if (info.cage_only && !contreCage) return ["impossible", null];

  const off = g(escaper.clinch, info.skill);
  const dfn = g(controller.clinch, info.defense);
  const malusCage = contreCage ? 12 : 0;
  let chance = info.base + (off - dfn) * 0.7 - malusCage;
  chance *= (0.75 + 0.25 * cardioRatio);

  if (alea.uniform(0, 100) < Math.max(4, Math.min(85, chance)))
    return ["réussi", info.bonus !== undefined ? info.bonus : null];
  return ["échoué", null];
}

function choisir_sortie(escaper, contreCage) {
  const dispo = Object.keys(SORTIES).filter(
    s => !SORTIES[s].cage_only || contreCage);
  const poids = dispo.map(s => Math.max(1, g(escaper.clinch, SORTIES[s].skill)));
  return alea.choices(dispo, poids, 1)[0];
}

// ----------------------------------------------------------------- frappes
function resolve_clinch_strike(attacker, defender, frappe, domination) {
  const info = FRAPPES_CLINCH[frappe];
  if (domination < info.besoin) return ["pas d'angle", 0, null, false];

  const facilite = !info.significatif ? 25 : 0;
  const chance = 45 + facilite
    + (attacker.clinch.clinch_striking - defender.clinch.frame) * 0.7
    + domination * 40;

  if (alea.uniform(0, 100) < Math.max(10, Math.min(92, chance))) {
    const [lo, hi] = info.dmg;
    let dmg = alea.randint(lo, hi);
    dmg = Math.trunc(dmg * (1 + domination * 0.5));
    const sig = info.significatif && dmg >= SEUIL_SIGNIFICATIF;
    return ["touché", dmg, info.cible, sig];
  }
  return ["bloqué", 0, null, false];
}

function choisir_frappe_clinch(attacker, domination) {
  const dispo = Object.keys(FRAPPES_CLINCH).filter(
    f => domination >= FRAPPES_CLINCH[f].besoin);
  const poids = [];
  for (const f of dispo) {
    const i = FRAPPES_CLINCH[f];
    let p = !i.significatif ? 3.0 : 1.0;
    if (i.significatif) p *= (0.5 + attacker.clinch.clinch_striking / 100);
    poids.push(p);
  }
  return alea.choices(dispo, poids, 1)[0];
}

// ----------------------------------------------------------- decisions
function veut_rompre(controller, escaper, prise, stepsSansProgres,
                     cardioRatio = 1.0, degatsSignificatifsRecus = 0) {
  // /!\ chaque random() est GARDE par sa condition d'etat : un `if` dont la
  // condition est fausse ne consomme RIEN, et un return coupe la cascade.
  if (controller.clinch.clinch_wrestling < 45 && controller.clinch.clinch_striking < 60) {
    if (alea.random() < 0.45) return [true, "veut remettre de la distance"];
  }
  if (stepsSansProgres >= 3 && alea.random() < 0.4)
    return [true, "clinch stérile, il rompt"];
  if (cardioRatio < 0.5 && alea.random() < 0.35)
    return [true, "trop fatigué pour tenir"];
  if (degatsSignificatifsRecus >= 12 && alea.random() < 0.5)
    return [true, "encaisse trop de coups lourds"];
  return [false, null];
}

function veut_rompre_offensif(controller, escaper, domination) {
  if (controller.clinch.clinch_striking < 60) return [false, null];
  const dispo = Object.keys(FRAPPES_RUPTURE).filter(
    f => domination >= FRAPPES_RUPTURE[f].besoin);
  if (!dispo.length) return [false, null];
  const proba = 0.10 + (controller.clinch.clinch_striking - 60) / 200;
  if (alea.random() < proba) return [true, alea.choice(dispo)];
  return [false, null];
}

function resolve_frappe_rupture(attacker, defender, frappe, domination) {
  const info = FRAPPES_RUPTURE[frappe];
  const chance = 40
    + (attacker.clinch.clinch_striking - defender.clinch.posture) * 0.6
    + domination * 25;
  if (alea.uniform(0, 100) < Math.max(10, Math.min(80, chance))) {
    const [lo, hi] = info.dmg;
    const dmg = alea.randint(lo, hi);
    return ["touché", dmg, info.cible, true, info.poids_score];
  }
  return ["manqué", 0, null, false, 0.0];
}

// ------------------------------------------------------------ la sequence
function clinch_sequence(f1, f2, dmg1, dmg2, contreCage = false, microActions = 4,
                         log = null, cardio1 = 1.0, cardio2 = 1.0) {
  let prise = "neutre";
  let controller, escaper, d_ctrl, d_esc, c_ctrl, c_esc;
  if (contest_grip(f1, f2, "over_under")) {
    controller = f1; escaper = f2;
    d_ctrl = dmg1; d_esc = dmg2;
    c_ctrl = cardio1; c_esc = cardio2;
  } else {
    controller = f2; escaper = f1;
    d_ctrl = dmg2; d_esc = dmg1;
    c_ctrl = cardio2; c_esc = cardio1;
  }
  prise = "over_under";

  const events = [`${controller.name} prend le contrôle du clinch (${prise})`];
  let stepsSansProgres = 0;
  let dmgSigCtrl = 0;
  const stats = {
    [controller.name]: { sig: 0, usure: 0, score: 0.0, cardio: 0.0 },
    [escaper.name]:    { sig: 0, usure: 0, score: 0.0, cardio: 0.0 },
  };

  for (let step = 0; step < microActions; step++) {
    const domination = PRISES[prise].domination;
    const options = PRISES[prise].options;

    // rupture offensive
    const [offensif, frappeRupture] = veut_rompre_offensif(controller, escaper, domination);
    if (offensif) {
      const [r, d, z, sig, poids] = resolve_frappe_rupture(controller, escaper, frappeRupture, domination);
      if (d) {
        d_esc.add(z, d);
        stats[controller.name].sig += 1;
        stats[controller.name].score += poids;
        events.push(`${controller.name} rompt et place ${frappeRupture} -> ${r} (${d}) !`);
      } else {
        events.push(`${controller.name} rompt et tente ${frappeRupture} -> ${r}`);
      }
      return ["rupture", controller, events, stats, prise];
    }

    // rupture defensive/tactique
    // /!\ CHANTIER G (14/08) : "Sors, repousse-le !" — le controleur
    // casse volontairement. Inerte sans ordre.
    if (controller.gameplan && controller.gameplan.clinch_intent === "sortir") {
      events.push(`${controller.name} casse le clinch (le coin le rappelle)`);
      return ["rupture", controller, events, stats, prise];
    }
    const [rompt, raison] = veut_rompre(controller, escaper, prise, stepsSansProgres,
                                        c_ctrl, dmgSigCtrl);
    if (rompt) {
      events.push(`${controller.name} casse le clinch (${raison})`);
      return ["rupture", controller, events, stats, prise];
    }

    // l'engage force sa sortie
    const sortie = choisir_sortie(escaper, contreCage);
    const [res, bonus] = try_exit(escaper, controller, sortie, contreCage, c_esc);
    if (res !== "impossible") {
      stats[escaper.name].cardio += SORTIES[sortie].cout_cardio;
    }
    events.push(`${escaper.name} tente ${sortie} -> ${res}`);
    if (res === "réussi") {
      if (bonus === "back_clinch" && alea.random() < 0.5) {
        events.push(`  => ${escaper.name} passe dans le dos !`);
        return ["continue", escaper, events, stats, prise];
      }
      return ["sortie", escaper, events, stats, prise];
    }

    // riposte de l'engage
    if (alea.random() < 0.35) {
      const fRiposte = choisir_frappe_clinch(escaper, 0.1);
      const [r, d, z, sig] = resolve_clinch_strike(escaper, controller, fRiposte, 0.1);
      stats[escaper.name].cardio += FRAPPES_CLINCH[fRiposte].drain_cardio;
      if (d) {
        d_ctrl.add(z, d);
        if (sig) { dmgSigCtrl += d; stats[escaper.name].sig += 1; }
        else stats[escaper.name].usure += 1;
        stats[escaper.name].score += FRAPPES_CLINCH[fRiposte].poids_score;
        events.push(`  ${escaper.name} riposte ${fRiposte} -> ${d}${sig ? " [SIG]" : ""}`);
      }
    }

    // le controleur exploite sa prise
    // /!\ CHANTIER G (14/08) : le cri ORIENTE le choix parmi les options
    // de la prise — il ne cree pas d'option. "Projette-le" pese vers les
    // amenees au sol, "les genoux, frappe" vers les coups. Si la prise
    // n'offre pas ce que le coin demande, le tirage normal reprend — un
    // mauvais cri au mauvais moment ne fait rien, comme en vrai.
    const _intent = controller.gameplan && controller.gameplan.clinch_intent;
    let action;
    if (_intent) {
      const AMENEES = ["trip_attempt", "body_lock_attempt", "mat_return",
                       "throw_attempt", "snap_down"];
      const pref = _intent === "projeter" ? options.filter(o => AMENEES.includes(o))
                 : _intent === "frapper" ? options.filter(o => o === "frappe")
                 : [];
      action = pref.length ? alea.choice(pref) : alea.choice(options);
    } else {
      action = alea.choice(options);
    }
    let progres = false;

    if (action === "pummel" || action === "sortie") {
      const cible = prise_superieure(prise, controller.clinch);
      if (cible && contest_grip(controller, escaper, cible)) {
        prise = cible;
        progres = true;
        events.push(`${controller.name} améliore sa prise -> ${prise}`);
      } else {
        events.push(`${controller.name} pummele sans gain`);
      }
    } else if (action === "frappe") {
      const f = choisir_frappe_clinch(controller, domination);
      const [res2, dmg, zone, sig] = resolve_clinch_strike(controller, escaper, f, domination);
      stats[controller.name].cardio += FRAPPES_CLINCH[f].drain_cardio;
      if (dmg) {
        d_esc.add(zone, dmg);
        if (sig) { stats[controller.name].sig += 1; progres = true; }
        else stats[controller.name].usure += 1;
        stats[controller.name].score += FRAPPES_CLINCH[f].poids_score;
      }
      events.push(`${controller.name} ${f} -> ${res2} (${dmg})${sig ? " [SIG]" : ""}`);
    } else if (["body_lock_attempt", "trip_attempt", "throw_attempt", "mat_return"].includes(action)) {
      const chance = 30 + domination * 60
        + (controller.clinch.clinch_wrestling - escaper.clinch.frame) * 0.8;
      if (alea.uniform(0, 100) < Math.max(5, Math.min(85, chance))) {
        // /!\ ON ATTERRIT LA OU L'ON ETAIT. Avant, tout takedown de clinch
        // arrivait en demi-garde — meme quand le controleur avait DEJA LE
        // DOS. Chimaev prend le dos au corps a corps puis fait tomber : il
        // se retrouvait en demi-garde, son travail efface.
        events.push(`${controller.name} ${action} -> RÉUSSI, combat au sol`);
        return ["takedown", controller, events, stats, prise];
      }
      events.push(`${controller.name} ${action} -> stoppé`);
    } else if (action === "snap_down") {
      if (alea.uniform(0, 100) < 35 + (controller.clinch.hand_fighting - escaper.clinch.posture)) {
        events.push(`${controller.name} snap down -> ${escaper.name} cassé en deux`);
        if (alea.random() < 0.4) { prise = "back_clinch"; progres = true; }
      } else {
        events.push(`${controller.name} snap down -> résisté`);
      }
    } else if (action === "back_choke_debout") {
      // /!\ LE DOS DEBOUT. Rare, et il NE DURE PAS : soit il l'emmene au sol
      // dans le dos, soit l'autre se degage. C'est ce qu'on voit chez
      // Oliveira ou Chimaev — on prend le dos sur les pieds, on serre, et
      // ca finit au sol ou ca casse. Ce n'est pas une phase, c'est une
      // TRANSITION.
      const c = 18 + (controller.clinch.clinch_wrestling - escaper.clinch.frame) * 0.6;
      if (alea.uniform(0, 100) < Math.max(3, Math.min(55, c))) {
        events.push(`${controller.name} saute dans le dos et serre debout !`);
        return ["takedown", controller, events, stats, "back_clinch"];
      } else {
        events.push(`${controller.name} tente le dos debout -> ${escaper.name} se dégage`);
      }
    }

    stepsSansProgres = progres ? 0 : stepsSansProgres + 1;
  }

  return ["continue", controller, events, stats, prise];
}

module.exports = {
  PRISES, BATAILLE_PRISES, SORTIES, FRAPPES_CLINCH, FRAPPES_RUPTURE,
  SEUIL_SIGNIFICATIF, ClinchProfile,
  contest_grip, prise_superieure, try_exit, choisir_sortie,
  resolve_clinch_strike, choisir_frappe_clinch,
  veut_rompre, veut_rompre_offensif, resolve_frappe_rupture, clinch_sequence,
};

});

/* ===== ground_v2.js ================================================== */
__def("ground_v2.js", function (module, exports, require) {
/**
 * ground_v2.js — portage de ground_v2.py (LOGIQUE seulement).
 *
 * Les tables (POSITIONS, TRANSITIONS, ECHAPPATOIRES, SOUMISSIONS_*,
 * TECHNIQUES_ESCAPE) viennent de tables.js, genere depuis Python : elles ne
 * peuvent pas diverger.
 *
 * TROIS PIEGES SPECIFIQUES A CE MODULE
 * 1. `max(seq, key=f)` en Python renvoie le PREMIER maximum en cas d'egalite,
 *    et `min` le PREMIER minimum. Un reduce JS ecrit avec `>=` prendrait le
 *    DERNIER : deux positions a egalite de score et le combattant part
 *    ailleurs. On compare donc en `>` strict (et `<` strict pour min).
 * 2. getattr(obj, nom, 50) : en JS une propriete absente vaut undefined, pas
 *    50. On repasse explicitement par un defaut.
 * 3. L'ordre des tirages : dans tenter_evasion, le choix de technique ne
 *    consomme RIEN, seul le uniform(0,100) final tire. Et le repli tire un
 *    SECOND uniform, mais uniquement si `replis` n'est pas vide.
 */

const { alea } = require("./alea.js");
const {
  POSITIONS, TRANSITIONS, ECHAPPATOIRES,
  SOUMISSIONS_TOP, SOUMISSIONS_BOTTOM, TECHNIQUES_ESCAPE,
} = require("./tables.js");

const DEF = 50;
const stat = (profil, nom) => (profil[nom] !== undefined ? profil[nom] : DEF);

/** max(seq, key) a la Python : premier maximum en cas d'egalite. */
function maxPar(seq, cle) {
  let best = seq[0], bestV = cle(seq[0]);
  for (let i = 1; i < seq.length; i++) {
    const v = cle(seq[i]);
    if (v > bestV) { best = seq[i]; bestV = v; }
  }
  return best;
}
function minPar(seq, cle) {
  let best = seq[0], bestV = cle(seq[0]);
  for (let i = 1; i < seq.length; i++) {
    const v = cle(seq[i]);
    if (v < bestV) { best = seq[i]; bestV = v; }
  }
  return best;
}

class GroundProfile {
  constructor(kw = {}) {
    const d = (k) => (kw[k] !== undefined ? kw[k] : 50);
    this.passing = d("passing");
    this.posture_sol = d("posture_sol");
    this.half_guard_top = d("half_guard_top");
    this.side_control_top = d("side_control_top");
    this.mount_top = d("mount_top");
    this.back_top = d("back_top");

    this.closed_guard_bottom = d("closed_guard_bottom");
    this.open_guard_bottom = d("open_guard_bottom");
    this.butterfly_bottom = d("butterfly_bottom");
    this.half_guard_bottom = d("half_guard_bottom");
    this.side_control_bottom = d("side_control_bottom");
    this.mount_bottom = d("mount_bottom");
    this.back_defense = d("back_defense");
    this.turtle_defense = d("turtle_defense");

    this.sweeps = d("sweeps");
    this.shrimping = d("shrimping");
    this.explosiveness = d("explosiveness");
    this.wall_walking = d("wall_walking");
    this.hand_fighting_sol = d("hand_fighting_sol");

    this.submission_off_top = d("submission_off_top");
    this.submission_off_bottom = d("submission_off_bottom");
    this.submission_def = d("submission_def");

    this.ground_striking = d("ground_striking");
  }
  controle(position) { return stat(this, POSITIONS[position].controle_stat); }
  retention(position) { return stat(this, POSITIONS[position].retention_stat); }
}

// ------------------------------------------------------------ RESOLUTIONS
function tenter_progression(top, bottom, position) {
  const cibles = (TRANSITIONS[position] || []).filter(p => p in POSITIONS);
  if (!cibles.length) return null;

  const off = top.ground.controle(position);
  const dfn = bottom.ground.retention(position);
  let base = 22 + (off - dfn) * 1.2;
  if (POSITIONS[position].instable) base += 10;

  const chanceVers = (p) => {
    const saut = POSITIONS[p].valeur - POSITIONS[position].valeur;
    let c = base - Math.max(0, saut) * 11;
    c += (top.ground.controle(p) - 50) * 0.25;
    return Math.max(3, Math.min(80, c));
  };

  const cible = maxPar(cibles, p => chanceVers(p)
    * (1 + 0.35 * Math.max(0, POSITIONS[p].valeur - POSITIONS[position].valeur)));
  if (alea.uniform(0, 100) < chanceVers(cible)) return cible;
  return null;
}

function tenter_evasion(bottom, top, position) {
  let options = (ECHAPPATOIRES[position] || []).filter(([t]) => t in TECHNIQUES_ESCAPE);
  if (!options.length) return [null, null];

  const jeuDeGarde = (bottom.ground.sweeps + bottom.ground.closed_guard_bottom
                    + bottom.ground.open_guard_bottom) / 3;
  const envieDebout = 45 - (jeuDeGarde - 50) * 0.55;

  /* /!\ CHANTIER G (14/08) : le cri du coin ORIENTE le choix, il ne cree
     pas de technique. "Releve-toi" pese vers ce qui mene debout, "le
     sweep" vers le renversement. Aucun tirage — interet est deterministe,
     et sans ordre le calcul est celui du temoin. */
  const _cri = bottom.gameplan && bottom.gameplan.sol_dessous;
  const interet = ([tech, dest]) => {
    const skill = stat(bottom.ground, TECHNIQUES_ESCAPE[tech].skill);
    let biais = 0;
    if (_cri === "relever" && dest === "debout") biais = 30;
    if (_cri === "sweep" && tech.includes("sweep")) biais = 30;
    if (dest === "debout") return skill + envieDebout + biais;
    if (dest === null) return skill - 20 + biais;      // rester dessous pour la soumission
    const gain = POSITIONS[position].valeur
               - (POSITIONS[dest] ? POSITIONS[dest].valeur : 2);
    return skill + gain * 6 + biais;
  };

  const [technique, destination] = maxPar(options, interet);

  const skill = stat(bottom.ground, TECHNIQUES_ESCAPE[technique].skill);
  const controleAdverse = top.ground.controle(position);
  const retentionPerso = bottom.ground.retention(position);
  const difficulte = POSITIONS[position].difficulte_sortie;

  // /!\ BASE ABAISSEE DE 52 A 34 LE 09/08.
  // A 52, deux hommes de MEME niveau se separaient une fois sur deux a
  // chaque echange : personne ne controlait jamais rien. Contre un controle
  // a 99, un homme a 75 au sol sortait encore a 30 % en garde fermee — donc
  // 8 fois sur 10 sur une sequence. Tenir un round entier etait
  // MATHEMATIQUEMENT IMPOSSIBLE.
  // /!\ ET IL A FALLU LA BAISSER EN MEME TEMPS QUE LE TEMPO : la relevee se
  // tire PAR ECHANGE, pas par minute. Allonger les echanges seul ne changeait
  // pas le nombre de tirages avant la sortie (~3,3) — ca rendait seulement le
  // sol plus lent ET MOINS PRODUCTIF (7,0 echanges/round -> 2,0, soumissions
  // 31/400 -> 18/400). Mesure a l'appui, le 09/08.
  // Couple retenu : base 34 + T_SOL_BASE 9 -> sequences de ~50 s contenant
  // 5 actions, contre 3,3 actions en 20 s auparavant.
  let chance = 34 + (skill - controleAdverse) * 1.1
             + (retentionPerso - 50) * 0.3 - difficulte * 0.8;
  chance = Math.max(2, Math.min(82, chance));
  if (alea.uniform(0, 100) < chance) return [technique, destination];

  // Reussite partielle : pas sorti, mais de l'espace cree.
  const replis = options.filter(([, d]) =>
    d !== null && d !== "debout" && POSITIONS[d].valeur < POSITIONS[position].valeur);
  if (replis.length && alea.uniform(0, 100) < chance * 0.75) {
    const [t2, d2] = minPar(replis, o => POSITIONS[o[1]].valeur);
    return [t2, d2];
  }
  return [technique, null];
}

function tenter_soumission_top(top, bottom, position) {
  const subs = SOUMISSIONS_TOP[position] || [];
  if (!subs.length) return [null, "aucune ouverture"];
  const sub = alea.choice(subs);
  const acces = POSITIONS[position].sub_top;
  const chance = (6.8 + (top.ground.submission_off_top - bottom.ground.submission_def) * 0.55)
                 * (acces * 1.5);
  if (alea.uniform(0, 100) < Math.max(0.3, Math.min(30, chance))) return [sub, "SOUMISSION"];
  return [sub, "défendue"];
}

function tenter_soumission_bottom(bottom, top, position) {
  const subs = SOUMISSIONS_BOTTOM[position] || [];
  if (!subs.length) return [null, "aucune ouverture"];
  const sub = alea.choice(subs);
  const acces = POSITIONS[position].sub_bottom;
  const chance = (6.8 + (bottom.ground.submission_off_bottom - top.ground.submission_def) * 0.55)
                 * (acces * 1.5);
  if (alea.uniform(0, 100) < Math.max(0.3, Math.min(30, chance))) return [sub, "SOUMISSION"];
  return [sub, "défendue"];
}

function resolve_gnp(top, bottom, position) {
  const acces = POSITIONS[position].gnp;
  if (acces < 0.15) return ["pas d'angle", 0];
  const chance = (40 + (top.ground.ground_striking - bottom.ground.retention(position)) * 0.6)
                 * (0.5 + acces);
  if (alea.uniform(0, 100) < Math.max(10, Math.min(90, chance))) {
    const base = 1 + Math.trunc(acces * 3);
    return ["touché", alea.randint(base, base + 3)];
  }
  return ["bloqué", 0];
}

module.exports = {
  POSITIONS, TRANSITIONS, ECHAPPATOIRES, SOUMISSIONS_TOP, SOUMISSIONS_BOTTOM,
  TECHNIQUES_ESCAPE, GroundProfile,
  tenter_progression, tenter_evasion,
  tenter_soumission_top, tenter_soumission_bottom, resolve_gnp,
};

});

/* ===== engine.js ===================================================== */
__def("engine.js", function (module, exports, require) {
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

});

/* ===== generator.js ================================================== */
__def("generator.js", function (module, exports, require) {
/**
 * generator.js — portage de generator.py.
 * ARCHETYPES, PRENOMS/NOMS/SURNOMS et VOLUME_ARCHETYPE viennent de
 * tables.js (generes). L'ORDRE des tirages est la loi : niveau (si absent),
 * archetype (si absent), division (si absente), puis les 3 choice du nom,
 * puis les _appliquer dans l'ordre st -> volume -> wr -> cl -> gr -> ph ->
 * me, puis garde et stance_switching.
 * _appliquer itere sur les OFFSETS dans l'ordre d'insertion (dict Python) —
 * les objets JS generes par gen_tables preservent cet ordre.
 */

const { alea } = require("./alea.js");
const { ARCHETYPES, PRENOMS, NOMS, SURNOMS, VOLUME_ARCHETYPE } = require("./tables.js");
const E = require("./engine.js");
const { StrikingProfileV2 } = require("./striking_v2.js");
const { GroundProfile } = require("./ground_v2.js");
const { ClinchProfile } = require("./clinch.js");

function _appliquer(base, offsets, bruit = 6) {
  const out = {};
  for (const k of Object.keys(offsets)) {
    const val = base + offsets[k] + alea.gauss(0, bruit);
    out[k] = Math.trunc(Math.max(5, Math.min(99, val)));
  }
  return out;
}

const GR_KEYS = ["passing", "posture_sol", "half_guard_top", "side_control_top", "mount_top",
  "back_top", "closed_guard_bottom", "open_guard_bottom", "butterfly_bottom",
  "half_guard_bottom", "side_control_bottom", "mount_bottom", "back_defense",
  "turtle_defense", "sweeps", "shrimping", "explosiveness", "wall_walking",
  "hand_fighting_sol", "submission_off_top", "submission_off_bottom",
  "submission_def", "ground_striking"];

function generer_combattant({ niveau = null, archetype = null, division = null, nom = null } = {}) {
  niveau = niveau !== null ? niveau : alea.randint(35, 85);
  archetype = archetype || alea.choice(Object.keys(ARCHETYPES));
  division = division || alea.choice(Object.keys(E.DIVISIONS));
  const arc = ARCHETYPES[archetype];

  if (nom === null) {
    const prenom = alea.choice(PRENOMS), patro = alea.choice(NOMS);
    const surnom = alea.choice(SURNOMS);
    nom = surnom ? `${prenom} "${surnom}" ${patro}` : `${prenom} ${patro}`;
  }

  const st = _appliquer(niveau, arc.striking);
  st.volume = Math.trunc(Math.max(8, Math.min(97,
    alea.gauss(52, 15) + (VOLUME_ARCHETYPE[archetype] !== undefined ? VOLUME_ARCHETYPE[archetype] : 0))));
  const wr = _appliquer(niveau, arc.wrestling);
  const cl = _appliquer(niveau, arc.clinch);

  const famTop = arc.ground.top_control !== undefined ? arc.ground.top_control : 0;
  const famPass = arc.ground.passing !== undefined ? arc.ground.passing : 0;
  const famEsc = arc.ground.escapes !== undefined ? arc.ground.escapes : 0;
  const famSweep = arc.ground.sweeps !== undefined ? arc.ground.sweeps : 0;

  const grOff = {};
  for (const k of GR_KEYS) {
    if (k in arc.ground) grOff[k] = arc.ground[k];
    else if (k.endsWith("_top") || k === "posture_sol") grOff[k] = famTop * 0.7 + famPass * 0.3;
    else if (k.endsWith("_bottom") || k === "back_defense" || k === "turtle_defense")
      grOff[k] = famEsc * 0.6 + famSweep * 0.4;
    else if (["shrimping", "wall_walking", "explosiveness", "hand_fighting_sol"].includes(k))
      grOff[k] = famEsc * 0.8;
    else grOff[k] = 0;
  }
  const gr = _appliquer(niveau, grOff);

  const phOff = { cardio: 0, chin: 0, recovery: 0, body_conditioning: 0, balance_base: 0 };
  Object.assign(phOff, arc.physical !== undefined ? arc.physical : {});
  const ph = _appliquer(niveau, phOff);

  const meOff = { discipline: 0, fight_iq: 0, aggression: 0 };
  Object.assign(meOff, arc.mental !== undefined ? arc.mental : {});
  const me = _appliquer(niveau, meOff);

  const fighter = new E.Fighter(
    nom,
    new StrikingProfileV2(st),
    new E.WrestlingProfile(wr),
    new GroundProfile(gr),
    new ClinchProfile(cl),
    new E.PhysicalProfile(ph),
    new E.MentalProfile(me),
    {
      gameplan: Object.assign({}, arc.gameplan),
      garde: alea.random() < 0.22 ? E.SOUTHPAW : E.ORTHODOX,
      stance_switching: Math.trunc(Math.max(5, Math.min(99, alea.gauss(48, 20)))),
      division,
    });
  /* /!\ L'HOMME PORTE SON ARCHETYPE (10/08). Il etait rendu A COTE du
     combattant et presque toujours jete par l'appelant : le moteur ne
     savait donc pas a qui il avait affaire. Les temperaments en
     dependent — sans ca, ils retombaient tous dans la meme case
     (presseur 0 %, echangeur 56 % a la mesure). */
  fighter.archetype = archetype;
  return [fighter, archetype, niveau];
}

function generer_roster(n, { division = null, niveau_min = 35, niveau_max = 85 } = {}) {
  const roster = [];
  for (let i = 0; i < n; i++) {
    const [f, arc, niv] = generer_combattant({
      niveau: alea.randint(niveau_min, niveau_max),
      division,
    });
    roster.push({ fighter: f, archetype: arc, niveau: niv });
  }
  return roster;
}

module.exports = { ARCHETYPES, generer_combattant, generer_roster };

});

/* ===== traducteur.js ================================================= */
__def("traducteur.js", function (module, exports, require) {
/**
 * traducteur.js — portage de traducteur.py : le log du moteur devient une
 * chronologie jouable par l'ecran. REGLE ABSOLUE inchangee : l'ecran ne
 * raconte QUE ce que le moteur a tire ; la mise en scene ne touche qu'aux x,y.
 *
 * PIEGES SPECIFIQUES A CE MODULE
 * 1. DEUX generateurs : traduire() a son rng LOCAL (random.Random(graine))
 *    ET _autour() tire sur le module random GLOBAL quand angle est absent.
 *    On reproduit les deux flux : new Alea(graine) local + alea global.
 * 2. \w Python matche les ACCENTS ("réussi", "défendue") ; le \w JS est
 *    ASCII. Toutes les regex utilisent [\p{L}\p{N}_] avec le flag u.
 * 3. round(x, 1) Python arrondit le demi AU PAIR (56.25 -> 56.2, 18.75 ->
 *    18.8) ; toFixed arrondit vers le haut. pyRound1 teste le demi exact
 *    (les pas dyadiques 300/2^k le produisent vraiment).
 * 4. .title() Python : premiere lettre de CHAQUE sequence alphabetique en
 *    majuscule, le reste en minuscules ("l'ombre" -> "L'Ombre").
 * 5. e.get(cle) : une liste presente est TOUJOURS vraie en Python, meme
 *    [0,0,0,0] -> cote JS on teste !== undefined, pas la truthiness.
 */

const { Alea, alea } = require("./alea.js");

const R_CAGE = 148;
const CENTRE = [180, 180];

function _bord(angle, retrait = 18) {
  const r = R_CAGE - retrait;
  return [CENTRE[0] + r * Math.cos(angle), CENTRE[1] + r * Math.sin(angle)];
}

/** angle absent => tire sur le module random GLOBAL (comme en Python). */
function _autour(p, d = 36, angle = null) {
  const a = angle !== null ? angle : alea.uniform(0, 2 * Math.PI);
  return [p[0] + d * Math.cos(a), p[1] + d * Math.sin(a)];
}

const POS_SOL = { closed_guard: "GARDE FERMÉE", open_guard: "GARDE OUVERTE",
  half_guard: "DEMI-GARDE", side_control: "CONTRÔLE LATÉRAL",
  mount: "MONTÉE", back: "PRISE DE DOS", turtle: "TORTUE",
  butterfly: "GARDE PAPILLON" };

const SUBS = { guillotine: "guillotine", rear_naked: "étranglement arrière",
  armbar: "clé de bras", triangle: "triangle", kimura: "kimura",
  americana: "americana", anaconda: "anaconda", darce: "d'arce",
  heel_hook: "heel hook", guillotine_debout: "guillotine" };

const PRISES_FR = { neutre: "prise neutre", over_under: "over-under",
  double_under: "double sous-crochet", collar_tie: "prise de nuque",
  thai_plum: "plum thaï", back_clinch: "dos pris" };

const ARMES_CLINCH = { genou_cuisse: ["genou dans la cuisse", "j"],
  petit_corps: ["coups courts au corps", "c"],
  short_hook: ["crochet court", "t"],
  knee: ["genou au corps", "c"],
  knee_head: ["genou à la tête", "t"],
  elbow: ["coude", "t"] };

const SORTIES_FR = { frame_push: "cadre et repousse", pummel_out: "repummèle",
  spin_out: "pivote", duck_under: "passe sous le bras",
  wall_walk: "remonte le long de la grille",
  underhook_up: "cherche le sous-crochet" };

const LUTTE_CLINCH = { body_lock_attempt: "ceinture", trip_attempt: "balayage",
  throw_attempt: "projection", mat_return: "retour au tapis" };

// ------------------------------------------------------- helpers Python
const W = "[\\p{L}\\p{N}_]+";                    // le \w unicode de Python
const M = (l, motif) => l.match(new RegExp("^" + motif, "u"));
const S = (l, motif) => l.match(new RegExp(motif, "u"));

function pyTitle(s) {
  return s.replace(/\p{L}+/gu, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
}
const pyCap = (s) => s.length ? s[0].toUpperCase() + s.slice(1) : s;

function pyRound(x) {
  const f = Math.floor(x), diff = x - f;
  if (diff === 0.5) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}
function pyRound1(x) {
  const y = x * 10, f = Math.floor(y);
  if (y - f === 0.5) return (f % 2 === 0 ? f : f + 1) / 10;
  return Math.round(y) / 10;
}

// ------------------------------------------------------------- traduire
function traduire(log, nomA, nomB, secondes_round = 300, graine = 7) {
  const rng = new Alea(graine);
  const E = [];
  const V = { st: [0, 0, 0, 0], tdA: [0, 0], tdB: [0, 0], subA: 0, subB: 0 };
  const dmg_niv = {};

  // -- decoupage par round ------------------------------------------------
  const rounds = [];
  let cour = [];
  for (const l of log) {
    if (l.includes("ROUND") && l.includes("───")) {
      if (cour.length) rounds.push(cour);
      cour = [];
    } else cour.push(l.trim());
  }
  if (cour.length) rounds.push(cour);

  // -- etat de mise en scene ----------------------------------------------
  const etat = { mode: "distance", ancre: rng.uniform(0, 2 * Math.PI),
                 accule: null, sol_top: null };
  const pos = { A: _autour(CENTRE, 34, Math.PI), B: _autour(CENTRE, 34, 0) };

  const qui = (l) => l.startsWith(nomA) ? ["A", "B"]
                   : l.startsWith(nomB) ? ["B", "A"] : [null, null];

  function placer() {
    if (etat.mode === "sol" || etat.mode === "clinch") {
      const p = etat.accule ? _bord(etat.ancre, 26)
                            : _autour(CENTRE, rng.uniform(0, 46));
      pos.A = p;
      pos.B = [p[0] + 3, p[1] + 3];
    } else if (etat.accule) {
      const mur = _bord(etat.ancre);
      const dedans = _autour(mur, 30, etat.ancre + Math.PI);
      if (etat.accule === "A") { pos.A = mur; pos.B = dedans; }
      else { pos.B = mur; pos.A = dedans; }
    } else {
      const c = _autour(CENTRE, rng.uniform(0, 40));
      const a = rng.uniform(0, 2 * Math.PI);
      pos.A = _autour(c, 30, a);
      pos.B = _autour(c, 30, a + Math.PI);
    }
  }

  const _clinch = (l) => (l.includes("->") || l.startsWith("=>")
    || l.includes("prend le contrôle du clinch") || l.includes("pummele sans gain"));

  function _frappe_clinch(Xc, arme, dmg, sig) {
    const iX = Xc === "A" ? 0 : 2;
    V.st[iX + 1] += 1;
    if (sig) V.st[iX] += 1;
    const [lib, zone] = ARMES_CLINCH[arme] !== undefined
      ? ARMES_CLINCH[arme] : [arme.replace(/_/g, " "), "c"];
    const cle = (Xc === "A" ? "B" : "A") + zone;
    return [lib, (sig && dmg) ? cle : null];
  }

  function etape(t, kw = {}) {
    placer();
    const e = { t: pyRound1(t),
                a: [pyRound(pos.A[0]), pyRound(pos.A[1])],
                b: [pyRound(pos.B[0]), pyRound(pos.B[1])] };
    for (const [k, v] of Object.entries(kw))
      if (v !== null && v !== undefined) e[k] = v;
    E.push(e);
  }

  function _traiter_clinch(l, t) {
    if (l.includes("RÉUSSI, combat au sol")) return false;

    const sig = l.includes("[SIG]");
    const [X] = qui(l);
    let m;

    m = M(l, `(\\S+) prend le contrôle du clinch \\((${W})\\)`);
    if (m) {
      const Xc = m[1] === nomA ? "A" : "B";
      etat.mode = "clinch";
      etape(t, { ph: "CLINCH", chaud: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} prend le contrôle — ${PRISES_FR[m[2]] !== undefined ? PRISES_FR[m[2]] : m[2]}.` });
      return true;
    }

    m = M(l, `(\\S+) rompt et place (${W}) -> (\\S+) \\((\\d+)\\)`);
    if (m && X) {
      const [lib, cle] = _frappe_clinch(X, m[2], parseInt(m[4]), true);
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", chaud: 1, flash: 1, ctrl: "",
        com: `Il casse la prise et place ${lib} en sortant !`,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      V.st = [0, 0, 0, 0];
      return true;
    }

    m = M(l, `(\\S+) rompt et tente (${W}) ->`);
    if (m && X) {
      _frappe_clinch(X, m[2], 0, false);
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", ctrl: "", com: "Il rompt la prise et lance en sortant — à côté." });
      return true;
    }

    m = M(l, `(\\S+) casse le clinch \\((${W})\\)`);
    if (m) {
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", ctrl: "",
        com: `${pyTitle(m[1])} relâche la prise et remet de la distance.` });
      return true;
    }

    m = M(l, `(\\S+) tente (${W}) -> (${W})`);
    if (m && X && m[2] in SORTIES_FR) {
      const reussi = m[3] === "réussi";
      if (reussi) etat.mode = "distance";
      etape(t, { ph: reussi ? "DISTANCE" : "CLINCH", ctrl: reussi ? "" : null,
        com: reussi ? `${pyTitle(m[1])} ${SORTIES_FR[m[2]]} — il se dégage !`
                    : `${pyTitle(m[1])} ${SORTIES_FR[m[2]]} — ça ne vient pas.` });
      return true;
    }

    if (l.startsWith("=>") && l.includes("passe dans le dos")) {
      m = M(l, "=> (\\S+) passe dans le dos");
      const Xc = m[1] === nomA ? "A" : "B";
      etape(t, { ph: "CLINCH", chaud: 1, slow: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} tourne autour et PASSE DANS LE DOS !` });
      return true;
    }

    m = M(l, `(\\S+) riposte (${W}) -> (\\d+)`);
    if (m && X) {
      const [lib, cle] = _frappe_clinch(X, m[2], parseInt(m[3]), sig);
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      etape(t, { ph: "CLINCH", chaud: sig ? 1 : null, flash: sig ? 1 : null,
        com: sig ? `Il riposte dans la prise — ${lib} !` : null,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      V.st = [0, 0, 0, 0];
      return true;
    }

    m = M(l, `(\\S+) améliore sa prise -> (${W})`);
    if (m) {
      const Xc = m[1] === nomA ? "A" : "B";
      etape(t, { ph: "CLINCH", chaud: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} pummèle et améliore — ${PRISES_FR[m[2]] !== undefined ? PRISES_FR[m[2]] : m[2]}.` });
      return true;
    }

    if (l.includes("pummele sans gain")) {
      etape(t, { ph: "CLINCH", com: "Ça pummèle contre la grille, personne ne prend l'avantage." });
      return true;
    }

    m = M(l, "(\\S+) snap down -> (.+)");
    if (m) {
      const resiste = m[2].includes("résisté");
      etape(t, { ph: "CLINCH", chaud: resiste ? null : 1,
        com: resiste ? `${pyTitle(m[1])} tente le snap down — posture tenue.`
                     : `Snap down ! ${pyTitle(m[1])} le casse en deux.` });
      return true;
    }

    m = M(l, `(\\S+) (${W}) -> stoppé`);
    if (m && X && m[2] in LUTTE_CLINCH) {
      V["td" + X][1] += 1;
      etape(t, { ph: "CLINCH", com: `${LUTTE_CLINCH[m[2]]} de ${pyTitle(m[1])} — repoussée !`,
        ["td" + X]: [0, 1] });
      V["td" + X] = [0, 0];
      return true;
    }

    m = M(l, `(\\S+) (${W}) -> (\\S+) \\((\\d+)\\)`);
    if (m && X && m[2] in ARMES_CLINCH) {
      const d = parseInt(m[4]);
      const [lib, cle] = _frappe_clinch(X, m[2], d, sig);
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      etape(t, { ph: "CLINCH", chaud: sig ? 1 : null, flash: sig ? 1 : null,
        com: sig ? `${pyCap(lib)} dans la prise — ça fait mal !` : null,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      V.st = [0, 0, 0, 0];
      return true;
    }

    return false;
  }

  // -- lecture -------------------------------------------------------------
  let t_abs = 0.0;
  let fin = null;

  etape(0.0, { ph: "DISTANCE", rd: 1,
    com: "Les deux hommes touchent les gants. C'est parti." });

  boucle_rounds:
  for (let i_rd = 0; i_rd < rounds.length; i_rd++) {
    if (fin) break;
    const lignes = rounds[i_rd];
    const pas = secondes_round / Math.max(1, lignes.length);
    etat.mode = "distance"; etat.accule = null; etat.sol_top = null;
    if (i_rd) etape(t_abs, { ph: "DISTANCE", rd: i_rd + 1,
      com: `Round ${i_rd + 1}. Les coins ont parlé, on repart.` });

    for (const l of lignes) {
      t_abs += pas;
      const [X] = qui(l);
      let m;

      // ---- la cage ----
      if (l.includes("[cage]")) {
        if (l.includes("accule")) {
          m = M(l, "\\[cage\\] (\\S+) accule (\\S+)");
          if (m) {
            etat.accule = m[2] === nomA ? "A" : "B";
            etat.ancre = rng.uniform(0, 2 * Math.PI);
            const nom = etat.accule === "A" ? nomA : nomB;
            const autre = etat.accule === "A" ? nomB : nomA;
            etape(t_abs, { ph: "ACCULÉ — GRILLE", chaud: 1,
              com: `${pyTitle(autre)} coupe la cage — ${pyTitle(nom)} a le dos à la grille.` });
          }
        } else if (l.includes("dégage")) {
          etat.accule = null;
          etape(t_abs, { ph: "DISTANCE",
            com: `${pyTitle(l.split("]")[1].split(" se")[0].trim())} pivote et ressort vers le centre.` });
        }
        continue;
      }

      // ---- frappes ----
      m = M(l, `(\\S+) (${W}) → touché \\((\\d+)\\) (${W})`);
      if (m && X) {
        const arme = m[2], d = parseInt(m[3]), zone = m[4];
        const iX = X === "A" ? 0 : 2;
        V.st[iX] += 1; V.st[iX + 1] += 1;
        const cible = zone === "tête" ? "t" : l.includes("jambe") ? "j" : "c";
        const cle = (X === "A" ? "B" : "A") + cible;
        const gros = d >= 6;
        if (gros || rng.random() < 0.30) {
          dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
          const com = gros
            ? `${pyTitle(arme.replace(/_/g, " "))} de ${pyTitle(X === "A" ? nomA : nomB)} qui passe fort !`
            : null;
          etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE"
                            : etat.mode === "sol" ? "SOL" : "DISTANCE",
            chaud: (gros || etat.accule) ? 1 : null,
            com, dmg: { [cle]: 1 }, flash: gros ? 1 : null,
            st: [...V.st] });
          V.st = [0, 0, 0, 0];
        }
        continue;
      }
      m = M(l, `(\\S+) (${W}) → manqué`);
      if (m && X) {
        V.st[(X === "A" ? 0 : 2) + 1] += 1;
        continue;
      }

      // ---- le contre ----
      m = M(l, `!!! (\\S+) CONTRE le (${W}) de (\\S+) \\((\\d+)\\)`);
      if (m) {
        const Xc = m[1] === nomA ? "A" : "B";
        const iX = Xc === "A" ? 0 : 2;
        V.st[iX] += 1; V.st[iX + 1] += 1;
        const cle = (Xc === "A" ? "B" : "A") + "t";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        const arme = m[2].replace(/_/g, " ");
        etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE" : "DISTANCE",
          chaud: 1, flash: 1, dmg: { [cle]: 1 }, st: [...V.st],
          com: `CONTRE ! ${pyTitle(Xc === "A" ? nomA : nomB)} le cueille sur son ${arme} !` });
        V.st = [0, 0, 0, 0];
        continue;
      }

      // ---- le clinch ----
      if (_clinch(l)) {
        if (_traiter_clinch(l, t_abs)) continue;
      }

      // ---- lutte ----
      if (l.includes("RÉUSSI, combat au sol") && X) {
        V["td" + X][0] += 1; V["td" + X][1] += 1;
        const p = S(l, `\\((${W})\\)`);
        etat.mode = "sol"; etat.sol_top = X;
        etape(t_abs, { ph: "TAKEDOWN", chaud: 1, slow: 1, flash: 1,
          com: `${pyTitle(X === "A" ? nomA : nomB)} l'emmène au sol !`,
          sol: p ? (POS_SOL[p[1]] !== undefined ? POS_SOL[p[1]] : "AU SOL") : "AU SOL",
          ["td" + X]: [1, 1], ctrl: X });
        V["td" + X] = [0, 0];
        continue;
      }
      if (l.includes("→ stoppé") && X && (l.includes("leg") || l.includes("body_lock")
          || l.includes("trip") || l.includes("throw"))) {
        V["td" + X][1] += 1;
        etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE" : "DISTANCE",
          com: `Entrée de ${pyTitle(X === "A" ? nomA : nomB)} — repoussée !`,
          ["td" + X]: [0, 1] });
        V["td" + X] = [0, 0];
        continue;
      }
      if (l.includes("engage le clinch") && X) {
        etat.mode = "clinch";
        etape(t_abs, { ph: "CLINCH", com: `${pyTitle(X === "A" ? nomA : nomB)} ferme la distance, clinch.` });
        continue;
      }
      if (l.includes("casse le clinch") || l.includes("séparés")) {
        etat.mode = "distance";
        etape(t_abs, { ph: "DISTANCE", com: "Ils se séparent." });
        continue;
      }

      // ---- le sol ----
      m = M(l, `(\\S+) (${W}) → maintenu en (${W})`);
      if (m && etat.mode === "sol") {
        etape(t_abs, { ph: "SOL", sol: POS_SOL[m[3]] !== undefined ? POS_SOL[m[3]] : "AU SOL",
          com: `${pyTitle(m[1])} pousse — écrasé, ça ne sort pas.` });
        continue;
      }
      if (l.includes("se relève, retour debout")) {
        etat.mode = "distance"; etat.sol_top = null;
        etape(t_abs, { ph: "DISTANCE", slow: 1, sol: "", ctrl: "",
          com: "Il recrée l'espace et se relève ! Retour debout." });
        continue;
      }
      m = M(l, `(\\S+) progresse → (${W})`);
      if (m) {
        etape(t_abs, { ph: "SOL", sol: POS_SOL[m[2]] !== undefined ? POS_SOL[m[2]] : "AU SOL",
          com: `${pyTitle(m[1])} passe en ${(POS_SOL[m[2]] !== undefined ? POS_SOL[m[2]] : "").toLowerCase()}.` });
        continue;
      }
      if (l.includes("ground and pound") && X) {
        const iX = X === "A" ? 0 : 2;
        const mg = S(l, "→ (\\d+)/(\\d+) coups");
        if (mg) {
          V.st[iX] += parseInt(mg[1]);
          V.st[iX + 1] += parseInt(mg[2]);
        } else if (!l.includes("dégâts")) {
          V.st[iX + 1] += 1;
          continue;
        } else {
          V.st[iX] += 1; V.st[iX + 1] += 1;
        }
        const cle = (X === "A" ? "B" : "A") + "t";
        if (rng.random() < 0.4) {
          dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
          etape(t_abs, { ph: "SOL", dmg: { [cle]: 1 }, st: [...V.st] });
          V.st = [0, 0, 0, 0];
        }
        continue;
      }

      // ---- renversements ----
      m = M(l, `(\\S+) (${W}) → CONTRÉ, (\\S+) prend le dessus`);
      if (m && X) {
        V["td" + X][1] += 1;
        const Y = X === "A" ? "B" : "A";
        etat.mode = "sol"; etat.sol_top = Y;
        etape(t_abs, { ph: "TAKEDOWN", chaud: 1, slow: 1, flash: 1, ctrl: Y,
          com: `Entrée contrée ! ${pyTitle(m[3])} inverse et prend le dessus !`,
          sol: "AU SOL", ["td" + X]: [0, 1] });
        V["td" + X] = [0, 0];
        continue;
      }
      m = M(l, ">>> RENVERSEMENT, (\\S+) prend le dessus");
      if (m) {
        const Y = m[1] === nomA ? "A" : "B";
        etat.sol_top = Y;
        etape(t_abs, { ph: "SOL", chaud: 1, slow: 1, ctrl: Y,
          com: `RENVERSEMENT ! ${pyTitle(m[1])} balaie et passe dessus !` });
        continue;
      }

      // ---- soumissions ----
      m = S(l, `(?:tente|attaque) (${W})`);
      if (m && X && (l.includes("défendue") || l.includes("SOUMISSION"))) {
        V["sub" + X] += 1;
        const nom_sub = SUBS[m[1]] !== undefined ? SUBS[m[1]] : m[1].replace(/_/g, " ");
        if (l.includes("SOUMISSION")) {
          fin = ["SOUMISSION", X, nom_sub];
          etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1, flash: 1,
            com: `IL TAPE ! ${pyTitle(nom_sub)} — c'est terminé !`,
            ["sub" + X]: 1 });
          break boucle_rounds;
        }
        etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1,
          com: `${pyTitle(X === "A" ? nomA : nomB)} attaque la ${nom_sub} — défendue !`,
          ["sub" + X]: 1 });
        continue;
      }
      m = M(l, `\\*\\*\\* (\\S+) tape ! (${W})`);
      if (m) {
        const perdant = m[1] === nomA ? "A" : "B";
        const gagnant = perdant === "A" ? "B" : "A";
        const nom_sub = SUBS[m[2]] !== undefined ? SUBS[m[2]] : m[2].replace(/_/g, " ");
        fin = ["SOUMISSION", gagnant, nom_sub];
        etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1, flash: 1,
          com: `IL TAPE ! ${pyTitle(nom_sub)} — c'est terminé !`,
          ["sub" + gagnant]: 1 });
        break boucle_rounds;
      }

      // ---- knockdowns et fins ----
      if (l.includes("KNOCKDOWN")) {
        const Xk = l.includes(nomA) ? "A" : "B";
        const cle = Xk + "t";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        etape(t_abs, { ph: "KNOCKDOWN", chaud: 1, slow: 1, flash: 1,
          com: `KNOCKDOWN ! ${pyTitle(Xk === "A" ? nomA : nomB)} s'écroule !`,
          dmg: { [cle]: 1 }, kd: Xk });
        continue;
      }
      if (l.includes("KO SEC")) {
        const Xk = S(l, nomA + " est eteint|! " + nomA) ? "A" : "B";
        fin = ["KO", Xk === "A" ? "B" : "A", null];
        etape(t_abs, { ph: "KO", chaud: 1, slow: 1, flash: 1,
          com: "KO SEC ! Il est éteint — plus besoin d'arbitre." });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* (\\S+) tombe sur le contre");
      if (m) {
        const perd = m[1] === nomA ? "A" : "B";
        const gagne = perd === "A" ? "B" : "A";
        fin = ["KO", gagne, "sur le contre"];
        etape(t_abs, { ph: "KO", chaud: 1, slow: 1, flash: 1,
          com: `IL LE PREND SUR LE CONTRE ! ${pyTitle(gagne === "A" ? nomA : nomB)} l'éteint sur sa relance !` });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* TKO AU CORPS ! (\\S+) s effondre");
      if (m) {
        const perd = m[1] === nomA ? "A" : "B";
        const cle = perd + "c";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        fin = ["TKO", perd === "A" ? "B" : "A", "coup au foie"];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1, dmg: { [cle]: 1 },
          com: "AU FOIE ! Il plie en deux — il ne se relèvera pas." });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* TKO AU SOL ! (\\S+) finit");
      if (m) {
        const gagne = m[1] === nomA ? "A" : "B";
        fin = ["TKO", gagne, "ground and pound"];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1,
          com: "L'arbitre se jette entre eux — fini au sol !" });
        break boucle_rounds;
      }
      if (l.includes("TKO") && l.replace(/ê/g, "e").includes("arrete")) {
        const Xk = l.includes(nomA) ? "A" : "B";
        V.st[Xk === "B" ? 0 : 2] += 1;
        V.st[(Xk === "B" ? 0 : 2) + 1] += 1;
        fin = ["TKO", Xk === "A" ? "B" : "A", null];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1,
          com: "L'arbitre se jette entre eux ! C'est fini !" });
        break boucle_rounds;
      }
      // ---- decision aux points ----
      if (l.startsWith(">>> Match nul")) {
        fin = ["DÉCISION", null, "nul"];
        etape(t_abs, { ph: "DÉCISION", chaud: 1,
          com: "Les cartes des juges : match nul." });
        break boucle_rounds;
      }
      m = M(l, ">>> (\\S+) l emporte aux points");
      if (m) {
        const gagnant = m[1] === nomA ? "A" : "B";
        fin = ["DÉCISION", gagnant, null];
        etape(t_abs, { ph: "DÉCISION", chaud: 1,
          com: "Ça ira aux cartes des juges." });
        break boucle_rounds;
      }

      m = M(l, ">>> (\\S+) gagne au round");
      if (m) {
        const gagnant = m[1] === nomA ? "A" : "B";
        if (!fin) {
          fin = ["ARRÊT", gagnant, null];
          etape(t_abs, { ph: "FIN", chaud: 1, slow: 1, com: "C'est terminé !" });
        }
        break boucle_rounds;
      }
    }
  }

  if (!fin) fin = ["DÉCISION", null, null];
  const finale = { t: pyRound1(t_abs + 4), fin: 1 };
  if (V.st.some(x => x)) finale.st = [...V.st];
  E.push(finale);

  // -- momentum ------------------------------------------------------------
  let mo = 50.0;
  let ctrl_actif = null;
  for (const e of E) {
    if ("ctrl" in e) ctrl_actif = e.ctrl || null;
    if (e.st !== undefined) mo += (e.st[0] - e.st[2]) * 2.2;
    if (e.dmg !== undefined)
      for (const cle of Object.keys(e.dmg)) mo += cle.startsWith("A") ? -5 : 5;
    if (e.kd !== undefined) mo += e.kd === "A" ? -14 : 14;
    if (e.tdA !== undefined) mo += e.tdA[0] * 9;
    if (e.tdB !== undefined) mo -= e.tdB[0] * 9;
    if (e.subA !== undefined) mo += 5;
    if (e.subB !== undefined) mo -= 5;
    if (ctrl_actif === "A") mo += 3;
    else if (ctrl_actif === "B") mo -= 3;
    mo = Math.max(8.0, Math.min(92.0, mo + (50 - mo) * 0.06));
    e.mom = pyRound(mo);
  }
  return [E, fin, t_abs];
}

module.exports = { traduire };

});

/* ===== mesure.js ===================================================== */
__def("mesure.js", function (module, exports, require) {
/**
 * mesure.js — portage de mesure.py (le protocole de reference) et de
 * instrument.reset. C'est LUI qui prononce la bascule : il doit redonner
 *     DEC 47.6 | SUB 20.8 | TKO 19.4 | KO sec 10.9
 *
 * /!\ MISE A JOUR APRES LA BASCULE SCORING DU 08/08. L'ancienne ligne
 * affichait DEC 46.8 / nul 0.8 : elle etait devenue un FANTOME, on aurait
 * compare a un etat qui n'existait plus.
 * Le DELTA EST LA PREUVE que le calibrage est intact : SUB, TKO, KO sec et
 * TKO sol sont identiques AU DIXIEME (20.8 / 19.4 / 10.9 / 1.3). Seuls DEC
 * et nul ont bouge, de exactement 0.8 point, l'un vers l'autre — ce sont
 * les matchs nuls devenus des decisions, le 10-8 ayant quasi disparu. Le
 * scoring ne touche QUE les decisions, comme annonce.
 * avec mesurer(40, seed, 3) sur les graines 11 / 41 / 900.
 * L'ordre des tirages suit mesure.py : seed -> par division (ordre de
 * DIVISIONS) -> par roster (generer_roster) -> par combat (sample de 2).
 */

const { alea } = require("./alea.js");
const E = require("./engine.js");
const { generer_roster } = require("./generator.js");

/** instrument.reset : remise a neuf d'un combattant entre deux combats. */
function reset(x) {
  x.head_damage = 0; x.cardio = 100.0; x.sonne = 0; x.knockdowns = 0;
  x.legs.gauche = 0; x.legs.droite = 0;
  x.body.degats_corps = 0; x.body.degats_foie = 0;
  x.stance.garde_actuelle = x.stance.garde_naturelle;
}

function mesurer(n_par_div = 60, seed = 11, divisions = null, n_rosters = 3) {
  alea.seed(seed);
  const res = {};
  for (const div of (divisions || Object.keys(E.DIVISIONS))) {
    E.reset_telemetry();
    const issues = {};
    let n = 0;
    for (let r = 0; r < n_rosters; r++) {
      const roster = generer_roster(40, { division: div, niveau_min: 45, niveau_max: 85 });
      for (let c = 0; c < n_par_div; c++) {
        const [a, b] = alea.sample(roster, 2);
        const fa = a.fighter, fb = b.fighter;
        reset(fa); reset(fb);
        const [w, log] = E.simuler_combat(fa, fb, 3, false);
        const t = log.join("\n");
        let cle;
        if (!w) cle = "nul";
        else if (t.includes("tape !")) cle = "SUB";
        else if (t.includes("TKO AU SOL")) cle = "TKO sol";
        else if (t.includes("KO SEC")) cle = "KO sec";
        else if (t.includes("TKO")) cle = "TKO";
        else cle = "DEC";
        issues[cle] = (issues[cle] !== undefined ? issues[cle] : 0) + 1;
        n += 1;
      }
    }
    res[div] = { n, issues };
  }
  return res;
}

module.exports = { mesurer, reset };

// ------------------------------------------------------- execution directe
if (require.main === module) {
  const graines = process.argv.length > 2
    ? process.argv.slice(2).map(Number) : [11, 41, 900];
  const nParDiv = 40, nRosters = 3;
  const moyennes = {};
  for (const g of graines) {
    const r = mesurer(nParDiv, g, null, nRosters);
    const tot = {};
    let T = 0;
    for (const div of Object.keys(r))
      for (const [k, v] of Object.entries(r[div].issues)) {
        tot[k] = (tot[k] !== undefined ? tot[k] : 0) + v;
        T += v;
      }
    const ligne = ["DEC", "SUB", "TKO", "KO sec", "TKO sol", "nul"]
      .map(k => `${k} ${((tot[k] !== undefined ? tot[k] : 0) / T * 100).toFixed(1)}`);
    console.log(`  graine ${String(g).padStart(3)} (n=${T}) : ${ligne.join(" | ")}`);
    for (const k of ["DEC", "SUB", "TKO", "KO sec", "TKO sol", "nul"])
      (moyennes[k] = moyennes[k] || []).push((tot[k] !== undefined ? tot[k] : 0) / T * 100);
  }
  const moy = Object.entries(moyennes)
    .map(([k, v]) => `${k} ${(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1)}`);
  console.log(`  MOYENNE ${graines.length} graines : ${moy.join(" | ")}`);
  console.log("  REFERENCE (chantier I complet, 09/08) : DEC 48.8 | SUB 23.8 | TKO 16.9 | KO sec 9.0 | TKO sol 1.4 | nul 0.0");
  console.log("  (08/08 scoring : DEC 47.6 | SUB 20.8 | TKO 19.4 | KO 10.9)");
  console.log("  /!\\ le calibrage a BOUGE, c'etait prevu : on repare les mecaniques,");
  console.log("      on recalibrera a la fin. Ne pas 'corriger' ce deplacement.");
}

});

/* ===== temps.js ====================================================== */
__def("temps.js", function (module, exports, require) {
/**
 * temps.js — la colonne vertébrale du jeu de gestion : le temps.
 *
 * VOLONTAIREMENT PAUVRE (decision du 08/08). Le calendrier ne sait PAS ce
 * qu'est un camp, un contrat, une ligue : il connait trois choses et rien
 * d'autre :
 *   1. le JOUR courant (unite atomique — la semaine est une VUE, jour/7,
 *      parce qu'on s'entraine sur un truc lundi et un autre mardi) ;
 *   2. des ECHEANCES : {jour, type, donnees} — il ne comprend pas `type`,
 *      c'est le systeme qui l'a posee qui le comprendra ;
 *   3. des ABONNES : chaque systeme branche recoit chaque jour ecoule, avec
 *      les echeances de ce jour, et se debrouille.
 * La pause et le defilement (jour par jour, vitesse, "passer une semaine")
 * sont de la PRESENTATION : l'interface appelle avancer(1) en rythme, ou
 * avancer(7), ou n'appelle pas. Le coeur n'a pas d'horloge.
 *
 * TEST D'EXTENSIBILITE (a verifier le jour des camps) : si brancher un
 * nouveau systeme oblige a toucher UNE ligne de ce fichier, la base etait
 * mal concue.
 */

const JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi",
                       "vendredi", "samedi", "dimanche"];

class Temps {
  constructor(jourDepart = 0) {
    this.jour = jourDepart;          // compteur absolu, demarre a 0
    this.echeances = [];             // {jour, type, donnees}
    this.abonnes = [];               // fonctions (jour, echeancesDuJour) => void
    this._prochainId = 1;
  }

  // ---- vues (la semaine n'existe pas dans l'etat, elle se calcule) ----
  semaine() { return Math.floor(this.jour / 7) + 1; }
  jourDeSemaine() { return JOURS_SEMAINE[this.jour % 7]; }
  libelle() { return `${this.jourDeSemaine()} — semaine ${this.semaine()}`; }

  // ---- echeances ----
  poser(jour, type, donnees = null) {
    const id = this._prochainId++;
    this.echeances.push({ id, jour, type, donnees });
    return id;                       // pour pouvoir annuler
  }
  annuler(id) {
    this.echeances = this.echeances.filter(e => e.id !== id);
  }
  aVenir(horizonJours = 28) {
    return this.echeances
      .filter(e => e.jour >= this.jour && e.jour < this.jour + horizonJours)
      .sort((a, b) => a.jour - b.jour);
  }

  // ---- abonnement ----
  abonner(fn) { this.abonnes.push(fn); return fn; }

  // ---- LA seule operation du temps ----
  avancer(nJours = 1) {
    for (let i = 0; i < nJours; i++) {
      this.jour += 1;
      const duJour = this.echeances.filter(e => e.jour === this.jour);
      this.echeances = this.echeances.filter(e => e.jour !== this.jour);
      for (const abonne of this.abonnes) abonne(this.jour, duJour);
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Temps, JOURS_SEMAINE };
}

});

/* ===== fiches.js ===================================================== */
__def("fiches.js", function (module, exports, require) {
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

});

/* ===== verdict.js ==================================================== */
__def("verdict.js", function (module, exports, require) {
/**
 * verdict.js — LE COMPTE RENDU OFFICIEL D'UN COMBAT, LU DANS LE LOG DU MOTEUR.
 *
 * POURQUOI UN MODULE DE PLUS, ET PAS UNE RETOUCHE DU TRADUCTEUR
 * traducteur.js produit la CHRONOLOGIE de l'ecran anime, et il est tenu
 * ligne a ligne par verifier_traducteur.js contre traducteur.py — or le
 * Python du depot est le TEMOIN HISTORIQUE, gele. Enrichir fin[] cote JS
 * ferait tomber ce banc a 0/24. Ce sont deux artefacts differents :
 *   - traducteur : ce que l'ecran MONTRE, seconde par seconde ;
 *   - verdict    : ce que le palmares RETIENT, une ligne pour toujours.
 * Ce module est donc natif JS, comme fiches.js, et il est tenu par des
 * INVARIANTS (verifier_verdict.js) plutot que par une conformite Python.
 * Le plus fort de ces invariants : verdict et traducteur doivent TOUJOURS
 * s'accorder sur la methode et le vainqueur. C'est la regle 7 avec deux
 * lectures independantes du meme log.
 *
 * RIEN N'EST INVENTE ICI. Chaque detail sort d'une ligne du log :
 * l'arme du KO est celle que le moteur a tiree, le score de la decision est
 * celui que le moteur a compte. Ce qui n'est pas dans le log n'est pas
 * affiche — pas de "decision unanime", par exemple : le moteur n'a pas
 * trois juges, il a une carte.
 */

// ---------------------------------------------------------------- vocabulaire
// L'oreille du fan francais juge. Un nom de cle du moteur (`crochet_corps`,
// `north_south_choke`) ne doit JAMAIS atteindre l'ecran.
const ARMES_FR = {
  jab: "jab", cross: "cross", crochet: "crochet", uppercut: "uppercut",
  overhand: "overhand", crochet_corps: "crochet au corps",
  low_kick: "low kick", calf_kick: "calf kick", body_kick: "body kick",
  high_kick: "high kick", teep: "teep",
  spinning_back_fist: "revers tournant", spinning_kick: "coup de pied retourné",
  wheel_kick: "wheel kick",
};

const SUBS_FR = {
  guillotine: "guillotine", guillotine_debout: "guillotine debout",
  toe_hold: "toe hold", heel_hook: "heel hook", kimura: "kimura",
  darce: "d'arce", brabo: "brabo", americana: "americana",
  arm_triangle: "arm triangle", north_south_choke: "étranglement nord-sud",
  armbar: "clé de bras", baseball_choke: "baseball choke", ezekiel: "ezekiel",
  mounted_triangle: "triangle monté", rear_naked_choke: "étranglement arrière",
  bow_and_arrow: "bow and arrow", neck_crank: "torsion de nuque",
  anaconda: "anaconda", peruvian_necktie: "cravate péruvienne",
  triangle: "triangle", omoplata: "omoplata",
};

const POSITIONS_FR = {
  closed_guard: "garde fermée", open_guard: "garde ouverte",
  butterfly_guard: "garde papillon", half_guard: "demi-garde",
  side_control: "contrôle latéral", north_south: "position nord-sud",
  knee_on_belly: "genou sur le ventre", mount: "montée",
  back_control: "dos pris", crucifix: "crucifix", turtle: "tortue",
};

/** Traduit, ou LEVE. Un terme inconnu est un trou de vocabulaire : on veut le
 *  voir au banc, pas le decouvrir a l'ecran sous forme de `north_south_choke`. */
function mot(table, cle, quoi) {
  if (!(cle in table)) throw new Error(`verdict.js : ${quoi} inconnu "${cle}"`);
  return table[cle];
}

// ------------------------------------------------------------------ lecture
/* /!\ verdict.js est VOLONTAIREMENT AUTONOME : aucun require, pour pouvoir
   etre embarque tel quel dans le bundle navigateur. On duplique donc la
   duree du round plutot que d'importer engine.js. Si elle change la-bas,
   elle doit changer ici — le banc 9 le verifie. */
const DUREE_ROUND_S = 300;

const nu = (s) => s.trim();
const hms = (r, sec) => `R${r} ${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/** Derniere ligne AVANT l'index i qui satisfait le predicat. */
function remonter(L, i, pred) {
  for (let k = i - 1; k >= 0; k--) if (pred(L[k])) return L[k];
  return null;
}

/** Position au sol la plus recemment annoncee avant l'index i. */
function positionAu(L, i) {
  const motifs = [
    /combat au sol \(([a-z_]+)\)/, /le suit au sol en ([a-z_]+)/,
    /progresse → ([a-z_]+)/, /bloqué en ([a-z_]+)/, /maintenu en ([a-z_]+)/,
    /passe en ([a-z_]+)/,
  ];
  for (let k = i - 1; k >= 0; k--)
    for (const m of motifs) {
      const r = L[k].match(m);
      // /!\ "passe en orthodox" est un CHANGEMENT DE GARDE, pas une
      // position de sol (leve en vie de monde le 10/08 : un switch avant
      // un TKO au sol faisait planter le verdict). Les mots de garde ne
      // sont pas des positions — on continue de remonter.
      if (r && r[1] !== "orthodox" && r[1] !== "southpaw") return r[1];
    }
  return null;
}

/** Une chute de `qui` : debout (KNOCKDOWN) ou au sol (sonne sous le GnP).
 *  Ce sont les deux seuls appels a encaisser_knockdown dans le moteur. */
function estChute(l, qui) {
  return l.includes(`KNOCKDOWN ! ${qui} touche le sol`)
      || l.includes(`>>> ${qui} est sonne au sol`);
}

/** Index de la DERNIERE chute de `qui` avant i, ou -1.
 *  Le moteur remet coups_sonne a zero a chaque chute : c'est donc la borne
 *  a partir de laquelle il compte, et donc la notre. */
function derniereChute(L, i, qui) {
  for (let k = i - 1; k >= 0; k--) if (estChute(L[k], qui)) return k;
  return -1;
}

/** Chutes subies par `qui` avant i. */
function chutesDe(L, i, qui) {
  let n = 0;
  for (let k = 0; k < i; k++) if (estChute(L[k], qui)) n++;
  return n;
}

/** Coups a la tete portes par `qui` depuis la chute de `sur`. C'est
 *  exactement dfn.coups_sonne du moteur — a une unite pres : le coup qui
 *  DECLENCHE l'arret est compte par le moteur mais jamais ecrit au log
 *  (le return precede le log.push). L'appelant ajoute donc 1. */
function coupsDepuisChute(L, i, qui, sur) {
  const depart = derniereChute(L, i, sur);
  if (depart < 0) return 0;
  let n = 0;
  for (let k = depart + 1; k < i; k++)
    if (new RegExp(`^\\s+${qui} \\S+ → touché .* tête$`).test(L[k])) n++;
  return n;
}

// ------------------------------------------------------------------ verdict
/**
 * @param {string[]} log   le log rendu par engine.simuler_combat
 * @param {string} nomA    nom cote A (celui du Fighter, mono-jeton)
 * @param {string} nomB    nom cote B
 * @returns {{methode,vainqueur,detail,round,echange,scores,libelle}}
 *   vainqueur : "A", "B" ou null (nul)
 *   libelle   : la ligne prete pour l'ecran, ex. "KO — crochet"
 */
function verdict(log, nomA, nomB) {
  const L = log.join("\n").split("\n");
  const cote = (nom) => (nom === nomA ? "A" : nom === nomB ? "B"
    : (() => { throw new Error(`verdict.js : nom hors affiche "${nom}"`); })());
  const autre = (c) => (c === "A" ? "B" : "A");

  // rounds effectivement joues (sert de repli si la fin n'est pas datee)
  let rounds = 0;
  for (const l of L) { const m = l.match(/──────── ROUND (\d+) ────────/); if (m) rounds = Number(m[1]); }

  // La ligne d'arret du moteur : c'est elle qui date la fin.
  // /!\ "echange" est un NOM TROMPEUR. simuler_round rend pyRound(t) et t est
  // un TEMPS EN SECONDES (`while (t < duree)`, duree = 300). 166 n'est pas le
  // 166e echange, c'est la 166e seconde du round. Le libelle reste faux dans
  // engine.js parce que la ligne est comparee au caractere pres contre
  // engine.py, qui est gele — voir chrono.js.
  let round = null, seconde = null;
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/>>> (\S+) gagne au round (\d+) \(échange (\d+)\)/);
    if (m) {
      round = Number(m[2]);
      seconde = Number(m[3]);
      // /!\ UNE FINITION NE PEUT PAS ARRIVER APRES LA CLOCHE. La boucle du
      // round est `while (t < duree)` et le temps de l'echange s'ajoute
      // APRES le test : le dernier echange peut donc deborder de quelques
      // secondes, et un KO s'y retrouve date a 304 s dans un round de 300.
      // Artefact de bord, latent depuis toujours, revele le 09/08 quand le
      // verrou 5 a decale le flux de hasard. On ramene a la cloche plutot
      // que d'afficher une heure impossible — et on corrige ICI, dans la
      // couche de lecture, pas dans le moteur gele.
      if (seconde > DUREE_ROUND_S) seconde = DUREE_ROUND_S;
    }
  }

  let methode = null, vainqueur = null, detail = null;

  for (let i = 0; i < L.length; i++) {
    const l = nu(L[i]);

    // --- KO sec : l'arme est celle de la derniere frappe a la tete du tueur
    let m = l.match(/^\*\*\* KO SEC ! (\S+) est eteint par (\S+) \*\*\*$/);
    if (m) {
      vainqueur = cote(m[2]); methode = "KO";
      const coup = remonter(L, i, (x) => new RegExp(`^\\s+${m[2]} \\S+ → touché .* tête$`).test(x));
      detail = coup ? mot(ARMES_FR, nu(coup).split(" ")[1], "arme") : null;
      break;
    }

    // --- KO en contre : le moteur nomme l'arme SUR LAQUELLE le contre est parti
    m = l.match(/^\*\*\* (\S+) tombe sur le contre ! \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "KO";
      const c = remonter(L, i, (x) => x.includes("CONTRE le"));
      const a = c && c.match(/CONTRE le (\S+) de/);
      detail = a ? `en contre d'un ${mot(ARMES_FR, a[1], "arme")}` : "sur le contre";
      break;
    }

    // --- TKO au corps : le coup et la zone sont dans la ligne precedente
    m = l.match(/^\*\*\* TKO AU CORPS ! (\S+) s effondre sur un coup au foie \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      const coup = remonter(L, i, (x) => /→ touché .* foie$/.test(x));
      // "crochet au corps au foie" ne se dit pas : la zone est deja le foie.
      const arme = coup ? mot(ARMES_FR, nu(coup).split(" ")[1], "arme") : null;
      detail = arme ? `${arme.replace(/ au corps$/, "")} au foie` : "coup au foie";
      break;
    }

    // --- TKO au sol : on nomme la position, c'est ce que le fan retient
    m = l.match(/^\*\*\* TKO AU SOL ! (\S+) finit au ground and pound \*\*\*$/);
    if (m) {
      vainqueur = cote(m[1]); methode = "TKO";
      const p = positionAu(L, i);
      detail = p ? `ground and pound en ${mot(POSITIONS_FR, p, "position")}` : "ground and pound";
      break;
    }

    // --- TKO sur re-knockdown : le moteur compte les chutes, on les compte aussi
    m = l.match(/^\*\*\* TKO ! (\S+) retombe, l'arbitre arrete \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      // +1 : la chute qui arrete le combat n'est pas ecrite au log.
      const n = chutesDe(L, i, m[1]) + 1;
      // "l'arbitre arrête" serait redondant : c'est ce que TKO veut dire.
      detail = `${n}e knockdown`;
      break;
    }

    // --- TKO sur COUPURE : le medecin arrete (Mael, 10/08 : "noté TKO")
    m = l.match(/^\*\*\* TKO ! (\S+) coupe, le medecin arrete le combat \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      detail = "coupure, arrêt du médecin";
      break;
    }

    // --- TKO sur serie non defendue
    m = l.match(/^\*\*\* TKO ! (\S+) ne repond plus, l'arbitre arrete \*\*\*$/);
    if (m) {
      const perd = cote(m[1]); vainqueur = autre(perd); methode = "TKO";
      const gagnant = vainqueur === "A" ? nomA : nomB;
      // +1 : le coup qui declenche l'arret n'est pas ecrit au log.
      const n = coupsDepuisChute(L, i, gagnant, m[1]) + 1;
      detail = `${n} coups après le knockdown`;
      break;
    }

    // --- Soumission : le nom de la prise, et d'ou elle est partie
    m = l.match(/^\*\*\* (\S+) tape ! (.+?)( d'en bas)? \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "SOUMISSION";
      const nom = mot(SUBS_FR, m[2].trim().replace(/ /g, "_"), "soumission");
      detail = m[3] ? `${nom} depuis la garde` : nom;
      break;
    }

    // --- Decision : le score est celui que le moteur a compte, pas un habillage
    if (l === "──────── DÉCISION ────────") {
      // La carte porte les NOMS : on les lit, on ne suppose pas l'ordre.
      const carte = {};
      for (const k of [i + 1, i + 2]) {
        // /!\ LE NOM PEUT CONTENIR UN ESPACE ("Van Dijk", "Da Costa") :
        // (\S+) refusait ces cartes et le verdict LEVAIT en fin de combat,
        // une fois sur deux seulement (decisions uniquement). On lit le nom
        // en NON-GOURMAND jusqu'au " : ", ce qui accepte les deux formes.
        const c = (L[k] || "").match(/^\s+(.+?) : (\d+)$/);
        if (!c) throw new Error("verdict.js : carte de score illisible");
        carte[cote(c[1])] = Number(c[2]);
      }
      if (carte.A === undefined || carte.B === undefined)
        throw new Error("verdict.js : carte de score incomplete");
      methode = "DÉCISION";
      vainqueur = carte.A > carte.B ? "A" : carte.B > carte.A ? "B" : null;
      const [h, b] = [Math.max(carte.A, carte.B), Math.min(carte.A, carte.B)];
      detail = `${h}-${b}`;   // le nul se lit sur vainqueur===null, pas dans le texte
      if (round === null) round = rounds;
      seconde = null;   // une decision ne se date pas a la seconde
      break;
    }
  }

  // --- Le moteur a designe un vainqueur sans cause reconnue : on le DIT.
  if (methode === null) {
    if (round === null) throw new Error("verdict.js : log sans fin exploitable");
    methode = "ARRÊT"; detail = null;
    const m = L.join("\n").match(/>>> (\S+) gagne au round/);
    vainqueur = m ? cote(m[1]) : null;
  }

  // methode : la CLE, comparable a fin[0] du traducteur (invariant du banc).
  // methode_fr : ce qui se lit a l'ecran. libelle : les deux assembles, en
  // PARENTHESES et pas en tiret, pour que l'ecran puisse lui-meme prefixer
  // "Victoire — ..." sans produire deux tirets dans la meme phrase.
  const methode_fr = { "DÉCISION": "décision", "SOUMISSION": "soumission",
                       "ARRÊT": "arrêt" }[methode] || methode;
  return { methode, methode_fr, vainqueur, detail, round, seconde,
           heure: seconde === null ? null : hms(round, seconde),
           libelle: detail ? `${methode_fr} (${detail})` : methode_fr };
}

module.exports = { verdict, ARMES_FR, SUBS_FR, POSITIONS_FR };

});

/* ===== profil.js ===================================================== */
__def("profil.js", function (module, exports, require) {
/**
 * profil.js — LE BLOC "SUR LE PAPIER", LU AU MEME ENDROIT PAR TOUS LES ECRANS.
 *
 * Ces huit nombres resument un combattant a cote de ses stats de combat
 * reelles ("LE COMBAT" contre "SUR LE PAPIER"). Ils etaient calcules dans
 * combat.js ; des que le jeu ouvre le meme ecran, la formule doit vivre a UN
 * seul endroit — sinon deux ecrans montrent deux fois "le meme" combattant
 * avec des chiffres differents, et c'est la regle 7 qui saute.
 *
 * Ce sont des MOYENNES DE STATS DE FICHE, pas des mesures de combat : elles
 * ne dependent d'aucun tirage et ne bougent pas pendant le combat (cardio y
 * est la stat physical.cardio, pas la jauge vivante f.cardio).
 */

/* /!\ OFFENSE ET DEFENSE SEPAREES (Mael, 10/08, en lisant sa raclee :
   "pourtant j'etais au-dessus en stats frappe" puis "et lutte, je vois
   off et pas def").
   IL AVAIT RAISON SUR LES DEUX. L'axe "Frappe" ne montrait que quatre
   coups (jab, cross, crochet, low kick) et RIEN de l'esquive, de la
   parade, des reflexes ni de la lecture — un homme a 66 en frappe et 30
   en esquive s'affichait comme un bon frappeur, puis encaissait 185
   coups. Et l'axe "Lutte" MELANGEAIT shot (offensif), sprawl (defensif)
   et clinch_wrestling : deux hommes a 59 et 65 pouvaient etre des
   combattants opposes. Dans son combat : 1 amenee sur 8 pour lui, 3 sur
   3 pour l'autre — un ecart pareil ne peut pas tenir dans "59 contre 65".
   ON NE PEUT PAS CHOISIR UN COMBAT SUR DES CHIFFRES QUI NE MONTRENT QUE
   LA MOITIE DE CE QUI COMPTE. */
const LIBELLES = ["Frappe", "Défense debout", "Lutte off.", "Déf. lutte",
                  "Sol off.", "Sol déf.", "Soumission", "Déf. soum.",
                  "Cardio", "Menton", "Fight IQ"];

/** Fighter -> les huit nombres, dans l'ordre de LIBELLES. */
function lire(f) {
  const s = f.striking, l = f.wrestling, g = f.ground;
  return [Math.round((s.jab + s.cross + s.crochet + s.low_kick) / 4),
          /* Ce qui evite de prendre : esquive, parade, blocage, reflexes,
             lecture. C'est CETTE ligne qui manquait. */
          Math.round((s.esquive_tete + s.parade + s.blocage + s.reflexes
                      + s.lecture) / 5),
          Math.round((l.shot + l.throws) / 2),          // amener au sol
          Math.round((l.sprawl + l.whizzer + l.balance) / 3),  // ne pas y aller
          /* Dominer au sol : passer la garde, monter, tenir le dessus. */
          Math.round((g.passing + g.mount_top + g.side_control_top) / 3),
          /* Se relever, se degager : ce qu'on subit quand on n'a pas ca. */
          /* /!\ LES VRAIES CLES DU PROFIL SOL (corrige : `escapes` et
             `top_control` n'existent pas — ce sont des noms du GENERATEUR,
             pas du moteur. Ils rendaient NaN a l'ecran). Se degager, c'est
             crocheter, se relever au mur, et defendre sa garde. */
          Math.round((g.shrimping + g.wall_walking + g.half_guard_bottom
                      + g.back_defense) / 4),
          Math.round((g.submission_off_top + g.submission_off_bottom) / 2),
          /* /!\ LE SEUL AXE QUI N'ETAIT PAS ARRONDI (Mael, capture du
             10/08 : "84.93987...7" deborde de l'ecran). Une stat qui a
             progresse porte des decimales ; toutes les autres passaient
             par Math.round, celle-ci non. */
          Math.round(g.submission_def),
          Math.round(f.physical.cardio),
          Math.round(f.physical.chin),
          Math.round(f.mental.fight_iq)];
}

/** Les deux combattants -> le tableau [[libelle, a, b], ...] du gabarit. */
function profils(fa, fb) {
  const a = lire(fa), b = lire(fb);
  return LIBELLES.map((lib, i) => [lib, a[i], b[i]]);
}

module.exports = { LIBELLES, lire, profils };

});

/* ===== chrono.js ===================================================== */
__def("chrono.js", function (module, exports, require) {
/**
 * chrono.js — RECALER L'HORLOGE DE L'ECRAN SUR CELLE DU MOTEUR.
 *
 * LE PROBLEME
 * traducteur.py etale les lignes d'un round sur toute sa duree :
 *     pas = secondes_round / nombre_de_lignes
 * Un round qui s'arrete a 0:41 est donc dilate jusqu'a 5:00, et TOUTE
 * finition s'affiche a la sonnerie. Mesure : sur les finitions de l'affiche
 * Okonkwo/Renaud, l'ecran annoncait 5:00 la ou le moteur avait 0:29, 0:30,
 * 0:41, 2:46... C'est la regle 7 au sens strict : une heure que rien n'a
 * tiree.
 *
 * LA DECOUVERTE
 * Le moteur n'a JAMAIS perdu cette information. simuler_round rend
 * [vainqueur, pyRound(t)] ou t est un temps en SECONDES (`while (t < duree)`,
 * duree = 300). simuler_combat l'ecrit au log :
 *     >>> Okonkwo gagne au round 3 (échange 166)
 * Le libelle "echange" est un NOM TROMPEUR pour un chronometre. 166 n'est pas
 * le 166e echange, c'est la 166e seconde du round.
 * /!\ NE PAS corriger ce libelle dans engine.js : la ligne est comparee au
 * caractere pres contre engine.py, qui est gele. Le nom reste faux, le
 * carnet dit pourquoi, et le code le lit correctement.
 *
 * LA CORRECTION
 * Aucun module gele n'est touche. On post-traite la sortie du traducteur :
 * le round de la fin est REDUIT de sa duree supposee (300 s) a sa duree
 * reelle. Les rounds precedents ne bougent pas — ils sont bien alles au
 * bout. C'est une homothetie, pas une reecriture : l'ordre des etapes et
 * leur contenu sont inchanges, seule l'echelle du dernier round change.
 *
 * CE QUE CA NE CORRIGE PAS (et qu'il faut savoir)
 * A l'interieur d'un round, la repartition reste UNIFORME : le moteur ne
 * date pas ses echanges un par un, il ne donne que le total. Un round qui
 * dure 166 s montre donc ses 40 lignes reparties regulierement sur 166 s.
 * L'heure de la FIN est desormais juste ; l'heure de chaque coup reste une
 * approximation honnete. Pour aller plus loin il faudrait que le moteur
 * date chaque ligne — donc modifier engine.py, donc rouvrir la bascule.
 */

/**
 * @param {object[]} etapes   sortie de traducteur.traduire (champ .t absolu)
 * @param {number} sec_round  duree nominale d'un round (300)
 * @param {number} round_fin  round ou le combat s'arrete (1-indexe)
 * @param {number} sec_fin    secondes ecoulees dans ce round, du moteur
 * @returns {object[]} de NOUVELLES etapes, recalees
 */
function recaler(etapes, sec_round, round_fin, sec_fin) {
  if (!Array.isArray(etapes)) throw new Error("chrono.js : etapes attendues");
  if (!(sec_fin >= 0) || sec_fin > sec_round)
    throw new Error(`chrono.js : sec_fin hors du round (${sec_fin}/${sec_round})`);

  // /!\ Ne PAS prendre (round_fin-1)*sec_round comme debut du round : le
  // traducteur avance par `pas = 300/n` repete n fois, et l'accumulation
  // flottante laisse la frontiere a 599.9999... Une etape tombait alors du
  // mauvais cote et la fin s'affichait une seconde trop tot (1:18 pour 1:19,
  // attrape au banc). On lit donc le debut SUR LES ETAPES elles-memes, et on
  // etire le segment [premiere, derniere] sur exactement sec_fin secondes.
  const iRd = etapes.findIndex((e) => e.rd === round_fin);
  const debut = iRd >= 0 ? etapes[iRd].t
              : (round_fin === 1 && etapes.length ? etapes[0].t
                                                  : (round_fin - 1) * sec_round);
  const derniere = etapes.length ? etapes[etapes.length - 1].t : debut;
  if (derniere <= debut) return etapes.slice();

  const ancre = (round_fin - 1) * sec_round;   // ou le round DOIT commencer
  const facteur = sec_fin / (derniere - debut);

  return etapes.map((e) => {
    if (typeof e.t !== "number" || e.t < debut) return e;
    const dans = Math.min(sec_fin, (e.t - debut) * facteur);
    return Object.assign({}, e, { t: Math.round((ancre + dans) * 10) / 10 });
  });
}

/** "R3 2:46" — l'heure de la fin en langage de fiche. */
function heure(round, secondes) {
  const m = Math.floor(secondes / 60), s = Math.floor(secondes % 60);
  return `R${round} ${m}:${String(s).padStart(2, "0")}`;
}

module.exports = { recaler, heure };

});

/* ===== feuille.js ==================================================== */
__def("feuille.js", function (module, exports, require) {
/**
 * feuille.js — LA FEUILLE DE STATS DU COMBAT, RELUE DANS LE LOG.
 *
 * Format UFCStats, parce que c'est la grammaire que l'oeil du fan connait
 * deja : un total de significatives, puis la repartition par CIBLE
 * (tete / corps / jambe) et par POSITION (distance / clinch / sol), le tout
 * par round et en cumul.
 *
 * MEME PATRON QUE verdict.js : module natif JS, aucun fichier gele touche,
 * tenu par des invariants (verifier_feuille.js) plutot que par une
 * conformite Python.
 *
 * ===================================================================
 * /!\ CE QUE `frappes 66/107` N'EST PAS
 * ===================================================================
 * Le bilan du moteur ressemble a un "touchees sur tentees". Ce n'en est
 * pas un. Les quatre incrementations reelles :
 *   sig_attempted : chaque frappe DEBOUT (a l'entree de resolve_strike_debout)
 *                 + le ground and pound qui finit a 0 degat
 *   sig_landed    : frappe debout touchee
 *                 + le CONTRE (credite au defenseur)
 *                 + CHAQUE coup de ground and pound passe
 *                 + les significatives de CLINCH
 * Les TENTATIVES de GnP et de clinch ne sont comptees NULLE PART. Le ratio
 * du moteur est un outil de score, pas une feuille de stats. Encore une
 * etiquette qui raconte autre chose que le code — comme "echange".
 *
 * Cette feuille-ci est donc plus riche que le compteur : elle compte les
 * tentatives partout. Sa colonne "touchees" doit en revanche retomber
 * exactement sur sig_landed, et sa sous-somme "tentees du moteur" sur
 * sig_attempted. C'est l'invariant central du banc.
 *
 * ===================================================================
 * /!\ TROIS PIEGES DEJA PAYES — ne pas les redecouvrir
 * ===================================================================
 * 1. "check le" est une TENTATIVE qui ne loggue jamais de "manqué".
 *    resolve_strike_debout incremente sig_attempted en entree, puis sort
 *    sur la branche checke sans ecrire de ligne de frappe ratee.
 * 2. Le CONTRE n'est PAS une tentative supplementaire : le "→ manqué" de
 *    l'attaquant a deja ete ecrit juste avant. Le compter double.
 * 3. Le clinch parle un SECOND DIALECTE : fleche ASCII "->" au lieu de "→",
 *    vocabulaire propre (petit_corps, knee_corps_sortie, riposte...), et un
 *    marqueur [SIG]. Les frappes de clinch NON significatives sont de
 *    l'usure et ne comptent pas comme significatives.
 */

const { ARMES } = require("./tables.js");
const { FRAPPES_CLINCH, FRAPPES_RUPTURE } = require("./clinch.js");

// Zone d'une arme debout : elle est dans la table, on ne la devine pas.
function zoneArme(arme) {
  const info = ARMES[arme];
  if (!info) return null;
  return info.zone === "tete" ? "tete" : info.zone === "corps" ? "corps" : "jambe";
}

// Zone d'une frappe de clinch. /!\ DEUX tables : FRAPPES_CLINCH pour ce qui
// se donne DANS la prise, FRAPPES_RUPTURE pour ce qui se place EN SORTANT.
// N'en lire qu'une laissait une frappe sans cible, et le banc de coherence
// (tete+corps+jambe = total) tombait a 221 pour 222.
function zoneClinch(frappe) {
  const info = (FRAPPES_CLINCH && FRAPPES_CLINCH[frappe])
            || (FRAPPES_RUPTURE && FRAPPES_RUPTURE[frappe]);
  if (!info) return null;
  const c = info.cible !== undefined ? info.cible : info.zone;
  return c === "tete" ? "tete" : c === "corps" ? "corps" : "jambe";
}

const CIBLES = ["tete", "corps", "jambe"];
const POSITIONS = ["distance", "clinch", "sol"];

function bloc() {
  // `moteur` : la SOUS-PARTIE que le moteur compte lui-meme dans son bilan
  // `frappes X/Y`. Elle existe uniquement pour etre confrontee a
  // rs.sig_landed / rs.sig_attempted au banc. Elle n'est PAS affichee :
  // c'est un compteur de score, pas une feuille de stats (voir en-tete).
  const o = { sig: [0, 0], moteur: [0, 0], kd: 0, td: [0, 0], sub: 0, controle: 0 };
  for (const c of CIBLES) o[c] = [0, 0];
  for (const p of POSITIONS) o[p] = [0, 0];
  return o;
}

/**
 * @param {string[]} log  le log de engine.simuler_combat
 * @param {string} nomA   nom cote A (mono-jeton, celui du Fighter)
 * @param {string} nomB   nom cote B
 * @returns {{rounds: object[][], total: object[], noms: string[]}}
 *   rounds[i] = [statsA, statsB] pour le round i+1
 *   chaque bloc : sig/tete/corps/jambe/distance/clinch/sol en [touchees, tentees],
 *                 plus kd, td [reussis, tentes], sub, controle
 */
function feuille(log, nomA, nomB) {
  const L = log.join("\n").split("\n");
  const cote = (n) => (n === nomA ? 0 : n === nomB ? 1 : -1);

  const rounds = [];
  let rd = -1;
  let mode = "distance";   // position courante, deduite du contexte

  const compter = (r, c, pos, zone, touche) => {
    const s = rounds[r][c];
    s.sig[1] += 1; s[pos][1] += 1;
    if (zone) s[zone][1] += 1;
    if (touche) { s.sig[0] += 1; s[pos][0] += 1; if (zone) s[zone][0] += 1; }
  };

  for (const l of L) {
    if (/──────── ROUND \d+ ────────/.test(l)) {
      rounds.push([bloc(), bloc()]); rd += 1; mode = "distance"; continue;
    }
    if (rd < 0) continue;
    let m;

    // ---- position courante (le contexte, pas une frappe) ----
    if (/ferme la distance et engage le clinch|prend le contrôle du clinch/.test(l)) mode = "clinch";
    else if (/Ils se séparent|casse le clinch|se dégage vers le centre/.test(l)) {
      if (mode === "clinch") mode = "distance";
    }
    if (/RÉUSSI, combat au sol|le suit au sol en/.test(l)) mode = "sol";
    if (/retour debout|relance debout/.test(l)) mode = "distance";

    // ---- frappes DEBOUT (fleche unicode →) ----
    if ((m = l.match(/^\s+(\S+) (\S+) → (touché|manqué)/)) && zoneArme(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, mode === "sol" ? "distance" : mode, zoneArme(m[2]), m[3] === "touché");
      rounds[rd][c].moteur[1] += 1;
      if (m[3] === "touché") rounds[rd][c].moteur[0] += 1;
      continue;
    }
    // le check : TENTATIVE de l'attaquant, aucune ligne "manqué" ne suivra
    if ((m = l.match(/^\s+(\S+) check le (\S+) — (\S+) encaisse/))) {
      const c = cote(m[3]); if (c < 0) continue;
      compter(rd, c, "distance", zoneArme(m[2]), false);
      rounds[rd][c].moteur[1] += 1;   // le check EST une tentative du moteur
      continue;
    }
    // le contre : TOUCHEE pour le defenseur, et RIEN pour l'attaquant
    // (son "→ manqué" vient d'etre compte juste au-dessus)
    if ((m = l.match(/^\s+!!! (\S+) CONTRE le (\S+) de (\S+)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      const s = rounds[rd][c];
      s.sig[0] += 1; s.sig[1] += 1; s.tete[0] += 1; s.tete[1] += 1;
      s.distance[0] += 1; s.distance[1] += 1;
      s.moteur[0] += 1;               // le contre : touchee, sans tentative
      continue;
    }

    // ---- ground and pound : le log porte touches/tentes depuis la bascule ----
    if ((m = l.match(/^\s+(\S+) ground and pound → (\d+)\/(\d+) coups, (\d+) dégâts/))) {
      const c = cote(m[1]); if (c < 0) continue;
      const t = Number(m[2]), n = Number(m[3]);
      const s = rounds[rd][c];
      s.sig[0] += t; s.sig[1] += n; s.tete[0] += t; s.tete[1] += n;
      s.sol[0] += t; s.sol[1] += n;
      s.moteur[0] += t;
      if (Number(m[4]) === 0) s.moteur[1] += 1;   // rafale a 0 degat : UNE tentative
      continue;
    }

    // ---- frappes de CLINCH (fleche ASCII ->, marqueur [SIG]) ----
    // rupture offensive : toujours significative quand elle porte
    if ((m = l.match(/^\s+(\S+) rompt et place (\S+) -> \S+ \(\d+\) !/))) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), true);
      rounds[rd][c].moteur[0] += 1; continue;
    }
    if ((m = l.match(/^\s+(\S+) rompt et tente (\S+) ->/))) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), false); continue;
    }
    // frappe du controleur : touchee SEULEMENT si [SIG]
    if ((m = l.match(/^\s+(\S+) (\S+) -> (\S+) \((\d+)\)( \[SIG\])?$/)) && zoneClinch(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), Boolean(m[5]));
      if (m[5]) rounds[rd][c].moteur[0] += 1; continue;
    }
    // riposte de celui qui subit : logguee seulement si elle porte
    if ((m = l.match(/^\s+(\S+) riposte (\S+) -> (\d+)( \[SIG\])?$/)) && zoneClinch(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), Boolean(m[4]));
      if (m[4]) rounds[rd][c].moteur[0] += 1; continue;
    }

    // ---- le reste de la feuille ----
    if ((m = l.match(/>>> KNOCKDOWN ! (\S+) touche le sol/))
     || (m = l.match(/>>> (\S+) est sonne au sol/))) {
      const c = cote(m[1]); if (c >= 0) rounds[rd][1 - c].kd += 1;
      continue;
    }
    // Takedowns DEBOUT (fleche unicode) ...
    if ((m = l.match(/^\s+(\S+) \S+ → (RÉUSSI|CONTRÉ|stoppé)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1;
      if (m[2] === "RÉUSSI") rounds[rd][c].td[0] += 1;
      continue;
    }
    // ... le DOS DEBOUT, qui credite aussi un takedown mais ne ressemble a
    // aucune autre ligne : "X saute dans le dos et serre debout !". Ajoute
    // le 09/08 en meme temps que la mecanique — le banc 12 l'a attrape
    // immediatement (TD 0/1).
    if ((m = l.match(/^\s+(\S+) saute dans le dos et serre debout/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1; rounds[rd][c].td[0] += 1;
      continue;
    }
    // ... et takedowns depuis le CLINCH (fleche ASCII). Le moteur les
    // credite dans le meme rs.td_landed : les omettre faisait mentir la
    // colonne TD d'un round sur dix.
    if ((m = l.match(/^\s+(\S+) \S+ -> (RÉUSSI, combat au sol|stoppé)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1;
      if (m[2].startsWith("RÉUSSI")) rounds[rd][c].td[0] += 1;
      continue;
    }
    if ((m = l.match(/^\s+(\S+) (?:tente|attaque) \S+(?: depuis le dessous)? → (SOUMISSION|défendue)/))) {
      const c = cote(m[1]); if (c >= 0) rounds[rd][c].sub += 1;
      continue;
    }
  }

  // cumul
  const total = [bloc(), bloc()];
  for (const r of rounds) for (const c of [0, 1]) {
    const s = r[c], t = total[c];
    t.sig[0] += s.sig[0]; t.sig[1] += s.sig[1];
    t.moteur[0] += s.moteur[0]; t.moteur[1] += s.moteur[1];
    for (const k of CIBLES.concat(POSITIONS)) { t[k][0] += s[k][0]; t[k][1] += s[k][1]; }
    t.kd += s.kd; t.td[0] += s.td[0]; t.td[1] += s.td[1]; t.sub += s.sub;
  }

  return { rounds, total, noms: [nomA, nomB] };
}

/** "136 of 273" — la forme d'ufcstats, pour l'ecran. */
const surTotal = (p) => `${p[0]} of ${p[1]}`;
/** Pourcentage entier, "" si aucune tentative (pas de 0% trompeur). */
const pourcent = (p) => (p[1] ? Math.round((100 * p[0]) / p[1]) + "%" : "—");

module.exports = { feuille, surTotal, pourcent, CIBLES, POSITIONS };

});

/* ===== coin.js ======================================================= */
__def("coin.js", function (module, exports, require) {
/**
 * coin.js — LE COMBAT ROUND PAR ROUND, AVEC LE COIN ENTRE LES ROUNDS.
 *
 * POURQUOI CE MODULE
 * simuler_combat joue les trois rounds d'un bloc et rend le log fini. Tant
 * qu'on s'en sert, le combat est ROULE D'AVANCE : l'ecran ne peut en montrer
 * qu'une rediffusion, et il n'existe aucun instant ou le coach puisse
 * parler. Ce module rejoue la MEME boucle, mais en s'arretant a chaque
 * cloche.
 *
 * /!\ simuler_combat EST GELE (conformite au caractere pres contre
 * engine.py). On ne le modifie pas : on le REPRODUIT. D'ou l'invariant qui
 * tient tout le module —
 *
 *     UN COMBAT JOUE ROUND PAR ROUND SANS AUCUNE CONSIGNE DOIT PRODUIRE
 *     LE LOG DE simuler_combat, LIGNE POUR LIGNE, A LA MEME GRAINE.
 *
 * Si ca diverge, c'est que le coin a modifie le combat en douce, ou que la
 * reproduction de la boucle a derive. Le banc le verifie sur 300 combats.
 *
 * CE QUE CA CHANGE POUR LE JEU
 * Des lors que le joueur peut ajuster entre les rounds, le combat ne PEUT
 * plus etre roule d'avance : il se joue pendant qu'on le regarde. La graine
 * reste posee sur l'echeance, donc un combat sans consigne reste
 * reproductible a l'identique — mais l'ecran n'est plus une rediffusion.
 *
 * /!\ LE HASARD EST GLOBAL. Entre deux appels a round(), rien d'autre ne
 * doit tirer sur alea, sinon le combat n'est plus celui de la graine. Le
 * jeu doit donc jouer un round, montrer, attendre, et reprendre — sans
 * generer quoi que ce soit entre-temps.
 */

const E = require("./engine.js");
const { alea } = require("./alea.js");

/**
 * SAUVEGARDE / RESTAURATION DU HASARD.
 *
 * /!\ LE PIEGE QUI A COUTE UNE SONDE : traduire() consomme le rng GLOBAL.
 * Traduire entre deux rounds pour alimenter l'ecran decale donc le flux, et
 * les rounds suivants ne sont plus ceux de la graine. Mesure : le combat
 * passait de 256 a 234 etapes, sans qu'aucune ligne ne paraisse fausse.
 *
 * L'etat d'un Mersenne Twister tient entierement dans {mt, mti} plus le
 * cache de gauss(). On peut donc encadrer tout traitement d'ecran par
 * sauver/rendre et retrouver le flux exactement ou on l'avait laisse
 * (verifie au banc, gauss compris).
 */
function sauverHasard() {
  return { mt: Uint32Array.from(alea.mt), mti: alea.mti, g: alea.gaussSuivant };
}
function rendreHasard(e) {
  alea.mt.set(e.mt); alea.mti = e.mti; alea.gaussSuivant = e.g;
}

/**
 * Execute `travail` sans laisser de trace dans le flux de hasard du combat.
 * A utiliser pour TOUT ce qui alimente l'ecran entre deux rounds :
 * traducteur, mesures, previsualisations.
 */
function horsFlux(travail) {
  const e = sauverHasard();
  try { return travail(); } finally { rendreHasard(e); }
}

/** Les trois leviers que le moteur lit vraiment sur un combattant. */
const LEVIERS = {
  gameplan: ["striking", "wrestling", "clinch"],
  allure: [0.7, 1.3],          // bornes dures
  cible: ["tete", "corps", "jambes", null],
  // /!\ "sol" (10/08) : la consigne au sol. "soumission" reporte les
  // intentions du dessus vers la finition (voir poids_action_sol).
  // Inerte sans ordre — le combat sans consigne reste celui du temoin.
  sol: ["soumission", null],
};

class Combat {
  /**
   * @param {Fighter} f1 @param {Fighter} f2
   * @param {number} rounds
   */
  constructor(f1, f2, rounds = 3) {
    // Exactement ce que fait simuler_combat en entree, sans quoi le premier
    // round diverge deja.
    for (const f of [f1, f2]) {
      if (f.gameplan.allure === undefined) f.gameplan.allure = rounds <= 3 ? 1.0 : 0.85;
    }
    this.f1 = f1; this.f2 = f2; this.rounds = rounds;
    this.log = [];
    this.scores = { [f1.name]: 0, [f2.name]: 0 };
    this.round = 1;          // prochain round a jouer
    this.fini = false;
    this.vainqueur = null;
    this.bilans = [];        // un par round joue : {round, w, l, pts, critere}
    this.consignes = [];     // trace de ce que le coach a demande
  }

  /** Le combat attend-il une reprise ? (round joue, combat non termine) */
  get enPause() { return !this.fini && this.round > 1; }

  /**
   * Joue UN round. Rend ce qui vient de se passer ; le log complet reste
   * dans this.log.
   */
  /* /!\ CHANTIER G (14/08) : LE ROUND S'ARRETE AUX FRONTIERES DE 30 s.
     Le corps historique de jouerRound vit desormais ICI, en generateur —
     jouerRound() le draine d'un trait, donc UNE SEULE SOURCE et le
     comportement de tous les appelants est inchange (le banc le prouve).
     A chaque arret, l'ecran lit la phase, propose les cris, applique via
     cris.js, puis relance. */
  *jouerRoundTranches() {
    if (this.fini) throw new Error("coin.js : le combat est termine");
    if (this.round > this.rounds) throw new Error("coin.js : plus de round a jouer");
    const r = this.round;
    const depart = this.log.length;

    const g = E.simuler_round_tranches(this.f1, this.f2, r, this.log);
    let res = g.next();
    while (!res.done) {
      yield { t: res.value.t, etat: res.value.etat,
              lignes: this.log.slice(depart) };
      res = g.next();
    }
    const [vainqueur, seconde] = res.value;

    if (vainqueur) {
      this.log.push(`\n>>> ${vainqueur.name} gagne au round ${r} (échange ${seconde})`);
      this.fini = true; this.vainqueur = vainqueur; this.round = r;
      return { round: r, fini: true, vainqueur, seconde,
               lignes: this.log.slice(depart) };
    }

    const [w, l, pts, critere] = E.scorer_round(this.f1, this.f2);
    this.scores[w.name] += 10;
    this.scores[l.name] += pts;
    this.log.push(`\n  Bilan R${r} :`);
    for (const f of [this.f1, this.f2]) {
      this.log.push(`    ${f.name.padEnd(14)} dégâts ${E.fmt0(f.rs.damage).padStart(5)} | `
        + `frappes ${f.rs.sig_landed}/${f.rs.sig_attempted} | `
        + `TD ${f.rs.td_landed}/${f.rs.td_attempted} | `
        + `ctrl ${f.rs.control} | cardio ${E.fmt0(f.cardio)} | `
        + `jambes ${f.legs.gauche}/${f.legs.droite} | `
        + `corps ${E.fmt0(f.body.degats_corps)} | tête ${E.pyStr(f.head_damage)} | `
        + `KD ${f.rs.knockdowns}`);
    }
    this.log.push(`    → round pour ${w.name} (10-${pts}, ${critere})`);
    this.bilans.push({ round: r, w: w.name, l: l.name, pts, critere,
                       scores: Object.assign({}, this.scores) });

    // /!\ La recuperation fait partie du round qui s'acheve, PAS de la
    // reprise : simuler_combat l'applique avant de boucler. La consigne du
    // coach vient donc APRES, sur un combattant deja recupere.
    for (const f of [this.f1, this.f2]) f.recuperer_entre_rounds();

    this.round = r + 1;
    if (this.round > this.rounds) this._decision();
    return { round: r, fini: this.fini, vainqueur: this.vainqueur,
             bilan: this.bilans[this.bilans.length - 1],
             lignes: this.log.slice(depart) };
  }

  /** L'ANCIENNE PORTE, INCHANGEE : draine le generateur d'un trait. */
  jouerRound() {
    const g = this.jouerRoundTranches();
    let res = g.next();
    while (!res.done) res = g.next();
    return res.value;
  }

  _decision() {
    const { f1, f2, scores } = this;
    this.log.push(`\n──────── DÉCISION ────────`);
    this.log.push(`  ${f1.name} : ${scores[f1.name]}`);
    this.log.push(`  ${f2.name} : ${scores[f2.name]}`);
    let gagnant = null;
    if (scores[f1.name] > scores[f2.name]) gagnant = f1;
    else if (scores[f2.name] > scores[f1.name]) gagnant = f2;
    this.log.push(`  >>> ${!gagnant ? "Match nul" : gagnant.name + " l emporte aux points"}`);
    this.fini = true; this.vainqueur = gagnant;
  }

  /**
   * LE COIN. A n'appeler qu'entre deux rounds.
   * @param {"f1"|"f2"} qui
   * @param {{striking?:number, wrestling?:number, clinch?:number,
   *          allure?:number, cible?:string|null}} ordre
   * Les poids de gameplan sont RENORMALISES : le moteur les lit comme des
   * parts, pas comme des valeurs absolues.
   */
  /**
   * plan(qui, ordre) — LE PLAN D'AVANT-COMBAT (conception Mael, 10/08 :
   * "possibilité d'affiner le gameplan du round 1 déjà").
   * /!\ MEME GRAMMAIRE que consigne(), FENETRE INVERSE : le plan ne se
   * pose qu'AVANT la premiere seconde, la consigne qu'ENTRE les rounds.
   * Deux portes distinctes plutot qu'un assouplissement de consigne() :
   * la regle "le coin parle entre les rounds" reste vraie, et un banc
   * peut verifier chacune separement.
   */
  plan(qui, ordre) {
    if (this.fini) throw new Error("coin.js : le combat est termine");
    if (this.round !== 1 || this.log.length)
      throw new Error("coin.js : le plan se pose AVANT le premier round");
    return this._appliquer(qui, ordre, true);
  }

  consigne(qui, ordre) {
    if (this.fini) throw new Error("coin.js : le combat est termine");
    if (this.round === 1) throw new Error("coin.js : le coin parle ENTRE les rounds");
    return this._appliquer(qui, ordre, false);
  }

  _appliquer(qui, ordre, avant) {
    const f = qui === "f1" ? this.f1 : qui === "f2" ? this.f2 : null;
    if (!f) throw new Error(`coin.js : combattant inconnu "${qui}"`);

    const trace = { round: this.round, qui: f.name };

    const poids = LEVIERS.gameplan.filter(k => ordre[k] !== undefined);
    if (poids.length) {
      for (const k of LEVIERS.gameplan)
        if (ordre[k] !== undefined) {
          if (!(ordre[k] >= 0)) throw new Error(`coin.js : poids ${k} invalide`);
          f.gameplan[k] = ordre[k];
        }
      const somme = LEVIERS.gameplan.reduce((s, k) => s + (f.gameplan[k] || 0), 0);
      if (somme <= 0) throw new Error("coin.js : un gameplan entierement a zero");
      for (const k of LEVIERS.gameplan) f.gameplan[k] = (f.gameplan[k] || 0) / somme;
      trace.gameplan = LEVIERS.gameplan.map(k => +f.gameplan[k].toFixed(3));
    }

    if (ordre.allure !== undefined) {
      const [min, max] = LEVIERS.allure;
      if (!(ordre.allure >= min && ordre.allure <= max))
        throw new Error(`coin.js : allure hors bornes (${min}–${max})`);
      f.gameplan.allure = ordre.allure;
      trace.allure = ordre.allure;
    }

    if (ordre.cible !== undefined) {
      if (!LEVIERS.cible.includes(ordre.cible))
        throw new Error(`coin.js : cible inconnue "${ordre.cible}"`);
      f.gameplan.cible = ordre.cible;
      trace.cible = ordre.cible;
    }

    if (ordre.sol !== undefined) {
      if (!LEVIERS.sol.includes(ordre.sol))
        throw new Error(`coin.js : consigne au sol inconnue "${ordre.sol}"`);
      f.gameplan.sol = ordre.sol;
      trace.sol = ordre.sol;
    }

    if (avant) trace.plan = true;      // le plan se distingue de la consigne
    this.consignes.push(trace);
    return trace;
  }

  /** Joue tout ce qui reste, sans consigne. Sert au banc de conformite. */
  jusquauBout() {
    while (!this.fini) this.jouerRound();
    return [this.vainqueur, this.log];
  }
}

module.exports = { Combat, LEVIERS, horsFlux, sauverHasard, rendreHasard };

});

/* ===== classement.js ================================================= */
__def("classement.js", function (module, exports, require) {
/**
 * classement.js — LES RANGS, ET QUI ON T'OFFRE.
 *
 * Module natif JS, tenu par invariants. Aucun fichier gele touche.
 *
 * ===================================================================
 * /!\ LE CLASSEMENT NE DEPEND PAS QUE DE LA FORMULE
 * ===================================================================
 * C'est ce que la simulation a montre avant d'ecrire une ligne ici : avec
 * le seul bareme de points, battre UN classe suffisait a etre classe —
 * donc "une victoire" pour entrer au top 15, a l'UFC comme a Hexagone. Et
 * une serie victoire/defaite stagnait a #9 au lieu de ne jamais classer.
 * LA DENSITE D'UNE ORGANISATION VIT DANS LE MATCHMAKING, pas dans les
 * points : un non-classe affronte d'autres non-classes tant qu'il n'a pas
 * fait ses preuves, et il en faut d'autant plus que l'organisation est
 * dense. Les points ne font que ranger ceux qui ont deja la porte ouverte.
 */

/** Valeur attribuee a un non-classe pour les calculs d'ecart. */
const NON_CLASSE = 22;

/**
 * Les cinq organisations. bourse = [entree, champion, plafond star] en
 * milliers d'euros, PAR COTE : une bourse "1+1" = 1 000 € garantis plus
 * 1 000 € de prime de victoire.
 * /!\ L'UFC paie MOINS que la PFL a l'entree (12 contre 15) et 13 fois plus
 * au sommet. Ce n'est pas une erreur : c'est le vrai dilemme du metier.
 */
const ORGS = {
  HEX: { nom: "Hexagone FC",  pays: "France",   niveau: "nationale",      densite: 1.00, serie: 3,
         bourse: [1, 7, 15],      portee: 40 },
  TRI: { nom: "Trident FC",   pays: "France",   niveau: "nationale +",    densite: 0.80, serie: 4,
         bourse: [2, 12, 50],     portee: 55 },
  SOK: { nom: "Sokół Fight",  pays: "Pologne",  niveau: "européenne",     densite: 0.65, serie: 5,
         bourse: [4, 20, 80],     portee: 70 },
  GFL: { nom: "Global Fight League", pays: "USA", niveau: "internationale", densite: 0.50, serie: 5,
         bourse: [15, 50, 150],   portee: 80 },
  AFC: { nom: "Apex Fighting Championship", pays: "USA", niveau: "internationale", densite: 0.40, serie: 5,
         bourse: [12, 175, 2000], portee: 100 },
};

/* /!\ NOMS DERIVES, PAS LES VRAIS — ET L'IDENTIFIANT EST SEPARE DU LIBELLE.
   Les vraies marques (UFC, PFL, KSW, Ares, Hexagone MMA) sont deposees.
   Tant que ca reste sur un telephone personne ne dit rien ; le jour d'une
   publication, meme gratuite, on s'expose — l'UFC est connue pour etre
   agressive sur sa propriete intellectuelle.
   On garde donc la PLACE DANS LA HIERARCHIE (la petite francaise, la
   nationale ambitieuse, l'europeenne, la ligue americaine, le sommet) et on
   change le nom. Le joueur reconnait le role sans qu'aucune marque soit
   reprise.
   /!\ LE CODE N'UTILISE QUE LA CLE (HEX, TRI, SOK, GFL, AFC). Changer un
   libelle, c'est UNE ligne ici et rien d'autre.
   /!\ JE NE PEUX PAS CERTIFIER QUE CES NOMS SONT LIBRES. "Titan FC" par
   exemple existe reellement aux Etats-Unis, c'est pourquoi il a ete ecarte.
   AVANT PUBLICATION : verifier a l'INPI et a l'EUIPO, c'est gratuit et en
   ligne. Je propose, je ne certifie pas. */

/**
 * /!\ LA NOTORIETE PLAFONNE A LA PORTEE DE L'ORGANISATION.
 * Une ligue europeenne te fait connaitre en Europe ; les Etats-Unis te
 * montrent au monde ; l'UFC encore plus, surtout en main card. On garde UNE
 * seule jauge plutot que trois regionales (France / Europe / Monde) : le
 * plafond porte deja l'intention — la portee de l'organisation decide de
 * jusqu'ou tu peux monter — sans obliger chaque bourse, chaque offre et
 * chaque scandale a savoir OU il compte. A decouper plus tard si ca manque.
 * Consequence de jeu : un champion Hexagone monte vite jusqu'a 40 et
 * BLOQUE. Il lui faut changer d'organisation pour exister ailleurs. C'est
 * ce plafond qui pousse vers le haut, pas l'argent.
 */
// /!\ pre_prelims (Mael, 09/08) : les cartes numerotees ouvrent en
// pre-prelims — on y existe a peine, mais on y existe.
const PLACE = { pre_prelims: 0.3, prelims: 0.5, main_card: 1.0, co_main: 1.4, main_event: 2.0 };

/**
 * Notoriete gagnee apres un combat.
 * @param {string} cle organisation
 * @param {string} place "prelims" | "main_card" | "co_main" | "main_event"
 * @param {number} noto notoriete actuelle
 * @param {boolean} gagne
 * @param {number} maniere 1 serre · 2 net · 3 finish
 * @param {number} [notoAdv] notoriete de l'ADVERSAIRE (defaut 0 : l'ancien
 *   comportement, banc 14 intact). /!\ LA NOTORIETE SE TRANSFERE (Mael,
 *   09/08) : battre quelqu'un de connu rapporte gros — tout le monde
 *   regarde le combat — et MEME PERDRE contre une star fait monter, on t'a
 *   vu. Le facteur (1 + notoAdv/100) double le gain contre une star a 100.
 * @returns {number} la NOUVELLE notoriete, plafonnee
 */
function gagnerNotoriete(cle, place, noto, gagne, maniere, notoAdv = 0) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const mult = PLACE[place];
  if (mult === undefined) throw new Error(`classement.js : place inconnue "${place}"`);
  // /!\ CALIBRE PAR MESURE. Premiere version a 3,2 : il fallait 22 combats
  // pour saturer Hexagone, soit huit ans a 3 combats par an — un plafond
  // qu'on n'atteint jamais ne pousse personne vers le haut. A 5,5, un
  // champion regional sature en une douzaine de combats et se retrouve
  // bloque, ce qui est le but.
  const base = (gagne ? 5.5 : 1.6)
             * (MANIERE[maniere] !== undefined ? MANIERE[maniere] : 1)
             * (1 + Math.max(0, notoAdv) / 100);
  // On progresse d'autant moins qu'on approche du plafond : les derniers
  // points sont les plus durs, et on ne le depasse jamais.
  const marge = Math.max(0, o.portee - noto) / Math.max(1, o.portee);
  const gain = base * mult * (0.25 + 0.75 * marge);
  return Math.min(o.portee, Math.round((noto + gain) * 10) / 10);
}

/** 1 = combat serre · 2 = decision nette · 3 = finish sec. */
const MANIERE = [0, 0.75, 1.0, 1.35];

/**
 * Deplacement au classement apres un combat.
 * @param {number|null} rangV rang du vainqueur (null = non classe)
 * @param {number|null} rangP rang du perdant
 * @param {number} densite   celle de l'organisation
 * @param {number} maniere   1, 2 ou 3
 * @returns {[number|null, number|null]} nouveaux rangs [vainqueur, perdant]
 */
function bouger(rangV, rangP, densite, maniere) {
  const rV = rangV === null ? NON_CLASSE : rangV;
  const rP = rangP === null ? NON_CLASSE : rangP;
  const ecart = rV - rP;                 // > 0 : le vainqueur partait de plus loin
  const m = MANIERE[maniere] !== undefined ? MANIERE[maniere] : 1.0;

  // /!\ BATTRE UN CLASSE DOIT TOUJOURS CLASSER. Premiere version : un
  // non-classe qui battait le #10 restait non-classe, l'amortissement le
  // renvoyant au-dela de 15. Absurde — c'est la performance qui ouvre la
  // porte. L'atterrissage est donc borne a 5 places sous le battu.
  const pas = ecart <= 0
    ? -Math.max(1, Math.round(m * densite))
    : Math.min(5, Math.max(0, Math.round((ecart * 0.30) / densite / m)));
  let nvV = ecart <= 0 ? rV + pas : rP + pas;
  nvV = Math.max(1, Math.min(NON_CLASSE, nvV));
  if (rangP === null && nvV > 15) nvV = null;   // battre un non-classe ne classe pas
  else if (nvV > 15) nvV = 15;

  // Le perdant descend d'autant plus que son bourreau etait mal classe, et
  // d'autant plus que la defaite a ete nette. Un combat serre est pardonne.
  const chute = ecart <= 0 ? Math.max(1, Math.round(m))
                           : Math.round((1 + ecart * 0.45) * m);
  let nvP = Math.min(NON_CLASSE, rP + chute);
  if (nvP > 15) nvP = null;
  return [nvV, nvP];
}

/**
 * A-t-on droit a un adversaire CLASSE ?
 *
 * /!\ LA NOTORIETE OUVRE DES PORTES QUE LE BILAN SEUL N'OUVRE PAS. Une
 * superstar a toujours un chemin plus court : les organisations veulent
 * vendre des billets, pas recompenser le merite. Un inconnu fait ses
 * preuves ; un nom connu passe devant. C'est injuste, et c'est le metier.
 * La notoriete retire jusqu'a 3 victoires sur la serie exigee, sans jamais
 * descendre sous 1 : meme une star doit gagner UNE fois.
 */
function serieRequise(cle, notoriete) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const remise = Math.min(3, Math.floor(Math.max(0, notoriete || 0) / 25));
  return Math.max(1, o.serie - remise);
}
function droitAuClasse(cle, rang, serie, notoriete) {
  return rang !== null || serie >= serieRequise(cle, notoriete);
}

/**
 * Bourse d'un combattant dans son organisation, en euros [garanti, prime].
 * Entre l'entree et le rang de champion, on interpole sur le classement ;
 * au-dela, la notoriete pousse vers le plafond star.
 */
/* =========================================================================
   L'ECHELLE — L'ARBITRAGE DE MAEL (10/08).
   "Un classement de TOUT le roster de la categorie, mais cache : on ne
    montre que le top 15. Regle simple : tu gagnes, tu affrontes un mieux
    classe que toi ; tu perds, tu regardes derriere."
   Chaque division de chaque organisation porte une ECHELLE COMPLETE
   (tous les ids, du meilleur au dernier). Le rang affiche n'est que la
   FENETRE des 15 premiers. Le mouvement est celui d'une echelle de
   salle : le vainqueur PREND LA PLACE du perdant s'il etait derriere
   (tous ceux entre eux reculent d'un cran) ; s'il etait deja devant, le
   perdant recule d'un cran. Consequence directe : UN #1 A 7-8 EST
   IMPOSSIBLE — chaque defaite te fait doubler, la tete de l'echelle
   appartient a ceux qui gagnent.
   ========================================================================= */

/** L'echelle d'une division — construite au premier besoin, reparee a
 *  chaque lecture (arrivees en bas, partis retires, champion en tete). */
function echelleDe(m, org, div) {
  m.echelles = m.echelles || {};
  const parOrg = (m.echelles[org] = m.echelles[org] || {});
  const roster = (m.rosters[org] && m.rosters[org][div]) || [];
  if (!parOrg[div]) {
    const ids = roster.slice();
    ids.sort((x, y) => {
      const a = m.pros.get(x), b = m.pros.get(y);
      if (!a || !b) return 0;
      if (a.champion !== b.champion) return a.champion ? -1 : 1;
      // /!\ L'AMORCAGE SE FAIT A LA TRACE, PAS AU RANG DE GENESE (trouve
      // en tracant Mathis Lefort : la genese livrait un 1-4 AU RANG 4,
      // et l'echelle heritait de la graine pourrie — c'etait la source
      // du "des #4 a 0-6 dans le top 15" signale par Mael des le debut).
      // Le rang de genese ne vaut rien ; le dossier, si.
      const ta = a.bilan.v - a.bilan.d + (a.bilan.serie || 0),
            tb = b.bilan.v - b.bilan.d + (b.bilan.serie || 0);
      if (ta !== tb) return tb - ta;
      if (a.bilan.v !== b.bilan.v) return b.bilan.v - a.bilan.v;
      return (b.notoriete || 0) - (a.notoriete || 0);
    });
    parOrg[div] = ids;
  }
  // Reparation : le roster est la verite des presences.
  const dedans = new Set(roster);
  let e = parOrg[div].filter(id => dedans.has(id));
  const deja = new Set(e);
  for (const id of roster) if (!deja.has(id)) e.push(id);   // arrivants en bas
  // Le champion vit en tete — toujours.
  const iC = e.findIndex(id => { const l = m.pros.get(id); return l && l.champion; });
  if (iC > 0) { const [c] = e.splice(iC, 1); e.unshift(c); }
  parOrg[div] = e;
  // /!\ L'ECHELLE EST MAITRESSE DES SA NAISSANCE : les rangs de genese
  // s'ecrasent ici — sinon la fenetre et l'echelle racontent deux
  // histoires jusqu'au premier combat de la division.
  e.forEach((id, i) => { const l = m.pros.get(id); if (l) l.rang = i < 15 ? i + 1 : null; });
  return e;
}

/** Ecrit les rangs depuis l'echelle : la fenetre des 15. */
function synchroniserRangs(m, org, div) {
  const e = echelleDe(m, org, div);
  e.forEach((id, i) => { const l = m.pros.get(id); if (l) l.rang = i < 15 ? i + 1 : null; });
}

/**
 * LE MOUVEMENT. Vainqueur derriere -> il prend la place du perdant ;
 * vainqueur devant -> le perdant recule d'un cran (deux si fini).
 */
function bougerEchelle(m, org, div, vainqueurId, perdantId, fini) {
  const e = echelleDe(m, org, div);
  const iV = e.indexOf(vainqueurId), iP = e.indexOf(perdantId);
  if (iV < 0 || iP < 0) { synchroniserRangs(m, org, div); return; }
  if (iV > iP) {
    e.splice(iV, 1);
    e.splice(iP, 0, vainqueurId);
  } else {
    const recul = fini ? 2 : 1;
    const j = e.indexOf(perdantId);
    const cible = Math.min(e.length - 1, j + recul);
    e.splice(j, 1);
    e.splice(cible, 0, perdantId);
  }
  // Le champion ne se double pas a l'echelle : sa place se prend en
  // combat de titre (le couronnement le remet en tete via echelleDe).
  synchroniserRangs(m, org, div);
}

/* ==== LES MATCHMAKERS (conception de Mael, 10/08) =======================
   Un homme par organisation : c'est LUI qui propose les combats, lui
   qu'on appelle, lui dont on gagne ou perd la confiance.
   /!\ IL VIT ICI, avec les organisations — et pas dans contrats.js :
   offres.js a besoin de son nom pour signer ses propositions, et
   contrats.js requiert deja offres.js. Le mettre la-bas creait un CYCLE
   DE DEPENDANCES, que le bundler a refuse net. */
const MATCHMAKERS = {
  AFC: { nom: "Dana Cardoso",    trait: "exigeant",
         mot: "Je ne signe pas des espoirs, je signe des problèmes pour mes champions." },
  GFL: { nom: "Roy Halloran",    trait: "vendeur",
         mot: "Tout le monde peut se battre. Peu de gens font vendre." },
  SOK: { nom: "Piotr Zawadzki",  trait: "fidèle",
         mot: "Chez nous on construit lentement. On ne jette personne." },
  TRI: { nom: "Bruno Vasseur",   trait: "joueur",
         mot: "J'aime les affiches qui font parler. Le classement suivra." },
  HEX: { nom: "Éric Lemarchand", trait: "régional",
         mot: "Amène-moi des gars sérieux, je leur donne des dates." },
};
function matchmakerDe(org) {
  if (MATCHMAKERS[org]) return MATCHMAKERS[org];
  const o = ORGS[org];
  return { nom: o && o.pays ? `le matchmaker de ${o.pays}` : "le matchmaker",
           trait: "régional", mot: "On regarde les dossiers un par un." };
}

function bourse(cle, rang, champion, notoriete) {
  const o = ORGS[cle];
  if (!o) throw new Error(`classement.js : organisation inconnue "${cle}"`);
  const [entree, champ, star] = o.bourse;
  let k;
  if (champion) {
    // Champion : entre le tarif de base et le plafond, selon la notoriete.
    k = champ + (star - champ) * Math.min(1, Math.max(0, (notoriete - 40) / 60));
  } else if (rang === null) {
    k = entree;
  } else {
    // Non-champion classe : du tarif d'entree vers celui de champion.
    /* /!\ BORNE (22/08, NaN vu par Mael) : un rang au-dela de #15 donnait
       t negatif, et pow(negatif, 1.4) = NaN. Au-dela de #15, c'est le
       tarif d'entree. Et la notoriete absente vaut 0. */
    const t = Math.max(0, (16 - rang) / 15);          // #15 -> 0,07 · #1 -> 1
    k = entree + (champ - entree) * Math.pow(t, 1.4);
    k *= 1 + Math.min(0.35, Math.max(0, ((notoriete || 0) - 50) / 100) * 0.7);
  }
  const g = Math.round(k * 1000);
  return [g, g];
}

/** "#7" ou "non classé". */
const libelleRang = (r) => (r === null ? "non classé" : "#" + r);

module.exports = {
  MATCHMAKERS, matchmakerDe,
  echelleDe, bougerEchelle, synchroniserRangs, ORGS, NON_CLASSE, MANIERE, PLACE, bouger, serieRequise,
                   droitAuClasse, bourse, gagnerNotoriete, libelleRang };

});

/* ===== grappling.js ================================================== */
__def("grappling.js", function (module, exports, require) {
/**
 * grappling.js — LES QUATRE ETAGES DU JEU AU SOL.
 *
 * Module natif JS. /!\ IL NE TOUCHE A AUCUN FICHIER GELE. Il LIT le
 * combattant et en deduit des informations neuves ; ground_v2 et engine
 * restent inchanges pour l'instant. C'est volontaire : on pose la matiere,
 * on la mesure, et on ne rouvre le moteur qu'ensuite.
 *
 * ===================================================================
 * /!\ POURQUOI QUATRE ETAGES, ET PAS UNE "NOTE DE GRAPPLING"
 * ===================================================================
 * Le moteur ecrase aujourd'hui des dimensions qui n'ont rien a voir. Quatre
 * profils reels, donnes par Mael, le prouvent — chacun casse un etage
 * different :
 *
 *   1. AMENER AU SOL      shot · throws · clinch_wrestling · grip_fighting
 *      SHAVKAT : zero entree en jambes, mais body lock et projections. Il
 *      amene au sol autant qu'un autre, par une VOIE differente. Un homme a
 *      shot 40 / throws 95 n'est pas un mauvais lutteur.
 *
 *   2. ATTEINDRE LA POSITION   passing · back_top · mount_top · side_top
 *      BRENDAN ALLEN : tres fort pour ALLER CHERCHER LE DOS. Ce n'est pas
 *      la meme chose que savoir etrangler une fois qu'on y est.
 *
 *   3. GARDER             controle · retention
 *      KHABIB : etouffant, personne ne se releve.
 *
 *   4. FINIR              les quatre familles de soumission ci-dessous
 *      USMAN : etage 1, 2 et 3 d'elite, UNE soumission en carriere.
 *      PIMBLETT : l'inverse — incapable d'amener au sol, mortel une fois
 *      que ca y est, y compris DEPUIS LE DESSOUS.
 *
 * Les quatre etages sont donc INDEPENDANTS. Les correler ("bon grappler =
 * bon partout") rendrait ces quatre hommes impossibles a fabriquer.
 */

const { alea } = require("./alea.js");

/**
 * Les quatre familles de soumission, batties sur les 26 soumissions que le
 * moteur connait deja (SOUMISSIONS_TOP / SOUMISSIONS_BOTTOM).
 * `positions` : la ou la famille se finit. C'est ce qui permet a un homme
 * de chercher la position qui sert SON arme, au lieu de la position la plus
 * haute.
 */
const FAMILLES = {
  dos: {
    nom: "étranglements arrière",
    prises: ["rear_naked_choke", "bow_and_arrow", "neck_crank"],
    positions: ["back_control", "crucifix"],
  },
  bras: {
    nom: "clés de bras",
    prises: ["armbar", "kimura", "americana", "omoplata", "mounted_triangle",
             "triangle", "ezekiel"],
    positions: ["mount", "side_control", "knee_on_belly", "closed_guard"],
  },
  tete_bras: {
    nom: "étranglements tête et bras",
    prises: ["darce", "brabo", "anaconda", "arm_triangle", "north_south_choke",
             "peruvian_necktie", "guillotine", "guillotine_debout", "baseball_choke"],
    positions: ["north_south", "turtle", "half_guard", "side_control"],
  },
  jambes: {
    nom: "attaques de jambes",
    prises: ["heel_hook", "toe_hold"],
    positions: ["open_guard", "butterfly_guard"],
  },
};
const CLES = Object.keys(FAMILLES);

/* En dessous de ce niveau, une famille n'est pas une arme : on ne construit
   pas son jeu autour. Un lutteur a 55 partout ne chasse aucune soumission,
   il cherche a controler et a taper — c'est Usman, une soumission en
   carriere. */
const SEUIL_ARME = 72;

/**
 * Les trois FORMES qu'un jeu de soumission peut prendre. Elles disent
 * comment le talent se repartit entre les quatre familles, pas son niveau.
 *
 * /!\ IL N'Y A PAS DE PLANCHER "AU MOINS MOYEN PARTOUT". C'etait mon idee,
 * Usman la casse : lutteur d'elite, une soumission en carriere. Un lutteur
 * peut etre bas dans les QUATRE familles et rester un grappler dominant —
 * c'est meme la norme au niveau international.
 */
const FORMES = {
  // /!\ L'ECART DU LUTTEUR EST PROFOND, ET C'EST VOULU. A [-22,-8], un
  // lutteur d'elite (base 85) ressortait a 77 en cle de bras — au-dessus du
  // seuil, donc arme. Usman aurait chasse la cle de bras. Il en a UNE en
  // carriere. A [-30,-14] il retombe dans les 55-71 : il controle et il
  // tape, il ne soumet pas.
  lutteur:     { poids: 0.45, ecart: [-30, -14], pointe: 0 },
  specialiste: { poids: 0.40, ecart: [-14, +2],  pointe: 1 },
  complet:     { poids: 0.15, ecart: [-4, +4],   pointe: 0 },
};

/**
 * Attribue les huit valeurs de famille a un combattant, a partir de ce
 * qu'il a deja. On NE REMPLACE PAS submission_off_top / _bottom : on brode
 * autour. Les anciennes stats restent la reference et le moteur gele
 * continue de les lire — rien ne casse.
 *
 * @param {object} fighter
 * @param {string} [forme] "lutteur" | "specialiste" | "complet"
 * @returns {object} le detail attribue (aussi pose sur fighter.grappling)
 */
function attribuer(fighter, forme, pointeImposee) {
  if (!forme) {
    const r = alea.random();
    let cumul = 0;
    for (const [k, f] of Object.entries(FORMES)) {
      cumul += f.poids;
      if (r < cumul) { forme = k; break; }
    }
    forme = forme || "specialiste";
  }
  const F = FORMES[forme];
  if (!F) throw new Error(`grappling.js : forme inconnue "${forme}"`);

  const base = { dessus: fighter.ground.submission_off_top,
                 dessous: fighter.ground.submission_off_bottom };
  const out = { forme, dessus: {}, dessous: {} };

  // Une eventuelle POINTE : la famille ou il est vraiment dangereux.
  const pointe = pointeImposee
    || (F.pointe ? CLES[Math.trunc(alea.random() * CLES.length)] : null);

  for (const cote of ["dessus", "dessous"]) {
    for (const k of CLES) {
      const [lo, hi] = F.ecart;
      let v = base[cote] + lo + alea.random() * (hi - lo);
      if (k === pointe) v = base[cote] + 8 + alea.random() * 12;
      out[cote][k] = Math.max(20, Math.min(99, Math.round(v)));
    }
  }
  out.pointe = pointe;
  fighter.grappling = out;
  return out;
}

/**
 * Ce qu'une position rapporte a CET homme : ce qu'il sait y finir.
 * /!\ C'est le coeur de la demande de Mael : "un gars bon en rear naked va
 * chercher le dos, un gars bon en armbar la side ou le mount, le bon en
 * darce le north-south, le bon en GnP la side ou le mount en priorite mais
 * peut deja taper dans toutes les autres positions."
 * Un homme a 95 en etranglement arriere prefere un dos a 30 % de reussite a
 * un mount a 55 % : la position ne vaut pas ce qu'elle vaut EN GENERAL,
 * elle vaut ce que LUI peut en faire.
 */
function valeurPosition(fighter, position, cote = "dessus") {
  const g = fighter.grappling;
  if (!g) return 0;
  // /!\ ON NE CHASSE PAS UNE SOUMISSION QU'ON NE SAIT PAS FINIR. Sans ce
  // seuil, un lutteur dont les quatre familles tournent a 55 partait
  // chercher des cles de jambes parce que 59 depassait 57 — du bruit promu
  // en intention. En dessous de SEUIL_ARME, la position ne vaut que ce
  // qu'on peut y taper.
  let meilleure = 0;
  for (const k of CLES)
    if (FAMILLES[k].positions.includes(position) && g[cote][k] >= SEUIL_ARME)
      meilleure = Math.max(meilleure, g[cote][k]);

  // /!\ LE FRAPPEUR AU SOL N'A PAS BESOIN DE LA POSITION PARFAITE : il tape
  // en demi-garde, il tape en garde, moins bien mais il tape. Le soumetteur,
  // lui, ne vaut rien tant qu'il n'a pas SA position. C'est une difference
  // de nature entre les deux styles, pas un reglage.
  const frappe = fighter.ground.ground_striking || 0;
  const bonusFrappe = ["mount", "side_control", "north_south", "knee_on_belly"]
    .includes(position) ? frappe : frappe * 0.55;

  // /!\ UNE SOUMISSION VAUT PLUS QU'UN COUP : elle FINIT le combat, le coup
  // ne fait qu'abimer. Sans ce coefficient, un homme a 99 de ground striking
  // preferait toujours le mount, meme avec un etranglement arriere a 95 —
  // et plus personne n'allait chercher le dos.
  return Math.max(meilleure * 1.25, bonusFrappe);
}

/** Le classement des positions pour cet homme, la meilleure d'abord. */
function preferences(fighter, positions, cote = "dessus") {
  return positions.slice()
    .map(p => [p, valeurPosition(fighter, p, cote)])
    .sort((a, b) => b[1] - a[1]);
}

/**
 * PAR OU IL AMENE AU SOL. Les voies sont distinctes : un homme peut n'avoir
 * aucune entree en jambes et amener au sol par le corps a corps.
 */
function voiesAuSol(fighter) {
  const w = fighter.wrestling;
  return [
    ["jambes", w.shot],
    ["projection", w.throws],
    ["corps_a_corps", (w.clinch_wrestling + w.grip_fighting) / 2],
  ].sort((a, b) => b[1] - a[1]);
}

/**
 * CE QU'IL VA FAIRE DEPUIS LE DESSUS — les poids du tirage d'action.
 *
 * /!\ AUJOURD'HUI CE TIRAGE EST FIXE : alea.choices(["progress","gnp",
 * "sub_top"], [0.24, 0.50, 0.26]). Ni les stats ni le profil n'y entrent.
 * Consequences mesurees le 09/08 :
 *   - 0,37 progression par round, alors qu'il en faut TROIS pour aller de
 *     la garde au dos. Un specialiste du dos n'atteint jamais son arme.
 *   - Usman perd un quart de ses actions a chercher des soumissions qu'il
 *     ne sait pas finir (ses quatre familles sont sous le seuil d'arme).
 *
 * /!\ ET IL MANQUE UNE QUATRIEME INTENTION : TENIR.
 * MERAB DALISHVILI plaque, ne passe pas la garde, ne cherche ni la
 * soumission ni le KO. Il controle et se releve avec l'autre. Les trois
 * options du moteur sont TOUTES offensives ; "ne rien tenter, garder la
 * position, laisser le temps passer" est une decision reelle de combat, et
 * c'est ce qui gagne des rounds sans rien produire.
 * Difference avec Usman : Usman veut le mount POUR TAPER. Merab ne veut pas
 * de position, il veut DU TEMPS.
 *
 * @returns {{progress:number, gnp:number, sub:number, tenir:number}} somme 1
 */
function intentions(fighter, position, cote = "dessus") {
  const g = fighter.grappling;
  const gr = fighter.ground;
  if (!g) return { progress: 0.24, gnp: 0.50, sub: 0.26, tenir: 0 };

  // SOUMETTRE : seulement si une arme est finissable D'ICI. On ne tente pas
  // un etranglement arriere depuis la demi-garde.
  let arme = 0;
  for (const k of CLES)
    if (FAMILLES[k].positions.includes(position) && g[cote][k] >= SEUIL_ARME)
      arme = Math.max(arme, g[cote][k]);
  let sub = arme ? 0.10 + (arme - SEUIL_ARME) / 27 * 0.55 : 0.03;

  // PROGRESSER : d'autant plus qu'une MEILLEURE position l'attend. C'est
  // ici que le specialiste du dos se met en marche.
  const ici = valeurPosition(fighter, position, cote);
  let mieux = 0;
  for (const k of CLES)
    for (const p of FAMILLES[k].positions)
      if (p !== position) mieux = Math.max(mieux, valeurPosition(fighter, p, cote));
  const gain = Math.max(0, mieux - ici);
  const passage = (gr.passing + (gr.posture_sol || 50)) / 2;
  const progress = 0.08 + Math.min(0.50, gain / 30 * 0.34 + (passage - 50) / 100 * 0.22);

  // /!\ ON NE SE CONTENTE PAS D'UNE ARME MOYENNE QUAND LA BONNE POSITION
  // EST A PORTEE. Premiere version : Aslanov, specialiste du dos, restait en
  // demi-garde a tenter des etranglements tete-bras a 42 % parce qu'il y
  // avait une arme "suffisante" sur place. Un specialiste PASSE, il ne se
  // contente pas. Plus la position d'a cote vaut mieux, moins il tente ici.
  sub *= 1 - Math.min(0.65, gain / 35);

  // TAPER : ce qu'il vaut au sol, module par l'acces de la position.
  const frappe = gr.ground_striking || 40;
  const ouvert = ["mount", "side_control", "north_south", "knee_on_belly",
                  "back_control", "crucifix"].includes(position) ? 1.0 : 0.55;
  const gnp = 0.06 + (frappe / 100) * 0.50 * ouvert;

  // TENIR : le residu de celui qui ne veut RIEN tenter. Il est d'autant plus
  // grand que le controle est bon et que rien d'autre ne le tente.
  const controle = (gr.top_control !== undefined ? gr.top_control : passage);
  const tenir = 0.05 + Math.max(0, (controle - 60) / 100) * 0.45;

  const somme = progress + gnp + sub + tenir;
  return { progress: progress / somme, gnp: gnp / somme,
           sub: sub / somme, tenir: tenir / somme };
}

module.exports = { FAMILLES, FORMES, CLES, SEUIL_ARME, intentions, attribuer, valeurPosition,
                   preferences, voiesAuSol };

});

/* ===== etoiles.js ==================================================== */
__def("etoiles.js", function (module, exports, require) {
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

});

/* ===== carriere.js =================================================== */
__def("carriere.js", function (module, exports, require) {
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

/** La marge qui reste — ce que le scout cherche a estimer. */
function marge(f) {
  const c = f.carriere;
  if (!c) return 0;
  let reste = 0;
  for (const d of DOMAINES) reste += Math.max(0, c.potentiel[d] - c.niveaux[d]);
  return Math.round(reste / DOMAINES.length);
}

module.exports = { DOMAINES, RYTHME_HEBDO, facteurAge, tirerPotentiel, tirerParcours,
                   tirerAxes, poser, caler, marge };

});

/* ===== vivier.js ===================================================== */
__def("vivier.js", function (module, exports, require) {
/**
 * vivier.js — LE MONDE : QUI EXISTE, OU, ET A QUEL NIVEAU.
 *
 * Module natif JS, tenu par invariants (banc 18). AUCUN fichier gele ni
 * porte n'est modifie : generator.js et carriere.js sont utilises tels
 * quels, dans un flux RNG prive.
 *
 * ===================================================================
 * /!\ LES TROIS DECISIONS DE CHARPENTE (Mael, 09/08)
 * ===================================================================
 * 1. LES VOLUMES : AFC 50 par division, toutes les autres orgs 30, et
 *    VINGT FOIS PLUS d'amateurs que de pros. Mesure : 4 500 pros en
 *    fiches moteur completes = 9 Mo et ~1 s — trop pour un telephone en
 *    permanence, et 90 000 amateurs en fiches completes = 59 Mo — mort.
 *    D'ou les deux etages de fiche ci-dessous.
 * 2. FICHE LEGERE + HYDRATATION DETERMINISTE : le monde ne stocke que
 *    l'identite, l'histoire et le bilan. La fiche moteur complete se
 *    REFABRIQUE a la demande, sur un flux RNG prive seme par
 *    (graine du monde, id de l'homme) : le meme homme donne toujours la
 *    meme fiche, a n'importe quelle date, sur n'importe quelle machine.
 *    /!\ SANS CA, LA SAUVEGARDE ET LE REPLAY DIVERGENT.
 * 3. TOUT CE QUE LE JOUEUR TOUCHE DEVIENT PERSISTANT : un amateur du
 *    monde est une fonction du temps parce que personne ne s'occupe de
 *    lui. Des qu'il est recrute, il est hydrate UNE fois puis vit en
 *    fiche complete, mise a jour par la salle — il ne redevient jamais
 *    une fonction. (La bascule elle-meme vivra dans le module de salle.)
 *
 * ===================================================================
 * /!\ LA HIERARCHIE EST EMERGENTE, PAS DECRETEE
 * ===================================================================
 * On ne genere pas "des hommes forts pour l'AFC" : on genere une
 * population par pays (chacun avec son histoire via carriere.js), puis
 * LES ORGANISATIONS RECRUTENT LES MEILLEURS, dans l'ordre de leur rang —
 * l'AFC se sert en premier dans le monde entier, la continentale dans
 * son continent, les nationales chez elles. Le niveau moyen decroit du
 * sommet vers les nationales parce que la selection le produit, pas
 * parce qu'une table le dit.
 *
 * /!\ LA TENDANCE NATIONALE PONDERE, ELLE N'INTERDIT JAMAIS (Mael) :
 * du lutteur en France existe, juste plus rare. AUCUNE CASE A ZERO.
 */

const { Alea, alea } = require("./alea.js");
const G = require("./generator.js");
const CA = require("./carriere.js");
const CL = require("./classement.js");
const E = require("./engine.js");

/* ================================================================== */
/* LES DOUZE PAYS (liste validee par Mael, 09/08).                    */
/* tradition : poids dans la population amateur mondiale.              */
/* archetypes : PONDERATIONS, jamais zero.                            */
/* ================================================================== */
const PAYS = [
  { cle: "USA", nom: "États-Unis", tradition: 0.19, candidats: 130,
    archetypes: { lutteur_controle: 30, boxeur_pressure: 20, polyvalent: 18,
                  brawler: 14, grappler_soumission: 10, kickboxeur_distance: 8 },
    prenoms: ["Tyler","Brandon","Cody","Marcus","Devin","Austin","Chase","Jared","Malik","Logan",
              "Trevor","Wyatt","Deshawn","Caleb","Hunter","Blake","Darius","Colt","Emmett","Ray",
      "Jaxon", "Tyrell", "Deandre", "Bryce", "Cooper", "Gage", "Maddox", "Trent", "Zane", "Colton", "Dashawn", "Elijah", "Grant", "Holden", "Isaiah", "Jerome", "Kendall", "Lamar", "Micah", "Nolan", "Owen", "Preston", "Quentin", "Reggie", "Silas", "Tanner", "Ulysses", "Vernon", "Weston", "Xavier"],
    noms: ["Whitfield","Barrow","Callahan","Mercer","Boyd","Hutchins","Draper","Stanton","Vance","Redd",
           "Marsh","Gaines","Talbot","Rourke","Pruitt","Landry","Beckett","Hollis","Sexton","Crowe",
      "Callahan", "Whitfield", "Draper", "Ellison", "Foster", "Galloway", "Hargrove", "Ingram", "Jefferson", "Kirkland", "Lockhart", "Mercer", "Nolans", "Ostrander", "Pruitt", "Quimby", "Radcliffe", "Sherwood", "Tillman", "Underwood", "Vance", "Wexler", "Yancey", "Ackerman", "Bledsoe", "Cantrell", "Denson", "Eastman", "Fairbanks", "Gentry", "Holloway", "Irwin", "Jessup", "Kessler", "Lattimore", "McCray"] },
  { cle: "BRA", nom: "Brésil", tradition: 0.15, candidats: 100,
    archetypes: { grappler_soumission: 32, brawler: 16, polyvalent: 16,
                  boxeur_pressure: 14, kickboxeur_distance: 12, lutteur_controle: 10 },
    prenoms: ["Caio","Murilo","Otávio","Vinícius","Douglas","Éverton","Jonas","Alan","Breno","Ítalo",
              "Wallace","Renan","Maicon","Davi","Luan","Estevão","Nícolas","Wesley","Aldair","Rui",
      "Thiago", "Caio", "Vinícius", "Otávio", "Renan", "Iago", "Wallace", "Emerson", "Cauã", "Davi", "Enzo", "Fábio", "Gilberto", "Heitor", "Ítalo", "Jonas", "Kléber", "Leandro", "Maurício", "Nélson", "Orlando", "Peterson", "Quincas", "Rogério", "Sandro", "Tales", "Ubiratan", "Valdir", "Wesley", "Yuri"],
    noms: ["Sarmento","Peixoto","Camargo","Furtado","Bittencourt","Salgado","Meireles","Dutra","Vilela","Quaresma",
           "Barreto","Mascarenhas","Serra","Prado","Antunes","Pontes","Rezende","Aragão","Lacerda","Vasques",
      "Cavalcanti", "Drummond", "Evangelista", "Figueiredo", "Guimarães", "Holanda", "Itaparica", "Junqueira", "Kubinski", "Lacerda", "Meirelles", "Nogueira", "Ottoni", "Pacheco", "Quaresma", "Rezende", "Sarmento", "Trindade", "Uchoa", "Vasconcelos", "Wanderley", "Xisto", "Ypiranga", "Zagatto", "Amorim", "Bittencourt", "Camargo", "Dutra", "Espinosa", "Furtado", "Godoy", "Hilário", "Iglésias", "Juliano", "Klein", "Louzada"] },
  { cle: "FRA", nom: "France", tradition: 0.12, candidats: 95,
    archetypes: { kickboxeur_distance: 26, boxeur_pressure: 22, polyvalent: 20,
                  grappler_soumission: 12, brawler: 12, lutteur_controle: 8 },
    prenoms: ["Julien","Théo","Mathis","Karim","Yanis","Bastien","Romain","Loïc","Antoine","Damien",
              "Sofiane","Kevin","Florian","Hugo","Mehdi","Quentin","Alexis","Jordan","Nabil","Corentin",
      "Bastien", "Corentin", "Dorian", "Erwan", "Florian", "Gaëtan", "Hadrien", "Ilan", "Jordan", "Killian", "Loïc", "Mathis", "Nolan", "Océrian", "Pierrick", "Quentin", "Rayan", "Steven", "Théo", "Ugo", "Valentin", "Wassim", "Xavier", "Yanis", "Zacharie", "Adama", "Bilal", "Clément", "Driss", "Elias"],
    noms: ["Lefort","Marchal","Perrin","Bouvier","Delacroix","Garnier","Toussaint","Chapelle","Renard","Berthier",
           "Belkacem","Aubry","Vasseur","Lambert","Meunier","Girard","Fontaine","Bensaïd","Rocher","Clément",
      "Aubertin", "Beaulieu", "Charbonnier", "Delacroix", "Escoffier", "Fauvel", "Grimaud", "Hébert", "Imbert", "Jacquemin", "Kervella", "Lachapelle", "Marchetti", "Navarro", "Ozanne", "Perrault", "Quiniou", "Rambert", "Sauvage", "Tanguy", "Urbain", "Vasseur", "Wagner", "Ybert", "Zeller", "Arnoux", "Baillard", "Cazenave", "Dartois", "Estève", "Fombonne", "Guéranger", "Hautier", "Izard", "Jourdain", "Kaddour"] },
  { cle: "RUS", nom: "Russie", tradition: 0.12, candidats: 85,
    archetypes: { lutteur_controle: 34, grappler_soumission: 18, polyvalent: 16,
                  boxeur_pressure: 12, brawler: 12, kickboxeur_distance: 8 },
    prenoms: ["Artem","Nikita","Ruslan","Timur","Aslan","Denis","Kirill","Zaur","Georgi","Anzor",
              "Vadim","Rustam","Ilya","Marat","Stepan","Kazbek","Oleg","Damir","Semyon","Batyr",
      "Arsen", "Bogdan", "Damir", "Eldar", "Fyodor", "Gennadi", "Ibragim", "Kamil", "Lev", "Magomed", "Nariman", "Oleg", "Pyotr", "Rashid", "Shamil", "Timur", "Umar", "Vadim", "Yaroslav", "Zaur", "Artyom", "Boris", "Denis", "Eduard", "Georgi", "Ilya", "Kirill", "Leonid", "Maxim", "Nikita"],
    noms: ["Vetrov","Sokolov","Merkulov","Tagirov","Sharipov","Gromov","Ozerov","Kuznetsov","Dudarov","Zhilin",
           "Rezanov","Lomakin","Karpov","Isaev","Mutaev","Fedin","Cherkasov","Alibekov","Nazarov","Uvarov",
      "Abdulaev", "Baisangurov", "Chagaev", "Dudaev", "Emelyanov", "Fedotov", "Gadzhiev", "Ibragimov", "Kadulov", "Lebedev", "Makhatov", "Nurmagaev", "Ovechnikov", "Primakov", "Rasulov", "Saitov", "Tsarukov", "Umarov", "Vakhitov", "Yandiev", "Zhamaldaev", "Alkhasov", "Batyrov", "Chimatov", "Dagaev", "Evlonov", "Gamzatov", "Israilov", "Khabilov", "Lomakin", "Musaev", "Nazarov", "Osmaev", "Pirogov", "Ramazanov", "Suleymanov"] },
  { cle: "UK", nom: "Royaume-Uni", tradition: 0.08, candidats: 60,
    archetypes: { boxeur_pressure: 28, brawler: 20, polyvalent: 18,
                  kickboxeur_distance: 14, grappler_soumission: 12, lutteur_controle: 8 },
    prenoms: ["Callum","Lewis","Owen","Harvey","Reece","Kieran","Declan","Ellis","Jayden","Cameron",
              "Rhys","Finlay","Aaron","Bradley","Dominic","Freddie","Tyrell","Sean","Ashton","Curtis",
      "Alfie", "Bradley", "Callum", "Declan", "Ellis", "Finley", "Gareth", "Harvey", "Idris", "Jenson", "Kieran", "Lewis", "Mason", "Nathaniel", "Ollie", "Paddy", "Reece", "Shane", "Tommy", "Warren", "Aaron", "Billy", "Ciaran", "Dylan", "Ewan", "Freddie", "Glen", "Harrison", "Ian", "Jude"],
    noms: ["Whitmore","Ashworth","Gallagher","Pemberton","Hargreaves","Boyle","Tanner","Radcliffe","Osei","Duffy",
           "Winter","Stroud","Kearsley","Hobbs","Farrow","Mccrae","Bexley","Nash","Quigley","Sowerby",
      "Ashworth", "Barrington", "Chadwick", "Doherty", "Ellsworth", "Fairclough", "Garrity", "Hemsworth", "Illingworth", "Jardine", "Kavanagh", "Lonsdale", "Middleton", "Naismith", "Ormsby", "Pemberton", "Quigley", "Ramsbottom", "Sinclair", "Thackeray", "Upton", "Vickers", "Wainwright", "Yardley", "Ainsworth", "Beckwith", "Cartwright", "Dunmore", "Eccleston", "Farnsworth", "Grimshaw", "Hathaway", "Ingleby", "Jephson", "Kingsley", "Lythgoe"] },
  { cle: "POL", nom: "Pologne", tradition: 0.07, candidats: 55,
    archetypes: { lutteur_controle: 22, boxeur_pressure: 20, brawler: 18,
                  polyvalent: 16, kickboxeur_distance: 14, grappler_soumission: 10 },
    prenoms: ["Kacper","Szymon","Bartek","Dawid","Marek","Tomasz","Piotr","Krystian","Adrian","Michał",
              "Damian","Rafał","Łukasz","Sebastian","Paweł","Igor","Norbert","Wojtek","Filip","Emil",
      "Andrzej", "Bartosz", "Czesław", "Damian", "Emil", "Filip", "Grzegorz", "Henryk", "Igor", "Jacek", "Kacper", "Łukasz", "Marcin", "Norbert", "Oskar", "Patryk", "Radosław", "Sebastian", "Tadeusz", "Wiktor", "Adrian", "Bogusław", "Cezary", "Dawid", "Ernest", "Franciszek", "Gustaw", "Hubert", "Ireneusz", "Janusz"],
    noms: ["Zawadzki","Sokolowski","Wrona","Majewski","Kaczmarek","Pilarski","Gorski","Lis","Nowicki","Szulc",
           "Domagała","Cieślak","Bednarz","Urban","Mazur","Krupa","Ostrowski","Wilczek","Sadowski","Pawlak",
      "Adamczyk", "Baranowski", "Cieślak", "Dąbrowski", "Fijałkowski", "Górecki", "Herman", "Iwaniuk", "Jabłoński", "Kaczmarek", "Lewandowicz", "Majewski", "Nowicki", "Olszewski", "Pawlak", "Rutkowski", "Sikorski", "Tomaszewski", "Urbański", "Wieczorek", "Zalewski", "Andrzejewski", "Białas", "Chmielewski", "Domagała", "Frączek", "Głowacki", "Jastrzębski", "Kubiak", "Lisowski", "Michalak", "Niedźwiedź", "Ostrowski", "Piotrowski", "Sobczak", "Wysocki"] },
  { cle: "JPN", nom: "Japon", tradition: 0.06, candidats: 50,
    archetypes: { grappler_soumission: 26, kickboxeur_distance: 22, polyvalent: 18,
                  boxeur_pressure: 14, brawler: 10, lutteur_controle: 10 },
    prenoms: ["Ren","Kaito","Sho","Daiki","Yuto","Haruki","Riku","Sota","Kazuki","Taiga",
              "Hayato","Kenta","Ryo","Itsuki","Tsubasa","Minato","Asahi","Kohei","Shun","Naoki",
      "Daiki", "Haruto", "Itsuki", "Kaito", "Minato", "Ren", "Sota", "Yamato", "Asahi", "Hinata", "Kazuki", "Riku", "Shota", "Takumi", "Yuma", "Aoi", "Hayato", "Koki", "Ryusei", "Taiga", "Yusei", "Daichi", "Hiroto", "Kenta", "Ryota", "Shuji", "Tatsuya", "Yudai", "Genki", "Naoki"],
    noms: ["Fujimura","Sakaguchi","Hirano","Kuroda","Ishikawa","Yasuda","Onishi","Takara","Nishioka","Shibata",
           "Hoshino","Kanemoto","Uehara","Morikawa","Segawa","Tsuruta","Chiba","Okabe","Iwata","Nogami",
      "Akiyama", "Fujimoto", "Hasegawa", "Ishikawa", "Kobayashi", "Matsumoto", "Nakagawa", "Okamoto", "Sakamoto", "Takahashi", "Uehara", "Watanabe", "Yamashita", "Endo", "Fukuda", "Hirano", "Inoue", "Kondo", "Maeda", "Nishimura", "Ogawa", "Shimizu", "Taniguchi", "Ueda", "Yoshida", "Arai", "Fujii", "Hoshino", "Imai", "Kudo", "Miyazaki", "Noguchi", "Otsuka", "Sasaki", "Tsuchiya", "Yokoyama"] },
  { cle: "MEX", nom: "Mexique", tradition: 0.06, candidats: 50,
    archetypes: { boxeur_pressure: 34, brawler: 20, polyvalent: 14,
                  kickboxeur_distance: 12, grappler_soumission: 12, lutteur_controle: 8 },
    prenoms: ["Ángel","Iván","Osvaldo","Uriel","Jesús","Ramiro","Édgar","Gerardo","Emiliano","Diego",
              "Ulises","Rodrigo","Braulio","Marco","Adán","Isaac","Néstor","Joel","Cristian","Saúl",
      "Alejandro", "Braulio", "César", "Diego", "Emiliano", "Fernando", "Gerardo", "Hugo", "Iván", "Joaquín", "Kevin", "Lorenzo", "Mauricio", "Nicolás", "Octavio", "Pablo", "Ramiro", "Santiago", "Tomás", "Ulises", "Vicente", "Xavier", "Yahir", "Adrián", "Bruno", "Cristóbal", "Damián", "Esteban", "Federico", "Gonzalo"],
    noms: ["Zúñiga","Carbajal","Orozco","Salcedo","Rentería","Palacios","Godínez","Anguiano","Ceballos","Uribe",
           "Montoya","Solís","Barraza","Quintana","Escamilla","Padilla","Valdivia","Rosales","Camacho","Lugo",
      "Alvarado", "Barajas", "Cervantes", "Domínguez", "Escobedo", "Fuentes", "Galindo", "Huerta", "Ibarra", "Juárez", "Lozano", "Mendoza", "Nájera", "Ochoa", "Palacios", "Quintero", "Rosales", "Salazar", "Terrazas", "Urías", "Valenzuela", "Zaragoza", "Aguirre", "Bustamante", "Cisneros", "Delgado", "Espinoza", "Figueroa", "Guerrero", "Hinojosa", "Jaramillo", "Lugo", "Montoya", "Navarrete", "Orozco", "Padilla"] },
  { cle: "CAN", nom: "Canada", tradition: 0.05, candidats: 45,
    archetypes: { polyvalent: 24, lutteur_controle: 20, boxeur_pressure: 18,
                  kickboxeur_distance: 14, grappler_soumission: 14, brawler: 10 },
    prenoms: ["Liam","Noah","Ethan","Carter","Mason","Tristan","Xavier","Émile","Olivier","Zachary",
              "Brayden","Nolan","Marc-André","Félix","Dawson","Cole","Hudson","Keegan","Mathieu","Jaxon",
      "Aiden", "Brody", "Carter", "Dawson", "Ethan", "Fraser", "Gavin", "Hudson", "Isaac", "Jasper", "Kellan", "Landon", "Malcolm", "Nathan", "Orion", "Parker", "Quinton", "Ryder", "Spencer", "Tristan", "Wyatt", "Angus", "Beckett", "Cormac", "Declan", "Emmett", "Finnegan", "Grayson", "Hamish", "Ivor"],
    noms: ["Tremblais","Gagnon","Bouchard","Thistle","Mackay","Doiron","Carruthers","Lachance","Pelletier","Byrne",
           "Standish","Corbett","Hebert","Malone","Fortin","Dube","Kowal","Ashby","Lavoie","Merritt",
      "Abernathy", "Boudreau", "Cormillet", "Desjardins", "Ellingham", "Fontaine", "Gagnon", "Harrington", "Isserlis", "Jorgensen", "Kavanaugh", "Lachance", "MacIntyre", "Naismith", "Ouellet", "Pelletier", "Quesnel", "Robicheau", "Sutherland", "Tremblais", "Underhill", "Villeneuve", "Whitlock", "Yorke", "Arsenault", "Bouchard", "Chartrand", "Duquette", "Falkner", "Girard", "Hensley", "Kirkpatrick", "Lavoie", "McAllister", "Ostrowski", "Poirieux"] },
  { cle: "AUS", nom: "Australie", tradition: 0.04, candidats: 42,
    archetypes: { boxeur_pressure: 24, brawler: 22, polyvalent: 18,
                  kickboxeur_distance: 14, lutteur_controle: 12, grappler_soumission: 10 },
    prenoms: ["Jack","Lachlan","Cooper","Flynn","Ryder","Bailey","Harrison","Toby","Mitchell","Angus",
              "Jai","Darcy","Beau","Heath","Brodie","Callan","Fletcher","Ned","Tate","Rory",
      "Angus", "Banjo", "Cooper", "Darcy", "Eli", "Flynn", "Gus", "Heath", "Ivan", "Jarrah", "Koby", "Lachlan", "Mitchell", "Ned", "Oscar", "Patrick", "Quade", "Riley", "Sonny", "Toby", "Wade", "Archie", "Baxter", "Clancy", "Dustin", "Errol", "Fletcher", "Griffin", "Harley", "Jett"],
    noms: ["Sheedy","Braddock","Colley","Mackenzie","Thorne","Riddell","Gallard","Hoskins","Pratt","Duffield",
           "Kearns","Somerville","Blackwood","Tindall","Oakes","Rennie","Struthers","Cavanagh","Pemble","Winch",
      "Ainsworth", "Blackwood", "Cartwright", "Donaldson", "Everingham", "Fitzgibbon", "Gallagher", "Hetherington", "Inglis", "Jamieson", "Kirkwood", "Lindsay", "McAllister", "Nesbitt", "Oakford", "Prendergast", "Quirk", "Ravenscroft", "Sheedy", "Thornbury", "Vandenberg", "Wetherall", "Yates", "Ashcroft", "Bancroft", "Cummins", "Driscoll", "Eastwood", "Farnham", "Girdlestone", "Hollingsworth", "Kennerly", "Loughlin", "Merriweather", "Northcott", "Pemberton"] },
  { cle: "SWE", nom: "Suède", tradition: 0.03, candidats: 40,
    archetypes: { lutteur_controle: 24, grappler_soumission: 20, polyvalent: 18,
                  boxeur_pressure: 14, kickboxeur_distance: 14, brawler: 10 },
    prenoms: ["Elias","Oskar","Viktor","Hampus","Melker","Nils","Arvid","Filip","Ludvig","Anton",
              "Casper","Emil","Joel","Simon","Alfred","Vilgot","Sixten","Malte","Hugo","Axel",
      "Albin", "Björn", "Casper", "Dante", "Elias", "Filip", "Gustav", "Hampus", "Isak", "Joel", "Kalle", "Ludvig", "Melker", "Nils", "Oskar", "Pontus", "Rasmus", "Sixten", "Teodor", "Valter", "Wilhelm", "Axel", "Birger", "Casimir", "Ebbe", "Folke", "Göran", "Hjalmar", "Ingvar", "Jesper"],
    noms: ["Lindqvist","Bergström","Åkesson","Holmgren","Sandell","Norrby","Eklund","Dahlberg","Fransson","Hellström",
           "Sjögren","Wallmark","Nyström","Cederholm","Lundin","Rosell","Tornberg","Almgren","Byström","Petersson",
      "Ahlström", "Bergqvist", "Cederberg", "Dahlgren", "Ekström", "Forsberg", "Gunnarsson", "Hellström", "Isaksson", "Johanström", "Kjellberg", "Lindqvist", "Månsson", "Norström", "Öberg", "Palmgren", "Qvist", "Rosenberg", "Sandström", "Thorvaldsson", "Ulvander", "Vikström", "Wallin", "Åkesson", "Blomqvist", "Carlström", "Dufva", "Engström", "Fagerström", "Grönberg", "Hedlund", "Isberg", "Järvinen", "Krantz", "Lundgren", "Malmström"] },
  { cle: "NLD", nom: "Pays-Bas", tradition: 0.03, candidats: 40,
    archetypes: { kickboxeur_distance: 40, boxeur_pressure: 16, polyvalent: 14,
                  brawler: 14, lutteur_controle: 8, grappler_soumission: 8 },
    prenoms: ["Daan","Sven","Thijs","Bram","Jesse","Ruben","Niels","Koen","Wouter","Lars",
              "Timo","Joris","Milan","Stijn","Floris","Jelle","Bas","Gijs","Teun","Pim",
      "Bram", "Daan", "Finn", "Gijs", "Hidde", "Jelle", "Koen", "Lars", "Milan", "Niels", "Olivier", "Pim", "Ruben", "Sem", "Thijs", "Vince", "Wouter", "Bas", "Cas", "Dirk", "Erik", "Floris", "Gerben", "Hugo", "Ivo", "Joost", "Kees", "Luuk", "Maarten", "Niek"],
    noms: ["Van der Meer","Bakker","De Wit","Vermeulen","Hoekstra","Van Dijk","Smeets","Kuipers","Blom","Roos",
           "Van Leeuwen","Dekker","Mulder","Schouten","Verhagen","Ten Brink","Willemse","Peeters","Zandstra","Koning",
      "Aalbers", "Blankenberg", "Cuypers", "Dijkstra", "Eversdijk", "Fokkema", "Groeneveld", "Hoekstra", "IJsselstein", "Janssen", "Kuipers", "Lammers", "Meulendijk", "Nijhuis", "Oosterhuis", "Poortvliet", "Quist", "Ravensbergen", "Schouten", "Terpstra", "Uitdenbogaard", "Verhoeder", "Westerveld", "Zijlstra", "Appelmans", "Bosman", "Coenen", "Dekkers", "Elzinga", "Feenstra", "Goedhart", "Hendriks", "Immink", "Jonkman", "Krol", "Leeuwenburg"] },
];
const PAYS_PAR_CLE = {}; PAYS.forEach((p, i) => { p.idx = i; PAYS_PAR_CLE[p.cle] = p; });

/* ================================================================== */
/* LES ONZE ORGANISATIONS NATIONALES (une par pays, la France a deja  */
/* HEX). Noms DERIVES — meme garde-fou juridique que les cinq          */
/* premieres : je propose, je ne certifie pas. AVANT PUBLICATION :     */
/* INPI et EUIPO.                                                      */
/* La portee suit le marche : une nationale americaine porte plus loin */
/* qu'une suedoise. La bourse est celle d'HEX mise a l'echelle.        */
/* ================================================================== */
const NATIONALES = {
  USA_N: { nom: "Frontier FC",     pays: "USA", portee: 45 },
  BRA_N: { nom: "Bandeira FC",     pays: "BRA", portee: 42 },
  RUS_N: { nom: "Taïga FC",        pays: "RUS", portee: 40 },
  UK_N:  { nom: "Albion FC",       pays: "UK",  portee: 36 },
  JPN_N: { nom: "Kachidoki FC",    pays: "JPN", portee: 35 },
  POL_N: { nom: "Husaria FC",      pays: "POL", portee: 34 },
  MEX_N: { nom: "Jaguar Combate",  pays: "MEX", portee: 33 },
  CAN_N: { nom: "Boréal FC",       pays: "CAN", portee: 32 },
  AUS_N: { nom: "Outback FC",      pays: "AUS", portee: 32 },
  SWE_N: { nom: "Norrland FC",     pays: "SWE", portee: 30 },
  NLD_N: { nom: "Lowlands FL",     pays: "NLD", portee: 30 },
};

/** Injecte les nationales dans la table des orgs de classement.js —
 *  UNE SEULE source de verite pour bourse(), serieRequise(), etc. */
function enregistrerOrgs() {
  for (const [cle, n] of Object.entries(NATIONALES)) {
    if (CL.ORGS[cle]) continue;
    const k = n.portee / 40;                       // HEX = reference
    CL.ORGS[cle] = { nom: n.nom, pays: PAYS_PAR_CLE[n.pays].nom, niveau: "nationale",
      densite: 1.00, serie: 3,
      bourse: [Math.max(1, Math.round(1 * k)), Math.round(7 * k), Math.round(15 * k)],
      portee: n.portee };
  }
}

/* L'ordre de recrutement : le sommet se sert en premier.
   SOK (europeenne) pioche dans son continent, les nationales chez elles. */
const TAILLES = { AFC: 50, GFL: 30, SOK: 30, TRI: 30, HEX: 30 };
const EUROPE = new Set(["FRA", "UK", "POL", "SWE", "NLD", "RUS"]);

/* ================================================================== */
/* LE FLUX PRIVE — la fondation de l'hydratation.                      */
/* On sauve l'etat du flux partage, on seme, on fabrique, on restaure. */
/* /!\ AUCUN TIRAGE DU MONDE NE TOUCHE LE FLUX DES COMBATS. C'est le   */
/* meme esprit que l'invariant de fiches.js (la construction ne        */
/* consomme pas de RNG) : ici elle en consomme, mais LE SIEN.          */
/* ================================================================== */
function avecFlux(graine, fn) {
  const mt = alea.mt.slice(), mti = alea.mti, g = alea.gaussSuivant;
  alea.seed(graine >>> 0);
  const r = fn();
  alea.mt.set(mt); alea.mti = mti; alea.gaussSuivant = g;
  return r;
}

/** Melange (graine du monde, id) -> graine 32 bits. Melange fort : deux
 *  ids voisins doivent donner des flux sans rapport. */
function melanger(gm, id) {
  let h = (gm ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ id, 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/* Espace d'ids : (division, pays, k) — stable, lisible, refabricable. */
const PAR_CELL = 4096;
const AM_BASE = 1 << 22;                            // les amateurs au-dessus
const idPro = (d, c, k) => (d * 12 + c) * PAR_CELL + k;
const idAmateur = (d, c, k) => AM_BASE + (d * 12 + c) * 8192 + k;

function tirerArchetype(poids) {
  let total = 0; for (const v of Object.values(poids)) total += v;
  let t = alea.random() * total;
  for (const [a, v] of Object.entries(poids)) { t -= v; if (t <= 0) return a; }
  return Object.keys(poids)[0];
}

/* ================================================================== */
/* FABRIQUER UN HOMME — creation et hydratation sont LA MEME fonction. */
/* Tout tirage a lieu dans le flux prive de son id : le refabriquer,   */
/* c'est le retrouver.                                                 */
/* /!\ LE MONDE VIEILLIT GRATUITEMENT (decouverte du 09/08) : la       */
/* boucle de deduction de carriere.js ne consomme AUCUN RNG. Tous les  */
/* tirages (archetype, nom, age de naissance, potentiel, parcours,     */
/* axes) tombent AVANT elle, a l'identique quel que soit anneesEnPlus. */
/* Hydrater a +N annees donne donc, deterministe, le niveau            */
/* D'AUJOURD'HUI — progression des jeunes et declin des vieux compris. */
/* Un an d'inactivite bouge REELLEMENT la fiche : c'est la matiere du  */
/* scouting date.                                                      */
/* ================================================================== */
function fabriquerHomme(gm, id, paysCle, division, jeune, anneesEnPlus = 0) {
  return avecFlux(melanger(gm, id), () => {
    const p = PAYS_PAR_CLE[paysCle];
    const archetype = tirerArchetype(p.archetypes);
    const nom = alea.choice(p.prenoms) + " " + alea.choice(p.noms);
    // /!\ niveau 60 CONSTANT : il ne sert qu'a poser le RELIEF des stats
    // (les ecarts internes d'un domaine). Le NIVEAU reel est deduit par
    // carriere.poser, qui remet chaque domaine a l'echelle de l'histoire.
    const [f] = G.generer_combattant({ niveau: 60, archetype, division, nom });
    const ageNaissance = jeune
      ? 16 + Math.trunc(Math.pow(alea.random(), 1.4) * 14)   // amateurs : 16-29, jeunes d'abord
      : 21 + Math.trunc(Math.pow(alea.random(), 1.5) * 17); // pros : 21-37
    const c = CA.poser(f, { age: ageNaissance + anneesEnPlus });
    f._niv = null;
    const note = Math.round(f.note_generale() * 10) / 10;

    // Le bilan se DEDUIT de l'histoire, comme le niveau : des annees de
    // pratique sortent des combats, et la qualite fait les victoires.
    const anneesPro = jeune ? 0 : Math.max(0, c.annees - 3);
    const nb = jeune
      ? Math.min(10, Math.trunc(c.annees * 1.2 * alea.random()))
      : Math.min(45, Math.trunc(anneesPro * 2.4 * (0.7 + alea.random() * 0.6)));
    const q = Math.max(0, Math.min(1, (note - 40) / 55));
    const pV = 0.32 + 0.55 * q;
    let v = 0, serie = 0;
    for (let i = 0; i < nb; i++) {
      if (alea.random() < pV) { v++; serie++; } else serie = 0;
    }
    const leger = { id, nom, pays: paysCle, division, archetype, note,
                    age: c.age, ageDebut: c.ageDebut, j: jeune ? 1 : 0,
                    bilan: { v, d: nb - v, serie } };
    return { fiche: f, carriere: c, leger };
  });
}

/* ================================================================== */
/* LE MONDE.                                                           */
/* ================================================================== */
/* /!\ LE PAYS D'UNE ETOILE EST UN NOM ("Brésil"), PAS UN CODE. Premiere
   version : slice(0,3) — d'ou "BRÉ", "TCH", "NIG" dans le monde, trois
   codes qui ne correspondaient a rien et sans drapeau possible. */
const CODE_PAYS = {
  "France": "FRA", "Brésil": "BRA", "Bresil": "BRA", "Tchétchénie": "RUS",
  "Tchetchenie": "RUS", "Nigeria": "NGA", "Espagne": "ESP", "Australie": "AUS",
  "USA": "USA", "États-Unis": "USA", "Etats-Unis": "USA", "Mexique": "MEX",
  "Russie": "RUS", "Pays-Bas": "NLD", "Suède": "SWE", "Pologne": "POL",
  "Japon": "JPN", "Canada": "CAN", "Royaume-Uni": "GBR", "Angleterre": "GBR",
};
const codePays = (x) => CODE_PAYS[x] || String(x || "").slice(0, 3).toUpperCase();

/** Installe les huit tetes d'affiche a la tete de leur division. */
function poserEtoiles(pros, rosters, graine) {
  let ET; try{ ET = require("./etoiles.js"); }catch(e){ return; }
  /* /!\ HORS FLUX (banc 9 : "une saison de vie laisse le flux partage
     intact"). etoiles.fabriquer() RESEME le generateur commun : brancher
     les huit deplacait tous les tirages suivants du monde, et le banc
     l'a vu immediatement (2e tirage attendu 0,4157, obtenu 0,7635).
     On sauve l'etat du generateur, on fabrique, on le remet. Le monde
     reste identique a la graine pres — les etoiles ne coutent aucun
     tirage a personne. */
  const { alea } = require("./alea.js");
  const etat = { mt: alea.mt.slice(), mti: alea.mti, g: alea.gaussSuivant };
  const liste = ET.fabriquer(graine * 7 + 13);
  alea.mt.set(etat.mt); alea.mti = etat.mti; alea.gaussSuivant = etat.g;
  for (const e of liste) {
    const org = e.org || "AFC", div = e.division;
    const roster = rosters[org] && rosters[org][div];
    if (!roster || !roster.length) continue;
    /* L'ancien champion cede sa place : il reste au roster, il descend. */
    const ancien = pros.get(roster[0]);
    if (ancien) { ancien.champion = false; ancien.rang = 2; }
    /* /!\ UN ID BIEN FORME : idPro(division, cellule, k) — pas deux
       arguments. Premiere version : NaN pour les huit, donc UN SEUL homme
       survivait dans la Map (toutes les cles NaN sont la meme cle). */
    const id = idPro(0, 11, 8000 + liste.indexOf(e));
    const l = {
      id, nom: e.nom, pays: codePays(e.pays),
      division: div, archetype: e.archetype, note: 94,
      age: 28 + (liste.indexOf(e) % 6), ageDebut: 20, j: 0,
      bilan: { v: 18 + (liste.indexOf(e) % 7), d: 1 + (liste.indexOf(e) % 3), serie: 4 },
      org, rang: 1, champion: true, notoriete: e.notoriete || 85,
      /* /!\ SA FICHE EST CELLE QU'ETOILES A CALIBREE : on la STOCKE, sinon
         l'hydratation la refabriquerait a partir de sa note et le trou
         volontaire disparaitrait. C'est pour ca qu'il porte salle:false
         mais une fiche quand meme. */
      fiche: e.fighter, etoile: true,
      faits: [{ an: 2026, quoi: `Champion ${org} (${div.replace(/_/g, " ")})` }],
    };
    /* Tout le monde recule d'un cran derriere lui. */
    for (let i = 0; i < roster.length; i++) {
      const x = pros.get(roster[i]);
      if (x && x.rang !== null) x.rang = Math.min(15, x.rang + 1) || null;
    }
    pros.set(id, l);
    roster.unshift(id);
  }
}

function monde(graine) {
  enregistrerOrgs();
  const divisions = Object.keys(E.DIVISIONS);
  const pros = new Map();                 // id -> fiche legere
  const prochains = {};                   // cellule "d:pays" -> prochain k libre
  const rosters = {};                     // org -> division -> [ids] (tries par note)
  for (const org of Object.keys(CL.ORGS)) rosters[org] = {};

  for (let d = 0; d < divisions.length; d++) {
    const division = divisions[d];

    // 1. La population candidate, par pays, chacun avec son histoire.
    const parPays = {};
    for (const p of PAYS) {
      const liste = [];
      for (let k = 0; k < p.candidats; k++) {
        const id = idPro(d, p.idx, k);
        liste.push(fabriquerHomme(graine, id, p.cle, division, false).leger);
      }
      liste.sort((a, b) => b.note - a.note);
      parPays[p.cle] = { liste, prochainK: p.candidats };
    }
    const restants = () => PAYS.flatMap(p => parPays[p.cle].liste);

    // 2. Les organisations recrutent, du sommet vers les nationales.
    // /!\ LES ORGS SIGNENT AUSSI SUR L'HORIZON, PAS SEULEMENT SUR LE NIVEAU
    // DU JOUR (Mael, 09/08 : "des vrais pepites de 22 ans, c'est rare mais
    // ca existe"). Un matchmaker prefere un 24 ans a 80 qu'un 35 ans a 82 :
    // le premier a dix ans de cartes a vendre. Sans ce biais, la selection
    // pure au niveau faisait du sommet une maison de retraite (46 % de 33+
    // a l'AFC meme avec le declin physique).
    const attrait = l => l.note + Math.max(0, 29 - l.age) * 0.55;
    const prendre = (org, n, filtre) => {
      let pool = restants().filter(l => !filtre || filtre(l));
      pool.sort((a, b) => attrait(b) - attrait(a));
      // /!\ Si un petit pays a ete vide par les etages du dessus, on
      // complete sa population — ids qui CONTINUENT la cellule, donc
      // toujours refabricables.
      while (pool.length < n && filtre) {
        for (const p of PAYS) {
          if (!filtre({ pays: p.cle })) continue;
          const id = idPro(d, p.idx, parPays[p.cle].prochainK++);
          parPays[p.cle].liste.push(fabriquerHomme(graine, id, p.cle, division, false).leger);
        }
        pool = restants().filter(l => filtre(l));
        pool.sort((a, b) => attrait(b) - attrait(a));
      }
      const pris = pool.slice(0, n);
      const ids = new Set(pris.map(l => l.id));
      for (const p of PAYS)
        parPays[p.cle].liste = parPays[p.cle].liste.filter(l => !ids.has(l.id));
      // Rang initial : les quinze meilleurs, champion en tete. La
      // notoriete de depart suit le rang et la portee de l'organisation.
      const portee = CL.ORGS[org].portee;
      pris.forEach((l, i) => {
        l.org = org;
        l.rang = i < 15 ? i + 1 : null;
        l.champion = i === 0;
        const t = l.rang ? (16 - l.rang) / 15 : 0;
        l.notoriete = Math.round(Math.min(portee, portee * (0.12 + 0.68 * t)) * 10) / 10;
        pros.set(l.id, l);
      });
      rosters[org][division] = pris.map(l => l.id);
    };

    prendre("AFC", TAILLES.AFC, null);
    prendre("GFL", TAILLES.GFL, null);
    prendre("SOK", TAILLES.SOK, l => EUROPE.has(l.pays));
    prendre("TRI", TAILLES.TRI, l => l.pays === "FRA");
    prendre("HEX", TAILLES.HEX, l => l.pays === "FRA");
    for (const [cle, n] of Object.entries(NATIONALES))
      prendre(cle, 30, l => l.pays === n.pays);
    // Les non-recrutes n'existent pas en tant que pros : ils retournent
    // a l'anonymat du monde amateur.
    // /!\ ON RELEVE LE COMPTEUR DE CHAQUE CELLULE : le nouveau sang de la
    // vie du monde (cartes.js) continuera ces ids, donc restera
    // refabricable comme les autres.
    for (const p of PAYS) prochains[d + ":" + p.idx] = parPays[p.cle].prochainK;
  }

  // 3. Les amateurs : PAS GENERES. Vingt fois les pros, repartis par
  // tradition — chacun n'est qu'une fonction (graine, id) qu'on
  // materialise a la demande.
  const totalAmateurs = pros.size * 20;
  const amateurs = {};
  for (const p of PAYS) {
    amateurs[p.cle] = {};
    for (let d = 0; d < divisions.length; d++)
      amateurs[p.cle][divisions[d]] =
        Math.round(totalAmateurs * p.tradition / divisions.length);
  }

  /* /!\ LES HUIT TETES D'AFFICHE ENTRENT DANS LE MONDE (Mael, 10/08).
     etoiles.js existait depuis des semaines — huit champions concus,
     calibres, avec leur trou volontaire et leur banc (banc 15) — ET
     N'ETAIT BRANCHE NULLE PART. Vanel, Bastos, Aslanov n'existaient dans
     aucune partie. Un module complet qui ne fait rien : la famille de
     defaut que le carnet traque depuis le debut.
     Ils PRENNENT LA CEINTURE de leur division a l'AFC : une tete
     d'affiche calibree pour dominer qui traine au rang 9 ne ressemble a
     rien, et le but de ces huit-la est que le sommet du monde ait un
     visage des le premier jour. */
  poserEtoiles(pros, rosters, graine);

  return { graine, divisions, pros, rosters, amateurs, prochains };
}

/** La fiche moteur complete d'un pro — refabriquee, jamais stockee.
 *  /!\ anneesEnPlus : l'age du monde. Hydrater a +2 ans rend l'homme tel
 *  qu'il est DEUX ANS APRES la naissance du monde — jeune qui a muri,
 *  vieux qui a decline. C'est la fiche que le moteur DOIT utiliser pour
 *  un combat joue a cette date (regle 7 : l'ecran, et le scouting,
 *  racontent ce que le moteur a reellement tire). */
function hydrater(m, id, anneesEnPlus = 0) {
  const l = m.pros.get(id);
  if (!l) throw new Error(`vivier.js : id inconnu ${id}`);
  // /!\ UN HOMME DE LA SALLE NE SE REFABRIQUE PAS. Il a une histoire —
  // tes coachs, ton materiel, ton sparring — qu'aucune graine ne peut
  // reproduire. Sans ce garde-fou, hydrater rendait SILENCIEUSEMENT un
  // inconnu a la place d'Okonkwo (defaut trouve au branchement du 09/08).
  // Meme famille que le "defaut silencieux" du carnet : ce qui ne leve
  // pas se decouvre trois seances plus tard.
  if (l.salle) throw new Error(
    `vivier.js : ${l.nom} est un homme de la salle — passer par salle.ficheDe`);
  return fabriquerHomme(m.graine, id, l.pays, l.division, l.j === 1, anneesEnPlus);
}

/** LE NOUVEAU SANG : un jeune du pays passe pro. L'id CONTINUE la cellule
 *  (compteur du monde), donc il se refabrique comme les autres — et il est
 *  tire en mode jeune (16-29 ans) : c'est la montee, pas un journeyman
 *  sorti de nulle part. Le caller (cartes.js) pose org, rang, contrat. */
function nouveauPro(m, paysCle, division, anneesEnPlus = 0) {
  const p = PAYS_PAR_CLE[paysCle];
  if (!p) throw new Error(`vivier.js : pays inconnu ${paysCle}`);
  const d = m.divisions.indexOf(division);
  const cle = d + ":" + p.idx;
  const k = m.prochains[cle]++;
  const id = idPro(d, p.idx, k);
  const h = fabriquerHomme(m.graine, id, paysCle, division, true, anneesEnPlus);
  m.pros.set(id, h.leger);
  return h;
}

/** Un amateur du monde, materialise. k < nb d'amateurs de la cellule. */
function amateur(m, paysCle, division, k) {
  const p = PAYS_PAR_CLE[paysCle];
  if (!p) throw new Error(`vivier.js : pays inconnu ${paysCle}`);
  if (k >= m.amateurs[paysCle][division])
    throw new Error(`vivier.js : amateur ${k} hors de la cellule ${paysCle}/${division}`);
  const d = m.divisions.indexOf(division);
  return fabriquerHomme(m.graine, idAmateur(d, p.idx, k), paysCle, division, true);
}

module.exports = { PAYS, PAYS_PAR_CLE, NATIONALES, TAILLES, EUROPE,
                   enregistrerOrgs, avecFlux, melanger, fabriquerHomme,
                   monde, hydrater, amateur, nouveauPro, idPro, idAmateur };


});

/* ===== cartes.js ===================================================== */
__def("cartes.js", function (module, exports, require) {
/**
 * cartes.js — LA VIE DU MONDE : les cartes, les combats, les contrats.
 *
 * Module natif JS, tenu par invariants (banc 19). AUCUN fichier gele
 * touche : engine.simuler_combat, verdict.js, feuille.js, classement.js
 * et vivier.js sont utilises tels quels.
 *
 * ===================================================================
 * /!\ LES DECISIONS DE CHARPENTE (Mael, 09/08)
 * ===================================================================
 * 1. RESOLUTION A TROIS ETAGES, regle 7 tenue a chaque etage :
 *      - ta carte : moteur complet, tout s'affiche (cote jeu, pas ici) ;
 *      - toute autre carte pro : MOTEUR COMPLET, on ne conserve que le
 *        verdict et l'EMPREINTE — l'ecran ne dira jamais un chiffre que
 *        le moteur n'a pas tire ;
 *      - les amateurs hors ecran ne passent pas par ici.
 * 2. L'EMPREINTE DATEE : chaque combat resolu laisse un agrégat minuscule
 *    (frappes par cible et par position, TD, controle, methode, date,
 *    fiche d'age au jour du combat). C'est la matiere du futur rapport de
 *    scouting : la precision par zone suivra l'EXPOSITION reelle. Sans
 *    empreinte des le premier combat du monde, ces donnees sont perdues.
 * 3. LE MONDE VIEILLIT : chaque combat est tire avec la fiche hydratee A
 *    LA DATE (vivier.hydrater(m, id, annees)). Un an d'inactivite bouge
 *    reellement l'homme — progression des jeunes, declin des vieux.
 * 4. LES ORGS NE VOIENT PAS LE NIVEAU, ELLES VOIENT LA TRACE : bilan,
 *    serie, notoriete. Le radar, les signatures et les coupes ne lisent
 *    JAMAIS l.note — pas plus que le joueur ne lit celle d'un adversaire.
 * 5. PAS DE CHEMIN OBLIGE : a chaque fin de contrat, toutes les orgs
 *    evaluent. L'AFC signe un genie de TRI en direct si elle le VOIT
 *    (radar), si sa serie passe sa barre (serieRequise, la star negocie
 *    plus tot) et s'il est libre. L'echelle europeenne EMERGE des seuils.
 * 6. LES COUPES : trois defaites de rang en fin de contrat, dehors. La
 *    pyramide reste saine DANS LE TEMPS, pas seulement a la naissance.
 * 7. LA NOTORIETE SE TRANSFERE : le gain porte la notoriete de
 *    l'adversaire (classement.gagnerNotoriete, 6e parametre).
 *
 * ===================================================================
 * /!\ DISCIPLINE RNG — LA MEME QUE vivier.js
 * ===================================================================
 * Chaque combat NPC est tire dans un flux prive seme par
 * (graine du monde, jour, ids des deux hommes). Le flux partage reste
 * INTACT : la vie du monde ne contamine jamais les combats du joueur, et
 * une annee de vie se rejoue a l'identique, dans n'importe quel ordre
 * d'appels exterieurs.
 */

const V = require("./vivier.js");
const CL = require("./classement.js");
const E = require("./engine.js");
const { feuille } = require("./feuille.js");
const { verdict } = require("./verdict.js");

/* ================================================================== */
/* LE CALENDRIER. AFC toutes les 2 semaines (Mael), HEX toutes les 3   */
/* (c'est ta scene), le reste mensuel. Cartes de 12 au sommet, 10      */
/* ailleurs. Defauts poses en clair le 09/08, non repris.              */
/* ================================================================== */
const CADENCE = { AFC: 14, GFL: 30, SOK: 30, TRI: 30, HEX: 21 };
const CADENCE_NATIONALE = 30;
const TAILLE_CARTE = { AFC: 12, GFL: 12 };
const TAILLE_CARTE_DEFAUT = 10;

/* /!\ DEUX FORMATS A L'AFC (Mael, 09/08, sur le modele reel) :
   - la NUMEROTEE, une sur deux : 15 combats en 5 main card / 5 prelims /
     5 pre-prelims — le grand rendez-vous ;
   - la FIGHT NIGHT entre deux : 12 combats a grande main card (9 / 3),
     main event possible sans titre (un top 12 contre un top 8, ou une
     superstar de retour que la notoriete place devant les classes).
   L'ORDRE DE LA CARTE : la notoriete cumulee decide (la superstar passe
   devant le n°5 c. n°6) — SAUF la ceinture, qui passe devant tout.
   ET LE MAIN EVENT EST TOUJOURS EN 5 ROUNDS, titre ou pas. */
const FORMATS_AFC = [
  { type: "numerotee",   taille: 15, main: 5, prelims: 5 },   // le reste : pre-prelims
  { type: "fight_night", taille: 12, main: 9, prelims: 3 },
];

/* Le radar : en dessous, l'org ne te voit pas — un 8-0 anonyme n'existe
   pas pour l'AFC. portee x 0,4 : AFC 40, GFL 32, SOK 28, TRI 22, HEX 16.
   Un champion TRI (plafond 55) PEUT donc etre vu du sommet : le chemin
   direct existe, il n'est juste pas donne. */
const seuilRadar = org => CL.ORGS[org].portee * 0.4;

/* La cible de roster par org — celle de la naissance du monde. */
const cibleRoster = org => V.TAILLES[org] !== undefined ? V.TAILLES[org] : 30;

const jourEnAnnees = j => j / 365;

/* ================================================================== */
/* L'ETAT DE VIE D'UN HOMME. Pose paresseusement sur le leger, de       */
/* maniere DETERMINISTE (donc identique a chaque rejeu du monde).      */
/* ================================================================== */
function vitaliser(m, l) {
  if (l.vie) return l.vie;
  const h = V.melanger(m.graine ^ 0x5f356495, l.id);
  l.vie = {
    // Contrat en cours : 1 a 3 combats restants, tire de l'id — le monde
    // nait avec des contrats a tous les stades, pas tous au meme jour.
    restants: 1 + h % 3,
    // /!\ L'APPETIT A ETE RETIRE (correction Mael, 09/08) : c'etait un
    // trait invente. La variance de rythme vient du PHYSIQUE — l'encaisse
    // du dernier combat decide de l'indisponibilite (dispo ci-dessous), et
    // chacun fait sa demande une fois remis. Cause tracable, pas de trait.
    dispo: 0,                // jour a partir duquel il peut demander un combat
    // Dernier combat : etale sur les ~5 derniers mois avant le jour 0,
    // pour que les cartes du debut ne ramassent pas tout le monde.
    dernier: -(h >>> 4) % 150 - 10,
    derniers: [],            // 3 derniers resultats, "V" ou "D"
    advPrec: null,           // dernier adversaire (garde anti-revanche)
    empreintes: [],          // les 3 dernieres, datees
  };
  return l.vie;
}

/* ================================================================== */
/* LA FRAICHEUR (Mael, 09/08) : entre son dernier combat et sa remise   */
/* complete, un homme est DIMINUE. 1 = remis ; 0 = sorti de la cage.    */
/* C'est elle qui rend le dilemme reel — accepter en courte preparation */
/* coute des points de fiche, pour les NPC comme pour tes gars.         */
/* ================================================================== */
function fraicheur(v, jour) {
  if (jour >= v.dispo) return 1;
  const depuis = jour - v.dernier;
  const requis = Math.max(1, v.dispo - v.dernier);
  return Math.max(0, Math.min(1, depuis / requis));
}

/** Applique la meforme a une fiche hydratee — MEME PRECEDENT QUE LA
 *  PESEE (cardioJourJ) : un facteur sur le physique, pas un systeme
 *  neuf. A fraicheur 0 : cardio -25 %, menton -20 %, recuperation
 *  -10 %. Lineaire jusqu'a la remise complete. */
function appliquerFraicheur(f, fr) {
  if (fr >= 1) return;
  const manque = 1 - fr;
  f.physical.cardio = Math.round(f.physical.cardio * (1 - 0.25 * manque));
  f.physical.chin = Math.round(f.physical.chin * (1 - 0.20 * manque));
  f.physical.recovery = Math.round(f.physical.recovery * (1 - 0.10 * manque));
}

/* ================================================================== */
/* LE MATCHMAKING D'UNE CARTE. Sur la TRACE seulement.                  */
/* ================================================================== */
function batirCarte(m, org, jour, format) {
  const taille = format ? format.taille
    : TAILLE_CARTE[org] !== undefined ? TAILLE_CARTE[org] : TAILLE_CARTE_DEFAUT;
  const paires = [];

  // Les plus en manque de combat d'abord, toutes divisions confondues —
  // c'est le matchmaking qui produit le rythme individuel (2-3 combats
  // par an), pas un quota.
  const attente = [];
  /* /!\ LE MONDE NE PROGRAMME PAS DEUX HOMMES DE LA SALLE ENSEMBLE (Mael,
     10/08 : "mon combattant a combattu un autre combattant de ma salle,
     j'etais dans le camp que de 1, l'autre a meme pas eu de
     proposition"). LA CARTE DU MONDE prend TOUT le roster, tes hommes
     compris — c'est voulu, c'est ainsi qu'ils recoivent des adversaires.
     Mais rien n'empechait qu'elle en apparie DEUX DES TIENS : et alors
     un seul avait recu l'offre et prepare un camp, l'autre montait dans
     la cage sans avoir rien accepte.
     ON NE LES RETIRE PAS DU VIVIER (ils doivent combattre) : on marque
     ceux de la salle, et cherche() refusera de les mettre face a face. */
  for (const div of m.divisions)
    for (const id of m.rosters[org][div]) {
      const l = m.pros.get(id);
      vitaliser(m, l);
      attente.push(l);
    }
  // /!\ ON N'APPARIE QUE LES DISPONIBLES : un homme couche par son
  // dernier combat n'a pas fait de demande. Parmi eux, l'attente ponderee
  // par le nom (garde par Mael) — les stars vendent, l'orga les rappelle.
  const dispos = attente.filter(l => jour >= l.vie.dispo);
  // /!\ LA COURTE PREPARATION (Mael) : un NPC peut accepter DIMINUE quand
  // personne d'autre n'est remis — jamais sous 55 % de fraicheur, on ne
  // remonte pas dans la cage a moitie mort. cherche() prefere TOUJOURS un
  // remis ; le semi-remis n'est pris que faute de mieux.
  const semis = attente.filter(l => jour < l.vie.dispo && fraicheur(l.vie, jour) >= 0.55);
  const prio = l => (jour - l.vie.dernier) * (1 + l.notoriete / 200);
  dispos.sort((a, b) => prio(b) - prio(a));

  const pris = new Set();
  const cherche = (l) => {
    // Un adversaire de la meme division, DISPONIBLE, le plus proche a la
    // trace : les classes entre eux, les non-classes entre eux (la densite
    // vit dans le matchmaking — regle de classement.js).
    // /!\ LE COULOIR DE SAUT (Mael, 09/08) : "je suis top 15, personne de
    // dispo, seulement un top 6 — je peux gruger les etapes, dans la
    // mesure du logique." Le matchmaker prefere TOUJOURS l'ecart minimal ;
    // le saut n'est permis que faute de mieux, et borne : un classe peut
    // monter jusqu'a 8 rangs au-dessus de lui, un non-classe ne saute
    // JAMAIS dans le top 5. Celui qui saute et gagne est paye cash par
    // bouger(). Le titre, lui, reste garde par le main event des cartes.
    const rl = l.rang !== null ? l.rang : CL.NON_CLASSE;
    const balaie = (pool) => {
      let best = null, bestD = Infinity;
      for (const c of pool) {
        if (c === l || pris.has(c.id) || c.division !== l.division) continue;
        /* /!\ LE MONDE NE LES APPARIE JAMAIS TOUT SEUL. Un duel entre
           deux de tes hommes est une DECISION DU JOUEUR : elle passe par
           une offre marquee `interne`, ou il repond une fois pour les
           deux (arbitrage Mael, 10/08). Ici, cote monde, personne ne
           monte dans la cage sans avoir signe. */
        if (c.salle && l.salle) continue;
        if (c.id === l.vie.advPrec) continue;               // pas de revanche immediate
        const rc = c.rang !== null ? c.rang : CL.NON_CLASSE;
        const haut = Math.min(rl, rc), bas = Math.max(rl, rc);
        if (bas - haut > 8) continue;                       // hors couloir
        if (haut <= 5 && bas === CL.NON_CLASSE) continue;   // pas de non-classe dans le top 5
        const d = Math.abs(rl - rc) + Math.abs(l.vie.dernier - c.vie.dernier) * 0.01;
        if (d < bestD) { bestD = d; best = c; }
      }
      return best;
    };
    return balaie(dispos) || balaie(semis);                 // le remis d'abord, toujours
  };

  for (const l of dispos) {
    if (paires.length >= taille) break;
    if (pris.has(l.id)) continue;
    const adv = cherche(l);
    if (!adv) continue;
    pris.add(l.id); pris.add(adv.id);
    paires.push([l, adv]);
  }

  // La place sur la carte suit ce qu'elle vend : la notoriete cumulee.
  // Le combat de titre, s'il est la, est TOUJOURS le main event.
  paires.sort((a, b) =>
    (a[0].notoriete + a[1].notoriete) - (b[0].notoriete + b[1].notoriete));
  let iTitre = paires.findIndex(p => p[0].champion || p[1].champion);
  // /!\ LA CEINTURE VACANTE SE REMET EN JEU (10/08) : si LA DIVISION n'a
  // plus de champion, la paire qui contient le MIEUX CLASSE joue le
  // titre. C'est le reel : un champion part, l'organisation monte un
  // combat de couronnement, elle ne laisse pas la ceinture morte.
  // /!\ LA VERIFICATION SE FAIT AU NIVEAU DE LA DIVISION, PAS DE LA
  // CARTE (attrape par le banc : NLD_N poids moyen, DEUX champions) :
  // un champion qui ne combat pas CE SOIR n'est pas une ceinture
  // vacante. Premiere version : iTitre < 0 suffisait — faux.
  let titreVacant = -1;
  if (iTitre < 0) {
    const divisionAChampion = paires.length &&
      (m.rosters[org][paires[0][0].division] || [])
        .some(id => { const x = m.pros.get(id); return x && x.champion; });
    if (!divisionAChampion) {
      let meilleur = Infinity;
      for (let i = 0; i < paires.length; i++) {
        const [x, y] = paires[i];
        const r = Math.min(x.rang !== null ? x.rang : 99, y.rang !== null ? y.rang : 99);
        if (r < meilleur) { meilleur = r; titreVacant = i; }
      }
      if (meilleur > 5) titreVacant = -1;   // pas de couronnement entre inconnus
      iTitre = titreVacant;
    }
  }
  if (iTitre >= 0) paires.push(...paires.splice(iTitre, 1));

  // Les places, du bas vers le haut de l'affiche. Sans format : l'ancienne
  // decoupe (main card de 6). Avec : la decoupe du format, pre-prelims
  // comprises pour la numerotee.
  const n = paires.length;
  const main = format ? format.main : 6;
  const prel = format ? format.prelims : n - main;
  return paires.map((p, i) => {
    const depuisHaut = n - 1 - i;
    return {
      a: p[0], b: p[1],
      /* /!\ LES RANGS SE TAMPONNENT A L'APPARIEMENT (10/08) : les combats
         d'une meme carte bougent l'echelle ENTRE EUX — captures a la
         resolution, les rangs derivaient et le couloir semblait viole
         ("#9 c. NC") alors que la paire etait legale a sa creation. */
      rangA: p[0].rang, rangB: p[1].rang,
      titre: p[0].champion || p[1].champion
           || (titreVacant >= 0 && i === n - 1),
      place: depuisHaut === 0 ? "main_event"
           : depuisHaut === 1 ? "co_main"
           : depuisHaut < main ? "main_card"
           : depuisHaut < main + prel ? "prelims" : "pre_prelims",
    };
  });
}

/* ================================================================== */
/* L'EMPREINTE : ce que le combat a MONTRE, lue dans la feuille — donc  */
/* dans le log — donc dans ce que le moteur a reellement tire.          */
/* ================================================================== */
function empreinte(fl, cote, jour, age, methode, rounds, fini) {
  const t = fl.total[cote];
  const adv = fl.total[1 - cote];
  const zone = {};
  for (const c of ["tete", "corps", "jambe"]) zone[c] = t[c].slice();
  const pos = {};
  for (const p of ["distance", "clinch", "sol"]) pos[p] = t[p].slice();
  return { jour, age, methode, rounds,
           sig: t.sig.slice(), zone, pos,
           td: t.td.slice(), sub: t.sub, controle: t.controle, kd: t.kd,
           // /!\ L'ENCAISSE (Mael, 09/08) : ce que le combat lui a coute.
           // C'est lui qui decide de l'indisponibilite — et il nourrira
           // le scouting (un homme qui sort d'une guerre se prepare
           // autrement) et l'usure du chantier L.
           pris: { sig: adv.sig[0], tete: adv.tete[0], kd: adv.kd, fini: fini || null } };
}

/* ================================================================== */
/* RESOUDRE UN COMBAT NPC : moteur complet, verdict + empreinte seuls   */
/* conserves. Le flux partage n'est pas touche.                         */
/* ================================================================== */
function resoudre(m, combat, org, jour) {
  const { a, b, titre, place } = combat;
  const annees = jourEnAnnees(jour);
  // /!\ LE MAIN EVENT EST TOUJOURS EN 5 ROUNDS, titre ou pas (Mael, sur
  // le modele reel : le retour d'une superstar se joue en 5).
  const rounds = (titre || place === "main_event") ? 5 : 3;

  const graineCombat = V.melanger(m.graine ^ (jour * 2654435761 >>> 0),
                                  V.melanger(a.id, b.id));
  // /!\ AIGUILLAGE : un homme de la salle apporte SA fiche (elle porte son
  // histoire) ; le monde se refabrique a la date. Cf. salle.js.
  /* /!\ LA FICHE STOCKEE FAIT FOI, POUR TOUT LE MONDE (10/08, meme regle
     que salle.js cas 23). Les huit tetes d'affiche portent une fiche
     CALIBREE A LA MAIN — avec leur trou volontaire. Les hydrater la
     refabriquerait depuis leur note et effacerait ce qui fait leur
     identite ; et comme elles n'ont pas les metadonnees du vivier, ca
     levait "Cannot read properties of undefined (reading 'archetypes')"
     des le premier combat. */
  const ficheDe = (l) => l.fiche
    ? l.fiche
    : (l.salle
        ? (() => { throw new Error(`cartes.js : ${l.nom} sans fiche stockée`); })()
        : V.hydrater(m, l.id, annees).fiche);
  const [fa, fb] = [ficheDe(a), ficheDe(b)];
  // La meforme du jour, appliquee AVANT le combat et CAPTUREE : l'ecran
  // et le scouting sauront qu'il est monte diminue (regle 7).
  const frA = fraicheur(a.vie, jour), frB = fraicheur(b.vie, jour);
  appliquerFraicheur(fa, frA); appliquerFraicheur(fb, frB);
  // /!\ CONTRAINTE LATENTE REVELEE PAR LA VIE DU MONDE : verdict.js et
  // feuille.js lisent les noms en (\S+) — UN SEUL MOT. Le banc verdict le
  // savait sans le dire : il renomme ses hommes "Okonkwo", "Rouge", "Bleu"
  // avant de jouer. On suit la solution maison (les "noms prefixes" du
  // carnet) : le moteur combat sous des jetons, les vrais noms vivent dans
  // la fiche legere et ne traversent jamais un log.
  fa.name = "A"; fb.name = "B";

  let gagnant, log;
  V.avecFlux(graineCombat, () => {
    [gagnant, log] = E.simuler_combat(fa, fb, rounds, false);
  });

  const vd = verdict(log, "A", "B");
  const fl = feuille(log, "A", "B");
  // maniere pour classement/notoriete : 3 finish · 2 decision nette
  // (3 points d'ecart ou plus sur la carte) · 1 combat serre.
  const fini = vd.methode !== "DÉCISION";
  let maniere = 3;
  if (!fini) {
    const c = (vd.detail || "").match(/(\d+)-(\d+)/);
    maniere = c && Number(c[1]) - Number(c[2]) >= 3 ? 2 : 1;
  }

  const [lV, lP] = gagnant === fa ? [a, b] : gagnant === fb ? [b, a] : [null, null];
  const res = { jour, org, place, titre, format: rounds, a: a.id, b: b.id,
                rangA: combat.rangA !== undefined ? combat.rangA : a.rang,
                rangB: combat.rangB !== undefined ? combat.rangB : b.rang,
                frA: Math.round(frA * 100) / 100, frB: Math.round(frB * 100) / 100,
                vainqueur: lV ? lV.id : null, methode: vd.methode,
                round: vd.round, detail: vd.libelle };

  const maj = (l, adv, gagne) => {
    const v = l.vie;
    if (gagne) { l.bilan.v++; l.bilan.serie++; }
    else if (lV !== null) { l.bilan.d++; l.bilan.serie = 0; }
    v.derniers.push(gagne ? "V" : lV === null ? "N" : "D");
    if (v.derniers.length > 3) v.derniers.shift();
    v.dernier = jour; v.advPrec = adv.id;
    // /!\ LA NOTORIETE SE TRANSFERE : 6e parametre, celle de l'adversaire.
    l.notoriete = CL.gagnerNotoriete(org, place, l.notoriete, gagne, maniere,
                                     adv.notoriete);
    const cote = l === a ? 0 : 1;
    const age = l.age + Math.trunc(annees + (l.id % 12) / 12); // anniversaire etale
    const finiSubi = !gagne && lV !== null && fini ? vd.methode : null;
    const emp = empreinte(fl, cote, jour, age, vd.methode, vd.round || rounds, finiSubi);
    emp.fraicheur = cote === 0 ? res.frA : res.frB;   // il etait diminue, ca se saura
    /* /!\ L'EMPREINTE PORTE DESORMAIS DE QUOI SE LIRE (Mael, 10/08 : il
       veut ouvrir la fiche d'un combattant du monde et cliquer sur ses
       combats). Sans l'adversaire ni l'issue, une empreinte n'est qu'un
       tas de chiffres anonymes : impossible d'en faire un palmares. */
    emp.adv = adv.id; emp.advNom = adv.nom; emp.gagne = gagne;
    emp.org = org; emp.titre = !!titre; emp.detail = vd.libelle || vd.methode;
    v.empreintes.push(emp);
    if (v.empreintes.length > 6) v.empreintes.shift();
    // /!\ L'INDISPONIBILITE DECOULE DE L'ENCAISSE (Mael, 09/08) : ~21 j
    // de plancher (camp court + recuperation), + les frappes prises, + la
    // suspension type commission si on a ete fini — KO subi ~+60 j, TKO
    // ~+40, soumission +15 (le corps est entier, l'ego moins). Un combat
    // tranquille rend vite ; une guerre couche trois mois. C'est CA qui
    // fait le rythme de chacun — cause physique, tracable, pas de trait.
    let repos = 21 + emp.pris.sig * 0.35 + emp.pris.kd * 10;
    if (finiSubi === "KO") repos += 60;
    else if (finiSubi === "TKO") repos += 40;
    else if (finiSubi === "SOUMISSION") repos += 15;
    v.dispo = jour + Math.round(repos);
  };
  if (lV !== null) { maj(lV, lP, true); maj(lP, lV, false); }
  else { maj(a, b, false); maj(b, a, false); }

  // Le classement bouge ; la ceinture change de taille si le titre tombe.
  if (lV !== null) {
    // /!\ L'ECHELLE REMPLACE bouger() (arbitrage Mael, 10/08) : le
    // vainqueur prend la place du perdant s'il etait derriere, le perdant
    // recule s'il etait devant. bouger() reste au module pour l'histoire
    // et ses bancs, plus personne ne l'appelle en vie de monde.
    CL.bougerEchelle(m, org, a.division, lV.id, lP.id, maniere >= 3);
    // /!\ UN COMBAT DE TITRE COURONNE TOUJOURS SON VAINQUEUR (10/08) :
    // l'ancienne garde `titre && lP.champion` couvrait la defense mais pas
    // la CEINTURE VACANTE — quand le champion etait parti (signature
    // ailleurs, retraite), plus aucun combat ne pouvait couronner et la
    // division restait sans champion A JAMAIS. Mesure : HEX poids plume,
    // ceinture eteinte au jour 53, encore eteinte au jour 90.
    if (titre) {
      // /!\ LES FAITS DE CARRIERE (Mael, 10/08 : "je veux voir les
      // palmares sur chaque fiche — 2026 champion UFC, 2027 perd la
      // ceinture, 2028 reprise"). On grave l'evenement SUR L'HOMME, au
      // moment ou il arrive : une ceinture reconstituee apres coup serait
      // une invention. Vaut pour le monde entier, donc pour les legendes.
      const an = 2026 + Math.floor(jour / 365);
      (lV.faits = lV.faits || []).push({ an, quoi: lP.champion
        ? `Champion ${org} (${a.division.replace(/_/g, " ")})`
        : `Titre ${org} vacant remporté (${a.division.replace(/_/g, " ")})` });
      if (lP.champion)
        (lP.faits = lP.faits || []).push({ an, quoi: `Perd la ceinture ${org}` });
      if (lP.champion) lP.champion = false;
      lV.champion = true; lV.rang = 1;
    }
    // /!\ retasser() NE TOURNE PLUS ICI (10/08) : il reecrivait les rangs
    // a l'ancienne APRES le mouvement d'echelle et les deux se battaient.
    // L'echelle est seule maitresse ; synchroniserRangs ecrit la fenetre.
    CL.synchroniserRangs(m, org, a.division);
    lV.vie.restants--; lP.vie.restants--;
  } else { a.vie.restants--; b.vie.restants--; }

  return res;
}

/* ================================================================== */
/* RETASSER : bouger() est PAIRWISE, deux hommes peuvent atterrir au    */
/* meme rang. Apres chaque combat, les classes de la division se        */
/* reordonnent — celui qui vient de bouger gagne l'egalite (il vient de */
/* la meriter), le champion reste n°1, et tout se recompresse en 1-15   */
/* sans trou ni doublon. Deterministe : l'egalite restante se tranche   */
/* a l'id.                                                              */
/* ================================================================== */
function retasser(m, org, div, vientDeBouger) {
  const classes = m.rosters[org][div]
    .map(id => m.pros.get(id))
    .filter(l => l.rang !== null);
  classes.sort((x, y) =>
    (x.champion ? -1 : x.rang) - (y.champion ? -1 : y.rang)
    || (x === vientDeBouger ? -1 : y === vientDeBouger ? 1 : 0)
    || x.id - y.id);
  classes.forEach((l, i) => { l.rang = i + 1; });
  for (const l of classes) if (l.rang > 15) l.rang = null;
}

/* ================================================================== */
/* LA FIN DE CONTRAT : coupes, signatures inter-orgs, re-signature,     */
/* nouveau sang. TOUT SUR LA TRACE, jamais sur la note.                 */
/* ================================================================== */
function finsDeContrat(m, org, jour, journal) {
  const annees = jourEnAnnees(jour);
  for (const div of m.divisions) {
    const roster = m.rosters[org][div];
    for (const id of roster.slice()) {
      const l = m.pros.get(id);
      // /!\ LA VIE DU MONDE NE TOUCHE PAS AUX HOMMES DE LA SALLE (Mael,
      // en jouant : "je signe un gars, il passe dans pros, et apres
      // quelques jours il disparait"). Le matchmaking les apparie comme
      // tout le monde — c'est voulu — mais leurs CONTRATS appartiennent
      // au joueur : l'organisation ne peut ni les couper, ni les faire
      // signer ailleurs, ni les mettre a la retraite dans son dos.
      if (l.salle) continue;
      const v = vitaliser(m, l);
      if (v.restants > 0) continue;

      // /!\ LA CEINTURE ROUVRE LE CONTRAT — POUR LES PNJ AUSSI (10/08).
      // La regle existait cote joueur (contrats.etat, banc 26) mais pas
      // dans le monde : Lefort prenait le titre HEX au jour 53 et signait
      // chez TRI LE MEME JOUR, ceinture eteinte. Une organisation
      // re-signe son champion — il ne touche pas le marche.
      if (l.champion) {
        v.restants = 3;
        journal.push({ jour, type: "prolongation", org, id, nom: l.nom, champion: true });
        continue;
      }

      const ageActuel = l.age + Math.trunc(annees);
      const troisDefaites = v.derniers.length >= 3 && v.derniers.every(r => r === "D");
      const vieuxUse = ageActuel >= 36 && v.derniers.slice(-2).every(r => r === "D");

      // 1. LA COUPE — trois defaites de rang, dehors (Mael). Un vieux sur
      //    deux defaites raccroche de lui-meme.
      if (troisDefaites || vieuxUse) {
        retirer(m, org, div, l);
        l.libre = true;
        if (vieuxUse || ageActuel >= 38) {
          l.retraite = true;
          // Une legende qui raccroche, ca se sait : on garde de quoi
          // l'annoncer (et de quoi ouvrir sa fiche).
          const titres = (l.faits || []).filter(f => /Champion/.test(f.quoi)).length;
          if (titres > 0 || (l.bilan.v >= 18 && l.bilan.v - l.bilan.d >= 10))
            (m.legendes = m.legendes || []).push({ jour, id, nom: l.nom, org,
              division: l.division, age: ageActuel, titres,
              bilan: `${l.bilan.v}-${l.bilan.d}`, faits: (l.faits || []).slice(0, 8) });
          m.pros.delete(id);
        }
        journal.push({ jour, type: vieuxUse ? "retraite" : "coupe", org, id, nom: l.nom,
                       derniers: v.derniers.slice(), age: ageActuel });
        continue;
      }

      // 2. LA MONTEE — une org plus haute le voit et le veut ? Toutes
      //    evaluent, de la plus haute a la sienne : pas de chemin oblige.
      const dessus = Object.keys(CL.ORGS)
        .filter(o => CL.ORGS[o].portee > CL.ORGS[org].portee)
        .sort((x, y) => CL.ORGS[y].portee - CL.ORGS[x].portee);
      let signe = null;
      for (const o of dessus) {
        if (l.notoriete < seuilRadar(o)) continue;          // il ne te VOIT pas
        if (l.bilan.serie < CL.serieRequise(o, l.notoriete)) continue;
        // /!\ LA BANDE, PAS LE VERROU STRICT (deux effets couples, payes au
        // banc) : strict, les trous se rebouchaient au nouveau sang avant
        // qu'une org d'en bas les voie — zero montee sur l'annee ; sans
        // verrou, les rosters gonflaient sans redescendre. On signe d'en
        // bas jusqu'a cible+2, on ne recomplete qu'en dessous de cible-1 :
        // les trous qui restent SONT les places du marche.
        if (m.rosters[o][div].length >= cibleRoster(o) + 2) continue;
        signe = o; break;
      }
      if (signe) {
        retirer(m, org, div, l);
        l.org = signe; l.rang = null; l.champion = false;
        v.restants = 3; v.derniers = [];
        m.rosters[signe][div].push(id);
        journal.push({ jour, type: "signature", org: signe, depuis: org, id, nom: l.nom });
        continue;
      }

      // 3. LA RE-SIGNATURE — trois combats de plus, chez soi.
      v.restants = 3;
      journal.push({ jour, type: "prolongation", org, id, nom: l.nom });
    }

    // 4. LE NOUVEAU SANG — le roster se recomplete : d'abord un libre que
    //    l'org VOIT, sinon un jeune du pays qui passe pro.
    while (roster.length < cibleRoster(org) - 1) {
      let pris = null;
      for (const l of m.pros.values()) {
        if (l.salle) continue;                 // jamais un homme du joueur
        if (!l.libre || l.division !== div) continue;
        if (l.notoriete < seuilRadar(org) * 0.6) continue;  // un coupe connu reste visible
        // /!\ PAS LE D-D-D TOUT FRAIS : sans ce filtre, l'org coupait un
        // homme et le re-signait dans le meme geste. Trois defaites de
        // rang, personne ne te rappelle — il faudra reconstruire ailleurs.
        if (l.vie && l.vie.derniers.length >= 3 && l.vie.derniers.every(x => x === "D")) continue;
        pris = l; break;
      }
      if (pris) {
        pris.libre = false; pris.org = org; pris.rang = null; pris.champion = false;
        vitaliser(m, pris); pris.vie.restants = 3; pris.vie.derniers = [];
        roster.push(pris.id);
        journal.push({ jour, type: "signature", org, depuis: "libre", id: pris.id, nom: pris.nom });
      } else {
        const paysOrg = paysDe(org);
        const h = V.nouveauPro(m, paysOrg, div, annees);
        const l = h.leger;
        l.org = org; l.rang = null; l.champion = false; l.notoriete = 0;
        const v = vitaliser(m, l); v.restants = 3; v.dernier = jour - 30;
        roster.push(l.id);
        journal.push({ jour, type: "debut", org, id: l.id, nom: l.nom });
      }
    }
  }
}

function retirer(m, org, div, l) {
  const r = m.rosters[org][div];
  const i = r.indexOf(l.id);
  if (i >= 0) r.splice(i, 1);
  l.org = null; l.rang = null; l.champion = false;
}

/** Le pays ou une org recrute son nouveau sang. Les internationales
 *  piochent au poids de la tradition ; ici, la premiere du continent. */
function paysDe(org) {
  const o = CL.ORGS[org];
  if (org === "SOK") return "POL";
  if (o.pays === "France") return "FRA";
  if (o.pays === "USA") return "USA";
  for (const p of V.PAYS) if (p.nom === o.pays) return p.cle;
  return "USA";
}

/* ================================================================== */
/* VIVRE : avancer le monde jusqu'a un jour donne. Rend le journal des  */
/* evenements et les resultats des cartes — c'est la matiere des        */
/* depeches et de l'onglet COMBATS cote jeu.                            */
/* ================================================================== */
function vivre(m, jourDe, jourA) {
  if (!m.vie) m.vie = { prochaine: {} };
  const P = m.vie.prochaine;
  for (const org of Object.keys(CL.ORGS))
    if (P[org] === undefined)
      // Etalees pour ne pas tomber toutes le meme jour, deterministe.
      P[org] = V.melanger(m.graine, org.length * 131 + org.charCodeAt(0)) % 21;

  const journal = [], resultats = [];
  for (let j = jourDe; j <= jourA; j++) {
    for (const org of Object.keys(CL.ORGS)) {
      if (j < P[org]) continue;
      const cadence = CADENCE[org] !== undefined ? CADENCE[org] : CADENCE_NATIONALE;
      P[org] = j + cadence;
      let format = null;
      if (org === "AFC") {
        m.vie.nAFC = (m.vie.nAFC || 0) + 1;
        format = FORMATS_AFC[m.vie.nAFC % 2];   // impair : numerotee d'abord
      }
      const carte = batirCarte(m, org, j, format);
      for (const combat of carte) resultats.push(resoudre(m, combat, org, j));
      finsDeContrat(m, org, j, journal);
    }
  }
  return { journal, resultats };
}

module.exports = { CADENCE, TAILLE_CARTE, FORMATS_AFC, fraicheur, appliquerFraicheur,
                   seuilRadar, cibleRoster,
                   vitaliser, batirCarte, resoudre, finsDeContrat, vivre };


});

/* ===== entente.js ==================================================== */
__def("entente.js", function (module, exports, require) {
/**
 * entente.js — CE QU'IL Y A ENTRE TOI ET LUI.
 *
 * Module natif JS, tenu par invariants (banc 22). Aucun fichier gele ni
 * porte n'est touche. C'est le CHANTIER H du carnet, concu entierement a
 * l'oral avec Mael le 08/08 et code ici sans rien inventer de neuf.
 *
 * ===================================================================
 * /!\ CE N'EST PAS UN COMPTEUR D'EVENEMENTS
 * ===================================================================
 * L'entente est le RESIDU DE TOUTES LES INTERACTIONS. Chaque echange
 * laisse une trace, meme minuscule, MEME NULLE — et zero est une valeur,
 * pas un oubli. Botter en touche ne monte ni ne descend, et c'est
 * exactement ce que ca doit faire. C'est le volume des petits echanges qui
 * fait qu'au bout de deux ans la relation a une histoire.
 *
 * /!\ A NE PAS CONFONDRE AVEC LA DISCIPLINE : discipline = sa rigueur a
 * lui, entente = ce qu'il y a ENTRE VOUS. Un type tres discipline peut te
 * detester.
 *
 * ===================================================================
 * /!\ LE FREIN N'EST PAS UNE LIMITE, C'EST UN COUT (trouvaille de Mael)
 * ===================================================================
 * Rien a brider parce que RIEN N'EST GRATUIT :
 *   flatter        -> entente +, mais GROSSE TETE (discipline qui baisse) :
 *                     il travaille moins, prend l'adversaire de haut
 *   accepter tout  -> il monte de categorie trop tot, allege les seances
 *   baisser ta part-> entente immediate, tresorerie en moins
 * LA GROSSE TETE EST `discipline` QUI BAISSE : on n'invente pas une
 * neuvieme stat, on RESSUSCITE celle du chantier F, qui est morte et qui
 * porte exactement ce sens.
 * AUCUNE OPTION N'EST BONNE DANS L'ABSOLU : un jeune qui manque de
 * confiance, on le flatte ; un type deja arrogant, ca le tue.
 */

/** Le depart : on ne se connait pas encore. */
const DEPART = 50;

/**
 * LES PALIERS DE LECTURE. Comme la relation aux orgas : LE CHIFFRE VIT
 * DANS LE CODE, LES MOTS SORTENT A L'ECRAN.
 */
const PALIERS = [
  { seuil: 84, mot: "il te suivrait n'importe où",   ton: "haut" },
  { seuil: 66, mot: "il te fait confiance",           ton: "bon" },
  { seuil: 44, mot: "correct, sans plus",             ton: "neutre" },
  { seuil: 24, mot: "il prend ses distances",         ton: "bas" },
  { seuil: 0,  mot: "il ne te supporte plus",         ton: "rupture" },
];

function lire(valeur) {
  for (const p of PALIERS) if (valeur >= p.seuil) return p;
  return PALIERS[PALIERS.length - 1];
}

/**
 * CE QUI LA FAIT BOUGER — la liste du carnet, telle quelle.
 * /!\ VALEURS PROPOSEES, A REJUGER EN JOUANT. L'asymetrie est voulue :
 * une trahison coute plus qu'un service ne rapporte.
 */
const ENTREES = {
  // ce qui monte
  affiche_voulue: +12,        // lui decrocher l'affiche qu'il voulait
  victoire_bon_camp: +8,      // une victoire apres un camp bien regle
  combat_domicile: +5,        // pas de frais pour lui
  part_baissee: +14,          // baisser ta part de toi-meme
  defendu_publiquement: +10,  // le defendre apres un incident
  refus_accepte: +9,          // accepter qu'il refuse un combat
  materiel_son_domaine: +7,   // investir dans SON domaine
  coin_allege: +5,            // alleger l'equipe quand la bourse est maigre

  // ce qui descend
  combat_trop_tot: -15,       // le faire combattre pas remis, blesse, hors categorie
  affiche_lointaine: -9,      // loin, petite bourse — il paie tout
  offre_refusee: -8,          // lui refuser un combat qu'il voulait
  engueulade_defaite: -11,    // l'engueuler apres une defaite
  stagnation: -6,             // le laisser enchainer sans progresser
  // /!\ LA SERIE DE DEFAITES (Mael, 09/08) : "plein de combattants
  // changent de coach apres des defaites". UNE defaite ne casse rien —
  // ca arrive. DEUX D'AFFILEE et il commence a se demander si le
  // probleme n'est pas toi. TROIS et il regarde ailleurs.
  // /!\ CE N'EST PAS UNE PUNITION DU JOUEUR : c'est la meme mecanique
  // que la coupe des orgas, vue de l'interieur de la salle.
  serie_defaites: -9,
  serie_noire: -16,           // trois de rang : il doute de toi ouvertement
  staff_sur_petit_combat: -7, // tout le staff sur un combat mal paye
  part_gardee: -10,           // garder tes 20 % alors qu'il te depasse
  abandon_mediatique: -13,    // l'abandonner apres un derapage

  // le dialogue (voir dialogue.js) — la trace des petits echanges
  echange_juste: +3,
  echange_neutre: 0,          // /!\ ZERO EST UNE VALEUR, PAS UN OUBLI
  echange_rate: -4,
  flatterie: +6,              // /!\ et la grosse tete avec (voir cout)

  // les promesses
  promesse_tenue: +16,
  promesse_trahie: -24,       // /!\ PIRE QU'UN REFUS FRANC. C'est le but.
};

/**
 * /!\ LE COUT CACHE DE CERTAINES ENTREES. C'est ce qui rend le systeme
 * non-abusable sans rien brider : flatter monte l'entente ET fait baisser
 * la discipline. A appliquer sur la fiche du combattant.
 */
const COUTS = {
  flatterie: { discipline: -3 },
  affiche_voulue: { discipline: -1 },       // on lui a cede, un peu
  part_baissee: { tresorerie: true },       // gere par l'economie, pas ici
};

/** L'etat d'entente d'un combattant. Vit sur SA fiche de salle. */
function etatDepart() {
  return { valeur: DEPART, histoire: [], promesses: [] };
}

/**
 * Bouger l'entente. Rend le mouvement ET le cout a appliquer.
 * @param {object} e     etat d'entente
 * @param {string} quoi  cle de ENTREES
 * @param {object} [f]   la fiche du combattant, pour appliquer le cout
 */
function bouger(e, quoi, f) {
  const delta = ENTREES[quoi];
  if (delta === undefined) throw new Error(`entente.js : entrée inconnue "${quoi}"`);
  const avant = e.valeur;
  e.valeur = Math.max(0, Math.min(100, e.valeur + delta));

  // /!\ MEME UN ZERO S'INSCRIT : c'est le volume des petits echanges qui
  // fait l'histoire. Un dialogue qui ne donne rien a quand meme eu lieu.
  e.histoire.push(quoi);
  if (e.histoire.length > 60) e.histoire.shift();

  // Le cout, applique sur la fiche quand elle est fournie.
  const cout = COUTS[quoi];
  if (cout && f && f.mental && cout.discipline !== undefined)
    f.mental.discipline = Math.max(5, Math.min(99, f.mental.discipline + cout.discipline));

  const pAv = lire(avant), pAp = lire(e.valeur);
  return { avant, apres: e.valeur, delta, palier: pAp,
           franchi: pAv.mot !== pAp.mot, cout: cout || null };
}

/* ================================================================== */
/* LES PROMESSES — le "OUI MAIS" du carnet.                            */
/* /!\ UNE PROMESSE CONDITIONNELLE, PAS UN COMPROMIS MOU : l'entente    */
/* monte TOUT DE SUITE (moins qu'un oui franc, bien plus qu'un non), et */
/* une DETTE apparait. Si tu ne tiens pas parole, l'entente s'effondre   */
/* PLUS BAS qu'un refus franc — un refus honnete vaut mieux qu'une       */
/* promesse trahie.                                                     */
/* /!\ SANS LA VERIFICATION A ECHEANCE, LE JEU MENTIRAIT : c'est pour   */
/* ca que la condition et l'echeance sont des DONNEES, pas du texte.    */
/* ================================================================== */

/** Le gain immediat d'un "oui mais" : entre le oui et le non. */
const GAIN_PROMESSE = 5;

/**
 * @param {object} e
 * @param {object} p { quoi, condition: {type, n}, echeance (jour), texte }
 *   type : "victoires" | "mois" | "titre"
 */
function promettre(e, p, jour, gain) {
  const promesse = { quoi: p.quoi, condition: p.condition, echeance: p.echeance,
                     texte: p.texte || null, posee: jour, etat: "en_cours" };
  e.promesses.push(promesse);
  const avant = e.valeur;
  // /!\ LE GAIN PEUT ETRE FOURNI PAR L'APPELANT (curseur de demandes.js)
  // ET PEUT ETRE NEGATIF : trop exiger, c'est refuser en faisant semblant
  // de ceder, et il le prend comme tel. Sans argument : la valeur
  // historique du carnet.
  const g = gain !== undefined ? gain : GAIN_PROMESSE;
  e.valeur = Math.max(0, Math.min(100, e.valeur + g));
  e.histoire.push("promesse");
  return { avant, apres: e.valeur, promesse, gain: g };
}

/**
 * Verifier les promesses arrivees a echeance. A appeler a chaque jour de
 * jeu — c'est ce qui empeche le jeu de mentir.
 * @param {object} etat  { victoiresDepuis(jour), titre, jour }
 * @returns {object[]} les mouvements produits
 */
function verifierPromesses(e, jour, etat, f) {
  const mouvements = [];
  for (const p of e.promesses) {
    if (p.etat !== "en_cours") continue;
    const c = p.condition || {};
    let remplie = false;
    if (c.type === "victoires") remplie = (etat.victoiresDepuis || 0) >= c.n;
    else if (c.type === "titre") remplie = !!etat.titre;
    else if (c.type === "mois") remplie = jour >= p.posee + c.n * 30;

    if (remplie && !p.honoree) {
      // La condition est remplie : c'est a TOI de tenir, maintenant.
      p.etat = "due";
      mouvements.push({ promesse: p, etat: "due" });
    } else if (jour > p.echeance) {
      // L'echeance est passee sans que tu tiennes parole.
      p.etat = "trahie";
      mouvements.push(Object.assign({ promesse: p, etat: "trahie" },
        bouger(e, "promesse_trahie", f)));
    }
  }
  return mouvements;
}

/** Tu tiens parole. */
function tenir(e, promesse, f) {
  promesse.etat = "tenue";
  return bouger(e, "promesse_tenue", f);
}

/* ================================================================== */
/* CE QUE L'ENTENTE ACHETE — elle cesse d'etre sentimentale.           */
/* ================================================================== */

/**
 * LA RENEGOCIATION : sa demande est ESCOMPTEE PAR L'ENTENTE. Deux ans de
 * bonne relation valent tant de pourcents.
 * @param {number} valeurOffre  ce que le concurrent propose
 * @returns {number} ce qu'il te demande pour rester
 */
function prixPourRester(e, valeurOffre) {
  // entente basse : il exige tout et plus encore · haute : il te laisse
  // une chance. Lineaire entre 1,25 et 0,72 de l'offre concurrente.
  const t = e.valeur / 100;
  return Math.round(valeurOffre * (1.25 - 0.53 * t));
}

/**
 * LE DEPART — /!\ L'ENTENTE AMORTIT, ELLE NE BLOQUE PAS. Si une enorme
 * offre arrive, le premier terme ecrase tout : meme a entente parfaite,
 * ON NE LE RETIENT PAS, et c'est juste.
 * Ce que l'entente change alors : la MANIERE. Il te previent, il finit ses
 * engagements, il te recommande — ou il part du jour au lendemain et
 * raconte partout que tu l'as mal gere.
 * @returns {object} { part, maniere, deja_decide }
 */
function tentation(e, valeurOffre, ceQueTuApportes, alea) {
  const t = valeurOffre - ceQueTuApportes - e.valeur * 0.6;
  const part = t > 0;
  const v = e.valeur;
  // /!\ ET PARFOIS IL A DEJA DECIDE (dernier mot de Mael) : rare, mais
  // REEL, sinon le systeme devient une machine ou tout se rachete et le
  // joueur croit controler ses hommes. Il ne les controle pas.
  // Plus probable a entente basse, JAMAIS impossible a entente haute.
  const seuil = 0.04 + (100 - v) / 100 * 0.16;      // 4 % a 20 %
  const dejaDecide = part && (alea !== undefined ? alea : Math.random()) < seuil;
  const maniere = v >= 66 ? "il vient t'en parler d'abord"
                : v >= 44 ? "il te prévient, sans plus"
                : "tu l'apprends par la presse";
  return { part, maniere, deja_decide: dejaDecide,
           // a entente basse, il abime ta reputation en partant
           degat_reputation: v < 24 ? 2 : v < 44 ? 1 : 0 };
}

module.exports = { DEPART, PALIERS, ENTREES, COUTS, GAIN_PROMESSE,
                   etatDepart, lire, bouger, promettre, verifierPromesses,
                   tenir, prixPourRester, tentation };

});

/* ===== salle.js ====================================================== */
__def("salle.js", function (module, exports, require) {
/**
 * salle.js — LE RACCORD ENTRE TA SALLE ET LE MONDE.
 *
 * Module natif JS, tenu par invariants (banc 25). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LE PROBLEME QUE CE MODULE RESOUT
 * ===================================================================
 * Deux mondes se sont construits en parallele et ne se connaissent pas :
 *   - demo_jeu.html a SES combattants (fiches.js : Okonkwo, Kante,
 *     Traore...), persistants, avec leur historique ecrit a la main ;
 *   - vivier.js a 4500 pros en fiches LEGERES, refabricables, ranges dans
 *     les rosters de seize organisations.
 * Sans raccord, tes hommes n'existent pour personne : pas d'offre, pas de
 * classement, pas d'adversaire. C'est LE branchement qui manque.
 *
 * ===================================================================
 * /!\ LA REGLE D'OR : TES HOMMES SONT L'EXCEPTION PERSISTANTE
 * ===================================================================
 * Un pro du monde est une FONCTION (graine, id) qu'on refabrique. Un homme
 * de ta salle, NON : sa progression depend de tes coachs, ton materiel,
 * ton sparring. Il est stocke, entier, et il ne redevient JAMAIS une
 * fonction.
 * D'ou l'ID NEGATIF : tous les ids du monde sont positifs (idPro,
 * idAmateur). Les tiens sont negatifs. Un id negatif ne DOIT JAMAIS
 * atteindre vivier.hydrater — c'est un invariant du banc, et c'est ce qui
 * garantit qu'on ne refabriquera jamais par erreur un homme qui a une
 * histoire.
 */

const V = require("./vivier.js");
const C = require("./cartes.js");
const CL = require("./classement.js");
const EN = require("./entente.js");
const FI = require("./fiches.js");
const G = require("./generator.js");
const CA = require("./carriere.js");

/** L'organisation ou la salle demarre. Marseille, nationale francaise. */
const ORG_DEPART = "HEX";

/**
 * La cle de fiches.js correspondant a une cle du jeu. /!\ Les deux
 * tables ont ete ecrites a des moments differents : les accents et la
 * casse ne correspondent pas toujours. On compare SANS accent.
 */
function cleFiche(cle) {
  if (FI.FICHES[cle]) return cle;
  const nu = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const cible = nu(cle);
  for (const k of Object.keys(FI.FICHES)) if (nu(k) === cible) return k;
  return cle;
}

/** Les ids de la salle sont NEGATIFS. Voir l'en-tete.
 *  /!\ CE COMPTEUR EST DE L'ETAT, PAS UNE VARIABLE DE MODULE (Mael,
 *  10/08 : ses deux pros remplaces par des gamins de 18 ans). Il repartait
 *  a -1 A CHAQUE RECHARGEMENT DE LA PAGE : le premier nouvel arrivant
 *  recevait l'id -1, DEJA OCCUPE par le premier homme de la salle, et
 *  l'ECRASAIT dans m.pros (une Map : meme cle = remplacement silencieux).
 *  Six ans de partie, des dizaines de recrues, tous ses hommes ecrases un
 *  par un. On le sauvegarde, ET on le recale sur le monde a chaque
 *  inscription — ceinture et bretelles. */
let prochainId = -1;
function nouvelId(m) {
  if (m && m.pros) {
    // Le plus petit id existant fait foi : jamais deux fois le meme.
    let plancher = 0;
    for (const id of m.pros.keys()) if (id < plancher) plancher = id;
    if (plancher - 1 < prochainId) prochainId = plancher - 1;
  }
  return prochainId--;
}
function idCourant() { return prochainId; }
function poserIdCourant(v) { if (typeof v === "number" && v < 0) prochainId = v; }

/** Un id de salle ne doit jamais partir a l'hydratation. */
const estDeLaSalle = (id) => id < 0;

/**
 * /!\ FABRIQUER LA FICHE D'UN HOMME DE LA SALLE QUI N'EN A PAS.
 * Trouve en jouant (09/08) : sur quinze amateurs, UN SEUL avait une fiche
 * ecrite a la main. Les autres n'etaient que des noms — donc rien a faire
 * progresser, rien a evaluer, et "Parler" ouvrait un panneau VIDE.
 * On la fabrique depuis ce que le jeu declare de lui (age, archetype,
 * categorie), dans un flux RNG prive seme par sa cle : deux parties
 * differentes donnent le meme homme, et le flux partage n'est pas touche.
 * /!\ UNE FOIS FABRIQUEE ELLE EST STOCKEE : sa progression depend de TES
 * coachs. Il ne redevient jamais une fonction du temps.
 */
function fabriquerFicheSalle(h) {
  const graine = [...String(h.cle || h.nom)]
    .reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  return V.avecFlux(graine, () => {
    const [f] = G.generer_combattant({
      niveau: 60, archetype: h.archetype || "polyvalent",
      division: h.division, nom: h.cle || h.nom });
    // Le niveau se DEDUIT de son histoire, comme pour tout le monde.
    CA.poser(f, { age: h.age, ageDebut: h.ageDebut !== undefined
      ? h.ageDebut : Math.max(12, h.age - (h.annees || 3)) });
    return f;
  });
}

/**
 * Inscrire un combattant de la salle dans le monde.
 *
 * Il entre dans le roster de l'organisation avec une fiche LEGERE de meme
 * forme que celles du vivier — c'est ce qui permet au matchmaking, aux
 * classements et aux offres de le traiter comme n'importe qui. Mais sa
 * fiche moteur, elle, reste CELLE DE LA SALLE : elle est fournie ici et
 * stockee, jamais refabriquee.
 *
 * @param {object} m       le monde
 * @param {object} h       { cle, nom, division, age, bilan:[v,d], fiche }
 * @param {string} [org]
 */
function inscrire(m, h, org = ORG_DEPART, roster = true) {
  if (roster) {
    if (!m.rosters[org]) throw new Error(`salle.js : organisation inconnue "${org}"`);
    if (!m.rosters[org][h.division])
      throw new Error(`salle.js : division inconnue "${h.division}"`);
  }

  const id = nouvelId(m);
  const [v, d] = h.bilan || [0, 0];
  const leger = {
    id, nom: h.nom, pays: "FRA", division: h.division,
    archetype: h.archetype || "polyvalent",
    // /!\ PAS DE `note` : les orgs ne voient QUE la trace (regle du
    // carnet). Le joueur, lui, voit la fiche complete de SES hommes —
    // mais ca ne passe pas par ici.
    age: h.age, ageDebut: h.ageDebut !== undefined ? h.ageDebut : h.age - 8,
    j: 0,
    bilan: { v, d, serie: h.serie !== undefined ? h.serie : 0 },
    // /!\ UN AMATEUR N'A PAS D'ORGANISATION : il est de la salle, pas
    // d'une promotion. Il aura la sienne le jour ou il passera pro.
    org: roster ? org : null, amateur: !roster,
    rang: null, champion: false, notoriete: h.notoriete || 0,
    // /!\ LA MARQUE DE LA SALLE : c'est elle qui interdit l'hydratation.
    salle: true,
    fiche: h.fiche || null,          // la fiche moteur, stockee, jamais refaite
    cle: h.cle || null,              // la cle cote demo_jeu.html / fiches.js
    entente: EN.etatDepart(),
  };
  C.vitaliser(m, leger);
  // Il arrive sans combat recent : disponible tout de suite.
  leger.vie.dernier = -90; leger.vie.dispo = 0;
  m.pros.set(id, leger);
  if (roster) m.rosters[org][h.division].push(id);
  return leger;
}

/**
 * La fiche moteur d'un homme, QUEL QU'IL SOIT. C'est le seul endroit du
 * jeu qui doit servir a obtenir une fiche de combat.
 * /!\ AIGUILLAGE : les tiens sortent du stock, ceux du monde sont
 * refabriques a la date. Se tromper d'aiguillage, c'est effacer une
 * carriere ou casser le determinisme.
 */
function ficheDe(m, id, jour = 0) {
  const l = m.pros.get(id);
  if (!l) throw new Error(`salle.js : id inconnu ${id}`);
  // /!\ LA FICHE STOCKEE FAIT FOI, MARQUEUR OU PAS (Mael, 10/08 :
  // "Toussaint vient de passer a 35 partout alors qu'il etait chaud").
  // Un homme de la salle n'a PAS de `note` : si son marqueur `salle` se
  // perd en route, ficheDe repartait sur V.hydrater(), qui refabrique un
  // combattant depuis une note ABSENTE — resultat mesure : 35 PARTOUT,
  // et tout l'entrainement efface a l'ecran. La presence d'une fiche
  // stockee est la preuve qu'il est a nous : on la rend, et on RECOLLE
  // le marqueur au passage.
  /* /!\ MEME FILET QUE cartes.js : une fiche a plat (sauvegarde ancienne)
     n'est pas utilisable par le moteur. Pour un homme de la salle on la
     rend quand meme — ses STATS sont justes et l'ecran en a besoin — mais
     l'appelant qui la donne au moteur doit la rehydrater. */
  if (l.fiche) { if (!l.salle) l.salle = true; return l.fiche; }
  if (l.salle) throw new Error(`salle.js : ${l.nom} n'a pas de fiche stockée`);
  return V.hydrater(m, id, jour / 365).fiche;
}

/**
 * Reprendre l'effectif de demo_jeu.html : les pros de fiches.js entrent
 * dans le monde, les amateurs et les adherents loisir restent hors roster
 * (ils n'ont rien a y faire tant qu'ils ne sont pas pros).
 *
 * @param {object} m
 * @param {object[]} effectif  [{ cle, nom, division, age, bilan, groupe }]
 */
function reprendreEffectif(m, effectif, org = ORG_DEPART) {
  const entres = [];
  for (const h of effectif) {
    // /!\ LES AMATEURS ENTRENT AUSSI (correction du 09/08) : ils sont de
    // ta salle, ils progressent, on leur parle. Simplement ils ne sont
    // dans le roster d'AUCUNE organisation tant qu'ils ne sont pas pros.
    /* /!\ TOUT LE MONDE ENTRE (Mael, 09/08 : "faut vraiment que chaque
       personne qui rejoint la salle soit automatiquement dans l'equipe et
       apparaisse"). Les adherents loisir aussi : ils ont un corps, ils
       progressent, on peut leur parler, et un jour l'un d'eux surprendra
       tout le monde au sparring. Seuls les PROS entrent au roster d'une
       organisation. */
    const pro = !h.groupe || h.groupe === "pro";
    // /!\ FI.CLES est la table des CLES DE STATS, pas la liste des
    // combattants (piege attrape au premier essai). La liste des hommes
    // ecrits a la main est FI.FICHES.
    // /!\ ET LES ACCENTS NE CORRESPONDENT PAS : demo_jeu.html indexe
    // "Kante" avec accent, fiches.js sans. La correspondance echouait EN
    // SILENCE et n'explosait qu'au premier dialogue, trois ecrans plus
    // loin. On normalise, et on LEVE si un pro n'a pas de fiche — un
    // combattant sans fiche ne doit jamais entrer dans le monde.
    let fiche = h.fiche || null;
    if (!fiche && h.cle && FI.FICHES[cleFiche(h.cle)]) fiche = FI.fighter(cleFiche(h.cle));
    // Pas de fiche ecrite a la main ? On la fabrique. /!\ ON NE LEVE PLUS :
    // un homme de la salle a TOUJOURS des stats, ecrites ou fabriquees.
    if (!fiche) fiche = fabriquerFicheSalle(h);
    entres.push(inscrire(m, Object.assign({}, h, { fiche }), org, pro));
  }
  return entres;
}

/* ================================================================== */
/* LE TEMPS — /!\ LE MONDE NE TOURNE PAS PENDANT QUE TU REGARDES UN    */
/* COMBAT. On avance le monde JUSQU'A un jour, jamais "un peu".         */
/* ================================================================== */

/**
 * Avancer le monde jusqu'au jour du jeu. Idempotent : rappele avec le
 * meme jour, il ne rejoue rien.
 * @returns {object} { journal, resultats } — la matiere des depeches
 */
function avancerMonde(m, jour) {
  if (m.jourCourant === undefined) m.jourCourant = -1;
  if (jour <= m.jourCourant) return { journal: [], resultats: [] };
  const r = C.vivre(m, m.jourCourant + 1, jour);
  m.jourCourant = jour;
  return r;
}

/* ================================================================== */
/* CE QUE L'ECRAN A BESOIN DE SAVOIR — en une seule fonction, pour que */
/* demo_jeu.html n'ait pas a fouiller dans les structures.              */
/* ================================================================== */

/** Le classement d'une division, pret a afficher. */
function classement(m, org, division) {
  /* /!\ GARDE A LA SOURCE (Mael, 21/08 : TypeError poids_plume) : un org
     absent des rosters (perime, fantome) plantait tous les appelants. */
  return (((m.rosters || {})[org] || {})[division] || [])
    .map(id => m.pros.get(id))
    .filter(l => l && l.rang !== null)
    .sort((a, b) => a.rang - b.rang)
    .map(l => ({ rang: l.rang, nom: l.nom, champion: l.champion,
                 bilan: `${l.bilan.v}-${l.bilan.d}`, salle: !!l.salle,
                 style: l.archetype || l.style || "",   /* la presse en a besoin (21/08) */
                 id: l.id }));
}

/** Les resultats du monde qui meritent une depeche : ton org, les titres,
 *  et les combats de tes hommes. Le reste est du bruit. */
/* /!\ LE FILTRE S'OUVRE SUR LES CATEGORIES SUIVIES (Mael, 28/08 : "une
   notif quand des top 15 de la categorie de l'orga d'un de mes
   combattants combattent"). `suivies` est un Set de cles "ORG|division"
   — la ou TES hommes sont sous contrat. Un combat de top 15 dans une de
   ces fenetres n'est pas du bruit : c'est le paysage de tes gars — leurs
   futurs adversaires. Le rang lu est celui DU SOIR DU COMBAT (rangA/
   rangB captures par resoudre), pas celui d'apres. Optionnel : sans
   `suivies`, le filtre d'avant, inchange. */
function depechesDe(m, resultats, suivies) {
  const sortie = [];
  for (const r of resultats) {
    const a = m.pros.get(r.a), b = m.pros.get(r.b);
    if (!a || !b) continue;
    const mien = a.salle || b.salle;
    const suivi = !!(suivies && suivies.has(r.org + "|" + a.division)
      && ((r.rangA !== null && r.rangA !== undefined && r.rangA <= 15)
        || (r.rangB !== null && r.rangB !== undefined && r.rangB <= 15)));
    if (!mien && !r.titre && !suivi && r.org !== ORG_DEPART) continue;
    const vainqueur = r.vainqueur ? m.pros.get(r.vainqueur) : null;
    const perdant = vainqueur ? (vainqueur === a ? b : a) : null;
    sortie.push({
      jour: r.jour, org: r.org, titre: r.titre, mien, suivi,
      division: a.division,
      // /!\ ON REND LES IDS, PAS SEULEMENT UNE PHRASE : sans eux l'ecran
      // ne peut pas rendre les noms cliquables (Mael, 09/08).
      a: a.id, b: b.id, nomA: a.nom, nomB: b.nom,
      vainqueur: vainqueur ? vainqueur.id : null,
      nomV: vainqueur ? vainqueur.nom : null,
      nomP: perdant ? perdant.nom : null,
      detail: r.detail,
      texte: vainqueur
        ? `${vainqueur.nom} bat ${perdant.nom} — ${r.detail}.`
        : `${a.nom} et ${b.nom} se quittent sur un nul.`,
    });
  }
  return sortie;
}

module.exports = { ORG_DEPART, cleFiche, fabriquerFicheSalle, nouvelId, idCourant, poserIdCourant, estDeLaSalle, inscrire, ficheDe,
                   reprendreEffectif, avancerMonde, classement, depechesDe };

});

/* ===== relation.js =================================================== */
__def("relation.js", function (module, exports, require) {
/**
 * relation.js — TA RELATION AVEC UNE ORGANISATION, ET CE QU'ELLE ACHETE.
 *
 * Module natif JS, tenu par invariants (banc 20). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LE CHIFFRE DANS LE CODE, LES MOTS A L'ECRAN (Mael, 09/08)
 * ===================================================================
 * La relation vit en CHIFFRE (0-100) : chaque action a un effet exact,
 * mesurable, prouvable au banc. Le joueur, lui, ne lit JAMAIS le nombre —
 * il lit "ils t'apprecient", "ils commencent a s'agacer", plus un
 * commentaire quand ca bouge fort ("ton refus n'est pas passe").
 * MEME PATRON QUE LE POTENTIEL CACHE ET LES AVIS DU COACH : la valeur est
 * lue par le moteur, la lecture est humaine. Si ca frustre a l'usage, on
 * affichera le chiffre — c'est UNE ligne, et c'est ecrit ici pour que la
 * prochaine seance sache que le choix est reversible.
 *
 * ===================================================================
 * /!\ CE QUE LA RELATION ACHETE — ET POURQUOI ELLE EST UN VRAI DILEMME
 * ===================================================================
 * Elle decide de LA PLACE SUR LA CARTE, de la BOURSE dans sa fourchette,
 * et de LA QUALITE DE L'ADVERSAIRE propose. Relation basse : des combats
 * a risque, pour peu d'argent, en prelims.
 * Le dilemme de Mael, en une phrase : ton gars n'est pas remis, mais
 * accepter quand l'orga est dans l'embarras te fait un credit — et
 * refuser, tu sais que la prochaine offre sera moins belle.
 * CRAMER TON GARS OU CRAMER TON CREDIT.
 */

const CL = require("./classement.js");

/** Le depart : ni ami ni ennemi. */
const DEPART = 50;

/**
 * /!\ LES ENTREES, DICTEES PAR MAEL (09/08). Les valeurs sont des
 * PROPOSITIONS calibrees a la main, pas des mesures — a rejuger en jouant.
 * L'asymetrie est voulue : on perd plus vite qu'on ne gagne, comme dans
 * tout rapport professionnel.
 */
const ENTREES = {
  refus: -8,               // refuser une offre
  refus_repete: -14,       // deux refus de suite : l'orga se lasse
                           /* /!\ ADOUCI DE -20 A -14 LE 10/08 : a -20, TROIS
                              refus depuis un etat neutre suffisaient a tomber
                              a zero, et le quatrieme ne coutait plus rien —
                              or Mael veut que "si tu refuses 4 combats, a
                              chaque fois tu rebaisses". Avec -14 et le
                              surcout de -5 par refus supplementaire :
                              50 -> 42 -> 28 -> 9 -> 0. Quatre refus. */
  acceptation: +5,         // accepter une offre normale
  depannage: +15,          // accepter en COURTE PREPARATION : le vrai credit
  pesee_loupee: -18,       // /!\ l'orga deteste : la carte est en danger
  finish: +6,              // gagner par KO/TKO/soumission
  spectacle: +8,           // un combat qui a vendu du billet (voir estSpectacle)
  defaite: -2,             // perdre coute un peu ; on ne t'en veut pas vraiment
  /* /!\ CE QUI SE DIT DE VIVE VOIX (conception Mael, 10/08 : "ce qui fait
     monter, les diners, les dialogues, accepter les combats"). Parler
     rapporte peu — c'est le combat qui paie — mais parler regulierement
     finit par compter, et mal parler coute tout de suite. */
  echange_juste: +3,       // on discute, il te situe
  exigence: -4,            // reclamer plus haut sans l'avoir merite
  exigence_argent: -6,     // lui reprocher ses bourses
  diner: +12,              // une soiree avec lui (a venir : les diners)
};

/**
 * LES CINQ PALIERS DE LECTURE. C'est tout ce que le joueur voit.
 * /!\ Aucun chiffre ne doit sortir d'ici vers l'ecran.
 */
const PALIERS = [
  { seuil: 82, mot: "ils te font confiance",      ton: "haut" },
  { seuil: 64, mot: "ils t'apprécient",            ton: "bon" },
  { seuil: 42, mot: "rien à signaler",             ton: "neutre" },
  { seuil: 22, mot: "ils commencent à s'agacer",   ton: "bas" },
  { seuil: 0,  mot: "tu es en froid avec eux",     ton: "froid" },
];

function lire(valeur) {
  for (const p of PALIERS) if (valeur >= p.seuil) return p;
  return PALIERS[PALIERS.length - 1];
}

/** Les commentaires de mouvement : ce qui rend l'action lisible sans
 *  chiffre. Un seul par evenement, celui qui parle le plus. */
const COMMENTAIRES = {
  refus: "Ton refus n'est pas passé inaperçu.",
  refus_repete: "Deuxième refus de suite — le matchmaker ne t'a pas rappelé de la semaine.",
  depannage: "Tu les as dépannés au pied levé. Ça, ils s'en souviennent.",
  pesee_loupee: "Rater le poids a mis leur carte en danger. Ils te l'ont fait savoir.",
  finish: "Un finish, c'est exactement ce qu'ils veulent vendre.",
  spectacle: "On a parlé de ce combat toute la semaine.",
  acceptation: null,
  defaite: null,
};

/**
 * L'etat de relation avec toutes les organisations. Pose sur la partie,
 * pas sur le monde : c'est TA relation, elle ne concerne pas les NPC.
 */
function etatDepart() {
  const r = {};
  for (const cle of Object.keys(CL.ORGS)) r[cle] = { valeur: DEPART, refusDeSuite: 0 };
  return r;
}

/**
 * Bouger la relation. Rend { avant, apres, palier, commentaire, franchi }
 * — `franchi` dit qu'on a change de palier, donc que l'ecran doit le dire.
 * @param {object} etat  l'etat rendu par etatDepart()
 * @param {string} org   cle d'organisation
 * @param {string} quoi  une cle de ENTREES
 */
function bouger(etat, org, quoi) {
  const e = etat[org];
  if (!e) throw new Error(`relation.js : organisation inconnue "${org}"`);
  const delta = ENTREES[quoi];
  if (delta === undefined) throw new Error(`relation.js : entrée inconnue "${quoi}"`);

  // Le compteur de refus de suite vit ici : c'est lui qui declenche
  // l'entree aggravee, et n'importe quelle acceptation le remet a zero.
  let cle = quoi;
  let surcout = 0;
  if (quoi === "refus") {
    e.refusDeSuite++;
    if (e.refusDeSuite >= 2) cle = "refus_repete";
    /* /!\ CHAQUE REFUS DE PLUS COUTE PLUS CHER (Mael, 10/08 : "si tu
       refuses 4 combats, a chaque fois tu rebaisses"). Avant, le
       troisieme et le dixieme refus coutaient PAREIL que le deuxieme :
       on pouvait refuser indefiniment a prix fixe. Desormais chaque
       refus au-dela du deuxieme ajoute -6, sans plancher artificiel. */
    if (e.refusDeSuite >= 3) surcout = -5 * (e.refusDeSuite - 2);
  } else if (quoi === "acceptation" || quoi === "depannage") {
    e.refusDeSuite = 0;
  }

  const avant = e.valeur;
  e.valeur = Math.max(0, Math.min(100, e.valeur + ENTREES[cle] + surcout));
  const pAvant = lire(avant), pApres = lire(e.valeur);
  return { avant, apres: e.valeur, palier: pApres,
           commentaire: COMMENTAIRES[cle] || null,
           franchi: pAvant.mot !== pApres.mot };
}

/**
 * /!\ LE SPECTACLE SE LIT DANS CE QUE LE MOTEUR A TIRE, IL NE SE DECRETE
 * PAS (regle 7). Un combat vend du billet quand il s'est passe quelque
 * chose : du volume, des chutes, un finish, ou une guerre au sol. On lit
 * l'empreinte, jamais une etiquette posee a la main.
 * @param {object} empA empreinte du cote A
 * @param {object} empB empreinte du cote B
 */
function estSpectacle(empA, empB) {
  const rounds = Math.max(1, empA.rounds);
  const volume = (empA.sig[0] + empB.sig[0]) / rounds;   // frappes touchees par round
  const chutes = empA.kd + empB.kd;
  const fini = empA.methode !== "DÉCISION";
  const sol = (empA.pos.sol[0] + empB.pos.sol[0]) / rounds;
  const tentatives = empA.sub + empB.sub;

  // Trois voies vers le spectacle, toutes tirees du log :
  //   la guerre debout (gros volume des DEUX cotes),
  //   le finish violent (plusieurs chutes, ou un arret au 1er round),
  //   la bataille au sol (echanges et soumissions cherchees).
  // /!\ CALIBRE PAR MESURE, PAS AU JUGE. Premiere version : 63 % des
  // combats "spectaculaires" — un spectacle qui arrive deux fois sur
  // trois n'est plus un spectacle, et la prime de relation devenait un
  // du. Les seuils sont remontes sur la distribution reelle (volume
  // median 70/round, p10 a 107 ; 38 % de finitions) pour viser ~20 %.
  const guerre = volume >= 100 && Math.min(empA.sig[0], empB.sig[0]) >= rounds * 36;
  const violent = fini && (chutes >= 2 || (empA.rounds <= 1 && chutes >= 1));
  const bataille = sol >= 28 && tentatives >= 5;
  return guerre || violent || bataille;
}

/**
 * CE QUE LA RELATION ACHETE. Rend les modificateurs que l'etape suivante
 * (les offres) appliquera : place sur la carte, bourse, et durete de
 * l'adversaire propose.
 * - place : nombre de crans gagnes sur l'affiche (0 a 2)
 * - bourse : facteur applique dans la fourchette de l'org (0,85 a 1,20)
 * - durete : ecart de rang qu'on t'impose EN PLUS quand ils ne t'aiment
 *   pas — relation basse, on te propose des pieges.
 */
function faveurs(etat, org) {
  /* /!\ FILET : une organisation absente de la table (partie ancienne,
     nationale ajoutee apres coup) faisait lever ici — et proposerOffres
     appelle faveurs A CHAQUE JOUR pour chaque homme. Un trou dans la
     table arretait donc tout le marche. */
  const e = etat && etat[org];
  if (!e) return { place: 0, bourse: 1, durete: 1, montee: 0 };
  const v = e.valeur;
  const t = v / 100;
  return {
    place: v >= 82 ? 2 : v >= 64 ? 1 : 0,
    bourse: Math.round((0.85 + 0.35 * t) * 100) / 100,
    /* Mal vu : on t'envoie au casse-pipe — plus dur, moins paye. */
    durete: v >= 64 ? 0 : v >= 42 ? 1 : v >= 22 ? 3 : 5,
    /* /!\ BIEN VU : IL TE MONTE (conception Mael, 10/08 : "il te propose
       des meilleurs combats, disons 1 rang de plus, a 2 rangs si tu as
       vraiment une bonne entente"). C'est l'INVERSE de la durete, pas la
       meme chose : la durete est une punition mal payee, la montee est
       une OPPORTUNITE bien payee. Les deux poussent vers le haut du
       classement — ce qui change, c'est ce qu'on te donne en echange. */
    montee: v >= 82 ? 2 : v >= 60 ? 1 : 0,
  };
}

module.exports = { DEPART, ENTREES, PALIERS, COMMENTAIRES,
                   etatDepart, lire, bouger, estSpectacle, faveurs };

});

/* ===== offres.js ===================================================== */
__def("offres.js", function (module, exports, require) {
/**
 * offres.js — CE QUE L'ORGANISATION TE PROPOSE, ET CE QUE TU DEMANDES.
 *
 * Module natif JS, tenu par invariants (banc 21). Aucun fichier gele ni
 * porte n'est touche. C'est LA PIECE QUI TRANSFORME UN COMBAT EN SAISON :
 * sans elle, le joueur a un combat et la saison s'arrete (avertissement du
 * carnet, 09/08).
 *
 * ===================================================================
 * /!\ TROIS CHEMINS VERS UN COMBAT, ET UN SEUL MOTEUR DERRIERE
 * ===================================================================
 * 1. L'OFFRE : l'orga te propose un adversaire pour sa prochaine carte.
 *    Message date, DELAI DE REPONSE (7 jours), adversaire nomme avec sa
 *    trace consultable. Tu vois la date du combat, donc le camp restant.
 * 2. LA DEMANDE (validee par Mael) : ton gars est remis, tu demandes un
 *    combat. Meme mecanique que les NPC — tu entres dans le vivier du
 *    matchmaker, et ce qu'on te trouve depend de ta relation.
 * 3. LA SOLLICITATION EN COURTE PREPARATION : un combattant se blesse,
 *    l'orga t'appelle. Ton gars n'est PAS remis. Accepter applique
 *    reellement appliquerFraicheur — cardio et menton en moins — et te
 *    fait un credit (+15). Refuser coute (-8, -20 au deuxieme d'affilee).
 *    CRAMER TON GARS OU CRAMER TON CREDIT.
 *
 * ===================================================================
 * /!\ L'OFFRE NE MENT JAMAIS (regle 7)
 * ===================================================================
 * Bourse, place sur la carte et durete de l'adversaire sortent de
 * classement.bourse() et relation.faveurs() — pas d'un habillage. Ce qui
 * est ecrit dans le message est ce que le combat paiera.
 * ET ELLE NE REVELE PAS LE NIVEAU DE L'ADVERSAIRE : elle porte sa TRACE
 * (bilan, serie, notoriete, rang, empreintes). Le joueur scoute, il ne
 * lit pas une note.
 */

const CL = require("./classement.js");
const R = require("./relation.js");
const C = require("./cartes.js");

/** Le delai de reponse, en jours de jeu. Passe ce delai, l'offre expire —
 *  et une offre expiree compte comme un REFUS : ne pas repondre est une
 *  reponse. */
const DELAI = 7;

/** Il faut du temps entre l'acceptation et le combat : c'est le camp. En
 *  dessous, l'orga sait qu'elle demande une faveur (sollicitation). */
const CAMP_NORMAL = 42;                      // six semaines, le camp du GDD

/**
 * Fabrique une offre. Ne DECIDE rien : elle decrit ce qui est propose.
 * @param {object} m      le monde (vivier)
 * @param {object} etatR  l'etat de relation (relation.etatDepart())
 * @param {object} combattant  fiche legere de TON combattant
 *   { id, nom, division, rang, champion, notoriete, vie }
 * @param {string} org
 * @param {number} jour        aujourd'hui
 * @param {number} jourCombat  la date de la carte
 * @param {object} [opts] { sollicitation: true } pour une courte preparation
 */
function fabriquer(m, etatR, combattant, org, jour, jourCombat, opts = {}) {
  const f = R.faveurs(etatR, org);
  /* /!\ LA CIBLE VOYAGE DANS opts (10/08) — le 7e argument etait DEJA
     pris par opts { sollicitation }. L'ajouter en 7e position aurait
     ecrase la courte preparation : deux sens pour un meme argument, la
     faute classique. */
  /* /!\ LA DURETE PUNIT, LA MONTEE RECOMPENSE — on additionne les deux :
     un homme mal vu monte parce qu'on le jette en pature, un homme bien
     vu monte parce qu'on lui ouvre la porte. Le classement vise est le
     meme ; la bourse et la place sur la carte, non. */
  /* /!\ DEUX EFFETS, PAS UNE SOMME (corrige par le banc, 10/08) : les
     additionner envoyait un #5 affronter le #1 dans les deux cas, et la
     distinction disparaissait. Ils ne se cumulent pas, ILS S'EXCLUENT :
       - MAL VU (durete >= 3) : on te jette en pature, tres haut, mal paye ;
       - BIEN VU (montee 1-2) : on te MONTE d'un ou deux rangs, bien paye.
     La regle de Mael est respectee au chiffre pres : "1 rang de plus, a 2
     rangs si tu as vraiment une bonne entente". */
  const saut = f.durete >= 3 ? f.durete : (f.montee || 0);
  const adversaire = choisirAdversaire(m, combattant, org, saut, jour, opts.cible, opts);
  if (!adversaire) return null;

  // La place : ce que ta notoriete vend, plus ce que la relation t'offre.
  const rangs = ["pre_prelims", "prelims", "main_card", "co_main", "main_event"];
  let i = combattant.notoriete >= 45 ? 2 : combattant.notoriete >= 20 ? 1 : 0;
  i = Math.min(rangs.length - 1, i + f.place);
  const place = rangs[i];

  // /!\ LE CONTRAT FAIT FOI (Mael, 10/08 : caisse +1 606 € sur une
  // bourse contractuelle de 700). L'offre calculait SA bourse au bareme
  // du marche pendant que le contrat en fixait une autre — deux
  // exemplaires de la meme donnee. Un homme SOUS CONTRAT est paye a sa
  // bourse contractuelle ; le bareme du marche ne sert qu'aux hommes
  // sans clause (et aux bancs qui la testent).
  if (combattant.vie && combattant.vie.bourseContrat) {
    const montantC = combattant.vie.bourseContrat;
    var bourseFixee = montantC;
  }
  // La bourse : celle du bareme, modulee par la relation. Rien d'invente.
  const [base] = CL.bourse(org, combattant.rang, combattant.champion,
                           combattant.notoriete);
  const montant = typeof bourseFixee !== "undefined"
    ? bourseFixee : Math.round(base * f.bourse);

  const camp = jourCombat - jour;
  const fr = C.fraicheur(combattant.vie, jourCombat);

  return {
    org, jour, expire: jour + DELAI, jourCombat, camp,
    /* /!\ TOUT PASSE PAR LUI (Mael) : "c'est lui qui vient te proposer un
       combat". Une offre n'est plus une notification d'organisation, c'est
       un homme qui appelle. */
    matchmaker: CL.matchmakerDe(org).nom,
    /* Deux hommes de la meme salle : le jeu doit le dire et demander UNE
       reponse pour les deux. */
    interne: !!(adversaire.salle && combattant.salle),
    montee: f.montee || 0,
    combattant: combattant.id, adversaire: adversaire.id,
    place, titre: !!(combattant.champion || adversaire.champion),
    bourse: montant, victoire: montant,          // garanti + prime de victoire
    // /!\ CE QUE TU SAURAS DE LUI : sa TRACE, jamais sa note.
    trace: {
      nom: adversaire.nom, pays: adversaire.pays,
      rang: adversaire.rang, champion: !!adversaire.champion,
      bilan: Object.assign({}, adversaire.bilan),
      notoriete: adversaire.notoriete,
      empreintes: adversaire.vie ? adversaire.vie.empreintes.slice(-2) : [],
      dernier: adversaire.vie ? adversaire.vie.dernier : null,
    },
    // La meforme AU JOUR DU COMBAT, calculee, pas devinee.
    fraicheur: Math.round(fr * 100) / 100,
    sollicitation: !!opts.sollicitation,
    // /!\ L'AVERTISSEMENT SORT DU CALCUL, PAS D'UN TEXTE POSE A LA MAIN.
    avertissement: fr < 1
      ? (fr < 0.75 ? "Il n'est pas remis de son dernier combat. Ça se verra."
                   : "Il sort à peine de camp de récupération.")
      : (camp < CAMP_NORMAL ? "Le camp sera court." : null),
  };
}

/**
 * L'adversaire qu'on te trouve. /!\ LA DURETE VIENT DE LA RELATION : mal
 * vu, on te propose plus fort que toi (des pieges) ; bien vu, on te
 * propose juste. Le couloir de cartes.js s'applique quand meme — on ne
 * jette pas un non-classe au top 5.
 */
function choisirAdversaire(m, combattant, org, durete, jour, cible, opts = {}) {
  /* /!\ LA CIBLE DU JOUEUR (Mael, 10/08 : "Cibler comme adversaire").
     Elle N'OBLIGE PAS l'organisation : elle demande. On ne la retient que
     si l'homme est du bon roster, de la bonne division, disponible, et
     pas la revanche immediate — sinon le ciblage deviendrait un menu
     deroulant et le matchmaking ne voudrait plus rien dire. */
  if (cible !== undefined && cible !== null) {
    const c = m.pros.get(cible);
    /* /!\ LA CIBLE NE COURT-CIRCUITE PAS LES REFUS INTERNES (10/08) : le
       raccourci rendait l'homme vise AVANT la boucle, donc un duel entre
       coequipiers deja refuse revenait quand meme. Un refus doit tenir
       par TOUS les chemins, pas seulement par le principal. */
    const dejaRefuse = c && c.salle && combattant.salle
      && (opts.refusInternes || []).includes(c.id);
    if (c && !dejaRefuse && c.org === org && c.division === combattant.division
        && c.id !== combattant.id && jour >= (C.vitaliser(m, c).dispo || 0)
        && !(combattant.vie && combattant.vie.advPrec === c.id))
      return c;
  }
  // /!\ LA DIRECTION DE L'ECHELLE (arbitrage Mael, 10/08) : "tu gagnes,
  // tu affrontes un mieux classe ; tu perds, tu regardes derriere."
  // La serie dit la direction (serie > 0 = il vient de gagner), la
  // durete du matchmaker dit de COMBIEN on ose viser au-dessus.
  const echelle = CL.echelleDe(m, org, combattant.division);
  const moi = echelle.indexOf(combattant.id);
  const versLeHaut = (combattant.bilan.serie || 0) > 0 || combattant.bilan.v + combattant.bilan.d === 0;
  // /!\ AUCUNE REVANCHE IMMEDIATE (Mael, 10/08 : "je me bats 7 fois
  // d'affilee contre le meme adversaire"). Le choix etait DETERMINISTE
  // (le plus proche au rang, premier minimum) et la victoire mettait
  // l'adversaire au repos ~35 jours — pile la fenetre de l'offre
  // suivante : le meme homme revenait a chaque fois. Le monde a la regle
  // (banc cartes : "aucune revanche immediate sur toute l'annee"), les
  // offres du joueur ne l'avaient pas. Deux passes : d'abord SANS le
  // dernier adversaire (dans les deux sens), et seulement s'il n'existe
  // personne d'autre, on l'autorise — une revanche vaut mieux que pas de
  // combat du tout.
  const dernier = combattant.vie ? combattant.vie.advPrec : undefined;
  const passe = (sansRevanche) => {
    let best = null, bestD = Infinity;
    for (const id of m.rosters[org][combattant.division] || []) {
      if (id === combattant.id) continue;
      const l = m.pros.get(id);
      if (!l) continue;
      /* /!\ UN COEQUIPIER RESTE POSSIBLE — MAIS C'EST TON CHOIX (arbitrage
         Mael, 10/08 : "ils peuvent accepter aussi, faut que ça propose
         aux deux — mais je peux refuser et ça me proposera pas ce combat
         en boucle"). Le probleme n'etait pas l'appariement : c'est qu'UN
         SEUL des deux recevait l'offre, l'autre montait dans la cage
         sans avoir rien accepte. L'offre est donc MARQUEE `interne` : le
         jeu la presente comme engageant les deux, et un refus l'efface
         durablement. */
      if (l.salle && combattant.salle && (opts.refusInternes || []).includes(l.id)) continue;
      C.vitaliser(m, l);
      if (jour < l.vie.dispo) continue;              // il n'est pas remis
      if (sansRevanche && (id === dernier || l.vie.advPrec === combattant.id)) continue;
      const lui = echelle.indexOf(id);
      if (moi >= 0 && lui >= 0) {
        const bonneDirection = versLeHaut ? lui < moi : lui > moi;
        const ecart = Math.abs(lui - moi);
        if (ecart > 8 + durete * 2) continue;        // couloir de saut
        // /!\ LA DIRECTION vient de la serie, LA PROFONDEUR de la durete
        // (banc : "mal vu = adversaire plus dur"). Bien vu, on vise juste
        // devant ; mal vu, le matchmaker t'envoie chercher plus haut.
        const vise = versLeHaut ? Math.max(0, moi - 1 - durete * 2)
                                : Math.min(echelle.length - 1, moi + 1 + durete);
        const d = Math.abs(lui - vise) + (bonneDirection ? 0 : 40);
        if (d < bestD) { bestD = d; best = l; }
      } else {
        const rc = l.rang !== null ? l.rang : CL.NON_CLASSE;
        const rl = combattant.rang !== null ? combattant.rang : CL.NON_CLASSE;
        const d = Math.abs(rc - rl) + 20;
        if (d < bestD) { bestD = d; best = l; }
      }
    }
    return best;
  };
  return passe(true) || passe(false);
}

/**
 * REPONDRE. C'est ici que la relation bouge — et nulle part ailleurs.
 * @returns {object} { accepte, mouvement, raison }
 */
function repondre(etatR, offre, oui, jour) {
  if (jour > offre.expire && oui)
    return { accepte: false, mouvement: R.bouger(etatR, offre.org, "refus"),
             raison: "L'offre a expiré." };
  if (!oui || jour > offre.expire) {
    const m = R.bouger(etatR, offre.org, "refus");
    return { accepte: false, mouvement: m,
             raison: jour > offre.expire ? "Tu n'as pas répondu à temps." : null };
  }
  // /!\ ACCEPTER UNE SOLLICITATION EST LE VRAI CREDIT : +15 au lieu de +5.
  const m = R.bouger(etatR, offre.org,
                     offre.sollicitation ? "depannage" : "acceptation");
  return { accepte: true, mouvement: m, raison: null };
}

/**
 * APRES LE COMBAT : les entrees de relation qui dependent de ce que le
 * moteur a tire. /!\ AUCUNE N'EST DECRETEE — finish et spectacle se
 * lisent dans les empreintes (regle 7).
 * @returns {object[]} les mouvements appliques, dans l'ordre
 */
function apresCombat(etatR, org, { gagne, methode, empMoi, empLui, peseeLoupee }) {
  const mouvements = [];
  if (peseeLoupee) mouvements.push(R.bouger(etatR, org, "pesee_loupee"));
  if (gagne && methode && methode !== "DÉCISION")
    mouvements.push(R.bouger(etatR, org, "finish"));
  if (!gagne) mouvements.push(R.bouger(etatR, org, "defaite"));
  if (empMoi && empLui && R.estSpectacle(empMoi, empLui))
    mouvements.push(R.bouger(etatR, org, "spectacle"));
  return mouvements;
}

/**
 * TA DEMANDE DE COMBAT (validee par Mael). Elle n'aboutit que si ton gars
 * est remis — on ne demande pas un combat pour un homme couche — et ce
 * qu'on te trouve depend de ta relation, comme pour une offre.
 * @returns {object|null} l'offre qui en resulte, ou null avec la raison
 */
function demander(m, etatR, combattant, org, jour, jourCombat) {
  C.vitaliser(m, combattant);
  if (jour < combattant.vie.dispo)
    return { refus: "Il n'est pas encore remis de son dernier combat.",
             remisLe: combattant.vie.dispo };
  const o = fabriquer(m, etatR, combattant, org, jour, jourCombat);
  if (!o) return { refus: "Personne de disponible à sa catégorie pour cette carte." };
  return o;
}

module.exports = { DELAI, CAMP_NORMAL, fabriquer, choisirAdversaire,
                   repondre, apresCombat, demander };

});

/* ===== dialogue.js =================================================== */
__def("dialogue.js", function (module, exports, require) {
/**
 * dialogue.js — PARLER A UN COMBATTANT.
 *
 * Module natif JS, tenu par invariants (banc 23). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ CE MODULE ABSORBE LE DIALOGUE DE mma_manager_v2.html
 * ===================================================================
 * Le prototype de v2 marchait et n'a PAS ete jete : ses trois approches
 * (secouer / rassurer / demander ou il en est) et sa lecture du profil
 * (discipline, fight IQ, agressivite, moral du moment) sont reprises
 * telles quelles. Ce qui est ajoute : une quatrieme approche (flatter,
 * avec son cout), la TRACE D'ENTENTE de chaque echange, et l'usure du
 * dialogue trop frequent.
 *
 * ===================================================================
 * /!\ CHAQUE ECHANGE LAISSE UNE TRACE, MEME NULLE
 * ===================================================================
 * "Botter en touche ne monte ni ne descend, et c'est exactement ce que ca
 * doit faire." Un echange rate coute, un echange juste rapporte peu, et
 * beaucoup de petits echanges justes finissent par faire une histoire.
 * ZERO EST UNE VALEUR, PAS UN OUBLI.
 *
 * ===================================================================
 * /!\ AUCUNE APPROCHE N'EST BONNE DANS L'ABSOLU
 * ===================================================================
 * Secouer un homme au moral bas le casse. Rassurer quelqu'un qui n'en a
 * pas besoin ne sert a rien. Flatter un type deja arrogant le tue — et
 * c'est le seul systeme du jeu ou LA MEME ACTION peut aider ou detruire
 * selon a qui elle s'adresse.
 */

const EN = require("./entente.js");

/** Le delai en dessous duquel reparler ne porte plus. */
/* /!\ UNE FOIS PAR SEMAINE ET PAR HOMME (Mael, 10/08 : "on pourrait leur
   parler qu'une fois par semaine ?"). Le delai existait deja mais il
   N'EMPECHAIT RIEN : il divisait l'effet par quatre et laissait parler.
   Un joueur pouvait donc revenir tous les jours et grappiller quand
   meme. Sept jours, et c'est un VERROU — l'ecran ne propose plus les
   approches tant que la semaine n'est pas passee. */
const LASSITUDE = 7;                 // jours

const APPROCHES = {
  secouer: {
    lab: "Le secouer",
    txt: "Vous lui dites que vous attendez plus de lui, et que le niveau au-dessus ne l'attendra pas.",
  },
  rassurer: {
    lab: "Le rassurer",
    txt: "Vous lui dites que vous voyez le travail, et que ça finit toujours par payer.",
  },
  ecouter: {
    lab: "Lui demander où il en est",
    txt: "Vous ne parlez pas d'entraînement. Vous lui demandez juste comment ça va.",
  },
  flatter: {
    lab: "Lui dire qu'il est au-dessus des autres",
    txt: "Vous lui dites ce qu'il a envie d'entendre : qu'à ce rythme, personne dans la salle ne tiendra avec lui.",
  },
  /* /!\ LES DIALOGUES DE SITUATION (Mael, 10/08 : "enrichir tous les
     dialogues et leur donner de vrais resultats"). Les quatre premiers
     sont GENERAUX — on peut les dire n'importe quand, a n'importe qui.
     Ceux-la ne s'ouvrent QUE quand la situation existe, et ils ont une
     consequence qui depasse l'entente : ils changent le combat suivant,
     ou ils engagent le coach. */
  relancer: {
    lab: "Le relever après sa défaite",
    txt: "Vous revenez sur le combat avec lui. Pas pour le consoler : pour lui montrer ce qui s'est passé.",
    situation: "defaite",
  },
  recadrer: {
    lab: "Lui remettre les pieds sur terre",
    txt: "Vous lui dites qu'il commence à se croire arrivé, et que ça se voit à l'entraînement.",
    situation: "grosse_tete",
  },
  promettre: {
    lab: "Lui promettre un combat",
    txt: "Vous lui dites que le prochain, c'est pour lui. /!\ Si vous ne tenez pas, il s'en souviendra.",
    situation: "sans_combat",
  },
};

/* ==== CINQUANTE REPONSES (Mael, 10/08) ==================================
   "Il nous en faut au moins 50 differentes, que j'aie toujours quelque
   chose de different, et branchees avec consequence."
   /!\ ELLES NE SONT PAS DECORATIVES. Chaque variante est CHOISIE par
   l'etat reel de l'homme — son moral, son caractere, sa serie, son age,
   son entente — et elle vient AVEC son effet (dMoral, dForme, trace
   d'entente). Deux hommes differents ne repondent pas pareil a la meme
   phrase, et le meme homme ne repond pas pareil selon le moment.
   /!\ ET AUCUNE NE MENT : si la phrase dit qu'il se braque, l'entente
   baisse pour de bon. */
const REPONSES = {
  /* /!\ DOUBLEES (Mael, 31/08 : "enrichir les dialogues, les doubler
     au moins"). CHAQUE entree garde SA condition et SES effets — seul
     le texte se decline : t est une LISTE, et c'est LE JOUR qui choisit
     (parler() : t[jour % n]) — deterministe, jamais un tirage. Le meme
     homme dans le meme etat un autre jour ne redit pas mot pour mot la
     meme phrase ; et aucun invariant ne bouge (l'anti-farm du moral, la
     lassitude, l'ordre des conditions). */
  secouer: [
    { si: (c) => c.moral < 0.72 && c.d >= 60,
      t: ["Il baisse les yeux. « Je sais. Je vais corriger ça. » Et il le fera.",
          "Il note deux mots sur son poignet. « Redites-le-moi jeudi si ça n'a pas changé. »"],
      m: +0.04, f: +0.10, tr: "echange_juste" },
    { si: (c) => c.moral < 0.72,
      t: ["Il encaisse sans rien dire. C'était peut-être le mauvais jour.",
          "Il regarde ses bandes en vous écoutant. Le silence dure un peu trop."],
      m: -0.10, f: +0.02, tr: "engueulade_defaite" },
    { si: (c) => c.agr >= 72,
      t: ["« Vous croyez que je ne le sais pas ? » Il sort avant la fin de la phrase.",
          "Il balance sa serviette dans le sac. « Gardez ça pour ceux qui dorment. »"],
      m: -0.08, f: +0.06, tr: "engueulade_defaite" },
    { si: (c) => c.serie >= 3,
      t: ["« J'en ai gagné trois d'affilée. » Il n'a pas tort, et ça s'entend.",
          "Il montre le tableau des résultats du menton. L'argument est là, pas besoin de phrase."],
      m: -0.05, f: +0.02, tr: "echange_rate" },
    { si: (c) => c.d >= 75,
      t: ["Il hoche la tête, note ce que vous dites, et double sa séance du soir.",
          "« Compris. » Le soir même, le sac en prend le double. C'est sa façon de répondre."],
      m: +0.02, f: +0.13, tr: "echange_juste" },
    { si: (c) => c.age >= 33,
      t: ["« À mon âge on ne se secoue plus, on s'économise. » Il n'a pas tort non plus.",
          "Il sourit sans joie. « J'ai plus l'âge des électrochocs, coach. J'ai l'âge des plans. »"],
      m: -0.02, f: +0.03, tr: "echange_neutre" },
    { si: (c) => c.age <= 21,
      t: ["Il vous regarde comme si vous veniez de lui confier quelque chose. Il ne dormira pas.",
          "Il rougit et serre les poings. À cet âge, une phrase pareille dure une semaine."],
      m: +0.06, f: +0.09, tr: "echange_juste" },
    { si: (c) => c.ent < 35,
      t: ["Il vous écoute comme on écoute un inconnu. Vous n'avez pas encore le crédit pour ça.",
          "« C'est noté. » Le ton dit le contraire. Ce genre de phrase se mérite, et pas encore de vous."],
      m: -0.09, f: +0.02, tr: "echange_rate" },
    { si: () => true,
      t: ["Il serre la mâchoire. Le message est passé, le prix aussi.",
          "Il ne répond rien, mais son enchaînement suivant claque plus fort. Message reçu."],
      m: -0.05, f: +0.08, tr: "echange_neutre" },
  ],
  rassurer: [
    /* /!\ RASSURER QUELQU'UN QUI VA BIEN NE SERT A RIEN — invariant du
       banc entente, et il a raison : c'est ce qui empeche le joueur de
       farmer du moral en repetant la meme phrase. La variante doit
       exister DANS la liste, sinon elle tombe sur le cas general. */
    { si: (c) => c.moral >= 1.05,
      t: ["« Je sais, ça va. » Il n'avait pas besoin de vous aujourd'hui.",
          "Il lève un sourcil. « Tout roule, coach. Gardez ça pour un mauvais jour. »"],
      m: +0.01, f: 0, tr: "echange_neutre" },
    { si: (c) => c.moral < 0.70,
      t: ["Il souffle. Il attendait que quelqu'un lui dise exactement ça.",
          "Ses épaules descendent d'un cran. Il portait ça depuis des jours, visiblement."],
      m: +0.18, f: +0.06, tr: "echange_juste" },
    { si: (c) => c.serie === 0 && c.defaites > 0,
      t: ["« Vous dites ça parce que j'ai perdu. » Mais il se tient plus droit en sortant.",
          "« Tout le monde me parle doucement depuis la défaite. » Sauf que venant de vous, ça tient."],
      m: +0.09, f: +0.02, tr: "echange_juste" },
    { si: (c) => c.agr >= 70,
      t: ["« J'ai pas besoin qu'on me rassure. » Il le prend presque mal.",
          "« On se garde les câlins pour l'interview d'après-victoire, ok ? » Mais il a entendu."],
      m: +0.02, f: 0, tr: "echange_neutre" },
    { si: (c) => c.iq >= 70,
      t: ["« Je sais où j'en suis. Mais merci de le dire. » Il apprécie sans en avoir besoin.",
          "« Votre analyse rejoint la mienne. » Il sourit — c'est sa façon de dire merci."],
      m: +0.07, f: +0.02, tr: "echange_juste" },
    { si: (c) => c.ent >= 75,
      t: ["Il sourit. Avec vous, il n'a plus besoin de faire semblant d'aller bien.",
          "« Vous savez toujours quand venir. » Il ne demande même plus comment vous faites."],
      m: +0.14, f: +0.05, tr: "echange_juste" },
    { si: (c) => c.age <= 22,
      t: ["Il a dix-neuf ans et un coach qui croit en lui. Ça se voit sur sa tête.",
          "Il envoie un message à sa mère en sortant du bureau. Vous n'étiez pas censé le voir."],
      m: +0.15, f: +0.07, tr: "echange_juste" },
    { si: (c) => c.d >= 78,
      t: ["« Je sais. Je continue. » Il n'a jamais eu besoin qu'on le pousse.",
          "Il acquiesce et retourne à sa routine, au geste près. C'est ça, sa confiance."],
      m: +0.08, f: +0.04, tr: "echange_juste" },
    { si: () => true,
      t: ["« Ça fait du bien à entendre. » Il repart au sac.",
          "Il ne dit presque rien, mais il traîne dans la salle plus tard que d'habitude."],
      m: +0.10, f: +0.03, tr: "echange_juste" },
  ],
  ecouter: [
    { si: (c) => c.moral < 0.68,
      t: ["Il parle longtemps. Ce n'est pas du sport, c'est le reste — et c'est ça qui pesait.",
          "Ça sort en vrac : le sommeil, la famille, l'argent. Le combat n'arrive qu'à la fin."],
      m: +0.16, f: +0.04, tr: "echange_juste" },
    { si: (c) => c.ent >= 78,
      t: ["Il vous raconte des choses qu'il ne raconte pas. Vous n'êtes plus seulement son coach.",
          "Il commence par « je l'ai jamais dit à personne ». La suite reste entre ces quatre murs."],
      m: +0.12, f: +0.03, tr: "echange_juste" },
    { si: (c) => c.ent < 35,
      t: ["« Ça va. » Trois mots, et il retourne au sac. Vous n'avez pas encore ce droit-là.",
          "Il répond par monosyllabes en regardant la porte. La confiance, ça se construit avant."],
      m: +0.01, f: 0, tr: "echange_neutre" },
    { si: (c) => c.d < 45,
      t: ["Il parle de tout sauf de l'entraînement. Vous comprenez pourquoi il progresse peu.",
          "Vingt minutes sur sa nouvelle voiture. Le sac, lui, attendra encore."],
      m: +0.05, f: -0.02, tr: "echange_neutre" },
    { si: (c) => c.serie >= 2,
      t: ["« En ce moment tout roule. » Il n'y a rien à débloquer aujourd'hui.",
          "Il parle de sa série avec un calme neuf. Gagner, ça simplifie les conversations."],
      m: +0.05, f: +0.02, tr: "echange_neutre" },
    { si: (c) => c.age >= 34,
      t: ["Il parle de l'après. Pas maintenant, mais il y pense — et ça change comment on le prépare.",
          "« Un jour il faudra que je te parle de la suite. » Pas aujourd'hui. Mais le mot est posé."],
      m: +0.08, f: 0, tr: "echange_juste" },
    { si: (c) => c.agr >= 72,
      t: ["« On parle ou on s'entraîne ? » Il n'est pas venu pour ça.",
          "Il écoute trente secondes, tape dans ses gants. « C'est bon ? Je peux y retourner ? »"],
      m: +0.02, f: +0.01, tr: "echange_neutre" },
    { si: () => true,
      t: ["Il parle un moment. Vous comprenez mieux ce qui le bloque en ce moment.",
          "Rien de spectaculaire — mais deux ou trois détails que vous n'auriez pas devinés."],
      m: +0.07, f: +0.03, tr: "echange_juste" },
  ],
  flatter: [
    { si: (c) => c.agr >= 70 || c.d < 45,
      t: ["Il acquiesce comme si c'était une évidence. Il se sait déjà au-dessus — et ça s'entend à l'entraînement.",
          "« Vous avez mis le temps à le voir. » Il le pense vraiment — c'est bien ça l'ennui."],
      m: +0.08, f: -0.03, tr: "flatterie" },
    { si: (c) => c.moral < 0.80,
      t: ["Il n'en avait peut-être jamais entendu autant. Il se redresse.",
          "Il vérifie que vous ne vous moquez pas. Puis quelque chose se rallume."],
      m: +0.16, f: +0.07, tr: "flatterie" },
    { si: (c) => c.serie >= 3,
      t: ["« Je sais. » Deux syllabes, et le vestiaire entier les a entendues.",
          "Il répète votre phrase à voix haute pour que les autres l'entendent. Bon."],
      m: +0.10, f: -0.05, tr: "flatterie" },
    { si: (c) => c.iq >= 72,
      t: ["« Vous me dites ça pourquoi ? » Il n'aime pas qu'on le travaille.",
          "Il plisse les yeux. « C'est quoi la vraie raison de ce compliment ? » Démasqué."],
      m: +0.03, f: -0.01, tr: "echange_neutre" },
    { si: (c) => c.age <= 21,
      t: ["Il gonfle la poitrine sans s'en rendre compte. Il va falloir surveiller ça.",
          "Il enverra la phrase à ses potes ce soir, mot pour mot. À vingt ans ça compte double."],
      m: +0.14, f: -0.02, tr: "flatterie" },
    { si: (c) => c.ent >= 78,
      t: ["Il rit. « Vous me dites ça à moi ? » Entre vous, c'est devenu une blague.",
          "« Attention coach, je vais finir par le croire. » Il le croit déjà, et vous le savez."],
      m: +0.11, f: +0.02, tr: "flatterie" },
    { si: () => true,
      t: ["Ça lui plaît, visiblement. Reste à voir ce qu'il en fera.",
          "Un demi-sourire qu'il essaie de cacher. Le compliment est rentré quelque part."],
      m: +0.09, f: 0, tr: "flatterie" },
  ],
  relancer: [
    { si: (c) => c.moral < 0.70,
      t: ["Vous repassez le combat avec lui. À la fin il ne parle plus de la défaite, il parle du prochain.",
          "Vous posez la feuille du combat entre vous deux. Round par round, la défaite devient une leçon."],
      m: +0.24, f: +0.06, tr: "echange_juste" },
    { si: (c) => c.agr >= 70,
      t: ["« Je veux le revoir. » C'est tout ce qu'il retient — mais il a écouté le reste.",
          "« Le jour où on le recroise, je veux être prêt. » La rage a trouvé une direction."],
      m: +0.16, f: +0.08, tr: "echange_juste" },
    { si: (c) => c.iq >= 68,
      t: ["Il avait déjà tout analysé seul. Vous confirmez, et ça suffit à tourner la page.",
          "Il vous devance sur chaque point. Vous n'apportez qu'une chose : la permission de passer à autre chose."],
      m: +0.14, f: +0.04, tr: "echange_juste" },
    { si: (c) => c.age >= 33,
      t: ["« À un moment il faudra savoir. » Il ne dit pas quoi. Vous savez quoi.",
          "Il regarde ses mains un long moment. « Encore une ou deux comme ça et on se reparle. »"],
      m: +0.06, f: 0, tr: "echange_juste" },
    { si: (c) => c.defaites >= 3,
      t: ["C'est la troisième fois que vous avez cette conversation. Lui aussi l'a remarqué.",
          "« Vous allez me refaire le discours ? » Il le connaît par cœur. C'est ça qui inquiète."],
      m: +0.05, f: +0.02, tr: "echange_neutre" },
    { si: () => true,
      t: ["Il repart avec quelque chose à corriger plutôt qu'avec une défaite sur le dos.",
          "En sortant, il demande à revoir un enchaînement précis. La défaite est devenue du travail."],
      m: +0.14, f: +0.05, tr: "echange_juste" },
  ],
  recadrer: [
    { si: (c) => c.agr >= 72,
      t: ["« C'est moi qui gagne, je vous rappelle. » Il claque la porte. Il sera là demain.",
          "Il vous fixe trois secondes de trop, ramasse son sac, sort. Demain il arrivera le premier — par défi."],
      m: -0.14, f: +0.03, tr: "engueulade_defaite" },
    { si: (c) => c.iq >= 70,
      t: ["Il ne répond pas tout de suite. « Vous avez raison. » Ça lui coûte de le dire.",
          "Il refait le fil de ses dernières semaines à voix haute — et arrive à votre conclusion tout seul."],
      m: -0.05, f: +0.08, tr: "echange_rate" },
    { si: (c) => c.d < 45,
      t: ["« Ouais ouais. » Il n'a rien entendu. Vous le reverrez.",
          "Il regarde son téléphone pendant que vous parlez. Voilà, exactement ça, le problème."],
      m: -0.06, f: +0.01, tr: "echange_rate" },
    { si: (c) => c.ent >= 75,
      t: ["Venant de vous, ça porte. Il ne discute même pas.",
          "« Si c'est vous qui le dites, c'est que c'est vrai. » Il encaisse et corrige."],
      m: -0.03, f: +0.09, tr: "echange_rate" },
    { si: (c) => c.serie >= 4,
      t: ["Quatre victoires de suite et on vient lui parler comme ça. Il ne comprend pas — et c'est bien le problème.",
          "« Montrez-moi UN truc qui ne marche pas en ce moment. » Le succès l'a rendu sourd."],
      m: -0.12, f: +0.04, tr: "engueulade_defaite" },
    { si: () => true,
      t: ["Il ne dit rien. Le lendemain, il est le premier à la salle.",
          "Un silence, un hochement de tête. Le lendemain, ses temps de retard ont disparu."],
      m: -0.04, f: +0.06, tr: "echange_rate" },
  ],
  promettre: [
    { si: (c) => c.moral < 0.72,
      t: ["« Vous me le promettez ? » Il a besoin d'y croire. Maintenant vous êtes tenu.",
          "Il vous fait répéter, mot pour mot. Puis il range la phrase quelque part où elle ne bougera plus."],
      m: +0.24, f: +0.05, tr: "affiche_voulue" },
    { si: (c) => c.ent < 40,
      t: ["« On verra. » Il ne vous croit pas encore. À vous de lui donner tort.",
          "« Les promesses, j'en ai déjà eu des coachs. » Celui-là a été échaudé ailleurs."],
      m: +0.10, f: +0.02, tr: "affiche_voulue" },
    { si: (c) => c.agr >= 70,
      t: ["« Enfin. » Il attendait ça depuis des semaines et il ne le cachait pas.",
          "Il frappe dans ses mains, une fois, fort. Le vestiaire entier sait qu'il a son combat."],
      m: +0.22, f: +0.06, tr: "affiche_voulue" },
    { si: (c) => c.age >= 33,
      t: ["« Il ne m'en reste pas beaucoup. Ne me le faites pas attendre. »",
          "« À mon âge, chaque promesse a une date de péremption. » Il sourit, mais il compte."],
      m: +0.18, f: +0.03, tr: "affiche_voulue" },
    { si: (c) => c.serie >= 3,
      t: ["« Un vrai, cette fois. » Il ne veut plus des gars qu'on lui donne pour gagner.",
          "« Quelqu'un de mon niveau. Ou au-dessus. » La série lui a donné le droit de choisir ses mots."],
      m: +0.20, f: +0.05, tr: "affiche_voulue" },
    { si: () => true,
      t: ["Il vous regarde différemment en sortant. Maintenant il attend.",
          "Il ne dit rien de spécial — mais il s'entraîne le soir même comme si la date était posée."],
      m: +0.20, f: +0.04, tr: "affiche_voulue" },
  ],
};

/** La premiere variante dont la condition est vraie. */
function choisirReponse(app, ctx) {
  const liste = REPONSES[app];
  if (!liste) return null;
  for (const r of liste) { try { if (r.si(ctx)) return r; } catch (e) {} }
  return liste[liste.length - 1];
}

/**
 * Parler. Rend la reaction, le mouvement d'entente, et les effets sur le
 * moral et la forme.
 *
 * @param {object} f      la fiche du combattant (f.mental lu, f.mental.discipline
 *                        eventuellement MODIFIE par la flatterie)
 * @param {object} etat   { entente, moral (0-1,3), forme, dernierEchange (jour) }
 * @param {string} app    cle d'APPROCHES
 * @param {number} jour
 */
function parler(f, etat, app, jour) {
  const a = APPROCHES[app];
  let effet = null;
  if (!a) throw new Error(`dialogue.js : approche inconnue "${app}"`);
  const d = f.mental.discipline, iq = f.mental.fight_iq, agr = f.mental.aggression;
  const moral = etat.moral !== undefined ? etat.moral : 1.0;

  // /!\ LA LASSITUDE : reparler tous les jours ne construit rien. Ce
  // n'est pas une limite posee pour brider — c'est qu'un homme a qui on
  // parle sans arret finit par ne plus ecouter.
  const recent = etat.dernierEchange !== undefined
    && jour - etat.dernierEchange < LASSITUDE;

  let dMoral = 0, dForme = 0, txt = "", trace = "echange_neutre";

  /* /!\ LES CINQUANTE REPONSES SONT LE SEUL CHEMIN (10/08). L'ancien
     corps enchainait des if/else avec 17 phrases en dur : ajouter des
     variantes sans le remplacer les aurait laissees MORTES, comme
     `sortirApres` l'a ete pendant tout un chantier. Ici on CHOISIT dans
     REPONSES, et la variante apporte son texte ET ses effets. */
  const ctx = {
    moral, d, agr, iq: f.mental.fight_iq,
    serie: etat.serie || 0, defaites: etat.defaites || 0,
    age: etat.age || 26,
    ent: (etat.entente && etat.entente.valeur !== undefined) ? etat.entente.valeur : 50,
  };
  const rep = choisirReponse(app, ctx);
  /* /!\ LE JOUR CHOISIT LA FORMULATION (31/08) : meme condition, memes
     effets, plusieurs facons de le dire — t est une liste, jour % n la
     departage. Deterministe : pas un tirage, et l'ordre des conditions
     (les invariants du banc entente) ne bouge pas. */
  if (rep) { txt = Array.isArray(rep.t) ? rep.t[jour % rep.t.length] : rep.t;
             dMoral = rep.m; dForme = rep.f; trace = rep.tr; }
  if (app === "recadrer") { f.mental.discipline = Math.min(99, d + 6); effet = "recadre"; }
  else if (app === "promettre") effet = "promesse";
  else if (app === "relancer") effet = "releve";
  else if (app === "ecouter") etat.observations = Math.min(10, (etat.observations || 0) + 2);

  // La lassitude ecrase l'effet, sans l'inverser.
  if (recent) {
    dMoral *= 0.25; dForme *= 0.25;
    if (trace === "echange_juste") trace = "echange_neutre";
    txt += " (Vous lui avez déjà parlé il y a peu — ça glisse.)";
  }

  const mouvement = EN.bouger(etat.entente, trace, f);

  etat.moral = Math.max(0.45, Math.min(1.30, moral + dMoral));
  etat.forme = Math.max(0.55, Math.min(1.25, (etat.forme !== undefined ? etat.forme : 1) + dForme));
  etat.dernierEchange = jour;

  return { approche: app, intro: a.txt, texte: txt, effet,
           dMoral, dForme, trace, mouvement,
           // /!\ LA GROSSE TETE SE VOIT : on rend le cout pour que
           // l'ecran puisse le dire sans afficher un chiffre.
           cout: mouvement.cout && mouvement.cout.discipline
             ? "Il se croit un peu plus arrivé qu'hier." : null };
}

/**
 * L'avis du coach sur l'etat de la relation — EN MOTS, jamais en chiffre
 * (meme regle que la relation aux orgas et le potentiel cache).
 */
function avis(etat) {
  const p = EN.lire(etat.entente.valeur);
  const n = etat.entente.histoire.length;
  if (n < 4) return "Vous ne vous connaissez pas encore vraiment.";
  return p.mot.charAt(0).toUpperCase() + p.mot.slice(1) + ".";
}

/**
 * CE QU'ON PEUT LUI DIRE AUJOURD'HUI. Les quatre approches generales sont
 * toujours la ; les dialogues de situation n'apparaissent QUE si la
 * situation existe vraiment — on ne releve pas un homme qui vient de
 * gagner, on ne promet pas un combat a un homme qui en a deja un.
 */
function ouvertes(f, ctx = {}) {
  const out = [];
  for (const [cle, a] of Object.entries(APPROCHES)) {
    if (!a.situation) { out.push(cle); continue; }
    if (a.situation === "defaite" && ctx.vientDePerdre) out.push(cle);
    if (a.situation === "grosse_tete"
        && (f.mental.aggression >= 68 || f.mental.discipline < 50)
        && (ctx.serie || 0) >= 2) out.push(cle);
    if (a.situation === "sans_combat" && !ctx.combatPrevu && ctx.org) out.push(cle);
  }
  return out;
}

module.exports = { APPROCHES, LASSITUDE, parler, avis, ouvertes };

});

/* ===== demandes.js =================================================== */
__def("demandes.js", function (module, exports, require) {
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

});

/* ===== contrats.js =================================================== */
__def("contrats.js", function (module, exports, require) {
/**
 * contrats.js — CE QUI TE LIE A UNE ORGANISATION, ET CE QUI TE LIBERE.
 *
 * Module natif JS, tenu par invariants (banc 26). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LES REGLES ETAIENT DEJA GRAVEES AU CARNET — ON NE LES REINVENTE PAS
 * ===================================================================
 *   - un contrat porte TROIS COMBATS ;
 *   - AUCUNE SORTIE AVANT LA FIN, sauf rachat par une autre organisation,
 *     et c'est RARE (le phenomene qu'on vient arracher) ;
 *   - DEVENIR CHAMPION ROUVRE LE CONTRAT meme s'il reste des combats :
 *     une ceinture ne se paie pas au tarif d'un inconnu ;
 *   - a la fin, TOUTES LES ORGANISATIONS EVALUENT — pas de chemin oblige.
 *     Elles ne voient que LA TRACE (bilan, serie, notoriete), jamais le
 *     niveau ;
 *   - ce qu'il te demande pour rester est ESCOMPTE PAR L'ENTENTE
 *     (entente.prixPourRester) ;
 *   - et L'ENTENTE AMORTIT LE DEPART, ELLE NE LE BLOQUE PAS
 *     (entente.tentation) : devant une offre enorme, on ne le retient pas.
 */

const CL = require("./classement.js");
const EN = require("./entente.js");
const O = require("./offres.js");
const SA = require("./salle.js");   // ORG_DEPART : le circuit du pays de la salle

/** Un contrat neuf. */
/* ==== LES MATCHMAKERS (conception de Mael, 10/08) =======================
   "Les matchmakers, oui — ça aide, ça n'ouvre pas les portes
   complètement."
   Chaque organisation a UN homme qui decide, avec un nom et un
   caractere. Il ne regarde pas que le dossier du combattant qu'on lui
   presente : IL REGARDE CE QUE TES AUTRES HOMMES VALENT CHEZ LUI. Un
   quasi-champion dans son organisation te rend credible pour le suivant.
   /!\ MAIS CA AIDE SEULEMENT — arbitrage explicite de Mael. Les seuils
   d'entree (radar, serie, division, place au roster) NE SAUTENT PAS. La
   reputation deplace une chance, elle ne fabrique pas un dossier. */
/**
 * CE QUE TES AUTRES HOMMES VALENT CHEZ EUX — de 0 a 1.
 * /!\ PLAFONNE : meme avec cinq champions, on ne depasse pas 1. Et ca
 * AIDE seulement (arbitrage Mael) : les seuils d'entree ne sautent pas.
 */
function reputationChez(m, org, moi) {
  if (!m || !m.pros) return 0;
  let s = 0;
  for (const l of m.pros.values()) {
    if (!l.salle || l.org !== org) continue;      // seulement TES hommes, chez EUX
    if (moi && l.id === moi.id) continue;         // il ne se recommande pas lui-meme
    if (l.champion) s += 0.55;
    else if (l.rang !== null && l.rang <= 5) s += 0.32;
    else if (l.rang !== null) s += 0.18;
    else s += 0.06;
    s += Math.min(0.12, (l.bilan.serie || 0) * 0.03);
  }
  return Math.min(1, s);
}

/** Ce que le matchmaker DIT de toi — jamais un chiffre. */
function avisMatchmaker(m, org, moi) {
  const r = reputationChez(m, org, moi), mm = CL.matchmakerDe(org);
  const mot = r >= 0.7 ? `${mm.nom} décroche quand tu appelles.`
    : r >= 0.4 ? `${mm.nom} connaît ton travail — ça compte un peu.`
    : r >= 0.15 ? `${mm.nom} sait qui tu es, sans plus.`
    : `${mm.nom} ne t'a jamais vu.`;
  return { nom: mm.nom, trait: mm.trait, mot, phrase: mm.mot, force: r };
}

const NEUF = 3;

/** Le delai de reflexion d'une proposition de contrat, en jours. */
const DELAI = 14;

/**
 * L'etat contractuel d'un homme, en clair.
 * @returns {object} { org, restants, statut }
 *   statut : "en_cours" | "dernier" | "libre" | "rouvert"
 */
function etat(l) {
  const v = l.vie || {};
  const restants = v.restants !== undefined ? v.restants : 0;
  if (!l.org) return { org: null, restants: 0, statut: "libre" };
  // /!\ LA CEINTURE ROUVRE TOUT : meme avec des combats au contrat, un
  // champion renegocie. C'est la regle du carnet, et c'est le reel.
  if (l.champion && !v.ceintureNegociee)
    return { org: l.org, restants, statut: "rouvert" };
  if (restants <= 0) return { org: l.org, restants: 0, statut: "libre" };
  if (restants === 1) return { org: l.org, restants, statut: "dernier" };
  return { org: l.org, restants, statut: "en_cours" };
}

/**
 * Ce que vaut un homme pour une organisation donnee — /!\ SUR LA TRACE
 * SEULEMENT. C'est la bourse du bareme, majoree par ce qu'il a montre.
 */
function valeurChez(l, org, m) {
  /* /!\ ET SUR LE PRIX : jusqu'a +12 %. Un manager dont les hommes
     gagnent chez eux negocie mieux pour le suivant. */
  const [base] = CL.bourse(org, l.rang, l.champion, l.notoriete);
  const serie = Math.min(5, (l.bilan && l.bilan.serie) || 0);
  const rep = m ? reputationChez(m, org, l) : 0;
  return Math.round(base * (1 + serie * 0.06) * (1 + rep * 0.12));
}

/**
 * QUI VEUT DE LUI. Toutes les organisations evaluent — la sienne comprise.
 * /!\ TROIS CONDITIONS, LES MEMES QUE POUR UNE SIGNATURE NPC : elles
 * doivent le VOIR (notoriete >= radar), sa serie doit passer leur barre,
 * et elles doivent avoir de la place. Pas de chemin oblige : une
 * internationale peut cueillir un homme d'une nationale.
 * @returns {object[]} propositions triees, la meilleure d'abord
 */
function pretendants(m, l, jour) {
  const sortie = [];
  for (const cle of Object.keys(CL.ORGS)) {
    const o = CL.ORGS[cle];
    const sienne = cle === l.org;
    // Le radar : en dessous, on n'existe pas pour elle.
    if (!sienne && l.notoriete < o.portee * 0.4) continue;
    if (!sienne && (l.bilan.serie || 0) < CL.serieRequise(cle, l.notoriete)) continue;
    if (!sienne && m && m.rosters[cle] && m.rosters[cle][l.division]
        && m.rosters[cle][l.division].length >= 34) continue;
    const bourse = valeurChez(l, cle);
    sortie.push({
      org: cle, nom: o.nom, sienne, bourse, combats: NEUF,
      expire: jour + DELAI,
      // /!\ CE QU'ELLE PROPOSE EST CE QU'ELLE PAIERA (regle 7) : la
      // bourse du bareme, pas un chiffre d'affichage.
      total: bourse * NEUF,
    });
  }
  sortie.sort((a, b) => b.bourse - a.bourse);
  return sortie;
}

/**
 * CE QUE LUI EN PENSE. /!\ IL N'EST PAS UN OBJET : il a un avis, et
 * parfois il a deja decide. L'entente amortit, elle ne bloque pas.
 * @param {object} l        le combattant (porte l.entente)
 * @param {object} choix    la proposition que TU veux accepter
 * @param {object[]} toutes toutes les propositions
 * @param {number} [tirage] pour les bancs : force le hasard
 */
function sonAvis(l, choix, toutes, tirage) {
  const e = l.entente || EN.etatDepart();
  const meilleure = toutes.reduce((a, b) => (b.bourse > a.bourse ? b : a), toutes[0]);
  const p = EN.lire(e.valeur);

  // Tu lui proposes de rester chez lui alors que mieux existe ailleurs ?
  if (choix.sienne && meilleure && !meilleure.sienne && meilleure.bourse > choix.bourse) {
    /* /!\ ON COMPARE EN POURCENTAGE, PAS EN EUROS. Passer des bourses
       brutes a tentation() rendait l'entente insignifiante : 60 points
       d'entente ne pesaient rien face a un ecart de 15 000 €. En
       pourcentage, l'entente peut absorber jusqu'a ~60 % d'ecart de
       salaire — au-dela, il part, et c'est juste. */
    const ecart = (meilleure.bourse - choix.bourse) / Math.max(1, choix.bourse) * 100;
    const t = EN.tentation(e, ecart, 0, tirage);
    if (t.deja_decide)
      return { accepte: false, deja_decide: true,
               mot: `Il a déjà donné sa parole à ${meilleure.nom}. Ça ne se rattrape pas.`,
               degat_reputation: t.degat_reputation };
    if (t.part)
      return { accepte: false, deja_decide: false,
               mot: `Il ne comprend pas. ${meilleure.nom} paie mieux, et il le sait — ${t.maniere}.`,
               degat_reputation: t.degat_reputation };
    return { accepte: true, mot: `Il te suit, même si ce n'est pas le plus gros chèque. ${p.mot.charAt(0).toUpperCase() + p.mot.slice(1)}.` };
  }
  return { accepte: true,
           mot: choix.sienne ? "Il resigne sans discuter."
                             : `${choix.nom}, ça lui va. Il veut voir plus haut.` };
}

/**
 * CE QU'IL DEMANDE POUR RESTER — escompte par l'entente
 * (entente.prixPourRester). Deux ans de bonne relation valent une vraie
 * remise ; en froid, il exige plus que le marche.
 */
function prixDeSaFidelite(l, propositions) {
  const e = l.entente || EN.etatDepart();
  const ailleurs = propositions.filter(p => !p.sienne);
  if (!ailleurs.length) return null;
  const meilleure = ailleurs.reduce((a, b) => (b.bourse > a.bourse ? b : a));
  return { concurrent: meilleure, exige: EN.prixPourRester(e, meilleure.bourse) };
}

/** Signer. Pose le contrat, deplace l'homme si l'organisation change. */
function signer(m, l, proposition, jour) {
  const avant = l.org;
  if (m && avant && m.rosters[avant] && m.rosters[avant][l.division]) {
    const r = m.rosters[avant][l.division];
    const i = r.indexOf(l.id);
    if (i >= 0 && avant !== proposition.org) r.splice(i, 1);
  }
  if (avant !== proposition.org) {
    l.org = proposition.org;
    // /!\ ON REPART NON CLASSE : un rang ne se transporte pas d'une
    // organisation a l'autre. C'est le prix du changement de maison.
    l.rang = null; l.champion = false;
  }
  // /!\ ON S'ASSURE TOUJOURS DE LA PRESENCE AU ROSTER, meme quand
  // l'organisation ne change pas : un homme tout juste passe pro portait
  // deja le nom de sa nationale sans y etre inscrit, et il signait dans
  // le vide (trouve en jouant, 09/08).
  if (m && m.rosters[l.org] && m.rosters[l.org][l.division]
      && !m.rosters[l.org][l.division].includes(l.id))
    m.rosters[l.org][l.division].push(l.id);
  if (!l.vie) l.vie = {};
  l.vie.restants = proposition.combats;
  l.vie.bourseContrat = proposition.bourse;
  l.vie.signeLe = jour;
  if (l.champion) l.vie.ceintureNegociee = true;
  return { org: l.org, restants: l.vie.restants, bourse: proposition.bourse };
}

/**
 * LE RACHAT — /!\ RARE, ET RESERVE AU PHENOMENE. Une organisation paie
 * pour l'arracher AVANT la fin de son contrat. Le carnet dit : une ou
 * deux fois par generation.
 * @returns {object|null} la proposition de rachat, ou null
 */
function rachat(m, l, jour, tirage) {
  const st = etat(l);
  if (st.statut === "libre" || st.restants <= 0) return null;
  // Il faut etre un phenomene : gros elan et deja tres vu.
  if ((l.bilan.serie || 0) < 5 || l.notoriete < 55) return null;
  const hauts = pretendants(m, l, jour).filter(p => !p.sienne
    && CL.ORGS[p.org].portee > CL.ORGS[l.org].portee);
  if (!hauts.length) return null;
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > 0.12) return null;                   // rare, meme quand tout est reuni
  const p = hauts[0];
  return Object.assign({}, p, { rachat: true, indemnite: Math.round(p.bourse * 1.5) });
}

/* ==================================================================== */
/* /!\ DEUX CONTRATS, PAS UN (correction de Mael, 09/08)                 */
/* ==================================================================== */
/* J'avais fusionne deux choses qui n'ont rien a voir :                   */
/*   1. LE CONTRAT DE SALLE — entre TOI et LUI : combien de combats il    */
/*      te doit, et quelle PART tu prends sur ses bourses. C'est ca que   */
/*      l'entente escompte, et c'est ca qu'il renegocie quand il monte.   */
/*   2. L'ENGAGEMENT EN ORGANISATION — c'est TOI qui vas la demarcher     */
/*      pour lui, avec des chances de reussite CACHEES. Et parfois une    */
/*      organisation t'approche d'elle-meme.                              */
/* L'ORDRE DU JEU : il passe pro -> on negocie le contrat de salle -> tu  */
/* lui trouves une organisation -> il peut combattre.                     */

/** La part que prend la salle par defaut, et les bornes du negociable. */
const PART_DEFAUT = 0.20, PART_MIN = 0.05, PART_MAX = 0.30;

/** La duree d'un contrat de salle, EN COMBATS. /!\ 2 A 4, PAS PLUS
 *  (Mael, 14/08 : "8 ca fait trop, 2 a 4 max"). On quitte son gym quand
 *  on veut dans le reel — l'engagement court est la regle, pas l'exception. */
const DUREE_MIN = 2, DUREE_MAX = 4;

/* ==================================================================== */
/* LES FRAIS DE DOSSIER (Mael, 14/08) — PAS UN SALAIRE.                 */
/* La salle ne paie jamais l'homme : elle paie LES PAPIERS. L'avocat qui */
/* redige, le manager licencie, l'administratif. Une somme FIXE, a la    */
/* signature et a chaque renouvellement — jamais pendant.                */
/* /!\ FIXE PAR PALIER, PAS EN POURCENTAGE : un accord de pre-prelims,   */
/* c'est trois pages ; un top 5 avec sponsors et droits d'image, c'est   */
/* un cabinet. Le palier se lit sur SON STANDING DU JOUR — un homme qui  */
/* monte coute plus cher a re-signer, comme en vrai.                     */
/* ==================================================================== */
const FRAIS_DOSSIER = {
  regional:      500,   // sans organisation, ou nationale non classe
  confirme:     1500,   // classe, ou roster europeen
  international: 4000,  // roster GFL/AFC hors top 10
  elite:        10000,  // top 10 ou champion : clauses, negociation longue
};

/** Le palier de frais d'un homme, lu sur son standing du jour. */
function fraisDossier(l) {
  /* /!\ LE PALIER SE PONDERE PAR L'ORGANISATION (Mael, 21/08 : "il me
     demande 10k pour le re-signer" — pour un top 10 d'Hexagone !). Le
     rang seul decidait : un top 10 de nationale coutait comme un top 10
     mondial. Le standing, c'est le rang DANS SON MONDE : en nationale,
     un classe reste un dossier confirme (1 500), un champion vaut le
     cabinet international (4 000) ; l'elite (10 000) est reservee aux
     rosters internationaux. */
  const o = l.org ? CL.ORGS[l.org] : null;
  const niv = o ? o.niveau : null;
  if (niv === "internationale") {
    if (l.champion || (l.rang != null && l.rang <= 10)) return FRAIS_DOSSIER.elite;
    return FRAIS_DOSSIER.international;
  }
  if (niv === "européenne") {
    if (l.champion) return FRAIS_DOSSIER.international;
    return FRAIS_DOSSIER.confirme;
  }
  if (o) { // nationale
    if (l.champion) return FRAIS_DOSSIER.international;
    if (l.rang != null) return FRAIS_DOSSIER.confirme;
  }
  return FRAIS_DOSSIER.regional;
}

/** Le contrat de salle d'un homme. Vit sur lui, pas sur le monde. */
function contratSalle(l) {
  return l.contratSalle || null;
}

/**
 * CE QU'IL ACCEPTE DE TOI. /!\ SA REACTION SORT DE L'ENTENTE ET DE CE
 * QUE TU LUI PRENDS — pas d'un tirage. Une part elevee passe quand il te
 * fait confiance ; en froid, il la refuse.
 * @returns {object} { accepte, mot, exigee }
 */
function avisSurPart(l, part, combats) {
  const e = l.entente || EN.etatDepart();
  // Ce qu'il trouverait normal : 20 % chez un coach quelconque, moins
  // s'il ne t'aime pas, plus s'il te doit tout.
  const tolere = PART_DEFAUT + (e.valeur - 50) / 100 * 0.14;
  const trop = part - tolere;
  // Un contrat long se paie aussi : plus tu l'engages, plus il regarde.
  const poids = trop + Math.max(0, combats - 3) * 0.012;
  if (poids <= 0)
    return { accepte: true, exigee: part,
             mot: part <= tolere - 0.04 ? "Il n'en revient pas. Il signe tout de suite."
                                        : "Ça lui va." };
  if (poids <= 0.05)
    return { accepte: true, exigee: part,
             mot: "Il trouve ça cher, mais il signe." };
  return { accepte: false, exigee: Math.round(tolere * 100) / 100,
           mot: `Il refuse. Il ne descend pas en dessous de ${Math.round((1 - tolere) * 100)} % pour lui.` };
}

/** Signer le contrat de salle. /!\ LA DUREE EST BORNEE ICI, pas a
 *  l'ecran : un appel de code qui passerait 8 signerait quand meme 4. */
function signerSalle(l, part, combats, jour) {
  const n = Math.max(DUREE_MIN, Math.min(DUREE_MAX, combats));
  l.contratSalle = { part, combats: n, restants: n, signeLe: jour };
  return l.contratSalle;
}

/** Le contrat de salle est-il ECHU ? Un contrat echu ne lie plus :
 *  pas de demarchage en son nom, et PAS DE PART sur ses bourses —
 *  on ne preleve pas sans accord. C'est l'incitation a re-signer. */
function salleEchue(l) {
  const cs = l.contratSalle;
  return !!cs && cs.restants <= 0;
}

/* ==================================================================== */
/* LE DEMARCHAGE — /!\ LES CHANCES SONT CACHEES (Mael).                 */
/* Tu envoies son dossier, tu ne sais pas ce qu'ils en feront. Ce que tu  */
/* peux lire, c'est ce que TOUT LE MONDE lit : sa trace.                  */
/* ==================================================================== */

/**
 * La probabilite qu'une organisation le prenne. JAMAIS AFFICHEE — elle
 * sert au tirage, et l'ecran n'en montre qu'une appreciation grossiere.
 */
/* /!\ UNE NATIONALE ETRANGERE PREND DES LOCAUX (Mael, 21/08 : "pour un
 * contrat a 1000 € combattre en Russie ?"). La Taiga FC ne fait pas
 * voyager un inconnu de l'autre bout du continent pour une petite
 * bourse — elle paie local, comme dans le reel. La porte s'ouvre quand
 * l'homme VAUT le deplacement : notoriete au niveau de la portee de
 * l'organisation. Les europeennes prennent leur continent, les
 * internationales prennent le monde — rien ne change pour elles. */
function prendDesLocaux(o, l) {
  return o.niveau && o.niveau.startsWith("nationale")
    && o.pays !== "France"
    && (l.notoriete || 0) < o.portee;
}

function chanceDe(m, l, org) {
  const o = CL.ORGS[org];
  if (prendDesLocaux(o, l)) return 0.02;
  const radar = o.portee * 0.4;
  // Il faut d'abord qu'elle le voie.
  let p = 0.05;
  if (l.notoriete >= radar) p += 0.35;
  else p += 0.30 * (l.notoriete / Math.max(1, radar));
  // Sa serie et son bilan parlent pour lui.
  p += Math.min(0.30, (l.bilan.serie || 0) * 0.07);
  const ratio = (l.bilan.v + 1) / (l.bilan.v + l.bilan.d + 2);
  p += (ratio - 0.5) * 0.35;
  // Et la place : une organisation pleine ne prend personne.
  if (m && m.rosters[org] && m.rosters[org][l.division]) {
    const n = m.rosters[org][l.division].length;
    /* /!\ LA CIBLE COMPTE LES TETES D'AFFICHE (10/08). Depuis qu'elles
       s'ajoutent en tete de leur division (cas 40), l'AFC poids leger
       compte 51 hommes pour une cible de 50 : l'organisation etait
       declaree PLEINE en permanence, et signer y devenait plus dur
       qu'avant sans que rien ne le justifie. Mesure : un champion maison
       faisait 41 % -> 51 %, puis 21 % des que le roster passait a 52. */
    const etoiles = [...m.pros.values()]
      .filter(x => x.etoile && x.org === org && x.division === l.division).length;
    const cible = (org === "AFC" ? 50 : 30) + etoiles;
    if (n >= cible + 2) p -= 0.30;
    else if (n < cible - 1) p += 0.08;
  }
  // Plus l'organisation est haute, plus c'est dur.
  p -= (o.portee - 40) / 100 * 0.42;
  /* /!\ LE MATCHMAKER TE CONNAIT — ET CA AIDE, RIEN DE PLUS (arbitrage
     Mael). Au mieux +0,18 : de quoi transformer un dossier limite en
     dossier accepte, jamais de quoi faire signer un homme qui n'a rien
     a montrer. Les seuils d'entree restent ou ils sont. */
  p += reputationChez(m, org, l) * 0.18;
  // /!\ LA PORTE REGIONALE (arbitrage Mael, 10/08, option C). Un pro
  // fraichement passe (sans maison, notoriete nulle) etait refuse
  // PARTOUT : radar a 16 minimum, serie pro exigee, et meme la plus
  // petite orga n'etait qu'un jet de des. Verrou ferme a vie — il ne
  // peut pas gagner de notoriete sans combattre, ni combattre sans orga.
  // LE CIRCUIT REGIONAL SIGNE DES DEBUTANTS TOUTE L'ANNEE : la plus
  // petite organisation prend un homme libre dont la trace est positive
  // (plus de victoires que de defaites, amateur compris). Elle regarde
  // quand meme la trace : un 0-3 reste un pari perdu d'avance.
  if (!l.org && org === porteRegionale()) {
    if ((l.bilan.v || 0) > (l.bilan.d || 0)) p = Math.max(p, 0.85);
    /* /!\ L'ENTREE S'OUVRE AUX 0-0 (Mael, 21/08 : "Hexagone c'est trop
       dur, c'est une entree") : un debutant sans trace n'etait qu'un jet
       de des. Le circuit d'entree signe aussi les dossiers vierges —
       moins volontiers qu'une trace positive, mais il signe. */
    else if ((l.bilan.v || 0) >= (l.bilan.d || 0)) p = Math.max(p, 0.55);
  }
  return Math.max(0.02, Math.min(0.92, p));
}

/**
 * LA PORTE DU CIRCUIT — /!\ CELLE DU PAYS DE LA SALLE, pas la plus
 * petite du monde. Apres la construction du monde, la plus petite orga
 * est une nationale etrangere (SWE_N, portee 30) : un debutant de
 * Marseille ne va pas faire ses debuts en Suede. La porte est
 * ORG_DEPART (salle.js) — le circuit national de la maison. Repli sur
 * la plus petite portee si jamais il n'existait pas.
 */
function porteRegionale() {
  if (SA.ORG_DEPART && CL.ORGS[SA.ORG_DEPART]) return SA.ORG_DEPART;
  let cle = null, portee = Infinity;
  for (const k of Object.keys(CL.ORGS))
    if (CL.ORGS[k].portee < portee) { cle = k; portee = CL.ORGS[k].portee; }
  return cle;
}

/** Ce que l'ecran a le droit de dire — /!\ JAMAIS LE POURCENTAGE. */
function lireChance(p) {
  if (p >= 0.65) return "ils devraient dire oui";
  if (p >= 0.42) return "ça peut passer";
  if (p >= 0.22) return "c'est loin d'être gagné";
  return "autant dire non";
}

/**
 * Envoyer son dossier. Rend la reponse — /!\ TIREE, PAS CHOISIE.
 * @param {number} [tirage] pour les bancs
 */
function demarcher(m, l, org, jour, tirage) {
  if (l.org) return { pris: false, mot: `${l.nom} est déjà engagé à ${l.org}.` };
  if (prendDesLocaux(CL.ORGS[org], l))
    return { pris: false, org,
             mot: `${CL.ORGS[org].nom} — « On prend des locaux. Reviens quand son nom traversera les frontières. »` };
  const p = chanceDe(m, l, org);
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > p)
    return { pris: false, org,
             mot: `${CL.ORGS[org].nom} ne donne pas suite pour le moment.` };
  // /!\ SOUS LE RADAR, ON SIGNE AU RABAIS (arbitrage Mael, 10/08,
  // option C) : une organisation qui ne te voyait pas et qui dit oui
  // parce que TU es venu frapper ne paie pas le bareme. 70 % — un
  // inconnu ne negocie pas.
  const sousRadar = l.notoriete < CL.ORGS[org].portee * 0.4;
  const bourse = sousRadar
    ? Math.round(valeurChez(l, org) * 0.7)
    : valeurChez(l, org);
  return { pris: true, org, bourse, combats: NEUF,
           mot: sousRadar
             ? `${CL.ORGS[org].nom} le prend au rabais — ${bourse.toLocaleString("fr-FR")} € par combat. Un inconnu ne négocie pas.`
             : `${CL.ORGS[org].nom} le prend — ${bourse.toLocaleString("fr-FR")} € par combat.` };
}

/**
 * UNE ORGANISATION T'APPROCHE. /!\ RARE, ET SEULEMENT S'IL BRILLE : on
 * ne vient pas chercher un inconnu. Appelee au fil des jours.
 */
function approche(m, l, jour, tirage) {
  if (l.org || l.amateur) return null;
  const candidats = Object.keys(CL.ORGS)
    .filter(c => l.notoriete >= CL.ORGS[c].portee * 0.4)
    .sort((a, b) => CL.ORGS[b].portee - CL.ORGS[a].portee);
  if (!candidats.length) return null;
  const r = tirage !== undefined ? tirage : Math.random();
  if (r > 0.10) return null;
  const org = candidats[0];
  return { org, bourse: valeurChez(l, org), combats: NEUF,
           mot: `${CL.ORGS[org].nom} te contacte au sujet de ${l.nom}.` };
}

module.exports = { NEUF, DELAI, PART_DEFAUT, PART_MIN, PART_MAX,
                   DUREE_MIN, DUREE_MAX, FRAIS_DOSSIER, fraisDossier,
                   etat, valeurChez, pretendants, sonAvis,
                   prixDeSaFidelite, signer, rachat,
                   contratSalle, avisSurPart, signerSalle, salleEchue,
                   chanceDe, lireChance, demarcher, approche, porteRegionale,
                   reputationChez, avisMatchmaker };

});

/* ===== cris.js ======================================================= */
__def("cris.js", function (module, exports, require) {
/**
 * cris.js — CHANTIER G : CRIER DES CONSIGNES EN TEMPS REEL.
 *
 * La vision de Mael (08/08) : "une commande de fou : t'es dans le coin, tu
 * peux crier, donner des consignes en temps reel. Ca sera dans les 5
 * secondes, et ca fera des calculs suivant si le gars a une bonne ecoute
 * et son etat, s'il domine ou s'il perd."
 *
 * LA CONCEPTION SIGNEE (14/08, conversation ligne a ligne) :
 *  - Le vocabulaire est PAR PHASE : on ne crie pas "shoote" a un homme en
 *    pleine garde. Debout / clinch / sol dessus / sol dessous + gestion.
 *  - LA TRANCHE FAIT 30 SECONDES. Le cri s'applique a la tranche
 *    SUIVANTE, jamais a ce qui est deja calcule — l'ecran ne ment pas.
 *  - TROIS CRIS PAR ROUND, PAS PLUS ("1 oui") : un coin qui hurle en
 *    continu n'est plus entendu, et ca oblige a choisir QUAND crier.
 *  - LE CRI NON ENTENDU SE VOIT ("2 oui") : "Il n'entend rien, il est
 *    dans son combat." Tu sais que ton cri s'est perdu, pas pourquoi.
 *  - Corrections de vocabulaire de Mael : "Il est touché, finis-le" (pas
 *    "parti"), "La tête" (pas "boîte-le"), pas d'underhooks ("trop
 *    technique"), "Calme, pas de bagarre avec lui".
 *
 * /!\ CHAQUE CRI TOUCHE UN LEVIER QUE LE MOTEUR LIT VRAIMENT — sinon
 * c'est du texte, le defaut qu'on chasse depuis le debut. Les canaux :
 * gameplan (striking/wrestling/clinch, renormalises), allure, cible,
 * sol (dessus), sol_dessous, clinch_intent, et la bascule de temperament
 * pour "tourne". Tous inertes sans ordre — les bancs le prouvent.
 */

/* ==================================================================== */
/* LE VOCABULAIRE. appliquer(f) pose l'effet et RETOURNE defaire() —    */
/* le cri vit UNE tranche, puis tout revient. On ne modifie jamais sans */
/* garder de quoi restaurer (lecon des remplacements silencieux).       */
/* ==================================================================== */

/** Pousse les poids du gameplan vers `vers` sans effacer le reste. */
function pousserGameplan(f, vers, force) {
  const avant = { striking: f.gameplan.striking, wrestling: f.gameplan.wrestling,
                  clinch: f.gameplan.clinch };
  for (const k of ["striking", "wrestling", "clinch"])
    f.gameplan[k] = (f.gameplan[k] || 0) + (k === vers ? force : 0);
  const s = f.gameplan.striking + f.gameplan.wrestling + f.gameplan.clinch;
  for (const k of ["striking", "wrestling", "clinch"]) f.gameplan[k] /= s;
  return () => { Object.assign(f.gameplan, avant); };
}

/** Pose une clef du gameplan et retourne de quoi la remettre. */
function poser(f, clef, valeur) {
  const avait = Object.prototype.hasOwnProperty.call(f.gameplan, clef);
  const avant = f.gameplan[clef];
  f.gameplan[clef] = valeur;
  return () => { if (avait) f.gameplan[clef] = avant; else delete f.gameplan[clef]; };
}

const CRIS = {
  /* ---- DEBOUT --------------------------------------------------- */
  avance:   { phase: "debout", mot: "Avance, mets la pression !",
    appliquer(f) {
      const a = poser(f, "allure", Math.min(1.3, (f.gameplan.allure || 1.0) + 0.2));
      const b = pousserGameplan(f, "striking", 0.35);
      return () => { a(); b(); };
    } },
  calme:    { phase: "debout", mot: "Calme, pas de bagarre avec lui !",
    appliquer(f) {
      return poser(f, "allure", Math.max(0.7, (f.gameplan.allure || 1.0) - 0.25));
    } },
  tete:     { phase: "debout", mot: "La tête !",
    appliquer(f) { return poser(f, "cible", "tete"); } },
  corps:    { phase: "debout", mot: "Le corps !",
    appliquer(f) { return poser(f, "cible", "corps"); } },
  jambe:    { phase: "debout", mot: "La jambe !",
    appliquer(f) { return poser(f, "cible", "jambes"); } },
  shoote:   { phase: "debout", mot: "Change de niveau, shoote !",
    appliquer(f) { return pousserGameplan(f, "wrestling", 0.9); } },
  tourne:   { phase: "debout", mot: "Sors de là, tourne !",
    /* La bascule de temperament : le moteur lit TEMPERAMENTS[f.temperament]
       a chaque pas — un fuyard tourne (1.5) et reprend l'angle. Donnee du
       combattant, pas du code : le moteur lit vraiment le changement. */
    appliquer(f) {
      const avant = f.temperament;
      f.temperament = "fuyard";
      return () => { f.temperament = avant; };
    } },
  finis_le: { phase: "debout", mot: "Il est touché, finis-le !",
    appliquer(f) {
      const a = poser(f, "allure", 1.3);
      const b = pousserGameplan(f, "striking", 0.6);
      return () => { a(); b(); };
    } },

  /* ---- CLINCH ---------------------------------------------------- */
  projette: { phase: "clinch", mot: "Projette-le !",
    appliquer(f) {
      const a = poser(f, "clinch_intent", "projeter");
      const b = pousserGameplan(f, "clinch", 0.4);
      return () => { a(); b(); };
    } },
  repousse: { phase: "clinch", mot: "Sors, repousse-le !",
    appliquer(f) {
      const a = poser(f, "clinch_intent", "sortir");
      const b = pousserGameplan(f, "striking", 0.4);
      return () => { a(); b(); };
    } },
  genoux:   { phase: "clinch", mot: "Les genoux, frappe !",
    appliquer(f) { return poser(f, "clinch_intent", "frapper"); } },

  /* ---- SOL, DESSUS ----------------------------------------------- */
  conserve_dessus: { phase: "sol_dessus", mot: "Conserve la position !",
    appliquer(f) { return poser(f, "sol", "controle"); } },
  passe:           { phase: "sol_dessus", mot: "Passe sa garde !",
    appliquer(f) { return poser(f, "sol", "passage"); } },
  gnp:             { phase: "sol_dessus", mot: "Frappe ! Ground and pound !",
    appliquer(f) { return poser(f, "sol", "frappe"); } },
  soumission:      { phase: "sol_dessus", mot: "La soumission, elle est là !",
    appliquer(f) { return poser(f, "sol", "soumission"); } },

  /* ---- SOL, DESSOUS ---------------------------------------------- */
  conserve_dessous: { phase: "sol_dessous", mot: "Conserve, bloque-le !",
    appliquer(f) { return poser(f, "sol_dessous", "bloquer"); } },
  releve:           { phase: "sol_dessous", mot: "Relève-toi, le mur !",
    appliquer(f) { return poser(f, "sol_dessous", "relever"); } },
  sweep:            { phase: "sol_dessous", mot: "Le sweep, renverse-le !",
    appliquer(f) { return poser(f, "sol_dessous", "sweep"); } },
  explose:          { phase: "sol_dessous", mot: "Explose, maintenant !",
    appliquer(f) { return poser(f, "sol_dessous", "explosion"); } },

  /* ---- TOUTE PHASE ------------------------------------------------ */
  respire: { phase: "toute", mot: "Respire, trente secondes !",
    appliquer(f) {
      return poser(f, "allure", Math.max(0.7, (f.gameplan.allure || 1.0) - 0.3));
    } },
};

const MAX_CRIS_PAR_ROUND = 3;

/* ==================================================================== */
/* QUELLE PHASE, DONC QUELS CRIS. L'ecran n'affiche que la phase en     */
/* cours — si le combat tombe au sol pendant la tranche, les boutons    */
/* changent a la tranche suivante.                                      */
/* ==================================================================== */

/** La phase des cris pour MON combattant, lue sur l'etat du round.
 *  /!\ LES CONSTANTES DU MOTEUR SONT DES CHAINES ("debout"/"clinch"/
 *  "sol"), PAS DES NOMBRES (defaut vu par Mael, 15/08 : les cris du sol
 *  proposes debout contre la grille). La premiere version testait
 *  etat.phase === 2 — une hypothese jamais verifiee, et le banc testait
 *  la meme hypothese au lieu des constantes reelles. On importe. */
function phaseDesCris(etat, nomDuMien) {
  const E = require("./engine.js");
  if (etat.phase === E.SOL || etat.position) {
    if (etat.top === nomDuMien) return "sol_dessus";
    if (etat.top) return "sol_dessous";
  }
  if (etat.phase === E.CLINCH) return "clinch";
  return "debout";
}

/** Les cris affichables maintenant : ceux de la phase + la gestion. */
function crisDisponibles(etat, nomDuMien) {
  const ph = phaseDesCris(etat, nomDuMien);
  return Object.keys(CRIS).filter(id =>
    CRIS[id].phase === ph || CRIS[id].phase === "toute");
}

/* ==================================================================== */
/* LE FILTRE D'ECOUTE — la regle de Mael (08/08) : "suivant si le gars  */
/* a une bonne ecoute et son etat, s'il domine ou s'il perd."           */
/* fight IQ + discipline decident de l'ecoute ; sonne ou vide, il       */
/* n'entend rien ; un indiscipline qui domine ignore le "calme".        */
/* ==================================================================== */

/**
 * @param {Fighter} f  mon combattant
 * @param {Fighter} adv
 * @param {string} criId
 * @param {number} tirage  [0,1) — fourni par l'appelant (l'ecran), JAMAIS
 *                         par l'alea du moteur : le combat reste conforme
 *                         au temoin a cris egaux.
 * @returns {{entendu:boolean, mot:string}}
 */
function entend(f, adv, criId, tirage) {
  const iq = (f.mental && f.mental.fight_iq) || 50;
  const disc = (f.mental && f.mental.discipline) || 50;
  let p = 0.45 + iq * 0.004 + disc * 0.003;

  if (f.sonne > 0)
    return { entendu: false, mot: "Il est sonné — il n'entend rien du tout." };
  const cardio = f.cardio_ratio ? f.cardio_ratio() : 1.0;
  if (cardio < 0.35)
    return { entendu: false, mot: "Il est vidé — le coin est très loin." };
  p -= (1 - cardio) * 0.3;

  /* Il domine et on lui demande de se calmer : l'indiscipline n'ecoute
     pas ce qui le prive de son moment. */
  const domine = (f.rs && adv.rs) ? (f.rs.damage - adv.rs.damage > 25) : false;
  if (domine && (criId === "calme" || criId === "respire") && disc < 55) p -= 0.30;

  p = Math.max(0.10, Math.min(0.95, p));
  if (tirage < p) return { entendu: true, mot: CRIS[criId].mot };
  return { entendu: false, mot: "Il n'entend rien, il est dans son combat." };
}

/* ==================================================================== */
/* L'ORCHESTRATION D'UNE TRANCHE : appliquer les cris entendus,          */
/* rendre la main au moteur, defaire au prochain arret.                  */
/* ==================================================================== */

/**
 * Applique un cri sur f pour UNE tranche.
 * @returns {function} defaire — a appeler au prochain arret.
 */
function crier(f, criId) {
  const c = CRIS[criId];
  if (!c) throw new Error(`cris.js : cri inconnu "${criId}"`);
  return c.appliquer(f);
}

module.exports = { CRIS, MAX_CRIS_PAR_ROUND, phaseDesCris, crisDisponibles,
                   entend, crier };

});

/* ===== ressenti.js =================================================== */
__def("ressenti.js", function (module, exports, require) {
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
  /* /!\ LES MOTS SONT DOUBLES (Mael, 31/08 : "enrichir les dialogues").
     Chaque fait garde SON seuil et SON levier — seule la formulation se
     decline, departagee par le jeton (regle 4 : derive de l'etat,
     jamais tire — meme combat, meme phrase). */
  const jet = jeton(f, (ctx.round || 1));
  const V = (mots) => mots[(jet + L.length) % mots.length];
  const P = (cle, gravite, signe, mots, levier) =>
    L.push({ cle, gravite, signe, mot: V(mots), levier });

  /* La tete d'abord : c'est ce qui finit les combats. */
  const t = f.head_damage || 0;
  if (t >= SEUILS.tete.casse)
    P("tete", 1.0, "le regard part en arrière, il cligne trop",
      ["Je ne les vois plus partir. Ils arrivent, c'est tout.",
       "C'est flou. Je te vois double, là, maintenant."], { cible: "corps" });
  else if (t >= SEUILS.tete.dur)
    P("tete", 0.75, "la tête est marquée, une pommette gonfle",
      ["J'en ai pris. Ça cogne derrière les yeux.",
       "Sa droite passe. Chaque fois au même endroit, et ça s'accumule."], { allure: "eco" });
  else if (t >= SEUILS.tete.gene)
    P("tete", 0.4, "il a mangé quelques mains propres",
      ["Il touche. Il faut que je remonte la garde.",
       "Il m'a trouvé deux fois. Pas fort, mais il m'a trouvé."], null);

  /* Le reservoir. */
  const c = f.cardio === undefined ? 100 : f.cardio;
  if (c <= SEUILS.cardio.vide)
    P("cardio", 0.95, "il souffle par la bouche, les mains sur les cuisses",
      ["Je n'ai plus rien. Plus rien du tout.",
       "Les bras ne montent plus. Je te jure qu'ils ne montent plus."], { allure: "eco" });
  else if (c <= SEUILS.cardio.court)
    P("cardio", 0.7, "la poitrine se soulève vite, il met du temps à répondre",
      ["Je suis court. Il faut que je gère.",
       "Le réservoir descend vite. Trouve-moi trente secondes quelque part."], { allure: "eco" });
  else if (c <= SEUILS.cardio.tire)
    P("cardio", 0.35, "il respire fort mais il tient",
      ["Ça tire, mais je tiens.",
       "Je sens la pente, mais j'ai encore de quoi faire."], null);

  /* Le corps : ce qui vide le reservoir sans se voir. */
  const b = (f.body && f.body.degats_corps) || 0;
  if (b >= SEUILS.corps.dur)
    P("corps", 0.8, "il garde le coude collé aux côtes",
      ["Il me démonte le corps. Je n'arrive plus à respirer à fond.",
       "Les côtes. Chaque inspiration coûte. Ne me demande pas de sourire."], { plan: "clinch" });
  else if (b >= SEUILS.corps.gene)
    P("corps", 0.45, "la garde descend d'un cran à chaque coup au corps",
      ["Il travaille le corps. Ça commence à peser.",
       "Il investit au corps, le fourbe. Je le paierai au 3e si on ne change rien."], null);

  /* Les jambes : la mobilite, donc tout le reste. */
  const j = f.legs ? (f.legs.total ? f.legs.total() : (f.legs.gauche || 0) + (f.legs.droite || 0)) : 0;
  if (j >= SEUILS.jambes.dur)
    P("jambes", 0.85, "il boite en revenant au coin",
      ["La jambe est morte. Je ne peux plus m'appuyer dessus.",
       "L'appui est parti. Je boxe sur une jambe, là."], { plan: "lutte" });
  else if (j >= SEUILS.jambes.gene)
    P("jambes", 0.4, "il change d'appui trop souvent",
      ["Il me mange la cuisse. Il faut que je la sorte.",
       "Encore deux low kicks comme ça et je vais le sentir longtemps."], null);

  /* Ce qui ne se discute pas. */
  if ((f.sonne || 0) > 0)
    P("sonne", 1.0, "il est encore dedans, il regarde à côté de toi",
      ["Ça va. Ça va, je te dis.",
       "Quoi ? Oui. On est à quel round ?"], { allure: "eco" });
  if ((f.knockdowns || 0) > 0)
    P("knockdown", 0.9, "il a touché la toile ce round",
      ["Il m'a eu une fois. Il ne m'aura pas deux.",
       "C'était un accident de parcours. Il ne retrouvera pas cette ouverture."], null);

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
  "Tout va bien. Donne-moi juste l'eau et un angle.",
  "Il est exactement comme sur les vidéos. Aucun piège.",
  "Je respire bien, je vois tout. Qu'est-ce que tu as vu, toi ?",
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
      dit = ["Le round est parti. Je le sais. Dis-moi quoi changer.",
             "Je lui ai laissé le round. Pas le prochain. Parle-moi."][jeton(f, round) % 2];
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
    dit = grave >= 0.85
      ? ["Ça va. Renvoie-moi.", "C'est rien. Renvoie-moi, je te dis."][jeton(f, round) % 2]
      : ["Ça va bien. Je le tiens.", "Tout va bien. Il est à moi."][jeton(f, round) % 2];
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
      " Son coin crie plus fort que lui. Mauvais signe pour eux.",
      " Il respire mal. Je l'entends d'ici.",
      " Chaque échange me revient. Continue comme ça.",
      " Il ne tente plus rien. Il attend la cloche.",
    ];
    dit += MOMENTUM[jeton(f, round) % MOMENTUM.length];
  } else if (ctx.gagne === false && lu >= 0.55 && F.length)
    dit += [" Et il a pris le round.",
            " Et le round est pour lui, je ne me raconte pas d'histoire."][jeton(f, round) % 2];

  return { etat, dit, signes: signes(f, ctx), demande, lucide, faits: F };
}

module.exports = { ressenti, faits, signes, lucidite, SEUILS };

});

/* ===== demandes_staff.js ============================================= */
__def("demandes_staff.js", function (module, exports, require) {
/**
 * demandes_staff.js — CE QUE TON STAFF VIENT TE DEMANDER.
 *
 * (Chantier de la liste laissee par la cloture du 22/08 : « les demandes
 * de coach ».)
 *
 * Le cas 117 a donne une VOIX aux coachs — ils interpellent, ils disent
 * ce qu'ils voient. Il leur manquait la suite : POUVOIR DEMANDER QUELQUE
 * CHOSE, et que ton oui ou ton non coute. Un coach qui parle sans jamais
 * rien reclamer n'est pas un collegue, c'est un decor.
 *
 * ===================================================================
 * /!\ LES REGLES, REPRISES DE demandes.js — C'EST LE MEME JEU
 * ===================================================================
 * 1. UNE DEMANDE EST PROBABLE OU NON, JAMAIS TIREE DANS UN CHAPEAU. Elle
 *    sort de SA situation : son salaire contre le bareme qu'il connait,
 *    sa charge, son materiel, ses eleves. Pas de `probable`, pas de
 *    demande.
 * 2. CHAQUE DEMANDE PORTE QUATRE CHOSES : ce que coute le OUI, ce que
 *    coute le NON, qui la formule, et — quand ca a un sens — la
 *    PROMESSE : une condition et une echeance, en DONNEES. Sinon le jeu
 *    oublie sa parole, et c'est LUI qui ment.
 * 3. /!\ L'EFFET DU OUI EST REEL OU LA DEMANDE N'EXISTE PAS. La lecon
 *    ecrite six fois au carnet : « les demandes portaient un nom d'effet
 *    que personne n'appliquait ». Chaque cle d'effet ci-dessous est
 *    traitee dans appliquerEffetStaff() — le banc 29 le verifie une par
 *    une, en mesurant que quelque chose a BOUGE.
 * 4. LE MODULE NE TOUCHE A RIEN. Il rend a lire ; la salle applique.
 *
 * /!\ ET LA REGLE PROPRE AU STAFF : UN COACH CONNAIT LE MARCHE.
 * salaireCoach() est la reference publique (cas 117). Il ne demande donc
 * jamais l'impossible — il demande le bareme. Ce qui rend un refus
 * indefendable, et c'est voulu.
 */

/* /!\ LE BAREME NE SE RECALCULE PAS ICI. Premiere version : le module
   reecrivait la formule de salaireCoach « pour rester pur ». C'est
   exactement la DEUXIEME SOURCE que le carnet chasse depuis le 09/08 —
   la formule a deja bouge trois fois (cas 99, cas 114, cas 114 ter), et
   une copie aurait diverge au premier reglage suivant. Le bareme ARRIVE
   PAR LE CONTEXTE, calcule par la salle avec salaireCoach(). Sans lui,
   la demande d'augmentation ne sort simplement pas. */

const AXE_EQUIP = { striking: "striking", lutte: "lutte", sol: "lutte",
                    physique: "physique", mental: null };
const MOT_AXE = { striking: "la frappe", lutte: "la lutte", sol: "le sol",
                  physique: "le physique", mental: "le mental" };

const axesDe = (c) => (c.axes && c.axes.length ? c.axes : [c.axe]);

/* ==================================================================== */
/* FAMILLE 1 — L'ARGENT. Il connait le bareme, c'est tout le probleme.   */
/* ==================================================================== */
const FAMILLE_ARGENT = {

  augmentation: {
    famille: "argent",
    titre: "Il demande à être payé au tarif",
    dit: (c) => `Je ne demande pas la lune. Je demande ce que je vaux sur le `
      + `marché — et tu le sais aussi bien que moi. `
      + `Aujourd'hui je suis à ${c.salaire} € la semaine.`,
    /* Il ne le demande pas au premier euro manquant : il le demande quand
       l'ecart devient une insulte, et quand il n'a plus honte de le dire. */
    probable: (c, x) => !!x.bareme && c.salaire < x.bareme * 0.78
      && (c.semainesMaison || 0) >= 6,
    oui: { effet: "salaire_bareme",
      dit_coach: "Tu le montes au tarif du marché.",
      cout: "Sa fiche de paie passe au barème — toutes les semaines, pas une fois.",
      entente: 9 },
    non: { dit_coach: "Tu lui dis que la caisse ne suit pas.",
      entente: -7, motif: "augmentation refusée",
      reaction: "Il hoche la tête. Il ne le redemandera pas — il ira voir ailleurs." },
    /* La promesse a un sens ici : la caisse peut vraiment se remplir. */
    promesse: { condition: "semaines", n: 8, delai: 56, entente: 3,
      dit_coach: (n) => `Tu lui demandes ${n} semaines. Après, tu l'alignes.` },
  },

  prime_ceinture: {
    famille: "argent",
    titre: "Il attend sa part du titre",
    dit: () => `On a une ceinture au mur. Je l'ai préparé, ce combat. `
      + `Je ne vais pas quémander — mais je ne vais pas faire semblant non plus.`,
    probable: (c, x) => x.titres > (c.primesTitre || 0),
    oui: { effet: "prime_titre",
      dit_coach: "Tu lui verses une prime de titre.",
      cout: "Trois semaines de son salaire, d'un coup.",
      entente: 12 },
    non: { dit_coach: "Tu ne verses rien.",
      entente: -10, motif: "pas un centime sur la ceinture",
      reaction: "Il ne dit plus rien du tout. C'est pire." },
    promesse: null,   // une ceinture ne se represente pas : c'est maintenant.
  },
};

/* ==================================================================== */
/* FAMILLE 2 — LA CHARGE. Ce qu'on lui demande de porter.                */
/* ==================================================================== */
const FAMILLE_CHARGE = {

  un_seul_groupe: {
    famille: "charge",
    titre: "Il veut un seul groupe",
    dit: () => `Pros, amateurs, le cours du mardi — je cours partout et je `
      + `ne construis rien. Donne-m'en un. Un seul. Et regarde ce qu'il devient.`,
    probable: (c) => c.groupe === "tous" && (c.semainesTous || 0) >= 6,
    oui: { effet: "un_groupe",
      dit_coach: "Tu le recentres sur son groupe.",
      cout: "Le reste de la salle perd son encadrement sur cet axe.",
      entente: 8 },
    non: { dit_coach: "Il continue à tenir toute la salle.",
      entente: -6, motif: "étalé sur toute la salle",
      reaction: "Il repart au tapis. Les séances seront ce qu'elles seront." },
    promesse: { condition: "semaines", n: 6, delai: 42, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines de plus, le temps de recruter.` },
  },

  un_seul_axe: {
    famille: "charge",
    titre: "Il veut se recentrer sur son axe",
    dit: (c) => `Je fais ${MOT_AXE[axesDe(c)[0]]} depuis vingt ans. Le reste, je `
      + `le fais mal et ça se voit. Laisse-moi faire ce que je sais faire.`,
    probable: (c) => axesDe(c).length > 1,
    oui: { effet: "un_axe",
      dit_coach: "Tu le ramènes à son axe principal.",
      cout: "L'autre axe n'a plus personne dessus.",
      entente: 7 },
    non: { dit_coach: "Il garde ses deux casquettes.",
      entente: -5, motif: "gardé sur deux axes",
      reaction: "« Comme tu veux. » Il ne le pense pas." },
    promesse: null,
  },

  du_renfort: {
    famille: "charge",
    titre: "Il demande du renfort",
    dit: (c, x) => `On est ${x.eleves} sur le tapis et je suis seul. Je ne peux `
      + `pas corriger ${x.eleves} personnes en une heure. Trouve-moi quelqu'un.`,
    probable: (c, x) => x.eleves >= 22 && x.staffSurSonAxe <= 1,
    oui: { effet: "ouvrir_marche",
      dit_coach: "Tu vas voir qui est disponible.",
      cout: "Un coach de plus, c'est un salaire de plus, toutes les semaines.",
      entente: 5 },
    non: { dit_coach: "Il fera avec.",
      entente: -5, motif: "seul sur un groupe trop gros",
      reaction: "« Alors ne me demande pas des miracles. »" },
    promesse: { condition: "semaines", n: 8, delai: 56, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines pour trouver quelqu'un.` },
  },
};

/* ==================================================================== */
/* FAMILLE 3 — LA SALLE. Les murs et ce qu'il y a dedans.                */
/* ==================================================================== */
const FAMILLE_SALLE = {

  du_materiel: {
    famille: "salle",
    titre: "Il demande du matériel",
    dit: (c) => `On travaille ${MOT_AXE[axesDe(c)[0]]} avec ce qu'on a, et ce `
      + `qu'on a date. À un moment, ce n'est plus de la débrouille, c'est du bricolage.`,
    probable: (c, x) => { const d = AXE_EQUIP[axesDe(c)[0]];
      return !!d && (x.equip[d] || 1) <= 1; },
    oui: { effet: "materiel",
      dit_coach: "Tu équipes son domaine.",
      cout: "Une étoile de matériel, payée comptant.",
      entente: 8 },
    non: { dit_coach: "On garde ce qu'on a.",
      entente: -5, motif: "matériel refusé",
      reaction: "« On fera avec. On fait toujours avec. »" },
    promesse: { condition: "semaines", n: 6, delai: 42, entente: 2,
      dit_coach: (n) => `Tu lui demandes ${n} semaines. Le matériel viendra.` },
  },

  trop_petit: {
    famille: "salle",
    titre: "Il dit que la salle est trop petite",
    dit: (c, x) => `On refuse du monde à la porte et on se marche dessus à `
      + `l'intérieur. ${x.places} places, et on est plus que ça. Ça finira par un blessé.`,
    probable: (c, x) => x.effectif > x.places * 0.95,
    oui: { effet: "ouvrir_local",
      dit_coach: "Tu vas regarder les locaux.",
      cout: "Un loyer plus lourd, tous les mois.",
      entente: 4 },
    non: { dit_coach: "On reste là où on est.",
      entente: -4, motif: "salle saturée",
      reaction: "« Alors arrête de prendre du monde. »" },
    promesse: null,
  },
};

/* ==================================================================== */
/* FAMILLE 4 — LES HOMMES. Ce qu'il voit et que tu ne vois pas.          */
/* ==================================================================== */
const FAMILLE_HOMMES = {

  son_poulain: {
    famille: "hommes",
    titre: "Il veut prendre un gars sous son aile",
    dit: (c, x) => `${x.poulainNom}. Donne-le-moi. Pas un cours sur deux — à `
      + `moi, tous les jours. Dans deux ans tu me remercieras.`,
    probable: (c, x) => !!x.poulain && !c.poulain && c.niveau >= 40,
    oui: { effet: "poulain",
      dit_coach: "Il le prend en main.",
      cout: "Le reste du groupe passe au second plan.",
      entente: 9 },
    non: { dit_coach: "Le gars reste dans le groupe.",
      entente: -6, motif: "on lui a refusé son poulain",
      reaction: "« Tu le regretteras. Pas moi — lui. »" },
    promesse: null,
  },

  menager_un_gars: {
    famille: "hommes",
    titre: "Il veut qu'on ménage un de ses hommes",
    dit: (c, x) => `${x.crameNom} est cuit. Je le vois à chaque séance, il ne `
      + `récupère plus. Sors-le du tapis avant qu'il casse — après, c'est trop tard.`,
    probable: (c, x) => !!x.crame,
    oui: { effet: "menager",
      dit_coach: "Tu le mets au repos.",
      cout: "Il ne progresse plus tant qu'il souffle.",
      entente: 7 },
    non: { dit_coach: "Il continue comme les autres.",
      entente: -6, motif: "un homme laissé sur le tapis à bout",
      reaction: "« Note bien que je te l'ai dit. »" },
    promesse: null,
  },

  le_coin: {
    famille: "hommes",
    titre: "Il veut être dans le coin",
    dit: (c, x) => `${x.combattantNom} monte dans deux semaines. Je l'ai préparé. `
      + `Je veux être derrière lui ce soir-là, pas devant un écran.`,
    probable: (c, x) => c.metier === "competition" && !!x.combattant,
    oui: { effet: "au_coin",
      dit_coach: "Il sera dans le coin.",
      cout: "Le déplacement et la licence de seconde, à ta charge.",
      entente: 8 },
    non: { dit_coach: "Il regardera le combat comme tout le monde.",
      entente: -7, motif: "écarté du coin",
      reaction: "« C'est mon travail que tu envoies dans la cage. »" },
    promesse: null,
  },
};

const DEMANDES_STAFF = Object.assign({}, FAMILLE_ARGENT, FAMILLE_CHARGE,
  FAMILLE_SALLE, FAMILLE_HOMMES);

/**
 * Ce que CE coach-la peut venir demander, dans sa situation du moment.
 * @param {object} c   le coach
 * @param {object} x   le contexte lu dans la salle (voir contexteCoach)
 * @returns {Array} les demandes possibles, la plus pressante d'abord
 */
function possibles(c, x = {}) {
  if (!c || c.moi) return [];                 // on ne se demande rien a soi-meme
  const ctx = Object.assign({ bareme: null,
    equip: {}, eleves: 0, staffSurSonAxe: 1, effectif: 0, places: 99,
    titres: 0, poulain: null, crame: null, combattant: null }, x);
  return Object.entries(DEMANDES_STAFF)
    .filter(([, d]) => { try { return d.probable(c, ctx); } catch (e) { return false; } })
    .map(([cle, d]) => Object.assign({ cle }, d))
    /* /!\ LA PLUS PRESSANTE D'ABORD, ET « PRESSANTE » SE MESURE : c'est
       celle dont le NON coute le plus. Un homme sur le point de casser
       passe avant une etoile de materiel. */
    .sort((a, b) => a.non.entente - b.non.entente);
}

/**
 * Repondre. Rend le mouvement d'entente, l'effet a appliquer, et la
 * promesse creee le cas echeant.
 * @param {string} rep  "oui" | "non" | "plus_tard"
 */
function repondre(c, cle, rep, jour) {
  const d = DEMANDES_STAFF[cle];
  if (!d) throw new Error(`demandes_staff.js : demande inconnue "${cle}"`);

  if (rep === "plus_tard") {
    if (!d.promesse) throw new Error(`demandes_staff.js : "${cle}" ne se remet pas a plus tard`);
    const p = d.promesse;
    /* /!\ UNE PROMESSE EST UNE DONNEE, PAS UNE PHRASE. Condition et
       echeance sont ecrites : le jour venu, le jeu SAIT ce qu'il a promis.
       Sans ca, c'est le coach qu'on fait mentir. */
    return { reponse: rep, entente: p.entente, effet: null,
             dit_coach: p.dit_coach(p.n),
             promesse: { quoi: cle, n: p.n, echeance: jour + p.delai, tenue: false } };
  }

  const b = rep === "oui" ? d.oui : d.non;
  return { reponse: rep, entente: b.entente, effet: rep === "oui" ? b.effet : null,
           dit_coach: b.dit_coach, cout: b.cout || null,
           motif: b.motif || null, reaction: b.reaction || null, promesse: null };
}

/** Le texte de la demande, qui peut dependre de la salle. */
function ditDe(d, c, ctx) {
  return typeof d.dit === "function" ? d.dit(c, ctx || {}) : d.dit;
}

module.exports = { DEMANDES_STAFF, possibles, repondre, ditDe, axesDe,
                   AXE_EQUIP, MOT_AXE,
                   FAMILLE_ARGENT, FAMILLE_CHARGE, FAMILLE_SALLE, FAMILLE_HOMMES };

});

/* ===== endgame.js ==================================================== */
__def("endgame.js", function (module, exports, require) {
/**
 * endgame.js — CE QUI RESTE QUAND LES ANNEES PASSENT.
 *
 * (Le dernier chantier de la liste laissee par la cloture du 22/08 :
 * « l'endgame — mur des legendes, objectifs longs, rivalites ».)
 *
 * LE PROBLEME QU'IL RESOUT
 * Le jeu savait faire une semaine, une saison, une carriere. Il ne savait
 * pas faire UNE VIE DE SALLE. Au bout de cinq ans, plus rien ne montait :
 * les hommes partaient a la retraite et disparaissaient, on ne savait plus
 * ou on en etait, et deux combats contre le meme homme etaient deux
 * combats sans histoire. Trois pieces, une par manque :
 *
 *   LE MUR       — ce que la salle a produit, et qui ne s'efface pas.
 *   LES OBJECTIFS— ou tu en es, en annees, pas en semaines.
 *   LES RIVALITES— ce que le passe fait au prochain combat.
 *
 * ===================================================================
 * /!\ LES TROIS REGLES DU MODULE
 * ===================================================================
 * 1. RIEN NE SE COMPTE A PART. Un objectif se LIT dans l'etat du jeu, il
 *    n'a pas de compteur a lui. La plaie du 09/08 (« pas deux exemplaires
 *    de la meme donnee ») ferait ici des degats permanents : un compteur
 *    de victoires qui derive d'un point au bout de dix ans ne se repare
 *    plus. On lit, on ne stocke pas.
 * 2. RIEN N'EST GRATUIT, ET RIEN N'EST DECORATIF. Un mur ou tout le monde
 *    est accroche ne dit rien (meme regle que le marquage des contrats :
 *    on ne marque que ce qui compte). Une rivalite qui ne change aucun
 *    combat n'est pas une rivalite, c'est une etiquette.
 * 3. UNE RIVALITE NAIT D'UN FAIT. Jamais d'un tirage, jamais d'un seuil
 *    de notoriete — la version d'avant disait `rival: notoriete >= 15`,
 *    ce qui voulait dire « il est connu », pas « ils se detestent ».
 */

/* ==================================================================== */
/* 1. LE MUR DES LEGENDES                                               */
/* ==================================================================== */

/**
 * LES TROIS RANGS, et ce qu'il faut avoir fait pour y entrer.
 * /!\ LES SEUILS SONT DES FAITS DE CARRIERE, pas des notes. On n'accroche
 * pas un homme parce qu'il etait bon : on l'accroche pour ce qu'il a fait
 * SOUS TES COULEURS.
 */
const RANGS = [
  { cle: "legende", mot: "Légende",
    /* Une ceinture, ou une carriere de haut de classement. */
    tient: (b) => b.titres >= 1 || (b.victoires >= 15 && b.meilleurRang !== null && b.meilleurRang <= 5) },
  { cle: "pilier", mot: "Pilier de la maison",
    /* /!\ LA DUREE SEULE NE SUFFIT PAS (trouve au banc 30) : la premiere
       version accrochait "pilier" a tout homme reste cinq ans, meme a
       1-9. On ne devient pas un pilier en trainant — il faut avoir tenu
       ET gagne. */
    tient: (b) => b.victoires >= 8 || (b.annees >= 5 && b.victoires >= 5) },
  { cle: "maison", mot: "De la maison",
    tient: (b) => b.annees >= 3 && b.victoires >= 3 },
];

/**
 * Ce qu'un homme a fait chez toi, en chiffres bruts.
 * @param {object} l   l'homme (MESGARS)
 * @param {object} fi  sa fiche
 * @param {number} jour  le jour courant
 */
function bilanMaison(l, fi, jour) {
  const faits = l.faits || [];
  return {
    victoires: (fi && fi.bilan ? fi.bilan[0] : (l.bilan ? l.bilan.v : 0)) || 0,
    defaites: (fi && fi.bilan ? fi.bilan[1] : (l.bilan ? l.bilan.d : 0)) || 0,
    titres: faits.filter((f) => /^Champion/.test(f.quoi)).length,
    annees: Math.floor(Math.max(0, jour - (l.arriveLe || 0)) / 365),
    meilleurRang: l.meilleurRang === undefined ? (l.rang === undefined ? null : l.rang) : l.meilleurRang,
    finitions: (fi && fi.combats ? fi.combats : [])
      .filter((c) => c && c[0] === "V" && /KO|soumission/i.test(String(c[2]))).length,
  };
}

/**
 * LA PLAQUE — ou null s'il n'en merite pas.
 * /!\ RENDRE null EST LE CAS NORMAL. Un mur ou tout le monde est accroche
 * ne dit rien du tout : la plupart des hommes passent, et c'est ce qui
 * rend les autres visibles.
 */
function plaqueDe(l, fi, jour) {
  if (!l || l.amateur) return null;
  const b = bilanMaison(l, fi, jour);
  const rang = RANGS.find((r) => r.tient(b));
  if (!rang) return null;
  return {
    cle: l.cle || (fi && fi.nom) || l.nom, nom: l.nom || (fi && fi.nom) || "?",
    rang: rang.cle, mot: rang.mot,
    bilan: `${b.victoires}-${b.defaites}`, titres: b.titres,
    annees: b.annees, finitions: b.finitions,
    an: 2026 + Math.floor(jour / 365),
    /* CE QU'ON RETIENT DE LUI — une phrase, tiree de ce qui domine
       vraiment sa carriere. Pas un compliment generique. */
    pourquoi: b.titres >= 2 ? `${b.titres} règnes. On ne lui a jamais repris la ceinture deux fois.`
      : b.titres === 1 ? `Il a ramené une ceinture à la salle.`
      : b.finitions >= 6 ? `${b.finitions} adversaires qui ne sont pas allés au bout.`
      : b.annees >= 8 ? `${b.annees} ans sur ce tapis. Il a vu passer tout le monde.`
      : b.victoires >= 12 ? `${b.victoires} victoires sous tes couleurs.`
      : `Il était là quand il n'y avait personne.`,
  };
}

/** Ce que le mur vaut a la salle. /!\ IL PLAFONNE : une salle ne vit pas
 *  eternellement de ses morts. Trois legendes et cinq piliers ne font pas
 *  mieux que trois legendes — au-dela, c'est un musee, pas une salle. */
function poidsDuMur(plaques) {
  const p = { legende: 0, pilier: 0, maison: 0 };
  for (const x of plaques || []) p[x.rang] = (p[x.rang] || 0) + 1;
  return Math.min(12, p.legende * 3 + p.pilier * 1.5 + p.maison * 0.5);
}

/* ==================================================================== */
/* 2. LES OBJECTIFS LONGS                                               */
/* ==================================================================== */

/**
 * /!\ CHAQUE OBJECTIF SE LIT DANS L'ETAT, IL N'A PAS DE COMPTEUR. `lire`
 * recoit un etat construit au moment ou on regarde — jamais une valeur
 * qu'on aurait incrementee quelque part. C'est la seule facon qu'un
 * objectif de dix ans soit encore juste au bout de dix ans.
 *
 * Chacun rend { ou, sur } : ou on en est, sur combien. `fait` s'en deduit.
 */
const OBJECTIFS = [
  /* --- LA SALLE : tenir debout. ------------------------------------- */
  { cle: "tenir", tier: "salle", titre: "Tenir un an",
    sous: "Une salle sur deux ferme la première année.",
    lire: (e) => ({ ou: Math.min(365, e.jour), sur: 365 }) },
  { cle: "murs", tier: "salle", titre: "Sortir du garage",
    sous: "Des vestiaires, un bureau, un plafond haut.",
    lire: (e) => ({ ou: e.rangLocal, sur: 2 }) },
  { cle: "staff", tier: "salle", titre: "Trois coachs sous contrat",
    sous: "On ne tient pas une salle tout seul.",
    lire: (e) => ({ ou: Math.min(3, e.coachs), sur: 3 }) },
  { cle: "plein", tier: "salle", titre: "Cent adhérents",
    sous: "Ce sont eux qui paient les murs.",
    lire: (e) => ({ ou: Math.min(100, e.effectif), sur: 100 }) },

  /* --- LE SPORT : produire des combattants. ------------------------- */
  { cle: "pros", tier: "sport", titre: "Trois pros sous contrat",
    sous: "Trois hommes qui vivent de ça, chez toi.",
    lire: (e) => ({ ou: Math.min(3, e.prosSousContrat), sur: 3 }) },
  { cle: "classe", tier: "sport", titre: "Un homme dans un top 15",
    sous: "Le classement, c'est la porte des grosses affiches.",
    lire: (e) => ({ ou: e.meilleurRang !== null && e.meilleurRang <= 15 ? 1 : 0, sur: 1 }) },
  { cle: "ceinture", tier: "sport", titre: "Une ceinture au mur",
    sous: "Champion. Le mot qui change une salle.",
    lire: (e) => ({ ou: Math.min(1, e.champions), sur: 1 }) },
  { cle: "deux_ceintures", tier: "sport", titre: "Deux champions en même temps",
    sous: "Une ceinture, c'est un homme. Deux, c'est une école.",
    lire: (e) => ({ ou: Math.min(2, e.champions), sur: 2 }) },

  /* --- L'HERITAGE : ce qui reste. ----------------------------------- */
  { cle: "maison", tier: "heritage", titre: "Un champion formé chez toi",
    sous: "Arrivé amateur. Reparti champion. C'est le vrai métier.",
    lire: (e) => ({ ou: Math.min(1, e.championsMaison), sur: 1 }) },
  { cle: "mur", tier: "heritage", titre: "Une légende au mur",
    sous: "Un homme dont on parlera encore quand tu ne seras plus là.",
    lire: (e) => ({ ou: Math.min(1, e.legendes), sur: 1 }) },
  { cle: "cent", tier: "heritage", titre: "Cent victoires de salle",
    sous: "Cent soirs où quelqu'un est rentré en gagnant.",
    lire: (e) => ({ ou: Math.min(100, e.victoiresSalle), sur: 100 }) },
  { cle: "dix_ans", tier: "heritage", titre: "Dix ans",
    sous: "Une décennie. Des générations entières sont passées.",
    lire: (e) => ({ ou: Math.min(3650, e.jour), sur: 3650 }) },
];

const TIERS = [["salle", "La salle"], ["sport", "Le sport"], ["heritage", "L'héritage"]];

/** L'etat de tous les objectifs, lu maintenant. */
function objectifs(etat) {
  return OBJECTIFS.map((o) => {
    let v;
    try { v = o.lire(etat); } catch (e) { v = { ou: 0, sur: 1 }; }
    const ou = Math.max(0, v.ou || 0), sur = Math.max(1, v.sur || 1);
    return { cle: o.cle, tier: o.tier, titre: o.titre, sous: o.sous,
             ou, sur, fait: ou >= sur, part: Math.min(1, ou / sur) };
  });
}

/** Ceux qui viennent d'etre atteints, par rapport a ce qu'on savait deja.
 *  /!\ ON COMPARE A UNE LISTE DE CLES DEJA ANNONCEES, PAS A UN COMPTEUR :
 *  meme si l'etat retombe (un champion perd sa ceinture), un objectif
 *  atteint reste atteint — on ne le re-annonce pas, et on ne le retire pas. */
function nouveaux(etat, deja) {
  const vus = new Set(deja || []);
  return objectifs(etat).filter((o) => o.fait && !vus.has(o.cle));
}

/* ==================================================================== */
/* 3. LES RIVALITES                                                     */
/* ==================================================================== */

/**
 * /!\ UNE RIVALITE NAIT D'UN FAIT, JAMAIS D'UN TIRAGE. Cinq causes, et
 * chacune correspond a quelque chose qui s'est REELLEMENT produit dans la
 * partie. `poids` dit ce que la cause ajoute a la chaleur.
 */
const CAUSES = {
  defaite:   { poids: 30, mot: (n) => `Il l'a battu.` },
  /* /!\ LA REVANCHE PESE PLUS QUE LA PREMIERE DEFAITE — et le seuil de
     "vivante" est a 25 : a 25 tout pile, une rivalite rallumee retombait
     du bon cote par accident (releve au banc 30). Un chiffre qui atterrit
     exactement sur un seuil est un chiffre a changer. */
  revanche:  { poids: 35, mot: (n) => `Deux fois. Il l'a battu deux fois.` },
  ceinture:  { poids: 40, mot: (n) => `Il lui a pris la ceinture.` },
  vole:      { poids: 20, mot: (n) => `Une décision que personne n'a comprise.` },
  trash:     { poids: 18, mot: (n) => `Ce qui s'est dit avant le combat n'est pas oublié.` },
  gagne:     { poids: 12, mot: (n) => `Il l'a déjà battu — l'autre veut sa revanche.` },
  salle:     { poids: 22, mot: (n) => `Il est parti chez eux.` },
};

/* La chaleur retombe : sans rien, une rivalite s'eteint en deux ans.
   /!\ SANS CETTE LIGNE, TOUT LE MONDE FINIT RIVAL DE TOUT LE MONDE au
   bout de dix ans, et le mot ne veut plus rien dire. */
const REFROIDIT_PAR_JOUR = 100 / 730;

const clefRiv = (cleA, idB) => `${cleA}|${idB}`;

/**
 * Un fait vient de se produire. La rivalite naît ou se rallume.
 * @param {object} R      la table des rivalites (etat du jeu)
 * @param {string} cleA   mon homme
 * @param {number|string} idB  l'autre
 * @param {string} cause  une cle de CAUSES
 */
function nourrir(R, cleA, idB, cause, jour, nomB) {
  const c = CAUSES[cause];
  if (!c) throw new Error(`endgame.js : cause de rivalite inconnue "${cause}"`);
  const k = clefRiv(cleA, idB);
  const r = R[k] || (R[k] = { a: cleA, b: idB, nomB: nomB || String(idB),
                              chaleur: 0, causes: [], depuis: jour, dernier: jour });
  /* Ce qu'il reste de chaud au moment ou le fait tombe. */
  r.chaleur = Math.max(0, chaleur(r, jour)) + c.poids;
  r.chaleur = Math.min(100, r.chaleur);
  r.dernier = jour;
  if (nomB) r.nomB = nomB;
  r.causes.unshift({ cause, jour });
  if (r.causes.length > 6) r.causes.pop();
  return r;
}

/** La chaleur d'aujourd'hui, refroidissement compris. */
function chaleur(r, jour) {
  if (!r) return 0;
  return Math.max(0, r.chaleur - Math.max(0, jour - r.dernier) * REFROIDIT_PAR_JOUR);
}

/** Une rivalite est VIVANTE au-dela de 25 : en dessous, c'est un souvenir. */
function vivante(r, jour) { return chaleur(r, jour) >= 25; }

/** Le mot qui la resume, tire de ce qui l'a nourrie. */
function mot(r, jour) {
  if (!r || !r.causes.length) return "";
  const c = CAUSES[r.causes[0].cause];
  const ch = chaleur(r, jour);
  const ton = ch >= 70 ? "Ça n'est plus du sport." : ch >= 45 ? "Il attend ce combat." : "Il n'a pas oublié.";
  return `${c.mot(r.nomB)} ${ton}`;
}

/** Les rivalites vivantes d'un homme, la plus chaude d'abord. */
function rivalitesDe(R, cleA, jour) {
  return Object.values(R || {})
    .filter((r) => r.a === cleA && vivante(r, jour))
    .sort((x, y) => chaleur(y, jour) - chaleur(x, jour));
}

/**
 * CE QUE LA RIVALITE FAIT AU COMBAT. /!\ ELLE NE TOUCHE PAS AU MOTEUR :
 * on ne truque pas un combat parce qu'il y a une histoire. Elle agit sur
 * ce qui se negocie AUTOUR — la bourse, ce que la presse en fait, et ce
 * que la victoire ou la defaite pese entre lui et toi.
 */
function effetsDuCombat(r, jour) {
  const ch = chaleur(r, jour);
  if (ch < 25) return null;
  const f = ch / 100;
  return {
    bourse: 1 + f * 0.45,        // une revanche attendue se vend
    notoriete: 1 + f * 0.8,      // et elle se raconte
    entente: Math.round(f * 6),  // gagner CE combat-la compte double pour lui
  };
}

module.exports = {
  RANGS, plaqueDe, bilanMaison, poidsDuMur,
  OBJECTIFS, TIERS, objectifs, nouveaux,
  CAUSES, nourrir, chaleur, vivante, mot, rivalitesDe, effetsDuCombat, clefRiv,
};

});

/* ===== vestiaire.js ================================================== */
__def("vestiaire.js", function (module, exports, require) {
/**
 * vestiaire.js — LES LIENS ENTRE TES HOMMES (chantier N, Mael, 28/08).
 *
 * LA REGLE FONDATRICE, appliquee aux liens : UN LIEN EST UN RESIDU DES
 * FAITS, jamais une jauge cliquable. Il vit en PAIRES (cle-cle, valeur,
 * faits[]) dans SALLE.liens — UNE SEULE source, elle voyage dans la
 * sauvegarde comme le reste de SALLE.
 *
 * LES ARBITRAGES DE MAEL (28/08, tous graves au carnet) :
 *  1. visibilite : LES DEUX — la fiche (bloc « Le vestiaire ») ET le
 *     coach qui interpelle quand un palier se franchit ;
 *  2. le leader EMERGE des faits (anciennete + entente + resultats),
 *     personne ne le nomme ;
 *  3. des PAIRES seulement — les « clans » se liront d'eux-memes quand
 *     trois paires fortes relient les memes hommes ;
 *  4. la MANIERE compte au duel interne : un combat propre fait le
 *     respect, une demolition fait le froid — meme consenti ;
 *  5. le plafond : 24 paires stockees, la plus faible s'efface
 *     (arbitrage pose par la session, ajustable en jouant).
 *
 * Ce module est PUR : pas de DOM, pas d'etat global, pas de tirage.
 * Tout ce qui est aleatoire ou narratif reste cote jeu. Le banc 32
 * (verifier_vestiaire.js) le tient.
 */

const MAX_LIENS = 24;   // le plafond de paires stockees
const VIVANT = 30;      // a partir d'ou un lien se DIT (fiche, coach)
const FROID = -30;      // a partir d'ou on refuse le sparring ensemble

/** La cle d'une paire — symetrique, l'ordre des deux ne compte pas. */
function clef(a, b) {
  a = String(a); b = String(b);
  return a < b ? a + "|" + b : b + "|" + a;
}

/** La valeur du lien entre deux hommes. 0 = rien entre eux. */
function lire(liens, a, b) {
  const e = liens[clef(a, b)];
  return e ? e.v : 0;
}

/** Le mot — JAMAIS le chiffre (meme regle que l'entente). null = rien a
 *  dire : un lien tiede ne se raconte pas. */
function mot(v) {
  if (v >= 60) return "inséparables";
  if (v >= VIVANT) return "proches";
  if (v <= -60) return "irréconciliables";
  if (v <= FROID) return "un froid";
  return null;
}

/**
 * Poser un fait sur une paire. Cree la paire au besoin ; au plafond, la
 * paire LA PLUS FAIBLE (|v| minimal) s'efface pour faire la place — une
 * salle n'a pas de memoire infinie, les histoires tiedes s'oublient.
 * Rend { v, franchi } : franchi porte le NOUVEAU mot quand un palier
 * vient d'etre franchi (c'est le signal d'interpellation du coach),
 * null sinon.
 */
function poser(liens, a, b, jour, quoi, delta) {
  const k = clef(a, b);
  let e = liens[k];
  if (!e) {
    const cles = Object.keys(liens);
    if (cles.length >= MAX_LIENS) {
      let faible = cles[0];
      for (const c of cles) if (Math.abs(liens[c].v) < Math.abs(liens[faible].v)) faible = c;
      delete liens[faible];
    }
    e = liens[k] = { v: 0, faits: [] };
  }
  const avant = mot(e.v);
  e.v = Math.max(-100, Math.min(100, Math.round((e.v + delta) * 10) / 10));
  e.maj = jour;
  e.faits.push({ jour, quoi, delta });
  if (e.faits.length > 5) e.faits.shift();
  const apres = mot(e.v);
  return { v: e.v, franchi: apres !== avant ? apres : null };
}

/** L'usure du temps : sans faits nouveaux, tout retourne vers zero —
 *  lentement (a appeler UNE fois par semaine). Une paire retombee a
 *  presque rien et sans fait recent s'efface. */
function decroitre(liens, jour) {
  for (const k of Object.keys(liens)) {
    const e = liens[k];
    e.v = Math.round(e.v * 0.985 * 10) / 10;
    if (Math.abs(e.v) < 4 && jour - (e.maj || 0) > 60) delete liens[k];
  }
}

/** Les paires d'un homme, la plus forte d'abord — avec le mot et les
 *  faits, pretes pour la fiche. Seules celles qui ONT un mot sortent. */
function pairesDe(liens, cle) {
  const sortie = [];
  const c = String(cle);
  for (const k of Object.keys(liens)) {
    const [x, y] = k.split("|");
    if (x !== c && y !== c) continue;
    const e = liens[k], m = mot(e.v);
    if (!m) continue;
    sortie.push({ autre: x === c ? y : x, v: e.v, mot: m, faits: e.faits });
  }
  return sortie.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
}

/** Un homme part (fin de contrat, renvoi) : ses paires s'effacent — le
 *  lien vit entre deux hommes DE LA SALLE. Rend les partenaires dont le
 *  lien etait vivant (v >= VIVANT) : eux ressentent le trou, et le jeu
 *  peut le raconter. */
function retirer(liens, cle) {
  const c = String(cle), touches = [];
  for (const k of Object.keys(liens)) {
    const [x, y] = k.split("|");
    if (x !== c && y !== c) continue;
    if (liens[k].v >= VIVANT) touches.push(x === c ? y : x);
    delete liens[k];
  }
  return touches;
}

/** Une paire liee s'entraine mieux ENSEMBLE ; un froid refuse le tapis. */
const bonusSparring = (v) => (v >= VIVANT ? 1.15 : 1);
const refuse = (v) => v <= FROID;

/**
 * Le duel interne : LA MANIERE COMPTE (arbitrage 4). Une demolition —
 * l'arret dans le premier round — fait le froid, meme si le combat
 * etait accepte des deux cotes. Tout le reste est un combat propre :
 * il fait le respect.
 */
function effetDuel(methode, round) {
  const demolition = (methode === "KO" || methode === "TKO") && round <= 1;
  return demolition
    ? { delta: -18, quoi: "la démolition en duel interne" }
    : { delta: +8, quoi: "un duel propre" };
}

/**
 * Le leader de vestiaire — il EMERGE, personne ne le nomme (arbitrage 2).
 * candidats : [{ cle, anciennete (jours), entente (0-100), victoires }].
 * Il faut au moins un an de maison et une entente qui tient (55+) ;
 * ensuite l'anciennete pese le plus, puis l'entente, puis les resultats.
 * Rend { cle, score } ou null — une salle peut n'avoir personne.
 */
function leader(candidats) {
  let best = null;
  for (const c of candidats || []) {
    if ((c.anciennete || 0) < 365 || (c.entente || 0) < 55) continue;
    const score = (c.anciennete / 365) * 20 + c.entente * 0.5 + (c.victoires || 0) * 2;
    if (!best || score > best.score) best = { cle: c.cle, score: Math.round(score * 10) / 10 };
  }
  return best;
}

module.exports = { MAX_LIENS, VIVANT, FROID, clef, lire, mot, poser,
                   decroitre, pairesDe, retirer, bonusSparring, refuse,
                   effetDuel, leader };

});

/* ===== soiree.js ===================================================== */
__def("soiree.js", function (module, exports, require) {
/**
 * soiree.js — LA SOIREE VECUE : les conversations au bord de la cage.
 *
 * Mael (30/08) : « pas super fan du mode scouting — je m'inscris et ça
 * m'ouvre une page annexe comme le combat, avec l'évent ; je peux parler
 * avec les combattants avec des dialogues riches, les inviter à la salle
 * pour s'entraîner, créer des liens, ou recruter s'ils n'ont plus de
 * club. »
 *
 * LA DOCTRINE DES DIALOGUES (la même que dialogue.js, 10/08) : les
 * répliques ne sont PAS décoratives — chacune est choisie par l'état
 * réel de l'homme (son résultat du soir, son contrat, sa notoriété, ce
 * qu'il sait de toi) et vient avec sa conséquence. LE CONTACT est un
 * résidU des faits, posé sur l'homme du monde (p.contact = {v, faits}),
 * il voyage avec lui dans la sauvegarde — et il pèse : un homme qui te
 * connaît accepte plus volontiers de venir, et de signer.
 *
 * Module PUR : aucun tirage (la variante sort du jeton fourni par le
 * jeu : id + jour), aucun DOM, aucun etat global. Banc 33.
 */

/* ==================================================================== */
/* LE CONTACT — le residu des conversations.                            */
/* ==================================================================== */
function contactDe(p) {
  if (!p.contact) p.contact = { v: 0, faits: [] };
  return p.contact;
}
function poserContact(p, jour, quoi, delta) {
  const c = contactDe(p);
  c.v = Math.max(0, Math.min(100, Math.round((c.v + delta) * 10) / 10));
  c.faits.push({ jour, quoi, delta });
  if (c.faits.length > 5) c.faits.shift();
  return c.v;
}
function motContact(v) {
  if (v >= 60) return "en confiance";
  if (v >= 30) return "il te connaît";
  if (v >= 10) return "il te situe";
  return null;
}

/* ==================================================================== */
/* LA SITUATION D'UN HOMME AU BORD DE LA CAGE.                          */
/* ctx : { nom, aCombattu, aGagne, finish, serre, libre, finContrat,    */
/*         orgNom, niveauInter, rang, notoriete, contactV, reputation,  */
/*         preuve, salleNom, jeton }                                    */
/* ==================================================================== */
const sit = (ctx) =>
  !ctx.aCombattu ? (ctx.libre ? "libre" : "spectateur")
  : ctx.aGagne ? (ctx.finish ? "gagne_finish" : "gagne_decision")
  : (ctx.serre ? "perdu_serre" : "perdu_dur");

const pioche = (liste, jeton) => liste[Math.abs(jeton | 0) % liste.length];

/* ==================================================================== */
/* CE QU'IL DIT EN PREMIER. Le contact rechauffe l'accueil.             */
/* ==================================================================== */
/* /!\ REPERTOIRES DOUBLES (Mael, 31/08 : "enrichir les dialogues, les
   doubler au moins"). Les familles ne bougent pas — la situation choisit
   toujours ; seul le nombre de facons de le dire grandit, et le jeton
   departage comme avant. */
const OUVERTURES = {
  gagne_finish: [
    "On prépare ça depuis huit semaines. Ce soir, ça a payé.",
    "Il a senti le premier crochet. Après, c'était une question de temps.",
    "Le plan disait trois rounds. Il n'en a pas fallu un entier.",
    "Tout le monde parlait de lui. Ils vont parler de moi maintenant.",
    "T'as vu le finish ? Mon coach l'avait dessiné au tableau ce matin.",
    "Je l'avais dit à la pesée. Personne n'a écouté. Maintenant ils écoutent.",
    "Même pas une égratignure. Je pourrais recommencer demain.",
    "Sa fête est finie. La mienne commence — enfin, après les examens médicaux.",
  ],
  gagne_decision: [
    "Trois rounds propres. Pas le plus beau soir de ma vie, mais je prends.",
    "Il était plus dur que sur les vidéos. J'ai fait le métier, c'est tout.",
    "On a gagné à la casquette. Le coin a bien parlé, j'ai bien écouté.",
    "Pas de bonus ce soir, mais la colonne des victoires ne demande pas le style.",
    "Il m'a fait travailler. C'est les combats comme ça qui construisent.",
    "Les juges ont vu juste, pour une fois. J'en connais qui vont râler quand même.",
  ],
  perdu_serre: [
    "30-27 ? Ils ont regardé quel combat, les juges ?",
    "Un round d'écart, peut-être. Pas trois. Enfin. On remet ça.",
    "Il le sait, lui, que c'était serré. Regarde sa tête.",
    "Refais-le-nous demain, ce combat, et je te signe l'autre résultat.",
    "Mon coin dit qu'on a gagné le deux et le trois. Les juges avaient d'autres soirées en tête.",
    "Ça s'est joué sur un takedown à dix secondes du gong. Dix secondes.",
  ],
  perdu_dur: [
    "Pas ce soir. Ne me demande pas de commenter.",
    "J'ai rien vu venir. C'est le jeu, il paraît.",
    "Le vestiaire d'à côté fait la fête. Laisse-moi celui-là.",
    "On m'avait promis un autre combat que ça. Moi le premier.",
    "Le docteur dit que ça va. Le miroir dira autre chose demain.",
    "Parle moins fort. La tête, tu comprends.",
  ],
  libre: [
    "Je regarde. Ça fait trois mois que je ne fais que regarder.",
    "Sans club, tu ne montes plus. Alors je viens sentir la cage.",
    "Mon manager ne rappelle plus. Me voilà au bord des cages des autres.",
    "Le gars qui vient de gagner, je l'ai battu il y a deux ans. Cherche l'erreur.",
    "Je m'entraîne seul dans un garage. Ça se voit tant que ça ?",
    "Tout le monde ici a un contrat sauf moi. Profite, ça met les gens de bonne humeur de me parler.",
  ],
  spectateur: [
    "Je viens voir ce que ma division prépare. On n'apprend rien chez soi.",
    "Mon tour viendra. Ce soir, je compte les trous dans leurs gardes.",
    "Le matchmaker m'a dit de rester visible. Alors je suis visible.",
    "J'étais censé être sur cette carte. Blessure. On ne me l'a pas rendue.",
  ],
};
const OUVERTURES_CONNU = [
  "Tiens — {salle}. Tu te déplaces, maintenant.",
  "Je me disais bien que je te verrais ici. {salle} voyage.",
  "{salle} au bord de la cage. Les gens commencent à connaître le nom.",
  "Encore toi. Les coachs qui se déplacent comme {salle}, ça se compte sur une main.",
];

function ouverture(ctx) {
  if ((ctx.contactV || 0) >= 30)
    return pioche(OUVERTURES_CONNU, ctx.jeton).replace("{salle}", ctx.salleNom || "ta salle")
      + " " + pioche(OUVERTURES[sit(ctx)], ctx.jeton + 1);
  return pioche(OUVERTURES[sit(ctx)], ctx.jeton);
}

/* ==================================================================== */
/* CE QUE TU PEUX LUI DIRE. Chaque choix a sa condition et son effet.   */
/* ==================================================================== */
function choixPour(ctx) {
  const c = [];
  if (ctx.aCombattu)
    c.push(ctx.aGagne
      ? { cle: "feliciter", lab: "« Beau travail ce soir. »" }
      : { cle: "relever", lab: "« Ce soir ne dit pas qui tu es. »" });
  c.push({ cle: "sonder", lab: "« Et toi, tu en es où ? »" });
  c.push({ cle: "inviter", lab: "« Viens passer une semaine à la salle. »" });
  if (ctx.libre || ctx.finContrat)
    c.push({ cle: "recruter", lab: "« J'ai une place pour toi — une vraie. »" });
  c.push({ cle: "partir", lab: "Le laisser" });
  return c;
}

/* ==================================================================== */
/* CE QU'IL REPOND. Le resultat du soir, le contact et TA reputation    */
/* choisissent la replique — et la replique ne ment jamais : le delta   */
/* de contact est celui qu'elle raconte.                                */
/* ==================================================================== */
const R = {
  feliciter_froid: [
    "Merci. On se connaît ?",
    "C'est le travail. Merci quand même.",
    "Merci. Tu coaches où, toi ?",
    "On me l'a dit vingt fois ce soir. Mais merci.",
  ],
  feliciter_chaud: [
    "Venant de toi, ça compte. Tu sais regarder un combat.",
    "Merci. Ton œil ne rate pas grand-chose, à ce qu'on dit.",
    "T'as vu la feinte avant le finish ? Toi tu l'as vue, je le sais.",
    "Merci. Un jour tu me diras ce que tu as vu que les autres ratent.",
  ],
  relever_froid: [
    "Ouais. C'est gentil. Laisse-moi digérer.",
    "Tout le monde dit ça au perdant. Merci quand même.",
    "Le prochain qui me console, je le prends en sparring.",
    "C'est ça. La semaine prochaine, plus personne ne s'en souviendra. Sauf moi.",
  ],
  relever_chaud: [
    "Toi, tu sais ce que c'est. Merci de ne pas me parler des juges.",
    "C'est le genre de phrase qu'on n'oublie pas. Merci.",
    "T'es le seul ce soir à me parler comme à un combattant et pas comme à un blessé.",
    "Garde-moi cette phrase. Je viendrai la chercher après ma prochaine victoire.",
  ],
  sonder_contrat: [
    "Sous contrat, ça roule. On verra à l'échéance.",
    "Il me reste des combats à honorer. Après, tout est ouvert.",
    "Je suis bien où je suis. Mais je note ceux qui demandent.",
    "L'orga me traite correctement. Le jour où ça change, les langues se délieront.",
  ],
  sonder_fin: [
    "Dernier combat du contrat. Après ce soir, j'écoute tout le monde.",
    "Mon contrat se finit. Mon manager fait le tour — toi aussi, on dirait.",
    "Libre dans un combat. Les vautours tournent déjà — toi tu demandes poliment, ça change.",
    "L'échéance arrive. Je regarde qui me regardait AVANT ce soir. Toi, par exemple.",
  ],
  sonder_libre: [
    "Nulle part. C'est bien le problème. Tu proposes quelque chose ?",
    "Libre. Le mot est joli, la réalité paie moins bien.",
    "Sans club depuis trois mois. Je m'entretiens, mais m'entretenir n'est pas progresser.",
    "Tu es la première personne à me poser la question ce soir. Ça répond, non ?",
  ],
  inviter_oui: [
    "Une semaine ? Pourquoi pas. J'ai besoin de nouveaux regards.",
    "On dit du bien de ton tapis. J'apporte mes gants.",
    "D'accord. Mais je viens pour travailler, pas pour visiter.",
    "Vendu. Si tes gars tiennent le rythme, je reviendrai peut-être.",
    "Une semaine, j'essaie. Préviens tes poids lourds que je ne retiens pas mes low kicks.",
    "Ça tombe bien, mon camp s'ennuie. Envoie l'adresse.",
  ],
  inviter_non_haut: [
    "J'ai un camp complet chez moi. Sans vouloir te vexer.",
    "Ta salle n'a encore personne à mon niveau. Reviens avec un nom.",
    "À ce niveau, je ne prête pas mes semaines. Fais tes preuves et rappelle-moi.",
    "Mon équipe déciderait pour moi — et elle dirait non. Rien contre toi.",
  ],
  inviter_non_froid: [
    "Je ne te connais pas. On se reparle quand ce sera le cas.",
    "Une semaine chez un inconnu ? Non. Mais reste dans le coin.",
    "On vient de se rencontrer. Les gants, ça se prête après la confiance, pas avant.",
    "Pas encore. Recroise-moi à deux ou trois soirées, et on en reparle sérieusement.",
  ],
  recruter_ecoute: [
    "Je t'écoute. Vraiment.",
    "C'est le premier vrai « oui » qu'on me tend depuis des mois.",
    "Une vraie place ? Assieds-toi. Enfin — reste debout, mais parle.",
    "Tu as trente secondes avant que mon manager rapplique. Fais-les compter.",
  ],
  partir: [
    "Bonne route, coach.",
    "On se recroisera.",
    "Salue ta salle pour moi.",
    "C'était le meilleur échange de ma soirée. La barre était basse, mais quand même.",
  ],
};

function repondre(cle, ctx) {
  const j = ctx.jeton + 7, contactV = ctx.contactV || 0;
  switch (cle) {
    case "feliciter":
      return { dit: pioche(contactV >= 20 ? R.feliciter_chaud : R.feliciter_froid, j),
               dContact: contactV >= 20 ? 6 : 4, effet: null };
    case "relever":
      return { dit: pioche(contactV >= 20 ? R.relever_chaud : R.relever_froid, j),
               dContact: contactV >= 20 ? 8 : 5, effet: null };
    case "sonder":
      return { dit: pioche(ctx.libre ? R.sonder_libre : ctx.finContrat ? R.sonder_fin : R.sonder_contrat, j),
               dContact: 2, effet: null };
    case "inviter": {
      if (!accepteInvitation(ctx))
        return { dit: pioche(ctx.niveauInter && !ctx.preuve ? R.inviter_non_haut
                             : (ctx.notoriete || 0) > (ctx.reputation || 0) + 15 ? R.inviter_non_haut
                             : R.inviter_non_froid, j),
                 dContact: 1, effet: null };
      return { dit: pioche(R.inviter_oui, j), dContact: 10, effet: "inviter" };
    }
    case "recruter":
      /* La replique ouvre la porte ; les GATES du recrutement (cas 143,
         budget d'approches) restent au jeu — pas deux exemplaires. */
      return { dit: pioche(R.recruter_ecoute, j), dContact: 3, effet: "recruter" };
    default:
      return { dit: pioche(R.partir, j), dContact: 0, effet: "partir" };
  }
}

/* Vient-il s'entrainer une semaine ? Ta reputation + ce qu'il sait de
   toi, contre sa notoriete. Deterministe — pas un tirage. Un contracte
   d'internationale exige la preuve (cas 143), meme pour une visite :
   a ce niveau on ne pretend pas ses gants a un inconnu. */
function accepteInvitation(ctx) {
  if (ctx.niveauInter && !ctx.preuve) return false;
  return (ctx.reputation || 0) + (ctx.contactV || 0) * 0.6 + 15 >= (ctx.notoriete || 0);
}

/* La visite : une semaine, et le sparring de SA division en profite. */
const VISITE_JOURS = 7;
const BOOST_VISITE = 1.2;

module.exports = { contactDe, poserContact, motContact, sit, ouverture,
                   choixPour, repondre, accepteInvitation,
                   VISITE_JOURS, BOOST_VISITE };

});

/* ===== choregraphie.js =============================================== */
__def("choregraphie.js", function (module, exports, require) {
/**
 * choregraphie.js — DU LOG A LA SCENE.
 *
 * /!\ EN DORMANCE (cas 150 bis, 30/08) : le proto 3D en primitives a
 * ete juge par Mael ("vraiment nul") et RETIRE — bonshommes, three.js,
 * bouton, tout le visible est sorti du jeu. CE MODULE RESTE : c'est la
 * lecture du log (positions, phases, gestes), independante de tout
 * rendu — la prochaine tentative (sprites, GLB, autre idee) repartira
 * d'ici sans rien recalculer. Le banc 34 le tient au chaud.
 *
 * LA REGLE 7, APPLIQUEE A LA 3D : la scene ne montre JAMAIS un coup que
 * le moteur n'a pas tire. Ce module ne cree rien — il RELIT les etapes
 * du traducteur (qui portent deja les positions reelles des deux hommes
 * dans la cage, la phase, qui encaisse et ou) et les compacte en TEMPS
 * («beats») que la vue 3D n'a plus qu'a jouer. Zero tirage, zero DOM.
 *
 * L'etape du traducteur : { t, a:[x,y], b:[x,y], ph, dmg:{<cote><zone>:n},
 *   ctrl, flash, chaud, com }. La cage vit en (180,180) rayon 148 —
 * la vue normalise avec CAGE ci-dessous, une seule verite d'echelle.
 *
 * Banc 34 (verifier_choregraphie.js).
 */

const CAGE = { centre: [180, 180], rayon: 148 };

/* Les phases connues du traducteur — tout le reste est traite DISTANCE. */
const PHASES = ["DISTANCE", "CLINCH", "TAKEDOWN", "SOL", "SOUMISSION",
                "KNOCKDOWN", "KO", "TKO", "FIN"];

const ZONES = { t: "tete", c: "corps", j: "jambes" };

/**
 * Un temps de scene, depuis une etape. `dmg` designe QUI ENCAISSE
 * (« Bt » = B prend a la tete) : le frappeur est l'autre.
 */
function beat(e) {
  let frappeur = null, zone = null;
  if (e.dmg) {
    const cle = Object.keys(e.dmg)[0];
    if (cle && (cle[0] === "A" || cle[0] === "B")) {
      frappeur = cle[0] === "A" ? "B" : "A";
      zone = ZONES[cle[1]] || "tete";
    }
  }
  const ph = PHASES.indexOf(e.ph) >= 0 ? e.ph : "DISTANCE";
  return { t: e.t || 0,
           a: e.a || CAGE.centre.slice(), b: e.b || CAGE.centre.slice(),
           ph, f: frappeur, z: zone,
           ctrl: e.ctrl || null,
           fl: !!e.flash, ch: !!e.chaud,
           com: e.com || "" };
}

/** La partition complete d'un combat — ce que la carte transporte. */
function beats(etapes) {
  return (etapes || []).map(beat);
}

/**
 * La position d'un temps, normalisee pour la scene : [-1..1] sur les
 * deux axes, centre de la cage en (0,0). LA SEULE conversion d'echelle
 * du jeu — la vue 3D ne connait pas (180,180).
 */
function normaliser(p) {
  return [(p[0] - CAGE.centre[0]) / CAGE.rayon,
          (p[1] - CAGE.centre[1]) / CAGE.rayon];
}

/** Ce que la vue doit JOUER pour un temps donne — le geste, pas le
 *  pixel : la vue decide de ses membres, la partition decide du sens. */
function geste(b) {
  if (b.ph === "KO" || b.ph === "TKO" || b.ph === "KNOCKDOWN")
    return { type: "chute", qui: b.f ? (b.f === "A" ? "B" : "A") : (b.ctrl === "A" ? "B" : "A") };
  if (b.ph === "SOUMISSION") return { type: "soumission", qui: b.ctrl || "A" };
  if (b.ph === "TAKEDOWN") return { type: "amenee", qui: b.ctrl || b.f || "A" };
  if (b.ph === "SOL") return { type: "sol", qui: b.ctrl || "A" };
  if (b.f) return { type: "frappe", qui: b.f, zone: b.z || "tete" };
  if (b.ph === "CLINCH") return { type: "clinch", qui: b.ctrl || null };
  if (b.ph === "FIN") return { type: "fin", qui: null };
  return { type: "garde", qui: null };
}

module.exports = { CAGE, PHASES, ZONES, beat, beats, normaliser, geste };

});


  racine.MMA = {
    alea:       require("./alea.js"),
    engine:     require("./engine.js"),
    generator:  require("./generator.js"),
    traducteur: require("./traducteur.js"),
    mesure:     require("./mesure.js"),
    temps:      require("./temps.js"),
    fiches:     require("./fiches.js"),
    verdict:    require("./verdict.js"),
    profil:     require("./profil.js"),
    chrono:     require("./chrono.js"),
    feuille:    require("./feuille.js"),
    coin:       require("./coin.js"),
    classement: require("./classement.js"),
    etoiles:    require("./etoiles.js"),
    grappling:  require("./grappling.js"),
    // la saison (branchement du 09/08)
    carriere:   require("./carriere.js"),
    vivier:     require("./vivier.js"),
    cartes:     require("./cartes.js"),
    salle:      require("./salle.js"),
    relation:   require("./relation.js"),
    offres:     require("./offres.js"),
    entente:    require("./entente.js"),
    dialogue:   require("./dialogue.js"),
    demandes:   require("./demandes.js"),
    contrats:   require("./contrats.js"),
    cris:       require("./cris.js"),
    // la reprise du 25/08
    ressenti:   require("./ressenti.js"),
    demandes_staff: require("./demandes_staff.js"),
    endgame:    require("./endgame.js"),
    vestiaire:  require("./vestiaire.js"),
    soiree:     require("./soiree.js"),
    choregraphie: require("./choregraphie.js"),
    require: require
  };
})(typeof window !== "undefined" ? window : globalThis);
