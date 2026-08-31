# Briefing pour Claude Code local (celui qui tourne sur le PC de Maël)

Salut. Tu es sur la machine de Maël, avec Unity ouvert et le serveur MCP
Unity actif. Une autre session Claude (dans le cloud) tient le jeu
lui-même ; toi tu as les yeux sur l'éditeur. Voilà le contexte.

## Ce qu'est ce projet
`unity/` est un **projet compagnon**, pas le jeu. Le jeu est un HTML
unique (`jeu/demo_jeu.html`) avec un moteur de combat MMA maison, 34
bancs de conformité, 625 assertions. Unity ne sert qu'à **rejouer** un
combat déjà simulé.

## La règle qui ne se négocie pas (règle 7 du carnet)
**La scène ne montre JAMAIS un coup que le moteur n'a pas tiré.** Tout
vient de `Assets/StreamingAssets/partition.json`, exporté du jeu par
`node jeu/js/exporter_partition.js [graine]`. Positions déjà
normalisées (-1..1, cage au centre), gestes déjà tranchés. Unity ne
décide rien : il montre. Ne jamais inventer un mouvement, un impact,
une durée.

## Ce qui existe déjà
- `Assets/Scripts/Partition.cs` — le format (Temps : t, xa/za/xb/zb, ph,
  geste, qui, zone, fl, com).
- `Assets/Scripts/LecteurPartition.cs` — le lecteur : monte la cage,
  instancie les deux combattants depuis `Resources/Combattants`, joue la
  partition (1,15 s par temps), sous-titres du traducteur en OnGUI,
  caméra en orbite. Mesure et normalise l'échelle à 1,80 m.
- `Assets/Scripts/Amorce.cs` — le lecteur se lance seul dans n'importe
  quelle scène (RuntimeInitializeOnLoadMethod).
- `Assets/Editor/ImportateurCombattants.cs` — tout FBX déposé dans
  `Resources/Combattants` passe en rig Humanoid, textures extraites,
  idles en boucle, et l'Animator « Combattant » se reconstruit en
  devinant l'état d'après le nom (idle→garde, punch→frappe, kick→kick,
  knock→chute, victory→fin, grapple→clinch, takedown→amenee).
- `Assets/Scripts/RapportMMA.cs` — écrit rapport + captures dans
  `RapportMMA/` (utile quand Maël veut montrer l'état à l'autre session).

## Les états d'animation attendus
`garde` · `frappe` · `kick` · `amenee` · `sol` · `soumission` · `chute`
· `clinch` · `fin`. Le lecteur vérifie leur existence avant de les
appeler et retombe sur `garde`.

## L'état au 31/08 et ce qu'il reste à faire
Maël a fabriqué son combattant (photo → Tripo/Supavoxel → OBJ nettoyé →
rig Mixamo) et repéré des animations. Le premier essai a donné un écran
noir — cause probable traitée (échelle), **à vérifier en vrai**.
Priorités :
1. faire tourner le Play proprement : le combattant visible, à l'échelle,
   éclairé, dans la cage ;
2. juger le rendu AVEC Maël — c'est lui le banc d'essai. Le proto 3D
   précédent (three.js, capsules) a été jugé « vraiment nul » et retiré :
   ne rien promettre avant qu'une maquette lui plaise ;
3. si ça lui plaît : deuxième combattant distinct, éclairage de cage,
   qualité des transitions.

## Ce que tu ne fais pas
- Tu ne touches pas à `jeu/` (le jeu, ses bancs, son carnet) — c'est
  l'autre session. Si un besoin vient de là (format de partition à
  enrichir, par exemple), écris-le dans ce fichier plutôt que de
  modifier l'exporteur.
- Tu ne fais pas d'Unity le moteur du jeu. Il rejoue, c'est tout.

## Le dépôt
Branche `claude/finish-app-wncmjt`. Commits en français, dans le style
du carnet (`jeu/NOTES_A_TRAITER.md` — lis-le, il porte 150 cas et
toutes les décisions de Maël). Pousse ton travail sur `unity/`.
