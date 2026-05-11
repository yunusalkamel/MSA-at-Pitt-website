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

export function getHijriCellClass(category: HijriCategory): string {
  switch (category) {
    case "last10ramadan": return "bg-jannah-mid/[0.13]";
    case "ramadan":       return "bg-jannah-mid/[0.06]";
    case "eid":           return "bg-primary/[0.10]";
    case "arafah":        return "bg-primary/[0.07]";
    case "dhulhijjah":    return "bg-primary/[0.05]";
    case "ashura":        return "bg-secondary/[0.07]";
    default:              return "";
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
