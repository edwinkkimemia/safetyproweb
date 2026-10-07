// Pulls full product catalogs (name/SKU/prices) from the three leading
// Kenyan PPE shops via their public WooCommerce Store API.
// Run: node scripts/pull-reference-prices.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)));

const SITES = [
  { key: "safetyhub", base: "https://www.safetyhub.co.ke" },
  { key: "bansi", base: "https://bansisafetygear.co.ke" },
  { key: "nss", base: "https://www.nairobisafetyshop.org" },
];

async function pull(site) {
  const items = [];
  let page = 1;
  for (;;) {
    const url = `${site.base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 SafetyProAfrica/1.0" } });
    if (!res.ok) throw new Error(`${site.key} p${page}: HTTP ${res.status}`);
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const p of arr) {
      items.push({
        site: site.key,
        id: p.id,
        name: (p.name || "").replace(/\s+/g, " ").trim(),
        slug: p.slug || "",
        sku: p.sku || "",
        price: Number(p.prices?.price ?? 0) || 0,       // current (sale if on sale), minor units already decimal in Store API
        regular: Number(p.prices?.regular_price ?? 0) || 0,
        sale: Number(p.prices?.sale_price ?? 0) || 0,
        onSale: !!p.on_sale,
        cats: (p.categories || []).map((c) => c.slug || c.name),
      });
    }
    console.log(`  ${site.key} page ${page}: +${arr.length} (total ${items.length})`);
    if (arr.length < 100) break;
    page++;
    if (page > 20) break; // safety
  }
  return items;
}

const all = [];
for (const site of SITES) {
  try {
    const items = await pull(site);
    all.push(...items);
  } catch (e) {
    console.log(`FAILED ${site.key}: ${e.message}`);
  }
}
const priced = all.filter((p) => p.price > 0);
writeFileSync(join(root, "reference-prices.json"), JSON.stringify({ updated: new Date().toISOString(), count: priced.length, items: priced }, null, 1));
console.log(`\nSaved ${priced.length} priced products from ${new Set(priced.map((p) => p.site)).size} sites.`);
