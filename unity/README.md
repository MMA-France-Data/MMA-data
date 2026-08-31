# Le combat sous Unity — projet compagnon (chantier Q2)

Tu ouvres, tu appuies sur **Play**, un **vrai combat du moteur** se
rejoue : positions réelles dans la cage, sous-titres du traducteur.
Unity ne décide de rien — il **montre** (règle 7 du carnet).

## Ouvrir le projet (jamais touché Unity ? suis dans l'ordre)

1. Installe **Unity Hub** : https://unity.com/download — puis ouvre-le
   et connecte-toi (compte Unity gratuit, licence *Personal*).
2. Dans le Hub : **Projects → Add → Add project from disk** → choisis
   CE dossier (`unity/` du dépôt — bouton vert *Code → Download ZIP*
   sur GitHub si tu n'as pas cloné).
3. Le Hub te proposera d'installer l'éditeur qu'il faut (version
   6000.x « LTS ») — accepte, c'est long la première fois (~10 min).
4. Ouvre le projet. Si Unity propose de « upgrade », accepte.
5. Appuie sur **▶ Play** en haut. C'est tout : deux capsules
   (rouge/bleu) rejouent le combat, la phrase du traducteur défile en
   bas. *(Le lecteur se lance tout seul — aucun objet à poser.)*

## Le pont Claude ↔ Unity (MCP)

Unity 6 expose l'éditeur comme serveur MCP : Claude Code, lancé SUR LA
MÊME MACHINE, peut alors inspecter et piloter l'éditeur en direct.

1. `Window → Package Manager` → **+** → *Install package by name…* →
   `com.unity.ai.assistant` → Install.
   /!\ Sans ce package, la section AI des Project Settings n'existe pas.
   (Le manifest minimal écrit le 31/08 pour réparer l'erreur `Animator`
   l'avait retiré — leçon : un manifest se complète, il ne se remplace
   pas.)
2. `Edit → Project Settings → AI → Unity MCP Server` → vérifier
   **Unity Bridge : Running** → *Integrations* → **Claude Code** →
   **Configure**.
3. Redémarrer Claude Code (`/exit` puis `claude` dans le dossier du
   projet), vérifier avec `/mcp`.
4. Lui donner `unity/BRIEFING.md` à lire — il contient tout le contexte.

## La voie AUTOMATIQUE (recommandée — depuis le 31/08)

Tout l'atelier est scripté. Ton seul travail :

1. Sur Mixamo : télécharge le PERSONNAGE (sans animation, **FBX for
   Unity**, T-pose) puis chaque ANIMATION (**FBX for Unity**, Skin :
   **Without Skin**). Suggestions : Bouncing Fight Idle, Cross Punch,
   Mma Kick, Knocked Out, Victory, Standing Grapple.
2. Dans Unity : dépose TOUS ces fichiers dans
   **`Assets/Resources/Combattants/`** (le dossier existe, il contient
   DEPOSE_ICI.txt). L'importateur règle le rig, extrait les textures,
   construit l'Animator — regarde la Console : il annonce ce qu'il a
   branché.
3. ▶ **Play**. Le lecteur instancie les deux combattants tout seul.

Le nom des fichiers guide le branchement (idle→garde, punch→frappe,
kick→kick, knock/hit→chute, victory→fin, grapple→clinch…) — garde les
noms Mixamo, ils conviennent.

## Remplacer les capsules à la main (l'ancienne voie, toujours valable)

C'est ça qu'on veut juger — pas les capsules.

1. Va sur **mixamo.com** (gratuit, compte Adobe) → onglet *Characters*
   → choisis un personnage → **Download** (format **FBX for Unity**).
2. Glisse le fichier téléchargé dans la fenêtre *Project* d'Unity
   (dossier Assets).
3. Glisse le personnage DEUX FOIS dans la scène (fenêtre *Hierarchy*).
4. Renomme les deux objets **exactement** : `CombattantA` et
   `CombattantB` (clic droit → Rename).
5. ▶ Play : le lecteur les utilise à la place des capsules.

### (Optionnel) De vraies animations
Sur Mixamo, télécharge des animations (Boxing, Kick, Knocked Down…),
importe-les, crée un **Animator Controller** sur le personnage avec des
états nommés exactement :
`garde` · `frappe` · `amenee` · `sol` · `soumission` · `chute` · `clinch` · `fin`
Le lecteur les déclenche par leur nom. Sans Animator, tout marche
quand même (positions + élans).

## Changer de combat
Sur le PC, dans le dépôt : `node jeu/js/exporter_partition.js 77`
(le nombre = la graine) — ça réécrit
`unity/Assets/StreamingAssets/partition.json`. Node requis
(https://nodejs.org).

## La suite (décision APRÈS ton verdict visuel)
Si le rendu te convainc ici, l'étape « dans l'app téléphone » passe par
**Unity as a Library** : ~+40 Mo d'APK et un pont entre les deux
mondes. On ne s'y engage que si ce que tu vois sur PC te plaît.
