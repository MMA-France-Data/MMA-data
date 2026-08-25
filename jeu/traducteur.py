"""
traducteur.py — le log du moteur devient une chronologie jouable par l'ecran.

Le moteur parle en ETATS (centre, accule, clinch, montee), l'ecran parle en
POSITIONS. Le traducteur met en scene : il choisit un point d'ancrage a la
grille quand quelqu'un est accule, fusionne les points au sol, ramene tout
au centre a la reprise. Il horodate en repartissant le temps du round entre
les actions, cumule les stats en direct, et marque les temps forts (takedown,
knockdown, soumission, fin) comme ralentis.

REGLE ABSOLUE : l'ecran ne raconte QUE ce que le moteur a tire. Aucun
evenement invente, aucun supprime. La mise en scene ne touche qu'aux x,y.

Usage :
    python3 traducteur.py            # un combat brawler vs lutteur -> JSON
    traduire(log, nomA, nomB)        # depuis un autre script
"""

import json
import math
import random
import re

R_CAGE = 148          # rayon interieur de l'octogone cote ecran
CENTRE = (180, 180)


def _bord(angle, retrait=18):
    """Un point pres de la grille, a cet angle."""
    r = R_CAGE - retrait
    return (CENTRE[0] + r * math.cos(angle), CENTRE[1] + r * math.sin(angle))


def _autour(p, d=36, angle=None):
    a = angle if angle is not None else random.uniform(0, 2 * math.pi)
    return (p[0] + d * math.cos(a), p[1] + d * math.sin(a))


POS_SOL = {"closed_guard": "GARDE FERMÉE", "open_guard": "GARDE OUVERTE",
           "half_guard": "DEMI-GARDE", "side_control": "CONTRÔLE LATÉRAL",
           "mount": "MONTÉE", "back": "PRISE DE DOS", "turtle": "TORTUE",
           "butterfly": "GARDE PAPILLON"}

SUBS = {"guillotine": "guillotine", "rear_naked": "étranglement arrière",
        "armbar": "clé de bras", "triangle": "triangle", "kimura": "kimura",
        "americana": "americana", "anaconda": "anaconda", "darce": "d'arce",
        "heel_hook": "heel hook", "guillotine_debout": "guillotine"}

# --- CLINCH (clinch.py) --------------------------------------------------
PRISES_FR = {"neutre": "prise neutre", "over_under": "over-under",
             "double_under": "double sous-crochet", "collar_tie": "prise de nuque",
             "thai_plum": "plum thaï", "back_clinch": "dos pris"}

ARMES_CLINCH = {"genou_cuisse": ("genou dans la cuisse", "j"),
                "petit_corps": ("coups courts au corps", "c"),
                "short_hook": ("crochet court", "t"),
                "knee": ("genou au corps", "c"),
                "knee_head": ("genou à la tête", "t"),
                "elbow": ("coude", "t")}

SORTIES_FR = {"frame_push": "cadre et repousse", "pummel_out": "repummèle",
              "spin_out": "pivote", "duck_under": "passe sous le bras",
              "wall_walk": "remonte le long de la grille",
              "underhook_up": "cherche le sous-crochet"}

# Les prises de lutte tentees DEPUIS le clinch (clinch.py, action ...)
LUTTE_CLINCH = {"body_lock_attempt": "ceinture", "trip_attempt": "balayage",
                "throw_attempt": "projection", "mat_return": "retour au tapis"}


def traduire(log, nomA, nomB, secondes_round=300, graine=7):
    """log -> liste d'etapes {t, a, b, ph, com, ...} pour l'ecran."""
    rng = random.Random(graine)
    E = []                       # etapes de sortie
    V = {"st": [0, 0, 0, 0], "tdA": [0, 0], "tdB": [0, 0],
         "subA": 0, "subB": 0}
    dmg_niv = {}

    # -- decoupage par round pour horodater --------------------------------
    rounds, cour = [], []
    for l in log:
        if "ROUND" in l and "───" in l:
            if cour: rounds.append(cour)
            cour = []
        else:
            cour.append(l.strip())
    if cour: rounds.append(cour)

    # -- etat de mise en scene ---------------------------------------------
    etat = {"mode": "distance", "ancre": rng.uniform(0, 2 * math.pi),
            "accule": None, "sol_top": None}
    pos = {"A": _autour(CENTRE, 34, math.pi), "B": _autour(CENTRE, 34, 0)}

    def qui(l):
        if l.startswith(nomA): return "A", "B"
        if l.startswith(nomB): return "B", "A"
        return None, None

    def placer():
        """Traduit l'etat courant en positions x,y."""
        if etat["mode"] == "sol" or etat["mode"] == "clinch":
            if etat["accule"]:
                p = _bord(etat["ancre"], 26)
            else:
                p = _autour(CENTRE, rng.uniform(0, 46))
            pos["A"] = p
            pos["B"] = (p[0] + 3, p[1] + 3)
        elif etat["accule"]:
            mur = _bord(etat["ancre"])
            dedans = _autour(mur, 30, etat["ancre"] + math.pi)
            if etat["accule"] == "A": pos["A"], pos["B"] = mur, dedans
            else:                     pos["B"], pos["A"] = mur, dedans
        else:
            c = _autour(CENTRE, rng.uniform(0, 40))
            a = rng.uniform(0, 2 * math.pi)
            pos["A"] = _autour(c, 30, a)
            pos["B"] = _autour(c, 30, a + math.pi)

    def _clinch(l):
        """Une ligne vient-elle de clinch.py ? Sa signature est la fleche ASCII."""
        return ("->" in l or l.startswith("=>")
                or "prend le contrôle du clinch" in l or "pummele sans gain" in l)

    def _frappe_clinch(Xc, arme, dmg, sig):
        """Comptabilise un coup de clinch et rend (commentaire, cle_degats)."""
        iX = 0 if Xc == "A" else 2
        V["st"][iX + 1] += 1                       # une tentative, toujours
        if sig:
            V["st"][iX] += 1                       # = stats[nom]["sig"] du moteur
        lib, zone = ARMES_CLINCH.get(arme, (arme.replace("_", " "), "c"))
        cle = ("B" if Xc == "A" else "A") + zone
        return lib, (cle if (sig and dmg) else None)

    def _traiter_clinch(l, t):
        """True si la ligne est consommee. False = laisser passer aux regles suivantes."""
        # le takedown depuis le clinch reste gere par la regle de lutte
        if "RÉUSSI, combat au sol" in l:
            return False

        sig = "[SIG]" in l
        X, _ = qui(l)

        m = re.match(r"(\S+) prend le contrôle du clinch \((\w+)\)", l)
        if m:
            Xc = "A" if m.group(1) == nomA else "B"
            etat.update(mode="clinch")
            etape(t, ph="CLINCH", chaud=1, ctrl=Xc,
                  com=f"{m.group(1).title()} prend le contrôle — {PRISES_FR.get(m.group(2), m.group(2))}.")
            return True

        # rupture offensive : clinch.py compte TOUJOURS ce coup en sig, et il
        # n'est PAS marque [SIG]. Ne pas se fier au marqueur ici.
        m = re.match(r"(\S+) rompt et place (\w+) -> (\S+) \((\d+)\)", l)
        if m and X:
            lib, cle = _frappe_clinch(X, m.group(2), int(m.group(4)), True)
            etat.update(mode="distance")
            etape(t, ph="DISTANCE", chaud=1, flash=1, ctrl="",
                  com=f"Il casse la prise et place {lib} en sortant !",
                  dmg={cle: 1} if cle else None, st=list(V["st"]))
            if cle: dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
            V["st"] = [0, 0, 0, 0]
            return True

        m = re.match(r"(\S+) rompt et tente (\w+) ->", l)
        if m and X:
            _frappe_clinch(X, m.group(2), 0, False)
            etat.update(mode="distance")
            etape(t, ph="DISTANCE", ctrl="", com="Il rompt la prise et lance en sortant — à côté.")
            return True

        m = re.match(r"(\S+) casse le clinch \((\w+)\)", l)
        if m:
            etat.update(mode="distance")
            etape(t, ph="DISTANCE", ctrl="",
                  com=f"{m.group(1).title()} relâche la prise et remet de la distance.")
            return True

        m = re.match(r"(\S+) tente (\w+) -> (\w+)", l)
        if m and X and m.group(2) in SORTIES_FR:
            reussi = m.group(3) == "réussi"
            if reussi:
                etat.update(mode="distance")
            etape(t, ph="DISTANCE" if reussi else "CLINCH", ctrl="" if reussi else None,
                  com=(f"{m.group(1).title()} {SORTIES_FR[m.group(2)]} — il se dégage !" if reussi
                       else f"{m.group(1).title()} {SORTIES_FR[m.group(2)]} — ça ne vient pas."))
            return True

        if l.startswith("=>") and "passe dans le dos" in l:
            m = re.match(r"=> (\S+) passe dans le dos", l)
            Xc = "A" if m.group(1) == nomA else "B"
            etape(t, ph="CLINCH", chaud=1, slow=1, ctrl=Xc,
                  com=f"{m.group(1).title()} tourne autour et PASSE DANS LE DOS !")
            return True

        m = re.match(r"(\S+) riposte (\w+) -> (\d+)", l)
        if m and X:
            lib, cle = _frappe_clinch(X, m.group(2), int(m.group(3)), sig)
            if cle: dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
            etape(t, ph="CLINCH", chaud=1 if sig else None, flash=1 if sig else None,
                  com=f"Il riposte dans la prise — {lib} !" if sig else None,
                  dmg={cle: 1} if cle else None, st=list(V["st"]))
            V["st"] = [0, 0, 0, 0]
            return True

        m = re.match(r"(\S+) améliore sa prise -> (\w+)", l)
        if m:
            Xc = "A" if m.group(1) == nomA else "B"
            etape(t, ph="CLINCH", chaud=1, ctrl=Xc,
                  com=f"{m.group(1).title()} pummèle et améliore — {PRISES_FR.get(m.group(2), m.group(2))}.")
            return True

        if "pummele sans gain" in l:
            etape(t, ph="CLINCH", com="Ça pummèle contre la grille, personne ne prend l'avantage.")
            return True

        m = re.match(r"(\S+) snap down -> (.+)", l)
        if m:
            resiste = "résisté" in m.group(2)
            etape(t, ph="CLINCH", chaud=None if resiste else 1,
                  com=(f"{m.group(1).title()} tente le snap down — posture tenue."
                       if resiste else f"Snap down ! {m.group(1).title()} le casse en deux."))
            return True

        m = re.match(r"(\S+) (\w+) -> stoppé", l)
        if m and X and m.group(2) in LUTTE_CLINCH:
            V["td" + X][1] += 1
            etape(t, ph="CLINCH", com=f"{LUTTE_CLINCH[m.group(2)]} de {m.group(1).title()} — repoussée !",
                  **{"td" + X: [0, 1]})
            V["td" + X] = [0, 0]
            return True

        # frappe de clinch ordinaire : "X arme -> res (dmg)[ SIG]"
        m = re.match(r"(\S+) (\w+) -> (\S+) \((\d+)\)", l)
        if m and X and m.group(2) in ARMES_CLINCH:
            d = int(m.group(4))
            lib, cle = _frappe_clinch(X, m.group(2), d, sig)
            if cle: dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
            etape(t, ph="CLINCH", chaud=1 if sig else None, flash=1 if sig else None,
                  com=f"{lib.capitalize()} dans la prise — ça fait mal !" if sig else None,
                  dmg={cle: 1} if cle else None, st=list(V["st"]))
            V["st"] = [0, 0, 0, 0]
            return True

        return False

    def etape(t, **kw):
        placer()
        e = {"t": round(t, 1),
             "a": [round(pos["A"][0]), round(pos["A"][1])],
             "b": [round(pos["B"][0]), round(pos["B"][1])]}
        e.update({k: v for k, v in kw.items() if v is not None})
        E.append(e)

    # -- lecture ------------------------------------------------------------
    t_abs = 0.0
    fin = None

    # COUP DE GONG. Sans lui, la premiere etape peut tomber a t=56s et l'ecran
    # affiche "X coupe la cage" des la premiere seconde. C'est de la mise en
    # scene pure (aucun evenement invente), meme categorie que les x,y.
    etape(0.0, ph="DISTANCE", rd=1,
          com="Les deux hommes touchent les gants. C'est parti.")
    for i_rd, lignes in enumerate(rounds):
        if fin: break
        pas = secondes_round / max(1, len(lignes))
        # reprise : tout le monde au centre, frais de coin
        etat.update(mode="distance", accule=None, sol_top=None)
        if i_rd:
            etape(t_abs, ph="DISTANCE", rd=i_rd + 1,
                  com=f"Round {i_rd + 1}. Les coins ont parlé, on repart.")
        for l in lignes:
            t_abs += pas
            X, Y = qui(l)

            # ---- la cage ----
            if "[cage]" in l:
                if "accule" in l:
                    m = re.match(r"\[cage\] (\S+) accule (\S+)", l)
                    if m:
                        etat["accule"] = "A" if m.group(2) == nomA else "B"
                        etat["ancre"] = rng.uniform(0, 2 * math.pi)
                        nom = nomA if etat["accule"] == "A" else nomB
                        autre = nomB if etat["accule"] == "A" else nomA
                        etape(t_abs, ph="ACCULÉ — GRILLE", chaud=1,
                              com=f"{autre.title()} coupe la cage — {nom.title()} a le dos à la grille.")
                elif "dégage" in l:
                    etat["accule"] = None
                    etape(t_abs, ph="DISTANCE",
                          com=f"{l.split(']')[1].split(' se')[0].strip().title()} pivote et ressort vers le centre.")
                continue

            # ---- frappes ----
            m = re.match(r"(\S+) (\w+) → touché \((\d+)\) (\w+)", l)
            if m and X:
                arme, d, zone = m.group(2), int(m.group(3)), m.group(4)
                iX = 0 if X == "A" else 2
                V["st"][iX] += 1; V["st"][iX + 1] += 1
                cible = ("t" if zone == "tête" else "j" if "jambe" in l else "c")
                cle = ("B" if X == "A" else "A") + cible
                gros = d >= 6
                if gros or rng.random() < 0.30:
                    dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
                    com = (f"{arme.replace('_',' ').title()} de {(nomA if X=='A' else nomB).title()} qui passe fort !"
                           if gros else None)
                    etape(t_abs, ph=("ACCULÉ — GRILLE" if etat["accule"] else
                                     "SOL" if etat["mode"] == "sol" else "DISTANCE"),
                          chaud=1 if (gros or etat["accule"]) else None,
                          com=com, dmg={cle: 1}, flash=1 if gros else None,
                          st=list(V["st"])) ; V["st"] = [0, 0, 0, 0]
                continue
            m = re.match(r"(\S+) (\w+) → manqué", l)
            if m and X:
                V["st"][(0 if X == "A" else 2) + 1] += 1
                continue

            # LE CONTRE. La ligne commence par "!!!" donc qui() renvoie None :
            # elle passait a travers toutes les regles. Le moteur, lui, la
            # compte (engine.py:637-639 : sig_landed +1, damage +d). L'ecran
            # perdait ~4 frappes significatives par combat.
            m = re.match(r"!!! (\S+) CONTRE le (\w+) de (\S+) \((\d+)\)", l)
            if m:
                Xc = "A" if m.group(1) == nomA else "B"
                iX = 0 if Xc == "A" else 2
                V["st"][iX] += 1; V["st"][iX + 1] += 1
                cle = ("B" if Xc == "A" else "A") + "t"
                dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
                arme = m.group(2).replace("_", " ")
                etape(t_abs, ph=("ACCULÉ — GRILLE" if etat["accule"] else "DISTANCE"),
                      chaud=1, flash=1, dmg={cle: 1}, st=list(V["st"]),
                      com=f"CONTRE ! {(nomA if Xc=='A' else nomB).title()} le cueille sur son {arme} !")
                V["st"] = [0, 0, 0, 0]
                continue

            # ---- LE CLINCH ----------------------------------------------
            # clinch.py ecrit avec la fleche ASCII "->", pas "→". C'est pour
            # ca que TOUT le clinch passait a travers depuis le debut.
            # Ses coups significatifs sont deja marques "[SIG]" (clinch.py
            # :425-426, :398-399) et c'est exactement ce que le moteur verse
            # dans rs["sig_landed"] (engine.py:899) : on peut donc les
            # compter EXACTEMENT, sans rien changer au moteur.
            if _clinch(l):
                if _traiter_clinch(l, t_abs):
                    continue

            # ---- lutte ----
            if "RÉUSSI, combat au sol" in l and X:
                V["td" + X][0] += 1; V["td" + X][1] += 1
                p = re.search(r"\((\w+)\)", l)
                etat.update(mode="sol", sol_top=X)
                etape(t_abs, ph="TAKEDOWN", chaud=1, slow=1, flash=1,
                      com=f"{(nomA if X=='A' else nomB).title()} l'emmène au sol !",
                      sol=POS_SOL.get(p.group(1), "AU SOL") if p else "AU SOL",
                      **{"td" + X: [1, 1]}, ctrl=X)
                V["td" + X] = [0, 0]
                continue
            if "→ stoppé" in l and X and ("leg" in l or "body_lock" in l or "trip" in l or "throw" in l):
                V["td" + X][1] += 1
                etape(t_abs, ph=("ACCULÉ — GRILLE" if etat["accule"] else "DISTANCE"),
                      com=f"Entrée de {(nomA if X=='A' else nomB).title()} — repoussée !",
                      **{"td" + X: [0, 1]})
                V["td" + X] = [0, 0]
                continue
            if "engage le clinch" in l and X:
                etat.update(mode="clinch")
                etape(t_abs, ph="CLINCH", com=f"{(nomA if X=='A' else nomB).title()} ferme la distance, clinch.")
                continue
            if "casse le clinch" in l or "séparés" in l:
                etat.update(mode="distance")
                etape(t_abs, ph="DISTANCE", com="Ils se séparent.")
                continue

            # ---- le sol ----
            m = re.match(r"(\S+) (\w+) → maintenu en (\w+)", l)
            if m and etat["mode"] == "sol":
                etape(t_abs, ph="SOL", sol=POS_SOL.get(m.group(3), "AU SOL"),
                      com=f"{m.group(1).title()} pousse — écrasé, ça ne sort pas.")
                continue
            if "se relève, retour debout" in l:
                etat.update(mode="distance", sol_top=None)
                etape(t_abs, ph="DISTANCE", slow=1, sol="", ctrl="",
                      com="Il recrée l'espace et se relève ! Retour debout.")
                continue
            m = re.match(r"(\S+) progresse → (\w+)", l)
            if m:
                etape(t_abs, ph="SOL", sol=POS_SOL.get(m.group(2), "AU SOL"),
                      com=f"{m.group(1).title()} passe en {POS_SOL.get(m.group(2),'').lower()}.")
                continue
            if "ground and pound" in l and X:
                # engine.py expose desormais "→ {touches}/{tentes} coups, {d}
                # dégâts". Une rafale, ce sont PLUSIEURS frappes : les compter
                # une seule fois perdait 41% des frappes du combat.
                iX = 0 if X == "A" else 2
                mg = re.search(r"→ (\d+)/(\d+) coups", l)
                if mg:
                    V["st"][iX] += int(mg.group(1))
                    V["st"][iX + 1] += int(mg.group(2))
                elif "dégâts" not in l:
                    # G&P entierement bloque : une tentative, aucun coup.
                    V["st"][iX + 1] += 1
                    continue
                else:                       # log d'avant le patch
                    V["st"][iX] += 1; V["st"][iX + 1] += 1
                cle = ("B" if X == "A" else "A") + "t"
                if rng.random() < 0.4:
                    dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
                    etape(t_abs, ph="SOL", dmg={cle: 1}, st=list(V["st"]))
                    V["st"] = [0, 0, 0, 0]
                continue

            # ---- renversements (engine.py:728 et :857) ----
            m = re.match(r"(\S+) (\w+) → CONTRÉ, (\S+) prend le dessus", l)
            if m and X:
                V["td" + X][1] += 1
                Y = "B" if X == "A" else "A"
                etat.update(mode="sol", sol_top=Y)
                etape(t_abs, ph="TAKEDOWN", chaud=1, slow=1, flash=1, ctrl=Y,
                      com=f"Entrée contrée ! {m.group(3).title()} inverse et prend le dessus !",
                      sol="AU SOL", **{"td" + X: [0, 1]})
                V["td" + X] = [0, 0]
                continue
            m = re.match(r">>> RENVERSEMENT, (\S+) prend le dessus", l)
            if m:
                Y = "A" if m.group(1) == nomA else "B"
                etat.update(sol_top=Y)
                etape(t_abs, ph="SOL", chaud=1, slow=1, ctrl=Y,
                      com=f"RENVERSEMENT ! {m.group(1).title()} balaie et passe dessus !")
                continue

            # ---- soumissions ----
            # /!\ Les finitions arrivent sur DEUX lignes :
            #   "X tente guillotine_debout → SOUMISSION"
            #   "*** Y tape ! guillotine_debout ***"
            m = re.search(r"(?:tente|attaque) (\w+)", l)
            if m and X and ("défendue" in l or "SOUMISSION" in l):
                V["sub" + X] += 1
                nom_sub = SUBS.get(m.group(1), m.group(1).replace("_", " "))
                if "SOUMISSION" in l:
                    fin = ("SOUMISSION", X, nom_sub)
                    etape(t_abs, ph="SOUMISSION", chaud=1, slow=1, flash=1,
                          com=f"IL TAPE ! {nom_sub.title()} — c'est terminé !",
                          **{"sub" + X: 1})
                    break
                etape(t_abs, ph="SOUMISSION", chaud=1, slow=1,
                      com=f"{(nomA if X=='A' else nomB).title()} attaque la {nom_sub} — défendue !",
                      **{"sub" + X: 1})
                continue
            m = re.match(r"\*\*\* (\S+) tape ! (\w+)", l)
            if m:
                perdant = "A" if m.group(1) == nomA else "B"
                gagnant = "B" if perdant == "A" else "A"
                nom_sub = SUBS.get(m.group(2), m.group(2).replace("_", " "))
                fin = ("SOUMISSION", gagnant, nom_sub)
                etape(t_abs, ph="SOUMISSION", chaud=1, slow=1, flash=1,
                      com=f"IL TAPE ! {nom_sub.title()} — c'est terminé !",
                      **{"sub" + gagnant: 1})
                break

            # ---- knockdowns et fins ----
            if "KNOCKDOWN" in l:
                Xk = "A" if nomA in l else "B"
                cle = Xk + "t"
                dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
                etape(t_abs, ph="KNOCKDOWN", chaud=1, slow=1, flash=1,
                      com=f"KNOCKDOWN ! {(nomA if Xk=='A' else nomB).title()} s'écroule !",
                      dmg={cle: 1}, kd=Xk)
                continue
            if "KO SEC" in l:
                Xk = "A" if re.search(nomA + r" est eteint|! " + nomA, l) else "B"
                fin = ("KO", "B" if Xk == "A" else "A", None)
                etape(t_abs, ph="KO", chaud=1, slow=1, flash=1,
                      com="KO SEC ! Il est éteint — plus besoin d'arbitre.")
                break
            # --- LES FINS QUI NE DISENT PAS "arrete" ---
            # Audit sur 200 combats : QUATRE lignes *** terminent un combat,
            # une seule etait traduite. Les trois autres tombaient dans le
            # filet generique et s'affichaient "ARRÊT".
            m = re.match(r"\*\*\* (\S+) tombe sur le contre", l)
            if m:
                # engine.py:641 — resultat_impact_tete() == "ko". C'est un KO.
                perd = "A" if m.group(1) == nomA else "B"
                gagne = "B" if perd == "A" else "A"
                fin = ("KO", gagne, "sur le contre")
                etape(t_abs, ph="KO", chaud=1, slow=1, flash=1,
                      com=f"IL LE PREND SUR LE CONTRE ! {(nomA if gagne=='A' else nomB).title()} l'éteint sur sa relance !")
                break
            m = re.match(r"\*\*\* TKO AU CORPS ! (\S+) s effondre", l)
            if m:
                perd = "A" if m.group(1) == nomA else "B"
                # PAS de +1 ici, contrairement au TKO "ne repond plus" :
                # engine.py:494 ecrit la ligne "→ touché ({reel}) foie" AVANT
                # le return (le return est DANS la branche zone == "corps").
                # Le coup est donc deja compte par la regle de frappe normale.
                # Erreur commise puis mesurée : graine 64, ecran 8 pour 7.
                cle = perd + "c"
                dmg_niv[cle] = dmg_niv.get(cle, 0) + 1
                fin = ("TKO", "B" if perd == "A" else "A", "coup au foie")
                etape(t_abs, ph="TKO", chaud=1, slow=1, flash=1, dmg={cle: 1},
                      com="AU FOIE ! Il plie en deux — il ne se relèvera pas.")
                break
            m = re.match(r"\*\*\* TKO AU SOL ! (\S+) finit", l)
            if m:
                # /!\ ici le nom est celui du VAINQUEUR (top), pas du perdant.
                gagne = "A" if m.group(1) == nomA else "B"
                fin = ("TKO", gagne, "ground and pound")
                etape(t_abs, ph="TKO", chaud=1, slow=1, flash=1,
                      com="L'arbitre se jette entre eux — fini au sol !")
                break
            if "TKO" in l and "arrete" in l.replace("ê", "e"):
                Xk = "A" if nomA in l else "B"
                # Le coup qui FINIT credite sig_landed (engine.py:472) puis la
                # branche d'arret fait `return` AVANT d'ecrire sa ligne
                # "→ touché" (engine.py:478-483). Le coup de grace n'existe
                # nulle part dans le log : on le rend au vainqueur, sinon
                # l'ecran est a -1 frappe sur tous les TKO de ce type.
                V["st"][0 if Xk == "B" else 2] += 1
                V["st"][(0 if Xk == "B" else 2) + 1] += 1
                fin = ("TKO", "B" if Xk == "A" else "A", None)
                etape(t_abs, ph="TKO", chaud=1, slow=1, flash=1,
                      com="L'arbitre se jette entre eux ! C'est fini !")
                break
            # ---- decision aux points ----
            # engine.py:1153 -> "  >>> Match nul"
            #                ou "  >>> {nom} l emporte aux points"
            if l.startswith(">>> Match nul"):
                fin = ("DÉCISION", None, "nul")
                etape(t_abs, ph="DÉCISION", chaud=1,
                      com="Les cartes des juges : match nul.")
                break
            m = re.match(r">>> (\S+) l emporte aux points", l)
            if m:
                gagnant = "A" if m.group(1) == nomA else "B"
                fin = ("DÉCISION", gagnant, None)
                etape(t_abs, ph="DÉCISION", chaud=1,
                      com="Ça ira aux cartes des juges.")
                break

            # filet de securite : le marqueur de fin du moteur
            m = re.match(r">>> (\S+) gagne au round", l)
            if m:
                gagnant = "A" if m.group(1) == nomA else "B"
                if not fin:
                    fin = ("ARRÊT", gagnant, None)
                    etape(t_abs, ph="FIN", chaud=1, slow=1,
                          com="C'est terminé !")
                break

    if not fin:
        fin = ("DÉCISION", None, None)
    # Les frappes accumulees depuis la derniere etape emise n'etaient jamais
    # versees : le tableau final perdait la fin du combat.
    E.append({"t": round(t_abs + 4, 1), "fin": 1,
              **({"st": list(V["st"])} if any(V["st"]) else {})})

    # -- momentum : le moteur ne le dit pas, on le DERIVE des evenements ----
    m = 50.0
    # /!\ `ctrl` n'est POSE qu'a l'etape du takedown et retire a l'etape du
    # retour debout — il n'est pas repete sur les etapes de sol intermediaires.
    # En lisant e["ctrl"] directement, le controle ne comptait QU'UNE FOIS par
    # sequence au lieu de peser pendant toute sa duree : un homme domine trois
    # minutes au sol et le momentum ne bougeait pas. On porte l'etat.
    ctrl_actif = None
    for e in E:
        if "ctrl" in e:
            ctrl_actif = e["ctrl"] or None
        if e.get("st"):
            m += (e["st"][0] - e["st"][2]) * 2.2
        if e.get("dmg"):
            for cle in e["dmg"]:
                m += -5 if cle.startswith("A") else 5
        if e.get("kd"):    m += -14 if e["kd"] == "A" else 14
        if e.get("tdA"):   m += e["tdA"][0] * 9
        if e.get("tdB"):   m -= e["tdB"][0] * 9
        if e.get("subA"):  m += 5
        if e.get("subB"):  m -= 5
        if ctrl_actif == "A": m += 3
        elif ctrl_actif == "B": m -= 3
        m = max(8.0, min(92.0, m + (50 - m) * 0.06))   # rappel doux vers 50
        e["mom"] = round(m)
    return E, fin, t_abs
