import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-navy-950">Terms of Service</h1>
      <p className="mt-1 text-sm text-slate-400">Last updated: September 2026</p>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-600">
        <p>Prices are in Kenya Shillings. Where marked VAT-inclusive, the 16% VAT component is stated at checkout and on invoices. Delivery fees are confirmed before dispatch; Nairobi pickup is free.</p>
        <p>Payment is accepted via M-Pesa, bank transfer and cash on delivery (Nairobi, capped). LPO and corporate credit terms apply only after written approval — submitting an LPO order does not guarantee credit.</p>
        <p>Certification marks shown on product pages reflect documentation held in our database. Always verify suitability for your risk assessment; our team provides specification guidance but the employer retains duty-of-care under the Occupational Safety and Health Act.</p>
        <p>Goods may be returned within 7 days unused and in original packaging, except disposable hygiene items. Warranty follows the manufacturer&apos;s terms.</p>
      </div>
    </div>
  );
}
