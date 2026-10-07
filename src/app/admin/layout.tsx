import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

const STAFF = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY"];

const LINKS = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
  ["Quotations", "/admin/quotations"],
  ["Customers", "/admin/customers"],
  ["Blog", "/admin/blog"],
  ["Messages", "/admin/messages"],
  ["Settings", "/admin/settings"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!STAFF.includes(role)) redirect("/account");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">Staff portal</p>
          <h1 className="text-2xl font-extrabold text-navy-950">Admin dashboard</h1>
        </div>
        <p className="rounded-xl bg-navy-950 px-3.5 py-2 text-xs font-bold text-white">
          {session.user.name} • {String(role).replace(/_/g, " ")}
        </p>
      </div>
      <nav className="nice-scroll mt-5 flex gap-2 overflow-x-auto pb-1">
        {LINKS.map(([label, href]) => (
          <Link key={href} href={href}
            className={cn("whitespace-nowrap rounded-xl border px-4 py-2 text-[13px] font-bold transition",
              "border-slate-200 bg-white text-slate-600 hover:border-safety-600 hover:text-safety-600")}>
            {label}
          </Link>
        ))}
        <Link href="/" className="whitespace-nowrap rounded-xl bg-mist px-4 py-2 text-[13px] font-bold text-slate-500">← View store</Link>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
