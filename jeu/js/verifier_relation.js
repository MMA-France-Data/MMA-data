/**
 * verifier_relation.js — BANC 20 : LA RELATION A L'ORGANISATION.
 *
 * Ce banc prouve quatre choses :
 *   1. le chiffre bouge exactement comme dicte, et JAMAIS ne sort a
 *      l'ecran — seuls les mots sortent ;
 *   2. le refus repete coute plus cher qu'un refus, et une acceptation
 *      remet le compteur a zero ;
 *   3. le spectacle SE LIT DANS L'EMPREINTE (regle 7), il ne se decrete
 *      pas — et il reste rare (~20 %), sinon ce n'est plus un spectacle ;
 *   4. la relation achete vraiment quelque chose : place, bourse, durete.
 */

const R = require("./relation.js");
const V = require("./vivier.js");
const C = require("./cartes.js");
const CL = require("./classement.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

/* ------------------------------------- 1. le chiffre bouge comme dicte */
{
  const e = R.etatDepart();
  const av = e.HEX.valeur;
  const m1 = R.bouger(e, "HEX", "depannage");
  const m2 = R.bouger(e, "HEX", "pesee_loupee");
  dit("dépanner monte de 15, rater le poids coûte 18 — les entrées sont exactes",
    m1.apres === av + 15 && m2.apres === av + 15 - 18,
    `${av} → ${m1.apres} → ${m2.apres}`);

  const e2 = R.etatDepart();
  for (let i = 0; i < 40; i++) R.bouger(e2, "HEX", "refus");
  const e3 = R.etatDepart();
  for (let i = 0; i < 40; i++) R.bouger(e3, "HEX", "depannage");
  dit("la relation reste bornée entre 0 et 100",
    e2.HEX.valeur === 0 && e3.HEX.valeur === 100,
    `plancher ${e2.HEX.valeur} · plafond ${e3.HEX.valeur}`);
}

/* ------------------ 2. le refus repete, et le pardon d'une acceptation */
{
  const e = R.etatDepart();
  const r1 = R.bouger(e, "HEX", "refus");
  const r2 = R.bouger(e, "HEX", "refus");
  const d1 = r1.avant - r1.apres, d2 = r2.avant - r2.apres;

  const e2 = R.etatDepart();
  R.bouger(e2, "HEX", "refus");
  R.bouger(e2, "HEX", "acceptation");
  const r3 = R.bouger(e2, "HEX", "refus");
  const d3 = r3.avant - r3.apres;

  dit("le deuxième refus de suite coûte bien plus cher, une acceptation efface l'ardoise",
    d2 > d1 && d3 === d1,
    `1er refus −${d1} · 2e d'affilée −${d2} · après acceptation −${d3}`);
}

/* --------------- 3. les mots seulement : aucun chiffre vers l'ecran */
{
  const e = R.etatDepart();
  let ok = true, exemple = "";
  for (let v = 0; v <= 100; v++) {
    e.HEX.valeur = v;
    const p = R.lire(v);
    if (!p || !p.mot) { ok = false; exemple = `pas de mot à ${v}`; break; }
    if (/\d/.test(p.mot)) { ok = false; exemple = `chiffre dans "${p.mot}"`; break; }
  }
  for (const c of Object.values(R.COMMENTAIRES))
    if (c && /\d/.test(c)) { ok = false; exemple = `chiffre dans "${c}"`; }
  dit("aucun paliers ni commentaire ne laisse fuir un chiffre vers l'écran",
    ok, exemple || "101 valeurs et tous les commentaires passés au filtre");

  const e2 = R.etatDepart();
  e2.HEX.valeur = 30;
  const m = R.bouger(e2, "HEX", "depannage");
  dit("un mouvement fort se sent : le franchissement de palier est signalé",
    m.franchi === true && m.commentaire !== null,
    `"${m.commentaire}" → ${m.palier.mot}`);
}

/* -------- 4. le spectacle se lit dans l'empreinte, et il reste rare */
{
  const mo = V.monde(11);
  const AN = C.vivre(mo, 0, 180);
  const paires = [];
  for (const r of AN.resultats) {
    const la = mo.pros.get(r.a), lb = mo.pros.get(r.b);
    if (!la || !lb || !la.vie || !lb.vie) continue;
    const ea = la.vie.empreintes.find(x => x.jour === r.jour);
    const eb = lb.vie.empreintes.find(x => x.jour === r.jour);
    if (ea && eb) paires.push([ea, eb, r]);
  }
  const spec = paires.filter(([a, b]) => R.estSpectacle(a, b));
  const part = spec.length / paires.length;
  dit("le spectacle reste rare — sinon la prime devient un dû",
    part >= 0.10 && part <= 0.28,
    `${spec.length} / ${paires.length} (${Math.round(part * 100)} %)`);

  // Regle 7 : un combat sans rien (peu de volume, decision, pas de sol)
  // n'est JAMAIS un spectacle, quoi qu'on en dise.
  const plat = { rounds: 3, methode: "DÉCISION", sig: [40, 120], kd: 0, sub: 0,
                 pos: { distance: [30, 90], clinch: [5, 15], sol: [5, 15] } };
  dit("une décision sans volume ni sol n'est jamais un spectacle",
    !R.estSpectacle(plat, plat), "cas construit");

  // Et un finish a plusieurs chutes en est TOUJOURS un.
  const violent = { rounds: 2, methode: "KO", sig: [60, 120], kd: 2, sub: 0,
                    pos: { distance: [55, 110], clinch: [3, 6], sol: [2, 4] } };
  dit("un KO à deux knockdowns en est toujours un",
    R.estSpectacle(violent, violent), "cas construit");
}

/* ---------------------------- 5. la relation achete vraiment quelque chose */
{
  const e = R.etatDepart();
  e.AFC.valeur = 90;
  const haut = R.faveurs(e, "AFC");
  e.AFC.valeur = 10;
  const bas = R.faveurs(e, "AFC");
  dit("bien vu : meilleure place, meilleure bourse, adversaire plus juste — mal vu : l'inverse",
    haut.place > bas.place && haut.bourse > bas.bourse && haut.durete < bas.durete,
    `haut : +${haut.place} cran(s), bourse ×${haut.bourse}, dureté ${haut.durete} · ` +
    `bas : +${bas.place}, ×${bas.bourse}, dureté ${bas.durete}`);

  let ok = true;
  for (const org of Object.keys(CL.ORGS)) {
    const f = R.faveurs(R.etatDepart(), org);
    if (f.bourse < 0.85 || f.bourse > 1.20) ok = false;
  }
  dit("les faveurs valent pour les seize organisations, dans les bornes", ok,
    "16 orgs");
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — la relation vit en chiffre, se lit en mots, et le spectacle sort du log.");
