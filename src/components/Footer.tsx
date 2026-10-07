import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

function SocialIcon({ path, label, href }: { path: string; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-accent-500 hover:text-navy-950">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
    </a>
  );
}

const SOCIALS: { label: string; path: string; href: string }[] = [
  { label: "Facebook", href: "https://www.facebook.com/safetyproke", path: "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3Z" },
  { label: "X", href: "https://x.com/safetyproke", path: "M17.8 4h2.7l-6 6.8L21.5 20h-5.6l-4.3-5.6L6.6 20H3.9l6.4-7.3L3.6 4H9.3l3.9 5.1L17.8 4Zm-1 14.3h1.5L8.1 5.6H6.5l10.3 12.7Z" },
  { label: "Instagram", href: "https://www.instagram.com/safetyproke", path: "M12 8.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Zm0-2.1a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm6.8-.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM12 4.2c-2.5 0-2.9 0-3.9.1-2.7.1-4 1.4-4.1 4.1-.1 1 0 1.4 0 3.9s0 2.9.1 3.9c.1 2.7 1.4 4 4.1 4.1 1 .1 1.4 0 3.9 0s2.9 0 3.9-.1c2.7-.1 4-1.4 4.1-4.1.1-1 0-1.4 0-3.9s0-2.9-.1-3.9c-.1-2.7-1.4-4-4.1-4.1-1-.1-1.4 0-3.9 0Z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/safetyproke", path: "M6.9 8.6H4V20h2.9V8.6ZM5.4 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM10 20v-5.7c0-1.5.8-2.6 2.3-2.6 1.4 0 2 1 2 2.6V20h2.9v-6.1c0-3-1.6-4.4-3.9-4.4-1.8 0-2.7 1-3.2 1.8V8.6H7.2c0 .8 0 11.4 0 11.4H10Z" },
];

const SHOP_LINKS = [
  ["All Products", "/shop"], ["PPE Kits & Bundles", "/packages"],
  ["Safety Boots", "/shop/foot-protection"], ["Safety Helmets", "/shop/head-protection"],
  ["Gloves", "/shop/hand-protection"], ["Eye Protection", "/shop/eye-face-protection"],
  ["Protective Clothing", "/shop/protective-clothing"], ["Fall Protection", "/shop/fall-protection"],
  ["Fire Safety", "/shop/fire-emergency"],
];
const IND_LINKS = [
  ["Construction", "/industries/construction"], ["Oil & Gas", "/industries/oil-and-gas"],
  ["Manufacturing", "/industries/manufacturing"], ["Agriculture", "/industries/agriculture"],
  ["Mining", "/industries/mining"], ["Logistics", "/industries/logistics"], ["Healthcare", "/industries/healthcare"],
];
const CO_LINKS = [
  ["About Us", "/about"], ["Contact", "/contact"], ["Bulk & Corporate Orders", "/bulk-ppe"], ["Safety Training", "/training"],
  ["Open Corporate Account", "/register?type=company"], ["Resources", "/resources"], ["Privacy Policy", "/privacy"], ["Terms", "/terms"],
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      {/* corporate assurance strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-300 sm:px-6 lg:px-8">
          {["LPO Accepted", "KRA VAT Invoices", "EN / ISO Certified Stock", "47-County Delivery"].map((t) => (
            <span key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> {t}</span>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <p className="flex items-center gap-2.5">
            <Image src="/logo/logo.png" alt="SAFETYPRO AFRICA" width={280} height={140} className="h-14 w-auto rounded-lg bg-white px-2 py-1" />
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Kenya&apos;s corporate PPE partner — certified stock, structured quotations and accountable delivery for contractors, industry and institutions.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2"><Phone size={15} className="text-accent-500" /> 0715 135 141 <span className="text-slate-500">(Mon–Sat, 8am–6pm)</span></p>
            <p className="flex items-center gap-2"><Mail size={15} className="text-accent-500" /> sales@safetypro.co.ke</p>
            <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-accent-500" /> Enterprise Road, Industrial Area, Nairobi, Kenya</p>
          </div>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((s) => <SocialIcon key={s.label} {...s} />)}
          </div>
        </div>
        <nav>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SHOP_LINKS.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-accent-500">{l}</Link></li>)}
          </ul>
        </nav>
        <nav>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Industries</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {IND_LINKS.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-accent-500">{l}</Link></li>)}
          </ul>
        </nav>
        <nav>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CO_LINKS.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-accent-500">{l}</Link></li>)}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SafetyPro Africa. All Rights Reserved.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="rounded border border-white/15 px-2 py-0.5 font-bold text-slate-300">M-PESA</span>
            <span className="rounded border border-white/15 px-2 py-0.5 font-bold text-slate-300">BANK</span>
            <span className="rounded border border-white/15 px-2 py-0.5 font-bold text-slate-300">LPO 30-DAY</span>
            <span className="rounded border border-white/15 px-2 py-0.5 font-bold text-slate-300">VAT 16%</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
