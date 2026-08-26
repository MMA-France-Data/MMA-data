/**
 * verifier_assets.js — BANC 31 : LES VISUELS.
 *
 * Quatre choses, et pas une de plus :
 *   1. LE GENERATEUR EST UNE MACHINE : deux passages, le meme octet. Et
 *      un raster ECLIPSE le SVG de meme nom — c'est le contrat Canva.
 *   2. LE POIDS EST UN CONTRAT : chaque visuel et le total sous plafond,
 *      et le generateur REFUSE au-dela (pas un avertissement — un refus).
 *   3. CA SE VOIT : chaque organisation a son logo A L'ECRAN, l'accueil a
 *      son fond, la legende sa plaque, le soir de combat son affiche.
 *   4. ET LE JEU TIENT SANS EUX : assets.js retire, memes ecrans, zero
 *      exception, aucun "undefined" ni "null" dans le HTML.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { ouvrirPartie } = require("./bac_partie.js");
const CL = require("./classement.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

console.log("BANC 31 — les visuels : embarques, bornes, visibles, facultatifs.");

const SORTIE = path.join(__dirname, "assets.js");
const DOSSIER = path.join(__dirname, "..", "assets");

/* ==================================================================== */
/* 1. LE GENERATEUR                                                      */
/* ==================================================================== */
{
  execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" });
  const un = fs.readFileSync(SORTIE);
  execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" });
  dit("deux passages du générateur rendent le même octet",
      un.equals(fs.readFileSync(SORTIE)), `${un.length} octets`);

  /* Le contrat Canva : un raster de meme nom eclipse le SVG. On le prouve
     avec un vrai PNG d'un pixel, puis on remet tout en ordre. */
  const PNG_1PX = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQAB"
    + "pfZFQAAAAABJRU5ErkJggg==", "base64");
  const eclipse = path.join(DOSSIER, "logo_HEX.png");
  try {
    fs.writeFileSync(eclipse, PNG_1PX);
    execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" });
    const src = fs.readFileSync(SORTIE, "utf8");
    dit("un PNG déposé sous le même nom éclipse le SVG de secours",
        /"logo_HEX": "data:image\/png/.test(src), "logo_HEX.png a pris la place");
  } finally {
    fs.unlinkSync(eclipse);
    execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" });
  }
  dit("et le secours reprend quand le PNG s'en va",
      /"logo_HEX": "data:image\/svg/.test(fs.readFileSync(SORTIE, "utf8")));
}

/* ==================================================================== */
/* 2. LE POIDS                                                           */
/* ==================================================================== */
{
  const src = fs.readFileSync(SORTIE, "utf8");
  const uris = [...src.matchAll(/"(data:[^"]+)"/g)].map((m) => m[1]);
  const total = uris.reduce((a, u) => a + u.length, 0);
  dit("chaque visuel tient sous son plafond (120 Ko)",
      uris.every((u) => u.length <= 120 * 1024),
      `le plus lourd : ${Math.round(Math.max(...uris.map((u) => u.length)) / 1024)} Ko`);
  dit("le total tient sous le plafond (400 Ko)", total <= 400 * 1024,
      `${Math.round(total / 1024)} Ko encodés`);

  /* LE REFUS EST REEL : un fichier au-dela du plafond fait ECHOUER le
     generateur — on le prouve, on ne le suppose pas. */
  const gros = path.join(DOSSIER, "zz_trop_gros.png");
  try {
    fs.writeFileSync(gros, Buffer.alloc(150 * 1024, 7));
    let refuse = false;
    try { execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" }); }
    catch (e) { refuse = true; }
    dit("un visuel trop lourd fait refuser la construction", refuse);
  } finally {
    fs.unlinkSync(gros);
    execFileSync("node", [path.join(__dirname, "gen_assets.js")], { stdio: "pipe" });
  }
}

/* ==================================================================== */
/* 3. CA SE VOIT                                                         */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 3 });
  const orgas = P.lire(`(function(){demarrerMonde();synchroniserMonde();
    rendreMonde();return document.getElementById("mo-orgas").innerHTML;})()`);
  /* /!\ ON COMPTE CONTRE LA TABLE DU MONDE VIVANT, PAS CONTRE LES CINQ
     DU FICHIER : vivier.js injecte onze nationales a l'ouverture — c'est
     l'ecran qui l'a appris au banc, pas l'inverse. Une carte, une image :
     les cinq grandes par leurs visuels, les autres par le monogramme. */
  const nbOrgs = P.lire("Object.keys(MMA.classement.ORGS).length");
  const nbImg = (orgas.match(/<img /g) || []).length;
  dit("chaque organisation du monde a sa pastille dans l'onglet Monde",
      nbImg >= nbOrgs && nbOrgs > 5, `${nbImg} images pour ${nbOrgs} organisations`);
  dit("les cinq grandes portent leurs visuels d'assets, pas le monogramme",
      (orgas.match(/data:image\/svg\+xml;base64/g) || []).length >= 5,
      "base64 = assets · utf8 = monogramme");

  dit("l'accueil a son fond", P.lire(`(function(){ouvrirAccueil();
    const z=document.getElementById("accueil");
    return z.style.cssText.includes("data:image");})()`));

  dit("la plaque dorée habille la légende du mur", P.lire(`(function(){
    murDeLaSalle().unshift({cle:"X",nom:"X",rang:"legende",mot:"Légende",
      bilan:"12-1",titres:1,annees:6,an:2030,pourquoi:"Test."});
    ouvrirHeritage();
    const h=document.getElementById("fiche").innerHTML;
    murDeLaSalle().shift();
    return h.includes("data:image");})()`));

  dit("le soir du combat porte l'affiche", P.lire(`(function(){
    bloque={id:"combat",titre:"Combat",texte:"x",action:"Lancer"};
    rendreSalle();
    const h=document.getElementById("zone-attend").innerHTML;
    bloque=null;
    return h.includes("data:image");})()`));
  /* /!\\ ET ELLE N'HABILLE QUE LUI : une visite avec la meme affiche
     mentirait sur l'importance. */
  dit("mais une simple échéance reste sobre", P.lire(`(function(){
    bloque={id:"gala",titre:"Gala",texte:"x",action:"Voir"};
    rendreSalle();
    const h=document.getElementById("zone-attend").innerHTML;
    bloque=null;
    return !h.includes("data:image");})()`));

  dit("aucune exception avec les visuels", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* 4. LE JEU TIENT SANS EUX                                              */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 3, sansAssets: true });
  const h = P.lire(`(function(){demarrerMonde();synchroniserMonde();
    rendreMonde();ouvrirAccueil();
    const a=document.getElementById("mo-orgas").innerHTML;
    const b=document.getElementById("accueil").style.cssText;
    bloque={id:"combat",titre:"Combat",texte:"x",action:"Lancer"};rendreSalle();
    const c=document.getElementById("zone-attend").innerHTML;bloque=null;
    return a+"|"+b+"|"+c;})()`);
  dit("sans assets.js, les mêmes écrans se rendent", typeof h === "string" && h.length > 50);
  const [orgasSans, accueilSans, combatSans] = h.split("|");
  dit("les organisations gardent leur monogramme même sans visuels",
      (orgasSans.match(/<img /g) || []).length >= 5, "le repli ne dépend pas d'assets.js");
  dit("mais ni fond d'accueil ni affiche ne s'inventent",
      !accueilSans.includes("data:image") && !combatSans.includes("data:image"));
  dit("et aucun « undefined » à l'écran", !/undefined|>null</.test(h));
  dit("et sans une seule exception", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — les visuels s'embarquent, se voient, se bornent, et le jeu tient sans eux."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
