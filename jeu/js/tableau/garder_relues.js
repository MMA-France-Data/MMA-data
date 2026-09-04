/** garder_relues.js — NE GARDER QUE CE QUE MAEL A RELU.
 *     node garder_relues.js scenes_relues.json
 *  (Mael, 03/09 : « tu enlèves les autres, je les ai de côté sur mon PC,
 *  je t'enverrai petit à petit, trois-quatre scènes par sujet. »)
 *  Les scènes retirées ne sont pas perdues : elles sont dans git, et dans
 *  son tableau. */
const fs = require("fs");
const D = require("../coach_dialogue.js");
const { ecrire, CHEMIN } = require("./ecrire_scenes.js");
const S = require(CHEMIN).SCENES;
const garde = new Set(JSON.parse(fs.readFileSync(process.argv[2], "utf8")));
let av = 0, ap = 0;
for (const m of D.MOMENTS) { av += (S[m] || []).length; S[m] = (S[m] || []).filter((s) => garde.has(s.cle)); ap += S[m].length; }
fs.writeFileSync(__dirname + "/etat_corpus.json", JSON.stringify({ partiel: true, depuis: "03/09", relues: [...garde] }, null, 1));
ecrire(S);
console.log(`${av} → ${ap} scènes gardées (relues par Mael)`);
