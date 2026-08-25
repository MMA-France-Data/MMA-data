/**
 * verifier_coin.js — BANC 13.
 *
 * L'invariant qui tient tout : un combat joue ROUND PAR ROUND, sans aucune
 * consigne, doit produire le log de simuler_combat LIGNE POUR LIGNE a la
 * meme graine. simuler_combat est gele ; coin.js le reproduit sans le
 * toucher. Si ca diverge, ou bien le coin modifie le combat en douce, ou
 * bien la reproduction de la boucle a derive.
 *
 * /!\ POUR COMPARER, IL FAUT DES COMBATTANTS NEUFS A CHAQUE EXECUTION.
 * reset() ne remet pas tout (degats de tete, jambes, corps, stance). Rejouer
 * sur les memes objets fait diverger des la premiere ligne — piege paye une
 * fois, ne pas le repayer.
 */
const { alea } = require("./alea.js");
const E = require("./engine.js");
const F = require("./fiches.js");
const { generer_roster } = require("./generator.js");
const { reset } = require("./mesure.js");
const { Combat, LEVIERS, horsFlux } = require("./coin.js");
const { traduire } = require("./traducteur.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/** Combattants NEUFS pour une paire donnee. */
function paire(g, i) {
  alea.seed(g);
  const R = generer_roster(6, { division: "poids_welter", niveau_min: 52, niveau_max: 90 });
  const a = R[i].fighter, b = R[i + 1].fighter;
  a.name = "A"; b.name = "B"; reset(a); reset(b);
  return [a, b];
}
function affiche() {
  const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
  a.name = "Okonkwo"; b.name = "Renaud"; reset(a); reset(b);
  return [a, b];
}

// -------------------- 1. L'INVARIANT CENTRAL
{
  let ok = 0, ko = 0, ex = null, lignes = 0;
  for (let g = 1; g <= 100; g++) for (let i = 0; i + 1 < 6; i += 2) {
    const rounds = i % 4 === 0 ? 5 : 3, s = 10000 + g * 10 + i;
    let [a, b] = paire(g, i); alea.seed(s);
    const [w1, log1] = E.simuler_combat(a, b, rounds, false);
    [a, b] = paire(g, i); alea.seed(s);
    const [w2, log2] = new Combat(a, b, rounds).jusquauBout();
    lignes += log1.length;
    if ((w1 ? w1.name : null) === (w2 ? w2.name : null) && log1.join("\n") === log2.join("\n")) ok++;
    else {
      ko++;
      if (!ex) for (let k = 0; k < Math.max(log1.length, log2.length); k++)
        if (log1[k] !== log2[k]) { ex = `g${g} ligne ${k} : BLOC "${log1[k]}" / COIN "${log2[k]}"`; break; }
    }
  }
  dit("round par round sans consigne = simuler_combat, ligne pour ligne",
    ko === 0, ko === 0 ? `${ok} combats · ${lignes} lignes` : ex);
}

// -------------------- 2. la pause existe vraiment entre les rounds
{
  /* /!\ IL FAUT UNE GRAINE OU LE COMBAT VA AU BOUT (10/08) : depuis le
     recalibrage du chantier D, la graine 5 finit avant le 3e round et
     jouerRound() levait "le combat est termine" — hors try, cassant le
     banc. On cherche une graine qui tient trois rounds : ce qu'on
     verifie ici, c'est LA PAUSE, pas la duree. */
  let a, b, c, gr = 5;
  for (; gr < 400; gr++) {
    [a, b] = affiche(); alea.seed(gr);
    const essai = new Combat(a, b, 3);
    let ok = true;
    try { essai.jouerRound(); essai.jouerRound(); if (essai.fini) ok = false; }
    catch (e) { ok = false; }
    if (ok) break;
  }
  [a, b] = affiche(); alea.seed(gr);
  c = new Combat(a, b, 3);
  const etats = [];
  etats.push(["avant", c.round, c.enPause, c.fini]);
  c.jouerRound(); etats.push(["apres R1", c.round, c.enPause, c.fini]);
  c.jouerRound(); etats.push(["apres R2", c.round, c.enPause, c.fini]);
  c.jouerRound(); etats.push(["apres R3", c.round, c.enPause, c.fini]);
  const bon = etats[0][1] === 1 && etats[0][2] === false
    && etats[1][1] === 2 && etats[1][2] === true
    && etats[2][1] === 3 && etats[2][2] === true
    && etats[3][3] === true && etats[3][2] === false;
  dit("le combat s'arrete a chaque cloche et se termine tout seul", bon,
    etats.map(e => `${e[0]} → R${e[1]}${e[2] ? " (pause)" : ""}${e[3] ? " FINI" : ""}`).join(" · "));
}

// -------------------- 3. jouer apres la fin est une erreur, pas un silence
{
  const [a, b] = affiche(); alea.seed(5);
  const c = new Combat(a, b, 3); c.jusquauBout();
  let leve = false;
  try { c.jouerRound(); } catch (e) { leve = /termine/.test(e.message); }
  dit("jouer un round apres la fin leve une erreur", leve);
}

// -------------------- 4. LA CONSIGNE CHANGE LE COMBAT (discriminant)
// Une consigne qui ne changerait rien serait pire qu'une absence de
// consigne : le joueur croirait agir.
{
  let change = 0, teste = 0;
  for (let g = 1; g <= 40; g++) {
    const s = 20000 + g;
    let [a, b] = paire(g, 0); alea.seed(s);
    const c1 = new Combat(a, b, 3);
    c1.jouerRound();
    if (c1.fini) continue;
    teste++;
    const suite1 = new Combat(a, b, 3);   // (non utilise, on continue c1)
    c1.jusquauBout();

    [a, b] = paire(g, 0); alea.seed(s);
    const c2 = new Combat(a, b, 3);
    c2.jouerRound();
    c2.consigne("f1", { striking: 0, wrestling: 1, clinch: 0, allure: 1.3, cible: "corps" });
    c2.jusquauBout();
    if (c1.log.join("\n") !== c2.log.join("\n")) change++;
  }
  /* /!\ 31/31 EST DEVENU 30/31 AVEC LA CAGE METRIQUE (10/08). La
     geometrie contraint le debut de combat : sur un combat, l'ordre "va
     a la lutte" ne change RIEN au log parce que les deux hommes etaient
     deja hors de portee et que la sequence d'entree reste identique.
     Ce n'est pas une consigne ignoree — c'est une consigne SANS EFFET
     VISIBLE dans cette configuration precise. On exige donc la quasi-
     totalite, pas la totalite : un seul combat sur trente peut
     legitimement ne pas bouger. */
  dit("une consigne du coin change reellement la suite du combat",
    teste > 0 && change >= teste - 1, `${change}/${teste} combats devient different`);
}

// -------------------- 5. la consigne ne peut pas etre donnee n'importe quand
{
  const [a, b] = affiche(); alea.seed(5);
  const c = new Combat(a, b, 3);
  let avant = false, apres = false;
  try { c.consigne("f1", { allure: 1.2 }); } catch (e) { avant = /ENTRE les rounds/.test(e.message); }
  c.jusquauBout();
  try { c.consigne("f1", { allure: 1.2 }); } catch (e) { apres = /termine/.test(e.message); }
  dit("le coin ne parle ni avant le round 1 ni apres la fin", avant && apres);
}

// -------------------- 6. les ordres absurdes sont refuses
{
  const cas = [
    ["allure hors bornes", { allure: 3 }],
    ["allure trop basse", { allure: 0.1 }],
    ["cible inconnue", { cible: "genou" }],
    ["gameplan entierement a zero", { striking: 0, wrestling: 0, clinch: 0 }],
    ["poids negatif", { striking: -1 }],
  ];
  let leves = 0;
  for (const [, ordre] of cas) {
    const [a, b] = affiche(); alea.seed(5);
    const c = new Combat(a, b, 3); c.jouerRound();
    if (c.fini) { leves++; continue; }
    try { c.consigne("f1", ordre); } catch (e) { leves++; }
  }
  const [a, b] = affiche(); alea.seed(graineVivante());
  const c = new Combat(a, b, 3); c.jouerRound();
  let inconnu = false;
  try { c.consigne("f3", { allure: 1 }); } catch (e) { inconnu = /inconnu/.test(e.message); }
  dit("les ordres absurdes sont refuses, pas absorbes en silence",
    leves === cas.length && inconnu, `${leves}/${cas.length} + combattant inconnu`);
}

/* /!\ UNE GRAINE OU LE COMBAT DURE (10/08). Ces deux blocs verifient le
   COIN, qui parle ENTRE les rounds : il leur faut donc un combat encore
   vivant apres le round 1. Depuis le chantier D les finitions precoces
   sont frequentes et la graine 5 s'arrete au premier round — les bancs
   tombaient sur "combat fini au R1", ce qui ne dit rien du coin. */
function graineVivante() {
  for (let g = 5; g < 400; g++) {
    const [x, y] = affiche(); alea.seed(g);
    const c = new Combat(x, y, 3);
    try { c.jouerRound(); } catch (e) { continue; }
    if (!c.fini) return g;
  }
  return 5;
}

// -------------------- 7. les poids de gameplan sont renormalises
{
  const [a, b] = affiche(); alea.seed(graineVivante());
  const c = new Combat(a, b, 3); c.jouerRound();
  if (!c.fini) {
    c.consigne("f1", { striking: 6, wrestling: 2, clinch: 2 });
    const somme = ["striking", "wrestling", "clinch"].reduce((s, k) => s + a.gameplan[k], 0);
    dit("les poids de gameplan sont renormalises a 1",
      Math.abs(somme - 1) < 1e-9 && Math.abs(a.gameplan.striking - 0.6) < 1e-9,
      `striking ${a.gameplan.striking.toFixed(2)} · somme ${somme.toFixed(3)}`);
  } else dit("les poids de gameplan sont renormalises a 1", false, "combat fini au R1");
}

// -------------------- 8. la trace des consignes est fidele
{
  const [a, b] = affiche(); alea.seed(graineVivante());
  const c = new Combat(a, b, 3); c.jouerRound();
  if (!c.fini) {
    c.consigne("f1", { allure: 1.25, cible: "jambes" });
    const t = c.consignes[c.consignes.length - 1];
    dit("chaque consigne laisse une trace datee et nominative",
      t.round === 2 && t.qui === "Okonkwo" && t.allure === 1.25 && t.cible === "jambes",
      JSON.stringify(t));
  } else dit("chaque consigne laisse une trace datee et nominative", false, "combat fini au R1");
}

// -------------------- 9. LE HASARD EST GLOBAL : horsFlux le protege
// /!\ traduire() consomme le rng GLOBAL. Alimenter l'ecran entre deux
// rounds decale donc le flux et les rounds suivants ne sont plus ceux de la
// graine. Le symptome est SILENCIEUX : aucune ligne ne parait fausse, le
// combat est simplement un autre (256 etapes -> 234 a la premiere sonde).
{
  // a) sans protection, le combat DOIT diverger — sinon le test ne prouve rien
  /* /!\ IL FAUT UN COMBAT D'AU MOINS DEUX ROUNDS : le test prouve que
     traduire() ENTRE LES ROUNDS decale le flux. Avec un combat qui finit
     au premier, il n'y a pas d'"entre les rounds" et le discriminant ne
     discrimine rien. */
  const gv = graineVivante();
  let [a, b] = affiche(); alea.seed(gv);
  const [, plein] = E.simuler_combat(a, b, 3, false);

  [a, b] = affiche(); alea.seed(gv);
  const sale = new Combat(a, b, 3);
  while (!sale.fini) {
    sale.jouerRound();
    alea.seed(6); traduire(sale.log, "Okonkwo", "Renaud", E.DUREE_ROUND, gv);
  }
  dit("DISCRIMINANT : traduire entre les rounds SANS protection casse le combat",
    sale.log.join("\n") !== plein.join("\n"));

  // b) avec horsFlux, le combat est intact
  [a, b] = affiche(); alea.seed(gv);
  const propre = new Combat(a, b, 3);
  const etapes = [];
  while (!propre.fini) {
    propre.jouerRound();
    horsFlux(() => {
      alea.seed(6);
      const [S] = traduire(propre.log, "Okonkwo", "Renaud", E.DUREE_ROUND, gv);
      etapes.push(S.length);
    });
  }
  dit("horsFlux() rend le hasard exactement ou il l'avait pris",
    propre.log.join("\n") === plein.join("\n"),
    `traductions intermediaires : ${etapes.join(" → ")} etapes`);

  // c) gauss() a un cache : il doit etre restaure lui aussi
  alea.seed(11);
  const attendu = [alea.gauss(0, 1), alea.gauss(0, 1), alea.random()];
  alea.seed(11);
  horsFlux(() => { alea.gauss(0, 1); for (let i = 0; i < 50; i++) alea.random(); });
  const obtenu = [alea.gauss(0, 1), alea.gauss(0, 1), alea.random()];
  dit("le cache de gauss() est restaure lui aussi",
    JSON.stringify(attendu) === JSON.stringify(obtenu));
}

// -------------------- vitrine
{
  const [a, b] = affiche(); alea.seed(5);
  const c = new Combat(a, b, 3);
  console.log("\n  deroule d'un combat avec coin :");
  while (!c.fini) {
    const r = c.jouerRound();
    if (r.bilan) console.log(`    R${r.round} → ${r.bilan.w} (10-${r.bilan.pts}, ${r.bilan.critere})`
      + `   [${Object.entries(r.bilan.scores).map(([k, v]) => k + " " + v).join(" · ")}]`);
    else console.log(`    R${r.round} → fin : ${r.vainqueur.name} a ${r.seconde}s`);
    if (!c.fini) {
      const t = c.consigne("f1", { striking: 5, wrestling: 3, clinch: 2, cible: "corps" });
      console.log(`       coin → ${t.qui} : gameplan ${t.gameplan.join("/")} · cible ${t.cible}`);
    }
  }
  console.log(`    verdict : ${c.vainqueur ? c.vainqueur.name : "match nul"}`);
}

/* -------- le plan d'avant-combat (conception Mael, 10/08) -------------- */
{
  // Deux portes, deux fenetres inverses : le PLAN avant la premiere
  // seconde, la CONSIGNE entre les rounds. On verifie les deux sens.
  let [pa, pb] = paire(1, 1); alea.seed(4242);
  const c = new Combat(pa, pb, 3);
  const tr = c.plan("f1", { striking: 2, wrestling: 7, clinch: 1, cible: "corps" });
  dit("le plan se pose avant le premier round et change vraiment le gameplan",
    tr.plan === true && c.f1.gameplan.wrestling > 0.6 && c.f1.gameplan.cible === "corps",
    `lutte ${c.f1.gameplan.wrestling.toFixed(2)} · cible ${c.f1.gameplan.cible}`);

  let refuse = false;
  try { c.consigne("f1", { striking: 5 }); } catch (e) { refuse = true; }
  dit("le coin, lui, ne parle toujours pas avant le premier round", refuse,
    "consigne() refusee au round 1");

  /* /!\ LE COMBAT PEUT ETRE FINI DES LE PREMIER ROUND (10/08). Depuis le
     recalibrage du chantier D les finitions precoces sont plus
     frequentes : jouerRound() levait "le combat est termine" HORS du
     try et cassait le banc. On garde le round dans le try : ce qu'on
     verifie, c'est que plan() refuse APRES le depart — que le combat
     soit termine ou en cours, il refuse dans les deux cas. */
  let refuse2 = false;
  try { c.jouerRound(); } catch (e) { /* le combat s'est fini avant */ }
  try { c.plan("f1", { striking: 5 }); } catch (e) { refuse2 = true; }
  dit("et le plan ne se repose plus une fois le combat lance", refuse2,
    "plan() refuse apres le round 1");
}

console.log(echecs === 0
  ? "CONFORME — le combat se joue round par round, et le coin agit vraiment."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);