"""Banc traducteur : de VRAIS logs de combat (varies : SUB, TKO, KO, DEC,
clinch, sol, 5 rounds), traduits cote Python, tout enregistre."""
import json, random, sys
sys.path.insert(0, "..")
import engine as E
import traducteur
from generator import generer_roster
from instrument import reset

cas = []
random.seed(11)
for i in range(24):
    div = ["poids_welter", "poids_lourd", "poids_mouche"][i % 3]
    roster = generer_roster(10, division=div, niveau_min=50, niveau_max=88)
    a, b = random.sample(roster, 2)
    fa, fb = a["fighter"], b["fighter"]
    # noms mono-jetons comme le fait rendu_combat (les regex \S+ l'exigent)
    fa.name, fb.name = "Kante", "Okafor"
    reset(fa); reset(fb)
    w, log = E.simuler_combat(fa, fb, rounds=(5 if i % 6 == 5 else 3), verbose=False)
    # le traducteur consomme AUSSI le random global (_autour) : on le seed
    random.seed(5000 + i)
    Et, fin, duree = traducteur.traduire(log, "Kante", "Okafor", graine=100 + i)
    cas.append({"log": log, "graine_glob": 5000 + i, "graine_trad": 100 + i,
                "E": Et, "fin": list(fin), "duree": round(duree, 9)})
json.dump(cas, open("reference_traducteur.json", "w"))
print(f"reference_traducteur.json — {len(cas)} combats traduits, "
      f"{sum(len(c['E']) for c in cas)} etapes")
