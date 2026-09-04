/**
 * coach_scenes.js — LE CONTENU DES CONVERSATIONS AVEC LES COACHS.
 *
 * GÉNÉRÉ ET RELU À PART, comme diner_scenes.js. C'est une DONNÉE, pas du
 * code : la mécanique qui joue tout ça vit dans coach_dialogue.js, et le
 * banc 39 vérifie CE fichier comme une donnée (listes fermées, effets
 * servis, aucun chiffre, aucune scène écrite deux fois, et la redite).
 *
 * ===================================================================
 * /!\ CE QUI DÉCIDE DE LA FORME : ON LE VOIT CHAQUE SEMAINE
 * ===================================================================
 * Le dîner : un rendez-vous par an, cent quarante scènes, dix ans avant
 * la première redite. Le coach : deux passages au bureau par semaine si
 * le joueur s'en sert. Le stock ne suffit donc pas — il faut que trois
 * choses trient à chaque ouverture :
 *   — LE SUJET : ce que le joueur a choisi d'ouvrir (neuf portes).
 *   — LE DÉCLENCHEUR `si` : la situation, tirée d'une liste fermée.
 *   — LA VOIX : six caractères. Une scène sans `voix` va à tout le
 *     monde ; une scène qui en déclare est écrite POUR ces hommes-là.
 * D'où la coupe de chaque sujet : huit scènes de fond que tout le monde
 * peut recevoir, deux qui attendent leur situation, six écrites pour une
 * voix, quatre qui attendent la voix ET la situation.
 *
 * `vie` dit quand une scène a le droit de revenir : `courante` (un
 * semestre), `saison` (un an), `unique` (jamais). Une scène revue est une
 * scène qui a eu le droit de revenir.
 */

const bureau = [];
const bord_du_tapis = [];
const debrief = [];
const accrochage = [];
const porte = [];

/* ==================================================================== */
/* BUREAU */
/* ==================================================================== */
bureau.push(
{cle:"oie_01",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il pose sa bouteille sur le coin du bureau et s'assoit sans se presser.",
 choix:[
  {lab:"Attendre qu'il parle",r:"Il met un temps, puis il vide son sac. Le tapis, les horaires, sa femme qui ne le voit plus le soir.",d:3,ton:"calme"},
  {lab:"Lui dire que tu l'as trouvé fatigué, ces temps-ci",r:"Il hoche la tête lentement. Il n'aime pas être vu, mais il aime encore moins être invisible.",d:2,ton:"franc"},
  {lab:"Abréger, tu as du travail",r:"Il se lève avant la fin de ta phrase. La porte se referme un peu trop doucement derrière lui.",d:-4,ton:"sec"}]},

{cle:"oie_02",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il dit que ça va, du bout des lèvres, en regardant la fenêtre. Tout dans sa posture dit le contraire de ce que dit sa bouche.",
 choix:[
  {lab:"Ne rien dire et le laisser dans le silence",r:"Le silence tient une bonne minute. Puis il lâche que son père est à l'hôpital depuis le printemps.",d:4,ton:"calme"},
  {lab:"Insister une fois, puis laisser tomber",r:"Il apprécie que tu insistes, et il apprécie encore plus que tu t'arrêtes là.",d:3,ton:"respect"},
  {lab:"Le prendre au mot et passer à la suite",r:"Il repart, en regardant ses pieds, l'air triste",d:-3,ton:"neutre"}]},

{cle:"oie_03",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il arrive avec le dos raide, une main sur les reins, et il fait semblant que ce n'est rien depuis assez de semaines pour que ce soit devenu une blague dans le vestiaire.",
 choix:[
  {lab:"Lui payer un vrai rendez-vous chez un kiné",r:"Il proteste pour la forme, puis il note le nom sur sa main. Il n'y serait jamais allé de lui-même.",d:4,ton:"chaud"},
  {lab:"Lui proposer d'alléger sa semaine",r:"Il refuse, puis il demande si l'offre tient encore la semaine d'après. Elle tient.",d:3,ton:"calme"},
  {lab:"Lui rappeler qu'il est payé pour être debout",r:"Il te regarde comme on regarde quelqu'un qui vient de dire une chose qu'on n'oubliera pas.",d:-5,ton:"dur"}]},

{cle:"oie_04",sujet:"ou_il_en_est",si:"toujours",vie:"saison",
 texte:"Tu lui demandes comment il va et il te retourne la question avant même de répondre. Ce n'est pas une esquive, c'est sa façon de vérifier si la question est sincère.",
 choix:[
  {lab:"Répondre honnêtement",r:"Tu lui racontes ta semaine. Quand tu as fini, il parle de la sienne, et il ne s'arrête plus.",d:4,ton:"franc"},
  {lab:"lui répondre que tout va bien en restant bref",r:"Il note l'esquive sans rien dire, et il répond exactement aussi peu que toi.",d:-1,ton:"neutre"},
  {lab:"Lui dire que ce n'est pas le sujet",r:"Il se ferme d'un coup.",d:-4,ton:"sec"}]},

{cle:"oie_05",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il t'annonce, presque en s'excusant, qu'il voudrait poser deux semaines cet été. Il a préparé son argument avant d'entrer, on l'entend dans sa voix.",
 choix:[
  {lab:"Dire oui tout de suite, sans conditions",r:"Il n'avait pas prévu que ce soit aussi simple. Il reste assis un moment, un peu bête, puis il te remercie.",d:5,ton:"chaud"},
  {lab:"Dire oui, mais lui demander de caler les dates avec les autre coach ( mettre condition si il y'a d'autre coach)",r:"Il trouve ça normal et il part s'arranger le jour même.",d:3,ton:"calme"},
  {lab:"Lui demander de repousser après la carte d'automne",r:"Il accepte parce que c'est son métier, mais il repart avec une tête pleine de frustration",d:-3,ton:"ferme"}]},

{cle:"oie_06",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il est arrivé avant tout le monde et il partira après. Ce n'est pas nouveau, mais depuis quelques semaines il ne rentre même plus manger chez lui le midi.",
 choix:[
  {lab:"Lui demander ce qu'il fuit à la maison avec humour",r:"Il te regarde longuement, puis il dit qu'il n'y a plus grand monde à fuir, justement.",d:3,ton:"grave"},
  {lab:"Le renvoyer chez lui pour la soirée",r:"Il râle tout le long du couloir et il revient le lendemain reposé, sans le dire.",d:3,ton:"chaud"},
  {lab:"Le remercier pour son investissement et lui dire de continuer comme ça",r:"Il apprécie la gratitude mais aimerait que tu soit plus humain",d:2,ton:"calme"}]},

{cle:"oie_07",sujet:"ou_il_en_est",si:"toujours",vie:"courante",
 texte:"Il a la voix cassée et il tousse depuis le début de la séance. Il jure que ce n'est rien, qu'il a connu pire dans des gymnases plus froids que celui-là.",
 choix:[
  {lab:"Le mettre au repos jusqu'à lundi",r:"Il proteste, il cède, et il t'envoie un message le dimanche pour dire que tu avais raison.",d:4,ton:"chaud"},
  {lab:"Lui demander de rentrer chez lui, de ne pas prendre le risque de contaminer les autres",r:"Il accepte, et donnes des technique à répéter aux élèves avant de partir",d:3,ton:"calme"},
  {lab:"Ne rien changer, la carte approche",r:"Il termine la semaine mais il souffre",d:-4,ton:"dur"}]},

{cle:"oie_08",sujet:"ou_il_en_est",si:"toujours",vie:"saison",
 texte:"Tu le trouves assis seul dans le vestiaire vide, longtemps après la fin. Il n'a pas allumé la lumière et il ne s'est pas changé.",
 choix:[
  {lab:"T'asseoir à côté sans rien demander",r:"Vous restez là un moment. Au bout d'un temps, il dit merci, et vous n'en reparlez jamais.",d:5,ton:"grave"},
  {lab:"Lui demander franchement ce qui se passe",r:"Il hésite, puis il te raconte. Il a beaucoup de problèmes a la maison",d:4,ton:"franc"},
  {lab:"Refermer la porte et le laisser tranquille",r:"Tu as sans doute bien fait. Il ne saura jamais que tu es passé.",d:0,ton:"neutre"},
  {lab:"Lui dire que tu ferme la salle et le presser",r:"Il sort sans te dire au revoir. Le lendemain, il t'évite.",d:-5,ton:"froid"}]},

{cle:"oie_09",sujet:"ou_il_en_est",si:"a_son_sommet",vie:"courante",
 texte:"Il est au meilleur de ce qu'il sait faire et il le sait.Il te parles de comment les autres salle s'organise",
 choix:[
  {lab:"Lui dire que sa place est ici, et que notre système a ses avantages",r:"Il écoute jusqu'au bout, ce qu'il ne fait pas souvent. Il ne répond pas, mais il acquiesce",d:4,ton:"franc"},
  {lab:"Lui demander ce que l'ont pourrait améliorer",r:"Il énumère plusieurs point en espérant que son avis sera prit en compte",d:4,ton:"calme"},
  {lab:"Lui dire de voir ailleurs si l'herbe est plus verte",r:"Il te répond qu'il pensait a améliorer la salle mais maintenant il penses vraiment a voir ailleurs",d:-5,ton:"sec"}]},

{cle:"oie_10",sujet:"ou_il_en_est",si:"neuf",vie:"unique",
 texte:"Il n'est là que depuis quelques semaines . Il te demande, gêné, si sa façon de faire convient.",
 choix:[
  {lab:"Lui dire ce que tu attends, précisément",r:"Il note tout. Et suit ta procédure a la prochaine sceance",d:4,ton:"clair"},
  {lab:"Lui dire de faire à sa manière et de voir",r:"Il apprécie la confiance .",d:2,ton:"calme"},
  {lab:"Lui répondre qu'il doit se dépêcher de prendre ses marques",r:"Il repart la queue entre les jambes",d:-3,ton:"sec"}]},

{cle:"oie_11",sujet:"ou_il_en_est",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te coupe avant la fin de ta question et il répond qu'il va bien, que la vraie question c'est de savoir si la salle va bien, elle.",
 choix:[
  {lab:"Répondre à sa question à lui",r:"Tu lui donnes l'état des lieux, sans enjoliver. Il en redemande, il en avait besoin.",d:3,ton:"franc"},
  {lab:"Refuser le détour et revenir sur lui",r:"Il râle il trouves que tu met le problèmes sur lui",d:-3,ton:"ferme"},
  {lab:"Le laisser changer de sujet",r:"Vous parlez de la salle une demi-heure. Vous n'avez rien réglé de ce qui l'occupe.",d:1,ton:"neutre"},
  {lab:"Lui dire que la salle irait mieux s'il se taisait",r:"Le mot est parti trop vite. il ne l'oubliera pas.",d:-6,ton:"dur"}]},

{cle:"oie_12",sujet:"ou_il_en_est",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il hausse les épaules et sort une phrase de trois mots. Avec lui, il faut compter en gestes : il est resté assis, c'est déjà énorme.",
 choix:[
  {lab:"Poser une question fermée, à laquelle il peut répondre par oui",r:"Il répond oui. Puis il en dit un peu plus,",d:4,ton:"malin"},
  {lab:"Lui laisser le silence et attendre",r:"Il tient le silence mieux que toi, mais il finit par le remplir avec ce qui l'encombre.",d:3,ton:"calme"},
  {lab:"Lui demander de développer",r:"Il développe de deux mots. Vous êtes exactement au même endroit qu'avant.",d:0,ton:"neutre"},
  {lab:"Lui reprocher de ne jamais rien dire",r:"Il te répond que ce qu'il a à dire, il le dit sur le tapis. Puis il se lève.",d:-4,ton:"sec"}]},

{cle:"oie_13",sujet:"ou_il_en_est",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te parle de sa fille pour la première fois. Elle a arrêté le sport et il ne sait pas quoi en penser, alors il en parle ici plutôt qu'à la maison.",
 choix:[
  {lab:"L'écouter jusqu'au bout sans donner d'avis",r:"Il parle plus longtemps qu'il n'a jamais parlé dans ce bureau, et il repart plus léger.",d:5,ton:"chaud"},
  {lab:"Lui dire ce que tu ferais, toi",r:"Il n'était pas venu pour ça, mais il prend, parce que c'est toi qui le dis.",d:2,ton:"franc"},
  {lab:"Ramener la conversation sur la salle",r:"Il enchaîne sans broncher. Il ne t'en reparlera plus jamais.",d:-4,ton:"froid"}]},

{cle:"oie_14",sujet:"ou_il_en_est",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te tend un cahier plein de notes prises pendant les séances et te demande, presque timide, si ça t'intéresse de savoir ce qu'il y a dedans.",
 choix:[
  {lab:"Lui demander de tout t'expliquer, maintenant",r:"Il y passe une heure. C'est la meilleure heure qu'il ait passée dans ce bureau.",d:5,ton:"chaud"},
  {lab:"Lui demander de t'en faire un résumé pour lundi",r:"Il te le rend le samedi, deux fois plus long que ce que tu avais demandé.",d:3,ton:"calme"},
  {lab:"Lui dire que tu lui fais confiance là-dessus",r:"C'est gentil et c'est vide. Il range le cahier et n'en ressort rien.",d:-1,ton:"neutre"},
  {lab:"Lui dire que la théorie ne t'interresse pas que tu veux du résultat",r:"Il referme le cahier lentement. Tu viens de fermer la seule porte qu'il ouvrait.",d:-5,ton:"sec"}]},

{cle:"oie_15",sujet:"ou_il_en_est",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te demande sans détour si tu es content de lui. Pas de compliment, pas de chiffre : une réponse, et il retourne travailler.",
 choix:[
  {lab:"Lui dire oui, et dire exactement pourquoi",r:"il te dit que ça faisait un moment qu'il attendait.",d:4,ton:"franc"},
  {lab:"Lui dire oui, avec des axes d'amelioration",r:"Il préfère nettement ça à un oui plein. Il repart avec quelque chose à corriger.",d:3,ton:"clair"},
  {lab:"Lui répondre que ça dépend des semaines",r:"Il hoche la tête. Il n'a pas eu sa réponse et il en tirera ses propres conclusions.",d:-3,ton:"flou"}]},

{cle:"oie_16",sujet:"ou_il_en_est",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te raconte qu'un ancien élève l'a appelé pour lui dire merci, des années après. Il essaie de te le dire comme une anecdote et il n'y arrive pas.",
 choix:[
  {lab:"Lui dire que c'est ça, le métier",r:"Il te répond que oui, et qu'on l'oublie tous les jours dans le bruit des sacs.",d:4,ton:"chaud"},
  {lab:"Lui demander qui c'était",r:"Il te raconte le gamin, la période, la bêtise qui a tout arrêté. Une demi-heure de bureau bien dépensée.",d:4,ton:"calme"},
  {lab:"Lui dire que c'est bien et passer au planning",r:"Il range son histoire. Elle ne ressortira pas.",d:-3,ton:"pressé"}]},

{cle:"oie_17",sujet:"ou_il_en_est",si:"un_trou_a_cote",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il tient un domaine qui n'est pas le sien depuis des semaines, parce qu'il n'y a personne d'autre. Il ne s'est jamais plaint, et c'est bien le problème.",
 choix:[
  {lab:"Reconnaître que tu lui as mis ça sur le dos",r:"Il souffle. Il attendait juste que quelqu'un le dise à voix haute.",d:4,ton:"franc"},
  {lab:"Lui promettre de recruter avant la fin de la saison",r:"Il te croit. Il faudra que ce soit vrai, parce qu'il notera la date.",d:3,ton:"engage"},
  {lab:"Lui rendre le domaine et le remettre sur le sien",r:"Il proteste par principe et il respire mieux dès la séance suivante.",d:4,ton:"calme",effet:"lui_lacher_une_case"},
  {lab:"Lui dire qu'il s'en sort très bien comme ça",r:"C'est un compliment qui coûte cher : il comprend que rien ne changera.",d:-4,ton:"sec"}]},

{cle:"oie_18",sujet:"ou_il_en_est",si:"ancien",vie:"saison",voix:["taiseux","chaleureux","technicien"],
 texte:"Il est là depuis assez longtemps pour avoir vu partir des hommes qu'il avait formés. Il en parle sans amertume, ce qui est presque pire.",
 choix:[
  {lab:"Lui demander lequel lui manque le plus",r:"Il donne sans hésiter le nom d'un gamin d'avant toi, que tu n'as jamais vu, et il en parle comme d'un fils.",d:4,ton:"grave"},
  {lab:"Lui dire que ceux qui restent, c'est grâce à lui",r:"Il balaie ça d'un geste et il le garde quand même.",d:3,ton:"chaud"},
  {lab:"Lui dire que c'est la vie d'une salle",r:"Il te donne raison, poliment, et il change de sujet.",d:-1,ton:"neutre"},
  {lab:"Lui rappeler qu'ils sont partis sous sa responsabilité",r:"Il encaisse le coup en silence. Il ne t'en parlera plus jamais.",d:-6,ton:"dur"}]},

{cle:"oie_19",sujet:"ou_il_en_est",si:"chaud",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il entre sans frapper, s'assoit, et te parle comme on parle à quelqu'un avec qui on a déjà passé des hivers. Aucune précaution, aucun filtre.",
 choix:[
  {lab:"Lui répondre sur le même ton",r:"La conversation part et dure. Vous vous dites des choses que vous ne vous étiez jamais dites.",d:4,ton:"chaud"},
  {lab:"Profiter du moment pour lui dire une vérité qui pique",r:"Il la prend parce qu'elle vient de toi. D'un autre, il aurait claqué la porte.",d:2,ton:"franc"},
  {lab:"Lui rappeler que tu es son patron",r:"Il se redresse sur sa chaise. Vous ne retrouverez pas ce ton avant longtemps.",d:-5,ton:"froid"}]},

{cle:"oie_20",sujet:"ou_il_en_est",si:"sous_paye",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il n'aborde pas l'argent, mais il te raconte qu'il se forme pour perfectionner son coaching a coté. Il dit que c'est pour le plaisir, et vous savez tous les deux que non.",
 choix:[
  {lab:"Lui dire que tu vas remettre son salaire au niveau du marché",r:"Il ne s'y attendait pas ici, pas ce jour-là. Il te serre la main trop longtemps.",d:5,ton:"franc",effet:"monter_au_bareme"},
  {lab:"Lui promettre une augmentation à la prochaine rentrée",r:"Il accepte la promesse et il en note la date quelque part. Il faudra la tenir.",d:3,ton:"engage",effet:"promettre_argent"},
  {lab:"Lui dire que ce qu'il fait en dehors de la salle, c'est son affaire",r:"Il te répond que oui, effectivement. Il ne reparlera plus de cela",d:-3,ton:"sec"},
  {lab:"Lui dire qu'il a bien besoin de s’améliorer",r:"Il aurait pu dire beaucoup de choses, et il n'en dit aucune.",d:-6,ton:"dur"}]},

{cle:"cqv_01",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Tu lui demandes ce qu'il voit depuis le bord du tapis. Il prend le temps de choisir ses mots, parce qu'il sait que ce qu'il va dire va coûter à quelqu'un.",
 choix:[
  {lab:"Lui garantir que ça ne sortira pas d'ici",r:"Il te dit tout, y compris ce qu'il n'aurait pas dû. C'est exactement ce que tu voulais.",d:4,ton:"complice"},
  {lab:"Lui demander de commencer par le pire",r:"Il commence par le pire, et le pire est plus proche que tu ne le pensais.",d:3,ton:"franc"},
  {lab:"Lui demander seulement ce qui va bien",r:"Il te donne la moitié agréable et garde l'autre. Tu l'apprendras plus tard,",d:-2,ton:"flou"},
  {lab:"Lui dire que ce que tu vois toi ne te plaît pas du tout",r:"Il referme le sujet en deux secondes. Il ne le rouvrira pas de sitôt.",d:-4,ton:"sec"}]},

{cle:"cqv_02",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit que le groupe travaille bien mais que l'ambiance est fausse. Personne ne s'engueule, personne ne se parle non plus, et ça finit toujours par se payer en cage.",
 choix:[
  {lab:"Lui demander d'où ça vient",r:"Il remonte le fil jusqu'à une histoire de vestiaire qui date de l'hiver et que tout le monde a enterrée trop vite.",d:4,ton:"calme"},
  {lab:"Lui demander de crever l'abcès à sa façon",r:"Il le fait dès le lendemain, sans ménagement. Ça crie, puis ça respire.",d:3,ton:"ferme"},
  {lab:"Lui dire que l'ambiance n'est pas ton problème",r:"Il note. Il continuera à voir ce qu'il voit, et il le gardera pour lui.",d:-4,ton:"froid"}]},

{cle:"cqv_03",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit qu'un de tes hommes est en train de se cramer et qu'il ne s'en rend pas compte. Le corps tient encore, la tête a lâché il y a un moment.",
 choix:[
  {lab:"Lui demander de le faire lever le pied",r:"Il s'en occupe le jour même, avec une délicatesse dont tu ne l'aurais pas cru capable.",d:4,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui demander comment il le sait",r:"Il détaille : le regard aux échauffements, les blagues qui s'arrêtent, la douche qui dure trop longtemps.",d:3,ton:"clair"},
  {lab:"Lui dire que le gars a un combat qui approche",r:"Il te répond qu'il le sait, et que c'est exactement pour ça qu'il t'en parle maintenant.",d:0,ton:"tendu"},
  {lab:"Lui dire d'arrêter de jouer au psychologue",r:"Il se tait. Trois mois plus tard, tu te rappelleras de cette phrase, et tu la regretteras.",d:-5,ton:"dur"}]},

{cle:"cqv_04",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il y a un gamin dans le groupe du soir que personne ne regarde et qui a quelque chose. Pas un physique, pas un palmarès : une façon d'apprendre.",
 choix:[
  {lab:"Le lui confier",r:"Il n'en demandait pas tant. Il repart en cherchant déjà comment organiser ses semaines.",d:5,ton:"chaud",effet:"lui_confier_un_gars"},
  {lab:"Lui demander de le suivre encore un mois avant de décider",r:"Il trouve ça sage et il revient un mois plus tard, encore plus convaincu.",d:3,ton:"calme"},
  {lab:"Lui dire que tu n'a rien vu chez lui",r:"Il est vexé.",d:-2,ton:"neutre"},
  {lab:"Lui dire qu'il dit ça de tous les gamins",r:"C'est faux, et il le sait, et tu le sais. Ce sont ces phrases-là qui usent.",d:-5,ton:"sec"}]},

{cle:"cqv_05",sujet:"ce_qu_il_voit",si:"toujours",vie:"saison",
 texte:"Il te dit que tu ne viens pas assez au bord du tapis, que les gars s'en aperçoivent, et qu'un homme qui ne voit rien ne peut décider de rien.",
 choix:[
  {lab:"Reconnaître qu'il a raison",r:"Il ne s'attendait pas à ça. Il enchaîne aussitôt sur ce qu'il faudrait que tu voies en premier.",d:5,ton:"franc"},
  {lab:"Lui demander de te dire quand tu manques",r:"Il accepte le rôle et il le tiendra, parfois de façon très inconfortable pour toi.",d:4,ton:"engage"},
  {lab:"Lui expliquer que tu as une salle à faire tourner",r:"Il connaît l'argument. Il te répond que la salle, c'est le tapis, pas le bureau.",d:-1,ton:"tendu"},
  {lab:"Lui dire que ce n'est pas à lui de juger ça",r:"Il se lève. Ce sera la dernière fois qu'il te dira une chose comme celle-là.",d:-5,ton:"dur"}]},

{cle:"cqv_06",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit qu'un de tes combattants ment sur son poids et que ça se voit à tout, sauf sur la balance qu'il ne monte jamais devant témoin.",
 choix:[
  {lab:"Lui demander de gérer ça avec lui, sans toi",r:"Il s'en charge. Le gamin râle une semaine, puis il remonte sur la balance devant tout le monde.",d:4,ton:"calme"},
  {lab:"Convoquer le gars avec lui, ensemble",r:"Vous le prenez à deux. Ce n'est pas agréable, et c'est réglé le jour même.",d:3,ton:"ferme"},
  {lab:"Lui demander de fermer les yeux jusqu'au combat",r:"Il ferme les yeux. Le jour de la pesée, tout le monde les rouvre en grand.",d:-4,ton:"tendu"}]},

{cle:"cqv_07",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il y a un homme du groupe qui traîne des gens douteux à la porte de la salle, et qu'il ne sait pas quoi en faire.",
 choix:[
  {lab:"Lui dire que tu t'en occupes toi-même",r:"Il est soulagé de ne pas avoir à le faire. Il t'en sera reconnaissant longtemps.",d:4,ton:"ferme"},
  {lab:"Lui demander de parler au gars d'abord",r:"Il le fait. Le gars se braque, puis il revient s'excuser deux jours plus tard.",d:3,ton:"calme"},
  {lab:"Lui demander de surveiller sans intervenir",r:"Il surveille. Il n'aime pas ce rôle et il te le fera sentir.",d:-2,ton:"tendu"},
  {lab:"Lui dire que ce qui se passe dehors ne te regarde pas",r:"Il te répond que dehors, c'est à deux mètres de la porte de ta salle.",d:-4,ton:"sec"}]},

{cle:"cqv_08",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",
 texte:"Il te dit que le groupe a pris confiance, peut-être trop, et que les entraînements sont devenus des concours. Ils gagnent tous les jours, et ils apprennent de moins en moins.",
 choix:[
  {lab:"Lui laisser durcir les séances comme il l'entend",r:"Il durcit. La semaine est atroce, l'ambiance grince, et le niveau remonte d'un cran.",d:4,ton:"ferme"},
  {lab:"Lui demander de faire venir des partenaires extérieurs",r:"Il passe deux coups de téléphone et le vestiaire redescend sur terre en une séance.",d:4,ton:"malin"},
  {lab:"Lui dire que la confiance, c'est bon d'en avoir dans le mma",r:"Il te répond que certain n'ont jamais combattu et devrait redescendre sur terre",d:-1,ton:"franc"},
  {lab:"Lui dire de laisser le groupe tranquille",r:"Il laisse. Deux mois plus tard, la carte se passe mal, et vous savez tous les deux pourquoi.",d:-4,ton:"sec"}]},

{cle:"cqv_09",sujet:"ce_qu_il_voit",si:"competition",vie:"courante",
 texte:"Il te dit qu'il ne fait plus la différence entre préparer un homme pour gagner et le préparer pour ne pas perdre, et que le second est en train de gagner du terrain chez tes gars.",
 choix:[
  {lab:"Lui demander ce qu'il changerait dès lundi",r:"Il a déjà tout dans la tête. Il te déroule la semaine en un quart d'heure.",d:4,ton:"clair"},
  {lab:"Lui donner la main sur la préparation d'un combattant",r:"Il prend la charge et il la porte sérieusement",d:4,ton:"engage",effet:"lui_confier_un_gars"},
  {lab:"Lui dire que ne pas perdre, ça paie les factures",r:"Il te concède le point sans y croire une seconde.",d:-3,ton:"froid"}]},

{cle:"cqv_10",sujet:"ce_qu_il_voit",si:"froid",vie:"courante",
 texte:"Tu lui demandes son avis et il te répond qu'il n'est pas sûr que tu veuilles l'entendre. Ce n'est pas une provocation, c'est une constatation.",
 choix:[
  {lab:"Lui dire que si, cette fois",r:"Il teste avec une petite vérité, voit que tu tiens, et sort la grosse.",d:4,ton:"franc"},
  {lab:"Reconnaître que tu ne l'as pas écouté la dernière fois",r:"Il ne s'y attendait pas du tout. Quelque chose se remet en marche entre vous.",d:5,ton:"grave"},
  {lab:"Lui dire d'arrêter les sous-entendus",r:"Il arrête les sous-entendus et il arrête aussi le reste.",d:-4,ton:"sec"}]},

{cle:"cqv_11",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te sort une liste, dans l'ordre, des hommes du groupe et de ce qui cloche chez chacun.",
 choix:[
  {lab:"Tout écouter et lui demander par quoi commencer",r:"Il commence par {autre}, et il dit pourquoi. C'est le bon, et tu l'aurais mis en dernier.",d:4,ton:"clair"},
  {lab:"Lui demander de te faire ça tous les mois",r:"Il accepte et il n'en ratera pas un seul. C'est devenu votre rendez-vous.",d:4,ton:"engage"},
  {lab:"L'arrêter au troisième nom",r:"Il s'arrête net et range le reste. Il ne reprendra pas la liste où vous l'avez laissée.",d:-3,ton:"pressé"}]},

{cle:"cqv_12",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne te répond pas tout de suite. Il se lève, va chercher un tableau, et te dessine ce qu'il voit plutôt que de te le dire.",
 choix:[
  {lab:"Le laisser finir son dessin",r:"Il y passe dix minutes et tu comprends en une seule ce que trois réunions n'avaient pas expliqué.",d:4,ton:"clair"},
  {lab:"Lui demander de traduire en mots",r:"Il essaie, il perd la moitié en route, et il retourne au tableau.",d:1,ton:"neutre"},
  {lab:"Lui dire que tu n'as pas le temps pour un cours",r:"Il repose le feutre. Il ne se relèvera plus pour toi.",d:-4,ton:"sec"}]},

{cle:"cqv_13",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'il y a deux hommes dans le groupe qui ne peuvent plus se voir, et que la salle marche sur des oeufs depuis un mois sans que personne te l'ait dit.",
 choix:[
  {lab:"Lui demander de les faire travailler ensemble",r:"Il les colle l'un contre l'autre trois séances de suite. Au bout de la troisième, ils rient.",d:4,ton:"malin"},
  {lab:"Les convoquer tous les deux dans ce bureau",r:"Ça monte, ça redescend, et ça se termine par une poignée de main tiède mais réelle.",d:3,ton:"ferme"},
  {lab:"Écarter l'un des deux du groupe",r:"Le calme revient, et il te dira plus tard que c'était la solution la plus chère.",d:-2,ton:"dur"},
  {lab:"Lui dire de se débrouiller avec ça",r:"Il se débrouille. Il en garde une pierre dans la chaussure.",d:-4,ton:"froid"}]},

{cle:"cqv_14",sujet:"ce_qu_il_voit",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit qu'il voit ce que la salle produit dans deux ans si rien ne change, et que ce n'est pas beau. Il n'a pas dit ça pour te faire peur, il a compté.",
 choix:[
  {lab:"Lui demander de te montrer son compte",r:"Il reprend tout devant toi, saison par saison. Ce n'est pas discutable, et c'est très inconfortable.",d:4,ton:"clair"},
  {lab:"Lui demander ce qu'il ferait à ta place",r:"Il a trois choses. Deux sont applicables lundi, la troisième coûte cher et vaut le coup.",d:4,ton:"calme"},
  {lab:"Lui rappeler que la salle tourne, aujourd'hui",r:"Il te répond que c'est exactement ce qu'on dit deux ans avant de fermer.",d:-3,ton:"tendu"}]},

{cle:"cqv_15",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te dit tout net que le meilleur de tes hommes s'entraîne mal et que personne n'ose le lui dire parce qu'il gagne quand même.",
 choix:[
  {lab:"Lui donner l'autorisation de le reprendre devant tout le monde",r:"Il le fait le lendemain. Le vestiaire se tait. La semaine d'après, tout le monde travaille mieux.",d:4,ton:"ferme"},
  {lab:"Lui demander de le prendre à part, sans témoin",r:"Il le fait avec tact. Le gars change deux choses, sans que personne s'en aperçoive.",d:4,ton:"calme"},
  {lab:"Lui dire de ne pas toucher à ce qui gagne",r:"Il obéit. Il attend le jour où ça ne gagnera plus, et il l'attend sans plaisir.",d:-4,ton:"froid"}]},

{cle:"cqv_16",sujet:"ce_qu_il_voit",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te parle d'un homme du groupe qui vient à la salle pour ne pas rentrer chez lui, et qui s'entraîne comme on se punit. Il ne sait pas s'il doit t'en parler, et il t'en parle.",
 choix:[
  {lab:"Lui demander de rester près de lui, simplement",r:"Il le fait, sans en faire une affaire. Trois mois plus tard, le gars remonte la pente.",d:5,ton:"chaud"},
  {lab:"Lui demander de lui faire lever le pied",r:"Il l'allège sans le lui dire. Le corps suit, la tête met plus longtemps.",d:4,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui dire que ce n'est pas votre métier",r:"Il te répond que si ce n'est pas votre métier, alors personne ne le fera.",d:-4,ton:"grave"}]},

{cle:"cqv_17",sujet:"ce_qu_il_voit",si:"apres_victoire",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"On vient de gagner et il est le seul à ne pas sourire. Il te dit que la victoire cache trois erreurs qui coûteront cher au prochain, et il les a comptées.",
 choix:[
  {lab:"Lui demander les trois, tout de suite",r:"Il les donne. Elles sont justes, et tu n'en avais vu aucune.",d:4,ton:"clair"},
  {lab:"Lui dire de laisser le vestiaire souffler jusqu'à lundi",r:"Il accepte, note tout, et arrive lundi avec sa liste intacte.",d:3,ton:"calme"},
  {lab:"Lui dire de profiter du moment comme tout le monde",r:"Il sourit poliment. C'est la première fois que tu le vois faire semblant.",d:-2,ton:"neutre"},
  {lab:"Lui reprocher de gâcher la soirée",r:"Il repose son verre et va parler à quelqu'un d'autre. Il avait raison, en plus.",d:-5,ton:"sec"}]},

{cle:"cqv_18",sujet:"ce_qu_il_voit",si:"salle_pleine",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il te dit que la salle est trop pleine pour bien travailler, que les gars s'entraînent en se marchant dessus, et que le niveau baisse sans que le chiffre le montre.",
 choix:[
  {lab:"Lui demander de scinder les groupes",r:"Il redécoupe les créneaux dans la semaine. C'est plus lourd à tenir, et c'est nettement mieux.",d:4,ton:"clair"},
  {lab:"Lui demander de garder les meilleurs à part",r:"Il le fait, à contrecoeur. Ceux qui restent dehors le sentent tout de suite.",d:1,ton:"tendu"},
  {lab:"Lui dire que les inscriptions paient son salaire",r:"Il ne répond pas. C'est vrai, et c'est la façon la plus courte de lui fermer la bouche.",d:-4,ton:"froid"}]},

{cle:"cqv_19",sujet:"ce_qu_il_voit",si:"a_un_crame",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'un de tes hommes est allé au bout de ce qu'il pouvait donner, et qu'il faudrait maintenant décider si on le protège ou si on l'utilise.",
 choix:[
  {lab:"Décider de le protéger, et le dire clairement",r:"Il te remercie d'avoir tranché. Il détestait porter ça tout seul.",d:5,ton:"grave",effet:"menager_un_gars"},
  {lab:"Lui demander combien de temps il tiendrait encore",r:"Il te répond une saison, peut-être, et il n'aime pas sa propre réponse.",d:2,ton:"tendu"},
  {lab:"Lui dire qu'on l'utilise encore une fois, puis on verra",r:"Il accepte parce que c'est toi qui décides. Il ne dort pas mieux pour autant.",d:-3,ton:"dur"}]},

{cle:"cqv_20",sujet:"ce_qu_il_voit",si:"disperse",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit qu'il voit mal, en ce moment, parce qu'il court d'un domaine à l'autre et qu'il n'a plus le temps de regarder les gens travailler.",
 choix:[
  {lab:"Lui reprendre un domaine pour qu'il respire",r:"Il souffle. Dès la semaine suivante, ses remarques redeviennent précises.",d:5,ton:"calme",effet:"lui_lacher_une_case"},
  {lab:"Lui demander de choisir lui-même ce qu'il lâche",r:"Il choisit, et il choisit bien. Il apprécie qu'on lui laisse la main.",d:4,ton:"franc",effet:"lui_lacher_une_case"},
  {lab:"Lui dire de tenir jusqu'à la fin de la saison",r:"Il tient. Il tient de moins en moins bien, et il ne se plaint pas une fois.",d:-3,ton:"ferme"}]},

{cle:"ung_01",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu poses le nom de {gars} sur la table. Il ne répond pas tout de suite : il cherche à savoir pourquoi c'est celui-là que tu sors aujourd'hui.",
 choix:[
  {lab:"Lui dire franchement ce qui t'inquiète",r:"Il pose sa version à côté de la tienne. Les deux se recoupent sur un point que tu n'avais pas vu.",d:3,ton:"franc"},
  {lab:"Lui demander sa version avant de donner la tienne",r:"Il parle librement, sans savoir ce que tu penses. C'est comme ça qu'on obtient un vrai avis.",d:4,ton:"malin"},
  {lab:"Lui demander s'il garderait {gars}, à ta place",r:"Il prend la question au sérieux et met un long moment avant de répondre non.",d:3,ton:"grave"},
  {lab:"Lui demander de le sanctionner sans discuter",r:"Il exécute. Il ne comprend pas, il n'a pas demandé à comprendre, et ça se sent tout le mois.",d:-4,ton:"sec"}]},

{cle:"ung_02",sujet:"un_gars",si:"son_poulain",vie:"courante",
 texte:"Le nom que tu sors, c'est {gars} — le sien. Il se redresse d'un coup, prêt à défendre, avant même de savoir ce que tu vas dire.",
 choix:[
  {lab:"Le rassurer tout de suite : ce sont de bonnes nouvelles",r:"Il se rassoit et se met à parler du gamin pendant vingt minutes, sans respirer.",d:4,ton:"chaud"},
  {lab:"Lui dire que tu envisages de confier {gars} à quelqu'un d'autre",r:"Il encaisse debout. Il ne discute pas, ce qui est la pire réaction possible.",d:-5,ton:"grave",effet:"lui_rendre_un_gars"},
  {lab:"Lui demander s'il est trop attaché",r:"Il te répond que oui, évidemment, et que c'est le seul moyen de faire ce métier correctement.",d:2,ton:"franc"}]},

{cle:"ung_03",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu lui parles de {gars}, qui s'entraîne bien mais qui n'arrive à rien en cage. Il te dit que c'est le cas le plus difficile qu'il connaisse.",
 choix:[
  {lab:"Lui demander de le préparer autrement, à sa main libre",r:"Il change tout : le rythme, les partenaires, l'heure des séances. Le suivant se passe mieux.",d:4,ton:"clair",effet:"lui_confier_un_gars"},
  {lab:"Lui proposer de le sortir de la compétition un moment",r:"Il trouve ça courageux. Le gars revient six mois plus tard, entier.",d:3,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui demander de le pousser plus fort",r:"Il pousse. Le gamin casse, et pas seulement au niveau du corps.",d:-4,ton:"dur"}]},

{cle:"ung_04",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu lui apprends que {gars} a demandé à changer de coach. Il ne le savait pas, et tu le vois le comprendre en direct.",
 choix:[
  {lab:"Lui demander ce qu'il en pense avant de décider",r:"Il te répond honnêtement, y compris sur ce qui est sa faute à lui. C'est rare et ça vaut cher.",d:4,ton:"franc"},
  {lab:"Lui dire que tu refuses et que {gars} reste avec lui",r:"Il apprécie le soutien et il te dit quand même que ce n'est peut-être pas le bon choix.",d:3,ton:"loyal"},
  {lab:"Lui annoncer que c'est déjà acté",r:"Il ne dit rien pendant un temps très long, puis il demande si c'est tout.",d:-5,ton:"froid",effet:"lui_rendre_un_gars"}]},

{cle:"ung_05",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu lui parles de {gars}, qui progresse trop vite et qui commence à prendre la grosse tete. Il te dit qu'il attendait que quelqu'un d'autre le voie.",
 choix:[
  {lab:"Lui demander de le remettre à sa place, en séance",r:"Il lui organise une soirée très longue et très humiliante. Le gamin revient le lendemain.",d:4,ton:"ferme"},
  {lab:"Lui demander de lui donner un rôle auprès des débutants",r:"Le gamin découvre en une semaine tout ce qu'il ne sait pas expliquer. Ça le calme mieux qu'une correction.",d:5,ton:"malin"}]},

{cle:"ung_06",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu lui parles de {gars}, qui prend de la place, donne des consignes à sa place, et à qui personne n'ose rien dire.",
 choix:[
  {lab:"Lui demander de le recadrer, avec ton appui public",r:"Il le recadre en sachant que tu es derrière. Le vestiaire comprend la hiérarchie en une séance.",d:4,ton:"ferme"},
  {lab:"Lui suggérer d'en faire un relais officiel",r:"Le vétéran devient utile au lieu d'être encombrant. C'est la solution la moins coûteuse.",d:5,ton:"malin"},
  {lab:"Lui demander de laisser courir, il partira bien",r:"Il laisse courir. Le vétéran prend encore plus de place.",d:-3,ton:"mou"}]},

{cle:"ung_07",sujet:"un_gars",si:"toujours",vie:"courante",
 texte:"Tu lui parles de la pesée ratée de {gars}. Il n'a rien dit pendant la semaine, et maintenant il a besoin de savoir ce que tu vas décider.",
 choix:[
  {lab:"Lui demander comment on évite que ça recommence",r:"Régime plus stricte et éviter les ecars cela toute l'annee",d:4,ton:"clair"},
  {lab:"Le mettre dans le coin de {gars} pour reprendre la main",r:"Il accepte la charge et il la prend au sérieux.",d:3,ton:"engage",effet:"le_mettre_au_coin"},
  {lab:"Lui reprocher de ne pas l'avoir vu venir",r:"Il te répond que si, il l'avait vu, et qu'il te l'avait dit. Il a raison, en plus.",d:-5,ton:"dur"}]},

{cle:"ung_08",sujet:"un_gars",si:"toujours",vie:"saison",
 texte:"Tu lui demandes lequel de tes hommes il emmènerait s'il devait n'en garder qu'un. Il rit, puis il voit que tu ne plaisantes pas.",
 choix:[
  {lab:"Insister pour avoir un nom",r:"Il dit {autre}. Tu ne l'avais pas vu venir, et la raison qu'il donne tient debout.",d:3,ton:"franc"},
  {lab:"Lui laisser le droit de ne pas répondre",r:"Il te remercie de ne pas insister. Un mois plus tard, il lâche quand même le nom : {autre}.",d:4,ton:"respect"},
  {lab:"Lui reprocher de ne pas oser trancher",r:"Il te répond qu'il tranche tous les jours, et que ce sont des gens, pas des cartes.",d:-4,ton:"sec"}]},

{cle:"ung_09",sujet:"un_gars",si:"gars_jeune",vie:"courante",
 texte:"Il t'apprend que {gars} commence à intéresser d'autre salles . Il te le dit lui-même, alors qu'il aurait pu se taire.",
 choix:[
  {lab:"Le remercier de te l'avoir dit",r:"Il hausse les épaules, mais il est content que tu l'aies relevé.",d:4,ton:"chaud"},
  {lab:"Lui demander de garder {gars} au chaud",r:"Il s'en occupe, et il fait ça bien : le gamin ne saura même pas qu'on l'a courtisé.",d:3,ton:"malin"},
  {lab:"Lui demander pourquoi il ne t'a pas prévenu plus tôt",r:"Il te répond qu'il vient de l'apprendre. C'était vrai, et tu l'apprends trop tard.",d:-4,ton:"soupcon"}]},

{cle:"ung_11",sujet:"un_gars",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Tu lui parles de {gars}, et il te répond par une question sur toi : est-ce que tu comptes vraiment aller au bout avec lui, ou est-ce qu'il perd son temps.",
 choix:[
  {lab:"Lui dire que oui, et l'engager avec toi",r:"Il te prend au mot sur-le-champ et se met à dire tout haut ce qu'il fera de lui l'an prochain, et celui d'après.",d:4,ton:"engage"},
  {lab:"Lui répondre honnêtement que tu ne sais pas",r:"Il préfère de loin cette réponse à une promesse en l'air.",d:3,ton:"franc"},
  {lab:"Lui dire que ce n'est pas sa décision",r:"Il te répond que non, mais que c'est sa vie qui passe dedans.",d:-4,ton:"tendu"}]},

{cle:"ung_12",sujet:"un_gars",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Tu poses le nom, et au lieu de parler du combattant, il te décrit une séance : ce que {gars} fait quand il croit que personne ne regarde.",
 choix:[
  {lab:"Le laisser raconter jusqu'au bout",r:"Ce détail-là vaut tous les bilans. Tu changes d'avis sur le gars en cinq minutes.",d:4,ton:"clair"},
  {lab:"Lui demander ce que ça veut dire, concrètement",r:"Il traduit : ce gars-là ne trichera jamais, mais il ne demandera jamais d'aide non plus.",d:4,ton:"calme"},
  {lab:"Lui demander de venir à l'essentiel",r:"Il abrège. Tu as gagné trois minutes et perdu ce qui comptait.",d:-3,ton:"pressé"}]},

{cle:"ung_13",sujet:"un_gars",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Tu poses le nom de {gars}, et il t'annonce d'emblée qu'il ne l'aime pas, pour que tu saches d'où il parle avant de l'écouter.",
 choix:[
  {lab:"Le remercier d'avoir prévenu, puis écouter quand même",r:"Il fait l'effort d'être juste, et il y arrive presque. Ça se respecte.",d:4,ton:"franc"},
  {lab:"Lui demander pourquoi il ne l'aime pas",r:"La raison est ancienne et personnelle. Elle explique bien plus que ce seul dossier.",d:3,ton:"grave"},
  {lab:"Lui retirer {gars} pour éviter les problèmes",r:"Il approuve, soulagé, et il perd un peu de lui-même dans l'affaire.",d:0,ton:"neutre",effet:"lui_rendre_un_gars"},
  {lab:"Lui dire de faire son travail sans état d'âme",r:"Il le fait. Le gars le sent, et il s'en va au printemps.",d:-4,ton:"froid"}]},

{cle:"ung_14",sujet:"un_gars",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit qu'il faudrait décider maintenant si {gars} est un projet ou un employé, parce qu'on ne travaille pas pareil, et qu'à force de ne pas choisir on obtient les défauts des deux.",
 choix:[
  {lab:"Trancher : c'est un projet, et vous y mettez les moyens",r:"Il repart avec de quoi remplir deux ans. Il en avait besoin plus qu'il ne le disait.",d:4,ton:"clair",effet:"lui_confier_un_gars"},
  {lab:"Trancher : c'est un employé, et on est honnête là-dessus",r:"Il n'aime pas la réponse, mais il apprécie énormément que tu l'aies donnée.",d:2,ton:"franc"},
  {lab:"Lui dire que vous verrez plus tard",r:"Il te répond que plus tard, c'est la façon polie de dire que la réponse est non.",d:-4,ton:"tendu"}]},

{cle:"ung_15",sujet:"un_gars",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Tu lui parles de {gars}, dont le combat approche, et il te dit d'entrée qu'il veut être dans le coin ce soir-là, pas dans les gradins.",
 choix:[
  {lab:"Le mettre au coin, et le lui dire tout de suite",r:"Il ne le montre pas, mais il travaillera deux fois plus cette semaine.",d:4,ton:"engage",effet:"le_mettre_au_coin"},
  {lab:"Lui demander pourquoi il y tient",r:"Il t'explique. Ce n'est pas de la vanité, c'est qu'il connaît le gars mieux que personne.",d:3,ton:"calme"},
  {lab:"Lui dire que le coin, c'est pour l'autre coach",r:"Il l'accepte sans discuter et il regarde le combat depuis les gradins, mains dans les poches.",d:-3,ton:"sec"}]},

{cle:"ung_16",sujet:"un_gars",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Tu lui parles des soucis que {gars} traîne en dehors de la salle et dont il ne veut pas parler. Il te dit qu'il est déjà au courant, et qu'il ne t'a rien dit exprès.",
 choix:[
  {lab:"Lui dire qu'il a bien fait",r:"Il souffle. Il ne savait pas comment tu prendrais ça, et il s'y préparait depuis une semaine.",d:5,ton:"chaud"},
  {lab:"Lui demander seulement s'il faut alléger le gars",r:"Il dit oui. C'est fait le jour même, et personne d'autre n'a besoin de savoir pourquoi.",d:4,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui reprocher de t'avoir caché quelque chose",r:"Il te répond que ce n'était pas à lui de te le dire. Vous avez tous les deux raison, et ça ne se règle pas.",d:-4,ton:"tendu"}]},

{cle:"ung_17",sujet:"un_gars",si:"competition",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te dit que {gars} est prêt pour un cran au-dessus, et qu'attendre encore serait la seule vraie erreur possible.",
 choix:[
  {lab:"Lui faire confiance et viser plus haut",r:"Il repart en marchant vite. Il n'avait pas eu ça depuis longtemps.",d:4,ton:"engage"},
  {lab:"Lui demander ce qui se passe si vous vous trompez",r:"Il a la réponse : on perd un combat, pas un homme. Et c'est juste.",d:3,ton:"clair"},
  {lab:"Lui dire d'attendre encore deux victoires",r:"Il obéit. La fenêtre se referme, et vous ne le saurez que l'an prochain.",d:-3,ton:"prudent"}]},

{cle:"ung_18",sujet:"un_gars",si:"son_poulain",vie:"saison",voix:["taiseux","chaleureux","technicien"],
 texte:"Il te parle de {gars} comme d'une dette : il dit qu'il lui doit d'aller au bout, parce qu'il lui a promis quelque chose au début.",
 choix:[
  {lab:"Lui demander ce qu'il lui a promis",r:"Il te le dit, et c'est une promesse que la salle peut tenir. Vous la tenez.",d:5,ton:"grave"},
  {lab:"Lui dire que la salle est derrière lui",r:"Il te croit, et il te le rappellera le jour où il faudra payer.",d:3,ton:"chaud"},
  {lab:"Lui dire de ne jamais promettre au nom de la salle",r:"Il baisse les yeux. Il sait que tu as raison et il aurait préféré une autre phrase.",d:-3,ton:"ferme"}]},

{cle:"ung_19",sujet:"un_gars",si:"apres_titre",vie:"unique",voix:["bourru","taiseux","chaleureux"],
 texte:"Un de tes hommes vient de décrocher une ceinture, et le coach n'arrive pas à en parler sans que sa voix bouge. Il essaie deux fois, puis il renonce.",
 choix:[
  {lab:"Ne rien dire et lui laisser le temps",r:"Il finit par sortir une phrase de rien du tout, et vous savez tous les deux ce qu'elle contient.",d:5,ton:"grave"},
  {lab:"Lui dire que c'est autant le sien que celui du gars",r:"Il proteste très fort, ce qui est sa façon de dire qu'il le pense aussi.",d:5,ton:"chaud"},
  {lab:"Enchaîner sur la suite de la saison",r:"Il te suit sur la suite. Ce moment-là ne reviendra pas.",d:-4,ton:"pressé"}]},

{cle:"ung_20",sujet:"un_gars",si:"je_lui_ai_promis",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te parle de {gars}, puis il glisse, l'air de rien, que tu lui avais dit quelque chose il y a un moment et qu'il attend toujours.",
 choix:[
  {lab:"Reconnaître que tu n'as pas tenu, et donner une date",r:"Il note la date. Cette fois, il ne la redemandera pas : il la vérifiera.",d:3,ton:"franc"},
  {lab:"Tenir la promesse maintenant : son salaire monte aujourd'hui",r:"Il ne s'y attendait plus. C'est le genre de chose qu'un homme raconte encore dix ans après.",d:5,ton:"engage",effet:"monter_au_bareme"},
  {lab:"Lui dire que tu n'as jamais promis ça",r:"Il te regarde. Il ne discute pas, et quelque chose se referme définitivement.",d:-6,ton:"froid"}]},

{cle:"arg_01",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Tu ouvres le sujet toi-même, ce qui ne lui était jamais arrivé. Il ne sait pas s'il doit se réjouir ou se méfier, alors il attend.",
 choix:[
  {lab:"Lui demander s'il se sent payé correctement",r:"Il met du temps, puis il te répond non, et il a l'air soulagé de l'avoir dit.",d:4,ton:"franc"},
  {lab:"Lui annoncer que tu remets son salaire au niveau du marché",r:"Il ne s'y attendait pas. Il te remercie deux fois, puis une troisième en partant.",d:5,ton:"engage",effet:"monter_au_bareme"},
  {lab:"Lui demander de patienter encore un peu",r:"Il patiente. C'est ce qu'il fait depuis le début, et il commence à le savoir.",d:-3,ton:"mou"}]},

{cle:"arg_02",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il n'est pas venu pour l'argent, ce qui est vrai, et qu'il aimerait quand même en parler une fois, ce qui est vrai aussi.",
 choix:[
  {lab:"Lui dire d'y aller, tu écoutes",r:"Il déroule un raisonnement propre, sans chantage et sans plainte. C'est difficile à refuser.",d:4,ton:"calme"},
  {lab:"Lui proposer une augmentation à la prochaine saison",r:"Il accepte la parole donnée. La date est notée quelque part, et pas seulement par lui.",d:3,ton:"engage",effet:"promettre_argent"},
  {lab:"Lui rappeler qu'il vient de le dire : ce n'est pas pour l'argent",r:"Le coup est bas et il porte. Il se lève sans finir sa phrase.",d:-5,ton:"dur"}]},

{cle:"arg_03",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il pose sur le bureau une offre qu'une autre salle lui a faite. Il ne l'a pas apportée pour te menacer : il l'a apportée parce qu'il ne veut pas décider seul.",
 choix:[
  {lab:"Lire l'offre avec lui, ligne par ligne",r:"Vous la lisez ensemble. Elle est meilleure sur un point et pire sur trois. Ça se dit.",d:4,ton:"franc"},
  {lab:"Aligner son salaire sur l'offre, tout de suite",r:"Il range le papier dans sa poche et il n'en reparle jamais.",d:5,ton:"ferme",effet:"monter_au_bareme"},
  {lab:"Lui demander ce qu'il veut, lui",r:"Il te répond qu'il veut rester, et qu'il aimerait juste qu'on lui donne une raison.",d:4,ton:"grave"},
  {lab:"Lui dire de prendre l'offre s'il la trouve si bonne",r:"Il replie le papier lentement. Vous venez peut-être de décider la suite de son année.",d:-6,ton:"froid"}]},

{cle:"arg_04",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il te demande, gêné, si la salle va bien financièrement. Ce n'est pas pour lui : c'est parce qu'il a entendu deux mots dans le couloir et qu'il n'a pas dormi.",
 choix:[
  {lab:"Lui dire la vérité, quelle qu'elle soit",r:"Il encaisse et il te remercie de ne pas l'avoir pris pour un imbécile.",d:4,ton:"franc"},
  {lab:"Le rassurer sans entrer dans le détail",r:"Il fait semblant d'être rassuré. Il repassera dans deux semaines poser la même question.",d:0,ton:"flou"},
  {lab:"Lui dire que ce ne sont pas ses affaires",r:"Il te répond que son salaire sort de cette caisse-là, et il n'a pas tort.",d:-4,ton:"sec"}]},

{cle:"arg_05",sujet:"l_argent",si:"toujours",vie:"saison",
 texte:"Il te propose de baisser lui-même sa paie pendant quelques mois, le temps que la salle passe l'hiver. Il l'a préparé, il l'a chiffré, et il a honte de le proposer.",
 choix:[
  {lab:"Refuser net et lui dire que ça ne se fait pas ici",r:"Il insiste une fois pour la forme, puis il repart avec quelque chose que l'argent n'achète pas.",d:5,ton:"ferme"},
  {lab:"Accepter, avec une date écrite de retour au tarif normal",r:"Il accepte l'arrangement, et il vérifiera la date au jour près.",d:2,ton:"engage",effet:"promettre_argent"},
  {lab:"Accepter sans rien promettre en retour",r:"Il dit d'accord. Il vient de payer pour la salle et il le sait très bien.",d:-4,ton:"froid"}]},

{cle:"arg_06",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il te parle d'un stage qu'il voudrait faire, à l'étranger, chez quelqu'un dont il parle depuis des années. Ça coûte cher et il ose à peine finir sa phrase.",
 choix:[
  {lab:"Lui payer le stage sans discuter",r:"Il revient transformé, avec un carnet plein et deux idées qui changeront le groupe.",d:5,ton:"chaud",effet:"l_envoyer_se_former"},
  {lab:"Le lui payer à moitié, et lui demander l'autre moitié en congés",r:"Il trouve ça juste et il part quand même. Il te rapportera tout ce qu'il a appris.",d:3,ton:"calme",effet:"l_envoyer_se_former"},
  {lab:"Lui dire que la salle ne peut pas se le permettre",r:"Il comprend, sincèrement. Il ne redemandera plus rien pendant très longtemps.",d:-3,ton:"neutre"}]},

{cle:"arg_07",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il a appris ce que gagne l'autre coach, et qu'il ne comprend pas l'écart. Il n'accuse personne : il demande à comprendre.",
 choix:[
  {lab:"Lui expliquer la logique, sans mentir",r:"Il écoute, il pose deux questions précises, et il repart en trouvant que c'est cohérent.",d:4,ton:"clair"},
  {lab:"Reconnaître que l'écart n'est pas justifié et corriger son salaire",r:"Il n'espérait pas ça. Ce sera raconté au vestiaire dans la semaine, en bien.",d:5,ton:"franc",effet:"monter_au_bareme"},
  {lab:"Lui demander qui lui a dit ça",r:"La conversation change de sujet et devient une enquête. Il regrette d'être venu.",d:-4,ton:"soupcon"}]},

{cle:"arg_08",sujet:"l_argent",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il ne veut pas d'augmentation, il veut un contrat plus long. Ce n'est pas le montant qui l'empêche de dormir, c'est de ne pas savoir où il sera l'an prochain.",
 choix:[
  {lab:"Lui donner la visibilité qu'il demande",r:"Il repart avec un horizon. C'est la première fois depuis longtemps qu'il en a un.",d:5,ton:"engage"},
  {lab:"Lui promettre d'en reparler avant l'été, avec du concret sur son salaire",r:"Il accepte le rendez-vous. Il faudra qu'il ait lieu, et qu'il donne quelque chose.",d:3,ton:"calme",effet:"promettre_argent"},
  {lab:"Lui dire que personne ici n'a de garantie",r:"Il te répond que c'est bien le problème, et il retourne au tapis.",d:-4,ton:"sec"}]},

{cle:"arg_09",sujet:"l_argent",si:"sous_paye",vie:"courante",
 texte:"Il ne demande rien, et c'est justement ce qui te met mal à l'aise : il est nettement en dessous de ce que vaut son travail, et il n'en parle jamais.",
 choix:[
  {lab:"Le remettre au tarif du marché sans qu'il ait à demander",r:"Il en reste sans voix. Ce jour-là, tu as acheté deux ans de loyauté pour pas grand-chose.",d:6,ton:"franc",effet:"monter_au_bareme"},
  {lab:"Lui promettre de régulariser son salaire au prochain bilan",r:"Il te croit sur parole. La parole, maintenant, est engagée.",d:3,ton:"engage",effet:"promettre_argent"},
  {lab:"Ne rien dire, puisqu'il ne demande rien",r:"Il ne demandera jamais. Un jour il partira, et il ne dira pas pourquoi.",d:-4,ton:"froid"}]},

{cle:"arg_10",sujet:"l_argent",si:"bien_paye",vie:"courante",
 texte:"Il est le mieux payé du staff et il le sait. Il te dit qu'il aimerait que ça se voie ailleurs que sur sa fiche de paie : qu'on lui demande son avis, par exemple.",
 choix:[
  {lab:"Lui donner un vrai poids dans les décisions",r:"Il change de posture dans la semaine. Un homme consulté ne travaille pas comme un homme payé.",d:5,ton:"franc"},
  {lab:"Lui demander sur quoi précisément",r:"Il cite deux domaines. Sur les deux, il aurait évité une erreur que vous avez faite.",d:4,ton:"clair"},
  {lab:"Lui rappeler ce qu'il coûte à la salle",r:"Il ne répond pas. C'est la phrase qu'il redoutait depuis le jour où il a signé.",d:-6,ton:"dur"}]},

{cle:"arg_11",sujet:"l_argent",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il attaque directement : il te dit ce qu'il veut gagner, sans détour et sans excuse, et il attend une réponse dans la même monnaie.",
 choix:[
  {lab:"Lui répondre par un chiffre, aussi directement",r:"Il apprécie la franchise, discute une fois, et vous tombez d'accord en cinq minutes.",d:4,ton:"franc"},
  {lab:"Accepter son tarif et le mettre en place ce mois-ci",r:"Il n'avait pas prévu de gagner aussi vite. Il repart en te devant quelque chose.",d:5,ton:"engage",effet:"monter_au_bareme"},
  {lab:"Lui dire que ça ne se demande pas comme ça",r:"Il te répond que c'est pourtant la seule façon honnête de le demander.",d:-4,ton:"tendu"}]},

{cle:"arg_12",sujet:"l_argent",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il tourne autour du sujet pendant un long moment sans jamais le nommer. Il parle du loyer, de la voiture, de sa mère, et il attend que tu comprennes tout seul.",
 choix:[
  {lab:"Nommer le sujet à sa place",r:"Il souffle, soulagé. Il n'aurait jamais réussi à sortir le mot lui-même.",d:4,ton:"calme"},
  {lab:"Lui augmenter sa paie sans lui faire dire",r:"Il ne dit pas merci. Il te le rendra dix fois, à sa façon, sans jamais en parler.",d:5,ton:"chaud",effet:"monter_au_bareme"},
  {lab:"Attendre qu'il le dise lui-même",r:"Il ne le dira pas. Il repart avec son problème et vous avez perdu la conversation.",d:-3,ton:"neutre"}]},

{cle:"arg_13",sujet:"l_argent",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'un des jeunes coachs lui a demandé conseil sur son salaire, et qu'il n'a pas su quoi répondre sans te trahir ou trahir le gamin.",
 choix:[
  {lab:"Lui dire de conseiller le gamin honnêtement",r:"Il te regarde comme s'il vérifiait que tu es sérieux. Tu l'es. Ça compte.",d:5,ton:"franc"},
  {lab:"Lui demander d'envoyer le gamin te voir directement",r:"Il l'envoie. La discussion se passe bien parce qu'elle a été préparée par quelqu'un d'honnête.",d:4,ton:"clair"},
  {lab:"Lui demander de le décourager",r:"Il le fait, parce que tu l'as demandé. Il ne se pardonnera pas cette semaine-là.",d:-5,ton:"froid"}]},

{cle:"arg_14",sujet:"l_argent",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il t'explique que ce qui l'intéresse, ce n'est pas la somme mais la façon dont elle est décidée. Il voudrait comprendre la règle, une bonne fois.",
 choix:[
  {lab:"Lui expliquer la règle, en entier",r:"Il pose des questions jusqu'au bout et il en ressort avec quelque chose de rare : de la confiance.",d:4,ton:"clair"},
  {lab:"Reconnaître qu'il n'y a pas vraiment de règle",r:"Il apprécie l'honnêteté et il te propose d'en écrire une. Ce n'est pas une mauvaise idée.",d:4,ton:"franc"},
  {lab:"Lui dire que la règle, c'est toi",r:"Il hoche la tête. Il vient d'apprendre qu'il ne sert à rien de discuter, et il ne discutera plus.",d:-4,ton:"dur"}]},

{cle:"arg_15",sujet:"l_argent",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te dit qu'il a refusé une proposition il y a trois mois sans t'en parler, et qu'il commence à se demander s'il a eu raison.",
 choix:[
  {lab:"Lui demander pourquoi il n'a rien dit",r:"Il répond qu'il ne voulait pas que ça ressemble à du marchandage. C'est vrai.",d:4,ton:"grave"},
  {lab:"Lui donner tout de suite une raison chiffrée de rester, côté salaire",r:"Il n'attendait plus rien de cette conversation. Il repart plus solide qu'il n'est entré.",d:5,ton:"franc",effet:"monter_au_bareme"},
  {lab:"Lui dire qu'il aurait peut-être dû accepter",r:"Il te remercie de ta franchise, et il commence à regarder ailleurs le soir même.",d:-6,ton:"froid"}]},

{cle:"arg_16",sujet:"l_argent",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il refuse la conversation. Il te dit que tant que la salle a de quoi payer les tapis et le chauffage, sa paie n'est pas le sujet le plus urgent.",
 choix:[
  {lab:"Insister quand même, parce que c'est ton travail",r:"Il finit par accepter d'en parler, et il n'en pensait pas moins depuis longtemps.",d:4,ton:"ferme"},
  {lab:"Respecter son refus et fermer le sujet",r:"Il apprécie. Le problème, lui, ne s'est pas fermé.",d:1,ton:"calme"},
  {lab:"Prendre son refus pour argent comptant et ne jamais y revenir",r:"Deux ans plus tard, il partira pour une raison que tu n'auras pas vue venir.",d:-3,ton:"neutre"}]},

{cle:"arg_17",sujet:"l_argent",si:"tiede",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Vous vous connaissez assez pour qu'il ose le sujet, pas assez pour qu'il le pose calmement. La conversation démarre plus raide qu'elle ne devrait.",
 choix:[
  {lab:"Baisser d'un ton et lui demander de reprendre du début",r:"Il reprend, mieux. La deuxième version de sa demande est bien meilleure que la première.",d:4,ton:"calme"},
  {lab:"Répondre sur le même ton raide",r:"Ça monte des deux côtés. Vous vous quittez sans rien avoir réglé.",d:-4,ton:"tendu"},
  {lab:"Lui proposer d'en reparler à froid, avec une date",r:"Il accepte, et il arrive au rendez-vous avec des arguments au lieu d'une colère.",d:3,ton:"clair"}]},

{cle:"arg_18",sujet:"l_argent",si:"seul_au_staff",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il est seul à tenir la technique de toute la salle et il vient de s'en rendre compte en essayant de poser une semaine. Il ne parle pas de sa paie, il parle de sa charge.",
 choix:[
  {lab:"Lui promettre d'embaucher quelqu'un avant la fin de la saison",r:"Il te croit. Cette promesse-là n'a pas de prix et elle a une date.",d:4,ton:"engage"},
  {lab:"Compenser la charge sur sa fiche de paie en attendant",r:"Il prend, et il te dit que ça ne remplace pas une paire de bras. Il a raison.",d:3,ton:"franc",effet:"monter_au_bareme"},
  {lab:"Lui dire que c'est ça, être le seul homme fort de la maison",r:"Il ne répond pas. Le compliment vient de lui coûter très cher.",d:-4,ton:"dur"}]},

{cle:"arg_19",sujet:"l_argent",si:"je_ne_tiens_jamais_parole",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il ouvre le sujet et s'arrête aussitôt. Il te dit qu'il ne voit pas l'intérêt d'en parler, puisque ce qui se dit dans ce bureau ne se passe jamais.",
 choix:[
  {lab:"Encaisser, et reconnaître qu'il a raison",r:"Il ne s'attendait pas à ça. Ça ne répare rien, mais ça arrête l'hémorragie.",d:3,ton:"grave"},
  {lab:"Régler la chose maintenant, sur son salaire, devant lui",r:"C'est la seule réponse qui vaut encore quelque chose à ce stade. Il la prend.",d:5,ton:"ferme",effet:"monter_au_bareme"},
  {lab:"Lui promettre encore une augmentation",r:"Il sourit poliment. Cette promesse-là ne vaut plus rien et vous le savez tous les deux.",d:-5,ton:"mou",effet:"promettre_argent"}]},

{cle:"arg_20",sujet:"l_argent",si:"vieux",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te parle de sa retraite, du peu qu'il aura, et du fait qu'il n'a jamais su gérer ça. Il ne demande pas d'aide, il constate à voix haute.",
 choix:[
  {lab:"Lui proposer de regarder ça ensemble",r:"Vous y passez une soirée. Ce n'est pas ton métier, et ça change tout pour lui.",d:5,ton:"chaud"},
  {lab:"Améliorer son salaire maintenant, pendant qu'il travaille encore",r:"Il ne demandait rien. C'est exactement pour ça que ça compte autant.",d:5,ton:"grave",effet:"monter_au_bareme"},
  {lab:"Lui dire que c'est un problème personnel",r:"Il te donne raison, et il ne te parlera plus jamais de sa vie.",d:-4,ton:"froid"}]},

{cle:"met_01",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Tu lui demandes de t'expliquer comment il construit une séance. Il te regarde comme si tu venais de lui offrir quelque chose.",
 choix:[
  {lab:"L'écouter jusqu'au bout, sans regarder l'heure",r:"Il déroule sa méthode du début à la fin. Il n'avait jamais eu l'occasion de la dire à voix haute.",d:5,ton:"chaud"},
  {lab:"Lui demander pourquoi il fait dans cet ordre",r:"L'ordre a une raison, et elle est meilleure que celle que tu aurais devinée.",d:4,ton:"clair"},
  {lab:"Lui dire que tu aurais fait autrement",r:"Il te demande comment, sincèrement. Puis il te montre où ta version casse.",d:1,ton:"franc"},
  {lab:"L'interrompre au bout de deux minutes",r:"Il s'arrête net et te dit que ce n'est pas grave. Ça l'est un peu.",d:-4,ton:"pressé"}]},

{cle:"met_02",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il t'explique qu'il ne travaille jamais deux hommes de la même façon, et que c'est pour ça qu'il ne peut pas en suivre douze correctement.",
 choix:[
  {lab:"Lui alléger la charge en lui reprenant un domaine",r:"Il proteste par principe et il fait la meilleure saison de sa carrière.",d:5,ton:"calme",effet:"lui_lacher_une_case"},
  {lab:"Lui demander lesquels il suit vraiment",r:"Il en suit vraiment quatre, {autre} en tête. Les autres, il les surveille — ce n'est pas la même chose.",d:3,ton:"clair"},
  {lab:"Lui dire qu'il faudra bien qu'il apprenne à en suivre douze",r:"Il te répond que ça s'appelle un cours collectif, et qu'on ne fait pas de champion avec ça.",d:-4,ton:"tendu"}]},

{cle:"met_03",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il t'explique qu'il passe la première moitié de chaque cycle à défaire des habitudes, et que c'est la partie où tout le monde le trouve mauvais.",
 choix:[
  {lab:"Lui dire que tu ne jugeras pas avant la fin du cycle",r:"C'est exactement ce qu'il n'a jamais eu ailleurs. Il te le rappellera dans deux ans.",d:5,ton:"franc"},
  {lab:"Lui demander comment on voit que ça marche",r:"Il te donne trois signes concrets. Tu les vérifieras toi-même, et ils sont justes.",d:4,ton:"clair"},
  {lab:"Lui demander d'aller plus vite",r:"Il accélère et il abîme le travail. Il l'avait dit, et tu l'avais demandé quand même.",d:-4,ton:"dur"}]},

{cle:"met_04",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il t'avoue qu'il a copié l'essentiel de sa méthode sur un vieux qui l'a formé, et qu'il n'a jamais osé le lui dire.",
 choix:[
  {lab:"Lui suggérer de l'appeler, ce vieux",r:"Il l'appelle le soir même. Ils parlent deux heures, et il revient avec dix ans de plus dans la tête.",d:5,ton:"chaud"},
  {lab:"Lui demander ce qu'il a ajouté, lui",r:"Il cherche, puis il trouve deux choses. Elles sont à lui, et elles sont bonnes.",d:4,ton:"clair"},
  {lab:"Lui faire remarquer qu'il n'invente donc rien",r:"Il ne répond pas. Tu viens de résumer sa carrière d'une façon dont il ne se remettra pas.",d:-6,ton:"dur"}]},

{cle:"met_05",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il aimerait aller voir comment on travaille ailleurs, parce qu'il tourne en rond et qu'il le sent avant que ça se voie.",
 choix:[
  {lab:"Lui payer une semaine de formation ailleurs",r:"Il revient avec un carnet, deux idées et l'envie de tout recommencer.",d:5,ton:"chaud",effet:"l_envoyer_se_former"},
  {lab:"Lui proposer d'inviter quelqu'un ici, plutôt",r:"Il trouve ça malin. La salle entière en profite, pas seulement lui.",d:4,ton:"malin"},
  {lab:"Lui dire que ce qu'il fait suffit largement",r:"C'est un compliment, et il l'entend comme une porte qu'on ferme.",d:-3,ton:"neutre"}]},

{cle:"met_06",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il t'explique qu'il refuse de faire travailler la puissance avant que le geste soit propre, même si ça coûte des mois, et qu'on le lui reproche depuis toujours.",
 choix:[
  {lab:"Le soutenir publiquement sur ce point",r:"Il n'a plus à se justifier devant le vestiaire. La différence est visible en un mois.",d:5,ton:"ferme"},
  {lab:"Lui demander combien de mois, honnêtement",r:"Il te répond honnêtement. C'est plus long que tu ne voulais et plus court que tu ne craignais.",d:3,ton:"clair"},
  {lab:"Lui demander une exception pour un combattant pressé",r:"Il fait l'exception. Elle se voit au premier échange du combat.",d:-3,ton:"tendu"}]},

{cle:"met_07",sujet:"sa_methode",si:"toujours",vie:"saison",
 texte:"Il te dit qu'il n'a aucune méthode, qu'il regarde les gens et qu'il s'adapte, et qu'il a mis vingt ans à assumer de dire ça.",
 choix:[
  {lab:"Lui dire que c'est justement ça, une méthode",r:"Il n'y avait jamais pensé comme ça. Il repart avec une fierté qu'il n'avait pas en entrant.",d:5,ton:"franc"},
  {lab:"Lui demander comment il regarde, alors",r:"Il décrit sa façon de regarder pendant vingt minutes. C'est passionnant et c'est très précis.",d:4,ton:"clair"},
  {lab:"Lui dire que ça ne se transmet pas, alors",r:"Il te concède le point et il n'aime pas du tout où ça le laisse.",d:-3,ton:"tendu"}]},

{cle:"met_08",sujet:"sa_methode",si:"toujours",vie:"courante",
 texte:"Il te propose de reprendre un domaine de plus, parce qu'il pense pouvoir tenir les deux et qu'il s'ennuie sur le sien.",
 choix:[
  {lab:"Le lui confier, et le lui dire clairement",r:"Il repart en organisant déjà ses semaines. Il n'a pas dormi de la nuit, en bien.",d:4,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui demander de faire un essai d'un mois d'abord",r:"L'essai se passe bien. Il ne t'en voudra jamais d'avoir vérifié.",d:3,ton:"prudent"},
  {lab:"Lui dire qu'il a déjà bien assez à faire",r:"Il accepte l'argument et il retourne s'ennuyer. Ça finira par se voir.",d:-3,ton:"neutre"}]},

{cle:"met_09",sujet:"sa_methode",si:"competition",vie:"courante",
 texte:"Il t'explique comment il construit les dernières semaines avant un combat, et à quel moment précis il arrête de charger. Il en parle comme d'une chose sacrée.",
 choix:[
  {lab:"Lui garantir que personne ne touchera à ces semaines-là",r:"Il te fait répéter, puis il te croit. C'est le meilleur cadeau qu'on puisse lui faire.",d:5,ton:"ferme"},
  {lab:"Lui demander ce qui se passe si on décale le combat",r:"Il te répond que tout est à refaire, et il t'explique exactement pourquoi.",d:4,ton:"clair"},
  {lab:"Lui dire que le calendrier passe avant sa méthode",r:"Il ne discute pas. Il fera moins bien, et il t'aura prévenu.",d:-4,ton:"dur"}]},

{cle:"met_10",sujet:"sa_methode",si:"concentre",vie:"courante",
 texte:"Il n'a qu'un domaine et il le connaît comme sa poche. Il te dit qu'il commence à se demander s'il ne s'est pas enfermé dedans.",
 choix:[
  {lab:"Lui ouvrir un deuxième domaine",r:"Il redécouvre le métier. Il fera des erreurs de débutant, et il en est ravi.",d:4,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui proposer une formation pour élargir",r:"Il part une semaine et revient avec de quoi tenir deux ans.",d:4,ton:"calme",effet:"l_envoyer_se_former"},
  {lab:"Lui dire qu'être irremplaçable quelque part, c'est une chance",r:"Il te donne raison. Il retourne dans sa boîte et il en referme le couvercle.",d:-3,ton:"neutre"}]},

{cle:"met_11",sujet:"sa_methode",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te dit que la moitié de son travail consiste à empêcher les gens de faire n'importe quoi le reste de la semaine, et que ça ne se voit sur aucun bilan.",
 choix:[
  {lab:"Lui demander de te donner des exemples",r:"Il en donne quatre. Chacun aurait coûté un combat, et aucun n'a laissé de trace.",d:4,ton:"clair"},
  {lab:"Lui dire que tu le sais, et que c'est compté",r:"Il ne s'attendait pas à ce que quelqu'un l'ait remarqué. Ça vaut plus qu'une augmentation.",d:5,ton:"chaud"},
  {lab:"Lui répondre que ce qui ne se voit pas ne se paie pas",r:"Il encaisse. La semaine suivante, il laisse deux bêtises passer pour voir.",d:-5,ton:"froid"}]},

{cle:"met_12",sujet:"sa_methode",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Plutôt que d'expliquer, il t'emmène au bord du tapis et te montre un homme en train de répéter le même geste depuis le début du cours.",
 choix:[
  {lab:"Regarder jusqu'à ce que tu voies la différence",r:"Au bout de quelques minutes, tu la vois. Il ne dit rien, mais il a gagné sa journée.",d:5,ton:"clair"},
  {lab:"Lui demander de te dire ce qu'il faut regarder",r:"Il te donne un seul détail et tout devient lisible d'un coup.",d:4,ton:"calme"},
  {lab:"Lui dire que tu vois surtout un gars qui perd son temps",r:"Il ne répond pas et retourne au bord du tapis. Il ne t'y emmènera plus.",d:-5,ton:"sec"}]},

{cle:"met_13",sujet:"sa_methode",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'il ne croit pas aux séances dures pour être dures, et qu'il en a assez de s'entendre reprocher d'être trop tendre.",
 choix:[
  {lab:"Lui dire que tu ne lui as jamais demandé d'être dur",r:"Il souffle. Il portait ce reproche depuis une salle où il travaillait avant.",d:4,ton:"franc"},
  {lab:"Lui demander comment il fait monter la charge, alors",r:"Il t'explique et c'est plus dur que ce que font les autres, sauf que ça ne se voit pas.",d:4,ton:"clair"},
  {lab:"Lui dire que les gars ont besoin d'en baver",r:"Il te répond qu'ils en bavent, et que tu ne viens jamais voir quand.",d:-4,ton:"tendu"}]},

{cle:"met_14",sujet:"sa_methode",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te propose d'écrire noir sur blanc la façon de travailler de la salle, pour que ça ne dépende plus des hommes qui passent.",
 choix:[
  {lab:"Lui donner le temps de l'écrire",r:"Il y passe deux mois. Ce document servira encore quand il ne sera plus là.",d:5,ton:"engage"},
  {lab:"Lui demander de commencer par un seul domaine",r:"Il commence, il finit, et il enchaîne sur le suivant sans que tu aies à le demander.",d:4,ton:"clair"},
  {lab:"Lui dire que ça ne s'écrit pas, ce métier",r:"Il te répond que c'est ce qu'on dit toujours, juste avant de tout perdre en un départ.",d:-4,ton:"tendu"}]},

{cle:"met_15",sujet:"sa_methode",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te dit tout net que la façon dont la salle est organisée l'empêche de bien travailler, et qu'il préfère te le dire une fois plutôt que de râler tous les jours.",
 choix:[
  {lab:"Lui demander de te dire quoi changer, précisément",r:"Il sort trois points. Deux sont faciles, le troisième va déranger du monde.",d:4,ton:"clair"},
  {lab:"Changer le premier point tout de suite, devant lui",r:"Il en reste sur sa chaise. Il découvre qu'on peut parler et que ça bouge.",d:5,ton:"ferme"},
  {lab:"Lui dire que l'organisation, c'est ton domaine",r:"Il acquiesce et il retourne râler tous les jours, comme il l'avait annoncé.",d:-4,ton:"sec"}]},

{cle:"met_16",sujet:"sa_methode",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il t'explique qu'il apprend encore, à son âge, et qu'il trouve ça à la fois formidable et un peu inquiétant.",
 choix:[
  {lab:"Lui dire que c'est le meilleur signe possible",r:"Il rit et il te dit que tu as sans doute raison. Il le pensait sans oser.",d:4,ton:"chaud"},
  {lab:"Lui demander ce qu'il apprend en ce moment",r:"Il te raconte, et c'est une chose que tu ignorais complètement.",d:4,ton:"clair"},
  {lab:"Lui dire qu'à son niveau, il devrait savoir",r:"Il se tait. Tu viens de lui apprendre qu'ici, il ne faut pas avoir de doutes à voix haute.",d:-5,ton:"dur"}]},

{cle:"met_17",sujet:"sa_methode",si:"a_son_sommet",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il est au sommet de sa manière de faire et il le sent. Il te dit qu'il voudrait former quelqu'un avant que ça redescende.",
 choix:[
  {lab:"Lui donner un jeune coach à former",r:"Il prend ça comme une mission. Ce sera la meilleure chose qu'il aura faite ici.",d:5,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui payer une formation de formateur",r:"Il revient avec des outils qu'il n'avait pas et l'envie de tout transmettre.",d:4,ton:"calme",effet:"l_envoyer_se_former"},
  {lab:"Lui dire qu'on verra ça quand il redescendra",r:"Il te répond que ce jour-là, il sera trop tard, et il a raison.",d:-4,ton:"tendu"}]},

{cle:"met_18",sujet:"sa_methode",si:"formateur",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il t'explique qu'il ne fabrique pas des combattants mais des gens qui savent s'entraîner, et que ça met dix ans à se voir.",
 choix:[
  {lab:"Lui dire que tu attendras les dix ans",r:"Il n'y croit pas tout à fait, et pourtant il repart plus droit qu'il n'est entré.",d:5,ton:"grave"},
  {lab:"Lui demander ce qu'on voit, en attendant",r:"Il te donne des signes intermédiaires très concrets. Tu peux les vérifier dès ce soir.",d:4,ton:"clair"},
  {lab:"Lui dire que la salle n'a pas dix ans devant elle",r:"Il te répond que c'est vrai, et que c'est bien tout le problème du métier.",d:-3,ton:"grave"}]},

{cle:"met_19",sujet:"sa_methode",si:"disperse",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il t'explique qu'à force de courir partout, il applique la même recette à tout le monde, ce qui est exactement ce qu'il reprochait aux autres.",
 choix:[
  {lab:"Lui reprendre un domaine pour qu'il redevienne précis",r:"Le mois suivant, ses séances redeviennent taillées sur mesure. La différence est nette.",d:5,ton:"calme",effet:"lui_lacher_une_case"},
  {lab:"Lui demander de tenir jusqu'au recrutement",r:"Il tient. Il n'aime pas ce qu'il fait pendant ce temps-là, et il le dit.",d:-1,ton:"ferme"},
  {lab:"Lui dire que la recette marche, alors autant continuer",r:"Il te regarde, puis il abandonne l'idée de t'expliquer.",d:-5,ton:"froid"}]},

{cle:"met_20",sujet:"sa_methode",si:"je_l_ai_recadre",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Depuis que tu l'as repris, il te demande son avis avant chaque changement de séance. Ce n'est pas de la docilité, c'est de la prudence, et ça abîme son travail.",
 choix:[
  {lab:"Lui rendre sa liberté, explicitement",r:"Il attendait cette phrase. Il redevient lui-même en une semaine.",d:5,ton:"franc"},
  {lab:"Lui dire que tu ne le reprendras que sur le fond",r:"Il note la limite et il travaille beaucoup mieux dedans.",d:4,ton:"clair"},
  {lab:"Lui dire que c'est bien de demander",r:"Il continuera donc à demander, et il ne décidera plus rien tout seul.",d:-4,ton:"mou"}]},

{cle:"rec_01",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu l'as fait venir pour lui dire ce qui ne va pas. Il l'a compris avant de s'asseoir et il a déjà les mâchoires serrées.",
 choix:[
  {lab:"Dire les faits, sans commentaire",r:"Il conteste un point, admet les deux autres, et repart avec de quoi travailler.",d:1,ton:"ferme"},
  {lab:"Commencer par ce qui va bien, puis venir au reste",r:"Il baisse la garde et il entend la deuxième moitié, ce qui était le but.",d:2,ton:"clair"},
  {lab:"Lui demander d'abord comment lui voit les choses",r:"Il se met à table tout seul et il est plus sévère avec lui-même que tu ne l'aurais été.",d:3,ton:"malin"},
  {lab:"Monter le ton d'entrée",r:"La conversation devient un affrontement en deux phrases. Rien de ce que tu voulais dire n'est passé.",d:-5,ton:"dur"}]},

{cle:"rec_02",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches d'être arrivé en retard trois fois cette semaine. Il ne nie pas, il ne s'excuse pas non plus, il attend la suite.",
 choix:[
  {lab:"Lui demander ce qui se passe, avant de sanctionner",r:"Il finit par te dire ce qu'il y a derrière, et ce n'est pas de la négligence.",d:3,ton:"calme"},
  {lab:"Poser la règle une fois, clairement, et fermer le sujet",r:"Il n'est plus jamais en retard. Il n'y a pas eu besoin d'en reparler.",d:2,ton:"ferme"},
  {lab:"Le sanctionner devant les autres",r:"La règle est passée et l'homme s'est fermé. Tu as gagné une bataille et perdu autre chose.",d:-5,ton:"dur"}]},

{cle:"rec_03",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches d'avoir contredit une de tes décisions devant les combattants. Il n'a pas l'air de comprendre ce qu'il a fait de mal.",
 choix:[
  {lab:"Lui expliquer le problème, pas la faute",r:"Il comprend en trois phrases et il ne recommencera pas. Il ne s'en était pas rendu compte.",d:3,ton:"clair"},
  {lab:"Lui dire qu'il peut te contredire, mais pas là",r:"Il apprécie énormément la nuance. Il viendra désormais te voir avant.",d:4,ton:"franc"},
  {lab:"Lui interdire de commenter tes décisions",r:"Il obéit à la lettre. Il ne te dira plus jamais quand tu te trompes.",d:-5,ton:"dur"}]},

{cle:"rec_04",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches de laisser filer la discipline dans son groupe. Il te répond qu'il choisit ses batailles, et qu'il en a déjà gagné deux que tu n'as pas vues.",
 choix:[
  {lab:"Lui demander lesquelles",r:"Il les raconte. Tu ne savais rien de l'une des deux, et elle était sérieuse.",d:3,ton:"calme"},
  {lab:"Maintenir la demande, mais lui laisser le choix des moyens",r:"Il accepte le cadre et il le tient. Il fallait juste ne pas lui dicter la méthode.",d:3,ton:"ferme"},
  {lab:"Lui dire que ce n'est pas à lui de choisir ses batailles",r:"Il te répond que c'est pourtant exactement ce pour quoi on paie un coach.",d:-4,ton:"tendu"}]},

{cle:"rec_05",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches d'avoir promis quelque chose à un combattant sans t'en parler. Là, il sait qu'il a tort, et il n'aime pas ça du tout.",
 choix:[
  {lab:"Lui dire que tu tiendras sa promesse cette fois, mais pas la prochaine",r:"Il te remercie et il ne recommencera jamais. C'était la bonne façon de faire.",d:4,ton:"ferme"},
  {lab:"Lui demander de reprendre sa parole lui-même",r:"Il le fait, et ça lui coûte devant le gars. La leçon est apprise pour de bon.",d:1,ton:"dur"},
  {lab:"Lui dire qu'il n'a aucune parole à donner ici",r:"Il encaisse. Il vient de comprendre où il se situe exactement dans cette maison.",d:-5,ton:"froid"}]},

{cle:"rec_06",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches sa façon de parler à un jeune, la veille, au bord du tapis. Le mot était de trop et deux personnes l'ont entendu.",
 choix:[
  {lab:"Lui demander d'aller s'excuser auprès du gamin",r:"Il y va le jour même, sans se cacher. Le vestiaire retient surtout ça.",d:3,ton:"ferme"},
  {lab:"Lui demander ce qui l'a mis dans cet état",r:"Il te raconte sa semaine. Ça n'excuse rien, ça explique tout.",d:3,ton:"calme"},
  {lab:"Lui dire que ça arrive à tout le monde",r:"Il te donne raison un peu trop vite. Le gamin, lui, n'a rien oublié.",d:-3,ton:"mou"}]},

{cle:"rec_07",sujet:"le_recadrer",si:"toujours",vie:"saison",
 texte:"Tu dois lui dire que son travail a baissé. Ce n'est ni une faute ni un accident, c'est une pente, et personne ne lui a encore dit.",
 choix:[
  {lab:"Le dire simplement, et lui demander ce qu'il en pense",r:"Il ne conteste pas. Il en avait conscience et il attendait qu'on ouvre la porte.",d:3,ton:"grave"},
  {lab:"L'envoyer se former pour relancer la machine",r:"Il part en se sentant soutenu plutôt que sanctionné. Il revient avec de l'élan.",d:4,ton:"calme",effet:"l_envoyer_se_former"},
  {lab:"Lui reprendre un domaine en attendant que ça remonte",r:"Il vit ça comme une rétrogradation, mais il retrouve de la précision là où il reste.",d:-1,ton:"ferme",effet:"lui_lacher_une_case"},
  {lab:"Lui dire que s'il ne remonte pas, il sait ce qui l'attend",r:"La menace est passée. Il travaille par peur pendant trois mois, et c'est pire.",d:-5,ton:"dur"}]},

{cle:"rec_08",sujet:"le_recadrer",si:"toujours",vie:"courante",
 texte:"Tu lui reproches d'avoir pris une décision technique importante sans t'en informer. Il te répond qu'il a fait son métier, et il n'a pas complètement tort.",
 choix:[
  {lab:"Lui dire que la décision était bonne, l'information manquante",r:"Il fait la différence tout de suite. Il t'informera, et il continuera à décider.",d:4,ton:"clair"},
  {lab:"Lui demander de tout te soumettre à l'avenir",r:"Il accepte. Vous perdrez tous les deux un temps considérable pour rien.",d:-3,ton:"ferme"},
  {lab:"Reconnaître que tu n'étais pas joignable",r:"Il apprécie. La règle qui sort de cette conversation tiendra des années.",d:3,ton:"franc"}]},

{cle:"rec_09",sujet:"le_recadrer",si:"apres_defaite",vie:"courante",
 texte:"On vient de perdre et tu lui reproches la préparation. Il t'écoute jusqu'au bout, et tu vois bien qu'il attend son tour de parler.",
 choix:[
  {lab:"Lui laisser son tour de parole",r:"Sa version tient debout et elle contient une chose que tu ne pouvais pas savoir.",d:3,ton:"franc"},
  {lab:"Lui demander ce qu'il aurait fallu faire autrement",r:"Il a déjà tout repassé dans sa tête. Sa réponse est honnête et coûteuse pour lui.",d:3,ton:"calme"},
  {lab:"Lui dire que la défaite est de sa faute et clore la discussion",r:"Il sort sans un mot. Ce reproche-là restera entre vous pendant très longtemps.",d:-6,ton:"dur"}]},

{cle:"rec_10",sujet:"le_recadrer",si:"neuf",vie:"courante",
 texte:"Il est nouveau et il a fait une bêtise de nouveau : il a bousculé une habitude à laquelle tout le vestiaire tenait, sans demander.",
 choix:[
  {lab:"Lui expliquer l'habitude et pourquoi elle existe",r:"Il comprend et il répare tout seul dès le lendemain, avec élégance.",d:4,ton:"clair"},
  {lab:"Lui dire que sa version était meilleure, mais mal amenée",r:"Il retient les deux choses. C'est la conversation qui va le faire tenir ici.",d:4,ton:"franc"},
  {lab:"Lui rappeler qu'il n'est là que depuis peu",r:"Il baisse la tête. Il ne proposera plus rien avant longtemps.",d:-4,ton:"sec"}]},

{cle:"rec_11",sujet:"le_recadrer",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Tu commences ton reproche et il te coupe pour te dire qu'il sait déjà, qu'il y a pensé toute la nuit et qu'il n'a pas besoin qu'on le lui répète.",
 choix:[
  {lab:"Lui demander alors ce qu'il compte faire",r:"Il a un plan. Il est meilleur que ce que tu allais lui imposer.",d:4,ton:"clair"},
  {lab:"Lui dire quand même les choses, calmement",r:"Il grince, il écoute, et il finit par admettre que tu avais un point de plus.",d:1,ton:"ferme"},
  {lab:"Le laisser gérer, sans rien ajouter",r:"Il gère. Il aurait quand même aimé savoir ce que tu allais dire.",d:0,ton:"neutre"},
  {lab:"Lui dire qu'il te coupera quand il sera patron",r:"Le silence qui suit est très long. Vous ne reprendrez pas cette conversation.",d:-5,ton:"dur"}]},

{cle:"rec_12",sujet:"le_recadrer",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Tu lui fais un reproche et il ne dit rien. Pas un mot, pas un geste. Le silence dure assez pour devenir inconfortable pour toi.",
 choix:[
  {lab:"Attendre sa réponse aussi longtemps qu'il faudra",r:"Elle vient au bout d'un long moment, et elle vaut la peine d'avoir attendu.",d:4,ton:"calme"},
  {lab:"Lui demander directement s'il est d'accord",r:"Il répond non, et il explique pourquoi. Il fallait juste lui poser la question.",d:3,ton:"clair"},
  {lab:"Prendre son silence pour un accord",r:"Ce n'en était pas un. Le désaccord ressortira dans deux mois, en pire.",d:-3,ton:"neutre"},
  {lab:"Lui reprocher aussi son silence",r:"Il se ferme complètement. Vous venez d'ajouter un problème à celui que vous aviez.",d:-5,ton:"dur"}]},

{cle:"rec_13",sujet:"le_recadrer",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Le reproche est justifié et il le sait, mais il te répond que tu ne lui as jamais dit ce que tu attendais, et là-dessus il n'a pas tort du tout.",
 choix:[
  {lab:"Reconnaître ta part et reformuler l'attente",r:"La conversation change de nature. Vous sortez tous les deux avec quelque chose.",d:5,ton:"franc"},
  {lab:"Maintenir le reproche mais écrire l'attente noir sur blanc",r:"Il prend le papier et il s'y tient. C'est réglé pour de bon.",d:3,ton:"clair"},
  {lab:"Lui dire que ça devrait aller de soi",r:"Il te répond que rien ne va de soi, et il a raison, ce qui rend la phrase encore plus mauvaise.",d:-4,ton:"sec"}]},

{cle:"rec_14",sujet:"le_recadrer",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Tu dois lui dire qu'il prend trop de place dans la salle, qu'il décide de choses qui ne sont pas à lui. C'est vrai, et c'est aussi parce que personne d'autre ne les décidait.",
 choix:[
  {lab:"Lui dire les deux moitiés de la vérité",r:"Il encaisse la première et il est soulagé par la seconde. Le cadre est enfin clair.",d:4,ton:"franc"},
  {lab:"Lui donner officiellement ce qu'il faisait officieusement",r:"Il devient responsable de ce qu'il portait déjà. Le reproche disparaît de lui-même.",d:5,ton:"clair",effet:"lui_donner_une_case"},
  {lab:"Lui reprendre tout ce qu'il avait pris",r:"Il rend tout, immédiatement et froidement. Le vide qu'il laisse est plus grand que prévu.",d:-4,ton:"dur",effet:"lui_lacher_une_case"}]},

{cle:"rec_15",sujet:"le_recadrer",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il conteste le reproche point par point, avec des faits, et il est en train de gagner l'échange. Tu n'avais pas prévu ça.",
 choix:[
  {lab:"Reconnaître qu'il a raison et le dire clairement",r:"Il ne triomphe pas une seconde. Il te respecte nettement plus qu'avant d'entrer.",d:5,ton:"franc"},
  {lab:"Garder un point valable et lâcher les autres",r:"Il accepte le point qui reste. La discussion a servi à quelque chose.",d:3,ton:"clair"},
  {lab:"Maintenir le reproche entier malgré les faits",r:"Il se tait. Il vient d'apprendre que les faits ne servent à rien dans ce bureau.",d:-6,ton:"dur"}]},

{cle:"rec_16",sujet:"le_recadrer",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Le reproche le touche plus que tu ne le pensais. Il ne se défend pas, il s'excuse trop, et ça devient gênant pour tout le monde.",
 choix:[
  {lab:"Arrêter là et lui dire que c'est réglé",r:"Il se reprend. Le lendemain, tout est normal, et le problème est corrigé.",d:4,ton:"chaud"},
  {lab:"Lui rappeler ce qu'il fait bien, pour rééquilibrer",r:"Il repart avec la correction et sans la blessure. C'était le but.",d:4,ton:"calme"},
  {lab:"Profiter de l'ouverture pour ajouter deux autres reproches",r:"Il s'écroule intérieurement. Tu n'obtiendras rien de bon pendant un mois.",d:-6,ton:"dur"}]},

{cle:"rec_17",sujet:"le_recadrer",si:"tiede",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Vous ne vous connaissez pas encore assez pour que le reproche passe tout seul. Chacun surveille le ton de l'autre plus que le fond.",
 choix:[
  {lab:"Annoncer d'entrée que ce n'est pas une menace",r:"Le cadre posé, il écoute vraiment. La conversation devient utile.",d:4,ton:"clair"},
  {lab:"Aller au fait, sans précaution",r:"Il le prend mal sur le moment et bien deux jours plus tard. C'est un pari.",d:0,ton:"franc"},
  {lab:"Enrober à tel point que le message ne passe pas",r:"Il sort du bureau sans avoir compris qu'on lui reprochait quelque chose.",d:-3,ton:"mou"}]},

{cle:"rec_18",sujet:"le_recadrer",si:"ancien",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il est là depuis plus longtemps que la plupart des murs, et le recadrer revient à lui dire que son ancienneté ne le protège pas. Il l'entend très bien.",
 choix:[
  {lab:"Lui dire justement que son ancienneté ne le protège pas",r:"Il te répond que c'est bien la première fois, et il te respecte pour ça.",d:3,ton:"ferme"},
  {lab:"Reconnaître ce qu'il a construit avant d'en venir au fait",r:"Il baisse la garde et la deuxième partie passe sans un accroc.",d:4,ton:"franc"},
  {lab:"Éviter le sujet parce que c'est lui",r:"Le problème reste entier. Toute la salle a vu que tu n'as rien dit.",d:-4,ton:"mou"}]},

{cle:"rec_19",sujet:"le_recadrer",si:"je_lui_ai_toujours_dit_oui",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Tu ne lui as jamais rien refusé, et voilà que tu lui fais un reproche. Il ne comprend pas d'où ça sort, et son étonnement est sincère.",
 choix:[
  {lab:"Reconnaître que tu as trop dit oui, et rétablir un cadre",r:"Il accuse le coup, puis il te dit qu'il trouve ça sain. Il le pense.",d:3,ton:"franc"},
  {lab:"Faire le reproche sans revenir sur le reste",r:"Il l'entend comme une injustice, parce qu'il n'a pas vu la ligne se déplacer.",d:-3,ton:"sec"},
  {lab:"Renoncer au reproche, comme d'habitude",r:"Rien ne change. La prochaine fois sera plus dure encore à ouvrir.",d:-1,ton:"mou"}]},

{cle:"rec_20",sujet:"le_recadrer",si:"partage_sa_case",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Le reproche porte sur un domaine qu'il partage avec un autre coach. Il te demande, à juste titre, si l'autre a eu la même conversation.",
 choix:[
  {lab:"Lui dire la vérité : oui, et dans les mêmes termes",r:"Il accepte le reproche sans discuter. L'égalité de traitement suffisait.",d:4,ton:"clair"},
  {lab:"Reconnaître que non, et aller voir l'autre tout de suite",r:"Il apprécie que tu répares devant lui. La salle entend parler de cette journée.",d:4,ton:"franc"},
  {lab:"Lui dire que ça ne le regarde pas",r:"Il retourne travailler avec le sentiment très net d'avoir payé pour deux.",d:-5,ton:"froid"}]},

{cle:"ras_01",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Tu l'as fait venir pour lui dire que tu vois ce qu'il fait. Il attend la suite, persuadé qu'il y a un mais qui arrive.",
 choix:[
  {lab:"Lui dire qu'il n'y a pas de mais",r:"Il met un temps à y croire, puis il sourit franchement pour la première fois depuis des mois.",d:5,ton:"chaud"},
  {lab:"Détailler exactement ce que tu as vu",r:"Le détail change tout : un compliment précis, ça ne se soupçonne pas.",d:5,ton:"clair"},
  {lab:"Enchaîner quand même sur une demande",r:"Le compliment devient une entrée en matière. Il ne retiendra que la demande.",d:-3,ton:"pressé"}]},

{cle:"ras_02",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il doute de lui depuis une mauvaise série et ça commence à s'entendre dans sa voix au bord du tapis. Tu l'as vu, les gars aussi.",
 choix:[
  {lab:"Lui rappeler ce qu'il a construit ici, en détail",r:"Il écoute la liste et il se redresse au fur et à mesure. Il en avait besoin.",d:5,ton:"chaud"},
  {lab:"Lui dire que la série, c'est le métier, pas lui",r:"Il ne demande qu'à le croire, et venant de toi, il y arrive.",d:4,ton:"calme"},
  {lab:"Lui dire qu'il faut se reprendre",r:"Il te répond oui. Il vient d'ajouter ton inquiétude à la sienne.",d:-4,ton:"sec"}]},

{cle:"ras_03",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il a entendu une rumeur de recrutement et il pense que tu cherches à le remplacer. Il n'ose pas poser la question, alors il tourne autour.",
 choix:[
  {lab:"Répondre à la question qu'il n'a pas posée",r:"Il souffle très fort. Il n'a pas dormi depuis une semaine à cause d'un mot dans un couloir.",d:5,ton:"franc"},
  {lab:"Lui expliquer à quoi servira vraiment le recrutement",r:"Il comprend, et il devient même le premier à défendre l'idée dans le vestiaire.",d:4,ton:"clair"},
  {lab:"Le laisser dans le flou, ça le tiendra en éveil",r:"Il reste en éveil, effectivement. Il commence aussi à répondre au téléphone d'ailleurs.",d:-5,ton:"froid"}]},

{cle:"ras_04",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il vient de prendre une décision difficile et il attend de savoir si tu vas le soutenir ou le désavouer. Il ne demandera rien, mais il est là.",
 choix:[
  {lab:"Le soutenir clairement, y compris devant les autres",r:"Il n'a plus à se justifier. Ce que tu viens de faire vaut trois augmentations.",d:5,ton:"ferme"},
  {lab:"Lui dire que tu aurais fait autrement, mais que tu le couvres",r:"C'est honnête et ça lui suffit largement. Il retient les deux parties.",d:4,ton:"franc"},
  {lab:"Ne rien dire et laisser courir",r:"Il interprète le silence comme un désaveu. Il n'a peut-être pas tort.",d:-4,ton:"neutre"}]},

{cle:"ras_05",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il est persuadé que le vestiaire ne le respecte pas, ce qui est faux, et il a construit tout un raisonnement autour de deux ou trois signes mal lus.",
 choix:[
  {lab:"Démonter le raisonnement, signe par signe",r:"Il ne s'était jamais dit ça à voix haute. Entendu de l'extérieur, ça ne tient pas, et il le voit.",d:4,ton:"clair"},
  {lab:"Lui rapporter ce que les gars disent vraiment de lui",r:"Il ne s'y attendait pas. Il en est presque gêné, et il repart d'un pas différent.",d:5,ton:"chaud"},
  {lab:"Lui dire que le respect, ça se gagne",r:"La phrase confirme exactement ce qu'il croyait. Il ne t'en parlera plus.",d:-5,ton:"sec"}]},

{cle:"ras_06",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il a du mal avec un combattant difficile et il commence à se demander si le problème, ce n'est pas lui. Tu sais très bien que non.",
 choix:[
  {lab:"Lui dire que trois coachs avant lui ont buté sur le même gars",r:"Il ne le savait pas. Ça le remet debout en une seule phrase.",d:5,ton:"franc"},
  {lab:"Lui proposer de reprendre le gars toi-même un moment",r:"Il refuse d'abord par fierté, puis il accepte, et ça les soulage tous les deux.",d:3,ton:"calme",effet:"lui_rendre_un_gars"},
  {lab:"Lui dire de trouver la solution, c'est son métier",r:"Il cherchera seul. Il trouvera peut-être, et il ne te devra rien.",d:-4,ton:"sec"}]},

{cle:"ras_07",sujet:"le_rassurer",si:"toujours",vie:"saison",
 texte:"Tu lui dis simplement que la salle ne serait pas la même sans lui. Il ne sait absolument pas quoi répondre à ça.",
 choix:[
  {lab:"Ne rien ajouter et le laisser avec la phrase",r:"Il repart avec. Il y repensera plus souvent que tu ne l'imagines.",d:5,ton:"chaud"},
  {lab:"Lui donner un exemple concret pour appuyer",r:"L'exemple rend la phrase vraie plutôt que gentille. C'est toute la différence.",d:5,ton:"clair"},
  {lab:"Ajouter que tu comptes sur lui pour la suite",r:"Le compliment se transforme en contrat. Il l'entend surtout comme ça.",d:0,ton:"neutre"}]},

{cle:"ras_08",sujet:"le_rassurer",si:"toujours",vie:"courante",
 texte:"Il a l'air d'aller bien, il n'a rien demandé, et tu l'as fait venir uniquement pour lui dire que tu es content. Ça n'arrive jamais.",
 choix:[
  {lab:"Le dire, et le laisser repartir",r:"Il sort du bureau en se retournant deux fois, pas sûr d'avoir bien compris.",d:5,ton:"chaud"},
  {lab:"En profiter pour lui demander ce dont il aurait besoin",r:"Il ose deux demandes qu'il gardait depuis un an. Les deux sont raisonnables.",d:5,ton:"malin"},
  {lab:"Lui donner un domaine de plus, tant qu'il est content",r:"Il accepte avec plaisir. Le plaisir durera jusqu'à la troisième semaine.",d:1,ton:"neutre",effet:"lui_donner_une_case"}]},

{cle:"ras_09",sujet:"le_rassurer",si:"apres_victoire",vie:"courante",
 texte:"La salle a gagné et tout le monde félicite le combattant. Lui est dans un coin, à ranger le matériel, comme après n'importe quelle soirée.",
 choix:[
  {lab:"Aller le chercher et le mettre au milieu",r:"Il grogne tout le chemin et il n'oubliera jamais cette soirée-là.",d:5,ton:"chaud"},
  {lab:"Lui dire en privé ce que tu lui dois",r:"Il préfère nettement cette version-là. Elle lui va mieux.",d:5,ton:"calme"},
  {lab:"Le laisser ranger, il aime ça",r:"Il range. Il a l'habitude qu'on l'oublie les soirs de victoire.",d:-3,ton:"neutre"}]},

{cle:"ras_10",sujet:"le_rassurer",si:"froid",vie:"courante",
 texte:"Vous êtes en froid depuis des semaines et tu l'as fait venir pour dire quelque chose de gentil. Il se méfie tellement qu'il en devient agressif.",
 choix:[
  {lab:"Encaisser la méfiance et dire ce que tu avais à dire",r:"Il ne répond pas sur le moment. Le lendemain, il te dit bonjour le premier.",d:4,ton:"calme"},
  {lab:"Reconnaître d'abord ce qui vous a séparés",r:"Il lâche prise d'un coup. C'était la seule porte d'entrée possible.",d:5,ton:"franc"},
  {lab:"Répondre à l'agressivité par de l'agressivité",r:"La tentative de paix devient la pire dispute de l'année.",d:-6,ton:"dur"}]},

{cle:"ras_11",sujet:"le_rassurer",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Tu lui dis que son travail est bon et il te répond immédiatement par ce qui ne va pas, comme s'il refusait de recevoir quoi que ce soit.",
 choix:[
  {lab:"Insister et l'obliger à entendre le compliment",r:"Il finit par dire merci, très vite, en regardant ailleurs. C'est déjà énorme.",d:4,ton:"ferme"},
  {lab:"Accepter le détour et parler de ce qui ne va pas",r:"Vous travaillez une heure sur ses problèmes. Il n'a toujours pas entendu le compliment.",d:1,ton:"neutre"},
  {lab:"Lui dire d'apprendre à recevoir",r:"Il se braque. Ce n'est pas une chose qu'on apprend en se la faisant reprocher.",d:-4,ton:"sec"}]},

{cle:"ras_12",sujet:"le_rassurer",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il reçoit le compliment sans rien dire, hoche la tête, et reste assis. Il n'a manifestement pas fini, mais il ne sait pas comment continuer.",
 choix:[
  {lab:"Attendre en silence qu'il trouve ses mots",r:"Il finit par te dire une chose qu'il n'a dite à personne. Le silence a payé.",d:5,ton:"calme"},
  {lab:"L'aider avec une question simple",r:"La question ouvre la porte. Il passe la demi-heure suivante à parler.",d:4,ton:"chaud"},
  {lab:"Considérer que c'est fini et le renvoyer au tapis",r:"Il part avec ce qu'il n'a pas dit. Il le remportera la prochaine fois, ou pas.",d:-3,ton:"pressé"}]},

{cle:"ras_13",sujet:"le_rassurer",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Tu veux le rassurer et il te coupe pour te demander si c'est une façon de lui annoncer une mauvaise nouvelle. Ça lui est déjà arrivé, ailleurs.",
 choix:[
  {lab:"Lui jurer que non, et lui demander qui lui a fait ça",r:"Il raconte l'histoire d'une salle où on l'a remercié un lundi matin. Ça explique beaucoup.",d:5,ton:"grave"},
  {lab:"Lui dire que ce n'est pas ta façon de faire",r:"Il te croit à moitié. La moitié qui reste mettra deux ans à se combler.",d:3,ton:"franc"},
  {lab:"Rire de sa méfiance",r:"Il rit avec toi et il note quand même. Il n'a pas trouvé ça drôle.",d:-3,ton:"leger"}]},

{cle:"ras_14",sujet:"le_rassurer",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit qu'il ne sait pas s'il est en train de progresser ou de stagner, et que c'est la question qui l'empêche de dormir depuis un moment.",
 choix:[
  {lab:"Lui donner ta lecture, en détail et sans flatterie",r:"Il repart avec une réponse au lieu d'une angoisse. Ce n'est pas rien.",d:5,ton:"clair"},
  {lab:"Lui proposer d'aller se confronter ailleurs pour se situer",r:"Il revient de sa semaine avec la réponse, et elle est meilleure qu'il ne le croyait.",d:4,ton:"calme",effet:"l_envoyer_se_former"},
  {lab:"Lui dire que tant que ça marche, la question ne se pose pas",r:"Il te répond que si, elle se pose, et qu'elle se pose à lui toutes les nuits.",d:-4,ton:"mou"}]},

{cle:"ras_15",sujet:"le_rassurer",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te dit qu'il n'a pas besoin qu'on le rassure, qu'il n'est pas un gamin, et il le dit exactement sur le ton d'un homme qui a besoin qu'on le rassure.",
 choix:[
  {lab:"Le prendre au mot et parler de travail",r:"Vous parlez travail. À la fin, il traîne à la porte, et tu comprends ce qu'il attendait.",d:0,ton:"neutre"},
  {lab:"Le dire quand même, sans en faire un discours",r:"Une phrase courte, sèche, exacte. C'est la seule forme qu'il pouvait accepter.",d:5,ton:"franc"},
  {lab:"Lui dire qu'effectivement, il n'en a pas besoin",r:"Il repart en ayant obtenu exactement le contraire de ce qu'il voulait.",d:-4,ton:"sec"}]},

{cle:"ras_16",sujet:"le_rassurer",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te parle d'un gamin qui a arrêté et qu'il pense avoir mal accompagné. Il porte ça depuis des mois sans en avoir parlé à personne.",
 choix:[
  {lab:"Lui rappeler tout ce qu'il a fait pour ce gamin",r:"Il écoute la liste. Elle ne répare rien, et elle allège quand même.",d:5,ton:"chaud"},
  {lab:"Lui dire qu'on en perd, et que c'est le métier",r:"Il connaît la phrase. Venant de toi, elle passe mieux que dans sa tête.",d:3,ton:"grave"},
  {lab:"Lui demander ce qu'il aurait dû faire autrement",r:"La question le renvoie à sa culpabilité au lieu de l'en sortir.",d:-3,ton:"maladroit"}]},

{cle:"ras_17",sujet:"le_rassurer",si:"a_un_poulain",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Son poulain traverse une mauvaise passe et il le vit comme un échec personnel. Il en a maigri, et ça se voit.",
 choix:[
  {lab:"Lui dire que tu as vu le travail, quoi qu'il arrive au gamin",r:"Il te remercie et il se remet à manger normalement dans la semaine.",d:5,ton:"chaud"},
  {lab:"Lui proposer de partager la charge avec l'autre coach",r:"Il accepte, à contrecoeur, et il dort mieux dès la première semaine.",d:3,ton:"calme"},
  {lab:"Lui dire que le gamin est sous sa responsabilité",r:"Il le sait. C'est exactement ce qui est en train de le ronger.",d:-5,ton:"dur"}]},

{cle:"ras_18",sujet:"le_rassurer",si:"vieux",vie:"saison",voix:["taiseux","chaleureux","technicien"],
 texte:"Il te dit qu'il se sent vieux au bord du tapis, que les gamins parlent une autre langue, et qu'il ne sait plus s'il sert encore à quelque chose.",
 choix:[
  {lab:"Lui dire précisément à quoi il sert, aujourd'hui",r:"Tu lui donnes trois choses que personne d'autre ne sait faire ici. Il n'y avait jamais pensé.",d:5,ton:"clair"},
  {lab:"Lui proposer de s'appuyer sur un jeune coach",r:"Le tandem fonctionne mieux que prévu. Chacun apprend de l'autre, et il rajeunit.",d:4,ton:"malin"},
  {lab:"Lui dire que tout le monde vieillit",r:"Il te donne raison. Ce n'était pas une phrase à dire ce jour-là.",d:-4,ton:"maladroit"}]},

{cle:"ras_19",sujet:"le_rassurer",si:"apres_un_depart",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Quelqu'un vient de quitter la salle et il en fait une affaire personnelle. Il se demande à voix haute ce qu'il n'a pas su faire.",
 choix:[
  {lab:"Lui dire les vraies raisons du départ, celles qu'il ignore",r:"Il découvre que ça n'avait rien à voir avec lui. Ses épaules redescendent d'un coup.",d:5,ton:"franc"},
  {lab:"Lui dire que les gens partent, et que ça ne se prend pas comme ça",r:"Il te répond que si, ça se prend comme ça, et que c'est pour ça qu'il fait ce métier.",d:2,ton:"grave"},
  {lab:"Lui demander s'il compte partir aussi",r:"La question sort de nulle part et elle plante une idée qui n'y était pas.",d:-5,ton:"maladroit"}]},

{cle:"ras_20",sujet:"le_rassurer",si:"sans_case",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il n'a plus de domaine attitré depuis la dernière réorganisation. Il vient au bureau pour savoir si c'est provisoire ou si c'est une façon polie de le pousser dehors.",
 choix:[
  {lab:"Lui redonner un domaine, ce jour-là",r:"Il repart avec du travail et avec une réponse. Les deux comptaient autant.",d:5,ton:"ferme",effet:"lui_donner_une_case"},
  {lab:"Lui dire honnêtement que c'est provisoire, et jusqu'à quand",r:"Il tient sans problème jusqu'à la date, parce qu'il y a une date.",d:4,ton:"clair"},
  {lab:"Lui répondre que tu n'as pas encore décidé",r:"Il entend la réponse qu'il redoutait. Il commence à regarder les annonces.",d:-5,ton:"flou"}]},

{cle:"col_01",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Tu lui demandes comment ça se passe avec l'autre. Il commence par dire que ça va, et il laisse traîner un silence qui dit le contraire.",
 choix:[
  {lab:"Attendre la suite du silence",r:"Il finit par lâcher que ça fait des mois qu'ils se contredisent devant les gars.",d:3,ton:"calme"},
  {lab:"Lui demander directement ce qui coince",r:"Il donne un exemple, puis trois autres. Le problème est plus vieux que tu ne le pensais.",d:3,ton:"franc"},
  {lab:"Te contenter du ça va",r:"Tu apprendras le reste dans six mois, quand l'un des deux posera une lettre.",d:-3,ton:"neutre"}]},

{cle:"col_02",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il te dit que l'autre coach défait ce qu'il construit, sans méchanceté, simplement parce qu'ils ne croient pas aux mêmes choses.",
 choix:[
  {lab:"Les réunir tous les deux pour poser une ligne commune",r:"Ça dure trois heures et ça règle deux ans de frottements.",d:4,ton:"ferme"},
  {lab:"Lui donner raison et le dire à l'autre",r:"Il a gagné son arbitrage. L'autre l'apprendra et s'en souviendra.",d:4,ton:"franc",effet:"arbitrer_pour_lui"},
  {lab:"Trancher en faveur de l'autre, parce que tu le penses",r:"Il encaisse. Il continuera à travailler correctement, avec une réserve en plus.",d:-4,ton:"ferme",effet:"arbitrer_contre_lui"},
  {lab:"Leur dire de se débrouiller entre adultes",r:"Ils se débrouillent. Le tapis paie la facture toutes les semaines.",d:-3,ton:"mou"}]},

{cle:"col_03",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il te dit du bien de l'autre coach, sincèrement, et il te demande si tu t'en rends compte. Ce n'est pas une manoeuvre : il trouve juste que personne ne le dit.",
 choix:[
  {lab:"Le remercier et aller le dire à l'autre",r:"L'autre apprend d'où vient le compliment. Le staff se resserre d'un cran.",d:5,ton:"chaud"},
  {lab:"Lui demander ce qu'il lui envie, exactement",r:"Il répond sans détour. C'est une leçon de lucidité et une bonne piste de travail.",d:4,ton:"clair"},
  {lab:"Lui demander où il veut en venir",r:"Il ne voulait en venir nulle part. Ta question a suffi à salir le moment.",d:-4,ton:"soupcon"}]},

{cle:"col_04",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il t'apprend que l'autre coach traverse une période difficile chez lui, et il te le dit parce qu'il ne veut pas que tu prennes une mauvaise décision sans le savoir.",
 choix:[
  {lab:"Le remercier et alléger l'autre discrètement",r:"Personne n'a rien vu, et l'autre a tenu. C'est exactement ce qu'il fallait faire.",d:5,ton:"calme"},
  {lab:"Lui demander comment il peut aider",r:"Il prend deux séances par semaine sur son dos, sans le dire à l'autre.",d:5,ton:"chaud"},
  {lab:"Lui dire que ce n'est pas à lui de te rapporter ça",r:"Il regrette d'avoir parlé. La prochaine fois, tu ne sauras rien.",d:-4,ton:"sec"}]},

{cle:"col_05",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il te demande de trancher un désaccord technique entre eux deux. Les deux positions se défendent, et il le sait très bien.",
 choix:[
  {lab:"Trancher en sa faveur, et expliquer pourquoi",r:"Il gagne et il apprécie surtout d'avoir eu droit à une raison.",d:3,ton:"clair",effet:"arbitrer_pour_lui"},
  {lab:"Trancher contre lui, et expliquer pourquoi",r:"Il n'aime pas la décision et il respecte l'argument. Il l'appliquera correctement.",d:-3,ton:"ferme",effet:"arbitrer_contre_lui"},
  {lab:"Refuser de trancher et leur demander un essai comparé",r:"L'idée les intéresse tous les deux. Le tapis décidera mieux que toi.",d:4,ton:"malin"}]},

{cle:"col_06",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il te dit que l'autre coach parle de lui dans son dos aux combattants. Il n'a pas de preuve, il a des retours, et il est très remonté.",
 choix:[
  {lab:"Vérifier toi-même avant de décider quoi que ce soit",r:"Tu vérifies. C'est vrai à moitié, et cette moitié-là devait être traitée.",d:3,ton:"prudent"},
  {lab:"Les mettre face à face dans ce bureau",r:"Ça crie une fois, puis ça s'explique. Ils repartent en ayant vidé quelque chose.",d:3,ton:"ferme"},
  {lab:"Le croire sur parole et sanctionner l'autre",r:"Tu as tranché sans savoir. L'histoire te reviendra dans la figure au printemps.",d:2,ton:"impulsif",effet:"arbitrer_pour_lui"},
  {lab:"Lui dire d'arrêter d'écouter les ragots",r:"Il se tait. Le problème, lui, continue dans les couloirs.",d:-4,ton:"sec"}]},

{cle:"col_07",sujet:"le_collegue",si:"toujours",vie:"saison",
 texte:"Il te propose de travailler à deux sur un même combattant avec l'autre coach, alors qu'ils ne s'entendent pas. Il dit que le gars y gagnerait.",
 choix:[
  {lab:"Accepter et le laisser organiser",r:"Ça marche. Ils ne deviennent pas amis, et ils font le meilleur travail de l'année.",d:5,ton:"chaud"},
  {lab:"Lui demander comment il compte gérer les désaccords",r:"Il a prévu une règle simple pour ça. Elle tiendra toute la préparation.",d:4,ton:"clair"},
  {lab:"Refuser, ça finira mal",r:"Il te répond qu'il proposait justement pour que ça finisse bien.",d:-3,ton:"prudent"}]},

{cle:"col_08",sujet:"le_collegue",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il en a assez de partager le même créneau que l'autre, que le tapis est trop petit et qu'il perd la moitié de sa séance à négocier l'espace.",
 choix:[
  {lab:"Redécouper les créneaux dès la semaine prochaine",r:"Le problème disparaît en une semaine. Vous auriez pu le faire il y a un an.",d:4,ton:"clair"},
  {lab:"Lui donner la priorité sur le créneau",r:"Il l'obtient, et l'autre le prend très mal. Tu viens de choisir un camp.",d:3,ton:"ferme",effet:"arbitrer_pour_lui"},
  {lab:"Donner la priorité à l'autre, cette fois",r:"Il s'incline sans discuter et il termine sa saison à l'étroit.",d:-3,ton:"ferme",effet:"arbitrer_contre_lui"},
  {lab:"Leur dire de s'arranger",r:"Ils s'arrangent mal. Le plus fort des deux prend tout, et ce n'est pas le meilleur.",d:-4,ton:"mou"}]},

{cle:"col_09",sujet:"le_collegue",si:"seul_au_staff",vie:"courante",
 texte:"Il n'y a personne d'autre au staff et c'est précisément le sujet : il te dit qu'il n'a personne avec qui discuter d'un cas difficile, et que ça lui manque.",
 choix:[
  {lab:"Lui promettre de recruter quelqu'un pour qu'il ne soit plus seul",r:"Il te croit et il attend. Cette promesse-là aura une date de péremption.",d:4,ton:"engage"},
  {lab:"Lui proposer de discuter avec toi de ces cas-là",r:"Vous prenez l'habitude. Ce n'est pas un coach, et c'est mieux que rien.",d:3,ton:"chaud"},
  {lab:"Lui dire que c'est le prix de la liberté qu'il a ici",r:"Il te concède le point et il reste aussi seul qu'avant.",d:-3,ton:"neutre"}]},

{cle:"col_10",sujet:"le_collegue",si:"partage_sa_case",vie:"courante",
 texte:"Ils sont deux sur le même domaine et personne n'a jamais dit qui décide. Il te demande de le dire, une fois pour toutes.",
 choix:[
  {lab:"Lui donner la main sur le domaine",r:"Il prend la responsabilité au sérieux, et l'autre apprend la nouvelle avec un pincement.",d:4,ton:"ferme",effet:"arbitrer_pour_lui"},
  {lab:"Donner la main à l'autre, et le lui dire en face",r:"Il n'aime pas, et il te respecte d'avoir tranché plutôt que d'avoir fui.",d:-2,ton:"ferme",effet:"arbitrer_contre_lui"},
  {lab:"Répartir clairement le domaine en deux",r:"Chacun sait ce qui est à lui. Les frottements s'arrêtent en quinze jours.",d:4,ton:"clair"},
  {lab:"Laisser les choses comme elles sont",r:"Elles restent comme elles sont, c'est-à-dire mauvaises pour les deux.",d:-4,ton:"mou"}]},

{cle:"col_11",sujet:"le_collegue",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te dit qu'il n'a rien contre l'autre, mais qu'il ne supporte pas de le voir bâcler. Le mot est dur et il l'assume complètement.",
 choix:[
  {lab:"Lui demander des faits, pas une impression",r:"Il en donne trois, datés et précis. Deux tiennent, et il faudra les traiter.",d:3,ton:"clair"},
  {lab:"Lui dire que tu iras voir par toi-même",r:"Il apprécie que tu ne le croies pas sur parole. C'est bon signe pour les deux.",d:4,ton:"prudent"},
  {lab:"Lui dire que le mot est trop fort et qu'il le retire",r:"Il le retire, sans rien retirer de ce qu'il pense.",d:-3,ton:"ferme"}]},

{cle:"col_12",sujet:"le_collegue",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne critique pas l'autre. Il te décrit simplement une séance qu'il a vue, sans commentaire, et il te laisse tirer tes propres conclusions.",
 choix:[
  {lab:"Tirer les conclusions à voix haute devant lui",r:"Il ne confirme ni n'infirme. Il t'a amené exactement là où il voulait.",d:3,ton:"malin"},
  {lab:"Lui demander ce qu'il en pense, lui",r:"Il finit par le dire, à contrecoeur, et c'est mesuré et juste.",d:4,ton:"calme"},
  {lab:"Lui reprocher de ne pas assumer sa critique",r:"Il te répond qu'il ne critiquait pas, et il redevient muet pour un mois.",d:-4,ton:"sec"}]},

{cle:"col_13",sujet:"le_collegue",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'il a engueulé l'autre coach dans le vestiaire, devant deux gamins, et qu'il vient te le dire avant que tu l'apprennes autrement.",
 choix:[
  {lab:"Le remercier d'être venu de lui-même",r:"Il n'échappe pas au recadrage, et il sait qu'il a eu raison de venir.",d:3,ton:"franc"},
  {lab:"Lui demander d'aller réparer devant les mêmes gamins",r:"Il le fait. Le vestiaire retient qu'ici, on répare, et c'est une leçon utile.",d:3,ton:"ferme"},
  {lab:"Le sanctionner, et lui donner tort sur le fond",r:"Il accepte la sanction et il conteste le fond jusqu'au bout.",d:-4,ton:"dur",effet:"arbitrer_contre_lui"}]},

{cle:"col_14",sujet:"le_collegue",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te propose de prendre la responsabilité du staff, de coordonner les autres. Il l'a préparé, et il t'explique pourquoi ce serait mieux pour la salle.",
 choix:[
  {lab:"Lui confier cette responsabilité",r:"Il la prend et il la porte bien. Le staff devient une équipe en une saison.",d:5,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui demander de commencer par organiser une réunion mensuelle",r:"Il commence petit et il finit par tout tenir. C'était la bonne marche.",d:4,ton:"clair"},
  {lab:"Lui dire que le staff, c'est toi qui le coordonnes",r:"Il ne le proposera plus. Il continuera à le faire officieusement, en silence.",d:-3,ton:"ferme"}]},

{cle:"col_15",sujet:"le_collegue",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il te dit tout net que si l'autre reste, lui partira, et qu'il préfère te le dire maintenant plutôt qu'en posant une lettre dans six mois.",
 choix:[
  {lab:"Lui demander ce qu'il faudrait pour que ça devienne vivable",r:"Des créneaux séparés, et qu'on tranche quand ils ne sont pas d'accord. La troisième — que l'autre s'excuse — est un caprice, et il le sait.",d:3,ton:"calme"},
  {lab:"Lui dire que tu ne choisis pas sous la menace",r:"Il encaisse et il te respecte pour ça. Rien n'est réglé pour autant.",d:-2,ton:"ferme"},
  {lab:"Lui dire que tu le garderas, lui",r:"Il obtient ce qu'il voulait. Il vient aussi d'apprendre que la menace fonctionne.",d:2,ton:"engage",effet:"arbitrer_pour_lui"},
  {lab:"Lui répondre que la porte est ouverte, alors",r:"Il se lève. Vous savez tous les deux que ça se terminera comme ça.",d:-6,ton:"froid"}]},

{cle:"col_16",sujet:"le_collegue",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te parle du jeune coach que vous avez pris, et il te demande la permission de le former lui-même plutôt que de le laisser se débrouiller.",
 choix:[
  {lab:"Lui confier le jeune",r:"Le gamin apprend en un an ce que d'autres mettent cinq ans à comprendre.",d:5,ton:"chaud",effet:"lui_donner_une_case"},
  {lab:"Lui demander d'en parler d'abord au jeune",r:"Il le fait. Le gamin dit oui tout de suite, et l'attelage tient des années.",d:4,ton:"clair"},
  {lab:"Lui dire que chacun apprend à ses dépens",r:"Il te répond que c'est vrai, et que c'est aussi comme ça qu'on perd des gens.",d:-4,ton:"sec"}]},

{cle:"col_17",sujet:"le_collegue",si:"un_trou_a_cote",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il tient le domaine du coach qui manque en plus du sien, et il te dit que le prochain que tu recruteras, il aimerait le choisir avec toi.",
 choix:[
  {lab:"Accepter et le mettre dans la boucle du recrutement",r:"Il s'implique énormément. L'homme qui arrivera sera accueilli au lieu d'être subi.",d:5,ton:"engage"},
  {lab:"Lui demander le profil qu'il voit",r:"Il décrit quelqu'un qui ne lui ressemble pas du tout. C'est bon signe.",d:4,ton:"clair"},
  {lab:"Lui dire que le recrutement, ce n'est pas son affaire",r:"Il continuera à tenir deux domaines et il n'aura pas son mot à dire sur le troisième.",d:-4,ton:"sec"}]},

{cle:"col_18",sujet:"le_collegue",si:"chaud",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il te parle de l'autre coach comme d'un frère avec qui il s'engueule, et il te demande de ne surtout pas prendre leurs disputes au sérieux.",
 choix:[
  {lab:"Lui promettre de ne pas t'en mêler",r:"Il est soulagé. Beaucoup de patrons auraient cassé quelque chose en voulant réparer.",d:5,ton:"chaud"},
  {lab:"Lui demander comment tu sauras si ça devient sérieux",r:"Il te donne un signe précis à surveiller. Tu le surveilleras.",d:4,ton:"clair"},
  {lab:"Intervenir quand même la prochaine fois",r:"Ils te regardent tous les deux comme un intrus. Ils avaient raison.",d:-4,ton:"maladroit"}]},

{cle:"col_19",sujet:"le_collegue",si:"apres_un_depart",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"L'autre coach vient de partir et il se retrouve seul du jour au lendemain. Il te dit qu'il ne s'attendait pas à ce que ça lui fasse quelque chose.",
 choix:[
  {lab:"Lui laisser le temps avant de parler du remplacement",r:"Il apprécie. Vous en reparlerez dans quinze jours, mieux.",d:4,ton:"calme"},
  {lab:"Lui demander d'assurer l'intérim, avec une date de fin",r:"Il tient l'intérim jusqu'à la date, exactement, et il compte les jours.",d:2,ton:"ferme",effet:"lui_donner_une_case"},
  {lab:"Lui dire que ça fait de la place pour lui",r:"Ce n'est pas comme ça qu'il le vit, et ta phrase le lui rappelle mal.",d:-4,ton:"maladroit"}]},

{cle:"col_20",sujet:"le_collegue",si:"je_l_ai_recadre",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Depuis que tu l'as repris, il évite l'autre coach au lieu de régler leurs différends, de peur qu'un nouvel accrochage lui retombe dessus.",
 choix:[
  {lab:"Lui dire que le recadrage portait sur la forme, pas sur le fond",r:"Il reprend contact avec l'autre dès le lendemain, autrement.",d:4,ton:"clair"},
  {lab:"Les faire travailler ensemble sur un dossier précis",r:"Ils sont obligés de se parler. Au bout de trois semaines, ça roule.",d:4,ton:"malin"},
  {lab:"Lui dire qu'il fait bien de se tenir à distance",r:"La distance devient définitive, et le staff n'en est plus un.",d:-4,ton:"mou"}]},

{cle:"apr_01",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Tu lui demandes ce qu'il fera après. Il te répond qu'il n'y pense jamais, ce qui est faux, et vous le savez tous les deux.",
 choix:[
  {lab:"Lui dire que tu poses la question sérieusement",r:"Il finit par répondre, et sa réponse est beaucoup plus précise qu'annoncé.",d:4,ton:"franc"},
  {lab:"Lui dire que tu voudrais qu'il finisse ici",r:"Il ne s'y attendait pas. C'est la phrase qu'il retiendra de l'année.",d:5,ton:"chaud"},
  {lab:"Passer à autre chose",r:"Le sujet se referme. Il ne l'ouvrira plus de lui-même.",d:-3,ton:"neutre"}]},

{cle:"apr_02",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il aimerait ouvrir sa propre salle un jour, et il te le dit en te regardant, pour voir comment tu le prends.",
 choix:[
  {lab:"Lui dire que tu l'aideras le jour venu",r:"Il n'y croyait pas. Il restera trois ans de plus, justement à cause de cette phrase.",d:5,ton:"franc"},
  {lab:"Lui demander où, et quand",r:"Il a une ville et une échéance. Ce n'est pas un rêve, c'est un projet.",d:4,ton:"clair"},
  {lab:"Lui rappeler qu'il a un contrat ici",r:"Il te répond qu'il le sait, et qu'il t'avait fait l'honneur de te prévenir.",d:-5,ton:"froid"}]},

{cle:"apr_03",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il ne sait pas faire autre chose, et que c'est bien ça le problème : il ne peut pas s'arrêter, même quand son corps le demande.",
 choix:[
  {lab:"Lui proposer d'apprendre autre chose, aux frais de la salle",r:"Il part se former à quelque chose qui n'a rien à voir. Il revient plus léger.",d:5,ton:"chaud",effet:"l_envoyer_se_former"},
  {lab:"Lui dire qu'il y a de la place ici, hors du tapis",r:"Il découvre qu'il peut vieillir dans cette maison. Ça change sa façon de travailler.",d:5,ton:"franc"},
  {lab:"Lui dire qu'il a encore de belles années devant lui",r:"Il te remercie. Il n'a pas eu de réponse, et il n'en redemandera pas.",d:-3,ton:"mou"}]},

{cle:"apr_04",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il te parle de la retraite comme d'un mur. Pas de projet, pas de date, juste un mur au bout du couloir dont il n'aime pas parler.",
 choix:[
  {lab:"L'aider à mettre une date et un projet dessus",r:"Le mur devient une porte en une conversation. Il en dort mieux.",d:5,ton:"clair"},
  {lab:"Lui proposer de passer progressivement à autre chose ici",r:"Il accepte l'idée d'une transition. Ce mot-là ne lui était jamais venu.",d:4,ton:"calme"},
  {lab:"Lui dire qu'on verra ça le moment venu",r:"C'est exactement ce que tout le monde lui répond. Il n'espérait rien d'autre.",d:-3,ton:"mou"}]},

{cle:"apr_05",sujet:"l_apres",si:"toujours",vie:"saison",
 texte:"Il te demande, très sérieusement, ce que la salle fera de lui quand il ne pourra plus tenir le rythme. Il veut une réponse, pas une politesse.",
 choix:[
  {lab:"Lui promettre une place ici, quoi qu'il arrive",r:"Il te fait répéter, puis il te croit. Il ne t'en reparlera plus jamais, et il s'en souviendra toujours.",d:5,ton:"grave"},
  {lab:"Lui répondre honnêtement que tu ne peux rien garantir",r:"Il apprécie qu'on ne lui mente pas, et il repart avec son inquiétude entière.",d:2,ton:"franc"},
  {lab:"Lui dire que ce jour est loin",r:"Il te répond qu'il est plus près que tu ne le crois, et il a raison.",d:-4,ton:"mou"}]},

{cle:"apr_06",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il voudrait former les coachs plutôt que les combattants, un jour, et il n'a jamais osé le dire à personne.",
 choix:[
  {lab:"Lui dire de commencer dès maintenant, ici",r:"Il commence. Deux ans plus tard, la salle a trois coachs formés par lui.",d:5,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui payer une vraie formation pour ça",r:"Il revient avec un métier de plus, et il ne partira pas de sitôt.",d:5,ton:"chaud",effet:"l_envoyer_se_former"},
  {lab:"Lui dire que ça ne fait pas vivre une salle",r:"Il range son idée. Elle ne ressortira pas dans ce bureau.",d:-4,ton:"sec"}]},

{cle:"apr_07",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il t'annonce qu'il a reçu une proposition pour une fédération, un poste au chaud, moins de tapis et plus de bureau. Il ne sait pas quoi en penser.",
 choix:[
  {lab:"L'aider à peser le pour et le contre, honnêtement",r:"Vous en parlez une heure. Il décide de rester, et la décision est vraiment la sienne.",d:5,ton:"franc"},
  {lab:"Lui dire ce que tu perdrais s'il partait",r:"Il ne savait pas qu'il pesait autant. Ça change sa façon d'aborder l'offre.",d:4,ton:"chaud"},
  {lab:"Lui dire de prendre le poste",r:"Il le prend. Tu avais peut-être raison, et la salle mettra un an à s'en remettre.",d:-4,ton:"neutre",effet:"accepter_son_depart"}]},

{cle:"apr_08",sujet:"l_apres",si:"toujours",vie:"courante",
 texte:"Il te dit que le jour où il partira, il aimerait que ce soit propre : préavis long, passation, et pas une porte qui claque. Il te le dit maintenant, à froid.",
 choix:[
  {lab:"Lui promettre la même chose de ton côté",r:"L'accord tient en deux phrases et il tiendra dix ans. Ce genre de chose se paie très tard.",d:5,ton:"franc"},
  {lab:"Lui demander pourquoi il pense à ça aujourd'hui",r:"Il n'a rien en tête. Il a juste vu partir un ami dans de mauvaises conditions.",d:4,ton:"calme"},
  {lab:"Lui demander s'il a déjà un pied dehors",r:"Il n'en avait pas. Ta question vient d'en poser un.",d:-5,ton:"soupcon"}]},

{cle:"apr_09",sujet:"l_apres",si:"parle_de_l_apres",vie:"courante",
 texte:"Il y pense sérieusement, maintenant. Ce n'est plus une conversation en l'air : il a regardé les chiffres et il a une échéance en tête.",
 choix:[
  {lab:"Lui demander l'échéance, et travailler avec",r:"Il la donne. Vous organisez les deux dernières saisons ensemble, proprement.",d:5,ton:"clair"},
  {lab:"Lui proposer de rester à temps réduit après",r:"Il n'y avait pas pensé. C'est peut-être la solution qui arrange tout le monde.",d:5,ton:"calme"},
  {lab:"Accepter son départ et commencer à chercher",r:"Il apprécie la clarté et il trouve que ça va très vite. Les deux sont vrais.",d:-1,ton:"ferme",effet:"accepter_son_depart"},
  {lab:"Lui dire qu'il te lâche au mauvais moment",r:"Il te répond qu'il n'y a jamais de bon moment, et il a raison.",d:-5,ton:"dur"}]},

{cle:"apr_10",sujet:"l_apres",si:"fin_proche",vie:"saison",
 texte:"C'est sa dernière saison et tout le monde le sait. Il vient te parler de ce qu'il laisse derrière lui plus que de ce qu'il fera après.",
 choix:[
  {lab:"Lui demander ce qu'il veut absolument transmettre avant de partir",r:"Il a une liste. Vous la traitez point par point jusqu'au dernier jour.",d:5,ton:"grave"},
  {lab:"Lui proposer de choisir son successeur",r:"Il prend ça comme le plus grand des respects, et il choisit bien.",d:5,ton:"chaud"},
  {lab:"Lui dire que la salle continuera sans lui",r:"C'est vrai et ce n'était pas la chose à dire cette année-là.",d:-5,ton:"maladroit"}]},

{cle:"apr_11",sujet:"l_apres",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te dit qu'il refuse de finir comme les vieux coachs qu'il a connus, à traîner dans une salle où plus personne ne les écoute.",
 choix:[
  {lab:"Lui promettre de le lui dire quand ce moment viendra",r:"Il te fait promettre deux fois. C'est le service le plus difficile qu'on puisse rendre.",d:5,ton:"grave"},
  {lab:"Lui dire que ce n'est pas la trajectoire qu'il prend",r:"Il te croit à moitié, et la moitié suffit pour cette semaine.",d:3,ton:"calme"},
  {lab:"Lui dire que tout le monde finit comme ça",r:"Il te regarde longuement. Ce n'est pas une réponse, c'est une condamnation.",d:-5,ton:"dur"}]},

{cle:"apr_12",sujet:"l_apres",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne répond pas à la question. Il te parle de son jardin, d'un chien qu'il voudrait, d'une maison à retaper. C'est sa façon de répondre.",
 choix:[
  {lab:"Le suivre sur son jardin",r:"Vous parlez de tout sauf de la salle pendant une heure. C'est la meilleure heure du mois.",d:5,ton:"chaud"},
  {lab:"Lui faire remarquer qu'il a donc bien un après",r:"Il sourit, pris en flagrant délit. Il admet qu'il y pense tous les jours.",d:4,ton:"malin"},
  {lab:"Le ramener au sujet",r:"Il redevient vague immédiatement. Tu venais de fermer la seule porte ouverte.",d:-3,ton:"pressé"}]},

{cle:"apr_13",sujet:"l_apres",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit que ce qui lui fait peur, ce n'est pas d'arrêter, c'est le silence du matin quand il n'y aura plus de séance à préparer.",
 choix:[
  {lab:"Lui dire que la porte de la salle lui restera ouverte",r:"Il ne dit rien pendant un moment. Puis il te remercie, et il le pense.",d:5,ton:"grave"},
  {lab:"Lui proposer de garder un créneau, même après",r:"L'idée le remet debout. Un créneau, c'est peu, et c'est une raison de se lever.",d:5,ton:"chaud"},
  {lab:"Lui dire qu'il s'habituera",r:"Il te répond que c'est bien ce qui l'inquiète, justement.",d:-4,ton:"maladroit"}]},

{cle:"apr_14",sujet:"l_apres",si:"toujours",vie:"saison",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te propose de préparer sa succession dès maintenant, alors qu'il lui reste des années. Il dit qu'une salle qui dépend d'un homme est une salle fragile.",
 choix:[
  {lab:"Accepter et le laisser former son remplaçant",r:"Il forme quelqu'un pendant trois ans. Le jour du départ, personne ne sent la marche.",d:5,ton:"engage",effet:"lui_donner_une_case"},
  {lab:"Lui demander de mettre sa méthode par écrit d'abord",r:"Le document existe. Il vaut plus que n'importe quel recrutement d'urgence.",d:4,ton:"clair"},
  {lab:"Lui dire que c'est prématuré",r:"Il n'insiste pas. Le jour où il partira, tout partira avec lui.",d:-4,ton:"mou"}]},

{cle:"apr_15",sujet:"l_apres",si:"toujours",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il t'annonce qu'une salle concurrente lui propose de la diriger. Il ne t'a pas encore répondu, et il est venu te voir avant de le faire.",
 choix:[
  {lab:"Surenchérir pour le garder, tout de suite",r:"Il refuse l'autre offre le soir même. Ça t'aura coûté cher et ça valait le coup.",d:5,ton:"ferme",effet:"le_retenir"},
  {lab:"Lui demander ce qui l'attire vraiment là-bas",r:"Ce n'est ni l'argent ni le titre. C'est une chose que tu peux lui donner ici.",d:5,ton:"clair"},
  {lab:"Accepter son départ, et le lui souhaiter sincèrement",r:"Il part en bons termes, et il enverra des combattants chez toi pendant dix ans.",d:1,ton:"franc",effet:"accepter_son_depart"},
  {lab:"Lui dire qu'un homme loyal ne serait pas venu poser ça sur ce bureau",r:"Il repart avec sa réponse toute faite. Tu viens de décider à sa place.",d:-6,ton:"dur"}]},

{cle:"apr_16",sujet:"l_apres",si:"toujours",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te dit qu'il aimerait, quand ce sera fini, qu'il reste quelque chose de lui dans la salle. Pas une plaque : une façon de faire.",
 choix:[
  {lab:"Lui dire que c'est déjà le cas, et lui montrer où",r:"Il ne s'en était pas rendu compte. Il regarde sa salle autrement en sortant.",d:5,ton:"chaud"},
  {lab:"Lui proposer d'écrire cette façon de faire avec lui",r:"Vous y passez des soirées. Le document sert encore longtemps après.",d:5,ton:"engage"},
  {lab:"Lui dire que rien ne reste jamais",r:"Il ne répond pas. Tu viens de lui retirer la seule chose qu'il demandait.",d:-5,ton:"dur"}]},

{cle:"apr_17",sujet:"l_apres",si:"vieux",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Son corps ne suit plus les séances et il commence à faire des choses qu'il ne faisait pas : s'asseoir, déléguer la démonstration, écourter.",
 choix:[
  {lab:"Réorganiser son poste autour de ce qu'il sait encore faire",r:"Il retrouve de l'utilité au lieu de compenser. C'est un homme différent en un mois.",d:5,ton:"clair",effet:"lui_lacher_une_case"},
  {lab:"Lui adjoindre un jeune pour les démonstrations",r:"Le tandem marche bien. Il enseigne, le jeune montre, tout le monde y gagne.",d:5,ton:"malin"},
  {lab:"Faire semblant de ne rien voir",r:"Il continue à faire semblant lui aussi. Ça tiendra jusqu'à la blessure.",d:-4,ton:"mou"}]},

{cle:"apr_18",sujet:"l_apres",si:"il_monte",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il est en pleine ascension et l'après ne l'intéresse pas du tout. Il te dit que c'est une question de vieux et qu'il a autre chose à faire.",
 choix:[
  {lab:"Lui donner raison et refermer le sujet",r:"Il retourne travailler, content. La question reviendra dans dix ans, entière.",d:2,ton:"calme"},
  {lab:"Lui faire remarquer que c'est maintenant que ça se prépare",r:"Il n'aime pas l'entendre et il y repensera. C'est déjà beaucoup.",d:3,ton:"clair"},
  {lab:"Insister lourdement",r:"Il finit par te demander si tu comptes te débarrasser de lui.",d:-4,ton:"maladroit"}]},

{cle:"apr_19",sujet:"l_apres",si:"ancien",vie:"saison",voix:["bourru","taiseux","chaleureux"],
 texte:"Il est là depuis si longtemps qu'il parle de la salle comme d'une maison qui lui appartient un peu. Il te demande, à demi-mot, si c'est vrai.",
 choix:[
  {lab:"Lui dire que oui, et le dire simplement",r:"Il ne répond rien. C'est la phrase qu'il attendait depuis des années.",d:5,ton:"chaud"},
  {lab:"Lui donner un signe concret plutôt qu'une phrase",r:"Le signe vaut mieux que le mot. Il le montrera à sa femme le soir même.",d:5,ton:"franc"},
  {lab:"Lui rappeler à qui appartient la salle",r:"Il baisse les yeux et il s'excuse presque. Tu n'oublieras pas ce moment-là.",d:-6,ton:"froid"}]},

{cle:"apr_20",sujet:"l_apres",si:"je_lui_ai_promis",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il revient sur ce que tu lui avais promis, et il te demande si ça vaut encore pour l'après, ou seulement tant qu'il est utile.",
 choix:[
  {lab:"Confirmer que la promesse tient, quoi qu'il arrive",r:"Il repart apaisé, et il travaillera encore mieux, ce qui n'était pas le but.",d:5,ton:"franc"},
  {lab:"Reconnaître que tu n'y avais pas pensé, et t'engager maintenant",r:"L'honnêteté vaut mieux qu'une belle phrase. Il le prend comme ça.",d:4,ton:"grave"},
  {lab:"Lui dire que les promesses ont une durée de vie",r:"Il hoche la tête lentement. Il vient d'apprendre ce que valent les tiennes.",d:-6,ton:"froid"}]},

{cle:"ung_21",sujet:"un_gars",si:"pas_son_poulain",vie:"courante",
 texte:"Tu poses le nom de {gars} et il te fait remarquer, sans reproche, qu'il ne s'occupe pas de lui et qu'il te répondra donc de loin.",
 choix:[
  {lab:"Lui demander ce qu'il en voit quand même, de loin",r:"De loin, il voit deux choses que celui qui le suit de près ne voit plus. Elles sont justes.",d:4,ton:"clair"},
  {lab:"Lui confier {gars} pour de bon",r:"Il prend, à condition de faire à sa manière. C'est la seule condition qu'il pose.",d:4,ton:"engage",effet:"lui_confier_un_gars"},
  {lab:"Lui demander d'en parler avec celui qui le suit",r:"Ils en parlent le soir même. Ce qui en sort est meilleur que ce que l'un ou l'autre aurait dit.",d:3,ton:"calme"},
  {lab:"Lui reprocher de ne pas s'intéresser à tout le groupe",r:"Il te répond qu'il s'intéresse à ceux qu'on lui donne, et qu'on ne lui a pas donné celui-là.",d:-4,ton:"sec"}]},

{cle:"ung_22",sujet:"un_gars",si:"pas_son_poulain",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il t'écoute parler de {gars} et il finit par lâcher qu'il le prendrait volontiers, mais qu'il ne demandera pas, parce que ça ne se fait pas entre coachs.",
 choix:[
  {lab:"Le lui donner, puisqu'il le veut",r:"Il n'a rien demandé et il a tout obtenu. Il travaillera comme un homme qui doit quelque chose.",d:5,ton:"franc",effet:"lui_confier_un_gars"},
  {lab:"Lui demander ce qu'il ferait de lui",r:"Il déroule un an de travail en cinq minutes. Il y pense depuis bien plus longtemps que ce matin.",d:4,ton:"clair"},
  {lab:"Lui dire que chacun garde ses hommes",r:"Il approuve, parce que c'est la règle qu'il vient d'énoncer lui-même. Ça lui coûte quand même.",d:-3,ton:"ferme"}]},

{cle:"ung_23",sujet:"un_gars",si:"gars_cuit",vie:"courante",
 texte:"Tu prononces le nom de {gars} et il te coupe : il te dit que cet homme-là est vide, qu'il donne le change à l'entraînement, et que ça se paiera en cage.",
 choix:[
  {lab:"Le faire lever le pied tout de suite",r:"Il allège la semaine sans en faire une affaire. Personne d'autre ne le remarque.",d:5,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui demander depuis quand il le voit",r:"Depuis six semaines. Il te l'avait signalé une fois, en passant, et tu n'avais pas relevé.",d:3,ton:"grave"},
  {lab:"Lui demander de tenir jusqu'au combat",r:"Il tient. Il te regarde d'une drôle de façon quand le combat se passe comme il l'avait dit.",d:-4,ton:"dur"}]},

{cle:"ung_24",sujet:"un_gars",si:"gars_cuit",vie:"courante",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il te parle de {gars} en baissant la voix, comme s'il craignait qu'on entende : ce n'est pas le corps qui a lâché, c'est le reste, et ça ne se voit sur aucun test.",
 choix:[
  {lab:"Lui demander de rester près de lui, sans rien changer d'autre",r:"Il le fait, discrètement, pendant des semaines. C'est ce qui remet l'homme debout.",d:5,ton:"chaud",effet:"menager_un_gars"},
  {lab:"Lui demander ce qui l'a mis dans cet état",r:"Il sait. Ce n'est pas la salle, et ça explique tout ce que tu prenais pour de la paresse.",d:4,ton:"grave"},
  {lab:"Lui dire que ça ne se mesure pas, donc que ça n'existe pas",r:"Il ne répond pas. Il ne te parlera plus jamais de ce qui ne se mesure pas.",d:-5,ton:"froid"}]},

{cle:"ung_25",sujet:"un_gars",si:"gars_blesse",vie:"courante",
 texte:"Tu lui parles de {gars}, à l'arrêt. Il te dit que le plus dur commence maintenant, et que ce n'est pas le genou le problème.",
 choix:[
  {lab:"Lui demander de garder l'homme dans le groupe pendant l'arrêt",r:"Il lui invente un rôle dès le lendemain. L'homme vient tous les jours et il ne coule pas.",d:5,ton:"chaud"},
  {lab:"Lui demander combien de temps, honnêtement",r:"Il donne une durée plus longue que celle du médecin, et il aura raison.",d:3,ton:"clair"},
  {lab:"Lui dire de se concentrer sur ceux qui s'entraînent",r:"Il obéit. L'homme blessé ne remet plus les pieds à la salle et ne revient jamais.",d:-5,ton:"froid"}]},

{cle:"ung_26",sujet:"un_gars",si:"gars_blesse",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il te dit que la blessure de {gars} n'est pas un accident : il l'a vue venir dans la façon dont l'homme se protégeait depuis un mois, et il n'a pas su l'arrêter.",
 choix:[
  {lab:"Lui dire que ce n'est pas à lui de tout arrêter tout seul",r:"Il encaisse mal le compliment et il en a besoin. Il travaillera mieux la semaine d'après.",d:4,ton:"franc"},
  {lab:"Lui demander comment on repère ça plus tôt",r:"Il décrit trois signes. Ils entrent dans la routine de la salle et ils resserviront.",d:5,ton:"clair"},
  {lab:"Lui dire qu'effectivement, il aurait dû l'arrêter",r:"Il ne se défend pas. Il se le disait déjà, et tu viens de le graver.",d:-6,ton:"dur"}]},

{cle:"ung_27",sujet:"un_gars",si:"gars_lance",vie:"courante",
 texte:"Tu poses le nom de {gars}, qui enchaîne. Il te dit que c'est exactement le moment où on fait les erreurs les plus chères, parce que tout marche.",
 choix:[
  {lab:"Lui demander ce qu'il ne faut surtout pas faire maintenant",r:"Il en cite deux. Vous les évitez toutes les deux, et la série continue.",d:5,ton:"clair"},
  {lab:"Le mettre dans le coin pour le prochain",r:"Il prend la place et il la mérite. Il connaît l'homme mieux que personne en ce moment.",d:4,ton:"engage",effet:"le_mettre_au_coin"},
  {lab:"Lui dire de ne rien casser tant que ça gagne",r:"Il te répond que c'est comme ça qu'on se réveille deux ans plus tard avec un homme qui plafonne.",d:-3,ton:"tendu"}]},

{cle:"ung_28",sujet:"un_gars",si:"gars_lance",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il te parle de {gars} sans une once d'enthousiasme, alors que tout le monde n'a que ce nom à la bouche. Il t'explique qu'il regarde la façon, pas le résultat.",
 choix:[
  {lab:"Lui demander ce que la façon lui dit",r:"Elle lui dit qu'un défaut se creuse pendant que les victoires le cachent. Il a un dessin pour ça.",d:5,ton:"clair"},
  {lab:"Lui demander de corriger, quitte à casser la série",r:"Il corrige. La série s'arrête, et l'homme est meilleur six mois plus tard.",d:4,ton:"ferme"},
  {lab:"Lui dire de profiter comme tout le monde",r:"Il sourit poliment. C'est la deuxième fois que tu le vois faire semblant.",d:-3,ton:"leger"}]},

{cle:"ung_29",sujet:"un_gars",si:"gars_vieux",vie:"courante",
 texte:"Tu lui parles de {gars}, qui n'a plus l'âge d'encaisser ce qu'il encaissait. Il te dit qu'il faudra choisir, et bientôt, entre l'utiliser et le garder.",
 choix:[
  {lab:"Choisir de le garder, et le dire clairement",r:"Il te remercie d'avoir tranché. Il détestait porter cette question tout seul.",d:5,ton:"grave",effet:"menager_un_gars"},
  {lab:"Lui demander combien de combats il lui reste",r:"Il répond à voix basse, en montrant sa main, et il n'aime pas sa propre réponse.",d:3,ton:"grave"},
  {lab:"Lui demander de le préparer pour un dernier gros soir",r:"Il le prépare. Le soir venu, personne dans la salle ne respire normalement.",d:1,ton:"tendu",effet:"le_mettre_au_coin"},
  {lab:"Lui dire qu'on l'use tant qu'il rapporte",r:"Il ne répond pas. Il vient d'apprendre ce que vaut un homme ici, et il en fait partie.",d:-6,ton:"froid"}]},

{cle:"ung_30",sujet:"un_gars",si:"gars_vieux",vie:"saison",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit que {gars} lui a demandé, à lui et pas à toi, ce qu'il devrait faire de la fin de sa carrière. Il vient te le dire parce qu'il n'a pas voulu répondre seul.",
 choix:[
  {lab:"Lui dire de répondre honnêtement, et que la salle suivra",r:"Il répond honnêtement. La conversation qui suit décidera des trois années de cet homme.",d:5,ton:"grave"},
  {lab:"Aller en parler tous les trois",r:"Vous en parlez. C'est inconfortable et personne ne regrette de l'avoir fait.",d:5,ton:"franc"},
  {lab:"Lui demander de renvoyer le gars vers toi",r:"Il le renvoie. Le gars ne vient pas : ce n'est pas à toi qu'il voulait le demander.",d:-3,ton:"ferme"}]},

{cle:"ung_31",sujet:"un_gars",si:"gars_jeune",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit que {gars} apprend plus vite que ce que la salle sait lui donner, et qu'il faudra bientôt l'envoyer se frotter ailleurs ou le regarder s'ennuyer.",
 choix:[
  {lab:"Lui demander d'organiser ça avec les salles qu'il connaît",r:"Il passe trois coups de téléphone. Le gamin part deux semaines et revient méconnaissable.",d:5,ton:"clair"},
  {lab:"Le lui confier pour de bon, et le laisser décider",r:"Il prend, et il fait exactement ce qu'il avait annoncé, au calendrier près.",d:4,ton:"engage",effet:"lui_confier_un_gars"},
  {lab:"Lui dire qu'on ne prête pas ses gamins aux voisins",r:"Il te répond que le gamin partira quand même, mais sans billet de retour.",d:-4,ton:"sec"}]},

{cle:"ung_32",sujet:"un_gars",si:"son_poulain",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Tu lui parles de {gars} et il te demande, très directement, si tu es en train de lui reprocher quelque chose ou de lui demander quelque chose.",
 choix:[
  {lab:"Lui dire que c'est une demande, et laquelle",r:"La demande est claire et il l'exécute sans discuter. La franchise a fait gagner une heure.",d:4,ton:"clair"},
  {lab:"Lui dire que c'est un reproche, et lequel",r:"Il conteste un point sur trois, ce qui est honnête. Les deux autres sont corrigés dans la semaine.",d:2,ton:"ferme"},
  {lab:"Lui rendre {gars} et confier le gamin à un autre",r:"Il rend le dossier sans un mot. Ce silence-là coûtera plus cher que la décision.",d:-5,ton:"froid",effet:"lui_rendre_un_gars"},
  {lab:"Lui dire que ce n'est ni l'un ni l'autre",r:"Alors il ne comprend pas pourquoi il est assis là, et il n'a pas tort.",d:-3,ton:"flou"}]}
);

/* ==================================================================== */
/* BORD_DU_TAPIS */
/* ==================================================================== */
bord_du_tapis.push(
{cle:"bdt_01",si:"toujours",vie:"courante",
 texte:"Il t'attrape par la manche à la fin du cours, serviette autour du cou, et te dit deux phrases qu'il n'aurait pas dites dans un bureau.",
 choix:[
  {lab:"L'écouter là, debout, sans le faire monter",r:"Il dit tout en deux minutes. Dans un bureau, il aurait mis une heure à ne rien dire.",d:4,ton:"calme"},
  {lab:"Lui proposer de monter en parler au calme",r:"Il monte, et il perd la moitié de ce qu'il voulait dire dans l'escalier.",d:0,ton:"neutre"},
  {lab:"Lui dire que tu es pressé",r:"Il te lâche la manche. Ce qu'il avait à dire ne se redira pas.",d:-4,ton:"pressé"}]},

{cle:"bdt_02",si:"toujours",vie:"courante",
 texte:"Il te montre un gamin au fond de la salle sans le désigner du doigt, et il te dit simplement de le regarder finir sa série.",
 choix:[
  {lab:"Regarder jusqu'au bout",r:"Le gamin finit sa série comme personne. Tu comprends pourquoi il t'a arrêté.",d:4,ton:"clair"},
  {lab:"Lui demander ce qu'il veut que tu voies",r:"Il te le dit en trois mots, et c'est encore mieux que de le voir.",d:3,ton:"calme"},
  {lab:"Dire que tu verras ça plus tard",r:"Il retourne au tapis. Il ne te montrera plus personne.",d:-4,ton:"pressé"}]},

{cle:"bdt_03",si:"toujours",vie:"courante",
 texte:"Il te glisse en passant qu'un de tes hommes est venu avec une blessure qu'il cache, et il repart avant que tu puisses répondre.",
 choix:[
  {lab:"Le rattraper pour avoir le nom",r:"Il lâche « {autre} » à voix basse. La blessure est prise avant qu'elle devienne sérieuse.",d:4,ton:"clair"},
  {lab:"Lui faire confiance et le laisser gérer",r:"Il gère. Le gars est arrêté deux semaines et personne n'a eu à se justifier.",d:3,ton:"calme"},
  {lab:"Attendre qu'il revienne t'en parler",r:"Il ne revient pas. La blessure devient une opération au printemps.",d:-4,ton:"neutre"}]},

{cle:"bdt_04",si:"toujours",vie:"courante",
 texte:"Il te croise dans le couloir et te dit qu'il faudrait racheter des tapis avant que quelqu'un se fasse mal. Ce n'est pas la première fois qu'il le dit.",
 choix:[
  {lab:"Lui dire que tu commandes ça cette semaine",r:"Il ne te croit qu'à moitié. Quand les tapis arrivent, il vient te le dire.",d:4,ton:"ferme"},
  {lab:"Lui demander de te faire une liste précise",r:"La liste est sur ton bureau le lendemain matin, chiffrée et raisonnable.",d:3,ton:"clair"},
  {lab:"Lui répondre qu'il en a déjà parlé",r:"Il te répond que oui, justement, et il continue son chemin.",d:-4,ton:"sec"}]},

{cle:"bdt_05",si:"toujours",vie:"courante",
 texte:"Il finit sa séance en nage et te dit, essoufflé, qu'il vient de comprendre un truc sur un de tes combattants. Il n'a pas encore les mots.",
 choix:[
  {lab:"Le laisser chercher ses mots",r:"Il les trouve au bout d'un moment, et ce qu'il dit vaut trois réunions.",d:4,ton:"calme"},
  {lab:"Lui demander de te l'écrire quand ce sera clair",r:"Tu reçois un message le soir même, long et précis.",d:3,ton:"clair"},
  {lab:"Lui dire de revenir quand il aura les mots",r:"Il ne revient pas. L'idée s'évapore comme la sueur.",d:-3,ton:"pressé"}]},

{cle:"bdt_06",si:"apres_victoire",vie:"courante",
 texte:"Le lendemain de la victoire, il te croise au bord du tapis et ne parle que de la semaine à venir, comme si rien ne s'était passé.",
 choix:[
  {lab:"Le forcer à savourer deux minutes",r:"Il cède, deux minutes exactement, puis il repart au travail. C'était déjà bien.",d:3,ton:"chaud"},
  {lab:"Le suivre sur la semaine à venir",r:"Vous travaillez. C'est ce qu'il voulait, et il ne le regrette pas.",d:2,ton:"neutre"},
  {lab:"Lui dire que personne ne sait faire la fête ici",r:"Il te répond que la fête, c'est le mois prochain, quand ça sera confirmé.",d:-3,ton:"sec"}]},

{cle:"bdt_07",si:"apres_defaite",vie:"courante",
 texte:"Il t'attend au bord du tapis avec la tête des mauvais jours. Il n'a pas dormi et il veut te parler avant que quelqu'un d'autre le fasse.",
 choix:[
  {lab:"L'écouter avant de dire quoi que ce soit",r:"Il vide tout d'une traite. À la fin, il te remercie de ne pas l'avoir interrompu.",d:4,ton:"calme"},
  {lab:"Lui dire que ce n'est pas le moment de décider quoi que ce soit",r:"Il approuve. Vous reprenez à froid trois jours plus tard, et c'est bien mieux.",d:4,ton:"clair"},
  {lab:"Trancher tout de suite, à chaud",r:"La décision prise ce jour-là sera à défaire dans un mois.",d:-4,ton:"impulsif"}]},

{cle:"bdt_08",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il t'arrête sans lâcher son chronomètre et te pose une question en une phrase, à laquelle il attend une réponse en un mot.",
 choix:[
  {lab:"Répondre en un mot",r:"Il hoche la tête et retourne à sa séance. Vous avez réglé la chose en cinq secondes.",d:4,ton:"franc"},
  {lab:"Lui demander de développer sa question",r:"Il développe, agacé, et la réponse était bien celle que tu allais donner.",d:0,ton:"neutre"},
  {lab:"Lui dire de venir au bureau pour ça",r:"Il te dit que ce n'était pas la peine, et il ne monte pas.",d:-3,ton:"pressé"}]},

{cle:"bdt_09",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne dit rien. Il te met la main sur l'épaule au passage et il désigne du menton un homme qui travaille seul dans un coin.",
 choix:[
  {lab:"Aller voir le gars toi-même",r:"Tu y vas. C'était exactement ce qu'il fallait faire, et il ne le dira jamais.",d:5,ton:"calme"},
  {lab:"Lui demander ce qu'il se passe",r:"Il répond deux mots. Ils suffisent, et il n'en dira pas plus.",d:3,ton:"neutre"},
  {lab:"Hocher la tête et continuer ton chemin",r:"Il retire sa main. Il ne t'en désignera plus.",d:-4,ton:"pressé"}]},

{cle:"bdt_10",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il t'attrape pour te dire qu'un des gars a besoin d'entendre quelque chose de toi, pas de lui, et que ça ne peut pas attendre lundi.",
 choix:[
  {lab:"Aller lui parler avant de partir ce soir",r:"Tu y vas. Le gamin ne dira rien, et sa semaine change complètement.",d:5,ton:"chaud"},
  {lab:"Lui demander quoi dire exactement",r:"Il te souffle quoi dire : que tu l'as vu travailler, et rien de plus. C'est court, et c'est exactement ça.",d:4,ton:"clair"},
  {lab:"Lui dire que c'est son rôle, pas le tien",r:"Il te répond que non, pas cette fois, et il a raison.",d:-4,ton:"sec"}]},

{cle:"bdt_11",si:"toujours",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il t'arrête avec un carnet à la main et te montre une page couverte de croquis. Il veut ton avis tout de suite, dans le bruit des sacs.",
 choix:[
  {lab:"Regarder sérieusement, malgré le bruit",r:"Tu prends le carnet. Il t'explique en criant, et l'idée est bonne.",d:4,ton:"clair"},
  {lab:"Lui proposer d'en reparler avec un café",r:"Il accepte et il arrive au café avec trois pages de plus.",d:3,ton:"chaud"},
  {lab:"Lui dire que tu ne comprends rien à ses dessins",r:"Il referme le carnet. Il ne te le remontrera pas.",d:-4,ton:"sec"}]},

{cle:"bdt_13",si:"a_un_espoir",vie:"courante",
 texte:"Il t'arrête au bord du tapis et te désigne, sans le nommer, un des gars du groupe du soir. Il te dit juste de venir voir la même chose jeudi prochain.",
 choix:[
  {lab:"Revenir jeudi, comme demandé",r:"Tu reviens. Tu vois la même chose, en mieux, et tu comprends pourquoi il t'a fait déplacer.",d:5,ton:"clair"},
  {lab:"Lui demander de te dire tout de suite ce qu'il voit",r:"C'est {autre}, et il t'explique quoi regarder. En mots c'est moins convaincant qu'en vrai, il le sait.",d:2,ton:"neutre"},
  {lab:"Lui dire que tu n'as pas le temps de venir voir des gamins",r:"Il retourne au tapis. Le gamin signera ailleurs dans l'année.",d:-5,ton:"pressé"}]},

{cle:"bdt_12",si:"disperse",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Il court d'un tapis à l'autre et te croise entre deux. Il te dit qu'il n'a pas trois minutes à toi, et c'est exactement le problème.",
 choix:[
  {lab:"Lui prendre un domaine dès demain",r:"Le lendemain, il a trois minutes. Et la semaine d'après, une heure.",d:5,ton:"ferme",effet:"lui_lacher_une_case"},
  {lab:"Lui bloquer un créneau fixe avec toi chaque semaine",r:"Le créneau tient. C'est la meilleure décision d'organisation de la saison.",d:4,ton:"clair"},
  {lab:"Lui dire que c'est bon signe, une salle qui tourne",r:"Il te répond que c'est un bon signe pour la salle, pas pour le travail.",d:-4,ton:"sec"}]}
);

/* ==================================================================== */
/* DEBRIEF */
/* ==================================================================== */
debrief.push(
{cle:"deb_01",si:"toujours",vie:"courante",
 texte:"Il arrive avec ses notes du combat, écrites pendant la nuit. Il veut tout reprendre, rond par rond, avant que les souvenirs se réarrangent.",
 choix:[
  {lab:"Tout reprendre avec lui, comme il le demande",r:"Vous y passez la matinée. Trois choses en sortent, et elles serviront des années.",d:5,ton:"clair"},
  {lab:"Lui demander de commencer par ce qui a marché",r:"Il commence par là, à contrecoeur, et il finit par reconnaître qu'il y en avait beaucoup.",d:4,ton:"calme"},
  {lab:"Lui dire que le combat est fini et qu'on passe à la suite",r:"Il range ses notes. Il les gardera, et il ne les montrera plus.",d:-4,ton:"pressé"}]},

{cle:"deb_02",si:"apres_defaite",vie:"courante",
 texte:"Il te dit qu'il a mal préparé le combat et qu'il l'a compris à la fin du premier round. Il le dit avant que tu l'accuses de quoi que ce soit.",
 choix:[
  {lab:"Lui demander ce qu'il ferait différemment",r:"Il a la réponse. Elle est précise et elle sera appliquée dès la prochaine préparation.",d:4,ton:"clair"},
  {lab:"Lui dire que la préparation n'explique pas tout",r:"Il apprécie et il n'en démord pas. Il portera ce combat un moment.",d:4,ton:"calme"},
  {lab:"Confirmer que oui, c'était sa faute",r:"Il ne conteste pas. Il ne viendra plus jamais s'accuser lui-même devant toi.",d:-6,ton:"dur"}]},

{cle:"deb_03",si:"apres_defaite",vie:"courante",
 texte:"Il te dit que le combattant a fait exactement l'inverse de ce qu'ils avaient préparé, dès la première minute, et qu'il n'a rien pu faire depuis le coin.",
 choix:[
  {lab:"Lui demander comment on évite ça la prochaine fois",r:"Il propose de changer la façon de préparer les consignes. L'idée est bonne.",d:4,ton:"clair"},
  {lab:"Lui demander si le gars l'écoute, en général",r:"La réponse est plus inquiétante que le combat lui-même, et elle devait être posée.",d:4,ton:"grave"},
  {lab:"Lui dire qu'un bon coach se fait écouter",r:"Il encaisse la phrase. Elle est fausse et elle fait mal quand même.",d:-5,ton:"dur"}]},

{cle:"deb_04",si:"apres_victoire",vie:"courante",
 texte:"On a gagné et il vient quand même avec une liste de corrections. Il te dit qu'après une victoire, personne n'écoute, et que c'est justement pour ça qu'il insiste.",
 choix:[
  {lab:"L'écouter maintenant, tant que c'est frais",r:"Ses corrections sont justes. Elles seront traitées avant que quiconque les oublie.",d:5,ton:"clair"},
  {lab:"Lui demander de les garder pour lundi",r:"Il les garde et il les ressort intactes. Il ne perd jamais une note.",d:3,ton:"calme"},
  {lab:"Lui dire de profiter, pour une fois",r:"Il sourit et il range sa liste. Deux combats plus tard, la même erreur coûte cher.",d:-3,ton:"leger"}]},

{cle:"deb_05",si:"apres_titre",vie:"saison",
 texte:"Le lendemain du titre, il arrive au bureau avant tout le monde. Il n'a pas dormi, il n'a pas fêté, et il veut parler de la suite.",
 choix:[
  {lab:"Lui dire de rentrer dormir, la suite attendra",r:"Il rentre. Il t'envoie un message le soir pour dire qu'il n'avait pas réalisé.",d:5,ton:"chaud"},
  {lab:"Parler de la suite avec lui, puisqu'il est là",r:"Vous organisez l'année en deux heures. C'est la meilleure réunion que vous ayez eue.",d:4,ton:"clair"},
  {lab:"Lui dire qu'il ne sait vraiment pas s'arrêter",r:"Il te répond que c'est vrai, et il repart travailler pour ne pas y penser.",d:-3,ton:"maladroit"}]},

{cle:"deb_06",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il a arrêté de donner des consignes au troisième round parce que le gars ne pouvait plus rien entendre, et il se demande s'il a eu raison.",
 choix:[
  {lab:"Lui dire qu'il a eu raison, et pourquoi",r:"Il en avait besoin. Personne ne lui avait jamais validé ce genre de silence.",d:5,ton:"clair"},
  {lab:"Lui demander ce qu'il aurait pu dire d'utile",r:"Il cherche honnêtement et il ne trouve rien. C'est donc qu'il a bien fait.",d:4,ton:"calme"},
  {lab:"Lui dire qu'un coach parle, c'est son travail",r:"Il te répond que parler pour rien, dans un coin, ça s'appelle du bruit.",d:-4,ton:"sec"}]},

{cle:"deb_07",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il aurait dû jeter l'éponge au deuxième round et qu'il ne l'a pas fait. Il en parle avec une voix qu'on ne lui connaît pas.",
 choix:[
  {lab:"Lui dire que la décision lui appartenait, et qu'on ne la refait pas",r:"Il te remercie. Ça ne l'empêchera pas d'y penser, et ça l'empêche de couler.",d:5,ton:"grave"},
  {lab:"Lui demander ce qui l'a retenu",r:"Il l'explique. Ce n'est ni la gloire ni le score, c'est le regard du gamin.",d:4,ton:"grave"},
  {lab:"Lui dire qu'il ne recommencera pas",r:"Il te répond que non, plus jamais, et il le pense vraiment.",d:2,ton:"ferme"},
  {lab:"Lui reprocher de ne pas avoir protégé son homme",r:"Il ne se défend pas. Ce reproche-là, il se le fait déjà tout seul, en boucle.",d:-5,ton:"dur"}]},

{cle:"deb_08",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il déroule le combat comme une leçon, avec un plan et des exemples. Il a manifestement préparé ce débrief comme il prépare une séance.",
 choix:[
  {lab:"Suivre le plan jusqu'au bout",r:"C'est long et c'est excellent. Tu ressors en ayant appris deux choses.",d:5,ton:"clair"},
  {lab:"Lui demander de sauter à la conclusion",r:"La conclusion tient en une phrase et elle est bonne. Le chemin manquait, un peu.",d:1,ton:"pressé"},
  {lab:"Lui dire que ce n'est pas un cours",r:"Il referme son plan. Le prochain débrief tiendra en trois mots.",d:-4,ton:"sec"}]},

{cle:"deb_09",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne débriefe pas le combat. Il te demande d'abord comment va le combattant ce matin, et il attend la réponse avant de parler technique.",
 choix:[
  {lab:"Lui donner des nouvelles du gars avant tout",r:"Il souffle. Il n'aurait pas pu parler technique sans savoir ça.",d:5,ton:"chaud"},
  {lab:"Lui dire d'aller le voir lui-même",r:"Il y va dans l'heure. C'était sans doute la meilleure chose à faire.",d:4,ton:"calme"},
  {lab:"Lui dire de se concentrer sur le combat",r:"Il parle du combat, correctement, et il pense à autre chose tout du long.",d:-4,ton:"sec"}]},

{cle:"deb_10",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il ne veut pas débriefer. Il te dit qu'il a besoin de deux jours avant de pouvoir en parler sans dire de bêtises.",
 choix:[
  {lab:"Lui donner ses deux jours",r:"Il revient le surlendemain avec une analyse claire et froide. Ça valait l'attente.",d:5,ton:"calme"},
  {lab:"Lui demander juste une phrase, maintenant",r:"La phrase est bonne, et elle lui coûte. Il tiendra le reste jusqu'à jeudi.",d:2,ton:"ferme"},
  {lab:"Insister pour tout reprendre maintenant",r:"Il dit des bêtises, comme annoncé, et vous perdez la matinée à les défaire.",d:-4,ton:"pressé"}]},

{cle:"deb_11",si:"toujours",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te dit que la vraie leçon du combat n'a rien à voir avec le combat : elle est dans les six semaines d'avant, et il peut te montrer où exactement.",
 choix:[
  {lab:"Lui demander de te montrer",r:"Il remonte le fil jusqu'à une séance précise. Il a raison et c'est troublant.",d:5,ton:"clair"},
  {lab:"Lui demander ce qu'il change pour la prochaine préparation",r:"Il change deux choses. Les deux tiendront et les deux se verront.",d:4,ton:"calme"},
  {lab:"Lui dire que c'est du bavardage",r:"Il ne bavarde jamais. Tu viens seulement de lui apprendre que tu ne l'avais pas encore compris.",d:-5,ton:"sec"}]},

{cle:"deb_12",si:"a_un_poulain",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"C'est son poulain qui a combattu et il n'arrive pas à en parler comme d'un dossier. Il commence trois phrases et il n'en finit aucune.",
 choix:[
  {lab:"Lui laisser le temps de trouver comment en parler",r:"Il finit par y arriver. Ce qu'il dit alors vaut tous les débriefs de l'année.",d:5,ton:"grave"},
  {lab:"Lui proposer de débriefer avec l'autre coach, à froid",r:"L'idée le soulage. Le débrief à trois est meilleur qu'il ne l'aurait été à deux.",d:4,ton:"calme"},
  {lab:"Lui dire de prendre du recul sur ses gars",r:"Il te répond que le jour où il prendra du recul, tu pourras le remercier.",d:-4,ton:"sec"}]}
);

/* ==================================================================== */
/* ACCROCHAGE */
/* ==================================================================== */
accrochage.push(
{cle:"acc_01",si:"toujours",vie:"courante",
 texte:"Il entre sans frapper et il a déjà commencé sa phrase dans le couloir. Ce n'est pas une conversation qui s'ouvre, c'est une colère qui arrive.",
 choix:[
  {lab:"Le laisser vider son sac en entier",r:"Il parle deux minutes, s'arrête, et s'excuse presque. La suite est raisonnable.",d:4,ton:"calme"},
  {lab:"Lui demander de s'asseoir d'abord",r:"Le simple fait de s'asseoir fait baisser la pression de moitié.",d:3,ton:"ferme"},
  {lab:"Lui répondre sur le même volume",r:"Deux hommes qui crient dans un bureau, ça s'entend jusqu'au vestiaire.",d:-5,ton:"dur"}]},

{cle:"acc_02",si:"toujours",vie:"courante",
 texte:"Il te reproche d'avoir décidé quelque chose qui touche son travail sans lui en parler. Il a raison sur le fond et il est très mal parti sur la forme.",
 choix:[
  {lab:"Reconnaître le fond, refuser la forme",r:"Il accepte les deux. La règle qui sort de là vous servira longtemps.",d:4,ton:"ferme"},
  {lab:"Répondre au fond seulement, ignorer le ton",r:"Le fond se règle. Le ton reviendra la prochaine fois, en pire.",d:1,ton:"calme"},
  {lab:"Ne répondre qu'au ton",r:"Il repart en ayant l'impression qu'on lui a refusé le droit de dire quelque chose de vrai.",d:-4,ton:"sec"}]},

{cle:"acc_03",si:"toujours",vie:"courante",
 texte:"L'accrochage n'est pas avec toi : il vient de s'engueuler avec l'autre coach devant les gars, et il monte pour que tu tranches à chaud.",
 choix:[
  {lab:"Refuser de trancher à chaud, fixer un rendez-vous à trois",r:"Il n'aime pas attendre. Le rendez-vous règle en une heure ce que la colère aurait pourri.",d:4,ton:"ferme"},
  {lab:"Lui donner raison tout de suite",r:"Il a gagné. L'autre l'apprendra dans l'heure, et il ne l'oubliera pas.",d:3,ton:"impulsif",effet:"arbitrer_pour_lui"},
  {lab:"Lui donner tort tout de suite",r:"Il redescend au tapis en silence. Vous n'avez pas encore entendu sa version.",d:-4,ton:"impulsif",effet:"arbitrer_contre_lui"}]},

{cle:"acc_04",si:"toujours",vie:"courante",
 texte:"Il te dit que tu lui as menti. Pas exagéré, pas oublié : menti. Il attend de savoir ce que tu vas faire de ce mot.",
 choix:[
  {lab:"Reconnaître le mensonge et l'expliquer",r:"Il encaisse. Ce n'est pas réparé, et c'est la seule façon que ça le devienne un jour.",d:2,ton:"grave"},
  {lab:"Lui demander de reprendre les faits avec toi",r:"En reprenant, il apparaît que c'était un malentendu. Il retire le mot, sincèrement.",d:4,ton:"calme"},
  {lab:"Lui interdire de te parler comme ça",r:"Il se tait. Le mot reste, et il ne servira plus qu'à l'intérieur de sa tête.",d:-5,ton:"dur"}]},

{cle:"acc_05",si:"toujours",vie:"courante",
 texte:"Il refuse une décision que tu viens de prendre et il te le dit sans crier, ce qui est nettement plus embêtant. Il ne l'appliquera pas.",
 choix:[
  {lab:"Lui demander ce qui se passe s'il ne l'applique pas",r:"Il a réfléchi aux conséquences. Il les accepte. C'est une position, pas un caprice.",d:2,ton:"grave"},
  {lab:"Lui demander de te convaincre",r:"Il te convainc à moitié. Vous sortez avec une version modifiée que les deux tiennent.",d:4,ton:"clair"},
  {lab:"Lui rappeler qui décide ici",r:"Il applique la décision à la lettre, sans y mettre un gramme de lui-même.",d:-4,ton:"dur"}]},

{cle:"acc_06",si:"froid",vie:"courante",
 texte:"L'accrochage arrive après des semaines de froid. Ce n'est pas cette histoire-là qui l'énerve : c'est tout ce qui n'a pas été dit avant.",
 choix:[
  {lab:"Le dire à voix haute : le sujet n'est pas le sujet",r:"Il s'arrête net. La vraie conversation commence enfin, et elle était en retard.",d:5,ton:"franc"},
  {lab:"Régler le sujet du jour et laisser le reste",r:"Le sujet du jour se règle. Le reste ressortira dans quinze jours.",d:-1,ton:"neutre"},
  {lab:"Lui reprocher de tout ramener au passé",r:"Il te répond que le passé n'a jamais été traité, et il n'a pas tort.",d:-4,ton:"sec"}]},

{cle:"acc_07",si:"je_ne_tiens_jamais_parole",vie:"courante",
 texte:"Il monte pour une broutille, et tout le monde comprend que la broutille n'est qu'un prétexte. Ce qu'il te reproche, c'est la promesse d'avant.",
 choix:[
  {lab:"Aller directement à la vraie question",r:"Il baisse la garde. Vous parlez enfin de ce qui compte, et ça ne se réglera pas en un jour.",d:3,ton:"grave"},
  {lab:"Tenir la promesse maintenant : son salaire monte ce mois-ci",r:"C'est la seule monnaie qui vaille encore. Il la prend, sans triomphe.",d:5,ton:"ferme",effet:"monter_au_bareme"},
  {lab:"Traiter la broutille et rien d'autre",r:"La broutille est réglée. Le reste va continuer à pourrir tranquillement.",d:-4,ton:"mou"}]},

{cle:"acc_08",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il argumente son désaccord pendant dix minutes sans hausser le ton une seule fois. C'est plus difficile à gérer qu'une colère.",
 choix:[
  {lab:"Prendre le temps de répondre point par point",r:"Vous y passez l'après-midi. Il repart en partie satisfait, et respecté entièrement.",d:5,ton:"clair"},
  {lab:"Lui accorder deux points sur cinq",r:"Il trouve ça honnête. Il reviendra sur les trois autres, plus tard, mieux armé.",d:4,ton:"franc"},
  {lab:"Lui dire que la décision est prise, point",r:"Il range ses arguments. Il ne t'en préparera plus jamais.",d:-5,ton:"dur"}]},

{cle:"acc_09",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne dit pas qu'il n'est pas d'accord. Il pose une question, puis une autre, et chaque question est un désaccord soigneusement emballé.",
 choix:[
  {lab:"Ouvrir l'emballage et nommer le désaccord",r:"Il admet. La conversation devient franche et beaucoup plus courte.",d:4,ton:"malin"},
  {lab:"Répondre honnêtement à chaque question",r:"Au bout de la quatrième, il te dit que tu as sans doute raison. Il le pense à moitié.",d:2,ton:"calme"},
  {lab:"Lui dire d'arrêter de tourner autour",r:"Il arrête de tourner et il arrête de demander. Il n'y avait qu'une seule façon d'y arriver, et ce n'était pas celle-là.",d:-4,ton:"sec"}]},

{cle:"acc_10",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il t'annonce qu'il ne fera pas ce que tu demandes parce que c'est mauvais pour un de ses hommes. Il ne discute même pas le principe.",
 choix:[
  {lab:"Lui demander de te montrer pourquoi c'est mauvais",r:"Il montre. Il a raison, et la demande était mal calibrée dès le départ.",d:4,ton:"clair"},
  {lab:"Lui dire que tu retires ta demande",r:"Il ne s'attendait pas à ça. C'est un homme qu'on vient de gagner pour longtemps.",d:5,ton:"franc"},
  {lab:"Maintenir la demande et le mettre au pied du mur",r:"Il exécute et le gars le paie. Il t'en tiendra rigueur, à raison.",d:-5,ton:"dur"}]},

{cle:"acc_11",si:"toujours",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te reproche de le laisser dans le flou depuis des mois : ni recadré, ni soutenu, ni rien. Il dit qu'il préférerait presque une engueulade.",
 choix:[
  {lab:"Lui donner l'engueulade franche qu'il réclame",r:"Ça dure dix minutes et ça règle un an de brouillard. Il redescend en sifflant.",d:4,ton:"ferme"},
  {lab:"Reconnaître le flou et poser un cadre précis",r:"Il note tout. C'est exactement ce qui manquait, et il le dit.",d:5,ton:"clair"},
  {lab:"Lui dire que pas de nouvelles, bonnes nouvelles",r:"Il te répond que c'est une phrase de patron, pas une phrase d'homme.",d:-4,ton:"mou"}]},

{cle:"acc_12",si:"sous_paye",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"L'accrochage part sur un détail d'organisation et il finit sur l'argent en trois phrases. C'était là depuis le début, sous la surface.",
 choix:[
  {lab:"Arrêter la dispute et parler du salaire pour de bon",r:"La dispute s'éteint d'elle-même. Vous parlez enfin de la vraie chose.",d:4,ton:"franc"},
  {lab:"Régler le salaire tout de suite, au tarif du marché",r:"Il n'a plus rien à reprocher, et il est le premier surpris.",d:5,ton:"ferme",effet:"monter_au_bareme"},
  {lab:"Lui dire de ne pas tout mélanger",r:"Il te répond que ce n'est pas lui qui mélange, c'est sa vie.",d:-4,ton:"sec"}]}
);

/* ==================================================================== */
/* PORTE */
/* ==================================================================== */
porte.push(
{cle:"por_01",si:"toujours",vie:"saison",
 texte:"Il pose une lettre sur le bureau et il reste debout. Il n'a pas l'air soulagé du tout, ce qui veut dire que la décision n'est peut-être pas prise.",
 choix:[
  {lab:"Ne pas ouvrir la lettre et lui demander ce qui se passe",r:"Il s'assoit. La lettre reste fermée toute la conversation, et elle repart avec lui.",d:5,ton:"grave"},
  {lab:"Lui demander ce qu'il faudrait pour qu'il la reprenne",r:"Deux choses : qu'on lui dise les choses en face, et qu'on arrête de décider de son travail sans lui. Moins cher que tu ne craignais.",d:4,ton:"franc",effet:"le_retenir"},
  {lab:"Ouvrir la lettre et l'accepter",r:"C'est net et c'est définitif. Il aurait peut-être voulu qu'on lui demande.",d:-2,ton:"ferme",effet:"accepter_son_depart"},
  {lab:"Lui dire que tu ne retiens personne",r:"Il reprend la lettre, la pose sur ton bureau, et sort. Vous en resterez là.",d:-6,ton:"froid"}]},

{cle:"por_02",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il a passé un entretien ailleurs. Il te le dit lui-même, avant que tu l'apprennes autrement, et ça compte.",
 choix:[
  {lab:"Le remercier de te l'avoir dit et lui demander pourquoi",r:"Il donne une raison précise. Elle est réparable, et il ne le savait pas.",d:4,ton:"franc"},
  {lab:"Faire une contre-proposition sérieuse",r:"Il annule le second entretien le soir même.",d:5,ton:"ferme",effet:"le_retenir"},
  {lab:"Lui dire qu'il est libre",r:"Il est libre, en effet. Il partira, et vous saurez tous les deux quand ça s'est joué.",d:-5,ton:"froid",effet:"accepter_son_depart"}]},

{cle:"por_03",si:"toujours",vie:"courante",
 texte:"Il ne parle pas de partir. Il te demande simplement s'il y a encore une place pour lui ici dans deux ans, et il attend vraiment la réponse.",
 choix:[
  {lab:"Lui dire oui, et lui dire laquelle",r:"Il repart avec un horizon. Il ne cherchera pas ailleurs cette année.",d:5,ton:"clair"},
  {lab:"Lui répondre que ça dépendra de la salle, honnêtement",r:"Il apprécie l'honnêteté et il commence quand même à regarder autour.",d:1,ton:"franc"},
  {lab:"Éviter la question",r:"Il a sa réponse. Ce n'est pas celle que tu voulais donner, et c'est celle qu'il a entendue.",d:-5,ton:"flou"}]},

{cle:"por_04",si:"toujours",vie:"courante",
 texte:"Il te dit qu'il part, que c'est décidé, et que ce n'est pas contre toi. Il a l'air d'avoir répété la phrase plusieurs fois.",
 choix:[
  {lab:"Accepter et organiser une passation propre",r:"Il part en trois mois, proprement, et la salle ne perd presque rien.",d:2,ton:"ferme",effet:"accepter_son_depart"},
  {lab:"Lui demander une dernière fois ce qui le ferait rester",r:"Il réfléchit vraiment, puis il dit non. Au moins, la question a été posée.",d:3,ton:"franc"},
  {lab:"Lui dire de partir tout de suite, alors",r:"Il vide son casier dans l'heure. Tout le vestiaire regarde.",d:-6,ton:"dur",effet:"accepter_son_depart"}]},

{cle:"por_05",si:"fin_proche",vie:"saison",
 texte:"Il vient te dire qu'il arrête à la fin de la saison. Ce n'est pas un départ vers ailleurs : c'est la fin, et il le dit avec beaucoup de calme.",
 choix:[
  {lab:"Lui demander comment il veut que ça se passe",r:"Il a tout prévu, jusqu'à la dernière séance. Il ne reste qu'à respecter son plan.",d:5,ton:"grave"},
  {lab:"Lui proposer de rester à temps réduit",r:"Il n'y avait pas pensé. Il dit qu'il va y réfléchir, et il y réfléchit vraiment.",d:5,ton:"chaud",effet:"le_retenir"},
  {lab:"Prendre acte et passer au remplacement",r:"C'est efficace. C'est aussi la seule chose qu'il retiendra de cette journée.",d:-4,ton:"froid",effet:"accepter_son_depart"}]},

{cle:"por_06",si:"apres_un_depart",vie:"courante",
 texte:"Quelqu'un vient de partir et il vient te dire qu'il se pose des questions. Ce n'est pas une menace : c'est un homme qui a été secoué.",
 choix:[
  {lab:"Lui dire ce qui, dans ce départ, ne le concerne pas",r:"Il souffle. Il rangeait ce départ dans la mauvaise case depuis une semaine.",d:5,ton:"clair"},
  {lab:"Lui demander ce qui le ferait douter, lui",r:"Il énumère trois choses. Deux sont corrigeables cette semaine.",d:4,ton:"franc"},
  {lab:"Lui dire que la porte est ouverte pour tout le monde",r:"C'est exactement la phrase qui transforme un doute en décision.",d:-6,ton:"froid"}]},

{cle:"por_07",si:"toujours",vie:"courante",voix:["bourru","pedagogue","ambitieux"],
 texte:"Il t'annonce qu'on lui propose de monter une structure ailleurs, avec son nom dessus. Il n'est pas venu demander la permission, il est venu te le dire en face.",
 choix:[
  {lab:"Le féliciter sincèrement, et discuter du calendrier",r:"Il part bien, et il restera un ami de la maison pendant vingt ans.",d:3,ton:"chaud",effet:"accepter_son_depart"},
  {lab:"Lui proposer de monter cette structure avec toi, ici",r:"Il n'avait pas imaginé cette option. Elle change complètement la conversation.",d:5,ton:"ferme",effet:"le_retenir"},
  {lab:"Lui dire qu'il se surestime largement",r:"Il ne répond pas. Il réussira ailleurs, et il n'oubliera jamais cette phrase.",d:-6,ton:"dur"}]},

{cle:"por_08",si:"toujours",vie:"courante",voix:["taiseux","chaleureux","technicien"],
 texte:"Il ne dit rien de tout ça. Il te demande juste, à la fin d'une conversation banale, s'il fait toujours l'affaire ici. Le ton n'est pas banal du tout.",
 choix:[
  {lab:"T'arrêter et répondre vraiment",r:"Tu réponds, sérieusement, et pour la première fois depuis des mois il n'a plus l'air sur le départ.",d:5,ton:"grave"},
  {lab:"Lui demander d'où sort cette question",r:"Elle sort d'une remarque entendue de travers dans un couloir. Ça se répare en cinq minutes.",d:4,ton:"clair"},
  {lab:"Répondre oui, distraitement, en continuant ton travail",r:"Il sort. Tu ne sauras jamais ce que cette question a décidé.",d:-5,ton:"pressé"}]},

{cle:"por_09",si:"toujours",vie:"courante",voix:["bourru","taiseux","chaleureux"],
 texte:"Il te dit qu'il envisage de tout arrêter, pas seulement ici : le métier. Il en parle comme d'une fatigue, pas comme d'une colère.",
 choix:[
  {lab:"Lui proposer une vraie coupure avant qu'il décide",r:"Il prend un mois. Il revient avec l'envie, et il ne repartira pas.",d:5,ton:"chaud",effet:"le_retenir"},
  {lab:"L'écouter longuement sans rien proposer",r:"Il parle une heure. À la fin, il te dit que ça va déjà mieux.",d:4,ton:"grave"},
  {lab:"Lui dire de réfléchir et de revenir avec une décision",r:"Il revient avec une décision. Ce n'est pas celle que tu espérais.",d:-4,ton:"sec",effet:"accepter_son_depart"}]},

{cle:"por_10",si:"toujours",vie:"courante",voix:["pedagogue","ambitieux","technicien"],
 texte:"Il te présente son départ comme une évolution logique, avec un raisonnement propre. Le raisonnement est trop propre pour être toute la vérité.",
 choix:[
  {lab:"Lui demander la raison qui n'est pas dans le raisonnement",r:"Il finit par la donner. Elle est humaine, et elle se traite.",d:5,ton:"malin"},
  {lab:"Accepter le raisonnement tel quel",r:"Il part avec sa belle explication. Vous n'aurez jamais parlé de la vraie raison.",d:-2,ton:"neutre",effet:"accepter_son_depart"},
  {lab:"Lui dire que son raisonnement ne tient pas",r:"Il se braque et il s'accroche à son raisonnement jusqu'au bout.",d:-4,ton:"sec"}]},

{cle:"por_11",si:"chaud",vie:"courante",voix:["bourru","ambitieux","technicien"],
 texte:"Vous vous entendez bien et c'est précisément ce qui rend la conversation difficile : il te dit qu'il a une occasion, et qu'il s'en veut d'y penser.",
 choix:[
  {lab:"Lui dire de ne pas s'en vouloir, et regarder l'offre avec lui",r:"Vous la regardez ensemble. Il décide de rester, et c'est vraiment sa décision.",d:5,ton:"chaud"},
  {lab:"Faire jouer ce que vous avez construit ensemble",r:"Il reste, et il se demandera parfois s'il est resté pour les bonnes raisons.",d:2,ton:"ferme",effet:"le_retenir"},
  {lab:"Lui dire que l'amitié ne doit pas peser dans sa carrière",r:"Il part. Tu avais raison, et ça ne console de rien.",d:-3,ton:"franc",effet:"accepter_son_depart"}]},

{cle:"por_12",si:"ancien",vie:"saison",voix:["pedagogue","taiseux","chaleureux"],
 texte:"Il est là depuis toujours et il te dit qu'il commence à se sentir de trop. Ce n'est pas une plainte, c'est une observation, et elle est fausse.",
 choix:[
  {lab:"Lui montrer, concrètement, à quel point c'est faux",r:"Tu lui montres. Il n'avait rien vu de tout ça, et il en est retourné.",d:5,ton:"clair"},
  {lab:"Lui redonner une responsabilité visible",r:"Il retrouve une place et un rôle. La question ne se repose plus.",d:5,ton:"ferme",effet:"lui_donner_une_case"},
  {lab:"Lui dire que s'il le sent, c'est peut-être vrai",r:"Il hoche la tête. Il posera sa lettre avant la fin de la saison.",d:-6,ton:"froid"}]}
);

/* ung_10 a ete retire par Mael (03/09). C'etait la seule scene du
   declencheur gars_qui_doute — le crible du banc 39 l'a dit aussitot. Une
   scene de remplacement, a relire dans le tableau comme les autres. */
bureau.push(
{cle:"ung_33",sujet:"un_gars",si:"gars_qui_doute",vie:"courante",
 texte:"Tu poses le nom de {gars}, qui enchaîne les mauvais soirs. Il te dit qu'il ne sait plus si le problème est dans les jambes ou dans la tête, et que ça change tout.",
 choix:[
  {lab:"Lui demander ce qu'il ferait s'il devait parier",r:"Il parie sur la tête. Il a une idée pour ça, et elle ne coûte rien.",d:4,ton:"clair"},
  {lab:"Le sortir de la compétition le temps qu'il faut",r:"Il approuve. {gars} râle une semaine, puis il respire.",d:3,ton:"calme",effet:"menager_un_gars"},
  {lab:"Lui dire qu'un combat de plus lui remettra la tête à l'endroit",r:"Il ne répond pas. Il prépare le combat, et il n'y croit pas.",d:-4,ton:"dur"}]}
);

/* ==================================================================== */
const SCENES = { bureau, bord_du_tapis, debrief, accrochage, porte };
module.exports = { SCENES };
