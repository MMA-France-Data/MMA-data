"""
MMA Manager - Système de clinch
Le clinch est une phase à haute densité : chaque "échange" contient plusieurs
micro-actions (pummeling, prises, tentatives de sortie), contrairement au debout.
"""

import random


# =========================================================
#  PRISES DE CLINCH
# =========================================================
# Chaque prise donne accès à des options différentes et a sa contre-prise.
PRISES = {
    "neutre": {
        "valeur": 0,
        "options": ["frappe", "pummel", "body_lock_attempt", "sortie"],
        "domination": 0.0,
    },
    "over_under": {          # une main dessous, une dessus - la prise la plus courante
        "valeur": 1,
        "options": ["frappe", "trip_attempt", "pummel", "sortie", "frappe"],
        "domination": 0.15,
    },
    "double_under": {        # les deux sous-crochets - contrôle du corps
        "valeur": 3,
        "options": ["body_lock_attempt", "frappe", "mat_return", "sortie"],
        "domination": 0.45,
    },
    "collar_tie": {          # une main derrière la nuque
        "valeur": 2,
        "options": ["frappe", "frappe", "snap_down", "sortie"],
        "domination": 0.30,
    },
    "thai_plum": {           # double collar tie - le broyeur à genoux
        "valeur": 4,
        "options": ["frappe", "frappe", "sortie"],
        "domination": 0.60,
    },
    "back_clinch": {         # dans le dos, ceinture
        "valeur": 5,
        # /!\ back_choke_debout : le dos DEBOUT, rare et transitoire.
        "options": ["mat_return", "throw_attempt", "frappe", "sortie",
                    "back_choke_debout"],
        "domination": 0.70,
    },
}

# Ce qui permet de gagner une prise donnée (stat offensive -> stat défensive)
BATAILLE_PRISES = {
    "over_under":   ("pummeling", "pummeling"),
    "double_under": ("pummeling", "frame"),
    "collar_tie":   ("hand_fighting", "posture"),
    "thai_plum":    ("hand_fighting", "posture"),
    "back_clinch":  ("clinch_wrestling", "frame"),
}

# =========================================================
#  SORTIES DE CLINCH
# =========================================================
# Plusieurs techniques, chacune avec sa propre difficulté et sa défense appariée.
# Point clé : même en position inférieure, on peut multiplier les tentatives.
SORTIES = {
    "frame_push": {         # cadrer et repousser
        "skill": "frame", "defense": "clinch_wrestling",
        "base": 40, "cout_cardio": 2,
    },
    "pummel_out": {         # repummeler jusqu'à se dégager
        "skill": "pummeling", "defense": "pummeling",
        "base": 35, "cout_cardio": 3,
    },
    "spin_out": {           # pivoter et sortir sur le côté
        "skill": "footwork_clinch", "defense": "clinch_wrestling",
        "base": 30, "cout_cardio": 3,
    },
    "duck_under": {         # passer sous le bras - risqué mais paye gros
        "skill": "hand_fighting", "defense": "posture",
        "base": 25, "cout_cardio": 4,
        "bonus": "back_clinch",   # réussi, on peut prendre le dos
    },
    "wall_walk": {          # remonter le long de la cage
        "skill": "frame", "defense": "top_control",
        "base": 32, "cout_cardio": 4,
        "cage_only": True,
    },
}


class ClinchProfile:
    """Profil de clinch détaillé."""

    def __init__(self, **kwargs):
        # --- Bataille des prises ---
        self.pummeling = kwargs.get("pummeling", 50)        # gagner les sous-crochets
        self.hand_fighting = kwargs.get("hand_fighting", 50)  # gérer les mains, les colliers
        self.clinch_wrestling = kwargs.get("clinch_wrestling", 50)

        # --- Défense ---
        self.frame = kwargs.get("frame", 50)      # créer de l'espace avec les avant-bras
        self.posture = kwargs.get("posture", 50)  # garder la tête haute, résister au snap

        # --- Frappes en clinch ---
        self.clinch_striking = kwargs.get("clinch_striking", 50)

        # --- Mobilité ---
        self.footwork_clinch = kwargs.get("footwork_clinch", 50)
        self.top_control = kwargs.get("top_control", 50)


# =========================================================
#  BATAILLE DES PRISES
# =========================================================
def contest_grip(attacker, defender, prise_visee):
    """Tenter d'améliorer sa prise de clinch."""
    if prise_visee not in BATAILLE_PRISES:
        return False
    stat_off, stat_def = BATAILLE_PRISES[prise_visee]
    off = getattr(attacker.clinch, stat_off)
    dfn = getattr(defender.clinch, stat_def)
    chance = 40 + (off - dfn) * 1.3
    return random.uniform(0, 100) < max(5, min(88, chance))


def prise_superieure(prise_actuelle, profil):
    """Vers quelle prise essayer de progresser selon son style."""
    valeur_actuelle = PRISES[prise_actuelle]["valeur"]
    candidates = [p for p, d in PRISES.items() if d["valeur"] > valeur_actuelle and p in BATAILLE_PRISES]
    if not candidates:
        return None
    # Un lutteur vise le contrôle du corps, un frappeur vise le plum
    if profil.clinch_wrestling > profil.clinch_striking:
        prefs = ["double_under", "back_clinch", "over_under"]
    else:
        prefs = ["thai_plum", "collar_tie", "over_under"]
    for p in prefs:
        if p in candidates:
            return p
    return random.choice(candidates)


# =========================================================
#  SORTIES
# =========================================================
def try_exit(escaper, controller, sortie, contre_cage=False, cardio_ratio=1.0):
    """
    Tenter une sortie de clinch.
    Même en infériorité, l'accumulation de tentatives finit par payer.
    """
    info = SORTIES[sortie]
    if info.get("cage_only") and not contre_cage:
        return "impossible", None

    off = getattr(escaper.clinch, info["skill"], 50)
    dfn = getattr(controller.clinch, info["defense"], 50)
    malus_cage = 12 if contre_cage else 0
    # Multiplicateur adouci : même en grosse infériorité, insister finit par payer
    chance = info["base"] + (off - dfn) * 0.7 - malus_cage
    chance *= (0.75 + 0.25 * cardio_ratio)

    if random.uniform(0, 100) < max(4, min(85, chance)):
        return "réussi", info.get("bonus")
    return "échoué", None


def choisir_sortie(escaper, contre_cage):
    """Choix de la technique de sortie selon le profil et la situation."""
    dispo = [s for s, i in SORTIES.items() if not i.get("cage_only") or contre_cage]
    # Pondéré par la compétence du combattant sur chaque technique
    poids = [max(1, getattr(escaper.clinch, SORTIES[s]["skill"], 50)) for s in dispo]
    return random.choices(dispo, weights=poids, k=1)[0]


# =========================================================
#  FRAPPES EN CLINCH
# =========================================================
FRAPPES_CLINCH = {
    # --- Coups d'usure : volume élevé, dégâts faibles, peu de poids au scoring ---
    "genou_cuisse": {
        "dmg": (1, 3), "cible": "jambe", "besoin": 0.0,
        "significatif": False, "poids_score": 0.15, "drain_cardio": 0.3,
    },
    "petit_corps": {           # coups courts au ventre, sans angle réel
        "dmg": (1, 3), "cible": "corps", "besoin": 0.0,
        "significatif": False, "poids_score": 0.15, "drain_cardio": 0.4,
    },
    "short_hook": {
        "dmg": (2, 5), "cible": "tete", "besoin": 0.15,
        "significatif": False, "poids_score": 0.4, "drain_cardio": 0.1,
    },

    # --- Coups significatifs : rares, demandent un vrai contrôle, font mal ---
    "knee": {                  # genou au corps, appuyé
        "dmg": (6, 13), "cible": "corps", "besoin": 0.30,
        "significatif": True, "poids_score": 1.0, "drain_cardio": 0.8,
    },
    "knee_head": {             # genou à la tête - demande le plum
        "dmg": (10, 20), "cible": "tete", "besoin": 0.55,
        "significatif": True, "poids_score": 1.5, "drain_cardio": 0.5,
    },
    "elbow": {
        "dmg": (6, 14), "cible": "tete", "besoin": 0.25,
        "significatif": True, "poids_score": 1.2, "drain_cardio": 0.2,
    },
}

# Seuil de dégâts au-delà duquel un coup compte comme "significatif" pour les juges
SEUIL_SIGNIFICATIF = 5


def resolve_clinch_strike(attacker, defender, frappe, domination):
    """
    Une frappe en clinch.
    Retourne (résultat, dégâts, zone, significatif)
    Les coups d'usure passent facilement mais ne comptent presque pas.
    """
    info = FRAPPES_CLINCH[frappe]
    if domination < info["besoin"]:
        return "pas d'angle", 0, None, False

    # Les coups d'usure sont beaucoup plus faciles à placer
    facilite = 25 if not info["significatif"] else 0
    chance = 45 + facilite + (attacker.clinch.clinch_striking - defender.clinch.frame) * 0.7 + domination * 40

    if random.uniform(0, 100) < max(10, min(92, chance)):
        lo, hi = info["dmg"]
        dmg = random.randint(lo, hi)
        dmg = int(dmg * (1 + domination * 0.5))
        # Un coup n'est "significatif" que s'il est de la bonne catégorie ET fait mal
        sig = info["significatif"] and dmg >= SEUIL_SIGNIFICATIF
        return "touché", dmg, info["cible"], sig
    return "bloqué", 0, None, False


def choisir_frappe_clinch(attacker, domination):
    """
    Choix de frappe : l'usure est le pain quotidien du clinch,
    les gros coups n'arrivent que si le contrôle le permet.
    """
    dispo = [f for f, i in FRAPPES_CLINCH.items() if domination >= i["besoin"]]
    poids = []
    for f in dispo:
        i = FRAPPES_CLINCH[f]
        # Base : les coups d'usure sont 3x plus fréquents
        p = 3.0 if not i["significatif"] else 1.0
        # Un bon frappeur en clinch cherche davantage les coups lourds
        if i["significatif"]:
            p *= (0.5 + attacker.clinch.clinch_striking / 100)
        poids.append(p)
    return random.choices(dispo, weights=poids, k=1)[0]


# =========================================================
#  SOUS-BOUCLE DE CLINCH
# =========================================================
def veut_rompre(controller, escaper, prise, steps_sans_progres, cardio_ratio=1.0,
                degats_significatifs_recus=0):
    """
    Le contrôleur peut décider de casser le clinch lui-même.
    Il lui faut une raison concrète : ce n'est pas un réflexe, c'est un choix tactique.
    Retourne (bool, raison)
    """
    # 1. Son jeu est à distance : le clinch ne l'arrange pas
    if controller.clinch.clinch_wrestling < 45 and controller.clinch.clinch_striking < 60:
        if random.random() < 0.45:
            return True, "veut remettre de la distance"

    # 2. Ça n'avance pas : le clinch coûte de l'énergie pour rien
    if steps_sans_progres >= 3 and random.random() < 0.4:
        return True, "clinch stérile, il rompt"

    # 3. Il fatigue : tenir un clinch est épuisant
    if cardio_ratio < 0.5 and random.random() < 0.35:
        return True, "trop fatigué pour tenir"

    # 4. Il encaisse réellement des coups lourds (pas juste une stat théorique)
    if degats_significatifs_recus >= 12 and random.random() < 0.5:
        return True, "encaisse trop de coups lourds"

    return False, None


# Coups placés sur la séparation : l'adversaire s'attend au clinch, pas au coup.
FRAPPES_RUPTURE = {
    "elbow_sortie":   {"dmg": (7, 16), "cible": "tete",  "poids_score": 1.3, "besoin": 0.20},
    "knee_sortie":    {"dmg": (9, 19), "cible": "tete",  "poids_score": 1.5, "besoin": 0.35},
    "uppercut_sortie":{"dmg": (6, 14), "cible": "tete",  "poids_score": 1.2, "besoin": 0.15},
    "knee_corps_sortie": {"dmg": (6, 12), "cible": "corps", "poids_score": 1.0, "besoin": 0.10},
}


def veut_rompre_offensif(controller, escaper, domination):
    """
    Rupture offensive : casser volontairement pour placer un gros coup sur la séparation.
    Réservé aux frappeurs qui savent créer l'espace - un lutteur pur ne fait pas ça.
    Retourne (bool, frappe_choisie)
    """
    # Il faut du striking en clinch et un minimum de contrôle pour créer l'angle
    if controller.clinch.clinch_striking < 60:
        return False, None

    dispo = [f for f, i in FRAPPES_RUPTURE.items() if domination >= i["besoin"]]
    if not dispo:
        return False, None

    # Plus il est bon frappeur, plus il cherche ce timing
    proba = 0.10 + (controller.clinch.clinch_striking - 60) / 200
    if random.random() < proba:
        return True, random.choice(dispo)
    return False, None


def resolve_frappe_rupture(attacker, defender, frappe, domination):
    """
    Le coup sur la séparation : l'adversaire est pris à contretemps,
    mais l'angle est difficile - haute récompense, réussite moyenne.
    """
    info = FRAPPES_RUPTURE[frappe]
    # Bonus de surprise, malus parce que les deux se séparent
    chance = 40 + (attacker.clinch.clinch_striking - defender.clinch.posture) * 0.6 + domination * 25
    if random.uniform(0, 100) < max(10, min(80, chance)):
        lo, hi = info["dmg"]
        dmg = random.randint(lo, hi)
        return "touché", dmg, info["cible"], True, info["poids_score"]
    return "manqué", 0, None, False, 0.0


def clinch_sequence(f1, f2, dmg1, dmg2, contre_cage=False, micro_actions=4, log=None,
                    cardio1=1.0, cardio2=1.0):
    """
    Une phase de clinch = plusieurs micro-actions enchaînées.
    Le contrôleur peut rompre volontairement (facile, mais il lui faut une raison).
    L'engagé doit forcer sa sortie (dur, mais il peut multiplier les tentatives).
    Retourne (issue, acteur, events)
    """
    prise = "neutre"
    if contest_grip(f1, f2, "over_under"):
        controller, escaper = f1, f2
        d_ctrl, d_esc = dmg1, dmg2
        c_ctrl, c_esc = cardio1, cardio2
    else:
        controller, escaper = f2, f1
        d_ctrl, d_esc = dmg2, dmg1
        c_ctrl, c_esc = cardio2, cardio1
    prise = "over_under"

    events = [f"{controller.name} prend le contrôle du clinch ({prise})"]
    steps_sans_progres = 0
    dmg_sig_ctrl = 0   # dégâts significatifs encaissés par le contrôleur
    stats = {          # pour le scoring du round
        # "cardio" : cout REEL de la sequence, action par action. Les valeurs
        # cout_cardio (SORTIES) et drain_cardio (FRAPPES_CLINCH) etaient
        # declarees dans ce fichier depuis toujours et n'etaient LUES NULLE
        # PART : engine.py facturait un forfait de 2.5 aux deux hommes, quoi
        # qu'il se soit passe. Celui qui lancait quatre genoux et ameliorait
        # sa prise deux fois payait comme celui qui subissait contre la
        # grille. On consomme enfin ces donnees.
        controller.name: {"sig": 0, "usure": 0, "score": 0.0, "cardio": 0.0},
        escaper.name: {"sig": 0, "usure": 0, "score": 0.0, "cardio": 0.0},
    }

    for step in range(micro_actions):
        domination = PRISES[prise]["domination"]
        options = PRISES[prise]["options"]

        # --- Rupture OFFENSIVE : casser pour placer un gros coup sur la séparation ---
        offensif, frappe_rupture = veut_rompre_offensif(controller, escaper, domination)
        if offensif:
            r, d, z, sig, poids = resolve_frappe_rupture(controller, escaper, frappe_rupture, domination)
            if d:
                d_esc.add(z, d)
                stats[controller.name]["sig"] += 1
                stats[controller.name]["score"] += poids
                events.append(f"{controller.name} rompt et place {frappe_rupture} -> {r} ({d}) !")
            else:
                events.append(f"{controller.name} rompt et tente {frappe_rupture} -> {r}")
            return "rupture", controller, events, stats, prise

        # --- Le contrôleur peut choisir de rompre lui-même (défensif/tactique) ---
        rompt, raison = veut_rompre(controller, escaper, prise, steps_sans_progres,
                                    c_ctrl, dmg_sig_ctrl)
        if rompt:
            events.append(f"{controller.name} casse le clinch ({raison})")
            return "rupture", controller, events, stats, prise

        # --- L'engagé force sa sortie (il peut insister autant qu'il veut) ---
        sortie = choisir_sortie(escaper, contre_cage)
        res, bonus = try_exit(escaper, controller, sortie, contre_cage, c_esc)
        # Forcer une sortie coute, qu'elle passe ou non. "impossible" = la
        # tentative n'a pas eu lieu (technique reservee a la cage), donc rien.
        if res != "impossible":
            stats[escaper.name]["cardio"] += SORTIES[sortie]["cout_cardio"]
        events.append(f"{escaper.name} tente {sortie} -> {res}")
        if res == "réussi":
            if bonus == "back_clinch" and random.random() < 0.5:
                events.append(f"  => {escaper.name} passe dans le dos !")
                return "continue", escaper, events, stats, prise
            return "sortie", escaper, events, stats, prise

        # --- L'engagé peut riposter même en infériorité (coups courts) ---
        if random.random() < 0.35:
            f_riposte = choisir_frappe_clinch(escaper, 0.1)
            r, d, z, sig = resolve_clinch_strike(escaper, controller, f_riposte, 0.1)
            # On paie le coup LANCE, pas le coup touche.
            stats[escaper.name]["cardio"] += FRAPPES_CLINCH[f_riposte]["drain_cardio"]
            if d:
                d_ctrl.add(z, d)
                if sig:
                    dmg_sig_ctrl += d
                    stats[escaper.name]["sig"] += 1
                else:
                    stats[escaper.name]["usure"] += 1
                stats[escaper.name]["score"] += FRAPPES_CLINCH[f_riposte]["poids_score"]
                events.append(f"  {escaper.name} riposte {f_riposte} -> {d}"
                              f"{' [SIG]' if sig else ''}")

        # --- Le contrôleur exploite sa prise ---
        action = random.choice(options)
        progres = False

        if action in ("pummel", "sortie"):
            cible = prise_superieure(prise, controller.clinch)
            if cible and contest_grip(controller, escaper, cible):
                prise = cible
                progres = True
                events.append(f"{controller.name} améliore sa prise -> {prise}")
            else:
                events.append(f"{controller.name} pummele sans gain")

        elif action == "frappe":
            f = choisir_frappe_clinch(controller, domination)
            res, dmg, zone, sig = resolve_clinch_strike(controller, escaper, f, domination)
            stats[controller.name]["cardio"] += FRAPPES_CLINCH[f]["drain_cardio"]
            if dmg:
                d_esc.add(zone, dmg)
                if sig:
                    stats[controller.name]["sig"] += 1
                    progres = True
                else:
                    stats[controller.name]["usure"] += 1
                stats[controller.name]["score"] += FRAPPES_CLINCH[f]["poids_score"]
            events.append(f"{controller.name} {f} -> {res} ({dmg})"
                          f"{' [SIG]' if sig else ''}")

        elif action in ("body_lock_attempt", "trip_attempt", "throw_attempt", "mat_return"):
            chance = 30 + domination * 60 + (controller.clinch.clinch_wrestling - escaper.clinch.frame) * 0.8
            if random.uniform(0, 100) < max(5, min(85, chance)):
                events.append(f"{controller.name} {action} -> RÉUSSI, combat au sol")
                return "takedown", controller, events, stats, prise
            events.append(f"{controller.name} {action} -> stoppé")

        elif action == "back_choke_debout":
            # /!\ LE DOS DEBOUT. Rare, et il NE DURE PAS : soit il l'emmene
            # au sol dans le dos, soit l'autre se degage. C'est ce qu'on voit
            # chez Oliveira ou Chimaev — on prend le dos sur les pieds, on
            # serre, et ca finit au sol ou ca casse. Ce n'est pas une phase,
            # c'est une TRANSITION.
            _c = 18 + (controller.clinch.clinch_wrestling
                       - escaper.clinch.frame) * 0.6
            if random.uniform(0, 100) < max(3, min(55, _c)):
                events.append(f"{controller.name} saute dans le dos et serre debout !")
                return "takedown", controller, events, stats, "back_clinch"
            events.append(f"{controller.name} tente le dos debout -> {escaper.name} se dégage")

        elif action == "snap_down":
            if random.uniform(0, 100) < 35 + (controller.clinch.hand_fighting - escaper.clinch.posture):
                events.append(f"{controller.name} snap down -> {escaper.name} cassé en deux")
                if random.random() < 0.4:
                    prise = "back_clinch"
                    progres = True
            else:
                events.append(f"{controller.name} snap down -> résisté")

        steps_sans_progres = 0 if progres else steps_sans_progres + 1

    return "continue", controller, events, stats, prise
