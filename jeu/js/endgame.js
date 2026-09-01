/**
 * endgame.js — CE QUI RESTE QUAND LES ANNEES PASSENT.
 *
 * (Le dernier chantier de la liste laissee par la cloture du 22/08 :
 * « l'endgame — mur des legendes, objectifs longs, rivalites ».)
 *
 * LE PROBLEME QU'IL RESOUT
 * Le jeu savait faire une semaine, une saison, une carriere. Il ne savait
 * pas faire UNE VIE DE SALLE. Au bout de cinq ans, plus rien ne montait :
 * les hommes partaient a la retraite et disparaissaient, on ne savait plus
 * ou on en etait, et deux combats contre le meme homme etaient deux
 * combats sans histoire. Trois pieces, une par manque :
 *
 *   LE MUR       — ce que la salle a produit, et qui ne s'efface pas.
 *   LES OBJECTIFS— ou tu en es, en annees, pas en semaines.
 *   LES RIVALITES— ce que le passe fait au prochain combat.
 *
 * ===================================================================
 * /!\ LES TROIS REGLES DU MODULE
 * ===================================================================
 * 1. RIEN NE SE COMPTE A PART. Un objectif se LIT dans l'etat du jeu, il
 *    n'a pas de compteur a lui. La plaie du 09/08 (« pas deux exemplaires
 *    de la meme donnee ») ferait ici des degats permanents : un compteur
 *    de victoires qui derive d'un point au bout de dix ans ne se repare
 *    plus. On lit, on ne stocke pas.
 * 2. RIEN N'EST GRATUIT, ET RIEN N'EST DECORATIF. Un mur ou tout le monde
 *    est accroche ne dit rien (meme regle que le marquage des contrats :
 *    on ne marque que ce qui compte). Une rivalite qui ne change aucun
 *    combat n'est pas une rivalite, c'est une etiquette.
 * 3. UNE RIVALITE NAIT D'UN FAIT. Jamais d'un tirage, jamais d'un seuil
 *    de notoriete — la version d'avant disait `rival: notoriete >= 15`,
 *    ce qui voulait dire « il est connu », pas « ils se detestent ».
 */

/* ==================================================================== */
/* 1. LE MUR DES LEGENDES                                               */
/* ==================================================================== */

/**
 * LES TROIS RANGS, et ce qu'il faut avoir fait pour y entrer.
 * /!\ LES SEUILS SONT DES FAITS DE CARRIERE, pas des notes. On n'accroche
 * pas un homme parce qu'il etait bon : on l'accroche pour ce qu'il a fait
 * SOUS TES COULEURS.
 */
const RANGS = [
  { cle: "legende", mot: "Légende",
    /* Une ceinture, ou une carriere de haut de classement. */
    tient: (b) => b.titres >= 1 || (b.victoires >= 15 && b.meilleurRang !== null && b.meilleurRang <= 5) },
  { cle: "pilier", mot: "Pilier de la maison",
    /* /!\ LA DUREE SEULE NE SUFFIT PAS (trouve au banc 30) : la premiere
       version accrochait "pilier" a tout homme reste cinq ans, meme a
       1-9. On ne devient pas un pilier en trainant — il faut avoir tenu
       ET gagne. */
    tient: (b) => b.victoires >= 8 || (b.annees >= 5 && b.victoires >= 5) },
  { cle: "maison", mot: "De la maison",
    tient: (b) => b.annees >= 3 && b.victoires >= 3 },
];

/**
 * Ce qu'un homme a fait chez toi, en chiffres bruts.
 * @param {object} l   l'homme (MESGARS)
 * @param {object} fi  sa fiche
 * @param {number} jour  le jour courant
 */
function bilanMaison(l, fi, jour) {
  const faits = l.faits || [];
  return {
    victoires: (fi && fi.bilan ? fi.bilan[0] : (l.bilan ? l.bilan.v : 0)) || 0,
    defaites: (fi && fi.bilan ? fi.bilan[1] : (l.bilan ? l.bilan.d : 0)) || 0,
    titres: faits.filter((f) => /^Champion/.test(f.quoi)).length,
    annees: Math.floor(Math.max(0, jour - (l.arriveLe || 0)) / 365),
    meilleurRang: l.meilleurRang === undefined ? (l.rang === undefined ? null : l.rang) : l.meilleurRang,
    finitions: (fi && fi.combats ? fi.combats : [])
      .filter((c) => c && c[0] === "V" && /KO|soumission/i.test(String(c[2]))).length,
  };
}

/**
 * LA PLAQUE — ou null s'il n'en merite pas.
 * /!\ RENDRE null EST LE CAS NORMAL. Un mur ou tout le monde est accroche
 * ne dit rien du tout : la plupart des hommes passent, et c'est ce qui
 * rend les autres visibles.
 */
function plaqueDe(l, fi, jour) {
  if (!l || l.amateur) return null;
  const b = bilanMaison(l, fi, jour);
  const rang = RANGS.find((r) => r.tient(b));
  if (!rang) return null;
  return {
    cle: l.cle || (fi && fi.nom) || l.nom, nom: l.nom || (fi && fi.nom) || "?",
    rang: rang.cle, mot: rang.mot,
    bilan: `${b.victoires}-${b.defaites}`, titres: b.titres,
    annees: b.annees, finitions: b.finitions,
    an: 2026 + Math.floor(jour / 365),
    /* CE QU'ON RETIENT DE LUI — une phrase, tiree de ce qui domine
       vraiment sa carriere. Pas un compliment generique. */
    pourquoi: b.titres >= 2 ? `${b.titres} règnes. On ne lui a jamais repris la ceinture deux fois.`
      : b.titres === 1 ? `Il a ramené une ceinture à la salle.`
      : b.finitions >= 6 ? `${b.finitions} adversaires qui ne sont pas allés au bout.`
      : b.annees >= 8 ? `${b.annees} ans sur ce tapis. Il a vu passer tout le monde.`
      : b.victoires >= 12 ? `${b.victoires} victoires sous tes couleurs.`
      : `Il était là quand il n'y avait personne.`,
  };
}

/** Ce que le mur vaut a la salle. /!\ IL PLAFONNE : une salle ne vit pas
 *  eternellement de ses morts. Trois legendes et cinq piliers ne font pas
 *  mieux que trois legendes — au-dela, c'est un musee, pas une salle. */
function poidsDuMur(plaques) {
  const p = { legende: 0, pilier: 0, maison: 0 };
  for (const x of plaques || []) p[x.rang] = (p[x.rang] || 0) + 1;
  return Math.min(12, p.legende * 3 + p.pilier * 1.5 + p.maison * 0.5);
}

/* ==================================================================== */
/* 2. LES OBJECTIFS LONGS                                               */
/* ==================================================================== */

/**
 * /!\ CHAQUE OBJECTIF SE LIT DANS L'ETAT, IL N'A PAS DE COMPTEUR. `lire`
 * recoit un etat construit au moment ou on regarde — jamais une valeur
 * qu'on aurait incrementee quelque part. C'est la seule facon qu'un
 * objectif de dix ans soit encore juste au bout de dix ans.
 *
 * Chacun rend { ou, sur } : ou on en est, sur combien. `fait` s'en deduit.
 */
const OBJECTIFS = [
  /* --- LA SALLE : tenir debout. ------------------------------------- */
  { cle: "tenir", tier: "salle", titre: "Tenir un an",
    sous: "Une salle sur deux ferme la première année.",
    lire: (e) => ({ ou: Math.min(365, e.jour), sur: 365 }) },
  { cle: "murs", tier: "salle", titre: "Sortir du garage",
    sous: "Des vestiaires, un bureau, un plafond haut.",
    lire: (e) => ({ ou: e.rangLocal, sur: 2 }) },
  { cle: "staff", tier: "salle", titre: "Trois coachs sous contrat",
    sous: "On ne tient pas une salle tout seul.",
    lire: (e) => ({ ou: Math.min(3, e.coachs), sur: 3 }) },
  { cle: "plein", tier: "salle", titre: "Cent adhérents",
    sous: "Ce sont eux qui paient les murs.",
    lire: (e) => ({ ou: Math.min(100, e.effectif), sur: 100 }) },

  /* --- LE SPORT : produire des combattants. ------------------------- */
  { cle: "pros", tier: "sport", titre: "Trois pros sous contrat",
    sous: "Trois hommes qui vivent de ça, chez toi.",
    lire: (e) => ({ ou: Math.min(3, e.prosSousContrat), sur: 3 }) },
  { cle: "classe", tier: "sport", titre: "Un homme dans un top 15",
    sous: "Le classement, c'est la porte des grosses affiches.",
    lire: (e) => ({ ou: e.meilleurRang !== null && e.meilleurRang <= 15 ? 1 : 0, sur: 1 }) },
  { cle: "ceinture", tier: "sport", titre: "Une ceinture au mur",
    sous: "Champion. Le mot qui change une salle.",
    lire: (e) => ({ ou: Math.min(1, e.champions), sur: 1 }) },
  { cle: "deux_ceintures", tier: "sport", titre: "Deux champions en même temps",
    sous: "Une ceinture, c'est un homme. Deux, c'est une école.",
    lire: (e) => ({ ou: Math.min(2, e.champions), sur: 2 }) },

  /* --- L'HERITAGE : ce qui reste. ----------------------------------- */
  { cle: "maison", tier: "heritage", titre: "Un champion formé chez toi",
    sous: "Arrivé amateur. Reparti champion. C'est le vrai métier.",
    lire: (e) => ({ ou: Math.min(1, e.championsMaison), sur: 1 }) },
  { cle: "mur", tier: "heritage", titre: "Une légende au mur",
    sous: "Un homme dont on parlera encore quand tu ne seras plus là.",
    lire: (e) => ({ ou: Math.min(1, e.legendes), sur: 1 }) },
  { cle: "cent", tier: "heritage", titre: "Cent victoires de salle",
    sous: "Cent soirs où quelqu'un est rentré en gagnant.",
    lire: (e) => ({ ou: Math.min(100, e.victoiresSalle), sur: 100 }) },
  { cle: "dix_ans", tier: "heritage", titre: "Dix ans",
    sous: "Une décennie. Des générations entières sont passées.",
    lire: (e) => ({ ou: Math.min(3650, e.jour), sur: 3650 }) },
];

const TIERS = [["salle", "La salle"], ["sport", "Le sport"], ["heritage", "L'héritage"]];

/** L'etat de tous les objectifs, lu maintenant. */
function objectifs(etat) {
  return OBJECTIFS.map((o) => {
    let v;
    try { v = o.lire(etat); } catch (e) { v = { ou: 0, sur: 1 }; }
    const ou = Math.max(0, v.ou || 0), sur = Math.max(1, v.sur || 1);
    return { cle: o.cle, tier: o.tier, titre: o.titre, sous: o.sous,
             ou, sur, fait: ou >= sur, part: Math.min(1, ou / sur) };
  });
}

/** Ceux qui viennent d'etre atteints, par rapport a ce qu'on savait deja.
 *  /!\ ON COMPARE A UNE LISTE DE CLES DEJA ANNONCEES, PAS A UN COMPTEUR :
 *  meme si l'etat retombe (un champion perd sa ceinture), un objectif
 *  atteint reste atteint — on ne le re-annonce pas, et on ne le retire pas. */
function nouveaux(etat, deja) {
  const vus = new Set(deja || []);
  return objectifs(etat).filter((o) => o.fait && !vus.has(o.cle));
}

/* ==================================================================== */
/* 3. LES RIVALITES                                                     */
/* ==================================================================== */

/**
 * /!\ UNE RIVALITE NAIT D'UN FAIT, JAMAIS D'UN TIRAGE. Cinq causes, et
 * chacune correspond a quelque chose qui s'est REELLEMENT produit dans la
 * partie. `poids` dit ce que la cause ajoute a la chaleur.
 */
/* /!\ LES POIDS ONT ETE REHAUSSES LE 31/08, SUR MESURE. Dix ans joues,
   graine 7 : 343 rivalites nees, DIX vivantes — 3 %. La cause etait
   arithmetique : une defaite valait 30, le seuil de "vivante" est 25, et
   la chaleur tombait de 0,14 par jour — la rivalite mourait en TRENTE-SIX
   JOURS, donc toujours avant le combat suivant. Un homme qui t'a battu,
   on s'en souvient une saison, pas cinq semaines. Les durees de vie
   visees (chaleur - 25) / refroidissement :
       defaite ~10 mois · revanche ~1,4 an · ceinture ~1,9 an
   /!\ DEUX INVARIANTS DU BANC 30 TIENNENT LE CALIBRAGE, et c'est eux qui
   fixent les chiffres exacts :
     - LES MOTS SEULS NE FONT PAS UNE RIVALITE : `trash` reste SOUS 25
       (inchange a 18) — il chauffe, il ne cree pas ;
     - LA PLUS CHAUDE PASSE DEVANT : trash+defaite (63) doit rester
       au-dessus de revanche seule (60). D'ou defaite a 45 et non 42.
   Un chiffre qui atterrit sur un seuil ou sur une egalite est un chiffre
   a changer — la lecon du banc 30, appliquee une deuxieme fois. */
const CAUSES = {
  defaite:   { poids: 45, mot: (n) => `Il l'a battu.` },
  revanche:  { poids: 60, mot: (n) => `Deux fois. Il l'a battu deux fois.` },
  ceinture:  { poids: 72, mot: (n) => `Il lui a pris la ceinture.` },
  vole:      { poids: 32, mot: (n) => `Une décision que personne n'a comprise.` },
  trash:     { poids: 18, mot: (n) => `Ce qui s'est dit avant le combat n'est pas oublié.` },
  gagne:     { poids: 20, mot: (n) => `Il l'a déjà battu — l'autre veut sa revanche.` },
  salle:     { poids: 36, mot: (n) => `Il est parti chez eux.` },
};

/* La chaleur retombe : sans rien, une rivalite s'eteint en QUATRE ans
   (deux, avant le 31/08 — trop vite pour un sport ou deux combats sont
   espaces de six mois).
   /!\ SANS CETTE LIGNE, TOUT LE MONDE FINIT RIVAL DE TOUT LE MONDE au
   bout de dix ans, et le mot ne veut plus rien dire. */
const REFROIDIT_PAR_JOUR = 100 / 1460;

const clefRiv = (cleA, idB) => `${cleA}|${idB}`;

/**
 * Un fait vient de se produire. La rivalite naît ou se rallume.
 * @param {object} R      la table des rivalites (etat du jeu)
 * @param {string} cleA   mon homme
 * @param {number|string} idB  l'autre
 * @param {string} cause  une cle de CAUSES
 */
function nourrir(R, cleA, idB, cause, jour, nomB) {
  const c = CAUSES[cause];
  if (!c) throw new Error(`endgame.js : cause de rivalite inconnue "${cause}"`);
  const k = clefRiv(cleA, idB);
  const r = R[k] || (R[k] = { a: cleA, b: idB, nomB: nomB || String(idB),
                              chaleur: 0, causes: [], depuis: jour, dernier: jour });
  /* Ce qu'il reste de chaud au moment ou le fait tombe. */
  r.chaleur = Math.max(0, chaleur(r, jour)) + c.poids;
  r.chaleur = Math.min(100, r.chaleur);
  r.dernier = jour;
  if (nomB) r.nomB = nomB;
  r.causes.unshift({ cause, jour });
  if (r.causes.length > 6) r.causes.pop();
  return r;
}

/** La chaleur d'aujourd'hui, refroidissement compris. */
function chaleur(r, jour) {
  if (!r) return 0;
  return Math.max(0, r.chaleur - Math.max(0, jour - r.dernier) * REFROIDIT_PAR_JOUR);
}

/** Une rivalite est VIVANTE au-dela de 25 : en dessous, c'est un souvenir. */
function vivante(r, jour) { return chaleur(r, jour) >= 25; }

/** Le mot qui la resume, tire de ce qui l'a nourrie. */
function mot(r, jour) {
  if (!r || !r.causes.length) return "";
  const c = CAUSES[r.causes[0].cause];
  const ch = chaleur(r, jour);
  const ton = ch >= 70 ? "Ça n'est plus du sport." : ch >= 45 ? "Il attend ce combat." : "Il n'a pas oublié.";
  return `${c.mot(r.nomB)} ${ton}`;
}

/** Les rivalites vivantes d'un homme, la plus chaude d'abord. */
function rivalitesDe(R, cleA, jour) {
  return Object.values(R || {})
    .filter((r) => r.a === cleA && vivante(r, jour))
    .sort((x, y) => chaleur(y, jour) - chaleur(x, jour));
}

/**
 * CE QUE LA RIVALITE FAIT AU COMBAT. /!\ ELLE NE TOUCHE PAS AU MOTEUR :
 * on ne truque pas un combat parce qu'il y a une histoire. Elle agit sur
 * ce qui se negocie AUTOUR — la bourse, ce que la presse en fait, et ce
 * que la victoire ou la defaite pese entre lui et toi.
 */
function effetsDuCombat(r, jour) {
  const ch = chaleur(r, jour);
  if (ch < 25) return null;
  const f = ch / 100;
  return {
    bourse: 1 + f * 0.45,        // une revanche attendue se vend
    notoriete: 1 + f * 0.8,      // et elle se raconte
    entente: Math.round(f * 6),  // gagner CE combat-la compte double pour lui
  };
}

module.exports = {
  RANGS, plaqueDe, bilanMaison, poidsDuMur,
  OBJECTIFS, TIERS, objectifs, nouveaux,
  CAUSES, nourrir, chaleur, vivante, mot, rivalitesDe, effetsDuCombat, clefRiv,
};
