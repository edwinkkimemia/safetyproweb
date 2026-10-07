import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { kes } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ no?: string; total?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
      <h1 className="mt-4 text-3xl font-extrabold text-navy-950">Order received — thank you!</h1>
      <p className="mt-2 text-slate-600">
        Order <strong className="font-mono text-navy-950">{sp.no ?? "pending confirmation"}</strong>
        {sp.total && <> • Total <strong className="text-navy-950">{kes(Number(sp.total))}</strong></>}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
        Our sales team will call to confirm payment and delivery. For M-Pesa orders, keep your phone nearby — the prompt follows confirmation.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600">Continue shopping</Link>
        <a href={waLink(`Hello SAFETYPRO AFRICA, I just placed order ${sp.no ?? ""} and would like to confirm.`)} target="_blank" rel="noopener"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"><WhatsAppIcon size={16} /> Confirm on WhatsApp</a>
      </div>
    </div>
  );
}
