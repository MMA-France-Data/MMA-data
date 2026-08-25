/**
 * cartes.js — LA VIE DU MONDE : les cartes, les combats, les contrats.
 *
 * Module natif JS, tenu par invariants (banc 19). AUCUN fichier gele
 * touche : engine.simuler_combat, verdict.js, feuille.js, classement.js
 * et vivier.js sont utilises tels quels.
 *
 * ===================================================================
 * /!\ LES DECISIONS DE CHARPENTE (Mael, 09/08)
 * ===================================================================
 * 1. RESOLUTION A TROIS ETAGES, regle 7 tenue a chaque etage :
 *      - ta carte : moteur complet, tout s'affiche (cote jeu, pas ici) ;
 *      - toute autre carte pro : MOTEUR COMPLET, on ne conserve que le
 *        verdict et l'EMPREINTE — l'ecran ne dira jamais un chiffre que
 *        le moteur n'a pas tire ;
 *      - les amateurs hors ecran ne passent pas par ici.
 * 2. L'EMPREINTE DATEE : chaque combat resolu laisse un agrégat minuscule
 *    (frappes par cible et par position, TD, controle, methode, date,
 *    fiche d'age au jour du combat). C'est la matiere du futur rapport de
 *    scouting : la precision par zone suivra l'EXPOSITION reelle. Sans
 *    empreinte des le premier combat du monde, ces donnees sont perdues.
 * 3. LE MONDE VIEILLIT : chaque combat est tire avec la fiche hydratee A
 *    LA DATE (vivier.hydrater(m, id, annees)). Un an d'inactivite bouge
 *    reellement l'homme — progression des jeunes, declin des vieux.
 * 4. LES ORGS NE VOIENT PAS LE NIVEAU, ELLES VOIENT LA TRACE : bilan,
 *    serie, notoriete. Le radar, les signatures et les coupes ne lisent
 *    JAMAIS l.note — pas plus que le joueur ne lit celle d'un adversaire.
 * 5. PAS DE CHEMIN OBLIGE : a chaque fin de contrat, toutes les orgs
 *    evaluent. L'AFC signe un genie de TRI en direct si elle le VOIT
 *    (radar), si sa serie passe sa barre (serieRequise, la star negocie
 *    plus tot) et s'il est libre. L'echelle europeenne EMERGE des seuils.
 * 6. LES COUPES : trois defaites de rang en fin de contrat, dehors. La
 *    pyramide reste saine DANS LE TEMPS, pas seulement a la naissance.
 * 7. LA NOTORIETE SE TRANSFERE : le gain porte la notoriete de
 *    l'adversaire (classement.gagnerNotoriete, 6e parametre).
 *
 * ===================================================================
 * /!\ DISCIPLINE RNG — LA MEME QUE vivier.js
 * ===================================================================
 * Chaque combat NPC est tire dans un flux prive seme par
 * (graine du monde, jour, ids des deux hommes). Le flux partage reste
 * INTACT : la vie du monde ne contamine jamais les combats du joueur, et
 * une annee de vie se rejoue a l'identique, dans n'importe quel ordre
 * d'appels exterieurs.
 */

const V = require("./vivier.js");
const CL = require("./classement.js");
const E = require("./engine.js");
const { feuille } = require("./feuille.js");
const { verdict } = require("./verdict.js");

/* ================================================================== */
/* LE CALENDRIER. AFC toutes les 2 semaines (Mael), HEX toutes les 3   */
/* (c'est ta scene), le reste mensuel. Cartes de 12 au sommet, 10      */
/* ailleurs. Defauts poses en clair le 09/08, non repris.              */
/* ================================================================== */
const CADENCE = { AFC: 14, GFL: 30, SOK: 30, TRI: 30, HEX: 21 };
const CADENCE_NATIONALE = 30;
const TAILLE_CARTE = { AFC: 12, GFL: 12 };
const TAILLE_CARTE_DEFAUT = 10;

/* /!\ DEUX FORMATS A L'AFC (Mael, 09/08, sur le modele reel) :
   - la NUMEROTEE, une sur deux : 15 combats en 5 main card / 5 prelims /
     5 pre-prelims — le grand rendez-vous ;
   - la FIGHT NIGHT entre deux : 12 combats a grande main card (9 / 3),
     main event possible sans titre (un top 12 contre un top 8, ou une
     superstar de retour que la notoriete place devant les classes).
   L'ORDRE DE LA CARTE : la notoriete cumulee decide (la superstar passe
   devant le n°5 c. n°6) — SAUF la ceinture, qui passe devant tout.
   ET LE MAIN EVENT EST TOUJOURS EN 5 ROUNDS, titre ou pas. */
const FORMATS_AFC = [
  { type: "numerotee",   taille: 15, main: 5, prelims: 5 },   // le reste : pre-prelims
  { type: "fight_night", taille: 12, main: 9, prelims: 3 },
];

/* Le radar : en dessous, l'org ne te voit pas — un 8-0 anonyme n'existe
   pas pour l'AFC. portee x 0,4 : AFC 40, GFL 32, SOK 28, TRI 22, HEX 16.
   Un champion TRI (plafond 55) PEUT donc etre vu du sommet : le chemin
   direct existe, il n'est juste pas donne. */
const seuilRadar = org => CL.ORGS[org].portee * 0.4;

/* La cible de roster par org — celle de la naissance du monde. */
const cibleRoster = org => V.TAILLES[org] !== undefined ? V.TAILLES[org] : 30;

const jourEnAnnees = j => j / 365;

/* ================================================================== */
/* L'ETAT DE VIE D'UN HOMME. Pose paresseusement sur le leger, de       */
/* maniere DETERMINISTE (donc identique a chaque rejeu du monde).      */
/* ================================================================== */
function vitaliser(m, l) {
  if (l.vie) return l.vie;
  const h = V.melanger(m.graine ^ 0x5f356495, l.id);
  l.vie = {
    // Contrat en cours : 1 a 3 combats restants, tire de l'id — le monde
    // nait avec des contrats a tous les stades, pas tous au meme jour.
    restants: 1 + h % 3,
    // /!\ L'APPETIT A ETE RETIRE (correction Mael, 09/08) : c'etait un
    // trait invente. La variance de rythme vient du PHYSIQUE — l'encaisse
    // du dernier combat decide de l'indisponibilite (dispo ci-dessous), et
    // chacun fait sa demande une fois remis. Cause tracable, pas de trait.
    dispo: 0,                // jour a partir duquel il peut demander un combat
    // Dernier combat : etale sur les ~5 derniers mois avant le jour 0,
    // pour que les cartes du debut ne ramassent pas tout le monde.
    dernier: -(h >>> 4) % 150 - 10,
    derniers: [],            // 3 derniers resultats, "V" ou "D"
    advPrec: null,           // dernier adversaire (garde anti-revanche)
    empreintes: [],          // les 3 dernieres, datees
  };
  return l.vie;
}

/* ================================================================== */
/* LA FRAICHEUR (Mael, 09/08) : entre son dernier combat et sa remise   */
/* complete, un homme est DIMINUE. 1 = remis ; 0 = sorti de la cage.    */
/* C'est elle qui rend le dilemme reel — accepter en courte preparation */
/* coute des points de fiche, pour les NPC comme pour tes gars.         */
/* ================================================================== */
function fraicheur(v, jour) {
  if (jour >= v.dispo) return 1;
  const depuis = jour - v.dernier;
  const requis = Math.max(1, v.dispo - v.dernier);
  return Math.max(0, Math.min(1, depuis / requis));
}

/** Applique la meforme a une fiche hydratee — MEME PRECEDENT QUE LA
 *  PESEE (cardioJourJ) : un facteur sur le physique, pas un systeme
 *  neuf. A fraicheur 0 : cardio -25 %, menton -20 %, recuperation
 *  -10 %. Lineaire jusqu'a la remise complete. */
function appliquerFraicheur(f, fr) {
  if (fr >= 1) return;
  const manque = 1 - fr;
  f.physical.cardio = Math.round(f.physical.cardio * (1 - 0.25 * manque));
  f.physical.chin = Math.round(f.physical.chin * (1 - 0.20 * manque));
  f.physical.recovery = Math.round(f.physical.recovery * (1 - 0.10 * manque));
}

/* ================================================================== */
/* LE MATCHMAKING D'UNE CARTE. Sur la TRACE seulement.                  */
/* ================================================================== */
function batirCarte(m, org, jour, format) {
  const taille = format ? format.taille
    : TAILLE_CARTE[org] !== undefined ? TAILLE_CARTE[org] : TAILLE_CARTE_DEFAUT;
  const paires = [];

  // Les plus en manque de combat d'abord, toutes divisions confondues —
  // c'est le matchmaking qui produit le rythme individuel (2-3 combats
  // par an), pas un quota.
  const attente = [];
  /* /!\ LE MONDE NE PROGRAMME PAS DEUX HOMMES DE LA SALLE ENSEMBLE (Mael,
     10/08 : "mon combattant a combattu un autre combattant de ma salle,
     j'etais dans le camp que de 1, l'autre a meme pas eu de
     proposition"). LA CARTE DU MONDE prend TOUT le roster, tes hommes
     compris — c'est voulu, c'est ainsi qu'ils recoivent des adversaires.
     Mais rien n'empechait qu'elle en apparie DEUX DES TIENS : et alors
     un seul avait recu l'offre et prepare un camp, l'autre montait dans
     la cage sans avoir rien accepte.
     ON NE LES RETIRE PAS DU VIVIER (ils doivent combattre) : on marque
     ceux de la salle, et cherche() refusera de les mettre face a face. */
  for (const div of m.divisions)
    for (const id of m.rosters[org][div]) {
      const l = m.pros.get(id);
      vitaliser(m, l);
      attente.push(l);
    }
  // /!\ ON N'APPARIE QUE LES DISPONIBLES : un homme couche par son
  // dernier combat n'a pas fait de demande. Parmi eux, l'attente ponderee
  // par le nom (garde par Mael) — les stars vendent, l'orga les rappelle.
  const dispos = attente.filter(l => jour >= l.vie.dispo);
  // /!\ LA COURTE PREPARATION (Mael) : un NPC peut accepter DIMINUE quand
  // personne d'autre n'est remis — jamais sous 55 % de fraicheur, on ne
  // remonte pas dans la cage a moitie mort. cherche() prefere TOUJOURS un
  // remis ; le semi-remis n'est pris que faute de mieux.
  const semis = attente.filter(l => jour < l.vie.dispo && fraicheur(l.vie, jour) >= 0.55);
  const prio = l => (jour - l.vie.dernier) * (1 + l.notoriete / 200);
  dispos.sort((a, b) => prio(b) - prio(a));

  const pris = new Set();
  const cherche = (l) => {
    // Un adversaire de la meme division, DISPONIBLE, le plus proche a la
    // trace : les classes entre eux, les non-classes entre eux (la densite
    // vit dans le matchmaking — regle de classement.js).
    // /!\ LE COULOIR DE SAUT (Mael, 09/08) : "je suis top 15, personne de
    // dispo, seulement un top 6 — je peux gruger les etapes, dans la
    // mesure du logique." Le matchmaker prefere TOUJOURS l'ecart minimal ;
    // le saut n'est permis que faute de mieux, et borne : un classe peut
    // monter jusqu'a 8 rangs au-dessus de lui, un non-classe ne saute
    // JAMAIS dans le top 5. Celui qui saute et gagne est paye cash par
    // bouger(). Le titre, lui, reste garde par le main event des cartes.
    const rl = l.rang !== null ? l.rang : CL.NON_CLASSE;
    const balaie = (pool) => {
      let best = null, bestD = Infinity;
      for (const c of pool) {
        if (c === l || pris.has(c.id) || c.division !== l.division) continue;
        /* /!\ LE MONDE NE LES APPARIE JAMAIS TOUT SEUL. Un duel entre
           deux de tes hommes est une DECISION DU JOUEUR : elle passe par
           une offre marquee `interne`, ou il repond une fois pour les
           deux (arbitrage Mael, 10/08). Ici, cote monde, personne ne
           monte dans la cage sans avoir signe. */
        if (c.salle && l.salle) continue;
        if (c.id === l.vie.advPrec) continue;               // pas de revanche immediate
        const rc = c.rang !== null ? c.rang : CL.NON_CLASSE;
        const haut = Math.min(rl, rc), bas = Math.max(rl, rc);
        if (bas - haut > 8) continue;                       // hors couloir
        if (haut <= 5 && bas === CL.NON_CLASSE) continue;   // pas de non-classe dans le top 5
        const d = Math.abs(rl - rc) + Math.abs(l.vie.dernier - c.vie.dernier) * 0.01;
        if (d < bestD) { bestD = d; best = c; }
      }
      return best;
    };
    return balaie(dispos) || balaie(semis);                 // le remis d'abord, toujours
  };

  for (const l of dispos) {
    if (paires.length >= taille) break;
    if (pris.has(l.id)) continue;
    const adv = cherche(l);
    if (!adv) continue;
    pris.add(l.id); pris.add(adv.id);
    paires.push([l, adv]);
  }

  // La place sur la carte suit ce qu'elle vend : la notoriete cumulee.
  // Le combat de titre, s'il est la, est TOUJOURS le main event.
  paires.sort((a, b) =>
    (a[0].notoriete + a[1].notoriete) - (b[0].notoriete + b[1].notoriete));
  let iTitre = paires.findIndex(p => p[0].champion || p[1].champion);
  // /!\ LA CEINTURE VACANTE SE REMET EN JEU (10/08) : si LA DIVISION n'a
  // plus de champion, la paire qui contient le MIEUX CLASSE joue le
  // titre. C'est le reel : un champion part, l'organisation monte un
  // combat de couronnement, elle ne laisse pas la ceinture morte.
  // /!\ LA VERIFICATION SE FAIT AU NIVEAU DE LA DIVISION, PAS DE LA
  // CARTE (attrape par le banc : NLD_N poids moyen, DEUX champions) :
  // un champion qui ne combat pas CE SOIR n'est pas une ceinture
  // vacante. Premiere version : iTitre < 0 suffisait — faux.
  let titreVacant = -1;
  if (iTitre < 0) {
    const divisionAChampion = paires.length &&
      (m.rosters[org][paires[0][0].division] || [])
        .some(id => { const x = m.pros.get(id); return x && x.champion; });
    if (!divisionAChampion) {
      let meilleur = Infinity;
      for (let i = 0; i < paires.length; i++) {
        const [x, y] = paires[i];
        const r = Math.min(x.rang !== null ? x.rang : 99, y.rang !== null ? y.rang : 99);
        if (r < meilleur) { meilleur = r; titreVacant = i; }
      }
      if (meilleur > 5) titreVacant = -1;   // pas de couronnement entre inconnus
      iTitre = titreVacant;
    }
  }
  if (iTitre >= 0) paires.push(...paires.splice(iTitre, 1));

  // Les places, du bas vers le haut de l'affiche. Sans format : l'ancienne
  // decoupe (main card de 6). Avec : la decoupe du format, pre-prelims
  // comprises pour la numerotee.
  const n = paires.length;
  const main = format ? format.main : 6;
  const prel = format ? format.prelims : n - main;
  return paires.map((p, i) => {
    const depuisHaut = n - 1 - i;
    return {
      a: p[0], b: p[1],
      /* /!\ LES RANGS SE TAMPONNENT A L'APPARIEMENT (10/08) : les combats
         d'une meme carte bougent l'echelle ENTRE EUX — captures a la
         resolution, les rangs derivaient et le couloir semblait viole
         ("#9 c. NC") alors que la paire etait legale a sa creation. */
      rangA: p[0].rang, rangB: p[1].rang,
      titre: p[0].champion || p[1].champion
           || (titreVacant >= 0 && i === n - 1),
      place: depuisHaut === 0 ? "main_event"
           : depuisHaut === 1 ? "co_main"
           : depuisHaut < main ? "main_card"
           : depuisHaut < main + prel ? "prelims" : "pre_prelims",
    };
  });
}

/* ================================================================== */
/* L'EMPREINTE : ce que le combat a MONTRE, lue dans la feuille — donc  */
/* dans le log — donc dans ce que le moteur a reellement tire.          */
/* ================================================================== */
function empreinte(fl, cote, jour, age, methode, rounds, fini) {
  const t = fl.total[cote];
  const adv = fl.total[1 - cote];
  const zone = {};
  for (const c of ["tete", "corps", "jambe"]) zone[c] = t[c].slice();
  const pos = {};
  for (const p of ["distance", "clinch", "sol"]) pos[p] = t[p].slice();
  return { jour, age, methode, rounds,
           sig: t.sig.slice(), zone, pos,
           td: t.td.slice(), sub: t.sub, controle: t.controle, kd: t.kd,
           // /!\ L'ENCAISSE (Mael, 09/08) : ce que le combat lui a coute.
           // C'est lui qui decide de l'indisponibilite — et il nourrira
           // le scouting (un homme qui sort d'une guerre se prepare
           // autrement) et l'usure du chantier L.
           pris: { sig: adv.sig[0], tete: adv.tete[0], kd: adv.kd, fini: fini || null } };
}

/* ================================================================== */
/* RESOUDRE UN COMBAT NPC : moteur complet, verdict + empreinte seuls   */
/* conserves. Le flux partage n'est pas touche.                         */
/* ================================================================== */
function resoudre(m, combat, org, jour) {
  const { a, b, titre, place } = combat;
  const annees = jourEnAnnees(jour);
  // /!\ LE MAIN EVENT EST TOUJOURS EN 5 ROUNDS, titre ou pas (Mael, sur
  // le modele reel : le retour d'une superstar se joue en 5).
  const rounds = (titre || place === "main_event") ? 5 : 3;

  const graineCombat = V.melanger(m.graine ^ (jour * 2654435761 >>> 0),
                                  V.melanger(a.id, b.id));
  // /!\ AIGUILLAGE : un homme de la salle apporte SA fiche (elle porte son
  // histoire) ; le monde se refabrique a la date. Cf. salle.js.
  /* /!\ LA FICHE STOCKEE FAIT FOI, POUR TOUT LE MONDE (10/08, meme regle
     que salle.js cas 23). Les huit tetes d'affiche portent une fiche
     CALIBREE A LA MAIN — avec leur trou volontaire. Les hydrater la
     refabriquerait depuis leur note et effacerait ce qui fait leur
     identite ; et comme elles n'ont pas les metadonnees du vivier, ca
     levait "Cannot read properties of undefined (reading 'archetypes')"
     des le premier combat. */
  const ficheDe = (l) => l.fiche
    ? l.fiche
    : (l.salle
        ? (() => { throw new Error(`cartes.js : ${l.nom} sans fiche stockée`); })()
        : V.hydrater(m, l.id, annees).fiche);
  const [fa, fb] = [ficheDe(a), ficheDe(b)];
  // La meforme du jour, appliquee AVANT le combat et CAPTUREE : l'ecran
  // et le scouting sauront qu'il est monte diminue (regle 7).
  const frA = fraicheur(a.vie, jour), frB = fraicheur(b.vie, jour);
  appliquerFraicheur(fa, frA); appliquerFraicheur(fb, frB);
  // /!\ CONTRAINTE LATENTE REVELEE PAR LA VIE DU MONDE : verdict.js et
  // feuille.js lisent les noms en (\S+) — UN SEUL MOT. Le banc verdict le
  // savait sans le dire : il renomme ses hommes "Okonkwo", "Rouge", "Bleu"
  // avant de jouer. On suit la solution maison (les "noms prefixes" du
  // carnet) : le moteur combat sous des jetons, les vrais noms vivent dans
  // la fiche legere et ne traversent jamais un log.
  fa.name = "A"; fb.name = "B";

  let gagnant, log;
  V.avecFlux(graineCombat, () => {
    [gagnant, log] = E.simuler_combat(fa, fb, rounds, false);
  });

  const vd = verdict(log, "A", "B");
  const fl = feuille(log, "A", "B");
  // maniere pour classement/notoriete : 3 finish · 2 decision nette
  // (3 points d'ecart ou plus sur la carte) · 1 combat serre.
  const fini = vd.methode !== "DÉCISION";
  let maniere = 3;
  if (!fini) {
    const c = (vd.detail || "").match(/(\d+)-(\d+)/);
    maniere = c && Number(c[1]) - Number(c[2]) >= 3 ? 2 : 1;
  }

  const [lV, lP] = gagnant === fa ? [a, b] : gagnant === fb ? [b, a] : [null, null];
  const res = { jour, org, place, titre, format: rounds, a: a.id, b: b.id,
                rangA: combat.rangA !== undefined ? combat.rangA : a.rang,
                rangB: combat.rangB !== undefined ? combat.rangB : b.rang,
                frA: Math.round(frA * 100) / 100, frB: Math.round(frB * 100) / 100,
                vainqueur: lV ? lV.id : null, methode: vd.methode,
                round: vd.round, detail: vd.libelle };

  const maj = (l, adv, gagne) => {
    const v = l.vie;
    if (gagne) { l.bilan.v++; l.bilan.serie++; }
    else if (lV !== null) { l.bilan.d++; l.bilan.serie = 0; }
    v.derniers.push(gagne ? "V" : lV === null ? "N" : "D");
    if (v.derniers.length > 3) v.derniers.shift();
    v.dernier = jour; v.advPrec = adv.id;
    // /!\ LA NOTORIETE SE TRANSFERE : 6e parametre, celle de l'adversaire.
    l.notoriete = CL.gagnerNotoriete(org, place, l.notoriete, gagne, maniere,
                                     adv.notoriete);
    const cote = l === a ? 0 : 1;
    const age = l.age + Math.trunc(annees + (l.id % 12) / 12); // anniversaire etale
    const finiSubi = !gagne && lV !== null && fini ? vd.methode : null;
    const emp = empreinte(fl, cote, jour, age, vd.methode, vd.round || rounds, finiSubi);
    emp.fraicheur = cote === 0 ? res.frA : res.frB;   // il etait diminue, ca se saura
    /* /!\ L'EMPREINTE PORTE DESORMAIS DE QUOI SE LIRE (Mael, 10/08 : il
       veut ouvrir la fiche d'un combattant du monde et cliquer sur ses
       combats). Sans l'adversaire ni l'issue, une empreinte n'est qu'un
       tas de chiffres anonymes : impossible d'en faire un palmares. */
    emp.adv = adv.id; emp.advNom = adv.nom; emp.gagne = gagne;
    emp.org = org; emp.titre = !!titre; emp.detail = vd.libelle || vd.methode;
    v.empreintes.push(emp);
    if (v.empreintes.length > 6) v.empreintes.shift();
    // /!\ L'INDISPONIBILITE DECOULE DE L'ENCAISSE (Mael, 09/08) : ~21 j
    // de plancher (camp court + recuperation), + les frappes prises, + la
    // suspension type commission si on a ete fini — KO subi ~+60 j, TKO
    // ~+40, soumission +15 (le corps est entier, l'ego moins). Un combat
    // tranquille rend vite ; une guerre couche trois mois. C'est CA qui
    // fait le rythme de chacun — cause physique, tracable, pas de trait.
    let repos = 21 + emp.pris.sig * 0.35 + emp.pris.kd * 10;
    if (finiSubi === "KO") repos += 60;
    else if (finiSubi === "TKO") repos += 40;
    else if (finiSubi === "SOUMISSION") repos += 15;
    v.dispo = jour + Math.round(repos);
  };
  if (lV !== null) { maj(lV, lP, true); maj(lP, lV, false); }
  else { maj(a, b, false); maj(b, a, false); }

  // Le classement bouge ; la ceinture change de taille si le titre tombe.
  if (lV !== null) {
    // /!\ L'ECHELLE REMPLACE bouger() (arbitrage Mael, 10/08) : le
    // vainqueur prend la place du perdant s'il etait derriere, le perdant
    // recule s'il etait devant. bouger() reste au module pour l'histoire
    // et ses bancs, plus personne ne l'appelle en vie de monde.
    CL.bougerEchelle(m, org, a.division, lV.id, lP.id, maniere >= 3);
    // /!\ UN COMBAT DE TITRE COURONNE TOUJOURS SON VAINQUEUR (10/08) :
    // l'ancienne garde `titre && lP.champion` couvrait la defense mais pas
    // la CEINTURE VACANTE — quand le champion etait parti (signature
    // ailleurs, retraite), plus aucun combat ne pouvait couronner et la
    // division restait sans champion A JAMAIS. Mesure : HEX poids plume,
    // ceinture eteinte au jour 53, encore eteinte au jour 90.
    if (titre) {
      // /!\ LES FAITS DE CARRIERE (Mael, 10/08 : "je veux voir les
      // palmares sur chaque fiche — 2026 champion UFC, 2027 perd la
      // ceinture, 2028 reprise"). On grave l'evenement SUR L'HOMME, au
      // moment ou il arrive : une ceinture reconstituee apres coup serait
      // une invention. Vaut pour le monde entier, donc pour les legendes.
      const an = 2026 + Math.floor(jour / 365);
      (lV.faits = lV.faits || []).push({ an, quoi: lP.champion
        ? `Champion ${org} (${a.division.replace(/_/g, " ")})`
        : `Titre ${org} vacant remporté (${a.division.replace(/_/g, " ")})` });
      if (lP.champion)
        (lP.faits = lP.faits || []).push({ an, quoi: `Perd la ceinture ${org}` });
      if (lP.champion) lP.champion = false;
      lV.champion = true; lV.rang = 1;
    }
    // /!\ retasser() NE TOURNE PLUS ICI (10/08) : il reecrivait les rangs
    // a l'ancienne APRES le mouvement d'echelle et les deux se battaient.
    // L'echelle est seule maitresse ; synchroniserRangs ecrit la fenetre.
    CL.synchroniserRangs(m, org, a.division);
    lV.vie.restants--; lP.vie.restants--;
  } else { a.vie.restants--; b.vie.restants--; }

  return res;
}

/* ================================================================== */
/* RETASSER : bouger() est PAIRWISE, deux hommes peuvent atterrir au    */
/* meme rang. Apres chaque combat, les classes de la division se        */
/* reordonnent — celui qui vient de bouger gagne l'egalite (il vient de */
/* la meriter), le champion reste n°1, et tout se recompresse en 1-15   */
/* sans trou ni doublon. Deterministe : l'egalite restante se tranche   */
/* a l'id.                                                              */
/* ================================================================== */
function retasser(m, org, div, vientDeBouger) {
  const classes = m.rosters[org][div]
    .map(id => m.pros.get(id))
    .filter(l => l.rang !== null);
  classes.sort((x, y) =>
    (x.champion ? -1 : x.rang) - (y.champion ? -1 : y.rang)
    || (x === vientDeBouger ? -1 : y === vientDeBouger ? 1 : 0)
    || x.id - y.id);
  classes.forEach((l, i) => { l.rang = i + 1; });
  for (const l of classes) if (l.rang > 15) l.rang = null;
}

/* ================================================================== */
/* LA FIN DE CONTRAT : coupes, signatures inter-orgs, re-signature,     */
/* nouveau sang. TOUT SUR LA TRACE, jamais sur la note.                 */
/* ================================================================== */
function finsDeContrat(m, org, jour, journal) {
  const annees = jourEnAnnees(jour);
  for (const div of m.divisions) {
    const roster = m.rosters[org][div];
    for (const id of roster.slice()) {
      const l = m.pros.get(id);
      // /!\ LA VIE DU MONDE NE TOUCHE PAS AUX HOMMES DE LA SALLE (Mael,
      // en jouant : "je signe un gars, il passe dans pros, et apres
      // quelques jours il disparait"). Le matchmaking les apparie comme
      // tout le monde — c'est voulu — mais leurs CONTRATS appartiennent
      // au joueur : l'organisation ne peut ni les couper, ni les faire
      // signer ailleurs, ni les mettre a la retraite dans son dos.
      if (l.salle) continue;
      const v = vitaliser(m, l);
      if (v.restants > 0) continue;

      // /!\ LA CEINTURE ROUVRE LE CONTRAT — POUR LES PNJ AUSSI (10/08).
      // La regle existait cote joueur (contrats.etat, banc 26) mais pas
      // dans le monde : Lefort prenait le titre HEX au jour 53 et signait
      // chez TRI LE MEME JOUR, ceinture eteinte. Une organisation
      // re-signe son champion — il ne touche pas le marche.
      if (l.champion) {
        v.restants = 3;
        journal.push({ jour, type: "prolongation", org, id, nom: l.nom, champion: true });
        continue;
      }

      const ageActuel = l.age + Math.trunc(annees);
      const troisDefaites = v.derniers.length >= 3 && v.derniers.every(r => r === "D");
      const vieuxUse = ageActuel >= 36 && v.derniers.slice(-2).every(r => r === "D");

      // 1. LA COUPE — trois defaites de rang, dehors (Mael). Un vieux sur
      //    deux defaites raccroche de lui-meme.
      if (troisDefaites || vieuxUse) {
        retirer(m, org, div, l);
        l.libre = true;
        if (vieuxUse || ageActuel >= 38) {
          l.retraite = true;
          // Une legende qui raccroche, ca se sait : on garde de quoi
          // l'annoncer (et de quoi ouvrir sa fiche).
          const titres = (l.faits || []).filter(f => /Champion/.test(f.quoi)).length;
          if (titres > 0 || (l.bilan.v >= 18 && l.bilan.v - l.bilan.d >= 10))
            (m.legendes = m.legendes || []).push({ jour, id, nom: l.nom, org,
              division: l.division, age: ageActuel, titres,
              bilan: `${l.bilan.v}-${l.bilan.d}`, faits: (l.faits || []).slice(0, 8) });
          m.pros.delete(id);
        }
        journal.push({ jour, type: vieuxUse ? "retraite" : "coupe", org, id, nom: l.nom,
                       derniers: v.derniers.slice(), age: ageActuel });
        continue;
      }

      // 2. LA MONTEE — une org plus haute le voit et le veut ? Toutes
      //    evaluent, de la plus haute a la sienne : pas de chemin oblige.
      const dessus = Object.keys(CL.ORGS)
        .filter(o => CL.ORGS[o].portee > CL.ORGS[org].portee)
        .sort((x, y) => CL.ORGS[y].portee - CL.ORGS[x].portee);
      let signe = null;
      for (const o of dessus) {
        if (l.notoriete < seuilRadar(o)) continue;          // il ne te VOIT pas
        if (l.bilan.serie < CL.serieRequise(o, l.notoriete)) continue;
        // /!\ LA BANDE, PAS LE VERROU STRICT (deux effets couples, payes au
        // banc) : strict, les trous se rebouchaient au nouveau sang avant
        // qu'une org d'en bas les voie — zero montee sur l'annee ; sans
        // verrou, les rosters gonflaient sans redescendre. On signe d'en
        // bas jusqu'a cible+2, on ne recomplete qu'en dessous de cible-1 :
        // les trous qui restent SONT les places du marche.
        if (m.rosters[o][div].length >= cibleRoster(o) + 2) continue;
        signe = o; break;
      }
      if (signe) {
        retirer(m, org, div, l);
        l.org = signe; l.rang = null; l.champion = false;
        v.restants = 3; v.derniers = [];
        m.rosters[signe][div].push(id);
        journal.push({ jour, type: "signature", org: signe, depuis: org, id, nom: l.nom });
        continue;
      }

      // 3. LA RE-SIGNATURE — trois combats de plus, chez soi.
      v.restants = 3;
      journal.push({ jour, type: "prolongation", org, id, nom: l.nom });
    }

    // 4. LE NOUVEAU SANG — le roster se recomplete : d'abord un libre que
    //    l'org VOIT, sinon un jeune du pays qui passe pro.
    while (roster.length < cibleRoster(org) - 1) {
      let pris = null;
      for (const l of m.pros.values()) {
        if (l.salle) continue;                 // jamais un homme du joueur
        if (!l.libre || l.division !== div) continue;
        if (l.notoriete < seuilRadar(org) * 0.6) continue;  // un coupe connu reste visible
        // /!\ PAS LE D-D-D TOUT FRAIS : sans ce filtre, l'org coupait un
        // homme et le re-signait dans le meme geste. Trois defaites de
        // rang, personne ne te rappelle — il faudra reconstruire ailleurs.
        if (l.vie && l.vie.derniers.length >= 3 && l.vie.derniers.every(x => x === "D")) continue;
        pris = l; break;
      }
      if (pris) {
        pris.libre = false; pris.org = org; pris.rang = null; pris.champion = false;
        vitaliser(m, pris); pris.vie.restants = 3; pris.vie.derniers = [];
        roster.push(pris.id);
        journal.push({ jour, type: "signature", org, depuis: "libre", id: pris.id, nom: pris.nom });
      } else {
        const paysOrg = paysDe(org);
        const h = V.nouveauPro(m, paysOrg, div, annees);
        const l = h.leger;
        l.org = org; l.rang = null; l.champion = false; l.notoriete = 0;
        const v = vitaliser(m, l); v.restants = 3; v.dernier = jour - 30;
        roster.push(l.id);
        journal.push({ jour, type: "debut", org, id: l.id, nom: l.nom });
      }
    }
  }
}

function retirer(m, org, div, l) {
  const r = m.rosters[org][div];
  const i = r.indexOf(l.id);
  if (i >= 0) r.splice(i, 1);
  l.org = null; l.rang = null; l.champion = false;
}

/** Le pays ou une org recrute son nouveau sang. Les internationales
 *  piochent au poids de la tradition ; ici, la premiere du continent. */
function paysDe(org) {
  const o = CL.ORGS[org];
  if (org === "SOK") return "POL";
  if (o.pays === "France") return "FRA";
  if (o.pays === "USA") return "USA";
  for (const p of V.PAYS) if (p.nom === o.pays) return p.cle;
  return "USA";
}

/* ================================================================== */
/* VIVRE : avancer le monde jusqu'a un jour donne. Rend le journal des  */
/* evenements et les resultats des cartes — c'est la matiere des        */
/* depeches et de l'onglet COMBATS cote jeu.                            */
/* ================================================================== */
function vivre(m, jourDe, jourA) {
  if (!m.vie) m.vie = { prochaine: {} };
  const P = m.vie.prochaine;
  for (const org of Object.keys(CL.ORGS))
    if (P[org] === undefined)
      // Etalees pour ne pas tomber toutes le meme jour, deterministe.
      P[org] = V.melanger(m.graine, org.length * 131 + org.charCodeAt(0)) % 21;

  const journal = [], resultats = [];
  for (let j = jourDe; j <= jourA; j++) {
    for (const org of Object.keys(CL.ORGS)) {
      if (j < P[org]) continue;
      const cadence = CADENCE[org] !== undefined ? CADENCE[org] : CADENCE_NATIONALE;
      P[org] = j + cadence;
      let format = null;
      if (org === "AFC") {
        m.vie.nAFC = (m.vie.nAFC || 0) + 1;
        format = FORMATS_AFC[m.vie.nAFC % 2];   // impair : numerotee d'abord
      }
      const carte = batirCarte(m, org, j, format);
      for (const combat of carte) resultats.push(resoudre(m, combat, org, j));
      finsDeContrat(m, org, j, journal);
    }
  }
  return { journal, resultats };
}

module.exports = { CADENCE, TAILLE_CARTE, FORMATS_AFC, fraicheur, appliquerFraicheur,
                   seuilRadar, cibleRoster,
                   vitaliser, batirCarte, resoudre, finsDeContrat, vivre };

