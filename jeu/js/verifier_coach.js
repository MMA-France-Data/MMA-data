/**
 * verifier_coach.js — BANC 38 : LA LOI DU COACH.
 *
 * ===================================================================
 * /!\ POURQUOI CE BANC EXISTE
 * ===================================================================
 * L'audit du 02/09 a confirmé 117 défauts dans le système de coachs —
 * 38 « morts », 24 bugs. La cause commune n'est pas l'inattention :
 * AUCUN BANC NE TESTAIT NI niveauStaff, NI AXES_COACH, NI facteursSeance.
 * Le seul filet, le banc 29, ne regarde que les demandes du staff, et sa
 * liste de mesures était ÉCRITE À LA MAIN — les deux seules clés qu'elle
 * oubliait étaient précisément les deux qui ne faisaient rien.
 *
 * Ce banc mesure des ÉCARTS, jamais des présences. Un attribut qui ne
 * change pas un chiffre entre deux situations est un attribut mort, et
 * il fait échouer le banc — même si le code qui le lit existe.
 */
const C = require("./coach.js");
const D = require("./coach_dialogue.js");
const fs = require("fs");
const path = require("path");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

console.log("BANC 38 — la loi du coach : une seule table, et rien de mort.");

/** Un coach de test, spécialiste d'un axe sur un groupe. */
const coach = (o) => Object.assign({
  nom: "Test Coach", niveau: 70, axes: ["striking"], groupes: ["pro"],
  metier: "competition", entente: 55, age: 45, potentiel: 80, vitesse: 1,
  salaire: 300, semainesMaison: 52, vu: 60,
}, o || {});

/* ==================================================================== */
/* 1. LA TABLE UNIQUE — et pas un axe qui ne mène nulle part            */
/* ==================================================================== */
{
  dit("il y a cinq axes, et chacun porte ses cinq choses",
    C.AXES.length === 5 && C.AXES.every((a) => a.cle && a.lib && a.fam && a.dom && a.equip && a.mot),
    C.AXES.map((a) => a.cle).join(" · "));

  /* /!\ L'ASSERTION QUI MANQUAIT LE PLUS. « Préparation mentale » était
     l'un des cinq axes — donc un cinquième du marché, avec huit CV écrits
     pour lui — et AUCUNE famille de séance ne lui correspondait. */
  const sansFamille = C.AXES.filter((a) => !a.fam || C.axeDeFam(a.fam) !== a.cle);
  dit("chaque axe encadre une famille de séance, et l'aller-retour tient",
    sansFamille.length === 0,
    sansFamille.length ? "MORT : " + sansFamille.map((a) => a.cle).join(",") : "les cinq");

  dit("chaque axe déclare au moins un canal, tous dans la liste fermée",
    C.AXES.every((a) => a.canaux.length && a.canaux.every((k) => C.CANAUX.indexOf(k) >= 0)));

  /* Un axe sans matériel serait le seul du staff à qui une famille
     entière de demandes est fermée — c'était le cas de « mental ». */
  dit("chaque axe a un matériel à réclamer",
    C.AXES.every((a) => !!a.equip), C.AXES.map((a) => a.cle + "→" + a.equip).join(" · "));

  dit("« tous » n'est plus un groupe du modèle",
    C.GROUPES.length === 2 && C.GROUPES.indexOf("tous") < 0, C.GROUPES.join("/"));
  dit("mais une vieille sauvegarde en « tous » se lit comme les deux",
    C.groupesDe({ groupe: "tous" }).length === 2);
  dit("et un vieux c.axe seul se lit encore",
    C.axesDe({ axe: "sol" }).join() === "sol");
  /* /!\ c.axes FAIT FOI : trois sources se disputaient ce champ, et le
     bouton « Sur quoi il insiste » écrivait la mauvaise. */
  dit("c.axes fait foi dès qu'il existe",
    C.axesDe({ axe: "sol", axes: ["lutte"] }).join() === "lutte");
}

/* ==================================================================== */
/* 2. AUCUN AXE MORT — chacun change la séance, mesuré                   */
/* ==================================================================== */
{
  const vide = C.couverture([]);
  const morts = [];
  const ecarts = [];
  for (const a of C.AXES) {
    const seul = C.couverture([coach({ axes: [a.cle] })]);
    const avec = C.encadrement(seul, "pro", a.fam);
    const sans = C.encadrement(vide, "pro", a.fam);
    ecarts.push(`${a.cle} ${sans.toFixed(2)}→${avec.toFixed(2)}`);
    if (!(avec > sans * 1.2)) morts.push(a.cle);
  }
  dit("les CINQ axes changent vraiment la séance qu'ils encadrent",
    morts.length === 0, morts.length ? "MORT : " + morts.join(",") : ecarts.join(" · "));

  /* /!\ LE PLANCHER. L'ancien Math.max(20, …) faisait qu'une salle SANS
     AUCUN COACH rendait déjà 0,73 sur une échelle qui monte à 1,45 : la
     moitié du chemin vers le meilleur staff du jeu, gratuitement. */
  dit("sans personne, l'encadrement ne vaut que le plancher nu",
    Math.abs(C.encadrement(vide, "pro", "striking") - 0.55) < 0.001,
    C.encadrement(vide, "pro", "striking").toFixed(3));

  /* Hors de sa spécialité il vaut la moitié — et UNE SEULE FOIS. */
  const spe = C.couverture([coach({ axes: ["striking"] })]);
  dit("un coach hors de sa spécialité vaut moins, mais pas rien",
    C.encadrement(spe, "pro", "jjb") < C.encadrement(spe, "pro", "striking")
    && C.encadrement(spe, "pro", "jjb") > 0.55,
    `sa spé ${C.encadrement(spe, "pro", "striking").toFixed(2)} · ailleurs ${C.encadrement(spe, "pro", "jjb").toFixed(2)}`);
}

/* ==================================================================== */
/* 3. LA DISPERSION COÛTE — c'était l'inverse                            */
/* ==================================================================== */
{
  /* /!\ MESURÉ SUR L'ANCIEN CODE : un homme seul sur les cinq axes ET les
     deux groupes valait encore 72 % de cinq spécialistes, pour un
     cinquième du salaire. La dispersion était donc la stratégie
     GAGNANTE — l'exact inverse de ce que la grille raconte. */
  const un = C.couverture([coach({ axes: ["striking"], groupes: ["pro"] })]);
  const deux = C.couverture([coach({ axes: ["striking", "sol"], groupes: ["pro"] })]);
  const dix = C.couverture([coach({ axes: C.AXES.map((a) => a.cle), groupes: ["amateur", "pro"] })]);
  const e1 = C.encadrement(un, "pro", "striking");
  const e2 = C.encadrement(deux, "pro", "striking");
  const e10 = C.encadrement(dix, "pro", "striking");
  dit("deux cases, ça se tient encore", e2 < e1 && e2 > e1 * 0.75,
    `${e1.toFixed(2)} → ${e2.toFixed(2)}`);
  dit("dix cases, ça ne se tient plus du tout", e10 < e1 * 0.65,
    `${e1.toFixed(2)} → ${e10.toFixed(2)}`);

  /* La bonne stratégie ne doit plus être « un homme, tout sur lui ». */
  const cinqSpe = C.couverture(C.AXES.map((a, i) =>
    coach({ nom: "S" + i, axes: [a.cle], groupes: ["pro"] })));
  dit("cinq spécialistes battent nettement l'homme-orchestre",
    C.encadrement(cinqSpe, "pro", "striking") > e10 * 1.5,
    `${C.encadrement(cinqSpe, "pro", "striking").toFixed(2)} contre ${e10.toFixed(2)}`);

  dit("et un homme sur trop de fronts n'apprend plus rien lui-même",
    C.pas(coach({ axes: ["striking"], groupes: ["pro"], niveau: 50 }))
    > C.pas(coach({ axes: C.AXES.map((a) => a.cle), groupes: ["amateur", "pro"], niveau: 50 })));
}

/* ==================================================================== */
/* 3 bis. LE TÉMOIN D'AMPLITUDE — bloquant                               */
/* ==================================================================== */
{
  /* /!\ LES JUGES DE LA CONCEPTION ONT NOMMÉ CE MANQUE : « aucun témoin
     avant/après bloquant sur la progression ». Ce chantier touche en même
     temps le plancher, la dispersion, l'entente, le métier et le
     multiplicateur de spécialité. Sans une assertion qui fixe l'AMPLITUDE
     TOTALE, un réglage futur peut la diviser par deux sans que rien ne
     s'allume. Elle est ici, chiffrée, et elle doit être défendue si on la
     change. */
  const rien = C.encadrement(C.couverture([]), "pro", "striking");
  const top = C.encadrement(C.couverture([coach({ niveau: 95, entente: 95 })]), "pro", "striking");
  dit("entre aucun staff et le meilleur possible, la séance change vraiment",
    top / rien >= 2.4 && top / rien <= 3.0,
    `x${(top / rien).toFixed(2)} (0,55 → ${top.toFixed(2)})`);

  /* /!\ LA RÈGLE POSÉE PAR MAEL : « le coach pèse plus que le matériel ».
     Le matériel va de 0,80 (1★) à 1,20 (3★), soit x1,50. Elle était
     FAUSSE partout dans l'ancien code, et elle s'INVERSAIT même sur les
     séances de cage. */
  dit("et le coach pèse nettement plus que le matériel",
    top / rien > 1.5 * 1.4, `coach x${(top / rien).toFixed(2)} · matériel x1,50`);
}

/* ==================================================================== */
/* 4. LE MÉTIER ET L'ÂGE PÈSENT — ils étaient cosmétiques                */
/* ==================================================================== */
{
  /* /!\ LE MÉTIER NE CHANGEAIT QUE LE SALAIRE : rien n'empêchait un
     formateur à 25 de préparer un combat de titre. C'est pourtant la
     distinction que Mael a demandée en premier. */
  const form = C.couverture([coach({ metier: "formateur" })]);
  const comp = C.couverture([coach({ metier: "competition" })]);
  dit("un coach de compétition vaut mieux chez les pros",
    C.encadrement(comp, "pro", "striking") > C.encadrement(form, "pro", "striking"),
    `${C.encadrement(form, "pro", "striking").toFixed(2)} → ${C.encadrement(comp, "pro", "striking").toFixed(2)}`);
  const formA = C.couverture([coach({ metier: "formateur", groupes: ["amateur"] })]);
  const compA = C.couverture([coach({ metier: "competition", groupes: ["amateur"] })]);
  dit("et un formateur vaut mieux chez les amateurs — c'est une séquence, pas une échelle",
    C.encadrement(formA, "amateur", "striking") > C.encadrement(compA, "amateur", "striking"),
    `${C.encadrement(compA, "amateur", "striking").toFixed(2)} → ${C.encadrement(formA, "amateur", "striking").toFixed(2)}`);

  dit("l'âge finit par peser sur le tapis",
    C.fAge(coach({ age: 45 })) > C.fAge(coach({ age: 68 })),
    `45 ans ${C.fAge({ age: 45 }).toFixed(2)} · 68 ans ${C.fAge({ age: 68 }).toFixed(2)}`);
}

/* ==================================================================== */
/* 5. L'ENTENTE ACHÈTE QUELQUE CHOSE                                     */
/* ==================================================================== */
{
  /* /!\ ELLE VALAIT ±4,7 % SUR UNE SÉANCE, et quarante des cent points de
     la jauge ne changeaient strictement rien. À côté, celle d'un
     COMBATTANT vaut 42 % de salaire et son départ pur et simple. */
  const bas = C.couverture([coach({ entente: 10 })]);
  const haut = C.couverture([coach({ entente: 95 })]);
  const eb = C.encadrement(bas, "pro", "striking"), eh = C.encadrement(haut, "pro", "striking");
  dit("un coach aigri fait vraiment des séances aigres", eh > eb * 1.18,
    `${eb.toFixed(2)} → ${eh.toFixed(2)} (${Math.round((eh / eb - 1) * 100)} %)`);

  /* Et aucun palier de la jauge n'est mort. */
  const paliers = [0, 20, 40, 55, 70, 85, 100].map((e) => C.fEntente(coach({ entente: e })));
  let plat = 0;
  for (let i = 1; i < paliers.length; i++) if (paliers[i] <= paliers[i - 1] + 0.001) plat++;
  dit("chaque palier de la jauge change quelque chose", plat === 0,
    paliers.map((x) => x.toFixed(2)).join(" ‹ "));
}

/* ==================================================================== */
/* 6. LE SOCLE — la fin du cliquet                                       */
/* ==================================================================== */
{
  /* /!\ LE CAFÉ DONNAIT +3 PAR SEMAINE, GRATUITEMENT — quatre fois
     l'érosion maximale des faits. Tout le système d'entente du staff
     était annulé par un clic hebdomadaire. */
  const paye = C.socle(coach({ salaire: 300 }), { bareme: 280 });
  const souspaye = C.socle(coach({ salaire: 80 }), { bareme: 280 });
  dit("être payé sous le marché fait vraiment baisser le socle",
    souspaye < paye - 15, `${souspaye} contre ${paye}`);

  const concentre = C.socle(coach({ axes: ["striking"], groupes: ["pro"] }), { bareme: 280 });
  const etale = C.socle(coach({ axes: C.AXES.map((a) => a.cle), groupes: ["amateur", "pro"] }), { bareme: 280 });
  dit("être étalé sur toute la salle aussi", etale < concentre - 15, `${etale} contre ${concentre}`);

  const trahi = C.socle(coach({ salaire: 300 }), { bareme: 280, paroleTrahie: 3 });
  dit("et ne jamais tenir parole coûte plus cher que tout", trahi < paye - 20,
    `${trahi} contre ${paye}`);

  /* La glisse ne dépasse jamais le socle : un café ne répare pas un salaire. */
  let v = 20; for (let i = 0; i < 200; i++) v = C.glisse(v, 45);
  dit("l'entente converge vers le socle et ne le dépasse pas",
    Math.abs(v - 45) < 0.5, `${v}`);
  let w = 90; for (let i = 0; i < 200; i++) w = C.glisse(w, 45);
  dit("et elle redescend aussi — ce n'est plus un cliquet", Math.abs(w - 45) < 0.5, `${w}`);
}

/* ==================================================================== */
/* 7. LA PROGRESSION NE RECULE JAMAIS                                    */
/* ==================================================================== */
{
  /* /!\ LA VITESSE RE-DÉRIVÉE POUVAIT ÊTRE NÉGATIVE : le calcul lisait un
     entier SIGNÉ, et dix coachs sur trente-deux REGRESSAIENT à vie — la
     valeur partant ensuite figée dans la sauvegarde. */
  let recule = null;
  for (let n = 20; n <= 95; n += 5)
    for (const vit of [-3, 0, 0.45, 1, 1.7, 9])
      for (const age of [24, 40, 55, 63, 70]) {
        const c = coach({ niveau: n, potentiel: 90, vitesse: vit, age });
        if (C.pas(c) < c.niveau) recule = `${n}/${vit}/${age}`;
      }
  dit("aucun coach ne régresse, quelle que soit sa vitesse enregistrée",
    recule === null, recule ? "REGRESSE à " + recule : "vitesses de -3 à 9 testées");

  dit("il progresse vraiment quand il a de la marge",
    C.pas(coach({ niveau: 40, potentiel: 90, age: 30 })) > 40);
  dit("et il s'arrête à son potentiel",
    C.pas(coach({ niveau: 90, potentiel: 90 })) === 90);
  dit("un homme de soixante-cinq ans n'apprend plus",
    C.pas(coach({ niveau: 40, potentiel: 90, age: 65 })) === 40);
}

/* ==================================================================== */
/* 8. LA CARTE DIT CE QU'ELLE VOIT                                       */
/* ==================================================================== */
{
  const couv = C.couverture([coach({ nom: "A", axes: ["striking"], groupes: ["pro"] })]);
  dit("dix cases, toujours", Object.keys(couv.cases).length === 10);
  dit("neuf trous quand un seul homme tient une case", couv.trous.length === 9,
    `${couv.trous.length} trous`);
  const deux = C.couverture([coach({ nom: "A" }), coach({ nom: "B" })]);
  dit("deux hommes sur la même case, la carte le dit", deux.doubles.length === 1,
    deux.doubles.join());
  dit("et le second n'ajoute que ses yeux, pas un doublement",
    deux.cases["striking|pro"].niveau < couv.cases["striking|pro"].niveau * 1.25,
    `${couv.cases["striking|pro"].niveau} → ${deux.cases["striking|pro"].niveau}`);
  /* /!\ UN HOMME QU'ON PAIE À NE RIEN ENCADRER doit être nommé : c'est
     exactement la classe de défaut que ce chantier existe pour tuer. */
  const mort = C.couverture([coach({ nom: "Z", axes: [], groupes: [] })]);
  dit("un coach qui ne tient aucune case est signalé", mort.morts.length === 1, mort.morts.join());

  /* Aucun état ne se dit en chiffres. */
  dit("les états se disent en mots, jamais en chiffres",
    Object.values(C.ETATS).every((e) => !/\d/.test(e.mot + e.sous)),
    Object.values(C.ETATS).map((e) => e.mot).join(" · "));
}

/* ==================================================================== */
/* 9. LA MÉTHODE — deux coachs du même niveau ne font pas le même homme  */
/* ==================================================================== */
{
  const cles = ["jab", "cross", "low_kick", "garde", "footwork", "teep", "esquive_tete"];
  const a = C.signature(coach({ nom: "Serge Perret" }), cles);
  const b = C.signature(coach({ nom: "Karim Vasseur" }), cles);
  dit("chaque coach a trois gestes de prédilection", a.length === 3 && b.length === 3,
    a.join(",") + " / " + b.join(","));
  dit("deux coachs différents ne servent pas les mêmes", a.join() !== b.join());
  dit("et le même coach sert toujours les siens — aucun tirage",
    C.signature(coach({ nom: "Serge Perret" }), cles).join() === a.join());
  dit("un grand coach imprime plus fort qu'un débutant",
    C.empreinte(coach({ niveau: 90 })) > C.empreinte(coach({ niveau: 30 })));
}

/* ==================================================================== */
/* 10. LA CONVERSATION — listes fermées, et rien de décoratif            */
/* ==================================================================== */
{
  dit("les déclencheurs sont une liste fermée et sans doublon",
    new Set(D.DECLENCHEURS).size === D.DECLENCHEURS.length,
    `${D.DECLENCHEURS.length} déclencheurs`);
  /* Chaque déclencheur doit pouvoir être VRAI dans au moins une
     situation : un déclencheur toujours faux est une scène morte. */
  const situations = [
    {}, { entente: 10 }, { entente: 50 }, { entente: 90 },
    { semainesMaison: 4 }, { semainesMaison: 200 }, { age: 62 },
    { metier: "competition" }, { metier: "formateur" },
    { salaire: 10, bareme: 300 }, { salaire: 400, bareme: 300 },
    { cases: 0 }, { cases: 1 }, { cases: 5 },
    { phase: "monte" }, { phase: "sommet" }, { phase: "apres" }, { phase: "fin" },
    { trouACote: true }, { partage: true }, { staff: 1 }, { sallePleine: true },
    { poulain: "X" }, { crame: "X" }, { espoir: "X" },
    { dernier: "victoire" }, { dernier: "defaite" }, { dernier: "titre" },
    { departRecent: true }, { promesseEnCours: true }, { recadrages: 2 },
    { paroleTrahie: 3 }, { ouiDaffilee: 4 },
  ];
  const jamais = D.DECLENCHEURS.filter((k) => !situations.some((x) => D.tient(k, x)));
  dit("aucun déclencheur n'est impossible à satisfaire", jamais.length === 0,
    jamais.length ? "MORT : " + jamais.join(",") : "les " + D.DECLENCHEURS.length);

  const err = console.error; let crie = 0; console.error = () => { crie++; };
  const r = D.tient("parce_que_oui", {});
  console.error = err;
  dit("un déclencheur inventé ne passe pas, et il crie", r === false && crie === 1);

  dit("les effets sont une liste fermée", new Set(D.EFFETS).size === D.EFFETS.length,
    `${D.EFFETS.length} effets`);
  dit("« rien » est un effet déclaré — botter en touche est un choix",
    D.EFFETS.indexOf("rien") >= 0);
  dit("les six caractères sont distincts", new Set(D.CARACTERES.map((c) => c.cle)).size === 6);

  /* /!\ ILS NE DOIVENT PAS PARLER TOUS DE LA MÊME VOIX. Le contenu du
     dîner porte UN homme, donc une voix, et c'est cohérent. Celui du
     coach en portera cinq ou six qui se partagent le même lot. */
  const noms = ["Serge Perret", "Karim Vasseur", "Bruno Marchal", "Vlad Petrov",
    "Malik Diallo", "Hervé Klein", "Tiago Silva", "Éric Roussel",
    "Nordine Belkacem", "Léo Bouchard", "Franck Tanaka", "Ivan Lefèvre"];
  const vus = new Set(noms.map((n) => D.caractereDe({ nom: n })));
  dit("les caractères se répartissent vraiment sur un staff plausible",
    vus.size >= 4, `${vus.size} voix sur douze noms`);
  dit("et le caractère d'un homme ne bouge jamais",
    D.caractereDe({ nom: "Serge Perret" }) === D.caractereDe({ nom: "Serge Perret" }));
}

/* ==================================================================== */
/* 11. LA PÉREMPTION — l'anti-redite                                     */
/* ==================================================================== */
{
  const s = { cle: "x", vie: "unique" };
  dit("une scène unique ne revient jamais", D.revenable(s, { x: 0 }, 100000) === false);
  dit("une scène de saison revient au bout d'un an",
    D.revenable({ cle: "y", vie: "saison" }, { y: 0 }, 51 * 7) === false
    && D.revenable({ cle: "y", vie: "saison" }, { y: 0 }, 53 * 7) === true);
  dit("une scène courante revient à sa péremption",
    D.revenable({ cle: "z", vie: "courante", peremption: 20 }, { z: 0 }, 19 * 7) === false
    && D.revenable({ cle: "z", vie: "courante", peremption: 20 }, { z: 0 }, 21 * 7) === true);
  dit("et une scène jamais vue est toujours jouable",
    D.revenable({ cle: "w", vie: "courante" }, {}, 0) === true);
}

/* ==================================================================== */
/* 12. LA RÈGLE 2, VÉRIFIÉE AU GREP                                      */
/* ==================================================================== */
{
  /* /!\ LA SEULE RÉDACTION DE « PAS DE DEUXIÈME SOURCE » QU'UN BANC PEUT
     VÉRIFIER MÉCANIQUEMENT. SALLE.roleStaff était une table indexée par
     NOM PROPRE, câblée en dur sur {"Da Costa":"jjb","Meyer":"striking"},
     que facteursSeance multipliait à chaque séance sans jamais regarder
     le staff réel — et la correspondance axe↔famille était recopiée six
     fois dans le fichier, avec six comportements différents pour
     « mental ». */
  const src = fs.readFileSync(path.join(__dirname, "..", "demo_jeu.html"), "utf8");
  /* On ne compte que le CODE : les commentaires racontent la mort de
     roleStaff, et ils ont le droit de le nommer. */
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  dit("SALLE.roleStaff n'existe plus nulle part dans le code",
    !/SALLE\.roleStaff/.test(code));
  dit("le littéral câblé sur deux noms propres a disparu",
    !/"Da Costa"\s*:\s*"jjb"/.test(code));
  dit("niveauStaff n'existe plus", !/function\s+niveauStaff/.test(code));
  dit("evtCoachAncien — la fonction morte — n'existe plus",
    !/function\s+evtCoachAncien/.test(code));
  dit("ouvrirRoleStaff et poserRoleStaff n'existent plus",
    !/function\s+(ouvrirRoleStaff|poserRoleStaff)/.test(code));

  /* La correspondance axe↔famille ne doit plus être écrite à la main. */
  const copies = (code.match(/striking\s*:\s*"striking"\s*,\s*lutte\s*:\s*"mma"/g) || []).length
    + (code.match(/striking\s*:\s*"striking"\s*,\s*mma\s*:\s*"lutte"/g) || []).length;
  dit("la correspondance axe↔famille n'est plus recopiée à la main",
    copies === 0, copies ? copies + " copie(s) restante(s)" : "la seule table est dans coach.js");

  /* /!\ LE MODULE EST PUR. Un module de règles qui touche au DOM, au
     hasard ou à l'état global n'est plus vérifiable : il devient une
     deuxième source de lui-même. */
  const loi = fs.readFileSync(path.join(__dirname, "coach.js"), "utf8");
  const dial = fs.readFileSync(path.join(__dirname, "coach_dialogue.js"), "utf8");
  for (const [nom, txt] of [["coach.js", loi], ["coach_dialogue.js", dial]]) {
    const corps = txt.replace(/\/\*[\s\S]*?\*\//g, "");
    dit(`${nom} est pur — ni DOM, ni hasard, ni date, ni état global`,
      !/document|window\.|Math\.random|Date\.now|new Date|\bSALLE\b|\bt\.jour\b|\balea\(/.test(corps));
  }
}

/* ==================================================================== */
/* 13. LE BARÈME                                                         */
/* ==================================================================== */
{
  let baisse = null;
  for (let n = 1; n < 100; n++)
    for (const comp of [true, false])
      if (C.salaire(n, comp) < C.salaire(n - 1, comp)) baisse = `${n}/${comp}`;
  dit("le barème monte toujours avec le niveau", baisse === null, baisse || "1 à 99");
  dit("l'élite coûte vraiment l'élite",
    C.salaire(90, true) > C.salaire(60, true) * 8,
    `60 → ${C.salaire(60, true)} €/sem · 90 → ${C.salaire(90, true)} €/sem`);
  dit("et un formateur reste abordable au lancement",
    C.salaire(35, false) < 60, `${C.salaire(35, false)} €/sem`);
}

/* ==================================================================== */
/* 14. CE QU'ON SAIT DE LUI — et jamais un chiffre                       */
/* ==================================================================== */
{
  const neuf = C.avis(coach({ vu: 1 })), connu = C.avis(coach({ vu: 100 }));
  dit("on ne connaît pas un homme qu'on vient d'embaucher", neuf.sur === 0);
  dit("et on finit par le connaître par cœur", connu.sur === 4);
  dit("l'avis se resserre avec les semaines",
    [1, 6, 20, 40, 100].map((v) => C.avis(coach({ vu: v })).sur).join() === "0,1,2,3,4");
  /* /!\ AUCUN CHIFFRE NE SORT. On n'embauche pas quelqu'un sur une note. */
  let chiffre = null;
  for (let n = 10; n <= 99; n += 1)
    for (const v of [5, 15, 40, 100]) {
      const m = C.avis(coach({ niveau: n, vu: v })).mot;
      if (/\d/.test(m)) chiffre = m;
    }
  dit("aucun avis ne laisse échapper un chiffre", chiffre === null, chiffre || "360 lectures");
  /* Et il est DÉTERMINISTE : sinon on rouvre l'écran jusqu'à la bonne phrase. */
  dit("deux lectures le même jour donnent la même phrase",
    C.avis(coach({ niveau: 63, vu: 8 })).mot === C.avis(coach({ niveau: 63, vu: 8 })).mot);
}

/* ==================================================================== */
console.log(echecs
  ? `\n${echecs} ECHEC(S)`
  : "\nCONFORME — une seule loi, cinq axes vivants, et rien de décoratif.");
process.exit(echecs ? 1 : 0);
