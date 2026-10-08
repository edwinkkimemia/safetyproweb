"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";
import type { CatalogProduct, Category } from "@/lib/catalog";
import { INDUSTRIES, BRANDS_ALL as BRANDS, categoryName } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { Badge } from "./ui";
import { inputCls } from "./ui";
import { cn } from "@/lib/utils";

type Props = {
  products: CatalogProduct[];
  categories: Category[];
  waNumber: string;
  initialQuery?: string;
  initialCategory?: string;
};

const PAGE_SIZE = 12;

export function ShopClient({ products, categories, waNumber, initialQuery = "", initialCategory = "" }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [brands, setBrands] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [inds, setInds] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(() => Math.max(...products.map((p) => p.price), 13000));
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);

  // Header searches navigate /shop?q=… client-side without remounting us,
  // and category hops reuse this client too — resync when the URL changes
  // (state adjusted during render, no effect).
  const [lastQuery, setLastQuery] = useState(initialQuery);
  if (lastQuery !== initialQuery) {
    setLastQuery(initialQuery); setQ(initialQuery); setPage(1);
  }
  const [lastCat, setLastCat] = useState(initialCategory);
  if (lastCat !== initialCategory) {
    setLastCat(initialCategory); setCats(initialCategory ? [initialCategory] : []); setPage(1);
  }

  const allCerts = useMemo(() => Array.from(new Set(products.flatMap((p) => p.certifications))).sort(), [products]);
  const topPrice = useMemo(() => Math.max(...products.map((p) => p.price), 13000), [products]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (certs.length && !certs.every((c) => p.certifications.includes(c))) return false;
      if (inds.length && !inds.some((i) => p.industries.includes(i))) return false;
      if (p.price > maxPrice) return false;
      if (inStock && p.stock <= 0) return false;
      if (needle) {
        const hay = [p.name, p.sku, p.brand, categoryName(p.category), p.short, ...p.specs.map((s) => `${s.key} ${s.value}`), ...p.certifications, ...p.applications].join(" ").toLowerCase();
        if (!needle.split(/\s+/).every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false)); break;
      case "popular": list = [...list].sort((a, b) => b.reviews - a.reviews); break;
      default: list = [...list].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return list;
  }, [products, q, cats, brands, certs, inds, maxPrice, inStock, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilters = cats.length + brands.length + certs.length + inds.length + (inStock ? 1 : 0);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => { setCats([]); setBrands([]); setCerts([]); setInds([]); setInStock(false); setMaxPrice(topPrice); setQ(""); setPage(1); };

  const chips: { label: string; clear: () => void }[] = [
    ...cats.map((s) => ({ label: categoryName(s), clear: () => { setCats(cats.filter((x) => x !== s)); setPage(1); } })),
    ...brands.map((s) => ({ label: s, clear: () => { setBrands(brands.filter((x) => x !== s)); setPage(1); } })),
    ...certs.map((s) => ({ label: s, clear: () => { setCerts(certs.filter((x) => x !== s)); setPage(1); } })),
    ...inds.map((s) => ({ label: INDUSTRIES.find((i) => i.slug === s)?.name ?? s, clear: () => { setInds(inds.filter((x) => x !== s)); setPage(1); } })),
    ...(inStock ? [{ label: "In stock", clear: () => setInStock(false) }] : []),
  ];

  const filters = (
    <div className="divide-y divide-slate-100">
      <FilterGroup title="Category" count={cats.length} defaultOpen>
        {categories.map((c) => (
          <Check key={c.slug} label={c.name} checked={cats.includes(c.slug)} onChange={() => { toggle(cats, c.slug, setCats); setPage(1); }} />
        ))}
      </FilterGroup>
      <FilterGroup title="Max price" defaultOpen>
        <input type="range" min={300} max={topPrice} step={100} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full accent-accent-500" aria-label="Maximum price" />
        <p className="text-[13px] font-bold text-navy-950">Up to KES {maxPrice.toLocaleString()}</p>
      </FilterGroup>
      <FilterGroup title="Brand" count={brands.length} scroll>
        {BRANDS.filter((b) => products.some((p) => p.brand === b)).map((b) => (
          <Check key={b} label={b} checked={brands.includes(b)} onChange={() => { toggle(brands, b, setBrands); setPage(1); }} />
        ))}
      </FilterGroup>
      {allCerts.length > 0 && (
        <FilterGroup title="Certification" count={certs.length} scroll>
          {allCerts.map((c) => (
            <Check key={c} label={c} checked={certs.includes(c)} onChange={() => { toggle(certs, c, setCerts); setPage(1); }} />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Industry" count={inds.length} scroll>
        {INDUSTRIES.map((i) => (
          <Check key={i.slug} label={i.name} checked={inds.includes(i.slug)} onChange={() => { toggle(inds, i.slug, setInds); setPage(1); }} />
        ))}
      </FilterGroup>
      <FilterGroup title="Availability" count={inStock ? 1 : 0}>
        <Check label="In stock only" checked={inStock} onChange={() => { setInStock(!inStock); setPage(1); }} />
      </FilterGroup>
    </div>
  );

  return (
    <div className="flex gap-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-40 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-extrabold text-navy-950"><SlidersHorizontal size={16} /> Filters {activeFilters > 0 && <Badge tone="accent">{activeFilters}</Badge>}</h2>
            {activeFilters > 0 && <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:underline">Clear</button>}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, SKU, EN397, oil and gas…"
              className={inputCls} />
          </div>
          <button onClick={() => setDrawer(true)} className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-navy-950 lg:hidden">
            <SlidersHorizontal size={16} /> Filters {activeFilters > 0 && <Badge tone="accent">{activeFilters}</Badge>}
          </button>
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-[42px] appearance-none rounded-xl border border-slate-300 bg-white pl-4 pr-9 text-sm font-semibold outline-none focus:border-safety-600">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <p className="mt-3 text-[13px] text-slate-500">
          Showing <strong className="text-navy-950">{visible.length}</strong> of <strong className="text-navy-950">{filtered.length}</strong> products
          {initialCategory && <span> in <strong className="text-safety-600">{categoryName(initialCategory)}</strong></span>}
        </p>
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <button
                key={c.label} onClick={c.clear}
                className="inline-flex items-center gap-1 rounded-full bg-navy-950 py-1 pl-3 pr-1.5 text-xs font-bold text-white transition hover:bg-safety-600"
              >
                {c.label} <X size={13} />
              </button>
            ))}
            <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:underline">Clear all</button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Star size={28} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-extrabold text-navy-950">No products match those filters</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different term — or WhatsApp us and we&apos;ll source it for you.</p>
            <button onClick={clearAll} className="mt-4 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">Clear filters</button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {visible.map((p) => <ProductCard key={p.slug} p={p} waNumber={waNumber} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition",
                  n === page ? "bg-navy-950 text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-safety-600")}>{n}</button>
            ))}
          </div>
        )}
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 nice-scroll">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold text-navy-950">Filters</h2>
              <button onClick={() => setDrawer(false)} className="rounded-lg bg-mist p-2" aria-label="Close filters"><X size={18} /></button>
            </div>
            {filters}
            <button onClick={() => setDrawer(false)} className="sticky bottom-0 mt-5 w-full rounded-xl bg-accent-500 py-3.5 font-extrabold uppercase text-navy-950">
              Show {filtered.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children, count = 0, defaultOpen = false, scroll = false }: {
  title: string; children: React.ReactNode; count?: number; defaultOpen?: boolean; scroll?: boolean;
}) {
  // Open by default for the primary group or whenever it holds active selections.
  const [open, setOpen] = useState(defaultOpen || count > 0);
  const [seenCount, setSeenCount] = useState(count);
  if (seenCount !== count) {
    setSeenCount(count);
    if (count > 0) setOpen(true);
  }
  return (
    <div className="py-1">
      <button
        onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-1 py-2.5 text-left transition hover:bg-mist"
      >
        <span className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-widest text-navy-950">
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-extrabold text-navy-950">{count}</span>
          )}
        </span>
        <ChevronDown size={15} className={cn("shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className={cn("space-y-1.5 pb-2", scroll && "nice-scroll max-h-48 overflow-y-auto pr-1")}>{children}</div>
      )}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-[13.5px] text-slate-600 hover:bg-mist">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-safety-600" />
      <span className={checked ? "font-bold text-navy-950" : ""}>{label}</span>
    </label>
  );
}
