/**
 * vestiaire.js — LES LIENS ENTRE TES HOMMES (chantier N, Mael, 28/08).
 *
 * LA REGLE FONDATRICE, appliquee aux liens : UN LIEN EST UN RESIDU DES
 * FAITS, jamais une jauge cliquable. Il vit en PAIRES (cle-cle, valeur,
 * faits[]) dans SALLE.liens — UNE SEULE source, elle voyage dans la
 * sauvegarde comme le reste de SALLE.
 *
 * LES ARBITRAGES DE MAEL (28/08, tous graves au carnet) :
 *  1. visibilite : LES DEUX — la fiche (bloc « Le vestiaire ») ET le
 *     coach qui interpelle quand un palier se franchit ;
 *  2. le leader EMERGE des faits (anciennete + entente + resultats),
 *     personne ne le nomme ;
 *  3. des PAIRES seulement — les « clans » se liront d'eux-memes quand
 *     trois paires fortes relient les memes hommes ;
 *  4. la MANIERE compte au duel interne : un combat propre fait le
 *     respect, une demolition fait le froid — meme consenti ;
 *  5. le plafond : 24 paires stockees, la plus faible s'efface
 *     (arbitrage pose par la session, ajustable en jouant).
 *
 * Ce module est PUR : pas de DOM, pas d'etat global, pas de tirage.
 * Tout ce qui est aleatoire ou narratif reste cote jeu. Le banc 32
 * (verifier_vestiaire.js) le tient.
 */

const MAX_LIENS = 24;   // le plafond de paires stockees
const VIVANT = 30;      // a partir d'ou un lien se DIT (fiche, coach)
const FROID = -30;      // a partir d'ou on refuse le sparring ensemble

/** La cle d'une paire — symetrique, l'ordre des deux ne compte pas. */
function clef(a, b) {
  a = String(a); b = String(b);
  return a < b ? a + "|" + b : b + "|" + a;
}

/** La valeur du lien entre deux hommes. 0 = rien entre eux. */
function lire(liens, a, b) {
  const e = liens[clef(a, b)];
  return e ? e.v : 0;
}

/** Le mot — JAMAIS le chiffre (meme regle que l'entente). null = rien a
 *  dire : un lien tiede ne se raconte pas. */
function mot(v) {
  if (v >= 60) return "inséparables";
  if (v >= VIVANT) return "proches";
  if (v <= -60) return "irréconciliables";
  if (v <= FROID) return "un froid";
  return null;
}

/**
 * Poser un fait sur une paire. Cree la paire au besoin ; au plafond, la
 * paire LA PLUS FAIBLE (|v| minimal) s'efface pour faire la place — une
 * salle n'a pas de memoire infinie, les histoires tiedes s'oublient.
 * Rend { v, franchi } : franchi porte le NOUVEAU mot quand un palier
 * vient d'etre franchi (c'est le signal d'interpellation du coach),
 * null sinon.
 */
function poser(liens, a, b, jour, quoi, delta) {
  const k = clef(a, b);
  let e = liens[k];
  if (!e) {
    const cles = Object.keys(liens);
    if (cles.length >= MAX_LIENS) {
      let faible = cles[0];
      for (const c of cles) if (Math.abs(liens[c].v) < Math.abs(liens[faible].v)) faible = c;
      delete liens[faible];
    }
    e = liens[k] = { v: 0, faits: [] };
  }
  const avant = mot(e.v);
  e.v = Math.max(-100, Math.min(100, Math.round((e.v + delta) * 10) / 10));
  e.maj = jour;
  e.faits.push({ jour, quoi, delta });
  if (e.faits.length > 5) e.faits.shift();
  const apres = mot(e.v);
  return { v: e.v, franchi: apres !== avant ? apres : null };
}

/** L'usure du temps : sans faits nouveaux, tout retourne vers zero —
 *  lentement (a appeler UNE fois par semaine). Une paire retombee a
 *  presque rien et sans fait recent s'efface. */
function decroitre(liens, jour) {
  for (const k of Object.keys(liens)) {
    const e = liens[k];
    e.v = Math.round(e.v * 0.985 * 10) / 10;
    if (Math.abs(e.v) < 4 && jour - (e.maj || 0) > 60) delete liens[k];
  }
}

/** Les paires d'un homme, la plus forte d'abord — avec le mot et les
 *  faits, pretes pour la fiche. Seules celles qui ONT un mot sortent. */
function pairesDe(liens, cle) {
  const sortie = [];
  const c = String(cle);
  for (const k of Object.keys(liens)) {
    const [x, y] = k.split("|");
    if (x !== c && y !== c) continue;
    const e = liens[k], m = mot(e.v);
    if (!m) continue;
    sortie.push({ autre: x === c ? y : x, v: e.v, mot: m, faits: e.faits });
  }
  return sortie.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
}

/** Un homme part (fin de contrat, renvoi) : ses paires s'effacent — le
 *  lien vit entre deux hommes DE LA SALLE. Rend les partenaires dont le
 *  lien etait vivant (v >= VIVANT) : eux ressentent le trou, et le jeu
 *  peut le raconter. */
function retirer(liens, cle) {
  const c = String(cle), touches = [];
  for (const k of Object.keys(liens)) {
    const [x, y] = k.split("|");
    if (x !== c && y !== c) continue;
    if (liens[k].v >= VIVANT) touches.push(x === c ? y : x);
    delete liens[k];
  }
  return touches;
}

/** Une paire liee s'entraine mieux ENSEMBLE ; un froid refuse le tapis. */
const bonusSparring = (v) => (v >= VIVANT ? 1.15 : 1);
const refuse = (v) => v <= FROID;

/**
 * Le duel interne : LA MANIERE COMPTE (arbitrage 4). Une demolition —
 * l'arret dans le premier round — fait le froid, meme si le combat
 * etait accepte des deux cotes. Tout le reste est un combat propre :
 * il fait le respect.
 */
function effetDuel(methode, round) {
  const demolition = (methode === "KO" || methode === "TKO") && round <= 1;
  return demolition
    ? { delta: -18, quoi: "la démolition en duel interne" }
    : { delta: +8, quoi: "un duel propre" };
}

/**
 * Le leader de vestiaire — il EMERGE, personne ne le nomme (arbitrage 2).
 * candidats : [{ cle, anciennete (jours), entente (0-100), victoires }].
 * Il faut au moins un an de maison et une entente qui tient (55+) ;
 * ensuite l'anciennete pese le plus, puis l'entente, puis les resultats.
 * Rend { cle, score } ou null — une salle peut n'avoir personne.
 */
function leader(candidats) {
  let best = null;
  for (const c of candidats || []) {
    if ((c.anciennete || 0) < 365 || (c.entente || 0) < 55) continue;
    const score = (c.anciennete / 365) * 20 + c.entente * 0.5 + (c.victoires || 0) * 2;
    if (!best || score > best.score) best = { cle: c.cle, score: Math.round(score * 10) / 10 };
  }
  return best;
}

module.exports = { MAX_LIENS, VIVANT, FROID, clef, lire, mot, poser,
                   decroitre, pairesDe, retirer, bonusSparring, refuse,
                   effetDuel, leader };
