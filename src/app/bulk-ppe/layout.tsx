import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk PPE & Corporate Procurement Kenya — LPO, Volume Discounts",
  description:
    "Get bulk PPE quotations in 24hrs: upload your BOQ for volume pricing on 10–10,000 units. LPO & 30-day terms, size schedules, VAT invoices & 47-county delivery.",
  keywords: [
    "bulk PPE Kenya", "corporate PPE procurement Kenya", "LPO PPE suppliers Kenya",
    "volume PPE discounts Kenya", "BOQ quotation PPE", "framework PPE pricing Kenya",
  ],
  alternates: { canonical: "/bulk-ppe" },
};

export default function BulkPpeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
