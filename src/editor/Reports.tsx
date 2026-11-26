import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { request, messageOf } from "./ManagementLogin";
import { publicPages } from "../../shared/traffic.js";
const views = [
  "Overview",
  "Trend",
  "Pages",
  "Landing",
  "Exit pages",
  "Acquisition",
  "Campaigns",
  "Page sources",
  "Interactions",
  "Event interest",
  "Event RSVP",
  "Join WhatsApp",
  "Resource usage",
  "Devices",
  "Browsers",
  "Systems",
  "Screens",
  "Geography",
  "Returning",
  "Performance",
  "Slowest pages",
  "Clarity usability",
];
const iso = (d: Date) => d.toISOString().slice(0, 10);
function from(days: number) {
  return iso(new Date(Date.now() - (days - 1) * 86400000));
}
export default function Reports({ session }: { session: Session }) {
  const [view, setView] = useState("Overview"),
    [start, setStart] = useState(from(30)),
    [end, setEnd] = useState(from(1)),
    [page, setPage] = useState(""),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState({ index: 0, reverse: false });
  const [data, setData] = useState<{
      headers: string[];
      rows: string[][];
      total?: number;
    }>(),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [enabled, setEnabled] = useState<boolean>();
  const api = (payload: object) => request(session, payload, "/api/reports");
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await task();
    } catch (e) {
      setNotice(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  const rows = (data?.rows ?? [])
    .filter((r) => r.join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort(
      (a, b) =>
        a[sort.index].localeCompare(b[sort.index], undefined, {
          numeric: true,
        }) * (sort.reverse ? -1 : 1),
    );
  function csv() {
    if (!data) return;
    const quote = (s: string) =>
      '"' + (/^[=+@\-\t\r]/.test(s) ? "'" : "") + s.replace(/"/g, '""') + '"';
    const url = URL.createObjectURL(
      new Blob(
        [[data.headers, ...rows].map((r) => r.map(quote).join(",")).join("\n")],
        { type: "text/csv" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "msa-" + view + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section id="Analytics">
      <h2>Analytics and performance</h2>
      <p>
        Google Analytics reports use consented traffic. Chrome UX Report
        measures real-user performance at the 75th percentile.
      </p>
      <fieldset disabled={busy} onChange={() => setData(undefined)}>
        <label>
          Report
          <select value={view} onChange={(e) => setView(e.target.value)}>
            {views.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        {view === "Slowest pages" ? (
          <p>Latest available mobile p75, ranked by LCP</p>
        ) : view === "Clarity usability" ? (
          <p>Previous 72 hours · Microsoft Clarity</p>
        ) : view === "Performance" ? (
          <label>
            Location
            <select value={page} onChange={(e) => setPage(e.target.value)}>
              <option value="">Whole site</option>
              {publicPages.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label>
              Date range
              <select
                defaultValue="30"
                onChange={(e) => {
                  const n = e.target.value;
                  if (n === "custom") return;
                  setStart(
                    n === "all"
                      ? "2015-08-14"
                      : n === "year"
                        ? from(1).slice(0, 4) + "-01-01"
                        : from(Number(n)),
                  );
                  setEnd(from(1));
                }}
              >
                {[
                  ["1", "Today"],
                  ["7", "Last 7 days"],
                  ["30", "Last 30 days"],
                  ["90", "Last 90 days"],
                  ["year", "Year to date"],
                  ["all", "All history"],
                  ["custom", "Custom dates"],
                ].map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              From
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Through
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </>
        )}
        <button
          onClick={() =>
            run(async () => {
              setData(undefined);
              setSort({ index: 0, reverse: false });
              const result = await api({ view, start, end, page });
              if (view === "Event interest") {
                try {
                  const { fetchEventsFromCalendar } = await import(
                    "@/services/eventsApi"
                  );
                  const calendar = await fetchEventsFromCalendar();
                  const names = new Map(
                    await Promise.all(
                      calendar.map(async (event) => {
                        const digest = await crypto.subtle.digest(
                          "SHA-256",
                          new TextEncoder().encode(event.id),
                        );
                        return [
                          Array.from(new Uint8Array(digest).slice(0, 8), (n) =>
                            n.toString(16).padStart(2, "0"),
                          ).join(""),
                          event.title,
                        ] as const;
                      }),
                    ),
                  );
                  result.rows = result.rows.map(([key, ...rest]: string[]) => [
                    names.get(key) ?? key,
                    ...rest,
                  ]);
                  result.headers[0] = "Event";
                } catch {
                  /* Archived events retain their stable reporting ID. */
                }
              }
              setData(result);
            })
          }
        >
          Load report
        </button>
      </fieldset>
      {data && ["Trend", "Performance"].includes(view) && (
        <figure>
          <figcaption>
            {view === "Trend"
              ? "Daily users · selected period"
              : "Mobile LCP · recent reporting periods"}
          </figcaption>
          {(() => {
            const series = data.rows
              .filter((r) =>
                view === "Trend" ? !r.includes("Previous") : r[0] === "PHONE",
              )
              .map((r) => ({
                label: r[view === "Trend" ? 0 : 1],
                value: Number(
                  r[view === "Trend" ? data.headers.indexOf("totalUsers") : 2],
                ),
              }))
              .filter((r) => Number.isFinite(r.value))
              .sort((a, b) => a.label.localeCompare(b.label))
              .slice(-90);
            const max = Math.max(1, ...series.map((v) => v.value));
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  height: 90,
                  gap: 1,
                }}
              >
                {series.map((point) => (
                  <button
                    key={point.label}
                    title={point.label + " · " + point.value}
                    aria-label={point.label + " · " + point.value}
                    style={{
                      flex: 1,
                      padding: 0,
                      background: "#225c46",
                      minHeight: 2,
                      height: (100 * point.value) / max + "%",
                    }}
                    onClick={() => setNotice(point.label + " · " + point.value)}
                  />
                ))}
              </div>
            );
          })()}
        </figure>
      )}
      {data && (
        <>
          <label>
            Filter results
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <button onClick={csv}>Download CSV</button>
          <div style={{ overflowX: "auto", maxHeight: "28rem" }}>
            <table>
              <thead>
                <tr>
                  {data.headers.map((h, i) => (
                    <th key={h}>
                      <button
                        onClick={() =>
                          setSort({
                            index: i,
                            reverse: sort.index === i && !sort.reverse,
                          })
                        }
                      >
                        {h}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td key={j}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {rows.length} displayed
            {data.total !== undefined ? " · " + data.total + " reported" : ""}
          </p>
        </>
      )}
      <p>
        <a href="https://analytics.google.com/">Google Analytics</a> ·{" "}
        <a href="https://vercel.com/yunusalkamels-projects/msa-at-pitt-website/analytics">
          Vercel Analytics
        </a>{" "}
        ·{" "}
        <a href="https://vercel.com/yunusalkamels-projects/msa-at-pitt-website/speed-insights">
          Speed Insights
        </a>{" "}
        ·{" "}
        <a href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fmsaatpitt.vercel.app">
          PageSpeed Insights
        </a>{" "}
        ·{" "}
        <a
          href={
            /^[a-z0-9]+$/i.test(import.meta.env.VITE_CLARITY_PROJECT_ID || "")
              ? "https://clarity.microsoft.com/projects/view/" +
                import.meta.env.VITE_CLARITY_PROJECT_ID +
                "/heatmaps"
              : "https://clarity.microsoft.com/projects"
          }
        >
          Clarity heatmaps
        </a>
      </p>
      <button
        disabled={busy}
        onClick={() =>
          run(async () => {
            setEnabled(
              (
                await api(
                  enabled === undefined
                    ? { action: "settings" }
                    : { action: "settings", enabled: !enabled },
                )
              ).enabled,
            );
          })
        }
      >
        {enabled === undefined
          ? "Check optional analytics setting"
          : enabled
            ? "Pause GA4 collection"
            : "Enable GA4 collection"}
      </button>
      <p role="status">{busy ? "Loading…" : notice}</p>
    </section>
  );
}
