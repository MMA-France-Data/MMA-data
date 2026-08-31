// Partition.cs — le format NEUTRE exporte par jeu/js/exporter_partition.js.
// Un temps = un fait du combat, deja tranche par le jeu (regle 7 : Unity
// ne decide de rien, il MONTRE).
using System;
using System.Collections.Generic;

[Serializable]
public class Temps
{
    public float t;                       // seconde du combat
    public float xa, za, xb, zb;          // positions normalisees (-1..1)
    public string ph;                     // DISTANCE, CLINCH, SOL, KO...
    public string geste;                  // garde, frappe, amenee, sol, soumission, chute, clinch, fin
    public string qui;                    // "A" ou "B" (qui fait le geste)
    public string zone;                   // tete, corps, jambes (pour une frappe)
    public int fl;                        // 1 = temps fort (flash)
    public string com;                    // la phrase du traducteur — le meme texte que le jeu
}

[Serializable]
public class Partition
{
    public string nomA;
    public string nomB;
    public int graine;
    public List<Temps> beats;
}
