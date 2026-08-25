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
