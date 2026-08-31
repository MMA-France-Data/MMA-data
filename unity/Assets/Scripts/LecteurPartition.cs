// LecteurPartition.cs — LE LECTEUR : il joue la partition, il n'invente
// rien (regle 7 du carnet du jeu). Le combat a deja eu lieu dans le
// moteur ; ici on le MONTRE.
//
// Sans rien faire : deux capsules (rouge/bleu) rejouent le combat de
// StreamingAssets/partition.json — positions reelles, sous-titres du
// traducteur.
//
// POUR REMPLACER LES CAPSULES PAR UN VRAI PERSONNAGE (Mixamo) :
//   1. importe ton personnage dans Assets/ ;
//   2. glisse-le DEUX FOIS dans la scene ;
//   3. renomme les deux objets exactement : CombattantA  et  CombattantB ;
//   4. (optionnel) pose un Animator Controller avec des etats nommes
//      garde, frappe, amenee, sol, soumission, chute, clinch, fin —
//      le lecteur les declenchera par leur nom. Sans Animator, il
//      bouge quand meme (positions + elans).
using System.IO;
using UnityEngine;

public class LecteurPartition : MonoBehaviour
{
    const float RAYON = 3.9f;        // rayon de la cage en metres Unity
    const float CADENCE = 1.15f;     // secondes par temps de partition

    Partition partition;
    int index = -1;
    float horloge;
    bool fini;

    Transform A, B;
    Animator animA, animB;
    Vector3 cibleA, cibleB;
    float coucheA, coucheB;          // 0 debout · 1 dessus · 2 au sol
    float elanA, elanB;              // l'elan d'une frappe (0..1 -> 0)

    void Start()
    {
        Charger();
        PreparerScene();
        Avancer();
    }

    void Charger()
    {
        var chemin = Path.Combine(Application.streamingAssetsPath, "partition.json");
        if (!File.Exists(chemin))
        {
            Debug.LogError("partition.json introuvable dans StreamingAssets — " +
                           "genere-la avec : node jeu/js/exporter_partition.js");
            partition = new Partition { nomA = "?", nomB = "?", beats = new System.Collections.Generic.List<Temps>() };
            fini = true;
            return;
        }
        partition = JsonUtility.FromJson<Partition>(File.ReadAllText(chemin));
    }

    void PreparerScene()
    {
        // La camera et la lumiere : on prend celles de la scene, ou on les cree.
        if (Camera.main == null)
        {
            var cam = new GameObject("Camera").AddComponent<Camera>();
            cam.tag = "MainCamera";
        }
        Camera.main.backgroundColor = new Color(0.02f, 0.03f, 0.05f);
        Camera.main.clearFlags = CameraClearFlags.SolidColor;
        if (Object.FindFirstObjectByType<Light>() == null)
        {
            var lum = new GameObject("Lumiere").AddComponent<Light>();
            lum.type = LightType.Directional;
            lum.transform.rotation = Quaternion.Euler(55f, -30f, 0f);
        }

        // Le sol et la cage.
        var sol = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        sol.name = "Sol";
        sol.transform.localScale = new Vector3(RAYON * 2.3f, 0.05f, RAYON * 2.3f);
        sol.transform.position = new Vector3(0, -0.05f, 0);
        Colorer(sol, new Color(0.10f, 0.12f, 0.16f));
        var or = new Color(0.72f, 0.54f, 0.17f);
        for (int i = 0; i < 8; i++)
        {
            float a = i / 8f * Mathf.PI * 2f;
            var poteau = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            poteau.name = "Poteau " + i;
            poteau.transform.localScale = new Vector3(0.08f, 1.1f, 0.08f);
            poteau.transform.position = new Vector3(Mathf.Cos(a) * (RAYON + 0.4f), 1.1f, Mathf.Sin(a) * (RAYON + 0.4f));
            Colorer(poteau, or);
        }

        // Les deux hommes : tes personnages s'ils existent, des capsules sinon.
        A = TrouverOuCreer("CombattantA", new Color(0.76f, 0.23f, 0.23f));
        B = TrouverOuCreer("CombattantB", new Color(0.18f, 0.44f, 0.82f));
        animA = A.GetComponentInChildren<Animator>();
        animB = B.GetComponentInChildren<Animator>();
        A.position = new Vector3(-1.2f, 0, 0);
        B.position = new Vector3(1.2f, 0, 0);
        cibleA = A.position; cibleB = B.position;
    }

    static GameObject modeleCache;
    static RuntimeAnimatorController ctrlCache;
    static bool rechercheFaite;

    Transform TrouverOuCreer(string nom, Color couleur)
    {
        var existant = GameObject.Find(nom);
        if (existant != null) return existant.transform;
        // LA VOIE AUTOMATIQUE (31/08) : si un personnage vit dans
        // Resources/Combattants (depose par l'importateur), on
        // l'instancie nous-memes — plus rien a glisser dans la scene.
        if (!rechercheFaite)
        {
            rechercheFaite = true;
            ctrlCache = Resources.Load<RuntimeAnimatorController>("Combattants/Combattant");
            foreach (var go in Resources.LoadAll<GameObject>("Combattants"))
                if (go.GetComponentInChildren<SkinnedMeshRenderer>() != null)
                { modeleCache = go; break; }
        }
        if (modeleCache != null)
        {
            var inst = Instantiate(modeleCache);
            inst.name = nom;
            var an = inst.GetComponentInChildren<Animator>();
            if (an == null) an = inst.AddComponent<Animator>();
            if (an.runtimeAnimatorController == null && ctrlCache != null)
                an.runtimeAnimatorController = ctrlCache;
            // La partition commande les positions, pas l'animation :
            // sans ca, un clip qui avance ferait deriver le combattant.
            an.applyRootMotion = false;
            return inst.transform;
        }
        var caps = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        caps.name = nom;
        caps.transform.localScale = new Vector3(0.55f, 0.9f, 0.55f);
        Colorer(caps, couleur);
        var racine = new GameObject(nom + " (capsule)");
        caps.transform.SetParent(racine.transform);
        caps.transform.localPosition = new Vector3(0, 0.9f, 0);
        return racine.transform;
    }

    static void Colorer(GameObject go, Color c)
    {
        var r = go.GetComponent<Renderer>();
        if (r != null) r.material.color = c;
    }

    void Avancer()
    {
        index++;
        if (partition.beats == null || index >= partition.beats.Count) { fini = true; return; }
        var b = partition.beats[index];
        cibleA = new Vector3(b.xa * RAYON, 0, b.za * RAYON);
        cibleB = new Vector3(b.xb * RAYON, 0, b.zb * RAYON);
        bool auSol = b.geste == "sol" || b.geste == "soumission" || b.geste == "amenee";
        coucheA = auSol ? (b.qui == "A" ? 1 : 2) : (b.geste == "chute" && b.qui == "A" ? 2 : 0);
        coucheB = auSol ? (b.qui == "B" ? 1 : 2) : (b.geste == "chute" && b.qui == "B" ? 2 : 0);
        if (b.geste == "frappe") { if (b.qui == "A") elanA = 1f; else elanB = 1f; }
        Jouer(animA, b, "A");
        Jouer(animB, b, "B");
    }

    static bool AEtat(Animator an, string nom) =>
        an.HasState(0, Animator.StringToHash(nom));

    static void Jouer(Animator anim, Temps b, string cote)
    {
        if (anim == null || anim.runtimeAnimatorController == null) return;
        string etat;
        if (b.qui == cote)
        {
            etat = b.geste;
            if (b.geste == "frappe" && b.zone == "jambes" && AEtat(anim, "kick"))
                etat = "kick";
        }
        else etat = (b.geste == "frappe" || b.geste == "garde") ? "garde" : b.geste;
        if (!AEtat(anim, etat))
        {
            if (!AEtat(anim, "garde")) return;
            etat = "garde";
        }
        anim.CrossFade(etat, 0.15f);
    }

    void Update()
    {
        if (partition == null) return;
        horloge += Time.deltaTime;
        if (!fini && horloge >= CADENCE) { horloge = 0; Avancer(); }

        Bouger(A, ref elanA, cibleA, coucheA, B);
        Bouger(B, ref elanB, cibleB, coucheB, A);

        // La camera orbite doucement autour du centre des deux hommes.
        var milieu = (A.position + B.position) * 0.5f;
        float ang = Time.time * 0.12f;
        var cam = Camera.main.transform;
        cam.position = milieu + new Vector3(Mathf.Cos(ang) * 6.5f, 3.2f, Mathf.Sin(ang) * 6.5f);
        cam.LookAt(milieu + Vector3.up * 0.9f);
    }

    void Bouger(Transform h, ref float elan, Vector3 cible, float couche, Transform autre)
    {
        var but = cible;
        if (elan > 0.01f)
        {
            // L'elan d'une frappe : un pas vif vers l'autre, puis retour.
            but = Vector3.Lerp(cible, autre.position, 0.25f * Mathf.Sin(elan * Mathf.PI));
            elan = Mathf.MoveTowards(elan, 0f, Time.deltaTime * 2.2f);
        }
        h.position = Vector3.Lerp(h.position, but, Time.deltaTime * 4f);
        var regard = autre.position - h.position; regard.y = 0;
        if (regard.sqrMagnitude > 0.001f)
            h.rotation = Quaternion.Slerp(h.rotation, Quaternion.LookRotation(regard), Time.deltaTime * 6f);
        // Debout, dessus, au sol : l'inclinaison du corps.
        float viseX = couche > 0 ? 80f : 0f;
        float viseY = couche == 1 ? 0.45f : couche == 2 ? 0.1f : 0f;
        var e = h.eulerAngles;
        float x = Mathf.LerpAngle(e.x, viseX, Time.deltaTime * 5f);
        h.rotation = Quaternion.Euler(x, e.y, 0);
        var p = h.position;
        p.y = Mathf.Lerp(p.y, viseY, Time.deltaTime * 5f);
        h.position = p;
    }

    void OnGUI()
    {
        if (partition == null) return;
        var style = new GUIStyle(GUI.skin.box)
        { fontSize = 16, alignment = TextAnchor.MiddleLeft, wordWrap = true, padding = new RectOffset(12, 12, 8, 8) };
        GUI.Box(new Rect(10, 10, Screen.width - 20, 32),
            $"{partition.nomA}  c.  {partition.nomB} — la partition rejoue le réel", style);
        string texte = "…";
        if (partition.beats != null && index >= 0 && index < partition.beats.Count)
            texte = $"{index + 1}/{partition.beats.Count}  {partition.beats[index].com}";
        if (fini) texte += "   — fin du combat.";
        GUI.Box(new Rect(10, Screen.height - 78, Screen.width - 20, 66), texte, style);
    }
}
