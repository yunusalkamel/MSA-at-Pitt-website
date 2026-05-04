import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCardBase from "@/components/events/EventCardBase";
import type { MSAEvent } from "@/data/events";

const baseEvent: MSAEvent = {
  id: "base",
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

const renderCard = (event: MSAEvent, variant: "standard" | "featured" = "standard") => {
  return render(
    <MemoryRouter>
      <EventCardBase event={event} variant={variant} />
    </MemoryRouter>,
  );
};

describe("EventCardBase variants", () => {
  it("renders upcoming variant", () => {
    const { container } = renderCard(baseEvent);
    expect(container.firstChild).toMatchSnapshot();
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
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders past variant", () => {
    const { container } = renderCard({
      ...baseEvent,
      id: "past",
      isPast: true,
      galleryUrl: "/gallery",
      ctaMode: "view-photos",
      signupUrl: undefined,
      addToCalendarUrl: undefined,
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no-link variant", () => {
    const { container } = renderCard({
      ...baseEvent,
      id: "no-link",
      signupUrl: undefined,
      addToCalendarUrl: undefined,
      fullCalendarUrl: undefined,
      ctaMode: "learn-more",
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
