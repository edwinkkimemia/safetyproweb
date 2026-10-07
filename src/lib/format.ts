export function kes(n: number | string): string {
  const v = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(v)) return "KES —";
  return `KES ${Math.round(v).toLocaleString("en-KE")}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const VAT_RATE = 0.16;

export function exVat(incVat: number, rate = VAT_RATE): number {
  return incVat / (1 + rate);
}

export function vatAmount(incVat: number, rate = VAT_RATE): number {
  return incVat - exVat(incVat, rate);
}
