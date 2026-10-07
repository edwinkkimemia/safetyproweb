import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ClipboardList, ShieldCheck, Truck, HeartHandshake } from "lucide-react";
import { SectionHead, Breadcrumbs } from "@/components/ui";
import { HERO_IMAGE } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About Us",
  description: "SAFETYPRO AFRICA — professional PPE and workplace safety equipment supplier serving Kenyan businesses, contractors and institutions.",
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "About Us" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-12">
        <Image src={HERO_IMAGE} alt="Industrial construction site in Kenya" fill sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/30" />
        <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-500">About SafetyPro Africa</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">Protecting People. Powering Safer Workplaces.</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Professional PPE & workplace safety solutions across Africa — starting with Kenyan construction, industry, agriculture and institutions. We combine a modern e-commerce store with a corporate procurement desk, so a single pair of gloves and a 5,000-worker rollout get the same structured service.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/shop" className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white">Shop PPE</Link>
          <Link href="/bulk-ppe" className="rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500">Corporate procurement</Link>
        </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionHead eyebrow="How we work" title="A supplier built for procurement teams" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Structured quotations", "Line-item quotes with specs, sizes, lead times and VAT — ready to attach to your LPO.", ClipboardList],
            ["Wide stocked range", "Ten PPE categories from helmets to site safety, stocked in Nairobi for fast issue.", ShieldCheck],
            ["Corporate accounts", "Repeat orders, saved PPE lists, invoices and delivery history per company.", Building2],
            ["Kenya-wide coordination", "Nairobi pickup plus dispatch to every county with tracking on WhatsApp.", Truck],
          ].map(([t, d, Icon]: any) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950 text-accent-500"><Icon size={20} /></span>
              <h3 className="mt-3 font-extrabold text-navy-950">{t}</h3>
              <p className="mt-1.5 text-[13.5px] text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 rounded-3xl bg-mist p-8 sm:p-10 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-950"><HeartHandshake size={22} className="text-accent-600" /> Who we serve</h2>
          <p className="mt-2 text-[15px] text-slate-600">Construction and oil & gas contractors, manufacturers, flower farms, logistics operators, hospitals, schools, NGOs, government institutions, security firms and hospitality groups — plus individual workers buying single units.</p>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-navy-950">Our working promise</h2>
          <ul className="mt-2 space-y-2 text-[15px] text-slate-600">
            {["Only list certifications actually held in our product database.", "VAT invoices and delivery notes on every order.", "Size and specification guidance before you pay.", "Honest lead times — stocked vs indent items clearly marked."].map((t) => (
              <li key={t} className="flex gap-2"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" /> {t}</li>
            ))}
          </ul>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600">Meet the team — contact us <ArrowRight size={15} /></Link>
        </div>
      </div>
      </div>
    </>
  );
}
