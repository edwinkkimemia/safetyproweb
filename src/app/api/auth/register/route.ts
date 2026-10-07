import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(20).optional().default(""),
  accountType: z.enum(["individual", "company"]).default("individual"),
  companyName: z.string().max(160).optional().default(""),
  industry: z.string().max(80).optional().default(""),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please check the form fields.", details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  if (!db) {
    // Demo mode: account creation acknowledged; sign in with demo accounts
    return Response.json({ ok: true, demo: true, message: "Database not connected — use customer@example.com / Customer@123 to explore." });
  }

  try {
    const existing = await db.user.findUnique({ where: { email: d.email.toLowerCase() } });
    if (existing) return Response.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });

    let companyId: string | null = null;
    if (d.accountType === "company" && d.companyName) {
      const company = await db.company.create({
        data: { name: d.companyName, contactPerson: d.name, email: d.email.toLowerCase(), phone: d.phone, industry: d.industry },
      });
      companyId = company.id;
    }

    const user = await db.user.create({
      data: {
        name: d.name, email: d.email.toLowerCase(),
        passwordHash: await bcrypt.hash(d.password, 10),
        phone: d.phone || null,
        role: d.accountType === "company" ? "COMPANY_CUSTOMER" : "CUSTOMER",
        companyId,
      },
    });
    return Response.json({ ok: true, id: user.id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not create account. Try again." }, { status: 500 });
  }
}
