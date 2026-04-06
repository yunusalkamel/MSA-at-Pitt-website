import type { MSAEvent } from "@/data/events";

export type EventActionKind = "signup" | "gallery" | "learn-more" | "details";

export interface EventAction {
  kind: EventActionKind;
  label: string;
  href?: string;
  external: boolean;
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const candidate = url.trim().replace(/[),.;]+$/, "");

  if (candidate.startsWith("/")) return candidate;
  if (!/^https?:\/\//i.test(candidate)) return undefined;

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

function parseUrlFromDescription(description?: string): string | undefined {
  if (!description) return undefined;

  const hrefMatch = description.match(/href\s*=\s*["']([^"']+)["']/i);
  if (hrefMatch?.[1]) {
    const normalized = normalizeUrl(hrefMatch[1]);
    if (normalized) return normalized;
  }

  const inlineMatch = description.match(/https?:\/\/[^\s<>"]+/);
  if (inlineMatch?.[0]) {
    const normalized = normalizeUrl(inlineMatch[0]);
    if (normalized) return normalized;
  }

  return undefined;
}

function getCtaLabel(mode?: MSAEvent["ctaMode"]): string {
  if (mode === "signup") return "Sign Up";
  if (mode === "join-now") return "Join Now";
  if (mode === "learn-more") return "Learn More";
  return "RSVP";
}

export function resolveEventAction(event: MSAEvent): EventAction {
  const ctaMode = event.ctaMode ?? "rsvp";

  const galleryUrl = normalizeUrl(event.galleryUrl);
  if (event.isPast && galleryUrl) {
    return {
      kind: "gallery",
      label: "View Photos",
      href: galleryUrl,
      external: !galleryUrl.startsWith("/"),
    };
  }

  const primaryUrl = [event.signupUrl, event.fullCalendarUrl, event.addToCalendarUrl, parseUrlFromDescription(event.description)]
    .map((candidate) => normalizeUrl(candidate))
    .find(Boolean);

  if (primaryUrl) {
    return {
      kind: ctaMode === "learn-more" ? "learn-more" : "signup",
      label: getCtaLabel(ctaMode),
      href: primaryUrl,
      external: !primaryUrl.startsWith("/"),
    };
  }

  return {
    kind: "details",
    label: ctaMode === "learn-more" ? "Learn More" : "Details",
    external: false,
  };
}
