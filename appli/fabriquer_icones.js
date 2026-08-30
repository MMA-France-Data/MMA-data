/* fabriquer_icones.js — rend icone.svg aux tailles Android (Chromium
   headless). A relancer apres toute modification d'icone.svg :
       node fabriquer_icones.js
   Les PNG des mipmap sont des ARTEFACTS. */
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
const ici = __dirname;
const RES = path.join(ici, "android/app/src/main/res");
const TAILLES = { "mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96,
                  "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192 };
(async () => {
  const svg = fs.readFileSync(path.join(ici, "icone.svg"), "utf8");
  const nav = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const page = await nav.newPage();
  for (const [dossier, t] of Object.entries(TAILLES)) {
    await page.setViewportSize({ width: t, height: t });
    await page.setContent(`<body style="margin:0">${svg.replace("<svg ", `<svg width="${t}" height="${t}" `)}</body>`);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: t, height: t } });
    for (const nom of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"])
      fs.writeFileSync(path.join(RES, dossier, nom), png);
    console.log(`${dossier} : ${t}x${t} — 3 fichiers`);
  }
  await nav.close();
})();
