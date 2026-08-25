"""Vecteur de reference pour ground_v2 : on pilote les 5 fonctions sur toutes
les positions, avec des profils tires au hasard, et on enregistre tout."""
import json, random, sys
sys.path.insert(0, "..")
import ground_v2 as G

CHAMPS = ["passing","posture_sol","half_guard_top","side_control_top","mount_top",
          "back_top","closed_guard_bottom","open_guard_bottom","butterfly_bottom",
          "half_guard_bottom","side_control_bottom","mount_bottom","back_defense",
          "turtle_defense","sweeps","shrimping","explosiveness","wall_walking",
          "hand_fighting_sol","submission_off_top","submission_off_bottom",
          "submission_def","ground_striking"]

class Faux:                       # un "Fighter" minimal : seul .ground compte
    def __init__(self, g): self.ground = g

def profil():
    return G.GroundProfile(**{c: random.randint(15, 95) for c in CHAMPS})

def suite(graine):
    random.seed(graine)
    out = {"graine": graine, "profils": [], "actions": []}
    positions = list(G.POSITIONS)
    for _ in range(600):
        pa, pb = profil(), profil()
        out["profils"].append([[getattr(pa,c) for c in CHAMPS],
                               [getattr(pb,c) for c in CHAMPS]])
        A, B = Faux(pa), Faux(pb)
        pos = positions[random.randint(0, len(positions)-1)]
        out["actions"].append([
            pos,
            G.tenter_progression(A, B, pos),
            list(G.tenter_evasion(B, A, pos)),
            list(G.tenter_soumission_top(A, B, pos)),
            list(G.tenter_soumission_bottom(B, A, pos)),
            list(G.resolve_gnp(A, B, pos)),
            round(pa.controle(pos), 12), round(pb.retention(pos), 12),
        ])
    return out

if __name__ == "__main__":
    ref = [suite(g) for g in (1, 11, 27, 42, 900)]
    json.dump({"champs": CHAMPS, "suites": ref}, open("reference_sol.json", "w"))
    print(f"reference_sol.json — {len(ref)} graines, "
          f"{sum(len(s['actions']) for s in ref)} tours, "
          f"{sum(len(s['actions']) for s in ref)*5} appels de fonction")
