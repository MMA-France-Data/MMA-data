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
  {lab:"Lui demander pourquoi il ne t'a pas prévenu plus tôt",r:"Il te répond qu'il vient de l'apprendre. C'était vrai, et tu l'apprends trop tard.",d:-4,ton:"soupcon"}]}
);

/* ==================================================================== */
/* BORD_DU_TAPIS */
/* ==================================================================== */
/* (vide — en attente des scènes de Mael) */

/* ==================================================================== */
/* DEBRIEF */
/* ==================================================================== */
/* (vide — en attente des scènes de Mael) */

/* ==================================================================== */
/* ACCROCHAGE */
/* ==================================================================== */
/* (vide — en attente des scènes de Mael) */

/* ==================================================================== */
/* PORTE */
/* ==================================================================== */
/* (vide — en attente des scènes de Mael) */

/* ==================================================================== */
/* /!\ CORPUS_PARTIEL : tant que Mael relit, le jeu ne porte QUE ce qu'il a
   relu (tableau/etat_corpus.json). Le banc 39 met alors ses assertions de
   COUVERTURE en attente — jamais celles de forme. */
const CORPUS_PARTIEL = true;
const SCENES = { bureau, bord_du_tapis, debrief, accrochage, porte };
module.exports = { SCENES, CORPUS_PARTIEL };
