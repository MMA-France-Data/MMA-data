"""
gen_reference.py — produit le vecteur de reference du RNG.

On ne "verifie pas a peu pres" un generateur : soit la suite est identique
au bit pres, soit le portage est faux. Ce script ecrit reference_alea.json,
que verifier_alea.js doit rejouer EXACTEMENT.

Points couverts, choisis parce que ce sont les pieges (voir alea.js) :
  - random() consomme deux mots de 32 bits
  - randint() consomme un nombre VARIABLE de mots (tirage par rejet)
  - gauss() garde une valeur en cache : un appel sur deux ne tire rien
  - MELANGE : c'est le cas qui compte vraiment. Si les fonctions sont justes
    une par une mais consomment mal, seule une sequence entremelee le montre.
  - seed() doit remettre le cache gauss a zero
"""
import json
import random

SORTIE = "reference_alea.json"


def suite(graine):
    random.seed(graine)
    r = {"graine": graine}

    r["random"] = [random.random() for _ in range(12)]
    r["getrandbits"] = [random.getrandbits(k) for k in (1, 3, 7, 8, 16, 31, 32)]
    r["randint"] = [random.randint(0, n) for n in (1, 2, 3, 5, 9, 16, 17, 99, 1000)]
    r["uniform"] = [random.uniform(-3.5, 12.25) for _ in range(6)]
    r["choice"] = [random.choice("abcdefghij") for _ in range(10)]
    r["gauss"] = [random.gauss(58, 16) for _ in range(11)]     # impair : teste le cache
    r["choices"] = [random.choices(["a", "b", "c", "d"], [1, 7, 0.5, 3])[0]
                    for _ in range(15)]
    r["sample"] = [random.sample(list(range(40)), 2) for _ in range(5)]
    r["sample_grand"] = [random.sample(list(range(500)), 8) for _ in range(3)]

    # LE test qui compte : tout entremele, comme dans un vrai combat.
    melange = []
    for i in range(120):
        melange.append(round(random.random(), 15))
        melange.append(random.randint(0, 100))
        if i % 3 == 0:
            melange.append(round(random.gauss(0, 1), 15))
        if i % 5 == 0:
            melange.append(random.choice([10, 20, 30, 40, 50, 60, 70]))
        if i % 7 == 0:
            melange.append(random.choices([1, 2, 3], [2, 5, 1])[0])
        melange.append(round(random.uniform(0, 100), 15))
    r["melange"] = melange

    # seed() doit REMETTRE A ZERO le cache de gauss : on en consomme un
    # nombre impair juste avant, puis on reseme et on recompare.
    random.gauss(0, 1)
    random.seed(graine)
    r["apres_reseed"] = [random.gauss(0, 1) for _ in range(3)]
    return r


if __name__ == "__main__":
    ref = [suite(g) for g in (0, 1, 3, 11, 27, 42, 900, 123456789)]
    with open(SORTIE, "w") as f:
        json.dump(ref, f)
    n = sum(len(v) for s in ref for v in s.values() if isinstance(v, list))
    print(f"{SORTIE} ecrit — {len(ref)} graines, {n} valeurs de reference")
