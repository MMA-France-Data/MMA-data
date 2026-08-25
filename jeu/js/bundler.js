/**
 * bundler.js — assemble les modules CommonJS du moteur en UN fichier
 * chargeable par une balise <script> : js/moteur.bundle.js
 *
 * TRANSFORMATION MECANIQUE, ZERO LOGIQUE (c'est la condition posee au
 * carnet). Chaque module est enferme tel quel dans une fonction
 * (module, exports, require) et un mini-require resout les noms "./x.js"
 * dans une table. AUCUNE ligne des modules n'est reecrite : le moteur du
 * navigateur est le meme fichier que celui des bancs de conformite.
 *
 * L'ordre est calcule par tri topologique sur les require("./x.js"), pas
 * ecrit a la main : ajouter un module ne demande rien d'autre que de le
 * citer dans RACINES.
 *
 *   node bundler.js        -> ecrit moteur.bundle.js
 *
 * /!\ tables.js est GENERE par gen_tables.py. Le bundler refuse de tourner
 * s'il est absent, plutot que de produire un bundle silencieusement faux.
 */
const fs = require("fs");
const path = require("path");

// Ce que le navigateur doit pouvoir atteindre. Le reste suit par dependance.
const RACINES = ["engine.js", "generator.js", "traducteur.js", "mesure.js",
                 "temps.js", "fiches.js", "verdict.js", "profil.js", "chrono.js", "feuille.js", "coin.js", "classement.js", "etoiles.js", "grappling.js",
                 // la saison (branchement du 09/08) : le monde, sa vie, et
                 // tout ce qui relie le joueur a lui.
                 "carriere.js", "vivier.js", "cartes.js", "salle.js",
                 "relation.js", "offres.js", "entente.js", "dialogue.js",
                 "demandes.js", "contrats.js",
                 // le chantier G (14/08) : crier depuis le coin.
                 "cris.js"];

const ici = __dirname;
const RE_REQUIRE = /require\(\s*["']\.\/([\w.-]+)["']\s*\)/g;

if (!fs.existsSync(path.join(ici, "tables.js"))) {
  console.error("tables.js absent — lancer d'abord : python3 gen_tables.py");
  process.exit(1);
}

// -- collecte + tri topologique ------------------------------------------
const deps = new Map();
function scanner(nom) {
  if (deps.has(nom)) return;
  const p = path.join(ici, nom);
  if (!fs.existsSync(p)) { console.error(`module introuvable : ${nom}`); process.exit(1); }
  const src = fs.readFileSync(p, "utf8");
  const d = [...src.matchAll(RE_REQUIRE)].map(m => m[1]);
  deps.set(nom, { src, d });
  d.forEach(scanner);
}
RACINES.forEach(scanner);

const ordre = [], vus = new Set(), pile = new Set();
function visiter(nom) {
  if (vus.has(nom)) return;
  if (pile.has(nom)) { console.error(`cycle de dependances sur ${nom}`); process.exit(1); }
  pile.add(nom);
  deps.get(nom).d.forEach(visiter);
  pile.delete(nom); vus.add(nom); ordre.push(nom);
}
RACINES.forEach(visiter);

// -- emission -------------------------------------------------------------
const morceaux = ordre.map(nom =>
  `/* ===== ${nom} ${"=".repeat(Math.max(0, 62 - nom.length))} */\n` +
  `__def("${nom}", function (module, exports, require) {\n${deps.get(nom).src}\n});\n`
);

const bundle = `/* moteur.bundle.js — GENERE PAR bundler.js, NE PAS EDITER A LA MAIN.
 * Modules embarques (ordre de dependance) : ${ordre.join(", ")}
 * Regenerer apres toute modification d'un module : node js/bundler.js
 */
(function (racine) {
  "use strict";
  var __mods = {}, __cache = {};
  function __def(nom, fn) { __mods[nom] = fn; }
  function require(nom) {
    nom = String(nom).replace(/^\\.\\//, "");
    if (__cache[nom]) return __cache[nom].exports;
    if (!__mods[nom]) throw new Error("module absent du bundle : " + nom);
    var m = { exports: {} };
    __cache[nom] = m;
    __mods[nom](m, m.exports, require);
    return m.exports;
  }

${morceaux.join("\n")}

  racine.MMA = {
    alea:       require("./alea.js"),
    engine:     require("./engine.js"),
    generator:  require("./generator.js"),
    traducteur: require("./traducteur.js"),
    mesure:     require("./mesure.js"),
    temps:      require("./temps.js"),
    fiches:     require("./fiches.js"),
    verdict:    require("./verdict.js"),
    profil:     require("./profil.js"),
    chrono:     require("./chrono.js"),
    feuille:    require("./feuille.js"),
    coin:       require("./coin.js"),
    classement: require("./classement.js"),
    etoiles:    require("./etoiles.js"),
    grappling:  require("./grappling.js"),
    // la saison (branchement du 09/08)
    carriere:   require("./carriere.js"),
    vivier:     require("./vivier.js"),
    cartes:     require("./cartes.js"),
    salle:      require("./salle.js"),
    relation:   require("./relation.js"),
    offres:     require("./offres.js"),
    entente:    require("./entente.js"),
    dialogue:   require("./dialogue.js"),
    demandes:   require("./demandes.js"),
    contrats:   require("./contrats.js"),
    cris:       require("./cris.js"),
    require: require
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

fs.writeFileSync(path.join(ici, "moteur.bundle.js"), bundle);
console.log(`moteur.bundle.js ecrit — ${ordre.length} modules, ` +
  `${Math.round(bundle.length / 1024)} Ko\n  ordre : ${ordre.join(" -> ")}`);
