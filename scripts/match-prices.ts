// Matches our catalog against reference prices from SafetyHub, Bansi and
// Nairobi Safety Shop, and writes VAT-inclusive overrides.
// Their prices are EX-VAT -> ours = ref * 1.16 (rounded to nearest 10).
// Run: npx tsx scripts/match-prices.ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PRODUCTS } from "../src/lib/catalog";

const root = join(dirname(fileURLToPath(import.meta.url)));
const ref = JSON.parse(readFileSync(join(root, "reference-prices.json"), "utf8")).items as any[];

const FILLER = new Set([
  "kenya", "nairobi", "nairobi-safety-shop", "price", "prices", "sale", "buy", "online",
  "best", "quality", "cheap", "affordable", "original", "new", "for", "in", "of", "and",
  "the", "a", "an", "with", "without", "from", "to", "per", "set", "kit", "combo",
  "brand", "genuine", "classic", "standard", "general", "purpose", "heavy", "duty",
  "industrial", "safety", "protective", "protection", "premium", "deluxe", "pro",
]);

function stem(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 4 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s")) return t.slice(0, -1);
  return t;
}

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ")
    .map((t) => t.trim()).filter((t) => t.length > 1 && !FILLER.has(t)).map(stem);
}

function brandTokens(brand: string): string[] {
  if (!brand || brand === "SafetyPro") return [];
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t.length > 1).map(stem);
}

// Reference category slugs must be coherent with our category ( Shops use
// different slugs, so match by keyword). Empty ref cats = allow.
const CAT_COHERENCE: Record<string, RegExp> = {
  "head-protection": /helmet|hat|cap|hair|head/,
  "foot-protection": /boot|shoe|gumboot|foot|footwear/,
  "hand-protection": /glove|hand/,
  "eye-face-protection": /glass|goggle|spectacle|eye|face|shield|weld|visor/,
  "hearing-protection": /ear|muff|plug|hearing|noise/,
  "respiratory-protection": /mask|respirator|dust|kn95|ffp|breath/,
  "protective-clothing": /vest|overall|coverall|cloth|uniform|rain|jacket|apron|wear|garment|suit/,
  "fall-protection": /harness|fall|lanyard|height|anchor|roof/,
  "fire-emergency": /fire|extinguisher|blanket|first|aid|emergency|alarm|sign|hose/,
  "road-site-safety": /cone|tape|sign|road|barricade|barrier|reflector|delineator|safety|traffic/,
};

function coherent(ourCat: string, refCats: string[]): boolean {
  if (!refCats.length) return true;
  const hay = refCats.join(" ").toLowerCase();
  return (CAT_COHERENCE[ourCat] ?? /.*/).test(hay);
}

type Cand = { site: string; name: string; exVat: number; regular: number; onSale: boolean };
const out: Record<string, { price: number; compareAt?: number; brand?: string; refs: Cand[] }> = {};
const matchCount: Record<string, number> = {};
let matched = 0;

// Pack quantities: "box of 100", "12 pairs", "500m" (lengths excluded).
function packCount(s: string): number | null {
  const m = s.toLowerCase().match(/(\d+)\s*(pairs?|pcs|pieces?|pack(?:et)?s?|box(?:es)?|cases?|rolls?|sets?)\b/);
  return m ? parseInt(m[1], 10) : null;
}
function packOk(ours: string, refName: string): boolean {
  const a = packCount(ours), b = packCount(refName);
  if (a !== null && b !== null) return Math.max(a, b) / Math.min(a, b) <= 2.5;
  if (a === null && b !== null && b >= 20) return false; // bulk pack vs single unit
  if (a !== null && a >= 6 && b === null) return false; // multipack vs uncounted listing
  return true;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

// Score-weighted median: name-similar references pull the price.
function wMedian(items: { price: number; w: number }[]): number {
  const s = [...items].sort((a, b) => a.price - b.price);
  const total = s.reduce((a, x) => a + x.w, 0);
  let cum = 0;
  for (const x of s) { cum += x.w; if (cum >= total / 2) return x.price; }
  return s[s.length - 1].price;
}

for (const p of ALL_PRODUCTS) {
  const pt = new Set(tokens(`${p.name} ${p.sku} ${p.brand} ${p.certifications.join(" ")}`));
  if (pt.size === 0) continue;
  const bt = brandTokens(p.brand);
  const cands: { ref: any; score: number; shared: number }[] = [];

  for (const raw of ref) {
    const r = { ...raw, price: raw.price / 100, regular: raw.regular / 100, sale: raw.sale / 100 };
    if (!coherent(p.category, r.cats)) continue;
    // Price sanity: reference ex-VAT must be within 8x of our ex-VAT estimate
    // (kills bulk-pack listings and wrong-category matches).
    const oursEx = p.price / 1.16;
    if (r.price < oursEx / 8 || r.price > oursEx * 8) continue;
    const rt = new Set(tokens(r.name));
    if (rt.size === 0) continue;
    let shared = 0, singleTok = "";
    for (const t of pt) if (rt.has(t)) { shared++; singleTok = t; }
    if (shared < 1) continue;
    const score = shared / Math.min(pt.size, rt.size);
    // Single shared token must be specific (len>=6: helmet, harness, goggle...)
    // so generic "Safety gloves" can't match "Nitrile Disposable Gloves Box 100".
    const singleOk = shared === 1 && singleTok.length >= 6 && score >= 0.4;
    if (shared < 2 && !singleOk) continue;
    if (!packOk(`${p.name} ${p.short}`, r.name)) continue;
    let finalScore = score;
    // brand agreement bonus for branded products
    if (bt.length && bt.some((b) => rt.has(b))) finalScore += 0.25;
    // SKU fragment bonus
    const skuFrag = p.sku.split("-").pop() ?? "";
    if (skuFrag.length >= 3 && r.name.toLowerCase().includes(skuFrag.toLowerCase())) finalScore += 0.1;
    if (finalScore >= 0.35) cands.push({ ref: r, score: finalScore, shared });
  }
  if (!cands.length) continue;
  cands.sort((a, b) => b.score - a.score);
  // keep near-best candidates (within 0.12 of top score), max 6
  const top = cands[0].score;
  let pool = cands.filter((c) => top - c.score <= 0.12).slice(0, 6);
  // Branded products: prefer same-brand references when they exist
  // (a 3M muff should track 3M prices, not generic-muff prices).
  const bt2 = brandTokens(p.brand);
  let brandOverride: string | undefined;
  if (bt2.length) {
    const branded = pool.filter((c) => { const rt = new Set(tokens(c.ref.name)); return bt2.some((b) => rt.has(b)); });
    if (branded.length) {
      pool = branded;
    } else {
      // No same-brand comps: only a consensus of close generics may reprice,
      // and the listing drops to the generic brand for coherence.
      const tight = pool.filter((c) => c.score >= 0.75);
      if (tight.length >= 2) {
        const ps = tight.map((c) => c.ref.price).sort((a, b) => a - b);
        if (ps[ps.length - 1] / ps[0] <= 4) { pool = tight; brandOverride = "SafetyPro"; }
        else continue;
      } else continue;
    }
  }
  const W = (c: { score: number; shared: number }) => c.shared * c.shared * (0.5 + c.score); // token-overlap wins
  // Near-exact name match with a CLEAR lead (>=0.1 over runner-up):
  // its price wins outright (right tier). Otherwise weighted median.
  let median: number;
  let saleRefs = pool.filter((c) => c.ref.onSale && c.ref.regular > c.ref.price);
  if (pool[0].score >= 0.85 && (pool.length < 2 || pool[0].score - pool[1].score >= 0.1)) {
    median = round10(pool[0].ref.price * 1.16);
    saleRefs = saleRefs.filter((c) => c.ref.name === pool[0].ref.name);
  } else {
    median = wMedian(pool.map((c) => ({ price: round10(c.ref.price * 1.16), w: W(c) })));
  }
  const entry: { price: number; compareAt?: number; brand?: string; refs: Cand[] } = {
    price: median,
    ...(brandOverride ? { brand: brandOverride } : {}),
    refs: pool.map((c) => ({ site: c.ref.site, name: c.ref.name, exVat: c.ref.price, regular: c.ref.regular, onSale: c.ref.onSale })),
  };
  if (saleRefs.length) {
    const comp = wMedian(saleRefs.map((c) => ({ price: round10(c.ref.regular * 1.16), w: W(c) })));
    // Anchor must be a believable discount (up to 2x), else it's data noise.
    if (comp > median && comp <= median * 2) entry.compareAt = comp;
  }
  out[p.slug] = entry;
  matched++;
  for (const c of pool) matchCount[c.ref.site] = (matchCount[c.ref.site] ?? 0) + 1;
}

writeFileSync(join(root, "price-overrides.json"), JSON.stringify(out, null, 1));
console.log(`Matched ${matched}/${ALL_PRODUCTS.length} products.`);
console.log("Reference hits by site:", JSON.stringify(matchCount));

// Review table for the 24 curated products
console.log("\n--- curated 24 ---");
for (const p of ALL_PRODUCTS.slice(0, 24)) {
  const o = out[p.slug];
  if (!o) { console.log(`NO MATCH  ${p.slug} (KES ${p.price})`); continue; }
  const ex = o.refs.map((r) => `${r.site}:${r.exVat}`).join(" | ");
  console.log(`${o.compareAt ? "SALE" : "ok  "} ${p.slug}\n      ours ${p.price} -> ${o.price}${o.compareAt ? ` (was ${o.compareAt})` : ""}  refs[${ex}]`);
}
