/**
 * apercu.js — UN SEUL FICHIER, POUR REGARDER.
 *
 * demo_jeu.html charge deux scripts externes (moteur.bundle.js et
 * ecran.gabarit.js). C'est la bonne forme pour travailler : une seule source
 * par artefact. Mais ca empeche de faire circuler la page toute seule — dans
 * une conversation, une piece jointe, un navigateur strict sur file://.
 *
 * Ce script produit apercu.html : la meme page, avec les deux scripts
 * RECOPIES DEDANS. C'est un artefact JETABLE, au meme titre que
 * moteur.bundle.js : il se REGENERE (`node js/apercu.js`), il ne s'edite
 * JAMAIS, et il n'entre pas dans l'archive. La source reste demo_jeu.html.
 *
 * /!\ Si tu te retrouves un jour a corriger un bug dans apercu.html, tu es
 * en train de creer la deuxieme source qu'on chasse depuis v25. Corrige
 * demo_jeu.html et relance ce script.
 */
const fs = require("fs");
const path = require("path");

const R = path.join(__dirname, "..");
const page = path.join(R, "demo_jeu.html");
let html = fs.readFileSync(page, "utf8");

const aInliner = ["js/moteur.bundle.js", "js/ecran.gabarit.js"];
for (const rel of aInliner) {
  const abs = path.join(R, rel);
  if (!fs.existsSync(abs)) {
    console.error(`${rel} absent — lancer d'abord : node js/bundler.js && node js/gabarit.js`);
    process.exit(1);
  }
  const balise = `<script src="${rel}"></script>`;
  if (!html.includes(balise)) {
    console.error(`balise introuvable dans demo_jeu.html : ${balise}`);
    process.exit(1);
  }
  const code = fs.readFileSync(abs, "utf8");
  // Deux pieges, tous deux vus en vrai :
  // 1. Un "</script>" dans une chaine du code fermerait la balise navigateur.
  // 2. /!\ String.replace INTERPRETE $&, $` et $' dans le remplacement. Le
  //    bundle contient `tête$\`` (fin de regex + backtick) : passe en chaine,
  //    $\` a insere tout le debut du document au milieu du code. On passe
  //    donc une FONCTION, qui desactive toute interpretation.
  const remplacant = `<script>/* inline de ${rel} — voir js/apercu.js */\n`
    + code.replace(/<\/script>/g, "<\\/script>") + `\n</script>`;
  html = html.replace(balise, () => remplacant);
}

if (html.includes('<script src="js/')) {
  console.error("il reste un script externe — l'apercu ne serait pas autonome.");
  process.exit(1);
}

const dest = path.join(R, "apercu.html");
fs.writeFileSync(dest, html);
console.log(`apercu.html ecrit — ${(html.length / 1024).toFixed(0)} Ko, autonome`);
