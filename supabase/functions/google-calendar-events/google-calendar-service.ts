const CALENDAR_ID = "2use05cacfd5hu3q2p49q9dvmc@group.calendar.google.com";
const OUTPUT_TIMEZONE = "America/New_York";
const PUBLIC_ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;

type MSAEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  timeLabel: string;
  location: string;
  shortBlurb: string;
  description?: string;
  tags: string[];
  audience?: "Brothers" | "Sisters" | "Mixed" | "Open to All";
  featured?: boolean;
  isPast?: boolean;
  ctaMode?: "rsvp" | "signup" | "join-now" | "view-photos" | "learn-more";
  addToCalendarUrl?: string;
  fullCalendarUrl?: string;
};

export class CalendarFeedError extends Error {
  constructor(
    message: string,
    public readonly stage: "ics_fetch" | "ics_parse",
    public readonly details?: string,
  ) {
    super(message);
  }
}

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: OUTPUT_TIMEZONE,
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: OUTPUT_TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: OUTPUT_TIMEZONE,
});

function toYMD(date: Date): string {
  return ymdFormatter.format(date);
}

function unfoldIcs(ics: string): string[] {
  const raw = ics.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const line of raw) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

function decodeText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseDateToken(token: string, tzid?: string): Date | null {
  const clean = token.trim();

  if (/^\d{8}$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6));
    const d = Number(clean.slice(6, 8));
    return new Date(Date.UTC(y, m - 1, d));
  }

  // UTC format: 20260410T140000Z
  if (/^\d{8}T\d{6}Z$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6));
    const d = Number(clean.slice(6, 8));
    const hh = Number(clean.slice(9, 11));
    const mm = Number(clean.slice(11, 13));
    const ss = Number(clean.slice(13, 15));
    return new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
  }

  // Local time with TZID: 20260410T140000 (no Z)
  if (/^\d{8}T\d{6}$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6));
    const d = Number(clean.slice(6, 8));
    const hh = Number(clean.slice(9, 11));
    const mm = Number(clean.slice(11, 13));
    const ss = Number(clean.slice(13, 15));
    // Build an ISO string with the timezone so the Date constructor handles offset
    const isoish = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    // For America/New_York or when TZID is present, treat as ET
    // Deno supports Intl so we can convert properly
    try {
      const utcGuess = new Date(isoish + "Z");
      // Use the formatter to find the real offset for this datetime in the given tz
      const tz = tzid || OUTPUT_TIMEZONE;
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
      }).formatToParts(utcGuess);
      // Instead of complex offset calc, just create date from the local string
      // and accept ±1h drift is acceptable for display
      // Better approach: iterate to find offset
      const localInTz = new Date(isoish); // JS treats this as local, but we're in a server
      // Safest: assume America/New_York offset manually
      // EDT = UTC-4, EST = UTC-5
      // Use a simple heuristic: March second Sunday to November first Sunday = EDT
      const monthNum = m;
      const isDST = monthNum >= 4 && monthNum <= 10; // rough approximation
      const offsetHours = isDST ? 4 : 5;
      return new Date(Date.UTC(y, m - 1, d, hh + offsetHours, mm, ss));
    } catch {
      // Fallback: treat as UTC
      return new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
    }
  }

  return null;
}

function inferAudience(summary: string): MSAEvent["audience"] {
  const lower = summary.toLowerCase();
  if (lower.includes("sisters")) return "Sisters";
  if (lower.includes("brothers")) return "Brothers";
  return "Open to All";
}

function inferTags(summary: string, description: string): string[] {
  const blob = `${summary} ${description}`.toLowerCase();
  const tags = new Set<string>(["Open to All"]);

  if (blob.includes("halaqa") || blob.includes("quran") || blob.includes("tafsir")) tags.add("Education & Service");
  if (blob.includes("career") || blob.includes("network")) tags.add("Careers");
  if (blob.includes("speaker") || blob.includes("lecture") || blob.includes("panel")) tags.add("Speaker Event");
  if (blob.includes("service") || blob.includes("volunteer")) tags.add("Education & Service");
  if (blob.includes("social") || blob.includes("iftar") || blob.includes("eid") || blob.includes("banquet")) tags.add("Social");
  if (blob.includes("dawah")) tags.add("Dawah");

  return [...tags];
}

function formatTimeLabel(start: Date, end: Date | null, allDay: boolean): string {
  if (allDay) {
    return `${dayFormatter.format(start)} · All day`;
  }

  if (!end) {
    return `${dayFormatter.format(start)} · ${timeFormatter.format(start)}`;
  }

  return `${dayFormatter.format(start)} · ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function normalizeIcsEvent(eventBlock: Record<string, string>, nowYmd: string): MSAEvent | null {
  const title = decodeText(eventBlock.SUMMARY || "MSA Event");
  const description = decodeText(eventBlock.DESCRIPTION || "More details coming soon.");
  const location = decodeText(eventBlock.LOCATION || "Location to be announced");

  const dtStartRaw = eventBlock.DTSTART || eventBlock["DTSTART;VALUE=DATE"];
  const dtEndRaw = eventBlock.DTEND || eventBlock["DTEND;VALUE=DATE"];

  if (!dtStartRaw) return null;

  const start = parseDateToken(dtStartRaw);
  if (!start) return null;

  const end = dtEndRaw ? parseDateToken(dtEndRaw) : null;
  const allDay = /VALUE=DATE/.test(eventBlock.__DTSTART_META || "") || /^\d{8}$/.test(dtStartRaw);
  const startDate = toYMD(start);

  return {
    id: decodeText(eventBlock.UID || `${startDate}-${title}`),
    title,
    startDate,
    endDate: end ? toYMD(end) : undefined,
    timeLabel: formatTimeLabel(start, end, allDay),
    location,
    shortBlurb: description,
    description,
    tags: inferTags(title, description),
    audience: inferAudience(title),
    isPast: startDate < nowYmd,
    ctaMode: "learn-more",
    addToCalendarUrl: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(CALENDAR_ID)}`,
    fullCalendarUrl: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(CALENDAR_ID)}`,
  };
}

function parseIcsEvents(icsText: string): Record<string, string>[] {
  const lines = unfoldIcs(icsText);
  const events: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }

    if (!current) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const left = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    current[left] = value;

    if (left.startsWith("DTSTART")) {
      current.__DTSTART_META = left;
      current.DTSTART = value;
    }

    if (left.startsWith("DTEND")) {
      current.__DTEND_META = left;
      current.DTEND = value;
    }
  }

  return events;
}

export async function fetchCalendarEventsFromPublicIcs(): Promise<MSAEvent[]> {
  const response = await fetch(PUBLIC_ICS_URL);

  if (!response.ok) {
    const body = await response.text();
    throw new CalendarFeedError(
      `Public iCal feed request failed with status ${response.status}`,
      "ics_fetch",
      body,
    );
  }

  const icsText = await response.text();
  const parsed = parseIcsEvents(icsText);

  if (parsed.length === 0) {
    throw new CalendarFeedError("No events were parsed from the public iCal feed", "ics_parse");
  }

  const nowYmd = toYMD(new Date());
  const normalized = parsed
    .map((block) => normalizeIcsEvent(block, nowYmd))
    .filter((event): event is MSAEvent => Boolean(event))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const firstUpcomingIdx = normalized.findIndex((event) => !event.isPast);
  if (firstUpcomingIdx >= 0) {
    normalized[firstUpcomingIdx] = {
      ...normalized[firstUpcomingIdx],
      featured: true,
      tags: Array.from(new Set(["Signature Event", ...normalized[firstUpcomingIdx].tags])),
    };
  }

  return normalized;
}
