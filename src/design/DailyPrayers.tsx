import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Moon } from "lucide-react";
import { fm } from "@/lib/prayerClock";
import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { TextField } from "@/editor/content";

export function prayerCountdown(minutes: number) {
  return `${minutes >= 60 ? Math.floor(minutes / 60) + "h " : ""}${minutes % 60}m`;
}

export function PrayerLink() {
  const { next, minutes } = usePrayerSchedule();
  return (
    <Link className="next-prayer-link" to="/resources/prayer" title="Pittsburgh prayer times"
      aria-label={minutes == null ? next : `${next} in ${prayerCountdown(minutes)}`}>
      <Moon size={14} aria-hidden="true" />
      <span>{next}</span>
      {minutes != null && <span className="prayer-nav-time"><span className="hidden md:inline">in </span>{prayerCountdown(minutes)}</span>}
    </Link>
  );
}

type Props = {
  schedule?: ReturnType<typeof usePrayerSchedule>;
  almanac?: { open: boolean; toggle: () => void; chart: ReactNode };
};
export function DailyPrayers({ schedule: supplied, almanac }: Props) {
  const oakland = usePrayerSchedule();
  const { now, times, next, minutes } = supplied ?? oakland;
  return (
    <section className="daily-prayers">
      <div className="prayer-heading">
        <div>
          <small>{now.toLocaleDateString("en-US", {
            timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric",
          })}</small>
          <h2><Moon aria-hidden size={24} /> {almanac ? "Today's times" : "Prayer at Pitt"}</h2>
        </div>
        {!almanac && <Link to="/resources/prayer"><TextField id="prayer-campus-guide" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_7"]}>Campus prayer guide →</TextField></Link>}
      </div>
      <dl>
        {Object.entries(times).map(([name, time]) => (
          <div key={name} data-next={name === next || undefined}>
            <dt>{name}{name === next && <small>{minutes == null ? "Next" : `in ${prayerCountdown(minutes)}`}</small>}</dt>
            <dd>{fm(time)}</dd>
          </div>
        ))}
      </dl>
      <div className="daily-prayers-footer">
        <p>Calculated local times · Oakland, Pittsburgh</p>
        {almanac && <button className="chart-disclosure" type="button" aria-expanded={almanac.open}
          aria-controls="solar-almanac-content" onClick={almanac.toggle}>
          <span aria-hidden="true">◐</span> {almanac.open ? "Close solar almanac" : "Open solar almanac"} <span aria-hidden="true">{almanac.open ? "−" : "+"}</span>
        </button>}
      </div>
      {almanac && <div id="solar-almanac-content" hidden={!almanac.open}>{almanac.chart}</div>}
    </section>
  );
}
