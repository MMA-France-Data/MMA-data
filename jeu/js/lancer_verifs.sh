#!/bin/sh
# Rejoue TOUTE la chaine de verification du portage, du RNG au protocole.
# Le Python de ce depot est le TEMOIN HISTORIQUE (bascule du 08/08) : il ne
# doit plus etre modifie, et cette chaine le prouve a chaque execution.
set -e
cd "$(dirname "$0")"
python3 gen_tables.py
python3 gen_reference.py     && node verifier_alea.js
python3 gen_ref_modules.py   && node verifier_modules.js
python3 gen_ref_sol.py       && node verifier_sol.js
python3 gen_ref_striking.py  && node verifier_striking.js
python3 gen_ref_clinch.py    && node verifier_clinch.js
# /!\ LE MOTEUR N'EST PLUS COMPARE A PYTHON (decision de Mael, 10/08).
# Le chantier D a laisse engine.py derriere : la geometrie vit dans le JS.
# La reference est produite par le JS, ce banc est une NON-REGRESSION.
# On NE la regenere PAS ici — sinon le banc se comparerait a ce qu'il vient
# d'ecrire et ne verifierait plus rien. Regeneration volontaire :
#     node gen_ref_engine_js.js
node verifier_engine.js
python3 gen_ref_traducteur.py && node verifier_traducteur.js
node verifier_fiches.js
node verifier_verdict.js
node verifier_feuille.js
node verifier_coin.js
node verifier_classement.js
node verifier_etoiles.js
node verifier_grappling.js
node verifier_carriere.js
node verifier_vivier.js
node verifier_cartes.js
node verifier_relation.js
node verifier_offres.js
node verifier_entente.js
node verifier_salle.js
node verifier_contrats.js
node verifier_cris.js
node verifier_direct.js
node gen_assets.js
node gabarit.js              && node verifier_gabarit.js
node verifier_ressenti.js
node verifier_demandes_staff.js
node verifier_endgame.js
node verifier_vestiaire.js
node verifier_soiree.js
node verifier_choregraphie.js
node verifier_matchmaker.js
node bundler.js               && node verifier_bundle.js
node verifier_assets.js
# BANC 27 — le singe : il charge demo_jeu.html et JOUE. Il vient APRES le
# bundler, parce qu'il charge le bundle : sur un bundle perime, il mesure
# le jeu d'hier. (lecon du 09/08 : "le bundle ne se regenere pas tout seul")
node verifier_partie.js
echo "--- tous les modules portes sont conformes ---"
echo "--- critere de bascule (3 graines, ~2 min) : node mesure.js 11 41 900 ---"
