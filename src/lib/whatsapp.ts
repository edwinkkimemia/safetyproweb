export function siteWhatsapp(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254715135141";
}

export function waLink(message: string, phone?: string): string {
  const p = (phone || siteWhatsapp()).replace(/[^0-9]/g, "");
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

export function productEnquiry(opts: {
  name: string;
  sku: string;
  price: number | string;
  qty?: number;
  siteUrl?: string;
}): string {
  const site = opts.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://safetypro.co.ke";
  return waLink(
    `Hello SAFETYPRO AFRICA, I would like to enquire about:\n\n• Product: ${opts.name}\n• SKU: ${opts.sku}\n• Price: KES ${opts.price}\n• Quantity: ${opts.qty ?? 1}\n• Link: ${site}\n\nPlease advise on availability and delivery. Thank you.`
  );
}

export function quoteEnquiry(company: string, summary: string): string {
  return waLink(
    `Hello SAFETYPRO AFRICA, ${company} requests a corporate quotation:\n${summary}\nPlease contact us. Thank you.`
  );
}
