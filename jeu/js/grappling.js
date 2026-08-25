/**
 * grappling.js — LES QUATRE ETAGES DU JEU AU SOL.
 *
 * Module natif JS. /!\ IL NE TOUCHE A AUCUN FICHIER GELE. Il LIT le
 * combattant et en deduit des informations neuves ; ground_v2 et engine
 * restent inchanges pour l'instant. C'est volontaire : on pose la matiere,
 * on la mesure, et on ne rouvre le moteur qu'ensuite.
 *
 * ===================================================================
 * /!\ POURQUOI QUATRE ETAGES, ET PAS UNE "NOTE DE GRAPPLING"
 * ===================================================================
 * Le moteur ecrase aujourd'hui des dimensions qui n'ont rien a voir. Quatre
 * profils reels, donnes par Mael, le prouvent — chacun casse un etage
 * different :
 *
 *   1. AMENER AU SOL      shot · throws · clinch_wrestling · grip_fighting
 *      SHAVKAT : zero entree en jambes, mais body lock et projections. Il
 *      amene au sol autant qu'un autre, par une VOIE differente. Un homme a
 *      shot 40 / throws 95 n'est pas un mauvais lutteur.
 *
 *   2. ATTEINDRE LA POSITION   passing · back_top · mount_top · side_top
 *      BRENDAN ALLEN : tres fort pour ALLER CHERCHER LE DOS. Ce n'est pas
 *      la meme chose que savoir etrangler une fois qu'on y est.
 *
 *   3. GARDER             controle · retention
 *      KHABIB : etouffant, personne ne se releve.
 *
 *   4. FINIR              les quatre familles de soumission ci-dessous
 *      USMAN : etage 1, 2 et 3 d'elite, UNE soumission en carriere.
 *      PIMBLETT : l'inverse — incapable d'amener au sol, mortel une fois
 *      que ca y est, y compris DEPUIS LE DESSOUS.
 *
 * Les quatre etages sont donc INDEPENDANTS. Les correler ("bon grappler =
 * bon partout") rendrait ces quatre hommes impossibles a fabriquer.
 */

const { alea } = require("./alea.js");

/**
 * Les quatre familles de soumission, batties sur les 26 soumissions que le
 * moteur connait deja (SOUMISSIONS_TOP / SOUMISSIONS_BOTTOM).
 * `positions` : la ou la famille se finit. C'est ce qui permet a un homme
 * de chercher la position qui sert SON arme, au lieu de la position la plus
 * haute.
 */
const FAMILLES = {
  dos: {
    nom: "étranglements arrière",
    prises: ["rear_naked_choke", "bow_and_arrow", "neck_crank"],
    positions: ["back_control", "crucifix"],
  },
  bras: {
    nom: "clés de bras",
    prises: ["armbar", "kimura", "americana", "omoplata", "mounted_triangle",
             "triangle", "ezekiel"],
    positions: ["mount", "side_control", "knee_on_belly", "closed_guard"],
  },
  tete_bras: {
    nom: "étranglements tête et bras",
    prises: ["darce", "brabo", "anaconda", "arm_triangle", "north_south_choke",
             "peruvian_necktie", "guillotine", "guillotine_debout", "baseball_choke"],
    positions: ["north_south", "turtle", "half_guard", "side_control"],
  },
  jambes: {
    nom: "attaques de jambes",
    prises: ["heel_hook", "toe_hold"],
    positions: ["open_guard", "butterfly_guard"],
  },
};
const CLES = Object.keys(FAMILLES);

/* En dessous de ce niveau, une famille n'est pas une arme : on ne construit
   pas son jeu autour. Un lutteur a 55 partout ne chasse aucune soumission,
   il cherche a controler et a taper — c'est Usman, une soumission en
   carriere. */
const SEUIL_ARME = 72;

/**
 * Les trois FORMES qu'un jeu de soumission peut prendre. Elles disent
 * comment le talent se repartit entre les quatre familles, pas son niveau.
 *
 * /!\ IL N'Y A PAS DE PLANCHER "AU MOINS MOYEN PARTOUT". C'etait mon idee,
 * Usman la casse : lutteur d'elite, une soumission en carriere. Un lutteur
 * peut etre bas dans les QUATRE familles et rester un grappler dominant —
 * c'est meme la norme au niveau international.
 */
const FORMES = {
  // /!\ L'ECART DU LUTTEUR EST PROFOND, ET C'EST VOULU. A [-22,-8], un
  // lutteur d'elite (base 85) ressortait a 77 en cle de bras — au-dessus du
  // seuil, donc arme. Usman aurait chasse la cle de bras. Il en a UNE en
  // carriere. A [-30,-14] il retombe dans les 55-71 : il controle et il
  // tape, il ne soumet pas.
  lutteur:     { poids: 0.45, ecart: [-30, -14], pointe: 0 },
  specialiste: { poids: 0.40, ecart: [-14, +2],  pointe: 1 },
  complet:     { poids: 0.15, ecart: [-4, +4],   pointe: 0 },
};

/**
 * Attribue les huit valeurs de famille a un combattant, a partir de ce
 * qu'il a deja. On NE REMPLACE PAS submission_off_top / _bottom : on brode
 * autour. Les anciennes stats restent la reference et le moteur gele
 * continue de les lire — rien ne casse.
 *
 * @param {object} fighter
 * @param {string} [forme] "lutteur" | "specialiste" | "complet"
 * @returns {object} le detail attribue (aussi pose sur fighter.grappling)
 */
function attribuer(fighter, forme, pointeImposee) {
  if (!forme) {
    const r = alea.random();
    let cumul = 0;
    for (const [k, f] of Object.entries(FORMES)) {
      cumul += f.poids;
      if (r < cumul) { forme = k; break; }
    }
    forme = forme || "specialiste";
  }
  const F = FORMES[forme];
  if (!F) throw new Error(`grappling.js : forme inconnue "${forme}"`);

  const base = { dessus: fighter.ground.submission_off_top,
                 dessous: fighter.ground.submission_off_bottom };
  const out = { forme, dessus: {}, dessous: {} };

  // Une eventuelle POINTE : la famille ou il est vraiment dangereux.
  const pointe = pointeImposee
    || (F.pointe ? CLES[Math.trunc(alea.random() * CLES.length)] : null);

  for (const cote of ["dessus", "dessous"]) {
    for (const k of CLES) {
      const [lo, hi] = F.ecart;
      let v = base[cote] + lo + alea.random() * (hi - lo);
      if (k === pointe) v = base[cote] + 8 + alea.random() * 12;
      out[cote][k] = Math.max(20, Math.min(99, Math.round(v)));
    }
  }
  out.pointe = pointe;
  fighter.grappling = out;
  return out;
}

/**
 * Ce qu'une position rapporte a CET homme : ce qu'il sait y finir.
 * /!\ C'est le coeur de la demande de Mael : "un gars bon en rear naked va
 * chercher le dos, un gars bon en armbar la side ou le mount, le bon en
 * darce le north-south, le bon en GnP la side ou le mount en priorite mais
 * peut deja taper dans toutes les autres positions."
 * Un homme a 95 en etranglement arriere prefere un dos a 30 % de reussite a
 * un mount a 55 % : la position ne vaut pas ce qu'elle vaut EN GENERAL,
 * elle vaut ce que LUI peut en faire.
 */
function valeurPosition(fighter, position, cote = "dessus") {
  const g = fighter.grappling;
  if (!g) return 0;
  // /!\ ON NE CHASSE PAS UNE SOUMISSION QU'ON NE SAIT PAS FINIR. Sans ce
  // seuil, un lutteur dont les quatre familles tournent a 55 partait
  // chercher des cles de jambes parce que 59 depassait 57 — du bruit promu
  // en intention. En dessous de SEUIL_ARME, la position ne vaut que ce
  // qu'on peut y taper.
  let meilleure = 0;
  for (const k of CLES)
    if (FAMILLES[k].positions.includes(position) && g[cote][k] >= SEUIL_ARME)
      meilleure = Math.max(meilleure, g[cote][k]);

  // /!\ LE FRAPPEUR AU SOL N'A PAS BESOIN DE LA POSITION PARFAITE : il tape
  // en demi-garde, il tape en garde, moins bien mais il tape. Le soumetteur,
  // lui, ne vaut rien tant qu'il n'a pas SA position. C'est une difference
  // de nature entre les deux styles, pas un reglage.
  const frappe = fighter.ground.ground_striking || 0;
  const bonusFrappe = ["mount", "side_control", "north_south", "knee_on_belly"]
    .includes(position) ? frappe : frappe * 0.55;

  // /!\ UNE SOUMISSION VAUT PLUS QU'UN COUP : elle FINIT le combat, le coup
  // ne fait qu'abimer. Sans ce coefficient, un homme a 99 de ground striking
  // preferait toujours le mount, meme avec un etranglement arriere a 95 —
  // et plus personne n'allait chercher le dos.
  return Math.max(meilleure * 1.25, bonusFrappe);
}

/** Le classement des positions pour cet homme, la meilleure d'abord. */
function preferences(fighter, positions, cote = "dessus") {
  return positions.slice()
    .map(p => [p, valeurPosition(fighter, p, cote)])
    .sort((a, b) => b[1] - a[1]);
}

/**
 * PAR OU IL AMENE AU SOL. Les voies sont distinctes : un homme peut n'avoir
 * aucune entree en jambes et amener au sol par le corps a corps.
 */
function voiesAuSol(fighter) {
  const w = fighter.wrestling;
  return [
    ["jambes", w.shot],
    ["projection", w.throws],
    ["corps_a_corps", (w.clinch_wrestling + w.grip_fighting) / 2],
  ].sort((a, b) => b[1] - a[1]);
}

/**
 * CE QU'IL VA FAIRE DEPUIS LE DESSUS — les poids du tirage d'action.
 *
 * /!\ AUJOURD'HUI CE TIRAGE EST FIXE : alea.choices(["progress","gnp",
 * "sub_top"], [0.24, 0.50, 0.26]). Ni les stats ni le profil n'y entrent.
 * Consequences mesurees le 09/08 :
 *   - 0,37 progression par round, alors qu'il en faut TROIS pour aller de
 *     la garde au dos. Un specialiste du dos n'atteint jamais son arme.
 *   - Usman perd un quart de ses actions a chercher des soumissions qu'il
 *     ne sait pas finir (ses quatre familles sont sous le seuil d'arme).
 *
 * /!\ ET IL MANQUE UNE QUATRIEME INTENTION : TENIR.
 * MERAB DALISHVILI plaque, ne passe pas la garde, ne cherche ni la
 * soumission ni le KO. Il controle et se releve avec l'autre. Les trois
 * options du moteur sont TOUTES offensives ; "ne rien tenter, garder la
 * position, laisser le temps passer" est une decision reelle de combat, et
 * c'est ce qui gagne des rounds sans rien produire.
 * Difference avec Usman : Usman veut le mount POUR TAPER. Merab ne veut pas
 * de position, il veut DU TEMPS.
 *
 * @returns {{progress:number, gnp:number, sub:number, tenir:number}} somme 1
 */
function intentions(fighter, position, cote = "dessus") {
  const g = fighter.grappling;
  const gr = fighter.ground;
  if (!g) return { progress: 0.24, gnp: 0.50, sub: 0.26, tenir: 0 };

  // SOUMETTRE : seulement si une arme est finissable D'ICI. On ne tente pas
  // un etranglement arriere depuis la demi-garde.
  let arme = 0;
  for (const k of CLES)
    if (FAMILLES[k].positions.includes(position) && g[cote][k] >= SEUIL_ARME)
      arme = Math.max(arme, g[cote][k]);
  let sub = arme ? 0.10 + (arme - SEUIL_ARME) / 27 * 0.55 : 0.03;

  // PROGRESSER : d'autant plus qu'une MEILLEURE position l'attend. C'est
  // ici que le specialiste du dos se met en marche.
  const ici = valeurPosition(fighter, position, cote);
  let mieux = 0;
  for (const k of CLES)
    for (const p of FAMILLES[k].positions)
      if (p !== position) mieux = Math.max(mieux, valeurPosition(fighter, p, cote));
  const gain = Math.max(0, mieux - ici);
  const passage = (gr.passing + (gr.posture_sol || 50)) / 2;
  const progress = 0.08 + Math.min(0.50, gain / 30 * 0.34 + (passage - 50) / 100 * 0.22);

  // /!\ ON NE SE CONTENTE PAS D'UNE ARME MOYENNE QUAND LA BONNE POSITION
  // EST A PORTEE. Premiere version : Aslanov, specialiste du dos, restait en
  // demi-garde a tenter des etranglements tete-bras a 42 % parce qu'il y
  // avait une arme "suffisante" sur place. Un specialiste PASSE, il ne se
  // contente pas. Plus la position d'a cote vaut mieux, moins il tente ici.
  sub *= 1 - Math.min(0.65, gain / 35);

  // TAPER : ce qu'il vaut au sol, module par l'acces de la position.
  const frappe = gr.ground_striking || 40;
  const ouvert = ["mount", "side_control", "north_south", "knee_on_belly",
                  "back_control", "crucifix"].includes(position) ? 1.0 : 0.55;
  const gnp = 0.06 + (frappe / 100) * 0.50 * ouvert;

  // TENIR : le residu de celui qui ne veut RIEN tenter. Il est d'autant plus
  // grand que le controle est bon et que rien d'autre ne le tente.
  const controle = (gr.top_control !== undefined ? gr.top_control : passage);
  const tenir = 0.05 + Math.max(0, (controle - 60) / 100) * 0.45;

  const somme = progress + gnp + sub + tenir;
  return { progress: progress / somme, gnp: gnp / somme,
           sub: sub / somme, tenir: tenir / somme };
}

module.exports = { FAMILLES, FORMES, CLES, SEUIL_ARME, intentions, attribuer, valeurPosition,
                   preferences, voiesAuSol };
