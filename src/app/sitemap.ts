import type { MetadataRoute } from "next";
import { getProducts, getCategories, getIndustries, getPackages, getPosts } from "@/lib/data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";

// Built from the live data layer (DB when reachable, static catalog
// otherwise) so /sitemap.xml always matches the shoppable catalog.
// Revalidate with the ISR cycle.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, categories, industries, packages, posts] = await Promise.all([
    getProducts({}),
    getCategories(),
    getIndustries(),
    getPackages(),
    getPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/bulk-ppe`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/training`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/industries`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/packages`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const prods: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.featured ? 0.9 : 0.7,
  }));

  const cats: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/shop/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const inds: MetadataRoute.Sitemap = industries.map((i) => ({
    url: `${SITE}/industries/${i.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const packs: MetadataRoute.Sitemap = packages.flatMap((p) => [
    { url: `${SITE}/packages/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
  ]);

  const arts: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/resources/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...prods, ...cats, ...inds, ...packs, ...arts];
}
