/**
 * verifier_feuille.js — BANC 12.
 *
 * feuille.js n'a pas de temoin Python : il est tenu par des INVARIANTS.
 * Le plus fort est le 1 : la feuille reconstruite doit retomber EXACTEMENT
 * sur les compteurs que le moteur ecrit lui-meme, round par round, des deux
 * cotes. C'est ce banc qui a fait remonter le mensonge du log de ground and
 * pound (14 rounds sur 428 avant la bascule du 08/08) — il vaut son poids.
 */
const { alea } = require("./alea.js");
const E = require("./engine.js");
const F = require("./fiches.js");
const { generer_roster } = require("./generator.js");
const { reset } = require("./mesure.js");
const { feuille, surTotal, pourcent, CIBLES, POSITIONS } = require("./feuille.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

// ------------------------------------------------------------ corpus
const combats = [];
for (let g = 1; g <= 120; g++) {
  alea.seed(g);
  const a = F.fighter("Okonkwo"), b = F.fighter("Renaud");
  a.name = "Okonkwo"; b.name = "Renaud";
  reset(a); reset(b);
  const [, log] = E.simuler_combat(a, b, 3, false);
  combats.push({ log, A: "Okonkwo", B: "Renaud", g });
}
for (let g = 1; g <= 60; g++) {
  alea.seed(3000 + g);
  const R = generer_roster(6, { division: "poids_welter", niveau_min: 52, niveau_max: 90 });
  for (let i = 0; i + 1 < R.length; i += 2) {
    const a = R[i].fighter, b = R[i + 1].fighter;
    a.name = "Rouge"; b.name = "Bleu"; reset(a); reset(b);
    const [, log] = E.simuler_combat(a, b, i % 4 === 0 ? 5 : 3, false);
    combats.push({ log, A: "Rouge", B: "Bleu", g: 3000 + g });
  }
}
console.log(`${combats.length} combats joues`);

/** Les bilans que le moteur ecrit : [cote, touchees, tentees, kd, td]. */
function bilansMoteur(log) {
  const out = [];
  for (const l of log.join("\n").split("\n")) {
    const m = l.match(/^\s+(\S+)\s+dégâts\s+\S+ \| frappes (\d+)\/(\d+) \| TD (\d+)\/(\d+) \|.*KD (\d+)$/);
    if (m) out.push({ nom: m[1], L: +m[2], A: +m[3], tdL: +m[4], tdA: +m[5], kd: +m[6] });
  }
  return out;
}

// -------------------- 1. les compteurs du moteur, round par round
{
  let okL = 0, koL = 0, okA = 0, koA = 0, exL = null, exA = null;
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    const bil = bilansMoteur(c.log);
    for (let r = 0; r < f.rounds.length; r++) {
      for (const cote of [0, 1]) {
        const b = bil[r * 2 + cote];
        if (!b || b.nom !== f.noms[cote]) continue;
        const s = f.rounds[r][cote];
        if (s.moteur[0] === b.L) okL++; else { koL++; exL = exL || `g${c.g} R${r + 1} ${b.nom} : feuille ${s.moteur[0]}, moteur ${b.L}`; }
        if (s.moteur[1] === b.A) okA++; else { koA++; exA = exA || `g${c.g} R${r + 1} ${b.nom} : feuille ${s.moteur[1]}, moteur ${b.A}`; }
      }
    }
  }
  dit("les frappes TOUCHEES retombent sur le compteur du moteur",
    koL === 0, koL === 0 ? `${okL} lignes de bilan` : exL);
  dit("les frappes TENTEES du moteur retombent sur son compteur",
    koA === 0, koA === 0 ? `${okA} lignes de bilan` : exA);
}

// -------------------- 2. knockdowns et takedowns
{
  let ko = 0, ex = null, n = 0;
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    const bil = bilansMoteur(c.log);
    for (let r = 0; r < f.rounds.length; r++) for (const cote of [0, 1]) {
      const b = bil[r * 2 + cote];
      if (!b || b.nom !== f.noms[cote]) continue;
      n++;
      const s = f.rounds[r][cote];
      if (s.kd !== b.kd || s.td[0] !== b.tdL) {
        ko++; ex = ex || `g${c.g} R${r + 1} ${b.nom} : KD ${s.kd}/${b.kd}, TD ${s.td[0]}/${b.tdL}`;
      }
    }
  }
  dit("knockdowns et takedowns reussis retombent sur le moteur", ko === 0,
    ko === 0 ? `${n} lignes` : ex);
}

// -------------------- 3. coherence interne : les deux decoupages se somment
{
  let ko = 0, ex = null, n = 0;
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    for (const cote of [0, 1]) {
      const s = f.total[cote]; n++;
      for (const j of [0, 1]) {
        const parCible = CIBLES.reduce((x, k) => x + s[k][j], 0);
        const parPos = POSITIONS.reduce((x, k) => x + s[k][j], 0);
        if (parCible !== s.sig[j] || parPos !== s.sig[j]) {
          ko++; ex = ex || `g${c.g} ${f.noms[cote]} : sig ${s.sig[j]}, cibles ${parCible}, positions ${parPos}`;
        }
      }
    }
  }
  dit("tete+corps+jambe = distance+clinch+sol = total, touchees ET tentees",
    ko === 0, ko === 0 ? `${n} combattants` : ex);
}

// -------------------- 4. le cumul est la somme des rounds
{
  let ko = 0, ex = null;
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    for (const cote of [0, 1]) {
      for (const k of ["sig"].concat(CIBLES, POSITIONS)) for (const j of [0, 1]) {
        const somme = f.rounds.reduce((x, r) => x + r[cote][k][j], 0);
        if (somme !== f.total[cote][k][j]) { ko++; ex = ex || `g${c.g} ${k}[${j}]`; }
      }
    }
  }
  dit("le cumul est exactement la somme des rounds", ko === 0, ex);
}

// -------------------- 5. jamais de touchees > tentees
{
  let ko = 0, ex = null;
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    for (const r of f.rounds.concat([f.total])) for (const cote of [0, 1]) {
      for (const k of ["sig"].concat(CIBLES, POSITIONS)) {
        const p = r[cote][k];
        if (p[0] > p[1]) { ko++; ex = ex || `${f.noms[cote]} ${k} ${p[0]}/${p[1]}`; }
      }
    }
  }
  dit("aucune case ne montre plus de touchees que de tentees", ko === 0, ex);
}

// -------------------- 6. la repartition par cible est plausible
{
  let tete = [0, 0], corps = [0, 0], jambe = [0, 0];
  for (const c of combats) {
    const f = feuille(c.log, c.A, c.B);
    for (const cote of [0, 1]) {
      tete[0] += f.total[cote].tete[0]; tete[1] += f.total[cote].tete[1];
      corps[0] += f.total[cote].corps[0]; corps[1] += f.total[cote].corps[1];
      jambe[0] += f.total[cote].jambe[0]; jambe[1] += f.total[cote].jambe[1];
    }
  }
  const T = tete[0] + corps[0] + jambe[0];
  const pc = (x) => Math.round((100 * x) / T);
  // Aucune cible ne doit etre morte : une branche du vocabulaire qui ne
  // se declenche jamais est un bug qu'on ne verrait pas autrement.
  dit("les trois cibles sont toutes alimentees",
    tete[0] > 0 && corps[0] > 0 && jambe[0] > 0,
    `tete ${pc(tete[0])}% · corps ${pc(corps[0])}% · jambe ${pc(jambe[0])}%`);
}

// -------------------- 7. DISCRIMINANTS
{
  const c = combats[0];
  // a) un log tronque doit donner une feuille differente
  const court = c.log.slice(0, Math.floor(c.log.length / 2));
  const f1 = feuille(c.log, c.A, c.B), f2 = feuille(court, c.A, c.B);
  dit("un log tronque produit une feuille differente",
    JSON.stringify(f1.total) !== JSON.stringify(f2.total));

  // b) un nom hors affiche ne doit rien ramasser
  const f3 = feuille(c.log, "Personne", "Autre");
  dit("des noms hors affiche ne ramassent aucune frappe",
    f3.total[0].sig[1] === 0 && f3.total[1].sig[1] === 0);

  // c) les frappes de clinch NON significatives ne comptent pas comme touchees
  const forge = [
    "──────── ROUND 1 ────────",
    "    Okonkwo petit_corps -> touché (2)",          // usure : PAS significative
    "    Okonkwo knee -> touché (9) [SIG]",           // significative
    "    Renaud riposte genou_cuisse -> 2",           // usure
    "    Renaud riposte elbow -> 8 [SIG]",            // significative
  ];
  const f4 = feuille(forge, "Okonkwo", "Renaud");
  dit("l'usure de clinch est tentee mais pas touchee, la [SIG] compte",
    f4.total[0].clinch[0] === 1 && f4.total[0].clinch[1] === 2
    && f4.total[1].clinch[0] === 1 && f4.total[1].clinch[1] === 2,
    `Okonkwo ${surTotal(f4.total[0].clinch)} · Renaud ${surTotal(f4.total[1].clinch)}`);

  // d) le contre est une touchee SANS tentative cote moteur
  const forge2 = [
    "──────── ROUND 1 ────────",
    "    Okonkwo overhand → manqué",
    "    !!! Renaud CONTRE le overhand de Okonkwo (14)",
  ];
  const f5 = feuille(forge2, "Okonkwo", "Renaud");
  dit("le contre : +1 touchee au defenseur, pas de tentative en plus",
    f5.total[1].moteur[0] === 1 && f5.total[1].moteur[1] === 0
    && f5.total[0].moteur[1] === 1,
    `Renaud moteur ${f5.total[1].moteur.join("/")}, Okonkwo ${f5.total[0].moteur.join("/")}`);

  // e) le check est une tentative de l'ATTAQUANT, sans ligne "manqué"
  const forge3 = [
    "──────── ROUND 1 ────────",
    "    Renaud check le low_kick — Okonkwo encaisse 4",
  ];
  const f6 = feuille(forge3, "Okonkwo", "Renaud");
  dit("le check compte une tentative a l'attaquant, aucune au defenseur",
    f6.total[0].moteur[1] === 1 && f6.total[0].jambe[1] === 1
    && f6.total[1].sig[1] === 0);
}

// -------------------- vitrine
{
  const f = feuille(combats[0].log, combats[0].A, combats[0].B);
  console.log("\n  feuille du combat 1 (format ufcstats) :");
  console.log("    COMBATTANT   SIG. STR.   %     TÊTE        CORPS       JAMBE       DIST        CLINCH      SOL");
  for (const c of [0, 1]) {
    const s = f.total[c];
    console.log(`    ${f.noms[c].padEnd(12)} ${surTotal(s.sig).padEnd(11)} ${pourcent(s.sig).padEnd(5)} `
      + `${surTotal(s.tete).padEnd(11)} ${surTotal(s.corps).padEnd(11)} ${surTotal(s.jambe).padEnd(11)} `
      + `${surTotal(s.distance).padEnd(11)} ${surTotal(s.clinch).padEnd(11)} ${surTotal(s.sol)}`);
  }
}

console.log(echecs === 0
  ? "CONFORME — la feuille de stats est celle que le moteur a comptee."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);
