import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — PPE Quotes, Bulk Orders & Support Kenya",
  description:
    "Talk to Kenya's PPE experts: call or WhatsApp 0729 396 174 for quotes, sizing help, delivery tracking & corporate accounts. Mon–Sat 8am–6pm EAT, 1-business-day response.",
  keywords: [
    "contact PPE supplier Kenya", "PPE quotes Kenya", "safety equipment shop contact",
    "bulk PPE enquiries Kenya",
  ],
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
