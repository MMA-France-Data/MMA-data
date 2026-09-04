/**
 * remettre_coachs.js — APPLIQUER LE TABLEAU DE MAEL AU CONTENU DU JEU.
 *
 *     node remettre_coachs.js retours.json
 *
 * coach_scenes.js est GENERE : on le reecrit entierement depuis le modele
 * (metadonnees actuelles + textes du tableau), on ne le retouche pas a la
 * main. Les commentaires d'en-tete du fichier sont conserves tels quels.
 * Puis c'est au banc 39 de juger — ce script ne refuse rien lui-meme.
 */
const fs = require("fs"), path = require("path");
const D = require("../coach_dialogue.js");
const CHEMIN = path.join(__dirname, "..", "coach_scenes.js");
const S = require(CHEMIN).SCENES;
const R = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const par = {}; for (const l of R.lignes) par[l.id] = l;

let modif = 0, ajout = 0, suppr = 0;
for (const m of D.MOMENTS) for (const s of (S[m] || [])) {
  const choix = [];
  let i = 0;
  /* les reponses existantes, dans l'ordre ; puis celles ajoutees (#n au-dela) */
  while (true) {
    i++;
    const l = par[s.cle + "#" + i];
    const c = s.choix[i - 1];
    if (!l && !c) break;
    if (!l) { choix.push(c); continue; }                      // ligne absente du tableau : inchangee
    if (l.supprimer) { if (c) suppr++; continue; }
    if (l.texte && i === 1 && l.texte !== s.texte) { s.texte = l.texte; modif++; }
    const n = { lab: l.lab, r: l.r, d: l.d, ton: l.ton };
    if (l.effet) n.effet = l.effet;
    if (c && c.ouvre) n.ouvre = c.ouvre;
    if (!c) ajout++;
    else if (c.lab !== n.lab || c.r !== n.r || c.d !== n.d || c.ton !== n.ton || (c.effet || "") !== (n.effet || "")) modif++;
    choix.push(n);
  }
  s.choix = choix;
}
/* /!\ UNE SCENE DONT TOUTES LES REPONSES SONT EFFACEES DISPARAIT. Mael a
   vide les quatre reponses de ung_10 : c'est la scene qu'il retire, pas
   ses boutons — une scene sans reponse serait un ecran mort, et le banc
   la refuserait. */
for (const m of D.MOMENTS) {
  const avant = (S[m] || []).length;
  S[m] = (S[m] || []).filter((s) => s.choix.length > 0);
  if (S[m].length < avant) console.log(`${avant - S[m].length} scene(s) retiree(s) de ${m} — toutes leurs reponses etaient effacees`);
}

/* ---- reecriture : en-tete conserve, corps regenere ---- */
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
  corps += `/* ==================================================================== */\n/* ${m.toUpperCase()} */\n/* ==================================================================== */\n${m}.push(\n`;
  corps += (S[m] || []).map(sc).join(",\n\n") + "\n);\n\n";
}
corps += "/* ==================================================================== */\nconst SCENES = { bureau, bord_du_tapis, debrief, accrochage, porte };\nmodule.exports = { SCENES };\n";
fs.writeFileSync(CHEMIN, tete + corps);
console.log(`coach_scenes.js réécrit — ${modif} modifiée(s), ${ajout} ajoutée(s), ${suppr} supprimée(s)`);
if (R.refus.length) { console.log(`${R.refus.length} ligne(s) refusée(s) à la lecture :`); for (const r of R.refus) console.log("  ✗", r); }
