// Downloads REAL product photography from Bansi Safety Gear (leading Kenyan
// PPE shop) into public/images/products, replacing the generic placeholders.
// Only clean, non-watermarked images (no "-logo-" files) are used.
// Run: node scripts/fetch-bansi-images.mjs
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "products");
const B = (f) => `https://bansisafetygear.co.ke/wp-content/uploads/${f}`;

/** [local file, remote file] — local names match catalog PRODUCT_IMAGES keys */
const SLOTS = [
  ["helmet-full-brim.webp", "2026/04/Yellow_Safety_Helmet_Kenya_Industrial_Hard_Hat_cleaned.webp"],
  ["hard-hat.jpg", "2026/04/VaultexSafetyHelmet.jpg"],
  ["safety-boots.jpg", "2026/04/Steel-Toe-Workman-Safety-Boots.jpeg"],
  ["gumboots.jpg", "2026/04/Vaultex-Safety-Gumboots.jpeg"],
  ["cut-gloves.jpg", "2026/04/CutResistantGloves.jpeg"],
  ["nitrile-gloves.jpg", "2026/04/HandCare-Powder-Free-Nitrile-Examination-Gloves-%E2%80%93-100pcs-1.jpeg"],
  ["chemical-gloves.jpg", "2026/08/PVC-Gloves-for-Chemical-Handling-Kenya-Chemical-Gloves.jpeg"],
  ["safety-glasses.jpg", "2026/04/Vaultex-V406-Clear-Safety-Spectacles-Kenya-EN-166-UV-Protection.jpeg"],
  ["goggles.jpg", "2026/04/Polycarbonate-Clear-Safety-Goggles-Kenya-Anti-Mist-EN-166.jpeg"],
  ["ear-muffs.jpg", "2026/04/Ear-Muffs-Bansi-safety-gears.jpg"],
  ["ear-plugs.jpg", "2026/04/ear-plugs-Copy.jpg"],
  ["dust-masks.webp", "2026/09/Valved-KN95-Mask-Price-in-Kenya.webp"],
  ["respirator.jpg", "2026/04/NP306DoubleRespiratorMask1.jpeg"],
  ["hiviz-vest.jpg", "2026/04/AffordableReflectorVests100Gsm.jpeg"],
  ["coverall.jpg", "2026/04/NavyBlueReflectiveOverall.jpeg"],
  // disposable-coverall: no match on Bansi — keeps existing photo
  ["harness.jpg", "2026/04/Full-Body-Safety-Harness-Kenya.jpeg"],
  ["extinguisher.jpg", "2026/04/DryPowderFireExtinguisher.jpeg"],
  ["first-aid.jpg", "2026/04/Medium-First-Aid-Box-1.jpeg"],
  ["cone.jpg", "2026/04/Traffic-cones-price-in-Kenya-75cm-3.jpeg"],
  ["barricade-tape.jpg", "2026/04/Caution-Tapes.jpeg"],
  ["welding-helmet.jpg", "2026/04/Auto-DarkeningWeldingFaceShieldHelmet.jpeg"],
  ["rigger-gloves.jpg", "2026/04/LeatherWorkGloves.jpeg"],
  ["rainsuit.webp", "2026/08/Heavy-Duty-Raincoat-Price-Kenya.webp"],
];

function kind(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpeg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  return "unknown";
}

mkdirSync(root, { recursive: true });
// Remove stale generics that change extension
for (const stale of ["helmet-full-brim.jpg", "dust-masks.jpg", "rainsuit.jpg"]) {
  const p = join(root, stale);
  if (existsSync(p)) rmSync(p);
}

let ok = 0, fail = 0;
for (const [local, remote] of SLOTS) {
  try {
    const res = await fetch(B(remote), { headers: { "User-Agent": "Mozilla/5.0 SafetyProAfrica/1.0" } });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.startsWith("image/")) throw new Error(`HTTP ${res.status} ${ct}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const k = kind(buf);
    if (k === "unknown" || buf.length < 8000) throw new Error(`invalid image (${k}, ${buf.length}b)`);
    writeFileSync(join(root, local), buf);
    console.log(`OK   ${local} (${(buf.length / 1024).toFixed(0)}KB ${k})`);
    ok++;
  } catch (e) {
    console.log(`FAIL ${local} :: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
process.exit(fail ? 1 : 0);
