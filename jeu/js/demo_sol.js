/** demo_sol.js — une sequence au sol jouee par les modules JS portes.
 *  Ce n'est PAS un combat : ni rounds, ni frappes debout, ni jugement.
 *  Usage : node demo_sol.js [graine] */
const { alea } = require("./alea.js");
const G = require("./ground_v2.js");

const graine = Number(process.argv[2] || 27);
alea.seed(graine);

const lutteur = new G.GroundProfile({passing:78,posture_sol:74,half_guard_top:80,
  side_control_top:82,mount_top:76,back_top:66,sweeps:44,shrimping:52,
  explosiveness:58,wall_walking:55,hand_fighting_sol:70,submission_off_top:52,
  submission_off_bottom:40,submission_def:74,ground_striking:80,
  closed_guard_bottom:50,open_guard_bottom:48,butterfly_bottom:45,
  half_guard_bottom:55,side_control_bottom:52,mount_bottom:50,
  back_defense:60,turtle_defense:62});
const jiujitsuka = new G.GroundProfile({passing:70,posture_sol:72,half_guard_top:74,
  side_control_top:70,mount_top:72,back_top:78,sweeps:84,shrimping:82,
  explosiveness:66,wall_walking:60,hand_fighting_sol:76,submission_off_top:86,
  submission_off_bottom:88,submission_def:80,ground_striking:48,
  closed_guard_bottom:88,open_guard_bottom:84,butterfly_bottom:86,
  half_guard_bottom:80,side_control_bottom:70,mount_bottom:66,
  back_defense:74,turtle_defense:70});

const TOP = {ground: lutteur, nom: "Okafor"}, BOT = {ground: jiujitsuka, nom: "Kante"};
let pos = "half_guard";
const log = [];
for (let t = 0; t < 14; t++) {
  const [r, d] = G.resolve_gnp(TOP, BOT, pos);
  if (d) log.push(`${TOP.nom} ground and pound -> ${d} degats`);
  const [sub, res] = G.tenter_soumission_top(TOP, BOT, pos);
  if (sub) { log.push(`${TOP.nom} tente ${sub} -> ${res}`); if (res === "SOUMISSION") break; }
  const prog = G.tenter_progression(TOP, BOT, pos);
  if (prog) { pos = prog; log.push(`${TOP.nom} progresse -> ${pos}`); }
  const [s2, r2] = G.tenter_soumission_bottom(BOT, TOP, pos);
  if (s2) { log.push(`${BOT.nom} attaque ${s2} d'en bas -> ${r2}`); if (r2 === "SOUMISSION") break; }
  const [tech, dest] = G.tenter_evasion(BOT, TOP, pos);
  if (dest === "debout") { log.push(`${BOT.nom} ${tech} -> se releve, retour debout`); break; }
  else if (dest) { pos = dest; log.push(`${BOT.nom} ${tech} -> passe en ${pos}`); }
  else log.push(`${BOT.nom} ${tech} -> maintenu en ${pos}`);
}
log.forEach(l => console.log("   " + l));
