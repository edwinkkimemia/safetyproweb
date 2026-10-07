import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, ALL_PRODUCTS as PRODUCTS, INDUSTRIES, PACKAGES, POSTS, BRANDS_ALL as BRANDS, PRODUCT_IMAGES, CATEGORY_IMAGES, INDUSTRY_IMAGES, POST_IMAGES, productImages } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  // Settings singleton
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "SAFETYPRO AFRICA",
      tagline: "Protecting People. Powering Safer Workplaces.",
      phone: "+254722000000",
      whatsapp: "254722000000",
      email: "info@safetypro.co.ke",
      address: "Enterprise Road, Industrial Area, Nairobi, Kenya",
      facebook: "https://facebook.com/safetyproafrica",
      instagram: "https://instagram.com/safetyproafrica",
      linkedin: "https://linkedin.com/company/safetyproafrica",
      twitter: "https://x.com/safetyproafrica",
      vatRate: 16.0,
      mpesaPaybill: "400200",
      mpesaAccount: "SAFETYPRO",
      bankDetails: "SAFETYPRO AFRICA LTD\nKCB Industrial Area Branch\nA/C 1234567890",
      seoTitle: "SAFETYPRO AFRICA | PPE & Workplace Safety Equipment Kenya",
      seoDesc: "Kenya's professional PPE supplier: safety helmets, boots, gloves, respirators, coveralls, fire safety & bulk corporate procurement with Kenya-wide delivery.",
    },
  });

  // Brands
  for (const b of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: { name: b, slug: b.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
    });
  }

  // Categories
  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.blurb, icon: c.icon, sortOrder: i, featured: i < 8, image: CATEGORY_IMAGES[c.slug] ?? null },
      create: { name: c.name, slug: c.slug, description: c.blurb, icon: c.icon, sortOrder: i, featured: i < 8, image: CATEGORY_IMAGES[c.slug] ?? null },
    });
    catIds[c.slug] = row.id;
    for (const sub of c.subs) {
      const sslug = `${c.slug}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await prisma.category.upsert({
        where: { slug: sslug },
        update: {},
        create: { name: sub, slug: sslug, parentId: row.id },
      });
    }
  }

  // Certifications
  const certCodes = Array.from(new Set(PRODUCTS.flatMap((p) => p.certifications)));
  for (const code of certCodes) {
    await prisma.certification.upsert({
      where: { code },
      update: {},
      create: { code, name: code, description: `Declared standard ${code} as held in supplier documentation.` },
    });
  }

  // Industries
  const indIds: Record<string, string> = {};
  for (const [i, ind] of INDUSTRIES.entries()) {
    const row = await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: { name: ind.name, description: ind.blurb, hazards: ind.hazards, sortOrder: i, image: INDUSTRY_IMAGES[ind.slug] ?? null },
      create: { name: ind.name, slug: ind.slug, description: ind.blurb, hazards: ind.hazards, sortOrder: i, image: INDUSTRY_IMAGES[ind.slug] ?? null },
    });
    indIds[ind.slug] = row.id;
  }

  // Products
  for (const p of PRODUCTS) {
    const brand = await prisma.brand.findFirst({ where: { name: p.brand } });
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, sku: p.sku, shortDesc: p.short, description: p.description,
        price: p.price, compareAtPrice: p.compareAt ?? null, vatInclusive: p.vatInclusive,
        stock: p.stock, featured: !!p.featured, isNew: !!p.isNew, rating: p.rating,
        reviewCount: p.reviews, sizes: p.sizes, colours: p.colours, applications: p.applications,
        categoryId: catIds[p.category] ?? null, brandId: brand?.id ?? null,
        seoTitle: `${p.name} | SAFETYPRO AFRICA`,
        seoDesc: `${p.short} Buy online in Kenya with Kenya-wide delivery and corporate quotations.`,
      },
      create: {
        name: p.name, slug: p.slug, sku: p.sku, shortDesc: p.short, description: p.description,
        price: p.price, compareAtPrice: p.compareAt ?? null, vatInclusive: p.vatInclusive,
        stock: p.stock, featured: !!p.featured, isNew: !!p.isNew, rating: p.rating,
        reviewCount: p.reviews, sizes: p.sizes, colours: p.colours, applications: p.applications,
        categoryId: catIds[p.category] ?? null, brandId: brand?.id ?? null,
        seoTitle: `${p.name} | SAFETYPRO AFRICA`,
        seoDesc: `${p.short} Buy online in Kenya with Kenya-wide delivery and corporate quotations.`,
      },
    });
    await prisma.productSpecification.deleteMany({ where: { productId: prod.id } });
    for (const s of p.specs) {
      await prisma.productSpecification.create({ data: { productId: prod.id, key: s.key, value: s.value } });
    }
    await prisma.productCertification.deleteMany({ where: { productId: prod.id } });
    for (const code of p.certifications) {
      const cert = await prisma.certification.findUnique({ where: { code } });
      if (cert) await prisma.productCertification.create({ data: { productId: prod.id, certificationId: cert.id } });
    }
    await prisma.productIndustry.deleteMany({ where: { productId: prod.id } });
    for (const slug of p.industries) {
      if (indIds[slug]) await prisma.productIndustry.create({ data: { productId: prod.id, industryId: indIds[slug] } });
    }
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    const gallery = productImages({ slug: p.slug, image: PRODUCT_IMAGES[p.slug] ?? (p as any).image, images: (p as any).images });
    for (const [i, url] of gallery.entries()) {
      if (url) await prisma.productImage.create({ data: { productId: prod.id, url, alt: p.name, sortOrder: i } });
    }
  }

  // Packages
  for (const pack of PACKAGES) {
    const row = await prisma.productPackage.upsert({
      where: { slug: pack.slug },
      update: { name: pack.name, description: pack.blurb, price: pack.price },
      create: { name: pack.name, slug: pack.slug, description: pack.blurb, price: pack.price },
    });
    await prisma.packageItem.deleteMany({ where: { packageId: row.id } });
    for (const slug of pack.items) {
      const prod = await prisma.product.findUnique({ where: { slug } });
      if (prod) await prisma.packageItem.create({ data: { packageId: row.id, productId: prod.id, quantity: 1 } });
    }
  }

  // Blog
  await prisma.blogCategory.upsert({ where: { slug: "buying-guides" }, update: {}, create: { name: "Buying Guides", slug: "buying-guides" } });
  await prisma.blogCategory.upsert({ where: { slug: "compliance" }, update: {}, create: { name: "Compliance", slug: "compliance" } });
  await prisma.blogCategory.upsert({ where: { slug: "standards" }, update: {}, create: { name: "Standards", slug: "standards" } });
  await prisma.blogCategory.upsert({ where: { slug: "industries" }, update: {}, create: { name: "Industries", slug: "industries" } });
  for (const post of POSTS) {
    const cat = await prisma.blogCategory.findFirst({ where: { name: post.category } });
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title, slug: post.slug, excerpt: post.excerpt,
        content: post.body.join("\n\n"), author: post.author, published: true,
        featured: !!post.featured, categoryId: cat?.id ?? null,
        coverImage: POST_IMAGES[post.slug] ?? null,
        faqs: post.faqs as any, seoTitle: `${post.title} | SAFETYPRO AFRICA`, seoDesc: post.excerpt,
      },
    });
  }

  // Banners
  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: [
      { title: "Protect Your Team. Equip Your Workplace.", subtitle: "Professional PPE for construction, oil & gas, manufacturing, agriculture & logistics.", ctaText: "SHOP PPE", ctaUrl: "/shop", sortOrder: 0 },
      { title: "Bulk PPE & Corporate Procurement", subtitle: "One supplier for your entire workforce — send your PPE list for a structured quotation.", ctaText: "REQUEST A QUOTE", ctaUrl: "/bulk-ppe", sortOrder: 1 },
    ],
  });

  // Admin user
  const hash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@safetypro.co.ke" },
    update: { role: "SUPER_ADMIN" },
    create: { name: "Site Admin", email: "admin@safetypro.co.ke", passwordHash: hash, role: "SUPER_ADMIN" },
  });

  console.log("Seed complete: settings, brands, categories, certs, industries, products, packages, posts, banners, admin.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
