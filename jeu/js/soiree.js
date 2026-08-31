/**
 * soiree.js — LA SOIREE VECUE : les conversations au bord de la cage.
 *
 * Mael (30/08) : « pas super fan du mode scouting — je m'inscris et ça
 * m'ouvre une page annexe comme le combat, avec l'évent ; je peux parler
 * avec les combattants avec des dialogues riches, les inviter à la salle
 * pour s'entraîner, créer des liens, ou recruter s'ils n'ont plus de
 * club. »
 *
 * LA DOCTRINE DES DIALOGUES (la même que dialogue.js, 10/08) : les
 * répliques ne sont PAS décoratives — chacune est choisie par l'état
 * réel de l'homme (son résultat du soir, son contrat, sa notoriété, ce
 * qu'il sait de toi) et vient avec sa conséquence. LE CONTACT est un
 * résidU des faits, posé sur l'homme du monde (p.contact = {v, faits}),
 * il voyage avec lui dans la sauvegarde — et il pèse : un homme qui te
 * connaît accepte plus volontiers de venir, et de signer.
 *
 * Module PUR : aucun tirage (la variante sort du jeton fourni par le
 * jeu : id + jour), aucun DOM, aucun etat global. Banc 33.
 */

/* ==================================================================== */
/* LE CONTACT — le residu des conversations.                            */
/* ==================================================================== */
function contactDe(p) {
  if (!p.contact) p.contact = { v: 0, faits: [] };
  return p.contact;
}
function poserContact(p, jour, quoi, delta) {
  const c = contactDe(p);
  c.v = Math.max(0, Math.min(100, Math.round((c.v + delta) * 10) / 10));
  c.faits.push({ jour, quoi, delta });
  if (c.faits.length > 5) c.faits.shift();
  return c.v;
}
function motContact(v) {
  if (v >= 60) return "en confiance";
  if (v >= 30) return "il te connaît";
  if (v >= 10) return "il te situe";
  return null;
}

/* ==================================================================== */
/* LA SITUATION D'UN HOMME AU BORD DE LA CAGE.                          */
/* ctx : { nom, aCombattu, aGagne, finish, serre, libre, finContrat,    */
/*         orgNom, niveauInter, rang, notoriete, contactV, reputation,  */
/*         preuve, salleNom, jeton }                                    */
/* ==================================================================== */
const sit = (ctx) =>
  !ctx.aCombattu ? (ctx.libre ? "libre" : "spectateur")
  : ctx.aGagne ? (ctx.finish ? "gagne_finish" : "gagne_decision")
  : (ctx.serre ? "perdu_serre" : "perdu_dur");

const pioche = (liste, jeton) => liste[Math.abs(jeton | 0) % liste.length];

/* ==================================================================== */
/* CE QU'IL DIT EN PREMIER. Le contact rechauffe l'accueil.             */
/* ==================================================================== */
/* /!\ REPERTOIRES DOUBLES (Mael, 31/08 : "enrichir les dialogues, les
   doubler au moins"). Les familles ne bougent pas — la situation choisit
   toujours ; seul le nombre de facons de le dire grandit, et le jeton
   departage comme avant. */
const OUVERTURES = {
  gagne_finish: [
    "On prépare ça depuis huit semaines. Ce soir, ça a payé.",
    "Il a senti le premier crochet. Après, c'était une question de temps.",
    "Le plan disait trois rounds. Il n'en a pas fallu un entier.",
    "Tout le monde parlait de lui. Ils vont parler de moi maintenant.",
    "T'as vu le finish ? Mon coach l'avait dessiné au tableau ce matin.",
    "Je l'avais dit à la pesée. Personne n'a écouté. Maintenant ils écoutent.",
    "Même pas une égratignure. Je pourrais recommencer demain.",
    "Sa fête est finie. La mienne commence — enfin, après les examens médicaux.",
  ],
  gagne_decision: [
    "Trois rounds propres. Pas le plus beau soir de ma vie, mais je prends.",
    "Il était plus dur que sur les vidéos. J'ai fait le métier, c'est tout.",
    "On a gagné à la casquette. Le coin a bien parlé, j'ai bien écouté.",
    "Pas de bonus ce soir, mais la colonne des victoires ne demande pas le style.",
    "Il m'a fait travailler. C'est les combats comme ça qui construisent.",
    "Les juges ont vu juste, pour une fois. J'en connais qui vont râler quand même.",
  ],
  perdu_serre: [
    "30-27 ? Ils ont regardé quel combat, les juges ?",
    "Un round d'écart, peut-être. Pas trois. Enfin. On remet ça.",
    "Il le sait, lui, que c'était serré. Regarde sa tête.",
    "Refais-le-nous demain, ce combat, et je te signe l'autre résultat.",
    "Mon coin dit qu'on a gagné le deux et le trois. Les juges avaient d'autres soirées en tête.",
    "Ça s'est joué sur un takedown à dix secondes du gong. Dix secondes.",
  ],
  perdu_dur: [
    "Pas ce soir. Ne me demande pas de commenter.",
    "J'ai rien vu venir. C'est le jeu, il paraît.",
    "Le vestiaire d'à côté fait la fête. Laisse-moi celui-là.",
    "On m'avait promis un autre combat que ça. Moi le premier.",
    "Le docteur dit que ça va. Le miroir dira autre chose demain.",
    "Parle moins fort. La tête, tu comprends.",
  ],
  libre: [
    "Je regarde. Ça fait trois mois que je ne fais que regarder.",
    "Sans club, tu ne montes plus. Alors je viens sentir la cage.",
    "Mon manager ne rappelle plus. Me voilà au bord des cages des autres.",
    "Le gars qui vient de gagner, je l'ai battu il y a deux ans. Cherche l'erreur.",
    "Je m'entraîne seul dans un garage. Ça se voit tant que ça ?",
    "Tout le monde ici a un contrat sauf moi. Profite, ça met les gens de bonne humeur de me parler.",
  ],
  spectateur: [
    "Je viens voir ce que ma division prépare. On n'apprend rien chez soi.",
    "Mon tour viendra. Ce soir, je compte les trous dans leurs gardes.",
    "Le matchmaker m'a dit de rester visible. Alors je suis visible.",
    "J'étais censé être sur cette carte. Blessure. On ne me l'a pas rendue.",
  ],
};
const OUVERTURES_CONNU = [
  "Tiens — {salle}. Tu te déplaces, maintenant.",
  "Je me disais bien que je te verrais ici. {salle} voyage.",
  "{salle} au bord de la cage. Les gens commencent à connaître le nom.",
  "Encore toi. Les coachs qui se déplacent comme {salle}, ça se compte sur une main.",
];

function ouverture(ctx) {
  if ((ctx.contactV || 0) >= 30)
    return pioche(OUVERTURES_CONNU, ctx.jeton).replace("{salle}", ctx.salleNom || "ta salle")
      + " " + pioche(OUVERTURES[sit(ctx)], ctx.jeton + 1);
  return pioche(OUVERTURES[sit(ctx)], ctx.jeton);
}

/* ==================================================================== */
/* CE QUE TU PEUX LUI DIRE. Chaque choix a sa condition et son effet.   */
/* ==================================================================== */
function choixPour(ctx) {
  const c = [];
  if (ctx.aCombattu)
    c.push(ctx.aGagne
      ? { cle: "feliciter", lab: "« Beau travail ce soir. »" }
      : { cle: "relever", lab: "« Ce soir ne dit pas qui tu es. »" });
  c.push({ cle: "sonder", lab: "« Et toi, tu en es où ? »" });
  c.push({ cle: "inviter", lab: "« Viens passer une semaine à la salle. »" });
  if (ctx.libre || ctx.finContrat)
    c.push({ cle: "recruter", lab: "« J'ai une place pour toi — une vraie. »" });
  c.push({ cle: "partir", lab: "Le laisser" });
  return c;
}

/* ==================================================================== */
/* CE QU'IL REPOND. Le resultat du soir, le contact et TA reputation    */
/* choisissent la replique — et la replique ne ment jamais : le delta   */
/* de contact est celui qu'elle raconte.                                */
/* ==================================================================== */
const R = {
  feliciter_froid: [
    "Merci. On se connaît ?",
    "C'est le travail. Merci quand même.",
    "Merci. Tu coaches où, toi ?",
    "On me l'a dit vingt fois ce soir. Mais merci.",
  ],
  feliciter_chaud: [
    "Venant de toi, ça compte. Tu sais regarder un combat.",
    "Merci. Ton œil ne rate pas grand-chose, à ce qu'on dit.",
    "T'as vu la feinte avant le finish ? Toi tu l'as vue, je le sais.",
    "Merci. Un jour tu me diras ce que tu as vu que les autres ratent.",
  ],
  relever_froid: [
    "Ouais. C'est gentil. Laisse-moi digérer.",
    "Tout le monde dit ça au perdant. Merci quand même.",
    "Le prochain qui me console, je le prends en sparring.",
    "C'est ça. La semaine prochaine, plus personne ne s'en souviendra. Sauf moi.",
  ],
  relever_chaud: [
    "Toi, tu sais ce que c'est. Merci de ne pas me parler des juges.",
    "C'est le genre de phrase qu'on n'oublie pas. Merci.",
    "T'es le seul ce soir à me parler comme à un combattant et pas comme à un blessé.",
    "Garde-moi cette phrase. Je viendrai la chercher après ma prochaine victoire.",
  ],
  sonder_contrat: [
    "Sous contrat, ça roule. On verra à l'échéance.",
    "Il me reste des combats à honorer. Après, tout est ouvert.",
    "Je suis bien où je suis. Mais je note ceux qui demandent.",
    "L'orga me traite correctement. Le jour où ça change, les langues se délieront.",
  ],
  sonder_fin: [
    "Dernier combat du contrat. Après ce soir, j'écoute tout le monde.",
    "Mon contrat se finit. Mon manager fait le tour — toi aussi, on dirait.",
    "Libre dans un combat. Les vautours tournent déjà — toi tu demandes poliment, ça change.",
    "L'échéance arrive. Je regarde qui me regardait AVANT ce soir. Toi, par exemple.",
  ],
  sonder_libre: [
    "Nulle part. C'est bien le problème. Tu proposes quelque chose ?",
    "Libre. Le mot est joli, la réalité paie moins bien.",
    "Sans club depuis trois mois. Je m'entretiens, mais m'entretenir n'est pas progresser.",
    "Tu es la première personne à me poser la question ce soir. Ça répond, non ?",
  ],
  inviter_oui: [
    "Une semaine ? Pourquoi pas. J'ai besoin de nouveaux regards.",
    "On dit du bien de ton tapis. J'apporte mes gants.",
    "D'accord. Mais je viens pour travailler, pas pour visiter.",
    "Vendu. Si tes gars tiennent le rythme, je reviendrai peut-être.",
    "Une semaine, j'essaie. Préviens tes poids lourds que je ne retiens pas mes low kicks.",
    "Ça tombe bien, mon camp s'ennuie. Envoie l'adresse.",
  ],
  inviter_non_haut: [
    "J'ai un camp complet chez moi. Sans vouloir te vexer.",
    "Ta salle n'a encore personne à mon niveau. Reviens avec un nom.",
    "À ce niveau, je ne prête pas mes semaines. Fais tes preuves et rappelle-moi.",
    "Mon équipe déciderait pour moi — et elle dirait non. Rien contre toi.",
  ],
  inviter_non_froid: [
    "Je ne te connais pas. On se reparle quand ce sera le cas.",
    "Une semaine chez un inconnu ? Non. Mais reste dans le coin.",
    "On vient de se rencontrer. Les gants, ça se prête après la confiance, pas avant.",
    "Pas encore. Recroise-moi à deux ou trois soirées, et on en reparle sérieusement.",
  ],
  recruter_ecoute: [
    "Je t'écoute. Vraiment.",
    "C'est le premier vrai « oui » qu'on me tend depuis des mois.",
    "Une vraie place ? Assieds-toi. Enfin — reste debout, mais parle.",
    "Tu as trente secondes avant que mon manager rapplique. Fais-les compter.",
  ],
  partir: [
    "Bonne route, coach.",
    "On se recroisera.",
    "Salue ta salle pour moi.",
    "C'était le meilleur échange de ma soirée. La barre était basse, mais quand même.",
  ],
};

function repondre(cle, ctx) {
  const j = ctx.jeton + 7, contactV = ctx.contactV || 0;
  switch (cle) {
    case "feliciter":
      return { dit: pioche(contactV >= 20 ? R.feliciter_chaud : R.feliciter_froid, j),
               dContact: contactV >= 20 ? 6 : 4, effet: null };
    case "relever":
      return { dit: pioche(contactV >= 20 ? R.relever_chaud : R.relever_froid, j),
               dContact: contactV >= 20 ? 8 : 5, effet: null };
    case "sonder":
      return { dit: pioche(ctx.libre ? R.sonder_libre : ctx.finContrat ? R.sonder_fin : R.sonder_contrat, j),
               dContact: 2, effet: null };
    case "inviter": {
      if (!accepteInvitation(ctx))
        return { dit: pioche(ctx.niveauInter && !ctx.preuve ? R.inviter_non_haut
                             : (ctx.notoriete || 0) > (ctx.reputation || 0) + 15 ? R.inviter_non_haut
                             : R.inviter_non_froid, j),
                 dContact: 1, effet: null };
      return { dit: pioche(R.inviter_oui, j), dContact: 10, effet: "inviter" };
    }
    case "recruter":
      /* La replique ouvre la porte ; les GATES du recrutement (cas 143,
         budget d'approches) restent au jeu — pas deux exemplaires. */
      return { dit: pioche(R.recruter_ecoute, j), dContact: 3, effet: "recruter" };
    default:
      return { dit: pioche(R.partir, j), dContact: 0, effet: "partir" };
  }
}

/* Vient-il s'entrainer une semaine ? Ta reputation + ce qu'il sait de
   toi, contre sa notoriete. Deterministe — pas un tirage. Un contracte
   d'internationale exige la preuve (cas 143), meme pour une visite :
   a ce niveau on ne pretend pas ses gants a un inconnu. */
function accepteInvitation(ctx) {
  if (ctx.niveauInter && !ctx.preuve) return false;
  return (ctx.reputation || 0) + (ctx.contactV || 0) * 0.6 + 15 >= (ctx.notoriete || 0);
}

/* La visite : une semaine, et le sparring de SA division en profite. */
const VISITE_JOURS = 7;
const BOOST_VISITE = 1.2;

module.exports = { contactDe, poserContact, motContact, sit, ouverture,
                   choixPour, repondre, accepteInvitation,
                   VISITE_JOURS, BOOST_VISITE };
