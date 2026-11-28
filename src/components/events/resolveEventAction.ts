import { extractRegistrationUrl } from "../../../supabase/functions/google-calendar-events/parse-description";
import type { MSAEvent } from "@/data/events";

export type EventActionKind = "signup" | "gallery" | "learn-more" | "details" | "subscribe";

export interface EventAction {
  kind: EventActionKind;
  label: string;
  href?: string;
  external: boolean;
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const candidate = url.trim().replace(/[),.;]+$/, "");

  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  if (!/^https?:\/\//i.test(candidate)) return undefined;

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

export function resolveEventAction(event: MSAEvent): EventAction {
  // Past events with a gallery URL get a "View Photos" action
  const galleryUrl = normalizeUrl(event.galleryUrl);
  if (event.isPast && galleryUrl) {
    return {
      kind: "gallery",
      label: "View Photos",
      href: galleryUrl,
      external: !galleryUrl.startsWith("/"),
    };
  }

  // An actual registration link takes priority for every event category.
  const rsvpUrl = normalizeUrl(event.description ? extractRegistrationUrl(event.description) : event.rsvpUrl);
  if (rsvpUrl) {
    return {
      kind: "signup",
      label: "RSVP",
      href: rsvpUrl,
      external: !rsvpUrl.startsWith("/"),
    };
  }

  return {
    kind: "details",
    label: "Details",
    href: `/events?event=${encodeURIComponent(event.id)}`,
    external: false,
  };
}

/** Only declare open attendance for the requested weekly programs or explicit calendar wording. */
export function attendanceInfo(event: MSAEvent): "open" | "pending" | undefined {
  if (event.isPast || resolveEventAction(event).kind === "signup") return;
  const text = (event.description || event.shortBlurb || "").replace(/<[^>]+>/g," ");
  const required = /(?:rsvp|registration|sign.?up)\s+(?:is\s+)?required|must\s+(?:register|rsvp)|registration\s+(?:link\s+)?(?:pending|coming soon)|link\s+(?:pending|coming soon)/i.test(text);
  const open = /no\s+(?:rsvp|registration|sign.?up)\s+(?:needed|required|necessary)|(?:rsvp|registration)\s+(?:is\s+)?not\s+required/i.test(text);
  if (open) return "open";
  if (required) return "pending";
  if (event.categories.includes("halaqa") || /\b(?:halaq[ah]+|basketball|soccer)\b/i.test(event.title)) return "open";
}
