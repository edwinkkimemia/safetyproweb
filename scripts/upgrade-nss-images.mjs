// Upgrades undersized NSS product shots: downloads candidate(s) and keeps
// the file with the largest width. Run: node scripts/upgrade-nss-images.mjs
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "products");
const B = (f) => `https://www.nairobisafetyshop.org/wp-content/uploads/${f}`;

/** [local file, ...remote candidates] */
const SLOTS = [
  ["dust-masks.jpg", "2017/11/Vaultex-Dust-Masks-VB6.jpg", "2017/10/Taiwan-Dust-Mask-1-1.jpg", "2017/10/Filter-Mask.jpg"],
  ["barricade-tape.jpg", "2017/07/BARRICADE-TAPES-1.jpg", "2017/07/BARRICADE-TAPES-2-1.jpg"],
  ["ear-muffs.jpg", "2021/09/Delta-Ear-Muffs.jpg", "2019/03/Hearing-Protection-EarMuff.jpg", "2018/07/JSP-EAR-MUFFS.jpg"],
  ["harness.jpg", "2017/07/Harness-single-1.jpg", "2017/07/harness-Copy.jpg"],
  ["hiviz-vest.jpg", "2017/07/Executive-Reflective-Vests.jpg", "2017/07/Blue-Reflective-vests.jpg"],
  ["rigger-gloves.jpg", "2017/07/long-leather-gloves.jpg", "2017/07/Leather-mining-gloves-1.jpg"],
  ["rainsuit.jpg", "2017/10/Rain-Coat-With-Inner-Lining-1.jpg", "2017/10/RAINCOAT-WITH-INNER-LINING-2.jpeg"],
  ["extinguisher.jpg", "2017/10/Dry-Powder-Extinguishers.jpg"],
  ["hard-hat.jpg", "2016/09/Safety-Helmet-with-Wheel-Ratchet.jpg", "2017/07/JSP-HELMET-1.jpg"],
  ["cut-gloves.jpg", "2017/07/diamnd-grip-gloves.jpg"],
];

function dims(buf) {
  const s = buf.toString("ascii", 0, 12);
  if (s.startsWith("RIFF") && buf.toString("ascii", 8, 12) === "WEBP") return [buf.readUInt16LE(26), buf.readUInt16LE(28)];
  for (let i = 2; i < buf.length - 8; i++) {
    if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
  }
  return [0, 0];
}
function valid(buf) {
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const webp = buf.toString("ascii", 0, 4) === "RIFF";
  const png = buf[0] === 0x89 && buf[1] === 0x50;
  return (jpeg || webp || png) && buf.length > 5000;
}

for (const [local, ...remotes] of SLOTS) {
  let curW = 0;
  try { [curW] = dims(readFileSync(join(root, local))); } catch { /* missing */ }
  let best = null, bestW = curW;
  for (const remote of remotes) {
    try {
      const res = await fetch(B(remote), { headers: { "User-Agent": "Mozilla/5.0 SafetyProAfrica/1.0" } });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.startsWith("image/")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!valid(buf)) continue;
      const [w, h] = dims(buf);
      console.log(`  candidate ${remote} -> ${w}x${h} (${(buf.length / 1024).toFixed(0)}KB)`);
      if (w > bestW) { best = buf; bestW = w; }
    } catch { /* next */ }
  }
  if (best && bestW > curW) {
    writeFileSync(join(root, local), best);
    console.log(`UPGRADED ${local}: ${curW}px -> ${bestW}px wide`);
  } else {
    console.log(`KEPT     ${local} (${curW}px; no bigger candidate)`);
  }
}
console.log("Done.");
