import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-navy-950">Privacy Policy</h1>
      <p className="mt-1 text-sm text-slate-400">Last updated: September 2026</p>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-600">
        <p>SAFETYPRO AFRICA collects only the information needed to process orders and quotations: your name, contact details, delivery address and order history. Corporate customers may additionally share employee size schedules and procurement documents.</p>
        <p>We use this data to fulfil orders, prepare quotations, coordinate delivery and comply with Kenyan tax invoicing requirements. We never sell personal data. Access is limited to authorised staff under role-based permissions, and passwords are stored as irreversible hashes.</p>
        <p>You may request a copy, correction or deletion of your data at info@safetypro.co.ke. Transaction records required by the Kenya Revenue Authority are retained per statutory periods.</p>
        <p>Our site stores a local cart and wishlist in your browser; signing in syncs orders and quotations to your account.</p>
      </div>
    </div>
  );
}
