const primaryHost = "msaatpitt.org";
const defaultOrigin = "https://" + primaryHost;

export function getSiteOrigin(value) {
  try {
    const url = new URL(value || defaultOrigin);
    return url.protocol === "https:" ? url.origin : defaultOrigin;
  } catch {
    return defaultOrigin;
  }
}

export function isSiteOrigin(origin, configured, vercelHosts = []) {
  if (!origin) return false;
  return origin === getSiteOrigin(configured) ||
    origin === defaultOrigin || origin === "https://www." + primaryHost ||
    origin === "https://msaatpitt." + "vercel.app" ||
    vercelHosts.some(host => host && origin === "https://" + host);
}
