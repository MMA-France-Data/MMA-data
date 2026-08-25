"""
MMA Manager - Système de garde, stabilité et dégâts par jambe
Les calf kicks ciblent la jambe AVANT. Changer de garde la met à l'abri,
mais coûte en efficacité si le combattant n'est pas à l'aise des deux côtés.
"""

import random

ORTHODOX = "orthodox"
SOUTHPAW = "southpaw"


class LegDamage:
    """Dégâts suivis jambe par jambe, pas en bloc."""

    def __init__(self):
        self.gauche = 0
        self.droite = 0

    def add(self, cote, amount):
        setattr(self, cote, getattr(self, cote) + amount)

    def total(self):
        return self.gauche + self.droite

    def get(self, cote):
        return getattr(self, cote)


class StanceState:
    """
    Gère la garde du combattant, quelle jambe est exposée,
    et les pénalités liées au changement de garde.
    """

    def __init__(self, garde_naturelle=ORTHODOX, stance_switching=50):
        self.garde_naturelle = garde_naturelle
        self.garde_actuelle = garde_naturelle
        self.stance_switching = stance_switching  # aisance dans la garde inversée
        self.switches = 0                          # nombre de changements dans le combat

    # --- Quelle jambe est devant selon la garde ---
    def jambe_avant(self):
        return "gauche" if self.garde_actuelle == ORTHODOX else "droite"

    def jambe_arriere(self):
        return "droite" if self.garde_actuelle == ORTHODOX else "gauche"

    def en_garde_inversee(self):
        return self.garde_actuelle != self.garde_naturelle

    def switch(self):
        """Change de garde : la jambe abîmée passe derrière."""
        self.garde_actuelle = SOUTHPAW if self.garde_actuelle == ORTHODOX else ORTHODOX
        self.switches += 1

    # --- Pénalité de garde inversée ---
    def penalite_garde(self):
        """
        0 = aucune pénalité (parfaitement ambidextre)
        Jusqu'à ~0.45 pour un combattant qui ne sait pas switcher.
        """
        if not self.en_garde_inversee():
            return 0.0
        return max(0.0, (100 - self.stance_switching) / 100) * 0.45


# =========================================================
#  STABILITÉ
# =========================================================
def stabilite(stance, leg_dmg, base_balance=50):
    """
    La stabilité dépend surtout de l'état de la jambe AVANT (elle porte l'appui
    et le pivot), et un peu de la jambe arrière (elle donne la propulsion).
    Retourne un facteur entre ~0.25 et 1.0
    """
    dmg_avant = leg_dmg.get(stance.jambe_avant())
    dmg_arriere = leg_dmg.get(stance.jambe_arriere())

    perte = (dmg_avant * 1.0 + dmg_arriere * 0.18) / 78
    perte *= (1.4 - base_balance / 200)   # un bon équilibre encaisse mieux
    return max(0.25, 1.0 - min(0.75, perte))


def facteur_puissance(stance, leg_dmg, base_balance=50):
    """
    La puissance vient du sol : jambes cassées = frappes molles.
    La jambe ARRIÈRE compte plus ici (c'est elle qui pousse dans un cross/low kick).
    """
    dmg_arriere = leg_dmg.get(stance.jambe_arriere())
    dmg_avant = leg_dmg.get(stance.jambe_avant())
    perte = (dmg_arriere * 0.7 + dmg_avant * 0.5) / 88
    base = max(0.4, 1.0 - min(0.6, perte))
    return base * (1 - stance.penalite_garde() * 0.6)


def facteur_esquive(stance, leg_dmg, base_balance=50):
    """Se déplacer demande des jambes valides. Footwork mort = cible fixe."""
    return stabilite(stance, leg_dmg, base_balance) ** 1.2


def facteur_precision(stance):
    """En garde inversée, la précision chute si le combattant n'est pas à l'aise."""
    return 1 - stance.penalite_garde()


# =========================================================
#  DÉCISION DE CHANGER DE GARDE
# =========================================================
def veut_switcher(stance, leg_dmg, fight_iq=50, seuil=25):
    """
    Le combattant décide de switcher pour protéger la jambe avant abîmée.
    Un bon switcher ALTERNE en permanence pour répartir les dégâts :
    c'est tout l'intérêt de savoir combattre des deux côtés.
    """
    dmg_avant = leg_dmg.get(stance.jambe_avant())
    dmg_arriere = leg_dmg.get(stance.jambe_arriere())

    # Rien à protéger encore
    if dmg_avant < seuil:
        return False, None

    # L'écart doit justifier le changement : on ne switche pas pour exposer
    # une jambe dans le même état (voire pire).
    ecart = dmg_avant - dmg_arriere
    if ecart < 8:
        return False, None

    # Bénéfice croissant avec l'écart entre les deux jambes
    benefice = ecart / 60

    # Coût : la pénalité qu'on subira APRÈS le switch
    cout = 0.0 if stance.en_garde_inversee() else (100 - stance.stance_switching) / 100 * 0.45

    proba = 0.20 + fight_iq / 200 + benefice - cout
    # Un combattant qui n'a jamais travaillé la garde inversée reste bloqué :
    # il encaisse plutôt que de se retrouver dans une position où il ne sait rien faire.
    if stance.stance_switching < 40:
        proba *= 0.08
    elif stance.stance_switching < 60:
        proba *= 0.45

    if random.random() < max(0.0, min(0.9, proba)):
        cote = stance.jambe_avant()
        return True, f"jambe {cote} à {dmg_avant} (autre à {dmg_arriere})"
    return False, None


# =========================================================
#  CIBLAGE DES KICKS
# =========================================================
def cible_kick(attaquant_stance, defenseur_stance, type_kick):
    """
    Quelle jambe est touchée.
    Le calf kick et le low kick visent naturellement la jambe avant exposée.
    """
    if type_kick in ("calf_kick", "low_kick"):
        # 80% du temps la jambe avant, parfois l'intérieur de cuisse arrière
        if random.random() < 0.8:
            return defenseur_stance.jambe_avant()
        return defenseur_stance.jambe_arriere()
    return defenseur_stance.jambe_avant()


def resolve_leg_kick(attaquant, defenseur, atk_stance, def_stance,
                     atk_legs, def_legs, type_kick, check_stat, kicking_stat):
    """
    Résout un kick bas avec ciblage de jambe et conséquences sur la stabilité.
    """
    puissance = facteur_puissance(atk_stance, atk_legs)
    precision = facteur_precision(atk_stance)
    esquive_def = facteur_esquive(def_stance, def_legs)

    chance = (45 + (kicking_stat - check_stat) * 0.8) * precision - esquive_def * 10
    if random.uniform(0, 100) < max(8, min(90, chance)):
        cote = cible_kick(atk_stance, def_stance, type_kick)
        dmg = int(random.randint(4, 10) * puissance)
        def_legs.add(cote, dmg)
        return "touché", dmg, cote

    # Check réussi : c'est l'attaquant qui prend
    if random.random() < 0.3:
        cote_atk = atk_stance.jambe_arriere()  # on kicke de la jambe arrière
        recul = random.randint(2, 6)
        atk_legs.add(cote_atk, recul)
        return "checké", recul, f"{cote_atk} (retour)"

    return "évité", 0, None
