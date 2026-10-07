"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { kes } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  sub: string;
  cta: string;
  href: string;
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const s = slides[i];

  return (
    <div
      className="relative h-[250px] overflow-hidden rounded-lg bg-navy-950 sm:h-[340px] lg:h-full lg:min-h-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, idx) => (
        <div key={slide.title} className={cn("absolute inset-0 transition-opacity duration-700", idx === i ? "opacity-100" : "pointer-events-none opacity-0")}>
          <Image src={slide.image} alt={slide.title} fill priority={idx === 0} sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/60 to-navy-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

      <div key={i} className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-500 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-widest text-navy-950 sm:text-xs">
          {s.eyebrow}
        </p>
        <h1 className="mt-2 max-w-md text-[22px] font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:mt-2.5 sm:text-4xl">
          {s.title} <span className="text-accent-500">{s.accent}</span>
        </h1>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-200 sm:text-[15px]">{s.sub}</p>
        <div className="mt-4">
          <Link href={s.href} className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-navy-950 shadow transition hover:bg-white sm:px-6 sm:py-3 sm:text-sm">
            {s.cta} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <button onClick={() => go(i - 1)} aria-label="Previous slide"
        className="absolute left-2.5 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-accent-500 hover:text-navy-950 sm:flex">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => go(i + 1)} aria-label="Next slide"
        className="absolute right-2.5 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-accent-500 hover:text-navy-950 sm:flex">
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, idx) => (
          <button key={slide.title} onClick={() => go(idx)} aria-label={`Go to slide ${idx + 1}`}
            className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-7 bg-accent-500" : "w-1.5 bg-white/50 hover:bg-white")} />
        ))}
      </div>
    </div>
  );
}

export function HeroSideCard({ p }: { p: CatalogProduct }) {
  const { add } = useStore();
  const [added, setAdded] = useState(false);
  const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

  return (
    <div className="group relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-accent-500/60 hover:shadow-lg">
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-accent-500 px-1.5 py-0.5 text-[10.5px] font-extrabold text-navy-950">-{discount}%</span>
      )}
      <Link href={`/product/${p.slug}`} className="relative block h-24 shrink-0 overflow-hidden sm:h-32 lg:h-auto lg:min-h-[64px] lg:flex-1">
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="250px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-safety-600 to-navy-950" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-2.5 lg:flex-none lg:p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-safety-600">{p.brand}</p>
        <Link href={`/product/${p.slug}`} className="line-clamp-2 min-h-[2.4em] text-[13px] font-bold leading-snug text-navy-950 hover:text-safety-600">
          {p.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold text-navy-950">{kes(p.price)}</span>
          {p.compareAt && <span className="text-[11px] text-slate-400 line-through">{kes(p.compareAt)}</span>}
        </div>
        <button
          onClick={() => { add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price }, 1); setAdded(true); setTimeout(() => setAdded(false), 1300); }}
          disabled={p.stock <= 0}
          className={cn("mt-2 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide text-white transition active:scale-95",
            added ? "bg-emerald-600" : "bg-navy-950 hover:bg-accent-500 hover:text-navy-950")}>
          <ShoppingCart size={13} /> {added ? "Added!" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
