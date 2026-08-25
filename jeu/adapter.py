"""
adapter.py — le raccord entre la FICHE du manager et le MOTEUR de combat.

Deux modeles de donnees coexistent, et c'est voulu :

  - le manager montre ~30 stats lisibles par un joueur (jab, esquive, cardio,
    passage, controle...). C'est ce qu'on affiche, ce qu'on entraine, ce dont
    le coach parle.
  - le moteur en veut ~70 (competence par arme, controle par position, garde,
    posture...). Aucun joueur ne veut regler "half_guard_bottom" a la main.

Ce fichier DERIVE les 70 a partir des 30. Il n'invente rien : chaque stat
moteur est projetee depuis la ou les stats manager qui la gouvernent, avec un
bruit deterministe par combattant pour que deux fiches identiques ne donnent
pas deux clones — mais que la MEME fiche donne toujours le meme combattant.

Regle : le manager est la source de verite. On ne stocke jamais l'objet moteur.
On le reconstruit a chaque combat depuis la fiche.
"""

import hashlib
import random

from engine import (Fighter, DIVISIONS, WrestlingProfile, PhysicalProfile,
                    MentalProfile)
from striking_v2 import StrikingProfileV2
from ground_v2 import GroundProfile
from clinch import ClinchProfile
from stance import ORTHODOX, SOUTHPAW


# --- Correspondance des noms de division -----------------------------------
# Le prototype ecrit "poids mi-lourd", le moteur "poids_mi_lourd".
def cle_division(nom):
    if nom in DIVISIONS:
        return nom
    k = ("poids_" + nom.replace("poids ", "").replace("-", "_")
         .replace("é", "e").replace("è", "e").strip())
    return k if k in DIVISIONS else "poids_leger"


def _alea(fiche):
    """
    Bruit DETERMINISTE : la meme fiche redonne toujours le meme combattant.
    Sans ca, simuler deux fois le meme combat donnerait deux adversaires
    differents, et le joueur ne pourrait rien apprendre de ses defaites.
    """
    graine = hashlib.md5(str(fiche.get("id", fiche.get("nom", ""))).encode()).hexdigest()
    return random.Random(int(graine[:8], 16))


def _b(rng, v, ecart=4):
    return int(max(5, min(99, v + rng.gauss(0, ecart))))


def construire(fiche):
    """
    fiche : dict au format du manager
        {id, nom, division, st{...}, lu{...}, so{...}, ph{...}, me{...}}
    retour : Fighter pret a combattre
    """
    rng = _alea(fiche)
    st, lu, so = fiche["st"], fiche["lu"], fiche["so"]
    ph, me = fiche["ph"], fiche["me"]
    g = lambda d, k, defaut=50: d.get(k, defaut)

    # ---------- FRAPPE ----------
    # Le moteur groupe certaines armes : `poing_corps` couvre les coups au corps,
    # `spinning` tous les coups tournants. Le calf kick suit le low kick.
    low, body, high = g(st, "low_kick"), g(st, "body_kick"), g(st, "high_kick")
    poings = (g(st, "jab") + g(st, "cross") + g(st, "crochet") + g(st, "uppercut")) / 4

    striking = StrikingProfileV2(
        jab=_b(rng, g(st, "jab")),
        cross=_b(rng, g(st, "cross")),
        crochet=_b(rng, g(st, "crochet")),
        uppercut=_b(rng, g(st, "uppercut")),
        overhand=_b(rng, g(st, "overhand")),
        poing_corps=_b(rng, poings * 0.85 + 4),
        low_kick=_b(rng, low),
        body_kick=_b(rng, body),
        high_kick=_b(rng, high),
        teep=_b(rng, body * 0.6 + g(st, "footwork") * 0.4),
        # Les coups tournants : rares, portes par la technique de pied
        spinning=_b(rng, high * 0.7 + g(st, "footwork") * 0.3 - 10, 7),

        power=_b(rng, g(st, "power")),
        ko_power=_b(rng, g(st, "ko_power")),
        # Volume : hors niveau technique, comme le cardio. Approche par
        # l'agressivite et le moteur — un pressing tient une cadence haute.
        volume=_b(rng, 34 + g(me, "agressivite") * 0.32 + g(ph, "cardio") * 0.16, 9),

        esquive_tete=_b(rng, g(st, "esquive")),
        parade=_b(rng, g(st, "esquive") * 0.5 + g(st, "blocage") * 0.5),
        blocage=_b(rng, g(st, "blocage")),
        check=_b(rng, g(st, "check")),
        posture_debout=_b(rng, g(st, "blocage") * 0.5 + g(st, "footwork") * 0.5),
        lecture=_b(rng, g(st, "reflexes") * 0.5 + g(me, "iq") * 0.5),
        footwork=_b(rng, g(st, "footwork")),
        reflexes=_b(rng, g(st, "reflexes")),
        vitesse_mains=_b(rng, g(st, "vit_mains")),
        vitesse_jambes=_b(rng, g(st, "footwork") * 0.6 + g(st, "vit_mains") * 0.4),
        timing=_b(rng, g(st, "reflexes") * 0.5 + g(me, "iq") * 0.5),
        enchainements=_b(rng, poings * 0.6 + g(st, "vit_mains") * 0.4),
        cage_cutting=_b(rng, g(st, "cage")),
    )

    # ---------- SOL ----------
    # Le manager donne 5 familles ; le moteur veut 23 stats de position.
    passage, controle = g(so, "passage"), g(so, "controle")
    sub, sub_def, sweeps = g(so, "sub"), g(so, "sub_def"), g(so, "sweeps")
    dessus = controle * 0.65 + passage * 0.35
    dessous = sweeps * 0.55 + sub_def * 0.45

    ground = GroundProfile(
        passing=_b(rng, passage),
        posture_sol=_b(rng, dessus),
        half_guard_top=_b(rng, dessus),
        side_control_top=_b(rng, dessus),
        mount_top=_b(rng, dessus * 0.9 + passage * 0.1),
        back_top=_b(rng, controle * 0.6 + sub * 0.4),
        closed_guard_bottom=_b(rng, dessous),
        open_guard_bottom=_b(rng, dessous),
        butterfly_bottom=_b(rng, sweeps),
        half_guard_bottom=_b(rng, dessous),
        side_control_bottom=_b(rng, sub_def * 0.7 + sweeps * 0.3),
        mount_bottom=_b(rng, sub_def * 0.7 + sweeps * 0.3),
        back_defense=_b(rng, sub_def),
        turtle_defense=_b(rng, sub_def * 0.6 + g(lu, "sprawl") * 0.4),
        sweeps=_b(rng, sweeps),
        shrimping=_b(rng, dessous),
        explosiveness=_b(rng, g(ph, "cardio") * 0.4 + sweeps * 0.6),
        wall_walking=_b(rng, dessous * 0.6 + g(st, "cage") * 0.4),
        hand_fighting_sol=_b(rng, sub_def * 0.5 + controle * 0.5),
        submission_off_top=_b(rng, sub),
        submission_off_bottom=_b(rng, sub * 0.85 + sweeps * 0.15),
        submission_def=_b(rng, sub_def),
        ground_striking=_b(rng, controle * 0.4 + g(st, "power") * 0.6),
    )

    physical = PhysicalProfile(
        cardio=_b(rng, g(ph, "cardio")),
        chin=_b(rng, g(ph, "menton")),
        recovery=_b(rng, g(ph, "cardio") * 0.7 + g(ph, "menton") * 0.3),
        body_conditioning=_b(rng, g(ph, "cardio") * 0.5 + g(ph, "menton") * 0.5),
        balance_base=_b(rng, g(lu, "sprawl") * 0.5 + g(st, "footwork") * 0.5),
    )

    # Le moteur a CINQ entrees avec CINQ defenses differentes, et l'attaquant
    # choisit celle contre laquelle l'autre est le plus faible. Si la stat
    # "sprawl" du manager ne nourrit pas les cinq, le joueur qui investit en
    # defense de takedown se fait simplement contourner par une autre entree :
    # +40 de sprawl ne faisait tomber la reussite adverse que de 47% a 40%.
    # Une seule stat lisible cote joueur doit couvrir toute la famille.
    dtd = g(lu, "sprawl")
    wrestling = WrestlingProfile(
        shot=_b(rng, g(lu, "shot")),
        clinch_wrestling=_b(rng, g(lu, "clinch")),
        throws=_b(rng, g(lu, "clinch") * 0.7 + g(lu, "shot") * 0.3),
        # Les cinq defenses doivent suivre la stat du joueur de PRES. Mesure :
        # avec des taux de derivation inegaux (0.85 / 0.60 / 0.50), +30 de
        # sprawl ne donnait que +15 sur grip_fighting — et comme l'attaquant
        # choisit l'entree contre laquelle on est le plus faible, il passait
        # systematiquement par la. Resultat : 30 points de defense ne faisaient
        # baisser sa reussite que de 8 points, quand 39 points d'attaque lui en
        # faisaient gagner 20. Le defenseur ne pouvait pas se proteger.
        sprawl=_b(rng, dtd),
        whizzer=_b(rng, dtd * 0.92 + g(lu, "clinch") * 0.08),
        balance=_b(rng, dtd * 0.82 + g(st, "footwork") * 0.18),
        grip_fighting=_b(rng, dtd * 0.80 + g(lu, "clinch") * 0.12
                         + g(me, "discipline") * 0.08),
    )

    clinch_p = ClinchProfile(
        pummeling=_b(rng, g(lu, "clinch")),
        hand_fighting=_b(rng, g(lu, "clinch") * 0.7 + g(me, "iq") * 0.3),
        clinch_wrestling=_b(rng, g(lu, "clinch")),
        frame=_b(rng, g(st, "blocage") * 0.5 + g(lu, "sprawl") * 0.5),
        posture=_b(rng, g(lu, "sprawl") * 0.6 + g(ph, "cardio") * 0.4),
        clinch_striking=_b(rng, poings * 0.5 + g(st, "uppercut") * 0.5),
        footwork_clinch=_b(rng, g(st, "footwork") * 0.6 + g(lu, "sprawl") * 0.4),
        top_control=_b(rng, g(lu, "clinch") * 0.6 + g(st, "cage") * 0.4),
    )

    mental = MentalProfile(
        discipline=_b(rng, g(me, "discipline")),
        fight_iq=_b(rng, g(me, "iq")),
        aggression=_b(rng, g(me, "agressivite")),
    )

    # ---------- Plan de combat ----------
    # Deduit du profil : un homme qui frappe mieux qu'il ne lutte reste debout.
    frappe = (poings + low + body) / 3
    lutte = (g(lu, "shot") + g(lu, "clinch") + controle) / 3
    ecart = (lutte - frappe) / 100
    # Le moteur lit ces valeurs comme des PROBABILITES ABSOLUES par echange
    # (engine.py:598 et :602 : `random.random() < gameplan["wrestling"] * TAUX`),
    # pas comme une repartition normalisee. Les trois composantes etaient
    # calculees independamment, chacune avec son propre clamp, et sommaient
    # jusqu'a 1.26 : 26% d'INTENTIONS EN TROP, toutes versees dans la lutte et
    # le clinch. Consequence mesuree : temps au sol 25.7% contre 20.0%, et
    # soumission a 31% contre les 19.3% reels.
    # Les gameplans de generator.ARCHETYPES, eux, somment a 1.0 a la main —
    # et c'est sur EUX que le calibrage a ete gele. On normalise donc.
    _gp = {
        # Base ramenee de 0.30 a 0.22 : c'est la moyenne des gameplans ecrits a
        # la main dans generator.ARCHETYPES (0.05 brawler -> 0.52 lutteur), et
        # c'est sur eux que le calibrage a ete gele. A 0.30 l'adapter produisait
        # une bande centree sur 0.32 : tout le monde luttait un peu trop.
        "wrestling": max(0.05, min(0.85, 0.22 + ecart * 1.6)),
        # /!\ Cette ligne valait `0.20 + g(lu,"clinch")/400`, donc la stat
        # ABSOLUE : un combattant de niveau 80 sortait a 0.40 d'intention de
        # clinch, un de niveau 45 a 0.31. L'envie de clincher montait avec le
        # NIVEAU et pas avec la specialisation — tout le monde devenait
        # clincheur en progressant. On la rend RELATIVE, comme `ecart` l'est
        # deja pour la lutte, et on la recentre sur 0.17 : c'est la moyenne
        # des gameplans ecrits a la main dans generator.ARCHETYPES (bande
        # 0.12-0.25), et c'est sur eux que le calibrage a ete gele.
        "clinch": max(0.05, min(0.45,
                                0.17 + (g(lu, "clinch") - frappe) / 100 * 1.2)),
        "striking": max(0.15, min(0.90, 0.55 - ecart * 1.2)),
    }
    _somme = sum(_gp.values())
    gameplan = {k: v / _somme for k, v in _gp.items()}

    return Fighter(
        fiche.get("nom", "Sans nom"),
        striking, wrestling, ground, clinch_p, physical, mental,
        gameplan=gameplan,
        garde=SOUTHPAW if rng.random() < 0.22 else ORTHODOX,
        stance_switching=_b(rng, 48, 18),
        division=cle_division(fiche.get("division", "poids_leger")),
    )
