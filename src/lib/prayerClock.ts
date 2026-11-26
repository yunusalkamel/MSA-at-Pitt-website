const DEG = Math.PI / 180;
function julianDate(y: number, m: number, d: number) {
  if (m <= 2) {
    y--;
    m += 12;
  }
  const A = Math.floor(y / 100);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    (2 - A + Math.floor(A / 4)) -
    1524.5
  );
}
function easternTZ(y: number, m: number, d: number) {
  const nthSun = (yr: number, mo: number, n: number) => {
    const fd = new Date(yr, mo - 1, 1).getDay();
    return (fd === 0 ? 1 : 8 - fd) + (n - 1) * 7;
  };
  const dt = new Date(y, m - 1, d);
  return dt >= new Date(y, 2, nthSun(y, 3, 2)) &&
    dt < new Date(y, 10, nthSun(y, 11, 1))
    ? -4
    : -5;
}
export function calcDay(
  lat: number,
  lng: number,
  y: number,
  m: number,
  d: number,
) {
  const tz = easternTZ(y, m, d);
  const D = julianDate(y, m, d) - 2451545.0;
  const g = (((357.529 + 0.98560028 * D) % 360) + 360) % 360;
  const q = (((280.459 + 0.98564736 * D) % 360) + 360) % 360;
  const L =
    (((q + 1.915 * Math.sin(g * DEG) + 0.02 * Math.sin(2 * g * DEG)) % 360) +
      360) %
    360;
  const e = 23.439 - 0.00000036 * D;
  const RA =
    Math.atan2(Math.cos(e * DEG) * Math.sin(L * DEG), Math.cos(L * DEG)) /
    DEG /
    15;
  const dec = Math.asin(Math.sin(e * DEG) * Math.sin(L * DEG)) / DEG;
  let EqT = q / 15 - RA;
  EqT = EqT - Math.round(EqT / 24) * 24;
  const noon = 12 - lng / 15 - EqT + tz;
  const HA = (ang: number) => {
    const c =
      (Math.sin(ang * DEG) - Math.sin(lat * DEG) * Math.sin(dec * DEG)) /
      (Math.cos(lat * DEG) * Math.cos(dec * DEG));
    return Math.abs(c) > 1 ? null : Math.acos(c) / DEG / 15;
  };
  const Hs = HA(-0.8333),
    Hf = HA(-15);
  const elevA = Math.atan(1 / (1 + Math.tan(Math.abs(lat - dec) * DEG))) / DEG;
  const Ha = HA(elevA);
  const fl = (v: number) => Math.floor(v * 60);
  const rnd = (v: number) => Math.round(v * 60);
  return {
    Fajr: Hf != null ? fl(noon - Hf) : null,
    Sunrise: Hs != null ? fl(noon - Hs) : null,
    Dhuhr: rnd(noon),
    Asr: Ha != null ? rnd(noon + Ha) : null,
    Maghrib: Hs != null ? rnd(noon + Hs + 1 / 60) : null,
    Isha: Hf != null ? rnd(noon + Hf + 1 / 60) : null,
  };
}

export function fm(x: number | null) {
  if (x == null) return "Unavailable";
  const h = Math.floor(x / 60) % 24,
    m = Math.round(x % 60);
  const ap = h < 12 ? "am" : "pm",
    hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hh}:${m < 10 ? "0" + m : m}${ap}`;
}
