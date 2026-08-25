"""Instrumentation du moteur : mesurer avant de corriger."""
import random, statistics
from collections import Counter
from generator import generer_roster
from engine import simuler_combat, DIVISIONS, ARMES_V2

def reset(x):
    x.head_damage=0; x.cardio=100.0; x.sonne=0; x.knockdowns=0
    x.legs.gauche=x.legs.droite=0
    x.body.degats_corps=x.body.degats_foie=0
    x.stance.garde_actuelle=x.stance.garde_naturelle

def mesurer(n_par_div=250, seed=11):
    random.seed(seed)
    stats = {
        "echanges_par_round": [], "frappes_tentees": [], "frappes_touchees": [],
        "dmg_par_coup": [], "tete_fin": [], "corps_fin": [], "jambes_fin": [],
        "cardio_fin": [], "round_finish": [], "phases": Counter(), "armes": Counter(),
        "zones": Counter(), "issues": Counter(),
    }
    for div in DIVISIONS:
        roster = generer_roster(45, division=div, niveau_min=45, niveau_max=85)
        for _ in range(n_par_div):
            a,b = random.sample(roster,2)
            fa,fb = a['fighter'], b['fighter']
            reset(fa); reset(fb)
            w, log = simuler_combat(fa, fb, rounds=3, verbose=False)
            t = '\n'.join(log)

            # Issue
            if not w: stats["issues"]["nul"] += 1
            elif 'tape !' in t: stats["issues"]["SUB"] += 1
            elif 'TKO AU SOL' in t: stats["issues"]["TKO sol"] += 1
            elif 'KO SEC' in t: stats["issues"]["KO sec"] += 1
            elif 'TKO' in t: stats["issues"]["TKO frappes"] += 1
            else: stats["issues"]["DEC"] += 1

            # Round du finish
            r_fin = 3
            for r in (1,2,3):
                if f"ROUND {r}" in t:
                    seg = t.split(f"ROUND {r}")[-1]
                    if any(k in seg for k in ("KO SEC","TKO","tape !")):
                        r_fin = r; break
            stats["round_finish"].append(r_fin)

            # Comptages depuis le log
            for ligne in log:
                if "→ touché" in ligne:
                    stats["frappes_touchees"].append(1)
                    for z in ("tête","corps","foie","jambe"):
                        if z in ligne: stats["zones"][z] += 1; break
                    try:
                        d = float(ligne.split("(")[1].split(")")[0])
                        stats["dmg_par_coup"].append(d)
                    except Exception: pass
                if "→ manqué" in ligne or "→ touché" in ligne:
                    stats["frappes_tentees"].append(1)
                    mot = ligne.strip().split()
                    for m in mot:
                        if m in ARMES_V2: stats["armes"][m] += 1; break
                if "ground and pound" in ligne: stats["phases"]["sol"] += 1
                if "clinch" in ligne: stats["phases"]["clinch"] += 1
                if "[cage]" in ligne: stats["phases"]["debout"] += 1

            stats["tete_fin"].append(max(fa.head_damage, fb.head_damage))
            stats["corps_fin"].append(max(fa.body.degats_corps, fb.body.degats_corps))
            stats["jambes_fin"].append(max(fa.legs.total(), fb.legs.total()))
            stats["cardio_fin"].append(min(fa.cardio, fb.cardio))
    return stats

if __name__ == "__main__":
    s = mesurer()
    T = sum(s["issues"].values())
    tent = len(s["frappes_tentees"]); touch = len(s["frappes_touchees"])

    print("=== ISSUES ===   (reel : KO/TKO 32.6 | SUB 19.3 | DEC 46.8)")
    for k,v in s["issues"].most_common():
        print(f"  {k:<13}{v/T*100:>6.1f}%")

    print("\n=== FRAPPE ===")
    print(f"  tentees/combat      {tent/T:>7.1f}   (reel ~90-110 sur 3 rounds)")
    print(f"  touchees/combat     {touch/T:>7.1f}   (reel ~40-50)")
    print(f"  precision           {touch/max(1,tent)*100:>6.1f}%   (reel 42-45%)")
    d = s["dmg_par_coup"]
    if d:
        print(f"  degats/coup moyen   {statistics.mean(d):>7.1f}")
        print(f"  mediane             {statistics.median(d):>7.1f}")
        print(f"  max observe         {max(d):>7.1f}")

    print("\n=== ZONES TOUCHEES ===   (reel : tete ~60%, corps ~22%, jambes ~18%)")
    tz = sum(s["zones"].values())
    for z,v in s["zones"].most_common():
        print(f"  {z:<8}{v/max(1,tz)*100:>6.1f}%")

    print("\n=== DEGATS CUMULES EN FIN DE COMBAT (le plus touche des deux) ===")
    for lab,k in [("tete","tete_fin"),("corps","corps_fin"),("jambes","jambes_fin")]:
        v = s[k]
        print(f"  {lab:<8} moyenne {statistics.mean(v):>6.1f} | mediane {statistics.median(v):>6.1f} | max {max(v):>6.1f}")
    print(f"  cardio le plus bas   moyenne {statistics.mean(s['cardio_fin']):>5.1f}")

    print("\n=== ROUND DU FINISH ===")
    c = Counter(s["round_finish"])
    for r in (1,2,3):
        print(f"  round {r} : {c[r]/T*100:>5.1f}%")

    print("\n=== ARMES LES PLUS UTILISEES ===")
    ta = sum(s["armes"].values())
    for a,v in s["armes"].most_common(8):
        print(f"  {a:<20}{v/max(1,ta)*100:>6.1f}%")
