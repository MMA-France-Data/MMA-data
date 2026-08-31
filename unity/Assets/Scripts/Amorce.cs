// Amorce.cs — le lecteur se lance TOUT SEUL : ouvre n'importe quelle
// scene (meme vide), appuie sur Play, le combat se rejoue. Aucun objet
// a poser a la main pour la premiere fois.
using UnityEngine;

public static class Amorce
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Lancer()
    {
        if (Object.FindFirstObjectByType<LecteurPartition>() == null)
        {
            var go = new GameObject("Lecteur de partition");
            go.AddComponent<LecteurPartition>();
            // Le pont avec Claude : Unity ecrit lui-meme ce qu'il voit
            // (rapport + captures dans RapportMMA/ a cote du projet).
            go.AddComponent<RapportMMA>();
        }
    }
}
