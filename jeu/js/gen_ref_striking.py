"""Vecteur de reference striking_v2 : profils tires au hasard, les deux
fonctions pilotees dans toutes les configurations (accule, setup, cible,
dernier coup, penalites)."""
import json, random, sys
sys.path.insert(0, "..")
import striking_v2 as S

CHAMPS = ["jab","cross","crochet","poing_corps","uppercut","overhand","low_kick",
          "body_kick","high_kick","teep","spinning","esquive_tete","parade",
          "blocage","check","posture_debout","lecture","vitesse_mains",
          "vitesse_jambes","reflexes","power","ko_power","footwork",
          "cage_cutting","enchainements","volume","timing"]

class Faux:
    def __init__(s, p): s.striking = p

def suite(graine):
    random.seed(graine)
    out = {"graine": graine, "tours": []}
    armes = list(S.ARMES)
    cibles = [None, "jambes", "corps", "tete"]
    derniers = [None, "jab"]
    for _ in range(700):
        pa = S.StrikingProfileV2(**{c: random.randint(15, 95) for c in CHAMPS})
        pb = S.StrikingProfileV2(**{c: random.randint(15, 95) for c in CHAMPS})
        A, B = Faux(pa), Faux(pb)
        arme = armes[random.randint(0, len(armes)-1)]
        acc = random.random() < 0.3
        setup = random.uniform(0, 12) if random.random() < 0.4 else 0.0
        pen_a = random.uniform(0.6, 1.0); pen_d = random.uniform(0.6, 1.0)
        r = S.resolve_frappe(A, B, arme, acc, pen_a, pen_d, setup)
        choix = S.choisir_arme(A, B, acc,
                               garde_basse=random.uniform(0, 0.5),
                               dernier_coup=derniers[random.randint(0, 1)],
                               cible=cibles[random.randint(0, 3)])
        out["tours"].append([arme, acc, round(setup, 12), round(pen_a, 12), round(pen_d, 12),
                             r[0], round(r[1], 10) if isinstance(r[1], float) else r[1],
                             r[2], r[3], round(r[4], 10),
                             choix,
                             round(pa.vitesse_arme(arme), 10), pa.competence(arme)])
    return out

if __name__ == "__main__":
    ref = [suite(g) for g in (1, 11, 27, 42, 900)]
    json.dump({"champs": CHAMPS, "suites": ref}, open("reference_striking.json", "w"))
    print(f"reference_striking.json — {len(ref)} graines, {sum(len(s['tours']) for s in ref)} tours")
