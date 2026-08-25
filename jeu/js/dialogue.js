/**
 * dialogue.js — PARLER A UN COMBATTANT.
 *
 * Module natif JS, tenu par invariants (banc 23). Aucun fichier gele ni
 * porte n'est touche.
 *
 * ===================================================================
 * /!\ CE MODULE ABSORBE LE DIALOGUE DE mma_manager_v2.html
 * ===================================================================
 * Le prototype de v2 marchait et n'a PAS ete jete : ses trois approches
 * (secouer / rassurer / demander ou il en est) et sa lecture du profil
 * (discipline, fight IQ, agressivite, moral du moment) sont reprises
 * telles quelles. Ce qui est ajoute : une quatrieme approche (flatter,
 * avec son cout), la TRACE D'ENTENTE de chaque echange, et l'usure du
 * dialogue trop frequent.
 *
 * ===================================================================
 * /!\ CHAQUE ECHANGE LAISSE UNE TRACE, MEME NULLE
 * ===================================================================
 * "Botter en touche ne monte ni ne descend, et c'est exactement ce que ca
 * doit faire." Un echange rate coute, un echange juste rapporte peu, et
 * beaucoup de petits echanges justes finissent par faire une histoire.
 * ZERO EST UNE VALEUR, PAS UN OUBLI.
 *
 * ===================================================================
 * /!\ AUCUNE APPROCHE N'EST BONNE DANS L'ABSOLU
 * ===================================================================
 * Secouer un homme au moral bas le casse. Rassurer quelqu'un qui n'en a
 * pas besoin ne sert a rien. Flatter un type deja arrogant le tue — et
 * c'est le seul systeme du jeu ou LA MEME ACTION peut aider ou detruire
 * selon a qui elle s'adresse.
 */

const EN = require("./entente.js");

/** Le delai en dessous duquel reparler ne porte plus. */
/* /!\ UNE FOIS PAR SEMAINE ET PAR HOMME (Mael, 10/08 : "on pourrait leur
   parler qu'une fois par semaine ?"). Le delai existait deja mais il
   N'EMPECHAIT RIEN : il divisait l'effet par quatre et laissait parler.
   Un joueur pouvait donc revenir tous les jours et grappiller quand
   meme. Sept jours, et c'est un VERROU — l'ecran ne propose plus les
   approches tant que la semaine n'est pas passee. */
const LASSITUDE = 7;                 // jours

const APPROCHES = {
  secouer: {
    lab: "Le secouer",
    txt: "Vous lui dites que vous attendez plus de lui, et que le niveau au-dessus ne l'attendra pas.",
  },
  rassurer: {
    lab: "Le rassurer",
    txt: "Vous lui dites que vous voyez le travail, et que ça finit toujours par payer.",
  },
  ecouter: {
    lab: "Lui demander où il en est",
    txt: "Vous ne parlez pas d'entraînement. Vous lui demandez juste comment ça va.",
  },
  flatter: {
    lab: "Lui dire qu'il est au-dessus des autres",
    txt: "Vous lui dites ce qu'il a envie d'entendre : qu'à ce rythme, personne dans la salle ne tiendra avec lui.",
  },
  /* /!\ LES DIALOGUES DE SITUATION (Mael, 10/08 : "enrichir tous les
     dialogues et leur donner de vrais resultats"). Les quatre premiers
     sont GENERAUX — on peut les dire n'importe quand, a n'importe qui.
     Ceux-la ne s'ouvrent QUE quand la situation existe, et ils ont une
     consequence qui depasse l'entente : ils changent le combat suivant,
     ou ils engagent le coach. */
  relancer: {
    lab: "Le relever après sa défaite",
    txt: "Vous revenez sur le combat avec lui. Pas pour le consoler : pour lui montrer ce qui s'est passé.",
    situation: "defaite",
  },
  recadrer: {
    lab: "Lui remettre les pieds sur terre",
    txt: "Vous lui dites qu'il commence à se croire arrivé, et que ça se voit à l'entraînement.",
    situation: "grosse_tete",
  },
  promettre: {
    lab: "Lui promettre un combat",
    txt: "Vous lui dites que le prochain, c'est pour lui. /!\ Si vous ne tenez pas, il s'en souviendra.",
    situation: "sans_combat",
  },
};

/* ==== CINQUANTE REPONSES (Mael, 10/08) ==================================
   "Il nous en faut au moins 50 differentes, que j'aie toujours quelque
   chose de different, et branchees avec consequence."
   /!\ ELLES NE SONT PAS DECORATIVES. Chaque variante est CHOISIE par
   l'etat reel de l'homme — son moral, son caractere, sa serie, son age,
   son entente — et elle vient AVEC son effet (dMoral, dForme, trace
   d'entente). Deux hommes differents ne repondent pas pareil a la meme
   phrase, et le meme homme ne repond pas pareil selon le moment.
   /!\ ET AUCUNE NE MENT : si la phrase dit qu'il se braque, l'entente
   baisse pour de bon. */
const REPONSES = {
  secouer: [
    { si: (c) => c.moral < 0.72 && c.d >= 60,
      t: "Il baisse les yeux. « Je sais. Je vais corriger ça. » Et il le fera.",
      m: +0.04, f: +0.10, tr: "echange_juste" },
    { si: (c) => c.moral < 0.72,
      t: "Il encaisse sans rien dire. C'était peut-être le mauvais jour.",
      m: -0.10, f: +0.02, tr: "engueulade_defaite" },
    { si: (c) => c.agr >= 72,
      t: "« Vous croyez que je ne le sais pas ? » Il sort avant la fin de la phrase.",
      m: -0.08, f: +0.06, tr: "engueulade_defaite" },
    { si: (c) => c.serie >= 3,
      t: "« J'en ai gagné trois d'affilée. » Il n'a pas tort, et ça s'entend.",
      m: -0.05, f: +0.02, tr: "echange_rate" },
    { si: (c) => c.d >= 75,
      t: "Il hoche la tête, note ce que vous dites, et double sa séance du soir.",
      m: +0.02, f: +0.13, tr: "echange_juste" },
    { si: (c) => c.age >= 33,
      t: "« À mon âge on ne se secoue plus, on s'économise. » Il n'a pas tort non plus.",
      m: -0.02, f: +0.03, tr: "echange_neutre" },
    { si: (c) => c.age <= 21,
      t: "Il vous regarde comme si vous veniez de lui confier quelque chose. Il ne dormira pas.",
      m: +0.06, f: +0.09, tr: "echange_juste" },
    { si: (c) => c.ent < 35,
      t: "Il vous écoute comme on écoute un inconnu. Vous n'avez pas encore le crédit pour ça.",
      m: -0.09, f: +0.02, tr: "echange_rate" },
    { si: () => true,
      t: "Il serre la mâchoire. Le message est passé, le prix aussi.",
      m: -0.05, f: +0.08, tr: "echange_neutre" },
  ],
  rassurer: [
    /* /!\ RASSURER QUELQU'UN QUI VA BIEN NE SERT A RIEN — invariant du
       banc entente, et il a raison : c'est ce qui empeche le joueur de
       farmer du moral en repetant la meme phrase. La variante doit
       exister DANS la liste, sinon elle tombe sur le cas general. */
    { si: (c) => c.moral >= 1.05,
      t: "« Je sais, ça va. » Il n'avait pas besoin de vous aujourd'hui.",
      m: +0.01, f: 0, tr: "echange_neutre" },
    { si: (c) => c.moral < 0.70,
      t: "Il souffle. Il attendait que quelqu'un lui dise exactement ça.",
      m: +0.18, f: +0.06, tr: "echange_juste" },
    { si: (c) => c.serie === 0 && c.defaites > 0,
      t: "« Vous dites ça parce que j'ai perdu. » Mais il se tient plus droit en sortant.",
      m: +0.09, f: +0.02, tr: "echange_juste" },
    { si: (c) => c.agr >= 70,
      t: "« J'ai pas besoin qu'on me rassure. » Il le prend presque mal.",
      m: +0.02, f: 0, tr: "echange_neutre" },
    { si: (c) => c.iq >= 70,
      t: "« Je sais où j'en suis. Mais merci de le dire. » Il apprécie sans en avoir besoin.",
      m: +0.07, f: +0.02, tr: "echange_juste" },
    { si: (c) => c.ent >= 75,
      t: "Il sourit. Avec vous, il n'a plus besoin de faire semblant d'aller bien.",
      m: +0.14, f: +0.05, tr: "echange_juste" },
    { si: (c) => c.age <= 22,
      t: "Il a dix-neuf ans et un coach qui croit en lui. Ça se voit sur sa tête.",
      m: +0.15, f: +0.07, tr: "echange_juste" },
    { si: (c) => c.d >= 78,
      t: "« Je sais. Je continue. » Il n'a jamais eu besoin qu'on le pousse.",
      m: +0.08, f: +0.04, tr: "echange_juste" },
    { si: () => true,
      t: "« Ça fait du bien à entendre. » Il repart au sac.",
      m: +0.10, f: +0.03, tr: "echange_juste" },
  ],
  ecouter: [
    { si: (c) => c.moral < 0.68,
      t: "Il parle longtemps. Ce n'est pas du sport, c'est le reste — et c'est ça qui pesait.",
      m: +0.16, f: +0.04, tr: "echange_juste" },
    { si: (c) => c.ent >= 78,
      t: "Il vous raconte des choses qu'il ne raconte pas. Vous n'êtes plus seulement son coach.",
      m: +0.12, f: +0.03, tr: "echange_juste" },
    { si: (c) => c.ent < 35,
      t: "« Ça va. » Trois mots, et il retourne au sac. Vous n'avez pas encore ce droit-là.",
      m: +0.01, f: 0, tr: "echange_neutre" },
    { si: (c) => c.d < 45,
      t: "Il parle de tout sauf de l'entraînement. Vous comprenez pourquoi il progresse peu.",
      m: +0.05, f: -0.02, tr: "echange_neutre" },
    { si: (c) => c.serie >= 2,
      t: "« En ce moment tout roule. » Il n'y a rien à débloquer aujourd'hui.",
      m: +0.05, f: +0.02, tr: "echange_neutre" },
    { si: (c) => c.age >= 34,
      t: "Il parle de l'après. Pas maintenant, mais il y pense — et ça change comment on le prépare.",
      m: +0.08, f: 0, tr: "echange_juste" },
    { si: (c) => c.agr >= 72,
      t: "« On parle ou on s'entraîne ? » Il n'est pas venu pour ça.",
      m: +0.02, f: +0.01, tr: "echange_neutre" },
    { si: () => true,
      t: "Il parle un moment. Vous comprenez mieux ce qui le bloque en ce moment.",
      m: +0.07, f: +0.03, tr: "echange_juste" },
  ],
  flatter: [
    { si: (c) => c.agr >= 70 || c.d < 45,
      t: "Il acquiesce comme si c'était une évidence. Il se sait déjà au-dessus — et ça s'entend à l'entraînement.",
      m: +0.08, f: -0.03, tr: "flatterie" },
    { si: (c) => c.moral < 0.80,
      t: "Il n'en avait peut-être jamais entendu autant. Il se redresse.",
      m: +0.16, f: +0.07, tr: "flatterie" },
    { si: (c) => c.serie >= 3,
      t: "« Je sais. » Deux syllabes, et le vestiaire entier les a entendues.",
      m: +0.10, f: -0.05, tr: "flatterie" },
    { si: (c) => c.iq >= 72,
      t: "« Vous me dites ça pourquoi ? » Il n'aime pas qu'on le travaille.",
      m: +0.03, f: -0.01, tr: "echange_neutre" },
    { si: (c) => c.age <= 21,
      t: "Il gonfle la poitrine sans s'en rendre compte. Il va falloir surveiller ça.",
      m: +0.14, f: -0.02, tr: "flatterie" },
    { si: (c) => c.ent >= 78,
      t: "Il rit. « Vous me dites ça à moi ? » Entre vous, c'est devenu une blague.",
      m: +0.11, f: +0.02, tr: "flatterie" },
    { si: () => true,
      t: "Ça lui plaît, visiblement. Reste à voir ce qu'il en fera.",
      m: +0.09, f: 0, tr: "flatterie" },
  ],
  relancer: [
    { si: (c) => c.moral < 0.70,
      t: "Vous repassez le combat avec lui. À la fin il ne parle plus de la défaite, il parle du prochain.",
      m: +0.24, f: +0.06, tr: "echange_juste" },
    { si: (c) => c.agr >= 70,
      t: "« Je veux le revoir. » C'est tout ce qu'il retient — mais il a écouté le reste.",
      m: +0.16, f: +0.08, tr: "echange_juste" },
    { si: (c) => c.iq >= 68,
      t: "Il avait déjà tout analysé seul. Vous confirmez, et ça suffit à tourner la page.",
      m: +0.14, f: +0.04, tr: "echange_juste" },
    { si: (c) => c.age >= 33,
      t: "« À un moment il faudra savoir. » Il ne dit pas quoi. Vous savez quoi.",
      m: +0.06, f: 0, tr: "echange_juste" },
    { si: (c) => c.defaites >= 3,
      t: "C'est la troisième fois que vous avez cette conversation. Lui aussi l'a remarqué.",
      m: +0.05, f: +0.02, tr: "echange_neutre" },
    { si: () => true,
      t: "Il repart avec quelque chose à corriger plutôt qu'avec une défaite sur le dos.",
      m: +0.14, f: +0.05, tr: "echange_juste" },
  ],
  recadrer: [
    { si: (c) => c.agr >= 72,
      t: "« C'est moi qui gagne, je vous rappelle. » Il claque la porte. Il sera là demain.",
      m: -0.14, f: +0.03, tr: "engueulade_defaite" },
    { si: (c) => c.iq >= 70,
      t: "Il ne répond pas tout de suite. « Vous avez raison. » Ça lui coûte de le dire.",
      m: -0.05, f: +0.08, tr: "echange_rate" },
    { si: (c) => c.d < 45,
      t: "« Ouais ouais. » Il n'a rien entendu. Vous le reverrez.",
      m: -0.06, f: +0.01, tr: "echange_rate" },
    { si: (c) => c.ent >= 75,
      t: "Venant de vous, ça porte. Il ne discute même pas.",
      m: -0.03, f: +0.09, tr: "echange_rate" },
    { si: (c) => c.serie >= 4,
      t: "Quatre victoires de suite et on vient lui parler comme ça. Il ne comprend pas — et c'est bien le problème.",
      m: -0.12, f: +0.04, tr: "engueulade_defaite" },
    { si: () => true,
      t: "Il ne dit rien. Le lendemain, il est le premier à la salle.",
      m: -0.04, f: +0.06, tr: "echange_rate" },
  ],
  promettre: [
    { si: (c) => c.moral < 0.72,
      t: "« Vous me le promettez ? » Il a besoin d'y croire. Maintenant vous êtes tenu.",
      m: +0.24, f: +0.05, tr: "affiche_voulue" },
    { si: (c) => c.ent < 40,
      t: "« On verra. » Il ne vous croit pas encore. À vous de lui donner tort.",
      m: +0.10, f: +0.02, tr: "affiche_voulue" },
    { si: (c) => c.agr >= 70,
      t: "« Enfin. » Il attendait ça depuis des semaines et il ne le cachait pas.",
      m: +0.22, f: +0.06, tr: "affiche_voulue" },
    { si: (c) => c.age >= 33,
      t: "« Il ne m'en reste pas beaucoup. Ne me le faites pas attendre. »",
      m: +0.18, f: +0.03, tr: "affiche_voulue" },
    { si: (c) => c.serie >= 3,
      t: "« Un vrai, cette fois. » Il ne veut plus des gars qu'on lui donne pour gagner.",
      m: +0.20, f: +0.05, tr: "affiche_voulue" },
    { si: () => true,
      t: "Il vous regarde différemment en sortant. Maintenant il attend.",
      m: +0.20, f: +0.04, tr: "affiche_voulue" },
  ],
};

/** La premiere variante dont la condition est vraie. */
function choisirReponse(app, ctx) {
  const liste = REPONSES[app];
  if (!liste) return null;
  for (const r of liste) { try { if (r.si(ctx)) return r; } catch (e) {} }
  return liste[liste.length - 1];
}

/**
 * Parler. Rend la reaction, le mouvement d'entente, et les effets sur le
 * moral et la forme.
 *
 * @param {object} f      la fiche du combattant (f.mental lu, f.mental.discipline
 *                        eventuellement MODIFIE par la flatterie)
 * @param {object} etat   { entente, moral (0-1,3), forme, dernierEchange (jour) }
 * @param {string} app    cle d'APPROCHES
 * @param {number} jour
 */
function parler(f, etat, app, jour) {
  const a = APPROCHES[app];
  let effet = null;
  if (!a) throw new Error(`dialogue.js : approche inconnue "${app}"`);
  const d = f.mental.discipline, iq = f.mental.fight_iq, agr = f.mental.aggression;
  const moral = etat.moral !== undefined ? etat.moral : 1.0;

  // /!\ LA LASSITUDE : reparler tous les jours ne construit rien. Ce
  // n'est pas une limite posee pour brider — c'est qu'un homme a qui on
  // parle sans arret finit par ne plus ecouter.
  const recent = etat.dernierEchange !== undefined
    && jour - etat.dernierEchange < LASSITUDE;

  let dMoral = 0, dForme = 0, txt = "", trace = "echange_neutre";

  /* /!\ LES CINQUANTE REPONSES SONT LE SEUL CHEMIN (10/08). L'ancien
     corps enchainait des if/else avec 17 phrases en dur : ajouter des
     variantes sans le remplacer les aurait laissees MORTES, comme
     `sortirApres` l'a ete pendant tout un chantier. Ici on CHOISIT dans
     REPONSES, et la variante apporte son texte ET ses effets. */
  const ctx = {
    moral, d, agr, iq: f.mental.fight_iq,
    serie: etat.serie || 0, defaites: etat.defaites || 0,
    age: etat.age || 26,
    ent: (etat.entente && etat.entente.valeur !== undefined) ? etat.entente.valeur : 50,
  };
  const rep = choisirReponse(app, ctx);
  if (rep) { txt = rep.t; dMoral = rep.m; dForme = rep.f; trace = rep.tr; }
  if (app === "recadrer") { f.mental.discipline = Math.min(99, d + 6); effet = "recadre"; }
  else if (app === "promettre") effet = "promesse";
  else if (app === "relancer") effet = "releve";
  else if (app === "ecouter") etat.observations = Math.min(10, (etat.observations || 0) + 2);

  // La lassitude ecrase l'effet, sans l'inverser.
  if (recent) {
    dMoral *= 0.25; dForme *= 0.25;
    if (trace === "echange_juste") trace = "echange_neutre";
    txt += " (Vous lui avez déjà parlé il y a peu — ça glisse.)";
  }

  const mouvement = EN.bouger(etat.entente, trace, f);

  etat.moral = Math.max(0.45, Math.min(1.30, moral + dMoral));
  etat.forme = Math.max(0.55, Math.min(1.25, (etat.forme !== undefined ? etat.forme : 1) + dForme));
  etat.dernierEchange = jour;

  return { approche: app, intro: a.txt, texte: txt, effet,
           dMoral, dForme, trace, mouvement,
           // /!\ LA GROSSE TETE SE VOIT : on rend le cout pour que
           // l'ecran puisse le dire sans afficher un chiffre.
           cout: mouvement.cout && mouvement.cout.discipline
             ? "Il se croit un peu plus arrivé qu'hier." : null };
}

/**
 * L'avis du coach sur l'etat de la relation — EN MOTS, jamais en chiffre
 * (meme regle que la relation aux orgas et le potentiel cache).
 */
function avis(etat) {
  const p = EN.lire(etat.entente.valeur);
  const n = etat.entente.histoire.length;
  if (n < 4) return "Vous ne vous connaissez pas encore vraiment.";
  return p.mot.charAt(0).toUpperCase() + p.mot.slice(1) + ".";
}

/**
 * CE QU'ON PEUT LUI DIRE AUJOURD'HUI. Les quatre approches generales sont
 * toujours la ; les dialogues de situation n'apparaissent QUE si la
 * situation existe vraiment — on ne releve pas un homme qui vient de
 * gagner, on ne promet pas un combat a un homme qui en a deja un.
 */
function ouvertes(f, ctx = {}) {
  const out = [];
  for (const [cle, a] of Object.entries(APPROCHES)) {
    if (!a.situation) { out.push(cle); continue; }
    if (a.situation === "defaite" && ctx.vientDePerdre) out.push(cle);
    if (a.situation === "grosse_tete"
        && (f.mental.aggression >= 68 || f.mental.discipline < 50)
        && (ctx.serie || 0) >= 2) out.push(cle);
    if (a.situation === "sans_combat" && !ctx.combatPrevu && ctx.org) out.push(cle);
  }
  return out;
}

module.exports = { APPROCHES, LASSITUDE, parler, avis, ouvertes };
