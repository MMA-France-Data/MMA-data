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
