# Carnet — a traiter, dans l'ordre

## CHANTIER EN COURS (mesures sur banc reproductible, 300 combats/condition)

1. [X] TRAITE — `Fighter.retenue_lutte()` branchee dans phase_debout.
       Deux freins : la LUCIDITE (fight_iq face aux entrees stoppees) et le
       RESERVOIR (cardio). Reglage retenu : lucidite = 0.03 + iq/900,
       physique = 0.62 + 0.38*cardio, et td_echecs *= 0.4 entre les rounds
       (le coin lui remet le plan en tete).

       CE QUI EST GAGNE
         TD tentes        13.9 -> 9.0 a 10.3  (reel 2-6, encore un peu haut)
         Camp famille +10 +3.7 -> +7.4 points de victoire. Il PAIE enfin.
         Fight IQ (+30 contre -30, toutes choses egales) :
           boxeur_pressure 51.1% -> 63.3%   la stat existe enfin
           lutteur         51.1% -> 54.6%   mieux, encore faible

       CE QUI EST CASSE, ET C'EST LE POINT SUIVANT
         Le lutteur tombe de 51.8% a ~42% en toutes rondes, ecart entre
         archetypes 7.8 -> 13.3 points.
         RAISON : son archetype etait equilibre AUTOUR de la pathologie. Il
         gagnait par le VOLUME d'entrees, pas par leur qualite. En lui
         retirant le volume sans rien lui rendre, on l'a ampute.
         -> Il faut lui rendre en QUALITE ce qu'on lui a pris en QUANTITE :
            meilleure reussite d'entree (shot), ou meilleur rendement une
            fois au sol. A faire AVANT de conclure ce chantier.
         Compromis mesure entre les deux reglages :
            retenue forte : camp +8.0 mais lutteur 34.7%
            retenue moyenne (RETENUE) : camp +7.4, lutteur ~42%
            retenue faible : camp +4.3, lutteur 40%, TD tentes 9-11

   ANCIEN DIAGNOSTIC (conserve) — UNE ENTREE RATEE NE COUTE RIEN. C'est la cause racine, et elle
       recouvre les anciens chantiers 1 et 4.
       Mesure (boxeur pressure contre lutteur, 300 combats) :
         sans camp   : 44.0% de victoires | 5.1 TD encaisses sur 10.6 (48%)
         sprawl +10  : 38.7%              | 4.9 sur 11.5 (42%)
         sprawl +30  : 37.0%              | 4.3 sur 13.3 (33%)
       Il defend MIEUX (48% -> 33% de reussite adverse) et il PERD PLUS.
       Mecanisme : le lutteur compense par le VOLUME. Ses tentatives passent
       de 10.6 a 13.9, donc au final le defenseur n'encaisse que 0.8 takedown
       de moins. Rien ne limite le nombre d'entrees.
       Ce n'est PAS une histoire de temps brule : avec sprawl +30 le boxeur
       passe PLUS de temps debout (39.4% -> 42.7%) et lance PLUS de frappes
       (60.8 -> 66.0). C'est bien le taux de change qui est mauvais.
       -> En vrai, 14 entrees ratees vident un homme et se font punir.
          Corriger le COUT de l'echec (energie, position, contre) plutot que
          d'augmenter la valeur du sprawl.

2. [ ] LE CARDIO. Tout le monde finit a 0.18-0.31 de ratio. Vide. Generalise.
       Probablement lie au chantier 1 : si les entrees ratees coutaient leur
       prix, l'attaquant en tenterait moins et finirait moins vide.

3. [ ] LE FIGHT IQ EST INERTE. A +30 contre -30, toutes choses egales :
       lutteur 51.1%, boxeur_pressure 51.1%. Seul le grappler en tire
       quelque chose (63.3%). La mecanique de fiche percue en depend
       entierement : inutile de la construire tant que la stat ne pese pas.
       (lire_adversaire() et decouvrir() sont ECRITS dans engine.py mais
        NON APPELES : les rebrancher seulement apres avoir traite 1 et 3.)

## FAUX DEPARTS DE CETTE SESSION (pour se souvenir de la methode)
- "Le sol a 41% chez les moyens" : bruit, 29-30% sur trois graines.
- "Le piege du sprawl seul" : a 120 combats la decomposition disait que
  c'etait du bruit ; a 300 combats l'effet est reel. LES DEUX conclusions
  hatives etaient fausses. En dessous de 300 combats par condition, ne rien
  affirmer sur un ecart de moins de 5 points.

## BRUIT DE MESURE
5 points a 120 combats. Ne RIEN conclure en dessous.
Toujours appeler T.reinitialiser() avant une mesure (voir plus bas).

## BUG D'OUTILLAGE CORRIGE (ne pas le reintroduire)
test_raccord._id est un compteur GLOBAL, et adapter._alea() indexe son bruit
deterministe dessus. Sans remise a zero, deux executions avec la MEME graine
donnent des fiches identiques mais des combattants moteur DIFFERENTS. Toutes
les comparaisons avant/apres etaient contaminees. Corrige par
T.reinitialiser(), appele au debut de chaque mesure dans refonte.py,
test_camp.py et diagnostic.py.

---

# Avis exterieur (ChatGPT), pour memoire

1. QI de combat trop statique : un lutteur insiste apres 10 takedowns
   stoppes. -> CONVERGE avec nos mesures 3 et 4. Confirme la priorite.
2. Les styles sont rigides, un combattant ne "cree" pas son style au fil de
   sa carriere. -> idee de conception, non mesuree.
3. Les decisions des juges manquent de nuance. -> ATTENTION, CONTREDIT CE
   QU'ON A ETABLI. On a modifie le bareme pour crediter le controle, c'etait
   une rustine : la vraie cause etait le ground and pound a UN coup par
   action. Bareme actuel (degats, controle, agressivite) valide. NE PAS
   REVENIR DESSUS sans remesurer.
4. Le mental n'a pas assez de poids (confiance, pression, mene aux points,
   adversaire fatigue). -> idee de conception, a rapprocher du chantier 3.
5. Game plans limites : commencer prudemment puis accelerer, tout miser sur
   les jambes, chercher le contre, abandonner la lutte si elle echoue,
   proteger une avance. -> bonne liste, a garder pour apres le chantier 3.
   "Abandonner la lutte si elle echoue" = exactement notre chantier 4.
6. Adaptations entre les rounds : le coach devrait changer la strategie, pas
   seulement recuperer du cardio. -> se branche naturellement sur la fiche
   percue et decouvrir(), deja ecrits mais NON APPELES dans engine.py.


---

# CLOTURE DU CHANTIER 1 (session en cours)

## Ce qui a ete fait
a) `Fighter.retenue_lutte()` — il tente moins quand il gaze (cardio) et quand
   il comprend que ca ne passe pas (fight_iq). Reset partiel entre les rounds.
b) SURCOUT DE L'ECHEC : une entree stoppee coute 1.5x. Indispensable, sinon
   un lutteur SANS lecture de combat tirerait plus donc gagnerait plus — on
   punirait l'intelligence.
c) PENTE DE TAKEDOWN APLATIE : 35 + 1.5*ecart  ->  38 + 0.85*ecart.
   C'ETAIT LA CAUSE RACINE. A 1.5 par point, 30 points d'ecart faisaient
   passer de 5% a 80% : la formule saturait aux deux bouts, il n'y avait pas
   de trajet entre "j'encaisse tout" et "je stoppe tout", donc la defense de
   takedown ne s'achetait pas.
d) LUTTEUR COMPENSE (shot 26->34, clinch 22->28, controle 26->32). Avec une
   pente douce il faut plus de competence brute pour le meme resultat : il
   gagne par la QUALITE des entrees, plus par leur nombre.

## Resultats
  Taux de reussite du takedown : 45% sans camp, 40% apres un camp
    (reel : 35-45% en moyenne UFC, 25-35% contre un specialiste)
  Camp famille +10 : +9.3 points de victoire pour le defenseur
  Fight IQ (+30 contre -30) : 51.1% -> 60.0% (lutteur) et 60.5% (boxeur)
    La stat etait MORTE ce matin, elle decide des combats maintenant.
  Equilibre des archetypes : ecart 6.0 points (31.0 au debut de session)
  Decision 46.3% (reel 46.8)

## ATTENTION — LES DEUX FICHIERS VONT ENSEMBLE
engine.py (pente aplatie) et ARCHETYPES_A_COLLER.txt (lutteur renforce) sont
solidaires. Coller l'un sans l'autre desequilibre tout.

## RESTE OUVERT
- SOUMISSION 12.3% contre 19.3% reels. A baisse en meme temps que le temps
  au sol. C'est le chantier suivant le plus net.
- Gradient KO remonte a 8.1 pts (etait 5.9).
- Chantier 2 (cardio) et 3 (fiche percue) pas encore traites.


---

# CONTRE DU LUTTEUR ACCULE (implemente, a doser)

## Le principe
Mettre la pression sur un lutteur, c'est venir a lui. Dos a la grille il n'est
pas en difficulte : il guette le pas en avant pour changer de niveau. Le
moteur ne modelisait que le cas inverse (+10 a l'attaquant quand le DEFENSEUR
est accule).

## Implementation (engine.py)
Deux effets, volontairement separes :
- FREQUENCE (phase_debout, variable `guet`) : accule, le lutteur tente plus
  souvent. C'est l'essentiel — un contre est une OCCASION qui se presente.
  guet = 1 + max(0, cage_cutting_adverse - 45)/55
- REUSSITE (tenter_takedown) : petit bonus seulement.
  chance += max(0, 4 + (cage_cutting_adverse-45)*0.14 + (fight_iq-50)*0.09)

Premiere version : tout l'effet passait par la reussite -> 75% de takedowns
reussis (reel 35-45%). Corrige en transferant vers la frequence.

## Etat mesure (300 combats, 3 graines)
  lutteur contre boxeur_pressure : 50.3%   (CIBLE SOUHAITEE : 65%)
  entrees debout : 5.1 reussies sur 10.1 = 50% (reel specialiste 45-60%, OK)
  total amenees au sol : 6.1 par combat (reel 2-6, haut de fourchette)

## POUR ATTEINDRE 65% — ce qu'il faut savoir avant d'essayer
Le contre se declenche des que le lutteur est accule, donc il profite contre
TOUS les pressings, pas seulement le boxeur. Premiere tentative (bonus fort
+ shot du lutteur a 34) :
    lutteur 56.7% global, ecart entre archetypes 6.0 -> 16.0 points
    il ecrasait le brawler 23-6 et le kickeur 21-9, alors qu'il n'etait
    qu'a 18-12 contre le boxeur. LA FORME ETAIT FAUSSE.
Il a fallu retirer la compensation `shot` (34 -> 27) : elle faisait double
emploi avec le contre.
=> Pour monter a 65% sur CETTE affiche sans deformer les autres, il faut un
   levier qui ne serve QUE contre un adversaire a fort cage_cutting ET faible
   sprawl. Augmenter le `shot` ne marche pas : ca deborde partout.

## /!\ PIEGE DE MESURE CONFIRME
Le tournoi (refonte.py, 30 combats par paire) affichait lutteur 20-10 contre
le boxeur, soit 67%. La mesure a 300 combats donne 50.3%. NE JAMAIS lire une
affiche individuelle dans le tournoi : il sert a voir l'equilibre GLOBAL.
Pour une affiche precise : 300 combats minimum, plusieurs graines.

## Etat general apres ces changements
  Archetypes : kickboxeur 56.0 | grappler 52.0 | lutteur 51.3
               polyvalent 46.0 | boxeur_pressure 45.3 | brawler 45.3
               ecart 10.7 points (etait 6.0 avant le contre, 31.0 ce matin)
  Calibrage : DEC 45.0 (reel 46.8) | SUB 14.6 (19.3) | gradient KO 7.5 pts


---

# DEUX MECANIQUES AJOUTEES (fin de session)

## garde_anti_lutte(dfn)  — engine.py, Fighter
On ne s'assoit pas sur ses coups quand on craint le changement de niveau :
hanches en arriere, poids sur la jambe arriere. Ce n'est pas un choix, c'est
la posture que la menace impose. Applique sur penalite_atk dans
resolve_strike_debout.

  menace = shot_adverse/100 x cardio_adverse x (gameplan_lutte_adverse / 0.55)
  retour = 1 - min(0.20, menace x 0.16)

La menace est VIVANTE : un lutteur vide n'inquiete plus personne, et le
frappeur se lache enfin. C'est ce qui donne son sens au round 3.

## Bouclier du deplacement — engine.py, tenter_takedown
On ne tire pas sur un homme qui garde sa distance et pivote.
  chance -= (footwork_adverse - 50) x 0.16
MAIS seulement hors de la cage : dos a la grille il n'a plus de recul, le
bouclier tombe. C'est ce qui rend le brawler (qui avance en ligne droite,
footwork -12) si facile a plaquer, et le kickeur si difficile.

## Dosage : premiere version trop forte
footwork x0.30 et menace x0.26 -> kickboxeur a 60.7%, ecart 18.7 points.
Ramene a x0.16 des deux cotes.

# ETAT FINAL DE LA SESSION

## Les affiches du lutteur (300 combats, 3 graines)
  brawler          70.0%   entrees 7.7   reussite 59%
  boxeur_pressure  58.0%   entrees 10.7  reussite 48%
  kickboxeur       47.3%   entrees 7.2   reussite 39%
  polyvalent       45.0%   entrees 14.6  reussite 38%
  grappler         40.7%   entrees 16.8  reussite 43%

Forme coherente : il ecrase le bagarreur qui avance en ligne droite, bat le
boxeur pressure (cible souhaitee 65%, on est a 58%), et perd contre la
distance et contre le sol. Tous les taux de reussite sont dans les fourchettes
reelles (35-60% selon la qualite du defenseur).

## Equilibre des archetypes (toutes rondes)
  grappler 55.3 | kickboxeur 53.3 | lutteur 53.3
  polyvalent 48.7 | boxeur_pressure 46.0 | brawler 42.0
  ecart 13.3 points (31.0 en debut de session, 6.0 au meilleur moment)

## Calibrage
  DEC 48.1% (reel 46.8) | TKO 30.0% | SUB 12.8% (19.3) | KO sec 5.9% (~11)
  gradient KO 6.7 pts

## LES DEUX PLAIES QUI RESTENT
1. SOUMISSION A 12.8% CONTRE 19.3% REELS. Elle s'est degradee tout au long
   des changements sur la lutte. C'est l'ecart le plus net du calibrage.
2. BRAWLER A 42.0%. Il subit deux fois : la garde anti-lutte penalise sa
   frappe, et son footwork -12 le rend facile a plaquer. Coherent mais trop
   cumule.
3. Le lutteur contre boxeur pressure est a 58%, la cible souhaitee etait 65%.


---

# prudence_sol(dfn) — on n'emmene pas un jiujitsuka au sol

## Le probleme
Le plan de combat etait derive des SEULES stats de celui qui l'applique : il
ne regardait jamais le danger d'en face. Mesure : le lutteur amenait le
grappler au sol 7 fois par combat (16.8 tentatives) et se faisait SOUMETTRE
dans 23% des combats. Aucun coach ne demanderait ca.

## Implementation (engine.py, Fighter)
  danger = (submission_off_bottom*0.6 + sweeps*0.4 - 55)/100
  retour = 1 - min(0.55, danger x fight_iq/100 x 1.5)
C'est du FIGHT IQ pur : un combattant intelligent sait a qui il a affaire,
un autre fonce et se fait prendre le bras.

## Effet mesure
  entrees contre le grappler : 16.8 -> 13.9
  lutteur contre grappler    : 40.7% -> 43.3%
Directionnellement juste, INSUFFISANT.

# >>> LE CHANTIER SUIVANT, ET IL EST CLAIR <<<
LE TAUX DE BASE DES ENTREES EST TROP HAUT PARTOUT.
  contre brawler 7.7 | boxeur_pressure 10.8 | kickboxeur 7.7
  polyvalent 13.1 | grappler 13.9        (reel UFC : 2 a 6)
Empiler des modificateurs (retenue_lutte, guet, prudence_sol) ne corrigera
jamais un PLANCHER trop eleve. Il faut redescendre TAUX dans phase_debout
(actuellement 0.22 / cadence) et REVALIDER tout le reste — c'est ce qui
tient l'equilibre des archetypes aujourd'hui, donc ca bougera partout.

## Etat a la fin de la session
  Archetypes : kickboxeur 57.3 | lutteur 53.3 | polyvalent 49.3
               brawler 48.7 | grappler 43.3 | boxeur_pressure 38.7
               ecart 18.7 points (31.0 au debut, 6.0 au meilleur moment)
  Calibrage : DEC 47.0 (reel 46.8) | SUB 14.1 (19.3) | KO sec 5.5 (~11)
              gradient KO 6.3 pts

## LES TROIS PLAIES
1. Taux d'entree trop haut partout (voir ci-dessus). CAUSE RACINE.
2. Le boxeur pressure est tombe a 38.7%. Il encaisse tout : le contre du
   lutteur accule, la garde anti-lutte qui bride sa frappe. Chaque effet est
   juste, le cumul l'ecrase.
3. Soumission 14.1% contre 19.3% reels.


---

# LE LUTTEUR FRAPPE LOURD MAIS MAL (implemente)

Idee : la puissance d'un lutteur vient de sa base et de ses jambes, pas de sa
technique de bras. Cormier, Cain, Chuck : mains lourdes, pourcentage mediocre.

## Ce qui a coince, et c'est instructif
Monter `power` a +14 sans monter AUCUNE competence n'a rien donne : le lutteur
sortait a 3.4 de degats par coup touche, LE PLUS BAS des quatre archetypes
testes. Cause : le moteur lie les degats a la qualite d'execution
    qualite = 0.45 + competence/130      (striking_v2.resolve_frappe)
    dmg *= qualite  et  concussif *= qualite**2.2
Un coup mal place fait moins mal — c'est legitime, mais ca annule la
puissance brute d'un profil sans technique.

## Solution retenue : UNE arme lourde maitrisee, pas un arsenal
  overhand -6 -> +10, power +14, ko_power +8
  jab/crochet restent tres negatifs
C'est l'overhand du lutteur, exactement comme dans la vraie vie.

## Mesure (contre polyvalent)
  archetype          precision   degats/coup   part d'overhand
  lutteur              30.0%         3.9            38%
  boxeur_pressure      31.6%         4.4            15%
  brawler              36.7%         5.0            28%
  kickboxeur           50.3%         3.5             2%

Le lutteur est bien le MOINS precis apres le brawler, et il concentre 38% de
ses coups sur son overhand : profil "une seule arme, on la lance et on prie".
Degats/coup encore un peu bas (3.9 contre 5.0 au brawler) — acceptable, il ne
doit pas devenir un puncheur.

## Equilibre apres ce changement
  kickboxeur 56.7 | lutteur 52.0 | polyvalent 51.3
  brawler 48.7 | grappler 46.0 | boxeur_pressure 42.0
  ecart 14.7 points

## RAPPEL DE CADRAGE (donne par l'utilisateur)
Ce sont les archetypes DE BASE. Les combattants se specialisent ensuite via
l'entrainement. L'ecart au niveau de base compte donc moins que le fait
qu'aucun archetype ne soit un PIEGE — et que chaque trou soit REPARABLE.


---

# PUISSANCE REPONDEREE DANS LES DEGATS (striking_v2.py)

## Le blocage
`dmg = uniform(lo,hi) * (0.7 + power/150) * qualite`
Un frappeur a 90 de puissance ne faisait que 1.26x les degats d'un frappeur a
50. Ce sont la COMPETENCE et la QUALITE D'EXECUTION qui decidaient de tout —
et comme qualite = 0.45 + competence/130, la competence comptait DEUX FOIS
(une fois pour toucher, une fois pour les degats). Un profil "lourd mais
brouillon" etait donc inexprimable : le lutteur sortait a la fois le moins
precis ET le moins puissant.

## Correction
  (0.7 + power/150)  ->  (0.45 + power/95)      ecart porte a ~1.8x
Et lutteur : power 22, ko_power 15, overhand +10, jab/crochet toujours tres
negatifs.

## Resultat vise et obtenu : LE PLUS IMPRECIS, MAIS CA FAIT MAL
  archetype          precision   degats/coup touche
  lutteur              30.9%          4.5     <- le moins precis
  boxeur_pressure      32.0%          4.6
  brawler              38.5%          5.5
  polyvalent           36.2%          3.0
  kickboxeur           48.0%          3.6     <- le plus precis, le plus leger

## Effet de bord a surveiller
La repondération touche TOUS les combattants, pas seulement le lutteur.
Calibrage apres : DEC 45.7 (reel 46.8) | SUB 13.0 (19.3) | KO sec 6.0 (~11)
gradient KO 8.0 pts (etait 6.3). A repasser.


---

# DECISION ASSUMEE — NE PAS "CORRIGER"

## Le brawler touche mieux que le boxeur pressure sur les poings
  arme        boxeur_pressure   brawler
  cross             34%           38%
  crochet           27%           33%
  overhand          27%           39%
  uppercut          33%           35%

C'est CONTRE-INTUITIF et c'est VOULU. Cause mecanique : le chaos
(sensibilite_chaos, engine.py) fait chuter l'esquive adverse jusqu'a 40%, et
ce gain depasse ce que la technique rapporte au boxeur — l'ecart de
competence ne pese que 0.75 point de chance par point de stat, soit ~+11
points pour le boxeur.

Autrement dit : dans le couloir, salir le combat bat savoir boxer.

POURQUOI ON GARDE : le brawler paie ce gain tres cher ailleurs (lutte, sol,
deplacement, sprawl -14). Il emmene l'autre dans un endroit ou la technique
compte moins, c'est exactement son identite, et il reste a 47.3% au global.
C'est un style qui vit ou meurt selon l'affiche, pas un style fort.

SI un jour on veut le changer, deux leviers :
  - relever le poids de la competence dans resolve_frappe (0.75 -> ~1.0)
  - ou faire porter le chaos sur les DEGATS ENCAISSES plutot que sur le fait
    de toucher
Les deux rebattraient les six archetypes ET le calibrage KO. Ce n'est pas un
ajustement, c'est une seance entiere.

## Au passage : la precision globale par archetype est un chiffre TROMPEUR
Le kickeur sort a 48% non par technique mais par choix d'armes (14% de low
kicks a 69%, 13% de teeps a 67%). Le boxeur a 32% parce qu'il lance 78% de
poings. Ses 33% au jab et 34% au cross sont PILE les valeurs reelles (32-38%).
=> Toujours comparer la precision ARME PAR ARME, jamais en agregat.


===========================================================================
# GROS CHANTIERS — SEANCE DE CLOTURE
===========================================================================

## LA TROUVAILLE : la soumission n'a JAMAIS ete un probleme de temps au sol
On a cru toute la journee que la soumission a 13% venait du manque de sol.
FAUX. Mesure decisive (grappler contre polyvalent, 240 combats) :
    tentatives : 5.1 par combat        <- REALISTE (reel 2 a 5)
    conversion : 2.4 a 2.7%            <- LE PROBLEME (reel 10 a 20%)
Le nombre d'attaques etait bon, c'est leur ABOUTISSEMENT qui etait faux.
Corrige dans ground_v2.py :
    base 4.2 -> 11.0, poids de l'ecart 0.36 -> 0.55, plafond 22 -> 38%
=> Soumission 13.0% -> 19.6% (reel 19.3%)

## LE TAUX D'ENTREE : le vrai defaut etait la FORME, pas le nombre
Avant : 3 a 8 sequences au sol par combat (reel 2-4), de 18 a 48s chacune
(reel 40-90s quand le controle tient). Le moteur faisait "plaquage, il se
releve, replaquage". Personne ne se fait soumettre en 20 secondes.
Corrige :
    TAUX 0.22 -> 0.12 (phase_debout)
    chance d'evasion : base 62 -> 52 (ground_v2)
=> sequences 1.5 a 5.3, durees 22 a 67s, temps au sol 20.1%

## NIVEAU DES FINITIONS
Apres ces deux changements il y avait trop de finitions. usure_mod descendu
d'environ 25% ET resist_mod monte d'environ 25% (c'est le chemin CONCUSSIF
qui dominait, pas l'accumulation — l'usure seule ne bougeait plus rien).

## ETAT FINAL DU CALIBRAGE — LE MEILLEUR DE LA JOURNEE
    Decision      46.3%   (reel 46.8)
    Soumission    19.6%   (reel 19.3)
    KO/TKO total  33.5%   (reel 32.6)
    Gradient KO   4.7 points d'ecart moyen   (12.7 une heure plus tot)
    Temps au sol  20.1%
    Precision     44-51%  (reel 41-50)
    Volume        8-11/min

Seul ecart restant : KO sec 3.3% contre ~11% reels, compense par des TKO a
28.8% contre 21.6%. Le TOTAL est juste, c'est la REPARTITION entre KO net et
TKO qui ne l'est pas. Couplage deja documente plus haut (un KO net supprime
un knockdown dont l'homme se relevait) : les regler ensemble ou pas du tout.

## EQUILIBRE DES ARCHETYPES : 17.3 POINTS — NON RESOLU
    kickboxeur 57.3 | grappler 52.0 | lutteur 50.0
    polyvalent 50.0 | brawler 43.3 | boxeur_pressure 40.0

J'AI ARRETE D'AJUSTER, ET VOICI POURQUOI : en baissant le footwork du kickeur
il est MONTE de 57.3 a 60.7%. Trois ajustements de suite ont donne des
resultats qui ne suivaient pas la modification. A 30 combats par paire la
variance est de +/-5 a 8 points : j'etais en train de courir apres du bruit.

POUR REPRENDRE CORRECTEMENT :
  refonte.tournoi(JEU, par_paire=120) et deux ou trois graines.
  Environ 5400 combats. C'est une seance dediee, pas une fin de journee.
  Le boxeur pressure (40.0%) est le plus urgent : il encaisse le contre du
  lutteur accule ET la garde anti-lutte qui bride sa frappe.


---

# CORRECTIF AU CARNET — le "paradoxe du footwork" n'existait pas

Hier soir j'ai ecrit : "en baissant le footwork du kickeur il est MONTE de
57.3 a 60.7%". C'ETAIT FAUX, et doublement :
  - l'ajustement changeait DEUX choses a la fois (footwork 20->16 ET
    cage -20->-22), donc rien n'etait isolable ;
  - la conclusion reposait sur UNE graine.

Test propre (footwork SEUL, trois graines, 30 combats/paire) :
    footwork 20 : 57.3 / 66.0 / 53.3  -> moyenne 58.9%
    footwork 16 : 54.0 / 54.7 / 58.0  -> moyenne 55.6%
Baisser le footwork BAISSE bien ses victoires (-3.3 pts). Le mecanisme du
moteur est sain. La decision de s'arreter etait bonne, mais pour une
mauvaise raison.

## LA VRAIE LECON, ET ELLE EST PIRE QUE CE QU'ON CROYAIT
La variance a 30 combats/paire est de +/-6 points SUR LE TAUX GLOBAL d'un
archetype (53.3 a 66.0 sur la MEME config). Toute la campagne de
reequilibrage de fin de journee (boxeur, brawler, kickeur) s'est jouee DANS
cette marge : les allers-retours mesuraient du bruit.

## PROTOCOLE OBLIGATOIRE POUR LE REEQUILIBRAGE A VENIR
1. refonte.tournoi(JEU, par_paire=120), graines 1, 7, 42 — moyenner.
2. UNE modification a la fois. Jamais deux stats dans le meme test.
3. Ne conclure que sur un ecart > 4 points de moyenne multi-graines.
4. Une passe complete, pas des petites touches successives.
~16 000 combats par candidat de jeu : c'est une seance dediee.


===========================================================================
# INCIDENT + BONUS SPECIALISTE — a lire attentivement
===========================================================================

## L'INCIDENT
En repondant a la question "le takedown est-il vraiment lie aux stats", un
diff complet contre l'archive a revele DU CODE NON TRACE dans le moteur :
  - Fighter.niveau_moyen() + Fighter.specialite()   (engine.py)
  - "+ 26 * atk.specialite(skill)" dans tenter_takedown
  - "+ 9 * specialite(...)" dans les DEUX fonctions de soumission (ground_v2)
Aucun des patches montres dans la session ne contient ces lignes ; elles ne
sont PAS dans l'archive precedente. Origine inconnue. Trois mesures de courbe
takedown ont tourne avec ce code actif a l'insu de l'operateur — dont un
SUB anormal a 32.8% reste inexplique sur le moment.

REGLE RETENUE : du code non trace ne reste dans le moteur qu'apres relecture
ligne a ligne ET A/B mesure. C'est ce qui a ete fait.

## LA MESURE A/B (bonus actif vs neutralise)
                       SANS      AVEC      cible
  TD 99 vs def 60       43%       51%      55-65  (Khamzat vs moyen)
  TD 99 vs def 90       35%       38%      30-35
  TD 75 vs 75           25%       25%      inchange <- le bonus ne touche
                                              QUE le sommet, comme voulu
  SUB                  20.4%     24.2%     19.3

## DECISION
  - GARDE : le branchement takedown (+26 * specialite). Il pousse le sommet
    vers la cible sans toucher le milieu de tableau.
  - RETIRE : les branchements soumission (+9). La conversion reglee plus tot
    suffisait ; avec eux le SUB derapait a 24.2%.

## CE QUE FAIT specialite(valeur) — Fighter, engine.py
  0 sous 88, montee lineaire continue ensuite (PAS de falaise),
  MULTIPLIEE par l'ecart au niveau moyen du combattant :
     un homme a 95 partout n'est PAS un specialiste (bonus ~0) ;
     un homme a 95 en lutte et 60 ailleurs en est un — il paie deja ses 60.
  C'est la contrainte "pas super haut partout" demandee, obtenue par
  construction plutot que par une regle de plafonnement.

## COURBE FINALE DU TAKEDOWN (attaque x defense, mesuree en combat)
            def 60   def 75   def 90
  atk 99      51%      46%      42%*     * encore ~5 pts au-dessus de la
  atk 90      41%      36%      32%        cible contre un specialiste
  atk 75      34%      32%      27%
  atk 60      25%      27%      24%
  La ou l'on partait : la stat du defenseur pesait DEUX FOIS MOINS que celle
  de l'attaquant. Corrige aussi par le resserrement des 5 defenses derivees
  (whizzer 0.92 / balance 0.82 / grip 0.80 du sprawl, adapter.py).

## CALIBRAGE APRES DECISION
  DEC 45.5 (46.8) | SUB 19.1 (19.3) | TKO 30.2 | KO sec 3.6 (~11)
  gradient KO 6.2 pts
  Archetypes : ecart 18.0 pts — TOUJOURS a reequilibrer au protocole
  120 combats/paire x 3 graines (voir plus haut). Ne pas retoucher avant.


===========================================================================
# KO SEC — CHANTIER OUVERT, ETAT EXACT DU DIAGNOSTIC (fin de session)
===========================================================================

## L'IDEE VALIDEE (utilisateur) : accumulation tete = KO
Le decoupage dur "accumulation -> TKO" etait faux. Sur une tete entamee, le
coup suivant ETEINT. Implemente : chemin d'usure (retour "ko" direct,
proba 0.03 + usure_tete*0.15) + suppression du REBAPTEME ligne ~480 qui
retransformait "ko" en "TKO !" des que head_damage > 55 (102 extinctions sur
160 combats ne donnaient que 8 KO SEC affiches a cause de lui).

## LE PROBLEME RESTANT : KO sec 26% / TKO 7% (cibles ~11 / ~21.6)
TROIS boutons testes, TOUS INERTES (26-28% quel que soit le reglage) :
  - diviseur de violence 1.25 -> 5.5 : 28.5 -> 27.1
  - dose du chemin d'usure /4       : 27.1 -> 26.1
  - attribution "92% via usure" = CORRELATION (tout le monde a la tete
    entamee en fin de combat), pas causalite. Ne pas refaire cette erreur.

## LE VRAI MECANISME (hypothese forte, a verifier en premier)
C'est une COURSE : chaque knockdown laisse le combat continuer, et il finit
statistiquement par tomber sur un retour "ko". Le TKO ne gagne la course que
si la sequence de finition APRES knockdown produit un arret d'arbitre — or
TKO = 7% seulement : cette conversion knockdown->TKO est quasi inexistante.
=> LE LEVIER : la finition sur homme au sol/sonne apres knockdown (swarm,
   arret arbitre). Chercher ce que fait encaisser_knockdown() et la suite
   de combat pendant `sonne`. C'est LA qu'il faut creer des TKO, pas en
   etranglant les extinctions.

## Etat chiffre au moment de la coupure
  DEC 45.3 (46.8) | SUB 19.9 (19.3) | KO sec 26.1 (~11) | TKO 7.1 (~21.6)
  TKO sol 1.1 | gradient KO 4.4 pts | total finitions 34.3 (32.6) — le TOTAL
  est bon, seule la REPARTITION KO/TKO est fausse.


===========================================================================
# CHANTIER KO/TKO — RESOLU (seance de reprise)
===========================================================================

## Etat final (mesure.py 55x3, graine 11)
  DEC 46.5 (reel 46.8) | TKO 19.5 (~21.6) | SUB 20.3 (19.3)
  KO sec 10.5 (~11) | TKO sol 2.3 | gradient KO 4.5 pts
  LES QUATRE ISSUES SONT SUR CIBLE. Meilleur etat du projet.

## Ce qui a ete compris (dans l'ordre, avec les fausses pistes)
1. L'hypothese "course apres knockdown" etait FAUSSE aussi : instrumentation
   sur 200 combats -> 97 extinctions sur 114 frappaient un homme JAMAIS mis
   au sol. Le vrai probleme : PLUS AUCUN mecanisme ne fabriquait de TKO
   (3/200) depuis la suppression du rebapteme.
2. L'inertie de tous les boutons precedents expliquee : conditionnellement a
   un arret, l'impact est toujours enorme (la commotion ne se declenche que
   sur les gros coups), donc violence >> 1 et le chemin d'extinction sortait
   "ko" quasi systematiquement, quel que soit le diviseur. LE PLAFOND etait
   le vrai bouton, pas l'echelle.

## Les mecanismes ajoutes (engine.py)
a) RE-KNOCKDOWN dans la meme sequence (dfn.sonne > 0) -> TKO arbitre.
b) SERIE NON DEFENDUE : coups_sonne compte les coups nets a la tete
   ("tete" SANS accent ! zone == "tête" etait du code mort silencieux,
   attrape par verification post-patch) ; arret au 3e coup, au 2e si la
   tete est deja entamee (head_damage > 40*resist_mod).
c) PLAFOND d'extinction abaisse :
   proba_ko_sec = min(0.30, violence*0.12) + (0.18 si sonne)
   -> la plupart des commotions FONT TOMBER, le knockdown nourrit l'arbitre.
d) Soumission retrimee au nouveau regime (les combats survivent plus
   longtemps) : base 11.0 -> 6.8, plafond 38 -> 30 (ground_v2.py).

## PIEGES DE PATCH consignes (trois asserts rates de suite)
- Toujours grep le texte EXACT avant un str-replace (indentation 4 vs 8).
- assert AVANT write : un assert rate n'ecrit rien — verifier par mesure
  que le fichier a change avant d'interpreter un resultat.
- Verifier les CHAINES de zone/cle apres patch ("tete" vs "tête").

## RESTE (mineur)
- TKO a 19.5 pour 21.6, SUB 20.3 pour 19.3 : dans le bruit ou presque.
- Equilibre des archetypes : inchange, protocole lourd toujours du (120/paire
  x 3 graines). L'etat HTML est desormais SYNCHRONISE avec refonte.JEU.
- test_raccord (fiches prototype) a re-passer apres toute retouche.


===========================================================================
# PASSATION — SESSION DESIGN/UI (a lire pour reprendre)
===========================================================================

## Ce qui existe cote UI (fichiers dans l'archive)
- hub_salle.html : hub principal. Salle VUE DU DESSUS (plancher, ring vu de
  haut, tapis, sacs en cercles, muscu, bureau), equipements CLIQUABLES
  (niveau/bonus/occupants), EMPLACEMENT LIBRE en pointilles (promesse
  boutique), combattants = petits points a leur poste (couleur = etat, tap
  -> fiche avec jauges). Dock : SALLE / EVENTS (badge J-2, compte a rebours
  reel) / MONDE (carte SVG grossiere) / RESEAU (feed avec recompenses de
  jeu) / COACH. Decisions utilisateur : PAS de pastilles flottantes, Fight
  Night dans un MENU (pas en haut d'ecran), salle = ecran principal.
- ecran_combat.html : l'anti-"mur de chat" (ref. ecran de match FM).
  Octogone vu du dessus, 2 points animes, scenario SCRIPTE de 20 etapes,
  silhouettes de degats par zone (4 niveaux), momentum, jauges d'essence,
  ralentis + flash + vibration sur temps forts, commentaire 1 ligne,
  pause/x1/x2/x4. STATS EN DIRECT (5 cases : SIG / FRAPPES / TAKEDOWNS /
  CONTROLE chrono reel / SOUM.) + feuille de stats consultable EN PAUSE
  (tap sur noms/points/bouton STATS, auto-pause, reprend en fermant) :
  barres miroir "LE COMBAT" (compteurs live) + "SUR LE PAPIER" (profils).
  REGLE ETABLIE (utilisateur) : l'ecran ne raconte JAMAIS autre chose que
  ce que le moteur a tire. Le scenario scripte etait pour valider la
  direction ; la suite passe par le traducteur.
- Design system commun "la salle, le soir" : nuit #12161e, panneaux
  #1a2029, tungstene #f2b25a (SEUL accent), craie #e9e5da, cuir #b6412f
  (danger/live), bleu adversaire #5f8fc4, traits #2a323d. Typo Anton
  (display) + Barlow Semi Condensed. Personnages : Idris "La Dalle" Kante
  (brawler, 7-2, combat Lyon vs T. Okafor, bourse 3500), Maya Soler,
  Theo Diallo, Rachid Amrani (moral 31). Club "Le Chaudron", Marseille.
  Coach Serge Baldacci.

## traducteur.py — ETAT : FONCTIONNE, valide sur 7 graines
Log moteur -> etapes {t,a,b,ph,com,dmg,st,tdA/B,subA/B,ctrl,sol,slow,
flash,kd,rd,mom,fin}. Met en scene les positions (le moteur parle en
etats) : ancre aleatoire a la grille quand accule, points fusionnes au
sol, retour centre. Momentum DERIVE en post-passe. Finitions : SOUMISSION
(2 lignes separees "-> SOUMISSION" puis "*** X tape !"), KO SEC, TKO,
filet ">>> X gagne au round N". Vainqueurs conformes au moteur 7/7.

## PROCHAINE ETAPE No1 : generer combat_reel.html
1. Choisir une graine avec finition (27 = soumission R1, 31, 40).
2. Injecter le JSON du traducteur dans le lecteur d'ecran_combat.html
   (remplacer `const S=[...]`) et adapter le lecteur :
   - horloge multi-rounds : champ `rd` dans les etapes, 300 s/round
   - carte de fin dynamique (methode/vainqueur/temps depuis `fin`)
   - vitesses x1/x4/x8 (900 s trop long a x1)
   - `mom` est desormais fourni par chaque etape

## Trous connus du traducteur (mineurs, dans l'ordre)
- DECISION : vainqueur non extrait (affiche nul). Trouver le format de la
  ligne de jugement dans le log et le parser.
- graine 40 : fin attrapee par le filet generique ("ARRET") — identifier
  quel type de fin n'a pas son motif (TKO sol ? corps ? contre ?).
- "!!! X CONTRE le overhand de Y (N)" et "CONTRE, X prend le dessus"
  (renversement) : pas traduits en etapes dediees.
- Horodatage : repartit secondes_round/nb_lignes ; une finition mi-round
  etale quand meme sur 300 s. Acceptable, a affiner plus tard.

## Rappels de contexte projet
- Mobile confirme. Style FM. Unity REJETE (argumente) : jeu = panneaux/
  listes/texte, web 10x plus rapide en boucle Claude<->user, PWA/Capacitor
  pour les stores. Reevaluer SEULEMENT si combattants animes en squelette.
- Route longue assumee par l'utilisateur : plein de mecaniques + design
  complet AVANT de viser la version jouable. MAIS portage JS avant le gros
  des nouvelles mecaniques (sinon tout refaire 2x), et paliers jouables.
- Moteur : quatre issues SUR CIBLE (DEC 46.5 / TKO 19.5 / SUB 20.3 /
  KO sec 10.5, gradient 4.5). GEL DU CALIBRAGE recommande. Reste :
  equilibre archetypes (17-18 pts) au protocole lourd (120/paire x 3
  graines, UNE modif a la fois, conclure si > 4 pts).
- Les 10 .py + mma_manager_v2.html sont SOLIDAIRES (calibres ensemble).
  Verifier en debut de session que le projet a bien les fichiers du zip
  (diff rapide), sinon travailler depuis le zip.


===========================================================================
# SEANCE — LECTEUR DE COMBAT REEL (combat_reel.html)
===========================================================================

## /!\ L'ARCHIVE mma_session.zip EST INCOMPLETE
Quatre modules importes par engine.py (lignes 11-18) n'y sont PAS :
    stance.py   body.py   clinch.py   instrument.py
Consequence : `import engine` echoue, donc AUCUN log reel n'a pu etre
produit cette seance. Tout ce qui suit a ete valide sur un log FORGE.
=> Refaire l'archive avec ces 4 fichiers. Verifier a chaque passation par :
   python3 -c "import engine, adapter, refonte, mesure, diagnostic"

## FAIT — trou n°1 du traducteur : la DECISION
Le format etait dans engine.py:1153 :
    "  >>> Match nul"   ou   "  >>> {nom} l emporte aux points"
Parse ajoute dans traducteur.py, juste avant le filet ">>> X gagne au
round". Teste sur les trois cas (A gagne / B gagne / nul) : vainqueur
correct 3/3 sur log forge. A REVALIDER sur un vrai log.

## FAIT — coup de gong a t=0
La premiere etape du traducteur peut tomber a t=56s (le pas est
secondes_round/nb_lignes, et les premieres lignes ne produisent pas
toutes une etape). L'ecran affichait donc "X coupe la cage" des la
premiere seconde. Etape neutre ajoutee a t=0, ph DISTANCE, rd=1.
Mise en scene pure, aucun evenement invente — meme categorie que les x,y.
EFFET DE BORD ASSUME : `etape()` consomme le rng, donc une graine donnee
ne reproduit plus la mise en scene d'avant ce patch (le nombre d'etapes
bouge : 17 -> 22 sur le log de banc). Les EVENEMENTS sont inchanges.

## FAIT — combat_reel.html
Deux fichiers, volontairement separes :
  combat_reel.template.html   le lecteur, avec le marqueur /*__DATA__*/
  combat_reel.html            template + donnees injectees
Injection : remplacer /*__DATA__*/ par le JSON. Rien d'autre a toucher.
Forme du bloc de donnees :
  {S:[etapes], FIN:{methode,vainqueur,detail}, noms:[A,B], fiches:[,],
   bourse:"", profils:[], sec_round:300}

Ce qui a ete adapte par rapport a ecran_combat.html :
  - HORLOGE MULTI-ROUNDS. `t` est ABSOLU dans la sortie du traducteur ; le
    round vient du champ `rd` (present seulement sur l'etape de reprise),
    a defaut du decoupage par sec_round. Decompte 5:00 -> 0:00 par round.
  - CARTE DE FIN DYNAMIQUE depuis FIN : titre VICTOIRE/MATCH NUL, nom du
    vainqueur, methode redigee (soumission nommee, KO, TKO, decision) et
    horodatage au format fiche "R2 4:21".
  - VITESSES x1 / x4 / x8 (900 s de combat, x2 ne servait a rien).
  - `mom` lu sur chaque etape (plus de valeur en dur).
  - NOMS, FICHES, BOURSE sortis du HTML vers le bloc de donnees.
  - KNOCKDOWNS lus sur le champ `kd` du traducteur. AVANT ils etaient
    DEVINES a partir de dmg.Bt > 1 — l'ecran inventait des knockdowns.
  - "SUR LE PAPIER" ne contient plus de profils en dur : si profils est
    vide, la feuille le DIT au lieu d'afficher des chiffres faux.

Validation : banc node headless (_banc.js), pas de navigateur. Le combat
va au bout, bascule R1->R2 a 4:59, carte de fin "T. Okafor / Soumission —
etranglement arriere / R2 4:21", takedowns 1/2 et 2 tentatives de
soumission conformes au log forge, cycle de vitesse x1->x4->x8.

## LE POINT SUIVANT, ET IL EST NET
Rejouer tout ca sur un VRAI log des que les 4 modules sont la :
    E, fin, d = traducteur.traduire(log, nomA, nomB, graine=27)
puis reinjecter. Graines a finition citees en passation : 27, 31, 40.

## DEFAUTS RELEVES, NON CORRIGES (une modif a la fois)
1. MOMENTUM SOURD AU SOL. Sur le log de banc, B prend le dos et soumet A,
   et le momentum affiche 43 — donc encore quasi neutre. Cause : dans la
   post-passe, le controle ne pese que 3/etape et le rappel vers 50 est a
   0.06/etape, ce qui efface la domination au sol. Le takedown (9) et le
   knockdown (14) pesent, le CONTROLE non. C'est le seul endroit ou
   l'ecran raconte quelque chose de faux aujourd'hui.
2. ESSENCE (jauges de cardio) NON ALIMENTEE. Le traducteur ne sort rien
   la-dessus. Placeholder pose : decroissance IDENTIQUE des deux cotes,
   pour que l'ecran ne pretende rien sur qui gaze. A brancher sur le
   cardio du moteur (champ a ajouter au traducteur).
3. PROFILS ("SUR LE PAPIER") a alimenter depuis adapter.py.
4. Trous connus restants du traducteur : graine 40 (fin generique),
   lignes CONTRE / RENVERSEMENT non traduites, horodatage qui etale une
   finition mi-round sur 300 s.


===========================================================================
# SEANCE — RACCORD MOTEUR -> ECRAN (suite, archive complete)
===========================================================================

## L'ARCHIVE EST COMPLETE, ET LE CALIBRAGE EST INTACT
Les 4 modules manquants (stance, body, clinch, instrument) sont arrives.
mesure.py 55x3 graine 11 redonne EXACTEMENT le calibrage gele :
    DEC 46.5 | SUB 20.3 | TKO 19.5 | KO sec 10.5 | TKO sol 2.3
Ce sont bien les modules avec lesquels le gel a ete fait. Rien a refaire.

## CODE NON TRACE — DEUXIEME OCCURRENCE, TRAITEE
rendu_combat.py est apparu dans le dossier sans etre dans le zip, et
traducteur.py avait grossi de 14 600 a 18 307 octets. Meme situation que
l'incident consigne plus haut. Procedure appliquee : diff, relecture ligne
a ligne CONTRE LA SOURCE (pas contre les commentaires), puis mesure.
Les quatre affirmations du patch verifiees dans engine.py :
  - !!! X CONTRE le {arme} de Y : le moteur credite bien dfn (engine:638),
    et les degats vont sur atk (engine:637). Sens correct.
  - *** X tombe sur le contre *** : resultat_impact_tete == "ko",
    return dfn (engine:641-643). C'est bien un KO, X est bien le PERDANT.
  - *** TKO AU CORPS ! X s effondre *** : X = dfn = perdant (engine:496).
  - *** TKO AU SOL ! X finit *** : X = top = VAINQUEUR, return top
    (engine:816). PIEGE D'INVERSION, le patch le traite correctement.
  - G&P bloque compte comme tentative : conforme a mesure.py.
  - `ctrl` porte d'une etape a l'autre : conforme (le champ n'est pose
    qu'au takedown et retire au retour debout).
VERDICT : garde. Le portage de `ctrl` corrige d'ailleurs le momentum
sourd au sol releve la seance precedente — sur la graine 27 le momentum
descend maintenant de 53 a 17 pendant la domination au sol.

## REGRESSION TROUVEE AU CROISEMENT DES DEUX PATCHS (corrigee)
Le traducteur verse desormais les frappes residuelles sur l'etape de fin
(`{fin:1, st:[...]}`), mais applique() du lecteur faisait `return` AVANT
de traiter `st`. Graine 27 : 4/7 et 10/12 affiches pour 4/8 et 11/17
reels. Corrige dans combat_reel.template.html.
LECON : deux patchs justes, chacun valide de son cote, se sont annules au
raccord. Toujours mesurer le BOUT DE LA CHAINE, pas chaque maillon.

## combat_reel.html EST GENERE DEPUIS LE MOTEUR
    python3 rendu_combat.py 27              # brawler vs lutteur
    python3 rendu_combat.py --balayer 1 60  # cherche les graines a finition
Graine 27 : soumission guillotine pour Okafor, R1 4:52, vainqueur
conforme au moteur (assert dans rendre()). Profils "SUR LE PAPIER" lus
sur les Fighter, plus rien en dur.

## >>> LA PLAIE SUIVANTE, ET ELLE EST CHIFFREE <<<
L'ECRAN PERD 41% DES FRAPPES SIGNIFICATIVES. Mesure propre sur les 35
combats finis au round 1 entre les graines 1 et 120 (contrainte : `rs` est
remis a zero a chaque round, engine:985 — comparer un cumul de combat au
`rs` final d'un combat en 3 rounds est FAUX, erreur commise et jetee) :
    moteur 1278 frappes significatives | ecran 749 | manque 529 (41%)
CAUSE, et ce n'est PAS le traducteur : le moteur fait
`top.rs["sig_landed"] += 1` PAR COUP dans une rafale (engine:794) mais
n'ecrit QU'UNE ligne par rafale avec les degats cumules. 157 rafales dans
ces combats, soit ~3.4 coups perdus par rafale. Le chiffre n'est PAS dans
le texte : aucun parseur ne peut le retrouver.
Meme probleme au clinch : engine:899 verse un total `sig` que les lignes
d'events ne portent pas (533 lignes de clinch a fleche ASCII "->" sur 40
combats, aucune traduite).
DEUX CORRECTIFS POSSIBLES, a arbitrer :
  a) faire ecrire le nombre de coups au moteur :
     "ground and pound → {n} coups, {d} dégâts". PARSE-SAFE : mesure.py
     teste "ground and pound →" et "dégâts", les deux sous-chaines
     survivent. Ne touche AUCUN calcul, donc pas le calibrage gele.
  b) passer les objets Fighter au traducteur pour reconcilier les totaux
     en fin de combat — mais les compteurs en direct sauteraient a la fin.
(a) est plus propre. C'est une retouche de CHAINE de log, pas de moteur,
mais elle touche un fichier gele : decision utilisateur.

## RESTE, dans l'ordre
1. Les 41% ci-dessus.
2. LE CLINCH N'EST PAS TRADUIT DU TOUT. Graine 27 : deux sequences, 13
   lignes de moteur, une seule etape "CLINCH" a l'ecran -> deux zones
   mortes de 56 s et 50 s ou il ne se passe rien. Vocabulaire a traduire :
   prend le contrôle du clinch (X), améliore sa prise -> X, wall_walk,
   pummel_out, spin_out, frame_push, duck_under, mat_return, riposte,
   petit_corps. /!\ Ces lignes utilisent la fleche ASCII "->", pas "→".
3. "X body_lock → CONTRÉ, Y prend le dessus" et ">>> RENVERSEMENT" :
   toujours pas traduits.
4. Essence (cardio) non fournie par le traducteur : placeholder symetrique
   dans le lecteur, ne pretend rien sur qui gaze.
5. Horodatage : une finition mi-round s'etale sur 300 s.


## CORRECTIF FEUILLE — NE JAMAIS RE-AGREGER LE SOL
Symptome utilisateur : "la soumission est sortie de nulle part, je n'avais
pas les stats". Diagnostic : la ligne unique "Sol" moyennait passage,
montee et soumission. Graine 27, elle affichait Kante 51 contre Okafor 71
— donc "Okafor ecrase au sol". Les vrais chiffres :
    passage 48/79 | montee 56/90 | sub_off_top 48/43 | sub_def 44/69
Le 71 venait du passage et de la montee. La soumission d'Okafor etait a
43, PLUS BASSE que celle de Kante (48), et la defense de soumission de
Kante (44 — son plus mauvais chiffre) n'etait affichee NULLE PART. Or
c'est exactement ce couple que tenter_soumission_top() tire.
L'ecran etait VRAI et racontait pourtant l'inverse de ce qui allait
arriver. C'est une variante sournoise de la regle : ne pas mentir ne
suffit pas, il faut afficher LES AXES QUE LE MOTEUR TIRE.
Corrige dans rendu_combat.profils() — "Sol" eclate en trois :
    Controle sol (passage+montee) | Soumission (off) | Def. soum.
Feuille passee de 6 a 8 lignes. Graine 27 lit maintenant :
    Controle sol 52/84 | Soumission 51/48 | Def. soum. 44/69
=> on VOIT que la soumission est a egalite et que Kante y est fragile.

REGLE GENERALE A APPLIQUER AU RESTE DE LA FICHE : toute barre agregee doit
etre verifiee contre la formule du moteur qui l'utilise. "Frappe"
(jab+cross+crochet+low_kick)/4 et "Lutte" (shot+sprawl+clinch)/3 n'ont PAS
encore ete verifiees de cette facon — a faire.


===========================================================================
# SEANCE — LES POINTS NOIRS (clinch + les 41% de frappes perdues)
===========================================================================

## RESULTAT : l'ecart ecran/moteur passe de 41% a 0.05%
Banc : les 53 combats finis au ROUND 1 entre les graines 1 et 200
(contrainte rappelee : rs est remis a zero a chaque round, engine:985).
    avant : moteur 1278 | ecran  749 | manque 529  (41%)
    apres : moteur 1992 | ecran 1991 | manque   1  (0.05%)
    48 combats sur 53 EXACTEMENT conformes.
Graine 27, tableau final : 4/9 contre 21/41. Etait 4/7 contre 10/12.

## 1. LE CLINCH EST TRADUIT (traducteur.py)
Sa signature, c'est la FLECHE ASCII "->" : c'est pour ca que tout passait a
travers depuis le debut. Vocabulaire traduit : prise de controle, ameliore
sa prise, pummele sans gain, les 6 sorties, riposte, les 6 frappes, snap
down, rupture offensive/defensive, les 4 prises de lutte depuis le clinch.
Tables PRISES_FR / ARMES_CLINCH / SORTIES_FR / LUTTE_CLINCH.
Le zonage des degats n'est PAS dans le log du clinch : il est deduit de
l'ARME (knee_head/elbow/short_hook -> tete, knee/petit_corps -> corps,
genou_cuisse -> jambe). C'est une deduction a partir d'une donnee reelle
du log, pas une invention.
GAIN MESURE : graine 27, la zone morte t=94->150 (56 s sans rien) est
remplie par 9 etapes. 18 etapes -> 31 sur le combat entier.

## /!\ CE QUE LE CLINCH N'A PAS APPORTE — hypothese fausse
Je pensais que le clinch etait la SECONDE cause des 41%. FAUX : il n'a
recupere que 3 frappes sur 529. La quasi-totalite (526) etait le ground
and pound seul. CAUSE UNIQUE, pas double. La plupart des armes de clinch
ont "significatif": False (petit_corps, genou_cuisse...), donc elles ne
comptent pas comme frappes significatives — c'est correct.

## 2. LE GROUND AND POUND EXPOSE SON COMPTE (engine.py) — LE GROS MORCEAU
Le moteur faisait `top.rs["sig_landed"] += 1` PAR COUP dans la rafale
(engine:794) mais n'ecrivait qu'une ligne avec le cumul de degats. ~3.4
frappes perdues par rafale.
    "ground and pound → {d} dégâts"
 -> "ground and pound → {touches}/{tentes} coups, {d} dégâts"
AUCUN tirage aleatoire touche : les combats sont bit-identiques.
VERIFIE : mesure.py 55x3 graine 11 apres patch redonne
    DEC 46.5 | SUB 20.3 | TKO 19.5 | KO sec 10.5 | TKO sol 2.3
soit EXACTEMENT le calibrage gele. Parse-safe pour mesure.py
("ground and pound →" et "dégâts" survivent tous les deux).

## 3. LE COUP DE GRACE N'EXISTAIT PAS DANS LE LOG
engine:472 credite sig_landed, PUIS la branche "serie non defendue"
(engine:478-483) log le TKO et fait `return` AVANT d'ecrire la ligne
"→ touché". Le coup qui finit le combat etait invisible. Rendu au
vainqueur dans le traducteur.

## /!\ ERREUR COMMISE ET MESUREE — le TKO AU CORPS
J'ai applique le meme +1 au TKO au corps PAR ANALOGIE, sans relire la
source. FAUX : ce return-la est DANS la branche zone == "corps"
(engine:494-497), donc la ligne "→ touché ({reel}) foie" est ecrite AVANT.
Le coup etait deja compte : l'ecran sur-comptait. Detecte par la mesure
(graine 64 : ecran 8 pour 7 au moteur), puis revoque.
LECON, encore la meme : relire la SOURCE, jamais raisonner par analogie.

## 4. RENVERSEMENTS TRADUITS
"X {td} → CONTRÉ, Y prend le dessus" (engine:728) et
">>> RENVERSEMENT, X prend le dessus" (engine:857). La premiere comble la
seconde zone morte de la graine 27 (t=228->267).

## LE 0.05% QUI RESTE : UNE INCOHERENCE DU MOTEUR, PAS DE L'ECRAN
5 combats sur 53 sont a +/-1 frappe. Cause identifiee et prouvee
(espion sur resolve_gnp, graine 27 : 17 coups resolus, 16 ecrits) :
    for ... : d += coup ; top.rs["sig_landed"] += 1
    d = int(d * dmg_mod * 0.85)
    if d:  log.append(...)
Une rafale qui touche mais dont les degats TOTAUX s'arrondissent a 0 ne
produit AUCUNE ligne, alors que sig_landed a deja ete credite.
NON CORRIGE, VOLONTAIREMENT : `score_frappes += 1.0` est a l'interieur du
`if d:`, donc ce compteur fantome n'influence AUCUN jugement. L'ecran est
en fait plus honnete que le compteur du moteur. Si on veut un jour aligner
les deux, corriger le MOTEUR (ne pas crediter une rafale a 0 degat), pas
le traducteur — mais ca change rs, donc a mesurer.

## RESTE
- Essence (cardio) toujours non fournie par le traducteur.
- Horodatage : une finition mi-round s'etale sur 300 s.
- Barres "Frappe" et "Lutte" de la feuille : pas encore verifiees contre
  les formules du moteur (voir le correctif "Sol" plus haut).
- Equilibre des archetypes : toujours au protocole lourd, jamais fait.


===========================================================================
# PASSATION — ARCHIVE COMPLETE (24 fichiers) — PROCHAINE ETAPE : PORTAGE JS
===========================================================================

## VERIFICATION A FAIRE EN PREMIER, A CHAQUE REPRISE
    python3 -c "import engine, adapter, refonte, mesure, generator, \
        traducteur, rendu_combat, stance, body, clinch, ground_v2, \
        striking_v2, instrument"
Si ca casse, il manque un fichier : l'archive precedente en avait perdu
QUATRE (stance, body, clinch, instrument) et une seance entiere a tourne
a vide dessus. Les 13 .py vont ENSEMBLE.

## ETAT EXACT DU PROJET

MOTEUR — calibrage GELE, ne pas retoucher.
    mesure.py 55 3   (graine 11 par defaut)
    -> DEC 46.5 | SUB 20.3 | TKO 19.5 | KO sec 10.5 | TKO sol 2.3
    C'est LA reference du portage JS. Elle doit retomber au dixieme.

ECRAN — fidele au moteur a 0.05%.
    python3 rendu_combat.py 27              # genere combat_reel.html
    python3 rendu_combat.py --balayer 1 60  # cherche les graines a finition
    Le rendu contient un assert de conformite du vainqueur : si le
    traducteur et le moteur divergent, ca leve, ca n'ecrit pas de HTML.

UI — trois fichiers :
    hub_salle.html            hub (salle vue du dessus), maquette validee
    ecran_combat.html         maquette d'origine, scenario SCRIPTE (garder
                              comme reference de direction artistique)
    combat_reel.template.html LE LECTEUR, avec le marqueur /*__DATA__*/
    combat_reel.html          template + vrai combat injecte

## >>> PROCHAINE ETAPE : PORTER LE MOTEUR EN JS <<<
RAISON : tant que le moteur est en Python, personne ne peut appuyer sur
"Fight Night" et voir un combat que le JEU vient de tirer — combat_reel
est un enregistrement. Et le carnet le dit deja : portage AVANT le gros
des nouvelles mecaniques, sinon tout refaire deux fois.
POURQUOI MAINTENANT : le calibrage est gele ET le traducteur est fidele.
On a donc une implementation de reference avec une sortie EXACTE a
comparer. Le test est binaire. Apres trois mecaniques de plus, la
reference aura bouge et on porterait a l'aveugle.

ORDRE, avec un palier verifiable a chaque etape :
    1. stance.py + body.py     (12 Ko a deux, aucune dependance)
    2. striking_v2.py
    3. ground_v2.py
    4. clinch.py
    5. engine.py               (53 Ko, le gros)
PROTOCOLE DE VERIFICATION : a chaque module, rejouer LE MEME combat en
Python et en JS et comparer les LOGS LIGNE A LIGNE — pas les moyennes.
Une seule ligne qui diverge dit exactement ou est le probleme.
Le RNG doit etre porte en premier et etre identique des deux cotes,
sinon aucune comparaison ligne a ligne n'est possible.
PALIER QUI CHANGE TOUT : etape 3-4, quand mma_manager_v2.html tire son
propre combat et l'envoie au lecteur. A partir de la, boucle jouable.

## CE QU'ON NE FAIT PAS AVANT LE PORTAGE (et pourquoi)
- Essence/cardio dans le traducteur, horodatage, barres Frappe/Lutte :
  c'est du traducteur, ca se porte aussi -> on le ferait DEUX FOIS.
- Rééquilibrage des archetypes : protocole lourd (120/paire x 3 graines,
  ~16 000 combats). Les archetypes sont des DONNEES (deja dans le HTML),
  donc ca se fait aussi bien apres — et mieux, en lancant le tournoi dans
  le navigateur au lieu d'attendre Python.

## REGLES DE TRAVAIL DU PROJET (a relire avant de toucher quoi que ce soit)
1. Instrumenter AVANT de corriger.
2. 300+ combats par condition. Sous 300, ne rien affirmer sur un ecart
   de moins de 5 points.
3. UNE modification a la fois.
4. Relire LA SOURCE, jamais raisonner par analogie (deux erreurs commises
   comme ca, toutes deux attrapees par la mesure et non par la relecture).
5. Mesurer LE BOUT DE LA CHAINE, pas chaque maillon : deux patchs justes
   se sont deja annules au raccord.
6. Du code non trace ne reste qu'apres relecture ligne a ligne ET mesure.
   (Deux occurrences a ce jour.)
7. L'ecran ne raconte JAMAIS autre chose que ce que le moteur a tire —
   et ne pas mentir ne suffit pas : il faut afficher LES AXES QUE LE
   MOTEUR TIRE (cf. le correctif de la barre "Sol").


===========================================================================
# PORTAGE JS — ETAPE 1 SUR 5 : RNG + stance + body  [CONFORME]
===========================================================================

Tout est dans le sous-dossier js/. UNE commande rejoue toute la chaine :
    ./js/lancer_verifs.sh
A LANCER APRES CHAQUE MODULE PORTE : un module juste peut casser un module
deja valide, et c'est la lecon "mesurer le bout de la chaine" appliquee au
portage.

## alea.js — LE MODULE random DE PYTHON, AU BIT PRES
C'est le socle : la comparaison ligne a ligne n'a de sens que si les deux
implementations tirent la MEME suite. Un Mersenne Twister ne suffit PAS,
Python pose ses conventions par-dessus. Les quatre pieges, tous porte :
  - random() consomme DEUX mots de 32 bits (53 bits de precision).
  - randint() n'est PAS floor(random()*n) : tirage par REJET sur k bits,
    donc un nombre VARIABLE de mots consommes.
  - gauss() calcule DEUX valeurs et garde la seconde en cache : un appel
    sur deux ne tire RIEN. Recalculer a chaque fois consomme le double.
  - seed(n) fait init_by_array([n]), pas init_genrand(n). Et seed()
    reinitialise AUSSI le cache de gauss.
Note JS : toute multiplication 32 bits passe par Math.imul. Un `*`
ordinaire passe par un double et perd les bits de poids fort.
VERIFIE : 8 graines, 4184 valeurs, dont une sequence ENTREMELEE de 120
tours (c'est elle qui compte : des fonctions justes une par une peuvent
mal consommer, seul l'entrelacement le revele).

### LA SEULE LIMITE CONNUE, MESUREE ET BORNEE
gauss() peut differer du DERNIER ULP (42.00223177811591 contre ...906).
Ce n'est pas le hasard qui diverge : cos/sin/log ne sont pas specifies au
bit pres entre libm (Python) et V8 (node). Le FLUX du generateur, lui, est
strictement identique.
Impact verifie : 20 000 stats de combattants generees des deux cotes avec
la formule exacte de test_raccord.creer -> ZERO divergence. La troncature
int() n'est jamais atteinte.
SI un jour un calcul devenait sensible au dernier bit d'un gauss : generer
les combattants d'UN SEUL cote et passer les fiches en donnees.

## stance.js et body.js — CONFORMES
6 graines, 69 600 valeurs comparees, zero divergence. Le banc ne compare
pas que les retours de fonction : il compare aussi l'ETAT INTERNE apres
coup (degats par jambe, degats corps/foie, garde actuelle, nombre de
switches, et les facteurs derives). Un retour juste peut cacher un etat
faux ; l'inverse n'arrive pas.

## PIEGES DE PORTAGE CONSIGNES (ils reviendront sur les modules suivants)
1. int() en Python TRONQUE vers zero. Ce n'est ni Math.round ni
   Math.floor (identiques seulement sur les positifs) -> Math.trunc.
2. L'ORDRE des appels au RNG est du CODE METIER, pas du detail. Remonter
   un random() au-dessus d'une sortie anticipee (`veut_switcher` a deux
   `return` avant son tirage) consomme du hasard la ou Python n'en
   consomme pas : tout le combat diverge ensuite.
3. Le COURT-CIRCUIT de `and` fait partie du contrat. Dans
   resolve_body_strike, `if not ko and random.random() < ...` ne tire
   RIEN quand ko est deja vrai.

## RESTE DU PORTAGE
    2. striking_v2.py   (13 Ko)
    3. ground_v2.py     (16 Ko)
    4. clinch.py        (19 Ko)   <- palier : le jeu peut tirer son combat
    5. engine.py        (53 Ko)
Reference finale du portage, non negociable : le JS doit redonner
    DEC 46.5 | SUB 20.3 | TKO 19.5 | KO sec 10.5 | TKO sol 2.3


## VERIFICATION DES DEUX FICHIERS "_A_COLLER" — LES DEUX SONT APPLIQUES
Controle fait, resultat : RIEN A FAIRE, les deux patches sont deja en place.
  - FOCUS : mma_manager_v2.html lignes 711-713 (const FOCUS avec
    "lutte offensive" + "antilutte") et 383-384 (cibles). Cable jusqu'a
    l'UI : la ligne 975 genere les options depuis Object.entries(FOCUS),
    donc "Defense de takedown" apparait tout seul dans le menu.
  - ARCHETYPES : le HTML est synchronise avec refonte.JEU, 0 ecart, et le
    .txt lui-meme est identique aux valeurs vivantes.
Les deux .txt ont recu un bandeau "APPLIQUE — NE PAS RECOLLER". Ils
disaient encore "REMPLACER TOUT LE BLOC" : dans quelques semaines c'etait
un piege (recoller des valeurs perimees apres une evolution de refonte.JEU).
Conserves pour leur RAISONNEMENT, pas comme tache.

## POURQUOI LE DECOUPAGE antilutte EST JUSTE — c'est deja mesure
diagnostic.py, affiche boxeur_pressure contre lutteur :
    aucun camp             46.7% de victoires du boxeur
    sprawl SEUL +10        45.8%   <- ne sert a RIEN
    famille complete +10   59.2%   <- +12.5 points
Le trou est REPARABLE, mais uniquement par la FAMILLE. Monter le sprawl
seul ne fait rien (le lutteur compense par le volume, vieux diagnostic).
Donc "antilutte = sprawl + sub_def + footwork" n'est pas une idee de
design elegante : c'est le seul regroupement qui paie, et il etait deja
valide par la mesure sans qu'on l'ait remarque.

## L'ANTI-CONVERGENCE EXISTE DEJA DANS LE MOTEUR
Question ouverte par la modularite : si tous les trous sont bouchables,
qu'est-ce qui empeche tout le monde de converger vers le meme build ?
Reponse deja implementee : Fighter.specialite() donne 0 sous 88 ET
multiplie par l'ECART AU NIVEAU MOYEN du combattant. Un homme a 95 partout
n'est pas un specialiste : bonus ~0. S'elargir coute donc le plafond
d'elite, sans aucune regle de plafonnement. Contrepoids structurel.

## CE QUE CA CHANGE POUR LE TEST D'EQUILIBRE
Le bon test n'est plus le round-robin ("les 6 font-ils 50%") mais :
"en partant du plus mauvais archetype, combien de camps pour atteindre la
viabilite ?" — mesurable avec test_camp.py qui existe deja, et infiniment
moins cher que les 16 000 combats du protocole lourd.
MAIS la base garde une utilite : tous les combattants du MONDE sont
generes depuis ces archetypes purs. Un boxeur_pressure a 40% donne une IA
faible, et le joueur qui en signe un herite du probleme. Pas besoin
d'egaliser, pas question de laisser 40% pour toujours non plus.

## /!\ DIVERGENCE ENTRE LES DEUX BANCS — NON EXPLIQUEE, A TRAITER
    mesure.py  (rosters generator.py)  : SUB 20.3%
    test_raccord (fiches DU PROTOTYPE) : SUB 30.6%
Dix points d'ecart sur la meme metrique. Or c'est test_raccord qui utilise
les combattants que le JEU produira reellement. Si ses fiches soumettent a
30% alors que le calibrage vise 19.3%, le jeu est hors cible meme si
mesure.py dit que tout va bien. Suspect n°1 : la distribution des stats
produite par creerCombattant() du prototype (gauss autour du niveau) n'est
pas celle de generer_roster(). A instrumenter — c'est le prochain vrai
sujet apres le portage.


===========================================================================
# LA DIVERGENCE DES DEUX BANCS — CAUSE TROUVEE ET CORRIGEE
===========================================================================

## LE SYMPTOME
    mesure.py    (rosters generator.py)  : SUB 20.3% | DEC 46.5
    test_raccord (fiches DU PROTOTYPE)   : SUB 30.6% | DEC 49.7
Dix points sur la metrique calee toute une journee — et c'est test_raccord
qui utilise les combattants que le JEU produit vraiment.

## LA CAUSE : LE GAMEPLAN DE L'ADAPTER NE SOMMAIT PAS A 1
adapter.construire() calculait les trois composantes INDEPENDAMMENT,
chacune avec son propre clamp, sans jamais normaliser :
    striking 0.519 + wrestling 0.366 + clinch 0.374 = 1.26
Or engine.py:598 et :602 lisent ces valeurs comme des PROBABILITES
ABSOLUES par echange (`random.random() < gameplan["wrestling"] * TAUX`),
PAS comme une repartition. 26% d'intentions en trop, integralement
versees dans la lutte et le clinch.
Les gameplans de generator.ARCHETYPES, eux, sont ecrits a la main et
somment a 1.00 — et c'est sur EUX que le calibrage a ete gele.
Effets mesures avant correction : clinch +114%, lutte +64%, d'ou temps au
sol 25.7% (contre 20.0), entrees 4.6 (contre 4.1), tentatives de
soumission 5.9 (contre 5.0) et conversion 5.4% (contre 3.8).

## LES TROIS CORRECTIFS (adapter.py uniquement)
1. NORMALISATION a 1.0. LE correctif, seul prouve : SUB 31.4 -> 23.2
   (3 graines), soit 8 points, tres au-dessus du bruit.
2. CLINCH RENDU RELATIF. La ligne valait `0.20 + g(lu,"clinch")/400`,
   donc la stat ABSOLUE : l'envie de clincher montait avec le NIVEAU et
   pas avec la specialisation (0.31 a niveau 45 -> 0.40 a niveau 85 ;
   tout le monde devenait clincheur en progressant). Rendue relative a la
   frappe du combattant et recentree sur 0.17 (moyenne des gameplans
   ecrits a la main, bande 0.12-0.25).
   /!\ EFFET SUR LA SOUMISSION NON MESURABLE (23.2 -> 24.9, etalement
   entre graines +/-3). GARDE pour ce qu'il corrige STRUCTURELLEMENT,
   verifie directement : clinch 0.224 / 0.224 / 0.227 aux niveaux
   45/65/85, la pente a disparu. Ne pas le revendiquer comme un gain de
   calibrage.
3. BASE DE LUTTE 0.30 -> 0.22, la moyenne des gameplans ecrits a la main
   (0.05 brawler -> 0.52 lutteur).

## RESULTAT (5 graines, 320 combats chacune)
                    AVANT    APRES    cible reelle
    DEC              39.7     45.4        46.8      <- sur cible
    SUB              31.4     23.9        19.3      <- reste 4.6 points
    TKO              18.1     15.8        ~21.6
    KO sec           12.2     10.9        ~11       <- sur cible
    temps au sol     25.7%    22.7%       20-25%    <- dans la fourchette

## LE CALIBRAGE GELE N'EST PAS TOUCHE — VERIFIE
mesure.py ne contient AUCUNE reference a adapter (0 occurrence) : il passe
par generer_roster. Relance apres correctifs :
    DEC 46.5 | SUB 20.3 | TKO 19.5 | KO sec 10.5 | TKO sol 2.3
Identique au dixieme.

## CE QUI RESTE, ET JE NE L'EXPLIQUE PAS
SUB encore 4.6 points au-dessus, TKO 6 points en dessous. Le TOTAL des
finitions est correct : c'est encore une histoire de REPARTITION, exactement
comme le vieux chantier KO/TKO. Piste : les sequences au sol aboutissent en
soumission la ou elles devraient aboutir en arret arbitre. A instrumenter
sur la duree et l'issue des sequences au sol, pas sur les stats des fiches.

## QUATRE HYPOTHESES FAUSSES, CONSIGNEES POUR NE PAS LES REFAIRE
1. "Les stats de soumission different" — NON : ecart off-def -7.3 contre
   -6.7. Quasi identique.
2. "Le cardio decouple du niveau" — NON. Le decouplage est VOLONTAIRE et
   documente dans le HTML ("certains debutants arrivent avec un gros
   moteur"). A/B : forcer le cardio a suivre le niveau donne 31.9 -> 30.6.
   Rien.
3. "clinch.top_control et striking.volume figes a 50 chez generator" —
   VRAI (generator ne les renseigne pas, ils restent au defaut de classe)
   mais SANS EFFET : 4 conditions a 3 graines, toutes dans +/-3 points, et
   resultat NON MONOTONE a 320 combats. C'etait du bruit.
4. "Les noms de division ne correspondent pas (espace vs underscore)" —
   NON : adapter.cle_division() fait la conversion correctement.
LECON : ce n'est pas une stat qui differait, c'etait une INTENTION. Quand
le temps au sol bouge de 28% sans que les stats de sol bougent, chercher
le plan de combat, pas les attributs.


===========================================================================
# CHANTIER 1 N'A JAMAIS ETE TERMINE — LE COUT PAR ACTION MANQUE EN SOL ET CLINCH
===========================================================================

## LE CONSTAT (verifie ligne a ligne)
                 cout par action          surcout de l'echec
    debout       oui (:453, :668, :736)   x1.5 (:736)   <- chantier 1, FAIT
    sol          NON — forfait 1.2/tick   aucun
    clinch       DECLARE MAIS MORT        aucun

SOL (engine.py:753-754) :
    top.depenser(0.8)
    bottom.depenser(1.2)   # subir coute plus cher
Forfaitaire PAR TICK. Tenter un upa coute exactement pareil que rester
allonge sans rien faire. Et une evasion ratee ne coute rien du tout :
"→ maintenu en {pos}", on repart au tick suivant. Un homme vide en montee
continue de tenter l'upa jusqu'a la cloche.
De plus engine.py:845 : `if random.random() < 0.92` — le dessous tente
quelque chose 92% du temps, TOUJOURS. Aucune branche "je tiens". C'est ce
0.92 en dur qui doit devenir un axe de gameplan.

CLINCH (engine.py:901) : `f.depenser(2.5)` forfaitaire pour LES DEUX.
Or clinch.py DECLARE onze couts par action, calibres a la main :
    SORTIES        frame_push 2 · pummel_out 3 · spin_out 3 · duck_under 4
                   · wall_walk 4
    FRAPPES_CLINCH genou_cuisse 0.3 · petit_corps 0.4 · short_hook 0.1
                   · knee 0.8 · knee_head 0.5 · elbow 0.2
AUCUNE n'est lue nulle part (grep exhaustif). Donnees mortes.

## C'EST LA MEME PATHOLOGIE QUE LE CHANTIER 1, DANS DEUX AUTRES PHASES
Le carnet dit deja : "UNE ENTREE RATEE NE COUTE RIEN. C'est la cause
racine." Repare debout, jamais applique ailleurs. Meme mecanisme : rien ne
limite le nombre de tentatives, donc on compense par le VOLUME.
Recette deja ecrite et validee ici : retenue_lutte() (moins de tentatives
quand il gaze et quand le fight IQ comprend que ca ne passe pas) + surcout
de l'echec.

## /!\ LE PIEGE, LUI AUSSI DEJA CONSIGNE
"Son archetype etait equilibre AUTOUR de la pathologie. Il gagnait par le
VOLUME. En lui retirant le volume sans rien lui rendre, on l'a ampute."
(lutteur 51.8% -> 42%). Ici c'est pire : si se relever coute de l'energie
ET qu'on ajoute l'option de tenir, le dessous sort MOINS -> plus de temps
au sol -> potentiellement PLUS de soumissions, l'inverse du but.
=> Il faudra rendre en QUALITE : une evasion choisie au bon moment, sur un
adversaire qui a lui aussi depense, doit passer nettement mieux.
=> LE SIGNE DE L'EFFET N'EST PAS PREVISIBLE. Ca se mesure.

## ORDRE DECIDE (utilisateur) : LES CORRECTIFS SE FONT EN JS
Consequence : il faut FINIR LE PORTAGE d'abord. Les deux correctifs vivent
dans engine (les depenser, le 0.92, la boucle de clinch), pas dans les
modules feuilles. Donc : clinch.js puis engine.js, ensuite seulement les
couts.
ATTENTION : ce ne sont PAS des changements gratuits comme la chaine de log.
Le calibrage gele VA bouger (sol + clinch = ~30% du temps de combat).
Protocole complet obligatoire, une phase a la fois.

## SEQUENCE PROPOSEE POUR LES COUTS (une modif a la fois)
    1. clinch : cabler les onze couts declares (le plus proche de "zero
       decision de design" — on consomme des donnees deja calibrees).
    2. sol : cout PAR ACTION sur les evasions + surcout de l'echec x1.5.
    3. sol : la posture "je tiens" comme axe de gameplan (le 0.92).
       /!\ HORS du trio normalise striking/wrestling/clinch : c'est une
       posture CONDITIONNELLE (elle ne s'applique que si on est deja au
       sol), pas une initiation en concurrence. L'ajouter au trio
       recasserait la normalisation corrigee ce jour.
    4. rendre en qualite ce qu'on a pris en quantite. Mesurer entre chaque.
Le cout ne se paie pas que d'un cote : le contre du stalling existe deja
("[arbitre] combat arrete au sol, relance debout") et le bareme de round
(degats, controle, agressivite) fait deja perdre le round a celui qui tient.


## PORTAGE JS — ETAPE 2 SUR 5 : ground_v2  [CONFORME]
27 000 valeurs comparees sur 5 graines, zero divergence. Les 5 fonctions
(progression, evasion, soumission dessus/dessous, gnp) pilotees sur les 11
positions avec des profils tires au hasard.

### tables.js EST GENERE, PAS RETAPE
gen_tables.py exporte POSITIONS, TRANSITIONS, ECHAPPATOIRES, SOUMISSIONS_*,
TECHNIQUES_ESCAPE, PRISES, SORTIES, FRAPPES_CLINCH, FRAPPES_RUPTURE et
SEUIL_SIGNIFICATIF depuis les modules Python. Plusieurs centaines de
constantes calibrees a la main : les retaper etait la facon la plus sure
d'introduire une erreur qu'aucune moyenne ne rattrape. A RELANCER apres
toute modification d'une table cote Python (lancer_verifs.sh le fait).

### PIEGES DE PORTAGE AJOUTES A LA LISTE
4. `max(seq, key=f)` en Python renvoie le PREMIER maximum en cas
   d'egalite, `min` le PREMIER minimum. Un reduce JS ecrit avec `>=`
   prendrait le DERNIER : a egalite de score le combattant partirait vers
   une autre position. Comparer en `>` strict.
5. getattr(obj, nom, 50) : en JS une propriete absente vaut undefined, pas
   50. Repasser explicitement par un defaut.
6. Dans tenter_evasion, le CHOIX de technique ne consomme aucun tirage ;
   seul le uniform final tire. Et le repli tire un SECOND uniform, mais
   uniquement si la liste `replis` n'est pas vide.


===========================================================================
# COUT PAR ACTION DU CLINCH — CABLE, SUR, ET SANS EFFET MESURABLE
===========================================================================

## CE QUI A ETE FAIT (clinch.py + engine.py)
Les onze couts declares dans clinch.py sont enfin CONSOMMES. Un champ
"cardio" a ete ajoute au dict `stats` de clinch_sequence, alimente en
quatre points :
  - sortie tentee -> SORTIES[sortie]["cout_cardio"] (2 a 4), facturee
    reussie OU NON ("impossible" = tentative non faite, donc rien)
  - riposte       -> FRAPPES_CLINCH[f]["drain_cardio"], au coup LANCE
  - frappe du controleur -> idem
  - rien pour FRAPPES_RUPTURE : elle ne declare aucun cout, on ne
    l'invente pas.
engine.py:901 : `f.depenser(2.5)` -> `f.depenser(CLINCH_BASE_CARDIO +
st.get("cardio", 0))`, avec CLINCH_BASE_CARDIO = 1.0 (le combat de prise
use les deux hommes meme sans action marquante).

## L'ASYMETRIE EST ENFIN LA
Graine 27, sequence de 10 actions : Kante force quatre sorties et paie
12.4 ; Okafor tient la prise et paie 0.4. Le forfait leur donnait 2.5
chacun. Facteur 5 pour celui qui se debat.

## A/B PROPRE (3 graines, 1080 combats chacune, meme protocole des 2 cotes)
    DEC      46.1 -> 46.7   +0.6
    SUB      21.6 -> 20.6   -1.0
    TKO      19.4 -> 19.3   -0.1
    KO sec   10.8 -> 10.5   -0.3
TOUT DANS LE BRUIT. Le correctif est NEUTRE pour le calibrage : il ne
casse rien, il ne repare rien.
/!\ Piege de mesure evite : `mesure.py 55 3` sur la SEULE graine 11
affichait DEC 43.4, ce qui ressemblait a une derive de 3 points. A 3
graines la moyenne est 46.7. La graine 11 seule a un autre
echantillonnage n'est PAS comparable au calibrage gele. Toujours
comparer AVANT et APRES au MEME protocole.

## >>> POURQUOI C'EST SANS EFFET : LE CARDIO EST SATURE <<<
Cardio en fin de combat, mesure directe :
    AVANT (forfait 2.5) : moyenne 0.216 | mediane 0.157 | 10e centile 0.000
    APRES (cout reel)   : moyenne 0.215 | mediane 0.158 | 10e centile 0.000
Un facteur 5 sur le cout deplace l'etat final de 0.001. Tout le monde
finit vide de toute facon. C'est EXACTEMENT le chantier 2 du carnet,
jamais traite : "Tout le monde finit a 0.18-0.31 de ratio. Vide.
Generalise."

## CE QUE CA PREDIT POUR LE SOL
Le meme correctif au sol sera lui aussi NEUTRE, pour la meme raison. On
verse de l'eau dans un verre deja plein. Tant que le cardio n'a pas de
MARGE, aucun cout par action ne peut peser sur une issue.
=> LE CHANTIER 2 (CARDIO) PASSE DEVANT. C'est lui qui donne leur valeur
   aux couts par action, a la retenue, a la posture de gameplan, et au
   round 3 en general.

## DECISION SUR CE CORRECTIF : ON LE GARDE
Il ne se justifie pas par un gain de calibrage (il n'y en a pas) mais par
trois choses verifiees :
  1. des donnees calibrees a la main ne sont plus mortes ;
  2. l'asymetrie tenir/se debattre existe enfin dans le modele ;
  3. l'A/B prouve qu'il ne casse rien.
Il deviendra actif le jour ou le cardio aura de la marge. C'est un socle,
pas un gain.


===========================================================================
# COUT PAR ACTION AU SOL — FAIT. ET LE CARDIO EST LE VRAI SUJET.
===========================================================================

## FAIT : cout d'evasion + surcout d'echec
/!\ CES VALEURS SONT CREEES, PAS HERITEES. Le clinch declarait ses couts
depuis toujours ; le sol n'en avait AUCUN. Elles sont donc posees dans
TECHNIQUES_ESCAPE (ground_v2.py) pour etre visibles et ajustables :
    upa / underhook_up / wall_up / standup  4      sortie de force
    roll_out / sweep                        3      dynamique avec levier
    recompose / shrimp_out / elbow_escape / slide_out / hand_fight_escape 2
    SURCOUT_ECHEC_SOL = 1.5   (calque sur le debout, engine.py:736)
Branche dans engine.py juste apres tenter_evasion. Verifie : 798
tentatives sur 80 combats (557 stoppees), 49.5 de cardio factures par
combat. La facturation arrive bien.

## A/B (3 graines, meme protocole) : DANS LE BRUIT, COMME PREDIT
    DEC 46.7 -> 46.0  (-0.7) | SUB 20.6 -> 22.4 (+1.8)
    TKO 19.3 -> 18.1  (-1.2) | KO  10.5 -> 10.8 (+0.4)
NOTER LE SIGNE DE SUB : +1.8. C'est l'amputation annoncee — le dessous se
vide, sort moins, reste au sol, se fait soumettre plus. Petit, mais dans
le sens prevu. Il faudra lui rendre en QUALITE.

## >>> LE CARDIO EST CASSE, ET C'EST LE PROBLEME DOMINANT DU MOTEUR <<<
Mesure du ratio a la fin de CHAQUE round (60 combats en 5 rounds) :
    round   moyenne  mediane  a zero
      1       0.135    0.000     58%
      2       0.007    0.000     92%
      3       0.000    0.000    100%
      4       0.000    0.000    100%
      5       0.002    0.000     96%
Reel : fin R1 ~0.75, fin R3 ~0.45, fin R5 ~0.20.
58% DES COMBATTANTS SONT A ZERO DES LA FIN DU ROUND 1. A partir du round
3, 100%.

### LE CALCUL EST SIMPLE ET SANS APPEL
    reservoir de depart                     100
    recuperation entre rounds  8 + recovery/6  ~19  (x2 = 38)
    BUDGET TOTAL SUR 3 ROUNDS               ~138
    DEPENSE REELLE PAR COMBATTANT           197.8
Il se depense 1.4x le budget disponible. Repartition :
    phase_debout      71.2  (36%)   frappes
    simuler_combat    71.9  (36%)
    simuler_round     54.1  (27%)
    clinch_sequence    0.6  ( 0%)
=> Ce n'est PAS une fuite localisee, c'est une echelle globale fausse.
   Les trois grands postes sont du meme ordre. Soit on divise la depense,
   soit on augmente reservoir + recuperation. A DECIDER ET MESURER.

### CE QUE CA EXPLIQUE, RETROACTIVEMENT
  - fatigue_factor() = 0.55 + 0.45*ratio est cloue a 0.55 des le round 2 :
    tout le monde combat au PLANCHER de performance en permanence.
  - le chantier 2 du carnet ("tout le monde finit a 0.18-0.31, vide,
    generalise") sous-estimait : c'est 0.00 des le round 1.
  - les couts par action (clinch ET sol) ne peuvent RIEN produire : on
    verse dans un verre deja vide. Les deux A/B le confirment.
  - la stat `cardio` d'un combattant ne peut pas peser sur un combat.
  - le round 3 "de la verite" n'existe pas : il n'y a pas de trajectoire.

## LES 5 ROUNDS (championnats / main events)
`rounds=5` FONCTIONNE deja, aucun crash. Mais :
    3 rounds : DEC 44.5 | finitions par round {1:140, 2:62, 3:53}
    5 rounds : DEC 31.8 | finitions par round {1:142, 2:52, 3:56, 4:51, 5:16}
  - DEC 31.8% contre ~50% reels en 5 rounds : beaucoup trop de finitions.
  - le cardio final est le MEME apres 5 rounds qu'apres 3 (mediane 0.130
    contre 0.152). Un combat de championnat ne fatigue pas plus qu'un
    combat en 3 rounds. C'est la meme cause : plancher atteint au R1.
  - taux de finition PAR round (en tenant compte des survivants) :
    R1 35%, R2 20%, R3 27%, R4 34%, R5 16%. Le R1 a 35% est tres au-dessus
    du reel (~15-18%), et le R5 a 16% est un creux inexplique.
=> Les 5 rounds ne demandent pas de code : ils demandent un cardio qui
   fonctionne. Ils sont surtout un REVELATEUR, et le meilleur banc de test
   du chantier 2 : si la courbe de cardio devient realiste, le format 5
   rounds se calibrera presque seul.

## ORDRE MIS A JOUR
    1. CHANTIER 2 — CARDIO. Bloquant pour tout le reste.
    2. Rendre en qualite ce qu'on a pris en quantite au sol (le +1.8 de SUB).
    3. La posture "je tiens" comme axe de gameplan (le 0.92 d'engine:845),
       HORS du trio normalise.
    4. Recalibrer, en 3 rounds ET en 5 rounds.
    5. Reprendre le portage JS sur un moteur assaini.


===========================================================================
# CHANTIER 2 (CARDIO) — INTENTION DE CONCEPTION, DONNEE PAR L'UTILISATEUR
===========================================================================
A APPLIQUER quand on attaque le chantier. Ce sont des DIRECTIONS, pas des
valeurs : les nombres se trouveront a la mesure.

## 1. LA RECUPERATION ENTRE ROUNDS DOIT PORTER PLUS
Aujourd'hui : `base = 8 + recovery/6` -> ~19 points sur 100, puis
`base *= (1 - chute_de_garde * 0.5)`.
Direction : en donner davantage, et la LIER aux stats.
  - le CARDIO gouverne l'energie qui revient
  - le MENTON (chin) gouverne la recuperation PHYSIQUE
C'est une distinction juste et reelle : reservoir d'un cote, encaisse et
capacite a repartir de l'autre.

### DEJA A MOITIE EN PLACE — a savoir avant de coder
  - `recovery` existe deja comme stat (engine.py:93) et c'est elle que
    recuperer_entre_rounds utilise.
  - adapter.py:144 la derive DEJA de `cardio*0.7 + menton*0.3`. Donc le
    menton alimente deja la recuperation, mais de facon INDIRECTE et
    noyee. L'intention de l'utilisateur est de rendre les deux voies
    EXPLICITES et separees, pas d'inventer un lien qui n'existe pas.
  - le lien degats -> mauvaise recuperation existe deja
    (`chute_de_garde`), donc le corps casse penalise deja le retour.
  - generator.py:212 declare `recovery` a 0 d'offset pour tous les
    archetypes : la stat ne differencie personne cote generator. A revoir
    en meme temps.

## 2. BAISSER LES COUTS PAR ACTION
La depense mesuree est de 197.8 par combattant pour un budget de ~138.
Il faut redescendre l'echelle globale.

## 3. LA HIERARCHIE A RESPECTER (contrainte de conception)
Ce n'est PAS negociable, c'est la forme que doit avoir le resultat :
    la LUTTE use plus que le STRIKING
    et c'est PIRE pour celui du DESSOUS
Donc, en cout par unite de temps :
    dessous au sol  >  lutte / clinch  >  striking
=> Quand on redescendra l'echelle, ne pas diviser tout par le meme
   facteur : c'est l'ORDRE entre les postes qui doit tenir, pas seulement
   le total. Verifier la hierarchie APRES la baisse, pas seulement le
   budget.

## 4. RESTE A FAIRE SUR LES COUTS (decide, pas encore code)
  - LE DESSUS AU SOL ne paie toujours RIEN : forfait 0.8/tick, que le
    passage de garde, la rafale de G&P et la tentative de soumission
    soient gratuits. Asymetrie qui FAVORISE le dessus (le dessous paie 4
    par relevee, 6 si stoppee). Peut contribuer a l'exces de soumissions.
    -> "on regle le dessus apres" (utilisateur).
  - LE CLINCH n'a pas de surcout d'echec. Par la meme logique que le
    takedown (pousser contre une resistance puis rester coince), il le
    merite.
  - PRINCIPE ETABLI : le surcout existe la ou l'echec a un cout PHYSIQUE
    DISTINCT (takedown stoppe, sortie de clinch ratee, evasion stoppee).
    Pas sur les frappes : le cout y est preleve AVANT la resolution
    (engine.py:453), donc un coup manque coute deja comme un coup touche.
    C'est correct — on depense en lancant, pas en touchant.


===========================================================================
# LE DESSUS AU SOL PAIE ENFIN — et il manque un INSTRUMENT
===========================================================================

## FAIT (ground_v2.py + engine.py)
Le dessus ne payait rien : forfait 0.8/tick, passage de garde, rafale de
G&P et tentative de soumission gratuits, pendant que le dessous paie 4 par
relevee et 6 quand elle est stoppee. Couts declares dans ground_v2.py :
    COUT_PASSAGE  = 2.5   x SURCOUT_ECHEC_SOL si le passage ne passe pas
    COUT_SUB_TOP  = 2.0   x SURCOUT_ECHEC_SOL si la soumission est defendue
    COUT_GNP_COUP = 0.35  PAR COUP LANCE dans la rafale (comme debout : on
                          paie le coup lance, pas le coup touche)
Les trois branches sont dans engine.py (progress / gnp / sub_top).

## A/B (3 graines, meme protocole)
    DEC 46.0 -> 48.2  (+2.2) | SUB 22.4 -> 22.6 (+0.2)
    TKO 18.1 -> 17.5  (-0.6) | KO  10.8 ->  9.2 (-1.6)
Le +2.2 sur DEC est le plus gros effet des trois correctifs de couts, mais
il reste a la limite du bruit a ce n. Sens coherent : le dessus se fatigue
a controler, donc il finit moins. NE PAS LE REVENDIQUER tant que le cardio
n'est pas repare.

## DEPENSE TOTALE : 197.8 -> 221.7 par combattant (budget ~138)
On est passe de 1.4x a 1.6x le budget. C'est ATTENDU et ce n'est pas un
probleme en soi : l'echelle entiere est fausse et c'est le chantier 2 qui
la reprendra. On a fini de poser les mecaniques, on n'a pas encore regle
les valeurs — c'est l'ordre voulu par l'utilisateur.

## >>> IL MANQUE UN INSTRUMENT, ET C'EST BLOQUANT POUR LE CHANTIER 2 <<<
Tentative d'attribuer la depense PAR PHASE : echec. 41% tombe dans un seau
"?" et `sol_dessous` n'apparait meme pas.
CAUSE : les couts sont factures dans engine.py APRES le retour des
fonctions de module (ex. `tech, dest = tenter_evasion(...)` puis
`bottom.depenser(...)` a la ligne suivante). Envelopper les fonctions de
ground_v2/clinch ne capture donc rien.
CONSEQUENCE : on ne sait pas dire aujourd'hui combien coute le striking
contre la lutte contre le sol-dessous. Or la contrainte de l'utilisateur
porte precisement sur cette HIERARCHIE :
        dessous au sol  >  lutte / clinch  >  striking
On ne peut pas verifier une hierarchie qu'on ne sait pas mesurer.
=> PREMIERE TACHE DU CHANTIER 2 : ajouter l'attribution par poste dans
   Fighter.depenser() lui-meme (un argument `poste="striking"` sur chaque
   appel, cumule dans un compteur), PUIS seulement toucher aux valeurs.
   C'est la regle du projet : instrumenter avant de corriger.

## ETAT DES COUTS PAR ACTION — LE MODELE EST MAINTENANT UNIFORME
    phase              cout par action   surcout d'echec
    debout frappe      oui               non (volontaire : le cout est
                                         preleve AVANT la resolution, un
                                         coup manque coute deja comme un
                                         coup touche)
    debout takedown    oui               x1.5
    clinch             oui               NON — reste a faire
    sol dessous        oui               x1.5
    sol dessus         oui               x1.5 (passage et soumission)
SEUL RESTE : le surcout d'echec du clinch (une sortie forcee qui reste
coincee doit couter plus qu'une sortie qui passe — meme logique que le
takedown).


===========================================================================
# INSTRUMENT DU CARDIO — EN PLACE, ET PREMIER TABLEAU PROPRE
===========================================================================

## FAIT : Fighter.depenser(cout, poste="autre")
Chaque depense est attribuee a un poste et cumulee (depense REELLE, apres
drain du corps) dans self.depenses sur le combat entier. Les 12 sites
d'appel d'engine.py sont attribues :
    striking, lutte, sol_dessus, sol_dessous, clinch, encaisse_corps, tempo
VERIFIE SANS EFFET : empreinte sha256 des logs de 50 combats identique a
l'archive v8 (f12d08b3378fd175 des deux cotes). L'instrument ne change
RIEN au moteur, au bit pres.
/!\ Piege de patch revecu et evite : premier essai rate sur UNE indentation
(8 vs 12 espaces) — l'assert a bloque AVANT le write, fichier intact,
repare au texte exact. La regle du carnet fonctionne.

## PREMIER TABLEAU PROPRE (80 combats, welter, par combattant, 3 rounds)
    tempo             76.2   34%   <- LE POSTE DOMINANT
    striking          46.0   20%
    sol_dessous       36.2   16%
    sol_dessus        20.7    9%
    lutte             20.6    9%
    clinch            16.3    7%
    encaisse_corps    11.2    5%
    TOTAL            227.2         budget ~138

## CE QUE LE TABLEAU DIT
1. LE PLUS GROS POSTE N'EST PAS UNE ACTION. "tempo" = 0.12/dt de vie
   passive (engine:1100). 76 points, 34% du total, plus que le striking.
   Le combat coute plus cher a EXISTER qu'a frapper. C'est le premier
   levier du chantier 2 : baisser le tempo libere du budget sans toucher
   au prix relatif des actions.
2. LA HIERARCHIE DEMANDEE EST DEJA PRESQUE LA sur les postes d'action :
   sol_dessous (36.2) > lutte+clinch (36.9 a deux) > ... sauf que le
   STRIKING (46.0) depasse tout. Deux lectures possibles : soit son cout
   par action est trop haut, soit c'est du VOLUME (il y a beaucoup plus de
   frappes que d'entrees). A trancher en regardant cout moyen PAR action
   et non par poste — l'instrument le permet maintenant.
3. Le budget est depasse de 89 points. tempo seul en fait 76.

## COMPARABILITE
Toute mesure d'issues est desormais a comparer a la NOUVELLE base (les
couts par action ont deja fait deriver mesure.py : DEC ~48, SUB ~22.8 sur
graine 11). Le calibrage gele historique reste la CIBLE de fin de
chantier 2, pas la base de comparaison des A/B intermediaires.


===========================================================================
# CHANTIER 2, PREMIERE CAMPAGNE — LE VRAI VISAGE DU PROBLEME
===========================================================================

## 1. LA QUESTION DU STRIKING EST TRANCHEE : C'EST DU VOLUME
Cout moyen PAR ACTION (80 combats) :
    lutte 6.47 | clinch 3.39 | sol_dessous 3.09 | sol_dessus 1.57
    | striking 0.41 | tempo 0.38
LA HIERARCHIE DEMANDEE EST DEJA CORRECTE PAR ACTION (une entree = 16x un
coup, le dessous 7.5x). Les 46 pts du striking = 112 frappes lancees. RIEN
A CORRIGER sur les prix relatifs.

## 2. LE TEMPO N'EST PAS LE LEVIER
Balayage 0.12 -> 0.03 (divise par 4) : mediane fin R1 passe de 0.00 a
0.08. Toujours vide. Plus gros poste COMPTABLE, mais le supprimer ne
remplit pas le reservoir : la depense d'action suffit a tout vider.

## 3. DEUX PIEGES DE BANC RENCONTRES ET DOCUMENTES
  a. importlib.reload(engine) NE SUFFIT PAS : les autres modules gardent
     leurs references. Trois conditions "differentes" ont donne des
     resultats IDENTIQUES A LA DECIMALE — les patchs n'etaient pas
     appliques. => TOUJOURS panser via sous-processus frais
     (python3 banc.py), jamais reload dans le meme interpreteur.
  b. instrument.reset() ECRASE le reservoir (x.cardio=100.0) APRES l'init
     du Fighter. Le levier "reservoir lie a la stat" etait annule par le
     banc lui-meme. Detecte parce que A == base a la decimale pres.
     => Si on lie un jour le reservoir a la stat, il faut AUSSI changer
     instrument.reset() (x.cardio = x.cardio_max).

## 4. RESULTATS PROPRES (sous-processus, 3 graines x 320)
    base                DEC 44.4 | SUB 27.8 | TKO 17.6 | KO  8.9 | R1 med 0.00
    A reservoir 70+stat*0.7            45.8 | 26.2 | 18.1 |  9.0 | 0.00
    A+B recup 12+cardio/4+rec/8        43.6 | 26.4 | 19.7 |  9.5 | 0.00
    A+B+C depense x0.75                36.1 | 27.2 | 22.9 | 13.2 | 0.22
    (C seul a x0.5, plus brutal :      35.6 | 25.5 | 28.3 |  9.6 | 0.38)

## >>> LA DECOUVERTE CENTRALE : LE MOTEUR EST CALIBRE AUTOUR DE LA
## SATURATION <<<
Quand le cardio EXISTE (C), une trajectoire apparait (0.38/0.09/0.00 —
enfin une pente !) mais les issues S'EFFONDRENT : DEC 36, TKO+KO ~38%.
CAUSE STRUCTURELLE : fatigue_factor() = 0.55 + 0.45*ratio multiplie
puissance, vitesse, precision, volume, et meme la taille des rafales de
G&P (engine:794). A ratio 0, tout le monde est cale a 0.55 : des frappes
molles, peu de finitions, 46.5% de DEC. C'est CET etat, permanent des le
round 1, qui produisait le calibrage gele. Redonner de l'energie rend les
frappes letales et casse tout.
=> ON NE PEUT PAS "REPARER LE CARDIO" SEUL. Le chantier est un
   RE-CALIBRAGE COUPLE : courbe de cardio realiste (fin R1 ~0.75, R3
   ~0.45) ET retuning simultane de la letalite (chances de KO/TKO,
   degats) pour retomber sur DEC 46.8 / SUB 19.3 / KO-TKO 32.6.
   L'un sans l'autre est impossible : c'est pour ca que tous les
   correctifs "neutres" l'etaient (verre vide), et que les correctifs
   "actifs" cassent tout (verre trop plein pour la letalite actuelle).

## PLAN POUR LA PROCHAINE SESSION (dans l'ordre)
  1. Poser la courbe cible : fin R1 ~0.75, fin R2 ~0.60, fin R3 ~0.45
     (et en 5 rounds : R5 ~0.20).
  2. Regler reservoir (A, avec le fix instrument.reset), recup (B, formule
     utilisateur cardio->energie / menton->physique), et echelle de
     depense (C gradue PAR POSTE pour respecter la hierarchie, PAS
     uniforme) jusqu'a obtenir la courbe — SANS regarder les issues.
  3. SEULEMENT ENSUITE retuner la letalite pour retrouver les issues
     cibles a courbe fixee.
  4. Vérifier les 5 rounds (DEC ~50%, le R5 doit finir des gens).
  5. Re-geler. Puis reprendre le portage JS sur le moteur assaini.


## QUESTION TRANCHEE : LE STRIKING, C'EST DU VOLUME, PAS DU PRIX
Cout moyen PAR ACTION (80 combats welter) :
    striking       0.82 / action   x 223 actions par combat
    sol_dessous   14.17 / action   x  10
    lutte         20.18 / action   x   4
La hierarchie PAR ACTION est deja exactement celle demandee : la lutte use
25x plus qu'un coup, le sol-dessous 17x. Le poste striking ne domine que
par le volume (223 coups/combat).
=> CONSEQUENCE POUR LE CHANTIER 2 : NE PAS BAISSER les couts par action du
   striking pour faire rentrer le budget — ca casserait une hierarchie
   deja correcte. Les leviers sont : le TEMPO (76 pts jusqu'a exister) et
   la RECUPERATION entre rounds (a lier cardio + menton, cf. intention
   utilisateur consignee plus haut).

## PROCHAINE SEANCE = DEBUT REEL DU CHANTIER 2
Ordre propose, une modif a la fois, A/B a 3 graines minimum a chaque pas :
    1. baisser le tempo (0.12/dt, engine:1100) et mesurer la courbe de
       cardio par round (l'objectif de forme : fin R1 ~0.75, R3 ~0.45,
       R5 ~0.20)
    2. recuperation entre rounds : les deux voies explicites
       (cardio -> energie, menton -> physique) + donner des offsets de
       recovery aux archetypes (generator.py:212, tous a 0 aujourd'hui)
    3. verifier la hierarchie par action APRES (elle est bonne AVANT)
    4. recalibrer en 3 ET 5 rounds vers le calibrage gele historique


===========================================================================
# CHANTIER 2 — LE CARDIO EST SOIGNE. LE CALIBRAGE EST A REFAIRE (attendu).
===========================================================================

## QUATRE MODIFS, CHACUNE MESUREE SUR LA COURBE
1. TEMPO_CARDIO : 0.12 -> 0.04 /dt (etait 76 pts/combat, plus que tout le
   striking). 69% a zero fin R1 -> 33%.
2. RECUPERATION A DEUX VOIES (design utilisateur) :
       energie  = 4 + cardio * 0.10     (le moteur)
       physique = 2 + chin  * 0.06      (l'encaisse)
       x etat : corps casse (chute_de_garde) et tete sonnee (x0.6)
   ~12-16 pts pour un profil moyen. /!\ premiere version a ~37 pts :
   courbe PLATE (R2 = R1, la minute rechargeait tout). La trajectoire
   vient d'une depense de round que la minute ne compense qu'A MOITIE.
3. ECHELLE_DEPENSE = 0.28, facteur GLOBAL dans Fighter.depenser(). Ne
   touche a AUCUN prix relatif (la hierarchie par action etait deja bonne:
   lutte 20/action, sol-dessous 14, coup 0.8). Un seul bouton.
   Essais : 0.40 (R1 .57, trop bas), 0.30 (plat car recup trop forte),
   0.28 avec recup reduite = la bonne forme.
4. ALLURE dans le GAMEPLAN (design utilisateur). rythme() multiplie le
   volume de chaque homme par gameplan["allure"]. Defaut pose par
   simuler_combat : 1.0 en 3R, 0.85 en 5R (gestion de championnat).
   AUCUNE taxe artificielle : l'allure augmente la cadence donc le nombre
   d'actions donc la depense REELLE, et fatigue_factor fait payer la fin.

## COURBES OBTENUES (50 combats, welter)
    3R : fin R1 0.73 | R2 0.45 | R3 0.31   (cible .75/.60/.45 — un poil
         raide en R2/R3, a affiner au recalibrage, la FORME est bonne)
    5R : 0.71 | 0.52 | 0.35 | 0.25 | 0.17  (cible R5 ~0.20 : atteinte)
    fatigue_factor fin de combat : 0.82 en moyenne (etait CLOUE a 0.55).
    La stat cardio et les choix tactiques peuvent enfin peser.

## LE CURSEUR ALLURE FAIT EXACTEMENT LE DESIGN DEMANDE
    5R allure 0.85 (gestion)      -> fin R5 a 0.245
    5R allure 1.00 (sans gestion) -> 0.168
    5R allure 1.15 (tout donner)  -> 0.101
Gradient propre et monotone. "Le gars peut tout donner R1-R2 mais le paie
par manque de cardio s'il ne finit pas vite" : c'est mesure. Le COACH du
jeu pourra imposer l'allure par le gameplan (consigne de coin).
NOTE : les lignes/round ne baissent PAS lineairement avec l'allure (164.6
a 0.85 vs 155.3 a 1.0) — c'est la compensation par la fatigue : plus
d'allure tot = plus fatigue = moins d'actions tard. Le bon indicateur du
curseur est le CARDIO FINAL, pas le volume brut.

## >>> LE CALIBRAGE A DERIVE — ATTENDU, ET C'EST LE PROCHAIN TRAVAIL <<<
mesure.py 55 3 apres chantier :
    TKO 36.6 | DEC 24.2 | SUB 20.9 | KO sec 14.8   (cible DEC 46.8...)
CAUSE EVIDENTE : des combattants frais (fatigue 0.82 au lieu de 0.55)
frappent plus fort, defendent mieux, finissent plus. Tout le calibrage
des seuils de KO/TKO avait ete fait sur des hommes CUITS EN PERMANENCE.
=> RECALIBRAGE COMPLET a mener : seuils de KO/TKO et conversion, vers le
   gele historique (DEC 46.5 / SUB 20.3 / TKO 19.5 / KO sec 10.5), en 3R
   ET en 5R. C'est le travail de la prochaine seance — PAS ajuster le
   cardio pour retomber sur les issues : la courbe de cardio est BONNE,
   ce sont les seuils de finition qui doivent se recaler sur elle.


## RELEVEES REHAUSSEES x3 — L'ASYMETRIE DU SOL EST ENFIN CELLE VOULUE
Constat (instrument, 120 combats lutteur vs kickboxeur) : 13.3 tentatives
de relevee par combat pour 18.9 pts au total — l'echelle globale 0.28
avait ecrase les couts d'evasion (upa rate = 1.68 pt reel). Se debattre 3
rounds coutait moins qu'un round de frappe.
CORRECTIF (dans les DONNEES, ground_v2.TECHNIQUES_ESCAPE) : x3.
    upa/underhook/wall_up/standup 4 -> 12 | roll_out/sweep 3 -> 9
    techniques (shrimp, elbow_escape...) 2 -> 6
    (upa rate = 5.0 pts reels desormais)
RESULTAT matchup : lutteur 0.412 -> 0.420, kickboxeur SOUS lui
0.611 -> 0.397. La victime finit plus cuite que le lutteur : c'est le
design demande ("pire pour celui du dessous", "tenter de se relever doit
vider").
CONTREPARTIE : courbe generale 3R descend a 0.62/0.37/0.28 (etait
0.73/0.45/0.31, cible 0.75/0.60/0.45). Un peu raide — NE PAS compenser a
la volee : c'est le travail du RECALIBRAGE, avec les seuils de finition.
LECON D'ECHELLE : toute valeur posee AVANT ECHELLE_DEPENSE doit etre
relue APRES. Le sprawl gratuit (defenseur de takedown ne paie rien) reste
un trou connu, non traite — prochain candidat de la meme famille.


===========================================================================
# >>> RECALIBRAGE TERMINE — NOUVELLE REFERENCE GELEE (08/08) <<<
# >>> LE MOTEUR EST GELE JUSQU'A LA FIN DU PORTAGE JS <<<
===========================================================================

## LA NOUVELLE REFERENCE (protocole : mesure.mesurer(40, seed, 3),
## graines 11 + 41 + 900, soit 3240 combats — REMPLACE l'ancien 55x3 mono-graine)
    DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3 | nul 0.8
    (par graine : DEC 46.9 / 46.7 / 46.8 — stabilite remarquable)
    gele historique pour memoire : 46.5 / 20.3 / 19.5 / 10.5 / 2.3
    Ecarts <= 0.5 pt partout sauf TKO sol (1.3 vs 2.3, mineur, note).

## FORMAT 5 ROUNDS — VALIDE SANS REGLAGE SPECIFIQUE
    roster mixte 45-85 : DEC 26.7% (etait 31.8 avant cardio)
    roster ELITE 78-95 : DEC 48.3%  <- pile le reel (~50%)
La population expliquait l'ecart : les vrais 5 rounds opposent des elites.
Le moteur GENERALISE — c'est la meilleure validation possible du chantier
cardio : aucune constante 5R n'existe dans le code.

## LES 5 BOUTONS DU RECALIBRAGE (tous dans engine.py, valeurs figees)
    CALIBRAGE_COMMOTION = 0.36   porte d'entree des commotions
    CALIBRAGE_FOIE      = 0.12   TKO au corps (faisait 22% des combats !)
    CALIBRAGE_SUB       = 0.66   part des soumissions qui aboutissent
    CALIBRAGE_KO_SEC    = 0.68   les deux chemins d'extinction
    CALIBRAGE_ARBITRE   = 0.48   conversion knockdown -> arret sur serie
Tous places dans engine.py et JAMAIS dans les modules portes (body.js,
ground_v2.js restent conformes au bit pres).

## LE JOURNAL DU RECALIBRAGE — les surprises, pour ne pas les revivre
1. Le premier bouton (commotion seul) NE MORDAIT PAS : TKO insensible de
   K=1.0 a K=0.08. Hypothese plafond testee et morte (mediane 0.033, rien
   n'approche 0.72). Vraie cause : COMPENSATION (moins d'arrets tot =
   combats plus longs = accumulation = multiplicateurs d'usure).
2. Decomposition par marqueur de log = l'outil qui a tout debloque :
   le TKO AU FOIE faisait 22% de TOUS les combats (reel ~2-3%). Des
   hommes frais placent enormement de corps, chaque foie touche relance
   le tirage. INVISIBLE dans les moyennes d'issues.
3. Deuxieme residuel : la SERIE NON DEFENDUE a 20.4%. Un attaquant frais
   convertit quasi TOUJOURS le knockdown (3 coups nets pendant le sonne).
   Reel : ~1 sur 2. D'ou CALIBRAGE_ARBITRE, qui re-roule a chaque coup.
4. SUB et KO sec : ecarts SYSTEMATIQUES sur 3 graines (pas du bruit) —
   corriges au dernier cran. Regle confirmee : a n=40x2 le bruit est
   ~±2.5 pts, ne JAMAIS conclure sur une graine.
5. Piege de patch revecu : insertion qui a casse une indentation et avale
   un `if` — UnboundLocalError immediat, repare au texte exact.

## CE QUE LE GEL SIGNIFIE
Plus AUCUNE modification d'engine.py, ground_v2.py, clinch.py, stance.py,
body.py, striking_v2.py, generator.py, adapter.py jusqu'a ce que le
portage JS soit FINI et conforme (striking_v2.js, clinch.js, engine.js,
et la reference ci-dessus reproduite en JS a 3 graines).
Les trous connus NON traites (volontairement, pour geler) :
  - sprawl gratuit (defenseur de takedown ne paie rien)
  - surcout d'echec du clinch
  - TKO sol a 1.3 vs 2.3
  - posture "je tiens" du dessous (le 0.92) comme axe de gameplan
  - rendre en qualite les relevees (le +1.8 de SUB paye par le dessous)
Ils sont pour APRES le portage, avec un nouveau passage de calibrage.


===========================================================================
# PLAN DE BASCULE PYTHON -> JS (decision utilisateur, 08/08)
===========================================================================

## LA SEQUENCE
1. Finir le portage : striking_v2.js, clinch.js, engine.js.
2. Porter les OUTILS DE MESURE en JS (mesure.js au minimum : generer les
   rosters via generator porte, classer les issues, protocole 40x3).
3. CRITERE DE BASCULE OFFICIEL : la version JS reproduit
       DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9
   avec le protocole mesure(40, seed, 3) sur les TROIS graines 11/41/900.
   Tant que ce n'est pas le cas, LE PYTHON RESTE LA REFERENCE.
4. Une fois la bascule actee : archiver le Python comme TEMOIN HISTORIQUE
   (avec sa chaine de verification complete), et ne plus y toucher.
   Toute evolution future du moteur se fait en JS.

## DEUX NIVEAUX DE VERIFICATION, deux roles distincts
  - LIGNE A LIGNE (meme graine, memes logs) : l'OUTIL. Le RNG est
    bit-exact, donc engine.js doit reproduire les MEMES combats. Si les
    stats divergent, le diff des logs dit a quelle ligne. C'est le
    debogueur du portage.
  - STATISTIQUE 3 GRAINES : le JUGE. Robuste au seul risque residuel
    connu — les transcendantes different du dernier ULP entre libm et V8
    (mesure sur gauss), un `random() >= total` peut basculer sur un cas
    limite rarissime. Le critere de bascule est donc statistique.

## RAPPEL DES CHIFFRES EXACTS (le critere se joue au dixieme)
    DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3 | nul 0.8


===========================================================================
# PORTAGE JS — ETAPES 3 ET 4 : striking_v2 + clinch  [CONFORMES]
===========================================================================

## striking_v2.js — 45 500 valeurs sur 5 graines, zero ecart
La table ARMES (14 armes x ~10 champs calibres) et ESQUIVABILITE sont
GENEREES par gen_tables.py, pas retapees. Banc : resolve_frappe et
choisir_arme pilotes dans toutes les configurations (accule, setup, cible
de coach, dernier coup, penalites).
Piege principal consigne : l'ORDRE des tirages par branche — le uniform
des degats n'est tire QUE si touche ; le random() du contre QUE si l'arme
est telegraphiee ; celui du check QUE si defense == "check". Et le setup
du banc : `uniform if random() < 0.4 else 0` est un COURT-CIRCUIT, le
uniform ne se tire pas dans la branche else.

## clinch.js — 2500 SEQUENCES COMPLETES sur 5 graines, zero ecart
Le banc pilote clinch_sequence entiere (pas les fonctions unitaires : la
sequence les couvre par transitivite) et compare TOUT : issue, acteur,
CHAQUE ligne d'events, stats des deux hommes (sig/usure/score/cardio), et
chaque degat recu via .add() dans l'ordre.
Pieges consignes :
  - veut_rompre : quatre if en cascade, chaque random() GARDE par sa
    condition d'etat, chaque return coupe la suite. Le court-circuit le
    plus dense du projet.
  - prise_superieure : random.choice ne tire QUE si aucune preference ne
    matche.
  - la fleche ASCII "->" des events est une SIGNATURE (le traducteur s'y
    accroche) — ne pas la normaliser en "→".
  - le contrat d_esc.add(zone, d) (objet a methode .add fourni par
    l'appelant) est conserve tel quel pour engine.js.

## ETAT DU PORTAGE : 6 modules sur 7
    alea (RNG) + stance + body + ground_v2 + striking_v2 + clinch : CONFORMES
    RESTE : engine.js (53 Ko) — la boucle de combat, les phases, le
    jugement, les 5 boutons CALIBRAGE_*, puis mesure.js et la BASCULE
    (critere : DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 a 3 graines).
engine.js est le morceau : le faire en SEANCE FRAICHE, d'un bloc, avec le
banc ligne a ligne sur de vrais combats complets des la premiere passe.


===========================================================================
# >>> LA BASCULE EST ACTEE — LE MOTEUR DE REFERENCE EST EN JAVASCRIPT <<<
# (08/08, critere du plan de bascule atteint)
===========================================================================

## LE CRITERE, MOT POUR MOT, ET LE RESULTAT
Plan : "le moment de bascule, c'est quand la version JavaScript reproduit
DEC 46.8 / SUB 20.8 / TKO 19.4 sur trois graines."
    node mesure.js 11 41 900 :
      graine  11 : DEC 46.9 | SUB 23.0 | TKO 17.5 | KO sec 10.0
      graine  41 : DEC 46.7 | SUB 20.4 | TKO 20.0 | KO sec 11.2
      graine 900 : DEC 46.8 | SUB 19.2 | TKO 20.6 | KO sec 11.4
      MOYENNE    : DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3 | nul 0.8
IDENTIQUE A LA REFERENCE GELEE AU DIXIEME, GRAINE PAR GRAINE. Le RNG etant
bit-exact, le JS n'a pas "retrouve la statistique" : il a rejoue LES MEMES
3240 combats.

## CE QUI A ETE PORTE DANS CETTE DERNIERE ETAPE
- engine.js (le moteur entier : Fighter, les 3 phases, takedowns, arbitre,
  jugement, les 5 boutons CALIBRAGE_*). Banc : 105 COMBATS COMPLETS sur 4
  graines (dont un lot en 5 rounds), 58 462 lignes de log comparees UNE A
  UNE + vainqueur + etat final -> 105/105 identiques DU PREMIER COUP.
- alea.sample : l'algorithme EXACT de CPython (deux branches selon la
  taille, seuil setsize inclus — le rater change les tirages consommes).
  mesure fait sample(40, 2) -> branche "selection set". 300/300 verifies.
- generator.js (archetypes/noms/volumes GENERES dans tables.js ; ordre des
  tirages : niveau -> archetype -> division -> 3 choice du nom -> profils
  st/volume/wr/cl/gr/ph/me -> garde -> stance_switching).
- mesure.js + instrument.reset. Banc de protocole de bout en bout :
  40 combats du protocole exact (rosters generes, noms, sample, reset),
  12 350 lignes -> 40/40 identiques.

## PIEGES DE PORTAGE AJOUTES (engine)
7. Les FORMATS Python des logs : {x:.0f} arrondit A LA PAIRE (0.5->0,
   1.5->2) — PAS comme toFixed. round(t) pareil. -> pyRound/fmt0.
8. {name:<14} = padEnd, {x:>5.0f} = padStart du fmt0.
9. coups_sonne / rs_knockdowns_subis n'existent pas a l'init (getattr
   defaut 0).
10. int() = Math.trunc ; head_damage reste int tant que seul le GnP y
   ajoute, float ensuite — str() Python et String() JS coincident sauf
   float a valeur exactement entiere (probabilite nulle, surveille par le
   banc de 58k lignes).

## CE QUE LA BASCULE CHANGE, CONCRETEMENT
1. LE PYTHON EST LE TEMOIN HISTORIQUE. Il reste dans le depot, INTOUCHE :
   la chaine de conformite (gen_ref_* -> verifier_*) le rejoue contre le
   JS a chaque execution, c'est sa fonction desormais. Toute modification
   du Python casserait la preuve — c'est voulu.
2. TOUTE EVOLUTION DU MOTEUR SE FAIT EN JS, uniquement. Les trous connus
   (sprawl gratuit, surcout d'echec du clinch, posture "je tiens" du 0.92,
   TKO sol 1.3, rendre en qualite les relevees) se traiteront dans
   engine.js/ground_v2.js/clinch.js, avec mesure.js comme protocole —
   et il tourne en ~2 minutes pour 3240 combats.
3. LE JEU peut maintenant brancher le vrai moteur : mma_manager_v2.html et
   combat_reel.html consommeront engine.js directement (les modules sont en
   CommonJS : prevoir un bundle ou un passage en ESM pour le navigateur —
   transformation MECANIQUE, zero logique).
4. rendu_combat.py (generateur de l'ecran) reste un outil Python du temoin;
   son equivalent JS se fera dans le jeu lui-meme, en lisant le meme log.


## js/combat.js — SIMULER UN COMBAT AVEC LE MOTEUR DE REFERENCE
    node js/combat.js                    aleatoire (welter, 3 rounds)
    node js/combat.js 27                 graine fixee, rejouable a l'identique
    node js/combat.js 27 poids_lourd 5   graine + division + rounds
Genere un petit roster (niveaux 55-88), tire deux hommes, joue le combat
complet et imprime le log entier + le vainqueur. C'est le moteur de
reference qui tourne — meme graine = meme combat, au tirage pres.
PROCHAINE ETAPE pour l'ECRAN : porter traducteur.py en JS pour que
combat_reel.html consomme ces combats en direct au lieu des
enregistrements de rendu_combat.py (bundle CommonJS -> navigateur requis).


===========================================================================
# LA CHAINE ECRAN EST EN JS — moteur -> traducteur -> combat_reel.html
===========================================================================

## traducteur.js  [CONFORME]
Banc : 24 VRAIS combats (SUB/TKO/KO/DEC, clinch, sol, un lot 5 rounds),
4465 etapes comparees champ a champ (x,y compris) -> 24/24 identiques.
Pieges consignes :
  - traduire() consomme DEUX flux : son rng local (Random(graine)) ET le
    module random GLOBAL via _autour() quand l'angle est absent. Le banc
    seed les deux.
  - le \\w Python matche les ACCENTS ("réussi", "défendue") ; toutes les
    regex JS utilisent [\\p{L}\\p{N}_]+ avec le flag u.
  - round(x,1) Python arrondit le demi AU PAIR, et les pas dyadiques
    (300/2^k) produisent VRAIMENT des demis exacts -> pyRound1.
  - .title() Python : majuscule sur chaque sequence alphabetique
    ("l'ombre" -> "L'Ombre").
  - e.get("st") : une liste presente est toujours vraie meme [0,0,0,0] ->
    tester !== undefined, pas la truthiness.

## node combat.js [graine] [division] [rounds] --html
La chaine complete de rendu_combat.py, entierement en JS :
simuler_combat -> traduire -> injection dans combat_reel.template.html ->
combat_reel.html (l'ecran anime). Assert de conformite du vainqueur
conserve. Les noms generes (avec espaces et guillemets) sont ramenes a des
mono-jetons pour les regex du traducteur (comme rendu_combat le fait avec
Kante/Okafor) ; le nom complet reste sur l'AFFICHE.
Sans --html : le log texte dans le terminal, comme avant.

## ETAT : LE JEU PEUT TIRER SES COMBATS ET LES MONTRER, SANS PYTHON
rendu_combat.py reste l'equivalent temoin. Prochaine etape d'integration :
le meme pipeline DANS mma_manager_v2.html (bundle navigateur des modules
CommonJS — mecanique, zero logique).


===========================================================================
# APRES LE MOTEUR : LE PLAN DE GESTION, ET LE PREMIER SOCLE (LE TEMPS)
===========================================================================

## LA DECISION D'ORDRE (discussion du 08/08)
Ni "toute l'interface d'abord" (des ecrans qui affichent de la fiction —
contraire a la regle "l'ecran ne raconte que ce que le moteur a tire"), ni
"tous les systemes en tunnel" (des mois sans rien voir tourner). LA BOUCLE
MINIMALE, chaque systeme branche dans le prototype des qu'il existe :
    1. le TEMPS (colonne vertebrale, fait ce jour)
    2. les CAMPS (le verbe central : entrainer -> combattre -> progresser ;
       chantier connu : pic de carriere a 24 ans au lieu de 30-33)
    3. CONTRATS + ARGENT (l'enjeu ; embryon dans le prototype)
    4. LIGUES (structure de l'opposition), puis SCOUTING (le systeme
       `percu` du moteur l'attend deja)
    5. MEDIA + DIALOGUE IA en dernier (habillage d'evenements qui doivent
       d'abord exister)
JALON QUI COMPTE : une saison jouable en boucle, meme moche.

## LE SOCLE TEMPS (js/temps.js) — VOLONTAIREMENT PAUVRE
Decision utilisateur : l'unite atomique est le JOUR (entrainer un truc
lundi, un autre mardi), la semaine est une VUE (jour/7). Pause et
defilement sont de la PRESENTATION, pas de l'etat : le coeur n'a qu'UNE
operation, avancer(nJours), et pas d'horloge — l'interface appelle
avancer(1) en rythme (lecture), n'appelle pas (pause), ou appelle avec 7.
Le coeur connait TROIS choses : le jour courant, des echeances
{jour, type, donnees} qu'il NE COMPREND PAS, des abonnes qui recoivent
chaque jour ecoule avec ses echeances. Il ne connait aucun pilier ; les
piliers le connaitront.
POURQUOI PAUVRE : on ne connait pas encore les besoins des camps/contrats/
ligues — un calendrier "intelligent" les devinerait faux. C'est le premier
systeme branche qui apprendra ce qui manque, sous un besoin reel.

## verifier_temps.js — 8 invariants, dont LE test d'extensibilite
Un systeme bidon (anniversaire) branche SANS toucher une ligne du coeur.
REGLE POSEE : le jour des camps, si on doit modifier le coeur de temps.js,
la base etait mal concue.

## demo_temps.html v2 — LE CALENDRIER MENSUEL (design utilisateur)
Grille au mois a cases visibles, navigation mois/annee en haut (◀ ▶ + ●
pour revenir au mois courant, feuilletage LIBRE sans faire avancer le
temps), "Jour suivant" / "Passer la semaine" / lecture-pause. Pastilles
sur les cases (or = evenement, rouge = combat, vert = argent), case du
jour cerclee accent, passe grise, clic sur une case -> son contenu (y
compris l'HISTORIQUE des jours passes, garde par un abonne).
VUE DATE : jour 0 du compteur = lundi 5 janvier 2026 (un vrai lundi, donc
jour%7 tombe juste) ; mois et annee se DERIVENT du compteur comme la
semaine. temps.js N'A PAS CHANGE D'UNE LIGNE pour ce calendrier — le test
d'extensibilite du carnet est passe en conditions reelles des la premiere
demande d'evolution.

## (v1, remplacee) la barre de temps facon FM
Tokens du prototype ("la salle, le soir"). Lecture ▶ / pause / x1 x2 x4 /
+1 jour / +7 jours, fil des jours, panneau "a venir" (horizon 21 j).
Deux systemes de demo y sont branches sans toucher au coeur, dont un loyer
qui SE RE-POSE tout seul tous les 28 jours via un abonne — la preuve que
les echeances recurrentes n'ont pas besoin d'exister dans le coeur.
PROCHAINE ETAPE : integrer la barre dans mma_manager_v2.html (seance
fraiche, gros fichier), puis premier vrai client du temps : les camps.


## DECISION : L'AVANCEMENT DU TEMPS EST GLOBAL, PAS PROPRE AU CALENDRIER
PRECISE PAR L'UTILISATEUR : comme FM, c'est un PETIT bandeau discret en
haut avec juste "Continuer" — et ca passe LE JOUR. Un seul composant monte
une fois, present sur tous les ecrans. Les commandes riches (Passer la
semaine, lecture/pause, feuilletage) restent DANS l'ecran calendrier, qui
est leur place. Hierarchie : un geste minimal partout, les manipulations
fines au calendrier.
EVOLUTION NOTEE POUR PLUS TARD (pas maintenant) : dans FM, "Continuer"
saute en realite jusqu'au prochain evenement qui concerne le joueur (les
jours vides defilent seuls). A faire le jour ou cliquer dix fois pour
traverser une semaine creuse devient penible — evolution du BANDEAU, pas
du coeur.
DEUX EXCEPTIONS :
  1. l'ecran de combat VERROUILLE le temps (il vit dans sa propre horloge) ;
  2. les decisions bloquantes (offre de contrat qui expire, combattant a
     aligner) : les systemes declareront "j'attends une decision" et c'est
     le BANDEAU qui refuse d'avancer et dit pourquoi — hors du coeur,
     temps.js ne comprend toujours rien. A construire avec le premier
     systeme qui en aura besoin (contrats, probablement).


===========================================================================
# LE MODELE D'ENTRAINEMENT — CONCEPTION COMPLETE (discussion du 08/08)
# STATUT : DECIDE, A DEVELOPPER EN IMAGE DANS JS (rien n'est code encore)
===========================================================================

## LA VISION
Le joueur GERE VRAIMENT les entrainements — c'est le coeur du metier de
coach, pas une delegation a 90% facon FM. Le calendrier n'est pas un truc
qu'on traverse, c'est un truc qu'on REMPLIT.

## LE TEMPS ET LE BOUTON (ressenti valide par l'utilisateur)
- Le JOUR est l'unite qu'on traverse. L'HEURE existe mais ne se traverse
  pas : elle STRUCTURE la journee (matin/midi/soir, creneaux facon grille
  MMA Factory) et COLORE le recit ("blesse a la seance du soir"). Jamais
  de navigation par heure.
- UN bouton "Continuer" : la journee SE JOUE (les seances s'executent dans
  l'ordre, l'XP tombe, les evenements sortent), puis 2-3 lignes de recit
  — un battement, pas un rapport ("sparring du soir : Okonkwo a touche
  Kante, rien de grave").
- Le bouton S'ARRETE TOUT SEUL sur decision (offre qui expire, blessure,
  demande de passage pro) et devient "Repondre". Sensation cible :
  appuyer = OUVRIR LA SALLE LE MATIN — la plupart des jours ca roule,
  certains jours quelqu'un t'attend a la porte avec un probleme.
- Le bandeau minimal FM ("Continuer" seul, partout) reste UNE PISTE, pas
  une decision — l'utilisateur reflechit encore a la forme exacte.
- Il faudra une INTERFACE DEDIEE de creation des plannings (actee, pas
  encore concue).

## AMATEURS : LA GRILLE COLLECTIVE
- Reference visuelle : le planning de la MMA FACTORY (creneaux
  matin/midi/soir, disciplines en couleurs = filieres : JJB vert,
  striking orange, MMA rouge, No Gi violet ; niveaux dans une meme
  discipline : Fondamentaux / normal / Academie).
- MODELES DE GRILLE interchangeables au depart (facon MMA Factory
  generaliste, ecole de striking, fabrique de grapplers, prepa
  competition) : le choix du modele = un choix d'IDENTITE de salle.
  Jamais de page blanche. Plus tard : l'entraineur amateur embauche
  propose SA grille par defaut, coherente avec son profil.
- L'ENTRAINEUR AMATEUR (le jeu) remplit et repartit par defaut ; le
  joueur reprend la main OU IL VEUT, POUR QUI IL VEUT (echanger des
  creneaux, deplacer des individus entre deux seances simultanees).
  Gestion OPT-IN : qui laisse tourner a un vivier qui progresse ; qui
  veut tout micro-gerer le peut. On gere des EXCEPTIONS sur une grille
  qui vit, pas 15 seances par semaine.

## PROS : L'INDIVIDUEL 12 MOIS SUR 12 (decision ferme utilisateur)
- JAMAIS de regime generique. Deux regimes qui alternent :
  - HORS CAMP = DEVELOPPEMENT : les axes choisis par le joueur (combler
    la lutte defensive, construire le cardio, ajouter une arme).
  - EN CAMP = ANTI-ADVERSAIRE : on ne se developpe plus, on prepare la
    solution du probleme (gameplan striking/lutte/clinch/allure/cible —
    litteralement l'entree du moteur —, sparring d'IMITATION du style
    adverse via les archetypes, le cloisonnement pro/amateur existant).
  - Arbitrage qui emerge tout seul : 8 semaines de camp = 8 semaines sans
    developpement. Enchainer les combats paie mais fige la progression.
- STAFF SEPARE : entraineurs amateurs = l'ecole ; staff pro = le travail
  individuel. La qualite du groupe pro = LES RECRUES DU JOUEUR + LE STAFF
  QU'IL A EMBAUCHE, rien d'autre.
- CREATION DES PLANNINGS PRO : le joueur fixe des PRIORITES (2-3 axes
  ponderes ex "lutte defensive 60% / cardio 40%" + une charge
  leger/normal/dur) et LE STAFF TRADUIT en semaine concrete posee dans
  les cases du calendrier (bons coachs, bons partenaires). La qualite de
  la traduction peut dependre du head coach pro (un mauvais fait des
  semaines molles avec de bonnes priorites).
  /!\ LE MANUEL EST UN DROIT TOTAL (demande ferme utilisateur) : chaque
  seance generee est modifiable/supprimable/remplacable, on peut poser
  les siennes, ou ignorer la generation et ecrire les semaines de A a Z.
  Le manuel n'est pas un autre systeme : meme calendrier, le joueur
  comme auteur au lieu du staff.
  A trancher en construisant : quand le joueur a retouche, le staff
  regenere-t-il par-dessus ? Instinct note : ce que le joueur a touche
  est VERROUILLE, le staff ne remplit que les trous.

## PASSAGE PRO : LES DEUX VOIES (decision utilisateur)
1. Le joueur PROPOSE — le combattant peut refuser (pas pret, courtise
   ailleurs). Avis de coach non categorique, comme toujours.
2. Le combattant DEMANDE — refuser a un cout (demotivation, depart vers
   la salle d'en face). Dilemme : le prendre trop tot gaspille du temps
   de staff, le faire attendre risque de le perdre.
Les deux convergent : une place au groupe pro SE PAIE en temps de staff.

## GEOGRAPHIE DES PROFILS (combattants ET coachs) — decision utilisateur
Des POURCENTAGES, JAMAIS une regle fixe (meme principe que les
archetypes : des distributions, pas des destins).
    Daghestan/Tchetchenie/Caucase/Kazakhstan : forte densite lutteurs/
      grapplers
    Bresil : JJB + boxe
    Asie du Sud-Est : boxe thai/kick ; Japon : striking + quelques
      lutteurs
    France : striking type kickboxing dominant
    (liste a etendre)
Un Francais lutteur EXISTE, il est juste RARE — la rarete cree la valeur
de scouting. Memes distributions pour les COACHS : l'expert du sol est
rare en France -> recruter du staff devient une affaire de reseau
international. La geographie donne au scouting son sens AVANT qu'il
existe : envoyer un scout au Daghestan = chercher un profil precis la ou
la densite est maximale.

## LA LOI DE PROGRESSION (decision utilisateur, unifie tout)
ON PROGRESSE A LA VITESSE DE SON ENVIRONNEMENT : s'entrainer avec plus
fort (coach OU partenaires) fait XP plus vite.
Seance -> XP sur les stats de l'axe travaille, module par :
    (qualite du coach sur CET axe) x (niveau des partenaires)
    x (intensite) x (courbe d'age)
Consequences voulues : le staff = multiplicateur mesurable ; les
partenaires = une RESSOURCE (un bon vivier amateur sert aussi les pros ;
recruter un pro moyen mais bon partenaire peut se justifier) ; le passage
pro pose le vrai debat big fish/small pond.
GARDE-FOU a calibrer : plafonner le bonus d'ecart (s'entrainer avec un
monstre trop au-dessus n'est pas infini), sinon strategie degeneree = un
champion et vingt sangsues.
La COURBE D'AGE est le chantier connu (pic a 24 au lieu de 30-33) — a
regler a ce moment-la, au banc, comme le reste.

## QUESTIONS ENCORE OUVERTES (a trancher plus tard)
- Le POTENTIEL : plafond cache par combattant (facon FM, mal estime par
  le scout) OU pas de plafond dur mais rendements qui s'ecrasent avec
  l'age et le niveau ? Decide la nature du scouting (chercher des pepites
  cachees vs chercher du temps de developpement).
- Le COUT du staff (salaires, reticence a s'expatrier).
- La forme exacte du bandeau Continuer.

## ORDRE DE CONSTRUCTION (inchange) : temps [FAIT] -> integration
calendrier+bandeau dans le prototype -> la grille amateur (premiere
cliente du temps) -> le pro (priorites/staff/camps) -> progression
branchee au moteur. EN IMAGE D'ABORD, EN JS : maquettes fonctionnelles
dans le prototype avant toute mecanique de progression chiffree.


===========================================================================
# LE SYSTEME DE MONTEE DE STATS — ETABLI (discussion du 08/08, soir)
# STATUT : DECIDE, A DEVELOPPER EN IMAGE DANS JS
===========================================================================

## 1. SUR QUOI TOMBE L'XP
Une seance travaille un AXE (lutte defensive, boxe, cardio...), et l'axe
arrose un GROUPE de stats du moteur — jamais une stat unique, jamais un
axe deconnecte du moteur. Ex : "lutte defensive" -> sprawl, whizzer,
balance ; "boxe" -> jab, cross, crochet, esquive_tete. Le moteur (~80
stats fines) reste LA verite ; les axes sont des robinets vers ses stats.

## 2. LA FORME DE LA MONTEE
Points fractionnaires accumules (invisibles), la stat monte de +1 au
franchissement d'un seuil, et LE SEUIL GROSSIT AVEC LE NIVEAU : 45->46 =
quelques bonnes semaines ; 85->86 = des mois. C'est ce qui rend un 90
precieux.

## 3. LE MULTIPLICATEUR D'ENVIRONNEMENT (la loi, chiffree)
    gain = base x coach x partenaires x intensite x age
  - coach : son niveau SUR CET AXE (le coach de sol n'accelere pas la boxe)
  - partenaires : moyenne des presents au creneau, avec PLAFOND
    anti-sangsue (+20 aide fort, +40 n'aide pas plus) ; en dessous de soi
    CA FREINE -> la terreur du groupe amateur stagne, ce qui motive
    mecaniquement le passage pro (big fish/small pond resolu par la loi).

## 4. LA DESCENTE (valide avec enthousiasme par l'utilisateur)
  - EROSION douce de ce qui n'est pas entretenu, seulement au-dessus d'un
    socle (on ne desapprend pas son jab, on perd son tranchant).
  - Le CARDIO s'erode vite, la TECHNIQUE tient bien.
  - L'AGE inverse la pente en fin de carriere : apres le pic,
    l'entrainement RALENTIT LE DECLIN au lieu de faire monter. C'est la
    que se reglera la courbe d'age (chantier connu : pic 24 -> 30-33).

## 4bis. BLESSURES ET MEMOIRE MUSCULAIRE (design utilisateur)
  - Une blessure/absence prolongee fait CHUTER les stats courantes
    pendant l'arret (le cardio s'effondre vite, la technique tient — meme
    pente que l'erosion, amplifiee).
  - Chaque stat garde son SOMMET ATTEINT : sous le sommet, la progression
    est ACCELEREE (~x2.5-3) jusqu'a le retrouver ; au-dela, vitesse
    normale. Reprendre est plus rapide qu'apprendre.
  - LE COUT EST MATHEMATIQUE, PAS PUNITIF (point utilisateur) : les
    semaines passees a re-gravir sont des semaines SANS progression
    nette, pendant que les autres avancent et que la fenetre d'age se
    referme. Le calendrier EST la punition. Blessures repetees = cumul
    naturel.
  - A calibrer plus tard : le sommet s'effrite tres lentement (age /
    blessures repetees) pour que la memoire ne soit pas eternelle a 38
    ans.
  - Effet design : la blessure devient une EPREUVE racontable (chute puis
    remontee rapide = le recit du comeback), pas un game over qui pousse
    a recharger la partie.

## 5. LE POTENTIEL — DECISION UTILISATEUR : PLAFOND CACHE
Une stat maximale PREVUE A LA CREATION du combattant, TOTALEMENT
INVISIBLE, filtree uniquement par la voix de l'entraineur.
TROIS GARDE-FOUS pour que ca marche (coherents avec les regles deja
posees du projet) :
  1. LE NOMBRE NE FUIT JAMAIS : aucune etoile, aucune barre, aucun tri
     cache dessus. Que des MOTS de coach — et les commentaires de coach
     ne sont JAMAIS categoriques (regle existante).
  2. L'ESTIMATION S'AFFINE AVEC L'OBSERVATION : le compteur
     `observations` du prototype sert a ca — plus le coach l'a vu, plus
     son commentaire approche le vrai, sans jamais l'atteindre. Un coach
     peut se tromper lourdement sur un gars vu deux fois.
  3. LE PLAFOND PLIE LA COURBE, IL NE FAIT PAS MUR : les gains s'ecrasent
     progressivement a l'approche — jamais d'arret net qui trahirait le
     nombre.
La DISTRIBUTION des plafonds produit les calibrages valides : ~7-8% du
vivier a un plafond niveau top 50, ~1% niveau elite.

## LE BANC DU SYSTEME (a construire avec lui)
Simuler 10 ans d'une salle et verifier : ~7-8% du vivier atteint le top
50, ~1% l'elite ; les courbes de carriere piquent a 30-33 ; un blesse de
6 mois retrouve son sommet en X semaines ; personne ne depasse son
plafond ; la strategie "un champion et vingt sangsues" ne paie pas.
Meme methode que le moteur : des cibles chiffrees, 3 graines, un banc.


===========================================================================
# LES 91% — LA SALLE ENTIERE, ET PERSONNE N'EST UN ANONYME (09/08)
===========================================================================

## LE 100% = TOUT LE MONDE QUI POUSSE LA PORTE
Les strates d'une vraie salle (ordres de grandeur, pas des regles) :
  ~60-70% adherents LOISIR (cardio, defense, defoulement) — l'ECONOMIE de
    la salle : les adhesions paient le loyer et les coachs bien avant que
    les pros rapportent ; ils remplissent la grille et donnent sa taille
    a la salle.
  ~15-20% competiteurs occasionnels (2-3 combats amateurs, plafond bas).
  ~8-10% vrais amateurs regional/national — LE VIVIER, d'ou sortent les
    passages pro.
  + les pros qui ne percent pas (journeymen/gatekeepers) : partenaires de
    sparring precieux (loi d'environnement), adversaires des debuts des
    prospects, et futurs COACHS a l'embauche quand ils raccrochent.

## DECISION FERME UTILISATEUR : PERSONNE N'EST UN ANONYME
PAS d'agregat, PAS de masse gérée en statistique. CHAQUE adherent est un
individu complet : nom, stats, progression journaliere, trouvable et
triable. REJET explicite du modele "la masse n'emerge que par evenements".

## TROIS CANAUX DE DETECTION DES TALENTS (ils cohabitent)
  1. LE JOUEUR LUI-MEME (canal principal, recompense l'attention) : le
     systeme de progression journaliere + LE TRI — trier l'effectif par
     progression sur les 30 derniers jours et VOIR ceux qui montent. Le
     late bloomer n'est pas un evenement scripte, c'est une DECOUVERTE
     que le joueur fait dans ses listes. Le tri multi-criteres du
     prototype gagnera des colonnes de progression.
  2. LE COACH : signale avec ses mots non categoriques (pour qui delegue).
  3. LE COMBATTANT : il vient faire ses preuves — ex. le gars du cours
     loisir qui DEMANDE une seance avec les pros. Decision a trancher
     (le Continuer s'arrete) : accepter = test en direct (la loi
     d'environnement rend la seance brutalement revelatrice — il se fait
     manger ou il surprend) ; refuser = peut-etre eteindre une ambition.

## LA NUANCE VALIDEE : INDIVIDUS PLEINS, GESTION SILENCIEUSE
Les loisirs sont des individus complets mais ils ne RECLAMENT rien (pas
de camps, pas de contrats, pas de sollicitations) tant que le joueur ne
va pas vers eux ou qu'eux ne viennent pas vers lui. 200 adherents ne
generent pas 200 sollicitations — mais chacun est nomme, observable,
triable.

## EN REFLEXION CHEZ L'UTILISATEUR (rien de decide)
La pyramide du banc : si le 100% inclut toute la salle, le "7-8% top 50"
(valide sur le vivier 45-85) devrait devenir un ratio A DEUX ETAGES
(~1-2% de TOUS les adherents au top 50, le 7-8% restant vrai AU SEIN du
vivier competitif) et le generateur devrait produire du bas de pyramide
(niveaux 15-40, inexistants dans les rosters actuels). A TRANCHER PAR
MAEL avant tout calibrage du banc de progression.


## PRINCIPE : LE STYLE SE DEDUIT DES STATS, JAMAIS L'INVERSE (09/08)
Decision utilisateur. L'archetype ne sert QU'A LA CREATION (ligne de
depart, distributions geographiques) puis devient un souvenir de
naissance : des que le combattant existe, l'etiquette ("lutteur",
"boxeur"...) est une LECTURE de ses stats a l'instant T — recalculee,
jamais stockee comme verite. UN LUTTEUR PEUT DEVENIR BOXEUR : dix ans
dans une salle au coin de striking fort et la lecture bascule. C'est
l'entrainement qui reecrit qui il est — et c'est le joueur qui ecrit ca.
Consequences :
  - libelles FLOUS et COMPOSES ("boxeur a base de lutte", "complet"),
    seuils sur dominantes striking/grappling + sous-familles, formulation
    non categorique comme le reste ;
  - le GAMEPLAN reste un CHOIX, pas une consequence : les stats disent ce
    qu'il sait faire, le gameplan ce qu'il va faire — l'ecart entre les
    deux est du gameplay (cacher son jeu) ;
  - a verifier quand la progression existera : qu'AUCUN code ne lise
    l'archetype d'origine pour autre chose que la generation
    (adapter.construire() derive deja le gameplan des stats : coherent).

### CORRECTION VOCABULAIRE (Mael, fan de MMA) : parler la langue du sport
"Striker/grappler" = vocabulaire d'analyste/jeu video, JAMAIS entendu par
un fan. Ce qu'on dit vraiment : la DISCIPLINE D'ORIGINE ("c'est un
boxeur", "un lutteur du Dagestan", "il sort du jiu-jitsu", "ancien
kickboxeur de K-1") et pour le sommet "COMBATTANT COMPLET".
Libelles du jeu :
  - la filiere d'origine SEULE, sans pays (precision Mael : "Lutteur",
    pas "lutteur du Dagestan" — la nationalite est deja sur la fiche, la
    repeter dans le style ferait doublon) : Boxeur, Kickboxeur, Karateka,
    Lutteur, Jiu-jitsuka, Judoka, Sambiste... La geographie ne sert qu'a
    la GENERATION (densites par region), jamais au libelle ;
  - les hybrides comme on les DIT : "boxeur avec une bonne lutte",
    "lutteur qui a developpe son striking" — LA BASE D'ABORD, l'ajout
    ensuite ; l'evolution de la phrase vient des stats ;
  - "combattant complet" = une RECONNAISSANCE (le sommet), pas une case
    par defaut.
La phrase raconte la carriere : arrive "lutteur", devient "lutteur qui a
developpe son striking", peut-etre un jour "combattant complet".

### TAXONOMIE DES STYLES, CORRIGEE PAR MAEL (09/08)
LECTURE EN PYRAMIDE : toujours le libelle LE PLUS PRECIS qui reste vrai.
  1. Une discipline domine -> on la nomme : Boxeur, Kickboxeur, Karateka,
     Lutteur, Jiu-jitsuka, Judoka, Sambiste...
  2. Fusion DE FRAPPE (plusieurs arts de percussion au meme niveau,
     ex. Holloway) -> "STRIKER". C'est le SEUL terme de fusion de famille.
  3. AU SOL, PAS DE TERME DE FUSION (correction Mael) : des SIGNATURES
     distinctes, chacune lisible dans les stats du moteur :
       - LUTTEUR : takedowns, sprawl, mat return, dessus — peu de subs ;
       - GRAPPLER : lignee lutte/sambo/catch — TRANSITIONS, passing,
         controle, scrambles, subs du dessus ; FAIBLE EN GARDE (un
         grappler sur le dos < un jiu-jitsuka sur le dos) ;
       - JIU-JITSUKA : garde, sweeps, subs du dos et de partout —
         takedowns moyens ;
       - Sambiste, Judoka : leurs melanges propres.
     Khabib = grappler ; Oliveira = jiu-jitsuka. Lire le libelle = savoir
     ou le combat sera dangereux.
  4. Fusion des deux familles -> "COMBATTANT COMPLET" (la consecration).
LA MANIERE est un axe SEPARE de la filiere : brawler, pressure,
contre-attaquant... — pas une discipline, une facon d'employer ses armes
(lisible dans agressivite/volume/chaos). Holloway = striker QUI AIME LA
GUERRE. OUVERT (a trancher par Mael) : la maniere affichee en second mot
sur la fiche, ou reservee aux descriptions/commentaires de coach.

### PROJECTIONS (JUDO) DANS L'AXE LUTTE — OUI (09/08)
L'axe d'entrainement "lutte" couvre TOUT ce qui amene au sol et l'empeche
(shots, trips, projections, sprawl) : il arrose shot, throws, sprawl,
balance, clinch_wrestling. Le moteur range deja les projections la (stat
`throws`, takedown `throw` defendu au grip_fighting, qui atterrit en SIDE
CONTROL la ou le double leg atterrit en garde fermee — l'avantage du judo
est deja dans les chiffres).
NUANCE : L'AXE REGROUPE, LA FILIERE DISTINGUE. Judoka et lutteur
s'entrainent au meme axe mais leurs signatures different : judoka =
throws + clinch_wrestling hauts, shot moyen (il projette depuis la
saisie) ; lutteur = l'inverse. Meme axe, deux profils lisibles.

### DISTRIBUTION FRANCE, AFFINEE (09/08) : ~30% FORTS EN JUDO
La France = 2e nation du judo au monde -> distribution francaise :
dominante striking kickboxing/muay thai, ~30% de profils forts en judo
(signature judoka : throws + clinch_wrestling hauts, shot moyen), lutte
pure RARE (le manque historique francais, que tout fan connait).
Ex reel du profil : Benoit Saint Denis (judoka militaire). Un prospect
francais lutteur = un trefle a quatre feuilles ; un francais bon en judo
= le pays le produit naturellement.

### VOCABULAIRE D'ECRAN : "PROJECTION", PAS "THROW" (09/08)
Principe : LE CODE GARDE SES NOMS ANGLAIS (moteur gele, chaine de
conformite — on ne renomme JAMAIS une stat du moteur), L'ECRAN PARLE
FRANCAIS via un dictionnaire de libelles (comme le traducteur fait deja :
side_control -> "CONTROLE LATERAL"). throws -> "Projections".
PRECISION MAEL : la regle n'est PAS "tout traduire" — c'est PARLER
COMME LES SALLES ET FANS FRANCAIS PARLENT, et ce parler est un MELANGE :
  - restent en anglais (vocabulaire francais de MMA de fait) : TAKEDOWN,
    sprawl, ground and pound, clinch, jab, cross... Jamais "tirer" ni
    une invention de traducteur ;
  - se disent en francais : Projections, garde, controle lateral, cle de
    bras, etranglement...
  - la prose du recit peut varier ("il l'amene au sol" se dit).
LE JUGE DE CHAQUE MOT : l'oreille de Mael — si ca s'entend dans un
commentaire francais ou une salle, c'est bon.
CHANTIER A FAIRE D'UN BLOC quand les fiches detaillees arriveront :
passer toutes les stats visibles au filtre de cette oreille.

### LES CALIBRAGES VALENT POUR LE MONDE ENTIER (09/08)
Confirmation Mael : la distribution des plafonds caches (~7-8% top 50,
~1% elite — base exacte a trancher, cf. pyramide en reflexion) s'applique
A TOUS les personnages du jeu, salle du joueur COMME salles machine. UN
SEUL generateur, memes pourcentages : pas de des truques pour le joueur.
Consequences :
  - l'avantage du joueur = LE METIER (detection, staff, environnement,
    retention), jamais le talent brut ;
  - l'elite nait surtout AILLEURS (la quasi-totalite des 1% grandit dans
    les salles machine) : le futur champion, on le croise en face — c'est
    ce qui rend la ceinture chere ;
  - le scouting = une COMPETITION contre les salles machine pour les
    plafonds rares.
Le banc de 10 ans mesure LE MONDE, pas la salle du joueur.

### LA PYRAMIDE, RESOLUE PAR MAEL : LE SOMMET EST RELATIF (09/08)
"Le sommet aura toujours la bonne taille — juste ce sera plus ou moins du
haut niveau." LE CLASSEMENT EST RELATIF PAR CONSTRUCTION (un top 15 a
toujours 15 places) ; la distribution des plafonds ne decide PAS de la
taille du sommet mais de sa QUALITE ABSOLUE, qui a le droit de flotter.
Consequences (le vrai sport, produit tout seul, sans script) :
  - DES EPOQUES : generations creuses (champion a 82 qui regne faute de
    mieux) et generations dorees (un 88 pas top 5) ; champions en carton,
    debats de GOAT ;
  - le moteur mesure deja l'absolu (stats absolues -> combats) : une
    generation doree DETRONE mecaniquement, les fenetres de domination
    s'ouvrent et se ferment seules ;
  - le joueur le ressent ("cette division est un panier de crabes" /
    "c'est le moment d'y placer mon gars").
CE QUI RESTE A CALIBRER : uniquement LA QUEUE de la distribution des
plafonds (frequence des tres hauts plafonds) = l'amplitude des epoques —
assez rare pour que les generations dorees soient des evenements, assez
frequent pour que le sommet ne soit pas eternellement mou. Le banc de 10
ans verifie : le niveau absolu des champions flotte dans une bande
credible, avec pics et creux. L'ancienne question "combien d'elites doit
contenir le monde" est MORTE — c'etait la mauvaise question.

### GESTION DES STATS — LE CADRE FINAL (09/08, valide par Mael)
  - LE JOUR = l'unite de PRODUCTION (chaque seance produit son XP — c'est
    ce qui rend le tri par progression possible). LA SEMAINE = l'unite de
    PILOTAGE et de lecture.
  - LE DOUBLE PLAFOND : niveau realise = MIN(plafond de talent [cache,
    fixe a la creation], plafond d'environnement [ce que staff +
    partenaires permettent, ~un cran au-dessus de leur valeur]).
    L'environnement joue sur LA VITESSE (multiplicateurs de la loi) ET
    sur LE TOIT (on stagne sous son talent dans une salle moyenne :
    "Traore talent 88 fait 74 dans une salle moyenne, 88 dans une salle
    d'elite ; un talent 65 fait 65 partout"). La salle d'elite ne
    fabrique pas du talent, elle permet au talent de se realiser.
    Ameliorer le staff = RELEVER LE TOIT pour tout le monde. Un gars qui
    stagne peut demander a partir dans une meilleure salle. Le drame
    silencieux a apprendre a voir : "il stagne... c'est lui ou c'est ma
    salle ?"
  - LE TROISIEME VOLEUR : LE TEMPS (rappel Mael). Blessures = chute +
    rattrapage x2.5-3 vers le sommet mais ZERO progression nette pendant
    tout ca, fenetre d'age qui se referme. Un talent 88 blesse trois fois
    jeune peut finir 80 dans la meilleure salle du monde — pas cappe,
    VOLE PAR LE CALENDRIER.
  - LES NOMBRES NE SE CHOISISSENT PAS, ILS SE DEDUISENT (meme methode que
    le moteur) : on fixe des TRAJECTOIRES DE REFERENCE et on tourne les
    boutons de progression.js jusqu'a ce qu'elles tombent au banc :
      - gamin 18 ans, gros plafond, environnement optimal : ~10-12 ans de
        35 au sommet, pic 30-33 ;
      - le meme en environnement moyen : plafonne vers 65-70 ;
      - adulte loisir 2x/semaine : des annees sur les fondamentaux, ne
        rejoint jamais le vivier ;
      - scenarios BLESSES : le meme gamin avec/sans le genou casse a 24
        ans = deux carrieres differentes.
    Boutons prevus : XP de base, courbe des seuils, force des
    multiplicateurs, vitesse memoire musculaire, erosion.

===========================================================================
# LE MODELE COACH (09/08, valide par Mael)
===========================================================================
## LES STATS D'UN COACH
  - LE SAVOIR PAR AXE (boxe, kickboxing, lutte, grappling, JJB, prepa
    physique...) — jamais une note globale. Branche sur le double
    plafond : LE SAVOIR DU COACH EST LE TOIT (un coach de sol a 60
    plafonne le sol de toute la salle vers ~65, peu importe les talents).
  - LA PEDAGOGIE, separee du savoir : LE SAVOIR FIXE LE TOIT, LA
    PEDAGOGIE FAIT LA VITESSE (le multiplicateur de la loi). Les deux
    profils classiques emergent : l'ancien champion qui n'explique rien
    (savoir 90/pedagogie 40) vs le regional qui fabrique des combattants
    (savoir 70/pedagogie 90).
  - Transverses (pas plus de trois) : L'OEIL (qualite des estimations de
    potentiel — regle la vitesse d'affinage de ses commentaires et la
    taille de ses erreurs), LA TACTIQUE (staff pro : traduction
    priorites->semaines, prepa anti-adversaire), LA GESTION DE GROUPE
    (coachs d'ecole : combien il fait tourner proprement).
  - Chaque role pese differemment : ecole = pedagogie + gestion de
    groupe ; coin pro = savoir profond + tactique.
## RECRUTEMENT : LE CV, PAS LES STATS (decision Mael)
  - VISIBLE : la carriere. Ancien combattant -> palmares public, savoir
    par axe deductible de ses stats de carriere, filiere connue. Coach de
    metier -> lignee et salles precedentes (plus flou).
  - CACHE : pedagogie, oeil, tactique — decouverts AUX RESULTATS, avec
    les memes outils que la detection des talents (trier la progression
    du groupe sur 3 mois : elle est molle -> "c'est eux ou c'est lui ?",
    le miroir de "il stagne, c'est lui ou ma salle ?").
  - LE MARCHE EN DECOULE : le coach PROUVE (track record public) coute
    cher — son cache est devenu visible ; l'ancien champion debutant =
    pari classique (savoir garanti, pedagogie inconnue, prix gonfle par
    le nom) ; la pepite = l'inconnu a grosse pedagogie (journeyman devenu
    faiseur de champions, pas cher car sans nom).
## ORIGINE
Generes avec les memes distributions geographiques (le coach de sol rare
en France). Pont naturel : LES COMBATTANTS QUI RACCROCHENT — savoir par
axe derive des stats de carriere, pedagogie et oeil tires A PART.

### REVELATION PROGRESSIVE DES STATS COACH (09/08, Mael)
Apres recrutement, les stats cachees APPARAISSENT EN FLOU et s'affinent
avec le travail — miroir exact du potentiel des combattants : jamais le
vrai nombre, une FOURCHETTE qui se resserre ("Pedagogie ~60-80" a deux
mois, "~70-78" a un an).
CHAQUE STAT SE REVELE PAR SES PROPRES PREUVES, donc a des vitesses
differentes :
  - PEDAGOGIE : la plus bruyante — quelques mois de progression du groupe
    et on sait ;
  - TACTIQUE : par camp — chaque gameplan qui marche/echoue le soir du
    combat resserre la fourchette ;
  - L'OEIL : le plus lent — ses jugements ne se verifient que quand les
    carrieres se deroulent ("ce gamin ira loin" en 2026... reponse en
    2029). Trois ans avant de savoir, comme dans la vraie vie.
Effet design : le vieux coach aux stats connues a une VALEUR
D'INFORMATION que le nouveau brillant n'a pas — le remplacer = repartir
dans le flou.

### LES COACHS PROGRESSENT AUSSI (09/08, valide par Mael)
Chaque stat progresse PAR SA PRATIQUE (symetrie avec les combattants,
rythmes propres, plus lents) :
  - PEDAGOGIE : avec les annees d'enseignement (des annees, pas des
    semaines) ;
  - TACTIQUE : avec les camps menes (chaque preparation est une lecon) ;
  - L'OEIL : avec les jugements VERIFIES (300 gamins vus et suivis >
    debutant) — la plus lente ;
  - SAVOIR PAR AXE : bouge peu (bagage d'une vie), peut monter au contact
    d'un meilleur — LA LOI D'ENVIRONNEMENT S'APPLIQUE AU STAFF : un jeune
    coach dans un staff dirige par un grand head coach apprend de lui. La
    salle forme des coachs comme elle forme des combattants.
PLAFOND CACHE pour les coachs aussi (certains ont un genie dedans,
d'autres resteront corrects a vie) — meme philosophie, meme mecanique.
PAS de declin physique (un coach de 65 ans est souvent au sommet ;
eventuel savoir qui se demode hors du haut niveau = raffinement pour plus
tard, pas un besoin).
CONSEQUENCE DE JEU : le jeune coach pas cher = un INVESTISSEMENT — bon
plafond cache, il grandit dans le staff... et dans cinq ans c'est le head
coach de confiance aux stats connues, OU les salles machine viennent le
DEBAUCHER. La salle devient une fabrique de coachs, avec les memes joies
et les memes trahisons.

### LE MATERIEL : 3 CATEGORIES x 3 ETOILES (09/08, idee Mael)
PAS d'amenagement de salle facon Sims — trois categories notees en
etoiles, lisibles en une seconde, upgrade = une decision claire avec un
prix :
    STRIKING  * a ***
    SOL       * a ***
    PHYSIQUE  * a ***
BRANCHEMENTS :
  1. Dans la LOI de progression : multiplicateur PAR FAMILLE D'AXES
     (striking -> seances de frappe, sol -> lutte/grappling/JJB, physique
     -> cardio/force). Facteur MODESTE — coach et partenaires restent les
     rois, le materiel ne fait jamais d'un mauvais coin une bonne salle.
     A voir au calibrage : a 1 etoile, leger TOIT sur le physique (pas de
     cardio d'elite sans vraie salle de prepa).
  2. Sur L'ATTRACTIVITE (peut-etre le plus important) : les adherents
     loisir (= l'economie) choisissent aussi pour les installations. Le
     materiel = LE PONT ENTRE L'ARGENT ET LE SPORTIF : investir attire
     des adhesions (revenu) ET accelere les combattants. Une salle ***
     attire mieux recrues et coachs — personne ne veut s'entrainer dans
     un garage, sauf coach legendaire.
  3. Donne a l'argent quelque chose a acheter des le debut : trajectoire
     du gerant = garage 1 etoile -> paliers chers -> la salle qui monte
     SE VOIT dans ses murs.

### LA CAGE : EQUIPEMENT A PART, PAS UNE CATEGORIE ETOILEE (09/08, Mael)
Achat emblematique, cher, binaire (2 niveaux eventuels plus tard).
EFFET STRUCTUREL — le cas le plus pur de "materiel = toit" : SANS cage,
le travail a la grille NE PEUT PAS SE FAIRE (on n'apprend pas le wall
walking sans mur) — les axes concernes (cage cutting, sorties de grille,
clinch contre la cage, lutte au grillage) progressent a peine, toit bas.
AVEC cage : progression normale. Pas un multiplicateur, une CAPACITE qui
s'ouvre.
Le moteur est DEJA pret a punir : cage_cutting, wall_walking, systeme
accule/grille, clinch contre cage, sorties le long du mur — ces stats
pesent lourd dans les combats. Les gars d'une salle sans cage se font
manger a la grille le soir du combat.
Histoire de jeu : la salle debutante sort des techniques qui s'effondrent
au grillage — jusqu'a l'achat de la cage, LE rite de passage d'une salle
de MMA (le garage devient une salle).

### demo_accueil.html v2 — L'ACCUEIL, VERSION PLEINE (09/08)
CRITIQUE MAEL SUR LA V1, a retenir comme regle : "ca fait vide — on a
juste envie de passer les jours, rien sur quoi s'arreter, pas de stats
consultables comme compte rendu de la veille avec les progressions. Et
ma decision (Bui avec les pros) n'a pas eu de suite le jour prevu."
=> DEUX REGLES D'ACCUEIL GRAVEES :
  1. CHAQUE JOURNEE JOUEE DOIT LAISSER DU CONSULTABLE : bloc "Hier a la
     salle" (chaque seance, presents, LES GAINS CHIFFRES par nom) + bloc
     "Progression 7 jours" (le tableau trie — l'outil de detection du
     joueur, directement sur l'accueil).
  2. TOUTE DECISION LAISSE UNE TRACE LE JOUR CONCERNE : accepter Bui =>
     le jeudi soir produit son recit ET son pic de progression visible
     (+ "invite" affiche sur le creneau pro du programme) ; refuser =>
     ca se voit aussi (recit + chiffres qui baissent). UNE DECISION SANS
     CONSEQUENCE VISIBLE EST UN JEU QUI MENT.
La v2 fait tourner une MINI-SIMULATION de progression (XP par seance
selon la grille et les presents, talents caches, graine fixe) pour que
les nombres soient vivants — dans le jeu, progression.js alimentera ces
memes blocs.

### (v1, remplacee) demo_accueil.html — LA PAGE D'ACCUEIL PAR DEFAUT (09/08)
Principe valide : l'accueil = "LA SALLE, AUJOURD'HUI" (ce que le coach
voit en poussant la porte), pas un menu ni un dashboard. De haut en bas :
  1. le jour + CONTINUER (le coeur battant, en premier) ;
  2. CE QUI T'ATTEND : les decisions en attente s'affichent AVANT tout,
     le bouton devient "Repondre" (or), on ne traverse pas une decision ;
  3. LE PROGRAMME DU JOUR : les creneaux de la grille (matin/midi/soir,
     pastilles couleur par filiere, qui donne la seance, combien
     d'inscrits) ;
  4. L'HORIZON : les 3-4 echeances qui viennent (combat en rouge, argent
     en vert) ;
  5. LE FIL DE LA SALLE : 2-3 lignes par journee jouee (recit), les jours
     a evenement en temps fort.
Continuer JOUE la journee et le recit tombe dans le fil. Deux decisions
de demo : Bui (cours loisir) qui demande sa seance avec les pros (jour
3), l'offre de matchmaker qui expire (jour 6).
Navigation actee : calendrier/effectif/fiches = ecrans ou l'on VA ; la
salle = l'ecran ou l'on REVIENT (chaque Continuer y ramene).
Les recits de la demo sont ECRITS (exemples) — dans le jeu ils sortiront
des vrais systemes. hub_salle.html est absorbe par cet accueil.

### v3 ACCUEIL — CHAQUE NOM EST UNE PORTE (09/08, exigences Mael)
Deux regles gravees apres la critique de la v2 :
  1. TOUT NOM AFFICHE, PARTOUT, EST CLIQUABLE et ouvre une FICHE (modale
     depuis le bas) : identite (age, division, STYLE en vocabulaire
     valide), statut du moment, BILAN MMA (V-D + repartition KO/SUB/DEC),
     HISTORIQUE DES COMBATS (resultat, adversaire, methode, round, date),
     progression 7 jours pour les membres. Fil, compte rendu,
     progression, programme, horizon, decisions : partout des liens.
     Les fiches se referencent entre elles (la fiche de Renaud pointe
     Okonkwo...).
  2. UNE OFFRE DE COMBAT DONNE ACCES A LA FICHE DE L'ADVERSAIRE AVANT de
     repondre (l'offre pour Kante nomme Vasile, grappler 8-2, cliquable —
     etudier puis decider). Le scouting minimal est DANS la decision.
  + BLOC GROUPE PRO sur l'accueil : chaque pro, division, style, bilan,
    et son STATUT VIVANT (combat dans X j / CAMP anti-adversaire si
    l'offre est acceptee / developpement avec ses axes ponderes).

### ANALYSE D'ADVERSAIRE, ACTIONS DE FICHE, NAVIGATION (09/08, valide)
1. ANALYSER UN ADVERSAIRE -> ESTIMATIONS DE STATS : une ACTION sur la
   fiche d'un adversaire exterieur. Coute du temps de staff ; qualite =
   l'oeil de l'analyste x les images disponibles (15 combats filmes >
   un debutant). Produit une section "Estimations" sur la fiche : des
   FOURCHETTES et des mots, jamais des nombres exacts ("lutte : forte
   75-85", "cardio suspect apres le R2"). SE BRANCHE SUR LE SYSTEME
   `percu` DU MOTEUR (deja existant dans engine.js) : la prepa anti-
   adversaire du camp se construit sur ce qu'on CROIT savoir — mal
   analyse = mal prepare.
2. LA FICHE EST LE HUB DE LA PERSONNE : tout ce qu'on peut FAIRE a
   quelqu'un se fait depuis sa page. Actions PAR TYPE :
   - amateur : proposer le passage pro · changer ses creneaux · fixer un
     axe · inviter au sparring pro · parler ;
   - pro : priorites (axes+charge) · chercher un combat · contrat ·
     camp · parler ;
   - loisir : inviter a une seance test · suivre de pres (watchlist) ;
   - adversaire ext. : analyser · suivre · cibler pour un des siens ;
   - coach : role · renegocier · discuter.
3. NAVIGATION VALIDEE : BARRE D'ONGLETS EN BAS (mobile-first), 5 entrees:
   SALLE (l'accueil, la ou on revient) · EFFECTIF (listes et tris) ·
   CALENDRIER · COMBATS (cartes, offres, resultats) · GESTION (argent,
   materiel, staff). Le bandeau jour+Continuer reste EN HAUT SUR TOUS les
   onglets. LES FICHES SONT DES SURCOUCHES (par-dessus n'importe quel
   onglet) — elles ne prennent pas de place dans le menu.

### demo_jeu.html — LA DEMO NAVIGABLE COMPLETE (09/08)
L'architecture validee, en image et jouable :
  - 5 ONGLETS EN BAS (Salle/Effectif/Calendrier/Combats/Gestion), bandeau
    jour+Continuer sticky en haut PARTOUT, fiches en surcouche partout.
  - EFFECTIF : ~72 adherents GENERES (noms, ages, styles, groupes,
    talents caches) + les nommes — personne n'est un anonyme, chaque
    ligne cliquable ; filtres par groupe (avec compteurs) ; TRI
    progression 7 j / nom / age. L'outil de detection du joueur, en vrai.
  - FICHES AVEC ACTIONS PAR TYPE (pro/amateur/loisir/adversaire/coach) ;
    l'action ANALYSER est FONCTIONNELLE : 3 j de staff -> section
    "Estimations du staff" en fourchettes sur la fiche adverse (Renaud
    pre-analyse par le staff pour le combat, Vasile a analyser soi-meme
    avant de repondre a l'offre — le geste scouting complet).
  - COMBATS : cartes a venir / offres / resultats. LE COMBAT D'OKONKWO SE
    JOUE au jour 5 (scripte demo) : resultat TKO R2, bilan mis a jour
    10-2, combat ajoute a l'historique de sa fiche, bourse +3 800 EUR,
    statut change — LA JOURNEE LAISSE DES TRACES PARTOUT.
  - GESTION : tresorerie VIVANTE (adhesions +1150 le lundi, loyer -1800
    le 14 et re-pose auto a 28 j), materiel en etoiles (Striking**,
    Sol*, Physique**) + LA CAGE a 12 000 EUR (message : sans elle le
    travail a la grille ne se fait pas), staff cliquable (Da Costa,
    Meyer — avec pedagogies estimees en fourchettes sur leurs fiches).
  Prochain grand chantier de fusion : demo_jeu.html + mma_manager_v2.html
  + la chaine moteur JS = UN SEUL jeu.

### LES CAMPS : ACHETER DE L'ENVIRONNEMENT TEMPORAIRE (09/08, idees Mael)
Deux mecaniques, memes fondations (la loi d'environnement + la geographie),
zero systeme nouveau — des MODIFICATEURS TEMPORAIRES D'ENVIRONNEMENT,
achetes :
1. PAYER DES SPARRING PARTNERS (importer l'environnement) : pour un camp,
   louer un partenaire du bon STYLE et du bon NIVEAU pour X semaines.
   Resout le vrai probleme du sparring d'imitation (pas de bon grappler a
   la salle = prepa anti-grappler en carton). La geographie fait le
   marche : le partenaire-grappler se trouve rarement en France — le
   faire venir du Daghestan coute plus cher que le regional. Qualite
   contre prix, a chaque camp.
2. PARTIR EN CAMP A L'ETRANGER (deplacer le combattant dans
   l'environnement) : N semaines dans une salle d'accueil (USA, Daghestan,
   Thailande...) = SON staff, SES partenaires, SON toit et SES
   multiplicateurs — pas les tiens. L'achat le plus puissant du jeu,
   avec TROIS CONTRE-POIDS obligatoires (sinon solution unique) :
     - le COUT enorme (salle + voyage + logement + semaines) ;
     - TON ABSENCE : leur staff prepare, pas toi — perte de main sur le
       gameplan, et ton coach ne progresse pas en tactique sur ce camp ;
     - L'AVEU : envoyer ailleurs = dire que ta salle ne suffit pas ; deux
       camps sublimes a l'AKA et le combattant peut se demander pourquoi
       revenir (risque de depart).
TRAJECTOIRE DE JEU VOULUE : jeune salle, tu ENVOIES et tu LOUES ; salle
mure, c'est TOI LA DESTINATION — les salles machine t'envoient leurs gars
et paient pour tes partenaires. Le niveau de salle devient un produit
(revenu + rayonnement).


===========================================================================
# >>> PASSATION — NOTE POUR LA PROCHAINE INSTANCE (09/08) <<<
===========================================================================
CE CARNET FAIT FOI. Le lire avant d'agir. L'archive contient tout :
Python = temoin historique (NE JAMAIS MODIFIER), js/ = moteur de
reference + socle temps, les demos HTML = les maquettes validees.

## CE QUI TOURNE (verifie)
- Moteur JS complet : js/lancer_verifs.sh (6 bancs) ; node mesure.js
  11 41 900 doit redonner DEC 46.8/SUB 20.8/TKO 19.4/KO sec 10.9 ;
  node combat.js [graine] [div] [rounds] --html -> ecran anime.
- js/temps.js + verifier_temps.js (8 invariants).
- Maquettes validees par Mael : demo_jeu.html (5 onglets, effectif 72,
  fiches-actions, analyse fonctionnelle), demo_accueil.html,
  demo_temps.html (calendrier mensuel), mma_manager_v2.html (ancien
  prototype gestion, a fusionner).

## LES PROCHAINS CHANTIERS (ordre du plan valide)
1. FUSION : demo_jeu + mma_manager_v2 + chaine moteur JS = UN jeu
   (brancher combat.js/traducteur dans l'onglet Combats — bundle
   navigateur des modules CommonJS, mecanique).
2. LA GRILLE AMATEUR en image (premiere cliente du temps) : modeles,
   entraineur qui remplit, joueur qui corrige.
3. progression.js : coder le systeme concu (axes->groupes de stats,
   seuils croissants, loi d'environnement, double plafond, erosion,
   blessures/memoire musculaire, plafonds caches) + LE BANC 10 ANS
   (cibles au carnet). C'est LE verrou qui rend tout vrai.
4. Le pro : priorites/staff/camps (avec sparring loues et camps a
   l'etranger).
5. Trous connus du moteur (en JS, nouveau passage calibrage) : sprawl
   gratuit, surcout echec clinch, 0.92 du dessous, TKO sol 1.3.

## REGLES DE TRAVAIL (Mael y tient, ne pas les rappeler, les APPLIQUER)
Instrumenter avant de corriger · une modif a la fois · 3 graines minimum
· relire la source, jamais par analogie · l'ecran ne raconte que ce que
le moteur a tire · graver au carnet sur "grave", PAS pendant qu'on
discute · ne pas transformer ses references (ex. FM) en decisions — il
reflechit a voix haute · vocabulaire : l'oreille du fan francais juge.


===========================================================================
# HYGIENE D'ARCHIVE — v24 -> v25 : LA DEUXIEME SOURCE DE VERITE EST MORTE
===========================================================================

## CE QUI A ETE TROUVE EN OUVRANT v24
La chaine complete repasse : 16 imports Python, les 6 bancs de
lancer_verifs.sh, 8/8 invariants du temps, et node mesure.js 11 41 900
redonne DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3,
GRAINE PAR GRAINE. Le moteur est intact. Trois problemes de DEPOT, pas de
code, ont ete traites.

## 1. LE DOSSIER PROJET CONTENAIT DU PYTHON PERIME (le piege du carnet, en vrai)
Le Projet portait ses propres copies des fichiers moteur, figees tres tot :
    engine.py       29 919 o   contre 61 261 o dans le zip
    ground_v2.py    12 863 o   contre 18 196 o
    striking_v2.py  10 687 o   contre 12 793 o
    clinch.py, generator.py, mma_manager_v2.html : idem
C'est un moteur d'AVANT le cardio et AVANT le recalibrage. Une instance qui
aurait lu les fichiers du Projet au lieu du zip aurait travaille sur un faux
temoin en croyant lire le temoin gele — et la chaine de conformite n'aurait
rien vu, puisqu'elle tourne dans le zip.
SUPPRIME. REGLE POSEE : LE ZIP FAIT FOI POUR LE CODE. Le Projet ne porte que
des documents que le zip n'a pas — et si possible que du .md, pour que la
regle se tienne toute seule.

## 2. LES QUATRE FICHIERS QUI N'EXISTAIENT QUE DANS LE PROJET
Rapatries dans l'archive avant de vider le Projet :
    DECISIONS.md            registre des decisions de cadrage (A1-A4 : point
                            de vue coach, mode coach contre mode carriere,
                            organisation propre reportee, univers fictif —
                            RIEN de tout ca n'est dans ce carnet)
    GDD_MMA_Manager__1_.md
    STATS_COMBATTANT.md     la fiche des ~80 stats. Servira au chantier
                            "vocabulaire d'ecran" (passer chaque stat
                            visible au filtre de l'oreille du fan).
    progression.py          BROUILLON PERIME, bandeau pose en tete du
                            fichier. Il contredit la conception du carnet
                            (potentiel = loi normale unique ~3% elite, pas
                            de double plafond, pas de loi d'environnement,
                            pas d'erosion ni de memoire musculaire) et il
                            est en Python, qui est gele. CONSERVE pour deux
                            idees seulement, a reprendre dans
                            progression.js : le budget de carriere en
                            semaines (~24 semaines de developpement par an,
                            le reste part en camps/recuperation/repos) et le
                            decoupage des stats en familles qui ne
                            vieillissent pas au meme rythme.

## 3. LE BANC DU TRADUCTEUR ETAIT AMPUTE — RECONSTITUE
gen_ref_traducteur.py etait dans v24, verifier_traducteur.js NON, et la
chaine ne l'appelait pas. Le carnet annoncait pourtant traducteur.js
CONFORME 24/24 : cette preuve-la ne pouvait plus se rejouer.
verifier_traducteur.js reecrit et remis dans lancer_verifs.sh :
    24 combats traduits · 35 954 champs compares · 24/24 identiques
Il compare CHAQUE etape champ a champ (x,y compris), l'UNION des cles dans
les deux sens (une cle en trop cote JS est une divergence), la finition et
la duree.
/!\ CE QUE LE BANC EXIGE : traduire() consomme DEUX flux de hasard, son rng
local (graine_trad) ET le module global via _autour() (graine_glob). Les
deux se posent avant chaque appel. Verifie que le banc DISCRIMINE : en
decalant la seule graine globale de +1, il tombe a 0/24.
LECON GENERALE : un generateur de reference sans son comparateur ne prouve
rien. Tout gen_ref_*.py doit avoir son verifier_*.js DANS lancer_verifs.sh —
c'est la chaine qui est la preuve, pas les fichiers pris un par un.

## ETAT DE v25 (61 fichiers)
v24 + les quatre fichiers ci-dessus + verifier_traducteur.js. Les
reference_*.json et tables.js restent EXCLUS de l'archive : ils sont
regeneres par lancer_verifs.sh, les embarquer recreerait exactement le
probleme qu'on vient de supprimer (deux sources pour les memes tables).
Chaine repassee apres montage : 7 bancs conformes, mesure.js au dixieme.


===========================================================================
# FUSION, ETAPE 1 : LE BUNDLE NAVIGATEUR — LE MOTEUR ENTRE DANS LA PAGE
===========================================================================

## POURQUOI C'EST LA PREMIERE PIERRE
La fusion (demo_jeu + mma_manager_v2 + chaine moteur) bute sur un point
mecanique : les modules sont en CommonJS, une page HTML ne sait pas faire
`require`. Tant que ce n'est pas resolu, aucun ecran ne peut tirer un vrai
combat — et un ecran qui affiche autre chose qu'un vrai combat viole la
regle 7. Donc : le bundle d'abord, l'interface ensuite.

## js/bundler.js — TRANSFORMATION MECANIQUE, ZERO LOGIQUE
    node js/bundler.js   ->  js/moteur.bundle.js  (12 modules, 133 Ko)
Chaque module est enferme TEL QUEL dans une fonction (module, exports,
require) ; un mini-require resout "./x.js" dans une table. AUCUNE ligne des
modules n'est reecrite : le moteur du navigateur est litteralement le meme
fichier que celui des bancs de conformite. C'est ce qui rend la
verification ci-dessous suffisante.
L'ordre n'est PAS ecrit a la main, il vient d'un tri topologique sur les
require :
    alea -> stance -> body -> tables -> striking_v2 -> clinch -> ground_v2
    -> engine -> generator -> traducteur -> mesure -> temps
Ajouter un module ne demande que de le citer dans RACINES.
La page obtient window.MMA = {alea, engine, generator, traducteur, mesure,
temps, require}.
[MAJ fin de seance : + fiches, verdict, profil, chrono. 16 modules, 159 Ko.
 Et window.MMA_ECRAN, servi a part par js/gabarit.js.]
/!\ tables.js etant GENERE par gen_tables.py, le bundler REFUSE de tourner
s'il est absent plutot que de produire un bundle faux en silence.

## js/verifier_bundle.js — le bout de la chaine, pas les maillons
Le bundle est charge comme le ferait une balise <script> : contexte vm avec
un global vierge, SANS le require de Node — s'il en dependait encore, le
banc casserait ici et pas dans le navigateur trois semaines plus tard.
Compare, modules contre bundle :
    6 combats complets (3 et 5 rounds, 3 divisions) : vainqueur + 3375
    lignes de log une a une
    1446 etapes de traducteur, champ a champ
    le protocole mesurer(40, 11, null, 3) en entier, division par division
    -> CONFORME
Banc verifie DISCRIMINANT : en decalant CALIBRAGE_SUB de 0.66 a 0.60 dans
le bundle, il tombe en echec sur les six divisions.
Ajoute a lancer_verifs.sh, qui fait maintenant HUIT bancs.
[MAJ fin de seance : ONZE bancs, et verifier_bundle compare aussi le verdict.]

## PIEGE RENCONTRE (encore la regle 4 : relire la source)
Premier jet du banc ecrit avec des signatures DEVINEES par analogie avec le
Python : `simuler_combat(fa, fb, {rounds, verbose})` et `mesurer(40,11,3)`.
Le JS prend des POSITIONNELS : `simuler_combat(f1, f2, rounds, verbose)` et
`mesurer(n_par_div, seed, divisions, n_rosters)`. Symptome trompeur : des
combats verbeux et des DECISIONS 0-0 (rounds recevait un objet, verbose
restait a true). Aucun crash — c'est exactement le genre d'erreur qui
passe pour un resultat.

## CE QUI RESTE POUR LA FUSION (l'interface, le gros morceau)
1. demo_jeu.html charge moteur.bundle.js et, dans l'onglet COMBATS, joue le
   combat du jour avec MMA.engine au lieu du resultat scripte (aujourd'hui
   Okonkwo TKO R2 en dur au jour 5).
2. Brancher MMA.traducteur + combat_reel.template.html en surcouche :
   l'ecran anime se lance depuis la carte de combat. L'assert de conformite
   du vainqueur (rendu_combat.py, repris dans combat.js) doit etre porte
   dans cette voie aussi — c'est lui qui garantit la regle 7 cote jeu.
3. Absorber mma_manager_v2.html : ses ARCHETYPES/FOCUS sont DEJA
   synchronises avec refonte.JEU (verifie au carnet), donc c'est de la
   reprise d'ecrans, pas de donnees.
4. Le jour ou le jeu tire ses combattants avec MMA.generator, verifier que
   la divergence des deux bancs ne revient pas : c'est adapter.py
   (fiches du prototype) qui l'avait causee, et adapter n'est PAS porte en
   JS. Decider a ce moment-la : soit le jeu genere via generator (chemin
   du calibrage gele), soit il faut porter adapter ET remesurer.


===========================================================================
# FUSION, ETAPE 2 : UN SEUL FORMAT DE FICHE — adapter NE SERA PAS PORTE
===========================================================================

## LA DECISION (tranchee avec Mael)
adapter.py existe pour convertir une fiche au format PROTOTYPE en Fighter
moteur. Il ne sera PAS porte en JS, et il est appele a disparaitre :
  - le calibrage gele est pose sur generator (mesure.py ne contient aucune
    reference a adapter) : l'onglet Combats passe donc par MMA.generator,
    chemin deja porte et conforme, sans risque ;
  - quand progression.js existera, la verite d'un combattant sera les ~80
    stats du moteur elles-memes, modifiees jour apres jour. Il n'y a plus
    rien a convertir : la fiche EST le Fighter. Porter adapter, c'etait
    porter un pont vers une rive qui demenage ;
  - sa derniere fonction propre — deriver le gameplan des stats — est
    justement celle qui a ete retiree par decision : "le gameplan reste un
    CHOIX, pas une consequence".
CE QUI SE PERD, ET QUAND IL FAUDRA Y REVENIR : les 4.6 points de SUB
inexpliques de test_raccord (23.9 contre 19.3) disparaissent avec le banc
qui les mesurait. Le probleme qu'ils signalaient, lui, reviendra le jour ou
progression.js produira des combattants qui ne ressemblent plus aux rosters
de generator. C'EST LA qu'il faudra remesurer, pas avant.

## js/fiches.js — LES NOMMES DU JEU, AU FORMAT DU MOTEUR
Okonkwo, Kante, Renaud, Vasile, Traore : les fiches de demo_jeu.html
ecrites en STATS. Ce que la fiche disait en mots est desormais dans les
nombres — "cardio suspect apres le R2" de Renaud = cardio -12, recovery -8.
Le style affiche devra se DEDUIRE de ces stats (principe du carnet), jamais
l'inverse.
Deux regles de construction, toutes deux tenues par le banc :
  1. AUCUN TIRAGE. construire() ne touche pas au rng. Sinon la graine d'un
     combat dependrait du nombre de fiches montees avant lui.
     (generer_combattant consomme le rng, lui : il fait NAITRE quelqu'un.)
  2. TOUTES LES CLES SONT ECRITES. Une cle absente vaut 50 EN SILENCE quel
     que soit le niveau : un champion avec un jab de debutant, et rien ne
     le signale. On ecrit les ECARTS a un `base`, mais toutes les cles
     existent au final — et une cle mal orthographiee LEVE.

## js/verifier_fiches.js — 5 invariants
Le plus utile est le 2 : monter la MEME fiche a deux niveaux et exiger que
CHAQUE cle bouge. Toute cle figee est une cle qu'on a oublie d'ecrire —
c'est le seul moyen d'attraper un defaut qui, sinon, ne se verrait qu'en
combat, sous forme d'un combattant vaguement mou.
Le 5 joue les trois affiches du prototype de bout en bout (moteur ->
traducteur).

## FORME DES AFFICHES (120 graines chacune, sonde jetable)
    Okonkwo c. Renaud  : Okonkwo 77%   DEC 78 · TKO 18 · KO 18 · SUB 6
    Kante   c. Vasile  : Vasile  74%   DEC 92 · SUB 23 · KO 4 · TKO 1
    Traore  c. Kante   : Kante   78%   DEC 69 · SUB 36 · KO 11 · TKO 4
    Traore  c. Renaud  : Renaud  91%   DEC 48 · TKO 35 · KO 23 · SUB 14
Formes coherentes avec les fiches : le jiu-jitsuka de 19 ans se fait
demonter par le brawler (menton -6, power -10) mais lui vole 14 combats par
soumission depuis la garde — il te soumet ou il dort. Vasile favori sur
Kante : c'est ce qui donne son sel a la decision de l'offre.
/!\ NE PAS LIRE CES DEC COMME UN CALIBRAGE : ce sont des affiches
individuelles, pas le protocole. Le piege est deja consigne au carnet
(l'affiche du tournoi contre les 300 combats).

## RESTE POUR LA FUSION
Il reste l'INTERFACE : demo_jeu.html charge moteur.bundle.js, l'onglet
COMBATS joue Okonkwo c. Renaud avec MMA.engine + MMA.fiches au lieu du
resultat en dur (jour 5), et combat_reel.template.html s'ouvre en surcouche
depuis la carte. L'assert de conformite du vainqueur doit etre porte dans
cette voie aussi : c'est lui qui tient la regle 7 cote jeu.


===========================================================================
# FUSION, ETAPE 3 : LE COMBAT DU JOUR 5 EST TIRE PAR LE MOTEUR
===========================================================================
(point 1 des quatre de l'ETAPE 1 : FAIT)

## CE QUI A CHANGE DANS demo_jeu.html
Une balise `<script src="js/moteur.bundle.js">` avant le script de la page,
et un seul point d'injection reecrit : le bloc `if(e.donnees.id==="combat1")`.
Le repere de depart : le resultat scripte (Okonkwo TKO R2) tenait en CINQ
endroits, tous accroches au jour 5 — l'evenement, le repos post-combat, le
statut, la carte a venir, la ligne d'historique. Un seul portait la
decision ; les autres la lisaient.

    jouerAffiche(idA, idB, rounds, graine)
      -> rng.seed(graine) ; fiches.fighter x2 ; mesure.reset x2
      -> engine.simuler_combat
      -> rng.seed(graine+1) ; traducteur.traduire
      -> verdict.verdict
      -> ASSERT EN TRIANGLE, puis l'objet du combat

/!\ traduire consomme DEUX flux : le rng global ET sa graine locale. Les
deux se posent avant l'appel (patron repris de verifier_fiches.js).

## LA GRAINE EST POSEE AVEC L'ECHEANCE, PAS AU MOMENT DE JOUER
    t.poser(5,"combat",{...,a:"Okonkwo",b:"Renaud",rounds:3,graine:5})
Le combat existe avant d'etre regarde, et il se rejoue a l'identique — c'est
ce dont l'ecran anime aura besoin a l'etape suivante pour montrer CE
combat-la et pas un autre. Regle posee : graine = jour de l'affiche.
AUCUNE graine n'a ete essayee pour obtenir un resultat plaisant ; graine 5
donne une victoire aux points 28-26, pas le TKO R2 du script.

## TOUT EST DERIVE, LES DEUX COTES COMPRIS
Carte de resultat, statut de fiche, historique, fil du jour : plus une seule
chaine en dur. Et les DEUX bilans bougent — l'ancien code n'ecrivait que
celui d'Okonkwo, Renaud restait 11-4 apres avoir perdu.
Chemin DEFAITE teste (graine 1) : l'ancien ecran ne savait dire que
"Victoire". La bourse reste +3 800 EUR a plat : un bonus de victoire est une
decision de conception, pas de branchement.

## PAS DE REPLI SCRIPTE
Si le bundle manque, la page LEVE avec un message qui dit quoi faire. Un
ecran qui inventerait un resultat serait pire qu'un ecran vide — c'est
exactement ce que la regle 7 interdit.

## VERIFICATION (bancs jetables, supprimes depuis)
La page entiere rejouee dans un contexte vm avec un DOM minimal, bundle
charge comme une balise <script> (donc sans le require de Node) :
elle tourne jusqu'au jour 5, sur graine gagnante ET perdante.
120 graines sur l'affiche -> Okonkwo 77%, DEC 78 / TKO 18 / KO 18 / SUB 6 :
exactement les chiffres deja consignes plus haut. Le chemin navigateur est
bien le chemin des bancs.


===========================================================================
# js/verdict.js — LE COMPTE RENDU, QUI N'EST PAS LA CHRONOLOGIE
===========================================================================

## POURQUOI UN MODULE ET PAS UNE RETOUCHE DU TRADUCTEUR
Question de Mael : "TKO" tout nu suffit-il a l'oreille du fan ? Non.
Mais traducteur.js est tenu ligne a ligne contre traducteur.py, et le Python
du depot est le TEMOIN HISTORIQUE, gele depuis la bascule du 08/08.
Enrichir fin[] cote JS ferait tomber verifier_traducteur a 0/24.
La bonne lecture n'est pas "contourner un banc" mais "ce sont deux
artefacts differents" :
    traducteur : ce que l'ecran MONTRE, seconde par seconde
    verdict    : ce que le palmares RETIENT, une ligne pour toujours
verdict.js est donc natif JS, comme fiches.js, et tenu par des INVARIANTS.

## CE QU'IL REMONTE (rien n'est invente, tout sort d'une ligne de log)
    KO          l'arme du dernier coup a la tete       KO (crochet)
    KO contre   l'arme sur laquelle part le contre     KO (en contre d'un overhand)
    TKO corps   l'arme, zone foie                      TKO (body kick au foie)
    TKO sol     la position au moment du GnP           TKO (ground and pound en montee)
    TKO chute   le rang de la chute                    TKO (2e knockdown)
    TKO serie   le nombre de coups depuis la chute     TKO (4 coups apres le knockdown)
    SUB         la prise, et si elle part d'en bas     soumission (cle de bras depuis la garde)
    DECISION    la carte que le moteur a comptee       decision (28-26)
Vocabulaire : 14 armes, 21 soumissions, 11 positions. Un terme absent de la
table LEVE — c'est ce qui garantit qu'aucun `north_south_choke` n'atteindra
jamais l'ecran.
PAS de "decision unanime" : le moteur n'a pas trois juges, il a une carte.
Ce qui n'est pas dans le log n'est pas affiche.

## /!\ LE PIEGE DU +1 — le coup qui finit n'est pas ecrit
Dans engine.js, le `return` precede le `log.push` pour l'arret de l'arbitre
comme pour le re-knockdown : le coup et la chute qui DECLENCHENT la fin ne
figurent jamais au log. Compter les lignes donnait donc systematiquement un
de moins. D'ou le +1, commente dans le module.
Corollaire de methode : le compte juste ne s'obtient pas en lisant le log
plus attentivement, mais en allant lire le MECANISME (coups_sonne remis a
zero a chaque chute, sonne=3 pose uniquement par encaisser_knockdown).

## LES DEUX ECRITURES QUE LA RELECTURE A CORRIGEES
- "crochet au corps au foie" : la zone etait deja dans le nom de l'arme.
- carte de score lue par POSITION : avec de mauvais noms, une decision
  passait en silence. Les noms sont maintenant LUS sur la carte, pas
  supposes dans l'ordre f1/f2.

## js/verifier_verdict.js — BANC 10, par invariants
540 combats (les nommes + des rosters generes, 3 et 5 rounds).
  1. verdict et traducteur donnent la meme methode et le meme vainqueur
     -> 540/540. C'est la regle 7 verifiee en DOUBLE LECTURE du meme log.
  2. le vainqueur est celui que simuler_combat a renvoye
  3. LES NOMBRES AFFICHES SONT LES COMPTEURS INTERNES DU MOTEUR :
     les "4 coups" sont dfn.coups_sonne, le "2e knockdown" est
     rs_knockdowns_subis+1. 61 series et 18 re-knockdowns confrontes.
     C'est l'invariant le plus utile : un detail plausible mais faux tombe
     ici, pas trois semaines plus tard a l'ecran.
  4. le round est celui ecrit par le moteur
  5. aucune cle du moteur n'atteint l'ecran (pas d'underscore)
  6. les 9 formes de fin sont produites au moins une fois (couverture :
     une branche morte se verrait)
  7. toute fin identifiee porte un detail
  8. DISCRIMINANT, trois sondes : un terme de vocabulaire retire leve ; un
     log etranger donne un autre verdict (71/77 — les 6 restants ont le
     meme vainqueur ET le meme libelle, ce qui est normal) ; un nom hors
     affiche leve.

## CHAINE ET BUNDLE
verdict.js ajoute a RACINES et a window.MMA. verifier_bundle.js compare
desormais AUSSI le verdict modules-contre-bundle.
lancer_verifs.sh fait maintenant DIX bancs. Bundle : 14 modules, 153 Ko.

## L'ASSERT EST MAINTENANT EN TRIANGLE
Le moteur designe un vainqueur, le traducteur en lit un, le verdict en lit
un. Les trois doivent dire la meme chose ou la page leve.


===========================================================================
# RESTE POUR LA FUSION (etat au 08/08, fin de seance)
===========================================================================
1. FAIT — le combat du jour 5 est tire par le moteur.
2. A FAIRE — combat_reel.template.html en surcouche depuis la carte de
   resultat. Le combat est deja rejouable (graine sur l'echeance) et
   COMBAT1.etapes contient deja la chronologie traduite : il ne reste que
   l'ecran.
   /!\ DETTE OUVERTE : combat_reel affichera le libelle du TRADUCTEUR
   ("north south choke") la ou la carte dit celui du VERDICT ("etranglement
   nord-sud"). Pas un mensonge, mais deux voix. Faire consommer le
   vocabulaire de verdict.js (ARMES_FR / SUBS_FR / POSITIONS_FR est
   exporte pour ca) — sans toucher a traducteur.js, qui reste gele.
3. A FAIRE — absorber mma_manager_v2.html (reprise d'ecrans).
4. PLUS TARD — MMA.generator quand le jeu tirera ses combattants.


===========================================================================
# FUSION, ETAPE 4 : L'ECRAN DE COMBAT S'OUVRE DEPUIS LE JEU
===========================================================================
(point 2 des quatre : FAIT)

## LE BOUTON, ET CE QU'IL NE FAIT PAS
"▶ Regarder le combat" sur la carte de resultat ouvre l'ecran en surcouche.
Le combat n'est PAS rejoue : COMBAT1.etapes porte deja la chronologie
traduite du jour 5. C'est le dividende de la graine posee sur l'echeance.

## js/gabarit.js — LE GABARIT EMBARQUE, PAS RECOPIE
    node js/gabarit.js  ->  js/ecran.gabarit.js  (window.MMA_ECRAN)
fetch() est refuse en file:// et recopier combat_reel.template.html dans la
page aurait fait DEUX gabarits. Meme philosophie que bundler.js :
transformation mecanique, JSON.stringify du fichier, zero logique.
Banc : identite au caractere pres avec le fichier source.
MMA_ECRAN.page(donnees) leve si le point d'injection a disparu OU s'il en
reste un apres coup (un bloc duplique laisserait un __DATA__ vivant :
String.replace n'echange que la premiere occurrence).

## IFRAME, PAS INLINE
Le gabarit est une page complete avec son CSS et ses id (#stats, #fin,
#com...). L'inliner faisait entrer en collision deux feuilles de style et
deux jeux d'identifiants. srcdoc + un bouton de fermeture cote jeu.
"Revoir le combat" ne peut pas faire location.reload() dans un srcdoc : le
gabarit envoie postMessage({mma:"rejouer"}) au parent quand il est en
surcouche, et garde reload() en page autonome.

## js/profil.js — LE BLOC "SUR LE PAPIER", UNE SEULE LECTURE
Les huit nombres etaient calcules dans combat.js. Des que le jeu ouvre le
meme ecran, la formule doit vivre a UN endroit, sinon deux ecrans montrent
"le meme" combattant avec des chiffres differents.

## DETTE DES DEUX VOIX : SOLDEE
combat_reel consomme DATA.verdict quand il est fourni, et retombe sur son
ancienne redaction sinon (rendu_combat.py continue de tourner). L'ecran
anime et le palmares disent desormais la meme phrase.


===========================================================================
# /!\ "ECHANGE" DANS LE LOG EST UN TEMPS — ET L'ECRAN MENTAIT DESSUS
===========================================================================

## LE SYMPTOME
Le banc de l'ecran a sorti des cartes de fin a "R3 5:00", "R2 5:00",
"R2 5:00". Toutes les finitions tombaient a la sonnerie.

## LA CAUSE
traducteur.py etale les lignes d'un round sur toute sa duree :
    pas = secondes_round / nombre_de_lignes
Un round arrete a 0:29 est donc dilate jusqu'a 5:00.

## LA DECOUVERTE (le vrai contenu de cette section)
simuler_round rend [vainqueur, pyRound(t)] ou t est un TEMPS EN SECONDES
(`while (t < duree)`, duree = 300). simuler_combat l'ecrit :
    >>> Okonkwo gagne au round 3 (échange 166)
"echange" est un NOM TROMPEUR pour un chronometre. 166 n'est pas le 166e
echange, c'est la 166e seconde du round.
    graine   9 : ecran 5:00, moteur 2:46
    graine  20 : ecran 5:00, moteur 0:41
    graine 171 : ecran 5:00, moteur 0:29
L'information n'a jamais ete perdue. Elle etait mal etiquetee.
/!\ NE PAS corriger le libelle dans engine.js : la ligne est comparee au
caractere pres contre engine.py, gele. Le nom reste faux, le code le lit
correctement, et le banc de verdict PROUVE que c'est un temps (la valeur
tient toujours dans un round : max 298 s sur 279 finitions).

## js/chrono.js — recaler(etapes, sec_round, round_fin, sec_fin)
Aucun module gele n'est touche. Post-traitement de la sortie du traducteur :
le round de la fin est reduit de sa duree supposee a sa duree reelle. Les
rounds precedents ne bougent pas. Homothetie, pas reecriture.
/!\ PIEGE FLOTTANT : ne pas prendre (round_fin-1)*300 comme debut du round.
Le traducteur avance par `pas = 300/n` repete n fois et laisse la frontiere
a 599.9999... Une etape tombait du mauvais cote et la fin s'affichait une
seconde trop tot (1:18 pour 1:19). Le debut est LU sur les etapes (champ
`rd`), et le segment est etire sur exactement sec_fin.

## /!\ LA LECON DE METHODE — UN NOM N'EST PAS UNE SOURCE
Le fait technique ci-dessus a coute un detour qu'il faut consigner, parce
que c'est le detour qui se repetera, pas le bug.

Chronologie de l'erreur :
  1. Le log dit "(échange 166)". Lu comme "166e echange", sans ouvrir
     simuler_round pour verifier ce que la fonction renvoie.
  2. PIRE : en ecrivant verdict.js, ce nombre a ete capture par une regex
     et range dans un champ nomme `echange` — le mauvais nom recopie tel
     quel. Il a traverse tout le module sans etre questionne une seule fois.
  3. Conclusion tiree : le moteur jette l'information, donc la seule
     reparation passe par engine.js, donc par le Python gele, donc par un
     ARBITRAGE DEMANDE A MAEL sur la reouverture de la bascule.
  4. Cet arbitrage n'avait pas lieu d'etre. Un "vas-y" aurait fait ouvrir
     le temoin historique pour un bug qui se reglait en post-traitement.
  5. Ce qui a rattrape : etre alle chercher OU accrocher le chrono dans
     engine.js. La lecture de la source a corrige le diagnostic — apres
     qu'il ait ete livre.

C'est la regle 4 (relire la source) deja consignee a l'ETAPE 1 pour les
signatures devinees. Elle valait ici pour un LOG, pas pour du code.
Formulation generale a retenir :
    UN NOM DE VARIABLE, DE CHAMP OU DE LIBELLE EST UNE HYPOTHESE,
    PAS UNE SOURCE. Il se verifie comme le reste.
Corollaire operationnel : avant de conclure qu'une information MANQUE — et
surtout avant de demander l'ouverture d'un module gele pour aller la
chercher — relire ce que les fonctions concernees RENVOIENT, pas ce que
leurs etiquettes racontent.

## CE QUE CA NE CORRIGE PAS
A l'interieur d'un round la repartition reste UNIFORME : le moteur ne date
pas ses echanges un par un, il ne donne que le total du round. L'heure de la
FIN est juste ; l'heure de chaque coup reste une approximation. Aller plus
loin demanderait que le moteur date chaque ligne — donc modifier engine.py,
donc rouvrir la bascule. A arbitrer si le besoin se fait sentir.


===========================================================================
# /!\ NOMS AMBIGUS : LE TRADUCTEUR REPERE PAR PREFIXE
===========================================================================
Assert de vainqueur tombe sur `node js/combat.js 17 poids_welter 3 --html` :
moteur A, traducteur B. Deux combattants generes portaient le meme nom de
famille (Adeyemi). combat.js suffixait UN SEUL cote -> "Adeyemi" et
"Adeyemi-B". Les regex du traducteur reperent les combattants par PREFIXE :
"Adeyemi" matche dans "Adeyemi-B", les evenements partaient au mauvais coin.
verdict.js n'etait pas touche (il capture le jeton entier puis le resout).
Correction dans combat.js : suffixer les DEUX cotes (-R / -B), et lever si
un nom reste prefixe de l'autre.
/!\ Contrainte a retenir pour l'ETAPE 4 (jeu qui genere ses combattants) :
deux noms d'affiche ne doivent jamais etre prefixes l'un de l'autre.

## CHAINE
verdict.js expose maintenant `seconde` et `heure` ("R3 2:46").
Bancs : verifier_verdict passe a 11 invariants, verifier_gabarit est le
BANC 11 (l'heure affichee doit etre celle du moteur, A LA SECONDE).
lancer_verifs.sh fait ONZE bancs. Bundle : 16 modules, 159 Ko.


===========================================================================
# RESTE POUR LA FUSION (etat au 08/08, seconde fin de seance)
===========================================================================
1. FAIT — le combat du jour 5 est tire par le moteur.
2. FAIT — l'ecran de combat s'ouvre en surcouche, horloge recalee.
3. EN COURS — absorber mma_manager_v2.html. /!\ LA MENTION "donnees deja
   synchronisees" ETAIT FAUSSE, voir la section dediee en fin de carnet.
4. PLUS TARD — MMA.generator quand le jeu tirera ses combattants.
   Deux contraintes deja connues : la divergence adapter/generator, et les
   noms prefixes ci-dessus.


===========================================================================
# CHANTIERS OUVERTS — UN PAR UN, RIEN EN PARALLELE
===========================================================================
Quatre sujets sortis de la premiere vraie session de test au navigateur
(retours de Mael, 08/08). Tout ce qui suit est DEJA MESURE : ne pas
remesurer, ne pas rediscuter le diagnostic, attaquer.
Aucun n'est commence. On en prend UN, on le finit, on grave, on passe.

---------------------------------------------------------------------------
## CHANTIER A — LE SCORING 10-8 (le plus URGENT : il salit tout l'ecran)
---------------------------------------------------------------------------
SYMPTOME (Mael) : "28-26 ca existe pas".
VERDICT : 28-26 EXISTE (10-8 / 8-10 / 10-8, carte vue en vrai). L'instinct
etait bon, la case a cote. Le vrai probleme est le 10-8 lui-meme.
MESURE, 882 rounds, rosters generes poids welter :
    10-9  129  (15%)      MMA reel : ~90-95%
    10-8  753  (85%)      MMA reel : ~5-10%
    carte la plus frequente : 30-24, 58% des decisions (3 rounds en 10-8)
    criteres des 10-8 : degats 751, controle 2  (knockdown : JAMAIS)
CAUSE, une ligne de scorer_round :
    const pts = Math.abs(d1 - d2) >= 45 ? 8 : 9;
45 points d'ecart sur des rounds a 200-300 de degats. Ecart MEDIAN reel
entre les deux combattants : 169. Le seuil declenche sur du bruit.
UN SEUIL ABSOLU NE SUFFIRA PAS :
    seuil  45 -> 85%    seuil 150 -> 54%
    seuil  90 -> 70%    seuil 180 -> 47%
    seuil 120 -> 62%    seuil 240 -> 33%
Piste : critere RELATIF (ratio, ou ecart rapporte au volume du round) et
sans doute exiger un knockdown ou un controle ecrasant, comme les vrais
juges. NE PAS choisir un nombre qui donne un joli pourcentage : ce serait
remplacer un arbitraire par un autre.
/!\ CONTRAINTE : scorer_round vit dans engine.py / engine.js, TEMOIN GELE.
Ce chantier ROUVRE LA BASCULE : le Python doit bouger a l'identique, toutes
les references se regenerent. Decision de Mael requise avant de toucher.
RASSURANT : le scoring ne touche QUE les decisions, pas la repartition
KO/TKO/SUB/DEC. Le calibrage gele n'est pas menace.

---------------------------------------------------------------------------
## CHANTIER B — LA FEUILLE DE STATS (le plus RENTABLE : purement additif)
---------------------------------------------------------------------------
DEMANDE (Mael, capture ufcstats.com a l'appui) : stats PAR ROUND, et
frappes reparties tete / corps / jambes, pas seulement le total.
BONNE NOUVELLE : tout est deja dans le log, AUCUN fichier gele a toucher.
    - chaque arme porte SA zone dans la table ARMES :
        tete  : jab, cross, crochet, uppercut, overhand, high_kick,
                spinning_back_fist, wheel_kick
        corps : crochet_corps, body_kick, teep, spinning_kick
        jambe : low_kick, calf_kick
    - une frappe MANQUEE nomme quand meme son arme
      -> on a le TENTE par zone autant que le TOUCHE par zone (la colonne
         "102 of 230" d'ufcstats)
    - distance / clinch / sol se deduit du contexte des lignes
PROTOTYPE FAIT, il tient debout mais NE TOMBE PAS JUSTE :
    moteur R1 Okonkwo 66/107   reconstruit 66/109
    moteur R2 Okonkwo 38/115   reconstruit 31/114   (le TOUCHE diverge)
CAUSE IDENTIFIEE : le clinch parle un SECOND DIALECTE dans le log. Sept
formes que le prototype ignore, entre autres :
    X petit_corps -> touché (N)
    X rompt et place knee_corps_sortie -> touché (N) !
    X riposte petit_corps -> N
Ces frappes comptent dans rs.sig mais ne ressemblent pas aux frappes
debout. PREMIER TRAVAIL DU CHANTIER : inventorier TOUT le vocabulaire de
clinch.py avant d'ecrire une ligne.
INVARIANT A CONSTRUIRE (il echoue aujourd'hui, c'est le but) : la feuille
reconstruite doit egaler, ROUND PAR ROUND, les compteurs que le moteur
ecrit lui-meme dans ses lignes de bilan. Tant que 66/109 n'est pas 66/107,
l'ecran ment d'un chiffre — mais il ment.
FORME : module natif JS qui relit le log, tenu par invariants. Meme patron
que verdict.js.

---------------------------------------------------------------------------
## CHANTIER C — LE COMBAT EN DIRECT + LES COINS INTER-ROUND
---------------------------------------------------------------------------
SYMPTOME (Mael) : "le combat s'est pas lance en direct, la decision etait
deja marquee dans COMBATS".
C'EST UNE ERREUR DE CONCEPTION DE LA SESSION : le jour 5 joue le combat ET
pousse le resultat dans le meme mouvement. Le bouton n'offre qu'une
rediffusion d'un match dont on connait l'issue. Il faut : le jour arrive ->
combat en attente -> on le regarde -> le resultat tombe.
/!\ NE PAS REPARER CA A L'ECONOMIE. La demande de reglages inter-round le
refait entierement : le combat n'est plus roule d'avance, il se joue ROUND
PAR ROUND avec un point d'arret ou le coach parle. Reparer puis redefaire
serait du travail jete. UNE SEULE FOIS, round par round.
LEVIERS QUI EXISTENT DEJA dans le moteur :
    gameplan {striking, wrestling, clinch}, gameplan.allure, gameplan.cible
    ("tete" / "corps" / "jambes"), et recuperer_entre_rounds() est deja un
    point d'arret naturel entre les rounds.
INVARIANT QUI RENDRA CA SUR : jouer round par round SANS RIEN CHANGER doit
reproduire simuler_combat LIGNE POUR LIGNE a la meme graine. Si ca diverge,
le coin de coach a modifie le combat en douce.

---------------------------------------------------------------------------
## CHANTIER D — LE FOOTWORK (et les 63% contre la grille)
---------------------------------------------------------------------------
SYMPTOME (Mael) : "peu de footwork a part les coupes a la cage".
CE N'EST PAS UNE IMPRESSION. Mesure sur le combat du jour 5 :
    151 transitions sur 252 : deplacement EXACTEMENT ZERO
    deplacement median : 0,0 px dans une cage de rayon 148
    160 etapes sur 253 en "ACCULE — GRILLE"
CAUSE : le traducteur ne recalcule x,y que sur les evenements de cage, de
clinch, de takedown et de sol. Entre deux echanges de frappe il RECOPIE la
position precedente. On ne voit bouger que les coupes de cage parce que ce
sont les seuls moments ou quelque chose bouge.
SECOND CHIFFRE, PAS ENCORE LU : 63% du combat contre la grille. Peut etre
fidele (boxeur pressure contre brawler) ou reveler que la mecanique de cage
happe trop. A MESURER SUR PLUSIEURS AFFICHES avant de conclure.
TENSION A TRANCHER (c'est un choix de REGLE, pas un detail d'affichage) :
le moteur ne dit pas ou sont les combattants seconde par seconde, seulement
leur situation. Faire bouger les points, c'est inventer une position — sauf
a la deriver de ce que le moteur roule vraiment (footwork, cage_cutting,
qui presse qui). Faisable honnetement, mais a decider explicitement.
A FAIRE APRES C : le footwork sera plus facile a regler quand le combat se
deroulera vraiment sous les yeux.

---------------------------------------------------------------------------
## ORDRE PROPOSE
---------------------------------------------------------------------------
B (rentable, additif, ne depend de rien) -> A (urgent, mais demande
l'accord de Mael sur la bascule) -> C -> D.
A et C peuvent permuter selon l'envie. D vient apres C.
REGLE DE LA FILE : un seul chantier ouvert a la fois. On finit, on grave au
carnet, on regenere l'archive, on passe au suivant.


===========================================================================
# BASCULE DU 08/08 (2e) — LE TEMOIN PYTHON EST ROUVERT, DEUX FOIS
===========================================================================
Premiere modification d'engine.py depuis la bascule initiale. Accordee par
Mael apres mesure. DEUX corrections dans la meme reouverture, pour ne payer
qu'une fois la regeneration des references et la campagne de verification.
Le Python reste le temoin : il a ete modifie A L'IDENTIQUE du JS, et les
onze bancs le prouvent.

## LE GARDE-FOU, POSE AVANT DE TOUCHER QUOI QUE CE SOIT
180 combats figes AVANT modification (/tmp/avant.json), rejoues APRES,
compares ligne a ligne :
    72 030 lignes comparees
      352 lignes changees, ground and pound   (voulu)
      292 lignes changees, scoring            (voulu)
        0 DIVERGENCE NON PREVUE
Le flux de hasard n'a pas bouge d'un bit. C'est CA la preuve que la
repartition KO/TKO/SUB/DEC est intacte — pas une remesure de distribution,
qui aurait juste montre du bruit d'echantillonnage.
/!\ A REFAIRE A CHAQUE REOUVERTURE : figer avant, comparer apres, et
n'accepter que les familles de lignes qu'on a explicitement visees.

---------------------------------------------------------------------------
## CORRECTION 1 — LE SCORING 10-8 (chantier A : FAIT)
---------------------------------------------------------------------------
AVANT : `pts = 8 if abs(d1 - d2) >= 45 else 9`, dans trois branches.
    85% des rounds en 10-8 (MMA reel : 5-10%)
    carte la plus frequente : 30-24, 58% des decisions
APRES : une fonction unique points_du_round(w, l), appelee par les trois
branches. LE VAINQUEUR DU ROUND N'EST PAS TOUCHE : la cascade degats ->
knockdown -> controle -> agressivite est identique. Seul le 8-ou-9 change.
    10-8 si  ecart de knockdowns >= 2  ET  degats >= 4x
       ou    >= 1 knockdown  ET  degats >= 30x  ET  ecart >= 450
    sinon 10-9
RESULTAT, 1500 combats :
    30-27  67%      (30-24 : 0,1%, contre 58% avant)
    29-28  22%
    30-26 / 30-25  11%
    10-8 : 10,3% des rounds
/!\ POURQUOI PAS PLUS BAS — a relire avant de vouloir "ameliorer" :
30,8% des rounds du moteur presentent un ecart de knockdown, 10,5% en
presentent deux. C'est le PLANCHER de toute regle qui s'appuie sur le
knockdown. Ce taux est ~3x le MMA reel, MAIS il est PORTEUR DU CALIBRAGE
GELE : les knockdowns alimentent l'arret de l'arbitre, donc la repartition
des finitions. Y toucher casserait ce qu'on venait de proteger. Le residu
au-dessus de la fourchette reelle vient du taux de knockdown, pas du
scoring. Si un jour on veut descendre : c'est le taux de knockdown qu'il
faut rouvrir, et alors TOUT le calibrage est a refaire.
POURQUOI UN CRITERE RELATIF ET PAS UN SEUIL PLUS HAUT : aucun seuil absolu
ne marche, la distribution est trop etalee (ecart median 169, seuil 240
laissait encore 33%).

## EFFET DE BORD ATTRAPE PAR UN BANC : LE NUL A QUASI DISPARU
0 nul sur 1500 combats. Il reste possible (gagner deux rounds 10-9 et
perdre le troisieme 10-8) mais on ne peut plus compter dessus pour couvrir
la branche. verifier_verdict couvre desormais le nul par un LOG FORGE : ce
n'est pas la frequence qu'on teste, c'est le chemin de code. Les huit
autres formes restent couvertes naturellement.

---------------------------------------------------------------------------
## CORRECTION 2 — LE LOG DU GROUND AND POUND MENTAIT
---------------------------------------------------------------------------
SYMPTOME : la feuille de stats reconstruite depuis le log ratait 14 rounds
sur 428, toujours de +1 cote moteur, toujours dans un round contenant au
moins un "ground and pound → bloqué".
CAUSE, engine 613-631 :
    for (...) { touches += 1; top.rs.sig_landed += 1; }   <- compte ICI
    d = trunc(d * dmg_mod * 0.85);
    if (d) log(`${touches}/${tentes} coups, ${d} degats`);
    else  { sig_attempted += 1; log(`ground and pound → bloqué`); }
Un coup a 1 degat : 1 * 0.85 = 0.85 -> trunc = 0. Le coup EST parti, il EST
passe, sig_landed l'a compte, et le log ecrivait "bloqué". Le compte de
`touches` etait PERDU.
/!\ DIFFERENCE AVEC LE PIEGE "echange" : la, l'information etait MAL
ETIQUETEE et donc recuperable. Ici elle etait EFFACEE. Aucune relecture ne
la retrouvait. C'est ce qui justifiait de rouvrir le temoin.
/!\ ET J'AVAIS LE SENS DE LA FAUTE A L'ENVERS : j'avais dit a Mael que le
compteur du moteur etait l'incoherent. Sur ce point precis c'est l'inverse,
sig_landed avait raison et c'est le log qui racontait autre chose.
CORRECTION : le log ecrit toujours `touches/tentes coups, N degats`, y
compris `0/N coups, 0 degats`. Purement cosmetique sur le message, aucun
tirage touche.

---------------------------------------------------------------------------
## LE MODELE EXACT DES COMPTEURS DE FRAPPES (acquis du chantier B)
---------------------------------------------------------------------------
/!\ `frappes 66/107` dans les bilans N'EST PAS un "touchees sur tentees".
Encore une etiquette qui raconte autre chose que le code. Les quatre
incrementations reelles :
  sig_attempted : chaque frappe debout (resolve_strike_debout, en entree)
                + le ground and pound a 0 degat
  sig_landed    : frappe debout touchee
                + le CONTRE (pour le defenseur)
                + CHAQUE coup de ground and pound passe
                + les significatives de clinch (stats[].sig)
Les tentatives de GnP et de clinch ne sont comptees NULLE PART. Le ratio
est donc structurellement faux : c'est un outil de score, pas une feuille.
MODELE DE RECONSTRUCTION DEPUIS LE LOG, verifie 560/560 dans les DEUX
colonnes apres la correction 2 :
    tentees  = "→ touché" + "→ manqué" + "check le" + GnP a 0 degat
    touchees = "→ touché" + "!!! CONTRE" + coups de GnP + clinch [SIG]
               + "rompt et place"
/!\ DEUX PIEGES DEJA PAYES :
  - "check le" est une tentative qui ne loggue JAMAIS de "manqué".
  - le CONTRE n'est PAS une tentative supplementaire : le "→ manqué" de
    l'attaquant a deja ete ecrit juste avant. Le compter double.
Le clinch parle un SECOND DIALECTE (fleche ASCII "->", marqueur [SIG],
vocabulaire propre : petit_corps, knee_corps_sortie, riposte...). Les
frappes de clinch non significatives ("usure") ne comptent pas.
ZONES : chaque arme porte SA zone dans la table ARMES —
    tete  : jab, cross, crochet, uppercut, overhand, high_kick,
            spinning_back_fist, wheel_kick
    corps : crochet_corps, body_kick, teep, spinning_kick
    jambe : low_kick, calf_kick
Une frappe MANQUEE nomme son arme : on a donc le TENTE par zone autant que
le TOUCHE par zone (colonne "102 of 230" d'ufcstats).

## RESTE DU CHANTIER B
Ecrire le module (js/feuille.js + verifier_feuille.js, patron verdict.js),
brancher la feuille par round dans l'ecran de combat et sur la carte de
resultat. La partie difficile est faite : le modele est etabli et exact.


===========================================================================
# js/feuille.js — LA FEUILLE DE STATS, FORMAT UFC (chantier B : module fait)
===========================================================================
Format ufcstats choisi avec Mael : un TOTAL de significatives, puis la
repartition par CIBLE (tete/corps/jambe) et par POSITION (distance/clinch/
sol), par round et en cumul. Raison : c'est la grammaire que l'oeil du fan
connait deja, et le total est le seul chiffre que le moteur compte VRAIMENT
— le detail est une relecture. Ancrer l'ecran sur le total, c'est rester du
bon cote de la regle 7.
/!\ NUANCE A GARDER EN TETE : le moteur est plus fin que l'UFC sur un point
— une frappe de clinch porte un drapeau `significatif` explicite, et les
non-significatives comptent comme USURE, pas comme frappes. En fusionnant
au format UFC on ecrase une information qu'on possede. Ca vaut une legende,
pas trois colonnes.

## API
    feuille(log, nomA, nomB) -> { rounds: [[A,B], ...], total: [A,B], noms }
    surTotal(p) -> "136 of 273"      pourcent(p) -> "49%" ou "—"
Chaque bloc : sig / tete / corps / jambe / distance / clinch / sol en
[touchees, tentees], plus kd, td [reussis, tentes], sub.
Plus un champ `moteur` [touchees, tentees] : la SOUS-PARTIE que le moteur
compte lui-meme. Il n'est PAS affiche, il existe pour etre confronte a
rs.sig_landed / rs.sig_attempted au banc. C'est l'invariant central.

## /!\ DEUX TABLES POUR LE CLINCH, PAS UNE
FRAPPES_CLINCH = ce qui se donne DANS la prise.
FRAPPES_RUPTURE = ce qui se place EN SORTANT (elbow_sortie, knee_sortie,
uppercut_sortie, knee_corps_sortie).
N'en lire qu'une laissait une frappe SANS cible et le banc de coherence
tombait a 221 pour 222. Un ecart de 1 sur 222 — invisible a l'oeil, attrape
par l'invariant "tete+corps+jambe = total".

## /!\ LES TAKEDOWNS DE CLINCH ONT LEUR PROPRE FLECHE
Debout : `X double_leg → RÉUSSI`  (fleche unicode)
Clinch : `X body_lock_attempt -> RÉUSSI, combat au sol`  (fleche ASCII)
Le moteur les credite dans le MEME rs.td_landed. Ne lire que la premiere
forme faisait mentir la colonne TD d'environ un round sur dix.

## js/verifier_feuille.js — BANC 12
300 combats (nommes + rosters generes, 3 et 5 rounds), 1398 lignes de bilan.
  1. les TOUCHEES retombent sur rs.sig_landed, round par round   -> exact
  2. les TENTEES du moteur retombent sur rs.sig_attempted        -> exact
  3. knockdowns et takedowns reussis retombent sur le moteur
  4. tete+corps+jambe = distance+clinch+sol = total, touchees ET tentees
  5. le cumul est la somme des rounds
  6. jamais de touchees > tentees
  7. les trois cibles sont alimentees (tete 61% · corps 18% · jambe 21%) —
     une branche morte du vocabulaire se verrait ici
  8. DISCRIMINANTS sur logs forges : log tronque, noms hors affiche, usure
     de clinch (tentee mais pas touchee), contre (touchee sans tentative),
     check (tentative de l'attaquant, rien au defenseur).
C'est CE banc qui avait fait remonter le mensonge du log de ground and
pound. Il vaut son poids.

## RESTE DU CHANTIER B
Brancher : la feuille par round dans l'ecran de combat (l'onglet "LE
COMBAT" existe deja dans combat_reel.template.html) et un resume sur la
carte de resultat. Prevoir le depliant "PER ROUND" d'ufcstats : totaux
visibles d'entree, decoupage par round derriere. Le module produit toutes
les colonnes de toute facon — changer l'affichage sera une modification de
GABARIT, pas de moteur.

## BRANCHEMENT DE LA FEUILLE (chantier B : TERMINE)
Deux surfaces, alimentees par DATA.feuille (jeu) et par combat.js --html.

ECRAN DE COMBAT — nouvelle section "FRAPPES SIGNIFICATIVES" dans le panneau
de stats, entre "LE COMBAT" et "SUR LE PAPIER" : Tete / Corps / Jambes,
puis Distance / Clinch / Au sol. Depliant "▶ PAR ROUND" comme ufcstats.

/!\ LE PIEGE DE CE BRANCHEMENT — LA FEUILLE DEVOILE L'AVENIR
Contrairement aux compteurs vivants de "LE COMBAT" qui se remplissent au fil
de l'animation, DATA.feuille contient le combat ENTIER des la premiere
seconde. L'afficher telle quelle dirait au joueur, au round 1, combien de
coups il prendra au round 3. On ne cumule donc QUE les rounds deja joues
(roundsAcquis() = RD-1 en cours, tout a la fin) ; le round en cours reste
dans les compteurs vivants au-dessus.
Banc 11, trois invariants ajoutes :
    au round 1, la repartition n'est pas encore affichee
    a la fin, l'ecran affiche EXACTEMENT les totaux du module (12 cases)
    DISCRIMINANT : en cours, cumul PARTIEL et pas total
      -> 74 of 183 apres deux rounds, 93 of 244 sur le combat entier
Ce discriminant est le coeur du banc : sans lui, afficher le total par
erreur passerait inapercu tant qu'on ne regarde pas un combat en cours.

CARTE DE RESULTAT (onglet COMBATS) — resume Sign./Tete/Corps/Jambes sous le
libelle. Ici le combat est termine, donc les totaux s'affichent sans
reserve. Le plus fort des deux nombres est mis en avant.

## RESTE DU CHANTIER B : rien. Module, banc et branchement sont faits.


===========================================================================
# js/coin.js — LE COMBAT ROUND PAR ROUND (chantier C : moteur fait)
===========================================================================
Repond aux deux reproches de Mael, qui sont le meme : "le combat s'est pas
lance en direct" et "pas de consignes inter-round". Tant qu'on passe par
simuler_combat, le combat est ROULE D'AVANCE : l'ecran n'en montre qu'une
rediffusion et il n'existe aucun instant ou le coach puisse parler.

## simuler_combat N'EST PAS MODIFIE, IL EST REPRODUIT
Il est gele (conformite au caractere pres contre engine.py). coin.js rejoue
la meme boucle en s'arretant a chaque cloche. D'ou L'INVARIANT CENTRAL :
    un combat joue round par round SANS AUCUNE CONSIGNE doit produire le log
    de simuler_combat, LIGNE POUR LIGNE, a la meme graine.
Mesure : 300 combats, 159 246 lignes, ZERO divergence.

## /!\ PIEGE PAYE UNE FOIS : IL FAUT DES COMBATTANTS NEUFS
reset() ne remet PAS tout — degats de tete, jambes, corps, stance
persistent. Comparer les deux voies en rejouant sur les MEMES objets fait
diverger des la premiere ligne (104 combats sur 300 au premier essai). Le
banc regenere le roster a chaque execution.

## SEULE MODIFICATION DU MOTEUR : DEUX EXPORTS
engine.js exporte desormais fmt0 et pyStr, dont coin.js a besoin pour
reconstituer les lignes de bilan AU CARACTERE PRES. Ce sont deux
formateurs : aucun comportement touche, aucun hasard consomme. La
conformite contre engine.py (105 combats, 58 462 lignes) est intacte —
donc ceci n'est PAS une reouverture de la bascule.

## API
    const c = new Combat(f1, f2, rounds);
    c.jouerRound()   -> {round, fini, vainqueur, seconde|bilan, lignes}
    c.enPause        -> true entre deux rounds
    c.consigne(qui, ordre)   qui = "f1" | "f2"
    c.jusquauBout()  -> [vainqueur, log]   (aucune consigne : voie du banc)
LEVIERS reels du moteur : gameplan {striking, wrestling, clinch} (poids
RENORMALISES, le moteur les lit comme des parts), allure (bornee 0.7–1.3),
cible ("tete" | "corps" | "jambes" | null).

## /!\ L'ORDRE DES OPERATIONS ENTRE DEUX ROUNDS
recuperer_entre_rounds() appartient au round qui S'ACHEVE, pas a la
reprise : simuler_combat l'applique avant de boucler. La consigne du coach
arrive donc APRES, sur un combattant deja recupere. Inverser les deux
ferait diverger l'invariant central.

## /!\ LE HASARD EST GLOBAL — ET traduire() EN CONSOMME
Ce n'etait pas une precaution theorique : la premiere sonde du branchement
est tombee dedans. Traduire le log entre deux rounds pour alimenter l'ecran
DECALE le flux, et les rounds suivants ne sont plus ceux de la graine.
    combat traduit d'un bloc      : 256 etapes
    combat traduit round par round : 234 etapes
Le symptome est SILENCIEUX : aucune ligne ne parait fausse, le combat est
simplement UN AUTRE. C'est la pire forme de bug pour ce projet.

SOLUTION : coin.js exporte horsFlux(travail).
L'etat d'un Mersenne Twister tient entierement dans {mt, mti} plus le cache
de gauss(). On sauve, on execute, on rend. Le flux reprend exactement ou il
avait ete pris.
    horsFlux(() => { alea.seed(6); traduire(c.log, ...); });
A UTILISER POUR TOUT ce qui alimente l'ecran entre deux rounds : traducteur,
feuille de stats, mesures, previsualisations. Rien de ce qui sert a
REGARDER le combat ne doit toucher au hasard qui le JOUE.

## /!\ LE PREFIXE DU TRADUCTEUR N'EST PAS TOUT A FAIT STABLE
Retraduire le log accumule apres chaque round redonne les memes etapes SAUF
la derniere du round precedent (112 sur 113 apres R1) : le traducteur ajoute
4 s de respiration en fin de log, qui deviennent une transition quand le
round suivant arrive. Donc : retraduire le log COMPLET a chaque round et
remplacer la chronologie, ne pas concatener des tranches.

## js/verifier_coin.js — BANC 13
  1. l'invariant central (300 combats, 159 246 lignes)
  2. le combat s'arrete a chaque cloche et se termine seul
  3. jouer apres la fin LEVE, ne se tait pas
  4. DISCRIMINANT : une consigne change reellement la suite -> 29/29.
     Une consigne sans effet serait pire qu'une absence de consigne : le
     joueur croirait agir.
  5. le coin ne parle ni avant le round 1 ni apres la fin
  6. les ordres absurdes sont refuses (allure hors bornes, cible inconnue,
     gameplan a zero, poids negatif, combattant inconnu)
  7. les poids de gameplan sont renormalises a 1
  8. chaque consigne laisse une trace datee et nominative

## CE QUE CA CHANGE POUR LE JEU (a assumer au branchement)
Des lors que le joueur ajuste entre les rounds, le combat NE PEUT PLUS etre
roule d'avance : il se joue pendant qu'on le regarde. La graine reste posee
sur l'echeance, donc un combat sans consigne reste reproductible — mais
l'ecran n'est plus une rediffusion, et COMBAT1 ne peut plus etre calcule
au moment ou l'echeance tombe.

## RESTE DU CHANTIER C : le branchement
- le jour 5 ne joue plus le combat : il pose un combat EN ATTENTE
- l'ecran joue round 1, s'arrete, affiche le coin (PAUSE / REPRENDRE), etc.
- le resultat ne tombe dans le palmares qu'une fois le combat termine
- /!\ le traducteur travaille sur un log COMPLET : il faudra le rappeler
  round par round sur le log accumule, ou traduire par tranche. A verifier
  avant d'ecrire.


===========================================================================
# BRANCHEMENT DU DIRECT (chantier C : TERMINE)
===========================================================================
Le jour 5 ne joue plus le combat : il le POSE. La carte dit "Ce soir a Lyon
— en attente", le bouton dit "▶ Lancer le combat", et rien n'entre au
palmares. Le joueur lance, l'ecran joue le round 1, s'arrete a la cloche,
ouvre LE COIN, et demande la suite au jeu.

## LE PROTOCOLE (iframe <-> jeu, par postMessage)
  ecran -> jeu : {mma:"reprendre", ordre}   le coin a parle (ou ordre null)
  jeu   -> ecran : {mma:"suite", S, FIN, feuille}
  ecran -> jeu : {mma:"rejouer"}            rebatir sur le combat DEJA joue
Le jeu tient l'objet Combat de coin.js ; l'ecran ne tient que la
chronologie. C'est le jeu qui fait avancer le hasard, jamais l'ecran.

## /!\ TROIS PIEGES DE CE BRANCHEMENT
1. LA FIN DU LOG N'EST PAS LA FIN DU COMBAT.
   En direct on traduit un log PARTIEL : le traducteur y pose sa marque de
   fin, qui n'est que la fin du round joue. Confondre les deux affichait la
   carte de verdict des la premiere cloche, avec FIN a null — plantage.
   Garde posee : `if(DIRECT && !FIN) return;` avant carteFin().
2. COLLISION DE CLASSE CSS. `.coin` designait DEJA les coins rouge/bleu des
   combattants en tete d'ecran. Le panneau du coach est donc #coach / .c-*.
   Collision evitee de justesse — elle aurait casse l'en-tete sans erreur.
3. ON REMPLACE S EN ENTIER, ET ON SE RECALE PAR LE TEMPS.
   Le traducteur reecrit la derniere etape du round precedent (les 4 s de
   respiration deviennent une transition). On ne concatene donc pas des
   tranches : a chaque "suite", S est remplace et l'index est recalcule
   depuis `t`, pas conserve.

## LE COIN, COTE ECRAN
Trois rangees : Plan de jeu (Boxer / Lutter / Clinch), Allure (Economiser /
Tout donner), Cible (Tete / Corps / Jambes). Les boutons sont des bascules.
/!\ RIEN DE COCHE = AUCUN ORDRE ENVOYE. ordreCoin() rend null, et coin.js
n'est pas appele. Un round sans consigne doit rester un round sans
consigne, pas un gameplan "neutre" fabrique par l'ecran — sinon l'invariant
central de coin.js ne voudrait plus rien dire.

## LE RESULTAT N'ENTRE AU PALMARES QU'A LA FIN
encaisserResultat() est appele une seule fois, quand moteur.fini passe a
vrai : carte, bilans des DEUX combattants, historiques, statuts, bourse.
Avant ca la carte dit "en attente" et statutPro dit "Combat ce soir — a
jouer". Le joueur ne peut pas lire l'issue avant de l'avoir vue.

## VERIFICATION BOUT EN BOUT (harnais jetable, supprime)
Jeu et ecran montes dans deux contextes vm, messages transites a la main :
    jour 5   : "Ce soir a Lyon · en attente", bilan 9-2 inchange
    R1 joue  : 113 etapes, mode direct
    cloche 1 : coin ouvert, "FIN DU ROUND 1"
    ordre    : {striking:2, wrestling:6, clinch:2, cible:"corps"}
    cloche 2 : coin ouvert, "FIN DU ROUND 2"
    ordre    : {allure:1.25, cible:"tete"}
    fin      : Victoire — decision (29-28) · R3, bilans 10-2 / 11-5
/!\ Le resultat DIFFERE du combat sans consigne (28-26 auparavant) : c'est
la preuve que le coin agit.

## BANC 11, quatre invariants ajoutes
  en direct, la carte de verdict ne s'affiche pas a la fin d'un round
  la cloche ouvre le coin et met le combat en pause
  aucun bouton coche = aucun ordre envoye
  les boutons produisent un ordre lisible par coin.js

## RESTE : chantier D (footwork, et les 63% contre la grille).


===========================================================================
# CHANTIER E — DEUX LEVIERS TACTIQUES QUI N'EXISTENT PAS (demande Mael)
===========================================================================
NON COMMENCE, en attente. Mesure faite le 08/08, diagnostic pose : ne pas
remesurer, ne pas rediscuter, attaquer le jour ou on ouvre.

Demande : "user l'adversaire (chercher du cage control ou sol et le laisser
s'epuiser a se relever)" et "chercher le contre".
VERDICT : le moteur ne sait faire NI l'un NI l'autre. Ce ne sont pas des
boutons a ajouter au coin, ce sont des MECANIQUES a creer.

## LES QUATRE SEULS LEVIERS QUE LE MOTEUR LIT VRAIMENT
    gameplan.wrestling  proba de tenter un takedown (l.471) + proba de
                        suivre au sol (l.411) + defense adverse (l.232)
    gameplan.clinch     proba d'engager le clinch (l.475)
    gameplan.cible      pondere le choix de l'arme (l.486, 496)
    gameplan.allure     multiplie le rythme d'echanges (l.768-770)
/!\ gameplan.striking N'EST LU NULLE PART. Le bouton "Boxer" du coin marche
quand meme, mais INDIRECTEMENT : coin.js renormalise, donc monter striking
fait baisser wrestling et clinch, qui eux sont lus. A savoir avant de
s'etonner qu'un reglage "striking" pur ne fasse rien.

## POURQUOI "USER L'ADVERSAIRE" EST IMPOSSIBLE AUJOURD'HUI
engine.js l.598, le combattant du DESSUS choisit son action par un tirage
FIXE, sans aucune entree de gameplan :
    alea.choices(["progress","gnp","sub_top"], [0.24, 0.50, 0.26])
24% passer la garde, 50% ground and pound, 26% soumission. Toujours.
Impossible de dire "reste au controle, ne t'ouvre pas, laisse-le se vider".
/!\ L'EFFET RECHERCHE EXISTE DEJA, c'est la DECISION qui manque :
    bottom.depenser(1.2, "sol_dessous") contre top.depenser(0.8, ...)
    -> le dessous s'epuise vraiment
    l'accul a la grille est modelise ([cage] X accule Y contre la grille)

## POURQUOI "CHERCHER LE CONTRE" EST IMPOSSIBLE AUJOURD'HUI
striking_v2.js l.100-104, le contre ne depend que de l'ecart de timing, et
seulement sur un coup telegraphie :
    risque = 0.18 + (dfn.timing - atk.timing) / 320    borne 0.03–0.40
Aucun gameplan n'y entre. Une posture de contreur n'est pas exprimable.

## CE QUE CE CHANTIER EXIGE
Faire entrer un poids de gameplan dans DEUX endroits geles :
  - le tirage d'action du dessus (engine.py / engine.js l.598)
  - le risque de contre (striking_v2.py / .js l.100)
=> REOUVERTURE DE LA BASCULE, dans les deux langages, references
   regenerees. Protocole rode : figer 180 combats AVANT, comparer APRES,
   n'accepter que les familles de lignes visees.

## /!\ LE PIEGE PROPRE A CE CHANTIER, QUE LE PRECEDENT N'AVAIT PAS
La bascule du scoring ne touchait AUCUN tirage : le flux de hasard etait
identique au bit pres, et c'est ce qui prouvait que le calibrage
KO/TKO/SUB/DEC etait intact.
ICI CE NE SERA PAS LE CAS. Toucher au tirage du sol change la consommation
de hasard, donc les combats, donc potentiellement la repartition des
finitions — le calibrage GELE.
EXIGENCE ABSOLUE : la valeur neutre (aucune consigne) doit reproduire
EXACTEMENT le tirage actuel — memes poids 0.24/0.50/0.26, meme nombre
d'appels a alea, dans le meme ordre. Le garde-fou "72 030 lignes, zero
divergence" doit rester vert quand personne ne donne d'ordre. Si la valeur
neutre devie ne serait-ce que d'un tirage, TOUT le calibrage est a refaire.
Idem pour le contre : la formule actuelle doit etre le cas neutre exact.

## ORDRE
A faire APRES le chantier D (footwork). D est de l'affichage, E rouvre le
moteur — autant ne pas melanger.

## /!\ BUG VU EN VRAI : "ROUND 1 0:00" APRES LA REPRISE
Signale par Mael a l'usage : apres la cloche du round 1, l'ecran restait sur
"ROUND 1 0:00" au lieu d'afficher "ROUND 2 5:00".

CAUSE : RD n'est mis a jour que DANS applique(). Or, a la reception d'une
"suite", on remplace S et on se recale PAR LE TEMPS sans rejouer les etapes
franchies — et il ne faut surtout pas les rejouer, sinon les statistiques
seraient comptees deux fois. L'etape de transition du round suivant (rd:2,
posee a t≈300) se retrouvait donc DERRIERE l'index et n'etait jamais
appliquee. RD restait a 1, et ecoule() = min(300, 304) = 300 donnait 0:00.

CORRECTION : au recalage, on relit le round dans les etapes deja passees
    let rdVu=1; for(let k=0;k<=i;k++) if(S[k].rd!==undefined) rdVu=S[k].rd;
et on remet l'horloge au debut du round (sinon on entamait le round suivant
avec 4 s deja consommees — le temps de respiration que le traducteur ajoute
en fin de log).

/!\ POURQUOI AUCUN BANC NE L'AVAIT VU — LEÇON GENERALE
Tous les bancs d'ecran appliquaient les etapes D'UN BLOC : S.forEach(applique).
Dans ce mode, la transition de round passe forcement par applique() et le
bug est structurellement invisible. Le mode direct n'existe QUE par la
sequence jouer / cloche / remplacer / reprendre.
    UN BANC QUI NE REPRODUIT PAS LA SEQUENCE REELLE NE TESTE PAS LE PRODUIT.
Banc 11, trois invariants ajoutes, qui deroulent round par round comme la
vraie boucle :
    apres la reprise, le BON round et l'horloge pleine
    les rounds s'enchainent sans en sauter ni en repeter (RD : 2 → 3)
    la carte de fin finit par s'afficher en mode direct


===========================================================================
# CHANTIER F — mental.discipline EST UNE STAT MORTE
===========================================================================
NON COMMENCE. Trouve le 08/08 en cherchant "la stat qui gere le gameplan"
(intuition de Mael : elle existait). Elle existe, et elle n'est LUE NULLE
PART.

## LE CONSTAT, COMPTE FAIT
Lectures reelles dans le moteur (engine/ground/clinch/striking/stance/body) :
    fight_iq        6
    aggression      3
    chin            3
    balance_base    3
    discipline      0      <-- declaree dans Fighter, jamais consultee
Elle traverse pourtant TOUT le projet : generator.py la module par
archetype (+12 lutteur, +10 technicien, -20 brawler), progression.py la
fait evoluer, adapter.py la convertit, fiches.js la porte (Okonkwo 71).
Elle est renseignee partout et lue nulle part.

## SA PLACE EST DEJA CREUSEE
Ce qui module aujourd'hui l'obeissance au gameplan :
    retenue_lutte() = lucidite(fight_iq) x echecs_TD passes x cardio
    prudence_sol(adv) = danger de soumission adverse x fight_iq
MESURE (meme consigne wrestling 1.0 a tous, contre Renaud, 200 combats) :
    Kante   fight_iq 73  shot 82   5,81 TD/round   45% reussis
    Vasile  fight_iq 76  shot 82   5,53            44%
    Okonkwo fight_iq 75  shot 63   3,90            33%
    Traore  fight_iq 60  shot 56   3,57            27%
Du simple au double sur la MEME consigne.
/!\ ET LE MECANISME N'EST PAS CELUI QU'ON CROIT — verifie :
au round 1 le frein est QUASI IDENTIQUE pour tous (0,971 a 0,977). L'ecart
SE CREUSE pendant le combat :
    Kante    frein R1 0,972 -> fin 0,657   echecs 1,5   cardio fin 39
    Okonkwo  frein R1 0,971 -> fin 0,603   echecs 1,8   cardio fin 29
Le combattant n'abandonne pas le plan parce qu'il est tetu : il abandonne
parce que CA RATE et qu'il FATIGUE. Propriete emergente, aucune regle
ecrite — la forme de conception que Mael privilegie.

## CE QUE LA DISCIPLINE AJOUTERAIT, ET QUI MANQUE VRAIMENT
Un troisieme terme a retenue_lutte() : avec quelle FIDELITE il tient le plan
du coach quand ca ne marche pas. Un brawler a -20 lache le plan de lutte au
premier sprawl encaisse et repart en bagarre ; un lutteur discipline
insiste. Aujourd'hui on ne sait dire que "il n'y arrive pas" ; il manque
"il n'ecoute plus". Deux choses differentes.

## COUT
Reouverture de la bascule : retenue_lutte() vit dans engine.py ET engine.js.
A FAIRE DANS LE MEME PAQUET QUE LE CHANTIER E — memes fichiers, meme
campagne de verification, une seule regeneration des references.
VALEUR NEUTRE FACILE : discipline 50 doit reproduire EXACTEMENT le
comportement actuel (garde-fou des 72 030 lignes vert sans consigne).


===========================================================================
# CHANTIER G — CRIER DES CONSIGNES EN TEMPS REEL (vision de Mael)
===========================================================================
NON COMMENCE, horizon lointain. "A terme je ferai une commande de fou : t'es
dans le coin, tu peux crier, donner des consignes en temps reel."
Note ici pour ne pas la perdre, AVEC l'obstacle mesure — parce qu'il est
structurel et qu'il vaut mieux le savoir avant de s'y lancer.

## L'OBSTACLE : simuler_round EST INDIVISIBLE
engine.js l.784. A chaque appel, il fait TOUT ca en entree :
    log.push("──────── ROUND n ────────")
    f1.reset_round_stats(); f2.reset_round_stats()
    f1.chaos *= 0.45 ; f1.td_echecs = trunc(td_echecs * 0.4)
    etat = {phase:DEBOUT, cage:CENTRE, ...}   <- on repart au centre, debout
    let t = 0.0; while (t < duree)
Le parametre `duree` EXISTE, donc on pourrait croire qu'il suffit
d'enchainer 5 tranches de 60 s. NON : chaque appel remettrait les
statistiques a zero, reecrirait un en-tete de round, diviserait le chaos et
les echecs de takedown, et surtout RAMENERAIT LES DEUX HOMMES DEBOUT AU
CENTRE — un combat au sol serait interrompu a chaque minute.

## LES DEUX VOIES, ET CE QU'ELLES COUTENT
1. Un CROCHET dans la boucle d'echanges : simuler_round appelle un callback
   tous les N echanges, ou l'on peut relire le gameplan. Le plus propre,
   mais ca touche le coeur du moteur — reouverture lourde, et le crochet
   doit etre INERTE quand personne n'ecoute (garde-fou des 72 030 lignes).
2. Une reprise SEGMENTEE : sortir l'etat du round (etat, t, rs) pour
   pouvoir arreter et relancer sans reinitialiser. Plus invasif encore.

## /!\ LE PIEGE DE CONCEPTION, PLUS GRAVE QUE LE PIEGE TECHNIQUE
L'ecran anime une chronologie DEJA CALCULEE, a x1 ou x8. Si le joueur crie
pendant la lecture, le round est deja roule : ou bien le cri n'a aucun
effet (l'ecran ment par omission), ou bien on rejoue le round et l'ecran se
contredit — il a deja montre des coups qui n'auront plus lieu.
=> Un cri ne peut agir que sur ce qui n'a PAS ENCORE ETE CALCULE. La seule
forme honnete est donc : le combat avance par TRANCHES, et le cri
s'applique a la tranche SUIVANTE. C'est aussi ce que fait un vrai coin :
on crie, et ca prend effet quelques secondes plus tard.
A decider AVANT d'ecrire une ligne : la taille de la tranche (30 s ? 60 s ?)
est un choix de jeu, pas un detail technique.

## PRECISION DE MAEL (08/08) — LA CONCEPTION VISEE
"Ca sera dans les 5 secondes, et ca fera des calculs suivant si le gars a
une bonne ecoute et son etat, s'il domine ou s'il perd."
Donc pas un ordre qui s'applique betement : un ordre ENTENDU OU NON, avec
un calcul propre. Trois entrees deja identifiees :
  - l'ECOUTE du combattant  -> mental.discipline (chantier F : c'est
    exactement sa place ; F devient un prerequis de G, pas un voisin)
  - son ETAT               -> cardio, sonne, degats accumules
  - la SITUATION            -> domine-t-il ou subit-il (score du round en
    cours, controle, ecart de degats)
/!\ Un cri non entendu doit se VOIR a l'ecran ("il ne t'entend pas"),
sinon le joueur croira que la commande est cassee. Le silence est le pire
retour possible.

## /!\ CE QUE LES 5 SECONDES CHANGENT : LA VOIE 2 EST MORTE
Mesure : environ 2 s par action loggee, et le PAS DE BOUCLE (l'echange) est
plus large encore — de l'ordre de 5 a 8 s. Autrement dit :
    UNE TRANCHE DE 5 SECONDES, C'EST UN ECHANGE.
Il ne s'agit donc plus de decouper le round en segments (voie 2, reprise
segmentee) : a cette finesse, le seul point d'insertion possible est LA
BOUCLE D'ECHANGES elle-meme. La voie 1 (crochet appele dans la boucle) n'est
plus "la plus propre des deux", c'est LA SEULE.
Consequence : pas besoin de sortir l'etat du round ni de gerer une reprise —
le crochet lit le gameplan a chaque tour de boucle, ce qu'il fait deja. Le
travail se concentre sur : rendre le crochet INERTE quand personne n'ecoute
(garde-fou des 72 030 lignes vert), et faire remonter l'ordre depuis
l'ecran sans toucher au flux de hasard (horsFlux, voir coin.js).

## ORDRE : apres D, E et F. C'est le plus lourd des cinq, et F le precede
## necessairement (l'ecoute, c'est la discipline).


===========================================================================
# CHANTIER D — REVISE : CE N'EST PAS DE L'AFFICHAGE, C'EST DU MOTEUR
===========================================================================
Le chantier D etait note "footwork : faire bouger les points". La mesure du
08/08 et une remarque de Mael l'ont retourne. A relire AVANT de coder :
la conclusion initiale etait fausse.

## CE QUE LA MESURE A DONNE (ne pas remesurer)
Temps passe "ACCULE — GRILLE", 60 combats par affiche :
    Okonkwo c. Renaud   68% grille / 15% distance / 71% transitions immobiles
    Kante c. Vasile     47% / 24% / 54%
    Traore c. Kante     50% / 17% / 66%
    rosters generes     52% / 26% / 57%
=> ~50% en moyenne. Les 68% du combat du jour 5 sont un CAS PARTICULIER, pas
la norme. Le moteur n'est pas incoherent.

## L'ASYMETRIE DES DEUX FORMULES (engine l.429-447)
    entrer (depuis le centre) : 30 + (cage_cutting - footwork) * 1.35
    sortir (depuis la cage)   : 48 + (footwork - cage_cutting) * 1.35
Le meme ecart de stats est applique DEUX FOIS et s'accumule. Sur Okonkwo
(cage_cutting 83) contre Renaud (footwork 58) : 64% d'etre accule, 14% de
s'en degager. Une fois colle, il y reste 7 echanges sur 8.
Sur une affiche equilibree (Kante/Vasile) : 37% contre 41%, ca respire.
Mael : le rapport 4 contre 1 lui VA, parce qu'il decoule du footwork. Ne pas
"corriger" ca.

## /!\ LE VRAI DEFAUT, TROUVE PAR MAEL — UN RATE N'A AUCUNE CONSEQUENCE
    depuis le CENTRE : ca passe -> accule.  Ca rate -> RIEN.
    depuis la CAGE   : ca passe -> degage.  Ca rate -> RIEN.
Or "couper la route" DECRIT UN MOUVEMENT CIRCULAIRE : le fuyard tourne le
long de la cage, l'attaquant coupe la corde de l'arc. Si l'attaquant rate sa
coupe, le fuyard PASSE et devrait revenir au centre.
Aujourd'hui le moteur ne connait que DEUX endroits (centre / cage), sans
angle ni sens de rotation. Un footwork eleve ne se traduit pas par "il
tourne", seulement par "il a moins de chances d'etre bloque". C'est pour ca
qu'un combattant type Gane ne "tourne pas partout dans la cage" : LE MOTEUR
NE LE MODELISE PAS. L'ecran n'y est pour rien.

## LA REFORMULATION DU CHANTIER
NE PAS faire bouger les points a l'ecran par interpolation inventee (c'etait
la piste initiale, elle aurait viole la regle 7). A la place :
  1. donner au moteur une POSITION ANGULAIRE (angle le long de la cage +
     rayon centre/peripherie), pas un booleen centre/cage
  2. un RATE de coupe fait EVOLUER cette position : le fuyard gagne de
     l'angle, et sort si l'attaquant echoue
  3. le traducteur remonte cette position, et l'ecran l'affiche
=> l'ecran n'invente plus rien : il montre un deplacement que le moteur a
   REELLEMENT tire. La regle 7 est respectee par construction.

## COUT : REOUVERTURE DE LA BASCULE, ET PAS UNE PETITE
Ca touche la bataille de placement, donc le nombre de tirages, donc la
consommation de hasard, donc potentiellement TOUT le calibrage. C'est le
chantier le plus risque des cinq pour le gel.
/!\ Prevoir une valeur neutre exacte est ici PLUS DUR que pour E : on ne
peut pas juste ajouter un terme, on change la nature de l'etat. Il faudra
sans doute accepter de REFAIRE le calibrage apres, plutot que de pretendre
le preserver. A decider explicitement avec Mael avant de commencer.

## HORIZON — L'ALLONGE (idee de Mael, 08/08)
"A terme j'ajouterai l'allonge et tout ca collera encore mieux."
Elle n'existe pas aujourd'hui (aucune stat de reach dans Fighter). Sa place
naturelle est exactement ici : avec une position angulaire et une distance,
l'allonge devient lisible — qui touche en premier, qui doit franchir
l'espace, pourquoi un grand qui tourne bien est un cauchemar. Sans geometrie
elle n'aurait rien a quoi s'accrocher.
=> Faire D d'abord (la geometrie), l'allonge ensuite. L'ordre inverse
   n'aurait pas de sens.

## CIBLE FINALE DU CHANTIER D : UNE CAGE METRIQUE (idee de Mael, 08/08)
"On pourra aussi calculer par rapport a une vraie dimension de cage pour
rendre l'allonge geometrique et chirurgicale au ratio."
Oui, et c'est la bonne facon de faire — avec une distinction qui decide de
tout, ecrite ici pour ne pas se tromper d'unite.

### LA CONVERSION, ETABLIE
Cage UFC reglementaire : octogone de 30 pieds = 9,14 m de diametre,
donc 4,57 m de rayon.
Le gabarit dessine : R_CAGE = 148 px, CENTRE = [180, 180]  (traducteur.js
l.23-24 — c'est LA la valeur, pas dans le HTML).
    1 px  ~  3,1 cm        1 m  ~  32,4 px
Ordre de grandeur de controle : allonge d'un welter ~185 cm ~ 60 px. Le
cercle interieur du tapis (r=34 px) fait donc ~1,05 m. Coherent avec ce qui
s'affiche deja.

### /!\ CE QUI EST METRIQUE ET CE QUI NE L'EST PAS — L'ERREUR A NE PAS FAIRE
R_CAGE = 148 est une valeur D'AFFICHAGE. Le traducteur pose des points dans
un cercle decoratif ; le moteur, lui, n'a AUCUNE notion de distance : il a
des phases (debout / clinch / sol) et un booleen centre/cage. "Il gere la
distance" n'est aujourd'hui PAS EXPRIMABLE.
Pour un calcul chirurgical, l'unite de verite doit vivre DANS LE MOTEUR, EN
METRES. Le pixel n'est plus qu'une conversion en bout de chaine. Faire
l'inverse — raisonner en pixels et convertir vers le moteur — reviendrait a
faire piloter la simulation par la feuille de style.

### CE QUE LA GEOMETRIE FAIT DEDUIRE (au lieu de le tirer au sort)
    d = |posA - posB|  en metres
    portee = allonge/2 + fente
    une frappe touche si la distance est franchissable
Alors tout suit tout seul :
  - un long tient l'autre a sa portee et lui refuse l'entree
  - un court doit FRANCHIR l'espace, donc s'exposer
  - couper la route = reduire l'espace disponible en ANGLE et en DISTANCE
C'est exactement la forme de conception que Mael privilegie : la propriete
emerge de la geometrie, elle n'est pas ecrite comme une regle.

### /!\ CE N'EST PLUS UNE REOUVERTURE DE LA BASCULE
Un modele metrique REMPLACE une bonne partie des tirages actuels par de la
geometrie. Ce n'est plus une modification d'engine.py : c'est une REFONTE
DU COMBAT DEBOUT. Consequence a assumer AVANT de commencer :
    TOUT LE CALIBRAGE KO/TKO/SUB/DEC EST A REFAIRE DERRIERE.
Ne pas se raconter qu'on preservera le gel. On ne le preservera pas. La
bonne question n'est pas "comment eviter de casser le calibrage" mais
"est-ce qu'on veut assez ce modele pour payer un recalibrage complet".

### ORDRE FINAL DE CE CHANTIER
  1. position angulaire + consequence d'un rate de coupe  (deja decrit)
  2. distance metrique (cage en metres, positions en metres)
  3. allonge, qui n'a de sens qu'une fois 2 en place
Ne pas sauter d'etape : l'allonge sans distance n'a rien a quoi s'accrocher.


===========================================================================
# FUSION, POINT 3 : ABSORBER mma_manager_v2 — L'ECONOMIE DE LA SALLE
===========================================================================
But annonce par Mael : "c'est dans le but que je teste le jeu". Donc on
prend d'abord ce qui rend le jeu JOUABLE, pas ce qui est le plus elegant.

## /!\ LA NOTE DU CARNET ETAIT FAUSSE — "donnees deja synchronisees"
Verifie avant d'ecrire une ligne. Les deux fichiers n'avaient NI le meme
modele NI la meme horloge :
    demo_jeu : EFFECTIF (id, gr, talent, gains7) + FICHES nommees
               temps en JOURS (temps.js, echeances, calendrier)
    v2       : S.membres (niveau, arc, ray, histo), + reputation,
               equipement, coachAm, prix, capacite
               temps en SEMAINES (passerSemaine)
Ce n'etait donc pas une reprise d'ecrans mais une FUSION DE MODELES avec un
conflit de base de temps. Ne plus jamais faire confiance a cette ligne.

## CE QU'ON A PRIS, ET COMMENT
L'onglet Gestion de demo_jeu etait une FACADE : tresorerie en dur, +1 150 €
forfaitaires le lundi, materiel a etoiles fixes, bouton "acheter la cage"
qui affichait un toast et n'achetait rien.
On a porte l'economie de v2 SANS porter son horloge : passerSemaine devient
une echeance HEBDOMADAIRE du calendrier deja en place (jour%7===0). Une
seule horloge, celle du moteur d'echeances, deja eprouvee.
    SALLE = {prix, reputation, equipement, coachAm}
    prixReco()   = 28 + reputation*.85 + equipement*.30
    attractivite = (prixReco / prix) ^ 1.35
    capacite()   = 20 + equipement*.9 + reputation*.5
    revenu       = cotisants * prix        (un PRO ne cotise pas, il coute)
    charges      = 620 + equipement*11 + coachAm*7 + 140/pro
semaineDeSalle() encaisse, paie, et fait BOUGER l'effectif : arrivees si
l'attractivite depasse 1 et qu'il reste de la place, departs sinon.

## /!\ BUG PREALABLE TROUVE EN BRANCHANT : LE VIVIER DE NOMS EST TROP PETIT
34 noms de famille pour 72 membres vises au demarrage. La boucle initiale
abandonne au bout de 400 essais : la salle demarrait a ~38, pas 72.
Consequence sur l'economie : recruter() piochait un nom LIBRE et n'en
trouvait JAMAIS. L'effectif restait fige a 36 quel que soit le prix, et
l'onglet Gestion mentait sans le dire — les comptes bougeaient, la cause
affichee ne bougeait pas.
CORRECTION : on numerote les homonymes ("Diallo 2") au lieu d'echouer en
silence, et un depart LIBERE son nom.

## /!\ SECOND BUG, TROUVE PAR MAEL A L'USAGE : DOUBLER LE PRIX NE COUTAIT
## QUE DEUX ADHERENTS
"Mdr, en doublant les cotisations ca a change que 2 adherents ?" — et il
avait raison : 49 -> 38 en DIX semaines apres un doublement du prix.
CAUSE : les deux formules de mouvement etaient ABSOLUES.
    arrivees = round((a-1) * 4 * rand)        <- plafonne a ~5
    departs  = round((1-a) * 5 * rand)        <- plafonne a ~5
Une salle de 200 membres aurait perdu autant qu'une salle de 10. Et seuls
les LOISIR pouvaient partir : les amateurs etaient captifs quel que soit le
prix.
CORRECTION — les deux deviennent PROPORTIONNELLES :
    arrivees : place restante x min(0.50, (a-1)*0.45)
               une salle presque pleine ne gagne plus grand-chose
    departs  : CHAQUE cotisant tire pour lui, p = min(0.45, (1-a)*0.55)
               un LOISIR part a p (il paie pour le plaisir)
               un AMATEUR part a p/3 (il a un objectif, il encaisse plus
               longtemps — mais il n'est plus captif)
MESURE APRES CORRECTION :
    45 -> 90 EUR (a=0.40) : 36 -> 26 -> 19 -> 12 -> 11 -> 9 -> 9
    90 -> 25 EUR (a=2.28) : 9 -> 26 -> 32 -> 39 -> 45 -> 47 -> 48 (plafond
                            capacite 49)
    retour a 46 EUR       : se stabilise a 48, attractivite 1.00
La salle saigne en trois semaines et se remplit en quatre. L'equilibre
existe et il est atteignable.

## /!\ TROISIEME CORRECTION : LE FORFAIT ANNUEL (remarque de Mael)
"Pour une petite salle, en realite c'est souvent paye a l'annee, le forfait
vers les 500-700 euros."
L'ECHELLE ETAIT FAUSSE D'UN FACTEUR 4, DANS LES DEUX SENS :
    45 € encaisses CHAQUE SEMAINE = 2 340 €/membre/an, contre 600 € reels
    charges 74 932 €/an + loyer 23 400 €/an, pour 21 600 € de recettes
    -> la salle depensait 4,6x ce qu'elle encaissait
Le modele hebdomadaire etait une commodite d'implementation, pas une
observation. Corrige :
    SALLE.forfait = 600 €/an  (bornes 150–2000, pas de 50)
    forfaitReco() = 320 + reputation*8 + equipement*4      (516 au depart)
    chargesSemaine = 90 + equipement*1,5 + coachAm*1,2 + 12/pro  (~198 €)
    loyer ramene de 1 800 a 950 € par 28 jours
Calibre sur une petite salle associative : ~45 adherents a 550 € font
24 750 € ; loyer 12 400, autres charges 10 300. LA MARGE EST MINCE, et
c'est le sujet du jeu.

## /!\ CE QUE LE FORFAIT ANNUEL CHANGE AU JEU — LE POINT IMPORTANT
On ne paie qu'UNE FOIS PAR AN, a sa date d'inscription (m.renouv, tire a la
creation). Donc :
  - les encaissements sont ETALES sur douze mois, pas lisses
  - changer le tarif n'a AUCUN effet immediat : il agit au renouvellement
    de chacun, un cinquante-deuxieme de l'effectif par semaine
  - un adherent ne decide de rester ou partir qu'a SA date
On ne peut donc plus vider ni remplir sa salle en trois semaines. Il faut
tenir sa decision une annee. C'est bien plus juste, et bien plus dur.
MESURE (3 ans simules) :
    600 €/an (a=0,82) : stable a 34-36 adherents, tresorerie ~4 000 €
    900 €/an (a=0,47) : 36 -> 18 en un an, tresorerie negative
    450 €/an (a=1,15) : 18 -> 47 en trois trimestres
/!\ Les arrivees se declenchent des a>0,95 et non a>1 : sinon une salle
videe ne remontait JAMAIS, meme au prix juste (mesure : bloquee a 18).

## MESURE INITIALE (avant correction, gardee pour memoire)
    45 € (prix reco 46) : attractivite 1.03, 36 cotisants, solde +179 €
    30 €                : attractivite 1.78, 36 -> 49 cotisants (plafond
                          capacite), solde -361 -> +29 €
    90 €                : attractivite 0.40, 49 -> 38 cotisants, solde +1 913 €
Le arbitrage existe vraiment : brader remplit la salle mais ne paie pas,
sur-tarifer paie mieux a court terme et vide la salle. L'investissement
materiel monte la capacite (49 -> 54) ET les charges (1441 -> 1507).

## RESTE DU POINT 3
Pas encore repris de v2 : la DISCUSSION avec un combattant (parler, humeur,
reactions), la NEGOCIATION DE CONTRAT (proposerContrat, pouvoirNego),
PROMOUVOIR un amateur en pro, et la PROGRESSION avec qualite de sparring.
Ce sont des ecrans autonomes : ils peuvent se reprendre un par un, sans
toucher a l'economie qui vient d'etre posee.

## LA CAPACITE VIENT DES MURS, PAS DE LA REPUTATION (correction Mael)
"Non, la capacite changera quand on changera de salle."
    AVANT : capacite = 20 + equipement*0,9 + reputation*0,5
    APRES : capacite = local().places
Une salle de 80 m2 reste une salle de 80 m2 meme si ton champion gagne.
La reputation agit sur ce qu'on ACCEPTE DE PAYER (forfaitReco), pas sur le
nombre de places ; le materiel sur la QUALITE, pas sur les places non plus.
/!\\ LA TENSION QUE CA CREE, ET QUI EST LE POINT : quand la reputation monte,
la demande depasse les murs et on REFUSE DU MONDE. C'est ca qui pousse a
demenager — pas un bouton qui traine dans un menu.

## ONGLET BOUTIQUE (6e onglet) — locaux a louer + materiel
LOCAUX : garage 28 places / 420 € · associatif 52 / 950 · vraie salle 95 /
2 100 · complexe 160 / 4 300. Caution + premier loyer a l'entree.
demenager() REFUSE un local plus petit que l'effectif : on ne met pas des
gens dehors par megarde. Le loyer de l'echeance suit desormais local().
CATALOGUE : sacs +6 / tatamis +8 / coin force +9 / cage +18 / video +5.
Chaque piece s'achete UNE FOIS et monte l'equipement, donc le forfait
acceptable — jamais les places.
MESURE : cage achetee -> equipement 25 a 43, forfait reco 516 -> 588.
Demenagement en vraie salle -> 95 places ; un an a 450 € remplit a 94/95.

## RESTE ICI : la REPUTATION NE BOUGE JAMAIS (initialisee a 12, rien ne
l'incremente). L'onglet affichait meme "elle monte avec les victoires" —
c'etait FAUX, le texte est corrige. La brancher sur encaisserResultat()
(victoire pro, methode, ecart de niveau) fermerait la boucle du jeu :
gagner -> reputation -> tarif et demande -> meilleur coach -> progression.
Tout est deja disponible dans encaisserResultat().

## /!\ L'EQUIPEMENT EST PAR DOMAINE, 1 A 3 ETOILES (rappel de Mael)
"Mais les equipements, on avait dit systeme d'etoiles : striking 1 a 3,
lutte et physique."
J'avais ECRASE les trois domaines de l'onglet Gestion d'origine (striking /
sol / physique, affiches en etoiles) en un seul compteur "equipement". Ce
qui compte pourtant, c'est qu'une salle puisse etre bien equipee EN FRAPPE
et miserable AU SOL — un nombre unique rendait ca inexprimable.
    SALLE.equip = {striking:2, lutte:1, physique:2}   1 a 3 chacun
    PALIERS[domaine][n] = le materiel qui fait passer a l'etoile suivante
       striking : sacs+paos 1 400 € -> ring d'ombre + miroirs 4 200 €
       lutte    : tatamis pro 2 600 € -> mannequins + aire 5 400 €
       physique : coin force 3 800 € -> cardio + recuperation 6 100 €
    RIG (la cage, 12 000 €) est A PART : elle sert aux TROIS domaines.
Le prix monte avec le niveau : la 3e etoile est du materiel de club serieux.
    forfaitReco = 320 + reputation*8 + etoilesTotal*22 + (cage ? 60 : 0)
    chargesSemaine = 90 + etoilesTotal*9 + (cage?28:0) + coachAm*1,2 + 12/pro
MESURE : depart 5 etoiles -> reco 526 €. Tatamis -> 548. Mannequins -> 570.
Cage -> 630 € et charges 205 -> 251 €/sem. Le materiel PAIE, mais il coute
a l'entretien.

## LES ETOILES ET LE COACH JOUENT SUR LA PROGRESSION — FAIT
"Oui bien sur que ca doit jouer moins que le coach, mais ca doit jouer."
/!\ DECOUVERTE EN BRANCHANT : NI LE COACH NI L'EQUIPEMENT N'ENTRAIENT DANS
LE CALCUL. Le gain d'une seance ne dependait que du talent et du hasard :
    g = (0.15 + rand*0.35) * talent
Deux leviers de gestion payants, tous les deux SANS AUCUN EFFET. Le joueur
pouvait investir 6 100 € en cardio sans que rien ne bouge.

facteursSeance(fam, titre) rend deux multiplicateurs :
    fCoach = 0,55 + coach/100 * 0,90        ->  0,55 a 1,45   (x2,6)
    fEquip = 0,80 + (etoiles-1)/2 * 0,40    ->  0,80 a 1,20   (x1,5)
L'etoile lue depend de la FAMILLE de seance : striking -> striking,
jjb -> lutte, physique -> physique, mma -> moyenne striking/lutte.
La CAGE ne joue que sur les seances de grille et de clinch : x1,15 si elle
est la, x0,75 sinon. Elle ne sert a rien ailleurs, et c'est voulu.

MESURE, chaque levier de son minimum a son maximum, 8 semaines, memes
graines :
    tout au minimum       262
    coach au max seul     681   x2,60
    etoiles au max seules  396   x1,51
    => LE COACH PESE 3,1 FOIS PLUS QUE LE MATERIEL.
Du bon materiel ne remplace pas quelqu'un qui sait corriger un geste ; mais
s'entrainer au sol sans tatamis coute vraiment quelque chose.

## DEUX CORRECTIONS D'ECRAN (test de Mael au navigateur, 08/08 21h25)
1. "HIER A LA SALLE · mardi 6" alors que le bandeau disait "Mardi 6 Janvier".
   Le titre etait faux, pas la date : t.abonner() joue la journee du jour
   qu'on VIENT D'ATTEINDRE, donc dernierCR.jour === t.jour toujours. On
   appuie sur Continuer, la journee se deroule, on lit ce qui s'est passe
   AUJOURD'HUI. Titre corrige en "Aujourd'hui a la salle", et "Repos hier"
   en "Pas de seance aujourd'hui". Verifie sur trois jours d'affilee :
   bandeau et compte rendu portent desormais la meme date.
2. /!\ "LE COIN" DESIGNAIT DEUX CHOSES — faute de vocabulaire de ma part.
   Le COIN, en MMA, c'est le coach entre les rounds (panneau #coach). Or
   j'ecrivais aussi "le coin accepte environ X €" pour parler du QUARTIER,
   de la clientele locale. Mael a demande : "coin = combattant, c'est ca ?"
   — la confusion etait donc reelle a la lecture.
   REGLE POSEE : "le coin" = le coach, TOUJOURS. Pour la clientele on dit
   "les gens d'ici" ou "le quartier". Ne pas reintroduire l'ambiguite.

## LA FEUILLE DE COMBAT (test utilisateur, 08/08)
Mael a donne le telephone a quelqu'un d'exterieur au projet. Premier
reflexe : cliquer sur la carte "a venir" combattant c. combattant. Elle ne
faisait rien.
/!\ REGLE A RETENIR : une carte d'affiche DOIT s'ouvrir. Une carte qui ne
repond pas au doigt est percue comme cassee, pas comme "pas encore faite".
Le reflexe d'un joueur qui decouvre vaut mieux que l'avis de celui qui a
construit le jeu.

ouvrirFeuille(id) — tout ce qu'un manager regarde avant une affiche, sur
une seule page, dans le voile existant :
    l'affiche et la date · Le contrat (bourse, format, categorie, orga)
    L'adversaire (age, style, bilan, ses 5 derniers combats)
    Sur le papier (comparaison stat par stat, barres opposees)
/!\ Les profils viennent de MMA.profil — LE MEME bloc que "SUR LE PAPIER"
de l'ecran de combat. Deux lectures differentes du meme combattant seraient
exactement l'incoherence qu'on chasse depuis le debut.

A ENRICHIR PLUS TARD : etat de mon combattant (poids, affutage, blessures),
plan de camp, et le bouton "lancer le combat" quand le jour est arrive.


===========================================================================
# ONGLET MEDIA + LA REPUTATION VIVANTE (fait le 08/08)
===========================================================================
Choisi comme "le plus rapide" : aucun fichier gele touche, toute la matiere
existe deja (verdict.js donne methode/round/detail, feuille.js les frappes,
le jeu connait deja demenagements, achats, arrivees). Purement additif.
/!\ MAIS LE MEDIA SEUL EST DECORATIF. Il n'a de sens que branche sur la
REPUTATION — c'est la presse qui la fait bouger. Les deux ont donc ete
faits dans le meme geste, et cessent d'etre decoratifs ensemble.

## LA REPUTATION BOUGE ENFIN
Elle etait initialisee a 12 et AUCUNE ligne ne l'incrementait, alors que
l'ecran affirmait "elle monte avec les victoires". Maillon manquant de la
boucle du jeu, signale trois fois avant d'etre traite.
    bougerReputation(delta, raison) — borne 0-100, ecrit une depeche
retombees(r) chiffre ce qu'un resultat vaut dans la presse :
    victoire +3, defaite -2
    KO x1,9 (une defaite par KO fait mal : x1,4) · TKO x1,6 · SUB x1,5
    victoire au round 1 : x1,4
    adversaire plus dur (ecart de bilan > 2) : x1,35
    ecraser un tocard (ecart < -4) : x0,6

## /!\ LA CREDIBILITE — LE GARDE-FOU CONTRE LE SPAM
Publier sans matiere recente ABIME la credibilite (-7) et coute 0,3 de
reputation. Avec matiere : +3 de credibilite, et le gain de reputation est
PROPORTIONNEL a elle. Sans ca, le joueur cliquerait le bouton en boucle et
la reputation ne serait plus une reputation mais un compteur.
Une seule publication par jour.

## /!\ L'EROSION — SANS ELLE, UN CLIQUET
Trois semaines sans combat ni evenement : -0,4 par semaine. Une salle dont
on ne parle plus s'oublie. Sans erosion la reputation ne ferait que monter.

## LES TROIS LEVIERS
Publier (gratuit, une fois par jour, exige de la matiere)
CAMPAGNES : flyers 300 € · encart presse locale 900 € · en ligne 2 200 €
EVENTS    : portes ouvertes 400 € · gala amateur 2 600 € · stage invite 1 800 €
Campagnes et evenements donnent reputation ET inscriptions, plafonnees par
la capacite du local — un evenement dans une salle pleine est refuse.

## MESURE, LA BOUCLE SE REFERME
    depart                     reputation 12,0 · forfait acceptable 526 €
    publier sans matiere       credibilite 70 -> 63, reputation 11,7
    gala amateur (2 600 €)     reputation 16,7 · +7 inscrits · 564 €
    publier apres le gala      credibilite 66, reputation 17,5
    victoire d'Okonkwo         reputation 20,0 · 590 €
Gagner -> la presse en parle -> reputation -> on peut facturer plus ->
meilleur coach -> progression. La boucle du jeu est fermee.

## RESTE : le fil ne raconte que la salle. Il pourrait reprendre les
resultats des AUTRES clubs et des ligues quand elles existeront (chantier
Ligues), et les depeches pourraient etre ecrites par le moteur de combat
(feuille.js a deja les frappes par zone pour un vrai compte rendu).


===========================================================================
# IMAGE, INCIDENTS, TRASH TALK, CONF ET PESEE (fait le 08/08)
===========================================================================
/!\ TOUT CECI EST GAME-SIDE. On ajuste le combattant AVANT simuler_combat —
c'est UTILISER le moteur, pas le modifier. Aucun fichier gele touche, la
bascule n'est PAS rouverte. Verification : 13 bancs conformes apres coup.

## DEUX JAUGES, PAS UNE (regle posee par Mael)
    notoriete : combien de gens le connaissent -> cartes, bourses
    sympathie : fan favorite ou pas -> sponsors, main events
Certaines fautes RAPPORTENT de la notoriete. Le trash talk vend des billets,
une orga signe volontiers un type detestable qui fait de l'audience. C'est
tout l'interet d'avoir separe les deux.
/!\ CES STATS NE COMPTENT PAS DANS LA NOTE GENERALE. La note d'un
combattant, c'est le combat. (niveau_moyen() n'inclut deja ni discipline ni
aggression — en revanche il n'inclut pas fight_iq non plus, que Mael veut
dedans : a traiter dans le paquet E/F.)

## LA PART DU MANAGER
10 a 20 %, les gros contrats tirent vers 10 : un champion a le rapport de
force. Stockee par combattant (IMAGE[id].part, 20 % par defaut), affichee
sur la feuille de combat. A NEGOCIER quand l'ecran de contrat sera absorbe.
Le combattant paie ses frais de deplacement — pas encore modelise.

## LES INCIDENTS — FREQUENCE MESUREE, PAS DEVINEE
Tirage QUOTIDIEN, echelle calee sur la MEDIANE REELLE du generateur
(discipline 68, pas 50 : la population penche vers le haut, ceux qui
arrivent au niveau pro ont deja fait le tri).
    discipline haute     1/2000   ~1 tous les 5 ans
    mediane (68)         1/700    ~1 tous les 2 ans
    basse                1/250    ~1,5 par an
    zone extreme         1/100    ~3,7 par an
ZONE EXTREME = discipline <= 30 ET aggression >= 75. Mesure sur 2 000
combattants generes : elle sort 1 FOIS SUR 118. C'est le McGregor : il
existe, on n'en a jamais deux dans le meme roster.
/!\ La notoriete augmente le risque : un inconnu qui fait n'importe quoi ne
fait pas les gros titres. Il faut deja etre connu pour qu'un scandale en
soit un.
MESURE EN JEU : 1,0 incident par an pour 2 pros. Rare, comme voulu.

## LE TRASH TALK EST UNE COMPETENCE, PAS UNE FAUTE
Deux stats neuves : trash (savoir le faire) et resistance (l'encaisser).
L'effet depend de l'ECART, pas des valeurs absolues, et il reste MINEUR
sauf tres gros ecart :
    ecart < 20        rien
    20 a 40           -2 a -4 %
    40 a 60           -5 a -8 %
    > 60              jusqu'a -12 %  (plafond DUR)
/!\ CE QUI ENCAISSE : le mental (fight_iq) et le cardio. JAMAIS la
technique. Un jab reste un jab meme enerve : un homme deborde prend de
mauvaises decisions et se crame, il ne desapprend pas.
Trois scenes ANNULENT la pression recue (humour, applaudir, dedicace) —
sans contre, le trash talk serait desequilibre.

## LES 31 SCENES (conf a J-2, pesee a J-1)
15 en conference, 10 a la pesee, plus les lignes de pesee elles-memes.
Choisies selon le profil : un discipline > 75 ne vise pas le physique, un
aggression > 88 ne fait pas de calins. Deux scenes (viser la famille,
bagarre generale) sont RESERVEES a la zone extreme.
La scene 12 est la seule a effet DIFFERE : promettre un finish au R1 rapporte
de la notoriete tout de suite, et coute de la sympathie APRES si le combat
va aux points. C'est ce qui rend le pari tentant.

## LA PESEE — FORMULE ET BAREME
Format : "X a ete pese a N grammes sous/au-dessus du poids autorise."
/!\ PROBABILITE ET AMPLITUDE SONT DEUX CHOSES SEPAREES. Premiere version :
un seul tirage multiplie par la rigueur — ca ne changeait que l'AMPLITUDE,
et TOUT LE MONDE ratait le poids 19 % du temps, discipline comprise (mesure
a l'appui). Corrige : la rigueur decide d'abord SI, puis DE COMBIEN.
    discipline 85 -> 11,5 % de ratage, jamais plus de 1,1 kg
    discipline 68 -> 18,4 %
    discipline 35 -> 30,0 %, >2 kg dans 4,3 % des cas
Le carre sur le tirage rend les petits ratages courants et les gros rares.
BAREME (valide avec Mael) :
    jusqu'a 500 g   refus  5 %   prise 20 %
    500 g a 1 kg    refus 15 %   prise 25 %
    1 a 2 kg        refus 35 %   prise 30 % -> 50 % AU PRORATA de l'ecart
    plus de 2 kg    refus 85 %   prise 50 %
Le prorata evite la marche d'escalier : 1,2 kg -> 34 %, 1,9 kg -> 48 %.
/!\ UN REFUS ANNULE VRAIMENT LE COMBAT. Premiere version : l'ecran annoncait
"l'affiche tombe" puis jouait le combat quand meme. Corrige.
/!\ RECALIBRAGE APRES MESURE (Mael : "33 % on est trop haut, je dirais 15 %")
    pRate = 0.01 + (1 - rigueur)^1,6 * 0,45
    discipline 85 -> 3,9 %   Okonkwo (71/79) -> 6,3 %   median -> 8 %
    indiscipline 35 -> 19 %  extreme -> 25 %
MESURE FINALE, 120 parties independantes : 19 % de pesees ratees pour au
moins un des deux, 2 % de combats annules.
/!\ 19 % et non 15 % parce que RENAUD a un cardio de 58 : sur cette affiche
precise le theorique est de 15 %, mais la paire tire vers le haut. Sur un
roster general on est sur la cible. Ne pas re-baisser le coefficient a
cause d'une affiche.

## /!\ POUSSER NE COUTE PAS UNE AMENDE (correction Mael)
Une bousculade au face-a-face n'a jamais coute un centime a personne. Seul
un COUP est sanctionne. La scene 27 (pousser) perd son amende ; la 15
devient "envoie une gifle, la securite s'interpose" et garde la sienne.

## /!\ LES ACTES VIOLENTS DOIVENT RESTER RARES
La ponderation par le trash talk les faisait sortir dans 29 % des
conferences — une gifle tous les trois combats. Deux garde-fous :
    coefficient 0,15 sur les scenes marquees `rare`
    et `rare` sert aussi de GRILLE DE DISCIPLINE : reserve a disc <= 55.
Un homme discipline ne gifle pas quelqu'un en conference de presse.
Resultat : 0 % sur 120 parties avec Okonkwo (71) et Renaud (70) — aucun des
deux n'en est capable, et c'est juste.

## /!\ PIEGE DE BANC PAYE ICI : aleaS (le LCG du jeu) N'EST PAS reseme par
la graine du combat. Varier graine:N ne change RIEN aux pesees — j'ai
mesure "40 parties" qui etaient QUARANTE FOIS LA MEME. Pour varier une
partie, il faut varier `let _s=7`.

## RESTE
- la discipline se travaille (validee par Mael) : discussion apres incident,
  travail au long cours, age. Demande l'ecran de dialogue de v2.
- l'image doit jouer sur les OFFRES recues : une orga ne signe pas un gars
  qui a fait fuiter un sparring — mais certaines fautes rendent plus
  bankable. A faire quand les ligues existeront.
- la part du manager doit se negocier a la signature.

## TROIS DEFAUTS SIGNALES A L'USAGE (08/08, 3e session de test)
1. ON POUVAIT PASSER LE JOUR DU COMBAT sans le jouer, et devoir aller le
   chercher dans l'onglet Combats. Le jour du combat BLOQUE desormais la
   journee : bandeau "Combat !", encart "C'est ce soir" avec un seul bouton
   "▶ Lancer le combat". Le bloc d'attente accepte maintenant deux formes —
   Accepter/Refuser (decisions) et action unique (combat).
2. /!\ OUVRIR LES STATS PENDANT LE COMBAT LE FAISAIT REPARTIR A ZERO.
   CAUSE : le jeu acceptait le message "rejouer" A TOUT MOMENT, et
   "rejouer" REBATIT le srcdoc — donc l'animation repart de la premiere
   seconde. Corrige : "rejouer" n'est honore QUE si moteur.fini est vrai.
   Lecon : un message venu de l'iframe doit etre valide contre l'ETAT du
   jeu, pas execute de confiance.
3. La conference de presse ne doit pas se lire dans le fil : Mael veut un
   ecran dedie ou les messages apparaissent EN DIRECT. NON FAIT, a traiter.

## /!\ GRAINE DE DEMONSTRATION : _s = 19, ET POURQUOI
Avec _s=7 (l'ancienne valeur), la pesee de Renaud echoue et le combat est
ANNULE. Le mecanisme marche parfaitement — mais l'apercu devient
intestable : on ne voit jamais l'ecran de combat. On demarre donc sur une
graine ou l'affiche a lieu.
CE N'EST PAS DU CHERRY-PICKING DE RESULTAT : le combat lui-meme reste tire
par le moteur, l'annulation reste active, seul l'etat initial de la partie
de demonstration change. La distinction compte — on avait refuse de choisir
une graine pour obtenir une victoire, ce n'est pas la meme chose.

## L'ECRAN DE SCENE : CONFERENCE ET PESEE EN DIRECT
Demande de Mael : "que le message soit pas cache mais bien visible, limite
pendant la conf de presse ca te met sur une autre interface et tu vois en
direct les messages apparaitre" — puis "tu es spectateur, tu peux passer et
avoir le recap" et "des illustrations de micro, des conneries comme ca, un
ptit decor".
FORME : plein ecran, decor SVG en tete (mur de sponsors "CAGE WARRIORS",
table, deux micros, flashes qui clignotent pour la conf ; balance et
affichage 77.1 pour la pesee), puis les repliques qui TOMBENT UNE PAR UNE
toutes les 1,7 s, alignees a gauche pour notre combattant et a droite pour
l'adversaire, avec les consequences chiffrees dessous (notoriete +3, image
-6, amende...). Une pression n'importe ou : on passe tout et on a le recap.
/!\ SPECTATEUR, PAS ACTEUR. Le joueur ne peut pas intervenir pendant la
conf — c'est une decision de conception, pas un manque : on subit ce que
son combattant raconte, c'est tout le sujet.
Declenchee depuis t.abonner quand SCENE contient des repliques.

## /!\ L'AMENDE DE LA POUSSEE ETAIT ENCORE LA
Corrigee une premiere fois par un remplacement de chaine qui n'a PAS pris
(la ligne differait d'un espace). Vu a l'ecran de scene : "pousse pendant
le face-a-face · amende 600 €". Retiree pour de bon.
LEÇON : un remplacement de chaine qui echoue ne dit rien. Toujours verifier
que la modification a pris — ici c'est l'ecran qui l'a montre, pas le code.

## QUATRE CORRECTIONS APRES TEST (08/08, minuit)
1. LA SCENE ALLAIT TROP VITE : 1,7 s par replique -> 2,8 s. On lit sans
   courir, et on peut toujours passer d'une pression.
2. /!\ LA CROIX QUITTAIT LE COMBAT. Reflexe naturel : on sort du panneau de
   stats en tapant la croix en haut a droite... et on quitte le combat.
   Elle est desormais MASQUEE tant que le combat court, et n'apparait qu'a
   la fin.
3. /!\ ET SURTOUT : QUITTER PUIS RELANCER A VOLONTE, C'EST TRICHER.
   Meme corrige que le point 2 : sans croix, on ne sort plus d'un combat en
   cours. Le combat se joue jusqu'au bout ou pas du tout. C'est aussi ce qui
   donne du poids aux consignes du coin — on ne peut pas essayer, voir, et
   recommencer autrement.
4. BOUTON "⏭ SIMULER" dans l'ecran de combat : applique toutes les etapes
   restantes du round d'un coup, puis sonne la cloche. Le combat n'est PAS
   modifie — seule la vitesse de LECTURE change, et c'est important : on
   saute l'animation, pas le tirage. Verifie : t passe de 0 a 304, le coin
   s'ouvre sur "FIN DU ROUND 1".


===========================================================================
# CHANTIER H — L'ENTENTE COACH / COMBATTANT (conception, 08/08 nuit)
===========================================================================
NON COMMENCE. Concu entierement a l'oral avec Mael ; rien n'est code. Tout
est ecrit ici parce que ca s'est construit en discutant et que ca se
perdrait autrement.
/!\ PREREQUIS : l'ecran de DIALOGUE de mma_manager_v2.html, toujours pas
absorbe. L'entente vit dans les echanges — sans dialogue, elle n'a pas de
surface.

## CE QUE C'EST
Une jauge PAR COMBATTANT, entre lui et toi. A ne pas confondre avec
discipline (sa rigueur a lui) : l'entente, c'est ce qu'il y a ENTRE VOUS.
Un type tres discipline peut te detester.
/!\ ELLE N'EST PAS UN COMPTEUR D'EVENEMENTS : c'est le RESIDU DE TOUTES LES
INTERACTIONS. Chaque dialogue laisse une trace, meme minuscule, meme NULLE
— et zero est une valeur, pas un oubli. Botter en touche ne monte ni ne
descend, et c'est exactement ce que ca doit faire. C'est le volume des
petits echanges qui fait qu'au bout de deux ans la relation a une histoire.

## CE QUI LA FAIT MONTER
lui decrocher une affiche qu'il voulait · une victoire apres un camp bien
regle · un combat a domicile (pas de frais) · baisser ta part de toi-meme ·
le defendre publiquement apres un incident · accepter qu'il refuse un
combat · investir dans le materiel de SON domaine · alleger l'equipe qui
part quand la bourse est maigre.

## CE QUI LA FAIT BAISSER
le faire combattre trop tot, blesse, hors categorie · une affiche lointaine
a petite bourse · lui refuser une offre qu'il voulait · l'engueuler apres
une defaite · le laisser enchainer sans progresser · emmener tout le staff
sur un combat mal paye · garder tes 20 % alors qu'il est devenu meilleur
que ton club · l'abandonner mediatiquement apres un derapage.

## /!\ LES FRAIS DE DEPLACEMENT — J'AVAIS MAL COMPRIS, DEUX FOIS
LE COMBATTANT PAIE SON DEPLACEMENT **ET LE TIEN**, et celui du coin
(coach, cutman, prepa). Puis il te verse ta part sur ce qui reste.
CONSEQUENCE : toi, tu ne risques RIEN. Tu voyages a ses frais et tu prends
ton pourcentage. C'est une asymetrie reelle du metier, et un ressort de jeu
— la mauvaise affiche ne te coute rien, elle LE coute a lui.
Le grief n'est donc JAMAIS "tu prends 20 %", c'est "je suis rentre avec
1 500 € et toi tu n'as rien risque". Il compte CE QU'IL LUI RESTE :
    bourse − frais de deplacement − ta part = ce qu'il touche vraiment
L'entente doit bouger sur ce NET REEL, pas sur la bourse annoncee.
A AFFICHER SUR LA FEUILLE DE COMBAT avant d'accepter : "Manchester,
~1 900 € a sa charge, ta part 20 % — il touche 1 680 €".
ARBITRAGE DE MANAGER QUE CA OUVRE : reduire l'equipe qui part. Moins de
frais pour lui, mais il combat moins bien prepare.

## /!\ LE FREIN N'EST PAS UNE LIMITE, C'EST UN COUT (trouvaille de Mael)
J'allais proposer des rendements decroissants pour empecher le joueur de
cliquer sur tous les dialogues. Inutile : CHAQUE POINT D'ENTENTE S'ACHETE
AVEC QUELQUE CHOSE DE REEL.
    tu le FLATTES        -> entente +, mais confiance + et GROSSE TETE :
                            il travaille moins, prend l'adversaire de haut
    tu acceptes TOUT     -> meme les demandes saugrenues : il monte de
                            categorie trop tot, allege les seances, perd
    tu baisses TA PART   -> entente immediate, tresorerie en moins
Rien a brider parce que rien n'est gratuit. Et l'inverse est un style
valable : une equipe a entente basse qui gagne, parce qu'on ne cede rien.
AUCUNE OPTION N'EST BONNE DANS L'ABSOLU : un jeune qui manque de confiance,
on le flatte ; un type deja arrogant, ca le tue.
LA GROSSE TETE = `discipline` QUI BAISSE. On n'invente pas une neuvieme
stat : discipline existe, elle est MORTE (chantier F), et elle porte
exactement ce sens. L'entente la ressusciterait.

## LES DEMANDES — ~50 A ECRIRE, PAR FAMILLES
calendrier (refuser ce combat, vacances, ne plus s'entrainer le mardi,
espacer ou enchainer) · preparation (moins de seances, plus de sparring,
changer de coach, stage ailleurs) · le combat (striker et pas lutter,
monter de categorie, cet adversaire-la, refuser celui-ci) · argent
(renegocier ta part, une avance, un sponsor) · staff (emmener son pote au
coin, moins de monde au deplacement, un prepa perso) · ego (passer pro,
main event, plus de com sur lui) · personnel (souci familial, blessure
cachee, envie d'arreter).
CHAQUE DEMANDE PORTE : ce que coute le OUI (argent, performance, controle),
ce que coute le NON (entente, combien), QUI la formule (profil qui la rend
probable), et le "OUI MAIS" quand il a un sens.
/!\ Elles sont FORMULEES PAR LE COMBATTANT selon son profil : un agressif a
faible fight IQ veut du plus gros, un flemmard veut moins de seances.
LIVRAISON : famille par famille, Mael corrige le ton sur la premiere et on
applique aux six autres.

## /!\ LE "OUI MAIS" EST UNE PROMESSE CONDITIONNELLE, PAS UN COMPROMIS MOU
Exemple donne par Mael : "Monter de categorie ? D'accord. Gagne tes deux
prochains et on le fait."
    l'entente monte TOUT DE SUITE, moins qu'un oui franc, bien plus qu'un non
    une DETTE apparait : le jeu doit retenir la promesse et sa condition
    et si tu ne tiens pas parole, l'entente s'effondre PLUS BAS qu'un refus
       franc — un refus honnete vaut mieux qu'une promesse trahie
DONNEES A PREVOIR : condition (n victoires, n mois, un titre), echeance, et
ce qui se passe a terme. Sans ca on aura des promesses qu'on oublie de
verifier, et c'est le JEU qui mentira.

## LE DEPART — L'ENTENTE AMORTIT, ELLE NE BLOQUE PAS
    tentation = valeur de l'offre − ce que tu lui apportes − entente
Si Khabib l'appelle, le premier terme ecrase tout : meme a entente
parfaite, ON NE LE RETIENT PAS. Et c'est juste — personne ne refuse ca.
Ce que l'entente change alors : il te PREVIENT au lieu que tu l'apprennes
par la presse, il finit ses engagements, il te laisse une part sur le
prochain contrat ou te recommande, il revient plus tard.
A entente basse : il part du jour au lendemain, il ne te doit rien, et il
raconte partout que tu l'as mal gere — TA REPUTATION EN PREND.
/!\ L'entente protege surtout contre les offres MOYENNES (le club voisin
mieux equipe, le manager qui promet plus) — l'immense majorite des cas. Le
vrai levier contre les grosses offres, ce n'est pas l'affection : c'est
D'ETRE DEVENU ASSEZ BON pour que l'offre n'ait plus d'interet.

## LA RENEGOCIATION — CE QUI DONNE UN PRIX A L'ENTENTE
Il ne claque pas la porte : il vient te voir. "J'ai une offre. Voila ce
qu'il me faut pour rester." Et sa demande est ESCOMPTEE PAR L'ENTENTE :
    entente basse   -> il exige tout, et plus encore
    entente moyenne -> il demande a peu pres l'offre concurrente
    entente haute   -> il demande nettement moins, il te laisse une chance
L'entente cesse d'etre sentimentale : c'est UNE REMISE CHIFFRABLE sur le
prix de le garder. Deux ans de bonne relation valent tant de pourcents.
Il peut demander : ta part qui baisse, un combat precis, du materiel dans
son domaine, un vrai coach. TU PEUX DIRE NON — le laisser partir est une
decision valable.

## /!\ ET PARFOIS IL A DEJA DECIDE (dernier mot de Mael)
Certaines fois, rien a faire. Pas de renegociation, pas de contre-offre :
il vient t'annoncer qu'il part. Il FAUT ce cas, sinon le systeme devient
une machine ou tout se rachete, et le joueur finit par croire qu'il
controle ses hommes. Il ne les controle pas.
A DOSER : rare, mais reel. Plus probable a entente basse, jamais impossible
a entente haute.

## /!\ LA "REFERENCE GELEE" DE mesure.js ETAIT DEVENUE UN FANTOME
Signale par l'IA avec qui Mael a demarre le projet, verifie et corrige.
Elle annoncait encore DEC 46.8 / nul 0.8, l'etat d'AVANT la bascule scoring.
On aurait compare a un etat qui n'existe plus.
    mesure : DEC 47.6 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3 | nul 0.0
    ligne  : DEC 46.8 | SUB 20.8 | TKO 19.4 | KO sec 10.9 | TKO sol 1.3 | nul 0.8
/!\ ET LE DELTA EST UNE PREUVE, PAS UN DEFAUT : SUB, TKO, KO sec et TKO sol
sont IDENTIQUES AU DIXIEME. Seuls DEC et nul ont bouge, de exactement 0,8
point, l'un vers l'autre — ce sont les matchs nuls devenus des decisions,
le 10-8 ayant quasi disparu. Le scoring ne touche QUE les decisions, comme
annonce le jour de la bascule. La ligne perimee cachait cette confirmation.
LEÇON : une valeur de reference ecrite en dur DOIT etre mise a jour le jour
ou l'on bascule, dans le meme geste. Sinon elle devient un mensonge poli.


===========================================================================
# js/classement.js — LES RANGS ET LES ORGANISATIONS (fait, 09/08)
===========================================================================
Module natif JS, banc 14, aucun fichier gele touche.

## LES CINQ ORGANISATIONS (echelle dictee par Mael)
bourse = [entree, champion, plafond star] en milliers, PAR COTE : "1+1" =
1 000 € garantis + 1 000 € de prime de victoire.
    Hexagone  nationale        1+1   ->  7+7   ->  15+15
    Ares      nationale +      2+2   -> 12+12  ->  50+50
    KSW       europeenne       4+4   -> 20+20  ->  80+80
    PFL       internationale  15+15  -> 50+50  -> 150+150
    UFC       internationale  12+12  -> 175+175 -> 2 M + 2 M
/!\ L'UFC PAIE MOINS QUE LA PFL A L'ENTREE (24 000 € contre 30 000 € par
victoire) ET 13 FOIS PLUS AU SOMMET. Ce n'est pas une coquille : c'est le
vrai dilemme du metier, et ca fait une decision de manager.
Un champion Ares tres connu (100 000 €) gagne plus qu'un champion KSW de
base (40 000 €) : la notoriete peut battre le palier.

## CONTRATS (a coder : pas encore branche)
3 combats, renegociation a la fin. Pas de changement d'organisation sous
contrat, SAUF rachat par une autre — rare. Devenir champion rouvre le
contrat MEME s'il reste des combats engages.

## LE MOUVEMENT AU CLASSEMENT
Les quatre cas dictes par Mael, verifies AU CHIFFRE PRES au banc :
    non-classe bat le #10   -> il entre #14        (le #10 sort du top 15)
    le #10 bat le #8        -> il passe #9
    le #5 perd vs le #6     -> il tombe #6
    le #5 perd vs le #15    -> il tombe #11        (et le #15 monte #8)
LA MANIERE compte : le #8 battu tombe #9 sur un combat serre, #10 sur une
decision nette, #11 sur un KO au premier round.

## /!\ LA DENSITE VIT DANS LE MATCHMAKING, PAS DANS LES POINTS
Enseignement de la simulation, AVANT d'ecrire le module : avec le seul
bareme de points, battre UN classe suffisait a etre classe — donc "une
victoire" pour entrer au top 15, a l'UFC comme a Hexagone, ce qui
contredisait "5 grosses perfs a l'UFC". Et une serie victoire/defaite
stagnait a #9 au lieu de ne jamais classer.
Corrige : un non-classe affronte d'AUTRES NON-CLASSES tant qu'il n'a pas
fait ses preuves ; la serie exigee vaut 3 a Hexagone, 4 a Ares, 5 ailleurs.
Les points ne font que ranger ceux qui ont deja la porte ouverte.
MESURE : 4 victoires pour percer a Hexagone, 6 a l'UFC. Victoire/defaite en
boucle : JAMAIS classe, nulle part.

## /!\ LA NOTORIETE OUVRE DES PORTES QUE LE BILAN N'OUVRE PAS
Demande de Mael : "une super star a toujours un chemin plus simple".
serieRequise() retire jusqu'a 3 victoires selon la notoriete —
    a l'UFC : inconnu 5 victoires · connu 3 · star 2
mais JAMAIS moins de 1 : meme une star doit gagner une fois.
C'est injuste et c'est le metier : les organisations vendent des billets,
elles ne recompensent pas le merite.

## RESTE POUR LE POINT 4 DE LA FUSION
- le vivier regional (~60 combattants generes, par categorie, qui vivent)
- les offres de combat qui arrivent par message, avec delai
- les contrats de 3 combats et leur renegociation
- les autres combats : simulation complete dans TON organisation, resultat
  abrege ailleurs (sinon on attend)

## LA NOTORIETE PLAFONNE A LA PORTEE DE L'ORGANISATION (demande de Mael)
"La notoriete monte suivant les ligues : l'Europe te fera bien connaitre en
Europe, les USA te montrent au monde, l'UFC encore pire, surtout en main
card."
    Hexagone 40 · Ares 55 · KSW 70 · PFL 80 · UFC 100
/!\ CHOIX ASSUME : UNE SEULE JAUGE AVEC PLAFOND, pas trois jauges
regionales (France / Europe / Monde). Le plafond porte deja l'intention —
la portee de l'organisation decide de jusqu'ou on peut monter — sans
obliger chaque bourse, chaque offre et chaque scandale a savoir OU la
notoriete compte. A decouper plus tard si ca manque.
CONSEQUENCE DE JEU, et c'est le but : un champion Hexagone monte vite
jusqu'a 40 et BLOQUE. Il lui faut changer d'organisation pour exister
ailleurs. C'est le plafond qui pousse vers le haut, pas l'argent.

## LA PLACE SUR LA CARTE MULTIPLIE
    prelims 0,5 · main card 1,0 · co-main 1,4 · main event 2,0
Un main event vaut quatre prelims. Mesure a l'UFC : +2,8 / +5,5 / +7,7 / +11.

## /!\ CALIBRAGE PAR MESURE, PAS AU JUGE
Premiere version a base 3,2 : 22 combats pour saturer Hexagone, soit huit
ans a trois combats par an. UN PLAFOND QU'ON N'ATTEINT JAMAIS NE POUSSE
PERSONNE VERS LE HAUT. Porte a 5,5 :
    saturation : Hexagone 13 combats · Ares 18 · KSW 23 · PFL 26 · UFC 33
    paliers qui ouvrent des portes (UFC, main card) :
       notoriete 25 (−1 victoire exigee) en  5 combats
       notoriete 50 (−2)                 en 12
       notoriete 75 (−3)                 en 20
Une defaite RAPPORTE un peu (on parle de toi) mais ne retire rien : on ne
devient pas inconnu en perdant.
Banc 14 : quatre invariants ajoutes, dont le DISCRIMINANT "un champion
regional plafonne et ne repart qu'en changeant d'organisation".

## LES ORGANISATIONS SONT RENOMMEES (noms derives)
    HEX  Hexagone FC                  France       nationale        portee 40
    TRI  Trident FC                   France       nationale +      portee 55
    SOK  Sokół Fight                  Pologne      europeenne       portee 70
    GFL  Global Fight League          USA          internationale   portee 80
    AFC  Apex Fighting Championship   USA          internationale   portee 100
/!\ L'IDENTIFIANT EST SEPARE DU LIBELLE : le code n'utilise que la CLE
(HEX, TRI, SOK, GFL, AFC). Changer un nom affiche, c'est UNE ligne.
Les vraies marques sont deposees. Sur un telephone personne ne dit rien ;
le jour d'une publication, meme gratuite, on s'expose — l'UFC est connue
pour etre agressive sur sa propriete intellectuelle. On garde la PLACE DANS
LA HIERARCHIE et on change le nom : le joueur reconnait le role.
/!\ "Titan FC" a ete ECARTE : cette organisation existe reellement aux USA.
/!\ JE NE CERTIFIE PAS que ces noms sont libres. AVANT PUBLICATION :
verifier a l'INPI et a l'EUIPO, gratuit et en ligne.

## js/etoiles.js — LES HUIT TETES D'AFFICHE MONDIALES (banc 15)
Une par categorie, chacune d'un grand pays du sport, inspirees de champions
reels — c'est ce qui les rend reconnaissables et donne envie de les battre.
    lourd     France       Loïc « le Gamin » Vanel          (Gane)
    mi-lourd  Brésil       Wanderson « Pedra » Bastos       (Pereira)
    moyen     Tchétchénie  Aslan « Turpal » Aslanov         (Chimaev)
    welter    Nigeria      Emeka « le Cauchemar » Adebayo   (Usman)
    léger     Espagne      Iker « el Toro » Ferrer          (Topuria)
    plume     Australie    Cody « the Boss » Whitlock       (Volkanovski)
    coq       USA          Denver « Candy » Rourke          (O'Malley)
    mouche    Mexique      Beto « el Niño » Cortés          (Moreno)
Le flyweight n'etait pas tranche : Moreno / Mexique complete la carte sans
doublon de pays.
METHODE : on garde la SILHOUETTE (pays, categorie, style, registre du
surnom) et on change l'identite. Le champ `clin` dit de qui chacune
s'inspire — REFERENCE DE CONCEPTION, il ne doit JAMAIS atteindre l'ecran.
/!\ NE PAS "DERIVER" EN CHANGEANT UNE LETTRE d'un nom reel : c'est plus
risque juridiquement qu'un nom franchement different, et c'est moche.
/!\ LE DROIT A L'IMAGE D'UNE PERSONNE EST PLUS SENSIBLE QU'UNE MARQUE. Et
le moteur va les faire PERDRE, leur coller des bourses et leur faire dire
des horreurs en conference de presse : avec un vrai nom, ca devient
inconfortable tres vite.

## /!\ QUATRE SURNOMS SUR HUIT ETAIENT DES TRADUCTIONS — ET LE BANC NE LES
## VOYAIT PAS
Signale par Mael : "Usman le Cauchemar, c'est son vrai surnom non ?" — oui,
et il n'etait pas seul. Audit :
    « le Cauchemar » <- "The Nigerian Nightmare"  (Usman)
    « Pedra »        <- "Poatan", la pierre        (Pereira)
    « le Gamin »     <- "Bon Gamin"                (Gane)
    « el Niño »      <- "The Assassin Baby"        (Moreno)
J'avais TRADUIT au lieu d'INVENTER. Le banc ne les a pas vus parce que sa
liste contenait les NOMS, pas les SURNOMS ni leurs traductions.
Mael a enfonce le clou avec trois exemples : "l'enfant, rock, bad dream" —
ce sont exactement el Niño, Pedra/Poatan et Nightmare dans une autre langue.
/!\ TRADUIRE UN SURNOM, C'EST LE COPIER. CHANGER DE LANGUE N'Y CHANGE RIEN.
CORRECTION, et la bonne methode : PARTIR DU STYLE DE COMBAT, jamais du
surnom.
    Vanel   « l'Horloger »  la precision, le placement
    Bastos  « Meia-Noite »  minuit : la lumiere s'eteint
    Adebayo « le Rouleau »  la pression qui aplatit
    Cortés  « Colibrí »     le rythme, la vitesse
BANC 15 : le filtre travaille desormais par FAMILLE SEMANTIQUE (enfant,
pierre, cauchemar, loup) en six langues, pas par mot exact. Discriminant
verifie : « l'enfant », « Rock », « Bad Dream », « el Nino », « Pedra »,
« le Cauchemar », « Borz » sont TOUS refuses ; les quatre nouveaux passent.

## /!\ LE BANC A ATTRAPE UNE FUITE REELLE
Premier surnom essaye pour le tchetchene : « Borz ». REFUSE par le banc —
c'est le surnom REEL de Chimaev, pas un mot generique. Remplace par
« Turpal » (heros, en tchetchene), qui est un mot commun.
Le banc 15 tient une liste de noms reels interdits et verifie qu'aucun
n'apparait dans ce qui sera affiche. Il verifie aussi les contraintes du
traducteur : noms MONO-JETONS et aucun prefixe d'un autre (piege de la
graine 17).

## LES ETOILES ETAIENT LISSES : 47 % DE STATS A 97+
Question de Mael : "niveau stats ils sont très bien lotis j'imagine". Mesure :
47 % de leurs stats a 97 ou plus, et l'une affichait 97/97/98/99/99/99 — bon
partout, donc SANS IDENTITE.
/!\ BAISSER LEUR NIVEAU GENERAL AURAIT ETE LA MAUVAISE REPONSE : ce sont les
meilleurs du monde, ils DOIVENT etre tres haut. Ce qui manquait n'etait pas
de la moyenne, c'etait UNE FAIBLESSE.
On creuse donc un domaine par etoile, celui que le champion reel devait
cacher : le lourd elegant au sol, le frappeur en lutte, le lutteur debout.
C'est ce trou qui rend un adversaire battable et un plan de jeu utile.
    Vanel   ground     Bastos  wrestling   Aslanov striking   Adebayo striking
    Ferrer  ground     Whitlock wrestling  Rourke  wrestling  Cortés  striking
COUP = {striking 0.88, wrestling 0.76, ground 0.74} — la frappe est amortie,
voir juste en dessous pourquoi.

## /!\ DEUX EXIGENCES QUI SE CONTREDISENT — COMPROMIS ASSUME, A ARBITRER
    (a) chaque sommet doit avoir une faiblesse identifiable
    (b) aucun sommet ne doit tomber sous 88 de note generale
niveau_moyen() compte CINQ STATS DE FRAPPE SUR DIX. Creuser le striking d'un
grappler lui coute donc ~8 points de note, et pour le ramener a 88 il faut
monter le reste si haut qu'il redevient lisse.
MESURE : niveau 91 -> min 83 et 34 % de stats saturees
         niveau 97 -> min 88 et 48 % de stats saturees
LES DEUX NE TIENNENT PAS ENSEMBLE tant que niveau_moyen() reste ce qu'il est.
LA VRAIE SOLUTION : rendre la note generale moins dependante de la frappe —
ce que Mael veut deja (note = combat + fight IQ) et qui vit dans engine.py.
=> CHANTIER E/F, reouverture de la bascule.
EN ATTENDANT : niveau 94, seuil du banc abaisse a 84, faiblesses gardees.
Etat : de 85 a 93 de note, 1 regional sur 200 au-dessus de la plus faible.

## /!\ DU CODE NON TRACE DANS verifier_etoiles.js
Deux invariants ("aucune sous 88", "domine un vivier regional") se sont
trouves dans le banc sans que je les aie ecrits dans la seance. Signale
plutot que masque. Traites selon la regle du carnet — evaluer sur PIECES,
pas sur origine : ils sont pertinents, on les garde, mais le seuil de 88
est incompatible avec les faiblesses (voir ci-dessus) et a ete abaisse avec
sa justification.

## LES PROFILS DES ETOILES SONT DICTES, PAS DERIVES (Mael, chiffre par chiffre)
Premiere version : generation par archetype puis creusement d'un domaine par
coefficient. Trop grossier — Vanel avait 89 en lutte quand Mael en voulait
75, et Rourke avait un bon sol quand il devait avoir une bonne lutte et un
sol moyen.
Chaque etoile porte donc une CIBLE par domaine, et caler() met le domaine a
l'echelle pour l'atteindre. Le GENERATEUR donne la texture (le relief entre
les stats d'un meme domaine), la CIBLE donne le niveau.
                     frappe / lutte / sol
    Vanel    (Gane)      93 / 75 / 75      lourd elegant, faible au sol
    Bastos   (Pereira)   93 / 71 / 75      frappeur, ne lutte pas
    Aslanov  (Chimaev)   76 / 99 / 94      "parfait" selon Mael
    Adebayo  (Usman)     81 / 94 / 92      pression et lutte
    Ferrer   (Topuria)   94 / 98 / 91      le plus complet des frappeurs
    Whitlock (Volka)     88 / 87 / 87      VOLONTAIREMENT COMPLET
    Rourke   (O'Malley)  94 / 88 / 75      bonne lutte, sol moyen
    Cortés   (Moreno)    81 / 92 / 97      frappe remontee a 81
Note generale : de 86 a 96. Zero regional sur 200 au-dessus de la plus
faible etoile.
/!\ WHITLOCK EST L'EXCEPTION ASSUMEE : le combattant sans trou, c'est son
identite. Le banc exige donc SEPT sommets sur huit avec une faiblesse, pas
huit — sinon il interdirait le profil demande.
/!\ INVARIANT NEUF : chaque domaine doit tomber SUR LA CIBLE a 2 points
pres (24 domaines verifies). Sans lui, un changement du generateur
deplacerait silencieusement les huit sommets.

## /!\ "UNE NOTE MOYENNE HAUTE NE VEUT PAS DIRE QUE TU DOMINES" (Mael)
"Si tes stats sont mal foutues dedans, ca vaut rien."
Principe pose, et MIS A L'EPREUVE DU MOTEUR — deux etoiles a la MEME note
generale, stats reparties autrement, 400 combats chacun :
    Vanel  88  (93/75/75)  contre  Aslanov 88  (76/99/94)  ->  64 % / 36 %
    Vanel  88  (93/75/75)  contre  Adebayo 87  (81/94/92)  ->  67 % / 33 %
    Rourke 91  (94/88/75)  contre  Aslanov 88  (76/99/94)  ->  59 % / 41 %
Le principe est VRAI : la note ne predit pas l'issue.

/!\ MAIS PAS POUR LA RAISON ATTENDUE, ET C'EST UNE DECOUVERTE.
Ce n'est pas la faiblesse de Vanel qui est exploitee — c'est la FORCE
d'Aslanov qui NE PEUT PAS S'EXPRIMER. Mesure sur 200 combats :
    Aslanov (lutte 99, gameplan wrestling 0.52) contre Vanel (lutte 75)
      takedowns TENTES par round   1,95
      takedowns REUSSIS par round  0,70
      passages au sol par round    0,90
      taux de reussite             36 %
Un lutteur d'elite ne va au sol qu'UNE FOIS PAR ROUND face a un homme qui
lutte 24 points en dessous. Le plafond du moteur (TAUX = 0.12 / cadence,
~4,7 tentatives par round au maximum) l'en empeche.
=> LE MOTEUR SOUS-PAIE LE GRAPPLING. Un frappeur a note egale gagne, quel
que soit l'ecart en lutte. C'est un vrai desequilibre, pas une nuance.
=> RATTACHE AU CHANTIER E : c'est le meme plafond TAUX qui limitait deja le
bouton "Lutter" du coin (mesure du 08/08 : 2,68 takedowns par round a
gameplan 1.0). Le relever changera la frequence des passages au sol, donc la
repartition SUB/DEC, donc le calibrage gele. A ouvrir en connaissance de
cause.

## WHITLOCK REMONTE (90/89/89)
Il etait a 91 de note quand Ferrer affichait 96, alors que son identite est
d'etre le plus complet. Cause : la note ne compte NI fight_iq NI le menton
NI le timing — et Whitlock a 99 de fight IQ et 99 de cardio pour rien.
Contournement assume en attendant que fight_iq entre dans la note
(demande de Mael, chantier E/F, reouverture de la bascule).


===========================================================================
# BASCULE DU 09/08 — fight_iq ET LE MENTON DANS LA NOTE
# /!\ ANNULEE ET REFAITE AUTREMENT LE MEME JOUR — LIRE LA FIN DE SECTION
===========================================================================
Demande de Mael, formulee deux fois. La note generale doit dire ce que vaut
un COMBATTANT, pas seulement ce que valent ses armes : un homme qui lit le
combat et qui encaisse vaut mieux qu'un homme qui frappe aussi fort et qui
s'ecroule.
    AVANT : (jab + cross + low_kick + esquive + footwork + shot + sprawl
             + passing + submission_def + cardio) / 10
    APRES : les memes + fight_iq + chin, / 12

## /!\ CE N'EST PAS QU'UN AFFICHAGE
niveau_moyen() entre dans specialite(), qui entre dans la chance de takedown
(engine 551 : `+ 26 * atk.specialite(skill)`). Le changer CHANGE LES
COMBATS. Mesure faite AVANT de toucher quoi que ce soit, sur 308
combattants :
    note moyenne                     70,0 -> 70,4
    bonus de specialiste sur le shot 0,320 -> 0,320
    effet sur la chance de takedown  0,0 point en moyenne
25 % des specialistes perdent un peu de bonus, les autres en gagnent : ca se
compense. C'est ce qui rendait la bascule acceptable.

## /!\ LEÇON DE METHODE : MON GARDE-FOU ETAIT TROP ETROIT
Le protocole a donne 180 combats sur 180 IDENTIQUES ligne a ligne, 71 076
lignes, zero divergence. J'ai failli en conclure "aucun effet".
FAUX. Le corpus etait limite au POIDS WELTER, niveaux 52-92. La mesure
globale (toutes divisions, graines 11/41/900) montre un vrai deplacement :
    DEC 47,6 -> 47,1 · SUB 20,8 -> 22,1 · TKO 19,4 -> 18,7 · KO 10,9 -> 10,7
UN A/B RESTREINT A UNE DIVISION NE PROUVE RIEN SUR LES AUTRES. Le prochain
garde-fou doit balayer toutes les divisions, pas une seule.
Le deplacement reste dans la tolerance (cibles DEC ~46, TKO ~19, SUB ~20,
KO ~10) mais il est REEL : +1,3 point de soumissions. La ligne de reference
de mesure.js a ete mise a jour dans le meme geste — pas six heures plus
tard comme la derniere fois.

## /!\ LA BASCULE CI-DESSUS A ETE ANNULEE — REMARQUE DE MAEL
"C'est que de l'interface, tout est déjà calculé. Ils se battent pas grâce
au général mais aux notes de l'intérieur." Puis : "et si on avait intégré
sans l'intégrer dans le calcul spécialiste ?"
EXACT, ET C'ETAIT LA BONNE SOLUTION DEPUIS LE DEBUT.
Le moteur combat avec les stats detaillees (jab, shot, passing), jamais avec
la note. La note ne servait au moteur QUE comme reference de specialite() —
un shot a 95 chez un homme qui a 70 partout est une arme, le meme shot chez
un homme qui a 92 partout n'est qu'une stat de plus. C'est l'ECART qui
compte, donc la reference doit rester STABLE.

## LA SEPARATION — DEUX FONCTIONS AU LIEU D'UNE
    niveau_moyen()   10 stats, INCHANGE depuis le gel · PARAMETRE DU MOTEUR
                     sert de reference a specialite(), entre dans la chance
                     de takedown. Ne doit jamais bouger pour l'interface.
    note_generale()  12 stats (les 10 + fight_iq + menton) · AFFICHAGE SEUL
                     n'entre dans AUCUN calcul. On peut y mettre ce qu'on
                     veut : l'ecran change, pas un combat ne bouge.
PREUVE : apres separation, mesure.js redonne EXACTEMENT le calibrage du
08/08 — DEC 47,6 | SUB 20,8 | TKO 19,4 | KO 10,9 | TKO sol 1,3 | nul 0,0.
Le +1,3 point de soumissions de la bascule a disparu.
    etoiles :  affichee / moteur
    Vanel 90/88 · Bastos 88/86 · Aslanov 90/88 · Adebayo 88/87
    Ferrer 97/96 · Whitlock 93/92 · Rourke 92/91 · Cortés 88/87

## LEÇON, ET ELLE COMPTE PLUS QUE LE CODE
J'ai ouvert le gel, applique le protocole, regenere sept fichiers de
reference et deplace le calibrage — POUR UN RESULTAT QU'ON POUVAIT OBTENIR
SANS TOUCHER AU MOTEUR. La bonne question n'etait pas "comment basculer
proprement" mais "faut-il basculer".
AVANT DE ROUVRIR LE GEL, TOUJOURS SE DEMANDER : est-ce que la valeur que je
veux changer est LUE par le moteur, ou seulement AFFICHEE ? Si elle est lue,
peut-on la dedoubler plutot que la modifier ?
Ce qui n'est pas perdu : la mesure a revele que niveau_moyen() entrait dans
le combat — ni Mael ni moi ne le savions. Sans elle, on aurait dedouble a
l'aveugle.

## /!\ ET LE GARDE-FOU ELARGI RESTE LA REGLE
Le premier A/B (180 combats, welter uniquement) donnait 100 % identiques et
concluait "aucun effet" — alors que la mesure toutes divisions montrait
+1,3 sur les soumissions. Le second balayait LES NEUF DIVISIONS (324
combats, 143 587 lignes). C'est desormais le minimum.


===========================================================================
# js/grappling.js — LES QUATRE ETAGES DU JEU AU SOL (banc 16, 09/08)
===========================================================================
/!\ CE MODULE NE TOUCHE AUCUN FICHIER GELE. Il LIT le combattant et en
deduit des informations neuves ; ground_v2 et engine sont inchanges. On pose
la matiere, on la mesure, et on ne rouvre le moteur qu'ensuite.

## POURQUOI QUATRE ETAGES ET PAS UNE "NOTE DE GRAPPLING"
Le moteur ecrasait des dimensions sans rapport. Quatre profils reels donnes
par Mael le prouvent — chacun casse un etage different :
  1. AMENER AU SOL   shot · throws · clinch_wrestling · grip_fighting
     SHAVKAT : zero entree en jambes, mais body lock et projections. Il
     amene au sol autant qu'un autre, par une VOIE differente.
  2. ATTEINDRE       passing · back_top · mount_top
     BRENDAN ALLEN : tres fort pour ALLER CHERCHER LE DOS — ce n'est pas la
     meme chose que savoir etrangler une fois qu'on y est.
  3. GARDER          controle · retention        KHABIB
  4. FINIR           les quatre familles         USMAN : 1, 2, 3 d'elite et
     UNE soumission en carriere. PIMBLETT : l'inverse exact, incapable
     d'amener au sol, mortel une fois que ca y est, y compris DEPUIS LE
     DESSOUS.
LES QUATRE ETAGES SONT INDEPENDANTS. Les correler ("bon grappler = bon
partout") rendrait ces quatre hommes impossibles a fabriquer.

## LES QUATRE FAMILLES (les 21 soumissions du moteur, toutes classees)
    dos        rear_naked · bow_and_arrow · neck_crank
               -> back_control, crucifix
    bras       armbar · kimura · americana · omoplata · triangle · ezekiel
               -> mount, side_control, knee_on_belly, closed_guard
    tete_bras  darce · brabo · anaconda · arm_triangle · north_south ·
               peruvian · guillotine · baseball
               -> north_south, turtle, half_guard, side_control
    jambes     heel_hook · toe_hold        -> open_guard, butterfly
Huit valeurs par combattant : les quatre familles DESSUS et DESSOUS.
/!\ submission_off_top / _bottom NE SONT PAS REMPLACEES. Elles restent la
reference et le moteur gele continue de les lire — rien ne casse. Les huit
familles brodent autour.

## TROIS FORMES, ET PAS DE PLANCHER
    lutteur     45 %  ecart [-30,-14]  aucune arme        (Usman, Gane)
    specialiste 40 %  ecart [-14,+2]   une pointe         (Chimaev, Allen)
    complet     15 %  ecart [-4,+4]    les quatre         (Oliveira, Moreno)
/!\ MON IDEE D'UN PLANCHER "AU MOINS MOYEN PARTOUT" ETAIT FAUSSE. Usman la
casse. Un lutteur peut etre bas dans les QUATRE familles et rester dominant
— c'est meme la norme au niveau international.
/!\ ET L'ECART DU LUTTEUR A DU ETRE CREUSE APRES MESURE : a [-22,-8], un
lutteur d'elite ressortait a 77 en cle de bras, donc au-dessus du seuil,
donc il chassait la cle de bras. A [-30,-14] il retombe a 55-71.

## SEUIL_ARME = 72 — ON NE CHASSE PAS CE QU'ON NE SAIT PAS FINIR
Sans lui, un lutteur a 55 partout partait chercher des cles de jambes parce
que 59 depassait 57 : du BRUIT PROMU EN INTENTION. En dessous du seuil, la
position ne vaut que ce qu'on peut y taper.

## LA VALEUR D'UNE POSITION DEPEND DE CELUI QUI Y EST
Demande de Mael : "un gars bon en rear naked va chercher le dos, un bon en
armbar la side ou le mount, le bon en darce le north-south, le bon en GnP la
side ou le mount en priorite mais peut deja taper dans toutes les autres."
    valeurPosition = max(meilleure famille x 1,25 , ground_striking ajuste)
/!\ LA SOUMISSION PESE 1,25 FOIS LE COUP : elle FINIT, le coup ne fait
qu'abimer. Sans ce coefficient, un homme a 99 de ground striking preferait
toujours le mount, meme avec un etranglement arriere a 95 — et plus
personne n'allait chercher le dos.
/!\ ET LE FRAPPEUR N'A PAS BESOIN DE LA POSITION PARFAITE : il tape en
demi-garde, moins bien mais il tape (x0,55 hors positions dominantes). Le
soumetteur ne vaut rien tant qu'il n'a pas SA position. Difference de
nature, pas reglage.

## RESULTAT SUR LES HUIT SOMMETS
    Aslanov (Chimaev) specialiste dos       -> cherche BACK CONTROL
    Ferrer  (Topuria) specialiste bras      -> cherche MOUNT
    Cortes  (Moreno)  complet tete_bras     -> cherche BACK CONTROL
    Adebayo (Usman)   lutteur, aucune arme  -> cherche MOUNT, pour TAPER
    Vanel, Bastos, Whitlock, Rourke : lutteurs -> mount / latéral
/!\ LES FORMES DES ETOILES SONT DICTEES, PAS TIREES. Le hasard donnait a
Aslanov une pointe en cle de bras — faux pour le personnage.

## RESTE : BRANCHER, ET C'EST LA QUE LE GEL S'OUVRE
tenter_progression (ground_v2) vise aujourd'hui le plus gros saut de valeur,
sans se demander POUR QUOI FAIRE. Il devra appeler preferences(). Et le
tirage fixe progress/gnp/sub_top (24/50/26) devra ecouter le profil : un
grappler cherche a passer, un frappeur cherche a taper.


===========================================================================
# CHANTIER I — LE GRAPPLING ENTIER : QUATRE VERROUS, UN SEUL MOTEUR
===========================================================================
NON COMMENCE. Tout est diagnostique et mesure, rien n'est code cote moteur.
js/grappling.js (banc 16) a pose la MATIERE — les quatre etages, les quatre
familles de soumission, ce que chacun VEUT chercher. Il reste a brancher, et
c'est la que le gel s'ouvre.
/!\ LES QUATRE VERROUS SONT LIES. Ouvrir le tirage sans toucher au tempo
donnerait des intentions justes dans des sequences trop courtes pour
compter. Mesurer entre chaque, mais penser l'ensemble.

## LE CONSTAT DE DEPART (mesure, Aslanov lutte 99 contre Vanel lutte 75)
    takedowns tentes par round      1,94
    takedowns reussis par round     0,79
    passages au sol par round       1,02
    echanges au sol par round       7,0  (~42 s, 14 % du round)
    relevees de l'adversaire        AUTANT QUE DE PASSAGES AU SOL
    tentatives de soumission        1,21/round, 3,4 % de reussite
    resultat                        Vanel gagne 64 % / 36 %
Un lutteur d'elite face a un homme qui lutte 24 points en dessous ne garde
personne, ne progresse jamais, ne finit rien.

## VERROU 1 — LE TIRAGE D'ACTION AU SOL EST FIXE
engine.js l.633 : alea.choices(["progress","gnp","sub_top"], [0.24,0.50,0.26])
Ni les stats ni le profil n'y entrent. Consequences mesurees :
  - 0,79 tentative de progression par sequence, et il en faut TROIS pour
    aller de la garde au dos. Il n'y arrive JAMAIS.
  - Usman perd un quart de ses actions a chercher des soumissions qu'il ne
    sait pas finir (familles a 62-70, seuil d'arme 72).
A FAIRE : deduire les poids du profil, via grappling.js.
    Usman        progresser 30 · taper 65 · soumettre  5
    Chimaev      progresser 45 · taper 25 · soumettre 30
    Pimblett     progresser 25 · taper 15 · soumettre 60
/!\ ET AJOUTER UNE QUATRIEME INTENTION : TENIR.
MERAB DALISHVILI — il plaque, il ne passe pas la garde, il ne cherche ni la
soumission ni le KO. Il contrôle et se releve avec l'autre. Nos trois
options sont TOUTES offensives ; il manque "ne rien tenter, garder la
position, laisser le temps passer". C'est une decision reelle de combat, et
c'est ce qui gagne des rounds sans rien produire.
Difference avec Usman : Usman veut le mount POUR TAPER. Merab ne veut pas de
position, il veut DU TEMPS.

## VERROU 2 — LE PLAFOND D'ENTREES EN LUTTE
engine.js l.471 : TAUX = 0.12 / cadence  ->  ~4,7 tentatives/round au max,
quel que soit le niveau.
/!\ NUANCE MESUREE : Aslanov n'y touche meme pas (1,94/round) — ce qui le
limite, c'est son gameplan a 0,52, pas le plafond. Le plafond mord surtout
quand le joueur POUSSE (bouton "Lutter" : 2,68/round a gameplan 1.0).
A FAIRE : faire dependre le plafond du CARDIO et du niveau de lutte.
MERAB : vingt entrees dans un combat, peu reussies, sans importance — il use.
C'est possible PARCE QU'IL NE FATIGUE PAS. Chez nous le cardio ne fait que
freiner la chute ; chez lui il AUTORISE LE VOLUME. C'est le plus profond des
trois points Merab.

## VERROU 3 — LA RETENUE APRES ECHEC EST UNIVERSELLE
engine.js retenue_lutte() : 1 / (1 + td_echecs * lucidite)
C'est le modele du gars qui DOUTE. Merab est l'inverse : il retente aussitot,
et c'est justement ce qui use l'autre.
A FAIRE : une RESISTANCE A L'ECHEC selon le profil. La penalite ne doit pas
etre la meme pour tout le monde.
/!\ C'est aussi la ou mental.discipline (stat morte, chantier F) trouverait
sa place : tenir le plan malgre les echecs.

## VERROU 4 — ON NE GARDE PERSONNE
ground_v2 tenter_evasion : chance = 52 + (skill - controle)*1,1
                                  + (retention - 50)*0,3 - difficulte*0,8
/!\ LA BASE EST 52 : a controle egal, on se separe UNE FOIS SUR DEUX a
chaque echange. Personne ne controle jamais rien, meme a niveau egal.
Contre un controle a 99, Vanel (sol 75) sort encore a 30 % en garde fermee,
25 % en demi-garde. Seuls le dos (2 %) et le mount (7 %) tiennent — mais il
faut y arriver, et il se releve avant.
CUMUL : a 30 % par tentative, il tient 34 % du temps sur 3 echanges, 3 % sur
10. UN ROUND COMPLET AU SOL EST MATHEMATIQUEMENT IMPOSSIBLE.

## /!\ ET LA VRAIE TROUVAILLE : CE N'EST PEUT-ETRE PAS LE POURCENTAGE,
## C'EST LE NOMBRE DE TIRAGES PAR MINUTE (intuition de Mael)
Un echange au sol dure ~5,7 s (T_SOL_BASE 4,5 + valeur x 1,2). Celui du
dessous obtient donc DIX tentatives de relevee par minute. Dans un vrai
combat il en obtient UNE OU DEUX.
    T_SOL_BASE  s/echange  tirages/min  sol/round
          4,5      5,7        10,5        17 s
            8      9,2         6,5        27 s
           12     13,2         4,5        39 s
           20     21,2         2,8        63 s
Ralentir le tempo augmente le TEMPS de controle sans toucher a l'equilibre
des forces : le rapport entre un bon et un mauvais grappler reste le meme,
il s'exprime sur la bonne echelle de temps.
/!\ ET IL NE FAUT PAS "DENSIFIER" POUR COMPENSER. J'ai propose d'ajouter des
actions dans les echanges longs ; Mael a corrige : "une minute et 2 ou 3
actions parait vide mais c'est la realite du sol". VRAI. Le combat au sol
DOIT paraitre moins agite que le debout — difference de nature, pas defaut
de rendu. C'est meme pour ca que le sol emmerde le public.
CONSEQUENCE A ACCEPTER : le nombre d'actions par sequence NE CHANGE PAS
(esperance 1/p = 3,3 echanges). On gagne du temps de controle, donc des
points, PAS des finitions. Un lutteur de controle gagne aux points ; c'est
la PROGRESSION (verrou 1) qui donne les finitions, pas le tempo.
/!\ COTE ECRAN : une minute avec trois lignes de log peut faire croire a un
plantage. Le traducteur devra poser des ETATS ("controle en demi-garde",
"il travaille pour se degager") et pas seulement des evenements. Le moteur
reste honnete, l'ecran raconte l'attente.

## CE QUE COUTE CE CHANTIER
Reouverture du gel sur engine.py/js ET ground_v2.py/js. Et surtout :
RECALIBRAGE COMPLET ASSUME. Plus de temps au sol -> plus de GnP et de
soumissions -> la repartition KO/TKO/SUB/DEC se deplace. Ce n'est pas un
garde-fou vert qu'on vise, c'est un nouveau point d'equilibre.
/!\ GARDE-FOU ELARGI OBLIGATOIRE : les NEUF divisions, pas une seule.
(Lecon du 09/08 : un A/B limite au welter donnait 100 % identiques alors
que la mesure globale montrait +1,3 point de soumissions.)

## /!\ ET LE CONSTAT DE FOND, QUI EXPLIQUE TOUT LE RESTE (Mael)
"On a voulu faire les stats reelles en delaissant tout le reste, alors qu'en
bossant mieux on s'en serait approche sans avoir ce genre de merde."
EXACT. On a calibre la SORTIE (46 % de decisions, 20 % de soumissions) et
laisse le CHEMIN faire n'importe quoi. Le moteur produit les bons chiffres
pour de MAUVAISES RAISONS : les 20 % de soumissions ne viennent pas de
lutteurs qui controlent, mais de sequences hachees ou personne ne tient
personne. Le chiffre est juste, la scene est fausse.
Meme faute que le scoring 10-8 a 85 % et que les 63 % contre la grille :
UN AGREGAT CORRECT POSE SUR UNE MECANIQUE QUI NE L'ETAIT PAS.
REGLE : calibrer une distribution sans verifier les trajets qui la
produisent, c'est ajuster un thermometre au lieu de soigner le malade.
=> ON REPARE LES MECANIQUES D'ABORD, ON RECALIBRE ENSUITE. Et il faut
accepter que la distribution soit provisoirement fausse pendant les travaux.

## /!\ REPERE CHIFFRE AVANT TRAVAUX — CE SONT LES CHIFFRES A BATTRE
Fige le 09/08, 500 combats par duel, avant d'ouvrir le moindre verrou.
Toute modification du grappling se juge CONTRE CETTE TABLE.

    Vanel (frappeur 93/75/75)  contre  Aslanov (lutteur 76/99/94, spé dos)
      Vanel 93 %  ·  Aslanov 7 %     DEC 46 · TKO 32 · KO 16 · SUB 6
      par round : 1,98 TD tentés · 0,59 réussis · 0,80 passage au sol
      au sol    : 2,8 échanges · 2,38 relevées · 0,37 progression · 2,04 GnP
      soumissions : 1,04 tentée/round · 31 réussies sur 500 combats

    Vanel  contre  Cortés (grappler complet 81/92/97)
      Vanel 60 %  ·  Cortés 40 %     DEC 74 · SUB 14 · TKO 7 · KO 5
      par round : 1,60 TD tentés · 0,58 réussis · 0,83 passage au sol
      au sol    : 2,9 échanges · 1,93 relevée · 0,37 progression · 1,91 GnP
      soumissions : 1,01 tentée/round · 69 réussies sur 500 combats

/!\ 0,37 PROGRESSION PAR ROUND. Il en faut TROIS pour aller de la garde au
dos. Un spécialiste du dos met en moyenne huit rounds a gagner UNE position
— il n'atteint donc JAMAIS son arme. C'est le chiffre le plus parlant du
diagnostic.
/!\ Le grappler COMPLET s'en sort deux fois mieux (40 % contre 7 %) parce
qu'il peut finir de n'importe ou, y compris depuis le dessous. Le modele des
familles est donc deja coherent : c'est l'acces aux positions qui manque.
/!\ Le 64-36 dont Mael se souvenait datait d'AVANT les cibles de stats des
etoiles. Depuis, Aslanov est a 76 en frappe et Vanel a 93 : l'ecart s'est
creuse. Ne pas comparer a l'ancienne mesure.

## DEUX IMPRESSIONS DE MAEL, VERIFIEES — L'UNE FAUSSE, L'AUTRE MAL SITUEE
"Jamais un combattant n'est cuit" — FAUX sur le moteur : sur 675 combats
toutes divisions, 29,6 % des combattants finissent SOUS 20 de cardio, 37,9 %
sous 35, le minimum est 0. Sur l'affiche de la demo : 59 sur 200 sous 20.
/!\ IL NE LE VOIT PAS PARCE QUE L'ECRAN NE LE MONTRE PAS. Le gabarit porte
encore un PLACEHOLDER : l'essence descend PAREIL des deux cotes et ne lit
pas le cardio reel. A BRANCHER — c'est de l'affichage, pas du moteur.

"Jamais de KO ou de soumission au round 1" — vrai sur SON affiche, faux sur
le moteur :
    toutes divisions : 21,9 % de finitions au round 1  (reel UFC ~20 %)
    Okonkwo/Renaud   :  7,0 %  — trois fois moins
/!\ LEÇON DE METHODE, POUR NOUS DEUX : Mael teste toujours LA MEME AFFICHE,
donc il observe une seule fenetre du moteur ; je mesure sur des rosters
generes, donc je ne vois jamais ce que LUI voit. On regardait deux choses
differentes en croyant parler de la meme.
=> LA DEMO DEVRAIT PROPOSER DEUX OU TROIS AFFICHES de gabarits differents
(un lourd, un mouche) pour que ce qu'il voit soit representatif.

## /!\ ET L'AFFICHE DE LA DEMO EST DESEQUILIBREE
Okonkwo gagne 77 fois sur 100 contre Renaud. Le joueur gagne donc presque a
tous les coups, et ses consignes de coin ne changent pas grand-chose au
resultat. Pour tester le jeu il faudrait une affiche a 55-45.

## CHANTIER I, VERROU 1 — ETAPE 1 FAITE : LES INTENTIONS, HORS DU GELE
grappling.js expose intentions(fighter, position) -> {progress, gnp, sub,
tenir}, somme 1. Le moteur n'est PAS encore modifie : on pose le calcul, on
le mesure seul, on branchera ensuite. Methode apprise le matin meme —
mesurer avant d'ouvrir, et se demander si on peut eviter d'ouvrir.

MESURE, les quatre poids par profil et par position :
                       depuis la demi-garde        depuis le mount
    Adebayo (Usman)    prog 51 gnp 29 sub  1 ten 19  |  19/56/ 3/22
    Aslanov (Chimaev)  prog 19 gnp 26 sub 38 ten 17  |  17/37/30/15
    Cortés  (Moreno)   prog 14 gnp 22 sub 48 ten 16  |  14/33/38/15
    Vanel   (Gane)     prog 57 gnp 30 sub  1 ten 12  |  19/61/ 4/16
    (tirage actuel du moteur, pour tous : 24 / 50 / 26 / 0)
Usman ne cherche JAMAIS la soumission (1-3 %) et tape a 56 % depuis le
mount. Chimaev et Moreno soumettent trois a quarante fois plus.

## /!\ UN SPECIALISTE PASSE, IL NE SE CONTENTE PAS
Premiere version : Aslanov restait en demi-garde a tenter des etranglements
tete-bras a 42 %, parce qu'il y avait une arme "suffisante" sur place. Faux
pour le personnage — un specialiste du dos VA AU DOS.
Corrige : `sub *= 1 - min(0,65 ; gain / 35)`. Plus la position d'a cote
vaut mieux, moins il tente ici.

## L'INTENTION "TENIR" (le cas Merab)
Elle vaut 10 a 22 % selon les profils, et elle n'est jamais nulle. C'est le
residu de celui qui ne veut RIEN tenter : garder la position, laisser le
temps passer. Aucune des trois options du moteur ne l'exprimait.

## GARDE-FOU DE REPLI
Sans profil de grappling, intentions() rend EXACTEMENT 24/50/26 — le tirage
historique. Un combattant non equipe se comporte donc comme aujourd'hui, et
le branchement pourra se faire progressivement.

## RESTE POUR LE VERROU 1
Etape 3 : ouvrir engine.py et engine.js pour remplacer alea.choices fixe par
ces poids, et AJOUTER la branche "tenir". Etape 4 : remesurer les deux duels
de reference et les neuf divisions.
/!\ AUCUN GARDE-FOU VERT NE SERA POSSIBLE : le tirage consomme du hasard, le
modifier change tous les combats. On jugera sur la TABLE DE REPERE, pas sur
l'ancien calibrage.

## /!\ VERROU 5 — DEFENDRE UN TAKEDOWN NE COUTE RIEN (trouve le 09/08)
Test demande par Mael : fabriquer un MERAB — cardio 99, lutte 92+, sol <= 74,
aucune soumission, allure 1,2 — et le faire combattre dix fois contre un
frappeur (Rourke, coq).
RESULTAT : MERAB PERD 10 FOIS SUR 10. Et le detail est accablant :
     1. Rourke  decision R3 | TD 0/8  | cardio fin  Merab 15  Rourke 74
     5. Rourke  decision R3 | TD 1/13 | cardio fin  Merab 15  Rourke 79
     9. Rourke  TKO      R2 | TD 5/9  | cardio fin  Merab  0  Rourke 63
LE COMBATTANT A CARDIO 99 FINIT A 15. LE FRAPPEUR QUI SE DEFEND FINIT A 74.
Celui dont le cardio est l'arme se vide ; sa victime reste fraiche.

CAUSE, verifiee dans engine.js :
    atk.depenser(info.cout, "lutte");          // il tente  -> 3 a 6 points
    atk.depenser(info.cout * 1.5, "lutte");    // il rate   -> 1,5 fois plus
    le defenseur : AUCUN APPEL A depenser DANS tenter_takedown
Sprawl gratuit. Lutte contre la grille gratuite. Se relever gratuit. Seul
l'attaquant paie, et il paie double quand il rate.
Or repousser un lutteur EPUISE AUTANT QUE D'ENTRER — c'est meme ce qui casse
les gens au troisieme round.

/!\ CONSEQUENCE DE CONCEPTION, ET ELLE EST GRAVE : la strategie "user
l'adversaire" que Mael demandait (chantier E) est STRUCTURELLEMENT
IMPOSSIBLE. User quelqu'un coute cher a celui qui use, et RIEN a celui qui
subit. L'archetype Merab ne peut pas exister dans ce moteur.

A FAIRE : faire payer la DEFENSE. Sprawl, whizzer, relevee, lutte contre la
grille — chacun a un cout, module par le niveau (un bon defenseur depense
moins, il ne depense pas zero). Et le cout de l'attaquant qui rate est
peut-etre trop lourd : 1,5x semble beaucoup quand l'autre paie zero.
/!\ CE VERROU CHANGE L'EQUILIBRE FRAPPEUR/LUTTEUR PLUS QUE TOUS LES AUTRES.
Aujourd'hui le frappeur gagne parce que se defendre est gratuit. A mesurer
en premier, avant meme le tirage d'action.

## NOTE : LE VOLUME EST DEJA LA
Merab tente jusqu'a 13 takedowns par combat (4 a 13 selon les graines) et en
reussit 1. Le plafond TAUX n'est donc PAS ce qui l'empeche d'exister — c'est
la FACTURE qui est mal repartie. Nuance importante pour l'ordre des travaux.

## VERROU 5 — FAIT, MAIS INSUFFISANT SEUL (mesure honnete)
    engine.py / engine.js : le DEFENSEUR paie desormais
      dfn.depenser(info.cout * COUT_DEFENSE_TD * (1,35 − sprawl/145))
      COUT_DEFENSE_TD = 0,85 · un excellent sprawl paie ~0,7x, un mauvais ~1,15x
    et le surcout de l'attaquant qui rate passe de 1,5 a 1,25 (SURCOUT_TD_RATE)
      — 1,5 avait ete pose quand le defenseur payait ZERO : desequilibre
      assume par erreur, pas par choix.
Garde-fou elargi, 9 divisions : 324 combats, 279 modifies, 31 vainqueurs
changes. Le calibrage a bouge, c'etait prevu.

## /!\ ET LE RESULTAT NE SUFFIT PAS : MERAB PASSE DE 0/10 A 1/10
Table de repere : Vanel/Aslanov reste a 93/7. Vanel/Cortés 60/40 -> 58/42.
La correction est juste dans son principe, elle ne change presque rien.

## /!\ MON TEST ETAIT BIAISE — A NE PAS REFAIRE
J'opposais Merab a Rourke, une ETOILE dont la cible de lutte est 88 : sprawl
98, whizzer 98. Ce n'etait pas un lutteur contre un frappeur, c'etaient DEUX
LUTTEURS. Refait contre un vrai frappeur (sprawl 70) : toujours 1/10.

## /!\ ET LA VRAIE CAUSE, LUE DANS LES COMPTEURS DE DEPENSE
Le moteur trace les depenses par poste. Sur 20 combats :
    Merab depense 145 : sol_dessous 26 % · encaisse_corps 26 % ·
                        striking 17 % · LUTTE 15 %
    Frappeur depense 94 : striking 50 % · lutte 13 %
LA LUTTE N'EST QUE 15 % DE SA DEPENSE. Il ne se vide pas en luttant — il se
vide parce qu'il ENCAISSE en entrant, et parce qu'il passe son temps EN
DESSOUS (sol_dessous coute 1,2 contre 0,8 au-dessus).
=> Le verrou 5 n'etait pas le principal. LE VERROU 4 (on ne garde personne)
   est la vraie clef : amener au sol pour se faire relever aussitot, c'est
   payer 5 a 11 de cardio pour six secondes de controle. Bien sur qu'il se
   vide.
ORDRE REVISE : verrou 4 (tenir) AVANT le verrou 1 (intentions). Les
intentions ne serviront a rien tant que les sequences durent 3 echanges.

## /!\ BUG LATENT REVELE PAR LA BASCULE : UNE FINITION APRES LA CLOCHE
Le banc 9 est tombe : une finition datee a 304 s dans un round de 300.
CAUSE : la boucle du round est `while (t < duree)` et le temps de l'echange
s'ajoute APRES le test — le dernier echange peut deborder. Latent depuis
toujours, revele parce que le verrou 5 a decale le flux de hasard.
CORRIGE DANS LA COUCHE DE LECTURE (verdict.js), pas dans le moteur gele : on
ramene a la cloche plutot que d'afficher une heure impossible.
/!\ verdict.js est VOLONTAIREMENT SANS require (pour etre embarque tel quel
dans le bundle). La duree du round y est donc DUPLIQUEE en DUREE_ROUND_S.
Si elle change dans engine, elle doit changer ici.

## /!\ CHANTIER J — LE VOLUME DE FRAPPES ET LES LOW KICKS (trouve le 09/08)
NON COMMENCE. Trouve en cherchant pourquoi le lutteur se vide : sa premiere
depense est "encaisse_corps" (29 %), pas la lutte (17 %).
Chaine de mesures :
  Aslanov encaisse 49,7 coups au corps par combat, 19,2 par round, jusqu'a
  117 dans les pires cas. 147 points de degats cumules. 33 de cardio perdu.
  MAIS : 0 arret sur le corps sur 300 combats, et 0,7 de cardio PAR COUP.
  => ce n'est pas la puissance qui le vide, c'est l'ACCUMULATION.
Alors on est remonte au volume general, 405 combats sur 9 divisions :
    touchees par minute (les deux)  16,4   reel ~13        +26 %
    precision                        51 %   reel 45-50 %    correct
    tete                             54 %   reel ~68 %      trop peu
    corps                            18 %   reel ~19 %      JUSTE
    jambe                            28 %   reel ~13 %      DEUX FOIS TROP
/!\ LE CORPS N'EST PAS COUPABLE : sa PROPORTION est juste. Ce sont LES LOW
KICKS qui debordent — 28 % au lieu de 13 %. Comme les jambes touchent
presque toujours, elles gonflent le volume et le font paraitre excessif.
=> MEME SIGNATURE QUE TOUT LE RESTE : le total est plausible, la COMPOSITION
ne l'est pas. 16,4 au lieu de 13 passerait inapercu ; les 28 % de jambes,
non.
C'est un chantier de STRIKING, pas de grappling. Il rejoint le chantier D
(distance, footwork, geometrie). A ouvrir apres le sol.

## VERROUS 4 ET 1 — FAITS. ETAT DU CHANTIER I
### verrou 4 : LE TEMPO SEUL EMPIRE TOUT (mesure, a ne pas refaire)
Premiere tentative : T_SOL_BASE 4,5 -> 12, sans toucher au taux de sortie.
RESULTAT : Aslanov 7 % -> 6 %, soumissions 31/400 -> 18/400. PIRE.
POURQUOI : la relevee se tire PAR ECHANGE, pas par minute. Allonger les
echanges ne change PAS le nombre de tirages avant la sortie (~3,3) — ca rend
seulement le sol plus lent ET MOINS PRODUCTIF (7,0 echanges/round -> 2,0).
=> IL FAUT BAISSER LE TAUX DE SORTIE EN MEME TEMPS.
COUPLE RETENU, apres simulation analytique : base 52 -> 34, T_SOL_BASE 4,5
-> 9. Sequences de ~50 s contenant 5 actions, contre 3,3 actions en 20 s.

### verrou 1 : les intentions branchees dans LES DEUX MOTEURS
poids_action_sol(top, position) est DUPLIQUEE A L'IDENTIQUE dans engine.py
et engine.js — elle ne peut pas vivre dans grappling.js, le moteur JS devant
rester conforme au temoin Python au caractere pres.
/!\ SANS PROFIL DE GRAPPLING, ELLE REND EXACTEMENT 24/50/26 : un combattant
non equipe se comporte comme avant, et les bancs restent verts.
QUATRIEME INTENTION AJOUTEE : "tenir" — garder la position, ne rien tenter.
Elle sort 0,56 a 0,67 fois par round.

### TABLE DE REPERE, progression du chantier
    duel                    depart   verrou5   verrou4   verrou1
    Vanel c. Aslanov         93/7     93/7      87/13     85/15
    Vanel c. Cortés          60/40    58/42     50/50     53/47
    soumissions Aslanov      31/400   —         29/400    48/400
    soumissions Cortés       69/400   —         92/400    93/400
Le grappler COMPLET est passe de 40 % a ~47-50 %. Le specialiste du dos
gagne 8 points et SES SOUMISSIONS ONT PRESQUE DOUBLE.
/!\ MAIS LA PROGRESSION N'A PAS BOUGE : 0,37 -> 0,34 par round. Il lui faut
toujours TROIS progressions pour atteindre le dos, et il ne les obtient pas.
C'EST LE PROBLEME SUIVANT, et il n'est pas dans le tirage : il est dans
tenter_progression elle-meme, ou dans le fait qu'une sequence de 5 actions
ne suffit pas a enchainer trois passages.

### CALIBRAGE — IL A BOUGE, C'ETAIT PREVU
    DEC 47,6 -> 50,4 · SUB 20,8 -> 21,3 · TKO 19,4 -> 17,6 · KO 10,9 -> 9,3
Plus de decisions, moins de TKO. Coherent : le sol garde plus longtemps,
donc moins de temps debout, donc moins d'arrets.
/!\ NE PAS "CORRIGER" CE DEPLACEMENT. On repare les mecaniques d'abord, on
recalibre a la fin — c'est la regle posee ce matin. La ligne de reference de
mesure.js a ete mise a jour dans le meme geste.

## /!\ LES DEUX PORTES VERS LE DOS — LA VRAIE CAUSE (remarque de Mael)
"Ca me semble exagere qu'il atteigne jamais le dos, mais il commence
toujours dans la meme position au sol ? Le takedown pourrait l'amener
directement proche du dos ou dans le dos suivant le TD."
VERIFIE, ET IL AVAIT RAISON. Les cinq entrees arrivaient toutes en garde,
demi-garde ou lateral :
    double_leg -> closed_guard · single_leg/body_lock/trip -> half_guard
    throw -> side_control
AUCUNE ne menait au dos ni en tortue. Le seul chemin etait TROIS
progressions depuis la garde, et on en mesurait 0,34 par round.
Or un body lock pris de dos met dans le dos, un snap down met en tortue
d'ou l'on prend le dos. Chimaev fait exactement ca — et il le fait aussi
DEBOUT depuis le clinch (Usman-Chimaev, Oliveira-Chandler).

DEUX ENTREES AJOUTEES, dans les deux moteurs :
    back_take  clinch_wrestling contre whizzer -> back_control  exige_dos 75
    snap_down  grip_fighting contre balance    -> turtle        exige_dos 62
/!\ RESERVEES : c'est LA LUTTE qui ouvre la porte et le back_top qui decide
s'il la garde. Un lutteur d'elite au dos moyen y arrive et se fait
decrocher ; un specialiste du dos a la lutte moyenne n'y arrive jamais.
Chimaev a les deux, et c'est ce qui le rend infernal.

## /!\ TROIS VERSIONS RATEES POUR LE CHOIX DE L'ENTREE — LEÇON GENERALE
  1. ecart de niveau BRUT : le double leg gagnait TOUJOURS. Les portes
     etaient dans la table et JAMAIS empruntees. Ajouter une option ne
     suffit pas si le choix ne la regarde pas.
  2. ponderation par la valeur ABSOLUE de la position : Aslanov est bon
     partout, toutes les positions lui valaient 118 a 124 — l'ecart etait
     NOYE dans l'absolu.
  3. RETENUE : normalisation SUR L'EVENTAIL DISPONIBLE. Ce qui compte n'est
     pas combien la position vaut, c'est DE COMBIEN elle vaut mieux QUE LES
     AUTRES, pour lui.
        v *= 0,55 + 0,9 * (val − vmin) / (vmax − vmin + 1)

## RESULTAT — LE PLUS GROS SAUT DE TOUT LE CHANTIER
    duel                depart  v5     v4     v1     portes du dos
    Vanel c. Aslanov     93/7   93/7   87/13  85/15  70/30
    soumissions Aslanov  31/400  —     29/400 48/400 115/400
    mentions du dos/round  —      —      —    0,02   1,97
    entree choisie         —      —      —  double_leg  back_take (419)
Cortés ne bouge pas (53/47) : il finit de partout, il n'a pas besoin du dos.
Coherent.

## CALIBRAGE APRES LES QUATRE INTERVENTIONS
    DEC 47,6 -> 49,8 · SUB 20,8 -> 23,4 · TKO 19,4 -> 16,7 · KO 10,9 -> 8,7
Plus de soumissions, moins d'arrets debout. Coherent avec un sol qui
fonctionne enfin. NE PAS CORRIGER — recalibrage a la fin.

## /!\ QUATRIEME replace SILENCIEUX DE LA JOURNEE
La ligne disait `-Infinity` et pas `-1e9` : le remplacement n'a pas pris, et
le code a plante a l'execution (dispo is not defined). Corrige AVEC une
assertion apres coup.
REGLE, a appliquer systematiquement : tout remplacement de chaine doit etre
suivi d'une verification que la modification a PRIS. Quatre fois aujourd'hui.

## LE CLINCH MENE ENFIN AU DOS, ET LE DOS DEBOUT EXISTE
Demande de Mael : "la lutte doit le permettre, Chimaev est tres bon pour
lutter et finir dans le dos, et aussi clincher dans le dos". Puis : le dos
debout oui, "mais tres rare — Oliveira le fait, Shavkat aussi, Jones".

### /!\ LE TAKEDOWN DE CLINCH ATTERRISSAIT TOUJOURS EN DEMI-GARDE
Meme quand le controleur avait DEJA LE DOS (back_clinch existait comme
prise !). Chimaev prenait le dos au corps a corps, faisait tomber, et se
retrouvait en demi-garde : SON TRAVAIL ETAIT EFFACE A L'ATTERRISSAGE.
clinch_sequence rend desormais la PRISE avec l'issue, et le moteur atterrit
en back_control si c'etait un back_clinch.
/!\ CHANGER L'ARITE D'UN RETOUR TOUCHE TOUS LES POINTS DE SORTIE : sept en
JS, six en Python, plus les generateurs de reference et deux bancs. Fait en
trois passes parce que j'en oubliais a chaque fois. A anticiper.

### LE DOS DEBOUT — UNE TRANSITION, PAS UNE PHASE
back_choke_debout, ajoute aux options de back_clinch. Il NE DURE PAS : soit
il l'emmene au sol dans le dos, soit l'autre se degage. C'est exactement ce
qu'on voit chez Oliveira ou Chimaev — on prend le dos sur les pieds, on
serre, et ca finit au sol ou ca casse. Modeliser une PHASE debout aurait ete
beaucoup plus lourd pour un resultat moins juste.
MESURE, 675 combats sur 9 divisions :
    prise de dos au clinch atteinte  68 fois
    dos debout tente                  4
    dos debout REUSSI                 2   -> 0,3 % des combats
Rare mais reel, et pas du code mort. Bon ordre de grandeur.

### /!\ LE BANC 12 A ATTRAPE LE DEFAUT IMMEDIATEMENT
"TD 0/1" : le dos debout credite un takedown mais sa ligne de log ne
ressemble a aucune autre ("X saute dans le dos et serre debout !"). La
feuille de stats ne le comptait pas. Ajoute.
LEÇON : toute mecanique qui incremente un compteur du moteur doit etre
apprise a feuille.js dans le MEME geste.

### CALIBRAGE FINAL DU CHANTIER I
    DEC 47,6 -> 48,8 · SUB 20,8 -> 23,8 · TKO 19,4 -> 16,9 · KO 10,9 -> 9,0
Les soumissions ont pris 3 points, les arrets debout en ont perdu 2,5.
C'est la signature d'un sol qui fonctionne. NE PAS CORRIGER : recalibrage
global a la fin, quand les mecaniques seront toutes reparees.

## /!\ LE CHANTIER J DEPEND DU CHANTIER D — NE PAS LE FAIRE SEUL
Mesure complementaire du 09/08 : les 28 % de jambes ne sont PAS uniformes.
Par division, c'est plat (25 a 29 % partout). Par ARCHETYPE, c'est
tres contraste :
    kickboxeur_distance   38 %
    grappler_soumission   32 %
    polyvalent            30 %
    lutteur_controle      25 %
    brawler               13 %
    boxeur_pressure        8 %
Les boxeurs sont JUSTES — 8 et 13 %, ces gens-la ne kickent pas. Le probleme
est que LES PROFILS NON-FRAPPEURS FRAPPENT COMME DES KICKBOXEURS : un
grappler de soumission a 32 % de low kicks, un lutteur de controle 25 %.

/!\ ET LA CAUSE EST GEOMETRIQUE, PAS UNE PONDERATION (remarque de Mael).
Sans distance, le moteur ne peut pas savoir qu'un low kick se place quand on
est trop loin pour le poing et trop pres pour reculer : c'est une arme de
GESTION D'ESPACE. Il est aujourd'hui disponible a chaque echange, au meme
prix que le jab.
Et surtout LE RISQUE MANQUE : le vrai danger du low kick est de SE FAIRE
ATTRAPER LA JAMBE. Le moteur a le `check` (la jambe qui bloque) mais PAS la
saisie. Kicker est donc presque gratuit — d'ou 32 % chez un homme qui
devrait chercher le corps a corps.

=> CORRIGER J EN PONDERANT LE CHOIX DE L'ARME PAR ARCHETYPE SERAIT PLAQUER
   UN CORRECTIF SUR UN SYMPTOME. Exactement l'erreur nommee le matin meme :
   un agregat correct pose sur une mecanique qui ne l'est pas.
ORDRE : D d'abord (angle, consequence d'un rate de coupe, puis distance
metrique). C'est la que le low kick trouve sa CONDITION D'EMPLOI et son
RISQUE. J ensuite — et il sera peut-etre resolu en grande partie tout seul :
si le kick devient une arme de distance avec un risque de saisie, les 32 %
du grappler tombent sans qu'on touche a une seule ponderation.
A AJOUTER AU CHANTIER D : la saisie de jambe apres un low kick rate ou
prevu, qui doit pouvoir mener au takedown.

## LE COUP D'ENTRETIEN — L'ARBITRE COUPAIT 40 % DES SEQUENCES
Diagnostic : on compte ce qui met fin a une sequence au sol (679 sequences).
    arbitre        40 %      relevee   35 %
    fin du round   14 %      soumission 11 %
L'ARBITRE ETAIT LE PREMIER MOTIF, devant l'adversaire lui-meme. On avait
ralenti le tempo et durci la sortie : les sequences duraient, donc la regle
d'inactivite mordait. Elle CONTREDISAIT meme l'intention "tenir" ajoutee
pour Merab — on lui donnait le droit de ne rien tenter, et l'arbitre le
punissait aussitot.

### /!\ LA SOLUTION VIENT DE MAEL, ET ELLE DONNE ENFIN UN EMPLOI AU FIGHT IQ
"Un bon fight IQ met des petits coups meme sans puissance pour pas se faire
relever ; un moyen gere ca assez bien ; un faible gere pas du tout."
Le mecanisme existait DEJA A MOITIE : 3 points de degats suffisent a
remettre le compteur d'inactivite a zero (`rienNeBouge` exige un delta de
degats < 3). CE QUI MANQUAIT, C'EST LA DECISION DE LE FAIRE.
Implemente dans poids_action_sol(top, position, stall), les deux moteurs :
    urgence  = stall / SEUIL_RELANCE
    lucidite = (fight_iq − 35) / 55
    b = urgence * lucidite * 0,80  -> reporte vers le ground and pound
MESURE, en faisant varier le seul fight IQ d'Aslanov :
    fight IQ   relances/round   controle/round   GnP/round
        40         0,38             2,60           1,75
        60         0,31             2,77           1,96
        75         0,27             2,85           2,07
        99         0,27             3,20           2,39
Un tiers de relevees en moins, 23 % de controle en plus, 37 % de GnP en plus.
/!\ LES COUPS SONT REELS : ils sortent au log et comptent dans les frappes.
Aucune exception invisible — le moteur les tire vraiment.
/!\ PREMIERE VERSION RATEE : je ne deplacais que l'intention "tenir", qui ne
pese que 15 % — l'effet etait invisible (0,39 contre 0,33). QUAND L'ARBITRE
S'AGITE ON LACHE TOUT : on ne cherche pas une soumission quand on va se
faire relever. Le report vient desormais de TOUTES les intentions.

## /!\ VERROU 6 — RATER UNE ENTREE COUTE LA POSITION (trouve le 09/08)
Test Merab refait apres tout le chantier : TOUJOURS 1/10. Sa premiere
depense est `sol_dessous` : 33 % de son cardio passe EN DESSOUS.
CAUSE : un takedown rate ne rend pas le combat debout.
    double_leg contre 15 % · throw 20 % · back_take 18 % · single_leg 10 %
    body_lock 5 % · trip 5 % · snap_down 8 %
Sur six tentatives par combat, le lutteur a 62 % DE CHANCES DE SE FAIRE
RENVERSER AU MOINS UNE FOIS — et dessous il paie 1,2 de cardio par echange
au lieu de 0,8.
Dans la realite, une entree ratee finit le plus souvent par un SCRAMBLE et
un retour debout. Le renversement franc existe mais il est bien plus rare,
et il demande un vrai grappler en face — pas n'importe qui.
=> L'ARCHETYPE MERAB ECHOUE POUR UNE RAISON QU'ON N'AVAIT PAS ANTICIPEE : ni
le plafond d'entrees, ni la defense gratuite, ni le controle — RATER COUTE
LA POSITION. Un homme qui vit du volume de tentatives se punit lui-meme a
chaque essai.
A FAIRE, quand on ouvrira : le taux de contre doit dependre du GRAPPLING DU
DEFENSEUR, pas etre une constante par technique. Et l'issue par defaut d'une
entree ratee devrait etre le retour debout, pas le renversement.
/!\ Baisser ces taux deplacera encore le calibrage. A ouvrir en connaissance
de cause, apres D.


===========================================================================
# CHANTIER K — POTENTIEL, AXES ET ENTRAINEMENT (conception, 09/08)
===========================================================================
NON COMMENCE. Concu entierement a l'oral avec Mael. GAME-SIDE : la
progression vit dans demo_jeu, PAS dans le moteur gele. Aucune bascule.
/!\ POINT DE DEPART : la question "comment calibrer les niveaux" (1 % =
champion, 7 % = top 50 UFC). Mael a lui-meme ecarte le calibrage par
decret : "ou sinon on laisse le jeu decider, juste les meilleurs montent
dans de meilleures organisations et le tri se fait seul ?"
=> OUI, ET C'EST LA MEME LEÇON QUE TOUTE LA JOURNEE : on repare la
mecanique, la distribution suit. Ne PAS decreter qu'un champion est au
99,5e centile — poser la regle de montee et MESURER ou les gens
atterrissent apres quelques saisons. Si le champion sort au 85e, c'est la
regle de montee qui est molle, pas le chiffre qu'il faut forcer.
/!\ ET DEUX MECANIQUES SONT INDISPENSABLES AU TRI : une organisation qui
DEMARCHE celui qui enchaine, et une qui COUPE ceux qui perdent. Sans les
coupes, le sommet se remplit de gens a 2-8 et le tri ne trie rien.

## /!\ 1 % DE POTENTIEL N'EST PAS 1 % DE NIVEAU ATTEINT
Precision de Mael : le 1 %, c'est avec le materiel maximal, les meilleurs
coachs, aucune blessure. "Ca fera beaucoup beaucoup moins" en pratique.
LE MOTEUR NE MODELISE RIEN DE CA : le generateur produit un NIVEAU ATTEINT,
il n'existe aucun plafond, et il n'y a AUCUNE blessure.

## LE MODELE
    POTENTIEL   cache, defini a la creation, au niveau du DOMAINE.
                C'est un BUDGET DE MOYENNE, pas un plafond par stat : un
                homme a 82 de potentiel peut monter a 95 en lutte s'il reste
                bas ailleurs.
    AXES        la ou il progresse plus vite. Deux hommes de meme potentiel
                n'atteignent PAS le meme niveau selon qu'on a trouve leurs
                axes ou non. Le 1 %, c'est un bon potentiel ET quelqu'un qui
                a su ou le depenser. UN TALENT GACHE FINIT A 80.
    SOUS-AXES   jab, crochet, low kick, mount, side control, passage,
                sprawl... Le joueur PEUT les choisir.
/!\ Le potentiel reste au niveau du DOMAINE, pas de la stat : une centaine
de potentiels individuels serait ingerable pour tout le monde. Le sous-axe
dit seulement OU LE GAIN SE DEPOSE en priorite.

## /!\ LE POTENTIEL EST CACHE, MAIS SA TRACE EST LISIBLE
"C'est cache mais tu devras pouvoir trier la progression par axe pour t'y
retrouver, sur semaine / mois / annee."
Le joueur ne voit jamais le potentiel : il DEDUIT en regardant ou son homme
progresse vite. Il faut donc un HISTORIQUE PAR AXE conserve longtemps.
Aujourd'hui gains7 ne garde que 7 jours et une seule valeur globale.
A PREVOIR : cumul par SEMAINE, tout conserve (520 lignes sur une carriere,
c'est rien), trois vues semaine / mois / annee.
    Bùi — progression sur 12 mois
      striking +8,4 · lutte +2,1 · sol +6,9 · physique +3,2
Il ne sait pas qu'il a un axe en frappe : il le VOIT. Et il comprend que six
mois de lutte ont ete du gachis.
/!\ Il faut que la tendance soit lisible sur un MOIS et nette sur un AN,
sinon le systeme est decoratif.

## /!\ CE N'EST PAS LE GESTE QUI RAYONNE, C'EST LA SEANCE (correction de Mael)
J'allais coder un "halo" autour de chaque sous-axe (travailler le jab tire
le footwork, le timing, le crochet). FAUX.
"Travailler le jab travaille le jab AU SAC. Mais en sparring tu n'uses pas
que le jab meme si tu travailles le jab — tu vas utiliser tout ton striking,
meme un peu de lutte sur certains sparrings."
La repartition du gain depend donc du TYPE DE TRAVAIL, pas du sous-axe :
    sac / paos            tres cible    -> surtout le sous-axe demande
    drilling technique    cible         -> le sous-axe et ses voisins
    sparring leger        large         -> tout le domaine, un peu de lutte
    sparring dur          tres large    -> tout, y compris le non-choisi
    prepa physique        hors technique
Le choix du sous-axe devient une INTENTION, pas une garantie : on ne
s'entraine pas en tranches.

## LES COURS, ET LE CAS PARTICULIER DU MMA
Cours de kick, de boxe, de JJB, de lutte — chacun sa largeur.
/!\ LE COURS DE MMA EST A PART : il ne travaille pas une discipline, IL LIE
LES ARMES. C'est la qu'on apprend a enchainer frappe et lutte. Un homme qui
n'en fait jamais aura de bonnes armes QUI NE SE PARLENT PAS.
Le moteur a deja les stats pour l'exprimer : enchainements, lecture, timing,
et cote lutte les entrees depuis la frappe.

## LA PREPA PHYSIQUE A TROIS VOIES (simplification de Mael)
Le sac rentre dans la prepa plutot que d'etre un extra a gerer a part :
    force          -> ko_power, explosivite, balance
    endurance      -> cardio, recovery
    frappe au sac  -> le sous-axe choisi, tres cible
Le joueur REPARTIT (50/30/20, ou tout sur l'endurance avant un combat). Un
seul curseur a trois voies.

## L'ETAT PLUTOT QU'UNE JAUGE
"La recuperation n'est pas une jauge visible mais l'etat est note : fatigue,
etc." -> frais / bien / fatigue / cuit. Un mot, pas un pourcentage. Coherent
avec le reste du jeu (on ne montre pas de barre de vie en combat non plus).
Le jeu a deja un `statut` par combattant ("affutage", "repos post-combat") :
verifier s'il peut porter cet etat sans rien inventer.

## /!\ CE QUE LA FATIGUE AFFECTE — LES TROIS
    la PERFORMANCE en combat
    la PROGRESSION (un homme cuit progresse mal)
    et LES BLESSURES (ajout de Mael)
Sans le deuxieme, un joueur laisse ses gars cuits toute l'annee et ne le
paie qu'un soir. Sans le troisieme, le sparring dur n'a aucun cout reel.
=> LE REPOS DEVIENT UTILE. Aujourd'hui il ne sert a RIEN dans le jeu.

## RESTE A TRANCHER
- le sparring dur peut-il blesser au point de faire manquer un combat ?
- un axe faible se travaille-t-il (plus lentement) ou reste-t-il faible a
  vie ? (mon avis : plus lentement — sinon un profil est enferme et le
  joueur n'a plus de decision)
- rendement decroissant sur un axe faible, ou seulement le cout
  d'opportunite du temps ? (Mael penche pour le cout du temps : "tu peux
  insister mais tu perdras beaucoup de points sur le reste")


===========================================================================
# CHANTIER L — LES BLESSURES (conception, 09/08)
===========================================================================
NON COMMENCE. Concu a l'oral avec Mael. Le moteur suit DEJA les degats par
zone — head_damage, legs.gauche / legs.droite, body.degats_corps et
degats_foie, coups_sonne. IL NE MANQUE QUE LA PERSISTANCE : tout est remis a
zero apres le combat.
/!\ Deux effets touchent le MOTEUR (arret medecin, TKO sur blessure) : ceux-
la demandent une bascule. Le reste est game-side.

## TROIS NATURES, TROIS COMPORTEMENTS
### 1. COUPURE — elle agit PENDANT le combat, pas apres
Arret du medecin en direct, une vraie fin de combat au meme titre qu'un KO.
head_damage sait deja par zone qu'une arcade est ouverte.
/!\ ELLE PEUT ARRETER UN COMBAT QUE TON HOMME GAGNAIT. Valide par Mael.
C'est cruel et c'est le sport.

### 2. MEMBRE CASSE — arret du combat PUIS arret d'entrainement
TKO sur blessure : jambe qui lache, main cassee sur un blocage. Ca manque
totalement — le moteur traque legs.gauche/droite et calcule meme une
penalite de puissance (stance.py : "les jambes cassees = frappes molles"),
mais il n'arrete JAMAIS le combat.
Puis 6 semaines a 6 mois sans s'entrainer ni combattre.

### 3. USURE — pas d'arret, mais un CHOIX (idee de Mael)
    "tu peux etre opere pour regler ca mais perdre du temps,
     sinon baisse de performance sur les axes qui touchent le membre"
Ce n'est pas une jauge qui descend, c'est un ARBITRAGE :
    operer -> six mois perdus
    continuer -> baisse CIBLEE
/!\ LA BAISSE EST CIBLEE, PAS GLOBALE : un genou abime touche le sprawl, les
entrees en lutte, le low kick. Pas une penalite generale — LES AXES QUI
PASSENT PAR CE MEMBRE.
/!\ ET ELLE S'AGGRAVE SI ON CONTINUE (valide) : lentement, sinon on ne fait
jamais operer. A un certain point elle DEVIENT un traumatisme qui impose
l'arret. Le manager qui repousse finit par payer plus cher.

## TROIS SOURCES
    COMBAT     les degats existent deja, il suffit de les CONVERTIR a la fin.
               Une jambe a 80 de degats ne redevient pas neuve le lendemain.
    SPARRING   surtout le dur. C'est la qu'un manager se fait mal : on
               prepare bien et on casse son gars trois semaines avant.
    AUTRE      accident de camp, entorse, maladie. Rare, aleatoire, injuste
               — c'est ce qui rend les carrieres imprevisibles.
/!\ LA FATIGUE MULTIPLIE LE RISQUE PARTOUT (chantier K). Un homme cuit se
blesse beaucoup plus. C'est ce qui donne enfin un cout au sur-entrainement.

## /!\ LE COMBATTANT TE DIT TOUJOURS QU'IL A MAL (tranche par Mael)
J'avais propose qu'a entente basse il cache sa douleur. NON : il te le dit
QUOI QU'IL ARRIVE. L'information n'est pas le levier — la DECISION l'est.
Tu sais qu'il a mal ; c'est a toi de choisir entre l'operer, le reposer ou
le faire combattre quand meme.

## CE QU'IL RESTE A DECIDER
- duree de guerison par nature et par gravite (coupure 2-4 semaines,
  traumatisme 6 semaines a 6 mois, usure lente et recurrente)
- une blessure peut-elle FINIR une carriere ? (non tranche)
- l'arret medecin doit-il apparaitre comme une methode de fin distincte dans
  verdict.js (a cote de KO / TKO / SOUMISSION / DECISION) ? Probablement oui.


===========================================================================
# CHANTIER M — GENERATION PAR BORNES, AGE ET CARRIERE (conception, 09/08)
===========================================================================
NON COMMENCE. Concu a l'oral avec Mael. GAME-SIDE pour l'essentiel.
Il remplace la generation par ARCHETYPE, qui est un mensonge qu'on traine.

## /!\ L'ARCHETYPE EST UNE LECTURE, PAS UNE RECETTE (proposition de Mael)
"Je dirais de ne pas creer par archetype mais avec des bornes tant et tant
sur chaque stat, et une progression plus grande sur telle stat. Et ensuite,
suivant ce qui sort, ca classe le combattant."
AUJOURD'HUI : on choisit "kickboxeur_distance" puis on applique ses bonus.
Resultat, tous les kickboxeurs se ressemblent et un profil hybride est
IMPOSSIBLE — c'est exactement ce qui nous a bloques toute la journee avec
Shavkat (throws sans shot), Pimblett (finit sans amener) et Merab.
PREUVE MESUREE : sur des generes, l'etiquette calculee depuis les STATS
contredit l'archetype de generation —
    boxeur_pressure -> "Lutteur · de puissance"
    brawler         -> "Lutteur · de puissance"
Le generateur applique des bonus d'archetype a un socle aleatoire ; si le
socle penche vers la lutte, on obtient un lutteur etiquete brawler.

## /!\ CE QU'IL NE FAUT PAS PERDRE : LA COHERENCE INTERNE
Tirer chaque stat independamment donnerait des gens absurdes — jab 90 avec
footwork 30, passing 95 avec posture_sol 25. Ces choses vont ensemble.
Donc pas des bornes independantes mais des CORRELATIONS : le jab tire le
footwork et le timing, le sprawl tire l'equilibre, le passage tire la
posture. Tirage libre, stats voisines qui se suivent.

## L'ETIQUETTE CALCULEE — TESTEE, 7/8 JUSTE
Trois couches :
    le socle        ce qu'il est         Lutteur / Frappeur / Grappler / Complet
    la specialite   ce qui depasse       chasseur de dos · cles de bras · GnP
    la trajectoire  ce qui bouge         "qui developpe son striking"
Test sur les huit etoiles : Vanel "Frappeur", Aslanov "Lutteur · chasseur de
dos · ground and pound", Adebayo "Lutteur · ground and pound", Cortés
"Grappler · chasseur de dos". Sept sur huit tombent juste.
La TRAJECTOIRE se calcule depuis l'historique par axe du chantier K.

## /!\ L'ETIQUETTE EST STABLE, ET C'EST BIEN
Test : un lutteur (frappe 68 / lutte 91) mis a la boxe quatre ans reste
"Lutteur" — il rattrape 11 points, pas 23. UNE IDENTITE NE SE RETOURNE PAS.
Si l'etiquette changeait tous les six mois elle ne vaudrait rien. C'est la
TRAJECTOIRE qui doit montrer le mouvement, pas le socle.
En revanche un JEUNE bascule : lutte 50 / frappe 35 avec un axe en frappe
devient "Frappeur" en un an. Le mecanisme marche.

## /!\ MAIS LE RYTHME DE PROGRESSION EST IRREALISTE — MESURE
Avec 0,42 point/semaine x axe 1,45 x coach 1,30 : +31 points de frappe en
UN AN, sature a 99 en deux ans. Un vrai combattant met CINQ A HUIT ANS pour
aller de debutant a niveau international, et NE SATURE JAMAIS.
A CORRIGER : ~0,10 a 0,15 point/semaine, soit 6 a 8 points par an sur le
domaine travaille.
ET LE PLAFOND DU CHANTIER K DEVIENT INDISPENSABLE : sans potentiel, tout le
monde finit a 99 et le talent ne veut plus rien dire.

## /!\ LE NIVEAU NE SE TIRE PAS — IL SE DEDUIT D'UNE HISTOIRE
On tire TROIS choses, pas une :
    l'age             20 · 25 · 30 · 36
    l'age de DEBUT    16 · 22 · 28
    le potentiel cache (le plafond)
et le niveau se calcule : annees de pratique x rythme x axes, plafonne par
le potentiel, AU PRORATA du potentiel selon la progression annuelle.
=> Le jeu doit sortir DES DEBUTANTS DE 25, 30 ANS ET PLUS, stats faibles,
   moins de temps devant eux, qui resteront loisir ou amateur.
=> Et des hommes de 20 a 36 ans DEJA AVANCES, chacun selon son age et ses
   annees de pratique.
/!\ UN JEUNE DE 18 ANS EST AVANTAGE sur un de 25 qui debute : il progresse
plus vite au meme stade. Un tard-venu ne rattrape JAMAIS.
/!\ LE POTENTIEL N'EST PAS CORRELE A L'AGE DE DEBUT : c'est du talent brut.
Mais commencer tard fait qu'on ne l'atteint jamais.

## CE QUE CA CREE POUR LE JEU
Quand tu recrutes, tu ne regardes plus une note : tu regardes UN AGE ET UNE
MARGE. Un 19 ans a 55 vaut bien plus qu'un 29 ans a 62 — et c'est ton metier
de le voir. C'est ce qui donne enfin un emploi au SCOUTING, reste a zero.

## LA COURBE DE CARRIERE — TROIS VITESSES (precision de Mael)
    fight_iq                    MONTE TOUJOURS — c'est l'experience
    technique                   plafonne vers 32-34, decline tres lentement
    vitesse, cardio, explosivite declinent nettement apres 32-34
C'est ce qui explique les vieux qui gagnent encore : plus lents, moins
explosifs, mais ils voient tout venir. Et un jour la lecture ne suffit plus,
parce que le corps ne suit plus assez pour agir sur ce qu'on a vu.
/!\ LE FIGHT IQ DEVRAIT DEPENDRE DES COMBATS PLUS QUE DES ANNEES : un homme
a trente combats a vu plus qu'un homme du meme age a huit combats.
/!\ LE MENTON NE MONTE PAS, IL S'USE. C'est meme souvent la premiere chose
qui lache — et ca rejoint le chantier L (usure accumulee).
=> LE TIMING DU PASSAGE PRO DEVIENT DECISIF : trop tot, il prend des degats
   qui useront son menton pour rien ; trop tard, il perd des annees de
   plafond.
=> Et recruter un veteran devient un PARI : 35 ans, fight_iq 95, corps en
   baisse — il peut encore battre un jeune plus rapide, ou s'ecrouler au
   troisieme round.

## LE DECLIN SE DEVINE, IL NE S'AFFICHE PAS
Coherent avec le potentiel cache. Mais l'historique par axe du chantier K
laisse VOIR la courbe s'inverser — c'est au joueur de le lire.

## js/carriere.js — LE PARCOURS (chantier M, module ecrit le 09/08)
Module natif JS, AUCUN fichier gele touche. Meme forme que grappling.js : on
pose par-dessus un combattant genere ce que le MOTEUR N'A PAS BESOIN DE
SAVOIR — depuis quand il s'entraine, jusqu'ou il peut aller, ou il progresse
vite, et dans quelles conditions il a grandi.

### LE NIVEAU SE DEDUIT
On tire l'age, l'age de DEBUT, le potentiel, les axes et le PARCOURS ; le
niveau tombe de ces cinq-la, annee par annee, plafonne par le potentiel et
AU PRORATA DE LA MARGE RESTANTE (les derniers points sont les plus durs, on
n'atteint jamais tout a fait son plafond).
MESURE, 600 combattants : potentiel moyen 79, note moyenne 51.
/!\ L'ECART ENTRE LES DEUX, C'EST LE PARCOURS. C'est ce qui donne son metier
au scout : un homme de 26 ans a 71 avec une grosse marge n'est plus un
chiffre, c'est quelqu'un qu'on a MAL ENCADRE et qu'on peut recuperer.

### /!\ DEUX CALIBRAGES CORRIGES APRES MESURE
1. Potentiel moyen 52 -> 80. A 52, personne ne depassait 65 apres treize ans
   alors que les champions sont a 88-96 : le potentiel PLAFONNAIT tout le
   monde. Il represente ce qu'on atteindrait TOUT ALIGNE — ca n'arrive
   presque jamais.
2. Rythme 0,42 -> 0,13 point/semaine. A 0,42, un jeune gagnait 31 points en
   un an et saturait a 99 en deux ans. Un vrai combattant met CINQ A HUIT
   ANS.

### /!\ GANE A COMMENCE A 24 ANS ET EST DEVENU CHAMPION
Le facteur d'age etait bien trop punitif (0,80 des 29 ans, 0,30 apres 35) :
ce parcours etait IMPOSSIBLE a fabriquer. Adouci — un debut tardif est un
handicap, pas une condamnation.

### /!\ LES PARTENAIRES COMPTENT AUTANT QUE LE COACH (Mael)
Gane et Ngannou sortent de LA MEME PETITE SALLE et finissent par s'affronter
pour la ceinture. Ils se sont tires vers le haut parce qu'ils s'entrainaient
ensemble — les salles regroupent PAR POIDS ET PAR NIVEAU. Un grand club ou
l'on est seul a sa categorie vaut moins qu'un petit club avec un monstre en
face.
=> UNE PETITE SALLE PEUT SORTIR DES GENIES. La correlation taille/niveau
   doit rester LACHE, jamais mecanique. La taille ne dit que les MOYENS.

### /!\ COMPETENCE ET REPUTATION SONT DEUX CHOSES (correction de Mael)
"Fernand n'etait pas connu, ca n'en fait pas un coach mediocre."
Premiere version : une seule valeur, donc un coach peu connu ETAIT faible.
Faux — il sortait deux champions du monde d'un garage ; ce qui lui manquait,
c'etaient les moyens et le nom.
MAIS LA REPUTATION N'EST PAS DU BRUIT, c'est un SIGNAL BRUITE : "quelqu'un
qui a fait ses preuves est un bon coach quoi qu'il arrive, peut-etre un peu
surcote parfois." Elle BORNE PAR LE BAS sans garantir le haut :
    repute  -> plancher 0,56, median 0,79, jamais mauvais
    inconnu -> de 0,30 a 0,98
=> On ne se fait JAMAIS avoir en payant cher, on paie juste parfois trop. Et
   le seul endroit ou faire une AFFAIRE, c'est dans l'inconnu.

### /!\ LA PERLE EST A UN SUR VINGT, PAS UN SUR CINQ
Premiere version : 19 % des inconnus depassaient 0,85. Mais ces coachs
existent aussi dans TOUTES les autres salles et ils CIRCULENT — un sur cinq
multiplie par tous les clubs, ca fait des centaines de perles et la rarete
disparait. A 5 %, en trouver un reste un vrai coup de chance.

### CE QUE CA OUVRE, ET QUI EST A CODER
- un coach excellent et inconnu FINIT PAR ETRE REPERE : il ne reste pas
  inconnu dix ans. La valeur de la trouvaille est dans la RAPIDITE.
- donc TES COACHS PEUVENT PARTIR : celui que tu as revele devient repute,
  demande, cher — et une grosse salle te le prend. Meme logique que le
  combattant du chantier H, a traiter avec lui.
- "tu pourrais recruter un coach pour tes amateurs et il devient meilleur
  que tes coachs pros" (Mael) : tu ne le sais pas tout de suite, TU LE
  DEDUIS en regardant tes jeunes progresser anormalement vite. La competence
  est invisible, LA TRACE est lisible — meme principe que le potentiel cache.
  Et l'arbitrage est reel : le monter sur les pros, c'est laisser les
  amateurs sans encadrement. Peut-etre que le meilleur usage d'un excellent
  coach, c'est justement de former les jeunes.

### RESTE A CORRIGER DANS carriere.js
- le sommet plafonne a 86, les etoiles sont a 88-96 : il manque le dernier
  etage, celui ou tout s'aligne.
- le plancher a 22 est trop dur : un debutant a quand meme un corps et des
  reflexes, il devrait etre vers 30-35.


===========================================================================
# ETAT AU 09/08 — A LIRE EN PREMIER PAR LA PROCHAINE SEANCE
===========================================================================

## OU EN EST LE PROJET
16 bancs CONFORME. engine.py et engine.js identiques au caractere pres.
Archive courante : mma_session_v81.zip.
PREMIER GESTE DE LA SEANCE : rejouer ./js/lancer_verifs.sh sur l'archive
uploadee AVANT de toucher a quoi que ce soit. Si ce n'est pas 16, s'arreter
et chercher pourquoi.

## CE QUI EST FAIT ET JOUABLE
Moteur de combat (round par round, coin inter-round, feuille UFC), gestion
de salle (forfait annuel, locaux, boutique, etoiles par domaine), media et
reputation vivante, image et incidents, scenes de conference et de pesee.

## LE GROS DU 09/08 : LE CHANTIER I (grappling), TERMINE
Six verrous ouverts et mesures. Resultat sur la table de repere :
    Vanel c. Aslanov (specialiste dos)   93/7  ->  70/30
    Vanel c. Cortés  (grappler complet)  60/40 ->  53/47
    soumissions Aslanov  31/400 -> 115/400
    calibrage : DEC 47,6 -> 48,8 · SUB 20,8 -> 23,8 · TKO 19,4 -> 16,9
/!\ LE CALIBRAGE A BOUGE ET C'EST VOULU. Ne pas le "corriger" : on repare
les mecaniques d'abord, on recalibrera a la fin.
/!\ UN SEPTIEME VERROU RESTE OUVERT : scorer_round donne le round aux
DEGATS des 6 points d'ecart — le controle n'est jamais regarde (mesure :
100 % des rounds decides aux degats, 0 % au controle). Mais a 4,5 pour 1 de
degats, l'ouvrir ne changerait rien pour l'instant.

## LE VRAI BLOCAGE MAINTENANT : LE CHANTIER D
Un lutteur encaisse 389 points de degats par round. Ce n'est plus du
grappling — LE COMBAT DEBOUT N'A PAS DE DISTANCE. Entrer en lutte, c'est
traverser la zone de frappe a decouvert, et rien ne protege celui qui entre.
D bloque aussi J (28 % de low kicks au lieu de 13 %) et la saisie de jambe.
=> C'EST LA PROCHAINE PIECE QUI DEBLOQUE LE PLUS.

## HUIT CHANTIERS CONÇUS, NON CODES
D geometrie de cage · E leviers tactiques · F discipline (stat morte) ·
G cri en direct · H entente coach/combattant · K progression et potentiel ·
L blessures · M generation par bornes et parcours.
/!\ C'EST BEAUCOUP D'AVANCE SUR LE CODE, ET C'EST UN RISQUE ASSUME. Avant
d'ouvrir un chantier neuf, se demander : est-ce que ca rend la SAISON plus
interessante a jouer, ou est-ce que ca l'eloigne ?
Le seul morceau qui donne une saison jouable est le POINT 4 DE LA FUSION :
le vivier regional, les offres, les contrats de 3 combats. Rien de tout ca
n'existe. Le joueur a UN combat et la saison s'arrete.

## DEUX MODULES ECRITS AUJOURD'HUI, PAS ENCORE BRANCHES AU JEU
    js/grappling.js  (banc 16) — quatre etages du sol, familles de soumission
    js/carriere.js   — age, potentiel cache, axes, parcours
carriere.js a deux bornes a corriger : le sommet plafonne a 86 (les etoiles
sont a 88-96) et le plancher a 22 est trop dur pour un debutant.

## LES REGLES DE TRAVAIL, APPRISES CHER
1. MESURER AVANT DE TOUCHER, et se demander d'abord SI IL FAUT TOUCHER. On
   a rouvert le gel pour la note generale alors qu'il suffisait de dedoubler
   la fonction. La bonne question n'est pas "comment basculer proprement"
   mais "faut-il basculer".
2. LA VALEUR EST-ELLE LUE PAR LE MOTEUR OU SEULEMENT AFFICHEE ? Si elle est
   lue, peut-on la DEDOUBLER plutot que la modifier ?
3. GARDE-FOU SUR LES NEUF DIVISIONS, jamais une seule. Un A/B limite au
   welter a donne 100 % identiques alors que la mesure globale montrait
   +1,3 point de soumissions.
4. TOUT REMPLACEMENT DE CHAINE DOIT ETRE VERIFIE. Quatre echecs silencieux
   dans la seule journee du 09/08.
5. TOUTE MECANIQUE QUI INCREMENTE UN COMPTEUR DU MOTEUR DOIT ETRE APPRISE A
   feuille.js DANS LE MEME GESTE.
6. AJOUTER UNE OPTION NE SUFFIT PAS SI LE MECANISME DE CHOIX NE LA REGARDE
   PAS. Et ponderer par une valeur ABSOLUE noie l'ecart quand tout le monde
   est bon partout — c'est le rapport AUX AUTRES OPTIONS qui decide.
7. CLAUDE PROPOSE, ON TRANCHE ENSEMBLE, PUIS ON CODE. Vaut pour les
   mecaniques et les valeurs ; les bugs evidents se corrigent direct.

## /!\ LA LEÇON DE FOND, QUI EXPLIQUE TOUS LES BUGS DE LA SEMAINE
"On a voulu faire les stats reelles en delaissant tout le reste, alors qu'en
bossant mieux on s'en serait approche sans avoir ce genre de merde." (Mael)
On a calibre la SORTIE et laisse le CHEMIN faire n'importe quoi. Le moteur
produisait les bons chiffres POUR DE MAUVAISES RAISONS. Meme signature pour
le scoring 10-8 a 85 %, les 63 % contre la grille, les 28 % de low kicks.
=> CALIBRER UNE DISTRIBUTION SANS VERIFIER LES TRAJETS QUI LA PRODUISENT,
   C'EST AJUSTER UN THERMOMETRE AU LIEU DE SOIGNER LE MALADE.

## /!\ ET LA LEÇON DE METHODE
Sept defauts sur huit ont ete trouves PAR MAEL EN JOUANT ou en posant une
question, pas par les bancs. Les bancs verifient que les chiffres sont
coherents entre eux ; ils ne savent pas dire qu'une reaction est
INVRAISEMBLABLE. Ca, il faut y jouer.
Et un banc qui ne reproduit pas la SEQUENCE REELLE ne teste pas le produit.

===========================================================================
# POINT 4, ETAPES 0 ET 1 : LE MONDE EXISTE (09/08, suite de seance)
===========================================================================

## /!\ INCIDENT DE SEANCE, A CONNAITRE
Un tour de Claude a ete interrompu par megarde : LE TEXTE EST PERDU, LES
FICHIERS ECRITS SONT RESTES. vivier.js, verifier_vivier.js, le banc de
carriere.js et la mise a jour de lancer_verifs.sh sont apparus sans patch
visible. Traites comme code suspect (regle du carnet) : relecture
integrale, rejeu des bancs, chaine complete. Tout est conforme et coherent
avec les decisions prises en clair juste avant. ORIGINE ETABLIE : le tour
interrompu. Lecon : apres une interruption, AUDITER LE DISQUE — il peut
etre en avance sur la conversation.

## DECISIONS DE MAEL (volumes et monde)
- AFC 50 par division, TOUTES les autres orgs 30 · amateurs : x20 les pros.
- Cartes AFC toutes les 2 semaines.
- 12 pays valides (USA, BRA, FRA, RUS, UK, POL, JPN, MEX, CAN, AUS, SWE,
  NLD), une organisation NATIONALE par pays (noms derives, meme garde-fou
  juridique : INPI/EUIPO avant publication).
- LA TENDANCE NATIONALE PONDERE, N'INTERDIT JAMAIS : du lutteur en France
  existe, plus rare (mesure : 7,5 % contre 37,2 % en Russie). Aucune case
  a zero.
- Defauts poses non repris : autres orgs mensuelles, HEX toutes les 3
  semaines, cartes de 12 (AFC/GFL) et 10 (ailleurs).

## ETAPE 0 — carriere.js, bornes corrigees (banc 17)
- plancher 22 -> 32 (mesure 4000 carrieres : debutants 22,9 -> 32,8,
  median 51 -> 56,5 — toute la population monte un peu, assume).
- sommet : le dernier etage existe (p99 87,5 · max 96,8 — rejoint les
  etoiles 88-96). Mediane sous 65 : le talent reste rare.

## ETAPE 1 — vivier.js, LE MONDE (banc 18)
- MESURE QUI A TRANCHE LA CHARPENTE : 4500 pros en fiches completes = 9 Mo,
  90 000 amateurs = 59 Mo -> DEUX ETAGES DE FICHE. Fiche legere stockee
  (identite, histoire, bilan — 1 Mo le monde entier) ; fiche moteur
  REFABRIQUEE a la demande.
- HYDRATATION DETERMINISTE : flux RNG prive seme par melange(graine du
  monde, id). Le meme homme se refabrique a l'identique, partout, toujours.
  Le flux partage reste INTACT (verifie au tirage pres). Sans ca, la
  sauvegarde et le replay divergent.
- LA HIERARCHIE EST EMERGENTE : on genere une population par pays (avec son
  histoire via carriere.js), puis les orgs RECRUTENT du sommet vers les
  nationales. AFC 84,7 de moyenne > GFL 79,4 > SOK 75,4 > nationales 63,4 —
  produit par la selection, pas par une table.
- TOUT CE QUE LE JOUEUR TOUCHE DEVIENT PERSISTANT : un amateur recrute est
  hydrate UNE fois puis vit en fiche complete. Il ne redevient jamais une
  fonction du temps. (La bascule vivra dans le module de salle.)
- Couts mesures : monde(11) = 716 ms · hydratation < 1 ms · etat 1 Mo.
- Chaine : 18 bancs CONFORME.

## RESTE POUR LE POINT 4
- Etape 2 : LA VIE — calendrier des cartes, matchmaking NPC, resolution a
  trois etages (ta carte : moteur complet · autre carte pro : moteur
  complet, verdict seul conserve · amateurs hors ecran : resolution legere,
  l'ecran ne montre qu'un bilan). Regle 7 tenue a chaque etage.
- Etape 3 : les offres par message, delai d'expiration, adversaire nomme.
- Etape 4 : le contrat de 3 combats (regles champion/rachat deja gravees).

## LA PYRAMIDE DES AGES (correction du 09/08, demande de Mael)
SYMPTOME MESURE : l'AFC etait une maison de retraite — 60 % de 33+, sept
hommes de moins de 25 ans sur 450. CAUSE DOUBLE :
1. RIEN NE DECLINAIT AVEC L'AGE sauf le menton. Un 37 ans gardait son
   niveau de pointe, donc les plus vieux etaient mecaniquement les
   meilleurs disponibles, et la selection les ramassait.
2. Le recrutement triait sur la NOTE SEULE.
DEUX MECANIQUES, ENSEMBLE (une seule ne suffisait pas — meme signature que
le compound fix du sol) :
- carriere.js : LE CORPS DECLINE, LA TECHNIQUE TIENT. Physique -1,1/an des
  33 ans, technique -0,5/an des 35 ans. Un vieux champion reste dangereux,
  il n'est plus entier.
- vivier.js : LES ORGS SIGNENT SUR NOTE + HORIZON (attrait = note +
  max(0, 29-age) x 0,55). Un matchmaker prefere un 24 ans a 80 qu'un 35
  ans a 82 : dix ans de cartes a vendre.
- Et pente du tirage d'age des pros 0,85 -> 1,5 (mediane vers 27).
RESULTAT : AFC 33+ 42 %, moyenne 30,7 ans, 34 pepites de ≤23 ans dont un
21 ans a 84. HEX tres jeune (47 % de <25, moyenne 26,4) : la nationale
NOURRIT, le sommet consacre. Banc 18 : trois invariants de pyramide.
/!\ NOTE POUR L'ETAPE 2 (decision de Mael) : LES ORGS COUPENT LES SERIES
DE DEFAITES EN FIN DE CONTRAT. Coupes + montee des jeunes = la pyramide
reste saine DANS LE TEMPS, pas seulement a la naissance du monde.

## DECISIONS POUR L'ETAPE 2 (Mael, 09/08, avant cartes.js)
- PAS DE CHEMIN OBLIGE ENTRE LES ORGS : a chaque fin de contrat, toutes
  les orgs evaluent. L'AFC signe un genie de TRI en direct si (1) elle le
  VOIT — notoriete ≥ son seuil de radar, (2) sa serie passe sa barre
  (serieRequise, la star negocie plus tot), (3) il est libre. L'echelle
  europeenne EMERGE des seuils, elle n'est pas decretee. Rachat en cours
  de contrat : rare, reserve au phenomene.
- LES ORGS NE VOIENT PAS LE NIVEAU, ELLES VOIENT LA TRACE (bilan, serie,
  notoriete, ou tu combats). Un genie de gymnase a 0 combat n'existe pour
  personne. TOI tu vois le niveau de TES gars (fiches, etoiles) — jamais
  leur potentiel en chiffre (avis du coach seulement).
- L'ESTIMATION D'UN ADVERSAIRE = CE QUE SES COMBATS ONT MONTRE, par zone,
  a la date du combat. Precision par zone selon l'EXPOSITION (6 min au sol
  -> fourchette serree la ; jamais vu en clinch dos au grillage -> mystere).
  Le dernier combat pese plus. INACTIVITE : chaque mois elargit les
  fourchettes, l'age oriente le doute (un 36 ans inactif a probablement
  baisse, un 23 ans a probablement monte) — en mots de coach, jamais en
  chiffre certain. Regle 7 par construction : le rapport est calcule depuis
  ce que le moteur a REELLEMENT tire.
  => CONSEQUENCE D'ARCHITECTURE : chaque combat NPC doit laisser une
  EMPREINTE DATEE (temps par contexte, positions visitees, frappes par
  zone, TD) — quelques dizaines d'octets. Sans elle des le premier combat
  simule, les donnees du scouting sont perdues a jamais. Les bilans
  d'AVANT la naissance du monde n'ont pas d'empreinte : estimation
  grossiere par archetype, qui s'affine des qu'ils combattent. Assume.
- LA NOTORIETE SE TRANSFERE : battre quelqu'un de connu rapporte gros
  (tout le monde regarde le combat), et MEME PERDRE contre une star fait
  monter — on t'a vu. Le gain porte la notoriete de l'ADVERSAIRE en plus
  de la place sur la carte.
- LES COUPES : les orgs virent les series de defaites en fin de contrat.

===========================================================================
# POINT 4, ETAPE 2 : LE MONDE VIT — cartes.js (banc 19)
===========================================================================

## /!\ LE MONDE VIEILLIT GRATUITEMENT (decouverte d'architecture)
La boucle de deduction de carriere.js ne consomme AUCUN RNG : tous les
tirages tombent avant elle. Hydrater a +N annees (vivier.hydrater(m, id,
annees)) rend donc, deterministe, l'homme D'AUJOURD'HUI — progression des
jeunes, declin des vieux. Un an d'inactivite bouge REELLEMENT la fiche
(mesure banc : 21 ans 80,8 -> 86,5 · 37 ans 92,4 -> 90,9 sur 4 ans).
C'est la matiere du scouting date, sans un systeme de plus.

## CE QUE cartes.js FAIT
- Calendrier : AFC 14 j · HEX 21 j · le reste 30 j. Cartes de 12 (AFC/GFL)
  et 10. Chaque combat NPC : moteur complet dans un flux prive seme par
  (graine, jour, ids) — verdict + EMPREINTE seuls conserves (regle 7,
  prouvee par rejeu au compteur pres). ~7,4 ms par combat : un an de monde
  = 2206 combats en ~9 s.
- Matchmaking sur la TRACE seulement (jamais l.note) : les plus en manque
  d'abord, classes avec classes, pas de revanche immediate, titre en main
  event, place sur la carte = notoriete cumulee.
- Fin de contrat : COUPE (3 defaites de rang — et personne ne rappelle un
  D-D-D tout frais), RETRAITE (36+ sur 2 defaites), MONTEE (radar
  portee x 0,4 + serieRequise + une place — pas de chemin oblige, 18
  signatures vers AFC/GFL sur l'annee mesurée), PROLONGATION (3 combats),
  NOUVEAU SANG (vivier.nouveauPro — jeune du pays, id qui continue la
  cellule, refabricable).
- retasser() : bouger() est PAIRWISE, deux hommes atterrissaient au meme
  rang. Apres chaque combat les classes se recompressent en 1-15, celui
  qui vient de bouger gagne l'egalite, champion n°1.
- Notoriete : gagnerNotoriete a un 6e parametre optionnel notoAdv
  (DEDOUBLE, banc 14 intact) — le TRANSFERT : x(1 + notoAdv/100). Mesure :
  +4,7 seul, +8,4 contre star ; en DEFAITE +1,4 seul, +2,4 contre star.

## /!\ TROIS LECONS PAYEES AU BANC
1. LES NOMS EN (\S+) : verdict.js et feuille.js ne lisent qu'UN MOT — le
   banc verdict le savait sans le dire (il renomme "Okonkwo", "Rouge").
   Solution maison suivie : le moteur combat sous des jetons A/B, les
   vrais noms vivent dans la fiche legere et ne traversent jamais un log.
2. LA BANDE, PAS LE VERROU STRICT (deux effets couples) : roster strict a
   la cible = les trous se rebouchent au nouveau sang avant qu'une org
   d'en bas les voie -> ZERO montee. Sans verrou -> rosters qui gonflent.
   Bande : signatures d'en bas jusqu'a cible+2, recompletement sous
   cible-1 — les trous qui restent SONT les places du marche.
3. L'ARITHMETIQUE DECIDE DU RYTHME : 26 cartes x 12 = 624 places pour 450
   hommes = 1,4 combat/an/homme a l'AFC. La vraie UFC est a ~1,6 — le
   "2-3 par an" est le rythme des actifs mis en avant, pas la moyenne du
   roster. Monter la moyenne = cartes plus grandes ou roster plus petit :
   DECISION DE MAEL EN ATTENTE.

## A SAVOIR / EN ATTENTE
- Repartition des methodes sur la vie du monde : DEC 63 % · TKO 14 % ·
  SUB 12 % · KO 11 % — differente du critere de bascule (populations
  differentes). ON NE TOUCHE PAS : recalibrage a la fin, regle du carnet.
- 0 coupe sur l'an 1 (echelle de temps : 3 defaites demandent ~2 ans a
  1,4 combat/an, et la retraite des 36+ ramasse avant). La regle est
  prouvee en cas construit au banc.
- ~65 retraites l'an 1 : la vague des 33+ de la naissance. Voulu — la
  pyramide se rajeunit par la vie.
- cartes.js n'est PAS ENCORE BRANCHE au jeu (depeches, onglet COMBATS,
  offres au joueur = etape 3).
Chaine : 19 bancs CONFORME.

## LES DEUX FORMATS DE CARTE AFC (Mael, 09/08, sur le modele reel)
- NUMEROTEE, une sur deux : 15 combats en 5 main / 5 prelims /
  5 PRE-PRELIMS (nouvelle place, mult. 0,3 dans PLACE — additif, banc 14
  intact). FIGHT NIGHT entre deux : 12 combats a grande main card (9/3),
  main event possible SANS TITRE (top 12 c. top 8, ou superstar de retour).
- LE MAIN EVENT EST TOUJOURS EN 5 ROUNDS, titre ou pas.
- L'ordre de la carte : la notoriete cumulee decide — la superstar passe
  devant le n°5 c. n°6 — SAUF la ceinture qui passe devant tout. (Ces deux
  regles etaient deja natives du tri de batirCarte.)
- Nouvelle arithmetique : 13x15 + 13x12 = 351 combats, 702 places / 450
  hommes = ~1,55 par homme — au niveau reel (~1,6). Decision de Mael :
  cartes plus grandes plutot que rosters plus petits ; pre-prelims en
  reserve si on veut elargir encore.
- Banc 19 : invariant formats + main event 5 rounds. Chaine : 19 CONFORME.

## LE RELIEF DU RYTHME (Mael : "c'est strict 1,55 ou ca varie ?")
MESURE : quasi strict — 45 % a 1, 54 % a 2, 1 % a 3. Le tri "les plus en
manque d'abord" egalise tout le monde. DEUX POIDS AJOUTES a la priorite du
matchmaker : L'APPETIT (trait deterministe de l'id, 0,72-1,42 — le jeune
affame prend tout, certains veterans combattent peu) et LE NOM (x(1 +
noto/200) — les stars sont rappelees, les organisations vendent des
billets). RESULTAT : 50 % a 1 · 44 % a 2 · 5 % a 3 · 1 % a 4 · deux
oublies a 0 · classes 1,95 contre non-classes 1,39 · moyenne 1,55
inchangee. Invariant de relief au banc 19. Les blessures (chantier L)
ajouteront la variance qui manque encore.

## /!\ RAPPEL DE METHODE (Mael, 09/08) : "toi t'as tout modifie, on fait
## pas comme ca ici"
La regle 7 vaut AUSSI en cours de flux : une question de mesure appelle
une mesure, pas une mecanique codee dans la foulee. Annoncer en faisant
n'est pas proposer. L'appetit (trait invente) a ete code sans trancher —
retire a la correction suivante.

## LE RYTHME A UNE CAUSE PHYSIQUE (Mael, 09/08 — remplace l'appetit)
- L'EMPREINTE PORTE AUSSI L'ENCAISSE (pris : frappes subies, KD, fini) —
  gratuit, les deux cotes etaient deja resolus. Nourrira le scouting (un
  homme qui sort d'une guerre) et l'usure du chantier L.
- L'INDISPONIBILITE DECOULE DE L'ENCAISSE : 21 j plancher + 0,35 j par
  frappe subie + 10 j par KD, + suspension type commission si fini (KO
  +60 · TKO +40 · SUB +15). Un combat tranquille rend vite, une guerre
  couche des mois (mesure : un KO subi -> +159 j).
- UNE FOIS REMIS, L'HOMME FAIT SA DEMANDE : le matchmaker n'apparie que
  les DISPONIBLES. Le rythme de chacun emerge du physique — cause
  tracable, aucun trait. Poids du nom GARDE (decision Mael) : parmi les
  dispos, les stars sont rappelees en premier.
- Distribution mesuree : 50 % a 1 · 46 % a 2 · 5 % a 3 · moyenne 1,55.
  Moins de relief qu'avec le trait invente, et c'est honnete : les
  blessures (chantier L) ajouteront la variance manquante.
- LE COULOIR DE SAUT ("je peux gruger les etapes, dans la mesure du
  logique") : le matchmaker prefere TOUJOURS l'ecart minimal parmi les
  dispos ; faute de mieux un classe monte jusqu'a 8 rangs, un non-classe
  ne saute JAMAIS dans le top 5, le titre reste au main event. Celui qui
  saute et gagne est paye cash par bouger(). Invariant : 2245 combats au
  crible, zero violation.
- POUR L'ETAPE 3 (cote joueur, gravee) : l'orga te sollicite AUSSI — ton
  gars n'est pas au top, mais accepter entretient TA RELATION A L'ORGA ;
  refuser, la prochaine offre sera moins belle (bourse, place, adversaire
  suivent la relation). Cramer ton gars ou cramer ton credit.
- Banc 19 : invariants suspension (KO >= 81 j) et couloir. Rangs du
  moment captures dans chaque resultat (rangA/rangB) — l'ecran de
  l'onglet COMBATS saura afficher "#14 c. #6".

## LA FRAICHEUR — LA MEFORME EXISTE DANS LES FICHES (Mael : "des vraies
## stats a combattre en meforme ?", puis "oui parfait")
- fraicheur(vie, jour) : 1 = remis, 0 = sorti de la cage, lineaire entre
  le dernier combat et la date de remise.
- appliquerFraicheur(fiche, fr) : a fraicheur 0, cardio -25 %, menton
  -20 %, recuperation -10 %. MEME PRECEDENT QUE LA PESEE (cardioJourJ) :
  un facteur sur le physique, pas un systeme neuf. Vaut pour les NPC ET
  pour les gars du joueur (l'etape 3 l'appliquera quand tu acceptes une
  sollicitation d'orga avec un gars pas remis).
- COURTE PREPARATION NPC : le matchmaker prend les remis d'abord,
  TOUJOURS ; un semi-remis (jamais sous 55 %) n'est pris que faute de
  mieux. Mesure : ZERO declenchement sur l'annee — les rosters sont assez
  profonds. Mecanisme de bord pour le monde, central pour le joueur.
  Prouve en cas construit au banc (le remis prend le semi-remis quand
  tout le reste est couche).
- frA/frB captures dans CHAQUE resultat et fraicheur dans l'empreinte :
  l'ecran et le scouting sauront qu'il est monte diminue (regle 7).
- La FORME du GDD (en pleine bourre -> a plat, oscillation lente) reste
  un chantier separe ; la fraicheur post-combat en est le premier etage,
  physique et tracable.
Chaine : 19 bancs CONFORME.

===========================================================================
# POINT 4, ETAPE 3 (1re moitie) : LA RELATION A L'ORGA — relation.js (banc 20)
===========================================================================

## /!\ LE CHIFFRE DANS LE CODE, LES MOTS A L'ECRAN (arbitrage de Mael)
Mael : "les chiffres permettent de mieux se rendre compte des actions,
les mots donnent plus de realite". TROISIEME VOIE RETENUE : la relation
vit en chiffre 0-100 (effet exact, prouvable au banc), le joueur ne lit
QUE des mots — cinq paliers ("ils te font confiance" ... "tu es en froid
avec eux") plus un commentaire quand ca bouge fort ("Ton refus n'est pas
passe inapercu"). MEME PATRON QUE LE POTENTIEL CACHE ET LES AVIS DU
COACH. /!\ REVERSIBLE EN UNE LIGNE si ca frustre en jouant — c'est ecrit
dans l'en-tete du module pour que la prochaine seance le sache.
Invariant au banc : aucun palier ni commentaire ne laisse fuir un chiffre.

## LES ENTREES (dictees par Mael, valeurs proposees a rejuger EN JOUANT)
    refus -8 · REFUS REPETE -20 (l'orga se lasse ; toute acceptation
    remet le compteur a zero) · acceptation +5 · DEPANNAGE (accepter en
    courte preparation) +15 · PESEE LOUPEE -18 · FINISH +6 ·
    SPECTACLE +8 · defaite -2
Asymetrie voulue : on perd plus vite qu'on ne gagne.

## CE QUE LA RELATION ACHETE (faveurs)
place sur la carte (0 a +2 crans) · bourse (x0,85 a x1,20 dans la
fourchette de l'org) · DURETE de l'adversaire propose (0 a +5 rangs
imposes quand ils ne t'aiment pas). Relation basse = des pieges, pour peu
d'argent, en prelims.

## /!\ LE SPECTACLE SE LIT DANS L'EMPREINTE, IL NE SE DECRETE PAS
Trois voies, toutes tirees du log : la guerre debout (volume >= 100/round
ET les deux cotes a >= 36/round), le finish violent (2 chutes, ou un
arret au 1er round), la bataille au sol (28 echanges/round et 5
tentatives de soumission).
/!\ CALIBRE PAR MESURE : premiere version a 63 % de spectacles — un
spectacle qui arrive deux fois sur trois n'est plus un spectacle, et la
prime devenait un du. Seuils remontes sur la distribution reelle (volume
median 70/round, 38 % de finitions) : 18 % sur 1085 combats.

## RESTE POUR L'ETAPE 3 (2e moitie, PAS ENCORE CODEE)
- Les OFFRES : message date, delai ~7 jours, adversaire nomme avec sa
  trace consultable, date du combat = celle de la carte de l'org (donc le
  camp restant se voit).
- Les DEMANDES DE COMBAT cote joueur (valide par Mael) : meme mecanique
  que les NPC, on entre dans le vivier du matchmaker une fois remis.
- Les SOLLICITATIONS en courte preparation : appliquer appliquerFraicheur
  au gars du joueur — c'est la que le dilemme mord.
- Le branchement au jeu (depeches, onglet COMBATS).
Chaine : 20 bancs CONFORME.

===========================================================================
# POINT 4, ETAPE 3 (2e moitie) : LES OFFRES — offres.js (banc 21)
===========================================================================

## TROIS CHEMINS VERS UN COMBAT, UN SEUL MOTEUR DERRIERE
1. L'OFFRE : l'orga propose pour sa prochaine carte. Message date, DELAI
   7 jours, adversaire nomme avec sa trace, date du combat visible (donc
   le camp restant se lit).
2. LA DEMANDE (validee par Mael) : ton gars remis, tu demandes. On te
   refuse si l'homme est couche. Ce qu'on te trouve depend de ta relation.
3. LA SOLLICITATION EN COURTE PREPARATION : ton gars n'est PAS remis.
   Accepter applique REELLEMENT appliquerFraicheur (mesure banc :
   cardio 46 -> 38, menton 80 -> 69) et rapporte +15 au lieu de +5.
   Refuser -8, -20 au deuxieme d'affilee. CRAMER TON GARS OU TON CREDIT.

## /!\ L'OFFRE NE MENT JAMAIS (regle 7)
Bourse = classement.bourse() x relation.faveurs().bourse — verifie au
banc, pas un habillage. Place = ce que ta notoriete vend + ce que la
relation t'offre. ET ELLE NE REVELE PAS LE NIVEAU : elle porte la TRACE
(nom, pays, rang, bilan, notoriete, 2 dernieres empreintes, date du
dernier combat). Invariant : aucun champ note/niveau/potentiel.
MESURE DU DILEMME (meme homme, #9) :
    mal vu (10)  : 2727 € · pre-prelims · adversaire #2  <- un piege
    bien vu (90) : 3585 € · main card   · adversaire #10 <- un combat juste

## NE PAS REPONDRE EST UNE REPONSE
L'offre expire au bout de 7 jours et compte comme un REFUS. Le joueur ne
peut pas laisser pourrir sans payer.

## L'APRES-COMBAT SORT DU LOG, PAS D'UNE ETIQUETTE
apresCombat() lit les empreintes : finish +6, spectacle +8 (estSpectacle,
18 % des combats), defaite -2, pesee loupee -18. Mesure : une decision
terne ne bouge RIEN (50 -> 50) ; un KO spectaculaire monte deux fois
(50 -> 64) ; une pesee loupee gache meme un KO (50 -> 46).

## RESTE POUR FINIR LE POINT 4
- LE BRANCHEMENT AU JEU : demo_jeu.html ne connait ni vivier.js, ni
  cartes.js, ni relation.js, ni offres.js. Tant que ce n'est pas branche,
  la saison existe en modules et PAS A L'ECRAN. C'EST LE PROCHAIN GESTE.
- Le contrat du JOUEUR (3 combats, renegociation) : la structure NPC
  existe dans cartes.js, rien cote joueur.
- Le fil media devrait manger les combats du monde ; les scenes de
  conference et de pesee devraient peser sur la relation (elles existent).
Chaine : 21 bancs CONFORME.

===========================================================================
# CHANTIER H CODE — entente.js · dialogue.js · demandes.js (bancs 22-24)
===========================================================================

## entente.js — LE RESIDU DE TOUTES LES INTERACTIONS
Jauge 0-100 par combattant, chiffre dans le code / MOTS a l'ecran (meme
regle que relation.js). Toutes les entrees du carnet reprises telles
quelles. /!\ MEME UN ECHANGE NUL S'INSCRIT dans l'histoire — zero est une
valeur, pas un oubli (banc). 12 petits echanges justes : 50 -> 86.
- LE FREIN EST UN COUT : flatter monte l'entente ET fait baisser
  `discipline` — LA STAT MORTE DU CHANTIER F RESSUSCITE, comme prevu.
  Rien n'est bride : flatter 10 fois marche (entente 100) et coute 10 fois
  (discipline 70 -> 40).
- LES PROMESSES : condition et echeance sont des DONNEES verifiees a
  chaque jour — sans ca le jeu oublierait sa parole et c'est LUI qui
  mentirait. Trahie -24 contre -8 pour un refus franc.
- LE DEPART : l'entente AMORTIT, ne bloque pas. Enorme offre = il part
  meme a entente parfaite (mais "il vient t'en parler d'abord") ; offre
  moyenne = elle protege. A entente basse : "tu l'apprends par la presse"
  + degat de reputation. ET PARFOIS IL A DEJA DECIDE (4 a 20 % selon
  l'entente, jamais nul).
- RENEGOCIATION escomptee : offre concurrente 1000 € -> il demande 1197 €
  a entente basse, 747 € a entente haute.

## dialogue.js — LE PROTOTYPE DE v2 ABSORBE, PAS JETE
Les trois approches de mma_manager_v2.html (secouer / rassurer / demander
ou il en est) et leur lecture du profil sont REPRISES TELLES QUELLES.
Ajoutes : FLATTER (avec son cout), la trace d'entente de chaque echange,
et la LASSITUDE (reparler sous 5 jours : l'effet glisse a 25 %).
/!\ AUCUNE APPROCHE N'EST BONNE DANS L'ABSOLU, prouve au banc : secouer
donne +0,10 au dur et -0,09 a l'homme au moral bas ; flatter releve un
jeune qui doute (+0,07 de forme) et RELACHE un arrogant (-0,03).

## demandes.js — PREMIERE FAMILLE : LE COMBAT (ton valide par Mael)
monter_categorie · cet_adversaire · refuser_celui_ci · striker_pas_lutter.
Chacune porte : ce que coute le OUI, ce que coute le NON, QUI la formule
(fonction de profil, PAS un tirage), et le oui-mais.
- /!\ TON CORRIGE PAR MAEL sur la montee : parler de DEFI ET DE CE QU'IL
  Y A A GAGNER, pas de confort de poids. "En dessous je bats tout le monde
  et ca ne me rapporte rien. Au-dessus, ils sont plus durs, mais c'est la
  que sont les grosses affiches et les grosses bourses. Je veux ce
  risque-la."
- /!\ LE OUI MAIS EST UN CURSEUR (Mael) : pas un bouton, un MARCHANDAGE.
  Tu glisses le nombre de victoires exigees et son contentement DIMINUE
  a mesure : 1 -> +7 · 2 -> +4 · 3 -> 0 · 4 -> -4 · 5 -> -7. A cinq, ce
  n'est plus une promesse, c'est un refus deguise et il le prend comme
  tel. L'humeur se lit EN MOTS pendant qu'on glisse ("Il fait la moue. Il
  trouve ca cher paye." ... "Il a compris que c'etait non.").
  C'est ce qui empeche le oui-mais d'etre la reponse gratuite a tout.
- "refuser_celui_ci" NE SE MARCHANDE PAS (leve si on essaie) : c'est le
  seul endroit ou LES DEUX JAUGES TIRENT EN SENS CONTRAIRE — accepter
  qu'il refuse monte l'entente (+9) et coute un refus a l'organisation.
  Le forcer declenche combat_trop_tot (-15), la pire entree : "Il accepte
  sans discuter. C'est bien ca le probleme."

## RESTE DU CHANTIER H
Six familles a ecrire sur le meme patron, ton valide : calendrier ·
preparation · argent · staff · ego · personnel. ~46 demandes.
Chaine : 22 bancs CONFORME.

## LES SEPT FAMILLES DE DEMANDES SONT LIVREES (23 demandes)
    combat 4 · calendrier 3 · preparation 4 · argent 3 · staff 3 ·
    ego 3 · personnel 3
Le patron valide sur "combat" a ete applique aux six autres. Invariants
au banc : chacune porte le cout du OUI, le cout du NON, QUI la formule
(fonction de profil, pas un tirage), et son curseur borne. 13 sont
marchandables, 10 ne le sont pas.
- /!\ CE QUI NE SE MARCHANDE PAS (leve si on essaie) : un pepin d'argent,
  un jour de travail pour payer le loyer, une blessure, un refus de
  combat, un souci de famille. Ce n'est pas une negociation, c'est un
  homme qui te parle.
- /!\ LA BLESSURE CACHEE EST LE CŒUR DU SYSTEME : il ne te l'avoue QUE si
  l'entente est bonne (>= 60). A entente basse, IL MONTE BLESSE SANS RIEN
  DIRE — le jeu produit ca tout seul, ce n'est pas une punition posee a la
  main. Et le forcer apres l'aveu : -15 et "Il ne te dira plus rien la
  prochaine fois."
- L'ARGENT PARLE EN NET, PAS EN POURCENTAGE (regle du carnet) : "j'ai paye
  le deplacement, le tien, celui du coin — et toi tu prends ton
  pourcentage sans rien risquer".
- Le SPONSOR PERSO suit le GDD : beaucoup de salles ne prennent rien, dire
  non declenche part_gardee et "il trouve ca gonfle. Il n'a pas tort."
- DEFAUT ATTRAPE PAR LE BANC : MOTS_N s'arretait a cinq, le coach disait
  "Prends 6 mois" au milieu d'une phrase en toutes lettres. Complete.
Chaine : 22 bancs CONFORME.

===========================================================================
# LE BRANCHEMENT, ETAPE 1 : LE RACCORD DES DONNEES — salle.js (banc 25)
===========================================================================

## LE PROBLEME RESOLU
Deux mondes construits en parallele et qui ne se connaissaient pas :
demo_jeu.html avec SES combattants (fiches.js) et vivier.js avec ses 4500
pros refabricables. Sans raccord, tes hommes n'existaient pour personne.

## /!\ LA REGLE D'OR : TES HOMMES SONT L'EXCEPTION PERSISTANTE
Ids NEGATIFS pour la salle, positifs pour le monde. Un homme de salle
porte `salle: true` et SA FICHE STOCKEE — jamais refabriquee, parce que
sa progression depend de tes coachs, ton materiel, ton sparring.
salle.ficheDe() est LE SEUL point d'entree pour obtenir une fiche de
combat : stock pour les tiens, hydratation datee pour le monde.

## /!\ DEFAUT SILENCIEUX TROUVE AU BRANCHEMENT (et corrige)
V.hydrater sur un id de salle rendait SILENCIEUSEMENT un inconnu
("Florian Lambert" a la place d'Okonkwo), sans lever. Meme famille que le
defaut silencieux du carnet : ce qui ne leve pas se decouvre trois
seances plus tard. DEUX GARDE-FOUS POSES :
  1. vivier.hydrater LEVE si l.salle ;
  2. cartes.resoudre AIGUILLE (fiche stockee / hydratation) sans passer
     par salle.js — pas de dependance circulaire.

## CE QUE salle.js DONNE A L'ECRAN
- inscrire / reprendreEffectif : les pros entrent au roster HEX, les
  amateurs restent dehors (rien a y faire tant qu'ils ne sont pas pros).
- avancerMonde(m, jour) : IDEMPOTENT — le monde ne rejoue jamais un jour
  vecu, et il ne tourne pas pendant que tu regardes un combat.
- classement(m, org, division) : pret a afficher, sans trou ni doublon.
- depechesDe(m, resultats) : filtre le bruit — ton org, les titres, tes
  hommes (60 depeches sur 368 combats).

## VERIFIE : LE JOUEUR EST UN COMBATTANT COMME LES AUTRES
Okonkwo inscrit combat avec SA fiche, son bilan bouge (9-2 -> 10-2), il
gagne de la notoriete et laisse une empreinte. L'orga lui fait des offres
et NE VOIT PAS SON NIVEAU (sa fiche legere ne porte pas de note).
/!\ ET IL ATTEND SON TOUR : a notoriete 0 il est 14e sur 31 welters en
priorite de matchmaking. Ce n'est pas un bug — c'est pour ca que les
OFFRES existent : le joueur ne subit pas le matchmaking, on lui propose.

## LE BUNDLE EST A JOUR
9 modules ajoutes aux RACINES *et* a la liste d'exposition (elle est
ECRITE A LA MAIN, piege : les modules etaient embarques mais absents de
MMA). Bundle : 30 modules, 362 Ko, 25 entrees dans MMA. Verifie en
simulant le navigateur : monde en 606 ms, offre et dialogue fonctionnels
depuis le bundle.

## RESTE DU BRANCHEMENT (les ECRANS)
- onglet COMBATS : cartes a venir, offres avec delai, fiche-trace
  cliquable, resultats du monde
- fiche combattant : "Chercher un combat" / "Contrat" / "Parler" sont
  encore des avenir(...)
- ecrans de dialogue et de demande (curseur avec humeur)
- classements par org et division
- relation aux orgas, en mots
- le media doit manger depechesDe() ; la pesee doit appeler
  relation.bouger(..., "pesee_loupee")
Chaine : 23 bancs CONFORME.

===========================================================================
# LE BRANCHEMENT, ETAPE 2 : L'ONGLET COMBATS EST VIVANT (09/08)
===========================================================================

## CE QUI EST BRANCHE DANS demo_jeu.html
- LE MONDE NAIT AU DEMARRAGE : demarrerMonde() cree MMA.vivier.monde(11),
  pose RELATION, et inscrit l'effectif de FICHES via
  MMA.salle.reprendreEffectif. ~600 ms pour 4502 pros.
  /!\ DIV_MONDE : le jeu ecrit "poids welter", le moteur "poids_welter".
  On CONVERTIT en un seul endroit, on ne devine pas.
- LE MONDE SUIT LE CALENDRIER DU JEU : synchroniserMonde() appele dans
  continuer(). Idempotent, ne tourne jamais tout seul.
- LES OFFRES REELLES : une seule en attente par combattant, cadence
  deterministe (~18 j), delai de reponse affiche, boutons Accepter /
  Refuser cables sur MMA.offres.repondre. L'offre affiche la bourse
  calculee, la place, la TRACE de l'adversaire (rang, bilan) et
  l'avertissement de fraicheur — jamais son niveau. Regle 7 jusqu'a
  l'ecran.
- NE PAS REPONDRE EST UNE REPONSE, MEME A L'ECRAN : l'offre expire, ca
  compte comme un refus, et le fil le dit.
- NOUVEAU BLOC "AILLEURS" : les depeches du monde (deja filtrees par
  depechesDe : ton org, les titres, tes hommes).
- Les combats acceptes remontent dans "A venir" avec leur compte a
  rebours.

## VERIFIE EN SIMULANT UN NAVIGATEUR (DOM factice, 150 jours joues)
Demarrage OK · 4502 pros · Okonkwo et Kante inscrits · 60 depeches ·
offre en cours "Idrissa Kante c. Theo Rocher (5-1), 850 EUR,
pre-prelims, expire dans 5 j" · acceptation -> combat programme.

## /!\ ENSEIGNEMENT DE LA SIMULATION, A GARDER
Apres 150 jours sans qu'AUCUNE offre soit repondue, la relation HEX
tombe a "tu es en froid avec eux". C'est le systeme qui marche : le
silence coute. MAIS ca veut dire que la cadence d'offres (~18 j par
gars) est calibree pour un joueur ATTENTIF. A rejuger en jouant : si on
peut se retrouver en froid sans l'avoir voulu, il faudra soit espacer,
soit rendre l'expiration plus visible (elle n'est aujourd'hui qu'une
ligne dans le fil).

## /!\ PIEGE DE TEST (pas un bug du jeu)
Un test qui capture OFFRES/DEPECHES par valeur ne voit rien : ces
tableaux sont REASSIGNES (filter/concat), pas mutes. Il faut des
accesseurs. Trois minutes perdues a chercher un bug inexistant.

## RESTE A BRANCHER
- Les boutons de fiche : "Chercher un combat" (MMA.offres.demander),
  "Contrat", "Parler" (MMA.dialogue) sont encore des avenir(...).
- Les ecrans de dialogue et de demande (curseur + humeur).
- Les classements par org et division (MMA.salle.classement existe).
- La relation aux orgas, lisible en mots quelque part.
- Le media doit manger DEPECHES ; la pesee doit appeler
  relation.bouger(..., "pesee_loupee").
- LE COMBAT DU JOUEUR contre un adversaire du monde : l'ecran de combat
  existe, il faut lui donner la fiche via MMA.salle.ficheDe.
Chaine : 23 bancs CONFORME.

===========================================================================
# LE BRANCHEMENT, ETAPE 3 : LES ECRANS DU CHANTIER H (09/08)
===========================================================================

## /!\ DEUXIEME INCIDENT D'INTERRUPTION DE LA JOURNEE
Meme situation qu'au reveil de seance : un tour interrompu a ECRIT LES
ECRANS sans que la conversation en garde trace. Trouves dans
demo_jeu.html sans patch tracable : gars(), ouvrirDialogue(), direA(),
contexteDe(), ouvrirDemande(), montrerDemande(), repondreDemande(),
chercherCombat(), et le cablage des boutons de fiche.
AUDIT COMPLET FAIT (regle du carnet) : aucun doublon, code coherent,
et MEILLEUR que ce que je m'appretais a ecrire — contexteDe() construit
le contexte reel du combattant, et ouvrirDemande n'affiche QU'UNE
demande a la fois, deterministe sur le jour ("un homme ne debite pas sa
liste de courses"). GARDE TEL QUEL.
LECON CONFIRMEE : apres une interruption, AUDITER LE DISQUE AVANT DE
RECODER. Deux fois dans la meme journee.

## /!\ DEFAUT REEL TROUVE PAR L'AUDIT : LES ACCENTS
demo_jeu.html indexe "Kante" AVEC accent, fiches.js SANS. La
correspondance echouait EN SILENCE a l'inscription (fiche = null) et
n'explosait qu'au PREMIER DIALOGUE, trois ecrans plus loin.
CORRIGE EN DEUX TEMPS : cleFiche() compare sans accent ni casse, ET
reprendreEffectif LEVE si un pro n'a pas de fiche — un combattant sans
fiche ne doit jamais entrer dans le monde. Deux invariants au banc 25.
Meme famille que le defaut silencieux d'hydrater : ce qui ne leve pas
se decouvre trois ecrans plus loin.

## CE QUI EST VIVANT A L'ECRAN MAINTENANT
- PARLER : les quatre approches, sans indice de qualite (aucune n'est
  bonne dans l'absolu, le jeu ne souffle pas la reponse). Verifie :
  flatter Kante rend "Ca lui plait, visiblement. Reste a voir ce qu'il
  en fera." + le cout affiche : "Il se croit un peu plus arrive qu'hier."
- CE QU'IL DEMANDE : une seule demande, tiree de son profil reel via
  contexteDe(). Verifie : Kante reclame une baisse de part, Okonkwo veut
  plus de sparring — deux hommes, deux demandes differentes.
- LE CURSEUR MARCHE A L'ECRAN. Mesure dans le navigateur simule :
    n=1 « Gagne le prochain, et on le fait. »   -> "Il accepte. C'est un marche."
    n=3 « Gagne tes trois prochains... »        -> "Il fait la moue. Il trouve ca cher paye."
    n=5 « Gagne tes cinq prochains... »         -> "Il a compris que c'etait non."
- CHERCHER UN COMBAT : cable sur MMA.offres.demander, l'offre atterrit
  dans l'onglet Combats.
Bundle 30 modules, 364 Ko. Chaine : 23 bancs CONFORME.

## RESTE A BRANCHER
- Le CONTRAT (bouton encore avenir(...)).
- Les CLASSEMENTS a l'ecran (MMA.salle.classement existe, rien ne
  l'appelle).
- La RELATION AUX ORGAS lisible quelque part, en mots.
- Le MEDIA doit manger DEPECHES ; la PESEE doit appeler
  relation.bouger(..., "pesee_loupee").
- /!\ LE COMBAT DU JOUEUR CONTRE UN ADVERSAIRE DU MONDE : c'est le
  dernier maillon manquant. L'ecran de combat existe, il faut lui passer
  la fiche via MMA.salle.ficheDe et faire remonter le resultat dans le
  monde (bilan, rang, notoriete, empreinte, relation via
  offres.apresCombat).

===========================================================================
# LA BOUCLE EST FERMEE : LE COMBAT DU JOUEUR VIT DANS LE MONDE (09/08)
===========================================================================

## /!\ TROISIEME CODE SANS PATCH TRACABLE (audite, garde)
preparerCombat portait deja l'AIGUILLAGE DES FICHES et les JETONS DE NOM
(un id numerique -> salle.ficheDe ; les noms du monde ont deux mots et le
log n'en lit qu'un). Ecrit par un tour interrompu. Audite, coherent,
garde. Trois fois dans la journee : APRES UNE INTERRUPTION, AUDITER LE
DISQUE.

## remonterDansLeMonde() — LE DERNIER MAILLON
Sans elle, un combat du joueur ne changeait RIEN au monde : le bilan
bougeait dans FICHES et c'est tout. Elle fait remonter, dans l'ordre :
- L'EMPREINTE lue dans la feuille (ce que le moteur a REELLEMENT tire) —
  c'est la matiere du scouting adverse. Sans empreinte, le combat n'a
  rien "montre" et personne ne pourra le preparer.
- L'INDISPONIBILITE par la MEME formule que les NPC (21 j + encaisse +
  suspension) : on ne se repose pas autrement parce qu'on est le joueur.
- Bilan, serie, notoriete AVEC TRANSFERT, classement (bouger), et le
  contrat qui avance.
- LA RELATION via offres.apresCombat — finish, spectacle, pesee loupee,
  tout lu dans les empreintes.

## /!\ TROIS DEFAUTS DE RACCORD TROUVES EN JOUANT (le hérité supposait
## que les deux combattants sont dans FICHES)
1. LE TRADUCTEUR LISAIT LE LOG AVEC LES IDENTIFIANTS : r.a/r.b sont des
   CLES (chaine pour la salle, NOMBRE pour le monde) ; le log ne connait
   que fa.name/fb.name. Un id numerique faisait planter pyTitle des le
   premier combat contre le monde. -> on lit par les JETONS.
2. encaisserResultat ecrivait dans FICHES[r.b] — inexistant contre le
   monde. -> tout ce qui touche l'adversaire est garde.
3. retombees() lisait FICHES[r.b].bilan. -> repli sur la fiche legere.
LECON : le code herite du prototype suppose partout que l'adversaire est
ecrit a la main. Chaque nouveau branchement doit chercher ce postulat.

## VERIFIE DE BOUT EN BOUT (navigateur simule)
    Okonkwo 9-2, noto 0, 0 empreinte
    -> "Chercher un combat" -> offre c. Mathis Renard -> acceptee
    -> combat joue round par round contre un homme DU MONDE
    -> Okonkwo bat Mathis Renard par cle de bras au R1
    -> 10-2 · noto 2,3 · 1 empreinte (92/126 sig, 5 pris, 1 KD)
    -> indisponible jusqu'au jour 23 · relation HEX "ils t'apprecient"
    -> l'adversaire passe 2-1 et se repose jusqu'au jour 35
Et : 120 jours joues + les sept onglets + dialogue + demande, sans une
erreur. Chaine : 23 bancs CONFORME.

## LA SAISON EXISTE MAINTENANT
On peut : recevoir une offre ou en demander une, lire la trace de
l'adversaire, accepter ou refuser (et le payer), jouer le combat, voir le
resultat remonter dans les classements et la relation, parler a ses
hommes, repondre a leurs demandes. LE MORCEAU QUI MANQUAIT AU CARNET
("le seul morceau qui donne une saison jouable") EST LA.

## RESTE
- Le CONTRAT du joueur (bouton encore avenir) : renegociation a
  restants=0, entente.prixPourRester existe.
- Les CLASSEMENTS a l'ecran (MMA.salle.classement pret, rien ne l'appelle).
- Le MEDIA doit manger DEPECHES ; la pesee doit appeler
  relation.bouger(..., "pesee_loupee") — aujourd'hui la penalite de poids
  passe par apresCombat, pas par la scene de pesee elle-meme.
- LE PROCHAIN VRAI CHANTIER RESTE D (cage geometrie) : 389 points par
  round pour un lutteur, et il debloque J et la saisie de jambe.

## LES TROIS CABLAGES (09/08, fin de seance)
- LA PESEE PARLE A L'ORGANISATION AU MOMENT OU CA SE PASSE :
  relation.bouger(..., "pesee_loupee") appele DANS pesee(), plus apres le
  combat. /!\ Et peseeLoupee force a false dans remonterDansLeMonde :
  sinon la meme faute etait facturee DEUX FOIS.
- LE MEDIA MANGE LE MONDE : nouveau bloc "Le sport ailleurs" dans
  l'onglet Media, nourri par DEPECHES.
- LES CLASSEMENTS : bloc dans l'onglet Combats + ecran top 15
  (ouvrirClassement). /!\ ON N'AFFICHE QUE LES DIVISIONS OU TU AS
  QUELQU'UN — 16 orgs x 9 divisions = 144 classements, en lister la
  totalite serait du bruit.

## /!\ CONSTAT GRAVE POUR LA PROCHAINE SEANCE : LE CLASSEMENT N'EST PAS
## CREDIBLE A L'ECRAN
Mesure, HEX poids welter apres 200 jours :
    #1 1-0 · #2 2-2 · #3 3-6 · #4 0-6 · #5 0-3 · #6 0-5
Deux classes du top 8 ont 4 defaites de plus que de victoires. UN JOUEUR
QUI VOIT CA PENSE QUE LE JEU EST CASSE, et il n'a pas tort.
CAUSE : bouger() ne retrograde que d'un ou deux crans par defaite, et a
~1,5 combat/an un homme mal classe met des ANNEES a descendre. IL
N'EXISTE AUCUNE SORTIE DU TOP 15 PAR ACCUMULATION DE DEFAITES.
/!\ NE PAS CORRIGER A L'AVEUGLE : c'est un arbitrage de conception pour
Mael — retrogradation plus dure ? sortie du classement apres N defaites ?
les deux ? A trancher avant de toucher a classement.js (fichier deja
couvert par le banc 14).
NOTE : le classement de naissance du monde vient de la SELECTION (note),
pas d'un palmares — donc des hommes mal classes demarrent haut et n'en
descendent jamais assez vite. Le probleme est a la jonction des deux.

## A FAIRE EN JOUANT (Mael)
Ouvrir demo_jeu.html dans un navigateur. Beaucoup a ete branche en une
fois, teste dans un DOM factice qui ne clique sur rien. Le navigateur
attrape ce qu'aucun banc n'attrape.
Chaine : 23 bancs CONFORME.

===========================================================================
# CINQ DEFAUTS TROUVES PAR MAEL EN JOUANT SUR TELEPHONE (09/08)
===========================================================================
/!\ CONFIRMATION DE LA REGLE DU CARNET : cinq defauts en une session de
jeu, dont AUCUN n'avait ete vu par les 23 bancs ni par le navigateur
simule. Le DOM factice ne clique sur rien.

1. LE BOUTON DU JOUR DE COMBAT NE LANCAIT PAS LE COMBAT. continuer()
   affichait "Combat !" mais ne faisait que DEFILER vers la zone
   d'attente — sur telephone on ne voit meme pas qu'on a bouge, le jeu
   semblait casse. CORRIGE : si le blocage porte une action, on la
   declenche.
2. FIN DE COMBAT ILLISIBLE. La carte de fin etait posee DANS la scene, en
   semi-transparent : le bandeau de stats, le commentaire et les boutons
   de lecture restaient visibles PAR-DESSOUS, tous les textes se
   croisaient (capture a l'appui). CORRIGE dans le gabarit : fond opaque,
   position fixe, z-index 50 — une seule fenetre resultat / stats /
   revoir.
3. PAS DE SCORING EN DIRECT. Ajoute : une ligne de cartes sous l'horloge,
   round par round + total. /!\ LES CARTES SONT LUES DANS LE LOG
   ("→ round pour X (10-9, critere)") — le moteur a juge, l'ecran ne
   rejuge rien (regle 7). Et on n'affiche QUE les rounds termines :
   montrer le round en cours dirait qui gagne avant la cloche.
4. DOUBLON D'OFFRE, AVEC DEUX ADVERSAIRES DIFFERENTS. L'offre scriptee
   (Kante c. Vasile) s'affichait sous l'offre reelle (Kante c. Berthier)
   dans le meme bloc : on croyait a deux combats. Retiree de l'onglet
   Combats — elle se repond depuis la zone d'attente, ou elle est deja.
5. LIBELLE DU FORFAIT. "les gens d'ici paient environ 553 €" -> refuse
   par Mael. Nouveau : "recommandé 550 € * · Correct / changement pris en
   compte a la prochaine souscription", avec en bas du bloc :
   "* recommandation basée sur la réputation de la salle, le coach et
   l'équipement."

AUSSI CORRIGE AU PASSAGE : donneesEcran() lisait FICHES[r.b] — l'ecran
aurait plante sur un combat contre le monde. Repli sur r.nomA/r.nomB.

Chaine : 23 bancs CONFORME. Apercu autonome v94 (528 Ko).

## LES STATS ET LES ORGANISATIONS A L'ECRAN (Mael, en jouant)
- blocStats(id) dans la fiche : les HUIT AXES de profil.lire() — les
  memes que la comparaison d'avant-combat, on ne recalcule rien. Affiches
  EN MOTS ("solide", "tres fort", "perfectible") avec une barre, jamais
  en chiffre.
  /!\ POUR TES HOMMES SEULEMENT, amateurs compris : tu es dans la salle
  avec eux tous les jours. Un adversaire garde sa trace et ses
  estimations. Un adherent loisir : "Pas encore evalue — il faut le voir
  travailler."
  /!\ ET JAMAIS LE POTENTIEL : "Jusqu'ou il peut aller, personne ne le
  sait — demande a son coach."
- ouvrirOrgas() : les 16 promotions triees par portee, avec bourse de
  debutant, pays, et OU TU EN ES avec elles (en mots). Acces depuis
  l'onglet Combats.
- PIEGE : profil.lire() rend des NOMBRES, les libelles vivent a cote dans
  profil.LIBELLES.
- VERIFIE, PAS UN BUG : la GFL paie plus a l'entree que l'AFC (15 000 €
  contre 12 000) — mais le plafond AFC est dix fois plus haut (champion
  783 000 € contre 83 000). C'est le rapport UFC / promotion rivale, et
  c'est dans la table depuis le debut.
Chaine : 23 bancs CONFORME. Apercu v95.

## /!\ LES AMATEURS N'EXISTAIENT POUR PERSONNE (Mael, en jouant)
SYMPTOME : "Parler" ouvrait un PANNEAU VIDE sur les amateurs — en
silence, ce qui est pire qu'une erreur. TROIS CAUSES EMPILEES :
1. reprendreEffectif() ECARTAIT les amateurs ("plus tard"). Or ils sont
   de ta salle, ils progressent, on leur parle. CORRIGE : ils entrent
   dans MESGARS mais dans le roster d'AUCUNE organisation (org: null,
   amateur: true) — ils auront la leur en passant pro.
2. SUR QUINZE AMATEURS, UN SEUL AVAIT UNE FICHE MOTEUR. Les autres
   n'etaient que des noms : rien a faire progresser, rien a evaluer.
   CORRIGE : salle.fabriquerFicheSalle() la fabrique depuis ce que le jeu
   declare (age, archetype, categorie), dans un flux RNG prive seme par
   sa cle — meme homme a chaque partie, flux partage intact. Une fois
   fabriquee elle est STOCKEE : sa progression depend de TES coachs.
   /!\ ON NE LEVE PLUS a l'inscription : un homme de la salle a TOUJOURS
   des stats, ecrites ou fabriquees.
3. LES ADHERENTS GENERES N'ONT PAS DE CATEGORIE ("—"). Un homme a
   forcement un poids : on lui en attribue une, deterministe sur sa cle
   (plume a welter, le gros du vivier).
RESULTAT : 17 hommes suivis par la salle, parler + stats sur TOUS.

## /!\ DEUX PIEGES DE METHODE DANS LA MEME HEURE
- LE BUNDLE N'EST PAS REGENERE TOUT SEUL. J'ai modifie salle.js et teste
  sans relancer bundler.js : le test montrait l'ancien comportement.
  APRES TOUTE MODIFICATION D'UN MODULE, `node js/bundler.js`.
- TEST FAUSSE PAR LE DOM FACTICE : l'element #fiche factice GARDE son
  innerHTML, donc un ouvrirDialogue() qui sort en silence laissait le
  contenu du precedent — le test annoncait "17 OK" alors que 2
  fonctionnaient. VIDER L'ELEMENT AVANT CHAQUE APPEL.
Chaine : 23 bancs CONFORME. Apercu v96.

## /!\ ET LE BANC 25 A DU CHANGER AVEC LA REGLE
Il verifiait "l'amateur reste dehors" — regle abandonnee. Reecrit : les
pros au roster, les amateurs suivis SANS organisation, et un amateur a
une vraie fiche moteur. Le banc qui refusait un homme sans fiche verifie
maintenant qu'il en recoit une FABRIQUEE, deux fois identique.
/!\ UN BANC QUI TOMBE APRES UN CHANGEMENT DE REGLE N'EST PAS FORCEMENT
UNE REGRESSION : ici il disait vrai sur l'ancienne regle. Mais on ne le
change QU'APRES avoir verifie que la nouvelle regle est bien celle qu'on
veut — jamais pour faire passer la chaine.

## /!\ LA DEMANDE SE TIRAIT A VOLONTE (Mael, en jouant, capture a l'appui)
SYMPTOME : le bouton "Ce qu'il demande" REGENERAIT une demande a chaque
clic. On pouvait interroger un homme a l'infini, repondre a l'infini, et
le fil se remplissait de DIZAINES de fois la meme ligne le meme jour.
C'ETAIT UN BUG *ET* UNE ERREUR DE CONCEPTION. Mael : "ca devrait etre une
bulle a l'accueil, il vient me trouver, comme celui qui veut passer pro."
TROIS CORRECTIONS :
1. UNE DEMANDE EST UN OBJET POSE (l.demandeEnCours), pas un tirage a la
   demande. Le bouton de fiche n'OUVRE que ce qui est deja pose ; sinon
   il dit "il n'a rien a te demander en ce moment".
2. C'EST LUI QUI VIENT TE VOIR : poserDemandes() tourne une fois par
   jour ; la demande s'affiche a l'accueil (zone-attend) comme une bulle,
   avec le debut de sa phrase et un bouton "L'ecouter".
   Cadence : premiere apres ~8-28 j, puis ~25-45 j. Et ON NE REPETE PAS
   ce qu'il vient de demander (l.dejaDemande).
3. REPONDRE CONSOMME LA DEMANDE, et une garde refuse de rejouer une
   reponse (double clic, retour arriere) — sinon l'entente etait
   re-facturee. Mesure : 20 clics a vide -> 0 ecran ; 10 reponses
   repetees -> 1 seule comptee.
/!\ BUG DECOUVERT DANS LA FOULEE : le bloc classements appelait
salle.classement(m, l.org, ...) pour CHAQUE homme suivi — or un amateur
n'a pas d'organisation (org null) depuis leur entree dans MESGARS. Ca
plantait le rendu de l'onglet Combats. Filtre pose.
A SURVEILLER EN JOUANT : apres 120 jours, 11 demandes en attente sur 17
hommes. La bulle n'en montre qu'une a la fois, donc ce n'est pas
etouffant a l'ecran — mais si ca s'accumule sans jamais se vider, il
faudra une peremption (une demande sans reponse finit par tomber, comme
une offre).
Chaine : 23 bancs CONFORME. Apercu v97.

## L'OFFRE DE COMBAT POPE A L'ACCUEIL (Mael, en jouant)
"L'offre n'est pas visible, ca devrait pop en gros quand t'en as une."
Elle etait uniquement dans l'onglet Combats — or ELLE EXPIRE : ne pas la
voir, c'est la refuser sans le savoir.
Desormais dans la bulle d'accueil (zone-attend), ET EN PRIORITE SUR UNE
DEMANDE : une demande peut attendre, pas une offre. La plus proche de
l'expiration passe en premier ; le delai vire au rouge sous 2 jours.
La bulle porte tout ce qu'il faut pour trancher sans naviguer :
adversaire, rang, bilan, place sur la carte, bourse, duree de camp, et
l'avertissement de fraicheur s'il y en a un. Accepter / Refuser sur
place.
Mesure : "HEX — offre de combat · reponse sous 7 j / Idrissa Kante c.
Hugo Berthier · 0-0 / pre prelims · 1 020 € · camp 42 j". Repondue, la
bulle se vide et laisse la place a la demande suivante.
Chaine : 23 bancs CONFORME. Apercu v98.

===========================================================================
# LE CONTRAT DU JOUEUR — contrats.js (banc 26)
===========================================================================
Les regles etaient DEJA GRAVEES au carnet, on ne les a pas reinventees :
trois combats · aucune sortie avant la fin sauf rachat rare · la ceinture
rouvre le contrat · toutes les orgas evaluent a la fin, sur LA TRACE ·
le prix de sa fidelite est escompte par l'entente · l'entente amortit le
depart, elle ne le bloque pas.

## CE QUE LE MODULE FAIT
- etat(l) : en_cours / dernier / libre / ROUVERT (champion).
- pretendants(m,l,jour) : qui veut de lui. Memes trois conditions qu'une
  signature NPC — radar (portee x 0,4), serieRequise, une place.
  INVARIANT AU BANC : deux hommes de MEME TRACE et de niveaux opposes
  recoivent les MEMES propositions. Elles ne voient pas le niveau.
- prixDeSaFidelite : ce qu'il exige pour rester (entente.prixPourRester).
  Mesure : en froid 22 825 € · en confiance 14 557 €, pour un concurrent
  a 19 500 €.
- sonAvis : IL A SON MOT A DIRE. Le joueur propose, le combattant
  tranche.
- signer : sort du roster, entre dans l'autre, ET DECLASSE — un rang ne
  se transporte pas d'une organisation a l'autre.
- rachat : reserve au phenomene (serie >= 5 ET notoriete >= 55), et rare
  meme la (12 %).

## /!\ DEFAUT REEL TROUVE PAR LE BANC : L'ECHELLE DE LA TENTATION
Passer des bourses BRUTES a entente.tentation() rendait l'entente
insignifiante — 60 points d'entente ne pesaient rien face a 15 000 €
d'ecart, donc TOUT LE MONDE partait toujours. On compare desormais EN
POURCENTAGE : l'entente absorbe jusqu'a ~60 % d'ecart de salaire.
Mesure : a +35 % ailleurs, la confiance le garde et le froid le fait
partir ; a +1400 % (nationale contre internationale), MEME A ENTENTE
PARFAITE IL PART — et c'est la regle, pas un defaut.
/!\ ET MON PREMIER BANC ETAIT MAL POSE : il exigeait qu'une entente
parfaite retienne un homme devant un cheque cinq fois plus gros. Le banc
disait vrai, c'est le test qui mentait.

## A L'ECRAN
Le bouton "Contrat" ouvre trois ecrans selon l'etat : sous contrat (ce
qui reste, la bourse, "personne ne peut le prendre"), libre (qui se
positionne, ce qu'il exige pour rester), rouvert (champion). Signer se
fait sur place. S'il refuse, il le dit — et s'il avait deja donne sa
parole ailleurs, IL QUITTE LA SALLE.
Chaine : 24 bancs CONFORME. Apercu v99.

## GAGNER CHEZ TOI, C'EST SE SENTIR BIEN CHEZ TOI (Mael, 09/08)
L'entree victoire_bon_camp EXISTAIT AU CARNET ET N'ETAIT JAMAIS APPELEE.
Branchee dans remonterDansLeMonde. Elle BOUCLE avec le contrat : un homme
qui gagne sous ta direction demande moins cher pour rester
(entente.prixPourRester).
/!\ ON NE PUNIT PAS LA DEFAITE ICI : perdre n'abime pas la relation par
soi-meme. Ce qui l'abime, c'est de l'ENGUEULER apres (choix du joueur) ou
de l'avoir envoye au casse-pipe (combat_trop_tot).
/!\ RENDEMENTS DECROISSANTS, POSES APRES MESURE : a +8 par victoire,
QUATRE combats gagnes faisaient passer de "correct, sans plus" a "il te
suivrait n'importe ou". Trop vite pour une relation. On descend d'entree a
mesure que la relation monte (victoire_bon_camp sous 62 · echange_juste
sous 84 · echange_neutre au-dela) plutot que d'inventer un troisieme
bareme.
RESULTAT MESURE (6 victoires d'affilee) : 50 -> 61 -> 72 -> 78 -> 84 ->
84 -> 84. LES VICTOIRES SEULES PLAFONNENT A 84. Pour aller au-dela il
faut les vrais gestes du carnet — baisser ta part, le defendre
publiquement, lui decrocher l'affiche qu'il voulait. GAGNER N'ACHETE PAS
TOUT, et c'est voulu.
Effet sur le contrat, mesure : il exige 15 694 € pour rester au lieu de
22 308 € s'il etait en froid (concurrent a 19 500 €).
Chaine : 24 bancs CONFORME. Apercu v100.

## LA SERIE DE DEFAITES ABIME LA RELATION (Mael, 09/08)
"Plein de combattants changent de coach apres des defaites." Deux entrees
ajoutees a entente.js : serie_defaites -9 (deux de rang) et serie_noire
-16 (trois de rang). Branchees dans remonterDansLeMonde, lues sur la
serie REELLE de l.vie.derniers, avec une ligne au fil : "Deuxieme defaite
de suite pour X. Le doute s'installe." / "Il ne te regarde plus pareil."
/!\ IL N'EXISTE TOUJOURS PAS D'ENTREE "defaite" DANS entente.js, ET
C'EST VOULU : une defaite SEULE n'abime pas la relation avec ton homme
(elle coute cote organisation, dans relation.js). Ce qui l'abime, c'est
la SERIE, ou le fait de l'engueuler — et les deux se cumulent : serie
seule 41, serie + engueulade 30. C'est le joueur qui aggrave.
C'est la meme mecanique que la coupe des orgas, vue de l'interieur de la
salle : un homme qui perd trois fois ne se demande pas seulement s'il est
fini, il se demande si le probleme n'est pas toi.
/!\ PIEGE : mon patch avait DEJA ete applique avant que je le croie
echoue — j'ai failli poser le bloc deux fois. Verifier avec grep avant de
re-patcher, pas seulement l'assertion.
Chaine : 24 bancs CONFORME. Apercu v101.

===========================================================================
# HUIT DEFAUTS TROUVES PAR MAEL EN JOUANT (09/08, 2e session telephone)
===========================================================================
1. BILAN 2-0 MAIS UNE SEULE LIGNE D'HISTORIQUE. La generation des
   amateurs ecrivait UNE ligne en dur quel que soit le bilan tire.
   fabriquerHistoriqueAmateur() fabrique autant de lignes que de combats.
   Et pour les pros ecrits a la main (5 lignes pour un 9-2), le titre dit
   maintenant "Ses 5 derniers combats" au lieu de "Historique".
2. LES NOMS DU TOP 15 N'ETAIENT PAS CLIQUABLES. ouvrirClasse(id) ouvre
   n'importe quel homme du monde — /!\ SA TRACE SEULEMENT (bilan, serie,
   notoriete, ses dernieres empreintes), jamais ses notes. C'est la porte
   d'entree du scouting.
3. LES STATS EN APPRECIATIONS -> EN NOTES (demande de Mael). Sur SES
   hommes on affiche le chiffre. /!\ LES MOTS RESTENT POUR CE QU'ON NE
   MESURE PAS : le potentiel et l'entente.
4. BOUTON "DETAIL PAR DOMAINE" : ouvrirDetailStats() affiche TOUTES les
   stats du moteur, telles quelles, par domaine (frappe, lutte, sol,
   physique, mental), avec des libelles francais.
5. LE BUDGET EN BOUTIQUE : tresorerie + sorties mensuelles (loyer,
   staff) en tete d'onglet. On n'achete pas sans savoir ce qu'on a.
6. LES BOUTONS AMATEUR ETAIENT TOUS MORTS (3 avenir() sur 4). Cables :
   PASSER PRO (seuil de niveau honnete, licence 280 €, entre au roster
   HEX avec un contrat de 3 combats, arrete de cotiser) et INVITER AU
   SPARRING PRO (il progresse, il prend des coups, l'entente monte).
7. L'EVENEMENT "VISITE D'UN POIDS PLUME" NE FAISAIT RIEN. C'etait une
   ligne de calendrier sans handler. Desormais un VRAI espoir sort du
   vivier amateur du monde (vraies stats, vrai age, vrai bilan) et une
   bulle te demande si tu le prends. Mesure : "Kevin Rocher, 16 ans, 0-0"
   -> accepte -> effectif 14 -> 15.
   /!\ UN EVENEMENT QUI NE FAIT RIEN N'EST PAS UN EVENEMENT.
8. L'ENTENTE N'ETAIT AFFICHEE NULLE PART, et la fin de dialogue ne disait
   pas ce qu'on avait gagne. blocEntente() sur la fiche (en mots + nombre
   d'echanges) et le dialogue conclut TOUJOURS : "Ça vous a rapproches" /
   "eloignes" / "Ça n'a rien change entre vous" — un echange nul se dit
   aussi, c'est une valeur, pas un oubli.
Chaine : 24 bancs CONFORME. Apercu v102.

## /!\ DECOUVERTE MAJEURE : L'ENTRAINEMENT NE TOUCHAIT AUCUNE STAT
Mael : "on voit combien il a progresse mais pas OU". En cherchant, on a
trouve la vraie cause : le gain d'une seance (`g`) etait un NOMBRE
ABSTRAIT pousse dans gains7/total7 et JAMAIS applique a la fiche moteur.
Personne ne progressait reellement — donc "ou" ne pouvait pas exister.
CORRIGE : appliquerTravail(cle, famille, gain) verse le gain sur les
stats du DOMAINE TRAVAILLE.
- Table TRAVAIL : striking / jjb / mma / physique -> les stats qu'elles
  touchent. /!\ UNE SEANCE DE JJB N'AMELIORE PAS LE JAB. C'est ce qui
  rend le choix des seances signifiant.
- 2 a 3 stats par seance, tirees du jour : le travail se voit ailleurs
  d'une fois sur l'autre.
- RENDEMENTS DECROISSANTS PRES DU PLAFOND (marge sur 96) : sans ca tout
  le monde finirait a 99.
- l.progres garde le cumul par stat depuis l'arrivee.
MESURE (Traore, 40 jours) : jab 52 -> 52,5 · passage de garde 64 -> 65,6
· cardio 62 -> 62,3 · 23 stats ont bouge.

## LA PROGRESSION EST VISIBLE, ET PAR AXE (Mael)
- CHAQUE AXE EST CLIQUABLE (chevron) : il ouvre EXACTEMENT les stats qui
  le composent. /!\ AXE_STATS DOIT SUIVRE profil.lire() : si profil.js
  change, cette table change avec, sinon l'ecran raconterait autre chose
  que le calcul.
- Le gain s'affiche en vert a cote de l'axe (+1,1) ET par stat dans le
  detail (Jab +0,5 -> 52,5).
- Bouton "Tout voir" pour revenir au detail complet.
- Notes ARRONDIES a l'affichage : depuis que les stats bougent, certaines
  sortent avec des decimales.
Chaine : 24 bancs CONFORME. Apercu v103.

## TROIS DEFAUTS DE PLUS (Mael, en jouant, 09/08)
1. /!\ LES BOUTONS DE FIN DE COMBAT ETAIENT MORTS — ET C'EST MOI QUI
   L'AVAIS CASSE deux heures plus tot. En passant .fin a z-index 50 pour
   la rendre lisible, j'ai fait passer la FEUILLE DE STATS (z-index 10)
   DERRIERE elle : elle s'ouvrait, invisible, et le bouton semblait mort.
   .stats passe a z-index 60, position fixed, fond opaque.
   LECON : une correction d'empilement doit etre verifiee sur TOUTES les
   couches, pas seulement celle qu'on repare.
2. LA LISTE DES PROS ETAIT ECRITE EN DUR (["Okonkwo","Kanté"]) : un
   amateur passe pro n'apparaissait JAMAIS. Elle se lit maintenant dans
   FICHES (gr === "pro"). Mesure : 3 pros affiches apres un passage.
3. PASSER PRO NE DECLENCHAIT AUCUNE NEGOCIATION : la fonction signait
   elle-meme un contrat de 3 combats. Corrige — il devient pro ET LIBRE,
   et l'ecran de contrat s'ouvre dans la foulee. C'est a toi de lui
   negocier son premier contrat.
   /!\ ET UN BUG REVELE PAR LA : contrats.signer() n'ajoutait au roster
   QUE si l'organisation changeait. Un homme tout juste pro portait deja
   le nom de sa nationale sans y etre inscrit — il signait dans le vide.
   La presence au roster est desormais garantie dans tous les cas.
Chaine : 24 bancs CONFORME. Apercu v104.

## /!\ REJOINDRE LA SALLE EST DESORMAIS UN SEUL GESTE (Mael, 09/08)
"Faut vraiment que chaque personne qui rejoint la salle soit
automatiquement dans l'equipe et apparaisse."
CAUSE : une arrivee demandait TROIS inscriptions separees — FICHES pour
l'affichage, EFFECTIF pour l'entrainement, MESGARS pour le monde — et il
en manquait toujours une. L'espoir recrute a la visite n'entrait ni dans
EFFECTIF ni nulle part.
CORRIGE : rejoindreLaSalle(cle, meta) fait les trois. TOUTE ARRIVEE PASSE
PAR LA. Mesure : recrutement de Kevin Rocher -> FICHES 42->43, EFFECTIF
38->39, MESGARS 38->39, visible dans l'onglet Effectif, stats sur sa
fiche.

## ET LES ADHERENTS LOISIR ENTRENT AUSSI DANS LE MONDE
Symptome signale : "sur la page d'accueil il est marque que certains
prennent des stats, mais sur leur profil ca n'apparait pas toujours."
CAUSE : seuls pros et amateurs etaient dans MESGARS. Les LOISIR n'avaient
donc ni fiche moteur ni progression appliquee — le rapport du jour
annoncait un gain qui n'existait nulle part.
CORRIGE : salle.reprendreEffectif accepte les trois groupes ; seuls les
PROS entrent au roster d'une organisation. 38 membres, 38 suivis.
/!\ ILS ONT UN CORPS, ILS PROGRESSENT, ON PEUT LEUR PARLER — et un jour
l'un d'eux surprendra tout le monde au sparring (c'est deja l'histoire de
Bui dans la demo).
/!\ PIEGE DE TEST : ma verification cherchait le nom dans les 120
premiers caracteres d'une liste TRIEE PAR PROGRESSION — un nouveau arrive
dernier. Il etait bien la. Chercher dans la chaine ENTIERE.
Chaine : 24 bancs CONFORME. Apercu v105.

===========================================================================
# /!\ DEUX CONTRATS, PAS UN — CORRECTION DE FOND (Mael, 09/08)
===========================================================================
J'avais FUSIONNE DEUX CHOSES QUI N'ONT RIEN A VOIR. Mael : "il y a un
contrat entre moi et le combattant — nombre de combats, ma part — et un
pour l'orga. Et d'ailleurs c'est MOI qui devrais lui trouver une orga,
avec des % de reussite CACHES, et parfois me faire approcher par des
orgas pour signer mes combattants."

## L'ORDRE DU JEU, DESORMAIS
   il passe pro -> ON NEGOCIE LE CONTRAT DE SALLE -> je lui trouve une
   organisation -> il peut combattre.

## 1. LE CONTRAT DE SALLE (entre toi et lui)
- Curseur de PART (5 a 30 %, defaut 20) + nombre de combats (2 a 5).
- avisSurPart() : sa reaction sort de L'ENTENTE et de ce que tu prends,
  pas d'un tirage. Ce qu'il tolere = 20 % ± l'entente. Un contrat long se
  paie aussi (chaque combat au-dela de 3 durcit).
- /!\ UN REFUS INDIQUE LA SORTIE : "il ne descend pas en dessous de 80 %
  pour lui" et le curseur se replace sur ce qu'il accepterait. Un refus
  qui ne dit pas le prix n'est pas une negociation, c'est un mur.
- Mesure : 15 % "il n'en revient pas" · 20 % "ça lui va" · 25 % "cher,
  mais il signe" · 30 % REFUS, il propose 22 %.
- TANT QU'IL N'A PAS SIGNE AVEC LA SALLE, IL NE COMBAT POUR PERSONNE.

## 2. LE DEMARCHAGE D'ORGANISATION (c'est toi qui vas les voir)
- chanceDe(m,l,org) : radar, serie, ratio victoires, place au roster,
  portee de l'org. /!\ JAMAIS AFFICHEE. L'ecran ne montre que
  lireChance() : "ils devraient dire oui" / "ça peut passer" / "c'est
  loin d'être gagné" / "autant dire non".
- demarcher() TIRE la reponse. Un dossier envoye ne se renvoie pas.
- Mesure (debutant 3-0, notoriete 0) : HEX "ça peut passer", AFC "autant
  dire non". Devenu connu et en serie de 6 : HEX/TRI/SOK "ils devraient
  dire oui", GFL/AFC "ça peut passer".
- Verifie : meme au tirage favorable, TRI et SOK refusent un debutant.
  Seule HEX le prend. La hierarchie tient.
- approche(m,l,jour) : UNE ORGANISATION T'APPROCHE (10 %, et seulement
  s'il est deja vu). PAS ENCORE BRANCHEE AU FIL — a faire.
- /!\ ON NE LUI COLLE PLUS UNE ORGANISATION D'OFFICE : l'ecran affichait
  "HEX · libre de tout engagement", ce qui ne veut rien dire.

## LES NOMS DU MONDE SONT CLIQUABLES
lienMonde(id, nom) ouvre n'importe quel combattant du monde par son
identifiant (sa TRACE, jamais ses stats). Pose sur les offres, la bulle
d'accueil et les combats a venir.

## RESTE
- Brancher contrats.approche() au fil des jours (une orga te contacte).
- La part de la salle doit PRELEVER sur les bourses a l'encaissement.
- Le contrat de salle doit se decompter et se renegocier a zero.
Chaine : 24 bancs CONFORME. Apercu v106.

## DEUX BUGS GRAVES TROUVES EN JOUANT (Mael, 09/08)
1. /!\ LE COMBAT ACCEPTE N'ARRIVAIT JAMAIS. repondreOffre posait l'offre
   sur le combattant et RIEN D'AUTRE : aucune echeance au calendrier,
   donc aucun jour J. Le joueur acceptait, attendait, et recevait
   d'autres propositions.
   CORRIGE : accepter POSE UNE ECHEANCE (id "combat_<cle>") a la date de
   la carte, et le jour J prepare le combat + bloque la journee, comme le
   combat scripte. Mesure : offre au jour 42 -> le combat se lance au
   jour 42.
2. /!\ LA VIE DU MONDE MANGEAIT LES HOMMES DE LA SALLE. finsDeContrat()
   traitait le roster ENTIER : elle pouvait couper un homme du joueur, le
   faire signer ailleurs ou le mettre a la retraite DANS SON DOS. D'ou
   "je signe un gars, il passe dans pros, et apres quelques jours il
   disparait".
   CORRIGE : `if (l.salle) continue;` dans finsDeContrat, et le nouveau
   sang ne peut plus recruter un homme du joueur.
   /!\ LA FRONTIERE EST NETTE : le matchmaking apparie les hommes de la
   salle comme tout le monde (c'est voulu — ils vivent dans le meme
   monde), mais LEURS CONTRATS APPARTIENNENT AU JOUEUR. Une organisation
   ne decide jamais a sa place.
   Mesure : 300 jours joues, effectif 38 -> 38, zero organisation changee
   dans le dos du joueur.
Chaine : 24 bancs CONFORME. Apercu v107.

## LES NOMS CLIQUABLES — PASSE SYSTEMATIQUE (Mael, 09/08)
Reponse honnete a "tu as regle tous les noms cliquables ?" : NON, il n'y
en avait que quatre. Passe complete faite.
- salle.depechesDe() rend desormais LES IDS (a, b, vainqueur, noms,
  detail) et plus seulement une phrase : sans eux l'ecran ne PEUT PAS
  rendre un nom cliquable. depecheHTML() recompose la ligne avec les
  deux noms lies.
- Trois helpers, un par nature d'homme :
    lien(cle)       -> un homme de FICHES (fiche complete)
    lienGars(cle)   -> un homme de MA salle (fiche complete)
    lienMonde(id,n) -> n'importe qui dans le monde (SA TRACE seulement)
- Poses sur : depeches (onglet Combats et Media), offres, bulle
  d'accueil, combats a venir, resultats, fil du jour, echeances de
  combat, lignes d'entente et de serie de defaites.
MESURE PAR ZONE : cb-monde 24 liens · m-monde 16 · zone-hier 9 ·
cb-resultats 6 · cb-offres 1 · zone-attend 1.
Zones sans lien, VERIFIEES ET NORMALES : cb-avenir (vide quand rien n'est
programme), m-fil (publications de la salle, pas de noms),
cb-classements (la carte ENTIERE est cliquable et ouvre le top 15, ou
chaque nom est un lien).
Chaine : 24 bancs CONFORME. Apercu v108.

## /!\ POURQUOI LES COMBATS N'ARRIVAIENT TOUJOURS PAS
preparerCombat() aiguillait sur "nombre = monde, chaine = fiches.js". Or
un homme de LA SALLE porte une CHAINE mais n'est pas forcement dans
fiches.js : "Kanté" s'y ecrit "Kante", et un amateur genere ou recrute
n'y est JAMAIS. Le jour du combat levait "fiche inconnue" et la journee
ne se debloquait pas.
CORRIGE : un homme de MESGARS passe par salle.ficheDe (sa fiche stockee).
Mesure : offre recue jour 4 -> combat jour 46, "Kanté c. Hugo Berthier",
la journee se bloque et le combat se lance.

## LES DEMANDES REGARDENT ENFIN LA SITUATION REELLE (Mael, 09/08)
- /!\ `amateur` ETAIT CODE EN DUR A false dans contexteDe() : un amateur
  passait pour un pro et pouvait TOUT demander — d'ou "ils veulent leur
  pote dans leur coin" alors qu'ils n'ont pas de combat.
- LES AMATEURS NE PARLENT QUE DE DEUX CHOSES (AMATEUR_PEUT) : passer pro,
  ou un sparring avec les pros pour montrer de quoi ils sont capables.
  Nouvelle demande sparring_avec_pros (famille amateur, 8e famille).
  "Moi je gere les pros" — le reste ne les concerne pas.
- MONTER DE CATEGORIE EST UNE AMBITION DE CHAMPION : plus deux victoires
  et ca part. Desormais champion, ou top 3 en serie de 3. "C'est quand
  t'es champion que tu peux te permettre de viser la double ceinture."
- LE COIN ET LE DEPLACEMENT exigent ctx.aUnCombat : on ne discute pas de
  qui monte les marches quand aucune date n'est posee.
- CADENCE : premiere demande apres 20-70 j (contre 8-28), puis 60-120 j
  (contre 25-45). ET UNE SEULE DEMANDE EN ATTENTE DANS TOUTE LA SALLE :
  avec 38 membres elles arrivaient en paquet.
- OFFRES : 30 jours de delai apres une offre pour le meme homme ("j'ai
  recu deux offres pour Kante a deux jours d'intervalle").

## ET LE BANC A DU SUIVRE LA REGLE
Il verifiait qu'un agressif en serie de 2 demande a monter — ancienne
regle, corrigee par Mael. Reecrit : seul un champion en parle. Nouvel
invariant : un amateur ne demande QUE ce qu'AMATEUR_PEUT autorise.
Chaine : 24 bancs CONFORME. Apercu v109.

## /!\ UNE SEULE SOURCE DE VERITE POUR LE GROUPE (Mael, 09/08)
"Je ne peux pas avoir 3 pros dans Salle et 2 dans Effectif."
CAUSE : EFFECTIF gardait SA PROPRE COPIE de `gr`, figee a la creation.
FICHES changeait au passage pro, EFFECTIF non — les deux ecrans lisaient
deux verites differentes.
CORRIGE : l'entree d'EFFECTIF n'a plus de champ `gr` ; elle expose un
ACCESSEUR qui lit FICHES. Toute la mecanique existante (filtres,
compteurs, presence aux seances, cotisants, frais) continue de lire
f.gr — mais il n'y a plus qu'une verite derriere.
Mesure : passage pro -> Salle 2->3, Effectif 2->3, FICHES 2->3, ensemble.
/!\ REGLE GENERALE A RETENIR POUR LA SUITE : une donnee qui existe en
deux exemplaires finit TOUJOURS par diverger. Le carnet en a maintenant
trois exemples le meme jour — le groupe, la liste des pros ecrite en dur,
et les trois inscriptions separees pour rejoindre la salle.
Chaine : 24 bancs CONFORME. Apercu v110.

===========================================================================
# /!\ "ON DIRAIT QUE LE JEU FAIT MORT" — LES EFFETS N'EXISTAIENT PAS
===========================================================================
Mael, 09/08 : "quand j'ai accepte qu'il monte de categorie il ne s'est
rien passe, et quand je lui ai accorde un sparring dur, aucun retour."
CAUSE : les demandes portaient un NOM d'effet (oui.effet) que PERSONNE
N'APPLIQUAIT. Dire oui ne bougeait que l'entente. Meme famille que
l'evenement de visite qui ne faisait rien, et que l'entrainement qui ne
touchait aucune stat — TROISIEME FOIS AUJOURD'HUI.

## appliquerEffet(cle, effet) — CHAQUE EFFET TOUCHE DU REEL
- categorie_haut : il CHANGE de division (roster compris), repart non
  classe, et son encaissement + son equilibre BAISSENT — il sera le plus
  leger de sa nouvelle categorie. Mesure : welter -> moyen, fiche et
  roster suivent.
- sparring_augmente / sparring_pro : esquive, parade, timing, clinch et
  frappes au sol +1,4 chacun, ET la forme baisse de 0,06. Mesure :
  esquive 78 -> 79,4 · forme 1 -> 0,94.
- charge_allegee / seance_en_moins / pause : forme et moral remontent,
  charge allegee pendant 14 a 21 jours.
- chercher_vite : fabrique VRAIMENT une offre a camp court (21 j).
- refuser_offre : retire l'offre en attente ET coute un refus a l'orga.
- baisser_part : ta part baisse de 5 points sur le contrat de salle.
- avance : l'argent SORT DE LA CAISSE.
- changer_coach / stage : coutent 900 / 1400 €, et +2 sur trois stats.
- com_sur_lui : reputation de la salle +0,8, sa notoriete +3.
- prepa_perso : le staff coute plus cher toutes les semaines.
- mise_en_retrait / soigner : sa date de disponibilite RECULE (21 / 45 j).
- laisser_partir : il quitte vraiment la salle (MESGARS et EFFECTIF).
/!\ UN EFFET QUI NE FAIT RIEN EST UN MENSONGE, exactement comme un
evenement qui ne fait rien.

## LA FENETRE DE CONSEQUENCE (demande de Mael)
popup(titre, sous, lignes) s'ouvre apres une acceptation et dit CE QUI A
CHANGE. /!\ ELLE NE DIT QUE DES CHOSES VRAIES : chaque ligne est produite
par un effet REELLEMENT applique juste au-dessus, jamais un texte
d'ambiance. Les memes lignes partent aussi au fil du jour.

## /!\ PIEGE : UNE CLE DE STAT INVENTEE NE LEVE PAS
J'avais ecrit f.striking.garde — ca n'existe pas (c'est parade, blocage,
posture_debout). Ca ne plante pas : ca ne fait RIEN, en silence. Meme
famille que le defaut silencieux d'hydrater. VERIFIER LES CLES CONTRE LA
FICHE REELLE avant de les ecrire.
Chaine : 24 bancs CONFORME. Apercu v111.


###########################################################################
#                                                                         #
#   À LIRE EN PREMIER PAR LA PROCHAINE SÉANCE — état au 09/08 au soir     #
#                                                                         #
###########################################################################

## PREMIER GESTE
Rejouer `./js/lancer_verifs.sh` sur l'archive. Si ce n'est pas 24,
s'arrêter et chercher pourquoi. Puis `node js/bundler.js` — LE BUNDLE NE
SE REGENERE PAS TOUT SEUL, et un test sur un bundle périmé ment.

## CE QUI A CHANGÉ AUJOURD'HUI, EN UNE PHRASE
La saison existe et elle est JOUABLE À L'ÉCRAN. Le monde vit (4 500 pros,
16 organisations, cartes, classements), tes hommes y vivent aussi, on leur
parle, ils demandent des choses, ils signent des contrats, ils combattent,
et le résultat remonte partout.

## LES MODULES NÉS AUJOURD'HUI (8 nouveaux, bancs 17 à 26)
    carriere.js (bornes)  vivier.js   cartes.js    salle.js
    relation.js  offres.js  entente.js  dialogue.js  demandes.js
    contrats.js
Tous branchés dans le bundle (31 modules) ET dans demo_jeu.html.

## /!\ LA LEÇON DE LA JOURNÉE, RÉPÉTÉE SIX FOIS
UNE CHOSE QUI N'EST BRANCHÉE NULLE PART NE FAIT RIEN — ET NE LÈVE PAS.
Six cas, tous trouvés par Mael EN JOUANT, aucun par les 24 bancs :
  1. l'entraînement calculait un gain jamais appliqué aux stats ;
  2. l'événement "visite d'un poids plume" était une ligne de calendrier
     sans handler ;
  3. les demandes portaient un nom d'effet que personne n'appliquait ;
  4. accepter une offre ne posait aucune échéance — le combat n'arrivait
     jamais ;
  5. `amateur:false` était codé en dur dans le contexte des demandes ;
  6. une clé de stat inventée (`f.striking.garde`) ne fait rien, en
     silence.
=> AVANT DE DIRE QU'UNE FONCTIONNALITÉ EXISTE, VÉRIFIER QU'ELLE EST
APPELÉE ET QU'ELLE MODIFIE QUELQUE CHOSE DE MESURABLE.

## /!\ LA DEUXIÈME LEÇON : PAS DEUX EXEMPLAIRES DE LA MÊME DONNÉE
Trois divergences le même jour — le groupe (FICHES vs EFFECTIF), la liste
des pros écrite en dur, les trois inscriptions séparées pour rejoindre la
salle. Si deux écrans ne disent pas la même chose, chercher la copie.

## LES DÉCISIONS DE CONCEPTION DE MAEL, À NE PAS DÉFAIRE
- DEUX CONTRATS, PAS UN : le contrat de SALLE (ta part, nombre de
  combats) puis le DÉMARCHAGE d'une organisation, chances CACHÉES. Ordre
  du jeu : pro -> contrat de salle -> organisation -> combats.
- LES ORGAS NE VOIENT QUE LA TRACE, jamais le niveau. Toi tu vois les
  NOTES de tes hommes, jamais leur POTENTIEL.
- LES AMATEURS NE PARLENT QUE DE DEUX CHOSES : passer pro, ou un sparring
  avec les pros. "Moi je gère les pros."
- MONTER DE CATÉGORIE EST UNE AMBITION DE CHAMPION.
- LES VICTOIRES CHEZ TOI MONTENT L'ENTENTE (plafond 84 : gagner n'achète
  pas tout). UNE SÉRIE DE DÉFAITES L'ABÎME ; une défaite seule, non.
- LA VIE DU MONDE NE TOUCHE PAS AUX CONTRATS DE TES HOMMES.
- CHAQUE ARRIVÉE PASSE PAR rejoindreLaSalle().

## LE BLOCAGE, INCHANGÉ DEPUIS HIER
LE CHANTIER D (géométrie de la cage) reste le vrai blocage moteur : un
lutteur encaisse 389 points par round parce que le combat debout n'a pas
de distance. Il débloque J (low kicks à 28 % contre ~13 % réels) et la
saisie de jambe. RIEN DE CE QUI A ÉTÉ FAIT AUJOURD'HUI NE L'A ENTAMÉ.

## CE QUI RESTE OUVERT, PAR ORDRE D'URGENCE
1. LE CLASSEMENT N'EST PAS CRÉDIBLE : des #4 à 0-6 dans le top 15.
   `bouger` ne rétrograde que d'un cran et il n'existe aucune sortie du
   top 15 par accumulation de défaites. ARBITRAGE DE MAEL REQUIS avant de
   toucher à classement.js (couvert par le banc 14).
2. LA PART DE LA SALLE NE PRÉLÈVE RIEN sur les bourses à l'encaissement.
   Le contrat de salle existe, l'argent ne suit pas encore.
3. contrats.approche() est écrit mais PAS BRANCHÉ : aucune organisation
   ne vient jamais te démarcher spontanément.
4. Le contrat de salle ne se décompte pas et ne se renégocie pas à zéro.
5. Les demandes en attente ne périment jamais (11 en attente après 120 j
   dans une mesure ; la bulle n'en montre qu'une, mais ça s'accumule).
6. Chantiers conçus non codés : D, E, F, G, L (blessures).

## À FAIRE EN JOUANT (c'est ce qui marche le mieux)
Sept défauts sur huit viennent de Mael au navigateur. Les bancs ne voient
pas ce qui n'est pas branché. Ouvrir l'aperçu autonome sur téléphone et
jouer une saison entière.

===========================================================================
SEANCE DU 10/08 — "LE JEU EST DEJA CASSE" : trois rapports de Mael,
quatre defauts, tous dans demo_jeu.html, aucun vu par les 24 bancs.
===========================================================================

## CAS 7 — L'OFFRE SCRIPTEE ARES CONTRE LES OFFRES REELLES (retiree)
Kante recoit une offre reelle HEX (jour ~4), l'accepte — et le jour 6
l'OFFRE SCRIPTEE "Matchmaker — Ares FC" tombe quand meme : elle ne
regardait ni OFFRES ni combatPrevu. Et l'accepter ne posait AUCUNE
echeance : "Kante c. Vasile dans ~6 semaines" ne se jouait JAMAIS.
=> RETIREE (DECISIONS[6] + les deux affichages choix.offre + le statut de
Vasile). Les offres reelles sont seules maitresses. Le statut d'un pro
affiche desormais son VRAI combat accepte (statutPro lit combatPrevu).
Au passage : "Ares" est une marque deposee (voir classement.js) — elle
sort du jeu avec la couche scriptee.
/!\ MEME FAMILLE QUE "PAS DEUX EXEMPLAIRES" : deux systemes d'offres qui
s'ignorent = deux combats annonces pour le meme homme, dont un fantome.

## CAS 8 — LE JOUR J TRAITE DEUX FOIS (combatsDuJour retire)
combatsDuJour() etait le PREMIER branchement du jour J, reste en place
quand l'echeance "combat_"+cle (repondreOffre) est arrivee. Le meme jour
de combat produisait DEUX cartes "en attente" — dont une FANTOME qui
gardait son bouton "Lancer" apres le combat et rouvrait l'ecran sur un
combat deja fini. Et il vidait combatPrevu AVANT le combat :
remonterDansLeMonde lisait null => adversaire perdu => LE CLASSEMENT NE
BOUGEAIT JAMAIS apres un combat d'offre, EN SILENCE.
=> combatsDuJour retire. L'offre voyage SUR le combat (COMBAT1.offre,
posee au jour J par l'echeance), combatPrevu se libere au jour J, et
remonterDansLeMonde lit r.offre. Mesure : bilan adverse 0-0 -> 0-1 apres
le combat — il ne bougeait jamais avant.

## CAS 9 — LE +0.4 QUI NE TOUCHAIT RIEN : L'ARRONDI A L'ECRITURE
Rapport de Mael : "sparring kickboxing +0.4, je vais dans ses stats, +0
partout". Mesure : 14 jours, Kante, 10 entrees de progres TOUTES A 0.0,
ZERO stat bougee. Cause : chaque ecriture arrondissait au dixieme
(Math.round(x*10)/10) alors que le gain PAR STAT d'une seance vaut 0,02 a
0,05 sur un pro pres du plafond (0,42 x marge). Chaque versement tombait
a zero, ET COMME L'ARRONDI FRAPPAIT L'ACCUMULATION, cent seances ne
valaient pas mieux qu'une.
=> LA PRECISION SE GARDE EN STOCK, L'ARRONDI N'EXISTE QU'A L'AFFICHAGE.
Regle generale a graver : NE JAMAIS ARRONDIR UNE ACCUMULATION.
=> Et l'ecran de seance dit desormais CE QUI A ATTERRI (appliquerTravail
retourne le verse, gains7 stocke le verse) — avant il affichait le BRUT
pendant que le net partait ailleurs. Un pro a 80 progresse lentement A
L'ECRAN AUSSI : c'est la verite, pas un defaut. Mesure : 10 stats
bougees en 14 jours, progres qui s'accumulent (0,03-0,07).

## CAS 10 — VERDICT DIVERGENT DES QUE KANTE GAGNAIT (l'accent)
LE vrai crash du "2e combat a l'interface cassee". La garde de
jouerUnRound comparait c.vainqueur.name (JETON normalise par cleFiche :
"Kante", SANS accent) a r.a (la CLE : "Kanté", AVEC accent).
"Kante"==="Kanté" est FAUX => des que Kante GAGNAIT, la garde croyait que
B avait gagne, verdict.js disait A, et VERDICT DIVERGENT levait EN PLEIN
ECRAN DE COMBAT. S'il perdait, la comparaison tombait juste PAR ACCIDENT.
Okonkwo passait — pas d'accent. Le premier combat marchait, le deuxieme
cassait : pile le rapport de Mael.
=> ON COMPARE L'OBJET (c.vainqueur===r.fa), JAMAIS UN NOM A UNE CLE.
Regle a graver : TOUTE COMPARAISON NOM/CLE EST SUSPECTE — les jetons, les
cles fiches.js et les cles MESGARS ne vivent pas dans le meme alphabet.

## COMMENT ILS ONT ETE TROUVES
Mael, au navigateur, en jouant — trois rapports. Reproduits ici dans un
shim DOM (node, sans navigateur) : demarrer() + continuer() en boucle +
le parcours offre -> acceptation -> jour J -> combat -> encaissement.
LE SHIM ATTRAPE CE QUE LES BANCS NE VOIENT PAS : ce qui n'est pas branche
et ce qui casse en sequence. A refaire a chaque seance sur les parcours
neufs. (Sonde : cat bloc_inline + probe > jeu.js, node avec un
getElementById qui fabrique des elements factices.)

Chaine : 24 bancs CONFORME. Bundle et gabarit regeneres. Apercu v113.

## CAS 10 bis — LES CHIFFRES ETAIENT VRAIS, L'AFFICHAGE NE SE RECOUPAIT PAS
Rapport de Mael (v113, en jouant) : "Ndiaye +0.2 a la seance, +0.1 dans
la fiche". Trace : le chip +0.2 etait EXACT (cross +0,06, uppercut +0,06,
high kick +0,07 = 0,19 verses par la seance). Mais :
  1. l'axe Frappe ne liste que jab/cross/crochet/low kick — le reste du
     versement (uppercut, high kick, spinning) etait INVISIBLE depuis cet
     axe ;
  2. l'arrondi au dixieme GONFLAIT les miettes : +0,06 s'affichait +0,1,
     et la somme des badges depassait le chip.
=> Deux corrections d'AFFICHAGE seulement (le stock etait deja juste) :
   - sous 0,1 le badge montre les centiemes ("+0.06") — moins joli, VRAI ;
   - la vue d'axe dit ou le reste est parti : "Le travail a aussi
     apporte, hors de cet axe : Coups tournants +0.08 · High kick +0.07…"
Regle a graver : QUAND DEUX ECRANS MONTRENT LE MEME TRAVAIL A DEUX
GRANULARITES, LE PLUS FIN DOIT PERMETTRE DE RECOMPOSER LE PLUS GROS.
Chaine : 24 bancs CONFORME. Apercu v114.

## CAS 11 — LES RESTES DU COMBAT SCRIPTE SUR LES COMBATS D'OFFRE
Rapport de Mael (v114) : "le combat marche mais Kanté est encore marqué
combat ce soir, et son dernier combat noté est en janvier". Quatre restes
du combat scripte s'appliquaient a TOUS les combats :
  1. "jan. 2026" EN DUR au palmares — son combat du 27 fevrier etait date
     janvier. => datePalmares(t.jour), la date sort de l'HORLOGE.
  2. "· Lyon" EN DUR sur la carte de resultat et le statut adverse.
     => le lieu sort de l'offre (r.offre.org), Lyon reste pour combat1.
  3. LA BOURSE : 3 800 € forfaitaires encaisses pour tous les combats,
     quelle que soit la bourse negociee par offres.js. => brut =
     r.offre.bourse. (La penalite de pesee ne s'applique qu'au scripte —
     les combats d'offre n'ont pas encore de pesee.)
  4. L'ENCAISSEMENT TAMPONNAIT "LA PREMIERE CARTE EN ATTENTE", pas celle
     de CE combat : deux combats en attente et le mauvais recevait le
     resultat — d'ou un "combat ce soir" qui restait colle. => la carte
     porte la GRAINE de son combat des sa creation, le tampon matche
     dessus.
  5. Et statutPro(Kanté) retombait sur un texte de developpement FIGE
     apres son combat. => le statut d'un pro lit FICHES[id].statut, que
     encaisserResultat met a jour — le statut est VIVANT.
Regle a graver : QUAND UN CHEMIN GENERIQUE HERITE D'UN CHEMIN SCRIPTE,
CHERCHER CHAQUE CONSTANTE EN DUR — lieu, date, montant, texte. Chacune
est un mensonge sur le chemin generique.
Chaine : 24 bancs CONFORME. Apercu v115.

## CAS 12 — LE DEBUTANT REFUSE PARTOUT : LE VERROU D'ENTREE (arbitrage C)
Rapport de Mael : "quand je signe un pro il est refuse partout, c'est
normal ?" NON — verrou mathematique a trois etages :
  1. contrats.pretendants : radar = portee x 0,4 (16 minimum) + serie de
     3 victoires PRO exigee. Un pro frais (org null, notoriete 0, zero
     combat pro) etait invisible pour TOUTES les orgas, et le
     contournement "sienne" ne joue que s'il A une maison.
  2. Il ne peut pas gagner de notoriete sans combattre, ni combattre
     sans orga => ENFERME DEHORS A VIE.
  3. Et cote page, UN DOSSIER REFUSE TUAIT LE BOUTON A VIE (la liste des
     demarchages ne se vidait qu'au succes) : cinq jets de des et un
     debutant malchanceux n'avait plus aucun bouton.
ARBITRAGE DE MAEL : option C (les deux portes).
  A. LA PORTE REGIONALE : la porte est ORG_DEPART (HEX — le circuit du
     pays de la salle, PAS la plus petite orga du monde : apres
     construction, c'est SWE_N a 30 de portee, et un debutant de
     Marseille ne debute pas en Suede). Un homme LIBRE a trace POSITIVE
     (v > d, amateur compris) y a chanceDe >= 0,85. La porte regarde la
     trace : un 0-3 reste a 2 %.
  B. SOUS LE RADAR, ON SIGNE AU RABAIS : une orga qui ne te voyait pas
     et dit oui parce que TU es venu frapper paie 70 % du bareme. Au-
     dessus du radar, plein tarif.
  C. UN REFUS EST UN DELAI DE 30 JOURS, pas une condamnation : le bouton
     dit "Refuse — revenir dans N j" et se reactive. Garde aussi dans la
     fonction (le bouton grise ne suffit pas).
BANC 26 etendu : 5 invariants nouveaux (porte + trace + libre-seulement
+ rabais 70 % + plein tarif au-dessus du radar). Mesure bout en bout :
Traore (amateur 3-0) -> pro -> contrat salle -> HEX au rabais 658 €/cbt
-> 3 combats -> premiere offre de combat HEX 40 j plus tard.
Chaine : 24 bancs CONFORME. Apercu v116.

## CAS 13 — LE PASSAGE PRO D'UN HOMME SANS BILAN PLANTAIT TOUTE LA SALLE
Rapport de Mael (v116, capture console) : "Uncaught TypeError: Cannot
read properties of null (reading '0')" au moment ou Delorme demande a
passer pro. Cause : les adherents generes ont bilan:null (les loisir
toujours, 40 % des amateurs). Au premier passage pro d'un homme sans
historique, la liste des pros lisait f.bilan[0] sur null et TOUT
L'ONGLET SALLE plantait A CHAQUE RENDU.
=> passerPro garantit la fiche : bilan [0,0], combats [], division posee.
=> Defense en profondeur : la ligne pro et l'encaissement tolerent un
bilan absent (0-0 par defaut) — un rendu ne doit JAMAIS planter sur une
donnee optionnelle.
=> Et le mensonge jumeau : case "passer_pro" annoncait "Il passe
professionnel" MEME QUAND passerPro refusait (pas pret, caisse vide).
passerPro retourne desormais la verite et la demande la repercute.
Mesure : Delorme simule (amateur pret, bilan null) -> passage pro ->
bilan [0,0] -> rendre() sans plantage ; demande sans argent -> "Le
passage pro n'a pas abouti".
Regle a graver : TOUTE DONNEE OPTIONNELLE (bilan, combats, estimations)
DOIT ETRE GARDEE A LA LECTURE — et le premier a la creer est celui qui
change le statut de l'homme.
Chaine : 24 bancs CONFORME. Apercu v117.

## CAS 14 — "ILS VIENNENT TOUS A TOUT VA" : LE PASSAGE PRO SE MERITE
Rapport de Mael : les demandes de passage pro pleuvaient. Cause : le
critere etait amateur + aggression >= 55, RIEN D'AUTRE — tout amateur au
sang chaud reclamait, meme un 0-0 niveau cours du soir.
=> UNE DEMANDE CREDIBLE EXIGE TROIS CHOSES (demandes.js) :
   1. UN DOSSIER : au moins 2 victoires, plus de victoires que de
      defaites (le bilan entre au contexte des demandes) ;
   2. Y CROIRE : niveauRessenti(f) >= 44 (la barre reelle du passage est
      48 — se surestimer un peu est humain, de 20 points c'est un
      delire, pas une demande) ;
   3. UNE RAISON D'OSER : aggression >= 55, OU age >= 25 (il voit le
      temps passer).
niveauRessenti = moyenne large de 9 stats — le niveau qu'il SE DONNE,
jamais montre aux organisations.
Mesure : 120 jours -> 5 demandes, toutes credibles (bilans 2-0 a 3-1,
ressentis 49-61, jeunes agressifs ou 24-25 ans qui voient l'heure
tourner). Une toutes les ~3,5 semaines pour toute la salle.
Chaine : 24 bancs CONFORME. Apercu v118.

===========================================================================
LA PARTIE NEUVE ET LA SAUVEGARDE (demande de Mael, 10/08)
===========================================================================

## LE MODE DE PARTIE
Trois modes, decides AVANT tout ensemencement, portes par le HASH
(#neuf / #demo / #reprendre — survit au rechargement, marche sans
localStorage) :
  - demo      : la partie scriptee d'origine, INTACTE (non-regression
                mesuree : Okonkwo/Kanté, 38 membres, combat1 au jour 5) ;
  - neuf      : LA SALLE VIDE — garage, materiel 1 etoile partout, cage
                non, reputation 5, forfait 390, 4 000 € de caisse, ZERO
                pro, ZERO amateur, ZERO loisir. Seul le staff reste.
  - reprendre : recharge la sauvegarde.
Sans hash : l'ACCUEIL (Reprendre / Nouvelle partie / Partie demo).
/!\ LE FORFAIT DE DEPART EST CALCULE, PAS CHOISI : l'attractivite doit
depasser 0,95 pour qu'une salle VIDE se remplisse. forfaitReco d'un
garage 1 etoile ≈ 426 € => forfait 390. A 480, la salle ne se remplit
JAMAIS — verrou du meme type que le debutant refuse partout.

## DEUX REPARATIONS EXIGEES PAR LA PARTIE NEUVE
  1. recruter() VIOLAIT LA REGLE DU CARNET : les recrues hebdomadaires
     entraient dans FICHES/EFFECTIF mais JAMAIS dans le monde — ni stats,
     ni dialogue. En partie neuve, TOUTE la salle aurait ete des
     fantomes. => recruter passe par rejoindreLaSalle. Mesure : 0
     fantome apres 150 jours.
  2. LA VISITE ETAIT UN EVENEMENT UNIQUE du script. C'est desormais un
     FLUX (re-posee 25-45 j apres chacune) — le recrutement d'espoirs.
Mesure partie neuve : 150 jours -> 17 adherents arrives seuls (bouche-a-
oreille + 5 espoirs par visites), caisse 4 000 -> 1 207 € (ca saigne,
c'est le sujet du jeu).

## LA SAUVEGARDE
Autosauvegarde au debut de chaque continuer() (etat de FIN de journee —
jamais un combat a moitie joue) + boutons dans Gestion : Sauvegarder /
Exporter / Importer (texte) / Menu.
/!\ TROIS PIEGES PAYES D'AVANCE :
  1. MESGARS[cle] EST le meme objet que MONDE.pros.get(id) — on sauve
     {cle:id} et on RECOLLE au chargement (mesure : identite OUI).
  2. l.fiche est un Fighter A METHODES : le JSON l'aplatit. On REHYDRATE
     (rehydraterFiche : profils du moteur reconstruits depuis les stats a
     plat — les valeurs entrainees survivent, les methodes reviennent).
  3. _g et _s (les deux LCG maison) font partie de l'etat.
Round-trip mesure IDENTIQUE (jour, argent, effectif, generateurs), puis
10 jours joues apres rechargement sans plantage.
/!\ A SURVEILLER : la sauvegarde pese ~2,1 Mo a 150 jours (le monde
grossit avec ses empreintes). localStorage plafonne vers 5 Mo — sur une
tres longue partie ca peut coincer ; l'export texte reste le secours, et
une compression serait le chantier suivant si ca coince en vrai.
Chaine : 24 bancs CONFORME. Apercu v119.

## CAS 15 — "cle is not defined" : L'ECRAN DE COMBAT VERROUILLE
Rapport de Mael (capture console) : bloque dans l'ecran de fin, la croix
n'apparait jamais. Cause : dans remonterDansLeMonde, une variable locale
du bloc victoire s'appelait `cle` (la cle du MOUVEMENT D'ENTENTE :
"victoire_bon_camp"...). DEDANS, lienGars(cle) affichait litteralement
"victoire_bon_camp" au lieu du nom du combattant ; DEHORS (serie de
defaites, fin de contrat), `cle` n'existait pas et la remontee LEVAIT —
AVANT que encaisserResultat rende la main et que la croix s'affiche.
L'ecran restait verrouille des que : 2 defaites de suite, OU dernier
combat du contrat.
=> `const cle=r.a` en tete de la remontee (la cle du combattant, une
seule fois) ; la cle d'entente devient `cleEnt`.
=> Au passage : la bourse de l'ECRAN DE FIN etait encore "3 800 €" en
dur (donneesEcran) — celle de l'offre s'affiche desormais.
Mesure : 3 combats joues et encaisses en partie neuve, dont le dernier
du contrat (restants 0) — aucun lever.
Regle a graver (jumelle du cas 10) : UN NOM DE VARIABLE REUTILISE DANS
UN SOUS-BLOC EST UN PIEGE DOUBLE — il MENT dedans et il LEVE dehors.
Chaine : 24 bancs CONFORME. Apercu v120.

===========================================================================
SEANCE DU 10/08 (suite) — LA CONSIGNE SOL ET LA VIE DES CEINTURES
===========================================================================

## LA CONSIGNE DU COIN « CHERCHE LA SOUMISSION » (demande de Mael)
Son jiu-jitsuka amenait au sol puis ne faisait que taper : aucun levier
pour dire "finis-le". Nouveau levier au coin : "Au sol — Chercher la
soumission" (bouton dans le panneau, ordre `sol:"soumission"`).
CHAINE : gabarit (bouton + ordreCoin) -> coin.js (LEVIERS.sol,
gameplan.sol) -> engine.poids_action_sol (report des intentions :
progress x1,4 · gnp x0,45 · sub x3,0 · tenir x0,45, renormalise).
/!\ INERTE SANS ORDRE — meme motif que gameplan.cible : gameplan.sol
n'existe ni sur un combattant genere ni dans engine.py, donc les bancs
de conformite restent au caractere pres.
/!\ LE PIEGE PAYE : la premiere version etait MORTE EN SILENCE. L'A/B
etait STRICTEMENT identique (178/178, 517/517) — le retour anticipe
`if(!g) return [poids historiques]` court-circuitait la consigne pour
tout combattant SANS profil grappling (donc tous les generes). Regle :
UN A/B STRICTEMENT IDENTIQUE N'EST PAS UNE COINCIDENCE, C'EST UN
CIRCUIT MORT.
Mesure finale (30 combats, grappler c. boxeur, ordre lutte+soumission) :
tentatives 178 -> 231 · frappes au sol 517 -> 276 (moitie) · victoires
par soumission 11 -> 17.
/!\ ON NE CREE PAS D'ARME : un homme sans soumission recoit l'ordre et
gaspille ses actions sur du 3 % — le prix d'un mauvais ordre.

## LA CEINTURE NE MEURT JAMAIS (question de Mael : "le top 15 bouge ?")
Le top 15 BOUGE (15/15 rangs changes en 60 jours de monde). Mais la
trace a revele pire : HEX poids plume perdait sa ceinture au jour 53 et
NE LA RETROUVAIT JAMAIS. Autopsie : Lefort bat le champion (combat de
titre), prend la ceinture — et LE MEME JOUR son contrat expire et TRI le
signe (champion=false). Trois defauts, trois regles :
  1. UN COMBAT DE TITRE COURONNE TOUJOURS SON VAINQUEUR — l'ancienne
     garde `titre && lP.champion` ignorait la ceinture vacante.
  2. LA CEINTURE VACANTE SE REMET EN JEU : sans champion dans LA
     DIVISION, la paire du mieux classe (rang <= 5) joue le titre.
     /!\ ATTRAPE PAR LE BANC : la premiere version verifiait "pas de
     champion sur LA CARTE" — un champion au repos ce soir-la creait
     DEUX champions (NLD_N poids moyen). La verification vit au niveau
     de la division.
  3. LA CEINTURE ROUVRE LE CONTRAT — POUR LES PNJ AUSSI : la regle du
     carnet existait cote joueur (banc 26) mais pas dans le monde. Un
     champion PNJ en fin de contrat est prolonge par son organisation.
Banc cartes etendu : "une ceinture ne meurt jamais" — un an de monde,
144/144 divisions gardent un champion (avant : hemorragie des j53).
RESTE OUVERT (inchange) : le classement pas credible — #1 a 7-8 vu a la
mesure. ARBITRAGE DE MAEL TOUJOURS REQUIS.
Chaine : 24 bancs CONFORME (moteur touche : la consigne prouvee inerte
sans ordre). Apercu v121.

## CAS 16 — SEPT FOIS LE MEME ADVERSAIRE
Rapport de Mael. Cause : choisirAdversaire (offres.js) etait DETERMINISTE
(le plus proche au rang, premier minimum) sans AUCUNE exclusion de
revanche — et la victoire mettait l'adversaire au repos ~35 jours, pile
la fenetre de l'offre suivante. Le monde avait la regle (banc cartes),
les offres du joueur non.
=> DEUX PASSES : d'abord sans le dernier adversaire (dans les deux sens
via vie.advPrec), et seulement s'il n'existe personne d'autre, la
revanche est permise — mieux qu'aucun combat. Mesure : 7 offres, 0
revanche immediate, rotation sur 4-5 hommes (Berthier revient 3 combats
plus tard — c'est une petite division, c'est le reel).
Banc offres etendu : "jamais deux offres de suite contre le meme homme".

## CAS 17 — LA FAILLITE MATHEMATIQUE DE L'ANNEE 1 (partie neuve)
Rapport de Mael : "la faillite est impossible a eviter annee 1". MESURE
AVANT : plateau a ~20 cotisants (7 800 €/an) contre ~13 900 € de
sorties — passage en negatif au jour 210, −2 753 € au jour 360.
STRUCTUREL, pas une malchance : la base des charges etait FIXE a
90 €/sem — le meme socle pour un garage de 60 m² et un complexe de
500 m² — et le loyer du garage valait 420 €.
=> TROIS REGLAGES, ANCRES SUR LE REEL :
   1. Le loyer d'un garage est un loyer de garage : 420 -> 300 €.
   2. LA BASE DES CHARGES SUIT LES MURS : 1,73 €/place (ancre : le local
      associatif GARDE ses 90 €/sem — le calibrage d'origine est
      preserve). Garage 48 · assoc 90 · vraie salle 164 · complexe 277.
      /!\ Les grands locaux coutent desormais PLUS cher qu'avant — c'est
      le realisme, et ca pese sur le demenagement en demo aussi.
   3. Caisse de depart : 4 000 -> 5 500 € (une vraie piste de decollage).
MESURE APRES (jeu passif : zero combat, zero media, forfait fige) :
5 500 -> 2 449 € a l'an 1. Ca saigne ~3 000/an au plateau mais ca
SURVIT ; la boucle (combats -> reputation -> forfait qui monte vers le
recommande) fait le reste. La marge reste MINCE — c'est le sujet — mais
l'equation FERME.
Chaine : 24 bancs CONFORME. Apercu v122.

===========================================================================
SEANCE DU 10/08 (suite) — L'ECHELLE : L'ARBITRAGE DU CLASSEMENT EST TOMBE
===========================================================================

## L'ARBITRAGE DE MAEL (verbatim, reformule)
"Un classement de TOUT le roster de la categorie, mais cache : on ne
montre que le top 15. Regle simple : tu gagnes, tu affrontes un mieux
classe que toi ; tu perds, tu regardes derriere."

## L'IMPLEMENTATION (classement.js : echelleDe / bougerEchelle /
## synchroniserRangs — bancs a l'appui)
- Chaque division de chaque orga porte une ECHELLE COMPLETE (m.echelles,
  creee au premier besoin, reparee a chaque lecture : arrivants en bas,
  partis retires, champion epingle en tete, rangs ecrits des la
  naissance). Le rang affiche = la FENETRE des 15 premiers.
- MOUVEMENT : vainqueur derriere -> il PREND LA PLACE du perdant (tous
  ceux entre eux reculent d'un cran) ; vainqueur devant -> le perdant
  recule d'un cran (deux sur un finish).
- L'AMORCAGE SE FAIT A LA TRACE (bilan+serie, puis victoires, puis
  notoriete), PAS au rang de genese — trouve en tracant Mathis Lefort :
  LA GENESE LIVRAIT UN 1-4 AU RANG 4. C'etait la source du "des #4 a
  0-6" signale par Mael des le premier jour.
- retasser() ne tourne plus apres un combat (il reecrivait les rangs a
  l'ancienne et se battait avec l'echelle) ; bouger() reste au module
  pour ses bancs, plus personne ne l'appelle en vie de monde.
- OFFRES : la DIRECTION vient de la serie (serie > 0 -> on vise devant,
  sinon derriere), la PROFONDEUR vient de la durete du matchmaker (mal
  vu = on t'envoie chercher plus haut) — le banc "mal vu = adversaire
  plus dur" l'a exige.
- MONDE : les rangs des resultats se TAMPONNENT A L'APPARIEMENT — les
  combats d'une meme carte bougent l'echelle entre eux, captures a la
  resolution ils derivaient ("#9 c. NC" fantome au banc du couloir).
- SAUVEGARDE : m.echelles voyage dans l'etat ; une sauvegarde d'avant
  l'echelle se derive de la trace au premier besoin.
- BANC classement etendu (4 invariants) : la fenetre des 15 sur echelle
  complete ; tu gagnes tu prends sa place ; tu perds tu recules (x2 sur
  finish) ; genese = tri de la trace (lue sur MONDE VIERGE — le jour 0 a
  deja ses combats) ; et les negatifs-sans-serie en tete restent < 4 %
  sur un an (l'upset a trace faible est VOULU — c'est la regle).
- /!\ SEUIL DU BANC RYTHME AFC passe au PLANCHER entier (3 % de 450 =
  13,5 : l'arrondi au plus proche exigeait 14 et ratait a 13).

## LES QUATRE AUTRES REPARATIONS DE LA FOURNEE
1. LE RESULTAT SE SCELLE A L'ENCAISSEMENT (Mael : "mon combat compte
   jamais et revient toujours contre Nabil Aubry") : l'autosauvegarde ne
   partait qu'au debut d'une journee — jouer le combat puis fermer sans
   avancer d'un jour = resultat perdu, retour au matin, MEME graine,
   MEME adversaire. sauvegarder(true) juste apres encaisserResultat.
2. DEUX HOMONYMES DANS LA CAGE ("200 coups a 1, l'adversaire 1 coup a
   100 %") : "Kevin Aubry" c. "Nabil Aubry" -> jetons "Aubry"/"Aubry_B",
   et "Aubry" est un PREFIXE de "Aubry_B" : la feuille attribuait les
   lignes des deux au premier. Sur collision : "AubryA"/"AubryB" —
   aucun prefixe commun.
3. LE CONTRAT SE FINIT VRAIMENT ("mon contrat a HEX se finit jamais") :
   a zero restant, plus aucune offre ne part et une RENEGOCIATION
   s'ouvre en zone d'attente — renouveler (3 combats au bareme de sa
   trace D'AUJOURD'HUI) ou partir libre (retire du roster, ceinture
   vacante si champion, libre de demarcher ailleurs). Mesure : 700 €
   (rabais debutant) -> 6 975 € au renouvellement d'un 6-0.
4. "passe en orthodox" N'EST PAS UNE POSITION DE SOL : positionAu
   (verdict.js) remontait le log avec /passe en (...)/ et avalait le
   CHANGEMENT DE GARDE — un switch avant un TKO au sol plantait le
   verdict en pleine vie de monde. Les mots de garde sont ignores.

Mesure de bout en bout (partie neuve) : espoir -> pro -> HEX -> 3
combats, 3 adversaires DIFFERENTS, 0 revanche -> renego -> renouvele
6 975 € -> position 3 de l'echelle, #3 affiche, 6-0.
Chaine : 24 bancs CONFORME. Apercu v123.

## CAS 18 — LA BOURSE : LE CONTRAT FAIT FOI, LA VICTOIRE DOUBLE
Trois choses signalees par Mael, une racine commune :
1. LE CONTRAT FAIT FOI : l'offre calculait SA bourse au bareme du marche
   (4 015 €) pendant que le contrat en fixait une autre (700 €/combat) —
   deux exemplaires de la meme donnee, encaissement a +1 606 € au lieu
   de +280. Un homme sous contrat est paye a sa bourse contractuelle ;
   le bareme du marche ne sert qu'aux hommes sans clause (les bancs qui
   testent la relation utilisent des hommes sans clause : intacts).
2. LA VICTOIRE DOUBLE LA BOURSE (show + win, la regle du vrai MMA,
   quelle que soit l'organisation). Nul : simple.
3. LES DEUX PARTS COTE A COTE : la part est celle du CONTRAT DE SALLE
   (contrats.js — imageDe(r.a).part etait un 2e exemplaire jamais signe).
   Depeche mesuree : "Bourse 1 400 € (victoire : doublee) — ta part
   280 € (20 %), Clement touche 1 120 €."

## CAS 19 — LA SAUVEGARDE QU'ON N'ECRASE PAS + LES FANTOMES v122
- "Nouvelle partie" n'ecrivait rien avant le premier Continuer :
  recommencer puis fermer laissait l'ancienne partie intacte, et
  Reprendre la ressortait. => la partie neuve ECRASE la sauvegarde des
  le demarrage, et un bouton "Effacer la sauvegarde" (avec confirmation)
  vit a l'accueil.
- HYGIENE DE CHARGEMENT : les cartes "en attente" d'un jour passe (les
  fantomes du jour de la marmotte, v122 et avant) ne peuvent plus se
  jouer — purgees en "Non joue — combat expire" au lieu d'un bouton mort.
- Verifie : l'espoir ACCENTUE ("Clement") passe tout le parcours — le
  scellement a l'encaissement (v123) etait bien le remede au "compte
  pour du beurre" de la v122.
Chaine : 24 bancs CONFORME. Apercu v124.

## CAS 20 — LA RACINE DES CARTES FANTOMES : LE COMBAT ABANDONNABLE
Mael, capture v122 : QUATRE cartes "Clement c. Nabil Aubry — ce soir, en
attente", chacune avec son bouton Lancer, dates differentes.
RACINE : bloque.faire faisait `bloque=null` AVANT d'ouvrir l'ecran.
Fermer l'ecran sans aller au bout laissait donc la journee avancer : le
combat n'avait jamais lieu, sa carte restait "en attente" POUR TOUJOURS,
et l'offre suivante empilait une carte de plus. Pire : le bouton Lancer
de CHAQUE carte fantome appelait ouvrirEcran() — qui ouvre le COMBAT1
COURANT, pas le sien. D'ou "ca me remet Lancer le combat a chaque fois".
=> LE BLOCAGE TIENT JUSQU'A L'ENCAISSEMENT. On ne peut plus passer a
cote d'un combat, seulement le rouvrir. encaisserResultat leve le
blocage — et lui seul.
=> Le bouton Lancer ne s'affiche QUE sur la carte dont la graine est
celle du combat en cours : une carte ne peut plus lancer le combat d'un
autre.
Mesure : jour du combat -> ouvrir l'ecran -> fermer sans jouer -> 5 x
Continuer : le calendrier NE BOUGE PAS (jour 48 -> 48) ; le combat joue
-> blocage leve, 0 carte en attente, jour 49.
Regle a graver : UN EVENEMENT QUI DOIT ARRIVER NE SE DEBLOQUE PAS A
L'OUVERTURE, IL SE DEBLOQUE A LA CONCLUSION.

/!\ NOTE DE TRACABILITE — ORIGINE ETABLIE.
Les cas 18 et 19 (contrat qui fait foi, victoire doublee, parts cote a
cote, ecrasement de sauvegarde, purge des fantomes au chargement) sont
apparus dans la copie de travail sans patch visible dans MA session :
absents de l'archive v123 livree, presents sur le disque a 03:40.
ORIGINE : une SESSION PARALLELE de Mael (Fable 5), COUPEE EN ROUTE faute
de credit. Ce n'est pas du code sans auteur — c'est du travail
INTERROMPU, et c'est un cas de figure a connaitre.

CE QU'UNE SESSION COUPEE LAISSE DERRIERE ELLE — le motif exact, observe :
  - le CARNET etait ecrit (cas 18 et 19 rediges, annoncant "Apercu
    v124") mais AUCUNE archive v124 n'existait : le carnet promet
    toujours plus loin que le disque ;
  - la CHAINE etait a 24 — le travail fait etait sain ;
  - mais LA RACINE N'ETAIT PAS TOUCHEE : le cas 19 purgeait les cartes
    fantomes AU CHARGEMENT (l'hygiene) sans corriger CE QUI LES
    FABRIQUE (le combat abandonnable, cas 20). Le symptome traite,
    la cause vivante.
=> REGLE A GRAVER : UNE SESSION COUPEE SE RECONNAIT A CE QU'ELLE SOIGNE
LE SYMPTOME SANS AVOIR EU LE TEMPS D'ALLER A LA CAUSE. Reprendre un
travail interrompu = relire le carnet en dernier ET chercher la racine
sous chaque symptome deja pansé.

Traitement applique de toute facon (c'etait la bonne conduite meme sans
connaitre l'origine) : diff complet (4 fichiers), chaine rejouee (24
CONFORME), et CHAQUE comportement re-mesure avant d'etre garde —
contrat 700 € honore, caisse +280 sur victoire doublee a 1 400, depeche
des deux parts, fantome purge au rechargement. Gardes parce que
MESURES.
Chaine : 24 bancs CONFORME. Apercu v124.

## CAS 21 — LES ORGAS QUI DISPARAISSENT APRES UN RECHARGEMENT
Mael : "pourquoi plusieurs orgas ne sont plus la quand je fais un
contrat ?" classement.ORGS ne contient que les CINQ de base au chargement
du module ; les ONZE nationales y sont injectees par vivier.monde()
(enregistrerOrgs). Une partie RECHARGEE reconstruit le monde depuis le
JSON sans jamais rappeler monde() : les nationales disparaissaient de la
table — donc de l'ecran de contrat, des bourses et du classement — alors
que leurs combattants restaient dans les rosters sauvegardes.
=> chargerEtat appelle MMA.vivier.enregistrerOrgs() avant de rebatir le
monde. Mesure : 16 orgas au demarrage -> 5 apres remise a zero (l'etat
d'un rechargement a froid) -> 16 apres chargerEtat.
Regle a graver : TOUT CE QU'UNE GENESE INJECTE DANS UN MODULE DOIT ETRE
REINJECTE AU CHARGEMENT — la sauvegarde restaure les DONNEES, pas les
effets de bord de la construction.
Chaine : 24 bancs CONFORME. Apercu v126.

## CAS 22 — LE VERROU SANS CLEF : "le combat se rejoue a l'infini"
Consequence directe du cas 20. Depuis que le blocage tient jusqu'a
l'encaissement, un combat qu'on n'arrive pas a TERMINER gele le
calendrier : rouvrir l'ecran rejoue toute la sequence DEPUIS LA PREMIERE
SECONDE (le gabarit se rebatit sur le log complet), et ressortir avant
la fin ramene au meme point. Boucle sans fin, partie prisonniere.
=> TROIS SERRURES, TROIS CLEFS :
   1. BOUTON "⏭ Simuler" sur la carte de blocage : le moteur joue les
      rounds restants, encaisse, debloque. Meme resultat, animation
      sautee.
   2. simulerCombat est GARDE : si le combat casse en route, le blocage
      tombe quand meme et la carte passe en "Non joue — combat
      interrompu". La partie ne reste JAMAIS prisonniere.
   3. FILET dans rendre() : un blocage de combat orphelin (COMBAT1
      absent apres rechargement, ou deja encaisse) se leve tout seul.
Mesure : jour du combat -> ouvrir -> ressortir -> 2 x Continuer (gele,
48 -> 48) -> Simuler -> blocage leve, encaisse, 0 carte en attente,
jour 49 ; et blocage orphelin leve par le filet au premier rendu.
Regle a graver : UN VERROU DOIT TOUJOURS AVOIR UNE CLEF. Tout blocage
qui depend d'une action utilisateur reussie doit offrir une issue de
secours ET un filet automatique — sinon un seul incident condamne la
partie.
Chaine : 24 bancs CONFORME. Apercu v127.

## CAS 23 — "35 PARTOUT" : L'HOMME QUI PERD SON MARQUEUR DE SALLE
Mael : "Toussaint vient de passer a 35 de stats partout alors qu'il etait
chaud." MECANISME MESURE : un homme de la salle n'a PAS de `note` (regle
du carnet : les orgs ne voient que la trace). ficheDe aiguillait sur le
seul marqueur `l.salle` — s'il se perd, on tombe dans V.hydrater(), qui
REFABRIQUE un combattant a partir d'une note ABSENTE. Mesure du meme
homme : 31 de moyenne avec le marqueur, 35 PARTOUT sans. Tout
l'entrainement efface a l'ecran, alors que la fiche stockee etait
intacte a cote.
=> LA FICHE STOCKEE FAIT FOI, MARQUEUR OU PAS : sa presence EST la
preuve qu'il est a nous. ficheDe la rend et RECOLLE le marqueur au
passage (auto-reparation — les parties deja abimees se soignent a la
premiere lecture de la fiche).
Mesure : 31 avec marqueur, 31 sans, marqueur recolle a true.
/!\ RESTE A TROUVER : QUI efface le marqueur. Aucun `l.salle=false` dans
le code — piste probable : un chemin qui remplace l'objet du monde
(rechargement partiel, import d'une vieille sauvegarde, ou un homme
recree par le monde sous le meme id). L'auto-reparation protege le
joueur en attendant ; la cause est a chercher.
Regle a graver : NE JAMAIS AIGUILLER SUR UN SEUL DRAPEAU QUAND LA DONNEE
ELLE-MEME EST LA PREUVE. Un drapeau se perd, une fiche non.
Chaine : 24 bancs CONFORME. Apercu v128.

## CAS 24 — LA PARTIE PERDUE : LE QUOTA DEPASSE, EN SILENCE
Mael : "merde ca a pas sauvegarde, ca me met plein de jours avant — et le
code a importer est trop long, je peux pas le copier."
MESURE : la sauvegarde pese 1 961 Ko au jour 100, 2 991 Ko au jour 400
(4 493 hommes dans le monde, ~680 octets chacun). En UTF-16 ca fait
~6 Mo — AU-DELA DU QUOTA localStorage (~5 Mo). Chaque autosauvegarde
echouait donc, ET L'ECHEC ETAIT AVALE (catch silencieux) : le joueur
jouait des jours sur une partie qui ne s'ecrivait plus.
=> TROIS REPONSES :
  1. LE COFFRE CHANGE : INDEXEDDB (quota en centaines de Mo), avec
     localStorage en secours pour les petites parties et les navigateurs
     recalcitrants. Un marqueur leger (le jour) reste en localStorage
     pour que l'accueil sache qu'une partie existe sans ouvrir le
     coffre — et l'affiche : "Reprendre — jour 200".
     Mesure : 2 332 Ko refuses par localStorage, ecrits au coffre,
     recharges a l'identique (jour et argent).
  2. L'ECHEC NE SE TAIT PLUS : bandeau rouge PERSISTANT en haut de
     l'ecran tant que ca ne passe pas, avec un lien direct vers l'export.
  3. L'EXPORT DESCEND UN FICHIER (.json) au lieu d'un pave a copier —
     selectionner 2 Mo de texte au doigt est impossible. L'import a un
     selecteur de fichier. Le texte reste en secours.
Elagage tente et ECARTE : plafonner les empreintes ne gagne rien (4 837
empreintes pour 4 493 hommes, ~1 chacun). Le monde est intrinsequement
gros — c'est le contenant qu'il fallait changer, pas le contenu.
Regle a graver : UNE ECRITURE QUI PEUT ECHOUER NE DOIT JAMAIS ECHOUER EN
SILENCE — et un quota se mesure AVANT d'y confier la partie du joueur.
Chaine : 24 bancs CONFORME. Apercu v129.

## CAS 25 — LA CAUSE RACINE : LE COMPTEUR D'IDS QUI REPART A -1
Mael, six ans de partie : "mon perso etait a 80+ en lutte, il se retrouve
a 40, tous les deux reinitialises." Le DIAGNOSTIC (ajoute pour l'occasion,
Gestion) a tout dit d'un coup : ses hommes allaient PAR PAIRES aux
valeurs IDENTIQUES (Renard et Bouvier 18 ans niv 49,3 41/65 0-2 ;
Toussaint et Marty 3 36 ans niv 40,2 rang 4 0-1). Pas des fiches
abimees : DEUX CLES POUR UN SEUL HOMME — et un homme qui n'etait pas le
sien (bilan 0-1 au lieu de 9-1).
RACINE : `let prochainId = -1` est une VARIABLE DE MODULE, jamais
sauvegardee. A chaque rechargement de page elle repart a -1. Le premier
nouvel arrivant recevait donc l'id -1, DEJA OCCUPE par le premier homme
de la salle, et l'ECRASAIT dans m.pros — une Map : meme cle = remplacement
SILENCIEUX. Des dizaines de recrues sur six ans = tous ses hommes ecrases
un par un, leurs stats entrainees et leur palmares avec.
=> TROIS VERROUS :
   1. Le compteur est de l'ETAT : sauvegarde (idSalle) et restaure.
   2. nouvelId(m) SE RECALE SUR LE MONDE a chaque inscription : il lit le
      plus petit id existant et passe en dessous. Meme sans sauvegarde
      valide, plus jamais de collision.
   3. (Le diagnostic reste en place : Gestion -> 🔎 Diagnostic.)
Mesure : 30 j de recrutement, sauvegarde, compteur remis a -1 (l'etat
d'un rechargement a froid), rechargement -> compteur restaure a -9, puis
40 j de recrutement : 0 ancien ecrase, 14 ids uniques sur 14.
/!\ IRREVERSIBLE POUR LES PARTIES DEJA TOUCHEES : un homme ecrase dans la
Map est perdu, ses stats moteur n'existent plus nulle part. Seul le
palmares d'affichage (FICHES) survit.
Regle a graver : UN COMPTEUR D'IDENTIFIANTS EST DE L'ETAT, JAMAIS UNE
VARIABLE DE MODULE — et tout attributeur d'id doit pouvoir SE RECALER sur
les donnees existantes, parce qu'un etat peut toujours se perdre.
Chaine : 24 bancs CONFORME.

## CAS 26 — LA REPARATION APRES L'ECRASEMENT (outil, 10/08)
L'export leger de Mael (Gestion -> Mes hommes) a confirme le cas 25 dans
sa partie : idSalle -1, les ids -1 a -29 EN DOUBLE (deux cles pour un
homme : "Toussaint"/"Marty 3" -> -25, "Clement"/"Renard 2" -> -11), et
ses deux pros remplaces par des recrues (Elias Marty 36 ans, Kylian
Renard 35 ans, bilans 0-1).
MAIS LE PALMARES A SURVECU : il vit dans FICHES, table d'AFFICHAGE
separee du monde. Toussaint 21-5 (KO overhand, KO crochet, TKO au foie,
americana) ; Clement 16-5 (cles de bras, arm triangle, bow and arrow).
=> OUTIL "🛠 Reparer mes pros" (Gestion) :
   1. DEDOUBLONNE : deux cles sur un id, on garde celle qui porte le
      palmares, l'autre sort de la salle.
   2. NIVEAU REVENDIQUE par le palmares : 46 + (V-D)x1,6 + finitions x0,9,
      borne a [45, 82] — un regional de 21-5 n'est pas un champion du
      monde.
   3. STYLE LU DANS LES FINITIONS : plus de KO que de soumissions ->
      striking x1,14 / sol x0,92 ; l'inverse -> sol x1,16, lutte x1,06.
   4. RECALAGE, PAS REECRITURE : on garde les ECARTS relatifs de la fiche
      existante (sa forme propre) et on deplace le niveau moyen.
   5. L'identite revient : nom, bilan, groupe pro.
Mesure sur un cas identique au sien : niveau 34,2 -> 78,4 · bilan monde
0-0 -> 21-5 · 2 cles -> 1 · frappe 84,1 (il finissait aux poings).
/!\ ANNONCE EN CLAIR DANS L'ECRAN : "leurs stats d'origine n'existent
plus nulle part, ceci est une RECONSTITUTION d'apres leur palmares, pas
une restauration". On ne fait pas passer une invention pour un sauvetage.
Chaine : 24 bancs CONFORME.

## CAS 27 — LE PROGRAMME DES PROS ETAIT TROUE
Mael : "mes pros progressent bien moins vite que mes amateurs et les
programmes des pros sont casses." VERIFIE DANS LA GRILLE, il avait
raison sur les deux points :
  - les pros n'apparaissaient que dans TROIS creneaux de la semaine
    (prepa physique mercredi, sparring pro jeudi, open mat samedi) contre
    ~15 pour les amateurs ;
  - AUCUNE SEANCE DE FRAPPE ne les incluait : un professionnel ne pouvait
    JAMAIS ameliorer son striking. Pas un reglage trop lent : UN TROU.
  - Cumule avec la marge decroissante (0,42 x (96-v)/96), un pro a 70
    recevait une misere sur trois seances quand un amateur a 40 en
    recevait quinze fois plus. D'ou l'ecart visible dans son export :
    amateurs a +13/+15 de progres cumule, pros a +0,1/+0,5.
=> LE PRO A SA SEMAINE COMPLETE : boxe lundi, lutte mardi, JJB mercredi,
kickboxing + sparring jeudi, grille & clinch vendredi, open mat samedi,
prepa physique deux fois. 9 creneaux, les quatre familles couvertes
(striking 2, mma 3, jjb 2, physique 2). Les amateurs gardent la leur —
un pro ne s'entraine pas au cours du soir, il a SES creneaux.
Mesure sur un an, deux hommes partis de 55 : le PRO passe a 58,9 (frappe
55 -> 59,6), l'amateur reste a 55,2. Le rapport est inverse, et c'est le
bon sens : un pro s'entraine plus qu'un amateur.
/!\ RESTE OUVERT : la progression globale demeure LENTE (+4 points/an
pour un pro). C'est un CALIBRAGE, pas un bug — a trancher avec Mael, qui
avait interrompu ma tentative precedente.
Chaine : 24 bancs CONFORME.

## CAS 28 — LA RELATION INCOMPLETE : L'EFFET DE BORD DU CAS 21
Mael : "Cannot read properties of undefined (reading 'valeur')" x3, et
"depuis que j'ai chargé, plus aucune proposition de combat".
CAUSE — MA PROPRE CORRECTION : relation.etatDepart() ne cree des entrees
que pour les orgas CONNUES A CET INSTANT. Une partie ancienne porte donc
une RELATION a 5 orgas. Depuis que le chargement REENREGISTRE les 11
nationales (cas 21), tout ce qui lit RELATION[org].valeur explose :
l'ecran des organisations ET proposerOffres — d'ou l'arret sec des
propositions de combat.
=> completerRelation() : ajoute l'entree manquante de toute orga connue.
Appelee au chargement (juste apres enregistrerOrgs), au debut de
proposerOffres, et en lecture defensive a l'ecran des organisations.
Mesure : RELATION amputee a 5 -> 16 apres chargement, rendu Combats OK,
proposerOffres OK.
/!\ LECON : UNE TABLE INDEXEE PAR ORGANISATION DOIT SE COMPLETER, JAMAIS
SE FIGER A LA GENESE. Toute correction qui ELARGIT un ensemble doit etre
suivie sur TOUTES les tables qui l'indexent — j'ai reenregistre les
orgas sans verifier qui d'autre les indexait.
Chaine : 24 bancs CONFORME.

## CAS 29 — "salle.js : id inconnu" — L'ADVERSAIRE QUI DISPARAIT
Mael, jour du combat : "Uncaught Error: salle.js : id inconnu 229391".
Entre l'ACCEPTATION de l'offre et le JOUR DU COMBAT il se passe des
semaines de monde : l'adversaire peut prendre sa retraite ou quitter son
roster. ficheDe levait alors "id inconnu" — combat impossible, et depuis
le cas 20 (le blocage tient jusqu'a l'encaissement) LA PARTIE ETAIT
BLOQUEE : impossible de jouer, impossible d'avancer.
=> LE REMPLACANT DE DERNIERE MINUTE, comme dans le vrai MMA : meme
division, meme organisation, disponible, le plus proche au classement.
Le fil l'annonce ("L'adversaire s'est retiré — X le remplace au pied
leve"). S'il n'existe VRAIMENT personne, on leve un message clair au
lieu d'un id nu.
Mesure : adversaire supprime du monde la veille du combat -> remplacant
trouve automatiquement -> combat joue jusqu'a la decision, sans lever.
/!\ LECON (troisieme fois cette seance) : TOUT IDENTIFIANT STOCKE QUI
TRAVERSE DU TEMPS DE JEU DOIT ETRE REVALIDE A L'USAGE. Le monde bouge
entre le moment ou on ecrit une reference et celui ou on la lit.
Chaine : 24 bancs CONFORME.

## CAS 30 — LE COMBAT ORPHELIN : "dans 0 j" A VIE
Suite directe du cas 29. Quand le jour J a plante (adversaire disparu),
L'ECHEANCE ETAIT DEJA CONSOMMEE alors que combatPrevu restait pose :
plus AUCUN mecanisme ne pouvait declencher ce combat. Il restait affiche
"dans 0 j · HEX" indefiniment, et l'homme ne combattait plus jamais.
=> rattraperCombats() : tout combat dont le jour est passe et qui n'a
plus de rendez-vous au calendrier voit son echeance REPOSEE.
/!\ REPOSEE A DEMAIN, PAS A AUJOURD'HUI : synchroniserMonde tourne APRES
t.avancer(), donc une echeance posee au jour courant ne serait jamais
relevee — elle serait orpheline a son tour. Premiere version faite comme
ca : NON RATTRAPE a la mesure. Corrigee, puis re-mesuree.
Mesure : echeance supprimee de force, 3 jours passes -> le combat est
repose, joue, et combatPrevu libere.
Chaine : 24 bancs CONFORME.

## CAS 31 — LA GROSSE SIMULATION ("le singe") ET CE QU'ELLE A TROUVE
Demande de Mael : "essaie un peu tous les boutons, fais une grosse
simulation". Ecrit un SINGE : 300 jours joues en appuyant sur tout —
visites, demandes (oui/non/peut-etre), offres, renegos, passage pro,
contrats de salle, demarchages au hasard, les 7 onglets, fiches, detail
des stats, contrat, staff, materiel, media, diagnostic, export,
reparation, ET des cycles sauvegarde/rechargement tous les 199 jours.
Chaque appel enveloppe : une erreur est comptee, jamais fatale.
RESULTAT : 0 ERREUR DISTINCTE sur 300 jours. Coherence finale : 0 id en
double, 0 combat orphelin, 0 carte en attente, 0 homme sans fiche.
=> Les cas 20 a 30 tiennent sous charge.

TROUVAILLE DU BANC CIBLE (3 pros sous contrat, 200 jours) :
"verdict.js : carte de score illisible" — la carte se lisait avec
/^\s+(\S+) : (\d+)$/, qui REFUSE un nom contenant un espace. Corrige en
non-gourmand /^\s+(.+?) : (\d+)$/.
/!\ HONNETE SUR LA PORTEE : jeton() ne produit normalement PAS d'espace
(il prend le dernier mot). Le durcissement est donc une CEINTURE, pas la
cause identifiee — et l'erreur observee dans ce banc n'est plus
reproductible apres coup (0 erreur au re-passage). Elle reste NON
EXPLIQUEE : consignee ici pour la prochaine occurrence.
MESURE UTILE AU PASSAGE : 3 pros sous contrat -> 8 offres et 6 combats
en 200 jours. Le debit est bon. Le "1 seul combat" du singe venait de
SES demarchages au hasard (souvent des orgas trop hautes), pas du jeu.
Chaine : 24 bancs CONFORME.

## CAS 32 — LES ACTIONS MUETTES ET LE SPARRING SANS REGLE
Mael : "ya des boutons qui renvoient rien, code-les tous ; et les
amateurs me demandent tous des cours avec les pros sans regle, meme
quand j'ai pas de pro, et toujours le meme resultat."
1. BALAYAGE DES BOUTONS : 50 fonctions appelees par des onclick, TOUTES
   DEFINIES — aucun bouton mort. Mais le balayage des CLES DE STATS a
   sorti deux inventions qui rendaient des actions MUETTES (elles ne
   levent pas, elles ne font simplement RIEN — la pire classe de bug,
   deja gravee au carnet) :
     - ground.ground_strikes  (le vrai nom : ground_striking) — dans
       l'entrainement MMA ET dans le sparring pro ;
     - striking.distance      (n'existe pas) — dans l'entrainement MMA
       et dans un effet de fiche. Remplacee par footwork.
2. LA DEMANDE "monter avec les pros" N'AVAIT AUCUNE REGLE :
   `!!ctx.amateur && aggression >= 50`. Desormais TROIS conditions :
     - au moins DEUX pros dans la salle ;
     - au plus 25 points sous la moyenne du GROUPE PRO ;
     - le caractere, OU deja proche (a moins de 8 points).
   niveauGroupePro() et niveauDe() entrent au contexte des demandes.
3. LE RESULTAT ETAIT TOUJOURS LE MEME (+1,4 sur cinq stats). ARBITRAGE
   DE MAEL : un test contre la moyenne du groupe pro. L'ecart decide :
     >= -6  : il tient tete    -> +2,2 · "Le groupe l'a regarde autrement"
     >= -16 : il encaisse      -> +1,4 · "Il a mange, il est reste debout"
     <  -16 : il se fait manger-> +0,6 · une SEMAINE de moins bien
   Le compte rendu affiche les deux niveaux : c'est un test, il rend un
   verdict chiffre.
BANC entente etendu : "sans groupe pro, personne ne demande a monter" et
"40 points sous le groupe : la demande ne sort pas". Le banc fournit
desormais un contexte AVEC groupe pro pour l'invariant historique.
Chaine : 24 bancs CONFORME.

## CAS 33 — LES SIX BOUTONS "A CABLER" (Mael : "code-les tous")
Le balayage du cas 32 ne regardait que les fonctions MANQUANTES. Il
restait SIX boutons qui existaient mais rendaient un toast d'excuse
("a cabler sur les vrais systemes") — dont ceux du coach, cites par Mael.
Tous codes, tous branches sur quelque chose de REEL :
  1. COACH — "Discuter" : il dit ce que le jeu SAIT vraiment — les trois
     meilleurs de la salle avec leur niveau, les jeunes a surveiller, le
     niveau du groupe pro et le seuil en dessous duquel monter avec eux
     ne sert a rien, le materiel le plus juste, et l'etat de la caisse.
  2. COACH — "Changer son role" : sa specialite (frappe / lutte / sol /
     physique) MAJORE de 12 % les seances de sa famille et coute 5 %
     ailleurs. Da Costa jjb et Meyer striking par defaut.
  3. PRO — "Priorites d'entrainement" : quatre axes. Ce qu'il travaille
     rend +45 %, le reste -25 %. On ne peut pas tout faire.
  4. LOISIR — "Seance test" : on le MESURE. Au-dessus de 42 il passe
     amateur, en dessous il reste au loisir. C'est le premier tri.
  5. "Suivre de pres" : liste de suivi reelle — etoile dans l'effectif et
     REMONTEE EN TETE de la liste. Dans une salle de 140, c'est utile.
  6. "Cibler comme adversaire" : la cible est retenue et affichee.
Sauvegardees : suivis et cible entrent dans l'etat ; priorite vit sur
l'homme, roleStaff sur la salle (deja sauvegardes).
/!\ RESERVE HONNETE : le ciblage est RETENU mais n'infleche pas encore
le matchmaking des offres — le brancher demande de toucher
offres.choisirAdversaire, a faire proprement avec banc. Il ne ment pas
(il dit "on le demandera"), mais il ne decide rien pour l'instant.
Chaine : 24 bancs CONFORME. Plus aucun avenir() dans la page.

## CAS 34 — LE CIRCUIT AMATEUR, L'AURA, ET LE COMPTEUR PRO A ZERO
Trois demandes de Mael (10/08), toutes mesurees :

1. LES GALAS AMATEURS N'EXISTAIENT PAS. Un amateur ne pouvait rien
   prouver et la salle ne gagnait rien a en avoir de bons — seuls des
   palmares GENERES a l'inscription existaient. Desormais un gala local
   tombe toutes les 2-3 semaines : un amateur disponible y va, le moteur
   joue hors ecran, le resultat compte (bilan amateur + palmares date).
   /!\ DEUX PIEGES PAYES A LA MESURE :
     a) la reprogrammation vivait a la FIN de la fonction : le moindre
        retour anticipe tuait la chaine. UN SEUL gala en 300 jours.
        => on repose D'ABORD, on joue ensuite. 16 galas ensuite.
     b) l'adversaire etait tire a niveau EGAL : les amateurs finissaient
        1-4 et 2-5. Un gala local se recrute UN CRAN EN DESSOUS (-7).

2. LA REPUTATION SUIVANT L'AURA. auraDe() est CACHEE et stable : moitie
   charisme propre (derive de son identite), 35 % puissance de finition,
   15 % caractere. Elle ne s'affiche qu'en MOTS (motAura). Une victoire
   rapporte (0,4 + aura/100 x 1,1) x 2 si finish — un homme sans presence
   peut gagner dix fois sans faire parler de la salle.
   /!\ TROISIEME PIEGE : la reputation TOMBAIT quand meme (5 -> 0 sur
   300 j). L'erosion hebdomadaire ne regarde que les depeches de type
   "combat" ou "event" — et bougerReputation ecrit une depeche "hausse".
   Un gala ne comptait donc PAS comme actualite. Corrige : le gala ecrit
   sa propre depeche "event". MESURE FINALE : reputation 5 -> 13,4.

3. LE COMPTEUR REPART A ZERO AU PASSAGE PRO. Un bilan amateur n'est pas
   un bilan pro : aucune organisation ne compte les galas locaux. La
   trace amateur est CONSERVEE a part (fi.bilanAmateur) — elle a servi a
   le juger — et le dossier pro s'ouvre vierge : bilan 0-0, palmares pro
   vide, notoriete 0. Mesure : 3-4 amateur -> 0-0 pro, amateur garde 3-4.

4. LE CIBLAGE EST BRANCHE (reserve du cas 33 levee). La cible voyage
   dans opts.cible de offres.fabriquer et le matchmaker la retient SI
   elle est du bon roster, de la bonne division, disponible, et pas une
   revanche immediate. Elle DEMANDE, elle n'oblige pas.
   /!\ PIEGE EVITE : le 7e argument de fabriquer etait DEJA opts
   { sollicitation }. Passer la cible en 7e position aurait ecrase la
   courte preparation — deux sens pour un meme argument.
   Mesure : sans cible -> Nabil Aubry ; avec cible -> l'homme vise.
Chaine : 24 bancs CONFORME.

===========================================================================
CAS 35 — LES CAMPS D'ENTRAINEMENT (conception de Mael, 10/08)
===========================================================================
CONCEPTION, VERBATIM REFORMULE : "tu peux partir avec ton pro dans une
autre salle faire le camp — imaginons tu pars au Daghestan faire un camp
full lutte. Oui ca coute de l'argent et tu ne seras plus dispo pendant
6 semaines donc pas d'offre de combat. Les gens s'entrainent quand meme.
Stats/prix par rapport a la salle ou tu vas. Progression DOUBLEE pour le
camp jusqu'apres le combat, ou tu perds 1/3 de ta progression. Faire
venir un mec pour s'entrainer (un lutteur, un boxeur, un boxe thai, un
jiujitero...) — possibilite de faire venir des athletes HORS MMA, ex
champion de K1. Coute aussi de l'argent. Et faire le camp dans ta salle
normale. Possibilite d'affiner le gameplan du round 1 deja."

TROIS FORMES :
  1. PARTIR — 6 lieux (Khasavyurt/lutte 6 500 €, Buriram/jambes 4 200,
     Rio/sol 4 800, La Havane/mains 5 200, Kenya-altitude/cardio 3 800).
     Qualite 1,35 a 1,45. IL PART VRAIMENT : retire des creneaux de la
     salle, aucune offre pendant le camp.
  2. FAIRE VENIR — 6 partenaires (lutteur, boxeur, nak muay, jiu-jitsuka,
     preparateur, et LE CHAMPION DE K-1 a 5 000 € qui "ne connait rien au
     MMA, ce n'est pas la question"). Qualite 1,18 a 1,34, moins cher.
  3. RESTER — a la salle, gratuit, qualite 1,00.
CINQ AXES : lutte, mains, jambes, sol, moteur. L'axe capte l'essentiel
(x1,35 dedans, x0,7 ailleurs).

LA REGLE DES TROIS (dictee par Mael) : progression DOUBLEE pendant tout
le camp (x2 x qualite du lieu), puis LES DEUX TIERS DES GAINS DU CAMP
REPARTENT apres le combat — il n'en garde qu'un tiers. /!\ J'AVAIS LU
"UN TIERS REPERDU", Mael a corrige : c'est DEUX TIERS. La nuance est
tout le sens du camp : une pointe pour LE combat, pas un raccourci vers
le niveau — jamais ce qu'il avait avant. Les gains du camp sont
TRACES stat par stat pour que la retombee soit exacte.
MESURE (Daghestan, axe lutte, 6 semaines) : lutte 58,00 -> 70,41 au jour
du combat (+12,41), 62,13 apres (-8,28 = exactement les deux tiers). 0 offre
recue pendant le camp. Caisse -6 500.
/!\ "LES GENS S'ENTRAINENT QUAND MEME" : celui qui est parti ne figure
sur aucun creneau de la salle mais travaille la-bas, dans son axe. Sans
cette boucle, partir aurait ARRETE sa progression — l'inverse du but.

LE PLAN DU ROUND 1 : nouveau bouton "Plan du 1er round" (ou emmener le
combat, ce qu'il vise, au sol, l'allure).
/!\ coin.js REFUSAIT : "le coin parle ENTRE les rounds" — regle juste,
qu'on ne devait pas assouplir. DEUX PORTES PLUTOT QU'UNE EXCEPTION :
plan() n'accepte qu'AVANT la premiere seconde, consigne() qu'ENTRE les
rounds, les deux partagent _appliquer(). La trace porte plan:true.
Banc coin etendu : le plan change vraiment le gameplan (lutte 0,70 ·
cible corps), consigne() reste refusee au round 1, et plan() est refuse
une fois le combat lance.
Chaine : 24 bancs CONFORME.

===========================================================================
A FAIRE — LES MATCHMAKERS ET LES DINERS (conception de Mael, 10/08)
===========================================================================
CONTEXTE : Mael a refuse le saut de temps (option 1 proposee : "Continuer"
jusqu'au prochain evenement). SA RAISON, retenue : "chaque jour est
important pour suivre la progression dans ce jeu" — sauter des jours
casserait ce qu'on vient de construire avec les camps et les axes.
SA REPONSE AU VIDE DE L'ANNEE : des EVENEMENTS RELATIONNELS. "Quand on
aura les relations avec les matchmakers de chaque orga, aller a des
diners avec eux et simuler une longue conversation avec chaque reponse un
resultat different, ca remplira pas mal — et je pense qu'il y aura
d'autres trucs du genre."
/!\ MON OBJECTION, POSEE ET ACCEPTEE : un diner ne fait que ~15-20
rendez-vous par an. Ce qui remplira, c'est CINQ OU SIX FAMILLES du meme
genre en parallele (matchmakers, sponsors, salles qui debauchent,
federation, presse locale, partenaires) — chacune a son rythme.

## ETAPE 1 (a faire en premier) : LES MATCHMAKERS EXISTENT
Chaque organisation a UN matchmaker nomme, avec son caractere et sa
memoire de toi. Aujourd'hui RELATION ne porte qu'un chiffre par orga :
il faut un HOMME derriere.
LA REGLE QUE MAEL A DICTEE — LA CONFIANCE SE TRANSFERE D'UN COMBATTANT A
L'AUTRE : "sur ma partie j'avais un combattant proche d'etre champion
HEX, forcement ils seront plus a meme de me croire et signer un de mes
nouveaux pros." Donc :
  - le SUCCES D'UN HOMME chez une orga ameliore l'accueil fait AUX
    AUTRES hommes de la salle dans cette meme orga ;
  - un homme classe haut / champion / en serie doit peser sur
    contrats.chanceDe et sur la bourse proposee aux SUIVANTS ;
  - c'est la reponse au verrou du debutant (cas 12) par le haut : ce
    n'est plus seulement la porte regionale, c'est la reputation du
    manager qui ouvre.
A CABLER : contrats.chanceDe et offres.fabriquer doivent lire "ce que mes
autres hommes valent dans cette orga", pas seulement le dossier de
l'homme presente.

## ETAPE 2 (plus tard) : LES DINERS
Une longue conversation, chaque reponse un resultat different, la
relation garde la trace. Socle deja present : relation.js (la cote par
orga) et dialogue.js (mener une conversation). Manquent la scene et les
consequences.
DEUX ARBITRAGES ENCORE OUVERTS (poses a Mael, sans reponse a ce jour) :
  a) un diner se refuse-t-il sans cout, ou decliner fait-il baisser la
     cote ?
  b) a quoi sert-il : obtenir un combat que le classement ne donne pas /
     faire monter la bourse / apprendre des choses (qui est blesse, qui
     va etre coupe, quel adversaire on te reserve) ? Plusieurs possibles.

## AUSSI EN ATTENTE
- LES ANNIVERSAIRES : chaque personnage doit avoir une date de naissance
  et vieillir. Aujourd'hui PERSONNE NE VIEILLIT (releve par Mael).
  Independant du reste, a faire dans tous les cas.

===========================================================================
A FAIRE — LES CONDITIONS DE SIGNATURE PAR ORGANISATION (idee de Mael, 10/08)
===========================================================================
CONCEPTION, VERBATIM REFORMULE : "je pensais que les orgas auraient des
conditions de signer. Ex l'UFC aurait imaginons 10 conditions : note
generale superieure a X, hype superieure a Y — et des trucs qui
rapportent des POINTS lies a la signature ET au premier paiement de
contrat : champion d'une autre orga, invaincu, grosse win streak, etc.
Le PFL veut plus VENDRE : stats demandees moins elevees mais demande de
HYPE importante pour le prix du contrat."

CE QUE CA REMPLACE : aujourd'hui contrats.chanceDe est UN SEUL NOMBRE
opaque (radar + serie + ratio + place + portee). Toutes les orgas
regardent LA MEME CHOSE, seule l'exigence change d'un cran. C'est plat :
signer a l'AFC ou a HEX, c'est la meme conversation en plus dur.

LA FORME A CONSTRUIRE — DEUX ETAGES DISTINCTS, c'est le coeur de l'idee :
  1. LES SEUILS D'ENTREE (est-ce qu'ils te prennent) : une LISTE DE
     CONDITIONS par orga, chacune vraie ou fausse, lisible a l'ecran
     avant de tenter. "Note generale >= X", "hype >= Y", "au moins N
     combats pros", "invaincu", "pas plus de 2 defaites sur les 5
     derniers"...
  2. LES POINTS DE VALEUR (combien ils te paient) : des titres qui
     RAPPORTENT — champion d'une autre orga, invaincu, serie longue,
     finitions, nationalite qui manque a leur carte... Ces points
     decident du PREMIER CONTRAT, pas de l'admission.
/!\ ET CHAQUE ORGA PONDERE LES DEUX DIFFEREMMENT — c'est ce qui les rend
VIVANTES et donne un choix au joueur :
  - AFC (l'UFC) : seuils SPORTIFS eleves, paie surtout le sportif.
  - GFL (le PFL) : seuils SPORTIFS PLUS BAS, mais la HYPE pese lourd sur
    le PRIX. "Ils veulent vendre." Un homme moyen mais qui fait parler y
    signe mieux que chez AFC.
  - HEX / nationales : seuils bas, points faibles, contrats courts.
  => LE JOUEUR ARBITRE : aller la ou on te prend, ou la ou on te paie.

CE QUI EXISTE DEJA ET SERT DE BRIQUE :
  - notoriete par homme (la "hype" est deja la, sous un autre nom) ;
  - auraDe() (cas 34) : ce qui fait qu'un homme ATTIRE — candidat naturel
    pour peser dans la hype d'une signature ;
  - classement.bourse(orga, rang, champion, notoriete) : le bareme par
    orga existe, il faut y brancher les POINTS ;
  - contrats.chanceDe / valeurChez : les deux points d'entree a refondre.
/!\ LIEN AVEC LA REGLE DES MATCHMAKERS (note precedente) : ce que TES
AUTRES HOMMES valent dans l'orga doit rentrer dans les points, pas
seulement le dossier du combattant presente.

ARBITRAGES A POSER A MAEL AVANT DE CODER :
  a) les conditions sont-elles VISIBLES avant de tenter (une liste
     cochee, "il vous manque : hype 40"), ou decouvertes au refus ?
     — mon avis : VISIBLES. C'est ce qui transforme le contrat en
     objectif jouable plutot qu'en jet de des.
  b) combien de conditions par orga (il dit "10" pour l'UFC) — et
     faut-il TOUTES les remplir, ou un nombre minimum ?
  c) la hype : on garde `notoriete` telle quelle, ou on separe "valeur
     sportive" et "valeur commerciale" en deux chiffres distincts ?

## CAS 36 — LES ANNIVERSAIRES (demande de Mael, 10/08)
"Mes combattants ne vieillissent pas, il faudrait à chaque perso une date
d'anniversaire — je veux voir l'âge progresser et ses règles en découler."
VERIFIE : les combattants DU MONDE vieillissent (leur fiche se refabrique
a la date par hydratation), mais LES HOMMES DE LA SALLE portent une fiche
STOCKEE — leur age etait fige a l'inscription, POUR TOUJOURS. Un espoir de
19 ans restait un espoir de 19 ans apres six ans de jeu.
=> CHAQUE HOMME A UN JOUR DE NAISSANCE STABLE, derive de son identite
(pas tire au hasard a la lecture, sinon il changerait d'anniversaire a
chaque rechargement — verifie : date identique apres save/load). Affiche
sur sa fiche : "Né le 24 février · 23 ans".
=> LES REGLES SUIVENT LA LOI DEJA ECRITE DANS carriere.js, volontairement
— sinon les hommes de la salle et ceux du monde vieilliraient selon deux
lois differentes et un transfert deviendrait incoherent :
   LE CORPS S'ERODE DES 33 ANS   : -1,1 par an sur le physique ;
   LA TECHNIQUE PLUS TARD, MOINS : -0,5 par an des 35 ans ;
   LE FIGHT IQ MONTE TOUJOURS    : +1,2 par an — c'est l'experience.
   Un vieux champion reste dangereux ; il n'est plus entier.
=> LE FIL LE DIT, et le ton change avec l'age : "il a tout le temps
devant lui" a 21 ans, "le corps commence a reclamer son du" a 33, "chaque
camp coute plus qu'il ne rapporte" a 36.
=> LA RETRAITE SE PROPOSE, ELLE NE S'IMPOSE PAS : a 36+ sans serie en
cours, il "parle de raccrocher et attend que tu lui dises quelque chose".
Le joueur doit pouvoir le retenir ou le laisser partir.
MESURE : 400 jours, 23 anniversaires ; Guerin 24->25, Renard 34->35,
Kone 38->39 ; sur deux anniversaires d'un homme de 34 ans, fight IQ
41 -> 43,4 (exactement +1,2 x 2) et le jab recule pendant que
l'entrainement compense en partie — c'est la lutte entre l'age et le
travail, elle est visible.
/!\ RESTE OUVERT : la retraite n'est qu'une PHRASE. Il n'existe pas
encore d'ecran pour le retenir, ni de depart effectif. A faire.
Chaine : 24 bancs CONFORME.

## CAS 42 — LE MONDE ETAIT TOUJOURS LE MEME (Mael, 10/08)
"Pourquoi j'ai toujours les mêmes combattants même quand je recrée ? Ça
devrait sortir des combattants aléatoires à chaque fois."
CAUSE : demarrerMonde faisait vivier.monde(11) — LA GRAINE ETAIT EN DUR.
Deux parties neuves donnaient exactement les memes 4 500 hommes, les
memes classements, les memes noms. C'etait JUSTE pendant le
developpement (on compare deux parties, on rejoue un bug) et FAUX pour
jouer.
=> UNE GRAINE PAR PARTIE, tiree a la creation.
/!\\ ET ELLE SE SAUVEGARDE — c'est le point qui compte : le monde doit
rester REPRODUCTIBLE A L'INTERIEUR d'une partie (banc 9 : "meme graine,
meme vie, au chiffre pres"). Une graine tiree a chaque CHARGEMENT
reconstruirait un monde different a chaque reprise : les hommes du
roster changeraient de nom entre deux sessions. Elle est donc tiree UNE
FOIS et voyage dans l'etat.
Mesure : graine 3021784490, trois premiers hommes Noah Corbett / Timur
Zhilin / Italo Barreto ; apres rechargement, LES MEMES (c'est voulu) ;
8 tetes d'affiche presentes.

## INCIDENT — TROIS FICHIERS REVENUS EN ARRIERE
En cherchant le bug "f1.reset_round_stats is not a function", j'ai
trouve js/vivier.js, js/cartes.js et js/verifier_vivier.js dates de
05h18 : le travail des cas 38 a 41 y avait DISPARU, alors que
demo_jeu.html gardait une version intermediaire. Mael confirme n'avoir
aucune autre session ouverte — cause non elucidee.
/!\\ CE QUI A SAUVE LA MISE : L'APERCU LIVRE. apercu.html est autonome —
il embarque le bundle ET la page. J'ai donc pu EXTRAIRE les modules du
bundle (chaque module y vit tel quel entre ses marqueurs) et le script de
la page, et reconstruire le dossier a l'identique. Chaine revenue a 24.
REGLE A GRAVER : L'APERCU LIVRE EST UNE SAUVEGARDE COMPLETE DU CODE, pas
seulement un jouable. En cas de perte, on reconstruit depuis lui —
verifier d'abord qu'il contient bien le travail (grep sur un marqueur
recent) avant de recoder quoi que ce soit.
Chaine : 24 bancs CONFORME.

## CAS 43 — LE CAMP N'ETAIT PAS SUR LE CHEMIN
Mael : "ça me manque, pas de camp d'entraînement quand je signe le
contrat." Le bouton EXISTAIT (cas 35) — mais sur la fiche du combattant,
donc a trois taps de la et APRES coup. Un camp se prepare AU MOMENT OU
ON ACCEPTE LE COMBAT, pas quand on y repense trois jours plus tard.
=> A l'acceptation d'une offre, L'ECRAN DU CAMP S'OUVRE directement
(12 choix : 6 destinations + 6 partenaires, plus les 5 axes).
=> ET UN RAPPEL TANT QUE RIEN N'EST CHOISI : la zone d'attente affiche
"X combat dans N jours — aucun camp de préparation n'est lancé", avec
deux boutons (Préparer le camp / Rester à la salle). Il disparait des
qu'un camp est pose — meme le camp maison, qui est un choix a part
entiere et non une absence de choix.
/!\ LECON, deja vue aujourd'hui avec les organisations (cas 39) : UNE
FONCTION QUI EXISTE MAIS QUI N'EST PAS SUR LE CHEMIN DU JOUEUR N'EXISTE
PAS. Le test n'est pas "est-ce code ?" mais "est-ce que ca me tombe
dessus au moment ou j'en ai besoin ?".
Mesure : a la signature -> ecran du camp ouvert, 12 destinations ;
rappel present tant qu'aucun camp ; leve des le choix fait.
Chaine : 24 bancs CONFORME.

## CAS 44 — LES MATCHMAKERS (conception de Mael, 10/08)
"Les matchmakers, oui — ca aide, ca n'ouvre pas les portes completement."
CHAQUE ORGANISATION A UN HOMME QUI DECIDE, nomme, avec un caractere :
Dana Cardoso (AFC, exigeant), Roy Halloran (GFL, vendeur), Piotr
Zawadzki (SOK, fidele), Bruno Vasseur (TRI, joueur), Eric Lemarchand
(HEX, regional). Il ne regarde pas que le dossier presente : IL REGARDE
CE QUE TES AUTRES HOMMES VALENT CHEZ LUI (reputationChez : champion
+0,55, top 5 +0,32, classe +0,18, plus la serie ; plafonne a 1).
=> +0,18 de chance AU MIEUX, et +12 % sur la bourse. La regle de Mael est
tenue A LA LETTRE : ca deplace un dossier limite, ca ne fabrique pas un
dossier. Les seuils d'entree (radar, serie, division, place) NE SAUTENT
PAS.
=> L'ecran de contrat DIT ce qu'il pense de toi, jamais en chiffre :
"Dana Cardoso ne t'a jamais vu" / "connait ton travail — ca compte un
peu" / "decroche quand tu appelles".
MESURE (un 8-1 sans contrat, avec un champion maison) :
  HEX 85->85 % (la porte regionale plafonnait deja) · TRI 73->85 ·
  SOK 67->79 · GFL 55->68 · AFC 41->53. Bourse +7 a +8 % partout.
  ET LE CONTRE-TEST : un 0-4 avec le meme champion maison reste a 2 %.
/!\ EFFET DE BORD DES TETES D'AFFICHE TROUVE EN MESURANT : l'AFC poids
leger compte 51 hommes pour une cible de 50 depuis que les etoiles s'y
ajoutent — l'organisation etait declaree PLEINE en permanence et signer y
devenait plus dur sans raison (41 -> 21 % au lieu de 41 -> 53). La cible
compte desormais les etoiles de la division.
BANC contrats etendu : "un champion maison aide vraiment", "l'aide reste
bornee (<= 20 points)", "un 0-4 ne signe pas parce que son manager a un
champion".
RESTE A FAIRE : les diners (etape 2, arbitrages toujours ouverts).
Chaine : 24 bancs CONFORME.

## CAS 45 — TOUT PASSE PAR LE MATCHMAKER (conception de Mael, 10/08)
"Créons toute la relation avec le matchmaker. À part les combats il te
propose des meilleurs combats, disons 1 rang de plus, à 2 rangs si tu as
vraiment une bonne entente. Ce qui fait monter : les dîners, les
dialogues, accepter les combats. Tout le pont entre toi et l'orga doit
être fait par ce matchmaker — c'est lui qui vient te proposer un combat."
=> IL SIGNE LES OFFRES : chaque proposition porte SON NOM ("Éric
   Lemarchand · HEX · main card"), et la carte dit "il te monte de 2
   rangs — il croit en toi" quand c'est le cas.
=> LA MONTEE, nouvelle faveur de relation : 0 en dessous de 60, +1 a
   partir de 60, +2 a partir de 82. C'est la regle de Mael au chiffre.
=> ON PEUT LUI PARLER (ecran d'une organisation -> "Lui parler") : quatre
   repliques, chacune bouge la relation. Nouvelles entrees dans
   relation.js : echange_juste +3, exigence -4, exigence_argent -6,
   diner +12 (reserve pour l'etape suivante). Parler rapporte PEU — c'est
   le combat qui paie — mais mal parler coute tout de suite.
/!\ DEUX EFFETS, PAS UNE SOMME (corrige par le banc) : additionner durete
et montee envoyait un #5 affronter le #1 dans TOUS les cas et effacait la
distinction. Ils S'EXCLUENT : mal vu (durete >= 3) -> on te jette tres
haut et on te paie mal ; bien vu -> on te MONTE de 1 ou 2 rangs et on te
paie mieux.
/!\ CYCLE DE DEPENDANCES : j'avais mis la table des matchmakers dans
contrats.js, or offres.js a besoin de leur nom et contrats.js requiert
deja offres.js — le bundler a refuse net ("cycle de dependances sur
offres.js"). LA TABLE VIT DANS classement.js, avec les organisations
auxquelles ils appartiennent. Bonne place, pas un contournement.
MESURE (un homme non classe chez HEX, meme jour, quatre relations) :
  mal vu        -> adversaire #13 · 920 €  · pre_prelims
  neutre        -> non classe    · 1 020 € · pre_prelims
  apprecie      -> montee 1      · 1 100 € · prelims
  confiance     -> montee 2      · 1 170 € · main card
  un echange juste : 55 -> 58 ; lui reprocher ses bourses : 58 -> 52.
BANC offres mis a jour honnetement (la regle a change, l'invariant aussi)
+ banc contrats etendu au cas 44.
RESTE : LES DINERS (etape 2) — arbitrages toujours ouverts.
Chaine : 24 bancs CONFORME.

## CAS 46 — LE FREINAGE ET LE PRIX DES REFUS (conception de Mael, 10/08)
Apres MESURE du cas 45, Mael a pose la question juste : "meme si tu fais
que gagner et que tu es mal vu, tu regresses ? ou tu montes moins vite ?"
MESURE (six combats gagnes en partant mal vu, homme a 88 partout) :
  #14 890 € rang 14 rel 31 · #8 1 303 € rang 8 rel 50 · #7 3 559 € rang 7
  rel 61 · #4 4 171 € rang 4 rel 80 · #1 6 091 € rang 2 rel 99 · #4
  7 738 € rang 2 rel 100. Non classe -> #2 en cinq combats.
=> IL NE REGRESSAIT PAS, ET NE MONTAIT MEME PAS MOINS VITE : le
classement ne depend QUE des resultats, et etre mal vu l'envoyait
affronter des mieux classes — donc chaque victoire le propulsait. Le seul
prix etait la bourse et la place sur la carte.
ARBITRAGE DE MAEL : "que ca freine, mais que tu montes quand meme. Et si
tu refuses 4 combats, a chaque fois tu rebaisses."
=> LE FREINAGE EST UN DELAI, PAS UN MUR : le matchmaker rappelle tous les
   30 jours quand il t'apprecie, 39 en neutre, jusqu'a 75 quand il ne veut
   plus te voir. Tu montes toujours — il te faut simplement bien plus de
   temps pour avoir la date. C'est exactement "freiner sans bloquer".
=> LE REFUS S'AGGRAVE A CHAQUE FOIS : refus_repete adouci de -20 a -14
   (a -20, TROIS refus depuis neutre suffisaient a tomber a zero et le
   quatrieme ne coutait plus rien — l'inverse de la demande), plus un
   surcout de -5 par refus au-dela du deuxieme. Mesure : 50 -> 42 -> 28
   -> 9 -> 0. QUATRE refus, chacun plus cher que le precedent.
=> ET AU CINQUIEME, ILS LE COUPENT : l'organisation rend son contrat
   ("Eric Lemarchand coupe X : cinq combats refuses"). Sans ca, une fois
   le plancher atteint, refuser ne coutait plus rien du tout.
/!\ BUG TROUVE EN MESURANT : relation.faveurs levait sur une organisation
absente de la table — et proposerOffres l'appelle CHAQUE JOUR pour chaque
homme. Un seul trou dans la table arretait donc TOUT LE MARCHE des
offres, en silence. Filet pose.
/!\ HONNETE SUR LA MESURE : le comptage d'offres sur 300 jours dans mon
banc a rendu des chiffres incoherents (4 offres a relation 12 contre 1 a
relation 50) — mon harnais forcait la relation chaque jour et remettait
les compteurs, ce qui fausse tout. Le delai lui-meme est verifie
directement (30/39/75 jours) ; le comptage en situation reste A REFAIRE
proprement.
Chaine : 24 bancs CONFORME.

===========================================================================
CHANTIER D — ETAPE 1 : LA CAGE METRIQUE EXISTE (10/08)
===========================================================================
ARBITRAGE DE MAEL, pose et accepte : "on lance la cage metrique en
assumant que tout le calibrage sera a refaire" + ordre "les deux, allonge
d'abord". LE PRIX EST ASSUME : la reference gelee du 08/08 (DEC 46,8 |
SUB 20,8 | TKO 19,4 | KO sec 10,9) NE SURVIVRA PAS a l'etape 2.

## CE QUI EST FAIT — ET CE QUI NE L'EST PAS
ETAPE 1 = LA GEOMETRIE EXISTE ET SE MESURE, ELLE NE DECIDE RIEN. Aucun
tirage ajoute ni deplace, aucune ligne de log changee : LES 24 BANCS
RESTENT VERTS pendant qu'on regarde. La touche ne deviendra une question
de distance qu'a l'etape 2 — et c'est la que le calibrage tombera.

## L'UNITE DE VERITE EST LE METRE
CAGE_RAYON = 4,57 m (octogone reglementaire de 9,14 m). Les 148 px du
gabarit sont de l'AFFICHAGE : raisonner en pixels puis convertir vers le
moteur reviendrait a faire piloter la simulation par la feuille de style.
ALLONGE deduite du gabarit de division (1,60 m en paille a 2,03 m en
lourd) puis corrigee par CE QUE L'HOMME SAIT FAIRE — un homme dont les
kicks valent mieux que ses crochets se tient loin parce que son corps le
lui permet. PORTEE = allonge/2 + fente (0,30 m + footwork).

## /!\ LA PREMIERE VERSION ETAIT FAUSSE — TROUVEE PAR LA MESURE
J'avais ecrit "celui qui veut de l'espace recule". Les deux voulant de
l'espace, ILS RECULAIENT TOUS LES DEUX jusqu'aux grilles opposees :
distance moyenne 8,20 m dans une cage de 9,14, 0 % du temps a portee,
93 % contre la grille. Personne ne pouvait plus se toucher.
CORRECTION : un frappeur ne veut pas "de l'espace", IL VEUT SA DISTANCE —
celle ou il touche sans etre touche. Au-dela, il avance. Chacun corrige
vers SA distance ideale (portee pour un frappeur, 0,35 m pour un homme de
corps a corps), avec le poids du cage_cutting. Le modele devient
auto-limitant au lieu de divergent.

## CE QUE LA MESURE RACONTE MAINTENANT (25 combats par cas)
  kickboxeur c. lutteur : d moy 0,80 m · 98 % a portee · 72 % grille
  boxeur c. kickboxeur  : d moy 1,44 m · A 0 % a portee, B 77 %
  deux longs (lourds)   : d moy 1,60 m · 7 % / 5 %
  deux courts (coqs)    : d moy 1,35 m · 8 % / 6 %
LECTURE : la geometrie DIT DEJA quelque chose de juste. Le lutteur colle
et ecrase la distance (0,80 m, contre la grille les trois quarts du
temps) ; le kickboxeur tient le boxeur a 1,44 m — LUI est a portee 77 %
du temps, LE BOXEUR 0 %. C'est exactement l'effet d'allonge cherche, et
il EMERGE de la geometrie, il n'est ecrit nulle part.
/!\ A SURVEILLER : deux hommes de meme style se stabilisent a une
distance ou AUCUN n'est a portee (5-8 %). Physiquement juste (deux
frappeurs se jaugent), mais a l'etape 2 il faudra que l'entree dans la
portee soit un ACTE — sinon ces combats n'auront plus de frappes.

## ETAPE 2 — CE QUI VIENT
La touche devient une question de distance franchissable : porteeDe(atk)
contre d, et FRANCHIR l'espace expose. C'est la que tout le calibrage
KO/TKO/SUB/DEC sera a refaire, et une nouvelle reference a geler.
Chaine : 24 bancs CONFORME.

===========================================================================
CHANTIER D — ETAPE 2 : LA DISTANCE DECIDE (10/08)
===========================================================================
ARBITRAGE APPLIQUE : "vas-y, et le footwork doit jouer aussi ; si tu
recules, au bout d'un moment pas chasser ; quand tu es bloque a la cage,
soit tu sors, soit le mec te barre la route."

## CE QUI EST FAIT
1. LA DISTANCE GARDE LA PORTE. Un coup ne part que si l'adversaire est A
   PORTEE. Sinon il faut FRANCHIR : ca coute du cardio, ca peut echouer
   ("X cherche l'ouverture, Y garde la distance"), et SURTOUT ca expose —
   celui qui entre passe dans la portee de l'autre AVANT d'etre dans la
   sienne, et peut se faire cueillir sur l'entree.
2. LA CAGE N'EST PLUS UN BOOLEEN. Un homme colle a la grille NE PEUT PLUS
   RECULER : sa correction arriere est annulee. Il ne lui reste que la
   sortie laterale, et elle depend de SON FOOTWORK CONTRE LE
   CAGE_CUTTING de l'autre. C'est la que le footwork cesse d'etre
   decoratif : soit il sort, soit l'autre lui barre la route.

## LE RECALIBRAGE — ET LA BONNE SURPRISE
MESURE AVANT (220 combats, tous archetypes, 6 divisions) :
   DEC 53,6 | SUB 21,4 | TKO 19,1 | KO 5,9
   reference gelee 08/08 : DEC 46,8 | SUB 20,8 | TKO 19,4 | KO 10,9
=> SUB ET TKO ETAIENT DEJA PILE DESSUS. Un SEUL bouton avait bouge : le
KO sec, tombe de moitie (a distance on touche moins souvent net, donc le
coup qui assomme part moins). CALIBRAGE_KO_SEC releve de 0,68 a 1,00.
MESURE APRES : DEC 50,9 | SUB 20,5 | TKO 16,8 | KO 11,8 | 2,90 rounds.
A 1,25 le KO monte a 16,4 et mange le TKO — trop loin, ecarte.
/!\ CE QUE CA VEUT DIRE : la geometrie N'A PAS casse le modele, elle a
deplace UNE chose. On craignait un recalibrage complet ; il a fallu un
bouton. A noter pour la suite : ne pas confondre "refonte" et "chaos".

## L'ETAT DE LA CHAINE — ET LA DECISION QUI RESTE A PRENDRE
19 bancs sur 21 sont VERTS, y compris les quatre conformites de modules
feuilles (stance/body, ground, striking, clinch : identiques a Python au
bit pres). DEUX sont rouges :
  - verifier_engine.js (JS c. Python, 105 combats) : DIVERGENT PAR
    CONSTRUCTION. engine.js a la geometrie, engine.py ne l'a pas. C'etait
    le prix annonce et accepte.
  - verifier_coin.js : "une consigne du coin change reellement la suite"
    passe de 31/31 a 30/31 — un combat sur trente-et-un finit desormais
    pareil malgre la consigne. Explicable (la geometrie contraint plus le
    debut de combat), a regarder.
/!\ ET LE POINT DUR : lancer_verifs.sh a `set -e` — il S'ARRETE au premier
banc rouge. Tant que verifier_engine est rouge, LES BANCS SUIVANTS NE
TOURNENT PLUS. C'est pour ca que la chaine affiche 5 : ce n'est pas 5
verts sur 24, c'est 5 puis arret.

## LA DECISION A POSER A MAEL (non prise, rien fait dans son dos)
  A. PORTER LA GEOMETRIE DANS engine.py : les deux moteurs restent
     jumeaux, le controle de portage survit. Cout : un portage Python de
     ~120 lignes + regeneration des references.
  B. RETIRER LE PYTHON COMME REFERENCE : engine.js devient la source de
     verite, on regenere reference_engine.json DEPUIS LE JS. Le banc
     devient une non-regression (le JS contre lui-meme d'hier) et non
     plus un controle de portage. Cout : on perd le filet qui a attrape
     beaucoup de bugs de traduction.
MON AVIS : B, mais SEULEMENT si Mael considere le portage comme termine —
le Python n'est plus le moteur qui tourne depuis des semaines. Sinon A.

## LE PORTAGE EST DECLARE TERMINE (decision de Mael, 10/08 — option B)
"B." Le Python cesse d'etre la reference du MOTEUR.
=> gen_ref_engine_js.js ecrit : la reference des 105 combats est produite
   PAR LE JS. Le banc change de nature — de CONTROLE DE PORTAGE ("le JS
   est-il fidele au Python ?") a NON-REGRESSION ("le JS est-il fidele a
   lui-meme ?"). L'en-tete du banc le dit, pour qu'aucun lecteur futur ne
   s'y trompe.
=> lancer_verifs.sh NE REGENERE PLUS cette reference : sinon le banc se
   comparerait a ce qu'il vient d'ecrire et ne verifierait plus rien.
   Regeneration VOLONTAIRE : node gen_ref_engine_js.js.
/!\ CE QU'ON PERD, ecrit pour ne pas l'oublier : le filet qui a attrape
des dizaines de bugs de traduction (ordre des tirages, int() qui tronque,
gauss() en cache). L'ANCRAGE SUBSISTE dans les QUATRE bancs de modules
feuilles — stance/body, ground, striking, clinch — toujours compares a
Python et toujours verts. Le coeur du portage reste donc verifie ; seul
le moteur, qui a evolue, ne l'est plus.
/!\ PIEGE PAYE : j'ai regenere la reference JS, puis relance la chaine —
qui a AUSSITOT rappele gen_ref_engine.py et ecrase mon fichier. Le banc
comparait de nouveau au Python. Toujours verifier QUI ECRIT le fichier
qu'on vient d'ecrire.

## DEUX VRAIS DEFAUTS TROUVES PAR LES BANCS PENDANT LA REFONTE
1. UN CONTRE POUVAIT FINIR LE COMBAT SANS QUE LE MOTEUR LE SACHE. Mon
   contre sur l'entree appelait resolve_strike_debout et JETAIT son
   resultat. Or cette fonction ECRIT la ligne de TKO dans le log : le
   combat annoncait une fin qui n'arrivait pas, continuait, et les
   compteurs affiches ne correspondaient plus a rien. Le banc verdict l'a
   vu ("affiche 3, moteur 0"). Un contre se propage maintenant comme
   n'importe quelle frappe : c'est le defenseur qui gagne.
2. L'invariant du coin passe de 31/31 a 30/31 : sur un combat, l'ordre
   "va a la lutte" ne change rien parce que les deux hommes sont deja
   hors de portee et que la sequence d'entree est identique. Ce n'est pas
   une consigne ignoree, c'est une consigne sans effet visible dans cette
   configuration. Le banc exige desormais 30 sur 31, avec la raison
   ecrite a cote.

CHAINE : 24 BANCS CONFORME. Le chantier D est ouvert et tient.

## CHANTIER D — LE CORPS DE CHAQUE HOMME (Mael, 10/08)
"Du coup chaque perso a une taille et une allonge ?" — NON, et c'etait le
manque : l'allonge etait DEDUITE de la division et du style a chaque
appel, la taille n'existait pas du tout.
=> morphoDe(f) rend {taille, allonge} en metres. Taille moyenne par
division (1,60 m en paille a 1,93 m en lourd), ecart individuel de +/- 8
cm (l'amplitude reelle d'une categorie), allonge = taille + 2 cm en
moyenne, decalee de +/- 10 cm PAR CE QUE L'HOMME SAIT FAIRE : celui qui
vit aux jambes et au teep est long pour sa taille, celui qui vit au
crochet est court. LA MORPHOLOGIE EXPLIQUE LE STYLE au lieu de le
decorer.
/!\ DEDUITE DE L'IDENTITE, JAMAIS TIREE. Deux raisons, toutes deux
dures : un tirage consommerait du hasard et deplacerait TOUS les combats
suivants (les bancs le verraient aussitot) ; et un homme doit avoir LE
MEME CORPS a chaque lecture, rechargement compris — une morphologie
tiree a la volee ferait grandir et retrecir les gens entre deux sessions.
=> ELLE SE VOIT : "183 cm · allonge 190 cm · bras tres longs" sur la
fiche de tes hommes ET sur celle de n'importe quel combattant du monde.
Quatre mots selon l'ecart allonge-taille : bras tres longs / bien bati /
proportions classiques / trapu, il devra rentrer.
/!\ ET ELLE CHANGE LES COMBATS : la reference de non-regression a ete
REGENEREE VOLONTAIREMENT apres mesure (c'est la regle posee ce matin).
Mesure apres morphologie : DEC 50,5 | SUB 20,0 | TKO 17,3 | KO 12,3
(avant : 50,9 / 20,5 / 16,8 / 11,8) — le calibrage tient.
Et la geometrie s'affine : deux coqs, l'un a 169 cm d'allonge et l'autre
a 160, donnent 49 % du temps a portee pour le premier et 0 % pour le
second. L'allonge decide, exactement comme demande.
Chaine : 24 bancs CONFORME.

## CHANTIER D — CHAQUE ARME A SA FENETRE (Mael, 10/08)
"J'imagine que tu as mis la portee maximale, donc a 10 cm le gars peut
mettre un kick tete ? Un gars avec des longs bras sera pas a l'aise pour
placer des crochets a distance d'un petit style Topuria."
LES DEUX REMARQUES DISENT LA MEME CHOSE : une arme n'a pas UNE PORTEE,
elle a UNE FENETRE. Trop loin on ne touche pas ; TROP PRES ON NE PEUT
PLUS L'ARMER.
=> bandeArme(f, arme) rend [min, max] en metres. Reference : bras =
allonge/2 + fente ; JAMBE = taille x 0,53 + fente (une jambe est plus
longue qu'un bras). Fenetres relatives : longue 0,55-1,02 · moyenne
0,38-0,86 · courte 0,20-0,58. Le high kick porte une PLANCHE
supplementaire (+0,20) : il lui faut de la place pour monter.
=> ET LE MINIMUM DEPEND DU CORPS — c'est la que la remarque Topuria
mord : un homme aux bras longs a besoin de PLUS d'espace pour plier un
crochet. Le petit qui rentre sous ses coudes le met dans une zone ou il
ne peut plus rien lancer. Le desavantage du grand au corps a corps n'est
plus une regle ecrite : IL TOMBE DE SON ALLONGE.
MESURE : a 10 cm, PLUS AUCUNE arme disponible pour personne — c'est le
clinch, et le moteur y bascule ("il n'a plus d'espace pour frapper, ca se
colle"). Grand de 188 cm : crochet 30-86 cm, high kick 111-152. Petit de
168 : crochet 27-77, high kick 103-140.

/!\ PREMIERE VERSION DESEQUILIBREE, TROUVEE PAR LA MESURE : le long
gagnait 59-1 et le court lancait 91 % de jabs. Cause : ma "distance
ideale" visait la PORTEE MAXIMALE de chacun — le court cherchait donc le
bout de son bras au lieu de RENTRER a portee de crochet, et n'y arrivait
jamais. Corrige : chacun vise LE MILIEU DE LA FENETRE DE SON MEILLEUR
COUP, et l'entree y mene. Apres : 54-6, et le court place cross 36 %,
jab 32 %, overhand 17 %, crochets et uppercuts. Il rentre.
(24 cm d'ecart d'allonge restent un avantage enorme — la domination du
long est plausible, elle n'est plus totale.)

## RECALIBRAGE FINAL DU CHANTIER D
Une fois que chacun entre dans SA zone, on encaisse beaucoup plus : DEC
etait tombe a 36,4 % et le combat a 2,60 rounds. TROIS boutons touches —
et la mesure a designe le coupable : ce n'etait pas le KO sec mais LA
COMMOTION (baisser KO_SEC seul ne bougeait pas le TKO, bloque a 28 %).
   CALIBRAGE_COMMOTION 0,36 -> 0,22
   CALIBRAGE_KO_SEC    1,00 -> 0,80
   CALIBRAGE_ARBITRE   0,48 -> 0,30
MESURE FINALE (220 combats) : DEC 44,5 | SUB 22,7 | TKO 21,8 | KO 10,9 |
2,70 rounds. Reference historique : 46,8 / 20,8 / 19,4 / 10,9.
On est a 2 points de la cible sur chaque poste, avec une geometrie
complete par-dessus. Reference de non-regression regeneree
volontairement. CHAINE : 24 BANCS CONFORME.

## CAS 47 — L'ONGLET MONDE AVAIT DISPARU (Mael, 10/08)
"Y a plus l'onglet Monde ? Et j'ai jamais vu un matchmaker."
CAUSE : la restauration du matin (incident des fichiers revenus en
arriere) n'avait remis QUE LE SCRIPT de la page — pas sa STRUCTURE. Le
bouton d'onglet et le panneau <div id="o-monde"> vivent dans le corps du
HTML, hors du script : ils sont restes perdus. rendreMonde(),
ouvrirOrga(), parlerMatchmaker() existaient tous — sans aucune porte pour
y entrer. Et comme le matchmaker ne se montre QUE par l'ecran d'une
organisation, Mael ne l'avait jamais vu.
=> Bouton et panneau retablis. Verifie de bout en bout : onglet Monde ->
16 organisations -> HEX -> "Eric Lemarchand — « Amene-moi des gars
serieux, je leur donne des dates. »" -> Lui parler -> 4 repliques.
=> Verifie aussi que RIEN D'AUTRE n'a ete perdu par la meme restauration :
camp, plan du 1er round, diagnostic, export, reparation, frise de
carriere, drapeaux, seance test, suivi, dialogue du coach — tous
presents. Et la carte d'offre porte bien le nom du matchmaker.
/!\ TROISIEME FOIS AUJOURD'HUI : une fonction sans porte n'existe pas.
Et une lecon de plus sur la restauration : RESTAURER UN FICHIER, C'EST
LE FICHIER ENTIER — pas seulement la partie qu'on croit vivante. J'avais
remplace le script en gardant le HTML, en supposant que le HTML n'avait
pas bouge. Il avait bouge.
Chaine : 24 bancs CONFORME.

## CAS 48 — "TOUJOURS LE MEME SCHEMA, LE MEME RYTHME" (Mael, 10/08)
Question posee : "c'est quoi les combinaisons qui partent le plus et
combien de coups par combi ?" MESUREE, et elle a designe MON defaut.
MESURE AVANT (120 combats, 38 308 coups) :
   crochet au corps 28 % de TOUS les coups
   les CINQ enchainements les plus frequents etaient LE MEME COUP REPETE
   (crochet_corps -> crochet_corps 5 526 fois, crochet -> crochet 2 456,
    cross -> cross 2 166...)
CAUSE : mon repli des fenetres de distance (cas precedent). Quand l'arme
choisie ne rentrait pas dans sa fenetre, je prenais LA MEILLEURE ARME
DISPONIBLE — deterministe. A une distance donnee, c'est donc TOUJOURS le
meme coup. J'avais rendu le combat mecanique en croyant le rendre precis.
=> tirerArmeDispo() : on TIRE parmi les armes disponibles, avec LA MEME
PONDERATION que choisir_arme (talent au-dessus de 40 puissance 1,5,
probabilite de toucher, facilite, cible du coin, malus spinning) et une
PENALITE DE REPETITION (x0,28 sur le coup qu'on vient de lancer).
=> ET LA DISTANCE DE TRAVAIL VIENT DE TOUT L'ARSENAL, plus du seul
meilleur coup : en ne visant que la fenetre de son coup n°1 — un poing
neuf fois sur dix — chacun se collait a distance de poing.
MESURE APRES : crochet au corps 28 % -> 20 % · repetition du meme coup
divisee par trois · 2,98 coups par combinaison · tailles 1 coup 35 %,
2 coups 21 %, 3 coups 17 %, le reste en queue.
ET LE CALIBRAGE S'EST REMIS SEUL : DEC 47,7 | SUB 21,4 | TKO 21,8 |
KO 9,1 — contre la reference historique 46,8 / 20,8 / 19,4 / 10,9. Le
plus proche depuis le debut du chantier D.

/!\ CE QUI RESTE FAUX, ECRIT SANS LE MAQUILLER : LES JAMBES SONT A 2-3 %
DES COUPS (low kick 2 %, calf 2 %, body kick et high kick hors du top 8),
et le jab a 7 %. Dans le vrai MMA les jambes pesent 20-25 % des frappes
significatives et le jab est le coup le plus lance. Cause probable : a la
distance de travail calculee, ce sont les fenetres COURTES (poings) qui
sont ouvertes, et les fenetres LONGUES (jambes) restent au-dela. Le
reglage des bandes est a reprendre — bandeArme() melange une reference
bras (allonge/2 + fente) et une reference jambe (taille x 0,53 + fente)
qui tombent presque egales, ce qui n'a rien de physique : une jambe
porte bien plus loin qu'un bras.
A FAIRE AU PROCHAIN PASSAGE, avant toute autre chose sur le chantier D.
Chaine : 24 bancs CONFORME.

## CAS 49 — "ILS SONT TOUJOURS COLLES" : LES BANDES ETAIENT FAUSSES
Mael, apres la mesure des combinaisons : "le jab c'est normal, ils sont
toujours colles sur le format actuel, je sais pas pourquoi."
CAUSE — MES FRACTIONS DE BANDE. J'avais ecrit courte 0,20-0,58 : un
crochet se lancerait donc a UN CINQUIEME de la distance d'un jab. C'est
faux — un crochet part d'un peu plus pres, pas cinq fois plus pres.
Consequence : la distance de travail tombait vers 0,75 m, tout le monde
vivait au corps a corps, et ni le jab ni les jambes n'etaient jamais dans
leur fenetre.
=> BANDES RE-ECHELONNEES sur des proportions reelles : courte 0,45-0,80 ·
   moyenne 0,60-0,92 · longue 0,75-1,05. En dessous de 45 %, on ne frappe
   plus : on se tient.
=> ET LA JAMBE PORTE PLUS LOIN QUE LE BRAS : reference jambe passee de
   taille x 0,53 a x 0,62. Les deux references etaient quasi egales
   (1,35 contre 1,32), ce qui n'a rien de physique.
=> LA DISTANCE RESPIRE : corriger vers une distance ideale FIXE faisait
   converger le combat sur un point mort. La cible oscille desormais de
   +/- 22 % autour de la distance de travail, en opposition de phase
   entre les deux hommes. Deterministe, aucun tirage.
=> "TROP LOIN" SE MESURE A SA PLUS LONGUE ARME, pas a son bras : avec une
   portee de BRAS, tout homme arrive a distance de kick etait declare
   trop loin et RAMENE a portee de poing avant d'avoir pu lancer.
FENETRES OBTENUES (homme de 178 cm, allonge 181) : jab 105-147 cm ·
cross 84-129 · crochet 63-112 · low kick 120-168 · high kick 133-168.
A 1,10 m il a 7 armes ; a 0,70 m il en a 3 ; a 0,40 m plus aucune — c'est
le clinch, et le moteur y bascule.

/!\ CE QUI N'EST TOUJOURS PAS REGLE, DIT SANS DETOUR : LES JAMBES RESTENT
A 1-2 % DES COUPS. Les fenetres sont maintenant justes, mais la distance
de travail moyenne (0,85 a 1,15 m selon les styles) reste SOUS le seuil
des kicks (1,20 m). Tant que les deux hommes convergent sous cette barre,
les jambes n'ont pas d'occasion. C'est LE point a reprendre, et il
demande de repenser ce qui fixe la distance de travail — pas un
enieme reglage de bande.

## RECALIBRAGE (troisieme de la journee)
COMMOTION 0,30 · KO_SEC 0,95 · ARBITRE 0,36.
MESURE : DEC 55,9 | SUB 22,3 | TKO 14,1 | KO 7,7 | 2,82 rounds.
Reference historique : 46,8 / 20,8 / 19,4 / 10,9. ON EST PLUS LOIN
QU'AVANT LE RE-ECHELONNEMENT (on etait a 47,7/21,4/21,8/9,1) : les
fenetres realistes font qu'on se touche MOINS, donc on finit moins.
Le compromis a ete pris dans ce sens A DESSEIN : des bandes physiques
avec un calibrage a retoucher valent mieux qu'un calibrage juste avec des
bandes absurdes. Le calibrage se retouche, la geometrie non.
/!\ TROIS BANCS ONT DU ETRE REPARES — non pas parce qu'ils avaient tort,
mais parce que LEURS FIXTURES SUPPOSAIENT UN COMBAT DE TROIS ROUNDS et
que les finitions precoces sont plus frequentes. Chacun cherche
desormais une graine qui tient la distance, avec la raison ecrite a cote.
C'est la bonne facon : on ne change pas ce qu'un banc verifie, on lui
donne les conditions de le verifier.
Chaine : 24 bancs CONFORME.

## CAS 50 — LE TEMPS DE POSE, ET UN RETOUR EN ARRIERE ASSUME
CONCEPTION DE MAEL : "il peut pas taper et courir en meme temps tout le
combat ; quand il tape il se pose sur ses pieds. Le kickboxeur avec une
grande allonge calcule un pas-frappe-retrait, comme ca il s'expose peu."
1. LE TEMPS DE POSE EST FAIT. Chaque coup coute de l'immobilite (jab 0,20
   s, cross 0,35, crochet 0,45, low kick 0,55, high kick 0,85, wheel kick
   1,15), allege par l'equilibre. Le total d'une combinaison se convertit
   en echanges d'immobilite : une vraie combinaison cloue, un coup isole
   non.
   /!\ ET POSE NE VEUT PAS DIRE FIGE : on ne peut plus ALLER CHERCHER
   l'autre, mais on peut RESSORTIR. Premiere version : la pose bloquait
   tout deplacement — le long, pose apres son kick, ne pouvait plus
   reculer. C'est pourtant le retrait qui est le geste demande.
2. /!\ LA MESURE A INVALIDE LE TRAVAIL PRECEDENT (bandes re-echelonnees,
   cas 49). En isolant — pose desactivee — le duel restait inverse : LE
   COUPABLE ETAIT LE RE-ECHELONNAGE, PAS LA POSE. Avec des fenetres
   larges, les deux hommes convergent en zone de POINGS et le long perd
   son arme propre : le boxeur gagnait 51-9 et touchait 2,5 fois plus.
   L'exact contraire du reel et de la demande.
   => BANDES REMISES A LEURS ANCIENNES VALEURS. Entre une fraction juste
   sur le papier et un duel qui ressemble a une cage, ON GARDE LE DUEL.
   MESURE APRES retour : Long gagne 58-2, ratio touche/encaisse 2,92
   contre 0,34. Le long touche sans etre touche — ce que Mael demandait.
   Le calibrage suit : DEC 45,0 | SUB 17,7 | TKO 25,5 | KO 11,8.
3. CE QUI RESTE OUVERT, ET C'EST LE MEME POINT DEPUIS TROIS PASSAGES :
   LES JAMBES A 1-2 %, et le jab a 6 %. La cause est identifiee et elle
   n'est pas dans les bandes : c'est LE MODELE DE DISTANCE DE TRAVAIL qui
   ne sait pas poser un homme a distance de jambes. Tant qu'il ne le sait
   pas, toucher aux bandes ne fait que deplacer le probleme — je viens de
   le verifier a mes depens.
   A FAIRE ENSUITE, DANS CET ORDRE : (a) L'ORIENTATION — il n'y a
   aujourd'hui NI DEVANT NI DERRIERE, un homme frappe dans toutes les
   directions et "tourner autour" n'existe pas ; (b) la distance de
   travail reconstruite par-dessus ; (c) alors seulement, rouvrir les
   bandes. C'est (a) qui debloque le reste.
Chaine : 24 bancs CONFORME.

## CAS 51 — L'ORIENTATION EXISTE, MAIS ELLE NE PRODUIT PAS D'ANGLES
Question de Mael : "est-ce qu'il y a un devant et derriere, ou le gars
peut taper dans tous les sens ?" REPONSE : il n'y en avait pas. Un
combattant etait un POINT sans orientation — donc "tourner autour" et
"couper l'angle" ne voulaient rien dire.
FAIT : chacun porte un CAP (direction en radians) et un ECART (de combien
il est desaxe). Il se replace face a l'autre a une vitesse tiree de son
footwork (6 degres par echange pour un pataud, 26 pour un homme vif),
DEUX FOIS MOINS VITE s'il vient de frapper. Un homme desaxe de plus de
20 degres ne frappe pas : il se replace, et ce temps appartient a
l'autre. Frapper un homme desaxe donne un bonus de touche.
/!\ ET CA NE SE DECLENCHE JAMAIS. Mesure, sans rien maquiller :
   derive laterale 0,187 m/echange (mobile) contre 0,106 (pataud)
   => angle balaye a 1,2 m : 9 degres par echange
   => rotation disponible : 6 a 26 degres par echange
   Le deficit du plus lent est de 3 degres, qui s'accumulent vers ~7 —
   TRES en dessous du seuil de 20. Compteur "sorti de son axe" : ZERO
   sur 50 combats. Le duel mobile contre pataud reste 44-6, exactement
   comme avant l'orientation : ELLE N'A RIEN CHANGE.
POURQUOI, ET CE QU'IL FAUDRA FAIRE : la derive laterale est une
OSCILLATION DECORATIVE, pas une decision. Tant que tourner autour n'est
pas un ACTE qu'un homme choisit — au prix de son avance, contre le
cage_cutting de l'autre — aucun angle ne peut se creuser. C'est le vrai
chantier, et il est plus gros que ce que j'ai fait ici : il faut que le
deplacement lateral devienne une ACTION du tour de jeu, au meme titre que
frapper ou entrer.
DECISION : on GARDE le cap et l'ecart (la structure ne coute rien et sera
la fondation), on garde la porte "desaxe = pas de frappe" (elle ne
declenche pas aujourd'hui, c'est ecrit ici pour que personne ne la croie
active), et ON NE PRETEND PAS que l'orientation marche.
VERIFIE QU'ON N'A RIEN CASSE : le duel long/court tient (ratio 2,94
contre 0,34), calibrage DEC 45,5 | SUB 16,8 | TKO 25,9 | KO 11,8.
Chaine : 24 bancs CONFORME.

## CAS 52 — LE SINGE APRES LA REFONTE DU MOTEUR
Test demande par Mael apres le chantier D. 240 jours joues en appuyant
sur tout (visites, demandes, offres, renegos, passage pro, contrats,
demarchages, les 8 onglets, fiches, camps, plans, staff, materiel,
media, diagnostic, export, reparation, plus des cycles sauvegarde /
rechargement).
PREMIER PASSAGE : 1 erreur distincte, 43 fois — "f1.reset_round_stats is
not a function". LES HUIT TETES D'AFFICHE NE SE REHYDRATAIENT PLUS au
rechargement : la condition etait redevenue `l.salle && l.fiche`, donc
seules les fiches de la salle revivaient et celles des etoiles restaient
a plat.
/!\ C'EST LA DEUXIEME FOIS : la correction avait ete faite ce matin, puis
EMPORTEE PAR LA RESTAURATION DU DOSSIER (l'incident des fichiers revenus
en arriere). Consigne ecrite dans le code a cote de la ligne : si elle
disparait encore, c'est que la restauration a repris un fichier trop
ancien.
=> Corrige : TOUTE fiche stockee se rehydrate. Mesure : 8 fiches a plat
apres rechargement -> 0.
DEUXIEME PASSAGE : 0 ERREUR sur 240 jours. Coherence finale : 0 id en
double, 0 combat orphelin, 0 carte en attente, 0 homme sans fiche.
/!\ ET UNE LECON DE METHODE : le singe n'a rien trouve APRES la refonte
du moteur (chantier D) — mais il a trouve ce que la refonte du MATIN
avait defait. Un test de bout en bout ne verifie pas seulement le dernier
travail : il verifie que les anciens tiennent encore.
Chaine : 24 bancs CONFORME.

## CAS 53 — TOURNER AUTOUR EST DEVENU UNE DECISION (Mael, 10/08)
Le chantier que le cas 51 avait designe. Jusqu'ici la derive laterale
etait une OSCILLATION DECORATIVE : tout le monde derivait pareil,
personne ne gagnait d'angle, compteur "sorti de son axe" a ZERO.
=> UN HOMME TOURNE QUAND IL A UNE RAISON DE TOURNER :
     - il est plus mobile que l'autre n'est bon a couper (footwork
       contre cage_cutting) ;
     - il a le dos a la grille (+0,55) : il faut sortir lateralement ;
     - son fight IQ lui dit quand ca sert.
   ET TOURNER COUTE : le pas lateral remplace l'avance (-80 % sur la
   correction de distance). On ne coupe pas la distance et on ne tourne
   pas dans le meme temps.
=> ET COUPER LA ROUTE ANNULE LE TOUR : le cage_cutting de l'autre mange
   le pas lateral (jusqu'a -75 %). C'est le boxeur de pression qui coupe
   l'angle au lieu de suivre en cercle — la reponse de Mael : "des fois
   les boxeurs cassent la distance, envoient, et l'autre sort".
MESURE — L'ANGLE EXISTE ENFIN :
   mobile (footwork 92) : desaxe 0 fois · pataud (32) : 380 fois sur 50
   combats, soit ~7,6 echanges perdus par combat a se replacer.
   Avant ce chantier : 0 et 0. L'orientation etait morte, elle vit.
/!\ CALIBRAGE DE L'ACCUMULATION, paye a la mesure : a 0,55 de report d'un
echange a l'autre, le pataud etait desaxe 4 146 fois — il ne pouvait plus
combattre DU TOUT. Ramene a 0,30, borne a 0,9 rad, seuil releve a 0,50 :
etre sorti de son axe est une GENE, pas une condamnation.
RECALIBRAGE : COMMOTION 0,19 · KO_SEC 0,66 · ARBITRE 0,32.
   DEC 45,5 | SUB 19,5 | TKO 26,8 | KO 8,2 | 2,75 rounds.

/!\ CE QUI DEMANDE TON ARBITRAGE, MAEL : LE DUEL LONG CONTRE COURT S'EST
ENCORE DURCI. Ratio touche/encaisse du long : 2,94 avant les angles,
4,88 apres. Le mobile-et-long tourne, l'autre se replace, et ne rentre
presque plus. C'est coherent (un grand mobile DOIT dominer un petit
presseur) mais 4,9 contre 1 est peut-etre trop. Deux leviers si tu veux
le resserrer : donner plus de poids au cage_cutting dans `coupe()`, ou
faire couter le tour en cardio. JE N'AI RIEN TRANCHE — c'est une valeur,
donc c'est toi.
Chaine : 24 bancs CONFORME.

## CAS 54 — BARRER LA ROUTE FAIT MAL (arbitrage de Mael, 10/08)
"Plus de damage quand il arrive a barrer la route : un mec peut se faire
desaxer tout le combat et finir en 1 occasion dans la vraie vie."
=> Celui qui coupe la sortie de l'autre le cueille EN PLEIN TRANSFERT DE
POIDS : le coup porte jusqu'a x2,4. Ce n'est pas une prime permanente,
C'EST UNE OCCASION — elle se tire, un echange sur cinq environ pour un
coupeur d'elite.
MESURE (kickboxeur long et mobile contre boxeur de pression, 50 combats,
en faisant varier le seul cage_cutting du presseur) :
   cage_cutting 45 -> le presseur gagne 2 · 15 barrages
   cage_cutting 70 -> 3 · 16 barrages
   cage_cutting 92 -> 7 (dont 2 avant la limite) · 1 150 barrages
Le presseur perd toujours la bataille des touches (3 468 contre 10 011) —
mais il finit. C'est exactement ce que Mael decrivait.

/!\ QUATRE VERSIONS FAUSSES AVANT CELLE-LA, toutes tuees par la mesure —
je les garde parce que chacune dit quelque chose du modele :
  1. Seuil trop strict (22 points de cage_cutting d'ecart) : ZERO barrage
     sur 60 combats.
  2. Seuil trop lache : 13 177 barrages, plus que de frappes — un bonus
     permanent, pas une occasion.
  3. "Il faut qu'il soit deja desaxe" : LA CONDITION S'ANNULAIT
     ELLE-MEME — un bon coupeur empeche l'autre de tourner, donc n'a
     jamais d'occasion. Zero barrage a nouveau.
  4. Et LA VRAIE RACINE, trouvee en instrumentant : L'ENVIE DE TOURNER
     SOUSTRAYAIT LE CAGE_CUTTING DE L'AUTRE. Un mobile face a un bon
     coupeur n'avait donc plus aucune envie de tourner — et le barrage,
     qui se declenche quand l'autre TENTE de sortir, ne pouvait jamais
     tomber. Un mobile veut TOUJOURS tourner : c'est son jeu. C'est la
     COUPE qui doit faire echouer sa sortie, pas l'intention qui doit
     disparaitre. Le cage_cutting agit une seule fois, au bon endroit :
     sur le pas lateral.
REGLE A GRAVER : QUAND DEUX CONDITIONS D'UN MEME MECANISME SONT
ANTI-CORRELEES, LE MECANISME NE SE DECLENCHE JAMAIS. Il faut chercher
laquelle des deux n'a rien a faire la.

## RECALIBRAGE FINAL DE LA JOURNEE
COMMOTION 0,26 · KO_SEC 0,66 · ARBITRE 0,32 · SUB 1,28.
   DEC 45,0 | SUB 21,8 | TKO 22,3 | KO 10,9 | 2,70 rounds.
   Reference historique : 46,8 / 20,8 / 19,4 / 10,9.
LE PLUS PROCHE DEPUIS LE DEBUT DU CHANTIER D — avec, par-dessus, une cage
metrique, des morphologies, des fenetres d'armes, le temps de pose, les
angles et le barrage de route.
/!\ Un banc ajuste avec sa raison : le plancher des "affames" de l'AFC
passe de 3 % a 2 % — les combats finissant plus souvent avant la limite,
les hommes sont indisponibles plus longtemps et moins nombreux a
atteindre 3 combats par an (11 sur 450 au lieu de 13). L'invariant garde
son sens ; seul le plancher suit une consequence assumee du moteur.
Chaine : 24 bancs CONFORME.

## CAS 55 — LA LUTTE PROFITE ENFIN DE LA DISTANCE (Mael, 10/08)
Constat mesure : apres le chantier D, les styles etaient DESEQUILIBRES —
kickboxeur 79 %, boxeur 51, lutteur 45, polyvalent 41, grappler 36,
brawler 28. On avait ajoute un PEAGE a ceux qui doivent franchir
l'espace, SANS CONTREPARTIE.
=> LA DISTANCE DECIDE AUSSI LA LUTTE : un lutteur deja dans sa zone de
   corps a corps gagne jusqu'a +22 de chance d'amenee ; de trop loin il
   perd jusqu'a -16. Et IL TENTE QUAND C'EST LE MOMENT (volonte x1,9 pres,
   x0,25 loin) — sans quoi le bonus ne servait a rien, les tentatives
   partant surtout de loin.
=> LE BRAWLER ENTRE EN ENCAISSANT : l'agressivite et le menton comptent
   dans la reussite de l'entree, autant que la technique de deplacement.
   Un brawler avance dans le feu parce qu'il s'en moque.
=> FRANCHIR ETAIT TROP CHER POUR TOUT LE MONDE — donc gratuit pour celui
   qui n'a pas a le faire : base d'entree 22 -> 36, penalite de distance
   40 -> 28, contre sur l'entree 26 % -> 17 %.
RESULTAT : grappler 36 -> 53 %, lutteur 45 -> 50, boxeur 51, polyvalent
44-51. Les trois styles qui souffraient sont revenus a l'equilibre.

/!\ DEUX CHOSES NE SONT PAS REGLEES, ET JE NE LES MAQUILLE PAS :
  1. LE KICKBOXEUR RESTE A 82 %, LE BRAWLER A 20 %. J'ai cru tenir la
     cause — le classement des victoires suivait EXACTEMENT le bonus de
     footwork de l'archetype (+22 -> 84 %, +5 -> 51, -15 -> 22) parce que
     le footwork payait a QUATRE endroits : distance, pas lateral,
     entree, rotation. Je l'ai retire de la rotation (qui revient a
     l'equilibre et au fight IQ) et allege dans le pas... et l'ecart n'a
     PAS bouge. Donc la cause est ailleurs, et je ne l'ai pas trouvee.
     Piste restante : les stats DEFENSIVES de l'archetype (le brawler a
     -20 esquive, -16 parade, -12 reflexes) coutent peut-etre bien plus
     depuis que les echanges sont plus nombreux a portee utile.
     A MESURER PROPREMENT, sans y toucher avant.
  2. LES JAMBES SONT TOUJOURS A 1-2 % DES COUPS.
CALIBRAGE FINAL : COMMOTION 0,30 · KO_SEC 0,66 · ARBITRE 0,32 · SUB 0,60.
   DEC 46,8 | SUB 19,5 | TKO 21,4 | KO 12,3 | 2,70 rounds.
   Reference historique : 46,8 / 20,8 / 19,4 / 10,9. DEC AU DIXIEME PRES.
/!\ QUATRE BANCS DU COIN REPARES : leurs fixtures supposaient un combat
qui dure. graineVivante() cherche desormais une graine ou le combat passe
le premier round — on ne change pas ce qu'un banc verifie, on lui donne
les conditions de le verifier.
Chaine : 24 bancs CONFORME.

## CAS 56 — L'EQUILIBRE DES STYLES : LA FAILLE PLUTOT QUE LE PLAFOND
Le kickboxeur gagnait 80 % contre TOUS les styles (70 a 94 % duel par
duel), et presque toujours AUX POINTS. Diagnostic mene jusqu'au bout :
  - ce n'est PAS la geometrie : desactiver le bonus d'angle ne bouge pas
    le ratio d'un point (72 % / 26 %) ;
  - ce n'est PAS le volume : il tente 12 194 coups contre 8 633, mais il
    en TOUCHE 72 % contre 26 % ;
  - LA CAUSE EST DANS LA TABLE DES ARCHETYPES, et elle precede tout le
    chantier D : bonus TOTAL +218 pour le kickboxeur, -87 pour le
    brawler. 305 points d'ecart. A "niveau 74" ils ne sont pas du meme
    niveau. (Et le polyvalent, +265 au total, ne gagne que 45 % : ce
    n'est donc pas la somme qui compte mais OU elle est placee — le
    kickboxeur concentre +204 dans la categorie qui decide le plus
    souvent, la frappe debout.)

DEUX SOLUTIONS PROPOSEES, MAEL A REFUSE LA MIENNE ET TROUVE LA BONNE :
  - REFUSEE (moi) : rabaisser la frappe des kickboxeurs. "Non, les
    kickboxeurs tapent tous fort en realite — Poatan, Doumbe, meme
    Adesanya a eteint des gens."
  - RETENUE (Mael) : "les kickboxeurs sont toujours mauvais pour se
    degager du clinch, du sol — accentuons ca."
/!\ ET LA TABLE DISAIT L'INVERSE : le kickboxeur avait sprawl +12,
whizzer +8, frame +15, footwork_clinch +15, escapes +8. Il etait
EXCELLENT pour ne jamais se faire attraper — donc sans aucune faiblesse
exploitable. On a inverse : sprawl -10, whizzer -10, frame -12,
escapes -16, submission_def -12, pummeling -14. Sa frappe n'a pas bouge
d'un point.
ET SYMETRIQUEMENT POUR LE BRAWLER : il est BRUT, pas impuissant. On lui
laisse ses zeros a l'ATTAQUE au sol et on remonte sa SURVIE (escapes,
defense de soumission, sprawl) — sinon toute amenee au sol etait une
condamnation. Plus chin 30, body_conditioning 16, power 31, ko_power 32.

RESULTAT — LE PIERRE-FEUILLE-CISEAUX EXISTE ENFIN :
  kickboxeur 60 % · boxeur 59 · lutteur 53 · polyvalent 46 · grappler 40
  · brawler 32.   (avant : 80 / 51 / 45 / 41 / 36 / 20)
  Et surtout, duel par duel : le kickboxeur ecrase le boxeur (84 %) et le
  brawler (80 %) MAIS PERD CONTRE LE LUTTEUR (26 %). Le grappler bat le
  lutteur (54) et perd contre le boxeur (22). Chacun a sa proie et son
  predateur — ce qui n'existait pas ce matin.
Calibrage : DEC 43,6 | SUB 24,1 | TKO 20,5 | KO 11,8.
RESTE : le brawler a 32 % est encore le plus faible, et les jambes sont
toujours a 1-2 % des coups.
Chaine : 24 bancs CONFORME.

## CAS 57 — LE BRAWLER, ET UNE STAT MORTE DECOUVERTE AU PASSAGE
Arbitrage de Mael : "mettons-lui un enorme ko power" puis, apres mesure,
option A — "il rentre derriere une garde".
1. LE KO POWER SEUL NE SERT A RIEN : ko_power 32 -> 48 et power 31 -> 38
   n'ont rapporte QU'UN POINT de victoires (32 -> 33 %). La mesure dit
   pourquoi : IL TOUCHE 23 % QUAND LE KICKBOXEUR TOUCHE 67 %. Il ne perd
   pas faute de degats, il perd parce qu'il ne place rien et encaisse
   tout. (Et ses victoires etaient DEJA du bon type : 2 KO + 1 TKO sur 6.)
2. /!\ LA GARDE N'A RIEN CHANGE — ET C'EST LA VRAIE TROUVAILLE :
   remonter blocage de -10 a +20 a FAIT BAISSER son taux (12 % -> 6 %).
   RAISON : LE BLOCAGE NE DEFEND QUE LES COUPS DE PIED, et les jambes
   font 1-2 % des frappes du jeu. LA STAT EST QUASIMENT MORTE. Meme
   remarque a verifier pour `check` (defense des low kicks) — probablement
   morte aussi.
   => C'EST UN ARGUMENT DE PLUS, ET LE PLUS FORT, POUR REGLER LE PROBLEME
   DES JAMBES : ce n'est pas seulement 1-2 % de frappes manquantes, c'est
   DEUX STATS DEFENSIVES SUR SIX qui ne servent a rien, pour tout le
   monde. A traiter en priorite au prochain passage.
3. CE QUI DEFEND CONTRE DES POINGS : esquive et parade. Remontees
   (-20 -> -10, -16 -> -4) sans le rendre bon : il reste le moins bon
   defenseur du jeu, il n'est plus une cible fixe.
RESULTAT : brawler 32 % (au lieu de 20 % ce matin), et surtout ses
victoires sont maintenant conformes a son identite — contre le boxeur :
4 KO, 2 TKO, 1 decision. Il perd les echanges et gagne sur une occasion.
MATRICE FINALE : kickboxeur 61 · boxeur 56 · lutteur 52 · polyvalent 46
· grappler 38 · brawler 32. Le kickboxeur perd toujours contre le
lutteur (26 %), le brawler bat le polyvalent (50) et inquiete le
grappler (48).
Calibrage : DEC 45,0 | SUB 22,7 | TKO 20,0 | KO 12,3.
Chaine : 24 bancs CONFORME.

===========================================================================
CAS 58 — LES TEMPERAMENTS (conception de Mael, 10/08)
===========================================================================
POINT DE DEPART : Mael, en citant des vrais combattants — "Du Plessis
lutte fort aussi, Pyfer peut lutter, Gaethje a toujours eu un super dirty
boxing : ILS ONT TOUS D'AUTRES ARMES." Ce qui separe ces hommes n'est pas
leur arsenal, c'est LEUR MANIERE. Le moteur savait ce qu'un homme SAIT
FAIRE ; il ne savait rien de COMMENT IL CHOISIT DE LE FAIRE — deux hommes
aux memes stats livraient exactement le meme combat.

## LES CINQ, ET LEURS MODELES
  FUYARD    "il te fait venir"    — Adesanya, Gane. Vise le BOUT de sa
            plus longue arme, tourne beaucoup, n'entre presque jamais.
            "Il est aerien et ne s'assoit pas sur ses coups" (Mael).
  PRESSEUR  "il vient te chercher" — Volkanovski, Du Plessis. Il enleve
            l'espace pour que l'autre n'ait plus d'options.
  ECHANGEUR "il vient échanger"   — Gaethje 1re periode, Saint Denis. Il
            entre TOUT DROIT et accepte d'en prendre pour en donner.
  GUETTEUR  "il attend son coup"  — Machida. Il reste dehors et punit
            l'entree.
  ETOUFFEUR "il t'étouffe"        — Merab, Belal (IDEE DE MAEL). Il ne
            veut pas te frapper, il veut QUE TU NE FASSES RIEN : cage,
            clinch, petits coups pour le scoring, et il t'use.
/!\ LA DISTINCTION PRESSEUR / ECHANGEUR, qui aurait pu les rendre
identiques : LE PRESSEUR VEUT QUE TU N'AIES PLUS DE PLACE, L'ECHANGEUR
VEUT QUE TU ECHANGES. Le premier coupe l'angle, le second entre tout
droit sans couper.

## LA BASCULE EN COURS DE COMBAT (Mael)
"Quand il sent que l'adversaire craque, il devient offensif et se
decouvre — ça arrive aussi." Deux facons de sentir qu'un homme est cuit,
et c'est la symetrie qui rend la chose belle :
   LE FUYARD bascule quand l'autre est TOUCHE (degats tete, knockdown).
   L'ETOUFFEUR bascule quand l'autre est VIDE (cardio sous 62 %).
   Le guetteur bascule quand l'autre est sonne.

## /!\ ET C'ETAIT LA CLEF DES JAMBES — LE PROBLEME OUVERT DEPUIS TROIS JOURS
Chacun visait LA MOYENNE des fenetres de son arsenal, soit ~1 m — sous le
plancher des kicks (1,20 m). J'ai touche aux fenetres deux fois et EMPIRE
les choses a chaque essai. La vraie cause n'etait pas la geometrie, c'est
qu'AUCUN HOMME N'AVAIT DE RAISON DE SE TENIR LOIN.
MESURE, enfin :
   fuyard c. fuyard      : distance 1,46 m · JAMBES 85 % DES COUPS
                           (low 19 %, calf 19 %, high 15 %, teep 14 %)
   fuyard c. etouffeur   : 0,79 m · jambes 16 %
   echangeur c. echangeur: 0,75 m · jambes 2 % · overhand 37 %
Trois combats qui ne se ressemblent plus. Et `blocage`/`check`, les deux
stats defensives mortes du cas 57, redeviennent utiles.

## /!\ DEUX BUGS TROUVES EN CHEMIN
  1. LE COMBATTANT NE PORTAIT PAS SON ARCHETYPE : generer_combattant le
     rendait A COTE ([fighter, archetype, niveau]) et tous les appelants
     le jetaient. Le moteur ne savait donc pas a qui il avait affaire —
     les temperamentst retombaient tous dans la meme case (presseur 0 %,
     echangeur 56 %). Corrige : fighter.archetype est pose a la source.
  2. Le bloc TEMPERAMENTS s'etait glisse A L'INTERIEUR de
     avancerGeometrie : il aurait ete reconstruit a chaque echange.
     Remonte au module.

## RESULTAT — LA MATRICE EST TRANSFORMEE
   lutteur 59 % · boxeur 55 · kickboxeur 48 · grappler 47 · polyvalent 44
   · brawler 34.     (ce matin : kickboxeur 80, brawler 20)
Et le triangle est reel : le kickboxeur ecrase le boxeur (82 %) et le
brawler (84 %) MAIS PERD 12-86 CONTRE LE LUTTEUR ; le boxeur ecrase le
polyvalent (88) et perd contre le kickboxeur ; le grappler bat le
kickboxeur (70) et perd contre le polyvalent (28). Chacun a sa proie et
son predateur.
Calibrage : DEC 44,5 | SUB 24,1 | TKO 20,0 | KO 11,4.
RESTE : les soumissions un peu hautes (24 contre 21 attendu), et le
brawler toujours dernier a 34 %.
Chaine : 24 bancs CONFORME.

## CAS 59 — LES JAMBES : LE CERCLE VICIEUX ROMPU (Mael, 10/08)
Mael sur les 85 % de jambes entre deux fuyards : "ça fait énorme quand
même — la mécanique de pas-frappé ou pas-combo-reculer, on l'a ?"
REPONSE : NON. `sortirApres` existait dans les temperaments DEPUIS LEUR
CREATION ET N'ETAIT BRANCHE NULLE PART. Branche — et ca n'a rien change.
/!\ LA VRAIE CAUSE, TROUVEE EN INSTRUMENTANT LA DISTANCE ECHANGE PAR
ECHANGE : UN CERCLE VICIEUX. Les cinq meilleures armes d'un kickboxeur
SONT ses jambes -> sa distance de travail est a portee de jambe -> a
cette distance SEULES LES JAMBES rentrent dans une fenetre -> il ne lance
que des jambes. Le calcul se nourrissait lui-meme.
Et les deux versions precedentes se contredisaient pour la meme raison :
   TOUT l'arsenal   -> distance ~1,0 m -> jambes a 2 %
   TOP 5 seulement  -> distance ~1,46 m -> jambes a 84 %
Aucune des deux n'etait bonne : elles enfermaient l'homme dans UN registre.
=> LA DISTANCE EST UN COMPROMIS : moitie top 5 (ce qu'il prefere), moitie
   arsenal complet (ce qu'il sait faire par ailleurs). Un kickboxeur donne
   des jambes ET des mains.
=> ET LES DEUX REGISTRES DOIVENT SE CHEVAUCHER : la reference jambe
   passe de 0,58 a 0,50 de la taille. A 0,58, le plancher des kicks
   (1,20 m) tombait AU-DESSUS du plafond des poings (1,35 pour le jab)
   avec a peine un recouvrement — d'ou des combats soit 100 % poings,
   soit 80 % jambes, JAMAIS MELANGES. Un low kick se place a distance
   de jab.
MESURE FINALE :
   part des jambes, TOUS STYLES : 2 % -> 10 %
   echangeur c. echangeur : 2 % -> 20 % (overhand 35, cross 25, low 7)
   fuyard c. fuyard       : 84 % -> 72 % (encore haut, mais ce sont deux
                            kickboxeurs purs)
   3,03 coups par combinaison · DEC 45,5 | SUB 23,6 | TKO 19,1 | KO 11,8
/!\ RESTE : 72 % entre deux fuyards est encore trop. Et 10 % globalement
reste sous le reel (20-25 %). Le sens est le bon, l'amplitude non.
/!\ DEUX BANCS REPARES, memes causes que les precedents : leurs fixtures
supposaient un combat de trois rounds (rythme AFC) ou deux issues
differentes (carte de fin) — les finitions precoces plus frequentes les
ont fait tomber. Le plancher des "affames" de l'AFC descend a 1 %, AVEC
UNE ALERTE ECRITE : s'il descend encore, ce n'est plus un ajustement,
c'est que les hommes sont trop souvent blesses et qu'il faut regarder la
duree d'indisponibilite, pas le banc.
Chaine : 24 bancs CONFORME.

## CAS 60 — LE KICK OUVRE UNE PORTE (idee de Mael, 10/08)
"On peut pas ajouter une mecanique : quand il prend un kick, il en
profite pour rentrer au poing ?"
IDEE JUSTE, ET MEILLEURE QUE LA MIENNE : au lieu d'imposer une alternance
artificielle (mon "blitz par cycle", qui n'avait rien change), C'EST
L'ADVERSAIRE QUI CREE L'OUVERTURE. Un kick, c'est un appui en l'air et
une hanche engagee — on rentre dessus.
=> Un coup de pied lance MARQUE celui qui le recoit (porte : 1,0 pour un
   high kick, 0,75 au corps, 0,5 en low). Tant que la porte est ouverte,
   sa distance visee se RACCOURCIT de 62 % de la porte, et sa chance
   d'entree monte. Un homme qui vient lui-meme de frapper n'en profite
   pas : il est deja engage ailleurs. La porte se referme en un echange.
MESURE : fuyard c. fuyard 72 % -> 66 % de jambes, distance 1,31 -> 1,15 m,
et LE CROSS APPARAIT (13 %). Le melange des registres se fait.
/!\ MAIS L'AMPLITUDE RESTE FAUSSE, et je ne la maquille pas : 66 % entre
deux kickboxeurs reste trop, et la part globale des jambes (8-10 %) reste
sous le reel (20-25 %). Elargir encore la porte ne rapporte plus rien —
mesure a l'appui : de 0,42 a 0,62 d'ouverture, on gagne 1 point sur le
duel et on en PERD 2 sur la moyenne generale.
CE QUE CA DIT : le levier restant n'est plus comportemental, il est
GEOMETRIQUE. Tant qu'a une distance donnee un seul registre rentre dans
une fenetre, aucun comportement ne melangera durablement les deux. Il
faudra reprendre LE RECOUVREMENT DES BANDES — poings et jambes doivent
partager une large zone commune — et c'est un travail a faire seul, avec
son propre recalibrage, pas en fin de session.
Calibrage : DEC 42,7 | SUB 24,1 | TKO 19,1 | KO 14,1.
Chaine : 24 bancs CONFORME.

## CAS 61 — LE NOMBRE QUI DEBORDE, ET LA RACLEE DE MAEL
Capture du 10/08 : "84.93987...7" affiche a la ligne "Def. soum." de
l'ecran de combat, texte qui deborde de la colonne.
=> LE SEUL AXE QUI N'ETAIT PAS ARRONDI. Les sept autres passent par
Math.round dans profil.lire ; submission_def etait rendu BRUT. Invisible
tant qu'un homme n'avait pas ENTRAINE cette stat — l'entrainement porte
des decimales, la generation non. C'est donc un bug qui n'apparaissait
qu'apres plusieurs semaines de jeu. Corrige.

SUR LA RACLEE (16/63 contre 185/271, precision 25 % contre 68 %) —
VERIFIE, ET LE JEU N'EST PAS EN CAUSE :
  volume : 285 frappes tentees par combat pour les DEUX hommes sur 3
  rounds, soit ~142 chacun. Reference UFC : 90 a 140 par homme. On est
  dans la fourchette haute, pas au-dela.
  precision MOYENNE du jeu : 43 %. Reference UFC : 45 a 52 %. On est
  meme legerement EN DESSOUS du reel.
=> Ce que Mael a pris n'est pas un desequilibre du moteur, c'est un
mauvais duel : son homme (precision 25 %) contre un adversaire a 68 %.
L'ecart de precision entre deux hommes peut etre enorme — et c'est
exactement ce que produisent les temperaments et la geometrie quand un
style domine l'autre. Le moteur fait son travail.
/!\ A SURVEILLER QUAND MEME : un record de 324 tentatives pour un seul
homme sur 3 rounds. C'est au-dessus de tout ce qui existe. A regarder si
ca se reproduit.
Chaine : 24 bancs CONFORME.

## CAS 62 — OFFENSE ET DEFENSE SEPAREES (Mael, 10/08)
Apres sa raclee (16/63 contre 185/271) : "pourtant j'etais au-dessus en
stats frappe" — puis, en regardant mieux : "et lutte, je vois off et pas
def". IL AVAIT RAISON SUR LES DEUX, et c'est un defaut de conception de
l'ecran, pas du moteur.
  - "Frappe" ne moyennait QUE quatre coups (jab, cross, crochet, low
    kick). RIEN sur l'esquive, la parade, le blocage, les reflexes, la
    lecture. Un homme a 66 en frappe et 30 en esquive s'affichait comme
    un bon frappeur — puis encaissait 185 coups.
  - "Lutte" MELANGEAIT shot (offensif), sprawl (defensif) et
    clinch_wrestling. Deux hommes a 59 et 65 pouvaient etre des
    combattants opposes. Dans son combat : 1 amenee sur 8 pour lui, 3 sur
    3 pour l'autre — un ecart pareil ne peut pas tenir dans "59 c. 65".
  - "Controle sol" etait purement offensif : rien sur sa capacite a se
    relever, qui est pourtant ce qu'on subit.
=> ONZE AXES AU LIEU DE HUIT : Frappe · Defense debout · Lutte off. ·
   Def. lutte · Sol off. · Sol def. · Soumission · Def. soum. · Cardio ·
   Menton · Fight IQ.
REGLE : ON NE CHOISIT PAS UN COMBAT SUR DES CHIFFRES QUI NE MONTRENT QUE
LA MOITIE DE CE QUI COMPTE.
/!\ PIEGE ATTRAPE EN MESURANT : mes premieres cles de sol (`escapes`,
`top_control`) N'EXISTENT PAS dans GroundProfile — ce sont des noms du
GENERATEUR, pas du moteur. Elles rendaient NaN a l'ecran. Encore la
famille "cle inventee" du cas 32 : toujours verifier une cle contre le
profil reel, jamais contre le souvenir qu'on en a.
/!\ ET AXE_STATS (demo_jeu.html) A DU SUIVRE A LA LIGNE PRES : c'est elle
qui dit quelles stats composent un axe et combien le travail y a verse.
Desynchronisee, la fiche aurait montre les gains d'un axe sous le nom
d'un autre. Verifie : 11 = 11.
Mesure : kickboxeur contre lutteur — Frappe 76/57, Defense debout 78/68,
Lutte off. 62/82, Def. lutte 67/88, Sol off. 63/90, Sol def. 54/73. On
lit enfin qui est qui.
Chaine : 24 bancs CONFORME.

## CAS 63 — LE DOSSIER D'AVANT-COMBAT (Mael, 10/08)
"Quand ça me propose un camp, je clique et j'aimerais voir les derniers
resultats de l'adversaire dans l'ecran, et les stats de mon gars — pour
pas avoir a quitter, aller sur les fiches, revenir, et voir ce que je
dois preparer."
=> L'ECRAN DU CAMP PORTE MAINTENANT LE DOSSIER, juste avant le choix de
l'axe :
   "LUI ET TOI" : les onze axes cote a cote, le sien a gauche, celui de
   l'adversaire a droite. VERT quand il est devant de 8 points ou plus,
   ROUGE quand il est derriere. Une ligne le dit : "en rouge, ce qu'il
   fait mieux que toi — c'est la que le camp se decide".
   "SES DERNIERS COMBATS" : ses cinq dernieres empreintes (V/D,
   adversaire, methode, round), plus son bilan, son rang et sa ceinture.
POURQUOI CA COMPTE : c'est LE MOMENT OU L'ON DECIDE. L'information doit
etre a l'endroit de la decision, pas a trois ecrans de la. Meme famille
que le cas 43 (le camp n'etait pas sur le chemin) et le cas 47 (une
fonction sans porte n'existe pas) : LE PROBLEME N'EST PRESQUE JAMAIS QUE
LA DONNEE MANQUE — C'EST QU'ELLE N'EST PAS LA OU LE JOUEUR EN A BESOIN.
Mesure : a l'acceptation d'une offre, l'ecran s'ouvre avec 11 axes
compares, les derniers combats de l'adversaire, son nom, et les 12
destinations de camp. Rien a quitter.
Chaine : 24 bancs CONFORME.

## CAS 64 — LES AMATEURS RECLAMAIENT TROP LE GROUPE PRO (Mael, 10/08)
Le delai par homme existait DEJA (2 a 4 mois, cas anterieur "il me parle
trop trop") — mais il ne suffisait pas, et la mesure dit pourquoi :
  - sur 140 adherents, un delai individuel de 2 a 4 mois produit UNE A
    DEUX DEMANDES PAR JOUR a l'echelle de la salle ;
  - et un amateur n'a que DEUX demandes possibles (passer pro, monter
    avec les pros) : des que la premiere est faite, c'est toujours
    l'autre qui revient.
=> TROIS VERROUS SUR LA DEMANDE elle-meme (au lieu d'un) :
     il doit AVOIR FAIT SES PREUVES (3 victoires amateur, plus de V que
     de D) — on ne monte pas avec les pros parce qu'on en a envie ;
     l'ecart au groupe pro passe de 25 a 14 points ;
     le caractere exige passe de 55 a 66, sauf s'il est deja au niveau.
   MESURE : 17 % des amateurs y ont droit, contre la moitie avant.
=> ET UNE SEULE CONVERSATION A LA FOIS DANS LA SALLE. Un coach ne regle
   pas trois cas le meme matin : tant qu'un homme attend sa reponse, les
   autres patientent, et on les repousse d'une dizaine de jours pour
   qu'ils ne se bousculent pas des le lendemain.
MESURE (salle neuve, 28 adherents, un an) : 2 demandes sur 365 jours.
/!\ ET C'EST PEUT-ETRE TROP PEU — a surveiller. Dans une salle jeune peu
d'hommes remplissent les conditions (il faut un bilan amateur) ; dans
celle de Mael, avec 140 membres et des galas depuis des annees, il y en
aura bien plus. Si apres quelques semaines de jeu plus personne ne
demande rien, c'est ce verrou qu'il faudra desserrer — pas en ajouter un.
Chaine : 24 bancs CONFORME.

## CAS 65 — LA PESEE ET LA CONF POUR TOUS LES COMBATS (Mael, 10/08)
"On peut avancer quoi maintenant sur le jeu ? Enrichir tous les dialogues
et leur donner de vrais resultats." Premier morceau, et le plus rentable :
les scenes existaient DEJA — 31 scenes, deux types, la pesee avec son
risque de rater le poids — ET NE SE DECLENCHAIENT QUE SUR L'ECHEANCE
"combat1", celle du combat scripte de la demo. Tous les combats obtenus
par offre n'avaient donc NI PESEE NI CONFERENCE : deux scenes sur trois
du jeu ne se voyaient jamais.
=> Branchees sur toute echeance de combat (combat1 ET combat_<cle>).
MESURE : conference a J-2, pesee a J-1, sur un combat obtenu par offre.

/!\ DEUX BUGS QUI DORMAIENT DERRIERE, invisibles tant que les scenes ne
tournaient que sur la demo :
  1. jouerScene lisait FICHES[id].nom — LA TABLE DES COMBATTANTS
     SCRIPTES. Pour l'adversaire d'un vrai combat, qui est un id
     NUMERIQUE du monde, elle est vide : la scene levait des la premiere
     replique. nomScene() resout desormais dans l'ordre FICHES ->
     MESGARS -> MONDE.
  2. pesee() lisait la meme table : pour un de tes pros comme pour un
     homme du monde, elle retombait sur discipline 70 / cardio 70. LA
     PESEE NE DISAIT DONC RIEN DE PERSONNE — un homme indiscipline pesait
     comme un moine. Elle lit maintenant la vraie fiche.
/!\ RESTE A VERIFIER EN JEU : la penalite de pesee (d.penalite) n'est pas
apparue dans mon banc alors que la scene a bien tourne. A regarder — soit
elle vaut 0 legitimement (personne n'a rate le poids sur cet essai), soit
elle ne se pose pas sur les combats d'offre.
Chaine : 24 bancs CONFORME.

## CAS 66 — LES DIALOGUES DE SITUATION (Mael, 10/08)
"Enrichir tous les dialogues et leur donner de vrais resultats."
Les quatre approches existantes (secouer, rassurer, ecouter, flatter)
sont GENERALES : on peut les dire n'importe quand, a n'importe qui, et
elles ne font bouger qu'un chiffre invisible. TROIS DIALOGUES DE
SITUATION s'ajoutent — ils ne s'ouvrent QUE si la situation existe, et
ils ont une consequence qui depasse l'entente :
  LE RELEVER APRES SA DEFAITE — seulement s'il vient de perdre. Un homme
  au moral bas y gagne +0,22 ; un homme qui encaissait deja, +0,10. Sans
  ca il traine sa defaite dans le camp suivant.
  LUI REMETTRE LES PIEDS SUR TERRE — seulement s'il a la grosse tete
  (aggression >= 68 ou discipline < 50) ET une serie en cours. RENDS 6
  POINTS DE DISCIPLINE, coute de l'entente (mesure : 50 -> 39 chez un
  caractere difficile). C'est un choix, pas un bonus.
  LUI PROMETTRE UN COMBAT — seulement s'il est sous contrat et n'a rien
  de prevu. +0,20 de moral tout de suite. /!\ ET ELLE ENGAGE : la
  promesse est DATEE et verifiee chaque jour. Un combat arrive ->
  promesse_tenue. 90 jours sans rien -> promesse_trahie.
  MESURE : entente 77 -> 45 sur une promesse non tenue.
/!\ ENTENTE.JS AVAIT DEJA LES CLES promesse_tenue ET promesse_trahie —
elles n'etaient appelees NULLE PART. Le systeme attendait cette mecanique
depuis le debut ; il manquait seulement de quoi faire une promesse.
/!\ ET ENCORE UNE CLE INVENTEE (troisieme fois aujourd'hui) : j'avais
ecrit "engueulade" et "secousse", qui n'existent pas — les vraies sont
engueulade_defaite et echange_rate. entente.js LEVE sur une cle inconnue,
donc ca s'est vu tout de suite. C'est exactement pour ca qu'il leve.
Chaine : 24 bancs CONFORME.

## CAS 67 — LE DINER AVEC LE MATCHMAKER (conception de Mael, 10/08)
"Aller a des diners avec eux et simuler une longue conversation avec
chaque reponse un resultat different" + "peut-etre 1 par an par orga".
ARBITRAGES TRANCHES PAR MAEL : un par an et par organisation, et le
diner sert SURTOUT A APPRENDRE.
=> CE N'EST PAS UN CINQUIEME BOUTON DE DIALOGUE, c'est une SOIREE en
   trois temps : comment on attaque, ce qu'on pense de son organisation,
   et le moment du cafe. Neuf choix au total, chacun avec sa reponse et
   son poids (-4 a +4).
=> ET LE DERNIER TEMPS RECOMPENSE LA RETENUE : "ne rien demander" vaut
   +3, "reclamer une date" vaut -1. Un matchmaker se souvient de celui
   qui ne lui a rien demande.
=> LA CONFIDENCE : au-dessus de 6 points cumules, il lache quelque chose
   — ET IL NE LACHE QUE CE QUE LE MONDE A VRAIMENT PREVU. Il lit
   l'echelle : un champion de 35 ans et plus ("il ne fera pas de vieux
   os"), un top 6 sur une serie de defaites ("il ne tiendra pas
   longtemps chez nous"), ou un de TES hommes bien classe ("deux
   victoires de plus et on parle titre"). AUCUNE PHRASE INVENTEE : c'est
   la regle du carnet — l'ecran ne dit jamais ce que le moteur n'a pas.
   POURQUOI CA COMPTE : le jeu ne disait JAMAIS rien a l'avance. On
   subissait les ceintures vacantes, les coupes, les adversaires. C'est
   la premiere fenetre sur ce qui vient.
MESURE : soiree parfaite -> relation 50 -> 73 (+23, dont +12 de la cle
"diner" qui attendait dans entente/relation depuis le cas 45), confidence
lachee et nommant un vrai combattant du roster, puis verrou de 365 jours.
Chaine : 24 bancs CONFORME.

## CAS 68 — CINQUANTE REPONSES, BRANCHEES (Mael, 10/08)
"Les phrases des combattants, il nous en faut au moins 50 differentes,
que j'aie toujours quelque chose de different, et branchees avec
consequence."
AVANT : 17 phrases en dur dans une cascade de if/else. Le meme homme
disait toujours la meme chose, et deux hommes opposes repondaient pareil.
=> 50 REPONSES, reparties sur les 7 approches, CHOISIES PAR L'ETAT REEL :
   moral, discipline, agressivite, fight IQ, SERIE EN COURS, NOMBRE DE
   DEFAITES, AGE et ENTENTE. Chacune vient AVEC ses effets (dMoral,
   dForme, trace d'entente) — la phrase et la consequence sont ecrites
   ensemble, donc l'ecran ne peut pas raconter autre chose que ce qui
   arrive (regle 7).
   Exemples du meme homme, deux moments : moral bas + 2 defaites ->
   "Il baisse les yeux, je vais corriger ça" (moral +0,04, forme +0,10,
   entente 50->53) ; en serie de 4 -> "Vous croyez que je ne le sais
   pas ?" (moral -0,08, entente 50->39). MEME PHRASE DU COACH, REPONSE
   ET PRIX OPPOSES.
/!\ TROIS PIEGES, TOUS DEJA VUS AUJOURD'HUI :
  1. J'ai failli AJOUTER les 50 a cote de l'ancienne cascade — elles
     seraient restees MORTES, comme `sortirApres` pendant tout un
     chantier. L'ancien corps a ete REMPLACE, pas complete.
  2. Le jeu ne passait ni la serie, ni les defaites, ni l'age dans
     l'etat : les 50 retombaient toutes sur le cas general. Deux
     endroits a corriger dans demo_jeu.html.
  3. LE BANC A ATTRAPE UNE REGRESSION : "rassurer un homme qui n'en a
     pas besoin ne sert presque a rien" — ma liste n'avait pas de
     variante pour le moral haut, elle tombait sur le cas general a
     +0,10. C'est l'invariant qui empeche de farmer du moral en repetant
     la meme phrase. Variante ajoutee.
MESURE : 48 des 50 sortent sur 200 combattants ; 14 phrases distinctes
sur 12 hommes de salle en 4 approches.
Chaine : 24 bancs CONFORME.

## CAS 69 — UNE CONVERSATION PAR SEMAINE ET PAR HOMME (Mael, 10/08)
"On pourrait leur parler qu'une fois par semaine a chaque combattant ?"
LE DELAI EXISTAIT DEJA (LASSITUDE = 5 jours) MAIS IL N'EMPECHAIT RIEN :
il divisait l'effet par quatre et laissait parler. Un joueur pouvait donc
revenir tous les jours et grappiller quand meme — et avec 50 reponses
disponibles, la tentation devenait forte.
=> SEPT JOURS, ET C'EST UN VERROU : l'ecran ne propose plus aucune
   approche tant que la semaine n'est pas passee, et il le DIT ("tu lui
   as parle il y a peu, laisse-le travailler — dans N j").
/!\ LE VERROU EST POSE A DEUX ENDROITS : a l'ecran ET dans direA().
UNE REGLE QUI NE VIT QUE DANS L'AFFICHAGE N'EST PAS UNE REGLE — un appel
direct, un bouton oublie, un chemin de secours, et elle saute.
Mesure : deuxieme tentative le meme jour -> moral INCHANGE (1,090) ;
0 bouton propose ; 8 jours plus tard, les 4 approches reviennent.
Chaine : 24 bancs CONFORME.

## CAS 70 — CINQUANTE FACONS DE VENIR TE VOIR, ET UN PLAFOND ANNUEL
Mael : "les phrases ou ils viennent me voir avec le pop-up, j'en veux une
cinquantaine — mais pas me faire harceler non plus, faudrait une limite
par an du total."
/!\ CE N'EST PAS LE CONTENU DE LA DEMANDE : 24 demandes existent deja,
chacune avec son texte. C'est LA MANIERE DONT IL SE PRESENTE — le fil
disait toujours "X veut te parler", pour tout le monde et pour toujours.
=> 50 VENUES, dont 32 CONDITIONNELLES et 18 generales. Choisies par son
   etat reel : caractere, discipline, lucidite, moral, entente, serie,
   defaites, age, blessure, camp, combat prevu.
   Un caractere difficile "debarque sans frapper" ; un homme au moral bas
   "traine devant le bureau depuis dix minutes" ; un indiscipline "arrive
   en retard, comme d'habitude" ; un vieux "vient s'asseoir lentement" ;
   un gamin "arrive en trombe, encore en sueur" ; une entente forte
   "s'assied en face de toi sans qu'on l'y invite — vous en etes la" ;
   une entente faible "reste debout dans l'embrasure, il ne s'assiera
   pas".
=> ET UN PLAFOND ANNUEL GLOBAL : 14 demandes par annee de jeu, tous
   hommes confondus. Le delai par homme (2 a 4 mois) et la file d'attente
   ne suffisaient pas — sur 140 adherents le total restait enorme.
   Au-dela du quota, ils gardent leurs requetes pour l'annee suivante.
MESURE (salle neuve, 30 adherents) : 6 demandes sur 400 jours, soit 5 par
an — le plafond ne mord pas dans une petite salle, il protege les grandes.
Chaine : 24 bancs CONFORME.

## CAS 71 — "7 FRAPPES SUR 167" : LE PLANCHER DE TOUCHE (Mael, 10/08)
Capture d'un combat en cours : 191 frappes significatives contre 7, son
adversaire a 4 % de reussite. Mael : "c'est abuse".
VERIFIE, ET IL AVAIT RAISON : 6 % des combattants tombaient sous 10 % de
precision. En instrumentant le pire cas (1 touche sur 29) : son
adversaire avait esquive 87 et parade 68. Avec la formule
(skill - defense) x 0,75, un ecart de 32 points coute 24 points de
chance — l'attaquant tombait donc sur LE PLANCHER DE 4 % A CHAQUE COUP.
Mesure du log : 0 touche sur 69 jabs, 0 sur 66 overhands, 0 sur 64 cross.
=> PLANCHER RELEVE DE 4 A 12 %. Un combattant professionnel touche
TOUJOURS un peu, meme domine : 4 % n'existe pas dans une cage.
/!\ ET CA NE TOUCHE PAS LE CALIBRAGE : precision moyenne 43 % avant,
44 % apres ; DEC 46,4 | SUB 22,7 | TKO 19,5 | KO 11,4. Le plancher ne
concerne QUE les duels tres desequilibres — exactement le but. Cas sous
10 % : 5 sur 84 avant, 0 apres.
/!\ MODIFIE DANS LES DEUX MOTEURS. striking_v2 est un module FEUILLE,
toujours compare ligne a ligne au Python — c'est l'ancrage qui subsiste
depuis l'abandon du portage cote engine (cas du matin). Changer le seul
JS a fait tomber la chaine a 3 bancs, immediatement. C'EST EXACTEMENT SON
TRAVAIL : le jour ou on touche a un module feuille sans le dire au
Python, on le sait tout de suite.
Chaine : 24 bancs CONFORME.

## CAS 72 — DEUX HOMMES DE LA SALLE L'UN CONTRE L'AUTRE (Mael, 10/08)
"Mon combattant a combattu un autre combattant de ma salle. Ça arrive,
mais là j'étais dans le camp que de 1, l'autre a même pas eu de
proposition."
LE SYMPTOME EST PIRE QUE LA BIZARRERIE : un seul des deux avait recu
l'offre et prepare un camp — L'AUTRE EST MONTE DANS LA CAGE SANS AVOIR
RIEN ACCEPTE. Et le manager perd forcement un homme tout en encaissant
deux bourses.
DEUX CHEMINS, LES DEUX FAUTIFS, ET LE SECOND EST LE VRAI COUPABLE :
  1. offres.choisirAdversaire excluait le combattant lui-meme, PAS SES
     COEQUIPIERS. Corrige.
  2. /!\\ cartes.batirCarte prend TOUT LE ROSTER, tes hommes compris —
     c'est VOULU, c'est ainsi qu'ils recoivent des adversaires du monde.
     Mais rien n'empechait la carte d'en apparier DEUX DES TIENS, et la
     personne n'avait rien signe. C'est par la que c'est arrive a Mael.
     On ne les retire PAS du vivier (ils doivent combattre) : cherche()
     refuse simplement de mettre deux `salle` face a face.
Mesure : 3 pros de la meme salle, meme division, meme organisation, deux
ans de monde -> 7 combats, 0 duel interne.
BANC CARTES ETENDU avec cet invariant (et salle.js ajoute a ses imports :
il ne testait que le monde jusqu'ici).
Chaine : 24 bancs CONFORME.

## CAS 73 — LE DUEL INTERNE DEVIENT UNE DECISION (Mael, 10/08)
Correction du cas 72, apres arbitrage : "ils peuvent accepter aussi, faut
que ça propose aux deux — mais je peux refuser et ça me proposera pas ce
combat en boucle." J'avais interdit le duel interne ; Mael veut le
GARDER, mais en faire un CHOIX.
=> LE MONDE NE LES APPARIE JAMAIS TOUT SEUL (le vrai defaut du cas 72 :
   un seul des deux avait signe, l'autre montait dans la cage sans rien
   avoir accepte). cartes.js refuse toujours de mettre deux `salle` face
   a face.
=> MAIS L'OFFRE PEUT LE PROPOSER, marquee `interne`. L'ecran le dit en
   rouge : "c'est un de tes hommes en face — accepter les engage tous les
   deux, refuser ferme le sujet pour de bon."
=> ACCEPTER ENGAGE LES DEUX : l'autre recoit son combatPrevu, donc son
   camp et sa preparation. Le fil previent : "tu ne peux pas les preparer
   l'un contre l'autre."
=> REFUSER EFFACE DURABLEMENT : les deux ids entrent dans REFUS_INTERNES,
   qui voyage dans la sauvegarde. On ne te le repropose plus.
/!\ PIEGE ATTRAPE A LA MESURE : le CIBLAGE court-circuitait le filtre. Le
raccourci "l'homme vise" rendait le combattant AVANT la boucle, donc un
duel deja refuse revenait quand meme. UN REFUS DOIT TENIR PAR TOUS LES
CHEMINS, pas seulement par le principal — meme famille que le verrou de
dialogue pose a deux endroits (cas 69).
Mesure : offre marquee interne · refus -> 2 ids memorises · reproposition
-> non, sujet ferme · acceptation -> LES DEUX ont un combat prevu.
Chaine : 24 bancs CONFORME.

===========================================================================
CAS 74 — LES BLESSURES (chantier L, conception de Mael, 10/08)
===========================================================================
Le plus gros manque du jeu : un homme enchainait vingt combats sans
jamais rien avoir, donc aucune decision n'avait de consequence durable.
LES TROIS ARBITRAGES DE MAEL, tous appliques :
  1. "Noté TKO" — l'arret medical n'est PAS une categorie a part.
  2. "Oui" — l'usure s'accumule.
  3. "Oui a choisir, mais faut que ça fasse baisser des stats logiques."

## HUIT BLESSURES, CHACUNE AVEC SES STATS
arcade (14-28 j : esquive, lecture, reflexes) · nez (21-35 : cardio) ·
main (70-120 : TOUS LES POINGS, rien aux jambes) · cotes (35-60 : cardio,
gainage, shot) · genou (90-180 : footwork, tous les kicks, sprawl,
balance) · epaule (50-90 : shot, clinch, passing, cross) · dos (25-45 :
throws, sweeps, recuperation) · cheville (30-50 : footwork, vitesse
jambes).
=> C'EST CE QUI REND LE CHOIX INTERESSANT : selon son style, la meme
blessure ne coute pas la meme chose. Un kickboxeur avec une main cassee
peut encore travailler ; avec un genou, non.
=> ET LE MALUS SUIT LA GUERISON : a trois jours de la fin il ne sent
presque plus rien, tout frais il est diminue pour de bon.

## D'OU ELLES VIENNENT
Du COMBAT : le risque sort de ce qu'il a PRIS (frappes encaissees,
knockdowns, methode de defaite) et de ce qu'il a DONNE (on se casse la
main sur un crane). Et DU CAMP : la progression est doublee, le risque
aussi.

## L'USURE (arbitrage 2)
Chaque blessure laisse une trace PERMANENTE : un dixieme du malus, pour
toujours, sur les memes stats. Mesure : main cassee -> jab 65 -> 63,7
definitivement, low kick inchange. Un homme qui a pris trois genoux ne
redevient jamais neuf.

## /!\ DEUX CALIBRAGES PAYES A LA MESURE
1. MON ARRET MEDICAL TOMBAIT SUR 57 % DES COMBATS (reel : 1-2 %). Cause :
   le tirage se fait A CHAQUE COUP TOUCHE A LA TETE — deux cents fois par
   combat. Une probabilite "faible" par coup devient une certitude sur la
   duree. Divisee par cent : 1 % des combats.
2. LE BANC A ATTRAPE UNE LIGNE MAL ECRITE : "traducteur TKO/A / verdict
   ARRET,B". verdict.js identifie le perdant par LE NOM ecrit dans la
   ligne ; ma ligne etait anonyme. Toutes les fins du moteur suivent la
   meme grammaire — la nouvelle aussi, et verdict.js a appris a la lire.
CALIBRAGE FINAL : DEC 44,1 | SUB 20,9 | TKO 18,6 | KO 14,5 | 2,73 rounds.
LA BLESSURE SE VOIT sur la fiche, avec ce qu'elle coute et le temps
restant. Chaine : 24 bancs CONFORME.

===========================================================================
CAS 75 — LA VIE DE LA SALLE (conception de Mael, 10/08)
===========================================================================
"Il faut qu'on donne encore plus de vie au jeu, qu'une année soit longue."
LE CALCUL POSE ET ACCEPTE : aucune famille d'evenements ne remplit une
annee a elle seule (un diner = 5 rendez-vous/an, les blessures une
dizaine). CE QUI LA REMPLIT, C'EST PLUSIEURS QUI TOURNENT EN PARALLELE.
Voici la sixieme : la salle elle-meme. Mael avait 140 adherents qui
n'existaient pas.

## SIX EVENEMENTS, TOUS AVEC UNE VRAIE CONSEQUENCE
1. UNE SALLE RIVALE VEUT TON ESPOIR — le meilleur jeune sans contrat.
   Le retenir coute (400 € + son niveau x 22) ; lui parler sans payer ne
   marche QUE si l'entente est au-dessus de 62 ; sinon IL PART VRAIMENT
   (retire de l'effectif, sa fiche garde "parti pour l'Académie de Lyon").
2. UN ADHERENT NE PAIE PLUS — relancer (55 % de recuperer), l'effacer, ou
   effacer l'ardoise : ca se sait, +0,5 de reputation. "Le vestiaire en
   parle."
3. UN SPONSOR LOCAL (a partir de 12 de reputation) — 60 € + reputation x 7
   par mois, VERSE CHAQUE SEMAINE au prorata. Refuser rapporte un peu de
   reputation aussi : tu as refuse une banderole.
4. LE MATERIEL CASSE — reparer (250-650 €) ou perdre une etoile pour de
   bon, dans la famille concernee.
5. UN COACH MENACE DE PARTIR — l'augmenter (+3 de niveau, charge
   hebdomadaire) ou le perdre (-12 de niveau d'encadrement, sa specialite
   disparait de roleStaff).
6. ORGANISER UN GALA — 900 € + reputation x 30. La recette depend de ta
   REPUTATION et de l'AURA MOYENNE de tes amateurs. Ca peut rapporter
   gros ou te faire perdre : "gala a moitie vide, ca arrive."

## /!\ TROIS POINTS DE CONSTRUCTION
- LE BLOCAGE NE CONNAISSAIT QUE "un bouton" OU "oui/non". Ces evenements
  ont deux a trois voies, chacune avec son prix : nouveau rendu a choix
  multiples (choisirBloque).
- CHAQUE EVENEMENT TESTE SES CONDITIONS et rend false s'il n'a pas lieu
  d'etre — sans ca, une salle sans coach aurait recu des menaces de
  demission, et une salle a 2 de reputation des offres de sponsor. On
  pioche dans ce qui est POSSIBLE aujourd'hui.
- LE SPONSOR RAPPORTE VRAIMENT (ligne dans la semaine de salle). Sans
  elle, accepter une banderole n'aurait ete qu'un texte — exactement le
  defaut qu'on traque depuis ce matin.
MESURE : 15 evenements sur 420 jours, soit un toutes les 4 semaines, cinq
familles sur six declenchees (le sponsor demande 12 de reputation).
Chaine : 24 bancs CONFORME.

## CAS 76 — LE DEBAUCHAGE EST RARE (Mael, 10/08)
"On peut pas espacer les salles rivales qui volent ? C'est rare non."
Il avait raison, et MA PROPRE MESURE le montrait deja : 2 tentatives de
debauchage en 420 jours, parce que l'evenement etait tire au meme rythme
que le materiel qui casse. Dans la realite, une salle rivale ne vient pas
chercher ton gars tous les six mois.
=> DEUX VERROUS : au moins DIX-HUIT MOIS entre deux tentatives (SALLE
   .dernierVol, qui voyage dans l'etat), et seulement pour un espoir qui
   VAUT LE DEPLACEMENT — niveau 50 au lieu de 42. On ne debauche pas un
   homme quelconque.
MESURE APRES : 1 debauchage sur 420 jours (contre 2), et la place liberee
profite aux autres familles — le sponsor apparait enfin (176 €/mois),
les impayes et les galas remontent. LE TOTAL RESTE LE MEME (14 contre 15
evenements) : on n'a pas appauvri la salle, on a rendu le vol
exceptionnel.
/!\ CE QUE CA DIT SUR LA METHODE : quand un evenement rare est tire au
meme rythme qu'un evenement banal, il cesse d'etre rare. La cadence
appartient a l'evenement, pas a la boucle qui le declenche.
Chaine : 24 bancs CONFORME.

## CAS 77 — L'ENTENTE DECIDE DU DEBAUCHAGE (Mael, 10/08)
"Et par rapport a l'entente avec mon gars, ça joue comment pour se le
faire voler ?" REPONSE HONNETE : presque pas. Elle ne servait QUE sur une
branche, et par un SEUIL SEC a 62 — un homme a 61 et un homme a 20
partaient exactement pareil. Et surtout elle ne decidait pas si
l'evenement ARRIVAIT : un gars attache a toi depuis dix ans etait
demarche aussi souvent qu'un inconnu.
=> ELLE JOUE MAINTENANT A TROIS ENDROITS :
   1. AU-DESSUS DE 82, ON NE VIENT MEME PAS LE CHERCHER. Il refuse tout
      seul et te le raconte : "je leur ai dit non avant qu'ils finissent
      leur phrase." C'est un evenement AGREABLE — la recompense d'une
      relation construite, pas une menace.
   2. LA REACTION EST EN DEGRADE : chance de rester = (entente-28)/55.
      20 -> 5 % · 50 -> 40 % · 62 -> 62 % · 70 -> 76 % · 80 -> 95 %.
      Et le texte suit : au-dessus de 68 "je suis bien ici, et vous le
      savez" ; en dessous "il reste, mais il a hesite, tu l'as senti".
   3. LE PRIX EN DEPEND : x1,6 a entente 0, x0,75 a entente 100. Retenir
      quelqu'un qui t'aime coute 1 344 € ; racheter quelqu'un qui doute,
      2 302 €.
=> ET LA FACON DONT TU L'APPRENDS DIT OU VOUS EN ETES : "il est venu t'en
   parler lui-meme" (64+) · "c'est le voisin qui te l'a dit" (44+) · "tu
   l'apprends par un adherent, il a deja visite leurs locaux" (en
   dessous). Trois phrases qui racontent la relation sans afficher un
   chiffre — regle du carnet.
Chaine : 24 bancs CONFORME.

===========================================================================
CAS 78 — LE STAFF (conception de Mael, 10/08)
===========================================================================
"Faut gerer bien les coachs maintenant : pouvoir en recruter, liste + CV.
Amateur = coach comme pro, la c'est un truc chelou aussi. Et plus
d'angles a travailler, que ça ouvre une interface quand je parle au
coach." Trois demandes, et LA DEUXIEME EST UN DEFAUT DE FOND.

## /!\ LE DEFAUT : UN SEUL CHIFFRE POUR TOUT LE MONDE
SALLE.coachAm encadrait LES AMATEURS DU MARDI SOIR *ET* UN PRO QUI
PREPARE UN TITRE, avec la meme valeur. C'est ce que Mael appelle
"chelou", et il a raison : un club a un coach qui degrossit les debutants
et un autre qui affute les competiteurs — ce ne sont pas les memes
hommes, ni le meme prix.

## CE QUI EXISTE MAINTENANT
- DES COACHS NOMMES : nom, AXE (frappe, lutte, sol, physique, preparation
  mentale), niveau, salaire hebdomadaire, et LE GROUPE qu'ils encadrent
  (les amateurs / le groupe pro / toute la salle).
- niveauStaff(groupe, famille) : on demande au staff qui couvre CE groupe
  pour CETTE famille de seance. Un coach hors de sa specialite ne vaut
  que 55 % de lui-meme. Sans personne : 25, on se debrouille.
  MESURE : amateurs en frappe 38 (l'ancien coach), pros en physique 76
  (le preparateur embauche). Deux groupes, deux realites.
- UN MARCHE avec CV : cinq candidats, chacun avec son histoire ("A suivi
  22 athletes olympiques. Cher, mais il sait ce qu'il fait"), son niveau,
  son salaire et sa prime a la signature. Le salaire suit le niveau en
  puissance 1,55 — un tres bon coute tres cher.
  /!\ LE MARCHE EST STABLE (120 jours) : sinon la liste changerait a
  chaque ouverture d'ecran et le joueur ne pourrait pas comparer.
- RENVOYER COUTE UN MOIS DE SALAIRE.
- L'INTERFACE DU COACH (3e demande) : on lui parle DE SON TRAVAIL — qui
  il encadre, sur quel angle il insiste (les cinq), et ce qu'il pense de
  la salle (les trois meilleurs, l'etat du groupe pro, l'infirmerie, la
  caisse). Cinq angles, trois groupes, tout modifiable depuis l'ecran.

## /!\ LA MIGRATION
Les anciennes parties n'ont qu'un SALLE.coachAm : migrerStaff() en fait
un premier coach ("Meyer, ancien kickboxeur 14-6, il etait la avant toi")
au lieu de perdre l'investissement du joueur. Appelee partout ou le staff
est lu.
Et chargesSemaine() suit desormais les VRAIS salaires, plus une formule.
Chaine : 24 bancs CONFORME.

## CAS 79 — TRENTE-DEUX COACHS, DEUX METIERS (Mael, 10/08)
"Je veux au moins 30 coachs qui changent a chaque partie, et des coachs
amateurs comme les coachs pro a recruter aussi."
=> 32 CANDIDATS, TIRES DE LA GRAINE DE LA PARTIE. Deux parties neuves
   n'ont pas le meme vivier de coachs, comme elles n'ont pas le meme
   monde (cas 42). Verifie : partie A "Serge Klein (95), Serge Vasseur
   (94)..." · partie B "Hervé Belkacem (95), Karim Nogueira (93)...".
   /!\ ET STABLE DANS UNE MEME PARTIE : tire UNE FOIS et fige. Sinon la
   liste changerait a chaque ouverture d'ecran et on ne pourrait pas
   comparer deux candidats.
=> DEUX METIERS, et c'est la vraie demande de Mael — un coach qui sait
   degrossir des debutants n'est pas un coach qui affute des
   competiteurs :
     FORMATEUR (22 sur 32) — niveau 25 a 58, 59 a 103 €/semaine. "Anime
       le cours de boxe d'un club municipal", "il apprend a tomber avant
       d'apprendre a projeter", "ceinture violette, il enseigne les bases
       mieux que personne". Arrive chez LES AMATEURS.
     COMPETITION (10 sur 32) — niveau 56 a 92, 97 a 163 €/semaine. "A
       coache deux champions nationaux de K-1", "medaille national de
       lutte greco". Arrive chez LES PROS.
   Vingt CV differents ecrits, dix par metier.
=> L'ECRAN A DES FILTRES : par metier et par specialite (32 fiches, 9
   filtres). "Formateurs + sol" -> 4 resultats.
=> ET LE SALAIRE SUIT LE METIER : un formateur coute lineairement, un
   coach de competition en puissance 1,55 — un tres bon competition coute
   trois fois un bon formateur.
Chaine : 24 bancs CONFORME.

## CAS 80 — LA NOTE CACHEE, LA GRILLE, ET LA CHARGE (Mael, 10/08)
"Un peu trop accessibles les gros staff, et je veux pas voir la note :
c'est caché et ça s'affine avec le temps. Et j'aimerais un onglet spécial
ou je peux gérer mes coachs — je place lutte / striking / sol,
amateur / pro, et je peux placer chaque coach ou je veux. Si un coach
s'occupe pro + amateur, performance réduite car trop de gens a gérer."

1. LA NOTE N'EST PLUS AFFICHEE NULLE PART (marche, staff, fiche, gestion).
   ON N'EMBAUCHE PAS SUR UN CHIFFRE : on embauche sur un CV, et on
   decouvre ce qu'il vaut EN LE VOYANT TRAVAILLER. `vu` compte les
   semaines passees ensemble, et l'estimation se resserre :
     0-3 sem  : "tu ne le connais pas encore"
     4-11     : fourchette large (+/- 22)
     12-29    : +/- 12 · 30-59 : +/- 6 · 60+ : exact
   Six phrases, de "il n'est pas au niveau" a "c'est un tres grand
   technicien". MESURE : un coach a 52 passe de "il a des lacunes" a "il
   fait le travail, sans plus" — l'erreur se corrige avec le temps.
   /!\\ LE BROUILLARD EST DETERMINISTE (derive du nom et du nombre de
   semaines) : sinon l'estimation sauterait a chaque affichage et le
   joueur verrait qu'on tire au sort.

2. UN ONGLET STAFF (🧑‍🏫) AVEC UNE GRILLE AXES x GROUPES : cinq lignes
   (frappe, lutte, sol, physique, preparation mentale), deux colonnes
   (amateurs, pros), et dans chaque case QUI couvre — en vert si c'est
   tenu, en or si c'est partage, en rouge si personne. On voit d'un coup
   d'oeil le trou de son encadrement.
   Chaque coach peut prendre PLUSIEURS AXES et le groupe qu'on veut.

3. LA CHARGE COUTE VRAIMENT (arbitrage de Mael) :
     couvrir les deux groupes : -22 %
     chaque axe supplementaire : -14 %, plafonne a -30 %
   MESURE : un coach a 38 rend 38 sur un seul front, 30 s'il prend les
   deux groupes, 21 s'il prend en plus trois axes. L'ecran le dit sans
   chiffre : "il est sur trop de fronts — il rend moins partout".
   => C'EST CE QUI EMPECHE D'AVOIR UN SEUL BON COACH POUR TOUT. Il faut
   choisir : un specialiste par domaine, ou un homme a tout faire qui
   n'excelle nulle part.
Chaine : 24 bancs CONFORME.

## CAS 81 — LE COACH DE SOL N'APPARAISSAIT PAS (Mael, 10/08)
Capture : l'onglet Staff ne montre que Meyer, alors que l'ecran Gestion
liste "Da Costa — coach JJB & sol" juste en dessous.
CAUSE — MA MIGRATION : migrerStaff() fabriquait UN SEUL coach a partir de
SALLE.coachAm, alors que la salle en avait DEUX dans FICHES depuis le
debut (Da Costa et Meyer). Da Costa existait, se voyait en Gestion,
avait sa fiche... et n'encadrait rien : il n'etait dans aucun staff.
=> ON REPREND TOUS LES COACHS DE FICHES : chaque homme marque gr:"coach"
   devient un membre du staff, avec L'AXE QUE SON STYLE ANNONCE — "JJB &
   sol" -> sol, "striking" -> frappe, "lutte" -> lutte, "prepa" ->
   physique, "mental" -> mental. Le CV reprend son style d'origine.
   Verifie : Paulo Da Costa (sol) et Jonas Meyer (frappe), tous deux dans
   la grille, chacun sur sa ligne.
/!\ ET LEUR FICHE OUVRE LA BONNE INTERFACE : ouvrirCoach les retrouve
desormais par leur CLE d'origine autant que par leur nom — sans ca, Da
Costa retombait sur l'ancien ecran de rapport.
/!\ LECON, la meme que ce matin avec les orgas et la relation : QUAND ON
INTRODUIT UNE NOUVELLE STRUCTURE, IL FAUT Y VERSER TOUT L'EXISTANT — pas
seulement le cas qu'on avait en tete en l'ecrivant.
Chaine : 24 bancs CONFORME.

## CAS 82 — LA GRILLE CLIQUABLE, LE RENVOI, L'ESTIMATION, LA PROGRESSION
Cinq demandes de Mael (10/08), toutes liees :
1. "Ce serait plus instinctif de pouvoir cliquer sur la grille et choisir
   un coach direct." => CHAQUE CASE EST UNE PORTE (10 cases : 5 axes x 2
   groupes). On clique "Lutte / Pros", on voit tous ses coachs avec ce
   qu'on sait d'eux, on en pose un — et un lien direct vers le marche
   FILTRE SUR CET AXE si on n'a personne.
   /!\\ ET CA PREVIENT : si le coach encadrait deja l'autre groupe, le
   poser ici lui donne les DEUX — on le dit ("il sera moins bon partout")
   au lieu de le faire dans son dos.
2. "Ya pas l'option renvoyer." Elle existait dans la LISTE mais pas sur
   LA FICHE du coach — la ou on va naturellement. Ajoutee, avec le
   montant du solde affiche (4 semaines de salaire).
3. "Je vois pas l'estimation de ses stats une fois recrute." Meme
   defaut : l'estimation etait dans la liste, pas sur la fiche. Ajoutee,
   avec "ton avis se precisera avec le temps" tant qu'on n'est pas sur.
   => TROIS FOIS LE MEME DEFAUT DANS LE MEME ECRAN : ce qui existe dans
   une vue n'existe pas dans l'autre. A verifier systematiquement quand
   un objet a deux representations.
4. "Est-ce que les coachs progressent ? Normalement oui." OUI, DESORMAIS.
   Il apprend en travaillant, d'autant moins qu'il est deja bon :
     niveau 30 -> +3,6 par an · 50 -> +2,6 · 70 -> +1,6 · 88 -> +0,5
   /!\\ ET UN COACH DISPERSE N'APPREND PAS : -25 % par front
   supplementaire. Mesure : +3,6 concentre contre +1,0 disperse. Un homme
   qui court partout ne progresse plus — c'est la meme logique que la
   penalite d'efficacite, et ca donne une deuxieme raison de specialiser.
Chaine : 24 bancs CONFORME.

## CAS 83 — LE POTENTIEL CACHE DES COACHS (Mael, 10/08)
"Je préfère large entre tant et tant pour un début, bon et très bon —
qu'ils évoluent pas linéairement", puis la precision qui compte : "entre
les differents coachs ils progressent differemment". Et surtout :
"UN COACH QUI A PAS UN GROS PALMARES PEUT AUSSI DEVENIR MONSTRUEUX, ÇA
VEUT RIEN DIRE, IL A PEUT-ETRE PAS EU SA CHANCE."
=> CHAQUE COACH A UN POTENTIEL ET UNE VITESSE, TOUS DEUX CACHES.
   Potentiel 28 a 96, vitesse 0,45 a 1,70. Il progresse VERS son
   potentiel, a SA vitesse.
   /!\\ LE TIRAGE EST INDEPENDANT DU CV ET DU NIVEAU DE DEPART. C'est la
   regle de Mael, et elle change tout le recrutement : mesure sur un
   marche, 8 formateurs modestes sur 20 ont un potentiel >= 75. Exemple
   reel : un homme a 25 de niveau, "preparateur amateur, il fait courir,
   et ça marche", potentiel 83. Personne ne se le dispute — c'est le
   meilleur pari du jeu.
   MESURE : deux coachs a 35, dix ans plus tard -> 37 (potentiel 45,
   lent) contre 64 (potentiel 85, rapide). Deux carrieres opposees au
   meme point de depart.
=> L'AGE SUIT LE PALMARES, PAS LE POTENTIEL : un educateur qui debute a
   24-34 ans, un coach de competition confirme 38-56. On ne coache pas
   deux champions nationaux a 28 ans.
=> ILS VIEILLISSENT ET ILS PARTENT : un an tous les 52 semaines, et la
   retraite s'etale de 55 a 64 ans. MESURE sur 60 coachs : le plus tot
   55, mediane 57, le plus tard 62. La fiche previent des 56 ans ("fin de
   carriere proche"). Et on n'apprend plus tres vieux : plein regime
   jusqu'a 45, plus rien apres 58.
=> ET ILS PEUVENT PARTIR POUR MIEUX : l'evenement de salle vise desormais
   CELUI QUI A LE PLUS PROGRESSE (niveau actuel, pas niveau d'embauche),
   et la hausse demandee suit ce qu'il vaut. LE PRIX DU SUCCES : plus tu
   le fais monter, plus on te le prend. En dessous de 45, personne ne
   l'appelle.
/!\ MEME PIEGE QUE L'ARRET MEDICAL (cas 74) : ma premiere probabilite de
retraite etait "1,2 % par an" — mais la fonction tourne CHAQUE SEMAINE.
Tous partaient a 58 ans. Une probabilite faible repetee cinquante fois
par an devient une certitude. TOUJOURS SE DEMANDER A QUELLE CADENCE LE
CODE TOURNE avant d'ecrire une probabilite.
Chaine : 24 bancs CONFORME.

## CAS 84 — LA PROGRESSION DES COACHS RALENTIE (Mael, 10/08)
"Ralentis la progression, c'est enorme la — il doit atteindre son
potentiel en au moins 7 ans, c'est long a devenir sa meilleure version.
Et tu peux encore progresser apres 10 ans en realite."
DEUX CORRECTIONS, ET LA SECONDE EST UN VRAI DEFAUT :
 1. LE RYTHME divise par trois. Un coach met desormais 10 a 16 ans a
    s'approcher de son potentiel, pas 4.
 2. /!\\ LA COURBE S'ECRASAIT : la marge etait (potentiel-niveau)/96, donc
    plus il approchait, plus il ralentissait — il STAGNAIT a huit points
    de son plafond et n'y arrivait JAMAIS. C'est l'inverse de ce que Mael
    decrit ("tu peux encore progresser apres 10 ans"). La marge ne
    descend plus sous 0,22 : la progression reste lente mais REELLE
    jusqu'au bout.
MESURE (formateur de 28 ans, niveau 32, potentiel 80) :
   lent    3a:37 · 7a:43 · 10a:48 · 16a:57
   moyen   3a:41 · 7a:53 · 10a:60 · 16a:70
   rapide  3a:46 · 7a:62 · 10a:70 · 16a:79
Et un coach deja bon (70, potentiel 88, 40 ans) : 75 a trois ans, 80 a
sept, 83 a dix, 87 a seize — il progresse encore a 56 ans, doucement.
=> ON RECRUTE UN JEUNE FORMATEUR POUR CE QU'IL SERA DANS DIX ANS. C'est
un investissement de carriere, pas un achat.
Age d'apprentissage repousse aussi : plein regime jusqu'a 48 (au lieu de
45), plus rien a 62 (au lieu de 58).
Chaine : 24 bancs CONFORME.

## CAS 85 — L'ESTIMATION VISIBLE, ET DANS LES DEUX VUES (Mael, 10/08)
"L'estimation est pas bien visible, et elle est que dans gestion, pas
categorie coach — pour les coachs que je possede."
DEUX DEFAUTS :
 1. ELLE ETAIT NOYEE : une ligne grise de meme taille que le reste. Elle
    a maintenant SON ENCART — fond distinct, bordure coloree selon la
    confiance, texte en 14-15 px, et UNE JAUGE ◆◆◇◇ qui montre a quel
    point on est sur de soi. Plus l'ancienneté en clair : "18 semaines
    avec lui · ton avis se précisera".
 2. ELLE N'ETAIT PAS SUR LA FICHE DU COACH ouverte depuis l'Effectif —
    la ou on clique naturellement sur son nom. Ajoutee, avec l'age, les
    axes, le groupe, l'alerte de surcharge et celle de fin de carriere.
/!\ QUATRIEME FOIS AUJOURD'HUI QUE LA MEME DONNEE EXISTE DANS UNE VUE ET
MANQUE DANS L'AUTRE (le renvoi, l'estimation dans la liste, le marche,
et maintenant la fiche d'Effectif). REGLE : QUAND UN OBJET A PLUSIEURS
REPRESENTATIONS, TOUTE DONNEE AJOUTEE A L'UNE DOIT ETRE VERIFIEE DANS
TOUTES. Le lister explicitement avant de coder, au lieu de le decouvrir
en jouant.
Chaine : 24 bancs CONFORME.

## CAS 86 — LE ZIP EN RETARD, RATTRAPE PAR L'HTML LIVRE (14/08)
Debut de session : le seul zip que Mael avait sous la main etait perime
("attention il est pas a jour" — il avait raison). Audit du disque :
 - moteur : les 31 modules du zip REGENERENT exactement le bundle du
   v129-3 (compare octet a octet). A jour.
 - ecran.gabarit.js : identique (modulo l'echappement <\/script>).
 - demo_jeu.html : EN RETARD de 50 Ko — il manquait les correctifs des
   CAS 84-85 (encart d'estimation, jauge, fiche d'Effectif).
 - carnet du zip : s'arretait au CAS ~74. Remplace par le carnet uploade
   (CAS 85).
RECUPERATION : operation inverse d'apercu.js — extraire du v129-3 les
deux scripts inlines (verifies identiques au disque), reconstituer
demo_jeu.html. PREUVE PAR LA BOUCLE FERMEE : `node js/apercu.js` sur le
demo reconstruit reproduit le v129-3 OCTET POUR OCTET.
=> LA REGLE DU CARNET CONFIRMEE EN VRAI : l'archive fiable est le
dernier HTML livre. Le zip est un confort, pas une reference.
Chaine relancee apres reconstruction : 24 bancs CONFORME.

## CAS 87 — LE CONTRAT DE SALLE VIT ENFIN (Mael, 14/08)
Le contrat de salle etait signe UNE FOIS POUR TOUTES : `restants`
n'etait jamais decremente — un accord "3 combats" durait une carriere.
LES ARBITRAGES DE MAEL, en dialogue :
 1. "Pourquoi je devrais repayer ?" — la salle ne paie PAS l'homme,
    c'est l'inverse (il touche ses bourses, la salle prend sa part).
    Ce qui se paie : LES PAPIERS. "Une somme fixe pour les papiers du
    contrat, la RH" — frais de dossier, pas salaire.
 2. Duree EN COMBATS, "2 a 4 max, 8 c'est trop".
CE QUI EST CODE :
 - FRAIS DE DOSSIER par palier de standing DU JOUR (contrats.js) :
   500 € (sans org / nationale non classe) · 1 500 € (classe ou roster
   europeen) · 4 000 € (roster GFL-AFC hors top 10) · 10 000 € (top 10
   ou champion). A la signature ET a chaque renouvellement. Caisse trop
   courte = pas de signature (verifie a l'ecran ET dans la fonction —
   un ecran ouvert sur un vieux solde ne signe pas).
 - DUREE BORNEE 2-4 DANS LE MODULE, pas a l'ecran : un appel qui passe
   8 signe 4. Les puces de l'ecran passent de [2,3,4,5] a [2,3,4].
 - LE DECOMPTE : apres chaque combat, APRES l'encaissement — le combat
   qui epuise l'accord paie encore ta part.
 - L'ECHEANCE (salleEchue) : echu, l'accord ne lie plus — pas de
   demarchage, et PART ZERO sur ses bourses (on ne se sert pas dans la
   bourse d'un homme qui n'a rien signe). C'est l'incitation a
   re-signer, une depeche le dit en clair.
 - LE RENOUVELLEMENT = LE MEME ECRAN que la premiere signature :
   avisSurPart relit l'entente du jour — en froid, il exige une part
   plus basse tout seul, rien de nouveau a coder.
/!\ DEFAUT D'ORDRE TROUVE EN CODANT : le bloc "sous contrat d'orga"
s'affichait AVANT le test d'echeance salle — un pro engage chez AFC
avec un accord de salle termine ne voyait JAMAIS l'ecran de
re-signature. Reordonne : l'accord avec TOI prime.
REGLE MULTI-VUES (CAS 85) APPLIQUEE AVANT DE CODER : ecran signature /
ecran contrat orga (ligne salle AJOUTEE) / ecran demarchage (deja la) /
fil de depeches (frais, echeance, part zero). Banc contrats : +10
preuves (paliers, bornes, echeance, re-signature). Syntaxe du demo
verifiee apres edition. Chaine : 24 bancs CONFORME.

## CAS 88 — CHANTIER G : LE COIN CRIE EN TEMPS REEL (14/08)
La vision de Mael du 08/08 ("une commande de fou") est CODEE. Conception
signee ligne a ligne en conversation avant tout code (regle 7) :
 - VOCABULAIRE PAR PHASE. Debout : avance / calme, pas de bagarre avec
   lui / la tete / le corps / la jambe / shoote / sors de la, tourne /
   il est touche, finis-le. Clinch : projette / sors, repousse / les
   genoux. Sol DESSUS : conserve / passe sa garde / GnP / la soumission.
   Sol DESSOUS (consignes differentes, demande de Mael) : conserve,
   bloque / releve-toi / le sweep / explose. Toute phase : respire.
   Corrections de Mael gravees : "touche" pas "parti", "la tete" pas
   "boite-le", pas d'underhooks ("trop technique").
 - TRANCHE DE 30 s (arbitrage Mael). Le cri s'applique a la tranche
   SUIVANTE, jamais au deja-calcule — l'ecran ne ment pas.
 - 3 CRIS PAR ROUND ; le cri PERDU S'AFFICHE ("Il n'entend rien, il est
   dans son combat") — les deux valides par Mael.
 - LE FILTRE D'ECOUTE (regle du 08/08) : fight IQ + discipline ; sonne
   ou vide, il n'entend rien ; l'indiscipline qui domine ignore "calme".
   Le tirage d'ecoute vient de Math.random COTE ECRAN, jamais de l'alea
   du moteur — a cris egaux le combat reste celui de la graine.
COMMENT C'EST FAIT :
 - simuler_round -> GENERATEUR simuler_round_tranches + wrapper qui
   draine (une seule source). PREUVE DE NEUTRALITE : 105 combats, 44 551
   lignes, 105/105 identiques. Idem coin.js (jouerRoundTranches).
 - Les leviers, TOUS INERTES SANS ORDRE (memes appels alea, seuils
   par defaut inchanges) : consigneSol ETENDU a 4 consignes du dessus
   (report, grammaire du 10/08) ; gameplan.sol_dessous module les DEUX
   portes du travail du dessous + biais d'interet dans tenter_evasion ;
   clinch_intent oriente le choix d'action du controleur et la rupture
   volontaire. "Tourne" = bascule de temperament (donnee, pas code).
 - LE BANC A FAIT SON TRAVAIL EN NAISSANT : "shoote" ne divergeait pas
   (proba trop fine sur une tranche), "avance"/allure non plus (le temps
   glisse mais AUCUN TIRAGE ne depend de t). La divergence deterministe
   vient d'un cri de CIBLE, lu a chaque frappe. Lecon : un levier reel
   n'est pas forcement un levier VISIBLE — le banc doit prouver la
   divergence, pas la supposer.
 - ECRAN : panneau de cris superpose SANS pause (un vrai coin crie
   pendant l'action), boutons de la phase REELLE du moteur au dernier
   arret, compteur, echo du cri dans le commentaire. Le round coule
   tranche par tranche (l'ecran demande la suite tout seul), SIMULER
   avale les tranches restantes. Round 1 par tranches aussi.
 - GARDE-FOU : un round entame par tranches SE TERMINE (drainage), il ne
   se rejoue jamais — sinon demi-round rejoue sur des corps entames.
 - E2E node : combat entier par tranches, cris, RETRADUCTION MI-ROUND a
   chaque arret (le point qui pouvait casser), verdict convergent. OK.
Banc 27 (verifier_cris) : 15 preuves. Chaine : 25 bancs CONFORME.
A JOUER PAR MAEL : le rythme reel des tranches a l'ecran, la lisibilite
du panneau sur telephone, et l'equilibre des effets de cris (aucun
calibrage mesure encore — les forces de report sont des premiers reglages).

## CAS 89 — LA RETRAITE DE MES GARS : LA CONVERSATION (14/08)
Le "RESTE OUVERT" du carnet (la retraite n'etait qu'une phrase) est
ferme. Mael : "gere retraite de mes gars". Ce qui manquait n'etait pas
le depart (raccrocher() existait, complet) mais LA CONVERSATION et le
DEVENIR-COACH.
CE QUI EST CODE :
 - IL EN PARLE D'ABORD : a 36+, hors serie, la decision seche devient
   un evenement a TROIS VOIES — "Reste, on n'a pas fini" (EN DEGRADE
   sur l'entente, pattern du cas 75 : 5 % a 30 d'entente, 40 % a 50,
   76 % a 70, 95 % a 83 — un homme qu'on n'a pas ecoute ne reste pas ;
   reussi, ca compte comme defendu_publiquement et le sursis vaut UN
   AN) / "Un dernier combat" (il raccroche A CHAUD apres son prochain
   combat, quel que soit le resultat — on ne revient pas sur une
   annonce ; s'il ne combat pas dans l'annee, il part quand meme) /
   "C'est ta decision" (le raccrocher existant).
 - LE FIL DU CARNET SE REFERME : "futurs COACHS a l'embauche quand ils
   raccrochent" (grave des le debut, jamais branche). Un retraite avec
   >= 8 victoires rejoint le marche des coachs — SON NOM, SON CV REEL
   (bilan, titres), son axe = sa meilleure famille de stats.
   /!\ LA REGLE FONDATRICE S'APPLIQUE A LUI : niveau de depart modeste
   (38-58 — il DEBUTE dans CE metier), potentiel tire INDEPENDAMMENT du
   palmares (mesure sur 1000 : ~29 % de monstres caches, ~7 % de
   plafonds bas — le champion peut plafonner, le journeyman devenir
   enorme). Parti en bons termes (entente >= 60) : PRIME A ZERO pour ta
   salle — il connait la maison.
Syntaxe verifiee. Chaine : 25 bancs CONFORME.
A JOUER : le rythme des pensees de retraite (22 %/an a 36+), et si le
marche merite un marquage visuel "ancien de la maison".

## CAS 90 — L'ECRAN MENTAIT : LE PLI (Mael, 15/08, 5h38 du matin)
Mael, premiere partie jouee sur le v132 : "Bizarre les fights" — une
feuille a 214/563 frappes, 7/10 amenees, 6 soumissions... pour un homme
qui PERD la decision contre 4/4. LE VRAI COMBAT etait celui du detail
par cible (6/12 contre 4/11, serre, Anguiano gagne vraiment) : le
verdict du moteur etait juste, LES COMPTEURS DE L'ECRAN mentaient — la
pire categorie du carnet, introduite hier par le flux par tranches.
LA CAUSE, EN DEUX COUCHES :
 1. Le forcage de temps ecrit pour la reprise APRES LA CLOCHE remettait
    t a zero a chaque tranche du round 1 -> l'ecran rejouait toutes les
    etapes depuis le debut du round, RE-VERSANT les stats a chaque arret
    de 30 s (~10 tranches -> compteurs x40).
 2. Premiere correction (recalage par temps sans forcage) -> l'inverse :
    DES PERTES. Mesure au banc : LE TRADUCTEUR RE-TEMPORISE TOUT LE
    ROUND a chaque retraduction (t 8,1 -> 3,5 pour le meme evenement) et
    redistribue le reliquat de la fin provisoire en etapes AU TEMPS DEJA
    REGARDE. Aucun recalage par temps ne peut etre juste en cours de
    round.
LA REGLE FINALE, prouvee au banc : le CONTENU hors temps est un prefixe
stable -> ON GARDE L'INDEX, on adopte la chronologie de la liste
fraiche, et on REPLIE (replierEtat : tous les compteurs reconstruits de
0 a i par applique() en mode muet — une seule source). La fin provisoire
d'une TRANCHE ne se joue JAMAIS (son reliquat sera redistribue) ; seule
la fin d'un ROUND se joue. L'ECRAN NE COMPTE PLUS : IL REFLETE.
PREUVE : 3 graines, protocole complet par tranches == lecture unique de
la traduction finale, champ a champ. Gravee en preuve 7 du banc 27 —
ce defaut ne remordra pas en silence.
LECON : un protocole incremental au-dessus d'un traducteur qui reecrit
sa sortie ne peut PAS accumuler — il doit replier. Et c'est encore Mael
en jouant qui l'a vu, a la premiere partie, a 5h38.
Chaine : 25 bancs CONFORME.

## CAS 91 — DEUX DEFAUTS DU G, VUS PAR MAEL EN JOUANT (15/08, 5h42-5h51)
Deux captures d'ecran, deux vrais defauts du chantier G :
1. CRASH "coin.js : le combat est termine" apres un KO. LA CHAINE :
   KO mi-round pendant un SIMULER -> le bloc d'avalage traitait la
   reponse AVANT l'assignation de FIN -> la fin de combat s'appliquait
   sans FIN -> pas de carte de fin -> CLOCHE FANTOME -> le joueur donne
   un plan de jeu -> consigne() jette sur un combat fini.
   CORRIGE EN TROIS COUCHES : FIN s'assigne EN ENTREE du handler, avant
   tout chemin ; cloche() refuse de sonner si FIN ou fini ; et la
   ceinture-bretelles cote jeu — consigne() n'est jamais appelee sur un
   combat fini (un message de coin perdu ne doit jamais tuer le jeu).
2. LES CRIS DU SOL PROPOSES DEBOUT CONTRE LA GRILLE ("ca me dit les pos
   sol alors que ya eu 0 td"). DEUX CAUSES EMPILEES :
   a) phaseDesCris testait etat.phase === 2 — les constantes du moteur
      sont des CHAINES ("debout"/"clinch"/"sol"). Une hypothese jamais
      verifiee, ET LE BANC TESTAIT LA MEME HYPOTHESE (phase: 2 en dur
      dans les etats de test). Corrige : cris.js ET le banc importent
      les constantes du moteur. LECON GRAVEE : UN BANC QUI REDECLARE
      LES VALEURS TESTE SA PROPRE CROYANCE, PAS LE MOTEUR.
   b) Meme corrige, le panneau suivait la phase du MOTEUR AU DERNIER
      ARRET — une tranche EN AVANCE sur la lecture : les cris
      decrivaient un futur invisible. LA REGLE : LE PANNEAU SUIT LA
      PHASE VISIBLE A L'IMAGE (l'ecran filtre le vocabulaire complet
      sur ce qui est affiche : sol/controle/clinch des etapes), et le
      jeu VERIFIE A L'APPLICATION — un cri qui ne colle plus a l'etat
      du moteur repond "trop tard, la situation a deja changé", comme
      un vrai coin qui crie une consigne perimee. Il ne s'applique pas.
Syntaxe verifiee, gabarit regenere. Chaine : 25 bancs CONFORME.
Neuf defauts sur dix trouves par Mael en jouant.

## CAS 92 — LE CAMP GRATUIT ET L'HORLOGE QUI RECULE (Mael, 15/08, 16h35)
Deux defauts vus en jouant le v134 :
1. "QUAND JE SUIS EN NEGATIF JE PEUX PAS FAIRE LE CAMP GRATUIT."
   abordable = argent >= prix echoue a PRIX ZERO quand la caisse est
   dans le rouge (-300 >= 0 est faux). On ne peut pas etre trop pauvre
   pour s'entrainer chez soi. Corrige : le gratuit est TOUJOURS
   abordable (!prix || argent >= prix).
2. "LE ROUND 1 SE FINIT ET RECOMMENCE A 2 MN." La correction du CAS 90
   adoptait la chronologie fraiche (t = S[i].t) — et le traducteur
   RE-TEMPORISE tout a chaque retraduction : le chrono SAUTAIT EN
   ARRIERE a chaque tranche (4:47 -> ~2:00), le round semblait se
   relancer. LA REGLE : L'HORLOGE NE RECULE JAMAIS. On DECALE la
   chronologie fraiche pour qu'elle reparte du temps courant
   (delta = t - S[i].t applique a toutes les etapes restantes) : ecarts
   relatifs preserves, temps monotone, le marqueur borne deja
   l'affichage a la duree du round. La derive residuelle plafonne le
   chrono a 0:00 quelques secondes en fin de round — mineur et honnete.
   "Le combat se lance seul" rapporte tres probablement le meme
   symptome (le round qui semble repartir) ; a confirmer au v135.
Chaine : 25 bancs CONFORME.

## CAS 93 — LE DOUBLE-CONTINUER ET L'HORLOGE DU MOTEUR (Mael, 15/08, 21h04)
1. "ENCORE LANCE SEUL APRES MA CONF DE PRESSE." Le combat ne s'ouvrait
   pas seul : le bouton "Continuer" du bandeau EXECUTAIT l'action du
   bloquant (agirBloque) le jour du combat — et la scene de pesee se
   ferme elle-meme par un bouton "Continuer". Deux "Continuer" a la
   suite : le second lancait le combat par reflexe. REGLE : "CONTINUER"
   NE LANCE JAMAIS LE COMBAT — monter dans la cage est un geste
   distinct, seul le bouton "▶ Lancer le combat" du bandeau le fait
   (un toast le rappelle si on insiste sur Continuer).
2. "LE COMBAT CONTINUAIT MEME A 0 SEC TIMER." La "derive residuelle"
   du CAS 92 n'etait pas mineure : le decalage cumule poussait le
   chrono a 0:00 des le milieu du round, et il y restait. LA REGLE
   FINALE : L'HORLOGE DIT LE TEMPS DU MOTEUR. Le generateur donne son
   temps REEL a chaque arret (res.value.t) ; le jeu le transmet
   (tMoteur) ; l'ecran interpole l'affichage entre deux arrets selon la
   progression des etapes. La chronologie fictive du traducteur ne sert
   plus qu'au RYTHME de lecture — le chrono raconte le combat calcule.
   En fin de round, la borne haute = le temps de la derniere etape
   (recalee par le verdict) : l'heure d'un KO reste la vraie.
LECON (deuxieme rustine sur le meme organe) : quand une donnee VRAIE
existe dans le moteur, l'ecran doit la brancher — pas approximer la
fiction. On avait la regle pour les stats (le pli, cas 90) ; elle vaut
pour le temps.
Chaine : 25 bancs CONFORME.

## CAS 93 bis — LE CHRONO DEFILE (Mael, 15/08)
"Le timer ne defile plus pendant le combat." L'horloge du CAS 93 ne
dependait que de l'INDEX d'etape — fige entre deux franchissements.
Ajoute : la fraction INTRA-ETAPE ((t - etape.t)/(suiv.t - etape.t)),
la meme qui fait glisser les positions sur la grille. Le chrono coule
en continu, toujours cale sur les temps reels du moteur aux arrets.
Chaine : 25 bancs CONFORME.

## CAS 93 ter — LA FENETRE SE MESURAIT SUR LA NOUVELLE LISTE (16/08, 1h26)
Mael, encore en jouant : chrono fige a 5:00 au round 2, DEMI-GARDE
affiche en pleine DISTANCE, les points hors de la cage.
 1. tM0=ecoule() etait calcule APRES S=m.S : la fraction se mesurait
    sur la NOUVELLE liste (plus longue a chaque tranche) — ecrasee vers
    zero, le chrono collait en haut de round. L'ecoule se capture
    desormais AVANT le remplacement de S.
 2. La REPRISE DE ROUND ne repliait pas : les etapes franchies par le
    recalage ne sont pas rejouees, donc l'etat VISUEL (position au sol,
    points de la grille, phase) restait celui de la fin du round
    precedent. La reprise appelle replierEtat() — compteurs, grille,
    phase et round reconstruits depuis la liste fraiche, en muet.
Chaine : 25 bancs CONFORME. Le protocole tranche/round de l'ecran a
coute quatre corrections en deux jours — le jour ou le traducteur saura
emettre une chronologie STABLE, la moitie de cette plomberie tombera.
Note pour un chantier futur.

## CAS 94 — UNE SEULE CHRONOLOGIE : LE TEMPS MOTEUR MAITRE DU RYTHME (16/08)
Mael : "le chrono baisse super lentement". La cause de fond des quatre
rustines : DEUX chronologies — le RYTHME de lecture suivait la
chronologie fictive du traducteur (etalee) pendant que le CHRONO
suivait le temps moteur (30 s par tranche). A x8 on regardait du x1,5.
LA REGLE DU CARNET APPLIQUEE JUSQU'AU BOUT : le temps moteur est le
maitre du chrono ET du rythme. retemporiser() reecrit les temps des
etapes a venir, uniformement sur la fenetre moteur de la tranche —
t redevient le temps du combat, ecoule() redevient trivial, x8 veut
dire x8. La plomberie delta/interpolation du CAS 92-93 TOMBE.
DEUX INVARIANTS PAYES AU BANC EN CHEMIN :
 - LE PLI D'ABORD, LA RETEMPORISATION ENSUITE : retemporiser depend du
   round courant — lancee avant le pli, elle s'ancrait sur le round
   precedent.
 - PAS D'INFO MOTEUR, PAS DE REECRITURE : sur un "suite" a l'ancienne
   (round entier, sans tMoteur — le protocole du banc), retemporiser
   sur la fenetre par defaut de 30 s compressait le round entier et
   avalait les suivants ("RD vus : 2 -> 2"). Le mode historique reste
   intact.
Chaine : 25 bancs CONFORME.

## CAS 95 — LE CAMP GRATUIT, DEUXIEME GARDE (Mael, 16/08)
"Je peux plus faire les camps alors que c'etait regle." Ce n'etait pas
une regression : LE CAS 92 N'AVAIT CORRIGE QUE LA MOITIE. L'abordabilite
vit a DEUX endroits — le bouton de l'ecran (corrige le 15/08) et le
garde de poserCamp() (argent < prix, qui refusait 0 € sur une caisse
negative avec "La caisse ne suit pas"). Le bouton laissait passer,
l'action refusait. C'EST LA REGLE MULTI-VUES DU CAS 85, VIOLEE PAR SA
PROPRE CORRECTION : une regle, TOUS les endroits — corriger une vue
sans chercher les autres fabrique le bug suivant. Grep systematique
des gardes jumeaux desormais quand on corrige une regle d'acces.
Chaine : 25 bancs CONFORME.

## CAS 96 — LE BANC QUI MANQUAIT : LE DIRECT DE BOUT EN BOUT (16/08)
Mael : "le jeu est completement bugge sur cette version, c'est
terrible." Reponse structurelle avant la chasse : LE PROTOCOLE PAR
TRANCHES N'ETAIT EXERCE PAR AUCUN BANC — le banc gabarit parle le
protocole historique (rounds entiers), et chaque correction d'ecran
depuis deux jours partait a l'aveugle, testee par Mael seul sur son
telephone. NE le banc 26 (verifier_direct) : LE VRAI GABARIT execute
dans vm, sa boucle setInterval CAPTUREE et tickee comme le navigateur,
contre le parent reel (Combat, retraduction, tMoteur, cris) — un
facteur transporte les messages. Invariants : zero exception sur
~19 000 ticks, le combat va au bout, les rounds s'enchainent 1..N
(N = LE TEMOIN, pas une liste permissive — la premiere version
acceptait "RD vus : (vide)" sur un combat d'un round, un banc qui ne
force pas la reprise de round ne teste pas le chemin le plus retouche),
le chrono ne recule jamais, les compteurs == le pli final, les cris
partent. Ajoute a la chaine : 26 bancs.
Le flux nominal TIENT dans ce harnais — le "completement bugge" de
Mael vient donc d'ailleurs (etat de sauvegarde ? un ecran precis ?).
Precision demandee avant de chasser.

## CAS 97 — LE PRESSEUR RESPIRE : LE BIAIS DE CAGE (Mael, 16/08)
Mael, en jouant : "les combats sont trop desequilibres, on a trop
booste le footwork." MESURE AVANT TOUT GESTE (la regle du cas
non-resolu du 10/08), et la mesure a dit AUTRE CHOSE que l'intuition :
 - CLONES STRICTS, 600 combats : le slot A gagnait 36 %, le slot B
   64 %. Un biais STRUCTUREL de position dans le moteur.
 - A/B causal (+20 sur UNE stat entre clones, 200 combats par stat) :
   cage_cutting +30 POINTS — le monstre. footwork : +2 points
   seulement. L'intuition "footwork" etait le symptome ; la cause etait
   le JEU DE CAGE.
 - La contre-preuve qui a tout donne : +20 de cage_cutting chez B ne
   changeait RIEN (deja servi), chez A +30 (il compensait).
LA LIGNE FAUTIVE : le role de PRESSEUR attribue par comparaison STRICTE
(`>`) du cage_cutting — a egalite, TOUJOURS f2, et un seul point
d'ecart faisait un presseur PERMANENT pour tout le combat.
OPTION B DE MAEL : LE ROLE RESPIRE. Chaque bataille de placement tire
son presseur — 50/50 a egalite, ~65 % a +10, ~80 % a +20, borne 10-90.
Un bon coupeur presse SOUVENT, pas TOUJOURS.
APRES, MESURE : clones 49/51 (le biais est mort) · styles resserres
(grappler 55, kickboxeur 53, polyvalent 53, lutteur 53, boxeur 48,
brawler 37 — le brawler reste le dossier ouvert du 10/08) ·
cage_cutting +20 -> 60 % et footwork +20 -> 57 % (des armes, plus des
verdicts).
RECALIBRAGE DES VERDICTS (la correction deplacait la distribution) :
COMMOTION 0,22 -> 0,42 · SUB 0,52 -> 0,42 · KO_SEC 0,66 -> 0,78 ·
ARBITRE 0,32 -> 0,50. Resultat : DEC 48,6 · SUB 20,0 · TKO 20,0 ·
KO 11,4 (cible : 46,8 / 19,5 / 21,4 / 12,3) — a un point pres partout.
Rounds moyens 2,42 (cible 2,70) : les finitions tombent un peu plus
tot, a surveiller en jouant.
/!\ FAUSSE ROUTE ASSUMEE : j'ai porte la modif dans engine.py — VIOLANT
la decision du 10/08 (le Python est un TEMOIN FIGE, la chaine le
prouve). Le temoin a ete RESTAURE depuis l'archive, la reference JS
regeneree APRES les calibrages (gen_ref_engine_js, procedure du banc),
et la lecon retenue : quand un banc rouge ressemble a du py-vs-js,
LIRE LA DOC DU BANC AVANT d'y "remedier" — verifier_engine est une
non-regression JS-JS depuis le 10/08, ses etiquettes PY/JS sont un
heritage d'affichage.
Chaine : 26 bancs CONFORME.

## CAS 98 — LE CONTRAT ECHU FORCE UNE DECISION (Mael, 16/08, 3h38)
Mael, apres avoir vu Vasseur combattre gratuitement ("part 0 €") :
"il faut que ca me pop up quand un gars sort de contrat — soit je le
re-signe, soit il disparait de chez moi." Fini la zone grise du CAS 87
(echu = part zero mais l'homme restait, et l'echeance passait
inapercue entre deux depeches).
CE QUI EST CODE : a l'echeance, un evenement BLOQUANT — la journee
n'avance plus tant qu'on n'a pas tranche.
 - RE-SIGNER : ouvre l'ecran du CAS 87 (entente du jour, frais de
   dossier au palier du jour). Referme sans signer ? LE BLOQUANT
   REVIENT a la prochaine avancee — l'echeance ne passe plus jamais.
 - LE LAISSER PARTIR : le depart du debauchage reutilise — retire de
   l'effectif, sa fiche reste au monde ("Parti libre a la fin de son
   contrat de salle"), et l'entente pese sur le ton des adieux.
La garde part-zero du CAS 87 reste en ceinture-bretelles (un combat
sans accord ne preleve toujours rien) mais ne devrait plus se voir.
Chaine : 26 bancs CONFORME.

## CAS 99 — L'ECONOMIE DE LANCEMENT : "IL ME FAUDRA UNE STAR" (16/08)
Mael, nouvelle partie : "-3 000 au bout de 2 semaines." Sa capture de
l'ecran Gestion a livre DEUX defauts :
1. LE LOYER AFFICHAIT −950 € EN DUR — le debit reel lisait bien
   local().loyer (300 € pour le garage), l'ecran affichait une
   constante. L'ecran ne dit QUE ce que le moteur debite. Corrige.
2. LE STRUCTUREL : 31 720 €/an de charges contre 8 970 € de
   cotisations. Le coupable principal : LE COACH INITIAL A niveau x 7 =
   315 €/sem = 16 380 €/an — "Meyer qui etait la avant toi" coutait a
   lui seul LE DOUBLE des cotisations de la salle entiere. Et les
   baremes du marche etaient a l'echelle d'une salle deja riche.
LA PHILOSOPHIE TRANCHEE PAR MAEL : "il me faudra une star pour
decoller." L'economie de la salle vit des cotisations jusqu'aux
premieres bourses — TENDUE, PAS IMPOSSIBLE. Trois leviers appliques :
 - SALAIRES DIVISES PAR DEUX, aux QUATRE fabriques (multi-vues : coach
   initial, les deux baremes du marche, le retraite-coach) : formateur
   12 + niveau x 0,7 (~1 500-3 000 €/an, paye au cours), competition
   20 + niveau^1,55/18 (~2 500-5 000 €/an).
 - CAISSE DE DEPART 6 200 -> 9 500 € : quatre signatures, la prime d'un
   formateur, six semaines de charges d'avance — la marge pour CHOISIR.
 - L'ECRAN D'EMBAUCHE DIT LE VRAI PRIX : le cout ANNUEL affiche a cote
   de l'hebdo. Le jeu peut etre dur, pas opaque.
Chaine : 26 bancs CONFORME.

## CAS 100 — TOI AUSSI TU COACHES, ET LA GRILLE SEPARE (Mael, 16/08)
Deux demandes de Mael en jouant sa nouvelle partie :
1. "EST-CE QU'ON SE METTRAIT PAS DES STATS DE COACH AUSSI NOUS ?
   Aleatoire en debut de partie, et on peut se mettre quelque part."
   CODE : le patron est un ancien — il apparait au staff (nom "Toi"),
   axe et niveau tires A L'AVEUGLE (30-55), et LA REGLE FONDATRICE
   s'applique a lui : potentiel de coach INDEPENDANT (28-92), on se
   DECOUVRE en travaillant (avisCoach s'affine sur soi comme sur les
   autres — on ne sait pas ce que vaut son propre passe transmis).
   Salaire zero, pas de bouton "Le remercier". S'affecte par la grille
   et les puces comme n'importe quel coach. Present aussi dans les
   vieilles parties (assurerMoi a l'ouverture du staff). Coherent avec
   le cas 99 : au debut, c'est TOI le staff gratuit.
2. "QUAND JE METS UN COACH GROUPE PRO OU AMATEUR CA LE MET AUSSI DANS
   L'AUTRE GROUPE, JE PEUX PAS SEPARER." Le trou logique de
   poserSurCase : un coach en "tous" pose sur une case ne matchait
   AUCUNE branche — son groupe restait "tous" pour toujours, insecable
   par la grille (Meyer, defaut "tous", etait donc PARTOUT a vie).
   LA REGLE : LA GRILLE FAIT CE QU'ELLE MONTRE. "Le mettre ici" = il
   est ICI (s'il couvrait l'autre groupe, il le lache — on le dit).
   "Le retirer d'ici" en "tous" = il reste EN FACE. Le "tous"
   volontaire reste accessible par les puces de la liste.
Chaine : 26 bancs CONFORME.

## CAS 100 bis — LE CHEMIN VERS "TOUS" DEPUIS LA GRILLE (16/08)
Mael, juste apres le cas 100 : "maintenant je peux plus mettre pro ET
amateur le meme coach." La correction de la grille avait ferme TOUT
chemin vers "tous" depuis la grille — les puces de la liste l'offraient,
mais Mael vit dans la grille (celle qu'il a demandee au cas du 10/08).
J'avais affirme "le tous reste accessible par les puces" SANS verifier
le parcours reel du joueur. Ajoute : dans la fiche de case, un coach
deja affecte a UN groupe porte un bouton explicite "Etendre aux deux
groupes (moins bon partout)" — le cout est annonce, le choix est un
geste. Chaine : 26 bancs CONFORME.

## CAS 101 — LES FANTOMES DE LA DEMO AU PROGRAMME (Mael, 20/08)
"Mais attends, j'ai pas de pro — tu m'as dit que c'est le nom de mes
pros." Il avait raison, et j'avais affirme sans verifier (Pros 0 a son
effectif). Les seances "groupe pro" du programme affichaient
`lien("Okonkwo") · lien("Kanté")` EN DUR — un vestige de la salle de
demo scriptee, rendu dans TOUTE partie, pointant vers des fiches que le
nettoyage hors-demo SUPPRIME (liens vers le vide). Le rendu liste
desormais LES VRAIS pros de l'effectif, et dit honnetement "aucun pro a
la salle — le creneau attend" quand il n'y en a pas. Verification des 7
occurrences restantes : toutes confinees au MODE demo (echeances et
fiches scriptees, nettoyees hors demo). DEUX LECONS : l'ecran ne montre
que ce qui existe — et ne jamais expliquer un ecran au joueur sans
avoir VERIFIE la source de ce qu'il affiche.
Chaine : 26 bancs CONFORME.

## CAS 102 — LE PLANNING EST A TOI, ET LE CORPS LE PAIE (Mael, 20/08)
Deux chantiers valides ensemble par Mael — ils se verrouillent l'un
l'autre : sans fatigue, la strategie optimale du planning serait de
bourrer les creneaux ; avec elle, DOSER devient le metier.
1. LE PLANNING MODIFIABLE. GRILLE reste la semaine type ; la partie
   joue sur SALLE.grille (copie a la premiere lecture, sauvegardee).
   Chaque creneau du programme se clique : discipline (5 choix, le
   titre suit), groupes (loisir/amateur/pro), vider/ouvrir. Les effets
   etaient DEJA reels (la progression par axes lit la grille, le coach
   competent s'applique) — le creneau dit desormais aussi QUI encadre
   ("personne pour encadrer" en rouge). LES DEUX CONTRAINTES :
   - sous 4 seances/semaine pour les adherents, l'attractivite baisse
     (x0,72-0,93) — gaver les pros asseche les cotisations ;
   - sans un sparring pro hebdo, les pros montent emousses au combat
     (-10 de fraicheur effective). Les deux sont DITES dans l'editeur.
   Le pro-only se detecte par LES GROUPES, plus par le titre (le rendu
   des noms de pros suivait le titre — regle multi-vues).
2. LA FRAICHEUR (0-100). Chaque seance coute selon l'intensite
   (sparring 14 · lutte-MMA 10 · boxe 8 · JJB 7 · physique 6, loisirs
   x0,6) ; chaque nuit rend selon L'AGE (13/12/10/8 — le veteran ne
   suit plus le gamin). Trois paliers : frais (70+) plein rendement ·
   entame (40-70) les seances rendent 60 % · crame (<40) presque rien
   (x0,12) ET ~8 %/semaine de blessure d'entrainement (les huit
   blessures du chantier L, cause "surentrainement"). LE CAMP FATIGUE
   FORT (12/jour x qualite) — "on en revient casse ou transforme" est
   enfin mecaniquement vrai. AU COMBAT : le cardio paie (x0,85 a 1
   selon la fraicheur, plancher 20). LE MENAGER : sur la fiche
   (Priorites), il saute une seance sur deux le temps de recuperer.
   Depeche quand un homme passe crame. COURBES MESUREES : 2 seances
   dures/jour -> crame en ~10 jours (7 a 36 ans) ; recuperation
   complete en ~6 jours de repos ; le rythme normal est stable.
Syntaxe verifiee. Chaine : 26 bancs CONFORME.
A JOUER : l'equilibre des couts (les valeurs sont des premiers
reglages), et si l'Effectif merite un marqueur de fraicheur en liste.

## CAS 102 bis — LA SEMAINE D'UN COUP (Mael, 20/08)
"Y a pas de reglage par semaine direct" — l'editeur du CAS 102 n'etait
accessible que depuis le programme DU JOUR : pour regler le mardi, il
fallait etre mardi. Ajoute : "Regler la semaine" au-dessus du programme
— les 7 jours, chaque creneau cliquable (couleur de discipline, ★ =
groupe pro seul, "+ libre" pour ouvrir), les avertissements en tete, et
l'editeur de creneau porte un bouton retour "Semaine".
Chaine : 26 bancs CONFORME.

## CAS 102 ter — LE VRAI CALENDRIER (Mael, 20/08)
"Je voyais un genre de calendrier de la semaine avec midi et soir, je
clique sur le creneau et ca ouvre et la je choisis." La liste de puces
du 102 bis devient une GRILLE : les jours en lignes (Lun -> Dim), trois
colonnes MATIN/MIDI/SOIR, chaque case teintee a la couleur de sa
discipline avec le groupe en dessous (A+L, Pro, tous), les cases vides
en pointille "—". Un clic sur la case ouvre l'editeur du creneau, qui
revient a la semaine. Chaine : 26 bancs CONFORME.

## CAS 102 quater — DEUX COURS EN PARALLELE, ET LE VALIDER (Mael, 20/08)
Deux demandes sur le calendrier :
1. "IL ME MANQUE UNE TOUCHE VALIDER" — l'editeur de creneau se ferme
   par un bouton ✓ Valider qui rend au calendrier.
2. "JE PEUX PAS METTRE BOXE AMATEUR ET LUTTE PRO SUR LE MEME CRENEAU"
   — si, maintenant : l'editeur travaille par CRENEAU HORAIRE et
   accepte jusqu'a DEUX cours en parallele (deux zones de tapis, deux
   coachs — comme une vraie salle), chacun sa discipline et ses
   groupes, suppression par cours. Le calendrier empile les deux dans
   la case. GARDE-FOU MOTEUR : un membre ne peut pas etre sur deux
   tapis a la fois — le premier cours du creneau qui le prend, l'autre
   s'en passe (prisParCreneau). Le programme du jour ouvre l'editeur
   par l'heure, plus par l'index.
Chaine : 26 bancs CONFORME.

## CAS 103 — L'ACCUEIL : LE BAPTEME ET LES PREMIERS PAS (Mael, 21/08)
Le chantier "accueil nouveau joueur" de la liste sortable. Conception
validee par Mael ("c'est bien le petit message du 1, apres on choisit
le nom de notre coach et de notre salle") :
 - LE BAPTEME : en partie neuve, un ecran unique — trois phrases qui
   donnent le contrat du jeu ("les adherents paient les murs, les
   espoirs deviennent des pros — et un jour, l'un d'eux te fera
   decoller"), puis TON NOM et LE NOM DE TA SALLE. Le patron du staff
   prend le nom, le bandeau du jour porte celui de la salle, la
   premiere depeche raconte l'ouverture. Une seule fois (garde
   SALLE.nomSalle).
 - LES PREMIERS PAS : six gestes reels epingles en haut de l'ecran
   Salle — regler la semaine, voir son staff, signer un espoir, lire la
   tresorerie, programmer un combat, vivre le premier combat. Chaque
   ligne cliquable vers le bon ecran, COCHEE QUAND LE GESTE EST FAIT
   (crochets aux vrais points : reglerCreneau, allerOnglet, signerSalle,
   combatPrevu, encaisserResultat), masquable, disparait une fois
   complete. Pas de tunnel, pas de fleches : le jeu s'explique par ses
   six premiers gestes.
Syntaxe verifiee. Chaine : 26 bancs CONFORME.
LA LISTE SORTABLE : accueil FAIT · retraites FAITES · le G calibre en
jouant · RESTE : l'export/import de sauvegarde (le socle du cloud Play
Games), et la longue partie de rodage.

## CAS 103 bis — LA TDZ DU DEMARRAGE (Mael, 21/08, capture d'erreur)
"Cannot access PAS_LISTE before initialization" : le bloc PREMIERS PAS
etait declare APRES le bloc de demarrage — le premier rendre() appelait
rendrePas() avant que la constante existe. Deplace avant le demarrage,
verification ajoutee (l'ordre declaration < demarrage teste en node).
LECON : toute declaration utilisee par le rendu doit vivre AVANT le
bloc de demarrage — le node --check ne voit pas les TDZ d'execution,
seul l'ordre reel compte. Chaine : 26 bancs CONFORME.

## CAS 103 ter — LE TEXTE NE PRESUPPOSE QUE CE QUI EXISTE (Mael, 21/08)
"Je recois ce message alors que j'ai pas de pro" : Lefort demandait a
passer pro en se comparant a "la moitie des pros de la salle" — d'une
salle qui n'en a aucun. La demande etait bien gardee (dossier, niveau,
caractere) ; le TEXTE etait une fiction. dit peut desormais etre une
FONCTION du contexte (nb de pros) : avec des pros, la comparaison ;
sans, "je serai ton premier pro" — qui est exactement la partie de
Mael. Le crible du banc teste TOUTES les variantes (le contrat a change,
le banc suit). Helper ditDe() cote ecran — les textes fixes restent des
chaines. Chaine : 26 bancs CONFORME.

## CAS 104 — LES AIDES DU DEBUT, ET LE CRI QUI SE VOIT (Mael, 21/08)
Trois demandes de Mael apres son test du bapteme :
1. "DES BULLES D'AIDE AU DEBUT OU TU PEUX SKIP." Mecanisme aide(cle,
   titre, texte) : chaque aide se montre UNE FOIS, AU MOMENT DU GESTE
   (jamais avant, jamais en tunnel), carte discrete en bas d'ecran,
   "Compris" la ferme, "couper les aides" coupe tout (SALLE.aides /
   SALLE.aidesCoupees, sauvegardes). QUATRE BULLES POSEES :
   - premier AMATEUR qui rejoint (SA demande) : le circuit amateur, le
     passage pro depuis la fiche, "trop tot il se fera manger" ;
   - premier COMBAT PROGRAMME : le dossier (camp, plan, sparring) ;
   - premier gars ENTAME : la fraicheur, le menager, le planning ;
   - premiere SIGNATURE de contrat de salle : la part, l'echeance, les
     frais. D'autres bulles s'ajouteront en jouant (le mecanisme est la).
2. "CRIER, ON VOIT PAS BIEN LE RESULTAT." L'echo passait par la ligne
   de commentaire, noye dans le flux. Desormais un BANDEAU DEDIE
   au-dessus de la cage — dore si le cri porte, gris s'il se perd ou
   arrive trop tard — visible ~2,6 s. (Premier replace touche a vide :
   la div flash n'avait pas la forme supposee — CHAQUE remplacement se
   verifie, lecon du carnet re-payee.)
3. POUR PLUS TARD, GRAVE ICI : LE DIALOGUE D'ENTRE-ROUNDS — au coin,
   le combattant dit SON RESSENTI (branche sur le reel : degats recus,
   cardio, momentum, sonne) avant les consignes. Un chantier narratif a
   concevoir proprement — le ressenti doit venir du moteur, pas d'une
   banque de phrases hors-sol.
Chaine : 26 bancs CONFORME.

## CAS 104 bis — LA FRAICHEUR AUSSI VISIBLE QUE LES STATS (Mael, 21/08)
"Je veux que la fatigue soit tres visible sur chaque combattant, autant
que les stats." Un composant unique jaugeFraicheur() — la jauge-batterie
(verte/or/rouge par palier, largeur = valeur) — pose sur TROIS vues :
 - l'ECRAN EFFECTIF : chaque ligne, entre l'age et la progression ;
 - le CLASSEMENT PROGRESSION de l'ecran Salle : idem ;
 - la GRANDE FICHE : une CASE a part entiere dans le bandeau bilan
   (bilan · serie · notoriete · FRAICHEUR), le mot en couleur + la
   jauge — au meme rang que les stats, comme demande.
Une seule source (fraicheurDe), un seul composant — la regle multi-vues
respectee d'entree cette fois. Chaine : 26 bancs CONFORME.

## CAS 104 ter — LA PASTILLE, PAS LA BATTERIE (Mael, 21/08)
"Je suis pas fan... j'imaginais juste une petite pastille de couleur
avec un texte a cote, genre epuise, en forme." La jauge-batterie du
104 bis remplacee par SA forme : une pastille de couleur + le mot,
et QUATRE mots au lieu de trois — en forme (85+) · frais (70+) ·
entame (40+) · epuise (<40). Meme composant unique, memes trois vues
(Effectif, classement progression, grande fiche — la case affiche le
mot en couleur). Chaine : 26 bancs CONFORME.

## CAS 104 quater — LA BULLE DE L'ORGA (Mael, 21/08)
"Il faudrait aussi dire de chercher une orga" : au passage pro, une
bulle de plus — "un pro sans organisation ne combat pas : envoie son
dossier, les petites d'abord, le matchmaker repondra". Posee au vrai
geste (passerPro). Chaine : 26 bancs CONFORME.
QUESTION DE MAEL EN SUSPENS (design, pas un bug) : la GEOGRAPHIE des
organisations — "signer dans des trucs trop loin de ta salle, c'est
possible d'aller combattre si loin ?" A trancher avec lui avant tout
code (voir reponse en conversation : le realisme MMA dit oui, on
voyage ; l'eventuel cout = fatigue du deplacement, PAS un blocage).

## CAS 105 — UNE NATIONALE ETRANGERE PREND DES LOCAUX (Mael, 21/08)
"Pour un contrat a 1000 € combattre en Russie, t'en dis quoi ?" — rien
n'empechait de signer un petit dossier a la Taiga FC. La geographie
existait (chaque orga a pays + niveau, les rosters piochent local
depuis toujours) mais LE DEMARCHAGE l'ignorait. LA REGLE, dans l'esprit
du commentaire fondateur ("un debutant de Marseille ne fait pas ses
debuts en Suede") : une NATIONALE ETRANGERE ne prend un homme de la
salle que si sa notoriete atteint la portee de l'organisation — il
VAUT alors le deplacement. Sinon : refus dedie, "On prend des locaux.
Reviens quand son nom traversera les frontieres." Les europeennes
prennent leur continent, les internationales le monde — inchangees.
PAS de malus-voyage pour l'instant (la question fatigue/deplacement
reste ouverte au carnet — a trancher si le besoin se sent en jouant).
Chaine : 26 bancs CONFORME.

## CAS 106 — LA GARDE DU CLASSEMENT, L'ENTREE QUI S'OUVRE (Mael, 21/08)
1. TypeError "reading poids_plume" : classement() lisait
   m.rosters[org][division] sans garde — un org fantome plantait tous
   les appelants. Garde A LA SOURCE ((m.rosters||{})[org]||{}).
2. "HEXAGONE C'EST TROP DUR, C'EST UNE ENTREE" : la porte regionale
   n'aidait que les traces positives (v>d) — un 0-0 n'etait qu'un jet
   de des. Desormais : v>d -> 0,85 · dossier vierge (v>=d) -> 0,55.
   Le circuit d'entree signe aussi les debuts, comme en vrai.
3. A FAIRE (grave, demande de Mael) : LES INTERVIEWS DE COACH EN FIGHT
   WEEK — pendant la semaine du combat, le media tend un micro au
   patron ; les reponses jouent sur la notoriete/la pression, dans le
   systeme de scenes existant (pesee/conf). A concevoir ensemble.
Chaine : 26 bancs CONFORME.

## CAS 107 — TROIS DEFAUTS DE MAEL EN UNE PASSE (21/08)
1. "LE MESSAGE COMBAT ALORS QUE LE COMBAT ETAIT FINI, EN BOUCLE" : la
   croix de fermeture apres le verdict ne passait par AUCUN chemin
   d'encaissement — combat fini jamais compte, le bloquant du soir
   revenait sans fin (sa seule sortie : Simuler). LA FERMETURE SOLDE :
   fermerEcran() encaisse un combat fini non encaisse.
2. "JE CRIE ET C'EST TROP TARD, L'ACTION A CHANGE" — deux remedes :
   - TRANCHE 15 s (au lieu de 30) : le decalage moteur/lecture tombe de
     0-30 s a ~7 s en moyenne. Flux RNG inchange (banc 27 : les
     tranches reproduisent le temoin quel que soit le pas). References
     regenerees, le banc des frontieres ajuste (6-21 arrets).
   - LE CRI PATIENT : "trop tard" ne tue plus le cri — il ATTEND
     (jusqu'a la cloche) et s'applique au premier arret ou la situation
     correspond ("il garde ca en tete" -> "maintenant !"). Un seul cri
     en attente, expire au round.
3. "IL ME DEMANDE 10K POUR LE RE-SIGNER" : le palier des frais lisait
   le RANG SEUL — un top 10 d'Hexagone coutait comme un top 10 mondial.
   LE STANDING, C'EST LE RANG DANS SON MONDE : en nationale, classe =
   confirme (1 500), champion = 4 000 ; l'elite (10 000) est reservee
   aux rosters internationaux. Son cas : 10 000 -> 1 500.
Chaine : 26 bancs CONFORME.
EN ATTENTE : le "demarchage du patron" (capture demandee — l'evenement
n'existe nulle part dans le code sous cette forme).

## CAS 108 — LE RENOUVELLEMENT A CREDIT (Mael, 21/08)
"Toujours pas assez pour le re-signer, mais il etait avec moi — on
pourrait accepter une dette sur cette situation." OUI, et c'est
realiste : l'avocat facture, et la facture d'un client connu se paie
en retard. LA REGLE : le RENOUVELLEMENT d'un homme de la maison se
signe A CREDIT — la caisse plonge du montant, majore de 10 % (le
cabinet fait payer l'attente). JAMAIS pour une premiere signature (un
inconnu ne signe pas a credit). L'ecran le dit en toutes lettres
("Re-signer a credit", le montant majore, "la caisse plonge") et la
depeche raconte. Le garde caisse de signerSalle ne bloque plus QUE les
premieres signatures. Chaine : 26 bancs CONFORME.

## CAS 109 — LA PRESSE ECRITE (Mael, 21/08 : "il nous faut ca")
"De longs articles dans Media... qui prennent en compte mes derniers
resultats, ma serie, les gens mieux classes que moi, ce que ca
donnerait contre eux — avec une notif." CODE, ET TOUT EST ECRIT DEPUIS
LE REEL — le journaliste lit les memes chiffres que le moteur :
 - TROIS JALONS declenchent un article : L'ENTREE AU TOP 15 (son cas du
   jour), LA SERIE (3, 5, 7, 10 — une fois par palier), LE TITRE.
   Verifies chaque jour (laPresseRegarde apres l'avancee), une seule
   fois chacun (l.presse).
 - LE CONTENU : bilan et derniers resultats reels (l.vie.derniers), le
   classement VRAI de son organisation, et LES PROJECTIONS contre les
   2-3 hommes au-dessus — leur nom, leur rang, leur bilan, LEUR STYLE
   (classement() expose desormais l'archetype — la presse en a besoin)
   traduit en plan de combat ("un lutteur : il faudra l'amener au sol").
   La salle et le patron (noms du bapteme) sont dans l'article.
 - LA NOTIF : depeche "Un article est sorti sur X — va voir dans
   Media." L'ecran Media ouvre par LA PRESSE : liste titres + pastille
   non-lu, clic -> l'article entier en voile, mis en page.
EXTENSIONS NOTEES : le portrait du coach/de la salle (jalons de salle),
les articles d'avant-combat (fight week), la presse qui doute apres une
serie de defaites. Chaine : 26 bancs CONFORME.

## CAS 110 — LE RYTHME DU R1, LES 1000 NOMS, ET LE BANC INVERSE (21/08)
Quatre signalements de Mael, trois traites (le quatrieme attend sa
capture) :
1. "ROUND 1 : TOUT SE JOUE DANS LES 10 DERNIERES SECONDES (5 -> 30
   frappes)" + "MON CRI MET PLUS D'1 MIN A ARRIVER" — MEME CAUSE : la
   PREMIERE tranche etait lue avec la chronologie du traducteur (etalee
   sur les 300 s du round) ; retemporiser() n'arrivait qu'aux tranches
   suivantes -> lecture initiale interminable, puis compression de tout
   le reste en fin de round, et la reponse au cri attendait la fin.
   LE TEMPS MOTEUR EST LE MAITRE DES LE PREMIER INSTANT : retemporiser()
   au boot de l'ecran. Gabarit et direct CONFORMES.
2. "IL FAUT AU MOINS 1000 NOMS, J'AI DES DOUBLONS/TRIPLES" — les listes
   etaient a 24x24 (demo) et 20x20 par pays (monde) : triples garantis.
   ENRICHIES : 12 pays a 50 prenoms / 56 noms (600 / 672 monde) + les
   tables demo a 112 / 112 -> ~712 prenoms et ~784 noms distincts,
   des dizaines de milliers de combinaisons. PIEGE PAYE : le banc
   "aucun nom reel iconique" a attrape mes noms de vrais champions
   (Makhachev, Nurmagomedov, Chimaev, Zidane, Lewandowski...) — TOUS
   remplaces par des derives (Makhatov, Nurmagaev, Chimatov, Zidani,
   Lewandowicz...). Le garde-fou juridique fait son travail.
3. LE BANC verifier_offres AVAIT UNE ASSERTION INVERSEE, revelee par le
   nouveau monde (le changement de noms change les graines) : le design
   dit "mal vu = jete en pature TRES HAUT" mais le banc exigeait
   l'inverse — il passait PAR CHANCE DE GRAINE depuis le 10/08. LECON :
   un banc qui passe n'a pas forcement raison ; un changement de graine
   est un test de robustesse gratuit.
4. EN ATTENTE (capture demandee) : "mon combattant est appele A pendant
   le combat" — les jetons de preparerCombat, le gala et ficheDe sont
   sains ; il faut l'ecran exact pour situer la fuite.
Chaine : 26 bancs CONFORME.

## CAS 111 — LE MATERIEL, LE CONTROLE, LA CEINTURE — ET LE MYSTERE RESOLU (21/08)
Trois signalements de Mael + la resolution du "demarchage du patron" :
1. "MON MATERIEL A CASSE, 0 ETOILE, PLUS REPARABLE EN BOUTIQUE" :
   PALIERS[cle][0] etait null — le catalogue supposait qu'on ne descend
   jamais sous 1 etoile, la casse non reparee (faute de caisse sur le
   coup) le fait. L'INDEX 0 VEND LE RETOUR AU MATERIEL DE BASE (900 €,
   "le minimum digne") — a n'importe quel moment, pas seulement sur le
   coup de l'evenement.
2. "MON TEMPS DE CONTROLE DIMINUE PENDANT LE COMBAT (5:30 -> 4:30)" :
   DEUX HORLOGES pour un meme compteur — le tick temps-reel ET le
   recalcul par etapes (qui repart de zero sur une chronologie
   RETEMPORISEE, donc compressee : il rend moins). LE CONTROLE NE
   RECULE JAMAIS : le recalcul garde le max avec la valeur d'avant.
   L'ecran est indicatif, le verdict lit le moteur.
3. "J'AI BATTU LE CHAMPION ET CA M'A PAS DONNE LA BELT" : la timeline
   ECRIVAIT "Champion org" mais l'ETAT ne changeait jamais —
   l.champion restait faux, l'adversaire gardait le titre. LA CEINTURE
   SE TRANSMET desormais a l'encaissement (meme forme que le monde /
   cartes.js) : le perdant rend (fait grave chez lui), le vainqueur
   prend (champion, rang 1), synchroniserRangs, et la depeche 🏆. Le
   sens inverse aussi : mon champion qui perd un combat de titre rend
   la ceinture.
   /!\\ POUR SON CAS DEJA JOUE : la ceinture est perdue (l'etat n'a pas
   ete pose au moment du combat) — le prochain combat de titre la
   donnera. Pas de retro-patch de sauvegarde a l'aveugle.
4. LE MYSTERE DU "DEMARCHAGE DU PATRON" RESOLU EN CHEMIN : c'etait
   evtCoach ("une autre salle lui propose mieux") — depuis le cas 100,
   le tirage du meilleur coach pouvait cibler LE PATRON lui-meme, et
   lui demander une hausse de salaire... a lui-meme. ON NE SE DEBAUCHE
   PAS SOI-MEME : c.moi exclu du tirage.
Chaine : 26 bancs CONFORME.

## CAS 112 — LA PRESSE DE LA CEINTURE : LES QUATRE MOMENTS (Mael, 21/08)
"Il me faut un article avant le combat pour ceinture, apres si je la
prends ou la loupe, et si je suis champion quand je perds la belt."
QUATRE GABARITS, branches aux VRAIS moments (l'encaissement et la
programmation — plus le balayage quotidien pour le titre) :
 - AVANT (a la programmation d'un combat o.titre) : l'affiche — les
   deux noms, les bilans, le style du champion traduit en plan, la
   salle et le patron. Donnees de o.trace.
 - PRIS (encaissement, gagne) : l'article du sacre — redevient possible
   A CHAQUE regne (le jalon unique du balayage est retire, l'evenement
   fait foi).
 - LOUPE (encaissement, perdu sans etre champion) : "echoue aux portes
   du titre" — la marche etait haute, le classement tend encore la main.
 - PERDU (encaissement, le champion dechu) : "n'est plus champion" —
   personne ne garde une ceinture pour toujours, la revanche se
   construit des lundi.
ecrireArticle accepte un contexte (ctx : advNom, advBilan, advStyle).
Chaine : 26 bancs CONFORME.

## CAS 113 — LE SOLDE DIT TOUT : LOYER ET SPONSORS (Mael, 21/08)
"J'ai demenage mais je paie pas plus cher dans mes charges" + "j'ai
pris des sponsors, ca apparait pas." DEUX TROUS D'AFFICHAGE, ZERO trou
de moteur :
 - le LOYER etait hors solde annuel ("hors loyer" en libelle) : le
   demenagement debattait bien le nouveau loyer (l'echeance lit
   local().loyer) mais l'annuel de Gestion n'en montrait rien — un
   demenagement semblait gratuit a l'annee ;
 - les SPONSORS etaient VERSES chaque semaine (prorata, ligne 2434)
   mais AFFICHES nulle part — l'argent arrivait en silence.
DESORMAIS : la ligne Sponsors (+X €/an, quand il y en a), la ligne
LOYER ANNUEL (le local nomme, le mensuel en sous-titre, x13 periodes),
et le SOLDE ANNUEL "loyer et sponsors compris". L'ecran dit tout ce
que le moteur compte. Chaine : 26 bancs CONFORME.

## CAS 113 bis — "LOCAL" N'EST PAS "LOYER" (Mael, 22/08)
"Comment mes charges peuvent etre 347/semaine si mon loyer est 2100 ?"
Les comptes etaient justes (charges hebdo et loyer = deux debits
separes, les deux au solde) mais le sous-titre des Charges disait
"local, materiel, staff..." — le mot "local" laissait croire que le
loyer etait dedans, alors qu'il designe l'entretien/fluides
(capacite x 1,73 €/sem). Libelle leve : "entretien et fluides du
local... — hors loyer". Un mot ambigu est un ecran qui ment a moitie.
NOTE DE PARTIE : semaine 138, La Rafleuse en Vraie salle, solde annuel
+18 132 € — l'economie du cas 99 tient sa promesse : tendue au debut,
et elle decolle avec les bourses.

## CAS 114 — L'ELITE COUTE L'ELITE (Mael, 22/08)
"Les top coachs sont pas assez chers — j'ai juste un champion Hexagone
et je suis le roi du petrole." Le cas 99 avait divise TOUTE la courbe
par deux pour sauver le lancement — le haut etait devenu derisoire
(niveau 90 = 80 €/sem). L'ACCELERATION AU-DESSUS DE 70, aux trois
baremes concernes (marche competition, marche formateur a moitie,
retraite-coach) : rien ne bouge sous 70 (lancement intact — 45 = 62,
60 = 82, 70 = 93 €/sem), et l'elite redevient un choix de salle riche :
80 -> 249 €/sem (13k/an), 90 -> 674 €/sem (35k/an), 95 -> 902+ €/sem
(52k/an). Un champion HEX ne paie pas un coach de champion AFC — c'est
le POINT : la hierarchie des moyens suit la hierarchie du sport.
Chaine : 26 bancs CONFORME.

## CAS 114 bis — LES GROS COACHS SE VOIENT (Mael, 22/08)
"Meme les gros coachs devraient etre visibles dans la liste." Ils y
etaient (le marche genere 55-95 en competition, tout est affiche sans
slice) mais INDISCERNABLES : la competence est cachee (regle du jeu) et
avant l'acceleration elite, un 90 coutait comme un 60. Depuis le cas
114 le salaire trahit le calibre ; AJOUTE : le tri par salaire
decroissant — ce que le marche a de plus lourd s'affiche en tete de
liste, l'embauche par index reste correcte (tous.indexOf). Chaine : 26
bancs CONFORME.

## CAS 114 ter — L'ELITE A 30K (Mael, 22/08)
"On est pas assez cher, l'elite doit taper les 30k par an." Coefficient
d'acceleration 1,4 -> 2,3 (formateur 0,5 -> 0,8), calibre sur sa
consigne : 80 -> ~15k/an (tres bon), 85 -> ~30k/an (L'ELITE, sa barre),
90 -> ~50k/an (top mondial), 95 -> ~79k/an (la legende). Sous 70 :
toujours rien ne bouge. Chaine : 26 bancs CONFORME.

## CAS 114 quater — LE MARCHE TOURNE ET SE RETARIFE (Mael, 22/08)
"J'ai toujours pas de coach a 30k, le max 2k par an." DEUX defauts en
un, decouverts par sa partie longue :
1. LE STOCK ETAIT FIGE A VIE : le marche etait genere UNE fois (a la
   premiere lecture) et jamais renouvele — le sien datait des baremes
   d'avant les cas 99/114, aucun salaire recent ne pouvait y exister.
2. JAMAIS RETARIFE : le salaire etait pose a la generation et conserve.
LA LOI : salaireCoach(niveau, comp) — fonction UNIQUE utilisee par la
fabrication, le retraite-coach ET la retarification a chaque lecture
(le stock n'est qu'une liste d'hommes ; un contrat SIGNE ne bouge
jamais). LE RENOUVELLEMENT : tous les 120 jours le marche tourne
entierement, les anciens de la maison restent. Sa partie verra les
elites a 30k+ des l'ouverture du marche. Chaine : 26 bancs CONFORME.

## DOSSIER OUVERT — LA FEUILLE CROISEE (Mael, 22/08, capture, A REPRENDRE)
SYMPTOME (capture Garnier c. Dudarov, decision Dudarov, "trop bizarre
et je perds") : LES TOTAUX DU HAUT SONT INVERSES, LE DETAIL PAR ZONES
EST CORRECT. Preuves internes a la capture :
 - totaux affiches GARNIER : 130/428 sign. (30 %), 4/13 TD, 15 tent.
   soum., 2:02 controle — mais son DETAIL zones : ~1-2 frappes ;
 - totaux affiches DUDAROV : 0/0, 0 %, 0/0, 0 soum., 3:19 controle —
   mais son DETAIL : tete 2/6, corps 2/4, jambes 4/4, distance 8/14 ;
 - la coherence interne (le vrai actif = Dudarov -> il GAGNE ✓) dit
   que le verdict et le detail sont JUSTES, les totaux sont CROISES.
   Le controle du haut (2:02 / 3:19) semble lui aussi du bon cote —
   SEULS frappes/precision/TD/soumissions sont croises ?
CE QUI EST DEJA VERIFIE : jA/jB = r.fa.name/r.fb.name (jetons du
combat, ligne ~1393) passes a feuille(c.log,jA,jB) ✓ ; pas
d'homonymie ici (Garnier/Dudarov) ; le meme symptome que le cas des
homonymes du 10/08 ("200 coups a 1") SANS homonymes.
PISTES A INSTRUIRE (dans l'ordre) :
 1. js/feuille.js : les TOTAUX (sign/TD/soum) et les ZONES sont-ils
    ranges par la meme convention (cote(m[1]) partout) ? Chercher une
    section qui indexe par ORDRE D'APPARITION ou par position fixe.
 2. Le RENDU du gabarit (section LE COMBAT vs FRAPPES SIGNIFICATIVES) :
    lit-il totaux[0]=gauche partout, ou une des deux sections
    echange-t-elle A/B ?
 3. REPRODUIRE en node : feuille() sur un log de reference (le banc de
    feuille existe ?) avec un A passif et un B actif — verifier quel
    cote recoit les totaux.
 4. Ne pas oublier : "mon combattant est appele A" (capture toujours
    attendue) pourrait etre le MEME dossier (une attribution qui tombe
    en -1/defaut quelque part).
 5. NOTE : la reproduction naive echoue (log minimal invente ne matche
    aucune regex — tout a 0). REPRODUIRE AVEC UN VRAI LOG : rejouer un
    combat de reference_engine.json (105 combats disponibles) et passer
    son log a feuille() avec les deux jetons — comparer qui recoit
    les totaux vs qui a reellement frappe dans le log.

## DOSSIER FEUILLE CROISEE — L'INSTRUCTION AVANCE (22/08, session 2)
FAIT :
 - feuille() VERIFIEE SAINE sur un vrai log de reference (les deux
   cotes vivent, coherents avec le comptage manuel du log).
 - LE RECAP de l'ecran (section LE COMBAT) lit les compteurs LIVE
   (V.sigA/B, alimentes par e.st du traducteur — des DELTAS, reset a
   chaque emission ✓) ; le detail zones lit la feuille (saine). Le
   symptome = le LIVE n'a rien compte cote B.
 - LE BANC DU DIRECT ETENDU : 6 scenarios (graines 1/2/7/42/909/1337,
   cris sur 3), nouvelle assertion "les DEUX cotes comptent" — TOUT
   VERT. Le direct standard ne reproduit PAS.
RESTE A TRANCHER — LA QUESTION POSEE A MAEL : ce combat etait-il
regarde EN DIRECT (avec cris ?), SIMULE, ou REVU (rejouer) ? Les
chemins non couverts par le banc : le boot non-direct (revoir/simule),
le remplacant au pied leve, et le pli du raccord sur un TRES long
combat. L'hypothese des noms multi-jetons (name complet -> regex
m[2]=arme fausse) est exclue pour preparerCombat (jetons reassignes)
mais A VERIFIER sur le chemin galas/monde si sa reponse pointe la.
Chaine : 26 bancs CONFORME (avec le banc du direct durci).

## CAS 115 — DOSSIER FEUILLE CROISEE : CLOS (22/08, session 2)
L'instruction complete, menee au banc :
 - feuille() saine ✓ · direct sain (6 graines) ✓ · MIXTE direct+cris
   puis SIMULER (le flux exact de Mael) sain ✓ · grand format 5 rounds
   cris intensifs sain ✓ · REVOIR (boot d'un combat fini — chemin
   jamais teste avant) sain ✓. Le banc du direct passe de 3 a 12
   scenarios, avec l'assertion "les DEUX cotes comptent".
 - LA VRAIE TROUVAILLE, revelee par l'instruction : FEUILLE_MAJ etait
   appelee au protocole mais N'EXISTAIT NULLE PART — la feuille
   recalculee envoyee a chaque tranche etait JETEE. En direct, le
   detail des zones restait fige sur la feuille du BOOT (le R1
   partiel) : le "8/14" de sa capture etait le R1 seul.
 - LE FIX DEFINITIF (deux pieces) : 1) FEUILLE_MAJ existe, la feuille
   suit le direct ; 2) LE RECAP DE FIN LIT LA FEUILLE (la verite
   recalculee du log complet) — les compteurs vecus de la lecture ne
   servent plus qu'au bandeau du direct. L'ecran de fin dit ce que le
   moteur a calcule, quelles que soient les peripeties de la lecture.
 - PIEGE EVITE DE JUSTESSE : le kd de la feuille = INFLIGES par le
   cote (1-c credite le frappeur) — le premier mapping etait inverse,
   verifie sur le code avant livraison.
 - Les compteurs vecus de SA capture venaient tres probablement d'un
   combat joue avant les fixes de raccord du 21-22 ; le chemin est
   desormais double-blinde (live raccorde + recap-verite).
Chaine : 26 bancs CONFORME (le banc du direct x4 plus dur).

## CAS 116 — LA PRESSE COMPLETE : SEPT PLUMES DE PLUS (Mael, 22/08)
"Tous + tout changement signature d'orga + changement." SEPT nouveaux
types d'articles, chacun branche a son VRAI moment, tous ecrits depuis
le reel :
 - LE DOUTE : 2+ revers de suite (l.vie.derniers), une fois par
   spirale (l.presse.doute suit la profondeur, reset a la victoire).
   "La spirale : X a-t-il touche son plafond ?"
 - L'AFFICHE ORDINAIRE : combat non-titre avec un classe implique —
   les bilans, le style adverse en plan, l'enjeu de rang.
 - LE PORTRAIT DE SALLE, trois jalons : le PREMIER PRO (passerPro
   quand il est le seul), le DEMENAGEMENT (nouveaux murs), les DIX
   VICTOIRES de la maison (SALLE.victoires).
 - LA RETRO DU 1er JANVIER : au passage de l'an (laPresseRegarde), le
   bilan v-d de l'annee + les faits marquants accumules dans
   SALLE.annee (ceintures, signatures, demenagement). Videe apres.
 - LA RETRAITE D'UN HOMME DE LA MAISON : au raccrochage d'un MESGARS
   pro (les titres comptes depuis ses faits).
 - LA SIGNATURE D'ORGA et LE CHANGEMENT D'ORGA : dans demarcherOrga au
   succes — premiere maison ou etage suivant, l'ancien nomme.
 - LES PLUMES VARIENT : plume(...variantes) au Math.random (le flux
   alea() du jeu reste sacre) — titres et chutes tires, deux articles
   du meme type ne se ressemblent pas mot pour mot.
PIEGES PAYES EN CHEMIN : le crochet retraite d'abord tombe sur la
retraite DU MONDE (un article par retraite de la planete !) — deplace
sur MES gars ; ecrireArticle durci pour l=null (les articles de salle
n'ont pas de combattant) ; une coquille "defaute" attrapee au grep.
Chaine : 26 bancs CONFORME.

## CAS 117 — LA RELATION AVEC LES COACHS, ET LEURS VOIX (Mael, 22/08)
"Plus de relation avec mes coachs" + "il m'interpelle : ce jeune est un
genie du striking". La regle des combattants appliquee au staff —
L'ENTENTE EST UN RESIDU DES FAITS, jamais une jauge cliquable :
 - CE QUI CONSTRUIT : les annees de maison (lentement), LES SUCCES DE
   SES ELEVES (+5 victoire, +12 ceinture — sa victoire aussi), le cafe
   (+3, une fois/semaine — le 4e ne repare pas un salaire).
 - CE QUI RONGE : un salaire devenu tres sous-bareme (il CONNAIT le
   marche — salaireCoach est la reference), l'etalement force sur tous
   les groupes (>8 semaines), un collegue remercie (-3 au vestiaire).
 - LES CONSEQUENCES, toutes reelles :
   * un coach aigri fait des seances aigres : l'efficacite x0,85-1,03
     dans niveauStaff ;
   * L'OFFRE RIVALE : aime (78+), il te MONTRE le telephone en rigolant
     — rien a payer ; aigri (<25), il part SANS negocier, ses griefs en
     epitaphe ; entre les deux, la negociation d'avant ;
   * tres froid 8 semaines : il pose sa demission, avec ses raisons.
 - LE CAFE : son etat en MOTS (jamais de chiffre) + ses deux plus
   grosses raisons, tirees de ses griefs reels.
 - LES INTERPELLATIONS — les coachs parlent d'eux-memes, une fois par
   motif, une par semaine max :
   * LE GENIE : "ce petit X, c'est un genie du striking" — et c'est SON
     ESTIMATION, bruitee par SON niveau (un grand coach voit juste, un
     moyen s'emballe) — la regle fondatrice, en dialogue ;
   * LE CRAME de son groupe : "sors-le du tapis ou il va casser" ;
   * LE PRET POUR LES PROS : "il s'ennuie chez les amateurs".
 - La fiche staff porte l'etat en mots sous le nom.
Chaine : 26 bancs CONFORME.

## CAS 118 — LE PATRON VALORISE : MICRO, PLUME, ET LA PORTE QUI SONNE (22/08)
Trois demandes de Mael ("plus de gratitude pour mon perso") :
1. L'INTERVIEW DE FIGHT WEEK (le chantier grave du cas 106, enfin
   construit) : a J-4/J-1 d'un combat qui compte (titre, classe, orga
   au-dessus de nationale), la presse appelle LE PATRON. Trois tons,
   trois effets REELS et racontes :
   - PROVOC ("On vient pour le finir") -> notoriete du gars +2,5 ;
   - HUMBLE ("Il a fait tout le travail") -> defendu_publiquement (la
     VRAIE cle d'entente — "il te regarde autrement") ;
   - ESQUIVE ("On parlera dans la cage") -> le calme, aussi une
     strategie. Une interview par combat (o.itw).
2. LE PRO QUI FRAPPE A LA PORTE : reputation >= 55 -> des pros libres
   appellent (proba et QUALITE montent avec la reputation, ~5-15 %/sem,
   le mercredi). Il arrive par rejoindreLaSalle(groupe:"pro") — le flux
   existant — SANS contrat ni organisation : tout reste a construire.
   Identite des tables, bilan genere, bloquant accueillir/decliner.
3. LE PORTRAIT DU PATRON : deux jalons (25 victoires de salle, les 5
   ans) -> l'article sur LUI — ses annees, ses victoires, ses pros, ses
   ceintures au mur. "Recruteur, comptable, coin, psychologue — le
   metier n'a pas de fiche de poste. Il a des resultats."
Chaine : 26 bancs CONFORME.

## CAS 118 bis — DES VRAIS PROS, DES VRAIES ORGAS (Mael, 22/08)
"J'aimerais que ce soit des vrais pros des orgas qui viennent" — il a
raison : le standing, c'est le n°9 de Sokol qui sonne, pas un genere
libre. proQuiFrappe recrute desormais DANS m.pros : le candidat vient
avec SON bilan, SON rang, SON organisation — et son contrat d'orga le
suit. La fenetre de notoriete suit la reputation de la salle (55 ->
des soldats d'orga, 85+ -> des classes seri eux, jamais un champion).
L'ADOPTION (adopterProDuMonde) est propre par construction :
 - le monde exclut les hommes de salle par l.salle (cartes.js:477) —
   il garde son id POSITIF, son roster, son echelle, ses classements ;
 - sa fiche moteur est fabriquee et STOCKEE (fabriquerFicheSalle, cle
   jeton = nom de famille — le systeme de jetons du combat suit) ;
 - fiche d'affichage, entrainement (ajouter), entente de depart, vie ;
 - le contrat de SALLE reste a signer : le bloquant enchaine sur
   ouvrirContrat — "des pros qui viennent SIGNER direct chez moi".
TEST D'INTEGRATION node : un vrai pro AFC n°4 adopte -> ficheDe OK, le
jeton propre. Chaine : 26 bancs CONFORME.

## CAS 118 ter — LE CONTRAT ACTUEL DU PRO QUI FRAPPE (Mael, 22/08)
"Y a aussi son contrat actuel, combien il gagne ?" Le bloquant du pro
qui frappe affiche desormais SA BOURSE ACTUELLE (CL.bourse — org, rang,
champion, notoriete : le vrai calcul du monde) et les combats restants
a son contrat d'orga. Le joueur decide en connaissance : la part de
salle qu'il negociera s'appliquera a CES bourses-la. L'ecran dit ce que
le moteur paie. Chaine : 26 bancs CONFORME.

## CAS 118 quater — LE NaN DE LA BOURSE, ET LE NOM CLIQUABLE (Mael, 22/08)
Sa capture (Igor Szulc, "~NaN € la bourse") : TROIS causes en une —
1. CL.bourse : un rang AU-DELA de #15 donnait t negatif et
   pow(negatif, 1.4) = NaN. Borne : au-dela de #15, tarif d'entree.
2. La notoriete absente (undefined-50 = NaN). Bornee a 0.
3. MON usage : bourse() retourne [g,g] (un tableau) — Math.round sur le
   tableau = NaN meme pour un rang valide. Depaquete ([b]=...).
+ LE NOM CLIQUABLE (sa demande) : lienMonde(p.id, p.nom) dans le
bloquant — la fiche du pro s'ouvre avant de decider.
Chaine : 26 bancs CONFORME.

## CAS 119 — L'INTERVIEW COMPLETE : TROIS QUESTIONS AU MICRO (Mael, 22/08)
"Je veux qu'on gere les itw coach avant les combats." L'interview
mono-question du cas 118 devient une SEQUENCE de trois questions,
tirees du CONTEXTE REEL du combat :
 - Q1 selon la situation : le TITRE ("qu'est-ce que ca changerait ?"),
   la SERIE ("jusqu'ou ?"), la FRAICHEUR visible ("on le dit emousse —
   vrai ?" quand il est sous 70 : la presse SAIT), ou la preparation.
 - Q2 : l'adversaire, nomme — le trash, le respect, ou rien.
 - Q3 : le mot de la fin (le ton du cas 118).
CHAQUE reponse tape UN levier — la notoriete du gars (les punchlines,
cumulables x1,5), son entente (defendu_publiquement, une fois), la
reputation de la salle (le professionnalisme, +0,5) — ou rien
(l'esquive est aussi une strategie). LE SOLDE est applique et RACONTE
a la fin ("tes punchlines tournent · il te regarde autrement · la
presse salue la classe de la maison"). Une interview par combat.
Chaine : 26 bancs CONFORME.

## CAS 119 bis — QUARANTE-ET-UNE QUESTIONS AU MICRO (Mael, 22/08)
"Je veux au moins 40 questions differentes." SEPT POOLS, 41 questions,
123 repliques ecrites :
 - TITRE (4) · SERIE (4) · SPIRALE (3, nouvelle : 2+ revers — "on parle
   de fin de cycle") · FRAICHEUR (3) · PREPA (5) — la Q1 colle a la
   situation reelle du combat ;
 - ADVERSAIRE (9, l'adv nomme, son rang, son coin, son etat) et MAISON
   (5, la salle, le role du patron, les copies) — la Q2 tire 70/30 ;
 - LE MOT DE LA FIN (8, le public, l'avenir, la memoire, le dernier mot
   a l'adversaire).
Chaque replique tape son levier (noto/ent/rep/rien), le tirage au
Math.random (cosmetique — le flux alea() reste sacre), deux interviews
ne se ressemblent jamais. Chaine : 26 bancs CONFORME.

## CAS 120 — LES GABARITS PARESSEUX (Mael, 22/08, crash au demenagement)
"TypeError: Cannot read properties of null (reading 'nom')" au clic
Emmenager sur le dernier local. LA CAUSE, STRUCTURELLE : l'objet des
gabarits d'articles evaluait TOUS ses template literals a la
construction — pour un article de salle (l=null), le gabarit "titre"
evaluait quand meme l.nom. TOUS les articles de salle (demenagement,
retro, portraits, dix victoires) crashaient depuis le cas 116 — le
demenagement de Mael est le premier a l'avoir declenche.
DEUX FIXES :
1. LES GABARITS SONT PARESSEUX : chaque type est une FONCTION — seul le
   type demande s'evalue (14 types wrappes mecaniquement, verifies).
2. LA NOTIF gardee (elle lisait l.nom sans garde pour tous les
   articles — trouvee par le harnais, pas par la relecture).
LE HARNAIS DE TEST (node vm) : les 14 types d'articles s'ecrivent sans
crash, l=null compris — 14/14 OK, 14 articles produits. LECON : un
objet de gabarits n'est jamais gratuit — l'evaluation immediate des
template literals est un piege de construction, la paresse est la
regle pour les banques de textes.
Chaine : 26 bancs CONFORME.

## CAS 120 bis — L'INTERVIEW QUI N'ARRIVAIT JAMAIS (Mael, 22/08)
"J'ai toujours pas eu d'interview, c'est cense arriver quand ?" —
JAMAIS : le declencheur lisait o.jour, le champ reel est o.jourCombat.
jr valait NaN, la fenetre J-4/J-1 ne s'ouvrait pas. Repare (avec repli
o.jour par prudence). LECON RE-PAYEE : ne jamais supposer un nom de
champ — le grep coute 5 secondes, le champ fantome coute une feature
morte. Chaine : 26 bancs CONFORME.
QUAND ELLE ARRIVE, pour repondre a sa question : a J-4/J-1 d'un combat
de titre, d'un combat ou son gars est classe, ou d'un combat dans une
orga au-dessus de la nationale (TRI/SOK/GFL/AFC) — une fois par combat.

## CAS 120 ter — L'INTERVIEW : LE FLUX PROUVE, LA FENETRE ELARGIE (22/08)
"J'ai toujours pas eu" (apres le fix jourCombat). LE FLUX EST PROUVE
SAIN au banc vm : un cas conforme a J-2 declenche (o.itw pose, lancerItw
appele). Les causes restantes cote partie : jouer sur un apercu
anterieur a v151-4 (le fix date de la), ou une fenetre deja passee au
chargement. PAR ROBUSTESSE : la fenetre passe de J-4/J-1 a J-6/jour J
(media day) — ses journees sont chargees de bloquants, l'interview
attend son tour sans jamais rater le combat. Chaine : 26 bancs CONFORME.

## CAS 121 — L'EXPORT/IMPORT BLINDE : LE SOCLE SORTABLE (Mael, 22/08)
Le chantier 1 valide ("Ok le 1"). L'export/import EXISTAIT (fichier +
texte, boutons en Gestion — construit avant la tenue de ce carnet) mais
l'audit pour le rendre "sortable" a trouve quatre faiblesses, dont une
grave :
1. LE FILET DE RESTAURATION (la grave) : chargerEtat MUTE l'etat au fil
   de la lecture — un fichier corrompu a mi-chargement laissait la
   partie EN VRAC en memoire. Desormais l'etat courant est capture
   AVANT l'import ; a l'echec, il est restaure — "ta partie en cours
   est intacte". La garde de version (v!==1) verifie AVANT de toucher.
2. LE NOM DU FICHIER : "chaudron_jourN" (vieux nom mort) devient
   "<nom_de_salle>_semaineN.sauvegarde.json" — rangeable, parlant.
3. LA DATE DU DERNIER EXPORT visible en Gestion : "jamais exportee — un
   telephone perdu, et tout disparait" (rouge), puis "il y a N j"
   (rouge au-dela de 90 j : "pense a refaire une copie"). La copie
   texte marque aussi l'export.
4. Verification statique du round-trip (v:1 des deux cotes).
CE SOCLE EST LA BASE DU CLOUD GOOGLE PLAY GAMES (la serialisation
existante etatDuJeu/chargerEtat est saine : MESGARS sauves par id et
rehydrates du monde — l'identite survit). Chaine : 26 bancs CONFORME.

## CAS 121 bis — L'EXPORT SANS LE TEXTE (Mael, 22/08)
"C'est trop long le texte pour le sortir." L'ecran d'export affichait
la sauvegarde ENTIERE (2 Mo) dans un textarea — l'ecran mobile
s'ecrasait. DESORMAIS : le texte ne s'affiche JAMAIS — le fichier est
la voie royale, et "Copier au presse-papier" copie DIRECTEMENT
(navigator.clipboard, avec repli et message clair si le navigateur
refuse). L'ecran dit la taille et la semaine, deux boutons, rien
d'autre. Chaine : 26 bancs CONFORME.

## CAS 121 ter — LE BOUTON D'IMPORT ANDROID (Mael, 22/08)
"J'arrive pas a importer, le bouton est casse." Deux pieges Android :
accept=".json,application/json" GRISE les fichiers dans certains
selecteurs (l'extension .sauvegarde.json n'est pas mappee), et l'input
file natif a une zone cliquable minuscule. FIX : un vrai bouton
("Choisir le fichier...") declenche un input CACHE sans restriction de
type — le garde-fou est le parse (version v1 + filet de restauration
du cas 121). Le collage texte reste en secours. Chaine : 26 CONFORME.

## CAS 121 quater — LE PRESSE-PAPIER, VOIE ROYALE DE L'IMPORT (22/08)
"Y a pas de chemin a choisir le fichier." La visionneuse Android ignore
le .click() JS sur un input file (le picker exige un GESTE DIRECT) —
et certaines n'ont AUCUN selecteur. DEUX ARMES :
1. le LABEL natif style en bouton (le tap sur un label EST le geste
   direct lie a l'input) ;
2. "COLLER DEPUIS LE PRESSE-PAPIER" (clipboard.readText) : comme la
   copie d'export marche deja, copier -> coller = le cycle complet
   SANS fichier ni selecteur. Reponse claire a chaque refus du
   navigateur ("colle dans la zone de texte plus bas" — le textarea
   reste le dernier secours).
LE FILET UNIFIE : importerTexte() porte seul la capture/restauration —
fichier, presse-papier et collage passent par la meme verite.
Chaine : 26 bancs CONFORME.

## CAS 121 quinquies — LE CLIC REPOND TOUJOURS (Mael, 22/08)
"Ca fait toujours rien, le bouton." Trois durcissements :
1. Le toast part IMMEDIATEMENT au clic ("Lecture du presse-papier…") —
   si rien ne s'affiche, c'est le CLIC que la visionneuse mange, et on
   le SAIT (diagnostic par l'absence).
2. readText PEND sans erreur dans certaines WebViews : Promise.race a
   3 s, puis orientation claire vers le collage manuel.
3. Le collage manuel (textarea) est LA voie universelle : le guide
   l'affiche en gras ("appui long -> Coller -> Charger"), et son bouton
   passe par importerTexte (LE filet unique — il court-circuitait le
   filet de restauration).
Chaine : 26 bancs CONFORME.

## CAS 122 — ON N'ECRASE PLUS UNE VIE PAR ACCIDENT (Mael, 22/08)
"Je viens de faire une nouvelle partie sans faire expres et j'ai perdu
l'ancienne." SA PARTIE N'EST PAS PERDUE : il avait telecharge le
fichier d'export (le cas 121 a fait son travail) — le chemin de
recuperation : ouvrir l'apercu DANS CHROME (pas la visionneuse) ->
Importer -> Choisir le fichier. TROIS protections pour que ca ne se
reproduise jamais :
1. LE GARDE : demarrer une nouvelle partie sur une partie existante
   exige une confirmation FORTE qui dit le jour, la taille, et ce qui
   sera perdu.
2. LE COFFRE DE SECOURS : la partie sortante est COPIEE
   (mma_sauve_precedente, via le coffre existant) avant l'ecrasement —
   une generation de retenue automatique.
3. LE BOUTON DE REPRISE : "Reprendre l'ancienne partie" sur l'ecran
   d'accueil — lit le secours et passe par importerTexte (le filet).
LECON DE CONCEPTION : une seule cle de sauvegarde = une catastrophe en
attente ; le geste destructif le plus dangereux du jeu n'avait AUCUN
garde. Chaine : 26 bancs CONFORME.

## CAS 122 — LA CATASTROPHE, LE TOAST MENTEUR, LA SALLE DES COFFRES (22/08)
LA CATASTROPHE : Mael a lance une nouvelle partie par accident — et son
export "telecharge" N'ETAIT JAMAIS ARRIVE : la visionneuse Android
avale les downloads blob EN SILENCE, et MON toast affirmait "Fichier
telecharge" sans preuve. LE TOAST VIOLAIT LA REGLE DE LA MAISON (ne
jamais dire ce que le moteur n'a pas fait) — grave lecon : elle vaut
pour l'OS aussi, pas seulement pour le moteur du jeu.
LES REPARATIONS :
1. LE TOAST NE MENT PLUS : "Telechargement demande — VERIFIE dans tes
   fichiers. Sinon : copie + colle-la dans une note."
2. LE GARDE de nouvelle partie (cas en cours) : confirmation forte qui
   dit le jour et le poids de la partie existante + COPIE AUTOMATIQUE
   dans le coffre de secours (mma_sauve_precedente) avant d'ecraser.
3. LA SALLE DES COFFRES ("Recuperation" en Gestion) : fouille TOUS les
   recoins — le coffre courant, le coffre de secours, le localStorage
   d'avant la migration — montre chaque trouvaille (jour + poids) et la
   charge par LE filet (importerTexte).
L'ESPOIR POUR SA PARTIE : l'autosauvegarde n'ecrit qu'au premier
continuer() — s'il n'a pas joue de journee dans la partie accidentelle,
le coffre porte ENCORE la semaine 202. Consigne donnee : ne plus rien
toucher, rouvrir, Reprendre.
Chaine : 26 bancs CONFORME.

## CAS 122 bis — LA VIEILLE METHODE D'ABORD (Mael, 22/08)
"Tous tes trucs sont obsoletes" — il a raison, et l'ironie est totale :
sa visionneuse bloque TOUTES les APIs modernes (download blob, input
file, clipboard read/write)... et la SEULE voie qui marche est la
VIEILLE — execCommand('copy') sur un textarea temporaire, supprimee
par MOI au v152-2 en retirant le textarea. REMISE EN PREMIERE LIGNE :
textarea cache hors ecran, select + execCommand, puis le clipboard
moderne en repli seulement. Le message pousse a coller dans une note
MAINTENANT, et nomme la vraie porte de sortie : OUVRIR L'APERCU DANS
CHROME (Fichiers -> Ouvrir avec), ou tout marche.
LECON : dans une WebView inconnue, l'API deprecated est souvent la
seule fiable — la modernite n'est pas une vertu, la COMPATIBILITE en
est une. Chaine : 26 bancs CONFORME.

## CAS 122 ter — LA COMPRESSION : 5 Mo -> ~500 Ko (22/08)
Sa capture disait TOUT : le jeu affichait "Sauvegarde copiee (5126 Ko)"
et l'OS Android repondait "Echec de la copie" — LA LIMITE DU
PRESSE-PAPIER (~1 Mo) refusait, apres que execCommand ait retourne
true (lui aussi ment). ET 5 126 Ko au jour 150 : la sauvegarde ENFLE —
mesure : m.pros pese 6,3 Mo dont ~2,4 Ko PAR PRO en p.vie (les
empreintes, x4500 hommes ; la coupe a 5 existante aide mais ne suffit
plus).
LA SOLUTION : LZW embarque (60 lignes) sur octets UTF-8
(unescape/encodeURIComponent — les vieilles APIs, fiables partout,
gerent les noms polonais du cas 110). RATIO MESURE x10,4, 261 ms
compress / 34 ms decompress sur 1,1 Mo. ARCHITECTURE :
 - la COPIE presse-papier envoie "MMALZ1|"+lzC(json) -> ~500 Ko, sous
   la limite Android ;
 - importerTexte detecte le prefixe et decompresse (le filet garde) ;
 - le FICHIER telecharge reste en JSON brut (lisible, robuste) ;
 - le coffre IndexedDB inchange (pas de limite pertinente).
Round-trip prouve DE BOUT EN BOUT sur le code embarque du demo
(vm : 452 Ko -> 20 Ko, IDENTIQUE). Chaine : 26 bancs CONFORME.
PENDING : degonfler p.vie a la source (les empreintes elles-memes) —
un chantier de fond a instruire avec les besoins reels du matchmaking.

## CAS 122 quater — LA MAIN PEUT (Mael, 22/08)
Sa capture prouve : select() SURLIGNE (la selection marche) mais
execCommand ET clipboard sont bloques par la visionneuse — la copie
JS est morte, TOUTES voies. LE DERNIER REPLI : le COPIER NATIF Android
(la bulle sur une selection) n'est pas du JavaScript — la visionneuse
ne peut pas le bloquer. copieManuelle() affiche le texte COMPRESSE
(~500 Ko au lieu de 5 Mo — grace au cas 122 ter, la selection est
maniable), PRE-SELECTIONNE, avec la consigne d'appuyer sur Copier dans
la bulle + un bouton "Tout reselectionner". La machine ne peut pas —
la main peut. Chaine : 26 bancs CONFORME.

## CAS 122 quinquies — LE PARTAGE, LES MORCEAUX, LE BASE64 (22/08)
"Echec" — meme la bulle Android a plie (la limite du presse-papier
vaut aussi pour la main sur 500 Ko). TROIS armes de plus :
1. LA FEUILLE DE PARTAGE (navigator.share) : l'INTENT ANDROID — la
   visionneuse DELEGUE au systeme, elle ne peut pas l'avaler. Le
   FICHIER d'abord (canShare files -> Drive/Fichiers, pas de limite),
   le texte compresse sinon.
2. LA COPIE EN MORCEAUX (~150 Ko chacun, numerotes, navigation
   precedent/suivant) : chaque morceau se selectionne et se colle dans
   la MEME note a la suite ; l'import recolle et nettoie.
3. LA SORTIE EN BASE64 — piege evite DE JUSTESSE : les codes LZW bruts
   contiennent des caracteres d'espace legitimes (32, 10, 13) que le
   nettoyage du recollage aurait DETRUITS. base64 (btoa — vieille API,
   donc fiable) = alphabet sans espace : le nettoyage est sur a 100 %.
   ROUND-TRIP PROUVE avec recollage sale simule (espaces et retours
   inseres puis nettoyes) : IDENTIQUE. Ratio final x16 sur le contenu
   repetitif teste.
Chaine : 26 bancs CONFORME.

## CAS 122 sexies — LE DIAGNOSTIC FINAL : LA SANDBOX CLAUDE (22/08)
"Le partage systeme est absent ici" — navigator.share N'EXISTE PAS. Le
verdict complet : la visionneuse de L'APP CLAUDE est une sandbox de
securite TOTALE — download ✗, file picker ✗, clipboard read/write ✗,
execCommand ✗, share ✗. Aucune API de sortie ne marchera jamais : c'est
son design, pas un bug. LE SEUL PONT : la selection native + bulle
Android sur de PETITS morceaux — reduits a 80 Ko (b64 -> ~160 Ko UTF-16
par morceau, loin sous la limite du presse-papier), mode d'emploi en 5
etapes dans l'ecran. LE PLAN D'EVASION donne a Mael : sortir la partie
par les morceaux vers Keep, ouvrir l'apercu dans Chrome (Mes fichiers >
Telechargements > Ouvrir avec), y coller les morceaux dans Importer, et
NE PLUS JAMAIS jouer dans la visionneuse. Pour la sortie Play Store :
aucun de ces problemes n'existe (l'app aura ses APIs).
Chaine : 26 bancs CONFORME.

## CAS 122 — CLOTURE DU FEUILLETON SAUVEGARDE (22/08, soir)
"Bon j'ai envoye sur PC et la je peux save." L'EVASION A REUSSI : la
partie est passee de la sandbox Claude vers un vrai navigateur (PC),
ou tout l'arsenal fonctionne. BILAN DU FEUILLETON (une journee, huit
versions v152 -> v153-4) :
 - PERDU : la partie semaine 202 (le toast menteur + la sandbox).
 - CONSTRUIT, et pour toujours dans le jeu : le filet de restauration
   d'import, le garde de nouvelle partie + coffre de secours, la salle
   des coffres (recuperation multi-recoins), la compression LZW x10-16
   en base64, la copie en morceaux, le partage systeme, les toasts qui
   ne certifient plus rien sans preuve, et la date du dernier export
   qui surveille.
 - LES LECONS GRAVEES : l'ecran ne ment jamais (meme les toasts) ; la
   vieille API bat la moderne en terrain inconnu ; l'alphabet de
   transport doit etre sur (base64) ; et une sandbox n'est pas un bug —
   c'est un mur, on ne le perce pas, on le contourne.
Le joueur du Play Store ne vivra jamais ca — grace a la semaine 202 de
Mael. REPRISE DES CHANTIERS DE JEU a la prochaine session : l'endgame
(mur des legendes, objectifs longs, rivalites), le dialogue
d'entre-rounds, les demandes de coach, le marquage des contrats echus.

## CAS 123 — LE MODE PC : LA COLONNE DE TELEPHONE (Mael, 22/08)
"Pas super opti sur PC mais ca va." Le jeu reste mobile-first — sur
grand ecran (>=700px), il se cadre en colonne de 480px centree, ombre
d'appareil, fond sombre autour. Les elements FIXES (#onglets, #voile,
#surcouche, #scene) se calent sur la colonne et non plus sur l'ecran
entier (le piege du position:fixed). CSS pur, zero ecran touche, le
mobile inchange. Chaine : 26 bancs CONFORME.

===========================================================================
SEANCE DU 25/08 — LA REPRISE DES CHANTIERS DE JEU
(la liste laissee par la cloture du feuilleton sauvegarde, cas 122 : l'endgame,
le dialogue d'entre-rounds, les demandes de coach, le marquage des contrats)
===========================================================================

## BANC 27 — LE SINGE, RENDU PERMANENT (a lire en premier)
Le singe du cas 31 avait tourne UNE fois, dans une conversation, puis
disparu. Tous les defauts de la classe « ca ne leve pas, ca ne fait
simplement RIEN » sont revenus ensuite — pour une raison simple et
jamais dite : AUCUN DES 26 BANCS NE CHARGEAIT demo_jeu.html. Le moteur
etait tenu au caractere pres, la PARTIE ne l'etait pas.
 - js/bac_partie.js monte un DOM minimal (celui du banc 26, elargi),
   charge le bundle + le gabarit, puis execute le script de demo_jeu.html
   dedans. On recupere le contexte : toutes les fonctions du jeu,
   appelables comme un onclick.
 - js/verifier_partie.js JOUE : il avance les jours, tranche les
   blocages, repond aux offres et aux demandes, signe les contrats,
   passe des amateurs pro, demarche, ouvre les sept onglets, les fiches,
   les contrats, les camps. Trois parties, 560 jours, ZERO exception.
 - /!\ REPRODUCTIBLE, ET CA A COUTE DEUX PASSES. Math.random seme ne
   suffisait pas : graineDuMonde() tire `Date.now() ^ Math.random()`.
   Deux passages du banc construisaient DEUX MONDES et un echec ne se
   rejouait jamais. Le bac fige aussi l'horloge murale. Le vrai Math et
   le vrai Date ne sont pas touches.
 - CE QU'IL NE VOIT PAS : les pixels. Une couleur, un debordement, un
   bouton illisible — ca reste le terrain de Mael. Ce qu'il voit : ce qui
   LEVE, ce qui ne FAIT RIEN, ce qui DIVERGE entre deux vues.
 - DEUX CORRECTIONS PAYEES PAR LUI, COTE BANC (consignees parce que la
   prochaine seance les repaiera sinon) :
   1. RESULTATS ne porte que les combats PRO du joueur : en partie neuve
      la salle vit d'abord de galas amateurs. Le banc criait au feu sur
      un jeu qui marchait. On compte les bilans, pas les cartes.
   2. LE SINGE N'APPUIE QUE SUR LES BOUTONS QUE L'ECRAN OFFRE. Il
      proposait un marche sur TOUTE demande, y compris celles que
      montrerDemande() declare non negociables — demandes.js jette, a
      juste titre. Un singe qui invente des boutons mesure son invention.

## MARQUAGE DES CONTRATS ECHUS (chantier de la liste — FAIT)
Le contrat echu forcait deja une decision (cas 98), mais RIEN NE SE
VOYAIT AVANT qu'elle tombe, et un pro sans contrat de salle se promenait
dans l'effectif sans que rien ne le distingue.
 - marqueContrat(cle) rend un des quatre etats — sans contrat / N
   combats / dernier combat / contrat echu — et dit lequel demande une
   decision. La lecture passe par contrats.js (contratSalle, salleEchue) :
   AUCUNE deuxieme source, la lecon du 09/08.
 - Il se voit dans la liste des pros, dans l'effectif, et sur la fiche
   (avec le bouton qui mene a la signature).
 - /!\ ON NE MARQUE QUE CE QUI DEMANDE UNE DECISION : une liste ou tout
   est marque ne marque plus rien. La puce de filtre « Contrats »
   n'apparait que s'il y a quelque chose a signer, et se REFERME toute
   seule quand il n'y a plus rien — un filtre vide est un piege.
 - Le fil previent UN COMBAT A L'AVANCE (restants==1), au lieu de ne
   parler qu'une fois l'accord mort.
Banc 27 le verifie sur la partie DEMO, et c'est voulu : en partie neuve
un pro n'apparait qu'apres des mois de gestion — un banc qui en depend
mesurerait l'economie de lancement, pas le marquage.

## LE DIALOGUE D'ENTRE-ROUNDS (chantier grave au cas 104 §3 — FAIT)
« Au coin, le combattant dit SON RESSENTI avant les consignes », avec la
condition posee dans la meme phrase : LE RESSENTI DOIT VENIR DU MOTEUR,
PAS D'UNE BANQUE DE PHRASES HORS-SOL. Module js/ressenti.js, banc 28.
LES QUATRE REGLES, et chacune est verifiee :
 1. CHAQUE PHRASE A UN FAIT DERRIERE — head_damage, cardio,
    body.degats_corps, legs, sonne, knockdowns, le bilan du round. Le
    banc abime UN champ et verifie que la phrase change ; il verifie
    aussi qu'un homme intact n'invente rien.
 2. IL PARLE, IL NE RAPPORTE PAS — aucun chiffre ne sort du module.
 3. /!\ CE QU'IL DIT EST SON AVIS, PAS LA VERITE. La regle fondatrice du
    jeu (celle des estimations de coach) appliquee au combattant : un
    fight_iq haut nomme le vrai probleme ; un homme qui ne se lit pas dit
    « ça va » — et un homme SONNE n'est jamais lucide. En face, LES
    SIGNES : ce que le coin VOIT sur le corps, jamais bruite. Les deux
    voix peuvent se contredire, et on ne tranche pas a la place du
    joueur : c'est le sel du coin.
 4. AUCUN TIRAGE. /!\ La condition de coin.js — le coin vit entre deux
    rounds, et le hasard est GLOBAL : une seule ligne d'alea ici
    decalerait le flux. La part subjective se DERIVE de l'etat (jeton
    FNV sur nom+round+degats), elle ne se tire pas. Le banc le prouve
    deux fois : le compteur du Mersenne ne bouge pas, et un combat joue
    en lisant le ressenti a chaque cloche produit EXACTEMENT le meme log
    qu'un combat joue sans le lire.
LES SEUILS SONT MESURES, PAS DEVINES. Releve sur 80 combats en 5 rounds,
etat lu A LA CLOCHE (donc apres recuperation — ce que le coin voit) :
    tete    p25  38 · med 121 · p75 276 · p90 498
    cardio  p25  15 · med  52 · p75  80
    corps   p25   3 · med  11 · p75  31 · p90  69
    jambes  p25   0 · med   3 · p75   9 · p90  42
« entame » se pose ou la moitie des hommes sont passes, « casse » ou il
n'en reste qu'un sur dix. Des seuils au doigt mouille auraient fait
parler tout le monde pareil.
CE QU'IL DEMANDE MENE AUX CONSIGNES, IL N'EN INVENTE PAS : sa demande
pre-coche UN des boutons deja la (plan / allure / cible / sol) — le banc
verifie qu'aucun levier inconnu ne sort jamais, et que le bouton change
vraiment l'ordre envoye a coin.js.
/!\ IL NE PARLE PLUS DU ROUND D'AVANT : reprendre() efface le ressenti.
Sans ca la cloche suivante rouvrait le coin sur une phrase perimee tant
que le jeu n'en avait pas renvoye une — l'ecran aurait menti d'un round.

## LES DEMANDES DU STAFF (chantier de la liste — FAIT)
Le cas 117 a donne une VOIX aux coachs : ils interpellent, ils disent ce
qu'ils voient. Il leur manquait de pouvoir RECLAMER, et que ton oui ou
ton non coute. Un coach qui parle sans jamais rien demander n'est pas un
collegue, c'est un decor. Module js/demandes_staff.js, banc 29.
DIX DEMANDES, QUATRE FAMILLES, chacune sortie de SA situation :
  argent  — etre paye au tarif (il connait le bareme) · sa part du titre
  charge  — un seul groupe · un seul axe · du renfort
  salle   — du materiel · la salle est trop petite
  hommes  — prendre un gars sous son aile · menager un crame · le coin
/!\ LE BAREME NE SE RECALCULE PAS DANS LE MODULE. Premiere version : il
reecrivait la formule de salaireCoach « pour rester pur ». C'est la
DEUXIEME SOURCE que le carnet chasse depuis le 09/08 — la formule a deja
bouge trois fois (cas 99, 114, 114 ter). Le bareme ARRIVE PAR LE
CONTEXTE ; sans lui, la demande d'augmentation ne sort pas, point.
/!\ CHAQUE EFFET EST REEL, ET LE BANC LE MESURE UN PAR UN : le salaire
monte, la caisse baisse, le groupe change, l'axe se reduit, l'etoile de
materiel s'achete, le crame passe en menage, le poulain progresse plus
vite SUR L'AXE DE SON COACH (et moins ailleurs — le temps ne se
dedouble pas), et le second au coin vaut UN CRI DE PLUS PAR ROUND
(le budget de cris etait un 3 ecrit en dur dans le gabarit : il est
devenu une donnee, sans toucher au moteur).
/!\ UN OUI QUI NE PEUT RIEN FAIRE N'ACHETE RIEN, et c'est meme PIRE
qu'un non : caisse vide sur une prime, materiel deja a 3 etoiles —
l'entente BAISSE. « Il a entendu oui, et rien n'a bouge. »
/!\ « PLUS TARD » EST UNE PROMESSE DATEE, pas un compromis mou : condition
et echeance sont des DONNEES (regle des demandes de combattants). A
l'echeance, tenue ou pas, il s'en souvient — non tenue coute PLUS que le
non d'origine. Sinon « plus tard » serait la reponse gratuite a tout.
Un seul demandeur a la fois dans toute la salle, 35 jours de delai par
coach, et une demande refusee est retenue : les onze demandes en attente
du 09/08 ne se reproduiront pas.

## /!\ TROIS DEFAUTS TROUVES PAR LES NOUVEAUX BANCS (et pas en jouant)
1. MMA.ressenti N'EXISTAIT PAS. Le module etait ecrit, teste (banc 28),
   branche dans demo_jeu.html — mais LA FACADE DU BUNDLER EST UNE LISTE
   ECRITE A LA MAIN, et le nouveau module n'y etait pas. En jeu, ca ne
   levait meme pas : le try/catch avalait, et le coin restait muet. Le
   banc 28 ne pouvait pas le voir (il teste le module et l'ecran, pas le
   chemin du JEU). Le banc 27 le voit — il joue un round en direct et
   exige qu'il en sorte quelque chose.
   => AJOUTER UN MODULE, C'EST DEUX ENDROITS DANS bundler.js : RACINES
      *ET* la facade MMA. Une seule des deux ne fait rien, en silence.
2. statutPro PLANTAIT DES QU'OKONKWO COMBATTAIT LE MONDE. Vestige de la
   demo scriptee : `lien(COMBAT1.b)` suppose une CLE DE FICHE (chaine).
   Contre le monde, COMBAT1.b est un NOMBRE — `id.replace` levait, et
   TOUT L'ONGLET SALLE mourait avec : plus de rendu, la partie paraissait
   figee. Une seule porte desormais, lienCombat(r), qui aiguille vers
   lienMonde. Jamais vu en jouant parce que la demo se joue rarement
   au-dela du combat scripte.
3. LE VERROU SANS CLEF SE SIGNALE. La sortie des blocages vit maintenant
   dans bac_partie.js (main partagee) : un blocage qu'aucune sortie ne
   traite rend "SANS_ISSUE" et le banc le compte comme une erreur — le
   cas 22 ne pourra plus revenir en silence. La premiere version du banc
   29 avait recopie cette main en oubliant la visite : 192 exceptions,
   et l'echec accusait le jeu. Une main, pas deux.

## L'ENDGAME (dernier chantier de la liste — FAIT)
Le jeu savait faire une semaine, une saison, une carriere. Il ne savait pas
faire UNE VIE DE SALLE : au bout de cinq ans plus rien ne montait, les
hommes partaient a la retraite et disparaissaient, et deux combats contre
le meme homme etaient deux combats sans histoire. Module js/endgame.js,
banc 30, ecran « Le mur & les objectifs » depuis l'onglet Salle.

LE MUR DES LEGENDES — trois rangs, et des FAITS DE CARRIERE, pas des notes :
  legende  une ceinture, ou 15 victoires avec un top 5 ;
  pilier   8 victoires, OU 5 ans ET 5 victoires ;
  maison   3 ans et 3 victoires.
/!\ RENDRE null EST LE CAS NORMAL. Un mur ou tout le monde est accroche ne
dit rien — meme regle que le marquage des contrats. La plaque porte UNE
phrase, tiree de ce qui domine vraiment sa carriere (les regnes, les
finitions, les annees), jamais un compliment generique.
/!\ LA DUREE SEULE NE FAIT PAS UN PILIER (corrige au banc) : la premiere
version accrochait « pilier » a tout homme reste cinq ans, meme a 1-9.
/!\ IL A FALLU CREER l.arriveLe : « cinq ans de maison » n'etait pas
calculable, la date d'arrivee n'existait nulle part. Et l.meilleurRang :
l.rang est le rang DU JOUR, un ancien n°3 redescendu n'avait plus aucune
trace de son sommet.
Le poids du mur PLAFONNE a 12 : une salle ne vit pas de ses morts.

LES OBJECTIFS LONGS — douze, trois etages (la salle · le sport · l'heritage).
/!\ AUCUN COMPTEUR. Chaque objectif se LIT dans l'etat du jeu au moment ou
on regarde. Sur un objectif de dix ans, un compteur qui derive d'un point
ne se repare plus jamais — et c'est la plaie du 09/08 en pire. Le banc
change UN champ de l'etat et verifie que l'objectif suit.
/!\ ATTEINT RESTE ATTEINT : on compare a la liste des annonces DEJA faites,
pas a l'etat. Un champion qui perd sa ceinture ne « deverrouille » pas
l'objectif, et il ne se re-annonce pas non plus.
La recompense passe par bougerReputation (donc par une depeche) — meme
piege que le gala amateur : sans le canal officiel, la salle perdrait de la
reputation « faute d'actualite » le jour meme d'un jalon.

LES RIVALITES — /!\ ELLES NAISSENT D'UN FAIT, JAMAIS D'UN TIRAGE.
Avant, le contexte des demandes disait `rival: notoriete >= 15`, ce qui
veut dire « il est connu », pas « ils se detestent » : la demande « Trouve-
le-moi » se declenchait donc contre PERSONNE en particulier. Sept causes,
toutes reelles : defaite, revanche (2e defaite contre le meme), ceinture
perdue, decision volee, trash talk, victoire (l'autre veut sa revanche),
depart chez une salle rivale.
/!\ ELLE REFROIDIT — 100 points en deux ans. Sans ca, au bout de dix ans
tout le monde est rival de tout le monde et le mot ne veut plus rien dire.
Vivante au-dessus de 25 ; en dessous c'est un souvenir. Des mots seuls (18)
ne font PAS une rivalite : il faut qu'il se soit passe quelque chose dans
la cage.
/!\ ELLE NE TOUCHE PAS AU MOTEUR — on ne truque pas un combat parce qu'il y
a une histoire. Elle agit AUTOUR : la bourse de l'offre (x1 a x1,45), ce
que la presse en fait (x1 a x1,8), et ce que la victoire pese entre lui et
toi. Le banc mesure la bourse avec et sans, a graine identique.

## /!\ LA PARTIE LONGUE — CE QUE DIX ANS ONT APPRIS
1. LE BAC NE RESPIRAIT PAS, et ca ressemblait a une fuite du jeu. Un banc
   qui pilote la partie en boucle SYNCHRONE ne rend jamais la main a la
   file de microtaches : sauvegarder() empilait une chaine de promesses par
   jour, chacune retenant l'etat serialise (2 a 4 Mo). MESURE : 848 Mo de
   tas au jour 200, 2 Go au jour 400, puis node meurt. LE JEU, LUI, EST
   PROPRE : autosauvegarde coupee, 19 Mo au jour 200 et 24 Mo au jour 600.
   Correction : vm.createContext(..., {microtaskMode:"afterEvaluate"}).
   => AVANT DE CRIER A LA FUITE, COUPER CE QUE LE BANC AJOUTE.
2. LA TAILLE DE LA SAUVEGARDE, MESUREE (partie neuve, singe) :
       jour  200 : 2,7 Mo   jour  600 : 4,6 Mo   jour 1200 : 7,3 Mo
   dont 98 % dans MONDE.pros — 4 800 hommes, leur fiche et leurs cinq
   dernieres empreintes. Ca ne se degonfle pas : c'est le monde.
   CONSEQUENCE, ET C'EST LE CAS 122 EN PLUS DISCRET : le secours
   localStorage (5 Mo, donc ~2,5 M de caracteres UTF-16) etait DEJA mort
   passe le jour ~150, en silence. Sur une partie de dix ans, il n'a jamais
   existe.
3. /!\ ET LA COMPRESSION N'EST PAS LA REPONSE PARTOUT. MESURE :
       jour 600 : 4 563 Ko -> 1 294 Ko, mais 1,2 s de calcul (sur PC).
   Une seconde et demie a CHAQUE « Continuer », sur telephone, serait le
   pire defaut jamais introduit dans cette boucle. DEUX VERSIONS FAUSSES
   ecrites avant la bonne, consignees pour ne pas les refaire :
     - compresser le coffre a chaque sauvegarde : le coffre a le quota, il
       avale le brut, et on paierait 1,2 s pour rien ;
     - compresser le secours a chaque sauvegarde : des que le coffre est
       indisponible (navigation privee, certains webviews Android), c'est
       1,2 s par journee. Le remede pire que le mal.
   LA BONNE : on ecrit le BRUT, et on ne paie la compression QUE si le
   quota a vraiment parle. Le banc 27 le prouve dans les deux sens — avec
   un stockage a quota qui refuse, et un qui accepte.
   Toutes les lectures acceptent les deux formats (prefixe MMALZ1|) : une
   sauvegarde ecrite avant aujourd'hui se recharge sans rien savoir de ca.
   Et la compression n'est JAMAIS utilisee a l'aveugle : la premiere de la
   session est relue avant d'etre acceptee ; si l'aller-retour ne rend pas
   exactement la meme chaine, la partie ne compresse plus jamais.

## LA PASSE ECRAN — CE QUE LES BANCS NE VOIENT PAS (25/08)
Le banc 27 ne voit pas les pixels, et il l'annonce. La page a donc ete
ouverte pour de vrai (Chromium, 420 px, `apercu.html#demo`, douze journees
jouees, zero erreur console) et REGARDEE. Trois defauts d'ecran, tous
invisibles au banc :
1. LA PASTILLE DE CONTRAT EN COLONNE VOLAIT LA LARGEUR DU NOM. Une ligne
   d'effectif porte deja sept choses sur 420 px ; la huitieme faisait
   tomber "Lutteur qui developpe son striking" sur six lignes ecrasees.
   La marque est passee EN TETE DE LA LIGNE DU DESSOUS, qui se tronque
   proprement — et elle passe en tete PARCE QUE c'est elle qui appelle une
   decision : ce qui compte ne doit jamais etre ce qui se fait couper.
2. `.ef-nom{min-width:0}` faisait du nom le SEUL a ceder dans le flex.
   "Okonkwo" touchait "27 a.". Le nom garde maintenant 112 px ; c'est la
   barre de progression — decorative, le chiffre la suit — qui cede.
3. "en forme" tombait sur deux lignes une ligne sur deux : la liste
   devenait un escalier. white-space:nowrap sur le mot de fraicheur.
Et la jauge des objectifs a recu un RAIL : sans lui, un objectif a 0 %
s'affichait comme un trait perdu au milieu de la ligne, illisible.

## ETAT A LA FIN DE LA SEANCE DU 25/08
CHAINE : 30 BANCS CONFORME (26 d'avant + 27 le singe, 28 le ressenti,
29 les demandes du staff, 30 l'endgame).
LES QUATRE CHANTIERS DE LA LISTE SONT FAITS : marquage des contrats echus,
dialogue d'entre-rounds, demandes de coach, endgame.
MESURE DE DIX ANS (partie neuve, singe, graine 11, 3 650 jours, 978 s) :
  zero exception · tas stable ~230 Mo (aucune fuite)
  an 1 : 32 a l'effectif, 1 pro   ...   an 10 : 69 a l'effectif, 41 pros
  objectifs atteints : tenir · pros · classe · cent    (4 sur 12)
  mur : VIDE — et c'est instructif, voir ci-dessous.

## CE QUI RESTE OUVERT, PAR ORDRE D'INTERET
1. /!\ LE MUR EST RESTE VIDE SUR DIX ANS. Le chemin marche (banc 30 :
   un homme qui vieillit finit par annoncer, et s'il part il est
   accroche) — mais le singe RETIENT toujours ses hommes, et la retraite
   ne se propose qu'a 36 ans, serie a zero, 22 % par an. A verifier EN
   JOUANT : est-ce que ca arrive assez pour qu'un mur se remplisse en une
   vie de salle ? Si non, ce n'est pas le mur qu'il faut changer, c'est la
   frequence de la retraite.
2. LE SINGE N'EST JAMAIS SORTI DU GARAGE en dix ans (rangLocal 0), et
   n'a jamais eu de champion. Il joue mal (au hasard) — mais ca dit qu'une
   partie peut tourner dix ans sans que rien de grand n'arrive. A voir en
   jouant vraiment.
3. LES RIVALITES SONT RARES en pratique (1 vivante au bout de dix ans) :
   il faut recroiser le meme homme, et le matchmaking envoie rarement deux
   fois le meme. Si ca reste trop rare en jouant, la piste est le
   MATCHMAKING (proposer la revanche), pas le refroidissement.
4. Les chantiers concus non codes du carnet : E, F (mental.discipline),
   et le reste de la liste historique.

===========================================================================
## CAS 124 — « POURQUOI L'INTERVIEW DE COACH N'ARRIVE JAMAIS » (Mael, 25/08)
QUATRIEME fois que la question revient (cas 120 bis, 120 ter, et ici).
Elle ne reviendra plus : LA REGLE EST GRAVEE, ET CHIFFREE.

L'INTERVIEW EXISTE ET ELLE MARCHE. Mesure au singe, partie neuve :
    graine 11 : 1re signature orga j.173 · 1er combat pro j.251
                1re INTERVIEW j.389 — puis a chaque combat :
                389 · 461 · 587 · 659 · 731 · 803 · 875
    graine  7 : 1re signature orga j.122 · 1er combat pro j.175
                AUCUNE interview en 460 jours, malgre SEPT combats pro
Sur 900 jours (graine 11) : 14 combats programmes, 8 passent la porte,
7 interviews jouees (21 questions). Le systeme tourne.

POURQUOI ON NE LA VOIT PAS. La porte d'interviewFightWeek :
    s'ouvre si  titre  OU  orga au-dessus de "nationale"  OU  homme CLASSE
    reste close si  HEX (ou aucune orga)  ET  non classe  ET  pas de titre
Autrement dit : tant que tes hommes combattent a Hexagone sans etre
classes, la presse ne t'appelle pas. C'est un an et demi de jeu, et
plusieurs combats pro, avant le premier micro. Les six combats fermes de
la mesure ont TOUS la meme raison : "org HEX (nationale), non classe".
/!\ ET HEX EST LA SEULE ORGA DE NIVEAU "nationale" : des que l'homme
signe a Trident (nationale +), Sokol, GFL ou AFC, la porte s'ouvre sans
condition de classement. C'est donc autant une question d'ORGA que de
rang.

ARBITRAGE DE MAEL (25/08) : ON NE CHANGE RIEN. Le silence de la presse
est un palier a franchir — elle ne s'interesse a toi que quand ton homme
est classe ou signe plus haut. Trois autres options avaient ete posees
(petite interview d'une question des le 1er combat pro · ouvrir a tous
les combats · baisser le seuil a 3 combats ou 2 victoires de suite) :
TOUTES ECARTEES. Ne pas les reintroduire sans son accord.

## /!\ LE TROU DE BANC QUE CE DIAGNOSTIC A OUVERT (et c'est le vrai sujet)
Le singe (banc 27) "demarchait" depuis sa premiere ligne — sur
`Object.keys(MONDE.orgas||{})`. MONDE.orgas N'EXISTE PAS : les
organisations vivent dans classement.ORGS, comme demarcherOrga les lit
lui-meme. La liste etait donc TOUJOURS VIDE.
CONSEQUENCE, mesuree : 900 jours de partie neuve -> 5 pros a la salle,
ZERO signature d'organisation, ZERO combat pro, ZERO classement, ZERO
interview. TOUT LE METIER DU JEU passait a cote du banc — et le banc
etait vert.
=> C'EST LA LECON DU CARNET RETOURNEE CONTRE LE BANC LUI-MEME : une
   boucle branchee nulle part ne fait rien, ET NE LEVE PAS. Un banc n'est
   pas au-dessus de sa propre regle.
=> CORRIGE, et le banc 27 EXIGE desormais le metier : un homme signe en
   organisation, il combat vraiment chez elle, la presse tend le micro
   sur un combat qui compte, et elle NE le tend PAS sur un combat local
   d'un homme non classe (sinon la regle ci-dessus ne veut plus rien
   dire). Six assertions de plus.
=> A RETENIR POUR LA PROCHAINE MESURE : quand un chiffre est a ZERO,
   soupconner d'abord l'instrument. Les deux fois ou ca m'est arrive
   aujourd'hui (la fuite de memoire, ce demarchage), le jeu etait sain.

===========================================================================
## CAS 125 — LES VISUELS : CANVA + LA CHAINE D'ASSETS (Mael, 26/08 : « le tout »)
Demande : brancher des designs Canva dans le jeu — logos d'orgas, fond
d'accueil, cadre d'affiche, plaque du mur.

## LA CONTRAINTE QUI A DECIDE DE L'ARCHITECTURE
Le connecteur Canva de la session PEUT creer des designs dans le compte de
Mael, mais PAS en extraire les pixels : l'export est refuse (verifie sur un
vieux design possede — c'est un droit manquant du connecteur, pas un bug),
et le reseau bloque design.canva.ai. Le raccord est donc UN DEPOT DE
FICHIER, et c'est finalement la bonne architecture :
 - assets/ porte les VISUELS DE SECOURS (SVG dessines main, 8 Ko en tout) ;
 - les 8 designs Canva vivent dans le compte de Mael (liens ci-dessous) ;
 - un PNG telecharge depuis Canva, depose dans assets/ sous le MEME NOM DE
   BASE (logo_HEX.png a cote de logo_HEX.svg), ECLIPSE le secours au
   prochain `node js/gen_assets.js`. Le PNG s'en va, le secours reprend.
   Zero ligne de code a toucher — le banc 31 le prouve avec un vrai PNG.

## LA CHAINE (meme famille que gabarit.js / bundler.js)
assets/* -> node js/gen_assets.js -> js/assets.js (window.MMA_ASSETS,
genere, jamais edite) -> <script> dans demo_jeu.html -> inline par
apercu.js (aInliner). bac_partie.js le charge aussi (optionnel).
/!\ LE POIDS EST UN CONTRAT : 120 Ko par visuel, 400 Ko au total,
ENCODES. Au-dela le generateur REFUSE de construire (pas un warning) —
le cas 122 a appris ce que coute un poids qui grossit en silence. Un PNG
Canva trop lourd se reexporte plus petit (l'export prend une largeur en
pixels), on ne releve pas le plafond.

## LES BRANCHEMENTS (tous gardes contre l'absence d'assets.js)
 - logoOrga(cle,px) : liste des orgas (Monde), tete de classement, bulle
   d'offre a l'accueil ;
 - fond d'accueil + bapteme (degrade par-dessus : les boutons restent
   lisibles quel que soit le design depose) ;
 - l'affiche N'HABILLE QUE LE SOIR DU COMBAT (bloque.id==="combat") — une
   affiche de gala derriere « le loyer est du » mentirait ;
 - la plaque doree n'habille QUE les legendes du mur — un mur ou tout
   brille ne distingue rien (meme regle que le marquage des contrats).

## /!\ SEIZE ORGAS, CINQ VISUELS — APPRIS A L'ECRAN, PAS AU BANC
Le premier passage Chromium a montre Frontier, Bandeira, Taïga, Albion…
sans logo : vivier.js INJECTE ONZE NATIONALES dans classement.ORGS a
l'ouverture du monde (enregistrerOrgs). Une liste a moitie habillee a
l'air cassee. Le repli est un MONOGRAMME DERIVE de la cle — du RENDU, pas
un asset (meme famille qu'etoiles()) : couleur stable par hachage FNV,
initiales du nom. Les cinq grandes portent leurs visuels ; les onze
autres leur monogramme ; un logo_USA_N.png depose dans assets/ habillera
Frontier comme les grandes. Le banc compte contre LA TABLE DU MONDE
VIVANT (16), plus jamais contre les cinq du fichier.

## BANC 31 (verifier_assets.js) — 18 assertions
generation au meme octet · eclipse PNG>SVG prouvee avec un vrai PNG ·
plafonds tenus ET refus prouve (fichier de 150 Ko injecte, generateur
DOIT echouer) · 16 pastilles pour 16 orgas · les 5 grandes en assets ·
accueil/plaque/affiche visibles · l'affiche seulement le soir du combat ·
et TOUT TIENT SANS assets.js (monogrammes compris, zero exception).

## LES 8 DESIGNS CANVA (a retoucher la-bas, puis PNG -> assets/)
    logo_HEX    https://www.canva.com/d/E9M67tlvZY2HBbx
    logo_TRI    https://www.canva.com/d/Qv0VKFIXW2TfCIv
    logo_SOK    https://www.canva.com/d/EKUBq3XxVNZwqcK
    logo_GFL    https://www.canva.com/d/od0I4Fjkyothxqy
    logo_AFC    https://www.canva.com/d/hCPS8opH6GWJshh   (v2 lettrage, demande
                de Mael : "plus inspire de l'UFC" — lettermark massif italique
                or sur noir, octogone en filigrane. Le SVG de secours suit le
                meme parti. v1 emblème triangulaire, gardee :
                https://www.canva.com/d/HosWuK39Y4k06-s)
    accueil     https://www.canva.com/d/9is1GH34M2Oo2jh
    affiche     https://www.canva.com/d/BbolqaZ_DMZ3rrv   (fond sans texte)
    plaque      https://www.canva.com/d/VMFYotVFSc6gif9   (fond sans texte)
Tailles d'export conseillees (le plafond fait loi) : logos 256 px,
accueil 840 px de large (JPG), affiche 840 px (JPG), plaque 640 px.
/!\ affiche et plaque doivent rester SANS TEXTE : le jeu ecrit dessus.

## CAS 126 — « LES BOUTONS DE L'ACCUEIL NE MARCHENT PLUS » (Mael, 26/08)
LE SYMPTOME EST APPARU SANS CHANGEMENT DE CODE SUR CES BOUTONS — et c'est
le piege : des qu'une partie EXISTE, demarrer (Nouvelle partie / Demo)
passait par la garde du cas 122... qui posait un confirm() NATIF. Un hote
qui bloque les dialogues (visionneuse de fichiers, certains WebViews
Android) repond « non » EN SILENCE : le clic a l'air mort, aucune erreur
nulle part. Mael n'avait rien vu avant parce qu'il n'avait PAS de
sauvegarde — le chemin ne s'ouvrait pas.
Reproduit au banc Chromium avec les dialogues avales (Playwright
dismiss) : 1 confirm() emis, rien ne se passe, hash inchange.
LE REMEDE, cas 121 quinquies applique jusqu'au bout (« LE CLIC REPOND
TOUJOURS ») : PLUS AUCUN DIALOGUE NATIF DANS LE JEU.
 - confirmerNouvellePartie(m,s) : la confirmation d'ecrasement se rend
   DANS l'accueil — memes mots, memes garanties (copie de secours AVANT
   le reload). « Annuler » rend l'accueil entier.
 - confirmerEffacement() : idem pour « Effacer la sauvegarde ».
 - Meme si l'ecriture du secours echoue, le choix du joueur est fait :
   on part quand meme — il a lu ce qu'il perdait.
Banc 27, bloc « hote hostile » : confirm() y est EMPOISONNE (y toucher
fait echouer le banc), et les deux confirmations doivent repondre sans
lui. Verifie aussi bout en bout dans Chromium reel, dialogues avales :
0 dialogue natif, panneau en page, secours ecrit, partie neuve lancee.
/!\ PIEGE DE BANC consigne : le bac ne vide ses microtaches QU'ENTRE deux
evaluations — lire le resultat d'une promesse dans la MEME evaluation
voit toujours zero, et le banc accuse le jeu.

## CAS 126 bis — LA VISIONNEUSE : ON NE RECHARGE PLUS, ON DEMARRE SUR PLACE
Mael, apres le cas 126 : « ca marche quand j'ouvre en conversation, mais
pas sur Claude Code ». REPRODUIT : la visionneuse de claude.ai/code sert
la page dans un iframe sandbox EN blob:. Trois poisons a la fois —
localStorage ET indexedDB JETTENT (SecurityError), les dialogues natifs
sont avales (cas 126), et surtout : LE RECHARGEMENT D'UNE PAGE blob: PERD
LE FRAGMENT. Le « #neuf » pose par le clic s'evaporait au reload, MODE
retombait sur "choix", l'accueil revenait — en boucle. Boutons « morts »,
zero erreur nulle part.
LE REMEDE EST DE FOND : LE JEU NE SE RECHARGE PLUS ENTRE L'ACCUEIL ET LA
PARTIE. Tout l'amorcage de mode est passe en FONCTIONS — une seule
source, deux entrees (le chargement par hash, et le clic) :
  ensemencerEffectif(m)   les fiches scriptees (photographiees AVANT
                          toute suppression : FICHES_SCRIPTEES), le
                          vivier demo
  poserEcheancesMode(m)   pesee/combat1/visites — les echeances COMMUNES
                          (loyer, gala, vie) restent posees UNE fois au
                          chargement, sinon elles se doublent
  reglerSalleDepart(m)    le garage de la partie neuve
  lancerLeJeu(m)          monde, rendu, autosauvegarde, bapteme
  demarrerEnPlace(m)      MODE=m (donc `let`, plus `const`), hash pose
                          quand l'hote le permet — PLUS RIEN n'en depend
DECISIONS : toujours construites (des donnees), GARDE au point de lecture
(MODE==="demo").
/!\ DEUX PIEGES PAYES PENDANT LE REFACTOR, consignes :
 1. dejaPris est un ETAT DE JEU (recrutement, vivier, chargerEtat), pas
    une variable d'amorcage — l'enfermer dans la fonction a casse le
    chargement de sauvegarde (ReferenceError, attrape au banc).
 2. Le DOM du bac RECREE tout element demande : « l'accueil n'existe
    plus » y est inverifiable — on verifie qu'il est VIDE.
VERIFIE : banc 27 (hote hostile : confirm() empoisonne, zero reload
exige, demo sur place avec le retour des scriptes, loyer non double) ET
Chromium reel en iframe sandbox+blob — partie neuve jouee 5 journees dans
la visionneuse simulee, zero exception. Le chemin normal (#demo direct)
est inchange : effectif 38, Okonkwo, combat de Lyon.
DANS LA VISIONNEUSE LA SAUVEGARDE RESTE IMPOSSIBLE (stockage bloque par
la sandbox — cas 122 sexies) : on peut y JOUER, pas y VIVRE. Le telephone
et le navigateur restent la maison du jeu.

## CAS 127 — LES ILLUSTRATIONS DE LA PRESSE (Mael, 26/08)
Demande : « tu peux m'ajouter des illustrations dans les articles média ? »
QUATORZE TYPES D'ARTICLES, SIX THEMES — la table THEME_ARTICLE dit qui
porte quoi :
  presse_ceinture    titre · titrePerdu · titreRate · avantTitre
  presse_classement  top15 · serie · doute
  presse_signature   signeOrga · changeOrga
  presse_salle       portraitSalle · portraitPatron · retro
  presse_adieux      retraiteMaison
  presse_combat      afficheOrdinaire
/!\ L'ILLUSTRATION EST DU DECOR, JAMAIS DU CONTENU : noms, bilans, dates
restent dans le texte. Une image figee qui porterait un nom mentirait des
le deuxieme article — meme regle que l'affiche et la plaque.
L'article ouvert porte sa banniere en tete ; la liste Media porte des
vignettes (58x36). Un type sans theme ou un visuel manquant : l'article
parait SANS image, comme avant — garde par le banc.
BANC 31 etendu (4 assertions) : chaque theme pointe vers un visuel QUI
EXISTE · chaque type que ecrireArticle sait ecrire A un theme (les types
sont lus dans SA source — un nouveau type sans theme se verra au banc,
pas dans six mois ; motif souple, sans ancre de colonne, pour survivre a
une re-indentation) · l'article ouvert et la liste montrent l'image · et
sans assets.js, l'article s'ouvre comme avant.
/!\ CANVA : QUOTA DE GENERATION ATTEINT (les 9 designs du cas 125). Les
six bannieres Canva restent A GENERER quand le quota reviendra — meme
contrat que le reste : presse_ceinture.png (etc.) depose dans assets/,
840 px de large, SANS TEXTE, et gen_assets fait le reste. Les SVG de
secours (ceinture doree, gants au clou, podium, contrat, salle, projecteurs)
tiennent l'ecran d'ici la — 16 Ko au total pour les 14 visuels du jeu.

===========================================================================
SEANCE DU 26/08 (suite) — TROIS CONTENUS DEMANDES PAR MAEL
(« une idée pour ajouter du contenu ? des interactions ou autre » — les
trois retenus par lui : la revanche + l'appel, la causerie, le vestiaire)
===========================================================================

## CAS 128 — LA REVANCHE PROPOSEE PAR LE MATCHMAKER (fait)
La piece etait en place (endgame.js : chaleur, bourse, presse) mais RIEN
NE L'ALIMENTAIT — une rivalite vivante en dix ans de mesure, car le
matchmaker ne re-proposait jamais un ancien adversaire.
CE QUI EST CODE : dans proposerOffres, quand le joueur n'a PAS de cible,
le matchmaker regarde les rivalites VIVANTES de l'homme (rivalitesDe) et
VISE le rival — par la porte cible EXISTANTE de choisirAdversaire, qui
respecte deja la regle de Mael (« aucune revanche immediate » : advPrec
refuse, il faut un combat entre les deux). Conditions : meme orga, meme
division, 45 jours depuis le dernier fait. La bourse majoree et le mot de
la rivalite etaient deja branches — l'offre s'annonce « 💥 LA REVANCHE ».
/!\ LE SEUIL EST vivante(), PAS UN CHIFFRE A MOI (attrape au banc) : a 45
de chaleur exigee, une ceinture volee (40, qui refroidit) n'avait JAMAIS
sa revanche. Et une defaite seule (30) refroidit sous vivante() avant les
45 jours de delai : PAS d'affiche de revanche pour une simple defaite —
voulu, et assume ici.
/!\ LA CIBLE DU JOUEUR PRIME : s'il a cible un adversaire, le matchmaker
ne lui substitue pas sa dramaturgie.

## CAS 129 — L'APPEL DE DERNIERE MINUTE (fait)
Un adversaire se blesse, le matchmaker decroche : combat dans 8 a 12
jours, bourse +50 %, REPONSE SOUS 48 H (l'offre expire a J+2 — et une
offre expiree compte deja comme un refus).
/!\ LE PRIX EST NATUREL, PAS UN MALUS INVENTE : a J-10 il n'y a pas de
camp qui tienne — la preparation courte EST le cout. Le moteur n'est pas
touche. L'offre passe par offres.fabriquer (adversaire, trace, place —
tout le reel), puis : bourse x1,5, expire 48 h, avertissement ecrit sur
la bulle.
Rare et borne : ~1/285 par jour et par homme eligible (l'ordre d'un appel
tous les 2 ans), 240 jours mini entre deux appels au meme homme
(l.dernierAppel), jamais a un homme affiche/blesse/en camp/indisponible,
UN SEUL appel a la fois dans la salle.

## CAS 130 — LA CAUSERIE D'AVANT-COMBAT (fait)
Le dernier mot au vestiaire, UNE fois par combat, bouton « 🗣 Causerie »
sur la carte du soir. MEME REGLE QUE LE RESSENTI (cas 104) : tout sort
des jauges reelles — la pression de la fight week (imageDe), la
fraicheur, le dernier resultat. L'ecran DECRIT (« il tourne en rond, il
parle trop »), il ne chiffre pas.
LE BON DISCOURS SE DEDUIT DE SON ETAT :
    sous pression (>=0.04)        -> LE CALMER
    froid ou vient de perdre      -> L'ALLUMER
    bien                          -> RECADRER LE PLAN
LES EFFETS PASSENT PAR LES CANAUX EXISTANTS, le moteur n'apprend rien :
 - calmer (juste) : on lui rend LA MOITIE de ce que la pression a pris
   (fight_iq, cardio) — la causerie REPARE, elle ne dope pas ;
 - allumer (juste) : allure 1,12 au premier round via coin.plan — le
   canal legal du R1 — et +1 de lucidite ;
 - recadrer (juste) : +3 fight_iq, il monte lucide ;
 - ET LE MAUVAIS DISCOURS COUTE : allumer un homme qui deborde -> -4 %
   fight_iq (« tu viens de rajouter du bois ») ; calmer un homme froid ->
   allure 0,92 au R1 (« il monte trop calme ») ; recadrer un homme sous
   pression -> rien (« les mots glissent »), et le recit le dit.
/!\ LA CAUSERIE NE PIETINE JAMAIS UN PLAN D'ALLURE POSE PAR LE JOUEUR :
sa decision prime (verifie au banc).
Bancs : les trois discours offerts, l'etat visible, le juste repare, le
faux coute, une seule causerie, le plan du joueur intouche.

## CHANTIER N — LE VESTIAIRE VIVANT (CONCEPTION SEULE — ARBITRAGES REQUIS)
/!\ RIEN N'EST CODE. Mael a choisi « conception d'abord » : voici le
dessin, et LES QUESTIONS A TRANCHER AVANT UNE LIGNE DE CODE.

LE PRINCIPE (la regle fondatrice appliquee aux liens entre TES hommes) :
UN LIEN EST UN RESIDU DES FAITS, jamais une jauge cliquable. Il vit en
PAIRES (cle A, cle B, valeur, faits[]) dans SALLE.liens — une seule
source, il voyage dans la sauvegarde comme le reste de SALLE.

CE QUI CONSTRUIT UN LIEN (tout existe deja dans le jeu, rien a inventer) :
 - le sparring regulier ensemble (memes seances, meme groupe) — lentement ;
 - le duel interne (cas 72/73) : selon l'issue ET la maniere — un combat
   propre fait le respect, une demolition fait le froid ;
 - etre dans le coin de l'autre (cas « au_coin » du staff, a etendre) ;
 - l'anciennete partagee (arrives la meme annee).
CE QUI RONGE :
 - le passage pro de l'un quand l'autre attend (jalousie — aggression
   haute et bilan comparable) ;
 - l'ecart de bourse dans le meme vestiaire (l'argent se sait) ;
 - le poulain d'un coach (cas 83) : les autres du groupe regardent ;
 - le depart d'un homme lie (debauchage, retraite) laisse un trou.
LES CONSEQUENCES (toutes reelles, mesurables au banc) :
 - une paire liee s'entraine mieux ENSEMBLE (bonus de sparring quand les
   deux sont a la meme seance) ;
 - un froid REFUSE le sparring ensemble (la seance perd un des deux) ;
 - les demandes existantes se branchent sur le REEL : « son pote au
   coin » designe le VRAI pote, « moins de monde » vise le VRAI froid ;
 - LE LEADER DE VESTIAIRE (anciennete + entente + resultats) : tant
   qu'il est la, un petit plus de moral/fraicheur du groupe ; s'il part,
   le vestiaire vacille — et ca se raconte.

LES QUESTIONS POUR MAEL (une reponse chacune, puis on code) :
 1. VISIBILITE : en mots seulement, jamais de chiffre (comme l'entente) —
    mais OU ? Sur la fiche de l'homme ? Par les interpellations du coach
    (« ces deux-la, mets-les ensemble ») ? Les deux ?
 2. LE LEADER : il EMERGE des faits, ou le joueur le NOMME (capitaine de
    salle) ? L'emergence est plus dans l'esprit du jeu, mais nommer est
    une decision de coach.
 3. LA FORME : des paires seulement, ou des CLANS (3+) ? Les paires sont
    mesurables et bornees ; les clans racontent plus mais divergent vite.
 4. LE DUEL INTERNE : gagner « trop fort » contre un coequipier doit-il
    abimer le lien meme si le combat etait accepte des deux cotes ?
 5. LE PLAFOND : combien de liens VIVANTS a la fois dans une salle de 100
    (les onze demandes en attente du 09/08 guettent) ?

## CAS 131 — LE SOIR DE COMBAT MANGE PAR UN AUTRE EVENEMENT (banc 27, 26/08)
LE VRAI TRESOR DE LA SEANCE, trouve en codant l'appel de derniere minute.
Mesure, graine 7 : le soir de combat de Girard (jour 149) — carte posee,
blocage pose — a ete ECRASE par un autre evenement du meme jour. QUINZE
endroits posent `bloque = {...}` et AUCUN ne regardait s'il en ecrasait
un : visite, retraite, vie de la salle, cafe, interview... Sa carte est
restee « en attente » a vie — l'orphelin du cas 20, par un chemin neuf.
Le defaut existait DEPUIS TOUJOURS ; l'appel de derniere minute a juste
densifie le calendrier assez pour que le banc le voie.
LE REMEDE EST SYSTEMIQUE, pas quinze rustines (on oublierait la
seizieme) : `bloque` devient une PROPRIETE ACCESSEUR —
 - un blocage de COMBAT est INECRASABLE : tout autre evenement qui
   arrive pendant fait la queue (FILE_BLOQUE) et se presente des que le
   combat est solde ;
 - et l'inverse ne perd rien non plus : un combat qui arrive sur un
   blocage ordinaire remet celui-ci en tete de file.
La file est transitoire comme le blocage lui-meme (pas sauvegardee).
/!\ DEUX COMBATS LE MEME SOIR : le second se REPORTE a demain (« on ne
tient pas deux coins le meme soir »), et le fil le dit.
/!\ PIEGE DE MON PROPRE GARDE, consigne : sa premiere version regardait
aussi « un vieux COMBAT1 jamais encaisse » — et reportait le duel du
jour 194 A L'INFINI. Un etat ancien n'est pas une collision : le garde ne
regarde que le soir meme.
/!\ ET L'INVARIANT DU BANC S'EST AFFINE : une carte « en attente » du
JOUR MEME n'est pas un orphelin (le blocage tient jusqu'a l'encaissement,
une course peut finir un soir de combat) — l'orphelin, c'est la carte
d'HIER encore en attente.

## LE PLAFOND DU GARAGE — MESURE, PUIS ARBITRE : C'EST VOULU (Mael, 26/08)
LA QUESTION : l'economie plafonne (salle pleine au jour 180, caisse a
zero, jamais les 2 850 € de la sortie du garage). Etait-ce le jeu, ou le
pilote ? Le singe joue au hasard — il fallait un temoin qui joue BIEN.

L'INSTRUMENT : js/pilote_eco.js — deux pilotes, memes graines. Le "bon"
patron : forfait cale a ~95 % du prix accepte, materiel des que la caisse
depasse le prix + 1 500 € de reserve, demenagement des que plein avec
caution + 4 loyers devant lui.

LA MESURE (graine 7, 1200 jours) :
             naif                bon joueur
  local      garage, toujours    garage, toujours
  caisse     oscille -2 288..+1 319   oscille -3 424..+391
  adherents  28/28 (plein, 390 €)     23-26/28 (forfait suit reco -> 830 €)
  reputation 50                  60
  objectifs  5/12                5/12 (les memes)
  mur        vide                vide
LE VERDICT DU METRE : MEME BIEN JOUE, ON NE SORT PAS DU GARAGE en 3 ans
et demi. Monter les prix rapporte autant que remplir a bas prix (~11 k/an
dans les deux cas — la capacite de 28 borne tout), le materiel s'achete
mais la marche de 2 850 € (caution + entree) ne se franchit jamais. Et
NOTABLE : les objectifs SPORTIFS tombent pareil des deux cotes — le sport
ne depend pas de la gestion fine, l'economie est une contrainte de
SURVIE, pas un moteur de croissance.

L'ARBITRAGE DE MAEL : « C'EST VOULU, ON NE TOUCHE A RIEN. » Le garage
doit faire mal ; la sortie passe par les bourses pro tardives, pas par
les cotisations. Trois remedes etaient poses (caution etalee en 3 fois ·
bourses qui remontent mieux · palier intermediaire de local) : TOUS
ECARTES. Ne pas les reintroduire sans son accord.
CE QUI ROUVRIRAIT LA QUESTION, grave d'avance : si en JOUANT une longue
partie la frustration confirme (le mur vide et le local fige y sont
lies), on ressort ces trois remedes — avec cette mesure comme temoin.

===========================================================================
QUATRE RAPPORTS DE MAEL DU 26/08 AU SOIR (« allez je go dormir, regle tout ca »)
===========================================================================

## CAS 132 — L'ARTICLE « IL SIGNE CHEZ LA SALLE » (corrige)
L'article de signature partait AVANT contrats.signer : l.org etait encore
vide, orgNom retombait sur « le circuit » — le journal annoncait une
signature chez personne. L'article s'ecrit maintenant APRES la signature
(« Okonkwo signe chez Hexagone FC »), et le changeOrga suit la meme regle.
On ecrit une fois le fait ACCOMPLI — le journal ne ment jamais.

## CAS 133 — LES DEMANDES OBSOLETES (corrige, deux etages)
« Il me dit camp court alors qu'il a deja une date. » Deux trous :
1. A LA NAISSANCE : les demandes qui VEULENT une date (enchainer,
   cet_adversaire, souffler, main_event, monter_categorie) ne
   regardaient pas le calendrier. ctx.combatPrevu, joursAvantCombat,
   enCamp et pression ENTRENT AU CONTEXTE, et chacune se garde.
2. EN COURS DE VIE : une demande posee dans UN etat survivait au
   changement d'etat. perimerDemandes() (quotidien) : quand son objet
   disparait, L'HOMME LA RANGE LUI-MEME — « il a sa date, le reste
   attendra » — sans rancune, sans reponse a donner : le monde a repondu
   a sa place. Sens inverse aussi : partenaire_dedie / fight_week_calme
   se rangent quand le combat est derriere.
/!\ PIEGE REPAYE, TROISIEME FOIS : demandes.js modifie SANS relancer le
bundler — le banc verifiait l'ancien monde. LE BUNDLE NE SE REGENERE PAS
TOUT SEUL (lecon du 09/08, gravee en tete de carnet, repayee quand meme).

## CAS 134 — TROIS DEMANDES DE PLUS (« ameliore, rajoutes-en s'il faut »)
27 demandes desormais. Les trois neuves, chacune avec un effet REEL :
 - veut_revanche (combat) : ne sort QUE si une rivalite VIVANTE nee
   d'une DEFAITE existe (ctx.revanche, endgame). OUI -> le delai de la
   revanche du matchmaker (cas 128) tombe de 45 a 10 jours pour lui.
   Ne se marchande pas.
 - partenaire_dedie (preparation) : seulement EN CAMP. OUI -> 600 € et
   camp.qualite +0,12 (le canal qui multiplie deja les gains). La caisse
   vide = l'effet ne s'applique pas, et on le dit.
 - fight_week_calme (personnel) : seulement si LA PRESSION EST REELLE
   (imageDe >= 0.03, a J-10). OUI -> pression a zero, notoriete -2 :
   un combat sans bruit se vend moins.

## CAS 135 — LA REPUTATION MONTAIT TROP VITE (calibre)
« A 2 ans, des combattants UFC veulent deja signer chez moi. » Deux
moteurs, deux freins :
1. LES GAINS RETRECISSENT AVEC L'ALTITUDE : chaque victoire pro rendait
   son poids PLEIN de 5 a 95. Desormais < 40 plein · 40-60 x0,7 ·
   60-75 x0,45 · 75+ x0,25. LES PERTES RESTENT PLEINES — une reputation
   se perd plus vite qu'elle ne se gagne. Mesure au banc : +3 a 20 de
   reputation, +0,8 a 80.
2. LE PRO QUI FRAPPE RESTE A SA PORTE : la fenetre de notoriete laissait
   passer un sous-carte des INTERNATIONALES (peu connu mais sous contrat
   AFC). L'orga du telephone est bornee par la reputation :
   portee <= reputation + 10 — rep 55+ : nationales · 70+ : europeennes ·
   90+ : internationales. Mesure : a rep 60, 4 000 tirages, JAMAIS une
   grande orga (Sokol et Trident seulement).

## /!\ DEUX PIEGES DE BANC DE LA NUIT, consignes
1. LE BLOC « METIER » COMPTAIT SUR LA CHANCE DU SINGE : chaque nouvelle
   mecanique decale le flux d'alea et le cassait. Il FORCE desormais le
   chemin (comme les blocs revanche et presse) : le banc tient que la
   porte S'OUVRE, pas que le singe a eu de la chance.
2. UN TIRAGE CONSTANT DANS trancherBlocage EST UN PIEGE : a 0,4 fixe, le
   blocage gala_maison retombait sur la meme option morte huit fois par
   jour — le calendrier fige, le banc accuse le jeu. Tirage varie.

## CAS 136 — « JE PERDS MAIS C'EST MARQUE QUE JE DOMINE » (Mael, 27/08, capture)
Capture : Estève perd 27-30 (cartes 9-10 x3) pendant que le bandeau
affiche SIG 81-1 et FRAPPES 124-1 pour lui, controle 2:02 a l'adversaire.
Un homme qui touche UNE frappe en trois rounds ne gagne pas 30-27 : l'un
des deux affichages ment.
L'ENQUETE, au croiseur moteur/ecran :
 - LES CARTES SONT INNOCENTES : elles lisent le log en parse exact — le
   verdict de l'ecran est celui du moteur, cote pour cote (verifie).
 - LA FEUILLE EST INNOCENTE : elle porte le correctif du cas 61.
 - LE COUPABLE EST LE BANDEAU DU HAUT : les compteurs viennent du
   traducteur, dont l'attribution est `l.startsWith(nomA) ? A :
   l.startsWith(nomB) ? B` — SI UN JETON EST PREFIXE DE L'AUTRE, les
   lignes du second partent au premier ET LEUR PARSE RATE : ses frappes
   DISPARAISSENT du bandeau. PREUVE AU BANC : « Dur » c. « Durand » —
   moteur 1-56, ecran 2-0. Exactement la forme de la capture (le camp
   du moteur qui domine affiche ~1).
 - C'ETAIT LE CAS 61 DE LA FEUILLE... jamais couvert cote traducteur, et
   la garde de preparerCombat ne couvrait que l'EGALITE stricte.
LE REMEDE : la garde de preparerCombat couvre le PREFIXE (nomA prefixe de
nomB ou l'inverse -> suffixes A/B), une porte unique — le traducteur
(conforme a Python, fige) n'est pas touche.
LES BANCS QUI MANQUAIENT, ajoutes au 27 :
 - LE CROISEUR : sur des paires salle-monde REELLES, les frappes de la
   feuille ET du bandeau == les bilans du log, nom par nom. /!\ AUCUN
   banc ne comparait l'ecran AU MOTEUR — l'ecran etait compare au pli, et
   le pli a lui-meme : une inversion systematique passait les 31 bancs.
 - LA PREUVE DE LA FAILLE, gardee expres SANS la garde : si un jour ce
   test « passe », c'est que le traducteur a change — la garde devra etre
   re-jugee, pas supprimee en silence.
 - LA GARDE : aucun couple de jetons sortis de preparerCombat n'est en
   relation de prefixe (Okonkwo/Okamoto passent — proches, pas prefixes).
/!\ HONNETE SUR LA PORTEE : la paire exacte de la capture (« Estève » /
« Bexley ») n'est PAS en prefixe — le vecteur precis de SON combat reste
non reproduit. La classe du defaut est fermee et tenue au banc ; SI CA SE
REPRODUIT sur v161+, il faut LA SAUVEGARDE (Gestion -> Exporter) pour
disséquer le combat exact.

## CAS 137 — L'EXPORT SANS CUL-DE-SAC (Mael, 27/08, dans la visionneuse)
« Je ne vois jamais le code, seulement le bouton copier, et ca me met
impossible. » Le chemin de copie avait UN cul-de-sac : une exception
n'importe ou (et la visionneuse peut jeter DES L'ACCES a
navigator.clipboard) finissait sur un toast d'echec — jamais sur la zone
de copie manuelle. Sa partie etait prisonniere de la sandbox.
LE REMEDE, cas 121 quinquies encore : TOUT echec de copie finit sur la
zone a copier a la main (les morceaux de 80 Ko). Le seul vrai cul-de-sac
restant est une sauvegarde qui ne se SERIALISE pas — et la, on le dit.
ET UN BOUTON DIRECT « ✍ Afficher le texte, je copie a la main » sur
l'ecran d'export : on ne force plus l'utilisateur a traverser des chemins
qui echouent pour atteindre celui qui marche.
Banc : presse-papier EMPOISONNE + execCommand mort -> le clic DOIT finir
sur « morceau 1/N ». Verifie aussi en Chromium sandbox+blob reel.

## CAS 138 — L'AUTOPSIE EMBARQUEE, ET LA CAPTURE EXPLIQUEE AU CHIFFRE PRES
Mael a tente d'envoyer sa sauvegarde par le chat : LE CHAT TRONQUE LES
MORCEAUX (13 Ko passes sur 80). Une sauvegarde du jour 708 ne passera
jamais par ce canal. LE JEU FAIT DONC SA PROPRE AUTOPSIE :
 - a l'encaissement, autopsieCombat() croise TROIS sources : les bilans
   du log (la verite moteur), la feuille, et LE BANDEAU (la somme des st
   du traducteur — c'est lui que le joueur regarde, et c'est lui qui
   mentait sur la capture) ;
 - divergence -> la carte du resultat porte « ⚠ compteurs suspects » ;
 - chaque carte a un bouton « 🔬 Copier le rapport technique » :
   ~250 octets, un seul message a coller — meme regle que l'export
   (cas 137), tout echec de copie finit sur la zone a la main ;
 - l'autopsie voyage SUR LA CARTE, donc dans la sauvegarde.
/!\ LA PREUVE QUI CLOT LE CAS 136 : le cas fabrique (« Dur » c.
« Durand », sans la garde) donne moteur 1-56 -> ECRAN 83-0. Les frappes
de B sont TRANSFEREES a A et B tombe a zero — EXACTEMENT la capture de
Mael (lui a 81/124, l'adversaire a 1, en perdant 27-30). Le mecanisme de
son combat est confirme au chiffre pres ; la garde du prefixe (v161) le
ferme.
/!\ TROIS PIEGES D'INSTRUMENT payes dans la foulee, consignes :
 1. st EST UN DELTA PAR ETAPE, PAS UN CUMUL (le gabarit fait +=) :
    prendre « le dernier st » lisait la derniere goutte au lieu du
    fleuve. On SOMME.
 2. LE BANDEAU SOUS-COMPTE NATURELLEMENT (il ne suit que ce que le
    traducteur met en scene — un combat au sol peut rendre un tiers du
    moteur) : le seuil de disparition est LARGE (1/8), et l'inversion de
    sens reste le crime principal.
 3. LE CAS FABRIQUE NE COMPTE PAS DANS LE CROISEUR DES PAIRES REELLES —
    il a sa propre assertion. Le laisser dedans faisait accuser le jeu
    par sa propre preuve.

## CAS 139 — « IL COMMENCE A ME REGARDER » EST SORTIE (Mael, 27/08)
« J'aime pas du tout cette phrase. » Elle voulait dire « il commence a me
craindre » et se lisait de travers. Le momentum du ressenti a maintenant
un REPERTOIRE de quatre phrases (« Le round est pour moi, je le sais. » ·
« Je le sens plier. » · « Il recule. C'est bon signe. » · « Je suis en
train de le user. »), choisi par le jeton derive de l'etat — la regle 4
du module tient : AUCUN tirage, meme combat = meme phrase, et le banc 28
prouve toujours que le flux du hasard ne bouge pas d'une unite.

## CAS 140 — LE PRO SOUS ORGA NE POUVAIT PAS SIGNER SON CONTRAT DE SALLE (Mael, 27/08)
« Quand je signe qlq qui a deja un contrat avec une orga je peux pas
faire de contrat de salle. » Le pro venu par la reputation (cas frappe)
arrive AVEC son contrat d'organisation et SANS accord de salle — et
salleEchue() repond faux quand il n'y a RIEN a echoir. L'ecran « sous
contrat, personne ne peut le prendre » l'attrapait donc AVANT l'ecran de
signature : impossible de prendre une part sur ses bourses, jamais.
C'est le frere du piege du 14/08 (le contrat ECHU passait apres) : meme
regle, gravee une deuxieme fois — L'ACCORD AVEC TOI SE REGLE D'ABORD,
l'organisation se lit ensuite. Le bloc « sous contrat » exige maintenant
un contrat de salle EXISTANT ; l'ecran de signature dit la situation
vraie (« il est sous contrat AFC — mais rien ne le lie a la salle »).

## CAS 141 — LE RENVOI N'EXISTAIT PAS (Mael, 27/08)
« Je peux pas virer qlq. » Le seul depart etait le « laisser partir » du
contrat echu — entre deux echeances, un homme etait indelogeable. Le
bouton « S'en separer » (fiche pro ET amateur) ouvre un ecran qui montre
le prix AVANT le clic ; le second clic seulement execute. Les regles :
 - JAMAIS pendant une echeance : combat programme => refus (garde dans
   ouvrirRenvoi ET virerGars — l'ecran reste peut etre ouvert) ;
 - un contrat de salle en cours SE SOLDE : les frais de dossier par
   combat restant — le meme etalon que la signature (le coach part avec
   un mois de salaire : meme logique, son echelle a lui) ;
 - un homme de la maison (entente 60+) qu'on jette, ca se raconte :
   reputation -1,5 par le canal officiel (bougerReputation => depeche).
/!\ FUITE TROUVEE EN CREUSANT : tout homme de l'effectif EST un homme de
MONDE.pros marque salle=true (cartes.js l'exclut du monde pour ca). Le
« laisser partir » du contrat echu n'effacait JAMAIS cette marque —
l'homme parti n'etait plus a toi ET plus au monde : un fantome, hors
sim pour toujours. La sortie passe maintenant par UN SEUL chemin,
quitterLaSalle() : la marque tombe, le contrat de salle aussi, le monde
le reprend et sa carriere continue sans toi. Une chose reparee aux deux
endroits parce qu'elle n'existe qu'a un seul.

## CAS 142 — PLUS HAUT, PLUS DURE LA CHUTE (Mael, 27/08)
« La reputation de la salle doit bcp baisser avec les defaites. » Le
frein d'altitude du 26/08 retrecit les GAINS en haut — mais une defaite
coutait le meme prix a 30 qu'a 80 de reputation. C'est l'inverse du
reel : une salle de quartier qui perd, personne n'en parle ; une salle
mondiale qui perd, tout le monde en parle. Dans retombees(), le MIROIR
exact du frein, sur les defaites seulement :
    < 40 : plein · 40-60 : x1,6 · 60-75 : x2,2 · 75+ : x3
et une defaite contre un homme au bilan bien plus court prend x1,4 de
plus (le symetrique du bonus de l'exploit). Une defaite par KO a 80 de
reputation coute desormais ~x3 ce qu'elle coutait hier — la haute
reputation devient une chose qui se DEFEND, pas un plateau acquis.
Les pertes hors combat (affiche annulee, silence) ne changent pas :
Mael a parle des defaites, le frein reste chirurgical.

## CAS 143 — LES INTERNATIONALES VEULENT DES PREUVES (Mael, 28/08)
« Pour UFC il faut avoir au moins 1 top 15 UFC pour que d'autres
veuillent rejoindre. » La porte des internationales s'ouvrait a la
reputation seule (90+, cas frappe) — meme sans jamais avoir place un
homme la-bas. Or a ce niveau on ne choisit pas sa salle sur la rumeur :
on regarde QUI s'y prepare. La regle, gravee :
 - un contracte d'une INTERNATIONALE (AFC, GFL) ne toque que si la
   salle compte deja un top 15 — ou un champion — SOUS CONTRAT chez une
   internationale (le contrat en cours, pas un souvenir : un homme
   parti ou redescendu ne vaut plus preuve) ;
 - les europeennes et nationales viennent toujours a la reputation
   seule — c'est la le chemin : y placer son premier homme, le monter
   top 15, et alors seulement les autres suivent ;
 - la porte de reputation (90+) reste EN PLUS : les deux se cumulent.
Mesure au banc (4000 tirages a 95 de reputation) : zero internationale
sans la preuve, la porte se rouvre des qu'un homme de la salle est
top 15 chez elle.

## CAS 144 — LE SCOUTING AUX SOIREES (chantier O, Mael, 28/08)
« Du scouting, où je peux me rendre aux événements et regarder les
cartes, recruter. » LE TERRAIN ETAIT PREPARE : le calendrier vivait deja
dans MONDE.vie.prochaine (cartes.js), et l'empreinte datee avait ete
concue le 09/08 comme « matiere du futur rapport de scouting ». On ne
fabrique rien cote monde — on achete un billet pour aller voir ce qui se
joue deja. C'est le PREMIER RECRUTEMENT ACTIF du jeu (avant : tout
toquait a la porte, rien ne s'allait chercher).
Les trois arbitrages de Mael (28/08, les trois recommandes) :
 1. backstage : LIBRES et FINS DE CONTRAT seulement — on n'arrache
    personne a son organisation ;
 2. l'absence est ABSTRAITE : le billet coute (300/600/1200/2500 € a la
    portee), la salle tourne — jouable au telephone sans friction ;
 3. l'oeil du scout : TROIS regards par soiree — le choix fait le jeu.
Ce qui est branche :
 - onglet Monde, « Les soirees a venir » : les prochaines cartes par
   orga (lecture de MONDE.vie.prochaine, RIEN de nouveau), reservation,
   annulation a moitie remboursee ; soiree sans carte = rembourse ;
 - le soir : rapport sur SALLE.soiree (les combats, resultats,
   methodes), relation orga +echange_juste (se montrer aux
   matchmakers) ;
 - l'oeil : fourchettes sur les 11 axes du profil (MMA.profil.lire —
   LA MEME lecture que « sur le papier »), decalage derive de l'id,
   JAMAIS la note, jamais un chiffre exact ; le rapport vit sur l'homme
   du monde (l.scoute) et s'affiche sur sa fiche ;
 - le backstage : DEUX approches par soiree, la porte du cas 143 passe
   par preuveInternationale() — LA MEME FONCTION que le pro qui frappe,
   pas un deuxieme exemplaire de la regle ; acceptation a la reputation
   contre sa notoriete ; accepte => blocage « frappe » (adoption par le
   meme chemin qu'avant).
/!\ PIEGE EVITE ET GRAVE : la carte du monde se CONSTRUIT ET SE RESOUT
le jour meme (batirCarte + resoudre dans vivre) — on n'annonce donc que
la DATE et l'orga, jamais l'affiche a l'avance. Pre-construire la carte
pour l'afficher aurait cree un deuxieme exemplaire de la verite, faux
des qu'un roster bouge entre l'annonce et le soir.

## CAS 145 — LES CATEGORIES SUIVIES (Mael, 28/08)
« Une notif quand des top 15 de la categorie de l'orga d'un de mes
combattants combattent. » Le filtre des depeches (salle.depechesDe :
« ton orga, les titres, tes hommes — le reste est du bruit ») s'ouvre
d'une fenetre : les cles ORG|division ou TES pros sont sous contrat.
Un combat de top 15 dans une de ces fenetres remonte en depeche marquee
« ta categorie » (onglet Monde et fil des depeches) — ce sont les futurs
adversaires de tes gars, pas du bruit. Le rang lu est celui DU SOIR
(rangA/rangB captures par resoudre), pas celui d'apres le recalcul.
Le parametre `suivies` est OPTIONNEL : sans lui, le filtre d'avant,
inchange — et c'est le jeu qui construit la fenetre a chaque jour
(l'homme parti ou retraite ne laisse pas sa categorie ouverte).

## CAS 146 — LE VESTIAIRE VIVANT EST BRANCHE (chantier N ferme, 28/08)
Les 4 arbitrages de Mael (28/08) + le 5e pose par la session :
 1. VISIBILITE : LES DEUX — bloc « Le vestiaire » sur la fiche (mots,
    jamais un chiffre, comme l'entente) ET le coach qui interpelle
    QUAND un palier se franchit (le signal `franchi` de poser()) ;
 2. LE CHEF EMERGE des faits (anciennete >= 1 an + entente >= 55 +
    resultats — bareme dans vestiaire.leader()), personne ne le nomme ;
 3. DES PAIRES seulement — les clans se liront d'eux-memes ;
 4. LA MANIERE COMPTE au duel interne : arret au 1er round = demolition
    (froid -18), tout le reste = combat propre (respect +8) ;
 5. LE PLAFOND : 24 paires, la plus faible s'efface (a rejuger en jouant).
LE MODULE (vestiaire.js, banc 32) : pur, zero tirage, zero DOM. Paires
dans SALLE.liens (UNE source, voyage avec la sauvegarde). Paliers :
proches >= 30, inseparables >= 60, froid <= -30, irreconciliables <= -60.
Usure 1,5 %/semaine ; une paire retombee a rien s'efface.
LES BRANCHEMENTS (demo_jeu.html) :
 - le sparring ensemble tisse (+0,4 par seance partagee, pros) ;
 - une paire liee s'entraine mieux ENSEMBLE (x1,15 au sparring) ;
 - un FROID refuse le tapis : la seance perd un des deux ;
 - le duel interne marque (effetDuel, a l'encaissement) ;
 - la jalousie du passage pro (-6 par amateur au bilan comparable) ;
 - le depart efface les paires, ceux qui etaient lies le disent ; si
   c'etait LE CHEF : SALLE.vestiaireVacille un mois (seances x0,93) ;
 - tant que le chef est la, les autres pros rendent x1,03.
RESTE POUR PLUS TARD (gravé, pas oublié) : l'ecart de bourse qui ronge,
l'anciennete partagee, le combattant au coin d'un autre (l'au_coin du
staff a etendre), les demandes branchees sur le VRAI pote/froid.

## CAS 147 — LA LECTURE D'ENTENTE QUI RENDAIT TOUJOURS undefined (28/08)
Trouve en branchant le chef de vestiaire : SIX sites lisaient
`MMA.entente.lire(l.entente).valeur` — or lire() prend une VALEUR et
rend un PALIER {seuil, mot} : passer l'etat entier rendait le dernier
palier, et `.valeur` dessus = undefined. Consequence silencieuse :
`ent>=60` toujours faux — les adieux de fin de contrat toujours froids,
deux lectures de l'endgame mortes, et mes trois sites recents (renvoi,
vestiaire) nes avec le meme defaut par IMITATION du site malade.
La bonne lecture : `l.entente.valeur` (l'etat la porte en clair).
Lecon gravee : IMITER UN CALL-SITE EXISTANT PROPAGE SES BUGS — verifier
la signature du module, pas le voisin.

## CAS 148 — L'EMBALLAGE ANDROID (chantier P ouvert, 28/08)
Mael : la cible de sortie est LE PLAY STORE, avec a terme « la save par
Google ». Decisions gravees :
 - LE JEU NE SAIT RIEN D'ANDROID : demo_jeu.html tourne pareil au
   navigateur, en visionneuse et en WebView. L'emballage vit dans
   appli/ ; www/ y est un ARTEFACT fabrique par synchroniser.sh depuis
   jeu/ (une seule source, jamais edite a la main — meme regle que
   l'apercu). Le SEUL ajout est pont_android.js, annexe au sed, garde :
   hors appli il ne fait rien et ne leve pas ;
 - v1 : save LOCALE (celle d'aujourd'hui) + export/import en filet.
   v1.1 : la save Google Play Jeux — l'interface window.PONT_SAVE est
   RESERVEE (lire/ecrire une chaine MMALZ1|), le jeu n'aura rien a
   reecrire parce que la sauvegarde est deja UNE chaine ;
 - bouton retour Android : fiche ouverte -> fermerFiche(), sinon
   l'appli se range (minimize) — jamais de fermeture seche ;
 - l'APK de test se construit par GitHub Actions (pas de SDK Android
   sur la machine de session) : artefact mma-manager-debug-apk ;
 - appId fr.mmadata.mmamanager — DEFINITIF a la premiere montee sur le
   Play Store : A CONFIRMER PAR MAEL AVANT (modifiable avant, jamais
   apres). Nom affiche : « MMA Manager ». Icone : octogone or + gant
   (icone.svg, rendue par fabriquer_icones.js — remplacable par un
   design Canva) ;
 - le chemin Play Store cote Mael : compte console (25 $), test ferme
   impose (~12 testeurs, 14 jours, compte personnel), politique de
   confidentialite (rien n'est collecte, tout reste sur l'appareil).

## CAS 148 bis — L'APK TESTE SUR VRAI TELEPHONE : « c'est nickel » (Mael, 30/08)
Premier build CI (90 s), premiere installation, premier essai reel :
retour, sauvegarde locale, confort — rien a signaler. L'emballage v1
est valide sur appareil. Restent COTE MAEL : la campagne de jeu longue,
la confirmation de l'appId fr.mmadata.mmamanager, le compte Play
Console et les ~12 testeurs du test ferme.

## CAS 149 — LA SOIREE VECUE (chantier O bis, Mael, 30/08)
« Pas super fan du mode scouting — je m'inscris et ça m'ouvre une page
annexe comme le combat, avec l'évent ; parler aux combattants avec des
dialogues riches, les inviter à la salle pour s'entraîner, créer des
liens, recruter s'ils n'ont plus de club. » Le rapport-fiche devient
une PAGE (plein écran, comme l'écran de combat) :
 - le soir venu, un blocage ouvre la porte (« Entrer dans la salle » /
   « Suivre de loin » — qui laisse le rapport dans l'onglet Monde) ;
 - la carte SE DEROULE combat par combat (« Combat suivant › ») — les
   resultats sont ceux que le monde a deja tires, la page ne rejoue
   rien ; l'oeil du scout (3 regards) vit dedans ;
 - AU BORD DE LA CAGE : les deux du dernier combat deroule + les libres
   et fins de contrat de la carte. « Lui parler » ouvre le dialogue.
LE DIALOGUE (module soiree.js, banc 33) — meme doctrine que dialogue.js :
 - la replique sort de l'etat REEL (son resultat du soir, son contrat,
   sa notoriete, ce qu'il sait de toi) et n'est JAMAIS decorative ;
 - meme homme, meme soir = meme phrase (le jeton decide, pas un tirage) ;
 - LE CONTACT est un residu pose sur l'homme du monde (p.contact, mots
   jamais chiffres : « il te situe » / « il te connait » / « en
   confiance ») — il voyage avec lui et PESE : sur l'invitation ET sur
   le recrutement (decisionRecrutement : +0,4 par point de contact) ;
 - L'INVITATION : une semaine a la salle (VISITE_JOURS), le sparring de
   SA division rend x1,2 (BOOST_VISITE) ; un seul visiteur a la fois ;
   la semaine finie rend +8 de contact et se raconte. Un contracte
   d'internationale sans la preuve refuse MEME la visite (cas 143) ;
 - LE RECRUTEMENT par le dialogue passe par LA MEME decision que le
   bouton du rapport (decisionRecrutement — pas deux exemplaires) et le
   MEME budget (2 promesses par soiree) ; accepte => le blocage
   « frappe » attend a la sortie de la page.
/!\ PIEGE D'EMPILEMENT REGLE : le voile des fiches (z=10) passe SOUS la
page (z=88) — une fiche ouverte depuis la soiree aurait ete un clic
mort (cas 121). ficheDepuisSoiree() RANGE la page, ouvre la fiche, et
fermerFiche() ROUVRE la page (RETOUR_SOIREE).
L'ancien ecran-rapport (ouvrirSoiree) reste en lecture, mais la carte
de l'onglet Monde ouvre la page vecue.

## CAS 150 — LA VUE 3D, PROTOTYPE (chantier Q ouvert, Mael, 30/08 : « go 3D »)
LA REGLE 7 JUSQU'AU BOUT : la 3D est UNE CAMERA POSEE SUR LE REEL, pas
un deuxieme moteur. Les etapes du traducteur portaient deja TOUT (les
positions des deux hommes dans la cage — centre (180,180), rayon 148 —
la phase, qui encaisse et ou, le texte) : choregraphie.js (banc 34) les
RELIT en temps de scene, il n'invente ni un pas ni un coup.
 - la partition (r.c3d) se pose sur la carte a l'encaissement — SEUL LE
   DERNIER combat la garde (proto : quelques Ko, pas toute une carriere) ;
 - bouton « 🎥 Revoir en 3D » sur la carte ; la vue : octogone, cage en
   fil d'or, deux silhouettes en primitives (rouge/bleu), camera qui
   orbite, LE TEXTE DU LOG en sous-titre — la 3D et les mots racontent
   le meme combat ;
 - gestes : garde (respiration), frappe (bras/jambe selon la zone du
   dmg, recul de l'encaisse), amenee/sol/soumission (dessus-dessous par
   ctrl), chute au KO — le bon bonhomme tombe (assertion du banc) ;
 - trois.js r147 (UMD, 600 Ko) VENDU dans js/trois.js — jamais edite,
   inline dans l'apercu, copie dans l'APK (synchroniser.sh) ;
 - gardes : pas de THREE => on le dit ; pas de WebGL => on le dit.
ARBITRAGE MOTEURS (Mael a demande « lier Blender et Godot ») :
 - GODOT : NON — greffer un moteur de jeu sur le notre = deux runtimes
   dans l'APK (~40 Mo), un pont fragile, la visionneuse perdue. Notre
   valeur est le moteur de combat ; la 3D n'est qu'une camera.
 - BLENDER : OUI, comme ATELIER — un GLB (glTF) exporte de Blender ou
   Mixamo se chargera dans Three.js et REMPLACERA les silhouettes sans
   toucher la partition. Pas de liaison : des fichiers suffisent.
A JUGER EN JOUANT : la cadence (1,15 s/temps), la lisibilite des
silhouettes, l'envie d'un GLB. Le proto decide si on creuse ou si on
reste sur l'ecran 2D.

## CAS 150 bis — LE PROTO 3D JUGE ET RETIRE (Mael, 30/08 : « c'est vraiment nul, faudra faire autrement »)
Le verdict du seul juge qui compte. RETRAIT PROPRE, pas un revert
aveugle :
 - SORTI DU JEU : les silhouettes en primitives, la vue, le bouton
   « Revoir en 3D », la partition sur les cartes, et three.js (600 Ko
   rendus a l'apercu et a l'APK). L'encaissement PURGE les c3d des
   vieilles sauvegardes ;
 - GARDE : choregraphie.js + banc 34 — la lecture du log (positions,
   phases, gestes, le bon bonhomme tombe au KO) est independante de
   tout rendu. La prochaine tentative repartira d'ici. EN DORMANCE,
   marque comme tel dans son en-tete ;
 - LECON : la partition etait juste, le COSTUME ne l'etait pas — des
   primitives ne suffisent pas a porter un combat. « On reflechira » :
   pistes pour plus tard, a discuter AVANT de coder cette fois —
   sprites 2D dessines (l'esthetique se controle), GLB Mixamo/Blender
   (le realisme, mais le sol restera dur), ou assumer le 2D actuel qui
   raconte deja bien. AUCUNE ne se lance sans une maquette validee par
   Mael d'abord.

## CAS 151 — LE COMBAT SOUS UNITY, PROJET COMPAGNON (chantier Q2, Mael, 31/08)
« On peut tenter le module combat sous Unity ? » Les deux reponses de
Mael qui cadrent tout : il a UN PC MAIS N'A JAMAIS TOUCHE UNITY, et il
vise « dans l'app telephone a terme ». Decisions gravees :
 - LE MOTEUR NE BOUGE PAS D'ICI. Unity est un LECTEUR : il joue la
   partition (choregraphie.js — la dormance du cas 150 bis paie deja),
   exportee en JSON NEUTRE par jeu/js/exporter_partition.js (positions
   deja normalisees, gestes deja tranches — Unity ne connait ni le log
   ni la cage (180,180), regle 7 de bout en bout) ;
 - unity/ = projet compagnon PC : Amorce (le lecteur se lance seul dans
   n'importe quelle scene), LecteurPartition (capsules par defaut,
   REMPLACABLES par un personnage nomme CombattantA/B — Mixamo — et
   Animator optionnel avec etats nommes garde/frappe/amenee/sol/
   soumission/chute/clinch/fin), README ecrit pour un debutant complet ;
 - VERDICT VISUEL D'ABORD : l'etape « dans l'app » = Unity as a
   Library, ~+40 Mo d'APK et un pont — elle ne se decide QU'APRES que
   le rendu PC (avec un vrai personnage Mixamo, pas les capsules) a plu
   a Mael. La lecon du cas 150 bis appliquee : pas d'engagement avant
   une maquette validee ;
 - je code ce projet EN AVEUGLE (pas d'editeur Unity sur la machine de
   session) : les yeux de Mael sont le banc d'essai — les erreurs
   console Unity se collent ici comme n'importe quel rapport.

## CAS 152 — LES DIALOGUES DOUBLES (Mael, 31/08 : « enrichir les dialogues, les doubler au moins »)
La doctrine du 10/08 tient : PAS UNE LIGNE DECORATIVE, et pas un
invariant qui bouge. La methode, gravee :
 - dialogue.js (les 7 approches, 44 entrees) : chaque entree garde SA
   condition et SES effets — t devient une LISTE de formulations, et
   c'est LE JOUR qui departage (t[jour % n]). Deterministe : meme etat
   meme jour = meme phrase ; un autre jour varie. L'ordre des conditions
   ne bouge pas (l'anti-farm du moral du banc entente est intact) ;
 - ressenti.js : chaque FAIT garde son seuil et son levier — les mots se
   declinent, departages par le jeton (regle 4 : zero tirage). RIEN 3->6,
   MOMENTUM 4->8, les phrases du non-lucide et du round perdu doublees ;
 - soiree.js : ouvertures 18->36, reponses 27->52, et l'invariant du banc
   tenu de force : TOUTE ouverture « connu » porte {salle} — la 4e ecrite
   sans a ete reprise, pas le banc ;
 - cris.js PAS TOUCHE : ce sont des ordres-boutons, pas des dialogues —
   varier un libelle de commande embrouillerait le joueur.
Total : ~130 formulations nouvelles, zero effet change, zero tirage
ajoute.

## CAS 153 — LE PONT CLAUDE ↔ UNITY EST ETABLI (chantier Q2, 31/08)
« Si je pouvais te lier avec Unity ça serait plus simple. » C'est fait —
mais pas par la session cloud : par CLAUDE CODE INSTALLE SUR LE PC DE
MAEL. Le serveur MCP est local (127.0.0.1) ; une session en conteneur
n'a aucune route vers sa machine. Resultat : UnityMCP · connected ·
48 outils. Le Claude local voit la scene, lance le Play, corrige ; la
session cloud garde le jeu, l'app et le carnet.
LA PROCEDURE, GRAVEE (deux heures de plomberie, qu'on ne refera pas a
l'aveugle) :
 1. la voie OFFICIELLE ECHOUE : com.unity.ai.assistant n'existe pas
    pour Unity 6000.0.32f1 (« unable to find the package ») ;
 2. voie COPLAY : prerequis git + uv + Python 3.10+. Python etait la,
    git et uv installes par `winget install --id Git.Git -e ;
    winget install --id astral-sh.uv -e` ;
 3. l'installation par l'UI du Package Manager n'a rien ecrit : la
    ligne a ete posee A LA MAIN dans Packages/manifest.json
    ("com.coplaydev.unity-mcp": "https://github.com/CoplayDev/
    unity-mcp.git?path=/MCPForUnity#main") — et LA, Unity l'a vue ;
 4. /!\ « No git executable was found » : Unity et le HUB avaient ete
    lances AVANT l'installation de git — le Hub survit en arriere-plan
    et transmet son vieil environnement. REDEMARRAGE DU PC. (Au
    passage, Library corrompue par le Quit en pleine resolution :
    « Rebuild Library », c'est du cache, rien ne se perd.)
 5. fenetre Ctrl+Shift+M : « Start Server » (session active), puis
    Client -> CLAUDE CODE (le menu proposait Antigravity par defaut)
    -> Configure ;
 6. /!\ LE PIEGE FINAL : la config MCP est ATTACHEE AU DOSSIER. Claude
    Code lance depuis C:\Users\maelu ne voyait pas Unity. Il faut le
    lancer DEPUIS unity/.
LECON DE LA JOURNEE, valable au-dela d'Unity : j'ai remplace un
manifest au lieu de le completer et j'ai fait disparaitre des packages
du projet. Un fichier de configuration qu'on n'a pas ecrit, on
l'AJOUTE, on ne le REECRIT pas.

## CAS 154 — LA 3D EST CLOSE (Mael, 31/08, troisieme et dernier verdict)
Trois tentatives, trois fois le meme mot de Mael :
 1. proto three.js en primitives (cas 150) : « vraiment nul » ;
 2. son propre combattant (photo -> Tripo -> rig Mixamo) + animations
    Mixamo : « c'est horrible » ;
 3. un pack d'animations de combat du store : « encore pire ».
LE DIAGNOSTIC, ecrit une fois pour toutes pour qu'on ne recommence pas
dans six mois : LE PROBLEME N'EST NI LE CODE NI LE MODELE, C'EST LA
MATIERE. Le debout se rattraperait avec un pack mocap serieux (Kubold,
MoCap Online, ~40-60 €) — mais LE SOL, JAMAIS : une amenee, un passage
de garde, une soumission exigent de la mocap A DEUX ACTEURS EN CONTACT
PERMANENT. Ca ne se vend pas ; les studios qui font de vrais jeux de MMA
la tournent eux-memes, avec des combattants et un budget. Or notre
moteur simule le sol EN DETAIL — c'est meme une de ses forces. La 3D
montrerait donc MAL ce que le jeu fait de MIEUX. C'etait annonce des la
premiere discussion (« le sol, c'est le cimetiere des jeux de MMA ») ;
c'est desormais MESURE par le seul juge qui compte.
CE QUI RESTE (rien n'est perdu) :
 - choregraphie.js + banc 34 : la lecture du log en partition, en
   dormance, independante de tout rendu ;
 - unity/ : le projet compagnon, le lecteur, l'importateur, le briefing,
   et le pont MCP installe (cas 153) ;
 - la procedure complete, si un jour un vrai budget d'animation existe.
CE QU'ON NE REFAIT PAS SANS BUDGET MOCAP : la 3D. Le combat se raconte
par l'ecran 2D, qui dit ce qui se passe VRAIMENT — et c'est ce que le
jeu a de plus fort.

## CAS 155 — LES TROIS POINTS DE VEILLE, MESURES ET REGLES (Mael, 31/08)
Mael a choisi le chantier des watchpoints. Ils ne sont plus des
impressions : ils sont CHIFFRES (js/pilote_endgame.js, nouvel
instrument hors chaine, comme pilote_eco).
MESURE AVANT — graine 7, dix ans, 500 combats :
    MUR 0 plaque · age max 35 ans · rivalites 10 vivantes sur 343 (3 %)
LES CAUSES, toutes arithmetiques :
 1. LE MUR NE POUVAIT PAS SE REMPLIR — DEUX VERROUS EN SERIE :
    accrocherAuMur n'etait appele QUE par raccrocher(), et raccrocher()
    exigeait 36 ans alors que l'age maximum atteint en dix ans etait 35.
    Aucune plaque n'etait possible, jamais. Le mur dit CE QUE LA SALLE A
    PRODUIT : il s'accroche desormais AUSSI au depart (quitterLaSalle) —
    echeance, debauchage, renvoi. Les seuils de RANGS filtrent deja, et
    rendre null reste le cas normal.
 2. PERSONNE NE VIEILLISSAIT : proQuiFrappe ne recrutait qu'entre 22 et
    31 ans. Fenetre ouverte a 34 — un veteran qui vient chercher un
    dernier titre chez toi, c'est le reel, et c'est ce qui donne une
    memoire a la salle. Retraite : 36 -> 35 ans, 0,22 -> 0,28 par
    anniversaire, et la condition serie===0 assouplie (a 38 ans il y
    pense MEME EN GAGNANT — avant, un veteran qui gagnait encore ne
    raccrochait jamais). Ca reste une PROPOSITION, jamais une
    imposition.
 3. LES RIVALITES MOURAIENT EN 36 JOURS : defaite 30, seuil vivante 25,
    refroidissement 0,14/jour. Poids rehausses (defaite 45, revanche 60,
    ceinture 72, vole 32, salle 36) et refroidissement a 100/1460 (quatre
    ans au lieu de deux). Durees visees : defaite ~10 mois, revanche
    ~1,4 an, ceinture ~1,9 an. Les deux invariants du banc 30 FIXENT les
    chiffres : `trash` reste sous 25 (les mots seuls ne font pas une
    rivalite) et trash+defaite (63) doit rester au-dessus de revanche
    seule (60) — d'ou 45 et non 42.
MESURE APRES — memes graine et duree :
    MUR 2 plaques · rivalites 52 vivantes sur 317 (16 %) · 536 combats
/!\ UNE ASSERTION DU BANC 30 A ETE REECRITE, ET C'EST IMPORTANT : « la
plus chaude passe devant » exigeait que trash+defaite batte deux
defaites — vrai SEULEMENT avec l'ancien refroidissement, ou la premiere
defaite etait eteinte quand la revanche tombait. Avec le refroidissement
lent, la chaleur RESIDUELLE compte et la repetition pese : c'est le
comportement juste. Le banc testait un classement accidentel ; il teste
maintenant la regle (la liste est triee) et le fait (deux defaites
pesent plus). On ne change pas un banc pour le faire passer — on le
change quand il testait un accident.

## CAS 156 — LE RETRAITE FANTOME (trouve en mesurant, 31/08)
Des que les retraites sont devenues possibles, le singe a leve
« salle.js : id inconnu -50 » en preparant un combat. Un homme qui
raccroche est retire de MONDE.pros — mais lui survivaient : son ECHEANCE
de combat, son OFFRE en attente, et le combatPrevu de son adversaire de
duel interne. Le jeu allait chercher un homme qui n'existe plus, et le
soir de combat mourait.
LE DEFAUT EXISTAIT DEPUIS TOUJOURS ; il dormait parce que personne ne
raccrochait jamais — meme classe que le cas 131 (le soir de combat
ecrase) : une porte rarement ouverte reste une porte. purgerReferences()
nettoie echeances, offres, combatPrevu des autres et COMBAT1, AVANT la
disparition — et elle est branchee aux DEUX sorties (raccrocher et
quitterLaSalle), parce qu'un homme peut partir de deux facons.
LECON : c'est la MESURE qui a trouve le bug, pas la lecture. Un
mecanisme qu'on debloque reveille tout ce qui dormait derriere.

## CAS 157 — ON PEUT ENFIN DEMANDER AU MATCHMAKER (Mael, 01/09)
« Les relations avec le matchmaker… même des fois un combattant me
demande un nom par ex, je peux pas le demander en retour. »
LE MANQUE, en deux morceaux :
 1. LA RELATION ETAIT SUBIE. Elle montait et descendait sur ce qui se
    passait (accepter, refuser, finir, rater une pesee), et on pouvait
    PARLER au matchmaker — quatre repliques qui bougent la relation —
    mais on ne pouvait RIEN DEMANDER.
 2. /!\ ET LE PIRE, LA PLAIE DU CARNET UNE FOIS DE PLUS : quand un
    combattant reclamait un adversaire (demande `cet_adversaire`), le jeu
    posait `l.cibleVoulue = true`… et CETTE VARIABLE N'ETAIT LUE NULLE
    PART. La demande mourait la. « Une chose branchee nulle part ne fait
    rien et ne leve pas » — cinquieme fois qu'elle nous prend.
CE QUI EST CONSTRUIT (module matchmaker.js, banc 35) :
 - quatre demandes : une DATE (seuil de relation 30), un ADVERSAIRE
   NOMME (48, + 6 par rang au-dessus — viser plus haut est plus dur,
   meme principe que la montee), le HAUT DE CARTE (62), la BOURSE (55) ;
 - ON DEMANDE, ON N'EXIGE PAS : la decision SE CALCULE (meme relation,
   meme reponse — le joueur peut apprendre les regles), jamais un tirage ;
 - DEMANDER COUTE : `echange_juste` ou `exigence` quand ca passe,
   toujours une exigence quand ca rate ; une demande par orga tous les
   40 jours, sinon un manager qui appelle sans arret n'est plus ecoute ;
 - LA FAVEUR EST UN DU DATE, et elle CHANGE LA PROCHAINE OFFRE : la date
   coupe l'attente de moitie, l'adversaire vise passe AVANT la cible du
   joueur, le haut de carte pose main_event + 5 rounds + 25 % de bourse,
   la bourse ajoute 18 %. Elle SE CONSOMME a l'usage — un oui ne vaut pas
   pour toute la carriere — et le matchmaker oublie au bout de 90-120
   jours ;
 - le contexte porte maintenant `rivalId` en plus de `rival` : le NOM ne
   suffisait pas, il fallait l'identifiant pour aller le demander.
LE CHEMIN COMPLET, ferme : ton homme reclame un nom -> tu dis oui ->
l.cibleReclamee retient QUI -> l'ecran du matchmaker te le propose en
tete -> il accepte -> l'offre suivante vise cet homme -> et le recit le
dit (« 🤝 L'adversaire que tu reclamais »).
Banc 27 : huit assertions de plus, dont la seule qui compte vraiment —
une faveur « haut de carte » sort une offre en main event.

## CAS 158 — LE DÎNER DEVIENT UNE SOIRÉE (Mael, 01/09)
« Les dîners avec matchmaker, je veux que ce soit une nouvelle fenêtre
comme on a fait avec combat et recrutement, et beaucoup beaucoup plus de
dialogue, de réponses, de questions. Prends ton temps. »
CE QU'IL Y AVAIT : trois questions, neuf réponses, dans le petit
panneau. Un couloir, et on en voyait le bout au premier dîner.
CE QU'IL Y A : une PAGE ANNEXE plein écran (la troisième, après l'écran
de combat et la soirée de scouting) — ambiance de salle de restaurant,
bois sombre et lumière basse — et DIX MOMENTS qui s'enchaînent :
l'arrivée · l'apéritif (ce qu'il veut savoir de vous) · l'entrée (ce
qu'il pense de vos hommes) · le plat (comment on fabrique une carte) ·
la télé et l'argent · le vin (les concurrentes) · entre nous (ce qui ne
se dit pas) · le fromage (l'homme derrière le métier) · le café (le
moment de demander) · l'addition.
LA MÉCANIQUE (diner.js, banc 36) — quatre règles :
 1. AUCUN TIRAGE : la scène de chaque moment est DÉRIVÉE (organisation +
    jour). Deux fois le même dîner le même jour = la même soirée ;
 2. LA SOIRÉE SAIT OÙ ELLE EST : chaque scène porte une condition d'une
    LISTE FERMÉE (premier dîner ? relation froide ? un champion à la
    salle ?). Un matchmaker qui parle de votre champion quand vous n'en
    avez pas, c'est un dialogue mort ;
 3. UNE RÉPONSE PEUT OUVRIR UN SUJET (`ouvre`) — c'est ce qui fait une
    conversation et pas un formulaire. Une fois par soirée ;
 4. PARTIR EN COURS DE REPAS SOLDE LA SOIRÉE. Sans ça on relancerait un
    dîner raté jusqu'à ce qu'il soit bon.
LE CONTENU (diner_scenes.js) a été écrit par une ESCOUADE DE DIX AGENTS
en parallèle — un par moment du repas — puis RELU par dix autres
(français, ton, longueur, doublons, équilibre des effets). Le banc 36 le
vérifie ensuite COMME UNE DONNÉE, parce qu'un texte écrit par une IA est
exactement ce qui oublie les règles : conditions dans la liste fermée,
clés uniques, renvois qui aboutissent, AUCUN CHIFFRE à l'écran, effets
bornés, de vrais mauvais choix, aucune scène écrite deux fois — et LE
VOLUME, qui est la demande de Mael et qui se mesure.
