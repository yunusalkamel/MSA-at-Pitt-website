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
  signupUrl?: string;
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
    // Strip HTML tags (Google Calendar ICS sometimes includes <a>, <br>, etc.)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function getOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || "0");
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - date.getTime();
}

function zonedLocalToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let utcMs = localAsUtc;

  for (let i = 0; i < 4; i++) {
    const offset = getOffsetMs(new Date(utcMs), timeZone);
    const next = localAsUtc - offset;
    if (next === utcMs) break;
    utcMs = next;
  }

  return new Date(utcMs);
}

function parseDateToken(token: string, tzid?: string): Date | null {
  const clean = token.trim();

  if (/^\d{8}$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6));
    const d = Number(clean.slice(6, 8));
    // Use noon UTC so timezone formatting does not shift this all-day date to the prior day.
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
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
    try {
      return zonedLocalToUtcDate(y, m, d, hh, mm, ss, tzid || OUTPUT_TIMEZONE);
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

function extractExternalUrl(text: string): string | undefined {
  const hrefMatch = text.match(/href\s*=\s*["']([^"']+)["']/i);
  if (hrefMatch?.[1]) return hrefMatch[1];
  const urlMatch = text.match(/https?:\/\/[^\s<>"]+/i);
  if (urlMatch?.[0]) return urlMatch[0];
  return undefined;
}

function parseWallClockParts(token: string): { year: number; month: number; day: number; hour: number; minute: number; second: number } | null {
  const clean = token.trim();
  if (!/^\d{8}T\d{6}Z?$/.test(clean)) return null;

  return {
    year: Number(clean.slice(0, 4)),
    month: Number(clean.slice(4, 6)),
    day: Number(clean.slice(6, 8)),
    hour: Number(clean.slice(9, 11)),
    minute: Number(clean.slice(11, 13)),
    second: Number(clean.slice(13, 15)),
  };
}

function normalizeIcsEvent(eventBlock: Record<string, string>, nowYmd: string): MSAEvent | null {
  const title = decodeText(eventBlock.SUMMARY || "MSA Event");
  const description = decodeText(eventBlock.DESCRIPTION || "More details coming soon.");
  const location = decodeText(eventBlock.LOCATION || "Location to be announced");

  const dtStartRaw = eventBlock.DTSTART || eventBlock["DTSTART;VALUE=DATE"];
  const dtEndRaw = eventBlock.DTEND || eventBlock["DTEND;VALUE=DATE"];

  if (!dtStartRaw) return null;

  // Extract TZID if present
  const tzidMatch = (eventBlock.__DTSTART_META || "").match(/TZID=([^:;]+)/);
  const tzid = tzidMatch ? tzidMatch[1] : undefined;

  const start = parseDateToken(dtStartRaw, tzid);
  if (!start) return null;

  const endTzidMatch = (eventBlock.__DTEND_META || "").match(/TZID=([^:;]+)/);
  const endTzid = endTzidMatch ? endTzidMatch[1] : undefined;
  const end = dtEndRaw ? parseDateToken(dtEndRaw, endTzid) : null;
  const allDay = /VALUE=DATE/.test(eventBlock.__DTSTART_META || "") || /^\d{8}$/.test(dtStartRaw);
  const startDate = toYMD(start);

  const directUrl = decodeText(eventBlock.URL || "");
  const signupUrl =
    extractExternalUrl(directUrl) ||
    extractExternalUrl(eventBlock.DESCRIPTION || "") ||
    extractExternalUrl(description) ||
    extractExternalUrl(location);

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
    ctaMode: signupUrl ? "signup" : "learn-more",
    signupUrl,
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
    if (left in current) {
      current[left] = `${current[left]},${value}`;
    } else {
      current[left] = value;
    }

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

const DAY_TO_UTC_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function utcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function localWeekday(date: Date, timeZone: string): number {
  const token = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }).format(date).slice(0, 2).toUpperCase();
  return DAY_TO_UTC_INDEX[token] ?? date.getUTCDay();
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth() + months,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ));
}

function formatUtcToken(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

// ── RRULE expansion ──────────────────────────────────────────
function expandRecurringEvents(events: Record<string, string>[]): Record<string, string>[] {
  const expanded: Record<string, string>[] = [];
  const MAX_HORIZON_MS = 365 * 24 * 60 * 60 * 1000; // 1 year ahead
  const horizonDate = new Date(Date.now() + MAX_HORIZON_MS);

  // ── Collect RECURRENCE-ID overrides ────────────────────────
  // When a single instance of a recurring event is edited in Google Calendar,
  // a new VEVENT is created with the same UID and a RECURRENCE-ID pointing to
  // the original date. We must skip that date during RRULE expansion so the
  // override instance is the only one that survives.
  const overrideDatesByUid = new Map<string, Set<string>>();
  for (const ev of events) {
    const recIdEntry = Object.entries(ev).find(([k]) => k.startsWith("RECURRENCE-ID"));
    if (!recIdEntry) continue;

    const [recIdKey, recIdValue] = recIdEntry;
    const baseUid = ev.UID;
    if (!baseUid) continue;

    const tzMatch = recIdKey.match(/TZID=([^:;]+)/);
    const tz = tzMatch ? tzMatch[1] : undefined;
    const parsed = parseDateToken(recIdValue, tz);
    if (parsed) {
      if (!overrideDatesByUid.has(baseUid)) overrideDatesByUid.set(baseUid, new Set());
      overrideDatesByUid.get(baseUid)!.add(toYMD(parsed));
    }
  }

  for (const ev of events) {
    // Override instances (RECURRENCE-ID present) are standalone — push as-is
    const hasRecurrenceId = Object.keys(ev).some((k) => k.startsWith("RECURRENCE-ID"));
    if (hasRecurrenceId) {
      expanded.push(ev);
      continue;
    }

    const rrule = ev.RRULE;
    if (!rrule) {
      expanded.push(ev);
      continue;
    }

    // Parse RRULE components
    const parts: Record<string, string> = {};
    rrule.split(";").forEach((p) => {
      const [k, v] = p.split("=");
      if (k && v) parts[k] = v;
    });

    const freq = parts.FREQ;
    if (!freq || !["DAILY", "WEEKLY", "MONTHLY"].includes(freq)) {
      expanded.push(ev);
      continue;
    }

    const dtStartRaw = ev.DTSTART;
    const dtEndRaw = ev.DTEND;
    if (!dtStartRaw) { expanded.push(ev); continue; }

    const tzidMatch = (ev.__DTSTART_META || "").match(/TZID=([^:;]+)/);
    const tzid = tzidMatch ? tzidMatch[1] : undefined;
    const startDate = parseDateToken(dtStartRaw, tzid);
    if (!startDate) { expanded.push(ev); continue; }

    const endTzidMatch = (ev.__DTEND_META || "").match(/TZID=([^:;]+)/);
    const endTzid = endTzidMatch ? endTzidMatch[1] : undefined;
    const endDate = dtEndRaw ? parseDateToken(dtEndRaw, endTzid) : null;
    const durationMs = endDate ? endDate.getTime() - startDate.getTime() : 0;
    const startWallClock = parseWallClockParts(dtStartRaw);

    const count = parts.COUNT ? Number(parts.COUNT) : 200;
    const until = parts.UNTIL ? parseDateToken(parts.UNTIL) : horizonDate;
    const interval = parts.INTERVAL ? Number(parts.INTERVAL) : 1;

    let current = new Date(startDate.getTime());
    let occurrences = 0;

    // Collect EXDATE values to skip
    const exdates = new Set<string>();
    const exdateRaw = Object.entries(ev)
      .filter(([k]) => k.startsWith("EXDATE"))
      .map(([, v]) => v)
      .join(",");
    if (exdateRaw) {
      exdateRaw.split(",").forEach((d) => {
        const parsed = parseDateToken(d.trim(), tzid);
        if (parsed) exdates.add(toYMD(parsed));
      });
    }

    // Also skip dates that have RECURRENCE-ID overrides (edited single instances)
    const overrides = ev.UID ? overrideDatesByUid.get(ev.UID) : undefined;
    if (overrides) {
      for (const ymd of overrides) exdates.add(ymd);
    }

    const limit = until && until < horizonDate ? until : horizonDate;
    const byDay = (parts.BYDAY || "")
      .split(",")
      .map((token) => token.trim().slice(-2).toUpperCase())
      .map((token) => DAY_TO_UTC_INDEX[token])
      .filter((value): value is number => typeof value === "number");

    // Parse BYDAY with ordinal prefixes for MONTHLY (e.g. "3FR" → { ordinal: 3, weekday: 5 })
    const byDayWithOrdinal = (parts.BYDAY || "")
      .split(",")
      .map((token) => {
        const t = token.trim();
        const match = t.match(/^(-?\d+)([A-Z]{2})$/);
        if (!match) return null;
        const dayCode = match[2].toUpperCase();
        const wd = DAY_TO_UTC_INDEX[dayCode];
        if (wd === undefined) return null;
        return { ordinal: Number(match[1]), weekday: wd };
      })
      .filter((v): v is { ordinal: number; weekday: number } => v !== null);

    const pushInstance = (occurrenceStart: Date) => {
      const currentYmd = toYMD(occurrenceStart);
      if (exdates.has(currentYmd)) return;

      const instanceEnd = endDate ? new Date(occurrenceStart.getTime() + durationMs) : null;
      const instance = { ...ev };
      instance.DTSTART = formatUtcToken(occurrenceStart);
      instance.__DTSTART_META = "DTSTART";
      if (instanceEnd) {
        instance.DTEND = formatUtcToken(instanceEnd);
        instance.__DTEND_META = "DTEND";
      }
      instance.UID = `${ev.UID || "recurring"}-${currentYmd}`;
      delete instance.RRULE;
      expanded.push(instance);
      occurrences += 1;
    };

    if (freq === "WEEKLY" && byDay.length > 0) {
      // Use the Eastern Time date (not UTC) so late-evening events don't shift to the next day
      const startYmd = toYMD(startDate);
      const [sY, sM, sD] = startYmd.split('-').map(Number);
      const startDay = new Date(Date.UTC(sY, sM - 1, sD, 12, 0, 0));
      for (let day = startDay; day <= limit && day <= horizonDate && occurrences < count; day = addUtcDays(day, 1)) {
        const dayDiff = Math.floor((day.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000));
        if (dayDiff < 0) continue;
        const weekIndex = Math.floor(dayDiff / 7);
        if (weekIndex % interval !== 0) continue;
        if (!byDay.includes(localWeekday(day, tzid || OUTPUT_TIMEZONE))) continue;

        const occurrence = startWallClock
          ? zonedLocalToUtcDate(
              day.getUTCFullYear(),
              day.getUTCMonth() + 1,
              day.getUTCDate(),
              startWallClock.hour,
              startWallClock.minute,
              startWallClock.second,
              tzid || OUTPUT_TIMEZONE,
            )
          : new Date(Date.UTC(
              day.getUTCFullYear(),
              day.getUTCMonth(),
              day.getUTCDate(),
              startDate.getUTCHours(),
              startDate.getUTCMinutes(),
              startDate.getUTCSeconds(),
            ));
        if (occurrence < startDate) continue;
        pushInstance(occurrence);
      }
      continue;
    }

    // ── MONTHLY with BYDAY ordinal (e.g. BYDAY=3FR → 3rd Friday of each month) ──
    if (freq === "MONTHLY" && byDayWithOrdinal.length > 0) {
      // Iterate month by month from the start date
      const startYmd = toYMD(startDate);
      const [startY, startM] = startYmd.split('-').map(Number);
      let curY = startY;
      let curM = startM; // 1-indexed

      while (occurrences < count) {
        for (const { ordinal, weekday } of byDayWithOrdinal) {
          // Find the Nth weekday (or -Nth from end) in curY/curM
          const daysInMonth = new Date(Date.UTC(curY, curM, 0)).getUTCDate(); // curM is 1-indexed, so (curY, curM, 0) = last day of curM
          let targetDay: number | null = null;

          if (ordinal > 0) {
            // Positive ordinal: 1st, 2nd, 3rd... weekday from start of month
            let matchCount = 0;
            for (let d = 1; d <= daysInMonth; d++) {
              const probe = new Date(Date.UTC(curY, curM - 1, d, 12, 0, 0));
              if (localWeekday(probe, tzid || OUTPUT_TIMEZONE) === weekday) {
                matchCount++;
                if (matchCount === ordinal) { targetDay = d; break; }
              }
            }
          } else {
            // Negative ordinal: -1 = last weekday, -2 = second to last, etc.
            const absOrd = Math.abs(ordinal);
            let matchCount = 0;
            for (let d = daysInMonth; d >= 1; d--) {
              const probe = new Date(Date.UTC(curY, curM - 1, d, 12, 0, 0));
              if (localWeekday(probe, tzid || OUTPUT_TIMEZONE) === weekday) {
                matchCount++;
                if (matchCount === absOrd) { targetDay = d; break; }
              }
            }
          }

          if (targetDay !== null) {
            const occurrence = startWallClock
              ? zonedLocalToUtcDate(
                  curY, curM, targetDay,
                  startWallClock.hour, startWallClock.minute, startWallClock.second,
                  tzid || OUTPUT_TIMEZONE,
                )
              : new Date(Date.UTC(
                  curY, curM - 1, targetDay,
                  startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds(),
                ));

            if (occurrence >= startDate && occurrence <= limit && occurrence <= horizonDate) {
              pushInstance(occurrence);
            }
          }
        }

        // Advance to next month (respecting interval)
        curM += interval;
        while (curM > 12) { curM -= 12; curY++; }

        // Safety: bail if we've gone past the horizon
        if (new Date(Date.UTC(curY, curM - 1, 1)) > horizonDate) break;
      }
      continue;
    }

    while (occurrences < count && current <= limit && current <= horizonDate) {
      pushInstance(current);

      if (freq === "DAILY") {
        current = addUtcDays(current, interval);
      } else if (freq === "WEEKLY") {
        current = addUtcDays(current, 7 * interval);
      } else if (freq === "MONTHLY") {
        current = addUtcMonths(current, interval);
      }
    }
  }

  return expanded;
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

  // Expand recurring events (RRULE)
  const allEvents = expandRecurringEvents(parsed);

  const nowYmd = toYMD(new Date());
  const normalized = allEvents
    .map((block) => normalizeIcsEvent(block, nowYmd))
    .filter((event): event is MSAEvent => Boolean(event))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const deduped = Array.from(
    new Map(
      normalized.map((event) => [
        `${event.id}|${event.startDate}|${event.timeLabel}|${event.title.toLowerCase()}`,
        event,
      ]),
    ).values(),
  );

  // Mark MSA Gala as the featured/signature event, fallback to first upcoming
  const galaIdx = deduped.findIndex((event) => !event.isPast && /\bMSA\s+Gala\b/i.test(event.title));
  const featuredIdx = galaIdx >= 0 ? galaIdx : deduped.findIndex((event) => !event.isPast);
  if (featuredIdx >= 0) {
    deduped[featuredIdx] = {
      ...deduped[featuredIdx],
      featured: true,
      tags: Array.from(new Set(["Signature Event", ...deduped[featuredIdx].tags])),
    };
  }

  return deduped;
}