/** vider_coachs.js — le contenu des coachs, a plat, une ligne par reponse.
 *  Sert a exporter_coachs.py. Rien d'autre ne le lit. */
const D = require("../coach_dialogue.js"), S = require("../coach_scenes.js").SCENES;
const rows = [];
for (const m of D.MOMENTS) for (const s of (S[m] || [])) (s.choix || []).forEach((c, i) => rows.push({
  id: s.cle + "#" + (i + 1), moment: m, sujet: s.sujet || "", si: s.si, voix: (s.voix || []).join(", "),
  vie: s.vie || "courante", texte: s.texte, lab: c.lab, r: c.r, d: c.d, ton: c.ton, effet: c.effet || "", ouvre: c.ouvre || "" }));
process.stdout.write(JSON.stringify({ rows, SUJETS: D.SUJETS, MOMENTS: D.MOMENTS }));
