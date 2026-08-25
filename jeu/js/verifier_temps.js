/** Banc du socle temps : les invariants + le test d'extensibilite —
 *  brancher un systeme bidon SANS toucher temps.js. */
const { Temps } = require("./temps.js");
let ok = 0, tot = 0;
const test = (nom, cond) => { tot++; if (cond) ok++; else console.log("ECHEC : " + nom); };

const t = new Temps();
test("depart lundi semaine 1", t.libelle() === "lundi — semaine 1");
t.avancer(1);
test("jour 1 = mardi", t.jourDeSemaine() === "mardi");
t.avancer(6);
test("jour 7 = lundi semaine 2", t.libelle() === "lundi — semaine 2");

// echeances : posees par un systeme, recues par un abonne, sans que le
// coeur comprenne quoi que ce soit
const recues = [];
t.abonner((jour, ech) => { for (const e of ech) recues.push([jour, e.type]); });
t.poser(t.jour + 3, "anniversaire", { qui: "Okonkwo" });   // evenement bidon
const idCamp = t.poser(t.jour + 5, "fin_de_camp", { camp: 42 });
t.poser(t.jour + 5, "pesee", null);                        // 2 le meme jour
t.avancer(3);
test("echeance du jour livree", recues.length === 1 && recues[0][1] === "anniversaire");
t.annuler(idCamp);
t.avancer(2);
test("echeance annulee non livree, l'autre oui",
     recues.length === 2 && recues[1][1] === "pesee");
test("les echeances passees sont consommees", t.echeances.length === 0);

// aVenir trie
t.poser(t.jour + 10, "b"); t.poser(t.jour + 2, "a");
const av = t.aVenir();
test("aVenir trie par jour", av[0].type === "a" && av[1].type === "b");

// avancer(7) = 7 notifications jour par jour (pas un saut)
let notifs = 0;
t.abonner(() => notifs++);
t.avancer(7);
test("passer une semaine notifie chaque jour", notifs === 7);

console.log(`${ok}/${tot} invariants du temps verifies`);
process.exit(ok === tot ? 0 : 1);
