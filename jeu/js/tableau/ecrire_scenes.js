/** ecrire_scenes.js — LA SEULE FACON D'ECRIRE coach_scenes.js.
 *  Le fichier est GENERE : remettre_coachs.js (le retour du tableau) et
 *  garder_relues.js (la coupe au relu) passent tous deux par ici — un seul
 *  serialiseur, pas deux exemplaires. */
const fs = require("fs"), path = require("path");
const D = require("../coach_dialogue.js");
const CHEMIN = path.join(__dirname, "..", "coach_scenes.js");
const ETAT = path.join(__dirname, "etat_corpus.json");
function ecrire(S) {
  const etat = fs.existsSync(ETAT) ? JSON.parse(fs.readFileSync(ETAT, "utf8")) : { partiel: false };
  const src = fs.readFileSync(CHEMIN, "utf8");
  const tete = src.slice(0, src.indexOf("const bureau = [];"));
  const q = (x) => JSON.stringify(x);
  const sc = (s) => {
    const meta = [`cle:${q(s.cle)}`, s.sujet ? `sujet:${q(s.sujet)}` : null, `si:${q(s.si)}`,
      `vie:${q(s.vie || "courante")}`, s.voix && s.voix.length ? `voix:${q(s.voix)}` : null].filter(Boolean).join(",");
    const ch = s.choix.map((c) => "  {" + [`lab:${q(c.lab)}`, `r:${q(c.r)}`, `d:${c.d}`, `ton:${q(c.ton)}`,
      c.effet ? `effet:${q(c.effet)}` : null, c.ouvre ? `ouvre:${q(c.ouvre)}` : null].filter(Boolean).join(",") + "}").join(",\n");
    return `{${meta},\n texte:${q(s.texte)},\n choix:[\n${ch}]}`;
  };
  let corps = "const bureau = [];\nconst bord_du_tapis = [];\nconst debrief = [];\nconst accrochage = [];\nconst porte = [];\n\n";
  for (const m of D.MOMENTS) {
    corps += `/* ==================================================================== */\n/* ${m.toUpperCase()} */\n/* ==================================================================== */\n`;
    corps += (S[m] || []).length ? `${m}.push(\n${S[m].map(sc).join(",\n\n")}\n);\n\n` : `/* (vide — en attente des scènes de Mael) */\n\n`;
  }
  corps += "/* ==================================================================== */\n"
    + "/* /!\\ CORPUS_PARTIEL : tant que Mael relit, le jeu ne porte QUE ce qu'il a\n"
    + "   relu (tableau/etat_corpus.json). Le banc 39 met alors ses assertions de\n"
    + "   COUVERTURE en attente — jamais celles de forme. */\n"
    + `const CORPUS_PARTIEL = ${etat.partiel ? "true" : "false"};\n`
    + "const SCENES = { bureau, bord_du_tapis, debrief, accrochage, porte };\nmodule.exports = { SCENES, CORPUS_PARTIEL };\n";
  fs.writeFileSync(CHEMIN, tete + corps);
}
module.exports = { ecrire, CHEMIN };
