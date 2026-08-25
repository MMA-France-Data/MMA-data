/**
 * verifier_carriere.js — BANC 17.
 * L'age, le potentiel cache, les axes : le niveau se DEDUIT d'une histoire.
 *
 * /!\ HISTORIQUE DU 09/08 : le carnet disait "le sommet plafonne a 86".
 * MESURE (4000 carrieres) : faux au moment du banc — meilleur domaine 99,
 * note affichee max 96,8, p99 87,5. Le dernier etage EXISTE. Ce banc le
 * grave pour que ca ne regresse jamais en silence.
 * Le plancher, lui, etait vrai : debutants a 22,9 de moyenne. Corrige a 32.
 */
const { alea } = require("./alea.js");
const G = require("./generator.js");
const C = require("./carriere.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ------------------------------------------------------------------ */
/* La population : 4000 carrieres, graine fixe.                        */
/* ------------------------------------------------------------------ */
alea.seed(7);
const POP = [];
for (let i = 0; i < 4000; i++) {
  const [f] = G.generer_combattant({});
  const c = C.poser(f);
  f._niv = null;
  POP.push({ f, c });
}
const moy4 = c => (c.niveaux.striking + c.niveaux.wrestling + c.niveaux.ground + c.niveaux.physical) / 4;

/* 1. Un debutant n'est pas un infirme. */
{
  const jeunes = POP.filter(p => p.c.annees <= 1).map(p => moy4(p.c));
  const m = jeunes.reduce((a, b) => a + b, 0) / jeunes.length;
  dit("un débutant a un corps et des réflexes — moyenne des ≤1 an entre 30 et 36",
    jeunes.length > 200 && m >= 30 && m <= 36,
    `${jeunes.length} débutants · moyenne ${m.toFixed(1)}`);
}

/* 2. Le dernier etage existe : le sommet rejoint les etoiles (88-96). */
{
  const notes = POP.map(p => p.f.note_generale()).sort((a, b) => a - b);
  const p99 = notes[Math.trunc(notes.length * 0.99)], max = notes[notes.length - 1];
  dit("le sommet rejoint les étoiles — note affichée max ≥ 92, p99 ≥ 85",
    max >= 92 && p99 >= 85, `p99 ${p99.toFixed(1)} · max ${max.toFixed(1)}`);
  dit("et le talent reste rare — la médiane reste sous 65",
    notes[Math.trunc(notes.length / 2)] < 65,
    `médiane ${notes[Math.trunc(notes.length / 2)].toFixed(1)}`);
}

/* 3. Le potentiel borne : aucun niveau ne le depasse. */
dit("aucun niveau ne dépasse le potentiel de son domaine",
  POP.every(p => C.DOMAINES.every(d => p.c.niveaux[d] <= p.c.potentiel[d] + 1e-9)));

/* 4. Un tard-venu ne rattrape jamais : memes conditions, seul l'age de
      debut change. On compare a 30 ans, debut 16 contre debut 26. */
{
  alea.seed(41);
  const potentiel = { striking: 90, wrestling: 90, ground: 90, physical: 90 };
  const axes = { striking: 1.1, wrestling: 1.1, ground: 1.1, physical: 1.1 };
  const parcours = { club: 0.7, coach: 0.8, reputeCoach: 0.8, partenaires: 0.7, orientation: 0.8, accidents: 1.0 };
  const rep = { striking: 0.25, wrestling: 0.25, ground: 0.25, physical: 0.25 };
  const [f1] = G.generer_combattant({ niveau: 50 });
  const c1 = C.poser(f1, { age: 30, ageDebut: 16, potentiel, axes, parcours, repartition: rep });
  const [f2] = G.generer_combattant({ niveau: 50 });
  const c2 = C.poser(f2, { age: 30, ageDebut: 26, potentiel, axes, parcours, repartition: rep });
  dit("à 30 ans, mêmes conditions : débuté à 16 domine largement débuté à 26",
    moy4(c1) > moy4(c2) + 15,
    `début 16 → ${moy4(c1).toFixed(1)} · début 26 → ${moy4(c2).toFixed(1)}`);
}

/* 5. Le niveau se deduit, il ne se tire pas : meme graine, memes niveaux. */
{
  const tirage = () => {
    alea.seed(123);
    const [f] = G.generer_combattant({});
    return JSON.stringify(C.poser(f).niveaux);
  };
  dit("même graine → même carrière, au chiffre près (déterminisme)",
    tirage() === tirage());
}

/* 6. La marge est le metier du scout : positive, et plus grande chez les
      jeunes que chez les vieux. */
{
  const jm = POP.filter(p => p.c.age <= 22).map(p => C.marge(p.f));
  const vm = POP.filter(p => p.c.age >= 32).map(p => C.marge(p.f));
  const m = a => a.reduce((x, y) => x + y, 0) / a.length;
  dit("la marge ne descend jamais sous zéro", POP.every(p => C.marge(p.f) >= 0));
  dit("un jeune garde plus de marge qu'un vieux — le scouting a un métier",
    m(jm) > m(vm) + 8, `≤22 ans : ${m(jm).toFixed(1)} · ≥32 ans : ${m(vm).toFixed(1)}`);
}

/* 7. Le fight IQ suit les annees, pas le corps. */
{
  const jeunes = POP.filter(p => p.c.annees <= 2).map(p => p.f.mental.fight_iq);
  const vieux = POP.filter(p => p.c.annees >= 12).map(p => p.f.mental.fight_iq);
  const m = a => a.reduce((x, y) => x + y, 0) / a.length;
  dit("le fight IQ monte avec les années de pratique",
    m(vieux) > m(jeunes) + 12, `≤2 ans : ${m(jeunes).toFixed(1)} · ≥12 ans : ${m(vieux).toFixed(1)}`);
}

/* 8. caler garde le relief : l'ordre relatif des stats d'un bloc survit
      a la mise a l'echelle. */
{
  const bloc = { a: 80, b: 60, c: 40, d: 20 };
  C.caler(bloc, 55);
  dit("caler change l'échelle, jamais l'ordre — le relief du bloc survit",
    bloc.a > bloc.b && bloc.b > bloc.c && bloc.c > bloc.d,
    `${bloc.a} > ${bloc.b} > ${bloc.c} > ${bloc.d}`);
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le niveau se déduit d'une histoire, et le dernier étage existe.");
