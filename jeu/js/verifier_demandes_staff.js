/**
 * verifier_demandes_staff.js — BANC 29 : CE QUE TON STAFF TE DEMANDE.
 *
 * /!\ LE BANC EXISTE POUR UNE SEULE PHRASE DU CARNET, ecrite six fois :
 * « les demandes portaient un nom d'effet que personne n'appliquait ».
 * Il refuse donc qu'une demande existe sans que son OUI change quelque
 * chose de MESURABLE dans la salle. Il ne se contente pas de verifier le
 * module : il joue une partie (bac_partie.js) et regarde la salle bouger.
 */
const D = require("./demandes_staff.js");
const { ouvrirPartie, trancherBlocage } = require("./bac_partie.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

console.log("BANC 29 — le staff demande, et ton oui coûte vraiment.");

/* ==================================================================== */
/* 1. LE MODULE : forme, tri, et pas de demande hors-sol                 */
/* ==================================================================== */
{
  const cles = Object.keys(D.DEMANDES_STAFF);
  let malForme = null;
  for (const [cle, d] of Object.entries(D.DEMANDES_STAFF)) {
    const ok = d.famille && d.titre && d.dit && typeof d.probable === "function"
      && d.oui && d.oui.effet && d.oui.dit_coach && d.oui.cout
      && typeof d.oui.entente === "number"
      && d.non && d.non.dit_coach && typeof d.non.entente === "number"
      && d.non.entente < 0;
    if (!ok) malForme = cle;
  }
  dit(`les ${cles.length} demandes portent leurs quatre choses`, malForme === null,
      malForme || "titre · ce qu'il dit · le prix du oui · le prix du non");

  /* Un coach sans probleme ne demande RIEN. C'est la regle 1 : une
     demande est probable ou non, jamais tiree dans un chapeau. */
  const heureux = { nom: "X", axe: "striking", axes: ["striking"], niveau: 60,
    salaire: 999, metier: "formateur", groupe: "amateur", semainesMaison: 20,
    semainesTous: 0, entente: 70 };
  dit("un coach qui n'a aucun grief ne demande rien",
      D.possibles(heureux, { bareme: 100, equip: { striking: 3, lutte: 3, physique: 3 },
        eleves: 5, staffSurSonAxe: 2, effectif: 10, places: 90 }).length === 0);

  /* Le patron ne se demande rien a lui-meme. */
  dit("on ne se demande rien à soi-même",
      D.possibles({ moi: true, nom: "Le patron", axe: "striking", niveau: 40, salaire: 0 },
        { bareme: 200 }).length === 0);

  /* Sans bareme au contexte, l'augmentation ne sort pas : le module ne
     recalcule PAS le salaire de reference (deuxieme source interdite). */
  const pauvre = Object.assign({}, heureux, { salaire: 10 });
  dit("sans barème fourni, il ne réclame pas d'augmentation",
      !D.possibles(pauvre, {}).some((x) => x.cle === "augmentation"));
  dit("avec le barème, il la réclame",
      D.possibles(pauvre, { bareme: 100 }).some((x) => x.cle === "augmentation"));

  /* La plus pressante d'abord : celle dont le NON coute le plus. */
  const charge = Object.assign({}, heureux, { salaire: 10, groupe: "tous", semainesTous: 9 });
  const l = D.possibles(charge, { bareme: 100, equip: { striking: 1 }, eleves: 30,
    staffSurSonAxe: 1, effectif: 10, places: 90, crame: "Y", crameNom: "Y" });
  dit("la plus pressante passe devant", l.length > 1
      && l[0].non.entente <= l[l.length - 1].non.entente,
      l.map((x) => `${x.cle}(${x.non.entente})`).join(" "));

  /* "plus tard" n'existe que la ou il a un sens, et c'est une DONNEE. */
  const p = D.repondre(charge, "augmentation", "plus_tard", 100);
  dit("« plus tard » crée une promesse datée",
      !!p.promesse && p.promesse.echeance > 100 && p.promesse.tenue === false,
      JSON.stringify(p.promesse));
  let jeta = false;
  try { D.repondre(charge, "prime_ceinture", "plus_tard", 100); } catch (e) { jeta = true; }
  dit("on ne remet pas à plus tard ce qui ne se remet pas", jeta);
}

/* ==================================================================== */
/* 2. DANS LA SALLE : CHAQUE EFFET BOUGE QUELQUE CHOSE                   */
/* ==================================================================== */
{
  const P = ouvrirPartie({ mode: "demo", graine: 5 });
  /* On avance un peu : le staff doit exister et avoir de l'ancienneté. */
  for (let i = 0; i < 30; i++) {
    P.essai("continuer");
    /* /!\ LA MAIN PARTAGEE (bac_partie.js), pas une copie : la premiere
       version de ce banc avait recopie la sortie des blocages en oubliant
       la visite — 192 exceptions, et l'echec accusait le jeu. */
    for (let g = 0; g < 6 && trancherBlocage(P, 0.3); g++);
  }
  P.essai("migrerStaff");
  dit("la partie a un staff", P.lire("staffDe().filter(c=>!c.moi).length") > 0,
      `${P.lire("staffDe().length")} au staff`);

  /* /!\ AUCUNE CLE D'EFFET NE TOMBE DANS LE VIDE. On demande au jeu
     lui-meme : appliquerEffetStaff connait-il chaque effet declare ?
     Un effet inconnu passe par le `default`, qui journalise — on compte
     les erreurs de console, elles sont capturees par le bac. */
  const inconnus = P.lire(`(function(){
    const avant=[];
    const cles=Object.keys(MMA.demandes_staff.DEMANDES_STAFF);
    const effets=cles.map(k=>MMA.demandes_staff.DEMANDES_STAFF[k].oui.effet);
    const traite=String(appliquerEffetStaff);
    return effets.filter(e=>traite.indexOf('case "'+e+'"')<0);
  })()`);
  dit("chaque effet déclaré est traité par la salle", inconnus.length === 0,
      inconnus.length ? "sans suite : " + inconnus.join(", ") : "toutes les clés");

  /* Effet par effet : on prepare l'etat, on applique, on mesure. */
  const mesures = [
    ["salaire_bareme", `(function(){
        const c=staffDe().find(x=>!x.moi); c.niveau=60; c.salaire=10;
        const a=c.salaire; const r=appliquerEffetStaff(c,"salaire_bareme");
        return {ok:r.ok, bouge:c.salaire>a, detail:a+" -> "+c.salaire};})()`],
    ["prime_titre", `(function(){
        const c=staffDe().find(x=>!x.moi); c.salaire=50; argent=100000;
        const a=argent; const r=appliquerEffetStaff(c,"prime_titre");
        return {ok:r.ok, bouge:argent<a, detail:(a-argent)+" €"};})()`],
    ["un_groupe", `(function(){
        const c=staffDe().find(x=>!x.moi); c.groupe="tous";
        const r=appliquerEffetStaff(c,"un_groupe");
        return {ok:r.ok, bouge:c.groupe!=="tous", detail:c.groupe};})()`],
    ["un_axe", `(function(){
        const c=staffDe().find(x=>!x.moi); c.axes=["striking","sol"];
        const r=appliquerEffetStaff(c,"un_axe");
        return {ok:r.ok, bouge:c.axes.length===1, detail:c.axes.join("+")};})()`],
    ["materiel", `(function(){
        const c=staffDe().find(x=>!x.moi); c.axes=["striking"];c.axe="striking";
        SALLE.equip.striking=1; argent=100000;
        const a=SALLE.equip.striking, m=argent;
        const r=appliquerEffetStaff(c,"materiel");
        return {ok:r.ok, bouge:SALLE.equip.striking>a&&argent<m,
                detail:a+"★ -> "+SALLE.equip.striking+"★, "+(m-argent)+" €"};})()`],
    ["menager", `(function(){
        const c=staffDe().find(x=>!x.moi); c.groupe="tous";
        const f=EFFECTIF[0]; f.fraicheur=10;
        MESGARS[f.id]=MESGARS[f.id]||{id:1,nom:f.id,vie:{}}; MESGARS[f.id].menage=false;
        const r=appliquerEffetStaff(c,"menager");
        return {ok:r.ok, bouge:!!MESGARS[f.id].menage, detail:f.id};})()`],
    ["poulain", `(function(){
        const c=staffDe().find(x=>!x.moi); c.groupe="tous"; c.niveau=70; c.poulain=null;
        const f=EFFECTIF.find(x=>MESGARS[x.id]&&FICHES[x.id]);
        FICHES[f.id].age=21; MESGARS[f.id].potentiel=95;
        const r=appliquerEffetStaff(c,"poulain");
        return {ok:r.ok, bouge:!!c.poulain, detail:String(c.poulain)};})()`],
    ["au_coin", `(function(){
        const c=staffDe().find(x=>!x.moi); c.metier="competition"; c.groupe="tous";
        c.salaire=50; argent=100000; c.coinDe=null;
        const e=Object.entries(MESGARS).find(([,l])=>!l.retraite);
        if(!e)return {ok:false,bouge:false,detail:"aucun homme"};
        e[1].combatPrevu={jourCombat:t.jour+10,org:"X",adversaire:1,trace:{nom:"Y"}};
        const m=argent; const r=appliquerEffetStaff(c,"au_coin");
        return {ok:r.ok, bouge:!!c.coinDe&&argent<m, detail:String(c.coinDe)};})()`],
  ];
  for (const [effet, expr] of mesures) {
    const r = P.lire(expr);
    dit(`« ${effet} » change vraiment quelque chose`, !!(r && r.ok && r.bouge),
        r ? r.detail : "pas évalué");
  }

  /* /!\ UN OUI QUI NE PEUT RIEN FAIRE N'ACHETE RIEN. Caisse vide : la
     prime ne part pas, et l'entente ne monte pas non plus. */
  const vide = P.lire(`(function(){
    const c=staffDe().find(x=>!x.moi); c.salaire=500; argent=0;
    const av=ententeCoach(c);
    c.demandeEnCours="prime_ceinture"; repondreDemandeStaff(staffDe().indexOf(c),"oui");
    return {avant:av, apres:ententeCoach(c), argent};})()`);
  dit("un oui que la caisse ne peut pas honorer ne fait pas monter l'entente",
      vide.apres < vide.avant && vide.argent === 0,
      `${vide.avant} -> ${vide.apres}`);

  /* Le refus se souvient : la meme demande ne revient pas la semaine
     d'apres (les 11 demandes en attente du 09/08). */
  const refus = P.lire(`(function(){
    const c=staffDe().find(x=>!x.moi); c.refusees=[]; c.demandeEnCours="un_seul_groupe";
    c.groupe="tous"; c.semainesTous=9;
    repondreDemandeStaff(staffDe().indexOf(c),"non");
    return {refusees:c.refusees.slice(), enCours:c.demandeEnCours};})()`);
  dit("une demande refusée est retenue et ne revient pas",
      refus.refusees.includes("un_seul_groupe") && !refus.enCours,
      refus.refusees.join(","));

  /* La parole donnee a une date, et le jour venu elle se paie. */
  const parole = P.lire(`(function(){
    const c=staffDe().find(x=>!x.moi);
    c.entente=60; c.promesse={quoi:"augmentation",n:8,echeance:t.jour-1,tenue:false};
    verifierPromessesStaff();
    return {entente:c.entente, promesse:c.promesse};})()`);
  dit("une promesse non tenue se paie à l'échéance",
      parole.entente < 60 && parole.promesse === null, `entente 60 -> ${parole.entente}`);

  /* ET CA SE VOIT A L'ACCUEIL : sinon personne ne saura jamais qu'il a
     demande quelque chose (le defaut "ça devrait pop en gros"). */
  const bulle = P.lire(`(function(){
    for(const k of Object.keys(MESGARS)){MESGARS[k].demandeEnCours=null;
      MESGARS[k].combatPrevu=null; MESGARS[k].renego=null;}
    bloque=null; OFFRES.length=0;
    const c=staffDe().find(x=>!x.moi);
    c.demandeEnCours="un_seul_groupe"; c.groupe="tous";
    rendreSalle();
    return document.getElementById("zone-attend").innerHTML;})()`);
  dit("sa demande s'affiche à l'accueil, pas derrière un bouton de fiche",
      bulle.includes("ton staff") && bulle.includes("ouvrirDemandeStaff"),
      bulle.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80));

  dit("aucune exception pendant tout ça", P.erreurs.length === 0,
      [...new Set(P.erreurs)].slice(0, 3).join(" | "));
}

console.log(echecs === 0
  ? "CONFORME — le staff demande, la salle répond, et ça se paie."
  : `${echecs} ECHEC(S)`);
process.exit(echecs ? 1 : 0);
