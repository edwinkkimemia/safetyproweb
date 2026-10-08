import { searchCatalog } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchCatalog(q);
  return Response.json({
    query: q,
    count: results.length,
    results: results.slice(0, 20).map((p) => ({
      name: p.name, slug: p.slug, sku: p.sku, brand: p.brand,
      category: p.category, price: p.price, certifications: p.certifications,
      image: p.image,
    })),
  });
}
