import { describe, expect, it } from "vitest";
import { nextGathering } from "@/lib/nextGathering";
import type { MSAEvent, EventCategory } from "@/data/events";
const now = new Date("2026-11-26T17:00:00Z");
function event(
  title: string,
  category: EventCategory,
  date = "2026-11-27",
  timeLabel = "2:00 PM",
): MSAEvent {
  return {
    id: title,
    title,
    startDate: date,
    timeLabel,
    location: "",
    shortBlurb: "",
    audience: "general",
    categories: [category],
    tags: [],
    isSignature: category === "signature",
    tagSource: "explicit",
    confidence: 1,
    clickUrl: "",
    calendarFallbackUrl: "",
  };
}
describe("homepage gathering selection", () => {
  it("uses the complete two-week lineup and includes day fourteen", () => {
    const lineup = [
      event("Pickup", "sports"),
      event("Halaqah", "halaqa"),
      event("Khutbah", "jumuah"),
      event("Social", "social"),
      event("Banquet", "signature", "2026-12-10"),
    ];
    const expected = [...lineup].reverse();
    for (const next of expected) {
      expect(nextGathering(lineup, now)).toBe(next);
      lineup.splice(lineup.indexOf(next), 1);
    }
  });
  it("prioritizes tournaments and larger dawah gatherings over recurring prayer", () => {
    const prayer = event("Friday khutbah", "jumuah");
    for (const promoted of [
      event("Winter tournament", "sports", "2026-12-01"),
      event("Guest speaker night", "dawah", "2026-12-02"),
    ])
      expect(nextGathering([prayer, promoted], now)).toBe(promoted);
    expect(
      nextGathering([prayer, event("Weekly dawah table", "dawah")], now),
    ).toBe(prayer);
  });
  it("resolves ties by start and excludes a past start, even across Eastern midnight", () => {
    const earlier = event("Earlier", "social", "2026-11-26", "12:30 PM");
    expect(
      nextGathering(
        [
          event("Yesterday", "signature", "2026-11-25"),
          event("Morning", "signature", "2026-11-26", "11:00 AM"),
          event("Later", "social", "2026-11-26", "2:00 PM"),
          earlier,
        ],
        now,
      ),
    ).toBe(earlier);
    const late = event("Late", "social", "2026-11-26", "11:30 PM");
    expect(nextGathering([late], new Date("2026-11-27T04:00:00Z"))).toBe(late);
  });
  it("keeps distant signature events out of the priority window, and falls back chronologically", () => {
    const soon = event("Pickup", "sports");
    const distant = event("Gala", "signature", "2026-12-11");
    expect(nextGathering([distant, soon], now)).toBe(soon);
    const later = event("Dinner", "social", "2026-12-12");
    expect(nextGathering([later, distant], now)).toBe(distant);
    expect(nextGathering([], now)).toBeUndefined();
  });
});
