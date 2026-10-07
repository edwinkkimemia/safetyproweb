import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-navy-950">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-navy-950">Page not found</h1>
      <p className="mt-2 text-slate-500">The page moved or never existed — but our PPE range is easy to find.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white">Back home</Link>
        <Link href="/shop" className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold text-navy-950">Shop PPE</Link>
      </div>
    </div>
  );
}
