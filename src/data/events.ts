export interface MSAEvent {
  id: string;
  title: string;
  startDate: string; // ISO date
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
  coverImage?: string;
}

export const EVENT_TAGS = [
  "All",
  "Social",
  "Dawah",
  "Brothers",
  "Sisters",
  "Jumu'ah",
  "Careers",
  "Speaker Event",
  "Education",
  "Service",
  "Signature Event",
  "Ramadan",
  "Past Events",
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

export const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York";
export const APPLE_CALENDAR_URL =
  "https://experience.pitt.edu/msa/apple-calendar/";
export const EVENT_SIGNUP_HUB_URL = "https://forms.gle/hnUHffFFsyysX7vY6";

// ── Mock Data ──────────────────────────────────────────────
export const mockEvents: MSAEvent[] = [
  {
    id: "1",
    title: "MSA Annual Banquet 2026",
    startDate: "2026-04-19",
    timeLabel: "Saturday · 6:00 – 10:00 PM",
    location: "University Club, University of Pittsburgh",
    shortBlurb:
      "Our flagship gala celebrating a year of growth, community, and faith. Keynote speaker, dinner, awards, and a night to remember.",
    tags: ["Signature Event", "Social", "Speaker Event", "Open to All"],
    audience: "Open to All",
    featured: true,
    ctaMode: "rsvp",
    signupUrl: "https://forms.gle/hnUHffFFsyysX7vY6",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "2",
    title: "MSA TopGolf 2026",
    startDate: "2026-04-05",
    timeLabel: "Sunday · 4:00 – 6:00 PM",
    location: "TopGolf Pittsburgh, 400 Presto-Sygan Rd, Bridgeville, PA",
    shortBlurb:
      "Hit the links with the community! $16.67 for 2 hours (first-timers $22.67 incl. membership).",
    tags: ["Social", "Open to All"],
    audience: "Open to All",
    ctaMode: "rsvp",
    signupUrl: "https://forms.gle/hnUHffFFsyysX7vY6",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "3",
    title: "Weekly Halaqa",
    startDate: "2026-04-08",
    timeLabel: "Tuesday · 7:00 – 8:30 PM",
    location: "Cathedral of Learning, Room 232",
    shortBlurb:
      "Our weekly circle of knowledge — join us for a reflective session on Quranic themes and community discussion.",
    tags: ["Education", "Dawah", "Open to All"],
    audience: "Open to All",
    ctaMode: "rsvp",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "4",
    title: "Sisters' Tea & Tafsir",
    startDate: "2026-04-12",
    timeLabel: "Saturday · 2:00 – 4:00 PM",
    location: "William Pitt Union, Room 540",
    shortBlurb:
      "An afternoon of chai, conversation, and Quranic reflection in a warm, welcoming space for sisters.",
    tags: ["Sisters", "Education", "Dawah"],
    audience: "Sisters",
    ctaMode: "rsvp",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "5",
    title: "Jumu'ah Prayer",
    startDate: "2026-04-04",
    timeLabel: "Friday · 1:00 – 2:00 PM",
    location: "Nordy's Place, Cathedral of Learning",
    shortBlurb: "Weekly congregational prayer open to all students, faculty, and staff.",
    tags: ["Jumu'ah", "Open to All"],
    audience: "Open to All",
    ctaMode: "learn-more",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "6",
    title: "Career Night: Muslims in Tech",
    startDate: "2026-04-15",
    timeLabel: "Tuesday · 6:00 – 8:00 PM",
    location: "Posvar Hall, Room 1501",
    shortBlurb:
      "Panel featuring Muslim professionals in the tech industry. Resume reviews, networking, and Q&A.",
    tags: ["Careers", "Speaker Event", "Open to All"],
    audience: "Open to All",
    ctaMode: "signup",
    signupUrl: "https://forms.gle/hnUHffFFsyysX7vY6",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "7",
    title: "Brothers' Basketball Night",
    startDate: "2026-04-10",
    timeLabel: "Thursday · 8:00 – 10:00 PM",
    location: "Trees Hall Gymnasium",
    shortBlurb: "Pickup basketball and bonding — all skill levels welcome.",
    tags: ["Brothers", "Social"],
    audience: "Brothers",
    ctaMode: "rsvp",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "8",
    title: "Community Service Day",
    startDate: "2026-04-20",
    timeLabel: "Sunday · 9:00 AM – 1:00 PM",
    location: "Pittsburgh Food Bank, 1 N Linden St",
    shortBlurb:
      "Give back to Pittsburgh — join us for a morning of service at the Greater Pittsburgh Community Food Bank.",
    tags: ["Service", "Open to All"],
    audience: "Open to All",
    ctaMode: "signup",
    signupUrl: "https://forms.gle/hnUHffFFsyysX7vY6",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "9",
    title: "MSA Eid Social 2026",
    startDate: "2026-03-21",
    timeLabel: "Saturday · 1:00 – 4:00 PM",
    location: "Schenley Oval, Pittsburgh",
    shortBlurb:
      "Pizza, Halaqa, Mehndi, Volleyball, Spikeball — celebrate Eid together!",
    tags: ["Social", "Ramadan", "Open to All"],
    audience: "Open to All",
    isPast: true,
    ctaMode: "view-photos",
    galleryUrl: "/gallery",
  },
  {
    id: "10",
    title: "Ramadan Iftar Dinner",
    startDate: "2026-03-15",
    timeLabel: "Sunday · 7:30 – 9:30 PM",
    location: "William Pitt Union Ballroom",
    shortBlurb:
      "Break your fast with the MSA community. Catered dinner, reflections, and du'a.",
    tags: ["Ramadan", "Social", "Open to All"],
    audience: "Open to All",
    isPast: true,
    ctaMode: "view-photos",
    galleryUrl: "/gallery",
  },
  {
    id: "11",
    title: "Welcome Week Kickoff",
    startDate: "2026-03-01",
    timeLabel: "Monday · 5:00 – 7:00 PM",
    location: "Schenley Plaza",
    shortBlurb:
      "Meet the MSA board, grab some free food, and find your community on campus.",
    tags: ["Social", "Open to All"],
    audience: "Open to All",
    isPast: true,
    ctaMode: "view-photos",
    galleryUrl: "/gallery",
  },
  {
    id: "12",
    title: "Dawah Table: Islam Awareness Week",
    startDate: "2026-04-14",
    timeLabel: "Monday – Friday · 11:00 AM – 3:00 PM",
    location: "William Pitt Union Lobby",
    shortBlurb:
      "Stop by our table all week for conversations, free literature, and Q&A about Islam.",
    tags: ["Dawah", "Education", "Open to All"],
    audience: "Open to All",
    ctaMode: "learn-more",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
];

// ── Helpers ──────────────────────────────────────────────
export function getUpcomingEvents(events: MSAEvent[]): MSAEvent[] {
  return events.filter((e) => !e.isPast).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getPastEvents(events: MSAEvent[]): MSAEvent[] {
  return events.filter((e) => e.isPast).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getFeaturedEvent(events: MSAEvent[]): MSAEvent | undefined {
  return events.find((e) => e.featured);
}

export function filterEventsByTags(events: MSAEvent[], selectedTags: string[]): MSAEvent[] {
  if (selectedTags.length === 0 || selectedTags.includes("All")) return events;
  if (selectedTags.includes("Past Events")) {
    const otherTags = selectedTags.filter((t) => t !== "Past Events");
    const pastEvents = events.filter((e) => e.isPast);
    if (otherTags.length === 0) return pastEvents;
    return pastEvents.filter((e) => e.tags.some((t) => otherTags.includes(t)));
  }
  return events
    .filter((e) => !e.isPast)
    .filter((e) => e.tags.some((t) => selectedTags.includes(t)));
}

export function getEventsForDate(events: MSAEvent[], dateStr: string): MSAEvent[] {
  return events.filter((e) => e.startDate === dateStr);
}
