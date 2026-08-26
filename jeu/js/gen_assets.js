/**
 * gen_assets.js — EMBARQUE LES VISUELS DE assets/ DANS UN FICHIER JS.
 *
 * Meme famille que gabarit.js et bundler.js : TRANSFORMATION MECANIQUE,
 * ZERO LOGIQUE. Chaque fichier de assets/ devient une entree de
 * window.MMA_ASSETS, encodee en data URI. js/assets.js se REGENERE, il ne
 * s'edite jamais — la source, ce sont les fichiers de assets/.
 *
 *     node js/gen_assets.js   ->   js/assets.js   (window.MMA_ASSETS)
 *
 * ===================================================================
 * LE CONTRAT AVEC CANVA (25/08)
 * ===================================================================
 * Les SVG de assets/ sont les VISUELS DE SECOURS, dessines a la main. Les
 * vrais designs vivent dans le Canva de Mael (liens au carnet). Le
 * connecteur de la session ne pouvait PAS exporter les pixels (droit
 * refuse + reseau bloque) : le raccord est donc un DEPOT DE FICHIER —
 * telecharger le PNG depuis Canva, le poser dans assets/ sous le MEME
 * NOM DE BASE (logo_HEX.png a cote de logo_HEX.svg), relancer ce script.
 * /!\ A NOM EGAL, LE RASTER GAGNE : un logo_HEX.png ECLIPSE logo_HEX.svg.
 * C'est la regle qui permet de remplacer sans toucher au code — et sans
 * supprimer le secours, qui reprend si le PNG s'en va.
 *
 * ===================================================================
 * /!\ LE POIDS EST UN CONTRAT, PAS UN VOEU
 * ===================================================================
 * La page autonome doit rester transportable sur telephone (cas 122 : le
 * quota se paie en silence). Ce script REFUSE de construire au-dela des
 * plafonds — plutot qu'un jeu qui grossit sans que personne ne le voie :
 *     un fichier   : 120 Ko encodes
 *     le total     : 400 Ko encodes
 * Un PNG Canva trop lourd se reexporte plus petit (l'export Canva prend
 * une largeur en pixels) — on ne releve pas le plafond pour lui.
 */
const fs = require("fs");
const path = require("path");

const DOSSIER = path.join(__dirname, "..", "assets");
const SORTIE = path.join(__dirname, "assets.js");
const PLAFOND_FICHIER = 120 * 1024;
const PLAFOND_TOTAL = 400 * 1024;

const MIME = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg",
               jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
/* A nom de base egal, le premier format present dans CET ordre gagne. */
const PRIORITE = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

if (!fs.existsSync(DOSSIER)) {
  console.error("assets/ absent — rien a embarquer.");
  process.exit(1);
}

const parNom = new Map();
for (const f of fs.readdirSync(DOSSIER).sort()) {
  const ext = f.split(".").pop().toLowerCase();
  if (!MIME[ext]) continue;
  const nom = f.slice(0, -(ext.length + 1));
  const deja = parNom.get(nom);
  if (!deja || PRIORITE.indexOf(ext) < PRIORITE.indexOf(deja.ext))
    parNom.set(nom, { ext, fichier: f });
}
if (!parNom.size) { console.error("assets/ ne contient aucun visuel lisible."); process.exit(1); }

let total = 0;
const entrees = [];
for (const [nom, { ext, fichier }] of [...parNom.entries()].sort()) {
  const brut = fs.readFileSync(path.join(DOSSIER, fichier));
  const uri = `data:${MIME[ext]};base64,${brut.toString("base64")}`;
  if (uri.length > PLAFOND_FICHIER) {
    console.error(`${fichier} : ${Math.round(uri.length / 1024)} Ko encodes — plafond ${PLAFOND_FICHIER / 1024} Ko.`
      + ` Reexporter plus petit depuis Canva plutot que relever le plafond.`);
    process.exit(1);
  }
  total += uri.length;
  entrees.push(`  ${JSON.stringify(nom)}: ${JSON.stringify(uri)}`);
  console.log(`  ${nom.padEnd(12)} ${fichier.padEnd(16)} ${Math.round(uri.length / 1024)} Ko`);
}
if (total > PLAFOND_TOTAL) {
  console.error(`total ${Math.round(total / 1024)} Ko encodes — plafond ${PLAFOND_TOTAL / 1024} Ko. Alleger avant de construire.`);
  process.exit(1);
}

const sortie = `/* ECRIT PAR js/gen_assets.js — NE PAS EDITER.
   Sources : assets/ (${parNom.size} visuels, ${Math.round(total / 1024)} Ko encodes).
   Regenerer : node js/gen_assets.js */
(function (racine) {
  racine.MMA_ASSETS = {
${entrees.join(",\n")}
  };
})(typeof window !== "undefined" ? window : globalThis);
`;
fs.writeFileSync(SORTIE, sortie);
console.log(`assets.js ecrit — ${parNom.size} visuels, ${Math.round(total / 1024)} Ko encodes (plafond ${PLAFOND_TOTAL / 1024} Ko)`);
