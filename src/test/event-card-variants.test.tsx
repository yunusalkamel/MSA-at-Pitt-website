import { beforeAll, afterAll, vi, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCardBase from "@/components/events/EventCardBase";
import type { MSAEvent } from "@/data/events";

beforeAll(() =>
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterAll(() => vi.unstubAllGlobals());
const baseEvent: MSAEvent = {
  id: "base",
  audience: "general",
  categories: ["dawah"],
  isSignature: false,
  tagSource: "explicit",
  confidence: 1,
  clickUrl: "https://example.com/rsvp",
  rsvpUrl: "https://example.com/rsvp",
  calendarFallbackUrl: "https://calendar.google.com/example",
  title: "Community Halaqa",
  startDate: "2026-04-12",
  timeLabel: "Sunday · 7:00 – 8:00 PM",
  location: "Cathedral of Learning",
  shortBlurb: "Join our weekly halaqa and reflection circle.",
  tags: ["Dawah"],
  ctaMode: "rsvp",
  signupUrl: "https://example.com/rsvp",
  addToCalendarUrl: "https://calendar.google.com/example",
};

const renderCard = (
  event: MSAEvent,
  variant: "standard" | "featured" = "standard",
) => {
  return render(
    <MemoryRouter>
      <EventCardBase event={event} variant={variant} />
    </MemoryRouter>,
  );
};

describe("EventCardBase variants", () => {
  it("renders upcoming variant", () => {
    const card = renderCard(baseEvent);
    expect(card.getByRole("link", { name: "RSVP" })).toHaveAttribute(
      "href",
      baseEvent.rsvpUrl,
    );
  });

  it("renders featured variant", () => {
    const { container } = renderCard(
      {
        ...baseEvent,
        id: "featured",
        featured: true,
        tags: ["Signature", "Social"],
      },
      "featured",
    );
    expect(container.querySelector("h3")).toHaveTextContent("Community Halaqa");
  });

  it("renders past variant", () => {
    const { container } = renderCard({
      ...baseEvent,
      id: "past",
      isPast: true,
      galleryUrl: "/gallery",
      ctaMode: "view-photos",
      rsvpUrl: undefined,
      clickUrl: "",
      signupUrl: undefined,
      addToCalendarUrl: undefined,
    });
    expect(container.querySelector('a[href="/gallery"]')).toHaveTextContent(
      "View Photos",
    );
  });

  it("renders no-link variant", () => {
    const { container } = renderCard({
      ...baseEvent,
      id: "no-link",
      rsvpUrl: undefined,
      clickUrl: "",
      signupUrl: undefined,
      addToCalendarUrl: undefined,
      fullCalendarUrl: undefined,
      ctaMode: "learn-more",
    });
    expect(container.querySelector('a[href*="linktr.ee"]')).toHaveTextContent(
      "Open MSA event links",
    );
  });
});
