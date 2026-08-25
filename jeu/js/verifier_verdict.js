/**
 * verifier_verdict.js — verdict.js n'a pas de temoin Python (il est ne apres
 * la bascule). Il est donc tenu par des INVARIANTS, comme fiches.js.
 *
 * Le plus fort est le 1 : verdict et traducteur lisent le MEME log par deux
 * chemins independants et doivent toujours s'accorder sur la methode et le
 * vainqueur. C'est la regle 7 verifiee en double lecture.
 * Les 2 et 3 sont les plus utiles : ils confrontent les nombres AFFICHES aux
 * compteurs INTERNES du moteur (coups_sonne, knockdowns subis). Un detail
 * plausible mais faux tombe ici, pas trois semaines plus tard a l'ecran.
 */
const { alea } = require("./alea.js");
const E = require("./engine.js");
const F = require("./fiches.js");
const { generer_roster } = require("./generator.js");
const { reset } = require("./mesure.js");
const { traduire } = require("./traducteur.js");
const { verdict, ARMES_FR, SUBS_FR, POSITIONS_FR } = require("./verdict.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

/** Joue un combat et rend tout ce qu'il faut pour confronter. */
function jouer(a, b, rounds, graine) {
  alea.seed(graine);
  reset(a); reset(b);
  const [w, log] = E.simuler_combat(a, b, rounds, false);
  return { w, log, a, b };
}

// --------------------------------------------------------- corpus de combats
// Deux populations : les nommes du jeu (affiches reelles) et des rosters
// generes (formes plus variees, donc fins plus variees).
const combats = [];
for (let g = 1; g <= 300; g++) {
  const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
  a.name = "Okonkwo"; b.name = "Renaud";
  combats.push(Object.assign(jouer(a, b, 3, g), { nomA: "Okonkwo", nomB: "Renaud", graine: g }));
}
for (let g = 1; g <= 60; g++) {
  alea.seed(1000 + g);
  const r = generer_roster(8, { division: "poids_welter", niveau_min: 52, niveau_max: 90 });
  for (let i = 0; i + 1 < r.length; i += 2) {
    const a = r[i].fighter, b = r[i + 1].fighter;
    a.name = "Rouge"; b.name = "Bleu";
    combats.push(Object.assign(jouer(a, b, i % 4 === 0 ? 5 : 3, 5000 + g * 10 + i),
      { nomA: "Rouge", nomB: "Bleu", graine: 5000 + g * 10 + i }));
  }
}
console.log(`${combats.length} combats joues (nommes + rosters generes)`);

// ------------------------------------- 1. verdict et traducteur s'accordent
{
  let div = 0, exemple = null;
  for (const c of combats) {
    alea.seed(c.graine + 1);
    const [, fin] = traduire(c.log, c.nomA, c.nomB, E.DUREE_ROUND, c.graine);
    const v = verdict(c.log, c.nomA, c.nomB);
    if (v.methode !== fin[0] || v.vainqueur !== fin[1]) {
      div++; exemple = exemple || `graine ${c.graine} : traducteur ${JSON.stringify(fin.slice(0, 2))} / verdict ${v.methode},${v.vainqueur}`;
    }
  }
  dit("verdict et traducteur donnent la meme methode et le meme vainqueur",
    div === 0, div === 0 ? `${combats.length}/${combats.length}` : exemple);
}

// ------------------------------------- 2. le vainqueur est celui du MOTEUR
{
  let div = 0;
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    const attendu = c.w === null ? null : (c.w.name === c.nomA ? "A" : "B");
    if (v.vainqueur !== attendu) div++;
  }
  dit("le vainqueur affiche est celui que simuler_combat a renvoye", div === 0);
}

// ------------------------------------- 3. les nombres viennent des compteurs
// Les deux details chiffres sont confrontes a l'etat interne du perdant.
{
  let vus = { serie: 0, chutes: 0 }, faux = 0, exemple = null;
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    if (v.methode !== "TKO" || !v.detail) continue;
    const perdant = v.vainqueur === "A" ? c.b : c.a;

    let m = v.detail.match(/^(\d+) coups après/);
    if (m) {
      vus.serie++;
      if (Number(m[1]) !== (perdant.coups_sonne ?? 0)) {
        faux++; exemple = exemple || `graine ${c.graine} : affiche ${m[1]}, moteur ${perdant.coups_sonne}`;
      }
    }
    m = v.detail.match(/^(\d+)e knockdown/);
    if (m) {
      vus.chutes++;
      // le moteur n'incremente pas le compteur sur la chute qui arrete tout
      if (Number(m[1]) !== (perdant.rs_knockdowns_subis ?? 0) + 1) {
        faux++; exemple = exemple || `graine ${c.graine} : affiche ${m[1]}e, moteur ${perdant.rs_knockdowns_subis}+1`;
      }
    }
  }
  dit("les nombres affiches sont les compteurs internes du moteur",
    faux === 0 && vus.serie > 0 && vus.chutes > 0,
    faux === 0 ? `${vus.serie} series + ${vus.chutes} re-knockdowns verifies` : exemple);
}

// ------------------------------------- 4. le round est celui du log
{
  let div = 0;
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    const m = c.log.join("\n").match(/gagne au round (\d+)/);
    const attendu = m ? Number(m[1]) : (c.log.join("\n").match(/ROUND (\d+) ─/g) || []).length;
    if (m && v.round !== attendu) div++;
  }
  dit("le round de la fin est celui ecrit par le moteur", div === 0);
}

// ------------------------------------- 4bis. l'heure de la fin est un TEMPS
// "echange N" dans le log est un nom trompeur : c'est pyRound(t), donc des
// SECONDES. On le prouve plutot que de le croire : la valeur doit toujours
// tenir dans un round, et une finition ne peut pas arriver a 0 s.
{
  let hors = 0, n = 0, exemple = null, max = 0;
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    if (v.seconde === null) continue;
    n++; max = Math.max(max, v.seconde);
    if (v.seconde <= 0 || v.seconde > E.DUREE_ROUND) {
      hors++; exemple = exemple || `graine ${c.graine} : ${v.seconde} s`;
    }
  }
  dit("l'heure de la fin tient dans un round (c'est un temps, pas un compteur)",
    hors === 0 && n > 0, hors === 0 ? `${n} finitions, max ${max} s / ${E.DUREE_ROUND}` : exemple);
}

// ------------------------------------- 5. aucun terme brut ne fuit a l'ecran
{
  let sales = [];
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    if (/_/.test(v.libelle)) sales.push(v.libelle);
  }
  dit("aucune cle du moteur n'atteint l'ecran (pas d'underscore)",
    sales.length === 0, sales.length ? sales[0] : null);
}

// ------------------------------------- 6. toutes les fins sont couvertes
{
  const formes = new Set();
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    if (v.methode === "DÉCISION") { formes.add(v.vainqueur === null ? "nul" : "décision"); continue; }
    if (v.methode === "SOUMISSION") { formes.add("soumission"); continue; }
    if (v.methode === "KO") { formes.add(/contre/.test(v.detail || "") ? "ko contre" : "ko sec"); continue; }
    if (v.methode === "TKO") {
      formes.add(/foie/.test(v.detail) ? "tko corps"
        : /ground and pound/.test(v.detail) ? "tko sol"
          : /^\d+e knockdown$/.test(v.detail) ? "tko re-knockdown" : "tko série");
      continue;
    }
    formes.add("arrêt");
  }
  const attendues = ["décision", "soumission", "ko sec", "ko contre",
    "tko corps", "tko sol", "tko re-knockdown", "tko série"];
  const manquantes = attendues.filter(x => !formes.has(x));
  dit("les 8 formes de fin naturelles sont produites au moins une fois",
    manquantes.length === 0, manquantes.length ? "jamais vues : " + manquantes.join(", ") : `${formes.size} formes`);
}

// ------------------------------------- 6bis. LE NUL, sur log forge
// /!\ Depuis la bascule du 08/08 sur le scoring, le nul est devenu TRES rare :
// 0 sur 1500 combats mesures. Il reste possible — il faut qu'un fighter gagne
// deux rounds 10-9 et perde le troisieme 10-8 — mais on ne peut plus compter
// dessus pour couvrir la branche. On la couvre donc par un log FORGE : ce
// n'est pas la frequence qu'on teste ici, c'est le chemin de code.
{
  const forge = [
    "──────── ROUND 1 ────────",
    "\n  Bilan R1 :",
    "    → round pour Okonkwo (10-9, dégâts)",
    "──────── ROUND 2 ────────",
    "    → round pour Renaud (10-9, dégâts)",
    "──────── ROUND 3 ────────",
    "    → round pour Renaud (10-8, dégâts)",
    "\n──────── DÉCISION ────────",
    "  Okonkwo : 28",
    "  Renaud : 28",
    "  >>> Match nul",
  ];
  const v = verdict(forge, "Okonkwo", "Renaud");
  dit("un nul est lu correctement (vainqueur null, score present)",
    v.vainqueur === null && v.methode === "DÉCISION" && v.detail === "28-28",
    `${v.libelle}`);
}

// ------------------------------------- 7. detail present sauf ARRET
{
  let muets = 0;
  for (const c of combats) {
    const v = verdict(c.log, c.nomA, c.nomB);
    if (v.methode !== "ARRÊT" && !v.detail) muets++;
  }
  dit("toute fin identifiee porte un detail (plus de methode nue)", muets === 0,
    muets ? `${muets} fins sans detail` : null);
}

// ------------------------------------- 8. le banc DISCRIMINE
// a) un trou de vocabulaire doit LEVER, pas passer en silence
{
  const garde = SUBS_FR.kimura;
  delete SUBS_FR.kimura;
  let leve = false;
  for (const c of combats) {
    try { verdict(c.log, c.nomA, c.nomB); }
    catch (e) { if (/soumission inconnu/.test(e.message)) { leve = true; break; } }
  }
  SUBS_FR.kimura = garde;
  dit("un terme de vocabulaire manquant leve une erreur", leve);
}
// b) un log qui n'est pas celui du combat doit se voir
{
  let attrapes = 0, testes = 0;
  for (let k = 0; k + 1 < combats.length; k += 7) {
    const c = combats[k], d = combats[k + 1];
    if (c.nomA !== d.nomA) continue;
    testes++;
    const v = verdict(d.log, c.nomA, c.nomB);
    const attendu = c.w === null ? null : (c.w.name === c.nomA ? "A" : "B");
    const vv = verdict(c.log, c.nomA, c.nomB);
    if (v.vainqueur !== attendu || v.libelle !== vv.libelle) attrapes++;
  }
  dit("un log etranger produit un verdict different", attrapes > testes * 0.8,
    `${attrapes}/${testes}`);
}
// c) un nom hors affiche leve
{
  let leve = false;
  try { verdict(combats[0].log, "Personne", "Autre"); } catch (e) { leve = /hors affiche/.test(e.message); }
  dit("un nom qui n'est pas dans le log leve une erreur", leve);
}

// ------------------------------------- vitrine
console.log("\n  echantillon des libelles produits :");
const vitrine = new Set();
for (const c of combats) {
  const v = verdict(c.log, c.nomA, c.nomB);
  const cle = v.methode + "|" + (v.detail || "-").replace(/\d+/g, "N");
  if (vitrine.has(cle)) continue;
  vitrine.add(cle);
  console.log(`    R${v.round}  ${v.libelle}`);
}

console.log(echecs === 0
  ? "CONFORME — verdict.js remonte le detail de la fin sans jamais l'inventer."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);
