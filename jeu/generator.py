"""
MMA Manager - Générateur de combattants
Produit des profils cohérents : un archétype donne une signature de stats,
le niveau global décale l'ensemble, et le bruit individualise chaque combattant.
"""

import random

from engine import (Fighter, StrikingProfile, WrestlingProfile, PhysicalProfile,
                    MentalProfile, DIVISIONS)
from ground_v2 import GroundProfile
from clinch import ClinchProfile
from stance import ORTHODOX, SOUTHPAW


# =========================================================
#  ARCHÉTYPES
# =========================================================
# Chaque valeur est un décalage par rapport au niveau global du combattant.
# +20 = nettement au-dessus de son niveau sur cette qualité, -20 = point faible.
ARCHETYPES = {
    "boxeur_pressure": {
        "desc": "Coupe la cage et frappe lourd à mi-distance",
        "striking": {"jab": 20, "cross": 22, "crochet": 20, "uppercut": 18, "overhand": 12, "poing_corps": 14,
                     "low_kick": -16, "body_kick": -14, "high_kick": -20, "teep": -10, "spinning": -22,
                     "esquive_tete": 14, "parade": 12, "blocage": 4, "check": -14, "posture_debout": 8, "lecture": 2,
                     "vitesse_mains": 16, "vitesse_jambes": -8, "reflexes": 12,
                     "power": 15, "ko_power": 18, "footwork": 2, "cage_cutting": 25,
                     "enchainements": 18, "timing": 10},
        "wrestling": {"shot": -8, "clinch_wrestling": 5, "throws": -12,
                      "sprawl": 8, "whizzer": 5, "balance": 8, "grip_fighting": -5},
        "clinch": {"pummeling": 2, "hand_fighting": 8, "clinch_wrestling": 0,
                   "frame": 5, "posture": 8, "clinch_striking": 18, "footwork_clinch": 0},
        "ground": {"passing": -5, "top_control": 0, "escapes": 0, "sweeps": -10,
                   "submission_off_top": -12, "submission_off_bottom": -18, "submission_def": 5},
        "physical": {"chin": 8, "cardio": -5},
        "mental": {"aggression": 18, "discipline": 5},
        "gameplan": {"striking": 0.75, "wrestling": 0.08, "clinch": 0.17},
    },
    "kickboxeur_distance": {
        "desc": "Garde la distance et démonte les jambes",
        "striking": {"jab": 8, "cross": 4, "crochet": -6, "uppercut": -10, "overhand": -6, "poing_corps": -4,
                     "low_kick": 24, "body_kick": 24, "high_kick": 26, "teep": 22, "spinning": 14,
                     "esquive_tete": 2, "parade": 4, "blocage": 12, "check": 18, "posture_debout": 8, "lecture": 8,
                     "vitesse_mains": -6, "vitesse_jambes": 18, "reflexes": 6,
                     "power": 8, "ko_power": 10, "footwork": 22, "cage_cutting": -18,
                     "enchainements": 4, "timing": 12},
        # /!\ IL NE SAIT PAS SE DEGAGER (arbitrage Mael, 10/08) :
        # "les kickboxeurs sont toujours mauvais pour se degager du
        # clinch, du sol, etc — accentuons ca."
        # C'EST LA BONNE FAILLE, et elle etait a l'ENVERS : il avait
        # sprawl +12, whizzer +8, frame +15, footwork_clinch +15 et
        # escapes +8 — autrement dit il etait EXCELLENT pour ne jamais se
        # faire attraper. D'ou 80 % de victoires contre tout le monde
        # sans avoir la moindre faiblesse exploitable.
        # On ne touche PAS a sa frappe (refus explicite de Mael : Poatan,
        # Doumbe, Adesanya tapent fort). On lui rend sa vraie faille :
        # quand on l'attrape, il ne s'en sort pas.
        "wrestling": {"shot": -12, "clinch_wrestling": -14, "throws": -8,
                      "sprawl": -10, "whizzer": -10, "balance": 5, "grip_fighting": -8},
        "clinch": {"pummeling": -14, "hand_fighting": -8, "clinch_wrestling": -16,
                   "frame": -12, "posture": 4, "clinch_striking": 8, "footwork_clinch": -6},
        "ground": {"passing": -8, "top_control": -5, "escapes": -16, "sweeps": -10,
                   "submission_off_top": -8, "submission_off_bottom": -8, "submission_def": -12},
        "physical": {"cardio": 8},
        "mental": {"fight_iq": 10, "aggression": -8},
        "gameplan": {"striking": 0.82, "wrestling": 0.06, "clinch": 0.12},
    },
    "lutteur_controle": {
        "desc": "Amène au sol et écrase",
        "striking": {"jab": -6, "cross": -10, "crochet": -12, "uppercut": -12, "overhand": -8, "poing_corps": -6,
                     "low_kick": -12, "body_kick": -14, "high_kick": -20, "teep": -8, "spinning": -25,
                     "esquive_tete": -8, "parade": -4, "blocage": 2, "check": -4, "posture_debout": 6, "lecture": 0,
                     "vitesse_mains": -4, "vitesse_jambes": -8, "reflexes": -2,
                     "power": -5, "ko_power": -10, "footwork": -5, "cage_cutting": 12,
                     "enchainements": -8, "timing": 0},
        "wrestling": {"shot": 25, "clinch_wrestling": 20, "throws": 5,
                      "sprawl": 18, "whizzer": 15, "balance": 15, "grip_fighting": 8},
        "clinch": {"pummeling": 20, "hand_fighting": 10, "clinch_wrestling": 22,
                   "frame": 8, "posture": 10, "clinch_striking": -5, "footwork_clinch": -8},
        "ground": {"passing": 15, "top_control": 25, "escapes": 8, "sweeps": -10,
                   "submission_off_top": -5, "submission_off_bottom": -20, "submission_def": 10,
                   "ground_striking": 15},
        "physical": {"cardio": 10, "chin": 5},
        "mental": {"discipline": 12},
        "gameplan": {"striking": 0.30, "wrestling": 0.52, "clinch": 0.18},
    },
    "grappler_soumission": {
        "desc": "Dangereux dès que ça touche le sol, même en dessous",
        "striking": {"jab": -6, "cross": -10, "crochet": -10, "uppercut": -10, "overhand": -8, "poing_corps": -4,
                     "low_kick": -6, "body_kick": -8, "high_kick": -14, "teep": -4, "spinning": -18,
                     "esquive_tete": -5, "parade": -2, "blocage": -4, "check": 0, "posture_debout": -4, "lecture": 4,
                     "vitesse_mains": -4, "vitesse_jambes": -4, "reflexes": 0,
                     "power": -8, "ko_power": -12, "footwork": -5, "cage_cutting": -8,
                     "enchainements": -6, "timing": 4},
        "wrestling": {"shot": 5, "clinch_wrestling": 8, "throws": 18,
                      "sprawl": -5, "whizzer": -8, "balance": 0, "grip_fighting": 20},
        "clinch": {"pummeling": 8, "hand_fighting": 12, "clinch_wrestling": 10,
                   "frame": 5, "posture": -5, "clinch_striking": -8, "footwork_clinch": 0},
        "ground": {"passing": 22, "top_control": 10, "escapes": 20, "sweeps": 25,
                   "submission_off_top": 28, "submission_off_bottom": 30, "submission_def": 22,
                   "ground_striking": -8},
        "physical": {"cardio": 5},
        "mental": {"fight_iq": 8},
        "gameplan": {"striking": 0.35, "wrestling": 0.40, "clinch": 0.25},
    },
    "polyvalent": {
        "desc": "Pas de trou, pas d'arme écrasante",
        "striking": {"jab": 8, "cross": 6, "crochet": 5, "uppercut": 4, "overhand": 2, "poing_corps": 6,
                     "low_kick": 6, "body_kick": 6, "high_kick": 2, "teep": 6, "spinning": -6,
                     "esquive_tete": 6, "parade": 6, "blocage": 6, "check": 6, "posture_debout": 6, "lecture": 8,
                     "vitesse_mains": 4, "vitesse_jambes": 4, "reflexes": 8,
                     "power": 0, "ko_power": 0, "footwork": 5, "cage_cutting": 0,
                     "enchainements": 10, "timing": 12},
        "wrestling": {"shot": 5, "clinch_wrestling": 5, "throws": 0,
                      "sprawl": 8, "whizzer": 5, "balance": 5, "grip_fighting": 5},
        "clinch": {"pummeling": 5, "hand_fighting": 5, "clinch_wrestling": 5,
                   "frame": 5, "posture": 5, "clinch_striking": 5, "footwork_clinch": 5},
        "ground": {"passing": 5, "top_control": 5, "escapes": 8, "sweeps": 5,
                   "submission_off_top": 5, "submission_off_bottom": 0, "submission_def": 8},
        "physical": {"cardio": 8, "chin": 5},
        "mental": {"fight_iq": 12, "discipline": 10},
        "gameplan": {"striking": 0.52, "wrestling": 0.28, "clinch": 0.20},
    },
    "brawler": {
        "desc": "Menton solide, frappe lourde, technique approximative",
        "striking": {"jab": -4, "cross": 12, "crochet": 16, "uppercut": 10, "overhand": 22, "poing_corps": 6,
                     "low_kick": -8, "body_kick": -6, "high_kick": -10, "teep": -14, "spinning": -10,
                     # /!\ IL RENTRE DERRIERE UNE GARDE (arbitrage Mael,
                     # 10/08, option A). MESURE : il touchait 23 % quand
                     # le kickboxeur touchait 67 % — sa puissance ne
                     # servait a rien, il n'avait pas le temps de s'en
                     # servir. Le brawler reel n'est pas facile a toucher
                     # NET : il avance tete rentree, il encaisse sur les
                     # bras et les epaules. On remonte donc le BLOCAGE et
                     # la POSTURE, et on laisse esquive, lecture et
                     # reflexes au fond — il ne verra jamais rien venir,
                     # mais ce qui arrive tape sur sa garde.
                     # /!\ DECOUVERTE EN MESURANT : remonter le BLOCAGE n'a rien change
                     # (12 % -> 6 %). Le blocage ne defend que les COUPS DE PIED,
                     # et les jambes representent 1-2 % des frappes du jeu — il est
                     # donc quasiment MORT. Contre des poings, ce qui compte est
                     # l'esquive et la parade. On remonte donc celles-la, sans les
                     # rendre bonnes : il reste le moins bon defenseur du jeu, il
                     # n'est plus une cible fixe.
                     "esquive_tete": -10, "parade": -4, "blocage": 20, "check": -10, "posture_debout": 10, "lecture": -14,
                     "vitesse_mains": 4, "vitesse_jambes": -6, "reflexes": -12,
                     "power": 38, "ko_power": 48, "footwork": -15, "cage_cutting": 10,
                     "enchainements": -6, "timing": -10},
        "wrestling": {"shot": -5, "clinch_wrestling": 5, "throws": -5,
                      "sprawl": 0, "whizzer": -5, "balance": 5, "grip_fighting": -8},
        "clinch": {"pummeling": 0, "hand_fighting": -5, "clinch_wrestling": 5,
                   "frame": -8, "posture": 0, "clinch_striking": 15, "footwork_clinch": -10},
        # /!\ ET UNE PUISSANCE ENORME (arbitrage Mael, 10/08) :
        # ko_power 32 -> 48, power 31 -> 38. C'est sa seule vraie arme et
        # elle doit faire peur : il perd les echanges, il perd aux
        # points, mais UN coup peut tout arreter. C'est la logique du
        # barrage de route appliquee a un style entier — perdre le combat
        # et le gagner sur une occasion.
        # /!\ IL EST BRUT, PAS IMPUISSANT (10/08, meme logique que pour le
        # kickboxeur mais dans l'autre sens). Un brawler ne sait pas
        # attaquer au sol — et ca reste vrai — mais il n'est pas une
        # victime : il est lourd, il pese, il se debat. On lui laisse ses
        # zeros a l'ATTAQUE au sol et on remonte sa SURVIE (escapes,
        # defense de soumission), sinon toute amenee au sol est une
        # condamnation et il ne peut plus exister face a un lutteur.
        "ground": {"passing": -10, "top_control": 0, "escapes": 4, "sweeps": -4,
                   "submission_off_top": -15, "submission_off_bottom": -20, "submission_def": 2},
        # /!\ COMPENSATION DU BRAWLER (arbitrage Mael, 10/08, option B).
        # MESURE : 20 % de victoires contre 82 % au kickboxeur. Cause
        # trouvee, et elle ne vient PAS de la geometrie : la somme des
        # bonus de FRAPPE vaut -47 pour le brawler contre +204 au
        # kickboxeur — a "niveau egal" ils ne sont pas du meme niveau.
        # Les lutteurs sont negatifs eux aussi (-171, -152) mais
        # COMPENSES en lutte et au sol ; le brawler etait le seul negatif
        # SANS contrepartie.
        # /!\ ON NE RABAISSE PAS LE KICKBOXEUR (refus explicite de Mael :
        # "les kickboxeurs tapent tous fort en realite, Poatan, Doumbe,
        # meme Adesanya a eteint des gens"). On rend au brawler ce qui
        # fait sa dangerosite reelle : il encaisse, il tient, et il frappe
        # comme un camion.
        "physical": {"chin": 30, "cardio": -8, "body_conditioning": 16,
                     "recovery": 10},
        "mental": {"aggression": 25, "discipline": -20, "fight_iq": -12},
        "gameplan": {"striking": 0.80, "wrestling": 0.05, "clinch": 0.15},
    },
}


# =========================================================
#  NOMS FICTIFS
# =========================================================
PRENOMS = ["Aleksei", "Marcus", "Diego", "Kenji", "Rashid", "Tomas", "Ivan", "Bruno",
           "Malik", "Ander", "Nikola", "Caleb", "Rodrigo", "Yuri", "Tariq", "Elias",
           "Dante", "Sacha", "Omar", "Viktor", "Lucas", "Amir", "Joaquin", "Finn"]
NOMS = ["Voreno", "Kastrati", "Alvarenga", "Mbeki", "Duarte", "Halvorsen", "Ferreira",
        "Nakamura", "Okonkwo", "Silvestri", "Braga", "Kovacic", "Adeyemi", "Marchetti",
        "Dossou", "Renaud", "Vasquez", "Petrov", "Larsen", "Toussaint", "Quintero",
        "Bakalov", "Nascimento", "Weller"]
SURNOMS = ["le Marteau", "la Faucille", "l'Ombre", "le Boucher", "la Vipère", "le Chirurgien",
           "l'Enclume", "le Loup", "le Prédateur", "la Tempête", "le Fantôme", "le Cyclone",
           "le Rasoir", "l'Étau", "le Corbeau", "la Machine", None, None, None]


# Tendance de rythme par archetype (le volume est genere hors niveau)
VOLUME_ARCHETYPE = {'boxeur_pressure': 14, 'kickboxeur_distance': 2, 'lutteur_controle': -12, 'grappler_soumission': -10, 'polyvalent': 0, 'brawler': 8}


def _appliquer(base, offsets, bruit=6):
    """Applique les décalages d'archétype + un bruit individuel, borné 5-99."""
    out = {}
    for k, v in offsets.items():
        val = base + v + random.gauss(0, bruit)
        out[k] = int(max(5, min(99, val)))
    return out


def generer_combattant(niveau=None, archetype=None, division=None, nom=None):
    """
    niveau : 25 (débutant amateur) → 90 (élite mondiale)
    archetype : clé de ARCHETYPES, sinon tiré au sort
    """
    niveau = niveau if niveau is not None else random.randint(35, 85)
    archetype = archetype or random.choice(list(ARCHETYPES))
    division = division or random.choice(list(DIVISIONS))
    arc = ARCHETYPES[archetype]

    if nom is None:
        prenom, patro = random.choice(PRENOMS), random.choice(NOMS)
        surnom = random.choice(SURNOMS)
        nom = f'{prenom} "{surnom}" {patro}' if surnom else f"{prenom} {patro}"

    st = _appliquer(niveau, arc["striking"])
    # Le volume ne suit pas le niveau technique (meme traitement que le cardio)
    st["volume"] = int(max(8, min(97, random.gauss(52, 15) + VOLUME_ARCHETYPE.get(archetype, 0))))
    wr = _appliquer(niveau, arc["wrestling"])
    cl = _appliquer(niveau, arc["clinch"])

    # Le sol a beaucoup de stats : "top_control" et "escapes" servent de familles
    # dans les archetypes, on les projette sur les stats reelles de GroundProfile.
    fam_top = arc["ground"].get("top_control", 0)
    fam_pass = arc["ground"].get("passing", 0)
    fam_esc = arc["ground"].get("escapes", 0)
    fam_sweep = arc["ground"].get("sweeps", 0)

    GR_KEYS = ["passing", "posture_sol", "half_guard_top", "side_control_top", "mount_top",
               "back_top", "closed_guard_bottom", "open_guard_bottom", "butterfly_bottom",
               "half_guard_bottom", "side_control_bottom", "mount_bottom", "back_defense",
               "turtle_defense", "sweeps", "shrimping", "explosiveness", "wall_walking",
               "hand_fighting_sol", "submission_off_top", "submission_off_bottom",
               "submission_def", "ground_striking"]

    gr_off = {}
    for k in GR_KEYS:
        if k in arc["ground"]:
            gr_off[k] = arc["ground"][k]
        elif k.endswith("_top") or k == "posture_sol":
            gr_off[k] = fam_top * 0.7 + fam_pass * 0.3
        elif k.endswith("_bottom") or k in ("back_defense", "turtle_defense"):
            gr_off[k] = fam_esc * 0.6 + fam_sweep * 0.4
        elif k in ("shrimping", "wall_walking", "explosiveness", "hand_fighting_sol"):
            gr_off[k] = fam_esc * 0.8
        else:
            gr_off[k] = 0
    gr = _appliquer(niveau, gr_off)

    ph_off = {"cardio": 0, "chin": 0, "recovery": 0, "body_conditioning": 0, "balance_base": 0}
    ph_off.update(arc.get("physical", {}))
    ph = _appliquer(niveau, ph_off)

    me_off = {"discipline": 0, "fight_iq": 0, "aggression": 0}
    me_off.update(arc.get("mental", {}))
    me = _appliquer(niveau, me_off)

    return Fighter(
        nom,
        StrikingProfile(**st),
        WrestlingProfile(**wr),
        GroundProfile(**gr),
        ClinchProfile(**cl),
        PhysicalProfile(**ph),
        MentalProfile(**me),
        gameplan=dict(arc["gameplan"]),
        garde=SOUTHPAW if random.random() < 0.22 else ORTHODOX,
        stance_switching=int(max(5, min(99, random.gauss(48, 20)))),
        division=division,
    ), archetype, niveau


def generer_roster(n, division=None, niveau_min=35, niveau_max=85):
    """Génère une population de combattants pour tester le moteur."""
    roster = []
    for _ in range(n):
        f, arc, niv = generer_combattant(
            niveau=random.randint(niveau_min, niveau_max),
            division=division,
        )
        roster.append({"fighter": f, "archetype": arc, "niveau": niv})
    return roster
