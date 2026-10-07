# SAFETYPRO AFRICA — PPE E-commerce + B2B Procurement Platform

Next.js (App Router) + TypeScript + PostgreSQL + Prisma + Tailwind CSS + Auth.js.

## Quick start (demo — no database needed)

```bash
npm install
npm run dev        # http://localhost:3000
```

The storefront runs fully on the built-in catalog (`src/lib/catalog.ts`) until PostgreSQL is connected.

Demo logins: `admin@safetypro.co.ke / Admin@123` (staff), `customer@example.com / Customer@123`.

## Production (PostgreSQL)

```bash
# 1. Point .env at your database
DATABASE_URL="postgresql://user:password@host:5432/safetypro?schema=public"
AUTH_SECRET="<32+ random chars>"

# 2. Create tables + seed (24 products, 10 categories, 14 industries,
#    4 PPE kits, 8 guides, settings, admin user Admin@123)
npm run db:push
npm run db:seed

npm run build && npm start
```

All storefront reads (`src/lib/data.ts`) are DB-first with automatic fallback.

## What's included

- **Storefront**: home (13-section conversion flow), shop with sidebar filters + mobile drawer,
  10 category shops, 24 product pages (SEO + Product/Breadcrumb JSON-LD), search API
  (name/SKU/brand/certification/industry), cart, checkout (M-Pesa/Bank/COD/LPO), WhatsApp ordering + float
- **B2B**: bulk quotation form with Excel/CSV/PDF/Word upload validation, 14 industry playbooks,
  4 editable PPE kits, corporate accounts with LPO terms (admin-approved)
- **Content**: 8-guide resource centre with FAQ schema + related products, contact page with map
- **Admin** (`/admin`, staff roles): dashboard stats + low-stock alerts, product CRUD with
  specs/SEO, order + quotation status pipelines, customers/companies, blog CRUD, messages, settings
- **Security**: Auth.js credentials + bcrypt, Zod validation on every write, rate-limited
  order/quote APIs, role-based admin guard, Prisma-only DB access (no credentials in client)
