/**
 * verifier_matchmaker.js — banc 35 : ce qu'on peut demander au
 * matchmaker, et ce que ça coûte.
 */
const M = require("./matchmaker.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ------------------------------------------------ 1. le délai */
{
  dit("sans relation avec eux, on ne demande rien",
    M.peutDemander(null, 100).peut === false);
  dit("on peut demander quand on n'a rien demandé récemment",
    M.peutDemander({ valeur: 50 }, 100).peut === true);
  const r = M.peutDemander({ valeur: 50, demandeLe: 100 }, 110);
  dit("mais pas deux fois de suite — un manager qui appelle sans arrêt n'est plus écouté",
    r.peut === false && r.reste === M.DELAI - 10, r.mot);
  dit("et le délai finit par passer",
    M.peutDemander({ valeur: 50, demandeLe: 100 }, 100 + M.DELAI).peut === true);
}

/* ------------------------------------------------ 2. la décision se calcule */
{
  dit("une demande inventée est refusée net",
    (() => { try { M.juger("un_titre_gratuit", 99); return false; } catch (e) { return true; } })());

  dit("une date se demande facilement, le haut de carte non",
    M.juger("date", 35).accepte === true && M.juger("affiche", 35).accepte === false);
  dit("et le haut de carte s'obtient quand la relation est vraiment bonne",
    M.juger("affiche", 70).accepte === true);

  /* /!\ MEME ETAT, MEME REPONSE : le joueur peut apprendre les regles. */
  dit("la décision ne se tire pas : deux fois la même demande, deux fois la même réponse",
    JSON.stringify(M.juger("bourse", 56)) === JSON.stringify(M.juger("bourse", 56)));

  /* Viser plus haut est plus dur — le meme principe que la montee. */
  const egal = M.juger("adversaire", 50, { rangEcart: 0 });
  const haut = M.juger("adversaire", 50, { rangEcart: 3 });
  dit("demander un homme de son niveau passe, en viser un bien mieux classé non",
    egal.accepte === true && haut.accepte === false,
    `seuils ${egal.seuil} contre ${haut.seuil}`);
  dit("mais avec une excellente relation, même le mieux classé s'obtient",
    M.juger("adversaire", 80, { rangEcart: 3 }).accepte === true);
}

/* ------------------------------------------------ 3. demander coûte */
{
  const oui = M.juger("adversaire", 90), non = M.juger("adversaire", 10);
  dit("chaque demande laisse une trace sur la relation, acceptée comme refusée",
    !!oui.trace && !!non.trace);
  dit("une date obtenue est un échange, une date refusée est une exigence",
    M.juger("date", 90).trace === "echange_juste" && M.juger("date", 10).trace === "exigence");
  dit("réclamer de l'argent se paie sur le terrain de l'argent",
    M.juger("bourse", 90).trace === "exigence_argent");
}

/* ------------------------------------------------ 4. la faveur est un dû daté */
{
  const f = M.faveur("adversaire", 200, 51);
  dit("la faveur retient CE qui a été promis et À QUI",
    f.quoi === "adversaire" && f.cible === 51 && f.depuis === 200);
  dit("elle reste due un moment", M.dueEncore(f, 250) === true);
  dit("puis il oublie — une faveur n'est pas éternelle",
    M.dueEncore(f, 200 + M.DEMANDES.adversaire.duree + 1) === false);
  dit("une faveur absente n'est jamais due", M.dueEncore(null, 10) === false);
}

/* ------------------------------------------------ 5. il parle, et il dit quelque chose */
{
  const ok = Object.keys(M.DEMANDES).every((k) => {
    const d = M.DEMANDES[k];
    return d.lab && d.oui("X").length > 10 && d.non("X").length > 10;
  });
  dit("chaque demande a son libellé et deux réponses écrites", ok);
  dit("le nom demandé entre vraiment dans sa bouche",
    M.DEMANDES.adversaire.oui("Vasile").indexOf("Vasile") >= 0,
    M.DEMANDES.adversaire.oui("Vasile"));
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — on demande, il décide, et ça coûte.");
