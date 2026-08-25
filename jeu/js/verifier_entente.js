/**
 * verifier_entente.js — BANCS 22 ET 23 : L'ENTENTE ET LE DIALOGUE.
 *
 * Ce banc prouve ce que le chantier H exige :
 *   1. l'entente est un RESIDU : meme un echange nul s'inscrit ;
 *   2. le frein est un COUT, pas une limite — flatter monte l'entente ET
 *      fait baisser la discipline ;
 *   3. aucune approche n'est bonne dans l'absolu : la MEME action aide ou
 *      detruit selon a qui elle s'adresse ;
 *   4. une promesse trahie coute PLUS CHER qu'un refus franc ;
 *   5. l'entente amortit le depart mais NE LE BLOQUE PAS, et parfois il a
 *      deja decide ;
 *   6. le chiffre ne sort jamais a l'ecran.
 */

const EN = require("./entente.js");
const D = require("./dialogue.js");

let echecs = 0;
function dit(nom, ok, info) {
  console.log(`  ${ok ? "ok  " : "ECHEC"} ${nom}${info ? " — " + info : ""}`);
  if (!ok) echecs++;
}

/** Un combattant de test, profil dicte explicitement (invariant fiches). */
const homme = (discipline, fight_iq, aggression) =>
  ({ mental: { discipline, fight_iq, aggression } });
const etatDe = (moral) => ({ entente: EN.etatDepart(), moral, forme: 1.0 });

/* -------------------------------- 1. l'entente est un RESIDU */
{
  const e = EN.etatDepart();
  const av = e.valeur;
  const m = EN.bouger(e, "echange_neutre");
  dit("un échange qui ne donne rien s'inscrit quand même — zéro est une valeur",
    m.apres === av && e.histoire.length === 1,
    `valeur inchangée (${av}), mais ${e.histoire.length} trace(s) dans l'histoire`);

  const e2 = EN.etatDepart();
  for (let i = 0; i < 12; i++) EN.bouger(e2, "echange_juste");
  dit("le volume des petits échanges finit par faire une histoire",
    e2.valeur > 50 + 30 && e2.histoire.length === 12,
    `12 échanges justes : ${EN.DEPART} → ${e2.valeur}`);
}

/* ------------------- 2. le frein est un COUT, pas une limite */
{
  const f = homme(70, 60, 50);
  const et = etatDe(0.75);
  const disciplineAvant = f.mental.discipline;
  const r = D.parler(f, et, "flatter", 10);
  dit("flatter monte l'entente ET fait grossir la tête — la discipline paie",
    r.mouvement.apres > EN.DEPART && f.mental.discipline < disciplineAvant && !!r.cout,
    `entente ${EN.DEPART} → ${r.mouvement.apres} · discipline ${disciplineAvant} → ${f.mental.discipline} · "${r.cout}"`);

  // Et rien n'est bride : on PEUT flatter dix fois. Ca se paie, c'est tout.
  const f2 = homme(70, 60, 50);
  const et2 = etatDe(0.75);
  for (let i = 0; i < 10; i++) D.parler(f2, et2, "flatter", 10 + i * 6);
  dit("rien n'est bridé : flatter dix fois marche, et coûte dix fois",
    et2.entente.valeur > 70 && f2.mental.discipline <= 70 - 25,
    `entente ${et2.entente.valeur} · discipline 70 → ${f2.mental.discipline}`);
}

/* --------- 3. aucune approche n'est bonne dans l'absolu */
{
  // Secouer : le dur encaisse, l'homme au moral bas se casse.
  const dur = homme(75, 60, 70), fragile = homme(40, 55, 40);
  const eD = etatDe(1.0), eF = etatDe(0.70);
  const rD = D.parler(dur, eD, "secouer", 10);
  const rF = D.parler(fragile, eF, "secouer", 10);
  dit("secouer : le dur y répond, l'homme au moral bas se casse — même action",
    rD.dMoral > 0 && rF.dMoral < 0,
    `dur ${rD.dMoral > 0 ? "+" : ""}${rD.dMoral.toFixed(2)} · fragile ${rF.dMoral.toFixed(2)}`);

  // Flatter : le manque de confiance en profite, l'arrogant se relache.
  const jeune = homme(65, 55, 45), arrogant = homme(50, 60, 80);
  const eJ = etatDe(0.75), eA = etatDe(1.0);
  const rJ = D.parler(jeune, eJ, "flatter", 10);
  const rA = D.parler(arrogant, eA, "flatter", 10);
  dit("flatter : ça relève un jeune qui doute, ça relâche un arrogant",
    rJ.dForme > 0 && rA.dForme < 0,
    `jeune forme ${rJ.dForme > 0 ? "+" : ""}${rJ.dForme.toFixed(2)} · arrogant ${rA.dForme.toFixed(2)}`);

  // Rassurer quelqu'un qui n'en a pas besoin ne sert a rien.
  const solide = homme(75, 60, 50);
  const eS = etatDe(1.10);
  const rS = D.parler(solide, eS, "rassurer", 10);
  dit("rassurer un homme qui n'en a pas besoin ne sert presque à rien",
    Math.abs(rS.dMoral) <= 0.02, `moral ${rS.dMoral >= 0 ? "+" : ""}${rS.dMoral.toFixed(2)}`);
}

/* ------------------------------------------ 4. la lassitude */
{
  const f = homme(75, 60, 70);
  const et = etatDe(1.0);
  const r1 = D.parler(f, et, "secouer", 10);
  const r2 = D.parler(f, et, "secouer", 11);
  dit("lui reparler le lendemain ne porte plus — ça glisse",
    r2.dMoral < r1.dMoral && r2.texte.includes("glisse"),
    `1er ${r1.dMoral.toFixed(2)} · le lendemain ${r2.dMoral.toFixed(2)}`);
}

/* ------------- 5. la promesse : mieux qu'un non, pire si trahie */
{
  const e = EN.etatDepart();
  const p = EN.promettre(e, { quoi: "monter_categorie",
    condition: { type: "victoires", n: 2 }, echeance: 200 }, 10);
  const gainPromesse = p.apres - p.avant;

  const eNon = EN.etatDepart();
  const non = EN.bouger(eNon, "offre_refusee");
  const eOui = EN.etatDepart();
  const oui = EN.bouger(eOui, "affiche_voulue");
  dit("un « oui mais » vaut mieux qu'un refus, moins qu'un oui franc",
    gainPromesse > 0 && gainPromesse < (oui.apres - oui.avant) && gainPromesse > (non.apres - non.avant),
    `oui +${oui.apres - oui.avant} · oui mais +${gainPromesse} · non ${non.apres - non.avant}`);

  // L'echeance passe sans qu'on tienne : effondrement, pire qu'un refus.
  const eT = EN.etatDepart();
  EN.promettre(eT, { quoi: "monter_categorie", condition: { type: "victoires", n: 2 },
                     echeance: 100 }, 10);
  const avantTrahison = eT.valeur;
  const mv = EN.verifierPromesses(eT, 101, { victoiresDepuis: 0 });
  dit("une promesse trahie coûte bien plus cher qu'un refus franc",
    mv.length === 1 && mv[0].etat === "trahie"
      && (avantTrahison - eT.valeur) > Math.abs(non.apres - non.avant),
    `trahison −${avantTrahison - eT.valeur} · refus franc −${Math.abs(non.apres - non.avant)}`);

  // Et tenir parole rapporte gros.
  const eH = EN.etatDepart();
  const ph = EN.promettre(eH, { quoi: "main_event", condition: { type: "victoires", n: 2 },
                                echeance: 300 }, 10);
  const mvH = EN.verifierPromesses(eH, 50, { victoiresDepuis: 2 });
  const av = eH.valeur;
  EN.tenir(eH, ph.promesse);
  dit("la condition remplie devient une dette, et la tenir rapporte gros",
    mvH.length === 1 && mvH[0].etat === "due" && eH.valeur > av,
    `dette signalée · ${av} → ${eH.valeur}`);
}

/* -------- 6. l'entente amortit le depart, elle ne le bloque pas */
{
  const parfaite = EN.etatDepart(); parfaite.valeur = 100;
  const enorme = EN.tentation(parfaite, 500, 40, 0.99);
  dit("même à entente parfaite, une énorme offre l'emporte — on ne le retient pas",
    enorme.part === true, `il part, mais : "${enorme.maniere}"`);

  const basse = EN.etatDepart(); basse.valeur = 10;
  const moyenne = EN.tentation(basse, 70, 40, 0.99);
  const hauteM = EN.tentation(parfaite, 70, 40, 0.99);
  dit("mais elle protège contre les offres moyennes — le cas le plus fréquent",
    moyenne.part === true && hauteM.part === false,
    `offre moyenne : entente basse → il part · entente haute → il reste`);

  dit("à entente basse il part mal, et ta réputation en prend",
    moyenne.degat_reputation > 0 && hauteM.degat_reputation === 0,
    `"${moyenne.maniere}" · dégât ${moyenne.degat_reputation}`);

  // /!\ ET PARFOIS IL A DEJA DECIDE : rare a entente haute, jamais nul.
  const dejaHaut = EN.tentation(parfaite, 500, 40, 0.01);
  dit("et parfois il a déjà décidé — rare à entente haute, jamais impossible",
    dejaHaut.deja_decide === true && enorme.deja_decide === false,
    "le joueur ne contrôle pas ses hommes");
}

/* ------------------------- 7. la renegociation escomptee */
{
  const basse = EN.etatDepart(); basse.valeur = 10;
  const haute = EN.etatDepart(); haute.valeur = 95;
  const pB = EN.prixPourRester(basse, 1000);
  const pH = EN.prixPourRester(haute, 1000);
  dit("deux ans de bonne relation valent une vraie remise sur le prix de le garder",
    pB > 1000 && pH < 1000 && pB > pH * 1.4,
    `entente basse : ${pB} € · entente haute : ${pH} € (offre concurrente 1000 €)`);
}

/* --------- 7 bis. LA FAMILLE "COMBAT" ET LE CURSEUR DU OUI MAIS */
{
  const DE = require("./demandes.js");

  // Qui formule quoi : la demande n'est pas tiree dans un chapeau.
  const agressif = homme(55, 50, 75);
  const lucide = homme(70, 80, 45);
  const pA = DE.possibles(agressif, { serie: 2, rival: true }).map(d => d.cle);
  const pL = DE.possibles(lucide, { fraicheur: 0.6, derniers: ["V", "D"] }).map(d => d.cle);
  /* /!\ REGLE CORRIGEE PAR MAEL (09/08) : monter de categorie ne se
     demande pas apres deux victoires — c'est une ambition de CHAMPION ou
     de tres haut classe. Le banc verifiait l'ancienne regle. */
  const pChamp = DE.possibles(agressif, { champion: true, serie: 3, rang: 1 }).map(d => d.cle);
  dit("l'agressif réclame un nom, le lucide pas remis veut qu'on le protège, et seul un champion parle de monter",
    pA.includes("cet_adversaire") && !pA.includes("monter_categorie")
      && pL.includes("refuser_celui_ci")
      && pChamp.includes("monter_categorie"),
    `agressif : ${pA.join(", ")} · champion : monter_categorie ✓`);

  /* -------- la salle sans pros ne fait pas rever (Mael, 10/08) ------ */
  {
  const h = homme(55, 50, 75);
  const sans = DE.possibles(h, { amateur: true, nbPros: 0, niveauPro: 0, niveauMoi: 50,
    bilan: { v: 3, d: 0 } }).map(d => d.cle);
  const seul = DE.possibles(h, { amateur: true, nbPros: 1, niveauPro: 60, niveauMoi: 56,
    bilan: { v: 3, d: 0 } }).map(d => d.cle);
  const loin = DE.possibles(h, { amateur: true, nbPros: 3, niveauPro: 80, niveauMoi: 40,
    bilan: { v: 3, d: 0 } }).map(d => d.cle);
  dit("sans groupe pro, personne ne demande à monter avec les pros",
    !sans.includes("sparring_avec_pros") && !seul.includes("sparring_avec_pros"),
    `0 pro : ${sans.join(", ") || "rien"} · 1 pro : ${seul.join(", ") || "rien"}`);
  dit("40 points sous le groupe pro : ce n'est plus de l'ambition, la demande ne sort pas",
    !loin.includes("sparring_avec_pros"), `écart -40 → ${loin.join(", ") || "rien"}`);
  }

  /* /!\ ET UN AMATEUR NE PARLE QUE DE DEUX CHOSES.
     /!\ LE CONTEXTE DOIT PORTER UN GROUPE PRO (arbitrage Mael, 10/08) :
     depuis que "monter avec les pros" exige DEUX pros dans la salle et un
     ecart franchissable, un contexte sans groupe pro ne produit plus
     cette demande — et le banc tombait a zero possibilite. C'est le
     comportement VOULU : on ne monte pas avec un groupe qui n'existe pas.
     Le banc fournit donc une salle qui a des pros. */
  const pAm = DE.possibles(agressif, { amateur: true, nbPros: 3,
    niveauPro: 60, niveauMoi: 56, bilan: { v: 3, d: 0 } }).map(d => d.cle);
  dit("un amateur ne demande que le passage pro ou un sparring avec les pros",
    pAm.length > 0 && pAm.every(c => DE.AMATEUR_PEUT.includes(c)),
    pAm.join(", "));

  // /!\ LE CURSEUR : plus on exige, moins il repart content — jusqu'a
  // ce que ce ne soit plus une promesse mais un refus deguise.
  const gains = [];
  for (let n = 1; n <= 5; n++) {
    const et = { entente: EN.etatDepart() };
    const r = DE.repondre(et, "monter_categorie", "oui_mais", 10, agressif, n);
    gains.push(r.mouvement.apres - r.mouvement.avant);
  }
  const decroit = gains.every((g, i) => i === 0 || g < gains[i - 1]);
  dit("le curseur décroît sans trou : à une victoire c'est presque un oui, à cinq c'est un non déguisé",
    decroit && gains[0] > 0 && gains[gains.length - 1] < 0,
    gains.map((g, i) => `${i + 1}→${g > 0 ? "+" : ""}${g}`).join(" · "));

  // Le curseur est BORNE : on ne peut pas exiger dix victoires.
  const et2 = { entente: EN.etatDepart() };
  const r10 = DE.repondre(et2, "monter_categorie", "oui_mais", 10, agressif, 10);
  dit("on ne peut pas exiger n'importe quoi — le curseur est borné",
    r10.curseur === 5, `demandé 10, retenu ${r10.curseur}`);

  // Et l'humeur se lit EN MOTS pendant qu'on glisse.
  let okMots = true;
  for (let n = 1; n <= 5; n++) if (/\d/.test(DE.humeurCurseur(n))) okMots = false;
  dit("son contentement se lit en mots pendant qu'on glisse, jamais en chiffre",
    okMots, `"${DE.humeurCurseur(1)}" … "${DE.humeurCurseur(5)}"`);

  // "Refuser ce combat" NE SE MARCHANDE PAS : oui ou non.
  let leve = false;
  try { DE.repondre({ entente: EN.etatDepart() }, "refuser_celui_ci", "oui_mais", 10, lucide); }
  catch (e) { leve = true; }
  dit("« je ne veux pas de ce combat » ne se marchande pas : oui ou non", leve,
    "le oui mais lève");

  // Et les deux jauges tirent en sens contraire : accepter qu'il refuse
  // monte l'entente ET coute a l'organisation.
  const et3 = { entente: EN.etatDepart() };
  const rOui = DE.repondre(et3, "refuser_celui_ci", "oui", 10, lucide);
  const et4 = { entente: EN.etatDepart() };
  const rNon = DE.repondre(et4, "refuser_celui_ci", "non", 10, lucide);
  dit("accepter qu'il refuse : l'entente monte et l'organisation le paie — le forcer est la pire entrée",
    rOui.mouvement.apres > 50 && rOui.cout_relation === "refus"
      && rNon.mouvement.apres < 50 - 10,
    `oui : entente ${rOui.mouvement.apres} (+ un refus à l'orga) · non : ${rNon.mouvement.apres} — "${rNon.reaction}"`);
}

/* ------- 7 ter. LES SEPT FAMILLES : structure, ton, et cas de bord */
{
  const DE = require("./demandes.js");
  const cles = Object.keys(DE.DEMANDES);
  const familles = {};
  for (const [k, d] of Object.entries(DE.DEMANDES))
    (familles[d.famille] = familles[d.famille] || []).push(k);

  dit("les huit familles sont livrées (sept du carnet + l'amateur)",
    Object.keys(familles).length === 8 && cles.length >= 20,
    `${cles.length} demandes : ${Object.entries(familles).map(([f, l]) => f + " " + l.length).join(" · ")}`);

  // /!\ CHAQUE DEMANDE PORTE LES QUATRE CHOSES DU CARNET.
  let manque = "";
  for (const [k, d] of Object.entries(DE.DEMANDES)) {
    if (!d.dit || !d.titre) manque = `${k} : pas de texte`;
    else if (typeof d.probable !== "function") manque = `${k} : personne ne la formule`;
    else if (!d.oui || !d.oui.effet || !d.oui.cout || !d.oui.entente) manque = `${k} : le oui ne coûte rien`;
    else if (!d.non || !d.non.entente || !d.non.reaction) manque = `${k} : le non ne coûte rien`;
    else if (!EN.ENTREES.hasOwnProperty(d.oui.entente)) manque = `${k} : entrée oui inconnue`;
    else if (!EN.ENTREES.hasOwnProperty(d.non.entente)) manque = `${k} : entrée non inconnue`;
  }
  dit("chacune porte le coût du oui, le coût du non, et qui la formule",
    manque === "", manque || `${cles.length} demandes au crible`);

  // Le ton : il parle comme un combattant, jamais comme un tableur.
  /* /!\ dit peut etre une FONCTION du contexte depuis le 21/08 (le texte
     ne presuppose que ce qui existe : passer_pro parle autrement dans
     une salle sans pros). Le crible teste alors TOUTES les variantes. */
  let chiffre = "";
  for (const [k, d] of Object.entries(DE.DEMANDES)) {
    const variantes = typeof d.dit === "function" ? [d.dit(0), d.dit(3)] : [d.dit];
    for (const v of variantes)
      if (/\d/.test(v) && !/\d+ ?%/.test(v) && !/280|20 %/.test(v)) chiffre = k;
  }
  dit("il parle avec ses mots, pas avec des statistiques", chiffre === "",
    chiffre || "toutes les répliques passées au filtre");

  // Tous les curseurs sont bornes et decroissants.
  let okC = true, exC = "";
  for (const [k, d] of Object.entries(DE.DEMANDES)) {
    if (!d.oui_mais) continue;
    const c = d.oui_mais.curseur;
    if (!c || c.min < 1 || c.max > 6 || c.defaut < c.min || c.defaut > c.max) {
      okC = false; exC = `${k} : curseur mal borné`; continue;
    }
    if (typeof d.oui_mais.dit_coach !== "function") { okC = false; exC = `${k} : texte figé`; continue; }
    for (let n = c.min; n <= c.max; n++) {
      const t = d.oui_mais.dit_coach(n);
      if (!t || /\d/.test(t)) { okC = false; exC = `${k} à ${n} : "${t}"`; }
    }
  }
  const avecCurseur = Object.values(DE.DEMANDES).filter(d => d.oui_mais).length;
  dit("tous les curseurs sont bornés, et le coach parle en toutes lettres",
    okC, exC || `${avecCurseur} demandes marchandables`);

  // /!\ CE QUI NE SE MARCHANDE PAS DOIT LEVER : le personnel, le loyer,
  // le pépin d'argent, le refus de combat.
  const insecables = ["refuser_celui_ci", "jour_libre", "avance",
                      "souci_familial", "blessure_cachee"];
  let okI = true, exI = "";
  for (const k of insecables) {
    let leve = false;
    try { DE.repondre({ entente: EN.etatDepart() }, k, "oui_mais", 10, homme(60, 60, 60)); }
    catch (e) { leve = true; }
    if (!leve) { okI = false; exI = k; }
  }
  dit("ce qui ne se marchande pas lève : un pépin, un loyer, une blessure, un refus",
    okI, exI ? `${exI} se marchande` : insecables.join(", "));

  // /!\ LA BLESSURE CACHEE : il ne te la dit QUE si l'entente est bonne.
  const f = homme(65, 70, 55);
  const bas = DE.possibles(f, { entente: 30, fraicheur: 0.8 }).map(d => d.cle);
  const haut = DE.possibles(f, { entente: 75, fraicheur: 0.8 }).map(d => d.cle);
  dit("il n'avoue sa blessure que s'il te fait confiance — sinon il monte avec, sans rien dire",
    !bas.includes("blessure_cachee") && haut.includes("blessure_cachee"),
    `entente basse : rien · entente haute : il te le dit`);

  // Et le forcer quand il l'a avouee est la pire reponse du jeu.
  const et = { entente: EN.etatDepart() };
  const r = DE.repondre(et, "blessure_cachee", "non", 10, f);
  dit("le faire combattre blessé après l'aveu : la pire entrée, et il ne parlera plus",
    r.mouvement.apres <= 50 - 15 && r.reaction.includes("plus rien"),
    `${r.mouvement.avant} → ${r.mouvement.apres} — "${r.reaction}"`);
}

/* ------- 7 quater. LA SERIE DE DEFAITES (Mael, 09/08) */
{
  /* /!\ IL N'EXISTE PAS D'ENTREE "defaite" DANS entente.js, ET C'EST
     VOULU : une defaite seule n'abime pas la relation avec TON homme
     (elle coute cote organisation, dans relation.js). Ce qui l'abime,
     c'est la SERIE — ou le fait de l'engueuler. */
  let seule = false;
  try { EN.bouger(EN.etatDepart(), "defaite"); } catch (err) { seule = true; }
  const e2 = EN.etatDepart();
  const deux = EN.bouger(e2, "serie_defaites");
  const e3 = EN.etatDepart();
  const trois = EN.bouger(e3, "serie_noire");
  const d2 = deux.avant - deux.apres, d3 = trois.avant - trois.apres;
  dit("une defaite seule ne touche pas la relation ; deux d affilee coutent, trois font douter de toi",
    seule && d2 > 0 && d3 > d2,
    `deux d affilee -${d2} · trois -${d3}`);

  const e4 = EN.etatDepart();
  EN.bouger(e4, "serie_defaites");
  EN.bouger(e4, "engueulade_defaite");
  dit("l engueuler par-dessus une serie aggrave vraiment",
    e4.valeur < e2.valeur, `serie seule ${e2.valeur} · serie + engueulade ${e4.valeur}`);
}

/* ------------------------- 8. les mots, jamais le chiffre */
{
  let ok = true, ex = "";
  for (let v = 0; v <= 100; v++) {
    const p = EN.lire(v);
    if (!p || !p.mot || /\d/.test(p.mot)) { ok = false; ex = `à ${v}`; break; }
  }
  const et = etatDe(1.0);
  for (let i = 0; i < 6; i++) EN.bouger(et.entente, "echange_juste");
  const a = D.avis(et);
  dit("les paliers et l'avis du coach ne laissent fuir aucun chiffre",
    ok && !/\d/.test(a), ex || `"${a}"`);
}

/* ------------------------------------------------------------------ */

if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — l'entente est un résidu, chaque point s'achète, et on ne contrôle pas ses hommes.");
