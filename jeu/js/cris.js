/**
 * cris.js — CHANTIER G : CRIER DES CONSIGNES EN TEMPS REEL.
 *
 * La vision de Mael (08/08) : "une commande de fou : t'es dans le coin, tu
 * peux crier, donner des consignes en temps reel. Ca sera dans les 5
 * secondes, et ca fera des calculs suivant si le gars a une bonne ecoute
 * et son etat, s'il domine ou s'il perd."
 *
 * LA CONCEPTION SIGNEE (14/08, conversation ligne a ligne) :
 *  - Le vocabulaire est PAR PHASE : on ne crie pas "shoote" a un homme en
 *    pleine garde. Debout / clinch / sol dessus / sol dessous + gestion.
 *  - LA TRANCHE FAIT 30 SECONDES. Le cri s'applique a la tranche
 *    SUIVANTE, jamais a ce qui est deja calcule — l'ecran ne ment pas.
 *  - TROIS CRIS PAR ROUND, PAS PLUS ("1 oui") : un coin qui hurle en
 *    continu n'est plus entendu, et ca oblige a choisir QUAND crier.
 *  - LE CRI NON ENTENDU SE VOIT ("2 oui") : "Il n'entend rien, il est
 *    dans son combat." Tu sais que ton cri s'est perdu, pas pourquoi.
 *  - Corrections de vocabulaire de Mael : "Il est touché, finis-le" (pas
 *    "parti"), "La tête" (pas "boîte-le"), pas d'underhooks ("trop
 *    technique"), "Calme, pas de bagarre avec lui".
 *
 * /!\ CHAQUE CRI TOUCHE UN LEVIER QUE LE MOTEUR LIT VRAIMENT — sinon
 * c'est du texte, le defaut qu'on chasse depuis le debut. Les canaux :
 * gameplan (striking/wrestling/clinch, renormalises), allure, cible,
 * sol (dessus), sol_dessous, clinch_intent, et la bascule de temperament
 * pour "tourne". Tous inertes sans ordre — les bancs le prouvent.
 */

/* ==================================================================== */
/* LE VOCABULAIRE. appliquer(f) pose l'effet et RETOURNE defaire() —    */
/* le cri vit UNE tranche, puis tout revient. On ne modifie jamais sans */
/* garder de quoi restaurer (lecon des remplacements silencieux).       */
/* ==================================================================== */

/** Pousse les poids du gameplan vers `vers` sans effacer le reste. */
function pousserGameplan(f, vers, force) {
  const avant = { striking: f.gameplan.striking, wrestling: f.gameplan.wrestling,
                  clinch: f.gameplan.clinch };
  for (const k of ["striking", "wrestling", "clinch"])
    f.gameplan[k] = (f.gameplan[k] || 0) + (k === vers ? force : 0);
  const s = f.gameplan.striking + f.gameplan.wrestling + f.gameplan.clinch;
  for (const k of ["striking", "wrestling", "clinch"]) f.gameplan[k] /= s;
  return () => { Object.assign(f.gameplan, avant); };
}

/** Pose une clef du gameplan et retourne de quoi la remettre. */
function poser(f, clef, valeur) {
  const avait = Object.prototype.hasOwnProperty.call(f.gameplan, clef);
  const avant = f.gameplan[clef];
  f.gameplan[clef] = valeur;
  return () => { if (avait) f.gameplan[clef] = avant; else delete f.gameplan[clef]; };
}

const CRIS = {
  /* ---- DEBOUT --------------------------------------------------- */
  avance:   { phase: "debout", mot: "Avance, mets la pression !",
    appliquer(f) {
      const a = poser(f, "allure", Math.min(1.3, (f.gameplan.allure || 1.0) + 0.2));
      const b = pousserGameplan(f, "striking", 0.35);
      return () => { a(); b(); };
    } },
  calme:    { phase: "debout", mot: "Calme, pas de bagarre avec lui !",
    appliquer(f) {
      return poser(f, "allure", Math.max(0.7, (f.gameplan.allure || 1.0) - 0.25));
    } },
  tete:     { phase: "debout", mot: "La tête !",
    appliquer(f) { return poser(f, "cible", "tete"); } },
  corps:    { phase: "debout", mot: "Le corps !",
    appliquer(f) { return poser(f, "cible", "corps"); } },
  jambe:    { phase: "debout", mot: "La jambe !",
    appliquer(f) { return poser(f, "cible", "jambes"); } },
  shoote:   { phase: "debout", mot: "Change de niveau, shoote !",
    appliquer(f) { return pousserGameplan(f, "wrestling", 0.9); } },
  tourne:   { phase: "debout", mot: "Sors de là, tourne !",
    /* La bascule de temperament : le moteur lit TEMPERAMENTS[f.temperament]
       a chaque pas — un fuyard tourne (1.5) et reprend l'angle. Donnee du
       combattant, pas du code : le moteur lit vraiment le changement. */
    appliquer(f) {
      const avant = f.temperament;
      f.temperament = "fuyard";
      return () => { f.temperament = avant; };
    } },
  finis_le: { phase: "debout", mot: "Il est touché, finis-le !",
    appliquer(f) {
      const a = poser(f, "allure", 1.3);
      const b = pousserGameplan(f, "striking", 0.6);
      return () => { a(); b(); };
    } },

  /* ---- CLINCH ---------------------------------------------------- */
  projette: { phase: "clinch", mot: "Projette-le !",
    appliquer(f) {
      const a = poser(f, "clinch_intent", "projeter");
      const b = pousserGameplan(f, "clinch", 0.4);
      return () => { a(); b(); };
    } },
  repousse: { phase: "clinch", mot: "Sors, repousse-le !",
    appliquer(f) {
      const a = poser(f, "clinch_intent", "sortir");
      const b = pousserGameplan(f, "striking", 0.4);
      return () => { a(); b(); };
    } },
  genoux:   { phase: "clinch", mot: "Les genoux, frappe !",
    appliquer(f) { return poser(f, "clinch_intent", "frapper"); } },

  /* ---- SOL, DESSUS ----------------------------------------------- */
  conserve_dessus: { phase: "sol_dessus", mot: "Conserve la position !",
    appliquer(f) { return poser(f, "sol", "controle"); } },
  passe:           { phase: "sol_dessus", mot: "Passe sa garde !",
    appliquer(f) { return poser(f, "sol", "passage"); } },
  gnp:             { phase: "sol_dessus", mot: "Frappe ! Ground and pound !",
    appliquer(f) { return poser(f, "sol", "frappe"); } },
  soumission:      { phase: "sol_dessus", mot: "La soumission, elle est là !",
    appliquer(f) { return poser(f, "sol", "soumission"); } },

  /* ---- SOL, DESSOUS ---------------------------------------------- */
  conserve_dessous: { phase: "sol_dessous", mot: "Conserve, bloque-le !",
    appliquer(f) { return poser(f, "sol_dessous", "bloquer"); } },
  releve:           { phase: "sol_dessous", mot: "Relève-toi, le mur !",
    appliquer(f) { return poser(f, "sol_dessous", "relever"); } },
  sweep:            { phase: "sol_dessous", mot: "Le sweep, renverse-le !",
    appliquer(f) { return poser(f, "sol_dessous", "sweep"); } },
  explose:          { phase: "sol_dessous", mot: "Explose, maintenant !",
    appliquer(f) { return poser(f, "sol_dessous", "explosion"); } },

  /* ---- TOUTE PHASE ------------------------------------------------ */
  respire: { phase: "toute", mot: "Respire, trente secondes !",
    appliquer(f) {
      return poser(f, "allure", Math.max(0.7, (f.gameplan.allure || 1.0) - 0.3));
    } },
};

const MAX_CRIS_PAR_ROUND = 3;

/* ==================================================================== */
/* QUELLE PHASE, DONC QUELS CRIS. L'ecran n'affiche que la phase en     */
/* cours — si le combat tombe au sol pendant la tranche, les boutons    */
/* changent a la tranche suivante.                                      */
/* ==================================================================== */

/** La phase des cris pour MON combattant, lue sur l'etat du round.
 *  /!\ LES CONSTANTES DU MOTEUR SONT DES CHAINES ("debout"/"clinch"/
 *  "sol"), PAS DES NOMBRES (defaut vu par Mael, 15/08 : les cris du sol
 *  proposes debout contre la grille). La premiere version testait
 *  etat.phase === 2 — une hypothese jamais verifiee, et le banc testait
 *  la meme hypothese au lieu des constantes reelles. On importe. */
function phaseDesCris(etat, nomDuMien) {
  const E = require("./engine.js");
  if (etat.phase === E.SOL || etat.position) {
    if (etat.top === nomDuMien) return "sol_dessus";
    if (etat.top) return "sol_dessous";
  }
  if (etat.phase === E.CLINCH) return "clinch";
  return "debout";
}

/** Les cris affichables maintenant : ceux de la phase + la gestion. */
function crisDisponibles(etat, nomDuMien) {
  const ph = phaseDesCris(etat, nomDuMien);
  return Object.keys(CRIS).filter(id =>
    CRIS[id].phase === ph || CRIS[id].phase === "toute");
}

/* ==================================================================== */
/* LE FILTRE D'ECOUTE — la regle de Mael (08/08) : "suivant si le gars  */
/* a une bonne ecoute et son etat, s'il domine ou s'il perd."           */
/* fight IQ + discipline decident de l'ecoute ; sonne ou vide, il       */
/* n'entend rien ; un indiscipline qui domine ignore le "calme".        */
/* ==================================================================== */

/**
 * @param {Fighter} f  mon combattant
 * @param {Fighter} adv
 * @param {string} criId
 * @param {number} tirage  [0,1) — fourni par l'appelant (l'ecran), JAMAIS
 *                         par l'alea du moteur : le combat reste conforme
 *                         au temoin a cris egaux.
 * @returns {{entendu:boolean, mot:string}}
 */
function entend(f, adv, criId, tirage) {
  const iq = (f.mental && f.mental.fight_iq) || 50;
  const disc = (f.mental && f.mental.discipline) || 50;
  let p = 0.45 + iq * 0.004 + disc * 0.003;

  if (f.sonne > 0)
    return { entendu: false, mot: "Il est sonné — il n'entend rien du tout." };
  const cardio = f.cardio_ratio ? f.cardio_ratio() : 1.0;
  if (cardio < 0.35)
    return { entendu: false, mot: "Il est vidé — le coin est très loin." };
  p -= (1 - cardio) * 0.3;

  /* Il domine et on lui demande de se calmer : l'indiscipline n'ecoute
     pas ce qui le prive de son moment. */
  const domine = (f.rs && adv.rs) ? (f.rs.damage - adv.rs.damage > 25) : false;
  if (domine && (criId === "calme" || criId === "respire") && disc < 55) p -= 0.30;

  p = Math.max(0.10, Math.min(0.95, p));
  if (tirage < p) return { entendu: true, mot: CRIS[criId].mot };
  return { entendu: false, mot: "Il n'entend rien, il est dans son combat." };
}

/* ==================================================================== */
/* L'ORCHESTRATION D'UNE TRANCHE : appliquer les cris entendus,          */
/* rendre la main au moteur, defaire au prochain arret.                  */
/* ==================================================================== */

/**
 * Applique un cri sur f pour UNE tranche.
 * @returns {function} defaire — a appeler au prochain arret.
 */
function crier(f, criId) {
  const c = CRIS[criId];
  if (!c) throw new Error(`cris.js : cri inconnu "${criId}"`);
  return c.appliquer(f);
}

module.exports = { CRIS, MAX_CRIS_PAR_ROUND, phaseDesCris, crisDisponibles,
                   entend, crier };
