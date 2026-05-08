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
  const timeStr = getTimeOnly(event.timeLabel);
  // Split on range separator so we always use the START time ("1:00 – 2:00 PM" → "1:00")
  const parts = timeStr.split(/\s*[–\-]\s*/);
  const startPart = parts[0].trim();
  const endPart = parts.length > 1 ? parts[parts.length - 1].trim() : null;

  // Happy path: start part carries its own AM/PM
  const mFull = startPart.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (mFull) {
    let h = Number(mFull[1]) % 12;
    if (mFull[3].toUpperCase() === "PM") h += 12;
    return h * 60 + Number(mFull[2] ?? "0");
  }

  // Start part has no AM/PM — infer from end part (e.g. "1:00 – 2:00 PM")
  const mStart = startPart.match(/(\d{1,2})(?::(\d{2}))?/);
  if (mStart && endPart) {
    const mPeriod = endPart.match(/(AM|PM)/i);
    if (mPeriod) {
      let h = Number(mStart[1]) % 12;
      if (mPeriod[1].toUpperCase() === "PM") h += 12;
      return h * 60 + Number(mStart[2] ?? "0");
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

export function sortEvents(evs: MSAEvent[]): MSAEvent[] {
  return [...evs].sort((a, b) => {
    const td = parseStartMinutes(a) - parseStartMinutes(b);
    if (td !== 0) return td;
    return a.title.localeCompare(b.title);
  });
}
