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

/** Hex color for each category — used for day panel label */
export function getHijriColor(category: HijriCategory): string | null {
  switch (category) {
    case "last10ramadan":
    case "ramadan":
    case "ashura":        return "#148066";
    case "eid":
    case "arafah":
    case "dhulhijjah":    return "#F2AB23";
    default:              return null;
  }
}

/** Subtle rgba background for calendar cells — two groups: green (Ramadan) and gold (Eid) */
export function getHijriBgColor(category: HijriCategory): string | null {
  switch (category) {
    case "ramadan":
    case "last10ramadan":
    case "ashura":        return "rgba(20, 128, 102, 0.065)";
    case "eid":
    case "arafah":
    case "dhulhijjah":   return "rgba(242, 171, 35, 0.07)";
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


