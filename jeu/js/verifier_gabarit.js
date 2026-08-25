/**
 * verifier_gabarit.js — BANC 11.
 *
 * Deux choses a tenir :
 * 1. ecran.gabarit.js embarque combat_reel.template.html TEL QUEL. S'il
 *    derive d'un caractere, il y a deux gabarits dans le depot et l'ecran
 *    du jeu n'est plus celui qu'on teste.
 * 2. L'ecran, EXECUTE, raconte le combat que le moteur a joue : la carte de
 *    fin doit porter la phrase de verdict.js, et le nom du vainqueur doit
 *    etre celui que simuler_combat a renvoye. C'est la regle 7 poussee
 *    jusqu'au dernier pixel de la chaine.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { alea } = require("./alea.js");
const E = require("./engine.js");
const F = require("./fiches.js");
const { reset } = require("./mesure.js");
const { traduire } = require("./traducteur.js");
const { verdict } = require("./verdict.js");
const { profils } = require("./profil.js");
const { recaler } = require("./chrono.js");
const { feuille } = require("./feuille.js");
const { Combat, horsFlux } = require("./coin.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const R = path.join(__dirname, "..");
const gp = path.join(__dirname, "ecran.gabarit.js");
if (!fs.existsSync(gp)) { console.error("ecran.gabarit.js absent — node js/gabarit.js"); process.exit(1); }

// -- 1. le gabarit embarque est le fichier source ---------------------------
const bac = { console }; bac.window = bac; vm.createContext(bac);
new vm.Script(fs.readFileSync(gp, "utf8"), { filename: "ecran.gabarit.js" }).runInContext(bac);
const src = fs.readFileSync(path.join(R, "combat_reel.template.html"), "utf8");
dit("ecran.gabarit.js embarque le gabarit au caractere pres",
  bac.MMA_ECRAN.gabarit === src, `${src.length} caracteres`);

// -- DOM minimal ------------------------------------------------------------
function domVierge() {
  const n = {};
  const el = (id) => ({
    id, _h: "", _t: "",
    set innerHTML(v) { this._h = v }, get innerHTML() { return this._h },
    set textContent(v) { this._t = v }, get textContent() { return this._t },
    classList: { _c: new Set(), add(c) { this._c.add(c) }, remove(c) { this._c.delete(c) }, toggle() {}, contains(c) { return this._c.has(c) } },
    style: {}, dataset: {}, value: "", children: [], firstChild: null,
    setAttribute() {}, getAttribute() { return null }, addEventListener() {},
    querySelectorAll: () => [], appendChild() {}, prepend() {}, append() {},
    remove() {}, insertBefore() {}, removeChild() {}, focus() {}, click() {},
    getBoundingClientRect: () => ({ width: 360, height: 360, left: 0, top: 0 }),
  });
  return { n, doc: {
    getElementById: (id) => n[id] || (n[id] = el(id)),
    querySelector: () => el("?"), querySelectorAll: () => [],
    createElement: () => el("?"), createElementNS: () => el("?"),
    addEventListener() {}, body: el("body"), documentElement: el("html") } };
}

/** Execute la page produite et deroule toutes les etapes, sans animation. */
function derouler(html) {
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { n, doc } = domVierge();
  const ctx = vm.createContext({ console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0,
    clearTimeout() {}, clearInterval() {}, addEventListener() {} });
  ctx.window = ctx; ctx.parent = ctx;
  vm.runInContext(script, ctx);
  vm.runInContext("S.forEach(applique);", ctx);
  return { titre: n.finTitre && n.finTitre.textContent, nom: n.finNom && n.finNom.textContent,
           methode: n.finMethode && n.finMethode.textContent,
           affichee: n.fin && n.fin.classList.contains("la"), ctx, n };
}

// -- 2. l'ecran raconte le combat joue --------------------------------------
{
  const graines = [];
  for (let g = 1; g <= 60; g++) graines.push(g);
  let n = 0, faux = 0, exemple = null, formes = new Set();

  for (const g of graines) {
    alea.seed(g);
    const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
    reset(a); reset(b);
    const [w, log] = E.simuler_combat(a, b, 3, false);
    alea.seed(g + 1);
    const [S, fin] = traduire(log, "Okonkwo", "Renaud", E.DUREE_ROUND, g);
    const v = verdict(log, "Okonkwo", "Renaud");

    const Sr = v.seconde === null ? S : recaler(S, E.DUREE_ROUND, v.round, v.seconde);
    const html = bac.MMA_ECRAN.page({
      S: Sr, FIN: { methode: fin[0], vainqueur: fin[1], detail: fin[2] }, verdict: v,
      noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
      profils: profils(a, b), sec_round: E.DUREE_ROUND });
    if (html.includes("__DATA__")) { faux++; continue; }

    const ec = derouler(html); n++;
    formes.add(v.methode);
    const attendu = v.libelle.charAt(0).toUpperCase() + v.libelle.slice(1);
    const nomAttendu = v.vainqueur === null ? "Okonkwo — Renaud" : (v.vainqueur === "A" ? "Okonkwo" : "Renaud");
    const bon = ec.affichee && ec.methode.startsWith(attendu) && ec.nom === nomAttendu
      && ec.titre === (v.vainqueur ? "VICTOIRE" : "MATCH NUL");
    if (!bon) { faux++; exemple = exemple || `graine ${g} : attendu "${attendu}" / ${nomAttendu}, ecran "${ec.methode}" / ${ec.nom}`; }
  }
  dit("la carte de fin de l'ecran porte la phrase du verdict et le bon vainqueur",
    faux === 0, faux === 0 ? `${n} combats, ${formes.size} methodes` : exemple);
}

// -- 3. l'horloge de la fin ne sort jamais du round -------------------------
{
  let hors = 0, exemple = null, n = 0;
  for (let g = 1; g <= 60; g++) {
    alea.seed(g);
    const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
    reset(a); reset(b);
    const [, log] = E.simuler_combat(a, b, 3, false);
    alea.seed(g + 1);
    const [S, fin] = traduire(log, "Okonkwo", "Renaud", E.DUREE_ROUND, g);
    const v = verdict(log, "Okonkwo", "Renaud");
    if (v.methode === "DÉCISION") continue;
    const Sr = recaler(S, E.DUREE_ROUND, v.round, v.seconde);
    const html = bac.MMA_ECRAN.page({ S: Sr, FIN: { methode: fin[0], vainqueur: fin[1], detail: fin[2] },
      verdict: v, noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
      profils: profils(a, b), sec_round: E.DUREE_ROUND });
    const ecrit = derouler(html).methode.match(/R\d \d+:\d\d/);
    n++;
    // L'heure lue sur la carte de fin doit etre CELLE DU MOTEUR, a la seconde.
    if (!ecrit || ecrit[0] !== v.heure) {
      hors++; exemple = exemple || `graine ${g} : ecran "${ecrit ? ecrit[0] : "?"}", moteur "${v.heure}"`;
    }
  }
  dit("l'heure de la fin est celle que le moteur a chronometree",
    hors === 0, hors === 0 ? `${n} finitions, a la seconde` : exemple);
}

// -- 4. DISCRIMINANT : un gabarit perime doit se voir -----------------------
{
  let sansPoint = false, injectionRatee = false;
  try { ({ gabarit: bac.MMA_ECRAN.gabarit.replace("/*__DATA__*/", "{}"),
           page: bac.MMA_ECRAN.page }).page({ S: [] }); }
  catch (e) { sansPoint = /sans point d.injection/.test(e.message); }
  // replace() n'echange QUE la premiere occurrence : un gabarit ou le bloc a
  // ete duplique laisserait un __DATA__ vivant dans la page servie.
  try { ({ gabarit: bac.MMA_ECRAN.gabarit.replace("/*__DATA__*/", "/*__DATA__*/ /*__DATA__*/"),
           page: bac.MMA_ECRAN.page }).page({ S: [] }); }
  catch (e) { injectionRatee = /injection ratee/.test(e.message); }
  dit("un gabarit abime leve, point d'injection perdu comme duplique",
    sansPoint && injectionRatee);
}
// b) un verdict etranger fait diverger la carte de fin
{
  /* /!\ IL FAUT DEUX COMBATS AUX ISSUES DIFFERENTES (10/08) : ce bloc
     verifie qu'un verdict etranger SE VOIT sur la carte de fin. Depuis le
     recalibrage, les graines 9 et 20 donnent toutes deux une decision
     30-27 — le "faux" verdict etait donc identique au vrai et rien ne
     pouvait se voir. On cherche deux combats qui ne finissent pas pareil. */
  let g9 = 9, g20 = 20, log9 = null, log20 = null;
  const issue = (lg) => { try { return verdict(lg, "Okonkwo", "Renaud").libelle; }
                          catch (e) { return null; } };
  for (let x = 9; x < 200 && !log9; x++) {
    alea.seed(x); let p = F.fighter("Okonkwo"), q = F.fighter("Renaud"); reset(p); reset(q);
    const [, lg] = E.simuler_combat(p, q, 3, false);
    if (issue(lg)) { g9 = x; log9 = lg; }
  }
  for (let x = 20; x < 300; x++) {
    alea.seed(x); let p = F.fighter("Okonkwo"), q = F.fighter("Renaud"); reset(p); reset(q);
    const [, lg] = E.simuler_combat(p, q, 3, false);
    if (issue(lg) && issue(lg) !== issue(log9)) { g20 = x; log20 = lg; break; }
  }
  alea.seed(g9);
  let a = F.fighter("Okonkwo"), b = F.fighter("Renaud"); reset(a); reset(b);
  alea.seed(10);
  const [S, fin] = traduire(log9, "Okonkwo", "Renaud", E.DUREE_ROUND, g9);
  const vrai = verdict(log9, "Okonkwo", "Renaud");

  const faux = verdict(log20, "Okonkwo", "Renaud");
  const html = bac.MMA_ECRAN.page({ S, FIN: { methode: fin[0], vainqueur: fin[1], detail: fin[2] },
    verdict: faux, noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
    profils: [], sec_round: E.DUREE_ROUND });
  const ec = derouler(html);
  dit("un verdict qui n'est pas celui du combat se voit sur la carte de fin",
    !ec.methode.startsWith(vrai.libelle.charAt(0).toUpperCase() + vrai.libelle.slice(1)),
    `ecran "${ec.methode}" au lieu de "${vrai.libelle}"`);
}

// -- 5. DISCRIMINANT : les motifs $ ne doivent pas etre interpretes ---------
// String.replace interprete $&, $` et $' dans un remplacement passe en
// CHAINE. Une donnee contenant un de ces motifs corromprait la page servie.
// Ce banc existe parce que le cas s'est produit pour de vrai (js/apercu.js).
{
  const piege = "sabotage $& et $` et $' ici";
  const html = bac.MMA_ECRAN.page({ S: [], FIN: {}, noms: [piege, "B"],
    fiches: ["", ""], bourse: "", profils: [], sec_round: 300 });
  const dedans = html.match(/const DATA = (.*);/);
  let intact = false;
  try { intact = JSON.parse(dedans[1]).noms[0] === piege; } catch (e) { intact = false; }
  dit("les motifs $ des donnees traversent l'injection sans etre interpretes",
    intact && !html.includes("<!DOCTYPE html><!DOCTYPE"));
}

// -- 6. LA FEUILLE NE DEVOILE JAMAIS L'AVENIR --------------------------------
// La feuille contient le combat ENTIER des le depart. L'afficher telle
// quelle dirait au joueur, au round 1, combien de coups il prendra au
// round 3. On verifie que l'ecran ne cumule QUE les rounds deja joues.
{
  /* /!\ CE BANC A BESOIN D'UN COMBAT QUI VA AU BOUT (10/08) : il verifie
     que l'ecran ne cumule QUE les rounds deja joues, donc il lui faut
     TROIS rounds. Depuis le recalibrage du chantier D, la graine 5 finit
     au deuxieme — le banc mesurait alors un cumul de 2 rounds contre un
     total de 2 rounds, forcement egal, et tombait. On cherche une graine
     qui tient la distance : c'est le cumul qu'on teste, pas la duree. */
  let a, b, log, gr = 5;
  for (; gr < 300; gr++) {
    alea.seed(gr);
    a = F.fighter("Okonkwo"); b = F.fighter("Renaud");
    reset(a); reset(b);
    const [, lg] = E.simuler_combat(a, b, 3, false);
    if (lg.filter(l => /ROUND 3/.test(l)).length) { log = lg; break; }
  }
  alea.seed(6);
  const [S, fin] = traduire(log, "Okonkwo", "Renaud", E.DUREE_ROUND, 5);
  const v = verdict(log, "Okonkwo", "Renaud");
  const f = feuille(log, "Okonkwo", "Renaud");
  const html = bac.MMA_ECRAN.page({ S, FIN: { methode: fin[0], vainqueur: fin[1], detail: fin[2] },
    verdict: v, feuille: f, noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
    profils: profils(a, b), sec_round: E.DUREE_ROUND });

  // a) au round 1, rien n'est acquis
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { n, doc } = domVierge();
  const ctx = vm.createContext({ console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0,
    clearTimeout() {}, clearInterval() {}, addEventListener() {} });
  ctx.window = ctx; ctx.parent = ctx;
  vm.runInContext(script, ctx);
  vm.runInContext("rendreFeuille();", ctx);
  const auDebut = n["lignes-frappes"].innerHTML;
  dit("au round 1, la repartition n'est pas encore affichee",
    /en cours/.test(auDebut) && !/of/.test(auDebut));

  // b) apres le combat, elle vaut exactement le cumul du module
  vm.runInContext("S.forEach(applique); rendreFeuille();", ctx);
  const aLaFin = n["lignes-frappes"].innerHTML;
  const attendu = [];
  for (const k of ["tete", "corps", "jambe", "distance", "clinch", "sol"])
    attendu.push(`${f.total[0][k][0]} of ${f.total[0][k][1]}`, `${f.total[1][k][0]} of ${f.total[1][k][1]}`);
  const manquants = attendu.filter(x => !aLaFin.includes(x));
  dit("a la fin, l'ecran affiche exactement les totaux du module",
    manquants.length === 0, manquants.length ? "absent : " + manquants[0] : `${attendu.length} cases`);

  // c) DISCRIMINANT : un cumul partiel ne doit PAS egaler le total
  const { n: n2, doc: d2 } = domVierge();
  const c2 = vm.createContext({ console, document: d2, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0,
    clearTimeout() {}, clearInterval() {}, addEventListener() {} });
  c2.window = c2; c2.parent = c2;
  vm.runInContext(script, c2);
  vm.runInContext("RD = 3; rendreFeuille();", c2);   // round 3 en cours : 2 acquis
  const partiel = n2["lignes-frappes"].innerHTML;
  const totalTete = `${f.total[0].tete[0]} of ${f.total[0].tete[1]}`;
  const deuxRounds = f.rounds.slice(0, 2).reduce((x, r) => [x[0] + r[0].tete[0], x[1] + r[0].tete[1]], [0, 0]);
  dit("en cours de combat, l'ecran montre le cumul PARTIEL, pas le total",
    partiel.includes(`${deuxRounds[0]} of ${deuxRounds[1]}`) && !partiel.includes(totalTete),
    `2 rounds : ${deuxRounds[0]} of ${deuxRounds[1]} · total du combat : ${totalTete}`);
}

// -- 7. MODE DIRECT : la cloche, le coin, et pas de fin prematuree ---------
// /!\ En direct, le traducteur marque la fin du LOG qu'on lui donne — donc
// la fin du round joue. Confondre les deux affichait la carte de verdict
// des la premiere cloche, avec FIN a null (plantage).
{
  const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
  a.name = "Okonkwo"; b.name = "Renaud"; reset(a); reset(b);
  /* /!\ CE BLOC A BESOIN D'UN COMBAT QUI VA AUX TROIS ROUNDS (10/08) :
     il verifie L'ENCHAINEMENT des rounds en mode direct, et que la carte
     de fin finit par s'afficher. Depuis le recalibrage du chantier D, la
     graine 5 finit au deuxieme round : le banc ne voyait plus qu'un seul
     enchainement. On cherche la premiere graine qui tient la distance —
     c'est l'enchainement qu'on teste, pas la duree du combat. */
  let graine3 = 5;
  for (let gg = 5; gg < 400; gg++) {
    const x = F.fighter("Okonkwo"), y = F.fighter("Renaud");
    x.name = "Okonkwo"; y.name = "Renaud"; reset(x); reset(y);
    alea.seed(gg);
    const [, lg] = E.simuler_combat(x, y, 3, false);
    if (lg.filter((l) => /ROUND 3/.test(l)).length) { graine3 = gg; break; }
  }
  reset(a); reset(b);
  alea.seed(graine3);
  const c = new Combat(a, b, 3);
  c.jouerRound();
  let S1;
  horsFlux(() => { alea.seed(6); [S1] = traduire(c.log, "Okonkwo", "Renaud", E.DUREE_ROUND, 5); });

  const html = bac.MMA_ECRAN.page({ S: S1, direct: true, FIN: null, verdict: null,
    noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
    profils: profils(a, b), sec_round: E.DUREE_ROUND });

  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { n, doc } = domVierge();
  const ctx = vm.createContext({ console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0,
    clearTimeout() {}, clearInterval() {}, addEventListener() {} });
  ctx.window = ctx; ctx.parent = { postMessage() {} };
  vm.runInContext(script, ctx);
  vm.runInContext("S.forEach(applique);", ctx);

  const noeud = (id) => doc.getElementById(id);
  dit("en direct, la carte de verdict NE s'affiche PAS a la fin d'un round",
    !noeud("fin").classList.contains("la") && vm.runInContext("fini", ctx) === false);

  vm.runInContext("cloche();", ctx);
  dit("la cloche ouvre le coin et met le combat en pause",
    noeud("coach").classList.contains("la")
    && vm.runInContext("attenteCoin && enPause", ctx) === true,
    noeud("coinRound").textContent);

  // le coin ne fabrique pas d'ordre quand le coach n'a rien demande
  dit("aucun bouton coche = aucun ordre envoye (pas de gameplan 'neutre')",
    vm.runInContext("ordreCoin()", ctx) === null);
  vm.runInContext("choisir('plan','lutte'); choisir('cible','corps');", ctx);
  const o = vm.runInContext("JSON.stringify(ordreCoin())", ctx);
  dit("les boutons du coin produisent un ordre lisible par coin.js",
    /wrestling/.test(o) && /corps/.test(o), o);
}

// -- 8. L'HORLOGE APRES UNE REPRISE (bug vu en vrai le 08/08) --------------
// /!\ CE BANC EXISTE PARCE QUE LES AUTRES NE POUVAIENT PAS LE VOIR : ils
// appliquent toutes les etapes d'un bloc (S.forEach(applique)), donc la
// transition de round passe forcement par applique(). En vrai, apres une
// cloche, on REMPLACE S et on se recale par le temps — l'etape de
// transition se retrouve derriere l'index et n'est jamais appliquee.
// Symptome vu par Mael : "ROUND 1 0:00" alors qu'on entamait le round 2.
{
  const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
  a.name = "Okonkwo"; b.name = "Renaud"; reset(a); reset(b);
  /* /!\ CE BLOC A BESOIN D'UN COMBAT QUI VA AUX TROIS ROUNDS (10/08) :
     il verifie L'ENCHAINEMENT des rounds en mode direct, et que la carte
     de fin finit par s'afficher. Depuis le recalibrage du chantier D, la
     graine 5 finit au deuxieme round : le banc ne voyait plus qu'un seul
     enchainement. On cherche la premiere graine qui tient la distance —
     c'est l'enchainement qu'on teste, pas la duree du combat. */
  let graine3 = 5;
  for (let gg = 5; gg < 400; gg++) {
    const x = F.fighter("Okonkwo"), y = F.fighter("Renaud");
    x.name = "Okonkwo"; y.name = "Renaud"; reset(x); reset(y);
    alea.seed(gg);
    const [, lg] = E.simuler_combat(x, y, 3, false);
    if (lg.filter((l) => /ROUND 3/.test(l)).length) { graine3 = gg; break; }
  }
  reset(a); reset(b);
  alea.seed(graine3);
  const c = new Combat(a, b, 3);
  const trad = () => { let S; horsFlux(() => { alea.seed(6);
    [S] = traduire(c.log, "Okonkwo", "Renaud", E.DUREE_ROUND, graine3); }); return S; };

  c.jouerRound();
  const html = bac.MMA_ECRAN.page({ S: trad(), direct: true, FIN: null, verdict: null,
    noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "", profils: [],
    sec_round: E.DUREE_ROUND });
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { doc } = domVierge();
  const ecouteurs = [];
  const ctx = vm.createContext({ console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0,
    clearTimeout() {}, clearInterval() {},
    addEventListener: (t, f) => { if (t === "message") ecouteurs.push(f); } });
  ctx.window = ctx; ctx.parent = { postMessage() {} };
  vm.runInContext(script, ctx);

  // dérouler le round comme la vraie boucle : etape par etape, en avancant t
  const derouleRound = () => vm.runInContext(
    "while(suiv){ t=suiv.t; while(suiv&&t>=suiv.t){etape=suiv;applique(etape);i++;suiv=S[i+1]} } horloge();", ctx);

  derouleRound();
  vm.runInContext("cloche();", ctx);
  c.jouerRound();
  for (const f of ecouteurs) f({ data: { mma: "suite", S: trad(), FIN: null } });
  vm.runInContext("horloge();", ctx);

  const rd = vm.runInContext("RD", ctx);
  const clk = doc.getElementById("clk").textContent;
  dit("apres la reprise, l'ecran affiche le BON round et l'horloge pleine",
    rd === 2 && clk === "5:00", `ROUND ${rd} · ${clk}`);

  // et ca tient jusqu'au bout
  let rounds = [rd];
  while (!c.fini) {
    derouleRound();
    if (vm.runInContext("fini", ctx)) break;
    vm.runInContext("if(!attenteCoin)cloche();", ctx);
    c.jouerRound();
    const fin = c.fini ? (() => { const v = verdict(c.log, "Okonkwo", "Renaud");
      return { methode: v.methode, vainqueur: v.vainqueur, detail: v.detail }; })() : null;
    for (const f of ecouteurs) f({ data: { mma: "suite", S: trad(), FIN: fin } });
    rounds.push(vm.runInContext("RD", ctx));
  }
  derouleRound();
  dit("les rounds s'enchainent sans en sauter ni en repeter",
    JSON.stringify(rounds) === JSON.stringify([2, 3]), `RD vus : ${rounds.join(" → ")}`);
  dit("la carte de fin finit par s'afficher en mode direct",
    doc.getElementById("finTitre").textContent === "VICTOIRE",
    doc.getElementById("finMethode").textContent);
}

console.log(echecs === 0
  ? "CONFORME — l'ecran de combat du jeu est le gabarit, et il dit ce que le moteur a tire."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);
