import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  children, variant = "primary", size = "md", className, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "accent" | "outline" | "ghost" | "dark"; size?: "sm" | "md" | "lg" }) {
  const styles = {
    primary: "bg-safety-600 text-white hover:bg-safety-700 shadow-sm",
    accent: "bg-accent-500 text-navy-950 font-semibold hover:bg-accent-600 hover:text-white shadow-sm",
    outline: "border border-slate-300 bg-white text-ink hover:border-safety-600 hover:text-safety-600",
    ghost: "text-slate-600 hover:bg-slate-100",
    dark: "bg-navy-950 text-white hover:bg-navy-800",
  }[variant];
  const sizes = {
    sm: "h-9 px-3 text-[13px] rounded-md",
    md: "h-11 px-5 text-sm rounded-md",
    lg: "h-13 px-7 text-base rounded-md py-3.5",
  }[size];
  return (
    <button className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer", styles, sizes, className)} {...rest}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "navy", className }: { children: ReactNode; tone?: "navy" | "accent" | "green" | "red" | "grey" | "blue"; className?: string }) {
  const tones = {
    navy: "bg-navy-950 text-white",
    accent: "bg-accent-500 text-navy-950",
    green: "bg-emerald-600 text-white",
    red: "bg-red-600 text-white",
    grey: "bg-slate-100 text-slate-700",
    blue: "bg-safety-100 text-safety-700",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase", tones, className)}>{children}</span>;
}

export function SectionHead({ eyebrow, title, sub, align = "left", dark = false }: { eyebrow?: string; title: string; sub?: string; align?: "left" | "center"; dark?: boolean }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]", align === "center" && "justify-center", dark ? "text-accent-500" : "text-accent-600")}>
          <span className="inline-block h-[3px] w-8 rounded bg-accent-500" /> {eyebrow}
        </p>
      )}
      <h2 className={cn("mt-2 text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight text-balance", dark ? "text-white" : "text-navy-950")}>{title}</h2>
      {sub && <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>{sub}</p>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-navy-950">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 outline-none transition focus:border-safety-600 focus:ring-2 focus:ring-safety-100";

/** Full-width breadcrumb banner — light mist bg, spans edge to edge. Place outside max-w container. */
export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("w-full border-b border-slate-200 bg-mist", className)}>
      <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1.5 gap-y-1 px-4 py-3 text-[13px] font-semibold sm:px-6 lg:px-8">
        <li className="flex items-center">
          <Link href="/" className="flex items-center gap-1.5 rounded-md text-slate-500 transition hover:text-safety-600">
            <House size={14} className="shrink-0" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden="true" />
              {item.href && !last ? (
                <Link href={item.href} className="truncate rounded-md text-slate-500 transition hover:text-safety-600">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="max-w-[62vw] truncate font-bold text-navy-950 sm:max-w-[420px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Official WhatsApp brand glyph (lucide has no brand icons — MessageCircle is wrong). */
export function WhatsAppIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
