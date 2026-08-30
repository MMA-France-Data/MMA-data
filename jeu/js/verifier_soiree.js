/**
 * verifier_soiree.js — banc 33 : les conversations au bord de la cage.
 * Module pur : tout se verifie a la main.
 */
const S = require("./soiree.js");

let echecs = 0;
const dit = (n, ok, i) => { console.log(`  ${ok ? "ok  " : "ECHEC"} ${n}${i ? " — " + i : ""}`); if (!ok) echecs++; };

/* ------------------------------------------------ 1. le contact */
{
  const p = {};
  S.poserContact(p, 10, "félicité après sa victoire", 6);
  S.poserContact(p, 11, "poussé", 500);
  dit("le contact est un résidu borné, posé sur l'homme du monde",
    p.contact.v === 100 && p.contact.faits.length === 2);
  dit("le contact a ses mots, jamais de chiffre à l'écran",
    S.motContact(5) === null && S.motContact(15) === "il te situe"
    && S.motContact(35) === "il te connaît" && S.motContact(70) === "en confiance");
}

/* ------------------------------------------------ 2. la situation choisit la réplique */
{
  const base = { nom: "X", jeton: 3, contactV: 0 };
  dit("la situation du soir choisit la famille de répliques",
    S.sit({ ...base, aCombattu: true, aGagne: true, finish: true }) === "gagne_finish"
    && S.sit({ ...base, aCombattu: true, aGagne: false, serre: true }) === "perdu_serre"
    && S.sit({ ...base, aCombattu: false, libre: true }) === "libre"
    && S.sit({ ...base, aCombattu: false }) === "spectateur");
  const o1 = S.ouverture({ ...base, aCombattu: true, aGagne: true, finish: true });
  const o2 = S.ouverture({ ...base, aCombattu: true, aGagne: true, finish: true });
  dit("même homme, même soir : même phrase — le jeton décide, pas un tirage",
    o1 === o2 && o1.length > 10, `« ${o1} »`);
  const oc = S.ouverture({ ...base, contactV: 40, salleNom: "Le Chaudron",
    aCombattu: true, aGagne: true, finish: true });
  dit("un homme qui te connaît t'accueille par le nom de ta salle",
    oc.indexOf("Le Chaudron") >= 0, `« ${oc.slice(0, 60)}… »`);
}

/* ------------------------------------------------ 3. les choix ont leurs conditions */
{
  const libre = S.choixPour({ aCombattu: false, libre: true }).map(c => c.cle);
  const sousContrat = S.choixPour({ aCombattu: true, aGagne: true }).map(c => c.cle);
  dit("« j'ai une place pour toi » ne se dit qu'à un libre ou une fin de contrat",
    libre.includes("recruter") && !sousContrat.includes("recruter"));
  dit("on félicite le vainqueur, on relève le perdant",
    sousContrat.includes("feliciter")
    && S.choixPour({ aCombattu: true, aGagne: false }).map(c => c.cle).includes("relever"));
}

/* ------------------------------------------------ 4. les réponses portent leur effet */
{
  const ctx = { jeton: 5, contactV: 0, reputation: 50, notoriete: 20 };
  const r = S.repondre("feliciter", ctx);
  dit("chaque réplique vient avec son delta de contact — jamais décorative",
    r.dit.length > 5 && r.dContact > 0 && r.effet === null);
  const inv = S.repondre("inviter", ctx);
  dit("l'invitation acceptée porte l'effet « inviter »",
    inv.effet === "inviter" && inv.dContact >= 10, `« ${inv.dit} »`);
  const trop = S.repondre("inviter", { jeton: 5, contactV: 0, reputation: 10, notoriete: 80 });
  dit("un homme trop connu pour ta salle refuse — et le dit",
    trop.effet === null && trop.dit.length > 5, `« ${trop.dit} »`);
  const inter = S.repondre("inviter", { jeton: 5, contactV: 90, reputation: 95,
    notoriete: 30, niveauInter: true, preuve: false });
  dit("un contracté d'internationale sans la preuve refuse même la visite (cas 143)",
    inter.effet === null);
  dit("avec la preuve, la même invitation passe",
    S.repondre("inviter", { jeton: 5, contactV: 90, reputation: 95,
      notoriete: 30, niveauInter: true, preuve: true }).effet === "inviter");
  dit("« recruter » ouvre la porte mais laisse les gates au jeu",
    S.repondre("recruter", ctx).effet === "recruter");
}

/* ------------------------------------------------ 5. l'invitation se calcule, ne se tire pas */
{
  dit("l'acceptation est déterministe : réputation + contact contre notoriété",
    S.accepteInvitation({ reputation: 40, contactV: 0, notoriete: 30 }) === true
    && S.accepteInvitation({ reputation: 20, contactV: 0, notoriete: 60 }) === false
    && S.accepteInvitation({ reputation: 20, contactV: 50, notoriete: 60 }) === true,
    "le contact fait la différence pour la même salle");
  dit("la visite dure une semaine et son étalon de sparring est écrit au module",
    S.VISITE_JOURS === 7 && S.BOOST_VISITE > 1);
}

/* ------------------------------------------------------------------ */
if (echecs) { console.log(`NON CONFORME — ${echecs} échec(s)`); process.exit(1); }
console.log("CONFORME — les répliques sortent des faits, et chacune porte sa conséquence.");
