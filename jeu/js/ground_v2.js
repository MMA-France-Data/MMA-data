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
