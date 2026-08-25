"""Les combattants generes PAR LE PROTOTYPE produisent-ils des combats sains ?"""
import random, re, json
from collections import Counter
import adapter, engine
from instrument import reset

# --- On rejoue la generation du prototype en Python, a l'identique ---
html = open("mma_manager_v2.html").read()
ARC = re.search(r'const ARCHETYPES=\{(.*?)\n\};', html, re.S).group(1)
arcs = {}
for m in re.finditer(r'(\w+):\{nom:"[^"]*",desc:"[^"]*",\s*'
                     r'st:\{(.*?)\},\s*lu:\{(.*?)\},so:\{(.*?)\},\s*'
                     r'ph:\{(.*?)\},me:\{(.*?)\}\}', ARC, re.S):
    k = m.group(1)
    d = lambda s: {a: int(b) for a, b in re.findall(r'(\w+):(-?\d+)', s)}
    arcs[k] = {"st": d(m.group(2)), "lu": d(m.group(3)), "so": d(m.group(4)),
               "ph": d(m.group(5)), "me": d(m.group(6))}
print(f"{len(arcs)} archetypes lus dans le HTML : {', '.join(arcs)}\n")

DIVS = ["poids mouche", "poids coq", "poids plume", "poids léger",
        "poids welter", "poids moyen", "poids mi-lourd", "poids lourd"]
_id = 0

def reinitialiser():
    """
    A APPELER AU DEBUT DE CHAQUE MESURE.

    `_id` est un compteur global, et adapter._alea() indexe son bruit
    deterministe dessus. Sans remise a zero, deux executions avec la MEME
    graine donnent des fiches identiques mais des combattants moteur
    DIFFERENTS : le banc n'est pas reproductible, et toute comparaison
    avant/apres mesure le changement PLUS un tirage different.
    """
    global _id
    _id = 0


def creer(niveau, division, arc=None):
    """Reproduit creerCombattant() du prototype."""
    global _id
    _id += 1
    k = arc or random.choice(list(arcs))
    a = arcs[k]
    g = lambda off: {n: int(max(5, min(99, niveau + v + random.gauss(0, 6))))
                     for n, v in off.items()}
    ph = g(a["ph"])
    ph["cardio"] = int(max(25, min(97, random.gauss(58, 16) + a["ph"].get("cardio", 0))))
    return {"id": _id, "nom": f"F{_id}", "division": division, "arc": k,
            "st": g(a["st"]), "lu": g(a["lu"]), "so": g(a["so"]),
            "ph": ph, "me": g(a["me"])}

random.seed(3)
issues = Counter()
par_arc = Counter(); vict_arc = Counter()
n = 0
for div in DIVS:
    fiches = [creer(random.randint(45, 85), div) for _ in range(30)]
    for _ in range(40):
        a, b = random.sample(fiches, 2)
        fa, fb = adapter.construire(a), adapter.construire(b)
        reset(fa); reset(fb)
        w, log = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
        t = "\n".join(log)
        if not w: issues["nul"] += 1
        elif "tape !" in t: issues["SUB"] += 1
        elif "KO SEC" in t: issues["KO sec"] += 1
        elif "TKO" in t: issues["TKO"] += 1
        else: issues["DEC"] += 1
        for f, fiche in ((fa, a), (fb, b)):
            par_arc[fiche["arc"]] += 1
            if w is f: vict_arc[fiche["arc"]] += 1
        n += 1

T = sum(issues.values())
print(f"{n} combats simules depuis des fiches au format du prototype\n")
print("ISSUES (reel : KO/TKO 32.6 | SUB 19.3 | DEC 46.8)")
print("  " + " | ".join(f"{k} {v/T*100:.1f}%" for k, v in issues.most_common()))
print("\nEQUILIBRE DES ARCHETYPES (aucun ne doit ecraser les autres)")
for k in sorted(par_arc, key=lambda x: -vict_arc[x]/par_arc[x]):
    print(f"  {k:<18}{vict_arc[k]/par_arc[k]*100:>5.1f}% de victoires  (n={par_arc[k]})")


# ===========================================================================
#  TOURNOI TOUTES RONDES — le seul equilibre mesurable
#
#  Le tirage au hasard donnait +/- 6 points de bruit sur le taux de victoire
#  d'un archetype : effectifs inegaux, niveaux inegaux, adversaires inegaux.
#  Ici chaque archetype affronte chaque autre le MEME nombre de fois, A NIVEAU
#  EGAL. Ce qui reste est du signal.
# ===========================================================================
def tournoi(par_paire=30, niveau=65, seed=1):
    import itertools
    random.seed(seed)
    noms = list(arcs)
    v = {k: 0 for k in noms}
    n = {k: 0 for k in noms}
    detail = {}
    for ka, kb in itertools.combinations(noms, 2):
        ga = gb = 0
        for i in range(par_paire):
            div = DIVS[i % len(DIVS)]
            a = creer(niveau, div, ka)
            b = creer(niveau, div, kb)
            fa, fb = adapter.construire(a), adapter.construire(b)
            reset(fa); reset(fb)
            w, _ = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
            n[ka] += 1; n[kb] += 1
            if w is fa: v[ka] += 1; ga += 1
            elif w is fb: v[kb] += 1; gb += 1
        detail[(ka, kb)] = (ga, gb, par_paire)
    return v, n, detail


if __name__ == "__main__" and "--tournoi" in __import__("sys").argv:
    v, n, detail = tournoi()
    print("\n=== TOURNOI TOUTES RONDES (niveau egal, memes effectifs) ===")
    for k in sorted(noms_ := v, key=lambda x: -v[x] / n[x]):
        print(f"  {k:<18}{v[k]/n[k]*100:>5.1f}%  ({v[k]}/{n[k]})")
    print("\n  confrontations les plus desequilibrees")
    pires = sorted(detail.items(), key=lambda kv: -abs(kv[1][0] - kv[1][1]))[:5]
    for (a, b), (ga, gb, t) in pires:
        print(f"    {a} {ga} - {gb} {b}   (sur {t})")
