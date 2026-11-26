import { useCallback, useSyncExternalStore } from "react";
import { calcDay } from "@/lib/prayerClock";

const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric", month: "numeric", day: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export type PrayerLocation = "oakland" | "west";
const locations = {
  oakland: [40.4490, -79.9619],
  west: [40.4065, -80.0839],
} as const;
const listeners = new Set<() => void>();
let minuteStamp = Math.floor(Date.now() / 60000) * 60000;
let timer: ReturnType<typeof setTimeout>;

export function pittsburghDate(date: Date) {
  return Object.fromEntries(clock.formatToParts(date).map(part => [part.type, Number(part.value)]));
}

function tick() {
  clearTimeout(timer);
  const now = Date.now();
  const next = Math.floor(now / 60000) * 60000;
  if (next !== minuteStamp) {
    minuteStamp = next;
    listeners.forEach(notify => notify());
  }
  if (listeners.size > 0) timer = setTimeout(tick, 60000 - now % 60000);
}
function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) {
    tick();
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(notify);
    if (!listeners.size) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}
const getSnapshot = () => minuteStamp;

export function usePrayerSchedule(location: PrayerLocation = "oakland") {
  const stamp = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const now = new Date(stamp);
  const date = pittsburghDate(now);
  const onDate = useCallback((year: number, month: number, day: number) => {
    const [latitude, longitude] = locations[location];
    return calcDay(latitude, longitude, year, month, day);
  }, [location]);
  const times = onDate(date.year, date.month, date.day);
  const minute = date.hour * 60 + date.minute;
  const next = Object.entries(times).find(([name, time]) => name !== "Sunrise" && time != null && time > minute);
  const tomorrow = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  const tomorrowFajr = onDate(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate()).Fajr;
  return {
    now, date, times, onDate, next: next?.[0] ?? "Fajr",
    minutes: next ? next[1]! - minute : tomorrowFajr == null ? null : 1440 - minute + tomorrowFajr,
  };
}
