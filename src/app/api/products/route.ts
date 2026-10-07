import { getProducts } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const products = await getProducts({
    featured: searchParams.get("featured") === "true" ? true : undefined,
    category: searchParams.get("category") ?? undefined,
    limit: Number(searchParams.get("limit") ?? 50),
  });
  return Response.json({ count: products.length, products });
}
