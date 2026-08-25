/**
 * verifier_cris.js — BANC 27 : LES CRIS DU CHANTIER G.
 *
 * Prouve les regles signees le 14/08, pas des intentions :
 *   1. SANS CRI, LE GENERATEUR EST LE TEMOIN : jouer par tranches sans
 *      crier reproduit simuler_round ligne a ligne, meme graine.
 *   2. chaque cri MODIFIE un levier que le moteur lit, et DEFAIRE remet
 *      l'etat exact — un cri vit une tranche, pas une carriere ;
 *   3. le vocabulaire suit la phase : pas de "shoote" au sol ;
 *   4. le filtre d'ecoute suit la regle : le sonne n'entend rien,
 *      l'indiscipline qui domine ignore le "calme", le lucide applique ;
 *   5. trois cris par round, pas plus (la constante que l'ecran lit) ;
 *   6. un cri ENTENDU change le combat, et le log le montre.
 */

const E = require("./engine.js");
const CR = require("./cris.js");
const { alea } = require("./alea.js");
const G = require("./generator.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

const paire = (graine) => {
  alea.seed(graine);
  const a = G.generer_combattant({ division: "poids_leger", nom: "A" })[0];
  const b = G.generer_combattant({ division: "poids_leger", nom: "B" })[0];
  return [a, b];
};

/* ------------------- 1. sans cri, le generateur est le temoin */
{
  alea.seed(77);
  const [a1, b1] = [G.generer_combattant({ division: "poids_leger", nom: "A" })[0],
                    G.generer_combattant({ division: "poids_leger", nom: "B" })[0]];
  const log1 = [];
  const r1 = E.simuler_round(a1, b1, 1, log1);

  alea.seed(77);
  const [a2, b2] = [G.generer_combattant({ division: "poids_leger", nom: "A" })[0],
                    G.generer_combattant({ division: "poids_leger", nom: "B" })[0]];
  const log2 = [];
  const g = E.simuler_round_tranches(a2, b2, 1, log2);
  let arrets = 0, res = g.next();
  while (!res.done) { arrets++; res = g.next(); }
  const r2 = res.value;

  dit("le round par tranches sans cri reproduit le temoin ligne a ligne",
    JSON.stringify(log1) === JSON.stringify(log2)
      && JSON.stringify(r1) === JSON.stringify(r2),
    `${log1.length} lignes · ${arrets} arrêts de tranche`);
  /* Tranche 15 s depuis le 21/08 (le coin parle dans le temps du
     combat) : un round de 5 min = jusqu'a ~20 arrets. */
  dit("un round de 5 minutes s'arrête bien aux frontières de tranche",
    arrets >= 6 && arrets <= 21, `${arrets} arrêts`);
}

/* ------------------- 2. chaque cri bouge un levier, et defaire remet */
{
  const [f] = paire(11);
  const photo = () => JSON.stringify({ g: f.gameplan, t: f.temperament });
  let tous = true, restaures = true;
  for (const id of Object.keys(CR.CRIS)) {
    const avant = photo();
    const defaire = CR.crier(f, id);
    if (photo() === avant) { tous = false; console.log(`      (${id} ne change rien !)`); }
    defaire();
    if (photo() !== avant) { restaures = false; console.log(`      (${id} ne se défait pas !)`); }
  }
  dit("chaque cri du vocabulaire modifie un levier que le moteur lit", tous,
    `${Object.keys(CR.CRIS).length} cris`);
  dit("défaire remet l'état EXACT — un cri vit une tranche", restaures);
}

/* ------------------- 3. le vocabulaire suit la phase */
{
  /* /!\ LES CONSTANTES DU MOTEUR, jamais une hypothese : le banc qui
     redeclare les valeurs teste sa propre croyance (lecon du 15/08). */
  const debout = CR.crisDisponibles({ phase: E.DEBOUT, position: null, top: null }, "A");
  const sol_dessus = CR.crisDisponibles({ phase: E.SOL, position: "mount", top: "A" }, "A");
  const sol_dessous = CR.crisDisponibles({ phase: E.SOL, position: "mount", top: "B" }, "A");
  const clinch = CR.crisDisponibles({ phase: E.CLINCH, position: null, top: null }, "A");
  dit("debout offre les cris debout, jamais ceux du sol",
    debout.includes("shoote") && debout.includes("tourne")
      && !debout.includes("passe") && !debout.includes("sweep"),
    debout.join(","));
  dit("dessus et dessous ne proposent pas les mêmes cris",
    sol_dessus.includes("passe") && !sol_dessus.includes("sweep")
      && sol_dessous.includes("sweep") && !sol_dessous.includes("gnp"),
    `dessus ${sol_dessus.length} · dessous ${sol_dessous.length}`);
  dit("la gestion (respire) s'entend dans toutes les phases",
    [debout, sol_dessus, sol_dessous, clinch].every(l => l.includes("respire")));
}

/* ------------------- 4. le filtre d'ecoute */
{
  const [f, adv] = paire(23);
  f.mental.fight_iq = 85; f.mental.discipline = 80; f.sonne = 0;
  const lucide = CR.entend(f, adv, "corps", 0.5);
  dit("un homme lucide et discipliné entend son coin", lucide.entendu);

  f.sonne = 2;
  const sonne = CR.entend(f, adv, "corps", 0.01);
  dit("un homme sonné n'entend RIEN, même avec de la chance au tirage",
    !sonne.entendu, sonne.mot);
  f.sonne = 0;

  f.mental.discipline = 30;
  f.rs.damage = 60; adv.rs.damage = 10;
  // p(corps) = 0,45 + 85x0,004 + 30x0,003 = 0,88 ; p(calme) = 0,88 - 0,30 = 0,58.
  // Le tirage 0,70 est ENTRE les deux : il separe les deux comportements.
  const t = 0.70;
  const calmeQuandDomine = CR.entend(f, adv, "calme", t);
  const corpsQuandDomine = CR.entend(f, adv, "corps", t);
  dit("l'indiscipliné qui domine ignore le \"calme\" mais entend le reste",
    !calmeQuandDomine.entendu && corpsQuandDomine.entendu);

  dit("le cri perdu a son mot — l'écran ne ment pas",
    CR.entend(f, adv, "calme", 0.99).mot.length > 0,
    `"${CR.entend(f, adv, "calme", 0.99).mot}"`);
}

/* ------------------- 5. trois cris par round */
{
  dit("trois cris par round, pas plus — la constante que l'écran lit",
    CR.MAX_CRIS_PAR_ROUND === 3, `${CR.MAX_CRIS_PAR_ROUND}`);
}

/* ------------------- 6. un cri entendu change le combat */
{
  alea.seed(31);
  let a = G.generer_combattant({ division: "poids_leger", nom: "A" })[0];
  let b = G.generer_combattant({ division: "poids_leger", nom: "B" })[0];
  const logSans = [];
  E.simuler_round(a, b, 1, logSans);

  alea.seed(31);
  a = G.generer_combattant({ division: "poids_leger", nom: "A" })[0];
  b = G.generer_combattant({ division: "poids_leger", nom: "B" })[0];
  const logAvec = [];
  const g = E.simuler_round_tranches(a, b, 1, logAvec);
  /* "La jambe !" pose la cible, que le moteur lit A CHAQUE frappe : la
     zone visee change, donc les lignes de log, des le premier coup
     debout apres le cri — divergence deterministe, pas probabiliste.
     (La limite des 3 cris est une regle d'ECRAN ; ici on teste le
     moteur, on crie a chaque tranche.) */
  let res = g.next(), defaire = null, crie = false;
  while (!res.done) {
    if (defaire) { defaire(); defaire = null; }
    defaire = CR.crier(a, "jambe"); crie = true;
    res = g.next();
  }
  if (defaire) defaire();
  dit("un cri entendu change le combat — les logs divergent après lui",
    crie && JSON.stringify(logSans) !== JSON.stringify(logAvec),
    `${logSans.length} vs ${logAvec.length} lignes`);
  dit("et le gameplan est restauré après la tranche — le cri n'est pas un gameplan",
    Math.abs(a.gameplan.striking + a.gameplan.wrestling + a.gameplan.clinch - 1) < 1e-9);
}

/* ------------------- 7. le pli de l'ecran (defaut du 15/08) */
/* Le traducteur RE-TEMPORISE le round a chaque retraduction : l'ecran
   par tranches doit garder l'INDEX et REPLIER la liste fraiche, jamais
   accumuler a travers les remplacements. Preuve : le protocole complet
   (tranche par tranche, fin provisoire exclue) compte EXACTEMENT comme
   une lecture unique de la traduction finale. */
{
  const T = require("./traducteur.js");
  const C2 = require("./coin.js");
  const graine = 909;
  alea.seed(graine);
  const fa = G.generer_combattant({ division: "poids_leger", nom: "Kante" })[0];
  const fb = G.generer_combattant({ division: "poids_leger", nom: "Moreau" })[0];
  const c = new C2.Combat(fa, fb, 3);
  const retrad = () => { let E2; C2.horsFlux(() => { alea.seed(graine + 1);
    [E2] = T.traduire(c.log, fa.name, fb.name, E.DUREE_ROUND, graine); }); return E2; };
  const fold = (S, j) => { const v = [0, 0, 0, 0];
    for (let k = 0; k <= j && k < S.length; k++) { const e = S[k];
      if (e.st) { v[0] += e.st[0]; v[1] += e.st[1]; v[2] += e.st[2]; v[3] += e.st[3]; } }
    return v; };
  let gen = null, i = 0, S = null, V = null, contenuStable = true, tours = 0;
  const sansT = (e) => { const o = { ...e }; delete o.t; return JSON.stringify(o); };
  let Sav = null;
  while (!c.fini && tours < 400) {
    tours++;
    if (!gen) gen = c.jouerRoundTranches();
    const res = gen.next(); const finRound = !!res.done; if (res.done) gen = null;
    S = retrad();
    if (Sav) { const pre = Sav.slice(0, -1);
      for (let k = 0; k < pre.length && k < S.length; k++)
        if (sansT(pre[k]) !== sansT(S[k])) { contenuStable = false; break; } }
    Sav = S;
    i = Math.min(i, S.length - 1);
    V = fold(S, i);
    const borne = finRound ? S.length : S.length - 1;
    while (i + 1 < borne) { i++; const e = S[i];
      if (e.st) { V[0] += e.st[0]; V[1] += e.st[1]; V[2] += e.st[2]; V[3] += e.st[3]; } }
  }
  const R = fold(retrad(), 1e9);
  dit("le contenu hors temps est un préfixe stable — l'index est fiable",
    contenuStable, `${tours} tranches`);
  dit("le pli compte comme une lecture unique — l'écran ne ment plus",
    JSON.stringify(V) === JSON.stringify(R),
    `tranches ${V.join("/")} · unique ${R.join("/")}`);
}

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le coin crie, le moteur entend, et sans cri le combat est celui du témoin.");
