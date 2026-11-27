import { getSiteOrigin, isSiteOrigin } from "../shared/site-origin.js";
import { isCampaign } from "../server/campaigns.js";
import { analyticsSettings } from "../server/analytics-settings.js";
import { publicPages, interactions } from "../shared/traffic.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (
    req.method !== "POST" ||
    process.env.VERCEL_ENV !== "production" ||
    !isSiteOrigin(req.headers.origin, process.env.SITE_ORIGIN, [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL])
  )
    return res.status(403).end();
  const {
    page,
    event,
    visitor,
    session,
    device,
    source,
    engagement,
    previous,
    campaign,
    browser,
    system,
    screen,
    eventKey,
  } = req.body || {};
  if (
    typeof page !== "string" || page.length > 97 ||
    !interactions.includes(event) ||
    !/^\d{1,10}\.\d{1,10}$/.test(visitor) ||
    !Number.isSafeInteger(session) ||
    session <= 0 ||
    !["mobile", "desktop", "tablet"].includes(device)
  )
    return res.status(400).end();
  try {
    if (
      !process.env.GA4_API_SECRET ||
      !process.env.GA4_MEASUREMENT_ID ||
      !(await analyticsSettings()).enabled
    )
      return res.status(204).end();
    const builtIn = [...publicPages, "/gallery/album"];
    if (!builtIn.includes(page) && !(await isCampaign(page))) return res.status(400).end();
    const origin = getSiteOrigin(process.env.SITE_ORIGIN, process.env.VERCEL_PROJECT_PRODUCTION_URL);
    const params = {
      page_location: origin + page,
      session_id: session,
      engagement_time_msec: Math.max(
        1,
        Math.min(1800000, Number(engagement) || 1),
      ),
    };
    if (builtIn.includes(previous) || (previous && await isCampaign(previous)))
      params.page_referrer = origin + previous;
    else if (
      [
        "google.com",
        "instagram.com",
        "facebook.com",
        "bing.com",
        "linktr.ee",
      ].includes(source)
    )
      params.page_referrer = "https://" + source + "/";
    const allowed = (process.env.GA4_CAMPAIGNS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.includes(campaign)) {
      params.campaign = campaign;
      params.campaign_name = campaign;
    }
    if (typeof eventKey === "string" && /^[a-f0-9]{16}$/.test(eventKey))
      params.msa_event = eventKey;
    const deviceData = { category: device };
    if (["Safari", "Chrome", "Firefox", "Edge"].includes(browser))
      deviceData.browser = browser;
    if (["iOS", "Android", "Windows", "MacOS", "Linux"].includes(system))
      deviceData.operating_system = system;
    if (["small", "medium", "large"].includes(screen))
      params.msa_screen = screen;
    const country = req.headers["x-vercel-ip-country"];
    const response = await fetch(
      "https://www.google-analytics.com/mp/collect?" +
        new URLSearchParams({
          measurement_id: process.env.GA4_MEASUREMENT_ID,
          api_secret: process.env.GA4_API_SECRET,
        }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: visitor,
          device: deviceData,
          ...(/^[A-Z]{2}$/.test(country || "")
            ? { user_location: { country_id: country } }
            : {}),
          consent: { ad_user_data: "DENIED", ad_personalization: "DENIED" },
          events: [{ name: event, params }],
        }),
        signal: AbortSignal.timeout(4000),
      },
    );
    return res.status(response.ok ? 204 : 502).end();
  } catch {
    return res.status(503).end();
  }
}
