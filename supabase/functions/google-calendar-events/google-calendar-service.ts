const CALENDAR_ID = "2use05cacfd5hu3q2p49q9dvmc@group.calendar.google.com";
const GOOGLE_API_BASE = "https://www.googleapis.com/calendar/v3";
const OUTPUT_TIMEZONE = "America/New_York";

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

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
  galleryUrl?: string;
  addToCalendarUrl?: string;
  fullCalendarUrl?: string;
};

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: OUTPUT_TIMEZONE,
});

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: OUTPUT_TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: OUTPUT_TIMEZONE,
});

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: OUTPUT_TIMEZONE,
});

function toYMD(date: Date): string {
  return ymdFormatter.format(date);
}

function safeDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildTimeLabel(start: GoogleCalendarEvent["start"], end: GoogleCalendarEvent["end"]): string {
  const allDayStart = start?.date;
  const allDayEnd = end?.date;

  if (allDayStart && allDayEnd) {
    const startDate = safeDate(`${allDayStart}T00:00:00Z`);
    const endDate = safeDate(`${allDayEnd}T00:00:00Z`);
    if (!startDate || !endDate) return "All day";

    const inclusiveEnd = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    const sameDay = toYMD(startDate) === toYMD(inclusiveEnd);

    if (sameDay) return `${dayFormatter.format(startDate)} · All day`;

    return `${monthDayFormatter.format(startDate)} - ${monthDayFormatter.format(inclusiveEnd)} · All day`;
  }

  const startDateTime = safeDate(start?.dateTime);
  const endDateTime = safeDate(end?.dateTime);

  if (!startDateTime) return "Time TBA";
  if (!endDateTime) return `${dayFormatter.format(startDateTime)} · ${timeFormatter.format(startDateTime)}`;

  return `${dayFormatter.format(startDateTime)} · ${timeFormatter.format(startDateTime)} - ${timeFormatter.format(endDateTime)}`;
}

function deriveStartDate(start: GoogleCalendarEvent["start"]): string {
  if (start?.date) return start.date;
  const dt = safeDate(start?.dateTime);
  return dt ? toYMD(dt) : toYMD(new Date());
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

function applyFutureMetadataEnrichment(event: MSAEvent): MSAEvent {
  // Future enrichment hook for tags, signup links, gallery links,
  // and featured/signature event metadata.
  return event;
}

function normalizeGoogleEvent(event: GoogleCalendarEvent, nowDate: string): MSAEvent {
  const title = event.summary?.trim() || "MSA Event";
  const description = event.description?.trim() || "More details coming soon.";
  const startDate = deriveStartDate(event.start);

  const normalized: MSAEvent = {
    id: event.id || `${startDate}-${title}`,
    title,
    startDate,
    endDate: event.end?.date,
    timeLabel: buildTimeLabel(event.start, event.end),
    location: event.location?.trim() || "Location to be announced",
    shortBlurb: description,
    description,
    tags: inferTags(title, description),
    audience: inferAudience(title),
    isPast: startDate < nowDate,
    ctaMode: "learn-more",
    addToCalendarUrl: event.htmlLink,
    fullCalendarUrl: event.htmlLink,
  };

  return applyFutureMetadataEnrichment(normalized);
}

export async function fetchGoogleCalendarEvents(apiKey: string): Promise<MSAEvent[]> {
  const now = new Date();
  const timeMin = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
    maxResults: "250",
    timeZone: OUTPUT_TIMEZONE,
  });

  const url = `${GOOGLE_API_BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const items: GoogleCalendarEvent[] = Array.isArray(payload.items) ? payload.items : [];
  const today = toYMD(new Date());

  const normalized = items.map((item) => normalizeGoogleEvent(item, today));

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
