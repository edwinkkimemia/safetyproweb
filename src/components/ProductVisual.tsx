import Image from "next/image";
import { Anchor, Cone, Ear, Flame, Footprints, Glasses, Hand, HardHat, Shirt, Wind, ShieldCheck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
  "hard-hat": HardHat, footprints: Footprints, hand: Hand, glasses: Glasses,
  ear: Ear, wind: Wind, shirt: Shirt, anchor: Anchor, flame: Flame, cone: Cone,
  shield: ShieldCheck, package: Package,
};

const PALETTES: Record<string, string> = {
  "head-protection": "from-amber-400 via-accent-500 to-orange-700",
  "foot-protection": "from-slate-600 via-navy-800 to-navy-950",
  "hand-protection": "from-safety-500 via-safety-600 to-navy-800",
  "eye-face-protection": "from-cyan-500 via-safety-600 to-navy-900",
  "hearing-protection": "from-violet-500 via-indigo-600 to-navy-900",
  "respiratory-protection": "from-teal-500 via-emerald-600 to-navy-900",
  "protective-clothing": "from-accent-500 via-orange-600 to-red-700",
  "fall-protection": "from-rose-500 via-red-600 to-navy-950",
  "fire-emergency": "from-red-500 via-red-700 to-navy-950",
  "road-site-safety": "from-yellow-400 via-accent-500 to-navy-900",
};

const CAT_ICON: Record<string, string> = {
  "head-protection": "hard-hat", "foot-protection": "footprints", "hand-protection": "hand",
  "eye-face-protection": "glasses", "hearing-protection": "ear", "respiratory-protection": "wind",
  "protective-clothing": "shirt", "fall-protection": "anchor", "fire-emergency": "flame", "road-site-safety": "cone",
};

export function ProductVisual({
  category, name, sku, image, className, iconSize = 56, eager = false, fit = "cover",
}: { category: string; name: string; sku: string; image?: string; className?: string; iconSize?: number; eager?: boolean; fit?: "cover" | "contain" }) {
  const Icon = ICONS[CAT_ICON[category] ?? "shield"] ?? ShieldCheck;
  const contain = fit === "contain";
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", contain ? "bg-white" : cn("bg-gradient-to-br", PALETTES[category] ?? "from-safety-600 to-navy-950"), className)}>
      {image ? (
        <>
          <Image src={image} alt={name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={contain ? "object-contain" : "object-cover"} priority={eager} />
          {!contain && <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />}
          <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white backdrop-blur-sm">{sku}</span>
        </>
      ) : (
        <>
          <div className="hero-grid absolute inset-0" />
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/15" />
          <div className="relative flex flex-col items-center gap-2 p-4 text-center">
            <span className="flex items-center justify-center rounded-2xl bg-white/15 p-3 ring-1 ring-white/30 backdrop-blur-sm">
              <Icon size={iconSize} className="text-white" strokeWidth={1.6} />
            </span>
            <span className="rounded bg-black/30 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white/90">{sku}</span>
          </div>
        </>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? ShieldCheck;
  return <Icon className={className} size={26} strokeWidth={1.8} />;
}
