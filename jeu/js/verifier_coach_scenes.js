/**
 * verifier_coach_scenes.js — BANC 39 : CE QU'ON SE DIT AVEC SON COACH.
 *
 * Calqué sur le banc 36 (le dîner), avec UNE assertion que le banc 36
 * n'avait pas besoin d'avoir et qui est ici la plus importante :
 *
 * ===================================================================
 * /!\ LA REDITE, ET POURQUOI ELLE DÉCIDE DE TOUT
 * ===================================================================
 * Mesuré : le dîner porte 140 scènes, en consomme 13 par soirée, une
 * soirée par an — soit DIX ANS avant la première redite. Personne n'a
 * jamais eu besoin de le vérifier.
 * Un coach, on le croise CHAQUE SEMAINE. Le stock n'est donc pas la
 * question : la RÉPÉTITION l'est. Un lot de quatre-vingt-dix scènes tirées
 * au hasard toutes les semaines radote au premier trimestre, et le joueur
 * sent immédiatement qu'il lit une base de données.
 * Ce banc simule donc trois saisons au rythme de jeu réel. Il mesure la
 * PREMIÈRE saison — celle où le joueur se souvient de ce qu'on lui a dit,
 * donc la seule où une redite se voit — et, sur les trois, le NOMBRE de
 * choses différentes qu'il aura entendues. Voir la section 2 pour ce que
 * ce banc a d'abord mesuré de travers, et pourquoi.
 *
 * L'autre chose que le banc 36 ne pouvait pas savoir : les coachs sont
 * PLUSIEURS. Le dîner porte un homme, donc une voix, et c'est cohérent.
 * Ici cinq ou six hommes se partagent le même lot — donc on vérifie que
 * chaque caractère a de quoi parler, sinon le joueur entend un seul homme
 * par cinq bouches.
 */
const D = require("./coach_dialogue.js");
const C = require("./coach.js");
const S = require("./coach_scenes.js").SCENES;

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

console.log("BANC 39 — ce qu'on se dit avec son coach, et à quelle fréquence il se répète.");

const toutes = [];
for (const m of D.MOMENTS) for (const s of (S[m] || [])) toutes.push(Object.assign({ moment: m }, s));
const tousChoix = toutes.reduce((a, s) => a.concat(s.choix || []), []);

/* ==================================================================== */
/* 1. LE VOLUME — la demande se mesure                                   */
/* ==================================================================== */
{
  const v = D.volume(S);
  dit("le bureau porte vraiment beaucoup de dialogue",
    v.scenes >= 110 && v.repliques >= 420,
    `${v.scenes} scènes · ${v.repliques} répliques`);

  /* /!\ CE QU'IL Y AVAIT AVANT CE CHANTIER : ~40 répliques de coach dans
     TOUTE une partie, et zéro ligne pour le joueur. */
  dit("c'est au moins dix fois ce qu'un coach disait avant",
    v.repliques >= 400, `${v.repliques} contre ~40`);

  const vides = D.MOMENTS.filter((m) => (S[m] || []).length < 8);
  dit("chaque moment a de quoi varier", vides.length === 0,
    vides.length ? "trop maigre : " + vides.join(",") : D.MOMENTS.map((m) => m + ":" + (S[m] || []).length).join(" · "));

  /* Le bureau est la surface que le joueur ouvre : chaque sujet doit
     porter de quoi tenir plusieurs saisons. */
  const maigres = D.SUJETS.filter((x) => (S.bureau || []).filter((s) => s.sujet === x.cle).length < 6);
  dit("chaque sujet du bureau a de quoi tenir", maigres.length === 0,
    maigres.length ? "maigre : " + maigres.map((x) => x.cle).join(",") : `${D.SUJETS.length} sujets servis`);
}

/* ==================================================================== */
/* 2. LA REDITE — l'assertion qui décide de tout                         */
/* ==================================================================== */
{
  /* Trois saisons, deux sujets ouverts par semaine : le rythme d'un
     joueur qui utilise vraiment le bureau. */
  const ctx = { caractere: "bourru", entente: 55, semainesMaison: 60, age: 45,
    metier: "competition", salaire: 200, bareme: 250, cases: 2, phase: "sommet",
    staff: 2, trouACote: true, partage: false, dernier: "victoire" };

  /* ================================================================== */
  /* /!\ CE QUE CE BANC MESURAIT D'ABORD, ET POURQUOI C'ÉTAIT FAUX      */
  /* ================================================================== */
  /* La première écriture exigeait « moins de trente pour cent de redites
     sur trois saisons ». Or coach_dialogue.js PROMET exactement l'inverse :
     une scène porte sa `vie`, et passée sa péremption elle A LE DROIT de
     revenir — « une scène revue est une scène qui a eu le droit de
     revenir, jamais un accident de tirage ».
     Le calcul : trois cents rendez-vous, une péremption d'un semestre,
     neuf sujets. Pour tenir sous trente pour cent il faudrait plus de deux
     cents scènes JOUABLES POUR UN SEUL HOMME dans une seule situation —
     donc un contenu où ni le caractère ni le déclencheur ne trient plus
     rien. Le seuil ne mesurait pas la richesse : il interdisait les deux
     mécaniques qui font que le coach parle juste.
     LEÇON, ET ELLE EST DE LA MÊME FAMILLE QUE CELLE DU BANC 30 : un seuil
     qu'aucun contenu honnête ne peut atteindre ne mesure plus rien, il se
     contourne. On mesure donc les DEUX choses que Mael verrait vraiment :

       — LA PREMIÈRE SAISON NE SE RÉPÈTE PAS. C'est la seule où il se
         souvient de ce qu'on lui a dit, donc la seule où une redite se
         voit. Un contenu maigre échoue ici tout de suite.
       — SUR TROIS SAISONS, IL AURA DIT CENT CHOSES DIFFÉRENTES, et rien
         plus de six fois. Une variété comptée en NOMBRE, pas en
         pourcentage : c'est ce qui ne peut pas être atteint en retirant
         les déclencheurs. */
  const p = D.redite(S, ctx, 52, 2);
  dit("la première saison ne se répète pratiquement pas",
    p.redites <= p.vues * 0.12,
    `${p.vues} jouées · ${p.distinctes} distinctes · ${p.redites} redites`);

  const r = D.redite(S, ctx, 156, 2);
  dit("sur trois saisons, il aura dit cent choses différentes",
    r.distinctes >= 100,
    `${r.vues} rendez-vous · ${r.distinctes} scènes distinctes`);
  dit("et aucune scène ne revient sans arrêt",
    r.pireCompte <= 6, `la plus vue : ${r.pireCle} (${r.pireCompte} fois)`);
}

/* ==================================================================== */
/* 3. LE CONTRAT — listes fermées, rien d'orphelin                       */
/* ==================================================================== */
{
  const cles = toutes.map((s) => s.cle);
  dit("toutes les clés sont uniques", new Set(cles).size === cles.length,
    `${cles.length} scènes`);

  const horsListe = toutes.filter((s) => D.DECLENCHEURS.indexOf(s.si) < 0);
  dit("tout déclencheur appartient à la liste fermée", horsListe.length === 0,
    horsListe.length ? horsListe.map((s) => `${s.cle}:${s.si}`).slice(0, 4).join(" ") : "");

  const mauvaiseVie = toutes.filter((s) => D.VIES.indexOf(s.vie || "courante") < 0);
  dit("toute scène déclare une vie connue", mauvaiseVie.length === 0,
    mauvaiseVie.map((s) => s.cle).slice(0, 4).join(" "));

  const mauvaiseVoix = toutes.filter((s) => (s.voix || [])
    .some((v) => !D.CARACTERES.some((c) => c.cle === v)));
  dit("toute voix déclarée est un caractère connu", mauvaiseVoix.length === 0,
    mauvaiseVoix.map((s) => s.cle).slice(0, 4).join(" "));

  /* /!\ LA LEÇON ÉCRITE SIX FOIS AU CARNET : « les demandes portaient un
     nom d'effet que personne n'appliquait ». Une clé hors liste est une
     réplique qui promet et ne fait rien. */
  const effetsFantomes = tousChoix.filter((c) => c.effet && D.EFFETS.indexOf(c.effet) < 0);
  dit("tout effet appartient à la liste fermée", effetsFantomes.length === 0,
    effetsFantomes.map((c) => c.effet).slice(0, 4).join(" "));

  const sujetsFantomes = tousChoix.filter((c) => c.ouvre && !D.SUJETS.some((x) => x.cle === c.ouvre));
  dit("aucun sujet ouvert ne mène dans le vide", sujetsFantomes.length === 0,
    sujetsFantomes.map((c) => c.ouvre).slice(0, 4).join(" "));

  const sansSujet = (S.bureau || []).filter((s) => !s.sujet);
  dit("toute scène du bureau porte son sujet", sansSujet.length === 0,
    sansSujet.map((s) => s.cle).slice(0, 4).join(" "));

  /* Et chaque effet déclaré doit être SERVI par au moins une réplique :
     un effet que personne ne porte est du code que rien n'atteint. */
  const servis = new Set(tousChoix.map((c) => c.effet).filter(Boolean));
  const jamais = D.EFFETS.filter((e) => e !== "rien" && !servis.has(e));
  dit("chaque effet du module est porté par au moins une réplique",
    jamais.length === 0, jamais.length ? "jamais servi : " + jamais.join(",") : `${servis.size} effets servis`);
}

/* ==================================================================== */
/* 4. LA FORME — et aucun chiffre                                        */
/* ==================================================================== */
{
  const courtes = toutes.filter((s) => !s.texte || s.texte.length < 40 || (s.choix || []).length < 2);
  dit("chaque scène a un texte et au moins deux réponses", courtes.length === 0,
    courtes.map((s) => s.cle).slice(0, 4).join(" "));

  const malFaites = tousChoix.filter((c) => !c.lab || !c.r || c.r.length < 30
    || typeof c.d !== "number" || !c.ton);
  dit("chaque réponse a un libellé, une réaction écrite, un effet et un ton",
    malFaites.length === 0, `${malFaites.length} incomplètes`);

  /* /!\ ON NE MONTRE JAMAIS UN CHIFFRE DE COACH. On n'embauche pas
     quelqu'un sur une note, et on ne lui parle pas en pourcentages. */
  const avecChiffre = [];
  for (const s of toutes) {
    if (/\d/.test(s.texte)) avecChiffre.push(s.cle + " (texte)");
    for (const c of (s.choix || [])) {
      if (/\d/.test(c.lab)) avecChiffre.push(s.cle + " (lab)");
      if (/\d/.test(c.r)) avecChiffre.push(s.cle + " (r)");
    }
  }
  dit("aucun chiffre ne s'affiche dans les dialogues", avecChiffre.length === 0,
    avecChiffre.slice(0, 5).join(" · "));

  const doublons = {};
  for (const s of toutes) doublons[s.texte] = (doublons[s.texte] || 0) + 1;
  const repetes = Object.keys(doublons).filter((k) => doublons[k] > 1);
  dit("aucune scène n'est écrite deux fois", repetes.length === 0,
    repetes.slice(0, 2).map((x) => x.slice(0, 50)).join(" | "));
}

/* ==================================================================== */
/* 5. L'ENJEU — un couloir n'est pas un choix                            */
/* ==================================================================== */
{
  const couteuses = tousChoix.filter((c) => (c.d || 0) <= -3);
  dit("on peut vraiment se planter en parlant à son coach",
    couteuses.length >= tousChoix.length * 0.20,
    `${couteuses.length} réponses coûteuses sur ${tousChoix.length} (${Math.round(couteuses.length / Math.max(1, tousChoix.length) * 100)} %)`);

  const sansEnjeu = toutes.filter((s) =>
    !(s.choix || []).some((c) => (c.d || 0) <= -3 || (c.effet && c.effet !== "rien")));
  dit("chaque scène a au moins une réponse qui coûte ou qui engage",
    sansEnjeu.length <= toutes.length * 0.10,
    `${sansEnjeu.length} scènes sans enjeu`);

  /* /!\ AUCUN EFFET DÉMESURÉ : une phrase ne fait pas basculer une
     relation. Le socle la ramènerait de toute façon — mais un +9 donnerait
     au joueur l'illusion inverse. */
  const enormes = tousChoix.filter((c) => Math.abs(c.d || 0) > 6);
  dit("aucune réplique ne fait basculer une relation à elle seule",
    enormes.length === 0, `${enormes.length} démesurées`);

  /* La réplique dit ce qu'elle fait : un effet qui engage de l'argent doit
     s'annoncer. Le jeu ne fait jamais dans le dos du joueur. */
  const muettes = tousChoix.filter((c) =>
    (c.effet === "promettre_argent" || c.effet === "monter_au_bareme")
    && !/pay|salaire|tarif|argent|augment|euro|march|fiche de paie|prime/i.test(c.lab));
  dit("une réplique qui engage de l'argent le dit dans son libellé",
    muettes.length === 0, muettes.map((c) => c.lab).slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* 6. LES VOIX — ils ne parlent pas tous pareil                          */
/* ==================================================================== */
{
  /* /!\ LE DÎNER PORTE UN HOMME, DONC UNE VOIX. Ici cinq ou six hommes se
     partagent le même lot : sans répartition, le joueur entend un seul
     homme parler par cinq bouches — la façon la plus rapide de sentir
     qu'on lit une base de données. */
  const parVoix = {};
  for (const c of D.CARACTERES) parVoix[c.cle] = 0;
  for (const s of toutes) {
    const v = (s.voix && s.voix.length) ? s.voix : D.CARACTERES.map((c) => c.cle);
    for (const k of v) parVoix[k] = (parVoix[k] || 0) + 1;
  }
  const affames = Object.keys(parVoix).filter((k) => parVoix[k] < 30);
  dit("chaque caractère a de quoi parler", affames.length === 0,
    affames.length ? "affamé : " + affames.join(",") : Object.entries(parVoix).map(([k, n]) => k + ":" + n).join(" · "));

  /* Et il doit y avoir de la scène VRAIMENT typée, sinon la voix est un
     champ décoratif. */
  const typees = toutes.filter((s) => s.voix && s.voix.length && s.voix.length <= 3);
  dit("une bonne part des scènes est écrite pour une voix précise",
    typees.length >= toutes.length * 0.35,
    `${typees.length} scènes typées sur ${toutes.length}`);
}

/* ==================================================================== */
/* 7. LA MÉCANIQUE JOUE VRAIMENT CE CONTENU                              */
/* ==================================================================== */
{
  const ctx = { caractere: "pedagogue", entente: 55, semainesMaison: 60, age: 45,
    metier: "formateur", salaire: 100, bareme: 120, cases: 2, phase: "sommet",
    staff: 2, trouACote: false, partage: false, dernier: null };
  /* Chaque sujet doit sortir quelque chose pour un coach ordinaire :
     un sujet muet est un bouton qui ne fait rien. */
  const muets = D.SUJETS.filter((x) =>
    !D.scenePour(S, "bureau", ctx, {}, 0, x.cle, 42));
  dit("aucun sujet du bureau n'est muet pour un coach ordinaire",
    muets.length === 0, muets.map((x) => x.cle).join(","));

  /* Et chaque moment qui vient à toi doit sortir quelque chose. */
  const momentsMuets = D.MOMENTS.filter((m) => m !== "bureau"
    && !D.scenePour(S, m, ctx, {}, 0, null, 7));
  dit("chaque moment a de quoi se déclencher", momentsMuets.length === 0,
    momentsMuets.join(","));

  /* Un échange complet, sans exception. */
  const E = D.ouvrir(S, ctx, {}, 0, 12345);
  let garde = 0, joue = 0;
  for (const x of D.SUJETS) {
    D.poser(E, "bureau", x.cle);
    while (E.encours && garde++ < 40) { D.repondre(E, 0); joue++; }
  }
  dit("on peut traverser tous les sujets sans que rien casse",
    joue >= D.SUJETS.length && garde < 40, `${joue} répliques jouées`);
  dit("et tout ce qui a été dit est gardé — il s'en souviendra",
    E.dits.length === joue && E.dits.every((d) => d.lab && d.ton));

  /* /!\ AUCUN TIRAGE : deux ouvertures du même bureau le même jour
     donnent la même scène. Sinon on rouvre jusqu'à tomber sur la bonne,
     et le choix ne coûte plus rien. */
  const a = D.scenePour(S, "bureau", ctx, {}, 0, "ou_il_en_est", 99);
  const b = D.scenePour(S, "bureau", ctx, {}, 0, "ou_il_en_est", 99);
  dit("même coach, même jour : la même scène — aucun tirage",
    a && b && a.cle === b.cle);
  const c2 = D.scenePour(S, "bureau", ctx, {}, 0, "ou_il_en_est", 100000);
  dit("mais un autre jour est une autre scène", !a || !c2 || a.cle !== c2.cle,
    "sinon le contenu ne servirait qu'une fois");
}

/* ==================================================================== */
console.log(echecs
  ? `\n${echecs} ECHEC(S)`
  : "\nCONFORME — il a de quoi parler, il ne se répète pas, et rien n'est décoratif.");
process.exit(echecs ? 1 : 0);
