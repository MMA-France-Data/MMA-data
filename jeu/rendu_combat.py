"""
rendu_combat.py — moteur -> traducteur -> combat_reel.html

Remplace le banc forge de la seance precedente. Le bloc __main__ du
traducteur avait ete perdu ; celui-ci le reconstitue en suivant exactement
le protocole de refonte.tournoi() : T.reinitialiser(), random.seed(graine),
T.creer(niveau, division, archetype), adapter.construire(), reset().

Usage :
    python3 rendu_combat.py [graine] [archA] [archB]
    python3 rendu_combat.py --balayer 1 60      # cherche les graines a finition
"""
import json
import random
import sys

import adapter
import engine
import refonte
import test_raccord as T
import traducteur
from instrument import reset

T.arcs = refonte.JEU
NIVEAU = 65
DIVISION = "poids welter"


def combat(graine, arcA="brawler", arcB="lutteur", niveau=NIVEAU, div=DIVISION):
    """Un combat reproductible. Retourne (log, nomA, nomB, vainqueur)."""
    T.reinitialiser()
    random.seed(graine)
    fa = adapter.construire(T.creer(niveau, div, arcA))
    fb = adapter.construire(T.creer(niveau, div, arcB))
    fa.name, fb.name = "Kante", "Okafor"
    reset(fa); reset(fb)
    w, log = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
    return log, fa, fb, w


def rendre(graine, arcA="brawler", arcB="lutteur",
           affiche=("Idris Kanté", "T. Okafor"),
           fiches=("7-2 · Le Chaudron", "9-3 · Lion's Den"),
           bourse="Bourse 3 500 € · +18 notoriété",
           sortie="combat_reel.html"):
    log, fa, fb, w = combat(graine, arcA, arcB)
    E, fin, duree = traducteur.traduire(log, fa.name, fb.name, graine=graine)

    # --- VERIFICATION DE CONFORMITE : l'ecran doit dire ce que le moteur a tire
    attendu = None if w is None else ("A" if w is fa else "B")
    assert fin[1] == attendu, (
        f"VAINQUEUR DIVERGENT — moteur {attendu!r}, traducteur {fin[1]!r}\n"
        f"  fin = {fin}\n  dernieres lignes :\n    "
        + "\n    ".join(l.strip() for l in log[-4:]))

    # --- profils "SUR LE PAPIER", lus sur les Fighter du moteur
    prof = profils(fa, fb)

    data = {"S": E,
            "FIN": {"methode": fin[0], "vainqueur": fin[1], "detail": fin[2]},
            "noms": list(affiche), "fiches": list(fiches),
            "bourse": bourse, "profils": prof, "sec_round": engine.DUREE_ROUND}
    tpl = open("combat_reel.template.html").read()
    html = tpl.replace("/*__DATA__*/", json.dumps(data, ensure_ascii=False))
    assert "__DATA__" not in html, "injection ratee"
    open(sortie, "w").write(html)
    return E, fin, duree, len(log)


def profils(fa, fb):
    """
    Les barres de la feuille, prises sur le moteur.

    ATTENTION : NE PAS RE-AGREGER LE SOL. Une seule barre "Sol" moyennant passage,
    montee et soumission affichait Okafor 71 contre Kante 51 sur la graine
    27 — alors que la soumission qui a FINI le combat se jouait a 43 contre
    44, c'est-a-dire a egalite. Le 71 venait du passage (79) et de la montee
    (90). L'ecran etait vrai et racontait pourtant l'inverse de ce qui allait
    se passer. Une barre par axe que le moteur TIRE reellement :
      - controle/passage  -> resolve_gnp, progression de position
      - soumission        -> tenter_soumission_* : off - sub_def adverse
      - defense de soum.  -> l'autre moitie du meme tirage
    """
    def lire(f):
        s, l, g = f.striking, f.wrestling, f.ground
        return [round((s.jab + s.cross + s.crochet + s.low_kick) / 4),
                round((l.shot + l.sprawl + l.clinch_wrestling) / 3),
                round((g.passing + g.mount_top) / 2),
                round((g.submission_off_top + g.submission_off_bottom) / 2),
                g.submission_def,
                round(f.physical.cardio),
                round(f.physical.chin),
                round(f.mental.fight_iq)]
    a, b = lire(fa), lire(fb)
    libelles = ["Frappe", "Lutte", "Contrôle sol", "Soumission",
                "Déf. soum.", "Cardio", "Menton", "Fight IQ"]
    return [[lib, a[i], b[i]] for i, lib in enumerate(libelles)]


def balayer(d, f):
    """Quelles graines donnent une finition ? (le carnet citait 27, 31, 40)"""
    for g in range(d, f + 1):
        log, fa, fb, w = combat(g)
        t = "\n".join(log)
        m = ("SUB" if "tape !" in t else "TKO sol" if "TKO AU SOL" in t
             else "KO sec" if "KO SEC" in t else "TKO" if "TKO" in t else "DEC")
        gagnant = "nul" if w is None else w.name
        print(f"  graine {g:>3} : {m:<8} {gagnant}")


if __name__ == "__main__":
    if "--balayer" in sys.argv:
        i = sys.argv.index("--balayer")
        balayer(int(sys.argv[i + 1]), int(sys.argv[i + 2]))
    else:
        g = int(sys.argv[1]) if len(sys.argv) > 1 else 27
        aA = sys.argv[2] if len(sys.argv) > 2 else "brawler"
        aB = sys.argv[3] if len(sys.argv) > 3 else "lutteur"
        E, fin, duree, n = rendre(g, aA, aB)
        print(f"graine {g} · {aA} vs {aB}")
        print(f"  {n} lignes de log -> {len(E)} etapes | {duree:.0f}s | fin {fin}")
        print(f"  vainqueur conforme au moteur : OK")
