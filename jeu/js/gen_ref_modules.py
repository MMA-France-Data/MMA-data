"""Vecteur de reference pour stance.py et body.py : on pilote les deux modules
avec des milliers de tirages et on enregistre TOUT ce qui sort, y compris
l'etat interne apres coup (les degats accumules revelent une divergence que
le retour de fonction pourrait cacher)."""
import json, random, sys
sys.path.insert(0, "..")
import stance as S, body as B

def suite(graine):
    random.seed(graine)
    out = {"graine": graine, "stance": [], "body": []}

    # --- stance : on fait vivre deux combattants sur 400 echanges
    st_a = S.StanceState(S.ORTHODOX, random.randint(10, 95))
    st_b = S.StanceState(S.SOUTHPAW, random.randint(10, 95))
    lg_a, lg_b = S.LegDamage(), S.LegDamage()
    for i in range(400):
        r = S.resolve_leg_kick(None, None, st_a, st_b, lg_a, lg_b,
                               random.choice(["calf_kick", "low_kick", "body_kick"]),
                               random.randint(20, 90), random.randint(20, 90))
        sw, raison = S.veut_switcher(st_b, lg_b, random.randint(20, 90))
        if sw: st_b.switch()
        out["stance"].append([
            r[0], r[1], r[2], sw, raison,
            lg_a.gauche, lg_a.droite, lg_b.gauche, lg_b.droite,
            st_b.garde_actuelle, st_b.switches,
            round(S.stabilite(st_b, lg_b, 50), 12),
            round(S.facteur_puissance(st_b, lg_b), 12),
            round(S.facteur_esquive(st_b, lg_b), 12),
            round(S.facteur_precision(st_b), 12),
        ])
        if i % 90 == 89:            # on repart d'un corps neuf de temps en temps
            lg_a, lg_b = S.LegDamage(), S.LegDamage()

    # --- body : 400 coups au corps sur un meme homme
    bs = B.BodyState(random.randint(20, 90), random.randint(20, 90))
    for i in range(400):
        coup = random.choice(list(B.COUPS_CORPS))
        t, dmg, zone, cout, ko = B.resolve_body_strike(
            coup, random.randint(20, 95), bs, random.uniform(0.5, 1.2))
        out["body"].append([
            t, dmg, zone, round(cout, 12), ko,
            round(bs.degats_corps, 12), round(bs.degats_foie, 12),
            bs.coups_corps_encaisses,
            round(bs.chute_de_garde(), 12), round(bs.garde_effective(), 12),
            round(bs.drain_cardio(), 12), round(bs.risque_ko_foie(), 12),
            round(bs.risque_ko_corps_general(), 12),
            round(B.bonus_high_kick(bs), 12),
        ])
        if ko: bs = B.BodyState(random.randint(20, 90), random.randint(20, 90))
    return out

if __name__ == "__main__":
    ref = [suite(g) for g in (1, 3, 11, 27, 42, 900)]
    json.dump(ref, open("reference_modules.json", "w"))
    print(f"reference_modules.json — {len(ref)} graines, "
          f"{sum(len(s['stance'])+len(s['body']) for s in ref)} etats enregistres")
