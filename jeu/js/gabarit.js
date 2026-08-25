/**
 * gabarit.js — EMBARQUE combat_reel.template.html DANS UN FICHIER JS.
 *
 * Pourquoi : demo_jeu.html doit pouvoir ouvrir l'ecran de combat en
 * surcouche. Le lire avec fetch() est impossible en file:// (le navigateur
 * refuse), et le recopier dans la page creerait une DEUXIEME version du
 * gabarit — exactement la double source qu'on chasse depuis v25.
 * Ce script fait donc ce que bundler.js fait pour les modules : une
 * TRANSFORMATION MECANIQUE, zero logique. Le gabarit est embarque TEL QUEL,
 * caractere pour caractere, dans une chaine.
 *
 *     node js/gabarit.js   ->  js/ecran.gabarit.js   (window.MMA_ECRAN)
 *
 * Il se REGENERE, il ne s'edite jamais a la main. La seule source du
 * gabarit reste combat_reel.template.html, celui que combat.js --html
 * utilise deja pour produire un ecran autonome.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "combat_reel.template.html");
if (!fs.existsSync(src)) {
  console.error("combat_reel.template.html absent — le gabarit est la source, pas ce script.");
  process.exit(1);
}
const gabarit = fs.readFileSync(src, "utf8");

if (!gabarit.includes("/*__DATA__*/")) {
  console.error("le gabarit n'a plus son point d'injection /*__DATA__*/ — arret.");
  process.exit(1);
}

// JSON.stringify est le seul echappement sur : il rend une chaine JS valide
// pour n'importe quel contenu, guillemets et sauts de ligne compris.
const sortie = `/* ECRIT PAR js/gabarit.js — NE PAS EDITER.
   Source unique : combat_reel.template.html (${gabarit.length} caracteres).
   Regenerer : node js/gabarit.js */
(function (racine) {
  racine.MMA_ECRAN = {
    gabarit: ${JSON.stringify(gabarit)},

    /** Gabarit + donnees -> page complete, prete pour un srcdoc d'iframe.
     *  Deux gardes : le point d'injection doit EXISTER (sinon replace ne fait
     *  rien en silence et la page produite a un \`const DATA = ;\`), et il ne
     *  doit plus en rester apres. */
    page: function (donnees) {
      if (this.gabarit.indexOf("/*__DATA__*/") < 0)
        throw new Error("MMA_ECRAN : gabarit sans point d'injection");
      // /!\\ FONCTION, pas chaine : String.replace interprete $&, $\` et $'
      // dans le remplacement, et un $ dans les donnees corromprait la page.
      const json = JSON.stringify(donnees);
      const html = this.gabarit.replace("/*__DATA__*/", () => json);
      if (html.includes("__DATA__")) throw new Error("MMA_ECRAN : injection ratee");
      return html;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

const dest = path.join(__dirname, "ecran.gabarit.js");
fs.writeFileSync(dest, sortie);
console.log(`ecran.gabarit.js ecrit — gabarit de ${(gabarit.length / 1024).toFixed(1)} Ko embarque tel quel`);
