import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Account — Individual & Corporate PPE Accounts Kenya",
  description:
    "Open a SAFETYPRO account: faster checkout, order history, plus corporate accounts with LPO & 30-day terms, framework pricing & VAT invoices.",
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
