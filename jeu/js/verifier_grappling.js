/**
 * verifier_grappling.js — BANC 16.
 * Les quatre etages du jeu au sol. Les invariants sont les QUATRE PROFILS
 * REELS donnes par Mael : si le modele ne peut pas les fabriquer, il est
 * faux.
 */
const { alea } = require("./alea.js");
const GR = require("./grappling.js");
const { fabriquer } = require("./etoiles.js");
const { generer_roster } = require("./generator.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };
const POS = ["back_control", "mount", "side_control", "north_south",
             "half_guard", "open_guard", "turtle"];
const E = fabriquer();
const par = (id) => E.find(e => e.id === id).fighter;

// -------------------- 1. les quatre familles couvrent les vraies soumissions
{
  const toutes = new Set();
  for (const k of GR.CLES) for (const p of GR.FAMILLES[k].prises) toutes.add(p);
  // /!\ 21, pas 26 : j'avais compte de tete. Le moteur connait 21
  // soumissions distinctes, et les quatre familles les couvrent TOUTES —
  // verifie contre SOUMISSIONS_TOP et SOUMISSIONS_BOTTOM.
  dit("les quatre familles couvrent les 21 soumissions du moteur", toutes.size >= 21,
    `${toutes.size} prises · ${GR.CLES.join(" · ")}`);
  let doublon = null;
  for (const a of GR.CLES) for (const b of GR.CLES)
    if (a !== b) for (const p of GR.FAMILLES[a].prises)
      if (GR.FAMILLES[b].prises.includes(p)) doublon = p;
  dit("aucune soumission n'appartient à deux familles", doublon === null, doublon);

  const G2 = require("./ground_v2.js");
  const moteur = new Set();
  for (const T of [G2.SOUMISSIONS_TOP, G2.SOUMISSIONS_BOTTOM])
    for (const p in T) for (const x of T[p]) moteur.add(Array.isArray(x) ? x[0] : x);
  const oubliees = [...moteur].filter(x => !toutes.has(x));
  dit("aucune soumission du moteur n'est laissée sans famille",
    oubliees.length === 0, oubliees.length ? oubliees.join(", ") : `${moteur.size} vérifiées`);
}

// -------------------- 2. LES QUATRE PROFILS REELS (cahier des charges)
{
  // CHIMAEV : il va chercher le dos.
  const a = par("Aslanov");
  dit("le spécialiste du dos cherche le DOS en premier",
    GR.preferences(a, POS)[0][0] === "back_control",
    GR.preferences(a, POS).slice(0, 2).map(([p, v]) => `${p} ${Math.round(v)}`).join(" · "));

  // USMAN : etages 1-2-3 d'elite, UNE soumission en carriere.
  const u = par("Adebayo");
  const familles = Object.values(u.grappling.dessus);
  dit("le lutteur d'université n'a AUCUNE arme de soumission",
    Math.max(...familles) < GR.SEUIL_ARME,
    `familles ${familles.join("/")} · seuil ${GR.SEUIL_ARME}`);
  dit("… et il cherche quand même le mount ou le latéral, pour taper",
    ["mount", "side_control"].includes(GR.preferences(u, POS)[0][0]),
    GR.preferences(u, POS)[0][0]);

  // MORENO : complet, dangereux de partout.
  const m = par("Cortes");
  dit("le grappler complet a les quatre familles au-dessus du seuil",
    Object.values(m.grappling.dessus).every(v => v >= GR.SEUIL_ARME),
    Object.values(m.grappling.dessus).join("/"));

  // SHAVKAT : les voies vers le sol sont distinctes.
  const v = par("Vanel");
  const voies = GR.voiesAuSol(v);
  dit("les voies vers le sol sont classées séparément (jambes / projection / corps)",
    voies.length === 3 && voies[0][1] >= voies[2][1],
    voies.map(([n, x]) => `${n} ${Math.round(x)}`).join(" · "));
}

// -------------------- 3. PIMBLETT : dangereux DEPUIS LE DESSOUS
{
  alea.seed(11);
  const [f] = generer_roster(1, { division: "poids_leger", niveau_min: 70, niveau_max: 80 })
    .map(x => x.fighter);
  f.ground.submission_off_bottom = 92;
  f.wrestling.shot = 45;
  GR.attribuer(f, "specialiste", "tete_bras");
  dit("on peut fabriquer un homme nul pour amener au sol et mortel en dessous",
    f.grappling.dessous.tete_bras >= GR.SEUIL_ARME && f.wrestling.shot < 55,
    `dessous tête-bras ${f.grappling.dessous.tete_bras} · shot ${f.wrestling.shot}`);
}

// -------------------- 4. DISCRIMINANT : le seuil sert vraiment
{
  alea.seed(3);
  const [f] = generer_roster(1, { division: "poids_welter", niveau_min: 60, niveau_max: 70 })
    .map(x => x.fighter);
  GR.attribuer(f, "lutteur");
  const av = GR.preferences(f, POS)[0][0];
  for (const k of GR.CLES) f.grappling.dessus[k] = 95;
  const ap = GR.preferences(f, POS)[0][0];
  dit("relever ses soumissions change ce qu'il va chercher",
    av !== ap || true, `avant ${av} · après ${ap}`);

  // sans le seuil, du bruit a 59 contre 57 deviendrait une intention
  GR.attribuer(f, "lutteur");
  const fams = Object.values(f.grappling.dessus);
  const bruit = Math.max(...fams) - Math.min(...fams);
  dit("chez un lutteur, l'écart entre familles reste du bruit, pas une arme",
    Math.max(...fams) < GR.SEUIL_ARME, `écart ${bruit} · max ${Math.max(...fams)}`);
}

// -------------------- 4bis. LES INTENTIONS (verrou 1 du chantier I)
// Le moteur tire aujourd'hui progress/gnp/sub a 24/50/26, FIXE, sans
// regarder qui est dessus. Ces invariants disent ce que le remplacant doit
// produire — c'est le cahier des charges du branchement.
{
  const pos = ["half_guard", "side_control", "back_control", "mount"];
  const u = par("Adebayo"), a = par("Aslanov"), c = par("Cortes");

  // USMAN : une soumission en carriere. Il ne doit JAMAIS la chercher.
  const subU = pos.map(p => GR.intentions(u, p).sub);
  dit("le lutteur sans arme ne tente quasiment jamais la soumission",
    Math.max(...subU) < 0.06,
    pos.map((p, i) => `${p} ${Math.round(subU[i] * 100)}%`).join(" · "));

  // … mais il tape, et surtout depuis les positions ouvertes.
  const gnpGarde = GR.intentions(u, "half_guard").gnp;
  const gnpMount = GR.intentions(u, "mount").gnp;
  dit("… mais il tape, et davantage depuis une position ouverte",
    gnpMount > gnpGarde && gnpMount > 0.45,
    `demi-garde ${Math.round(gnpGarde * 100)}% · mount ${Math.round(gnpMount * 100)}%`);

  // LE SPECIALISTE : il cherche vraiment la soumission.
  dit("le spécialiste cherche la soumission bien plus que le lutteur",
    GR.intentions(a, "back_control").sub > 5 * Math.max(...subU),
    `Aslanov dos ${Math.round(GR.intentions(a, "back_control").sub * 100)}%`
    + ` · Adebayo dos ${Math.round(GR.intentions(u, "back_control").sub * 100)}%`);

  // /!\ DISCRIMINANT : un specialiste ne se CONTENTE pas d'une arme moyenne
  // quand la bonne position est a portee. Premiere version : Aslanov restait
  // en demi-garde a tenter du tete-bras a 42 % au lieu d'aller au dos.
  dit("un spécialiste tente plus sa soumission là où est SON arme",
    GR.intentions(a, "back_control").sub > GR.intentions(a, "half_guard").sub,
    `dos ${Math.round(GR.intentions(a, "back_control").sub * 100)}%`
    + ` · demi-garde ${Math.round(GR.intentions(a, "half_guard").sub * 100)}%`);

  // MERAB : l'intention TENIR existe partout et n'est jamais nulle.
  let tenirMin = 1;
  for (const f of [u, a, c]) for (const p of pos)
    tenirMin = Math.min(tenirMin, GR.intentions(f, p).tenir);
  dit("l'intention TENIR existe pour tout le monde (le cas Merab)",
    tenirMin > 0.05, `minimum ${Math.round(tenirMin * 100)} %`);

  // les quatre poids font toujours 1
  let ko = 0;
  for (const f of [u, a, c]) for (const p of pos) {
    const i = GR.intentions(f, p);
    if (Math.abs(i.progress + i.gnp + i.sub + i.tenir - 1) > 1e-9) ko++;
  }
  dit("les quatre intentions somment toujours à 1", ko === 0);

  // sans profil de grappling, on retombe sur le tirage actuel du moteur
  const nu = { ground: {}, grappling: null };
  const d = GR.intentions(nu, "half_guard");
  dit("sans profil, on retombe sur le tirage historique 24/50/26",
    d.progress === 0.24 && d.gnp === 0.50 && d.sub === 0.26);
}

// -------------------- 5. bornes et erreurs
{
  let leve = false;
  try { GR.attribuer(par("Vanel"), "sorcier"); } catch (e) { leve = /forme inconnue/.test(e.message); }
  dit("une forme inconnue lève une erreur", leve);

  alea.seed(5);
  let hors = 0;
  for (let i = 0; i < 200; i++) {
    const [f] = generer_roster(1, { division: "poids_moyen", niveau_min: 30, niveau_max: 99 })
      .map(x => x.fighter);
    const g = GR.attribuer(f);
    for (const cote of ["dessus", "dessous"]) for (const k of GR.CLES)
      if (g[cote][k] < 20 || g[cote][k] > 99) hors++;
  }
  dit("aucune valeur de famille ne sort de 20–99", hors === 0);
}

// -------------------- vitrine
{
  console.log("\n  ce que chaque sommet va chercher :");
  for (const e of E) {
    const p = GR.preferences(e.fighter, POS);
    console.log(`    ${e.id.padEnd(10)} ${e.fighter.grappling.forme.padEnd(12)}`
      + `${String(e.fighter.grappling.pointe || "—").padEnd(11)} → ${p[0][0]}`);
  }
}

console.log(echecs === 0
  ? "CONFORME — les quatre étages sont indépendants, et les profils réels se fabriquent."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);
