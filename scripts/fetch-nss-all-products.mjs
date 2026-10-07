// Downloads ALL featured product images from nairobisafetyshop.org
// (WooCommerce Store API) into public/products/<slug>.<ext>
// Run: node scripts/fetch-nss-all-products.mjs
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "products");
mkdirSync(root, { recursive: true });

const UA = { "User-Agent": "Mozilla/5.0 SafetyProAfrica/1.0" };
const PER_PAGE = 100;

function extFromUrl(url, contentType) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return "png";
  if (clean.endsWith(".webp")) return "webp";
  if (clean.endsWith(".gif")) return "gif";
  if (clean.endsWith(".jpeg")) return "jpg";
  if (clean.endsWith(".jpg")) return "jpg";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  return "jpg";
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "image";
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return { data: await res.json(), totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1), total: res.headers.get("x-wp-total") };
}

// 1. Pull product list (all pages)
let products = [];
try {
  const first = await fetchJson(`https://www.nairobisafetyshop.org/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=1`);
  products.push(...first.data);
  console.log(`Total products: ${first.total}, pages: ${first.totalPages}`);
  for (let page = 2; page <= first.totalPages; page++) {
    const r = await fetchJson(`https://www.nairobisafetyshop.org/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=${page}`);
    products.push(...r.data);
    console.log(`  page ${page}/${first.totalPages} (${products.length} so far)`);
  }
} catch (e) {
  console.error("Failed to list products:", e.message);
  process.exit(1);
}

// 2. Download each featured image with concurrency
const manifest = [];
let ok = 0, fail = 0, skip = 0;
const queue = products.filter((p) => p.images?.[0]?.src);
console.log(`\nDownloading ${queue.length} images (concurrency 8)...`);

async function worker(items) {
  for (const p of items) {
    const src = p.images[0].src;
    const slug = slugify(p.slug || p.name);
    try {
      const res = await fetch(src, { headers: UA });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.startsWith("image/")) throw new Error(`HTTP ${res.status} ${ct}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) throw new Error(`too small (${buf.length}b)`);
      const ext = extFromUrl(src, ct);
      const file = `${slug}.${ext}`;
      writeFileSync(join(root, file), buf);
      manifest.push({ name: p.name, slug: p.slug, file: `/products/${file}`, source: src, price: p.prices?.price ?? null });
      ok++;
      if (ok % 50 === 0) console.log(`  ...${ok} done`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${slug} :: ${e.message}`);
    }
  }
}

const CONC = 8;
const chunks = Array.from({ length: CONC }, () => []);
queue.forEach((p, i) => chunks[i % CONC].push(p));
await Promise.all(chunks.map(worker));

manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(join(root, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${ok} downloaded, ${fail} failed, ${products.length - queue.length} products had no image`);
console.log(`Manifest: public/products/manifest.json (${manifest.length} entries)`);
process.exit(fail > ok ? 1 : 0);
