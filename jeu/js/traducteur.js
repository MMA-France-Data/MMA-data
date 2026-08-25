/**
 * traducteur.js — portage de traducteur.py : le log du moteur devient une
 * chronologie jouable par l'ecran. REGLE ABSOLUE inchangee : l'ecran ne
 * raconte QUE ce que le moteur a tire ; la mise en scene ne touche qu'aux x,y.
 *
 * PIEGES SPECIFIQUES A CE MODULE
 * 1. DEUX generateurs : traduire() a son rng LOCAL (random.Random(graine))
 *    ET _autour() tire sur le module random GLOBAL quand angle est absent.
 *    On reproduit les deux flux : new Alea(graine) local + alea global.
 * 2. \w Python matche les ACCENTS ("réussi", "défendue") ; le \w JS est
 *    ASCII. Toutes les regex utilisent [\p{L}\p{N}_] avec le flag u.
 * 3. round(x, 1) Python arrondit le demi AU PAIR (56.25 -> 56.2, 18.75 ->
 *    18.8) ; toFixed arrondit vers le haut. pyRound1 teste le demi exact
 *    (les pas dyadiques 300/2^k le produisent vraiment).
 * 4. .title() Python : premiere lettre de CHAQUE sequence alphabetique en
 *    majuscule, le reste en minuscules ("l'ombre" -> "L'Ombre").
 * 5. e.get(cle) : une liste presente est TOUJOURS vraie en Python, meme
 *    [0,0,0,0] -> cote JS on teste !== undefined, pas la truthiness.
 */

const { Alea, alea } = require("./alea.js");

const R_CAGE = 148;
const CENTRE = [180, 180];

function _bord(angle, retrait = 18) {
  const r = R_CAGE - retrait;
  return [CENTRE[0] + r * Math.cos(angle), CENTRE[1] + r * Math.sin(angle)];
}

/** angle absent => tire sur le module random GLOBAL (comme en Python). */
function _autour(p, d = 36, angle = null) {
  const a = angle !== null ? angle : alea.uniform(0, 2 * Math.PI);
  return [p[0] + d * Math.cos(a), p[1] + d * Math.sin(a)];
}

const POS_SOL = { closed_guard: "GARDE FERMÉE", open_guard: "GARDE OUVERTE",
  half_guard: "DEMI-GARDE", side_control: "CONTRÔLE LATÉRAL",
  mount: "MONTÉE", back: "PRISE DE DOS", turtle: "TORTUE",
  butterfly: "GARDE PAPILLON" };

const SUBS = { guillotine: "guillotine", rear_naked: "étranglement arrière",
  armbar: "clé de bras", triangle: "triangle", kimura: "kimura",
  americana: "americana", anaconda: "anaconda", darce: "d'arce",
  heel_hook: "heel hook", guillotine_debout: "guillotine" };

const PRISES_FR = { neutre: "prise neutre", over_under: "over-under",
  double_under: "double sous-crochet", collar_tie: "prise de nuque",
  thai_plum: "plum thaï", back_clinch: "dos pris" };

const ARMES_CLINCH = { genou_cuisse: ["genou dans la cuisse", "j"],
  petit_corps: ["coups courts au corps", "c"],
  short_hook: ["crochet court", "t"],
  knee: ["genou au corps", "c"],
  knee_head: ["genou à la tête", "t"],
  elbow: ["coude", "t"] };

const SORTIES_FR = { frame_push: "cadre et repousse", pummel_out: "repummèle",
  spin_out: "pivote", duck_under: "passe sous le bras",
  wall_walk: "remonte le long de la grille",
  underhook_up: "cherche le sous-crochet" };

const LUTTE_CLINCH = { body_lock_attempt: "ceinture", trip_attempt: "balayage",
  throw_attempt: "projection", mat_return: "retour au tapis" };

// ------------------------------------------------------- helpers Python
const W = "[\\p{L}\\p{N}_]+";                    // le \w unicode de Python
const M = (l, motif) => l.match(new RegExp("^" + motif, "u"));
const S = (l, motif) => l.match(new RegExp(motif, "u"));

function pyTitle(s) {
  return s.replace(/\p{L}+/gu, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
}
const pyCap = (s) => s.length ? s[0].toUpperCase() + s.slice(1) : s;

function pyRound(x) {
  const f = Math.floor(x), diff = x - f;
  if (diff === 0.5) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}
function pyRound1(x) {
  const y = x * 10, f = Math.floor(y);
  if (y - f === 0.5) return (f % 2 === 0 ? f : f + 1) / 10;
  return Math.round(y) / 10;
}

// ------------------------------------------------------------- traduire
function traduire(log, nomA, nomB, secondes_round = 300, graine = 7) {
  const rng = new Alea(graine);
  const E = [];
  const V = { st: [0, 0, 0, 0], tdA: [0, 0], tdB: [0, 0], subA: 0, subB: 0 };
  const dmg_niv = {};

  // -- decoupage par round ------------------------------------------------
  const rounds = [];
  let cour = [];
  for (const l of log) {
    if (l.includes("ROUND") && l.includes("───")) {
      if (cour.length) rounds.push(cour);
      cour = [];
    } else cour.push(l.trim());
  }
  if (cour.length) rounds.push(cour);

  // -- etat de mise en scene ----------------------------------------------
  const etat = { mode: "distance", ancre: rng.uniform(0, 2 * Math.PI),
                 accule: null, sol_top: null };
  const pos = { A: _autour(CENTRE, 34, Math.PI), B: _autour(CENTRE, 34, 0) };

  const qui = (l) => l.startsWith(nomA) ? ["A", "B"]
                   : l.startsWith(nomB) ? ["B", "A"] : [null, null];

  function placer() {
    if (etat.mode === "sol" || etat.mode === "clinch") {
      const p = etat.accule ? _bord(etat.ancre, 26)
                            : _autour(CENTRE, rng.uniform(0, 46));
      pos.A = p;
      pos.B = [p[0] + 3, p[1] + 3];
    } else if (etat.accule) {
      const mur = _bord(etat.ancre);
      const dedans = _autour(mur, 30, etat.ancre + Math.PI);
      if (etat.accule === "A") { pos.A = mur; pos.B = dedans; }
      else { pos.B = mur; pos.A = dedans; }
    } else {
      const c = _autour(CENTRE, rng.uniform(0, 40));
      const a = rng.uniform(0, 2 * Math.PI);
      pos.A = _autour(c, 30, a);
      pos.B = _autour(c, 30, a + Math.PI);
    }
  }

  const _clinch = (l) => (l.includes("->") || l.startsWith("=>")
    || l.includes("prend le contrôle du clinch") || l.includes("pummele sans gain"));

  function _frappe_clinch(Xc, arme, dmg, sig) {
    const iX = Xc === "A" ? 0 : 2;
    V.st[iX + 1] += 1;
    if (sig) V.st[iX] += 1;
    const [lib, zone] = ARMES_CLINCH[arme] !== undefined
      ? ARMES_CLINCH[arme] : [arme.replace(/_/g, " "), "c"];
    const cle = (Xc === "A" ? "B" : "A") + zone;
    return [lib, (sig && dmg) ? cle : null];
  }

  function etape(t, kw = {}) {
    placer();
    const e = { t: pyRound1(t),
                a: [pyRound(pos.A[0]), pyRound(pos.A[1])],
                b: [pyRound(pos.B[0]), pyRound(pos.B[1])] };
    for (const [k, v] of Object.entries(kw))
      if (v !== null && v !== undefined) e[k] = v;
    E.push(e);
  }

  function _traiter_clinch(l, t) {
    if (l.includes("RÉUSSI, combat au sol")) return false;

    const sig = l.includes("[SIG]");
    const [X] = qui(l);
    let m;

    m = M(l, `(\\S+) prend le contrôle du clinch \\((${W})\\)`);
    if (m) {
      const Xc = m[1] === nomA ? "A" : "B";
      etat.mode = "clinch";
      etape(t, { ph: "CLINCH", chaud: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} prend le contrôle — ${PRISES_FR[m[2]] !== undefined ? PRISES_FR[m[2]] : m[2]}.` });
      return true;
    }

    m = M(l, `(\\S+) rompt et place (${W}) -> (\\S+) \\((\\d+)\\)`);
    if (m && X) {
      const [lib, cle] = _frappe_clinch(X, m[2], parseInt(m[4]), true);
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", chaud: 1, flash: 1, ctrl: "",
        com: `Il casse la prise et place ${lib} en sortant !`,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      V.st = [0, 0, 0, 0];
      return true;
    }

    m = M(l, `(\\S+) rompt et tente (${W}) ->`);
    if (m && X) {
      _frappe_clinch(X, m[2], 0, false);
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", ctrl: "", com: "Il rompt la prise et lance en sortant — à côté." });
      return true;
    }

    m = M(l, `(\\S+) casse le clinch \\((${W})\\)`);
    if (m) {
      etat.mode = "distance";
      etape(t, { ph: "DISTANCE", ctrl: "",
        com: `${pyTitle(m[1])} relâche la prise et remet de la distance.` });
      return true;
    }

    m = M(l, `(\\S+) tente (${W}) -> (${W})`);
    if (m && X && m[2] in SORTIES_FR) {
      const reussi = m[3] === "réussi";
      if (reussi) etat.mode = "distance";
      etape(t, { ph: reussi ? "DISTANCE" : "CLINCH", ctrl: reussi ? "" : null,
        com: reussi ? `${pyTitle(m[1])} ${SORTIES_FR[m[2]]} — il se dégage !`
                    : `${pyTitle(m[1])} ${SORTIES_FR[m[2]]} — ça ne vient pas.` });
      return true;
    }

    if (l.startsWith("=>") && l.includes("passe dans le dos")) {
      m = M(l, "=> (\\S+) passe dans le dos");
      const Xc = m[1] === nomA ? "A" : "B";
      etape(t, { ph: "CLINCH", chaud: 1, slow: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} tourne autour et PASSE DANS LE DOS !` });
      return true;
    }

    m = M(l, `(\\S+) riposte (${W}) -> (\\d+)`);
    if (m && X) {
      const [lib, cle] = _frappe_clinch(X, m[2], parseInt(m[3]), sig);
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      etape(t, { ph: "CLINCH", chaud: sig ? 1 : null, flash: sig ? 1 : null,
        com: sig ? `Il riposte dans la prise — ${lib} !` : null,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      V.st = [0, 0, 0, 0];
      return true;
    }

    m = M(l, `(\\S+) améliore sa prise -> (${W})`);
    if (m) {
      const Xc = m[1] === nomA ? "A" : "B";
      etape(t, { ph: "CLINCH", chaud: 1, ctrl: Xc,
        com: `${pyTitle(m[1])} pummèle et améliore — ${PRISES_FR[m[2]] !== undefined ? PRISES_FR[m[2]] : m[2]}.` });
      return true;
    }

    if (l.includes("pummele sans gain")) {
      etape(t, { ph: "CLINCH", com: "Ça pummèle contre la grille, personne ne prend l'avantage." });
      return true;
    }

    m = M(l, "(\\S+) snap down -> (.+)");
    if (m) {
      const resiste = m[2].includes("résisté");
      etape(t, { ph: "CLINCH", chaud: resiste ? null : 1,
        com: resiste ? `${pyTitle(m[1])} tente le snap down — posture tenue.`
                     : `Snap down ! ${pyTitle(m[1])} le casse en deux.` });
      return true;
    }

    m = M(l, `(\\S+) (${W}) -> stoppé`);
    if (m && X && m[2] in LUTTE_CLINCH) {
      V["td" + X][1] += 1;
      etape(t, { ph: "CLINCH", com: `${LUTTE_CLINCH[m[2]]} de ${pyTitle(m[1])} — repoussée !`,
        ["td" + X]: [0, 1] });
      V["td" + X] = [0, 0];
      return true;
    }

    m = M(l, `(\\S+) (${W}) -> (\\S+) \\((\\d+)\\)`);
    if (m && X && m[2] in ARMES_CLINCH) {
      const d = parseInt(m[4]);
      const [lib, cle] = _frappe_clinch(X, m[2], d, sig);
      if (cle) dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
      etape(t, { ph: "CLINCH", chaud: sig ? 1 : null, flash: sig ? 1 : null,
        com: sig ? `${pyCap(lib)} dans la prise — ça fait mal !` : null,
        dmg: cle ? { [cle]: 1 } : null, st: [...V.st] });
      V.st = [0, 0, 0, 0];
      return true;
    }

    return false;
  }

  // -- lecture -------------------------------------------------------------
  let t_abs = 0.0;
  let fin = null;

  etape(0.0, { ph: "DISTANCE", rd: 1,
    com: "Les deux hommes touchent les gants. C'est parti." });

  boucle_rounds:
  for (let i_rd = 0; i_rd < rounds.length; i_rd++) {
    if (fin) break;
    const lignes = rounds[i_rd];
    const pas = secondes_round / Math.max(1, lignes.length);
    etat.mode = "distance"; etat.accule = null; etat.sol_top = null;
    if (i_rd) etape(t_abs, { ph: "DISTANCE", rd: i_rd + 1,
      com: `Round ${i_rd + 1}. Les coins ont parlé, on repart.` });

    for (const l of lignes) {
      t_abs += pas;
      const [X] = qui(l);
      let m;

      // ---- la cage ----
      if (l.includes("[cage]")) {
        if (l.includes("accule")) {
          m = M(l, "\\[cage\\] (\\S+) accule (\\S+)");
          if (m) {
            etat.accule = m[2] === nomA ? "A" : "B";
            etat.ancre = rng.uniform(0, 2 * Math.PI);
            const nom = etat.accule === "A" ? nomA : nomB;
            const autre = etat.accule === "A" ? nomB : nomA;
            etape(t_abs, { ph: "ACCULÉ — GRILLE", chaud: 1,
              com: `${pyTitle(autre)} coupe la cage — ${pyTitle(nom)} a le dos à la grille.` });
          }
        } else if (l.includes("dégage")) {
          etat.accule = null;
          etape(t_abs, { ph: "DISTANCE",
            com: `${pyTitle(l.split("]")[1].split(" se")[0].trim())} pivote et ressort vers le centre.` });
        }
        continue;
      }

      // ---- frappes ----
      m = M(l, `(\\S+) (${W}) → touché \\((\\d+)\\) (${W})`);
      if (m && X) {
        const arme = m[2], d = parseInt(m[3]), zone = m[4];
        const iX = X === "A" ? 0 : 2;
        V.st[iX] += 1; V.st[iX + 1] += 1;
        const cible = zone === "tête" ? "t" : l.includes("jambe") ? "j" : "c";
        const cle = (X === "A" ? "B" : "A") + cible;
        const gros = d >= 6;
        if (gros || rng.random() < 0.30) {
          dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
          const com = gros
            ? `${pyTitle(arme.replace(/_/g, " "))} de ${pyTitle(X === "A" ? nomA : nomB)} qui passe fort !`
            : null;
          etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE"
                            : etat.mode === "sol" ? "SOL" : "DISTANCE",
            chaud: (gros || etat.accule) ? 1 : null,
            com, dmg: { [cle]: 1 }, flash: gros ? 1 : null,
            st: [...V.st] });
          V.st = [0, 0, 0, 0];
        }
        continue;
      }
      m = M(l, `(\\S+) (${W}) → manqué`);
      if (m && X) {
        V.st[(X === "A" ? 0 : 2) + 1] += 1;
        continue;
      }

      // ---- le contre ----
      m = M(l, `!!! (\\S+) CONTRE le (${W}) de (\\S+) \\((\\d+)\\)`);
      if (m) {
        const Xc = m[1] === nomA ? "A" : "B";
        const iX = Xc === "A" ? 0 : 2;
        V.st[iX] += 1; V.st[iX + 1] += 1;
        const cle = (Xc === "A" ? "B" : "A") + "t";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        const arme = m[2].replace(/_/g, " ");
        etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE" : "DISTANCE",
          chaud: 1, flash: 1, dmg: { [cle]: 1 }, st: [...V.st],
          com: `CONTRE ! ${pyTitle(Xc === "A" ? nomA : nomB)} le cueille sur son ${arme} !` });
        V.st = [0, 0, 0, 0];
        continue;
      }

      // ---- le clinch ----
      if (_clinch(l)) {
        if (_traiter_clinch(l, t_abs)) continue;
      }

      // ---- lutte ----
      if (l.includes("RÉUSSI, combat au sol") && X) {
        V["td" + X][0] += 1; V["td" + X][1] += 1;
        const p = S(l, `\\((${W})\\)`);
        etat.mode = "sol"; etat.sol_top = X;
        etape(t_abs, { ph: "TAKEDOWN", chaud: 1, slow: 1, flash: 1,
          com: `${pyTitle(X === "A" ? nomA : nomB)} l'emmène au sol !`,
          sol: p ? (POS_SOL[p[1]] !== undefined ? POS_SOL[p[1]] : "AU SOL") : "AU SOL",
          ["td" + X]: [1, 1], ctrl: X });
        V["td" + X] = [0, 0];
        continue;
      }
      if (l.includes("→ stoppé") && X && (l.includes("leg") || l.includes("body_lock")
          || l.includes("trip") || l.includes("throw"))) {
        V["td" + X][1] += 1;
        etape(t_abs, { ph: etat.accule ? "ACCULÉ — GRILLE" : "DISTANCE",
          com: `Entrée de ${pyTitle(X === "A" ? nomA : nomB)} — repoussée !`,
          ["td" + X]: [0, 1] });
        V["td" + X] = [0, 0];
        continue;
      }
      if (l.includes("engage le clinch") && X) {
        etat.mode = "clinch";
        etape(t_abs, { ph: "CLINCH", com: `${pyTitle(X === "A" ? nomA : nomB)} ferme la distance, clinch.` });
        continue;
      }
      if (l.includes("casse le clinch") || l.includes("séparés")) {
        etat.mode = "distance";
        etape(t_abs, { ph: "DISTANCE", com: "Ils se séparent." });
        continue;
      }

      // ---- le sol ----
      m = M(l, `(\\S+) (${W}) → maintenu en (${W})`);
      if (m && etat.mode === "sol") {
        etape(t_abs, { ph: "SOL", sol: POS_SOL[m[3]] !== undefined ? POS_SOL[m[3]] : "AU SOL",
          com: `${pyTitle(m[1])} pousse — écrasé, ça ne sort pas.` });
        continue;
      }
      if (l.includes("se relève, retour debout")) {
        etat.mode = "distance"; etat.sol_top = null;
        etape(t_abs, { ph: "DISTANCE", slow: 1, sol: "", ctrl: "",
          com: "Il recrée l'espace et se relève ! Retour debout." });
        continue;
      }
      m = M(l, `(\\S+) progresse → (${W})`);
      if (m) {
        etape(t_abs, { ph: "SOL", sol: POS_SOL[m[2]] !== undefined ? POS_SOL[m[2]] : "AU SOL",
          com: `${pyTitle(m[1])} passe en ${(POS_SOL[m[2]] !== undefined ? POS_SOL[m[2]] : "").toLowerCase()}.` });
        continue;
      }
      if (l.includes("ground and pound") && X) {
        const iX = X === "A" ? 0 : 2;
        const mg = S(l, "→ (\\d+)/(\\d+) coups");
        if (mg) {
          V.st[iX] += parseInt(mg[1]);
          V.st[iX + 1] += parseInt(mg[2]);
        } else if (!l.includes("dégâts")) {
          V.st[iX + 1] += 1;
          continue;
        } else {
          V.st[iX] += 1; V.st[iX + 1] += 1;
        }
        const cle = (X === "A" ? "B" : "A") + "t";
        if (rng.random() < 0.4) {
          dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
          etape(t_abs, { ph: "SOL", dmg: { [cle]: 1 }, st: [...V.st] });
          V.st = [0, 0, 0, 0];
        }
        continue;
      }

      // ---- renversements ----
      m = M(l, `(\\S+) (${W}) → CONTRÉ, (\\S+) prend le dessus`);
      if (m && X) {
        V["td" + X][1] += 1;
        const Y = X === "A" ? "B" : "A";
        etat.mode = "sol"; etat.sol_top = Y;
        etape(t_abs, { ph: "TAKEDOWN", chaud: 1, slow: 1, flash: 1, ctrl: Y,
          com: `Entrée contrée ! ${pyTitle(m[3])} inverse et prend le dessus !`,
          sol: "AU SOL", ["td" + X]: [0, 1] });
        V["td" + X] = [0, 0];
        continue;
      }
      m = M(l, ">>> RENVERSEMENT, (\\S+) prend le dessus");
      if (m) {
        const Y = m[1] === nomA ? "A" : "B";
        etat.sol_top = Y;
        etape(t_abs, { ph: "SOL", chaud: 1, slow: 1, ctrl: Y,
          com: `RENVERSEMENT ! ${pyTitle(m[1])} balaie et passe dessus !` });
        continue;
      }

      // ---- soumissions ----
      m = S(l, `(?:tente|attaque) (${W})`);
      if (m && X && (l.includes("défendue") || l.includes("SOUMISSION"))) {
        V["sub" + X] += 1;
        const nom_sub = SUBS[m[1]] !== undefined ? SUBS[m[1]] : m[1].replace(/_/g, " ");
        if (l.includes("SOUMISSION")) {
          fin = ["SOUMISSION", X, nom_sub];
          etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1, flash: 1,
            com: `IL TAPE ! ${pyTitle(nom_sub)} — c'est terminé !`,
            ["sub" + X]: 1 });
          break boucle_rounds;
        }
        etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1,
          com: `${pyTitle(X === "A" ? nomA : nomB)} attaque la ${nom_sub} — défendue !`,
          ["sub" + X]: 1 });
        continue;
      }
      m = M(l, `\\*\\*\\* (\\S+) tape ! (${W})`);
      if (m) {
        const perdant = m[1] === nomA ? "A" : "B";
        const gagnant = perdant === "A" ? "B" : "A";
        const nom_sub = SUBS[m[2]] !== undefined ? SUBS[m[2]] : m[2].replace(/_/g, " ");
        fin = ["SOUMISSION", gagnant, nom_sub];
        etape(t_abs, { ph: "SOUMISSION", chaud: 1, slow: 1, flash: 1,
          com: `IL TAPE ! ${pyTitle(nom_sub)} — c'est terminé !`,
          ["sub" + gagnant]: 1 });
        break boucle_rounds;
      }

      // ---- knockdowns et fins ----
      if (l.includes("KNOCKDOWN")) {
        const Xk = l.includes(nomA) ? "A" : "B";
        const cle = Xk + "t";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        etape(t_abs, { ph: "KNOCKDOWN", chaud: 1, slow: 1, flash: 1,
          com: `KNOCKDOWN ! ${pyTitle(Xk === "A" ? nomA : nomB)} s'écroule !`,
          dmg: { [cle]: 1 }, kd: Xk });
        continue;
      }
      if (l.includes("KO SEC")) {
        const Xk = S(l, nomA + " est eteint|! " + nomA) ? "A" : "B";
        fin = ["KO", Xk === "A" ? "B" : "A", null];
        etape(t_abs, { ph: "KO", chaud: 1, slow: 1, flash: 1,
          com: "KO SEC ! Il est éteint — plus besoin d'arbitre." });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* (\\S+) tombe sur le contre");
      if (m) {
        const perd = m[1] === nomA ? "A" : "B";
        const gagne = perd === "A" ? "B" : "A";
        fin = ["KO", gagne, "sur le contre"];
        etape(t_abs, { ph: "KO", chaud: 1, slow: 1, flash: 1,
          com: `IL LE PREND SUR LE CONTRE ! ${pyTitle(gagne === "A" ? nomA : nomB)} l'éteint sur sa relance !` });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* TKO AU CORPS ! (\\S+) s effondre");
      if (m) {
        const perd = m[1] === nomA ? "A" : "B";
        const cle = perd + "c";
        dmg_niv[cle] = (dmg_niv[cle] !== undefined ? dmg_niv[cle] : 0) + 1;
        fin = ["TKO", perd === "A" ? "B" : "A", "coup au foie"];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1, dmg: { [cle]: 1 },
          com: "AU FOIE ! Il plie en deux — il ne se relèvera pas." });
        break boucle_rounds;
      }
      m = M(l, "\\*\\*\\* TKO AU SOL ! (\\S+) finit");
      if (m) {
        const gagne = m[1] === nomA ? "A" : "B";
        fin = ["TKO", gagne, "ground and pound"];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1,
          com: "L'arbitre se jette entre eux — fini au sol !" });
        break boucle_rounds;
      }
      if (l.includes("TKO") && l.replace(/ê/g, "e").includes("arrete")) {
        const Xk = l.includes(nomA) ? "A" : "B";
        V.st[Xk === "B" ? 0 : 2] += 1;
        V.st[(Xk === "B" ? 0 : 2) + 1] += 1;
        fin = ["TKO", Xk === "A" ? "B" : "A", null];
        etape(t_abs, { ph: "TKO", chaud: 1, slow: 1, flash: 1,
          com: "L'arbitre se jette entre eux ! C'est fini !" });
        break boucle_rounds;
      }
      // ---- decision aux points ----
      if (l.startsWith(">>> Match nul")) {
        fin = ["DÉCISION", null, "nul"];
        etape(t_abs, { ph: "DÉCISION", chaud: 1,
          com: "Les cartes des juges : match nul." });
        break boucle_rounds;
      }
      m = M(l, ">>> (\\S+) l emporte aux points");
      if (m) {
        const gagnant = m[1] === nomA ? "A" : "B";
        fin = ["DÉCISION", gagnant, null];
        etape(t_abs, { ph: "DÉCISION", chaud: 1,
          com: "Ça ira aux cartes des juges." });
        break boucle_rounds;
      }

      m = M(l, ">>> (\\S+) gagne au round");
      if (m) {
        const gagnant = m[1] === nomA ? "A" : "B";
        if (!fin) {
          fin = ["ARRÊT", gagnant, null];
          etape(t_abs, { ph: "FIN", chaud: 1, slow: 1, com: "C'est terminé !" });
        }
        break boucle_rounds;
      }
    }
  }

  if (!fin) fin = ["DÉCISION", null, null];
  const finale = { t: pyRound1(t_abs + 4), fin: 1 };
  if (V.st.some(x => x)) finale.st = [...V.st];
  E.push(finale);

  // -- momentum ------------------------------------------------------------
  let mo = 50.0;
  let ctrl_actif = null;
  for (const e of E) {
    if ("ctrl" in e) ctrl_actif = e.ctrl || null;
    if (e.st !== undefined) mo += (e.st[0] - e.st[2]) * 2.2;
    if (e.dmg !== undefined)
      for (const cle of Object.keys(e.dmg)) mo += cle.startsWith("A") ? -5 : 5;
    if (e.kd !== undefined) mo += e.kd === "A" ? -14 : 14;
    if (e.tdA !== undefined) mo += e.tdA[0] * 9;
    if (e.tdB !== undefined) mo -= e.tdB[0] * 9;
    if (e.subA !== undefined) mo += 5;
    if (e.subB !== undefined) mo -= 5;
    if (ctrl_actif === "A") mo += 3;
    else if (ctrl_actif === "B") mo -= 3;
    mo = Math.max(8.0, Math.min(92.0, mo + (50 - mo) * 0.06));
    e.mom = pyRound(mo);
  }
  return [E, fin, t_abs];
}

module.exports = { traduire };
