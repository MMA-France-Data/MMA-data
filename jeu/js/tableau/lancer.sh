#!/bin/sh
# aller  : sh lancer.sh sortir  → dialogues_coachs.xlsx a cote
# retour : sh lancer.sh rentrer dialogues_coachs.xlsx  → coach_scenes.js reecrit, puis banc 39
set -e; cd "$(dirname "$0")"
case "$1" in
  sortir)  node vider_coachs.js > /tmp/coach_rows.json && python3 exporter_coachs.py /tmp/coach_rows.json dialogues_coachs.xlsx ;;
  rentrer) python3 importer_coachs.py "$2" /tmp/retours.json && node remettre_coachs.js /tmp/retours.json && (cd .. && node verifier_coach_scenes.js) ;;
  *) echo "sortir | rentrer fichier.xlsx" ;;
esac
