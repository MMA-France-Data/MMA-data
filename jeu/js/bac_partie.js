/**
 * bac_partie.js — LE BAC A SABLE QUI FAIT TOURNER demo_jeu.html HORS
 * NAVIGATEUR.
 *
 * POURQUOI CE FICHIER EXISTE
 * La lecon la plus chere du carnet, ecrite six fois : « UNE CHOSE QUI
 * N'EST BRANCHEE NULLE PART NE FAIT RIEN — ET NE LEVE PAS ». Tous les
 * defauts de cette classe ont ete trouves par Mael EN JOUANT, aucun par
 * les vingt-six bancs : parce qu'AUCUN banc ne chargeait demo_jeu.html.
 * Le moteur etait tenu au caractere pres, la PARTIE ne l'etait pas.
 *
 * Ce module ouvre la porte : il monte un DOM minimal (le meme que le banc
 * 26), charge le bundle et le gabarit, puis execute le script de
 * demo_jeu.html dedans. On recupere le contexte — toutes les fonctions du
 * jeu, appelables comme le ferait un onclick.
 *
 * /!\ CE N'EST PAS UN NAVIGATEUR. Ce qui est simule s'arrete a ce dont le
 * jeu a besoin pour tourner : elements auto-crees, localStorage en
 * memoire, pas de mise en page, pas de pixels. Un defaut d'affichage
 * (une couleur, un debordement) ne se verra JAMAIS ici — ca reste le
 * terrain de Mael. Ce qui se voit ici : ce qui LEVE, ce qui ne fait RIEN,
 * et ce qui diverge entre deux vues.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const R = path.join(__dirname, "..");

/* -- DOM minimal (repris du banc 26, elargi a ce que la partie touche) -- */
function domVierge() {
  const n = {};
  const faire = (id) => {
    const el = {
      id, _h: "", _t: "", value: "", checked: false,
      set innerHTML(v) { this._h = String(v); }, get innerHTML() { return this._h; },
      set textContent(v) { this._t = String(v); }, get textContent() { return this._t; },
      set srcdoc(v) { this._src = String(v); }, get srcdoc() { return this._src || ""; },
      classList: { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); },
                   toggle(c, f) { if (f === undefined) this._c.has(c) ? this._c.delete(c) : this._c.add(c); else f ? this._c.add(c) : this._c.delete(c); },
                   contains(c) { return this._c.has(c); } },
      style: { cssText: "" }, dataset: {}, children: [], firstChild: null,
      contentWindow: { postMessage() {} },
      setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
      querySelector: () => null, querySelectorAll: () => [],
      appendChild(c) { this.children.push(c); return c; }, prepend() {}, append() {},
      remove() { delete n[this.id]; }, insertBefore() {}, removeChild() {},
      focus() {}, blur() {}, click() {}, select() {}, scrollIntoView() {},
      getBoundingClientRect: () => ({ width: 360, height: 640, left: 0, top: 0 }),
    };
    // classList porte un Set par element, pas un Set partage par le prototype.
    el.classList = Object.assign({}, el.classList, { _c: new Set() });
    return el;
  };
  const doc = {
    getElementById: (id) => (id in n ? n[id] : (n[id] = faire(id))),
    createElement: () => faire("?"), createElementNS: () => faire("?"),
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {},
    execCommand() { return false; },
    get body() { return doc.getElementById("body"); },
    get documentElement() { return doc.getElementById("html"); },
  };
  return { n, doc };
}

/* -- Un localStorage en memoire, avec le meme contrat que le vrai. -----
   /!\ QUOTA COMPRIS. Un stockage de banc qui accepte tout ne teste pas le
   seul chemin qui compte vraiment : celui du jour ou le navigateur dit
   non. C'est ce jour-la qu'une partie s'est perdue (cas 122). */
function coffreMemoire(quota) {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      const s = String(v);
      if (quota && s.length > quota) {
        const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e;
      }
      m.set(k, s);
    },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    key: (i) => Array.from(m.keys())[i] || null,
    get length() { return m.size; },
    _map: m,
  };
}

/**
 * Ouvre une partie.
 * @param {object} o
 *   mode    : "neuf" | "demo"          (le hash de l'URL)
 *   graine  : nombre — la graine du monde, pour que la partie se rejoue
 *   stock   : un localStorage a reutiliser (cycle sauvegarde/rechargement)
 * @returns {object} { ctx, doc, erreurs, minuteries, essai }
 */
function ouvrirPartie(o = {}) {
  const mode = o.mode || "neuf";
  const { n, doc } = domVierge();
  const stock = o.stock || coffreMemoire();
  const erreurs = [];
  const minuteries = [];

  const bac = { console: Object.assign({}, console, { error: (...a) => erreurs.push(a.join(" ")) }) };
  bac.window = bac;
  bac.self = bac;
  bac.globalThis = bac;
  bac.document = doc;
  bac.localStorage = stock;
  bac.sessionStorage = coffreMemoire();
  bac.location = { hash: "#" + mode, href: "file:///demo_jeu.html",
                   reload() {}, replace() {} };
  bac.navigator = { userAgent: "banc", clipboard: null, share: undefined,
                    canShare: undefined, vibrate() {} };
  bac.alert = () => {};
  bac.confirm = () => true;
  bac.prompt = () => null;
  /* /!\ LES MINUTERIES NE PARTENT PAS TOUTES SEULES : on les met en file,
     le banc decide quand (et si) elles tournent. Sinon un setTimeout de
     rendu se declencherait au milieu d'une assertion.
     /!\ ET LA FILE EST BORNEE. Premiere version : elle grandissait sans
     fin. Chaque fermeture retient l'etat qu'elle a capture — au jour 500
     d'une mesure longue, le tas atteignait 2,8 Go et node mourait. Ce
     n'etait PAS une fuite du jeu (ses tableaux, eux, restent petits) :
     c'etait le bac. Piege a consigner, il coute une demi-heure. */
  let poses = 0;
  const poser = (fn, ms, boucle) => {
    poses++;
    minuteries.push({ fn, ms, boucle });
    if (minuteries.length > 50) minuteries.splice(0, minuteries.length - 50);
    return poses;
  };
  bac.setTimeout = (fn, ms) => poser(fn, ms, false);
  bac.clearTimeout = () => {};
  bac.setInterval = (fn, ms) => poser(fn, ms, true);
  bac.clearInterval = () => {};
  bac.requestAnimationFrame = (fn) => poser(fn, 16, false);
  bac.Blob = function () {}; bac.URL = { createObjectURL: () => "blob:x", revokeObjectURL() {} };
  bac.FileReader = function () {}; bac.File = function () {};
  bac.indexedDB = undefined;      /* pas de coffre : le jeu retombe sur localStorage */
  /* /!\ Math.random EST SEME. Le jeu s'en sert la ou le hasard n'a pas a
     etre reproductible en combat (le ton d'un article, l'ecoute d'un cri).
     Pour un BANC, c'est l'inverse : un echec qui ne se rejoue pas ne se
     corrige pas. On donne donc au bac son propre Math, dont random() suit
     la graine de la partie — le vrai Math n'est jamais touche. */
  let _r = ((o.graine === undefined ? 1 : o.graine) * 2654435761 + 1) >>> 0;
  const MathBac = Object.create(Math);
  MathBac.random = () => ((_r = (_r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  /* /!\ L'HORLOGE MURALE AUSSI. graineDuMonde() tire
     `Date.now() ^ Math.random()` : sans ca, deux passages du banc
     construisent DEUX MONDES DIFFERENTS et un echec ne se rejoue jamais.
     Piege paye une fois : Math.random seme ne suffisait pas, la partie
     variait encore. On fige l'heure, le vrai Date n'est pas touche (le
     jeu construit de vraies dates a partir du jour de jeu — il lui faut
     le constructeur reel). */
  const heureFixe = 1735689600000 + (o.graine === undefined ? 0 : o.graine) * 86400000;
  bac.Date = new Proxy(Date, {
    get: (c, k, r) => (k === "now" ? () => heureFixe : Reflect.get(c, k, r)),
  });
  bac.Math = MathBac; bac.JSON = JSON;
  /* /!\ LES VIEILLES API DE TRANSPORT EXISTENT DANS LE BAC. btoa, atob,
     unescape : sans elles la compression de la sauvegarde echouait en
     silence et retombait sur le format brut — le banc aurait valide un
     chemin que le navigateur ne prend jamais. */
  bac.btoa = (b) => Buffer.from(b, "binary").toString("base64");
  bac.atob = (b) => Buffer.from(b, "base64").toString("binary");
  bac.unescape = global.unescape; bac.escape = global.escape;
  bac.encodeURIComponent = encodeURIComponent; bac.decodeURIComponent = decodeURIComponent;
  bac.addEventListener = (t, fn) => { (bac._ecoute = bac._ecoute || {}), (bac._ecoute[t] = bac._ecoute[t] || []).push(fn); };
  bac.removeEventListener = () => {};
  bac.postMessage = () => {};
  /* /!\ LES PROMESSES DOIVENT POUVOIR SE TERMINER. Piege paye cher, a
     consigner : un banc qui pilote le jeu en boucle SYNCHRONE ne rend
     jamais la main a la file de microtaches — sauvegarder() empile donc
     une chaine de promesses par jour, chacune retenant l'etat complet
     serialise (2 a 4 Mo). Mesure : 848 Mo de tas au jour 200, 2 Go au
     jour 400, puis node meurt. Le JEU, LUI, EST PROPRE : sans
     l'autosauvegarde, 19 Mo au jour 200 et 24 Mo au jour 600. Ce n'etait
     donc pas une fuite a corriger dans la partie, mais un bac qui ne
     respirait pas. `microtaskMode: afterEvaluate` vide la file apres
     chaque evaluation — c'est-a-dire a chaque lecture du banc. */
  vm.createContext(bac, { microtaskMode: "afterEvaluate" });

  for (const f of ["moteur.bundle.js", "ecran.gabarit.js"]) {
    const p = path.join(__dirname, f);
    if (!fs.existsSync(p))
      throw new Error(`${f} absent — lancer d'abord : node js/bundler.js && node js/gabarit.js`);
    new vm.Script(fs.readFileSync(p, "utf8"), { filename: f }).runInContext(bac);
  }
  /* Les visuels : OPTIONNELS ici comme au navigateur — le jeu doit tenir
     sans eux, et le banc 31 verifie justement les deux etats. `sans`
     permet de jouer une partie volontairement depouillee. */
  const pa = path.join(__dirname, "assets.js");
  if (!o.sansAssets && fs.existsSync(pa))
    new vm.Script(fs.readFileSync(pa, "utf8"), { filename: "assets.js" }).runInContext(bac);

  const page = fs.readFileSync(path.join(R, "demo_jeu.html"), "utf8");
  const bouts = page.split(/<script>/);
  if (bouts.length < 2) throw new Error("demo_jeu.html : pas de script inline trouve");
  const src = bouts[bouts.length - 1].split(/<\/script>/)[0];
  new vm.Script(src, { filename: "demo_jeu.html" }).runInContext(bac);

  /**
   * LIRE DANS LA PORTEE DU JEU. /!\ UN `const` DE PREMIER NIVEAU N'EST PAS
   * UNE PROPRIETE DU GLOBAL — EFFECTIF, SALLE, MESGARS, t ne sont donc PAS
   * sur le contexte, alors que les `function` y sont. Piege paye une fois :
   * le banc lisait `undefined` et croyait la salle vide. On evalue dans la
   * portee, c'est la seule lecture honnete.
   */
  /* /!\ LES SCRIPTS SE RECOMPILENT SINON. Les bancs lisent la meme
     expression des milliers de fois : sans ce cache, une partie de dix ans
     passe l'essentiel de son temps dans le compilateur de V8, pas dans le
     jeu. Le cache est par bac, donc aucune fuite entre deux parties. */
  const compiles = new Map();
  const lire = (expr) => {
    let sc = compiles.get(expr);
    if (!sc) { sc = new vm.Script(`(${expr})`); compiles.set(expr, sc); }
    return sc.runInContext(bac);
  };

  /** Appelle une fonction du jeu comme le ferait un onclick : une erreur
   *  est COMPTEE, jamais fatale (regle du singe). */
  const essai = (nom, ...args) => {
    const f = typeof bac[nom] === "function" ? bac[nom]
            : (() => { try { return lire(nom); } catch (e) { return null; } })();
    if (typeof f !== "function") { erreurs.push(`fonction absente : ${nom}`); return undefined; }
    try { return f(...args); }
    catch (e) {
      /* /!\ ON GARDE LA PREMIERE LIGNE DE PILE. Sans elle, "id.replace is
         not a function" n'apprend rien : l'erreur remonte de rendre(), et
         la fonction fautive est trois etages plus bas. Une passe de
         diagnostic perdue a le redecouvrir. */
      const pile = String((e && e.stack) || "").split("\n")
        .filter((x) => /demo_jeu\.html:/.test(x)).slice(0, 3)
        .map((x) => x.trim().replace(/^at /, "")).join(" < ");
      erreurs.push(`${nom} : ${e && e.message}${pile ? " @" + pile : ""}`);
      return undefined;
    }
  };

  /** L'ecran, tel qu'il est ECRIT — c'est ce que le joueur lit. */
  const ecran = (id) => (n[id] ? n[id].innerHTML : "");

  return { ctx: bac, doc, n, stock, erreurs, minuteries, essai, lire, ecran, source: src };
}

/**
 * SORTIR D'UN BLOCAGE, quelle que soit sa forme.
 *
 * /!\ IL VIT ICI, PAS DANS UN BANC. Le banc 29 avait recopie cette main
 * en oubliant la visite : trancher() partait sur un blocage qui n'a ni
 * `oui` ni `non`, 192 exceptions, et l'echec accusait le jeu. Une seule
 * main, partagee — c'est la meme regle que le reste du projet.
 *
 * /!\ ET IL SIGNALE LE VERROU SANS CLEF. Un blocage qu'aucune sortie ne
 * traite fige la journee sans lever : le cas 22, la pire panne du jeu.
 * On rend "SANS_ISSUE" plutot que d'appuyer au hasard.
 *
 * @returns {string|null} ce qui a ete fait, "SANS_ISSUE:<id>", ou null
 */
function trancherBlocage(P, tirage = 0.5) {
  const b = P.lire("bloque");
  if (!b) return null;
  /* Le soir du combat : on le simule. C'est la sortie de secours du jeu
     (cas 22), donc un chemin de production, pas une bequille de banc. */
  if (b.id === "combat") { P.essai("simulerCombat"); return "combat"; }
  if (b.id === "visite") { P.essai("repondreVisite", tirage < 0.75); return "visite"; }
  if (Array.isArray(b.choix) && b.choix.length) {
    P.essai("choisirBloque", Math.floor(tirage * b.choix.length));
    return "choix:" + b.id;
  }
  if (b.action) { P.essai("agirBloque"); return "action:" + b.id; }
  if (b.oui !== undefined || b.non !== undefined) {
    P.essai("trancher", tirage < 0.7);
    return "oui_non:" + b.id;
  }
  return "SANS_ISSUE:" + (b.id || "?");
}

module.exports = { ouvrirPartie, domVierge, coffreMemoire, trancherBlocage };
