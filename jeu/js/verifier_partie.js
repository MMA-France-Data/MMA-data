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
/* Le module du matchmaker se lit aussi en direct : certaines regles se
   verifient sans monter une partie (cas 157). */
const MATCH = require("./matchmaker.js");

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

  /* /!\ L'EXPORT NON PLUS N'A PLUS DE CUL-DE-SAC (Mael, 27/08 : "je vois
     jamais le code, seulement le bouton copier et ca me met impossible") :
     presse-papier EMPOISONNE + execCommand mort -> le clic DOIT finir sur
     la zone de copie manuelle, morceau 1 affiché. */
  dit("copier avec un presse-papier mort finit sur la zone à copier",
      P.lire(`(function(){
        document.execCommand=function(){throw new Error("sandbox");};
        navigator.clipboard={writeText:function(){throw new Error("sandbox");}};
        try{ demarrerEnPlace("demo"); }catch(e){}
        copierSauvegarde();
        const h=document.getElementById("fiche").innerHTML;
        return h.includes("morceau 1/")&&h.includes("zone-copie");})()`),
      "aucun échec ne mange plus la sauvegarde");
  dit("et le bouton « à la main » existe sur l'écran d'export",
      P.lire(`(function(){exporterSauvegarde();
        return document.getElementById("fiche").innerHTML.includes("je copie à la main");})()`));

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
      /* st est un DELTA par etape : on somme, comme le gabarit. */
      let st=null;
      for(const e of r.etapes)if(e.st){st=st||[0,0,0,0];
        st[0]+=e.st[0];st[1]+=e.st[1];st[2]+=e.st[2];st[3]+=e.st[3];}
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
    /* le cas fabrique est LA PREUVE de la faille : il ne compte pas dans
       le croiseur des paires reelles (il a sa propre assertion). */
    if (r.fabrique) { prefixeVu = r; continue; }
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
  const details = sonde.filter((r) => r && r.moteur && !r.fabrique).map((r) =>
    `${r.noms.join("/")} g?: M${r.moteur.join("-")} E${r.ecran ? r.ecran.join("-") : "?"} F${r.feuille.join("-")}`);
  dit("sur toutes les paires salle-monde, la feuille compte du même côté que le moteur",
      inversions === 0 && testes >= 4,
      inversions ? details.join(" · ") : `${testes} combats croisés, 0 inversion`);
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
  /* L'AUTOPSIE EMBARQUEE (cas 136 bis) : chaque combat encaisse porte
     son rapport. Sur un combat sain, pas d'alerte ; sur l'inversion
     fabriquee (prefixe, sans la garde), l'alerte DOIT sonner. */
  const auto = P.lire(`(function(){
    const jouer=(renomme)=>{
      const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
      const l=MESGARS[c];
      const adv=[...MONDE.pros.values()].find(p=>!p.salle&&p.division===l.division);
      const r=preparerCombat(c,adv.id,3,88);
      if(renomme){r.fa.name=renomme[0];r.fb.name=renomme[1];}
      let g=0;while(!r.moteur.fini&&g++<8)jouerUnRound(r);
      retraduire(r);
      COMBAT1=r; RESULTATS.unshift({quand:t.jour,affiche:"x",res:"?",enAttente:true,graine:r.graine});
      encaisserResultat();
      return RESULTATS[0].autopsie;
    };
    const sain=jouer(null);
    const casse=jouer(["Dur","Durand"]);
    return {sain:{inverse:sain&&sain.inverse,graine:sain&&sain.graine},
            casse:{inverse:casse&&casse.inverse},
            taille:JSON.stringify(casse||{}).length};
  })()`);
  dit("un combat sain porte son rapport, sans alerte",
      !!auto && auto.sain.inverse === false && auto.sain.graine === 88);
  dit("l'inversion fabriquée fait sonner l'alerte de la carte",
      !!auto && auto.casse.inverse === true,
      "⚠ compteurs suspects, et le rapport tient en un message");
  dit("le rapport tient en un seul message", !!auto && auto.taille < 700,
      auto ? `${auto.taille} octets` : "");

  dit("aucune exception pendant le croisement", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LES TROIS RAPPORTS DU 27/08 (Mael) : le pro sous orga peut signer      */
/* son contrat de salle, le renvoi existe, la chute est plus dure de     */
/* haut.                                                                 */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 21 });
  const r = P.lire(`(function(){
    /* 1. Un pro du monde, sous contrat d'organisation, adopte SANS
       accord de salle : l'ecran de contrat doit etre celui de la
       SIGNATURE — pas "personne ne peut le prendre". */
    const p=[...MONDE.pros.values()].find(x=>!x.salle&&!x.retraite&&x.org
      &&!x.champion&&(x.bilan.v||0)>=3);
    const cle=adopterProDuMonde(p);
    ouvrirContrat(cle);
    const h=$("fiche").innerHTML;
    const signe=h.indexOf("Ta part sur ses bourses")>=0;
    const bloqueAvant=h.indexOf("Personne ne peut le prendre")>=0;
    /* 2. Le renvoi — d'abord la garde : combat programme => refus. */
    const l=MESGARS[cle];
    l.combatPrevu={jourCombat:t.jour+30};
    virerGars(cle);
    const gardeTient=!!MESGARS[cle];
    l.combatPrevu=null;
    /* Un contrat de salle en cours, pour verifier le solde. */
    MMA.contrats.signerSalle(l,0.25,3,t.jour);
    const frais=MMA.contrats.fraisDossier(l);
    ouvrirRenvoi(cle);
    const ecranSolde=$("fiche").innerHTML.indexOf("se solde")>=0;
    const av=argent;
    virerGars(cle);
    const paye=av-argent;
    const parti=!MESGARS[cle]&&!EFFECTIF.some(x=>x.id===cle);
    const rendu=p.salle===false&&p.contratSalle===null;
    /* 3. La chute : la MEME defaite, a 30 puis a 80 de reputation. */
    const c2=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    const rr={vainqueur:"B",methode:"KO",round:2,a:c2,b:"personne"};
    SALLE.reputation=30; const basse=retombees(rr).rep;
    SALLE.reputation=80; const haute=retombees(rr).rep;
    return {signe,bloqueAvant,gardeTient,ecranSolde,paye,frais,parti,rendu,basse,haute};
  })()`);
  dit("le pro sous contrat d'orga tombe sur l'écran de signature de salle",
      !!r && r.signe && !r.bloqueAvant,
      r ? (r.bloqueAvant ? "l'écran dit encore « personne ne peut le prendre »" : "") : "rien lu");
  dit("le renvoi refuse tant qu'un combat est programmé", !!r && r.gardeTient);
  dit("l'écran de renvoi annonce le solde avant le clic", !!r && r.ecranSolde);
  dit("rompre un contrat en cours se solde — les frais de dossier par combat restant",
      !!r && r.paye === r.frais * 3 && r.paye > 0,
      r ? `${r.paye} € payés (frais ${r.frais} € × 3)` : "");
  dit("le renvoyé quitte l'effectif et les fiches du jour", !!r && r.parti);
  dit("et le monde le reprend : la marque salle tombe, le contrat de salle aussi",
      !!r && r.rendu);
  dit("la même défaite coûte trois fois plus cher à 80 de réputation qu'à 30",
      !!r && r.basse < 0 && r.haute < 0
      && r.haute / r.basse > 2.8 && r.haute / r.basse < 3.2,
      r ? `à 30 : ${r.basse} · à 80 : ${r.haute}` : "");
  dit("aucune exception pendant les trois rapports", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LES INTERNATIONALES VEULENT DES PREUVES (Mael, 28/08) : un contracté  */
/* AFC/GFL ne toque que si la salle compte déjà un top 15 sous contrat   */
/* chez une internationale. La réputation seule n'ouvre plus leur porte. */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 33 });
  const r = P.lire(`(function(){
    SALLE.reputation=95;
    const ramasse=()=>{const orgs=new Set();
      for(let i=0;i<4000;i++){ bloque=null; proQuiFrappe();
        if(bloque&&bloque.id==="frappe"){
          const t=String(bloque.texte), j=t.indexOf("chez");
          if(j>=0){const a=t.indexOf("<b>",j), b=t.indexOf("</b>",a);
            if(a>=0&&b>a)orgs.add(t.slice(a+3,b).trim());}
          bloque=null; } }
      return [...orgs];};
    const inter=n=>{const o=Object.values(MMA.classement.ORGS).find(x=>x.nom===n);
      return !!(o&&o.niveau==="internationale");};
    const avant=ramasse();
    /* On forge la preuve : un homme de la salle, top 15 d'une
       internationale — et la meme porte se rouvre. */
    const c=Object.keys(MESGARS).find(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    const l=MESGARS[c];
    const orgI=Object.keys(MMA.classement.ORGS).find(k=>MMA.classement.ORGS[k].niveau==="internationale");
    const sauve={org:l.org,rang:l.rang};
    l.org=orgI; l.rang=8;
    const apres=ramasse();
    l.org=sauve.org; l.rang=sauve.rang;
    SALLE.reputation=20; bloque=null;
    return {avantI:avant.filter(inter),avant:avant.length,
            apresI:apres.filter(inter),apres:apres.length};
  })()`);
  dit("à 95 de réputation SANS top 15 international, aucune internationale ne toque",
      !!r && r.avantI.length === 0 && r.avant > 0,
      r ? (r.avantI.join(",") || `${r.avant} orgas vues, aucune internationale`) : "");
  dit("avec un top 15 chez une internationale, leur porte se rouvre",
      !!r && r.apresI.length > 0,
      r ? r.apresI.join(" · ") : "");
  dit("aucune exception sur la porte des internationales", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LE SCOUTING AUX SOIREES (Mael, 28/08) : le billet s'achète, la        */
/* soirée laisse son rapport, l'œil s'arrête à trois, le backstage       */
/* respecte la porte des internationales (cas 143 — la même fonction).   */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 45 });
  const resa = P.lire(`(function(){
    argent=999999;
    const s=soireesAvenir(); if(!s.length)return null;
    const c=s[0]; reserverVoyage(c.org);
    return SALLE.voyage
      ? {org:SALLE.voyage.org,jour:SALLE.voyage.jour,cout:SALLE.voyage.cout}
      : null;
  })()`);
  dit("le calendrier des soirées se lit et le billet s'achète",
      !!resa && resa.cout > 0,
      resa ? `${resa.org} · ${resa.cout} €` : "aucune soirée annoncée");
  const attente = resa ? Math.max(1, resa.jour - P.lire("t.jour") + 2) : 0;
  if (attente) jouer(P, attente, 45);
  const rap = P.lire(`(function(){
    const s=SALLE.soiree; if(!s)return null;
    const ids=[...new Set(s.combats.flatMap(c=>[c.a,c.b]))];
    for(const id of ids.slice(0,4)){fermerFiche();observerScout(id);}
    const scoutes=ids.filter(id=>{const l=MONDE.pros.get(id);return l&&l.scoute;});
    ouvrirFicheMonde(s.vus[0],s.org);
    const fiche=$("fiche").innerHTML.indexOf("Rapport de scouting")>=0;
    const chiffreExact=$("fiche").innerHTML.indexOf("l.note")>=0;
    return {combats:s.combats.length, vus:s.vus.length, scoutes:scoutes.length,
      fiche, chiffreExact, voyage:!!SALLE.voyage,
      est:(MONDE.pros.get(s.vus[0]).scoute.est||[]).length};
  })()`);
  dit("la soirée jouée laisse son rapport, et le billet est consommé",
      !!rap && rap.combats > 0 && !rap.voyage,
      rap ? `${rap.combats} combats au rapport` : "PAS DE RAPPORT — la soirée n'a pas eu lieu ?");
  dit("l'œil du scout s'arrête à trois regards",
      !!rap && rap.vus === 3 && rap.scoutes === 3,
      rap ? `${rap.vus} vus sur 4 tentés` : "");
  dit("le rapport se lit en fourchettes sur la fiche du monde",
      !!rap && rap.fiche && rap.est === 11 && !rap.chiffreExact,
      rap ? `${rap.est} axes` : "");
  const back = P.lire(`(function(){
    const s=SALLE.soiree; if(!s)return null;
    const ids=[...new Set(s.combats.flatMap(c=>[c.a,c.b]))];
    const orgI=Object.keys(MMA.classement.ORGS).find(k=>MMA.classement.ORGS[k].niveau==="internationale");
    /* Un contracte international en fin de contrat, SANS preuve a la
       salle : la porte du cas 143 doit rester fermee au backstage. */
    const l=MONDE.pros.get(ids[0]);
    const sauve={org:l.org,restants:l.vie?l.vie.restants:null,rep:SALLE.reputation};
    l.org=orgI; l.vie=l.vie||{derniers:[]}; l.vie.restants=0; SALLE.reputation=95;
    bloque=null;
    approcherBackstage(ids[0]);
    const porteTient=!bloque&&s.approches===1;
    /* Deux approches par soiree, pas une de plus. */
    const l2=MONDE.pros.get(ids[1]); const sauve2={org:l2.org};
    l2.org=null;
    approcherBackstage(ids[1]);
    const deux=s.approches===2, adopte=!!bloque;
    if(bloque)bloque=null;
    approcherBackstage(ids[1]);
    const stop=s.approches===2;
    l.org=sauve.org; if(sauve.restants!==null)l.vie.restants=sauve.restants;
    l2.org=sauve2.org; SALLE.reputation=sauve.rep;
    return {porteTient,deux,adopte,stop};
  })()`);
  dit("au backstage, la porte des internationales tient (cas 143)",
      !!back && back.porteTient);
  dit("deux approches par soirée, la troisième est refusée",
      !!back && back.deux && back.stop,
      back && back.adopte ? "et l'un d'eux a voulu voir la salle" : "");
  /* LA SOIREE VECUE (cas 149) : la page annexe, le dialogue, le contact,
     l'invitation et sa semaine. */
  const dial = P.lire(`(function(){
    const s=SALLE.soiree; if(!s)return null;
    const ids=[...new Set(s.combats.flatMap(c=>[c.a,c.b]))];
    const id=ids[2]; const l=MONDE.pros.get(id);
    if(!l)return null;
    s.pas=s.combats.length;
    ouvrirSoireePage();
    const page=$("so-dedans").innerHTML.length>200&&$("soiree-page").classList.contains("ouvert");
    parlerSoiree(id);
    const ouvertD=$("so-dedans").innerHTML.indexOf("so-parle")>=0;
    const av=(l.contact&&l.contact.v)||0;
    direSoiree(id,"sonder");
    const ap=(l.contact&&l.contact.v)||0;
    const svR=SALLE.reputation, svN=l.notoriete, svO=l.org;
    SALLE.reputation=80; l.notoriete=5; l.org=null; SALLE.visiteur=null;
    direSoiree(id,"inviter");
    const invite=!!SALLE.visiteur&&SALLE.visiteur.id===id;
    let rendu=false;
    if(SALLE.visiteur){SALLE.visiteur.jusqua=t.jour;
      const c1=(l.contact&&l.contact.v)||0;
      synchroniserMonde();
      rendu=((l.contact&&l.contact.v)||0)>c1&&!SALLE.visiteur;}
    SALLE.reputation=svR; l.notoriete=svN; l.org=svO;
    bloque=null; fermerSoireePage();
    return {page,ouvertD,contactMonte:ap>av,invite,rendu};
  })()`);
  dit("la soirée s'ouvre en page annexe, comme un écran", !!dial && dial.page);
  dit("« lui parler » ouvre le dialogue au bord de la cage", !!dial && dial.ouvertD);
  dit("chaque réplique laisse du contact sur l'homme du monde", !!dial && dial.contactMonte);
  dit("l'invitation acceptée pose une semaine de visite", !!dial && dial.invite);
  dit("la semaine finie rend du contact et s'efface", !!dial && dial.rendu);
  dit("aucune exception pendant le scouting", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LE VESTIAIRE VIVANT (chantier N, 28/08) : le sparring tisse, la      */
/* fiche parle en mots, le chef émerge des faits, et son départ fait    */
/* vaciller la salle.                                                    */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 51 });
  jouer(P, 160, 51);
  const v = P.lire(`(function(){
    const liens=SALLE.liens||{};
    const n=Object.keys(liens).length;
    const pros=Object.keys(MESGARS).filter(k=>!MESGARS[k].amateur&&!MESGARS[k].retraite);
    if(pros.length<2)return {pasAssez:true};
    const a=pros[0], b=pros[1];
    MMA.vestiaire.poser(liens,a,b,t.jour,"le sparring ensemble",90);
    ouvrirFiche(a);
    const h1=$("fiche").innerHTML;
    const ficheChaud=h1.indexOf("Le vestiaire")>=0&&h1.indexOf("Inséparable")>=0;
    MMA.vestiaire.poser(liens,a,b,t.jour,"la démolition en duel interne",-260);
    ouvrirFiche(b);
    const ficheFroid=$("fiche").innerHTML.indexOf("Irréconciliable")>=0;
    /* Le chef : on lui donne les faits (neuf cents jours de maison,
       entente haute, les autres arrivent aujourd'hui) — il emerge. */
    const l=MESGARS[a];
    l.arriveLe=t.jour-900; l.entente.valeur=75;
    for(const k of pros)if(k!==a)MESGARS[k].arriveLe=t.jour;
    synchroniserMonde();
    const chefBon=SALLE.chef===a;
    /* Et son depart fait vaciller. */
    bloque=null; l.combatPrevu=null;
    quitterLaSalle(a,"Parti — le banc le regarde partir.");
    const vacille=SALLE.chef===null&&SALLE.vestiaireVacille>t.jour;
    return {n,plafond:Object.keys(liens).length<=MMA.vestiaire.MAX_LIENS,
      ficheChaud,ficheFroid,chefBon,vacille};
  })()`);
  dit("sur une saison, le sparring tisse des liens — sous le plafond",
      !!v && !v.pasAssez && v.n > 0 && v.plafond,
      v ? `${v.n} paires` : "");
  dit("la fiche dit le chaud et le froid — en mots, jamais un chiffre",
      !!v && v.ficheChaud && v.ficheFroid);
  dit("le chef de vestiaire émerge des faits, personne ne le nomme",
      !!v && v.chefBon);
  dit("et son départ fait vaciller le vestiaire un mois",
      !!v && v.vacille);
  dit("aucune exception dans le vestiaire", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* DEMANDER AU MATCHMAKER (cas 157, Mael, 01/09) : le nom que l'homme    */
/* reclame se transmet, la demande coute, et la faveur CHANGE l'offre.   */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 63 });
  jouer(P, 120, 63);
  const r = P.lire(`(function(){
    completerRelation();
    const cle=Object.keys(MESGARS).find(k=>MESGARS[k]&&MESGARS[k].org&&!MESGARS[k].amateur);
    if(!cle)return {pasDeGars:true};
    const l=MESGARS[cle], org=l.org;
    const e=RELATION[org];
    /* 1. L'ECRAN EXISTE ET LISTE MES HOMMES DE CETTE ORGA.
       /!\ 95 ET NON 75 (01/09) : le seuil d'une demande d'adversaire
       MONTE de six par rang au-dessus (cas 157). A 75, le banc passait
       tant que le tirage donnait un adversaire de rang proche — le
       recalibrage du monde (cas 155) a change ce tirage et le
       matchmaker s'est mis a refuser A JUSTE TITRE. Un banc ne doit pas
       dependre de la chance du tirage : on se met a une relation qui
       couvre tous les ecarts, et on teste ce qu'on veut tester. */
    delete e.demandeLe; e.valeur=95;
    ouvrirDemandeMatch(org);
    const ecran=$("fiche").innerHTML;
    const listeOk=ecran.indexOf(l.nom)>=0&&ecran.indexOf("demanderAuMatch")>=0;
    /* 2. LE NOM RECLAME PAR L'HOMME EST PROPOSE (le manque de Mael).
       /!\ ON VISE QUELQU'UN D'ATTEIGNABLE (01/09) : le seuil monte de
       six par rang AU-DESSUS, donc un homme non classe qui reclame le
       top 5 se fait refuser — et c'est LA REGLE, pas un defaut. Le banc
       teste donc une demande realiste, et le refus a sa propre
       assertion juste apres. */
    const rMien=(l.rang===null||l.rang===undefined)?20:l.rang;
    const memeDiv=[...MONDE.pros.values()].filter(p=>!p.salle&&p.org===org&&p.division===l.division);
    const adv=memeDiv.find(p=>((p.rang===null||p.rang===undefined)?20:p.rang)>=rMien)||memeDiv[0];
    l.cibleReclamee={id:adv.id,nom:adv.nom,jour:t.jour};
    ouvrirDemandeMatch(org);
    const reclameVu=$("fiche").innerHTML.indexOf(adv.nom)>=0;
    /* 3. LA DEMANDE PASSE, ET ELLE COUTE. */
    const avant=e.valeur;
    demanderAuMatch(org,cle,"adversaire",adv.id);
    /* /!\ ON CAPTURE ICI, PAS A LA FIN (01/09). L'etape 5 vide OFFRES
       pour tester la faveur "affiche" — lire l'offre directe apres coup
       la trouvait donc TOUJOURS absente, et le banc accusait le jeu d'un
       defaut qui etait le sien. Un etat se releve au moment ou il est
       vrai. */
    const offreDirecte=OFFRES.some(o=>o.cle===cle&&o.adversaire===adv.id);
    const faveurPoseeIci=!!l.faveurMatch&&l.faveurMatch.quoi==="adversaire";
    const reclameEffaceIci=!l.cibleReclamee;
    const faveur=l.faveurMatch;
    const aCoute=e.valeur!==avant, dateNotee=e.demandeLe===t.jour;
    /* 4. ON NE DEMANDE PAS DEUX FOIS DE SUITE. */
    ouvrirDemandeMatch(org);
    const barre=$("fiche").innerHTML.indexOf("laisse passer")>=0;
    /* 5. LA FAVEUR "affiche" CHANGE VRAIMENT L'OFFRE SUIVANTE. */
    delete e.demandeLe; e.valeur=90;
    l.faveurMatch=MMA.matchmaker.faveur("affiche",t.jour,null);
    l.combatPrevu=null; l.camp=null; l.renego=null;
    l.vie.dispo=0; delete l.derniereOffre;
    OFFRES.length=0;
    let vue=null;
    for(let g=0;g<400&&!vue;g++){ t.jour++; proposerOffres();
      const o=OFFRES.find(x=>x.cle===cle); if(o)vue=o; }
    return {listeOk,reclameVu,aCoute,dateNotee,barre,
      faveurPosee:faveurPoseeIci, offreDirecte, reclameEfface:reclameEffaceIci,
      offre:vue?{place:vue.place,faveur:vue.faveur||null}:null,
      consommee:!l.faveurMatch};
  })()`);
  dit("l'écran des demandes liste tes hommes de cette organisation",
      !!r && !r.pasDeGars && r.listeOk);
  dit("le nom que ton combattant réclame se propose au matchmaker",
      !!r && r.reclameVu, "c'était le manque : il demandait un nom, tu ne pouvais pas le transmettre");
  /* /!\ REECRITE LE 01/09 : elle exigeait une faveur EN ATTENTE. Depuis
     le cas 159, un nom accepté est servi À TABLE — l'offre part
     sur-le-champ et la faveur est consommée dans la foulée. Les deux
     issues sont bonnes ; ce qui compte, c'est que la demande ABOUTISSE
     et que la réclamation de l'homme soit effacée. */
  dit("la demande acceptée aboutit — offre immédiate ou faveur en attente — et efface la réclamation",
      !!r && (r.offreDirecte || r.faveurPosee) && r.reclameEfface,
      r ? (r.offreDirecte ? "servie à table"
           : r.faveurPosee ? "faveur posée, à honorer"
           : "REFUSÉE — la relation ne suffisait pas") : "");
  dit("demander coûte du crédit, et la date est retenue",
      !!r && r.aCoute && r.dateNotee);
  dit("et on ne redemande pas dans la foulée", !!r && r.barre);
  /* /!\ ET LE REFUS EST UNE REGLE, PAS UN ACCIDENT : viser bien plus
     haut que son rang se fait refuser, meme avec une excellente
     relation. C'est ce qui empeche le ciblage de devenir un menu. */
  dit("viser un homme bien mieux classé se fait refuser — même en étant apprécié",
      MATCH.juger("adversaire", 95, { rangEcart: 12 }).accepte === false
      && MATCH.juger("adversaire", 95, { rangEcart: 1 }).accepte === true,
      "le ciblage n'est pas un menu déroulant");
  dit("une faveur « haut de carte » change VRAIMENT l'offre suivante",
      !!r && !!r.offre && r.offre.place === "main_event" && !!r.offre.faveur,
      r && r.offre ? `${r.offre.place} · ${r.offre.faveur}` : "aucune offre reçue");
  dit("et elle se consomme — un oui ne vaut pas pour toute la carrière",
      !!r && r.consommee);
  dit("aucune exception chez le matchmaker", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LES TROIS RAPPORTS DU 01/09 (Mael, en jouant) : l'age qui fuit, le    */
/* nom qu'on choisit a table, et le combat qui se cale TOUT DE SUITE.    */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 71 });
  jouer(P, 150, 71);
  const r = P.lire(`(function(){
    /* 1. L'AGE NE FUIT PLUS — « 27.589041095890412 ans » sur une fiche. */
    const idm=[...MONDE.pros.values()].find(p=>!p.salle&&!p.retraite);
    idm.age=27.589041095890412;
    ouvrirFicheMonde(idm.id,"","");
    const h=$("fiche").innerHTML;
    const ageSale=/\d+[.,]\d+\s*ans/.test(h);
    const ageBon=h.indexOf("27 ans")>=0;
    /* 2. L'ECRAN DE CHOIX MONTRE LA CATEGORIE DE MON HOMME. */
    completerRelation();
    const cle=Object.keys(MESGARS).find(k=>MESGARS[k]&&MESGARS[k].org&&!MESGARS[k].amateur);
    if(!cle)return {pasDeGars:true};
    const l=MESGARS[cle], org=l.org, e=RELATION[org];
    l.combatPrevu=null; l.camp=null; l.renego=null; l.vie.dispo=0;
    delete l.derniereOffre; OFFRES.length=0;
    e.valeur=88; delete e.demandeLe;
    ouvrirChoixAdversaire(org,cle);
    const liste=$("fiche").innerHTML;
    const roster=((MONDE.rosters[org]||{})[l.division])||[];
    const advs=roster.map(x=>MONDE.pros.get(x)).filter(x=>x&&x.id!==l.id&&!x.retraite);
    const listeOk=advs.length>0&&advs.some(a=>liste.indexOf(a.nom)>=0)
      &&liste.indexOf("demanderAuMatch")>=0;
    /* 3. LE COMBAT SE CALE A TABLE — c'etait le reproche : "le lendemain
       il s'est rien passe". */
    const vise=advs.find(a=>{
      const dispo=(a.vie&&a.vie.dispo)||0;
      return t.jour>=dispo&&(l.vie.advPrec!==a.id)&&!a.salle;
    });
    if(!vise)return {ageSale,ageBon,listeOk,pasDeCible:true};
    demanderAuMatch(org,cle,"adversaire",vise.id);
    const offre=OFFRES.find(o=>o.cle===cle);
    const ecran=$("fiche").innerHTML;
    return {ageSale,ageBon,listeOk,
      offrePosee:!!offre&&offre.adversaire===vise.id,
      surEcran:ecran.indexOf("L'offre est déjà là")>=0,
      accepteDepuisLecran:ecran.indexOf("repondreOffre")>=0,
      faveurConsommee:!MESGARS[cle].faveurMatch};
  })()`);
  dit("l'âge ne s'affiche plus avec ses décimales",
      !!r && !r.ageSale && r.ageBon,
      "« 27.589041095890412 ans » relevé par Mael sur une fiche de scouting");
  dit("demander un nom ouvre la catégorie de ton homme chez eux",
      !!r && r.listeOk);
  if (r && r.pasDeCible) {
    dit("le combat se cale à table", false, "aucun adversaire jouable — graine à revoir");
  } else {
    dit("et le combat se cale À TABLE : l'offre existe immédiatement",
        !!r && r.offrePosee,
        "c'était le reproche : « le lendemain il s'est rien passé »");
    dit("elle s'affiche dans sa réponse, et on peut répondre sans sortir",
        !!r && r.surEcran && r.accepteDepuisLecran);
    dit("une faveur servie sur-le-champ est consommée",
        !!r && r.faveurConsommee);
  }
  dit("aucune exception sur le choix d'adversaire", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* LE NOM SUR LA TABLE (Mael, 02/09 : « des trucs dans les coachs ou je   */
/* parle de quelqu'un, on sait pas qui c'est ; j'aimerais pouvoir parler  */
/* de n'importe quel combattant du groupe pro, au moins selectionner »)   */
/* ==================================================================== */
/* /!\ CE BLOC MESURE LA MOITIE QU'AUCUN BANC DE MODULE NE PEUT VOIR :
   coach_dialogue.js et coach_scenes.js sont purs, ils ne savent pas qui
   est dans la salle. Le defaut vivait DANS L'ECRAN — le sujet ne
   demandait jamais lequel, et les quatre effets qui touchent un homme le
   choisissaient eux-memes. Un banc de module l'aurait rate a vie. */
{
  const P = ouvrirPartie({ mode: "demo", graine: 33 });
  jouer(P, 120, 33);
  const r = P.lire(`(function(){
    const c=staffDe().find(x=>!x.moi);
    if(!c)return {pasDeCoach:true};
    ouvrirBureauCoach(c);
    /* 1. OUVRIR LE SUJET DEMANDE D'ABORD QUI. */
    sujetBureauCoach("un_gars");
    const demandeQui=!!BUREAU.choixGars;
    const liste=$("cp-dedans").innerHTML;
    const choisissables=garsDontOnPeutParler();
    if(!choisissables.length)return {demandeQui,personne:true};
    /* Tous ceux qu'on a sous contrat sont proposes, les pros d'abord. */
    const tousNommes=choisissables.every(f=>liste.indexOf((FICHES[f.id]||{}).nom)>=0);
    const proDabord=choisissables[0].gr==="pro"||!choisissables.some(f=>f.gr==="pro");
    /* 2. ON EN CHOISIT UN, ET C'EST SON NOM QUI S'AFFICHE. */
    const vise=choisissables[choisissables.length-1];
    const nom=(FICHES[vise.id]||{}).nom;
    choisirGarsBureau(vise.id);
    const ecran=$("cp-dedans").innerHTML;
    const surLaTable=ecran.indexOf(nom)>=0;
    const accolade=ecran.indexOf("{gars}")>=0;
    const scene=BUREAU.E.encours;
    /* 3. L'EFFET TOUCHE CET HOMME-LA. On le prouve sur menager_un_gars :
          on fabrique un AUTRE homme a bout, celui que l'ancien code
          aurait pris tout seul, et on verifie qu'il n'est PAS touche. */
    const autre=EFFECTIF.find(f=>f.id!==vise.id&&MESGARS[f.id]&&!MESGARS[f.id].retraite);
    if(autre){ autre.fraicheur=10; delete MESGARS[autre.id].menage; }
    delete MESGARS[vise.id].menage;
    const eff=appliquerEffetDialogue(c,"menager_un_gars",vise.id);
    const bonHomme=!!MESGARS[vise.id].menage;
    const pasLautre=!autre||!MESGARS[autre.id].menage;
    /* 4. ET UN EFFET QUI NE PEUT PAS S'APPLIQUER A CET HOMME LE DIT,
          au lieu de le faire sur un autre en silence. */
    MESGARS[vise.id].combatPrevu=null;
    const refus=appliquerEffetDialogue(c,"le_mettre_au_coin",vise.id);
    /* 4 bis. CONFIER UN GARS DIT CE QUE CA FAIT, ET NE LACHE PERSONNE EN
              SILENCE (Mael : « ca fait quoi au juste ? »). Un coach n'a
              qu'un poulain : le second rendait le premier sans un mot. */
    c.poulain=null;
    const un=appliquerEffetDialogue(c,"lui_confier_un_gars",vise.id);
    const ditLeffet=/plus vite/.test(un.mot||"")&&/moins vite/.test(un.mot||"");
    const second=EFFECTIF.find(f=>f.id!==vise.id&&MESGARS[f.id]&&!MESGARS[f.id].retraite
      &&!staffDe().some(a=>a!==c&&a.poulain===f.id));
    const deux=second?appliquerEffetDialogue(c,"lui_confier_un_gars",second.id):null;
    const ditLeLache=!second||((deux.mot||"").indexOf(vise.id)>=0);
    /* 5. AUCUNE ACCOLADE NULLE PART. On traverse tous les sujets et on
          verifie que rien de ce qui s'affiche ne porte un marqueur non
          rempli — c'est la faute qui se voit le plus vite a l'ecran. */
    let brut=0, vus=0;
    for(const x of MMA.coach_dialogue.SUJETS){
      if(BUREAU.E.sujetsFaits.indexOf(x.cle)>=0)continue;
      sujetBureauCoach(x.cle);
      if(BUREAU.choixGars){ choisirGarsBureau(vise.id); }
      let g=0;
      while(BUREAU.E.encours&&g++<6){
        const h=$("cp-dedans").innerHTML; vus++;
        if(h.indexOf("{gars}")>=0||h.indexOf("{autre}")>=0)brut++;
        repondreBureauCoach(0);
        const h2=$("cp-dedans").innerHTML; vus++;
        if(h2.indexOf("{gars}")>=0||h2.indexOf("{autre}")>=0)brut++;
        suiteBureauCoach();
      }
    }
    /* Combien de sujets ont des scenes : tant que le corpus est partiel
       (Mael relit), on ne traverse que ceux-la. */
    const servis=MMA.coach_dialogue.SUJETS.filter(x=>
      (MMA.coach_scenes.SCENES.bureau||[]).some(sc=>sc.sujet===x.cle)).length;
    fermerBureauCoach();
    return {demandeQui,tousNommes,proDabord,surLaTable,accolade,brut,vus,servis,
      sceneDuSujet:!!scene&&scene.sujet==="un_gars",
      applique:eff.ok,bonHomme,pasLautre,ditLeffet,ditLeLache,
      refusDit:!refus.ok&&(refus.mot||"").indexOf(vise.id)>=0};
  })()`);
  if (r && (r.pasDeCoach || r.personne)) {
    dit("on peut parler d'un homme précis à son coach", false,
        r.pasDeCoach ? "aucun coach dans la partie" : "personne sous contrat — graine à revoir");
  } else {
    dit("« lui parler d'un de tes hommes » demande d'abord LEQUEL",
        !!r && r.demandeQui, "avant : la scène parlait d'un inconnu");
    dit("tout l'effectif sous contrat est proposé, les pros d'abord",
        !!r && r.tousNommes && r.proDabord);
    dit("et c'est SON nom qui s'affiche dans la scène",
        !!r && r.surLaTable && !r.accolade && r.sceneDuSujet);
    dit("l'effet touche l'homme nommé, et pas celui que le jeu aurait choisi",
        !!r && r.applique && r.bonHomme && r.pasLautre,
        "avant : menager_un_gars prenait le premier cuit venu");
    dit("et s'il ne peut pas s'appliquer à lui, il le dit au lieu de viser un autre",
        !!r && r.refusDit);
    dit("confier un homme dit ce que ça lui fait gagner, et ce que ça lui coûte",
        !!r && r.ditLeffet, "avant : « X passe sous son aile », et rien d'autre");
    dit("et le poulain qu'on lâche pour le prendre n'est jamais lâché en silence",
        !!r && r.ditLeLache, "un coach n'en suit qu'un");
    dit("aucun marqueur ne reste à l'écran, sur tous les sujets traversés",
        !!r && r.brut === 0 && r.vus >= 2 * (r.servis - 1),
        `${r ? r.vus : 0} écrans lus sur ${r ? r.servis : "?"} sujet(s) servis · ${r ? r.brut : "?"} accolade(s)`);
  }
  dit("aucune exception dans le bureau du coach", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

/* ==================================================================== */
/* JUSQU'OÙ TA SALLE SAIT L'EMMENER (Mael, 03/09 : « il faut un écart     */
/* bien plus grand que ça »)                                             */
/* ==================================================================== */
/* /!\ LE BANC 20 TIENT LA LOI ; CELUI-CI TIENT SON BRANCHEMENT ET SON
   AFFICHAGE — les deux moitiés qu'un module pur ne peut pas voir. Et il
   vérifie surtout LA CHOSE QUI REND LE PLAFOND ACCEPTABLE : qu'il n'est
   pas définitif. Un mur qu'on ne peut jamais déplacer transformerait un
   mauvais début de partie en partie perdue sans le dire. */
{
  const P = ouvrirPartie({ mode: "demo", graine: 12 });
  jouer(P, 60, 12);
  const r = P.lire(`(function(){
    const cle=Object.keys(MESGARS).find(k=>MESGARS[k]&&!MESGARS[k].retraite
      &&(EFFECTIF.find(f=>f.id===k)||{}).gr==="pro");
    if(!cle)return {pasDeGars:true};
    const l=MESGARS[cle], fic=MMA.salle.ficheDe(MONDE,l.id);
    const couv=couvertureDuStaff();
    const niv=MMA.coach.niveauEncadrement(couv,"pro","striking");
    const pot=MMA.carriere.potentielDe(fic,"striking",cle);
    const cap=MMA.carriere.plafond(pot,niv);
    /* 1. LE PLAFOND EST BRANCHE : on met l'homme AU-DESSUS de ce que la
          salle sait lui apprendre, on l'entraine, et il ne doit pas
          bouger d'un pouce. */
    for(const k of Object.keys(fic.striking))
      if(typeof fic.striking[k]==="number")fic.striking[k]=Math.min(99,cap+6);
    /* /!\ ON MESURE LE BLOC ENTIER, PAS UN ATTRIBUT. appliquerTravail
       choisit deux ou trois cles par seance : en verifier UNE seule,
       c'est tirer a pile ou face si la seance l'a touchee.
       /!\ ET AUCUN ACCENT GRAVE DANS CE COMMENTAIRE : on est DANS un
       gabarit delimite par des accents graves, il refermerait la chaine.
       Faute commise deux fois de suite le 03/09 — elle ne se voit pas a
       la relecture, seulement au chargement du fichier. */
    const somme=()=>Object.keys(fic.striking)
      .reduce((a,k)=>a+(typeof fic.striking[k]==="number"?fic.striking[k]:0),0);
    const avant=somme();
    appliquerTravail(cle,"striking",3);
    const bloque=Math.abs(somme()-avant)<1e-9;
    const dit=!!(l.bute&&l.bute.striking);
    /* 2. L'ECRAN LE DIT. Un mur invisible ressemble a un entrainement
          casse — c'est la seule raison pour laquelle ce plafond est
          jouable. */
    ouvrirFiche(cle);
    const h=$("fiche").innerHTML;
    const surLaFiche=h.indexOf("sait lui apprendre")>=0&&h.indexOf("au bout")>=0;
    /* 3. CE N'EST PAS DEFINITIF : on offre un bien meilleur staff, le
          plafond remonte, et le meme homme repart. */
    for(const c of staffDe())if(!c.moi){c.niveau=96;c.potentiel=96;}
    couvertureBouge();
    const niv2=MMA.coach.niveauEncadrement(couvertureDuStaff(),"pro","striking");
    const cap2=MMA.carriere.plafond(pot,niv2);
    const avant2=somme();
    appliquerTravail(cle,"striking",3);
    const repart=somme()>avant2;
    fermerFiche();
    return {bloque,dit,surLaFiche,repart,
      monte:cap2>cap, niv, niv2, cap:Math.round(cap*10)/10, cap2:Math.round(cap2*10)/10};
  })()`);
  if (r && r.pasDeGars) {
    dit("le plafond de la salle se mesure sur un pro", false, "aucun pro — graine à revoir");
  } else {
    dit("un homme au bout de ce que la salle enseigne ne progresse plus",
        !!r && r.bloque, `encadrement ${r ? r.niv : "?"} → plafond ${r ? r.cap : "?"}`);
    dit("et le jeu retient sur quoi il a buté", !!r && r.dit);
    dit("sa fiche le dit en clair — un mur invisible serait pire que pas de mur",
        !!r && r.surLaFiche);
    dit("un meilleur staff relève le plafond : rien n'est définitif",
        !!r && r.monte && r.repart,
        r ? `encadrement ${r.niv} → ${r.niv2}, plafond ${r.cap} → ${r.cap2}` : "");
  }
  dit("aucune exception sur le plafond de la salle", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — la partie se joue, et ce qui doit se voir se voit."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
