/**
 * feuille.js — LA FEUILLE DE STATS DU COMBAT, RELUE DANS LE LOG.
 *
 * Format UFCStats, parce que c'est la grammaire que l'oeil du fan connait
 * deja : un total de significatives, puis la repartition par CIBLE
 * (tete / corps / jambe) et par POSITION (distance / clinch / sol), le tout
 * par round et en cumul.
 *
 * MEME PATRON QUE verdict.js : module natif JS, aucun fichier gele touche,
 * tenu par des invariants (verifier_feuille.js) plutot que par une
 * conformite Python.
 *
 * ===================================================================
 * /!\ CE QUE `frappes 66/107` N'EST PAS
 * ===================================================================
 * Le bilan du moteur ressemble a un "touchees sur tentees". Ce n'en est
 * pas un. Les quatre incrementations reelles :
 *   sig_attempted : chaque frappe DEBOUT (a l'entree de resolve_strike_debout)
 *                 + le ground and pound qui finit a 0 degat
 *   sig_landed    : frappe debout touchee
 *                 + le CONTRE (credite au defenseur)
 *                 + CHAQUE coup de ground and pound passe
 *                 + les significatives de CLINCH
 * Les TENTATIVES de GnP et de clinch ne sont comptees NULLE PART. Le ratio
 * du moteur est un outil de score, pas une feuille de stats. Encore une
 * etiquette qui raconte autre chose que le code — comme "echange".
 *
 * Cette feuille-ci est donc plus riche que le compteur : elle compte les
 * tentatives partout. Sa colonne "touchees" doit en revanche retomber
 * exactement sur sig_landed, et sa sous-somme "tentees du moteur" sur
 * sig_attempted. C'est l'invariant central du banc.
 *
 * ===================================================================
 * /!\ TROIS PIEGES DEJA PAYES — ne pas les redecouvrir
 * ===================================================================
 * 1. "check le" est une TENTATIVE qui ne loggue jamais de "manqué".
 *    resolve_strike_debout incremente sig_attempted en entree, puis sort
 *    sur la branche checke sans ecrire de ligne de frappe ratee.
 * 2. Le CONTRE n'est PAS une tentative supplementaire : le "→ manqué" de
 *    l'attaquant a deja ete ecrit juste avant. Le compter double.
 * 3. Le clinch parle un SECOND DIALECTE : fleche ASCII "->" au lieu de "→",
 *    vocabulaire propre (petit_corps, knee_corps_sortie, riposte...), et un
 *    marqueur [SIG]. Les frappes de clinch NON significatives sont de
 *    l'usure et ne comptent pas comme significatives.
 */

const { ARMES } = require("./tables.js");
const { FRAPPES_CLINCH, FRAPPES_RUPTURE } = require("./clinch.js");

// Zone d'une arme debout : elle est dans la table, on ne la devine pas.
function zoneArme(arme) {
  const info = ARMES[arme];
  if (!info) return null;
  return info.zone === "tete" ? "tete" : info.zone === "corps" ? "corps" : "jambe";
}

// Zone d'une frappe de clinch. /!\ DEUX tables : FRAPPES_CLINCH pour ce qui
// se donne DANS la prise, FRAPPES_RUPTURE pour ce qui se place EN SORTANT.
// N'en lire qu'une laissait une frappe sans cible, et le banc de coherence
// (tete+corps+jambe = total) tombait a 221 pour 222.
function zoneClinch(frappe) {
  const info = (FRAPPES_CLINCH && FRAPPES_CLINCH[frappe])
            || (FRAPPES_RUPTURE && FRAPPES_RUPTURE[frappe]);
  if (!info) return null;
  const c = info.cible !== undefined ? info.cible : info.zone;
  return c === "tete" ? "tete" : c === "corps" ? "corps" : "jambe";
}

const CIBLES = ["tete", "corps", "jambe"];
const POSITIONS = ["distance", "clinch", "sol"];

function bloc() {
  // `moteur` : la SOUS-PARTIE que le moteur compte lui-meme dans son bilan
  // `frappes X/Y`. Elle existe uniquement pour etre confrontee a
  // rs.sig_landed / rs.sig_attempted au banc. Elle n'est PAS affichee :
  // c'est un compteur de score, pas une feuille de stats (voir en-tete).
  const o = { sig: [0, 0], moteur: [0, 0], kd: 0, td: [0, 0], sub: 0, controle: 0 };
  for (const c of CIBLES) o[c] = [0, 0];
  for (const p of POSITIONS) o[p] = [0, 0];
  return o;
}

/**
 * @param {string[]} log  le log de engine.simuler_combat
 * @param {string} nomA   nom cote A (mono-jeton, celui du Fighter)
 * @param {string} nomB   nom cote B
 * @returns {{rounds: object[][], total: object[], noms: string[]}}
 *   rounds[i] = [statsA, statsB] pour le round i+1
 *   chaque bloc : sig/tete/corps/jambe/distance/clinch/sol en [touchees, tentees],
 *                 plus kd, td [reussis, tentes], sub, controle
 */
function feuille(log, nomA, nomB) {
  const L = log.join("\n").split("\n");
  const cote = (n) => (n === nomA ? 0 : n === nomB ? 1 : -1);

  const rounds = [];
  let rd = -1;
  let mode = "distance";   // position courante, deduite du contexte

  const compter = (r, c, pos, zone, touche) => {
    const s = rounds[r][c];
    s.sig[1] += 1; s[pos][1] += 1;
    if (zone) s[zone][1] += 1;
    if (touche) { s.sig[0] += 1; s[pos][0] += 1; if (zone) s[zone][0] += 1; }
  };

  for (const l of L) {
    if (/──────── ROUND \d+ ────────/.test(l)) {
      rounds.push([bloc(), bloc()]); rd += 1; mode = "distance"; continue;
    }
    if (rd < 0) continue;
    let m;

    // ---- position courante (le contexte, pas une frappe) ----
    if (/ferme la distance et engage le clinch|prend le contrôle du clinch/.test(l)) mode = "clinch";
    else if (/Ils se séparent|casse le clinch|se dégage vers le centre/.test(l)) {
      if (mode === "clinch") mode = "distance";
    }
    if (/RÉUSSI, combat au sol|le suit au sol en/.test(l)) mode = "sol";
    if (/retour debout|relance debout/.test(l)) mode = "distance";

    // ---- frappes DEBOUT (fleche unicode →) ----
    if ((m = l.match(/^\s+(\S+) (\S+) → (touché|manqué)/)) && zoneArme(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, mode === "sol" ? "distance" : mode, zoneArme(m[2]), m[3] === "touché");
      rounds[rd][c].moteur[1] += 1;
      if (m[3] === "touché") rounds[rd][c].moteur[0] += 1;
      continue;
    }
    // le check : TENTATIVE de l'attaquant, aucune ligne "manqué" ne suivra
    if ((m = l.match(/^\s+(\S+) check le (\S+) — (\S+) encaisse/))) {
      const c = cote(m[3]); if (c < 0) continue;
      compter(rd, c, "distance", zoneArme(m[2]), false);
      rounds[rd][c].moteur[1] += 1;   // le check EST une tentative du moteur
      continue;
    }
    // le contre : TOUCHEE pour le defenseur, et RIEN pour l'attaquant
    // (son "→ manqué" vient d'etre compte juste au-dessus)
    if ((m = l.match(/^\s+!!! (\S+) CONTRE le (\S+) de (\S+)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      const s = rounds[rd][c];
      s.sig[0] += 1; s.sig[1] += 1; s.tete[0] += 1; s.tete[1] += 1;
      s.distance[0] += 1; s.distance[1] += 1;
      s.moteur[0] += 1;               // le contre : touchee, sans tentative
      continue;
    }

    // ---- ground and pound : le log porte touches/tentes depuis la bascule ----
    if ((m = l.match(/^\s+(\S+) ground and pound → (\d+)\/(\d+) coups, (\d+) dégâts/))) {
      const c = cote(m[1]); if (c < 0) continue;
      const t = Number(m[2]), n = Number(m[3]);
      const s = rounds[rd][c];
      s.sig[0] += t; s.sig[1] += n; s.tete[0] += t; s.tete[1] += n;
      s.sol[0] += t; s.sol[1] += n;
      s.moteur[0] += t;
      if (Number(m[4]) === 0) s.moteur[1] += 1;   // rafale a 0 degat : UNE tentative
      continue;
    }

    // ---- frappes de CLINCH (fleche ASCII ->, marqueur [SIG]) ----
    // rupture offensive : toujours significative quand elle porte
    if ((m = l.match(/^\s+(\S+) rompt et place (\S+) -> \S+ \(\d+\) !/))) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), true);
      rounds[rd][c].moteur[0] += 1; continue;
    }
    if ((m = l.match(/^\s+(\S+) rompt et tente (\S+) ->/))) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), false); continue;
    }
    // frappe du controleur : touchee SEULEMENT si [SIG]
    if ((m = l.match(/^\s+(\S+) (\S+) -> (\S+) \((\d+)\)( \[SIG\])?$/)) && zoneClinch(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), Boolean(m[5]));
      if (m[5]) rounds[rd][c].moteur[0] += 1; continue;
    }
    // riposte de celui qui subit : logguee seulement si elle porte
    if ((m = l.match(/^\s+(\S+) riposte (\S+) -> (\d+)( \[SIG\])?$/)) && zoneClinch(m[2])) {
      const c = cote(m[1]); if (c < 0) continue;
      compter(rd, c, "clinch", zoneClinch(m[2]), Boolean(m[4]));
      if (m[4]) rounds[rd][c].moteur[0] += 1; continue;
    }

    // ---- le reste de la feuille ----
    if ((m = l.match(/>>> KNOCKDOWN ! (\S+) touche le sol/))
     || (m = l.match(/>>> (\S+) est sonne au sol/))) {
      const c = cote(m[1]); if (c >= 0) rounds[rd][1 - c].kd += 1;
      continue;
    }
    // Takedowns DEBOUT (fleche unicode) ...
    if ((m = l.match(/^\s+(\S+) \S+ → (RÉUSSI|CONTRÉ|stoppé)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1;
      if (m[2] === "RÉUSSI") rounds[rd][c].td[0] += 1;
      continue;
    }
    // ... le DOS DEBOUT, qui credite aussi un takedown mais ne ressemble a
    // aucune autre ligne : "X saute dans le dos et serre debout !". Ajoute
    // le 09/08 en meme temps que la mecanique — le banc 12 l'a attrape
    // immediatement (TD 0/1).
    if ((m = l.match(/^\s+(\S+) saute dans le dos et serre debout/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1; rounds[rd][c].td[0] += 1;
      continue;
    }
    // ... et takedowns depuis le CLINCH (fleche ASCII). Le moteur les
    // credite dans le meme rs.td_landed : les omettre faisait mentir la
    // colonne TD d'un round sur dix.
    if ((m = l.match(/^\s+(\S+) \S+ -> (RÉUSSI, combat au sol|stoppé)/))) {
      const c = cote(m[1]); if (c < 0) continue;
      rounds[rd][c].td[1] += 1;
      if (m[2].startsWith("RÉUSSI")) rounds[rd][c].td[0] += 1;
      continue;
    }
    if ((m = l.match(/^\s+(\S+) (?:tente|attaque) \S+(?: depuis le dessous)? → (SOUMISSION|défendue)/))) {
      const c = cote(m[1]); if (c >= 0) rounds[rd][c].sub += 1;
      continue;
    }
  }

  // cumul
  const total = [bloc(), bloc()];
  for (const r of rounds) for (const c of [0, 1]) {
    const s = r[c], t = total[c];
    t.sig[0] += s.sig[0]; t.sig[1] += s.sig[1];
    t.moteur[0] += s.moteur[0]; t.moteur[1] += s.moteur[1];
    for (const k of CIBLES.concat(POSITIONS)) { t[k][0] += s[k][0]; t[k][1] += s[k][1]; }
    t.kd += s.kd; t.td[0] += s.td[0]; t.td[1] += s.td[1]; t.sub += s.sub;
  }

  return { rounds, total, noms: [nomA, nomB] };
}

/** "136 of 273" — la forme d'ufcstats, pour l'ecran. */
const surTotal = (p) => `${p[0]} of ${p[1]}`;
/** Pourcentage entier, "" si aucune tentative (pas de 0% trompeur). */
const pourcent = (p) => (p[1] ? Math.round((100 * p[0]) / p[1]) + "%" : "—");

module.exports = { feuille, surTotal, pourcent, CIBLES, POSITIONS };
