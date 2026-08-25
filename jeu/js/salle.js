/**
 * salle.js — LE RACCORD ENTRE TA SALLE ET LE MONDE.
 *
 * Module natif JS, tenu par invariants (banc 25). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ LE PROBLEME QUE CE MODULE RESOUT
 * ===================================================================
 * Deux mondes se sont construits en parallele et ne se connaissent pas :
 *   - demo_jeu.html a SES combattants (fiches.js : Okonkwo, Kante,
 *     Traore...), persistants, avec leur historique ecrit a la main ;
 *   - vivier.js a 4500 pros en fiches LEGERES, refabricables, ranges dans
 *     les rosters de seize organisations.
 * Sans raccord, tes hommes n'existent pour personne : pas d'offre, pas de
 * classement, pas d'adversaire. C'est LE branchement qui manque.
 *
 * ===================================================================
 * /!\ LA REGLE D'OR : TES HOMMES SONT L'EXCEPTION PERSISTANTE
 * ===================================================================
 * Un pro du monde est une FONCTION (graine, id) qu'on refabrique. Un homme
 * de ta salle, NON : sa progression depend de tes coachs, ton materiel,
 * ton sparring. Il est stocke, entier, et il ne redevient JAMAIS une
 * fonction.
 * D'ou l'ID NEGATIF : tous les ids du monde sont positifs (idPro,
 * idAmateur). Les tiens sont negatifs. Un id negatif ne DOIT JAMAIS
 * atteindre vivier.hydrater — c'est un invariant du banc, et c'est ce qui
 * garantit qu'on ne refabriquera jamais par erreur un homme qui a une
 * histoire.
 */

const V = require("./vivier.js");
const C = require("./cartes.js");
const CL = require("./classement.js");
const EN = require("./entente.js");
const FI = require("./fiches.js");
const G = require("./generator.js");
const CA = require("./carriere.js");

/** L'organisation ou la salle demarre. Marseille, nationale francaise. */
const ORG_DEPART = "HEX";

/**
 * La cle de fiches.js correspondant a une cle du jeu. /!\ Les deux
 * tables ont ete ecrites a des moments differents : les accents et la
 * casse ne correspondent pas toujours. On compare SANS accent.
 */
function cleFiche(cle) {
  if (FI.FICHES[cle]) return cle;
  const nu = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const cible = nu(cle);
  for (const k of Object.keys(FI.FICHES)) if (nu(k) === cible) return k;
  return cle;
}

/** Les ids de la salle sont NEGATIFS. Voir l'en-tete.
 *  /!\ CE COMPTEUR EST DE L'ETAT, PAS UNE VARIABLE DE MODULE (Mael,
 *  10/08 : ses deux pros remplaces par des gamins de 18 ans). Il repartait
 *  a -1 A CHAQUE RECHARGEMENT DE LA PAGE : le premier nouvel arrivant
 *  recevait l'id -1, DEJA OCCUPE par le premier homme de la salle, et
 *  l'ECRASAIT dans m.pros (une Map : meme cle = remplacement silencieux).
 *  Six ans de partie, des dizaines de recrues, tous ses hommes ecrases un
 *  par un. On le sauvegarde, ET on le recale sur le monde a chaque
 *  inscription — ceinture et bretelles. */
let prochainId = -1;
function nouvelId(m) {
  if (m && m.pros) {
    // Le plus petit id existant fait foi : jamais deux fois le meme.
    let plancher = 0;
    for (const id of m.pros.keys()) if (id < plancher) plancher = id;
    if (plancher - 1 < prochainId) prochainId = plancher - 1;
  }
  return prochainId--;
}
function idCourant() { return prochainId; }
function poserIdCourant(v) { if (typeof v === "number" && v < 0) prochainId = v; }

/** Un id de salle ne doit jamais partir a l'hydratation. */
const estDeLaSalle = (id) => id < 0;

/**
 * /!\ FABRIQUER LA FICHE D'UN HOMME DE LA SALLE QUI N'EN A PAS.
 * Trouve en jouant (09/08) : sur quinze amateurs, UN SEUL avait une fiche
 * ecrite a la main. Les autres n'etaient que des noms — donc rien a faire
 * progresser, rien a evaluer, et "Parler" ouvrait un panneau VIDE.
 * On la fabrique depuis ce que le jeu declare de lui (age, archetype,
 * categorie), dans un flux RNG prive seme par sa cle : deux parties
 * differentes donnent le meme homme, et le flux partage n'est pas touche.
 * /!\ UNE FOIS FABRIQUEE ELLE EST STOCKEE : sa progression depend de TES
 * coachs. Il ne redevient jamais une fonction du temps.
 */
function fabriquerFicheSalle(h) {
  const graine = [...String(h.cle || h.nom)]
    .reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  return V.avecFlux(graine, () => {
    const [f] = G.generer_combattant({
      niveau: 60, archetype: h.archetype || "polyvalent",
      division: h.division, nom: h.cle || h.nom });
    // Le niveau se DEDUIT de son histoire, comme pour tout le monde.
    CA.poser(f, { age: h.age, ageDebut: h.ageDebut !== undefined
      ? h.ageDebut : Math.max(12, h.age - (h.annees || 3)) });
    return f;
  });
}

/**
 * Inscrire un combattant de la salle dans le monde.
 *
 * Il entre dans le roster de l'organisation avec une fiche LEGERE de meme
 * forme que celles du vivier — c'est ce qui permet au matchmaking, aux
 * classements et aux offres de le traiter comme n'importe qui. Mais sa
 * fiche moteur, elle, reste CELLE DE LA SALLE : elle est fournie ici et
 * stockee, jamais refabriquee.
 *
 * @param {object} m       le monde
 * @param {object} h       { cle, nom, division, age, bilan:[v,d], fiche }
 * @param {string} [org]
 */
function inscrire(m, h, org = ORG_DEPART, roster = true) {
  if (roster) {
    if (!m.rosters[org]) throw new Error(`salle.js : organisation inconnue "${org}"`);
    if (!m.rosters[org][h.division])
      throw new Error(`salle.js : division inconnue "${h.division}"`);
  }

  const id = nouvelId(m);
  const [v, d] = h.bilan || [0, 0];
  const leger = {
    id, nom: h.nom, pays: "FRA", division: h.division,
    archetype: h.archetype || "polyvalent",
    // /!\ PAS DE `note` : les orgs ne voient QUE la trace (regle du
    // carnet). Le joueur, lui, voit la fiche complete de SES hommes —
    // mais ca ne passe pas par ici.
    age: h.age, ageDebut: h.ageDebut !== undefined ? h.ageDebut : h.age - 8,
    j: 0,
    bilan: { v, d, serie: h.serie !== undefined ? h.serie : 0 },
    // /!\ UN AMATEUR N'A PAS D'ORGANISATION : il est de la salle, pas
    // d'une promotion. Il aura la sienne le jour ou il passera pro.
    org: roster ? org : null, amateur: !roster,
    rang: null, champion: false, notoriete: h.notoriete || 0,
    // /!\ LA MARQUE DE LA SALLE : c'est elle qui interdit l'hydratation.
    salle: true,
    fiche: h.fiche || null,          // la fiche moteur, stockee, jamais refaite
    cle: h.cle || null,              // la cle cote demo_jeu.html / fiches.js
    entente: EN.etatDepart(),
  };
  C.vitaliser(m, leger);
  // Il arrive sans combat recent : disponible tout de suite.
  leger.vie.dernier = -90; leger.vie.dispo = 0;
  m.pros.set(id, leger);
  if (roster) m.rosters[org][h.division].push(id);
  return leger;
}

/**
 * La fiche moteur d'un homme, QUEL QU'IL SOIT. C'est le seul endroit du
 * jeu qui doit servir a obtenir une fiche de combat.
 * /!\ AIGUILLAGE : les tiens sortent du stock, ceux du monde sont
 * refabriques a la date. Se tromper d'aiguillage, c'est effacer une
 * carriere ou casser le determinisme.
 */
function ficheDe(m, id, jour = 0) {
  const l = m.pros.get(id);
  if (!l) throw new Error(`salle.js : id inconnu ${id}`);
  // /!\ LA FICHE STOCKEE FAIT FOI, MARQUEUR OU PAS (Mael, 10/08 :
  // "Toussaint vient de passer a 35 partout alors qu'il etait chaud").
  // Un homme de la salle n'a PAS de `note` : si son marqueur `salle` se
  // perd en route, ficheDe repartait sur V.hydrater(), qui refabrique un
  // combattant depuis une note ABSENTE — resultat mesure : 35 PARTOUT,
  // et tout l'entrainement efface a l'ecran. La presence d'une fiche
  // stockee est la preuve qu'il est a nous : on la rend, et on RECOLLE
  // le marqueur au passage.
  /* /!\ MEME FILET QUE cartes.js : une fiche a plat (sauvegarde ancienne)
     n'est pas utilisable par le moteur. Pour un homme de la salle on la
     rend quand meme — ses STATS sont justes et l'ecran en a besoin — mais
     l'appelant qui la donne au moteur doit la rehydrater. */
  if (l.fiche) { if (!l.salle) l.salle = true; return l.fiche; }
  if (l.salle) throw new Error(`salle.js : ${l.nom} n'a pas de fiche stockée`);
  return V.hydrater(m, id, jour / 365).fiche;
}

/**
 * Reprendre l'effectif de demo_jeu.html : les pros de fiches.js entrent
 * dans le monde, les amateurs et les adherents loisir restent hors roster
 * (ils n'ont rien a y faire tant qu'ils ne sont pas pros).
 *
 * @param {object} m
 * @param {object[]} effectif  [{ cle, nom, division, age, bilan, groupe }]
 */
function reprendreEffectif(m, effectif, org = ORG_DEPART) {
  const entres = [];
  for (const h of effectif) {
    // /!\ LES AMATEURS ENTRENT AUSSI (correction du 09/08) : ils sont de
    // ta salle, ils progressent, on leur parle. Simplement ils ne sont
    // dans le roster d'AUCUNE organisation tant qu'ils ne sont pas pros.
    /* /!\ TOUT LE MONDE ENTRE (Mael, 09/08 : "faut vraiment que chaque
       personne qui rejoint la salle soit automatiquement dans l'equipe et
       apparaisse"). Les adherents loisir aussi : ils ont un corps, ils
       progressent, on peut leur parler, et un jour l'un d'eux surprendra
       tout le monde au sparring. Seuls les PROS entrent au roster d'une
       organisation. */
    const pro = !h.groupe || h.groupe === "pro";
    // /!\ FI.CLES est la table des CLES DE STATS, pas la liste des
    // combattants (piege attrape au premier essai). La liste des hommes
    // ecrits a la main est FI.FICHES.
    // /!\ ET LES ACCENTS NE CORRESPONDENT PAS : demo_jeu.html indexe
    // "Kante" avec accent, fiches.js sans. La correspondance echouait EN
    // SILENCE et n'explosait qu'au premier dialogue, trois ecrans plus
    // loin. On normalise, et on LEVE si un pro n'a pas de fiche — un
    // combattant sans fiche ne doit jamais entrer dans le monde.
    let fiche = h.fiche || null;
    if (!fiche && h.cle && FI.FICHES[cleFiche(h.cle)]) fiche = FI.fighter(cleFiche(h.cle));
    // Pas de fiche ecrite a la main ? On la fabrique. /!\ ON NE LEVE PLUS :
    // un homme de la salle a TOUJOURS des stats, ecrites ou fabriquees.
    if (!fiche) fiche = fabriquerFicheSalle(h);
    entres.push(inscrire(m, Object.assign({}, h, { fiche }), org, pro));
  }
  return entres;
}

/* ================================================================== */
/* LE TEMPS — /!\ LE MONDE NE TOURNE PAS PENDANT QUE TU REGARDES UN    */
/* COMBAT. On avance le monde JUSQU'A un jour, jamais "un peu".         */
/* ================================================================== */

/**
 * Avancer le monde jusqu'au jour du jeu. Idempotent : rappele avec le
 * meme jour, il ne rejoue rien.
 * @returns {object} { journal, resultats } — la matiere des depeches
 */
function avancerMonde(m, jour) {
  if (m.jourCourant === undefined) m.jourCourant = -1;
  if (jour <= m.jourCourant) return { journal: [], resultats: [] };
  const r = C.vivre(m, m.jourCourant + 1, jour);
  m.jourCourant = jour;
  return r;
}

/* ================================================================== */
/* CE QUE L'ECRAN A BESOIN DE SAVOIR — en une seule fonction, pour que */
/* demo_jeu.html n'ait pas a fouiller dans les structures.              */
/* ================================================================== */

/** Le classement d'une division, pret a afficher. */
function classement(m, org, division) {
  /* /!\ GARDE A LA SOURCE (Mael, 21/08 : TypeError poids_plume) : un org
     absent des rosters (perime, fantome) plantait tous les appelants. */
  return (((m.rosters || {})[org] || {})[division] || [])
    .map(id => m.pros.get(id))
    .filter(l => l && l.rang !== null)
    .sort((a, b) => a.rang - b.rang)
    .map(l => ({ rang: l.rang, nom: l.nom, champion: l.champion,
                 bilan: `${l.bilan.v}-${l.bilan.d}`, salle: !!l.salle,
                 style: l.archetype || l.style || "",   /* la presse en a besoin (21/08) */
                 id: l.id }));
}

/** Les resultats du monde qui meritent une depeche : ton org, les titres,
 *  et les combats de tes hommes. Le reste est du bruit. */
function depechesDe(m, resultats) {
  const sortie = [];
  for (const r of resultats) {
    const a = m.pros.get(r.a), b = m.pros.get(r.b);
    if (!a || !b) continue;
    const mien = a.salle || b.salle;
    if (!mien && !r.titre && r.org !== ORG_DEPART) continue;
    const vainqueur = r.vainqueur ? m.pros.get(r.vainqueur) : null;
    const perdant = vainqueur ? (vainqueur === a ? b : a) : null;
    sortie.push({
      jour: r.jour, org: r.org, titre: r.titre, mien,
      // /!\ ON REND LES IDS, PAS SEULEMENT UNE PHRASE : sans eux l'ecran
      // ne peut pas rendre les noms cliquables (Mael, 09/08).
      a: a.id, b: b.id, nomA: a.nom, nomB: b.nom,
      vainqueur: vainqueur ? vainqueur.id : null,
      nomV: vainqueur ? vainqueur.nom : null,
      nomP: perdant ? perdant.nom : null,
      detail: r.detail,
      texte: vainqueur
        ? `${vainqueur.nom} bat ${perdant.nom} — ${r.detail}.`
        : `${a.nom} et ${b.nom} se quittent sur un nul.`,
    });
  }
  return sortie;
}

module.exports = { ORG_DEPART, cleFiche, fabriquerFicheSalle, nouvelId, idCourant, poserIdCourant, estDeLaSalle, inscrire, ficheDe,
                   reprendreEffectif, avancerMonde, classement, depechesDe };
