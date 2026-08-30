/**
 * verifier_choregraphie.js — banc 34 : du log a la scene, sans rien
 * inventer. On fait jouer un VRAI combat par le moteur, on traduit, et
 * on verifie que la partition relit fidelement — regle 7 : la 3D ne
 * montre jamais un coup que le moteur n'a pas tire.
 */
const C = require("./choregraphie.js");
const E = require("./engine.js");
const G = require("./generator.js");
const M = require("./mesure.js");
const T = require("./traducteur.js");
const { alea } = require("./alea.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ------------------------------------------------ 1. sur un vrai combat */
{
  alea.seed(51);
  const roster = G.generer_roster(10, { division: "poids_leger", niveau_min: 55, niveau_max: 85 });
  const [ra, rb] = alea.sample(roster, 2);
  const fa = ra.fighter, fb = rb.fighter;
  fa.name = "Kante"; fb.name = "Okafor";
  M.reset(fa); M.reset(fb);
  const [, log] = E.simuler_combat(fa, fb, 3, false);
  const [etapes] = T.traduire(log, "Kante", "Okafor", E.DUREE_ROUND, 51);
  const B = C.beats(etapes);
  dit("chaque étape du traducteur devient un temps de scène — ni plus ni moins",
    B.length === etapes.length && B.length > 30, `${B.length} temps`);
  dit("chaque temps porte les positions réelles des deux hommes",
    B.every(b => Array.isArray(b.a) && Array.isArray(b.b)
      && b.a.length === 2 && b.b.length === 2));
  const dedans = B.every(b => {
    const [xa, ya] = C.normaliser(b.a), [xb, yb] = C.normaliser(b.b);
    return Math.hypot(xa, ya) <= 1.01 && Math.hypot(xb, yb) <= 1.01;
  });
  dit("normalisées, toutes les positions tiennent dans la cage (rayon 1)", dedans);
  const frappes = B.filter(b => b.f);
  dit("les frappes désignent le frappeur et la zone — relus du dmg, jamais déduits",
    frappes.length > 5 && frappes.every(b => (b.f === "A" || b.f === "B")
      && ["tete", "corps", "jambes"].includes(b.z)),
    `${frappes.length} impacts`);
  dit("aucune phase inconnue ne passe : tout hors répertoire devient DISTANCE",
    B.every(b => C.PHASES.includes(b.ph)));
  const gestes = B.map(C.geste);
  dit("chaque temps a un geste jouable, et la fin en est un",
    gestes.every(g => g && g.type) && gestes[gestes.length - 1].type !== undefined,
    [...new Set(gestes.map(g => g.type))].join(" · "));
}

/* ------------------------------------------------ 2. le sens des gestes */
{
  dit("« Bt » veut dire : B encaisse à la tête — donc A frappe",
    (() => { const b = C.beat({ t: 1, a: [180, 180], b: [200, 180], dmg: { Bt: 1 } });
      return b.f === "A" && b.z === "tete"; })());
  dit("un KO fait chuter celui qui le prend, pas celui qui le donne",
    C.geste(C.beat({ t: 9, ph: "KO", dmg: { Bt: 1 } })).type === "chute"
    && C.geste(C.beat({ t: 9, ph: "KO", dmg: { Bt: 1 } })).qui === "B");
  dit("l'amenée et le sol appartiennent à celui qui contrôle",
    C.geste(C.beat({ t: 3, ph: "TAKEDOWN", ctrl: "B" })).qui === "B"
    && C.geste(C.beat({ t: 4, ph: "SOL", ctrl: "B" })).type === "sol");
  dit("sans rien à jouer, le geste est la garde — jamais un coup inventé",
    C.geste(C.beat({ t: 2, ph: "DISTANCE" })).type === "garde");
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — la scène relit le log, elle n'invente rien.");
