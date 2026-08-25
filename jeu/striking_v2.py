"""
MMA Manager - Striking décomposé par arme
Même logique que les takedowns : chaque coup est une compétence propre,
contrée par une défense spécifique. La vitesse conditionne qui touche en premier.
"""

import random


# =========================================================
#  ARSENAL : chaque arme a sa compétence et sa défense appariée
# =========================================================
ARMES = {
    # --- Poings ---
    "jab": { "facilite": 13,
        "skill": "jab", "defense": "parade", "zone": "tete",
        "dmg": (1.1, 2.5), "concussif": 0.78, "portee": "longue", "cout": 0.11, "vitesse": 1.35,
        "setup": True,          # prépare les coups suivants
    },
    "cross": { "facilite": 14,
        "skill": "cross", "defense": "esquive_tete", "zone": "tete",
        "dmg": (2.5, 5.0), "concussif": 1.38, "portee": "moyenne", "cout": 0.3, "vitesse": 1.05,
    },
    "crochet": { "facilite": 1,
        "skill": "crochet", "defense": "esquive_tete", "zone": "tete",
        "dmg": (2.6, 5.4), "concussif": 1.35, "portee": "courte", "cout": 0.38, "vitesse": 0.90,
    },
    "uppercut": { "facilite": 9,
        "skill": "uppercut", "defense": "posture_debout", "zone": "tete",
        "dmg": (2.5, 5.0), "concussif": 1.45, "portee": "courte", "cout": 0.38, "vitesse": 0.95,
    },
    "overhand": { "facilite": 12,
        "skill": "overhand", "defense": "esquive_tete", "zone": "tete",
        "dmg": (3.2, 6.5), "concussif": 1.20, "portee": "moyenne", "cout": 0.49, "vitesse": 0.72,
        "telegraphe": True,     # visible, punissable si raté
    },
    "crochet_corps": { "facilite": 16,
        "skill": "poing_corps", "defense": "blocage", "zone": "corps",
        "dmg": (1.5, 3.6), "concussif": 0.0, "portee": "courte", "cout": 0.34, "vitesse": 0.95,
    },

    # --- Jambes ---
    "low_kick": { "facilite": 74,
        "skill": "low_kick", "defense": "check", "zone": "jambe",
        "dmg": (1.2, 2.9), "concussif": 0.0, "portee": "longue", "cout": 0.3, "vitesse": 1.00,
    },
    "calf_kick": { "facilite": 71,
        "skill": "low_kick", "defense": "check", "zone": "jambe",
        "dmg": (2.0, 4.2), "concussif": 0.0, "portee": "longue", "cout": 0.3, "vitesse": 1.10,
    },
    "body_kick": { "facilite": 60,
        "skill": "body_kick", "defense": "blocage", "zone": "corps",
        "dmg": (2.5, 5.4), "concussif": 0.0, "portee": "longue", "cout": 0.53, "vitesse": 0.85,
    },
    "high_kick": { "facilite": 5,
        "skill": "high_kick", "defense": "blocage", "zone": "tete",
        "dmg": (4.0, 7.9), "concussif": 1.15, "portee": "longue", "cout": 0.68, "vitesse": 0.70,
        "telegraphe": True,
    },
    "teep": { "facilite": 72,
        "skill": "teep", "defense": "posture_debout", "zone": "corps",
        "dmg": (0.7, 2.2), "concussif": 0.0, "portee": "longue", "cout": 0.23, "vitesse": 1.20,
        "repousse": True,       # casse la pression, recrée la distance
    },

    # --- Coups tournants ---
    "spinning_back_fist": { "facilite": -4,
        "skill": "spinning", "defense": "lecture", "zone": "tete",
        "dmg": (2.9, 6.1), "concussif": 1.25, "portee": "moyenne", "cout": 0.53, "vitesse": 0.65,
        "telegraphe": True,
    },
    "spinning_kick": { "facilite": -6,
        "skill": "spinning", "defense": "lecture", "zone": "corps",
        "dmg": (3.6, 7.2), "concussif": 0.0, "portee": "longue", "cout": 0.72, "vitesse": 0.60,
        "telegraphe": True,
    },
    "wheel_kick": { "facilite": -6,
        "skill": "spinning", "defense": "lecture", "zone": "tete",
        "dmg": (5.0, 9.4), "concussif": 1.30, "portee": "longue", "cout": 0.84, "vitesse": 0.50,
        "telegraphe": True,
    },
}


# =========================================================
#  PROFIL DE FRAPPE
# =========================================================
class StrikingProfileV2:
    def __init__(self, **kw):
        # --- Compétences offensives par arme ---
        self.jab = kw.get("jab", 50)
        self.cross = kw.get("cross", 50)
        self.crochet = kw.get("crochet", 50)
        self.poing_corps = kw.get("poing_corps", 50)
        self.uppercut = kw.get("uppercut", 50)
        self.overhand = kw.get("overhand", 50)
        self.low_kick = kw.get("low_kick", 50)
        self.body_kick = kw.get("body_kick", 50)
        self.high_kick = kw.get("high_kick", 50)
        self.teep = kw.get("teep", 50)
        self.spinning = kw.get("spinning", 50)

        # --- Défenses appariées ---
        self.esquive_tete = kw.get("esquive_tete", 50)       # slips, rolls : contre les directs
        self.parade = kw.get("parade", 50)                    # mains : contre le jab
        self.blocage = kw.get("blocage", 50)                  # garde haute/coudes : contre kicks
        self.check = kw.get("check", 50)                       # tibia : contre les low kicks
        self.posture_debout = kw.get("posture_debout", 50)    # tenue : contre uppercut et teep
        self.lecture = kw.get("lecture", 50)                   # anticipation : contre les tournants

        # --- Vitesse ---
        self.vitesse_mains = kw.get("vitesse_mains", 50)      # rapidité d'exécution des poings
        self.vitesse_jambes = kw.get("vitesse_jambes", 50)    # rapidité des kicks
        self.reflexes = kw.get("reflexes", 50)                 # vitesse de réaction défensive

        # --- Qualités générales ---
        self.power = kw.get("power", 50)
        self.ko_power = kw.get("ko_power", 50)
        self.footwork = kw.get("footwork", 50)
        self.cage_cutting = kw.get("cage_cutting", 50)
        self.enchainements = kw.get("enchainements", 50)      # aptitude aux combinaisons
        # Volume : le RYTHME auquel il lache ses coups, pas leur qualite.
        # Independant du niveau technique, comme le cardio : un debutant peut
        # etre un mitrailleur, un champion peut etre un sniper econome.
        # C'est une TENDANCE, pas une garantie : un combattant colle contre la
        # grille tout le combat finira avec peu de frappes malgre un volume eleve.
        self.volume = kw.get("volume", 50)
        self.timing = kw.get("timing", 50)                     # placer au bon moment, contrer

    def competence(self, arme):
        return getattr(self, ARMES[arme]["skill"], 50)

    def vitesse_arme(self, arme):
        """Les poings et les jambes n'ont pas la même vitesse de base."""
        if ARMES[arme]["skill"] in ("jab", "cross", "crochet", "uppercut", "overhand", "poing_corps"):
            return self.vitesse_mains
        if ARMES[arme]["skill"] == "spinning":
            return (self.vitesse_mains + self.vitesse_jambes) / 2
        return self.vitesse_jambes


# =========================================================
#  RÉSOLUTION D'UNE FRAPPE
# =========================================================
# A quel point la CIBLE peut se derober : la tete bouge, le corps beaucoup
# moins, la jambe d'appui presque pas.
ESQUIVABILITE = {"tete": 1.0, "corps": 0.55, "jambe": 0.25}

# "facilite" (dans ARMES) : correctif par arme, cale sur les taux de reussite
# reels UFC. Les coups de jambe portent les plus gros bonus pour une raison
# precise : leur defense (le check) n'EMPECHE PAS le contact, elle le retourne
# contre le frappeur — et c'est deja modelise a part, plus bas. Les compter
# comme des coups manques faisait tomber le low kick a 30% de reussite
# contre 78% en realite.


def resolve_frappe(atk, dfn, arme, acculé_dfn=False,
                   penalite_atk=1.0, penalite_dfn=1.0,
                   bonus_setup=0.0):
    """
    Résout une frappe.
      penalite_* : multiplicateurs externes (fatigue, jambes abîmées, garde inversée)
      bonus_setup : bonus si un jab ou une feinte vient d'ouvrir la voie

    Retourne (résultat, dégâts, zone, contre_possible)
    """
    info = ARMES[arme]
    skill = atk.striking.competence(arme)
    defense = getattr(dfn.striking, info["defense"], 50)

    # --- Vitesse : toucher avant que l'autre ne réagisse ---
    v_atk = atk.striking.vitesse_arme(arme) * info["vitesse"]
    v_dfn = dfn.striking.reflexes * penalite_dfn
    avantage_vitesse = (v_atk * penalite_atk - v_dfn) * 0.40

    # --- Le footwork protège, sauf dos à la cage ---
    if acculé_dfn:
        evasion = 0
        defense *= 0.75
    else:
        fw = dfn.striking.footwork * penalite_dfn
        evasion = fw * (0.40 if info["portee"] in ("courte", "moyenne") else 0.12)
        # Toutes les cibles ne se derobent pas pareil. On esquive une tete,
        # on ne fait pas manquer une cuisse : un low kick se CHECKE (deja
        # modelise plus bas), il ne se rate pas. Sans cette distinction, toutes
        # les armes sortaient a la meme precision (22-32%) et le low kick
        # touchait 30% du temps contre 78% en realite.
        evasion *= ESQUIVABILITE.get(info["zone"], 1.0)

    chance = (24 + (skill - defense) * 0.75 + avantage_vitesse
              + bonus_setup - evasion * 0.45 + info.get("facilite", 0))
    chance *= penalite_atk
    # /!\ PLANCHER RELEVE DE 4 A 12 % (Mael, 10/08 : "7 frappes sur 167,
    # c'est abuse"). A 4 %, un homme oppose a une tres bonne defense
    # tombait sur le plancher a CHAQUE coup : 0 touche sur 69 jabs.
    # /!\ MODIFIE DANS LES DEUX MOTEURS : striking_v2 est un module
    # FEUILLE, encore compare ligne a ligne au Python (c'est l'ancrage
    # qui reste apres l'abandon du portage cote engine). Changer un seul
    # cote fait tomber le banc — et c'est exactement son travail.
    chance = max(12, min(93, chance))

    if random.uniform(0, 100) < chance:
        lo, hi = info["dmg"]
        # Qualite d'execution : en dessous de 70 de competence, le coup est mal place
        qualite = 0.45 + skill / 130          # 0.83 a 50, 0.99 a 70, 1.21 a 99
        # La PUISSANCE doit peser lourd dans les degats. A (0.7 + power/150),
        # un frappeur a 90 de puissance ne faisait que 1.26x les degats d'un
        # frappeur a 50 : ce sont la competence et la qualite d'execution qui
        # decidaient de tout, et un profil "lourd mais brouillon" — le lutteur
        # aux grosses jambes qui touche rarement mais fort — devenait
        # inexprimable. Ecart porte a ~1.8x.
        dmg = random.uniform(lo, hi) * (0.45 + atk.striking.power / 95) * qualite

        concussif = info.get("concussif", 1.0)
        if concussif > 0:
            concussif *= 0.85 + atk.striking.vitesse_arme(arme) / 330
            # Un coup mal maitrise ne trouve pas le menton, meme s'il touche
            concussif *= qualite ** 2.2
        return "touché", dmg, info["zone"], False, concussif

    # --- Raté : un coup télégraphié expose au contre ---
    contre = False
    if info.get("telegraphe"):
        risque = 0.18 + (dfn.striking.timing - atk.striking.timing) / 320
        contre = random.random() < max(0.03, min(0.40, risque))

    # --- Un low kick checké blesse celui qui l'envoie ---
    if info["defense"] == "check" and random.random() < 0.30:
        return "checké", random.randint(2, 6), "jambe_attaquant", False, 0.0

    return "manqué", 0, None, contre, 0.0


def choisir_arme(atk, dfn, acculé_dfn, garde_basse=0.0, dernier_coup=None, cible=None):
    """
    Choix d'arme selon le profil, la situation et ce qui vient d'être placé.
    Un combattant privilégie naturellement ses meilleures armes.
    """
    dispo = list(ARMES)

    # Filtrage par distance
    if acculé_dfn:
        # Dos a la cage on boxe court, mais un low kick reste tout a fait possible
        dispo = [a for a in dispo if ARMES[a]["portee"] in ("courte", "moyenne")
                 or ARMES[a]["skill"] in ("low_kick",)]
    else:
        dispo = [a for a in dispo if ARMES[a]["portee"] in ("longue", "moyenne")]

    poids = []
    for a in dispo:
        skill = atk.striking.competence(a)
        info = ARMES[a]
        # Probabilite approximative de toucher, vue par le combattant
        defense = getattr(dfn.striking, info["defense"], 50)
        p_touche = max(0.05, min(0.90, (44 + (skill - defense) * 0.75) / 100))
        # Un bon fight IQ privilegie ce qui passe vraiment
        w = max(0.15, (skill - 40) ** 1.5 if skill > 40 else 0.15)
        w *= p_touche ** (0.8 + atk.striking.timing / 200)
        # Les coups tournants restent rares même chez les spécialistes
        if ARMES[a]["skill"] == "spinning":
            w *= 0.22
        # Un adversaire dont la garde est descendue appelle les coups hauts
        if garde_basse > 0.25 and ARMES[a]["zone"] == "tete":
            w *= 1.6
        # Enchaînement naturel derrière un jab
        # Consigne de ciblage donnee par le coach : jambes / corps / tete
        if cible:
            zone = info["zone"]
            if cible == "jambes":
                w *= 3.4 if zone == "jambe" else (0.5 if zone == "tete" else 0.8)
            elif cible == "corps":
                w *= 3.2 if zone == "corps" else (0.55 if zone == "tete" else 0.8)
            elif cible == "tete":
                w *= 2.2 if zone == "tete" else 0.55

        if dernier_coup == "jab" and a in ("cross", "overhand", "low_kick"):
            w *= 1.5 + atk.striking.enchainements / 120
        poids.append(w)

    return random.choices(dispo, weights=poids, k=1)[0]
