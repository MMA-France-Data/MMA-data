/**
 * offres.js — CE QUE L'ORGANISATION TE PROPOSE, ET CE QUE TU DEMANDES.
 *
 * Module natif JS, tenu par invariants (banc 21). Aucun fichier gele ni
 * porte n'est touche. C'est LA PIECE QUI TRANSFORME UN COMBAT EN SAISON :
 * sans elle, le joueur a un combat et la saison s'arrete (avertissement du
 * carnet, 09/08).
 *
 * ===================================================================
 * /!\ TROIS CHEMINS VERS UN COMBAT, ET UN SEUL MOTEUR DERRIERE
 * ===================================================================
 * 1. L'OFFRE : l'orga te propose un adversaire pour sa prochaine carte.
 *    Message date, DELAI DE REPONSE (7 jours), adversaire nomme avec sa
 *    trace consultable. Tu vois la date du combat, donc le camp restant.
 * 2. LA DEMANDE (validee par Mael) : ton gars est remis, tu demandes un
 *    combat. Meme mecanique que les NPC — tu entres dans le vivier du
 *    matchmaker, et ce qu'on te trouve depend de ta relation.
 * 3. LA SOLLICITATION EN COURTE PREPARATION : un combattant se blesse,
 *    l'orga t'appelle. Ton gars n'est PAS remis. Accepter applique
 *    reellement appliquerFraicheur — cardio et menton en moins — et te
 *    fait un credit (+15). Refuser coute (-8, -20 au deuxieme d'affilee).
 *    CRAMER TON GARS OU CRAMER TON CREDIT.
 *
 * ===================================================================
 * /!\ L'OFFRE NE MENT JAMAIS (regle 7)
 * ===================================================================
 * Bourse, place sur la carte et durete de l'adversaire sortent de
 * classement.bourse() et relation.faveurs() — pas d'un habillage. Ce qui
 * est ecrit dans le message est ce que le combat paiera.
 * ET ELLE NE REVELE PAS LE NIVEAU DE L'ADVERSAIRE : elle porte sa TRACE
 * (bilan, serie, notoriete, rang, empreintes). Le joueur scoute, il ne
 * lit pas une note.
 */

const CL = require("./classement.js");
const R = require("./relation.js");
const C = require("./cartes.js");

/** Le delai de reponse, en jours de jeu. Passe ce delai, l'offre expire —
 *  et une offre expiree compte comme un REFUS : ne pas repondre est une
 *  reponse. */
const DELAI = 7;

/** Il faut du temps entre l'acceptation et le combat : c'est le camp. En
 *  dessous, l'orga sait qu'elle demande une faveur (sollicitation). */
const CAMP_NORMAL = 42;                      // six semaines, le camp du GDD

/**
 * Fabrique une offre. Ne DECIDE rien : elle decrit ce qui est propose.
 * @param {object} m      le monde (vivier)
 * @param {object} etatR  l'etat de relation (relation.etatDepart())
 * @param {object} combattant  fiche legere de TON combattant
 *   { id, nom, division, rang, champion, notoriete, vie }
 * @param {string} org
 * @param {number} jour        aujourd'hui
 * @param {number} jourCombat  la date de la carte
 * @param {object} [opts] { sollicitation: true } pour une courte preparation
 */
function fabriquer(m, etatR, combattant, org, jour, jourCombat, opts = {}) {
  const f = R.faveurs(etatR, org);
  /* /!\ LA CIBLE VOYAGE DANS opts (10/08) — le 7e argument etait DEJA
     pris par opts { sollicitation }. L'ajouter en 7e position aurait
     ecrase la courte preparation : deux sens pour un meme argument, la
     faute classique. */
  /* /!\ LA DURETE PUNIT, LA MONTEE RECOMPENSE — on additionne les deux :
     un homme mal vu monte parce qu'on le jette en pature, un homme bien
     vu monte parce qu'on lui ouvre la porte. Le classement vise est le
     meme ; la bourse et la place sur la carte, non. */
  /* /!\ DEUX EFFETS, PAS UNE SOMME (corrige par le banc, 10/08) : les
     additionner envoyait un #5 affronter le #1 dans les deux cas, et la
     distinction disparaissait. Ils ne se cumulent pas, ILS S'EXCLUENT :
       - MAL VU (durete >= 3) : on te jette en pature, tres haut, mal paye ;
       - BIEN VU (montee 1-2) : on te MONTE d'un ou deux rangs, bien paye.
     La regle de Mael est respectee au chiffre pres : "1 rang de plus, a 2
     rangs si tu as vraiment une bonne entente". */
  const saut = f.durete >= 3 ? f.durete : (f.montee || 0);
  const adversaire = choisirAdversaire(m, combattant, org, saut, jour, opts.cible, opts);
  if (!adversaire) return null;

  // La place : ce que ta notoriete vend, plus ce que la relation t'offre.
  const rangs = ["pre_prelims", "prelims", "main_card", "co_main", "main_event"];
  let i = combattant.notoriete >= 45 ? 2 : combattant.notoriete >= 20 ? 1 : 0;
  i = Math.min(rangs.length - 1, i + f.place);
  const place = rangs[i];

  // /!\ LE CONTRAT FAIT FOI (Mael, 10/08 : caisse +1 606 € sur une
  // bourse contractuelle de 700). L'offre calculait SA bourse au bareme
  // du marche pendant que le contrat en fixait une autre — deux
  // exemplaires de la meme donnee. Un homme SOUS CONTRAT est paye a sa
  // bourse contractuelle ; le bareme du marche ne sert qu'aux hommes
  // sans clause (et aux bancs qui la testent).
  if (combattant.vie && combattant.vie.bourseContrat) {
    const montantC = combattant.vie.bourseContrat;
    var bourseFixee = montantC;
  }
  // La bourse : celle du bareme, modulee par la relation. Rien d'invente.
  const [base] = CL.bourse(org, combattant.rang, combattant.champion,
                           combattant.notoriete);
  const montant = typeof bourseFixee !== "undefined"
    ? bourseFixee : Math.round(base * f.bourse);

  const camp = jourCombat - jour;
  const fr = C.fraicheur(combattant.vie, jourCombat);

  return {
    org, jour, expire: jour + DELAI, jourCombat, camp,
    /* /!\ TOUT PASSE PAR LUI (Mael) : "c'est lui qui vient te proposer un
       combat". Une offre n'est plus une notification d'organisation, c'est
       un homme qui appelle. */
    matchmaker: CL.matchmakerDe(org).nom,
    /* Deux hommes de la meme salle : le jeu doit le dire et demander UNE
       reponse pour les deux. */
    interne: !!(adversaire.salle && combattant.salle),
    montee: f.montee || 0,
    combattant: combattant.id, adversaire: adversaire.id,
    place, titre: !!(combattant.champion || adversaire.champion),
    bourse: montant, victoire: montant,          // garanti + prime de victoire
    // /!\ CE QUE TU SAURAS DE LUI : sa TRACE, jamais sa note.
    trace: {
      nom: adversaire.nom, pays: adversaire.pays,
      rang: adversaire.rang, champion: !!adversaire.champion,
      bilan: Object.assign({}, adversaire.bilan),
      notoriete: adversaire.notoriete,
      empreintes: adversaire.vie ? adversaire.vie.empreintes.slice(-2) : [],
      dernier: adversaire.vie ? adversaire.vie.dernier : null,
    },
    // La meforme AU JOUR DU COMBAT, calculee, pas devinee.
    fraicheur: Math.round(fr * 100) / 100,
    sollicitation: !!opts.sollicitation,
    // /!\ L'AVERTISSEMENT SORT DU CALCUL, PAS D'UN TEXTE POSE A LA MAIN.
    avertissement: fr < 1
      ? (fr < 0.75 ? "Il n'est pas remis de son dernier combat. Ça se verra."
                   : "Il sort à peine de camp de récupération.")
      : (camp < CAMP_NORMAL ? "Le camp sera court." : null),
  };
}

/**
 * L'adversaire qu'on te trouve. /!\ LA DURETE VIENT DE LA RELATION : mal
 * vu, on te propose plus fort que toi (des pieges) ; bien vu, on te
 * propose juste. Le couloir de cartes.js s'applique quand meme — on ne
 * jette pas un non-classe au top 5.
 */
function choisirAdversaire(m, combattant, org, durete, jour, cible, opts = {}) {
  /* /!\ LA CIBLE DU JOUEUR (Mael, 10/08 : "Cibler comme adversaire").
     Elle N'OBLIGE PAS l'organisation : elle demande. On ne la retient que
     si l'homme est du bon roster, de la bonne division, disponible, et
     pas la revanche immediate — sinon le ciblage deviendrait un menu
     deroulant et le matchmaking ne voudrait plus rien dire. */
  if (cible !== undefined && cible !== null) {
    const c = m.pros.get(cible);
    /* /!\ LA CIBLE NE COURT-CIRCUITE PAS LES REFUS INTERNES (10/08) : le
       raccourci rendait l'homme vise AVANT la boucle, donc un duel entre
       coequipiers deja refuse revenait quand meme. Un refus doit tenir
       par TOUS les chemins, pas seulement par le principal. */
    const dejaRefuse = c && c.salle && combattant.salle
      && (opts.refusInternes || []).includes(c.id);
    if (c && !dejaRefuse && c.org === org && c.division === combattant.division
        && c.id !== combattant.id && jour >= (C.vitaliser(m, c).dispo || 0)
        && !(combattant.vie && combattant.vie.advPrec === c.id))
      return c;
  }
  // /!\ LA DIRECTION DE L'ECHELLE (arbitrage Mael, 10/08) : "tu gagnes,
  // tu affrontes un mieux classe ; tu perds, tu regardes derriere."
  // La serie dit la direction (serie > 0 = il vient de gagner), la
  // durete du matchmaker dit de COMBIEN on ose viser au-dessus.
  const echelle = CL.echelleDe(m, org, combattant.division);
  const moi = echelle.indexOf(combattant.id);
  const versLeHaut = (combattant.bilan.serie || 0) > 0 || combattant.bilan.v + combattant.bilan.d === 0;
  // /!\ AUCUNE REVANCHE IMMEDIATE (Mael, 10/08 : "je me bats 7 fois
  // d'affilee contre le meme adversaire"). Le choix etait DETERMINISTE
  // (le plus proche au rang, premier minimum) et la victoire mettait
  // l'adversaire au repos ~35 jours — pile la fenetre de l'offre
  // suivante : le meme homme revenait a chaque fois. Le monde a la regle
  // (banc cartes : "aucune revanche immediate sur toute l'annee"), les
  // offres du joueur ne l'avaient pas. Deux passes : d'abord SANS le
  // dernier adversaire (dans les deux sens), et seulement s'il n'existe
  // personne d'autre, on l'autorise — une revanche vaut mieux que pas de
  // combat du tout.
  const dernier = combattant.vie ? combattant.vie.advPrec : undefined;
  const passe = (sansRevanche) => {
    let best = null, bestD = Infinity;
    for (const id of m.rosters[org][combattant.division] || []) {
      if (id === combattant.id) continue;
      const l = m.pros.get(id);
      if (!l) continue;
      /* /!\ UN COEQUIPIER RESTE POSSIBLE — MAIS C'EST TON CHOIX (arbitrage
         Mael, 10/08 : "ils peuvent accepter aussi, faut que ça propose
         aux deux — mais je peux refuser et ça me proposera pas ce combat
         en boucle"). Le probleme n'etait pas l'appariement : c'est qu'UN
         SEUL des deux recevait l'offre, l'autre montait dans la cage
         sans avoir rien accepte. L'offre est donc MARQUEE `interne` : le
         jeu la presente comme engageant les deux, et un refus l'efface
         durablement. */
      if (l.salle && combattant.salle && (opts.refusInternes || []).includes(l.id)) continue;
      C.vitaliser(m, l);
      if (jour < l.vie.dispo) continue;              // il n'est pas remis
      if (sansRevanche && (id === dernier || l.vie.advPrec === combattant.id)) continue;
      const lui = echelle.indexOf(id);
      if (moi >= 0 && lui >= 0) {
        const bonneDirection = versLeHaut ? lui < moi : lui > moi;
        const ecart = Math.abs(lui - moi);
        if (ecart > 8 + durete * 2) continue;        // couloir de saut
        // /!\ LA DIRECTION vient de la serie, LA PROFONDEUR de la durete
        // (banc : "mal vu = adversaire plus dur"). Bien vu, on vise juste
        // devant ; mal vu, le matchmaker t'envoie chercher plus haut.
        const vise = versLeHaut ? Math.max(0, moi - 1 - durete * 2)
                                : Math.min(echelle.length - 1, moi + 1 + durete);
        const d = Math.abs(lui - vise) + (bonneDirection ? 0 : 40);
        if (d < bestD) { bestD = d; best = l; }
      } else {
        const rc = l.rang !== null ? l.rang : CL.NON_CLASSE;
        const rl = combattant.rang !== null ? combattant.rang : CL.NON_CLASSE;
        const d = Math.abs(rc - rl) + 20;
        if (d < bestD) { bestD = d; best = l; }
      }
    }
    return best;
  };
  return passe(true) || passe(false);
}

/**
 * REPONDRE. C'est ici que la relation bouge — et nulle part ailleurs.
 * @returns {object} { accepte, mouvement, raison }
 */
function repondre(etatR, offre, oui, jour) {
  if (jour > offre.expire && oui)
    return { accepte: false, mouvement: R.bouger(etatR, offre.org, "refus"),
             raison: "L'offre a expiré." };
  if (!oui || jour > offre.expire) {
    const m = R.bouger(etatR, offre.org, "refus");
    return { accepte: false, mouvement: m,
             raison: jour > offre.expire ? "Tu n'as pas répondu à temps." : null };
  }
  // /!\ ACCEPTER UNE SOLLICITATION EST LE VRAI CREDIT : +15 au lieu de +5.
  const m = R.bouger(etatR, offre.org,
                     offre.sollicitation ? "depannage" : "acceptation");
  return { accepte: true, mouvement: m, raison: null };
}

/**
 * APRES LE COMBAT : les entrees de relation qui dependent de ce que le
 * moteur a tire. /!\ AUCUNE N'EST DECRETEE — finish et spectacle se
 * lisent dans les empreintes (regle 7).
 * @returns {object[]} les mouvements appliques, dans l'ordre
 */
function apresCombat(etatR, org, { gagne, methode, empMoi, empLui, peseeLoupee }) {
  const mouvements = [];
  if (peseeLoupee) mouvements.push(R.bouger(etatR, org, "pesee_loupee"));
  if (gagne && methode && methode !== "DÉCISION")
    mouvements.push(R.bouger(etatR, org, "finish"));
  if (!gagne) mouvements.push(R.bouger(etatR, org, "defaite"));
  if (empMoi && empLui && R.estSpectacle(empMoi, empLui))
    mouvements.push(R.bouger(etatR, org, "spectacle"));
  return mouvements;
}

/**
 * TA DEMANDE DE COMBAT (validee par Mael). Elle n'aboutit que si ton gars
 * est remis — on ne demande pas un combat pour un homme couche — et ce
 * qu'on te trouve depend de ta relation, comme pour une offre.
 * @returns {object|null} l'offre qui en resulte, ou null avec la raison
 */
function demander(m, etatR, combattant, org, jour, jourCombat) {
  C.vitaliser(m, combattant);
  if (jour < combattant.vie.dispo)
    return { refus: "Il n'est pas encore remis de son dernier combat.",
             remisLe: combattant.vie.dispo };
  const o = fabriquer(m, etatR, combattant, org, jour, jourCombat);
  if (!o) return { refus: "Personne de disponible à sa catégorie pour cette carte." };
  return o;
}

module.exports = { DELAI, CAMP_NORMAL, fabriquer, choisirAdversaire,
                   repondre, apresCombat, demander };
