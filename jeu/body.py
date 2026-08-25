"""
MMA Manager - Système de dégâts au corps
Le travail au corps ne tue pas directement : il ouvre la tête, vide le cardio,
et crée un risque croissant d'arrêt net sur le foie.
"""

import random


class BodyState:
    """Suit l'état du corps et ses conséquences en cascade."""

    def __init__(self, base_body_conditioning=50, base_guard=50):
        self.degats_corps = 0          # accumulation générale (côtes, plexus, abdos)
        self.degats_foie = 0           # accumulation ciblée sur le côté du foie
        self.conditioning = base_body_conditioning  # résistance au travail au corps
        self.base_guard = base_guard
        self.coups_corps_encaisses = 0

    # ---------------------------------------------------------
    def encaisser(self, degats, zone_precise="corps"):
        """Encaisse un coup au corps. 'foie' = côté droit du corps adverse."""
        resistance = 1 - (self.conditioning / 250)   # jusqu'à -40% pour un corps blindé
        reel = degats * resistance
        self.degats_corps += reel
        if zone_precise == "foie":
            self.degats_foie += reel
        self.coups_corps_encaisses += 1
        return reel

    # ---------------------------------------------------------
    def chute_de_garde(self):
        """
        Plus le corps souffre, plus les coudes descendent pour protéger les côtes.
        Retourne la perte de garde HAUTE (0 à ~0.55).
        C'est ce qui ouvre le high kick et les coups à la tête.
        """
        return min(0.55, self.degats_corps / 110)

    def garde_effective(self):
        """Valeur de garde réellement disponible pour protéger la tête."""
        return self.base_guard * (1 - self.chute_de_garde())

    def defense_corps_effective(self):
        """Le corps déjà travaillé se défend moins bien lui-même (réflexe qui lâche)."""
        return max(0.35, 1 - self.degats_corps / 160)

    # ---------------------------------------------------------
    def drain_cardio(self):
        """
        Un corps travaillé vide le réservoir : respiration courte, abdos qui lâchent.
        Retourne le multiplicateur de consommation de cardio (1.0 = normal).
        """
        return 1.0 + min(0.75, self.degats_corps / 130)

    def cout_immediat_cardio(self, degats):
        """Un coup au corps coûte du cardio sur le coup, en plus des dégâts."""
        return degats * 0.35 * (1 + self.degats_corps / 200)

    # ---------------------------------------------------------
    def risque_ko_foie(self):
        """
        Risque d'arrêt net sur un coup au foie.
        Faible au début, il grandit à mesure que la zone est travaillée.
        Le foie ne pardonne pas l'accumulation.
        """
        if self.degats_foie < 8:
            return 0.005                      # ~0.5% : le one-shot foie reste possible
        base = 0.005 + (self.degats_foie - 8) / 450
        # Un corps bien conditionné retarde l'échéance
        base *= (1 - self.conditioning / 300)
        return min(0.28, base)

    def risque_ko_corps_general(self):
        """Arrêt sur accumulation générale (plexus, côtes cassées) - plus rare."""
        if self.degats_corps < 45:
            return 0.0
        return min(0.12, (self.degats_corps - 45) / 700)


# =========================================================
#  ARMES AU CORPS
# =========================================================
COUPS_CORPS = {
    "body_kick":   {"dmg": (7, 15), "foie_chance": 0.35, "cardio_mult": 1.4, "poids_score": 1.0},
    "body_hook":   {"dmg": (4, 10), "foie_chance": 0.45, "cardio_mult": 1.0, "poids_score": 0.8},
    "body_straight":{"dmg": (3, 8),  "foie_chance": 0.25, "cardio_mult": 0.8, "poids_score": 0.6},
    "knee_corps":  {"dmg": (6, 13), "foie_chance": 0.20, "cardio_mult": 1.2, "poids_score": 1.0},
    "front_kick":  {"dmg": (3, 8),  "foie_chance": 0.05, "cardio_mult": 0.9, "poids_score": 0.5},
}


def resolve_body_strike(coup, attaquant_skill, body_state, puissance=1.0):
    """
    Résout un coup au corps.
    Retourne (touché, dégâts, zone, cout_cardio, ko)
    """
    info = COUPS_CORPS[coup]
    # Le corps déjà travaillé se protège moins bien
    def_corps = body_state.defense_corps_effective()
    chance = 45 + attaquant_skill * 0.35 - def_corps * 25

    if random.uniform(0, 100) >= max(12, min(88, chance)):
        return False, 0, None, 0, False

    lo, hi = info["dmg"]
    dmg = int(random.randint(lo, hi) * puissance)
    zone = "foie" if random.random() < info["foie_chance"] else "corps"
    reel = body_state.encaisser(dmg, zone)
    cout_cardio = body_state.cout_immediat_cardio(reel) * info["cardio_mult"]

    # --- Risque d'arrêt net ---
    ko = False
    if zone == "foie":
        if random.random() < body_state.risque_ko_foie():
            ko = True
    if not ko and random.random() < body_state.risque_ko_corps_general():
        ko = True

    return True, int(reel), zone, cout_cardio, ko


# =========================================================
#  CONSÉQUENCE SUR LA TÊTE
# =========================================================
def bonus_high_kick(body_state):
    """
    Bonus de réussite pour un coup HAUT contre un adversaire dont
    la garde est descendue à force de manger au corps.
    C'est le classique : body body body -> high kick.
    """
    return body_state.chute_de_garde() * 55   # jusqu'à +30 points de % de réussite


def malus_defense_tete(body_state):
    """Valeur de garde effective à opposer aux coups hauts."""
    return body_state.garde_effective()
