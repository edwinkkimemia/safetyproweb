"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  slug: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  size?: string;
  colour?: string;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string, size?: string, colour?: string) => void;
  setQty: (slug: string, qty: number, size?: string, colour?: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (slug: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const CART_KEY = "sp-cart-v1";
const WISH_KEY = "sp-wish-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLines(JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"));
      setWishlist(JSON.parse(localStorage.getItem(WISH_KEY) ?? "[]"));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, ready]);

  const add = useCallback((l: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((x) => x.slug === l.slug && x.size === l.size && x.colour === l.colour);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(999, next[i].qty + qty) };
        return next;
      }
      return [...prev, { ...l, qty }];
    });
  }, []);

  const remove = useCallback((slug: string, size?: string, colour?: string) => {
    setLines((prev) => prev.filter((x) => !(x.slug === slug && x.size === size && x.colour === colour)));
  }, []);

  const setQty = useCallback((slug: string, qty: number, size?: string, colour?: string) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((x) => !(x.slug === slug && x.size === size && x.colour === colour))
        : prev.map((x) => (x.slug === slug && x.size === size && x.colour === colour ? { ...x, qty: Math.min(999, qty) } : x))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const toggleWish = useCallback((slug: string) => {
    setWishlist((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const value = useMemo<CartCtx>(() => ({
    lines, wishlist,
    count: lines.reduce((a, l) => a + l.qty, 0),
    subtotal: lines.reduce((a, l) => a + l.qty * l.price, 0),
    add, remove, setQty, clear, toggleWish,
  }), [lines, wishlist, add, remove, setQty, clear, toggleWish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
