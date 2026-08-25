/**
 * verifier_ressenti.js — BANC 28 : LE DIALOGUE D'ENTRE-ROUNDS.
 *
 * Ce que ce banc doit prouver, et rien d'autre :
 *   1. CHAQUE PHRASE A UN FAIT DERRIERE — on abime un champ du moteur,
 *      la phrase change ; on n'y touche pas, elle ne change pas.
 *   2. AUCUN TIRAGE — le ressenti ne consomme pas une seule unite du
 *      hasard global. C'est la condition posee par coin.js : le coin vit
 *      entre deux rounds, et tout tirage la decalerait le combat.
 *   3. IL PEUT SE TROMPER — un homme qui ne se lit pas dit que ca va
 *      pendant que les signes disent le contraire. Le ressenti est un
 *      AVIS ; les signes sont des FAITS.
 *   4. CA ARRIVE JUSQU'A L'ECRAN — le vrai gabarit, la vraie boucle.
 *      (La lecon du carnet : branche nulle part = ne fait rien.)
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { alea } = require("./alea.js");
const E = require("./engine.js");
const G = require("./generator.js");
const { Combat } = require("./coin.js");
const R = require("./ressenti.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const homme = (graine, nom = "A") => {
  alea.seed(graine);
  return G.generer_combattant({ division: "poids_leger", nom })[0];
};

console.log("BANC 28 — ce qu'il dit au coin sort du moteur.");

/* ==================================================================== */
/* 1. CHAQUE PHRASE A UN FAIT DERRIERE                                   */
/* ==================================================================== */
{
  const f = homme(11);
  f.mental.fight_iq = 90;                 // lucide : il nomme le vrai
  const neuf = R.ressenti(f, { round: 1, gagne: true });
  dit("un homme intact n'invente pas de blessure", neuf.faits.length === 0 && neuf.etat === "frais",
      `${neuf.faits.length} fait(s) · ${neuf.etat}`);

  const cas = [
    ["tête", (x) => { x.head_damage = 520; }, "tete"],
    ["cardio", (x) => { x.cardio = 10; }, "cardio"],
    ["corps", (x) => { x.body.degats_corps = 80; }, "corps"],
    ["jambes", (x) => { x.legs.gauche = 60; }, "jambes"],
    ["sonné", (x) => { x.sonne = 2; }, "sonne"],
    ["knockdown", (x) => { x.knockdowns = 1; }, "knockdown"],
  ];
  for (const [lib, abimer, cle] of cas) {
    const g = homme(11); g.mental.fight_iq = 90;
    abimer(g);
    const r = R.ressenti(g, { round: 2, gagne: null });
    const trouve = r.faits.some((x) => x.cle === cle);
    dit(`le moteur abîmé sur « ${lib} » se retrouve dans ce qu'il dit`, trouve,
        trouve ? `« ${r.dit} »` : `aucun fait ${cle}`);
  }

  /* Et l'inverse : sans le champ, pas la phrase. */
  const t = homme(11); t.mental.fight_iq = 90; t.cardio = 10;
  dit("il ne parle QUE de ce qui existe",
      R.ressenti(t, { round: 2 }).faits.every((x) => x.cle === "cardio"),
      R.ressenti(t, { round: 2 }).faits.map((x) => x.cle).join(","));
}

/* ==================================================================== */
/* 2. AUCUN TIRAGE — LA CONDITION DE coin.js                             */
/* ==================================================================== */
{
  alea.seed(4242);
  const f = homme(7); f.head_damage = 400; f.cardio = 18; f.legs.droite = 55;
  alea.seed(4242);
  const avantMti = alea.mti, avantG = alea.gaussSuivant;
  for (let i = 0; i < 25; i++) R.ressenti(f, { round: 1 + (i % 5), gagne: i % 2 === 0 });
  dit("le ressenti ne consomme pas une seule unité du hasard global",
      alea.mti === avantMti && alea.gaussSuivant === avantG,
      `mti ${avantMti} -> ${alea.mti}`);

  /* Corollaire : un combat joue en regardant le ressenti a chaque cloche
     tire EXACTEMENT le meme log qu'un combat joue sans le regarder. */
  const jouer = (lire) => {
    alea.seed(909);
    const a = G.generer_combattant({ division: "poids_leger", nom: "A" })[0];
    const b = G.generer_combattant({ division: "poids_leger", nom: "B" })[0];
    const c = new Combat(a, b, 5);
    while (!c.fini) {
      const r = c.jouerRound();
      if (lire && !c.fini) R.ressenti(a, { round: r.round, gagne: r.bilan && r.bilan.w === a.name, adv: b });
    }
    return c.log.join("\n");
  };
  const sans = jouer(false), avec = jouer(true);
  dit("le combat est le même qu'on l'écoute ou non", sans === avec,
      sans === avec ? `${sans.split("\n").length} lignes` : "LE LOG A DIVERGE");
}

/* ==================================================================== */
/* 3. IL PEUT SE TROMPER — l'avis n'est pas le fait                      */
/* ==================================================================== */
{
  const casse = (iq) => { const x = homme(11); x.mental.fight_iq = iq;
    x.head_damage = 560; x.cardio = 9; return x; };
  const lucide = R.ressenti(casse(92), { round: 3 });
  const perdu  = R.ressenti(casse(20), { round: 3 });
  dit("l'homme lucide nomme ce qui le tue", lucide.lucide === true, `« ${lucide.dit} »`);
  dit("l'homme qui ne se lit pas dit que ça va", perdu.lucide === false, `« ${perdu.dit} »`);
  dit("mais les signes, eux, le vendent — dans les deux cas",
      lucide.signes.length > 0 && perdu.signes.length > 0
      && JSON.stringify(lucide.signes) === JSON.stringify(perdu.signes),
      perdu.signes.join(" · "));
  dit("un homme sonné n'est jamais lucide",
      (() => { const x = homme(11); x.mental.fight_iq = 95; x.sonne = 2; x.head_damage = 520;
               return R.ressenti(x, { round: 4 }).lucide === false; })());

  /* La demande mene aux LEVIERS QUI EXISTENT, elle n'en invente pas. */
  const connus = new Set(["plan", "allure", "cible", "sol"]);
  let mauvais = null;
  for (let g = 1; g <= 40; g++) {
    const x = homme(g); x.head_damage = 200 + g * 12; x.cardio = 60 - g;
    x.body.degats_corps = g * 3; x.legs.gauche = g * 2;
    const d = R.ressenti(x, { round: 2 }).demande;
    if (d) for (const k of Object.keys(d)) if (k !== "mot" && !connus.has(k)) mauvais = k;
  }
  dit("ce qu'il demande passe par les leviers du coin, jamais un nouveau",
      mauvais === null, mauvais ? `levier inconnu : ${mauvais}` : "plan · allure · cible · sol");
}

/* ==================================================================== */
/* 4. REPRODUCTIBLE                                                      */
/* ==================================================================== */
{
  const f = homme(3); f.head_damage = 330; f.cardio = 30;
  const a = R.ressenti(f, { round: 2, gagne: false });
  const b = R.ressenti(f, { round: 2, gagne: false });
  dit("deux lectures du même état donnent la même phrase", a.dit === b.dit, `« ${a.dit} »`);
}

/* ==================================================================== */
/* 5. CA ARRIVE JUSQU'A L'ECRAN — le vrai gabarit                        */
/* ==================================================================== */
{
  const bac = { console }; bac.window = bac; vm.createContext(bac);
  new vm.Script(fs.readFileSync(path.join(__dirname, "ecran.gabarit.js"), "utf8")).runInContext(bac);

  alea.seed(11);
  const a = G.generer_combattant({ division: "poids_leger", nom: "Okonkwo" })[0];
  const b = G.generer_combattant({ division: "poids_leger", nom: "Renaud" })[0];
  const c = new Combat(a, b, 5);
  c.jouerRound();
  /* /!\ UNE CHRONOLOGIE REELLE, PAS UNE LISTE VIDE. Premiere version du
     banc : S:[] — le gabarit levait "Cannot read properties of undefined
     (reading 'fin')" des le premier tick, et l'echec parlait de mon banc,
     pas du jeu. Un ecran se teste sur ce qu'il affiche vraiment. */
  const { traduire } = require("./traducteur.js");
  const [S] = require("./coin.js").horsFlux(() => {
    alea.seed(12); return traduire(c.log, a.name, b.name, E.DUREE_ROUND, 11);
  });
  a.head_damage = 560; a.cardio = 9; a.mental.fight_iq = 90;
  const res = R.ressenti(a, { round: 1, gagne: false, adv: b });

  const html = bac.MMA_ECRAN.page({
    S, direct: true, FIN: null, verdict: null, noms: ["Okonkwo", "Renaud"],
    fiches: ["", ""], bourse: "", profils: [], sec_round: E.DUREE_ROUND,
    finRound: true, crisDispo: [], tMoteur: null, vocabCris: [], ressenti: res,
  });
  const script = html.split(/<script>/)[1].split(/<\/script>/)[0];

  /* Un DOM minimal, celui des bancs 11 et 26. */
  const n = {};
  const el = (id) => ({ id, _h: "", _t: "",
    set innerHTML(v) { this._h = String(v); }, get innerHTML() { return this._h; },
    set textContent(v) { this._t = String(v); }, get textContent() { return this._t; },
    classList: { _c: new Set(), add(x) { this._c.add(x); }, remove(x) { this._c.delete(x); },
                 toggle(x, f2) { f2 ? this._c.add(x) : this._c.delete(x); }, contains(x) { return this._c.has(x); } },
    style: {}, dataset: {}, children: [], firstChild: null, value: "",
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
    querySelectorAll: () => [], appendChild() {}, prepend() {}, append() {}, remove() {},
    insertBefore() {}, removeChild() {}, focus() {}, click() {}, offsetWidth: 1,
    getBoundingClientRect: () => ({ width: 360, height: 360, left: 0, top: 0 }) });
  const doc = { getElementById: (id) => n[id] || (n[id] = el(id)),
    querySelector: () => el("?"), querySelectorAll: () => [], createElement: () => el("?"),
    createElementNS: () => el("?"), addEventListener() {}, body: el("body"), documentElement: el("html") };
  const ctx = vm.createContext({ console, document: doc, Date, Math, JSON,
    navigator: { vibrate() {} }, setTimeout: () => 0, clearTimeout() {},
    setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0,
    addEventListener() {}, postMessage() {}, location: { reload() {} } });
  ctx.window = ctx; ctx.self = ctx;
  try { new vm.Script(script, { filename: "gabarit" }).runInContext(ctx); }
  catch (e) { dit("le gabarit se charge avec un ressenti", false, e.message); }

  ctx.cloche && ctx.cloche();
  const zone = n["coinDit"] ? n["coinDit"].innerHTML : "";
  dit("ce qu'il dit s'affiche dans le coin", zone.includes(res.dit),
      zone ? zone.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90) : "(vide)");
  dit("les signes s'affichent à côté de ce qu'il dit",
      res.signes.every((x) => zone.includes(x)), res.signes.join(" · "));
  dit("le bouton « faire ce qu'il demande » n'apparaît que s'il demande",
      (!!res.demande) === zone.includes("c-demande"),
      res.demande ? JSON.stringify(res.demande.allure || res.demande.plan || res.demande.cible) : "aucune demande");

  /* Il pre-coche un levier REEL : l'ordre envoye a coin.js change. */
  if (res.demande) {
    const avant = JSON.stringify(ctx.ordreCoin());
    ctx.suivreSaDemande();
    const apres = JSON.stringify(ctx.ordreCoin());
    dit("suivre sa demande change vraiment l'ordre envoyé au moteur", avant !== apres,
        `${avant} -> ${apres}`);
    ctx.suivreSaDemande();
    dit("et se déselectionne d'un second appui",
        JSON.stringify(ctx.ordreCoin()) === avant);
  }

  /* /!\ IL NE PARLE PLUS DU ROUND D'AVANT. */
  ctx.RESSENTI = res;
  ctx.reprendre();
  ctx.cloche && ctx.cloche();
  dit("après la reprise, le coin ne réaffiche pas le ressenti périmé",
      (n["coinDit"].innerHTML || "") === "", n["coinDit"].innerHTML.slice(0, 60));
}

console.log(echecs === 0
  ? "CONFORME — il parle, et il parle de ce que le moteur lui a fait."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
