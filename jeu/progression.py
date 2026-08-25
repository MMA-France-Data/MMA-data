# =========================================================================
# BROUILLON ANTERIEUR AU 09/08 — NE PAS REPRENDRE TEL QUEL
#
# Ce fichier vient du dossier Projet, pas de la chaine de travail. Il date
# d'avant la conception du systeme de progression consignee au carnet
# (NOTES_A_TRAITER.md, sections "MODELE D'ENTRAINEMENT", "MONTEE DE STATS",
# "MODELE COACH"). Il la CONTREDIT sur trois points au moins :
#   - potentiel = loi normale unique, ~3% elite  ->  remplace par le DOUBLE
#     PLAFOND (talent cache x plafond d'environnement) et par le SOMMET
#     RELATIF (la distribution decide de la QUALITE des epoques, pas de la
#     taille du sommet).
#   - aucune loi d'environnement (coach / partenaires / materiel).
#   - ni erosion, ni memoire musculaire, ni blessures.
# Il est aussi en PYTHON, qui est le TEMOIN HISTORIQUE GELE depuis la
# bascule du 08/08 : toute evolution du jeu se fait en JS.
#
# CONSERVE POUR SON RAISONNEMENT, PAS COMME BASE DE CODE :
#   - le budget de carriere en semaines (52 - camps - recuperation - repos
#     = ~24 semaines de developpement par an) ;
#   - le decoupage des stats en familles qui ne vieillissent pas pareil.
# Ces deux idees sont a reprendre dans progression.js ; le reste est perime.
# =========================================================================

"""
MMA Manager - Progression et vieillissement des combattants

Budget réel d'une carrière (16 → 34 ans) :
  52 semaines/an − 18 de camp − 6 de récupération post-combat − 4 de vacances
  = 24 semaines de développement effectif par an, soit 432 sur la carrière.

Le potentiel est caché et suit une loi normale : seuls ~3% des combattants
atteignent le niveau ceinture. La plupart plafonnent bien avant.
"""

import random


# =========================================================
#  PARAMÈTRES DE CARRIÈRE
# =========================================================
AGE_DEBUT = 16
AGE_FIN_MOYEN = 34
SEMAINES_DEV_PAR_AN = 24

SEUIL_ELITE = 83          # niveau global considéré comme "ceinture"
POTENTIEL_MOYENNE = 66
POTENTIEL_ECART = 13      # calibré pour ~3% au-dessus du seuil élite


# --- Familles de stats : elles ne vieillissent pas de la même façon ---
STATS_PHYSIQUES = {
    "power", "ko_power", "footwork", "explosiveness", "cardio", "chin",
    "recovery", "balance_base", "shot", "scrambling", "wall_walking",
}
STATS_TECHNIQUES = {
    "boxing", "kicking", "head_movement", "check_kicks", "guard", "cage_cutting",
    "body_attack", "sprawl", "whizzer", "balance", "grip_fighting", "throws",
    "clinch_wrestling", "pummeling", "hand_fighting", "frame", "posture",
    "clinch_striking", "footwork_clinch", "passing", "posture_sol",
    "half_guard_top", "side_control_top", "mount_top", "back_top",
    "closed_guard_bottom", "open_guard_bottom", "butterfly_bottom",
    "half_guard_bottom", "side_control_bottom", "mount_bottom", "back_defense",
    "turtle_defense", "sweeps", "shrimping", "hand_fighting_sol",
    "submission_off_top", "submission_off_bottom", "submission_def",
    "ground_striking", "body_conditioning",
}
STATS_MENTALES = {"discipline", "fight_iq", "aggression"}


# =========================================================
#  COURBES D'ÂGE
# =========================================================
def facteur_apprentissage(age):
    """
    Vitesse d'assimilation. Très élevée chez le jeune, s'effondre après 30 ans.
    Un vétéran peut encore apprendre, mais lentement.
    """
    if age <= 20:
        return 1.35
    if age <= 24:
        return 1.15
    if age <= 27:
        return 0.95
    if age <= 30:
        return 0.72
    if age <= 33:
        return 0.48
    if age <= 36:
        return 0.30
    return 0.18


def facteur_declin_physique(age):
    """
    Perte physique annuelle (en points de stat).
    Commence discrètement vers 30, s'accélère nettement après 34.
    """
    if age < 30:
        return 0.0
    if age < 33:
        return 0.35
    if age < 35:
        return 0.8
    if age < 37:
        return 1.5
    if age < 39:
        return 2.4
    return 3.5


def usure_accumulee(km_carriere):
    """
    Les combats usent. `km_carriere` agrège les rounds disputés et les dégâts encaissés.
    Un combattant qui a pris cher vieillit plus vite qu'un autre du même âge.
    """
    return min(1.6, km_carriere / 320)


# =========================================================
#  POTENTIEL
# =========================================================
def tirer_potentiel(talent_visible=None):
    """
    Potentiel caché : le plafond que le combattant peut atteindre.
    ~3% dépassent le seuil élite.
    """
    p = random.gauss(POTENTIEL_MOYENNE, POTENTIEL_ECART)
    return int(max(30, min(99, p)))


def potentiel_percu(potentiel_reel, qualite_scouting=50):
    """
    Ce que le coach CROIT voir. Un mauvais scouting se trompe lourdement.
    C'est ce qui rend le recrutement intéressant : on parie, on ne sait pas.
    """
    erreur = random.gauss(0, max(2, 22 - qualite_scouting / 6))
    return int(max(30, min(99, potentiel_reel + erreur)))


# =========================================================
#  PROGRESSION HEBDOMADAIRE
# =========================================================
def gain_hebdomadaire(niveau_actuel, potentiel, age, qualite_coach=50,
                      equipement=50, etat_mental=1.0, focus=1.0):
    """
    Gain de points sur une stat pour une semaine de travail.

    - Les rendements décroissent fortement à l'approche du potentiel
    - L'âge module la vitesse d'assimilation
    - Le coach et le matériel plafonnent la progression
    - L'état mental (motivation, burnout) multiplie ou annule tout
    - `focus` : concentration du planning sur cette qualité (1.0 = normal)
    """
    marge = potentiel - niveau_actuel
    if marge <= 0:
        return 0.0

    # Rendements décroissants : les 10 derniers points coûtent très cher
    proximite = min(1.0, marge / 26)
    base = 0.245 * (proximite ** 1.22)

    # Le coach ne peut pas emmener plus haut que son propre niveau
    plafond_coach = 1.0 if qualite_coach >= niveau_actuel else max(0.15, qualite_coach / max(1, niveau_actuel))
    facteur_coach = (0.55 + qualite_coach / 110) * plafond_coach
    facteur_equip = 0.75 + equipement / 200

    gain = (base * facteur_apprentissage(age) * facteur_coach
            * facteur_equip * etat_mental * focus)
    return max(0.0, gain)


# =========================================================
#  CARRIÈRE
# =========================================================
class CarriereCombattant:
    """Suit un combattant sur toute sa carrière."""

    def __init__(self, niveau_depart, age=16, potentiel=None):
        self.age = age
        self.niveau = float(niveau_depart)
        self.potentiel = potentiel if potentiel is not None else tirer_potentiel()
        self.pic_niveau = self.niveau
        self.age_pic = age
        self.km = 0.0            # usure accumulée
        self.combats = 0
        self.historique = []

    def annee(self, qualite_coach=50, equipement=50, etat_mental=1.0,
              nb_combats=3, semaines_dev=None):
        """Simule une année complète."""
        sem = semaines_dev if semaines_dev is not None else SEMAINES_DEV_PAR_AN
        # Plus il combat, moins il a de temps pour progresser
        sem = max(8, sem - (nb_combats - 3) * 6)

        for _ in range(sem):
            self.niveau += gain_hebdomadaire(
                self.niveau, self.potentiel, self.age,
                qualite_coach, equipement, etat_mental
            )

        # Déclin physique et usure
        perte = facteur_declin_physique(self.age) + usure_accumulee(self.km)
        self.niveau = max(20.0, self.niveau - perte)

        # Usure des combats de l'année
        self.km += nb_combats * random.uniform(6, 14)
        self.combats += nb_combats

        if self.niveau > self.pic_niveau:
            self.pic_niveau = self.niveau
            self.age_pic = self.age

        self.historique.append((self.age, round(self.niveau, 1)))
        self.age += 1
        return self.niveau

    def carriere_complete(self, qualite_coach=50, equipement=50,
                          age_retraite=None, etat_mental_moyen=1.0):
        """Déroule toute la carrière jusqu'à la retraite."""
        fin = age_retraite or int(random.gauss(AGE_FIN_MOYEN, 3))
        while self.age < fin:
            # L'état mental fluctue d'une année sur l'autre
            em = max(0.35, min(1.35, random.gauss(etat_mental_moyen, 0.18)))
            nb = random.choice([2, 3, 3, 3, 4])
            self.annee(qualite_coach, equipement, em, nb)
        return self
