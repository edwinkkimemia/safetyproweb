// DB-first data access with graceful fallback to the static catalog.
// All storefront reads go through these helpers so products ALWAYS come
// from PostgreSQL when it is reachable.
import { db, dbSafe } from "./db";
import {
  CATEGORIES, ALL_PRODUCTS, INDUSTRIES, PACKAGES, POSTS,
  PRODUCT_IMAGES, CATEGORY_IMAGES, INDUSTRY_IMAGES, POST_IMAGES, withImage,
  PRODUCT_GALLERIES, productImages, getRelatedProducts,
  searchProducts as staticSearch, type CatalogProduct,
} from "./catalog";

export type ProductDTO = CatalogProduct;

export type PackageDTO = {
  slug: string; name: string; blurb: string; price: number;
  image?: string; items: ProductDTO[]; badge?: string;
};

function rowToDTO(r: any): ProductDTO {
  const dbImages: string[] = (r.images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((im: any) => im.url)
    .filter(Boolean);
  const fallback = PRODUCT_IMAGES[r.slug] as string | undefined;
  const gallery = PRODUCT_GALLERIES[r.slug] ?? [];
  const merged = [...dbImages, ...(fallback && !dbImages.includes(fallback) ? [fallback] : []), ...gallery.filter((u) => !dbImages.includes(u))];
  const primary = merged[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    sku: r.sku,
    brand: r.brand?.name ?? "SafetyPro",
    category: r.category?.slug ?? "uncategorised",
    price: Number(r.price),
    compareAt: r.compareAtPrice ? Number(r.compareAtPrice) : undefined,
    vatInclusive: r.vatInclusive,
    stock: r.stock,
    rating: Number(r.rating ?? 0),
    reviews: r.reviewCount ?? 0,
    featured: r.featured,
    isNew: r.isNew,
    short: r.shortDesc ?? "",
    description: r.description ?? "",
    specs: (r.specifications ?? []).map((s: any) => ({ key: s.key, value: s.value })),
    certifications: (r.certifications ?? []).map((c: any) => c.certification?.code ?? c.code).filter(Boolean),
    industries: (r.industries ?? []).map((i: any) => i.industry?.slug ?? i.slug).filter(Boolean),
    applications: r.applications ?? [],
    sizes: r.sizes ?? [],
    colours: r.colours ?? [],
    image: primary,
    images: merged.slice(1),
  };
}

export async function getProducts(opts?: { featured?: boolean; category?: string; limit?: number }): Promise<ProductDTO[]> {
  return dbSafe(async (tx) => {
    const rows = await tx.product.findMany({
      where: {
        isActive: true,
        ...(opts?.featured ? { featured: true } : {}),
        ...(opts?.category ? { category: { slug: opts.category } } : {}),
      },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: true, certifications: { include: { certification: true } }, industries: { include: { industry: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: opts?.limit ?? 2000,
    });
    if (!rows.length) throw new Error("empty");
    return rows.map(rowToDTO);
  }, fallbackProducts(opts));
}

function fallbackProducts(opts?: { featured?: boolean; category?: string; limit?: number }): ProductDTO[] {
  let list = [...ALL_PRODUCTS];
  if (opts?.featured) list = list.filter((p) => p.featured);
  if (opts?.category) list = list.filter((p) => p.category === opts.category);
  return list.slice(0, opts?.limit ?? 2000).map((p) => {
    const gallery = productImages({ slug: p.slug, image: PRODUCT_IMAGES[p.slug] ?? p.image, images: p.images });
    return { ...p, image: gallery[0] ?? p.image, images: gallery.slice(1) };
  });
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  return dbSafe(async (tx) => {
    const r = await tx.product.findUnique({
      where: { slug },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: true, certifications: { include: { certification: true } }, industries: { include: { industry: true } } },
    });
    if (!r) throw new Error("missing");
    return rowToDTO(r);
  }, (() => { const p = ALL_PRODUCTS.find((x) => x.slug === slug); if (!p) return null; const gallery = productImages({ slug: p.slug, image: PRODUCT_IMAGES[p.slug] ?? p.image, images: p.images }); return { ...p, image: gallery[0] ?? p.image, images: gallery.slice(1) }; })());
}

export async function getRelated(slug: string, limit = 4): Promise<ProductDTO[]> {
  const [current, all] = await Promise.all([getProduct(slug), getProducts({})]);
  if (!current) return [];
  return getRelatedProducts(current, all, limit);
}

export async function searchCatalog(q: string): Promise<ProductDTO[]> {
  const fallback = staticSearch(q).map((p) => {
    const gallery = productImages({ slug: p.slug, image: PRODUCT_IMAGES[p.slug] ?? p.image, images: (p as any).images });
    return { ...p, image: gallery[0] ?? p.image, images: gallery.slice(1) };
  });
  return dbSafe(async (tx) => {
    const needle = q.trim();
    if (!needle) {
      const rows = await tx.product.findMany({ where: { isActive: true }, include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: true, certifications: { include: { certification: true } }, industries: { include: { industry: true } } }, take: 150 });
      return rows.map(rowToDTO);
    }
    const rows = await tx.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: needle, mode: "insensitive" } },
          { sku: { contains: needle, mode: "insensitive" } },
          { description: { contains: needle, mode: "insensitive" } },
          { brand: { name: { contains: needle, mode: "insensitive" } } },
          { category: { name: { contains: needle, mode: "insensitive" } } },
          { specifications: { some: { value: { contains: needle, mode: "insensitive" } } } },
        ],
      },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: true, certifications: { include: { certification: true } }, industries: { include: { industry: true } } },
      take: 150,
    });
    if (!rows.length) throw new Error("empty");
    return rows.map(rowToDTO);
  }, fallback);
}

export async function getCategories() {
  return dbSafe(async (tx) => {
    const rows = await tx.category.findMany({ orderBy: { sortOrder: "asc" }, include: { children: true } });
    if (!rows.length) throw new Error("empty");
    return rows.map((c) => ({ slug: c.slug, name: c.name, blurb: c.description ?? "", icon: c.icon ?? "shield", image: c.image ?? CATEGORY_IMAGES[c.slug], subs: c.children.map((x) => x.name) }));
  }, CATEGORIES.map((c) => ({ ...c, image: CATEGORY_IMAGES[c.slug] })));
}

export async function getIndustries() {
  return dbSafe(async (tx) => {
    const rows = await tx.industry.findMany({ orderBy: { sortOrder: "asc" } });
    if (!rows.length) throw new Error("empty");
    return rows.map((r) => ({ slug: r.slug, name: r.name, blurb: r.description ?? "", hazards: r.hazards, image: r.image ?? INDUSTRY_IMAGES[r.slug], ppe: [] as string[] }));
  }, INDUSTRIES.map((i) => ({ ...i, image: INDUSTRY_IMAGES[i.slug] })));
}

export async function getPackages(): Promise<PackageDTO[]> {
  return dbSafe<PackageDTO[]>(async (tx) => {
    const rows = await tx.productPackage.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: true,
                certifications: { include: { certification: true } },
                industries: { include: { industry: true } },
              },
            },
          },
        },
      },
    });
    if (!rows.length) throw new Error("empty");
    return rows.map((r) => ({ slug: r.slug, name: r.name, blurb: r.description ?? "", price: Number(r.price ?? 0), image: r.image ?? undefined as string | undefined, items: r.items.map((i) => rowToDTO(i.product)), badge: undefined as string | undefined }));
  }, PACKAGES.map((p) => ({
    ...p,
    image: undefined as string | undefined,
    items: p.items
      .map((s) => {
        const prod = ALL_PRODUCTS.find((x) => x.slug === s);
        if (!prod) return null;
        const gallery = productImages({ slug: prod.slug, image: PRODUCT_IMAGES[prod.slug] ?? prod.image, images: prod.images });
        return { ...prod, image: gallery[0] ?? prod.image, images: gallery.slice(1) };
      })
      .filter(Boolean) as CatalogProduct[],
  })));
}

export async function getPosts() {
  return dbSafe(async (tx) => {
    const rows = await tx.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, include: { category: true } });
    if (!rows.length) throw new Error("empty");
    return rows.map((r) => ({ slug: r.slug, title: r.title, excerpt: r.excerpt ?? "", category: r.category?.name ?? "Resources", author: r.author, date: r.createdAt.toISOString().slice(0, 10), readMins: 6, featured: r.featured, image: r.coverImage ?? POST_IMAGES[r.slug], faqs: (r.faqs as any) ?? [], body: [r.content] }));
  }, POSTS.map((p) => ({ ...p, image: POST_IMAGES[p.slug] })));
}

export async function getSettings() {
  return dbSafe(async (tx) => {
    const s = await tx.siteSettings.findUnique({ where: { id: 1 } });
    if (!s) throw new Error("missing");
    return { whatsapp: s.whatsapp, phone: s.phone, email: s.email, address: s.address, mpesaPaybill: s.mpesaPaybill };
  }, { whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254729396174", phone: "+254729396174", email: "info@safetypro.co.ke", address: "Nairobi, Kenya", mpesaPaybill: "400200" });
}

export { CATEGORIES, INDUSTRIES, PACKAGES, POSTS, PRODUCT_GALLERIES, productImages, getRelatedProducts };
export type { CatalogProduct };
export { db };
