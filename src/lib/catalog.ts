// Static catalog — mirrors the Prisma seed data.
// Used as a graceful fallback when PostgreSQL is unreachable so every
// button, filter and page works out of the box. When DATABASE_URL is live,
// src/lib/data.ts serves the same shapes from Prisma instead.
import { AUTO_PRODUCTS } from "./auto-catalog";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string; // category slug
  price: number;
  compareAt?: number;
  vatInclusive: boolean;
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  isNew?: boolean;
  short: string;
  description: string;
  specs: { key: string; value: string }[];
  certifications: string[]; // only values stored in DB — never invented
  industries: string[]; // industry slugs
  applications: string[];
  sizes: string[];
  colours: string[];
  image?: string;
  images?: string[];
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  icon: string; // lucide icon key used by CategoryCard
  subs: string[];
};

export const CATEGORIES: Category[] = [
  { slug: "head-protection", name: "Head Protection", blurb: "Helmets, hard hats & bump caps for site head safety.", icon: "hard-hat", subs: ["Safety Helmets", "Hard Hats", "Bump Caps", "Welding Helmets"] },
  { slug: "foot-protection", name: "Foot Protection", blurb: "Steel-toe boots, gumboots & S3 safety footwear.", icon: "footprints", subs: ["Safety Boots", "Gumboots", "Steel Toe Boots", "S3 Safety Footwear"] },
  { slug: "hand-protection", name: "Hand Protection", blurb: "Nitrile, cut-resistant, leather & chemical gloves.", icon: "hand", subs: ["Nitrile Gloves", "Cut Resistant Gloves", "Leather Gloves", "Chemical Gloves", "Welding Gloves"] },
  { slug: "eye-face-protection", name: "Eye & Face Protection", blurb: "Safety glasses, goggles, face & welding shields.", icon: "glasses", subs: ["Safety Glasses", "Goggles", "Face Shields", "Welding Shields"] },
  { slug: "hearing-protection", name: "Hearing Protection", blurb: "Ear plugs & muffs for high-noise environments.", icon: "ear", subs: ["Ear Plugs", "Ear Muffs"] },
  { slug: "respiratory-protection", name: "Respiratory Protection", blurb: "Dust masks, half/full-face respirators & filters.", icon: "wind", subs: ["Dust Masks", "Respirators", "Filters", "Half Face Respirators", "Full Face Respirators"] },
  { slug: "protective-clothing", name: "Protective Clothing", blurb: "Hi-vis vests, coveralls, rainwear & chemical suits.", icon: "shirt", subs: ["Reflective Vests", "Coveralls", "Disposable Coveralls", "Chemical Protection", "Rainwear"] },
  { slug: "fall-protection", name: "Fall Protection", blurb: "Harnesses, lanyards, lifelines & rescue equipment.", icon: "anchor", subs: ["Full Body Harnesses", "Lanyards", "Lifelines", "Anchors", "Rescue Equipment"] },
  { slug: "fire-emergency", name: "Fire & Emergency", blurb: "Extinguishers, blankets, first aid & emergency gear.", icon: "flame", subs: ["Fire Extinguishers", "Fire Blankets", "First Aid Kits", "Emergency Equipment"] },
  { slug: "road-site-safety", name: "Road & Site Safety", blurb: "Cones, barricades, signage & solar warning lights.", icon: "cone", subs: ["Traffic Cones", "Barricades", "Warning Signs", "Solar Barricade Lights"] },
];

export const BRANDS = ["SafetyPro", "3M", "Honeywell", "MSA", "Delta Plus", "Portwest", "Uvex", "Ansell", "Dräger", "Caterpillar"];

export const PRODUCTS: CatalogProduct[] = [
  {
    id: "p01", name: "Full Brim Safety Helmet EN397", slug: "full-brim-safety-helmet-en397", sku: "SP-HD-001",
    brand: "SafetyPro", category: "head-protection", price: 930, compareAt: 1160, vatInclusive: true,
    stock: 420, rating: 4.8, reviews: 132, featured: true,
    short: "Vented ABS full-brim helmet with ratchet adjustment.",
    description: "Full-brim safety helmet moulded from high-density ABS for construction, mining and industrial sites. Vented crown, ratchet headband and chin-strap slots keep crews cool and protected through long shifts.",
    specs: [
      { key: "Standard", value: "EN 397" }, { key: "Material", value: "ABS" },
      { key: "Ventilation", value: "Yes" }, { key: "Adjustment", value: "Ratchet" },
      { key: "Colour", value: "Yellow" }, { key: "Size", value: "Adjustable 53–63 cm" },
    ],
    certifications: ["EN 397"], industries: ["construction", "oil-and-gas", "manufacturing", "mining", "warehousing"],
    applications: ["Construction", "Oil & Gas", "Manufacturing", "Mining", "Warehousing"],
    sizes: ["Adjustable"], colours: ["Yellow", "White", "Orange", "Blue"],
  },
  {
    id: "p02", name: "Vented Hard Hat with Chin Strap", slug: "vented-hard-hat-chin-strap", sku: "SP-HD-002",
    brand: "MSA", category: "head-protection", price: 1450, vatInclusive: true,
    stock: 260, rating: 4.7, reviews: 84, featured: true,
    short: "HDPE vented hard hat, 6-point harness, chin strap included.",
    description: "Lightweight HDPE hard hat with 6-point textile harness and 4-point chin strap — suited to work at height, scaffolding and steel erection where retention matters.",
    specs: [
      { key: "Standard", value: "EN 397" }, { key: "Material", value: "HDPE" },
      { key: "Harness", value: "6-point textile" }, { key: "Chin strap", value: "4-point, included" },
      { key: "Size", value: "53–63 cm" },
    ],
    certifications: ["EN 397"], industries: ["construction", "engineering", "oil-and-gas"],
    applications: ["Construction", "Engineering", "Oil & Gas"],
    sizes: ["Adjustable"], colours: ["White", "Yellow"],
  },
  {
    id: "p03", name: "S3 Steel Toe Safety Boots", slug: "s3-steel-toe-safety-boots", sku: "SP-FT-010",
    brand: "SafetyPro", category: "foot-protection", price: 3160, compareAt: 3480, vatInclusive: true,
    stock: 180, rating: 4.9, reviews: 210, featured: true,
    short: "Water-resistant S3 boots, steel toe + puncture plate.",
    description: "Water-resistant nubuck S3 safety boots with 200J steel toe cap, steel puncture-resistant midsole, and oil-resistant dual-density PU/PU outsole. The workhorse for construction and manufacturing in Kenya.",
    specs: [
      { key: "Standard", value: "EN ISO 20345 S3" }, { key: "Toe cap", value: "Steel, 200J" },
      { key: "Midsole", value: "Steel puncture plate" }, { key: "Upper", value: "Water-resistant nubuck" },
      { key: "Outsole", value: "PU/PU, oil & slip resistant" },
    ],
    certifications: ["EN ISO 20345 S3"], industries: ["construction", "manufacturing", "mining", "warehousing", "oil-and-gas"],
    applications: ["Construction", "Manufacturing", "Mining", "Warehousing"],
    sizes: ["39", "40", "41", "42", "43", "44", "45", "46"], colours: ["Brown", "Black"],
  },
  {
    id: "p04", name: "PVC Heavy-Duty Gumboots", slug: "pvc-heavy-duty-gumboots", sku: "SP-FT-011",
    brand: "SafetyPro", category: "foot-protection", price: 1390, compareAt: 1510, vatInclusive: true,
    stock: 520, rating: 4.6, reviews: 190, featured: true,
    short: "Knee-length PVC gumboots for farms, food & cleaning.",
    description: "Knee-length PVC gumboots with cleated sole for flower farms, dairies, abattoirs, cleaning crews and wet construction zones. Easy to wash down and disinfect.",
    specs: [
      { key: "Material", value: "PVC" }, { key: "Height", value: "Knee, 38 cm" },
      { key: "Sole", value: "Cleated, slip resistant" }, { key: "Lining", value: "Polyester jersey" },
    ],
    certifications: [], industries: ["agriculture", "flower-farms", "healthcare", "hospitality", "manufacturing"],
    applications: ["Agriculture", "Flower Farms", "Food Processing", "Cleaning"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"], colours: ["White", "Green", "Black"],
  },
  {
    id: "p05", name: "Cut Resistant Gloves Level C", slug: "cut-resistant-gloves-level-c", sku: "SP-HA-020",
    brand: "SafetyPro", category: "hand-protection", price: 640, compareAt: 750, vatInclusive: true,
    stock: 800, rating: 4.7, reviews: 156, featured: true,
    short: "HPPE cut-C gloves with PU palm for glass & metal.",
    description: "Seamless HPPE cut-level C gloves with PU palm coating for glass handling, sheet metal, warehousing and assembly. Touchscreen compatible fingertips.",
    specs: [
      { key: "Standard", value: "EN 388:2016 4X42C" }, { key: "Liner", value: "HPPE, 13 gauge" },
      { key: "Coating", value: "PU palm" }, { key: "Cuff", value: "Knit wrist" },
    ],
    certifications: ["EN 388"], industries: ["manufacturing", "warehousing", "construction", "logistics"],
    applications: ["Manufacturing", "Warehousing", "Glass Handling", "Logistics"],
    sizes: ["S", "M", "L", "XL", "XXL"], colours: ["Grey/Black"],
  },
  {
    id: "p06", name: "Nitrile Disposable Gloves (Box of 100)", slug: "nitrile-disposable-gloves-box-100", sku: "SP-HA-021",
    brand: "SafetyPro", category: "hand-protection", price: 580, vatInclusive: true,
    stock: 1200, rating: 4.6, reviews: 340, featured: true,
    short: "Powder-free nitrile examination gloves, box of 100.",
    description: "Powder-free, latex-free nitrile examination gloves for hospitals, labs, food handling and cleaning. Textured fingertips for grip.",
    specs: [
      { key: "Standard", value: "EN 455" }, { key: "Material", value: "Nitrile, powder-free" },
      { key: "Thickness", value: "4 mil" }, { key: "Pack", value: "Box of 100" },
    ],
    certifications: ["EN 455"], industries: ["healthcare", "hospitality", "manufacturing", "agriculture"],
    applications: ["Healthcare", "Laboratory", "Food Handling"],
    sizes: ["S", "M", "L", "XL"], colours: ["Blue", "Black"],
  },
  {
    id: "p07", name: "Chemical Resistant Gloves Nitrile 33cm", slug: "chemical-resistant-gloves-33cm", sku: "SP-HA-022",
    brand: "SafetyPro", category: "hand-protection", price: 290, compareAt: 350, vatInclusive: true,
    stock: 340, rating: 4.7, reviews: 98,
    short: "33cm flock-lined nitrile gloves for agrochemicals.",
    description: "Flock-lined 33cm nitrile chemical gloves for flower farms, agrochemical handling, cleaning and light oil & gas maintenance.",
    specs: [
      { key: "Standard", value: "EN 374" }, { key: "Length", value: "33 cm" },
      { key: "Lining", value: "Flock cotton" }, { key: "Thickness", value: "0.38 mm" },
    ],
    certifications: ["EN 374"], industries: ["flower-farms", "agriculture", "manufacturing", "oil-and-gas"],
    applications: ["Flower Farms", "Agrochemicals", "Cleaning"],
    sizes: ["M", "L", "XL"], colours: ["Green"],
  },
  {
    id: "p08", name: "Clear Safety Glasses Anti-Scratch", slug: "clear-safety-glasses-anti-scratch", sku: "SP-EY-030",
    brand: "Uvex", category: "eye-face-protection", price: 320, vatInclusive: true,
    stock: 950, rating: 4.6, reviews: 220, featured: true,
    short: "Wrap-around polycarbonate glasses, anti-scratch.",
    description: "Wrap-around polycarbonate safety glasses with anti-scratch coating and 99.9% UV protection. Fits over prescription frames; ideal for visitors, warehouses and workshops.",
    specs: [
      { key: "Standard", value: "EN 166" }, { key: "Lens", value: "Polycarbonate, clear" },
      { key: "Coating", value: "Anti-scratch" }, { key: "UV", value: "99.9% UV protection" },
    ],
    certifications: ["EN 166"], industries: ["construction", "manufacturing", "warehousing", "engineering"],
    applications: ["Construction", "Warehousing", "Workshops"],
    sizes: ["One size"], colours: ["Clear"],
  },
  {
    id: "p09", name: "Indirect-Vent Safety Goggles", slug: "indirect-vent-safety-goggles", sku: "SP-EY-031",
    brand: "3M", category: "eye-face-protection", price: 890, vatInclusive: true,
    stock: 410, rating: 4.8, reviews: 110,
    short: "Sealed goggles for dust, spray & chemical splash.",
    description: "Indirect-vent sealed goggles for dusty grinding bays, spray painting and agrochemical spraying on flower farms.",
    specs: [
      { key: "Standard", value: "EN 166" }, { key: "Ventilation", value: "Indirect vent" },
      { key: "Lens", value: "Anti-fog polycarbonate" }, { key: "Strap", value: "Adjustable elastic" },
    ],
    certifications: ["EN 166"], industries: ["flower-farms", "manufacturing", "construction", "oil-and-gas"],
    applications: ["Spraying", "Grinding", "Chemical Handling"],
    sizes: ["One size"], colours: ["Clear"],
  },
  {
    id: "p10", name: "SNR 30dB Folding Ear Muffs", slug: "snr-30db-folding-ear-muffs", sku: "SP-HE-040",
    brand: "SafetyPro", category: "hearing-protection", price: 350, compareAt: 410, vatInclusive: true,
    stock: 300, rating: 4.7, reviews: 76,
    short: "Folding ear muffs, SNR 30dB for generators & plant.",
    description: "Folding ear muffs rated SNR 30dB for generators, compressors, factories and roadworks. Helmet-mount version available on request.",
    specs: [
      { key: "Standard", value: "EN 352-1" }, { key: "Rating", value: "SNR 30 dB" },
      { key: "Style", value: "Folding headband" }, { key: "Weight", value: "230 g" },
    ],
    certifications: ["EN 352-1"], industries: ["manufacturing", "construction", "mining", "oil-and-gas"],
    applications: ["Manufacturing", "Generators", "Mining"],
    sizes: ["One size"], colours: ["Yellow/Black"],
  },
  {
    id: "p11", name: "Disposable Ear Plugs Corded (Box 200)", slug: "disposable-ear-plugs-box-200", sku: "SP-HE-041",
    brand: "Honeywell", category: "hearing-protection", price: 2400, vatInclusive: true,
    stock: 260, rating: 4.5, reviews: 54,
    short: "Corded PU foam plugs, SNR 34dB, box of 200 pairs.",
    description: "Corded PU foam ear plugs, SNR 34dB, hygienically packed for issue across shifts in factories and warehouses.",
    specs: [
      { key: "Standard", value: "EN 352-2" }, { key: "Rating", value: "SNR 34 dB" },
      { key: "Pack", value: "200 pairs" }, { key: "Corded", value: "Yes" },
    ],
    certifications: ["EN 352-2"], industries: ["manufacturing", "warehousing", "construction"],
    applications: ["Factories", "Warehousing"],
    sizes: ["One size"], colours: ["Orange"],
  },
  {
    id: "p12", name: "FFP2 Dust Masks with Valve (Box 20)", slug: "ffp2-dust-masks-valve-box-20", sku: "SP-RP-050",
    brand: "3M", category: "respiratory-protection", price: 2800, vatInclusive: true,
    stock: 380, rating: 4.8, reviews: 143, featured: true,
    short: "Valved FFP2 masks for cement, flour & grain dust.",
    description: "Valved FFP2 NR D folding masks for cement, quarries, flour mills and grain handling. Exhalation valve cuts heat build-up.",
    specs: [
      { key: "Standard", value: "EN 149 FFP2 NR D" }, { key: "Valve", value: "Yes" },
      { key: "Pack", value: "Box of 20" }, { key: "Use", value: "Single shift" },
    ],
    certifications: ["EN 149 FFP2"], industries: ["construction", "manufacturing", "mining", "agriculture"],
    applications: ["Cement", "Milling", "Quarries"],
    sizes: ["One size"], colours: ["White"],
  },
  {
    id: "p13", name: "Half Face Respirator with A2P3 Filters", slug: "half-face-respirator-a2p3", sku: "SP-RP-051",
    brand: "Dräger", category: "respiratory-protection", price: 5950, vatInclusive: true,
    stock: 120, rating: 4.9, reviews: 67, featured: true,
    short: "Twin-filter half mask kit for spray & fumes.",
    description: "Twin-filter half-face respirator supplied with A2P3 combination filters for spray painting, pesticide application and solvent fumes.",
    specs: [
      { key: "Standard", value: "EN 140 + EN 14387" }, { key: "Filters", value: "A2P3 included" },
      { key: "Body", value: "Thermoplastic, low odour" }, { key: "Sizes", value: "M/L" },
    ],
    certifications: ["EN 140"], industries: ["flower-farms", "manufacturing", "oil-and-gas", "engineering"],
    applications: ["Spraying", "Painting", "Fumes"],
    sizes: ["M", "L"], colours: ["Grey/Blue"],
  },
  {
    id: "p14", name: "Hi-Vis Reflective Vest EN ISO 20471", slug: "hi-vis-reflective-vest", sku: "SP-PC-060",
    brand: "Portwest", category: "protective-clothing", price: 450, vatInclusive: true,
    stock: 1500, rating: 4.7, reviews: 310, featured: true, isNew: true,
    short: "Class 2 hi-vis vest with ID pocket.",
    description: "Class 2 hi-vis waistcoat with 2 reflective bands, ID pocket and velcro closure — the standard for roadworks, logistics, security and site visitors.",
    specs: [
      { key: "Standard", value: "EN ISO 20471 Class 2" }, { key: "Fabric", value: "100% polyester, 120gsm" },
      { key: "Closure", value: "Velcro" }, { key: "Pocket", value: "ID pocket" },
    ],
    certifications: ["EN ISO 20471"], industries: ["construction", "logistics", "security", "warehousing"],
    applications: ["Roadworks", "Logistics", "Security", "Site Visitors"],
    sizes: ["M", "L", "XL", "XXL"], colours: ["Yellow", "Orange"],
  },
  {
    id: "p15", name: "Poly-Cotton Work Coverall with Reflectors", slug: "poly-cotton-work-coverall", sku: "SP-PC-061",
    brand: "Delta Plus", category: "protective-clothing", price: 2650, vatInclusive: true,
    stock: 340, rating: 4.7, reviews: 129, featured: true,
    short: "65/35 coverall with reflective tape & knee pads.",
    description: "65/35 poly-cotton coverall with segmented reflective tape, knee-pad pockets, and 7 functional pockets for technicians, drivers and contractors.",
    specs: [
      { key: "Fabric", value: "65% polyester / 35% cotton, 245gsm" }, { key: "Tape", value: "Segmented reflective" },
      { key: "Pockets", value: "7 + knee-pad pockets" }, { key: "Closure", value: "YKK zip + studs" },
    ],
    certifications: [], industries: ["construction", "manufacturing", "logistics", "engineering", "oil-and-gas"],
    applications: ["Technicians", "Drivers", "Contractors"],
    sizes: ["S", "M", "L", "XL", "XXL"], colours: ["Navy", "Orange", "Green", "Grey"],
  },
  {
    id: "p16", name: "Disposable Coveralls Type 5/6 (Case 50)", slug: "disposable-coveralls-type-56", sku: "SP-PC-062",
    brand: "3M", category: "protective-clothing", price: 12500, vatInclusive: true,
    stock: 90, rating: 4.6, reviews: 41,
    short: "Microporous Type 5/6 suits for asbestos & dust.",
    description: "Microporous Type 5/6 disposable coveralls with hood, elastic cuffs and storm-flap zip for asbestos surveys, dusty shutdowns and spray work.",
    specs: [
      { key: "Standard", value: "Type 5/6" }, { key: "Material", value: "Microporous laminate" },
      { key: "Pack", value: "Case of 50" }, { key: "Seams", value: "Bound" },
    ],
    certifications: ["EN ISO 13982-1 Type 5", "EN 13034 Type 6"], industries: ["construction", "manufacturing", "oil-and-gas"],
    applications: ["Asbestos Survey", "Shutdowns", "Spray Work"],
    sizes: ["M", "L", "XL", "XXL"], colours: ["White"],
  },
  {
    id: "p17", name: "Full Body Harness with Shock Absorber", slug: "full-body-harness-shock-absorber", sku: "SP-FP-070",
    brand: "SafetyPro", category: "fall-protection", price: 10440, compareAt: 12760, vatInclusive: true,
    stock: 75, rating: 4.9, reviews: 58, featured: true,
    short: "EN361 harness + EN355 twin lanyard kit.",
    description: "5-point full-body harness with dorsal and sternal D-rings, supplied with twin-leg shock-absorbing lanyard — the compliant kit for roofing, towers and steel work.",
    specs: [
      { key: "Harness standard", value: "EN 361" }, { key: "Lanyard standard", value: "EN 355" },
      { key: "Attachment", value: "Dorsal + sternal D-rings" }, { key: "Buckles", value: "Quick-release" },
    ],
    certifications: ["EN 361", "EN 355"], industries: ["construction", "engineering", "oil-and-gas"],
    applications: ["Roofing", "Towers", "Steel Work"],
    sizes: ["M-XL"], colours: ["Yellow/Black"],
  },
  {
    id: "p18", name: "5kg Dry Powder Fire Extinguisher", slug: "5kg-dry-powder-fire-extinguisher", sku: "SP-FE-080",
    brand: "SafetyPro", category: "fire-emergency", price: 2090, compareAt: 2320, vatInclusive: true,
    stock: 140, rating: 4.8, reviews: 92, featured: true,
    short: "ABC dry powder extinguisher, wall bracket included.",
    description: "5kg ABC dry powder extinguisher for offices, warehouses, schools and vehicles. Supplied with wall bracket, hose and pressure gauge; servicing available Nairobi-wide.",
    specs: [
      { key: "Rating", value: "43A/233B/C" }, { key: "Agent", value: "ABC dry powder, 5kg" },
      { key: "Discharge", value: "~15 seconds" }, { key: "Bracket", value: "Wall bracket included" },
    ],
    certifications: ["EN 3-7"], industries: ["warehousing", "hospitality", "schools", "manufacturing", "healthcare"],
    applications: ["Offices", "Warehouses", "Schools", "Vehicles"],
    sizes: ["5kg"], colours: ["Red"],
  },
  {
    id: "p19", name: "Emergency First Aid Kit (OSHA 50-Person)", slug: "first-aid-kit-50-person", sku: "SP-FE-081",
    brand: "SafetyPro", category: "fire-emergency", price: 2090, compareAt: 2900, vatInclusive: true,
    stock: 200, rating: 4.7, reviews: 88,
    short: "Wall-mountable 50-person kit, refillable.",
    description: "Wall-mountable 50-person first aid kit with bandages, burn gel, eyewash, CPR shield and contents list aligned to OSHA workplace guidance.",
    specs: [
      { key: "Capacity", value: "50 persons" }, { key: "Case", value: "Wall-mountable ABS" },
      { key: "Contents", value: "120+ pieces" }, { key: "Refillable", value: "Yes" },
    ],
    certifications: [], industries: ["construction", "manufacturing", "schools", "hospitality", "healthcare"],
    applications: ["Sites", "Offices", "Schools", "Vehicles"],
    sizes: ["50-person"], colours: ["Green/White"],
  },
  {
    id: "p20", name: "750mm Traffic Cone with Reflective Collar", slug: "750mm-traffic-cone-reflective", sku: "SP-RS-090",
    brand: "SafetyPro", category: "road-site-safety", price: 2440, compareAt: 2550, vatInclusive: true,
    stock: 600, rating: 4.6, reviews: 73,
    short: "HDPE cone with reflective collar & heavy base.",
    description: "750mm HDPE traffic cone with reflective collar and heavy base for roadworks, site entrances and event traffic control. Stackable for transport.",
    specs: [
      { key: "Height", value: "750 mm" }, { key: "Material", value: "HDPE" },
      { key: "Reflective", value: "Collar, Class 1" }, { key: "Base", value: "Heavy, 3.2kg" },
    ],
    certifications: [], industries: ["construction", "logistics", "government", "security"],
    applications: ["Roadworks", "Site Entrances", "Events"],
    sizes: ["750mm"], colours: ["Orange"],
  },
  {
    id: "p21", name: "Retractable Barricade Tape (500m)", slug: "barricade-tape-500m", sku: "SP-RS-091",
    brand: "SafetyPro", category: "road-site-safety", price: 850, vatInclusive: true,
    stock: 700, rating: 4.5, reviews: 49,
    short: "DANGER red/white barrier tape, 500m roll.",
    description: "Non-adhesive PE barricade tape printed DANGER, 500m roll for cordoning excavations, overhead work and restricted zones.",
    specs: [
      { key: "Length", value: "500 m" }, { key: "Width", value: "75 mm" },
      { key: "Material", value: "PE, non-adhesive" }, { key: "Print", value: "DANGER red/white" },
    ],
    certifications: [], industries: ["construction", "engineering", "government"],
    applications: ["Excavations", "Cordoning"],
    sizes: ["500m"], colours: ["Red/White"],
  },
  {
    id: "p22", name: "Welding Helmet Auto-Darkening", slug: "welding-helmet-auto-darkening", sku: "SP-HD-003",
    brand: "3M", category: "head-protection", price: 6800, vatInclusive: true,
    stock: 60, rating: 4.8, reviews: 45, isNew: true,
    short: "True-colour ADF helmet, DIN 9–13.",
    description: "Auto-darkening welding helmet with true-colour filter, DIN 9–13 variable shade, grind mode and replaceable cover lenses for fabrication shops.",
    specs: [
      { key: "Standard", value: "EN 379" }, { key: "Shade", value: "DIN 9–13 variable" },
      { key: "Sensors", value: "4 arc sensors" }, { key: "Modes", value: "Weld / grind" },
    ],
    certifications: ["EN 379"], industries: ["engineering", "manufacturing", "construction"],
    applications: ["Welding", "Fabrication"],
    sizes: ["One size"], colours: ["Black"],
  },
  {
    id: "p23", name: "Leather Rigger Gloves (12 Pairs)", slug: "leather-rigger-gloves-12-pairs", sku: "SP-HA-023",
    brand: "Portwest", category: "hand-protection", price: 3600, vatInclusive: true,
    stock: 250, rating: 4.6, reviews: 112,
    short: "Cow-split rigger gloves, pack of 12 pairs.",
    description: "Cow-split leather rigger gloves with cotton back and hang tab — the site-standard general handling glove, sold in economical 12-pair bundles.",
    specs: [
      { key: "Standard", value: "EN 388 3.1.3.2" }, { key: "Palm", value: "Cow split leather" },
      { key: "Back", value: "Cotton drill" }, { key: "Pack", value: "12 pairs" },
    ],
    certifications: ["EN 388"], industries: ["construction", "warehousing", "logistics", "mining"],
    applications: ["General Handling", "Construction"],
    sizes: ["L", "XL"], colours: ["Natural/Blue"],
  },
  {
    id: "p24", name: "Rain Suit Heavy-Duty PVC (Jacket + Trouser)", slug: "rain-suit-heavy-duty-pvc", sku: "SP-PC-063",
    brand: "SafetyPro", category: "protective-clothing", price: 2090, compareAt: 2320, vatInclusive: true,
    stock: 280, rating: 4.5, reviews: 66,
    short: "Sealed-seam PVC rainsuit for security & boda fleets.",
    description: "Heavy-duty PVC rainsuit with sealed seams, storm flap and pack-away hood for security guards, riders and outdoor crews through the long rains.",
    specs: [
      { key: "Material", value: "PVC/polyester" }, { key: "Seams", value: "Heat-sealed" },
      { key: "Set", value: "Jacket + trouser" }, { key: "Hood", value: "Pack-away" },
    ],
    certifications: ["EN 343"], industries: ["security", "logistics", "construction", "agriculture"],
    applications: ["Security", "Riders", "Outdoor Crews"],
    sizes: ["M", "L", "XL", "XXL"], colours: ["Navy", "Yellow"],
  },
];

export type Industry = {
  slug: string;
  name: string;
  blurb: string;
  hazards: string[];
  ppe: string[];
};

export const INDUSTRIES: Industry[] = [
  { slug: "construction", name: "Construction", blurb: "High-rise, road and civil works across Kenya — helmets, boots, hi-vis and fall protection for every gang.", hazards: ["Falling objects", "Work at height", "Dust & noise", "Cuts & punctures"], ppe: ["Safety helmets", "S3 boots", "Hi-vis vests", "Harnesses", "FFP2 masks"] },
  { slug: "oil-and-gas", name: "Oil & Gas", blurb: "Depots, terminals and contractors — FR clothing, chemical gloves and respirators for hydrocarbon environments.", hazards: ["Hydrocarbon splash", "Fumes & vapours", "Fire risk", "Slips"], ppe: ["FR coveralls", "Chemical gloves", "Half-face respirators", "Safety glasses", "S3 boots"] },
  { slug: "manufacturing", name: "Manufacturing", blurb: "Factories and processing plants — cut gloves, hearing protection and machine-shop PPE.", hazards: ["Cuts & abrasions", "Noise", "Chemical contact", "Eye injury"], ppe: ["Cut-resistant gloves", "Ear muffs", "Safety glasses", "S3 boots"] },
  { slug: "agriculture", name: "Agriculture", blurb: "Farms and cooperatives — gumboots, rainwear and spraying respirators built for field work.", hazards: ["Pesticides", "Wet conditions", "Dust", "Sun & rain"], ppe: ["Gumboots", "Chemical gloves", "Respirators", "Rain suits"] },
  { slug: "flower-farms", name: "Flower Farms", blurb: "Naivasha to Nanyuki greenhouses — chemical suits, spray goggles and cold-room PPE.", hazards: ["Agrochemicals", "Humidity", "Cold rooms", "Repetitive handling"], ppe: ["Chemical gloves", "Goggles", "Half-face respirators", "Coveralls", "Gumboots"] },
  { slug: "mining", name: "Mining & Quarries", blurb: "Quarries and mines — dust masks, helmets and heavy-duty boots for harsh ground.", hazards: ["Rock fall", "Silica dust", "Vibration", "Uneven ground"], ppe: ["Helmets", "FFP2/FFP3 masks", "S3 boots", "Hearing protection"] },
  { slug: "logistics", name: "Logistics & Warehousing", blurb: "Godowns and fleets — hi-vis, safety shoes and handling gloves that keep freight moving.", hazards: ["Forklifts", "Falling stock", "Manual handling", "Night shifts"], ppe: ["Hi-vis vests", "Safety shoes", "Handling gloves", "Helmets"] },
  { slug: "healthcare", name: "Healthcare", blurb: "Hospitals and labs — nitrile gloves, masks and spill protection for clinical teams.", hazards: ["Infection", "Sharps", "Chemical spills", "Long shifts"], ppe: ["Nitrile gloves", "Face masks", "Gumboots", "First aid kits"] },
  { slug: "engineering", name: "Engineering", blurb: "Workshops and fabrication — welding helmets, leather gloves and face shields.", hazards: ["Welding arc", "Grinding sparks", "Hot metal", "Fumes"], ppe: ["Welding helmets", "Leather gloves", "Face shields", "Coveralls"] },
  { slug: "hospitality", name: "Hospitality", blurb: "Hotels and catering — food-safe gloves, non-slip footwear and first aid cover.", hazards: ["Burns", "Slips", "Cleaning chemicals", "Knife work"], ppe: ["Nitrile gloves", "Gumboots", "First aid kits", "Aprons"] },
  { slug: "schools", name: "Schools & Institutions", blurb: "Schools and colleges — extinguishers, first aid and lab PPE for safe learning.", hazards: ["Fire", "Lab chemicals", "Playground injury", "Crowds"], ppe: ["Fire extinguishers", "First aid kits", "Lab goggles", "Fire blankets"] },
  { slug: "government", name: "Government", blurb: "Ministries, counties and agencies — compliant supply with LPO terms and documentation.", hazards: ["Varied field work", "Road crews", "Emergency response"], ppe: ["Hi-vis", "Cones & barricades", "First aid", "Rainwear"] },
  { slug: "ngo", name: "NGOs", blurb: "Field programmes and refugee operations — kits, first aid and WASH PPE at framework prices.", hazards: ["Field travel", "WASH work", "Emergency response"], ppe: ["First aid kits", "Hi-vis", "Gumboots", "Dust masks"] },
  { slug: "security", name: "Security", blurb: "Guarding companies — reflective vests, rain suits, boots and torches for 24/7 posts.", hazards: ["Night shifts", "Rain", "Road traffic", "Long standing"], ppe: ["Hi-vis vests", "Rain suits", "Boots", "Torches"] },
];

export type PpePackage = {
  slug: string;
  name: string;
  blurb: string;
  price: number;
  items: string[]; // product slugs
  badge?: string;
};

export const PACKAGES: PpePackage[] = [
  { slug: "construction-starter-kit", name: "Construction Starter Kit", blurb: "Helmet, S3 boots, hi-vis vest, rigger gloves & glasses — one per worker.", price: 7290, items: ["full-brim-safety-helmet-en397", "s3-steel-toe-safety-boots", "hi-vis-reflective-vest", "leather-rigger-gloves-12-pairs", "clear-safety-glasses-anti-scratch"], badge: "Most popular" },
  { slug: "oil-gas-ppe-kit", name: "Oil & Gas PPE Kit", blurb: "Helmet, coverall, S3 boots, glasses, chemical gloves, muffs & vest.", price: 12480, items: ["vented-hard-hat-chin-strap", "poly-cotton-work-coverall", "s3-steel-toe-safety-boots", "clear-safety-glasses-anti-scratch", "chemical-resistant-gloves-33cm", "snr-30db-folding-ear-muffs", "hi-vis-reflective-vest"], badge: "Contractor favourite" },
  { slug: "warehouse-ppe-kit", name: "Warehouse PPE Kit", blurb: "Safety shoes, vest, handling gloves, glasses & bump protection.", price: 6490, items: ["s3-steel-toe-safety-boots", "hi-vis-reflective-vest", "cut-resistant-gloves-level-c", "clear-safety-glasses-anti-scratch", "full-brim-safety-helmet-en397"] },
  { slug: "flower-farm-ppe-kit", name: "Flower Farm PPE Kit", blurb: "Coverall, chemical gloves, respirator, gumboots & spray goggles.", price: 11330, items: ["poly-cotton-work-coverall", "chemical-resistant-gloves-33cm", "half-face-respirator-a2p3", "pvc-heavy-duty-gumboots", "indirect-vent-safety-goggles"], badge: "Agro-vetted" },
];

export type Post = {
  slug: string; title: string; excerpt: string; category: string;
  author: string; date: string; readMins: number; featured?: boolean;
  faqs: { q: string; a: string }[];
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "ppe-requirements-construction-sites-kenya", title: "PPE Requirements for Construction Sites in Kenya",
    excerpt: "What NCA and OSHA-aligned sites actually enforce: helmets, boots, hi-vis, fall protection and site signage.",
    category: "Compliance", author: "SafetyPro Team", date: "2026-08-14", readMins: 8, featured: true,
    faqs: [
      { q: "Is PPE mandatory on Kenyan construction sites?", a: "Yes. The Occupational Safety and Health Act requires employers to provide suitable PPE free of charge, and NCA-registered sites are inspected for compliance." },
      { q: "What is the minimum PPE per worker?", a: "Helmet, safety boots, hi-vis vest, gloves and eye protection as a baseline, plus task-specific gear such as harnesses for height work." },
    ],
    body: [
      "Kenyan construction sites — from Nairobi high-rises to county road projects — are inspected against the Occupational Safety and Health Act (2007) and NCA site-registration rules. The baseline expectation is simple: no worker on an active site without a helmet, safety boots and a hi-vis vest.",
      "Task-specific gear follows the risk assessment. Work above 2 metres needs harnesses and lanyards to EN 361/EN 355. Grinding, cutting and dusty work needs eye protection to EN 166 and FFP2 respiratory protection. Concrete and steel fixing crews need chemical-resistant or rigger gloves respectively.",
      "Procurement tip: standardise one helmet colour per contractor, keep a visitor stock of glasses and vests at the gate, and log issue per worker so replacements are traceable. SafetyPro Africa supplies full site PPE lists on LPO terms for registered contractors.",
    ],
  },
  {
    slug: "how-to-choose-right-safety-helmet", title: "How to Choose the Right Safety Helmet",
    excerpt: "Brim vs cap style, vented vs unvented, ratchet vs pin-lock — a buyer’s guide for Kenyan sites.",
    category: "Buying Guides", author: "SafetyPro Team", date: "2026-07-30", readMins: 6, featured: true,
    faqs: [{ q: "Vented or unvented helmet?", a: "Vented for general construction comfort; unvented where electrical insulation (440Vac) is required." }],
    body: [
      "Start with the standard: EN 397 helmets cover shock absorption, penetration and chin-strap anchorage. For electrical work, confirm the 440Vac optional test. For forestry or side-impact risk, consider EN 12492 mountaineering-style helmets.",
      "Fit matters more than most buyers think. Ratchet suspensions adjust one-handed and fit 53–63cm heads; budget pin-lock shells slip and end up unworn. Full-brim shells shed sun and rain — popular with road crews — while cap-style shells suit scaffolders working under steel.",
      "Replace any helmet after a significant impact, and retire shells after ~5 years (check the moulded date dial). Store out of direct sun: UV degrades HDPE faster on Kenyan sites than in temperate climates.",
    ],
  },
  {
    slug: "en397-safety-helmet-explained", title: "EN 397 Safety Helmet Explained",
    excerpt: "What the EN 397 mark actually tests — and how to verify it before you buy in bulk.",
    category: "Standards", author: "SafetyPro Team", date: "2026-07-12", readMins: 5,
    faqs: [{ q: "What does EN 397 test?", a: "Shock absorption, penetration resistance, flammability, chin-strap anchorage and optional electrical, cold and lateral tests." }],
    body: [
      "EN 397 is the European performance standard for industrial safety helmets, widely specified in Kenyan procurement documents. It tests shock absorption (5kg striker from 1m), penetration (3kg cone), flame resistance and chin-strap release between 150–250N.",
      "Optional marks matter: 440Vac (electrical), -20°C or -30°C (cold), LD (lateral deformation) and MM (molten metal). Match the option to the job — road crews rarely need electrical insulation; substation contractors do.",
      "Always ask the supplier for the declaration of conformity and check the shell markings: manufacturer, EN 397, size range and date of manufacture. SafetyPro lists only the certifications held in our product database — never invented.",
    ],
  },
  {
    slug: "safety-boots-s1-vs-s2-vs-s3", title: "Safety Boots: S1 vs S2 vs S3",
    excerpt: "Which rating your crew actually needs — and why most Kenyan sites should buy S3.",
    category: "Buying Guides", author: "SafetyPro Team", date: "2026-06-28", readMins: 7,
    faqs: [{ q: "What is the difference between S1, S2 and S3?", a: "S1: basic toe protection. S2 adds water resistance. S3 adds a puncture-resistant midsole and cleated outsole — the site standard." }],
    body: [
      "Under EN ISO 20345, all S-rated boots share a 200-joule toe cap. S1 adds antistatic and energy-absorbing heels. S2 adds a water-resistant upper. S3 adds a puncture-resistant midsole plus a cleated, oil-resistant outsole.",
      "For Kenyan construction, flower-farm workshops and warehouses, S3 is the sensible default: nails, mesh offcuts and wet slabs are the everyday hazards. S1P (puncture plate, breathable upper) suits dry warehouses where water resistance is unnecessary.",
      "Fit and socks decide comfort. Buy afternoon (feet swell), budget two pairs of moisture-wicking socks per worker, and replace boots when the tread wears smooth — most site boots last 6–12 months of daily use.",
    ],
  },
  {
    slug: "ppe-for-oil-and-gas-workers", title: "PPE for Oil & Gas Workers",
    excerpt: "FR clothing, chemical gloves, respirators and approved footwear for depots and terminals.",
    category: "Industries", author: "SafetyPro Team", date: "2026-06-10", readMins: 6,
    faqs: [{ q: "Is FR clothing required at fuel depots?", a: "Most depot operators and EPC contractors specify flame-resistant coveralls plus anti-static footwear in zoned areas." }],
    body: [
      "Oil & gas PPE starts with the site's area classification. In zoned areas, contractors typically require FR coveralls, chemical-resistant gloves for sampling and decanting, and eye protection for pressurised lines.",
      "Respiratory protection follows the product: A2P3 combination filters cover organic vapours plus particulates for most maintenance and painting tasks. Confirm cartridge change schedules with the site HSE plan.",
      "Documentation wins tenders: keep conformity declarations, datasheets and calibration records filed per product. SafetyPro supports depot contractors with document packs and LPO billing.",
    ],
  },
  {
    slug: "ppe-for-flower-farms", title: "PPE for Flower Farms in Kenya",
    excerpt: "Spray teams, packhouses and cold rooms: the Naivasha-tested PPE list.",
    category: "Industries", author: "SafetyPro Team", date: "2026-05-22", readMins: 6,
    faqs: [{ q: "What PPE do spray teams need?", a: "Half-face respirator with A2P3 filters, indirect-vent goggles, 33cm chemical gloves, coveralls and gumboots." }],
    body: [
      "Flower-farm PPE programmes revolve around the spray team: half-face respirators with A2P3 filters, indirect-vent goggles, long chemical gloves, coveralls and gumboots — with re-entry intervals posted per chemical.",
      "Packhouses need cut-level gloves, dust masks for dry areas and non-slip gumboots for wet floors. Cold rooms need thermal layers under coveralls plus close-fitting gloves that preserve dexterity.",
      "Audits (GlobalG.A.P., KFC Silver/Gold) check PPE issue records and training. Standardise sizes per employee, keep a chemical store spill kit, and schedule respirator fit checks quarterly.",
    ],
  },
  {
    slug: "workplace-safety-checklist", title: "Workplace Safety Checklist for Facility Managers",
    excerpt: "A 10-point monthly walk-through: extinguishers, first aid, signage, lighting and PPE stations.",
    category: "Compliance", author: "SafetyPro Team", date: "2026-04-18", readMins: 5,
    faqs: [{ q: "How often should extinguishers be serviced?", a: "Visual check monthly; full service annually by a licensed technician, with the service tag signed." }],
    body: [
      "Walk your facility monthly with a fixed checklist: extinguisher gauges and tags, first-aid kit contents and expiry, emergency lighting, exit signage, spill kits, PPE stations, machine guards, electrical panels, housekeeping and training records.",
      "Log every finding with an owner and due date — auditors forgive gaps with corrective actions, not gaps with silence. Photograph extinguisher tags and kit seals as evidence.",
      "SafetyPro supplies refill services, signage packs and first-aid restocking across Nairobi with upcountry dispatch.",
    ],
  },
  {
    slug: "how-to-choose-chemical-resistant-gloves", title: "How to Choose Chemical-Resistant Gloves",
    excerpt: "Nitrile vs latex vs PVC, breakthrough times and why length matters for spray work.",
    category: "Buying Guides", author: "SafetyPro Team", date: "2026-03-30", readMins: 6,
    faqs: [{ q: "Which glove material for pesticides?", a: "Nitrile (0.38mm+, 30cm+) is the common choice; always check the chemical manufacturer's breakthrough-time chart." }],
    body: [
      "No glove resists everything. Match the polymer to the chemical family using the manufacturer's permeation chart, then size up in thickness and length for immersion or spray work.",
      "Nitrile covers most pesticides, oils and solvents for Kenyan farm and workshop use. Latex offers dexterity but triggers allergies. PVC suits acids and cleaning chemicals at low cost.",
      "Treat gloves as consumables with a change schedule — a 33cm flock-lined nitrile glove costs less than a clinic visit. Store away from sun and ozone (electric motors) which crack elastomers.",
    ],
  },
];

export const COUNTIES = [  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret (Uasin Gishu)", "Kiambu", "Machakos",
  "Kajiado", "Narok", "Kericho", "Naivasha (Nakuru)", "Thika (Kiambu)", "Kilifi", "Kwale",
  "Taita-Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi",
  "Embu", "Kitui", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Turkana",
  "West Pokot", "Samburu", "Trans Nzoia", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia",
  "Migori", "Kisii", "Nyamira", "Homa Bay", "Siaya", "Vihiga", "Bungoma", "Busia", "Kakamega",
  "Tana River", "Lamu",
];

export function findProduct(slug: string): CatalogProduct | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function searchProducts(q: string): CatalogProduct[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return ALL_PRODUCTS;
  const terms = needle.split(/\s+/);
  return ALL_PRODUCTS.filter((p) => {
    const hay = [
      p.name, p.sku, p.brand, categoryName(p.category), p.short, p.description,
      ...p.specs.map((s) => `${s.key} ${s.value}`),
      ...p.certifications, ...p.applications,
      ...p.industries.map((i) => INDUSTRIES.find((x) => x.slug === i)?.name ?? i),
    ].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

// ---------- Local photography (public/images, fetched via scripts/fetch-images.mjs) ----------
export const HERO_IMAGE = "/images/hero.jpg";
export const BULK_CTA_IMAGE = "/images/cta-bulk.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "full-brim-safety-helmet-en397": "/images/products/helmet-full-brim.jpg",
  "vented-hard-hat-chin-strap": "/images/products/hard-hat.jpg",
  "s3-steel-toe-safety-boots": "/images/products/safety-boots.jpg",
  "pvc-heavy-duty-gumboots": "/images/products/gumboots.jpg",
  "cut-resistant-gloves-level-c": "/images/products/cut-gloves.jpg",
  "nitrile-disposable-gloves-box-100": "/images/products/nitrile-gloves.jpg",
  "chemical-resistant-gloves-33cm": "/images/products/chemical-gloves.jpg",
  "clear-safety-glasses-anti-scratch": "/images/products/safety-glasses.jpg",
  "indirect-vent-safety-goggles": "/images/products/goggles.jpg",
  "snr-30db-folding-ear-muffs": "/images/products/ear-muffs.jpg",
  "disposable-ear-plugs-box-200": "/images/products/ear-plugs.jpg",
  "ffp2-dust-masks-valve-box-20": "/images/products/dust-masks.jpg",
  "half-face-respirator-a2p3": "/images/products/respirator.jpg",
  "hi-vis-reflective-vest": "/images/products/hiviz-vest.jpg",
  "poly-cotton-work-coverall": "/images/products/coverall.jpg",
  "disposable-coveralls-type-56": "/images/products/disposable-coverall.jpg",
  "full-body-harness-shock-absorber": "/images/products/harness.jpg",
  "5kg-dry-powder-fire-extinguisher": "/images/products/extinguisher.jpg",
  "first-aid-kit-50-person": "/images/products/first-aid.jpg",
  "750mm-traffic-cone-reflective": "/images/products/cone.jpg",
  "barricade-tape-500m": "/images/products/barricade-tape.jpg",
  "welding-helmet-auto-darkening": "/images/products/welding-helmet.jpg",
  "leather-rigger-gloves-12-pairs": "/images/products/rigger-gloves.jpg",
  "rain-suit-heavy-duty-pvc": "/images/products/rainsuit.jpg",
};

export const CATEGORY_IMAGES: Record<string, string> = {
  // Category tiles reuse the new branded product shots (replaced Oct 2026).
  // The old generic stock photos under /images/categories/ are retired.
  "head-protection": "/images/products/helmet-full-brim.jpg",
  "foot-protection": "/images/products/safety-boots.jpg",
  "hand-protection": "/images/products/rigger-gloves.jpg",
  "eye-face-protection": "/images/products/safety-glasses.jpg",
  "hearing-protection": "/images/products/ear-muffs.jpg",
  "respiratory-protection": "/images/products/respirator.jpg",
  "protective-clothing": "/images/products/hiviz-vest.jpg",
  "fall-protection": "/images/products/harness.jpg",
  "fire-emergency": "/images/products/extinguisher.jpg",
  "road-site-safety": "/images/products/cone.jpg",
};

export const INDUSTRY_IMAGES: Record<string, string> = {
  "construction": "/images/industries/construction.jpg",
  "oil-and-gas": "/images/industries/oil-and-gas.jpg",
  "manufacturing": "/images/industries/manufacturing.jpg",
  "agriculture": "/images/industries/agriculture.jpg",
  "flower-farms": "/images/industries/flower-farms.jpg",
  "mining": "/images/industries/mining.jpg",
  "logistics": "/images/industries/logistics.jpg",
  "healthcare": "/images/industries/healthcare.jpg",
  "engineering": "/images/industries/engineering.jpg",
  "hospitality": "/images/industries/hospitality.jpg",
  "schools": "/images/industries/schools.jpg",
  "government": "/images/industries/government.jpg",
  "ngo": "/images/industries/ngo.jpg",
  "security": "/images/industries/security.jpg",
};

export const POST_IMAGES: Record<string, string> = {
  "ppe-requirements-construction-sites-kenya": "/images/industries/construction.jpg",
  "how-to-choose-right-safety-helmet": "/images/products/helmet-full-brim.jpg",
  "en397-safety-helmet-explained": "/images/products/helmet-full-brim.jpg",
  "safety-boots-s1-vs-s2-vs-s3": "/images/products/safety-boots.jpg",
  "ppe-for-oil-and-gas-workers": "/images/industries/oil-and-gas.jpg",
  "ppe-for-flower-farms": "/images/industries/flower-farms.jpg",
  "workplace-safety-checklist": "/images/products/extinguisher.jpg",
  "how-to-choose-chemical-resistant-gloves": "/images/products/chemical-gloves.jpg",
};

export function withImage<T extends { slug: string }>(p: T): T & { image: string | undefined } {
  return { ...p, image: PRODUCT_IMAGES[p.slug] };
}

// ---------- Multi-image galleries ----------
// Some products were photographed from multiple angles (e.g. `Foo.jpg`
// + `Foo_2.jpg` / `Foo-2.jpg`). The canonical image stays in
// PRODUCT_IMAGES / `image`, and every extra angle is listed here so the
// storefront can render a thumbnail gallery. Slugs map to EXTRA images
// only (primary image is NOT repeated).
export const PRODUCT_GALLERIES: Record<string, string[]> = {
  "disposable-ear-plugs-box-200": ["/images/products/Ear Plugs.jpg", "/images/products/EAR PLUGS_2.jpg"],
  "disposable-coveralls-type-56": ["/images/products/Disposable coverall.jpg"],
  "4kg-dry-powder-fire-extinguisher": ["/images/products/4kg-dry-powder-fire-extinguisher.jpg"],
  "4kg-dry-powder-fire-extinguisher-2": ["/images/products/4kg-dry-powder-fire-extinguisher.jpg"],
  "500ml-alcohol-based-hand-sanitizer": ["/images/products/500ml-alcohol-based-hand-sanitizer-2.jpg"],
  "500ml-alcohol-based-hand-sanitizer-2": ["/images/products/500ml-alcohol-based-hand-sanitizer.jpg"],
  "askari-lanyard-with-a-whistle": ["/images/products/askari-lanyard-with-a-whistle-2.jpg"],
  "askari-lanyard-with-a-whistle-2": ["/images/products/askari-lanyard-with-a-whistle.jpg"],
  "fire-action-plan": ["/images/products/fire-action-plan-2.jpg"],
  "fire-action-plan-2": ["/images/products/fire-action-plan.jpg"],
  "fire-exit-sign": ["/images/products/fire-exit-sign-2.jpg"],
  "fire-exit-sign-2": ["/images/products/fire-exit-sign.jpg"],
  "life-saver-triangle": ["/images/products/life-saver-triangle-2.jpg"],
  "life-saver-triangle-2": ["/images/products/life-saver-triangle.jpg"],
  "ppe-signage": ["/images/products/ppe-signage-2.jpg"],
  "ppe-signage-2": ["/images/products/ppe-signage.jpg"],
  "rocklander-industrial-safety-boot": ["/images/products/rocklander-industrial-safety-boot-2.jpg"],
  "rocklander-industrial-safety-boot-2": ["/images/products/rocklander-industrial-safety-boot.jpg"],
  "safety-overalls": ["/images/products/safety-overalls-2.jpg"],
  "safety-overalls-2": ["/images/products/safety-overalls.jpg"],
  "safety-signage": ["/images/products/safety-signage-2.jpg"],
  "safety-signage-2": ["/images/products/Safety Signage.jpg"],
  "welding-goggles": ["/images/products/Welding Goggles.jpg", "/images/products/Welding Goggles_2.jpg"],
  "welding-goggles-2": ["/images/products/Welding Goggles.jpg", "/images/products/welding-goggles-2.jpg"],
  "wooden-pole-climbers": [
    "/images/products/Wooden Pole Climbers.jpg",
    "/images/products/Wooden Pole Climbers_2.jpg",
    "/images/products/WOODEN POLE CLIMBERS_3.jpg",
  ],
  "waterproof-rubber-white-boots": [
    "/images/products/Waterproof RUBBER WHITE Boots.jpg",
    "/images/products/Waterproof RUBBER WHITE Boots_2.jpg",
    "/images/products/Waterproof RUBBER WHITE Boots_3.jpg",
  ],
  "fire-blanket": ["/images/products/fire-blanket-2.jpg"],
  "fire-blanket-2": ["/images/products/Fire Blanket.jpg"],
  "security-guard-sweater": ["/images/products/Security Guard Sweater.jpg", "/images/products/Security Guard Sweater_2.jpg"],
  "red-reflector-overall": ["/images/products/Red reflector overall.jpg", "/images/products/Red Reflector Overall_2.jpg"],
  "disposable-shoe-cover": ["/images/products/Disposable Shoe Cover.jpg", "/images/products/Disposable Shoe Cover_2.jpg"],
  "ace-parade-safety-boots": ["/images/products/Ace Parade Safety Boots_2.jpg"],
  "vaultex-dust-mask-vb": ["/images/products/vaultex-dust-mask-vb1.jpg", "/images/products/vaultex-dust-mask-vb3.jpg"],
  "concrete-pole-climbers": ["/images/products/Concrete Pole Climbers.jpg"],
  "fire-bell": ["/images/products/Fire Bell.jpg"],
  "garrett-metal-detector": ["/images/products/Garrett Metal Detector.jpg"],
  "rain-coat-with-inner-lining": ["/images/products/Rain Coat with Inner Lining.jpg"],
  "reflective-strap-vest": ["/images/products/Reflective Strap Vest.jpg"],
  "safety-goggles": ["/images/products/SAFETY GOGGLES.jpg"],
  "safety-jacket": ["/images/products/Safety Jacket.jpg"],
  "smoke-detector": ["/images/products/Smoke Detector.jpg"],
};

// All displayable images for a product, de-duplicated, primary first.
export function productImages(p: { slug: string; image?: string; images?: string[] }): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (u && !out.includes(u)) out.push(u);
  };
  push(p.image ?? PRODUCT_IMAGES[p.slug]);
  for (const u of p.images ?? []) push(u);
  for (const u of PRODUCT_GALLERIES[p.slug] ?? []) push(u);
  return out;
}

// ---------- Related products ----------
// Scored so "Frequently bought together" is stable and genuinely related:
// same category +3, each shared industry +2, same brand +1, featured +0.5,
// in-stock +0.25. Products with images rank above imageless ones.
export function getRelatedProducts<T extends {
  slug: string; category: string; industries: string[]; brand: string;
  featured?: boolean; stock: number; image?: string;
}>(current: T, all: T[], limit = 4): T[] {
  const scored = all
    .filter((x) => x.slug !== current.slug)
    .map((x) => {
      let score = 0;
      if (x.category === current.category) score += 3;
      const shared = x.industries.filter((i) => current.industries.includes(i)).length;
      score += shared * 2;
      if (x.brand && current.brand && x.brand === current.brand) score += 1;
      if (x.featured) score += 0.5;
      if (x.stock > 0) score += 0.25;
      if (x.image) score += 0.5;
      return { x, score, shared };
    })
    // Keep only genuinely related: same category OR at least one shared industry.
    // Fall back to top-scoring items if nothing qualifies (e.g. unique category).
    .sort((a, b) => b.score - a.score || b.shared - a.shared);
  const qualified = scored.filter((s) => s.x.category === current.category || s.shared > 0);
  const pool = qualified.length >= limit ? qualified : scored;
  return pool.slice(0, limit).map((s) => s.x);
}

// Full range = 24 curated products + auto-generated photo products.
// (Defined last: needs PRODUCTS, AUTO_PRODUCTS and BRANDS above.)
export const ALL_PRODUCTS: CatalogProduct[] = [...PRODUCTS, ...AUTO_PRODUCTS];

// Every brand present in the combined range (for shop filters + seeding).
export const BRANDS_ALL: string[] = Array.from(
  new Set([...BRANDS, ...AUTO_PRODUCTS.map((p) => p.brand)])
).sort();
