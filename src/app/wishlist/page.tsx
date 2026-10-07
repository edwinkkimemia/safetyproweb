"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALL_PRODUCTS as PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const items = PRODUCTS.filter((p) => wishlist.includes(p.slug));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-navy-950"><Heart size={26} className="text-red-500" /> My wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">{items.length} saved item{items.length === 1 ? "" : "s"} — sign in to sync across devices.</p>
      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Heart size={30} className="mx-auto text-slate-300" />
          <p className="mt-3 font-extrabold text-navy-950">No saved items yet</p>
          <p className="mt-1 text-sm text-slate-500">Tap the heart on any product to save it here for later or for your next LPO.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      )}
    </div>
  );
}
