"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { WhatsAppIcon } from "./ui";

// Brand icons were removed from lucide-react — inline SVGs instead.
const BRANDS: Record<string, string> = {
  x: "M17.8 4h2.7l-6 6.8L21.5 20h-5.6l-4.3-5.6L6.6 20H3.9l6.4-7.3L3.6 4H9.3l3.9 5.1L17.8 4Zm-1 14.3h1.5L8.1 5.6H6.5l10.3 12.7Z",
  facebook:
    "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3Z",
};

function BrandIcon({ d, size = 17 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function ShareButtons({ title, excerpt, path }: { title: string; excerpt: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";
  const url = `${site}${path}`;
  const text = `${title} — ${excerpt}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const base =
    "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white transition hover:opacity-85 active:scale-95";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer noopener" aria-label="Share on X" title="Share on X" className={`${base} bg-black`}>
        <BrandIcon d={BRANDS.x} /> X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer noopener" aria-label="Share on Facebook" title="Share on Facebook" className={`${base} bg-[#1877F2]`}>
        <BrandIcon d={BRANDS.facebook} /> Facebook
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank" rel="noreferrer noopener" aria-label="Share on WhatsApp" title="Share on WhatsApp" className={`${base} bg-[#25D366]`}>
        <WhatsAppIcon size={17} /> WhatsApp
      </a>
      <button onClick={copy} aria-label="Copy article link" title="Copy article link"
        className={`${base} ${copied ? "bg-emerald-600" : "bg-navy-950"}`}>
        {copied ? <Check size={17} /> : <Link2 size={17} />} {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
