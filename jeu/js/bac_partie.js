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

/* -- Un localStorage en memoire, avec le meme contrat que le vrai. ----- */
function coffreMemoire() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
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
     rendu se declencherait au milieu d'une assertion. */
  bac.setTimeout = (fn, ms) => { minuteries.push({ fn, ms }); return minuteries.length; };
  bac.clearTimeout = () => {};
  bac.setInterval = (fn, ms) => { minuteries.push({ fn, ms, boucle: true }); return minuteries.length; };
  bac.clearInterval = () => {};
  bac.requestAnimationFrame = (fn) => { minuteries.push({ fn, ms: 16 }); return minuteries.length; };
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
  bac.addEventListener = (t, fn) => { (bac._ecoute = bac._ecoute || {}), (bac._ecoute[t] = bac._ecoute[t] || []).push(fn); };
  bac.removeEventListener = () => {};
  bac.postMessage = () => {};
  vm.createContext(bac);

  for (const f of ["moteur.bundle.js", "ecran.gabarit.js"]) {
    const p = path.join(__dirname, f);
    if (!fs.existsSync(p))
      throw new Error(`${f} absent — lancer d'abord : node js/bundler.js && node js/gabarit.js`);
    new vm.Script(fs.readFileSync(p, "utf8"), { filename: f }).runInContext(bac);
  }

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
  const lire = (expr) => vm.runInContext(`(${expr})`, bac);

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
