import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { getPosts, getProducts, getSettings } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { Badge, Breadcrumbs, WhatsAppIcon } from "@/components/ui";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) return { title: "Article not found" };
  return {
    title: `${post.title} — Kenya PPE Guide`,
    description: `${post.excerpt} Shop the exact certified products mentioned, with VAT invoices & Kenya-wide delivery.`,
    keywords: [post.title, post.category, "PPE guide Kenya", "safety standards Kenya", "buy PPE Kenya"],
    alternates: { canonical: `/resources/${slug}` },
    openGraph: {
      title: `${post.title} — Kenya PPE Guide`, description: post.excerpt, type: "article",
      ...((post as any).image ? { images: [{ url: (post as any).image, alt: post.title }] } : {}),
    },
    twitter: { card: "summary_large_image", title: `${post.title} — Kenya PPE Guide`, description: post.excerpt },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, products, settings] = await Promise.all([getPosts(), getProducts({}), getSettings()]);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const relatedPosts = posts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 2);
  const tokens = `${post.title} ${post.excerpt}`.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 4);
  const relatedProducts = products
    .map((p) => ({ p, score: tokens.filter((t) => `${p.name} ${p.short} ${p.category}`.toLowerCase().includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p);

  const faqJsonLd = post.faqs.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: post.category, href: `/resources?cat=${encodeURIComponent(post.category)}` }, { label: post.title }]} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <div className="relative mt-4 overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
        {(post as any).image && (
          <>
            <Image src={(post as any).image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/30" />
          </>
        )}
        <div className="relative">
        <Badge tone="accent">{post.category}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
        <p className="mt-2 text-slate-300">{post.excerpt}</p>
        <p className="mt-3 text-xs font-semibold text-slate-400">{post.author} • {post.date} • {post.readMins} min read</p>
        </div>
      </div>

      <article className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-[15.5px] leading-relaxed text-slate-700 sm:p-9">
        {post.body.map((para, i) => <p key={i}>{para}</p>)}
      </article>

      {post.faqs.length > 0 && (
        <section className="mt-8 rounded-3xl bg-mist p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy-950">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {post.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-bold text-navy-950">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-950">Products mentioned in this guide</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {relatedProducts.map((p) => <ProductCard key={p.slug} p={p} waNumber={settings.whatsapp} />)}
          </div>
        </section>
      )}

      <div className="mt-10 rounded-3xl bg-navy-950 p-8 text-center text-white">
        <h2 className="text-xl font-extrabold">Need this PPE for your site?</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-300">Send your headcount and delivery county — we return a structured quotation within one business day.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/bulk-ppe" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white"><FileText size={16} /> Request PPE quotation</Link>
          <a href={waLink(`Hello SAFETYPRO AFRICA, I read "${post.title}" and need PPE advice.`)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500"><WhatsAppIcon size={16} /> Ask on WhatsApp</a>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {relatedPosts.map((r) => (
            <Link key={r.slug} href={`/resources/${r.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg">
              <Badge tone="accent">{r.category}</Badge>
              <h3 className="mt-2 font-extrabold text-navy-950">{r.title}</h3>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-safety-600">Read next <ArrowRight size={14} /></p>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
