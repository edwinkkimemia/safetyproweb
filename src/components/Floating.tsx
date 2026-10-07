"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./ui";

export function WhatsAppFloat() {
  return (
    <a href={waLink("Hello SAFETYPRO AFRICA, I need help choosing PPE for my team.")} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.7)] transition hover:scale-105 sm:bottom-6 sm:right-6">
      <WhatsAppIcon size={26} />
      <span className="absolute -left-1 -top-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#25D366]" />
      </span>
    </a>
  );
}

export function MobileBottomNav() {
  const { count } = useStore();
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/shop", label: "Shop", Icon: LayoutGrid },
    { href: "/shop?q=", label: "Search", Icon: Search },
    { href: "/cart", label: "Cart", Icon: ShoppingCart, badge: count },
    { href: "/account", label: "Account", Icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/97 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, Icon, badge }) => (
          <Link key={label} href={href}
            className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold",
              pathname === href ? "text-accent-600" : "text-slate-500")}>
            <Icon size={20} />
            {label}
            {!!badge && badge > 0 && (
              <span className="absolute right-1/2 top-0.5 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-navy-950">{badge}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
