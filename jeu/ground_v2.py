"""
MMA Manager - Système de sol v2
Principe : chaque position est une compétence en soi, offensive ET défensive.
Un combattant peut être médiocre en side control mais mortel depuis sa garde fermée.
"""

import random


# =========================================================
#  CARTE DES POSITIONS
# =========================================================
# 'difficulte_sortie' = malus de base pour celui qui subit
# 'gnp' = accès aux frappes pour le dominant
# 'sub_top' / 'sub_bottom' = accès aux soumissions de chaque côté
POSITIONS = {
    # --- Positions neutres ou de bas rang ---
    "closed_guard": {
        "valeur": 1, "difficulte_sortie": 5, "gnp": 0.30,
        "sub_top": 0.10, "sub_bottom": 0.45,      # la garde fermée est OFFENSIVE pour celui du dessous
        "controle_stat": "posture_sol", "retention_stat": "closed_guard_bottom",
    },
    "open_guard": {
        "valeur": 1, "difficulte_sortie": 3, "gnp": 0.25,
        "sub_top": 0.10, "sub_bottom": 0.35,
        "controle_stat": "passing", "retention_stat": "open_guard_bottom",
    },
    "butterfly_guard": {
        "valeur": 1, "difficulte_sortie": 2, "gnp": 0.20,
        "sub_top": 0.05, "sub_bottom": 0.30,      # surtout un tremplin pour balayer
        "controle_stat": "passing", "retention_stat": "butterfly_bottom",
        "sweep_bonus": 0.35,
    },
    "half_guard": {
        "valeur": 2, "difficulte_sortie": 10, "gnp": 0.50,
        "sub_top": 0.20, "sub_bottom": 0.25,
        "controle_stat": "half_guard_top", "retention_stat": "half_guard_bottom",
    },

    # --- Positions dominantes ---
    "side_control": {
        "valeur": 3, "difficulte_sortie": 22, "gnp": 0.70,
        "sub_top": 0.35, "sub_bottom": 0.05,
        "controle_stat": "side_control_top", "retention_stat": "side_control_bottom",
    },
    "north_south": {
        "valeur": 3, "difficulte_sortie": 24, "gnp": 0.45,
        "sub_top": 0.40, "sub_bottom": 0.03,
        "controle_stat": "side_control_top", "retention_stat": "side_control_bottom",
    },
    "knee_on_belly": {
        "valeur": 3, "difficulte_sortie": 15, "gnp": 0.65,
        "sub_top": 0.25, "sub_bottom": 0.05,
        "controle_stat": "side_control_top", "retention_stat": "side_control_bottom",
        "instable": True,                          # position mobile, plus facile à quitter
    },
    "mount": {
        "valeur": 4, "difficulte_sortie": 35, "gnp": 0.95,
        "sub_top": 0.55, "sub_bottom": 0.02,
        "controle_stat": "mount_top", "retention_stat": "mount_bottom",
    },
    "back_control": {
        "valeur": 5, "difficulte_sortie": 40, "gnp": 0.50,
        "sub_top": 0.80, "sub_bottom": 0.01,
        "controle_stat": "back_top", "retention_stat": "back_defense",
    },
    "crucifix": {
        "valeur": 5, "difficulte_sortie": 45, "gnp": 0.85,   # les deux bras neutralisés
        "sub_top": 0.50, "sub_bottom": 0.00,
        "controle_stat": "back_top", "retention_stat": "back_defense",
    },
    "turtle": {
        "valeur": 2, "difficulte_sortie": 12, "gnp": 0.35,
        "sub_top": 0.30, "sub_bottom": 0.05,
        "controle_stat": "back_top", "retention_stat": "turtle_defense",
    },
}

# Progressions possibles : depuis quelle position on peut aller où
TRANSITIONS = {
    "closed_guard":   ["open_guard", "half_guard"],
    "open_guard":     ["half_guard", "side_control"],
    "butterfly_guard":["half_guard", "side_control"],
    "half_guard":     ["side_control", "mount"],
    "side_control":   ["mount", "north_south", "knee_on_belly", "back_control"],
    "north_south":    ["side_control", "mount"],
    "knee_on_belly":  ["mount", "side_control"],
    "mount":          ["back_control", "crucifix"],
    "back_control":   ["crucifix", "mount"],
    "crucifix":       [],
    "turtle":         ["back_control", "crucifix", "side_control"],
}

# Ce que celui du dessous peut viser (sortie ou renversement)
ECHAPPATOIRES = {
    "closed_guard":   [("sweep", "butterfly_guard"), ("standup", "debout"), ("submission", None)],
    "open_guard":     [("sweep", "side_control"), ("standup", "debout"), ("recompose", "closed_guard")],
    "butterfly_guard":[("sweep", "side_control"), ("standup", "debout")],
    "half_guard":     [("recompose", "closed_guard"), ("underhook_up", "debout"), ("sweep", "side_control")],
    "side_control":   [("recompose", "half_guard"), ("shrimp_out", "open_guard"), ("wall_up", "debout")],
    "north_south":    [("recompose", "half_guard"), ("shrimp_out", "open_guard")],
    "knee_on_belly":  [("shrimp_out", "open_guard"), ("recompose", "half_guard")],
    "mount":          [("upa", "closed_guard"), ("elbow_escape", "half_guard")],
    "back_control":   [("slide_out", "turtle"), ("hand_fight_escape", "half_guard")],
    "crucifix":       [("roll_out", "turtle")],
    "turtle":         [("standup", "debout"), ("recompose", "open_guard")],
}

# Soumissions accessibles, séparées dessus / dessous
SOUMISSIONS_TOP = {
    "closed_guard":   ["guillotine_debout"],
    "open_guard":     ["toe_hold", "heel_hook"],
    "half_guard":     ["kimura", "darce", "brabo"],
    "side_control":   ["kimura", "americana", "darce", "arm_triangle"],
    "north_south":    ["north_south_choke", "kimura"],
    "knee_on_belly":  ["armbar", "baseball_choke"],
    "mount":          ["armbar", "arm_triangle", "ezekiel", "mounted_triangle"],
    "back_control":   ["rear_naked_choke", "armbar", "bow_and_arrow"],
    "crucifix":       ["neck_crank", "armbar"],
    "turtle":         ["anaconda", "darce", "peruvian_necktie"],
}

SOUMISSIONS_BOTTOM = {
    "closed_guard":   ["triangle", "armbar", "omoplata", "guillotine", "kimura"],
    "open_guard":     ["triangle", "omoplata", "heel_hook"],
    "butterfly_guard":["guillotine", "armbar"],
    "half_guard":     ["kimura", "guillotine"],
    "side_control":   [],
    "mount":          [],
    "back_control":   [],
}


# =========================================================
#  PROFIL DE SOL
# =========================================================
class GroundProfile:
    """
    Expertise position par position.
    Chaque position a une compétence propre, dessus ET dessous.
    """

    def __init__(self, **kw):
        # --- Contrôle et progression (dessus) ---
        self.passing = kw.get("passing", 50)                    # passer la garde
        self.posture_sol = kw.get("posture_sol", 50)            # rester droit dans la garde fermée
        self.half_guard_top = kw.get("half_guard_top", 50)
        self.side_control_top = kw.get("side_control_top", 50)
        self.mount_top = kw.get("mount_top", 50)
        self.back_top = kw.get("back_top", 50)

        # --- Défense et jeu de garde (dessous) ---
        self.closed_guard_bottom = kw.get("closed_guard_bottom", 50)
        self.open_guard_bottom = kw.get("open_guard_bottom", 50)
        self.butterfly_bottom = kw.get("butterfly_bottom", 50)
        self.half_guard_bottom = kw.get("half_guard_bottom", 50)
        self.side_control_bottom = kw.get("side_control_bottom", 50)
        self.mount_bottom = kw.get("mount_bottom", 50)
        self.back_defense = kw.get("back_defense", 50)
        self.turtle_defense = kw.get("turtle_defense", 50)

        # --- Techniques d'évasion (appariées, comme les takedowns) ---
        self.sweeps = kw.get("sweeps", 50)          # renverser
        self.shrimping = kw.get("shrimping", 50)    # créer de l'espace, sortir latéralement
        self.explosiveness = kw.get("explosiveness", 50)  # upa, roll, sorties de force
        self.wall_walking = kw.get("wall_walking", 50)    # se relever le long de la cage
        self.hand_fighting_sol = kw.get("hand_fighting_sol", 50)  # défendre le dos, les prises

        # --- Soumissions ---
        self.submission_off_top = kw.get("submission_off_top", 50)
        self.submission_off_bottom = kw.get("submission_off_bottom", 50)  # jeu de garde offensif
        self.submission_def = kw.get("submission_def", 50)

        # --- GnP ---
        self.ground_striking = kw.get("ground_striking", 50)

    def controle(self, position):
        return getattr(self, POSITIONS[position]["controle_stat"], 50)

    def retention(self, position):
        return getattr(self, POSITIONS[position]["retention_stat"], 50)


# --- Techniques d'évasion appariées à une compétence et à une défense ---
# cout_cardio : ce que COUTE la tentative, reussie ou non.
#
# /!\ CES VALEURS SONT CREEES, PAS HERITEES. Contrairement au clinch, qui
# declarait ses couts depuis toujours, le sol n'en avait aucun : engine.py
# facturait un forfait de 1.2 par tick au combattant du dessous, qu'il tente
# un upa a fond ou qu'il reste allonge sans rien faire. Une evasion ratee ne
# coutait donc RIEN — exactement la pathologie du chantier 1 ("une entree
# ratee ne coute rien"), reparee debout et jamais appliquee ici.
# Echelle calee sur celle du clinch (sorties 2 a 4) et graduee par l'effort
# reel : se relever de force coute le plus, le travail technique de hanches
# /!\ REHAUSSES x3 le 08/08 : l'echelle globale ECHELLE_DEPENSE=0.28 avait
# ecrase ces valeurs (upa rate = 1.68 pt reel ; 13.3 tentatives/combat pour
# 18.9 pts au total — se debattre 3 rounds coutait moins qu'un round de
# frappe). Apres x3 : upa rate = 5.0 pts reels. Intention utilisateur :
# "tenter de se relever doit vider".
# le moins. A AJUSTER, c'est le but de les avoir mises dans les donnees.
TECHNIQUES_ESCAPE = {
    # explosif, sortie de force : le plus cher
    "upa":               {"skill": "explosiveness",     "defense": "controle", "cout_cardio": 12},
    "underhook_up":      {"skill": "explosiveness",     "defense": "controle", "cout_cardio": 12},
    "wall_up":           {"skill": "wall_walking",      "defense": "controle", "cout_cardio": 12},
    "standup":           {"skill": "wall_walking",      "defense": "controle", "cout_cardio": 12},
    "roll_out":          {"skill": "explosiveness",     "defense": "controle", "cout_cardio": 9},
    # dynamique mais avec levier
    "sweep":             {"skill": "sweeps",            "defense": "controle", "cout_cardio": 9},
    # technique, jeu de hanches et de mains : le moins cher
    "recompose":         {"skill": "shrimping",         "defense": "controle", "cout_cardio": 6},
    "shrimp_out":        {"skill": "shrimping",         "defense": "controle", "cout_cardio": 6},
    "elbow_escape":      {"skill": "shrimping",         "defense": "controle", "cout_cardio": 6},
    "slide_out":         {"skill": "hand_fighting_sol", "defense": "controle", "cout_cardio": 6},
    "hand_fight_escape": {"skill": "hand_fighting_sol", "defense": "controle", "cout_cardio": 6},
}

# Surcout d'une tentative STOPPEE, calque sur le debout (engine.py:736).
# Sans lui, insister ne se paie pas et le dessous retente jusqu'a la cloche.
SURCOUT_ECHEC_SOL = 1.5

# --- Ce que coute le travail de CELUI DU DESSUS ---------------------------
# Il ne payait RIEN : un forfait de 0.8 par tick, que le passage de garde,
# la rafale de ground and pound et la tentative de soumission soient
# gratuits — pendant que le dessous paie 4 par relevee et 6 quand elle est
# stoppee. Asymetrie qui FAVORISE le dessus et pousse vers le controle et
# les finitions au sol.
# Meme echelle que les evasions, meme principe de surcout : il existe la ou
# l'echec a un cout PHYSIQUE distinct (on a pousse contre une resistance).
COUT_PASSAGE = 2.5        # forcer le passage de garde / ameliorer sa position
COUT_SUB_TOP = 2.0        # serrer une soumission depuis le dessus
COUT_GNP_COUP = 0.35      # PAR COUP LANCE dans la rafale (comme debout :
                          # on paie le coup lance, pas le coup touche)


# =========================================================
#  RÉSOLUTIONS
# =========================================================
def tenter_progression(top, bottom, position):
    """Le dominant tente d'améliorer sa position."""
    cibles = [p for p in TRANSITIONS.get(position, []) if p in POSITIONS]
    if not cibles:
        return None

    off = top.ground.controle(position)
    dfn = bottom.ground.retention(position)
    base = 22 + (off - dfn) * 1.2
    if POSITIONS[position].get("instable"):
        base += 10

    def chance_vers(p):
        # Un saut de plusieurs crans se paie. Prendre le dos depuis le side
        # control n'a pas le meme prix que passer en knee-on-belly : sans ce
        # cout, le dessus grimpait au dos une fois sur cinq et le combattant
        # du dessous se retrouvait dans une position sans sortie debout.
        saut = POSITIONS[p]["valeur"] - POSITIONS[position]["valeur"]
        c = base - max(0, saut) * 11
        # Il reste plus a l'aise la ou il maitrise
        c += (top.ground.controle(p) - 50) * 0.25
        return max(3, min(80, c))

    # Il vise par esperance de gain, pas par competence brute (meme principe
    # que le choix d'arme debout, decision C7)
    # Gain amorti : viser deux crans plus haut ne vaut pas deux fois un cran.
    # Sans amortissement, passer directement en mount depuis la half guard
    # devenait le choix par defaut.
    cible = max(cibles, key=lambda p: chance_vers(p)
                * (1 + 0.35 * max(0, POSITIONS[p]["valeur"] - POSITIONS[position]["valeur"])))
    if random.uniform(0, 100) < chance_vers(cible):
        return cible
    return None


def tenter_evasion(bottom, top, position):
    """
    Celui du dessous tente de sortir.
    La difficulté dépend fortement de la position : sortir d'un crucifix
    est presque impossible, sortir d'une butterfly guard est facile.
    Retourne (technique, position_resultante | None)
    """
    options = ECHAPPATOIRES.get(position, [])
    options = [(t, dest) for t, dest in options if t in TECHNIQUES_ESCAPE]
    if not options:
        return None, None

    # Il choisit selon son INTERET, pas selon sa competence brute.
    # Un combattant mis au sol veut d'abord se relever ; c'est seulement
    # un vrai jeu de garde qui le rend content de rester dessous.
    jeu_de_garde = (bottom.ground.sweeps + bottom.ground.closed_guard_bottom
                    + bottom.ground.open_guard_bottom) / 3
    # Plus son jeu de garde est faible, plus il veut la cage et ses appuis
    envie_debout = 45 - (jeu_de_garde - 50) * 0.55

    def interet(o):
        tech, dest = o
        skill = getattr(bottom.ground, TECHNIQUES_ESCAPE[tech]["skill"], 50)
        if dest == "debout":
            return skill + envie_debout
        if dest is None:          # rester dessous pour chercher la soumission
            return skill - 20
        # Ameliorer sa position vaut quelque chose, mais moins que sortir
        gain = POSITIONS[position]["valeur"] - POSITIONS.get(dest, {"valeur": 2})["valeur"]
        return skill + gain * 6

    technique, destination = max(options, key=interet)

    skill = getattr(bottom.ground, TECHNIQUES_ESCAPE[technique]["skill"], 50)
    controle_adverse = top.ground.controle(position)
    retention_perso = bottom.ground.retention(position)

    difficulte = POSITIONS[position]["difficulte_sortie"]
    # La maîtrise de la position par celui du dessous compte aussi (survie)
    # Base volontairement haute : dans un vrai combat, la plupart des takedowns
    # ne debouchent PAS sur un long controle. Le controle prolonge est produit
    # par l'ecart de competence, pas par la position elle-meme.
    # /!\ BASE ABAISSEE DE 52 A 34 LE 09/08.
    # A 52, deux hommes de MEME niveau se separaient une fois sur deux a
    # chaque echange : personne ne controlait jamais rien. Contre un controle
    # a 99, un homme a 75 au sol sortait encore a 30 % en garde fermee.
    # /!\ BAISSEE EN MEME TEMPS QUE LE TEMPO (T_SOL_BASE 4,5 -> 9) : la
    # relevee se tire PAR ECHANGE, pas par minute. Allonger les echanges
    # seul rendait le sol plus lent ET MOINS PRODUCTIF.
    chance = 34 + (skill - controle_adverse) * 1.1 + (retention_perso - 50) * 0.3 - difficulte * 0.8

    chance = max(2, min(82, chance))
    if random.uniform(0, 100) < chance:
        return technique, destination

    # Reussite partielle : il n'a pas reussi a sortir, mais il a cree de l'espace.
    # Un vrai echange au sol est une CHAINE — on recompose sa garde, on retablit,
    # et c'est de la que vient la sortie. Sans ca, l'evasion est un tout ou rien
    # et le combattant reste colle en side control jusqu'a la cloche.
    replis = [(t, d) for t, d in options
              if d not in (None, "debout")
              and POSITIONS[d]["valeur"] < POSITIONS[position]["valeur"]]
    if replis and random.uniform(0, 100) < chance * 0.75:
        t2, d2 = min(replis, key=lambda o: POSITIONS[o[1]]["valeur"])
        return t2, d2
    return technique, None


def tenter_soumission_top(top, bottom, position):
    """
    Soumission depuis le dessus.

    Le NOMBRE de tentatives etait deja realiste (2 a 5 par combat pour un
    grappler), c'est la CONVERSION qui etait fausse : 2.4-2.7% au lieu des
    10-20% reels pour un specialiste. D'ou 12% de combats finis par
    soumission au lieu de 19.3%. On a longtemps cru que c'etait le temps au
    sol — ce n'etait pas ca du tout.
    """
    subs = SOUMISSIONS_TOP.get(position, [])
    if not subs:
        return None, "aucune ouverture"
    sub = random.choice(subs)
    acces = POSITIONS[position]["sub_top"]
    chance = (6.8 + (top.ground.submission_off_top - bottom.ground.submission_def) * 0.55) * (acces * 1.5)
    if random.uniform(0, 100) < max(0.3, min(30, chance)):
        return sub, "SOUMISSION"
    return sub, "défendue"


def tenter_soumission_bottom(bottom, top, position):
    """
    Soumission depuis le DESSOUS - le jeu de garde offensif.
    C'est ce qui rend une garde fermée dangereuse malgré la position inférieure.
    """
    subs = SOUMISSIONS_BOTTOM.get(position, [])
    if not subs:
        return None, "aucune ouverture"
    sub = random.choice(subs)
    acces = POSITIONS[position]["sub_bottom"]
    chance = (6.8 + (bottom.ground.submission_off_bottom - top.ground.submission_def) * 0.55) * (acces * 1.5)
    if random.uniform(0, 100) < max(0.3, min(30, chance)):
        return sub, "SOUMISSION"
    return sub, "défendue"


def resolve_gnp(top, bottom, position):
    """Ground and pound, modulé par l'accès qu'offre la position."""
    acces = POSITIONS[position]["gnp"]
    if acces < 0.15:
        return "pas d'angle", 0
    chance = (40 + (top.ground.ground_striking - bottom.ground.retention(position)) * 0.6) * (0.5 + acces)
    if random.uniform(0, 100) < max(10, min(90, chance)):
        base = 1 + int(acces * 3)
        return "touché", random.randint(base, base + 3)
    return "bloqué", 0
