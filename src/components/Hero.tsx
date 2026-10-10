"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
      className="relative h-[210px] overflow-hidden rounded-lg bg-navy-950 sm:h-[300px] lg:h-full lg:min-h-0"
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
        <p className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-slate-200 sm:line-clamp-none sm:text-[15px]">{s.sub}</p>
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
  return (
    <Link
      href={`/product/${p.slug}`}
      aria-label={p.name}
      className="relative block aspect-square min-h-0 w-full overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-accent-500/60 hover:shadow-lg lg:aspect-auto lg:flex-1"
    >
      {p.image ? (
        <Image src={p.image} alt={p.name} fill sizes="250px" className="object-contain" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-safety-600 to-navy-950" />
      )}
    </Link>
  );
}
