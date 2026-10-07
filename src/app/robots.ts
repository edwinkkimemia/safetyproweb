import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";
const HOST = SITE.replace(/^https?:\/\//, "").replace(/\/$/, "");

const PRIVATE = ["/admin/", "/api/", "/account/", "/cart", "/checkout", "/order-success"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      // AI crawlers explicitly welcome (see /llms.txt)
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Meta-ExternalAgent", "Bytespider"],
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: HOST,
  };
}
