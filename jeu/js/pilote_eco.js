/**
 * pilote_eco.js — LE METRE DE L'ECONOMIE. Deux pilotes, memes graines.
 *
 *     node js/pilote_eco.js naive 7 1200      le singe historique
 *     node js/pilote_eco.js bon   7 1200      une politique de patron :
 *        prix ~95 % du prix accepte · materiel quand la caisse le permet
 *        · demenagement quand PLEIN et caisse >= caution + 4 loyers.
 *
 * CE N'EST PAS UN BANC : c'est un instrument de mesure, comme mesure.js.
 * Il ne tourne pas dans lancer_verifs (trop long, et il ne verifie pas un
 * invariant — il raconte une partie).
 *
 * LA MESURE DU 26/08 (graine 7, 1200 jours) ET L'ARBITRAGE DE MAEL sont
 * au carnet : LE GARAGE EST VOULU. Ne pas rouvrir sans faits nouveaux.
 */
const {ouvrirPartie,trancherBlocage}=require('./bac_partie.js');
const mode=process.argv[2]||'naive', graine=Number(process.argv[3]||7), jours=Number(process.argv[4]||1200);
const P=ouvrirPartie({mode:'neuf',graine});
let s=graine; const al=()=>((s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff);
let garde=0, prochain=120; let creux=1e9;
function pros(){
  for(const cle of P.lire('OFFRES.map(o=>o.cle)'))P.essai('repondreOffre',cle,al()<0.9);
  const dem=P.lire('Object.entries(MESGARS).filter(([,l])=>l.demandeEnCours).map(([c])=>c)');
  for(const cle of dem)P.essai('repondreDemande',cle,P.lire(`(MESGARS[${JSON.stringify(cle)}].demandeEnCours)`),al()<0.6?'oui':'non',2);
  for(const cle of P.lire('Object.entries(MESGARS).filter(([,l])=>l.renego).map(([c])=>c)'))P.essai('renouvelerContrat',cle);
  for(const cle of P.lire('contratsAmarquer()'))if(al()<0.9)P.essai('signerSalle',cle,0.2,4);
  const qs=P.lire('staffDe().findIndex(c=>c.demandeEnCours)');
  if(qs>=0)P.essai('repondreDemandeStaff',qs,al()<0.65?'oui':'non');
  if(al()<0.3){const am=P.lire('EFFECTIF.filter(f=>f.gr==="amateur").map(f=>f.id)');
    if(am.length)P.essai('passerPro',am[Math.floor(al()*am.length)]);}
  if(al()<0.4){
    const li=P.lire('Object.entries(MESGARS).filter(([,l])=>!l.amateur&&!l.retraite&&!l.org).map(([c])=>c)');
    const orgs=P.lire('Object.keys(MMA.classement.ORGS)');
    if(li.length)P.essai('demarcherOrga',li[Math.floor(al()*li.length)],orgs[Math.floor(al()*orgs.length)]);}
}
function patron(){
  /* 1. LE PRIX : ~95 % du prix accepte — jamais plus d'un cran par semaine. */
  const reco=P.lire('forfaitReco()'), forfait=P.lire('SALLE.forfait');
  const vise=Math.round(reco*0.95/10)*10;
  if(Math.abs(vise-forfait)>=20)P.essai('reglerPrix',Math.max(-100,Math.min(100,vise-forfait)));
  /* 2. LE MATERIEL : l'etoile la moins chere, avec 1 500 € de reserve. */
  const argent=P.lire('argent');
  const eq=P.lire('JSON.stringify(SALLE.equip)');
  const paliers=P.lire(`JSON.stringify(Object.entries(PALIERS).map(([k,v])=>({k,n:SALLE.equip[k],prix:v[SALLE.equip[k]]?v[SALLE.equip[k]].prix:null})))`);
  const dispo=JSON.parse(paliers).filter(x=>x.prix!==null).sort((a,b)=>a.prix-b.prix)[0];
  if(dispo&&argent>dispo.prix+1500)P.essai('monter',dispo.k);
  /* 3. LES MURS : plein -> palier suivant si la caisse tient l'entree + 3 mois. */
  const cot=P.lire('cotisants()'), cap=P.lire('capacite()');
  if(cot>=cap-1){
    const suivant=P.lire(`JSON.stringify((function(){const i=LOCAUX.findIndex(l=>l.id===SALLE.local);
      return LOCAUX[i+1]||null;})())`);
    const nx=JSON.parse(suivant);
    if(nx&&argent>=nx.caution+nx.loyer*4)P.essai('demenager',nx.id);
  }
}
while(P.lire('t.jour')<jours&&garde++<jours*10){
  P.essai('continuer');
  for(let g=0;g<8&&trancherBlocage(P,al());g++);
  pros();
  if(mode==='bon'&&P.lire('t.jour')%7===2)patron();
  const a=P.lire('argent'); if(a<creux)creux=a;
  const j=P.lire('t.jour');
  if(j>=prochain){prochain+=120;
    console.log(mode.padEnd(5),'g'+graine,'| j'+String(j).padStart(4),
      '| caisse',String(Math.round(a)).padStart(7),'| creux',String(Math.round(creux)).padStart(7),
      '| local',P.lire('SALLE.local').padEnd(8),
      '| adh',String(P.lire('cotisants()')).padStart(3)+'/'+P.lire('capacite()'),
      '| forfait',P.lire('SALLE.forfait'),'| reco',P.lire('forfaitReco()'),
      '| rep',Math.round(P.lire('SALLE.reputation')),
      '| pros',P.lire('EFFECTIF.filter(f=>f.gr==="pro").length'),
      '| obj',P.lire('objectifsVus().length'));}
}
console.log('FIN',mode,'g'+graine,'| objectifs:',P.lire('JSON.stringify(objectifsVus())'),
  '| mur:',P.lire('murDeLaSalle().length'),'| err',P.erreurs.length,
  [...new Set(P.erreurs)].slice(0,2).join(' | '));
