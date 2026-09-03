"""Les tables de traduction cle du jeu → libelle du tableau. UNE seule copie :
l'exportateur les lit a l'aller, l'importateur les inverse au retour."""
EFF = {"promettre_argent": "Promesse d'augmentation (datée)", "monter_au_bareme": "Salaire monte au tarif tout de suite",
       "lui_lacher_une_case": "Il lâche un domaine", "lui_donner_une_case": "Il prend un domaine de plus",
       "lui_confier_un_gars": "Le combattant passe sous son aile", "lui_rendre_un_gars": "Il rend son poulain",
       "le_mettre_au_coin": "Il sera dans le coin au prochain combat", "menager_un_gars": "Le combattant lève le pied",
       "arbitrer_pour_lui": "Tu lui donnes raison (contre l'autre coach)", "arbitrer_contre_lui": "Tu donnes raison à l'autre coach",
       "l_envoyer_se_former": "Il part en stage (ça coûte)", "accepter_son_depart": "Il quitte la salle", "le_retenir": "Tu surenchéris, il reste"}
DECL = {"toujours": "toujours", "neuf": "nouveau à la salle (< 6 mois)", "ancien": "ancien (3 ans+)", "vieux": "56 ans et plus",
        "formateur": "coach formateur", "competition": "coach de compétition", "sous_paye": "sous-payé", "bien_paye": "bien payé",
        "disperse": "dispersé (3 domaines+)", "concentre": "un seul domaine", "sans_case": "aucun domaine", "froid": "relation froide",
        "tiede": "relation tiède", "chaud": "relation chaude", "il_monte": "en progression", "a_son_sommet": "à son sommet",
        "parle_de_l_apres": "pense à l'après", "fin_proche": "dernière saison", "un_trou_a_cote": "un domaine vide à côté",
        "partage_sa_case": "partage un domaine", "seul_au_staff": "seul au staff", "salle_pleine": "salle pleine",
        "a_un_poulain": "il a un poulain", "a_un_crame": "un gars à bout dans la salle", "a_un_espoir": "un espoir dans la salle",
        "apres_victoire": "après une victoire", "apres_defaite": "après une défaite", "apres_titre": "après un titre",
        "apres_un_depart": "après un départ", "je_lui_ai_promis": "tu lui as promis qqch", "je_l_ai_recadre": "tu l'as recadré",
        "je_ne_tiens_jamais_parole": "tu ne tiens jamais parole", "je_lui_ai_toujours_dit_oui": "tu lui dis toujours oui",
        "son_poulain": "le gars choisi est SON poulain", "pas_son_poulain": "le gars choisi n'est pas le sien",
        "gars_jeune": "le gars choisi est jeune", "gars_vieux": "le gars choisi est vieux", "gars_cuit": "le gars choisi est à bout",
        "gars_lance": "le gars choisi est sur une série", "gars_qui_doute": "le gars choisi n'y arrive plus", "gars_blesse": "le gars choisi est blessé"}
