import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Demo fallback accounts when PostgreSQL is unreachable (dev/preview).
const DEMO_USERS = [
  { id: "demo-admin", name: "Site Admin", email: "admin@safetypro.co.ke", password: "Admin@123", role: "SUPER_ADMIN" },
  { id: "demo-customer", name: "Demo Customer", email: "customer@example.com", password: "Customer@123", role: "CUSTOMER" },
];

async function verifyUser(email: string, password: string) {
  if (db) {
    try {
      const u = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (u?.passwordHash && (await bcrypt.compare(password, u.passwordHash))) {
        return { id: u.id, name: u.name ?? u.email, email: u.email, role: u.role };
      }
    } catch {
      // fall through to demo users
    }
  }
  const d = DEMO_USERS.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (d && password === d.password) {
    return { id: d.id, name: d.name, email: d.email, role: d.role };
  }
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: db ? PrismaAdapter(db) : undefined,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email & password",
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const found = await verifyUser(parsed.data.email, parsed.data.password);
        if (!found) return null;
        return { id: found.id, name: found.name, email: found.email, role: found.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = (user as any).role ?? "CUSTOMER";
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = (token as any).role ?? "CUSTOMER";
      }
      return session;
    },
  },
});
