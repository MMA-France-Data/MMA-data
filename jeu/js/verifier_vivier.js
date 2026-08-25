/**
 * verifier_vivier.js — BANC 18.
 * Le monde : seize organisations, 4 500 pros par selection, 90 000
 * amateurs en fonctions du temps. Creation = hydratation.
 */
const { alea } = require("./alea.js");
const V = require("./vivier.js");
const CL = require("./classement.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const M = V.monde(11);
const nbAm = Object.values(M.amateurs).reduce((s, p) => s + Object.values(p).reduce((a, b) => a + b, 0), 0);

/* 1. Les volumes de Mael : AFC 50 par division, toutes les autres 30,
      et vingt fois plus d'amateurs. */
{
  const orgs = Object.keys(M.rosters);
  /* /!\ LES HUIT TETES D'AFFICHE COMPTENT EN PLUS : etoiles.js est branche
     et chacune s'ajoute EN TETE de sa division. Le banc verifie la cible
     PLUS les etoiles de cette division-la — pas un chiffre elargi au
     petit bonheur. */
  const nEtoiles = (o, d) => [...M.pros.values()]
    .filter(l => l.etoile && l.org === o && l.division === d).length;
  const tailles = orgs.every(o => M.divisions.every(d =>
    M.rosters[o][d].length === (o === "AFC" ? 50 : 30) + nEtoiles(o, d)));
  const totalEtoiles = [...M.pros.values()].filter(l => l.etoile).length;
  dit("seize organisations, neuf divisions, AFC 50 et les autres 30 (+ les têtes d'affiche)",
    orgs.length === 16 && tailles && totalEtoiles === 8,
    `${M.pros.size} pros dont ${totalEtoiles} têtes d'affiche`);
  dit("vingt fois plus d'amateurs que de pros",
    Math.abs(nbAm - (M.pros.size - totalEtoiles) * 20) <= 16, `${nbAm} amateurs`);
}

/* 2. Le monde est deterministe : meme graine, meme monde. */
{
  const cliche = m => JSON.stringify([...m.pros.values()]);
  dit("même graine → même monde, au chiffre près",
    cliche(M) === cliche(V.monde(11)));
}

/* 3. L'hydratation retrouve le MEME homme, deux fois, et la fiche
      complete porte la note de la fiche legere. */
{
  const ids = [...M.pros.keys()];
  let ok = true, okNote = true;
  for (const id of [ids[0], ids[777], ids[3210]]) {
    const a = V.hydrater(M, id), b = V.hydrater(M, id);
    if (JSON.stringify(a.leger) !== JSON.stringify(b.leger)) ok = false;
    a.fiche._niv = null;
    if (Math.abs(a.fiche.note_generale() - M.pros.get(id).note) > 0.11) okNote = false;
  }
  dit("hydrater deux fois donne le même homme", ok);
  dit("la fiche complète porte la note de la fiche légère", okNote);
}

/* 4. /!\ L'INVARIANT QUI PROTEGE LES COMBATS : fabriquer le monde ou
      hydrater un homme NE TOUCHE PAS le flux RNG partage. */
{
  alea.seed(4242);
  const avant = [alea.random(), alea.random()];
  alea.seed(4242);
  alea.random();                       // on est AU MILIEU d'une sequence
  V.hydrater(M, [...M.pros.keys()][100]);
  V.amateur(M, "FRA", M.divisions[0], 3);
  const suite = alea.random();
  dit("hydratation et matérialisation laissent le flux partagé intact",
    suite === avant[1], `2e tirage attendu ${avant[1].toFixed(12)}, obtenu ${suite.toFixed(12)}`);
}

/* 5. La hierarchie EMERGE de la selection, elle n'est pas decretee. */
{
  const moy = o => { let s = 0, n = 0;
    for (const d of M.divisions) for (const id of M.rosters[o][d]) { s += M.pros.get(id).note; n++; }
    return s / n; };
  const nat = Object.keys(V.NATIONALES).reduce((s, o) => s + moy(o), 0) / 11;
  dit("le niveau décroît du sommet vers les nationales — AFC > GFL > SOK > nationales",
    moy("AFC") > moy("GFL") && moy("GFL") > moy("SOK") && moy("SOK") > nat + 5,
    `AFC ${moy("AFC").toFixed(1)} · GFL ${moy("GFL").toFixed(1)} · SOK ${moy("SOK").toFixed(1)} · nationales ${nat.toFixed(1)}`);
}

/* 6. La tendance nationale pondere, elle n'interdit jamais (Mael) :
      du lutteur en France existe, juste plus rare qu'en Russie. */
{
  const part = (pays, arch) => {
    const liste = [...M.pros.values()].filter(l => l.pays === pays);
    return liste.filter(l => l.archetype === arch).length / liste.length;
  };
  const fr = part("FRA", "lutteur_controle"), ru = part("RUS", "lutteur_controle");
  dit("du lutteur en France existe (aucune case à zéro), plus rare qu'en Russie",
    fr > 0.02 && ru > fr * 1.8, `France ${(fr * 100).toFixed(1)} % · Russie ${(ru * 100).toFixed(1)} %`);
  const nl = part("NLD", "kickboxeur_distance");
  dit("les Pays-Bas crachent du kickboxeur", nl > 0.25, `${(nl * 100).toFixed(1)} %`);
}

/* 7. Les amateurs sont jeunes, deterministes, et bornes a leur cellule. */
{
  const a1 = V.amateur(M, "BRA", M.divisions[2], 17);
  const a2 = V.amateur(M, "BRA", M.divisions[2], 17);
  dit("un amateur matérialisé deux fois est le même homme",
    JSON.stringify(a1.leger) === JSON.stringify(a2.leger),
    `${a1.leger.nom}, ${a1.leger.age} ans`);
  let jeunes = 0;
  for (let k = 0; k < 200; k++)
    if (V.amateur(M, "USA", M.divisions[0], k).leger.age <= 24) jeunes++;
  dit("le monde amateur est jeune — plus de 60 % ont 24 ans ou moins",
    jeunes > 120, `${jeunes} / 200`);
  let borne = false;
  try { V.amateur(M, "SWE", M.divisions[0], 10 ** 9); } catch (e) { borne = true; }
  dit("demander un amateur hors de sa cellule lève", borne);
}

/* 8. Le bilan se deduit de l'histoire : jamais plus de combats que les
      annees n'en permettent, et la serie tient dans les victoires. */
dit("aucun bilan impossible — combats ≤ années pro × 4, série ≤ victoires",
  [...M.pros.values()].every(l => {
    const nb = l.bilan.v + l.bilan.d;
    return nb <= Math.max(0, l.age - l.ageDebut) * 4 && l.bilan.serie <= l.bilan.v;
  }));

/* 9. Garde-fou juridique : aucun nom complet de combattant reel iconique. */
{
  // /!\ AU JETON, PAS A LA SOUS-CHAINE : "Osvaldo" contient "aldo" et le
  // filtre naif condamnait tout le Mexique (faux positif paye ici meme).
  const jetons = ["gane", "ngannou", "doumbe", "nurmagomedov",
    "makhachev", "mcgregor", "adesanya", "pereira", "jones", "whittaker",
    "poirier", "oliveira", "aldo", "silva", "verhoeven"];
  const phrases = ["saint denis", "dos anjos"];
  const noms = [...M.pros.values()].map(l => l.nom.toLowerCase());
  const fuite = noms.filter(n => phrases.some(p => n.includes(p))
    || n.split(/[\s-]+/).some(t => jetons.includes(t)));
  dit("aucun nom réel iconique ne fuit dans le monde", fuite.length === 0,
    fuite.length ? fuite.slice(0, 3).join(" · ") : `${noms.length} noms passés au filtre`);
}

/* 10. Les nationales parlent la langue de classement.js : bourse et
       serie exigee repondent pour une cle nationale. */
{
  let ok = true, detail = "";
  try {
    const b = CL.bourse("USA_N", 5, false, 20);
    const s = CL.serieRequise("SWE_N", 0);
    detail = `bourse USA_N #5 : ${b[0]} € · série exigée SWE_N : ${s}`;
    ok = b[0] > 0 && s >= 1;
  } catch (e) { ok = false; detail = e.message; }
  dit("les onze nationales vivent dans la table des organisations", ok, detail);
}

/* 11. LA PYRAMIDE DES AGES (Mael, 09/08) : le sommet n'est pas une
       maison de retraite, les pepites de 22 ans existent, et la
       nationale est plus jeune que le sommet — c'est elle qui nourrit.
       Tenu par DEUX mecaniques : le declin physique (carriere.js) et le
       recrutement sur note + horizon (attrait, vivier.js). */
{
  const ages = o => { const a = [];
    for (const div of M.divisions) for (const id of M.rosters[o][div]) a.push(M.pros.get(id).age);
    return a; };
  const moy = a => a.reduce((x, y) => x + y, 0) / a.length;
  const afc = ages("AFC"), hex = ages("HEX");
  const vieux = afc.filter(a => a >= 33).length / afc.length;
  dit("l'AFC n'est pas une maison de retraite — 33+ sous 50 %, moyenne 28-32 ans",
    vieux < 0.50 && moy(afc) >= 28 && moy(afc) <= 32,
    `33+ : ${Math.round(vieux * 100)} % · moyenne ${moy(afc).toFixed(1)} ans`);

  const pepites = [];
  for (const div of M.divisions) for (const id of M.rosters.AFC[div]) {
    const l = M.pros.get(id);
    if (l.age <= 23) pepites.push(l);
  }
  const vraie = pepites.some(l => l.age <= 22 && l.note >= 76);
  dit("les pépites existent — des ≤23 ans à l'AFC, dont un ≤22 ans déjà fort",
    pepites.length >= 5 && vraie,
    `${pepites.length} hommes ≤23 ans · meilleure : ${pepites.sort((a, b) => b.note - a.note)[0].age} ans, note ${pepites[0].note}`);

  dit("la nationale est plus jeune que le sommet — HEX nourrit, l'AFC consacre",
    moy(hex) < moy(afc) - 2,
    `HEX ${moy(hex).toFixed(1)} ans · AFC ${moy(afc).toFixed(1)} ans`);
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — le monde existe : la sélection fait la hiérarchie, et chaque homme se refabrique à l'identique.");
