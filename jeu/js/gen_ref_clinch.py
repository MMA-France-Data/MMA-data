"""Vecteur de reference clinch : la sequence COMPLETE est pilotee (c'est elle
le vrai test — les fonctions unitaires sont couvertes par transitivite), sur
des profils tires, avec cage/pas cage, cardios varies, et des recepteurs de
degats qui enregistrent chaque .add()."""
import json, random, sys
sys.path.insert(0, "..")
import clinch as C

CHAMPS = ["pummeling","hand_fighting","clinch_wrestling","frame","posture",
          "clinch_striking","footwork_clinch","top_control"]

class Degats:
    def __init__(s): s.recus = []
    def add(s, zone, d): s.recus.append([zone, d])

class Faux:
    def __init__(s, nom, p): s.name = nom; s.clinch = p

def suite(graine):
    random.seed(graine)
    out = {"graine": graine, "seqs": []}
    for _ in range(500):
        pa = C.ClinchProfile(**{c: random.randint(15, 95) for c in CHAMPS})
        pb = C.ClinchProfile(**{c: random.randint(15, 95) for c in CHAMPS})
        A, B = Faux("Alpha", pa), Faux("Bravo", pb)
        dA, dB = Degats(), Degats()
        cage = random.random() < 0.4
        c1, c2 = random.uniform(0.2, 1.0), random.uniform(0.2, 1.0)
        issue, acteur, events, stats, _prise = C.clinch_sequence(
            A, B, dA, dB, contre_cage=cage, micro_actions=4,
            cardio1=c1, cardio2=c2)
        out["seqs"].append([
            issue, acteur.name, events,
            [stats["Alpha"]["sig"], stats["Alpha"]["usure"],
             round(stats["Alpha"]["score"], 10), round(stats["Alpha"]["cardio"], 10)],
            [stats["Bravo"]["sig"], stats["Bravo"]["usure"],
             round(stats["Bravo"]["score"], 10), round(stats["Bravo"]["cardio"], 10)],
            dA.recus, dB.recus,
        ])
    return out

if __name__ == "__main__":
    ref = [suite(g) for g in (1, 11, 27, 42, 900)]
    json.dump({"champs": CHAMPS, "suites": ref}, open("reference_clinch.json", "w"))
    n = sum(len(s["seqs"]) for s in ref)
    print(f"reference_clinch.json — {len(ref)} graines, {n} sequences completes")
