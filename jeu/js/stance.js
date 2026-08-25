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
