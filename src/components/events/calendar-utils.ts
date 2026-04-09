import type { MSAEvent } from "@/data/events";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

export function formatDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function getTimeOnly(timeLabel: string): string {
  const pieces = timeLabel.split("·").map((p) => p.trim()).filter(Boolean);
  return pieces.length <= 1 ? timeLabel : pieces.slice(1).join(" · ");
}

export function parseStartMinutes(event: MSAEvent): number {
  const m = getTimeOnly(event.timeLabel).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2] ?? "0");
}

export function sortEvents(evs: MSAEvent[]): MSAEvent[] {
  return [...evs].sort((a, b) => {
    const td = parseStartMinutes(a) - parseStartMinutes(b);
    if (td !== 0) return td;
    return a.title.localeCompare(b.title);
  });
}
