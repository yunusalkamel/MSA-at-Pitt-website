const primaryHost = "msaatpitt.org";
const defaultOrigin = "https://" + primaryHost;

function httpsOrigin(value) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.origin;
  } catch {
    return;
  }
}

export function getSiteOrigin(value, productionHost = "") {
  return httpsOrigin(value) ??
    (productionHost ? httpsOrigin("https://" + productionHost) : undefined) ??
    defaultOrigin;
}

export function isSiteOrigin(origin, configured, vercelHosts = []) {
  if (!origin) return false;
  return origin === getSiteOrigin(configured) ||
    origin === defaultOrigin || origin === "https://www." + primaryHost ||
    vercelHosts.some(host => host && origin === "https://" + host);
}
