/**
 * verdict.js — LE COMPTE RENDU OFFICIEL D'UN COMBAT, LU DANS LE LOG DU MOTEUR.
 *
 * POURQUOI UN MODULE DE PLUS, ET PAS UNE RETOUCHE DU TRADUCTEUR
 * traducteur.js produit la CHRONOLOGIE de l'ecran anime, et il est tenu
 * ligne a ligne par verifier_traducteur.js contre traducteur.py — or le
 * Python du depot est le TEMOIN HISTORIQUE, gele. Enrichir fin[] cote JS
 * ferait tomber ce banc a 0/24. Ce sont deux artefacts differents :
 *   - traducteur : ce que l'ecran MONTRE, seconde par seconde ;
 *   - verdict    : ce que le palmares RETIENT, une ligne pour toujours.
 * Ce module est donc natif JS, comme fiches.js, et il est tenu par des
 * INVARIANTS (verifier_verdict.js) plutot que par une conformite Python.
 * Le plus fort de ces invariants : verdict et traducteur doivent TOUJOURS
 * s'accorder sur la methode et le vainqueur. C'est la regle 7 avec deux
 * lectures independantes du meme log.
 *
 * RIEN N'EST INVENTE ICI. Chaque detail sort d'une ligne du log :
 * l'arme du KO est celle que le moteur a tiree, le score de la decision est
 * celui que le moteur a compte. Ce qui n'est pas dans le log n'est pas
 * affiche — pas de "decision unanime", par exemple : le moteur n'a pas
 * trois juges, il a une carte.
 */

// ---------------------------------------------------------------- vocabulaire
// L'oreille du fan francais juge. Un nom de cle du moteur (`crochet_corps`,
// `north_south_choke`) ne doit JAMAIS atteindre l'ecran.
const ARMES_FR = {
  jab: "jab", cross: "cross", crochet: "crochet", uppercut: "uppercut",
  overhand: "overhand", crochet_corps: "crochet au corps",
  low_kick: "low kick", calf_kick: "calf kick", body_kick: "body kick",
  high_kick: "high kick", teep: "teep",
  spinning_back_fist: "revers tournant", spinning_kick: "coup de pied retourné",
  wheel_kick: "wheel kick",
};

const SUBS_FR = {
  guillotine: "guillotine", guillotine_debout: "guillotine debout",
  toe_hold: "toe hold", heel_hook: "heel hook", kimura: "kimura",
  darce: "d'arce", brabo: "brabo", americana: "americana",
  arm_triangle: "arm triangle", north_south_choke: "étranglement nord-sud",
  armbar: "clé de bras", baseball_choke: "baseball choke", ezekiel: "ezekiel",
  mounted_triangle: "triangle monté", rear_naked_choke: "étranglement arrière",
  bow_and_arrow: "bow and arrow", neck_crank: "torsion de nuque",
  anaconda: "anaconda", peruvian_necktie: "cravate péruvienne",
  triangle: "triangle", omoplata: "omoplata",
};

const POSITIONS_FR = {
  closed_guard: "garde fermée", open_guard: "garde ouverte",
  butterfly_guard: "garde papillon", half_guard: "demi-garde",
  side_control: "contrôle latéral", north_south: "position nord-sud",
  knee_on_belly: "genou sur le ventre", mount: "montée",
  back_control: "dos pris", crucifix: "crucifix", turtle: "tortue",
};

/** Traduit, ou LEVE. Un terme inconnu est un trou de vocabulaire : on veut le
 *  voir au banc, pas le decouvrir a l'ecran sous forme de `north_south_choke`. */
function mot(table, cle, quoi) {
  if (!(cle in table)) throw new Error(`verdict.js : ${quoi} inconnu "${cle}"`);
  return table[cle];
}

// ------------------------------------------------------------------ lecture
/* /!\ verdict.js est VOLONTAIREMENT AUTONOME : aucun require, pour pouvoir
   etre embarque tel quel dans le bundle navigateur. On duplique donc la
   duree du round plutot que d'importer engine.js. Si elle change la-bas,
   elle doit changer ici — le banc 9 le verifie. */
const DUREE_ROUND_S = 300;

const nu = (s) => s.trim();
const hms = (r, sec) => `R${r} ${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/** Derniere ligne AVANT l'index i qui satisfait le predicat. */
function remonter(L, i, pred) {
  for (let k = i - 1; k >= 0; k--) if (pred(L[k])) return L[k];
  return null;
}

/** Position au sol la plus recemment annoncee avant l'index i. */
function positionAu(L, i) {
  const motifs = [
    /combat au sol \(([a-z_]+)\)/, /le suit au sol en ([a-z_]+)/,
    /progresse → ([a-z_]+)/, /bloqué en ([a-z_]+)/, /maintenu en ([a-z_]+)/,
    /passe en ([a-z_]+)/,
  ];
  for (let k = i - 1; k >= 0; k--)
    for (const m of motifs) {
      const r = L[k].match(m);
      // /!\ "passe en orthodox" est un CHANGEMENT DE GARDE, pas une
      // position de sol (leve en vie de monde le 10/08 : un switch avant
      // un TKO au sol faisait planter le verdict). Les mots de garde ne
      // sont pas des positions — on continue de remonter.
      if (r && r[1] !== "orthodox" && r[1] !== "southpaw") return r[1];
    }
  return null;
}

/** Une chute de `qui` : debout (KNOCKDOWN) ou au sol (sonne sous le GnP).
 *  Ce sont les deux seuls appels a encaisser_knockdown dans le moteur. */
function estChute(l, qui) {
  return l.includes(`KNOCKDOWN ! ${qui} touche le sol`)
      || l.includes(`>>> ${qui} est sonne au sol`);
}

/** Index de la DERNIERE chute de `qui` avant i, ou -1.
 *  Le moteur remet coups_sonne a zero a chaque chute : c'est donc la borne
 *  a partir de laquelle il compte, et donc la notre. */
function derniereChute(L, i, qui) {
  for (let k = i - 1; k >= 0; k--) if (estChute(L[k], qui)) return k;
  return -1;
}

/** Chutes subies par `qui` avant i. */
function chutesDe(L, i, qui) {
  let n = 0;
  for (let k = 0; k < i; k++) if (estChute(L[k], qui)) n++;
  return n;
}

/** Coups a la tete portes par `qui` depuis la chute de `sur`. C'est
 *  exactement dfn.coups_sonne du moteur — a une unite pres : le coup qui
 *  DECLENCHE l'arret est compte par le moteur mais jamais ecrit au log
 *  (le return precede le log.push). L'appelant ajoute donc 1. */
function coupsDepuisChute(L, i, qui, sur) {
  const depart = derniereChute(L, i, sur);
  if (depart < 0) return 0;
  let n = 0;
  for (let k = depart + 1; k < i; k++)
    if (new RegExp(`^\\s+${qui} \\S+ → touché .* tête$`).test(L[k])) n++;
  return n;
}

// ------------------------------------------------------------------ verdict
/**
 * @param {string[]} log   le log rendu par engine.simuler_combat
 * @param {string} nomA    nom cote A (celui du Fighter, mono-jeton)
 * @param {string} nomB    nom cote B
 * @returns {{methode,vainqueur,detail,round,echange,scores,libelle}}
 *   vainqueur : "A", "B" ou null (nul)
 *   libelle   : la ligne prete pour l'ecran, ex. "KO — crochet"
 */
function verdict(log, nomA, nomB) {
  const L = log.join("\n").split("\n");
  const cote = (nom) => (nom === nomA ? "A" : nom === nomB ? "B"
    : (() => { throw new Error(`verdict.js : nom hors affiche "${nom}"`); })());
  const autre = (c) => (c === "A" ? "B" : "A");

  // rounds effectivement joues (sert de repli si la fin n'est pas datee)
  let rounds = 0;
  for (const l of L) { const m = l.match(/──────── ROUND (\d+) ────────/); if (m) rounds = Number(m[1]); }

  // La ligne d'arret du moteur : c'est elle qui date la fin.
  // /!\ "echange" est un NOM TROMPEUR. simuler_round rend pyRound(t) et t est
  // un TEMPS EN SECONDES (`while (t < duree)`, duree = 300). 166 n'est pas le
  // 166e echange, c'est la 166e seconde du round. Le libelle reste faux dans
  // engine.js parce que la ligne est comparee au caractere pres contre
  // engine.py, qui est gele — voir chrono.js.
  let round = null, seconde = null;
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/>>> (\S+) gagne au round (\d+) \(échange (\d+)\)/);
    if (m) {
      round = Number(m[2]);
      seconde = Number(m[3]);
      // /!\ UNE FINITION NE PEUT PAS ARRIVER APRES LA CLOCHE. La boucle du
      // round est `while (t < duree)` et le temps de l'echange s'ajoute
      // APRES le test : le dernier echange peut donc deborder de quelques
      // secondes, et un KO s'y retrouve date a 304 s dans un round de 300.
      // Artefact de bord, latent depuis toujours, revele le 09/08 quand le
      // verrou 5 a decale le flux de hasard. On ramene a la cloche plutot
      // que d'afficher une heure impossible — et on corrige ICI, dans la
      // couche de lecture, pas dans le moteur gele.
      if (seconde > DUREE_ROUND_S) seconde = DUREE_ROUND_S;
    }
  }

  let methode = null, vainqueur = null, detail = null;

  for (let i = 0; i < L.length; i++) {
    const l = nu(L[i]);

    // --- KO sec : l'arme est celle de la derniere frappe a la tete du tueur
    let m = l.match(/^\*\*\* KO SEC ! (\S+) est eteint par (\S+) \*\*\*$/);
    if (m) {
      vainqueur = cote(m[2]); methode = "KO";
      const coup = remonter(L, i, (x) => new RegExp(`^\\s+${m[2]} \\S+ → touché .* tête$`).test(x));
      detail = coup ? mot(ARMES_FR, nu(coup).split(" ")[1], "arme") : null;
      break;
    }

    // --- KO en contre : le moteur nomme l'arme SUR LAQUELLE le contre est parti
    m = l.match(/^\*\*\* (\S+) tombe sur le contre ! \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "KO";
      const c = remonter(L, i, (x) => x.includes("CONTRE le"));
      const a = c && c.match(/CONTRE le (\S+) de/);
      detail = a ? `en contre d'un ${mot(ARMES_FR, a[1], "arme")}` : "sur le contre";
      break;
    }

    // --- TKO au corps : le coup et la zone sont dans la ligne precedente
    m = l.match(/^\*\*\* TKO AU CORPS ! (\S+) s effondre sur un coup au foie \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      const coup = remonter(L, i, (x) => /→ touché .* foie$/.test(x));
      // "crochet au corps au foie" ne se dit pas : la zone est deja le foie.
      const arme = coup ? mot(ARMES_FR, nu(coup).split(" ")[1], "arme") : null;
      detail = arme ? `${arme.replace(/ au corps$/, "")} au foie` : "coup au foie";
      break;
    }

    // --- TKO au sol : on nomme la position, c'est ce que le fan retient
    m = l.match(/^\*\*\* TKO AU SOL ! (\S+) finit au ground and pound \*\*\*$/);
    if (m) {
      vainqueur = cote(m[1]); methode = "TKO";
      const p = positionAu(L, i);
      detail = p ? `ground and pound en ${mot(POSITIONS_FR, p, "position")}` : "ground and pound";
      break;
    }

    // --- TKO sur re-knockdown : le moteur compte les chutes, on les compte aussi
    m = l.match(/^\*\*\* TKO ! (\S+) retombe, l'arbitre arrete \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      // +1 : la chute qui arrete le combat n'est pas ecrite au log.
      const n = chutesDe(L, i, m[1]) + 1;
      // "l'arbitre arrête" serait redondant : c'est ce que TKO veut dire.
      detail = `${n}e knockdown`;
      break;
    }

    // --- TKO sur COUPURE : le medecin arrete (Mael, 10/08 : "noté TKO")
    m = l.match(/^\*\*\* TKO ! (\S+) coupe, le medecin arrete le combat \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "TKO";
      detail = "coupure, arrêt du médecin";
      break;
    }

    // --- TKO sur serie non defendue
    m = l.match(/^\*\*\* TKO ! (\S+) ne repond plus, l'arbitre arrete \*\*\*$/);
    if (m) {
      const perd = cote(m[1]); vainqueur = autre(perd); methode = "TKO";
      const gagnant = vainqueur === "A" ? nomA : nomB;
      // +1 : le coup qui declenche l'arret n'est pas ecrit au log.
      const n = coupsDepuisChute(L, i, gagnant, m[1]) + 1;
      detail = `${n} coups après le knockdown`;
      break;
    }

    // --- Soumission : le nom de la prise, et d'ou elle est partie
    m = l.match(/^\*\*\* (\S+) tape ! (.+?)( d'en bas)? \*\*\*$/);
    if (m) {
      vainqueur = autre(cote(m[1])); methode = "SOUMISSION";
      const nom = mot(SUBS_FR, m[2].trim().replace(/ /g, "_"), "soumission");
      detail = m[3] ? `${nom} depuis la garde` : nom;
      break;
    }

    // --- Decision : le score est celui que le moteur a compte, pas un habillage
    if (l === "──────── DÉCISION ────────") {
      // La carte porte les NOMS : on les lit, on ne suppose pas l'ordre.
      const carte = {};
      for (const k of [i + 1, i + 2]) {
        // /!\ LE NOM PEUT CONTENIR UN ESPACE ("Van Dijk", "Da Costa") :
        // (\S+) refusait ces cartes et le verdict LEVAIT en fin de combat,
        // une fois sur deux seulement (decisions uniquement). On lit le nom
        // en NON-GOURMAND jusqu'au " : ", ce qui accepte les deux formes.
        const c = (L[k] || "").match(/^\s+(.+?) : (\d+)$/);
        if (!c) throw new Error("verdict.js : carte de score illisible");
        carte[cote(c[1])] = Number(c[2]);
      }
      if (carte.A === undefined || carte.B === undefined)
        throw new Error("verdict.js : carte de score incomplete");
      methode = "DÉCISION";
      vainqueur = carte.A > carte.B ? "A" : carte.B > carte.A ? "B" : null;
      const [h, b] = [Math.max(carte.A, carte.B), Math.min(carte.A, carte.B)];
      detail = `${h}-${b}`;   // le nul se lit sur vainqueur===null, pas dans le texte
      if (round === null) round = rounds;
      seconde = null;   // une decision ne se date pas a la seconde
      break;
    }
  }

  // --- Le moteur a designe un vainqueur sans cause reconnue : on le DIT.
  if (methode === null) {
    if (round === null) throw new Error("verdict.js : log sans fin exploitable");
    methode = "ARRÊT"; detail = null;
    const m = L.join("\n").match(/>>> (\S+) gagne au round/);
    vainqueur = m ? cote(m[1]) : null;
  }

  // methode : la CLE, comparable a fin[0] du traducteur (invariant du banc).
  // methode_fr : ce qui se lit a l'ecran. libelle : les deux assembles, en
  // PARENTHESES et pas en tiret, pour que l'ecran puisse lui-meme prefixer
  // "Victoire — ..." sans produire deux tirets dans la meme phrase.
  const methode_fr = { "DÉCISION": "décision", "SOUMISSION": "soumission",
                       "ARRÊT": "arrêt" }[methode] || methode;
  return { methode, methode_fr, vainqueur, detail, round, seconde,
           heure: seconde === null ? null : hms(round, seconde),
           libelle: detail ? `${methode_fr} (${detail})` : methode_fr };
}

module.exports = { verdict, ARMES_FR, SUBS_FR, POSITIONS_FR };
