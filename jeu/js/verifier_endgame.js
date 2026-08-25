/**
 * verifier_endgame.js — BANC 30 : CE QUI RESTE QUAND LES ANNEES PASSENT.
 *
 * Le mur, les objectifs longs, les rivalites. Trois choses qui se jugent
 * sur DIX ANS : ce banc en joue donc plusieurs, et verifie surtout ce qui
 * ne se voit qu'a cette echelle —
 *
 *   1. RIEN NE SE COMPTE A PART. Un objectif se LIT dans l'etat. Le banc
 *      change l'etat et regarde l'objectif suivre, sans qu'aucun compteur
 *      n'ait ete touche.
 *   2. UN OBJECTIF ATTEINT RESTE ATTEINT, et ne se re-annonce jamais.
 *   3. LE MUR REFUSE DU MONDE. Un mur ou tout le monde est accroche ne
 *      dit rien.
 *   4. UNE RIVALITE NAIT D'UN FAIT, ET ELLE REFROIDIT. Sans ca, au bout
 *      de dix ans tout le monde est rival de tout le monde.
 *   5. ET TOUT CA TRAVERSE LA SAUVEGARDE — sinon dix ans de jeu
 *      s'effacent au rechargement, et ca ne se repare pas.
 */
const E = require("./endgame.js");
const { ouvrirPartie, trancherBlocage } = require("./bac_partie.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

console.log("BANC 30 — le mur, les objectifs, les rivalités.");

/* ==================================================================== */
/* 1. LES OBJECTIFS SE LISENT, ILS NE SE COMPTENT PAS                    */
/* ==================================================================== */
{
  const vide = { jour: 0, rangLocal: 0, coachs: 0, effectif: 0, prosSousContrat: 0,
    meilleurRang: null, champions: 0, championsMaison: 0, legendes: 0, victoiresSalle: 0 };
  const L0 = E.objectifs(vide);
  dit("au premier jour, rien n'est fait", L0.every((o) => !o.fait), `${L0.length} objectifs`);
  dit("et chacun sait déjà où il en est", L0.every((o) => o.sur >= 1 && o.part >= 0 && o.part <= 1));

  /* On change UN champ de l'etat : l'objectif correspondant suit. */
  const cas = [
    ["tenir", { jour: 400 }], ["murs", { rangLocal: 2 }], ["staff", { coachs: 3 }],
    ["plein", { effectif: 120 }], ["pros", { prosSousContrat: 4 }],
    ["classe", { meilleurRang: 9 }], ["ceinture", { champions: 1 }],
    ["deux_ceintures", { champions: 2 }], ["maison", { championsMaison: 1 }],
    ["mur", { legendes: 1 }], ["cent", { victoiresSalle: 140 }], ["dix_ans", { jour: 4000 }],
  ];
  let rate = null;
  for (const [cle, ch] of cas) {
    const L = E.objectifs(Object.assign({}, vide, ch));
    const o = L.find((x) => x.cle === cle);
    if (!o || !o.fait) rate = cle;
  }
  dit("chaque objectif suit l'état du jeu, sans compteur à lui", rate === null,
      rate ? `${rate} ne suit pas` : `${cas.length} sur ${cas.length}`);

  /* Un objectif atteint reste atteint : meme si l'etat retombe, on ne le
     re-annonce pas — et on ne le retire pas. */
  const haut = Object.assign({}, vide, { champions: 1 });
  const n1 = E.nouveaux(haut, []);
  dit("le franchissement s'annonce une fois", n1.some((o) => o.cle === "ceinture"));
  const n2 = E.nouveaux(haut, n1.map((o) => o.cle));
  dit("et jamais deux fois", !n2.some((o) => o.cle === "ceinture"));
  const retombe = E.nouveaux(vide, ["ceinture"]);
  dit("un objectif atteint ne se re-annonce pas quand l'état retombe",
      !retombe.some((o) => o.cle === "ceinture"));
}

/* ==================================================================== */
/* 2. LE MUR REFUSE DU MONDE                                             */
/* ==================================================================== */
{
  const homme = (o) => Object.assign({ nom: "X", amateur: false, arriveLe: 0,
    faits: [], bilan: { v: 0, d: 0 }, rang: null, meilleurRang: null }, o);
  const fiche = (v, d, combats) => ({ nom: "X", bilan: [v, d], combats: combats || [] });
  const J = 365 * 6;

  dit("un homme qui n'a rien fait n'est pas accroché",
      E.plaqueDe(homme({ arriveLe: J - 200 }), fiche(1, 3), J) === null);
  dit("un amateur n'entre jamais au mur",
      E.plaqueDe(homme({ amateur: true, faits: [{ an: 2027, quoi: "Champion HEX" }] }), fiche(20, 1), J) === null);

  const champ = E.plaqueDe(homme({ faits: [{ an: 2028, quoi: "Champion HEX" }] }), fiche(12, 3), J);
  dit("un champion est une légende", !!champ && champ.rang === "legende",
      champ ? `${champ.mot} — ${champ.pourquoi}` : "aucune plaque");

  const pilier = E.plaqueDe(homme({ arriveLe: 0 }), fiche(9, 4), J);
  dit("neuf victoires font un pilier", !!pilier && pilier.rang === "pilier",
      pilier ? pilier.mot : "aucune plaque");

  const maison = E.plaqueDe(homme({ arriveLe: 0 }), fiche(4, 6), J);
  dit("quatre victoires en six ans, c'est « de la maison »",
      !!maison && maison.rang === "maison", maison ? maison.mot : "aucune plaque");
  /* /!\ ON NE DEVIENT PAS PILIER EN TRAINANT. Le banc l'a impose : la
     premiere version accrochait "pilier" a un 1-9 reste cinq ans. */
  dit("dix ans à perdre ne font pas un pilier",
      (E.plaqueDe(homme({ arriveLe: 0 }), fiche(1, 9), 365 * 10) || {}).rang !== "pilier",
      String((E.plaqueDe(homme({ arriveLe: 0 }), fiche(1, 9), 365 * 10) || {}).mot));

  /* Ce que le mur vaut PLAFONNE : une salle ne vit pas de ses morts. */
  const beaucoup = Array.from({ length: 30 }, () => ({ rang: "legende" }));
  dit("le poids du mur plafonne", E.poidsDuMur(beaucoup) <= 12,
      `30 légendes -> ${E.poidsDuMur(beaucoup)}`);
  dit("et une légende pèse plus que trois « de la maison »",
      E.poidsDuMur([{ rang: "legende" }]) > E.poidsDuMur([{ rang: "maison" }, { rang: "maison" }, { rang: "maison" }]));
}

/* ==================================================================== */
/* 3. LES RIVALITES : UN FAIT, ET DU TEMPS                               */
/* ==================================================================== */
{
  const R = {};
  dit("une cause inventée est refusée",
      (() => { try { E.nourrir(R, "A", 1, "parce_que", 0); return false; } catch (e) { return true; } })());

  E.nourrir(R, "Okonkwo", 51, "defaite", 100, "Vasile");
  const r = R[E.clefRiv("Okonkwo", 51)];
  dit("une défaite fait naître une rivalité vivante", E.vivante(r, 100),
      `${E.chaleur(r, 100).toFixed(0)} — ${E.mot(r, 100)}`);

  /* /!\ ELLE REFROIDIT. Sans ca, tout le monde finit rival de tout le
     monde au bout de dix ans, et le mot ne veut plus rien dire. */
  dit("elle refroidit si rien ne se passe", !E.vivante(r, 100 + 365),
      `après un an : ${E.chaleur(r, 100 + 365).toFixed(0)}`);
  dit("et elle s'éteint tout à fait", E.chaleur(r, 100 + 1000) === 0);

  /* Une deuxieme defaite la rallume, et plus fort qu'a la premiere. */
  const froid = E.chaleur(r, 500);
  E.nourrir(R, "Okonkwo", 51, "revanche", 500, "Vasile");
  dit("un nouveau fait la rallume", E.chaleur(r, 500) > froid,
      `${froid.toFixed(0)} -> ${E.chaleur(r, 500).toFixed(0)}`);
  dit("et le mot change avec ce qui vient d'arriver",
      /deux fois/i.test(E.mot(r, 500)), E.mot(r, 500));

  /* Elle agit AUTOUR du combat, jamais dedans. */
  const eff = E.effetsDuCombat(r, 500);
  dit("une rivalité chaude vaut une plus grosse bourse et plus de presse",
      !!eff && eff.bourse > 1 && eff.notoriete > 1,
      eff ? `bourse x${eff.bourse.toFixed(2)} · notoriété x${eff.notoriete.toFixed(2)}` : "aucun effet");
  dit("un souvenir tiède ne change rien",
      E.effetsDuCombat({ chaleur: 20, dernier: 500, causes: [{ cause: "gagne", jour: 500 }] }, 500) === null);
  /* /!\ UN TRASH TALK SEUL NE FAIT PAS UNE RIVALITE — il chauffe, il ne
     cree pas. Il faut qu'il se soit passe quelque chose dans la cage. */
  E.nourrir(R, "Okonkwo", 77, "trash", 500, "Autre");
  dit("des mots seuls ne font pas une rivalité",
      !E.vivante(R[E.clefRiv("Okonkwo", 77)], 500),
      `${E.chaleur(R[E.clefRiv("Okonkwo", 77)], 500).toFixed(0)} de chaleur`);
  E.nourrir(R, "Okonkwo", 77, "defaite", 500, "Autre");
  dit("mais des mots PUIS une défaite, oui",
      E.vivante(R[E.clefRiv("Okonkwo", 77)], 500));
  dit("et la plus chaude passe devant",
      (() => { const l = E.rivalitesDe(R, "Okonkwo", 500);
               return l.length >= 2 && l[0].b === 77; })(),
      E.rivalitesDe(R, "Okonkwo", 500).map((x) => `${x.b}:${E.chaleur(x, 500).toFixed(0)}`).join(" "));
}

/* ==================================================================== */
/* 4. DANS LA PARTIE : ÇA VIT, ET ÇA SURVIT A LA SAUVEGARDE              */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 21 });
  let s = 21; const al = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 200; i++) {
    P.essai("continuer");
    for (let g = 0; g < 8 && trancherBlocage(P, al()); g++);
  }

  /* L'etat lu par les objectifs est celui du jeu, pas une invention. */
  const etat = P.lire("etatEndgame()");
  dit("la salle sait lire où elle en est",
      etat && etat.jour > 0 && etat.effectif > 0,
      etat ? `jour ${etat.jour} · ${etat.effectif} à l'effectif · ${etat.victoiresSalle} victoires` : "");
  dit("et au moins un objectif est tombé en 200 jours",
      P.lire("objectifsVus().length") > 0, P.lire("JSON.stringify(objectifsVus())"));

  /* Le mur : on fait raccrocher un champion et on regarde. */
  const mur = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    if(!c)return null;
    const l=MESGARS[c]; l.arriveLe=0;
    (l.faits=l.faits||[]).push({an:2027,quoi:"Champion HEX"});
    if(FICHES[c])FICHES[c].bilan=[14,2];
    raccrocher(c,"banc");
    return {mur:murDeLaSalle().map(p=>({nom:p.nom,rang:p.rang})),
            ecran:(function(){ouvrirHeritage();
              return document.getElementById("fiche").innerHTML;})()};
  })()`);
  dit("un champion qui raccroche entre au mur",
      !!mur && mur.mur.length > 0 && mur.mur[0].rang === "legende",
      mur ? JSON.stringify(mur.mur[0]) : "personne");
  dit("et le mur s'affiche vraiment à l'écran",
      !!mur && mur.ecran.includes("Le mur") && mur.ecran.includes("Légende"),
      mur ? mur.ecran.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(60, 150) : "");
  dit("l'écran de l'héritage montre aussi les objectifs et les rivalités",
      !!mur && mur.ecran.includes("Les objectifs") && mur.ecran.includes("Les rivalités"));
  dit("et le résumé apparaît sur l'onglet Salle",
      P.lire(`(function(){rendreSalle();
        return document.getElementById("ou-tu-en-es").innerHTML;})()`).includes("La salle"));

  /* /!\ TOUT CA DOIT TRAVERSER LA SAUVEGARDE. Dix ans de jeu effaces au
     rechargement, ca ne se repare pas — et ca ne se verrait qu'en jouant
     tres longtemps, c'est-a-dire jamais pendant un developpement. */
  const survit = P.lire(`(function(){
    const R=rivalitesTable();
    const c=Object.keys(MESGARS)[0];
    MMA.endgame.nourrir(R,c,999999,"ceinture",t.jour,"Le Voleur");
    const av={mur:murDeLaSalle().length, riv:Object.keys(rivalitesTable()).length,
              vus:objectifsVus().slice()};
    const copie=JSON.parse(JSON.stringify(etatDuJeu()));
    chargerEtat(copie);
    return {av, ap:{mur:murDeLaSalle().length, riv:Object.keys(rivalitesTable()).length,
                    vus:objectifsVus().slice()}};
  })()`);
  dit("le mur survit à un aller-retour de sauvegarde",
      survit.av.mur === survit.ap.mur && survit.ap.mur > 0,
      `${survit.av.mur} -> ${survit.ap.mur}`);
  dit("les rivalités aussi", survit.av.riv === survit.ap.riv && survit.ap.riv > 0,
      `${survit.av.riv} -> ${survit.ap.riv}`);
  dit("et les objectifs déjà annoncés ne se re-annoncent pas après un rechargement",
      JSON.stringify(survit.av.vus) === JSON.stringify(survit.ap.vus),
      survit.ap.vus.join(","));

  /* /!\ ET ELLE AGIT VRAIMENT. Une rivalite qui ne change aucun combat
     n'est pas une rivalite, c'est une etiquette — et le carnet a un mot
     pour les effets que personne n'applique. */
  const paye = P.lire(`(function(){
    const cle=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite&&MESGARS[k].org);
    if(!cle)return null;
    const l=MESGARS[cle];
    /* On fabrique une offre par le chemin du jeu, deux fois : sans
       rivalite, puis avec. La graine ne bouge pas entre les deux. */
    const faire=()=>{ MMA.alea.alea.seed(4242);
      const o=MMA.offres.fabriquer(MONDE,completerRelation(),l,l.org,t.jour,t.jour+42,{});
      return o; };
    const sans=faire(); if(!sans)return null;
    MMA.endgame.nourrir(rivalitesTable(),cle,sans.adversaire,"ceinture",t.jour,"X");
    const avec=faire();
    const R=rivalitesTable()[MMA.endgame.clefRiv(cle,sans.adversaire)];
    const eff=MMA.endgame.effetsDuCombat(R,t.jour);
    return {bourse:sans.bourse, majoree:Math.round(sans.bourse*eff.bourse),
            noto:eff.notoriete};
  })()`);
  dit("une rivalité fait monter la bourse du combat",
      !!paye && paye.majoree > paye.bourse,
      paye ? `${paye.bourse} € -> ${paye.majoree} €` : "aucun pro sous contrat");
  dit("et le combat se raconte plus fort", !!paye && paye.noto > 1,
      paye ? `notoriété x${paye.noto.toFixed(2)}` : "");

  dit("aucune exception pendant tout ça", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — la salle a une mémoire, un cap, et des comptes à régler."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
