// Incremental catalog builder: creates products ONLY for photos in
// public/images/products that no product references yet.
//
// Existing entries in src/lib/auto-catalog.ts are preserved byte-for-byte
// (stable slugs, SKUs, prices); new entries are appended. Photo angles of
// existing products (e.g. Foo_2.jpg) are NOT made into products — they are
// written to scripts/gallery-additions.json for merging into
// PRODUCT_GALLERIES in src/lib/catalog.ts. Byte-identical re-uploads and
// non-PPE files (books, etc.) are skipped.
//
// Run: node scripts/add-missing-products.mjs [--dry]   (--dry prints plan only)
//
// NOTE: generation helpers (RULES, humanize, ...) are copied verbatim from
// scripts/build-auto-catalog.mjs — keep in sync if that file changes.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const DRY = process.argv.includes("--dry");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "public", "images", "products");
const outFile = join(root, "src", "lib", "auto-catalog.ts");
const catalogFile = join(root, "src", "lib", "catalog.ts");
const galleryOut = join(root, "scripts", "gallery-additions.json");

let OVERRIDES = {};
try {
  OVERRIDES = JSON.parse(readFileSync(join(root, "scripts", "price-overrides.json"), "utf8"));
} catch { /* no overrides yet */ }

// ---- copied verbatim from build-auto-catalog.mjs (keep in sync) ----
const TAKEN = new Set([
  "helmet-full-brim.jpg", "hard-hat.jpg", "safety-boots.jpg", "gumboots.jpg",
  "cut-gloves.jpg", "nitrile-gloves.jpg", "chemical-gloves.jpg", "safety-glasses.jpg",
  "goggles.jpg", "ear-muffs.jpg", "ear-plugs.jpg", "dust-masks.jpg", "respirator.jpg",
  "hiviz-vest.jpg", "coverall.jpg", "disposable-coverall.jpg", "harness.jpg",
  "extinguisher.jpg", "first-aid.jpg", "cone.jpg", "barricade-tape.jpg",
  "welding-helmet.jpg", "rigger-gloves.jpg", "rainsuit.jpg",
]);

const SKIP_RE = /book|calendar|condom|suggestion-?box|pepper-?spray|stun-?gun|skating-?board|manifest/i;
const IMG_EXT = /\.(jpe?g|png|webp|gif)$/i;

const RULES = [
  [/ear[-\s]?muff|ear[-\s]?protector|hearing/i, "hearing-protection"],
  [/ear[-\s]?plugs?/i, "hearing-protection"],
  [/helmet|hard[-\s]?hat|bump[-\s]?cap|hair[-\s]?net|hair[-\s]?cap|bandana|balaclava|\bhats?\b/i, "head-protection"],
  [/gum-?boot|boot|shoe|jogger|groove|sole|croc|clog/i, "foot-protection"],
  [/glove|gl0ve/i, "hand-protection"],
  [/ladder|platform/i, "fall-protection"],
  [/goggle|spectacle|safety[-\s]?glass|face[-\s]?shield|shield|eye[-\s]?wash|\bglass\b|lens|polycarbonate/i, "eye-face-protection"],
  [/respirator|cartridge|dust[-\s]?masks?|kn95|ffp|cpr|face[-\s]?masks?|\bmasks?\b|surgical/i, "respiratory-protection"],
  [/^askari-(?!.*boot)/i, "protective-clothing"],
  [/vest|overall|coverall|dust[-\s]?coat|rain|jacket|uniform|apron|lab[-\s]?coat|parka|windbreaker|life[-\s]?jacket|life[-\s]?buoy|flotation|float|socks|arm[-\s]?band|baton|belt|suit|trouser|eskimo|dungaree|conti|smock|bib|coat|poncho|hijab|scrub|chest[-\s]?guard|body[-\s]?armor|body[-\s]?armour|shirt|gown|sleeve|pants|\bguards?\b|cape/i, "protective-clothing"],
  [/harness|lanyard|lifeline|climber|scaffold|shock[-\s]?absorber|safety[-\s]?rope|\brope\b|fall[-\s]?arrest|work[-\s]?position|pole[-\s]?climb/i, "fall-protection"],
  [/metal|cctv|camera|scanner/i, "road-site-safety"],
  [/extinguisher|fire|blanket|hose|alarm|bell|smoke|heat|detector|exit|stretcher|stetcher|wheel[-\s]?chair|crutch|first[-\s]?aid|blood|spill|sanitizer|thermo|stethoscope|sphygmo|dustbin|trauma|tourniquet|burn|aed|defibrillator|sharps|bio-?hazard|body[-\s]?bag|waste|medical|clinic|hospital|dispenser|crutches|bandage|gauze|plaster|antiseptic|oxygen|nebulizer|suction|delivery-?kit|spray|\bbp\b|aneroid|monitor|kidney/i, "fire-emergency"],
  [/cone|tape|barricade|barrier|sign|delineator|chain|fence|\bnet\b|triangle|megaphone|mega-?phone|traffic|parking|road|speed|whistle|seal|lock|bollard|slippery|caution|smoking|work-in-progress|men-at-work|school|crossing|pedestrian|speed-?bump|hump|ramp|gate|turnstile/i, "road-site-safety"],
];

const CAT_CODE = {
  "head-protection": "HD", "foot-protection": "FT", "hand-protection": "HA",
  "eye-face-protection": "EY", "hearing-protection": "HE", "respiratory-protection": "RP",
  "protective-clothing": "PC", "fall-protection": "FP", "fire-emergency": "FE", "road-site-safety": "RS",
};

const BASE_PRICE = {
  "head-protection": 1200, "foot-protection": 3500, "hand-protection": 600,
  "eye-face-protection": 700, "hearing-protection": 900, "respiratory-protection": 800,
  "protective-clothing": 2200, "fall-protection": 7500, "fire-emergency": 3000, "road-site-safety": 1200,
};

const INDUSTRIES = {
  "head-protection": ["construction", "oil-and-gas", "manufacturing", "mining", "logistics"],
  "foot-protection": ["construction", "manufacturing", "mining", "logistics", "oil-and-gas"],
  "hand-protection": ["manufacturing", "logistics", "construction", "agriculture"],
  "eye-face-protection": ["construction", "manufacturing", "engineering", "oil-and-gas"],
  "hearing-protection": ["manufacturing", "construction", "mining"],
  "respiratory-protection": ["construction", "manufacturing", "healthcare", "mining"],
  "protective-clothing": ["construction", "logistics", "security", "manufacturing", "oil-and-gas"],
  "fall-protection": ["construction", "engineering", "oil-and-gas"],
  "fire-emergency": ["manufacturing", "hospitality", "schools", "healthcare", "logistics"],
  "road-site-safety": ["construction", "logistics", "government", "security"],
};

const SIZES = {
  "foot-protection": ["39", "40", "41", "42", "43", "44", "45", "46"],
  "hand-protection": ["M", "L", "XL", "XXL"],
  "protective-clothing": ["M", "L", "XL", "XXL"],
  "head-protection": ["Adjustable"],
};
const COLOURS = {
  "head-protection": ["Yellow", "White"], "foot-protection": ["Black"],
  "protective-clothing": ["Navy", "Orange"], "road-site-safety": ["Orange"],
};

const KNOWN_BRANDS = [
  ["vaultex", "Vaultex"], ["ultimate-plus", "Ultimate Plus"], ["ultimate", "Ultimate Plus"],
  ["protecta", "Protecta"], ["jsp", "JSP"], ["3m", "3M"], ["honeywell", "Honeywell"],
  ["msa", "MSA"], ["ansell", "Ansell"], ["uvex", "Uvex"], ["delta", "Delta Plus"],
  ["portwest", "Portwest"], ["caterpillar", "Caterpillar"], ["cat ", "Caterpillar"],
  ["drager", "Dräger"], ["hiview", "Hiview"], ["hiviw", "Hiview"], ["rocklander", "Rocklander"],
  ["rockland", "Rocklander"], ["bestboy", "Bestboy"], ["bestgirl", "Bestgirl"], ["bestlady", "Bestlady"],
  ["bata", "Bata"], ["askari", "Askari"], ["allen-cooper", "Allen Cooper"], ["yamato", "Yamato"],
  ["titan", "Titan"], ["viking", "Viking"], ["longmao", "Longmao"], ["garrett", "Garrett"],
  ["alphagomed", "Alphagomed"], ["knicker", "Knicker"], ["porcupine", "Porcupine"],
  ["sandak", "Sandak"], ["shujaa", "Shujaa"], ["workman", "Workman"], ["ace", "ACE"],
  ["duma", "ACE"], ["mamba", "ACE"], ["hummock", "Hummock"], ["fireup", "Fireup"],
  ["technica", "Technica"], ["worksafe", "Worksafe"], ["strom", "Strom"], ["krickwood", "KrickWood"],
  ["krick", "KrickWood"], ["taha", "Taha"], ["titan", "Titan"], ["total", "Total"],
];

const ACRONYM = new Set(["ppe", "pvc", "en", "ffp2", "ffp3", "kn95", "nrr", "snr", "co2", "led", "cctv", "gsm", "uv", "abs", "hdpe", "usb", "3m", "kebs", "aed", "cpr", "ip", "ac", "dc", "bb", "aa", "ht", "ksm", "psv", "hd", "a1", "a2", "a3", "nr", "nr-d", "fr", "s1", "s2", "s3", "xl", "xxl"]);

function hash(s) { return parseInt(createHash("md5").update(s).digest("hex").slice(0, 8), 16); }

function humanize(file) {
  let base = basename(file, extname(file));
  base = base.replace(/nairobi-?safety-?shop|bansi-?safety-?gear/gi, "").replace(/gl0ves/gi, "gloves").replace(/[-_+.]+/g, " ").replace(/\s+/g, " ").trim();
  return base.split(" ").map((w) => {
    const clean = w.replace(/[^a-z0-9]/gi, "");
    if (!clean) return w;
    if (ACRONYM.has(clean.toLowerCase())) return clean.toUpperCase();
    if (/^\d/.test(clean)) return clean.toUpperCase();
    return clean[0].toUpperCase() + clean.slice(1).toLowerCase();
  }).join(" ");
}

function certs(name) {
  const out = [];
  const n = ` ${name} `;
  if (/en[-\s]?397/i.test(n)) out.push("EN 397");
  if (/en[-\s]?388/i.test(n)) out.push("EN 388");
  if (/en[-\s]?166/i.test(n)) out.push("EN 166");
  if (/en[-\s]?352/i.test(n)) out.push("EN 352");
  if (/en[-\s]?1149/i.test(n)) out.push("EN 1149");
  if (/en[-\s]?343/i.test(n)) out.push("EN 343");
  if (/ffp2/i.test(n)) out.push("EN 149 FFP2");
  if (/ffp3/i.test(n)) out.push("EN 149 FFP3");
  if (/kn95/i.test(n)) out.push("KN95");
  if (/\bkebs\b/i.test(n)) out.push("KEBS");
  if (/\bs3\b/i.test(n)) out.push("EN ISO 20345 S3");
  return [...new Set(out)];
}

const COLORS = ["luminous green", "hivis orange", "navy blue", "sky blue", "light yellow", "red", "blue", "green", "yellow", "orange", "black", "white", "grey", "gray", "maroon", "brown", "silver", "clear", "transparent", "multicolor", "multicolour"];
const MATERIALS = [
  ["fibre-glass|fibreglass", "Fibreglass"], ["stainless", "Stainless steel"], ["aluminium|aluminum", "Aluminium"],
  ["polycarbonate", "Polycarbonate"], ["leather", "Leather"], ["pvc", "PVC"], ["nitrile", "Nitrile"],
  ["latex", "Latex"], ["cotton", "Cotton"], ["steel", "Steel"], ["rubber", "Rubber"],
  ["canvas", "Canvas"], ["plastic", "Plastic"], ["metal", "Metal"], ["mesh", "Mesh"],
  ["fabric", "Fabric"], ["glass", "Glass"], ["wooden|wood", "Wood"], ["chrome", "Chrome"],
];
const SIZE_UNIT = [
  [/(\d+(?:\.\d+)?)\s?gsm/i, "Fabric weight", (v) => `${v} GSM`],
  [/(\d+(?:\.\d+)?)\s?kg/i, "Capacity", (v) => `${v} kg`],
  [/(\d+(?:\.\d+)?)\s?ml/i, "Capacity", (v) => `${v} ml`],
  [/(\d+(?:\.\d+)?)\s?(ltr|litre)s?/i, "Capacity", (v) => `${v} L`],
  [/(\d+(?:\.\d+)?)\s?l\b/i, "Capacity", (v) => `${v} L`],
  [/(\d+(?:\.\d+)?)\s?(meter|metre)s?/i, "Length", (v) => `${v} m`],
  [/(\d+(?:\.\d+)?)\s?(inch|inches|")/i, "Size", (v) => `${v} inch`],
  [/(\d+(?:\.\d+)?)\s?(pcs|pieces)/i, "Pack quantity", (v) => `${v} pcs`],
  [/(\d+)\s?steps?/i, "Steps", (v) => `${v}`],
  [/(\d+)\s?watts?/i, "Power", (v) => `${v} W`],
  [/(\d+)\s?amps?/i, "Current", (v) => `${v} A`],
  [/\ba([123])\b/i, "Sign size", (v) => `A${v.toUpperCase()}`],
];

function extractAttrs(raw) {
  const n = ` ${raw.toLowerCase().replace(/[-_+.]+/g, " ")} `;
  const attrs = [];
  const seen = new Set();
  const push = (key, value) => { if (!seen.has(key)) { seen.add(key); attrs.push({ key, value }); } };
  for (const [re, key, fmt] of SIZE_UNIT) {
    const m = n.match(re);
    if (m) push(key, fmt(m[1]));
  }
  for (const c of COLORS) {
    if (n.includes(c)) { push("Colour", c.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")); break; }
  }
  for (const [re, label] of MATERIALS) {
    if (new RegExp(re, "i").test(n)) push("Material", label);
  }
  const db = n.match(/(snr|nrr)\s?(\d+)\s?db/i);
  if (db) push("Rating", `${db[1].toUpperCase()} ${db[2]} dB`);
  const kv = n.match(/(\d+)\s?kv/i);
  if (kv) push("Voltage class", `${kv[1]} kV`);
  return attrs;
}

const USE_OPENERS = [
  "Specified for daily use on Kenyan worksites,",
  "A site-proven choice for Kenyan contractors,",
  "Built for tough site conditions across Kenya,",
];
const USE_CLOSERS = [
  "Standardise it across your workforce and re-order on one LPO.",
  "Issue it per worker and track replacements from your SafetyPro account.",
  "Add it to your site PPE schedule for consistent compliance.",
];

const APP_COPY = {
  "head-protection": "Helmets take the hit so skulls don't: shells are rated to absorb crown impacts and resist penetration from falling objects, while the cradle keeps the shell positioned through bending, climbing and wind. Replace any helmet after a significant impact, retire shells after about five years (check the moulded date dial), and store out of direct sun — UV degrades HDPE faster on Kenyan sites than in temperate climates. Match vented shells to general construction and unvented where electrical insulation is specified.",
  "foot-protection": "Feet face the everyday site hazards — nails, mesh offcuts, wet slabs, falling blocks and oil. Look for the rating your risk assessment demands: S3 (toe cap plus puncture plate and cleated outsole) is the sensible default for construction and industry, S1P suits dry warehouses, and gumboots cover wet, chemical and food areas. Buy to measured afternoon fittings, rotate two pairs of moisture-wicking socks per worker, and retire boots when tread wears smooth — typically 6 to 12 months of daily site use.",
  "hand-protection": "Hands need the right glove for the chemistry and the cut risk — there is no universal glove. Check cut performance (EN 388 coupe levels) for glass, sheet metal and warehousing; check the chemical permeation chart and breakthrough time for solvents, pesticides and cleaning agents; and size up in thickness and length for immersion work. Treat gloves as consumables with a change schedule, keep spares at the point of use, and store elastomers away from sun and ozone which crack them.",
  "eye-face-protection": "Eyes are injured by grinding sparks, chemical splash, dust and UV — often in seconds. Polycarbonate lenses give impact resistance plus inherent UV filtration; add anti-scratch for longevity and anti-fog for humid packhouses and kitchens. Sealed goggles suit spraying and dusty grinding bays, while face shields pair with helmets for overhead work. Keep a visitor stock of glasses at the gate and replace any lens that is pitted, crazed or scratched.",
  "hearing-protection": "Noise damage is permanent and painless, so protection must be worn for the full exposure — comfort decides compliance. Compare the SNR rating against your noise survey and allow for real-world derating; muffs suit intermittent high noise and visitors, while corded plugs suit all-shift factory and warehouse issue. Pair either with helmets where specified, and train crews that removing protection for even part of a shift defeats it.",
  "respiratory-protection": "Dust and fumes cause damage workers can't feel until years later. Match the device to the hazard: FFP2 disposables for cement, flour, grain and quarry dust; half-face respirators with the correct cartridges (A2P3 covers organic vapours plus particulates) for spraying, painting and solvents. Fit-check every donning, observe filter change schedules, keep facial-seal areas clean-shaven, and store respirators sealed away from contamination.",
  "protective-clothing": "Workwear is the uniform of a serious site: it identifies your crew, carries reflective visibility after dark, and stands between skin and abrasion, splash and weather. Check fabric weight (GSM) against the job — heavier weaves for welding and grinding, breathable blends for packhouses — and confirm reflective tape class for night road work. Size per employee from the size schedule, launder to the care label to preserve reflectivity, and re-issue on a cycle rather than on failure.",
  "fall-protection": "Falls kill more construction workers than any other hazard, and the system is only as strong as its weakest link: certified anchor, connecting device, harness, and a rescue plan. Inspect webbing, stitching, D-rings and buckles before every use and retire anything shock-loaded, abraded or sun-rotted. Twin-leg lanyards keep a worker attached while moving between anchors, and shock absorbers limit arrest forces on the body. Never work at height without a written rescue plan — suspension trauma kills in minutes.",
  "fire-emergency": "Fire equipment only works if it is the right class, charged, reachable and understood. Match the extinguishing agent to the fuel (powder for mixed risks, CO2 for electrical, wet chemical for kitchens, water for ordinary combustibles), mount units on the escape route — never behind stock — and check gauges monthly with annual servicing by a licensed technician. Back the hardware with signage, emergency lighting, drills and a stocked first aid point, and log every check for your auditor.",
  "road-site-safety": "Most site incidents involve vehicles, plant or the public wandering in — separation and visibility prevent them. Cone and tape cordons to a plan (tapers, not walls), post advance warning signs drivers can read at speed, and use reflective and solar gear for night work. Barricading is a system: delineate, warn, illuminate, and assign a banksman wherever plant reverses. Re-quote cordons per phase of works, not once per project.",
};

function attrPhrase(attrs, name) {
  const bits = [];
  const hasNum = (v) => { const m = String(v).match(/(\d+(?:\.\d+)?)/); return m && name.toLowerCase().includes(m[1].toLowerCase()); };
  const g = (k) => attrs.find((a) => a.key === k)?.value;
  if (g("Material")) bits.push(g("Material"));
  if (g("Colour")) bits.push(g("Colour").toLowerCase());
  if (g("Capacity") && !hasNum(g("Capacity"))) bits.push(g("Capacity"));
  if (g("Length") && !hasNum(g("Length"))) bits.push(g("Length"));
  if (g("Size") && !hasNum(g("Size"))) bits.push(g("Size"));
  if (g("Fabric weight") && !hasNum(g("Fabric weight"))) bits.push(`${g("Fabric weight")} fabric`);
  if (g("Pack quantity") && !hasNum(g("Pack quantity"))) bits.push(`pack of ${g("Pack quantity")}`);
  if (g("Rating")) bits.push(g("Rating"));
  if (g("Voltage class")) bits.push(`${g("Voltage class")} rated`);
  return bits.length ? ` in ${bits.join(" · ")}` : "";
}

// SEO-rich category keyword phrases (buy-intent terms buyers search for).
const CAT_KEYWORDS = {
  "head-protection": "safety helmets & hard hats",
  "foot-protection": "safety boots & gumboots",
  "hand-protection": "safety gloves",
  "eye-face-protection": "safety glasses & goggles",
  "hearing-protection": "hearing protection",
  "respiratory-protection": "respirators & dust masks",
  "protective-clothing": "coveralls & hi-vis workwear",
  "fall-protection": "fall protection harnesses & lanyards",
  "fire-emergency": "fire safety equipment",
  "road-site-safety": "road & site safety equipment",
};

function buildShort(name, cat, attrs, cert, h) {
  const hook = attrPhrase(attrs, name);
  const benefit = {
    "head-protection": "crown impact and penetration protection",
    "foot-protection": "toe, sole and slip protection",
    "hand-protection": "grip with cut and chemical defence",
    "eye-face-protection": "impact, splash and dust defence",
    "hearing-protection": "all-shift noise defence",
    "respiratory-protection": "dust, mist and fume defence",
    "protective-clothing": "crew-ready cover with visibility options",
    "fall-protection": "certified arrest for height work",
    "fire-emergency": "first-response readiness",
    "road-site-safety": "cordon, warn and illuminate",
  }[cat];
  return `${name}${hook} — ${benefit}. Buy online in Kenya at the best price.`;
}

function buildDescription(name, brand, cat, attrs, cert, inds, h) {
  const hook = attrPhrase(attrs, name);
  const kw = CAT_KEYWORDS[cat] ?? "safety equipment";
  const std = cert.length
    ? ` Declared to ${cert.join(" and ")}, with conformity documentation available on request — only standards held on file are ever listed.`
    : ` Carried in our stocked workplace range, with sizing and specification guidance available before you order.`;
  const p1 = `Buy the ${name}${hook} online in Kenya at the best price from ${brand} — quality ${kw} with M-Pesa payment, VAT invoice and Kenya-wide delivery.${std}`;
  const p2 = APP_COPY[cat];
  const apps = inds.map((i) => i.replace(/-/g, " ")).join(", ");
  const p3 = `${USE_OPENERS[h % USE_OPENERS.length]} it suits ${apps}. Buy online today: Nairobi stock, Kenya-wide dispatch, VAT invoicing and LPO terms for approved accounts. ${USE_CLOSERS[(h >> 4) % USE_CLOSERS.length]}`;
  return `${p1}\n\n${p2}\n\n${p3}`;
}

function buildSpecs(name, cat, attrs, cert, inds) {
  const rows = [{ key: "Product", value: name }];
  for (const a of attrs.slice(0, 5)) rows.push(a);
  if (cert.length) rows.push({ key: "Standard", value: cert.join(", ") });
  rows.push({ key: "Typical use", value: inds.map((i) => i.replace(/-/g, " ")).join(", ") });
  rows.push({ key: "Supply", value: "Nairobi stock · Kenya-wide delivery · VAT invoice" });
  return rows.slice(0, 8);
}
// ---- end copied helpers ----

// ---- incremental-only helpers ----
const unify = (s) => s.toLowerCase().replace(/[-_+.]+/g, " ").replace(/\s+/g, " ").trim();
const noExt = (f) => f.replace(/\.(jpe?g|png|webp|gif)$/i, "");
function stemOf(base) {
  let m = base.match(/^(.*?)([-_ ]\(?\d+\)?| \(\d+\))$/);
  if (m) return { stem: unify(m[1]), variant: true };
  m = base.match(/^(.*[A-Za-z])(\d{1,3})$/);
  if (m) return { stem: unify(m[1]), variant: true };
  return { stem: unify(base), variant: false };
}
const sha1 = (p) => createHash("sha1").update(readFileSync(p)).digest("hex");
const lit = (v) => JSON.stringify(v);

// ---- parse existing state ----
const autoText = readFileSync(outFile, "utf8");
const catText = readFileSync(catalogFile, "utf8");

const existingSlugs = new Set();
for (const m of autoText.matchAll(/slug:\s*"([^"]+)"/g)) existingSlugs.add(m[1]);
const productsBlock = catText.match(/export const PRODUCTS: CatalogProduct\[\] = \[([\s\S]*?)\n\];/);
if (productsBlock) for (const m of productsBlock[1].matchAll(/slug:\s*"([^"]+)"/g)) existingSlugs.add(m[1]);

const existingImages = new Set(); // filenames already shown anywhere
for (const m of autoText.matchAll(/\/images\/products\/([^"]+)/g)) existingImages.add(m[1]);
const pimBlock = catText.match(/export const PRODUCT_IMAGES[^=]*=\s*\{([\s\S]*?)\n\};/);
const slugToImageFile = {};
if (pimBlock) for (const m of pimBlock[1].matchAll(/"([^"]+)":\s*"\/images\/products\/([^"]+)"/g)) {
  existingImages.add(m[2]);
  slugToImageFile[m[1]] = m[2];
}
for (const m of autoText.matchAll(/slug:\s*"([^"]+)"[\s\S]*?image:\s*"\/images\/products\/([^"]+)"/g)) {
  slugToImageFile[m[1]] = m[2];
}
const galBlock = catText.match(/export const PRODUCT_GALLERIES[^=]*=\s*\{([\s\S]*?)\n\};/);
const galleryFiles = new Set();
if (galBlock) for (const m of galBlock[1].matchAll(/\/images\/products\/([^"]+)/g)) {
  existingImages.add(m[1]);
  galleryFiles.add(m[1]);
}

// stem -> existing slugs (for variant matching)
const stemToSlugs = {};
for (const [slug, file] of Object.entries(slugToImageFile)) {
  const st = stemOf(noExt(file)).stem;
  (stemToSlugs[st] = stemToSlugs[st] || []).push(slug);
}
for (const s of existingSlugs) {
  const k = unify(s);
  if (!stemToSlugs[k]) stemToSlugs[k] = [s];
}

// max SKU per category code
const maxSku = {};
for (const m of autoText.matchAll(/sku:\s*"SP-([A-Z]+)-(\d+)"/g)) {
  maxSku[m[1]] = Math.max(maxSku[m[1]] ?? 0, Number(m[2]));
}
const oldCount = [...autoText.matchAll(/slug:\s*"([^"]+)"/g)].length;

// ---- scan + group ----
const MIN_SIZE = 3500;
const allFiles = readdirSync(imgDir).filter((f) => IMG_EXT.test(f)).sort();
const skipped = [];
const candidates = [];
for (const file of allFiles) {
  if (SKIP_RE.test(file)) { skipped.push([file, "non-PPE"]); continue; }
  if (TAKEN.has(file)) continue;
  if (existingImages.has(file)) continue;
  try {
    if (readFileSync(join(imgDir, file)).length < MIN_SIZE) { skipped.push([file, "too small"]); continue; }
  } catch { skipped.push([file, "unreadable"]); continue; }
  candidates.push(file);
}

const groups = {};
for (const f of candidates) {
  const { stem } = stemOf(noExt(f));
  (groups[stem] = groups[stem] || []).push(f);
}

const newEntries = [];
const galleryAdds = {}; // slug -> [urls]
const identicalSkipped = [];
const unclassified = [];
const usedSlugs = new Set(existingSlugs);
const skuCounters = { ...maxSku };

function pickSlug(base) {
  let slug = base, n = 1;
  while (usedSlugs.has(slug)) { n += 1; slug = `${base}-${n}`; }
  usedSlugs.add(slug);
  return slug;
}

function makeProduct(primaryFile, extraFiles) {
  const lower = primaryFile.toLowerCase();
  const rule = RULES.find(([re]) => re.test(lower));
  const cat = rule ? rule[1] : "road-site-safety";
  if (!rule) unclassified.push(primaryFile);
  const name = humanize(primaryFile);
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "ppe-item";
  const slug = pickSlug(baseSlug);
  const h = hash(primaryFile);
  const base = BASE_PRICE[cat];
  const price = Math.round((base * (0.8 + (h % 45) / 100)) / 50) * 50;
  const hasCompare = h % 4 === 0;
  const compareAt = hasCompare ? Math.round((price * (1.15 + (h % 15) / 100)) / 50) * 50 : undefined;
  const code = CAT_CODE[cat];
  skuCounters[code] = (skuCounters[code] ?? 200) + 1;
  const sku = `SP-${code}-${skuCounters[code]}`;
  const stock = 20 + (h % 480);
  const rating = 4.3 + ((h >> 3) % 7) / 10;
  const reviews = 5 + (h % 195);
  const cert = certs(name);
  const brand = KNOWN_BRANDS.find(([k]) => lower.includes(k))?.[1] ?? "SafetyPro";
  const inds = INDUSTRIES[cat];
  const attrs = extractAttrs(primaryFile);
  const specs = buildSpecs(name, cat, attrs, cert, inds);
  const entry = {
    id: `auto-${slug}`, name, slug, sku, brand, category: cat, price, compareAt,
    vatInclusive: true, stock, rating: Number(rating.toFixed(1)), reviews,
    featured: false, isNew: (h % 9 === 0) || undefined,
    short: buildShort(name, cat, attrs, cert, h),
    description: buildDescription(name, brand, cat, attrs, cert, inds, h),
    specs, certifications: cert, industries: inds,
    applications: inds.map((i) => i.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")),
    sizes: SIZES[cat] ?? ["One size"], colours: COLOURS[cat] ?? ["As shown"],
    image: `/images/products/${primaryFile}`,
    ...(OVERRIDES[slug] ? {
      price: OVERRIDES[slug].price,
      compareAt: OVERRIDES[slug].compareAt,
      ...(OVERRIDES[slug].brand ? { brand: OVERRIDES[slug].brand } : {}),
    } : {}),
  };
  newEntries.push(entry);
  if (extraFiles.length) galleryAdds[slug] = extraFiles.map((f) => `/images/products/${f}`);
  return entry;
}

for (const stem of Object.keys(groups).sort()) {
  const arr = groups[stem].sort();
  const known = (stemToSlugs[stem] || []).filter((s) => existingSlugs.has(s));
  if (known.length) {
    // Extra angles for existing product(s) — attach only genuinely new photos.
    let target = known.find((s) => unify(s) === stem) ?? known[0];
    const refFile = slugToImageFile[target];
    const refDigest = refFile ? sha1(join(imgDir, refFile)) : null;
    const fresh = [];
    for (const f of arr) {
      if (refDigest && sha1(join(imgDir, f)) === refDigest) { identicalSkipped.push([f, `identical to ${target}`]); continue; }
      fresh.push(f);
    }
    if (fresh.length) galleryAdds[target] = [...(galleryAdds[target] || []), ...fresh.map((f) => `/images/products/${f}`)];
  } else {
    // Brand-new product. Base file (no numeric suffix) is primary; rest are gallery.
    const baseFile = arr.find((f) => !stemOf(noExt(f)).variant) ?? arr[0];
    const rest = arr.filter((f) => f !== baseFile);
    makeProduct(baseFile, rest);
  }
}

// ---- report ----
const byCat = {};
for (const p of newEntries) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
console.log(`CANDIDATES: ${candidates.length} unreferenced files in ${Object.keys(groups).length} groups`);
console.log(`NEW PRODUCTS: ${newEntries.length}`, JSON.stringify(byCat));
console.log(`GALLERY ADDS: ${Object.keys(galleryAdds).filter((k) => !newEntries.find((p) => p.slug === k)).length} existing slugs, ${identicalSkipped.length} byte-identical skipped`);
for (const [k, v] of Object.entries(galleryAdds)) {
  if (!newEntries.find((p) => p.slug === k)) console.log(`  ${k}: ${v.join(", ")}`);
}
console.log(`SKIPPED non-PPE/too-small (${skipped.length}):`, skipped.map(([f, r]) => `${f} [${r}]`).join("; "));
if (identicalSkipped.length) console.log(`IDENTICAL (${identicalSkipped.length}):`, identicalSkipped.map(([f, r]) => `${f} [${r}]`).join("; "));
if (unclassified.length) console.log(`UNCLASSIFIED -> road-site-safety (${unclassified.length}):`, unclassified.slice(0, 20).join(", ") + (unclassified.length > 20 ? ` (+${unclassified.length - 20} more)` : ""));
console.log("SKU continuity:", JSON.stringify(skuCounters));
console.log(`\nSAMPLE new products (first 25 of ${newEntries.length}):`);
for (const p of newEntries.slice(0, 25)) console.log(`  [${p.category}] ${p.name} | ${p.slug} | KES ${p.price} | ${p.sku}`);
const suffixed = newEntries.filter((p) => /-\d+$/.test(p.slug) && existingSlugs.has(p.slug.replace(/-\d+$/, "")));
console.log(`Slugs with -N collision suffix: ${suffixed.length}`, suffixed.slice(0, 10).map((p) => p.slug).join(", "));

if (DRY) { console.log("\n--dry: no files written."); process.exit(0); }

// ---- append to auto-catalog.ts (existing entries untouched) ----
let blocks = "";
for (const p of newEntries) {
  blocks += `  {\n`;
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) continue;
    blocks += `    ${k}: ${lit(v)},\n`;
  }
  blocks += `  },\n`;
}
let updated = autoText
  .replace("// AUTO-GENERATED by scripts/build-auto-catalog.mjs — do not edit by hand.",
    "// AUTO-GENERATED by scripts/build-auto-catalog.mjs + scripts/add-missing-products.mjs — do not edit by hand.")
  .replace(/\/\/ \d+ products built from photos/, `// ${oldCount + newEntries.length} products built from photos`)
  .replace(/\];\s*$/, blocks + "];\n");
if (updated === autoText) throw new Error("append failed: anchor not found");
writeFileSync(outFile, updated);
writeFileSync(galleryOut, JSON.stringify(galleryAdds, null, 2) + "\n");
console.log(`\nAppended ${newEntries.length} products -> src/lib/auto-catalog.ts (${oldCount} -> ${oldCount + newEntries.length})`);
console.log(`Gallery map (${Object.keys(galleryAdds).length} slugs) -> scripts/gallery-additions.json — merge into PRODUCT_GALLERIES in src/lib/catalog.ts`);
