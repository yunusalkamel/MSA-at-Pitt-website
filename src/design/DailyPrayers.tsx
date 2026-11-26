import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Moon } from "lucide-react";
import { calcDay, fm } from "@/lib/prayerClock";
import { useDesign } from "./options";
const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
export function pittsburghDate(date: Date) {
  return Object.fromEntries(
    clock.formatToParts(date).map((p) => [p.type, Number(p.value)]),
  );
}
function localSchedule(date: Date, west: boolean) {
  const parts = pittsburghDate(date);
  const times = calcDay(
    west ? 40.4065 : 40.449,
    west ? -80.0839 : -79.9619,
    parts.year,
    parts.month,
    parts.day,
  );
  return { times, minute: parts.hour * 60 + parts.minute };
}
function useSchedule(west: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const { times, minute } = localSchedule(now, west);
  const next = Object.entries(times).find(
    ([name, t]) => name !== "Sunrise" && t != null && t > minute,
  );
  const tomorrow = next
    ? null
    : localSchedule(new Date(now.getTime() + 86400000), west).times.Fajr;
  return {
    now,
    times,
    next: next?.[0] ?? "Fajr",
    minutes: next
      ? next[1]! - minute
      : tomorrow == null
        ? null
        : 1440 - minute + tomorrow,
  };
}
export function PrayerLink() {
  const { next, minutes } = useSchedule(false);
  const { lunar } = useDesign();
  return (
    <Link
      className="next-prayer-link"
      to="/resources/prayer"
      title="Pittsburgh prayer times"
    >
      {lunar && <Moon size={14} />} {next}
      {minutes != null && (
        <span>
          {" "}
          in {minutes >= 60 ? Math.floor(minutes / 60) + "h " : ""}
          {minutes % 60}m
        </span>
      )}
    </Link>
  );
}
export function DailyPrayers({ page = false, title = "Prayer at Pitt", almanac }: { page?: boolean; title?: ReactNode; almanac?: { open: boolean; toggle: () => void; chart: ReactNode } }) {
  const { now, times, next } = useSchedule(false);
  const { lunar } = useDesign();
  return (
    <section className="daily-prayers">
      <div className="prayer-heading">
        <div>
          <small>
            {now.toLocaleDateString("en-US", {
              timeZone: "America/New_York",
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </small>
          {page ? <h1>{lunar && <Moon aria-hidden size={24} />} <span>{title}</span></h1>
            : <h2>{lunar && <Moon aria-hidden size={24} />} Prayer at Pitt</h2>}
        </div>
        {!page && <Link to="/resources/prayer">Campus prayer guide ↗</Link>}
      </div>
      <dl>
        {Object.entries(times).map(([name, time]) => (
          <div key={name} data-next={name === next || undefined}>
            <dt>
              {name}
              {name === next && <small>Next</small>}
            </dt>
            <dd>{fm(time)}</dd>
          </div>
        ))}
      </dl>
      <div className="daily-prayers-footer">
        <p>Calculated local times · Oakland, Pittsburgh</p>
        {page && almanac && <button className="chart-disclosure" type="button"
          aria-expanded={almanac.open} aria-controls="solar-almanac-content"
          onClick={almanac.toggle}>
          <span aria-hidden="true">◐</span> {almanac.open ? "Close solar almanac" : "Open solar almanac"} <span aria-hidden="true">{almanac.open ? "−" : "+"}</span>
        </button>}
      </div>
      {page && almanac && <div id="solar-almanac-content" hidden={!almanac.open}>{almanac.chart}</div>}
    </section>
  );
}
