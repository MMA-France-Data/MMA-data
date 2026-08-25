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
