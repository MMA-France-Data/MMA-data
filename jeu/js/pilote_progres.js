/**
 * pilote_progres.js — A QUELLE VITESSE ILS PROGRESSENT, VRAIMENT.
 *
 *     node js/pilote_progres.js [graine] [annees]
 *
 * (Mael, 03/09 : « on avait dit que les progres etaient un peu lents,
 * fais des tests, on debriefe apres, modifie rien. »)
 * Instrument hors chaine : il MESURE, il ne change rien. Une partie demo
 * jouee au rythme du singe, le staff tel qu'il est, et pour CHAQUE homme
 * de la salle : son niveau par domaine au depart et chaque annee, le
 * plafond que la salle sait lui offrir, et le nombre de seances recues.
 */
const { ouvrirPartie, trancherBlocage } = require("./bac_partie.js");
const graine = Number(process.argv[2] || 12), annees = Number(process.argv[3] || 2);
const P = ouvrirPartie({ mode: "demo", graine });
let s = graine; const al = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const DOMS = ["striking", "wrestling", "ground", "physical", "mental"];

const releve = () => P.lire(`(function(){
  const out={jour:t.jour, staff:[], gars:[]};
  for(const c of staffDe()) out.staff.push({nom:c.nom, moi:!!c.moi, niveau:c.niveau,
    axes:(MMA.coach.axesDe?MMA.coach.axesDe(c):[c.axe]).join("+"), groupes:MMA.coach.groupesDe(c).join("+")});
  const couv=couvertureDuStaff();
  for(const f of EFFECTIF){
    const l=MESGARS[f.id]; if(!l||l.retraite)continue;
    let fic; try{fic=MMA.salle.ficheDe(MONDE,l.id);}catch(e){continue;}
    const g={id:f.id, gr:f.gr, age:Math.floor(l.age||(FICHES[f.id]||{}).age||0), talent:Math.round((f.talent||1)*100)/100,
      seances7:(f.gains7||[]).length, niv:{}, cap:{}};
    const groupe=f.gr==="pro"?"pro":"amateur";
    for(const a of MMA.coach.AXES){
      const b=fic[a.dom]; if(!b||typeof b!=="object")continue;
      const v=Object.keys(b).map(k=>b[k]).filter(x=>typeof x==="number"&&isFinite(x));
      if(!v.length)continue;
      g.niv[a.dom]=Math.round(v.reduce((x,y)=>x+y,0)/v.length*10)/10;
      const n=MMA.coach.niveauEncadrement(couv,groupe,a.fam);
      g.cap[a.dom]=MMA.carriere.plafond(MMA.carriere.potentielDe(fic,a.dom,f.id),n);
    }
    out.gars.push(g);
  }
  return out;})()`);

const depart = releve();
const courbe = [];
let jour = 0, garde = 0, prochain = 365;
const jours = annees * 365;
while (jour < jours && garde++ < jours * 6) {
  P.essai("continuer");
  for (let g = 0; g < 8 && trancherBlocage(P, al()); g++);
  jour++;
  if (jour % 7 === 0) {
    for (const cle of P.lire("OFFRES.map(o=>o.cle)")) P.essai("repondreOffre", cle, al() < 0.9);
    for (const cle of P.lire('Object.entries(MESGARS).filter(([,l])=>l.renego).map(([c])=>c)')) P.essai("renouvelerContrat", cle);
    for (const cle of P.lire("contratsAmarquer()")) if (al() < 0.9) P.essai("signerSalle", cle, 0.2, 4);
  }
  if (jour >= prochain) { courbe.push(releve()); prochain += 365; }
}

const g6 = (x) => String(x).padStart(6);
console.log(`\n=== PROGRESSION REELLE — partie demo, graine ${graine}, ${annees} an(s) ===`);
console.log(`\nLE STAFF (tel quel, jamais touche) :`);
for (const c of depart.staff) console.log(`  ${c.nom.padEnd(22)} niveau ${String(c.niveau).padStart(3)}  ${c.axes}  ${c.groupes}${c.moi ? "  (toi)" : ""}`);
console.log(`\nCHAQUE HOMME — niveau moyen par domaine : depart → fin, et [plafond que la salle lui offre]`);
console.log(`  ${"".padEnd(12)}${"gr".padEnd(8)}age tal  séances/sem   frappe            lutte             sol               physique          mental`);
const fin = courbe[courbe.length - 1] || depart;
const parId = {}; for (const g of fin.gars) parId[g.id] = g;
let gains = { pro: [], amateur: [], loisir: [] };
for (const g0 of depart.gars) {
  const g1 = parId[g0.id];
  if (!g1) { console.log(`  ${g0.id.padEnd(12)}${g0.gr.padEnd(8)} — parti`); continue; }
  const cell = (d) => g0.niv[d] === undefined ? "        —         " :
    `${String(g0.niv[d]).padStart(5)}→${String(g1.niv[d]).padStart(5)} [${String(g1.cap[d]).padStart(4)}]`;
  console.log(`  ${g0.id.padEnd(12)}${g0.gr.padEnd(8)}${String(g0.age).padStart(3)} ${String(g0.talent).padStart(4)}   ${String(g1.seances7).padStart(3)}     ${DOMS.map(cell).join(" ")}`);
  const dm = DOMS.filter((d) => g0.niv[d] !== undefined && g1.niv[d] !== undefined).map((d) => g1.niv[d] - g0.niv[d]);
  if (dm.length) (gains[g0.gr] || gains.loisir).push(dm.reduce((a, b) => a + b, 0) / dm.length);
}
const moy = (a) => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "—";
console.log(`\nGAIN MOYEN PAR AN, tous domaines confondus :`);
for (const k of ["pro", "amateur", "loisir"]) console.log(`  ${k.padEnd(8)} ${moy(gains[k].map((x) => x / annees))} point(s)/an   (${gains[k].length} hommes)`);
console.log(`\nANNEE PAR ANNEE — moyenne des pros, frappe/lutte/sol :`);
for (const r of [depart, ...courbe]) {
  const pros = r.gars.filter((g) => g.gr === "pro");
  const m = (d) => (pros.reduce((a, g) => a + (g.niv[d] || 0), 0) / Math.max(1, pros.length)).toFixed(1);
  console.log(`  an ${String(Math.floor(r.jour / 365)).padStart(2)}   ${m("striking")}  ${m("wrestling")}  ${m("ground")}`);
}
if (P.erreurs.length) console.log(`\n/!\\ ${P.erreurs.length} exception(s) : ${[...new Set(P.erreurs)].slice(0, 3).join(" | ")}`);
