import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ExternalLink, Moon } from "lucide-react";
import { fm } from "@/lib/prayerClock";
import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { LINKS } from "@/config/links";
import { LinkField, TextField } from "@/editor/content";

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

export function DailyPrayers({ almanac }: {
  almanac?: { open: boolean; toggle: () => void; chart: ReactNode };
}) {
  const { now, times, next, minutes } = usePrayerSchedule();
  return (
    <section className="daily-prayers prayer-surface">
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
        {Object.entries(times).map(([name, time]) => {
          const label = fm(time);
          return (
            <div key={name} data-next={name === next || undefined}>
              <dt>{name}</dt>
              <dd><span className="prayer-time-value">{time == null ? label : <>{label.slice(0, -2)}<span className="prayer-meridiem">{label.slice(-2)}</span></>}</span>
                {name === next && <span className="prayer-countdown">{minutes == null ? "Next" : `in ${prayerCountdown(minutes)}`}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="daily-prayers-footer">
        <p>Calculated local times · Oakland, Pittsburgh</p>
        <div className="prayer-time-actions">
          <LinkField fieldId="prayer-athan-app" href={LINKS.athanPlus} target="_blank" rel="noopener noreferrer">
            Athan+ app <ExternalLink size={13} aria-hidden="true" />
          </LinkField>
          {almanac && <button className="chart-disclosure" type="button" aria-expanded={almanac.open}
            aria-controls="solar-almanac-content" onClick={almanac.toggle}>
            <span aria-hidden="true">◐</span> {almanac.open ? "Close solar almanac" : "Open solar almanac"} <span aria-hidden="true">{almanac.open ? "−" : "+"}</span>
          </button>}
        </div>
      </div>
      {almanac && <div id="solar-almanac-content" className="prayer-chart-card" hidden={!almanac.open}>{almanac.chart}</div>}
    </section>
  );
}
