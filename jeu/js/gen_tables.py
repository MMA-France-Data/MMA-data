"""
gen_tables.py — genere js/tables.js DEPUIS les modules Python.

POURQUOI GENERER PLUTOT QUE RETAPER
ground_v2 et clinch contiennent plusieurs centaines de constantes calibrees
a la main. Les retaper serait la facon la plus sure d'introduire une erreur
qu'aucun test ne rattraperait facilement : une valeur fausse sur trois cents
ne se voit pas dans une moyenne. On les EXPORTE, donc elles ne peuvent pas
diverger. Seule la LOGIQUE est portee a la main — et elle, elle est couverte
par les bancs de conformite.

A relancer apres toute modification d'une table cote Python.
"""
import json
import sys

sys.path.insert(0, "..")
import ground_v2 as G
import clinch as C
import striking_v2 as S
import generator as GEN

TABLES = [
    ("POSITIONS", G.POSITIONS), ("TRANSITIONS", G.TRANSITIONS),
    ("ECHAPPATOIRES", G.ECHAPPATOIRES), ("SOUMISSIONS_TOP", G.SOUMISSIONS_TOP),
    ("SOUMISSIONS_BOTTOM", G.SOUMISSIONS_BOTTOM),
    ("TECHNIQUES_ESCAPE", G.TECHNIQUES_ESCAPE),
    ("PRISES", C.PRISES), ("SORTIES", C.SORTIES),
    ("FRAPPES_CLINCH", C.FRAPPES_CLINCH), ("FRAPPES_RUPTURE", C.FRAPPES_RUPTURE),
    ("SEUIL_SIGNIFICATIF", C.SEUIL_SIGNIFICATIF),
    ("ARMES", S.ARMES), ("ESQUIVABILITE", S.ESQUIVABILITE),
    ("ARCHETYPES", GEN.ARCHETYPES), ("PRENOMS", GEN.PRENOMS),
    ("NOMS", GEN.NOMS), ("SURNOMS", GEN.SURNOMS),
    ("VOLUME_ARCHETYPE", GEN.VOLUME_ARCHETYPE),
]


def js(v):
    """Les tuples Python deviennent des tableaux JS ; le reste passe par JSON."""
    if isinstance(v, tuple):
        return "[" + ", ".join(js(x) for x in v) + "]"
    if isinstance(v, list):
        return "[" + ", ".join(js(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{" + ", ".join(f"{json.dumps(str(k), ensure_ascii=False)}: {js(x)}"
                               for k, x in v.items()) + "}"
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    return json.dumps(v, ensure_ascii=False)


if __name__ == "__main__":
    out = ["/**", " * tables.js — GENERE PAR gen_tables.py. NE PAS EDITER A LA MAIN.",
           " * Toute correction se fait dans ground_v2.py / clinch.py puis :",
           " *     python3 js/gen_tables.py", " */", ""]
    for nom, table in TABLES:
        out.append(f"const {nom} = {js(table)};\n")
    out.append("module.exports = { " + ", ".join(n for n, _ in TABLES) + " };")
    open("tables.js", "w").write("\n".join(out))
    n = sum(len(t) if hasattr(t, "__len__") else 1 for _, t in TABLES)
    print(f"tables.js ecrit — {len(TABLES)} tables, {n} entrees")
