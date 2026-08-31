// RapportMMA.cs — LE PONT AVEC CLAUDE (Mael, 31/08 : « si je pouvais te
// lier avec Unity ça serait plus simple »).
//
// Il n'y a pas de fil entre l'editeur et Claude. Alors Unity ecrit
// lui-meme ce que Claude ne peut pas voir : au Play, ce composant pose
// un RAPPORT et des CAPTURES dans le dossier RapportMMA/ a cote du
// projet. Mael envoie le dossier, Claude lit — plus de devinettes.
//
// /!\ Il ne touche a RIEN : il regarde, il ecrit. Aucun effet sur la
// scene, aucun effet sur le lecteur.
using System.Collections;
using System.IO;
using System.Text;
using UnityEngine;

public class RapportMMA : MonoBehaviour
{
    // Les instants ou l'on capture (secondes apres le lancement).
    static readonly float[] INSTANTS = { 1.5f, 6f, 14f, 28f, 50f };

    public static string Dossier =>
        Path.GetFullPath(Path.Combine(Application.dataPath, "..", "RapportMMA"));

    void Start() { StartCoroutine(Tourner()); }

    IEnumerator Tourner()
    {
        Directory.CreateDirectory(Dossier);
        // On laisse une frame au lecteur pour monter sa scene.
        yield return null;
        yield return new WaitForSeconds(1f);
        Ecrire(Etat());

        int n = 0;
        float depart = Time.time;
        foreach (var t in INSTANTS)
        {
            while (Time.time - depart < t) yield return null;
            yield return new WaitForEndOfFrame();
            string img = Path.Combine(Dossier, $"capture_{++n}.png");
            ScreenCapture.CaptureScreenshot(img);
            Debug.Log($"[MMA] capture {n} → {img}");
        }
        // Un dernier etat, une fois le combat avance.
        Ecrire(Etat(), true);
    }

    /// Ce que Claude a besoin de savoir, en clair.
    static string Etat()
    {
        var b = new StringBuilder();
        b.AppendLine("=== RAPPORT MMA (a envoyer a Claude) ===");
        b.AppendLine($"Unity {Application.unityVersion} · {Application.platform}");
        b.AppendLine($"date : {System.DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        b.AppendLine();

        // 1. la partition
        string p = Path.Combine(Application.streamingAssetsPath, "partition.json");
        b.AppendLine($"partition.json : {(File.Exists(p) ? new FileInfo(p).Length + " octets" : "ABSENTE")}");

        // 2. ce qu'il y a dans le dossier de depot
        string dep = Path.Combine(Application.dataPath, "Resources", "Combattants");
        b.AppendLine($"Resources/Combattants : {(Directory.Exists(dep) ? "présent" : "ABSENT")}");
        if (Directory.Exists(dep))
            foreach (var f in Directory.GetFiles(dep))
                if (!f.EndsWith(".meta"))
                    b.AppendLine($"   · {Path.GetFileName(f)} ({new FileInfo(f).Length / 1024} Ko)");

        // 3. les deux hommes, tels qu'ils sont VRAIMENT dans la scene
        foreach (var nom in new[] { "CombattantA", "CombattantB" })
        {
            var go = GameObject.Find(nom) ?? GameObject.Find(nom + " (capsule)");
            b.AppendLine();
            if (go == null) { b.AppendLine($"{nom} : INTROUVABLE dans la scène"); continue; }
            b.AppendLine($"{nom} : « {go.name} »  pos {go.transform.position}  echelle {go.transform.localScale.x:F3}");
            var rends = go.GetComponentsInChildren<Renderer>();
            if (rends.Length == 0) b.AppendLine("   AUCUN Renderer — rien à afficher !");
            else
            {
                var bb = rends[0].bounds;
                foreach (var r in rends) bb.Encapsulate(r.bounds);
                b.AppendLine($"   {rends.Length} renderer(s) · hauteur {bb.size.y:F2} m · centre {bb.center}");
                b.AppendLine($"   materiau : {rends[0].sharedMaterial?.name ?? "AUCUN"} · shader : {rends[0].sharedMaterial?.shader?.name ?? "?"}");
            }
            var an = go.GetComponentInChildren<Animator>();
            if (an == null) b.AppendLine("   pas d'Animator");
            else
            {
                b.AppendLine($"   Animator : controller = {(an.runtimeAnimatorController != null ? an.runtimeAnimatorController.name : "AUCUN")} · humanoide = {an.isHuman}");
                if (an.runtimeAnimatorController != null)
                {
                    var sb = new StringBuilder();
                    foreach (var c in an.runtimeAnimatorController.animationClips) sb.Append(c.name + " ");
                    b.AppendLine($"   clips : {sb}");
                    foreach (var etat in new[] { "garde", "frappe", "kick", "chute", "clinch", "amenee", "sol", "soumission", "fin" })
                        if (an.HasState(0, Animator.StringToHash(etat))) b.Append($"   état trouvé : {etat}\n");
                }
            }
        }

        // 4. la camera
        if (Camera.main != null)
            b.AppendLine($"\ncamera : pos {Camera.main.transform.position} · fov {Camera.main.fieldOfView}");
        else b.AppendLine("\ncamera : AUCUNE");
        return b.ToString();
    }

    static void Ecrire(string texte, bool fin = false)
    {
        string f = Path.Combine(Dossier, fin ? "rapport_fin.txt" : "rapport.txt");
        File.WriteAllText(f, texte);
        Debug.Log($"[MMA] rapport écrit → {f}");
    }
}
