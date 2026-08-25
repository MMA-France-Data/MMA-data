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
