import { createSign } from "node:crypto";
import { fail, environment } from "./management.js";
import { publicPages } from "../shared/traffic.js";
const audience = [
  "totalUsers",
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "userEngagementDuration",
  "engagementRate",
  "bounceRate",
  "screenPageViewsPerSession",
];
const reports = {
  Overview: [[], audience],
  Trend: [
    ["date"],
    ["totalUsers", "sessions", "screenPageViews", "engagementRate"],
  ],
  Pages: [
    ["pagePath"],
    ["screenPageViews", "totalUsers", "userEngagementDuration"],
  ],
  Landing: [["landingPage"], ["sessions", "engagementRate"]],
  Acquisition: [
    ["sessionSourceMedium"],
    ["sessions", "engagedSessions", "totalUsers"],
  ],
  Campaigns: [["sessionCampaignName"], ["sessions", "engagedSessions"]],
  "Page sources": [
    ["pagePath", "sessionSourceMedium"],
    ["screenPageViews", "activeUsers"],
  ],
  "Event interest": [
    ["customEvent:msa_event", "eventName"],
    ["eventCount", "totalUsers"],
  ],
  Interactions: [
    ["eventName", "pagePath"],
    ["eventCount", "totalUsers"],
  ],
  Devices: [["deviceCategory"], ["totalUsers", "sessions"]],
  Browsers: [["browser"], ["totalUsers"]],
  Systems: [["operatingSystem"], ["totalUsers"]],
  Screens: [["screenResolution"], ["totalUsers"]],
  Geography: [["country", "region", "city"], ["totalUsers"]],
  Returning: [["newVsReturning"], ["totalUsers"]],
};
const cache = new Map();
let token;
async function cached(key, ttl, load) {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.data;
  const data = await load();
  if (cache.size >= 150) cache.delete(cache.keys().next().value);
  cache.set(key, { until: Date.now() + ttl, data });
  return data;
}
async function googleToken() {
  if (token?.until > Date.now()) return token.value;
  let credentials;
  try {
    credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON);
  } catch {
    throw fail(503, "Configure GA4_SERVICE_ACCOUNT_JSON on the server.");
  }
  const seconds = Math.floor(Date.now() / 1000),
    format = (x) => Buffer.from(JSON.stringify(x)).toString("base64url");
  const unsigned =
    format({ alg: "RS256", typ: "JWT" }) +
    "." +
    format({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: seconds,
      exp: seconds + 3600,
    });
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(credentials.private_key, "base64url");
  const result = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + signature,
    }),
    signal: AbortSignal.timeout(6500),
  });
  if (!result.ok)
    throw fail(
      503,
      "Google rejected the reporting credentials. Check the service account.",
    );
  const json = await result.json();
  token = { value: json.access_token, until: Date.now() + 3300000 };
  return token.value;
}
const day = 86400000;
function validDate(s) {
  return (
    typeof s === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    Number.isFinite(Date.parse(s)) &&
    new Date(s).toISOString().startsWith(s)
  );
}
export async function report({ view, start, end, page }) {
  const env = environment(),
    id = process.env.GA4_PROPERTY_ID;
  if (view === "Performance") {
    if (env !== "production")
      throw fail(
        404,
        "Chrome field measurements are available for the production website only.",
      );
    if (!process.env.CRUX_API_KEY)
      throw fail(
        503,
        "Configure CRUX_API_KEY for real-user performance trends.",
      );
    if (page && !publicPages.includes(page))
      throw fail(400, "Choose a public page.");
    return cached("crux" + (page ?? ""), 86400000, async () => {
      const rows = [];
      for (const formFactor of ["PHONE", "DESKTOP"]) {
        const origin = "https://msaatpitt.vercel.app";
        const res = await fetch(
          "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=" +
            encodeURIComponent(process.env.CRUX_API_KEY),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(page ? { url: origin + page } : { origin }),
              formFactor,
              metrics: [
                "largest_contentful_paint",
                "interaction_to_next_paint",
                "cumulative_layout_shift",
              ],
            }),
            signal: AbortSignal.timeout(6500),
          },
        );
        if (res.status === 404) continue;
        if (!res.ok)
          throw fail(
            503,
            "Chrome UX Report is unavailable. Check API access or quota.",
          );
        const { record } = await res.json();
        record.collectionPeriods.forEach((period, i) => {
          const date = period.lastDate;
          rows.push([
            formFactor,
            [date.year, date.month, date.day]
              .map((n) => String(n).padStart(2, "0"))
              .join("-"),
            ...[
              "largest_contentful_paint",
              "interaction_to_next_paint",
              "cumulative_layout_shift",
            ].map((k) =>
              String(
                record.metrics[k]?.percentilesTimeseries?.p75s[i] ??
                  "Unavailable",
              ),
            ),
          ]);
        });
      }
      return {
        headers: [
          "Device",
          "Period ending",
          "LCP p75 (ms)",
          "INP p75 (ms)",
          "CLS p75",
        ],
        rows,
      };
    });
  }
  const funnels = {
    "Event RSVP": ["/events", "rsvp_click"],
    "Join WhatsApp": ["/join", "whatsapp_click"],
    "Resource usage": ["/resources", "resource_click"],
  };
  const funnel = Object.hasOwn(funnels, view);
  if (
    (!funnel && !Object.hasOwn(reports, view)) ||
    !validDate(start) ||
    !validDate(end) ||
    start > end ||
    end > new Date().toISOString().slice(0, 10) ||
    start < "2015-08-14"
  )
    throw fail(400, "Choose a valid report and date range.");
  if (!/^\d+$/.test(id || ""))
    throw fail(503, "Configure a GA4_PROPERTY_ID for this environment.");
  return cached([env, id, view, start, end].join(":"), 300000, async () => {
    if (funnel) {
      const [path, event] = funnels[view];
      const match = (fieldName, value) => ({
        funnelFieldFilter: {
          fieldName,
          stringFilter: { matchType: "EXACT", value },
        },
      });
      const steps = [
        {
          name: "Landing",
          filterExpression: { funnelEventFilter: { eventName: "page_view" } },
        },
        {
          name: path,
          filterExpression: {
            andGroup: {
              expressions: [
                { funnelEventFilter: { eventName: "page_view" } },
                match("pagePath", path),
              ],
            },
          },
        },
        {
          name: event,
          filterExpression: { funnelEventFilter: { eventName: event } },
        },
      ];
      const response = await fetch(
        "https://analyticsdata.googleapis.com/v1alpha/properties/" +
          id +
          ":runFunnelReport",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + (await googleToken()),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: start, endDate: end }],
            funnel: { isOpenFunnel: false, steps },
          }),
          signal: AbortSignal.timeout(8500),
        },
      );
      if (!response.ok)
        throw fail(
          503,
          "The GA4 funnel report is unavailable. Check property access and reporting quota.",
        );
      const { funnelTable } = await response.json();
      return {
        headers: [
          ...funnelTable.dimensionHeaders,
          ...funnelTable.metricHeaders,
        ].map((v) => v.name),
        rows: (funnelTable.rows || []).map((r) =>
          [...r.dimensionValues, ...r.metricValues].map((v) => v.value),
        ),
      };
    }
    const [dimensions, metrics] = reports[view],
      previousEnd = Date.parse(start) - day,
      previousStart = previousEnd - (Date.parse(end) - Date.parse(start));
    const dateRanges = [{ startDate: start, endDate: end, name: "Selected" }];
    if (previousStart >= Date.parse("2015-08-14"))
      dateRanges.push({
        startDate: new Date(previousStart).toISOString().slice(0, 10),
        endDate: new Date(previousEnd).toISOString().slice(0, 10),
        name: "Previous",
      });
    const response = await fetch(
      "https://analyticsdata.googleapis.com/v1beta/properties/" +
        id +
        ":runReport",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (await googleToken()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges,
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          limit: 1000,
          orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
        }),
        signal: AbortSignal.timeout(8500),
      },
    );
    if (!response.ok)
      throw fail(
        503,
        response.status === 429
          ? "Google Analytics reporting quota reached. Try again later."
          : "Google Analytics could not return this report. Check the property, API and Viewer permission.",
      );
    const r = await response.json(),
      headers = [...(r.dimensionHeaders ?? []), ...r.metricHeaders].map(
        (h) => h.name,
      );
    const rows = (r.rows ?? []).map((row) =>
      [...(row.dimensionValues ?? []), ...row.metricValues].map(
        (cell) => cell.value,
      ),
    );
    if (view === "Overview") {
      const index = headers.indexOf("dateRange"),
        current = rows.find((row) => index < 0 || row[index] === "Selected"),
        previous = rows.find((row) => row[index] === "Previous");
      const table = metrics.map((m) => {
        const pos = headers.indexOf(m),
          a = current?.[pos],
          b = previous?.[pos];
        return [
          m,
          a ?? "Unavailable",
          b ?? "Unavailable",
          a != null && Number(b) > 0
            ? ((Number(a) / Number(b) - 1) * 100).toFixed(1) + "%"
            : "—",
        ];
      });
      if (current && Number(current[headers.indexOf("activeUsers")]) > 0)
        table.push([
          "Engagement seconds per active user",
          (
            Number(current[headers.indexOf("userEngagementDuration")]) /
            Number(current[headers.indexOf("activeUsers")])
          ).toFixed(1),
          "—",
          "—",
        ]);
      return {
        headers: ["Metric", "Selected", "Previous", "Change"],
        rows: table,
      };
    }
    return { headers, rows, total: r.rowCount ?? 0 };
  });
}
