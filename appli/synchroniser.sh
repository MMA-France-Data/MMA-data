#!/bin/sh
# synchroniser.sh — fabrique www/ DEPUIS jeu/. REGLE DU CARNET : www/ est
# un ARTEFACT, jamais edite a la main — le jeu vit dans jeu/, une seule
# source. Le pont Android (pont_android.js) est le SEUL ajout : il est
# annexe par une balise script juste avant </body>.
set -e
ici="$(cd "$(dirname "$0")" && pwd)"
jeu="$ici/../jeu"
rm -rf "$ici/www"
mkdir -p "$ici/www/js"
cp "$jeu/js/moteur.bundle.js" "$jeu/js/ecran.gabarit.js" "$jeu/js/assets.js" "$jeu/js/trois.js" "$ici/www/js/"
# index.html = demo_jeu.html + le pont, rien d'autre.
sed 's#</body>#<script src="pont_android.js"></script></body>#' "$jeu/demo_jeu.html" > "$ici/www/index.html"
cp "$ici/pont_android.js" "$ici/www/pont_android.js"
# Garde-fou : le www doit etre le jeu, au pont pres.
n=$(grep -c 'pont_android.js' "$ici/www/index.html")
[ "$n" = "1" ] || { echo "synchroniser.sh : le pont n'est pas annexe exactement une fois ($n)"; exit 1; }
echo "www/ fabriqué depuis jeu/ — $(ls "$ici/www/js" | wc -l) modules js + index.html + pont."
