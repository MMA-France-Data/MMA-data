// OutilsMMA.cs — le menu « MMA » de l'editeur : de quoi montrer a Claude
// ce qui se passe, sans capture d'ecran a la main.
using System.IO;
using UnityEditor;
using UnityEngine;

public static class OutilsMMA
{
    [MenuItem("MMA/Ouvrir le dossier du rapport")]
    static void Ouvrir()
    {
        Directory.CreateDirectory(RapportMMA.Dossier);
        EditorUtility.RevealInFinder(RapportMMA.Dossier + Path.DirectorySeparatorChar);
    }

    [MenuItem("MMA/Reconstruire l'Animator maintenant")]
    static void Reconstruire()
    {
        AssetDatabase.Refresh();
        Debug.Log("[MMA] Refresh demandé — l'importateur relit Resources/Combattants.");
    }
}
