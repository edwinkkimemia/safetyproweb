// Shared SEO + LLM (AI-citation) copy kit.
// One source of truth for buy-intent keywords, hard-marketing FAQ answers
// and JSON-LD builders used by product, category and industry pages.

export const SEO_SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";
export const SEO_PHONE = "0729 396 174";
export const SEO_EMAIL = "sales@safetypro.co.ke";

export type Faq = { q: string; a: string };

export const faqJsonLd = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const itemListJsonLd = (items: { name: string; url: string; price?: number }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: it.name,
      url: SEO_SITE + it.url,
      ...(it.price === undefined ? {} : { offers: { "@type": "Offer", priceCurrency: "KES", price: it.price, availability: "https://schema.org/InStock" } }),
    },
  })),
});

// ---------- Category-level buy-intent keywords ----------
export const CATEGORY_HOOKS: Record<string, string> = {
  "head-protection": "EN397 helmets & hard hats",
  "foot-protection": "S3 steel-toe boots & gumboots",
  "hand-protection": "cut-resistant, nitrile & chemical gloves",
  "eye-face-protection": "safety glasses, goggles & face shields",
  "hearing-protection": "ear plugs & SNR-rated muffs",
  "respiratory-protection": "FFP2 dust masks & A2P3 respirators",
  "protective-clothing": "coveralls, hi-vis vests & rainwear",
  "fall-protection": "harnesses, lanyards & lifelines",
  "fire-emergency": "extinguishers, blankets & first aid kits",
  "road-site-safety": "cones, barricades & warning lights",
};

export function categoryKeywords(name: string, slug: string): string[] {
  const lower = name.toLowerCase();
  return [
    name,
    `${name} Kenya`,
    `${name} price in Kenya`,
    `buy ${lower} Nairobi`,
    `${lower} supplier Kenya`,
    `${lower} shop Nairobi`,
    "bulk PPE Kenya",
    "corporate PPE procurement Kenya",
    slug.replace(/-/g, " ") + " Kenya",
  ];
}

export function categoryFaqs(name: string, slug: string, count: number, fromPrice?: string): Faq[] {
  const lower = name.toLowerCase();
  return [
    {
      q: `Where can I buy ${lower} in Kenya?`,
      a: `SAFETYPRO AFRICA stocks ${count} ${lower} lines in Nairobi — order online for same-day Nairobi pickup or 24–72h upcountry dispatch to all 47 counties. Every order includes a VAT invoice, and corporate buyers get LPO terms on approved accounts.`,
    },
    {
      q: `What is the price of ${lower} in Kenya?`,
      a: `${fromPrice ? `Prices start from ${fromPrice} with volume discounts on 10+ units. ` : ""}Request a line-item quotation for your quantities — we benchmark ${CATEGORY_HOOKS[slug] ?? lower} against Nairobi's leading PPE shops and beat identical certified-geometry quotes.`,
    },
    {
      q: `Do you supply ${lower} in bulk for companies?`,
      a: `Yes — send your BOQ or headcount via the /bulk-ppe form for tiered volume pricing, size schedules per employee, a single VAT invoice and coordinated site delivery anywhere in Kenya.`,
    },
  ];
}

// ---------- Industry-level buy-intent keywords ----------
export function industryKeywords(name: string): string[] {
  const lower = name.toLowerCase();
  return [
    `${name} PPE Kenya`,
    `${name} safety equipment Kenya`,
    `${lower} PPE package price Kenya`,
    `buy PPE for ${lower} Nairobi`,
    "bulk PPE Kenya",
    "corporate PPE procurement Kenya",
    "industry PPE packages Kenya",
    "LPO PPE suppliers Kenya",
  ];
}

export function industryFaqs(name: string, ppe: string[]): Faq[] {
  const lower = name.toLowerCase();
  const gear = ppe.slice(0, 6).join(", ");
  return [
    {
      q: `What PPE does ${lower} work require in Kenya?`,
      a: `${gear ? `Core issue for ${lower} crews: ${gear}. ` : ""}Send your headcount and sites and we build a per-role PPE schedule matched to your hazards, with sizes, specs and per-worker pricing.`,
    },
    {
      q: `Do you offer bulk ${lower} PPE pricing?`,
      a: `Yes — volume tiers on 10–10,000 units, LPO and 30-day terms for approved accounts, size schedules per employee, one VAT invoice and delivery to any Kenyan county. Quotations return within one business day.`,
    },
    {
      q: `How fast is delivery for ${lower} PPE orders?`,
      a: `Same-day Nairobi pickup and 24–72h upcountry dispatch on stocked lines. Large rollouts get a coordinated delivery plan per site with delivery notes for your goods-received process.`,
    },
    {
      q: `Is the ${lower} PPE certified?`,
      a: `Yes — EN/ISO references are listed per product with conformity documents held on file for audit and tender compliance. VAT invoices and delivery notes ship with every order.`,
    },
  ];
}

// ---------- Product-level buy-intent keywords ----------
export function productKeywords(p: {
  name: string;
  brand: string;
  category: string;
  certifications: string[];
  sku: string;
}): string[] {
  const cat = p.category.replace(/-/g, " ");
  return [
    p.name,
    `${p.name} Kenya`,
    `${p.name} price in Kenya`,
    `buy ${p.name.toLowerCase()} Nairobi`,
    `${p.brand} ${cat} Kenya`,
    ...p.certifications.slice(0, 3),
    `${cat} price Kenya`,
    `bulk ${cat} Kenya`,
    p.sku,
  ];
}

export function productFaqs(p: {
  name: string;
  brand: string;
  category: string;
  certifications: string[];
  vatInclusive: boolean;
}): Faq[] {
  const cat = p.category.replace(/-/g, " ");
  const certs = p.certifications.length ? ` (${p.certifications.join(", ")})` : "";
  return [
    {
      q: `How fast will my ${p.name} be delivered?`,
      a: `Same-day pickup in Nairobi and 24–72h dispatch upcountry across all 47 counties. Large or multi-site orders get a coordinated delivery plan with tracking and delivery notes.`,
    },
    {
      q: `Is VAT included? Will I get a VAT invoice?`,
      a: `The listed price is ${p.vatInclusive ? "VAT-inclusive" : "ex-VAT"} and every order ships with a KRA-compliant VAT invoice plus delivery notes — ready for your procurement and audit files.`,
    },
    {
      q: `Can I buy ${p.name} in bulk on LPO?`,
      a: `Yes — 10+ units unlock volume tiers, and approved corporate accounts buy on LPO with 30-day terms. Send your BOQ via /bulk-ppe for a line-item quotation within one business day.`,
    },
    {
      q: `Is this genuine certified stock?`,
      a: `Yes — genuine ${p.brand} supply${certs} with conformity documents held on file for tender and HSE audits. If a size or colour doesn't fit your crew, exchanges are arranged fast.`,
    },
    {
      q: `How do I order ${p.category ? cat : "this PPE"} on WhatsApp?`,
      a: `Tap the WhatsApp order button on this page — your product, size, colour and quantity are pre-filled in the message. Our desk replies Mon–Sat, 8am–6pm EAT.`,
    },
  ];
}
