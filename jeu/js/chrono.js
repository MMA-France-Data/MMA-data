/**
 * chrono.js — RECALER L'HORLOGE DE L'ECRAN SUR CELLE DU MOTEUR.
 *
 * LE PROBLEME
 * traducteur.py etale les lignes d'un round sur toute sa duree :
 *     pas = secondes_round / nombre_de_lignes
 * Un round qui s'arrete a 0:41 est donc dilate jusqu'a 5:00, et TOUTE
 * finition s'affiche a la sonnerie. Mesure : sur les finitions de l'affiche
 * Okonkwo/Renaud, l'ecran annoncait 5:00 la ou le moteur avait 0:29, 0:30,
 * 0:41, 2:46... C'est la regle 7 au sens strict : une heure que rien n'a
 * tiree.
 *
 * LA DECOUVERTE
 * Le moteur n'a JAMAIS perdu cette information. simuler_round rend
 * [vainqueur, pyRound(t)] ou t est un temps en SECONDES (`while (t < duree)`,
 * duree = 300). simuler_combat l'ecrit au log :
 *     >>> Okonkwo gagne au round 3 (échange 166)
 * Le libelle "echange" est un NOM TROMPEUR pour un chronometre. 166 n'est pas
 * le 166e echange, c'est la 166e seconde du round.
 * /!\ NE PAS corriger ce libelle dans engine.js : la ligne est comparee au
 * caractere pres contre engine.py, qui est gele. Le nom reste faux, le
 * carnet dit pourquoi, et le code le lit correctement.
 *
 * LA CORRECTION
 * Aucun module gele n'est touche. On post-traite la sortie du traducteur :
 * le round de la fin est REDUIT de sa duree supposee (300 s) a sa duree
 * reelle. Les rounds precedents ne bougent pas — ils sont bien alles au
 * bout. C'est une homothetie, pas une reecriture : l'ordre des etapes et
 * leur contenu sont inchanges, seule l'echelle du dernier round change.
 *
 * CE QUE CA NE CORRIGE PAS (et qu'il faut savoir)
 * A l'interieur d'un round, la repartition reste UNIFORME : le moteur ne
 * date pas ses echanges un par un, il ne donne que le total. Un round qui
 * dure 166 s montre donc ses 40 lignes reparties regulierement sur 166 s.
 * L'heure de la FIN est desormais juste ; l'heure de chaque coup reste une
 * approximation honnete. Pour aller plus loin il faudrait que le moteur
 * date chaque ligne — donc modifier engine.py, donc rouvrir la bascule.
 */

/**
 * @param {object[]} etapes   sortie de traducteur.traduire (champ .t absolu)
 * @param {number} sec_round  duree nominale d'un round (300)
 * @param {number} round_fin  round ou le combat s'arrete (1-indexe)
 * @param {number} sec_fin    secondes ecoulees dans ce round, du moteur
 * @returns {object[]} de NOUVELLES etapes, recalees
 */
function recaler(etapes, sec_round, round_fin, sec_fin) {
  if (!Array.isArray(etapes)) throw new Error("chrono.js : etapes attendues");
  if (!(sec_fin >= 0) || sec_fin > sec_round)
    throw new Error(`chrono.js : sec_fin hors du round (${sec_fin}/${sec_round})`);

  // /!\ Ne PAS prendre (round_fin-1)*sec_round comme debut du round : le
  // traducteur avance par `pas = 300/n` repete n fois, et l'accumulation
  // flottante laisse la frontiere a 599.9999... Une etape tombait alors du
  // mauvais cote et la fin s'affichait une seconde trop tot (1:18 pour 1:19,
  // attrape au banc). On lit donc le debut SUR LES ETAPES elles-memes, et on
  // etire le segment [premiere, derniere] sur exactement sec_fin secondes.
  const iRd = etapes.findIndex((e) => e.rd === round_fin);
  const debut = iRd >= 0 ? etapes[iRd].t
              : (round_fin === 1 && etapes.length ? etapes[0].t
                                                  : (round_fin - 1) * sec_round);
  const derniere = etapes.length ? etapes[etapes.length - 1].t : debut;
  if (derniere <= debut) return etapes.slice();

  const ancre = (round_fin - 1) * sec_round;   // ou le round DOIT commencer
  const facteur = sec_fin / (derniere - debut);

  return etapes.map((e) => {
    if (typeof e.t !== "number" || e.t < debut) return e;
    const dans = Math.min(sec_fin, (e.t - debut) * facteur);
    return Object.assign({}, e, { t: Math.round((ancre + dans) * 10) / 10 });
  });
}

/** "R3 2:46" — l'heure de la fin en langage de fiche. */
function heure(round, secondes) {
  const m = Math.floor(secondes / 60), s = Math.floor(secondes % 60);
  return `R${round} ${m}:${String(s).padStart(2, "0")}`;
}

module.exports = { recaler, heure };
