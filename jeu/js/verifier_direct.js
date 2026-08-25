/**
 * verifier_direct.js — BANC 26 : LE COMBAT EN DIRECT, PAR TRANCHES,
 * DE BOUT EN BOUT.
 *
 * Ne le 16/08, apres "le jeu est completement bugge" : le banc gabarit
 * parle le protocole HISTORIQUE (rounds entiers) — le protocole par
 * tranches du chantier G n'etait exerce par AUCUN banc, seulement par
 * Mael sur son telephone. Chaque correction d'ecran partait donc a
 * l'aveugle. Ce banc execute LE VRAI GABARIT (vm) contre LE VRAI PARENT
 * (Combat, retraduction, tMoteur — la logique de demo_jeu.html
 * reproduite avec les modules reels), en capturant la boucle setInterval
 * du gabarit et en la faisant TICKER comme le navigateur.
 *
 * Invariants tenus :
 *  1. AUCUNE exception, du premier tick a la carte de fin.
 *  2. Le combat VA AU BOUT (la carte de fin porte le verdict du moteur).
 *  3. Les rounds s'enchainent 1 -> 2 -> ... sans saut ni repetition.
 *  4. LE CHRONO NE RECULE JAMAIS a l'interieur d'un round.
 *  5. Les compteurs finaux de l'ecran == le pli de la traduction finale.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { alea } = require("./alea.js");
const E = require("./engine.js");
const G = require("./generator.js");
const { traduire } = require("./traducteur.js");
const { verdict } = require("./verdict.js");
const { feuille } = require("./feuille.js");
const CR = require("./cris.js");
const { Combat, horsFlux } = require("./coin.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const gp = path.join(__dirname, "ecran.gabarit.js");
const bac = { console }; bac.window = bac; vm.createContext(bac);
new vm.Script(fs.readFileSync(gp, "utf8")).runInContext(bac);

// -- DOM minimal (celui du banc 11) -----------------------------------------
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

// -- LE PARENT REEL : la logique de demo_jeu.html avec les modules reels ----
function fabriquerParent(graine, rounds) {
  alea.seed(graine);
  const fa = G.generer_combattant({ division: "poids_leger", nom: "Okonkwo" })[0];
  const fb = G.generer_combattant({ division: "poids_leger", nom: "Renaud" })[0];
  const c = new Combat(fa, fb, rounds);
  const r = { moteur: c, fa, fb, gen: null, defaireCri: null, dernierEtat: null };
  const retraduire = () => {
    let E2, duree, v = null;
    horsFlux(() => {
      alea.seed(graine + 1);
      [E2, duree] = traduire(c.log, fa.name, fb.name, E.DUREE_ROUND, graine);
      if (c.fini) {
        v = verdict(c.log, fa.name, fb.name);
        if (v.seconde !== null) E2 = require("./chrono.js").recaler(E2, E.DUREE_ROUND, v.round, v.seconde);
      }
    });
    r.etapes = E2; r.verdict = v;
  };
  const jouerTranche = (criId) => {
    if (c.fini) return null;
    if (!r.gen) r.gen = c.jouerRoundTranches();
    if (r.defaireCri) { r.defaireCri(); r.defaireCri = null; }
    let criMot = null;
    if (criId && CR.CRIS[criId]) {
      const cri = CR.CRIS[criId];
      const ph = r.dernierEtat ? CR.phaseDesCris(r.dernierEtat, fa.name) : null;
      if (ph && cri.phase !== "toute" && cri.phase !== ph) criMot = "trop tard";
      else {
        const e = CR.entend(fa, fb, criId, Math.random());
        criMot = e.mot;
        if (e.entendu) r.defaireCri = CR.crier(fa, criId);
      }
    }
    const res = r.gen.next();
    let crisDispo = [], finRound = false, tMoteur = null;
    if (res.done) {
      r.gen = null;
      if (r.defaireCri) { r.defaireCri(); r.defaireCri = null; }
      finRound = true;
    } else {
      r.dernierEtat = res.value.etat;
      tMoteur = res.value.t;
      crisDispo = CR.crisDisponibles(res.value.etat, fa.name)
        .map(id => ({ id, mot: CR.CRIS[id].mot }));
    }
    retraduire();
    return { finRound, crisDispo, criMot, tMoteur };
  };
  return { r, c, fa, fb, retraduire, jouerTranche };
}

// -- LE BANC ----------------------------------------------------------------
/* /!\ ELARGI (22/08, dossier feuille croisee) : plus de graines, plus de
   cris — a la recherche du "tout en A, zero en B" de la capture. */
for (const [graine, crier, simulerDes] of [[1, false, 0], [2, true, 0], [909, false, 0],
                               [7, true, 0], [42, true, 0], [1337, false, 0],
                               /* LE FLUX DE MAEL (22/08) : R1 regarde en
                                  direct AVEC CRIS, puis SIMULER. */
                               [2, true, 2], [7, true, 2], [42, true, 2],
                               /* LE COMBAT DE MAEL EN GRAND : 5 rounds,
                                  cris intensifs, simuler en cours. */
                               [11, "beaucoup", 2], [23, "beaucoup", 3]]) {
  /* Le temoin d'abord : combien de rounds ce combat dure-t-il VRAIMENT ?
     Les assertions se calent dessus — un banc qui accepte "RD vus : (vide)"
     valide un combat d'un round sans jamais exercer la REPRISE DE ROUND,
     le chemin le plus retouche du protocole (lecon du 16/08). */
  let roundsTemoin;
  { alea.seed(graine);
    const ta = G.generer_combattant({ division: "poids_leger", nom: "Okonkwo" })[0];
    const tb = G.generer_combattant({ division: "poids_leger", nom: "Renaud" })[0];
    const tc = new Combat(ta, tb, crier === "beaucoup" ? 5 : 3);
    roundsTemoin = 0; while (!tc.fini && roundsTemoin < 10) { tc.jouerRound(); roundsTemoin++; }
  }
  const P = fabriquerParent(graine, crier === "beaucoup" ? 5 : 3);
  const tr0 = P.jouerTranche(null);           // la premiere tranche (ouvrirEcran)
  const html = bac.MMA_ECRAN.page({
    S: P.r.etapes, direct: true, FIN: null, verdict: null,
    noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "", profils: [],
    sec_round: E.DUREE_ROUND,
    finRound: tr0.finRound, crisDispo: tr0.crisDispo, tMoteur: tr0.tMoteur,
    vocabCris: Object.keys(CR.CRIS).map(id => ({ id, mot: CR.CRIS[id].mot, phase: CR.CRIS[id].phase })),
  });
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { doc } = domVierge();
  const messagesVersParent = [];
  const ecouteurs = [];
  let tick = null;
  const ctx = vm.createContext({
    console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0,
    setInterval: (f) => { tick = f; return 0 },   // LA BOUCLE, CAPTUREE
    setTimeout: () => 0, clearTimeout() {}, clearInterval() {},
    addEventListener: (t, f) => { if (t === "message") ecouteurs.push(f); },
  });
  ctx.window = ctx;
  ctx.parent = { postMessage: (m) => messagesVersParent.push(m) };
  let erreur = null;
  try { vm.runInContext(script, ctx); } catch (e) { erreur = e; }

  // le facteur : transporte les messages ecran <-> parent comme le navigateur
  const repondre = () => {
    while (messagesVersParent.length) {
      const m = messagesVersParent.shift();
      if (m.mma === "tranche" || m.mma === "reprendre") {
        const tr = P.jouerTranche(m.mma === "tranche" ? (m.cri || null) : null);
        const rep = { mma: "suite", S: P.r.etapes,
          FIN: P.c.fini && P.r.verdict ? { methode: P.r.verdict.methode, vainqueur: P.r.verdict.vainqueur, detail: P.r.verdict.detail } : null,
          finRound: tr ? tr.finRound : true, crisDispo: tr ? tr.crisDispo : [],
          criMot: tr ? tr.criMot : null, tMoteur: tr ? tr.tMoteur : null };
        for (const f of ecouteurs) f({ data: rep });
      }
    }
  };

  // dérouler : ticker comme le navigateur, round apres round
  const rdVus = [];
  let chronoRecul = false, dernierEcoule = -1, dernierRD = 1, ticks = 0, crisFaits = 0, simulations = 0;
  while (!erreur && ticks < 200000) {
    ticks++;
    try {
      // la cloche ouvre le coin : on reprend sans ordre, comme un joueur presse
      if (vm.runInContext("attenteCoin", ctx)) {
        vm.runInContext("envoyer({mma:'reprendre'})", ctx);
        repondre();
        continue;
      }
      if (vm.runInContext("fini", ctx)) break;
      // un cri de temps en temps, sur la phase VISIBLE (comme le panneau)
      if (crier && ticks % (crier === "beaucoup" ? 250 : 900) === 200 && vm.runInContext("crisRestants>0&&!criEnAttente", ctx)) {
        const dispo = vm.runInContext("JSON.stringify(VOCAB_CRIS.filter(c=>c.phase===phaseVisible()||c.phase==='toute').map(c=>c.id))", ctx);
        const ids = JSON.parse(dispo);
        if (ids.length) { vm.runInContext(`choisirCri('${ids[0]}')`, ctx); crisFaits++; }
      }
      tick();
      repondre();
      const rd = vm.runInContext("RD", ctx);
      const ec = vm.runInContext("ecoule()", ctx);
      if (rd !== dernierRD) { rdVus.push(rd); dernierRD = rd; dernierEcoule = -1;
        if (simulerDes && rd >= simulerDes) { vm.runInContext("simulerRound()", ctx); repondre(); simulations++; }
      }
      else if (ec < dernierEcoule - 0.001) chronoRecul = true;
      dernierEcoule = ec;
    } catch (e) { erreur = e; break; }
  }

  const nom = `graine ${graine}${crier ? " (avec cris)" : ""}`;
  dit(`${nom} : aucune exception du premier tick a la fin`, !erreur,
    erreur ? String(erreur).slice(0, 120) : `${ticks} ticks`);
  dit(`${nom} : le combat va au bout — la carte de fin porte le verdict du moteur`,
    !erreur && vm.runInContext("fini", ctx) === true
      && doc.getElementById("finTitre")._t.length > 0,
    !erreur ? `${doc.getElementById("finTitre")._t} · ${doc.getElementById("finSous")._t}` : "");
  /* /!\ AVEC CRIS, le combat DIVERGE legitimement du temoin (les leviers
     changent les tirages, donc la duree). L'assertion de duree ne vaut
     que SANS cris ; avec cris on exige l'enchainement sans saut. */
  if (!crier)
  dit(`${nom} : les rounds s'enchainent 1..${roundsTemoin}, sans saut ni repetition`,
    !erreur && JSON.stringify(rdVus) === JSON.stringify(
      [...Array(Math.max(0, roundsTemoin - 1)).keys()].map(k => k + 2)),
    `RD vus : 1 → ${rdVus.join(" → ") || "(aucun autre)"} · temoin : ${roundsTemoin} rounds`);
  else {
    const attendu = [...Array(Math.max(0, rdVus.length)).keys()].map(k => k + 2);
    dit(`${nom} : les rounds s'enchainent sans saut ni repetition`,
      JSON.stringify(rdVus) === JSON.stringify(attendu.slice(0, rdVus.length)),
      `RD vus : 1 → ${rdVus.join(" → ") || "(aucun autre)"}`);
  }
  dit(`${nom} : le chrono ne recule jamais a l'interieur d'un round`, !erreur && !chronoRecul);
  if (!erreur) {
    const V = vm.runInContext("JSON.stringify([V.sigA,V.frA,V.sigB,V.frB])", ctx);
    const pli = [0, 0, 0, 0];
    for (const e of P.r.etapes) if (e.st) { pli[0] += e.st[0]; pli[1] += e.st[1]; pli[2] += e.st[2]; pli[3] += e.st[3]; }
    dit(`${nom} : les compteurs de l'ecran == le pli de la traduction finale`,
      V === JSON.stringify(pli), `écran ${JSON.parse(V).join("/")} · pli ${pli.join("/")}`);
    /* Le temoin frappe des deux cotes dans tout combat complet : si un
       cote de l'ecran est a zero, c'est la capture de Mael (22/08). */
    const Vv = JSON.parse(V);
    dit(`${nom} : les DEUX cotes comptent a l'ecran (pas de "tout en A")`,
      Vv[1] > 0 && Vv[3] > 0, `A ${Vv[0]}/${Vv[1]} · B ${Vv[2]}/${Vv[3]}`);
  }
  if (crier) dit(`${nom} : des cris ont bien ete envoyes pendant le direct`, crisFaits > 0, `${crisFaits} cris`);
  if (simulerDes) dit(`${nom} [MIXTE] : le SIMULER a vraiment ete presse`, roundsTemoin < simulerDes || simulations > 0, `${simulations} simulations · ${roundsTemoin} rounds`);
}

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le direct par tranches tient de bout en bout, dans le vrai gabarit.");

/* ==== LE REVOIR (22/08, dossier feuille croisee) : booter l'ecran sur un
   combat DEJA FINI — le chemin de "rejouer", jamais teste. Les compteurs
   du recap doivent egaler le pli complet. ============================== */
{
  alea.seed(77);
  const a = G.generer_combattant({ division: "poids_leger", nom: "Okonkwo" })[0];
  const b = G.generer_combattant({ division: "poids_leger", nom: "Renaud" })[0];
  const c = new Combat(a, b, 3);
  while (!c.fini) c.jouerRound();
  const [S] = traduire(c.log, "Okonkwo", "Renaud", E.DUREE_ROUND, 77);
  const html = bac.MMA_ECRAN.page({
    S, direct: false, FIN: { methode: "Décision", vainqueur: "Okonkwo", detail: "" },
    verdict: null, noms: ["Okonkwo", "Renaud"], fiches: ["", ""], bourse: "",
    profils: [], sec_round: E.DUREE_ROUND, finRound: true, crisDispo: [],
    tMoteur: null, vocabCris: [],
  });
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];
  const { doc } = domVierge();
  let tick = null, erreur = null;
  const ctx = vm.createContext({
    console, document: doc, Date, navigator: { vibrate() {} },
    requestAnimationFrame: () => 0,
    setInterval: (f) => { tick = f; return 1; }, clearInterval() {},
    setTimeout: (f) => 0, clearTimeout() {},
    parent: { postMessage() {} }, window: { addEventListener() {} },
  });
  try {
    vm.runInContext(script, ctx);
    for (let k = 0; k < 300000 && !vm.runInContext("fini", ctx); k++) tick();
  } catch (e) { erreur = e; }
  const pli = [0, 0, 0, 0];
  for (const e of S) if (e.st) { pli[0] += e.st[0]; pli[1] += e.st[1]; pli[2] += e.st[2]; pli[3] += e.st[3]; }
  const V = erreur ? null : JSON.parse(vm.runInContext("JSON.stringify([V.sigA,V.frA,V.sigB,V.frB])", ctx));
  dit("revoir : le boot d'un combat fini compte juste, des deux cotes",
    !erreur && V && V[0] === pli[0] && V[1] === pli[1] && V[2] === pli[2] && V[3] === pli[3]
      && pli[1] > 0 && pli[3] > 0,
    erreur ? String(erreur).slice(0, 90) : `écran ${V.join("/")} · pli ${pli.join("/")}`);
}
