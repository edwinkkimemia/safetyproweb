import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Heart, MapPin, Package, User } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { kes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const role = (session.user as any).role ?? "CUSTOMER";
  const isStaff = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY"].includes(role);

  let orders: any[] = [];
  let quotes: any[] = [];
  if (db) {
    try {
      const email = session.user.email!;
      const u = await db.user.findUnique({ where: { email } });
      if (u) {
        orders = await db.order.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 10 });
        quotes = await db.quotation.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 10 });
      }
    } catch { /* demo mode */ }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-navy-950"><User size={26} /> My account</h1>
      <p className="mt-1 text-sm text-slate-500">{session.user.name} • {session.user.email} • <span className="font-bold text-safety-600">{role.replace(/_/g, " ")}</span></p>

      {isStaff && (
        <Link href="/admin" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">
          Open admin dashboard →
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Orders", orders.length ? `${orders.length} placed` : "Browse & order PPE", "/shop", Package],
          ["Quotations", quotes.length ? `${quotes.length} requested` : "Request bulk pricing", "/bulk-ppe", FileText],
          ["Wishlist", "Saved products", "/wishlist", Heart],
          ["Addresses", "Delivery locations", "/account/addresses", MapPin],
        ].map(([t, d, h, Icon]: any) => (
          <Link key={t} href={h} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg">
            <Icon size={20} className="text-safety-600" />
            <h2 className="mt-2 font-extrabold text-navy-950">{t}</h2>
            <p className="text-[13px] text-slate-500">{d}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold text-navy-950">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No orders yet — your checkout orders appear here with live status.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5">
                  <span><strong className="font-mono text-navy-950">{o.orderNo}</strong> <span className="text-slate-400">• {new Date(o.createdAt).toLocaleDateString()}</span></span>
                  <span className="flex items-center gap-2"><span className="rounded-md bg-mist px-2 py-0.5 text-xs font-bold">{o.status}</span><strong>{kes(Number(o.total))}</strong></span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold text-navy-950">My quotations</h2>
          {quotes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No quotation requests yet. <Link href="/bulk-ppe" className="font-bold text-safety-600">Request one →</Link></p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {quotes.map((q: any) => (
                <li key={q.id} className="flex items-center justify-between py-2.5">
                  <span><strong className="font-mono text-navy-950">{q.quoteNo}</strong> <span className="text-slate-400">• {q.companyName}</span></span>
                  <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-bold">{q.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <form action="/api/auth/signout" method="post" className="mt-8">
        <SignOutButton />
      </form>
    </div>
  );
}

function SignOutButton() {
  return (
    <button formAction={async () => { "use server"; const { signOut } = await import("@/auth"); await signOut({ redirectTo: "/" }); }}
      className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-500 hover:border-red-300 hover:text-red-500">
      Sign out
    </button>
  );
}
