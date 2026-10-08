"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Phone, Search, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./ui";
import type { CartLine } from "@/lib/store";

function humanize(slug: string): string {
  return slug.split("-").filter(Boolean).join(" ");
}

function pageMessage(pathname: string, lines: CartLine[]): string {
  const page = pathname || "/";
  if (page.startsWith("/product/")) {
    const slug = page.split("/")[2] ?? "";
    return `Hello SAFETYPRO AFRICA, I need help with this product: ${humanize(slug)}. Please advise on availability and delivery. Page: ${page}`;
  }
  if (page.startsWith("/shop/")) {
    const cat = humanize(page.split("/")[2] ?? "");
    return `Hello SAFETYPRO AFRICA, I am looking for ${cat} PPE. Please recommend options and bulk pricing. Page: ${page}`;
  }
  if (page === "/shop") return "Hello SAFETYPRO AFRICA, I am browsing PPE. I need help choosing the right products. Page: /shop";
  if (page.startsWith("/packages/")) {
    const kit = humanize(page.split("/")[2] ?? "");
    return `Hello SAFETYPRO AFRICA, I am interested in the ${kit} kit. Please share scaled pricing for my headcount. Page: ${page}`;
  }
  if (page === "/packages") return "Hello SAFETYPRO AFRICA, I need a ready-made PPE kit for my team. Please advise. Page: /packages";
  if (page.startsWith("/industries/")) {
    const ind = humanize(page.split("/")[2] ?? "");
    return `Hello SAFETYPRO AFRICA, I need a PPE package for ${ind}. Please advise. Page: ${page}`;
  }
  if (page === "/industries") return "Hello SAFETYPRO AFRICA, I need PPE matched to my industry hazards. Please advise. Page: /industries";
  if (page === "/bulk-ppe") return "Hello SAFETYPRO AFRICA, I have a PPE list for quotation. How do I send it? Page: /bulk-ppe";
  if (page === "/training") return "Hello SAFETYPRO AFRICA, I am interested in safety training for my team. Please share options. Page: /training";
  if (page === "/cart" || page === "/checkout") {
    if (!lines.length) return `Hello SAFETYPRO AFRICA, I need help with my order. Page: ${page}`;
    const summary = lines.slice(0, 3).map((l) => `${l.qty}x ${l.name}`).join("; ");
    const more = lines.length > 3 ? ` +${lines.length - 3} more` : "";
    return `Hello SAFETYPRO AFRICA, I need help with my cart (${lines.length} lines: ${summary}${more}). Please confirm availability. Page: ${page}`;
  }
  if (page === "/wishlist") return "Hello SAFETYPRO AFRICA, I saved some PPE to my wishlist. Please confirm availability and pricing. Page: /wishlist";
  if (page.startsWith("/account")) return "Hello SAFETYPRO AFRICA, I need help with my account/order. Page: /account";
  if (page.startsWith("/resources/")) {
    const slug = humanize(page.split("/")[2] ?? "");
    return `Hello SAFETYPRO AFRICA, I read your guide on ${slug} and need the PPE mentioned. Please advise. Page: ${page}`;
  }
  if (page === "/contact") return "Hello SAFETYPRO AFRICA, I have an enquiry. Page: /contact";
  return "Hello SAFETYPRO AFRICA, I need help choosing PPE for my team.";
}

export function WhatsAppFloat() {
  const pathname = usePathname();
  const { lines } = useStore();
  const message = pageMessage(pathname ?? "/", lines);
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2.5 md:bottom-6 md:right-6">
      <a href="tel:+254729396174" aria-label="Call 0729 396 174"
        className="flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-navy-950 text-white shadow-[0_10px_30px_-6px_rgba(1,25,81,0.7)] transition hover:scale-105 md:h-auto md:w-auto md:px-5 md:py-3">
        <Phone size={22} className="shrink-0" />
        <span className="hidden text-sm font-bold md:inline">Call us</span>
      </a>
      <a href={waLink(message)} target="_blank" rel="noreferrer noopener" aria-label="Chat on WhatsApp"
        className="relative flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.7)] transition hover:scale-105 md:h-auto md:w-auto md:px-5 md:py-3">
        <WhatsAppIcon size={26} />
        <span className="hidden text-sm font-bold md:inline">WhatsApp us</span>
        <span aria-hidden="true" className="absolute -left-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#25D366]" />
        </span>
      </a>
    </div>
  );
}

export function MobileBottomNav() {
  const { count } = useStore();
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/shop", label: "Shop", Icon: LayoutGrid },
    { href: "/shop?q=", label: "Search", Icon: Search },
    { href: "/cart", label: "Cart", Icon: ShoppingCart, badge: count },
    { href: "/account", label: "Account", Icon: User },
  ];
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, Icon, badge }) => (
          <Link key={label} href={href}
            className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold",
              pathname === href ? "text-accent-600" : "text-slate-500")}>
            <Icon size={20} />
            {label}
            {!!badge && badge > 0 && (
              <span className="absolute right-1/2 top-0.5 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-navy-950">{badge}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
