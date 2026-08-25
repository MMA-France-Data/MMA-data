/**
 * temps.js — la colonne vertébrale du jeu de gestion : le temps.
 *
 * VOLONTAIREMENT PAUVRE (decision du 08/08). Le calendrier ne sait PAS ce
 * qu'est un camp, un contrat, une ligue : il connait trois choses et rien
 * d'autre :
 *   1. le JOUR courant (unite atomique — la semaine est une VUE, jour/7,
 *      parce qu'on s'entraine sur un truc lundi et un autre mardi) ;
 *   2. des ECHEANCES : {jour, type, donnees} — il ne comprend pas `type`,
 *      c'est le systeme qui l'a posee qui le comprendra ;
 *   3. des ABONNES : chaque systeme branche recoit chaque jour ecoule, avec
 *      les echeances de ce jour, et se debrouille.
 * La pause et le defilement (jour par jour, vitesse, "passer une semaine")
 * sont de la PRESENTATION : l'interface appelle avancer(1) en rythme, ou
 * avancer(7), ou n'appelle pas. Le coeur n'a pas d'horloge.
 *
 * TEST D'EXTENSIBILITE (a verifier le jour des camps) : si brancher un
 * nouveau systeme oblige a toucher UNE ligne de ce fichier, la base etait
 * mal concue.
 */

const JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi",
                       "vendredi", "samedi", "dimanche"];

class Temps {
  constructor(jourDepart = 0) {
    this.jour = jourDepart;          // compteur absolu, demarre a 0
    this.echeances = [];             // {jour, type, donnees}
    this.abonnes = [];               // fonctions (jour, echeancesDuJour) => void
    this._prochainId = 1;
  }

  // ---- vues (la semaine n'existe pas dans l'etat, elle se calcule) ----
  semaine() { return Math.floor(this.jour / 7) + 1; }
  jourDeSemaine() { return JOURS_SEMAINE[this.jour % 7]; }
  libelle() { return `${this.jourDeSemaine()} — semaine ${this.semaine()}`; }

  // ---- echeances ----
  poser(jour, type, donnees = null) {
    const id = this._prochainId++;
    this.echeances.push({ id, jour, type, donnees });
    return id;                       // pour pouvoir annuler
  }
  annuler(id) {
    this.echeances = this.echeances.filter(e => e.id !== id);
  }
  aVenir(horizonJours = 28) {
    return this.echeances
      .filter(e => e.jour >= this.jour && e.jour < this.jour + horizonJours)
      .sort((a, b) => a.jour - b.jour);
  }

  // ---- abonnement ----
  abonner(fn) { this.abonnes.push(fn); return fn; }

  // ---- LA seule operation du temps ----
  avancer(nJours = 1) {
    for (let i = 0; i < nJours; i++) {
      this.jour += 1;
      const duJour = this.echeances.filter(e => e.jour === this.jour);
      this.echeances = this.echeances.filter(e => e.jour !== this.jour);
      for (const abonne of this.abonnes) abonne(this.jour, duJour);
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Temps, JOURS_SEMAINE };
}
