/**
 * verifier_diner.js — banc 36 : la soirée avec le matchmaker.
 *
 * Deux moitiés, et la seconde est la plus importante :
 *   1. LA MÉCANIQUE — l'enchaînement, les conditions, le déterminisme.
 *   2. LE CONTENU — il a été écrit par une escouade d'agents, donc il
 *      est VÉRIFIÉ COMME UNE DONNÉE : conditions de la liste fermée,
 *      clés uniques, pointeurs `ouvre` qui mènent quelque part, aucun
 *      chiffre à l'écran, aucune réplique vide, et LE VOLUME — c'est la
 *      demande de Mael, elle se mesure.
 */
const D = require("./diner.js");
const C = require("./diner_scenes.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const CTX = { premier: true, relation: 50, reputation: 40, aChampion: false, aClasse: true };

/* ==================================================================== */
/* 1. LES CONDITIONS                                                    */
/* ==================================================================== */
{
  dit("« toujours » passe toujours", D.tient("toujours", CTX) === true);
  dit("le premier dîner et l'habitude s'excluent",
    D.tient("premier", CTX) === true && D.tient("habitue", CTX) === false);
  dit("les trois températures de relation se suivent sans se chevaucher",
    D.tient("froid", { relation: 20 }) && !D.tient("froid", { relation: 50 })
    && D.tient("tiede", { relation: 50 }) && !D.tient("tiede", { relation: 70 })
    && D.tient("chaud", { relation: 70 }));
  dit("« débutant » est le contraire d'avoir un homme classé",
    D.tient("debutant", { aClasse: false, aChampion: false }) === true
    && D.tient("debutant", CTX) === false);
  dit("une condition inventée ne passe pas", D.tient("parce_que_oui", CTX) === false);
}

/* ==================================================================== */
/* 2. LA SOIRÉE SE DÉROULE                                              */
/* ==================================================================== */
{
  const S = D.commencer(C.SCENES, CTX, 12345);
  const vues = [];
  let garde = 0;
  while (garde++ < 60) {
    const sc = D.courante(S);
    if (!sc) break;
    vues.push(sc.cle);
    D.repondre(S, 0);
  }
  dit("la soirée traverse au moins les dix moments du repas",
    vues.length >= D.MOMENTS.length, `${vues.length} scènes jouées`);
  dit("et elle finit — elle ne tourne pas en rond", S.fini === true && garde < 60);
  dit("aucune scène ne se rejoue dans la même soirée",
    new Set(vues).size === vues.length);
  dit("chaque réponse laisse une trace de ce qui a été dit",
    S.dits.length === vues.length && S.dits.every((x) => x.lab && x.ton));

  /* /!\ LE DETERMINISME : deux fois la meme soiree = la meme soiree. */
  const rejoue = (graine) => {
    const s2 = D.commencer(C.SCENES, CTX, graine);
    const l = []; let g = 0;
    while (g++ < 60) { const sc = D.courante(s2); if (!sc) break; l.push(sc.cle); D.repondre(s2, 0); }
    return l.join(",");
  };
  dit("même organisation, même jour : la même soirée — aucun tirage",
    rejoue(12345) === rejoue(12345));
  dit("mais une autre soirée est une autre soirée",
    rejoue(12345) !== rejoue(999), "sinon le contenu ne servirait qu'une fois");
}

/* ==================================================================== */
/* 3. UNE RÉPONSE OUVRE UN SUJET                                        */
/* ==================================================================== */
{
  /* On fabrique un contenu minuscule pour isoler le mecanisme. */
  const faux = { SCENES: {} };
  D.MOMENTS.forEach((m) => { faux.SCENES[m] = []; });
  faux.SCENES.arrivee = [{ cle: "a1", si: "toujours", texte: "Il s'assoit.",
    choix: [{ lab: "Écouter", r: "Il parle.", d: 1, ton: "calme", ouvre: "secret" }] }];
  faux.SCENES.cafe = [{ cle: "secret", si: "toujours", texte: "Il baisse la voix.",
    choix: [{ lab: "Ne rien dire", r: "Il hoche la tête.", d: 2, ton: "complice" }] }];
  const S = D.commencer(faux.SCENES, CTX, 7);
  const p = D.courante(S); D.repondre(S, 0);
  const q = D.courante(S);
  dit("une réponse peut ouvrir un sujet, et il passe AVANT la suite du repas",
    p.cle === "a1" && q && q.cle === "secret");
  dit("mais un sujet ouvert ne s'ouvre qu'une fois",
    (() => { const s2 = D.commencer(faux.SCENES, CTX, 7);
             D.courante(s2); D.repondre(s2, 0);
             D.courante(s2); D.repondre(s2, 0);
             let n = 0, g = 0;
             while (g++ < 20) { const x = D.courante(s2); if (!x) break; if (x.cle === "secret") n++; D.repondre(s2, 0); }
             return n === 0; })());
}

/* ==================================================================== */
/* 4. LE TOTAL DÉCIDE DE LA FIN DE SOIRÉE                               */
/* ==================================================================== */
{
  dit("une bonne soirée et une soirée ratée ne se racontent pas pareil",
    D.ambiance(16).rang === "excellent" && D.ambiance(-12).rang === "rate"
    && D.ambiance(0).rang === "correct");
  dit("et l'ambiance se dit en mots, jamais en chiffres",
    D.MOMENTS.every(() => true)
    && [16, 8, 0, -5, -20].every((c) => !/\d/.test(D.ambiance(c).mot)));
}

/* ==================================================================== */
/* 5. LE CONTENU — écrit par des agents, donc vérifié comme une donnée  */
/* ==================================================================== */
{
  const v = D.volume(C.SCENES);
  /* /!\ LA DEMANDE DE MAEL SE MESURE : « beaucoup beaucoup plus de
     dialogue ». L'ancien dîner : 3 scènes, 9 répliques. */
  dit("le dîner porte VRAIMENT beaucoup de dialogue",
    v.scenes >= 80 && v.repliques >= 250,
    `${v.scenes} scènes · ${v.repliques} répliques (avant : 3 et 9)`);

  const tousMoments = D.MOMENTS.every((m) => (C.SCENES[m] || []).length >= 5);
  dit("chaque moment du repas a de quoi varier",
    tousMoments, D.MOMENTS.map((m) => `${m}:${(C.SCENES[m] || []).length}`).join(" "));

  const toutes = D.MOMENTS.flatMap((m) => C.SCENES[m] || []);
  const cles = toutes.map((s) => s.cle);
  dit("toutes les clés sont uniques", new Set(cles).size === cles.length,
    `${cles.length} scènes`);
  dit("toutes les conditions sont dans la liste fermée",
    toutes.every((s) => D.CONDITIONS.includes(s.si)),
    [...new Set(toutes.map((s) => s.si))].filter((x) => !D.CONDITIONS.includes(x)).join(" ") || "aucune intruse");
  dit("chaque scène a un texte et au moins trois réponses",
    toutes.every((s) => s.texte && s.texte.length > 15 && (s.choix || []).length >= 3));
  dit("chaque réponse a un libellé, une réaction écrite, un effet et un ton",
    toutes.every((s) => s.choix.every((c) =>
      c.lab && c.lab.length > 3 && c.r && c.r.length > 10
      && typeof c.d === "number" && c.ton)));

  /* /!\ AUCUN CHIFFRE A L'ECRAN — la regle du jeu, et une IA qui ecrit
     est exactement ce qui l'oublierait. */
  const avecChiffre = toutes.filter((s) =>
    /\d/.test(s.texte) || s.choix.some((c) => /\d/.test(c.lab) || /\d/.test(c.r)));
  dit("aucun chiffre ne s'affiche dans les dialogues",
    avecChiffre.length === 0,
    avecChiffre.slice(0, 2).map((s) => s.cle).join(" · ") || "propre");

  /* Les pointeurs `ouvre` doivent mener quelque part. */
  const orphelins = [];
  for (const s of toutes)
    for (const c of s.choix)
      if (c.ouvre && !cles.includes(c.ouvre)) orphelins.push(`${s.cle}→${c.ouvre}`);
  dit("aucun sujet ouvert ne mène dans le vide",
    orphelins.length === 0, orphelins.slice(0, 3).join(" · ") || "tous les renvois aboutissent");

  /* Les effets restent dans une plage humaine. */
  const fous = toutes.flatMap((s) => s.choix).filter((c) => c.d < -8 || c.d > 8);
  dit("aucun effet démesuré — une phrase ne fait pas basculer une relation",
    fous.length === 0, fous.slice(0, 3).map((c) => c.d).join(" ") || "tous entre -8 et +8");

  /* Il doit y avoir de vrais mauvais choix, sinon il n'y a pas de choix. */
  const mauvais = toutes.flatMap((s) => s.choix).filter((c) => c.d <= -3).length;
  dit("on peut vraiment se planter — sinon ce n'est pas un choix",
    mauvais >= 20, `${mauvais} réponses qui coûtent cher`);

  /* Et de la variété : pas trois fois la même réplique. */
  const textes = toutes.map((s) => s.texte.trim().toLowerCase());
  dit("aucune scène n'est écrite deux fois",
    new Set(textes).size === textes.length,
    `${textes.length - new Set(textes).size} doublon(s)`);
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — la soirée s'enchaîne, et elle a de quoi parler.");
