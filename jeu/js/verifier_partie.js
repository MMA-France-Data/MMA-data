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
const { ouvrirPartie, trancherBlocage, coffreMemoire } = require("./bac_partie.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ==================================================================== */
/* LA MAIN DU SINGE — trancher tout ce qui bloque, appuyer sur tout.     */
/* ==================================================================== */

/** Un jour de jeu, singe compris. */
function unJour(P, al) {
  P.essai("continuer");
  /* Un blocage peut en cacher un autre (contrat echu -> combat -> ...). */
  for (let g = 0; g < 8 && P.lire("bloque"); g++) {
    const fait = trancherBlocage(P, al());
    /* /!\ UN VERROU DOIT TOUJOURS AVOIR UNE CLEF (cas 22). Un blocage
       qu'aucune sortie ne traite fige la journee SANS LEVER : on le
       compte comme une erreur, sinon le banc tournerait en rond en
       silence et dirait que tout va bien. */
    if (!fait) break;
    if (String(fait).startsWith("SANS_ISSUE")) { P.erreurs.push("blocage sans issue : " + fait); break; }
  }

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
    /* /!\ MONDE.orgas N'EXISTE PAS. Le singe "demarchait" depuis le
       premier jour — sur une liste TOUJOURS VIDE. Resultat : en 900 jours
       de mesure, zero homme signe en organisation, zero combat pro, zero
       classement, zero interview. TOUT LE METIER DU JEU passait a cote du
       banc, et le banc disait que tout allait bien. C'est la lecon du
       carnet retournee contre le banc lui-meme : une boucle branchee
       nulle part ne fait rien, ET NE LEVE PAS. Les organisations vivent
       dans classement.ORGS, comme demarcherOrga les lit lui-meme. */
    const orgs = P.lire("Object.keys(MMA.classement.ORGS)");
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
  /* /!\ UNE CARTE D'AUJOURD'HUI PEUT ATTENDRE : le blocage du soir tient
     jusqu'a l'encaissement (cas 20), et une course qui s'arrete PILE un
     soir de combat finit legitimement dessus — l'appel de derniere minute
     a rendu ce cas frequent en fin de banc. L'orphelin, c'est la carte
     d'HIER encore en attente : le jeu est passe au-dela. */
  const attente = P.lire(`JSON.stringify(RESULTATS.filter(r=>r.enAttente&&r.quand<t.jour)
    .map(r=>({q:r.quand,g:r.graine,a:String(r.affiche).replace(/<[^>]+>/g,"").slice(0,30)})))`);
  if (attente !== "[]") pb.push(`cartes passées en attente ${attente} (jour ${P.lire("t.jour")})`);
  const orphelins = P.lire(`JSON.stringify(Object.entries(MESGARS)
    .filter(([,l])=>l.combatPrevu&&l.combatPrevu.jourCombat<t.jour-2)
    .map(([c,l])=>({c,jc:l.combatPrevu.jourCombat,org:l.combatPrevu.org,rempl:!!l.combatPrevu.remplacement})))`);
  if (orphelins !== "[]") pb.push(`combats orphelins ${orphelins}`);
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

/* ==================================================================== */
/* LE DIRECT DU JEU : le ressenti arrive-t-il VRAIMENT au coin ?         */
/* /!\ CE BLOC EXISTE A CAUSE D'UN VRAI DEFAUT. ressenti.js etait ecrit, */
/* teste (banc 28), branche dans demo_jeu.html... et MMA.ressenti        */
/* n'existait pas : la facade du bundler est une liste ECRITE A LA MAIN. */
/* En jeu, ca ne levait pas — le try/catch avalait, et le coin restait   */
/* muet. Le banc 28 ne pouvait pas le voir : il teste le module et       */
/* l'ecran, pas le chemin du JEU. Celui-ci le voit.                      */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 9 });
  const r = P.lire(`(function(){
    /* On monte un combat par le chemin du jeu, et on joue une tranche
       jusqu'a la cloche — exactement ce que fait l'ecran en direct. */
    const r=preparerCombat("Okonkwo","Renaud",3,11);
    let tr=null, garde=0;
    while(garde++<400){ tr=jouerTrancheDirect(r,null); r.dernierTr=tr;
      if(!tr||tr.finRound)break; }
    const d=donneesEcran(r);
    return {fin:!!(tr&&tr.finRound), ressenti:tr&&tr.ressenti?
      {etat:tr.ressenti.etat,dit:tr.ressenti.dit,signes:tr.ressenti.signes.length}:null,
      dansEcran:!!d.ressenti, crisMax:d.crisMax};
  })()`);
  dit("un round joué en direct s'arrête bien à la cloche", !!(r && r.fin));
  dit("et il en sort ce que le combattant a à dire", !!(r && r.ressenti),
      r && r.ressenti ? `[${r.ressenti.etat}] « ${r.ressenti.dit} »` : "RIEN — MMA.ressenti manque ?");
  dit("l'écran le reçoit dans ses données", !!(r && r.dansEcran));
  dit("le budget de cris part du module, pas d'un 3 écrit en dur",
      !!(r && r.crisMax >= 3), r ? `crisMax ${r.crisMax}` : "");
  dit("aucune exception sur le chemin du direct", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LES DEMANDES DU STAFF SORTENT VRAIMENT EN JOUANT                      */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 13 });
  jouer(P, 210, 13);
  const vues = P.lire(`(function(){
    return staffDe().filter(c=>!c.moi).map(c=>({
      nom:c.nom, demandes:(c.refusees||[]).length+(c.demandeEnCours?1:0),
      dernier:c.dernierDemande===undefined?null:c.dernierDemande}));})()`);
  const total = vues.reduce((a, c) => a + c.demandes, 0);
  dit("sur une saison, le staff vient te demander des choses", total > 0,
      vues.map((c) => `${c.nom}:${c.demandes}`).join(" · "));
  dit("aucune exception pendant la saison du staff", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LE METIER EXISTE-T-IL ? (signature d'organisation -> combats pro)      */
/* /!\ CE BLOC NAIT D'UN TROU DE BANC, PAS D'UN BUG DU JEU. Le singe      */
/* "demarchait" depuis toujours sur une liste vide (MONDE.orgas n'existe  */
/* pas) : zero signature, zero combat pro, zero classement, zero          */
/* interview — et le banc etait vert. Tout le metier du jeu passait a     */
/* cote. On l'exige maintenant, et on le CHIFFRE.                         */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "neuf", graine: 7 });
  jouer(P, 300, 7);
  /* /!\ LE CHEMIN, PAS LA CHANCE (26/08) : ce bloc comptait sur le
     hasard du singe pour qu'une signature tombe en 300 jours — et CHAQUE
     nouvelle mecanique decale le flux d'alea et le cassait. Si le singe
     n'a signe personne, le banc demarche LUI-MEME : ce qu'on tient ici,
     c'est que la porte S'OUVRE, pas que le singe a eu de la chance. */
  P.lire(`(function(){let garde=0;
    while(!Object.values(MESGARS).some(l=>!l.amateur&&!l.retraite&&l.org)&&garde++<60){
      for(const [c,l] of Object.entries(MESGARS)){
        if(l.amateur||l.retraite||l.org)continue;
        if(!MMA.contrats.contratSalle(l))MMA.contrats.signerSalle(l,0.2,3,t.jour);
        l.demarchages=[];
        for(const o of Object.keys(MMA.classement.ORGS)){demarcherOrga(c,o);if(l.org)break;}
      }}
    return true;})()`);
  const org = P.lire('Object.entries(MESGARS).filter(([,l])=>!l.amateur&&!l.retraite&&l.org).map(([c,l])=>c+":"+l.org)');
  dit("un homme de la salle finit par signer en organisation", org.length > 0,
      org.slice(0, 4).join(" · ") || "personne sous contrat d'organisation");
  /* Et il combat vraiment : on pousse les jours jusqu'au premier
     resultat, offres acceptees en route. Bornage large — une offre met
     ~2-6 semaines a venir, le combat 6 de plus. */
  /* /!\ TIRAGE VARIE, PAS CONSTANT (paye une passe) : avec 0.4 fixe, le
     blocage gala_maison retombait sur la meme option morte huit fois par
     jour et le calendrier ne bougeait plus. */
  let gCombat = 0, sC = 4242;
  const alC = () => ((sC = (sC * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  while (P.lire("RESULTATS.length") === 0 && gCombat++ < 220) {
    P.essai("continuer");
    for (let k = 0; k < 8 && trancherBlocage(P, alC()); k++);
    for (const cle of P.lire("OFFRES.map(o=>o.cle)")) P.essai("repondreOffre", cle, true);
  }
  const combats = P.lire("RESULTATS.length");
  dit("et il combat vraiment chez elle", combats > 0, `${combats} combat(s) pro`);

  /* L'INTERVIEW DE FIGHT WEEK. /!\ ELLE NE SE DECLENCHE PAS A TOUS LES
     COMBATS, ET C'EST LA REGLE (arbitrage de Mael, 25/08 : on ne change
     rien) : il faut un combat QUI COMPTE — titre, homme classe, ou orga
     au-dessus de nationale. Mesure : graine 11, premiere interview au
     jour 389 ; graine 7, aucune en 460 jours malgre 7 combats, tous a
     Hexagone avec un homme non classe.
     Le banc ne peut donc pas exiger qu'elle tombe toute seule — il exige
     que LE CHEMIN EXISTE : on pose un cas qui remplit la condition, et
     la presse doit appeler. */
  const presse = P.lire(`(function(){
    const e=Object.entries(MESGARS).find(([,l])=>!l.amateur&&!l.retraite&&l.org);
    if(!e)return null;
    const [cle,l]=e;
    l.rang=8;                                   /* il est classe : ca compte */
    l.combatPrevu={jourCombat:t.jour+3,org:l.org,adversaire:1,
                   trace:{nom:"Un Adversaire",rang:5},itw:false};
    bloque=null;
    const parti=interviewFightWeek();
    return {parti, id:bloque?bloque.id:null, titre:bloque?String(bloque.titre||""):"",
            marque:!!l.combatPrevu.itw,
            choix:bloque&&bloque.choix?bloque.choix.length:0};
  })()`);
  dit("sur un combat qui compte, la presse tend le micro au patron",
      !!presse && presse.parti === true && presse.id === "itw",
      presse ? presse.titre : "aucun homme en organisation");
  dit("elle pose de vraies questions à choix", !!presse && presse.choix >= 2,
      presse ? `${presse.choix} réponses possibles` : "");
  dit("et une seule interview par combat", !!presse && presse.marque === true,
      "o.itw posé");

  /* Et la porte reste FERMEE sur un combat qui ne compte pas — sinon la
     regle ci-dessus ne veut plus rien dire. */
  const fermee = P.lire(`(function(){
    const e=Object.entries(MESGARS).find(([,l])=>!l.amateur&&!l.retraite&&l.org);
    if(!e)return null;
    const [,l]=e; l.rang=null; l.org="HEX";
    l.combatPrevu={jourCombat:t.jour+3,org:"HEX",adversaire:1,
                   trace:{nom:"Un Local",rang:null},itw:false,titre:false};
    bloque=null;
    return {parti:interviewFightWeek(), id:bloque?bloque.id:null};
  })()`);
  dit("mais pas sur un combat local d'un homme non classé",
      !!fermee && fermee.parti === false && fermee.id === null,
      fermee ? `retour ${fermee.parti}` : "");

  dit("aucune exception sur le chemin du métier", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LA SAUVEGARDE D'UNE PARTIE QUI DURE                                   */
/* /!\ CE BLOC EXISTE PARCE QUE LE CAS 122 A COUTE UNE PARTIE. La        */
/* sauvegarde grossit avec le monde (2,7 Mo au jour 200, 7,3 Mo au jour  */
/* 1200) : les deux chemins doivent tenir, et surtout se RELIRE.         */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "neuf", graine: 4 });
  jouer(P, 200, 4);

  /* Le coffre est indisponible dans le bac : c'est donc le chemin de
     SECOURS qui s'exerce ici — celui qui etait mort en silence. */
  const t = P.lire(`(function(){
    const brut=JSON.stringify(etatDuJeu());
    const petit=compresserSiSur(brut);
    return {brut:brut.length, petit:petit?petit.length:null,
            relu:petit?(decompresserSauvegarde(petit)===brut):null,
            jour:t.jour};})()`);
  dit("la sauvegarde de secours se compresse", t.petit !== null && t.petit < t.brut,
      `${Math.round(t.brut / 1024)} Ko -> ${Math.round(t.petit / 1024)} Ko au jour ${t.jour}`);
  dit("et elle se relit au caractère près", t.relu === true);
  dit("elle tient dans le quota de localStorage (5 Mo en UTF-16)",
      t.petit * 2 < 5 * 1024 * 1024, `${Math.round(t.petit * 2 / 1024)} Ko en UTF-16`);

  /* /!\ LES DEUX FORMATS SE RECHARGENT. Une partie ecrite avant
     aujourd'hui ne doit rien perdre. */
  const deux = P.lire(`(function(){
    const brut=JSON.stringify(etatDuJeu());
    const jour=t.jour;
    const A=(function(){chargerEtat(JSON.parse(decompresserSauvegarde(brut)));return t.jour;})();
    const B=(function(){chargerEtat(JSON.parse(decompresserSauvegarde(compresserSiSur(brut))));return t.jour;})();
    return {jour,A,B};})()`);
  dit("le format d'hier se recharge", deux.A === deux.jour, `jour ${deux.A}`);
  dit("le format compressé aussi", deux.B === deux.jour, `jour ${deux.B}`);

  /* La sauvegarde a vraiment ete ECRITE quelque part pendant la partie —
     sinon tout ce qui precede teste une fonction que personne n'appelle. */
  dit("la partie s'est réellement sauvegardée en jouant", P.stock._map.size > 0,
      [...P.stock._map.keys()].join(", "));
  dit("et elle a été écrite en clair tant que le quota le permettait",
      !String(P.stock.getItem("mma_sauve_1") || "").startsWith("MMALZ1|"),
      "le brut passe : on ne paie pas la compression pour rien");
}

/* /!\ LE JOUR OU LE NAVIGATEUR DIT NON. C'est le seul chemin qui a
   vraiment compte dans l'histoire de ce jeu (cas 122) : une partie s'y
   est perdue. Un stockage de banc qui accepte tout ne le teste jamais. */
{
  const petitCoffre = coffreMemoire(900 * 1024);   // ~1,8 Mo en UTF-16
  const P = ouvrirPartie({ mode: "neuf", graine: 4, stock: petitCoffre });
  jouer(P, 200, 4);
  const ecrit = String(petitCoffre.getItem("mma_sauve_1") || "");
  dit("quota dépassé : la sauvegarde se compresse et passe quand même",
      ecrit.startsWith("MMALZ1|"),
      ecrit ? `${Math.round(ecrit.length / 1024)} Ko compressés` : "RIEN N'A ÉTÉ ÉCRIT");
  dit("et ce qui est écrit se relit",
      P.lire(`(function(){const s=localStorage.getItem("mma_sauve_1");
        const c=decompresserSauvegarde(s); if(!c)return false;
        try{const o=JSON.parse(c);return o&&o.v===1&&o.jour>0;}catch(e){return false;}})()`));
  dit("aucune exception quand le quota refuse", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
  dit("aucune exception sur le chemin de la sauvegarde", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* L'ACCUEIL REPOND MEME CHEZ UN HOTE HOSTILE                            */
/* /!\ NE DU 26/08 (Mael : "les boutons de l'accueil ne marchent plus") : */
/* des qu'une partie existait, demarrer passait par un confirm() NATIF — */
/* et l'hote qui le bloque (visionneuse, WebView) repond "non" en        */
/* silence. Ici confirm() est EMPOISONNE : y toucher fait echouer le     */
/* banc. Le clic doit repondre sans lui. (cas 121 quinquies)             */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "choix", graine: 2 });
  P.lire(`(function(){
    confirm=function(){throw new Error("confirm() natif appelé — l'hôte hostile l'avale");};
    prompt=confirm; alert=function(){};
    location._recharges=0; location.reload=function(){location._recharges++;};
    return true;})()`);

  const panneau = P.lire(`(function(){
    ouvrirAccueil();
    confirmerNouvellePartie("neuf", JSON.stringify({v:1,jour:42}));
    return document.getElementById("accueil").innerHTML;})()`);
  dit("la confirmation d'écrasement se rend dans la page, sans confirm()",
      panneau.includes("jour 42") && panneau.includes("secours")
      && panneau.includes("lancerNouvellePartie") && panneau.includes("ouvrirAccueil()"),
      "les deux issues sont des boutons de la page");

  dit("« Annuler » ramène l'accueil entier",
      P.lire(`(function(){ouvrirAccueil();
        return document.getElementById("accueil").innerHTML.includes("choisirMode");})()`));

  /* /!\ DEUX EVALUATIONS, PAS UNE : lancerNouvellePartie passe par une
     promesse (coffreLire), et le bac ne vide ses microtaches QU'ENTRE
     deux evaluations (microtaskMode). Lire le resultat dans la meme
     evaluation voyait toujours zero — le banc accusait le jeu. */
  P.lire(`(lancerNouvellePartie("neuf"), true)`);
  /* /!\ LE CONTRAT A CHANGE (cas 126 bis) : on ne RECHARGE PLUS — la
     visionneuse sert la page en blob: et son rechargement perd le
     fragment. Le demarrage se fait SUR PLACE : zero reload, l'accueil
     s'en va, le mode est ensemence, le monde existe. Un reload qui
     reapparaitrait ici est une regression. */
  /* /!\ Le DOM du bac RECREE tout element demande : "l'accueil n'existe
     plus" y est invérifiable. On verifie qu'il est VIDE — un accueil
     retire puis recree par le bac n'a plus une ligne de HTML. */
  dit("démarrer lance la partie SUR PLACE, sans recharger",
      P.lire(`location._recharges===0&&MODE==="neuf"
        &&document.getElementById("accueil").innerHTML===""&&t.jour===0
        &&typeof MONDE==="object"&&MONDE!==null`),
      "zéro reload · accueil retiré · monde né");
  dit("le hash est posé quand l'hôte le permet — sans que rien n'en dépende",
      P.lire(`location.hash==="#neuf"`));

  /* La DEMO sur place, depuis un chargement "choix" qui avait efface les
     fiches scriptees : elles doivent REVENIR (la photographie
     FICHES_SCRIPTEES), avec l'echeance du combat de Lyon, et le loyer ne
     doit pas se doubler. */
  {
    const D = ouvrirPartie({ mode: "choix", graine: 5 });
    D.lire(`(ouvrirAccueil(), demarrerEnPlace("demo"), true)`);
    dit("la démo démarre sur place — les hommes scriptés reviennent",
        D.lire(`!!FICHES["Okonkwo"]&&!!FICHES["Kanté"]&&EFFECTIF.length>30&&MODE==="demo"`),
        D.lire(`"effectif "+EFFECTIF.length`));
    dit("le combat de Lyon est à l'affiche",
        D.lire(`t.echeances.some(e=>e.donnees&&e.donnees.id==="combat1")`));
    dit("et les échéances communes ne se doublent pas",
        D.lire(`t.echeances.filter(e=>e.donnees&&e.donnees.id==="loyer").length===1`),
        "un seul loyer");
    dit("aucune exception au démarrage sur place", D.erreurs.length === 0,
        [...new Set(D.erreurs)].slice(0, 3).join(" | "));
  }

  dit("l'effacement aussi se confirme dans la page",
      P.lire(`(function(){ouvrirAccueil();confirmerEffacement();
        const h=document.getElementById("accueil").innerHTML;
        return h.includes("Oui, tout effacer")&&h.includes("Annuler");})()`));

  dit("et pas une exception — confirm() empoisonné n'a jamais été touché",
      P.erreurs.length === 0, [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LA REVANCHE, L'APPEL, LA CAUSERIE (chantiers du 26/08)                */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 31 });
  jouer(P, 60, 31);

  /* LA REVANCHE : une rivalite chaude, un rival du meme roster, un delai
     respecte — le matchmaker doit viser CE nom-la, et la bourse monter. */
  const rev = P.lire(`(function(){
    const e=Object.entries(MESGARS).find(([,l])=>!l.amateur&&!l.retraite&&l.org);
    if(!e)return null;
    const [cle,l]=e;
    const rival=[...MONDE.pros.values()].find(x=>x.org===l.org
      &&x.division===l.division&&x.id!==l.id&&!x.salle);
    if(!rival)return {raison:"aucun rival possible"};
    rival.vie=rival.vie||{}; rival.vie.dispo=0;
    MMA.endgame.nourrir(rivalitesTable(),cle,rival.id,"ceinture",t.jour-50,rival.nom);
    l.combatPrevu=null;l.camp=null;delete l.renego;
    l.vie.dispo=0;l.vie.restants=3;l.derniereOffre=undefined;
    if(l.vie)l.vie.advPrec=null;
    OFFRES.length=0;CIBLE=null;
    /* On force la fenetre de frequence du matchmaker : le banc teste la
       VISEE, pas le calendrier. */
    let o=null;
    for(let j=0;j<40&&!OFFRES.length;j++){t.avancer(1);proposerOffres();}
    o=OFFRES[0]||null;
    return o?{adv:o.adversaire,rival:rival.id,bourseUp:!!o.rivalite}
            :{raison:"aucune offre en 40 jours"};
  })()`);
  dit("le matchmaker propose la revanche au rival encore chaud",
      !!rev && rev.adv === rev.rival, rev ? (rev.raison || `adversaire ${rev.adv} = rival`) : "pas de pro");
  dit("et la rivalité se paie sur la bourse de cette offre",
      !!rev && rev.bourseUp === true);

  /* L'APPEL DE DERNIERE MINUTE : conditions reunies, on force le tirage
     en appelant tous les jours — l'offre doit etre courte, majoree, et
     expirer sous 48 h. */
  const appel = P.lire(`(function(){
    OFFRES.length=0;
    const e=Object.entries(MESGARS).find(([,l])=>!l.amateur&&!l.retraite&&l.org);
    if(!e)return null;
    const [cle,l]=e;
    l.combatPrevu=null;l.camp=null;delete l.renego;l.vie.dispo=0;l.vie.restants=3;
    delete l.dernierAppel; l.blessure=null;
    let garde=0;
    while(!OFFRES.length&&garde++<4000){appelDeDerniereMinute();}
    const o=OFFRES[0];
    return o?{court:o.jourCombat-t.jour, expire:o.expire-t.jour,
              remplacement:!!o.remplacement, avert:!!o.avertissement}:null;
  })()`);
  dit("l'appel de dernière minute finit par sonner", !!appel,
      appel ? `combat à J+${appel.court}` : "jamais en 4000 tirages");
  dit("préavis court, réponse sous 48 h, et c'est écrit sur l'offre",
      !!appel && appel.court <= 12 && appel.expire <= 2
      && appel.remplacement && appel.avert);

  /* LA CAUSERIE : une par combat, le bon discours repare, le mauvais
     coute — et l'allure du premier round passe par coin.plan sans
     pietiner un plan du joueur. */
  const cau = P.lire(`(function(){
    COMBAT1=preparerCombat("Okonkwo","Renaud",3,77);
    const im=imageDe("Okonkwo"); im.pression=0.08;
    const avant=COMBAT1.fa.mental.fight_iq;
    ouvrirCauserie();
    const panneau=document.getElementById("fiche").innerHTML;
    direCauserie("calmer");
    const apres=COMBAT1.fa.mental.fight_iq;
    const deuxieme=(function(){const n=COMBAT1.fa.mental.fight_iq;
      direCauserie("allumer");return COMBAT1.fa.mental.fight_iq===n;})();
    return {panneau:panneau.includes("calmer")&&panneau.includes("allumer")&&panneau.includes("plan"),
            tourne:panneau.includes("tourne en rond"),
            repare:apres>avant, une:deuxieme, juste:COMBAT1.causerie.juste};
  })()`);
  dit("la causerie lit son état réel et offre les trois discours",
      !!cau && cau.panneau && cau.tourne, "il tourne en rond — la pression se voit");
  dit("calmer un homme sous pression lui rend une part de ses moyens",
      !!cau && cau.repare && cau.juste === true);
  dit("une causerie par combat, pas deux", !!cau && cau.une === true);

  const cau2 = P.lire(`(function(){
    COMBAT1=preparerCombat("Okonkwo","Renaud",3,78);
    imageDe("Okonkwo").pression=0.08;
    const avant=COMBAT1.fa.mental.fight_iq;
    direCauserie("allumer");
    return {coute:COMBAT1.fa.mental.fight_iq<avant, juste:COMBAT1.causerie.juste};
  })()`);
  dit("allumer un homme qui déborde déjà se paie",
      !!cau2 && cau2.coute && cau2.juste === false);

  const cau3 = P.lire(`(function(){
    COMBAT1=preparerCombat("Okonkwo","Renaud",3,79);
    const l=MESGARS["Okonkwo"]; if(l){l.plan=l.plan||{};l.plan.allure=1.3;}
    imageDe("Okonkwo").pression=0;
    if(l&&l.vie)l.vie.derniers=["D"];
    direCauserie("allumer");
    const traces=COMBAT1.moteur.consignes.filter(c=>c.plan&&c.allure!==undefined);
    if(l)delete l.plan;
    return {aucunPietinage:traces.length===0, juste:COMBAT1.causerie.juste};
  })()`);
  dit("la causerie ne piétine jamais un plan d'allure posé par le joueur",
      !!cau3 && cau3.aucunPietinage && cau3.juste === true);

  dit("aucune exception sur les trois mécaniques", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LES QUATRE RAPPORTS DE MAEL DU 26/08 AU SOIR                          */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 17 });
  jouer(P, 40, 17);

  /* 1. L'ARTICLE DE SIGNATURE NOMME L'ORGANISATION. */
  const art = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    if(!c)return null;
    const l=MESGARS[c]; l.org=null;l.rang=null;l.champion=false;l.demarchages=[];
    MMA.contrats.signerSalle(l,0.2,3,t.jour);
    for(let k=0;k<40&&!l.org;k++){l.demarchages=[];
      for(const o of Object.keys(MMA.classement.ORGS)){demarcherOrga(c,o);if(l.org)break;}}
    if(!l.org)return {raison:"aucune signature en 40 essais"};
    const a=articlesDe().find(x=>x.type==="signeOrga"||x.type==="changeOrga");
    return a?{titre:a.titre,nomme:a.titre.includes(MMA.classement.ORGS[l.org].nom)}
            :{raison:"pas d'article"};
  })()`);
  dit("l'article de signature nomme l'organisation, pas « le circuit »",
      !!art && art.nomme === true, art ? (art.titre || art.raison) : "");

  /* 2. UNE DEMANDE QUI VEUT UNE DATE NE SORT PAS QUAND IL EN A UNE —
     et si elle etait DEJA posee, elle se range toute seule. */
  const dem = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite&&MESGARS[k].org);
    if(!c)return null;
    const l=MESGARS[c];
    l.combatPrevu={jourCombat:t.jour+30,org:l.org,adversaire:1,trace:{nom:"X"}};
    const f=MMA.salle.ficheDe(MONDE,l.id);
    const sort=MMA.demandes.possibles(f,contexteDe(l)).map(d=>d.cle);
    const interdits=["enchainer","cet_adversaire","souffler","main_event",
      "monter_categorie","veut_revanche"].filter(k=>sort.includes(k));
    l.demandeEnCours="enchainer";
    perimerDemandes();
    const rangee=l.demandeEnCours===null;
    l.combatPrevu=null;
    return {interdits,rangee};
  })()`);
  dit("avec une date au calendrier, aucune demande ne réclame un combat",
      !!dem && dem.interdits.length === 0, dem ? (dem.interdits.join(",") || "les six sont muettes") : "");
  dit("et la demande déjà posée se range d'elle-même quand la date tombe",
      !!dem && dem.rangee === true, "« il a sa date, le reste attendra »");

  /* 3. LES TROIS NOUVELLES DEMANDES ONT DES EFFETS REELS. */
  const nv = P.lire(`(function(){
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    const l=MESGARS[c]; const r={};
    l.veutRevanche=false; appliquerEffet(c,"vouloir_revanche");
    r.revanche=l.veutRevanche===true;
    l.camp={qualite:1,axe:"striking"}; argent=5000;
    appliquerEffet(c,"partenaire_dedie");
    r.partenaire=l.camp.qualite>1&&argent===4400;
    const im=imageDe(c); im.pression=0.08; const n0=im.notoriete;
    appliquerEffet(c,"couper_presse");
    r.presse=im.pression===0&&im.notoriete<n0;
    l.camp=null; l.veutRevanche=false;
    return r;
  })()`);
  dit("« vouloir la revanche » raccourcit vraiment l'attente du matchmaker", !!nv && nv.revanche);
  dit("« un partenaire dédié » améliore le camp et coûte 600 €", !!nv && nv.partenaire);
  dit("« couper la presse » vide la pression et se paie en notoriété", !!nv && nv.presse);

  /* 4. LA REPUTATION FREINE EN HAUT, ET LE PRO QUI FRAPPE RESTE A SA
     PORTE. */
  const rep = P.lire(`(function(){
    SALLE.reputation=20; bougerReputation(3,null); const bas=SALLE.reputation-20;
    SALLE.reputation=80; bougerReputation(3,null); const haut=Math.round((SALLE.reputation-80)*100)/100;
    SALLE.reputation=80; bougerReputation(-3,null); const perte=SALLE.reputation-80;
    SALLE.reputation=20;
    return {bas,haut,perte};
  })()`);
  dit("un même succès rapporte plein en bas, peu en haut",
      !!rep && rep.bas === 3 && rep.haut <= 1 && rep.haut > 0,
      rep ? `+${rep.bas} à 20 de réputation · +${rep.haut} à 80` : "");
  dit("mais une perte reste pleine, quelle que soit la hauteur",
      !!rep && rep.perte === -3, "une réputation se perd plus vite qu'elle ne se gagne");

  const frappe = P.lire(`(function(){
    SALLE.reputation=60;
    const orgs=new Set();
    for(let i=0;i<4000;i++){ bloque=null; proQuiFrappe();
      if(bloque&&bloque.id==="frappe"){
        /* pas de regex ici : la cuisson du gabarit mange les \/ — on
           decoupe la chaine a la main. */
        const t=String(bloque.texte), i=t.indexOf("chez");
        if(i>=0){const a=t.indexOf("<b>",i), b=t.indexOf("</b>",a);
          if(a>=0&&b>a)orgs.add(t.slice(a+3,b).trim());}
        bloque=null; } }
    SALLE.reputation=20; bloque=null;
    const hautes=[...orgs].filter(n=>{const o=Object.values(MMA.classement.ORGS).find(x=>x.nom===n);
      return o&&o.portee>70;});
    return {vus:[...orgs],hautes};
  })()`);
  dit("à réputation 60, aucun contracté d'une grande organisation ne frappe",
      !!frappe && frappe.hautes.length === 0 && frappe.vus.length > 0,
      frappe ? (frappe.hautes.join(",") || frappe.vus.slice(0, 4).join(" · ")) : "");

  dit("aucune exception sur les quatre rapports", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* L'ECRAN COMPTE DU BON COTE (Mael, 27/08 : "je perds mais c'est        */
/* marque que je domine")                                                */
/* /!\ L'INVARIANT QUI MANQUAIT : les bancs comparaient l'ecran au pli   */
/* du traducteur, et le pli a lui-meme — JAMAIS au MOTEUR. Une inversion */
/* systematique de cotes passait les 31 bancs. Ici : les frappes de la   */
/* feuille (ce que l'ecran affiche) == les bilans du log (ce que le      */
/* moteur a compte), nom par nom, sur des paires salle-monde REELLES et  */
/* sur la collision par prefixe fabriquee expres.                        */
/* ==================================================================== */
{
  /* /!\ EN DEMO, PAS EN NEUF : une partie neuve met des mois a produire
     un pro (lecon du marquage des contrats) — le croiseur a besoin
     d'hommes qui combattent, pas de l'economie de lancement. */
  const P = ouvrirPartie({ mode: "demo", graine: 13 });
  let sN = 13; const alN = () => ((sN = (sN * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let gN = 0;
  while (P.lire("t.jour") < 30 && gN++ < 400) {
    P.essai("continuer");
    for (let k = 0; k < 8 && trancherBlocage(P, alN()); k++);
  }
  const sonde = P.lire(`(function(){
    const res=[];
    const compterMoteur=(log,na,nb)=>{const M={[na]:0,[nb]:0};
      /* double antislash : le gabarit cuit une fois (piege paye 2 fois). */
      for(const l of log){const m=String(l).match(/^\\s{4}(\\S+)\\s+dégâts\\s+\\S+ \\| frappes (\\d+)\\//);
        if(m&&M[m[1]]!==undefined)M[m[1]]+=Number(m[2]);}
      return M;};
    const jouer=(cle,advId,graine,renomme)=>{
      const r=preparerCombat(cle,advId,3,graine);
      if(renomme){r.fa.name=renomme[0];r.fb.name=renomme[1];}
      let g=0;while(!r.moteur.fini&&g++<8)jouerUnRound(r);
      retraduire(r);
      const M=compterMoteur(r.moteur.log,r.fa.name,r.fb.name);
      const F=r.feuille.total;
      /* Les cartes lisent le log : le vainqueur des cartes doit etre
         celui du moteur, cote pour cote. */
      const vCartes=(r.cartes||[]).reduce((a,c)=>{a[c.pour]=(a[c.pour]||0)+1;return a;},{});
      /* Les COMPTEURS DE L'ECRAN : le dernier st des etapes du traducteur
         — c'est LUI que le bandeau du haut affiche, pas la feuille. */
      let st=null;
      for(let k=r.etapes.length-1;k>=0&&!st;k--)if(r.etapes[k].st)st=r.etapes[k].st;
      return {noms:[r.fa.name,r.fb.name],
        moteur:[M[r.fa.name],M[r.fb.name]],
        ecran:st?[st[0],st[2]]:null,
        feuille:[F[0].sig[0],F[1].sig[0]],
        finiTot:r.round>=3&&r.methode==="DÉCISION",
        vainqueur:r.moteur.vainqueur?(r.moteur.vainqueur===r.fa?"A":"B"):null,
        verdict:r.vainqueur};
    };
    /* des paires reelles */
    const pros=Object.keys(MESGARS).filter(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite).slice(0,3);
    for(const cle of pros){
      const l=MESGARS[cle];
      const adv=[...MONDE.pros.values()].find(p=>!p.salle&&p.division===l.division);
      if(!adv)continue;
      for(const g of [11,42])res.push(jouer(cle,adv.id,g,null));
    }
    /* LA COLLISION FABRIQUEE : nomA prefixe de nomB — le cas qui envoyait
       toutes les frappes de B chez A avant la garde. */
    if(pros.length){
      const l=MESGARS[pros[0]];
      const adv=[...MONDE.pros.values()].find(p=>!p.salle&&p.division===l.division);
      if(adv)res.push(Object.assign(jouer(pros[0],adv.id,77,["Dur","Durand"]),{fabrique:true}));
    }
    return res;})()`);
  let inversions = 0, testes = 0, prefixeVu = null;
  for (const r of sonde) {
    if (!r || !r.moteur) continue;
    testes++;
    /* Sur une decision complete, feuille == bilans exactement ; sur une
       finition, la feuille compte aussi le round inacheve : >=. */
    const okA = r.finiTot ? r.feuille[0] === r.moteur[0] : r.feuille[0] >= r.moteur[0];
    const okB = r.finiTot ? r.feuille[1] === r.moteur[1] : r.feuille[1] >= r.moteur[1];
    /* Le vrai crime : le camp dominant du moteur affiche a l'oppose —
       sur LA FEUILLE ou sur LES COMPTEURS DU BANDEAU. */
    const domM = r.moteur[0] - r.moteur[1], domF = r.feuille[0] - r.feuille[1];
    const domE = r.ecran ? r.ecran[0] - r.ecran[1] : domM;
    const inverse = (domM > 5 && domF < -5) || (domM < -5 && domF > 5)
      || (domM > 5 && domE < -5) || (domM < -5 && domE > 5);
    if (inverse || (!okA && !okB)) { inversions++;
      if (r.fabrique) prefixeVu = r; }
    if (r.fabrique) prefixeVu = r;
  }
  dit("sur toutes les paires salle-monde, la feuille compte du même côté que le moteur",
      inversions === 0 && testes >= 5,
      `${testes} combats croisés, ${inversions} inversion(s)`);
  /* /!\ CE CAS FABRIQUE PROUVE LA FAILLE, PAS LA CORRECTION : il renomme
     APRES preparerCombat, donc SANS la garde — et le traducteur DOIT y
     detourner les frappes (startsWith). Si un jour ce test "passe", c'est
     que le traducteur a change : la garde de preparerCombat devra etre
     re-jugee, pas supprimee en silence. */
  /* La faille vit dans les COMPTEURS DU TRADUCTEUR (la feuille, elle, a
     le correctif du cas 61 depuis longtemps) : sur « Dur » c. « Durand »,
     les frappes de B partent en A au bandeau du haut. */
  dit("la preuve : sans la garde, l'écran de « Dur » c. « Durand » vole les frappes de B",
      !!prefixeVu && !!prefixeVu.ecran && prefixeVu.moteur[1] > 20
      && prefixeVu.ecran[1] < prefixeVu.moteur[1] / 2,
      prefixeVu && prefixeVu.ecran
        ? `moteur ${prefixeVu.moteur.join("-")} · écran ${prefixeVu.ecran.join("-")}`
        : "cas non joué");
  /* Et LA GARDE : sur toutes les paires reelles, les jetons sortis de
     preparerCombat ne sont JAMAIS en relation de prefixe. */
  dit("la garde : aucun couple de jetons du jeu n'est en relation de préfixe",
      sonde.filter((r) => r && !r.fabrique).every((r) =>
        !r.noms[0].startsWith(r.noms[1]) && !r.noms[1].startsWith(r.noms[0])),
      sonde.filter((r) => r && !r.fabrique).map((r) => r.noms.join("/")).slice(0, 3).join(" · "));
  dit("le verdict de l'écran est celui du moteur, côté pour côté",
      sonde.every((r) => !r || r.vainqueur === null || r.verdict === r.vainqueur));
  dit("aucune exception pendant le croisement", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — la partie se joue, et ce qui doit se voir se voit."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
