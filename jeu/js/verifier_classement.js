/**
 * verifier_classement.js — BANC 14.
 *
 * classement.js n'a pas de temoin Python : il est tenu par des invariants.
 * Les quatre premiers sont les CAS DICTES PAR MAEL, verifies au chiffre
 * pres — c'est le cahier des charges, pas une approximation.
 */
const C = require("./classement.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };
const R = (x) => C.libelleRang(x);

// -------------------- 1. LES QUATRE CAS DICTES
{
  const d = C.ORGS.HEX.densite;
  const cas = [
    ["un non-classé bat le #10 : il entre entre 10 et 15", null, 10,
      (v) => v !== null && v >= 10 && v <= 15],
    ["le #10 bat le #8 : il passe 8 ou 9", 10, 8,
      (v) => v === 8 || v === 9],
    ["le #5 perd contre le #6 : il tombe 6 ou 7", 6, 5,
      (v, p) => p === 6 || p === 7],
    ["le #5 perd contre le #15 : il tombe vers 11", 15, 5,
      (v, p) => p >= 10 && p <= 12],
  ];
  for (const [nom, rv, rp, test] of cas) {
    const [nv, np] = C.bouger(rv, rp, d, 2);
    dit(nom, test(nv, np), `vainqueur ${R(rv)} → ${R(nv)} · perdant ${R(rp)} → ${R(np)}`);
  }
}

// -------------------- 2. LA MANIERE COMPTE, ET DANS LE BON SENS
{
  const d = C.ORGS.HEX.densite;
  const chute = [1, 2, 3].map(m => C.bouger(10, 8, d, m)[1]);
  dit("un combat serré coûte moins cher qu'un finish sec",
    chute[0] < chute[1] && chute[1] < chute[2],
    `serré → ${R(chute[0])} · net → ${R(chute[1])} · KO → ${R(chute[2])}`);
}

// -------------------- 3. LA DENSITE : PLUS C'EST DENSE, PLUS C'EST LONG
{
  const ordre = ["HEX", "TRI", "SOK", "GFL", "AFC"];
  const series = ordre.map(o => C.serieRequise(o, 0));
  let croissant = true;
  for (let i = 1; i < series.length; i++) if (series[i] < series[i - 1]) croissant = false;
  dit("il faut faire ses preuves plus longtemps dans une organisation dense",
    croissant && series[0] < series[series.length - 1],
    ordre.map((o, i) => `${o} ${series[i]}`).join(" · "));
}

// -------------------- 4. LA NOTORIETE OUVRE DES PORTES (demande de Mael)
{
  const inconnu = C.serieRequise("AFC", 0);
  const connu = C.serieRequise("AFC", 55);
  const star = C.serieRequise("AFC", 95);
  dit("une superstar a toujours un chemin plus court",
    star < connu && connu < inconnu,
    `inconnu ${inconnu} victoires · connu ${connu} · star ${star}`);
  dit("mais même une star doit gagner au moins une fois",
    C.serieRequise("HEX", 100) >= 1 && C.serieRequise("AFC", 100) >= 1);
}

// -------------------- 5. DISCRIMINANT : victoire/défaite en boucle ne classe pas
{
  function carriere(org, suite, noto) {
    let rang = null, serie = 0;
    for (const r of suite) {
      const classe = C.droitAuClasse(org, rang, serie, noto);
      const adv = classe ? Math.max(1, (rang === null ? 15 : rang) - 2) : null;
      if (r === "V") { [rang] = C.bouger(rang, adv, C.ORGS[org].densite, 2); serie++; }
      else { const [, np] = C.bouger(adv === null ? C.NON_CLASSE : adv, rang,
                                     C.ORGS[org].densite, 2); rang = np; serie = 0; }
    }
    return rang;
  }
  dit("victoire/défaite en boucle ne classe JAMAIS",
    carriere("HEX", "VDVDVDVDVD".split(""), 0) === null
    && carriere("AFC", "VDVDVDVDVD".split(""), 0) === null);

  const h = "VVVVVVVV".split("").reduce((a, r, i) => a, 0);
  const parcours = (org) => {
    let rang = null, serie = 0, n = 0;
    for (const r of "VVVVVVVVVV".split("")) {
      n++;
      const classe = C.droitAuClasse(org, rang, serie, 0);
      const adv = classe ? Math.max(1, (rang === null ? 15 : rang) - 2) : null;
      [rang] = C.bouger(rang, adv, C.ORGS[org].densite, 2); serie++;
      if (rang !== null) return n;
    }
    return -1;
  };
  const nH = parcours("HEX"), nU = parcours("AFC");
  dit("il faut plus de victoires pour percer à AFC qu'à HEX",
    nH > 0 && nU > nH, `HEX ${nH} victoires · AFC ${nU}`);
}

// -------------------- 6. LES BOURSES SUIVENT L'ECHELLE
{
  let ko = 0, ex = null;
  for (const o of Object.keys(C.ORGS)) {
    const e = C.bourse(o, null, false, 20)[0];
    const c = C.bourse(o, 1, true, 20)[0];
    const s = C.bourse(o, 1, true, 100)[0];
    if (!(e < c && c <= s)) { ko++; ex = ex || `${o} : ${e} / ${c} / ${s}`; }
  }
  dit("entrée < champion <= plafond star, dans chaque organisation", ko === 0, ex);

  const pfl = C.bourse("GFL", null, false, 20)[0];
  const ufc = C.bourse("AFC", null, false, 20)[0];
  dit("AFC paie MOINS que GFL à l'entrée (voulu, c'est le vrai dilemme)",
    ufc < pfl, `GFL ${pfl.toLocaleString("fr-FR")} € · AFC ${ufc.toLocaleString("fr-FR")} €`);

  const ufcStar = C.bourse("AFC", 1, true, 100)[0];
  const pflStar = C.bourse("GFL", 1, true, 100)[0];
  dit("mais le plafond AFC écrase tout le reste",
    ufcStar > pflStar * 5, `AFC ${ufcStar.toLocaleString("fr-FR")} € · GFL ${pflStar.toLocaleString("fr-FR")} €`);
}

// -------------------- 6bis. LA PORTEE DE L'ORGANISATION PLAFONNE LA NOTORIETE
// "Une ligue européenne te fait connaître en Europe, les USA te montrent au
// monde, l'UFC encore plus, surtout en main card." (Mael)
{
  let ko = 0, ex = null;
  for (const o of Object.keys(C.ORGS)) {
    let x = 0;
    for (let i = 0; i < 80; i++) x = C.gagnerNotoriete(o, "main_event", x, true, 3);
    if (x > C.ORGS[o].portee) { ko++; ex = ex || `${o} : ${x} > ${C.ORGS[o].portee}`; }
  }
  dit("on ne dépasse JAMAIS la portée de son organisation", ko === 0, ex);

  const portees = Object.keys(C.ORGS).map(o => C.ORGS[o].portee);
  let croissant = true;
  for (let i = 1; i < portees.length; i++) if (portees[i] <= portees[i - 1]) croissant = false;
  dit("plus l'organisation est grande, plus haut on peut monter", croissant,
    Object.keys(C.ORGS).map(o => `${o} ${C.ORGS[o].portee}`).join(" · "));

  const places = ["prelims", "main_card", "co_main", "main_event"]
    .map(p => C.gagnerNotoriete("AFC", p, 0, true, 2));
  let ordre = true;
  for (let i = 1; i < places.length; i++) if (places[i] <= places[i - 1]) ordre = false;
  dit("la place sur la carte multiplie : un main event vaut une prélim × 4",
    ordre && Math.abs(places[3] / places[0] - 4) < 0.2,
    places.map((v, i) => ["prélims", "main card", "co-main", "main event"][i] + " +" + v.toFixed(1)).join(" · "));

  // DISCRIMINANT : un champion régional DOIT se retrouver bloqué
  let hexa = 0;
  for (let i = 0; i < 30; i++) hexa = C.gagnerNotoriete("HEX", "main_event", hexa, true, 3);
  const apres = C.gagnerNotoriete("TRI", "main_event", hexa, true, 2);
  dit("un champion régional plafonne, et ne repart qu'en changeant d'organisation",
    hexa === C.ORGS.HEX.portee && apres > hexa,
    `bloqué à ${hexa} · premier main event TRI → ${apres}`);

  let leve = false;
  try { C.gagnerNotoriete("AFC", "apres_show", 0, true, 2); } catch (e) { leve = /place inconnue/.test(e.message); }
  dit("une place inconnue sur la carte lève une erreur", leve);
}

// -------------------- 7. bornes et erreurs
{
  let leve = false;
  try { C.bourse("Bellator", null, false, 0); } catch (e) { leve = /inconnue/.test(e.message); }
  dit("une organisation inconnue lève une erreur", leve);
  let hors = 0;
  for (let a = 1; a <= 15; a++) for (let b = 1; b <= 15; b++) for (const m of [1, 2, 3]) {
    const [v, p] = C.bouger(a, b, 0.4, m);
    if (v !== null && (v < 1 || v > 15)) hors++;
    if (p !== null && (p < 1 || p > 15)) hors++;
  }
  dit("aucun rang ne sort jamais de l'intervalle 1–15", hors === 0);
}

// -------------------- vitrine
{
  console.log("\n  une carrière, victoires nettes :");
  for (const org of ["HEX", "AFC"]) {
    let rang = null, serie = 0, l = [];
    for (let i = 0; i < 8; i++) {
      const classe = C.droitAuClasse(org, rang, serie, 0);
      const adv = classe ? Math.max(1, (rang === null ? 15 : rang) - 2) : null;
      [rang] = C.bouger(rang, adv, C.ORGS[org].densite, 2); serie++;
      l.push(R(rang));
    }
    console.log(`    ${org.padEnd(10)} ${l.join(" → ")}`);
  }
  console.log("\n  bourses (garanti + prime), en euros :");
  for (const o of Object.keys(C.ORGS)) {
    const e = C.bourse(o, null, false, 20), c = C.bourse(o, 1, true, 20), s = C.bourse(o, 1, true, 100);
    console.log(`    ${o.padEnd(10)} entrée ${(e[0] + e[1]).toLocaleString("fr-FR").padStart(9)}`
      + ` · champion ${(c[0] + c[1]).toLocaleString("fr-FR").padStart(9)}`
      + ` · star ${(s[0] + s[1]).toLocaleString("fr-FR").padStart(9)}`);
  }
}

/* --------- l'echelle — l'arbitrage de Mael (10/08) --------------------- */
{
  // "Classement complet cache, top 15 affiche. Tu gagnes tu passes
  //  devant, tu perds tu recules." Et sa consequence mesurable : UN #1 A
  //  BILAN NEGATIF EST IMPOSSIBLE — chaque defaite te fait doubler.
  const V2 = require("./vivier.js"), S2 = require("./salle.js");
  const m2 = V2.monde(11); S2.avancerMonde(m2, 0);
  const org = "HEX", div = "poids_plume";
  const e0 = C.echelleDe(m2, org, div);
  dit("l'échelle couvre TOUT le roster, le rang n'est que la fenêtre des 15",
    e0.length === (m2.rosters[org][div] || []).length
    && e0.slice(0, 15).every((id, i) => m2.pros.get(id).rang === i + 1)
    && e0.slice(15).every(id => m2.pros.get(id).rang === null),
    `${e0.length} hommes à l'échelle · 15 affichés`);

  // le vainqueur derriere prend la place du perdant
  const bas = e0[9], haut = e0[4];
  C.bougerEchelle(m2, org, div, bas, haut, false);
  const e1 = C.echelleDe(m2, org, div);
  dit("tu gagnes contre un mieux classé : tu prends sa place",
    e1.indexOf(bas) === 4 && e1.indexOf(haut) === 5,
    `#10 bat #5 → il est #${e1.indexOf(bas) + 1}, l'autre #${e1.indexOf(haut) + 1}`);

  // le perdant deja derriere recule, d'un cran (deux si fini)
  const devant = e1[2], derriere = e1[7];
  C.bougerEchelle(m2, org, div, devant, derriere, true);
  const e2 = C.echelleDe(m2, org, div);
  dit("tu perds contre un mieux classé : tu recules (deux crans sur un finish)",
    e2.indexOf(derriere) === 9, `#8 fini par #3 → il est #${e2.indexOf(derriere) + 1}`);

  // /!\ CE QUE LA REGLE GARANTIT — et rien de plus. L'upset est VOULU
  // (l'outsider qui bat le #2 prend sa place, trace faible ou pas) : un
  // metrique "meilleure trace derriere" condamnerait la regle elle-meme.
  // Ce que la regle interdit : l'INCRUSTE SANS FAITS D'ARMES — un homme
  // du top 3 a bilan negatif ET sans serie en cours, qui n'a donc ni
  // dossier ni victoire recente pour justifier sa place. A la genese
  // (amorcage a la trace) il n'en existe AUCUN ; apres un an de vie, il
  // en reste une poignee en transit (battus hier, pas encore redescendus)
  // — tolerance 4 %.
  const compteIncrustes = () => {
    let n = 0, v = 0;
    for (const o of Object.keys(C.ORGS)) for (const d of Object.keys(m2.rosters[o] || {})) {
      const e = C.echelleDe(m2, o, d);
      for (const id of e.slice(0, 3)) { const l = m2.pros.get(id); v++;
        if (l.bilan.v < l.bilan.d && (l.bilan.serie || 0) === 0) n++; }
    }
    return [n, v];
  };
  // A la genese, l'echelle EST le tri de la trace (champion en tete a
  // part) : ce que l'amorcage garantit, c'est L'ORDRE — pas la qualite
  // du vivier (une nationale a 12 hommes peut n'avoir que des negatifs,
  // son meilleur est negatif ET premier, c'est juste).
  // /!\ SE LIT SUR UN MONDE VIERGE : le jour 0 a deja ses combats, et
  // deux upsets legitimes avaient bouge l'echelle avant la lecture.
  const mV = V2.monde(37);
  let desordres = 0, paires = 0;
  const traceG = id => { const l = mV.pros.get(id);
    return l.bilan.v - l.bilan.d + (l.bilan.serie || 0); };
  for (const o of Object.keys(C.ORGS)) for (const d of Object.keys(mV.rosters[o] || {})) {
    const e = C.echelleDe(mV, o, d);
    const debut = (e.length && mV.pros.get(e[0]).champion) ? 1 : 0;
    for (let i = debut; i + 1 < e.length; i++) { paires++;
      if (traceG(e[i]) < traceG(e[i + 1])) desordres++; }
  }
  dit("à la genèse, l'échelle est le tri de la trace — jamais un moins bon devant un meilleur",
    desordres === 0, `${paires} paires vérifiées · ${desordres} désordre(s)`);
  S2.avancerMonde(m2, 360);
  const [i1, v1] = compteIncrustes();
  dit("un an de monde : les négatifs-sans-série en tête restent l'exception (< 4 %)",
    i1 / v1 < 0.04, `${i1}/${v1} (${Math.round(i1 / v1 * 1000) / 10} %)`);
}

console.log(echecs === 0
  ? "CONFORME — le classement bouge comme il a été dicté, et la notoriété ouvre des portes."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);