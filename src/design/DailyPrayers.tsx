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

export function DailyPrayers({ page = false }: { page?: boolean }) {
  const { now, times, next, minutes } = usePrayerSchedule();
  return (
    <section className="daily-prayers prayer-surface">
      <div className="prayer-heading">
        <div>
          <small>{now.toLocaleDateString("en-US", {
            timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric",
          })}</small>
          <h2><Moon aria-hidden size={24} /> {page ? "Today's times" : "Prayer at Pitt"}</h2>
        </div>
        {!page && <Link to="/resources/prayer"><TextField id="prayer-campus-guide" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_7"]}>Campus prayer guide →</TextField></Link>}
      </div>
      <dl>
        {Object.entries(times).map(([name, time]) => {
          const label = fm(time);
          return (
            <div key={name} data-next={name === next || undefined}>
              <dt>{name}{name === next && (
                <span className="prayer-countdown">{minutes == null ? "Next" : `in ${prayerCountdown(minutes)}`}</span>
              )}</dt>
              <dd>{time == null ? label : <>{label.slice(0, -2)}<span>{label.slice(-2)}</span></>}</dd>
            </div>
          );
        })}
      </dl>
      <div className="daily-prayers-footer">
        <p>Calculated local times · Oakland, Pittsburgh</p>
      </div>
    </section>
  );
}
