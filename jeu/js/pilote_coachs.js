/**
 * pilote_coachs.js — CE QUE VAUT UN BON STAFF, SUR UNE CARRIERE.
 *
 *     node js/pilote_coachs.js [graine] [annees]
 *
 * (Mael, 02/09 : « mets-moi un combattant avec bon potentiel dans deux
 * domaines mini, une fois avec des mauvais coachs, une fois avec des
 * bons, et compare les deux sur une carriere. »)
 *
 * /!\ CE N'EST PAS UN BANC. Il ne verifie aucun invariant : il MESURE.
 * Comme pilote_endgame et pilote_eco, il vit hors de lancer_verifs.sh —
 * un instrument qu'on sort quand on veut un chiffre, pas un filet.
 *
 * LE PROTOCOLE, ET IL EST LE POINT DELICAT
 * Deux parties STRICTEMENT identiques : meme graine, meme monde, meme
 * homme, memes decisions jour apres jour. UNE SEULE CHOSE CHANGE — le
 * niveau des coachs qui l'entrainent. Tout ecart mesure a la fin vient
 * donc de la, et de rien d'autre.
 * L'homme : jeune, potentiel 90, et on suit DEUX domaines (la frappe et
 * le sol) pour voir ce que la specialisation du mentor fait a l'autre.
 */
const { ouvrirPartie, trancherBlocage } = require("./bac_partie.js");

const graine = Number(process.argv[2] || 12);
const annees = Number(process.argv[3] || 8);
const jours = annees * 365;

/* Les deux domaines suivis, et leurs attributs — ceux que TRAVAIL touche. */
/* /!\ LES CLES SUIVIES SONT CELLES DE LA FICHE, PAS CELLES D'UN VIEUX PLAN.
   La premiere liste portait guard_retention et back_control, qui n'existent
   pas : la moyenne du sol se faisait sur six cles et disait n'importe quoi. */
const SUIVIS = {
  striking: ["jab", "cross", "crochet", "uppercut", "overhand", "poing_corps", "low_kick", "body_kick",
             "high_kick", "teep", "esquive_tete", "parade", "blocage", "check", "footwork", "enchainements",
             "timing", "vitesse_mains", "vitesse_jambes", "cage_cutting", "spinning", "lecture", "volume"],
  ground: ["passing", "posture_sol", "half_guard_top", "side_control_top", "mount_top", "back_top",
           "closed_guard_bottom", "open_guard_bottom", "butterfly_bottom", "half_guard_bottom",
           "side_control_bottom", "mount_bottom", "back_defense", "turtle_defense", "sweeps", "shrimping",
           "wall_walking", "hand_fighting_sol", "submission_off_top", "submission_off_bottom", "submission_def",
           "explosiveness", "ground_striking"],
};

/**
 * Une carriere entiere avec un staff donne.
 * @param {number} niveau  le niveau des deux coachs (30 = mauvais, 88 = bons)
 * @param {string} nom     l'etiquette de la colonne
 */
function carriere(niveau, nom) {
  const P = ouvrirPartie({ mode: "demo", graine });
  /* /!\ LE TIRAGE DES DECISIONS EST LE MEME DANS LES DEUX PARTIES : il a
     sa propre suite, semee pareil. Sans ca on comparerait deux joueurs
     differents autant que deux staffs. */
  let s = graine;
  const al = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  /* ---- 1. L'HOMME. Le plus jeune pro de la salle, potentiel 90. ---- */
  const sujet = P.lire(`(function(){
    const pros=EFFECTIF.filter(f=>f.gr==="pro"&&MESGARS[f.id]);
    if(!pros.length)return null;
    pros.sort((a,b)=>((FICHES[a.id]||{}).age||99)-((FICHES[b.id]||{}).age||99));
    const f=pros[0], l=MESGARS[f.id];
    l.talent=Math.max(l.talent||0,0.9);
    /* /!\ LE POTENTIEL SE POSE LA OU LA LOI LE LIT : sur le bloc
       carriere de la FICHE, par domaine. Premiere version : il etait
       ecrit sur MESGARS[].potentiel — un champ que seul le repere-espoir
       des coachs consulte, et que la progression ne voit pas. Le pilote
       mesurait donc un homme ordinaire en croyant mesurer un crack.
       /!\ ET PAS D'ACCENT GRAVE DANS CE COMMENTAIRE : on est DANS un
       gabarit delimite par des accents graves, il refermerait la chaine. */
    const fic=MMA.salle.ficheDe(MONDE,l.id);
    fic.carriere=fic.carriere||{};
    fic.carriere.potentiel=Object.assign({},fic.carriere.potentiel,
      {striking:90, ground:90, wrestling:82, physical:82, mental:82});
    fic.carriere.niveaux=fic.carriere.niveaux||{};
    return {id:f.id, nom:(FICHES[f.id]||{}).nom||f.id, age:(FICHES[f.id]||{}).age||0};
  })()`);
  if (!sujet) { console.log("aucun pro dans cette graine"); process.exit(1); }

  /* ---- 2. LE STAFF. Deux coachs, un par domaine suivi. Le mentor est
       celui de la FRAPPE : c'est lui qui donne le bonus sur son axe et
       le malus ailleurs — donc le sol dira ce que la specialisation
       coute vraiment. ---- */
  const staff = P.lire(`(function(){
    /* /!\ ON NE FABRIQUE PAS DE COACHS A LA MAIN. Premier essai : un
       objet ecrit ici, avec nom/axe/niveau. Resultat : des stats a NaN au
       bout d'un an, parce qu'il manquait \`vitesse\` — le champ que le
       marche travaille et que la progression du coach lit. C'est la
       lecon du carnet, encore : IMITER UN OBJET DU JEU, C'EST EN OUBLIER
       LA MOITIE. On prend donc LE STAFF QUE LA PARTIE A DEJA, et on ne
       change QUE son niveau. Ce qui est exactement l'experience demandee. */
    const st=staffDe().filter(c=>!c.moi);
    if(!st.length)return null;
    const n=${JSON.stringify(niveau)};
    for(const c of st){
      c.niveau=n;
      c.potentiel=Math.min(96,n+4);
      c.salaire=MMA.coach.salaire(n,c.metier==="competition");
      c.poulain=null;
    }
    /* Le mentor est celui de la FRAPPE : son axe recevra le bonus, et le
       sol dira ce que la specialisation coute a l'autre domaine. */
    const men=st.find(c=>MMA.coach.axePrincipal(c)==="striking")||st[0];
    men.poulain=${JSON.stringify(sujet.id)};
    couvertureBouge();
    return {n:st.length, mentor:men.nom,
      axes:st.map(c=>c.nom+":"+MMA.coach.axePrincipal(c)).join(" · ")};
  })()`);
  if (!staff) { console.log("aucun coach dans cette partie"); process.exit(1); }

  /* ---- 3. ON JOUE. Les memes gestes, dans le meme ordre. ---- */
  const releve = () => P.lire(`(function(){
    const cle=${JSON.stringify(sujet.id)};
    const l=MESGARS[cle];
    /* /!\ IL PEUT PARTIR OU RACCROCHER EN COURS DE ROUTE : on le dit au
       lieu de planter, sinon la mesure s'arrete a la premiere carriere
       qui se termine — et c'est justement ce qu'on veut observer. */
    if(!l)return {an:Math.floor(t.jour/365),parti:true,frappe:0,sol:0,v:0,d:0,titres:0,
      rep:Math.round(SALLE.reputation)};
    const f=MMA.salle.ficheDe(MONDE,l.id);
    const moy=(dom,cles)=>{const v=cles.map(k=>f[dom]&&f[dom][k]).filter(x=>typeof x==="number");
      return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:0;};
    const b=l.bilan||{v:0,d:0};
    return {an:Math.floor(t.jour/365),
      frappe:moy("striking",${JSON.stringify(SUIVIS.striking)}),
      sol:moy("ground",${JSON.stringify(SUIVIS.ground)}),
      v:b.v, d:b.d, titres:(l.titres||0),
      retraite:!!l.retraite, parti:false,
      rep:Math.round(SALLE.reputation)};
  })()`);

  const depart = releve();
  const courbe = [];
  let garde = 0, prochain = 365;
  while (P.lire("t.jour") < jours && garde++ < jours * 6) {
    P.essai("continuer");
    for (let g = 0; g < 8 && trancherBlocage(P, al()); g++);
    for (const cle of P.lire("OFFRES.map(o=>o.cle)")) P.essai("repondreOffre", cle, al() < 0.9);
    const dem = P.lire('Object.entries(MESGARS).filter(([,l])=>l.demandeEnCours).map(([c])=>c)');
    for (const cle of dem)
      P.essai("repondreDemande", cle, P.lire(`(MESGARS[${JSON.stringify(cle)}].demandeEnCours)`), al() < 0.6 ? "oui" : "non", 2);
    for (const cle of P.lire('Object.entries(MESGARS).filter(([,l])=>l.renego).map(([c])=>c)'))
      P.essai("renouvelerContrat", cle);
    for (const cle of P.lire("contratsAmarquer()")) if (al() < 0.9) P.essai("signerSalle", cle, 0.2, 4);
    if (P.lire("t.jour") >= prochain) { courbe.push(releve()); prochain += 365; }
  }
  const fin = releve();
  return { nom, sujet, staff, depart, fin, courbe, erreurs: P.erreurs.length,
           quoi: [...new Set(P.erreurs)].slice(0, 4) };
}

/* ==================================================================== */
const A = carriere(30, "mauvais staff");
const B = carriere(88, "bon staff");

const g = (x) => String(x).padStart(6);
console.log(`\n=== ${A.sujet.nom}, ${A.sujet.age} ans, potentiel 90 — ${annees} ans, graine ${graine} ===`);
console.log(`    ${A.staff.axes}`);
console.log(`    mentor : ${A.staff.mentor} — mêmes décisions, même monde ; SEUL le niveau change : 30 contre 88\n`);
console.log(`                          frappe     sol   bilan  titres   répu`);
const ligne = (t, r) => console.log(r.parti
  ? `  ${t.padEnd(22)}  — il a quitté la salle avant la fin (retraite ou départ)`
  : `  ${t.padEnd(22)}${g(r.frappe)}${g(r.sol)}${g(r.v + "-" + r.d)}${g(r.titres)}${g(r.rep)}`);
ligne("au départ", A.depart);
ligne("après " + annees + " ans — coachs 30", A.fin);
ligne("après " + annees + " ans — coachs 88", B.fin);

const d = (a, b, k) => Math.round((b[k] - a[k]) * 10) / 10;
if (A.fin.parti || B.fin.parti) console.log(
  `\n  /!\\ COMPARAISON INCOMPLETE : l'homme a quitté l'une des deux salles.`
  + ` Les écarts ci-dessous ne veulent rien dire — relancer sur une autre graine.`);
console.log(`\n  ÉCART DÛ AU STAFF SEUL`);
console.log(`    frappe (l'axe du mentor) : ${d(A.fin, B.fin, "frappe") >= 0 ? "+" : ""}${d(A.fin, B.fin, "frappe")} points`);
console.log(`    sol    (l'autre domaine) : ${d(A.fin, B.fin, "sol") >= 0 ? "+" : ""}${d(A.fin, B.fin, "sol")} points`);
console.log(`    progression sur la carrière — frappe : ${d(A.depart, A.fin, "frappe")} contre ${d(B.depart, B.fin, "frappe")}`);
console.log(`                                  sol    : ${d(A.depart, A.fin, "sol")} contre ${d(B.depart, B.fin, "sol")}`);
console.log(`    bilan : ${A.fin.v}-${A.fin.d} contre ${B.fin.v}-${B.fin.d}`);
console.log(`    réputation de la salle : ${A.fin.rep} contre ${B.fin.rep}`);
if (A.erreurs || B.erreurs) {
  console.log(`\n  /!\\ exceptions : ${A.erreurs} (coachs 30) et ${B.erreurs} (coachs 88)`);
  for (const q of A.quoi) console.log(`      30 · ${q}`);
  for (const q of B.quoi) console.log(`      88 · ${q}`);
}

console.log(`\n  ANNÉE PAR ANNÉE (frappe · sol)`);
for (let i = 0; i < Math.max(A.courbe.length, B.courbe.length); i++) {
  const a = A.courbe[i], b = B.courbe[i];
  if (!a || !b) continue;
  console.log(`    an ${String(a.an).padStart(2)}   coachs 30 : ${g(a.frappe)} ${g(a.sol)}    coachs 88 : ${g(b.frappe)} ${g(b.sol)}`);
}
