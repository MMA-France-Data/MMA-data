/**
 * diner_scenes.js — LE CONTENU DE LA SOIRÉE. GÉNÉRÉ, NE PAS ÉDITER À LA
 * MAIN pour de petites retouches : c'est une DONNÉE, pas du code.
 *
 * (Mael, 01/09 : « beaucoup beaucoup plus de dialogue, prends ton
 * temps. ») Écrit par une escouade de dix agents — un par moment du
 * repas — puis relu par dix autres (français, ton, longueur, doublons,
 * équilibre des effets), puis contrôlé à l'entrée : conditions de la
 * liste fermée, clés uniques, renvois qui aboutissent, effets bornés.
 *
 * La mécanique qui joue tout ça est dans diner.js ; le banc 36 vérifie
 * CE fichier comme une donnée — y compris son volume, parce que c'était
 * la demande.
 *
 * Pour ajouter des scènes : les écrire ici à la main est possible (le
 * format est lisible), mais la vraie manière est de relancer l'escouade
 * et de régénérer.
 */
const SCENES = {
 "arrivee": [
  {
   "cle": "arrivee_deja_assis",
   "si": "toujours",
   "texte": "Il est là avant vous. Table du fond, dos au mur, téléphone retourné sur la nappe. Il se soulève à moitié pour vous serrer la main et se rassoit avant que vous ayez fini le geste. « Je suis toujours en avance. C’est la seule heure de la journée où personne ne me demande rien. »",
   "choix": [
    {
     "lab": "« Alors je ne vous demande rien tout de suite. »",
     "r": "Il sourit à peine, mais il sourit. « Vous tiendrez jusqu’au plat, pas plus. » Il pousse la carte vers vous sans la regarder : il la connaît par cœur.",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "M’excuser d’être en retard (je suis à l’heure)",
     "r": "« Vous êtes à l’heure. C’est moi qui suis en avance, ce n’est pas la même chose. » Les excuses qui ne servent à rien, il en entend toute la journée.",
     "d": -1,
     "ton": "prudent"
    },
    {
     "lab": "Lui demander pourquoi toujours cette table-là",
     "r": "« Dos au mur, je vois qui entre. Dans ce métier, on tombe toujours sur quelqu’un à qui on a dit non le mois dernier. » Il dit ça comme on parle de la pluie.",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Sortir mon téléphone et lui montrer une vidéo",
     "r": "Il regarde trois secondes, poliment, puis repose l’écran face contre la nappe. « On mange d’abord. Vos gars seront encore bons au dessert. »",
     "d": -3,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "arrivee_premiere_poignee",
   "si": "premier",
   "texte": "Il vous cherche des yeux, se trompe une fois de personne, puis vous trouve. La poignée de main est brève et sèche. « On ne s’est jamais parlé qu’au téléphone. Vous êtes plus jeune que votre voix. »",
   "choix": [
    {
     "lab": "« Vous êtes plus fatigué que la vôtre. »",
     "r": "Un silence court. Puis un rire, presque surpris d’être sorti. « Ça commence bien. » Il vous laisse la chaise qui a vue sur la salle.",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "Le remercier d’être venu",
     "r": "« Je viens tous les ans. Cette année, c’est vous. » Il ne dit pas ça pour être aimable : il vous situe.",
     "d": 1,
     "ton": "humble"
    },
    {
     "lab": "Lui rappeler mes trois mails restés sans réponse",
     "r": "« J’en reçois des centaines par jour, et je réponds à ceux qui règlent un problème le soir même. Ce n’est pas contre vous. » Il ne monte pas le ton. La soirée vient quand même de prendre un pli.",
     "d": -3,
     "ton": "sec"
    },
    {
     "lab": "Lui dire que tout le milieu parle de lui en bien",
     "r": "« Tout le milieu parle bien de moi jusqu’au jour où je refuse un combat. » Il déplie sa serviette. Le sujet est clos.",
     "d": -1,
     "ton": "flatteur"
    }
   ]
  },
  {
   "cle": "arrivee_retrouvailles",
   "si": "habitue",
   "texte": "Il vous voit entrer et lève deux doigts sans se lever. Vous n’êtes pas encore assis qu’il enchaîne : « L’an dernier, vous m’aviez dit que votre gaucher tiendrait la distance. Il a tenu deux rounds. » Il n’a pas l’air fâché. Il a l’air d’un homme qui note tout.",
   "choix": [
    {
     "lab": "« Je me suis trompé. Il n’était pas prêt. »",
     "r": "Il hoche la tête une fois. « Voilà. Les autres m’expliquent l’arbitrage, la coupure, le décalage horaire. Vous, vous dites que vous vous êtes trompé. » Il vous ressert de l’eau.",
     "d": 5,
     "ton": "franc"
    },
    {
     "lab": "Expliquer qu’il s’était blessé au camp",
     "r": "« Ils se blessent tous au camp. » Il ne vous coupe pas : il attend la fin, et vous vous entendez sonner creux.",
     "d": -2,
     "ton": "prudent"
    },
    {
     "lab": "« Vous vous souvenez de ce que je vous dis ? »",
     "r": "« Je me souviens de ce que tout le monde me dit. C’est comme ça que je sais qui écouter l’année suivante. » Vous venez de comprendre que ces dîners sont un examen.",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "Lui rappeler qu’il a gagné les trois suivants",
     "r": "« Contre qui ? » Il connaît la réponse, vous aussi. Aucun de ces noms ne vend un billet.",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "arrivee_froid_montre",
   "si": "froid",
   "texte": "Il est parfaitement courtois. Il se lève, vous serre la main, vous laisse le siège avec la vue. Puis il pose son téléphone à côté de sa fourchette, écran vers le haut. « J’ai un appel à neuf heures. Le Brésil ne dort jamais. »",
   "choix": [
    {
     "lab": "« Alors on fera court. »",
     "r": "« Non. Faites normal. Si je voulais faire court, je ne serais pas venu. » L’appel existe peut-être. Le message, lui, est passé dans les deux sens.",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "Faire comme si je n’avais pas vu le téléphone",
     "r": "Il le laisse à côté de sa fourchette, puis le retourne au bout de trois minutes, sans un mot. Vous ne saurez jamais s’il l’a fait exprès.",
     "d": 0,
     "ton": "prudent"
    },
    {
     "lab": "Lui demander si on ferait mieux de reporter",
     "r": "« Si je reportais chaque fois que j’ai un appel, je ne verrais plus personne. » Il se cale au fond de sa chaise et desserre son col. Ce n’est pas chaleureux, mais ce n’est plus glacé.",
     "d": 3,
     "ton": "humble"
    },
    {
     "lab": "« Vous trouvez bien du temps pour les autres. »",
     "r": "Silence. « J’ai du temps pour ceux qui ne me le reprochent pas. » Le serveur arrive au pire moment et personne ne le regarde.",
     "d": -5,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "arrivee_chaud_accueil",
   "si": "chaud",
   "texte": "Il est debout avant que vous ayez traversé la salle. Une main sur l’épaule, une poignée qui dure une seconde de plus que nécessaire. « J’ai commandé de l’eau plate et de la gazeuse, je ne savais pas laquelle. Asseyez-vous, vous avez l’air crevé. »",
   "choix": [
    {
     "lab": "Lui demander comment s’est passée son année",
     "r": "Il souffle. « Trois cartes annulées, un champion blessé, et un diffuseur qui a changé de patron au printemps. » Il s’arrête net. « Vous êtes le premier à demander. Les autres commencent par leurs gars. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Vous m’avez sauvé la mise en février. »",
     "r": "« Vous avez dépanné, j’ai rendu. Ça s’appelle travailler ensemble. » Il balaie ça de la main, mais il est content que ce soit dit à voix haute.",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "En profiter pour placer ma demande tout de suite",
     "r": "Il lève une main, sans agacement. « Le dessert. Tout ce que vous voulez me demander, gardez-le pour le dessert. » Il l’a dit gentiment. Il ne le redira pas.",
     "d": -3,
     "ton": "pressé"
    },
    {
     "lab": "Plaisanter sur le prix de la carte",
     "r": "« C’est l’organisation qui paie, et elle ne regarde pas les notes de restaurant. » Il désigne le poisson du menton. « Prenez celui-là, ils le font bien. »",
     "d": 1,
     "ton": "complice"
    }
   ]
  },
  {
   "cle": "arrivee_le_vin",
   "si": "toujours",
   "texte": "Le sommelier attend, la carte des vins ouverte. Le matchmaker la pousse vers vous sans y jeter un œil. « Prenez ce que vous voulez. Moi, je ne bois pas les semaines de gala. » Un temps. « Et il y a un gala toutes les semaines. »",
   "choix": [
    {
     "lab": "Prendre de l’eau, comme lui",
     "r": "« Ne faites pas ça. Un type qui ne boit pas en face d’un type qui ne boit pas, c’est un rendez-vous chez le notaire. » Il commande un verre pour vous et de l’eau pour lui.",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "Lui demander depuis quand il a arrêté",
     "r": "« Depuis que j’ai compris qu’à minuit je décrocherais quand même. Autant être net quand un manager m’annonce que son gars ne fera pas le poids. » Il ne se plaint pas. Il constate.",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Commander une bouteille et la finir seul",
     "r": "Il ne dit rien pendant la première moitié. À la seconde, il vous regarde raconter un combat avec les mains. « Vous conduisez ? » Ce n’est pas une plaisanterie.",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "Choisir le plus cher de la carte",
     "r": "Il regarde le sommelier s’éloigner, puis vous. « L’organisation paie, ça m’est égal. Mais vous venez de m’apprendre quelque chose sur vous. » Impossible de savoir quoi.",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "arrivee_serveur",
   "si": "tiede",
   "texte": "Le serveur récite les plats du jour. Le matchmaker écoute jusqu’au bout, poliment, puis commande ce qu’il commande partout : une viande, sans sauce, et « le plus vite possible, si c’est jouable ». Il se retourne vers vous. « Pardon. Je mange en douze minutes depuis quinze ans. »",
   "choix": [
    {
     "lab": "Commander vite, moi aussi",
     "r": "« Merci. » Il ne s’attendait pas à ce qu’on s’aligne. « Les gens prennent ça pour de la brusquerie. C’est juste que j’ai toujours un avion le lendemain matin. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "Lui demander comment il mange en déplacement",
     "r": "« Un plateau dans la chambre à minuit, un buffet d’hôtel à sept heures. Je connais mieux les aéroports que ma cuisine. » Il rit à moitié. « Ne devenez jamais matchmaker. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Prendre mon temps et interroger le serveur sur tout",
     "r": "Il attend, les mains à plat sur la nappe. Il ne soupire pas une fois. Mais quand vous rendez la carte, il a répondu à deux messages.",
     "d": -1,
     "ton": "pressé"
    },
    {
     "lab": "Commander la même chose que lui, pour faire bien",
     "r": "« Prenez ce que vous voulez, vraiment. Je ne note pas ça. » S’aligner sur lui n’était pas le sujet, et il l’a vu tout de suite.",
     "d": -1,
     "ton": "flatteur"
    }
   ]
  },
  {
   "cle": "arrivee_lautre_table",
   "si": "habitue",
   "texte": "Deux tables plus loin, un autre manager vous a repéré. Il lève son verre, large sourire, et fait mine de se lever. Le matchmaker ne tourne pas la tête d’un centimètre. « Ne le regardez pas trop longtemps. Il m’a appelé onze fois cette semaine. »",
   "choix": [
    {
     "lab": "Lui rendre son salut, poliment",
     "r": "Vous levez la main, l’autre se rassoit, content de lui. « Bien joué, dit le matchmaker. Maintenant il est persuadé que vous plaidez sa cause. »",
     "d": 0,
     "ton": "prudent"
    },
    {
     "lab": "Lui demander ce que l’autre voulait",
     "r": "« La même chose que vous. Une date, un nom, un peu plus d’argent. » Il ne se retourne toujours pas. « La différence, c’est qu’il m’appelle. Vous, vous êtes assis en face de moi. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Glisser que ce type raconte n’importe quoi sur ses gars",
     "r": "« Possible. » Il n’enchaîne pas. « Ce que je retiens, c’est que vous parlez des absents. » Le nom de l’autre ne reviendra plus de la soirée. Le vôtre, si.",
     "d": -4,
     "ton": "sec"
    },
    {
     "lab": "Ne pas bouger, ne pas le regarder",
     "r": "L’autre finit par se rasseoir. « Vous avez bien fait. Il serait venu s’installer dix minutes, et ces dix minutes-là, elles sont à vous. »",
     "d": 2,
     "ton": "complice"
    }
   ]
  },
  {
   "cle": "arrivee_retard",
   "si": "toujours",
   "texte": "Il arrive avec vingt-cinq minutes de retard, manteau encore sur le dos, et pose son téléphone sur la table comme on pose quelque chose de lourd. « Pardon. J’ai perdu un main event à trois jours. Le gars s’est ouvert l’arcade ce matin, à l’entraînement. »",
   "choix": [
    {
     "lab": "« Mangez d’abord. Le reste attendra. »",
     "r": "Il s’arrête, le manteau à moitié enlevé, puis le pose sur la chaise d’à côté. « C’est la première phrase sensée qu’on me dit aujourd’hui. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "Lui demander ce qu’il va faire maintenant",
     "r": "« Remonter la carte. Prendre le combat du dessous, le mettre en haut, et espérer que le diffuseur ne hurle pas. » Il s’assoit enfin. « Ce travail-là, personne ne le voit jamais. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "arrivee_le_forfait"
    },
    {
     "lab": "Lui proposer un de mes gars pour boucher le trou",
     "r": "Il vous regarde vraiment pour la première fois. « Même catégorie ? » Puis il secoue la tête. « À trois jours, la commission médicale ne suivra pas. Mais vous l’avez proposé. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "Compatir longuement",
     "r": "« Ça va, ça va. » Il coupe court. De la compassion, il en reçoit toute la journée, de gens qui veulent quelque chose derrière.",
     "d": -1,
     "ton": "flatteur"
    }
   ]
  },
  {
   "cle": "arrivee_le_forfait",
   "si": "toujours",
   "texte": "Il repousse son assiette et aligne trois grains de sel sur la nappe. « Ma carte de samedi. Le main event est mort ce matin. Celui-là est très bon, mais inconnu hors de son pays, et celui-là, c’est un combat de prélims dont le diffuseur ne voulait pas. » Il pousse le troisième grain vers le haut. « Devinez lequel passe à la télé. »",
   "choix": [
    {
     "lab": "« Celui qui finit ses combats. »",
     "r": "« Exactement. Pas le mieux classé : celui qui ne laisse pas les juges décider. » Il balaie le sel du revers de la main. « Retenez ça et vous comprendrez la moitié de mes appels. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Le mieux classé, non ? »",
     "r": "« Le classement, c’est pour les journalistes et pour vous. Moi, samedi, il me faut vingt minutes de télévision qui ne soient pas ennuyeuses. » Aucune méchanceté. Une contrainte de métier.",
     "d": 2,
     "ton": "humble"
    },
    {
     "lab": "« Et quand aucun des trois ne convient ? »",
     "r": "« J’appelle un type qui a perdu deux fois de suite et qui a besoin d’argent, et je vis avec. » Il ne sourit pas. « C’est la partie du métier que je ne raconte pas chez moi. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "Lui dire que mon gars aurait été parfait pour ce trou",
     "r": "« Peut-être. Mais je viens de vous expliquer comment je choisis, et vous me répondez par un nom. » Il remet les grains en ligne. « Écoutez encore un peu. »",
     "d": -2,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "arrivee_petite_salle",
   "si": "petiteSalle",
   "texte": "Il a regardé où se trouve votre salle avant de venir, et il le dit d’entrée. « Vous êtes à quarante minutes de la première gare. » Ce n’est pas un reproche : c’est un homme qui pense en correspondances et en nuits d’hôtel.",
   "choix": [
    {
     "lab": "« Qu’est-ce que ça change, pour vous ? »",
     "r": "« Que si je vous prends un gars en dépannage, il part la veille au soir. Et un type qui dort mal la veille pèse mal le lendemain. » Vous n’aviez jamais vu votre adresse comme un problème.",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "Lui raconter comment j’ai monté la salle",
     "r": "Il écoute plus longtemps que prévu. Puis, en remplissant son verre : « Le mien était un ancien magasin de meubles. Du temps où j’entraînais. » Il n’en avait jamais parlé.",
     "d": 3,
     "ton": "humble"
    },
    {
     "lab": "Défendre ma région",
     "r": "« Je n’ai rien contre votre région. J’ai un problème avec les horaires de train. » Il hausse une épaule. Le sujet ne l’intéressait déjà plus.",
     "d": 0,
     "ton": "franc"
    },
    {
     "lab": "Laisser entendre que la salle est plus grosse qu’elle ne l’est",
     "r": "« Combien de tapis ? » Vous répondez. « J’ai visité des centaines de salles, vous savez. » Il ne vous en veut pas. Mais il ne vous croira plus sur parole.",
     "d": -4,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "arrivee_grosse_salle",
   "si": "grosseSalle",
   "texte": "Il a vu votre veste au vestiaire, le nom de la salle brodé dans le dos. Il attend d’être assis pour le dire. « Trois personnes m’ont demandé si je vous voyais ce soir. » Il vous laisse mesurer la phrase. « On appelle vos gars sans passer par vous. Vous le saviez ? »",
   "choix": [
    {
     "lab": "« Je m’en doutais. Merci de me le dire. »",
     "r": "« C’est normal, vous marchez bien. Un manager fait son marché avant la fin d’un contrat, pas après. » Il dit ça posément. « Regardez qui prend des nouvelles de vos gars sans vous mettre en copie. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "Lui demander comment il voit ma salle, lui",
     "r": "« Sérieuse. Bien préparée. Un peu trop bavarde sur les réseaux. » Deux qualités, un défaut, dix secondes. Il avait la réponse prête avant d’arriver.",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Donnez-moi les noms. »",
     "r": "« Non. Je vous dis que ça se fait, ça suffit. Si je donnais des noms, vous ne pourriez plus me croire le jour où je vous dirais que je n’en donne pas. »",
     "d": -2,
     "ton": "pressé"
    },
    {
     "lab": "Le prendre comme un compliment, et le dire",
     "r": "« Ce n’est pas un compliment, c’est un avertissement. » Il coupe sa viande. « Les salles qui marchent se vident toujours par le haut. »",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "arrivee_debutant",
   "si": "debutant",
   "texte": "Il rend la carte au serveur et vous regarde. « On m’a dit que vous n’aviez encore personne de classé. » Ce n’est pas une accusation. Il pose ça sur la table comme un fait, pour voir ce que vous en faites.",
   "choix": [
    {
     "lab": "« Pas encore. J’ai deux gars qui y seront. »",
     "r": "« Dans combien de temps ? » Vous répondez. Il ne conteste pas. « Rappelez-moi leurs noms le jour où ils battront quelqu’un que je connais. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "Lui demander ce qu’il regarde chez un gars inconnu",
     "r": "« Qui il a battu, et comment. Un gars qui gagne mal contre des inconnus ne m’intéresse pas. » Il repose son verre. « Et je regarde le coach. Toujours. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "Assurer que mes gars valent la moitié de sa carte",
     "r": "« C’est possible. Je ne les ai jamais vus, et vous n’avez jamais mis les pieds dans mes vestiaires. » Il ne s’énerve pas. Il vous croit simplement un peu moins qu’il y a une minute.",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "Reconnaître que je pars de rien",
     "r": "« Au moins vous savez où vous êtes. Les salles qui se surestiment me font perdre des soirées entières. » Il vous laisse la corbeille de pain. « Faites-moi signe quand vous en aurez un qui gagne trois fois de suite. »",
     "d": 3,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "arrivee_champion",
   "si": "aChampion",
   "texte": "Il attend que le serveur s’éloigne. « Votre champion. Il tient encore combien de temps ? » Il demande ça sans détour, comme on demande l’âge d’une voiture.",
   "choix": [
    {
     "lab": "« Deux ans. Peut-être trois. »",
     "r": "Il hoche la tête. « C’est ce que je pensais. » Puis, plus bas : « Préparez celui d’après maintenant. Les salles meurent avec leur champion, jamais avant. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Il est au sommet, il peut durer. »",
     "r": "« Ils peuvent tous durer, jusqu’au soir où ils ne peuvent plus. » Il n’insiste pas. Vous avez répondu comme on répond à un journaliste.",
     "d": -1,
     "ton": "confiant"
    },
    {
     "lab": "Lui demander ce qu’il ferait, à ma place",
     "r": "« Je signerais deux jeunes cette année, pendant qu’on décroche encore quand vous appelez. » Puis, sans y mettre de gravité : « On décroche parce que vous avez un champion. Ce n’est pas éternel. »",
     "d": 5,
     "ton": "humble"
    },
    {
     "lab": "Réclamer une défense de titre chez moi",
     "r": "« Chez vous ? » Un temps. « Ce n’est pas moi qui décide où on pose un main event. C’est le diffuseur et la salle qui vend le plus de billets. » Il reprend sa fourchette. « Demandez-le-moi en juin, par écrit. Ce soir, ça ne sert à rien. »",
     "d": -3,
     "ton": "pressé"
    }
   ]
  }
 ],
 "lui_sur_vous": [
  {
   "cle": "lui_sur_vous_avant",
   "si": "premier",
   "texte": "Il repousse la carte sans l'avoir ouverte. « Bon. Avant la salle, vous faisiez quoi ? » Ce n'est pas de la politesse : il la pose à chaque coach qu'il rencontre, et il écoute la réponse en entier.",
   "choix": [
    {
     "lab": "« J'ai combattu. Onze combats, six victoires, rien de brillant. »",
     "r": "« Six-cinq. C'est un vrai bilan. Ceux qui me disent qu'ils étaient invaincus avaient trois combats, en général. » Il repose son verre. « Vous savez donc ce que ça fait, un coup de fil deux semaines avant. »",
     "d": 3,
     "ton": "franc",
     "ouvre": "lui_sur_vous_verification"
    },
    {
     "lab": "« Chauffeur poids lourd. La salle, c'était le soir. »",
     "r": "« Les nuits, alors. » Il ne s'en étonne pas. « Les meilleurs coachs que je connais ont tous eu un vrai métier avant. Ça évite de croire que ce milieu, c'est le monde. »",
     "d": 2,
     "ton": "humble"
    },
    {
     "lab": "« Disons que j'ai un passé. »",
     "r": "Il sourit sans chaleur et laisse le mot flotter. « Un passé. Tout le monde en a un. Le mystère, c'est souvent qu'il n'y a rien dessous. »",
     "d": -3,
     "ton": "évasif"
    },
    {
     "lab": "« J'ai été pro, j'ai croisé du monde. Vous connaissez sûrement des noms. »",
     "r": "« Peut-être. » Il ne demande aucun nom. Il déplie sa serviette. « Vous remarquerez que je ne vous ai pas demandé lesquels. »",
     "d": -2,
     "ton": "vantard",
     "ouvre": "lui_sur_vous_verification"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_pourquoi_salle",
   "si": "premier",
   "texte": "« Une salle. » Il coupe son pain en deux sans le manger. « Personne n'ouvre une salle pour l'argent, ça se saurait. Alors pourquoi vous ? »",
   "choix": [
    {
     "lab": "« Parce que personne ne m'a formé correctement, et que ça m'a coûté ma carrière. »",
     "r": "Il ne répond pas tout de suite. « Ça, c'est une raison qui tient dix ans. Celles à base d'amour du sport tiennent deux hivers. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Pour sortir des champions. »",
     "r": "« Vous et tous les autres. » Il pousse le pain sur le côté. « Il en sort un ou deux par an dans ce pays, et rarement là où on les annonce. »",
     "d": 0,
     "ton": "ambitieux"
    },
    {
     "lab": "« Honnêtement ? Je ne savais rien faire d'autre. »",
     "r": "« Au moins c'est vrai. » Il boit une gorgée. « La moitié des gens de ce métier sont là pour cette raison. L'autre moitié ment. »",
     "d": 2,
     "ton": "humble"
    },
    {
     "lab": "« Il y avait un local libre et un loyer correct. »",
     "r": "Il a un demi-sourire. « Une opportunité immobilière. Vous ne serez pas le premier à ouvrir un club par accident. Reste à savoir si vous y êtes resté par accident. »",
     "d": 1,
     "ton": "pragmatique",
     "ouvre": "lui_sur_vous_argent"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_verification",
   "si": "toujours",
   "texte": "Il pose son téléphone face contre la nappe. « Vous avez combattu, vous ? Je préviens : je connais tous les organisateurs entre ici et la frontière. Je vérifie tout. Pas par méfiance, par habitude. »",
   "choix": [
    {
     "lab": "« Amateur. Quatorze combats, jamais passé pro. »",
     "r": "« Quatorze. » Il enregistre. « Ceux qui ont pris des coups expliquent mieux. Ils savent qu'un plan de combat, dans la cage, ça dure une minute quarante. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Jamais. Je n'ai jamais mis les pieds dans une cage. »",
     "r": "Il ne bronche pas. « Le meilleur entraîneur de boxe que j'aie connu était pharmacien. Ce qui compte, c'est que vous ne fassiez pas semblant d'avoir saigné. »",
     "d": 3,
     "ton": "sobre"
    },
    {
     "lab": "« Pro, dans le Sud. C'était il y a longtemps, ça ne se retrouve nulle part. »",
     "r": "« Nulle part. » Il laisse passer un temps. « À cette époque, dans le Sud, c'est moi qui faisais les cartes. » Il rouvre le menu. « On commande ? »",
     "d": -5,
     "ton": "menteur"
    },
    {
     "lab": "« Ça n'a aucune importance. Parlons plutôt de mes gars. »",
     "r": "« Ça en a pour moi. » Il ne s'énerve pas. « Je confie des soirées à des gens. J'aime savoir qui ils sont avant de savoir ce qu'ils vendent. »",
     "d": -2,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_argent",
   "si": "toujours",
   "texte": "L'entrée arrive. Il attend que le serveur reparte. « Question indiscrète, et vous n'êtes pas obligé de répondre. La salle, elle vit de quoi ? Des cotisations, d'un sponsor, ou de votre compte à vous ? »",
   "choix": [
    {
     "lab": "« Des cotisations. Une centaine d'adhérents, une poignée de compétiteurs. »",
     "r": "« Donc les cours du mardi soir paient les déplacements de vos pros. C'est comme ça partout. Ça tient tant que vous n'avez pas trois blessés le même mois. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« De mon compte, surtout. »",
     "r": "Il repose sa fourchette. « Ne dites jamais ça à un promoteur qui n'est pas moi. Un type qui se saigne, on lui propose des combats à trois semaines et des bourses de rien, parce qu'on sait qu'il dira oui. »",
     "d": 4,
     "ton": "franc",
     "ouvre": "lui_sur_vous_ce_que_ca_coute"
    },
    {
     "lab": "« On tourne bien. »",
     "r": "« On tourne bien. » Il répète la phrase comme on relit une ligne de contrat. « Tout le monde tourne bien au dessert. En février, la moitié m'appelle pour faire avancer une bourse. »",
     "d": -1,
     "ton": "vague"
    },
    {
     "lab": "« Ça ne vous regarde pas. »",
     "r": "« Non, en effet. » Il retourne à son assiette. Un long moment sans un mot, puis : « Je demandais parce que je place mieux les gens dont je connais les contraintes. Mais c'est très bien comme ça. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_ce_que_ca_coute",
   "si": "chaud",
   "texte": "Il a bu un verre de plus que d'habitude. « Vous avez quelqu'un, chez vous, qui comprend ce métier ? » Il ne demande pas au hasard. « La mienne a compris pendant douze ans. Après, non. »",
   "choix": [
    {
     "lab": "« Elle compte les week-ends où je ne suis pas là. Et elle a raison. »",
     "r": "Il hoche la tête longtemps. « Comptez-les aussi, alors. Le jour où c'est elle seule qui compte, c'est déjà fini. » Il change de sujet, mais le ton n'est plus le même.",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Personne. C'est plus simple. »",
     "r": "« C'est plus simple, oui. » Il ne dit pas que c'est mieux. « Faites attention, alors. Quand il n'y a que la salle, on finit par prendre les défaites des autres pour les siennes. »",
     "d": 3,
     "ton": "sobre"
    },
    {
     "lab": "Couper court : « On ne va pas parler de ça. »",
     "r": "« Non. Vous avez raison. » Il se redresse, remet sa serviette sur ses genoux. Le dîner redevient un rendez-vous.",
     "d": -2,
     "ton": "prudent"
    },
    {
     "lab": "« Et vous, qu'est-ce qui s'est passé ? »",
     "r": "Il regarde la salle un instant. « Une carte à Rotterdam le jour de l'anniversaire de ma fille. La quatrième fois. » Il se remet à couper sa viande. « Ne cherchez pas quoi répondre. Personne ne trouve. »",
     "d": 6,
     "ton": "attentif"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_debutant",
   "si": "debutant",
   "texte": "« Vous n'avez encore personne de classé. » Ce n'est pas un reproche, c'est un constat de travail. « Donc je vous écoute autrement : dites-moi ce que vous avez, sans le vendre. »",
   "choix": [
    {
     "lab": "« Trois gars sérieux, aucun prêt. Le plus avancé a besoin de deux combats régionaux. »",
     "r": "Il pose son couteau. « Vous venez de vous dire non tout seul. Peu de gens savent faire ça. » Il sort un carnet. « Le nom du plus avancé, quand même. Pas pour maintenant. »",
     "d": 5,
     "ton": "franc"
    },
    {
     "lab": "« J'ai un jeune qui peut faire mal à n'importe qui. »",
     "r": "« Ils peuvent tous faire mal à n'importe qui. » Il n'a même pas l'air agacé. « Moi, je cherche celui qui tiendra trois rounds contre un type qui sait s'accrocher. »",
     "d": -1,
     "ton": "vendeur"
    },
    {
     "lab": "« Rien pour vous ce soir. Je voulais vous rencontrer, c'est tout. »",
     "r": "Il s'arrête net. « Personne ne m'a dit ça depuis longtemps. » Il repousse son assiette. Il a du temps, maintenant.",
     "d": 4,
     "ton": "humble",
     "ouvre": "lui_sur_vous_ambition"
    },
    {
     "lab": "« Donnez-m'en un, et vous verrez. »",
     "r": "« C'est la phrase que j'entends quand quelqu'un n'est pas prêt. » Il n'est pas dur, il est las. « Un débutant qu'on brûle sur une carte ne revient jamais. Et c'est moi qui l'ai brûlé. »",
     "d": -3,
     "ton": "exigeant"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_petite_salle",
   "si": "petiteSalle",
   "texte": "« Combien vous êtes sur le tapis un mardi de février, à vingt heures ? » La question a l'air anodine. Elle ne l'est pas.",
   "choix": [
    {
     "lab": "« Neuf. Onze si le froid ne tombe pas. »",
     "r": "« Neuf. » Il a presque l'air content. « Vous avez répondu tout de suite, donc c'est vrai. Ceux qui m'annoncent une trentaine prennent toujours une seconde de trop. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Une trentaine, facile. »",
     "r": "Il ne relève pas. Il relèvera au café, en reposant sa tasse : « Trente personnes sur un tapis, il faut de la place. J'ai vu votre salle en photo. »",
     "d": -4,
     "ton": "menteur"
    },
    {
     "lab": "« Peu. Et je préfère ça à un cours bondé où personne ne progresse. »",
     "r": "« L'argument du petit effectif. » Il l'a entendu souvent, mais il concède. « Cela dit, c'est vrai : les gars des toutes petites salles arrivent souvent mieux préparés. Ils ont fait tous leurs rounds avec le coach. »",
     "d": 2,
     "ton": "assumé"
    },
    {
     "lab": "« Ça remonte. On a eu un hiver difficile. »",
     "r": "« Un hiver difficile. » Il ne juge pas. « Ce qui coule une salle, ce n'est pas le mauvais hiver, c'est le deuxième. Et les licences qu'on continue à payer quand même. »",
     "d": 1,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_grosse_salle",
   "si": "grosseSalle",
   "texte": "« Votre salle, on la cite. » Il dit ça sans compliment, comme une donnée du dossier. « Ce que je n'arrive pas à savoir, c'est ce qui est de vous là-dedans, et ce qui était déjà là quand vous êtes arrivé. »",
   "choix": [
    {
     "lab": "« Le lutteur et le préparateur physique étaient là avant moi. Je n'ai fait que ne pas les faire fuir. »",
     "r": "« Garder les gens, c'est l'essentiel du métier. » Il le dit sans emphase. « Les salles qui explosent, ce n'est jamais un problème de technique. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Tout. »",
     "r": "« Tout. » Il regarde ailleurs une seconde. « J'ai déjeuné avec votre préparateur au printemps. Lui ne dit pas ça de vous. Il ne dit pas le contraire non plus. »",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "« Notre réputation tient à deux résultats. On est plus fragiles qu'on en a l'air. »",
     "r": "« Deux résultats. » Il sourit franchement pour la première fois de la soirée. « C'est toujours deux résultats. Peu de gens le disent à voix haute. »",
     "d": 4,
     "ton": "lucide"
    },
    {
     "lab": "« Elle est connue parce que je passe beaucoup de temps à la faire connaître. »",
     "r": "« Oui, ça se voit. » Petit temps. « Vous êtes bon là-dedans, sincèrement. Mais une affiche ne se vend pas avec un communicant, elle se vend avec des gars qu'on a envie de revoir. »",
     "d": -1,
     "ton": "commercial"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_recrutement",
   "si": "habitue",
   "texte": "Il attaque son plat. « Vos gars, ils viennent d'où ? Parce qu'il y a deux écoles dans ce métier : ceux qui forment, et ceux qui débauchent. »",
   "choix": [
    {
     "lab": "« Du cours loisir. Tous, sans exception. »",
     "r": "« Alors vous en perdrez un par le haut, un jour. » Il dit ça comme une prévision météo. « Quand une grosse structure appellera votre meilleur, appelez-moi avant de faire une bêtise. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« J'en ai récupéré deux d'un club voisin qui fermait. »",
     "r": "« Qui fermait, d'accord. » Il insiste, sans dureté : « Vraiment fermé, ou fâché ? Si le coach d'en face m'appelle en mai pour dire du mal de vous, je préfère l'avoir su ce soir. »",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« Je prends les meilleurs, d'où qu'ils viennent. »",
     "r": "« Vous savez ce que ça coûte ? » Il ne hausse pas le ton. « Des années de bouche-à-oreille pourri dans votre région. J'ai vu des salles fortes finir sans partenaires d'entraînement : plus personne ne leur ouvrait un tapis. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« Et vous, comment vous les repérez ? »",
     "r": "« Les vidéos, un peu. » Il finit sa bouchée. « Surtout les téléphones. Sur dix noms qu'on m'envoie, deux valent le déplacement. Le reste, ce sont des oncles. »",
     "d": 4,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_ambition",
   "si": "tiede",
   "texte": "« Dans cinq ans, vous voulez quoi ? » Il pose la question sans y mettre d'intention. « Et ne me dites pas une ceinture. Ce n'est pas une réponse, c'est un souhait. »",
   "choix": [
    {
     "lab": "« Un homme dans les classements mondiaux, et une salle qui tourne sans moi le samedi. »",
     "r": "« La deuxième partie est la plus dure. » Il approuve. « Un coach dure quand il a fabriqué quelqu'un capable de tenir le coin à sa place. »",
     "d": 4,
     "ton": "lucide"
    },
    {
     "lab": "« Vivre de ça. Simplement. »",
     "r": "Il fait la grimace, gentiment. « Alors ne comptez pas sur les bourses de vos gars. Ce que touche un combattant régional, c'est un plein d'essence et un aller-retour. Comptez sur vos cotisations et sur vos stages. »",
     "d": 3,
     "ton": "humble"
    },
    {
     "lab": "« Être à votre place, de l'autre côté de la table. »",
     "r": "Il rit, un rire court. « Vous ne voulez pas être moi. Je passe mes journées à dire non à des gens bien, et mes nuits à chercher un remplaçant. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« Que ce soit vous qui m'appeliez. »",
     "r": "« Ça arrive. » Il repose ses couverts. « Mais je n'appelle pas un manager, j'appelle un combattant qui règle un problème que j'ai le mardi pour le samedi. Ne visez pas mon estime, visez ma liste de remplaçants. »",
     "d": 1,
     "ton": "ambitieux"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_le_poids",
   "si": "aClasse",
   "texte": "« Votre classé. » Il fait tourner son verre. « Il descend de combien, en vrai ? Pas ce qu'il raconte sur les réseaux : ce que vous, vous voyez le jeudi matin. »",
   "choix": [
    {
     "lab": "« Neuf kilos, encadrés. On travaille avec une diététicienne. »",
     "r": "« Encadrés. » Il note. « Ce qui me coûte le plus cher dans une année, ce ne sont pas les blessures, ce sont les pesées ratées. Je perds le combat, l'affiche et la confiance de la chaîne. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Douze. C'est trop, je le sais. »",
     "r": "Il ne fait pas la leçon. « Vous le savez, c'est déjà ça. » Puis, plus bas : « Faites-le monter de catégorie avant qu'un médecin le fasse à votre place. Il perdra deux combats et il en gagnera cinq. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Il fait toujours le poids. »",
     "r": "« Tout le monde fait toujours le poids, jusqu'à la fois où non. » Il hausse les épaules. « J'ai trois salles que je ne programme plus en haut de carte. On entre dans cette liste en une matinée. »",
     "d": -1,
     "ton": "rassurant"
    },
    {
     "lab": "« On gère. Ce sont mes affaires. »",
     "r": "« Non. » Le mot tombe net. « Le jeudi de la pesée, ce sont aussi les miennes. C'est mon nom sur l'affiche, et c'est moi qui rembourse les billets. »",
     "d": -4,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_le_champion",
   "si": "aChampion",
   "texte": "« Depuis la ceinture, vous donnez encore des cours ? » Il pique dans son assiette sans lever les yeux. « Je demande parce que j'ai vu des salles mourir d'avoir un champion. »",
   "choix": [
    {
     "lab": "« Le mardi et le jeudi, débutants. Je n'ai jamais arrêté. »",
     "r": "« Gardez ça. » Il approuve. « Un champion part, se blesse ou vieillit. Le cours du mardi, non. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Non. Je suis dans les avions et au téléphone. »",
     "r": "« C'est ce que je craignais. » Il ne le dit pas méchamment. « Vous êtes devenu son manager. Trouvez quelqu'un pour le tapis avant que vos jeunes ne partent en silence. »",
     "d": 2,
     "ton": "lucide"
    },
    {
     "lab": "« Il porte la salle. C'est normal que tout tourne autour de lui. »",
     "r": "« Normal, oui. » Puis, sans appuyer : « Et le jour où il perd deux fois, il ne reste rien derrière. J'ai programmé des salles comme ça. Elles ne reviennent pas. »",
     "d": -2,
     "ton": "imprudent"
    },
    {
     "lab": "« Et vous, ça vous change quoi, un champion dans votre organisation ? »",
     "r": "« Du travail. » Il ne sourit pas. « Un champion, ce n'est pas un combattant de plus, c'est une date qu'on ne peut pas déplacer. Toute la carte se construit autour de lui. »",
     "d": 4,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_qui_decide",
   "si": "toujours",
   "texte": "« Une dernière chose sur vous. » Il s'essuie les mains. « Quand j'appelle et que je propose un combat, qui décide ? Vous, le gars, ou quelqu'un que je ne connais pas ? »",
   "choix": [
    {
     "lab": "« Lui. Je donne mon avis, il tranche. »",
     "r": "« C'est la bonne réponse, et elle est rarement vraie. » Il n'insiste pas. « Tant que celui qui prend les coups a le dernier mot, je peux travailler. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Moi. Il signe ce que je lui dis de signer. »",
     "r": "« Alors le jour où ça tourne mal, ce sera votre faute, et il le saura. » Il pique dans son plat. « J'ai vu des vestiaires se vider pour moins que ça. »",
     "d": -2,
     "ton": "autoritaire"
    },
    {
     "lab": "« On a quelqu'un qui gère ça pour nous. »",
     "r": "« Donnez-moi son nom, je l'appellerai avant vous. » Il le note. « Deux interlocuteurs sur le même combat, c'est comme ça qu'on perd une soirée. »",
     "d": 1,
     "ton": "prudent"
    },
    {
     "lab": "« Ça dépend des jours. »",
     "r": "« Mauvaise réponse. » Il le dit sans méchanceté. « Le jour où il me faut un oui dans l'heure, j'appelle une salle où quelqu'un sait dire oui. »",
     "d": -3,
     "ton": "flou"
    }
   ]
  },
  {
   "cle": "lui_sur_vous_ce_quon_dit",
   "si": "froid",
   "texte": "Il n'a pas encore enlevé sa veste. « On m'a parlé de vous avant ce dîner. Pas en mal. Pas en bien non plus. » Il attend, pour voir ce que vous ferez d'une phrase pareille.",
   "choix": [
    {
     "lab": "« Vous voulez ma version ? »",
     "r": "« Je voulais surtout voir si vous demandiez qui a parlé. » Il enlève sa veste, finalement, et la pose sur le dossier. « Vous ne l'avez pas demandé. Ça compte. »",
     "d": 3,
     "ton": "posé"
    },
    {
     "lab": "« Qui ? »",
     "r": "« Voilà. » Il a presque l'air déçu d'avoir eu raison. « Dans ce métier, ceux qui réclament des noms les répètent. Vous comprendrez que je n'en donne aucun. »",
     "d": -3,
     "ton": "méfiant"
    },
    {
     "lab": "« Ni bien ni mal, ça me va. On peut parler de mes gars. »",
     "r": "« C'est la bonne réponse, et je crois que vous la pensez. » Il fait signe au serveur et commande enfin quelque chose.",
     "d": 2,
     "ton": "sobre"
    },
    {
     "lab": "« Je sais ce qu'on raconte. C'est vrai : j'ai retiré un gars deux jours avant son combat, l'an dernier. »",
     "r": "Il lève les yeux de son assiette. « Ce n'est pas du tout ce qu'on m'avait raconté. » Il repousse son téléphone hors de portée. « Racontez, maintenant que vous avez commencé. »",
     "d": 4,
     "ton": "franc"
    }
   ]
  }
 ],
 "vos_hommes": [
  {
   "cle": "vos_hommes_carnet",
   "si": "toujours",
   "texte": "Il pose son téléphone à côté de son assiette, écran contre la nappe. « J’ai regardé vos trois derniers combats dans l’avion. Vous voulez la version polie ou l’autre ? »",
   "choix": [
    {
     "lab": "« L’autre. »",
     "r": "« Ils gagnent tous de la même façon, et ce n’est pas la vôtre : ils attendent que l’autre se fatigue. Ça suffit en région. Ça ne suffit pas chez moi. » Il pousse le téléphone d’un doigt. « Vous avez demandé. »",
     "d": 3,
     "ton": "franc",
     "ouvre": "vos_hommes_le_style"
    },
    {
     "lab": "« La polie. Je viens de commander. »",
     "r": "« La version polie, c’est : ils sont durs. » Il laisse passer un temps. « Voilà. C’était court. »",
     "d": 1,
     "ton": "complice"
    },
    {
     "lab": "« Trois combats. J’ai onze gars en salle. »",
     "r": "« J’en regarde plusieurs centaines par an, dont trois des vôtres. C’est trois de plus que pour la plupart des gens à qui je serre la main ce soir. » Il le dit sans dureté. C’est ce qui pique.",
     "d": -3,
     "ton": "sec"
    },
    {
     "lab": "« Je ne suis pas sûr d’avoir envie de savoir. »",
     "r": "Il se recule légèrement, presque amusé. « C’est la chose la plus honnête qu’on m’ait dite ce mois-ci. » Le téléphone reste où il est. « On mange. Je vous le dirai au dessert, si vous changez d’avis. »",
     "d": 2,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "vos_hommes_le_style",
   "si": "toujours",
   "texte": "« Il y a deux façons de ne pas être programmé. Perdre, et ennuyer. » Il écarte son verre, comme s’il faisait de la place. « La deuxième est pire. Un homme qui perd bien, je peux encore le vendre. »",
   "choix": [
    {
     "lab": "« Mes gars gagnent. C’est bien le métier ? »",
     "r": "« C’est le vôtre. Le mien, c’est de remplir une salle et de tenir une chaîne. » Il ne s’excuse de rien. « Trois décisions de suite, et je ne raye pas son nom : je l’oublie. C’est plus lent, et c’est définitif. »",
     "d": -1,
     "ton": "franc"
    },
    {
     "lab": "« Lequel des miens vous ennuie ? »",
     "r": "Il donne un nom tout de suite. Celui auquel vous pensiez. « Pas parce qu’il est mauvais. Parce qu’il ne prend jamais le risque de perdre. Le public sent ça avant nous, et il se tait. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« On va lui apprendre à finir. »",
     "r": "« Non. Ça ne s’apprend pas à vingt-neuf ans. » Il coupe sa viande. « En revanche, on peut lui donner des adversaires qui avancent. Il n’aura plus le choix. Ça, c’est faisable. »",
     "d": 1,
     "ton": "prudent"
    },
    {
     "lab": "« Le public ne comprend rien au sol. »",
     "r": "« Le public comprend très bien. Il n’aime pas, ce n’est pas pareil. » Il n’insiste pas. « Méfiez-vous des gens qui expliquent que le public a tort. »",
     "d": -3,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "vos_hommes_la_pesee",
   "si": "toujours",
   "texte": "« Un de vos hommes a fait le poids à la deuxième tentative, en mars. » Il ne consulte rien. Il s’en souvient. « De mon côté, ça se lit dans un seul sens : ce garçon me coûtera une soirée, un jour. »",
   "choix": [
    {
     "lab": "« Il a fait le poids. »",
     "r": "« À onze heures du matin, après une heure de sauna en plus, devant un commissaire de bonne humeur. » Il ne monte pas d’un demi-ton. « Vous avez raison sur le papier. C’est le papier qui ne m’intéresse pas. »",
     "d": -2,
     "ton": "sec"
    },
    {
     "lab": "« Il descend une catégorie de trop. On va remonter. »",
     "r": "« Bien. » Ça a l’air de lui plaire plus qu’il ne le montre. « Vous perdrez un an de classement et vous récupérerez un homme qui a encore des jambes au troisième round. Peu de gens font ce calcul-là. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« On a changé de nutritionniste. »",
     "r": "« Tout le monde change de nutritionniste. » Il laisse filer. « Ce n’est pas la cuisine, c’est la catégorie. Mais admettons. »",
     "d": -1,
     "ton": "prudent"
    },
    {
     "lab": "« Ça se passe comment, de votre côté, quand quelqu’un rate le poids ? »",
     "r": "« Mal, et vite. On renégocie la bourse à minuit, on prévient la commission, on refait l’ordre de la soirée. » Il finit son verre. « Et le lendemain, c’est moi qui explique à un garçon qui n’y est pour rien que son combat n’a pas lieu. »",
     "d": 4,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "vos_hommes_l_ancien",
   "si": "toujours",
   "texte": "« Vous avez un vétéran. Trente-six, trente-sept ? » Il n’attend pas la réponse. « Je le prends volontiers, et c’est bien le problème. Il fait de bons combats, il ne se plaint pas, il arrive à l’heure. »",
   "choix": [
    {
     "lab": "« C’est à lui de décider. »",
     "r": "« Toujours. Et il décidera de continuer, parce que c’est la seule chose qu’il sache faire. » Il fait tourner sa cuillère sans s’en servir. « Ne me le proposez pas deux fois par an. Une fois. Contre quelqu’un de son âge. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Il tient encore un round de plus que mes jeunes. »",
     "r": "« À l’entraînement, sûrement. » Aucune méchanceté là-dedans. « En combat, ce n’est pas le souffle qui part en premier. C’est le menton. Et personne ne le voit venir. »",
     "d": -1,
     "ton": "franc"
    },
    {
     "lab": "« Je ne sais pas comment lui dire d’arrêter. »",
     "r": "Il met du temps à répondre. « Moi non plus. J’ai essayé trois fois en vingt ans. Une seule a marché, et ce type ne m’a plus jamais adressé la parole. » Il regarde la salle. « Il est vivant et il parle normalement. J’ai fait la paix avec ça. »",
     "d": 5,
     "ton": "humble"
    },
    {
     "lab": "« Un dernier gros combat, une belle bourse, et il raccroche. »",
     "r": "« C’est la phrase exacte que j’entends avant chaque combat de trop. » Il vous regarde bien en face. « Elle est toujours sincère. C’est ça qui est embêtant. »",
     "d": -2,
     "ton": "intéressé"
    }
   ]
  },
  {
   "cle": "vos_hommes_le_champion",
   "si": "aChampion",
   "texte": "« Votre champion. » Il met une nuance sur le mot. « Il porte une ceinture qui n’est pas la mienne. Chez moi, ça vaut un bon dossier. Pas une place. »",
   "choix": [
    {
     "lab": "« Il vaut mieux que ça, et vous le savez. »",
     "r": "« Peut-être. Mais je ne peux vendre “champion ailleurs” qu’une fois. Une. Contre un homme de chez moi. » Il laisse tomber la suite sans effet de voix. « S’il gagne, il existe. S’il perd, c’est un dossier de plus que personne n’ouvre. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Il lui manque quoi, exactement ? »",
     "r": "« Un nom. Pas un style, pas un physique — un nom qu’on a déjà entendu, en face de lui, un soir. » Il hausse une épaule. « C’est la seule chose que vous ne pouvez pas lui donner à l’entraînement. »",
     "d": 4,
     "ton": "curieux",
     "ouvre": "vos_hommes_la_ceinture"
    },
    {
     "lab": "« Alors donnez-lui un homme des dix premiers. »",
     "r": "Il pose ses couverts. « Vous voulez un classé pour un garçon que mon public ne connaît pas. Le classé, lui, veut un garçon que le public connaît. Faites le calcul à ma place. »",
     "d": -4,
     "ton": "exigeant"
    },
    {
     "lab": "« De toute façon, il ne signe nulle part sans moi. »",
     "r": "Il vous regarde une seconde de trop. « Notez ça quelque part, avec la date. » Il reprend son verre. « Vous le relirez le jour où son cousin l’accompagnera à une réunion. »",
     "d": -3,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "vos_hommes_la_ceinture",
   "si": "aChampion",
   "texte": "« Je vais vous dire une chose qu’on ne dit pas aux managers. » Il vérifie d’un regard qui est à la table d’à côté. « Une ceinture, ce n’est pas une récompense. C’est un calendrier. On sait dix-huit mois à l’avance qui devrait la porter au printemps. »",
   "choix": [
    {
     "lab": "« Donc tout est écrit. »",
     "r": "« Rien n’est écrit. Tout est prévu. La différence, c’est qu’un homme peut casser le plan en douze secondes. » Il a presque l’air heureux. « C’est pour ça que je fais ce métier et pas un autre. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« C’est malhonnête. »",
     "r": "« C’est de la programmation. Personne ne truque un combat : on choisit qui monte, quand, et contre qui. » Il n’est pas vexé ; il a eu cette conversation cent fois. « Vous faites pareil avec vos amateurs. En plus petit, et sans caméra. »",
     "d": -1,
     "ton": "franc"
    },
    {
     "lab": "Ne rien dire, et le laisser aller au bout.",
     "r": "Il continue. Les fenêtres de diffusion, le sponsor qui paie la soirée de novembre, le champion qu’on garde au frais parce qu’il tourne un film. Il s’arrête quand on débarrasse, un peu surpris d’avoir parlé si longtemps.",
     "d": 6,
     "ton": "humble"
    },
    {
     "lab": "« Et le mien, il est dans ce calendrier ? »",
     "r": "« Non. » Il le dit sans dureté, ce qui est pire. « Il est sur la liste d’à côté : ceux qui entrent dans le calendrier quand quelqu’un se blesse. Cette liste-là a fait plus de carrières que l’autre. »",
     "d": 1,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "vos_hommes_le_classe",
   "si": "aClasse",
   "texte": "« Votre classé. » Il fait tourner un fond de vin sans le boire. « Il est arrivé à l’endroit qui coince : au-dessus de lui, plus personne n’a rien à gagner à le battre. C’est le pire moment d’une carrière, et personne ne prévient. »",
   "choix": [
    {
     "lab": "« Alors on redescend chercher quelqu’un. »",
     "r": "« Et il passe un an à battre des gens qu’il devait battre. » Il approuve à moitié. « C’est parfois la bonne réponse. Un an de patience vaut mieux qu’un mauvais combat en février. »",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« Qu’est-ce qui débloque une situation pareille ? »",
     "r": "« Une blessure chez quelqu’un d’autre. Un finish assez propre pour qu’un homme au-dessus le prenne mal. Ou un micro, s’il sait s’en servir. » Il pince les lèvres. « Dans cet ordre, malheureusement. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Vous pourriez le débloquer, vous. »",
     "r": "« Je pourrais. » Il laisse le silence faire le reste du travail. « Vous n’êtes pas le seul manager à cette table à le penser, et j’ai douze places par soirée. »",
     "d": -2,
     "ton": "pressé"
    },
    {
     "lab": "« Il a le temps. Il est jeune. »",
     "r": "« Il a vingt-huit ans. » Il le dit comme on corrige une adresse. « Ce sport laisse trois ou quatre bonnes années. Il en a déjà passé une à attendre. »",
     "d": -1,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "vos_hommes_personne",
   "si": "debutant",
   "texte": "Il vous laisse finir votre présentation. Puis il pose les mains à plat sur la nappe. « Je vais être franc, parce que je ne suis pas sûr qu’on se revoie. Je ne connais aucun de vos combattants. Pas un nom. »",
   "choix": [
    {
     "lab": "« C’est exactement pour ça que je suis là. »",
     "r": "« Bonne réponse. » Il se cale contre le dossier. « Alors ne m’en vendez pas onze. Vendez-m’en un. Celui que vous mettriez dans un avion demain matin. Les autres, je les découvrirai s’il est bon. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "Lui réciter les palmarès, un par un.",
     "r": "Il écoute jusqu’au quatrième nom. Au cinquième, il regarde la carte des desserts. « Les bilans régionaux se ressemblent tous. Dites-moi plutôt lequel fait mal. »",
     "d": -2,
     "ton": "empressé"
    },
    {
     "lab": "« Ils valent mieux que la moitié de vos prélims. »",
     "r": "« Sans doute. » Il ne s’énerve pas une seconde. « Mes prélims ont fait la pesée, la conférence, l’antidopage et trois semaines de camp sans se blesser. C’est aussi une compétence. C’est même la plus rare. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« Ils ne sont pas prêts. Je le sais. Je viens pour l’an prochain. »",
     "r": "Il repose sa fourchette. « Personne ne me dit jamais ça. » Un silence un peu long. « Revenez l’an prochain. Et amenez celui dont vous n’avez pas parlé ce soir. C’est toujours le bon. »",
     "d": 5,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "vos_hommes_la_video",
   "si": "habitue",
   "texte": "Il fait glisser son téléphone sur la nappe. Un combat en pause, deuxième round : c’est votre homme. « Regardez son pied arrière au moment où il touche. »",
   "choix": [
    {
     "lab": "Prendre l’appareil et repasser la séquence moi-même.",
     "r": "Il vous laisse faire. Le pied part vers l’extérieur avant la main, à chaque fois. « Ses trois derniers adversaires ne l’ont pas vu. Celui que je lui donnerai le verra à la fin du premier round. » Il récupère son téléphone. « Corrigez ça et on se reparle. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Mes entraîneurs le savent. On travaille dessus. »",
     "r": "« Travaillez plus vite. » Ce n’est pas une pique : il range l’appareil comme on referme un dossier. « Ce n’est pas un reproche, c’est un renseignement gratuit. Je n’en donne pas beaucoup dans une année. »",
     "d": 1,
     "ton": "prudent"
    },
    {
     "lab": "« Vous regardez le pied arrière de mes gars, le soir ? »",
     "r": "« Je regarde le pied arrière de tout le monde. C’est le métier. » Un demi-sourire. « Ma femme dit que je n’ai jamais fini un film. »",
     "d": 3,
     "ton": "complice"
    },
    {
     "lab": "« Il a gagné ce combat. »",
     "r": "« Il a gagné celui-là. » Il éteint l’écran. « Je vous parlais du suivant. C’est la seule chose que je regarde. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "vos_hommes_le_refus",
   "si": "froid",
   "texte": "Vous n’avez pas fini votre phrase qu’il fait non de la tête. « Pas lui. Je ne le prendrai pas, ni cette année ni la suivante. Ce n’est pas contre vous. »",
   "choix": [
    {
     "lab": "« Dites-moi pourquoi, au moins. »",
     "r": "« Deux forfaits en dix-huit mois, dont un à quatre jours du combat. » Aucune hésitation. « Une carte se construit depuis le haut. Quand quelqu’un tombe en bas, tout bouge au-dessus. Je ne suis pas rancunier, je suis échaudé. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Vous vous trompez sur lui. »",
     "r": "« Ça m’arrive. » Il ne bouge pas d’un millimètre. « Seulement, quand je me trompe, ça coûte une soirée à des gens qui n’y sont pour rien. Ça me rend prudent. Pas juste : prudent. »",
     "d": -2,
     "ton": "franc"
    },
    {
     "lab": "« Alors on ira ailleurs. »",
     "r": "« Allez-y. Sincèrement. » Il écarte son assiette. « Deux crans en dessous, il sera en haut de carte et il reprendra confiance. Si son nom revient devant moi dans deux ans, je regarderai. »",
     "d": 0,
     "ton": "sec"
    },
    {
     "lab": "Changer de sujet.",
     "r": "Il accepte tout de suite, presque soulagé, et la conversation repart ailleurs. Il a quand même noté que personne, à cette table, n’a défendu ce garçon.",
     "d": -1,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "vos_hommes_le_prefere",
   "si": "chaud",
   "texte": "Il baisse la voix d’un cran, ce qui chez lui tient lieu de confidence. « J’aime bien votre gaucher. Je ne le dis pas au bureau. Dès que j’aime bien quelqu’un, on me le demande pour user un garçon qu’il faut faire monter. »",
   "choix": [
    {
     "lab": "« Pourquoi lui ? »",
     "r": "« Il ne recule pas quand il est fatigué. » Il hausse les épaules, gêné d’avoir dit quelque chose de sentimental. « Le reste s’apprend : la distance, les angles, la lecture. Ça, non. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Alors protégez-le. »",
     "r": "« Je ne protège personne, ce n’est pas mon travail. » Un temps. « En revanche, il m’arrive de me tromper d’ordre. De donner celui de novembre plutôt que celui de septembre. Ça ne s’appelle pas protéger, ça s’appelle mal ranger un dossier. »",
     "d": 3,
     "ton": "complice"
    },
    {
     "lab": "« Vous voulez dire quoi, par “user” ? »",
     "r": "« Ce que vous avez compris. » Il repose son verre. « Il y a des garçons dont le rôle, un soir, est de rendre quelqu’un d’autre crédible. Personne ne signe pour ça. Tout le monde le fait une fois. »",
     "d": 5,
     "ton": "franc"
    },
    {
     "lab": "« Ne vous attachez pas. Il vaut plus cher que ça. »",
     "r": "Il rit franchement, pour la première fois de la soirée. « Vous négociez à partir d’un compliment. » Il redevient sérieux, sans se fâcher. « Bon réflexe. Mauvais soir. »",
     "d": -2,
     "ton": "intéressé"
    }
   ]
  },
  {
   "cle": "vos_hommes_l_inconnu",
   "si": "petiteSalle",
   "texte": "« Vous êtes une petite salle. Ce n’est pas une insulte, c’est un renseignement. » Il écarte les mains. « Je peux mettre vos hommes n’importe où sur une carte sans que personne râle. C’est un défaut et c’est un avantage. »",
   "choix": [
    {
     "lab": "« Expliquez-moi l’avantage. »",
     "r": "« Personne ne les protège, donc personne ne les évite. » Il compte sur ses doigts. « On vous appellera tard, vous prendrez les combats que les autres refusent. Trois soirées comme ça et on connaîtra son nom. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« On vaut mieux qu’un rôle de bouche-trou. »",
     "r": "« Tout le monde vaut mieux. » Il ne s’excuse pas. « Le mérite ne remplit pas les cases de ma soirée d’octobre. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« Il nous faut combien de temps pour exister ? »",
     "r": "« Deux ans si vous êtes bons. Quatre si vous êtes normaux. Jamais, si vous refusez les trois premiers combats que je propose. » Il replie sa serviette. « Le “jamais” arrive plus souvent qu’on ne croit. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« On prend tout ce que vous avez. »",
     "r": "« Non. » C’est net. « Un manager qui prend tout est un manager qui ne sait pas ce que valent ses hommes. Refusez-m’en un de temps en temps, quand il est mauvais pour votre garçon. Ça me renseignera mieux qu’un oui. »",
     "d": -1,
     "ton": "empressé"
    }
   ]
  },
  {
   "cle": "vos_hommes_la_grosse_salle",
   "si": "grosseSalle",
   "texte": "« Votre salle a un nom. Ça vous aide, et ça me complique la vie. » Il repousse la corbeille à pain. « Quand je propose un de vos hommes, l’autre camp regarde d’abord d’où il sort. Son bilan, c’est après. »",
   "choix": [
    {
     "lab": "« Ils regardent quoi, exactement ? »",
     "r": "« Qui l’entraîne, qui il touche à l’entraînement, et si vous êtes du genre à faire du bruit quand la décision ne vous plaît pas. » Il boit une gorgée. « Une réputation, ça circule d’abord entre les gens qui négocient. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Alors servez-vous-en. Montez-les plus haut. »",
     "r": "« Une salle réputée ne monte personne d’un cran. Elle oblige à mieux choisir l’adversaire, et à le payer plus cher pour qu’il vienne. » Il vous laisse le temps de comprendre que c’est un coût, pas un cadeau.",
     "d": -3,
     "ton": "exigeant"
    },
    {
     "lab": "« On ne refuse presque jamais un combat. Dites-le autour de vous. »",
     "r": "« Ça, je le retiendrai plus longtemps que le reste du dîner. » Il note deux mots sur le coin de la carte. « Vous venez de gagner un appel un dimanche soir. C’est comme ça que ça commence. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Nos garçons peuvent aller où ils veulent, de toute façon. »",
     "r": "« Bien sûr. » Ça ne l’émeut pas une seconde. « Personne ne signe d’exclusivité en dînant. Vous vouliez me dire quoi, au juste ? » Le reste du plat se passe sur un autre sujet.",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "vos_hommes_la_bourse",
   "si": "toujours",
   "texte": "« Vous savez comment on paie vos garçons, exactement ? » Ce n’est pas un piège. La moitié des gens à qui il pose la question se trompent.",
   "choix": [
    {
     "lab": "« Dites-moi. »",
     "r": "« Une part pour monter, la même si vous gagnez. Le reste, ce sont des primes que je ne décide pas : le finish, la soirée, la place sur la carte. » Il attend que le serveur s’éloigne. « Le contrat est identique pour tout le monde. Ce qui change, c’est le nombre de fois qu’on vous appelle. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« On négociera le moment venu. »",
     "r": "« Il n’y a presque rien à négocier avant le troisième combat. » Il n’en tire aucun plaisir. « Ce qui se négocie, c’est la suite. Encore faut-il qu’il y ait une suite. »",
     "d": -1,
     "ton": "prudent"
    },
    {
     "lab": "« Mes hommes ne se lèvent pas pour ça. »",
     "r": "« Personne ne signe pour la première bourse. » Il se ressert un peu d’eau. « On signe pour la deuxième. Si vous m’expliquez le contraire, c’est que vous ne comptez pas rester longtemps. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« Et vous, vous êtes payé comment ? »",
     "r": "Il a un temps d’arrêt. « Un salaire. Rien qui dépende du résultat des combats, sinon je programmerais n’importe quoi. » Il hausse les sourcils. « C’est la seule ligne intelligente de mon contrat. »",
     "d": 3,
     "ton": "complice"
    }
   ]
  }
 ],
 "le_metier": [
  {
   "cle": "le_metier_ce_que_je_fais_vraiment",
   "si": "premier",
   "texte": "« Avant qu'on commande, mettons une chose au clair : je ne signe personne, je ne fixe pas les bourses et je ne donne pas les ceintures. » Il repousse la carte des vins sans l'ouvrir. « Je fabrique des paires. C'est tout mon métier. »",
   "choix": [
    {
     "lab": "« Alors qui décide ? »",
     "r": "« Le patron signe, la télé choisit la date, la commission valide les licences. Moi je propose des noms et je réponds au téléphone quand ça déplaît. » Il dit ça sans amertume, comme on récite une adresse.",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Dit comme ça, ça a l'air simple. »",
     "r": "« Trouvez-moi un adversaire pour un gaucher qui a déjà battu tous les gars corrects de sa région. » Il repose le menu. « Vous avez trois semaines et pas de budget pour l'avion. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Qu'est-ce que vous attendez d'une salle comme la mienne ? »",
     "r": "« Des dossiers médicaux à jour, des hommes qui ne disparaissent pas en août, et quelqu'un qui répond le dimanche. » Il ajoute, plus bas : « Vous seriez surpris du nombre de salles qui échouent sur les trois. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« J'ai déjà eu ce discours dans une autre organisation. »",
     "r": "« Alors vous savez tout. » Il commande sans se presser, parle du restaurant, du trajet. Vous n'apprendrez rien ce soir.",
     "d": -4,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "le_metier_la_carte_a_lenvers",
   "si": "toujours",
   "texte": "« Tout le monde croit que je choisis douze affiches. J'en choisis une. » Il écarte son verre pour faire de la place. « Le main event tient la soirée ; le reste, je le bouche avec ce qui est disponible. Les derniers combats se signent à onze jours. »",
   "choix": [
    {
     "lab": "« Et si le main event tombe ? »",
     "r": "« Alors je n'ai plus une soirée, j'ai douze combats dans le désordre. » Il hoche la tête. « C'est arrivé en mars. J'ai tout remonté en deux jours et personne ne m'a remercié. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "le_metier_le_main_event"
    },
    {
     "lab": "« Donc les prélims, c'est le fond du panier. »",
     "r": "« Les prélims, c'est là que je fabrique les gars qui feront vos main events dans trois ans. » Il repose sa fourchette. « Vous parlez comme quelqu'un qui arrive au milieu de la soirée. »",
     "d": -2,
     "ton": "arrogant"
    },
    {
     "lab": "Poser ma fourchette et le laisser parler.",
     "r": "Il enchaîne. Dans quel ordre il appelle les managers, pourquoi il commence par le refus le plus probable, ce qu'il fait quand deux camps disent oui pour la même place. Votre plat refroidit et vous vous en fichez.",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Mes deux gars peuvent répondre à onze jours. »",
     "r": "Il sort son téléphone, note un mot, le range. « Ça, c'est utile. Je ne promets rien. Les salles qui disent oui à onze jours, je les rappelle. »",
     "d": 2,
     "ton": "franc"
    }
   ]
  },
  {
   "cle": "le_metier_neuf_jours",
   "si": "toujours",
   "texte": "Il fait tourner son verre sans le boire. « Neuf jours avant la carte de juin, mon main event se déchire un ligament au sparring. Il ne l'a dit à personne pendant deux jours, il espérait que ça passe. »",
   "choix": [
    {
     "lab": "« Ils vous mentent souvent ? »",
     "r": "« Ils ne mentent pas, ils espèrent. C'est pire : on ne peut pas leur en vouloir. » Il ajoute que dans les salles sérieuses, c'est le kiné qui l'appelle, jamais le combattant.",
     "d": 3,
     "ton": "curieux",
     "ouvre": "le_metier_la_pesee"
    },
    {
     "lab": "« Vous avez trouvé quelqu'un ? »",
     "r": "« Un garçon à Rotterdam, qui a dit oui en quarante minutes. » Il vérifie que vous suivez. « Il a perdu. Il est toujours sous contrat. L'autre non. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« À neuf jours, on peut refuser sans se griller ? »",
     "r": "« On peut, et je le note. Pas par rancune. » Il hausse une épaule. « La fois d'après, j'appelle dans l'ordre de ceux qui avaient dit oui. »",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« Mes hommes sont toujours prêts, eux. »",
     "r": "« Personne n'est toujours prêt. » Il coupe sa viande sans lever les yeux. « Quand un coach me dit ça, je sais que j'aurai un problème sur la balance. »",
     "d": -4,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "le_metier_le_combat_annule",
   "si": "habitue",
   "texte": "« La dernière fois, vous m'avez demandé pourquoi je n'ai jamais fait le combat que tout le monde réclamait. » Il pose ses couverts en croix. « Ce n'était pas l'argent. Les deux avaient dit oui. »",
   "choix": [
    {
     "lab": "« Alors c'était quoi ? »",
     "r": "« Un visa. Six mois de dossier, un tampon qui n'est jamais venu, et l'un des deux a fini par prendre un combat ailleurs. » Il hausse une épaule. « On a écrit que j'avais peur du résultat. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Vous auriez pu l'expliquer publiquement. »",
     "r": "« Expliquer à tout un pays qu'un combat est mort dans un bureau ? Personne ne veut cette histoire-là. » Un demi-sourire. « Vous, si. C'est déjà quelque chose. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Ça vous a coûté cher ? »",
     "r": "« Une soirée à refaire et une année de crédibilité. » Il boit enfin. « L'affiche était déjà imprimée. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« Honnêtement, tout le monde s'en fiche. »",
     "r": "Il vous regarde une seconde de trop. « Oui. Sans doute. » Il parle d'autre chose ensuite, poliment, et ne revient plus une seule fois sur son travail.",
     "d": -5,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "le_metier_styles_invendables",
   "si": "toujours",
   "texte": "« J'ai un garçon qui n'a jamais perdu un round. Il plaque, il contrôle, il gagne. » Il n'a pas l'air content de le dire. « Je n'arrive pas à le vendre. »",
   "choix": [
    {
     "lab": "« Vous le sortez de la carte ? »",
     "r": "« Non. Je le mets tôt, quand la salle se remplit encore. Il travaille, il est payé, et il n'entend pas les sifflets. » Un temps. « Il le sait. On en a parlé, lui et moi. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Le public a tort. »",
     "r": "« Le public paie. Il n'a pas tort, il a autre chose à faire de sa soirée. » Une pause. « Mais oui. Il a tort. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« Et le gars qui perd une fois sur deux et qui remplit la salle ? »",
     "r": "Il rit brièvement — la première fois de la soirée. « Vous l'avez repéré, alors. Il se fait sortir au deuxième round et je le reprends à chaque fois. Il vend plus de billets que mon champion. » Puis il baisse un peu la voix.",
     "d": 4,
     "ton": "complice",
     "ouvre": "le_metier_le_placard"
    },
    {
     "lab": "« Apprenez-lui à finir. »",
     "r": "« C'est votre métier, ça, pas le mien. » Sec. « Je vends ce que les salles m'envoient. Vous m'envoyez des hommes qui contrôlent, je vends des hommes qui contrôlent. »",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "le_metier_celui_qui_refuse",
   "si": "froid",
   "texte": "« On me dit que vous avez des avis sur mon métier. » Il n'est pas agressif, juste las. « J'ai un classé qui a refusé onze noms cette année. Onze, avec une bonne raison à chaque fois. Vous feriez quoi ? »",
   "choix": [
    {
     "lab": "« Je le laisse sur la touche. »",
     "r": "« C'est ce que j'ai fait. Une année sans combattre, il a perdu son classement tout seul. » Il n'a pas l'air fier. « Il m'a rappelé en janvier. Il aurait pris n'importe qui. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« J'annonce le combat dans la presse avant de l'appeler. »",
     "r": "« Ça marche une fois. » Il fait non de la tête. « Ensuite plus personne ne me répond, et je ne travaille plus du tout. »",
     "d": -2,
     "ton": "sec"
    },
    {
     "lab": "« Sur onze fois, il a peut-être eu raison une fois. »",
     "r": "Il s'arrête. « Deux fois. Il y avait deux guet-apens là-dedans, et il les a vus avant moi. » Il repose son verre. « Ça, d'habitude, je ne le dis pas à voix haute. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Virez-le, il vous fait perdre du temps. »",
     "r": "« Le virer. » Il répète le mot comme s'il l'examinait. « Il a deux enfants, un genou en morceaux, et il reste un de mes trois meilleurs. Non. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "le_metier_ordre_de_carte",
   "si": "toujours",
   "texte": "Il retourne le menu et trace une colonne au stylo. « Voilà une soirée. Le premier combat réveille la salle, celui du milieu sert à prendre des risques pendant que personne ne regarde. Et celui juste avant le main event, c'est le plus important de tous. »",
   "choix": [
    {
     "lab": "« Pourquoi celui-là ? »",
     "r": "« Parce que c'est le dernier avant que les gens décident si la soirée valait le prix. » Il tapote la ligne. « S'il est ennuyeux, mon main event peut être magnifique, ils rentreront déçus quand même. »",
     "d": 4,
     "ton": "curieux",
     "ouvre": "le_metier_le_main_event"
    },
    {
     "lab": "« Celui du milieu, donc. La poubelle. »",
     "r": "« La salle d'essai. Nuance. » Il reprend son stylo. « La plupart de mes titulaires actuels sont passés par ce créneau-là. »",
     "d": -1,
     "ton": "sec"
    },
    {
     "lab": "« Vous mettriez mes hommes où ? »",
     "r": "« Tôt. Selon ce que je trouve en face. » Il replie le menu. « Ce n'est pas une insulte : c'est là qu'on voit si un homme tient devant une salle à moitié vide, sans caméra sur lui. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "Retourner le menu vers lui et le laisser continuer.",
     "r": "Il repart pour un long moment. Le temps entre deux combats, la longueur des walkouts, pourquoi il ne met jamais deux hommes du même pays à la suite. Il s'interrompt seulement quand on débarrasse.",
     "d": 5,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "le_metier_le_main_event",
   "si": "toujours",
   "texte": "« Un bon combat et un main event, ce n'est pas la même chose. » Il pose son couteau. « Il faut un titre, une rancune, ou une histoire. Deux excellents combattants polis, ça ne remplit rien. »",
   "choix": [
    {
     "lab": "« Et quand les deux se respectent ? »",
     "r": "« Je cherche autre chose : anciens partenaires d'entraînement, une revanche, une ceinture qui se libère. » Il hausse les épaules. « Si je ne trouve rien, je le descends en co-main et je ne le vends pas comme un événement. Mentir sur une affiche, ça se paie au gala suivant. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Mon gars a exactement l'histoire qu'il vous faut. »",
     "r": "« Peut-être. » Il ne mord pas. « Racontez-la-moi en trois phrases. S'il vous en faut plus, ce n'est pas une histoire, c'est un CV. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Donc vous vendez du cirque. »",
     "r": "« Je vends des billets pour deux hommes qui vont se faire mal. Si ça vous gêne, on peut parler du vin. » Il n'a pas haussé le ton. Le repas sera plus court que prévu.",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "« Qu'est-ce qui a le mieux marché cette année ? »",
     "r": "« Deux gars de la même ville, même catégorie, qui s'évitaient depuis des années. » Ça l'amuse encore. « Je n'ai eu qu'à mettre leurs noms sur la même ligne. Aucune conférence de presse, salle pleine. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "le_metier_la_pesee",
   "si": "toujours",
   "texte": "« La pesée, c'est là que ma carte meurt. » Il n'a plus le ton de la conversation. « Un homme qui rate le poids, ce n'est pas une amende. C'est un combat à refaire la veille au soir, avec l'autre camp au téléphone. »",
   "choix": [
    {
     "lab": "« Vous annulez ? »",
     "r": "« Ça dépend de l'autre. Souvent il accepte, contre une part de la bourse. » Il repose sa fourchette. « Mais il accepte en colère, et il combat mal. Personne ne gagne ce soir-là. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Il faudrait interdire les gros cuts. »",
     "r": "« Je suis d'accord avec vous. Allez l'expliquer à un garçon qui a bâti toute sa carrière sur le fait d'être le plus lourd de sa catégorie. » Il n'est pas agacé. Il est fatigué.",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Chez moi, ils font le poids. »",
     "r": "« Tenez-vous-y. » Un temps. « Je retiens deux choses d'une salle : qui me répond en urgence et qui rate la balance. Les deux se savent en une saison. »",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« C'est le problème du combattant, pas le vôtre. »",
     "r": "« C'est le problème de tout le monde. » Sec. « Le diffuseur a acheté un créneau, la salle est louée depuis le printemps, et l'autre gars a coupé pour rien. »",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "le_metier_les_locaux",
   "si": "petiteSalle",
   "texte": "« Votre salle est petite, mais elle est au bon endroit. » Il pose l'index sur la nappe. « Quand je monte une soirée dans votre région, il me faut des gars du coin sur les prélims. Sinon la salle est vide à l'ouverture des portes. »",
   "choix": [
    {
     "lab": "« Vous attendez qu'on vende des billets ? »",
     "r": "« Je n'attends rien de vous. Vos élèves, leurs familles, leurs collègues : ça se fait tout seul quand un nom d'ici est sur l'affiche. » Il ajoute que c'est la seule chose qu'une petite salle apporte, et que c'est déjà beaucoup.",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« On peut vous remplir un bloc entier. »",
     "r": "« On me le promet à chaque tournée. » Il ne note rien. « Faites-le une fois. C'est la fois d'après qui compte. »",
     "d": 1,
     "ton": "flatteur"
    },
    {
     "lab": "« Qu'est-ce qui fait qu'un local fonctionne ? »",
     "r": "« Qu'il soit vraiment d'ici, et qu'il finisse tôt. » Il vide son verre à moitié. « Un gars du coin qui va en décision, la salle sort fumer avant la fin. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Les prélims locaux, c'est du remplissage. »",
     "r": "« Du remplissage. » Il repose sa fourchette. « Ces combats-là paient la location de la salle. Le vôtre passerait juste après, si vous en aviez un. »",
     "d": -3,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "le_metier_le_placard",
   "si": "chaud",
   "texte": "Il baisse la voix sans se pencher. « Il y a une chose qu'on ne dit pas. Quand je veux qu'un homme parte sans le licencier, je lui donne le mauvais style trois fois de suite. Il perd, il s'en va de lui-même, et personne n'a eu à être le méchant. »",
   "choix": [
    {
     "lab": "« C'est dégueulasse. »",
     "r": "« Oui. » Il ne se défend pas. « Quatre fois en dix ans, et je me souviens des quatre noms. Vous vouliez savoir comment se fabrique une carte : ça en fait partie. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Vous l'avez déjà fait à un des miens ? »",
     "r": "« Non. » Il vous regarde bien en face. « Et si je le faisais, vous ne le sauriez pas. Ça ressemble exactement à de la malchance. C'est pour ça que ça marche. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Malin. »",
     "r": "« Ce n'est pas malin, c'est lâche. » Il finit son verre. « Vous m'avez demandé la vérité. Ne me félicitez pas pour ça. »",
     "d": -3,
     "ton": "flatteur"
    },
    {
     "lab": "Ne rien répondre.",
     "r": "Le silence dure, et il le laisse durer. Puis il hoche la tête. « Voilà. C'est la bonne réaction. » Il change de sujet lui-même. Quelque chose s'est desserré entre vous.",
     "d": 4,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "le_metier_le_test",
   "si": "aClasse",
   "texte": "« Votre classé, je vais devoir le tester. » Il dit ça comme un fait, sans agressivité. « Pas contre un nom : contre un style. Je veux savoir ce qu'il fait quand on le colle contre la cage pendant cinq minutes. »",
   "choix": [
    {
     "lab": "« Il l'a déjà fait. »",
     "r": "« Contre qui ? » Vous donnez un nom. Il fait la moue. « Celui-là ne plaque pas, il pousse. Ce n'est pas la même chose. Je vous en trouverai un vrai. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Vous cherchez à le faire perdre. »",
     "r": "« Si je cherchais ça, je ne vous en parlerais pas à table. » Il repose sa serviette. « Un homme que personne n'a testé, je ne peux pas le monter : je ne sais pas ce que j'achète. »",
     "d": -2,
     "ton": "sec"
    },
    {
     "lab": "« Faites-le tôt dans l'année. »",
     "r": "« Ça, c'est une demande raisonnable. » Il note quelque chose. « En hiver, il y a moins de monde et la salle pardonne davantage. Vous pensez au calendrier. C'est rare. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Et s'il passe le test ? »",
     "r": "« Alors on aura une autre conversation, et vous n'aurez plus besoin de m'inviter à dîner. » Il sourit à moitié. « Je ne promets rien. Je dis ce que je vois. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "le_metier_la_porte_dentree",
   "si": "debutant",
   "texte": "« Vous n'avez personne de classé. Ce n'est pas une insulte, c'est juste où vous en êtes. » Il pousse son assiette de côté. « Alors je vais vous dire par où on entre. Ce n'est pas par le haut. »",
   "choix": [
    {
     "lab": "« Je vous écoute. »",
     "r": "« Le remplaçant. Un nom, une catégorie, et un homme qui peut être à l'aéroport dans la journée. La plupart du temps je n'appellerai pas. » Il vous laisse le temps. « Et un soir, votre gars a une soirée entière pour lui. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Mes hommes valent mieux que des bouche-trous. »",
     "r": "« Tous mes titulaires ont commencé bouche-trous. » Il hausse les épaules. « Vous les préférez dignes, ou vous les préférez sur une carte ? »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "Proposer de payer pour une place sur la carte.",
     "r": "« Vous ne me connaissez pas assez pour dire ça. » Il regarde ailleurs un instant. « Moi je vous connais assez pour faire comme si je n'avais pas entendu. Ne recommencez pas. »",
     "d": -6,
     "ton": "arrogant"
    },
    {
     "lab": "« Quelle catégorie vous manque, en ce moment ? »",
     "r": "Il s'arrête net. « Personne ne me demande jamais ça. » Il vous donne deux catégories et une tranche d'âge. « Amenez-moi ça d'ici deux ans et on aura une vraie conversation. »",
     "d": 5,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "le_metier_le_calendrier_du_champion",
   "si": "aChampion",
   "texte": "« Votre champion. » Il pose sa serviette à plat. « Il me faut un adversaire, une date et un diffuseur qui veuille de lui. Les trois ne tombent jamais le même mois. »",
   "choix": [
    {
     "lab": "« Il attend depuis huit mois. »",
     "r": "« Je sais. Il m'appelle. » Il ne se vexe pas. « Le seul homme qui le mérite s'est fait opérer en février. Je peux vous donner un autre nom demain, et vous me le reprocherez devant une salle à moitié vide. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Faites une ceinture intérimaire. »",
     "r": "« Une intérimaire, c'est un aveu : ça dit au public que le vrai champion ne combat pas. » Il secoue la tête. « J'en ai fait deux. Les deux fois, la ceinture a mis des années à s'en remettre. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Donnez-lui n'importe qui, il finit tout le monde. »",
     "r": "« C'est exactement ce qu'on disait de deux champions que j'ai vus perdre contre n'importe qui. » Il pique dans son assiette. « Ne redites pas ça devant moi. »",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "« Qu'est-ce qui vous aiderait, vous ? »",
     "r": "Il lève les yeux. « Une date où il est sûr d'être disponible, et un adversaire qu'il accepte à l'avance. Avec ça, je peux aller négocier le créneau télé. » Il ajoute, plus bas : « Personne ne m'apporte jamais les deux. »",
     "d": 5,
     "ton": "curieux"
    }
   ]
  }
 ],
 "la_tele": [
  {
   "cle": "la_tele_horaire_impose",
   "si": "toujours",
   "texte": "« Tu sais qui décide de l’heure exacte où ton gars marche vers la cage ? Pas moi. Une régie, à des kilomètres d’ici, avec une grille horaire qu’elle n’a pas le droit de déborder. » Il repousse son assiette. « On m’appelle matchmaker. En vrai, je fabrique une soirée qui doit finir à la minute près. »",
   "choix": [
    {
     "lab": "« Et quand un combat finit trop vite ? »",
     "r": "« On meuble. Un ralenti, une interview, un plan sur les tribunes. Et le suivant attend dans un couloir, gants aux mains, en train de refroidir. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Mes hommes s’échauffent quand on leur dit, pas quand ils veulent. »",
     "r": "« Merci. Tu ne mesures pas à quel point c’est rare. Beaucoup de coachs m’expliquent que leur protocole d’échauffement est sacré. Le direct, lui, ne l’est pas ? »",
     "d": 4,
     "ton": "pro"
    },
    {
     "lab": "« C’est absurde de faire poireauter un homme prêt. »",
     "r": "« Oui. Et ça le restera tant que c’est la chaîne qui paie la soirée. On peut vouloir changer ça, on peut vouloir être payé. Il faut choisir. »",
     "d": -1,
     "ton": "franc"
    },
    {
     "lab": "« L’heure, honnêtement, je m’en moque. »",
     "r": "« Toi, oui. Ton combattant, non : il aura eu le temps de redescendre, et il montera avec des jambes de vieux. Un coach qui s’en moque, je le retiens. »",
     "d": -4,
     "ton": "désinvolte"
    }
   ]
  },
  {
   "cle": "la_tele_perdant_qui_remplit",
   "si": "toujours",
   "texte": "« Le pire conseil qu’on donne aux jeunes coachs, c’est : protégez le bilan. » Il finit son verre sans se presser. « J’ai des invaincus dont personne ne veut, et un homme couvert de défaites que je case quand je veux. La différence, c’est que lui, ses combats se regardent. »",
   "choix": [
    {
     "lab": "« Donc une défaite ne tue pas une carrière. »",
     "r": "« Une défaite ennuyeuse, si. Un gars qui craque à la fin après avoir tout donné, je le rappelle le mois suivant. Un gars qui perd derrière sa garde sans rien tenter, je l’oublie avant d’être rentré. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Je n’apprendrai pas à mes gars à perdre joliment. »",
     "r": "« Personne ne te le demande. Je te demande qu’ils soient insupportables à affronter, pas confortables. Ça se travaille au gymnase, pas devant une caméra. »",
     "d": 0,
     "ton": "défensif"
    },
    {
     "lab": "« C’est facile à dire quand ce n’est pas votre homme qui prend. »",
     "r": "« C’est vrai. » Il laisse un silence. « Et c’est vrai quand même. Tu as le droit de m’en vouloir. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Vous parlez de spectacle. Moi, je fais de la compétition. »",
     "r": "« Je parle de ce qui finance ta compétition. Continue de croire que c’est incompatible, ça m’arrange : ton voisin a compris, et c’est lui qui aura la date de printemps. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "la_tele_sponsors_maillot",
   "si": "premier",
   "texte": "« Prépare-toi à une conversation désagréable avec tes gars. Le jour où ils signent chez nous, le garagiste et le kiné disparaissent de leur short. À la place, une somme fixe versée par l’équipementier, qui dépend du nombre de combats qu’ils ont derrière eux. »",
   "choix": [
    {
     "lab": "« Ça donne quoi, pour un débutant ? »",
     "r": "« De quoi payer un billet d’avion et les bagages en surpoids. Le garagiste payait mieux, et il venait au gala. Une exclusivité, ça rapporte surtout à ceux qui sont déjà connus. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Et le sponsor qui payait le camp, j’en fais quoi ? »",
     "r": "« Tu le déplaces. Les murs de ta salle, les tee-shirts de l’équipe, tes vidéos. Ce qui nous appartient, c’est la cage et la semaine de l’événement. Le reste de leur vie est à eux. »",
     "d": 3,
     "ton": "pratique"
    },
    {
     "lab": "« C’est du vol, et vous le savez. »",
     "r": "« C’est une exclusivité négociée, signée par des adultes. Tu peux la trouver injuste, moi aussi certains soirs. Me le dire à moi, ce soir, ça ne change rien. »",
     "d": -2,
     "ton": "accusateur"
    },
    {
     "lab": "« Je le leur dirai avant qu’ils signent, pas après. »",
     "r": "« Fais-le. Les rancunes que je ramasse toute l’année, ce sont presque toujours des choses que quelqu’un aurait dû dire avant la signature. »",
     "d": 4,
     "ton": "pro"
    }
   ]
  },
  {
   "cle": "la_tele_bonus_du_soir",
   "si": "habitue",
   "texte": "« Les primes de la soirée, ce n’est pas moi. C’est le patron, dans le couloir, juste après la dernière cloche. Il y a un carnet, un stylo et son humeur. » Il hausse une épaule. « Ce carnet a payé plus de loyers que toutes mes cartes réunies. »",
   "choix": [
    {
     "lab": "« Comment on met les chances de son côté ? »",
     "r": "« Tu finis. Tôt, tard, peu importe, mais tu finis. Et si possible pendant que la salle regarde, pas pendant qu’elle fait la queue au bar. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Autrement dit, une loterie. »",
     "r": "« Une loterie où celui qui prend des risques gagne plus souvent. Appelle ça comme tu veux, ça ne me vexe pas. »",
     "d": 0,
     "ton": "sec"
    },
    {
     "lab": "« Vous pourriez glisser un mot pour les miens. »",
     "r": "« Je pourrais. Une fois. » Il repose sa fourchette. « Ce sera le soir où j’y croirai, pas le soir où tu me l’auras demandé entre le fromage et le dessert. »",
     "d": -3,
     "ton": "opportuniste"
    },
    {
     "lab": "« Aucun de mes gars ne compte dessus. »",
     "r": "« Garde-les comme ça. J’ai vu un homme bâtir son année sur une prime qu’il croyait acquise, et les juges en décider autrement. Une prime, c’est un cadeau. Ça ne se budgète pas. »",
     "d": 3,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "la_tele_droits_geles",
   "si": "tiede",
   "texte": "« Tu m’as relancé plusieurs fois cet automne et je t’ai à peine répondu. Ce n’est pas contre toi. » Il baisse la voix sans se pencher. « On renégocie les droits. Tant que ce n’est pas signé, je n’annonce rien, je ne promets rien, et je ne dépense rien. »",
   "choix": [
    {
     "lab": "« Ça se termine quand ? »",
     "r": "« Quand les avocats auront fini de s’ennuyer les uns les autres. En attendant, garde tes hommes en forme, mais ne les fais pas descendre de poids pour une date qui n’existe pas. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Merci de me le dire. Je n’en parle à personne. »",
     "r": "« C’est pour ça que je te le dis en face plutôt que par écrit. Ce que je signe, je ne le raconte pas ; ce que je dis à table, je l’assume. »",
     "d": 4,
     "ton": "complice",
     "ouvre": "la_tele_combat_refuse"
    },
    {
     "lab": "« Vous auriez au moins pu répondre à un message. »",
     "r": "« Oui. » Il ne se défend pas. « J’ai une boîte de messages que je ne rattraperai jamais et des coachs dans tous les départements. Ce n’est pas une excuse, c’est l’état des choses. »",
     "d": -1,
     "ton": "reproche"
    },
    {
     "lab": "« Alors j’irai voir ailleurs. »",
     "r": "« Vas-y. » Il ne cille pas. « Et quand ce sera signé, souviens-toi que tu m’as dit ça au dessert d’un dîner que j’avais mis sur ma note de frais. »",
     "d": -5,
     "ton": "brusque"
    }
   ]
  },
  {
   "cle": "la_tele_combat_refuse",
   "si": "habitue",
   "texte": "« L’affiche du printemps que je t’avais laissé espérer, elle a existé une semaine, dans un fichier. » Il tourne son verre. « La chaîne a trouvé que personne ne saurait raconter ce combat en une phrase. Fin de l’histoire, et c’est moi qui ai passé les coups de fil. »",
   "choix": [
    {
     "lab": "« Vous leur dites quoi, dans ces cas-là ? »",
     "r": "« La vérité, en général. Ça ne console pas, mais ça évite qu’ils inventent pire. Le plus dur, c’est ceux qui avaient déjà commencé leur cut. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Vous auriez pu vous battre pour cette affiche. »",
     "r": "« Je choisis mes batailles à chaque carte, et j’en perds la plupart. Celle-là, je l’ai perdue avant même de la proposer. »",
     "d": -2,
     "ton": "reproche"
    },
    {
     "lab": "« Donc rien n’est sûr tant que ce n’est pas annoncé. »",
     "r": "« Rien n’est sûr même après l’annonce. Prépare tes hommes pour une date, pas pour un adversaire. »",
     "d": 2,
     "ton": "lucide"
    },
    {
     "lab": "« Merci de me l’avoir dit, même tard. »",
     "r": "« Je te le devais. Tu avais construit ton camp autour de ça. » Il hausse les épaules. « Je ne peux pas t’offrir la date. Je peux t’éviter d’attendre pour rien. »",
     "d": 4,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "la_tele_courbe_audience",
   "si": "chaud",
   "texte": "Il pose son téléphone entre les assiettes, écran tourné vers vous. Une courbe. « Samedi dernier, minute par minute. Là, ça monte : le gars de la région qui entre. Là, ça tombe d’un coup : le combat au sol qui s’éternise. Je vis dans ce dessin. »",
   "choix": [
    {
     "lab": "« Qu’est-ce qui fait remonter la courbe ? »",
     "r": "« Un walkout qu’on reconnaît dès les premières notes. Une histoire racontée avant, pas pendant. Et le sang, je ne vais pas te mentir à cette heure-ci. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Donc vous placez les lutteurs tôt dans la soirée. »",
     "r": "« Tu apprends vite. Tôt, ou en face de quelqu’un qui les oblige à avancer. Un lutteur contre un lutteur, c’est un trou dans ma soirée, et le trou se voit là-dessus le lendemain matin. »",
     "d": 4,
     "ton": "attentif"
    },
    {
     "lab": "« Je n’ai pas envie de coacher pour une courbe. »",
     "r": "« Personne ne te le demande. Elle existe, elle décide qui je rappelle, et tu viens de la voir. Ne me dis pas un jour que tu ne savais pas. »",
     "d": -1,
     "ton": "franc"
    },
    {
     "lab": "« Vous montrez ça à tout le monde ? »",
     "r": "« Non. » Il retourne le téléphone face à la nappe. « Et j’aimerais que ça reste entre le poisson et toi. »",
     "d": 2,
     "ton": "complice"
    }
   ]
  },
  {
   "cle": "la_tele_argent_reproche",
   "si": "froid",
   "texte": "Vous parlez d’argent depuis le début du plat. Il vous laisse finir, regarde un moment par la fenêtre. « Tu n’es pas le premier cette semaine à m’expliquer que ses hommes sont mal payés. Les autres avaient des hommes qui vendaient des billets. »",
   "choix": [
    {
     "lab": "« Alors dites-moi ce qui se vend. »",
     "r": "« Des soirées qu’on raconte au boulot le lundi. » Il revient vers vous, un peu moins fermé. « Voilà. C’était la bonne question. Tu as mis tout le repas à la poser, mais tu l’as posée. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Je défends mes gars. C’est mon métier. »",
     "r": "« Et le mien, c’est de faire une carte avec un budget qui ne bouge pas. On peut passer le repas à se rappeler nos métiers respectifs, ou parler d’autre chose. »",
     "d": 0,
     "ton": "franc"
    },
    {
     "lab": "« Vous vous gavez et vous le savez très bien. »",
     "r": "« Les comptes sont publics, va les lire. » Il cherche le serveur des yeux, puis se ravise. « Non. Finis ton assiette. Mais arrête. »",
     "d": -6,
     "ton": "hostile"
    },
    {
     "lab": "« Vous avez raison. Je me plains depuis le début du repas. »",
     "r": "« Ça arrive à tout le monde, et j’ai entendu pire ce mois-ci. Reviens l’an prochain avec un homme que je peux mettre en avant : ce sera moi qui parlerai d’argent le premier. »",
     "d": 3,
     "ton": "lucide"
    }
   ]
  },
  {
   "cle": "la_tele_bourse_vraie",
   "si": "aClasse",
   "texte": "« Ton classé, tu sais ce qu’il touche vraiment ? » Il aligne des miettes de pain sur la nappe. « La somme annoncée. Moins la part qui n’arrive que s’il gagne. Moins le camp, le stage à l’étranger, le manager, l’impôt d’ici et celui de là-bas. Ce qui reste tient dans une enveloppe. »",
   "choix": [
    {
     "lab": "« Je sais. C’est moi qui remplis les papiers. »",
     "r": "« Alors tu fais déjà mieux que la plupart de la profession. Les autres découvrent la retenue à la source le jour du virement, et ils appellent en criant qu’on les a volés. »",
     "d": 3,
     "ton": "pro"
    },
    {
     "lab": "« Autant dire qu’il travaille à perte. »",
     "r": "« Sur ce combat-là, souvent. Il ne travaille pas pour celui-là, il travaille pour ceux d’après. Ton rôle, c’est qu’il le sache avant de signer, pas en rentrant de la banque. »",
     "d": 2,
     "ton": "réaliste"
    },
    {
     "lab": "« Alors payez-les correctement. »",
     "r": "« Avec quoi ? Le diffuseur paie une somme fixe pour la soirée entière. Si je double la bourse de ton gars, je supprime des combats. Dis-moi lesquels et je le fais demain matin. »",
     "d": -4,
     "ton": "exigeant"
    },
    {
     "lab": "« Et vous, vous êtes payé comment ? »",
     "r": "« Au fixe, comme un cadre, avec une voiture que je n’ai pas choisie. Je ne touche pas un centime sur la billetterie, et c’est très bien : le jour où je serais intéressé au guichet, je te ferais des cartes obscènes. »",
     "d": 4,
     "ton": "curieux",
     "ouvre": "la_tele_bonus_du_soir"
    }
   ]
  },
  {
   "cle": "la_tele_champion_muet",
   "si": "aChampion",
   "texte": "« Ton champion. » Il prend le temps de choisir ses mots. « Techniquement, personne ne discute. Mais quand je propose son nom en tête d’affiche, la chaîne me demande qui c’est. Un titre ne remplit pas une salle : c’est une ceinture, pas une histoire. »",
   "choix": [
    {
     "lab": "« Qu’est-ce qui lui manque, exactement ? »",
     "r": "« Une raison de le regarder qui ne soit pas sa fiche. D’où il vient, ce qu’il déteste, qui il veut battre. Il n’est pas obligé de crier ; il est obligé d’exister en dehors de la cage. »",
     "d": 4,
     "ton": "curieux",
     "ouvre": "la_tele_courbe_audience"
    },
    {
     "lab": "« Il n’aime pas parler. C’est comme ça. »",
     "r": "« Alors trouve quelqu’un qui parle pour lui. Un adversaire bruyant, un journaliste qui l’aime bien, toi. Sinon il défendra son titre en début de soirée et il ne comprendra pas pourquoi. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Son bilan devrait suffire. »",
     "r": "« Il devrait. » Il sourit sans joie. « J’ai un tiroir plein de gens qui avaient raison. »",
     "d": -2,
     "ton": "rigide"
    },
    {
     "lab": "« C’est votre travail de le vendre, pas le mien. »",
     "r": "« Je vends ce qu’on me donne. Ce soir, tu me donnes un homme excellent, muet, et l’idée que c’est mon problème. Ça fait beaucoup en même temps que le plat. »",
     "d": -5,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "la_tele_prelims_gratuites",
   "si": "debutant",
   "texte": "« Si tes hommes viennent, ils commenceront par les prélims, là où personne ne regarde : la salle se remplit, les techniciens règlent encore le son. » Il coupe sa viande. « Ce n’est pas une punition. C’est le dernier endroit où on a le droit d’être mauvais. »",
   "choix": [
    {
     "lab": "« On y reste combien de temps ? »",
     "r": "« Le temps qu’il faut. Moins longtemps si les victoires sont franches. Le soir où le producteur me dira qu’on le garde pour le direct, tu le sauras avant ton combattant. »",
     "d": 2,
     "ton": "curieux",
     "ouvre": "la_tele_qui_paie_le_coin"
    },
    {
     "lab": "« Autrement dit, ça ne rapporte rien. »",
     "r": "« Rien, non. Ça rapporte une vidéo propre, un adversaire à son niveau et un dossier ouvert chez moi. À ce stade de sa vie, ça vaut mieux qu’un chèque. »",
     "d": 1,
     "ton": "réaliste"
    },
    {
     "lab": "« Mes gars valent mieux que le début de soirée. »",
     "r": "« Ils valent peut-être mieux. Ils n’ont encore rien prouvé. » Il repose ses couverts. « Tout le monde arrive avec cette phrase. Personne ne me la répète l’année suivante. »",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "« On prendra ce qu’on nous donne. »",
     "r": "« Bonne réponse. Ne l’use pas trop. Accepte tout au début, et refuse la première fois qu’on te manque de respect — pas avant, surtout pas après. »",
     "d": 3,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "la_tele_qui_paie_le_coin",
   "si": "toujours",
   "texte": "« Une chose que personne ne dit aux coachs avant leur première fois : on fait venir le combattant, pas sa maison. » Il écarte la corbeille de pain. « Lui, et son coach en général. Le kiné, le nutritionniste, le cousin qui filme : c’est toi qui paies, ou ils restent ici. »",
   "choix": [
    {
     "lab": "« Qu’est-ce que ça change, sur place ? »",
     "r": "« Que tu portes les seaux, tu tiens le chrono et tu discutes avec la commission en même temps. Ceux qui découvrent ça le jour des pesées passent la semaine à courir. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« J’emmènerai mon second. Je paierai. »",
     "r": "« C’est ce que font ceux qui durent. Un visage qu’il reconnaît entre les reprises vaut plus cher qu’une chambre d’hôtel. »",
     "d": 2,
     "ton": "pro"
    },
    {
     "lab": "« Vous pourriez faire un geste. »",
     "r": "« Je peux demander. On me répondra qu’on a déjà payé un avion pour un gars qui passe avant l’antenne. Je préfère garder mes demandes pour sa bourse. »",
     "d": -2,
     "ton": "exigeant"
    },
    {
     "lab": "« On se débrouillera, comme d’habitude. »",
     "r": "« Note quand même ce que ça te coûte. Le jour où tu viendras négocier, c’est tout ce que tu auras à poser sur la table. »",
     "d": 2,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "la_tele_vendeur_de_billets",
   "si": "petiteSalle",
   "texte": "« J’ai un gars dans mon carnet qui a perdu ses derniers combats. Il est toujours sur mes cartes. Tu sais pourquoi ? Il remplit des cars entiers dans sa vallée. Des voisins, des tantes, tout un village. » Il vous regarde. « Ta salle, elle vend combien de places ? »",
   "choix": [
    {
     "lab": "« Aucune. Personne ne nous connaît en dehors du quartier. »",
     "r": "« Au moins tu es lucide, ça nous fait gagner du temps. Commence par là : un car, une buvette, des tee-shirts que les gens achètent vraiment. Ce n’est pas indigne, c’est le métier avant le métier. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Ce n’est plus du sport, ce que vous décrivez. »",
     "r": "« Non. C’est ce qui paie le sport. Le sport, c’est ce qui reste quand la billetterie est bouclée et que les portes s’ouvrent. »",
     "d": -2,
     "ton": "hautain"
    },
    {
     "lab": "« Comment on fabrique un vendeur de billets ? »",
     "r": "« Localement, et lentement. Il combat près de chez lui, il serre des mains à la sortie, il va voir les gamins à l’entraînement, il rate des baptêmes. Ça se construit sur des saisons, pas en un communiqué. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Je peux vous en fournir un dès cette année. »",
     "r": "« Ne me le promets pas ce soir, avec du vin dans le verre. Promets-le-moi en février, quand ta salle sera pleine un mardi et que tu m’enverras la photo. »",
     "d": -1,
     "ton": "vantard"
    }
   ]
  },
  {
   "cle": "la_tele_bloc_de_places",
   "si": "grosseSalle",
   "texte": "« Ta salle a un nom, maintenant. On va t’appeler pour autre chose que des combats : prendre un bloc de places à tarif club, faire venir tes licenciés, prêter ton logo à l’affiche locale. » Il n’a pas l’air gêné de le dire au dessert. « Une salle pleine, c’est des gens qui connaissent quelqu’un dedans. »",
   "choix": [
    {
     "lab": "« J’y gagne quoi, concrètement ? »",
     "r": "« Des places au bord du grillage, ton nom sur l’affiche, et un portable qui décroche quand tu appelles. Ça peut te sembler peu. Beaucoup de coachs dans ce pays n’ont rien de tout ça. »",
     "d": 2,
     "ton": "direct"
    },
    {
     "lab": "« Je ne veux pas acheter mes propres places. »",
     "r": "« Personne ne veut, et personne ne t’y oblige. Mais celui qui les prend, c’est à lui que je pense quand il me reste un créneau à combler. Tu sais tout, tu décides. »",
     "d": 0,
     "ton": "prudent"
    },
    {
     "lab": "« Vous voulez que je remplisse la salle à votre place. »",
     "r": "« Oui. » Il ne bronche pas. « Je fabrique une carte, pas de la magie. Toi, tu connais tes adhérents par leur prénom. Moi, je connais surtout des gens qui travaillent avec moi. »",
     "d": 3,
     "ton": "lucide"
    },
    {
     "lab": "« On peut s’organiser : car, tarif club, la totale. »",
     "r": "« Écris-le-moi lundi, noir sur blanc, avec les places que tu tiens vraiment. Je transmets à la billetterie en précisant que ça vient de toi. C’est comme ça qu’on devient un nom dans un tableur. »",
     "d": 4,
     "ton": "pro"
    }
   ]
  }
 ],
 "concurrence": [
  {
   "cle": "concurrence_appel_recu",
   "si": "toujours",
   "texte": "« On vous a appelé, cette semaine. Non, je ne vous surveille pas : c’est leur recruteur qui le raconte. Il appelle toutes les salles de la région et il cite les noms au bar, pour se donner de l’importance. »",
   "choix": [
    {
     "lab": "« On m’a appelé, oui. Je n’ai rien signé. »",
     "r": "« Voilà. Vous auriez pu me laisser l’apprendre autrement, et j’aurais fait semblant de rien pendant des mois. » Il repose sa fourchette. « Je préfère ça. »",
     "d": 4,
     "ton": "franc",
     "ouvre": "concurrence_comment_on_perd"
    },
    {
     "lab": "« Personne ne m’a appelé. »",
     "r": "Il vous regarde une seconde de trop, puis retourne à son assiette. « D’accord. » Le reste du plat se passe en silence.",
     "d": -5,
     "ton": "prudent"
    },
    {
     "lab": "« Et si j’avais rappelé ? »",
     "r": "« Vous auriez fait votre métier. Un manager qui n’a qu’un seul numéro dans son téléphone n’a pas de métier, il a un patron. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Ça vous inquiète ? »",
     "r": "« Non. Je calcule. » Il désigne la salle du menton. « Ce dîner me coûte moins cher qu’un combattant qu’on vient me prendre au printemps. »",
     "d": 0,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "concurrence_comment_on_perd",
   "si": "toujours",
   "texte": "« Vous croyez qu’on perd un homme sur l’argent. Presque jamais. On le perd un mardi, quand il réclame une date depuis des semaines et qu’on ne l’a pas rappelé. L’autre, lui, il rappelle le soir même. »",
   "choix": [
    {
     "lab": "Écouter, sans rien dire.",
     "r": "« L’an dernier, plusieurs sont partis de chez nous. La plupart à cause de moi. Le dernier, on lui avait annoncé un main event en septembre et j’ai mis quelqu’un d’autre à sa place. Il avait raison de partir. »",
     "d": 5,
     "ton": "attentif"
    },
    {
     "lab": "« Vous rappelez, vous ? »",
     "r": "« Pas toujours. » Il ne cherche pas d’excuse. « Le lundi, le téléphone ne s’arrête pas. Il y a des appels auxquels je ne réponds jamais. Ce sont ceux-là qui partent. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Alors rappelez-moi plus vite, moi. »",
     "r": "« C’est noté comme une demande, ça. » Il sourit sans chaleur. « On verra de quel côté vous tombez. »",
     "d": -2,
     "ton": "exigeant"
    },
    {
     "lab": "« Chez moi, personne ne part. »",
     "r": "« Personne ne part jamais, jusqu’au jour où quelqu’un part. » Il boit une gorgée. « Et ce jour-là, c’est le manager qui m’appelle pour me demander comment c’est arrivé. »",
     "d": -3,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "concurrence_avec_qui_dautre",
   "si": "premier",
   "texte": "« Avant qu’on commande, une question bête : vous travaillez avec qui d’autre ? » Il pose son téléphone à plat, écran contre la nappe. « Ce n’est pas un piège. J’aime savoir à qui je parle avant de parler. »",
   "choix": [
    {
     "lab": "Donner la liste, sans broder.",
     "r": "« Merci. » Il retient les noms sans rien noter. « Vous auriez pu en oublier un pour me faire plaisir. Ça se voit toujours, et je passe ensuite la soirée à vérifier au lieu d’écouter. »",
     "d": 4,
     "ton": "franc",
     "ouvre": "concurrence_la_clause"
    },
    {
     "lab": "« Personne. Vous êtes le premier. »",
     "r": "« Alors soit vous débutez, soit vous mentez. » Il ne dit pas ce qu’il croit. « Les deux se rattrapent, remarquez. Pas au même prix. »",
     "d": -3,
     "ton": "flatteur"
    },
    {
     "lab": "« Je préfère garder ça pour moi. »",
     "r": "« C’est votre droit. » Il retourne son téléphone, écran vers le haut. « Sachez seulement que je l’aurai su avant vendredi, et par quelqu’un d’autre que vous. C’est ça, le prix. »",
     "d": -1,
     "ton": "prudent"
    },
    {
     "lab": "« Et vous, vous parlez à combien de salles comme la mienne ? »",
     "r": "« Beaucoup. » Il répond sans hésiter. « J’en connais bien une poignée, et j’en appelle encore moins quand ça brûle. Vous savez maintenant ce qu’il y a à gagner ce soir. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "concurrence_la_clause",
   "si": "toujours",
   "texte": "« Vous les lisez jusqu’au bout, les contrats ? Pas la bourse, les pages du fond. » Il écarte la salière pour dessiner sur la nappe avec le doigt. « Exclusivité après le dernier combat, et droit d’aligner la meilleure offre. Autrement dit : même quand il est libre, il ne l’est pas. »",
   "choix": [
    {
     "lab": "« Expliquez-moi ce que ça change vraiment. »",
     "r": "« Ça change qui parle en premier. L’autre fait son offre, j’ai le droit de la recopier, et votre homme n’a rien gagné — sauf s’il a un manager capable de faire monter les deux en même temps. Ce n’est pas mon intérêt de vous dire ça, remarquez. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Je les lis. Ligne par ligne. »",
     "r": "« Alors vous êtes une exception. » Il a l’air sincèrement content. « La plupart des managers de cette ville découvrent l’alignement le jour où ils en ont besoin. C’est-à-dire trop tard. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« C’est une clause dégueulasse. »",
     "r": "« Oui. » Il ne se défend pas. « Elle existe parce qu’on a payé la montée de garçons qui signaient ailleurs le mois où ils devenaient intéressants. Elle est dans tous les contrats du métier, y compris ceux d’en face. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Mes gars ne signeront pas ça. »",
     "r": "« Alors ils ne signeront pas. » Il reprend son couteau. « Ce n’est pas une menace, c’est de l’administratif. Je ne rédige pas les contrats, je remplis les cases. »",
     "d": -2,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "concurrence_le_confrere",
   "si": "habitue",
   "texte": "« Vous avez dû croiser mon homologue d’en face. Les gens attendent toujours que j’en dise du mal. » Il rompt son pain. « Il fait le même métier que moi avec moins de moyens, et il le fait bien. Ça m’ennuie, d’ailleurs. »",
   "choix": [
    {
     "lab": "« Pourquoi ça vous ennuie ? »",
     "r": "« Parce que je ne peux pas mettre son travail sur le compte de la chance. » Il repousse la corbeille. « Quand un concurrent est mauvais, on dort. Quand il est bon, on relit ses propres cartes le dimanche soir. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« On m’en a dit beaucoup de mal, justement. »",
     "r": "« Par qui ? Par des gens à qui il a dit non. » Il vous regarde. « Vous savez combien de personnes disent du mal de moi dans ce milieu ? Toutes celles que j’ai refusées. C’est-à-dire presque tout le monde. »",
     "d": -2,
     "ton": "bavard"
    },
    {
     "lab": "« Il paie mieux, en tout cas. »",
     "r": "« Sur le papier. Demandez-lui plutôt quand il paie. Nous, c’est un mois après le gala, virement, point. Lui, c’est quand la billetterie est rentrée, et il arrive qu’elle ne rentre pas. »",
     "d": -1,
     "ton": "sec"
    },
    {
     "lab": "« Vous vous parlez, tous les deux ? »",
     "r": "« On s’appelle quelques fois par an. Pour se prévenir qu’on est sur le même week-end, pour un garçon qu’on se repasse, et en décembre pour se souhaiter la bonne année comme deux hypocrites. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "concurrence_transfuge"
    }
   ]
  },
  {
   "cle": "concurrence_faire_jouer",
   "si": "aClasse",
   "texte": "« Votre classé. On m’a demandé de ses nouvelles ce mois-ci, et pas par des gens qui travaillent chez nous. » Il n’a pas l’air fâché. « C’est bon signe pour vous. C’est un problème pour moi. »",
   "choix": [
    {
     "lab": "« Alors mettez-le sur une vraie carte. »",
     "r": "« Nous y voilà. » Il repousse son assiette. « Ça marche parfois, ce genre de manœuvre. Pas ce soir, et pas comme ça. Vous venez de transformer un dîner en négociation. »",
     "d": -4,
     "ton": "pressé"
    },
    {
     "lab": "« Qu’est-ce que vous feriez, à ma place ? »",
     "r": "« À votre place ? J’écouterais tout le monde et je ne signerais rien avant le printemps. » Il hausse les sourcils. « Vous remarquerez que je viens de vous conseiller contre mes propres intérêts. Ne le répétez pas. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "Laisser planer. « Il est très demandé, en effet. »",
     "r": "« Bien sûr. » Il sourit poliment. « Vous savez ce que je fais des hommes très demandés ? Je les mets vite en face de quelqu’un de dangereux, tant qu’ils valent encore quelque chose. Réfléchissez avant de me refaire le coup. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« En quoi c’est un problème pour vous ? »",
     "r": "« Parce que je dois décider maintenant si je me bats pour lui en interne. Si je me bats, que j’obtiens l’argent et qu’il part quand même, c’est moi qui ai l’air d’un imbécile devant le patron. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "concurrence_le_champion",
   "si": "aChampion",
   "texte": "« Votre champion. Vous savez ce qui commence maintenant ? Tout le monde va lui expliquer qu’il est sous-payé. » Il déplie sa serviette sans se presser. « Certains auront raison. »",
   "choix": [
    {
     "lab": "« Qu’est-ce qui le retient chez vous, à part l’argent ? »",
     "r": "« La ceinture. Tant qu’il l’a, il ne part pas : ailleurs, il redevient un nom parmi d’autres. Le jour où il la perd, vous aurez quelques semaines pour le tenir, pas plus. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Qui lui parle, exactement ? »",
     "r": "« Les gens d’en face, et quelqu’un de son entourage à lui. » Il ne cite personne. « Ça commence toujours par l’intérieur. Cherchez celui qui a intérêt à ce qu’il bouge. »",
     "d": 3,
     "ton": "méfiant"
    },
    {
     "lab": "« Alors payez-le mieux. »",
     "r": "« Je transmettrai. » Il n’a pas l’air agacé, juste loin. « C’est la phrase que j’entends tous les jours. Elle n’a jamais fait bouger une ligne d’un budget. »",
     "d": -3,
     "ton": "exigeant"
    },
    {
     "lab": "« Il ne bougera pas. Il est bien chez moi. »",
     "r": "« Ils sont tous bien quelque part. » Il repousse son verre. « Occupez-vous de lui pendant qu’il n’écoute encore personne. Après, vous ne ferez plus que répondre. »",
     "d": -1,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "concurrence_petits_galas",
   "si": "debutant",
   "texte": "« Vous faites vos soirées où, en ce moment ? Une salle des fêtes, le samedi, un public qui connaît tous les combattants par leur prénom ? » Rien de condescendant dans le ton. « Ne vous en excusez pas. J’y vais encore, sans le dire à personne. »",
   "choix": [
    {
     "lab": "« Vous y cherchez quoi ? »",
     "r": "« Des gens qui savent perdre. » Il chasse une miette. « Sur les vidéos, tout le monde gagne. En salle, je vois comment un garçon se tient quand ça tourne mal et que sa mère est au premier rang. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Venez chez moi quand vous voulez. »",
     "r": "« Je sais. Et je ne préviendrai pas. » Il sourit. « Le jour où je préviens, on me met le meilleur gamin dans le meilleur combat, on m’assoit à côté du président, et je n’apprends rien. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« Mes soirées valent mieux que ça. »",
     "r": "« Peut-être. » Il ne s’énerve pas. « Mais quand on me dit que ça vaut mieux que ça avant que je l’aie vu, je retiens le nom pour ne pas y aller. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« À ce niveau-là, on se marche tous dessus. »",
     "r": "« Oui. Vous vous prêtez la cage, le médecin et l’ambulance, et vous vous volez des combattants le même mois. » Il vide son verre. « C’est un petit milieu. Ne vous fâchez avec personne avant d’en avoir les moyens. »",
     "d": 2,
     "ton": "franc"
    }
   ]
  },
  {
   "cle": "concurrence_affiliation",
   "si": "petiteSalle",
   "texte": "« On m’a dit qu’on vous proposait de mettre votre nom sous le leur. Leur logo sur votre mur, leurs stages, leurs tarifs. » Il écarte son assiette vide. « Ce n’est pas une insulte. Regardez seulement ce que vous rendez en échange. »",
   "choix": [
    {
     "lab": "« On rend quoi ? »",
     "r": "« Vos meilleurs jeunes, le jour où ils deviennent intéressants. Ce ne sera pas écrit comme ça, évidemment. Ce sera écrit “détection commune”. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« C’est de la visibilité gratuite. »",
     "r": "« La leur. » Il ne se moque pas. « Une salle qui porte le nom d’un autre ne recrute plus pour elle-même. Ça met des années à se voir, et ça ne se répare pas. »",
     "d": -2,
     "ton": "naïf"
    },
    {
     "lab": "« Et vous, vous me proposez quoi ? »",
     "r": "« Rien de signé, et rien ce soir. Je ne vends pas d’affiliation. Je regarde qui travaille bien, et je m’en souviens en février, quand il me manque un combat. »",
     "d": -1,
     "ton": "exigeant"
    },
    {
     "lab": "« J’ai déjà dit oui. »",
     "r": "« Bon. » Il encaisse sans un mot désagréable. « Merci de me le dire avant que je l’apprenne ailleurs. Ne me demandez pas d’être surpris quand votre meilleur junior signera chez eux. »",
     "d": 2,
     "ton": "franc"
    }
   ]
  },
  {
   "cle": "concurrence_argent_etranger",
   "si": "toujours",
   "texte": "« Un jour, on va vous proposer pour un combat à l’étranger une bourse que personne ici ne peut aligner. Court préavis, billet payé, hôtel correct. » Il pique dans son plat. « Personne ne vous dira ce qu’il y a autour. »",
   "choix": [
    {
     "lab": "« Il y a quoi, autour ? »",
     "r": "« Une pesée la veille au soir au lieu du matin, une commission médicale qui regarde ailleurs, et un adversaire annoncé l’avant-veille parce que le premier s’est désisté. » Il s’essuie la bouche. « Le chèque est vrai. Le reste aussi. »",
     "d": 5,
     "ton": "curieux",
     "ouvre": "concurrence_la_clause"
    },
    {
     "lab": "« À ce prix-là, on y va. »",
     "r": "« Faites. » Il ne discute pas. « Regardez seulement qui paie : la fédération locale, ou le promoteur ? Si c’est le promoteur, demandez une avance avant le vol. S’il refuse, vous connaissez déjà la fin de l’histoire. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Vous dites ça parce que ça vous arrange. »",
     "r": "« Évidemment que ça m’arrange. » Il ne se vexe pas. « Ça n’empêche pas que ce soit vrai. Dans ce métier, vous allez devoir vivre avec ces deux idées en même temps. »",
     "d": 0,
     "ton": "sec"
    },
    {
     "lab": "« Alignez-vous, et la question ne se pose plus. »",
     "r": "« Je ne peux pas m’aligner sur de l’argent qui ne sort d’aucun budget. » Il repose ses couverts. « Eux achètent un soir. Moi j’achète des années. Je ne gagnerai jamais la comparaison sur le montant. »",
     "d": -2,
     "ton": "exigeant"
    }
   ]
  },
  {
   "cle": "concurrence_meme_soir",
   "si": "grosseSalle",
   "texte": "« Il y a un samedi de mars où il y a nous, et où il y a eux. Même soir, deux villes voisines. » Il a l’air las. « Ce n’est pas une guerre, c’est du gâchis : on va se partager le même public et exactement les mêmes journalistes. »",
   "choix": [
    {
     "lab": "« Pourquoi personne ne décale ? »",
     "r": "« Parce que les salles se réservent très longtemps à l’avance, et parce que celui qui décale a l’air d’avoir peur. » Il tourne son verre sans le boire. « On va perdre de l’argent tous les deux pour une question de posture. C’est très exactement mon métier. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« J’ai des hommes sur les deux cartes. »",
     "r": "Il s’arrête net. « Sur les deux ? » Puis il se détend, un peu. « Bon. Au moins je l’apprends à table et pas dans le programme officiel. Ne mettez pas le même entraîneur dans les deux coins, c’est tout. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Dites-moi ce qui vous arrangerait. »",
     "r": "« Que votre gamin qui remplit sa région soit chez moi ce soir-là. » Il lève une main. « Je ne peux rien vous promettre en échange, pas ce soir. Je vous le dis quand même, plutôt que vous l’appreniez par mon assistante. »",
     "d": 4,
     "ton": "complice"
    },
    {
     "lab": "« Alors mettez le prix. »",
     "r": "« Bien sûr. » Il hoche la tête, sans chaleur. « Vous en avez le droit. Et moi, j’ai le droit de me souvenir que le jour où c’était serré, vous avez ouvert les enchères. »",
     "d": -3,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "concurrence_transfuge",
   "si": "habitue",
   "texte": "« Un garçon est parti de chez nous en claquant la porte. Il a gagné presque tous ses combats ailleurs, et son manager m’a écrit lundi. » Il replie sa serviette. « Une lettre très longue. On n’écrit pas des lettres comme ça quand tout va bien. »",
   "choix": [
    {
     "lab": "« Vous le reprenez ? »",
     "r": "« Probablement. » Il n’a pas l’air fier de lui. « Pas parce que je pardonne : parce qu’il vaut un peu plus cher qu’avant et qu’il coûtera moins. Partir, ça se paie au retour, et ça se paie sur la bourse. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Moi, je ne reprendrais pas. »",
     "r": "« C’est ce que je me disais au début. » Il sourit à moitié. « Et puis on comprend que la rancune est un luxe de patron. Moi, j’ai des cases à remplir avant la fin du mois. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Il vous a manqué de respect. »",
     "r": "« Il était jeune et mal conseillé. » Il regarde ailleurs une seconde. « Le manque de respect, dans ce métier, c’est de me faire perdre de l’argent. Le reste, c’est de l’orgueil, et l’orgueil ne remplit pas une salle. »",
     "d": -1,
     "ton": "sec"
    },
    {
     "lab": "« Et il paie comment, au juste ? »",
     "r": "« Prélims, contre quelqu’un qui ne lui fera aucun cadeau. Une fois. Après quoi on n’en reparle plus jamais. Je ne donne pas de leçons, je fais des cartes. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "concurrence_la_confidence",
   "si": "chaud",
   "texte": "Il baisse la voix d’un cran, sans se pencher — un homme qui sait qu’on se penche justement quand on veut être remarqué. « Une boîte que vous connaissez n’a pas payé ses combattants de l’automne. Les relances ne servent à rien. Ça se saura en janvier. »",
   "choix": [
    {
     "lab": "« Pourquoi vous me dites ça ? »",
     "r": "« Parce que vous alliez leur envoyer quelqu’un en février. » Il vous regarde bien en face. « Et parce qu’un jour, j’aurai peut-être besoin que vous me croyiez sur parole. »",
     "d": 5,
     "ton": "curieux"
    },
    {
     "lab": "« Ça reste entre nous. »",
     "r": "Il hoche la tête une fois et passe à autre chose. C’est tout ce que vous obtiendrez, et c’est déjà beaucoup : il n’a pas eu à le demander.",
     "d": 4,
     "ton": "prudent"
    },
    {
     "lab": "« Je pourrais m’en servir. »",
     "r": "Il repose son verre, lentement. « Bien sûr. Et demain, tout le milieu saura d’où ça vient, parce que très peu de gens le savent et que j’en fais partie. » Un temps. « Vous venez de me faire regretter une confidence. »",
     "d": -6,
     "ton": "arrogant"
    },
    {
     "lab": "« Vous êtes sûr de votre information ? »",
     "r": "« J’ai le nom du garçon et la date d’un virement qui n’est jamais parti. » Il se cale contre le dossier. « Je ne vous demande pas d’y croire. Je vous demande de ne pas être surpris. »",
     "d": 2,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "concurrence_ce_qui_revient",
   "si": "froid",
   "texte": "« On m’a rapporté une phrase de vous. Dite dans un couloir, cet hiver : que chez nous, on passe après les copains. » Il ne hausse pas le ton. « Je ne vous demande pas si c’est vrai. Je vous dis que ça m’est revenu. »",
   "choix": [
    {
     "lab": "« Je l’ai dit. Je le pensais ce soir-là. »",
     "r": "« Bon. » Il souffle par le nez, presque soulagé. « Alors on peut en parler. Ceux qui nient, je les écoute poliment et je n’en retiens rien. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Ce n’est pas ce que j’ai dit. »",
     "r": "« Ce n’est jamais ce qu’on a dit. » Il fait signe qu’on le resserve. « Vous savez ce qui est fatigant ? Pas la critique. Ce qu’on va faire maintenant, tous les deux : semblant. »",
     "d": -4,
     "ton": "prudent"
    },
    {
     "lab": "« Et qui vous l’a rapportée ? »",
     "r": "« Quelqu’un qui voulait votre place sur la carte du printemps. » Il ne donne pas le nom. « Voilà. Vous aurez appris ce soir qu’on vous répète, et qu’on vous vise. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« C’est plutôt à vous de vous expliquer. »",
     "r": "« Peut-être. » Il regarde sa montre sans se cacher. « Mais c’est moi qui fais la carte, et c’est vous qui dînez avec moi. Ce n’est pas de la morale, c’est de l’arithmétique. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  }
 ],
 "coulisses": [
  {
   "cle": "coulisses_ce_qui_ne_se_dit_pas",
   "si": "premier",
   "texte": "Il commande sans regarder la carte, puis il vous regarde, vous. « Avant qu'on commence : il y a des sujets sur lesquels je ne vous dirai pas la vérité ce soir. Ce n'est pas contre vous, c'est le métier. »",
   "choix": [
    {
     "lab": "« Lesquels ? »",
     "r": "« L'argent des autres, la santé de leurs gars, et ce qui se dit en réunion. » Il déplie sa serviette. « Le reste, demandez. Je réponds mieux qu'on ne le croit. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Vous prévenez tout le monde comme ça ? »",
     "r": "« Ceux qui vont poser les questions quand même. » Il repousse la corbeille vers vous. « Les autres passent la soirée à me parler de leur salle. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Moi, je n'ai rien à cacher. »",
     "r": "« Bien sûr que si. » Il le dit sans agressivité, comme une évidence. « Vous ne savez pas encore quoi, c'est tout. »",
     "d": -2,
     "ton": "arrogant"
    },
    {
     "lab": "« Alors parlons d'autre chose. Vous êtes arrivé là comment ? »",
     "r": "« Par la billetterie. Je collais des affiches dans des bars. » Il a l'air surpris qu'on demande. « Personne ne choisit ce métier. On y reste parce qu'on ne sait plus en faire un autre. »",
     "d": 3,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "coulisses_pesee_ratee",
   "si": "toujours",
   "texte": "Il repousse son assiette à moitié pleine. « Ce qui me réveille la nuit, ce ne sont pas les blessés. Ce sont les pesées. Un homme qui rate le poids le vendredi matin, et j'ai une carte à refaire avant midi. »",
   "choix": [
    {
     "lab": "« Ça arrive si souvent que ça ? »",
     "r": "« Plus qu'on ne le raconte. La plupart passent de justesse, et de justesse, ça ne fait pas d'article. » Il repose sa fourchette. « Ce qui me coûte, c'est la suite : il monte vidé, il perd mal, et j'ai brûlé un nom que je gardais. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Et lui, il perd quoi ? »",
     "r": "« Une part de sa bourse, qui va à l'autre, et la commission prend la sienne au passage. Il se bat donc à perte, le corps en morceaux, contre un homme qui a mangé. » Il vous regarde. « Les gens croient que c'est une amende. C'est une punition. »",
     "d": 3,
     "ton": "attentif"
    },
    {
     "lab": "« Chez moi, personne ne rate le poids. »",
     "r": "« Personne ne rate le poids tant que personne n'a de raison de tricher. Attendez d'avoir un homme à qui la catégorie en dessous ouvre un titre. » Il reprend du pain. « On me sort cette phrase chaque année. Je ne l'ai jamais vue tenir. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« C'est vous qui décidez de maintenir le combat ? »",
     "r": "« Moi, l'autre camp, la commission, la télé. Tout le monde a un avis, personne n'a le temps, et la case est déjà vendue. Alors on maintient, presque toujours. » Il hausse les épaules. « Et ensuite on demande à des gens assis au bord du tapis de dire qui a gagné. Ne me lancez pas là-dessus. »",
     "d": 1,
     "ton": "pragmatique",
     "ouvre": "coulisses_juges"
    }
   ]
  },
  {
   "cle": "coulisses_juges",
   "si": "toujours",
   "texte": "« Les décisions. Tout le monde m'engueule pour les décisions. » Il pose sa fourchette. « Je ne choisis pas les juges. Personne chez nous ne choisit les juges. C'est la commission, et elle prend ce qu'elle trouve. »",
   "choix": [
    {
     "lab": "« Et elle trouve quoi ? »",
     "r": "« Des gens qui font ça le week-end. Certains sont excellents, je le dis sérieusement. D'autres regardent un combat comme de la boxe et comptent les coups au visage. » Il hausse une épaule. « Vous perdez une reprise au sol parce que l'homme au bord du tapis n'a jamais lutté de sa vie. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« Vous pourriez peser sur eux. »",
     "r": "« Je pourrais aussi perdre ma licence, et l'organisation avec. » Il vous regarde un peu plus longtemps qu'il ne faudrait. « Et vous venez de dire ça à voix haute, à une table, devant quelqu'un que vous connaissez à peine. »",
     "d": -4,
     "ton": "imprudent"
    },
    {
     "lab": "« On m'a volé un combat, moi aussi. »",
     "r": "« Tout le monde s'est fait voler un combat. » Puis, plus bas : « Ça arrive vraiment, oui. On ne répare rien : on remet votre gars vite, dans une bonne case, avec un adversaire qui lui va. C'est tout ce qu'on sait faire comme excuse. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Vous faites quoi, vous, quand c'est injuste ? »",
     "r": "« La même chose que vous. Je regarde le combat une nouvelle fois, tard, tout seul, et je m'énerve devant mon écran. » Il finit son verre. « Et le lundi je refais une carte avec le résultat qu'on m'a donné, pas avec celui que j'ai vu. »",
     "d": 3,
     "ton": "complice"
    }
   ]
  },
  {
   "cle": "coulisses_blessure_elude",
   "si": "tiede",
   "texte": "Vous posez la question sans l'avoir vraiment décidé : est-ce que des hommes montent blessés ? Il continue de couper sa viande sans lever les yeux. « Un homme qui a signé est déclaré apte. C'est la commission qui le dit, pas moi. »",
   "choix": [
    {
     "lab": "« Ce n'est pas une réponse. »",
     "r": "« Non. » Il finit sa bouchée sans se presser. « C'est celle que je donne aux gens que je connais depuis un dîner. Reposez-la-moi dans quelques années, elle sera peut-être plus longue. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Vous avez raison, ça ne me regarde pas. »",
     "r": "« Ça vous regarde entièrement, c'est votre homme qui monte. » Il hausse une épaule. « Disons que ce n'est pas une conversation de plat principal. »",
     "d": 1,
     "ton": "prudent"
    },
    {
     "lab": "« Alors dites-moi au moins comment je le vois, moi. »",
     "r": "« Ça, je peux. » Il repose son couteau. « Ne regardez pas son visage, il est entraîné à mentir avec. Regardez ses appuis en fin de séance, et regardez qui il évite au sparring. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "coulisses_pesee_ratee"
    },
    {
     "lab": "« De toute façon, tout le monde sait que ça arrive. »",
     "r": "« Alors vous n'avez pas besoin de moi. » Il fait signe qu'on lui rapporte du pain, et le sujet est rangé.",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "coulisses_le_non",
   "si": "froid",
   "texte": "Vous lancez le sujet qui gratte : les gars qu'on protège, les combats décidés bien avant l'annonce. Il vous laisse aller jusqu'au bout de votre phrase. « Vous voulez que je vous raconte des histoires. » Il sourit sans chaleur. « On a mangé ensemble une fois. »",
   "choix": [
    {
     "lab": "« Vous avez raison. Une autre fois. »",
     "r": "« Voilà. » Il change de sujet lui-même : le restaurant, le service, une salle qu'il a visitée en venant. La soirée redevient respirable, et il a noté que vous saviez reculer.",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« J'insiste. Ça m'intéresse vraiment. »",
     "r": "« Je sais que ça vous intéresse. Ce qui m'intéresse, moi, c'est à qui vous le répéterez lundi. » Il boit une gorgée. Le sujet est mort, et rien ne le fera revenir ce soir.",
     "d": -4,
     "ton": "pressé"
    },
    {
     "lab": "« Je ne cherche pas une histoire. Je cherche à comprendre mon métier. »",
     "r": "« C'est mieux dit. » Il concède un demi-hochement de tête. « Bon. Une chose, et on passe à autre chose : personne ne choisit vraiment ses adversaires. On accepte ce qui reste quand les autres ont dit non. » Il désigne votre assiette. « Mangez. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Vous êtes toujours aussi méfiant ? »",
     "r": "« Avec les gens dont je ne sais pas encore ce qu'ils font de ce que je dis, oui. » Il n'a pas l'air vexé. C'est pire : il a l'air d'avoir eu raison.",
     "d": -2,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "coulisses_bourses",
   "si": "petiteSalle",
   "texte": "« Ce qui ne se dit jamais devant un micro, c'est ce qu'il reste à un gars de prélim à la fin du mois. » Il repousse son verre. « Le montant annoncé, c'est avant le manager, le camp, les billets d'avion, les impôts de l'État où il s'est battu, et le médecin. »",
   "choix": [
    {
     "lab": "« Il reste quoi ? »",
     "r": "« De quoi tenir jusqu'au combat suivant, s'il gagne. S'il perd, il retourne travailler le lundi. » Il n'y met aucun effet. « C'est pour ça qu'ils acceptent des combats qu'ils devraient refuser. Pas par courage. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Et ça ne vous gêne pas ? »",
     "r": "« Si. Mais je fais les affiches, je ne fais pas les bourses. » Il repose sa fourchette. « Vous voulez que j'aie honte ; ça ne changera rien à ce que touche votre gars. »",
     "d": -1,
     "ton": "sec"
    },
    {
     "lab": "« Donc je dois lui trouver de l'argent ailleurs. »",
     "r": "« Voilà. Sponsors du coin, cours du soir, un travail à côté sans en avoir honte. » Il approuve du menton. « Les salles qui durent sont celles qui savent nourrir leurs gars entre deux cartes. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Payez-les mieux, tout simplement. »",
     "r": "« Dites-le à la télé, c'est elle qui tient le robinet. » Il n'est même pas agacé, il entend ça depuis toujours. « Moi, j'ai une enveloppe pour la carte entière : si je paie mieux le vôtre, je paie moins bien quelqu'un d'autre. Et celui-là aussi dîne avec moi. »",
     "d": -2,
     "ton": "exigeant"
    }
   ]
  },
  {
   "cle": "coulisses_pesee_la_vraie",
   "si": "chaud",
   "texte": "Il fait tourner son verre un long moment sans le boire. « Tu veux une vraie histoire de pesée ? » Ce n'est pas tout à fait une question. « Un gamin, il y a quelques années. Il avait déjà tout lâché la veille. On l'a trouvé dans la salle de bain de l'hôtel, roulé dans un peignoir, à ne plus répondre quand on lui parlait. »",
   "choix": [
    {
     "lab": "« Il s'en est sorti ? »",
     "r": "« Oui. Une nuit sous perfusion, et le lendemain il ne savait plus quel jour on était. Il a recombattu, il s'est même bien débrouillé. » Il repose son verre. « Ce n'est pas lui qui me reste. C'est que dans le couloir, j'ai pensé à ma carte avant de penser au gamin. Un instant. Mais dans cet ordre-là. »",
     "d": 4,
     "ton": "humble",
     "ouvre": "coulisses_le_coup_de_fil"
    },
    {
     "lab": "« Qui l'avait envoyé là-dedans ? »",
     "r": "« Son coach. Et ce n'était pas un salaud, c'est ça le problème : un type bien, qui faisait comme on lui avait appris. » Un silence. « Fais attention à ce que tes gars croient de toi. C'est avec ça qu'ils se mettent en danger. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« On a tous entendu des histoires comme ça. »",
     "r": "« Tu as raison. » Il se redresse, et la chaleur s'en va d'un coup, proprement. « Je ne sais pas pourquoi je te raconte ça. » Il reprend ses couverts. Vous venez de refermer une porte qui était grande ouverte.",
     "d": -3,
     "ton": "sec"
    },
    {
     "lab": "« Vous avez changé quelque chose, après ? »",
     "r": "« On a avancé les pesées au matin, mis un médecin dans le couloir, interdit certaines méthodes. Ça a sauvé des gens, honnêtement. » Il hausse une épaule. « Mais le fond ne bouge pas : un homme préférera se détruire plutôt que rater sa chance. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "coulisses_blessure_vraie",
   "si": "chaud",
   "texte": "« Tout le monde monte blessé. » Il le dit comme on dit qu'il pleut. « Un homme en pleine santé le soir du combat, j'en ai vu très peu. Donc la question n'est jamais est-ce qu'il a mal. La question, c'est où. »",
   "choix": [
    {
     "lab": "« C'est-à-dire ? »",
     "r": "« Une main, une côte, un genou qui gonfle : ça se gère, ça fait juste un combat plus laid. La tête, non. Là, il n'y a pas de discussion. » Il vous regarde. « Et c'est toujours celle-là qu'on te cache, parce qu'elle ne se voit sur aucune radio. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Et vous laissez faire. »",
     "r": "« Je laisse passer une main cassée, oui. Si j'annulais chaque combat où un homme a mal quelque part, je ne ferais presque plus de cartes et personne ne serait payé, à commencer par eux. » Il n'est pas en colère : il a déjà eu cette conversation trop souvent.",
     "d": -2,
     "ton": "sec"
    },
    {
     "lab": "« Ce sont les coachs qui devraient parler. »",
     "r": "« Les coachs sont les derniers à parler. Ils ont un loyer, eux aussi. » Il laisse ça flotter une seconde. « Le jour où tu retiendras un gars qui veut monter, ça te coûtera de l'argent, il t'en voudra, et tu seras le seul à savoir que tu as raison. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Chez moi, on annule, et ça m'a déjà coûté. »",
     "r": "« Alors tu savais déjà tout ce que je viens de dire. » Il lève son verre à moitié. « Ne le crie pas trop fort : ceux qui annulent souvent, on finit par les appeler moins. Je te dis les choses comme elles sont, pas comme elles devraient être. »",
     "d": 3,
     "ton": "complice",
     "ouvre": "coulisses_fin_contrat"
    }
   ]
  },
  {
   "cle": "coulisses_fin_contrat",
   "si": "chaud",
   "texte": "« La dernière ligne d'un contrat, c'est le moment le plus honnête du métier. » Il pousse une miette du plat de la main. « Un gars à qui il reste un combat, tu ne le mets pas n'importe où. Selon ce que tu veux de lui, tu ne le mets pas du tout au même endroit. »",
   "choix": [
    {
     "lab": "« Vous voulez dire quoi, exactement ? »",
     "r": "« Si je veux le garder et qu'il ne me coûte pas cher, je lui donne quelqu'un de compliqué : il perd, il resigne plus bas. Si je veux le garder et le vendre, je lui donne quelqu'un qu'il va finir, et je le paie mieux. Le même homme, pas la même carrière. » Il n'a pas l'air fier. Il a l'air précis.",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« C'est dégueulasse. »",
     "r": "« Oui. » Il ne se défend pas une seconde. « Et si je ne le fais pas, quelqu'un le fera à ma place le mois suivant, avec moins de scrupules. Le seul truc que je peux te donner, c'est de te le dire avant, pas après. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Donc je dois négocier avant la dernière ligne. »",
     "r": "« Voilà. Tu viens de comprendre plus vite que la plupart des managers avec qui je travaille. » Il désigne la salle du menton. « Ça se négocie au combat d'avant, le soir où ton gars vient de gagner et où je suis content de lui. Après, tu n'as plus rien dans les mains. »",
     "d": 4,
     "ton": "complice"
    },
    {
     "lab": "« Prévenez-moi quand ce sera le tour du mien. »",
     "r": "« Non. » C'est net, et sans la moindre méchanceté. « Je t'explique comment marche la machine. Je ne vais pas te dire comment je compte m'en servir. On dîne ensemble, on ne travaille pas ensemble. »",
     "d": -3,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "coulisses_le_coup_de_fil",
   "si": "chaud",
   "texte": "« Il y a une chose que personne ne te dit avant d'entrer dans ce métier. » Il parle plus bas, sans mise en scène. « Quand ça tourne vraiment mal dans la cage, quelqu'un appelle la famille. Souvent, c'est moi : c'est moi qui ai les numéros. »",
   "choix": [
    {
     "lab": "Ne rien dire, et attendre.",
     "r": "Il laisse passer un long moment. Le bruit du restaurant remplit le vide. « Une mère m'a demandé si son fils avait gagné. Je n'avais pas la réponse en tête, j'ai dû regarder. » Il boit une gorgée. « Depuis, je connais tous les résultats par cœur. C'est idiot, mais je les connais. »",
     "d": 5,
     "ton": "complice"
    },
    {
     "lab": "« Ça doit être insoutenable. »",
     "r": "« C'est surtout très administratif, et c'est ça le pire. On te donne un numéro, tu composes, tu dis les mots dans le bon ordre, tu réponds à des questions d'hôpital et de papiers. » Il repose sa serviette. « Et le lendemain tu fais une carte, parce que la suivante existe déjà. »",
     "d": 2,
     "ton": "humble"
    },
    {
     "lab": "« Vous devriez déléguer ça. »",
     "r": "« Déléguer. » Il répète le mot comme s'il l'examinait. « Oui, ça se fait. Il y a même des gens dont c'est le poste. » Il vous ressert du vin, très poliment, et ne revient plus sur ce terrain de la soirée.",
     "d": -4,
     "ton": "sec"
    },
    {
     "lab": "« Vous avez déjà arrêté un combat à cause de ça ? »",
     "r": "« Ça m'est arrivé. Et à chaque fois, l'homme que je protégeais m'a détesté. » Un demi-sourire sans joie. « Il y en a un qui ne m'adresse toujours pas la parole. De son point de vue il a raison : il aurait sans doute gagné. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "coulisses_on_protege",
   "si": "aClasse",
   "texte": "Le serveur débarrasse. Quand il s'éloigne, le matchmaker parle de votre homme classé sans le nommer. « Vous savez qu'on le protège, celui-là ? » Il laisse le mot atterrir. « Pas par gentillesse. Parce qu'il vaut plus cher intact que battu. »",
   "choix": [
    {
     "lab": "« Protégé comment ? »",
     "r": "« Avec des styles qui lui vont. Un lutteur qui ne finit personne, un frappeur qui recule. Rien d'illégal : des noms choisis, c'est tout. » Il repose sa cuillère. « Le jour où on arrêtera, ce sera qu'on a décidé de le vendre à quelqu'un d'autre. Ne comptez pas sur un préavis. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Il n'a besoin de personne. »",
     "r": "« Bien sûr. » Il n'insiste pas, ce qui est la pire des réponses. « Alors je lui trouverai quelqu'un de sérieux la prochaine fois. Il sera content, et vous aussi. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "« Alors arrêtez. Donnez-lui du dur. »",
     "r": "« Vous êtes sûr ? » Il vous regarde vraiment, pour la première fois du repas. « Parce que je peux, j'ai une liste. Et si ça se passe mal, ce n'est pas moi qui devrai lui expliquer pourquoi il redescend au classement à son âge. » Il retient quand même la demande : les coachs qui réclament du dur, il les rappelle.",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Et vous protégez qui d'autre, en ce moment ? »",
     "r": "« Le vôtre. » Fin de la phrase. Il vous tend la corbeille de pain. « Vous croyez sincèrement que je vais vous donner la liste ? »",
     "d": -2,
     "ton": "indiscret"
    }
   ]
  },
  {
   "cle": "coulisses_jeunes",
   "si": "debutant",
   "texte": "« Vous n'avez encore personne dans le classement. Ça veut dire que je peux vous dire ce que je ne dis plus aux autres. » Il écarte son verre. « Le plus sale, dans ce métier, ce ne sont pas les vétérans. Ce sont les gamins qu'on signe trop tôt. »",
   "choix": [
    {
     "lab": "« Trop tôt pourquoi ? »",
     "r": "« Parce qu'on signe un potentiel et qu'on le met tout de suite devant une caméra, avec des professionnels en face et des gens qui parlent de lui sur internet. Il perd, il reperd, et il n'a plus rien : ni contrat, ni métier de côté. » Il hausse les épaules. « Nous, on avait une prélim à remplir. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« C'est vous qui les signez. »",
     "r": "« C'est moi. » Il le prend sans broncher. « Et si je ne le fais pas, la maison d'en face le prend, et on me demandera pourquoi je suis passé à côté du meilleur de sa génération. » Il vous regarde. « Vous voulez que je me flagelle, ou vous voulez quelque chose d'utile ? »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Alors gardez les miens le plus longtemps possible. »",
     "r": "« Voilà la bonne demande, et c'est la première fois qu'on me la fait à cette table. » Il a l'air presque soulagé. « Faites-les mûrir chez vous. Envoyez-les-moi avec un métier derrière, des combats dans les jambes et une tête solide : vous gagnerez moins vite, vous gagnerez plus longtemps. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« J'en ai un qui serait prêt tout de suite. »",
     "r": "« Vous n'avez pas écouté un seul mot. » Il sourit quand même, un peu tristement. « Ils sont toujours prêts, c'est leur métier d'être prêts. Ce sont leurs coachs qui doivent ne pas l'être. »",
     "d": -3,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "coulisses_doit_arreter",
   "si": "aChampion",
   "texte": "Il repose ses couverts en croix. « Vous avez un champion. Alors je vais vous dire la seule chose qu'on ne dit jamais aux champions. » Une pause. « Personne ne saura lui dire quand il faut arrêter. Ni lui, ni moi, ni la ceinture. »",
   "choix": [
    {
     "lab": "« Vous avez vu ça de près ? »",
     "r": "« Trop souvent. Un homme perd d'abord des choses que le public ne voit pas : il gagne toujours, mais il met plus de temps à se relever au gymnase et il choisit mieux ses partenaires. » Il vous regarde. « Demandez à vos gars, pas à lui. Lui, il vous mentira sans même le vouloir. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Le mien sait s'écouter. »",
     "r": "« Ils savent tous s'écouter, jusqu'au jour où il faut choisir entre s'écouter et rester quelqu'un. » Il n'ajoute rien. Il vous a rangé quelque part, et pas au bon endroit.",
     "d": -2,
     "ton": "arrogant"
    },
    {
     "lab": "« Vous feriez quoi, à ma place ? »",
     "r": "« Je lui construirais une sortie avant qu'il en ait besoin. Un rôle, un salaire, son nom sur une porte de votre salle. » Il appuie un peu. « Un homme accepte d'arrêter quand il a un endroit où aller. Sinon il revient, toujours, contre plus jeune que lui. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "« Tant qu'il gagne, il continue. »",
     "r": "« C'est la phrase que j'entends le plus souvent dans ce métier. » Il vous ressert de l'eau. « Elle est vraie jusqu'à la fois où elle ne l'est plus, et ce jour-là on ne s'en aperçoit qu'en revoyant le combat. » Le sujet est clos, et c'est lui qui l'a fermé.",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "coulisses_carte_cassee",
   "si": "habitue",
   "texte": "« Vous vous souvenez du main event annoncé l'hiver dernier, celui qui est tombé quelques semaines avant ? » Il attend que vous hochiez la tête. « Blessure, on a dit. Ce n'était pas une blessure. » Et il s'arrête là, exprès.",
   "choix": [
    {
     "lab": "« C'était quoi, alors ? »",
     "r": "« Quelque chose qui appartient à un homme et à sa famille, et qu'on a maquillé en genou pour lui éviter d'être ce type-là jusqu'à la fin de sa carrière. » Il ne cille pas. « On annonce une blessure bien plus souvent qu'il n'y en a. Ce n'est pas de la comédie, c'est parfois la seule chose gentille qu'on ait les moyens de faire. »",
     "d": 1,
     "ton": "curieux"
    },
    {
     "lab": "« Ne me dites rien. Ça ne me regarde pas. »",
     "r": "« Bien. » Il a l'air content, presque. « C'est exactement pour ça que je vous en parle. Les gens devant qui je peux commencer une phrase sans la finir, il n'y en a pas tant que ça. »",
     "d": 3,
     "ton": "prudent"
    },
    {
     "lab": "« Donc vous mentez au public. »",
     "r": "« Je dis des choses vraies dans un ordre choisi. » Il ne détourne pas les yeux. « Et vous ferez pareil le jour où un de vos gars fera une bêtise sérieuse. Vous appellerez ça protéger la salle, et vous aurez raison. »",
     "d": -1,
     "ton": "sec"
    },
    {
     "lab": "« Ça vous arrive d'avoir envie de tout raconter ? »",
     "r": "« Tous les mois. » Il sourit franchement, ce qui ne lui arrive pas souvent. « Et puis je pense à des gens qui n'ont rien demandé, et je me tais. Ce qui me manque le plus, c'est de ne pas pouvoir raconter les belles histoires non plus. »",
     "d": 2,
     "ton": "complice"
    }
   ]
  }
 ],
 "personnel": [
  {
   "cle": "personnel_appel_qui_coupe_le_repas",
   "si": "toujours",
   "texte": "Son téléphone vibre depuis le début du repas. Il finit par le prendre, s’excuse, sort. Il revient, s’assoit, ne touche plus à son assiette. « Je viens de sortir un gars de la carte. Il coupait déjà pour faire le poids. »",
   "choix": [
    {
     "lab": "Ne rien dire, attendre qu’il continue.",
     "r": "Il laisse passer un long moment. « Il m’a remercié. C’est ça, le pire. Ils remercient toujours. »",
     "d": 4,
     "ton": "attentif",
     "ouvre": "personnel_annoncer"
    },
    {
     "lab": "« Vous auriez pu attendre demain. »",
     "r": "« Non. Il aurait acheté son billet ce soir. » Il dit ça sans agressivité, comme une objection qu’on lui a déjà faite.",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Si vous cherchez un remplaçant, j’ai quelqu’un de prêt. »",
     "r": "Un temps. « Vous êtes rapide. » Il retourne son téléphone face contre la nappe. « On en parlera au café. Ou pas. »",
     "d": -4,
     "ton": "opportuniste"
    },
    {
     "lab": "« Ça fait partie du métier. »",
     "r": "« Oui. » Il vous regarde comme si vous veniez de résumer sa vie en une phrase, et pas à son avantage.",
     "d": -2,
     "ton": "détaché"
    }
   ]
  },
  {
   "cle": "personnel_annoncer",
   "si": "toujours",
   "texte": "« Je ne fais jamais ça par message. J’appelle, et je le dis dans la première phrase. » Il repousse son assiette. « Si vous prenez des nouvelles de la famille avant, l’autre a compris avant que vous arriviez au sujet, et il vous déteste pour le détour. »",
   "choix": [
    {
     "lab": "« Qui vous a appris ça ? »",
     "r": "« Personne. Un gars m’a raccroché au nez, une fois. J’avais commencé par lui parler de son chien. » Il hausse une épaule. « On apprend mal, mais on apprend. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Vous pourriez le faire faire par quelqu’un d’autre. »",
     "r": "« J’ai essayé. Mon assistant s’y est collé une soirée, il n’a rien pu avaler après. » Il secoue la tête. « Si c’est ma décision, c’est ma voix. »",
     "d": 2,
     "ton": "pragmatique"
    },
    {
     "lab": "« Avec le temps, ça doit rentrer. »",
     "r": "« On me dit ça aussi. » Il sourit à moitié. « Ce qui rentre, c’est la formule. Pas le silence après. »",
     "d": 1,
     "ton": "poli"
    },
    {
     "lab": "« Alors dites-moi tout de suite si mon gars n’est pas sur la carte. »",
     "r": "« Il ne l’est pas. » Il vous laisse encaisser, puis reprend sa fourchette. « Vous vouliez la première phrase. »",
     "d": 0,
     "ton": "direct"
    }
   ]
  },
  {
   "cle": "personnel_ne_pas_insister",
   "si": "froid",
   "texte": "Il vous a laissé parler de votre saison sans rien dire. Vous lui demandez comment il tient, lui. Il repose ses couverts. « On ne se connaît pas assez pour cette question-là. »",
   "choix": [
    {
     "lab": "« Vous avez raison. Excusez-moi. »",
     "r": "Il accepte d’un signe de tête et ressert du vin. Plus tard, sans qu’on lui demande rien, il lâche qu’il n’a pas dormi chez lui depuis dimanche.",
     "d": 3,
     "ton": "humble"
    },
    {
     "lab": "« J’essaie juste de faire la conversation. »",
     "r": "« Faites-la sur le sport. C’est déjà beaucoup. » Le ton n’est pas méchant, mais la porte est fermée pour la soirée.",
     "d": 0,
     "ton": "maladroit"
    },
    {
     "lab": "« Tout le monde dit ça, et tout le monde finit par parler. »",
     "r": "« Pas ce soir. » Il cherche le serveur des yeux, et le silence qui suit, c’est vous qui l’avez fabriqué.",
     "d": -4,
     "ton": "insistant"
    },
    {
     "lab": "« Comme vous voulez. On parle de la carte du printemps ? »",
     "r": "« Voilà. » Il retrouve son terrain, et son visage avec. La soirée sera utile ; elle ne sera pas chaleureuse.",
     "d": 1,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "personnel_comment_il_est_entre",
   "si": "premier",
   "texte": "« Vous voulez savoir d’où je viens ? J’ai commencé en portant des seaux et en conduisant des combattants à la pesée. » Il coupe sa viande. « J’ai fait quelques combats amateurs. Je les ai tous perdus. »",
   "choix": [
    {
     "lab": "« Racontez le dernier. »",
     "r": "« Un droitier de Béziers m’a mis au sol avant que je comprenne, puis il est venu s’excuser dans le vestiaire. » Il rit vraiment, pour la première fois de la soirée. « C’est là que j’ai compris que je serais plus utile de l’autre côté. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Ça se sent, que vous avez été dedans. »",
     "r": "« Un peu de pommade avant le dessert. » Il n’a pas l’air fâché. « Ce que ça m’a laissé, surtout, c’est de savoir ce que ça fait d’attendre un appel. »",
     "d": 1,
     "ton": "flatteur"
    },
    {
     "lab": "« Vous n’avez jamais gagné un combat, et vous décidez pour les autres. »",
     "r": "« Comme la plupart des gens qui décident de quelque chose. » Le sourire reste, la chaleur est partie.",
     "d": -5,
     "ton": "arrogant"
    },
    {
     "lab": "« Qu’est-ce que perdre vous a appris que gagner n’apprend pas ? »",
     "r": "Il pose sa fourchette. « Que le gars en face, à la pesée, a exactement la même peur que vous. Ça sert, quand on fabrique des affiches. »",
     "d": 5,
     "ton": "réfléchi"
    }
   ]
  },
  {
   "cle": "personnel_le_sommeil",
   "si": "toujours",
   "texte": "« La nuit avant un événement, je ne dors pas. » Il dit ça comme on donne une adresse. « Je refais la carte dans ma tête, dans l’ordre, avec les blessures possibles. Au petit matin je m’endors un peu, et je rêve d’une pesée ratée. »",
   "choix": [
    {
     "lab": "« Vous rêvez de quoi, exactement ? »",
     "r": "« D’un gars sur la balance qui me regarde. Il ne dit rien, il attend que je décide. » Il boit une gorgée. « Dans le rêve, je ne décide jamais. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Il faudrait voir quelqu’un pour ça. »",
     "r": "« J’ai vu quelqu’un. Il m’a dit de changer de métier. » Il hausse les épaules. « Bon conseil. Mauvais patient. »",
     "d": 0,
     "ton": "conseilleur"
    },
    {
     "lab": "« Moi, c’est la veille des pesées. Je repèse mon gars, et je ne me recouche pas. »",
     "r": "Il vous regarde autrement. « Alors on a le même réveil. » Il n’ajoute rien, mais il ressert vos verres.",
     "d": 3,
     "ton": "complice"
    },
    {
     "lab": "« Tant que ça ne se voit pas sur vos cartes. »",
     "r": "« Merci de vous inquiéter pour mes cartes. » Il rit sans joie et regarde arriver le dessert.",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "personnel_les_enfants",
   "si": "habitue",
   "texte": "Il tourne son téléphone vers vous, sans commentaire : une gamine avec un bonnet de bain. « Championnat régional. J’étais à Rotterdam, pour une pesée. » Il reprend l’appareil. « Elle m’a envoyé la vidéo. Je l’ai regardée dans le taxi. »",
   "choix": [
    {
     "lab": "« Elle a fini où ? »",
     "r": "« Sur le podium. » La fierté est là, il n’essaie pas de la cacher. « Elle m’a expliqué que son départ était raté. Elle analyse déjà. Elle ne tient pas ça de moi. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Vous serez là, la prochaine fois ? »",
     "r": "« Il y a une carte ce week-end-là. Je vais demander à quelqu’un de me remplacer à la pesée. » Il n’a pas l’air d’y croire lui-même.",
     "d": 3,
     "ton": "attentionné"
    },
    {
     "lab": "« C’est le prix du métier. On le paie tous. »",
     "r": "« Vous le payez, vous ? » Il n’attend pas la réponse. Il glisse le téléphone dans sa veste et ne le ressort plus.",
     "d": -3,
     "ton": "sentencieux"
    },
    {
     "lab": "« Montrez-moi la vidéo. »",
     "r": "Il hésite, puis la lance sans le son, le téléphone penché vers vous. Une gamine en brasse dans un bassin municipal. Il ne dit rien jusqu’à la fin de la course.",
     "d": 5,
     "ton": "chaleureux"
    }
   ]
  },
  {
   "cle": "personnel_la_femme_qui_ne_demande_plus",
   "si": "chaud",
   "texte": "« Ma femme ne me demande plus comment s’est passée ma journée. » Il le dit sans amertume. « Ce n’est pas de la rancune. C’est que la réponse est toujours la même : j’ai déçu quelqu’un. »",
   "choix": [
    {
     "lab": "Remplir son verre et ne rien demander.",
     "r": "Il vous laisse faire, les mains à plat sur la nappe. « Vous êtes le premier à ne pas essayer de réparer ça en une phrase. »",
     "d": 5,
     "ton": "attentif"
    },
    {
     "lab": "« Et les bonnes journées, vous les lui racontez ? »",
     "r": "Il réfléchit vraiment. « Je ne sais pas s’il y en a. » Puis, plus bas : « Si. Quand un gars que j’ai signé pour rien passe en main event. Ça, je le raconte. »",
     "d": 4,
     "ton": "doux"
    },
    {
     "lab": "« Il faut poser des limites. Éteignez le téléphone le dimanche. »",
     "r": "« Le dimanche, c’est le lendemain des événements. » Il vous laisse le temps de comprendre. « C’est le jour où il ne sonne jamais pour une bonne nouvelle. »",
     "d": -1,
     "ton": "conseilleur"
    },
    {
     "lab": "« Au moins elle ne vous quitte pas pour un combattant. »",
     "r": "Il ne rit pas. « Non, en effet. » Le sujet est mort, et c’est vous qui l’avez tué.",
     "d": -6,
     "ton": "lourdaud"
    }
   ]
  },
  {
   "cle": "personnel_le_gamin_mal_marie",
   "si": "chaud",
   "texte": "« J’ai fait un combat de trop à un gamin de Saint-Étienne. » Il s’essuie la bouche et repose sa serviette. « Il gagnait vite, la télé le voulait, je lui ai donné un vétéran russe. Il ne s’est pas relevé pareil. Il tient une boutique de téléphones, maintenant. »",
   "choix": [
    {
     "lab": "« Vous êtes allé le voir ? »",
     "r": "« Une fois. Il a été gentil avec moi. » Un temps. « C’était pire. »",
     "d": 5,
     "ton": "sobre",
     "ouvre": "personnel_le_carnet_des_coupes"
    },
    {
     "lab": "« Ce n’est pas votre faute. Il a signé. »",
     "r": "« Bien sûr qu’il a signé. Ils signent tous. » Il vous regarde. « Vous croyez que je dors mieux avec cette phrase ? »",
     "d": -1,
     "ton": "rassurant"
    },
    {
     "lab": "« Alors ne faites jamais ça aux miens. »",
     "r": "« C’est ce que je devrais entendre plus souvent. » Il hoche la tête lentement. « Mais dites-le-moi le jour où je vous proposerai un nom. Pas ce soir. »",
     "d": 2,
     "ton": "protecteur"
    },
    {
     "lab": "« Le vétéran russe, il touchait combien ? »",
     "r": "Il vous regarde un long moment. « Vous avez retenu la seule chose sans importance. »",
     "d": -6,
     "ton": "cupide"
    }
   ]
  },
  {
   "cle": "personnel_le_carnet_des_coupes",
   "si": "habitue",
   "texte": "« J’ai un carnet avec les noms des gars que j’ai coupés. » Il n’a pas l’air gêné de le dire. « Je regarde de temps en temps ce qu’ils deviennent. L’un est entraîneur en Bretagne, un autre travaille dans un entrepôt. Un autre a arrêté de répondre. »",
   "choix": [
    {
     "lab": "« Vous les avez tous retrouvés ? »",
     "r": "« Presque tous. » Il ne développe pas tout de suite. « C’est le presque qui m’occupe. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« À quoi ça vous sert ? »",
     "r": "« À rien. C’est bien ça, le problème. » Il tapote la table du doigt. « Si ça servait, ce serait un outil. Là, c’est une liste. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« C’est un peu morbide, non ? »",
     "r": "« Peut-être. » Il ne se défend pas. « L’autre solution, c’est de couper des gens et de ne plus jamais y penser. J’ai des collègues qui font ça très bien. »",
     "d": 1,
     "ton": "cru"
    },
    {
     "lab": "« J’espère qu’aucun des miens n’y sera. »",
     "r": "« Un jour il y en aura un. » Il le dit doucement, sans cruauté. « Ce jour-là, vous m’appellerez pour m’insulter, et vous aurez raison. »",
     "d": 2,
     "ton": "inquiet"
    }
   ]
  },
  {
   "cle": "personnel_couloir_hopital",
   "si": "habitue",
   "texte": "« Après les événements, je passe à l’hôpital. » Il baisse la voix, comme pour une habitude honteuse. « Pas dans la chambre. Le couloir suffit. Je veux juste voir le médecin sortir et faire non de la tête. »",
   "choix": [
    {
     "lab": "« Vous avez déjà attendu longtemps ? »",
     "r": "« Une nuit entière, à Nantes. » Il fixe la nappe. « Le gars s’est réveillé au matin et il a demandé s’il avait gagné. »",
     "d": 4,
     "ton": "attentif"
    },
    {
     "lab": "Poser une main sur son bras, sans rien dire.",
     "r": "Il ne bouge pas, ne commente pas. Il parle d’autre chose peu après, mais il vous ressert avant de se servir.",
     "d": 4,
     "ton": "humain"
    },
    {
     "lab": "« De toute façon, mes gars sont bien assurés. »",
     "r": "« Ce n’était pas la question. » Il vide son verre. « Ce n’est jamais la question, et c’est toujours la réponse qu’on me fait. »",
     "d": -4,
     "ton": "gestionnaire"
    },
    {
     "lab": "« Vous n’êtes pas obligé d’y aller. »",
     "r": "« Non. » Un temps. « C’est bien pour ça que j’y vais. »",
     "d": 2,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "personnel_l_argent_prete",
   "si": "tiede",
   "texte": "« Un gars m’a appelé mardi pour me demander de l’argent. Pas un contrat : de l’argent, pour un loyer. » Il regarde la salle un instant. « Je l’ai envoyé. Je sais très bien que je ne le reverrai pas. »",
   "choix": [
    {
     "lab": "« Ça vous arrive souvent ? »",
     "r": "« Assez. » Il sourit à peine. « Le plus bête, c’est que ceux qui remboursent n’osent plus décrocher ensuite. Ils croient que j’appelle pour ça. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Il ne faut pas mélanger. Vous vous mettez en position difficile. »",
     "r": "« Vous avez raison. » Il le concède sans discuter. « Et vous, quand un de vos gars ne peut pas payer sa licence ? » Vous ne répondez pas tout de suite, et il hoche la tête.",
     "d": 2,
     "ton": "professionnel"
    },
    {
     "lab": "« Ça m’est arrivé aussi. Je ne l’ai dit à personne. »",
     "r": "« On ne le dit jamais. » Il lève son verre à peine, sans trinquer. « Alors ça reste entre nous. »",
     "d": 4,
     "ton": "honnête"
    },
    {
     "lab": "« Ce gars-là, vous savez qu’il boit ? »",
     "r": "« Je sais. » Il vous regarde longuement. « Vous me le dites pour l’aider, ou pour qu’il saute d’une carte ? »",
     "d": -4,
     "ton": "calculateur"
    }
   ]
  },
  {
   "cle": "personnel_les_petites_salles",
   "si": "petiteSalle",
   "texte": "« Votre salle, je vois très bien où c’est. » Il pousse la corbeille de pain pour poser ses coudes. « J’ai commencé au-dessus d’un garage, avec un tapis qu’on rangeait le dimanche. Personne ne me rappelait, à l’époque. »",
   "choix": [
    {
     "lab": "« Qu’est-ce qui vous a sorti de là ? »",
     "r": "« Un gars de chez nous a fini par gagner, et un promoteur m’a rappelé. » Il n’en tire aucune gloire. « J’ai passé des années à appeler dans le vide. C’est pour ça que je réponds. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Alors vous savez ce que ça fait, de ne pas avoir de réponse. »",
     "r": "« Je sais. Et je ne réponds toujours pas à tout le monde. » Il n’essaie pas d’arranger ça. « La différence, c’est que je sais ce que ça coûte à l’autre bout. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« Ma salle est petite, mais mes gars valent les vôtres. »",
     "r": "« Peut-être. » Il ne bronche pas. « Ça ne se décide pas à table, et ça ne se plaide pas non plus. »",
     "d": -2,
     "ton": "revendicatif"
    },
    {
     "lab": "« Vous pourriez me mettre un gars en prélims, alors. »",
     "r": "Il repose son couteau. « Je vous parle d’un garage et vous entendez une ouverture. » Il n’est pas fâché. Il est déçu.",
     "d": -5,
     "ton": "quémandeur"
    }
   ]
  },
  {
   "cle": "personnel_le_champion_qui_perd",
   "si": "aChampion",
   "texte": "« Vous avez un champion. » Il dit ça comme un diagnostic, pas comme un compliment. « Ce qui m’occupe, moi, c’est la nuit où il perdra la ceinture. Je serai debout à réécrire une saison entière. Vous, vous serez avec lui. »",
   "choix": [
    {
     "lab": "« Vous y pensez déjà ? »",
     "r": "« C’est mon métier d’y penser avant vous. » Il n’y met aucune supériorité. « Le jour où ça arrive, tout le monde découvre. Moi, j’ai déjà les noms. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Il ne perdra pas. »",
     "r": "« Ils disent tous ça, et ils ont tous tort une fois. » Il hausse une épaule. « Ce n’est pas grave d’y croire. C’est grave de ne rien préparer. »",
     "d": -1,
     "ton": "confiant"
    },
    {
     "lab": "« Qu’est-ce que vous faites, cette nuit-là ? »",
     "r": "« J’appelle qui il faut et je laisse le reste dormir. » Un temps. « Et je regarde si le gars est en état d’entendre parler d’un combat, ou pas du tout. »",
     "d": 5,
     "ton": "attentif"
    },
    {
     "lab": "« Alors gardez-lui une revanche au chaud. »",
     "r": "« Je ne garde rien au chaud, et personne ne le fait. » Il le dit sans dureté. « Je peux vous dire à qui je pense. Ce n’est pas la même chose. »",
     "d": -2,
     "ton": "exigeant"
    }
   ]
  },
  {
   "cle": "personnel_partir",
   "si": "habitue",
   "texte": "« J’ai un ami qui a arrêté. Il vend des cuisines, maintenant. » Il dit ça sans mépris, presque avec envie. « Il m’a appelé le mois dernier pour me dire qu’il dort. Rien d’autre : je dors. »",
   "choix": [
    {
     "lab": "« Qu’est-ce qui vous retient ? »",
     "r": "« Des gamins que personne ne veut voir, et que je peux mettre à la télé. » Il hausse les épaules. « C’est peu. C’est suffisant. »",
     "d": 4,
     "ton": "curieux"
    },
    {
     "lab": "« Vous devriez partir aussi. »",
     "r": "Silence. « C’est un conseil sincère, ou vous préférez le suivant ? » Il ne le prend pas mal. Il le note, c’est tout.",
     "d": 0,
     "ton": "franc"
    },
    {
     "lab": "« Si vous partez, votre remplaçant reprend vos accords ? »",
     "r": "« Voilà une vraie question de manager. » Il rit, un peu jaune. « Non. Personne ne reprend rien. C’est exactement pour ça qu’on dîne, vous et moi. »",
     "d": 1,
     "ton": "intéressé"
    },
    {
     "lab": "« Les cuisines, ça ne fait pas rêver. »",
     "r": "« Le rêve, c’est ce qu’on vend aux gamins. » Il repousse son assiette. « Moi, je voudrais une nuit complète. »",
     "d": 1,
     "ton": "léger"
    }
   ]
  }
 ],
 "cafe": [
  {
   "cle": "cafe_deux_cafes",
   "si": "toujours",
   "texte": "Il commande deux cafés sans vous demander votre avis, repousse son assiette et croise les mains. « Voilà, on y est. C’est le moment où les gens me demandent quelque chose. Allez-y, je suis moins désagréable au café qu’au téléphone. »",
   "choix": [
    {
     "lab": "« Une date pour mon meilleur homme. »",
     "r": "Il hoche la tête, presque soulagé qu’on aille vite. « Au moins vous ne tournez pas autour. » Il ne dit pas oui. Il sort son téléphone, regarde quelque chose qu’il ne vous montre pas, et le repose face contre la nappe.",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Rien du tout. J’ai bien mangé, c’est tout. »",
     "r": "Il attend, au cas où ce serait une manœuvre. Puis il rit, court. « Vous savez que vous êtes le seul de la semaine ? »",
     "d": 3,
     "ton": "prudent",
     "ouvre": "cafe_rien_demande"
    },
    {
     "lab": "« Ce que vous voudrez bien me donner. »",
     "r": "« Ce que je veux bien vous donner, c’est un café. » Le sourire ne monte pas jusqu’aux yeux. « Demandez ou ne demandez pas, mais ne me faites pas faire votre travail. »",
     "d": -2,
     "ton": "flatteur"
    },
    {
     "lab": "« Vous d’abord. Qu’est-ce qui vous manque, à vous ? »",
     "r": "Il s’arrête net. « Un lourd qui tient trois rounds et qui sait parler devant une caméra. » Il l’a dit trop vite pour que ce soit une plaisanterie. « Voilà. Vous en savez autant que mon patron. »",
     "d": 4,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "cafe_rien_demande",
   "si": "toujours",
   "texte": "Les cafés arrivent. Il touille le sien bien plus longtemps que nécessaire. « Ça me met mal à l’aise, votre truc. Si vous ne demandez rien, je vais finir par vous devoir quelque chose, et je déteste ça. »",
   "choix": [
    {
     "lab": "« C’est un peu l’idée. »",
     "r": "« Au moins vous êtes honnête sur votre malhonnêteté. » Il écarte sa tasse. « Envoyez-moi vos deux meilleurs dossiers lundi. Je les regarderai vraiment, pas en diagonale entre deux réunions. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« Vous ne me devez rien. C’était un dîner. »",
     "r": "Il cherche le piège, ne le trouve pas, et ça l’agace un peu. « Alors vous êtes très patient, ou très mauvais en affaires. » Il écrit quelque chose au dos de l’addition et la garde.",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Puisque vous le dites : vous me devez quelque chose. »",
     "r": "Le visage se ferme d’un cran. « Je plaisantais. » Il boit son café d’un trait. « Vous, apparemment, non. »",
     "d": -3,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "cafe_premiere_fois",
   "si": "premier",
   "texte": "Il tourne sa cuillère sans lever les yeux. « Première fois qu’on dîne, alors je vous donne la règle du café. Ceux qui demandent trop tôt, je les oublie. Ceux qui demandent tout le temps, je m’en lasse. Ceux qui ne demandent jamais, je finis par les appeler moi-même. » Il lève les yeux. « À vous de voir. »",
   "choix": [
    {
     "lab": "« Alors j’attendrai votre appel. »",
     "r": "« Celle-là, personne ne la choisit le premier soir. » Il vous regarde vraiment, pour la première fois de la soirée. « On verra si vous tenez. En général on tient quelques mois, et puis j’ai un message un dimanche soir. »",
     "d": 4,
     "ton": "patient"
    },
    {
     "lab": "« Je demande maintenant, tant que vous vous souvenez de mon nom. »",
     "r": "« C’est logique, et ça ne marchera pas ce soir. » Il repousse la corbeille à pain pour dégager la table. « Le raisonnement est bon, gardez-le. Refaites-le l’an prochain, en connaissant mes catégories de poids par cœur. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Et ceux qui vous invitent à dîner ? »",
     "r": "« Ceux-là, je viens quand même. » Il souffle sur son café. « Mais je fais attention à ce que je bois, et je ne donne jamais un nom avant le dessert. »",
     "d": 0,
     "ton": "curieux"
    },
    {
     "lab": "« C’est un test, votre histoire ? »",
     "r": "« Tout est un test, sinon ce serait un dîner entre amis. » Il repose la cuillère. « Et ce n’en est pas un. Pas encore. »",
     "d": -2,
     "ton": "méfiant"
    }
   ]
  },
  {
   "cle": "cafe_une_date",
   "si": "aClasse",
   "texte": "« Vous allez me demander une date pour votre homme classé. » Ce n’est pas une question. « Alors je vous préviens tout de suite : je n’ai pas de dates. J’ai un main event, et je construis la carte à l’envers à partir de lui. Votre gars, ou il rentre là-dedans, ou il attend. »",
   "choix": [
    {
     "lab": "« Il rentre où, exactement ? »",
     "r": "Il aligne trois morceaux de sucre sur la nappe. « Le main event. Le co-main, qui doit finir vite parce que la télé prend l’antenne à l’heure. Et celui d’avant, qui peut être long et moche, ça laisse le public respirer. » Il pousse le troisième vers vous. « Votre homme, aujourd’hui, c’est celui-là. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Alors mettez-le en main event. »",
     "r": "Il regarde le sucre, puis vous. « Un main event, c’est un homme qui remplit une salle dans une ville donnée. Le vôtre, pour l’instant, il remplit un vestiaire. » Ce n’est pas dit méchamment, et c’est pire.",
     "d": -4,
     "ton": "arrogant"
    },
    {
     "lab": "« Il attendra. »",
     "r": "« Bonne réponse. Vous la regretterez cet hiver, quand il vous demandera tous les jours pourquoi il ne combat pas. » Il finit son café. « Ce jour-là, ne me le passez pas au téléphone. Appelez-moi, vous. »",
     "d": 2,
     "ton": "patient"
    },
    {
     "lab": "« On attend combien de temps, en général ? »",
     "r": "« Le temps que quelqu’un d’autre se blesse. » Il dit ça comme un bulletin météo. « La moitié des carrières que vous admirez ont démarré sur la blessure d’un autre. »",
     "d": 0,
     "ton": "pressé"
    }
   ]
  },
  {
   "cle": "cafe_le_nom_precis",
   "si": "tiede",
   "texte": "Il pose les coudes sur la table. « Dites le nom. Vous l’avez en tête depuis l’apéritif, ça se voit à la façon dont vous ramenez la conversation. Vous voulez un adversaire précis. »",
   "choix": [
    {
     "lab": "« Celui que tout le monde refuse. »",
     "r": "Il se redresse un peu. « Personne ne me demande jamais celui-là. Il n’y a rien à gagner et tout à perdre. » Il écrit quelque chose : ce n’est pas le nom du combattant, c’est celui de votre salle.",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Celui qui vient d’enchaîner deux défaites. »",
     "r": "« Évidemment. » Il n’a pas l’air déçu, il a l’air d’avoir eu raison. « Vous n’êtes pas le premier à me le demander ce mois-ci. Sauf que lui non plus ne peut plus se permettre de perdre. Son coach dira non, et il aura raison. »",
     "d": -1,
     "ton": "prudent"
    },
    {
     "lab": "« Le jeune qui monte, chez lui, devant son public. »",
     "r": "« Vous voulez sa ville et sa télé. » Il approuve à moitié. « Bien vu, et c’est exactement pour ça que son manager refusera. Gardez l’idée pour le jour où il aura une ceinture à défendre : là, il n’aura plus le choix. »",
     "d": 2,
     "ton": "ambitieux"
    },
    {
     "lab": "« Peu importe le nom. Quelqu’un de dur. »",
     "r": "« Vous savez ce que ça me fait, une phrase pareille ? » Il tapote la table. « Ça me fait un numéro que je peux appeler à minuit un jeudi. Je n’en ai pas beaucoup. »",
     "d": 3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "cafe_prelims_tard",
   "si": "petiteSalle",
   "texte": "Il consulte son téléphone, le retourne sur la nappe. « J’ai un trou. Premier combat des prélims, salle encore à moitié vide, personne ne filme. L’adversaire est correct et il a faim. Ce n’est pas glorieux, et je le propose aux petites salles avant les grosses, parce que vous, vous dites oui. »",
   "choix": [
    {
     "lab": "« On le prend. »",
     "r": "« Bien. » Il tape déjà un message. « Un conseil que vous n’avez pas demandé : prévenez votre gars qu’il n’y aura personne. Sinon il monte, il entend le vide, et il combat comme à l’entraînement. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "« D’accord, si vous êtes dans la salle pour le regarder. »",
     "r": "Un temps. « Je suis toujours là au premier combat. C’est le seul moment de la soirée où je regarde vraiment ; après, je ne fais que gérer des problèmes. » Puis, plus bas : « Mais c’est bien demandé. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "« On vaut mieux que l’ouverture des portes. »",
     "r": "Il range son téléphone. Complètement. « Peut-être. Mais personne ne le sait encore, et ce n’est pas moi qui vais l’annoncer à votre place. » Il regarde la salle. « Je le proposerai à quelqu’un d’autre en sortant. »",
     "d": -5,
     "ton": "arrogant"
    },
    {
     "lab": "« Laissez-moi appeler l’intéressé avant de répondre. »",
     "r": "« Appelez. » Il pousse les tasses pour vous faire de la place. « Vous seriez le premier coach à me demander l’avis de son combattant devant moi. Ça se sait, ce genre de chose, dans les vestiaires. »",
     "d": 1,
     "ton": "prudent"
    }
   ]
  },
  {
   "cle": "cafe_le_remplacant",
   "si": "habitue",
   "texte": "Il attend que le serveur s’éloigne. « Cette fois c’est moi qui demande. J’ai un forfait, il me manque un homme dans quinze jours. Poids moyen, quelqu’un qui ne se fait pas démonter en deux minutes et qui a un passeport valide. Vous avez ça ? »",
   "choix": [
    {
     "lab": "« Oui. Et il est prêt. »",
     "r": "« S’il ne l’est pas, dites-le-moi demain matin, pas maintenant. » Il note le nom. « Demain matin, je ne vous en voudrai pas. Le soir du combat, si. »",
     "d": 4,
     "ton": "franc"
    },
    {
     "lab": "« Non. Personne au poids, pas dans ce délai. »",
     "r": "Il repose son stylo, presque content. « Merci. Vous n’imaginez pas le nombre de gens qui disent oui et qui m’envoient un type qui arrive avec des kilos en trop la veille de la pesée. » Puis : « Je vous rappelle. » C’est dit comme un fait, pas comme une politesse.",
     "d": 3,
     "ton": "honnête"
    },
    {
     "lab": "« Oui. Si mon autre homme obtient une date. »",
     "r": "Le stylo s’arrête. « Donc vous me vendez un service d’urgence contre une faveur. » Il repart, plus lentement. « Ça marche une fois. Ensuite on vous appelle en dernier, et vous ne saurez jamais pourquoi. »",
     "d": -3,
     "ton": "calculateur"
    },
    {
     "lab": "« Qu’est-ce qui s’est passé, avec l’autre ? »",
     "r": "« Sa main. Il le savait depuis trois semaines et il a espéré. » Il regarde ailleurs une seconde. « Ils espèrent toujours, et c’est moi qui refais la carte à minuit avec ce qui reste. »",
     "d": 1,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "cafe_comment_on_paie",
   "si": "habitue",
   "texte": "Il baisse un peu la voix, sans regarder autour de lui. « Tant qu’on y est. Un combattant ne gagne pas ce qu’on annonce. Il y a la bourse, la prime s’il finit avant la limite, et tout ce qui part avant qu’il touche quoi que ce soit. »",
   "choix": [
    {
     "lab": "« Qui paie le camp, en vrai ? »",
     "r": "« Vous. Et vous ne le récupérez que s’il gagne, ou s’il reste chez vous. » Il repose sa cuillère. « C’est pour ça que les coachs deviennent désagréables la semaine de la pesée. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Chez moi, tout est écrit avant le combat. »",
     "r": "« Écrit, ou signé ? » Il attend, sans avoir l’air de juger. « Faites-le signer, et devant quelqu’un. Ça vous évitera un départ que vous n’auriez pas vu venir. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« On peut négocier la prime ? »",
     "r": "« On peut demander. Elle n’est pas à moi, elle est à la chaîne. » Il hausse un sourcil. « Et elle sert à fabriquer des finishes, pas à récompenser les braves. »",
     "d": 1,
     "ton": "pragmatique"
    },
    {
     "lab": "« Autant dire qu’on travaille tous à perte. »",
     "r": "« Non. » Il est net là-dessus. « Vous prenez des combats trop tôt parce que vous avez un loyer de salle à payer. Ça, ce n’est pas la chaîne, c’est vous. »",
     "d": -1,
     "ton": "amer"
    }
   ]
  },
  {
   "cle": "cafe_le_champion_dort",
   "si": "aChampion",
   "texte": "« Votre champion. » Il le dit en remuant son café, sans enthousiasme particulier. « Il va devoir défendre. La vraie question, ce n’est pas qui le mérite. C’est pour qui la chaîne accepte de payer une soirée entière. Ce n’est jamais le même homme. »",
   "choix": [
    {
     "lab": "« Donnez-moi les deux noms. »",
     "r": "« Le méritant : un lutteur qui gagne large et que personne ne regarde. L’autre : il parle bien, il a du public, et il sort d’une défaite. » Il laisse le silence faire le travail. « Vous savez déjà lequel je vais devoir défendre en réunion lundi. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Le vrai premier prétendant, ou pas de défense. »",
     "r": "« Très bien. » Il n’a pas l’air fâché, il a l’air d’avoir déjà entendu la phrase. « Alors le titre gèle jusqu’à l’automne prochain, et le public oublie le nom de votre homme. C’est un choix défendable. Assumez-le entièrement. »",
     "d": -2,
     "ton": "exigeant"
    },
    {
     "lab": "« Le choix de la chaîne me va, si mon homme est payé en conséquence. »",
     "r": "« Là, on parle sérieusement. » Il se penche. « Vous ne serez pas payé davantage, vous serez payé autrement. Quand c’est eux qui veulent le combat, l’argent n’est plus dans la bourse, il est dans le contrat. »",
     "d": 2,
     "ton": "pragmatique"
    },
    {
     "lab": "« De toute façon il les bat tous les deux. »",
     "r": "« Tout le monde bat tout le monde, à cette table. » Il sourit à moitié. « J’ai vu trop d’invincibles s’endormir au premier round pour dire encore cette phrase à voix haute. »",
     "d": -1,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "cafe_rien_a_vendre",
   "si": "debutant",
   "texte": "Il repose sa tasse vide. « Soyons clairs, ça vous évitera de le demander : vous n’avez personne de classé, donc je n’ai pas de case pour vous ce soir. Ce n’est pas une méchanceté, c’est une carte de combats. »",
   "choix": [
    {
     "lab": "« Alors dites-moi ce qu’il vous faut. »",
     "r": "« Un homme qui finit ses combats. Un homme qui fait le poids sans y laisser sa tête. Un homme joignable un dimanche. » Il compte sur ses doigts et s’arrête au troisième. « Le dernier est le plus rare, et c’est vous qui le fournissez, pas lui. »",
     "d": 5,
     "ton": "humble"
    },
    {
     "lab": "« Vous serez surpris dans deux ans. »",
     "r": "« J’espère bien. » Il le dit sans ironie, ce qui déstabilise plus qu’autre chose. « Retenez la date de ce dîner et venez me la rappeler. J’aime bien avoir tort là-dessus, ça n’arrive pas souvent. »",
     "d": 1,
     "ton": "confiant"
    },
    {
     "lab": "« Prenez-en un quand même, pour voir. »",
     "r": "« Pour voir. » Il répète le mot comme s’il l’examinait. « Je mets un garçon qui n’est pas prêt en face d’un professionnel qui a un loyer à payer, devant sa famille, pour voir. » Il ne finit pas la phrase, et la discussion s’arrête avec elle.",
     "d": -4,
     "ton": "insistant"
    },
    {
     "lab": "« Alors parlons d’autre chose. »",
     "r": "Il vous regarde un peu plus longtemps que nécessaire. « D’accord. » Il parle de son fils, qui fait du judo et qui déteste ça. Il en parle plus longtemps que de n’importe quel combattant de la soirée.",
     "d": 2,
     "ton": "digne"
    }
   ]
  },
  {
   "cle": "cafe_montre_froide",
   "si": "froid",
   "texte": "Il a demandé l’addition avant même le café, et il regarde son téléphone sous la table, ce qui est sa façon d’être poli. « Bon. Si vous avez quelque chose à me demander, c’est maintenant. Je pars dans dix minutes. »",
   "choix": [
    {
     "lab": "« Rien. Merci pour le temps que vous m’avez donné. »",
     "r": "Il lève les yeux et range le téléphone. Un temps. « D’accord. » Il reste finalement une demi-heure de plus. Pas parce qu’il vous apprécie : parce qu’il ne s’y attendait pas.",
     "d": 3,
     "ton": "digne"
    },
    {
     "lab": "« J’ai l’impression de vous ennuyer depuis l’entrée. »",
     "r": "Silence. « Vous ne m’ennuyez pas. J’ai un combattant à l’hôpital depuis ce matin et une carte à refaire pour vendredi. » Il pose le téléphone à plat sur la table. « Excusez-moi. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "« Une place sur la prochaine carte et je vous laisse partir. »",
     "r": "« Vous me laissez partir. » Il se lève en enfilant sa veste. « C’est la seule phrase de la soirée dont je vais me souvenir. »",
     "d": -5,
     "ton": "pressé"
    },
    {
     "lab": "« Qu’est-ce que je vous ai fait ? »",
     "r": "« Ce soir, rien. » Il boutonne sa veste sans se presser. « L’an dernier, vous avez raconté autour de vous que je vous avais promis un main event. Je ne promets jamais rien à personne. Depuis, je passe pour un menteur auprès de gens que je vois toutes les semaines. »",
     "d": 1,
     "ton": "direct"
    }
   ]
  },
  {
   "cle": "cafe_ce_qu_il_ferait",
   "si": "chaud",
   "texte": "Il commande un deuxième café, ce qu’il ne fait jamais. « Je vous pose une vraie question et je veux une vraie réponse. Deux hommes, une place. L’un est nettement meilleur. L’autre a besoin de l’argent maintenant, et je sais exactement pourquoi. Vous faites quoi ? »",
   "choix": [
    {
     "lab": "« Le meilleur. C’est un métier, pas une œuvre sociale. »",
     "r": "« C’est ce que je vais faire. » Il n’a pas l’air content de l’entendre. « Je voulais juste que quelqu’un d’autre le dise à voix haute une fois dans la journée. »",
     "d": 2,
     "ton": "sec"
    },
    {
     "lab": "« Celui qui en a besoin. Le meilleur aura d’autres soirs. »",
     "r": "« On entend que vous êtes coach. » Il sourit sans joie. « Si je fais ça trois fois, on me retire les cartes, et c’est quelqu’un de beaucoup moins sentimental qui les fera à ma place. »",
     "d": 1,
     "ton": "humain"
    },
    {
     "lab": "« Je leur dirais la vérité aux deux, le même jour, moi-même. »",
     "r": "Il repose sa tasse. « Le même jour. » Il ne dit rien pendant un moment. « Personne ne fait ça. On étale, on gagne du temps, et ils l’apprennent tous les deux par un journaliste. » Il vous regarde autrement pour le reste de la soirée.",
     "d": 5,
     "ton": "franc",
     "ouvre": "cafe_le_nom"
    },
    {
     "lab": "« Ça dépend. Lequel des deux est chez moi ? »",
     "r": "Il rit un peu, déçu quand même. « Vous avez tenu presque toute la soirée. C’était la seule question qui ne parlait pas de vous. »",
     "d": -2,
     "ton": "intéressé"
    }
   ]
  },
  {
   "cle": "cafe_le_nom",
   "si": "grosseSalle",
   "texte": "Il attend que la table voisine se lève. « Je vais vous donner un nom, et vous ne l’avez pas eu par moi. Un garçon arrive en fin de contrat, il n’est pas content, et son coach n’a pas encore compris qu’il est en train de le perdre. »",
   "choix": [
    {
     "lab": "« Pourquoi moi ? »",
     "r": "« Parce que vous écoutez plus que vous ne parlez, ce qui est rare à cette table. » Il tourne sa tasse vide. « Et parce que chez vous, il ne sera pas une ligne sur une affiche. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Je ne prends pas l’homme d’un autre coach. »",
     "r": "Il vous regarde longuement, puis referme son carnet. « Alors il ira chez quelqu’un de moins regardant, et vous aurez eu raison quand même. Les gens qui savent ce que ça coûte, j’en croise deux par an. »",
     "d": 4,
     "ton": "droit"
    },
    {
     "lab": "« Donnez le nom. »",
     "r": "Il l’écrit sur le coin de la nappe en papier, déchire le morceau et le pousse vers vous. « Vous l’appelez après la fin du contrat. Pas avant. Si j’apprends que vous avez appelé avant, je ne vous dois plus rien, et vous non plus. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« Qu’est-ce que vous y gagnez, vous ? »",
     "r": "« Un combattant malheureux me coûte des cartes : il se retire, il rate le poids, il refuse les adversaires. » Il termine son café. « Je ne fais pas ça pour vous. Ça tombe bien pour vous, c’est tout. »",
     "d": 0,
     "ton": "méfiant"
    }
   ]
  },
  {
   "cle": "cafe_addition",
   "si": "toujours",
   "texte": "Le serveur pose l’addition entre vous deux, à égale distance, ce qui est une façon de ne pas trancher. Le matchmaker ne la regarde pas.",
   "choix": [
    {
     "lab": "« Je prends. »",
     "r": "Il laisse faire, sans commentaire. Puis, en enfilant sa veste : « L’an prochain, c’est moi. » Il ne le dit pas à tout le monde.",
     "d": 2,
     "ton": "simple"
    },
    {
     "lab": "« On partage. »",
     "r": "« On partage. » Il pose sa carte sur la table, presque content. « Comme ça personne ne doit rien à personne, et on peut recommencer l’an prochain. »",
     "d": 3,
     "ton": "sobre"
    },
    {
     "lab": "« C’est la maison qui invite, je connais le patron. »",
     "r": "Il regarde la salle, puis vous. « Donc on a dîné gratuitement dans un endroit où on vous connaît, et où on m’a vu. » Il se lève. « La prochaine fois, un endroit où personne ne nous connaît. »",
     "d": -2,
     "ton": "malin"
    },
    {
     "lab": "« Vous êtes en note de frais, non ? »",
     "r": "« Je le suis, oui. » Il ne fait pas un geste vers l’addition, et ne dit plus rien jusqu’à la porte.",
     "d": -3,
     "ton": "familier"
    }
   ]
  }
 ],
 "addition": [
  {
   "cle": "addition_qui_paie",
   "si": "toujours",
   "texte": "L'addition arrive dans un petit étui en cuir. Il le prend sans l'ouvrir, le glisse sous son coude et continue de parler comme si de rien n'était.",
   "choix": [
    {
     "lab": "Le laisser faire",
     "r": "« Merci. » Il pose sa carte sur l'étui sans regarder le total. « L'organisation paie. Vous, vous payez les billets d'avion et les points de suture. Laissez-moi le repas. »",
     "d": 2,
     "ton": "prudent",
     "ouvre": "addition_trottoir"
    },
    {
     "lab": "Tendre la main vers l'étui",
     "r": "Il pose la main dessus, sans forcer. « Non. Un coach qui paie mon dîner, ça se raconte, et ça se raconte mal. Vous m'inviterez le jour où vous n'aurez plus rien à me demander. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "« On partage, c'est plus simple. »",
     "r": "« Plus simple pour qui ? » Il sourit à peine. « On partage entre gens qui se doivent quelque chose. Je préfère ne rien devoir. »",
     "d": 0,
     "ton": "prudent"
    },
    {
     "lab": "« Vous pouvez bien me l'offrir, avec ce que je vous rapporte. »",
     "r": "Le sourire tombe d'un cran. « Ce que vous me rapportez, c'est un homme sur ma carte de novembre. Elle est déjà pleine. » Il signe sans lever les yeux. « Le repas est offert quand même. »",
     "d": -4,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "addition_premier_lecon",
   "si": "premier",
   "texte": "Il fait un signe minuscule au serveur, à peine un mouvement de la main. « Première fois qu'on dîne, alors autant vous le dire : c'est toujours moi. Chaque année, avec chaque salle. C'est une ligne dans un budget, pas un cadeau. »",
   "choix": [
    {
     "lab": "Demander pourquoi c'est toujours lui",
     "r": "« Parce que le jour où je devrai dire non à votre gamin, je veux pouvoir vous regarder en face. Si vous m'aviez payé le dîner, vous croiriez que ça achetait quelque chose. » Il repose l'étui. « Ça n'achète rien. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "« Alors je vous invite le jour où j'arrête. »",
     "r": "Il rit, court. « Vous seriez le premier à tenir. Ceux qui arrêtent ne rappellent plus personne, c'est comme ça. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "Sortir quand même sa carte",
     "r": "Il ne la regarde pas. « Rangez ça. » Un temps. « Soit vous n'avez pas écouté, soit vous vouliez montrer que vous pouviez. Les deux sont mauvais. »",
     "d": -3,
     "ton": "arrogant"
    },
    {
     "lab": "Le remercier et ne rien ajouter",
     "r": "« De rien. » Il repose l'étui, cherche son manteau des yeux. « Vous parlez peu. Ça se remarque, dans ce métier. »",
     "d": 2,
     "ton": "humble",
     "ouvre": "addition_trottoir"
    }
   ]
  },
  {
   "cle": "addition_froid_note",
   "si": "froid",
   "texte": "Il a demandé l'addition avant le dessert. Il paie debout, le manteau déjà sur le bras, et compte les pièces du pourboire une par une sur la nappe.",
   "choix": [
    {
     "lab": "Lui demander franchement ce qui n'allait pas ce soir",
     "r": "« Rien. » Il ferme son portefeuille. « Vous avez parlé de vous tout le repas et vous ne m'avez rien demandé. Ce n'est pas grave. C'est juste long. »",
     "d": 2,
     "ton": "franc"
    },
    {
     "lab": "Se lever aussi, sans un mot",
     "r": "Il hoche la tête. Sur le trottoir, il vous serre la main, brièvement. « Bonne route. » Rien d'autre.",
     "d": 0,
     "ton": "sec",
     "ouvre": "addition_dernier_mot_froid"
    },
    {
     "lab": "« J'espère que ça ne change rien pour mes gars. »",
     "r": "« Ça n'a jamais rien changé. » Il enfile son manteau. « Vos gars sont sur mes listes ou ils n'y sont pas. Ça se décide devant un écran, pas devant une entrecôte. »",
     "d": -2,
     "ton": "prudent"
    },
    {
     "lab": "Plaisanter sur le prix de la note",
     "r": "Il regarde le ticket, puis vous. « Ce dîner-là, je le fais toute l'année, avec tout le monde. Le vôtre, je m'en souviendrai. » Il ne sourit pas en le disant.",
     "d": -3,
     "ton": "maladroit"
    }
   ]
  },
  {
   "cle": "addition_chaud_votre_tour",
   "si": "chaud",
   "texte": "L'étui arrive. Il le pousse vers vous du bout des doigts. « Cette année, c'est vous. Ne dites rien, ne faites pas de tête, c'est la seule fois où je le ferai. »",
   "choix": [
    {
     "lab": "Payer sans commentaire",
     "r": "Il vous regarde signer, les bras croisés. « Voilà. On a dîné, cette fois. Pas eu une réunion. » Il se lève. « Ça ne vous donne rien sur mes cartes. Le reste, oui. »",
     "d": 4,
     "ton": "complice",
     "ouvre": "addition_dernier_mot_chaud"
    },
    {
     "lab": "Demander ce que ça veut dire",
     "r": "« Que je ne compte plus vos hommes avant de vous répondre. » Il hausse une épaule. « Ne me le faites pas regretter. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Repousser l'étui vers lui",
     "r": "Il le laisse au milieu de la table, entre vous deux, un long moment. Puis il finit par le reprendre. « Comme vous voulez. » Il ne le repropose pas.",
     "d": -2,
     "ton": "prudent"
    },
    {
     "lab": "« Alors je choisis le vin, l'an prochain. »",
     "r": "« L'an prochain, vous choisirez la table. Pas le vin. » Il boutonne son manteau. « Ce que vous avez commandé ce soir, je n'ai rien dit, mais ça m'a coûté. »",
     "d": 2,
     "ton": "complice"
    }
   ]
  },
  {
   "cle": "addition_pourboire",
   "si": "tiede",
   "texte": "Il paie, puis glisse des billets pliés sous la soucoupe. « La serveuse est là depuis ce matin. Regardez comment un type traite un serveur : vous saurez comment il traite un combattant qui vient de perdre. »",
   "choix": [
    {
     "lab": "Ajouter quelque chose sous la soucoupe",
     "r": "Il ne dit rien sur le moment. Dans le couloir, en récupérant les manteaux : « Vous avez remis au pot. Je l'ai vu. » Il n'ajoute rien d'autre.",
     "d": 3,
     "ton": "humble",
     "ouvre": "addition_trottoir"
    },
    {
     "lab": "Demander qui, dans le milieu, traite mal les siens",
     "r": "« Vous voulez des noms au moment du café ? » Il repousse sa chaise. « Non. Mais les salles que je ne rappelle plus, ce n'est pas le niveau de leurs gars qui est en cause. »",
     "d": 2,
     "ton": "curieux"
    },
    {
     "lab": "« C'est un test ? »",
     "r": "« Non. Je suis fatigué, je parle. » Il se masse la nuque. « Mais oui, j'ai regardé. On regarde toujours. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "Faire remarquer que le service était moyen",
     "r": "« Il était moyen parce qu'ils ne sont pas assez nombreux en salle un mardi soir. » Il laisse les billets exactement où ils sont. « Vous avez déjà eu un gamin qui s'entraîne mal parce qu'il enchaîne les boulots ? J'en vois toutes les semaines. »",
     "d": -3,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "addition_carte_refusee",
   "si": "petiteSalle",
   "texte": "Vous avez insisté pour payer. Le terminal fait un bruit sec, le serveur retourne l'écran vers vous avec beaucoup de délicatesse, et le matchmaker regarde ailleurs, très poliment, un peu trop longtemps.",
   "choix": [
    {
     "lab": "Le dire simplement : ça ne passera pas",
     "r": "Il tend sa carte au serveur sans un commentaire. Une fois dehors : « Ma première salle, je payais les licences avec la caisse du bar. Ne le racontez à personne, je ne raconterai rien non plus. »",
     "d": 3,
     "ton": "franc",
     "ouvre": "addition_trottoir"
    },
    {
     "lab": "Chercher une autre carte, puis du liquide",
     "r": "Il vous laisse faire jusqu'au bout, puis pose la sienne sur la soucoupe. « On arrête. » Aucun mépris dans la voix. C'est presque pire.",
     "d": 0,
     "ton": "gêné"
    },
    {
     "lab": "Accuser la banque",
     "r": "« Bien sûr. » Il paie. « Personne n'a de problème d'argent dans ce métier. Tout le monde a des problèmes de virement. J'entends ça au téléphone toute la journée. »",
     "d": -2,
     "ton": "maladroit"
    },
    {
     "lab": "En rire soi-même",
     "r": "Il rit aussi, brièvement. « Bienvenue. » Puis, en enfilant son manteau : « Vous savez ce qui sépare les salles qui tiennent des autres ? Pas le talent des gamins. Le loyer. »",
     "d": 2,
     "ton": "humble"
    }
   ]
  },
  {
   "cle": "addition_ceinture_dehors",
   "si": "aChampion",
   "texte": "Il s'arrête sous l'auvent, le temps que le taxi arrive. « Votre champion. Vous savez ce qui me tient éveillé avec lui ? Pas son adversaire. La date. »",
   "choix": [
    {
     "lab": "Demander ce qu'il entend par là",
     "r": "« Une ceinture bloque tout le reste. La chaîne veut le combat sur le bon trimestre, l'adversaire veut du temps, et personne ne veut le même mois. » Il regarde la rue. « Vous, vous attendez un nom. Moi, j'attends un calendrier. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "addition_taxi"
    },
    {
     "lab": "« On prend qui vous voulez, quand vous voulez. »",
     "r": "« Ne dites jamais ça. » Sa voix ne monte pas. « Le jour où j'aurai besoin d'un dépannage, je penserai à vous. Un dépannage, ça n'a jamais servi une ceinture. »",
     "d": -2,
     "ton": "empressé"
    },
    {
     "lab": "Lui promettre qu'on n'annoncera rien sans lui en parler",
     "r": "« Ce serait déjà beaucoup. » Il hoche la tête. « Beaucoup de coachs annoncent une date en interview avant de me l'écrire. Après, c'est moi qui passe pour celui qui refuse. »",
     "d": 3,
     "ton": "franc"
    },
    {
     "lab": "Demander que la défense se fasse à domicile",
     "r": "« Chez vous ? » Il sourit sans y croire. « La ville, c'est la chaîne qui la choisit. Pas moi, et sûrement pas vous. » Un temps. « Demandez-moi autre chose. N'importe quoi d'autre. »",
     "d": -2,
     "ton": "arrogant"
    }
   ]
  },
  {
   "cle": "addition_debutant_conseil",
   "si": "debutant",
   "texte": "Il attend son manteau, les yeux sur la salle qui se vide. « Vous n'avez encore personne dans mes listes. Ce n'est pas un reproche, c'est une information. »",
   "choix": [
    {
     "lab": "Demander ce qu'il regarde chez un gamin qu'il ne connaît pas",
     "r": "« Des combats réguliers au même poids. Des adversaires qui ne sont pas complaisants. » Il prend son manteau. « Et une vidéo que je peux ouvrir sans mot de passe. Vous seriez surpris du nombre de gens qui ratent la dernière. »",
     "d": 3,
     "ton": "curieux",
     "ouvre": "addition_trottoir"
    },
    {
     "lab": "« Donnez-moi juste une place, je m'occupe du reste. »",
     "r": "« Une place, c'est le combat de quelqu'un d'autre. » Il enfile son manteau. « Et si votre gamin la prend trop tôt, je ne le reverrai plus sur une carte. »",
     "d": -2,
     "ton": "pressé"
    },
    {
     "lab": "Reconnaître qu'on n'est pas encore prêt",
     "r": "Il s'arrête, la manche à moitié enfilée. « Merci. Vous n'imaginez pas ce qu'on me jure à cette table. » Un temps. « Rappelez-moi quand vous le serez. On gagnera du temps, vous et moi. »",
     "d": 4,
     "ton": "humble"
    },
    {
     "lab": "Lui réciter les espoirs de la salle pendant qu'il s'habille",
     "r": "« Arrêtez. » Il n'est pas fâché, juste ailleurs. « Je ne retiens rien après le dessert. Un nom, par écrit, en janvier. »",
     "d": -1,
     "ton": "maladroit"
    }
   ]
  },
  {
   "cle": "addition_trottoir",
   "si": "toujours",
   "texte": "Dehors, l'air est plus froid que prévu. Il remonte son col, regarde la rue vide et ne bouge pas tout de suite. « Voilà. C'est le moment de la soirée où les gens me demandent ce qu'ils n'ont pas osé demander à table. »",
   "choix": [
    {
     "lab": "Demander pour de bon ce qu'on n'a pas osé",
     "r": "« Allez-y. » Il écoute jusqu'au bout, les mains dans les poches, sans vous couper. « Je ne vous promets rien, vous le savez. J'y penserai en rentrant, et ça ne m'arrive pas souvent. »",
     "d": 4,
     "ton": "franc",
     "ouvre": "addition_cigarette"
    },
    {
     "lab": "« Rien. Bonne soirée. »",
     "r": "Il a presque l'air déçu. « Vous êtes bien le premier. » Il vous serre la main. « Bonne soirée à vous aussi. Faites attention en rentrant, c'est verglacé sur le pont. »",
     "d": 1,
     "ton": "prudent"
    },
    {
     "lab": "Demander une place sur la prochaine carte",
     "r": "« Voilà, on y est. » Il soupire, sans agacement, comme on constate la météo. « Je fabrique la carte de mars en janvier, avec ce que j'ai en janvier. Demandez-moi en janvier. »",
     "d": -2,
     "ton": "pressé"
    },
    {
     "lab": "Le remercier pour la soirée, honnêtement",
     "r": "« C'était un bon dîner. » Il regarde la vitrine du restaurant derrière vous. « J'en fais beaucoup dans l'année. J'en garde très peu. Celui-là, je crois que je le garde. »",
     "d": 3,
     "ton": "humble",
     "ouvre": "addition_taxi"
    }
   ]
  },
  {
   "cle": "addition_cigarette",
   "si": "toujours",
   "texte": "Il sort un paquet écrasé de sa poche intérieure, en tire une cigarette et la regarde un moment. « J'ai arrêté il y a longtemps. Sauf à ce dîner-là. Ma femme le sait et fait semblant de ne pas le savoir. »",
   "choix": [
    {
     "lab": "Attendre en silence qu'il l'allume",
     "r": "Il tire dessus, les yeux sur les toits d'en face. « Vous savez ce qui est dur, dans ce métier ? Ce n'est pas de dire non. C'est de dire oui à quelqu'un, en sachant très bien contre qui. »",
     "d": 4,
     "ton": "complice"
    },
    {
     "lab": "Lui en demander une",
     "r": "Il vous tend le paquet. « Tenez. Elles sont vieilles, elles sont horribles. » Vous fumez mal, l'un comme l'autre, et pendant un moment il n'est question ni de combats ni de dates.",
     "d": 3,
     "ton": "complice"
    },
    {
     "lab": "Lui dire qu'il devrait vraiment arrêter",
     "r": "« J'ai arrêté. » Il montre la cigarette entre ses doigts. « Ça, c'est ce dîner. Rien d'autre. » Un temps. « Vous êtes coach jusque sur le trottoir. »",
     "d": -2,
     "ton": "maladroit"
    },
    {
     "lab": "Lui demander depuis quand il fait ce métier",
     "r": "Il regarde la braise avant de répondre. « Assez pour avoir emmené des gamins jusqu'à une ceinture. Et pour en avoir enterré un. » Il ne développe pas. Vous ne demandez pas.",
     "d": 2,
     "ton": "curieux",
     "ouvre": "addition_taxi"
    }
   ]
  },
  {
   "cle": "addition_telephone",
   "si": "habitue",
   "texte": "Son téléphone s'allume dans sa main pendant qu'il attend son manteau. Il lit, ferme les yeux un instant, range l'appareil. « Un de mes gars vient de sortir de la carte de samedi. Coupure à l'entraînement, au-dessus de l'œil. »",
   "choix": [
    {
     "lab": "Demander ce qu'il fait, maintenant",
     "r": "« Maintenant ? Je rentre et je réveille des gens. Il me faut quelqu'un au bon poids, avec un visa valide, qui dise oui avant demain midi. Sinon la chaîne retire le combat et je perds le créneau. »",
     "d": 3,
     "ton": "curieux"
    },
    {
     "lab": "Proposer un de ses hommes tout de suite",
     "r": "Il vous regarde un moment, sur ce trottoir, à cette heure-là. Puis, plus doucement : « Envoyez-moi son nom par écrit demain matin. Mais ne me vendez pas quelqu'un pendant qu'un autre saigne. »",
     "d": -2,
     "ton": "opportuniste"
    },
    {
     "lab": "Ne rien demander, le laisser à son problème",
     "r": "Il boutonne son manteau. « Merci de ne pas avoir sauté dessus. » Un temps. « La dernière fois qu'un main event est tombé, mon téléphone n'a pas arrêté. Ceux qui n'ont pas appelé, je les ai en tête. »",
     "d": 4,
     "ton": "prudent"
    },
    {
     "lab": "« C'est la vie, il y en aura d'autres. »",
     "r": "« Il y aura d'autres cartes. Lui, il a une petite fille et pas de salaire ce mois-ci. » Il lève la main pour héler un taxi. « C'est mon travail. C'est la partie que je fais mal. »",
     "d": -4,
     "ton": "sec"
    }
   ]
  },
  {
   "cle": "addition_taxi",
   "si": "toujours",
   "texte": "Un taxi se range, moteur qui tourne, portière ouverte sur la banquette éclairée. Il pose une main sur le toit et se retourne, à moitié dedans, à moitié encore avec vous.",
   "choix": [
    {
     "lab": "Lui redonner le nom de son meilleur gamin",
     "r": "« Je l'ai. » Il tapote sa tempe. « Je les ai tous, c'est bien le problème. » Il s'assoit. « Faites-le finir un combat avant la fin de l'année. Après, personne n'aura besoin de me le rappeler. »",
     "d": 0,
     "ton": "pressé"
    },
    {
     "lab": "Refermer la portière et le laisser partir",
     "r": "La voiture démarre, puis la vitre descend un peu. « Coach. » Vous vous retournez. « Ne signez nulle part avant de m'avoir appelé. » La vitre remonte, et le taxi tourne au carrefour.",
     "d": 3,
     "ton": "prudent"
    },
    {
     "lab": "Proposer de partager la course",
     "r": "« Je vais à l'aéroport. » Il regarde sa montre. « Vol de nuit, et je suis dans une salle demain matin. » Un temps, la portière toujours ouverte. « Si vous avez encore quelque chose à me dire, montez. »",
     "d": 2,
     "ton": "complice"
    },
    {
     "lab": "Rester planté là sans savoir quoi dire",
     "r": "Le silence dure un peu trop. Il finit par tendre la main. « Bon. » La portière claque. Vous retrouvez la bonne phrase en rentrant, dans la voiture.",
     "d": 0,
     "ton": "gêné"
    }
   ]
  },
  {
   "cle": "addition_dernier_mot_chaud",
   "si": "chaud",
   "texte": "Il ne monte pas tout de suite. Il tient la portière ouverte, cherche ses mots, ce qui ne lui ressemble pas.",
   "choix": [
    {
     "lab": "Attendre",
     "r": "« J'ai déçu à peu près tout le monde dans ce métier. Vous, pas encore. » Il s'assoit sur la banquette. « Faites en sorte que ça dure. Ce serait reposant. »",
     "d": 5,
     "ton": "humble"
    },
    {
     "lab": "« Vous pouvez tout me dire. »",
     "r": "« Non. » Il sourit, presque. « Et c'est pour ça que je vous aime bien : vous croyez encore que oui. »",
     "d": 1,
     "ton": "franc"
    },
    {
     "lab": "Le devancer et le remercier",
     "r": "Il lève la main pour vous arrêter. « Ne me remerciez pas, j'allais dire quelque chose de bien et vous venez de le couvrir. » Il rit, et la voiture part avant qu'il ait fini.",
     "d": 0,
     "ton": "maladroit"
    },
    {
     "lab": "Lui demander s'il pense à arrêter",
     "r": "Il regarde la rue mouillée un moment. « Tous les lundis. » Il monte. « Et tous les samedis, au milieu d'un combat que j'ai fabriqué, je sais pourquoi je ne l'ai pas fait. »",
     "d": 3,
     "ton": "curieux"
    }
   ]
  },
  {
   "cle": "addition_dernier_mot_froid",
   "si": "froid",
   "texte": "Il n'attend pas le taxi avec vous. Il part vers le carrefour, puis s'arrête net, comme s'il avait oublié quelque chose, et revient sur ses pas.",
   "choix": [
    {
     "lab": "Attendre ce qu'il a à dire",
     "r": "« Vous êtes venu chercher quelque chose et vous repartez sans rien. » Il remonte son col. « L'an prochain, venez sans liste. »",
     "d": 2,
     "ton": "prudent"
    },
    {
     "lab": "« On se voit à la pesée ? »",
     "r": "« On se voit à la pesée, comme tout le monde. » Il repart déjà. « Bonne soirée, coach. » Il ne se retourne pas au carrefour.",
     "d": -1,
     "ton": "pressé"
    },
    {
     "lab": "Lui dire qu'on a mal commencé, et qu'on peut se revoir",
     "r": "Il réfléchit vraiment, ce qui est déjà quelque chose. « On ne se revoit pas, dans ce métier. On se recroise. » Il vous serre la main, correctement, sans chaleur. « Alors on se recroisera. »",
     "d": 3,
     "ton": "humble"
    },
    {
     "lab": "Lui tourner le dos le premier",
     "r": "Vous entendez ses pas s'éloigner sans hésiter. Le lendemain, il répond à votre message en fin de journée. Un mot.",
     "d": -5,
     "ton": "sec"
    }
   ]
  }
 ]
};

module.exports = { SCENES };
