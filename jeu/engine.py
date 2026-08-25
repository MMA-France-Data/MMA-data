"""
MMA Manager - Moteur de combat unifié
Fusionne striking debout, clinch, sol, gestion de garde, dégâts localisés et cardio.
Un combat passe naturellement d'une phase à l'autre, et tout communique :
les jambes abîmées ferment les entrées en lutte, le corps travaillé ouvre la tête
et vide le réservoir, la fatigue dégrade tout.
"""

import random

from stance import (StanceState, LegDamage, ORTHODOX, SOUTHPAW,
                    stabilite, facteur_puissance, facteur_esquive, facteur_precision,
                    veut_switcher)
from body import BodyState, COUPS_CORPS, resolve_body_strike, bonus_high_kick
from striking_v2 import (StrikingProfileV2, ARMES as ARMES_V2,
                         resolve_frappe, choisir_arme as choisir_arme_v2)
from clinch import ClinchProfile, clinch_sequence
from ground_v2 import (GroundProfile, POSITIONS, TRANSITIONS,
                       tenter_progression, tenter_evasion,
                       tenter_soumission_top, tenter_soumission_bottom, resolve_gnp,
                       TECHNIQUES_ESCAPE, SURCOUT_ECHEC_SOL,
                       COUT_PASSAGE, COUT_SUB_TOP, COUT_GNP_COUP)


# =========================================================
#  PHASES DE COMBAT
# =========================================================
DEBOUT = "debout"
CLINCH = "clinch"
SOL = "sol"

CENTRE = "centre"
CAGE = "cage"



# =========================================================
#  CATEGORIES DE POIDS
# =========================================================
# Calibre sur les taux reels UFC : le KO monte quasi lineairement avec le poids,
# les soumissions culminent dans les categories intermediaires.
DIVISIONS = {
    # TROIS leviers physiques distincts, jamais melanges :
    #
    # volume_mod : le RYTHME. Cale sur les vraies donnees UFC (HonestElo/UFCStats,
    #              lues au meme centile dans chaque division). Constat : le volume
    #              par minute est quasi PLAT, 1,19x d'ecart seulement — et pas
    #              monotone. L'ancien 1,20 -> 0,76 (1,58x) etait bien trop etale.
    #
    # dmg_mod    : l'ENERGIE transmise par coup. Plage volontairement etroite
    #              (decision C9) : les degats se cumulent, l'effet sur le KO est
    #              fortement non lineaire, une plage large donnait 78% chez les lourds.
    #
    # resist_mod : la RESISTANCE A L'ACCUMULATION — combien de coups encaisses
    #              avant l'arret. C'est le levier manquant. volume x dmg_mod se
    #              neutralisaient (paille 1,014 contre lourd 0,874) : des que le
    #              volume est devenu realiste, l'accumulation a pris le dessus et
    #              le gradient de KO s'est INVERSE. Le seuil de commotion humain
    #              ne diminue pas avec le poids, mais l'energie par coup, si :
    #              il faut bien plus de coups pour arreter une paille qu'un lourd.
    "poids_paille":     {"kg": 52.2,  "dmg_mod": 0.845, "volume_mod": 1.21, "resist_mod": 2.95, "usure_mod": 0.22, "feminin": True},
    "poids_mouche":     {"kg": 56.7,  "dmg_mod": 0.900, "volume_mod": 1.20, "resist_mod": 2.62, "usure_mod": 0.25},
    "poids_coq":        {"kg": 61.2,  "dmg_mod": 0.925, "volume_mod": 1.18, "resist_mod": 2.48, "usure_mod": 0.28},
    "poids_plume":      {"kg": 65.8,  "dmg_mod": 0.945, "volume_mod": 1.16, "resist_mod": 2.32, "usure_mod": 0.31},
    "poids_leger":      {"kg": 70.3,  "dmg_mod": 0.960, "volume_mod": 1.15, "resist_mod": 2.19, "usure_mod": 0.28},
    "poids_welter":     {"kg": 77.1,  "dmg_mod": 0.990, "volume_mod": 1.13, "resist_mod": 2.04, "usure_mod": 0.3},
    "poids_moyen":      {"kg": 83.9,  "dmg_mod": 1.030, "volume_mod": 1.10, "resist_mod": 2.12, "usure_mod": 0.38},
    "poids_mi_lourd":   {"kg": 93.0,  "dmg_mod": 1.085, "volume_mod": 1.07, "resist_mod": 2.04, "usure_mod": 0.6},
    "poids_lourd":      {"kg": 120.2, "dmg_mod": 1.150, "volume_mod": 1.01, "resist_mod": 1.78, "usure_mod": 0.55},
}

# =========================================================
#  PROFILS
# =========================================================
# Le profil de frappe vient desormais de striking_v2 (armes decomposees)
StrikingProfile = StrikingProfileV2


class WrestlingProfile:
    def __init__(self, **kw):
        self.shot = kw.get("shot", 50)
        self.clinch_wrestling = kw.get("clinch_wrestling", 50)
        self.throws = kw.get("throws", 50)
        self.sprawl = kw.get("sprawl", 50)
        self.whizzer = kw.get("whizzer", 50)
        self.balance = kw.get("balance", 50)
        self.grip_fighting = kw.get("grip_fighting", 50)


class PhysicalProfile:
    def __init__(self, **kw):
        self.cardio = kw.get("cardio", 50)
        self.chin = kw.get("chin", 50)
        self.recovery = kw.get("recovery", 50)     # récupération entre les rounds
        self.body_conditioning = kw.get("body_conditioning", 50)
        self.balance_base = kw.get("balance_base", 50)


class MentalProfile:
    def __init__(self, **kw):
        self.discipline = kw.get("discipline", 50)
        self.fight_iq = kw.get("fight_iq", 50)
        self.aggression = kw.get("aggression", 50)


class Fighter:
    def __init__(self, name, striking, wrestling, ground, clinch, physical, mental,
                 gameplan=None, garde=ORTHODOX, stance_switching=50,
                 division="poids_leger"):
        self.name = name
        self.division = division
        self.div = DIVISIONS.get(division, DIVISIONS["poids_leger"])
        self.striking = striking
        self.wrestling = wrestling
        self.ground = ground
        self.clinch = clinch
        self.physical = physical
        self.mental = mental
        self.gameplan = gameplan or {"striking": 0.5, "wrestling": 0.3, "clinch": 0.2}
        self.depenses = {}     # cardio dépensé par poste (voir depenser)

        # --- État de combat ---
        self.stance = StanceState(garde, stance_switching)
        self.legs = LegDamage()
        self.body = BodyState(physical.body_conditioning, striking.blocage)
        self.chaos = 0.0        # a quel point l'autre lui a fait perdre son jeu
        self._niv = None        # niveau moyen, calcule a la demande
        self.td_echecs = 0      # entrees ratees depuis le debut du combat
        # Ce qu'il CROIT savoir de l'autre : sa fiche au dernier combat, pas
        # celle d'aujourd'hui. Le camp adverse est une information cachee.
        self.percu = None
        self.head_damage = 0
        self.cardio = 100.0
        self.sonne = 0            # nb d'echanges restants en etat sonne
        self.knockdowns = 0
        self.reset_round_stats()

    # -----------------------------------------------------
    def reset_round_stats(self):
        self.rs = {
            "sig_landed": 0, "sig_attempted": 0,
            "damage": 0.0, "score_frappes": 0.0,
            "td_landed": 0, "td_attempted": 0,
            "control": 0, "sub_attempts": 0,
            "clinch_control": 0, "knockdowns": 0,
        }

    # -----------------------------------------------------
    def cardio_ratio(self):
        return max(0.0, self.cardio / 100)

    def depenser(self, cout, poste="autre"):
        """
        Le corps travaillé fait consommer plus.

        `poste` attribue la dépense (instrumentation, chantier 2) : on ne
        peut pas vérifier la hiérarchie voulue (sol_dessous > lutte/clinch
        > striking) sans savoir où part le cardio. Dépense RÉELLE (après
        drain du corps) cumulée sur le combat entier dans self.depenses.
        """
        # ECHELLE_DEPENSE : facteur global unique. La hierarchie PAR ACTION
        # est deja la bonne (lutte 20/action, sol-dessous 14, coup 0.8 —
        # mesure du 07/08) : on ne touche a AUCUN prix relatif, on ramene
        # l'echelle entiere dans le budget. Un seul bouton a calibrer.
        reel = cout * ECHELLE_DEPENSE * self.body.drain_cardio()
        self.depenses[poste] = self.depenses.get(poste, 0.0) + reel
        self.cardio = max(0.0, self.cardio - reel)

    def recuperer_entre_rounds(self):
        """
        La minute au tabouret. Deux voies EXPLICITES (design utilisateur) :
          - le CARDIO gouverne l'energie qui revient : un gros moteur
            recharge fort entre les rounds ;
          - le MENTON (chin) gouverne la recuperation PHYSIQUE : encaisser
            et repartir. Il porte le facteur d'etat — corps casse et tete
            sonnee reduisent ce que la minute peut rendre.
        Avant : base = 8 + recovery/6 (~19 pts), une seule voie opaque
        (recovery = cardio*0.7 + menton*0.3 via l'adapter). Insuffisant et
        illisible : personne ne repartait avec plus d'un cinquieme de
        reservoir.
        """
        # Ordres de grandeur : la minute rend ~12-16 pts a un profil moyen,
        # pas ~37 — sinon la courbe est plate (R2 = R1, mesure du 07/08).
        # La vraie trajectoire vient d'une depense de round (~25-30) que la
        # minute ne compense qu'a moitie.
        energie = 4 + self.physical.cardio * 0.10           # voie 1 : le moteur
        physique = 2 + self.physical.chin * 0.06            # voie 2 : l'encaisse
        etat = (1 - self.body.chute_de_garde() * 0.5)       # corps casse
        if self.sonne > 0:
            etat *= 0.6                                     # tete encore trouble
        self.cardio = min(100.0, self.cardio + (energie + physique) * etat)

    # -----------------------------------------------------
    def fatigue_factor(self):
        """Multiplicateur global de performance lié au réservoir restant."""
        r = self.cardio_ratio()
        return 0.55 + 0.45 * r

    def stabilite(self):
        return stabilite(self.stance, self.legs, self.physical.balance_base)

    def puissance(self):
        return facteur_puissance(self.stance, self.legs, self.physical.balance_base) * self.fatigue_factor()

    def esquive(self):
        return (facteur_esquive(self.stance, self.legs, self.physical.balance_base)
                * self.fatigue_factor() * self.malus_sonne()
                * (1 - self.chaos * 0.55 * self.sensibilite_chaos()))

    def precision(self):
        return (facteur_precision(self.stance) * self.fatigue_factor()
                * self.malus_sonne()
                * (1 - self.chaos * 0.38 * self.sensibilite_chaos()))

    def lire_adversaire(self, dfn, stat, defaut=50):
        """
        Il planifie sur ce qu'il a VU au dernier combat de l'autre, pas sur ce
        que l'autre est devenu depuis. C'est ce qui donne un sens au scouting
        et au camp : un adversaire qui a passe six semaines sur son sprawl
        reste faible SUR LE PAPIER.
        """
        if self.percu is None:
            return getattr(dfn.wrestling, stat, defaut)
        return self.percu.get(stat, getattr(dfn.wrestling, stat, defaut))

    def decouvrir(self, dfn):
        """
        Fin de round : ce qu'il a senti dans la cage corrige ce qu'il croyait.
        Un combattant lucide recale presque tout en un round ; un autre garde
        son plan errone jusqu'au bout.
        """
        if self.percu is None:
            return
        part = 0.25 + self.mental.fight_iq / 145      # 0.42 a 25, 0.93 a 99
        for k, v in list(self.percu.items()):
            reel = getattr(dfn.wrestling, k, v)
            self.percu[k] = v + (reel - v) * min(1.0, part)

    def garde_anti_lutte(self, dfn):
        """
        On ne s'assoit pas sur ses coups quand on craint le changement de
        niveau : hanches en arriere, poids sur la jambe arriere, on frappe
        moins fort et moins franchement. Ce n'est pas un choix, c'est la
        posture que la menace impose.

        La menace est VIVANTE : elle depend de ce que l'autre peut encore
        faire. Un lutteur vide n'inquiete plus personne — et c'est la que le
        frappeur se lache enfin. C'est ce qui donne son sens au round 3.
        """
        menace = (dfn.wrestling.shot / 100.0
                  * dfn.cardio_ratio()
                  * dfn.gameplan.get("wrestling", 0.3) / 0.55)
        return 1.0 - min(0.20, max(0.0, menace) * 0.16)

    def prudence_sol(self, dfn):
        """
        On n'emmene pas un jiujitsuka au sol.

        Le plan de combat etait derive des SEULES stats de celui qui l'applique :
        il ne regardait jamais le danger d'en face. Un lutteur amenait un
        specialiste de la soumission au sol sept fois par combat et se faisait
        etrangler dans 23% des cas. Aucun coach ne demanderait ca.

        C'est du FIGHT IQ pur : un combattant intelligent sait a qui il a
        affaire. Un autre fonce et se fait prendre le bras.
        """
        danger = (dfn.ground.submission_off_bottom * 0.6
                  + dfn.ground.sweeps * 0.4 - 55) / 100.0
        lucidite = self.mental.fight_iq / 100.0
        return 1.0 - min(0.55, max(0.0, danger) * lucidite * 1.5)

    def retenue_lutte(self):
        """
        A quel point il arrete de tirer sur les jambes.

        DEUX freins, l'un mental, l'autre physique :
          - la LUCIDITE : apres plusieurs entrees stoppees, un combattant
            intelligent change de plan. Un autre insiste jusqu'a la cloche.
            C'est ce qui donne enfin un poids reel au fight_iq, mesure inerte
            (51.1% a +30 contre -30 chez le lutteur).
          - le RESERVOIR : vide, on ne tire plus, quelle que soit l'intention.
            Un double leg coute cher.

        Sans ces freins, un lutteur tentait jusqu'a 18 entrees par combat
        (le reel est 2 a 6) et annulait par le volume toute defense adverse :
        s'entrainer au sprawl ne servait a rien.
        """
        lucidite = 0.03 + self.mental.fight_iq / 900
        mental = 1.0 / (1.0 + self.td_echecs * lucidite)
        physique = 0.62 + 0.38 * self.cardio_ratio()
        return mental * physique

    def niveau_moyen(self):
        """Son niveau general, pour juger de ce qui depasse chez lui."""
        if self._niv is None:
            s, g, w = self.striking, self.ground, self.wrestling
            # /!\ CETTE VALEUR EST UN PARAMETRE DU MOTEUR, PAS UN AFFICHAGE.
            # Elle sert de REFERENCE a specialite() : un shot a 95 chez un
            # homme qui a 70 partout est une arme ; le meme shot chez un
            # homme qui a 92 partout n'est qu'une stat de plus. C'est
            # l'ECART a cette moyenne qui fait le specialiste, et il entre
            # dans la chance de takedown.
            # ELLE NE DOIT PAS BOUGER POUR DES RAISONS D'INTERFACE : ce
            # qu'on montre au joueur vit dans note_generale().
            self._niv = (s.jab + s.cross + s.low_kick + s.esquive_tete
                         + s.footwork + w.shot + w.sprawl + g.passing
                         + g.submission_def + self.physical.cardio) / 10.0
        return self._niv

    def note_generale(self):
        r"""La note MONTREE AU JOUEUR. Douze stats : les dix du combat, plus
        le fight IQ et le menton — un homme qui lit le combat et qui encaisse
        vaut mieux qu'un homme qui frappe aussi fort et qui s'ecroule.

        /!\ ELLE N'ENTRE DANS AUCUN CALCUL DU MOTEUR. C'est tout l'interet
        de l'avoir separee de niveau_moyen() : on peut y ajouter ou retirer
        ce qu'on veut, l'affichage change et pas un seul combat ne bouge.
        Histoire : le 09/08 on avait ajoute fight_iq et le menton DANS
        niveau_moyen(). Ca marchait, mais ca a deplace les soumissions de
        +1,3 point et impose une reouverture du gel — pour un resultat qu'on
        pouvait obtenir sans toucher au moteur.

        /!\ ET UNE NOTE HAUTE NE VEUT PAS DIRE QU'ON DOMINE : c'est une
        moyenne. A note egale (88 contre 88), le frappeur bat le lutteur
        64 % du temps. La note resume, elle ne juge pas.
        """
        s, g, w = self.striking, self.ground, self.wrestling
        return (s.jab + s.cross + s.low_kick + s.esquive_tete
                + s.footwork + w.shot + w.sprawl + g.passing
                + g.submission_def + self.physical.cardio
                + self.mental.fight_iq + self.physical.chin) / 12.0

    def specialite(self, valeur):
        """
        Le bonus du SPECIALISTE MONDIAL, entre 0 et 1.

        Aplatir la pente des takedowns a sauve le milieu de tableau mais a
        ecrase le sommet : un lutteur a 99 contre une defense a 65 tombait a
        67%, la ou l'on attend 75-85%. Il faut rendre le haut du panier sans
        re-raidir toute la courbe — sinon on recasse l'economie du camp
        d'entrainement.

        DEUX conditions cumulatives, et c'est la seconde qui compte :
          - la stat doit etre au sommet (88+)
          - elle doit DEPASSER SON PROPRE NIVEAU MOYEN
        Un homme a 95 partout n'est pas un specialiste, il est juste bon. Un
        homme a 95 en lutte et 60 ailleurs en est un — et il paie deja ses 60.
        Le bonus s'achete donc en creusant un trou ailleurs, pas en montant.
        """
        if valeur < 88:
            return 0.0
        excellence = min(1.0, (valeur - 88) / 11.0)
        ecart = min(1.0, max(0.0, (valeur - self.niveau_moyen()) / 26.0))
        return excellence * ecart

    def sensibilite_chaos(self):
        """
        Le bazar coute cher a celui qui vit de sa technique, et presque rien a
        celui qui n'en a pas. C'est LA le mecanisme : le brawler n'est pas
        immunise au chaos, il n'a simplement rien a y perdre — pendant que
        l'escrimeur d'en face perd tout ce qui fait son jeu.
        """
        technique = (self.striking.esquive_tete + self.striking.footwork
                     + self.striking.timing) / 3
        # Courbe raide, pas lineaire : entre un escrimeur et un bagarreur,
        # l'ecart de perte doit etre FLAGRANT, sinon le bazar coute presque
        # pareil aux deux et le mecanisme ne sert a rien.
        return max(0.20, min(1.9, (technique / 58) ** 2))

    def subir_chaos(self, agresseur):
        """
        Le brawler emmene l'autre DANS SON MONDE : echanges sales, rythme
        desordonne, plus personne ne place ses coups. Le technicien perd son
        jeu, le bagarreur non — c'est le meme bazar pour tout le monde, sauf
        que lui n'avait rien a perdre.

        On resiste avec ses jambes (garder la distance) et sa lecture du
        combat (refuser l'echange). Pas avec sa technique pure.
        """
        pousse = (agresseur.mental.aggression * 0.55
                  + agresseur.striking.power * 0.45) / 100
        garde_la_tete = (self.striking.footwork * 0.5
                         + self.mental.fight_iq * 0.5) / 100
        delta = (pousse - garde_la_tete) * 0.16
        self.chaos = max(0.0, min(0.55, self.chaos + delta))

    def retrouver_calme(self):
        """Au centre, a distance, on remet de l'ordre."""
        self.chaos = max(0.0, self.chaos - 0.05)

    def resultat_impact_tete(self, impact, ko_power_adverse=50):
        """
        Trois issues possibles sur un coup propre à la tête :
          None        → il encaisse
          'knockdown' → il tombe, il peut revenir
          'ko'        → c'est terminé

        `ko_power_adverse` est la qualité CONCUSSIVE du frappeur, distincte de
        sa puissance brute : certains usent sans jamais éteindre, d'autres
        coupent le courant d'un seul coup.
        """
        chin = self.physical.chin
        # Resistance a l'accumulation propre a la categorie (voir DIVISIONS)
        resist = self.div.get("resist_mod", 1.0)
        # resist_mod dit combien d'energie il faut pour eteindre en UN coup
        # (donc QUAND ca finit) ; usure_mod dit a quelle vitesse le traumatisme
        # cumule mene a l'arret (donc COMBIEN finissent tard). Les confondre
        # rendait le calibrage impossible : relever resist allongeait bien les
        # combats des lourds mais effondrait leur taux de KO du meme geste.
        # Meme raisonnement que la separation violence / taux (decision C5).
        usure = self.div.get("usure_mod", 1.0)

        # --- Potentiel concussif du coup reçu ---
        concussif = 0.0
        if impact > 0:
            # Le seuil de commotion humain ne baisse pas avec le poids, mais
            # l'energie par coup, si. dmg_mod ne peut pas porter cet ecart
            # (plage volontairement etroite, decision C9) : la part manquante
            # vit ici. Ce n'est pas un double comptage, c'est la moitie du
            # gradient d'energie que C9 ne pouvait pas exprimer.
            seuil_nu = 2.2 + chin / 26      # seuil humain, hors categorie
            seuil = seuil_nu * resist
            if impact > seuil:
                concussif = (impact - seuil) / 420
            # La qualité de frappe du puncheur est le facteur dominant
            concussif *= (0.55 + ko_power_adverse / 115)
            # Menton fatigué, tête déjà secouée
            concussif *= (1 + (1 - self.cardio_ratio()) * 0.7)
            # Le menton deja entame encaisse moins bien — mais un point de degat
            # ne pese pas pareil selon la categorie. C'est le MEME phenomene que
            # l'accumulation, il doit passer par le meme levier, sinon resist_mod
            # ne corrige que la moitie du probleme (mesure : le concussif fait
            # 60% des arrets chez les legeres).
            concussif *= (1 + min(1.3, self.head_damage / (55 * resist)))
            # Un combattant déjà sonné ne tient presque rien
            if self.sonne > 0:
                concussif *= 2.4

        # --- Accumulation : le menton s'effrite ---
        seuil_ac = (26 + chin / 2.2) * resist / usure
        accum = 0.0
        if self.head_damage > seuil_ac:
            accum = min(0.24, (self.head_damage - seuil_ac) * usure / (340 * resist))

        # CALIBRAGE_COMMOTION : la porte unique du recalibrage post-cardio.
        # Les seuils ci-dessus avaient ete regles sur des hommes CUITS EN
        # PERMANENCE (fatigue clouee a 0.55). Avec un cardio sain (0.82 en
        # fin de combat), l'impact et la cadence remontent : TKO 36.6 et
        # DEC 24.2 au lieu de 19.5 / 46.5. On ne retouche PAS les chemins
        # (leurs rapports internes ont ete durement calibres) : on redose la
        # porte d'entree, un seul bouton.
        total = min(0.72, (concussif + accum) * CALIBRAGE_COMMOTION)
        if random.random() >= total:
            return None

        # QUEL chemin a lache ? Un homme use qui s'ecroule sur un jab, c'est
        # plutot un TKO. MAIS l'accumulation a la tete PREPARE le KO : sur un
        # crane deja bien entame, le coup suivant n'appelle pas l'arbitre, il
        # ETEINT. Le decoupage dur "accumulation -> TKO" gardait le KO sec a
        # 3-6% contre ~11 reels, alors que le total des finitions etait juste.
        par_accumulation = random.random() < accum / max(1e-9, concussif + accum)
        if par_accumulation:
            usure_tete = min(1.0, self.head_damage / (52 * resist))
            # Dose : a 0.10+0.42u ce chemin produisait 92% des extinctions et
            # KO sec 27% — "prepare le KO" etait devenu "garantit le KO",
            # car il se declenche a repetition en fin de combat.
            if random.random() < (0.03 + usure_tete * 0.15) * CALIBRAGE_KO_SEC:
                # Tete trop entamee : le coup ETEINT, quelle que soit sa
                # violence propre. Passer par le test de violence ci-dessous
                # annulait l'idee — un jab de fin de combat le rate toujours,
                # alors que c'est exactement lui qui eteint un homme use.
                return "ko"
            return "knockdown"

        # Touché : knockdown ou extinction sèche ?
        # resist_mod dit SI le coup commotionne ; une fois que c'est arrive,
        # la violence se mesure sur l'echelle humaine brute, pas sur le seuil
        # gonfle par la categorie. Les mesurer sur la meme echelle ecrasait le
        # KO sec a 2,2% (contre ~11% reels) : tout finissait en TKO.
        seuil_nu = 2.2 + self.physical.chin / 26
        # Le partage extinction/knockdown se decide ICI, plus par un rebapteme
        # en aval. La violence typique depasse largement le seuil nu (moyenne
        # mesuree 1.83 a diviseur 1.25) : il faut une echelle bien plus dure
        # pour qu'un knockdown reste l'issue courante et l'extinction l'exception
        # — sauf tete entamee (chemin d'usure plus haut) et homme deja sonne.
        # Le PLAFOND est le vrai bouton, pas l'echelle. Conditionnellement a
        # un arret, l'impact est toujours enorme (la commotion ne se declenche
        # que sur les gros coups) : violence >> 1 quasi systematiquement, d'ou
        # l'inertie du diviseur (1.25 -> 5.5 ne bougeait rien). La plupart des
        # commotions doivent FAIRE TOMBER — c'est le knockdown qui nourrit
        # l'arbitre (re-chute, serie non defendue), donc les TKO.
        violence = max(0.0, (impact - seuil_nu) / (seuil_nu * 3.2))
        proba_ko_sec = (min(0.30, violence * 0.12)
                        + (0.18 if self.sonne > 0 else 0)) * CALIBRAGE_KO_SEC
        return "ko" if random.random() < proba_ko_sec else "knockdown"

    def encaisser_knockdown(self):
        """Il tombe : sonné plusieurs échanges, défense effondrée."""
        self.sonne = 3
        self.coups_sonne = 0
        self.knockdowns += 1
        self.rs_knockdowns_subis = getattr(self, "rs_knockdowns_subis", 0) + 1
        self.cardio = max(0.0, self.cardio - 12)

    def recuperer_sonne(self):
        if self.sonne > 0:
            self.sonne -= 1
            if self.sonne == 0 and self.physical.recovery > 65:
                self.head_damage = max(0, self.head_damage - 4)

    def malus_sonne(self):
        """Multiplicateur de performance quand il est sonné (1.0 = intact)."""
        return 1.0 if self.sonne == 0 else 0.45 + 0.15 * (3 - self.sonne)


# =========================================================
#  ARMES DEBOUT
# =========================================================
# =========================================================
#  FRAPPE DEBOUT  (delegue a striking_v2 : armes decomposees,
#  defenses appariees, vitesse et qualite d'execution)
# =========================================================
def resolve_strike_debout(atk, dfn, arme, acculé_defenseur, log, bonus_setup=0.0, etat=None):
    """Resout une frappe debout et repercute les degats sur les bons systemes."""
    info = ARMES_V2[arme]
    atk.rs["sig_attempted"] += 1
    atk.depenser(info["cout"], poste="striking")

    res, dmg, zone, contre, conc = resolve_frappe(
        atk, dfn, arme, acculé_defenseur,
        penalite_atk=atk.puissance() * atk.garde_anti_lutte(dfn),
        penalite_dfn=dfn.esquive(),
        bonus_setup=bonus_setup,
    )

    if res == "checké":
        atk.legs.add(atk.stance.jambe_arriere(), int(dmg))
        log.append(f"    {dfn.name} check le {arme} — {atk.name} encaisse {int(dmg)}")
        return False, 0, contre

    if res != "touché":
        log.append(f"    {atk.name} {arme} → manqué")
        return False, 0, contre

    dmg = dmg * atk.div["dmg_mod"]
    atk.rs["sig_landed"] += 1
    atk.rs["damage"] += dmg
    atk.rs["score_frappes"] += 1.0

    # Serie NON DEFENDUE sur homme sonne : au troisieme coup net a la tete
    # sans reponse, l'arbitre s'interpose. L'autre moitie des TKO reels.
    if dfn.sonne > 0 and zone == "tete":
        dfn.coups_sonne = getattr(dfn, "coups_sonne", 0) + 1
        seuil_arbitre = 2 if dfn.head_damage > 40 * dfn.div.get("resist_mod", 1.0) else 3
        if dfn.coups_sonne >= seuil_arbitre and random.random() < CALIBRAGE_ARBITRE:
            # CALIBRAGE_ARBITRE : avec un cardio sain, l'attaquant convertit
            # quasi TOUJOURS le knockdown (cadence tenue, 3 coups nets pendant
            # les 3 echanges de sonne) — la serie faisait 20.4% des combats a
            # elle seule. En reel un knockdown ne se convertit qu'environ une
            # fois sur deux : l'homme survit, s'accroche, ou l'arbitre laisse
            # finir le round. Le tirage re-roule a chaque coup suivant tant
            # qu'il est sonne — survivre une fois n'immunise pas.
            log.append(f"    *** TKO ! {dfn.name} ne repond plus, l'arbitre arrete ***")
            return "KO", dmg, False

    if zone == "jambe":
        cote = dfn.stance.jambe_avant() if random.random() < 0.8 else dfn.stance.jambe_arriere()
        dfn.legs.add(cote, int(dmg))
        log.append(f"    {atk.name} {arme} → touché ({dmg:.0f}) jambe {cote}")

    elif zone == "corps":
        zp = "foie" if random.random() < 0.32 else "corps"
        reel = dfn.body.encaisser(dmg, zp)
        dfn.depenser(dfn.body.cout_immediat_cardio(reel), poste="encaisse_corps")
        log.append(f"    {atk.name} {arme} → touché ({reel:.0f}) {zp}")
        # CALIBRAGE_FOIE : des hommes frais placent bien plus de coups au
        # corps (cadence tenue) et chaque foie touche relance le tirage —
        # le TKO au corps faisait 22% de TOUS les combats (reel : ~2-3%).
        # Le facteur vit ICI et pas dans body.py : body.js est conforme au
        # bit pres, on ne casse pas le portage pour un calibrage.
        if zp == "foie" and random.random() < dfn.body.risque_ko_foie() * CALIBRAGE_FOIE:
            log.append(f"    *** TKO AU CORPS ! {dfn.name} s effondre sur un coup au foie ***")
            return "KO", dmg, False

    else:
        dfn.head_damage += dmg
        log.append(f"    {atk.name} {arme} → touché ({dmg:.0f}) tête")
        issue = dfn.resultat_impact_tete(dmg * conc, atk.striking.ko_power)
        if issue == "ko":
            # Un retour "ko" est une EXTINCTION, point. L'ancien code le
            # rebaptisait TKO des que head_damage > 55 — or en fin de combat la
            # tete est presque toujours au-dela (usure mesuree 0.92) : 102
            # extinctions sur 160 combats ne donnaient que 8 KO SEC affiches.
            # L'accumulation a la tete PREPARE le KO, elle ne le disqualifie pas.
            log.append(f"    *** KO SEC ! {dfn.name} est eteint par {atk.name} ***")
            return "KO", dmg, False
        if issue == "knockdown":
            # RE-KNOCKDOWN dans la meme sequence : l'arbitre n'attend pas le
            # troisieme. C'est LA source principale de TKO reels — le moteur
            # n'en produisait aucun (3 TKO sur 200 combats, 32 re-knockdowns
            # mesures qui repartaient comme si de rien n'etait).
            if dfn.sonne > 0:
                log.append(f"    *** TKO ! {dfn.name} retombe, l'arbitre arrete ***")
                return "KO", dmg, False
            dfn.encaisser_knockdown()
            atk.rs["knockdowns"] += 1
            log.append(f"    >>> KNOCKDOWN ! {dfn.name} touche le sol")
            # Il se jette dessus pour finir : c'est la reaction naturelle.
            # Un frappeur pur peut aussi choisir de le laisser se relever.
            suit = 0.75 if atk.gameplan.get("wrestling", 0.2) > 0.15 else 0.55
            if etat is not None and random.random() < suit:
                etat["phase"] = SOL
                etat["position"] = "mount" if random.random() < 0.45 else "side_control"
                etat["top"] = atk.name
                log.append(f"    >>> {atk.name} le suit au sol en {etat['position']} et enchaine")
            else:
                log.append(f"    >>> {atk.name} le laisse se relever et reste debout")

    return True, dmg, contre



def phase_debout(f1, f2, etat, log):
    """Un échange debout. Gère la bataille de cage et la frappe."""
    # --- Bataille de placement ---
    if etat["cage"] == CENTRE:
        p, e = (f1, f2) if f1.striking.cage_cutting > f2.striking.cage_cutting else (f2, f1)
        fw_e = e.striking.footwork * e.esquive()
        # Le footwork doit VRAIMENT proteger. A 42 de base, meme un bon
        # deplacement finissait acculé, et acculé le moteur annule l'esquive :
        # le boxeur pressure ecrasait tout ce qui n'avait pas de jambes.
        chance = 30 + (p.striking.cage_cutting - fw_e) * 1.35
        if random.uniform(0, 100) < max(5, min(88, chance)):
            etat["cage"] = CAGE
            etat["acculé"] = e.name
            log.append(f"    [cage] {p.name} accule {e.name} contre la grille")
    else:
        acc = f1 if f1.name == etat["acculé"] else f2
        pre = f2 if f1.name == etat["acculé"] else f1
        fw = acc.striking.footwork * acc.esquive()
        if random.uniform(0, 100) < max(5, min(90, 48 + (fw - pre.striking.cage_cutting) * 1.35)):
            etat["cage"] = CENTRE
            etat["acculé"] = None
            acc.retrouver_calme()
            log.append(f"    [cage] {acc.name} se dégage vers le centre")

    # --- Qui initie ---
    # Le volume ne fait pas qu'accelerer le combat : il decide aussi de QUI lache
    # les coups. Sans ca, un mitrailleur reste bride par la cadence de l'adversaire
    # et la stat sature. L'agressivite dit s'il avance, le volume s'il tire.
    poids1 = (f1.mental.aggression * 0.45 + f1.striking.volume * 0.55) * f1.fatigue_factor()
    poids2 = (f2.mental.aggression * 0.45 + f2.striking.volume * 0.55) * f2.fatigue_factor()
    atk, dfn = (f1, f2) if random.random() < poids1 / (poids1 + poids2) else (f2, f1)

    acculé_dfn = etat["acculé"] == dfn.name

    # --- Le brawler emmene l'autre dans son monde ---
    # Ca ne se joue qu'au contact : au large, personne ne se salit.
    if etat["cage"] == CAGE or acculé_dfn:
        dfn.subir_chaos(atk)
        atk.subir_chaos(dfn)
    else:
        atk.retrouver_calme()
        dfn.retrouver_calme()

    # --- Tentative de lutte plutot que frappe ? ---
    # Le gameplan exprime une INTENTION sur tout le round, pas une probabilite
    # par echange : avec ~90 echanges, il faut ramener a un taux par echange.
    # Repere reel : 2 a 6 tentatives de takedown par combat.
    # L'intention de lutter s'exprime PAR UNITE DE TEMPS, pas par coup lache.
    # Sans cette division, un combattant a gros volume se faisait amener au sol
    # plus souvent simplement parce qu'il frappait plus vite.
    # Moins d'entrees, mais elles comptent. Le moteur faisait 3 a 8 arrivees
    # au sol par combat (reel 2-4) de 18 a 48s chacune (reel 40-90s quand le
    # controle tient) : "plaquage, il se releve, replaquage". Personne ne se
    # fait soumettre en 20 secondes — d'ou la soumission a 13% au lieu de 19%.
    TAUX = 0.12 / max(0.5, etat.get("cadence", 1.0))
    # Acculé, un lutteur ne subit pas : il GUETTE. Le contre est d'abord une
    # OCCASION qui se presente, pas une entree plus facile — c'est pour ca que
    # l'effet passe par la frequence et non par le taux de reussite.
    guet = 1.0
    if etat.get("acculé") == atk.name:
        guet = 1.0 + max(0.0, (dfn.striking.cage_cutting - 45)) / 55
    if random.random() < (atk.gameplan.get("wrestling", 0.3) * TAUX
                         * atk.retenue_lutte() * guet * atk.prudence_sol(dfn)):
        return tenter_takedown(atk, dfn, etat, log)

    if random.random() < atk.gameplan.get("clinch", 0.2) * TAUX * 1.05:
        etat["phase"] = CLINCH
        log.append(f"    {atk.name} ferme la distance et engage le clinch")
        return None

    # Choix d'arme selon l'arsenal reel, la cage et l'etat de l'adversaire
    dernier = etat.get("dernier_coup", {}).get(atk.name)
    arme = choisir_arme_v2(atk, dfn, acculé_dfn,
                           garde_basse=dfn.body.chute_de_garde(),
                           dernier_coup=dernier,
                           cible=atk.gameplan.get("cible"))
    bonus = 14 if dernier == "jab" and arme in ("cross", "overhand", "low_kick") else 0

    # On n'envoie pas un coup isole : on enchaine. La serie s'arrete
    # des qu'un coup manque, comme dans un vrai echange.
    n_coups = taille_combinaison(atk)
    res = None
    for k in range(n_coups):
        if k > 0:
            arme = choisir_arme_v2(atk, dfn, acculé_dfn,
                                   garde_basse=dfn.body.chute_de_garde(),
                                   dernier_coup=arme,
                                   cible=atk.gameplan.get("cible"))
            bonus = 10 + atk.striking.enchainements / 12
        res, dmg, contre = resolve_strike_debout(atk, dfn, arme, acculé_dfn, log, bonus, etat)
        if res == "KO":
            return atk
        if res is not True:
            break

    etat.setdefault("dernier_coup", {})[atk.name] = arme if res is True else None

    # Un coup telegraphie rate expose au contre
    if contre:
        d = random.randint(7, 15) * (0.7 + dfn.striking.power / 150) * dfn.div["dmg_mod"]
        atk.head_damage += d
        dfn.rs["sig_landed"] += 1
        dfn.rs["damage"] += d
        log.append(f"    !!! {dfn.name} CONTRE le {arme} de {atk.name} ({d:.0f})")
        if atk.resultat_impact_tete(d * 1.35, dfn.striking.ko_power) == "ko":
            log.append(f"    *** {atk.name} tombe sur le contre ! ***")
            return dfn
    return None


# =========================================================
#  TAKEDOWNS
# =========================================================
# Ce que coute une entree en lutte a celui qui la SUBIT, en part du cout de
# l'attaquant. Module par son niveau de defense : un excellent sprawl
# depense ~0,7 fois ce chiffre, un mauvais ~1,15 fois.
COUT_DEFENSE_TD = 0.85
# Ce que coute a l'attaquant une entree ratee. Etait a 1,5 quand le
# defenseur payait ZERO — desequilibre assume par erreur, pas par choix.
SURCOUT_TD_RATE = 1.25

TAKEDOWNS = {
    "double_leg":    {"skill": "shot", "def": "sprawl",  "pos": "closed_guard", "cout": 5, "contre": 0.15},
    "single_leg":    {"skill": "shot", "def": "whizzer", "pos": "half_guard",   "cout": 5, "contre": 0.10},
    "body_lock":     {"skill": "clinch_wrestling", "def": "balance", "pos": "half_guard", "cout": 4, "contre": 0.05},
    "trip":          {"skill": "clinch_wrestling", "def": "balance", "pos": "half_guard", "cout": 3, "contre": 0.05},
    "throw":         {"skill": "throws", "def": "grip_fighting", "pos": "side_control", "cout": 6, "contre": 0.20},
    # /!\ LES DEUX PORTES VERS LE DOS, AJOUTEES LE 09/08.
    # Avant : les cinq entrees arrivaient en garde, demi-garde ou lateral.
    # AUCUNE ne menait au dos ni en tortue — le seul chemin etait TROIS
    # progressions depuis la garde, et on en mesurait 0,34 par round.
    # /!\ RESERVEES : c'est LA LUTTE qui ouvre la porte et le back_top qui
    # decide s'il la garde.
    "back_take":     {"skill": "clinch_wrestling", "def": "whizzer", "pos": "back_control",
                      "cout": 6, "contre": 0.18, "exige_dos": 75},
    "snap_down":     {"skill": "grip_fighting", "def": "balance", "pos": "turtle",
                      "cout": 4, "contre": 0.08, "exige_dos": 62},
}


def tenter_takedown(atk, dfn, etat, log):
    """Une entrée en lutte. Les jambes abîmées ferment les entrées explosives."""
    if TELEMETRY:
        TELEMETRY["td_tentes"] += 1
    # Il choisit la technique où il est le meilleur, en tenant compte de la défense adverse
    # /!\ LA PORTE DU DOS NE S'OUVRE PAS A TOUT LE MONDE. Sans ce filtre,
    # chacun prendrait le dos et ce serait absurde.
    _dispo = [t for t in TAKEDOWNS
              if "exige_dos" not in TAKEDOWNS[t]
              or getattr(atk.ground, "back_top", 0) >= TAKEDOWNS[t]["exige_dos"]]
    # /!\ ON NE CHOISIT PAS L'ENTREE LA PLUS FACILE, ON CHOISIT CELLE QUI
    # MENE OU L'ON VEUT ALLER. Premiere version : les deux portes vers le dos
    # etaient dans la table mais JAMAIS choisies — le double leg gagnait
    # toujours l'ecart de niveau brut.
    # /!\ ON NE CHOISIT PAS L'ENTREE LA PLUS FACILE, ON CHOISIT CELLE QUI
    # MENE OU L'ON VEUT ALLER. Deux versions ratees avant celle-ci :
    #   1. ecart de niveau brut -> le double leg gagnait TOUJOURS
    #   2. ponderation par la valeur ABSOLUE -> un homme bon partout les
    #      trouvait toutes equivalentes (118 contre 124), l'ecart noye.
    # On normalise SUR L'EVENTAIL DISPONIBLE : ce qui compte est de combien
    # la position visee vaut mieux QUE LES AUTRES, pour lui.
    _vals = {t: valeur_position_sol(atk, TAKEDOWNS[t]["pos"]) for t in _dispo}
    _vmin, _vmax = min(_vals.values()), max(_vals.values())

    def _interet(t):
        v = (getattr(atk.wrestling, TAKEDOWNS[t]["skill"], 50)
             - getattr(dfn.wrestling, TAKEDOWNS[t]["def"], 50) * 0.5)
        return v * (0.55 + 0.9 * (_vals[t] - _vmin) / (_vmax - _vmin + 1))

    # /!\ ON NE PREND PAS TOUJOURS LA MEILLEURE — ON VARIE.
    # Le choix etait DETERMINISTE : le meme homme tentait la MEME entree
    # 1061 fois sur 1061. Et c'etait la projection, l'entree LA PLUS PUNIE
    # (20 % de contre), parce qu'elle arrive en controle lateral.
    # Un vrai lutteur varie, et l'adversaire n'a jamais a deviner si on ne
    # varie pas.
    _poids = [max(1, _interet(t)) ** 2.2 for t in _dispo]
    td = random.choices(_dispo, weights=_poids, k=1)[0]
    info = TAKEDOWNS[td]
    atk.rs["td_attempted"] += 1
    atk.depenser(info["cout"], poste="lutte")

    # /!\ SE DEFENDRE COUTE, MAINTENANT. Trouve le 09/08 en fabriquant un
    # Merab : cardio 99, lutte 92+, il tentait jusqu'a 13 takedowns par
    # combat et finissait a 15 de cardio pendant que le frappeur qui se
    # defendait finissait a 74. Il perdait 10 fois sur 10.
    # Sprawl gratuit, lutte contre la grille gratuite, relevee gratuite :
    # seul l'attaquant payait, et double quand il ratait. Or repousser un
    # lutteur epuise autant que d'entrer.
    # CONSEQUENCE DE CONCEPTION : sans ca, "user l'adversaire" est
    # STRUCTURELLEMENT IMPOSSIBLE, et l'archetype Merab ne peut pas exister.
    # Un bon defenseur depense MOINS, il ne depense pas zero.
    _skill_def = getattr(dfn.wrestling, info["def"], 50)
    dfn.depenser(info["cout"] * COUT_DEFENSE_TD * (1.35 - _skill_def / 145),
                 poste="lutte")

    skill = getattr(atk.wrestling, info["skill"])
    defense = getattr(dfn.wrestling, info["def"])

    # Les jambes détruites tuent l'explosivité de l'entrée
    penalite_jambes = atk.stabilite()
    # Pente volontairement DOUCE. A 1.5 point de chance par point de stat,
    # trente points d'ecart faisaient passer de 5% a 80% : la formule saturait
    # aux deux bouts, et la defense de takedown ne s'achetait pas — soit on
    # encaissait tout, soit on stoppait tout, sans trajet entre les deux.
    # Reperes reels : elite contre defenseur moyen 45-60%, contre un
    # SPECIALISTE 25-35%, frappeur pur qui tente sa chance 20-30%.
    # RENDEMENT ACCELERANT DE L'ELITE. La difference de niveau existait dans
    # le calcul (+42 d'ecart vu contre un defenseur faible, +14 contre un
    # fort) mais se PERDAIT a l'arrivee : les multiplicateurs cardio/jambes
    # compressaient tout, et un lutteur a 99 ne sortait que 8 points au-dessus
    # d'un 75. L'exposant redonne son poids a l'elite SANS creer de falaise :
    # les dix derniers points de stat valent plus que les dix du milieu —
    # c'est le "bonus specialiste", continu au lieu d'un seuil a 90.
    ec = skill - defense
    ec = (abs(ec) ** 1.25) * (1 if ec >= 0 else -1) / (40 ** 0.25)
    chance = (38 + 0.85 * ec
              + 26 * atk.specialite(skill)) * (0.7 + 0.3 * atk.cardio_ratio()) * penalite_jambes
    # Le DEPLACEMENT refuse l'entree : on ne tire pas sur un homme qui garde
    # sa distance et pivote. Mais dos a la grille il n'a plus de recul, et ce
    # bouclier tombe — d'ou la condition.
    if not (etat["cage"] == CAGE and etat["acculé"] == dfn.name):
        chance -= (dfn.striking.footwork - 50) * 0.16

    # Contre la cage, plus dur de sprawler
    if etat["cage"] == CAGE and etat["acculé"] == dfn.name:
        chance += 10

    # LE CONTRE DU LUTTEUR ACCULE.
    # Mettre la pression sur un lutteur, c'est venir a lui. Il n'est pas en
    # difficulte dos a la grille : il est en embuscade, il attend le pas en
    # avant pour changer de niveau. Le bonus vient donc de l'ELAN de l'autre
    # (sa capacite a couper la route) et de la lecture de celui qui attend.
    # Sans ca, la pression etait sans risque et le jeu de cage sans contrepartie.
    elif etat["acculé"] == atk.name:
        elan = (dfn.striking.cage_cutting - 45) * 0.14
        lecture = (atk.mental.fight_iq - 50) * 0.09
        chance += max(0.0, 4 + elan + lecture)

    if random.uniform(0, 100) < max(5, min(90, chance)):
        atk.rs["td_landed"] += 1
        atk.td_echecs = max(0, atk.td_echecs - 1)   # ca passe, il y revient
        if TELEMETRY:
            TELEMETRY["td_reussis"] += 1
        etat["phase"] = SOL
        etat["position"] = info["pos"]
        etat["top"] = atk.name
        log.append(f"    {atk.name} {td} → RÉUSSI, combat au sol ({info['pos']})")
        return None

    if random.random() < info["contre"]:
        etat["phase"] = SOL
        etat["position"] = "half_guard"
        etat["top"] = dfn.name
        log.append(f"    {atk.name} {td} → CONTRÉ, {dfn.name} prend le dessus")
        return None

    log.append(f"    {atk.name} {td} → stoppé")
    # Une entree STOPPEE coute bien plus cher qu'une entree qui passe : on
    # pousse contre une resistance, puis il faut se relever. Sans ce surcout,
    # tirer en vain est gratuit — et un lutteur sans lecture de combat
    # tirerait plus, donc gagnerait plus. On punirait l'intelligence.
    atk.depenser(info["cout"] * SURCOUT_TD_RATE, poste="lutte")
    atk.td_echecs += 1
    return None

def td_key(t):
    return t


# =========================================================
#  PHASE SOL
# =========================================================

# Les positions ou chaque famille de soumission se finit, et celles d'ou
# l'on frappe le mieux. Dupliquees a l'identique dans engine.js.
FAMILLES_SOL = {
    "dos":       ["back_control", "crucifix"],
    "bras":      ["mount", "side_control", "knee_on_belly", "closed_guard"],
    "tete_bras": ["north_south", "turtle", "half_guard", "side_control"],
    "jambes":    ["open_guard", "butterfly_guard"],
}
POS_OUVERTES = ["mount", "side_control", "north_south", "knee_on_belly",
                "back_control", "crucifix"]
SEUIL_ARME_SOL = 72


def valeur_position_sol(f, p):
    """Ce qu'une position vaut POUR CET HOMME : ce qu'il sait y finir, ou ce
    qu'il peut y taper. Dupliquee a l'identique dans engine.js."""
    g = getattr(f, "grappling", None)
    gr = f.ground
    m = 0
    if g:
        for k, positions in FAMILLES_SOL.items():
            if p in positions and g["dessus"][k] >= SEUIL_ARME_SOL:
                m = max(m, g["dessus"][k])
    fr = getattr(gr, "ground_striking", 40)
    return max(m * 1.25, fr if p in POS_OUVERTES else fr * 0.55)


def poids_action_sol(top, position, stall=None):
    r"""Les poids du tirage d'action au sol — remplace le 24/50/26 fixe.

    /!\ DUPLIQUEE A L'IDENTIQUE DANS engine.js. Elle ne peut pas vivre dans
    un module a part : le moteur JS doit rester conforme a ce fichier au
    caractere pres, et Python n'importe pas les modules JS.

    /!\ SANS PROFIL DE GRAPPLING, ON REND EXACTEMENT LES POIDS HISTORIQUES.
    Un combattant non equipe se comporte comme avant la bascule, et les
    bancs de conformite restent verts.

    Pourquoi : le tirage fixe donnait 0,37 progression par round alors qu'il
    en faut TROIS pour aller de la garde au dos — un specialiste n'atteignait
    jamais son arme. Et un lutteur sans soumission perdait un quart de ses
    actions a en chercher.
    La quatrieme intention, TENIR, vient de Merab Dvalishvili : il plaque, ne
    passe pas, ne cherche rien, il garde la position.
    """
    g = getattr(top, "grappling", None)
    if not g:
        return [0.24, 0.50, 0.26, 0.0]
    gr = top.ground

    arme = 0
    for k, positions in FAMILLES_SOL.items():
        if position in positions and g["dessus"][k] >= SEUIL_ARME_SOL:
            arme = max(arme, g["dessus"][k])

    def val(p):
        m = 0
        for k, positions in FAMILLES_SOL.items():
            if p in positions and g["dessus"][k] >= SEUIL_ARME_SOL:
                m = max(m, g["dessus"][k])
        f = getattr(gr, "ground_striking", 40)
        ouv = f if p in POS_OUVERTES else f * 0.55
        return max(m * 1.25, ouv)

    ici = val(position)
    mieux = 0
    for k, positions in FAMILLES_SOL.items():
        for p in positions:
            if p != position:
                mieux = max(mieux, val(p))
    gain = max(0, mieux - ici)

    sub = 0.10 + (arme - SEUIL_ARME_SOL) / 27 * 0.55 if arme else 0.03
    sub *= 1 - min(0.65, gain / 35)
    passage = (getattr(gr, "passing", 50) + getattr(gr, "posture_sol", 50)) / 2
    progress = 0.08 + min(0.50, gain / 30 * 0.34 + (passage - 50) / 100 * 0.22)
    frappe = getattr(gr, "ground_striking", 40)
    gnp = 0.06 + (frappe / 100) * 0.50 * (1.0 if position in POS_OUVERTES else 0.55)
    ctrl = getattr(gr, "top_control", passage)
    tenir = 0.05 + max(0, (ctrl - 60) / 100) * 0.45

    # /!\ LE COUP D'ENTRETIEN — idee de Mael, et elle donne enfin un emploi
    # au fight_iq au sol. L'arbitre relevait 40 % des sequences pour
    # inactivite, plus souvent que l'adversaire lui-meme : on avait ralenti
    # le tempo et durci la sortie, donc les sequences duraient, donc la
    # regle d'inactivite mordait. Elle contredisait meme l'intention "tenir"
    # ajoutee pour Merab.
    # Or le mecanisme existait DEJA a moitie : 3 points de degats suffisent
    # a remettre le compteur a zero. Ce qui manquait, c'est LA DECISION.
    # Un homme lucide place trois petits coups sans force juste avant que
    # l'arbitre s'agite : il n'abime pas, il ACHETE DU TEMPS. Un moyen y
    # pense une fois sur deux, un faible subit.
    s = progress + gnp + sub + tenir
    P = [progress / s, gnp / s, sub / s, tenir / s]

    if stall:
        # /!\ QUAND L'ARBITRE S'AGITE, ON LACHE TOUT POUR FRAPPER. Premiere
        # version : on ne deplacait que "tenir", qui ne pese que 15 % —
        # l'effet etait invisible. Le report doit venir de TOUTES les autres
        # intentions : on ne cherche pas une soumission quand on va se faire
        # relever.
        urgence = min(1, stall / SEUIL_RELANCE)
        lucidite = max(0, min(1, (top.mental.fight_iq - 35) / 55))
        b = urgence * lucidite * 0.80
        reste = 1 - b
        P = [P[0] * reste, P[1] * reste + b, P[2] * reste, P[3] * reste]
    return P


def phase_sol(f1, f2, etat, log):
    top = f1 if etat["top"] == f1.name else f2
    bottom = f2 if etat["top"] == f1.name else f1
    pos = etat["position"]

    top.rs["control"] += 1
    top.depenser(0.8, poste="sol_dessus")
    bottom.depenser(1.2, poste="sol_dessous")   # subir coûte plus cher

    # Au sol, les deux hommes travaillent EN MEME TEMPS : le dessus passe
    # pendant que le dessous retablit. Le tour par tour rendait le dessous
    # spectateur 60% du temps, ce qui transformait chaque takedown en controle
    # de quatre minutes. Le dessus agit donc toujours, et le dessous travaille
    # en parallele dans la meme action.
    _p = poids_action_sol(top, pos, etat.get("stall"))
    action = random.choices(["progress", "gnp", "sub_top", "tenir"],
                            weights=_p, k=1)[0]

    if action == "progress":
        new = tenter_progression(top, bottom, pos)
        # Forcer le passage coute, et coute plus cher quand ca ne passe pas.
        top.depenser(COUT_PASSAGE * (1.0 if new else SURCOUT_ECHEC_SOL),
                     poste="sol_dessus")
        if new:
            etat["position"] = new
            log.append(f"    {top.name} progresse → {new}")
        else:
            log.append(f"    {top.name} tente de progresser → bloqué en {pos}")

    elif action == "gnp":
        # On ne frappe pas au sol UN coup a la fois : on lache une rafale, comme
        # l'enchainement debout. Un coup unique par action donnait 1,5 frappe
        # touchee par minute au sol contre 8 a 15 en realite — le lutteur
        # controlait quatre minutes sans jamais marquer sur les degats.
        acces = POSITIONS[pos]["gnp"]
        rafale = 2 + int(acces * 6 + top.ground.ground_striking / 32)
        rafale = max(1, min(11, int(rafale * top.fatigue_factor())))
        d = 0
        bloques = 0
        # Le moteur crediteit sig_landed PAR COUP mais n'ecrivait que le cumul
        # de degats : l'ecran ne pouvait compter qu'une frappe par rafale et
        # perdait 41% des frappes significatives du combat. On EXPOSE le
        # compte. Aucun tirage n'est touche : les combats restent identiques,
        # et "ground and pound →" / "dégâts" survivent pour mesure.py.
        touches = 0
        tentes = 0
        for _ in range(rafale):
            tentes += 1
            r, coup = resolve_gnp(top, bottom, pos)
            if not coup:
                # Un coup couvert n'arrete pas la sequence : on continue de
                # frapper. Ce n'est qu'apres deux blocages d'affilee que le
                # dessous a ferme l'angle ou noue les bras.
                bloques += 1
                if bloques >= 2:
                    break
                continue
            bloques = 0
            d += coup
            touches += 1
            top.rs["sig_landed"] += 1
        # Une rafale au sol, c'est BEAUCOUP de coups mais des coups COURTS :
        # pas d'elan, pas de rotation de hanches.
        top.depenser(COUT_GNP_COUP * tentes, poste="sol_dessus")   # coups LANCES
        d = int(d * top.div["dmg_mod"] * 0.85)
        if d:
            bottom.head_damage += d
            top.rs["damage"] += d
            top.rs["score_frappes"] += 1.0
            log.append(f"    {top.name} ground and pound → {touches}/{tentes} coups, {d} dégâts")
            # Au sol, la tete ne recule pas : chaque coup porte pleinement,
            # et l'adversaire ne peut ni esquiver ni sortir. Le GnP finit par
            # accumulation, pas par un coup unique.
            # Marquer et ETEINDRE sont deux choses distinctes. Un GnP soutenu
            # doit gagner le round sans forcement finir le combat : a 0.38 de
            # degats le lutteur controlait 41% du combat et perdait 25-64 aux
            # points. On rend donc les degats au score, et on baisse a part le
            # pouvoir d'arret — sinon le TKO au sol explosait a 13%.
            vulnerabilite = 0.30 + POSITIONS[pos]["gnp"] * 0.32
            if bottom.sonne > 0:
                vulnerabilite *= 1.35
            issue = bottom.resultat_impact_tete(d * vulnerabilite, top.striking.ko_power)
            if issue == "ko":
                log.append(f"    *** TKO AU SOL ! {top.name} finit au ground and pound ***")
                return top
            if issue == "knockdown":
                bottom.encaisser_knockdown()
                top.rs["knockdowns"] += 1
                log.append(f"    >>> {bottom.name} est sonne au sol, {top.name} enchaine")
        else:
            top.rs["sig_attempted"] += 1
            # /!\ Le log disait "bloqué" meme quand des coups etaient PASSES :
            # un coup a 1 degat donne int(1 * 0.85) = 0, et le compte de
            # `touches` etait perdu — alors que rs["sig_landed"] les avait
            # comptes. Aucune relecture du log ne pouvait retrouver
            # l'information. On ecrit donc toujours touches/tentes.
            log.append(f"    {top.name} ground and pound → {touches}/{tentes} coups, 0 dégâts")

    elif action == "tenir":
        # /!\ NE RIEN TENTER EST UNE DECISION. Merab plaque, ne passe pas la
        # garde, ne cherche ni la soumission ni le KO : il garde la position
        # et laisse le temps passer. C'est ce qui gagne des rounds sans rien
        # produire.
        top.depenser(0.4, poste="sol_dessus")
        log.append(f"    {top.name} garde le contrôle en {pos}")

    elif action == "sub_top":
        sub, res = tenter_soumission_top(top, bottom, pos)
        if res == "SOUMISSION" and random.random() > CALIBRAGE_SUB:
            res = "défendue"          # calibrage : le tap n'aboutit pas
        if sub:
            top.depenser(COUT_SUB_TOP * (1.0 if res == "SOUMISSION"
                                         else SURCOUT_ECHEC_SOL), poste="sol_dessus")
            top.rs["sub_attempts"] += 1
            log.append(f"    {top.name} tente {sub} → {res}")
            if res == "SOUMISSION":
                log.append(f"    *** {bottom.name} tape ! {sub} ***")
                return top

    # --- Le travail simultane de celui du dessous ---
    if random.random() < 0.92 and etat["phase"] == SOL:
        pos = etat["position"]
        if random.random() < 0.28:
            sub, res = tenter_soumission_bottom(bottom, top, pos)
            if res == "SOUMISSION" and random.random() > CALIBRAGE_SUB:
                res = "défendue"
            if sub:
                bottom.rs["sub_attempts"] += 1
                log.append(f"    {bottom.name} attaque {sub} depuis le dessous → {res}")
                if res == "SOUMISSION":
                    log.append(f"    *** {top.name} tape ! {sub} d'en bas ***")
                    return bottom
                return None
        tech, dest = tenter_evasion(bottom, top, pos)
        # SE DEBATTRE COUTE. Avant, le dessous payait 1.2 par tick qu'il
        # tente un upa a fond ou qu'il reste allonge : une evasion ratee
        # etait gratuite, donc il retentait jusqu'a la cloche. On facture la
        # tentative, et on la surtaxe quand elle est stoppee — meme regle
        # qu'au takedown debout (engine.py, chantier 1).
        if tech:
            _cout = TECHNIQUES_ESCAPE.get(tech, {}).get("cout_cardio", 2)
            if dest is None:                 # stoppe : ca coute plus cher
                _cout *= SURCOUT_ECHEC_SOL
            bottom.depenser(_cout, poste="sol_dessous")
        if dest == "debout":
            etat["phase"] = DEBOUT
            etat["top"] = None
            log.append(f"    {bottom.name} {tech} → se relève, retour debout")
        elif dest:
            etat["position"] = dest
            log.append(f"    {bottom.name} {tech} → passe en {dest}")
            if tech == "sweep":
                etat["top"] = bottom.name
                log.append(f"    >>> RENVERSEMENT, {bottom.name} prend le dessus")
        else:
            log.append(f"    {bottom.name} {tech} → maintenu en {pos}")

    return None


# =========================================================
#  PHASE CLINCH
# =========================================================
class DamageRouter:
    """
    Adaptateur : le module clinch attend un objet avec .add(zone, dmg).
    On route chaque zone vers le bon système du combattant.
    """

    def __init__(self, fighter):
        self.f = fighter

    def add(self, zone, dmg):
        if zone == "tete":
            self.f.head_damage += dmg
        elif zone == "corps":
            reel = self.f.body.encaisser(dmg, "foie" if random.random() < 0.3 else "corps")
            self.f.depenser(self.f.body.cout_immediat_cardio(reel), poste="encaisse_corps")
        elif zone == "jambe":
            cote = self.f.stance.jambe_avant()
            self.f.legs.add(cote, dmg)


def phase_clinch(f1, f2, etat, log):
    issue, acteur, events, stats, prise_finale = clinch_sequence(
        f1, f2, DamageRouter(f1), DamageRouter(f2),
        contre_cage=(etat["cage"] == CAGE), micro_actions=4,
        cardio1=f1.cardio_ratio(), cardio2=f2.cardio_ratio()
    )
    for e in events:
        log.append(f"    {e}")

    for f in (f1, f2):
        st = stats.get(f.name, {})
        f.rs["score_frappes"] += st.get("score", 0)
        f.rs["sig_landed"] += st.get("sig", 0)
        # Le forfait de 2.5 ne distinguait rien : celui qui forcait quatre
        # sorties payait comme celui qui tenait la prise. On garde une base
        # pour le combat de prise lui-meme (fatigant pour les DEUX), et on y
        # ajoute le cout reel action par action, desormais remonte par
        # clinch_sequence.
        f.depenser(CLINCH_BASE_CARDIO + st.get("cardio", 0.0), poste="clinch")

    if issue == "takedown":
        etat["phase"] = SOL
        # /!\ ON ATTERRIT LA OU L'ON ETAIT. Le takedown de clinch arrivait
        # TOUJOURS en demi-garde, meme quand le controleur avait deja le dos.
        etat["position"] = ("back_control" if prise_finale == "back_clinch"
                            else "half_guard")
        etat["top"] = acteur.name
        acteur.rs["td_landed"] += 1
        if TELEMETRY:
            TELEMETRY["td_clinch"] += 1
    else:
        etat["phase"] = DEBOUT
        if issue == "rupture":
            etat["cage"] = CENTRE
            etat["acculé"] = None

    return None


# =========================================================
#  ROUND ET COMBAT
# =========================================================
# =========================================================
#  BUDGET TEMPS DU ROUND
# =========================================================
DUREE_ROUND = 300          # secondes

# Cout de base d'une sequence de clinch, pour les deux hommes : le combat de
# prise use meme sans action marquante. Le reste du cout vient des actions
# elles-memes (SORTIES.cout_cardio et FRAPPES_CLINCH.drain_cardio, clinch.py).
# Etait un forfait de 2.5 qui incluait tout et ne distinguait rien.
CLINCH_BASE_CARDIO = 1.0

# Cout passif d'exister dans la cage, par unite de temps (voir simuler_round).
TEMPO_CARDIO = 0.04

# Facteur global sur TOUTE depense (voir Fighter.depenser).
ECHELLE_DEPENSE = 0.28

# Facteur global sur la probabilite de commotion (voir resolve_impact_tete).
CALIBRAGE_COMMOTION = 0.36
CALIBRAGE_FOIE = 0.12
# Part des soumissions "reussies" par les modules qui aboutissent vraiment
# (le tap). Vit dans engine et pas dans ground_v2 : ground_v2.js est
# conforme au bit pres, on calibre a l'exterieur du module.
CALIBRAGE_SUB = 0.66
# Facteur sur les deux chemins d'extinction seche (usure et violence).
CALIBRAGE_KO_SEC = 0.68
CALIBRAGE_ARBITRE = 0.48
SEUIL_RELANCE = 42.0       # inactivite au sol avant relance de l'arbitre

# --- Telemetrie : mesurer avant de corriger (regle H1) ---
TELEMETRY = {}
def reset_telemetry():
    TELEMETRY.clear()
    for k in ("t_debout", "t_clinch", "t_sol", "t_total",
              "n_debout", "n_clinch", "n_sol", "n_relances", "n_rounds",
              "td_tentes", "td_reussis", "sequences_sol", "td_clinch", "kd_suivis"):
        TELEMETRY[k] = 0.0

# Temps consomme par type d'action
T_FRAPPE_BASE = 2.05        # une frappe isolee, echanges de position compris
T_TAKEDOWN    = 9.0        # une entree en lutte
T_CLINCH      = 11.0       # une sequence de clinch
# /!\ LE TEMPO DU SOL — RELEVE DE 4,5 A 12 LE 09/08.
# A 4,5, un echange au sol durait ~5,7 s en garde : celui du dessous
# obtenait DIX tentatives de relevee par minute. Dans un vrai combat il en
# obtient une ou deux. Ce n'etait pas le POURCENTAGE de sortie le probleme,
# c'etait le NOMBRE DE TIRAGES : a 30 % par tentative, tenir un round entier
# etait MATHEMATIQUEMENT IMPOSSIBLE.
# Ralentir change l'ECHELLE DE TEMPS, pas l'equilibre des forces.
# /!\ ET ON NE DENSIFIE PAS POUR COMPENSER : une minute de sol avec deux ou
# trois actions parait vide mais c'est LA REALITE DU SOL.
T_SOL_BASE    = 9.0        # une action au sol


def temps_sol(position, evasion_ratee):
    """
    Le controle au sol devore le round.
    Plus la position est dominante et plus l'adversaire echoue a sortir,
    plus le temps file : c'est ainsi qu'un lutteur mange quatre minutes.
    """
    t = T_SOL_BASE + POSITIONS[position]["valeur"] * 1.2
    if evasion_ratee:
        t += 3.0           # il s'accroche, le temps passe
    return t


def rythme(f1, f2):
    """
    A quelle cadence les coups partent.
    Le rythme se subit autant qu'il se dicte : un mitrailleur impose sa cadence,
    mais un adversaire econome la fait retomber. On pondere donc les deux,
    et la fatigue ralentit tout le monde en fin de combat.
    """
    # ALLURE (gameplan) : le curseur d'economie d'energie. 1.0 = rythme
    # naturel ; 0.85 = gestion de championnat (5 rounds) ; >1 = tout donner
    # tot. AUCUNE taxe artificielle : l'allure augmente la cadence, donc le
    # NOMBRE d'actions, donc la depense reelle — et fatigue_factor fait
    # payer la fin de combat. Celui qui part a 1.15 sur un 5 rounds doit
    # finir tot ou mourir au championship round : c'est le design voulu.
    v1 = f1.striking.volume * f1.fatigue_factor() * f1.gameplan.get("allure", 1.0)
    v2 = f2.striking.volume * f2.fatigue_factor() * f2.gameplan.get("allure", 1.0)
    moyen = (max(v1, v2) * 0.65 + min(v1, v2) * 0.35)
    return 0.50 + moyen / 100


def taille_combinaison(f):
    """
    On ne lance pas un coup isole : on enchaine.
    Un combattant a 90 en enchainements sort des series de 3-4 coups.
    """
    base = 1 + f.striking.enchainements / 42        # ~2.2 a 50, ~3.1 a 90
    base *= f.fatigue_factor()
    n = int(base)
    if random.random() < base - n:
        n += 1
    return max(1, min(5, n))


def simuler_round(f1, f2, num, log, duree=DUREE_ROUND):
    # Le rythme depend de la categorie : les lourds echangent moins souvent
    vm = (f1.div.get("volume_mod", 1.0) + f2.div.get("volume_mod", 1.0)) / 2
    log.append(f"\n──────── ROUND {num} ────────")
    f1.reset_round_stats()
    f2.reset_round_stats()
    # Une minute assis, l'entraineur qui parle : on redescend, sans effacer.
    f1.chaos *= 0.45
    f2.chaos *= 0.45
    # Le coin lui remet le plan en tete : il repart moins decourage qu'il
    # n'a fini le round. Sans ca, trois entrees ratees au round 1 le
    # neutralisaient jusqu'a la cloche finale.
    f1.td_echecs = int(f1.td_echecs * 0.4)
    f2.td_echecs = int(f2.td_echecs * 0.4)
    if TELEMETRY:
        TELEMETRY["n_rounds"] += 1

    etat = {"phase": DEBOUT, "cage": CENTRE, "acculé": None,
            "position": None, "top": None, "temps": 0.0}

    t = 0.0
    garde = 0
    while t < duree:
        # --- Changement de garde eventuel ---
        for f in (f1, f2):
            sw, raison = veut_switcher(f.stance, f.legs, f.mental.fight_iq)
            if sw:
                f.stance.switch()
                log.append(f"    [garde] {f.name} passe en {f.stance.garde_actuelle} — {raison}")

        f1.recuperer_sonne()
        f2.recuperer_sonne()

        phase_avant = etat["phase"]
        pos_avant = etat["position"]

        if etat["phase"] == DEBOUT:
            cadence = max(0.5, vm * rythme(f1, f2))
            etat["cadence"] = cadence
            v = phase_debout(f1, f2, etat, log)
            dt = T_FRAPPE_BASE / cadence
            # Un changement de phase signale une entree en lutte ou un clinch
            if etat["phase"] == SOL:
                dt = T_TAKEDOWN
            elif etat["phase"] == CLINCH:
                dt = 2.0
        elif etat["phase"] == CLINCH:
            v = phase_clinch(f1, f2, etat, log)
            dt = T_CLINCH
        else:
            avant_top = etat["top"]
            dmg_avant = f1.rs["damage"] + f2.rs["damage"]
            v = phase_sol(f1, f2, etat, log)
            evasion_ratee = (etat["phase"] == SOL and etat["position"] == pos_avant
                             and etat["top"] == avant_top)
            dt = temps_sol(pos_avant or "half_guard", evasion_ratee)

            # --- Relance de l'arbitre ---
            # Rien ne bouge, rien ne fait mal : l'arbitre remet debout.
            # C'est le principal regulateur du temps au sol dans un vrai combat.
            rien_ne_bouge = (evasion_ratee
                             and (f1.rs["damage"] + f2.rs["damage"]) - dmg_avant < 3)
            etat["stall"] = etat.get("stall", 0.0) + dt if rien_ne_bouge else 0.0
            if etat["stall"] >= SEUIL_RELANCE and etat["phase"] == SOL:
                etat["phase"] = DEBOUT
                etat["top"] = None
                etat["position"] = None
                etat["stall"] = 0.0
                log.append("    [arbitre] combat arrete au sol, relance debout")
                if TELEMETRY:
                    TELEMETRY["n_relances"] += 1

        t += dt
        etat["temps"] = t
        if TELEMETRY and phase_avant != SOL and etat["phase"] == SOL:
            TELEMETRY["sequences_sol"] += 1
        if TELEMETRY:
            lab = ("debout" if phase_avant == DEBOUT
                   else ("clinch" if phase_avant == CLINCH else "sol"))
            TELEMETRY["t_" + lab] += dt
            TELEMETRY["n_" + lab] += 1
            TELEMETRY["t_total"] += dt
        # TEMPO : le cout d'exister dans la cage. A 0.12/dt il pesait 76
        # points par combat — plus que tout le striking (46) — et vidait le
        # reservoir a lui seul : 69% des combattants a zero des la fin du
        # R1, mediane 0.000. Aucune stat, aucun choix tactique ne peut peser
        # quand tout le monde est au plancher. On le divise par 3 : il reste
        # un fond de depense (25 pts/combat) mais le budget respire.
        f1.depenser(TEMPO_CARDIO * dt, poste="tempo")
        f2.depenser(TEMPO_CARDIO * dt, poste="tempo")

        # Le temps passe au sol compte pour le scoring des juges
        if phase_avant == SOL and etat.get("top"):
            gagnant = f1 if etat["top"] == f1.name else f2
            gagnant.rs["temps_controle"] = gagnant.rs.get("temps_controle", 0) + dt

        if v:
            return v, round(t)

    return None, round(t)


def points_du_round(w, l):
    r"""Points concedes par le PERDANT du round : 9 par defaut, 8 si domination
    ecrasante.

    /!\ POURQUOI CETTE FONCTION EXISTE (bascule du 08/08, mesure a l'appui)
    L'ancien critere etait `ecart de degats >= 45 -> 10-8`. Sur 882 rounds
    mesures, il produisait 85% de 10-8 la ou le MMA reel en compte 5 a 10%,
    et la carte la plus frequente etait 30-24 (58% des decisions). 45 points
    d'ecart sur des rounds a 200-300 de degats, c'est du bruit : l'ecart
    MEDIAN entre les deux combattants est de 169.
    Aucun seuil ABSOLU ne rattrape ca (240 laissait encore 33%). Il faut un
    critere RELATIF, et l'exigence d'un vrai marqueur d'impact, comme les
    juges : un knockdown, ou un round a sens unique.

    /!\ CE QU'ON NE PEUT PAS DESCENDRE PLUS BAS : 30,8% des rounds du moteur
    presentent un ecart de knockdown, 10,5% en presentent deux. Le taux de
    knockdown est le PLANCHER de toute regle qui s'y appuie. Il est environ
    3x celui du MMA reel — mais il est PORTEUR du calibrage gele (les
    knockdowns alimentent l'arret de l'arbitre, donc la repartition
    KO/TKO/SUB/DEC). On ne le touche pas ici. Resultat : 10,3% de 10-8, le
    haut de la fourchette reelle. Le residu vient du taux de knockdown, pas
    de cette regle.

    Le VAINQUEUR du round n'est pas touche par cette fonction : la cascade
    degats -> knockdown -> controle -> agressivite reste identique.
    """
    kd = w.rs["knockdowns"] - l.rs["knockdowns"]
    ratio = w.rs["damage"] / max(1, l.rs["damage"])
    ecart = w.rs["damage"] - l.rs["damage"]
    if kd >= 2 and ratio >= 4:
        return 8                                    # round de massacre
    if kd >= 1 and ratio >= 30 and ecart >= 450:
        return 8                                    # sens unique + chute
    return 9


def scorer_round(f1, f2):
    """Cascade : dégâts significatifs → contrôle/grappling → agressivité."""
    # Degats d'abord, controle si egalite, agressivite ensuite : c'est bien la
    # hierarchie des criteres. Un lutteur qui domine doit prendre le round SUR
    # LES DEGATS, en frappant au sol — pas parce qu'on lui offre du credit
    # pour du temps de controle passif.
    d1, d2 = f1.rs["damage"], f2.rs["damage"]
    if abs(d1 - d2) >= 6:
        w, l = (f1, f2) if d1 > d2 else (f2, f1)
        return w, l, points_du_round(w, l), "dégâts"

    # Un knockdown est un marqueur d'impact majeur : il tranche avant tout le reste
    kd1, kd2 = f1.rs["knockdowns"], f2.rs["knockdowns"]
    if kd1 != kd2:
        w, l = (f1, f2) if kd1 > kd2 else (f2, f1)
        ecart = abs(kd1 - kd2)
        return w, l, points_du_round(w, l), f"knockdown x{ecart}"

    c1 = f1.rs["control"] + f1.rs["td_landed"] * 2 + f1.rs["sub_attempts"] * 2
    c2 = f2.rs["control"] + f2.rs["td_landed"] * 2 + f2.rs["sub_attempts"] * 2
    if abs(c1 - c2) >= 3:
        w, l = (f1, f2) if c1 > c2 else (f2, f1)
        return w, l, points_du_round(w, l), "contrôle"

    a1 = f1.rs["sig_attempted"] + f1.rs["td_attempted"]
    a2 = f2.rs["sig_attempted"] + f2.rs["td_attempted"]
    if a1 != a2:
        w, l = (f1, f2) if a1 > a2 else (f2, f1)
        return w, l, 9, "agressivité"

    # Dernier recours : les dégâts bruts, même infimes. Un round 10-10 est
    # quasiment inexistant dans la réalité, les juges finissent par trancher.
    w, l = (f1, f2) if d1 >= d2 else (f2, f1)
    return w, l, 9, "départage serré"


def simuler_combat(f1, f2, rounds=3, verbose=True):
    # Un 5 rounds ne se court pas comme un 3 rounds : sans consigne
    # explicite, un pro gere ("allure" 0.85). Le jeu (coach) pourra imposer
    # une autre allure via le gameplan — y compris tout donner R1-R2.
    for f in (f1, f2):
        f.gameplan.setdefault("allure", 1.0 if rounds <= 3 else 0.85)
    log = []
    scores = {f1.name: 0, f2.name: 0}

    for r in range(1, rounds + 1):
        vainqueur, echange = simuler_round(f1, f2, r, log)

        if vainqueur:
            log.append(f"\n>>> {vainqueur.name} gagne au round {r} (échange {echange})")
            if verbose:
                print("\n".join(log))
            return vainqueur, log

        w, l, pts, critere = scorer_round(f1, f2)
        scores[w.name] += 10
        scores[l.name] += pts
        log.append(f"\n  Bilan R{r} :")
        for f in (f1, f2):
            log.append(f"    {f.name:<14} dégâts {f.rs['damage']:>5.0f} | "
                       f"frappes {f.rs['sig_landed']}/{f.rs['sig_attempted']} | "
                       f"TD {f.rs['td_landed']}/{f.rs['td_attempted']} | "
                       f"ctrl {f.rs['control']} | cardio {f.cardio:.0f} | "
                       f"jambes {f.legs.gauche}/{f.legs.droite} | "
                       f"corps {f.body.degats_corps:.0f} | tête {f.head_damage} | KD {f.rs['knockdowns']}")
        log.append(f"    → round pour {w.name} ({10}-{pts}, {critere})")

        for f in (f1, f2):
            f.recuperer_entre_rounds()

    log.append(f"\n──────── DÉCISION ────────")
    log.append(f"  {f1.name} : {scores[f1.name]}")
    log.append(f"  {f2.name} : {scores[f2.name]}")
    if scores[f1.name] > scores[f2.name]:
        gagnant = f1
    elif scores[f2.name] > scores[f1.name]:
        gagnant = f2
    else:
        gagnant = None
    log.append(f"  >>> {'Match nul' if not gagnant else gagnant.name + ' l emporte aux points'}")

    if verbose:
        print("\n".join(log))
    return gagnant, log
