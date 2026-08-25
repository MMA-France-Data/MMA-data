"""
Le trou d'un archetype est-il REPARABLE par l'entrainement ?

C'est LA question qui decide si le camp d'entrainement a un sens. Si investir
en defense de takedown ne change pas l'affiche contre un lutteur, alors le
scouting et le camp ne sont que de la decoration.

Et le contre-test, aussi important : si le lutteur travaille sa lutte de son
cote, est-ce que l'investissement du boxeur tient encore ? Sinon c'est une
course aux armements ou seul compte qui investit le plus, pas qui investit
au bon endroit.
"""
import random
from collections import Counter
import adapter, engine, refonte, test_raccord as T
from instrument import reset

T.arcs = refonte.JEU


def developper(fiche, plus, moins):
    """
    Un camp est a somme nulle : ce qu'on gagne ici, on le perd ailleurs.
    Sans ca, entrainer devient gratuit et il n'y a plus de choix.
    """
    f = {k: (dict(v) if isinstance(v, dict) else v) for k, v in fiche.items()}
    for (g, k), v in plus.items():
        f[g][k] = int(max(5, min(99, f[g][k] + v)))
    for (g, k), v in moins.items():
        f[g][k] = int(max(5, min(99, f[g][k] - v)))
    return f


# +40 de defense de takedown, paye 20 de boxe. Le profil "Topuria".
TD_DEF = ({("lu", "sprawl"): 40, ("so", "sub_def"): 30, ("st", "footwork"): 20},
          {("st", "jab"): 20, ("st", "cross"): 20, ("st", "crochet"): 20,
           ("st", "uppercut"): 20, ("st", "power"): 12})

# Le lutteur qui bosse sa lutte, paye sa frappe (deja faible).
LUTTE_PLUS = ({("lu", "shot"): 40, ("lu", "clinch"): 30, ("so", "controle"): 25},
              {("st", "jab"): 15, ("st", "cross"): 15, ("st", "low_kick"): 15,
               ("ph", "cardio"): 8})


def duel(arc_a, arc_b, dev_a=None, dev_b=None, n=100, niveau=65, seed=5):
    T.reinitialiser()
    random.seed(seed)
    v = 0
    for i in range(n):
        div = T.DIVS[i % len(T.DIVS)]
        a = T.creer(niveau, div, arc_a)
        b = T.creer(niveau, div, arc_b)
        if dev_a: a = developper(a, *dev_a)
        if dev_b: b = developper(b, *dev_b)
        fa, fb = adapter.construire(a), adapter.construire(b)
        reset(fa); reset(fb)
        w, _ = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
        if w is fa: v += 1
    return v / n * 100


if __name__ == "__main__":
    N = 100
    print(f"Boxeur pressure contre lutteur — {N} combats par condition\n")
    lignes = [
        ("les deux bruts, sans camp",              None,   None),
        ("le boxeur a bosse sa def de TD",         TD_DEF, None),
        ("... et le lutteur a bosse sa lutte",     TD_DEF, LUTTE_PLUS),
        ("seul le lutteur a bosse",                None,   LUTTE_PLUS),
    ]
    base = None
    for titre, da, db in lignes:
        r = duel("boxeur_pressure", "lutteur", da, db, n=N)
        if base is None: base = r
        print(f"  {titre:<38}{r:>6.1f}%   ({r-base:+.1f})")
    print("\n  (taux de victoire du BOXEUR)")
