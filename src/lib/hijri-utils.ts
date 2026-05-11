import { toHijri } from "hijri-converter";

export type HijriCategory =
  | "ramadan"
  | "last10ramadan"
  | "eid"
  | "arafah"
  | "dhulhijjah"
  | "ashura"
  | null;

export function getHijriCategory(date: Date): HijriCategory {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  let h: { hy: number; hm: number; hd: number };
  try {
    h = toHijri(y, m, d);
  } catch {
    return null;
  }

  if (h.hm === 9) return h.hd >= 21 ? "last10ramadan" : "ramadan";
  if (h.hm === 10 && h.hd === 1) return "eid";
  if (h.hm === 12) {
    if (h.hd === 9) return "arafah";
    if (h.hd === 10) return "eid";
    if (h.hd <= 8) return "dhulhijjah";
  }
  if (h.hm === 1 && h.hd === 10) return "ashura";
  return null;
}

/** Hex color for each category — used for cell strip indicators */
export function getHijriColor(category: HijriCategory): string | null {
  switch (category) {
    case "last10ramadan": return "#148066";
    case "ramadan":       return "#1a9478";
    case "eid":           return "#F2AB23";
    case "arafah":        return "#E8960A";
    case "dhulhijjah":    return "#C9A84C";
    case "ashura":        return "#7C3AED";
    default:              return null;
  }
}

/** Human-readable tooltip label for a hijri category */
export function getHijriLabel(category: HijriCategory): string {
  switch (category) {
    case "last10ramadan": return "Last 10 Nights of Ramadan";
    case "ramadan":       return "Ramadan";
    case "eid":           return "Eid";
    case "arafah":        return "Day of Arafah";
    case "dhulhijjah":    return "First 10 Days of Dhul Hijjah";
    case "ashura":        return "Day of Ashura";
    default:              return "";
  }
}

/** Pairs of [category, label, color] for legend rendering — only unique categories */
export const HIJRI_LEGEND: { category: HijriCategory; label: string; color: string }[] = [
  { category: "last10ramadan", label: "Last 10 Ramadan",   color: "#148066" },
  { category: "ramadan",       label: "Ramadan",            color: "#1a9478" },
  { category: "eid",           label: "Eid",                color: "#F2AB23" },
  { category: "arafah",        label: "Arafah",             color: "#E8960A" },
  { category: "dhulhijjah",    label: "Dhul Hijjah (1–8)",  color: "#C9A84C" },
  { category: "ashura",        label: "Ashura",             color: "#7C3AED" },
];

