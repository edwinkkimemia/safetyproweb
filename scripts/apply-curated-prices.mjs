// Applies scripts/price-overrides.json to the 24 curated products in
// src/lib/catalog.ts. Run: node scripts/apply-curated-prices.mjs
import { readFileSync, writeFileSync } from "node:fs";

const o = JSON.parse(readFileSync("scripts/price-overrides.json", "utf8"));
const lines = readFileSync("src/lib/catalog.ts", "utf8").split("\n");

const slugIdx = new Map();
lines.forEach((l, i) => {
  const m = l.match(/slug: "([^"]+)"/);
  if (m && !m[1].startsWith("auto") && !slugIdx.has(m[1])) slugIdx.set(m[1], i);
});

let n = 0;
for (const [slug, e] of Object.entries(o)) {
  if (slug.startsWith("auto-")) continue;
  const si = slugIdx.get(slug);
  if (si === undefined) { console.log("skip (not curated):", slug); continue; }
  for (let i = si; i < Math.min(si + 6, lines.length); i++) {
    const m = lines[i].match(/brand: "([^"]+)", category: "([^"]+)", price: (\d+)(, compareAt: \d+)?/);
    if (m) {
      const brand = e.brand || m[1];
      const cmp = e.compareAt ? `, compareAt: ${e.compareAt}` : "";
      lines[i] = lines[i].replace(
        /brand: "[^"]+", category: "[^"]+", price: \d+(, compareAt: \d+)?/,
        `brand: "${brand}", category: "${m[2]}", price: ${e.price}${cmp}`
      );
      console.log(`SET ${slug}: ${m[1]} ${m[3]} -> ${brand} ${e.price}${cmp}`);
      n++;
      break;
    }
  }
}
writeFileSync("src/lib/catalog.ts", lines.join("\n"));
console.log(`\nPatched ${n} curated products.`);
