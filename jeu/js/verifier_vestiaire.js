/**
 * verifier_vestiaire.js — banc 32 : les liens entre tes hommes.
 * Le module est pur : tout se verifie a la main, sans jeu ni DOM.
 */
const V = require("./vestiaire.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ------------------------------------------------ 1. la paire */
{
  dit("la clé d'une paire est symétrique — l'ordre des deux ne compte pas",
    V.clef("Kanté", "Girard") === V.clef("Girard", "Kanté"));
  const liens = {};
  const r1 = V.poser(liens, "A", "B", 10, "le sparring ensemble", 0.4);
  dit("un fait pose un lien, et le lit dans les deux sens",
    V.lire(liens, "A", "B") === 0.4 && V.lire(liens, "B", "A") === 0.4);
  dit("un lien tiède n'a pas de mot — il ne se raconte pas",
    V.mot(V.lire(liens, "A", "B")) === null && r1.franchi === null);
  V.poser(liens, "A", "B", 11, "poussé fort", 500);
  dit("la valeur est bornée à 100, et à -100 de l'autre côté",
    V.lire(liens, "A", "B") === 100
    && V.poser(liens, "A", "B", 12, "cassé net", -900).v === -100);
}

/* ------------------------------------------------ 2. les mots et les paliers */
{
  const liens = {};
  const r = V.poser(liens, "A", "B", 5, "duel propre", 31);
  dit("franchir un palier se signale — c'est l'interpellation du coach",
    r.franchi === "proches" && V.mot(31) === "proches");
  const r2 = V.poser(liens, "A", "B", 6, "encore", 20);
  dit("rester dans le même palier ne signale rien",
    r2.franchi === null && V.mot(61) === "inséparables");
  dit("les mots du froid existent aussi",
    V.mot(-31) === "un froid" && V.mot(-61) === "irréconciliables");
}

/* ------------------------------------------------ 3. le plafond */
{
  const liens = {};
  for (let i = 0; i < V.MAX_LIENS; i++) V.poser(liens, "H" + i, "H" + (i + 100), 1, "x", 10 + i);
  V.poser(liens, "NEUF", "AUTRE", 2, "le nouveau", 50);
  const n = Object.keys(liens).length;
  dit(`le plafond tient : ${V.MAX_LIENS} paires, la plus faible s'efface`,
    n === V.MAX_LIENS && V.lire(liens, "H0", "H100") === 0
    && V.lire(liens, "NEUF", "AUTRE") === 50,
    `${n} paires · la plus faible (10) a disparu`);
}

/* ------------------------------------------------ 4. l'usure et le depart */
{
  const liens = {};
  V.poser(liens, "A", "B", 0, "x", 40);
  for (let s = 0; s < 52; s++) V.decroitre(liens, s * 7);
  const v = V.lire(liens, "A", "B");
  dit("sans faits nouveaux, un an use le lien sans le tuer",
    v > 15 && v < 35, `40 → ${v} en 52 semaines`);
  V.poser(liens, "A", "B", 400, "y", -v + 2);  /* retombe a ~2 */
  V.decroitre(liens, 500);
  dit("une paire retombée à rien, sans fait récent, s'efface",
    liens[V.clef("A", "B")] === undefined);

  const l2 = {};
  V.poser(l2, "A", "B", 0, "x", 45);
  V.poser(l2, "A", "C", 0, "x", 10);
  V.poser(l2, "B", "C", 0, "x", 35);
  const touches = V.retirer(l2, "A");
  dit("un départ efface ses paires et rend ceux qui sentent le trou",
    touches.length === 1 && touches[0] === "B"
    && V.lire(l2, "A", "B") === 0 && V.lire(l2, "B", "C") === 35);
}

/* ------------------------------------------------ 5. les effets */
{
  dit("une paire liée s'entraîne mieux ensemble, un froid refuse le tapis",
    V.bonusSparring(35) > 1 && V.bonusSparring(20) === 1
    && V.refuse(-31) && !V.refuse(-20));
  const demol = V.effetDuel("TKO", 1), propre = V.effetDuel("décision", 3);
  dit("la manière compte au duel : la démolition fait le froid, le combat propre le respect",
    demol.delta < 0 && propre.delta > 0 && V.effetDuel("KO", 1).delta < 0
    && V.effetDuel("KO", 3).delta > 0,
    `démolition ${demol.delta} · propre +${propre.delta}`);
}

/* ------------------------------------------------ 6. le leader */
{
  const cands = [
    { cle: "jeune", anciennete: 200, entente: 90, victoires: 8 },
    { cle: "froid", anciennete: 900, entente: 40, victoires: 9 },
    { cle: "pilier", anciennete: 800, entente: 70, victoires: 5 },
    { cle: "star", anciennete: 400, entente: 60, victoires: 12 },
  ];
  const l = V.leader(cands);
  dit("le leader émerge : un an de maison et une entente qui tient sont exigés",
    !!l && l.cle === "pilier",
    l ? `${l.cle} (score ${l.score}) — le jeune et le froid sont écartés` : "personne");
  dit("une salle peut n'avoir personne",
    V.leader([{ cle: "x", anciennete: 100, entente: 90, victoires: 3 }]) === null
    && V.leader([]) === null);
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — les liens sont des résidus des faits, bornés, et le leader émerge.");
