"""Banc engine : des combats COMPLETS. Les deux Fighter sont construits par
tirages seedes (memes champs, meme ordre), puis simuler_combat, et on
enregistre TOUT : le log ligne a ligne, le vainqueur, l'etat final."""
import json, random, sys
sys.path.insert(0, "..")
import engine as E
from striking_v2 import StrikingProfileV2
from clinch import ClinchProfile
from ground_v2 import GroundProfile

ST = ["jab","cross","crochet","poing_corps","uppercut","overhand","low_kick",
      "body_kick","high_kick","teep","spinning","esquive_tete","parade","blocage",
      "check","posture_debout","lecture","vitesse_mains","vitesse_jambes","reflexes",
      "power","ko_power","footwork","cage_cutting","enchainements","volume","timing"]
WR = ["shot","clinch_wrestling","throws","sprawl","whizzer","balance","grip_fighting"]
GR = ["passing","posture_sol","half_guard_top","side_control_top","mount_top","back_top",
      "closed_guard_bottom","open_guard_bottom","butterfly_bottom","half_guard_bottom",
      "side_control_bottom","mount_bottom","back_defense","turtle_defense","sweeps",
      "shrimping","explosiveness","wall_walking","hand_fighting_sol","submission_off_top",
      "submission_off_bottom","submission_def","ground_striking"]
CL = ["pummeling","hand_fighting","clinch_wrestling","frame","posture",
      "clinch_striking","footwork_clinch","top_control"]
PH = ["cardio","chin","recovery","body_conditioning","balance_base"]
ME = ["discipline","fight_iq","aggression"]
DIVS = list(E.DIVISIONS)

def combattant(nom):
    st = StrikingProfileV2(**{c: random.randint(20, 95) for c in ST})
    wr = E.WrestlingProfile(**{c: random.randint(20, 95) for c in WR})
    gr = GroundProfile(**{c: random.randint(20, 95) for c in GR})
    cl = ClinchProfile(**{c: random.randint(20, 95) for c in CL})
    ph = E.PhysicalProfile(**{c: random.randint(30, 95) for c in PH})
    me = E.MentalProfile(**{c: random.randint(20, 95) for c in ME})
    gp = {"wrestling": random.uniform(0.05, 0.5), "clinch": random.uniform(0.05, 0.35)}
    gp["striking"] = 1.0 - gp["wrestling"] - gp["clinch"]
    garde = E.SOUTHPAW if random.random() < 0.22 else E.ORTHODOX
    div = DIVS[random.randint(0, len(DIVS) - 1)]
    return E.Fighter(nom, st, wr, gr, cl, ph, me,
                     gameplan=gp, garde=garde,
                     stance_switching=random.randint(20, 90), division=div)

def suite(graine, n_combats, rounds):
    random.seed(graine)
    out = []
    for i in range(n_combats):
        fa, fb = combattant("Alpha"), combattant("Bravo")
        w, log = E.simuler_combat(fa, fb, rounds=rounds, verbose=False)
        out.append({
            "vainqueur": w.name if w else None,
            "log": log,
            "final": [[round(fa.cardio, 9), fa.sonne, fa.knockdowns, fa.td_echecs],
                      [round(fb.cardio, 9), fb.sonne, fb.knockdowns, fb.td_echecs]],
        })
    return {"graine": graine, "rounds": rounds, "combats": out}

if __name__ == "__main__":
    ref = [suite(11, 30, 3), suite(41, 30, 3), suite(900, 30, 3), suite(27, 15, 5)]
    json.dump(ref, open("reference_engine.json", "w"))
    nl = sum(len(c["log"]) for s in ref for c in s["combats"])
    print(f"reference_engine.json — {sum(len(s['combats']) for s in ref)} combats complets, {nl} lignes de log")
