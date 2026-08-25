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
