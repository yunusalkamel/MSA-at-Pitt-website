import type { MSAEvent } from "@/data/events";
import { parseStartMinutes } from "@/components/events/calendar-utils";

const easternClock = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
function priority(event: MSAEvent) {
  const has = (category: MSAEvent["categories"][number]) =>
    event.categories.includes(category);
  if (event.isSignature || has("signature") || event.tags.includes("Signature"))
    return 0;
  const tournament = /\b(tournament|tourney)\b/i.test(event.title);
  const largeDawah =
    has("dawah") &&
    /\b(large|major|keynote|conference|convention|summit|symposium|guest speaker|guest lecture|speaker night|campus.wide)\b/i.test(
      [event.title, event.description, event.shortBlurb].join(" "),
    );
  if (has("social") || tournament || largeDawah) return 1;
  if (has("jumuah") || /\b(khutba[h]?|jum[u']+ah)\b/i.test(event.title))
    return 2;
  if (has("halaqa") || /\bhalaqah?\b/i.test(event.title)) return 3;
  if (has("sports")) return 4;
  return 5;
}
export function nextGathering(events: MSAEvent[], now = new Date(), order: "featured" | "chronological" = "featured") {
  const p = Object.fromEntries(
    easternClock.formatToParts(now).map((x) => [x.type, x.value]),
  );
  const today = [p.year, p.month, p.day].join("-");
  const cutoff = new Date(Date.parse(today + "T00:00:00Z") + 14 * 86400000)
    .toISOString()
    .slice(0, 10);
  const minutes = Number(p.hour) * 60 + Number(p.minute);
  const upcoming = events.filter(
    (e) =>
      !e.isPast &&
      (e.startDate > today ||
        (e.startDate === today &&
          (!/\d.*(?:am|pm)/i.test(e.timeLabel) ||
            parseStartMinutes(e) >= minutes))),
  );
  return upcoming.sort((a, b) => {
    const inWindowA = a.startDate <= cutoff,
      inWindowB = b.startDate <= cutoff;
    if (inWindowA !== inWindowB) return inWindowA ? -1 : 1;
    const rank = inWindowA && order === "featured" ? priority(a) - priority(b) : 0;
    return (
      rank ||
      a.startDate.localeCompare(b.startDate) ||
      parseStartMinutes(a) - parseStartMinutes(b) ||
      a.title.localeCompare(b.title)
    );
  })[0];
}
