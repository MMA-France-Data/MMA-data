// ImportateurCombattants.cs — TOUT L'ATELIER EN AUTOMATIQUE.
//
// Mael (31/08) : « tu peux pas faire tout ça pour moi ? » — si. Ce
// script d'éditeur fait les clics à ta place. TON SEUL TRAVAIL :
// déposer les FBX Mixamo (le personnage + les animations) dans le
// dossier  Assets/Resources/Combattants/  (crée-le s'il n'existe pas).
// À chaque dépôt, ce script :
//   1. règle le rig en HUMANOID (le réglage qui fait tout marcher) ;
//   2. extrait les textures (fini le personnage tout blanc) ;
//   3. met les idles en boucle ;
//   4. (re)construit l'Animator « Combattant » en devinant l'état
//      d'après le NOM du fichier : idle→garde · punch/hook/cross→frappe
//      · kick→kick · knock/uppercut/hit→chute · victory→fin ·
//      grapple→clinch · sweep/takedown→amenee · ground/prone→sol ;
//   5. le lecteur, lui, instancie le personnage TOUT SEUL depuis ce
//      dossier — plus rien à glisser dans la scène.
// Résultat : déposer les fichiers, appuyer sur Play.
using System.IO;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;

public class ImportateurCombattants : AssetPostprocessor
{
    const string DOSSIER = "Assets/Resources/Combattants";

    static bool DansLeDossier(string chemin) =>
        chemin.Replace('\\', '/').StartsWith(DOSSIER);

    void OnPreprocessModel()
    {
        if (!DansLeDossier(assetPath)) return;
        var imp = (ModelImporter)assetImporter;
        imp.animationType = ModelImporterAnimationType.Human;
        imp.materialImportMode = ModelImporterMaterialImportMode.ImportStandard;
    }

    void OnPreprocessAnimation()
    {
        if (!DansLeDossier(assetPath)) return;
        var imp = (ModelImporter)assetImporter;
        var clips = imp.defaultClipAnimations;
        if (clips == null || clips.Length == 0) return;
        string nom = Path.GetFileNameWithoutExtension(assetPath).ToLowerInvariant();
        bool boucle = nom.Contains("idle") || nom.Contains("grapple")
                   || nom.Contains("clinch") || nom.Contains("ground");
        foreach (var c in clips) c.loopTime = boucle;
        imp.clipAnimations = clips;
    }

    void OnPostprocessModel(GameObject go)
    {
        if (!DansLeDossier(assetPath)) return;
        try { ((ModelImporter)assetImporter).ExtractTextures(DOSSIER); }
        catch { /* deja extraites : tant mieux */ }
    }

    static string EtatPour(string nomFichier)
    {
        string n = nomFichier.ToLowerInvariant();
        if (n.Contains("idle")) return "garde";
        if (n.Contains("kick")) return "kick";
        if (n.Contains("punch") || n.Contains("jab") || n.Contains("cross")
            || n.Contains("hook") || n.Contains("elbow")) return "frappe";
        if (n.Contains("knock") || n.Contains("uppercut") || n.Contains("death")
            || n.Contains("dying") || n.Contains("stunned") || n.Contains("hit")) return "chute";
        if (n.Contains("victory") || n.Contains("cheer") || n.Contains("taunt")) return "fin";
        if (n.Contains("grapple") || n.Contains("clinch")) return "clinch";
        if (n.Contains("sweep") || n.Contains("takedown")) return "amenee";
        if (n.Contains("ground") || n.Contains("prone") || n.Contains("crawl")) return "sol";
        return null;
    }

    static void OnPostprocessAllAssets(string[] importes, string[] _, string[] __, string[] ___)
    {
        foreach (var a in importes)
            if (DansLeDossier(a) && a.ToLowerInvariant().EndsWith(".fbx"))
            {
                EditorApplication.delayCall += ConstruireControleur;
                return;
            }
    }

    static void ConstruireControleur()
    {
        if (!Directory.Exists(DOSSIER)) return;
        string chemin = DOSSIER + "/Combattant.controller";
        AssetDatabase.DeleteAsset(chemin);
        var ctrl = AnimatorController.CreateAnimatorControllerAtPath(chemin);
        var sm = ctrl.layers[0].stateMachine;
        int n = 0;
        foreach (var guid in AssetDatabase.FindAssets("t:AnimationClip", new[] { DOSSIER }))
        {
            string cheminClip = AssetDatabase.GUIDToAssetPath(guid);
            string etat = EtatPour(Path.GetFileNameWithoutExtension(cheminClip));
            if (etat == null || Deja(sm, etat)) continue;
            AnimationClip clip = null;
            foreach (var o in AssetDatabase.LoadAllAssetsAtPath(cheminClip))
                if (o is AnimationClip c && !c.name.StartsWith("__preview__")) { clip = c; break; }
            if (clip == null) continue;
            var st = sm.AddState(etat);
            st.motion = clip;
            if (etat == "garde") sm.defaultState = st;
            n++;
        }
        AssetDatabase.SaveAssets();
        Debug.Log($"[MMA] Animator « Combattant » reconstruit — {n} état(s) branché(s). " +
                  "Dépose d'autres FBX dans Resources/Combattants pour en ajouter.");
    }

    static bool Deja(AnimatorStateMachine sm, string nom)
    {
        foreach (var s in sm.states) if (s.state.name == nom) return true;
        return false;
    }
}
