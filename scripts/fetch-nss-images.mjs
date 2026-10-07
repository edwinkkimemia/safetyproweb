// Downloads product photography from Nairobi Safety Shop
// (nairobisafetyshop.org) into public/images/products.
// Run: node scripts/fetch-nss-images.mjs
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "products");
const B = (f) => `https://www.nairobisafetyshop.org/wp-content/uploads/${f}`;

/** [local file, remote file] */
const SLOTS = [
  ["helmet-full-brim.jpg", "2016/07/Construction-Helmet.jpg"],
  ["hard-hat.jpg", "2016/09/Vented-Helmet.jpg"],
  ["safety-boots.jpg", "2017/07/EURO-Safety-Boot.jpg"],
  ["gumboots.jpg", "2017/07/Steel-Toe-Gumboot.jpg"],
  ["cut-gloves.jpg", "2017/07/EN-388-SAFETY-GLOVES.jpg"],
  ["nitrile-gloves.jpg", "2017/07/Nitrile-Heavy-Duty-Gloves-1.jpg"],
  ["chemical-gloves.jpg", "2017/07/Chemical-Gloves.jpg"],
  ["safety-glasses.jpg", "2017/11/Safety-Glasses-with-Clear-Lens.jpg"],
  ["goggles.jpg", "2017/10/KrickWood-Clear-Safety-Goggles.jpg"],
  ["ear-muffs.jpg", "2025/02/Orange-Ear-Muff-1.jpg"],
  ["ear-plugs.jpg", "2017/07/Corded-Disposable-Ear-Plugs.jpg"],
  ["dust-masks.jpg", "2017/10/Disposable-Non-Toxic-Dust-Mask-Packet-of-50-Pieces.jpg"],
  ["respirator.jpg", "2017/10/NP306-Respirator-Mask.jpg"],
  ["hiviz-vest.jpg", "2017/07/REFLECTIVE-VESTS.jpg"],
  ["coverall.jpg", "2017/07/reflective-overalls-1.jpg"],
  // disposable-coverall: no match — keeps existing photo
  // cone: already NSS BARRIER-CONE — kept
  ["harness.jpg", "2017/07/harness-kits.jpg"],
  ["extinguisher.jpg", "2017/10/6-kg-dry-powder-extinguisher-1.jpg"],
  ["first-aid.jpg", "2017/07/Large-Green-First-Aid-Kit.jpg"],
  ["barricade-tape.jpg", "2017/07/BARRICADE-TAPE-1.jpg"],
  ["welding-helmet.jpg", "2017/10/Welding-Helmet-Flip-Up.jpg"],
  ["rigger-gloves.jpg", "2017/07/Leather-mining-Glove.jpg"],
  ["rainsuit.jpg", "2017/07/Rain-suit.jpg"],
];

function kind(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpeg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf.toString("ascii", 0, 6) === "GIF89" || buf.toString("ascii", 0, 6) === "GIF87") return "gif";
  return "unknown";
}

mkdirSync(root, { recursive: true });
// Remove files that change extension back to .jpg
for (const stale of ["helmet-full-brim.webp", "dust-masks.webp", "rainsuit.webp"]) {
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
    if (k === "unknown" || buf.length < 5000) throw new Error(`invalid image (${k}, ${buf.length}b)`);
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
