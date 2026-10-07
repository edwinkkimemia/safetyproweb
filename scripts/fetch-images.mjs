// Downloads real Unsplash photography into public/images.
// Each slot tries candidate photo IDs in order; first valid image wins.
// Run: node scripts/fetch-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Candidate pools (verified at runtime — first 200 with image/* wins)
const P = {
  craneSite: ["1504307651254-35680f356dfd", "1541888946425-d81bb19240f5", "1429497419816-9ca5cfb4571a"],
  crewPlans: ["1541888946425-d81bb19240f5", "1504307651254-35680f356dfd", "1581094794329-c8112a89af12"],
  silhouette: ["1429497419816-9ca5cfb4571a", "1504307651254-35680f356dfd", "1541888946425-d81bb19240f5"],
  engineer: ["1581094794329-c8112a89af12", "1581091226825-a6a2a5aee158", "1581092918056-0c4c3acd3789"],
  engineerF: ["1581091226825-a6a2a5aee158", "1581094794329-c8112a89af12", "1581092918056-0c4c3acd3789"],
  engineer2: ["1581092918056-0c4c3acd3789", "1581092160607-ee22621dd758", "1581094794329-c8112a89af12"],
  welding: ["1621905251189-08b45d6a269e", "1537462715879-360eeb61a0ad", "1516937941344-00b4e0337589"],
  factory: ["1567789884554-0b844b597180", "1531482615713-2afd69097998", "1516937941344-00b4e0337589"],
  factory2: ["1531482615713-2afd69097998", "1567789884554-0b844b597180", "1581091226825-a6a2a5aee158"],
  gears: ["1516937941344-00b4e0337589", "1567789884554-0b844b597180", "1537462715879-360eeb61a0ad"],
  refinery: ["1513828583688-c52646db42da", "1581094794329-c8112a89af12", "1504307651254-35680f356dfd"],
  lab: ["1579154204601-01588f351e67", "1595855759920-86582396756a", "1581094794329-c8112a89af12"],
  clinic: ["1576091160399-112ba8d25d1d", "1579684389244-ff07259c0fbb", "1579154204601-01588f351e67"],
  warehouse: ["1586528116311-ad8dd3c8310d", "1553413077-190dd305871c", "1578575437130-527eed3abbec"],
  aisle: ["1553413077-190dd305871c", "1586528116311-ad8dd3c8310d", "1578575437130-527eed3abbec"],
  boxes: ["1578575437130-527eed3abbec", "1586528116311-ad8dd3c8310d", "1601584115197-04ecc0da31d7"],
  highway: ["1519003722824-194d4455a60c", "1449965408869-eaa3f722e40d", "1582139329536-e7284fece509"],
  road: ["1449965408869-eaa3f722e40d", "1519003722824-194d4455a60c", "1465447142348-e9952c393450"],
  roadworks: ["1582139329536-e7284fece509", "1504307651254-35680f356dfd", "1519003722824-194d4455a60c"],
  farm: ["1500937386664-56d1dfef3854", "1464226184884-fa280b87c399", "1574323347407-f5e1ad6d020b"],
  field: ["1464226184884-fa280b87c399", "1500937386664-56d1dfef3854", "1560493676-04071c5f467b"],
  greenhouse: ["1530836369250-ef72a3f5cda8", "1592982537447-7440770cbfc9", "1625246333195-78d9c38ad449"],
  tractor: ["1625246333195-78d9c38ad449", "1500937386664-56d1dfef3854", "1560493676-04071c5f467b"],
  energy: ["1466611653911-95081537e5b7", "1509391366360-2e959784a276", "1513828583688-c52646db42da"],
  solar: ["1509391366360-2e959784a276", "1466611653911-95081537e5b7", "1473341304172-971dccb5ac1e"],
  hotel: ["1566073771259-6a8506099945", "1582719508461-905c673771fd", "1414235077428-338989a2e8c0"],
  restaurant: ["1414235077428-338989a2e8c0", "1566073771259-6a8506099945", "1517248135467-4c7edcad34c4"],
  classroom: ["1509062522246-3755977927d7", "1577896851231-70ef18881754", "1580582932707-520aed937b7b"],
  city: ["1449824913935-59a10b8d2000", "1477959858617-67f85cf4f1df", "1486406146926-c627a92ad1ab"],
  cityNight: ["1477959858617-67f85cf4f1df", "1449824913935-59a10b8d2000", "1486406146926-c627a92ad1ab"],
  tower: ["1486406146926-c627a92ad1ab", "1449824913935-59a10b8d2000", "1487958449943-2429e8be8625"],
  team: ["1521737604893-d14cc237f11d", "1522071820081-009f0129c71c", "1521791136064-7986c2920216"],
  handshake: ["1521791136064-7986c2920216", "1521737604893-d14cc237f11d", "1454165804606-c3d57bc86b40"],
  office: ["1497366216548-37526070297c", "1454165804606-c3d57bc86b40", "1560179707-f14e90ef3623"],
  containers: ["1494412574643-ff11b0a5c1c3", "1592805144716-feeccccef5ac", "1578575437130-527eed3abbec"],
  helmet: ["1587293852726-70cdb56c2866", "1504307651254-35680f356dfd", "1541888946425-d81bb19240f5"],
  rain: ["1515694346937-94d85e41e6f0", "1428592953211-077101b2021b", "1477959858617-67f85cf4f1df"],
};

/** [output file, pool key, width] */
const SLOTS = [
  // hero
  ["hero.jpg", "craneSite", 1800],
  ["cta-bulk.jpg", "crewPlans", 1200],
  // categories
  ["categories/head-protection.jpg", "helmet", 800],
  ["categories/foot-protection.jpg", "craneSite", 800],
  ["categories/hand-protection.jpg", "factory2", 800],
  ["categories/eye-face-protection.jpg", "engineerF", 800],
  ["categories/hearing-protection.jpg", "factory", 800],
  ["categories/respiratory-protection.jpg", "refinery", 800],
  ["categories/protective-clothing.jpg", "highway", 800],
  ["categories/fall-protection.jpg", "silhouette", 800],
  ["categories/fire-emergency.jpg", "refinery", 800],
  ["categories/road-site-safety.jpg", "roadworks", 800],
  // products (24)
  ["products/helmet-full-brim.jpg", "helmet", 800],
  ["products/hard-hat.jpg", "crewPlans", 800],
  ["products/safety-boots.jpg", "craneSite", 800],
  ["products/gumboots.jpg", "farm", 800],
  ["products/cut-gloves.jpg", "factory2", 800],
  ["products/nitrile-gloves.jpg", "lab", 800],
  ["products/chemical-gloves.jpg", "greenhouse", 800],
  ["products/safety-glasses.jpg", "engineerF", 800],
  ["products/goggles.jpg", "lab", 800],
  ["products/ear-muffs.jpg", "factory", 800],
  ["products/ear-plugs.jpg", "gears", 800],
  ["products/dust-masks.jpg", "silhouette", 800],
  ["products/respirator.jpg", "engineer", 800],
  ["products/hiviz-vest.jpg", "highway", 800],
  ["products/coverall.jpg", "engineer2", 800],
  ["products/disposable-coverall.jpg", "clinic", 800],
  ["products/harness.jpg", "craneSite", 800],
  ["products/extinguisher.jpg", "refinery", 800],
  ["products/first-aid.jpg", "clinic", 800],
  ["products/cone.jpg", "road", 800],
  ["products/barricade-tape.jpg", "roadworks", 800],
  ["products/welding-helmet.jpg", "welding", 800],
  ["products/rigger-gloves.jpg", "boxes", 800],
  ["products/rainsuit.jpg", "rain", 800],
  // industries (14)
  ["industries/construction.jpg", "craneSite", 800],
  ["industries/oil-and-gas.jpg", "refinery", 800],
  ["industries/manufacturing.jpg", "factory", 800],
  ["industries/agriculture.jpg", "tractor", 800],
  ["industries/flower-farms.jpg", "greenhouse", 800],
  ["industries/mining.jpg", "silhouette", 800],
  ["industries/logistics.jpg", "containers", 800],
  ["industries/healthcare.jpg", "clinic", 800],
  ["industries/engineering.jpg", "welding", 800],
  ["industries/hospitality.jpg", "hotel", 800],
  ["industries/schools.jpg", "classroom", 800],
  ["industries/government.jpg", "tower", 800],
  ["industries/ngo.jpg", "team", 800],
  ["industries/security.jpg", "cityNight", 800],
];

async function fetchOne(file, poolKey, w) {
  for (const id of P[poolKey]) {
    try {
      const res = await fetch(U(id, w));
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.startsWith("image/")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 8000) continue;
      const dest = join(root, file);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      console.log(`OK   ${file}  <- ${id}  (${(buf.length / 1024).toFixed(0)}KB)`);
      return true;
    } catch { /* try next */ }
  }
  console.log(`FAIL ${file}  (pool ${poolKey} exhausted)`);
  return false;
}

let ok = 0, fail = 0;
for (const [file, pool, w] of SLOTS) {
  // eslint-disable-next-line no-await-in-loop
  if (await fetchOne(file, pool, w)) ok++; else fail++;
}
console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
process.exit(fail ? 1 : 0);
