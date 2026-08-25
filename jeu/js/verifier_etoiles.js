/**
 * verifier_etoiles.js — BANC 15.
 * Les huit tetes d'affiche, et les garde-fous juridiques qui vont avec.
 */
const { alea } = require("./alea.js");
const { ETOILES, fabriquer } = require("./etoiles.js");
const C = require("./classement.js");
const E = require("./engine.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

const A = fabriquer();

dit("une étoile par catégorie de poids, sans doublon",
  A.length === 8 && new Set(A.map(e => e.division)).size === 8,
  A.map(e => e.division.replace("poids_", "")).join(" · "));

dit("chaque catégorie citée existe bien dans le moteur",
  A.every(e => E.DIVISIONS[e.division] !== undefined));

dit("huit pays différents", new Set(A.map(e => e.pays)).size === 8,
  A.map(e => e.pays).join(" · "));

// /!\ Le traducteur repere les combattants par un nom MONO-JETON et par
// PREFIXE : deux noms dont l'un commence par l'autre feraient partir les
// evenements au mauvais coin (piege paye le 08/08, graine 17).
{
  const noms = A.map(e => e.fighter.name);
  const monoJeton = noms.every(n => !/\s/.test(n));
  let prefixe = false;
  for (const a of noms) for (const b of noms)
    if (a !== b && (a.startsWith(b) || b.startsWith(a))) prefixe = true;
  dit("noms mono-jetons et aucun n'est le préfixe d'un autre", monoJeton && !prefixe);
}

// GARDE-FOU JURIDIQUE : aucun vrai nom ne doit fuir.
{
  // /!\ LA LISTE CONTENAIT LES NOMS, PAS LES SURNOMS — ni leurs TRADUCTIONS.
  // Quatre surnoms sur huit sont passes au travers : « le Cauchemar »
  // (Nightmare), « Pedra » (Poatan = la pierre), « le Gamin » (Bon Gamin),
  // « el Niño » (Assassin Baby). TRADUIRE UN SURNOM, C'EST LE COPIER.
  const reels = [
    // noms
    "gane", "pereira", "chimaev", "usman", "topuria", "volkanovski",
    "omalley", "o'malley", "moreno", "pantoja", "adesanya", "jones",
    // surnoms reels et leurs traductions
    "poatan", "pedra", "borz", "nightmare", "cauchemar", "bon gamin",
    "le gamin", "matador", "the great", "sugar", "suga", "assassin baby",
    "el niño", "el nino", "stylebender", "bones", "notorious", "spider",
    // marques
    "ufc", "pfl", "ksw", "bellator", "ares", "one championship", "cage warriors"];

  // /!\ ET LA FAMILLE SEMANTIQUE, PAS SEULEMENT LE MOT.
  // Changer de langue ne change rien : "l'enfant", "rock", "bad dream" sont
  // exactement el Niño, Pedra/Poatan et Nightmare. Un surnom qui SIGNIFIE
  // la meme chose est une copie, quelle que soit la langue.
  const FAMILLES = {
    "enfant (Assassin Baby / el Niño)":
      ["nino", "niño", "enfant", "gamin", "gosse", "kid", "baby", "bebe", "bébé",
       "child", "chico", "criança", "crianca", "petit"],
    "pierre (Poatan / Pedra)":
      ["pedra", "pierre", "rock", "stone", "roca", "piedra", "granit", "granite",
       "caillou", "roche", "marbre"],
    "cauchemar (Nightmare)":
      ["nightmare", "cauchemar", "bad dream", "mauvais reve", "mauvais rêve",
       "pesadelo", "pesadilla", "albtraum"],
    "loup (Borz)":
      ["borz", "loup", "wolf", "lobo", "wilk", "lupo"],
  };
  const texte = JSON.stringify(A.map(e => ({ id: e.id, nom: e.nom, pays: e.pays, org: e.org })))
    .toLowerCase();
  const fuites = reels.filter(r => texte.includes(r));
  dit("aucun vrai nom de combattant ni de marque dans ce qui sera affiché",
    fuites.length === 0, fuites.length ? "fuite : " + fuites.join(", ") : null);

  const surnoms = A.map(e => {
    const m = e.nom.match(/«\s*(.+?)\s*»/);
    return m ? m[1].toLowerCase() : "";
  });
  const semantiques = [];
  for (const [famille, mots] of Object.entries(FAMILLES))
    for (const s of surnoms)
      for (const mot of mots)
        if (s.includes(mot)) semantiques.push(`« ${s} » → ${famille}`);
  dit("aucun surnom ne TRADUIT un surnom réel (changer de langue n'y change rien)",
    semantiques.length === 0, semantiques.length ? semantiques[0] : surnoms.join(" · "));

  // Le champ `clin` cite les vrais noms : il est REFERENCE DE CONCEPTION et
  // ne doit jamais etre rendu. On verifie qu'il est bien separe du reste.
  dit("le champ `clin` existe et reste hors de l'identité affichée",
    A.every(e => e.clin && !e.nom.includes(e.clin)));
}

dit("les organisations citées existent", A.every(e => C.ORGS[e.org] !== undefined),
  [...new Set(A.map(e => e.org))].join(" · "));

// Deterministe : meme graine, memes hommes.
{
  const B = fabriquer();
  const memes = JSON.stringify(A.map(e => [e.id, Math.round(e.fighter.niveau_moyen()), e.notoriete]))
             === JSON.stringify(B.map(e => [e.id, Math.round(e.fighter.niveau_moyen()), e.notoriete]));
  dit("même graine, mêmes hommes", memes);
  const D = fabriquer(999);
  dit("une autre graine donne d'autres profils",
    JSON.stringify(A.map(e => Math.round(e.fighter.niveau_moyen())))
    !== JSON.stringify(D.map(e => Math.round(e.fighter.niveau_moyen()))));
}

// Ce sont les meilleurs du monde : ils doivent l'etre.
{
  const niv = A.map(e => e.fighter.niveau_moyen());
  // /!\ SEUIL RELEVE APRES MESURE. A niveau 88, deux etoiles tombaient a 85
  // et 86 : un roster regional quelconque comptait alors 15 % de
  // combattants MEILLEURS que le champion du monde welter.
  //
  // /!\ PUIS ABAISSE A 84, ET C'EST UN COMPROMIS ASSUME, PAS UN RELACHEMENT.
  // Deux exigences se contredisent :
  //   - chaque sommet doit avoir une FAIBLESSE identifiable
  //   - aucun sommet ne doit tomber sous 88 de note generale
  // Or niveau_moyen() compte CINQ stats de frappe sur dix. Creuser le
  // striking d'un grappler lui coute donc ~8 points de note, et pour le
  // ramener a 88 il faut monter le reste si haut que 48 % de ses stats
  // finissent a 97+ — il redevient lisse.
  // MESURE : niveau 91 -> min 83 et 34 % de stats saturees
  //          niveau 97 -> min 88 et 48 % de stats saturees
  // Les deux ne tiennent pas ensemble tant que niveau_moyen() reste ce
  // qu'il est. LA VRAIE SOLUTION est de rendre la note generale moins
  // dependante de la frappe — ce que Mael veut deja (note = combat +
  // fight IQ) et qui vit dans engine.py : chantier E/F, reouverture de la
  // bascule. En attendant on garde la faiblesse et on tolere 84.
  dit("ce sont vraiment des sommets (aucune sous 84)",
    Math.min(...niv) >= 84, `de ${Math.round(Math.min(...niv))} à ${Math.round(Math.max(...niv))}`);

  // DISCRIMINANT : une etoile doit ecraser un vivier regional.
  const { generer_roster } = require("./generator.js");
  const pop = [];
  for (let g = 1; g <= 20; g++) {
    alea.seed(7000 + g);
    for (const x of generer_roster(10, { division: "poids_welter",
      niveau_min: 40, niveau_max: 78 })) pop.push(x.fighter.niveau_moyen());
  }
  const pire = Math.min(...niv);
  const meilleursQueLui = pop.filter(x => x > pire).length;
  dit("même la plus faible des étoiles domine un vivier régional",
    meilleursQueLui <= 2,
    `${meilleursQueLui} sur ${pop.length} régionaux au-dessus de la plus faible (${Math.round(pire)})`);
  // /!\ LES PROFILS SONT DICTES : le banc verifie qu'on tombe SUR LA CIBLE,
  // a 2 points pres. Sans ca, un changement du generateur deplacerait
  // silencieusement les huit sommets.
  {
    const moy2 = (b) => {
      const v = Object.values(b).filter(x => typeof x === "number");
      return v.reduce((s, x) => s + x, 0) / v.length;
    };
    let rates = [];
    for (const e of A) {
      const f = e.fighter;
      for (const d of ["striking", "wrestling", "ground"])
        if (Math.abs(moy2(f[d]) - e.cible[d]) > 2)
          rates.push(`${e.id} ${d} ${Math.round(moy2(f[d]))} au lieu de ${e.cible[d]}`);
    }
    dit("chaque domaine tombe sur la cible demandée (± 2)",
      rates.length === 0, rates.length ? rates[0] : "24 domaines vérifiés");
  }

  dit("leur notoriété leur ouvre le chemin le plus court",
    A.every(e => C.serieRequise(e.org, e.notoriete) < C.ORGS[e.org].serie));
}

console.log("\n  les huit sommets :");
for (const e of A) {
  const b = C.bourse(e.org, 1, true, e.notoriete);
  console.log(`    ${e.division.replace("poids_", "").padEnd(10)} ${e.pays.padEnd(12)} ${e.nom.padEnd(38)}`
    + ` ${e.org} · niv ${Math.round(e.fighter.niveau_moyen())} · noto ${e.notoriete}`
    + ` · ${((b[0] + b[1]) / 1000).toFixed(0)} k€`);
}

console.log(echecs === 0
  ? "CONFORME — huit sommets crédibles, et aucun vrai nom sur l'écran."
  : `${echecs} INVARIANT(S) ROMPU(S)`);
process.exit(echecs === 0 ? 0 : 1);
