/**
 * verifier_partie.js — BANC 27 : LE SINGE, RENDU PERMANENT.
 *
 * Le singe du cas 31 avait tourne UNE fois, dans une conversation, puis
 * disparu. Tous les defauts « ca ne leve pas, ca ne fait simplement RIEN »
 * sont revenus ensuite — parce qu'aucun banc ne chargeait demo_jeu.html.
 * Ce banc le charge (bac_partie.js) et JOUE : il avance les jours, tranche
 * les blocages, appuie sur les ecrans, et verifie apres coup que la partie
 * tient debout.
 *
 * CE QU'IL SAIT VOIR
 *   1. ce qui LEVE (toute exception est comptee, jamais fatale) ;
 *   2. ce qui NE FAIT RIEN (une action dont plus rien ne bouge) ;
 *   3. ce qui DIVERGE entre deux vues de la meme donnee (la 2e lecon) ;
 *   4. la coherence de la partie a l'arrivee (ids, cartes, fiches).
 *
 * CE QU'IL NE SAIT PAS VOIR : les pixels. Une couleur fausse, un
 * debordement, un bouton illisible — ca reste le terrain de Mael.
 */
const { ouvrirPartie } = require("./bac_partie.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ==================================================================== */
/* LA MAIN DU SINGE — trancher tout ce qui bloque, appuyer sur tout.     */
/* ==================================================================== */

/** Resout le blocage courant, quelle que soit sa forme. Rend ce qu'il a
 *  fait, ou null s'il n'y avait rien a trancher. */
function trancherBlocage(P, tirage) {
  const b = P.lire("bloque");
  if (!b) return null;
  /* Le soir du combat : on le simule. C'est la sortie de secours du jeu
     (cas 22), donc un chemin de production, pas une bequille de banc. */
  if (b.id === "combat") { P.essai("simulerCombat"); return "combat"; }
  if (b.id === "visite") { P.essai("repondreVisite", tirage < 0.75); return "visite"; }
  if (Array.isArray(b.choix) && b.choix.length) {
    P.essai("choisirBloque", Math.floor(tirage * b.choix.length));
    return "choix:" + b.id;
  }
  if (b.action) { P.essai("agirBloque"); return "action:" + b.id; }
  P.essai("trancher", tirage < 0.7);
  return "oui_non:" + b.id;
}

/** Un jour de jeu, singe compris. */
function unJour(P, al) {
  P.essai("continuer");
  /* Un blocage peut en cacher un autre (contrat echu -> combat -> ...). */
  for (let g = 0; g < 8 && P.lire("bloque"); g++) if (!trancherBlocage(P, al())) break;

  /* Les offres de combat expirent : ne pas repondre, c'est refuser sans
     le savoir. Le singe repond. */
  const offres = P.lire("OFFRES.map(o=>o.cle)");
  for (const cle of offres) P.essai("repondreOffre", cle, al() < 0.8);

  /* Ce qu'ils viennent demander. */
  const demandeurs = P.lire('Object.entries(MESGARS).filter(([,l])=>l.demandeEnCours).map(([c])=>c)');
  for (const cle of demandeurs) {
    const d = P.lire(`(MESGARS[${JSON.stringify(cle)}].demandeEnCours)`);
    P.essai("ouvrirDemande", cle);
    const r = al();
    /* /!\ LE SINGE N'APPUIE QUE SUR LES BOUTONS QUI EXISTENT. Premiere
       version : il proposait un marche sur TOUTE demande — y compris
       celles que l'ecran declare non negociables ("Ça ne se marchande
       pas"), et demandes.js jette, a juste titre. Un singe qui invente
       des boutons ne mesure plus le jeu, il mesure son invention. */
    const marchandable = P.lire(`!!(MMA.demandes.DEMANDES[${JSON.stringify(d)}]||{}).oui_mais`);
    const rep = r < 0.4 ? "oui" : r < 0.8 ? "non" : (marchandable ? "oui_mais" : "oui");
    P.essai("repondreDemande", cle, d, rep, 2);
  }

  /* La renegociation d'un contrat d'organisation epuise. */
  const renego = P.lire('Object.entries(MESGARS).filter(([,l])=>l.renego).map(([c])=>c)');
  for (const cle of renego) P.essai(al() < 0.7 ? "renouvelerContrat" : "partirLibre", cle);

  /* Le contrat de salle : signer ce qui attend une signature. C'EST LE
     CHANTIER DU MARQUAGE — le banc passe par la MEME lecture que l'ecran. */
  for (const cle of P.lire("contratsAmarquer()")) {
    if (al() < 0.75) P.essai("signerSalle", cle, 0.2, 3);
  }

  /* Les amateurs prets passent pro, et on demarche pour les pros libres. */
  if (al() < 0.25) {
    const am = P.lire('EFFECTIF.filter(f=>f.gr==="amateur").map(f=>f.id)');
    if (am.length) P.essai("passerPro", am[Math.floor(al() * am.length)]);
  }
  if (al() < 0.3) {
    const libres = P.lire('Object.entries(MESGARS).filter(([,l])=>!l.amateur&&!l.retraite&&!l.org).map(([c])=>c)');
    const orgs = P.lire("Object.keys(MONDE.orgas||{})");
    if (libres.length && orgs.length)
      P.essai("demarcherOrga", libres[Math.floor(al() * libres.length)],
              orgs[Math.floor(al() * orgs.length)]);
  }

  /* Les sept onglets, et les ecrans qu'on ouvre en jouant. */
  const onglets = ["salle", "effectif", "combats", "monde", "staff", "gestion", "media"];
  P.essai("allerOnglet", onglets[Math.floor(al() * onglets.length)]);
  const tous = P.lire("EFFECTIF.map(f=>f.id)");
  if (tous.length) {
    const id = tous[Math.floor(al() * tous.length)];
    P.essai("ouvrirFiche", id);
    if (al() < 0.4) P.essai("ouvrirContrat", id);
    if (al() < 0.3) P.essai("ouvrirDialogue", id);
    if (al() < 0.3) P.essai("ouvrirCamp", id);
    if (al() < 0.2) P.essai("ouvrirFeuille", id);
    P.essai("fermerFiche");
  }
  if (al() < 0.1) P.essai("diagnostic");
  if (al() < 0.1) P.essai("publier");
}

/** Une saison entiere. */
function jouer(P, jours, graine) {
  let s = graine >>> 0 || 1;
  const al = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let garde = 0;
  const depart = P.lire("t.jour");
  while (P.lire("t.jour") - depart < jours && garde++ < jours * 12) unJour(P, al);
  return P.lire("t.jour") - depart;
}

/* ==================================================================== */
/* LES INVARIANTS DE COHERENCE (ce que le singe du cas 31 verifiait)     */
/* ==================================================================== */
function coherence(P) {
  const pb = [];
  const ids = P.lire("EFFECTIF.map(f=>f.id)");
  if (new Set(ids).size !== ids.length) pb.push("un id en double dans l'effectif");
  const sansFiche = P.lire("EFFECTIF.filter(f=>!FICHES[f.id]).map(f=>f.id)");
  if (sansFiche.length) pb.push(`homme sans fiche : ${sansFiche.join(", ")}`);
  const attente = P.lire("RESULTATS.filter(r=>r.enAttente).length");
  if (attente) pb.push(`${attente} carte(s) restée(s) en attente`);
  const orphelins = P.lire('Object.entries(MESGARS).filter(([,l])=>l.combatPrevu&&l.combatPrevu.jourCombat<t.jour-2).length');
  if (orphelins) pb.push(`${orphelins} combat(s) orphelin(s)`);
  const retraitesActifs = P.lire('EFFECTIF.filter(f=>MESGARS[f.id]&&MESGARS[f.id].retraite).length');
  if (retraitesActifs) pb.push(`${retraitesActifs} retraité(s) encore à l'effectif`);
  return pb;
}

/* ==================================================================== */
/* LE BANC                                                              */
/* ==================================================================== */
console.log("BANC 27 — la partie tourne, le singe appuie sur tout.");

for (const [graine, jours] of [[11, 150], [41, 150], [7, 260]]) {
  const P = ouvrirPartie({ mode: "neuf", graine });
  const avances = jouer(P, jours, graine);

  dit(`graine ${graine} : aucune exception sur ${jours} jours joués`,
      P.erreurs.length === 0,
      P.erreurs.length ? `${P.erreurs.length} — ` + [...new Set(P.erreurs)].slice(0, 4).join(" | ") : `${avances} jours`);

  /* /!\ LE JEU AVANCE VRAIMENT. Un blocage jamais tranche fige la partie
     sans lever : c'est exactement la classe de defaut que ce banc existe
     pour attraper (cas 22, cas 30). */
  dit(`graine ${graine} : le calendrier avance`, avances >= jours,
      `${avances} jours pour ${jours} demandés`);

  const pb = coherence(P);
  dit(`graine ${graine} : la partie reste cohérente`, pb.length === 0, pb.join(" | "));

  /* La salle vit : sur 150 jours au moins un homme rejoint et au moins
     un combat se joue. Sinon la boucle du jeu est cassee quelque part —
     et personne ne le verrait. */
  const effectif = P.lire("EFFECTIF.length");
  dit(`graine ${graine} : la salle se remplit`, effectif > 0, `${effectif} à l'effectif`);
  /* /!\ COMPTER LES VRAIS COMBATS, PAS LES CARTES PRO. Premiere version
     du banc : `RESULTATS.length > 0` — toujours zero, et pour une bonne
     raison : RESULTATS ne porte que les combats PRO du joueur. En partie
     neuve la salle vit d'abord de galas amateurs, qui n'y entrent pas.
     Le banc criait au feu sur un jeu qui marchait. On compte ce qui s'est
     reellement passe : les bilans de mes hommes. */
  const combats = P.lire("EFFECTIF.reduce((a,f)=>a+((FICHES[f.id]&&FICHES[f.id].bilan)?FICHES[f.id].bilan[0]+FICHES[f.id].bilan[1]:0),0)");
  dit(`graine ${graine} : mes hommes combattent`, combats > 0, `${combats} combat(s) au compteur`);
}

/* ==================================================================== */
/* LE MARQUAGE DES CONTRATS — chantier de reprise                       */
/* ==================================================================== */
{
  /* /!\ SUR LA PARTIE DEMO, ET C'EST VOULU : la partie neuve part d'une
     salle vide, et un pro n'y apparait qu'apres des mois de gestion — un
     banc qui en depend mesurerait l'economie de lancement, pas le
     marquage. La demo a ses pros des le premier jour : c'est le terrain
     juste pour verifier ce qui s'affiche sur un contrat de salle. */
  const P = ouvrirPartie({ mode: "demo", graine: 3 });
  jouer(P, 40, 3);

  /* 1. La lecture est celle de contrats.js, pas une deuxieme source. */
  const accord = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite
      &&FICHES[k]&&FICHES[k].gr==="pro");
    if(!c)return null;
    const l=MESGARS[c];
    MMA.contrats.signerSalle(l,0.2,3,t.jour);
    const a=marqueContrat(c);
    l.contratSalle.restants=1; const b=marqueContrat(c);
    l.contratSalle.restants=0; const d=marqueContrat(c);
    delete l.contratSalle;      const e=marqueContrat(c);
    return {a:a&&a.mot,b:b&&b.mot,d:d&&d.mot,e:e&&e.mot,
            urgents:[a.urgent,b.urgent,d.urgent,e.urgent]};
  })()`);
  dit("le marquage nomme les quatre états du contrat de salle",
      !!accord && accord.a === "3 combats" && accord.b === "dernier combat"
      && accord.d === "contrat échu" && accord.e === "sans contrat",
      accord ? [accord.a, accord.b, accord.d, accord.e].join(" · ") : "aucun pro à la salle");
  dit("seuls les trois états qui demandent une décision sont urgents",
      !!accord && JSON.stringify(accord.urgents) === JSON.stringify([false, true, true, true]),
      accord ? JSON.stringify(accord.urgents) : "");

  /* 2. IL SE VOIT A L'ECRAN. La lecon du carnet : une chose branchee
     nulle part ne fait rien. On le pose, on rend, on relit l'ecran. */
  const vu = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite
      &&FICHES[k]&&FICHES[k].gr==="pro");
    if(!c)return null;
    MMA.contrats.signerSalle(MESGARS[c],0.2,3,t.jour);
    MESGARS[c].contratSalle.restants=0;
    filtreGr="tous"; rendreEffectif();
    const liste=document.getElementById("liste-effectif").innerHTML;
    const puces=document.getElementById("f-groupes").innerHTML;
    ouvrirFiche(c);
    const fiche=document.getElementById("fiche").innerHTML;
    return {liste:liste.includes("contrat échu"),
            puce:puces.includes("Contrats"),
            fiche:fiche.includes("Contrat de salle — contrat échu"),
            filtre:(function(){filtreGr="contrat";rendreEffectif();
              return document.getElementById("liste-effectif").innerHTML.includes(c);})()};
  })()`);
  dit("le contrat échu se voit dans la liste de l'effectif", !!vu && vu.liste);
  dit("le contrat échu se voit sur la fiche de l'homme", !!vu && vu.fiche);
  dit("la puce « Contrats » apparaît quand il y a une signature en attente", !!vu && vu.puce);
  dit("le filtre « Contrats » ne montre que ceux qui attendent", !!vu && vu.filtre);

  /* 3. Le filtre se referme tout seul : un filtre vide serait un piege. */
  const refermé = P.lire(`(function(){
    /* Tout le monde sous contrat sain — y compris ceux qui n'en avaient
       aucun : "sans contrat" est un etat urgent, il compte. */
    for(const k of Object.keys(MESGARS))
      MMA.contrats.signerSalle(MESGARS[k],0.2,3,t.jour);
    filtreGr="contrat"; rendreEffectif(); return filtreGr;
  })()`);
  dit("le filtre « Contrats » se referme quand il n'y a plus rien à signer",
      refermé === "tous", String(refermé));

  dit("aucune exception pendant les vérifications du marquage", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — la partie se joue, et ce qui doit se voir se voit."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
