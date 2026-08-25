"""Refonte des SIX archetypes ensemble, testee en toutes rondes."""
import itertools, random
import adapter, engine, test_raccord as T
from instrument import reset

# Chaque archetype : une force nette, un trou net, un total comparable.
# On ne cherche pas 50% partout — un style peut etre plus difficile — mais
# personne ne doit etre un piege pour le joueur.
JEU = {
"boxeur_pressure": {
  # Mains rapides et precises, coupe la cage. Mais aucune jambe, et il n'a
  # rien pour le sol : le lutteur et le grappler doivent le punir.
  "st":{"jab":18,"cross":20,"crochet":18,"uppercut":16,"overhand":10,
        "low_kick":-18,"body_kick":-16,"high_kick":-22,
        "power":12,"ko_power":14,"esquive":12,"blocage":4,"check":-16,
        "footwork":2,"cage":18,"vit_mains":16,"reflexes":10},
  "lu":{"shot":-6,"sprawl":10,"clinch":8},
  "so":{"passage":-8,"controle":-4,"sub":-14,"sub_def":2,"sweeps":-10},
  "ph":{"cardio":-4,"menton":6},"me":{"agressivite":16,"discipline":6,"iq":2}},

"kickboxeur": {
  # Vit de la distance. Si on lui coupe la route ou qu'on l'amene au sol,
  # il n'a plus rien.
  "st":{"jab":10,"cross":6,"crochet":-8,"uppercut":-12,"overhand":-8,
        "low_kick":22,"body_kick":22,"high_kick":24,
        "power":8,"ko_power":10,"esquive":2,"blocage":10,"check":16,
        "footwork":20,"cage":-20,"vit_mains":-6,"reflexes":6},
  "lu":{"shot":-12,"sprawl":8,"clinch":-12},
  "so":{"passage":-10,"controle":-8,"sub":-10,"sub_def":-4,"sweeps":-4},
  "ph":{"cardio":6,"menton":-2},"me":{"agressivite":-6,"discipline":2,"iq":8}},

"lutteur": {
  # Amene au sol et ecrase. Frappe faible mais pas inexistante : il doit
  # pouvoir tenir un round debout sans se faire massacrer.
  # MAINS LOURDES, TECHNIQUE PAUVRE. La puissance d'un lutteur vient de sa
  # base et de ses jambes, pas de sa technique de bras : il touche rarement
  # proprement, mais quand ca passe ca fait mal. Dans le moteur, `power` et
  # `ko_power` gouvernent les degats, les competences par arme gouvernent la
  # PRECISION — d'ou puissance haute et jab/cross/crochet toujours negatifs.
  # UNE seule arme lourde maitrisee, pas un arsenal : l'overhand du lutteur.
  # Le moteur lie les degats a la qualite d'execution (qualite = 0.45 +
  # competence/130), donc monter `power` sans monter AUCUNE competence
  # s'annulait : il sortait a 3.4 de degats par coup, le plus bas de tous.
  "st":{"jab":-6,"cross":-6,"crochet":-10,"uppercut":-4,"overhand":10,
        "low_kick":-10,"body_kick":-12,"high_kick":-18,
        "power":18,"ko_power":11,"esquive":-6,"blocage":4,"check":-2,
        "footwork":-4,"cage":14,"vit_mains":-6,"reflexes":-4},
  # Pente de takedown adoucie : il lui faut plus de competence brute pour le
  # meme resultat. Il gagne desormais par la QUALITE de ses entrees, plus par
  # leur nombre — c'est ce que fait un lutteur d'elite.
  # shot ramene de 34 a 27 : le CONTRE du lutteur accule (engine.py) lui rend
  # deja sa force contre les pressings. Garder les deux faisait double emploi
  # et il ecrasait tout ce qui avait un sprawl faible (23-6 contre le brawler,
  # 21-9 contre le kickeur, alors qu'il n'etait qu'a 18-12 contre le boxeur).
  "lu":{"shot":19,"sprawl":20,"clinch":19},
  "so":{"passage":14,"controle":22,"sub":-4,"sub_def":11,"sweeps":-8},
  "ph":{"cardio":12,"menton":6},"me":{"agressivite":2,"discipline":14,"iq":2}},

"grappler": {
  # Dangereux des que ca touche le sol, dessus comme dessous. Mais il doit
  # y arriver : sa lutte debout est moyenne.
  "st":{"jab":-4,"cross":-8,"crochet":-8,"uppercut":-8,"overhand":-6,
        "low_kick":-4,"body_kick":-6,"high_kick":-12,
        "power":-6,"ko_power":-10,"esquive":-2,"blocage":-2,"check":2,
        "footwork":-2,"cage":-6,"vit_mains":-2,"reflexes":2},
  "lu":{"shot":12,"sprawl":6,"clinch":14},
  "so":{"passage":22,"controle":12,"sub":28,"sub_def":22,"sweeps":24},
  "ph":{"cardio":4,"menton":-2},"me":{"agressivite":-2,"discipline":2,"iq":8}},

"polyvalent": {
  # Pas de trou, pas d'arme ecrasante. C'est sa DEFINITION : il ne doit
  # dominer personne. Total volontairement modeste.
  "st":{"jab":4,"cross":4,"crochet":2,"uppercut":2,"overhand":0,
        "low_kick":4,"body_kick":4,"high_kick":0,
        "power":0,"ko_power":0,"esquive":4,"blocage":4,"check":4,
        "footwork":4,"cage":2,"vit_mains":2,"reflexes":6},
  "lu":{"shot":4,"sprawl":8,"clinch":4},
  "so":{"passage":4,"controle":4,"sub":4,"sub_def":8,"sweeps":4},
  "ph":{"cardio":8,"menton":4},"me":{"agressivite":0,"discipline":10,"iq":12}},

"brawler": {
  # Tout ou rien. Menton, puissance, coupe la route pour imposer le chaos.
  # Aucune technique, aucun sol : le lutteur et le grappler le mangent.
  "st":{"jab":-4,"cross":14,"crochet":18,"uppercut":12,"overhand":24,
        "low_kick":-8,"body_kick":-6,"high_kick":-12,
        "power":26,"ko_power":26,"esquive":-18,"blocage":-4,"check":-8,
        "footwork":-12,"cage":24,"vit_mains":4,"reflexes":-10},
  "lu":{"shot":-8,"sprawl":-14,"clinch":10},
  "so":{"passage":-12,"controle":-6,"sub":-18,"sub_def":-16,"sweeps":-12},
  "ph":{"cardio":-2,"menton":18},"me":{"agressivite":24,"discipline":-8,"iq":-6}},
}


def tournoi(arcs, par_paire=30, niveau=65, seed=1):
    T.reinitialiser()
    random.seed(seed)
    noms = list(arcs); v = {k: 0 for k in noms}; n = dict(v); detail = {}
    T.arcs = arcs
    for ka, kb in itertools.combinations(noms, 2):
        ga = gb = 0
        for i in range(par_paire):
            div = T.DIVS[i % len(T.DIVS)]
            fa = adapter.construire(T.creer(niveau, div, ka))
            fb = adapter.construire(T.creer(niveau, div, kb))
            reset(fa); reset(fb)
            w, _ = engine.simuler_combat(fa, fb, rounds=3, verbose=False)
            n[ka] += 1; n[kb] += 1
            if w is fa: v[ka] += 1; ga += 1
            elif w is fb: v[kb] += 1; gb += 1
        detail[(ka, kb)] = (ga, gb)
    return v, n, detail


if __name__ == "__main__":
    v, n, detail = tournoi(JEU)
    print(f"{'archetype':<18}{'victoires':>10}{'offsets':>9}")
    print("-" * 38)
    for k in sorted(v, key=lambda x: -v[x] / n[x]):
        tot = sum(sum(g.values()) for g in JEU[k].values())
        print(f"  {k:<16}{v[k]/n[k]*100:>8.1f}%{tot:>+9d}")
    ecart = max(v[k]/n[k] for k in v) - min(v[k]/n[k] for k in v)
    print(f"\n  ecart max-min : {ecart*100:.1f} points")
    print("\n  toutes les confrontations")
    for (a, b), (ga, gb) in sorted(detail.items(), key=lambda kv: -abs(kv[1][0]-kv[1][1])):
        print(f"    {a:<17} {ga:>2} - {gb:<2} {b}")
