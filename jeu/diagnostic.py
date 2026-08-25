"""
DIAGNOSTIC COMPLET — aucune modification du moteur.
Objectif : savoir ce qui marche et ce qui ne marche pas AVANT de toucher.
"""
import random
from collections import Counter
import adapter, engine, refonte, test_raccord as T, test_camp as C
from instrument import reset
from engine import TAKEDOWNS

T.arcs = refonte.JEU
TITRE = lambda s: print(f"\n{'='*66}\n{s}\n{'='*66}")


def combats(arc_a, arc_b, n=90, dev_a=None, dev_b=None, niveau=65, seed=5, espion=None):
    T.reinitialiser()
    random.seed(seed)
    acc = Counter()
    for i in range(n):
        div = T.DIVS[i % len(T.DIVS)]
        a = T.creer(niveau, div, arc_a); b = T.creer(niveau, div, arc_b)
        if dev_a: a = C.developper(a, *dev_a)
        if dev_b: b = C.developper(b, *dev_b)
        fa, fb = adapter.construire(a), adapter.construire(b)
        reset(fa); reset(fb); engine.reset_telemetry()
        w, log = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
        acc['n'] += 1; acc['v_a'] += (w is fa)
        acc['td_t'] += engine.TELEMETRY['td_tentes']
        acc['td_ok'] += engine.TELEMETRY['td_reussis']
        acc['cardio_b'] += fb.cardio_ratio()
        acc['iq_b'] += fb.mental.fight_iq
        if espion: espion(fa, fb, log, acc)
    return acc


# ---------------------------------------------------------------- 1
TITRE("1. LE FIGHT IQ SERT-IL A QUELQUE CHOSE ?")
print("On oppose le MEME archetype, en ne changeant QUE le fight_iq.")
for arc in ("lutteur", "boxeur_pressure", "grappler"):
    hi = ({("me", "iq"): 30}, {})
    lo = ({}, {("me", "iq"): 30})
    a = combats(arc, arc, n=90, dev_a=hi, dev_b=lo)
    print(f"  {arc:<18} iq+30 contre iq-30 : {a['v_a']/a['n']*100:>5.1f}% de victoires")
print("  (50% = le fight_iq ne sert a rien)")

# ---------------------------------------------------------------- 2
TITRE("2. LE LUTTEUR CIBLE-T-IL VRAIMENT LA FAIBLESSE ADVERSE ?")
def espion_td(fa, fb, log, acc):
    for l in log:
        for t in TAKEDOWNS:
            if f" {t} →" in l:
                acc["td_" + t] += 1
for titre, dev in (("adversaire normal", None),
                   ("adversaire au sprawl renforce +10", C.CAMP_TD if hasattr(C, "CAMP_TD") else
                    ({("lu","sprawl"):10,("so","sub_def"):8,("st","footwork"):6},
                     {("st","jab"):5,("st","cross"):5}))):
    a = combats("lutteur", "boxeur_pressure", n=90, dev_b=dev, espion=espion_td)
    tot = sum(v for k, v in a.items() if k.startswith("td_") and k[3:] in TAKEDOWNS)
    rep = " | ".join(f"{k[3:]} {a[k]/max(1,tot)*100:.0f}%"
                     for k in sorted(a, key=lambda x: -a[x]) if k[3:] in TAKEDOWNS)
    print(f"  {titre:<34} {rep}")
print("  (si la repartition ne bouge pas, il ne s'adapte pas du tout)")

# ---------------------------------------------------------------- 3
TITRE("3. LE SUR-ENGAGEMENT : COMBIEN DE TAKEDOWNS, ET A QUEL PRIX ?")
print(f"  {'affiche':<44}{'TD tentes':>11}{'reussite':>10}{'cardio fin':>12}")
for arc_b in ("boxeur_pressure", "kickboxeur", "brawler", "grappler"):
    a = combats(arc_b, "lutteur", n=90)
    print(f"  lutteur contre {arc_b:<29}{a['td_t']/a['n']:>11.1f}"
          f"{a['td_ok']/max(1,a['td_t'])*100:>9.0f}%{a['cardio_b']/a['n']:>12.2f}")
print("  (reel UFC : 2 a 6 tentatives par combat)")

# ---------------------------------------------------------------- 4
TITRE("4. LE CAMP D'ENTRAINEMENT PAIE-T-IL, A DOSE REALISTE ?")
CAMP = ({("lu","sprawl"):10, ("so","sub_def"):8, ("st","footwork"):6},
        {("st","jab"):5, ("st","cross"):5, ("st","crochet"):5, ("st","power"):3})
SEUL = ({("lu","sprawl"):10}, {("st","jab"):5, ("st","cross"):5})
for titre, dev in (("aucun camp", None), ("sprawl seul +10", SEUL), ("famille complete +10", CAMP)):
    a = combats("boxeur_pressure", "lutteur", n=120, dev_a=dev)
    print(f"  {titre:<30}{a['v_a']/a['n']*100:>6.1f}% de victoires du boxeur")

# ---------------------------------------------------------------- 5
TITRE("5. STABILITE DES MESURES — le meme test, trois graines")
for s in (5, 41, 900):
    a = combats("boxeur_pressure", "lutteur", n=120, seed=s)
    print(f"  graine {s:<5} boxeur contre lutteur : {a['v_a']/a['n']*100:>5.1f}%")
print("  (l'ecart entre graines = le bruit sous lequel on ne peut RIEN conclure)")
