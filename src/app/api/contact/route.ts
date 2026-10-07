import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(5).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please check the form fields." }, { status: 400 });
  if (db) {
    try {
      await db.contactMessage.create({ data: parsed.data });
      return Response.json({ ok: true, persisted: true });
    } catch (e) { console.error(e); }
  }
  return Response.json({ ok: true, persisted: false });
}
