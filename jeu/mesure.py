"""Mesure de reference : temps par phase + volume de frappe, par division."""
import random, statistics, sys
from collections import Counter
import engine
from engine import simuler_combat, DIVISIONS, ARMES_V2, TELEMETRY, reset_telemetry
from generator import generer_roster
from instrument import reset

def mesurer(n_par_div=60, seed=11, divisions=None, n_rosters=3):
    random.seed(seed)
    res = {}
    for div in (divisions or DIVISIONS):
        reset_telemetry()
        tent = touch = 0; n = 0
        issues = Counter()
        for _ in range(n_rosters):
            roster = generer_roster(40, division=div, niveau_min=45, niveau_max=85)
            for _ in range(n_par_div):
                a,b = random.sample(roster,2)
                fa,fb = a['fighter'], b['fighter']
                reset(fa); reset(fb)
                w, log = simuler_combat(fa,fb,rounds=3,verbose=False)
                t='\n'.join(log)
                if not w: issues["nul"]+=1
                elif 'tape !' in t: issues["SUB"]+=1
                elif 'TKO AU SOL' in t: issues["TKO sol"]+=1
                elif 'KO SEC' in t: issues["KO sec"]+=1
                elif 'TKO' in t: issues["TKO"]+=1
                else: issues["DEC"]+=1
                for l in log:
                    if "→ touché" in l: touch+=1; tent+=1
                    elif "→ manqué" in l: tent+=1
                    elif "ground and pound →" in l:
                        tent+=1
                        if "dégâts" in l: touch+=1
                n+=1
        minutes = TELEMETRY["t_total"]/60.0
        res[div] = {
            "n": n,
            "pc_debout": TELEMETRY["t_debout"]/TELEMETRY["t_total"]*100,
            "pc_clinch": TELEMETRY["t_clinch"]/TELEMETRY["t_total"]*100,
            "pc_sol":    TELEMETRY["t_sol"]/TELEMETRY["t_total"]*100,
            "min_par_combat": minutes/n,
            # /min = par minute de combat, mais pour UN combattant (donc /2)
            "tent_min": tent/minutes/2,
            "touch_min": touch/minutes/2,
            "prec": touch/max(1,tent)*100,
            "relances": TELEMETRY["n_relances"]/n,
            "td_tentes": TELEMETRY["td_tentes"]/n,
            "td_pc": TELEMETRY["td_reussis"]/max(1,TELEMETRY["td_tentes"])*100,
            "td_cl": TELEMETRY["td_clinch"]/n,
            "autres_seq": (TELEMETRY["sequences_sol"]-TELEMETRY["td_reussis"]-TELEMETRY["td_clinch"])/n,
            "seq_sol": TELEMETRY["sequences_sol"]/n,
            "duree_seq": TELEMETRY["t_sol"]/max(1,TELEMETRY["sequences_sol"]),
            "min_combat": TELEMETRY["t_total"]/60/n,
            "issues": issues,
            "ko": (issues["KO sec"]+issues["TKO"]+issues["TKO sol"])/max(1,n)*100,
        }
    return res

# ---------------------------------------------------------------------------
#  CIBLES REELLES — source : HonestElo / UFCStats, maj 1 aout 2026
#  Lues au MEME centile (30e des combattants actifs) dans chaque division,
#  correction indispensable : un top-25 sur 37 lourds actifs descend bien
#  plus bas dans le vivier qu'un top-25 sur 90 legers.
#
#  RESULTAT : le volume par minute est quasi PLAT (1,22x d'ecart) et NON
#  monotone avec le poids. Le lourd est le plus bas (8,1) mais la mouche
#  (8,8) est sous le leger (9,8). Le gradient reel est sur la PRECISION,
#  pas sur le volume : 49% en paille -> 58% en lourd, proprement monotone.
# ---------------------------------------------------------------------------
CIBLE_TENT = {  # frappes sig. tentees / minute de combat, par combattant
 "poids_paille":9.6,"poids_mouche":8.8,"poids_coq":9.1,"poids_plume":8.9,
 "poids_leger":9.8,"poids_welter":9.3,"poids_moyen":8.8,"poids_mi_lourd":9.4,
 "poids_lourd":8.1}

# Precision mesuree au 30e centile : 49 -> 58%. Le roster du moteur (45-85)
# couvre tout le vivier, pas seulement le tiers superieur : on garde la FORME
# du gradient en l'ancrant ~8 points plus bas, soit la moyenne UFC de 40-45%.
# Gradient de KO reel par division (8 591 combats UFC, deja valide - decision C8)
KO_REEL = {"poids_paille":13.5,"poids_mouche":24.1,"poids_coq":26.3,"poids_plume":29.7,
 "poids_leger":30.3,"poids_welter":33.7,"poids_moyen":38.4,"poids_mi_lourd":46.1,
 "poids_lourd":52.7}

CIBLE_PREC = {
 "poids_paille":41,"poids_mouche":42,"poids_coq":43,"poids_plume":44,
 "poids_leger":44,"poids_welter":45,"poids_moyen":45,"poids_mi_lourd":46,
 "poids_lourd":50}

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv)>1 else 60
    r = mesurer(n_par_div=n, n_rosters=int(sys.argv[2]) if len(sys.argv)>2 else 3)
    print(f"{'division':<15}{'debout':>7}{'clinch':>7}{'sol':>6}{'|':>2}"
          f"{'tent/m':>7}{'cib':>5}{'prec':>7}{'cib':>5}{'|':>2}{'TDtent':>7}{'seqSol':>7}{'dureeSeq':>9}{'relanc':>7}")
    print("-"*84)
    for d,v in r.items():
        print(f"{d:<15}{v['pc_debout']:>6.1f}%{v['pc_clinch']:>6.1f}%{v['pc_sol']:>5.1f}%{'|':>2}"
              f"{v['tent_min']:>7.1f}{CIBLE_TENT[d]:>5.1f}{v['prec']:>6.1f}%{CIBLE_PREC[d]:>5.0f}{'|':>2}"
              f"{v['td_tentes']:>7.1f}{v['td_pc']:>5.0f}%{v['td_cl']:>7.1f}{v['autres_seq']:>7.1f}{v['duree_seq']:>8.0f}s{v['ko']:>6.1f}{KO_REEL[d]:>6.1f}")
    print("\nCible : debout 65-70% | clinch ~10% | sol 20-25%")
    tot = Counter()
    for v in r.values(): tot.update(v["issues"])
    T = sum(tot.values())
    print("\nISSUES (reel : KO/TKO 32.6 | SUB 19.3 | DEC 46.8)")
    print("  " + " | ".join(f"{k} {v/T*100:.1f}%" for k,v in tot.most_common()))
